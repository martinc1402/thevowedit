// Supabase client for PUBLIC, READ-ONLY access to supplier data.
//
// Uses the anon/public key only. Row Level Security on the `suppliers` table
// allows SELECT and nothing else, so this client cannot write — all edits happen
// in the Supabase dashboard. The service_role key is NEVER used in app code.
//
// Both env vars are NEXT_PUBLIC_* (safe to expose): the anon key is designed to
// be shipped to the browser. We only read with it here (server components).
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase dashboard → Project Settings → API).",
  );
}

// A single shared client. No auth/session persistence — these are anonymous,
// stateless reads, so we disable session handling to keep it lean.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
