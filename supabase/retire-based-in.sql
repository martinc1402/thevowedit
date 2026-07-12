-- =====================================================================
-- Retire `based_in` properly.
--
-- The app no longer reads or writes it: it duplicated `location` (the field the
-- profile actually renders) and the two could silently drift, so it was removed
-- from the wizard and the write allowlist.
--
-- But the column is still NOT NULL with no default, which means any INSERT that
-- omits it FAILS:
--
--   null value in column "based_in" of relation "suppliers"
--   violates not-null constraint
--
-- That makes adding a vendor impossible without setting a field nobody uses. Drop
-- the constraint so new rows do not have to carry it. The column itself stays
-- (dropping columns is destructive and it costs nothing to leave).
--
-- Safe to run more than once.
-- =====================================================================
alter table public.suppliers
  alter column based_in drop not null;

comment on column public.suppliers.based_in is
  'DEPRECATED — duplicated `location`, which is what the profile renders. No longer written by the app.';
