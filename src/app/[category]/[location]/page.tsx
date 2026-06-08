import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { ListingsBrowser } from "@/components/directory/listings-browser";
import { DirectoryCrossLinks } from "@/components/directory/directory-cross-links";
import {
  getListings,
  categoryLabel,
  locationLabel,
  resolveCategoryCopy,
  allCategorySlugs,
  allLocationSlugs,
  PROVINCE,
} from "@/lib/directory";
import { MVP_LAUNCH } from "@/lib/launch";

type Params = { category: string; location: string };

// ISR: pages are statically cached but re-fetch supplier data from Supabase at
// most once per minute, so dashboard edits/new suppliers appear without a redeploy.
export const revalidate = 60;

// Prebuild the full category × location matrix for SEO. Combos without data
// render the same template against an empty result (tasteful empty state).
export function generateStaticParams(): Params[] {
  if (MVP_LAUNCH) return [];
  const params: Params[] = [];
  for (const category of allCategorySlugs) {
    for (const location of allLocationSlugs) {
      params.push({ category, location });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category, location } = await params;
  const locLabel = locationLabel(location);
  const { h1, noun } = resolveCategoryCopy(category, locLabel);
  return {
    title: h1,
    description: `Browse verified ${noun.toLowerCase()} in ${locLabel} with real PHP price ranges, ratings and reviews. No inquire-for-a-quote runaround.`,
  };
}

export default async function CategoryLocationPage({
  params,
}: {
  params: Promise<Params>;
}) {
  if (MVP_LAUNCH) notFound();
  const { category, location } = await params;
  const catLabel = categoryLabel(category);
  const locLabel = locationLabel(location);
  const { h1, intro, noun } = resolveCategoryCopy(category, locLabel);
  const listings = await getListings(category, location);

  return (
    <>
      <SiteNav />
      <main>
        <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: catLabel, href: `/${category}/${PROVINCE.slug}` },
              { label: locLabel },
            ]}
          />

          <header className="mt-6 max-w-3xl">
            <h1 className="font-serif text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
              {h1}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{intro}</p>
          </header>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
          <ListingsBrowser
            listings={listings}
            categorySlug={category}
            locationSlug={location}
            locationLabel={locLabel}
            noun={noun.toLowerCase()}
          />
        </div>

        <DirectoryCrossLinks category={category} location={location} />
      </main>
      <SiteFooter />
    </>
  );
}
