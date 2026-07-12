// Form-side mapping for the structured essentials taxonomy. The dashboard editor
// works on a FLAT, string-friendly draft (enums as ""-able strings, numbers as
// strings, arrays of keys); these two pure functions convert between that draft
// and the nested `EssentialsData` stored in the jsonb column.
//
// draftToEssentials is deliberately permissive-but-tidy: it omits empty values so
// the object mirrors what the server's coerceEssentials would keep. The server
// STILL re-validates every value against the locked vocab — this is convenience,
// not trust. Keeping the mapping here (not in the component) makes it unit-testable.

import type {
  EssentialsData,
  AreaKey,
  BookingStatusKey,
  LanguageKey,
  TeamSizeKey,
  HairServiceKey,
  RetouchTierKey,
  TrialStatusKey,
  FinishStyleKey,
  TechniqueKey,
  SkinInclusivityKey,
  MakeupFields,
} from "@/lib/essentials-taxonomy";

export type CustomEssentialDraft = { label: string; value: string };

// Flat, form-friendly shape. Enums are "" when unset; numbers are strings.
export type EssentialsDraft = {
  // universal
  coverageAreas: string[]; // AreaKey[]
  travelsBeyond: boolean;
  travelNote: string;
  bookingStatus: string; // "" | BookingStatusKey
  bookingStatusNote: string;
  bookingTerms: string;
  languages: string[]; // LanguageKey[]
  teamSize: string; // "" | TeamSizeKey
  teamNote: string;
  // makeup categoryFields
  hairServices: string; // "" | HairServiceKey
  groupMaxFaces: string; // numeric string
  groupIncludesBride: boolean;
  retouchTier: string; // "" | RetouchTierKey
  retouchHours: string; // numeric string
  retouchNote: string;
  earlyFrom: string; // "HH:MM"
  earlyFee: string;
  trialStatus: string; // "" | TrialStatusKey
  trialNote: string;
  finishStyles: string[];
  techniques: string[];
  skinInclusivity: string[];
  backupPlan: string;
  onLocation: boolean;
  homeService: boolean;
  // escape hatch (≤ 3 kept on save)
  customEssentials: CustomEssentialDraft[];
};

export const emptyEssentialsDraft = (): EssentialsDraft => ({
  coverageAreas: [],
  travelsBeyond: false,
  travelNote: "",
  bookingStatus: "",
  bookingStatusNote: "",
  bookingTerms: "",
  languages: [],
  teamSize: "",
  teamNote: "",
  hairServices: "",
  groupMaxFaces: "",
  groupIncludesBride: true,
  retouchTier: "",
  retouchHours: "",
  retouchNote: "",
  earlyFrom: "",
  earlyFee: "",
  trialStatus: "",
  trialNote: "",
  finishStyles: [],
  techniques: [],
  skinInclusivity: [],
  backupPlan: "",
  onLocation: false,
  homeService: false,
  customEssentials: [],
});

// Seed the form from the stored structured value.
export function essentialsToDraft(e: EssentialsData | null): EssentialsDraft {
  const d = emptyEssentialsDraft();
  if (!e) return d;
  const cf = (e.categoryFields ?? {}) as MakeupFields;

  return {
    ...d,
    coverageAreas: [...(e.coverage?.areas ?? [])],
    travelsBeyond: e.coverage?.travelsBeyond ?? false,
    travelNote: e.coverage?.travelNote ?? "",
    bookingStatus: e.bookingStatus?.status ?? "",
    bookingStatusNote: e.bookingStatus?.note ?? "",
    bookingTerms: e.bookingTerms ?? "",
    languages: [...(e.languages ?? [])],
    teamSize: e.team?.size ?? "",
    teamNote: e.team?.note ?? "",
    hairServices: cf.hairServices ?? "",
    groupMaxFaces:
      cf.groupCapacity?.maxFaces != null ? String(cf.groupCapacity.maxFaces) : "",
    groupIncludesBride: cf.groupCapacity?.includesBride ?? true,
    retouchTier: cf.retouch?.tier ?? "",
    retouchHours: cf.retouch?.hours != null ? String(cf.retouch.hours) : "",
    retouchNote: cf.retouch?.note ?? "",
    earlyFrom: cf.earlyCall?.availableFrom ?? "",
    earlyFee: cf.earlyCall?.feeNote ?? "",
    trialStatus: cf.trial?.status ?? "",
    trialNote: cf.trial?.note ?? "",
    finishStyles: [...(cf.finishStyles ?? [])],
    techniques: [...(cf.techniques ?? [])],
    skinInclusivity: [...(cf.skinInclusivity ?? [])],
    backupPlan: cf.backupPlan ?? "",
    onLocation: cf.onLocation ?? false,
    homeService: cf.homeService ?? false,
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

// Assemble the nested structured object for save. Empty values are omitted so the
// result matches what the server keeps; returns null when nothing was filled in.
export function draftToEssentials(d: EssentialsDraft): EssentialsData | null {
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

  if (d.languages.length) out.languages = [...d.languages] as LanguageKey[];

  if (d.teamSize) {
    const note = s(d.teamNote);
    out.team = { size: d.teamSize as TeamSizeKey, ...(note ? { note } : {}) };
  }

  const cf: Record<string, unknown> = {};
  if (d.hairServices) cf.hairServices = d.hairServices as HairServiceKey;

  const maxFaces = intOrU(d.groupMaxFaces);
  if (maxFaces != null) {
    cf.groupCapacity = { maxFaces, includesBride: d.groupIncludesBride };
  }

  if (d.retouchTier) {
    const hours = intOrU(d.retouchHours);
    const note = s(d.retouchNote);
    cf.retouch = {
      tier: d.retouchTier as RetouchTierKey,
      ...(hours != null ? { hours } : {}),
      ...(note ? { note } : {}),
    };
  }

  if (/^\d{1,2}:\d{2}$/.test(d.earlyFrom.trim())) {
    const fee = s(d.earlyFee);
    cf.earlyCall = {
      availableFrom: d.earlyFrom.trim(),
      ...(fee ? { feeNote: fee } : {}),
    };
  }

  if (d.trialStatus) {
    const note = s(d.trialNote);
    cf.trial = {
      status: d.trialStatus as TrialStatusKey,
      ...(note ? { note } : {}),
    };
  }

  if (d.finishStyles.length) cf.finishStyles = [...d.finishStyles] as FinishStyleKey[];
  if (d.techniques.length) cf.techniques = [...d.techniques] as TechniqueKey[];
  if (d.skinInclusivity.length)
    cf.skinInclusivity = [...d.skinInclusivity] as SkinInclusivityKey[];

  const backup = s(d.backupPlan);
  if (backup) cf.backupPlan = backup;
  // Booleans stored only when true (false = default "not offered", never rendered).
  if (d.onLocation) cf.onLocation = true;
  if (d.homeService) cf.homeService = true;

  if (Object.keys(cf).length) out.categoryFields = cf;

  const custom = d.customEssentials
    .map((c) => ({ label: s(c.label), value: s(c.value) }))
    .filter((c) => c.label && c.value)
    .slice(0, 3);
  if (custom.length) out.customEssentials = custom;

  return Object.keys(out).length ? (out as EssentialsData) : null;
}
