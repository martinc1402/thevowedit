import { CalendarCheck } from "@phosphor-icons/react/dist/ssr";

// Availability is a top inquiry driver: couples reach out first to vendors who
// signal they're open for the date. A single supplier-authored line ("Now
// booking 2026-2027"), shown as a pill just above the price. Hides when unset.
export function SupplierAvailability({ note }: { note: string | null }) {
  if (!note) return null;
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-ink">
      <CalendarCheck size={16} weight="fill" className="text-accent-fg" />
      {note}
    </p>
  );
}
