-- =====================================================================
-- Backfill: serves_areas is now DERIVED from essentials.coverage.areas.
--
-- It used to be free text and had gone stale — it held "Mactan", which the taxonomy
-- explicitly rejects (Mactan is inside Lapu-Lapu), and it disagreed with the coverage
-- chips the vendor actually ticked. Nothing rendered it, so nobody noticed.
--
-- It is now the GIN-indexed array the browse filter queries
-- (/vendors?area=cebu-city), and updateMyProfile rewrites it on every essentials
-- save. This backfills the vendors who existed before that rule, so the filter works
-- for them without waiting for their next save.
--
-- Stores the taxonomy KEYS ('cebu-city'), not the display labels: the column is
-- never rendered, and keys are what the URL carries, so the filter is an exact match.
--
-- Safe to run more than once.
-- =====================================================================
update public.suppliers
set serves_areas = coalesce(
  (
    select array_agg(value::text)
    from jsonb_array_elements_text(essentials -> 'coverage' -> 'areas') as value
  ),
  '{}'::text[]
)
where essentials is not null;
