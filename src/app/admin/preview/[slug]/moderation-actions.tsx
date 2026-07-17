"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, CircleNotch } from "@phosphor-icons/react";
import {
  approvePendingChanges,
  rejectPendingChanges,
} from "@/lib/actions/moderation";

export function ModerationActions({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "approve" | "reject">("");
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function approve() {
    if (busy) return;
    setBusy("approve");
    setError("");
    const r = await approvePendingChanges(supplierId);
    if (r.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(r.error);
      setBusy("");
    }
  }

  async function reject() {
    if (busy) return;
    setBusy("reject");
    setError("");
    const r = await rejectPendingChanges(supplierId, note);
    if (r.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(r.error);
      setBusy("");
    }
  }

  if (rejecting) {
    return (
      <div className="flex w-full max-w-md flex-col gap-2 sm:w-auto">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          placeholder="Optional note to the vendor (why it wasn't approved)"
          className="theme-light min-h-16 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reject}
            disabled={!!busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-900/80 px-4 py-2 text-sm font-medium text-rose-50 transition-colors hover:bg-rose-900 disabled:opacity-60"
          >
            {busy === "reject" && <CircleNotch size={14} className="animate-spin" />}
            Confirm reject
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-rose-200">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={approve}
        disabled={!!busy}
        className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {busy === "approve" ? (
          <CircleNotch size={14} className="animate-spin" />
        ) : (
          <Check size={14} weight="bold" />
        )}
        Approve
      </button>
      <button
        type="button"
        onClick={() => setRejecting(true)}
        disabled={!!busy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-ink disabled:opacity-60"
      >
        <X size={14} weight="bold" /> Reject
      </button>
      {error && <p className="text-xs text-rose-200">{error}</p>}
    </div>
  );
}
