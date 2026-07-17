import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getClaimTarget } from "@/lib/claim-status";
import { ClaimForm } from "./claim-form";

export const metadata: Metadata = {
  title: "Claim your profile",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ slug: string }> };

export default async function ClaimPage({ params }: Params) {
  const { slug } = await params;
  const target = await getClaimTarget(slug);
  if (!target) notFound();

  return (
    <>
      <SiteNav />
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-line bg-surface px-6 py-8 sm:px-8 sm:py-10">
            {target.claimed ? (
              <>
                <h1 className="font-serif text-3xl font-medium text-ink">
                  This profile is already claimed
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {target.name} has already been claimed. If it&rsquo;s yours,
                  sign in to manage it.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <>
                <h1 className="font-serif text-3xl font-medium text-ink">
                  Claim {target.name}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Enter the claim code The Vow Edit gave you to take control of
                  this profile and set up your login.
                </p>
                <ClaimForm slug={slug} />
              </>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
