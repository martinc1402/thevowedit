import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Session-aware Supabase client for SERVER contexts (server components, route
// handlers, server actions). Reads the auth session from the request cookies and
// can refresh it, so `supabase.auth.getUser()` returns the logged-in supplier.
// Uses the public anon/publishable key — NOT the service_role. Privileged writes
// still go through supabase-admin.ts inside ownership-checked actions.
//
// `cookies()` is async in Next 16. The setAll try/catch is required: when called
// from a Server Component (read-only cookie store) the writes throw and are
// safely ignored, because the proxy (src/proxy.ts) refreshes the session cookie
// on every request instead.
export async function getSupabaseServer(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing public Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase dashboard -> Project Settings -> API).",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — ignore; the proxy refreshes cookies.
        }
      },
    },
  });
}
