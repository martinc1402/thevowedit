import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { realWeddings } from "@/lib/content";
import { Reveal } from "@/components/reveal";

function dimsFor(w: { tall?: boolean; wide?: boolean }) {
  if (w.tall) return { ratio: "aspect-[3/4]", px: "600/800" };
  if (w.wide) return { ratio: "aspect-[4/3]", px: "800/600" };
  return { ratio: "aspect-[5/6]", px: "640/760" };
}

export function RealWeddings() {
  // Hide the whole section (heading included) until real weddings are published.
  if (realWeddings.length === 0) return null;

  return (
    <section id="real-weddings" className="bg-surface-2/50">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <Reveal className="mb-9 max-w-2xl lg:mb-12">
          <h2 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
            Real weddings in Cebu
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Decide by what you can actually see. Browse real celebrations and the
            suppliers who made them happen.
          </p>
        </Reveal>

        {/* Editorial collage via CSS columns - varied heights, scattered rhythm */}
        <div className="columns-2 gap-3 sm:gap-4 lg:columns-3">
          {realWeddings.map((w, i) => {
            const d = dimsFor(w);
            return (
              <Reveal
                key={w.slug}
                delay={(i % 3) * 0.05}
                className="mb-3 break-inside-avoid sm:mb-4"
              >
                <Link href={`/real-weddings/${w.slug}`} className="group block">
                  <div className={`relative ${d.ratio} w-full overflow-hidden rounded-2xl border border-line`}>
                    {/* TODO: swap picsum seed for real wedding photography */}
                    <Image
                      src={`https://picsum.photos/seed/${w.seed}/${d.px}`}
                      alt={`${w.couple}, ${w.setting} wedding in ${w.location}`}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <ArrowUpRight size={15} weight="bold" />
                    </span>
                  </div>
                  <div className="mt-2.5 px-0.5">
                    <h3 className="font-serif text-lg font-medium text-ink">
                      {w.couple}
                    </h3>
                    <p className="text-sm text-muted">
                      {w.setting}, {w.location}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
