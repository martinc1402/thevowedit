"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  SUPPLIER_COLUMNS,
  CONTACT_CHANNEL_COLUMNS,
  MUA_ESSENTIALS_COLUMNS,
  TAXONOMY_COLUMNS,
  ENTOURAGE_COLUMNS,
  IMAGE_FOCUS_COLUMNS,
  RESPONSE_TIME_COLUMNS,
  mapSupplierRow,
  type Supplier,
} from "@/lib/suppliers";
import { VOCAB_KEYS, type EssentialsData } from "@/lib/essentials-taxonomy";
import {
  fieldsFor,
  specVisible,
  hasEntourageRate,
} from "@/lib/category-fields";
import { isAdmin } from "@/lib/auth";
import { MODERATION_ENABLED } from "@/lib/moderation-config";
import { normalizeHandle, normalizePhonePH } from "@/lib/contact-normalize";
import { SERVICE_KEYS } from "@/lib/services-vocab";
import { STYLE_TAG_KEYS, styleTagsFor } from "@/lib/style-tags-vocab";
import { INCLUSION_KEYS } from "@/lib/package-inclusions";

// Full column projection for the authenticated dashboard reads — mirrors
// getSupplierBySlug so the wizard loads the newer contact-channel + essentials
// columns (which live outside the base SUPPLIER_COLUMNS list), plus drafts.
const DASHBOARD_COLUMNS = `${SUPPLIER_COLUMNS}, ${CONTACT_CHANNEL_COLUMNS}, ${MUA_ESSENTIALS_COLUMNS}, ${TAXONOMY_COLUMNS}, ${ENTOURAGE_COLUMNS}, ${IMAGE_FOCUS_COLUMNS}, ${RESPONSE_TIME_COLUMNS}, pending_changes`;

// The same projection minus the newest columns. Dashboard reads are resilient the
// way the public read already is: if a migration has not been applied yet, selecting
// a column that does not exist fails the WHOLE query, and getMySupplier would then
// return null — telling a vendor they have no profile at all. Retry without the new
// columns instead; they simply map to null until the migration runs.
const DASHBOARD_COLUMNS_FALLBACK = `${SUPPLIER_COLUMNS}, ${CONTACT_CHANNEL_COLUMNS}, ${MUA_ESSENTIALS_COLUMNS}, ${TAXONOMY_COLUMNS}, pending_changes`;

type RowResult = {
  data: unknown;
  error: { message: string } | null;
};

// Run a dashboard query with the full projection, falling back to the pre-migration
// one. `run` must be re-runnable: the first attempt fails at the parse stage, so no
// write is applied, and the values are identical on the retry anyway.
async function withColumnFallback(
  run: (columns: string) => PromiseLike<RowResult>,
): Promise<RowResult> {
  const first = await run(DASHBOARD_COLUMNS);
  if (!first.error) return first;
  return run(DASHBOARD_COLUMNS_FALLBACK);
}

// =====================================================================
// Supplier self-service profile actions.
//
// Identity = real Supabase Auth session (getUser via the session server client).
// Writes = service-role admin client, but ONLY after verifying the caller owns
// the target row (via the RLS-locked supplier_owners table) and ONLY through the
// editable-field allowlist below. This mirrors application.ts / inquiry.ts:
// never trust the client, validate server-side, write privileged.
// =====================================================================

export type Ownership = { supplierId: string; slug: string };

