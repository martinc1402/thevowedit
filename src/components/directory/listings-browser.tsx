"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretDown, SlidersHorizontal, MagnifyingGlass, SealCheck } from "@phosphor-icons/react";
import { ListingCard } from "@/components/directory/listing-card";
import {
  getCategoryPrice,
  isBasedIn,
  slugify,
  subLocations,
  PRICE_BANDS,
} from "@/lib/directory";
import type { Listing } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40";

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectClass}
          aria-label={label}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <CaretDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />
      </div>
    </label>
  );
}

export function ListingsBrowser({
  listings,
  categorySlug,
  locationSlug,
  locationLabel,
  noun,
}: {
  listings: Listing[];
  categorySlug: string; // the page's category — prices/sort are shown for this service
  locationSlug: string; // the page's area — drives travel-fee notes + base-first sort
  locationLabel: string;
  noun: string; // lowercased, e.g. "wedding photographers"
}) {
  const [price, setPrice] = useState("any");
  const [area, setArea] = useState("all");
  const [style, setStyle] = useState("all");
  const [sort, setSort] = useState("featured");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Seed the price filter from the URL (?price=) on mount, so a budget chosen in
  // the homepage hero carries through to this page. Read client-side from
  // window.location (not useSearchParams) so the page stays statically
  // prerendered for SEO with no hydration mismatch: the server renders the
  // unfiltered list, then this effect applies the band after hydration.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("price");
    if (p && PRICE_BANDS.some((b) => b.value === p)) setPrice(p);
  }, []);

  // Area filter offers our core areas that any loaded supplier actually serves,
  // so it never lists a dead choice. Free-text areas outside the core set don't
  // get their own option yet (they stay searchable via the area pages).
  const areaOptions = useMemo(() => {
    const served = new Set(listings.flatMap((l) => l.servesAreas.map(slugify)));
    const present = subLocations.filter((s) => served.has(s.slug));
    return [
      { value: "all", label: "All areas" },
      ...present.map((s) => ({ value: s.label, label: s.label })),
    ];
  }, [listings]);

  const styleOptions = useMemo(() => {
    const seen = Array.from(new Set(listings.flatMap((l) => l.styleTags))).sort();
    return [{ value: "all", label: "All styles" }, ...seen.map((s) => ({ value: s, label: s }))];
  }, [listings]);

  const filtered = useMemo(() => {
    const band = PRICE_BANDS.find((b) => b.value === price) ?? PRICE_BANDS[0];
    // Price band, sort, and the card all use this page's service range.
    const priceOf = (l: Listing) => getCategoryPrice(l, categorySlug);
    const areaSlug = area === "all" ? null : slugify(area);
    const out = listings.filter(
      (l) =>
        band.test(priceOf(l)) &&
        (areaSlug === null || l.servesAreas.some((a) => slugify(a) === areaSlug)) &&
        (style === "all" || l.styleTags.includes(style)) &&
        (!verifiedOnly || l.verified),
    );
    // On a specific area page, suppliers based in that area sort above those who
    // merely travel to it. On the province page no one is "based" there, so this
    // is a no-op and ordering falls back to featured/rating.
    const basedHere = (l: Listing) => Number(isBasedIn(l, locationSlug));
    out.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return priceOf(a).min - priceOf(b).min;
        case "price-desc":
          return priceOf(b).max - priceOf(a).max;
        case "rating":
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        default: // based-in-this-area first, then featured, then rating
          return (
            basedHere(b) - basedHere(a) ||
            Number(b.featured) - Number(a.featured) ||
            b.rating - a.rating
          );
      }
    });
    return out;
  }, [listings, categorySlug, locationSlug, price, area, style, sort, verifiedOnly]);

  function clearFilters() {
    setPrice("any");
    setArea("all");
    setStyle("all");
    setVerifiedOnly(false);
  }

  const filtersActive =
    price !== "any" || area !== "all" || style !== "all" || verifiedOnly;

  // Zero listings in the data: tasteful empty state (cross-links sit below).
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface-2/50 px-6 py-16 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
          <MagnifyingGlass size={22} weight="bold" />
        </span>
        <h2 className="mt-5 font-serif text-2xl font-medium text-ink">
          We are still verifying {noun} in {locationLabel}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          Every supplier is hand-checked before it goes live, so this area is not
          ready yet. Check back soon, or explore nearby areas and categories below.
        </p>
      </div>
    );
  }

  // Count-aware grid: 1 or 2 results stay comfortably sized and read as
  // curated rather than a broken, half-empty 3-up row.
  const n = filtered.length;
  const verifiedCount = filtered.filter((l) => l.verified).length;
  const gridCols =
    n === 1
      ? "grid-cols-1 max-w-sm"
      : n === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div>
      {/* Filters: 2-up on mobile (thumb-first), inline row on larger screens. */}
      <div className="rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <SlidersHorizontal size={16} weight="bold" className="text-accent-fg" />
          Filter & sort
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Field label="Price" value={price} onChange={setPrice} options={PRICE_BANDS} />
          {areaOptions.length > 2 && (
            <Field label="Area" value={area} onChange={setArea} options={areaOptions} />
          )}
          {styleOptions.length > 2 && (
            <Field label="Style" value={style} onChange={setStyle} options={styleOptions} />
          )}
          <Field label="Sort by" value={sort} onChange={setSort} options={SORT_OPTIONS} />
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-accent focus:ring-2 focus:ring-accent/40"
          />
          <span className="inline-flex items-center gap-1.5">
            <SealCheck size={14} weight="fill" className="text-accent-fg" />
            Verified only
          </span>
        </label>
      </div>

      {/* Result count — data-driven; never labels the whole set as verified. */}
      <p className="mt-5 text-sm text-muted">
        {n === 0
          ? "No suppliers match these filters"
          : `Showing ${n} ${n === 1 ? "supplier" : "suppliers"}${verifiedCount > 0 ? ` · ${verifiedCount} verified` : ""}`}
      </p>

      {n === 0 ? (
        <div className="mt-3 rounded-2xl border border-line bg-surface-2/50 px-6 py-12 text-center">
          <h3 className="font-serif text-xl font-medium text-ink">
            Nothing matches those filters
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Try widening your price band or clearing a filter to see more suppliers.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={`mt-4 grid gap-4 sm:gap-5 ${gridCols}`}>
          {filtered.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              categorySlug={categorySlug}
              locationSlug={locationSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
