import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { VendorCard } from "@/components/sections/vendor-card";
import { listPublishedSuppliers, type VendorFilters } from "@/lib/suppliers";
import {
  CEBU_AREAS,
  TECHNIQUES,
  BOOKING_STATUSES,
} from "@/lib/essentials-taxonomy";
import { CATEGORY_FIELDS } from "@/lib/category-fields";
import { categories as ALL_CATEGORIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Wedding vendors in Cebu",
  description:
    "Browse verified Cebu wedding vendors. Real starting rates and per-face entourage rates, not 'price on request'.",
  alternates: { canonical: "/vendors" },
};

// Filter order is the order couples actually search in: where is the wedding, what
// can we spend, how do they work, can they handle our entourage, are they free.
//
// A plain GET form: no client JS, every filtered view is a shareable URL, and the
// back button behaves. The page is a server component, so the query runs on the
// server and the markup arrives filtered.
const BUDGETS = [
  { value: "10000", label: "Up to ₱10,000" },
  { value: "20000", label: "Up to ₱20,000" },
  { value: "30000", label: "Up to ₱30,000" },
  { value: "50000", label: "Up to ₱50,000" },
];
const CAPACITIES = [
  { value: "3", label: "3+ faces" },
  { value: "5", label: "5+ faces" },
  { value: "8", label: "8+ faces" },
  { value: "12", label: "12+ faces" },
];
const HOURS = [
  { value: "6", label: "6+ hours" },
  { value: "8", label: "8+ hours" },
  { value: "10", label: "10+ hours" },
  { value: "12", label: "12+ hours" },
];
// Only the categories we actually have a profile shape for can be browsed — the
// others have no vocabulary, so a vendor could not fill one in.
const LIVE_CATEGORIES = ALL_CATEGORIES.filter((c) => c.slug in CATEGORY_FIELDS);

const selectClass =
  "w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-ink";

function Picker({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <select name={name} defaultValue={value ?? ""} className={selectClass}>
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const cap1 = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const one = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) || undefined;

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  // Only accept values that exist in the taxonomy — an unknown key would otherwise
  // filter everything out and look like "no vendors" rather than a bad URL.
  const areaKeys = new Set(CEBU_AREAS.map((a) => a.key as string));
  const techKeys = new Set(TECHNIQUES.map((t) => t.key as string));
  const statusKeys = new Set(BOOKING_STATUSES.map((b) => b.key as string));

  const pick = (v: string | undefined, allowed: Set<string>) =>
    v && allowed.has(v) ? v : undefined;
  const int = (v: string | undefined) => {
    const n = Number(v);
    return v && Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const categoryKeys = new Set(LIVE_CATEGORIES.map((c) => c.slug));
  const category = pick(one(sp.category), categoryKeys);

  const filters: VendorFilters = {
    category,
    area: pick(one(sp.area), areaKeys),
    budgetMax: int(one(sp.budget)),
    bookingStatus: pick(one(sp.status), statusKeys),
    // Category-specific filters only apply when that category is selected.
    // Applied directory-wide they silently excluded everyone else: a photographer
    // has no `techniques` and no face count, so "Airbrush" or "5+ faces" dropped
    // every one of them.
    technique:
      category === "makeup" ? pick(one(sp.technique), techKeys) : undefined,
    minFaces: category === "makeup" ? int(one(sp.faces)) : undefined,
    minHours:
      category === "photographers" || category === "videographers"
        ? int(one(sp.hours))
        : undefined,
    sameDayEdit:
      category === "videographers" && one(sp.sde) === "1" ? true : undefined,
  };

  const vendors = await listPublishedSuppliers(filters);
  const filtered = Object.values(filters).some((v) => v !== undefined);

  return (
    <>
      <SiteNav />
      <main className="theme-light min-h-[60vh] bg-bg text-ink">
        <div className="mx-auto max-w-[1120px] px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
          <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
            Wedding vendors in Cebu
          </h1>
          <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-muted">
            Every listing shows a real starting rate and, where it applies, the
            per-face entourage rate. No &ldquo;price on request&rdquo;.
          </p>

          <form
            method="GET"
            className="mt-8 rounded-2xl border border-line bg-surface p-5"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Picker
                name="category"
                label="Vendor type"
                value={filters.category}
                options={LIVE_CATEGORIES.map((c) => ({
                  value: c.slug,
                  label: c.label,
                }))}
              />
              <Picker
                name="area"
                label="Area"
                value={filters.area}
                options={CEBU_AREAS.map((a) => ({ value: a.key, label: a.label }))}
              />
              <Picker
                name="budget"
                label="Budget"
                value={filters.budgetMax ? String(filters.budgetMax) : undefined}
                options={BUDGETS}
              />
              <Picker
                name="status"
                label="Availability"
                value={filters.bookingStatus}
                options={BOOKING_STATUSES.map((b) => ({
                  value: b.key,
                  label: b.label,
                }))}
              />

              {/* Category-specific filters appear only once that vendor type is
                  chosen. Shown to everyone, they would silently exclude every other
                  category — a photographer has no technique and no face count. */}
              {category === "makeup" && (
                <>
                  <Picker
                    name="technique"
                    label="Technique"
                    value={filters.technique}
                    options={TECHNIQUES.map((t) => ({
                      value: t.key,
                      label: cap1(t.label),
                    }))}
                  />
                  <Picker
                    name="faces"
                    label="Entourage"
                    value={filters.minFaces ? String(filters.minFaces) : undefined}
                    options={CAPACITIES}
                  />
                </>
              )}
              {(category === "photographers" || category === "videographers") && (
                <Picker
                  name="hours"
                  label="Coverage"
                  value={filters.minHours ? String(filters.minHours) : undefined}
                  options={HOURS}
                />
              )}
              {category === "videographers" && (
                <Picker
                  name="sde"
                  label="Same-day edit"
                  value={filters.sameDayEdit ? "1" : undefined}
                  options={[{ value: "1", label: "Offers an SDE" }]}
                />
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
              >
                Show vendors
              </button>
              {filtered && (
                <Link
                  href="/vendors"
                  className="text-sm text-muted underline underline-offset-2 transition-colors hover:text-ink"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </form>

          <p className="mt-8 text-sm text-muted">
            {vendors.length === 1 ? "1 vendor" : `${vendors.length} vendors`}
            {filtered
              ? vendors.length === 1
                ? " matches your filters"
                : " match your filters"
              : ""}
          </p>

          {vendors.length > 0 ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((s) => (
                <VendorCard key={s.slug} s={s} />
              ))}
            </div>
          ) : (
            /* The directory is new and deliberately small, so an empty result is a
               normal outcome, not an error. Say so plainly and give a way out. */
            <div className="mt-4 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
              <p className="font-serif text-xl text-ink">
                No vendors match that yet.
              </p>
              <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-muted">
                We are onboarding founding vendors in Cebu one at a time, and every
                one is verified before it appears. Widen your filters, or check back
                soon.
              </p>
              {filtered && (
                <Link
                  href="/vendors"
                  className="mt-5 inline-flex rounded-xl border border-line bg-surface-2 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
