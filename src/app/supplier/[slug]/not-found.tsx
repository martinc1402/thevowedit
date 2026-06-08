import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export default function SupplierNotFound() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex max-w-[1400px] flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-10">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
          <MagnifyingGlass size={22} weight="bold" />
        </span>
        <h1 className="mt-5 font-serif text-3xl font-medium text-ink sm:text-4xl">
          Supplier not found
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
          We could not find that supplier. It may have been removed, or the link
          may be out of date.
        </p>
        <Link
          href="/photographers/cebu"
          className="mt-7 inline-flex rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          Browse photographers in Cebu
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
