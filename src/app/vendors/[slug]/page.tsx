import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { getSupplierBySlug, formatPrice } from "@/lib/suppliers";
import { getSupplierBySlugForViewer } from "@/lib/supplier-access";
import { isSupplierClaimed } from "@/lib/claim-status";
import {
  buildContactChannels,
  buildPresenceLinks,
  pickPrimaryChannel,
} from "@/lib/contact-channels";
import { categories } from "@/lib/content";
import { SupplierGallery } from "@/components/sections/supplier/supplier-gallery";
import { GalleryPlaceholder } from "@/components/sections/supplier/gallery-placeholder";
import { SupplierTitle } from "@/components/sections/supplier/supplier-header";
import { SupplierExperience } from "@/components/sections/supplier/supplier-experience";
import { SupplierContactCard } from "@/components/sections/supplier/supplier-contact-card";
import { QuoteChecklist } from "@/components/sections/supplier/quote-checklist";
import { SupplierEditorNote } from "@/components/sections/supplier/supplier-editor-note";
import { SupplierEssentials } from "@/components/sections/supplier/supplier-essentials";
import { SupplierOfferings } from "@/components/sections/supplier/supplier-offerings";
import { SupplierAbout } from "@/components/sections/supplier/supplier-about";
import { SupplierFaq } from "@/components/sections/supplier/supplier-faq";

const labelFor = (slug: string) =>
  categories.find((c) => c.slug === slug)?.label ?? slug;

// target/rel only for http(s) links; tel:/mailto: open in the same context.
const extProps = (external: boolean) =>
  external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  let s = await getSupplierBySlug(slug);
  // Hidden profile: only surfaces for the owner/admin, and must never be indexed.
  let hidden = false;
  if (!s) {
    const preview = await getSupplierBySlugForViewer(slug);
    if (!preview) return { title: "Supplier not found" };
    s = preview.supplier;
    hidden = preview.notLive;
  }

  const cat = s.categories[0] ? labelFor(s.categories[0]) : "Wedding supplier";
  const title = `${s.name} - ${cat} in ${s.location}`;
  const description =
    s.shortDescription ??
    `${s.name}, a ${cat.toLowerCase()} in ${s.location}. See pricing, packages and photos on The Vow Edit.`;

  return {
    title,
    description,
    ...(hidden ? { robots: { index: false, follow: false } } : {}),
    alternates: { canonical: `/vendors/${s.slug}` },
    openGraph: {
      title,
      description,
      url: `/vendors/${s.slug}`,
      type: "profile",
      ...(s.images[0] ? { images: [{ url: s.images[0] }] } : {}),
    },
  };
}

