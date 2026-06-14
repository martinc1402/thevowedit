import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ApplyPrefillProvider } from "@/components/apply-context";
import { HeroLogo } from "@/components/sections/hero-logo";
import { FoundingSupplier } from "@/components/sections/founding-supplier";
import { CategoryGrid } from "@/components/sections/category-grid";
import { PriceBand } from "@/components/sections/price-band";
import { WeddingTypes } from "@/components/sections/wedding-types";

// Pre-launch funnel: the homepage's primary job is converting a Cebu wedding
// supplier into a founding applicant. The hero supplier CTA + nav both lead to
// the application form (#apply) directly under the hero. Everything below #showcase
// is honest couple-facing "vision," not a live, browsable marketplace.
export default function Home() {
  return (
    <ApplyPrefillProvider>
      <SiteNav />
      <main>
        <HeroLogo />

        {/* Raised, opaque content that scrolls up and over the pinned hero
            (the "hold & cover" reveal). */}
        <div className="relative z-10">
          {/* Conversion centerpiece: value prop + application form */}
          <FoundingSupplier />

          {/* Showcase: what couples will see at launch (non-interactive) */}
          <div id="showcase" className="scroll-mt-16">
            <CategoryGrid />
            <PriceBand />
            <WeddingTypes />
          </div>
        </div>
      </main>
      <SiteFooter />
    </ApplyPrefillProvider>
  );
}
