import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/auth";
import { getMyOwnership } from "@/lib/actions/profile";
import {
  withProjectionFallback,
  mapSupplierRow,
  type Supplier,
} from "@/lib/suppliers";

// Read a supplier by slug REGARDLESS of `published`, but only for a viewer allowed
// to see a hidden profile: an admin, or the owner of this exact slug. Everyone else
// gets null (the profile page then 404s, so a hidden vendor stays invisible to the
// public). Returns `notLive` so the page can show a "hidden, only you can see this"
// banner.
//
// Uses the service-role client to bypass the published-only public read, so this
// module is `server-only`. It widens the admin-only pattern in
// getSupplierForAdmin (actions/moderation.ts) to owner-or-admin.
export async function getSupplierBySlugForViewer(
  slug: string,
): Promise<{ supplier: Supplier; notLive: boolean } | null> {
  const [own, admin] = await Promise.all([getMyOwnership(), isAdmin()]);
  const isOwner = own?.slug === slug;
  if (!admin && !isOwner) return null;

  const db = getSupabaseAdmin();
  const { data, error } = await withProjectionFallback((columns) =>
    db.from("suppliers").select(columns).eq("slug", slug).maybeSingle(),
  );
  if (error || !data) return null;

  const supplier = mapSupplierRow(data as unknown as Record<string, unknown>);
  return { supplier, notLive: !supplier.published };
}
