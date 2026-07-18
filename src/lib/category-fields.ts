import {
  HAIR_SERVICES,
  TRIAL_STATUSES,
  RETOUCH_TIERS,
  FINISH_STYLES,
  TECHNIQUES,
  SKIN_INCLUSIVITY,
  SHOOT_STYLES,
  PHOTO_DELIVERABLES,
  VIDEO_DELIVERABLES,
} from "@/lib/essentials-taxonomy";

// =====================================================================
// Category-specific profile fields, described as DATA.
//
// This is the file the rest of the system is driven from. One entry per category
// and you get, for free: the wizard inputs, the server-side validation, the flat
// draft <-> stored-jsonb mapping. Adding a category means adding an entry here —
// which is what the comments elsewhere always claimed, but was not true: the
// wizard had ~160 lines of makeup-only JSX behind `category === "makeup"`, and the
// server validator was a hardcoded allowlist of the 11 makeup keys that SILENTLY
// DROPPED anything else. A photographer literally could not persist a single
// category field.
//
// Stored flat under `essentials.categoryFields`: { retouchTier: "unlimited", ... }.
// Flat, not nested, because the wizard draft is flat and a schema-driven mapper
// needs one key per input. (The old nested shape — retouch: {tier, hours, note} —
// was migrated; see supabase/flatten-category-fields.sql.)
// =====================================================================

export type VocabEntry = { key: string; label: string };

// `showIf` keeps a dependent field hidden AND unvalidated until its parent has a
// value — e.g. retouch hours only mean something for the "unlimited" tier.
export type ShowIf = { key: string; equals?: string; truthy?: true };

export type FieldSpec = {
  key: string; // the categoryFields key
  label: string;
  hint?: string; // small grey suffix on the label
  help?: string; // one-line explainer under the input
  placeholder?: string;
  showIf?: ShowIf;
  half?: true; // render at half width in the 2-col grid
} & (
  | { kind: "select"; vocab: readonly VocabEntry[] }
  | { kind: "chips"; vocab: readonly VocabEntry[]; max: number }
  | { kind: "number"; max: number }
  | { kind: "time" } // "HH:MM", 24h
  | { kind: "text"; maxLength: number }
  | { kind: "bool"; default?: boolean } // checkbox state when the value is unset
);

export type CategoryFieldSet = {
  title: string; // the wizard section heading
  blurb: string;
  fields: FieldSpec[];
};

// ---------------------------------------------------------------- makeup -----
// Behaviour-identical to the JSX it replaces; only the shape changed (flat keys).
const MAKEUP: CategoryFieldSet = {
  title: "Makeup details",
  blurb: "Specifics couples ask about — hair, group size, retouch, early calls, trials.",
  fields: [
    { kind: "select", key: "hairServices", label: "Hair services", vocab: HAIR_SERVICES, half: true },
    { kind: "select", key: "trialStatus", label: "Trial makeup", vocab: TRIAL_STATUSES, half: true },
    { kind: "text", key: "trialNote", label: "Trial note", hint: "(optional)", maxLength: 120, showIf: { key: "trialStatus", truthy: true } },
    { kind: "number", key: "groupMaxFaces", label: "Group capacity", max: 60, half: true, help: "Whether you work solo or with a team is set by the Team field above." },
    { kind: "bool", key: "groupIncludesBride", label: "Show “Bride +” before the face count", default: true, half: true, showIf: { key: "groupMaxFaces", truthy: true }, help: "Ticked shows “Bride + up to N faces”; unticked shows “Up to N faces”." },
    { kind: "select", key: "retouchTier", label: "Retouch", vocab: RETOUCH_TIERS },
    { kind: "number", key: "retouchHours", label: "Standby hours", hint: "(optional)", max: 24, half: true, showIf: { key: "retouchTier", equals: "unlimited" } },
    { kind: "text", key: "retouchNote", label: "Retouch note", hint: "(optional)", maxLength: 120, showIf: { key: "retouchTier", truthy: true } },
    { kind: "time", key: "earlyFrom", label: "Early call time", half: true, help: "If early calls cost extra, say so here — couples prefer knowing upfront." },
    { kind: "text", key: "earlyFee", label: "Early-call fee note", hint: "(optional)", maxLength: 120, half: true },
    { kind: "chips", key: "finishStyles", label: "Finish styles", vocab: FINISH_STYLES, max: 8 },
    { kind: "chips", key: "techniques", label: "Techniques", vocab: TECHNIQUES, max: 8 },
    { kind: "chips", key: "skinInclusivity", label: "Skin specialties", vocab: SKIN_INCLUSIVITY, max: 8 },
    { kind: "text", key: "backupPlan", label: "If the unexpected happens", hint: "(your backup plan)", maxLength: 160, help: "What happens if you're unavailable on the day — a partner artist on standby, for example." },
    { kind: "bool", key: "onLocation", label: "Comes to your venue / on-location" },
    { kind: "bool", key: "homeService", label: "Offers home service" },
  ],
};

