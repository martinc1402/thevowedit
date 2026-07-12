-- =====================================================================
-- The Vow Edit — editorial / curation fields migration
-- Run against an existing suppliers table to add the curator-authored
-- editorial fields used by the refined profile page. Idempotent.
--
-- These are authored by The Vow Edit (not the vendor) and are all nullable,
-- so suppliers without them simply render nothing (the profile sections are
-- data-driven and hide when empty).
-- =====================================================================

alter table public.suppliers add column if not exists services text[] not null default '{}';   -- flat list of services offered
alter table public.suppliers add column if not exists editorial_tagline text;                  -- curator's one-line hero tagline
alter table public.suppliers add column if not exists editor_note text;                         -- curator's "Why we picked" paragraph
alter table public.suppliers add column if not exists editor_highlights jsonb;                  -- [{ label, value }] curator highlight chips
