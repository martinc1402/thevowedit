import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, AirplaneTilt } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Breadcrumb } from "@/components/directory/breadcrumb";
import { VerifiedBadge, VerifiedNote } from "@/components/directory/badges";
import { PriceRange } from "@/components/directory/price-range";
import { SupplierGallery } from "@/components/supplier/supplier-gallery";
import { SupplierFacts } from "@/components/supplier/supplier-facts";
import { SupplierVideo } from "@/components/supplier/supplier-video";
import { SupplierHost } from "@/components/supplier/supplier-host";
import { PortfolioLinks } from "@/components/supplier/portfolio-links";
import { PricingBlock } from "@/components/supplier/pricing-block";
import { SupplierReviews } from "@/components/supplier/supplier-reviews";
import { InquiryForm } from "@/components/supplier/inquiry-form";
import {
  SupplierStickyCard,
  SupplierMobileBar,
} from "@/components/supplier/supplier-cta";
import {
  getSupplierBySlug,
  getAllSupplierSlugs,
  categoryLabel,
  locationLabel,
  serviceLabel,
  getCategoryPrice,
  formatPeso,
  PROVINCE,
} from "@/lib/directory";
import { MVP_LAUNCH } from "@/lib/launch";

type Params = { slug: string };

// ISR: profiles are cached but revalidate from Supabase at most once per minute,
// so edits show up without a redeploy. New slugs render on demand (dynamicParams
// defaults to true).
export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  if (MVP_LAUNCH) return [];
  const slugs = await getAllSupplierSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await getSupplierBySlug(slug);
  if (!s) return { title: "Supplier not found" };
  const cat = categoryLabel(s.categories[0]);
  return {
    title: `${s.name}, ${cat.replace(/s$/, "")} in ${s.basedIn}`,
    description: `${s.shortDescription} Packages from ${formatPeso(s.priceMin)} to ${formatPeso(s.priceMax)}.`,
  };
}

