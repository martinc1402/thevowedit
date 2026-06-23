import { Check } from "@phosphor-icons/react/dist/ssr";
import type { SupplierPackage } from "@/lib/suppliers";

// Column count adapts to the number of packages so the grid never leaves an
// orphan cell (e.g. 2 packages in a 3-col grid). 4 falls back to a clean 2x2.
function gridFor(count: number): string {
  if (count === 1) return "max-w-md";
  if (count === 2) return "sm:grid-cols-2";
  if (count === 4) return "sm:grid-cols-2";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

// Package tiers: name + price + key inclusions, so couples can self-assess
// budget fit without inquiring (the verified pricing-presentation spec). Wine
// cards within the light page; price is emphasised and inclusions sit below a
// hairline.
export function PackageTiers({ packages }: { packages: SupplierPackage[] }) {
  if (!packages.length) return null;
  return (
    <section aria-labelledby="packages-heading">
      <h2
        id="packages-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Packages
      </h2>
      <div className={`mt-5 grid gap-4 ${gridFor(packages.length)}`}>
        {packages.map((pkg, i) => (
          <div
            key={pkg.name + i}
            className="theme-wine flex flex-col rounded-2xl border border-line bg-surface p-6 text-ink"
          >
            <h3 className="font-serif text-xl font-medium text-ink">
              {pkg.name}
            </h3>
            {pkg.priceLabel && (
              <p className="mt-1.5 text-2xl font-semibold text-ink">
                {pkg.priceLabel}
              </p>
            )}
            {pkg.includes?.length > 0 && (
              <ul className="mt-5 grid gap-2.5 border-t border-line pt-5">
                {pkg.includes.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-muted"
                  >
                    <Check
                      size={16}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-accent-fg"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
