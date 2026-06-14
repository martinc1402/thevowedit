import Link from "next/link";

// Brand lockup: the serif wordmark alone. The monogram crest was dropped — it
// read as poor quality at this size — so the name now carries the brand on its
// own. The link's aria-label and the visible text supply the accessible name.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="The Vow Edit home"
      className={`inline-flex items-center ${className}`}
    >
      <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
        The Vow Edit<span className="text-accent-fg">.</span>
      </span>
    </Link>
  );
}
