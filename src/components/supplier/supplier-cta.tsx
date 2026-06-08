import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { PriceRange } from "@/components/directory/price-range";
import { VerifiedBadge } from "@/components/directory/badges";

type CtaProps = {
  name: string;
  priceMin: number;
  priceMax: number;
  verified: boolean;
};

// Anchor styled as the primary CTA. Scrolls to the full form (#inquire) using
// the smooth-scroll already set globally. Honest label: it opens an inquiry
// form, not a real availability calendar. One label across both placements.
function InquireButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="#inquire"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] ${className}`}
    >
      <PaperPlaneTilt size={17} weight="bold" />
      Send an inquiry
    </a>
  );
}

// Desktop: compact sticky card that stays in view while the couple scrolls the
// gallery / about / pricing. Shows the price first (our differentiator).
export function SupplierStickyCard({ name, priceMin, priceMax, verified }: CtaProps) {
  return (
    <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_60px_-32px_rgba(20,16,12,0.5)]">
        {verified && <VerifiedBadge className="mb-3" />}
        <h2 className="font-serif text-xl font-medium leading-tight text-ink">
          {name}
        </h2>
        <p className="mt-3 text-sm text-muted">Packages from</p>
        <PriceRange min={priceMin} max={priceMax} className="mt-0.5 block text-2xl" />
        <InquireButton className="mt-5 w-full" />
      </div>
    </div>
  );
}

// Mobile: fixed bottom bar so the photos are the first thing seen, with the
// price + CTA always one tap away.
export function SupplierMobileBar({ priceMin, priceMax }: CtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface shadow-[0_-8px_24px_-16px_rgba(20,16,12,0.5)] lg:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] text-muted">Packages from</p>
          <PriceRange min={priceMin} max={priceMax} className="block text-lg" />
        </div>
        <InquireButton className="shrink-0" />
      </div>
    </div>
  );
}
