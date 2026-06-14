"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PaperPlaneTilt,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { submitInquiry } from "@/lib/actions/inquiry";

type Status = "idle" | "submitting" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

export function InquiryForm({
  supplierId,
  supplierSlug,
  supplierName,
}: {
  supplierId: string;
  supplierSlug: string;
  supplierName: string;
}) {
  const [data, setData] = useState({
    coupleName: "",
    coupleEmail: "",
    weddingDate: "",
    message: "",
    company: "", // honeypot
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof typeof data>(key: K, value: string) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const result = await submitInquiry({
        supplierId,
        supplierSlug,
        supplierName,
        ...data,
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
      <div className="rounded-2xl border border-line bg-surface-2 px-6 py-10 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
          <CheckCircle size={24} weight="fill" />
        </span>
        <h3 className="mt-4 font-serif text-xl font-medium text-ink">
          Message sent
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          We have passed your message to {supplierName}. They will be in touch
          soon.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Your name</span>
          <input
            type="text"
            required
            value={data.coupleName}
            onChange={(e) => update("coupleName", e.target.value)}
            maxLength={200}
            className={inputClass}
            placeholder="Couple or contact name"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            required
            value={data.coupleEmail}
            onChange={(e) => update("coupleEmail", e.target.value)}
            maxLength={320}
            className={inputClass}
            placeholder="you@email.com"
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>
          Wedding date{" "}
          <span className="font-normal text-muted/70">(optional)</span>
        </span>
        <input
          type="date"
          value={data.weddingDate}
          onChange={(e) => update("weddingDate", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Message</span>
        <textarea
          required
          rows={4}
          value={data.message}
          onChange={(e) => update("message", e.target.value)}
          maxLength={2000}
          className={`${inputClass} resize-y`}
          placeholder={`Tell ${supplierName} about your day - date, location, what you're looking for.`}
        />
      </label>

      {/* Honeypot: hidden from people, tempting to bots. */}
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
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        <PaperPlaneTilt size={17} weight="fill" />
        {submitting ? "Sending..." : `Send to ${supplierName}`}
      </button>

      {status === "error" && (
        <p
          role="alert"
          className="inline-flex items-start gap-1.5 text-sm leading-relaxed text-rose-700"
        >
          <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
          {errorMsg || "Something went wrong. Please try again."}
        </p>
      )}

      <p className="text-xs leading-relaxed text-muted">
        By sending, you agree to your details being shared with {supplierName} to
        respond. See our{" "}
        <Link
          href="/privacy"
          className="text-accent-fg underline underline-offset-2 transition-colors hover:text-ink"
        >
          Privacy Notice
        </Link>
        .
      </p>
    </form>
  );
}
