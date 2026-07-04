"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  FloppyDisk,
  WarningCircle,
  Plus,
  Trash,
  ArrowUp,
  Star,
  UploadSimple,
  CircleNotch,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import type { Supplier } from "@/lib/suppliers";
import { categories as CATEGORY_LIST } from "@/lib/content";
import { APPLY_LOCATIONS, APPLY_ALL_AREAS } from "@/lib/apply-options";
import {
  updateMyProfile,
  setPublished,
  deleteProfileImage,
  reorderProfileImages,
  type ProfilePatch,
} from "@/lib/actions/profile";

// ---------------------------------------------------------------------
// Editable form shape (camelCase, mirrors the allowlist in actions/profile.ts).
// Images + published are tracked separately (managed by their own actions).
// ---------------------------------------------------------------------
type PackageDraft = { name: string; priceLabel: string; includes: string };
type KVDraft = { a: string; b: string };

type FormState = {
  name: string;
  basedIn: string;
  servesAreas: string[];
  categories: string[];
  styleTags: string;
  shortDescription: string;
  description: string;
  bio: string;
  teamPhoto: string;
  videoUrl: string;
  priceMin: string;
  priceMax: string;
  priceTypical: string;
  currency: string;
  perServicePricing: Record<string, { min: string; max: string }>;
  pricingNotes: string;
  priceIncludesScVat: boolean;
  packages: PackageDraft[];
  availabilityNote: string;
  responseTimeNote: string;
  bookingTerms: string;
  travelFeeNote: string;
  worksWithOverseasCouples: boolean;
  establishedYear: string;
  weddingsCount: string;
  instagram: string;
  facebook: string;
  website: string;
  portfolioLink: string;
  email: string;
  phone: string;
  specs: KVDraft[]; // a = label, b = value
  faq: KVDraft[]; // a = q, b = a
};

const AREA_OPTIONS = [
  APPLY_ALL_AREAS.label,
  ...APPLY_LOCATIONS.map((l) => l.label),
];

const num = (n: number | null) => (n == null ? "" : String(n));

function seed(s: Supplier): FormState {
  const psp: Record<string, { min: string; max: string }> = {};
  for (const [k, v] of Object.entries(s.perServicePricing ?? {})) {
    psp[k] = { min: num(v?.min ?? null), max: num(v?.max ?? null) };
  }
  return {
    name: s.name ?? "",
    basedIn: s.basedIn ?? "",
    servesAreas: s.servesAreas ?? [],
    categories: s.categories ?? [],
    styleTags: (s.styleTags ?? []).join(", "),
    shortDescription: s.shortDescription ?? "",
    description: s.description ?? "",
    bio: s.bio ?? "",
    teamPhoto: s.teamPhoto ?? "",
    videoUrl: s.videoUrl ?? "",
    priceMin: num(s.priceMin),
    priceMax: num(s.priceMax),
    priceTypical: num(s.priceTypical),
    currency: s.currency ?? "PHP",
    perServicePricing: psp,
    pricingNotes: s.pricingNotes ?? "",
    priceIncludesScVat: Boolean(s.priceIncludesScVat),
    packages: (s.packages ?? []).map((p) => ({
      name: p.name ?? "",
      priceLabel: p.priceLabel ?? "",
      includes: (p.includes ?? []).join("\n"),
    })),
    availabilityNote: s.availabilityNote ?? "",
    responseTimeNote: s.responseTimeNote ?? "",
    bookingTerms: s.bookingTerms ?? "",
    travelFeeNote: s.travelFeeNote ?? "",
    worksWithOverseasCouples: Boolean(s.worksWithOverseasCouples),
    establishedYear: num(s.establishedYear),
    weddingsCount: num(s.weddingsCount),
    instagram: s.instagram ?? "",
    facebook: s.facebook ?? "",
    website: s.website ?? "",
    portfolioLink: s.portfolioLink ?? "",
    email: s.email ?? "",
    phone: s.phone ?? "",
    specs: (s.specs ?? []).map((x) => ({ a: x.label, b: x.value })),
    faq: (s.faq ?? []).map((x) => ({ a: x.q, b: x.a })),
  };
}

