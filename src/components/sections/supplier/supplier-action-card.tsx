import { ChatCircle, SealCheck, ClockCountdown } from "@phosphor-icons/react/dist/ssr";
import { formatPrice, type PerServicePricing } from "@/lib/suppliers";
import { ServicePricing } from "@/components/sections/supplier/service-pricing";
import { SupplierAvailability } from "@/components/sections/supplier/supplier-availability";

// The persistent action card: price + availability + the primary contact CTA,
// always in view in the desktop sticky rail (and in-flow near the top on mobile).
// Keeps the two things couples decide on — price and how to reach out — together.
export function SupplierActionCard({
  priceMin,
  priceMax,
  priceTypical,
  currency,
  priceIncludesScVat,
  perServicePricing,
  availabilityNote,
  responseTimeNote,
  verified,
}: {
  priceMin: number | null;
  priceMax: number | null;
  priceTypical: number | null;
  currency: string;
  priceIncludesScVat: boolean | null;
  perServicePricing: PerServicePricing | null;
  availabilityNote: string | null;
  responseTimeNote: string | null;
  verified: boolean;
}) {
  const hasPrice =
    priceMin != null || priceMax != null || priceTypical != null;

  const headline =
    priceMin != null && priceMax != null && priceMax > priceMin
      ? `${formatPrice(priceMin, currency)} - ${formatPrice(priceMax, currency)}`
      : priceMin != null
        ? `from ${formatPrice(priceMin, currency)}`
        : priceTypical != null
          ? `around ${formatPrice(priceTypical, currency)}`
          : "Price on request";

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <p className="font-serif text-3xl font-medium leading-none text-ink">
        {headline}
      </p>

      {priceTypical != null && hasPrice && (priceMin != null || priceMax != null) && (
        <p className="mt-2 text-sm text-muted">
          Couples typically spend around{" "}
          <span className="font-medium text-ink">
            {formatPrice(priceTypical, currency)}
          </span>
          .
        </p>
      )}
      {priceIncludesScVat != null && (
        <p className="mt-2 text-xs text-muted">
          {priceIncludesScVat
            ? "Rates already include service charge and VAT."
            : "Rates exclude service charge and 12% VAT."}
        </p>
      )}

      <ServicePricing
        perServicePricing={perServicePricing}
        currency={currency}
      />

      {availabilityNote && (
        <div className="mt-5">
          <SupplierAvailability note={availabilityNote} />
        </div>
      )}

      <a
        href="#contact"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
      >
        <ChatCircle size={18} weight="fill" />
        Get in touch
      </a>

      {(responseTimeNote || verified) && (
        <div className="mt-4 space-y-1.5 text-xs text-muted">
          {responseTimeNote && (
            <p className="flex items-center gap-1.5">
              <ClockCountdown size={14} className="shrink-0 text-accent-fg" />
              {responseTimeNote}
            </p>
          )}
          {verified && (
            <p className="flex items-center gap-1.5">
              <SealCheck size={14} weight="fill" className="shrink-0 text-accent-fg" />
              Verified by The Vow Edit
            </p>
          )}
        </div>
      )}
    </div>
  );
}