// The authenticated user, or null. Uses the session-aware server client.
async function currentUser() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// The supplier the logged-in user owns (id + slug), or null. Reads the private
// ownership table with the service role; the public never sees this link.
export async function getMyOwnership(): Promise<Ownership | null> {
  const user = await currentUser();
  if (!user) return null;

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("supplier_owners")
    .select("supplier_id, suppliers(slug)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.supplier_id) return null;
  const slug =
    (data as unknown as { suppliers?: { slug?: string } | null }).suppliers
      ?.slug ?? "";
  return { supplierId: String(data.supplier_id), slug };
}

// One-time link: on first login, attach this auth user to the supplier row that
// was seeded with their application email. Case-insensitive email match, and
// only claims an unclaimed row. Safe to call on every login (idempotent).
export async function claimSupplierForCurrentUser(): Promise<Ownership | null> {
  const user = await currentUser();
  if (!user?.email) return null;

  const admin = getSupabaseAdmin();

  // Already linked? Nothing to do.
  const existing = await getMyOwnership();
  if (existing) return existing;

  // Find an unclaimed owner row whose claim_email matches (case-insensitive).
  // Escape LIKE wildcards so an address such as "a_b@x.com" can't over-match.
  const pattern = user.email.replace(/([\\%_])/g, "\\$1");
  const { data: owner } = await admin
    .from("supplier_owners")
    .select("supplier_id")
    .is("user_id", null)
    .ilike("claim_email", pattern)
    .maybeSingle();

  if (!owner?.supplier_id) return null;

  const { error } = await admin
    .from("supplier_owners")
    .update({ user_id: user.id })
    .eq("supplier_id", owner.supplier_id)
    .is("user_id", null); // guard against a race double-claim

  if (error) return null;
  return getMyOwnership();
}

// The full supplier record for the dashboard (sees unpublished rows). Uses the
// service role after ownership is established.
export async function getMySupplier(): Promise<Supplier | null> {
  const own = await getMyOwnership();
  if (!own) return null;

  const admin = getSupabaseAdmin();
  const { data, error } = await withColumnFallback((columns) =>
    admin.from("suppliers").select(columns).eq("id", own.supplierId).maybeSingle(),
  );

  if (error || !data) return null;
  return mapSupplierRow(data as unknown as Record<string, unknown>);
}

// ---------------------------------------------------------------------
// Coercion helpers — bound every value, tolerate non-typed payloads.
// ---------------------------------------------------------------------
const cap = (v: unknown, n: number) =>
  (typeof v === "string" ? v : "").trim().slice(0, n);
const capOrNull = (v: unknown, n: number) => {
  const s = cap(v, n);
  return s === "" ? null : s;
};
const intOrNull = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) ? n : null;
};
const boolVal = (v: unknown) => v === true || v === "true" || v === "on";
const strArray = (v: unknown, itemLen: number, max: number) =>
  Array.from(
    new Set(
      (Array.isArray(v) ? v : []).map((x) => cap(x, itemLen)).filter(Boolean),
    ),
  ).slice(0, max);

// jsonb coercers -------------------------------------------------------
function coercePackages(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v
    .map((p) => {
      const o = (p ?? {}) as Record<string, unknown>;
      return {
        name: cap(o.name, 120),
        priceLabel: capOrNull(o.priceLabel, 80) ?? undefined,
        // Inclusions are a locked vocabulary — drop anything off the list.
        includes: enumArray(o.includes, INCLUSION_KEYS, 20),
      };
    })
    .filter((p) => p.name !== "")
    .slice(0, 4); // max 4 packages
}
function coerceSpecs(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return { label: cap(o.label, 60), value: cap(o.value, 200) };
    })
    .filter((s) => s.label !== "")
    .slice(0, 40);
}
function coerceHighlights(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return { label: cap(o.label, 60), value: cap(o.value, 200) };
    })
    .filter((s) => s.label !== "")
    .slice(0, 12);
}
function coerceFaq(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v
    .map((f) => {
      const o = (f ?? {}) as Record<string, unknown>;
      return { q: cap(o.q, 200), a: cap(o.a, 2000) };
    })
    .filter((f) => f.q !== "")
    .slice(0, 40);
}
// The vendor's preferred primary contact channel — only a known key, else null.
const CHANNEL_KEYS = new Set([
  "instagram",
  "messenger",
  "viber",
  "phone",
  "whatsapp",
  "email",
]);
const coerceChannel = (v: unknown) => {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  return CHANNEL_KEYS.has(s) ? s : null;
};

// Contact normalisers (shared with the wizard's inline validation) — store the
// canonical forms the public deep-link builders expect.
const coerceHandle = (v: unknown) => normalizeHandle(v)?.slice(0, 200) ?? null;
const coercePhone = (v: unknown) => {
  if (typeof v !== "string" || v.trim() === "") return null;
  const r = normalizePhonePH(v);
  return r.ok ? r.value : null;
};

// How the vendor works: solo or with a team (drives the capacity essentials row).
const coerceWorksWith = (v: unknown) => {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  return s === "solo" || s === "team" ? s : null;
};

// ---- Structured essentials taxonomy (validated against the locked vocab) ----
const inSet = (v: unknown, set: Set<string>) => {
  const s = typeof v === "string" ? v.trim() : "";
  return set.has(s) ? s : null;
};
const enumArray = (v: unknown, set: Set<string>, max: number) =>
  Array.from(
    new Set(
      (Array.isArray(v) ? v : [])
        .map((x) => inSet(x, set))
        .filter((x): x is string => x !== null),
    ),
  ).slice(0, max);

const coercePriceUnit = (v: unknown) => inSet(v, VOCAB_KEYS.priceUnit);

