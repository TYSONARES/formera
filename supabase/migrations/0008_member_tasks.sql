-- Formera üye aksiyonları
-- Antrenörün üyeye antrenman görevi, beslenme notu veya takip komutu göndermesi için.
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create table if not exists public.member_tasks (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  trainer_profile_id uuid references public.profiles(id) on delete set null,
  type text not null default 'followup' check (type in ('workout', 'nutrition', 'followup')),
  title text not null,
  note text,
  due_date date,
  status text not null default 'open' check (status in ('open', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.member_tasks enable row level security;

grant select, insert, update, delete on public.member_tasks to authenticated;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

drop policy if exists "member_tasks_owner_all_same_studio" on public.member_tasks;
create policy "member_tasks_owner_all_same_studio"
on public.member_tasks
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "member_tasks_trainer_all_own" on public.member_tasks;
create policy "member_tasks_trainer_all_own"
on public.member_tasks
for all
to authenticated
using (
  public.is_trainer()
  and studio_id = public.current_studio_id()
  and trainer_profile_id = public.current_profile_id()
)
with check (
  public.is_trainer()
  and studio_id = public.current_studio_id()
  and trainer_profile_id = public.current_profile_id()
);

drop policy if exists "member_tasks_member_select_own" on public.member_tasks;
create policy "member_tasks_member_select_own"
on public.member_tasks
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

drop policy if exists "member_tasks_member_update_own" on public.member_tasks;
create policy "member_tasks_member_update_own"
on public.member_tasks
for update
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
)
with check (
  public.is_member()
  and studio_id = public.current_studio_id()
  and exists (
    select 1
    from public.members m
    where m.id = member_id
      and m.profile_id = public.current_profile_id()
  )
);
