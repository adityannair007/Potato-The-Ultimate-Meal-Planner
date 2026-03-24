begin;

create schema if not exists dw;

create extension if not exists pg_trgm;

create table if not exists dw.source_systems (
  source_system_id bigserial primary key,
  source_name text not null unique,
  source_type text not null,
  source_priority smallint not null,
  active boolean not null default true,
  refresh_frequency text,
  created_at timestamptz not null default now(),
  check (source_type in ('database', 'api', 'file')),
  check (source_priority between 1 and 100)
);

create table if not exists dw.food_items (
  canonical_food_id bigserial primary key,
  canonical_name text not null,
  canonical_key text not null unique,
  food_group text,
  state text not null default 'active',
  merged_into_food_id bigint null references dw.food_items(canonical_food_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(trim(canonical_name)) > 0),
  check (state in ('active', 'deprecated', 'merged')),
  check ((state <> 'merged') or (merged_into_food_id is not null))
);

create table if not exists dw.food_aliases (
  alias_id bigserial primary key,
  canonical_food_id bigint not null references dw.food_items(canonical_food_id) on delete cascade,
  alias_text text not null,
  alias_key text not null,
  locale text not null default 'en',
  alias_type text not null default 'synonym',
  confidence numeric(4,3) not null default 1.000,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  check (alias_type in ('exact', 'synonym', 'transliteration', 'brand')),
  check (confidence between 0 and 1),
  unique (canonical_food_id, alias_key, locale)
);

create unique index if not exists ux_food_aliases_primary_per_locale
  on dw.food_aliases(canonical_food_id, locale)
  where is_primary = true;

create table if not exists dw.nutrition_facts (
  nutrition_fact_id bigserial primary key,
  canonical_food_id bigint not null references dw.food_items(canonical_food_id),
  source_system_id bigint not null references dw.source_systems(source_system_id),
  source_row_id text,
  basis_amount numeric(8,3) not null default 100,
  basis_unit text not null default 'g',
  energy_kcal numeric(8,3) not null,
  protein_g numeric(8,3),
  carbs_g numeric(8,3),
  fat_g numeric(8,3),
  fiber_g numeric(8,3),
  sugar_g numeric(8,3),
  sodium_mg numeric(10,3),
  quality_tier text not null default 'medium',
  effective_from date not null default current_date,
  effective_to date,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  check (basis_amount > 0),
  check (basis_unit in ('g', 'ml', 'serving')),
  check (energy_kcal between 0 and 900),
  check (protein_g is null or protein_g between 0 and 100),
  check (carbs_g is null or carbs_g between 0 and 100),
  check (fat_g is null or fat_g between 0 and 100),
  check (fiber_g is null or fiber_g between 0 and 100),
  check (sugar_g is null or sugar_g between 0 and 100),
  check (sodium_mg is null or sodium_mg between 0 and 100000),
  check (quality_tier in ('high', 'medium', 'low')),
  check (effective_to is null or effective_to >= effective_from)
);

create unique index if not exists ux_nutrition_facts_current_per_food
  on dw.nutrition_facts(canonical_food_id)
  where is_current = true;

create table if not exists dw.food_density (
  density_id bigserial primary key,
  canonical_food_id bigint not null references dw.food_items(canonical_food_id) on delete cascade,
  from_unit text not null,
  to_unit text not null,
  factor numeric(12,6) not null,
  size_label text,
  confidence numeric(4,3) not null default 0.800,
  source_system_id bigint references dw.source_systems(source_system_id),
  created_at timestamptz not null default now(),
  check (from_unit in ('piece', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 'ml', 'g')),
  check (to_unit in ('g', 'ml', 'piece')),
  check (factor > 0),
  check (confidence between 0 and 1)
);

CREATE UNIQUE INDEX ON dw.food_density (
  canonical_food_id,
  from_unit,
  to_unit,
  COALESCE(size_label, '')
);

create table if not exists dw.ingestion_runs (
  ingestion_run_id bigserial primary key,
  source_system_id bigint not null references dw.source_systems(source_system_id),
  run_type text not null,
  status text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  rows_read integer not null default 0,
  rows_inserted integer not null default 0,
  rows_updated integer not null default 0,
  rows_rejected integer not null default 0,
  error_summary jsonb,
  triggered_by text,
  check (run_type in ('full', 'incremental', 'backfill')),
  check (status in ('queued', 'running', 'succeeded', 'failed', 'partial')),
  check (rows_read >= 0 and rows_inserted >= 0 and rows_updated >= 0 and rows_rejected >= 0),
  check (ended_at is null or ended_at >= started_at)
);

create table if not exists dw.source_records (
  source_record_pk bigserial primary key,
  ingestion_run_id bigint not null references dw.ingestion_runs(ingestion_run_id) on delete cascade,
  source_system_id bigint not null references dw.source_systems(source_system_id),
  external_row_id text not null,
  record_hash text not null,
  raw_payload jsonb not null,
  raw_food_name text,
  canonical_food_id bigint references dw.food_items(canonical_food_id),
  resolution_status text not null default 'unresolved',
  match_method text,
  match_score numeric(4,3),
  rejection_reason text,
  created_at timestamptz not null default now(),
  check (resolution_status in ('unresolved', 'matched', 'ambiguous', 'rejected')),
  check (match_method is null or match_method in ('exact', 'alias', 'fuzzy', 'manual')),
  check (match_score is null or match_score between 0 and 1),
  unique (source_system_id, external_row_id, record_hash)
);

create table if not exists dw.manual_overrides (
  override_id bigserial primary key,
  source_system_id bigint not null references dw.source_systems(source_system_id),
  external_row_id text not null,
  canonical_food_id bigint not null references dw.food_items(canonical_food_id),
  reason text not null,
  created_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (source_system_id, external_row_id)
);

create or replace function dw.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_food_items_set_updated_at on dw.food_items;
create trigger trg_food_items_set_updated_at
before update on dw.food_items
for each row execute function dw.set_updated_at();

create index if not exists idx_food_items_state on dw.food_items(state);
create index if not exists idx_food_items_group on dw.food_items(food_group);

create index if not exists idx_food_aliases_alias_key on dw.food_aliases(alias_key);
create index if not exists idx_food_aliases_locale_alias_key on dw.food_aliases(locale, alias_key);
create index if not exists idx_food_aliases_alias_trgm on dw.food_aliases using gin (alias_text gin_trgm_ops);

create index if not exists idx_nutrition_food_current on dw.nutrition_facts(canonical_food_id, is_current);
create index if not exists idx_nutrition_source on dw.nutrition_facts(source_system_id);

create index if not exists idx_density_food_units on dw.food_density(canonical_food_id, from_unit, to_unit);

create index if not exists idx_ingestion_source_started on dw.ingestion_runs(source_system_id, started_at desc);
create index if not exists idx_ingestion_status on dw.ingestion_runs(status);

create index if not exists idx_source_records_status on dw.source_records(resolution_status);
create index if not exists idx_source_records_food on dw.source_records(canonical_food_id);
create index if not exists idx_source_records_source_external on dw.source_records(source_system_id, external_row_id);

create or replace function dw.normalize_food_key(input text)
returns text
language sql
immutable
as $$
  select lower(trim(regexp_replace(coalesce(input, ''), '\\s+', ' ', 'g')));
$$;

commit;