// --------------------------------------------------------- photographers -----
// Grounded in the PH market: couples ask about hours of coverage, whether a second
// shooter comes, how long delivery takes, and whether they get the raw files.
const PHOTOGRAPHERS: CategoryFieldSet = {
  title: "Coverage & delivery",
  blurb: "The facts couples compare photographers on — hours, team, turnaround, what you hand over.",
  fields: [
    { kind: "number", key: "coverageHours", label: "Hours of coverage", max: 24, half: true, help: "A typical Filipino wedding day runs 8-12 hours from prep to reception." },
    { kind: "bool", key: "secondShooter", label: "A second shooter is included" },
    { kind: "number", key: "turnaroundWeeks", label: "Delivery turnaround", hint: "(weeks)", max: 52, half: true, help: "How long after the wedding the edited gallery lands." },
    { kind: "number", key: "editedPhotos", label: "Edited photos", hint: "(approx.)", max: 5000, half: true },
    { kind: "chips", key: "shootStyles", label: "Style", vocab: SHOOT_STYLES, max: 8 },
    { kind: "chips", key: "deliverables", label: "What's delivered", vocab: PHOTO_DELIVERABLES, max: 8 },
    { kind: "bool", key: "drone", label: "Drone / aerial coverage" },
    { kind: "bool", key: "prenupOffered", label: "Prenup / engagement shoots" },
    { kind: "text", key: "backupPlan", label: "If the unexpected happens", hint: "(your backup plan)", maxLength: 160, help: "What happens if you're unavailable on the day — a trusted second shooter covering, for example." },
  ],
};

// --------------------------------------------------------- videographers -----
// SDE (same-day edit) is the distinctly Filipino deliverable: cut on the day and
// played at the reception. It is the first thing couples ask a videographer about.
const VIDEOGRAPHERS: CategoryFieldSet = {
  title: "Coverage & delivery",
  blurb: "What couples ask a videographer first — SDE, hours, crew, turnaround.",
  fields: [
    { kind: "bool", key: "sameDayEdit", label: "Same-day edit (SDE), played at the reception" },
    { kind: "number", key: "coverageHours", label: "Hours of coverage", max: 24, half: true, help: "A typical Filipino wedding day runs 8-12 hours from prep to reception." },
    { kind: "number", key: "crewSize", label: "Crew on the day", max: 20, half: true },
    { kind: "number", key: "turnaroundWeeks", label: "Delivery turnaround", hint: "(weeks)", max: 52, half: true, help: "A first cut typically lands 4-8 weeks after the wedding." },
    { kind: "chips", key: "shootStyles", label: "Style", vocab: SHOOT_STYLES, max: 8 },
    { kind: "chips", key: "deliverables", label: "What's delivered", vocab: VIDEO_DELIVERABLES, max: 8 },
    { kind: "bool", key: "drone", label: "Drone / aerial coverage" },
    { kind: "bool", key: "prenupOffered", label: "Prenup / engagement films" },
    { kind: "text", key: "backupPlan", label: "If the unexpected happens", hint: "(your backup plan)", maxLength: 160, help: "What happens if you're unavailable on the day — a trusted crew covering, for example." },
  ],
};

// Add a category by adding an entry here. This one is load-bearing: the wizard, the
// validator and the draft mapper all read it.
export const CATEGORY_FIELDS: Record<string, CategoryFieldSet> = {
  makeup: MAKEUP,
  photographers: PHOTOGRAPHERS,
  videographers: VIDEOGRAPHERS,
};

export function fieldsFor(category: string | null): FieldSpec[] {
  return (category && CATEGORY_FIELDS[category]?.fields) || [];
}

// The entourage rate is charged PER FACE. It is a makeup concept and means nothing
// to a photographer, but the wizard block and the cards were ungated — a
// photographer was being asked for "a per-face rate for mothers, ninang and
// bridesmaids", and would have had "+ ₱X per face" printed on their card.
// One predicate, used by the wizard, the contact card and the vendor card, so they
// cannot drift apart.
export function hasEntourageRate(category: string | null): boolean {
  return category === "makeup";
}

// What a couple should put in their first message. Per category, because the
// prompts are the whole point: a photographer does not need "how many faces" or
// "skin concerns", they need to know the venue and whether you want a prenup.
//
// This used to be a single makeup list gated on `styleTagsFor(category).length` —
// using "has a style-tag vocab" as a proxy for "is makeup". That proxy was a
// landmine: the moment any other category got style tags, it would have started
// telling photographers to send their skin allergies.
export const CATEGORY_QUOTE_PROMPTS: Record<string, [string, string][]> = {
  makeup: [
    ["Wedding date", "and whether it is a church or civil rite"],
    ["Venue", "or at least the area — travel changes the quote"],
    ["Ceremony time", "an early call means a 3-5 AM start"],
    ["How many faces", "bride, mothers, ninang, bridesmaids — this drives the price"],
    ["A peg or two", "a photo says more than “natural glam”"],
    ["Skin concerns", "sensitivities or allergies, so the kit is ready"],
  ],
  photographers: [
    ["Wedding date", "and whether it is a church or civil rite"],
    ["Venue", "or at least the area — travel changes the quote"],
    ["Hours you need", "prep through reception is usually 8-12 hours"],
    ["Prenup?", "say if you want an engagement or prenup shoot too"],
    ["A peg or two", "a few frames you love says more than a style name"],
  ],
  videographers: [
    ["Wedding date", "and whether it is a church or civil rite"],
    ["Venue", "or at least the area — travel changes the quote"],
    ["Hours you need", "prep through reception is usually 8-12 hours"],
    ["Same-day edit?", "an SDE played at the reception changes the crew and the price"],
    ["Prenup?", "say if you want a prenup film or save-the-date too"],
  ],
};

export function quotePromptsFor(category: string | null): [string, string][] {
  return (category && CATEGORY_QUOTE_PROMPTS[category]) || [];
}

export function fieldSetFor(category: string | null): CategoryFieldSet | null {
  return (category && CATEGORY_FIELDS[category]) || null;
}

// Is a dependent field currently active? Used by the renderer (hide it) AND the
// validator (drop it), so the two can never disagree about what is being edited.
export function specVisible(
  spec: FieldSpec,
  values: Record<string, unknown>,
): boolean {
  const cond = spec.showIf;
  if (!cond) return true;
  const v = values[cond.key];
  if (cond.equals !== undefined) return v === cond.equals;
  if (cond.truthy) return v !== "" && v != null && v !== false;
  return true;
}
