-- =====================================================================
-- The Vow Edit - inquiries schema (run in the Supabase SQL editor)
-- Private lead data: couples' contact details + their message to a supplier.
-- Inquiries route THROUGH The Vow Edit (we forward to suppliers manually for now),
-- so this table is written ONLY by the server-side inquiry action using the
-- service_role key. RLS is enabled with NO policies, so anon/authenticated
-- (the public site) can neither read nor write it. You read it in the dashboard.
-- =====================================================================

create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  supplier_id   uuid references public.suppliers(id) on delete set null, -- keep the lead even if a supplier is removed
  supplier_slug text not null,                                           -- denormalised so the lead is readable on its own
  couple_name   text not null,
  couple_email  text not null,
  wedding_date  date,                                                    -- optional
  message       text not null,
  status        text not null default 'new'                             -- workflow: new / forwarded / closed (free text; update as you go)
);

create index if not exists inquiries_created_at_idx  on public.inquiries (created_at desc);
create index if not exists inquiries_supplier_id_idx on public.inquiries (supplier_id);
create index if not exists inquiries_status_idx      on public.inquiries (status);

-- RLS ON, NO policies => the public (anon/authenticated) role can neither SELECT
-- nor INSERT/UPDATE/DELETE. The service_role key (server-only) bypasses RLS, so
-- only the inquiry server action writes here. Do NOT add an anon insert policy.
alter table public.inquiries enable row level security;

-- The service_role bypasses RLS but still needs table privileges. Supabase
-- usually grants these automatically; we grant explicitly so the server-side
-- insert works on every project. anon/authenticated are intentionally NOT
-- granted anything, so the public still cannot read or write this table.
grant all privileges on table public.inquiries to service_role;
