import { SealCheck, Star } from "@phosphor-icons/react/dist/ssr";

// Shared trust markers. One implementation, used on listing cards and the
// supplier profile header. Caller supplies positioning (e.g. absolute over an
// image, or inline beside a heading) via className.

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-ink ${className}`}
    >
      <SealCheck size={14} weight="fill" />
      Verified
    </span>
  );
}

// Subtle explainer that gives the Verified badge meaning. Render only when the
// supplier is verified. Caller controls spacing via className.
export function VerifiedNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-start gap-2 text-[13px] leading-relaxed text-muted sm:text-sm ${className}`}
    >
      <SealCheck size={17} weight="fill" className="mt-0.5 shrink-0 text-accent-fg" />
      <span>
        <span className="font-medium text-ink">Personally checked by The Vow Edit.</span>{" "}
        Real business, real work, real pricing.
      </span>
    </p>
  );
}

export function FeaturedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-bg/90 px-2.5 py-1 text-xs font-medium text-ink backdrop-blur-sm ${className}`}
    >
      <Star size={13} weight="fill" className="text-accent-fg" />
      Featured
    </span>
  );
}
