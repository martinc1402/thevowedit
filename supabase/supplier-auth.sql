-- =====================================================================
-- The Vow Edit — supplier self-service auth (run in the SQL editor)
-- Lets a real Supabase Auth user (magic link) own and edit their own supplier
-- row via the /dashboard wizard. Identity is Supabase Auth; WRITES still go
-- through an ownership-checked server action using the service_role key (see
-- src/lib/actions/profile.ts), so RLS on `suppliers` stays SELECT-only.
-- Idempotent: safe to re-run.
-- =====================================================================

-- 1) Public, vendor-controlled publish toggle on suppliers. This is the ONLY
-- column we add to the public table. Skeleton rows start unpublished; the public
-- profile page (getSupplierBySlug) only returns published rows, so an empty
-- profile is never exposed until the vendor hits Publish. Safe to be world-
-- readable (it is just a boolean).
alter table public.suppliers
  add column if not exists published boolean not null default false;

-- 2) Ownership + claim link lives in a SEPARATE, RLS-locked table — NOT on
-- `suppliers`. The suppliers RLS policy is `select using (true)` for anon, so
-- anything on that table is world-readable; the applicant's login email and the
-- auth user_id are sensitive, so they must never sit there. Same lockdown model
-- as `inquiries` / `supplier_applications`: RLS ON, NO policies => only the
-- service_role (server actions) can read or write it.
create table if not exists public.supplier_owners (
  supplier_id  uuid primary key references public.suppliers(id) on delete cascade,
  user_id      uuid unique references auth.users(id),   -- null until first login claims it
  claim_email  text not null,                           -- applicant login email (private)
  created_at   timestamptz not null default now()
);

-- Claim lookups match on the (lowercased) applicant email.
create index if not exists supplier_owners_claim_email_idx
  on public.supplier_owners (lower(claim_email));

alter table public.supplier_owners enable row level security;
grant all privileges on table public.supplier_owners to service_role;
-- anon/authenticated are intentionally granted nothing: the public can never
-- read the ownership link or the private claim email.

-- NOTE (dashboard settings, not SQL):
--   Authentication → Providers → Email: enable "Email" with magic link.
--   Authentication → URL Configuration: set Site URL and add
--   `<site>/auth/callback` and `http://localhost:3000/auth/callback`
--   to the Redirect URLs allow-list.
