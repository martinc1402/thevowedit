"use client";

import { LockSimple } from "@phosphor-icons/react";
import {
  buildContactChannels,
  pickPrimaryChannel,
  buildPresenceLinks,
} from "@/lib/contact-channels";
import { draftToEssentials, type EssentialsDraft } from "@/lib/essentials-form";
import { SupplierContactCard } from "@/components/sections/supplier/supplier-contact-card";
import { SupplierEssentials } from "@/components/sections/supplier/supplier-essentials";
import { SupplierOfferings } from "@/components/sections/supplier/supplier-offerings";
import {
  SupplierAbout,
  StyleTags,
} from "@/components/sections/supplier/supplier-about";
import { SupplierFaq } from "@/components/sections/supplier/supplier-faq";
import { SupplierTitle } from "@/components/sections/supplier/supplier-header";
import { SupplierEditorNote } from "@/components/sections/supplier/supplier-editor-note";
import { SupplierGallery } from "@/components/sections/supplier/supplier-gallery";
import { GalleryPlaceholder } from "@/components/sections/supplier/gallery-placeholder";

// Live "what couples see" preview rendered from the wizard's DRAFT form state
// using the ACTUAL public profile components (they're shared/client-safe), so the
// preview is literally the public page — never a paraphrase. It re-renders as the
// form state changes.

// Editor-owned fields the vendor can't edit but should see rendered (locked).
export type PreviewEditor = {
  verified: boolean;
  featured: boolean;
  editorialTagline: string | null;
  editorNote: string | null;
  location: string;
};

type PreviewData = {
  name: string;
  shortDescription: string;
  bio: string;
  description: string;
  teamPhoto: string;
  categories: string[];
  styleTags: string[];
  priceMin: string;
  priceMax: string;
  priceTypical: string;
  currency: string;
  priceUnit: string;
  pricingNotes: string;
  services: string[];
  packages: { name: string; priceLabel: string; includes: string[] }[];
  essentials: EssentialsDraft;
  instagram: string;
  facebook: string;
  website: string;
  whatsapp: string;
  viber: string;
  phone: string;
  email: string;
  preferredChannel: string;
  faq: { a: string; b: string }[];
};

const numOrNull = (s: string): number | null => {
  const v = Number(s);
  return s.trim() !== "" && Number.isFinite(v) ? v : null;
};
const orNull = (s: string): string | null => (s.trim() ? s : null);

const EditorCaption = ({ children }: { children: React.ReactNode }) => (
  <p className="flex items-center gap-1.5 text-xs text-muted">
    <LockSimple size={12} weight="fill" /> {children}
  </p>
);

export function StepPreview({
  step,
  data,
  images,
  editor,
}: {
  step: number;
  data: PreviewData;
  images: string[];
  editor: PreviewEditor;
}) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
        Live preview · what couples see
      </p>
      <div className="theme-light rounded-xl border border-line bg-bg p-5 text-ink sm:p-6">
        {body(step, data, images, editor)}
      </div>
      {step === 0 && (
        <p className="mt-2 text-xs italic text-muted">
          This card sits beside your profile and follows couples as they scroll.
        </p>
      )}
      {step === 1 && (
        <p className="mt-2 text-xs italic text-muted">
          Rows appear only when filled in.
        </p>
      )}
    </div>
  );
}

function body(
  step: number,
  d: PreviewData,
  images: string[],
  editor: PreviewEditor,
) {
  const price = {
    priceMin: numOrNull(d.priceMin),
    priceMax: numOrNull(d.priceMax),
    priceTypical: numOrNull(d.priceTypical),
    currency: d.currency || "PHP",
  };

  // Contact — the real sticky contact card, derived exactly like the public page.
  if (step === 0) {
    const channels = buildContactChannels({
      instagram: orNull(d.instagram),
      facebook: orNull(d.facebook),
      viber: orNull(d.viber),
      phone: orNull(d.phone),
      whatsapp: orNull(d.whatsapp),
      email: orNull(d.email),
    });
    const primary = pickPrimaryChannel(channels, d.preferredChannel || null);
    const presence = buildPresenceLinks({
      facebook: orNull(d.facebook),
      website: orNull(d.website),
    });
    return (
      <div className="mx-auto max-w-sm">
        <SupplierContactCard
          {...price}
          verified={editor.verified}
          channels={channels}
          primary={primary}
          presence={presence}
        />
      </div>
    );
  }

  // The essentials. Style tags are edited on this step but render inside the
  // About section on the public page, so preview them here too — otherwise the
  // vendor edits them and sees nothing change.
  if (step === 1) {
    return (
      <>
        <SupplierEssentials
          {...price}
          priceUnit={d.priceUnit || null}
          category={d.categories[0] ?? null}
          essentials={draftToEssentials(d.essentials)}
        />
        <StyleTags tags={d.styleTags} category={d.categories[0] ?? null} />
      </>
    );
  }

  // Services & packages.
  if (step === 2) {
    return (
      <SupplierOfferings
        name={d.name || "Your studio"}
        services={d.services}
        packages={d.packages}
        pricingNotes={orNull(d.pricingNotes)}
      />
    );
  }

  // About & photos — title (with locked editor tagline/badges), verdict, gallery, about.
  if (step === 3) {
    return (
      <div className="space-y-8">
        <SupplierTitle
          name={d.name || "Your business name"}
          categories={d.categories}
          location={editor.location}
          tagline={editor.editorialTagline}
          verified={editor.verified}
          featured={editor.featured}
        />
        {(editor.editorialTagline || editor.featured || editor.verified) && (
          <EditorCaption>
            Tagline &amp; badges are written by The Vow Edit editors
          </EditorCaption>
        )}
        {editor.editorNote && (
          <div className="space-y-2">
            <SupplierEditorNote name={d.name || "you"} note={editor.editorNote} />
            <EditorCaption>
              The verdict is written by The Vow Edit editors
            </EditorCaption>
          </div>
        )}
        {images.length > 0 ? (
          <SupplierGallery images={images} name={d.name || "Gallery"} />
        ) : (
          <GalleryPlaceholder slug="preview" name={d.name || "Gallery"} />
        )}
        <SupplierAbout
          name={d.name || "the team"}
          description={orNull(d.description)}
          bio={orNull(d.bio)}
          teamPhoto={orNull(d.teamPhoto)}
          styleTags={d.styleTags}
          category={d.categories[0] ?? null}
        />
      </div>
    );
  }

  // In their words.
  if (step === 4) {
    return <SupplierFaq faq={d.faq.map((f) => ({ q: f.a, a: f.b }))} />;
  }

  return null;
}
