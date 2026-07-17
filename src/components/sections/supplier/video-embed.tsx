// Parse a YouTube/Vimeo URL into an embeddable src. Returns null for anything
// it doesn't recognise, so the section hides rather than rendering a broken frame.
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoEmbed({
  videoUrl,
  name,
}: {
  videoUrl: string | null;
  name: string;
}) {
  if (!videoUrl) return null;
  const src = toEmbedUrl(videoUrl);
  if (!src) return null;

  return (
    <section aria-labelledby="film-heading">
      <h2
        id="film-heading"
        className="font-serif text-2xl font-medium text-ink sm:text-3xl"
      >
        Watch their work
      </h2>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-surface-2">
        <iframe
          src={src}
          title={`${name} — film`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </section>
  );
}
