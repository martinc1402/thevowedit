-- =====================================================================
-- The Vow Edit — Makeup X Matthew showcase content
-- Run AFTER schema.sql, supplier-auth.sql, seed-founding-suppliers.sql and
-- add-editorial-fields.sql. Fills the existing skeleton row with rich
-- placeholder content and publishes it, so /vendors/makeupx-matthew renders
-- the full editorial profile.
--
-- IMPORTANT: every value below is PLACEHOLDER content for design/demo purposes.
-- Replace with the vendor's real copy, pricing and photos before this is
-- treated as live. `images` is intentionally EMPTY so the profile shows the
-- branded captioned placeholder gallery (GalleryPlaceholder) instead of fake
-- stock photos; drop real portfolio URLs into `images` to switch it over. This
-- UPDATE leaves the skeleton / ownership-claim flow in
-- seed-founding-suppliers.sql untouched.
-- =====================================================================

update public.suppliers set
  -- Identity / status
  name              = 'Makeup X Matthew',          -- display-name fix (was 'MakeupX Matthew')
  location          = 'Cebu City',
  verified          = true,
  featured          = true,                          -- drives the "Editor's Pick" badge
  published         = true,                          -- makes the profile live

  -- Positioning
  editorial_tagline = 'Clean, timeless bridal beauty with a modern Cebu touch.',
  -- Locked vocabulary keys (src/lib/style-tags-vocab.ts), not free text. "Soft Glam"
  -- and "Bridal" are deliberately absent: the first is already his finish-style chip
  -- (it renders in the Specialties row), the second just restates the category.
  style_tags        = array['timeless','eye_focused'],

  -- NOTE: `serves_areas` and `based_in` are NOT set here any more.
  --   * serves_areas is DERIVED from essentials.coverage.areas on save and holds
  --     taxonomy KEYS ('cebu-city') — it is the GIN-indexed array the browse filter
  --     queries. This file used to seed free-text labels including 'Mactan', which
  --     the taxonomy rejects (Mactan is inside Lapu-Lapu). Re-running it would have
  --     put the drift straight back. seed-makeupx-matthew-essentials.sql sets the
  --     coverage chips; the derivation does the rest.
  --   * based_in duplicated `location` and is no longer editable.

  -- Pricing (placeholder — handled as "from" + custom quote, never definite).
  -- The per-face ENTOURAGE rate (entourage_rate_min/max) is deliberately left unset:
  -- it is a real price and only the artist can give it. Until he does, his bridal
  -- party package still reads "Price on enquiry".
  price_min             = 8000,
  price_max             = null,
  price_typical         = null,
  pricing_notes         = 'Starting from ₱8,000. Custom quote available. Final pricing depends on location, bridal party size, schedule and inclusions. A 50% deposit reserves your date.',

  -- Clear fabricated credibility stats (no real numbers yet) so the experience
  -- line ("X years, N weddings") stays hidden rather than showing invented data.
  established_year = null,
  weddings_count   = null,

  -- Editor-written trust line, shown on the contact card. Admin-only on purpose:
  -- a vendor self-asserting "replies in 1 hour" is unverifiable.
  response_time_note = 'Usually replies within 24 hours',

  -- The Vow Edit editorial voice ("Why we picked")
  editor_note = 'Matthew stood out for a clean, timeless approach to bridal beauty. The work feels polished without being heavy, with a strong focus on enhancing the eyes and keeping the overall look elegant, fresh and camera-ready. For anyone planning a Cebu wedding who wants modern glam that still feels personal, Makeup X Matthew is a strong fit.',
  editor_highlights = '[
    {"label":"Best for","value":"Modern Cebu brides"},
    {"label":"Signature look","value":"Clean, timeless, eye-focused glam"},
    {"label":"Vibe","value":"Warm, calm, polished"},
    {"label":"The Vow Edit take","value":"Great fit for brides who want elevated makeup without looking overdone"}
  ]'::jsonb,

  -- About copy
  -- First person: this section is written by the vendor themselves.
  description = 'I create bridal looks that feel clean, refined and personal. My style is all about enhancing each bride''s natural features, with particular attention to the eyes, skin finish and the overall balance of the look. My approach is warm and professional, and I love helping brides feel relaxed, confident and beautifully themselves on one of the most meaningful days of their lives.',
  bio = 'I''m a Cebu-based bridal makeup artist.',

  -- Services offered (flat list)
  services = array[
    'Bridal Makeup',
    'Bridal Trial',
    'Bridesmaids Makeup',
    'Mothers of the Bride/Groom',
    'Prenup / Engagement Shoot Makeup',
    'Event Makeup',
    'On-location Wedding Day Service',
    'Touch-up Service'
  ],

  -- Quick facts. First 4 surface in the one-line spec strip; the rest fill the
  -- "The details" grid. Response time is NOT here (it lives in the action card).
  -- "The essentials" list (makeup-artist fields). Price is generated from the
  -- numeric price fields; Group capacity from works_with/group_capacity below.
  specs = '[
    {"label":"Coverage & travel","value":"Cebu City, Mandaue, Lapu-Lapu, Mactan, Talisay · travels within Cebu"},
    {"label":"Early call times","value":"Available from 3:00 AM"},
    {"label":"Trial makeup","value":"Available"},
    {"label":"Specialties","value":"Soft glam, airbrush, all skin tones"},
    {"label":"Booking terms","value":"50% retainer to reserve, balance on the day"},
    {"label":"Booking status","value":"Now booking 2026 & 2027 weddings"},
    {"label":"Languages","value":"English, Cebuano, Tagalog"}
  ]'::jsonb,
  works_with     = 'solo',
  group_capacity = 5,

  -- Package tiers (prices are placeholder; UI labels them "indicative")
  packages = '[
    {
      "name":"Bridal Makeup",
      "priceLabel":"From ₱8,000",
      "includes":["Wedding day makeup","Skin prep","Lashes included"]
    },
    {
      "name":"Bridal + Trial",
      "priceLabel":"From ₱12,000",
      "includes":["Trial session","Wedding day makeup","Look planning"]
    },
    {
      "name":"Bridal Party",
      "priceLabel":"Price on enquiry",
      "includes":["Bride + bridesmaids/mothers","Custom quote","On-location service"]
    }
  ]'::jsonb,

  -- Vendor Q&A — the four real answers (shown open, as a warm interview).
  faq = '[
    {"q":"What do you love most about weddings?","a":"Being part of one of the most meaningful days in someone''s life."},
    {"q":"How would you describe your style in three words?","a":"Clean. Timeless. Eye-focused."},
    {"q":"What wedding trend are you loving right now?","a":"Classic styling with a modern twist."},
    {"q":"What is your secret to creating an exceptional client experience?","a":"Treating every couple like friends, not just clients, while delivering a professional and seamless experience."}
  ]'::jsonb,

  -- No reviews yet — cleared so the Reviews section stays hidden (no fakes).
  rating       = null,
  review_count = 0,
  reviews      = '[]'::jsonb,

  -- Empty on purpose: shows the branded captioned placeholder gallery. Drop real
  -- portfolio photo URLs here (bridal look, eye makeup, wedding morning, soft
  -- glam, behind the scenes, brushes) to switch to the real gallery.
  images     = '{}',
  -- Placeholder portrait for the "Meet" section (vendor replaces with a headshot).
  team_photo = 'https://picsum.photos/seed/makeupx-matthew-portrait/640/800?grayscale'
  -- Contact channels live in supabase/seed-makeupx-matthew-contact.sql (kept
  -- separate so they aren't tied to this image-clearing showcase reset).
where slug = 'makeupx-matthew';
