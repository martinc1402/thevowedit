"use client";

import { useState } from "react";
import { PaperPlaneTilt, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { submitInquiry } from "@/lib/actions/inquiry";

type InquiryData = {
  name: string;
  email: string;
  weddingDate: string;
  message: string;
  company: string; // honeypot - stays empty for real people
};

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";

export function InquiryForm({
  supplierSlug,
  supplierName,
}: {
  supplierSlug: string;
  supplierName: string;
}) {
  const [data, setData] = useState<InquiryData>({
    name: "",
    email: "",
    weddingDate: "",
    message: "",
    company: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof InquiryData>(key: K, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return; // guard against double-submit
    setStatus("submitting");
    setErrorMsg("");
    try {
      const result = await submitInquiry({ supplierSlug, ...data });
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
      <div className="rounded-2xl border border-line bg-surface-2/50 px-6 py-10 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
          <CheckCircle size={24} weight="fill" />
        </span>
        <h3 className="mt-4 font-serif text-2xl font-medium text-ink">
          Thanks, your inquiry has been sent
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
          {supplierName} will be in touch soon about your date and pricing.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate={false}>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Your name</span>
        <input
          type="text"
          required
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
          placeholder="Maria & Josh"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Email</span>
        <input
          type="email"
          required
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass}
          placeholder="you@email.com"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">
          Wedding date <span className="font-normal text-muted/70">(optional)</span>
        </span>
        <input
          type="date"
          value={data.weddingDate}
          onChange={(e) => update("weddingDate", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Message</span>
        <textarea
          rows={4}
          required
          value={data.message}
          onChange={(e) => update("message", e.target.value)}
          className={`${inputClass} resize-y`}
          placeholder="Tell them about your day, venue, and what you are looking for."
        />
      </label>

      {/* Honeypot: hidden from people, tempting to bots. Kept in the DOM and
          submittable (sr-only, not display:none); a non-empty value is silently
          dropped server-side. */}
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

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
      >
        <PaperPlaneTilt size={17} weight="fill" />
        {submitting ? "Sending..." : "Send inquiry"}
      </button>

      {status === "error" && (
        <p
          role="alert"
          className="inline-flex items-start gap-1.5 text-sm leading-relaxed text-red-700 dark:text-red-400"
        >
          <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
          {errorMsg || "Something went wrong. Please try again."}
        </p>
      )}

      <p className="text-center text-xs leading-relaxed text-muted">
        Your inquiry goes to The Vow Edit, who will pass it to {supplierName}.
      </p>
    </form>
  );
}
