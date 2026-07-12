-- =====================================================================
-- The Vow Edit — Makeup X Matthew: "presence" links (safe seed)
--
-- Presence links are browsing destinations (Facebook Page, website), shown as a
-- quiet tier under the contact actions. The Facebook Page link derives from the
-- existing `facebook` handle (already seeded), so only `website` needs a value.
-- Placeholder website for now — replace with the vendor's real site. Only touches
-- website.
-- =====================================================================

update public.suppliers
set website = 'https://makeupxmatthew.ph'
where slug = 'makeupx-matthew';
