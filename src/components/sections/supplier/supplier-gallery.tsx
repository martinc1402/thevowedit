"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";

// Supplier photo gallery: a large featured image + a thumbnail strip, with a
// full-screen lightbox (click the hero, arrow keys / Esc to navigate). Photos
// are a co-equal must-have alongside price, so this leads the page.
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

  return (
    <div>
      {/* Featured image */}
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="group relative block aspect-[3/2] w-full overflow-hidden rounded-2xl bg-surface-2"
        aria-label={`View ${name} photos`}
      >
        <Image
          src={images[active]}
          alt={`${name} — photo ${active + 1} of ${count}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1100px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </button>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2 transition ${
                i === active
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-bg"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
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
              alt={`${name} — photo ${active + 1} of ${count}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
