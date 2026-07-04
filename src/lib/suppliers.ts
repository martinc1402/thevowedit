import { getSupabasePublic } from "@/lib/supabase-public";

// Display a peso amount as e.g. "₱48,000". Currency symbol kept simple (PHP only
// for now); falls back to the raw number for other currencies.
export function formatPrice(amount: number, currency = "PHP"): string {
  const n = new Intl.NumberFormat("en-PH").format(amount);
  return currency === "PHP" ? `₱${n}` : `${currency} ${n}`;
}

// Typed shape of a row in public.suppliers (see supabase/schema.sql). Note this
// is the rich directory row — NOT the legacy `Supplier` type in content.ts
// (that one is a different, static shape).

export type SupplierPackage = {
  name: string;
  priceLabel?: string;
  includes: string[];
};

export type SupplierReview = {
  author: string;
  date?: string; // ISO date
  rating: number;
  quote: string;
};

export type SupplierFaq = {
  q: string;
  a: string;
};

export type SupplierSpec = {
  label: string;
  value: string;
};

export type PerServicePricing = Record<
  string,
  { min?: number; max?: number } | undefined
>;

export type Supplier = {
  id: string;
  slug: string;
  name: string;
  basedIn: string;
  servesAreas: string[];
  categories: string[];
  styleTags: string[];
  priceMin: number | null;
  priceMax: number | null;
  priceTypical: number | null;
  currency: string;
  perServicePricing: PerServicePricing | null;
  shortDescription: string | null;
  description: string | null;
  pricingNotes: string | null;
  priceIncludesScVat: boolean | null;
  bio: string | null;
  verified: boolean;
  featured: boolean;
  rating: number | null;
  reviewCount: number;
  worksWithOverseasCouples: boolean;
  travelFeeNote: string | null;
  responseTimeNote: string | null;
  bookingTerms: string | null;
  availabilityNote: string | null;
  establishedYear: number | null;
  weddingsCount: number | null;
  faq: SupplierFaq[];
  specs: SupplierSpec[];
  instagram: string | null;
  website: string | null;
  facebook: string | null;
  portfolioLink: string | null;
  email: string | null;
  phone: string | null;
  images: string[]; // full public URLs; [0] is the hero
  packages: SupplierPackage[];
  reviews: SupplierReview[];
  videoUrl: string | null;
  teamPhoto: string | null;
  location: string;
  published: boolean;
};

// The columns we select — keep in sync with the row mapper below. Exported so
// the authenticated dashboard (service-role reads in actions/profile.ts) reuses
// the exact same projection + mapper.
export const SUPPLIER_COLUMNS = [
  "id",
  "slug",
  "name",
  "based_in",
  "serves_areas",
  "categories",
  "style_tags",
  "price_min",
  "price_max",
  "price_typical",
  "currency",
  "per_service_pricing",
  "short_description",
  "description",
  "pricing_notes",
  "price_includes_sc_vat",
  "bio",
  "verified",
  "featured",
  "rating",
  "review_count",
  "works_with_overseas_couples",
  "travel_fee_note",
  "response_time_note",
  "booking_terms",
  "availability_note",
  "established_year",
  "weddings_count",
  "faq",
  "specs",
  "instagram",
  "website",
  "facebook",
  "portfolio_link",
  "email",
  "phone",
  "images",
  "packages",
  "reviews",
  "video_url",
  "team_photo",
  "location",
  "published",
].join(", ");

// Postgres rows come back snake_cased and jsonb columns as parsed JSON; map to
// our camelCase type with defensive defaults (arrays/jsonb may be null).
export function mapSupplierRow(r: Record<string, unknown>): Supplier {
  const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    basedIn: (r.based_in as string) ?? "",
    servesAreas: arr(r.serves_areas),
    categories: arr(r.categories),
    styleTags: arr(r.style_tags),
    priceMin: (r.price_min as number) ?? null,
    priceMax: (r.price_max as number) ?? null,
    priceTypical: (r.price_typical as number) ?? null,
    currency: (r.currency as string) ?? "PHP",
    perServicePricing: (r.per_service_pricing as PerServicePricing) ?? null,
    shortDescription: (r.short_description as string) ?? null,
    description: (r.description as string) ?? null,
    pricingNotes: (r.pricing_notes as string) ?? null,
    priceIncludesScVat: (r.price_includes_sc_vat as boolean) ?? null,
    bio: (r.bio as string) ?? null,
    verified: Boolean(r.verified),
    featured: Boolean(r.featured),
    rating: (r.rating as number) ?? null,
    reviewCount: (r.review_count as number) ?? 0,
    worksWithOverseasCouples: Boolean(r.works_with_overseas_couples),
    travelFeeNote: (r.travel_fee_note as string) ?? null,
    responseTimeNote: (r.response_time_note as string) ?? null,
    bookingTerms: (r.booking_terms as string) ?? null,
    availabilityNote: (r.availability_note as string) ?? null,
    establishedYear: (r.established_year as number) ?? null,
    weddingsCount: (r.weddings_count as number) ?? null,
    faq: Array.isArray(r.faq) ? (r.faq as SupplierFaq[]) : [],
    specs: Array.isArray(r.specs) ? (r.specs as SupplierSpec[]) : [],
    instagram: (r.instagram as string) ?? null,
    website: (r.website as string) ?? null,
    facebook: (r.facebook as string) ?? null,
    portfolioLink: (r.portfolio_link as string) ?? null,
    email: (r.email as string) ?? null,
    phone: (r.phone as string) ?? null,
    images: arr(r.images),
    packages: Array.isArray(r.packages) ? (r.packages as SupplierPackage[]) : [],
    reviews: Array.isArray(r.reviews) ? (r.reviews as SupplierReview[]) : [],
    videoUrl: (r.video_url as string) ?? null,
    teamPhoto: (r.team_photo as string) ?? null,
    location: (r.location as string) ?? "Cebu",
    published: Boolean(r.published),
  };
}

// Fetch a single supplier by its public slug. Returns null when not found.
export async function getSupplierBySlug(slug: string): Promise<Supplier | null> {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("suppliers")
    .select(SUPPLIER_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("[suppliers] getSupplierBySlug failed:", error.message);
    return null;
  }
  if (!data) return null;
  return mapSupplierRow(data as unknown as Record<string, unknown>);
}

// All supplier slugs — for generateStaticParams / sitemap later.
export async function listSupplierSlugs(): Promise<string[]> {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("suppliers")
    .select("slug")
    .eq("published", true);
  if (error) {
    console.error("[suppliers] listSupplierSlugs failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => String((r as unknown as { slug: string }).slug));
}
