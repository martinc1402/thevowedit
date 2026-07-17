-- =====================================================================
-- Per-face entourage rate.
--
-- The single biggest gap against MUA-Research.md. In a Philippine wedding the
-- bill is bride-rate + a PER-FACE entourage rate (₱1,500–₱5,000/head), and with
-- a Filipino entourage (ninang, ninong, mothers, bridesmaids) 8–10 faces can
-- match or exceed the bride's fee. The schema could only express ONE number, so
-- the entourage was unquotable — which is why the pilot's "Bridal Party" package
-- reads "Price on enquiry", the exact thing local rivals do and we exist to beat.
--
-- Entourage previously existed only as a COUNT (essentials.groupCapacity.maxFaces),
-- never a RATE.
--
-- Kept as plain int columns (not jsonb) so they are filterable/sortable later,
-- the same as price_min/price_max.
--
-- Safe to run more than once.
-- =====================================================================
alter table public.suppliers
  add column if not exists entourage_rate_min int,
  add column if not exists entourage_rate_max int;

comment on column public.suppliers.entourage_rate_min is
  'Per-face entourage rate, low end (e.g. 1500 = ₱1,500/face). Distinct from price_min, which is the bride rate.';
comment on column public.suppliers.entourage_rate_max is
  'Per-face entourage rate, high end. Null when the vendor charges a flat per-face rate.';

-- The anon SELECT grant is an explicit column allowlist (see lock-public-reads.sql).
-- A new public column that is NOT granted makes every public read fail with 42501,
-- which 404s the profile. Grant the new columns here so this file is self-contained.
grant select (entourage_rate_min, entourage_rate_max)
  on public.suppliers to anon, authenticated;
