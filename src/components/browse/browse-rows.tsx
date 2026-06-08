"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CaretRight, MagnifyingGlass } from "@phosphor-icons/react";
import { categories } from "@/lib/content";
import { PROVINCE, subLocations, slugify } from "@/lib/directory";
import { ListingCard } from "@/components/directory/listing-card";
import type { Listing } from "@/lib/types";

// Airbnb-style browse: a horizontal row of real supplier cards per category,
// filtered by the chosen area. Built empty-first: categories with no suppliers
// in the selected area are hidden entirely, and an all-empty area shows a
// tasteful prompt instead of a blank page. Reuses the listing-page ListingCard.

const AREAS = [
  { slug: PROVINCE.slug, label: "All of Cebu" },
  ...subLocations.map((a) => ({ slug: a.slug, label: a.label })),
];

// Featured first (the monetization hook: honored in sort, never sold in UI),
// then verified, then higher-rated, then alphabetical for a stable order.
function rank(a: Listing, b: Listing): number {
  return (
    Number(b.featured) - Number(a.featured) ||
    Number(b.verified) - Number(a.verified) ||
    b.rating - a.rating ||
    a.name.localeCompare(b.name)
  );
}

export function BrowseRows({ listings }: { listings: Listing[] }) {
  const [area, setArea] = useState<string>(PROVINCE.slug);
  const areaLabel = AREAS.find((a) => a.slug === area)?.label ?? "Cebu";

  // One entry per category that actually has suppliers in this area. Categories
  // with zero matches are dropped here, so no empty rows ever render.
  const rows = useMemo(() => {
    const inArea = (l: Listing) =>
      area === PROVINCE.slug || l.servesAreas.some((a) => slugify(a) === area);

    return categories
      .map((c) => ({
        category: c,
        suppliers: listings
          .filter((l) => l.categories.includes(c.slug) && inArea(l))
          .sort(rank),
      }))
      .filter((row) => row.suppliers.length > 0);
  }, [listings, area]);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      {/* Area selector. aria-pressed exposes the active choice; changing it
          refilters every row and updates the headings + "See all" links. */}
      <div role="group" aria-label="Choose an area" className="flex flex-wrap gap-2">
        {AREAS.map((a) => {
          const active = a.slug === area;
          return (
            <button
              key={a.slug}
              type="button"
              aria-pressed={active}
              onClick={() => setArea(a.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors active:scale-[0.98] ${
                active
                  ? "bg-accent text-accent-ink"
                  : "border border-line bg-surface text-ink hover:border-ink/25 hover:bg-surface-2"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <EmptyArea area={area} areaLabel={areaLabel} onBrowseAll={() => setArea(PROVINCE.slug)} />
      ) : (
        <div className="mt-9 space-y-12 lg:mt-10 lg:space-y-14">
          {rows.map(({ category: c, suppliers }) => (
            <section key={c.slug} aria-labelledby={`row-${c.slug}`}>
              <div className="flex items-end justify-between gap-4">
                <h2
                  id={`row-${c.slug}`}
                  className="font-serif text-2xl font-medium leading-tight text-ink sm:text-3xl"
                >
                  {c.label} in {areaLabel}
                </h2>
                <Link
                  href={`/${c.slug}/${area}`}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-ink transition-colors hover:text-accent-fg"
                >
                  See all
                  <CaretRight size={15} weight="bold" />
                </Link>
              </div>

              {/* Horizontal row. Cards keep their natural width and sit
                  left-aligned (shrink-0, not stretched), so 1-2 suppliers look
                  intentional; overflow scrolls. Full-bleed on mobile so the row
                  scrolls edge-to-edge; the peeking next card hints at more. */}
              <ul
                className="mt-5 flex snap-x gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                  -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
              >
                {suppliers.map((l) => (
                  <li
                    key={l.id}
                    className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-[300px]"
                  >
                    <ListingCard listing={l} categorySlug={c.slug} locationSlug={area} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

// Tasteful empty state when no category has suppliers in the selected area.
// Offers a route back to the widest view (or, if already there, just reassures).
function EmptyArea({
  area,
  areaLabel,
  onBrowseAll,
}: {
  area: string;
  areaLabel: string;
  onBrowseAll: () => void;
}) {
  const isProvince = area === PROVINCE.slug;
  return (
    <div className="mt-9 rounded-2xl border border-line bg-surface-2/50 px-6 py-16 text-center lg:mt-10">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
        <MagnifyingGlass size={22} weight="bold" />
      </span>
      <h2 className="mt-5 font-serif text-2xl font-medium text-ink">
        {isProvince
          ? "We are adding suppliers across Cebu soon"
          : `We are adding suppliers in ${areaLabel} soon`}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        Every supplier is hand-checked before it goes live. {isProvince
          ? "Check back shortly, or "
          : "Try a wider area, or "}
        explore the homepage in the meantime.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {!isProvince && (
          <button
            type="button"
            onClick={onBrowseAll}
            className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
          >
            Browse all of Cebu
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink/25 hover:bg-surface-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
