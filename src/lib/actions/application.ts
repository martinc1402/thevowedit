"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { APPLY_CATEGORIES, APPLY_SCOPE } from "@/lib/apply-options";
import { isValidLgu, lguLabel } from "@/lib/locations";
import { sendApplicationEmail } from "@/lib/email";

export type ApplicationInput = {
  business: string;
  category: string;
  area: string;
  contact: string;
  email: string;
  mobile: string;
  link: string; // optional website / instagram
  priceRange: string; // optional
  consent: boolean;
  company: string; // honeypot - real users leave this empty
};

export type ApplicationResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9+()\-\s]{7,20}$/;
const GENERIC_ERROR =
  "We could not submit your application just now. Please try again.";

// Coerce to a trimmed, length-capped string. Non-strings (number/object/array/
// null) become "" instead of throwing - server actions accept arbitrary payloads,
// not just our form. This both bounds what we write to Postgres/email and guards
// every field read against wrong types.
const cap = (v: unknown, n: number) =>
  (typeof v === "string" ? v : "").trim().slice(0, n);

// Basic in-memory rate limit per client IP. This is a pre-launch speed bump on
// top of the honeypot + validation, NOT a hard guarantee: the counter lives in
// this server instance's memory, so on serverless it is per-instance and resets
// on cold start/deploy. It throttles bursts from a single source. Swap for a
// shared store (e.g. Upstash) if a strict, distributed cap is ever needed.
const RL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RL_MAX = 5; // allowed attempts per IP per window
const RL_SWEEP_AT = 5000; // prune stale buckets once the map grows past this
const rlHits = new Map<string, number[]>();

function rateLimitOk(ip: string, now: number): boolean {
  const cutoff = now - RL_WINDOW_MS;
  const recent = (rlHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (recent.length >= RL_MAX) {
    rlHits.set(ip, recent); // keep the pruned list; do not add another hit
    return false;
  }
  recent.push(now);
  rlHits.set(ip, recent);
  // Opportunistic sweep so a long tail of distinct IPs can't grow unbounded.
  if (rlHits.size > RL_SWEEP_AT) {
    for (const [k, v] of rlHits) {
      const keep = v.filter((t) => t > cutoff);
      if (keep.length === 0) rlHits.delete(k);
      else rlHits.set(k, keep);
    }
  }
  return true;
}

// Best-effort client IP from the proxy headers (Vercel sets x-forwarded-for).
// Falls back to a shared "unknown" bucket when no header is present.
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

// Server action: validate everything server-side (never trust the client),
// re-check consent, then save to Supabase with the service-role key (RLS
// bypassed). RLS on supplier_applications has no policies, so this server path
// is the only way a row is ever written. PII is never logged.
export async function submitApplication(
  input: ApplicationInput,
): Promise<ApplicationResult> {
  // Honeypot: bots fill hidden fields. Pretend success without saving so we
  // don't tip them off, and don't store spam. Type-guarded so a non-string
  // payload can't throw here.
  if (typeof input.company === "string" && input.company.trim() !== "") {
    return { ok: true };
  }

  // Throttle bursts from a single client before doing any work or writing.
  const ip = await clientIp();
  if (!rateLimitOk(ip, Date.now())) {
    return {
      ok: false,
      error:
        "Too many applications from this connection. Please wait a few minutes and try again.",
    };
  }

  // Every field read goes through cap(): trimmed, length-bounded, and safe
  // against non-string payloads.
  const business = cap(input.business, 200);
  const category = cap(input.category, 100);
  const area = cap(input.area, 100); // an LGU slug within the active scope
  const contact = cap(input.contact, 200);
  const email = cap(input.email, 320);
  const mobile = cap(input.mobile, 40);
  const link = cap(input.link, 500) || null;
  const priceRange = cap(input.priceRange, 100) || null;

  // Required fields + email format.
  if (!business || !contact || !email || !mobile || !EMAIL_RE.test(email)) {
    return {
      ok: false,
      error:
        "Please add your business name, contact name, a valid email, and mobile.",
    };
  }

  // Loose, PH/AU-friendly mobile format check (digits, +, (), -, spaces).
  if (!MOBILE_RE.test(mobile)) {
    return { ok: false, error: "Please enter a valid mobile number." };
  }

  // Category must be from our canonical list, and the location must be a valid
  // LGU slug within the active scope (reject tampered values).
  if (
    !(APPLY_CATEGORIES as readonly string[]).includes(category) ||
    !isValidLgu(APPLY_SCOPE, area)
  ) {
    return { ok: false, error: "Please pick a category and area from the list." };
  }

  // Store a clean, human-readable area label (resolved from the validated slug)
  // alongside the scope, so the dashboard stays readable and expansion later just
  // adds scopes in locations.ts.
  const areaLabel = lguLabel(APPLY_SCOPE, area);

  // Consent is the source of truth here, not the client checkbox.
  if (input.consent !== true) {
    return {
      ok: false,
      error: "Please agree to be listed and accept the privacy terms.",
    };
  }

  // Stamp consent server-side; never accept a client-supplied timestamp.
  const consentAt = new Date().toISOString();

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    console.error("[application] admin client not configured:", e);
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error: insertError } = await admin
    .from("supplier_applications")
    .insert({
      business_name: business,
      category,
      area_served: areaLabel,
      province: APPLY_SCOPE.slug,
      contact_name: contact,
      email,
      mobile,
      link,
      price_range: priceRange,
      consent_given: true,
      consent_at: consentAt,
      // status defaults to 'pending' in the DB
    });

  if (insertError) {
    // Log a short, non-PII message only - never the applicant record or raw
    // Supabase error detail surfaced to the client.
    console.error("[application] insert failed:", insertError.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  // Best-effort notification. Never fails the request - the application is
  // already saved, so it is never silently lost even if email is unconfigured.
  try {
    const result = await sendApplicationEmail({
      businessName: business,
      category,
      areaServed: areaLabel,
      contactName: contact,
      email,
      mobile,
      link,
      priceRange,
      receivedAt: new Date().toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        dateStyle: "medium",
        timeStyle: "short",
      }),
    });
    if (!result.sent) {
      console.warn("[application] email not sent:", result.reason);
    }
  } catch (e) {
    console.error("[application] email error:", e);
  }

  return { ok: true };
}
