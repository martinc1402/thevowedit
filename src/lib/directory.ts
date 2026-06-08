// Resolver + query helpers for the category-location directory pages.
// Category/location lists come from content.ts; supplier rows come from Supabase
// (see supabase.ts + suppliers.ts). The data functions here (getListings,
// getSupplierBySlug, getAllSupplierSlugs) are the only DB-touching code; every
// other helper is pure and unchanged.

import { categories, categoryCopy } from "@/lib/content";
import { supabase } from "@/lib/supabase";
import { rowToListing } from "@/lib/suppliers";
import type { Listing, CategoryPrice } from "@/lib/types";

/** The default, province-wide location. /[category]/cebu is the main page. */
export const PROVINCE = { slug: "cebu", label: "Cebu" } as const;

/** Cities within Cebu that get their own filtered pages + cross-links. */
export const subLocations = [
  { slug: "cebu-city", label: "Cebu City" },
  { slug: "mactan", label: "Mactan" },
  { slug: "lapu-lapu", label: "Lapu-Lapu" },
  { slug: "mandaue", label: "Mandaue" },
] as const;

export const allLocations = [PROVINCE, ...subLocations];

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function titleCase(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function locationLabel(slug: string): string {
  const match = allLocations.find((l) => l.slug === slug);
  return match ? match.label : titleCase(slug);
}

export function categoryLabel(slug: string): string {
  const match = categories.find((c) => c.slug === slug);
  return match ? match.label : titleCase(slug);
}

/**
 * H1 + intro copy for a category page. Uses seeded per-category copy when
 * present, otherwise generates a sensible line so any category renders.
 */
export function resolveCategoryCopy(categorySlug: string, locLabel: string) {
  const entry = categoryCopy[categorySlug];
  const label = categoryLabel(categorySlug);
  const noun = entry?.noun ?? `Wedding ${label.toLowerCase()}`;
  const h1 = `${noun} in ${locLabel}`;
  const intro = entry
    ? entry.intro(locLabel)
    : `Compare verified ${noun.toLowerCase()} in ${locLabel} with real prices shown upfront. We are adding more suppliers in this area soon.`;
  return { noun, h1, intro };
}

/**
 * Listings for a category, scoped by location (province = all areas).
 * An area page shows every supplier whose `servesAreas` INCLUDES that area, so
 * a supplier who travels to an area appears there, not only those based in it.
 *
 * Reads from Supabase: the category filter runs in Postgres (GIN-indexed array
 * `contains`); the area filter stays in JS via `slugify` so it matches free-text
 * area labels the same way the mock version did. Sorting/UI filters remain in
 * ListingsBrowser, exactly as before.
 */
export async function getListings(
  categorySlug: string,
  locationSlug: string,
): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .contains("categories", [categorySlug])
    .order("created_at", { ascending: true });

  if (error) throw error;

  let rows = (data ?? []).map(rowToListing);
  if (locationSlug !== PROVINCE.slug) {
    rows = rows.filter((l) =>
      l.servesAreas.some((a) => slugify(a) === locationSlug),
    );
  }
  return rows;
}

/**
 * Every supplier, mapped to Listing, unfiltered. Used by /browse to build the
 * per-category rows: the page fetches once on the server, then the client area
 * selector filters/groups in the browser (by servesAreas, like getListings).
 */
export async function getAllListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(rowToListing);
}

/** True when the supplier is based IN this area (vs. only travelling to it). */
export function isBasedIn(l: Listing, locationSlug: string): boolean {
  return slugify(l.basedIn) === locationSlug;
}

/**
 * Whether to surface a travel-fee note for this supplier on a given page: only
 * when there's a note AND the page is a specific area outside the supplier's
 * base. On the province page (no single area) we stay quiet.
 */
export function showsTravelFee(l: Listing, locationSlug: string): boolean {
  if (!l.travelFeeNote) return false;
  if (locationSlug === PROVINCE.slug) return false;
  return !isBasedIn(l, locationSlug);
}

/**
 * Condensed service-area treatment for a card: the areas the supplier serves
 * beyond their base, truncated to a few named ones plus a "+N more" count, so a
 * supplier serving a dozen areas never overflows. The base is shown separately.
 */
