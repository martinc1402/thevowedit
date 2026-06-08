"use client";

import { createContext, useContext, useState } from "react";
import { APPLY_CATEGORIES, APPLY_AREAS } from "@/lib/apply-options";

// Re-exported so existing imports (`from "@/components/apply-context"`) in the
// hero and form keep working. The canonical lists live in @/lib/apply-options
// (no React) so the server action can import them for validation too.
export { APPLY_CATEGORIES, APPLY_AREAS };

type Prefill = { category: string; area: string };

type ApplyPrefillValue = Prefill & {
  setPrefill: (next: Partial<Prefill>) => void;
};

const ApplyPrefillContext = createContext<ApplyPrefillValue | null>(null);

/**
 * Carries the hero "I offer / In" selections down to the application form so the
 * dropdowns the supplier touched first arrive pre-filled. Client provider; server
 * children pass through untouched via the children prop.
 */
export function ApplyPrefillProvider({ children }: { children: React.ReactNode }) {
  const [prefill, setState] = useState<Prefill>({
    category: APPLY_CATEGORIES[0],
    area: APPLY_AREAS[0],
  });

  const setPrefill = (next: Partial<Prefill>) =>
    setState((p) => ({ ...p, ...next }));

  return (
    <ApplyPrefillContext.Provider value={{ ...prefill, setPrefill }}>
      {children}
    </ApplyPrefillContext.Provider>
  );
}

export function useApplyPrefill() {
  const ctx = useContext(ApplyPrefillContext);
  if (!ctx) {
    throw new Error("useApplyPrefill must be used within ApplyPrefillProvider");
  }
  return ctx;
}