// Reply-time: a positive int clamped to 1..99 (blank/invalid -> null, which hides
// the trust line), and a unit restricted to the three allowed keys (default hours).
const coerceResponseValue = (v: unknown) => {
  const n = intOrNull(v);
  return n != null && n >= 1 ? Math.min(99, n) : null;
};
const RESPONSE_TIME_UNITS = ["hours", "days", "weeks"] as const;
const coerceResponseUnit = (v: unknown) =>
  (RESPONSE_TIME_UNITS as readonly string[]).includes(String(v))
    ? String(v)
    : "hours";

// Deep-validate the essentials jsonb: enums against vocab, numbers/bools coerced,
// unknown keys dropped, custom facts capped at 3. Built as a plain object then
// cast (every value has been validated).
function coerceEssentials(
  v: unknown,
  category: string | null,
): EssentialsData | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const obj = (x: unknown) =>
    x && typeof x === "object" && !Array.isArray(x)
      ? (x as Record<string, unknown>)
      : undefined;

  const cov = obj(o.coverage);
  if (cov) {
    const areas = enumArray(cov.areas, VOCAB_KEYS.area, 20);
    if (areas.length) {
      const note = capOrNull(cov.travelNote, 120);
      out.coverage = {
        areas,
        travelsBeyond: boolVal(cov.travelsBeyond),
        ...(note ? { travelNote: note } : {}),
      };
    }
  }

  const bs = obj(o.bookingStatus);
  const status = bs ? inSet(bs.status, VOCAB_KEYS.bookingStatus) : null;
  if (status) {
    const note = bs ? capOrNull(bs.note, 120) : null;
    out.bookingStatus = { status, ...(note ? { note } : {}) };
  }

  const terms = capOrNull(o.bookingTerms, 300);
  if (terms) out.bookingTerms = terms;

  const pay = enumArray(o.paymentMethods, VOCAB_KEYS.paymentMethod, 4);
  if (pay.length) out.paymentMethods = pay as EssentialsData["paymentMethods"];

  // A deposit is a percentage of the fee: anything outside 1-100 is a typo.
  const dep = intOrNull(o.depositPercent);
  if (dep != null && dep > 0 && dep <= 100) out.depositPercent = dep;

  const langs = enumArray(o.languages, VOCAB_KEYS.language, 6);
  if (langs.length) out.languages = langs;

  const team = obj(o.team);
  const size = team ? inSet(team.size, VOCAB_KEYS.teamSize) : null;
  if (size) {
    const note = team ? capOrNull(team.note, 120) : null;
    out.team = { size, ...(note ? { note } : {}) };
  }

  // Category fields, validated FROM THE SPECS for this vendor's actual category.
  //
  // This used to be a hardcoded allowlist of the 11 makeup keys that never looked
  // at the category — so a photographer posting `coverageHours` had it SILENTLY
  // DROPPED, and no category but makeup could persist a single field. The specs are
  // the same ones the wizard renders from, so the form and the validator cannot
  // disagree about what exists.
  const cf = obj(o.categoryFields);
  if (cf) {
    const fields: Record<string, unknown> = {};
    for (const spec of fieldsFor(category)) {
      // A hidden dependent field (retouch hours when the tier isn't "unlimited")
      // is not being edited, so it is not stored.
      if (!specVisible(spec, cf)) continue;
      const v = cf[spec.key];

      switch (spec.kind) {
        case "select": {
          const keys = new Set(spec.vocab.map((x) => x.key));
          const picked = inSet(v, keys);
          if (picked) fields[spec.key] = picked;
          break;
        }
        case "chips": {
          const keys = new Set(spec.vocab.map((x) => x.key));
          const picked = enumArray(v, keys, spec.max);
          if (picked.length) fields[spec.key] = picked;
          break;
        }
        case "number": {
          const n = intOrNull(v);
          // Bound it: a negative or absurd number is a typo, not an answer.
          if (n != null && n > 0 && n <= spec.max) fields[spec.key] = n;
          break;
        }
        case "time": {
          const t = cap(v, 5);
          if (/^\d{1,2}:\d{2}$/.test(t)) fields[spec.key] = t;
          break;
        }
        case "bool": {
          if (v === true || v === "true") fields[spec.key] = true;
          break;
        }
        default: {
          const t = capOrNull(v, spec.maxLength);
          if (t) fields[spec.key] = t;
        }
      }
    }
    if (Object.keys(fields).length) out.categoryFields = fields;
  }

  if (Array.isArray(o.customEssentials)) {
    const custom = o.customEssentials
      .map((c) => {
        const co = (c ?? {}) as Record<string, unknown>;
        return { label: cap(co.label, 40), value: cap(co.value, 120) };
      })
      .filter((c) => c.label && c.value)
      .slice(0, 3);
    if (custom.length) out.customEssentials = custom;
  }

  return Object.keys(out).length ? (out as EssentialsData) : null;
}
function coercePerService(v: unknown) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out: Record<string, { min?: number; max?: number }> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const key = cap(k, 40);
    if (!key) continue;
    const o = (val ?? {}) as Record<string, unknown>;
    const min = intOrNull(o.min);
    const max = intOrNull(o.max);
    if (min == null && max == null) continue;
    out[key] = {
      ...(min != null ? { min } : {}),
      ...(max != null ? { max } : {}),
    };
  }
  return Object.keys(out).length ? out : null;
}

