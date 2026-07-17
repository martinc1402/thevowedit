import { Check } from "@phosphor-icons/react/dist/ssr";
import type { SupplierPackage } from "@/lib/suppliers";
import { resolveInclusion } from "@/lib/package-inclusions";
import { resolveService } from "@/lib/services-vocab";

// "Services & packages": one home for everything a couple buys. Merges the flat
// services list, the package tiers, and the "what's included" pricing note that
// used to be three separate sections. Packages sit on the cream page as
// hairline-topped columns rather than heavy wine cards, keeping the maroon
// reserved for the verdict.

// Column count adapts to the number of packages so the grid never leaves an
// orphan cell (2 in a 3-col grid). 4 falls back to a clean 2x2.
function gridFor(count: number): string {
  if (count === 1) return "sm:grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  if (count === 4) return "sm:grid-cols-2";
  return "sm:grid-cols-3";
}

export function SupplierOfferings({
  name,
  services,
  packages,
  pricingNotes,
}: {
  name: string;
  services: string[];
  packages: SupplierPackage[];
  pricingNotes: string | null;
}) {
  if (!services.length && !packages.length && !pricingNotes) return null;

  return (
    <section aria-labelledby="offerings-heading">
      <h2
        id="offerings-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Services &amp; packages
      </h2>

      {services.length > 0 && (
        <>
          <p className="sr-only">Services offered by {name}</p>
          <ul className="mt-6 grid gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {services.map((service) => (
              <li
                key={service}
                className="flex items-start gap-2.5 text-base text-ink"
              >
                <Check
                  size={16}
                  weight="bold"
                  className="mt-0.5 shrink-0 text-accent-fg"
                />
                {resolveService(service)}
              </li>
            ))}
          </ul>
        </>
      )}

      {packages.length > 0 && (
        <div className={`mt-12 grid gap-x-10 gap-y-8 ${gridFor(packages.length)}`}>
          {packages.map((pkg, i) => (
            <div key={pkg.name + i} className="border-t border-line pt-5">
              <h3 className="font-serif text-xl font-medium text-ink">
                {pkg.name}
              </h3>
              {pkg.priceLabel && (
                <p className="mt-1 text-base font-semibold tabular-nums text-ink">
                  {pkg.priceLabel}
                </p>
              )}
              {pkg.includes?.length > 0 && (
                <ul className="mt-4 grid gap-2.5">
                  {pkg.includes.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-muted"
                    >
                      <Check
                        size={15}
                        weight="bold"
                        className="mt-0.5 shrink-0 text-accent-fg"
                      />
                      {resolveInclusion(item)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {pricingNotes && (
        <div className="mt-10 border-l-2 border-accent-fg pl-5">
          <p className="max-w-[65ch] whitespace-pre-line text-sm leading-relaxed text-muted">
            {pricingNotes}
          </p>
        </div>
      )}
    </section>
  );
}
