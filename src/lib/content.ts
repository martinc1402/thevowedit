/**
 * Sample content for The Vow Edit homepage.
 * Numbers are indicative ranges for display, not quotes. Swap picsum seeds for real photos.
 */

export type Category = {
  slug: string;
  label: string;
  href: string;
  blurb: string;
  /** Local photo under /public/images/cebu/. Drop a file at this path to fill the tile. */
  image: string;
  /** Cebu-specific alt text describing the supplier (SEO + a11y). */
  alt: string;
};

/** Core supplier categories. Tiles + search select + footer matrix all read from this. */
export const categories: Category[] = [
  { slug: "photographers", label: "Photographers", href: "/photographers/cebu", blurb: "Full-day & elopement coverage", image: "/images/cebu/category-photographers.jpg", alt: "Wedding photographer in Cebu" },
  { slug: "hmua", label: "Hair & Makeup", href: "/hmua/cebu", blurb: "Bridal HMUA & entourage", image: "/images/cebu/category-hmua.jpg", alt: "Hair and makeup artist in Cebu" },
  { slug: "catering", label: "Catering", href: "/catering/cebu", blurb: "Plated, buffet & grazing", image: "/images/cebu/category-catering.jpg", alt: "Wedding catering in Cebu" },
  { slug: "venues", label: "Venues", href: "/venues/cebu", blurb: "Beach, garden, ballroom", image: "/images/cebu/category-venues.jpg", alt: "Wedding venue in Cebu" },
  { slug: "florists", label: "Florists", href: "/florists/cebu", blurb: "Bouquets & installations", image: "/images/cebu/category-florists.jpg", alt: "Wedding florist in Cebu" },
  { slug: "coordinators", label: "Coordinators", href: "/coordinators/cebu", blurb: "On-the-day to full planning", image: "/images/cebu/category-coordinators.jpg", alt: "Wedding coordinator in Cebu" },
  { slug: "videographers", label: "Videographers", href: "/videographers/cebu", blurb: "Films & same-day edits", image: "/images/cebu/category-videographers.jpg", alt: "Wedding videographer in Cebu" },
  { slug: "cakes", label: "Cakes", href: "/cakes/cebu", blurb: "Tiered & dessert tables", image: "/images/cebu/category-cakes.jpg", alt: "Wedding cake in Cebu" },
  { slug: "content-creators", label: "Content creators", href: "/content-creators/cebu", blurb: "Reels, TikTok & same-day social", image: "/images/cebu/category-content-creators-v2.jpg", alt: "Wedding content creator in Cebu" },
];

export type CategoryCopy = {
  noun: string;
  intro: (location: string) => string;
};

// Per-category SEO copy for the directory pages (static, not supplier data).
// Only photographers is fleshed out for the MVP; every other category falls back
// to a generated line in resolveCategoryCopy() (see directory.ts).
export const categoryCopy: Record<string, CategoryCopy> = {
  photographers: {
    noun: "Wedding photographers",
    intro: (loc) =>
      `Compare wedding photographers across ${loc}, with real package prices shown upfront, not "inquire for a quote." Full-day coverage here typically runs ₱35k to ₱120k depending on team size, hours, and the album and film deliverables you choose.`,
  },
  "content-creators": {
    noun: "Wedding content creators",
    intro: (loc) =>
      `Find wedding content creators across ${loc} for social-first coverage: vertical Reels, TikToks, same-day clips, and candid photo dumps, often delivered the night of. A different service from a cinematic videographer, with prices shown upfront. We are adding more creators in this area soon.`,
  },
};

/** Categories shown in the hero search dropdown. */
export const searchCategories = categories.map((c) => ({ value: c.slug, label: c.label }));

export type PriceRange = {
  category: string;
  low: string;
  high: string;
  unit: string;
};

/** Indicative Cebu price ranges for the transparency band. Not quotes. */
export const priceRanges: PriceRange[] = [
  { category: "Photography", low: "35k", high: "120k", unit: "full-day coverage" },
  { category: "Catering", low: "850", high: "1,800", unit: "per head, plated" },
  { category: "Venue rental", low: "60k", high: "250k", unit: "ceremony + reception" },
  { category: "Hair & makeup", low: "8k", high: "30k", unit: "bride + entourage" },
  { category: "Coordination", low: "45k", high: "150k", unit: "on-the-day to full plan" },
];

