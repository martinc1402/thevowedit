import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getMyOwnership, addProfileImageUrl } from "@/lib/actions/profile";

// Authenticated gallery upload. Verifies the caller owns a supplier (session),
// validates the file, pushes it to the public supplier-images bucket under the
// supplier's own folder using the service role (no public write policy exists on
// the bucket), then appends the resulting public URL to images[].
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
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

  const ext = EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG or WebP image." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be between 1 byte and 8 MB." },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  const path = `${own.slug}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

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

  const result = await addProfileImageUrl(publicUrl);
  if (!result.ok) {
    // Roll back the orphaned object so storage doesn't accumulate junk.
    await admin.storage.from("supplier-images").remove([path]);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl, images: result.supplier.images });
}
