import { ChatCircle, InstagramLogo } from "@phosphor-icons/react/dist/ssr";

const handle = (v: string) => v.replace(/^@/, "").replace(/\/$/, "");

// The closing invitation, just above the contact section. Kept on the cream page
// with the maroon held to the single primary CTA — the verdict is the one wine
// moment, so this reads as a calm sign-off rather than a second heavy slab.
export function EnquiryBand({
  name,
  instagram,
}: {
  name: string;
  instagram: string | null;
}) {
  return (
    <section
      id="contact"
      aria-labelledby="enquiry-heading"
      className="scroll-mt-24 rounded-2xl border border-line bg-surface-2 p-8 text-center text-ink sm:p-12"
    >
      <h2
        id="enquiry-heading"
        className="mx-auto max-w-[22ch] font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Interested in {name} for your wedding?
      </h2>
      <p className="mx-auto mt-3 max-w-[52ch] text-base leading-relaxed text-muted">
        Tell us your wedding date, location, and the look you&rsquo;re hoping
        for. We&rsquo;ll help connect you with {name}.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-ink transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          <ChatCircle size={18} weight="fill" />
          Send Enquiry
        </a>
        {instagram && (
          <a
            href={`https://instagram.com/${handle(instagram)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 active:scale-[0.98]"
          >
            <InstagramLogo size={18} weight="fill" />
            View Instagram
          </a>
        )}
      </div>

      <p className="mt-6 text-xs text-muted">Curated by The Vow Edit PH</p>
    </section>
  );
}
