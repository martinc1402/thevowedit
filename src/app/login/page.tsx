import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Supplier login",
  description: "Sign in to manage your supplier profile on The Vow Edit.",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  auth: "That sign-in link didn't work. Please request a new one.",
  missing_code: "That sign-in link was incomplete. Please try again.",
};

type SearchParams = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: SearchParams) {
  const { error } = await searchParams;
  const initialError = error ? (ERROR_MESSAGES[error] ?? "") : "";

  return (
    <>
      <SiteNav />
      <main className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-line bg-surface px-6 py-8 sm:px-8 sm:py-10">
            <h1 className="font-serif text-3xl font-medium text-ink">
              Supplier login
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sign in to manage your listing. Use the email you applied with so
              we can match your profile.
            </p>
            <LoginForm initialError={initialError} />
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-muted">
            Only founding suppliers we&rsquo;ve invited can sign in for now.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
