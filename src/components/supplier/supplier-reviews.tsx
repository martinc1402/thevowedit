"use client";

import { useState } from "react";
import { Quotes, Star } from "@phosphor-icons/react";
import type { SupplierReview } from "@/lib/types";

// Reviews/testimonials. Renders nothing until there are real reviews — no fake
// quotes, no empty shell, no "0 reviews" placeholder at launch. Driven purely by
// the supplier's real `reviews` data, so fabricated reviews can never surface on
// a real supplier. Airbnb-style: a summary (avg rating + count), a spacious card
// grid, and a "Show all reviews" toggle once there are more than a handful.
const VISIBLE = 6;

export function SupplierReviews({
  reviews,
  supplierName,
  rating,
  reviewCount,
}: {
  reviews?: SupplierReview[];
  supplierName: string;
  rating: number;
  reviewCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!reviews || reviews.length === 0) return null;

  // Average: prefer the supplier's aggregate rating; fall back to the mean of the
  // reviews we hold. Count: the aggregate total, never less than the cards shown.
  const avg =
    rating > 0
      ? rating
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const count = Math.max(reviewCount, reviews.length);

  const shown = expanded ? reviews : reviews.slice(0, VISIBLE);
  const canExpand = reviews.length > VISIBLE;

  return (
    <section>
      <h2 className="font-serif text-2xl font-medium text-ink sm:text-3xl">
        What couples say about {supplierName}
      </h2>
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink">
        <Star size={16} weight="fill" className="text-accent-fg" />
        <span className="font-medium">{avg.toFixed(1)}</span>
        <span className="text-muted">
          · {count} {count === 1 ? "review" : "reviews"}
        </span>
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {shown.map((r, i) => (
          <figure
            key={`${r.author}-${i}`}
            className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6 sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <Quotes size={24} weight="fill" className="text-accent-fg" />
              <span className="inline-flex items-center gap-1 text-sm text-ink">
                <Star size={14} weight="fill" className="text-accent-fg" />
                {r.rating.toFixed(1)}
              </span>
            </div>
            <blockquote className="mt-3 font-serif text-xl font-medium leading-snug text-ink">
              {r.quote}
            </blockquote>
            <figcaption className="mt-5 text-sm text-muted">
              <span className="font-medium text-ink">{r.author}</span>
              {r.date && (
                <>
                  <span className="mx-1.5">·</span>
                  {r.date}
                </>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-6 inline-flex items-center rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-ink/25 hover:bg-surface-2 active:scale-[0.98]"
        >
          {expanded ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </section>
  );
}
