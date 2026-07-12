import { Sparkle } from "@phosphor-icons/react/dist/ssr";

// "Why we picked {name}" — the editorial centrepiece that makes the directory
// feel curated and opinionated rather than a data listing. Rendered as a wine
// card so it reads as a curated moment on the cream page; The Vow Edit's take is
// a serif pull-quote in cream. Hidden when there's no note.
export function SupplierEditorNote({
  name,
  note,
}: {
  name: string;
  note: string | null;
}) {
  if (!note) return null;

  return (
    <section
      aria-labelledby="editor-note-heading"
      className="theme-wine rounded-2xl border border-line bg-surface p-8 text-ink sm:p-10"
    >
      <div className="flex items-center gap-2 text-accent-fg">
        <Sparkle size={16} weight="fill" />
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-fg">
          Editor&rsquo;s Pick
        </span>
      </div>

      <h2
        id="editor-note-heading"
        className="mt-4 font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Why we picked {name}
      </h2>

      <p className="mt-4 max-w-[60ch] font-serif text-lg leading-relaxed text-ink sm:text-xl">
        {note}
      </p>
    </section>
  );
}
