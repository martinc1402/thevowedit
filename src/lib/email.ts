import "server-only";

import { randomUUID } from "node:crypto";
import { Resend } from "resend";

// Internal inquiry notification to The Vow Edit inbox. BEST-EFFORT: if no
// RESEND_API_KEY is configured (or the send fails), we return { sent: false }
// and the caller logs it but does NOT fail the request - the inquiry is already
// saved to Supabase, so it is never silently lost. We forward to suppliers
// manually, so this email contains everything needed to do that.

export type InquiryEmailFields = {
  supplierName: string;
  coupleName: string;
  coupleEmail: string;
  weddingDate: string | null; // ISO date string or null
  message: string;
  receivedAt: string; // human-readable timestamp
};

function esc(s: string): string {
  return s.replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string,
  );
}

export async function sendInquiryEmail(
  f: InquiryEmailFields,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not set" };

  // Defaults are the values the brief asked for; both are env-overridable.
  const to = process.env.INQUIRY_NOTIFY_EMAIL || "hitchd.ph@gmail.com";
  const from = process.env.INQUIRY_FROM_EMAIL || "The Vow Edit <onboarding@resend.dev>";

  const date = f.weddingDate || "Not specified";
  const rows: [string, string][] = [
    ["Supplier", f.supplierName],
    ["Couple", f.coupleName],
    ["Email", f.coupleEmail],
    ["Wedding date", date],
    ["Received", f.receivedAt],
  ];

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#581824;max-width:560px">
      <h2 style="margin:0 0 16px">New inquiry for ${esc(f.supplierName)}</h2>
      <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="padding:6px 12px 6px 0;color:#8a5560;white-space:nowrap;vertical-align:top">${esc(k)}</td>
                 <td style="padding:6px 0;vertical-align:top">${esc(v)}</td>
               </tr>`,
          )
          .join("")}
      </table>
      <div style="padding:14px 16px;background:#faf6f0;border-radius:12px">
        <div style="color:#8a5560;font-size:13px;margin-bottom:6px">Message</div>
        <div style="white-space:pre-wrap">${esc(f.message)}</div>
      </div>
      <p style="color:#8a5560;font-size:13px;margin-top:16px">
        Reply to this email to reach ${esc(f.coupleName)} directly, then forward to the supplier.
      </p>
    </div>`;

  const text = [
    `New inquiry for ${f.supplierName}`,
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    f.message,
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: f.coupleEmail, // so a reply goes to the couple
    subject: `New inquiry for ${f.supplierName} from ${f.coupleName}`,
    html,
    text,
    headers: { "X-Entity-Ref-ID": randomUUID() }, // keep each inquiry as its own Gmail thread
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}

// Internal notification when a wedding supplier applies for a founding listing.
// BEST-EFFORT, same contract as sendInquiryEmail: if no RESEND_API_KEY is set
// (or the send fails) we return { sent: false } and the caller logs it but does
// NOT fail the request - the application is already saved to Supabase, so it is
// never silently lost. Contains everything needed to follow up with the supplier.

export type ApplicationEmailFields = {
  businessName: string;
  category: string;
  areasServed: string; // comma-joined area labels, or "All of Cebu"
  contactName: string;
  email: string;
  mobile: string;
  link: string | null; // website / instagram, optional
  priceRange: string | null; // optional
  reference: string; // applicant-facing tracking code, e.g. "TVE-3F9A2C1B"
  receivedAt: string; // human-readable timestamp
};

export async function sendApplicationEmail(
  f: ApplicationEmailFields,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not set" };

  // Notify inbox: a dedicated override if set, else the shared inquiry inbox,
  // else the default. From reuses the same verified sender as inquiries.
  const to =
    process.env.APPLICATION_NOTIFY_EMAIL ||
    process.env.INQUIRY_NOTIFY_EMAIL ||
    "hitchd.ph@gmail.com";
  const from = process.env.INQUIRY_FROM_EMAIL || "The Vow Edit <onboarding@resend.dev>";

  const rows: [string, string][] = [
    ["Reference", f.reference],
    ["Business", f.businessName],
    ["Category", f.category],
    ["Areas served", f.areasServed],
    ["Contact", f.contactName],
    ["Email", f.email],
    ["Mobile", f.mobile],
    ["Website / IG", f.link || "Not provided"],
    ["Price range", f.priceRange || "Not provided"],
    ["Received", f.receivedAt],
  ];

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#581824;max-width:560px">
      <h2 style="margin:0 0 16px">New founding-supplier application: ${esc(f.businessName)}</h2>
      <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="padding:6px 12px 6px 0;color:#8a5560;white-space:nowrap;vertical-align:top">${esc(k)}</td>
                 <td style="padding:6px 0;vertical-align:top">${esc(v)}</td>
               </tr>`,
          )
          .join("")}
      </table>
      <p style="color:#8a5560;font-size:13px;margin-top:16px">
        Reply to this email to reach ${esc(f.contactName)} at ${esc(f.businessName)} directly.
      </p>
    </div>`;

  const text = [
    `New founding-supplier application: ${f.businessName}`,
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: f.email, // so a reply goes straight to the applicant
    subject: `New founding-supplier application: ${f.businessName}`,
    html,
    text,
    headers: { "X-Entity-Ref-ID": randomUUID() }, // keep each application as its own Gmail thread
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}

// Confirmation email TO the applicant, with their reference / tracking code.
// BEST-EFFORT, same contract: no RESEND_API_KEY (or send failure) -> { sent:false }
// and the caller logs it but does NOT fail the request. IMPORTANT: delivering to
// arbitrary applicant addresses requires a VERIFIED sending domain in Resend; the
// default test sender (onboarding@resend.dev) only delivers to the Resend account
// owner. Set INQUIRY_FROM_EMAIL to a verified-domain address in production.

export type ApplicantConfirmationFields = {
  to: string; // applicant email
  businessName: string;
  contactName: string;
  reference: string; // tracking code, e.g. "TVE-3F9A2C1B"
  receivedAt: string; // human-readable timestamp
};

export async function sendApplicantConfirmationEmail(
  f: ApplicantConfirmationFields,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not set" };

  const from = process.env.INQUIRY_FROM_EMAIL || "The Vow Edit <onboarding@resend.dev>";
  // Replies from the applicant go to the team inbox.
  const replyTo =
    process.env.APPLICATION_NOTIFY_EMAIL ||
    process.env.INQUIRY_NOTIFY_EMAIL ||
    "hitchd.ph@gmail.com";

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#581824;max-width:560px">
      <h2 style="margin:0 0 12px">Thanks, ${esc(f.contactName)} — we've got your application</h2>
      <p style="margin:0 0 16px;line-height:1.6">
        We've received <strong>${esc(f.businessName)}</strong>'s application for a
        free founding listing on The Vow Edit. We'll review it and reach out before
        launch. No payment, no commitment.
      </p>
      <div style="padding:16px 18px;background:#581824;border-radius:12px;text-align:center;margin:0 0 16px">
        <div style="color:#d8c2c2;font-size:12px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px">Your reference</div>
        <div style="color:#faf6f0;font-size:22px;font-weight:700;letter-spacing:.04em">${esc(f.reference)}</div>
      </div>
      <p style="color:#8a5560;font-size:13px;margin:0 0 4px">
        Keep this reference for your records — quote it if you reply to us about your application.
      </p>
      <p style="color:#8a5560;font-size:13px;margin:0">Received ${esc(f.receivedAt)}.</p>
    </div>`;

  const text = [
    `Thanks, ${f.contactName} — we've got your application.`,
    "",
    `We've received ${f.businessName}'s application for a free founding listing on The Vow Edit. We'll review it and reach out before launch. No payment, no commitment.`,
    "",
    `Your reference: ${f.reference}`,
    "Keep this reference for your records — quote it if you reply to us.",
    "",
    `Received ${f.receivedAt}.`,
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: f.to,
    replyTo,
    subject: `Your Vow Edit application — ${f.reference}`,
    html,
    text,
    headers: { "X-Entity-Ref-ID": f.reference },
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true };
}
