import {
  InstagramLogo,
  FacebookLogo,
  Globe,
  Phone,
  EnvelopeSimple,
  ChatCircle,
} from "@phosphor-icons/react/dist/ssr";

const handle = (v: string) => v.replace(/^@/, "").replace(/\/$/, "");
const withProtocol = (v: string) => (/^https?:\/\//.test(v) ? v : `https://${v}`);

type Link = { href: string; label: string; Icon: typeof Globe };

// Contact section. PH couples reach vendors chat-first, so Instagram / Messenger
// / phone are surfaced directly. (A platform-routed inquiry form is Phase 2.)
export function SupplierContact({
  name,
  instagram,
  facebook,
  website,
  phone,
  email,
}: {
  name: string;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
}) {
  const links: Link[] = [];
  if (instagram)
    links.push({
      href: `https://instagram.com/${handle(instagram)}`,
      label: "Instagram",
      Icon: InstagramLogo,
    });
  if (facebook) {
    links.push({
      href: `https://m.me/${handle(facebook)}`,
      label: "Messenger",
      Icon: ChatCircle,
    });
    links.push({
      href: `https://facebook.com/${handle(facebook)}`,
      label: "Facebook",
      Icon: FacebookLogo,
    });
  }
  if (phone)
    links.push({ href: `tel:${phone}`, label: phone, Icon: Phone });
  if (website)
    links.push({
      href: withProtocol(website),
      label: "Website",
      Icon: Globe,
    });
  if (email)
    links.push({ href: `mailto:${email}`, label: "Email", Icon: EnvelopeSimple });

  if (!links.length) return null;
  const [primary, ...rest] = links;

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24">
      <h2
        id="contact-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Get in touch
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Reach {name} directly. Mention you found them on The Vow Edit.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={primary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          <primary.Icon size={18} weight="fill" />
          {primary.label}
        </a>
        {rest.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
          >
            <l.Icon size={18} />
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
