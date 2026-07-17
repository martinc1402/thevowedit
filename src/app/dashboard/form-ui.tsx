"use client";

// Shared form primitives for the dashboard editor. Kept in one place so the
// wizard and the Essentials step share identical recipes (matches apply-form.tsx).

// The dashboard is now on the cream (theme-light) palette, so inputs are white
// (bg-surface) fields with warm hairline borders — no scoped theme prefix needed.
export const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";
export const labelClass = "mb-1.5 block text-xs font-medium text-muted";
export const selectClass = `${inputClass} cursor-pointer`;

export type Option = { value: string; label: string };

export function Field({
  label,
  hint,
  help,
  children,
}: {
  label: string;
  hint?: string;
  help?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {hint && <span className="ml-1 font-normal text-muted/70">{hint}</span>}
      </span>
      {children}
      {help && (
        <span className="mt-1 block text-xs leading-snug text-muted">{help}</span>
      )}
    </label>
  );
}

// Native select styled like the text inputs. Pass `placeholder` to render an
// empty "not set" option so an optional enum can be cleared.
export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <select
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Multi-select rendered as toggleable chips (same recipe as the category chips).
export function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              on
                ? "bg-accent text-accent-ink"
                : "border border-line bg-surface-2 text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 rounded border-line accent-[#581824]"
      />
      <span className="text-sm text-ink">{children}</span>
    </label>
  );
}
