-- =====================================================================
-- The Vow Edit — drop the unused `portfolio_link` column (run in SQL editor)
-- It duplicated `website` and is no longer read or written by the app. Ship the
-- code that stops selecting it FIRST, then run this. Idempotent; destructive
-- (drops the column + any stored values — safe pre-launch).
-- =====================================================================

alter table public.suppliers
  drop column if exists portfolio_link;
