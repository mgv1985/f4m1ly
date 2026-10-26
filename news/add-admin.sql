-- Run this only after creating your administrator in Supabase:
-- Authentication > Users > Add user
-- Replace the example below with the UUID shown for your user.

insert into public.news_admins(user_id)
values ('YOUR-USER-UUID-HERE')
on conflict (user_id) do nothing;
