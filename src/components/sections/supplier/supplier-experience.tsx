// A compact credibility strip: years in business (derived from the first year
// of operation, so it never goes stale) and approximate weddings worked — the
// experience signals couples ask for. Renders only the stats present; hides
// entirely when there are none.
export function SupplierExperience({
  establishedYear,
  weddingsCount,
}: {
  establishedYear: number | null;
  weddingsCount: number | null;
}) {
  const years =
    establishedYear != null
      ? new Date().getFullYear() - establishedYear
      : null;

  const stats: { value: string; label: string }[] = [];
  if (years != null && years >= 1)
    stats.push({ value: `${years}`, label: years === 1 ? "year" : "years" });
  if (weddingsCount != null && weddingsCount > 0)
    stats.push({ value: `${weddingsCount}+`, label: "weddings" });

  if (!stats.length) return null;

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-3">
      {stats.map((s) => (
        <div key={s.label}>
          <dt className="sr-only">{s.label}</dt>
          <dd className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-medium text-ink">
              {s.value}
            </span>
            <span className="text-sm text-muted">{s.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
