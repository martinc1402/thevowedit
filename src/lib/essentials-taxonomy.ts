// Structured "essentials" taxonomy for vendor profiles. The single source of
// truth for: the locked vocabularies, the typed shape stored in the `essentials`
// jsonb column, the per-category field sets + display order, and the formatters
// that turn structured values into the human strings shown in "The essentials".
//
// Data is stored structured (enums / numbers / booleans); NEVER display strings.
// `buildEssentialsRows()` is the only thing the UI calls — add a category by
// adding a `CATEGORY_FIELD_SETS` entry, not by touching the component.

// ------------------------------------------------------------------ vocab -----
// Each vocab is a `{ key, label }[]`; "extend" = add an entry. Keys are what get
// stored; labels are what get rendered.

export type Vocab<K extends string> = { key: K; label: string }[];

const labelMap = <K extends string>(v: Vocab<K>) =>
  Object.fromEntries(v.map((x) => [x.key, x.label])) as Record<K, string>;
const keySet = <K extends string>(v: Vocab<K>) => new Set(v.map((x) => x.key));

// Cebu areas (ordered). NOTE: no "Mactan" — Mactan is within Lapu-Lapu.
export const CEBU_AREAS = [
  { key: "cebu-city", label: "Cebu City" },
  { key: "mandaue", label: "Mandaue" },
  { key: "lapu-lapu", label: "Lapu-Lapu" },
  { key: "talisay", label: "Talisay" },
  { key: "consolacion", label: "Consolacion" },
  { key: "liloan", label: "Liloan" },
  { key: "minglanilla", label: "Minglanilla" },
  { key: "cordova", label: "Cordova" },
  { key: "naga", label: "Naga" },
  { key: "danao", label: "Danao" },
  { key: "carcar", label: "Carcar" },
  { key: "toledo", label: "Toledo" },
] as const;
export type AreaKey = (typeof CEBU_AREAS)[number]["key"];

export const LANGUAGES = [
  { key: "english", label: "English" },
  { key: "cebuano", label: "Cebuano" },
  { key: "tagalog", label: "Tagalog" },
] as const;
export type LanguageKey = (typeof LANGUAGES)[number]["key"];

export const BOOKING_STATUSES = [
  { key: "open", label: "Now booking" },
  { key: "limited", label: "Limited availability" },
  { key: "waitlist", label: "Waitlist" },
  { key: "closed", label: "Fully booked" },
] as const;
export type BookingStatusKey = (typeof BOOKING_STATUSES)[number]["key"];

// Team size — the label is the parenthetical used in the capacity row.
export const TEAM_SIZES = [
  { key: "solo", label: "works solo" },
  { key: "small_team", label: "works with a small team" },
  { key: "studio", label: "works with a studio team" },
] as const;
export type TeamSizeKey = (typeof TEAM_SIZES)[number]["key"];

export const PRICE_UNITS = [
  { key: "per_event", label: "" },
  { key: "per_head", label: "per head" },
  { key: "per_hour", label: "per hour" },
] as const;
export type PriceUnitKey = (typeof PRICE_UNITS)[number]["key"];

// How a couple actually pays in the Philippines. GCash / bank transfer / cash are
// the three named in the market research; Maya is the other e-wallet worth listing.
// Couples ask this before enquiring and no local directory captures it.
export const PAYMENT_METHODS = [
  { key: "gcash", label: "GCash" },
  { key: "maya", label: "Maya" },
  { key: "bank_transfer", label: "Bank transfer" },
  { key: "cash", label: "Cash" },
] as const;
export type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]["key"];

// Makeup-artist vocab. Specialty labels are lower-case common nouns (the joined
// value gets a single leading capital); languages/areas stay proper-cased.
export const FINISH_STYLES = [
  { key: "soft_glam", label: "soft glam" },
  { key: "full_glam", label: "full glam" },
  { key: "natural", label: "natural" },
  // Distinct from "natural": couples search this exact phrase, and artists say it
  // is the hardest look to execute and make last in humidity.
  { key: "no_makeup", label: "no-makeup makeup" },
  { key: "classic", label: "classic" },
  { key: "editorial", label: "editorial" },
] as const;
export type FinishStyleKey = (typeof FINISH_STYLES)[number]["key"];

