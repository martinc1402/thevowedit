import { SealCheck, MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import { categories } from "@/lib/content";

const LABELS = new Map(categories.map((c) => [c.slug, c.label]));
const labelFor = (slug: string) => LABELS.get(slug) ?? slug;

// The supplier name, rendered above the gallery (Airbnb-style title hierarchy).
export function SupplierTitle({ name }: { name: string }) {
  return (
    <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
      {name}
    </h1>
  );
}

// Supporting metadata, rendered below the gallery: category chips + Verified
// badge, then location + rating.
export function SupplierMeta({
  categories: cats,
  verified,
  basedIn,
  servesAreas,
  rating,
  reviewCount,
  styleTags = [],
}: {
  categories: string[];
  verified: boolean;
  basedIn: string;
  servesAreas: string[];
  rating: number | null;
  reviewCount: number;
  styleTags?: string[];
}) {
  const areas = servesAreas.length ? servesAreas.join(", ") : basedIn;
  return (
    <div>
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

      {/* Style tags: a quieter, ghost chip row distinct from the filled
          category chips — how couples self-select on aesthetic. */}
      {styleTags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {styleTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-line px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