export function condensedServiceAreas(
  l: Listing,
  maxNamed = 2,
): { named: string[]; remaining: number; hasOthers: boolean } {
  const baseSlug = slugify(l.basedIn);
  const others = l.servesAreas.filter((a) => slugify(a) !== baseSlug);
  const named = others.slice(0, maxNamed);
  return {
    named,
    remaining: others.length - named.length,
    hasOthers: others.length > 0,
  };
}

/**
 * The price range to show for a supplier in the context of a given category.
 * Multi-service suppliers carry a per-category range in `pricing`; everyone else
 * falls back to the overall priceMin/priceMax (which IS the single service range).
 */
export function getCategoryPrice(
  l: Listing,
  categorySlug: string,
): CategoryPrice {
  return l.pricing?.[categorySlug] ?? { min: l.priceMin, max: l.priceMax };
}

/**
 * Canonical supplier price bands, shared by the homepage hero "Budget" picker
 * and the listings price filter. One source of truth means a budget chosen on
 * the homepage carries straight through as a `?price=` filter on the
 * /[category]/[area] listing page (see ListingsBrowser). `any` carries nothing.
 */
export type PriceBand = {
  value: string;
  label: string;
  test: (p: CategoryPrice) => boolean;
};

export const PRICE_BANDS: PriceBand[] = [
  { value: "any", label: "Any price", test: () => true },
  { value: "u50", label: "Under ₱50k", test: (p) => p.min < 50000 },
  {
    value: "50-100",
    label: "₱50k to ₱100k",
    test: (p) => p.max >= 50000 && p.min <= 100000,
  },
  { value: "100+", label: "₱100k and up", test: (p) => p.max >= 100000 },
];

/** True when `v` is a real, filterable band value (i.e. a known band, not "any"). */
export function isPriceBand(v: string | null | undefined): boolean {
  return !!v && v !== "any" && PRICE_BANDS.some((b) => b.value === v);
}

/** Human service noun per category (e.g. "Photography"), for price labels + tags. */
const SERVICE_NOUNS: Record<string, string> = {
  photographers: "Photography",
  videographers: "Videography",
  hmua: "Hair & makeup",
  catering: "Catering",
  florists: "Florals",
  coordinators: "Coordination",
  venues: "Venue",
  cakes: "Cakes",
  "content-creators": "Social content",
};

export function serviceLabel(slug: string): string {
  return SERVICE_NOUNS[slug] ?? categoryLabel(slug);
}

/** Locations to cross-link to from a given page (everything but the current). */
export function otherLocations(currentSlug: string) {
  return allLocations.filter((l) => l.slug !== currentSlug);
}

/** Categories to cross-link to (everything but the current), as {slug,label}. */
export function otherCategories(currentSlug: string) {
  return categories
    .filter((c) => c.slug !== currentSlug)
    .map((c) => ({ slug: c.slug, label: c.label }));
}

export const allCategorySlugs = categories.map((c) => c.slug);
export const allLocationSlugs = allLocations.map((l) => l.slug);

/** Compact PHP display: ₱35k, ₱120k, ₱1,800. Matches the homepage price band. */
export function formatPeso(n: number): string {
  if (n >= 1000 && n % 1000 === 0) return `₱${n / 1000}k`;
  return `₱${n.toLocaleString("en-PH")}`;
}

/** Single supplier lookup by its permanent stored slug (the public URL). */
export async function getSupplierBySlug(
  slug: string,
): Promise<Listing | undefined> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToListing(data) : undefined;
}

/** All supplier slugs, for generateStaticParams on /supplier/[slug]. */
export async function getAllSupplierSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("suppliers").select("slug");
  if (error) throw error;
  return (data ?? []).map((r) => r.slug as string);
}

/**
 * Generate a URL slug from a business name, ONCE, at record creation. The slug
 * is the permanent public URL and must be persisted on the record — it must NOT
 * be re-derived from (or change with) the display name later. Collisions get a
 * numeric suffix (-2, -3, …). Pass the set of slugs already in use.
 */
export function generateUniqueSlug(name: string, existing: Set<string>): string {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (existing.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}
