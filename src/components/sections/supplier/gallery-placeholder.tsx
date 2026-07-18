import Image from "next/image";
import { GalleryCarousel } from "@/components/sections/supplier/gallery-carousel";

// Portfolio placeholder for suppliers without real photos yet. Mirrors the real
// <SupplierGallery>: a single-photo swipe carousel with dots on mobile, an
// Airbnb-style collage (one large lead frame + two stacked) on desktop. So the
// section looks the same before and after real photos land. Colour-consistent
// grayscale so it reads as one editorial portfolio rather than clashing stock.
//
// Images are lazy (never priority): each layout is display:none at the other
// breakpoint, and a priority fill image in a display:none box triggers Next's
// height-0 / sizes warnings.
//
// Deterministic seeds keep the frames stable across renders (no layout shift) and
// unique per vendor.
function seedUrl(slug: string, i: number, w: number, h: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(`${slug}-${i}`)}/${w}/${h}?grayscale`;
}

export function GalleryPlaceholder({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const key = slug || name.toLowerCase().replace(/\s+/g, "-");
  const slides = [
    seedUrl(key, 0, 1280, 854),
    seedUrl(key, 1, 1280, 854),
    seedUrl(key, 2, 1280, 854),
  ];

  return (
    <div>
      {/* Mobile: single-photo swipe carousel with dots. */}
      <div className="md:hidden">
        <GalleryCarousel images={slides} name={name} />
      </div>

      {/* Desktop: one large hero (2x2) + two stacked frames, clipped as one card. */}
      <div className="hidden aspect-[3/2] w-full grid-cols-3 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid md:max-h-[80dvh]">
        <div className="relative col-span-2 row-span-2 bg-surface-2">
          <Image
            src={seedUrl(key, 0, 1000, 1000)}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 767px) 0px, 720px"
            className="object-cover"
          />
        </div>
        <div className="relative bg-surface-2">
          <Image
            src={seedUrl(key, 1, 600, 450)}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 767px) 0px, 360px"
            className="object-cover"
          />
        </div>
        <div className="relative bg-surface-2">
          <Image
            src={seedUrl(key, 2, 600, 450)}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 767px) 0px, 360px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
