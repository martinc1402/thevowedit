// Single source of truth for the founding-supplier application option lists.
// Kept in lib (no React) so BOTH the client form/hero and the server action can
// import them: the server action validates submitted category/area against these.

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

export const APPLY_AREAS = [
  "Cebu City",
  "Mandaue",
  "Lapu-Lapu / Mactan",
  "Talisay",
  "Other",
] as const;
