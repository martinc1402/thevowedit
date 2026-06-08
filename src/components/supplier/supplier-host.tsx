import { SafeImage } from "@/components/directory/safe-image";

// "Meet your supplier" — humanises the listing with a team photo and/or a short
// personal bio (distinct from the business `description`). Weddings are
// relationship-driven, so this helps couples connect with the person behind the
// work. Renders NOTHING until there's real data: no empty avatar, no placeholder.
export function SupplierHost({
  name,
  role,
  teamPhoto,
  bio,
}: {
  name: string;
  role: string; // primary-category singular, e.g. "photographer"
  teamPhoto?: string;
  bio?: string;
}) {
  if (!teamPhoto && !bio) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
        Meet your {role}
      </h2>
      <div className="mt-5 flex flex-col gap-5 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-8">
        {teamPhoto && (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface-2 sm:h-32 sm:w-32">
            <SafeImage
              src={teamPhoto}
              alt={`${name}, ${role}`}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 112px, 128px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-serif text-xl font-medium text-ink">{name}</p>
          <p className="mt-0.5 text-sm text-muted">Wedding {role}</p>
          {bio && (
            <p className="mt-3 max-w-prose text-base leading-relaxed text-muted">
              {bio}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
