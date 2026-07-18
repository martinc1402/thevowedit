import {
  InstagramLogo,
  MessengerLogo,
  ChatDots,
  Phone,
  WhatsappLogo,
  EnvelopeSimple,
  FacebookLogo,
  Globe,
  SealCheck,
  ClockClockwise,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { formatPrice } from "@/lib/suppliers";
import { hasEntourageRate } from "@/lib/category-fields";
import type {
  ChannelKey,
  ContactChannel,
  PresenceKey,
  PresenceLink,
} from "@/lib/contact-channels";

// The direct-contact card: price + one primary channel button + the remaining
// channels as a compact icon+label row + a trust footer. No enquiry form — every
// action is a direct deep link. Rendered twice on the page (desktop sticky rail
// and mobile inline), so it stays presentational and data-driven.

const ICONS: Record<ChannelKey, Icon> = {
  instagram: InstagramLogo,
  messenger: MessengerLogo,
  viber: ChatDots, // Phosphor has no Viber glyph
  phone: Phone,
  whatsapp: WhatsappLogo,
  email: EnvelopeSimple,
};

const PRESENCE_ICONS: Record<PresenceKey, Icon> = {
  facebook: FacebookLogo,
  website: Globe,
};

function priceHeadline(
  priceMin: number | null,
  priceMax: number | null,
  priceTypical: number | null,
  currency: string,
): string {
  if (priceMin != null && priceMax != null && priceMax > priceMin)
    return `${formatPrice(priceMin, currency)} - ${formatPrice(priceMax, currency)}`;
  if (priceMin != null) return `from ${formatPrice(priceMin, currency)}`;
  if (priceTypical != null) return `around ${formatPrice(priceTypical, currency)}`;
  return "Price on request";
}

function linkProps(external: boolean) {
  return external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
}

export function SupplierContactCard({
  priceMin,
  priceMax,
  priceTypical,
  entourageRateMin = null,
  entourageRateMax = null,
  currency,
  category = null,
  verified,
  responseTimeValue = null,
  responseTimeUnit = null,
  channels,
  primary,
  presence,
}: {
  priceMin: number | null;
  priceMax: number | null;
  priceTypical: number | null;
  entourageRateMin?: number | null;
  entourageRateMax?: number | null;
  currency: string;
  category?: string | null;
  verified: boolean;
  responseTimeValue?: number | null;
  responseTimeUnit?: string | null;
  channels: ContactChannel[];
  primary: ContactChannel | null;
  presence: PresenceLink[];
}) {
  const headline = priceHeadline(priceMin, priceMax, priceTypical, currency);
  const secondary = channels.filter((c) => c.key !== primary?.key);
  const PrimaryIcon = primary ? ICONS[primary.key] : null;
  // The bride rate alone hides most of a Filipino wedding bill: the entourage is
  // charged per face, and 8-10 faces can exceed the bride's fee. Say it here, next
  // to the headline, not buried in a package list.
  // Per-FACE: a makeup concept. Ungated, a photographer's card would have read
  // "+ ₱X per face".
  const showEntourage = hasEntourageRate(category);
  const entourage =
    showEntourage && entourageRateMin != null
      ? `+ from ${formatPrice(entourageRateMin, currency)} per face`
      : showEntourage && entourageRateMax != null
        ? `+ up to ${formatPrice(entourageRateMax, currency)} per face`
        : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_2px_6px_rgba(88,24,36,0.05),0_12px_30px_rgba(88,24,36,0.06)]">
      <p className="font-serif text-3xl font-medium leading-none text-ink">
        {headline}
      </p>
      {entourage && (
        <p className="mt-1.5 text-sm font-medium text-ink">{entourage}</p>
      )}
      {priceTypical != null && (priceMin != null || priceMax != null) && (
        <p className="mt-2 text-sm text-muted">
          Couples typically spend around{" "}
          <span className="font-medium text-ink">
            {formatPrice(priceTypical, currency)}
          </span>
          .
        </p>
      )}

      {primary && PrimaryIcon && (
        <a
          href={primary.href}
          {...linkProps(primary.external)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          <PrimaryIcon size={18} weight="fill" />
          {primary.actionLabel}
        </a>
      )}

      {secondary.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {secondary.map((c) => {
            const Ico = ICONS[c.key];
            return (
              <a
                key={c.key}
                href={c.href}
                {...linkProps(c.external)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2 active:scale-[0.98]"
              >
                <Ico size={16} weight="fill" className="text-accent-fg" />
                {c.label}
              </a>
            );
          })}
        </div>
      )}

      {/* Presence links: quiet "see more of me" destinations, demoted below the
          contact actions (never maroon buttons). Only shown when provided. */}
      {presence.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm">
          {presence.map((p) => {
            const Ico = PRESENCE_ICONS[p.key];
            return (
              <a
                key={p.key}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
              >
                <Ico size={15} className="shrink-0" />
                {p.label}
              </a>
            );
          })}
        </div>
      )}

      {(verified || responseTimeValue != null) && (
        <div className="mt-5 grid gap-1.5 text-xs text-muted">
          {verified && (
            <p className="flex items-center gap-1.5">
              <SealCheck size={14} weight="fill" className="shrink-0 text-accent-fg" />
              Verified by The Vow Edit
            </p>
          )}
          {/* Locked "Usually replies within {n} {unit}": the vendor sets only a
              number + unit, so the phrasing stays on-brand and pluralises correctly.
              Hidden entirely when no number is set. */}
          {responseTimeValue != null && (
            <p className="flex items-center gap-1.5">
              <ClockClockwise size={14} className="shrink-0 text-accent-fg" />
              Usually replies within {responseTimeValue}{" "}
              {responseTimeValue === 1
                ? (responseTimeUnit ?? "hours").replace(/s$/, "")
                : (responseTimeUnit ?? "hours")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
