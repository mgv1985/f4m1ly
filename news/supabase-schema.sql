create extension if not exists pgcrypto with schema extensions;

create table if not exists public.news_editor_settings (
  singleton boolean primary key default true check (singleton),
  password_sha256 text not null
);

insert into public.news_editor_settings(singleton, password_sha256)
values (true, '483029d526219f816e8e8f6a9de07b422633dba180ffc26faac22862a017519f')
on conflict (singleton) do nothing;

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

alter table public.news_articles enable row level security;
alter table public.news_editor_settings enable row level security;
revoke all on public.news_articles from anon, authenticated;
revoke all on public.news_editor_settings from anon, authenticated;

create or replace view public.news_published_articles as
select id, title, summary, body, topic, label, image_url, featured, published_at
from public.news_articles
where status = 'published';

grant select on public.news_published_articles to anon, authenticated;

create or replace function public.news_password_valid(candidate text)
returns boolean
language sql security definer set search_path = public, extensions, pg_temp
as $$
  select exists (
    select 1 from public.news_editor_settings
    where singleton = true
      and password_sha256 = encode(extensions.digest(coalesce(candidate, ''), 'sha256'), 'hex')
  );
$$;

create or replace function public.list_news_articles(editor_password text)
returns table(id uuid, title text, summary text, body text, topic text, label text, image_url text, featured boolean, status text, updated_at timestamptz, published_at timestamptz)
language plpgsql security definer set search_path = public, extensions, pg_temp
as $$
begin
  if not public.news_password_valid(editor_password) then raise exception 'Incorrect password'; end if;
  return query select a.id, a.title, a.summary, a.body, a.topic, a.label, a.image_url, a.featured, a.status, a.updated_at, a.published_at
  from public.news_articles a order by a.updated_at desc;
end;
$$;

create or replace function public.save_news_article(
  article_id uuid, editor_password text, new_title text, new_summary text,
  new_body text, new_topic text, new_label text, new_image_url text,
  new_featured boolean, new_status text
)
returns uuid
language plpgsql security definer set search_path = public, extensions, pg_temp
as $$
declare saved_id uuid;
begin
  if not public.news_password_valid(editor_password) then raise exception 'Incorrect password'; end if;
  if length(trim(coalesce(new_title, ''))) < 1 then raise exception 'A headline is required'; end if;
  if length(trim(coalesce(new_summary, ''))) < 1 then raise exception 'A summary is required'; end if;
  if length(trim(coalesce(new_body, ''))) < 1 then raise exception 'Article text is required'; end if;
  if new_topic not in ('Family','Games','Learning','Tools') then raise exception 'Invalid topic'; end if;
  if new_status not in ('draft','published') then raise exception 'Invalid status'; end if;
  if length(trim(coalesce(new_image_url, ''))) > 0 and new_image_url !~ '^https://' then raise exception 'The image must use an HTTPS URL'; end if;

  if article_id is null then
    insert into public.news_articles(title,summary,body,topic,label,image_url,featured,status,published_at)
    values(left(trim(new_title),160),left(trim(new_summary),420),trim(new_body),new_topic,left(trim(coalesce(new_label,'')),80),left(trim(coalesce(new_image_url,'')),1000),coalesce(new_featured,false),new_status,case when new_status='published' then now() else null end)
    returning id into saved_id;
  else
    update public.news_articles a set
      title=left(trim(new_title),160), summary=left(trim(new_summary),420), body=trim(new_body),
      topic=new_topic, label=left(trim(coalesce(new_label,'')),80), image_url=left(trim(coalesce(new_image_url,'')),1000),
      featured=coalesce(new_featured,false), status=new_status, updated_at=now(),
      published_at=case when new_status='published' then coalesce(a.published_at,now()) else a.published_at end
    where a.id=article_id returning a.id into saved_id;
    if saved_id is null then raise exception 'Article not found'; end if;
  end if;
  return saved_id;
end;
$$;

create or replace function public.delete_news_article(article_id uuid, editor_password text)
returns boolean
language plpgsql security definer set search_path = public, extensions, pg_temp
as $$
begin
  if not public.news_password_valid(editor_password) then raise exception 'Incorrect password'; end if;
  delete from public.news_articles a where a.id=article_id;
  return found;
end;
$$;

revoke all on function public.news_password_valid(text) from public;
grant execute on function public.list_news_articles(text) to anon, authenticated;
grant execute on function public.save_news_article(uuid,text,text,text,text,text,text,text,boolean,text) to anon, authenticated;
grant execute on function public.delete_news_article(uuid,text) to anon, authenticated;

notify pgrst, 'reload schema';
