"use client";

import { useState } from "react";
import {
  CheckCircle,
  WarningCircle,
  Key,
  EnvelopeSimple,
  LockSimple,
  CircleNotch,
} from "@phosphor-icons/react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { submitClaimCode, completeClaim } from "@/lib/actions/claim";

const inputClass =
  "theme-light w-full rounded-xl border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

type Step = "code" | "account" | "done";

export function ClaimForm({ slug }: { slug: string }) {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await submitClaimCode(slug, code);
    setBusy(false);
    if (result.ok) setStep("account");
    else setError(result.error);
  }

  async function submitAccount(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError("");
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: e2 } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (e2 || !data.user) {
        setError(e2?.message ?? "Could not create your account.");
        setBusy(false);
        return;
      }
      const linked = await completeClaim(data.user.id, email.trim());
      setBusy(false);
      if (linked.ok) setStep("done");
      else setError(linked.error);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <div className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-6 text-center">
        <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
          <CheckCircle size={22} weight="fill" />
        </span>
        <h2 className="mt-3 font-serif text-xl font-medium text-ink">
          Profile claimed
        </h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
          We sent a verification link to{" "}
          <span className="text-ink">{email}</span>. Open it to confirm your
          email, then sign in to manage your listing.
        </p>
      </div>
    );
  }

  if (step === "account") {
    return (
      <form onSubmit={submitAccount} className="mt-8 grid gap-4">
        <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-muted">
          Code accepted. Set up the login you&rsquo;ll use from now on.
        </p>
        <label className="block">
          <span className={labelClass}>Email</span>
          <div className="relative">
            <EnvelopeSimple
              size={17}
              className="theme-light pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              maxLength={320}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="you@business.com"
            />
          </div>
        </label>
        <label className="block">
          <span className={labelClass}>Password</span>
          <div className="relative">
            <LockSimple
              size={17}
              className="theme-light pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              minLength={8}
              maxLength={72}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="At least 8 characters"
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
        >
          {busy && <CircleNotch size={16} className="animate-spin" />}
          Create account
        </button>
        {error && <ErrorLine msg={error} />}
      </form>
    );
  }

  return (
    <form onSubmit={submitCode} className="mt-8 grid gap-4">
      <label className="block">
        <span className={labelClass}>Claim code</span>
        <div className="relative">
          <Key
            size={17}
            className="theme-light pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            required
            value={code}
            maxLength={20}
            autoCapitalize="characters"
            onChange={(e) => setCode(e.target.value)}
            className={`${inputClass} pl-10 font-mono tracking-wider`}
            placeholder="VWE-XXXX-XXXX"
          />
        </div>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
      >
        {busy && <CircleNotch size={16} className="animate-spin" />}
        Continue
      </button>
      {error && <ErrorLine msg={error} />}
    </form>
  );
}

function ErrorLine({ msg }: { msg: string }) {
  return (
    <p
      role="alert"
      className="inline-flex items-start gap-1.5 text-sm leading-relaxed text-rose-200"
    >
      <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
      {msg}
    </p>
  );
}
