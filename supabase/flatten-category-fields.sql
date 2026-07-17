-- =====================================================================
-- Flatten essentials.categoryFields.
--
-- The category fields are now described as DATA (src/lib/category-fields.ts) and
-- one spec = one input = one stored key. That needs a FLAT map. The old shape
-- nested some of them:
--
--   groupCapacity: { maxFaces, includesBride }  ->  groupMaxFaces, groupIncludesBride
--   retouch:       { tier, hours, note }        ->  retouchTier, retouchHours, retouchNote
--   earlyCall:     { availableFrom, feeNote }   ->  earlyFrom, earlyFee
--   trial:         { status, note }             ->  trialStatus, trialNote
--
-- Everything else (hairServices, finishStyles, techniques, skinInclusivity,
-- backupPlan, onLocation, homeService) was already flat and is untouched.
--
-- Why this matters: the previous validator was a hardcoded allowlist of the 11
-- makeup keys that never looked at the vendor's category, so no other category
-- could persist a single field. The flat, spec-driven version fixes that — but it
-- reads flat keys, so existing rows must be converted or their makeup facts would
-- stop rendering.
--
-- Applied in-app via the service role (it is DML, not DDL). This file is the
-- reproducible record.
--
-- Safe to run more than once: the nested keys are removed as they are lifted.
-- =====================================================================
update public.suppliers
set essentials = jsonb_set(
  essentials,
  '{categoryFields}',
  (essentials -> 'categoryFields')
    - 'groupCapacity' - 'retouch' - 'earlyCall' - 'trial'
    || coalesce(jsonb_strip_nulls(jsonb_build_object(
         'groupMaxFaces',      essentials -> 'categoryFields' -> 'groupCapacity' -> 'maxFaces',
         'groupIncludesBride', essentials -> 'categoryFields' -> 'groupCapacity' -> 'includesBride',
         'retouchTier',        essentials -> 'categoryFields' -> 'retouch' -> 'tier',
         'retouchHours',       essentials -> 'categoryFields' -> 'retouch' -> 'hours',
         'retouchNote',        essentials -> 'categoryFields' -> 'retouch' -> 'note',
         'earlyFrom',          essentials -> 'categoryFields' -> 'earlyCall' -> 'availableFrom',
         'earlyFee',           essentials -> 'categoryFields' -> 'earlyCall' -> 'feeNote',
         'trialStatus',        essentials -> 'categoryFields' -> 'trial' -> 'status',
         'trialNote',          essentials -> 'categoryFields' -> 'trial' -> 'note'
       )), '{}'::jsonb)
)
where essentials -> 'categoryFields' ?| array['groupCapacity', 'retouch', 'earlyCall', 'trial'];
