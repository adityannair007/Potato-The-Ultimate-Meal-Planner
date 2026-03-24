create or replace function dw.parse_num(input_text text)
returns numeric
language sql
immutable
as $$
  select nullif(
    regexp_replace(
      lower(coalesce(input_text, '')),
      '[^0-9\.\-]+',
      '',
      'g'
    ),
    ''
  )::numeric;
$$;