export const TECHNIQUES = [
  { key: "airbrush", label: "airbrush" },
  { key: "traditional", label: "traditional" },
  { key: "hd", label: "HD" },
] as const;
export type TechniqueKey = (typeof TECHNIQUES)[number]["key"];

export const SKIN_INCLUSIVITY = [
  { key: "all_skin_tones", label: "all skin tones" },
  { key: "mature_skin", label: "mature skin" },
  { key: "acne_prone", label: "acne-prone" },
  { key: "morena_specialist", label: "morena specialist" },
] as const;
export type SkinInclusivityKey = (typeof SKIN_INCLUSIVITY)[number]["key"];

export const TRIAL_STATUSES = [
  { key: "available", label: "Available" },
  { key: "required", label: "Required" },
  { key: "not_offered", label: "Not offered" },
] as const;
export type TrialStatusKey = (typeof TRIAL_STATUSES)[number]["key"];

// Whether the artist covers hair too (filter-worthy). Name-free phrasing so the
// taxonomy stays vendor-agnostic.
export const HAIR_SERVICES = [
  { key: "included", label: "Hair & makeup (HMUA)" },
  { key: "partner_stylist", label: "Makeup + hair by a partner stylist" },
  { key: "makeup_only", label: "Makeup only" },
] as const;
export type HairServiceKey = (typeof HAIR_SERVICES)[number]["key"];

// Retouch coverage tiers (PH-market standard). "none" renders no row; the
// unlimited tier composes with `hours` in the formatter.
export const RETOUCH_TIERS = [
  { key: "none", label: "None" },
  { key: "until_ceremony", label: "Stays until you leave for the ceremony" },
  { key: "until_reception", label: "Includes retouch before the reception" },
  { key: "unlimited", label: "Unlimited retouch" },
] as const;
export type RetouchTierKey = (typeof RETOUCH_TIERS)[number]["key"];

// Exposed for write-validation (profile.ts).
export const VOCAB_KEYS = {
  area: keySet(CEBU_AREAS as unknown as Vocab<AreaKey>),
  language: keySet(LANGUAGES as unknown as Vocab<LanguageKey>),
  bookingStatus: keySet(BOOKING_STATUSES as unknown as Vocab<BookingStatusKey>),
  teamSize: keySet(TEAM_SIZES as unknown as Vocab<TeamSizeKey>),
  priceUnit: keySet(PRICE_UNITS as unknown as Vocab<PriceUnitKey>),
  finishStyle: keySet(FINISH_STYLES as unknown as Vocab<FinishStyleKey>),
  technique: keySet(TECHNIQUES as unknown as Vocab<TechniqueKey>),
  skinInclusivity: keySet(SKIN_INCLUSIVITY as unknown as Vocab<SkinInclusivityKey>),
  trialStatus: keySet(TRIAL_STATUSES as unknown as Vocab<TrialStatusKey>),
  hairService: keySet(HAIR_SERVICES as unknown as Vocab<HairServiceKey>),
  retouchTier: keySet(RETOUCH_TIERS as unknown as Vocab<RetouchTierKey>),
  paymentMethod: keySet(PAYMENT_METHODS as unknown as Vocab<PaymentMethodKey>),
} as const;

const AREA_LABEL = labelMap(CEBU_AREAS as unknown as Vocab<AreaKey>);
const LANGUAGE_LABEL = labelMap(LANGUAGES as unknown as Vocab<LanguageKey>);
const BOOKING_LABEL = labelMap(BOOKING_STATUSES as unknown as Vocab<BookingStatusKey>);
const TEAM_LABEL = labelMap(TEAM_SIZES as unknown as Vocab<TeamSizeKey>);
const PRICE_UNIT_LABEL = labelMap(PRICE_UNITS as unknown as Vocab<PriceUnitKey>);
const TRIAL_LABEL = labelMap(TRIAL_STATUSES as unknown as Vocab<TrialStatusKey>);
const HAIR_SERVICE_LABEL = labelMap(HAIR_SERVICES as unknown as Vocab<HairServiceKey>);
const PAYMENT_LABEL = labelMap(PAYMENT_METHODS as unknown as Vocab<PaymentMethodKey>);
const SPECIALTY_LABEL = labelMap([
  ...FINISH_STYLES,
  ...TECHNIQUES,
  ...SKIN_INCLUSIVITY,
] as unknown as Vocab<string>);

