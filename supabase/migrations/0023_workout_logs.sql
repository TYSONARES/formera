-- Formera antrenman defteri (solo sporcu pivotu — KRR-formera-14)
-- Üye her hareket için set × tekrar × ağırlık kaydeder; kişisel rekor ve
-- rozetler bu kayıtlardan türetilir.
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  exercise text not null,
  log_date date not null default current_date,
  set_number int not null default 1,
  reps int,
  weight_kg numeric(6,2),
  created_at timestamptz not null default now()
);

create index if not exists workout_logs_member_idx
  on public.workout_logs (member_id, log_date desc, created_at desc);

alter table public.workout_logs enable row level security;

grant select, insert, update, delete on public.workout_logs to authenticated;

-- İşletmeci: kendi stüdyosunun tüm defter kayıtlarını görür/yönetir.
drop policy if exists "workout_logs_owner_all_same_studio" on public.workout_logs;
create policy "workout_logs_owner_all_same_studio"
on public.workout_logs
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

-- Antrenör/diyetisyen: kendi stüdyosunda görür/yazar (PT, üyesinin yerine
-- set kaydı girebilir).
drop policy if exists "workout_logs_staff_all_same_studio" on public.workout_logs;
create policy "workout_logs_staff_all_same_studio"
on public.workout_logs
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

-- Üye: yalnızca KENDİ defterine yazar.
drop policy if exists "workout_logs_member_insert_own" on public.workout_logs;
create policy "workout_logs_member_insert_own"
on public.workout_logs
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

-- Üye: yalnızca KENDİ defterini görür.
drop policy if exists "workout_logs_member_select_own" on public.workout_logs;
create policy "workout_logs_member_select_own"
on public.workout_logs
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
