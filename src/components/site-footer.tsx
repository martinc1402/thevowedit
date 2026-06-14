import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

// Pre-launch footer: a single honest blurb + one apply CTA. The richer
// location × category matrix (Cebu City / Mactan / ... × every category) was a
// "browse a populated directory" structure with nothing behind it yet, so it was
// removed. Bring it back as a real SEO asset once listings populate per location,
// linking to real /[category]/[location] pages instead of empty ones.
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <Wordmark />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A wedding-supplier directory for Cebu, launching soon. Onboarding
              founding suppliers across Cebu.
            </p>
          </div>

          <a
            href="#apply"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] lg:self-auto"
          >
            Apply for a founding listing
          </a>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted">
            Wedding suppliers in Cebu, Philippines. © 2026 The Vow Edit.
          </p>
          <Link
            href="/privacy"
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
