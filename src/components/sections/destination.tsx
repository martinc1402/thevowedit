import { Check, AirplaneTilt } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

const points = [
  "All-inclusive packages with pricing shown upfront",
  "Coordinators who handle everything on the ground",
  "Video walkthroughs of venues you cannot visit yet",
];

export function Destination() {
  return (
    <section id="destination" className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
      <Reveal>
        <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-accent-fg">
          <AirplaneTilt size={18} weight="bold" />
          For balikbayan and overseas couples
        </p>
        <h2 className="max-w-3xl font-serif text-4xl font-medium leading-[1.12] text-ink sm:text-5xl">
          Planning your Cebu wedding from abroad?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          You should not have to fly home just to get a quote. Work with
          trusted suppliers and coordinators who run the whole day remotely.
        </p>
        <ul className="mt-7 grid gap-3.5 sm:grid-cols-3 sm:gap-8 lg:max-w-5xl">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-ink">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                <Check size={14} weight="bold" />
              </span>
              <span className="text-base leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
