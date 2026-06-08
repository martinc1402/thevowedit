import type { ReactNode } from "react";
import { condensedServiceAreas } from "@/lib/directory";
import type { Listing } from "@/lib/types";

// "At a glance" facts strip under the header. Presents only data we already have,
// each fact rendered only when its data exists, so it reads as intentional whether
// a supplier has many facts or few. Calm labelled facts (a <dl>), separated from
// the header by a hairline. No new tokens: muted labels, ink values, pill tokens
// reused for the style tags. Price stays in the prominent header line, not here.
export function SupplierFacts({ listing: s }: { listing: Listing }) {
  const areas = condensedServiceAreas(s, 3);

  const facts: { label: string; value: ReactNode }[] = [
    { label: "Based in", value: s.basedIn },
  ];

  if (areas.hasOthers) {
    const names = areas.named.join(", ");
    facts.push({
      label: "Serves",
      value: areas.remaining > 0 ? `${names} +${areas.remaining} more` : names,
    });
  }

  if (s.styleTags.length > 0) {
    facts.push({
      label: "Style",
      value: (
        <span className="flex flex-wrap gap-1.5">
          {s.styleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </span>
      ),
    });
  }

  if (s.worksWithOverseasCouples) {
    facts.push({ label: "Works with", value: "Overseas couples" });
  }

  return (
    <dl className="mt-6 grid gap-x-8 gap-y-5 rounded-2xl border border-line bg-surface-2/40 p-5 sm:p-6 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
      {facts.map((f) => (
        <div key={f.label}>
          <dt className="text-[11px] uppercase tracking-wide text-muted">
            {f.label}
          </dt>
          <dd className="mt-1.5 text-sm text-ink">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
