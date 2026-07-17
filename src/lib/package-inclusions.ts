// Locked vocabulary for package inclusions (the bullet list under each package
// tier). Keys are stored; labels are rendered. Unknown values pass through
// unchanged, so existing free-form inclusions still render.
//
// CATEGORY-KEYED, like services and style tags. It used to be one flat list of
// makeup inclusions shown to EVERY vendor — a photographer building a package was
// offered "Wedding day makeup", "Lashes included" and "Skin prep".

export type InclusionOption = { key: string; label: string };

const MAKEUP_INCLUSIONS: readonly InclusionOption[] = [
  { key: "wedding_day_makeup", label: "Wedding day makeup" },
  { key: "skin_prep", label: "Skin prep" },
  { key: "lashes", label: "Lashes included" },
  { key: "trial_session", label: "Trial session" },
  { key: "look_planning", label: "Look planning" },
  { key: "second_look", label: "Second look for reception" },
  { key: "entourage", label: "Bride + bridesmaids/mothers" },
  { key: "on_location", label: "On-location service" },
  { key: "custom_quote", label: "Custom quote" },
] as const;

const PHOTO_INCLUSIONS: readonly InclusionOption[] = [
  { key: "full_day_coverage", label: "Full-day coverage" },
  { key: "second_shooter", label: "Second shooter" },
  { key: "edited_gallery", label: "Edited online gallery" },
  { key: "prenup_shoot", label: "Prenup shoot" },
  { key: "printed_album", label: "Printed album" },
  { key: "drone", label: "Drone / aerial" },
  { key: "raw_files", label: "Raw files" },
  { key: "photo_booth", label: "Photo booth" },
  { key: "custom_quote", label: "Custom quote" },
] as const;

const VIDEO_INCLUSIONS: readonly InclusionOption[] = [
  { key: "full_day_coverage", label: "Full-day coverage" },
  { key: "same_day_edit", label: "Same-day edit (SDE)" },
  { key: "highlights_film", label: "Highlights film" },
  { key: "full_ceremony", label: "Full ceremony film" },
  { key: "prenup_video", label: "Prenup video" },
  { key: "social_cuts", label: "Social cuts / reels" },
  { key: "drone", label: "Drone / aerial" },
  { key: "raw_footage", label: "Raw footage" },
  { key: "custom_quote", label: "Custom quote" },
] as const;

// Add a category by adding an entry here.
export const CATEGORY_INCLUSIONS: Record<string, readonly InclusionOption[]> = {
  makeup: MAKEUP_INCLUSIONS,
  photographers: PHOTO_INCLUSIONS,
  videographers: VIDEO_INCLUSIONS,
};

// The inclusions a vendor can tick, for their primary category.
export function inclusionsFor(
  category: string | null,
): readonly InclusionOption[] {
  return (category && CATEGORY_INCLUSIONS[category]) || [];
}

// Every valid key across all categories (for server-side validation).
export const INCLUSION_KEYS = new Set(
  Object.values(CATEGORY_INCLUSIONS).flatMap((list) => list.map((i) => i.key)),
);

const INCLUSION_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(CATEGORY_INCLUSIONS).flatMap((list) =>
    list.map((i) => [i.key, i.label]),
  ),
);

// Resolve a stored inclusion to its display label; pass raw strings through.
export function resolveInclusion(v: string): string {
  return INCLUSION_LABEL[v] ?? v;
}
