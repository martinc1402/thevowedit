import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

// Reached via the password-reset email → /auth/callback?next=/auth/reset, which
// exchanges the code into a recovery session before landing here. The form then
// updates the password against that session.
export default function ResetPage() {
  return (
    <>
      <SiteNav />
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-line bg-surface px-6 py-8 sm:px-8 sm:py-10">
            <h1 className="font-serif text-3xl font-medium text-ink">
              Set a new password
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Choose a new password for your supplier account.
            </p>
            <ResetForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
