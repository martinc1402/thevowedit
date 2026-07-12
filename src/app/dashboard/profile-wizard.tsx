"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  FloppyDisk,
  WarningCircle,
  Plus,
  Trash,
  ArrowLeft,
  ArrowRight,
  Star,
  UserCircle,
  UploadSimple,
  CircleNotch,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import type { Supplier } from "@/lib/suppliers";
import { categories as CATEGORY_LIST } from "@/lib/content";
import { inclusionsFor } from "@/lib/package-inclusions";
import { styleTagsFor } from "@/lib/style-tags-vocab";
import { hasEntourageRate } from "@/lib/category-fields";
import {
  essentialsToDraft,
  draftToEssentials,
  type EssentialsDraft,
} from "@/lib/essentials-form";
import {
  updateMyProfile,
  setPublished,
  deleteProfileImage,
  reorderProfileImages,
  type ProfilePatch,
} from "@/lib/actions/profile";
import {
  inputClass,
  labelClass,
  Field,
  Select,
  ChipGroup,
} from "./form-ui";
import { normalizePhonePH } from "@/lib/contact-normalize";
import { servicesFor } from "@/lib/services-vocab";
import { EssentialsStep } from "./essentials-step";
import { StepPreview } from "./wizard-preview";

// ---------------------------------------------------------------------
// Editable form shape (camelCase, mirrors the allowlist in actions/profile.ts).
// Images + published are tracked separately (managed by their own actions).
// ---------------------------------------------------------------------
type PackageDraft = {
  name: string;
  priceMode: "from" | "enquiry";
  priceAmount: string;
  includes: string[];
};

// Parse a stored package price label back into the structured editor state.
function parsePriceLabel(label: string): {
  priceMode: "from" | "enquiry";
  priceAmount: string;
} {
  const m = /from[^\d]*([\d,]+)/i.exec(label ?? "");
  return m
    ? { priceMode: "from", priceAmount: m[1].replace(/,/g, "") }
    : { priceMode: "enquiry", priceAmount: "" };
}
// Build the display label the public page shows from the structured state.
function priceLabelFrom(p: PackageDraft): string {
  const n = Number(p.priceAmount);
  return p.priceMode === "from" && p.priceAmount.trim() && Number.isFinite(n) && n > 0
    ? `From ₱${new Intl.NumberFormat("en-PH").format(n)}`
    : "Price on enquiry";
}
type KVDraft = { a: string; b: string };

type FormState = {
  name: string;
  categories: string[];
  styleTags: string[]; // locked vocab keys (style-tags-vocab.ts), not free text
  shortDescription: string;
  description: string;
  bio: string;
  teamPhoto: string;
  videoUrl: string;
  establishedYear: string;
  weddingsCount: string;
  priceMin: string;
  priceMax: string;
  priceTypical: string;
  entourageRateMin: string;
  entourageRateMax: string;
  currency: string;
  priceUnit: string;
  pricingNotes: string;
  services: string[];
  packages: PackageDraft[];
  essentials: EssentialsDraft;
  instagram: string;
  facebook: string;
  website: string;
  email: string;
  phone: string;
  viber: string;
  whatsapp: string;
  preferredChannel: string;
  faq: KVDraft[]; // a = q, b = a
};

// Select options for pricing unit + preferred contact channel (labels tuned for
// a dropdown; the row/display labels live in the taxonomy).
// Keep in sync with the server cap in actions/profile.ts (enumArray(..., 6)).
const MAX_STYLE_TAGS = 6;

const PRICE_UNIT_OPTS = [
  { value: "per_event", label: "Per event / package" },
  { value: "per_head", label: "Per head" },
  { value: "per_hour", label: "Per hour" },
];
const CHANNEL_LABELS: Record<string, string> = {
  instagram: "Instagram DM",
  messenger: "Facebook Messenger",
  whatsapp: "WhatsApp",
  viber: "Viber",
  phone: "Phone / SMS",
  email: "Email",
};

// Preferred-channel options limited to the channels the vendor has actually
// filled in (so they can't feature a blank channel).
function availableChannels(form: FormState) {
  const out: { value: string; label: string }[] = [];
  const push = (filled: string, key: string) => {
    if (filled.trim()) out.push({ value: key, label: CHANNEL_LABELS[key] });
  };
  push(form.instagram, "instagram");
  push(form.facebook, "messenger");
  push(form.whatsapp, "whatsapp");
  push(form.viber, "viber");
  push(form.phone, "phone");
  push(form.email, "email");
  return out;
}

const num = (n: number | null) => (n == null ? "" : String(n));

