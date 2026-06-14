"use client";

import { motion, useReducedMotion } from "motion/react";

// Welcome hero: the locked wine field (bg-bg = #581824) with the wordmark logo
// centered on top in brand off-white. The SVG is fill="currentColor" with a
// built-in cream, and the project renders SVGs as plain <img> (no SVGR), so we
// recolor it to the exact `ink` token via a single-colour CSS mask: the mask is
// the logo shape, the off-white comes from `bg-ink`.
const LOGO_MASK = {
  maskImage: "url(/images/icons/the-vow-edit.svg)",
  WebkitMaskImage: "url(/images/icons/the-vow-edit.svg)",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskSize: "contain",
  WebkitMaskSize: "contain",
} as const;

export function HeroSearch() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center bg-bg px-6">
      <motion.div
        role="img"
        aria-label="The Vow Edit"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={LOGO_MASK}
        className="h-[clamp(360px,74vh,880px)] aspect-[2032/2352] max-w-[92vw] bg-ink"
      />
    </section>
  );
}
