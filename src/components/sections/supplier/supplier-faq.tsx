import type { SupplierFaq } from "@/lib/suppliers";

// Supplier Q&A. These answers carry the vendor's personality, so they're shown
// open (not hidden behind an accordion): question in serif, answer directly
// below in readable body text, generous spacing, light hairline dividers. Reads
// as a warm editorial interview rather than a support FAQ.
//
// Kept to a few personality questions. Style-descriptor questions ("describe
// your style in three words") are dropped because that answer now lives in the
// verdict's style tags — we don't repeat it here.
export function SupplierFaq({
  faq,
  limit = 3,
}: {
  faq: SupplierFaq[];
  limit?: number;
}) {
  const items = faq
    .filter((f) => f.q && f.a)
    .filter((f) => !/\b(three|3)\s+words\b/i.test(f.q))
    .slice(0, limit);
  if (!items.length) return null;

  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        In their words
      </h2>
      <div className="mt-6 divide-y divide-line border-t border-line">
        {items.map((f, i) => (
          <div key={i} className="py-7">
            <h3 className="font-serif text-xl leading-snug text-ink sm:text-2xl">
              {f.q}
            </h3>
            <p className="mt-3 max-w-[65ch] whitespace-pre-line text-base leading-relaxed text-muted">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
