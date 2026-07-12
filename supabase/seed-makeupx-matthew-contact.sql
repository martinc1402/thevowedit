-- =====================================================================
-- The Vow Edit — Makeup X Matthew: direct-contact channels (safe seed)
-- Run AFTER supabase/add-contact-channels.sql.
--
-- Populates only the contact fields used by the profile's sticky contact card.
-- Unlike seed-makeupx-matthew-showcase.sql, this does NOT touch images or
-- team_photo, so it will not wipe his gallery.
--
-- Replace the placeholder values below with Matthew's real details before
-- running. Leave any field NULL to hide that channel. preferred_channel picks
-- the primary (maroon) button: instagram | messenger | viber | phone |
-- whatsapp | email.
-- =====================================================================

update public.suppliers set
  instagram         = 'makeupxmatthew',      -- Instagram username (no @)
  facebook          = 'makeupxmatthew',      -- Facebook / Messenger username (drives m.me link)
  phone             = '+639171234567',       -- call / SMS (international format)
  whatsapp          = '+639171234567',       -- WhatsApp number (international)
  viber             = '+639171234567',       -- Viber number (international)
  email             = 'hello@makeupxmatthew.ph',
  preferred_channel = 'instagram'
where slug = 'makeupx-matthew';