// Coverage key -> display label, for the browse filter chips.
export function areaLabel(key: string): string {
  return AREA_LABEL[key as AreaKey] ?? key;
}

// ------------------------------------------------------------------ types -----
// The shape stored in the `essentials` jsonb column.
export type EssentialsData = {
  coverage?: { areas: AreaKey[]; travelsBeyond: boolean; travelNote?: string };
  bookingStatus?: { status: BookingStatusKey; note?: string };
  bookingTerms?: string;
  // Universal (every category): how a couple pays, and what holds the date.
  paymentMethods?: PaymentMethodKey[];
  depositPercent?: number;
  languages?: LanguageKey[];
  team?: { size: TeamSizeKey; note?: string };
  // Category-specific fields; validated per the category's field set.
  categoryFields?: Record<string, unknown>;
  customEssentials?: { label: string; value: string }[];
};

// Layer-2 fields for the makeup_artist category.
export type MakeupFields = {
  hairServices?: HairServiceKey;
  groupCapacity?: { maxFaces?: number; includesBride?: boolean };
  retouch?: { tier?: RetouchTierKey; hours?: number; note?: string };
  earlyCall?: { availableFrom?: string; feeNote?: string }; // "HH:MM" 24h
  trial?: { status?: TrialStatusKey; note?: string };
  finishStyles?: FinishStyleKey[];
  techniques?: TechniqueKey[];
  skinInclusivity?: SkinInclusivityKey[];
  backupPlan?: string;
  // Stored/validated but no longer rendered as an essentials row.
  onLocation?: boolean;
  homeService?: boolean;
};

// Everything a formatter needs, resolved once.
export type EssentialsInput = {
  priceMin: number | null;
  priceMax: number | null;
  priceTypical: number | null;
  // The per-FACE entourage rate, distinct from the bride rate above. In a Filipino
  // wedding this is the real swing factor — 8-10 faces can exceed the bride's fee.
  entourageRateMin: number | null;
  entourageRateMax: number | null;
  currency: string;
  priceUnit: string | null;
  category: string | null;
  essentials: EssentialsData | null;
};

export type EssentialsRow = { label: string; value: string };

// --------------------------------------------------------------- formatters ---
const money = (amount: number, currency: string) =>
  currency === "PHP"
    ? `₱${new Intl.NumberFormat("en-PH").format(amount)}`
    : `${currency} ${new Intl.NumberFormat("en-PH").format(amount)}`;

