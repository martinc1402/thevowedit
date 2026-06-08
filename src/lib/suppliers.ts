// Maps a raw `suppliers` row (snake_case, from Supabase) into the camelCase
// `Listing` shape the whole app already expects. Keeping this mapping in one
// place means the components and directory helpers never change — they keep
// receiving the same-shaped data they did from the old mock file.
import type {
  Listing,
  SupplierContact,
  SupplierPackage,
  SupplierReview,
  CategoryPrice,
} from "@/lib/types";

/** One row of public.suppliers exactly as Supabase returns it. */
export type SupplierRow = {
  id: string;
  slug: string;
  name: string;
  based_in: string;
  serves_areas: string[] | null;
  categories: string[] | null;
  style_tags: string[] | null;
  price_min: number | null;
  price_max: number | null;
  currency: string | null;
  per_service_pricing: Record<string, CategoryPrice> | null;
  short_description: string | null;
  description: string | null;
  verified: boolean | null;
  featured: boolean | null;
  rating: number | null;
  review_count: number | null;
  works_with_overseas_couples: boolean | null;
  travel_fee_note: string | null;
  instagram: string | null;
  website: string | null;
  facebook: string | null;
  portfolio_link: string | null;
  email: string | null;
  phone: string | null;
  images: string[] | null;
  packages: SupplierPackage[] | null;
  reviews: SupplierReview[] | null;
  location: string | null;
  video_url: string | null;
  team_photo: string | null;
  bio: string | null;
};

// Singular nouns for synthesized image alt text, so a card image reads like
// "Emm Tancinco Photography, wedding photographer in Cebu City, Cebu" — matching
// the wording the old hand-written alt strings used.
const SINGULAR_NOUN: Record<string, string> = {
  photographers: "photographer",
  videographers: "videographer",
  hmua: "hair & makeup artist",
  catering: "caterer",
  florists: "florist",
  coordinators: "coordinator",
  venues: "venue",
  cakes: "cake designer",
  "content-creators": "content creator",
};

export function rowToListing(row: SupplierRow): Listing {
  const images = row.images ?? [];
  const categories = row.categories ?? [];
  const location = row.location ?? "Cebu";
  const noun = SINGULAR_NOUN[categories[0]] ?? "supplier";
  const alt = `${row.name}, wedding ${noun} in ${row.based_in}, ${location}`;

  // Contact is omitted entirely when no channel is set (profile hides the block).
  const contactFields: SupplierContact = {};
  if (row.email) contactFields.email = row.email;
  if (row.phone) contactFields.phone = row.phone;
  if (row.website) contactFields.website = row.website;
  if (row.instagram) contactFields.instagram = row.instagram;
  if (row.facebook) contactFields.facebook = row.facebook;
  const contact =
    Object.keys(contactFields).length > 0 ? contactFields : undefined;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categories,
    location,
    priceMin: row.price_min ?? 0,
    priceMax: row.price_max ?? 0,
    pricing: row.per_service_pricing ?? undefined,
    currency: (row.currency ?? "PHP") as "PHP",
    rating: row.rating ?? 0, // null rating treated as 0 (UI only shows it when reviewCount > 0)
    reviewCount: row.review_count ?? 0,
    verified: !!row.verified,
    featured: !!row.featured,
    heroImage: images[0] ?? "", // "" → SafeImage shows the neutral placeholder tile
    alt,
    shortDescription: row.short_description ?? "",
    styleTags: row.style_tags ?? [],
    basedIn: row.based_in,
    servesAreas: row.serves_areas ?? [],
    travelFeeNote: row.travel_fee_note ?? undefined,
    description: row.description ?? undefined,
    gallery:
      images.length > 0
        ? images.map((src, i) => ({ src, alt: `${row.name} photo ${i + 1}` }))
        : undefined,
    contact,
    packages: row.packages ?? undefined,
    worksWithOverseasCouples: !!row.works_with_overseas_couples,
    reviews: row.reviews ?? undefined,
    videoUrl: row.video_url ?? undefined,
    teamPhoto: row.team_photo ?? undefined,
    bio: row.bio ?? undefined,
  };
}
