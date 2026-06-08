import Image from "next/image";
import { weddingTypes } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";

export function WeddingTypes() {
  return (
    <section className="bg-surface-2/50">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal className="mb-9 flex flex-col gap-3 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
            The weddings couples are picturing
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-muted">
            Many couples in Cebu choose the setting first. At launch they will
            find suppliers who already work that kind of day.
          </p>
        </Reveal>

        {/* Showcase only: non-interactive while pre-launch. */}
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {weddingTypes.map((t) => (
            <RevealItem key={t.href}>
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
                  <Image
                    src={t.image}
                    alt={t.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="px-5 py-5">
                  <h3 className="font-serif text-2xl font-medium text-ink">
                    {t.label}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{t.tagline}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
