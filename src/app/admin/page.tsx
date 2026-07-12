import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "@/components/wordmark";
import { isAdmin } from "@/lib/auth";
import { listVendorsForAdmin } from "@/lib/actions/moderation";
import { AdminVendors } from "./admin-vendors";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) notFound();
  const vendors = await listVendorsForAdmin();
  const pending = vendors.filter((v) => v.pendingKeys.length > 0);

  return (
    <div className="min-h-[100dvh] bg-bg">
      <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-fg">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden text-sm text-muted transition-colors hover:text-ink sm:inline"
            >
              My profile
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                <SignOut size={14} weight="bold" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] space-y-12 px-4 py-10 sm:px-6 sm:py-14">
        <section>
          <h1 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
            Moderation queue
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Vendor changes to photos, bio, tagline and Q&amp;A wait here for review.
          </p>
          {pending.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-line bg-surface px-5 py-6 text-sm text-muted">
              Nothing awaiting review.
            </p>
          ) : (
            <ul className="mt-6 grid gap-3">
              {pending.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-ink">{v.name}</p>
                    <p className="text-sm text-muted">
                      {v.pendingKeys.length} change
                      {v.pendingKeys.length === 1 ? "" : "s"} pending
                    </p>
                  </div>
                  <Link
                    href={`/admin/preview/${v.slug}`}
                    className="inline-flex shrink-0 items-center rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover"
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-serif text-2xl font-medium text-ink">Vendors</h2>
          <p className="mt-1.5 text-sm text-muted">
            Generate a claim code to hand a vendor, or reset their access.
          </p>
          <div className="mt-6">
            <AdminVendors vendors={vendors} />
          </div>
        </section>
      </main>
    </div>
  );
}
