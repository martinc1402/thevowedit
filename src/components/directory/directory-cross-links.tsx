import Link from "next/link";
import {
  otherLocations,
  otherCategories,
  locationLabel,
  resolveCategoryCopy,
} from "@/lib/directory";

const pill =
  "inline-flex rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-ink/25 hover:bg-surface-2";

export function DirectoryCrossLinks({
  category,
  location,
}: {
  category: string;
  location: string;
}) {
  const locLabel = locationLabel(location);
  const { noun } = resolveCategoryCopy(category, locLabel);
  const locations = otherLocations(location);
  const categories = otherCategories(category);

  return (
    <section className="border-t border-line bg-surface-2/40">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-10 lg:py-16">
        <div>
          <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
            {noun} in other areas
          </h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {locations.map((l) => (
              <Link key={l.slug} href={`/${category}/${l.slug}`} className={pill}>
                {noun} in {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
            Other supplier categories in {locLabel}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {categories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}/${location}`} className={pill}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
