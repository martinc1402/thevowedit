"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type SafeImageProps = ImageProps & {
  // Optional local fallback used ONLY when the real `src` is missing or fails to
  // load (e.g. dev placeholder, see lib/dev-placeholders). The real `src` always
  // takes priority. When omitted, behavior is unchanged: the <img> hides on error
  // and the parent's neutral bg (bg-surface-2) shows a clean blank tile.
  fallbackSrc?: string;
};

// next/image that fails gracefully. The real source is always tried first. If it
// errors and a fallbackSrc is provided, we swap to it; otherwise (or if the
// fallback also fails) the <img> is hidden (opacity-0) so the browser's
// broken-image icon never paints. The alt attribute stays for a11y/SEO.
export function SafeImage({
  className = "",
  fallbackSrc,
  src,
  ...props
}: SafeImageProps) {
  // Empty/missing real src: start from the fallback immediately (dev only).
  const [current, setCurrent] = useState<ImageProps["src"]>(src || fallbackSrc || "");
  const [broken, setBroken] = useState(false);

  function handleError() {
    if (fallbackSrc && current !== fallbackSrc) {
      setCurrent(fallbackSrc); // real image failed → fall back to the local image
    } else {
      setBroken(true); // no fallback (production), or fallback also failed → hide
    }
  }

  if (!current) return null; // nothing to show; parent neutral bg stands in

  return (
    <Image
      {...props}
      src={current}
      onError={handleError}
      className={`${className} ${broken ? "opacity-0" : ""}`}
    />
  );
}
