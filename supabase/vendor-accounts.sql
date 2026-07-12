-- =====================================================================
-- The Vow Edit — vendor accounts: claim codes + moderation (run in SQL editor)
-- Extends the email-match ownership model (supabase/supplier-auth.sql) with
-- admin-issued CLAIM CODES, a durable claim-attempt log for rate limiting, and a
-- pending_changes buffer for the approval/moderation flow. Idempotent: safe to
-- re-run. All writes go through service-role server actions (RLS stays locked).
-- =====================================================================

-- 1) Claim-code columns on the ownership row. One row per supplier (supplier_id
-- is the PK), so a supplier has at most one active code. The code itself is
-- stored HASHED (scrypt, salt:hex) in the app — never in plaintext. user_id is
-- the claimer (already present); claim_email + claimed_at record the claim.
alter table public.supplier_owners
  add column if not exists claim_code_hash       text,
  add column if not exists claim_code_expires_at timestamptz,
  add column if not exists claimed_at            timestamptz;

-- 2) Draft buffer for approval-required vendor edits (bio, tagline, photos, Q&A,
-- display name, custom essentials). Vendor writes land here; an admin approves
-- (copy -> live) or rejects (discard). Null/absent = nothing pending. Safe to be
-- world-readable? NO — it can contain unpublished draft copy, so it is only ever
-- read via the service role (suppliers RLS is select-only for the PUBLISHED row's
-- live columns; pending_changes is never selected by the public page).
alter table public.suppliers
  add column if not exists pending_changes jsonb;

-- 3) Durable claim-attempt log — powers per-profile rate limiting (max 5 failed
-- / hour) and an audit trail. Unlike the in-memory limiter used elsewhere, this
-- survives cold starts and is shared across instances. RLS ON, NO policies =>
-- only the service role (server actions) can read/write it.
create table if not exists public.claim_attempts (
  id          uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  ip          text,
  succeeded   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists claim_attempts_supplier_time_idx
  on public.claim_attempts (supplier_id, created_at desc);

alter table public.claim_attempts enable row level security;
grant all privileges on table public.claim_attempts to service_role;
-- anon/authenticated get nothing: the public can never read the attempt log.
