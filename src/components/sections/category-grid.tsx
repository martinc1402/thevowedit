import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";

export function CategoryGrid() {
  return (
    <section id="categories" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Reveal className="mb-9 max-w-2xl lg:mb-12">
        <h2 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
          Categories we are onboarding suppliers in
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          A preview of what couples will browse at launch. Suppliers will be
          verified, with pricing shown upfront.
        </p>
      </Reveal>

      {/* Showcase only: tiles are non-interactive (no links) because there is no
          live inventory to browse yet. The action is to apply, below. */}
      <RevealGroup className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((c) => (
          <RevealItem key={c.slug}>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
                <Image
                  src={c.image}
                  alt={c.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-serif text-xl font-medium text-white sm:text-2xl">
                    {c.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/75">{c.blurb}</p>
                </div>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <p className="text-base text-muted">Offer one of these in Cebu?</p>
        <Link
          href="#apply"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          Apply for a founding listing
        </Link>
      </Reveal>
    </section>
  );
}
