import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Ownership status read via the service role (the supplier_owners table is
// RLS-locked). "Claimed" = an auth user is linked. Used by the public profile
// page (to show a quiet claim link) and the claim page.

export async function isSupplierClaimed(supplierId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("supplier_owners")
    .select("user_id")
    .eq("supplier_id", supplierId)
    .maybeSingle();
  return !!data?.user_id;
}

// Resolve a slug to the claim target (works for unpublished rows too, unlike the
// public getSupplierBySlug). Null if no such supplier.
export async function getClaimTarget(
  slug: string,
): Promise<{ id: string; name: string; claimed: boolean } | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("suppliers")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();
  if (!data?.id) return null;
  return {
    id: String(data.id),
    name: String(data.name),
    claimed: await isSupplierClaimed(String(data.id)),
  };
}
