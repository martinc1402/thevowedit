// Form-side mapping for the structured essentials taxonomy. The dashboard editor
// works on a string-friendly draft (enums as ""-able strings, numbers as strings,
// arrays of keys); these two pure functions convert between that draft and the
// `EssentialsData` stored in the jsonb column.
//
// The UNIVERSAL fields are still written out by hand — there are only a few, they
// have bespoke nesting, and every category has them.
//
// The CATEGORY fields are driven entirely by the field specs (src/lib/category-fields.ts):
// one flat key per input, converted by the spec's `kind`. Adding a category adds no
// code here. This is what makes "add a category = add an entry" true rather than
// aspirational — the previous version hardcoded 16 makeup keys and blind-cast every
// vendor's categoryFields to MakeupFields regardless of their actual category.
//
// draftToEssentials is deliberately permissive-but-tidy: it omits empty values so
// the object mirrors what the server's coerceEssentials would keep. The server
// STILL re-validates every value against the locked vocab — this is convenience,
// not trust.

import type {
  EssentialsData,
  AreaKey,
  BookingStatusKey,
  LanguageKey,
  TeamSizeKey,
} from "@/lib/essentials-taxonomy";
import { fieldsFor, specVisible, type FieldSpec } from "@/lib/category-fields";

export type CustomEssentialDraft = { label: string; value: string };

// A category field's draft value: text/select/number/time are strings, chips are
// string[], bools are boolean.
export type FieldValue = string | string[] | boolean;

export type EssentialsDraft = {
  // universal
  coverageAreas: string[]; // AreaKey[]
  travelsBeyond: boolean;
  travelNote: string;
  bookingStatus: string; // "" | BookingStatusKey
  bookingStatusNote: string;
  bookingTerms: string;
  paymentMethods: string[]; // PaymentMethodKey[]
  depositPercent: string; // "" | "50"
  languages: string[]; // LanguageKey[]
  teamSize: string; // "" | TeamSizeKey
  teamNote: string;
  // category-specific, keyed by FieldSpec.key
  categoryFields: Record<string, FieldValue>;
  // escape hatch (≤ 3 kept on save)
  customEssentials: CustomEssentialDraft[];
};

// The empty draft value for a spec — what an untouched input renders as.
export function emptyValue(spec: FieldSpec): FieldValue {
  switch (spec.kind) {
    case "chips":
      return [];
    case "bool":
      return false;
    default:
      return "";
  }
}

export function emptyCategoryFields(category: string | null) {
  const out: Record<string, FieldValue> = {};
  for (const spec of fieldsFor(category)) out[spec.key] = emptyValue(spec);
  return out;
}

// `category` is REQUIRED on all three of these, deliberately. With a default of
// null they would compile fine at every call site and silently return zero category
// fields — the exact class of silent-drop bug this refactor exists to remove.
export const emptyEssentialsDraft = (
  category: string | null,
): EssentialsDraft => ({
  coverageAreas: [],
  travelsBeyond: false,
  travelNote: "",
  bookingStatus: "",
  bookingStatusNote: "",
  bookingTerms: "",
  paymentMethods: [],
  depositPercent: "",
  languages: [],
  teamSize: "",
  teamNote: "",
  categoryFields: emptyCategoryFields(category),
  customEssentials: [],
});

// Seed the form from the stored structured value.
export function essentialsToDraft(
  e: EssentialsData | null,
  category: string | null,
): EssentialsDraft {
  const d = emptyEssentialsDraft(category);
  if (!e) return d;

  // Category fields: read each spec's key out of the stored flat map, converting
  // to the draft's string-friendly form. Unknown stored keys are ignored, so a
  // vendor whose category changed does not carry the old category's answers.
  const stored = (e.categoryFields ?? {}) as Record<string, unknown>;
  const cf: Record<string, FieldValue> = {};
  for (const spec of fieldsFor(category)) {
    const v = stored[spec.key];
    switch (spec.kind) {
      case "chips":
        cf[spec.key] = Array.isArray(v) ? (v as string[]).map(String) : [];
        break;
      case "bool":
        // groupIncludesBride defaults TRUE (a bride is a face); every other bool
        // defaults false. Preserve that.
        cf[spec.key] =
          typeof v === "boolean" ? v : (emptyValue(spec) as boolean);
        break;
      case "number":
        cf[spec.key] = v == null || v === "" ? "" : String(v);
        break;
      default:
        cf[spec.key] = typeof v === "string" ? v : "";
    }
  }

  return {
    ...d,
    coverageAreas: [...(e.coverage?.areas ?? [])],
    travelsBeyond: e.coverage?.travelsBeyond ?? false,
    travelNote: e.coverage?.travelNote ?? "",
    bookingStatus: e.bookingStatus?.status ?? "",
    bookingStatusNote: e.bookingStatus?.note ?? "",
    bookingTerms: e.bookingTerms ?? "",
    paymentMethods: [...(e.paymentMethods ?? [])],
    depositPercent: e.depositPercent != null ? String(e.depositPercent) : "",
    languages: [...(e.languages ?? [])],
    teamSize: e.team?.size ?? "",
    teamNote: e.team?.note ?? "",
    categoryFields: { ...d.categoryFields, ...cf },
    customEssentials: (e.customEssentials ?? []).map((c) => ({
      label: c.label,
      value: c.value,
    })),
  };
}

