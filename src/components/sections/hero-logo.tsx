"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";

// Logo hero: the real the-vow-edit.svg (cream, via mask) centred on the wine
// field. It appears dramatically on load (fade + scale up, settling at a fixed
// 1.7) and then HOLDS — the hero is pinned (sticky) and the page below scrolls
// up and over it (a clean "hold & cover" reveal). No scroll-linked motion on the
// logo, so there's no reversible fade. A bouncing down-chevron cues scrolling and
// fades out before the content covers it.

const WINE = "#581824";
const EASE = [0.16, 1, 0.3, 1] as const;

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

// 46vh base x 1.7 ≈ 78vh rendered — prominent but fits with room for the cue.
const LOGO_CLASS =
  "aspect-[2032/2352] h-[clamp(260px,46vh,520px)] max-w-[90vw] bg-ink";

export function HeroLogo() {
  const reduce = useReducedMotion();
  // Fade the scroll cue out as the page starts scrolling (before content covers
  // it). Page-level scroll position; no scroll listener.
  const { scrollY } = useScroll();
  const cueOpacity = useTransform(scrollY, [0, 150], [1, 0]);

  return (
    <section
      className="sticky top-0 z-0 flex h-[100svh] items-center justify-center overflow-hidden"
      style={{ backgroundColor: WINE }}
    >
      <motion.div
        role="img"
        aria-label="The Vow Edit"
        className={LOGO_CLASS}
        style={LOGO_MASK}
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1.7 }}
        transition={{ duration: reduce ? 0 : 1.05, ease: EASE }}
      />

      {/* Scroll cue: bounces (unless reduced motion), fades out as you scroll. */}
      <motion.div
        aria-hidden
        style={{ opacity: cueOpacity }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <CaretDown size={28} weight="light" className="text-ink/70" />
        </motion.div>
      </motion.div>
    </section>
  );
}
