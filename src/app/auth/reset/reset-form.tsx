"use client";

import { useState } from "react";
import { LockSimple, WarningCircle, CircleNotch } from "@phosphor-icons/react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const inputClass =
  "theme-light w-full rounded-xl border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

export function ResetForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const supabase = getSupabaseBrowser();
      const { error: e2 } = await supabase.auth.updateUser({ password });
      if (e2) {
        setError(
          e2.message.includes("session")
            ? "This reset link has expired. Please request a new one."
            : e2.message,
        );
        setBusy(false);
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
      <label className="block">
        <span className={labelClass}>New password</span>
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
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={72}
            className={`${inputClass} pl-10`}
            placeholder="At least 8 characters"
          />
        </div>
      </label>

      <label className="block">
        <span className={labelClass}>Confirm password</span>
        <div className="relative">
          <LockSimple
            size={17}
            className="theme-light pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            minLength={8}
            maxLength={72}
            className={`${inputClass} pl-10`}
            placeholder="Re-enter password"
          />
        </div>
      </label>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
      >
        {busy && <CircleNotch size={16} className="animate-spin" />}
        {busy ? "Saving..." : "Save new password"}
      </button>

      {error && (
        <p
          role="alert"
          className="inline-flex items-start gap-1.5 text-sm leading-relaxed text-rose-200"
        >
          <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </form>
  );
}
