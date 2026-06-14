import { SealCheck, MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import { categories } from "@/lib/content";

const LABELS = new Map(categories.map((c) => [c.slug, c.label]));
const labelFor = (slug: string) => LABELS.get(slug) ?? slug;

export function SupplierHeader({
  name,
  categories: cats,
  verified,
  basedIn,
  servesAreas,
  rating,
  reviewCount,
}: {
  name: string;
  categories: string[];
  verified: boolean;
  basedIn: string;
  servesAreas: string[];
  rating: number | null;
  reviewCount: number;
}) {
  const areas = servesAreas.length ? servesAreas.join(", ") : basedIn;
  return (
    <header>
      <div className="flex flex-wrap items-center gap-2">
        {cats.map((slug) => (
          <span
            key={slug}
            className="inline-flex items-center rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-muted"
          >
            {labelFor(slug)}
          </span>
        ))}
        {verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-ink">
            <SealCheck size={14} weight="fill" />
            Verified
          </span>
        )}
      </div>

      <h1 className="mt-3 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
        {name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={16} weight="fill" className="text-accent-fg" />
          {areas}
        </span>
        {rating != null && rating > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Star size={16} weight="fill" className="text-accent-fg" />
            <span className="font-medium text-ink">{rating.toFixed(1)}</span>
            {reviewCount > 0 && (
              <span>
                ({reviewCount} review{reviewCount === 1 ? "" : "s"})
              </span>
            )}
          </span>
        )}
      </div>
    </header>
  );
}
