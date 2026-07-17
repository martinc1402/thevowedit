import type { Metadata } from "next";
import Link from "next/link";
import { SignOut, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/wordmark";
import { getMySupplier } from "@/lib/actions/profile";
import { isAdmin } from "@/lib/auth";
import { ProfileWizard } from "./profile-wizard";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Manage your supplier profile on The Vow Edit.",
  robots: { index: false, follow: false },
};

// The proxy (src/proxy.ts) guards this route, so an unauthenticated visitor is
// redirected to /login before this renders. getMySupplier returns null only when
// the logged-in account has no linked supplier row (should not happen for an
// invited founding vendor, but we handle it gracefully).
export default async function DashboardPage() {
  const [supplier, admin] = await Promise.all([getMySupplier(), isAdmin()]);

  return (
    <div className="theme-light min-h-[100dvh] bg-bg">
      <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
          <Wordmark />
          <div className="flex items-center gap-3">
            {supplier?.published && (
              <Link
                href={`/vendors/${supplier.slug}`}
                target="_blank"
                className="hidden text-sm text-muted transition-colors hover:text-ink sm:inline"
              >
                View public profile
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                <SignOut size={14} weight="bold" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14">
        {supplier ? (
          <ProfileWizard supplier={supplier} isAdmin={admin} />
        ) : (
          <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface px-6 py-10 text-center">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
              <WarningCircle size={24} weight="fill" />
            </span>
            <h1 className="mt-4 font-serif text-2xl font-medium text-ink">
              No profile linked yet
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              This account isn&rsquo;t linked to a supplier listing. If you
              applied for a founding listing, make sure you signed in with the
              same email. Otherwise, get in touch and we&rsquo;ll sort it out.
            </p>
            <a
              href="mailto:hello@thevowedit.ph"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover"
            >
              Email the team
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
