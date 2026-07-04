"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  SUPPLIER_COLUMNS,
  mapSupplierRow,
  type Supplier,
} from "@/lib/suppliers";

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
  const { data, error } = await admin
    .from("suppliers")
    .select(SUPPLIER_COLUMNS)
    .eq("id", own.supplierId)
    .maybeSingle();

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
        includes: strArray(o.includes, 200, 30),
      };
    })
    .filter((p) => p.name !== "")
    .slice(0, 20);
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
  basedIn: ["based_in", (v) => cap(v, 120)],
  location: ["location", (v) => cap(v, 120) || "Cebu"],
  servesAreas: ["serves_areas", (v) => strArray(v, 120, 40)],
  categories: ["categories", (v) => strArray(v, 60, 12)],
  styleTags: ["style_tags", (v) => strArray(v, 60, 24)],
  shortDescription: ["short_description", (v) => capOrNull(v, 280)],
  description: ["description", (v) => capOrNull(v, 6000)],
  bio: ["bio", (v) => capOrNull(v, 2000)],
  teamPhoto: ["team_photo", (v) => capOrNull(v, 800)],
  videoUrl: ["video_url", (v) => capOrNull(v, 500)],
  priceMin: ["price_min", intOrNull],
  priceMax: ["price_max", intOrNull],
  priceTypical: ["price_typical", intOrNull],
  currency: ["currency", (v) => cap(v, 8) || "PHP"],
  perServicePricing: ["per_service_pricing", coercePerService],
  pricingNotes: ["pricing_notes", (v) => capOrNull(v, 2000)],
  priceIncludesScVat: ["price_includes_sc_vat", boolVal],
  packages: ["packages", coercePackages],
  availabilityNote: ["availability_note", (v) => capOrNull(v, 200)],
  responseTimeNote: ["response_time_note", (v) => capOrNull(v, 200)],
  bookingTerms: ["booking_terms", (v) => capOrNull(v, 500)],
  travelFeeNote: ["travel_fee_note", (v) => capOrNull(v, 300)],
  worksWithOverseasCouples: ["works_with_overseas_couples", boolVal],
  establishedYear: ["established_year", intOrNull],
  weddingsCount: ["weddings_count", intOrNull],
  instagram: ["instagram", (v) => capOrNull(v, 200)],
  facebook: ["facebook", (v) => capOrNull(v, 200)],
  website: ["website", (v) => capOrNull(v, 300)],
  portfolioLink: ["portfolio_link", (v) => capOrNull(v, 300)],
  email: ["email", (v) => capOrNull(v, 320)],
  phone: ["phone", (v) => capOrNull(v, 40)],
  specs: ["specs", coerceSpecs],
  faq: ["faq", coerceFaq],
};

export type ProfilePatch = Record<string, unknown>;
export type SaveResult =
  | { ok: true; supplier: Supplier }
  | { ok: false; error: string };

const GENERIC = "We could not save your changes. Please try again.";

// Validate + write a partial profile update. Only allowlisted keys are applied;
// images are managed by the dedicated image actions below, not here.
export async function updateMyProfile(patch: ProfilePatch): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };

  const update: Record<string, unknown> = {};
  if (patch && typeof patch === "object") {
    for (const [key, spec] of Object.entries(FIELDS)) {
      if (key in patch) {
        const [col, coerce] = spec;
        update[col] = coerce(patch[key]);
      }
    }
  }

  if (Object.keys(update).length === 0) {
    const supplier = await getMySupplier();
    return supplier
      ? { ok: true, supplier }
      : { ok: false, error: GENERIC };
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("suppliers")
    .update(update)
    .eq("id", own.supplierId)
    .select(SUPPLIER_COLUMNS)
    .single();

  if (error || !data) {
    console.error("[profile] update failed:", error?.message);
    return { ok: false, error: GENERIC };
  }

  revalidatePath(`/suppliers/${own.slug}`);
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
  const { data, error } = await admin
    .from("suppliers")
    .update({ published: Boolean(published) })
    .eq("id", own.supplierId)
    .select(SUPPLIER_COLUMNS)
    .single();

  if (error || !data) return { ok: false, error: GENERIC };
  revalidatePath(`/suppliers/${own.slug}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    supplier: mapSupplierRow(data as unknown as Record<string, unknown>),
  };
}

// Persist a new images[] array (used after upload / reorder / delete). Values
// must be existing public URLs in this supplier's storage folder, or the
// current images — we don't accept arbitrary external URLs here.
async function writeImages(
  own: Ownership,
  images: string[],
): Promise<SaveResult> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("suppliers")
    .update({ images })
    .eq("id", own.supplierId)
    .select(SUPPLIER_COLUMNS)
    .single();
  if (error || !data) return { ok: false, error: GENERIC };
  revalidatePath(`/suppliers/${own.slug}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    supplier: mapSupplierRow(data as unknown as Record<string, unknown>),
  };
}

async function currentImages(supplierId: string): Promise<string[]> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("suppliers")
    .select("images")
    .eq("id", supplierId)
    .maybeSingle();
  const imgs = (data as { images?: unknown } | null)?.images;
  return Array.isArray(imgs) ? (imgs as string[]) : [];
}

// Remove one gallery image: drop it from images[] and delete the storage object.
export async function deleteProfileImage(url: string): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };
  const images = await currentImages(own.supplierId);
  if (!images.includes(url)) {
    const supplier = await getMySupplier();
    return supplier ? { ok: true, supplier } : { ok: false, error: GENERIC };
  }

  // Best-effort storage cleanup: parse the object path after the bucket segment.
  const admin = getSupabaseAdmin();
  const marker = "/supplier-images/";
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    const path = url.slice(idx + marker.length);
    // Only delete within this supplier's own folder.
    if (path.startsWith(`${own.slug}/`)) {
      await admin.storage.from("supplier-images").remove([path]);
    }
  }

  return writeImages(
    own,
    images.filter((u) => u !== url),
  );
}

// Reorder the gallery. The new order must be a permutation of the current URLs.
export async function reorderProfileImages(urls: string[]): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };
  const images = await currentImages(own.supplierId);
  const next = (Array.isArray(urls) ? urls : []).filter((u) =>
    images.includes(u),
  );
  // Keep any images the client didn't mention, appended at the end.
  for (const u of images) if (!next.includes(u)) next.push(u);
  return writeImages(own, next);
}

// Append an already-uploaded public URL to the gallery. Ownership is derived
// from the SESSION (never a caller argument — this is a client-invocable server
// action), and the URL must point inside THIS supplier's own storage folder, so
// a forged/external URL can't be injected. The upload route calls this after
// pushing the object to storage.
export async function addProfileImageUrl(url: string): Promise<SaveResult> {
  const own = await getMyOwnership();
  if (!own) return { ok: false, error: "You do not have a linked profile." };

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const prefix = `${base}/storage/v1/object/public/supplier-images/${own.slug}/`;
  if (typeof url !== "string" || !url.startsWith(prefix)) {
    return { ok: false, error: "Invalid image reference." };
  }

  const images = await currentImages(own.supplierId);
  if (images.includes(url)) {
    const supplier = await getMySupplier();
    return supplier ? { ok: true, supplier } : { ok: false, error: GENERIC };
  }
  return writeImages(own, [...images, url].slice(0, 24));
}
