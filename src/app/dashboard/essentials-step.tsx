"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import {
  CEBU_AREAS,
  LANGUAGES,
  BOOKING_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/essentials-taxonomy";
import {
  fieldSetFor,
  specVisible,
  type FieldSpec,
} from "@/lib/category-fields";
import type { EssentialsDraft, FieldValue } from "@/lib/essentials-form";
import {
  Field,
  Select,
  ChipGroup,
  CheckboxRow,
  inputClass,
  labelClass,
  type Option,
} from "./form-ui";

// ---- option lists -------------------------------------------------------
const opt = <T extends { key: string; label: string }>(
  v: readonly T[],
): Option[] => v.map((x) => ({ value: x.key, label: x.label }));

const cap1 = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const optCap = <T extends { key: string; label: string }>(
  v: readonly T[],
): Option[] => v.map((x) => ({ value: x.key, label: cap1(x.label) }));

// Universal option lists. The CATEGORY vocab lists used to live here too
// (TRIAL_OPTS, HAIR_OPTS, FINISH_OPTS…); they now travel with their field spec, so
// a new category adds no constants to this file.
const AREA_OPTS = opt(CEBU_AREAS);
const LANG_OPTS = opt(LANGUAGES);
const BOOKING_OPTS = opt(BOOKING_STATUSES);
const PAYMENT_OPTS = opt(PAYMENT_METHODS); // labels are already proper-cased

// Select-friendly labels where the vocab label (tuned for row rendering) reads
// awkwardly in a dropdown.
const TEAM_OPTS: Option[] = [
  { value: "solo", label: "Solo artist" },
  { value: "small_team", label: "Small team" },
  { value: "studio", label: "Studio team" },
];

// ---- layout helpers -----------------------------------------------------
function Group({
  title,
  hint,
  first,
  children,
}: {
  title: string;
  hint?: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? "" : "border-t border-line pt-8"}>
      <h3 className="font-serif text-lg font-medium text-ink">{title}</h3>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-4 grid gap-5">{children}</div>
    </section>
  );
}

