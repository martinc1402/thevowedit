import type { Supplier } from "@/lib/suppliers";
import type { EssentialsData } from "@/lib/essentials-taxonomy";

// Overlay a supplier's pending (approval-required) drafts onto its live values,
// producing what the profile would look like once approved. Pure — used by the
// admin preview and the vendor dashboard's "pending" state. Only keys present in
// pending_changes override; everything else stays live.
export function applyPending(s: Supplier): Supplier {
  const p = s.pendingChanges;
  if (!p) return s;
  return {
    ...s,
    name: p.name ?? s.name,
    shortDescription:
      p.short_description !== undefined ? p.short_description : s.shortDescription,
    description: p.description !== undefined ? p.description : s.description,
    bio: p.bio !== undefined ? p.bio : s.bio,
    teamPhoto: p.team_photo !== undefined ? p.team_photo : s.teamPhoto,
    faq: p.faq ?? s.faq,
    images: p.images ?? s.images,
    // An empty essentials_custom is a real instruction ("remove my custom facts"),
    // not an absence — so test for the key, never for truthiness.
    essentials: Array.isArray(p.essentials_custom)
      ? ({
          ...(s.essentials ?? {}),
          customEssentials: p.essentials_custom,
        } as EssentialsData)
      : s.essentials,
  };
}

// The list of human-readable field labels a supplier currently has pending.
const PENDING_LABELS: Record<string, string> = {
  name: "Display name",
  short_description: "Tagline",
  description: "About copy",
  bio: "Bio",
  team_photo: "Portrait photo",
  faq: "Q&A",
  images: "Gallery photos",
  essentials_custom: "Custom essentials",
};

export function pendingLabels(p: Supplier["pendingChanges"]): string[] {
  if (!p) return [];
  return Object.keys(p)
    .filter((k) => k in PENDING_LABELS)
    .map((k) => PENDING_LABELS[k]);
}
