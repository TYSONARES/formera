-- Formera işletme duyuruları
-- İşletmeci/personel üyelere toplu duyuru yazar; tüm stüdyo üyeleri görür.
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text,
  created_at timestamptz not null default now()
);

create index if not exists announcements_studio_date_idx
  on public.announcements (studio_id, created_at desc);

alter table public.announcements enable row level security;

grant select, insert, update, delete on public.announcements to authenticated;

-- İşletmeci: kendi stüdyosunun duyurularını yönetir.
drop policy if exists "announcements_owner_all_same_studio" on public.announcements;
create policy "announcements_owner_all_same_studio"
on public.announcements
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

-- Antrenör/diyetisyen: kendi stüdyosunda duyuru yazabilir/düzenleyebilir.
drop policy if exists "announcements_staff_all_same_studio" on public.announcements;
create policy "announcements_staff_all_same_studio"
on public.announcements
for all
to authenticated
using (
  (public.is_trainer() or public.is_dietitian())
  and studio_id = public.current_studio_id()
)
with check (
  (public.is_trainer() or public.is_dietitian())
  and studio_id = public.current_studio_id()
);

-- Üye: kendi stüdyosunun tüm duyurularını görür (salt okunur).
drop policy if exists "announcements_member_select_studio" on public.announcements;
create policy "announcements_member_select_studio"
on public.announcements
for select
to authenticated
using (public.is_member() and studio_id = public.current_studio_id());
