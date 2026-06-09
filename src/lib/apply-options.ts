// Single source of truth for the founding-supplier application option lists.
// Kept in lib (no React) so BOTH the client form/hero and the server action can
// import them: the server action validates submitted category/location against
// these.
//
// Locations come from the scope model in @/lib/locations: APPLY_SCOPE is the
// active launch scope (currently Cebu) and APPLY_LOCATIONS are its LGUs as
// { slug, label }. The form submits the stable slug; the server resolves it to a
// label and stores the scope alongside it, so national expansion is a data change
// in locations.ts, not a refactor here.

import { ACTIVE_SCOPE } from "@/lib/locations";

export const APPLY_CATEGORIES = [
  "Photographers",
  "Hair & Makeup",
  "Catering",
  "Venues",
  "Florists",
  "Coordinators",
  "Videographers",
  "Cakes",
  "Content creators",
] as const;

/** Active launch scope (province), e.g. { slug: "cebu", label: "Cebu", lgus }. */
export const APPLY_SCOPE = ACTIVE_SCOPE;

/** City/municipality options for the active scope: readonly { slug, label }[]. */
export const APPLY_LOCATIONS = ACTIVE_SCOPE.lgus;
