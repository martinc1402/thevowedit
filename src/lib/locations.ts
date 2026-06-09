// Canonical geographic model for The Vow Edit. Location is a PARAMETER, not a
// hardcoded constant: the app launches scoped to one province ("scope"), and a
// future national expansion is a pure data change here (add scopes + their LGU
// lists, repoint ACTIVE_SCOPE). Nothing structural should hardcode "Cebu" where
// it could read ACTIVE_SCOPE instead.
//
// No React imports: both the client form/hero and the server action import this
// (the server action validates submitted LGU slugs against the active scope).
//
// TODO(expansion): this is the single source of truth for locations. The public
// directory (category/location + supplier pages) was removed for MVP; when it
// returns, build it on this model and generate + index per-location pages
// ("[category] in [LGU]") only as real suppliers arrive per LGU, never as empty
// programmatic pages.

export type Lgu = { slug: string; label: string };
export type Scope = { slug: string; label: string; lgus: readonly Lgu[] };

// Add more scopes (provinces/regions) here to expand nationally.
export const SCOPES = [
  {
    slug: "cebu",
    label: "Cebu",
    // Curated, wedding-relevant Cebu LGUs (9 cities + 13 municipalities) plus a
    // catch-all. Slugs are stable values; labels are the clean display text.
    lgus: [
      // Cities
      { slug: "cebu-city", label: "Cebu City" },
      { slug: "mandaue-city", label: "Mandaue City" },
      { slug: "lapu-lapu", label: "Lapu-Lapu City (Mactan)" },
      { slug: "talisay-city", label: "Talisay City" },
      { slug: "toledo-city", label: "Toledo City" },
      { slug: "danao-city", label: "Danao City" },
      { slug: "carcar-city", label: "Carcar City" },
      { slug: "naga-city", label: "Naga City" },
      { slug: "bogo-city", label: "Bogo City" },
      // Municipalities
      { slug: "cordova", label: "Cordova" },
      { slug: "consolacion", label: "Consolacion" },
      { slug: "liloan", label: "Liloan" },
      { slug: "minglanilla", label: "Minglanilla" },
      { slug: "compostela", label: "Compostela" },
      { slug: "moalboal", label: "Moalboal" },
      { slug: "oslob", label: "Oslob" },
      { slug: "badian", label: "Badian" },
      { slug: "argao", label: "Argao" },
      { slug: "dalaguete", label: "Dalaguete" },
      { slug: "daanbantayan", label: "Daanbantayan (Malapascua)" },
      { slug: "bantayan", label: "Bantayan" },
      { slug: "santander", label: "Santander" },
      // Catch-all so a supplier in a less common LGU can still apply.
      { slug: "other-cebu", label: "Other (Cebu)" },
    ],
  },
] as const satisfies readonly Scope[];

// The current launch scope. Expansion = add scope(s) above and repoint this (or
// make it request-driven). Read this instead of hardcoding "Cebu" anywhere.
export const ACTIVE_SCOPE: Scope = SCOPES[0];

/** Look up a scope by its slug (e.g. "cebu"). */
export function getScope(slug: string): Scope | undefined {
  return SCOPES.find((s) => s.slug === slug);
}

/** True when `lguSlug` is a valid LGU within `scope` (tamper check). */
export function isValidLgu(scope: Scope, lguSlug: string): boolean {
  return scope.lgus.some((l) => l.slug === lguSlug);
}

/** Resolve an LGU slug to its clean display label within `scope`. */
export function lguLabel(scope: Scope, lguSlug: string): string {
  return scope.lgus.find((l) => l.slug === lguSlug)?.label ?? lguSlug;
}

// "Serves all of <scope>" island-wide sentinel. Scope-relative so a future
// national expansion stays a pure data change: every scope gets its own
// "all-<slug>" value and "All of <Label>" display automatically.

/** The island-wide sentinel value for a scope, e.g. "all-cebu". */
export function allAreasValue(scope: Scope): string {
  return `all-${scope.slug}`;
}

/** The island-wide display label for a scope, e.g. "All of Cebu". */
export function allAreasLabel(scope: Scope): string {
  return `All of ${scope.label}`;
}

/** True when `value` is a valid area selection: a real LGU OR the island-wide sentinel. */
export function isValidAreaSelection(scope: Scope, value: string): boolean {
  return value === allAreasValue(scope) || isValidLgu(scope, value);
}

/** Resolve any area selection value (LGU slug or sentinel) to its display label. */
export function areaSelectionLabel(scope: Scope, value: string): string {
  return value === allAreasValue(scope)
    ? allAreasLabel(scope)
    : lguLabel(scope, value);
}
