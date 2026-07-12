-- =====================================================================
-- The Vow Edit — Makeup X Matthew: "Meet" section in first person (safe seed)
--
-- The "Meet {name}" section is written by the vendor themselves, so its voice is
-- first person ("I create…"). Rewrites the placeholder description + bio into
-- first person. Only touches description/bio — does NOT touch images/team_photo.
-- =====================================================================

update public.suppliers set
  description = 'I create bridal looks that feel clean, refined and personal. My style is all about enhancing each bride''s natural features, with particular attention to the eyes, skin finish and the overall balance of the look. My approach is warm and professional, and I love helping brides feel relaxed, confident and beautifully themselves on one of the most meaningful days of their lives.',
  bio = 'I''m a Cebu-based bridal makeup artist.'
where slug = 'makeupx-matthew';