// Build the camelCase patch for the given field keys, converting draft shapes
// (comma/newline strings, KV drafts) into what the server action expects.
function buildPatch(form: FormState, keys: (keyof FormState)[]): ProfilePatch {
  const patch: ProfilePatch = {};
  for (const k of keys) {
    switch (k) {
      case "styleTags":
        patch.styleTags = form.styleTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        break;
      case "packages":
        patch.packages = form.packages.map((p) => ({
          name: p.name,
          priceLabel: p.priceLabel,
          includes: p.includes
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean),
        }));
        break;
      case "specs":
        patch.specs = form.specs.map((x) => ({ label: x.a, value: x.b }));
        break;
      case "faq":
        patch.faq = form.faq.map((x) => ({ q: x.a, a: x.b }));
        break;
      case "perServicePricing": {
        const out: Record<string, { min?: number; max?: number }> = {};
        for (const [svc, v] of Object.entries(form.perServicePricing)) {
          out[svc] = {
            min: v.min === "" ? undefined : Number(v.min),
            max: v.max === "" ? undefined : Number(v.max),
          };
        }
        patch.perServicePricing = out;
        break;
      }
      default:
        patch[k] = form[k];
    }
  }
  return patch;
}

const STEPS = [
  "Basics",
  "Story",
  "Photos",
  "Pricing",
  "Logistics",
  "Details",
  "Publish",
] as const;

// Which form keys each step saves.
const STEP_KEYS: Record<number, (keyof FormState)[]> = {
  0: ["name", "basedIn", "servesAreas", "categories", "styleTags", "shortDescription"],
  1: ["description", "bio", "teamPhoto", "videoUrl"],
  3: [
    "priceMin",
    "priceMax",
    "priceTypical",
    "currency",
    "perServicePricing",
    "pricingNotes",
    "priceIncludesScVat",
    "packages",
  ],
  4: [
    "availabilityNote",
    "responseTimeNote",
    "bookingTerms",
    "travelFeeNote",
    "worksWithOverseasCouples",
    "establishedYear",
    "weddingsCount",
    "instagram",
    "facebook",
    "website",
    "portfolioLink",
    "email",
    "phone",
  ],
  5: ["specs", "faq"],
};

