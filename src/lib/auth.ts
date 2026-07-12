import "server-only";
import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Admin = the logged-in user has an 'admin' row in public.user_roles (see
// supabase/admin-roles.sql). Keyed on the auth user id, so granting/revoking is a
// DB write that takes effect on the next request — no redeploy.
//
// WHAT THIS IS NOT: an enforcement layer. Privileged writes still go through the
// service_role key, which bypasses RLS, so the actual decision is made here in app
// code and re-checked in every server action. This table records WHO is an admin;
// it does not make Postgres police it.
//
// ADMIN_EMAILS survives as BREAK-GLASS only:
//   * bootstrap — with an empty user_roles table nobody can grant adminness;
//   * recovery — a way back in if the last admin row is deleted.
// It is server-only (never NEXT_PUBLIC_). Leaving it unset is fine and expected
// once the table is seeded.
const BREAK_GLASS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

// Request-scoped memo: isAdmin() is already called more than once per request in
// some paths (e.g. updateMyProfile -> getMyOwnership + isAdmin), and it now costs a
// DB round-trip on top of auth.getUser(). Fails closed everywhere: no session, or no
// row and not on the break-glass list, is false.
export const isAdmin = cache(async (): Promise<boolean> => {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const email = user.email?.toLowerCase();
  if (email && BREAK_GLASS.has(email)) return true;

  const { data, error } = await getSupabaseAdmin()
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    // Never fail open: a broken/absent table means nobody is an admin.
    console.error("[auth] user_roles lookup failed:", error.message);
    return false;
  }
  return !!data;
});