export default async function SupplierPage({
  params,
}: {
  params: Promise<Params>;
}) {
  if (MVP_LAUNCH) notFound();
  const { slug } = await params;
  const s = await getSupplierBySlug(slug);
  if (!s) notFound();

  const primaryCategory = s.categories[0];
  const catLabel = categoryLabel(primaryCategory);
  const provinceLabel = locationLabel(PROVINCE.slug);
  const categoryHref = `/${primaryCategory}/${PROVINCE.slug}`;
  const description = s.description ?? s.shortDescription;
  const gallery = s.gallery ?? [];
  const hasPortfolioLinks = !!(
    s.contact &&
    (s.contact.website || s.contact.instagram || s.contact.facebook)
  );

  // One entry per service the supplier offers, each with its own range. Drives
  // the service tags, the header price, and the Pricing section.
  const services = s.categories.map((c) => ({
    slug: c,
    label: serviceLabel(c),
    ...getCategoryPrice(s, c),
  }));
  const multiService = services.length > 1;

  // Service role(s), singular + lowercased, e.g. "photographer" or
  // "photographer & videographer". Drives the "what this is" subtitle and the
  // "Meet your {role}" heading.
  const role = s.categories
    .map((c) => categoryLabel(c).replace(/s$/, "").toLowerCase())
    .join(" & ");
  const subtitle = `Wedding ${role}`;

  return (
    <>
      <SiteNav />
      <main className="pb-24 lg:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: catLabel, href: categoryHref },
              { label: provinceLabel, href: categoryHref },
              { label: s.name },
            ]}
          />

          {/* Title band — name + Verified badge + compact price, ABOVE the
              gallery, so our wedge (price + verification) stays above the fold. */}
          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="font-serif text-4xl font-medium leading-[1.1] text-ink sm:text-5xl">
                {s.name}
              </h1>
              {s.verified && <VerifiedBadge />}
            </div>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm text-muted">from</span>
              <PriceRange
                min={s.priceMin}
                max={s.priceMax}
                className="text-2xl sm:text-3xl"
              />
            </p>
          </header>
        </div>

        {/* Gallery hero — full content width, directly under the title (the
            Airbnb model). Only when there are images; zero-image suppliers fall
            back to the portfolio-links block in the body below. */}
        {gallery.length > 0 && (
          <div className="mx-auto mt-4 max-w-[1400px] px-4 sm:px-6 lg:mt-6 lg:px-10">
            <SupplierGallery images={gallery} />
          </div>
        )}

        {/* Top zone: identity, at-a-glance, about + the sticky CTA card beside
            it. Pricing/Inquire move to full-width bands below so the right rail
            never trails a tall empty column under the card. */}
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
          {/* items-start so the right column doesn't stretch — lets the CTA card stay sticky */}
          <div className="grid items-start gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            {/* Left: identity + at-a-glance + about. Price now lives in the
                title band above the gallery (kept above the fold). */}
            <div className="space-y-10">
              {/* Identity + trust line, directly under the gallery hero. */}
              <div>
                <p className="text-base text-ink">{subtitle}</p>

                {/* Rating only with real reviews — no empty stars, no "0 reviews". */}
                {s.reviewCount > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                    <Star size={15} weight="fill" className="text-accent-fg" />
                    {s.rating.toFixed(1)} · {s.reviewCount} reviews
                  </p>
                )}

                {/* Trust story — our wedge. Given room to breathe near the top so
                    price + verification read as the headline promise. */}
                {s.verified && <VerifiedNote className="mt-3" />}

                {/* "At a glance" facts — base, service areas, style, overseas.
                    A subtle panel that spans the full column width. */}
                <SupplierFacts listing={s} />
              </div>

              {/* Optional reel — renders nothing unless a videoUrl is set. */}
              <SupplierVideo url={s.videoUrl} supplierName={s.name} />

              {/* External portfolio links. When there are no uploaded images yet
                  (first real submissions), this points couples to real work on
                  the supplier's own channels instead of leaving a blank column. */}
              {hasPortfolioLinks && (
                <section>
                  <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                    Portfolio
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {gallery.length === 0
                      ? `We are collecting ${s.name}'s photos. For now, see their recent work here.`
                      : `See more of ${s.name}'s recent work.`}
                  </p>
                  <div className="mt-4">
                    <PortfolioLinks contact={s.contact} />
                  </div>
                </section>
              )}

              <section>
                <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                  About {s.name}
                </h2>
                <p className="mt-3 max-w-[68ch] text-base leading-relaxed text-muted">
                  {description}
                </p>
                {/* Services offered — only when more than one, so single-service
                    suppliers read exactly as before. Accent pills separate the
                    "what they do" from the muted "how they shoot" style tags. */}
                {multiService && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {services.map((svc) => (
                      <span
                        key={svc.slug}
                        className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-fg"
                      >
                        {svc.label}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Meet your supplier — team photo and/or bio. Renders nothing
                  until there's real data (no empty avatar, no placeholder). */}
              <SupplierHost
                name={s.name}
                role={role}
                teamPhoto={s.teamPhoto}
                bio={s.bio}
              />
            </div>

            {/* Right: sticky CTA card (desktop only; hidden on mobile) */}
            <SupplierStickyCard
              name={s.name}
              priceMin={s.priceMin}
              priceMax={s.priceMax}
              verified={s.verified}
            />
          </div>
        </div>

        {/* Pricing + Reviews — full content width, separated from the about zone
            by a hairline. space-y means an empty (null) reviews block adds no gap. */}
        <div className="mx-auto max-w-[1400px] border-t border-line px-4 pt-12 pb-14 sm:px-6 lg:px-10">
          <div className="space-y-12">
            {/* Width tracks the content: a compact card for a bare range, the
                wider measure only when a package grid actually needs it. */}
            <section
              className={
                s.packages && s.packages.length > 0 ? "max-w-3xl" : "max-w-md"
              }
            >
              <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                Pricing
              </h2>
              <div className="mt-5">
                <PricingBlock
                  min={s.priceMin}
                  max={s.priceMax}
                  packages={s.packages}
                  services={services}
                />
              </div>
              {/* Transparent, upfront travel note — no fee calculation, just
                  the supplier's own declaration shown when present. */}
              {s.travelFeeNote && (
                <p className="mt-3 flex items-start gap-1.5 text-sm leading-relaxed text-muted">
                  <AirplaneTilt
                    size={15}
                    weight="bold"
                    className="mt-0.5 shrink-0 text-accent-fg"
                  />
                  {s.travelFeeNote}
                </p>
              )}
            </section>

            <SupplierReviews
              reviews={s.reviews}
              supplierName={s.name}
              rating={s.rating}
              reviewCount={s.reviewCount}
            />
          </div>
        </div>

        {/* Inquire — full-bleed, very lightly tinted band so the conversion zone
            reads as its own section and fills the lower page width. Intro on the
            left, the form as an elevated card on the right. */}
        <section
          id="inquire"
          className="scroll-mt-24 border-t border-line bg-surface-2/40"
        >
          <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
            <div className="max-w-xl">
              <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
                Inquire
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted">
                Send {s.name} your date and details. Pricing is shown upfront, so
                there is no guesswork.
              </p>
              <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_60px_-32px_rgba(20,16,12,0.5)] sm:p-8">
                <InquiryForm supplierSlug={s.slug} supplierName={s.name} />
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
          <Link
            href={categoryHref}
            className="inline-flex rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-ink/25 hover:bg-surface-2"
          >
            More {catLabel.toLowerCase()} in {provinceLabel}
          </Link>
        </div>
      </main>

      <SiteFooter />
      {/* Spacer so the fixed mobile bar never covers the footer's last line */}
      <div aria-hidden className="h-20 lg:hidden" />

      <SupplierMobileBar
        name={s.name}
        priceMin={s.priceMin}
        priceMax={s.priceMax}
        verified={s.verified}
      />
    </>
  );
}
