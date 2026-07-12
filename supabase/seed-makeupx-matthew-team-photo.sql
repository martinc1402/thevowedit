-- =====================================================================
-- The Vow Edit — Makeup X Matthew: "Meet" section portrait (safe seed)
--
-- Sets an optional vendor portrait for the "Meet {name}" section (image-left /
-- text-right). Placeholder grayscale image for now — the vendor replaces it with
-- their own headshot (dashboard team-photo field). Only touches team_photo.
-- =====================================================================

update public.suppliers
set team_photo = 'https://picsum.photos/seed/makeupx-matthew-portrait/640/800?grayscale'
where slug = 'makeupx-matthew';
