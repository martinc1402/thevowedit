-- =====================================================================
-- The Vow Edit — founding-supplier skeleton row (run AFTER supplier-auth.sql)
-- Turns the real supplier_application into a claimable, unpublished supplier row
-- plus its private ownership link. The vendor logs in (magic link) and completes
-- the row via /dashboard.
--
-- claim_email is pulled from supplier_applications by business_name, so the
-- applicant's email (PII) stays in the DB and is never written into this
-- committed file. Idempotent: `on conflict do nothing`.
--
-- MAKEUPX MATTHEW ONLY. This file used to also create Camcorder Stories by RR
-- Films; that vendor was removed from the directory (see prune-to-pilot.sql), so
-- re-seeding it here would resurrect a listing we deliberately took down. Their
-- supplier_application row is untouched and still says they applied — deleting a
-- listing does not un-apply someone — so if they come back, add them here again
-- and re-issue a claim code.
--
-- NOTE: `serves_areas` is deliberately NOT seeded. It is now DERIVED from
-- essentials.coverage.areas on save and holds taxonomy KEYS ('cebu-city'), because
-- it is the GIN-indexed array the browse filter queries. Seeding free text like
-- 'All of Cebu' here would reintroduce exactly the drift that fix removed.
--
-- `based_in` IS still set, only because the column is NOT NULL in the schema. The
-- app no longer reads or writes it (it duplicated `location`, which is what the
-- profile actually renders, and the two could silently drift). Mirror `location` so
-- they cannot disagree. To retire it properly the column needs its NOT NULL
-- dropped — see supabase/retire-based-in.sql.
-- =====================================================================

-- 1) MakeupX Matthew — Makeup
insert into public.suppliers
  (slug, name, based_in, categories, location, instagram, short_description,
   published)
values
  ('makeupx-matthew', 'MakeupX Matthew', 'Cebu', array['makeup'], 'Cebu',
   'makeupxmatthew',
   'Bridal and entourage makeup, serving weddings across Cebu.', false)
on conflict (slug) do nothing;

-- 2) Private ownership link: map the supplier row to the applicant's login email
-- so first login auto-claims it. user_id stays null until they sign in.
insert into public.supplier_owners (supplier_id, claim_email)
select s.id, a.email
  from public.suppliers s
  join lateral (
    select email from public.supplier_applications
     where business_name = s.name
     order by created_at asc limit 1
  ) a on true
 where s.slug = 'makeupx-matthew'
on conflict (supplier_id) do nothing;

-- 3) Mark the application as accepted now that the row exists.
update public.supplier_applications
   set status = 'accepted'
 where business_name = 'MakeupX Matthew';