function seed(s: Supplier): FormState {
  // Approval-required fields seed from the vendor's PENDING draft when present
  // (so they keep editing what's under review), else from the live value.
  const p = s.pendingChanges;
  const essentialsSeed = essentialsToDraft(
    s.essentials,
    s.categories[0] ?? null,
  );
  if (p?.essentials_custom) {
    essentialsSeed.customEssentials = p.essentials_custom.map((c) => ({
      label: c.label,
      value: c.value,
    }));
  }
  return {
    name: p?.name ?? s.name ?? "",
    categories: s.categories ?? [],
    styleTags: s.styleTags ?? [],
    shortDescription: p?.short_description ?? s.shortDescription ?? "",
    description: p?.description ?? s.description ?? "",
    bio: p?.bio ?? s.bio ?? "",
    teamPhoto: p?.team_photo ?? s.teamPhoto ?? "",
    videoUrl: p?.video_url ?? s.videoUrl ?? "",
    establishedYear: num(s.establishedYear),
    weddingsCount: num(s.weddingsCount),
    priceMin: num(s.priceMin),
    priceMax: num(s.priceMax),
    priceTypical: num(s.priceTypical),
    entourageRateMin: num(s.entourageRateMin),
    entourageRateMax: num(s.entourageRateMax),
    currency: s.currency ?? "PHP",
    // `||` not `??`: an empty string must fall back too. The select has no empty
    // option, so an unset unit would otherwise DISPLAY "Per event / package" while
    // the form state stayed "" — showing one thing and storing another.
    priceUnit: s.priceUnit || "per_event",
    pricingNotes: s.pricingNotes ?? "",
    services: s.services ?? [],
    packages: (s.packages ?? []).map((p) => ({
      name: p.name ?? "",
      ...parsePriceLabel(p.priceLabel ?? ""),
      includes: [...(p.includes ?? [])],
    })),
    essentials: essentialsSeed,
    instagram: s.instagram ?? "",
    facebook: s.facebook ?? "",
    website: s.website ?? "",
    email: s.email ?? "",
    phone: s.phone ?? "",
    viber: s.viber ?? "",
    whatsapp: s.whatsapp ?? "",
    preferredChannel: s.preferredChannel ?? "",
    faq: (p?.faq ?? s.faq ?? []).map((x) => ({ a: x.q, b: x.a })),
  };
}

// Which live approval-required fields currently have a pending draft awaiting
// review — drives the "in review" labelling in the wizard.
function pendingFields(s: Supplier): Set<string> {
  const p = s.pendingChanges;
  if (!p) return new Set();
  const keys: Record<string, keyof NonNullable<Supplier["pendingChanges"]>> = {
    name: "name",
    shortDescription: "short_description",
    description: "description",
    bio: "bio",
    teamPhoto: "team_photo",
    videoUrl: "video_url",
    faq: "faq",
    images: "images",
    customEssentials: "essentials_custom",
  };
  const out = new Set<string>();
  for (const [form, col] of Object.entries(keys)) {
    if (p[col] !== undefined) out.add(form);
  }
  return out;
}

// Build the camelCase patch for the given field keys, converting draft shapes
// (comma/newline strings, KV drafts) into what the server action expects.
function buildPatch(form: FormState, keys: (keyof FormState)[]): ProfilePatch {
  const patch: ProfilePatch = {};
  for (const k of keys) {
    switch (k) {
      case "styleTags":
        // Already an array of vocab keys — no conversion needed. But OMIT it
        // entirely for a category with no vocabulary: such a vendor's form still
        // holds their legacy free-text tags, and sending them would have the enum
        // coercer drop every one, silently wiping a field they never even saw.
        if (styleTagsFor(form.categories[0] ?? null).length > 0) {
          patch.styleTags = form.styleTags;
        }
        break;
      case "packages":
        patch.packages = form.packages.map((p) => ({
          name: p.name,
          priceLabel: priceLabelFrom(p),
          includes: p.includes,
        }));
        break;
      case "essentials":
        patch.essentials = draftToEssentials(
          form.essentials,
          form.categories[0] ?? null,
        );
        break;
      case "faq":
        patch.faq = form.faq.map((x) => ({ q: x.a, a: x.b }));
        break;
      default:
        patch[k] = form[k];
    }
  }
  return patch;
}

// Steps mirror the public profile sections. (5 = Publish self-saves.)
const STEPS = [
  "Contact",
  "The essentials",
  "Services & packages",
  "About & photos",
  "In their words",
  "Review & submit",
] as const;
const PUBLISH_STEP = 5;

// Steps whose fields are reviewed by an admin before going live (approval tier).
const APPROVAL_STEPS = new Set([3, 4]);
// Steps whose fields publish immediately on save (all public).
const IMMEDIATE_STEPS = new Set([0, 1, 2]);

// Approval-tier form fields that live on each step (drives the "in review" pill).
const STEP_PENDING_FIELDS: Record<number, string[]> = {
  1: ["customEssentials"],
  3: ["name", "shortDescription", "description", "bio", "teamPhoto", "images"],
  4: ["faq"],
};

