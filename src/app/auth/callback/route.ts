import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { claimSupplierForCurrentUser } from "@/lib/actions/profile";

// Magic-link landing. Supabase redirects here with a `code` (PKCE) which we
// exchange for a session cookie, then run the one-time claim (link this auth
// user to the supplier row seeded with their application email) and send them to
// the dashboard. On any failure we bounce to /login with a flag.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Best-effort: link the account to its supplier row on first login. Never
  // blocks sign-in — the dashboard handles the "no linked profile" state.
  try {
    await claimSupplierForCurrentUser();
  } catch {
    // ignore — dashboard will show the unlinked state
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/dashboard"}`);
}
