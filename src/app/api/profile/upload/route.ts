import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  getMyOwnership,
  addProfileImageUrl,
  setTeamPhotoUrl,
} from "@/lib/actions/profile";

// Authenticated image upload. Verifies the caller owns a supplier (session),
// validates the file, pushes it to the public supplier-images bucket under the
// supplier's own folder using the service role (no public write policy exists on
// the bucket), then attaches the resulting public URL to the profile.
//
// kind=gallery (default) appends to images[]; kind=portrait sets team_photo.
// Both land inside <slug>/, so the ownership prefix check in the actions holds.
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const MIN_EDGE = 800; // px — floor for a crisp gallery on retina displays
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const own = await getMyOwnership();
  if (!own) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const isPortrait = form.get("kind") === "portrait";

  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "That file type isn't supported. Please upload a JPEG, PNG or WebP photo." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      { error: "That file looks empty. Please choose a photo and try again." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That photo is over 8 MB. Please upload a smaller file." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Reject images too small to look crisp in the gallery layout.
  let width = 0;
  let height = 0;
  try {
    const meta = await sharp(bytes).metadata();
    width = meta.width ?? 0;
    height = meta.height ?? 0;
  } catch {
    return NextResponse.json(
      { error: "We couldn't read that image. Please try a different photo." },
      { status: 400 },
    );
  }
  if (width < MIN_EDGE || height < MIN_EDGE) {
    return NextResponse.json(
      {
        error: `This photo is too small to look sharp in your gallery. Please upload one at least ${MIN_EDGE}px wide and tall.`,
      },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  const path = `${own.slug}/${isPortrait ? "portrait/" : ""}${randomUUID()}.${ext}`;

  const { error: upErr } = await admin.storage
    .from("supplier-images")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (upErr) {
    console.error("[profile/upload] storage error:", upErr.message);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("supplier-images").getPublicUrl(path);

  const result = isPortrait
    ? await setTeamPhotoUrl(publicUrl)
    : await addProfileImageUrl(publicUrl);

  if (!result.ok) {
    // Roll back the orphaned object so storage doesn't accumulate junk. This is
    // what fires when the gallery is already at its cap.
    await admin.storage.from("supplier-images").remove([path]);
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Return the caller's EFFECTIVE gallery (a vendor's uploads accumulate in the
  // pending draft, so surface that) plus the whole supplier, which the wizard uses
  // to refresh its "in review" state without a reload.
  const pending = result.supplier.pendingChanges;
  return NextResponse.json({
    url: publicUrl,
    images: pending?.images ?? result.supplier.images,
    supplier: result.supplier,
  });
}
