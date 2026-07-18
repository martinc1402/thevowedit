import { getSupabasePublic } from "@/lib/supabase-public";
import type { EssentialsData } from "@/lib/essentials-taxonomy";

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

// Curator-authored highlight chip on the "Why we picked" editorial block.
export type EditorHighlight = {
  label: string;
  value: string;
};

// Draft values for approval-required vendor edits, awaiting admin review. Keyed
// by DB column (so approval is a direct copy to the live row), plus
// `essentials_custom` (custom-essentials drafts merged into live essentials on
// approval). Populated only via the service role — never in the public projection.
export type PendingChanges = {
  name?: string;
  short_description?: string | null;
  description?: string | null;
  bio?: string | null;
  team_photo?: string | null;
  video_url?: string | null;
  faq?: SupplierFaq[];
  images?: string[];
  essentials_custom?: { label: string; value: string }[];
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
  // Per-FACE entourage rate, distinct from priceMin (the bride rate).
  entourageRateMin: number | null;
  entourageRateMax: number | null;
  currency: string;
  perServicePricing: PerServicePricing | null;
  shortDescription: string | null;
  description: string | null;
  // Curator-authored editorial fields (The Vow Edit voice), all nullable.
  editorialTagline: string | null;
  editorNote: string | null;
  editorHighlights: EditorHighlight[];
  services: string[];
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
  email: string | null;
  phone: string | null;
  // Direct-contact channels + the vendor's preferred primary channel key.
  viber: string | null;
  whatsapp: string | null;
  preferredChannel: string | null;
  // Structured capacity for "The essentials" (solo vs team). DEPRECATED — the
  // structured essentials taxonomy below supersedes these for the essentials
  // block. Kept for now (still writable); no longer read by SupplierEssentials.
  worksWith: string | null; // 'solo' | 'team'
  groupCapacity: number | null;
  // Structured "essentials" taxonomy (see lib/essentials-taxonomy.ts) + price unit.
  essentials: EssentialsData | null;
  priceUnit: string | null; // 'per_event' | 'per_head' | 'per_hour'
  images: string[]; // full public URLs; [0] is the hero
  // Per-photo crop anchor keyed by image URL: [x, y] in 0-100 percent. Applied as
  // object-position wherever the image is cover-cropped. Absent url = centre.
  imageFocus: Record<string, [number, number]>;
  packages: SupplierPackage[];
  reviews: SupplierReview[];
  videoUrl: string | null;
  teamPhoto: string | null;
  location: string;
  published: boolean;
  // Service-role only (never in the public projection): approval-required drafts.
  pendingChanges: PendingChanges | null;
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
  "editorial_tagline",
  "editor_note",
  "editor_highlights",
  "services",
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

// Newer contact columns kept separate from SUPPLIER_COLUMNS so a public read can
// gracefully fall back to the base projection if the migration
// (supabase/add-contact-channels.sql) has not been applied yet.
export const CONTACT_CHANNEL_COLUMNS = "viber, whatsapp, preferred_channel";

// Structured makeup-artist essentials columns, also fetched via the resilient
// fallback so the page keeps working before supabase/add-mua-essentials.sql runs.
export const MUA_ESSENTIALS_COLUMNS = "works_with, group_capacity";

// Structured essentials taxonomy columns (see supabase/add-essentials-taxonomy.sql),
// also fetched via the resilient fallback.
export const TAXONOMY_COLUMNS = "essentials, price_unit";

// Per-face entourage rate (see supabase/add-entourage-rate.sql). Kept out of the
// base projection ON PURPOSE: if it went there, every public read would fail until
// that migration is applied.
export const ENTOURAGE_COLUMNS = "entourage_rate_min, entourage_rate_max";

// Per-photo focal points (supabase/add-image-focus.sql). Optional group so a public
// read degrades gracefully if the migration has not been applied yet.
export const IMAGE_FOCUS_COLUMNS = "image_focus";

// TIERED projections, newest first. A missing column fails the WHOLE query, so the
// retry must drop ONE migration's columns at a time.
//
// This used to be a single "full -> base" fallback, which was fine while only one
// optional group existed. With two, an unapplied entourage migration collapsed the
// read all the way to the base projection and silently took `essentials` (and the
// contact channels) with it — the profile rendered with no Specialties row and the
// browse filters matched nothing. Degrade one step at a time instead.
const PROJECTIONS = [
  `${SUPPLIER_COLUMNS}, ${CONTACT_CHANNEL_COLUMNS}, ${MUA_ESSENTIALS_COLUMNS}, ${TAXONOMY_COLUMNS}, ${ENTOURAGE_COLUMNS}, ${IMAGE_FOCUS_COLUMNS}`,
  `${SUPPLIER_COLUMNS}, ${CONTACT_CHANNEL_COLUMNS}, ${MUA_ESSENTIALS_COLUMNS}, ${TAXONOMY_COLUMNS}, ${ENTOURAGE_COLUMNS}`,
  `${SUPPLIER_COLUMNS}, ${CONTACT_CHANNEL_COLUMNS}, ${MUA_ESSENTIALS_COLUMNS}, ${TAXONOMY_COLUMNS}`,
  SUPPLIER_COLUMNS,
];

type QueryResult<T> = { data: T | null; error: { message: string } | null };

// Run `q` against each projection until one succeeds.
export async function withProjectionFallback<T>(
  q: (columns: string) => PromiseLike<QueryResult<T>>,
): Promise<QueryResult<T>> {
  let last: QueryResult<T> = { data: null, error: { message: "no projection" } };
  for (const columns of PROJECTIONS) {
    last = await q(columns);
    if (!last.error) return last;
  }
  return last;
}

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
    entourageRateMin: (r.entourage_rate_min as number) ?? null,
    entourageRateMax: (r.entourage_rate_max as number) ?? null,
    currency: (r.currency as string) ?? "PHP",
    perServicePricing: (r.per_service_pricing as PerServicePricing) ?? null,
    shortDescription: (r.short_description as string) ?? null,
    description: (r.description as string) ?? null,
    editorialTagline: (r.editorial_tagline as string) ?? null,
    editorNote: (r.editor_note as string) ?? null,
    editorHighlights: Array.isArray(r.editor_highlights)
      ? (r.editor_highlights as EditorHighlight[])
      : [],
    services: arr(r.services),
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
    email: (r.email as string) ?? null,
    phone: (r.phone as string) ?? null,
    viber: (r.viber as string) ?? null,
    whatsapp: (r.whatsapp as string) ?? null,
    preferredChannel: (r.preferred_channel as string) ?? null,
    worksWith: (r.works_with as string) ?? null,
    groupCapacity: (r.group_capacity as number) ?? null,
    essentials: (r.essentials as EssentialsData) ?? null,
    priceUnit: (r.price_unit as string) ?? null,
    images: arr(r.images),
    imageFocus:
      r.image_focus && typeof r.image_focus === "object" && !Array.isArray(r.image_focus)
        ? (r.image_focus as Record<string, [number, number]>)
        : {},
    packages: Array.isArray(r.packages) ? (r.packages as SupplierPackage[]) : [],
    reviews: Array.isArray(r.reviews) ? (r.reviews as SupplierReview[]) : [],
    videoUrl: (r.video_url as string) ?? null,
    teamPhoto: (r.team_photo as string) ?? null,
    location: (r.location as string) ?? "Cebu",
    published: Boolean(r.published),
    // Only present when a service-role query explicitly selects pending_changes;
    // the public projection omits it, so anon reads map this to null.
    pendingChanges: (r.pending_changes as PendingChanges) ?? null,
  };
}

