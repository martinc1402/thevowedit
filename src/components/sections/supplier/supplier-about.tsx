import Image from "next/image";

// About + the people. Builds trust; the team photo + short bio give a face to
// the listing.
export function SupplierAbout({
  name,
  description,
  bio,
  teamPhoto,
}: {
  name: string;
  description: string | null;
  bio: string | null;
  teamPhoto: string | null;
}) {
  if (!description && !bio && !teamPhoto) return null;

  const copy = (
    <div>
      {description && (
        <p className="max-w-[60ch] text-base leading-relaxed text-muted">
          {description}
        </p>
      )}
      {bio && (
        <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-muted">
          {bio}
        </p>
      )}
    </div>
  );

  return (
    <section aria-labelledby="about-heading">
      <h2
        id="about-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        About {name}
      </h2>

      {/* With a team photo: copy beside a portrait. Without: copy runs full
          width (no empty grid cell). */}
      {teamPhoto ? (
        <div className="mt-5 grid gap-6 sm:grid-cols-[1fr_240px] sm:items-start sm:gap-8">
          {copy}
          <figure className="order-first sm:order-last">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-2 sm:max-w-[240px]">
              <Image
                src={teamPhoto}
                alt={`The team at ${name}`}
                fill
                sizes="(max-width: 640px) 100vw, 240px"
                className="object-cover"
              />
            </div>
          </figure>
        </div>
      ) : (
        <div className="mt-5">{copy}</div>
      )}
    </section>
  );
}
