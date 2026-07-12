import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

// Admin = the logged-in user's email is on the server-only ADMIN_EMAILS allowlist
// (comma-separated). Never NEXT_PUBLIC_ — it must not reach the client. Used to
// gate privileged edits (e.g. changing a supplier's categories) in both server
// actions and server components. Parsed once at module load.
const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export async function isAdmin(): Promise<boolean> {
  if (ADMIN_EMAILS.size === 0) return false;
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  return !!email && ADMIN_EMAILS.has(email);
}
