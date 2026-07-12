-- =====================================================================
-- The Vow Edit — Makeup X Matthew: trim the "Meet" bio (safe seed)
--
-- Drops the "I treat every couple like friends, not just clients..." sentence
-- from the bio; it was duplicated in the "In their words" FAQ answer, which
-- keeps it. Only touches the bio column — does NOT touch images/team_photo.
-- =====================================================================

update public.suppliers
set bio = 'Cebu-based bridal makeup artist.'
where slug = 'makeupx-matthew';
