import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { trustStats, testimonials } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";

export function TrustBand() {
  const hasStats = trustStats.length > 0;
  const hasTestimonials = testimonials.length > 0;

  // Nothing real to show yet → render nothing, rather than invent credibility.
  if (!hasStats && !hasTestimonials) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      {hasStats && (
        <Reveal>
          <div className="grid grid-cols-3 gap-4 border-y border-line py-8 sm:py-10">
            {trustStats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-4xl font-medium text-ink sm:text-6xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-muted sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {hasTestimonials && (
        <RevealGroup
          className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${hasStats ? "mt-14" : ""}`}
        >
          {testimonials.map((t) => (
            <RevealItem key={t.name}>
              <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-7 sm:p-8">
                <Quotes size={28} weight="fill" className="text-accent-fg" />
                <blockquote className="mt-4 font-serif text-2xl font-medium leading-snug text-ink sm:text-[1.7rem]">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 text-sm text-muted">
                  <span className="font-medium text-ink">{t.name}</span>
                  <span className="mx-1.5">·</span>
                  {t.role}
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </section>
  );
}