// The editable-field allowlist: camelCase patch key -> [db column, coercer].
// Anything NOT here (id, slug, user_id, verified, featured, rating,
// review_count, reviews, images) can never be written through this path.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FIELDS: Record<string, [string, (v: unknown) => any]> = {
  name: ["name", (v) => cap(v, 200)],
  location: ["location", (v) => cap(v, 120) || "Cebu"],
  categories: ["categories", (v) => strArray(v, 60, 12)],
  // NOTE: `serves_areas` is deliberately NOT writable here. It is DERIVED from
  // essentials.coverage.areas on every save (see deriveServesAreas below) so the
  // GIN-indexed array the browse filter queries can never drift from the coverage
  // chips the vendor actually ticks. It used to be free text and had gone stale —
  // it held "Mactan", which the taxonomy rejects (Mactan is inside Lapu-Lapu).
  // Locked vocabulary (src/lib/style-tags-vocab.ts): anything outside it is dropped.
  // No DB check constraint — legacy free-text tags must survive in the column and
  // keep rendering via resolveStyleTag()'s passthrough until the vendor re-picks.
  styleTags: ["style_tags", (v) => enumArray(v, STYLE_TAG_KEYS, 6)],
  services: ["services", (v) => enumArray(v, SERVICE_KEYS, 30)],
  shortDescription: ["short_description", (v) => capOrNull(v, 280)],
  description: ["description", (v) => capOrNull(v, 6000)],
  bio: ["bio", (v) => capOrNull(v, 2000)],
  teamPhoto: ["team_photo", (v) => capOrNull(v, 800)],
  priceMin: ["price_min", intOrNull],
  priceMax: ["price_max", intOrNull],
  priceTypical: ["price_typical", intOrNull],
  // The per-FACE entourage rate. Distinct from price_min (the bride rate) and the
  // real swing factor in a Filipino wedding bill.
  entourageRateMin: ["entourage_rate_min", intOrNull],
  entourageRateMax: ["entourage_rate_max", intOrNull],
  currency: ["currency", (v) => cap(v, 8) || "PHP"],
  pricingNotes: ["pricing_notes", (v) => capOrNull(v, 2000)],
  packages: ["packages", coercePackages],
  responseTimeValue: ["response_time_value", coerceResponseValue],
  responseTimeUnit: ["response_time_unit", coerceResponseUnit],
  establishedYear: ["established_year", intOrNull],
  weddingsCount: ["weddings_count", intOrNull],
  instagram: ["instagram", coerceHandle],
  facebook: ["facebook", coerceHandle],
  website: ["website", (v) => capOrNull(v, 300)],
  email: ["email", (v) => capOrNull(v, 320)],
  phone: ["phone", coercePhone],
  viber: ["viber", coercePhone],
  whatsapp: ["whatsapp", coercePhone],
  preferredChannel: ["preferred_channel", coerceChannel],
  worksWith: ["works_with", coerceWorksWith],
  groupCapacity: ["group_capacity", intOrNull],
  priceUnit: ["price_unit", coercePriceUnit],
  // NOTE: `essentials` is intercepted in updateMyProfile before this coercer is
  // reached — its category fields can only be validated against the vendor's own
  // category, which a (v) => any coercer cannot see. This entry exists so the key
  // stays on the allowlist; the null category makes it fail closed if ever called.
  essentials: ["essentials", (v) => coerceEssentials(v, null)],
  specs: ["specs", coerceSpecs],
  faq: ["faq", coerceFaq],
  // Editorial / trust fields — admin-only (see ADMIN_ONLY_FIELDS). Given write
  // paths so the admin console can set them; dropped for vendor callers.
  editorialTagline: ["editorial_tagline", (v) => capOrNull(v, 200)],
  editorNote: ["editor_note", (v) => capOrNull(v, 2000)],
  editorHighlights: ["editor_highlights", coerceHighlights],
  verified: ["verified", boolVal],
  featured: ["featured", boolVal],
};

