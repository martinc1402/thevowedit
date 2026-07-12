import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { isAdmin } from "@/lib/auth";
import { getSupplierForAdmin } from "@/lib/actions/moderation";
import { applyPending, pendingLabels } from "@/lib/pending";
import { SupplierTitle } from "@/components/sections/supplier/supplier-header";
import { SupplierGallery } from "@/components/sections/supplier/supplier-gallery";
import { SupplierEssentials } from "@/components/sections/supplier/supplier-essentials";
import { SupplierOfferings } from "@/components/sections/supplier/supplier-offerings";
import { SupplierAbout } from "@/components/sections/supplier/supplier-about";
import { SupplierFaq } from "@/components/sections/supplier/supplier-faq";
import { ModerationActions } from "./moderation-actions";

export const metadata: Metadata = {
  title: "Review changes",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ slug: string }> };

export default async function PreviewPage({ params }: Params) {
  if (!(await isAdmin())) notFound();
  const { slug } = await params;
  const supplier = await getSupplierForAdmin(slug);
  if (!supplier) notFound();

  const labels = pendingLabels(supplier.pendingChanges);
  const applied = applyPending(supplier);

  return (
    <div className="min-h-[100dvh] bg-bg">
      {/* Review bar */}
      <div className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={12} /> Back to admin
            </Link>
            <p className="mt-1 text-sm text-ink">
              Reviewing pending changes for{" "}
              <span className="font-medium">{supplier.name}</span>
              {labels.length > 0 && (
                <span className="text-muted"> · {labels.join(", ")}</span>
              )}
            </p>
          </div>
          {labels.length > 0 ? (
            <ModerationActions supplierId={supplier.id} />
          ) : (
            <span className="text-sm text-muted">No changes pending.</span>
          )}
        </div>
      </div>

      {/* Applied preview (cream page, mirrors the public profile) */}
      <main className="theme-light bg-bg text-ink">
        <div className="mx-auto max-w-[1120px] space-y-16 px-4 py-10 sm:px-6 sm:py-14">
          <SupplierTitle
            name={applied.name}
            categories={applied.categories}
            location={applied.location}
            tagline={applied.editorialTagline}
            verified={applied.verified}
            featured={applied.featured}
          />
          {applied.images.length > 0 && (
            <SupplierGallery images={applied.images} name={applied.name} />
          )}
          <SupplierEssentials
            priceMin={applied.priceMin}
            priceMax={applied.priceMax}
            priceTypical={applied.priceTypical}
            entourageRateMin={applied.entourageRateMin}
            entourageRateMax={applied.entourageRateMax}
            currency={applied.currency}
            priceUnit={applied.priceUnit}
            category={applied.categories[0] ?? null}
            essentials={applied.essentials}
          />
          <SupplierOfferings
            name={applied.name}
            services={applied.services}
            packages={applied.packages}
            pricingNotes={applied.pricingNotes}
          />
          <SupplierAbout
            name={applied.name}
            description={applied.description}
            bio={applied.bio}
            teamPhoto={applied.teamPhoto}
            styleTags={applied.styleTags}
            category={applied.categories[0] ?? null}
          />
          <SupplierFaq faq={applied.faq} />
        </div>
      </main>
    </div>
  );
}
