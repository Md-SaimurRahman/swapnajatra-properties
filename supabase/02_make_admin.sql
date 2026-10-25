-- Run this RIGHT AFTER you create your admin login in Supabase (Authentication > Users > Add user).
-- It makes every existing login an admin (signups are OFF, so there is only the one you made).
insert into public.admin_profiles (user_id, name, role)
select id, 'Admin', 'admin' from auth.users
on conflict (user_id) do nothing;
select count(*) as admins_created from public.admin_profiles;
