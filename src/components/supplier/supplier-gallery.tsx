"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, SquaresFour, X } from "@phosphor-icons/react";
import { SafeImage } from "@/components/directory/safe-image";
import type { GalleryImage } from "@/lib/types";

// Airbnb-style hero gallery. Desktop renders a mosaic (one large image + a 2x2
// grid of four, in a single rounded panel) with a "Show all photos" button;
// mobile renders a single hero + the same button. Clicking any tile, or the
// button, opens the existing lightbox (prev/next, keyboard, swipe). Reuses
// SafeImage (missing files fall back to the neutral bg-surface-2 tile) and the
// existing rounded-2xl / border-line / accent tokens.
//
// Graceful degradation by image count (no empty cells at any count):
//   0   -> renders nothing (page keeps the portfolio-links fallback).
//   1   -> single hero.
//   2   -> equal split.
//   3   -> one large left + two stacked right.
//   4   -> even 2x2.
//   5+  -> one large left + 2x2 right; "Show all photos" covers the overflow.

const sizesFull = "(max-width: 1024px) 100vw, 1320px"; // single full-width hero (desktop)
const sizesHalf = "(max-width: 1024px) 100vw, 700px"; // mobile hero + desktop half-width tiles
const sizesSmall = "(max-width: 1024px) 50vw, 360px"; // small mosaic tiles

function Tile({
  img,
  onClick,
  className,
  sizes,
  priority,
}: {
  img: GalleryImage;
  onClick: () => void;
  className: string; // caller controls aspect / grid-span / rounding
  sizes: string;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${img.alt}`}
      className={`group relative overflow-hidden bg-surface-2 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${className}`}
    >
      <SafeImage
        src={img.src}
        alt={img.alt}
        fill
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={sizes}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    </button>
  );
}

function ShowAllButton({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:border-ink/25 hover:bg-surface-2 active:scale-[0.98] ${className}`}
    >
      <SquaresFour size={16} weight="bold" className="text-accent-fg" />
      Show all photos
    </button>
  );
}

// Desktop mosaic: a single rounded panel, tiles flush with hairline gaps.
function DesktopMosaic({
  images,
  show,
}: {
  images: GalleryImage[];
  show: (i: number) => void;
}) {
  const n = images.length;
  const panel = "grid gap-2 overflow-hidden rounded-2xl";

  if (n === 1) {
    return (
      <Tile
        img={images[0]}
        onClick={() => show(0)}
        className="aspect-[16/9] w-full rounded-2xl border border-line"
        sizes={sizesFull}
        priority
      />
    );
  }

  if (n === 2) {
    return (
      <div className={`${panel} aspect-[2/1] grid-cols-2`}>
        {images.map((img, i) => (
          <Tile
            key={i}
            img={img}
            onClick={() => show(i)}
            className="h-full w-full"
            sizes={sizesHalf}
            priority={i === 0}
          />
        ))}
      </div>
    );
  }

  if (n === 3) {
    return (
      <div className={`${panel} aspect-[3/2] grid-cols-3 grid-rows-2`}>
        <Tile
          img={images[0]}
          onClick={() => show(0)}
          className="col-span-2 row-span-2 h-full w-full"
          sizes={sizesHalf}
          priority
        />
        {images.slice(1, 3).map((img, i) => (
          <Tile
            key={i}
            img={img}
            onClick={() => show(i + 1)}
            className="h-full w-full"
            sizes={sizesSmall}
          />
        ))}
      </div>
    );
  }

  if (n === 4) {
    return (
      <div className={`${panel} aspect-[16/10] grid-cols-2 grid-rows-2`}>
        {images.slice(0, 4).map((img, i) => (
          <Tile
            key={i}
            img={img}
            onClick={() => show(i)}
            className="h-full w-full"
            sizes={sizesHalf}
            priority={i === 0}
          />
        ))}
      </div>
    );
  }

  // 5+ : one large left + a 2x2 of the next four.
  return (
    <div className={`${panel} aspect-[2/1] grid-cols-4 grid-rows-2`}>
      <Tile
        img={images[0]}
        onClick={() => show(0)}
        className="col-span-2 row-span-2 h-full w-full"
        sizes={sizesHalf}
        priority
      />
      {images.slice(1, 5).map((img, i) => (
        <Tile
          key={i}
          img={img}
          onClick={() => show(i + 1)}
          className="h-full w-full"
          sizes={sizesSmall}
        />
      ))}
    </div>
  );
}

export function SupplierGallery({ images }: { images: GalleryImage[] }) {
  const n = images.length;
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setOpen(false), []);
  const show = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);
  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);

  // Keyboard nav + scroll lock while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, prev, next]);

  if (n === 0) return null;

  return (
    <div>
      {/* MOBILE: single hero + "Show all photos". */}
      <div className="lg:hidden">
        <Tile
          img={images[0]}
          onClick={() => show(0)}
          className="aspect-[4/3] w-full rounded-2xl border border-line"
          sizes={sizesHalf}
          priority
        />
        {n > 1 && (
          <div className="mt-3">
            <ShowAllButton onClick={() => show(0)} />
          </div>
        )}
      </div>

      {/* DESKTOP: mosaic with an overlaid "Show all photos" button. */}
      <div className="relative hidden lg:block">
        <DesktopMosaic images={images} show={show} />
        {n > 1 && (
          <ShowAllButton
            onClick={() => show(0)}
            className="absolute bottom-4 right-4 z-10"
          />
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          onClick={close}
          className="fixed inset-0 z-[60] flex flex-col bg-ink/90 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-4 py-3 text-accent-ink sm:px-6">
            <span className="text-sm tabular-nums">
              {index + 1} / {n}
            </span>
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="rounded-full p-2 transition-colors hover:bg-accent-ink/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink/40"
            >
              <X size={22} weight="bold" />
            </button>
          </div>

          <div
            className="relative flex-1"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 40 && n > 1) (dx > 0 ? prev : next)();
            }}
          >
            <SafeImage
              key={index}
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />

            {n > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-accent-ink transition-colors hover:bg-accent-ink/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink/40 sm:left-5"
                >
                  <CaretLeft size={26} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-accent-ink transition-colors hover:bg-accent-ink/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink/40 sm:right-5"
                >
                  <CaretRight size={26} weight="bold" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
