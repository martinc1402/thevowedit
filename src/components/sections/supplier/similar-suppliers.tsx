import Image from "next/image";
import Link from "next/link";
import { SealCheck, Star } from "@phosphor-icons/react/dist/ssr";
import { formatPrice, type SupplierCardData } from "@/lib/suppliers";
import { categories } from "@/lib/content";

const labelFor = (slug: string) =>
  categories.find((c) => c.slug === slug)?.label ?? slug;

export function SimilarSuppliers({
  suppliers,
  heading = "Similar suppliers",
}: {
  suppliers: SupplierCardData[];
  heading?: string;
}) {
  if (!suppliers.length) return null;
  return (
    <section aria-labelledby="similar-heading">
      <h2
        id="similar-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        {heading}
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {suppliers.map((s) => (
          <Link
            key={s.slug}
            href={`/suppliers/${s.slug}`}
            className="group overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:bg-surface-2"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
              {s.image ? (
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center font-serif text-3xl text-line">
                  {s.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-lg font-medium leading-tight text-ink">
                  {s.name}
                </h3>
                {s.verified && (
                  <SealCheck
                    size={15}
                    weight="fill"
                    className="shrink-0 text-accent-fg"
                    aria-label="Verified"
                  />
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {s.categories[0] ? labelFor(s.categories[0]) : ""}
                {s.location ? ` · ${s.location}` : ""}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                {s.priceMin != null ? (
                  <span className="text-ink">
                    <span className="text-muted">from </span>
                    <span className="font-medium">
                      {formatPrice(s.priceMin, s.currency)}
                    </span>
                  </span>
                ) : (
                  <span />
                )}
                {s.rating != null && s.rating > 0 && (
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Star size={13} weight="fill" className="text-accent-fg" />
                    {s.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
