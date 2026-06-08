import Link from "next/link";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { PriceRange } from "@/components/directory/price-range";
import { VerifiedBadge, FeaturedBadge } from "@/components/directory/badges";
import { SafeImage } from "@/components/directory/safe-image";
import {
  getCategoryPrice,
  serviceLabel,
  condensedServiceAreas,
  showsTravelFee,
} from "@/lib/directory";
import {
  USE_DEV_PLACEHOLDER_IMAGES,
  placeholderFor,
} from "@/lib/dev-placeholders";
import type { Listing } from "@/lib/types";

export function ListingCard({
  listing: l,
  categorySlug,
  locationSlug,
}: {
  listing: Listing;
  categorySlug: string; // the page's category — price shown is for this service
  locationSlug: string; // the page's area — drives the travel-fee note + ordering
}) {
  const price = getCategoryPrice(l, categorySlug);
  const areas = condensedServiceAreas(l, 2);
  const travelFee = showsTravelFee(l, locationSlug);
  const hasRating = l.reviewCount > 0;
  // Dev-only: fill empty/broken card images with a local on-brand placeholder so
  // the grid looks populated. Off in production (clean neutral tile instead).
  const fallbackSrc = USE_DEV_PLACEHOLDER_IMAGES
    ? placeholderFor(l.slug)
    : undefined;
  return (
    <Link href={`/supplier/${l.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_18px_44px_-24px_rgba(20,16,12,0.45)]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
          <SafeImage
            src={l.heroImage}
            fallbackSrc={fallbackSrc}
            alt={l.alt}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {l.verified && <VerifiedBadge className="absolute left-3 top-3 shadow-sm" />}
          {l.featured && <FeaturedBadge className="absolute right-3 top-3 shadow-sm" />}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl font-medium leading-tight text-ink sm:text-2xl">
              {l.name}
            </h3>
            {/* Rating only when there are real reviews — no empty stars, no "0.0". */}
            {hasRating && (
              <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm text-ink">
                <Star size={15} weight="fill" className="text-accent-fg" />
                {l.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Base + condensed service areas. Travelling suppliers read clearly
              even with a dozen areas: base, then a couple named, then "+N more". */}
          <p className="mt-1 text-sm text-muted">
            <span className="text-ink">Based in {l.basedIn}</span>
            {areas.hasOthers && (
              <>
                {" · also serves "}
                {areas.named.join(", ")}
                {areas.remaining > 0 && ` +${areas.remaining} more`}
              </>
            )}
          </p>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {l.shortDescription}
          </p>

          {l.styleTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {l.styleTags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Price range — always visible, labelled with this page's service so
              the figure is never ambiguous on a multi-service supplier. */}
          <div className="mt-auto pt-5">
            <p className="text-xs text-muted">{serviceLabel(categorySlug)} package</p>
            <PriceRange min={price.min} max={price.max} className="mt-0.5 block text-2xl" />
            {/* Transparent heads-up when this area is outside the supplier's base. */}
            {travelFee && (
              <p className="mt-1 text-xs text-muted">Travel fee may apply</p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
