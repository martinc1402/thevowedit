import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BrowseRows } from "@/components/browse/browse-rows";
import { heroMedia } from "@/lib/content";
import { getAllListings } from "@/lib/directory";
import { MVP_LAUNCH } from "@/lib/launch";

export const metadata: Metadata = {
  title: "Browse wedding suppliers in Cebu",
  description:
    "Browse verified Cebu wedding suppliers by category and area, with real PHP prices shown upfront. Photographers, videographers, content creators, venues, catering and more.",
};

// ISR: cached, but re-fetches suppliers from Supabase at most once a minute, so
// new/edited suppliers appear without a redeploy (same policy as listing pages).
export const revalidate = 60;

export default async function BrowsePage() {
  if (MVP_LAUNCH) notFound();
  const listings = await getAllListings();

  return (
    <>
      <SiteNav />
      <main>
        {/* Compact, tone-setting hero band. Partial height (not full-screen) so
            the chooser below sits at or near the fold. Reuses the homepage hero
            still as the background for a consistent feel. */}
        <section className="relative flex min-h-[42vh] flex-col justify-end overflow-hidden bg-ink lg:min-h-[46vh]">
          <Image
            src={heroMedia.poster}
            alt="Wedding ceremony at a garden venue in Cebu"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Scrims for text contrast over the photo, in the same spirit as the
              homepage hero (works in both themes). */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
          />

          <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-10 pt-24 sm:px-6 lg:px-10 lg:pb-14">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-medium tracking-wide text-white ring-1 ring-white/20 backdrop-blur-sm">
                <SealCheck size={15} weight="fill" className="text-white" />
                Look for the verified badge
              </p>
              <h1 className="font-serif text-4xl font-medium leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                Browse wedding suppliers in Cebu
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Real prices shown upfront, every supplier personally checked by
                The Vow Edit. Pick a category and area to start.
              </p>
            </div>
          </div>
        </section>

        <BrowseRows listings={listings} />
      </main>
      <SiteFooter />
    </>
  );
}
