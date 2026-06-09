"use client";

import { useState } from "react";
import Link from "next/link";
import { List, X, SealCheck } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/theme-toggle";

// Pre-launch: nothing is browsable yet, so no nav links for MVP. The primary
// action is applying to list. Restore entries here (e.g. Browse) once the
// directory is live and the .map() below renders them automatically.
const navLinks: { label: string; href: string }[] = [];

function StatusPill({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-muted ${className}`}
    >
      <SealCheck size={13} weight="fill" className="text-accent-fg" />
      Now onboarding founding suppliers · Starting in Cebu
    </span>
  );
}

function Wordmark() {
  return (
    <Link
      href="/"
      className="font-serif text-2xl font-semibold tracking-tight text-ink"
      aria-label="The Vow Edit home"
    >
      The Vow Edit
      <span className="text-accent-fg">.</span>
    </Link>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Wordmark />

        <div className="hidden items-center gap-6 xl:flex">
          <StatusPill />
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            href="#apply"
            className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98] sm:inline-flex"
          >
            Apply for a founding listing
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink lg:hidden"
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-line bg-bg lg:hidden">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-4 sm:px-6">
            <StatusPill className="mb-2 self-start" />
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-ink transition-colors hover:bg-surface-2"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3">
              <Link
                href="#apply"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-accent-ink"
              >
                Apply for a founding listing
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
