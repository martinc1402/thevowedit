"use server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSupplierBySlug } from "@/lib/directory";
import { sendInquiryEmail } from "@/lib/email";

export type InquiryInput = {
  supplierSlug: string;
  name: string;
  email: string;
  weddingDate: string; // "" or YYYY-MM-DD
  message: string;
  company: string; // honeypot - real users leave this empty
};

export type InquiryResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_ERROR =
  "We could not send your inquiry just now. Please try again.";

// Server action: validate, save the inquiry to Supabase (service-role, RLS
// bypassed), then send a best-effort notification email. The DB save is the
// source of truth - if email fails, the inquiry is still captured.
export async function submitInquiry(
  input: InquiryInput,
): Promise<InquiryResult> {
  const name = input.name?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const message = input.message?.trim() ?? "";
  const weddingDate = input.weddingDate?.trim() || null;
  const slug = input.supplierSlug?.trim() ?? "";

  // Honeypot: bots fill hidden fields. Pretend success without saving so we
  // don't tip them off, and don't store spam.
  if (input.company && input.company.trim() !== "") {
    return { ok: true };
  }

  // Server-side validation (never trust the client).
  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return {
      ok: false,
      error: "Please add your name, a valid email, and a message.",
    };
  }
  if (weddingDate && Number.isNaN(Date.parse(weddingDate))) {
    return { ok: false, error: "That wedding date does not look valid." };
  }

  // Authoritative supplier id + name from the DB (don't trust client-sent ids).
  const supplier = await getSupplierBySlug(slug);
  if (!supplier) {
    return { ok: false, error: GENERIC_ERROR };
  }

  // Save to Supabase. This must succeed for the inquiry to count as sent.
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    console.error("[inquiry] admin client not configured:", e);
    return { ok: false, error: GENERIC_ERROR };
  }

  const { error: insertError } = await admin.from("inquiries").insert({
    supplier_id: supplier.id,
    supplier_slug: supplier.slug,
    couple_name: name,
    couple_email: email,
    wedding_date: weddingDate,
    message,
  });

  if (insertError) {
    console.error("[inquiry] insert failed:", insertError);
    return { ok: false, error: GENERIC_ERROR };
  }

  // Best-effort email notification. Never fails the request - the inquiry is
  // already saved, so it is never silently lost even if email is unconfigured.
  try {
    const result = await sendInquiryEmail({
      supplierName: supplier.name,
      coupleName: name,
      coupleEmail: email,
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
