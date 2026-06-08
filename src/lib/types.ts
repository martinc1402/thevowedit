// =====================================================================
// SHARED SUPPLIER TYPES
// The `Listing` shape is the contract between the data layer (Supabase,
// see suppliers.ts) and every consumer (directory.ts, cards, the /supplier
// profile). Rows from the `suppliers` table are mapped into this exact shape
// by `rowToListing`, so components never change when the data source does.
// =====================================================================

/** Our four core filter areas. A supplier's `basedIn` is usually one of these,
 *  but `basedIn`/`servesAreas` are free text so real submissions outside this
 *  set (e.g. "Bantayan Island") are kept rather than dropped. */
export type SubLocation = "Cebu City" | "Mactan" | "Lapu-Lapu" | "Mandaue";

export type GalleryImage = { src: string; alt: string };

export type SupplierPackage = {
  name: string;
  priceLabel?: string; // e.g. "₱60k" — optional; the range alone is enough
  includes: string[];
};

export type SupplierContact = {
  email?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
};

export type SupplierReview = {
  author: string;
  date?: string;
  rating: number; // 0–5
  quote: string;
};

/** Per-service price range, keyed by category slug. */
export type CategoryPrice = { min: number; max: number };

export type Listing = {
  id: string;
  slug: string; // permanent public URL — generated once, never re-derived from name
  name: string;
  categories: string[]; // category slugs a supplier belongs to, e.g. ["photographers", "videographers"]
  location: string; // province / area label, e.g. "Cebu"
  priceMin: number; // PHP — overall span across services (min of all service mins)
  priceMax: number; // PHP — overall span across services (max of all service maxes)
  // Optional per-service ranges. Single-service suppliers omit this and their
  // priceMin/priceMax IS the range. Dual-service suppliers carry one entry per
  // category so each listing page can show the price for that page's service.
  pricing?: Record<string, CategoryPrice>;
  currency: "PHP";
  rating: number; // 0–5
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  heroImage: string; // listing-card image ("" → neutral tile)
  alt: string; // descriptive alt text for the hero image
  shortDescription: string; // listing-card blurb
  styleTags: string[];

  // ---- Location model ----
  // Where the supplier is based (their single home area). Usually one of our
  // core filter areas, but stored as free text so real submissions aren't forced.
  basedIn: string;
  // Every area the supplier will work in — supplier-declared, vetting-confirmed.
  // May include the base area and may list areas outside our core filter set
  // (free text, e.g. "Bantayan Island"); those are kept, they just don't have
  // their own filter/page yet. A category-area page shows a supplier when this
  // array INCLUDES that area, so travelling suppliers surface there too.
  servesAreas: string[];
  // Optional, transparent note shown when the supplier may charge to travel.
  // Free text only — there is no fee calculation anywhere.
  travelFeeNote?: string;

  // ---- Profile-only fields (optional; profile degrades gracefully without them) ----
  description?: string; // longer "About" copy; falls back to shortDescription
  gallery?: GalleryImage[]; // portfolio images
  contact?: SupplierContact; // reserved for the direct-contact routing option
  packages?: SupplierPackage[]; // optional named packages; range stands alone if absent
  worksWithOverseasCouples?: boolean; // balikbayan/overseas affordance; tag shown when true
  reviews?: SupplierReview[]; // real reviews only; section hides entirely when empty
  videoUrl?: string; // optional YouTube/Vimeo reel; player slot renders only when present
  teamPhoto?: string; // optional "meet your supplier" photo; block hides when absent
  bio?: string; // optional short personal intro (distinct from `description`)
};
