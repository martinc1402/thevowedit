-- =====================================================================
-- Per-photo focal point (crop anchor).
--
-- Every gallery image renders with object-cover, cropping to fill frames of
-- different shapes (hero ~square, second ~portrait, 3+ collage tiles, mobile
-- carousel). The crop is always centred, so an off-centre face gets clipped.
-- image_focus lets a vendor set the point that stays in frame per photo; the UI
-- applies it as object-position everywhere the image is cover-cropped.
--
-- Shape: { "<image-url>": [x, y] } with x,y integers 0-100 (percent). A URL with
-- no entry falls back to centre (50% 50%). Keyed by URL, not index, so reordering
-- the gallery never desyncs a focal point from its photo.
--
-- Safe to run more than once.
-- =====================================================================
alter table public.suppliers
  add column if not exists image_focus jsonb not null default '{}'::jsonb;

comment on column public.suppliers.image_focus is
  'Per-photo crop anchor: { "<image-url>": [x, y] }, x/y in 0-100 percent. Absent = centre.';

-- The anon SELECT grant is an explicit column allowlist (see lock-public-reads.sql).
-- A new public column that is NOT granted makes every public read fail with 42501,
-- which 404s the profile. Grant the new column here so this file is self-contained.
grant select (image_focus)
  on public.suppliers to anon, authenticated;
