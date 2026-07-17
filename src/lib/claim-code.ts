import "server-only";
import { randomInt, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Claim codes let an admin hand a vendor a one-time secret to take ownership of
// their profile. Codes are stored HASHED (scrypt) like a password — never in
// plaintext. High entropy (31^8 ≈ 8.5e11) + 30-day expiry + single-use +
// per-profile rate limiting make brute force infeasible. scrypt is a standard
// Node KDF, so we satisfy "hashed like a password" with zero new dependencies.

// Ambiguity-free alphabet: A–Z minus O, I, L, plus 2–9 (no 0/O/1/I/L). 31 chars.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LEN = 8;
const PREFIX = "VWE";

export type GeneratedCode = { display: string; canonical: string };

// Cryptographically secure 8-char code. `canonical` is what we hash/compare;
// `display` is the human-facing grouped form shown to the admin once.
export function generateClaimCode(): GeneratedCode {
  let canonical = "";
  for (let i = 0; i < CODE_LEN; i++) {
    canonical += ALPHABET[randomInt(ALPHABET.length)];
  }
  const display = `${PREFIX}-${canonical.slice(0, 4)}-${canonical.slice(4)}`;
  return { display, canonical };
}

// Normalize a user-typed code to its canonical 8-char form, or null if it can't
// be one. Tolerates the "VWE-XXXX-XXXX" display form, lowercase, and stray
// spaces/dashes.
export function normalizeClaimCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.length === CODE_LEN + PREFIX.length && s.startsWith(PREFIX)) {
    s = s.slice(PREFIX.length);
  }
  if (s.length !== CODE_LEN) return null;
  for (const ch of s) if (!ALPHABET.includes(ch)) return null;
  return s;
}

// scrypt hash, stored as "saltHex:hashHex".
export function hashClaimCode(canonical: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(canonical, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Constant-time verify of a user-typed code against a stored hash.
export function verifyClaimCode(input: unknown, stored: string | null): boolean {
  if (!stored) return false;
  const canonical = normalizeClaimCode(input);
  if (!canonical) return false;
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(canonical, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
