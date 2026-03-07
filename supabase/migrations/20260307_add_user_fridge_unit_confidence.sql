-- Adds quantity unit metadata to user_fridge for more accurate inventory tracking.
alter table if exists public.user_fridge
  add column if not exists unit text not null default 'piece',
  add column if not exists quantity_confidence text not null default 'exact';

-- Keep quantity meaningful and unit values predictable.
alter table if exists public.user_fridge
  add constraint user_fridge_quantity_positive check (quantity > 0);

alter table if exists public.user_fridge
  add constraint user_fridge_unit_valid check (unit in ('piece', 'g', 'kg', 'ml', 'l'));

alter table if exists public.user_fridge
  add constraint user_fridge_confidence_valid check (quantity_confidence in ('exact', 'estimated', 'unknown'));
