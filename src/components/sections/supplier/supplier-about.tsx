import Image from "next/image";

// The vendor's own aesthetic vocabulary. Deliberately NOT in the hero (kept
// quiet, the gallery is the focal point) and NOT in "the essentials" (that grid
// is practical logistics a couple weighs, and it's row-capped). It belongs with
// the vendor's own words. Exported so the dashboard preview can show it on the
// step where it's actually edited.
export function StyleTags({ tags }: { tags: string[] }) {
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
            {tag}
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
}: {
  name: string;
  description: string | null;
  bio: string | null;
  teamPhoto: string | null;
  styleTags?: string[];
}) {
  if (!description && !bio && !teamPhoto && !styleTags.length) return null;

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
      <StyleTags tags={styleTags} />
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
