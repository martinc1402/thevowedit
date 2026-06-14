"use server";

import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { APPLY_CATEGORIES, APPLY_SCOPE } from "@/lib/apply-options";
import {
  isValidAreaSelection,
  areaSelectionLabel,
  allAreasValue,
} from "@/lib/locations";
import {
  sendApplicationEmail,
  sendApplicantConfirmationEmail,
} from "@/lib/email";

export type ApplicationInput = {
  business: string;
  category: string;
  areas: string[]; // LGU slugs and/or the island-wide sentinel ("all-<scope>")
  contact: string;
  email: string;
  mobile: string;
  link: string; // optional website / instagram
  priceRange: string; // optional
  consent: boolean;
  company: string; // honeypot - real users leave this empty
};

export type ApplicationResult =
  | { ok: true; reference: string; emailed: boolean }
  | { ok: false; error: string };

// Human-facing reference / tracking code, derived from the row's UUID id so it
// maps 1:1 to the stored application (support can look it up by id prefix). No
// extra DB column needed. e.g. "TVE-3F9A2C1B".
function formatReference(id: string): string {
  return "TVE-" + id.replace(/-/g, "").slice(0, 8).toUpperCase();
}

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
    return { ok: true, reference: "", emailed: false };
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
  // Areas: an array of LGU slugs and/or the island-wide sentinel. Coerce
  // defensively (server actions accept arbitrary payloads), cap each value,
  // drop blanks, dedupe, and bound the count as an abuse cap.
  const areas = Array.from(
    new Set(
      (Array.isArray(input.areas) ? input.areas : [])
        .map((a) => cap(a, 100))
        .filter(Boolean),
    ),
  ).slice(0, 40);
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

  // Category must be from our canonical list (reject tampered values).
  if (!(APPLY_CATEGORIES as readonly string[]).includes(category)) {
    return { ok: false, error: "Please pick a category from the list." };
  }

  // At least one area, and every selected value must be a valid LGU or the
  // island-wide sentinel within the active scope (reject tampered values).
  if (areas.length === 0) {
    return {
      ok: false,
      error: "Please select at least one area you serve, or All of Cebu.",
    };
  }
  if (!areas.every((a) => isValidAreaSelection(APPLY_SCOPE, a))) {
    return { ok: false, error: "Please pick areas from the list." };
  }

  // Island-wide stands alone: if the sentinel is present, store just that.
  // Otherwise store clean, human-readable labels for each picked LGU, so the
  // dashboard stays readable and expansion later just adds scopes in locations.ts.
  const areaLabels = areas.includes(allAreasValue(APPLY_SCOPE))
    ? [areaSelectionLabel(APPLY_SCOPE, allAreasValue(APPLY_SCOPE))]
    : areas.map((a) => areaSelectionLabel(APPLY_SCOPE, a));
  const areaSummary = areaLabels.join(", ");

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

  // Return the new row id so we can derive the applicant's reference code.
  const { data: inserted, error: insertError } = await admin
    .from("supplier_applications")
    .insert({
      business_name: business,
      category,
      area_served: areaSummary, // comma-joined summary for the legacy not-null column
      areas_served: areaLabels, // structured list (text[])
      province: APPLY_SCOPE.slug,
      contact_name: contact,
      email,
      mobile,
      link,
      price_range: priceRange,
      consent_given: true,
      consent_at: consentAt,
      // status defaults to 'pending' in the DB
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    // Log a short, non-PII message only - never the applicant record or raw
    // Supabase error detail surfaced to the client.
    console.error("[application] insert failed:", insertError?.message);
    return { ok: false, error: GENERIC_ERROR };
  }

  const reference = formatReference(inserted.id as string);
  const receivedAt = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Best-effort notification to the team. Never fails the request - the
  // application is already saved, so it is never silently lost even if email is
  // unconfigured.
  try {
    const result = await sendApplicationEmail({
      businessName: business,
      category,
      areasServed: areaSummary,
      contactName: contact,
      email,
      mobile,
      link,
      priceRange,
      reference,
      receivedAt,
    });
    if (!result.sent) {
      console.warn("[application] team email not sent:", result.reason);
    }
  } catch (e) {
    console.error("[application] team email error:", e);
  }

  // Best-effort confirmation to the applicant (with their reference code). Also
  // never fails the request: requires RESEND_API_KEY + a verified sending domain
  // to actually deliver; otherwise it is logged and the request still succeeds.
  let emailed = false;
  try {
    const result = await sendApplicantConfirmationEmail({
      to: email,
      businessName: business,
      contactName: contact,
      reference,
      receivedAt,
    });
    emailed = result.sent;
    if (!result.sent) {
      console.warn("[application] confirmation email not sent:", result.reason);
    }
  } catch (e) {
    console.error("[application] confirmation email error:", e);
  }

  return { ok: true, reference, emailed };
}