// ---- shared styles (match apply-form.tsx) ---------------------------
const inputClass =
  "theme-light w-full rounded-xl border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {hint && <span className="ml-1 font-normal text-muted/70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function ProfileWizard({ supplier }: { supplier: Supplier }) {
  const [form, setForm] = useState<FormState>(() => seed(supplier));
  const [images, setImages] = useState<string[]>(supplier.images ?? []);
  const [published, setPublishedState] = useState<boolean>(supplier.published);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedStep, setSavedStep] = useState<number | null>(null);
  const [error, setError] = useState("");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedStep(null);
  }

  async function saveStep() {
    const keys = STEP_KEYS[step];
    if (!keys) return;
    setSaving(true);
    setError("");
    const result = await updateMyProfile(buildPatch(form, keys));
    setSaving(false);
    if (result.ok) setSavedStep(step);
    else setError(result.error);
  }

  function toggleArrayValue(key: "servesAreas" | "categories", value: string) {
    setForm((f) => {
      const cur = f[key];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...f, [key]: next };
    });
    setSavedStep(null);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
          {form.name || "Your profile"}
        </h1>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>
            {published ? "Live" : "Not published yet"} · /suppliers/
            {supplier.slug}
          </span>
          {supplier.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent-fg">
              <Check size={11} weight="bold" /> Verified
            </span>
          )}
        </p>
      </div>

      {/* Step nav */}
      <nav className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStep(i);
              setError("");
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              step === i
                ? "bg-accent text-accent-ink"
                : "border border-line bg-surface-2 text-muted hover:text-ink"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </nav>

      <div className="rounded-2xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8">
        {step === 0 && (
          <div className="grid gap-5">
            <Field label="Business name">
              <input
                className={inputClass}
                value={form.name}
                maxLength={200}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Based in">
              <input
                className={inputClass}
                value={form.basedIn}
                maxLength={120}
                placeholder="e.g. Cebu City"
                onChange={(e) => set("basedIn", e.target.value)}
              />
            </Field>
            <div>
              <span className={labelClass}>Categories</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_LIST.map((c) => {
                  const on = form.categories.includes(c.slug);
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => toggleArrayValue("categories", c.slug)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        on
                          ? "bg-accent text-accent-ink"
                          : "border border-line bg-surface-2 text-muted hover:text-ink"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className={labelClass}>Areas served</span>
              <div className="flex flex-wrap gap-2">
                {AREA_OPTIONS.map((a) => {
                  const on = form.servesAreas.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleArrayValue("servesAreas", a)}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                        on
                          ? "bg-accent text-accent-ink"
                          : "border border-line bg-surface-2 text-muted hover:text-ink"
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
            <Field label="Style tags" hint="(comma separated)">
              <input
                className={inputClass}
                value={form.styleTags}
                placeholder="e.g. documentary, editorial, film"
                onChange={(e) => set("styleTags", e.target.value)}
              />
            </Field>
            <Field label="Short description" hint="(card blurb)">
              <textarea
                className={`${inputClass} min-h-20`}
                value={form.shortDescription}
                maxLength={280}
                onChange={(e) => set("shortDescription", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5">
            <Field label="About" hint="(the main story couples read)">
              <textarea
                className={`${inputClass} min-h-40`}
                value={form.description}
                maxLength={6000}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label="Personal intro / bio" hint="(optional)">
              <textarea
                className={`${inputClass} min-h-28`}
                value={form.bio}
                maxLength={2000}
                onChange={(e) => set("bio", e.target.value)}
              />
            </Field>
            <Field label="Team photo URL" hint="(optional)">
              <input
                className={inputClass}
                value={form.teamPhoto}
                onChange={(e) => set("teamPhoto", e.target.value)}
                placeholder="Paste an uploaded image URL"
              />
            </Field>
            <Field label="Video URL" hint="(YouTube or Vimeo, optional)">
              <input
                className={inputClass}
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <PhotosStep
            images={images}
            slug={supplier.slug}
            onImages={setImages}
            onError={setError}
          />
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price from">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.priceMin}
                  onChange={(e) => set("priceMin", e.target.value)}
                />
              </Field>
              <Field label="Price to">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.priceMax}
                  onChange={(e) => set("priceMax", e.target.value)}
                />
              </Field>
              <Field label="Typical spend">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.priceTypical}
                  onChange={(e) => set("priceTypical", e.target.value)}
                />
              </Field>
            </div>
            {form.categories.length > 1 && (
              <div>
                <span className={labelClass}>Per-service pricing</span>
                <div className="grid gap-2">
                  {form.categories.map((slug) => {
                    const cat = CATEGORY_LIST.find((c) => c.slug === slug);
                    const v = form.perServicePricing[slug] ?? { min: "", max: "" };
                    return (
                      <div
                        key={slug}
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-2"
                      >
                        <span className="text-sm text-ink">
                          {cat?.label ?? slug}
                        </span>
                        <input
                          className={`${inputClass} w-28`}
                          placeholder="min"
                          inputMode="numeric"
                          value={v.min}
                          onChange={(e) =>
                            set("perServicePricing", {
                              ...form.perServicePricing,
                              [slug]: { ...v, min: e.target.value },
                            })
                          }
                        />
                        <input
                          className={`${inputClass} w-28`}
                          placeholder="max"
                          inputMode="numeric"
                          value={v.max}
                          onChange={(e) =>
                            set("perServicePricing", {
                              ...form.perServicePricing,
                              [slug]: { ...v, max: e.target.value },
                            })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <Field label="Pricing notes" hint="(what's included)">
              <textarea
                className={`${inputClass} min-h-24`}
                value={form.pricingNotes}
                maxLength={2000}
                onChange={(e) => set("pricingNotes", e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.priceIncludesScVat}
                onChange={(e) => set("priceIncludesScVat", e.target.checked)}
                className="h-5 w-5 rounded border-line accent-[#faf6f0]"
              />
              <span className="text-sm text-ink">
                Rates already include service charge + VAT
              </span>
            </label>

            {/* Packages */}
            <div>
              <span className={labelClass}>Packages</span>
              <div className="grid gap-4">
                {form.packages.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-line bg-surface-2 p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        placeholder="Package name"
                        value={p.name}
                        onChange={(e) => {
                          const next = [...form.packages];
                          next[i] = { ...p, name: e.target.value };
                          set("packages", next);
                        }}
                      />
                      <input
                        className={inputClass}
                        placeholder="Price label (e.g. from ₱48,000)"
                        value={p.priceLabel}
                        onChange={(e) => {
                          const next = [...form.packages];
                          next[i] = { ...p, priceLabel: e.target.value };
                          set("packages", next);
                        }}
                      />
                    </div>
                    <textarea
                      className={`${inputClass} mt-3 min-h-24`}
                      placeholder="What's included (one item per line)"
                      value={p.includes}
                      onChange={(e) => {
                        const next = [...form.packages];
                        next[i] = { ...p, includes: e.target.value };
                        set("packages", next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "packages",
                          form.packages.filter((_, j) => j !== i),
                        )
                      }
                      className="mt-2 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-rose-200"
                    >
                      <Trash size={13} /> Remove package
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    set("packages", [
                      ...form.packages,
                      { name: "", priceLabel: "", includes: "" },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
                >
                  <Plus size={14} weight="bold" /> Add package
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Availability note">
                <input
                  className={inputClass}
                  value={form.availabilityNote}
                  placeholder="Now booking 2026-2027"
                  onChange={(e) => set("availabilityNote", e.target.value)}
                />
              </Field>
              <Field label="Response time note">
                <input
                  className={inputClass}
                  value={form.responseTimeNote}
                  placeholder="Usually replies within a day"
                  onChange={(e) => set("responseTimeNote", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Booking terms">
              <input
                className={inputClass}
                value={form.bookingTerms}
                placeholder="30% downpayment, GCash or bank transfer"
                onChange={(e) => set("bookingTerms", e.target.value)}
              />
            </Field>
            <Field label="Travel fee note">
              <input
                className={inputClass}
                value={form.travelFeeNote}
                onChange={(e) => set("travelFeeNote", e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.worksWithOverseasCouples}
                onChange={(e) =>
                  set("worksWithOverseasCouples", e.target.checked)
                }
                className="h-5 w-5 rounded border-line accent-[#faf6f0]"
              />
              <span className="text-sm text-ink">
                Works with couples planning from abroad
              </span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Established year">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.establishedYear}
                  onChange={(e) => set("establishedYear", e.target.value)}
                />
              </Field>
              <Field label="Weddings worked (approx.)">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.weddingsCount}
                  onChange={(e) => set("weddingsCount", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Instagram">
                <input
                  className={inputClass}
                  value={form.instagram}
                  placeholder="yourstudio"
                  onChange={(e) => set("instagram", e.target.value)}
                />
              </Field>
              <Field label="Facebook">
                <input
                  className={inputClass}
                  value={form.facebook}
                  onChange={(e) => set("facebook", e.target.value)}
                />
              </Field>
              <Field label="Website">
                <input
                  className={inputClass}
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />
              </Field>
              <Field label="Portfolio link">
                <input
                  className={inputClass}
                  value={form.portfolioLink}
                  onChange={(e) => set("portfolioLink", e.target.value)}
                />
              </Field>
              <Field label="Contact email" hint="(shown publicly)">
                <input
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-8">
            <KVEditor
              label="Specs"
              aPlaceholder="Label (e.g. Coverage)"
              bPlaceholder="Value (e.g. 8 hours)"
              rows={form.specs}
              onChange={(rows) => set("specs", rows)}
            />
            <KVEditor
              label="FAQ"
              aPlaceholder="Question"
              bPlaceholder="Answer"
              multiline
              rows={form.faq}
              onChange={(rows) => set("faq", rows)}
            />
          </div>
        )}

        {step === 6 && (
          <PublishStep
            slug={supplier.slug}
            published={published}
            imageCount={images.length}
            hasDescription={form.description.trim().length > 0}
            onError={setError}
            onPublished={setPublishedState}
          />
        )}

        {/* Save bar (all steps except Photos and Publish, which self-save) */}
        {step !== 2 && step !== 6 && (
          <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
            <button
              type="button"
              onClick={saveStep}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <FloppyDisk size={16} weight="fill" />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
            {savedStep === step && (
              <span className="inline-flex items-center gap-1.5 text-sm text-accent-fg">
                <Check size={15} weight="bold" /> Saved
              </span>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 inline-flex items-start gap-1.5 text-sm text-rose-200"
          >
            <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Photos step — upload / cover / reorder / delete against Supabase Storage.
// ---------------------------------------------------------------------
function PhotosStep({
  images,
  slug,
  onImages,
  onError,
}: {
  images: string[];
  slug: string;
  onImages: (imgs: string[]) => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    onError("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/profile/upload", {
          method: "POST",
          body: fd,
        });
        const json = await res.json();
        if (res.ok) onImages(json.images as string[]);
        else onError(json.error ?? "Upload failed.");
      } catch {
        onError("Upload failed.");
      }
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function reorder(next: string[]) {
    const prev = images;
    onImages(next); // optimistic
    const result = await reorderProfileImages(next);
    if (!result.ok) {
      onImages(prev);
      onError(result.error);
    }
  }

  async function remove(url: string) {
    const prev = images;
    onImages(images.filter((u) => u !== url));
    const result = await deleteProfileImage(url);
    if (!result.ok) {
      onImages(prev);
      onError(result.error);
    }
  }

  function makeCover(i: number) {
    if (i === 0) return;
    const next = [...images];
    const [pick] = next.splice(i, 1);
    next.unshift(pick);
    reorder(next);
  }

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        The first photo is your cover. Upload JPEG, PNG or WebP up to 8 MB.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => upload(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? (
          <CircleNotch size={16} className="animate-spin" />
        ) : (
          <UploadSimple size={16} weight="bold" />
        )}
        {busy ? "Uploading..." : "Upload photos"}
      </button>

      {images.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, i) => (
            <li
              key={url}
              className="group relative overflow-hidden rounded-xl border border-line bg-surface-2"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              {i === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-ink">
                  <Star size={10} weight="fill" /> Cover
                </span>
              )}
              <div className="flex items-center justify-end gap-1 p-2">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    title="Make cover"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
                  >
                    <ArrowUp size={15} weight="bold" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  title="Remove"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-rose-200"
                >
                  <Trash size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-line px-6 py-10 text-center text-sm text-muted">
          No photos yet. Your gallery is what couples look at first.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Generic label/value (or Q/A) repeatable editor.
// ---------------------------------------------------------------------
function KVEditor({
  label,
  aPlaceholder,
  bPlaceholder,
  rows,
  onChange,
  multiline,
}: {
  label: string;
  aPlaceholder: string;
  bPlaceholder: string;
  rows: KVDraft[];
  onChange: (rows: KVDraft[]) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="grid gap-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="rounded-xl border border-line bg-surface-2 p-4"
          >
            <input
              className={inputClass}
              placeholder={aPlaceholder}
              value={row.a}
              onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, a: e.target.value };
                onChange(next);
              }}
            />
            {multiline ? (
              <textarea
                className={`${inputClass} mt-3 min-h-20`}
                placeholder={bPlaceholder}
                value={row.b}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...row, b: e.target.value };
                  onChange(next);
                }}
              />
            ) : (
              <input
                className={`${inputClass} mt-3`}
                placeholder={bPlaceholder}
                value={row.b}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...row, b: e.target.value };
                  onChange(next);
                }}
              />
            )}
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-rose-200"
            >
              <Trash size={13} /> Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...rows, { a: "", b: "" }])}
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <Plus size={14} weight="bold" /> Add {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Publish step.
// ---------------------------------------------------------------------
function PublishStep({
  slug,
  published,
  imageCount,
  hasDescription,
  onError,
  onPublished,
}: {
  slug: string;
  published: boolean;
  imageCount: number;
  hasDescription: boolean;
  onError: (msg: string) => void;
  onPublished: (v: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function toggle(next: boolean) {
    setBusy(true);
    onError("");
    const result = await setPublished(next);
    setBusy(false);
    if (result.ok) onPublished(next);
    else onError(result.error);
  }

  const checklist = [
    { ok: imageCount > 0, label: "At least one photo uploaded" },
    { ok: hasDescription, label: "An About / story written" },
  ];

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-serif text-2xl font-medium text-ink">
          {published ? "Your profile is live" : "Ready to go live?"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {published
            ? "Couples can find and contact you. You can unpublish any time."
            : "Publishing makes your profile visible to couples. Changes you save are live immediately."}
        </p>
      </div>

      <ul className="grid gap-2">
        {checklist.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-sm">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                c.ok
                  ? "bg-accent/15 text-accent-fg"
                  : "border border-line text-muted"
              }`}
            >
              {c.ok && <Check size={12} weight="bold" />}
            </span>
            <span className={c.ok ? "text-ink" : "text-muted"}>{c.label}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => toggle(!published)}
          disabled={busy}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-colors active:scale-[0.98] disabled:opacity-60 ${
            published
              ? "border border-line bg-surface-2 text-ink hover:text-ink"
              : "bg-accent text-accent-ink hover:bg-accent-hover"
          }`}
        >
          {busy && <CircleNotch size={16} className="animate-spin" />}
          {published ? "Unpublish" : "Publish my profile"}
        </button>
        {published && (
          <Link
            href={`/suppliers/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-accent-fg underline underline-offset-2 transition-colors hover:text-ink"
          >
            View public profile <ArrowSquareOut size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