const s = (x: string) => x.trim();
const intOrU = (x: string): number | undefined => {
  if (x.trim() === "") return undefined;
  const n = Math.trunc(Number(x));
  return Number.isFinite(n) ? n : undefined;
};

// Assemble the structured object for save. Empty values are omitted so the result
// matches what the server keeps; returns null when nothing was filled in.
export function draftToEssentials(
  d: EssentialsDraft,
  category: string | null,
): EssentialsData | null {
  const out: Record<string, unknown> = {};

  if (d.coverageAreas.length) {
    const travelNote = s(d.travelNote);
    out.coverage = {
      areas: [...d.coverageAreas] as AreaKey[],
      travelsBeyond: d.travelsBeyond,
      ...(travelNote ? { travelNote } : {}),
    };
  }

  if (d.bookingStatus) {
    const note = s(d.bookingStatusNote);
    out.bookingStatus = {
      status: d.bookingStatus as BookingStatusKey,
      ...(note ? { note } : {}),
    };
  }

  const terms = s(d.bookingTerms);
  if (terms) out.bookingTerms = terms;

  if (d.paymentMethods.length) {
    out.paymentMethods = [
      ...d.paymentMethods,
    ] as EssentialsData["paymentMethods"];
  }

  const deposit = Number(d.depositPercent);
  if (d.depositPercent.trim() !== "" && Number.isFinite(deposit) && deposit > 0) {
    out.depositPercent = deposit;
  }

  if (d.languages.length) out.languages = [...d.languages] as LanguageKey[];

  if (d.teamSize) {
    const note = s(d.teamNote);
    out.team = { size: d.teamSize as TeamSizeKey, ...(note ? { note } : {}) };
  }

  // Category fields, straight off the specs. A hidden dependent field (e.g. retouch
  // hours when the tier is not "unlimited") is dropped, so the renderer and the
  // stored value can never disagree about what is being edited.
  const cf: Record<string, unknown> = {};
  const values = d.categoryFields;
  for (const spec of fieldsFor(category)) {
    if (!specVisible(spec, values)) continue;
    const v = values[spec.key];
    switch (spec.kind) {
      case "chips":
        if (Array.isArray(v) && v.length) cf[spec.key] = [...v];
        break;
      case "bool":
        // Booleans stored only when true (false = "not offered", never rendered).
        if (v === true) cf[spec.key] = true;
        break;
      case "number": {
        const n = intOrU(String(v ?? ""));
        if (n != null) cf[spec.key] = n;
        break;
      }
      case "time": {
        const t = s(String(v ?? ""));
        if (/^\d{1,2}:\d{2}$/.test(t)) cf[spec.key] = t;
        break;
      }
      default: {
        const t = s(String(v ?? ""));
        if (t) cf[spec.key] = t;
      }
    }
  }

  // groupIncludesBride is only meaningful alongside a face count; on its own it
  // would render "Bride + up to 0 faces".
  if (cf.groupIncludesBride != null && cf.groupMaxFaces == null) {
    delete cf.groupIncludesBride;
  }

  if (Object.keys(cf).length) out.categoryFields = cf;

  const custom = d.customEssentials
    .map((c) => ({ label: s(c.label), value: s(c.value) }))
    .filter((c) => c.label && c.value)
    .slice(0, 3);
  if (custom.length) out.customEssentials = custom;

  return Object.keys(out).length ? (out as EssentialsData) : null;
}
