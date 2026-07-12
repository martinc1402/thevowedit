import Image from "next/image";
import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { formatPrice, type Supplier } from "@/lib/suppliers";
import { categories } from "@/lib/content";
import { hasEntourageRate } from "@/lib/category-fields";

const ROLE: Record<string, string> = {
  makeup: "Makeup Artist",
  hair: "Hair Stylist",
  photographers: "Photographer",
  videographers: "Videographer",
  coordinators: "Wedding Coordinator",
  florists: "Florist",
  catering: "Caterer",
};
const LABELS = new Map(categories.map((c) => [c.slug, c.label]));
const roleFor = (slug?: string) =>
  slug ? (ROLE[slug] ?? LABELS.get(slug) ?? slug) : null;

// Browse card. Leads with the photo, then the two numbers a couple compares on:
// the bride rate AND the per-face entourage rate. Showing only "from ₱8,000" is
// what every rival directory does, and it hides most of a Filipino wedding bill.
export function VendorCard({ s }: { s: Supplier }) {
  const cover = s.images[0] ?? null;
  const role = roleFor(s.categories[0]);
  const subtitle = [role, s.location].filter(Boolean).join(" · ");
  const price =
    s.priceMin != null ? `From ${formatPrice(s.priceMin, s.currency)}` : null;
  // Per-FACE is a makeup rate; a photographer must never get "+ ₱X per face".
  const entourage =
    hasEntourageRate(s.categories[0] ?? null) && s.entourageRateMin != null
      ? `+ ${formatPrice(s.entourageRateMin, s.currency)} per face`
      : null;

  return (
    <Link
      href={`/vendors/${s.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_2px_6px_rgba(88,24,36,0.05),0_12px_30px_rgba(88,24,36,0.08)]"
    >
      <div className="relative aspect-[4/3] bg-surface-2">
        {cover ? (
          <Image
            src={cover}
            alt={s.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          // Same deterministic grayscale placeholder the profile gallery uses, so a
          // vendor without photos yet still reads as part of one editorial set.
          <Image
            src={`https://picsum.photos/seed/${encodeURIComponent(`${s.slug}-1`)}/800/600?grayscale`}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-xl font-medium leading-snug text-ink">
            {s.name}
          </h2>
          {s.verified && (
            <SealCheck
              size={17}
              weight="fill"
              className="mt-0.5 shrink-0 text-accent-fg"
              aria-label="Verified by The Vow Edit"
            />
          )}
        </div>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}

        {price && (
          <p className="mt-3 text-sm text-ink">
            <span className="font-medium">{price}</span>
            {entourage && (
              <span className="text-muted"> {entourage}</span>
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
