-- =====================================================================
-- The Vow Edit — founding-supplier skeleton rows (run AFTER supplier-auth.sql)
-- Turns the two real supplier_applications into claimable, unpublished supplier
-- rows plus their private ownership link. The vendors log in (magic link) and
-- complete the rows via /dashboard.
--
-- claim_email is pulled from supplier_applications by business_name, so the
-- applicant's email (PII) stays in the DB and is never written into this
-- committed file. Idempotent: `on conflict do nothing`.
-- =====================================================================

-- 1) MakeupX Matthew — Makeup
insert into public.suppliers
  (slug, name, based_in, serves_areas, categories, location, instagram,
   short_description, published)
values
  ('makeupx-matthew', 'MakeupX Matthew', 'Cebu', array['All of Cebu'],
   array['makeup'], 'Cebu', 'makeupxmatthew',
   'Bridal and entourage makeup, serving weddings across Cebu.', false)
on conflict (slug) do nothing;

-- 2) Camcorder Stories by RR Films — Videographers
insert into public.suppliers
  (slug, name, based_in, serves_areas, categories, location, instagram,
   short_description, published)
values
  ('camcorder-stories-rr-films', 'Camcorder Stories by RR Films', 'Cebu',
   array['All of Cebu'], array['videographers'], 'Cebu', 'camcorderstories.rr',
   'Wedding films and same-day edits, covering weddings across Cebu.', false)
on conflict (slug) do nothing;

-- 3) Private ownership links: map each supplier row to the applicant's login
-- email so first login auto-claims it. user_id stays null until they sign in.
insert into public.supplier_owners (supplier_id, claim_email)
select s.id, a.email
  from public.suppliers s
  join lateral (
    select email from public.supplier_applications
     where business_name = s.name
     order by created_at asc limit 1
  ) a on true
 where s.slug in ('makeupx-matthew', 'camcorder-stories-rr-films')
on conflict (supplier_id) do nothing;

-- 4) Mark the two applications as accepted now that their rows exist.
update public.supplier_applications
   set status = 'accepted'
 where business_name in ('MakeupX Matthew', 'Camcorder Stories by RR Films');
