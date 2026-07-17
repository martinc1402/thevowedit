-- =====================================================================
-- The Vow Edit — suppliers schema (run this first in the Supabase SQL editor)
-- Mirrors the existing app data shape. Multi-value fields are Postgres
-- arrays / JSONB (no join tables). Public site reads via the anon key under
-- RLS (SELECT only); all writes happen in the Supabase dashboard.
-- =====================================================================

create table if not exists public.suppliers (
  id                          uuid primary key default gen_random_uuid(),
  slug                        text not null unique,           -- stable public URL, never re-derived
  name                        text not null,
  based_in                    text not null,                  -- single home area
  serves_areas                text[] not null default '{}',   -- areas worked in (free text ok)
  categories                  text[] not null default '{}',   -- category slugs
  style_tags                  text[] not null default '{}',
  services                    text[] not null default '{}',   -- flat list of services offered
  price_min                   int,
  price_max                   int,
  currency                    text not null default 'PHP',
  per_service_pricing         jsonb,                          -- { "photographers": {"min":..,"max":..}, ... }
  price_typical               int,                            -- "typical amount couples spend"
  pricing_notes               text,                           -- what's included / pricing FAQ
  price_includes_sc_vat       boolean,                        -- caterer transparency (rate already includes SC + VAT?)
  response_time_note          text,                           -- e.g. "usually replies within a day"
  booking_terms               text,                           -- downpayment %, payment methods
  availability_note           text,                           -- e.g. "Now booking 2026-2027" (inquiry driver)
  established_year            int,                            -- first year of business; UI derives "X years"
  weddings_count              int,                            -- approx. weddings worked (credibility stat)
  faq                         jsonb,                          -- [{ q, a }] supplier-authored Q&A
  specs                       jsonb,                          -- [{ label, value }] scannable facts (coverage, deliverables...)
  short_description           text,                           -- card blurb
  description                 text,                           -- long "About" copy
  editorial_tagline           text,                           -- curator's one-line hero tagline
  editor_note                 text,                           -- curator's "Why we picked" paragraph
  editor_highlights           jsonb,                          -- [{ label, value }] curator highlight chips
  verified                    boolean not null default false,
  featured                    boolean not null default false,
  rating                      numeric,                        -- nullable; null treated as 0 in the UI
  review_count                int not null default 0,
  works_with_overseas_couples boolean not null default false,
  travel_fee_note             text,
  instagram                   text,
  website                     text,
  facebook                    text,
  email                       text,
  phone                       text,
  images                      text[] not null default '{}',   -- Supabase Storage public URLs; [0] = card hero
  packages                    jsonb,                          -- [{ name, priceLabel?, includes[] }]
  reviews                     jsonb,                          -- [{ author, date?, rating, quote }]
  video_url                   text,                           -- optional YouTube/Vimeo reel (nullable)
  team_photo                  text,                           -- optional "meet your supplier" photo URL (nullable)
  bio                         text,                           -- optional short personal intro (nullable)
  location                    text not null default 'Cebu',
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- For databases created before these columns existed: add them idempotently.
alter table public.suppliers add column if not exists video_url text;
alter table public.suppliers add column if not exists team_photo text;
alter table public.suppliers add column if not exists bio text;
alter table public.suppliers add column if not exists price_typical int;
alter table public.suppliers add column if not exists pricing_notes text;
alter table public.suppliers add column if not exists price_includes_sc_vat boolean;
alter table public.suppliers add column if not exists response_time_note text;
alter table public.suppliers add column if not exists booking_terms text;
alter table public.suppliers add column if not exists availability_note text;
alter table public.suppliers add column if not exists established_year int;
alter table public.suppliers add column if not exists weddings_count int;
alter table public.suppliers add column if not exists faq jsonb;
alter table public.suppliers add column if not exists specs jsonb;
-- Editorial / curation fields (The Vow Edit authored; nullable so other vendors
-- render nothing). See supabase/add-editorial-fields.sql for the standalone migration.
alter table public.suppliers add column if not exists services text[] not null default '{}';
alter table public.suppliers add column if not exists editorial_tagline text;
alter table public.suppliers add column if not exists editor_note text;
alter table public.suppliers add column if not exists editor_highlights jsonb;
-- Direct-contact channels (see supabase/add-contact-channels.sql for the standalone migration).
alter table public.suppliers add column if not exists viber text;
alter table public.suppliers add column if not exists whatsapp text;
alter table public.suppliers add column if not exists preferred_channel text;
-- Makeup-artist essentials: structured capacity (see supabase/add-mua-essentials.sql).
alter table public.suppliers add column if not exists works_with text;      -- 'solo' | 'team'
alter table public.suppliers add column if not exists group_capacity int;   -- faces the vendor can cover
-- Structured essentials taxonomy (see supabase/add-essentials-taxonomy.sql).
alter table public.suppliers add column if not exists essentials jsonb;     -- layered typed taxonomy
alter table public.suppliers add column if not exists price_unit text;      -- 'per_event' | 'per_head' | 'per_hour'

-- Contains-query indexes (GIN) for categories / serves_areas array lookups.
create index if not exists suppliers_categories_gin   on public.suppliers using gin (categories);
create index if not exists suppliers_serves_areas_gin on public.suppliers using gin (serves_areas);

-- Keep updated_at fresh on dashboard edits.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------
-- Row Level Security: public SELECT only.
-- No insert/update/delete policies exist, so anon/authenticated cannot write.
-- The service_role key (used only by the dashboard) bypasses RLS for your edits.
-- -----------------------------------------------------------------
alter table public.suppliers enable row level security;

drop policy if exists "Public read access" on public.suppliers;
create policy "Public read access"
  on public.suppliers for select
  to anon, authenticated
  using (true);

-- =====================================================================
-- Storage bucket for supplier photos (public, read-only).
-- You can also create this in the dashboard: Storage → New bucket → "Public".
-- Public bucket => objects are world-readable. No upload policy is added, so the
-- public cannot write; you upload via the dashboard.
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('supplier-images', 'supplier-images', true)
on conflict (id) do nothing;

-- Public URL format to paste into suppliers.images:
--   https://<PROJECT_REF>.supabase.co/storage/v1/object/public/supplier-images/<slug>/1.jpg
-- images[0] is the card hero; the rest fill the profile gallery.
