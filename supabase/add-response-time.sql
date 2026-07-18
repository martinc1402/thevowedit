-- =====================================================================
-- Structured reply-time (replaces the free-text response_time_note).
--
-- The public trust line is a locked "Usually replies within {n} {unit}" — the
-- vendor only sets a number and a unit (hours / days / weeks), so the phrasing
-- can't drift and pluralisation ("1 hour" vs "24 hours") stays correct. The line
-- is hidden entirely when response_time_value is null.
--
--   response_time_value : positive int (the app clamps 1-99)
--   response_time_unit  : 'hours' | 'days' | 'weeks'
--
-- The old response_time_note text column is left in place but no longer read or
-- written by the app; a later cleanup can drop it.
--
-- Safe to run more than once.
-- =====================================================================
alter table public.suppliers
  add column if not exists response_time_value int,
  add column if not exists response_time_unit  text;

comment on column public.suppliers.response_time_value is
  'Reply-time number for the "Usually replies within {n} {unit}" trust line. Null = hidden.';
comment on column public.suppliers.response_time_unit is
  'Reply-time unit: hours | days | weeks. Defaults to hours when a value is set.';

-- Public reads use an explicit column allowlist (see lock-public-reads.sql). A new
-- public column that is NOT granted makes every public read fail with 42501, which
-- 404s the profile. Grant the new columns here so this file is self-contained.
grant select (response_time_value, response_time_unit)
  on public.suppliers to anon, authenticated;

-- Preserve the pilot's existing "Usually replies within 24 hours" as structured data
-- so nothing is lost when the app switches off the free-text column.
update public.suppliers
   set response_time_value = 24, response_time_unit = 'hours'
 where slug = 'makeupx-matthew' and response_time_value is null;
