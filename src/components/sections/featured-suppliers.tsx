import Link from "next/link";
import Image from "next/image";
import { SealCheck, Star } from "@phosphor-icons/react/dist/ssr";
import { featuredSuppliers } from "@/lib/content";
import { Reveal } from "@/components/reveal";

export function FeaturedSuppliers() {
  // Hide the whole section (heading included) until real suppliers exist.
  if (featuredSuppliers.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Reveal className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
        <div className="max-w-xl">
          <h2 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
            Featured verified suppliers
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Hand-checked teams with real reviews and pricing. The green badge means
            we confirmed their work and bookings.
          </p>
        </div>
        <Link
          href="/photographers/cebu"
          className="hidden shrink-0 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 sm:inline-flex"
        >
          View all
        </Link>
      </Reveal>

      {/* Horizontal scroll-snap: thumb-flick on mobile, full row on desktop */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {featuredSuppliers.map((s) => (
          <Link
            key={s.slug}
            href={`/supplier/${s.slug}`}
            className="group w-[78%] shrink-0 snap-start sm:w-[320px] lg:w-[360px]"
          >
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_18px_44px_-24px_rgba(20,16,12,0.45)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {/* TODO: swap picsum seed for real supplier photography */}
                <Image
                  src={`https://picsum.photos/seed/${s.seed}/720/540`}
                  alt={`${s.name}, ${s.category} in ${s.area}`}
                  fill
                  sizes="(max-width: 640px) 78vw, 360px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-ink shadow-sm">
                  <SealCheck size={14} weight="fill" />
                  Verified
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-2xl font-medium leading-tight text-ink">
                    {s.name}
                  </h3>
                  <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm text-ink">
                    <Star size={15} weight="fill" className="text-accent-fg" />
                    {s.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {s.category} · {s.area}
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                  <p className="text-sm text-muted">
                    from <span className="font-medium text-ink">{s.from}</span>
                  </p>
                  <span className="text-xs text-muted">{s.reviews} reviews</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
