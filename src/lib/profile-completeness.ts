import { fieldsFor, specVisible, hasEntourageRate, fieldSetFor } from "@/lib/category-fields";
import type { EssentialsDraft } from "@/lib/essentials-form";

// =====================================================================
// Profile strength.
//
// The pitch is price transparency and photos. Our one live vendor had neither:
// zero photos, three packages all reading "Price on enquiry", no per-face rate.
// Every field exists in the wizard — nothing told him which ones were worth his
// time, or why. A vendor cannot be expected to infer that coverage areas feed the
// location filter, or that the entourage rate is the number couples budget on.
//
// So each check carries a `why` in the vendor's own interest ("couples browsing
// your area will never see you"), not ours. The score is a means to that; the
// sentence next to it is the point.
//
// Driven off the same category-field registry as the wizard, so a new category
// gets scored without touching this file.
// =====================================================================

export type Check = {
  key: string;
  label: string; // imperative — this IS the todo
  why: string;
  step: number; // wizard step it lives on
  weight: number; // relative importance (see WHY below)
  progress: number; // 0..1 — fractional for the "n of m" checks
  detail?: string; // "3 of 6 photos"
};

// Weights are a judgement, so they are stated once, here, rather than sprinkled as
// magic numbers: 5 = a couple cannot evaluate you without it (photos, price, an
// About). 3 = it drives a filter or the headline comparison. 2 = strongly expected.
// 1 = a good-to-have that removes one more question from the DM.
const W = { critical: 5, high: 3, medium: 2, low: 1 } as const;

export type CompletenessInput = {
  category: string | null;
  images: string[];
  shortDescription: string;
  description: string;
  priceMin: string;
  entourageRateMin: string;
  services: string[];
  packages: { name: string; priced: boolean }[];
  faq: { q: string; a: string }[];
  essentials: EssentialsDraft;
  contacts: string[]; // the raw contact values; any one filled is enough
};

const filled = (s: string) => s.trim().length > 0;
const ratio = (n: number, target: number) =>
  target <= 0 ? 1 : Math.min(n, target) / target;

const TARGET_PHOTOS = 6;
const TARGET_FAQ = 3;

// How many of this category's live inputs the vendor has actually answered.
// Hidden dependents (retouch hours when the tier isn't "unlimited") are not counted
// against them — the same specVisible() the renderer and the validator use, so the
// three cannot disagree about what is being asked for.
function categoryFieldProgress(input: CompletenessInput): {
  answered: number;
  total: number;
} {
  const values = input.essentials.categoryFields;
  const specs = fieldsFor(input.category).filter((s) => specVisible(s, values));
  let answered = 0;
  for (const spec of specs) {
    const v = values[spec.key];
    if (Array.isArray(v) ? v.length > 0 : typeof v === "boolean" ? v : filled(String(v ?? ""))) {
      answered += 1;
    }
  }
  return { answered, total: specs.length };
}

