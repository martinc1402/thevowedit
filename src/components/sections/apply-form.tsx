"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PaperPlaneTilt, CheckCircle, WarningCircle, CaretDown, X } from "@phosphor-icons/react";
import {
  APPLY_CATEGORIES,
  APPLY_LOCATIONS,
  APPLY_ALL_AREAS,
  useApplyPrefill,
} from "@/components/apply-context";
import { submitApplication } from "@/lib/actions/application";

type ApplyData = {
  business: string;
  category: string;
  areas: string[]; // LGU slugs, or the island-wide sentinel (APPLY_ALL_AREAS.slug)
  contact: string;
  email: string;
  mobile: string;
  link: string;
  priceRange: string;
  consent: boolean;
  company: string; // honeypot - stays empty for real people
};

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "theme-light w-full rounded-xl border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";
const selectClass = `${inputClass} appearance-none pr-10`;
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className={labelClass}>{children}</span>;
}

function Optional() {
  return <span className="font-normal text-muted/70">(optional)</span>;
}

export function ApplyForm() {
  const prefill = useApplyPrefill();
  const [data, setData] = useState<ApplyData>({
    business: "",
    category: prefill.category,
    areas: prefill.area ? [prefill.area] : [],
    contact: "",
    email: "",
    mobile: "",
    link: "",
    priceRange: "",
    consent: false,
    company: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Once the supplier touches the area checkboxes, stop seeding from the hero so a
  // later hero "In" change can't clobber their multi-selection.
  const areasTouched = useRef(false);

  // Keep category in sync with the hero "I offer" selection, and seed the areas
  // with the hero "In" choice until the supplier edits the checkboxes themselves.
  useEffect(() => {
    setData((d) => ({
      ...d,
      category: prefill.category,
      areas: areasTouched.current ? d.areas : prefill.area ? [prefill.area] : [],
    }));
  }, [prefill.category, prefill.area]);

  function update<K extends keyof ApplyData>(key: K, value: ApplyData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const ALL = APPLY_ALL_AREAS.slug;
  const islandWide = data.areas.includes(ALL);

  // Toggle the island-wide sentinel: it stands alone, so selecting it replaces any
  // individual picks; unselecting clears the selection.
  function toggleAllAreas() {
    areasTouched.current = true;
    setData((d) => ({ ...d, areas: d.areas.includes(ALL) ? [] : [ALL] }));
  }

  // Add one LGU via the picker: drop the island-wide sentinel (the two modes never
  // mix) and ignore duplicates.
  function addArea(slug: string) {
    if (!slug) return;
    areasTouched.current = true;
    setData((d) => ({
      ...d,
      areas: [...d.areas.filter((s) => s !== ALL && s !== slug), slug],
    }));
  }

  // Remove one LGU chip.
  function removeArea(slug: string) {
    areasTouched.current = true;
    setData((d) => ({ ...d, areas: d.areas.filter((s) => s !== slug) }));
  }

  // The picked LGUs (excludes the sentinel) and the LGUs still available to add.
  const selectedLgus = data.areas.filter((s) => s !== ALL);
  const availableLgus = APPLY_LOCATIONS.filter((a) => !data.areas.includes(a.slug));
  const labelOf = (slug: string) =>
    APPLY_LOCATIONS.find((a) => a.slug === slug)?.label ?? slug;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return; // guard against double-submit
    if (!data.consent) return; // submit is disabled, but guard anyway
    if (data.areas.length === 0) {
      setStatus("error");
      setErrorMsg("Please select at least one area you serve, or All of Cebu.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    // The server action re-validates everything and re-checks consent; the
    // client checks above are just a fast/defensive first pass.
    try {
      const result = await submitApplication({
        business: data.business,
        category: data.category,
        areas: data.areas,
        contact: data.contact,
        email: data.email,
        mobile: data.mobile,
        link: data.link,
        priceRange: data.priceRange,
        consent: data.consent,
        company: data.company,
      });
      if (result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result.error);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
          <CheckCircle size={24} weight="fill" />
        </span>
        <h3 className="mt-4 font-serif text-2xl font-medium text-ink">
          Application received
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Thanks for putting {data.business || "your business"} forward. We will
          review it and reach out about your free founding listing before launch.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="block">
        <FieldLabel>Business name</FieldLabel>
        <input
          type="text"
          required
          value={data.business}
          onChange={(e) => update("business", e.target.value)}
          maxLength={200}
          className={inputClass}
          placeholder="e.g. Aria Studios"
        />
      </label>

      <label className="block">
        <FieldLabel>Category</FieldLabel>
        <div className="theme-light relative">
          <select
            required
            value={data.category}
            onChange={(e) => update("category", e.target.value)}
            className={selectClass}
            aria-label="Category"
          >
            {APPLY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </label>

      <fieldset className="block">
        <FieldLabel>Areas served</FieldLabel>

        {/* Island-wide stands alone: ticking it clears the chips + disables the picker. */}
        <label className="theme-light flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-bg px-4 py-3">
          <input
            type="checkbox"
            checked={islandWide}
            onChange={toggleAllAreas}
            className="h-4 w-4 shrink-0 rounded border-line accent-[#581824] [color-scheme:light] focus:ring-2 focus:ring-accent/40"
          />
          <span className="text-sm font-medium text-ink">
            Serves all of Cebu{" "}
            <span className="font-normal text-muted">(island-wide)</span>
          </span>
        </label>

        {/* Divider + sub-label leading into the individual-area picker. */}
        <div className="mt-3 mb-2 flex items-center gap-3">
          <span className="text-xs text-muted">or choose specific areas</span>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>

        {/* Selected areas as removable chips, above the picker. */}
        {selectedLgus.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedLgus.map((slug) => (
              <span
                key={slug}
                className="inline-flex items-center gap-1 rounded-lg bg-accent/10 py-1 pl-3 pr-1.5 text-sm text-accent-fg"
              >
                {labelOf(slug)}
                <button
                  type="button"
                  onClick={() => removeArea(slug)}
                  aria-label={`Remove ${labelOf(slug)}`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-accent-fg/70 transition-colors hover:bg-accent/20 hover:text-accent-fg"
                >
                  <X size={12} weight="bold" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add picker: a simple dropdown of the LGUs not yet chosen. Resets to the
            placeholder after each pick; disabled while island-wide is selected. */}
        <div className="theme-light relative">
          <select
            value=""
            onChange={(e) => addArea(e.target.value)}
            disabled={islandWide}
            aria-label="Add an area you serve"
            className={`${selectClass} ${islandWide ? "opacity-45" : ""}`}
          >
            <option value="" disabled>
              Add an area…
            </option>
            {availableLgus.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.label}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </fieldset>

      <label className="block">
        <FieldLabel>Contact name</FieldLabel>
        <input
          type="text"
          required
          value={data.contact}
          onChange={(e) => update("contact", e.target.value)}
          maxLength={200}
          className={inputClass}
          placeholder="Who we should talk to"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            maxLength={320}
            className={inputClass}
            placeholder="you@business.com"
          />
        </label>

        <label className="block">
          <FieldLabel>Mobile</FieldLabel>
          <input
            type="tel"
            required
            value={data.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            maxLength={40}
            className={inputClass}
            placeholder="0917 000 0000"
          />
        </label>
      </div>

      <label className="block">
        <FieldLabel>
          Website or Instagram <Optional />
        </FieldLabel>
        <input
          type="text"
          value={data.link}
          onChange={(e) => update("link", e.target.value)}
          maxLength={500}
          className={inputClass}
          placeholder="instagram.com/yourstudio"
        />
      </label>

      <label className="block">
        <FieldLabel>
          Price range <Optional />
        </FieldLabel>
        <input
          type="text"
          value={data.priceRange}
          onChange={(e) => update("priceRange", e.target.value)}
          maxLength={100}
          className={inputClass}
          placeholder="e.g. ₱35k-₱120k"
        />
      </label>

      {/* Honeypot: hidden from people, tempting to bots. Kept submittable
          (sr-only, not display:none); a non-empty value is dropped server-side. */}
      <div aria-hidden className="sr-only">
        <label>
          Company
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={data.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 pt-1">
        <input
          type="checkbox"
          required
          checked={data.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-[#581824] [color-scheme:light] focus:ring-2 focus:ring-accent/40"
        />
        <span className="text-sm leading-relaxed text-muted">
          I agree to have my business listed on The Vow Edit and accept the{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-accent-fg underline underline-offset-2 transition-colors hover:text-ink"
          >
            Privacy Notice
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting || !data.consent || data.areas.length === 0}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        <PaperPlaneTilt size={17} weight="fill" />
        {submitting ? "Sending..." : "Apply for a founding listing"}
      </button>

      {status === "error" && (
        <p
          role="alert"
          className="inline-flex items-start gap-1.5 text-sm leading-relaxed text-rose-200"
        >
          <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
          {errorMsg || "Something went wrong. Please try again."}
        </p>
      )}

      <p className="text-center text-xs leading-relaxed text-muted">
        Founding listings are free. No credit card, no commitment.
      </p>
    </form>
  );
}
