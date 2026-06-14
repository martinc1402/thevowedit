import { Check } from "@phosphor-icons/react/dist/ssr";
import type { SupplierPackage } from "@/lib/suppliers";

// Package tiers: name + starting cost + key inclusions, so couples can
// self-assess budget fit without inquiring (the verified pricing-presentation
// spec). Cards on a wine-card treatment within the light page.
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
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg, i) => (
          <div
            key={pkg.name + i}
            className="theme-wine flex flex-col rounded-2xl border border-line bg-surface p-5 text-ink"
          >
            <h3 className="font-serif text-xl font-medium text-ink">
              {pkg.name}
            </h3>
            {pkg.priceLabel && (
              <p className="mt-1 text-sm font-medium text-accent-fg">
                {pkg.priceLabel}
              </p>
            )}
            {pkg.includes?.length > 0 && (
              <ul className="mt-4 grid gap-2">
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
