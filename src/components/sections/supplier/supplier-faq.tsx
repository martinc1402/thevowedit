import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { SupplierFaq } from "@/lib/suppliers";

// Supplier-authored FAQ — the vetting questions couples ask (turnaround, travel,
// who shoots, deposits). Native <details>/<summary> so it works without JS and
// stays accessible. Hairline-divided rows to match the "Good to know" list.
export function SupplierFaq({ faq }: { faq: SupplierFaq[] }) {
  const items = faq.filter((f) => f.q && f.a);
  if (!items.length) return null;

  return (
    <section aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Questions
      </h2>
      <div className="mt-5 divide-y divide-line border-t border-line">
        {items.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <Plus
                size={18}
                weight="bold"
                className="mt-1 shrink-0 text-accent-fg transition-transform duration-200 group-open:rotate-45"
              />
            </summary>
            <p className="mt-3 max-w-[65ch] whitespace-pre-line text-sm leading-relaxed text-muted">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
