import {
  buildEssentialsRows,
  type EssentialsData,
} from "@/lib/essentials-taxonomy";

// "The essentials": the practical facts a couple weighs before enquiring. The
// rows come entirely from the structured essentials taxonomy — formatters turn
// structured values (enums / numbers / booleans) into display strings, ordered
// per the vendor's category and capped. This component only renders the rows;
// all field logic lives in lib/essentials-taxonomy.ts.
export function SupplierEssentials({
  priceMin,
  priceMax,
  priceTypical,
  currency,
  priceUnit,
  category,
  essentials,
}: {
  priceMin: number | null;
  priceMax: number | null;
  priceTypical: number | null;
  currency: string;
  priceUnit: string | null;
  category: string | null;
  essentials: EssentialsData | null;
}) {
  const rows = buildEssentialsRows({
    priceMin,
    priceMax,
    priceTypical,
    currency,
    priceUnit,
    category,
    essentials,
  });

  if (!rows.length) return null;

  return (
    <section aria-labelledby="essentials-heading">
      <h2
        id="essentials-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        The essentials
      </h2>
      {/* Stacked label/value cells in a two-column grid, each opened by a single
          hairline — an editorial spec sheet rather than boxed cards. */}
      <dl className="mt-6 grid gap-x-12 sm:grid-cols-2">
        {rows.map((it, i) => (
          <div key={`${it.label}-${i}`} className="border-t border-line py-4 sm:py-5">
            <dt className="text-sm text-muted">{it.label}</dt>
            <dd className="mt-1 text-base font-medium text-ink">{it.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
