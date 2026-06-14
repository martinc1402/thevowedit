import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { getSupplierBySlug, formatPrice } from "@/lib/suppliers";
import { categories } from "@/lib/content";
import { SupplierGallery } from "@/components/sections/supplier/supplier-gallery";
import { SupplierHeader } from "@/components/sections/supplier/supplier-header";
import { PriceBlock } from "@/components/sections/supplier/price-block";
import { PackageTiers } from "@/components/sections/supplier/package-tiers";
import { SupplierAbout } from "@/components/sections/supplier/supplier-about";
import { SupplierReviews } from "@/components/sections/supplier/supplier-reviews";
import { SupplierContact } from "@/components/sections/supplier/supplier-contact";

const labelFor = (slug: string) =>
  categories.find((c) => c.slug === slug)?.label ?? slug;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSupplierBySlug(slug);
  if (!s) return { title: "Supplier not found" };

  const cat = s.categories[0] ? labelFor(s.categories[0]) : "Wedding supplier";
  const title = `${s.name} - ${cat} in ${s.location}`;
  const description =
    s.shortDescription ??
    `${s.name}, a ${cat.toLowerCase()} in ${s.location}. See pricing, packages and photos on The Vow Edit.`;

  return {
    title,
    description,
    alternates: { canonical: `/suppliers/${s.slug}` },
    openGraph: {
      title,
      description,
      url: `/suppliers/${s.slug}`,
      type: "profile",
      ...(s.images[0] ? { images: [{ url: s.images[0] }] } : {}),
    },
  };
}

export default async function SupplierPage({ params }: Params) {
  const { slug } = await params;
  const supplier = await getSupplierBySlug(slug);
  if (!supplier) notFound();

  const s = supplier;

  return (
    <>
      <SiteNav />
      <main className="theme-light bg-bg text-ink">
        <div className="mx-auto max-w-[1000px] px-4 pb-28 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
          <SupplierGallery images={s.images} name={s.name} />

          <div className="mt-8">
            <SupplierHeader
              name={s.name}
              categories={s.categories}
              verified={s.verified}
              basedIn={s.basedIn}
              servesAreas={s.servesAreas}
              rating={s.rating}
              reviewCount={s.reviewCount}
            />
          </div>

          {/* Price leads — the differentiator and the #1 decision factor. */}
          <div className="mt-7">
            <PriceBlock
              priceMin={s.priceMin}
              priceMax={s.priceMax}
              priceTypical={s.priceTypical}
              currency={s.currency}
              priceIncludesScVat={s.priceIncludesScVat}
            />
          </div>

          <div className="mt-12 space-y-12">
            <Reveal>
              <PackageTiers packages={s.packages} />
            </Reveal>
            <Reveal>
              <SupplierAbout
                name={s.name}
                description={s.description}
                bio={s.bio}
                teamPhoto={s.teamPhoto}
              />
            </Reveal>
            <Reveal>
              <SupplierReviews
                reviews={s.reviews}
                rating={s.rating}
                reviewCount={s.reviewCount}
              />
            </Reveal>
            <Reveal>
              <SupplierContact
                name={s.name}
                instagram={s.instagram}
                facebook={s.facebook}
                website={s.website}
                phone={s.phone}
                email={s.email}
              />
            </Reveal>
          </div>
        </div>

        {/* Sticky mobile CTA: price + jump to contact. Hidden on desktop. */}
        <div className="theme-light fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-3">
            {s.priceMin != null ? (
              <p className="text-sm text-ink">
                <span className="text-muted">from </span>
                <span className="font-semibold">
                  {formatPrice(s.priceMin, s.currency)}
                </span>
              </p>
            ) : (
              <span />
            )}
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-ink active:scale-[0.98]"
            >
              Get in touch
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
