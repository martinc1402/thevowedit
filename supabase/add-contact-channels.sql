-- =====================================================================
-- The Vow Edit — direct-contact channel fields migration
-- Run against an existing suppliers table to add the direct-contact fields
-- used by the profile's sticky contact card. Idempotent.
--
-- The profile drops the in-platform enquiry flow in favour of direct contact.
-- viber / whatsapp hold international phone numbers; preferred_channel names the
-- vendor's preferred primary channel (one of: instagram, messenger, viber,
-- phone, whatsapp, email). All nullable + data-driven, so a vendor missing a
-- channel simply doesn't render it.
-- =====================================================================

alter table public.suppliers add column if not exists viber text;             -- Viber number (international)
alter table public.suppliers add column if not exists whatsapp text;          -- WhatsApp number (international)
alter table public.suppliers add column if not exists preferred_channel text; -- preferred primary channel key
