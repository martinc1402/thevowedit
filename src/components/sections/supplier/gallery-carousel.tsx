"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Mobile hero gallery: a single-photo swipeable carousel with pagination dots
// (Airbnb / Helm style). Native touch swipe via CSS scroll-snap — no gesture JS
// and no window scroll listener. The active dot is tracked with an
// IntersectionObserver on the slides. Images are lazy (never priority) because
// this renders inside a breakpoint-hidden wrapper; a priority fill image in a
// display:none box triggers Next's height-0 / sizes warnings.
export function GalleryCarousel({
  images,
  name,
  onOpen,
  focus,
}: {
  images: string[];
  name: string;
  onOpen?: (index: number) => void;
  // Per-photo crop anchor keyed by URL: [x, y] in 0-100 percent. Absent = centre.
  focus?: Record<string, [number, number]>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = images.length;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count < 2) return;
    const slides = Array.from(track.querySelectorAll<HTMLElement>("[data-slide]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.slide);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { root: track, threshold: 0.6 },
    );
    slides.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [count]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.querySelector<HTMLElement>(`[data-slide="${i}"]`);
    if (!slide) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    slide.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const slideClass =
    "relative aspect-[3/2] w-full shrink-0 snap-center overflow-hidden bg-surface-2";

  return (
    <div>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-2xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, i) => {
          const f = focus?.[src];
          const img = (
            <Image
              src={src}
              alt={onOpen ? `${name} - photo ${i + 1} of ${count}` : ""}
              fill
              loading="lazy"
              sizes="(max-width: 767px) calc(100vw - 2rem), 100vw"
              style={f ? { objectPosition: `${f[0]}% ${f[1]}%` } : undefined}
              className="object-cover"
            />
          );
          return onOpen ? (
            <button
              key={src + i}
              type="button"
              data-slide={i}
              onClick={() => onOpen(i)}
              aria-label={`View ${name} photo ${i + 1} of ${count}`}
              className={slideClass}
            >
              {img}
            </button>
          ) : (
            <div key={src + i} data-slide={i} className={slideClass}>
              {img}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-accent" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
