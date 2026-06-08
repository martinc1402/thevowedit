import Link from "next/link";
import {
  footerCategories,
  footerLocations,
  footerGuides,
  footerCompany,
} from "@/lib/content";

// Secondary link columns render only when they actually contain links to built
// pages, so the footer never shows a dead end. The category x area matrix below
// always links to real /[category]/[area] listing pages.
const linkGroups = [
  { title: "Guides", links: footerGuides },
  { title: "Company", links: footerCompany },
].filter((g) => g.links.length > 0);

const gridCols =
  linkGroups.length === 0
    ? "lg:grid-cols-1"
    : linkGroups.length === 1
      ? "lg:grid-cols-[1.6fr_1fr]"
      : "lg:grid-cols-[1.4fr_1fr_1fr]";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10">
        <div className={`grid grid-cols-1 gap-12 ${gridCols}`}>
          {/* Pre-launch: no live directory yet. These are the categories and
              areas we are onboarding suppliers in, shown as plain text (no links)
              so nothing implies browsable inventory. The one action is to apply. */}
          <div>
            <h2 className="font-serif text-2xl font-medium text-ink">
              We are onboarding suppliers across Cebu
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              These are the categories and areas opening at launch. Run a wedding
              business in Cebu? Claim a free founding listing before couples start
              searching.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
              {footerLocations.map((loc) => (
                <div key={loc.slug}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                    {loc.label}
                  </p>
                  <ul className="space-y-2">
                    {footerCategories.map((cat) => (
                      <li key={cat.slug} className="text-sm text-muted">
                        {cat.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link
              href="#apply"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
            >
              Apply for a founding listing
            </Link>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                {group.title}
              </p>
              <ul className="space-y-2.5">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 sm:flex-row sm:items-center">
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
            The Vow Edit<span className="text-accent-fg">.</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              Privacy
            </Link>
            <p className="text-sm text-muted">
              Wedding suppliers in Cebu, Philippines. © 2026 The Vow Edit.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
