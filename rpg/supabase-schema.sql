create extension if not exists pgcrypto;

create table if not exists public.rpg_sessions (
  id uuid primary key default gen_random_uuid(),
  dm_key uuid not null default gen_random_uuid(),
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rpg_sessions enable row level security;
revoke all on public.rpg_sessions from anon, authenticated;

create or replace view public.rpg_public_sessions as
select id, state, updated_at from public.rpg_sessions;

grant select on public.rpg_public_sessions to anon, authenticated;

create or replace function public.create_rpg_session(initial_state jsonb default '{}'::jsonb)
returns table(id uuid, dm_key uuid)
language sql security definer set search_path = public, pg_temp
as $$
  insert into public.rpg_sessions(state)
  values (coalesce(initial_state, '{}'::jsonb))
  returning rpg_sessions.id, rpg_sessions.dm_key;
$$;

create or replace function public.update_rpg_session(session_id uuid, session_key uuid, new_state jsonb)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  update public.rpg_sessions
  set state = new_state, updated_at = now()
  where id = session_id and dm_key = session_key;
  return found;
end;
$$;

grant execute on function public.create_rpg_session(jsonb) to anon, authenticated;
grant execute on function public.update_rpg_session(uuid, uuid, jsonb) to anon, authenticated;

create or replace function public.move_rpg_hero(session_id uuid, hero_id text, hero_x numeric, hero_y numeric, explored jsonb)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  update public.rpg_sessions s
  set state = jsonb_set(
    jsonb_set(
      s.state,
      '{tokens}',
      (select jsonb_agg(
        case when token->>'id' = hero_id and token->>'type' = 'hero'
          then jsonb_set(jsonb_set(token, '{x}', to_jsonb(hero_x)), '{y}', to_jsonb(hero_y))
          else token end
      ) from jsonb_array_elements(s.state->'tokens') token),
      true
    ),
    '{reveals}', coalesce(explored, '[]'::jsonb), true
  ), updated_at = now()
  where s.id = session_id
    and exists (select 1 from jsonb_array_elements(s.state->'tokens') token where token->>'id' = hero_id and token->>'type' = 'hero');
  return found;
end;
$$;

grant execute on function public.move_rpg_hero(uuid, text, numeric, numeric, jsonb) to anon, authenticated;

create or replace function public.delete_rpg_session(session_id uuid, session_key uuid)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  delete from public.rpg_sessions where id = session_id and dm_key = session_key;
  return found;
end;
$$;

grant execute on function public.delete_rpg_session(uuid, uuid) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('rpg-assets', 'rpg-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public RPG assets are readable" on storage.objects;
create policy "Public RPG assets are readable" on storage.objects
for select to public using (bucket_id = 'rpg-assets');

drop policy if exists "RPG assets can be uploaded" on storage.objects;
create policy "RPG assets can be uploaded" on storage.objects
for insert to anon, authenticated
with check (
  bucket_id = 'rpg-assets'
  and storage.extension(name) in ('png','jpg','jpeg','webp','gif')
);

drop policy if exists "DM can delete RPG assets" on storage.objects;
create policy "DM can delete RPG assets" on storage.objects
for delete to anon, authenticated
using (
  bucket_id = 'rpg-assets'
  and exists (
    select 1 from public.rpg_sessions session
    where session.id::text = (storage.foldername(name))[1]
      and session.dm_key::text = (select current_setting('request.headers', true)::json ->> 'x-rpg-key')
  )
);
