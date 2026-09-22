create extension if not exists pgcrypto with schema extensions;

create table if not exists public.post_it_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null default '',
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.post_it_notes enable row level security;
revoke all on public.post_it_notes from anon, authenticated;

create or replace view public.post_it_catalog as
select id, title, updated_at from public.post_it_notes;

grant select on public.post_it_catalog to anon, authenticated;

create or replace function public.create_post_it_note(note_title text, note_password text, note_content text default '')
returns uuid
language plpgsql security definer set search_path = public, pg_temp
as $$
declare new_id uuid;
begin
  if length(trim(coalesce(note_title, ''))) < 1 then raise exception 'A title is required'; end if;
  if length(trim(coalesce(note_password, ''))) < 1 then raise exception 'A password is required'; end if;
  insert into public.post_it_notes(title, content, password_hash)
  values (left(trim(note_title), 80), coalesce(note_content, ''), extensions.crypt(note_password, extensions.gen_salt('bf', 10)))
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.open_post_it_note(note_id uuid, note_password text)
returns table(note_title text, note_content text, note_updated_at timestamptz)
language sql security definer set search_path = public, pg_temp
as $$
  select title, content, updated_at from public.post_it_notes
  where id = note_id and password_hash = extensions.crypt(note_password, password_hash);
$$;

create or replace function public.save_post_it_note(note_id uuid, note_password text, new_title text, new_content text)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  update public.post_it_notes
  set title = left(coalesce(nullif(trim(new_title), ''), 'Untitled note'), 80),
      content = coalesce(new_content, ''), updated_at = now()
  where id = note_id and password_hash = extensions.crypt(note_password, password_hash);
  return found;
end;
$$;

create or replace function public.delete_post_it_note(note_id uuid, note_password text)
returns boolean
language plpgsql security definer set search_path = public, pg_temp
as $$
begin
  delete from public.post_it_notes
  where id = note_id and password_hash = extensions.crypt(note_password, password_hash);
  return found;
end;
$$;

grant execute on function public.create_post_it_note(text, text, text) to anon, authenticated;
grant execute on function public.open_post_it_note(uuid, text) to anon, authenticated;
grant execute on function public.save_post_it_note(uuid, text, text, text) to anon, authenticated;
grant execute on function public.delete_post_it_note(uuid, text) to anon, authenticated;

notify pgrst, 'reload schema';
