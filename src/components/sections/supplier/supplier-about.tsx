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
  return (
    <section aria-labelledby="about-heading">
      <h2
        id="about-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        About {name}
      </h2>

      {description && (
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">
          {description}
        </p>
      )}

      {(bio || teamPhoto) && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-line bg-surface-2 p-4">
          {teamPhoto && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface">
              <Image
                src={teamPhoto}
                alt={`The team at ${name}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          )}
          {bio && (
            <p className="text-sm leading-relaxed text-muted">{bio}</p>
          )}
        </div>
      )}
    </section>
  );
}
