"use client";

import { useState } from "react";
import { Play } from "@phosphor-icons/react";

// Parse a YouTube/Vimeo URL into an embeddable src. Returns null for anything we
// can't confidently embed, so the section simply renders nothing (no broken player).
function toEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (host.endsWith("youtube.com")) {
      const id =
        u.searchParams.get("v") ||
        (u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : "");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (host.endsWith("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
  } catch {
    // fall through
  }
  return null;
}

// Optional reel. Lazy by design: nothing third-party loads until the couple taps
// play (we render only a lightweight facade first), so it never costs the initial
// page load. Renders nothing when there's no (valid) URL.
export function SupplierVideo({
  url,
  supplierName,
}: {
  url?: string;
  supplierName: string;
}) {
  const [playing, setPlaying] = useState(false);
  if (!url) return null;
  const src = toEmbedSrc(url);
  if (!src) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">Video</h2>
      <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-line bg-surface-2">
        {playing ? (
          <iframe
            src={src}
            title={`${supplierName} video`}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${supplierName} video`}
            className="group absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_8px_24px_-12px_rgba(20,16,12,0.5)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
              <Play size={26} weight="fill" className="ml-0.5" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