// One input, chosen by the spec's `kind`. This is the whole reason a new category
// now costs nothing: describe the field, get the control.
function SpecField({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
}) {
  const help = spec.help && (
    <p className="mt-1.5 text-xs text-muted">{spec.help}</p>
  );

  if (spec.kind === "bool") {
    // Fall back to the spec default when the value is unset, so a default-checked box
    // (e.g. groupIncludesBride) matches the public copy without a stored value.
    return (
      <>
        <CheckboxRow
          checked={(value ?? spec.default) === true}
          onChange={onChange}
        >
          {spec.label}
        </CheckboxRow>
        {help}
      </>
    );
  }

  if (spec.kind === "chips") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div>
        <span className={labelClass}>
          {spec.label}{" "}
          {spec.hint && (
            <span className="font-normal text-muted">{spec.hint}</span>
          )}
        </span>
        <ChipGroup
          options={optCap(spec.vocab)}
          selected={selected}
          onToggle={(v) =>
            onChange(
              selected.includes(v)
                ? selected.filter((x) => x !== v)
                : [...selected, v],
            )
          }
        />
        {help}
      </div>
    );
  }

  const text = typeof value === "string" ? value : "";

  return (
    <div>
      <Field label={spec.label} hint={spec.hint}>
        {spec.kind === "select" ? (
          <Select
            value={text}
            onChange={onChange}
            options={optCap(spec.vocab)}
            placeholder="— Not set —"
          />
        ) : (
          <input
            className={inputClass}
            type={spec.kind === "time" ? "time" : "text"}
            inputMode={spec.kind === "number" ? "numeric" : undefined}
            maxLength={spec.kind === "text" ? spec.maxLength : undefined}
            placeholder={spec.placeholder}
            value={text}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </Field>
      {help}
    </div>
  );
}

// ---- the step ------------------------------------------------------------
export function EssentialsStep({
  draft,
  onPatch,
  category,
}: {
  draft: EssentialsDraft;
  onPatch: (patch: Partial<EssentialsDraft>) => void;
  category: string | null;
}) {
  const fieldSet = fieldSetFor(category);

  const toggle = (
    key: "coverageAreas" | "languages" | "paymentMethods",
    value: string,
  ) => {
    const cur = draft[key];
    onPatch({
      [key]: cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value],
    } as Partial<EssentialsDraft>);
  };

  // Every category field lives in one bag, so a new category needs no new setter.
  const setField = (key: string, v: FieldValue) =>
    onPatch({ categoryFields: { ...draft.categoryFields, [key]: v } });

  const setCustom = (rows: EssentialsDraft["customEssentials"]) =>
    onPatch({ customEssentials: rows });

  return (
    <div className="grid gap-8">
      <Group
        title="Coverage & booking"
        hint="The facts couples scan first. Everything here is optional — blank fields simply don't show."
        first
      >
        <div>
          <span className={labelClass}>Areas you cover</span>
          <ChipGroup
            options={AREA_OPTS}
            selected={draft.coverageAreas}
            onToggle={(v) => toggle("coverageAreas", v)}
          />
        </div>
        <CheckboxRow
          checked={draft.travelsBeyond}
          onChange={(v) => onPatch({ travelsBeyond: v })}
        >
          Travels beyond these areas
        </CheckboxRow>
        <Field label="Travel note" hint="(optional)">
          <input
            className={inputClass}
            value={draft.travelNote}
            maxLength={120}
            placeholder="e.g. travels within Cebu; fees apply beyond"
            onChange={(e) => onPatch({ travelNote: e.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Booking status">
            <Select
              value={draft.bookingStatus}
              onChange={(v) => onPatch({ bookingStatus: v })}
              options={BOOKING_OPTS}
              placeholder="— Not set —"
            />
          </Field>
          <Field label="Status note" hint="(optional)">
            <input
              className={inputClass}
              value={draft.bookingStatusNote}
              maxLength={120}
              placeholder="e.g. 2026 & 2027 weddings"
              onChange={(e) => onPatch({ bookingStatusNote: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
          <Field label="Deposit" hint="(% to reserve)">
            <input
              className={`${inputClass} sm:w-28`}
              inputMode="numeric"
              value={draft.depositPercent}
              placeholder="50"
              onChange={(e) => onPatch({ depositPercent: e.target.value })}
            />
          </Field>
          <Field label="Booking terms" hint="(anything else about paying)">
            <input
              className={inputClass}
              value={draft.bookingTerms}
              maxLength={300}
              placeholder="e.g. balance on the day"
              onChange={(e) => onPatch({ bookingTerms: e.target.value })}
            />
          </Field>
        </div>

        {/* Couples ask this before they enquire and no local directory captures it. */}
        <div>
          <span className={labelClass}>
            Payment accepted{" "}
            <span className="font-normal text-muted">(how they pay you)</span>
          </span>
          <ChipGroup
            options={PAYMENT_OPTS}
            selected={draft.paymentMethods}
            onToggle={(v) => toggle("paymentMethods", v)}
          />
        </div>

        <div>
          <span className={labelClass}>Languages</span>
          <ChipGroup
            options={LANG_OPTS}
            selected={draft.languages}
            onToggle={(v) => toggle("languages", v)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Team">
            <Select
              value={draft.teamSize}
              onChange={(v) => onPatch({ teamSize: v })}
              options={TEAM_OPTS}
              placeholder="— Not set —"
            />
          </Field>
          <Field label="Team note" hint="(optional)">
            <input
              className={inputClass}
              value={draft.teamNote}
              maxLength={120}
              onChange={(e) => onPatch({ teamNote: e.target.value })}
            />
          </Field>
        </div>
      </Group>

      {/* Category-specific fields, rendered from the specs in category-fields.ts.
          This replaced ~160 lines of makeup-only JSX behind `category === "makeup"`
          — the reason a second category could not be added without a rewrite. Every
          category now gets its inputs, its validation and its draft mapping from
          the same one entry. */}
      {fieldSet && (
        <Group title={fieldSet.title} hint={fieldSet.blurb}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fieldSet.fields.map((spec) =>
              specVisible(spec, draft.categoryFields) ? (
                <div
                  key={spec.key}
                  className={spec.half ? "" : "sm:col-span-2"}
                >
                  <SpecField
                    spec={spec}
                    value={draft.categoryFields[spec.key]}
                    onChange={(v) => setField(spec.key, v)}
                  />
                </div>
              ) : null,
            )}
          </div>
        </Group>
      )}

      <Group
        title="Anything else"
        hint="Anything important we didn't ask about. Up to 3 extra facts."
      >
        <div className="grid gap-3">
          {draft.customEssentials.map((row, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface-2 p-4"
            >
              <input
                className={inputClass}
                placeholder="Label (e.g. Sanitation)"
                value={row.label}
                maxLength={40}
                onChange={(e) => {
                  const next = [...draft.customEssentials];
                  next[i] = { ...row, label: e.target.value };
                  setCustom(next);
                }}
              />
              <input
                className={`${inputClass} mt-3`}
                placeholder="Value (e.g. Fresh disposables per client)"
                value={row.value}
                maxLength={120}
                onChange={(e) => {
                  const next = [...draft.customEssentials];
                  next[i] = { ...row, value: e.target.value };
                  setCustom(next);
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setCustom(draft.customEssentials.filter((_, j) => j !== i))
                }
                className="mt-2 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-rose-700"
              >
                <Trash size={13} /> Remove
              </button>
            </div>
          ))}
          {draft.customEssentials.length < 3 && (
            <button
              type="button"
              onClick={() =>
                setCustom([...draft.customEssentials, { label: "", value: "" }])
              }
              className="inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
            >
              <Plus size={14} weight="bold" /> Add fact
            </button>
          )}
        </div>
      </Group>
    </div>
  );
}
