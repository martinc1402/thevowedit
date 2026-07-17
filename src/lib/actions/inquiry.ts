"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendInquiryEmail } from "@/lib/email";

// A couple's inquiry to a supplier. Routes THROUGH The Vow Edit: saved to the
// RLS-locked `inquiries` table via the service-role key, then a best-effort email
// notifies the team (we forward to the supplier for now). Mirrors the proven
// submitApplication flow (honeypot -> rate-limit -> validate -> insert -> email).

export type InquiryInput = {
  supplierId: string;
  supplierSlug: string;
  supplierName: string;
  coupleName: string;
  coupleEmail: string;
  weddingDate: string; // optional; "" or "YYYY-MM-DD"
  message: string;
  company: string; // honeypot - real people leave this empty
};

export type InquiryResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const GENERIC_ERROR =
  "We could not send your message just now. Please try again.";

const cap = (v: unknown, n: number) =>
  (typeof v === "string" ? v : "").trim().slice(0, n);

// In-memory per-IP rate limit — a pre-launch speed bump (per server instance,
// resets on cold start), same shape as the application action.
const RL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RL_MAX = 8; // inquiries are lighter than applications
const RL_SWEEP_AT = 5000;
const rlHits = new Map<string, number[]>();

function rateLimitOk(ip: string, now: number): boolean {
  const cutoff = now - RL_WINDOW_MS;
  const recent = (rlHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RL_MAX) {
    rlHits.set(ip, recent);
    return false;
  }
  recent.push(now);
  rlHits.set(ip, recent);
  if (rlHits.size > RL_SWEEP_AT) {
    for (const [k, v] of rlHits) {
      const keep = v.filter((t) => t > cutoff);
      if (keep.length === 0) rlHits.delete(k);
      else rlHits.set(k, keep);
    }
  }
  return true;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function submitInquiry(
  input: InquiryInput,
): Promise<InquiryResult> {
  // Honeypot: pretend success without saving so bots aren't tipped off.
  if (typeof input.company === "string" && input.company.trim() !== "") {
    return { ok: true };
  }

  const ip = await clientIp();
  if (!rateLimitOk(ip, Date.now())) {
    return {
      ok: false,
      error:
        "Too many messages from this connection. Please wait a few minutes and try again.",
    };
  }

  const supplierId = cap(input.supplierId, 64);
  const supplierSlug = cap(input.supplierSlug, 200);
  const supplierName = cap(input.supplierName, 200);
  const coupleName = cap(input.coupleName, 200);
  const coupleEmail = cap(input.coupleEmail, 320);
  const message = cap(input.message, 2000);
  const weddingRaw = cap(input.weddingDate, 20);
  const weddingDate = DATE_RE.test(weddingRaw) ? weddingRaw : null;

  if (!coupleName || !coupleEmail || !EMAIL_RE.test(coupleEmail) || !message) {
    return {
      ok: false,
      error: "Please add your name, a valid email, and a message.",
    };
  }
  if (!supplierId || !supplierSlug) {
    return { ok: false, error: GENERIC_ERROR };
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    console.error("[inquiry] admin client not configured:", e);
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error: insertError } = await admin.from("inquiries").insert({
    supplier_id: supplierId,
    supplier_slug: supplierSlug,
    couple_name: coupleName,
    couple_email: coupleEmail,
    wedding_date: weddingDate,
    message,
    // status defaults to 'new' in the DB
  });

  if (insertError) {
    console.error("[inquiry] insert failed:", insertError.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // Best-effort notification. Never fails the request - the inquiry is already
  // saved, so it is never silently lost even if email is unconfigured.
  try {
    const result = await sendInquiryEmail({
      supplierName,
      coupleName,
      coupleEmail,
      weddingDate,
      message,
      receivedAt: new Date().toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        dateStyle: "medium",
        timeStyle: "short",
      }),
    });
    if (!result.sent) {
      console.warn("[inquiry] email not sent:", result.reason);
    }
  } catch (e) {
    console.error("[inquiry] email error:", e);
  }

  return { ok: true };
}
