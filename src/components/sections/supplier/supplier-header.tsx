import { SealCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { categories } from "@/lib/content";

const LABELS = new Map(categories.map((c) => [c.slug, c.label]));
const labelFor = (slug: string) => LABELS.get(slug) ?? slug;

// Friendlier role names for the hero subtitle. Falls back to the category label
// for anything unmapped.
const ROLE_LABELS: Record<string, string> = {
  makeup: "Makeup Artist",
  hair: "Hair Stylist",
  photographers: "Photographer",
  videographers: "Videographer",
  coordinators: "Wedding Coordinator",
  florists: "Florist",
  catering: "Caterer",
};
const roleFor = (slug: string) => ROLE_LABELS[slug] ?? labelFor(slug);

// The hero header: two small trust badges, the vendor name, a role + location
// line answering "who / where" at a glance, then an optional editorial tagline.
// Deliberately quiet — the gallery below is the focal point, and the loud chip
// clusters (style tags, coverage) now live in the verdict and essentials.
export function SupplierTitle({
  name,
  categories: cats = [],
  location,
  tagline,
  verified = false,
  featured = false,
}: {
  name: string;
  categories?: string[];
  location?: string;
  tagline?: string | null;
  verified?: boolean;
  featured?: boolean;
}) {
  const role = cats[0] ? roleFor(cats[0]) : null;
  const subtitle = [role, location].filter(Boolean).join(" · ");

  return (
    <div>
      {(featured || verified) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-ink">
              <Sparkle size={13} weight="fill" />
              Editor&rsquo;s Pick
            </span>
          )}
          {verified && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink">
              <SealCheck size={13} weight="fill" className="text-accent-fg" />
              Verified
            </span>
          )}
        </div>
      )}

      <h1 className="font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl">
        {name}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base font-medium text-muted sm:text-lg">
          {subtitle}
        </p>
      )}
      {tagline && (
        <p className="mt-3 max-w-[60ch] text-pretty font-serif text-xl italic leading-snug text-muted sm:text-2xl">
          {tagline}
        </p>
      )}
    </div>
  );
}