// ---- Permission tiers (enforced server-side; the UI mirror is advisory) ----
// ADMIN-ONLY: dropped entirely for vendor callers (editorial voice, trust
// badges, category, the "replies within…" trust line). slug is intentionally
// absent from FIELDS so nobody can change it through this path.
const ADMIN_ONLY_FIELDS = new Set([
  "categories",
  "editorialTagline",
  "editorNote",
  "editorHighlights",
  "verified",
  "featured",
]);

// VENDOR APPROVAL-REQUIRED: when moderation is ON (MODERATION_ENABLED), a
// vendor's writes here land in `pending_changes` (draft), not the live row,
// until an admin approves. Keyed by camelCase patch key; the pending buffer
// stores them under their DB column. `essentials`'s customEssentials sub-field
// is handled specially (split from the enum parts). Inert when moderation is
// off — these fields then write live like everything else — but the list stays
// so re-enabling the switch restores the exact approval set with no rebuild.
const VENDOR_APPROVAL_FIELDS = new Set([
  "name",
  "shortDescription",
  "description",
  "bio",
  "faq",
  "teamPhoto",
]);

// Gallery cap. Enforced in addProfileImageUrl as a refusal, not a truncation.
const MAX_IMAGES = 24;

export type ProfilePatch = Record<string, unknown>;
export type SaveResult =
  | { ok: true; supplier: Supplier }
  | { ok: false; error: string };

const GENERIC = "We could not save your changes. Please try again.";

type Admin = ReturnType<typeof getSupabaseAdmin>;

async function currentEssentials(
  admin: Admin,
  supplierId: string,
): Promise<EssentialsData | null> {
  const { data } = await admin
    .from("suppliers")
    .select("essentials")
    .eq("id", supplierId)
    .maybeSingle();
  return (data as { essentials?: EssentialsData } | null)?.essentials ?? null;
}

// The supplier's live categories — the vocabulary a field like styleTags is keyed
// on. Read from the row, never from the patch: `categories` is admin-only, so a
// vendor cannot widen their own vocabulary by sending one.
async function currentCategories(
  admin: Admin,
  supplierId: string,
): Promise<string[]> {
  const { data } = await admin
    .from("suppliers")
    .select("categories")
    .eq("id", supplierId)
    .maybeSingle();
  const cats = (data as { categories?: unknown } | null)?.categories;
  return Array.isArray(cats) ? (cats as string[]) : [];
}

async function currentPending(
  admin: Admin,
  supplierId: string,
): Promise<Record<string, unknown>> {
  const { data } = await admin
    .from("suppliers")
    .select("pending_changes")
    .eq("id", supplierId)
    .maybeSingle();
  const pc = (data as { pending_changes?: unknown } | null)?.pending_changes;
  return pc && typeof pc === "object" && !Array.isArray(pc)
    ? (pc as Record<string, unknown>)
    : {};
}

// The LIVE values of the approval-gated columns, so a save can tell what actually
// changed. Read once per save, and only when the patch touches one of them.
const APPROVAL_COLUMNS = [
  "name",
  "short_description",
  "description",
  "bio",
  "faq",
  "team_photo",
] as const;

async function currentApprovalValues(
  admin: Admin,
  supplierId: string,
): Promise<Record<string, unknown>> {
  const { data } = await admin
    .from("suppliers")
    .select(APPROVAL_COLUMNS.join(", "))
    .eq("id", supplierId)
    .maybeSingle();
  return (data ?? {}) as Record<string, unknown>;
}

