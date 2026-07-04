import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Session-aware Supabase client for CLIENT components (login form, wizard
// interactivity). Uses the public anon/publishable key and reads/writes the
// auth session from browser cookies via @supabase/ssr, so it stays in sync with
// the server client + proxy below. This is different from supabase-public.ts,
// which is a stateless read-only client with no session — that one is for
// public server-rendered reads; this one carries the logged-in supplier.
let cached: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing public Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase dashboard -> Project Settings -> API).",
    );
  }

  if (!cached) cached = createBrowserClient(url, anonKey);
  return cached;
}
