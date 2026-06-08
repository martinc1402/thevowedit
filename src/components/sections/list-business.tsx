import Link from "next/link";
import { Storefront } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

export function ListBusiness() {
  return (
    <section className="bg-surface-2/50">
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink">
            <Storefront size={26} weight="regular" />
          </span>
          <h2 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
            Run a wedding business in Cebu?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted">
            Get found by couples actively searching and booking. Listing is free,
            and verified suppliers get the badge couples look for.
          </p>
          <Link
            href="/for-suppliers"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-base font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
          >
            List your business
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
