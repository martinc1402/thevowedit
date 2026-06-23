"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  InstagramLogo,
  FacebookLogo,
  Globe,
  Phone,
  EnvelopeSimple,
  ChatCircle,
} from "@phosphor-icons/react";

export type IconKey =
  | "instagram"
  | "messenger"
  | "facebook"
  | "phone"
  | "website"
  | "email";

export type ContactChannel = {
  href: string;
  label: string;
  // The identifier shown at rest (@handle, phone, host, email). Optional: when
  // omitted, the label alone identifies the channel (e.g. Messenger, Facebook).
  detail?: string;
  icon: IconKey;
  external: boolean;
};

const ICONS = {
  instagram: InstagramLogo,
  messenger: ChatCircle,
  facebook: FacebookLogo,
  phone: Phone,
  website: Globe,
  email: EnvelopeSimple,
} as const;

const SPRING = { type: "spring", stiffness: 400, damping: 34 } as const;

function Pill({ channel, lead }: { channel: ContactChannel; lead: boolean }) {
  const reduce = useReducedMotion();
  const Icon = ICONS[channel.icon];

  const base =
    "group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium transition-colors";
  const tone = lead
    ? "bg-accent text-accent-ink hover:bg-accent-hover"
    : "border border-line bg-surface text-ink hover:bg-surface-2";
  // The identifier sits next to the label as secondary text, readable at rest
  // on every device (PH couples are mobile-first, so no hover gate).
  const detailTone = lead ? "text-accent-ink/70" : "text-muted";

  return (
    <motion.a
      href={channel.href}
      {...(channel.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      whileTap={{ scale: 0.97 }}
      transition={reduce ? { duration: 0 } : SPRING}
      className={`${base} ${tone}`}
    >
      <Icon size={17} weight="fill" />
      <span className="whitespace-nowrap">
        {channel.label}
        {channel.detail && (
          <span className={`ml-1.5 ${detailTone}`}>{channel.detail}</span>
        )}
      </span>
    </motion.a>
  );
}

export function ContactPills({ channels }: { channels: ContactChannel[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {channels.map((c, i) => (
        <Pill key={c.label} channel={c} lead={i === 0} />
      ))}
    </div>
  );
}
