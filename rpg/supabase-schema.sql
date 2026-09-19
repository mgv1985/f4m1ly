create extension if not exists pgcrypto with schema extensions;

create table if not exists public.rpg_sessions (
  id uuid primary key default gen_random_uuid(),
  dm_key uuid not null default gen_random_uuid(),
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rpg_sessions add column if not exists password_hash text;

alter table public.rpg_sessions enable row level security;
revoke all on public.rpg_sessions from anon, authenticated;

create or replace view public.rpg_public_sessions as
select id, state, updated_at from public.rpg_sessions;

create or replace view public.rpg_campaign_catalog as
select id, coalesce(nullif(state->>'campaignName', ''), 'Untitled adventure') as name,
  updated_at, password_hash is not null as password_protected
from public.rpg_sessions;

grant select on public.rpg_public_sessions to anon, authenticated;
grant select on public.rpg_campaign_catalog to anon, authenticated;

drop function if exists public.create_rpg_session(jsonb);

create or replace function public.create_rpg_session(initial_state jsonb, campaign_password text)
returns table(id uuid, dm_key uuid)
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if length(trim(coalesce(campaign_password, ''))) < 1 then
    raise exception 'A campaign password is required';
  end if;
  return query
    insert into public.rpg_sessions(state, password_hash)
    values (coalesce(initial_state, '{}'::jsonb), extensions.crypt(campaign_password, extensions.gen_salt('bf', 10)))
    returning rpg_sessions.id, rpg_sessions.dm_key;
end;
$$;

create or replace function public.unlock_rpg_session(session_id uuid, campaign_password text)
returns uuid
language sql security definer set search_path = public, pg_temp
as $$
  select dm_key from public.rpg_sessions
  where id = session_id
    and password_hash is not null
    and password_hash = extensions.crypt(campaign_password, password_hash);
$$;

create or replace function public.set_rpg_password(session_id uuid, session_key uuid, new_password text)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  if length(trim(coalesce(new_password, ''))) < 1 then return false; end if;
  update public.rpg_sessions
  set password_hash = extensions.crypt(new_password, extensions.gen_salt('bf', 10)), updated_at = now()
  where id = session_id and dm_key = session_key;
  return found;
end;
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

grant execute on function public.create_rpg_session(jsonb, text) to anon, authenticated;
grant execute on function public.unlock_rpg_session(uuid, text) to anon, authenticated;
grant execute on function public.set_rpg_password(uuid, uuid, text) to anon, authenticated;
grant execute on function public.update_rpg_session(uuid, uuid, jsonb) to anon, authenticated;

drop function if exists public.move_rpg_hero(uuid, text, numeric, numeric, jsonb);

create or replace function public.move_rpg_hero(session_id uuid, hero_id text, hero_x numeric, hero_y numeric, explored jsonb, visibility text)
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
  if found then
    update public.rpg_sessions
    set state = jsonb_set(
      state,
      '{fogMode}',
      to_jsonb(case when visibility in ('normal','revealed','black') then visibility else 'normal' end),
      true
    )
    where id = session_id;
  end if;
  return found;
end;
$$;

grant execute on function public.move_rpg_hero(uuid, text, numeric, numeric, jsonb, text) to anon, authenticated;

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

notify pgrst, 'reload schema';
