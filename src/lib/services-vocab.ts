// Locked "services offered" vocabulary — the checklist a vendor ticks and couples
// see under Services & packages. Category-aware (add a category = add an entry).
// Keys are stored; labels are rendered. Unknown values pass through so any legacy
// free-text services still render until the vendor re-selects.

export type ServiceOption = { key: string; label: string };

export const MAKEUP_SERVICES: readonly ServiceOption[] = [
  { key: "bridal_makeup", label: "Bridal makeup" },
  { key: "bridal_hair", label: "Bridal hair" },
  { key: "hair_only", label: "Hair only" },
  { key: "airbrush", label: "Airbrush makeup" },
  { key: "hd_makeup", label: "HD makeup" },
  { key: "entourage", label: "Entourage / group makeup" },
  // Commonly booked alongside the wedding and often bundled — couples search for it
  // by name, and some book the trial as their prenup makeup.
  { key: "prenup", label: "Prenup / pictorial makeup" },
  // Softer ceremony face, glammed reception. Charged separately because the artist
  // (or a standby) stays longer.
  { key: "second_look", label: "Second look / change look" },
  { key: "grooming", label: "Grooming (men)" },
  { key: "trial", label: "Trial session" },
  { key: "on_location", label: "On-location service" },
  { key: "touch_up", label: "Touch-up service" },
] as const;

export const PHOTO_SERVICES: readonly ServiceOption[] = [
  { key: "wedding_coverage", label: "Wedding day coverage" },
  { key: "prenup_shoot", label: "Prenup shoot" },
  { key: "engagement_shoot", label: "Engagement shoot" },
  { key: "civil_wedding", label: "Civil wedding" },
  { key: "album_design", label: "Album design" },
  { key: "photo_booth", label: "Photo booth" },
  { key: "onsite_printing", label: "On-site printing" },
  { key: "drone", label: "Drone / aerial" },
  { key: "second_shooter", label: "Second shooter" },
] as const;

export const VIDEO_SERVICES: readonly ServiceOption[] = [
  { key: "wedding_film", label: "Wedding film" },
  // The Filipino headline deliverable: cut on the day, played at the reception.
  { key: "same_day_edit", label: "Same-day edit (SDE)" },
  { key: "prenup_video", label: "Prenup video" },
  { key: "save_the_date", label: "Save-the-date video" },
  { key: "civil_wedding", label: "Civil wedding" },
  { key: "live_streaming", label: "Live streaming" },
  { key: "drone", label: "Drone / aerial" },
  { key: "social_cuts", label: "Social cuts / reels" },
] as const;

// Add a category by adding an entry here.
export const CATEGORY_SERVICES: Record<string, readonly ServiceOption[]> = {
  makeup: MAKEUP_SERVICES,
  photographers: PHOTO_SERVICES,
  videographers: VIDEO_SERVICES,
};

// Every valid service key across all categories (for server-side validation).
export const SERVICE_KEYS = new Set(
  Object.values(CATEGORY_SERVICES).flatMap((list) => list.map((s) => s.key)),
);

const SERVICE_LABEL: Record<string, string> = Object.fromEntries(
  Object.values(CATEGORY_SERVICES).flatMap((list) =>
    list.map((s) => [s.key, s.label]),
  ),
);

// The service options a vendor can pick, for their primary category.
export function servicesFor(category: string | null): readonly ServiceOption[] {
  return (category && CATEGORY_SERVICES[category]) || [];
}

// Resolve a stored key to its display label; pass unknown/legacy strings through.
export function resolveService(v: string): string {
  return SERVICE_LABEL[v] ?? v;
}
