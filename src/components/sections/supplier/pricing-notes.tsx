// "What's included" / pricing FAQ. Vague pricing is the #1 reason couples ghost,
// so this lets a supplier spell out what the price does and doesn't cover.
export function PricingNotes({ notes }: { notes: string | null }) {
  if (!notes) return null;
  return (
    <section aria-labelledby="whats-included-heading">
      <h2
        id="whats-included-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        What&apos;s included
      </h2>
      <div className="mt-4 border-l-2 border-accent-fg pl-5">
        <p className="max-w-[65ch] whitespace-pre-line text-sm leading-relaxed text-muted">
          {notes}
        </p>
      </div>
    </section>
  );
}
