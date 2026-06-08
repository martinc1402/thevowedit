import {
  InstagramLogo,
  FacebookLogo,
  Globe,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import type { SupplierContact } from "@/lib/types";

// External "View portfolio" links. Some suppliers (e.g. first real submissions)
// have no uploadable images yet — their work lives on Instagram / Facebook / a
// website. We surface those as outbound links so the profile still points the
// couple to real work. Renders nothing when there are no external links.
export function PortfolioLinks({ contact }: { contact?: SupplierContact }) {
  if (!contact) return null;

  const links = [
    contact.website && {
      href: contact.website,
      label: "Website",
      Icon: Globe,
    },
    contact.instagram && {
      href: `https://instagram.com/${contact.instagram.replace(/^@/, "")}`,
      label: "Instagram",
      Icon: InstagramLogo,
    },
    contact.facebook && {
      href: `https://facebook.com/${contact.facebook}`,
      label: "Facebook",
      Icon: FacebookLogo,
    },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Globe }[];

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink transition-colors hover:border-ink/25 hover:bg-surface-2"
        >
          <Icon size={15} weight="fill" className="text-accent-fg" />
          {label}
          <ArrowUpRight size={13} weight="bold" className="text-muted" />
        </a>
      ))}
    </div>
  );
}
