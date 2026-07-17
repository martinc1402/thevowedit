import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// PUBLIC, read-only Supabase client. Uses the ANON key, which is safe to expose
// to the browser; the `suppliers` table is protected by RLS (public SELECT only,
// no insert/update/delete policy). This is the opposite of supabase-admin.ts:
// the admin/service-role client bypasses RLS for privileged writes (applications,
// inquiries) and must never reach the client; this one only reads public listings.
//
// Lazily constructed so a missing env var throws at request time (a handled
// error), not at build/import time.
let cached: SupabaseClient | null = null;

export function getSupabasePublic(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing public Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase dashboard -> Project Settings -> API).",
    );
  }

  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
