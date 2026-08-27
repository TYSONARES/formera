-- Formera üye ilerleme takibi — vücut ölçümleri
-- Antrenör/işletmeci üyenin ölçümlerini kaydeder; üye kendi ilerlemesini görür.
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create table if not exists public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  recorded_by uuid references public.profiles(id) on delete set null,
  measured_on date not null default current_date,
  weight_kg    numeric(5,2) check (weight_kg    is null or weight_kg    >= 0),
  body_fat_pct numeric(5,2) check (body_fat_pct is null or (body_fat_pct >= 0 and body_fat_pct <= 100)),
  muscle_kg    numeric(5,2) check (muscle_kg    is null or muscle_kg    >= 0),
  chest_cm     numeric(5,1) check (chest_cm     is null or chest_cm     >= 0),
  waist_cm     numeric(5,1) check (waist_cm     is null or waist_cm     >= 0),
  hip_cm       numeric(5,1) check (hip_cm       is null or hip_cm       >= 0),
  arm_cm       numeric(5,1) check (arm_cm       is null or arm_cm       >= 0),
  thigh_cm     numeric(5,1) check (thigh_cm     is null or thigh_cm     >= 0),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists body_measurements_member_date_idx
  on public.body_measurements (member_id, measured_on desc);

alter table public.body_measurements enable row level security;

grant select, insert, update, delete on public.body_measurements to authenticated;

-- İşletmeci: kendi stüdyosundaki tüm ölçümleri yönetir.
drop policy if exists "body_measurements_owner_all_same_studio" on public.body_measurements;
create policy "body_measurements_owner_all_same_studio"
on public.body_measurements
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

-- Antrenör/diyetisyen: kendi stüdyosundaki üyeler için ölçüm kaydeder/günceller.
-- (member_tasks'tan farklı olarak antrenöre özel kısıtlama yok; küçük stüdyoda
--  ölçümü kim aldıysa girer. Yine de stüdyo sınırı korunur.)
drop policy if exists "body_measurements_staff_all_same_studio" on public.body_measurements;
create policy "body_measurements_staff_all_same_studio"
on public.body_measurements
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

-- Üye: yalnızca KENDİ ölçümlerini görür (yazamaz; ölçümü personel kaydeder).
drop policy if exists "body_measurements_member_select_own" on public.body_measurements;
create policy "body_measurements_member_select_own"
on public.body_measurements
for select
to authenticated
using (
  public.is_member()
  and studio_id = public.current_studio_id()
  and exists (
    select 1
    from public.members m
    where m.id = member_id
      and m.profile_id = public.current_profile_id()
  )
);
