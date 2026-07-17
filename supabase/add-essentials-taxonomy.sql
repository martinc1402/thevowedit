-- =====================================================================
-- The Vow Edit — structured "essentials" taxonomy
-- Run against an existing suppliers table. Idempotent.
--
-- Replaces the flat specs/works_with/group_capacity approach for "The essentials"
-- with a layered, typed taxonomy stored structured (not display strings):
--   essentials  jsonb : coverage, bookingStatus, bookingTerms, languages, team,
--                       categoryFields, customEssentials (see lib/essentials-taxonomy.ts)
--   price_unit  text  : 'per_event' | 'per_head' | 'per_hour'
-- Price itself stays in the existing price_min/price_max/price_typical/currency
-- columns. All nullable + data-driven, so a vendor missing a field renders no row.
-- =====================================================================

alter table public.suppliers add column if not exists essentials jsonb;
alter table public.suppliers add column if not exists price_unit text;
