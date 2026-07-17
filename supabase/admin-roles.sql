-- =====================================================================
-- Admin role, DB-backed.
--
-- Replaces the ADMIN_EMAILS env allowlist as the SOURCE OF TRUTH. The env var
-- survives only as a break-glass path (see src/lib/auth.ts): with an empty table
-- nobody could grant adminness, and there'd be no way back in if the last row
-- were deleted.
--
-- Same lockdown model as supplier_owners / inquiries / claim_attempts:
-- RLS ON with NO policies => anon and authenticated can't read a byte of it;
-- only the service_role (server actions) can.
--
-- NOTE ON ENFORCEMENT: this table records WHO is an admin. It does not enforce
-- anything by itself — every privileged write in the app still goes through the
-- service_role key, which bypasses RLS, and the decision is made in app code
-- (isAdmin()). Moving enforcement into Postgres would mean real RLS policies on
-- every write path, which is deliberately out of scope.
--
-- Roles do NOT go on auth.users: that table is Supabase-managed. A separate
-- public table keyed on auth.users(id) is Supabase's documented RBAC pattern.
--
-- Safe to run more than once.
-- =====================================================================
create table if not exists public.user_roles (
  -- Keyed on the auth user id, not the email: emails are mutable, and this way
  -- the grant cascades away with the account.
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
grant all privileges on table public.user_roles to service_role;
-- anon/authenticated are intentionally granted nothing.

-- ---------------------------------------------------------------------
-- Seed the first admin (chicken-and-egg: adminness can only be granted by an
-- admin). No-ops if the account hasn't signed up yet, or already has the role.
-- ---------------------------------------------------------------------
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where lower(email) = 'martinc140291@gmail.com'
on conflict (user_id) do nothing;

-- Grant another admin later:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where lower(email) = 'someone@example.com'
--   on conflict (user_id) do nothing;
--
-- Revoke (takes effect on their next request — no redeploy):
--   delete from public.user_roles
--   where user_id = (select id from auth.users where lower(email) = 'someone@example.com');
