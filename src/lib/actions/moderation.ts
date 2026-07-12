"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/auth";
import {
  SUPPLIER_COLUMNS,
  mapSupplierRow,
  type Supplier,
} from "@/lib/suppliers";
import type { EssentialsData } from "@/lib/essentials-taxonomy";

// =====================================================================
// Admin console + moderation actions. All admin-gated (isAdmin()). Reads use the
// service role; writes copy vendor drafts (pending_changes) into the live row.
// =====================================================================

export type ModResult = { ok: true } | { ok: false; error: string };

export type AdminVendor = {
  id: string;
  name: string;
  slug: string;
  published: boolean;
  claimed: boolean;
  claimEmail: string | null;
  codeActive: boolean;
  pendingKeys: string[];
};

// Every vendor with claim + moderation status, for the admin dashboard.
export async function listVendorsForAdmin(): Promise<AdminVendor[]> {
  if (!(await isAdmin())) return [];
  const admin = getSupabaseAdmin();
  const { data: sups } = await admin
    .from("suppliers")
    .select("id, name, slug, published, pending_changes")
    .order("name");
  const { data: owners } = await admin
    .from("supplier_owners")
    .select("supplier_id, user_id, claim_email, claim_code_hash, claim_code_expires_at");

  const ownerBy = new Map(
    (owners ?? []).map((o) => [String(o.supplier_id), o]),
  );

  return (sups ?? []).map((s) => {
    const o = ownerBy.get(String(s.id));
    const pc = s.pending_changes as Record<string, unknown> | null;
    const codeActive =
      !!o?.claim_code_hash &&
      !!o?.claim_code_expires_at &&
      new Date(o.claim_code_expires_at as string).getTime() > Date.now();
    return {
      id: String(s.id),
      name: String(s.name),
      slug: String(s.slug),
      published: Boolean(s.published),
      claimed: !!o?.user_id,
      claimEmail: o?.user_id ? ((o.claim_email as string) ?? null) : null,
      codeActive,
      pendingKeys: pc ? Object.keys(pc) : [],
    };
  });
}

// The supplier with pending applied is derived in the page via applyPending();
// this just fetches the full row (incl. pending_changes) for an admin preview.
export async function getSupplierForAdmin(
  slug: string,
): Promise<Supplier | null> {
  if (!(await isAdmin())) return null;
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("suppliers")
    .select(`${SUPPLIER_COLUMNS}, pending_changes`)
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return mapSupplierRow(data as unknown as Record<string, unknown>);
}

// Approve: copy every pending field to its live column (essentials_custom merges
// into the live essentials), then clear the buffer.
export async function approvePendingChanges(
  supplierId: string,
): Promise<ModResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };
  const admin = getSupabaseAdmin();

  const { data: row } = await admin
    .from("suppliers")
    .select("slug, essentials, pending_changes")
    .eq("id", supplierId)
    .maybeSingle();
  const pc = (row?.pending_changes ?? null) as Record<string, unknown> | null;
  if (!pc || Object.keys(pc).length === 0) return { ok: true };

  const update: Record<string, unknown> = { pending_changes: null };
  for (const [k, v] of Object.entries(pc)) {
    if (k === "essentials_custom") {
      const cur = (row?.essentials ?? {}) as EssentialsData;
      const next = { ...cur, customEssentials: v as EssentialsData["customEssentials"] };
      // An empty draft means the vendor removed their custom facts — drop the key
      // rather than persisting an empty array.
      if (!Array.isArray(v) || v.length === 0) delete next.customEssentials;
      update.essentials = next;
    } else {
      update[k] = v; // pending keys are DB columns already
    }
  }

  const { error } = await admin
    .from("suppliers")
    .update(update)
    .eq("id", supplierId);
  if (error) return { ok: false, error: "Could not approve the changes." };

  const slug = row?.slug as string | undefined;
  if (slug) revalidatePath(`/vendors/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  await notifyVendor(supplierId, "approved", "");
  return { ok: true };
}

// Reject: discard the buffer, notify the vendor with an optional note.
export async function rejectPendingChanges(
  supplierId: string,
  note: string,
): Promise<ModResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("suppliers")
    .update({ pending_changes: null })
    .eq("id", supplierId);
  if (error) return { ok: false, error: "Could not reject the changes." };
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  await notifyVendor(supplierId, "rejected", typeof note === "string" ? note : "");
  return { ok: true };
}

// ---- best-effort vendor notification (never throws / blocks) ---------------
const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;",
  );

async function notifyVendor(
  supplierId: string,
  kind: "approved" | "rejected",
  note: string,
): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return;
    const admin = getSupabaseAdmin();
    const { data: owner } = await admin
      .from("supplier_owners")
      .select("claim_email, user_id")
      .eq("supplier_id", supplierId)
      .maybeSingle();
    const to = owner?.user_id ? (owner.claim_email as string) : null;
    if (!to) return;
    const { data: s } = await admin
      .from("suppliers")
      .select("name")
      .eq("id", supplierId)
      .maybeSingle();
    const name = (s?.name as string) ?? "your profile";
    const from =
      process.env.INQUIRY_FROM_EMAIL ?? "The Vow Edit <onboarding@resend.dev>";
    const subject =
      kind === "approved"
        ? `Your changes to ${name} are live`
        : `Update on your changes to ${name}`;
    const body =
      kind === "approved"
        ? `Good news — the changes you submitted for ${name} have been approved and are now live on The Vow Edit.`
        : `The changes you submitted for ${name} weren't approved this time.${
            note ? ` Note from the team: ${note}` : ""
          } You can edit and resubmit any time.`;
    await new Resend(apiKey).emails.send({
      from,
      to,
      subject,
      text: body,
      html: `<p>${esc(body)}</p>`,
    });
  } catch {
    // best-effort — moderation succeeds regardless of email delivery
  }
}
