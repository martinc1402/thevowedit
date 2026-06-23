import { formatPrice } from "@/lib/suppliers";

// The differentiator and the #1 thing couples evaluate before contacting a
// vendor — so it leads, in the cream "paper" treatment used for the homepage
// price band. Shows a "from" price (or range) + the typical amount couples spend.
export function PriceBlock({
  priceMin,
  priceMax,
  priceTypical,
  currency,
  priceIncludesScVat,
}: {
  priceMin: number | null;
  priceMax: number | null;
  priceTypical: number | null;
  currency: string;
  priceIncludesScVat: boolean | null;
}) {
  if (priceMin == null && priceMax == null && priceTypical == null) return null;

  const headline =
    priceMin != null && priceMax != null && priceMax > priceMin
      ? `${formatPrice(priceMin, currency)} - ${formatPrice(priceMax, currency)}`
      : priceMin != null
        ? `from ${formatPrice(priceMin, currency)}`
        : priceTypical != null
          ? `around ${formatPrice(priceTypical, currency)}`
          : "";

  return (
    <section
      aria-label="Pricing"
      className="rounded-2xl bg-accent px-6 py-6 text-accent-ink sm:px-8 sm:py-7"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent-ink/65">
        Pricing
      </p>
      <p className="mt-1.5 font-serif text-3xl font-medium leading-none sm:text-4xl">
        {headline}
      </p>
      {priceTypical != null && (priceMin != null || priceMax != null) && (
        <p className="mt-2 text-sm text-accent-ink/80">
          Couples typically spend around{" "}
          <span className="font-semibold">
            {formatPrice(priceTypical, currency)}
          </span>
          .
        </p>
      )}
      {priceIncludesScVat != null && (
        <p className="mt-2 text-xs text-accent-ink/65">
          {priceIncludesScVat
            ? "Rates already include service charge and VAT."
            : "Rates exclude service charge and 12% VAT."}
        </p>
      )}
    </section>
  );
}
