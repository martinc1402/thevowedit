import Image from "next/image";
import { resolveStyleTag, styleTagsFor } from "@/lib/style-tags-vocab";

// The vendor's aesthetic, picked from a locked vocabulary. Deliberately NOT in the
// hero (kept quiet, the gallery is the focal point) and NOT in "the essentials"
// (that grid is practical logistics, and it's row-capped). It belongs with the
// vendor's own words. Exported so the dashboard preview can show it on the step
// where it's actually edited.
//
// The vocabulary is disjoint from the finish/technique/skin chips by construction,
// so nothing here repeats what the Specialties row already says.
//
// CATEGORY-GATED: style tags exist only for categories that have a vocabulary
// (today, makeup). A photographer's legacy free-text tags stay in the column but
// render nowhere — the concept doesn't apply to them yet.
export function StyleTags({
  tags,
  category,
}: {
  tags: string[];
  category: string | null;
}) {
  if (!styleTagsFor(category).length) return null;
  if (!tags.length) return null;
  return (
    <div className="mt-8 border-t border-line pt-5">
      <p className="text-sm text-muted">Signature style</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-line px-3 py-1 text-sm text-ink"
          >
            {/* Stored value is a key; unknown legacy free text passes through. */}
            {resolveStyleTag(tag)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// "Meet the supplier" — the people behind the listing. Team photo + bio give a
// face to it. The enquiry CTA is intentionally not repeated here; it lives in
// the sticky rail, the hero, and the closing invitation.
export function SupplierAbout({
  name,
  description,
  bio,
  teamPhoto,
  styleTags = [],
  category = null,
}: {
  name: string;
  description: string | null;
  bio: string | null;
  teamPhoto: string | null;
  styleTags?: string[];
  category?: string | null;
}) {
  // Tags that won't render (no vocab for this category) must not keep the section
  // alive on their own.
  const showTags = styleTagsFor(category).length > 0 && styleTags.length > 0;
  if (!description && !bio && !teamPhoto && !showTags) return null;

  const copy = (
    <div>
      {description && (
        <p className="max-w-[60ch] text-base leading-loose text-muted">
          {description}
        </p>
      )}
      {bio && (
        <p className="mt-4 max-w-[60ch] text-base leading-loose text-muted">
          {bio}
        </p>
      )}
      <StyleTags tags={styleTags} category={category} />
    </div>
  );

  return (
    <section aria-labelledby="about-heading" className="py-6 sm:py-10">
      <h2
        id="about-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Meet {name}
      </h2>

      {/* With a team photo: a prominent portrait on the LEFT, copy on the RIGHT.
          Without: copy runs full width (no empty grid cell). */}
      {teamPhoto ? (
        <div className="mt-8 grid gap-8 sm:grid-cols-[minmax(0,1fr)_1.25fr] sm:items-start sm:gap-12 lg:gap-14">
          <figure>
            <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-2xl bg-surface-2 shadow-[0_10px_30px_rgba(88,24,36,0.08)]">
              <Image
                src={teamPhoto}
                alt={`Portrait of ${name}`}
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </figure>
          {copy}
        </div>
      ) : (
        <div className="mt-8">{copy}</div>
      )}
    </section>
  );
}