export function buildChecks(input: CompletenessInput): Check[] {
  const checks: Check[] = [];
  const e = input.essentials;

  // ---- Contact (step 0) ----
  checks.push({
    key: "contact",
    label: "Add a way for couples to reach you",
    why: "Every button on your profile opens a direct message to you. With none of these, a couple who wants to book you has nowhere to go.",
    step: 0,
    weight: W.critical,
    progress: input.contacts.some(filled) ? 1 : 0,
  });

  // ---- Price & essentials (step 1) ----
  checks.push({
    key: "priceMin",
    label: "Publish your starting price",
    why: "Couples filter by budget. With no price you are left out of every budget filter — and “Price on enquiry” is what they scroll past.",
    step: 1,
    weight: W.critical,
    progress: filled(input.priceMin) ? 1 : 0,
  });

  if (hasEntourageRate(input.category)) {
    checks.push({
      key: "entourageRate",
      label: "Add your per-face entourage rate",
      why: "Eight faces can cost a couple more than the bride does. It is the number they actually budget on, and almost no one publishes it — which is exactly why publishing it wins you the enquiry.",
      step: 1,
      weight: W.high,
      progress: filled(input.entourageRateMin) ? 1 : 0,
    });
  }

  checks.push({
    key: "coverageAreas",
    label: "Say which areas you cover",
    why: "Coverage areas are what the location filter searches. With none set, a couple browsing your own area will never see you.",
    step: 1,
    weight: W.high,
    progress: e.coverageAreas.length > 0 ? 1 : 0,
  });

  checks.push({
    key: "bookingStatus",
    label: "Set your booking status",
    why: "Couples filter for who is still open for their date. An out-of-date status costs you enquiries you would have taken.",
    step: 1,
    weight: W.low,
    progress: filled(e.bookingStatus) ? 1 : 0,
  });

  checks.push({
    key: "paymentMethods",
    label: "List how you take payment",
    why: "GCash, bank transfer or cash — one of the last questions before a couple commits. Answer it before they have to ask.",
    step: 1,
    weight: W.low,
    progress: e.paymentMethods.length > 0 ? 1 : 0,
  });

  checks.push({
    key: "depositPercent",
    label: "State your deposit",
    why: "What it costs to hold the date is the question that turns an enquiry into a booking.",
    step: 1,
    weight: W.low,
    progress: filled(e.depositPercent) ? 1 : 0,
  });

  const set = fieldSetFor(input.category);
  if (set) {
    const { answered, total } = categoryFieldProgress(input);
    checks.push({
      key: "categoryFields",
      label: `Fill in your ${set.title.toLowerCase()}`,
      why: "These are the specifics couples compare you against, and several of them power the filters. Blanks read as “doesn’t offer it”.",
      step: 1,
      weight: W.high,
      progress: ratio(answered, total),
      detail: `${answered} of ${total} answered`,
    });
  }

  // ---- Services & packages (step 2) ----
  checks.push({
    key: "services",
    label: "Tick the services you offer",
    why: "Couples scan for the one thing they came for — hair as well as makeup, a prenup shoot, a second look.",
    step: 2,
    weight: W.medium,
    progress: input.services.length > 0 ? 1 : 0,
  });

  const named = input.packages.filter((p) => filled(p.name));
  const priced = named.filter((p) => p.priced).length;
  checks.push({
    key: "packagesPriced",
    label:
      named.length === 0
        ? "Add a package with a price"
        : "Put a real price on every package",
    why: "“Price on enquiry” is what every other directory shows. A number is the reason a couple messages you instead of scrolling on.",
    step: 2,
    weight: W.high,
    progress: named.length === 0 ? 0 : priced / named.length,
    detail:
      named.length === 0
        ? undefined
        : `${priced} of ${named.length} packages priced`,
  });

  // ---- About & photos (step 3) ----
  const n = input.images.length;
  checks.push({
    key: "photos",
    label:
      n === 0
        ? "Add your first photo"
        : `Build your gallery out to ${TARGET_PHOTOS} photos`,
    why: "Photos are the first thing a couple looks at and often the only thing. A profile with no gallery does not get read, it gets closed.",
    step: 3,
    weight: W.critical,
    progress: ratio(n, TARGET_PHOTOS),
    detail: `${n} of ${TARGET_PHOTOS} photos`,
  });

  checks.push({
    key: "description",
    label: "Write your About story",
    why: "The couples who message you have read it. It is where they decide you are the person they want beside them at 4 AM.",
    step: 3,
    weight: W.high,
    progress: filled(input.description) ? 1 : 0,
  });

  checks.push({
    key: "shortDescription",
    label: "Write your tagline",
    why: "One line, and it is the only thing shown on your card in the browse grid.",
    step: 3,
    weight: W.medium,
    progress: filled(input.shortDescription) ? 1 : 0,
  });

  // ---- In their words (step 4) ----
  const answeredQs = input.faq.filter((f) => filled(f.q) && filled(f.a)).length;
  checks.push({
    key: "faq",
    label: `Answer the questions couples always ask`,
    why: "Every question you answer here is one less back-and-forth before they book — and one less reason to go quiet.",
    step: 4,
    weight: W.low,
    progress: ratio(answeredQs, TARGET_FAQ),
    detail: `${answeredQs} of ${TARGET_FAQ} answered`,
  });

  return checks;
}

export type Completeness = {
  score: number; // 0-100
  checks: Check[];
  missing: Check[]; // incomplete, most valuable first
};

export function completeness(input: CompletenessInput): Completeness {
  const checks = buildChecks(input);
  const total = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + c.weight * c.progress, 0);
  // Floor, not round: 99% must mean "not done". Rounding up to 100 while an item is
  // still outstanding is the kind of small lie that makes the whole meter ignorable.
  const score = total === 0 ? 100 : Math.floor((earned / total) * 100);

  const missing = checks
    .filter((c) => c.progress < 1)
    // Most valuable first; among equals, the emptiest first — a gallery with one
    // photo is less urgent than a gallery with none.
    .sort((a, b) => b.weight - a.weight || a.progress - b.progress);

  return { score, checks, missing };
}
