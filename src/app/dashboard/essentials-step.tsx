"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import {
  CEBU_AREAS,
  LANGUAGES,
  BOOKING_STATUSES,
  TRIAL_STATUSES,
  HAIR_SERVICES,
  FINISH_STYLES,
  TECHNIQUES,
  SKIN_INCLUSIVITY,
  PAYMENT_METHODS,
} from "@/lib/essentials-taxonomy";
import type { EssentialsDraft } from "@/lib/essentials-form";
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

const AREA_OPTS = opt(CEBU_AREAS);
const LANG_OPTS = opt(LANGUAGES);
const BOOKING_OPTS = opt(BOOKING_STATUSES);
const TRIAL_OPTS = opt(TRIAL_STATUSES);
const HAIR_OPTS = opt(HAIR_SERVICES);
const FINISH_OPTS = optCap(FINISH_STYLES);
const TECH_OPTS = optCap(TECHNIQUES);
const SKIN_OPTS = optCap(SKIN_INCLUSIVITY);
const PAYMENT_OPTS = opt(PAYMENT_METHODS); // labels are already proper-cased

// Select-friendly labels where the vocab label (tuned for row rendering) reads
// awkwardly in a dropdown.
const TEAM_OPTS: Option[] = [
  { value: "solo", label: "Solo artist" },
  { value: "small_team", label: "Small team" },
  { value: "studio", label: "Studio team" },
];
const RETOUCH_OPTS: Option[] = [
  { value: "none", label: "None" },
  { value: "until_ceremony", label: "Until you leave for the ceremony" },
  { value: "until_reception", label: "Retouch before the reception" },
  { value: "unlimited", label: "Unlimited retouch" },
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
  const isMakeup = category === "makeup";

  const toggle = (
    key:
      | "coverageAreas"
      | "languages"
      | "paymentMethods"
      | "finishStyles"
      | "techniques"
      | "skinInclusivity",
    value: string,
  ) => {
    const cur = draft[key];
    onPatch({
      [key]: cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value],
    } as Partial<EssentialsDraft>);
  };

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

      {isMakeup && (
        <Group
          title="Makeup details"
          hint="Specifics couples ask about — hair, group size, retouch, early calls, trials."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hair services">
              <Select
                value={draft.hairServices}
                onChange={(v) => onPatch({ hairServices: v })}
                options={HAIR_OPTS}
                placeholder="— Not set —"
              />
            </Field>
            <Field label="Trial makeup">
              <Select
                value={draft.trialStatus}
                onChange={(v) => onPatch({ trialStatus: v })}
                options={TRIAL_OPTS}
                placeholder="— Not set —"
              />
            </Field>
          </div>
          {draft.trialStatus && (
            <Field label="Trial note" hint="(optional)">
              <input
                className={inputClass}
                value={draft.trialNote}
                maxLength={120}
                onChange={(e) => onPatch({ trialNote: e.target.value })}
              />
            </Field>
          )}

          <div>
            <span className={labelClass}>Group capacity</span>
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <input
                className={inputClass}
                inputMode="numeric"
                value={draft.groupMaxFaces}
                placeholder="Max faces"
                onChange={(e) => onPatch({ groupMaxFaces: e.target.value })}
              />
              <CheckboxRow
                checked={draft.groupIncludesBride}
                onChange={(v) => onPatch({ groupIncludesBride: v })}
              >
                Count includes the bride
              </CheckboxRow>
            </div>
            <p className="mt-1 text-xs text-muted">
              Whether you work solo or with a team is set by the Team field above.
            </p>
          </div>

          <div>
            <span className={labelClass}>Retouch</span>
            <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
              <Select
                value={draft.retouchTier}
                onChange={(v) => onPatch({ retouchTier: v })}
                options={RETOUCH_OPTS}
                placeholder="— Not set —"
              />
              {draft.retouchTier === "unlimited" && (
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={draft.retouchHours}
                  placeholder="Hours"
                  onChange={(e) => onPatch({ retouchHours: e.target.value })}
                />
              )}
            </div>
            {draft.retouchTier && draft.retouchTier !== "none" && (
              <input
                className={`${inputClass} mt-3`}
                value={draft.retouchNote}
                maxLength={120}
                placeholder="Retouch note (optional)"
                onChange={(e) => onPatch({ retouchNote: e.target.value })}
              />
            )}
          </div>

          <div>
            <span className={labelClass}>Early call time</span>
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              <input
                type="time"
                className={inputClass}
                value={draft.earlyFrom}
                onChange={(e) => onPatch({ earlyFrom: e.target.value })}
              />
              <input
                className={inputClass}
                value={draft.earlyFee}
                maxLength={120}
                placeholder="Early-call fee note (optional)"
                onChange={(e) => onPatch({ earlyFee: e.target.value })}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              If early calls cost extra, say so here — couples prefer knowing
              upfront.
            </p>
          </div>

          <div>
            <span className={labelClass}>Finish styles</span>
            <ChipGroup
              options={FINISH_OPTS}
              selected={draft.finishStyles}
              onToggle={(v) => toggle("finishStyles", v)}
            />
          </div>
          <div>
            <span className={labelClass}>Techniques</span>
            <ChipGroup
              options={TECH_OPTS}
              selected={draft.techniques}
              onToggle={(v) => toggle("techniques", v)}
            />
          </div>
          <div>
            <span className={labelClass}>Skin specialties</span>
            <ChipGroup
              options={SKIN_OPTS}
              selected={draft.skinInclusivity}
              onToggle={(v) => toggle("skinInclusivity", v)}
            />
          </div>

          <Field
            label="If the unexpected happens"
            hint="(your backup plan)"
            help="What happens if you're unavailable on the day — a partner artist on standby, for example."
          >
            <input
              className={inputClass}
              value={draft.backupPlan}
              maxLength={160}
              placeholder="e.g. trusted partner artist on standby"
              onChange={(e) => onPatch({ backupPlan: e.target.value })}
            />
          </Field>

          <div className="grid gap-3">
            <CheckboxRow
              checked={draft.onLocation}
              onChange={(v) => onPatch({ onLocation: v })}
            >
              Comes to your venue / on-location
            </CheckboxRow>
            <CheckboxRow
              checked={draft.homeService}
              onChange={(v) => onPatch({ homeService: v })}
            >
              Offers home service
            </CheckboxRow>
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
