create or replace function dw.run_source_record_matching(
  p_ingestion_run_id bigint,
  p_min_similarity real default 0.45,
  p_ambiguity_gap real default 0.08
)
returns table(
  manual_matches integer,
  exact_matches integer,
  alias_matches integer,
  fuzzy_matches integer,
  ambiguous_matches integer,
  unresolved_remaining integer
)
language plpgsql
as $$
declare
  v_manual_count integer := 0;
  v_exact_count integer := 0;
  v_alias_count integer := 0;
  v_fuzzy_count integer := 0;
  v_ambiguous_count integer := 0;
  v_unresolved_count integer := 0;
begin
  if not exists (
    select 1
    from dw.ingestion_runs ir
    where ir.ingestion_run_id = p_ingestion_run_id
  ) then
    raise exception 'ingestion_run_id % does not exist in dw.ingestion_runs', p_ingestion_run_id;
  end if;

  if p_min_similarity < 0 or p_min_similarity > 1 then
    raise exception 'p_min_similarity must be between 0 and 1';
  end if;

  if p_ambiguity_gap < 0 or p_ambiguity_gap > 1 then
    raise exception 'p_ambiguity_gap must be between 0 and 1';
  end if;

  update dw.source_records sr
  set
    canonical_food_id = mo.canonical_food_id,
    resolution_status = 'matched',
    match_method = 'manual',
    match_score = 1.000,
    rejection_reason = null
  from dw.manual_overrides mo
  where sr.ingestion_run_id = p_ingestion_run_id
    and sr.resolution_status = 'unresolved'
    and sr.source_system_id = mo.source_system_id
    and sr.external_row_id = mo.external_row_id
    and (mo.expires_at is null or mo.expires_at > now());
  get diagnostics v_manual_count = row_count;

  update dw.source_records sr
  set
    canonical_food_id = fi.canonical_food_id,
    resolution_status = 'matched',
    match_method = 'exact',
    match_score = 1.000,
    rejection_reason = null
  from dw.food_items fi
  where sr.ingestion_run_id = p_ingestion_run_id
    and sr.resolution_status = 'unresolved'
    and dw.normalize_food_key(sr.raw_food_name) = fi.canonical_key;
  get diagnostics v_exact_count = row_count;

  update dw.source_records sr
  set
    canonical_food_id = fa.canonical_food_id,
    resolution_status = 'matched',
    match_method = 'alias',
    match_score = greatest(0.800::numeric, fa.confidence),
    rejection_reason = null
  from dw.food_aliases fa
  where sr.ingestion_run_id = p_ingestion_run_id
    and sr.resolution_status = 'unresolved'
    and dw.normalize_food_key(sr.raw_food_name) = fa.alias_key;
  get diagnostics v_alias_count = row_count;

  with candidates as (
    select
      sr.source_record_pk,
      fa.canonical_food_id,
      similarity(coalesce(sr.raw_food_name, ''), fa.alias_text) as sim,
      fa.confidence
    from dw.source_records sr
    join dw.food_aliases fa
      on coalesce(sr.raw_food_name, '') % fa.alias_text
    where sr.ingestion_run_id = p_ingestion_run_id
      and sr.resolution_status = 'unresolved'
  ),
  ranked as (
    select
      source_record_pk,
      canonical_food_id,
      sim,
      confidence,
      row_number() over (
        partition by source_record_pk
        order by sim desc, confidence desc, canonical_food_id
      ) as rn,
      lead(sim) over (
        partition by source_record_pk
        order by sim desc, confidence desc, canonical_food_id
      ) as second_sim
    from candidates
  )
  update dw.source_records sr
  set
    canonical_food_id = r.canonical_food_id,
    resolution_status = 'matched',
    match_method = 'fuzzy',
    match_score = round(r.sim::numeric, 3),
    rejection_reason = null
  from ranked r
  where sr.source_record_pk = r.source_record_pk
    and sr.ingestion_run_id = p_ingestion_run_id
    and sr.resolution_status = 'unresolved'
    and r.rn = 1
    and r.sim >= p_min_similarity
    and (r.second_sim is null or (r.sim - r.second_sim) >= p_ambiguity_gap);
  get diagnostics v_fuzzy_count = row_count;

  with candidates as (
    select
      sr.source_record_pk,
      fa.canonical_food_id,
      similarity(coalesce(sr.raw_food_name, ''), fa.alias_text) as sim,
      fa.confidence
    from dw.source_records sr
    join dw.food_aliases fa
      on coalesce(sr.raw_food_name, '') % fa.alias_text
    where sr.ingestion_run_id = p_ingestion_run_id
      and sr.resolution_status = 'unresolved'
  ),
  ranked as (
    select
      source_record_pk,
      canonical_food_id,
      sim,
      confidence,
      row_number() over (
        partition by source_record_pk
        order by sim desc, confidence desc, canonical_food_id
      ) as rn,
      lead(sim) over (
        partition by source_record_pk
        order by sim desc, confidence desc, canonical_food_id
      ) as second_sim
    from candidates
  )
  update dw.source_records sr
  set
    resolution_status = 'ambiguous',
    match_method = 'fuzzy',
    match_score = round(r.sim::numeric, 3),
    rejection_reason = 'Top fuzzy candidates too close; manual review required'
  from ranked r
  where sr.source_record_pk = r.source_record_pk
    and sr.ingestion_run_id = p_ingestion_run_id
    and sr.resolution_status = 'unresolved'
    and r.rn = 1
    and r.sim >= p_min_similarity
    and r.second_sim is not null
    and (r.sim - r.second_sim) < p_ambiguity_gap;
  get diagnostics v_ambiguous_count = row_count;

  select count(*)
  into v_unresolved_count
  from dw.source_records sr
  where sr.ingestion_run_id = p_ingestion_run_id
    and sr.resolution_status = 'unresolved';

  return query
  select
    v_manual_count,
    v_exact_count,
    v_alias_count,
    v_fuzzy_count,
    v_ambiguous_count,
    v_unresolved_count;
end;
$$;
