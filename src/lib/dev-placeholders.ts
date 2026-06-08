// =====================================================================
// DEV PLACEHOLDER IMAGES — remove before launch.
// -----------------------------------------------------------------
// While the directory is seeded with suppliers whose real photos don't
// exist yet, listing cards would render as empty neutral tiles and the
// grid looks unpopulated. In development we fall back to a small set of
// LOCAL, on-brand Cebu wedding photos (already bundled under /public)
// so the grid reads as a real directory. These are NOT supplier work —
// they are generic setting shots and must never ship to production as if
// they were. The flag below is OFF in production builds automatically.
// =====================================================================

/**
 * ON in dev, OFF in production builds (NODE_ENV is inlined at build time, so
 * production output never references the placeholders). Flip the right-hand
 * side to `false` to preview the production empty-tile behavior locally.
 */
export const USE_DEV_PLACEHOLDER_IMAGES = process.env.NODE_ENV !== "production";

/**
 * Local, on-brand wedding setting photos reused from the homepage assets.
 * Neutral venue/scene shots (not portfolios), so they read as placeholders
 * rather than a specific supplier's work. 3-5 images cycled by seed.
 */
const PLACEHOLDER_IMAGES = [
  "/images/cebu/type-beach.jpg",
  "/images/cebu/type-garden.jpg",
  "/images/cebu/type-church.jpg",
  "/images/cebu/type-ballroom.jpg",
  "/images/cebu/category-venues.jpg",
] as const;

/**
 * Pick a stable placeholder for a given seed (e.g. a supplier slug) so the same
 * card always shows the same image — deterministic on server and client, which
 * keeps SSR/hydration consistent and the grid visually stable across renders.
 */
export function placeholderFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[index];
}
