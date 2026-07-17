"use client";

import { useState } from "react";
import { Check, Copy, CircleNotch, Key, ArrowClockwise } from "@phosphor-icons/react";
import { adminGenerateClaimCode, adminUnclaim } from "@/lib/actions/claim";
import type { AdminVendor } from "@/lib/actions/moderation";

export function AdminVendors({ vendors }: { vendors: AdminVendor[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-2 text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">Vendor</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Access</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <Row key={v.id} v={v} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ v }: { v: AdminVendor }) {
  const [busy, setBusy] = useState<"" | "gen" | "unclaim">("");
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(v.claimed);
  const [codeActive, setCodeActive] = useState(v.codeActive);

  async function generate() {
    if (busy) return;
    setBusy("gen");
    setError("");
    const r = await adminGenerateClaimCode(v.id);
    setBusy("");
    if (r.ok) {
      setCode(r.code);
      setCodeActive(true);
    } else setError(r.error);
  }

  async function unclaim() {
    if (busy) return;
    if (!confirm(`Reset access for ${v.name}? Their login will be detached.`)) return;
    setBusy("unclaim");
    setError("");
    const r = await adminUnclaim(v.id);
    setBusy("");
    if (r.ok) {
      setClaimed(false);
      setCode(null);
      setCodeActive(false);
    } else setError(r.error);
  }

  async function copy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <tr className="border-b border-line last:border-0 align-top">
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{v.name}</p>
        <p className="text-xs text-muted">/{v.slug}</p>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
            v.published
              ? "bg-accent/10 text-accent-fg"
              : "border border-line text-muted"
          }`}
        >
          {v.published ? "Live" : "Unpublished"}
        </span>
      </td>
      <td className="px-4 py-3">
        {claimed ? (
          <span className="text-xs text-ink">Claimed · {v.claimEmail}</span>
        ) : codeActive ? (
          <span className="text-xs text-muted">Code active (unclaimed)</span>
        ) : (
          <span className="text-xs text-muted">Unclaimed</span>
        )}
        {code && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-2.5 py-1.5">
            <span className="font-mono text-sm tracking-wider text-ink">{code}</span>
            <button
              type="button"
              onClick={copy}
              className="text-muted transition-colors hover:text-ink"
              title="Copy"
            >
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
            </button>
          </div>
        )}
        {code && (
          <p className="mt-1 text-[11px] text-muted">
            Shown once — copy and send it to the vendor now.
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={!!busy || claimed}
            title={claimed ? "Unclaim first to issue a new code" : ""}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface disabled:opacity-40"
          >
            {busy === "gen" ? (
              <CircleNotch size={13} className="animate-spin" />
            ) : codeActive ? (
              <ArrowClockwise size={13} />
            ) : (
              <Key size={13} />
            )}
            {codeActive ? "Regenerate" : "Generate code"}
          </button>
          {claimed && (
            <button
              type="button"
              onClick={unclaim}
              disabled={!!busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-rose-200 disabled:opacity-40"
            >
              {busy === "unclaim" && <CircleNotch size={13} className="animate-spin" />}
              Unclaim
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-right text-xs text-rose-200">{error}</p>}
      </td>
    </tr>
  );
}
