import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

export type Crumb = { label: string; href?: string };

// Shared breadcrumb. The last item (no href) renders as the current page.
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-sm text-muted"
    >
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
          {c.href ? (
            <Link href={c.href} className="transition-colors hover:text-ink">
              {c.label}
            </Link>
          ) : (
            <span className="text-ink">{c.label}</span>
          )}
          {i < items.length - 1 && (
            <CaretRight size={13} className="text-muted/60" />
          )}
        </span>
      ))}
    </nav>
  );
}
