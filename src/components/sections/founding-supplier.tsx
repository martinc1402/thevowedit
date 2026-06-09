import {
  Storefront,
  Gift,
  MagnifyingGlass,
  SealCheck,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { ApplyForm } from "@/components/sections/apply-form";

const benefits = [
  {
    icon: Gift,
    title: "A free founding listing",
    body: "Claim your spot at no cost. Founding suppliers are listed free, with no commission on bookings.",
  },
  {
    icon: MagnifyingGlass,
    title: "Get found at launch",
    body: "Be in front of Cebu couples the day they start searching, not months after everyone else.",
  },
  {
    icon: SealCheck,
    title: "A verified badge",
    body: "We are verifying founding suppliers before launch, so couples can see at a glance who has been checked.",
  },
  {
    icon: Trophy,
    title: "Early-mover advantage",
    body: "First suppliers in a category set the bar and keep the visibility that comes with being early.",
  },
];

export function FoundingSupplier() {
  return (
    <section
      id="apply"
      className="scroll-mt-20 bg-surface-2/50"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-10 lg:py-28">
        <Reveal className="lg:max-w-xl">
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-accent-fg">
            <Storefront size={18} weight="bold" />
            For Cebu wedding suppliers
          </p>
          <h2 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
            Run a wedding business in Cebu?
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            We are inviting the first wedding suppliers in Cebu to claim a free
            founding listing before launch. Apply now to get found by couples the
            moment they start planning.
          </p>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <li
                  key={b.title}
                  className="rounded-xl border border-line bg-surface p-5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink">
                    <Icon size={20} weight="regular" />
                  </span>
                  <h3 className="mt-3 font-serif text-xl font-medium text-ink">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {b.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_18px_44px_-28px_rgba(20,16,12,0.4)] sm:p-7">
            <h3 className="font-serif text-2xl font-medium text-ink">
              Apply for a founding listing
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Takes a minute. We will be in touch before launch.
            </p>
            <div className="mt-6">
              <ApplyForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
