import "server-only"; // build error if this is ever imported into a client bundle

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// PRIVILEGED, SERVER-ONLY Supabase client. Uses the service_role key, which
// bypasses Row Level Security, so it can write to the RLS-locked `inquiries`
// table. This key must NEVER reach the browser: it lives in a non-public env var
// (SUPABASE_SERVICE_ROLE_KEY, no NEXT_PUBLIC_ prefix) and this module is marked
// `server-only`. Only the inquiry server action imports it.
//
// Lazily constructed so a missing key throws at request time (a handled error),
// not at build/import time.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing server env. Set SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard -> " +
        "Project Settings -> API -> service_role secret) and NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
