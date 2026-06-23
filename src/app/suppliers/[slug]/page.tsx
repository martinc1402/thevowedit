import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { getSupplierBySlug, formatPrice } from "@/lib/suppliers";
import { categories } from "@/lib/content";
import { SupplierGallery } from "@/components/sections/supplier/supplier-gallery";
import { SupplierTitle, SupplierMeta } from "@/components/sections/supplier/supplier-header";
import { SupplierExperience } from "@/components/sections/supplier/supplier-experience";
import { SpecStrip, SpecsGrid } from "@/components/sections/supplier/supplier-specs";
import { SupplierActionCard } from "@/components/sections/supplier/supplier-action-card";
import { PackageTiers } from "@/components/sections/supplier/package-tiers";
import { PricingNotes } from "@/components/sections/supplier/pricing-notes";
import { SupplierAbout } from "@/components/sections/supplier/supplier-about";
import { VideoEmbed } from "@/components/sections/supplier/video-embed";
import { SupplierLogistics } from "@/components/sections/supplier/supplier-logistics";
import { SupplierReviews } from "@/components/sections/supplier/supplier-reviews";
import { SupplierFaq } from "@/components/sections/supplier/supplier-faq";
import { SupplierContact } from "@/components/sections/supplier/supplier-contact";

const labelFor = (slug: string) =>
  categories.find((c) => c.slug === slug)?.label ?? slug;

const withProtocol = (v: string) =>
  /^https?:\/\//.test(v) ? v : `https://${v}`;

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
        <div className="mx-auto max-w-[1120px] px-4 pb-28 pt-8 sm:px-6 sm:pb-16 sm:pt-12">
          {/* Full-width header: title leads above the gallery (Airbnb-style). */}
          <SupplierTitle name={s.name} />

          <div className="mt-6">
            <SupplierGallery images={s.images} name={s.name} />
          </div>

          {s.portfolioLink && (
            <div className="mt-3 text-right">
              <a
                href={withProtocol(s.portfolioLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-fg underline underline-offset-2 transition-colors hover:text-ink"
              >
                View full portfolio
                <ArrowUpRight size={15} weight="bold" />
              </a>
            </div>
          )}

          <div className="mt-5">
            <SupplierMeta
              categories={s.categories}
              verified={s.verified}
              basedIn={s.basedIn}
              servesAreas={s.servesAreas}
              rating={s.rating}
              reviewCount={s.reviewCount}
              styleTags={s.styleTags}
            />
          </div>

          {(s.establishedYear != null || s.weddingsCount != null) && (
            <div className="mt-5">
              <SupplierExperience
                establishedYear={s.establishedYear}
                weddingsCount={s.weddingsCount}
              />
            </div>
          )}

          {s.specs.length > 0 && (
            <div className="mt-5">
              <SpecStrip specs={s.specs} />
            </div>
          )}

          {/* Mobile: the action card sits in-flow near the top. */}
          <div className="mt-6 lg:hidden">
            <SupplierActionCard
              priceMin={s.priceMin}
              priceMax={s.priceMax}
              priceTypical={s.priceTypical}
              currency={s.currency}
              priceIncludesScVat={s.priceIncludesScVat}
              perServicePricing={s.perServicePricing}
              availabilityNote={s.availabilityNote}
              responseTimeNote={s.responseTimeNote}
              verified={s.verified}
            />
          </div>

          {/* Body: content left, sticky action rail right (desktop only). */}
          <div className="mt-10 lg:grid lg:grid-cols-[1fr_minmax(320px,360px)] lg:items-start lg:gap-12">
            <div className="space-y-12">
              <Reveal>
                <SpecsGrid specs={s.specs} />
              </Reveal>
              <Reveal>
                <PackageTiers packages={s.packages} />
              </Reveal>
              <Reveal>
                <PricingNotes notes={s.pricingNotes} />
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
                <VideoEmbed videoUrl={s.videoUrl} name={s.name} />
              </Reveal>
              <Reveal>
                <SupplierLogistics
                  responseTimeNote={s.responseTimeNote}
                  worksWithOverseasCouples={s.worksWithOverseasCouples}
                  travelFeeNote={s.travelFeeNote}
                  bookingTerms={s.bookingTerms}
                />
              </Reveal>
              <Reveal>
                <SupplierFaq faq={s.faq} />
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

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SupplierActionCard
                  priceMin={s.priceMin}
                  priceMax={s.priceMax}
                  priceTypical={s.priceTypical}
                  currency={s.currency}
                  priceIncludesScVat={s.priceIncludesScVat}
                  perServicePricing={s.perServicePricing}
                  availabilityNote={s.availabilityNote}
                  responseTimeNote={s.responseTimeNote}
                  verified={s.verified}
                />
              </div>
            </aside>
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
