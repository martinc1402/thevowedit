"use server";

import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/auth";
import {
  generateClaimCode,
  hashClaimCode,
  verifyClaimCode,
} from "@/lib/claim-code";

// =====================================================================
// Vendor claim-code flow. Public: submit a code, then set up an account.
// Admin: generate/regenerate a code, unclaim a profile. All DB access is
// service-role; identity for admin actions is the user_roles table (isAdmin()).
// Errors to the public are deliberately GENERIC — we never reveal whether a
// code exists, is expired, or is close.
// =====================================================================

const GENERIC = "That code didn't match.";
const COOLDOWN =
  "Too many attempts. Please wait an hour before trying again.";
const CODE_TTL_DAYS = 30;
const TICKET_TTL_MS = 30 * 60 * 1000; // 30 minutes
const TICKET_COOKIE = "claim_ticket";
const MAX_FAILED_PER_HOUR = 5;

export type ClaimResult = { ok: true } | { ok: false; error: string };
export type GenerateResult =
  | { ok: true; code: string }
  | { ok: false; error: string };

// ---- signed ticket (proves a valid code was entered in step 1) ------------
function ticketSecret(): string {
  const s = process.env.CLAIM_TICKET_SECRET;
  if (!s) throw new Error("Missing CLAIM_TICKET_SECRET env.");
  return s;
}
function signTicket(supplierId: string): string {
  const payload = `${supplierId}.${Date.now() + TICKET_TTL_MS}`;
  const sig = createHmac("sha256", ticketSecret())
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}
function verifyTicket(token: string | undefined): string | null {
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const payload = Buffer.from(b64, "base64url").toString();
  const expected = createHmac("sha256", ticketSecret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [supplierId, expStr] = payload.split(".");
  if (!supplierId || Date.now() > Number(expStr)) return null;
  return supplierId;
}

// Best-effort client IP (same source as the application/inquiry limiters).
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

// ---- public: submit a claim code -----------------------------------------
export async function submitClaimCode(
  slug: string,
  code: string,
): Promise<ClaimResult> {
  const admin = getSupabaseAdmin();

  const { data: supplier } = await admin
    .from("suppliers")
    .select("id")
    .eq("slug", typeof slug === "string" ? slug : "")
    .maybeSingle();
  if (!supplier?.id) return { ok: false, error: GENERIC };
  const supplierId = String(supplier.id);

  // Durable per-profile rate limit: max 5 FAILED attempts in the last hour.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("claim_attempts")
    .select("*", { count: "exact", head: true })
    .eq("supplier_id", supplierId)
    .eq("succeeded", false)
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) >= MAX_FAILED_PER_HOUR) {
    return { ok: false, error: COOLDOWN };
  }

  const { data: owner } = await admin
    .from("supplier_owners")
    .select("user_id, claim_code_hash, claim_code_expires_at")
    .eq("supplier_id", supplierId)
    .maybeSingle();

  const notExpired =
    !!owner?.claim_code_expires_at &&
    new Date(owner.claim_code_expires_at).getTime() > Date.now();
  const matched =
    !!owner &&
    owner.user_id == null && // still unclaimed
    notExpired &&
    verifyClaimCode(code, owner.claim_code_hash ?? null);

  // Log every attempt (audit + rate-limit source).
  await admin.from("claim_attempts").insert({
    supplier_id: supplierId,
    ip: await clientIp(),
    succeeded: matched,
  });

  if (!matched) return { ok: false, error: GENERIC };

  // Issue a short-lived signed ticket so the account-setup step can trust that
  // a valid code was entered, without re-sending the code.
  const jar = await cookies();
  jar.set(TICKET_COOKIE, signTicket(supplierId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TICKET_TTL_MS / 1000,
  });
  return { ok: true };
}

// ---- public: bind the just-created auth user to the profile ---------------
// Called right after the browser signUp succeeds. The ticket (not the userId) is
// the authorization: holding a valid ticket means the caller entered a valid code.
export async function completeClaim(
  userId: string,
  email: string,
): Promise<ClaimResult> {
  const jar = await cookies();
  const supplierId = verifyTicket(jar.get(TICKET_COOKIE)?.value);
  if (!supplierId) return { ok: false, error: "Your claim session expired. Start again." };

  const admin = getSupabaseAdmin();

  // The user must exist and its email must match (defense against a forged id).
  const { data: got } = await admin.auth.admin.getUserById(userId);
  const authEmail = got?.user?.email?.toLowerCase();
  if (!authEmail || authEmail !== email.trim().toLowerCase()) {
    return { ok: false, error: "We couldn't finish setting up your account." };
  }

  // Re-check the profile is still unclaimed, then bind + invalidate the code.
  const { data: owner } = await admin
    .from("supplier_owners")
    .select("user_id")
    .eq("supplier_id", supplierId)
    .maybeSingle();
  if (!owner || owner.user_id != null) {
    return { ok: false, error: "This profile has already been claimed." };
  }

  const { error } = await admin
    .from("supplier_owners")
    .update({
      user_id: userId,
      claim_email: email.trim(),
      claimed_at: new Date().toISOString(),
      claim_code_hash: null,
      claim_code_expires_at: null,
    })
    .eq("supplier_id", supplierId)
    .is("user_id", null); // guard against a race double-claim
  if (error) return { ok: false, error: "We couldn't finish setting up your account." };

  jar.delete(TICKET_COOKIE);
  return { ok: true };
}

// ---- admin: generate / regenerate a claim code ----------------------------
export async function adminGenerateClaimCode(
  supplierId: string,
): Promise<GenerateResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };
  const admin = getSupabaseAdmin();

  const { data: supplier } = await admin
    .from("suppliers")
    .select("id, email")
    .eq("id", supplierId)
    .maybeSingle();
  if (!supplier?.id) return { ok: false, error: "Supplier not found." };

  const { display, canonical } = generateClaimCode();
  const expiresAt = new Date(
    Date.now() + CODE_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Upsert the ownership row (create if the supplier has none yet). claim_email
  // is required by the schema; it's replaced with the real address at claim time.
  const { error } = await admin.from("supplier_owners").upsert(
    {
      supplier_id: supplierId,
      claim_email: (supplier.email as string) ?? "",
      claim_code_hash: hashClaimCode(canonical),
      claim_code_expires_at: expiresAt,
    },
    { onConflict: "supplier_id" },
  );
  if (error) return { ok: false, error: "Could not generate a code." };

  return { ok: true, code: display };
}

// ---- admin: unclaim / reset vendor access ---------------------------------
export async function adminUnclaim(supplierId: string): Promise<ClaimResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("supplier_owners")
    .update({
      user_id: null,
      claimed_at: null,
      claim_code_hash: null,
      claim_code_expires_at: null,
    })
    .eq("supplier_id", supplierId);
  if (error) return { ok: false, error: "Could not reset access." };
  return { ok: true };
}
