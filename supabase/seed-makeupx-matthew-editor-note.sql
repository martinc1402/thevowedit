-- =====================================================================
-- The Vow Edit — Makeup X Matthew: gender-neutral editor note (safe seed)
--
-- Rewrites the "Why we picked" note to avoid gendered language: drops the
-- his/His pronouns for Matthew and broadens "Cebu brides" to "anyone planning a
-- Cebu wedding". Only touches editor_note — nothing else.
-- =====================================================================

update public.suppliers
set editor_note = 'Matthew stood out for a clean, timeless approach to bridal beauty. The work feels polished without being heavy, with a strong focus on enhancing the eyes and keeping the overall look elegant, fresh and camera-ready. For anyone planning a Cebu wedding who wants modern glam that still feels personal, Makeup X Matthew is a strong fit.'
where slug = 'makeupx-matthew';
