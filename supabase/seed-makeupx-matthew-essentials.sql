-- =====================================================================
-- The Vow Edit — Makeup X Matthew: structured "essentials" + packages (safe seed)
-- Run AFTER supabase/add-essentials-taxonomy.sql.
--
-- Seeds the layered, typed essentials taxonomy (structured values, not display
-- strings — the app formats them) + keyed package inclusions. Price stays in the
-- price_* columns. Does NOT touch images/team_photo. No migration needed for the
-- newer essentials fields (they live inside the essentials jsonb).
--
-- Mactan removed on purpose — it is within Lapu-Lapu, not a separate area.
-- DUMMY values to replace with real facts: hairServices, retouch tier, earlyCall
-- 03:00, finishStyles / techniques / skinInclusivity, backupPlan, bookingTerms,
-- languages, and the Bridal+Trial "second_look" inclusion.
-- =====================================================================

update public.suppliers set
  price_unit = 'per_event',
  essentials = '{
    "coverage": { "areas": ["cebu-city","mandaue","lapu-lapu","talisay"], "travelsBeyond": false, "travelNote": "travels within Cebu" },
    "bookingStatus": { "status": "open", "note": "2026 & 2027 weddings" },
    "bookingTerms": "50% retainer to reserve, balance on the day",
    "languages": ["english","cebuano","tagalog"],
    "team": { "size": "solo" },
    "categoryFields": {
      "hairServices": "included",
      "groupCapacity": { "maxFaces": 5, "includesBride": true },
      "retouch": { "tier": "until_reception" },
      "earlyCall": { "availableFrom": "03:00" },
      "trial": { "status": "available" },
      "finishStyles": ["soft_glam"],
      "techniques": ["airbrush"],
      "skinInclusivity": ["all_skin_tones"],
      "backupPlan": "Trusted partner artist on standby",
      "onLocation": true,
      "homeService": true
    },
    "customEssentials": []
  }'::jsonb,
  -- Package inclusions as locked keys (resolved to labels by the app); "second_look"
  -- added to Bridal + Trial. Unknown keys would pass through as raw text.
  packages = '[
    { "name":"Bridal Makeup", "priceLabel":"From ₱8,000", "includes":["wedding_day_makeup","skin_prep","lashes"] },
    { "name":"Bridal + Trial", "priceLabel":"From ₱12,000", "includes":["trial_session","wedding_day_makeup","look_planning","second_look"] },
    { "name":"Bridal Party", "priceLabel":"Price on enquiry", "includes":["entourage","custom_quote","on_location"] }
  ]'::jsonb,
  -- Deprecated flat essentials fields (superseded by the structured taxonomy).
  specs = '[]'::jsonb,
  works_with = null,
  group_capacity = null
where slug = 'makeupx-matthew';
