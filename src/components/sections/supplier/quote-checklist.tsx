import { quotePromptsFor } from "@/lib/category-fields";

// "What to send for a quote" — sits under the contact card.
//
// Every CTA on this page is a direct deep link (Instagram / Messenger / Viber),
// which is deliberate: there is no enquiry form to funnel couples through. The
// cost of that is the vendor receives "hi how much po?" and a quoting round-trip
// begins. Vendors say this is their biggest frustration; they cannot quote without
// the date, the venue, and the one number that actually drives their price.
//
// So: no form, just tell the couple what to put in the message they were already
// about to send.
//
// The prompts are PER CATEGORY (see CATEGORY_QUOTE_PROMPTS) — that number is
// "how many faces" for a makeup artist and "how many hours" for a photographer.
// This used to be one makeup list gated on `styleTagsFor(category).length`, i.e.
// "has a style-tag vocab" standing in for "is makeup". That proxy would have
// started telling photographers to send their skin allergies the moment any other
// category got style tags.
export function QuoteChecklist({ category }: { category: string | null }) {
  const prompts = quotePromptsFor(category);
  if (!prompts.length) return null;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-6">
      <p className="font-medium text-ink">Before you message</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Include these and you will get a real quote back, not a question.
      </p>
      <dl className="mt-4 grid gap-3">
        {prompts.map(([term, hint]) => (
          <div key={term} className="text-sm leading-relaxed">
            <dt className="inline font-medium text-ink">{term}</dt>{" "}
            <dd className="inline text-muted">{hint}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
