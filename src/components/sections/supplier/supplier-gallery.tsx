"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight, X, Images } from "@phosphor-icons/react";
import { GalleryCarousel } from "@/components/sections/supplier/gallery-carousel";

// Supplier photo gallery. Photos are a co-equal must-have alongside price, so
// this leads the page. Mobile is a single-photo swipe carousel with dots;
// desktop (>= 3 photos) gets an asymmetric editorial collage (one large hero +
// two stacked). Both open a full-screen lightbox (arrow keys / Esc).
export function SupplierGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const count = images.length;
  const go = (delta: number) =>
    setActive((i) => (i + delta + count) % count);
  const open = (i: number) => {
    setActive(i);
    setLightbox(true);
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, count]);

  if (count === 0) {
    return (
      <div className="aspect-[3/2] w-full rounded-2xl bg-surface-2" aria-hidden />
    );
  }

  // Desktop collage only earns its keep with 3+ photos; fewer falls back to the
  // mobile featured layout at all sizes.
  const collage = count >= 3;

  return (
    <div>
      {/* Mobile: single-photo swipe carousel with dots (tap opens the lightbox). */}
      <div className="md:hidden">
        <GalleryCarousel images={images} name={name} onOpen={open} />
      </div>

      {/* Desktop collage: one large hero + two stacked, outer corners clipped. */}
      {collage ? (
        <div className="hidden aspect-[3/2] w-full grid-cols-3 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid">
          <Tile
            src={images[0]}
            alt={`${name} - photo 1 of ${count}`}
            onClick={() => open(0)}
            className="col-span-2 row-span-2"
            sizes="(max-width: 768px) 0px, 640px"
          />
          <Tile
            src={images[1]}
            alt={`${name} - photo 2 of ${count}`}
            onClick={() => open(1)}
            sizes="(max-width: 768px) 0px, 320px"
          />
          <Tile
            src={images[2]}
            alt={`${name} - photo 3 of ${count}`}
            onClick={() => open(2)}
            sizes="(max-width: 768px) 0px, 320px"
          >
            {count > 3 && (
              <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <Images size={14} weight="fill" />
                {count - 3} more
              </span>
            )}
          </Tile>
        </div>
      ) : (
        /* Fewer than 3 photos: a single featured frame on desktop. */
        <button
          type="button"
          onClick={() => open(0)}
          className="group relative hidden aspect-[3/2] w-full overflow-hidden rounded-2xl bg-surface-2 md:block"
          aria-label={`View ${name} photos`}
        >
          <Image
            src={images[0]}
            alt={`${name} - photo 1 of ${count}`}
            fill
            sizes="(max-width: 768px) 0px, 1100px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </button>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
              >
                <CaretLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Next photo"
                className="absolute right-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
              >
                <CaretRight size={22} />
              </button>
            </>
          )}
          <div
            className="relative h-full max-h-[85vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`${name} - photo ${active + 1} of ${count}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          {count > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {active + 1} / {count}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// A single collage tile: a button wrapping a fill image, with optional overlay
// children (e.g. the "+N more" pill on the last visible tile).
function Tile({
  src,
  alt,
  onClick,
  sizes,
  className = "",
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  onClick: () => void;
  sizes: string;
  className?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={alt}
      className={`group relative overflow-hidden bg-surface-2 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      {children}
    </button>
  );
}
