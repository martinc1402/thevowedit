import {
  ContactPills,
  type ContactChannel,
} from "@/components/sections/supplier/contact-pills";

const handle = (v: string) => v.replace(/^@/, "").replace(/\/$/, "");
const withProtocol = (v: string) => (/^https?:\/\//.test(v) ? v : `https://${v}`);
const hostOf = (v: string) => {
  try {
    return new URL(withProtocol(v)).hostname.replace(/^www\./, "");
  } catch {
    return handle(v);
  }
};

// Contact section. PH couples reach vendors chat-first, so Instagram / Messenger
// are surfaced as the showcased channels (the platform-routed inquiry form is
// kept out of launch — see inquiry-form.tsx). The first channel leads as a
// filled tile; the rest sit in a bordered grid below it.
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
  const channels: ContactChannel[] = [];
  if (instagram)
    channels.push({
      href: `https://instagram.com/${handle(instagram)}`,
      label: "Instagram",
      detail: `@${handle(instagram)}`,
      icon: "instagram",
      external: true,
    });
  if (facebook) {
    channels.push({
      href: `https://m.me/${handle(facebook)}`,
      label: "Messenger",
      icon: "messenger",
      external: true,
    });
    channels.push({
      href: `https://facebook.com/${handle(facebook)}`,
      label: "Facebook",
      icon: "facebook",
      external: true,
    });
  }
  if (phone)
    channels.push({
      href: `tel:${phone}`,
      label: "Call",
      detail: phone,
      icon: "phone",
      external: false,
    });
  if (website)
    channels.push({
      href: withProtocol(website),
      label: "Website",
      detail: hostOf(website),
      icon: "website",
      external: true,
    });
  if (email)
    channels.push({
      href: `mailto:${email}`,
      label: "Email",
      detail: email,
      icon: "email",
      external: false,
    });

  if (channels.length === 0) return null;

  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24">
      <h2
        id="contact-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Get in touch
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Reach {name}{" "}directly. They&rsquo;re quickest to reply on chat.
      </p>

      {/* Compact pills. The lead channel is filled for a touch of hierarchy. */}
      <ContactPills channels={channels} />
    </section>
  );
}
