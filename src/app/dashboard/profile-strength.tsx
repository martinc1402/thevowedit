"use client";

import { useState } from "react";
import { Check, ArrowRight, CaretDown } from "@phosphor-icons/react";
import type { Completeness, Check as CheckItem } from "@/lib/profile-completeness";

// The nudge panel above the wizard. It exists to answer the question a vendor never
// asks out loud — "which of these forty fields is actually worth my time?" — so the
// `why` is not decoration. It is the whole component. Ranked by what the completeness
// model says earns enquiries, and every row jumps straight to the input.

const TOP_N = 3;

function Row({
  check,
  onJump,
}: {
  check: CheckItem;
  onJump: (step: number) => void;
}) {
  const done = check.progress >= 1;
  return (
    <li>
      <button
        type="button"
        onClick={() => onJump(check.step)}
        disabled={done}
        className="group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors enabled:hover:bg-surface-2 disabled:cursor-default"
      >
        <span
          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            done
              ? "bg-accent/15 text-accent-fg"
              : "border border-line text-muted"
          }`}
        >
          {done && <Check size={12} weight="bold" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span
              className={`text-sm font-medium ${done ? "text-muted line-through decoration-line" : "text-ink"}`}
            >
              {check.label}
            </span>
            {check.detail && (
              <span className="text-xs text-muted">{check.detail}</span>
            )}
          </span>
          {!done && (
            <span className="mt-0.5 block text-xs leading-relaxed text-muted">
              {check.why}
            </span>
          )}
        </span>
        {!done && (
          <ArrowRight
            size={15}
            weight="bold"
            aria-hidden
            className="mt-0.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </button>
    </li>
  );
}

export function ProfileStrength({
  result,
  onJump,
}: {
  result: Completeness;
  onJump: (step: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const { score, checks, missing } = result;
  const complete = missing.length === 0;

  const shown = showAll ? checks : missing.slice(0, TOP_N);
  const hiddenCount = checks.length - shown.length;

  return (
    <section className="mb-8 rounded-2xl border border-line bg-surface px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-serif text-lg font-medium text-ink">
          Profile strength
        </h2>
        <span className="text-sm tabular-nums text-muted">
          <span className="font-medium text-ink">{score}%</span> complete
        </span>
      </div>

      {/* The bar is the summary; the rows below are the substance. */}
      <div
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile strength"
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {complete ? (
          <>
            <span className="font-medium text-ink">Nothing left to fill in.</span>{" "}
            Keep your booking status and gallery current and you&rsquo;ll stay
            near the top of the browse grid.
          </>
        ) : (
          <>
            Couples compare on photos and real prices. These are the gaps costing
            you enquiries, most valuable first.
          </>
        )}
      </p>

      <ul className="mt-3 grid gap-0.5">
        {shown.map((c) => (
          <Row key={c.key} check={c} onJump={onJump} />
        ))}
      </ul>

      {checks.length > TOP_N && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 inline-flex items-center gap-1.5 px-3 text-xs font-medium text-muted transition-colors hover:text-ink"
        >
          <CaretDown
            size={12}
            weight="bold"
            className={`transition-transform ${showAll ? "rotate-180" : ""}`}
          />
          {showAll
            ? "Show fewer"
            : complete
              ? `Show all ${checks.length}`
              : `Show all ${checks.length} — ${hiddenCount} more`}
        </button>
      )}
    </section>
  );
}
