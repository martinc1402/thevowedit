// Locked vocabulary for package inclusions (the bullet list under each package
// tier). Keys are stored; labels are rendered. Filter-worthy — extend by adding
// an entry. Unknown values pass through unchanged, so existing free-form
// inclusions still render (backward-compatible).

export const PACKAGE_INCLUSIONS: Record<string, string> = {
  wedding_day_makeup: "Wedding day makeup",
  skin_prep: "Skin prep",
  lashes: "Lashes included",
  trial_session: "Trial session",
  look_planning: "Look planning",
  second_look: "Second look for reception",
  entourage: "Bride + bridesmaids/mothers",
  custom_quote: "Custom quote",
  on_location: "On-location service",
};

// Resolve a stored inclusion to its display label; pass raw strings through.
export function resolveInclusion(v: string): string {
  return PACKAGE_INCLUSIONS[v] ?? v;
}
