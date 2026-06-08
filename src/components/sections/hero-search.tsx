"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretDown, ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { heroMedia } from "@/lib/content";
import {
  APPLY_CATEGORIES,
  APPLY_AREAS,
  useApplyPrefill,
} from "@/components/apply-context";

export function HeroSearch() {
  const reduce = useReducedMotion();
  const { setPrefill } = useApplyPrefill();
  const [category, setCategory] = useState<string>(APPLY_CATEGORIES[0]);
  const [area, setArea] = useState<string>(APPLY_AREAS[0]);

  // Secondary couple capture (UI-only stub).
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notified, setNotified] = useState(false);

  // Progressive enhancement: the poster always paints (it's the LCP). We only
  // load + play the decorative video once mounted, and only when it's welcome:
  // not under reduced-motion, not on Save-Data, and not on small viewports.
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    setPlayVideo(true);
  }, [reduce]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !playVideo) return;
    v.load();
    const started = v.play();
    if (started) started.catch(() => {});
  }, [playVideo]);

  // Carry the supplier's "I offer / In" choices into the application form before
  // the native #apply anchor smooth-scrolls them down to it.
  function handleApply() {
    setPrefill({ category, area });
  }

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!notifyEmail) return;
    // TODO: connect to Supabase via server action - handled in a later step.
    setNotified(true);
  }

  const selectClass =
    "w-full appearance-none rounded-xl border border-line bg-surface px-4 py-3.5 text-base text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40";

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-ink">
      {/* Decorative background video. The poster (start-frame.png) paints first
          and is the LCP; the video is layered in the SAME box (object-cover, no
          layout shift) and only loads/plays as progressive enhancement. */}
      <video
        ref={videoRef}
        poster={heroMedia.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      >
        {playVideo && heroMedia.videoWebm && (
          <source src={heroMedia.videoWebm} type="video/webm" />
        )}
        {playVideo && <source src={heroMedia.videoMp4} type="video/mp4" />}
      </video>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-10 pt-24 sm:px-6 lg:px-10 lg:pb-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <h1 className="font-serif text-[2.7rem] font-medium leading-[1.04] text-white sm:text-6xl lg:text-7xl">
            Find trusted wedding suppliers in Cebu.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Compare real prices from photographers, caterers, venues and more.
            No inquire-for-a-quote guesswork.
          </p>
          <p className="mt-4 text-sm font-medium leading-relaxed text-white/90 sm:text-base">
            Launching soon in Cebu. We are inviting wedding suppliers to claim a
            free founding listing.
          </p>
        </motion.div>

        {/* Repurposed bar: the homepage's primary action is now turning a Cebu
            supplier into a founding applicant, not a couple browsing inventory. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 w-full max-w-3xl rounded-2xl border border-white/15 bg-bg/92 p-3 shadow-[0_24px_60px_-20px_rgba(20,16,12,0.55)] backdrop-blur-md sm:p-4"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_auto] lg:items-end">
            {/* Category */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">I offer</span>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={selectClass}
                  aria-label="What you offer"
                >
                  {APPLY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>

            {/* Area */}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">In</span>
              <div className="relative">
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={selectClass}
                  aria-label="Area served"
                >
                  {APPLY_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <CaretDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>

            {/* Apply: prefill then native smooth-scroll to the form */}
            <a
              href="#apply"
              onClick={handleApply}
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-accent px-6 text-base font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] lg:w-auto"
            >
              Apply for free listing
              <ArrowRight size={18} weight="bold" />
            </a>
          </div>
        </motion.div>

        {/* Secondary, couple-facing capture. Visibly secondary to the supplier CTA. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-3xl"
        >
          {notified ? (
            <p className="inline-flex items-center gap-2 text-sm text-white/90">
              <CheckCircle size={17} weight="fill" className="text-white" />
              You are on the list. We will email you when The Vow Edit launches.
            </p>
          ) : (
            <form
              onSubmit={handleNotify}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <label className="text-sm text-white/80">
                Planning a wedding? Get notified at launch.
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email for launch updates"
                  className="w-full rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/60 focus:border-white/60 focus:ring-2 focus:ring-white/30 sm:w-64"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 active:scale-[0.98]"
                >
                  Notify me
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
