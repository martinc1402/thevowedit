"use client";

import { createContext, useContext, useState } from "react";
import { APPLY_CATEGORIES, APPLY_LOCATIONS, APPLY_SCOPE } from "@/lib/apply-options";

// Re-exported so existing imports (`from "@/components/apply-context"`) in the
// hero and form keep working. The canonical lists live in @/lib/apply-options
// (no React) so the server action can import them for validation too.
export { APPLY_CATEGORIES, APPLY_LOCATIONS, APPLY_SCOPE };

// `area` carries an LGU slug (e.g. "cebu-city"), not a label. It maps to the
// supplier_applications.area_served column once the server resolves it to a label.
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
    area: APPLY_LOCATIONS[0].slug,
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
