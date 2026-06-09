-- =====================================================================
-- The Vow Edit - supplier_applications schema (run in the Supabase SQL editor)
-- Pre-launch founding-supplier applications: a business's contact details +
-- the consent they gave to be listed. This is mildly sensitive PII (names,
-- emails, mobile numbers), so it is locked down the same way as `inquiries`:
-- written ONLY by the server-side application action using the service_role
-- key. RLS is enabled with NO policies, so anon/authenticated (the public
-- site) can neither read nor write it. You read it in the dashboard.
-- =====================================================================

create table if not exists public.supplier_applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  business_name text not null,
  category      text not null,
  area_served   text not null,                 -- comma-joined summary of areas_served, e.g. "Cebu City, Mactan"
  areas_served  text[] not null default '{}',  -- all area labels served, or {"All of Cebu"} for island-wide
  province      text not null default 'cebu',  -- launch scope slug; expansion adds more scopes
  contact_name  text not null,
  email         text not null,
  mobile        text not null,
  link          text,                          -- optional website / instagram
  price_range   text,                          -- optional
  status        text not null default 'pending', -- workflow: pending / reviewing / accepted / declined
  consent_given boolean not null,              -- must be true; enforced in the server action
  consent_at    timestamptz not null           -- set server-side at insert time
);

create index if not exists supplier_applications_created_at_idx on public.supplier_applications (created_at desc);
create index if not exists supplier_applications_status_idx     on public.supplier_applications (status);

-- RLS ON, NO policies => the public (anon/authenticated) role can neither SELECT
-- nor INSERT/UPDATE/DELETE. The service_role key (server-only) bypasses RLS, so
-- only the application server action writes here. Do NOT add an anon insert
-- policy: the public must never read, edit, or list applicant data.
alter table public.supplier_applications enable row level security;

-- The service_role bypasses RLS but still needs table privileges. Supabase
-- usually grants these automatically; we grant explicitly so the server-side
-- insert works on every project. anon/authenticated are intentionally NOT
-- granted anything, so the public still cannot read or write this table.
grant all privileges on table public.supplier_applications to service_role;
