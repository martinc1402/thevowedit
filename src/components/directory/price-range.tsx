import { formatPeso } from "@/lib/directory";

// Single price-range treatment (serif + muted "to"), matching the homepage
// price band and listing cards. Size is controlled by the caller's className.
export function PriceRange({
  min,
  max,
  className = "",
}: {
  min: number;
  max: number;
  className?: string;
}) {
  return (
    <span className={`font-serif font-medium leading-none text-ink ${className}`}>
      {formatPeso(min)}
      <span className="mx-1.5 text-muted">to</span>
      {formatPeso(max)}
    </span>
  );
}