// Deep value equality for what lands in the buffer (scalars, null, and faq[]).
// Ordering is stable on both sides — the live column and the coerced patch are both
// produced by the same coercers — so a JSON compare is sound here.
const sameValue = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// Validate + write a partial profile update, enforcing the permission tiers:
//   admin caller  -> every allowlisted field writes live.
//   vendor caller -> admin-only fields dropped; approval fields buffered into
//                    `pending_changes` when moderation is ON, else written live;
//                    everything else always writes live immediately.
// Images are handled by the dedicated image actions below (also tier-aware).
export async function updateMyProfile(patch: ProfilePatch): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };

  const callerIsAdmin = await isAdmin();
  const admin = getSupabaseAdmin();

  const live: Record<string, unknown> = {}; // written to the live row now
  const pending: Record<string, unknown> = {}; // vendor drafts -> pending_changes
  const clearPendingKeys: string[] = []; // drafts that match live again -> drop them
  // Live values of the approval columns, fetched lazily (once) the first time an
  // approval field is seen, so a save that touches none pays nothing.
  let approvalLive: Record<string, unknown> | undefined;

  if (patch && typeof patch === "object") {
    for (const [key, spec] of Object.entries(FIELDS)) {
      if (!(key in patch)) continue;
      const [col, coerce] = spec;

      // Style tags exist only for categories that have a vocabulary (today: makeup).
      // Checked BEFORE the admin branch, because this is a categorical rule, not a
      // permission one. Skipping the key leaves the column untouched, so a
      // photographer's legacy free-text tags survive rather than being coerced away.
      if (key === "styleTags") {
        const cats = await currentCategories(admin, own.supplierId);
        if (!styleTagsFor(cats[0] ?? null).length) continue;
      }

      // The entourage rate is charged PER FACE — a makeup concept. Skip it for any
      // other category so a stray value can never be stored, and therefore never
      // printed on their card as "+ ₱X per face".
      if (key === "entourageRateMin" || key === "entourageRateMax") {
        const cats = await currentCategories(admin, own.supplierId);
        if (!hasEntourageRate(cats[0] ?? null)) continue;
      }

      // Essentials is handled BEFORE the admin branch, because its category fields
      // can only be validated against the vendor's own category (the generic
      // `coerce` below has no way to know it). Routing an admin through that would
      // drop every category field they touched.
      if (key === "essentials") {
        const cats = await currentCategories(admin, own.supplierId);
        const coerced = coerceEssentials(
          patch[key],
          cats[0] ?? null,
        ) as EssentialsData | null;

        // Admin always writes everything live; so does a vendor when moderation is
        // off (custom facts included, no pending split).
        if (callerIsAdmin || !MODERATION_ENABLED) {
          live.essentials = coerced;
          continue;
        }

        // Vendor, moderation ON: enum/structured parts go live now; customEssentials
        // drafts go to pending, preserving the custom facts already approved on the
        // live row.
        const cur = await currentEssentials(admin, own.supplierId);
        const liveEssentials = coerced ? { ...coerced } : null;
        if (liveEssentials) {
          if (cur?.customEssentials?.length) {
            liveEssentials.customEssentials = cur.customEssentials;
          } else {
            delete liveEssentials.customEssentials;
          }
        }
        live.essentials = liveEssentials;

        // Buffer the custom facts only when they actually DIFFER from live.
        //   * [] when live has facts  -> a real deletion, must be buffered (writing
        //     this key only when non-empty used to make deletion unexpressible).
        //   * [] when live is already empty -> a no-op. Buffering it anyway queued a
        //     phantom "Custom essentials" change for review on EVERY essentials save.
        //   * back to the live value -> the vendor reverted, so drop any stale draft.
        const draftCustom = coerced?.customEssentials ?? [];
        const liveCustom = cur?.customEssentials ?? [];
        if (JSON.stringify(draftCustom) !== JSON.stringify(liveCustom)) {
          pending.essentials_custom = draftCustom;
        } else {
          clearPendingKeys.push("essentials_custom");
        }
        continue;
      }

      if (callerIsAdmin) {
        live[col] = coerce(patch[key]); // admin writes straight to live
        continue;
      }
      if (ADMIN_ONLY_FIELDS.has(key)) continue; // silently dropped for vendors

      if (MODERATION_ENABLED && VENDOR_APPROVAL_FIELDS.has(key)) {
        // Buffer ONLY a real change.
        //
        // The wizard seeds every approval field on a step from the live value, so
        // saving one edited field re-submits the other five unchanged. Buffering
        // them all made the moderation queue read "6 changes pending" for a single
        // edited sentence — an inflated count that hides what actually changed, and
        // gives a moderator nothing to review but five no-ops.
        //
        // Reverting to the live value now also DROPS a stale draft, so a vendor who
        // changes their mind clears the queue instead of leaving a phantom entry.
        const value = coerce(patch[key]);
        approvalLive ??= await currentApprovalValues(admin, own.supplierId);
        if (sameValue(value, approvalLive[col])) {
          clearPendingKeys.push(col);
        } else {
          pending[col] = value;
        }
        continue;
      }

      live[col] = coerce(patch[key]); // immediate
    }
  }

  // `serves_areas` is DERIVED, never entered. It is the GIN-indexed array the browse
  // filter queries, and it must be exactly the coverage chips the vendor ticked —
  // as free text it had already drifted (it held "Mactan", which the taxonomy
  // rejects because Mactan sits inside Lapu-Lapu). Rewritten on any essentials save,
  // for admin and vendor callers alike.
  //
  // Stores the taxonomy KEYS (`cebu-city`), not the display labels: the column is
  // never rendered, and keys are what the browse URL carries (/vendors?area=cebu-city),
  // so the filter is an exact match with nothing to translate.
  if ("essentials" in live) {
    const ess = live.essentials as EssentialsData | null;
    live.serves_areas = ess?.coverage?.areas ?? [];
  }

  if (Object.keys(pending).length > 0 || clearPendingKeys.length > 0) {
    const cur = await currentPending(admin, own.supplierId);
    const merged = { ...cur, ...pending };
    for (const k of clearPendingKeys) delete merged[k];
    // An empty buffer is null, not {} — otherwise the vendor keeps showing up in the
    // moderation queue with nothing actually pending.
    live.pending_changes = Object.keys(merged).length > 0 ? merged : null;
  }

  if (Object.keys(live).length === 0) {
    const supplier = await getMySupplier();
    return supplier ? { ok: true, supplier } : { ok: false, error: GENERIC };
  }

  const { data, error } = await withColumnFallback((columns) =>
    admin
      .from("suppliers")
      .update(live)
      .eq("id", own.supplierId)
      .select(columns)
      .single(),
  );

  if (error || !data) {
    console.error("[profile] update failed:", error?.message);
    return { ok: false, error: GENERIC };
  }

  revalidatePath(`/vendors/${own.slug}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    supplier: mapSupplierRow(data as unknown as Record<string, unknown>),
  };
}

// Flip the vendor-controlled publish toggle.
export async function setPublished(published: boolean): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };

  const admin = getSupabaseAdmin();
  const { data, error } = await withColumnFallback((columns) =>
    admin
      .from("suppliers")
      .update({ published: Boolean(published) })
      .eq("id", own.supplierId)
      .select(columns)
      .single(),
  );

  if (error || !data) return { ok: false, error: GENERIC };
  revalidatePath(`/vendors/${own.slug}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    supplier: mapSupplierRow(data as unknown as Record<string, unknown>),
  };
}

