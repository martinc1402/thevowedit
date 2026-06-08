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

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
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

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
