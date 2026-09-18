-- Formera üye başarı rozetleri (oyunlaştırma — KRR-formera-13)
-- Rozetler istemcide üyenin kendi seans/ölçüm geçmişinden türetilir; bu tablo
-- yalnızca "hangi rozet ne zaman açıldı" kaydını tutar ki kutlama bir kez
-- oynasın ve rozetler cihazlar arasında kaybolmasın.
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create table if not exists public.member_achievements (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  code text not null,
  unlocked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (member_id, code)
);

create index if not exists member_achievements_member_idx
  on public.member_achievements (member_id, created_at desc);

alter table public.member_achievements enable row level security;

grant select, insert, update, delete on public.member_achievements to authenticated;

-- İşletmeci: kendi stüdyosundaki tüm rozetleri görür/yönetir.
drop policy if exists "member_achievements_owner_all_same_studio" on public.member_achievements;
create policy "member_achievements_owner_all_same_studio"
on public.member_achievements
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

-- Antrenör/diyetisyen: kendi stüdyosundaki rozetleri görür/yazar
-- (seansı "tamamlandı" işaretleyen personel olduğunda rozet onun
-- oturumundan da düşebilir).
drop policy if exists "member_achievements_staff_all_same_studio" on public.member_achievements;
create policy "member_achievements_staff_all_same_studio"
on public.member_achievements
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

-- Üye: yalnızca KENDİ rozetini oluşturabilir.
drop policy if exists "member_achievements_member_insert_own" on public.member_achievements;
create policy "member_achievements_member_insert_own"
on public.member_achievements
for insert
to authenticated
with check (
  public.is_member()
  and studio_id = public.current_studio_id()
  and exists (
    select 1 from public.members m
    where m.id = member_id and m.profile_id = public.current_profile_id()
  )
);

-- Üye: yalnızca KENDİ rozetlerini görür.
drop policy if exists "member_achievements_member_select_own" on public.member_achievements;
create policy "member_achievements_member_select_own"
on public.member_achievements
for select
to authenticated
using (
  public.is_member()
  and studio_id = public.current_studio_id()
  and exists (
    select 1 from public.members m
    where m.id = member_id and m.profile_id = public.current_profile_id()
  )
);
