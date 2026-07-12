import { styleTagsFor } from "@/lib/style-tags-vocab";

// "What to send for a quote" — sits under the contact card.
//
// Every CTA on this page is a direct deep link (Instagram / Messenger / Viber),
// which is deliberate: there is no enquiry form to funnel couples through. The
// cost of that is the artist receives "hi how much po?" and a quoting round-trip
// begins. Artists say this is their single biggest frustration; they cannot quote
// without the date, the venue, the call time, and above all the HEAD COUNT, which
// is what actually drives a Filipino wedding bill.
//
// So: no form, just tell the couple what to put in the message they were already
// about to send. Costs nothing and makes the first message worth answering.
//
// Category-gated the same way style tags are — the prompts below are makeup-specific
// (call time, faces, skin concerns), so they only show for a category we have a
// vocabulary for.
const PROMPTS = [
  ["Wedding date", "and whether it is a church or civil rite"],
  ["Venue", "or at least the area — travel changes the quote"],
  ["Ceremony time", "an early call means a 3-5 AM start"],
  ["How many faces", "bride, mothers, ninang, bridesmaids — this drives the price"],
  ["A peg or two", "a photo says more than “natural glam”"],
  ["Skin concerns", "sensitivities or allergies, so the kit is ready"],
];

export function QuoteChecklist({ category }: { category: string | null }) {
  if (!styleTagsFor(category).length) return null;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface-2 p-6">
      <p className="font-medium text-ink">Before you message</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Include these and you will get a real quote back, not a question.
      </p>
      <dl className="mt-4 grid gap-3">
        {PROMPTS.map(([term, hint]) => (
          <div key={term} className="text-sm leading-relaxed">
            <dt className="inline font-medium text-ink">{term}</dt>{" "}
            <dd className="inline text-muted">{hint}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
