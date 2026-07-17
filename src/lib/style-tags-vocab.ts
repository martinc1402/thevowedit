// Locked "signature style" vocabulary — the aesthetic chips a vendor ticks, shown
// under their story on the profile. Category-aware (add a category = add an entry).
// Keys are stored; labels are rendered. Unknown values pass through so any legacy
// free-text tags still render until the vendor re-selects.
//
// AUTHORING RULE — the reason this vocabulary looks the way it does:
// No tag here may duplicate a FINISH_STYLES, TECHNIQUES or SKIN_INCLUSIVITY entry
// (src/lib/essentials-taxonomy.ts). Those are already chips on the same wizard step
// and already render in the "Specialties" row of The essentials, so repeating one
// here would print the same fact twice on a single profile, in two different
// sections. That means these are BANNED from this list:
//
//   soft glam, full glam, natural, classic, editorial   (FINISH_STYLES)
//   airbrush, traditional, HD                           (TECHNIQUES)
//   all skin tones, mature skin, acne-prone, morena     (SKIN_INCLUSIVITY)
//
// What is left is the language that has nowhere else to live: finish TEXTURE, the
// artist's POINT OF VIEW, which FEATURE they lead with, and cultural REFERENCE.

export type StyleTagOption = { key: string; label: string };

export const MAKEUP_STYLE_TAGS: readonly StyleTagOption[] = [
  // Finish & texture — how the skin reads, as distinct from how much coverage
  // (coverage is FINISH_STYLES: soft glam / full glam / natural).
  { key: "dewy", label: "Dewy" },
  { key: "satin", label: "Satin" },
  { key: "matte", label: "Matte" },
  // Point of view — the artist's aesthetic, not the product.
  { key: "timeless", label: "Timeless" },
  { key: "modern", label: "Modern" },
  { key: "romantic", label: "Romantic" },
  { key: "minimal", label: "Minimal" },
  { key: "statement", label: "Statement" },
  // Feature focus — what the look leads with.
  { key: "eye_focused", label: "Eye-focused" },
  { key: "bold_lip", label: "Bold lip" },
  { key: "sculpted", label: "Sculpted" },
  // Reference — recognisable aesthetics Filipino couples ask for by name.
  { key: "korean_inspired", label: "Korean-inspired" },
  { key: "filipiniana", label: "Filipiniana" },
] as const;

// Add a category by adding an entry here.
export const CATEGORY_STYLE_TAGS: Record<string, readonly StyleTagOption[]> = {
  makeup: MAKEUP_STYLE_TAGS,
};

// Every valid style-tag key across all categories (for server-side validation).
export const STYLE_TAG_KEYS = new Set(
  Object.values(CATEGORY_STYLE_TAGS).flatMap((list) => list.map((s) => s.key)),
);

const STYLE_TAG_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(CATEGORY_STYLE_TAGS).flatMap((list) =>
    list.map((s) => [s.key, s.label]),
  ),
);

// The style tags a vendor can pick, for their primary category.
export function styleTagsFor(category: string | null): readonly StyleTagOption[] {
  return (category && CATEGORY_STYLE_TAGS[category]) || [];
}

// Resolve a stored key to its display label; pass unknown/legacy strings through.
export function resolveStyleTag(v: string): string {
  return STYLE_TAG_LABEL[v] ?? v;
}
