# Cebu homepage photography

Drop the real photos here using these exact filenames. Paths and alt text are
wired in `src/lib/content.ts` (`heroImage`, `categories[].image`, `weddingTypes[].image`).
Until a file exists, the slot degrades to a neutral background (no broken-image icon).

## Hero — 16:9 landscape, large
The hero is full-bleed `object-cover`, so it crops to the viewport. Export wide.

| File | Aspect | Suggested export |
|------|--------|------------------|
| `hero.jpg` | 16:9 | 2400 × 1350 (min ~2000 wide) |

## Category tiles — 4:5 portrait (9 files)
Rendered in a `aspect-[4/5]` tile, up to ~360px wide on desktop.

| File | Aspect | Suggested export |
|------|--------|------------------|
| `category-photographers.jpg` | 4:5 | 800 × 1000 |
| `category-hmua.jpg`          | 4:5 | 800 × 1000 |
| `category-catering.jpg`      | 4:5 | 800 × 1000 |
| `category-venues.jpg`        | 4:5 | 800 × 1000 |
| `category-florists.jpg`      | 4:5 | 800 × 1000 |
| `category-coordinators.jpg`  | 4:5 | 800 × 1000 |
| `category-videographers.jpg` | 4:5 | 800 × 1000 |
| `category-cakes.jpg`         | 4:5 | 800 × 1000 |
| `category-content-creators.jpg` | 4:5 | 800 × 1000 — TEMP stand-in (copy of the videographers photo). Replace with a real social-content shot: candid / behind-the-scenes, not a person-with-a-phone cliché. |

## Wedding-type tiles — 16:10 landscape (4 files)
Rendered in a `aspect-[16/10]` tile, up to ~680px wide on desktop.

| File | Aspect | Suggested export |
|------|--------|------------------|
| `type-beach.jpg`    | 16:10 | 1200 × 750 |
| `type-garden.jpg`   | 16:10 | 1200 × 750 |
| `type-church.jpg`   | 16:10 | 1200 × 750 |
| `type-ballroom.jpg` | 16:10 | 1200 × 750 |

Notes:
- `next/image` re-encodes and resizes automatically, so exporting at roughly 2× the
  on-screen size is plenty. `.jpg` is assumed in the wired paths; if you prefer `.webp`,
  update the paths in `src/lib/content.ts` to match.
- The tiles are sized by their aspect-ratio containers, not the file dimensions, so any
  photo at the listed ratio holds the layout. Off-ratio photos still work (they crop via
  `object-cover`) but match the ratio to avoid unexpected cropping.
