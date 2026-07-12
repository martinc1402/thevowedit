// Canonicalise vendor contact inputs to the forms the public deep-link builders
// (contact-channels.ts) expect: bare handles for Instagram/Facebook, PH E.164
// (+639XXXXXXXXX) for phone/viber/whatsapp. Pure + client-safe: used by both the
// wizard's inline validation and the server-side coercers (single source of truth).

// Strip @, protocol, known hosts, www, trailing slash, and any ?query/#hash →
// a bare canonical handle. Returns null when nothing usable remains.
export function normalizeHandle(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let s = input.trim();
  if (!s) return null;
  s = s.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  s = s.replace(/^(?:m\.me|instagram\.com|facebook\.com|fb\.com)\//i, "");
  s = s.split(/[?#]/)[0]; // drop query / hash
  s = s.replace(/^@+/, "").replace(/^\/+/, "").replace(/\/+$/, "").trim();
  return s || null;
}

export type PhoneResult = { ok: true; value: string } | { ok: false };

// Normalise a Philippine mobile number to E.164 with a leading "+".
// Accepts 0917…, 9171…, 63917…, +63 917 123 4567 (spaces/dashes/parens ignored).
// tel() keeps the "+"; digits() strips it for viber/wa.me — so one stored form
// (+639XXXXXXXXX) works for all three channels.
export function normalizePhonePH(input: unknown): PhoneResult {
  if (typeof input !== "string") return { ok: false };
  if (!input.trim()) return { ok: false };
  let d = input.replace(/[^\d]/g, ""); // digits only
  if (d.length === 11 && d.startsWith("09")) {
    d = "63" + d.slice(1); // 09XXXXXXXXX -> 639XXXXXXXXX
  } else if (d.length === 10 && d.startsWith("9")) {
    d = "63" + d; // 9XXXXXXXXX -> 639XXXXXXXXX
  }
  // else: assume already country-coded (e.g. 639XXXXXXXXX) and validate below
  return /^639\d{9}$/.test(d) ? { ok: true, value: "+" + d } : { ok: false };
}
