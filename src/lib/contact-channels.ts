// Direct-contact channels for a vendor profile. Single source of truth for the
// contact card, the hero CTA, and the mobile bottom bar so every surface builds
// the same links and resolves the same primary channel. No enquiry form/flow —
// each channel is a direct deep link (chat / call / email).

export type ChannelKey =
  | "instagram"
  | "messenger"
  | "viber"
  | "phone"
  | "whatsapp"
  | "email";

export type ContactChannel = {
  key: ChannelKey;
  label: string; // short label for the secondary row, e.g. "Instagram"
  actionLabel: string; // primary-button verb, e.g. "Message on Instagram"
  href: string;
  detail?: string; // @handle / number / email shown alongside the label
  external: boolean; // opens in a new tab (http links) vs same-tab (tel:/mailto:)
};

// The fixed order channels always render in — both the secondary row and the
// fallback priority — so profiles stay visually consistent vendor to vendor.
const FIXED_ORDER: ChannelKey[] = [
  "instagram",
  "messenger",
  "viber",
  "phone",
  "whatsapp",
  "email",
];

// A social handle: drop a leading @ and any trailing slash.
const handle = (v: string) => v.trim().replace(/^@+/, "").replace(/\/+$/, "");
// Digits only, for wa.me / viber deep links (no +, spaces, or dashes).
const digits = (v: string) => v.replace(/[^\d]/g, "");
// A dialable string for tel: — keep a leading +, drop everything else non-digit.
const tel = (v: string) => {
  const d = digits(v);
  return v.trim().startsWith("+") ? `+${d}` : d;
};

export type ContactFields = {
  instagram: string | null;
  facebook: string | null;
  viber: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
};

// Build the vendor's available channels in the fixed order, skipping any the
// vendor hasn't provided. Messenger is derived from the Facebook handle.
export function buildContactChannels(s: ContactFields): ContactChannel[] {
  const out: ContactChannel[] = [];

  if (s.instagram) {
    const h = handle(s.instagram);
    out.push({
      key: "instagram",
      label: "Instagram",
      actionLabel: "Message on Instagram",
      href: `https://instagram.com/${h}`,
      detail: `@${h}`,
      external: true,
    });
  }
  if (s.facebook) {
    out.push({
      key: "messenger",
      label: "Messenger",
      actionLabel: "Message on Messenger",
      href: `https://m.me/${handle(s.facebook)}`,
      external: true,
    });
  }
  if (s.viber) {
    out.push({
      key: "viber",
      label: "Viber",
      actionLabel: "Chat on Viber",
      href: `viber://chat?number=%2B${digits(s.viber)}`,
      external: true,
    });
  }
  if (s.phone) {
    out.push({
      key: "phone",
      label: "Call",
      actionLabel: "Call now",
      href: `tel:${tel(s.phone)}`,
      detail: s.phone,
      external: false,
    });
  }
  if (s.whatsapp) {
    out.push({
      key: "whatsapp",
      label: "WhatsApp",
      actionLabel: "Chat on WhatsApp",
      href: `https://wa.me/${digits(s.whatsapp)}`,
      external: true,
    });
  }
  if (s.email) {
    out.push({
      key: "email",
      label: "Email",
      actionLabel: "Send email",
      href: `mailto:${s.email.trim()}`,
      detail: s.email,
      external: false,
    });
  }

  return out;
}

// "Presence" links are browsing destinations ("see more of me"), distinct from
// the contact actions above — they take you somewhere to look around rather than
// message the vendor. Rendered as a quiet, demoted tier in the contact card.
export type PresenceKey = "facebook" | "website";
export type PresenceLink = { key: PresenceKey; label: string; href: string };

// A URL for an href — prepend https:// when the vendor omitted the protocol.
const withProtocol = (v: string) =>
  /^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`;
// A clean hostname label for a website (e.g. "makeupxmatthew.ph"), not the raw URL.
const hostLabel = (v: string) => {
  try {
    return new URL(withProtocol(v)).hostname.replace(/^www\./, "");
  } catch {
    return handle(v);
  }
};

export type PresenceFields = {
  facebook: string | null;
  website: string | null;
};

// The Facebook Page derives from the same handle as Messenger (m.me vs
// facebook.com — same identity, different intent). Website shows a clean host
// label. Only the fields the vendor provided are returned, in a fixed order.
export function buildPresenceLinks(s: PresenceFields): PresenceLink[] {
  const out: PresenceLink[] = [];
  if (s.facebook)
    out.push({
      key: "facebook",
      label: "Facebook",
      href: `https://facebook.com/${handle(s.facebook)}`,
    });
  if (s.website)
    out.push({
      key: "website",
      label: hostLabel(s.website),
      href: withProtocol(s.website),
    });
  return out;
}

// The primary (maroon) action. Uses the vendor's preferred channel only if they
// actually provided a detail for it; otherwise the first available channel by
// the fixed priority (Instagram-first for the PH market). Null when the vendor
// has no channels at all, so the caller can hide the button rather than render a
// dead link.
export function pickPrimaryChannel(
  channels: ContactChannel[],
  preferred: string | null,
): ContactChannel | null {
  if (channels.length === 0) return null;
  if (preferred) {
    const match = channels.find((c) => c.key === preferred);
    if (match) return match;
  }
  for (const key of FIXED_ORDER) {
    const match = channels.find((c) => c.key === key);
    if (match) return match;
  }
  return channels[0];
}
