-- =====================================================================
-- The Vow Edit — supplier seed (run AFTER schema.sql, in the Supabase SQL editor)
-- Migrates all 8 current suppliers verbatim from the old mock file, with
-- IDENTICAL slugs so existing URLs don't change. images[] start empty so the
-- neutral placeholder shows until you upload to Storage and paste public URLs.
-- Re-runnable: `on conflict (slug) do nothing` skips rows that already exist.
-- =====================================================================

insert into public.suppliers
  (slug, name, based_in, serves_areas, categories, style_tags,
   price_min, price_max, per_service_pricing, short_description, description,
   verified, featured, rating, review_count, works_with_overseas_couples,
   travel_fee_note, instagram, website, facebook, email, images, packages, reviews)
values
  -- 1) Lumière Studios — verified + featured, 3 package tiers
  ('lumiere-studios', 'Lumière Studios', 'Cebu City',
   '{"Cebu City","Mactan","Mandaue"}', '{"photographers"}', '{"Fine art","Editorial"}',
   60000, 120000, null,
   'Fine-art coverage with a calm, editorial eye and unhurried full-day storytelling.',
   'Lumière Studios is a Cebu City team known for quiet, editorial coverage that lets the day breathe. They shoot full-day weddings across Cebu with a two-shooter setup, hand-finished color grading, and heirloom albums. Couples planning from abroad get a clear timeline and a private online gallery within four weeks.',
   true, true, 4.9, 132, true,
   null, '@lumierestudios', null, null, 'hello@lumierestudios.ph', '{}',
   '[{"name":"Half-day","priceLabel":"₱60k","includes":["6 hours of coverage","One lead photographer","Private online gallery","120 edited photos"]},{"name":"Full-day","priceLabel":"₱90k","includes":["10 hours of coverage","Two photographers","Engagement session","400 edited photos"]},{"name":"Full-day + album","priceLabel":"₱120k","includes":["12 hours of coverage","Two photographers","Hand-bound heirloom album","All edited photos","Same-day slideshow"]}]'::jsonb,
   null),

  -- 2) Habagat Films & Photo — dual-service, per-service pricing, travel-fee note
  ('habagat-films-photo', 'Habagat Films & Photo', 'Mactan',
   '{"Mactan","Lapu-Lapu","Cebu City"}', '{"photographers","videographers"}', '{"Documentary","Candid","Cinematic film"}',
   45000, 110000,
   '{"photographers":{"min":45000,"max":90000},"videographers":{"min":55000,"max":110000}}'::jsonb,
   'Documentary photo and film team that shoots the day as it really happens.',
   'Habagat is a Mactan-based documentary team offering both photography and videography, so couples can book one trusted crew for stills and film. They stay out of the way and catch the real moments, from the morning prep to the last dance, and pair their photo coverage with cinematic same-day edits and full wedding films. They specialise in island and resort weddings and travel across Cebu for the right light.',
   false, false, 4.8, 97, true,
   'Travel fee may apply outside Mactan', '@habagatfilms', null, null, 'book@habagat.ph', '{}',
   null, null),

  -- 3) Tula Photography — featured
  ('tula-photography', 'Tula Photography', 'Lapu-Lapu',
   '{"Lapu-Lapu","Mactan"}', '{"photographers"}', '{"Light & airy","Romantic"}',
   35000, 70000, null,
   'Soft, light-and-airy frames for couples who want a romantic, natural look.',
   'Tula is a small Lapu-Lapu studio with a soft, light-and-airy style and a gentle, easy presence on the day. A favourite for intimate ceremonies and elopements that still want beautiful, romantic frames.',
   false, true, 4.7, 54, false,
   null, '@tula.photo', null, null, 'hi@tulaphoto.ph', '{}',
   null, null),

  -- 4) Anila Studio — verified
  ('anila-studio', 'Anila Studio', 'Cebu City',
   '{"Cebu City","Mandaue"}', '{"photographers"}', '{"Classic","Timeless"}',
   50000, 110000, null,
   'Classic, timeless portraiture with meticulous lighting and relaxed posing.',
   'Anila Studio brings a classic, timeless approach to Cebu City weddings, with meticulous lighting and warm, relaxed direction that flatters everyone in the room. Equally at home in cathedrals and hotel ballrooms.',
   true, false, 5.0, 88, false,
   null, '@anilastudio', null, null, 'studio@anila.ph', '{}',
   null, null),

  -- 5) Saltlight Collective
  ('saltlight-collective', 'Saltlight Collective', 'Mandaue',
   '{"Mandaue","Cebu City"}', '{"photographers"}', '{"Moody","Documentary"}',
   40000, 85000, null,
   'Moody, cinematic coverage with rich tones and honest candids.',
   'Saltlight is a Mandaue collective with a moody, cinematic look: rich tones, deep contrast, and honest candids. A strong fit for evening receptions and couples who love a dramatic edit.',
   false, false, 4.6, 41, false,
   null, '@saltlight.co', null, null, 'hello@saltlight.ph', '{}',
   null, null),

  -- 6) Kasal Frames — featured
  ('kasal-frames', 'Kasal Frames', 'Mactan',
   '{"Mactan","Lapu-Lapu"}', '{"photographers"}', '{"Editorial","Fine art"}',
   55000, 115000, null,
   'Editorial direction and gallery-grade albums, ideal for beach and resort weddings.',
   'Kasal Frames pairs editorial direction with gallery-grade albums, built for beach and resort weddings around Mactan. Expect confident posing guidance and a polished, magazine-style final set.',
   false, true, 4.9, 73, false,
   null, '@kasalframes', null, null, 'studio@kasalframes.ph', '{}',
   null, null),

  -- 7) Emm Tancinco Photography — REAL record: 13 areas, range-only pricing,
  --    travel-fee note, NULL rating / 0 reviews, no images, external links only
  ('emm-tancinco-photography', 'Emm Tancinco Photography', 'Cebu City',
   '{"Cebu City","Mactan","Lapu-Lapu","Mandaue","Talisay","Naga","Carcar","Danao","Toledo","Bantayan Island","Camotes Islands","Dumaguete","Bohol"}',
   '{"photographers"}', '{"Candid","Documentary"}',
   42000, 90000, null,
   'Warm, candid wedding coverage that travels across Cebu and the wider Visayas.',
   'Emm Tancinco is a Cebu City wedding photographer who travels widely across Cebu and the surrounding islands, from Bantayan and Camotes to Bohol and Dumaguete. The style is warm and candid, built around the real moments of the day rather than stiff set-ups. Pricing is a single all-in range; a travel fee may apply for weddings outside Cebu City.',
   false, false, null, 0, true,
   'Travel fee may apply outside Cebu City', '@emmtancinco', 'https://emmtancinco.com', 'emmtancincophotography', null, '{}',
   null, null),

  -- 8) Cordova Light & Co — serves ONLY its base area; 2 reviews
  ('cordova-light-co', 'Cordova Light & Co', 'Lapu-Lapu',
   '{"Lapu-Lapu"}', '{"photographers"}', '{"Natural light","Relaxed"}',
   38000, 72000, null,
   'A small island studio sticking close to home, shooting Lapu-Lapu weddings only.',
   'Cordova Light & Co is a small Lapu-Lapu studio that keeps things local, shooting weddings on the island and nowhere else. A natural-light look and an easy, relaxed pace on the day.',
   false, false, 4.7, 19, false,
   null, '@cordovalight', null, null, 'hello@cordovalight.ph', '{}',
   null,
   '[{"author":"Rhea and Marlon","date":"March 2026","rating":5,"quote":"Knew every corner of our venue and made the whole day feel effortless."},{"author":"Joy delos Santos","date":"January 2026","rating":4.5,"quote":"Lovely, soft photos and so easy to work with from start to finish."}]'::jsonb)

