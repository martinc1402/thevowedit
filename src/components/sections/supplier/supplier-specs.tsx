import type { SupplierSpec } from "@/lib/suppliers";

// Scannable facts (coverage, team, deliverables, turnaround...). Supplier-authored
// label/value pairs, category-agnostic. Two views share the data:
//   SpecStrip — the top ~4 as a one-line summary under the meta (Helm/Airbnb-style).
//   SpecsGrid — the full set as a labelled grid, only when there's more than the
//               strip already shows.

const STRIP_MAX = 4;

export function SpecStrip({ specs }: { specs: SupplierSpec[] }) {
  const items = specs.filter((s) => s.label && s.value).slice(0, STRIP_MAX);
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
      {items.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className="text-line">·</span>}
          <span>
            <span className="text-muted">{s.label}</span>{" "}
            <span className="font-medium text-ink">{s.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function SpecsGrid({ specs }: { specs: SupplierSpec[] }) {
  const items = specs.filter((s) => s.label && s.value);
  // The strip already surfaces the first few; only build the full grid when
  // there's meaningfully more to show.
  if (items.length <= STRIP_MAX) return null;
  return (
    <section aria-labelledby="details-heading">
      <h2
        id="details-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        The details
      </h2>
      <dl className="mt-5 grid gap-x-10 sm:grid-cols-2">
        {items.map((s) => (
          <div
            key={s.label}
            className="flex items-baseline justify-between gap-4 border-b border-line py-3"
          >
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="text-right text-sm font-medium text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