export type WeddingType = {
  label: string;
  tagline: string;
  href: string;
  /** Local photo under /public/images/cebu/. Drop a file at this path to fill the tile. */
  image: string;
  /** Cebu-specific alt text describing the setting (SEO + a11y). */
  alt: string;
};

export const weddingTypes: WeddingType[] = [
  { label: "Beach & Mactan", tagline: "Island resorts and shoreline ceremonies", href: "/weddings/beach-cebu", image: "/images/cebu/type-beach.jpg", alt: "Beach wedding in Mactan, Cebu" },
  { label: "Garden", tagline: "Highland estates above the city", href: "/weddings/garden-cebu", image: "/images/cebu/type-garden.jpg", alt: "Garden wedding in Cebu" },
  { label: "Church", tagline: "Heritage cathedrals and chapels", href: "/weddings/church-cebu", image: "/images/cebu/type-church.jpg", alt: "Church wedding in Cebu" },
  { label: "Hotel ballroom", tagline: "City receptions, fully styled", href: "/weddings/ballroom-cebu", image: "/images/cebu/type-ballroom.jpg", alt: "Hotel ballroom wedding in Cebu" },
];

export type Supplier = {
  name: string;
  category: string;
  area: string;
  from: string;
  rating: number;
  reviews: number;
  slug: string;
  seed: string;
};

/**
 * Real, verified suppliers only. Empty until we have live listings — the
 * Featured Suppliers section hides itself while this is empty (no placeholders
 * ship to production). Drop entries in this shape to light the section back up:
 *
 *   { name: "Lumière Studios", category: "Photography", area: "Lahug, Cebu City",
 *     from: "₱48,000", rating: 4.9, reviews: 132, slug: "lumiere-studios",
 *     seed: "cebu-fine-art-wedding-photo" },
 */
export const featuredSuppliers: Supplier[] = [];

export type RealWedding = {
  couple: string;
  setting: string;
  location: string;
  slug: string;
  seed: string;
  /** grid emphasis for the editorial collage */
  tall?: boolean;
  wide?: boolean;
};

/**
 * Real published weddings only. Empty until we have shoots cleared to feature —
 * the Real Weddings section hides itself while this is empty. Drop entries in
 * this shape (set `tall` / `wide` to vary the collage rhythm):
 *
 *   { couple: "Maia & Rendell", setting: "Beachfront", location: "Mactan",
 *     slug: "maia-rendell", seed: "beach-wedding-couple-sunset", tall: true },
 */
export const realWeddings: RealWedding[] = [];

export type Stat = {
  value: string;
  label: string;
};

/**
 * Real platform metrics only — never invented numbers. Empty until we can pull
 * live counts; the stats band hides while this is empty. Shape to fill:
 *
 *   { value: "412", label: "verified suppliers" }
 */
export const trustStats: Stat[] = [];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

/**
 * Real couple testimonials only (with consent). Empty until we have them — the
 * testimonials grid hides while this is empty. Shape to fill:
 *
 *   { quote: "...", name: "Patricia Alcantara", role: "Married in Mactan, 2025" }
 */
export const testimonials: Testimonial[] = [];

/** Footer SEO matrix: category x location. */
export const footerLocations = [
  { label: "Cebu City", slug: "cebu" },
  { label: "Mactan", slug: "mactan" },
  { label: "Lapu-Lapu", slug: "lapu-lapu" },
  { label: "Mandaue", slug: "mandaue" },
];

export const footerCategories = categories.map((c) => ({ slug: c.slug, label: c.label }));

// Footer secondary links. Only links to REAL, built pages belong here so the
// footer never ships a dead end. The Guides and Company links below pointed to
// pages that do not exist yet, so they were removed; restore an entry here once
// its page is live and it will render again automatically.
//
// Removed (unbuilt) targets, kept for easy restore:
//   Guides:  /guides/cebu-wedding-cost, /guides/beach-vs-garden,
//            /guides/destination-checklist, /guides/12-month-timeline
//   Company: /about, /for-suppliers, /budget-calculator (removed from homepage),
//            /contact
export const footerGuides: { label: string; href: string }[] = [];

export const footerCompany: { label: string; href: string }[] = [];
