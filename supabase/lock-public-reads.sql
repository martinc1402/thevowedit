-- =====================================================================
-- Lock down public (anon) reads of public.suppliers.
--
-- BEFORE: the only policy on the table was `select using (true)` for
-- anon+authenticated. With nothing but the anon key (which ships in every
-- browser bundle) anyone could read:
--   * EVERY supplier row, including unpublished / pre-launch listings, and
--   * the `pending_changes` column — vendor edits still awaiting moderation.
--
-- AFTER: anon can read published rows only, and only the columns the public
-- profile actually renders.
--
-- Safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Rows: published only.
--
-- This is a no-op for every legitimate read. The anon client is used in exactly
-- two places (getSupplierBySlug / listSupplierSlugs in src/lib/suppliers.ts) and
-- both ALREADY filter .eq("published", true). Everything that needs an
-- unpublished row (the vendor dashboard, the admin console + preview, the claim
-- page) reads through the service_role key, which bypasses RLS.
-- ---------------------------------------------------------------------
alter table public.suppliers enable row level security;

drop policy if exists "Public read access" on public.suppliers;
create policy "Public read access"
  on public.suppliers for select
  to anon, authenticated
  using (published = true);

-- ---------------------------------------------------------------------
-- 2. Columns: no pending_changes.
--
-- RLS is ROW-level, so a *published* vendor with edits under review would still
-- leak `pending_changes` through the policy above. Column privileges fix that —
-- but a table-wide GRANT SELECT overrides column-level REVOKEs, so the table
-- grant has to be dropped first and replaced with an explicit column list.
--
-- KEEP THIS LIST IN SYNC with the public projection in src/lib/suppliers.ts
-- (SUPPLIER_COLUMNS + CONTACT_CHANNEL_COLUMNS + MUA_ESSENTIALS_COLUMNS +
-- TAXONOMY_COLUMNS). A column that is selected by the app but missing here makes
-- the public read fail loudly (42501 -> the profile 404s), not silently.
--
-- Deliberately excluded: pending_changes (the moderation buffer — the whole point
-- of this file), created_at, updated_at, portfolio_link (nothing reads it; it is
-- slated for removal by supabase/drop-portfolio-link.sql).
-- ---------------------------------------------------------------------
revoke select on public.suppliers from anon, authenticated;

grant select (
  id,
  slug,
  name,
  based_in,
  serves_areas,
  categories,
  style_tags,
  price_min,
  price_max,
  price_typical,
  entourage_rate_min,
  entourage_rate_max,
  currency,
  per_service_pricing,
  short_description,
  description,
  editorial_tagline,
  editor_note,
  editor_highlights,
  services,
  pricing_notes,
  price_includes_sc_vat,
  bio,
  verified,
  featured,
  rating,
  review_count,
  works_with_overseas_couples,
  travel_fee_note,
  response_time_note,
  booking_terms,
  availability_note,
  established_year,
  weddings_count,
  faq,
  specs,
  instagram,
  website,
  facebook,
  email,
  phone,
  images,
  packages,
  reviews,
  video_url,
  team_photo,
  location,
  published,
  viber,
  whatsapp,
  preferred_channel,
  works_with,
  group_capacity,
  essentials,
  price_unit
) on public.suppliers to anon, authenticated;
