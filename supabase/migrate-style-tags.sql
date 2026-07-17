-- =====================================================================
-- Migrate style_tags from free text to the locked vocabulary
-- (src/lib/style-tags-vocab.ts). Keys are stored; labels are rendered.
--
-- Matthew's free-text tags were:
--   ['Clean', 'Timeless', 'Eye-focused', 'Soft Glam', 'Bridal']
--
--   Clean + Timeless  -> 'timeless'     (near-synonyms; one canonical POV tag)
--   Eye-focused       -> 'eye_focused'  (the only one with no existing home)
--   Soft Glam         -> DROPPED        (it is already his FINISH_STYLES chip and
--                                        renders in the Specialties row of The
--                                        essentials — repeating it here printed the
--                                        same fact twice on one profile)
--   Bridal            -> DROPPED        (restates the category; every vendor here
--                                        is a wedding vendor)
--
-- Other vendors' legacy free-text tags (Fine art, Documentary, Moody…) are left
-- alone on purpose: resolveStyleTag() passes unknown values through, so they keep
-- rendering until that vendor re-picks from the chips.
--
-- No CHECK constraint on the column, for exactly that reason.
--
-- Safe to run more than once.
-- =====================================================================
update public.suppliers
set style_tags = array['timeless', 'eye_focused']
where slug = 'makeupx-matthew';