on conflict (slug) do nothing;

-- =====================================================================
-- Content creators — mock records for the new `content-creators` category.
-- Social-first coverage (Reels/TikTok, same-day clips, photo dumps), a service
-- distinct from cinematic videography. Includes one pure creator, one sparse
-- creator (thin-state test), and one video+content DUAL supplier that must
-- appear on BOTH /videographers/* and /content-creators/* with one profile.
-- Mock data only — invented names, for testing the category plumbing.
-- =====================================================================
insert into public.suppliers
  (slug, name, based_in, serves_areas, categories, style_tags,
   price_min, price_max, per_service_pricing, short_description, description,
   verified, featured, rating, review_count, works_with_overseas_couples,
   travel_fee_note, instagram, website, facebook, email, images, packages, reviews)
values
  -- A) Habilin Studio — pure content creator, verified, with packages
  ('habilin-studio', 'Habilin Studio', 'Cebu City',
   '{"Cebu City","Mactan","Mandaue"}', '{"content-creators"}', '{"Reels & TikTok","Same-day social","Candid"}',
   18000, 45000, null,
   'Social-first wedding content: vertical Reels, TikTok, and same-day clips to post while the night is still happening.',
   'Habilin is a Cebu City content team built for couples who live online. Instead of a cinematic film weeks later, they capture the day phone-first and candid, then cut vertical Reels and TikToks on site so you can share a same-day teaser before the reception ends. Expect behind-the-scenes moments, a full photo dump, and clips sized for every platform.',
   true, false, 4.8, 23, true,
   null, '@habilin.social', null, null, 'hello@habilin.ph', '{}',
   '[{"name":"Same-day social","priceLabel":"₱18k","includes":["6 hours of coverage","One content creator","3 vertical Reels delivered same day","Full photo dump (200+ clips & stills)"]},{"name":"Full social package","priceLabel":"₱32k","includes":["10 hours of coverage","Two content creators","6 Reels / TikToks","Behind-the-scenes story set","48-hour delivery"]}]'::jsonb,
   null),

  -- B) Kuwentos Reels & Film — DUAL videographer + content creator, per-service
  --    pricing, travel-fee note. Tests one profile on two category pages.
  ('kuwentos-reels-film', 'Kuwentos Reels & Film', 'Mactan',
   '{"Mactan","Lapu-Lapu","Cebu City"}', '{"videographers","content-creators"}', '{"Cinematic film","Same-day reels","Behind the scenes"}',
   25000, 95000,
   '{"videographers":{"min":55000,"max":95000},"content-creators":{"min":25000,"max":50000}}'::jsonb,
   'One crew for both the cinematic film and the social-first Reels, so your highlight and your same-day teaser match.',
   'Kuwentos is a Mactan crew that shoots both worlds at once: a cinematic wedding film for the keepsake, and phone-first vertical content for the feed. Booking them for both means the same team that frames your highlight reel also cuts the same-day TikTok teaser, so the look stays consistent from the grid to the gallery. They travel across Cebu and love island and resort weddings.',
   false, false, 4.7, 38, true,
   'Travel fee may apply outside Mactan', '@kuwentos.co', null, null, 'team@kuwentos.ph', '{}',
   null, null),

  -- C) Pasalubong Content Co — sparse creator: null rating, 0 reviews, range only
  ('pasalubong-content-co', 'Pasalubong Content Co', 'Mandaue',
   '{"Mandaue","Cebu City"}', '{"content-creators"}', '{"Photo dump","Candid"}',
   15000, 38000, null,
   'A small Mandaue content studio for candid photo dumps and quick social clips.',
   'Pasalubong Content Co is a small Mandaue studio focused on candid, unposed coverage: the in-between moments, the dance floor, the photo dump your guests actually want to repost. A relaxed, phone-first approach for couples who care more about the feed than a formal film.',
   false, false, null, 0, false,
   null, '@pasalubong.content', null, null, 'hi@pasalubong.ph', '{}',
   null, null)

on conflict (slug) do nothing;
