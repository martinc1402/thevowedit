import { priceRanges } from "@/lib/content";
import { Reveal } from "@/components/reveal";

// The three headline categories couples ask about first. This is the page's
// key differentiator, so the band features exactly these as an even row.
const FEATURED = ["Photography", "Catering", "Venue rental"];

export function PriceBand() {
  const cards = priceRanges.filter((p) => FEATURED.includes(p.category));

  return (
    <section id="pricing" className="bg-accent text-accent-ink">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-end lg:gap-16">
          <Reveal>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-accent-ink/65">
              Price transparency
            </p>
            <h2 className="font-serif text-4xl font-medium leading-[1.05] sm:text-5xl">
              What does a Cebu wedding actually cost?
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-accent-ink/80">
              Ballpark price ranges to help you plan a Cebu wedding budget.
              Typical guidance to set expectations, not quotes.
            </p>
          </Reveal>

          <Reveal>
            {/* Plain sibling cards at opacity 1 — no per-card / staggered reveal,
                so all three read with identical weight (no left-to-right fade). */}
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-accent-ink/15 sm:grid-cols-3">
              {cards.map((p) => (
                <div key={p.category} className="bg-accent px-5 py-7 sm:px-6">
                  <p className="text-sm text-accent-ink/70">{p.category}</p>
                  <p className="mt-2 font-serif text-2xl font-medium leading-none sm:text-[1.9rem] lg:text-3xl">
                    ₱{p.low}
                    <span className="mx-1.5 text-accent-ink/45">to</span>
                    ₱{p.high}
                  </p>
                  <p className="mt-2 text-xs text-accent-ink/60">{p.unit}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-accent-ink/60">
              Indicative ranges based on typical Cebu wedding pricing, updated
              for 2026.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
