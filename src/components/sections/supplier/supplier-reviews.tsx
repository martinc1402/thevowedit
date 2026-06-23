import { Star } from "@phosphor-icons/react/dist/ssr";
import type { SupplierReview } from "@/lib/suppliers";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          weight="fill"
          className={i < full ? "text-accent-fg" : "text-line"}
        />
      ))}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
}

// Reviews are read-only (admin/imported in the dashboard) — table-stakes trust.
export function SupplierReviews({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: SupplierReview[];
  rating: number | null;
  reviewCount: number;
}) {
  if (!reviews.length) return null;

  const [featured, ...rest] = reviews;
  const featuredWhen = formatDate(featured.date);

  return (
    <section aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="reviews-heading"
          className="font-serif text-2xl font-medium text-ink sm:text-3xl"
        >
          Reviews
        </h2>
        {rating != null && rating > 0 && (
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <Stars rating={rating} />
            <span className="font-medium text-ink">{rating.toFixed(1)}</span>
            {reviewCount > 0 && <span>({reviewCount})</span>}
          </span>
        )}
      </div>

      {/* Lead with one review as an editorial pull-quote; the rest sit in a
          lighter borderless grid below a single hairline. */}
      <figure className="mt-6">
        <Stars rating={featured.rating} />
        <blockquote className="mt-3 max-w-[34ch] font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]">
          “{featured.quote}”
        </blockquote>
        <figcaption className="mt-4 text-sm text-muted">
          {featured.author}
          {featuredWhen ? ` · ${featuredWhen}` : ""}
        </figcaption>
      </figure>

      {rest.length > 0 && (
        <div className="mt-8 grid gap-x-10 gap-y-7 border-t border-line pt-8 sm:grid-cols-2">
          {rest.map((r, i) => {
            const when = formatDate(r.date);
            return (
              <figure key={i}>
                <Stars rating={r.rating} />
                <blockquote className="mt-2 text-sm leading-relaxed text-ink">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-2 text-xs text-muted">
                  {r.author}
                  {when ? ` · ${when}` : ""}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
