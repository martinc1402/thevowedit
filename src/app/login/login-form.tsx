"use client";

import { useState } from "react";
import {
  CheckCircle,
  WarningCircle,
  EnvelopeSimple,
  LockSimple,
  CircleNotch,
} from "@phosphor-icons/react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { claimSupplierForCurrentUser } from "@/lib/actions/profile";

type Mode = "signin" | "signup";
type Sent = null | "magic" | "signup" | "reset";

const inputClass =
  "theme-light w-full rounded-xl border border-line bg-bg px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/40";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

export function LoginForm({ initialError = "" }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string>(""); // which action is in flight
  const [error, setError] = useState(initialError);
  const [sent, setSent] = useState<Sent>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy("password");
    setError("");
    const supabase = getSupabaseBrowser();

    try {
      if (mode === "signup") {
        const { error: e2 } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });
        if (e2) {
          setError(e2.message);
          setBusy("");
          return;
        }
        setSent("signup");
        setBusy("");
        return;
      }

      // Sign in with an existing password.
      const { error: e2 } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (e2) {
        setError(e2.message);
        setBusy("");
        return;
      }
      // Session cookies are set; claim the profile (idempotent) then hard-nav so
      // the server sees the session.
      try {
        await claimSupplierForCurrentUser();
      } catch {
        // ignore — dashboard handles the unlinked state
      }
      window.location.assign("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy("");
    }
  }

  async function sendMagicLink() {
    if (email.trim() === "") {
      setError("Enter your email first.");
      return;
    }
    setBusy("magic");
    setError("");
    try {
      const supabase = getSupabaseBrowser();
      const { error: e } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });
      if (e) setError(e.message);
      else setSent("magic");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy("");
  }

  async function sendReset() {
    if (email.trim() === "") {
      setError("Enter your email first, then tap reset.");
      return;
    }
    setBusy("reset");
    setError("");
    try {
      const supabase = getSupabaseBrowser();
      const { error: e } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${origin}/auth/callback?next=/auth/reset` },
      );
      if (e) setError(e.message);
      else setSent("reset");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy("");
  }

  if (sent) {
    const copy =
      sent === "magic"
        ? "We sent a sign-in link to"
        : sent === "signup"
          ? "We sent a confirmation link to"
          : "We sent a password reset link to";
    return (
      <div className="mt-8 rounded-xl border border-line bg-surface-2 px-5 py-6 text-center">
        <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
          <CheckCircle size={22} weight="fill" />
        </span>
        <h2 className="mt-3 font-serif text-xl font-medium text-ink">
          Check your email
        </h2>
        <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-muted">
          {copy} <span className="text-ink">{email}</span>. Open it on this
          device to continue.
        </p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-4 text-xs text-accent-fg underline underline-offset-2 transition-colors hover:text-ink"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Email + password */}
      <form onSubmit={submitPassword} className="grid gap-4">
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
              onChange={(e) => setEmail(e.target.value)}
              maxLength={320}
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
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              maxLength={72}
              className={`${inputClass} pl-10`}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            />
          </div>
          {mode === "signin" && (
            <button
              type="button"
              onClick={sendReset}
              disabled={busy === "reset"}
              className="mt-1.5 text-xs text-muted underline underline-offset-2 transition-colors hover:text-ink"
            >
              Forgot password?
            </button>
          )}
        </label>

        <button
          type="submit"
          disabled={!!busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "password" && <CircleNotch size={16} className="animate-spin" />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      {/* Mode toggle + magic link */}
      <div className="mt-5 space-y-2 text-center text-sm text-muted">
        <p>
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="text-accent-fg underline underline-offset-2 transition-colors hover:text-ink"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <button
          type="button"
          onClick={sendMagicLink}
          disabled={busy === "magic"}
          className="text-xs text-muted underline underline-offset-2 transition-colors hover:text-ink"
        >
          Email me a sign-in link instead
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 inline-flex items-start gap-1.5 text-sm leading-relaxed text-rose-200"
        >
          <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