// Which form keys each step saves. (Publish self-saves; About & photos also
// self-saves its gallery via PhotosStep, but saves its text fields here.)
const STEP_KEYS: Record<number, (keyof FormState)[]> = {
  0: [
    "instagram",
    "facebook",
    "website",
    "email",
    "phone",
    "viber",
    "whatsapp",
    "preferredChannel",
  ],
  1: [
    "styleTags",
    "establishedYear",
    "weddingsCount",
    "priceMin",
    "priceMax",
    "priceTypical",
    "entourageRateMin",
    "entourageRateMax",
    "currency",
    "priceUnit",
    "essentials",
  ],
  2: ["services", "packages", "pricingNotes"],
  3: [
    "name",
    "categories",
    "shortDescription",
    "description",
    "bio",
    "teamPhoto",
    "videoUrl",
  ],
  4: ["faq"],
};

export function ProfileWizard({
  supplier,
  isAdmin = false,
}: {
  supplier: Supplier;
  isAdmin?: boolean;
}) {
  const [form, setForm] = useState<FormState>(() => seed(supplier));
  // Vendors edit a draft gallery (pending); admins edit the live gallery.
  const [images, setImages] = useState<string[]>(
    supplier.pendingChanges?.images ?? supplier.images ?? [],
  );
  const [published, setPublishedState] = useState<boolean>(supplier.published);
  const [pending, setPending] = useState<Set<string>>(() =>
    pendingFields(supplier),
  );
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedStep, setSavedStep] = useState<number | null>(null);
  const [error, setError] = useState("");
  // Dirty-state guard: baseline = last-saved form; dirty = unsaved edits on this
  // step. navTo holds a step the user tried to leave to while dirty (opens a modal).
  const [dirty, setDirty] = useState(false);
  const baselineRef = useRef<FormState>(form);
  const [navTo, setNavTo] = useState<number | null>(null);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  // "Same as phone" for Viber/WhatsApp — pre-checked when the stored value already
  // matches the phone. While checked, the field mirrors the phone value live.
  const [phoneSync, setPhoneSync] = useState<{
    viber: boolean;
    whatsapp: boolean;
  }>(() => ({
    viber: !!supplier.viber && supplier.viber === supplier.phone,
    whatsapp: !!supplier.whatsapp && supplier.whatsapp === supplier.phone,
  }));

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedStep(null);
    setDirty(true);
  }

  // Adopt what the server ACTUALLY stored. It normalizes hard (0917 123 4567 ->
  // +639171234567, an Instagram URL -> a bare handle) and truncates to the column
  // caps, and none of that used to come back — the vendor kept staring at raw text
  // that no longer matched their row. Safe to re-seed the whole form here because
  // the nav guard means only the step being saved can hold unsaved edits.
  function absorb(next: Supplier) {
    const fresh = seed(next);
    setForm(fresh);
    baselineRef.current = fresh;
    setImages(next.pendingChanges?.images ?? next.images ?? []);
    setPending(pendingFields(next));
    setDirty(false);
  }

  // Narrower version for the self-saving photo/portrait controls: they live on the
  // same step as free-text fields, so a full re-seed would wipe unsaved typing.
  function absorbImages(next: Supplier) {
    setImages(next.pendingChanges?.images ?? next.images ?? []);
    setPending(pendingFields(next));
  }

  // Phone edits also flow into any channel synced to it.
  function setPhone(v: string) {
    set("phone", v);
    if (phoneSync.viber) set("viber", v);
    if (phoneSync.whatsapp) set("whatsapp", v);
  }
  function togglePhoneSync(key: "viber" | "whatsapp", checked: boolean) {
    setPhoneSync((s) => ({ ...s, [key]: checked }));
    if (checked) set(key, form.phone);
  }

  async function saveStep(): Promise<boolean> {
    const keys = STEP_KEYS[step];
    if (!keys) return true;
    if (step === 0) {
      const badPhone = [form.phone, form.viber, form.whatsapp].some(
        (v) => v.trim() !== "" && !normalizePhonePH(v).ok,
      );
      if (badPhone) {
        setError("Please fix the phone numbers before saving.");
        return false;
      }
    }
    setSaving(true);
    setError("");
    const result = await updateMyProfile(buildPatch(form, keys));
    setSaving(false);
    if (result.ok) {
      absorb(result.supplier); // show what was stored, not what was typed
      setSavedStep(step);
      return true;
    }
    setError(result.error);
    return false;
  }

  // Switch steps, guarding unsaved edits with a Save/Discard/Cancel modal.
  function goToStep(i: number) {
    if (i === step) return;
    if (dirty) {
      setNavTo(i);
      return;
    }
    doSwitch(i);
  }
  function doSwitch(i: number) {
    setStep(i);
    setError("");
    setVisited((v) => new Set(v).add(i));
  }

  // Warn on full navigation away (reload / close) with unsaved edits.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Never keep featuring a channel the vendor just cleared: the select would render
  // blank while still saving the old value (e.g. "messenger" with no Facebook handle).
  useEffect(() => {
    if (!form.preferredChannel) return;
    const stillThere = availableChannels(form).some(
      (c) => c.value === form.preferredChannel,
    );
    if (!stillThere) setForm((f) => ({ ...f, preferredChannel: "" }));
  }, [form]);

  function toggleCategory(value: string) {
    setDirty(true);
    setForm((f) => {
      const cur = f.categories;
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...f, categories: next };
    });
    setSavedStep(null);
  }

  // Signature-style chips, from the locked vocab for this vendor's category.
  const styleTagOptions = styleTagsFor(form.categories[0] ?? null);

  // Toggling past the cap is a no-op rather than a silent truncation: the server
  // would slice the tail off, so the vendor must see which ones actually stuck.
  function toggleStyleTag(value: string) {
    setDirty(true);
    setForm((f) => {
      const cur = f.styleTags;
      if (cur.includes(value)) {
        return { ...f, styleTags: cur.filter((v) => v !== value) };
      }
      if (cur.length >= MAX_STYLE_TAGS) return f;
      return { ...f, styleTags: [...cur, value] };
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
            {published ? "Live" : "Not published yet"} · /vendors/
            {supplier.slug}
          </span>
          {supplier.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent-fg">
              <Check size={11} weight="bold" /> Verified
            </span>
          )}
        </p>
      </div>

      {/* Step nav — current (maroon fill) · visited (outline + check) · unvisited */}
      <nav className="mb-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => {
          const hasPending =
            !isAdmin &&
            (STEP_PENDING_FIELDS[i] ?? []).some((f) => pending.has(f));
          const isCurrent = step === i;
          const isVisited = visited.has(i) && !isCurrent;
          return (
            <button
              key={s}
              type="button"
              onClick={() => goToStep(i)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isCurrent
                  ? "bg-accent text-accent-ink"
                  : "border border-line text-muted hover:text-ink"
              }`}
            >
              {isVisited && (
                <Check size={12} weight="bold" className="text-accent-fg" />
              )}
              {i + 1}. {s}
              {hasPending && (
                <span
                  title="Changes awaiting review"
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    isCurrent ? "bg-accent-ink" : "bg-accent-fg"
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8">
        {APPROVAL_STEPS.has(step) && !isAdmin && (
          <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm leading-relaxed text-muted">
            <span className="font-medium text-ink">
              Reviewed before it goes live.
            </span>{" "}
            Changes on this step are checked by The Vow Edit before couples see
            them. You&rsquo;ll keep seeing your edits here while they&rsquo;re in
            review.
          </div>
        )}
        {IMMEDIATE_STEPS.has(step) && (
          <p className="mb-6 text-sm text-muted">
            Everything on this step is public and goes live the moment you save.
          </p>
        )}
        {step === 0 && (
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Instagram"
                help="Handle or profile URL — either works, we'll tidy it."
              >
                <input
                  className={inputClass}
                  value={form.instagram}
                  placeholder="@yourhandle or profile URL"
                  onChange={(e) => set("instagram", e.target.value)}
                />
              </Field>
              <Field
                label="Facebook"
                help="Your Facebook Page username — the part after facebook.com/. Must be a Page (not a personal profile) for the Messenger button to work."
              >
                <input
                  className={inputClass}
                  value={form.facebook}
                  placeholder="@yourhandle or profile URL"
                  onChange={(e) => set("facebook", e.target.value)}
                />
              </Field>
              <Field label="Website" help="Full address, e.g. https://yoursite.ph">
                <input
                  className={inputClass}
                  value={form.website}
                  placeholder="yourstudio.com"
                  onChange={(e) => set("website", e.target.value)}
                />
              </Field>
              <Field label="Contact email">
                <input
                  className={inputClass}
                  value={form.email}
                  placeholder="hello@yourstudio.com"
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <PhoneField
                label="Phone"
                value={form.phone}
                onChange={setPhone}
                reserveSameAs
              />
              <PhoneField
                label="Viber"
                hint="(optional)"
                value={phoneSync.viber ? form.phone : form.viber}
                disabled={phoneSync.viber}
                sameAs={{
                  checked: phoneSync.viber,
                  onToggle: (b) => togglePhoneSync("viber", b),
                }}
                onChange={(v) => set("viber", v)}
              />
              <PhoneField
                label="WhatsApp"
                hint="(optional)"
                value={phoneSync.whatsapp ? form.phone : form.whatsapp}
                disabled={phoneSync.whatsapp}
                sameAs={{
                  checked: phoneSync.whatsapp,
                  onToggle: (b) => togglePhoneSync("whatsapp", b),
                }}
                onChange={(v) => set("whatsapp", v)}
              />
            </div>
            <div className="sm:max-w-sm">
              <Field label="Preferred contact channel">
                <Select
                  value={form.preferredChannel}
                  onChange={(v) => set("preferredChannel", v)}
                  options={availableChannels(form)}
                  placeholder="No preference — we'll feature Instagram first (or your first available)"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-8">
            <div className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Price from"
                  help="Your starting rate for the bride — you can refine details in Packages."
                >
                  <PesoInput
                    value={form.priceMin}
                    onChange={(v) => set("priceMin", v)}
                  />
                </Field>
                <Field label="Price to" hint="(optional)">
                  <PesoInput
                    value={form.priceMax}
                    onChange={(v) => set("priceMax", v)}
                  />
                </Field>
                <Field label="Typical spend" hint="(optional)">
                  <PesoInput
                    value={form.priceTypical}
                    onChange={(v) => set("priceTypical", v)}
                  />
                </Field>
              </div>
              <div className="sm:max-w-xs">
                <Field label="Price unit" hint="(how the price reads)">
                  {/* No placeholder: an empty option would read "Per event /
                      package" too (per_event renders with no suffix), so it
                      duplicated the first real option and meant the same thing. */}
                  <Select
                    value={form.priceUnit}
                    onChange={(v) => set("priceUnit", v)}
                    options={PRICE_UNIT_OPTS}
                  />
                </Field>
              </div>
              {/* The entourage rate, the number couples actually budget on. The
                  bride rate alone hides most of the bill: charged per face, and a
                  Filipino entourage (ninang, mothers, bridesmaids) can add more
                  than the bride's own fee.
                  Gated: it is a PER-FACE makeup rate, so a photographer must not be
                  asked for it (this block used to render for every category). */}
              {hasEntourageRate(form.categories[0] ?? null) && (
              <div className="border-t border-line pt-8">
                <span className={labelClass}>
                  Entourage rate{" "}
                  <span className="font-normal text-muted">
                    (per extra face: mothers, ninang, bridesmaids)
                  </span>
                </span>
                <div className="mt-2 grid gap-4 sm:max-w-md sm:grid-cols-2">
                  <Field label="From" hint="(per face)">
                    <PesoInput
                      value={form.entourageRateMin}
                      onChange={(v) => set("entourageRateMin", v)}
                    />
                  </Field>
                  <Field label="Up to" hint="(optional)">
                    <PesoInput
                      value={form.entourageRateMax}
                      onChange={(v) => set("entourageRateMax", v)}
                    />
                  </Field>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Couples compare on this. Leave blank only if you genuinely quote
                  the entourage case by case.
                </p>
              </div>
              )}
            </div>

            <div className="border-t border-line pt-8">
              <EssentialsStep
                draft={form.essentials}
                category={form.categories[0] ?? null}
                onPatch={(patch) =>
                  set("essentials", { ...form.essentials, ...patch })
                }
              />
            </div>

            {/* "Based in" removed: it duplicated `location` (which is what the
                profile actually renders) and the two could silently drift. */}
            {/* Style tags apply only to categories with a vocabulary (today: makeup).
                For anyone else the section is absent, not empty — the concept does
                not exist for them yet. */}
            {styleTagOptions.length > 0 && (
              <div className="border-t border-line pt-8">
                <span className={labelClass}>
                  Signature style{" "}
                  <span className="font-normal text-muted">
                    (up to {MAX_STYLE_TAGS}, shown under your story)
                  </span>
                </span>
                <ChipGroup
                  options={styleTagOptions.map((t) => ({
                    value: t.key,
                    label: t.label,
                  }))}
                  selected={form.styleTags}
                  onToggle={toggleStyleTag}
                />
                <p className="mt-2 text-xs text-muted">
                  Your finish, technique and skin specialties are set above. These
                  are the words for your aesthetic.
                </p>
              </div>
            )}

            <div className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
              <Field label="Established year" hint="(optional)">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.establishedYear}
                  onChange={(e) => set("establishedYear", e.target.value)}
                />
              </Field>
              <Field label="Weddings worked" hint="(approx., optional)">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={form.weddingsCount}
                  onChange={(e) => set("weddingsCount", e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <div>
              <span className={labelClass}>Services offered</span>
              <ChipGroup
                options={servicesFor(form.categories[0] ?? null).map((s) => ({
                  value: s.key,
                  label: s.label,
                }))}
                selected={form.services}
                onToggle={(v) =>
                  set(
                    "services",
                    form.services.includes(v)
                      ? form.services.filter((x) => x !== v)
                      : [...form.services, v],
                  )
                }
              />
            </div>
            <div>
              <span className={labelClass}>Packages</span>
              <div className="grid gap-4">
                {form.packages.map((p, i) => {
                  const updatePkg = (patch: Partial<PackageDraft>) => {
                    const next = [...form.packages];
                    next[i] = { ...p, ...patch };
                    set("packages", next);
                  };
                  return (
                    <div
                      key={i}
                      className="rounded-xl border border-line bg-surface-2 p-4"
                    >
                      <input
                        className={inputClass}
                        placeholder="Package name"
                        value={p.name}
                        maxLength={120}
                        onChange={(e) => updatePkg({ name: e.target.value })}
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex rounded-lg border border-line p-0.5 text-sm">
                          <button
                            type="button"
                            onClick={() => updatePkg({ priceMode: "from" })}
                            className={`rounded-md px-3 py-1.5 transition-colors ${
                              p.priceMode === "from"
                                ? "bg-accent text-accent-ink"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            From ₱
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePkg({ priceMode: "enquiry" })}
                            className={`rounded-md px-3 py-1.5 transition-colors ${
                              p.priceMode === "enquiry"
                                ? "bg-accent text-accent-ink"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            Price on enquiry
                          </button>
                        </div>
                        {p.priceMode === "from" && (
                          <div className="w-40">
                            <PesoInput
                              value={p.priceAmount}
                              onChange={(v) => updatePkg({ priceAmount: v })}
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <PackageIncludes
                          selected={p.includes}
                          onChange={(inc) => updatePkg({ includes: inc })}
                          category={form.categories[0] ?? null}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "packages",
                            form.packages.filter((_, j) => j !== i),
                          )
                        }
                        className="mt-2 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-rose-700"
                      >
                        <Trash size={13} /> Remove package
                      </button>
                    </div>
                  );
                })}
                {form.packages.length < 4 && (
                  <button
                    type="button"
                    onClick={() =>
                      set("packages", [
                        ...form.packages,
                        {
                          name: "",
                          priceMode: "enquiry",
                          priceAmount: "",
                          includes: [],
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 self-start rounded-full border border-line bg-surface-2 px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
                  >
                    <Plus size={14} weight="bold" /> Add package
                  </button>
                )}
              </div>
            </div>
            <Field
              label="Fine print"
              help="Shown in small print under your packages."
            >
              <textarea
                className={`${inputClass} min-h-20`}
                value={form.pricingNotes}
                maxLength={2000}
                onChange={(e) => set("pricingNotes", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5">
            <Field label="Business name">
              <input
                className={inputClass}
                value={form.name}
                maxLength={200}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <div>
              <span className={labelClass}>Categories</span>
              {isAdmin ? (
                <ChipGroup
                  options={CATEGORY_LIST.map((c) => ({
                    value: c.slug,
                    label: c.label,
                  }))}
                  selected={form.categories}
                  onToggle={toggleCategory}
                />
              ) : (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {form.categories.length > 0 ? (
                      form.categories.map((slug) => {
                        const cat = CATEGORY_LIST.find((c) => c.slug === slug);
                        return (
                          <span
                            key={slug}
                            className="rounded-full bg-accent px-3.5 py-1.5 text-sm text-accent-ink"
                          >
                            {cat?.label ?? slug}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-muted">
                        No categories set yet.
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Categories are set by The Vow Edit team. Email us to change
                    them.
                  </p>
                </div>
              )}
            </div>
            <Field label="Tagline" hint="(card blurb couples see first)">
              <textarea
                className={`${inputClass} min-h-20`}
                value={form.shortDescription}
                maxLength={280}
                onChange={(e) => set("shortDescription", e.target.value)}
              />
            </Field>
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
            <div>
              <span className={labelClass}>
                Portrait{" "}
                <span className="font-normal text-muted">
                  (a photo of you or your team, optional)
                </span>
              </span>
              <PortraitField
                url={form.teamPhoto}
                onSupplier={(s) => {
                  // Narrow update: other fields on this step may hold unsaved text.
                  const next = s.pendingChanges?.team_photo ?? s.teamPhoto ?? "";
                  setForm((f) => ({ ...f, teamPhoto: next }));
                  baselineRef.current = {
                    ...baselineRef.current,
                    teamPhoto: next,
                  };
                  absorbImages(s);
                }}
                onError={setError}
              />
            </div>
            <Field label="Video URL" hint="(YouTube or Vimeo, optional)">
              <input
                className={inputClass}
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </Field>
            <div className="border-t border-line pt-6">
              <span className={labelClass}>Gallery photos</span>
              <PhotosStep
                images={images}
                slug={supplier.slug}
                onImages={setImages}
                onError={setError}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <KVEditor
            label="FAQ"
            aPlaceholder="Question"
            bPlaceholder="Answer"
            multiline
            rows={form.faq}
            onChange={(rows) => set("faq", rows)}
          />
        )}

        {step === 5 && (
          <PublishStep
            slug={supplier.slug}
            published={published}
            imageCount={images.length}
            hasDescription={form.description.trim().length > 0}
            onError={setError}
            onPublished={setPublishedState}
          />
        )}

        {/* Save bar (Publish self-saves; the gallery in step 3 self-saves too). */}
        {step !== PUBLISH_STEP && (
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
            className="mt-4 inline-flex items-start gap-1.5 text-sm text-rose-700"
          >
            <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}
      </div>

      {step !== PUBLISH_STEP && (
        <StepPreview
          step={step}
          images={images}
          data={{
            name: form.name,
            shortDescription: form.shortDescription,
            bio: form.bio,
            description: form.description,
            teamPhoto: form.teamPhoto,
            categories: form.categories,
            styleTags: form.styleTags,
            priceMin: form.priceMin,
            priceMax: form.priceMax,
            priceTypical: form.priceTypical,
            entourageRateMin: form.entourageRateMin,
            entourageRateMax: form.entourageRateMax,
            currency: form.currency,
            priceUnit: form.priceUnit,
            pricingNotes: form.pricingNotes,
            services: form.services,
            packages: form.packages.map((p) => ({
              name: p.name,
              priceLabel: priceLabelFrom(p),
              includes: p.includes,
            })),
            essentials: form.essentials,
            instagram: form.instagram,
            facebook: form.facebook,
            website: form.website,
            whatsapp: form.whatsapp,
            viber: form.viber,
            phone: form.phone,
            email: form.email,
            preferredChannel: form.preferredChannel,
            faq: form.faq,
          }}
          editor={{
            verified: supplier.verified,
            featured: supplier.featured,
            editorialTagline: supplier.editorialTagline,
            editorNote: supplier.editorNote,
            location: supplier.location,
          }}
        />
      )}

      {/* Unsaved-changes guard when switching steps */}
      {navTo !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#581824]/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface px-6 py-6 shadow-xl">
            <h3 className="font-serif text-xl font-medium text-ink">
              Unsaved changes on this step
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Save your changes before moving on, or discard them.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const target = navTo;
                  const ok = await saveStep();
                  if (ok && target !== null) doSwitch(target);
                  setNavTo(null);
                }}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {saving && <CircleNotch size={15} className="animate-spin" />}
                Save changes
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = navTo;
                  setForm(baselineRef.current);
                  setDirty(false);
                  setSavedStep(null);
                  if (target !== null) doSwitch(target);
                  setNavTo(null);
                }}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => setNavTo(null)}
                className="ml-auto text-sm text-muted transition-colors hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Photos step — upload / cover / reorder / delete against Supabase Storage.
// ---------------------------------------------------------------------
// The portrait (team_photo). Uploads through the same /api/profile/upload route as
// the gallery (kind=portrait), so it inherits the same validation and the same
// approval tier: a vendor's portrait lands in pending_changes for review.
function PortraitField({
  url,
  onSupplier,
  onError,
}: {
  url: string;
  onSupplier: (s: Supplier) => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    onError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", "portrait");
    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (res.ok) onSupplier(json.supplier as Supplier);
      else onError(json.error ?? "Upload failed.");
    } catch {
      onError("Upload failed.");
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function remove() {
    setBusy(true);
    onError("");
    const result = await updateMyProfile({ teamPhoto: "" });
    setBusy(false);
    if (result.ok) onSupplier(result.supplier);
    else onError(result.error);
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {url ? (
        <div className="relative h-28 w-24 overflow-hidden rounded-xl border border-line bg-surface-2">
          <Image
            src={url}
            alt="Your portrait"
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-28 w-24 items-center justify-center rounded-xl border border-dashed border-line bg-surface-2 text-muted">
          <UserCircle size={28} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? (
            <CircleNotch size={15} className="animate-spin" />
          ) : (
            <UploadSimple size={15} weight="bold" />
          )}
          {busy ? "Uploading..." : url ? "Replace portrait" : "Upload portrait"}
        </button>
        {url && !busy && (
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:text-rose-700"
          >
            <Trash size={15} /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

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
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
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

  // Move the photo at `from` to `to`. Every reorder affordance (drag, the move
  // buttons, make-cover) funnels through this, so they can't drift apart.
  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= images.length) return;
    const next = [...images];
    const [pick] = next.splice(from, 1);
    next.splice(to, 0, pick);
    reorder(next);
  }

  // Drag-and-drop is a convenience layer over move(). The move buttons below are
  // the accessible path: dragging alone would lock out keyboard users.
  function onDrop(to: number) {
    if (dragFrom === null) return;
    move(dragFrom, to);
    setDragFrom(null);
  }

  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        The first photo is your cover. Drag to reorder, or use the arrows. Upload
        JPEG, PNG or WebP up to 8 MB.
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
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragEnd={() => {
                setDragFrom(null);
                setDragOver(null);
              }}
              onDragOver={(e) => {
                e.preventDefault(); // required, or onDrop never fires
                setDragOver(i);
              }}
              onDragLeave={() => setDragOver((o) => (o === i ? null : o))}
              onDrop={() => {
                setDragOver(null);
                onDrop(i);
              }}
              className={`group relative cursor-grab overflow-hidden rounded-xl border bg-surface-2 transition-colors active:cursor-grabbing ${
                dragOver === i && dragFrom !== i
                  ? "border-accent"
                  : "border-line"
              } ${dragFrom === i ? "opacity-50" : ""}`}
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
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  title="Move earlier"
                  aria-label={`Move photo ${i + 1} earlier`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowLeft size={15} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === images.length - 1}
                  title="Move later"
                  aria-label={`Move photo ${i + 1} later`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <ArrowRight size={15} weight="bold" />
                </button>
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => move(i, 0)}
                    title="Make cover"
                    aria-label={`Make photo ${i + 1} the cover`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
                  >
                    <Star size={15} weight="bold" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  title="Remove"
                  aria-label={`Remove photo ${i + 1}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-rose-700"
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
// Numeric input with a ₱ prefix.
// ---------------------------------------------------------------------
function PesoInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        ₱
      </span>
      <input
        className={`${inputClass} pl-8`}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// Phone/Viber/WhatsApp input with inline PH-mobile validation. Stored value is
// normalised to E.164 server-side; this just flags obviously-bad input.
// ---------------------------------------------------------------------
function PhoneField({
  label,
  hint,
  value,
  onChange,
  disabled,
  sameAs,
  reserveSameAs,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  sameAs?: { checked: boolean; onToggle: (b: boolean) => void };
  reserveSameAs?: boolean;
}) {
  const invalid = !disabled && value.trim() !== "" && !normalizePhonePH(value).ok;
  return (
    <Field label={label} hint={hint}>
      {sameAs ? (
        <label className="mb-1.5 flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={sameAs.checked}
            onChange={(e) => sameAs.onToggle(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-[#581824]"
          />
          Same as phone
        </label>
      ) : (
        // Keep phone-type fields on the same vertical rhythm as the ones with a
        // "Same as phone" row beside them.
        reserveSameAs && <div aria-hidden className="mb-1.5 h-4" />
      )}
      <input
        className={`${inputClass} ${disabled ? "opacity-60" : ""}`}
        value={value}
        disabled={disabled}
        inputMode="tel"
        placeholder="+63 917 123 4567"
        onChange={(e) => onChange(e.target.value)}
      />
      {invalid && (
        <p className="mt-1 text-xs text-rose-700">
          Enter a valid PH mobile, e.g. 0917 123 4567.
        </p>
      )}
    </Field>
  );
}

// ---------------------------------------------------------------------
// Package inclusions — checkbox chips over the locked vocabulary (keys stored).
// ---------------------------------------------------------------------
function PackageIncludes({
  selected,
  onChange,
  category,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  category: string | null;
}) {
  // Category-scoped: this list used to be one flat makeup vocabulary shown to
  // everyone, so a photographer's package builder offered "Lashes included".
  const options = inclusionsFor(category).map((i) => ({
    value: i.key,
    label: i.label,
  }));
  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  return (
    <div>
      <span className={labelClass}>What&apos;s included</span>
      <ChipGroup options={options} selected={selected} onToggle={toggle} />
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
              className="mt-2 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-rose-700"
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

  // `todo` is the imperative form used when the item is what's blocking publish —
  // the label doesn't survive being dropped into a sentence.
  const checklist = [
    {
      ok: imageCount > 0,
      label: "At least one photo uploaded",
      todo: "Add a photo to publish.",
    },
    {
      ok: hasDescription,
      label: "An About / story written",
      todo: "Write your About story to publish.",
    },
  ];
  // The checklist used to be decorative: you could publish an empty profile. It
  // now blocks the PUBLISH direction only, never the unpublish one, so a vendor
  // is never trapped on a live page.
  const missing = checklist.filter((c) => !c.ok);
  const blocked = !published && missing.length > 0;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="font-serif text-2xl font-medium text-ink">
          {published ? "Your profile is live" : "Ready to go live?"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {published
            ? "Couples can find and contact you. You can unpublish any time."
            : "Publishing makes your profile visible to couples."}
        </p>
      </div>

      <div className="grid gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3.5 text-sm leading-relaxed">
        <p className="text-ink">
          <span className="font-medium">Goes live when you save each step:</span>{" "}
          <span className="text-muted">
            contact, pricing, the essentials, and services &amp; packages.
          </span>
        </p>
        <p className="text-ink">
          <span className="font-medium">Reviewed by The Vow Edit first:</span>{" "}
          <span className="text-muted">
            About &amp; photos and In their words — they publish once approved.
          </span>
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
          disabled={busy || blocked}
          className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-colors active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${
            published
              ? "border border-line bg-surface-2 text-ink hover:text-ink"
              : "bg-accent text-accent-ink hover:bg-accent-hover"
          }`}
        >
          {busy && <CircleNotch size={16} className="animate-spin" />}
          {published ? "Unpublish" : "Publish my profile"}
        </button>
        {blocked && (
          <p className="text-sm text-muted">
            {missing.length === 1
              ? missing[0].todo
              : "Finish the checklist above to publish."}
          </p>
        )}
        {published && (
          <Link
            href={`/vendors/${slug}`}
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
