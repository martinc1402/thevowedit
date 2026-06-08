import { Check } from "@phosphor-icons/react/dist/ssr";
import { PriceRange } from "@/components/directory/price-range";
import type { SupplierPackage } from "@/lib/types";

type Service = { label: string; min: number; max: number };

// Prominent pricing — the product's differentiator. The range stands alone and
// looks complete; named packages render only when present. Suppliers offering
// more than one service show each service with its own labelled range.
export function PricingBlock({
  min,
  max,
  packages,
  services,
}: {
  min: number;
  max: number;
  packages?: SupplierPackage[];
  services?: Service[]; // per-service ranges; when 2+, each is shown labelled
}) {
  const multiService = !!services && services.length > 1;
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_60px_-32px_rgba(20,16,12,0.5)] sm:p-8">
      {multiService ? (
        <div className="space-y-4">
          {services!.map((s) => (
            <div key={s.label}>
              <p className="text-sm text-muted">{s.label}</p>
              <PriceRange
                min={s.min}
                max={s.max}
                className="mt-1 block text-2xl sm:text-3xl"
              />
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">Packages from</p>
          <PriceRange min={min} max={max} className="mt-1 block text-3xl sm:text-4xl" />
        </>
      )}

      {packages && packages.length > 0 ? (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {packages.map((p) => (
            <li key={p.name} className="rounded-2xl border border-line bg-bg p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-xl font-medium text-ink">{p.name}</h3>
                {p.priceLabel && (
                  <span className="font-serif text-lg font-medium text-ink">
                    {p.priceLabel}
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {p.includes.map((inc) => (
                  <li key={inc} className="flex items-start gap-2 text-sm text-muted">
                    <Check
                      size={15}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-accent-fg"
                    />
                    <span className="leading-snug">{inc}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Final pricing depends on coverage, hours, and add-ons. Send an inquiry
          for a custom quote with everything itemised upfront.
        </p>
      )}
    </div>
  );
}
