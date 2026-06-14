"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Scroll-reveal wrapper (MOTION_INTENSITY 5). Fades + lifts children into view once.
 * Collapses to static instantly under prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  // `initial` must NOT branch on `reduce`: it renders to the DOM, and the server
  // has no media query (always non-reduced), so a reduce-dependent initial would
  // mismatch on hydration for reduced-motion clients. Keep initial constant and
  // make reduced motion a zero-duration transition instead (snap, no slide/fade).
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Layout wrapper for a set of revealing children. Each RevealItem reveals
 * itself on scroll, so the group is a plain container and never gates its
 * children's visibility on a single orchestration trigger. This keeps grids
 * robust: a flaky scroll/hydration race can never leave a row stuck hidden.
 */
export function RevealGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/**
 * Self-contained reveal leaf. Each item is observed directly, so it fades + lifts
 * in when it enters the viewport (or immediately if already in view on load) and
 * is guaranteed to end fully visible. Collapses to static under reduced motion.
 */
export function RevealItem({
  children,
  className = "",
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();

  // Constant `initial` to avoid a reduced-motion hydration mismatch (see Reveal).
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
