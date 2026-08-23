-- Formera kurucu/admin erişim kapısı
-- Bu dosya, müşteri işletme sahiplerinden ayrı bir Formera Admin yetkisi oluşturur.
-- ADMIN_EMAIL_ADRESINI_BURAYA_YAZ değerini kendi admin e-postanla değiştirip çalıştır.

create table if not exists public.formera_admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.formera_admins enable row level security;

grant select on table public.formera_admins to authenticated;
revoke insert, update, delete on table public.formera_admins from anon, authenticated;

drop policy if exists "Formera admins can read own grant" on public.formera_admins;
create policy "Formera admins can read own grant"
on public.formera_admins
for select
to authenticated
using ((select auth.uid()) = auth_user_id and active);

insert into public.formera_admins (auth_user_id, email, full_name, active)
select u.id, u.email, coalesce(p.full_name, 'Formera Admin'), true
from auth.users u
left join public.profiles p on p.auth_user_id = u.id
where u.email = 'ADMIN_EMAIL_ADRESINI_BURAYA_YAZ'
on conflict (auth_user_id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    active = true,
    updated_at = now();

update public.profiles p
set email = u.email
from auth.users u
where p.auth_user_id = u.id
  and p.email is null;