const upperFirst = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const to12h = (hhmm: string): string | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2];
  if (h < 0 || h > 23) return null;
  const period = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${min} ${period}`;
};

const mk = (i: EssentialsInput) =>
  (i.essentials?.categoryFields ?? {}) as MakeupFields;

type RowDef = { label: string; format: (i: EssentialsInput) => string | null };

// -- universal rows (shared across categories) --
const priceRow: RowDef = {
  label: "Price",
  format: (i) => {
    let base: string | null = null;
    if (i.priceMin != null && i.priceMax != null && i.priceMax > i.priceMin)
      base = `${money(i.priceMin, i.currency)} to ${money(i.priceMax, i.currency)}`;
    else if (i.priceMin != null) base = `From ${money(i.priceMin, i.currency)}`;
    else if (i.priceTypical != null) base = `Around ${money(i.priceTypical, i.currency)}`;
    if (!base) return null;
    const unit =
      i.priceUnit && i.priceUnit in PRICE_UNIT_LABEL
        ? PRICE_UNIT_LABEL[i.priceUnit as PriceUnitKey]
        : "";
    return unit ? `${base} ${unit}` : base;
  },
};

// The number a couple actually needs to budget the day. Sits immediately after the
// bride rate, because "from ₱8,000" alone hides most of the bill once the ninang,
// the mothers and the bridesmaids are counted.
const entourageRow: RowDef = {
  label: "Entourage",
  format: (i) => {
    const { entourageRateMin: lo, entourageRateMax: hi, currency } = i;
    if (lo != null && hi != null && hi > lo)
      return `${money(lo, currency)} to ${money(hi, currency)} per face`;
    if (lo != null) return `From ${money(lo, currency)} per face`;
    if (hi != null) return `Up to ${money(hi, currency)} per face`;
    return null;
  },
};

const coverageRow: RowDef = {
  label: "Coverage & travel",
  format: (i) => {
    const c = i.essentials?.coverage;
    if (!c?.areas?.length) return null;
    const areas = c.areas
      .map((a) => AREA_LABEL[a])
      .filter(Boolean)
      .join(", ");
    if (!areas) return null;
    const note = c.travelNote?.trim() || (c.travelsBeyond ? "travels beyond Cebu" : null);
    return note ? `${areas} · ${note}` : areas;
  },
};

// Deposit folds in here rather than getting a competing row: "what holds my date"
// is one question, and a structured percent reads better in front of the vendor's
// own terms than beside them.
const bookingTermsRow: RowDef = {
  label: "Booking terms",
  format: (i) => {
    const terms = i.essentials?.bookingTerms?.trim() || null;
    const pct = i.essentials?.depositPercent;
    const deposit =
      typeof pct === "number" && pct > 0 ? `${pct}% deposit reserves your date` : null;
    if (deposit && terms) return `${deposit} · ${terms}`;
    return deposit ?? terms;
  },
};

// How a couple actually pays. No local directory captures this, and couples ask
// before they enquire.
const paymentRow: RowDef = {
  label: "Payment",
  format: (i) => {
    const methods = (i.essentials?.paymentMethods ?? [])
      .map((m) => PAYMENT_LABEL[m])
      .filter(Boolean);
    return methods.length ? methods.join(", ") : null;
  },
};

const bookingStatusRow: RowDef = {
  label: "Booking status",
  format: (i) => {
    const b = i.essentials?.bookingStatus;
    if (!b?.status || !(b.status in BOOKING_LABEL)) return null;
    const label = BOOKING_LABEL[b.status];
    const note = b.note?.trim();
    return note ? `${label} · ${note}` : label;
  },
};

const languagesRow: RowDef = {
  label: "Languages",
  format: (i) => {
    const langs = (i.essentials?.languages ?? [])
      .map((l) => LANGUAGE_LABEL[l])
      .filter(Boolean);
    return langs.length ? langs.join(", ") : null;
  },
};

// -- makeup-artist rows --
const groupCapacityRow: RowDef = {
  label: "Group capacity",
  format: (i) => {
    const gc = mk(i).groupCapacity;
    const size = i.essentials?.team?.size;
    const mode = size && size in TEAM_LABEL ? TEAM_LABEL[size] : null;
    if (gc?.maxFaces != null) {
      const base =
        gc.includesBride === false
          ? `Up to ${gc.maxFaces} faces`
          : `Bride + up to ${gc.maxFaces} faces`;
      return mode ? `${base} (${mode})` : base;
    }
    return mode ? upperFirst(mode) : null;
  },
};

const hairServicesRow: RowDef = {
  label: "Hair services",
  format: (i) => {
    const key = mk(i).hairServices;
    return key && key in HAIR_SERVICE_LABEL ? HAIR_SERVICE_LABEL[key] : null;
  },
};

const retouchRow: RowDef = {
  label: "Retouch",
  format: (i) => {
    const r = mk(i).retouch;
    const tier = r?.tier;
    if (!tier || tier === "none") return null;
    let base: string;
    if (tier === "unlimited") {
      base = "Unlimited retouch";
      if (r.hours != null) base += ` · up to ${r.hours} hours`;
    } else if (tier === "until_ceremony") {
      base = "Stays until you leave for the ceremony";
    } else {
      base = "Includes retouch before the reception"; // until_reception
    }
    const note = r.note?.trim();
    return note ? `${base} · ${note}` : base;
  },
};

const earlyCallRow: RowDef = {
  label: "Early call times",
  format: (i) => {
    const ec = mk(i).earlyCall;
    const at = ec?.availableFrom ? to12h(ec.availableFrom) : null;
    if (!at) return null;
    const fee = ec?.feeNote?.trim();
    // feeNote appended quietly when present; its absence never implies "free".
    return fee ? `Available from ${at} · ${fee}` : `Available from ${at}`;
  },
};

const backupPlanRow: RowDef = {
  label: "If the unexpected happens",
  format: (i) => mk(i).backupPlan?.trim() || null,
};

const trialRow: RowDef = {
  label: "Trial makeup",
  format: (i) => {
    const t = mk(i).trial;
    if (!t?.status || !(t.status in TRIAL_LABEL)) return null;
    const label = TRIAL_LABEL[t.status];
    const note = t.note?.trim();
    return note ? `${label} · ${note}` : label;
  },
};

const specialtiesRow: RowDef = {
  label: "Specialties",
  format: (i) => {
    const cf = mk(i);
    const parts = [
      ...(cf.finishStyles ?? []),
      ...(cf.techniques ?? []),
      ...(cf.skinInclusivity ?? []),
    ]
      .map((k) => SPECIALTY_LABEL[k])
      .filter(Boolean);
    const unique = [...new Set(parts)];
    return unique.length ? upperFirst(unique.join(", ")) : null;
  },
};

// ------------------------------------------------- category field sets --------
type FieldSet = { rows: RowDef[]; maxRows: number };

// Default = universal fields only (used for any category without a field set).
const UNIVERSAL_FIELD_SET: FieldSet = {
  rows: [
    priceRow,
    coverageRow,
    bookingTermsRow,
    paymentRow,
    bookingStatusRow,
    languagesRow,
  ],
  maxRows: 9,
};

// Couple-priority order. buildEssentialsRows keeps the first `maxRows` present rows
// and drops the rest from the END.
//
// The cap used to be 10 against 12 rows, which silently trimmed the LAST two —
// backup plan and languages. A backup-artist policy is one of the facts couples
// weigh most (the date is irreplaceable), so it was being hidden by an accident of
// ordering. The cap is now equal to the row count: every fact a vendor actually
// filled in is shown, and rows still self-hide when empty.
//
// Entourage sits directly under Price: "from ₱8,000" hides most of the bill until
// you know the per-face rate. Payment sits with the other commitment facts.
const MAKEUP_FIELD_SET: FieldSet = {
  rows: [
    priceRow,
    entourageRow,
    hairServicesRow,
    groupCapacityRow,
    coverageRow,
    retouchRow,
    earlyCallRow,
    trialRow,
    specialtiesRow,
    backupPlanRow,
    bookingTermsRow,
    paymentRow,
    bookingStatusRow,
    languagesRow,
  ],
  maxRows: 14,
};

// Add a category by adding an entry here — no other code changes.
export const CATEGORY_FIELD_SETS: Record<string, FieldSet> = {
  makeup: MAKEUP_FIELD_SET,
};

// ------------------------------------------------------------ public API ------
const MAX_CUSTOM = 3;

// Turn structured values into the ordered display rows for "The essentials".
export function buildEssentialsRows(i: EssentialsInput): EssentialsRow[] {
  const set =
    (i.category && CATEGORY_FIELD_SETS[i.category]) || UNIVERSAL_FIELD_SET;

  const rows: EssentialsRow[] = [];
  for (const def of set.rows) {
    if (rows.length >= set.maxRows) break;
    const value = def.format(i);
    if (value) rows.push({ label: def.label, value });
  }

  // Escape hatch: up to MAX_CUSTOM free-form facts, appended after the field rows.
  let customCount = 0;
  for (const c of i.essentials?.customEssentials ?? []) {
    if (customCount >= MAX_CUSTOM) break;
    const label = c?.label?.trim();
    const value = c?.value?.trim();
    if (label && value) {
      rows.push({ label, value });
      customCount++;
    }
  }

  return rows;
}
