-- Secure News editor setup / migration.
-- Run this whole file in the Supabase SQL Editor.
-- It removes the old shared-password functions and replaces them with
-- Supabase Auth plus an explicit administrator allowlist.

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  body text not null,
  topic text not null check (topic in ('Family','Games','Learning','Tools')),
  label text not null default '',
  image_url text not null default '',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.news_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.news_articles enable row level security;
alter table public.news_admins enable row level security;

revoke all on public.news_articles from anon, authenticated;
revoke all on public.news_admins from anon, authenticated;
grant select, insert, update, delete on public.news_articles to authenticated;

create or replace function public.is_news_admin()
returns boolean
language sql stable security definer set search_path = public, pg_temp
as $$
  select exists(select 1 from public.news_admins where user_id = auth.uid());
$$;

revoke all on function public.is_news_admin() from public;
grant execute on function public.is_news_admin() to authenticated;

drop policy if exists "news admins select" on public.news_articles;
drop policy if exists "news admins insert" on public.news_articles;
drop policy if exists "news admins update" on public.news_articles;
drop policy if exists "news admins delete" on public.news_articles;

create policy "news admins select" on public.news_articles for select to authenticated using ((select public.is_news_admin()));
create policy "news admins insert" on public.news_articles for insert to authenticated with check ((select public.is_news_admin()));
create policy "news admins update" on public.news_articles for update to authenticated using ((select public.is_news_admin())) with check ((select public.is_news_admin()));
create policy "news admins delete" on public.news_articles for delete to authenticated using ((select public.is_news_admin()));

create or replace view public.news_published_articles as
select id, title, summary, body, topic, label, image_url, featured, published_at
from public.news_articles where status = 'published';

grant select on public.news_published_articles to anon, authenticated;

-- Remove the old public password-based publishing surface.
drop function if exists public.list_news_articles(text);
drop function if exists public.save_news_article(uuid,text,text,text,text,text,text,text,boolean,text);
drop function if exists public.delete_news_article(uuid,text);
drop function if exists public.news_password_valid(text);
drop table if exists public.news_editor_settings;

notify pgrst, 'reload schema';

-- AFTER RUNNING THIS FILE:
-- 1. In Authentication > Users, create your email/password user.
-- 2. Copy that user's UUID and run this separately, replacing the example UUID:
-- insert into public.news_admins(user_id) values ('YOUR-USER-UUID-HERE');
