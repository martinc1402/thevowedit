import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 request proxy (formerly "middleware"). Two jobs:
//  1. Refresh the Supabase auth session cookie on every matched request so
//     server components / actions see a valid session.
//  2. Gate /dashboard/* — send logged-out visitors to /login.
//
// Follows the canonical Supabase SSR pattern: do NOT put logic between
// createServerClient and getUser(), and always return the response object whose
// cookies were mutated, or the browser and server sessions drift apart.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // If env is missing, don't hard-fail every request; just pass through.
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: keep this immediately after createServerClient.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirect);
  }

  return response;
}

export const config = {
  // Only run where a session matters: dashboard + auth routes. Static assets and
  // the marketing site are untouched (no session cost on the public funnel).
  matcher: ["/dashboard/:path*", "/login", "/auth/:path*"],
};
