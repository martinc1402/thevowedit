-- =====================================================================
-- The Vow Edit — makeup-artist essentials: structured capacity fields
-- Run against an existing suppliers table. Idempotent.
--
-- Most "essentials" rows are authored in the existing `specs` jsonb list
-- ({label, value}). Capacity is structured instead of a plain string so
-- solo -> team is a data edit and the rendered line reads naturally:
--   works_with     : 'solo' | 'team'
--   group_capacity : how many faces (e.g. bride + up to N)
-- Both nullable + data-driven, so a vendor without them shows no capacity row.
-- =====================================================================

alter table public.suppliers add column if not exists works_with text;      -- 'solo' | 'team'
alter table public.suppliers add column if not exists group_capacity int;   -- faces the vendor can cover