// Fetch a single supplier by its public slug. Returns null when not found.
export async function getSupplierBySlug(slug: string): Promise<Supplier | null> {
  const supabase = getSupabasePublic();

  // Degrades one migration at a time (see withProjectionFallback): an unapplied
  // migration must not take `essentials` down with it.
  const { data, error } = await withProjectionFallback((columns) =>
    supabase
      .from("suppliers")
      .select(columns)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle(),
  );

  if (error) {
    console.error("[suppliers] getSupplierBySlug failed:", error.message);
    return null;
  }
  if (!data) return null;
  return mapSupplierRow(data as unknown as Record<string, unknown>);
}

// The filters the browse page understands. Ordered by how couples actually search:
// where → what it costs → how it's done → can they do my entourage → are they free.
export type VendorFilters = {
  category?: string; // content.ts slug
  area?: string; // AreaKey
  budgetMax?: number; // starting-rate ceiling
  bookingStatus?: string; // BookingStatusKey
  // Category-specific. Applied ONLY when the matching category is selected — these
  // read keys out of `essentials.categoryFields`, and a photographer has no
  // `techniques` and no `groupMaxFaces`, so applying them directory-wide silently
  // excluded every non-makeup vendor.
  technique?: string; // makeup
  minFaces?: number; // makeup
  minHours?: number; // photo / video
  sameDayEdit?: boolean; // video
};

// Published vendors matching the filters.
//
// Area and budget are pushed into Postgres: `serves_areas` is GIN-indexed
// (suppliers_serves_areas_gin) and is now DERIVED from the coverage chips, so a
// contains-query is both fast and truthful. Everything else lives inside the
// `essentials` jsonb and is filtered in memory afterwards.
//
// In-memory is the right call at this size and avoids contorting jsonb predicates
// through PostgREST. It stops being right in the low hundreds of vendors; the fix
// then is a derived, GIN-indexed `facets text[]` column written on save (the same
// trick serves_areas already uses), not a smarter query here.
export async function listPublishedSuppliers(
  f: VendorFilters = {},
): Promise<Supplier[]> {
  const supabase = getSupabasePublic();

  const { data, error } = await withProjectionFallback((columns) => {
    let q = supabase.from("suppliers").select(columns).eq("published", true);
    if (f.category) q = q.contains("categories", [f.category]);
    if (f.area) q = q.contains("serves_areas", [f.area]);
    if (f.budgetMax != null) q = q.lte("price_min", f.budgetMax);
    return q;
  });

  if (error) {
    console.error("[suppliers] listPublishedSuppliers failed:", error.message);
    return [];
  }

  const rows = (data ?? []).map((r) =>
    mapSupplierRow(r as unknown as Record<string, unknown>),
  );

  return rows.filter((s) => {
    const cf = (s.essentials?.categoryFields ?? {}) as Record<string, unknown>;
    const nums = (v: unknown) => (typeof v === "number" ? v : 0);
    const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);

    if (
      f.bookingStatus &&
      s.essentials?.bookingStatus?.status !== f.bookingStatus
    ) {
      return false;
    }
    if (f.technique && !list(cf.techniques).includes(f.technique)) return false;
    if (f.minFaces != null && nums(cf.groupMaxFaces) < f.minFaces) return false;
    if (f.minHours != null && nums(cf.coverageHours) < f.minHours) return false;
    if (f.sameDayEdit && cf.sameDayEdit !== true) return false;
    return true;
  });
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
