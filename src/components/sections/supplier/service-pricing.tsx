import { formatPrice, type PerServicePricing } from "@/lib/suppliers";
import { categories } from "@/lib/content";

const LABELS = new Map(categories.map((c) => [c.slug, c.label]));
const labelFor = (slug: string) => LABELS.get(slug) ?? slug;

// Optional per-category rate breakdown for suppliers who price more than one
// service (e.g. a studio offering both photo and video). Sits directly under
// the headline price band; hides entirely when there is no usable data.
export function ServicePricing({
  perServicePricing,
  currency,
}: {
  perServicePricing: PerServicePricing | null;
  currency: string;
}) {
  if (!perServicePricing) return null;

  const rows = Object.entries(perServicePricing).filter(
    ([, v]) => v && (v.min != null || v.max != null),
  );
  if (!rows.length) return null;

  const rangeFor = (v: { min?: number; max?: number }) => {
    if (v.min != null && v.max != null && v.max > v.min)
      return `${formatPrice(v.min, currency)} - ${formatPrice(v.max, currency)}`;
    if (v.min != null) return `from ${formatPrice(v.min, currency)}`;
    return `up to ${formatPrice(v.max as number, currency)}`;
  };

  return (
    <dl className="mt-3 divide-y divide-line border-t border-line">
      {rows.map(([slug, v]) => (
        <div key={slug} className="flex items-center justify-between gap-4 py-3">
          <dt className="text-sm text-muted">{labelFor(slug)}</dt>
          <dd className="text-sm font-medium text-ink">{rangeFor(v!)}</dd>
        </div>
      ))}
    </dl>
  );
}