// Gallery images are APPROVAL-REQUIRED for vendors when moderation is ON: their
// edits accumulate in `pending_changes.images` (a draft, seeded from the live
// gallery) and replace the live gallery only when an admin approves. Admins —
// and every caller when moderation is OFF (see `writesLive` in the actions
// below) — edit the live gallery directly. Read both sets so we can route writes
// and clean storage safely.
async function readImageSets(
  admin: Admin,
  supplierId: string,
): Promise<{ live: string[]; pending: string[] | null }> {
  const { data } = await admin
    .from("suppliers")
    .select("images, pending_changes")
    .eq("id", supplierId)
    .maybeSingle();
  const live = Array.isArray((data as { images?: unknown } | null)?.images)
    ? ((data as { images: string[] }).images)
    : [];
  const pc = (data as { pending_changes?: unknown } | null)?.pending_changes as
    | { images?: unknown }
    | null
    | undefined;
  const pending = pc && Array.isArray(pc.images) ? (pc.images as string[]) : null;
  return { live, pending };
}

// Persist a gallery array to the right place: live when the caller writes live
// (admin, or any caller while moderation is off), pending for a moderated vendor.
async function saveImages(
  own: Ownership,
  images: string[],
  writesLive: boolean,
): Promise<SaveResult> {
  const admin = getSupabaseAdmin();
  let update: Record<string, unknown>;
  if (writesLive) {
    update = { images };
  } else {
    const cur = await currentPending(admin, own.supplierId);
    update = { pending_changes: { ...cur, images } };
  }
  const { data, error } = await withColumnFallback((columns) =>
    admin
      .from("suppliers")
      .update(update)
      .eq("id", own.supplierId)
      .select(columns)
      .single(),
  );
  if (error || !data) return { ok: false, error: GENERIC };
  revalidatePath(`/vendors/${own.slug}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    supplier: mapSupplierRow(data as unknown as Record<string, unknown>),
  };
}

// The gallery a caller is editing: the live set when they write live (admin, or
// any caller while moderation is off); the draft (or a seed-copy of live)
// otherwise.
function draftSet(
  live: string[],
  pending: string[] | null,
  writesLive: boolean,
): string[] {
  return writesLive ? live : (pending ?? live);
}

// Remove one gallery image from the caller's set; delete the storage object only
// once nothing (live OR pending) references it anymore.
export async function deleteProfileImage(url: string): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };
  const callerIsAdmin = await isAdmin();
  const writesLive = callerIsAdmin || !MODERATION_ENABLED;
  const admin = getSupabaseAdmin();
  const { live, pending } = await readImageSets(admin, own.supplierId);
  const target = draftSet(live, pending, writesLive);
  if (!target.includes(url)) {
    const supplier = await getMySupplier();
    return supplier ? { ok: true, supplier } : { ok: false, error: GENERIC };
  }
  const next = target.filter((u) => u !== url);
  const other = writesLive ? (pending ?? []) : live;

  if (!other.includes(url) && !next.includes(url)) {
    // Best-effort storage cleanup within this supplier's own folder only.
    const marker = "/supplier-images/";
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const path = url.slice(idx + marker.length);
      if (path.startsWith(`${own.slug}/`)) {
        await admin.storage.from("supplier-images").remove([path]);
      }
    }
  }
  return saveImages(own, next, writesLive);
}

// Reorder the gallery. The new order must be a permutation of the caller's set.
export async function reorderProfileImages(urls: string[]): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };
  const callerIsAdmin = await isAdmin();
  const writesLive = callerIsAdmin || !MODERATION_ENABLED;
  const admin = getSupabaseAdmin();
  const { live, pending } = await readImageSets(admin, own.supplierId);
  const target = draftSet(live, pending, writesLive);
  const next = (Array.isArray(urls) ? urls : []).filter((u) =>
    target.includes(u),
  );
  for (const u of target) if (!next.includes(u)) next.push(u);
  return saveImages(own, next, writesLive);
}

// A public storage URL is only acceptable if it points inside THIS supplier's own
// folder, so a forged/external URL can't be injected through a client-invocable
// server action. Ownership always comes from the SESSION, never from an argument.
function ownsImageUrl(own: Ownership, url: unknown): url is string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const prefix = `${base}/storage/v1/object/public/supplier-images/${own.slug}/`;
  return typeof url === "string" && url.startsWith(prefix);
}

// Append an already-uploaded public URL to the gallery. The upload route calls
// this after pushing the object to storage.
export async function addProfileImageUrl(url: string): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };
  if (!ownsImageUrl(own, url)) {
    return { ok: false, error: "Invalid image reference." };
  }

  const callerIsAdmin = await isAdmin();
  const writesLive = callerIsAdmin || !MODERATION_ENABLED;
  const admin = getSupabaseAdmin();
  const { live, pending } = await readImageSets(admin, own.supplierId);
  const target = draftSet(live, pending, writesLive);
  if (target.includes(url)) {
    const supplier = await getMySupplier();
    return supplier ? { ok: true, supplier } : { ok: false, error: GENERIC };
  }
  // Refuse at the cap rather than appending-then-truncating: a trailing slice()
  // silently dropped the NEW url, reported success, and orphaned the object the
  // upload route had just written. Failing here lets the route roll that back.
  if (target.length >= MAX_IMAGES) {
    return {
      ok: false,
      error: `You can have up to ${MAX_IMAGES} photos. Remove one to add another.`,
    };
  }
  return saveImages(own, [...target, url], writesLive);
}

// Set the portrait from an already-uploaded public URL (the upload route calls
// this for kind=portrait). Routes through updateMyProfile so `teamPhoto` keeps
// its existing permission tier — a moderated vendor's portrait lands in
// pending_changes for review; an admin (or any caller when moderation is off)
// writes live. No new permission surface.
export async function setTeamPhotoUrl(url: string): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };
  if (!ownsImageUrl(own, url)) {
    return { ok: false, error: "Invalid image reference." };
  }
  return updateMyProfile({ teamPhoto: url });
}

// Set a photo's crop anchor (focal point). Stored in the `image_focus` jsonb map
// keyed by URL as [x, y] in 0-100 percent, applied as object-position wherever the
// image is cover-cropped. Ownership + URL validation reuse the same session-based
// checks as the gallery actions; the value is clamped so a client can't inject an
// out-of-range position. Writes live (gallery edits are already live with moderation
// off); a URL with no entry keeps the default centre.
export async function setImageFocus(
  url: string,
  x: number,
  y: number,
): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };
  if (!ownsImageUrl(own, url)) {
    return { ok: false, error: "Invalid image reference." };
  }

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(Number(n))));
  const focus: [number, number] = [clamp(x), clamp(y)];
  if (Number.isNaN(focus[0]) || Number.isNaN(focus[1])) {
    return { ok: false, error: GENERIC };
  }

  const admin = getSupabaseAdmin();
  const { data: cur } = await admin
    .from("suppliers")
    .select("image_focus")
    .eq("id", own.supplierId)
    .maybeSingle();
  const prev = (cur as { image_focus?: unknown } | null)?.image_focus;
  const map: Record<string, [number, number]> =
    prev && typeof prev === "object" && !Array.isArray(prev)
      ? { ...(prev as Record<string, [number, number]>) }
      : {};
  map[url] = focus;

  const { data, error } = await withColumnFallback((columns) =>
    admin
      .from("suppliers")
      .update({ image_focus: map })
      .eq("id", own.supplierId)
      .select(columns)
      .single(),
  );

  if (error || !data) return { ok: false, error: GENERIC };
  revalidatePath(`/vendors/${own.slug}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    supplier: mapSupplierRow(data as unknown as Record<string, unknown>),
  };
}
