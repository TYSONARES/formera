-- Formera antrenör görevleri / işletmeci önerileri
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create table if not exists public.trainer_tasks (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  trainer_profile_id uuid references public.profiles(id) on delete cascade,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  title text not null,
  note text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  status text not null default 'open' check (status in ('open', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.trainer_tasks enable row level security;

grant select, insert, update, delete on public.trainer_tasks to authenticated;

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

drop policy if exists "trainer_tasks_owner_all_same_studio" on public.trainer_tasks;
create policy "trainer_tasks_owner_all_same_studio"
on public.trainer_tasks
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "trainer_tasks_trainer_select_own" on public.trainer_tasks;
create policy "trainer_tasks_trainer_select_own"
on public.trainer_tasks
for select
to authenticated
using (
  public.is_trainer()
  and studio_id = public.current_studio_id()
  and trainer_profile_id = public.current_profile_id()
);

drop policy if exists "trainer_tasks_trainer_update_own" on public.trainer_tasks;
create policy "trainer_tasks_trainer_update_own"
on public.trainer_tasks
for update
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