export default async function SupplierPage({ params }: Params) {
  const { slug } = await params;

  // Published pages read via the anon client (no cookies) so they stay cacheable.
  // Only when that misses do we check whether the viewer is the owner or an admin
  // allowed to preview a hidden profile; public visitors fall through to notFound().
  let supplier = await getSupplierBySlug(slug);
  let notLive = false;
  if (!supplier) {
    const preview = await getSupplierBySlugForViewer(slug);
    if (!preview) notFound();
    supplier = preview.supplier;
    notLive = preview.notLive;
  }

  const s = supplier;
  const claimed = await isSupplierClaimed(s.id);

  // Direct-contact channels + the primary (maroon) action, resolved once and
  // shared by the hero CTA, the contact card, and the mobile bottom bar.
  const channels = buildContactChannels(s);
  const primary = pickPrimaryChannel(channels, s.preferredChannel);
  const presence = buildPresenceLinks(s);

  const contactCard = (
    <SupplierContactCard
      priceMin={s.priceMin}
      priceMax={s.priceMax}
      priceTypical={s.priceTypical}
      entourageRateMin={s.entourageRateMin}
      entourageRateMax={s.entourageRateMax}
      currency={s.currency}
      category={s.categories[0] ?? null}
      verified={s.verified}
      responseTimeValue={s.responseTimeValue}
      responseTimeUnit={s.responseTimeUnit}
      channels={channels}
      primary={primary}
      presence={presence}
    />
  );

  return (
    <>
      <SiteNav />
      <main className="theme-light bg-bg text-ink">
        {notLive && (
          <div className="border-b border-accent/30 bg-accent/5">
            <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-2.5 gap-y-1 px-4 py-3 text-sm sm:px-6">
              <EyeSlash size={16} weight="bold" className="text-accent-fg" />
              <span className="font-medium text-ink">
                This profile is hidden.
              </span>
              <span className="text-muted">
                Only you can see it. It is not live to couples.
              </span>
              <Link
                href="/dashboard"
                className="ml-auto text-accent-fg underline underline-offset-2 transition-colors hover:text-ink"
              >
                Manage in dashboard
              </Link>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-[1120px] px-4 pb-28 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
          {/* Hero: quiet header, gallery as the focal point, one primary
              direct-contact CTA. */}
          <SupplierTitle
            name={s.name}
            categories={s.categories}
            location={s.location}
            tagline={s.editorialTagline}
            verified={s.verified}
            featured={s.featured}
          />

          <div className="mt-6">
            {s.images.length > 0 ? (
              <SupplierGallery
                images={s.images}
                name={s.name}
                focus={s.imageFocus}
              />
            ) : (
              <GalleryPlaceholder slug={s.slug} name={s.name} />
            )}
          </div>

          {/* Body: content column (left) + sticky contact rail (right, desktop). */}
          <div className="mt-14 sm:mt-20 lg:grid lg:grid-cols-[1fr_minmax(320px,360px)] lg:items-start lg:gap-14">
            <div className="space-y-20 sm:space-y-24">
              {/* The verdict now leads the left column (narrower measure reads
                  better as an editorial aside). */}
              <Reveal>
                <SupplierEditorNote name={s.name} note={s.editorNote} />
              </Reveal>

              <Reveal>
                <SupplierEssentials
                  priceMin={s.priceMin}
                  priceMax={s.priceMax}
                  priceTypical={s.priceTypical}
                  entourageRateMin={s.entourageRateMin}
                  entourageRateMax={s.entourageRateMax}
                  currency={s.currency}
                  priceUnit={s.priceUnit}
                  category={s.categories[0] ?? null}
                  categories={s.categories}
                  essentials={s.essentials}
                />
              </Reveal>

              {/* Mobile: the contact card sits inline after the essentials
                  (the sticky rail is desktop-only). */}
              <div className="lg:hidden">
                <Reveal>
                  {contactCard}
                  <QuoteChecklist category={s.categories[0] ?? null} />
                </Reveal>
              </div>

              {/* Desktop: the enquiry checklist lives in the main column so the
                  sticky rail can hold just the (viewport-height) contact card. */}
              <div className="hidden lg:block">
                <Reveal>
                  <QuoteChecklist category={s.categories[0] ?? null} />
                </Reveal>
              </div>

              {/* Trust stats — self-hides when absent. */}
              {(s.establishedYear != null || s.weddingsCount != null) && (
                <Reveal>
                  <SupplierExperience
                    establishedYear={s.establishedYear}
                    weddingsCount={s.weddingsCount}
                  />
                </Reveal>
              )}

              <Reveal>
                <SupplierOfferings
                  name={s.name}
                  services={s.services}
                  packages={s.packages}
                  pricingNotes={s.pricingNotes}
                />
              </Reveal>

              <Reveal>
                <SupplierAbout
                  name={s.name}
                  description={s.description}
                  bio={s.bio}
                  teamPhoto={s.teamPhoto}
                  styleTags={s.styleTags}
                  category={s.categories[0] ?? null}
                />
              </Reveal>
              <Reveal>
                <SupplierFaq faq={s.faq} />
              </Reveal>
              {!claimed && (
                <div className="border-t border-line pt-6">
                  <a
                    href={`/claim/${s.slug}`}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    Is this your business? Claim this profile &rarr;
                  </a>
                </div>
              )}
            </div>

            {/* The grid item itself is the sticky element: with the grid's
                items-start, its containing block is the tall grid, so it pins
                below the nav and travels down, stopping at the grid's bottom
                (before the footer). */}
            {/* Desktop sticky rail: just the contact card, so it stays shorter
                than the viewport and pins cleanly for the whole scroll. The
                enquiry checklist lives in the left column above. */}
            <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
              {contactCard}
            </aside>
          </div>
        </div>

        {/* Sticky mobile bar: price + a single direct-contact action. */}
        {(primary || s.priceMin != null) && (
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
              {primary && (
                <a
                  href={primary.href}
                  {...extProps(primary.external)}
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-accent-ink active:scale-[0.98]"
                >
                  Contact now
                </a>
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
