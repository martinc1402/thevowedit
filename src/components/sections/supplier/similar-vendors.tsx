import Image from "next/image";
import { MapPin } from "@phosphor-icons/react/dist/ssr";

// PLACEHOLDER DATA — these are NOT real suppliers in the database yet.
// TODO: replace with a real "more in this category / nearby" query once more
// Cebu suppliers are published. Thumbnails use picsum seeds (also placeholder).
const PLACEHOLDER_SIMILAR = [
  {
    name: "Cebu Bridal Beauty Studio",
    category: "Makeup Artist",
    location: "Cebu City",
    seed: "cebu-bridal-beauty-studio",
  },
  {
    name: "Soft Glam by Ana",
    category: "Makeup Artist",
    location: "Mandaue",
    seed: "soft-glam-by-ana",
  },
  {
    name: "Mactan Bridal Makeup Co.",
    category: "Makeup Artist",
    location: "Lapu-Lapu",
    seed: "mactan-bridal-makeup-co",
  },
];

// "You may also like" — a light discovery rail at the foot of the profile.
// Non-linking for now (placeholder vendors); wire to real profiles later.
export function SimilarVendors() {
  return (
    <section aria-labelledby="similar-heading">
      <h2
        id="similar-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        You may also like
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {PLACEHOLDER_SIMILAR.map((vendor) => (
          <article
            key={vendor.name}
            className="overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <div className="relative aspect-[4/3] w-full bg-surface-2">
              <Image
                src={`https://picsum.photos/seed/${vendor.seed}/480/360`}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg font-medium text-ink">
                {vendor.name}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <MapPin size={13} weight="fill" className="text-accent-fg" />
                {vendor.category} · {vendor.location}
              </p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Placeholder suggestions. Real recommendations coming soon.
      </p>
    </section>
  );
}
