create extension if not exists pgcrypto with schema extensions;

create table if not exists public.diet_history (
  meal_date date primary key,
  choices jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.diet_history enable row level security;
revoke all on public.diet_history from anon, authenticated;

create or replace function public.list_diet_history(access_password text)
returns table(meal_date date, choices jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if extensions.digest(coalesce(access_password, ''), 'sha256') <> extensions.digest('2004', 'sha256') then
    raise exception 'Incorrect password';
  end if;
  return query
    select h.meal_date, h.choices, h.updated_at
    from public.diet_history h
    order by h.meal_date desc;
end;
$$;

create or replace function public.save_diet_history(access_password text, selected_date date, selected_choices jsonb)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if extensions.digest(coalesce(access_password, ''), 'sha256') <> extensions.digest('2004', 'sha256') then
    return false;
  end if;
  insert into public.diet_history(meal_date, choices, updated_at)
  values (selected_date, selected_choices, now())
  on conflict (meal_date) do update
    set choices = excluded.choices, updated_at = now();
  return true;
end;
$$;

create or replace function public.delete_diet_history(access_password text, selected_date date)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if extensions.digest(coalesce(access_password, ''), 'sha256') <> extensions.digest('2004', 'sha256') then
    return false;
  end if;
  delete from public.diet_history where meal_date = selected_date;
  return found;
end;
$$;

grant execute on function public.list_diet_history(text) to anon, authenticated;
grant execute on function public.save_diet_history(text, date, jsonb) to anon, authenticated;
grant execute on function public.delete_diet_history(text, date) to anon, authenticated;
