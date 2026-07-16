-- Formera RLS politikaları
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.
-- Önce schema.sql çalışmış olmalı.

alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete cascade;

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.studios,
  public.profiles,
  public.members,
  public.programs,
  public.member_program_selections,
  public.sessions,
  public.finance_entries,
  public.signatures,
  public.trainer_tasks,
  public.member_tasks
to authenticated;

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select p
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_studio_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.studio_id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1;
$$;

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

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'owner';
$$;

create or replace function public.is_trainer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'trainer';
$$;

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'member';
$$;

drop policy if exists "profiles_select_same_studio" on public.profiles;
create policy "profiles_select_same_studio"
on public.profiles
for select
to authenticated
using (studio_id = public.current_studio_id() or auth_user_id = auth.uid());

drop policy if exists "profiles_owner_insert_same_studio" on public.profiles;
create policy "profiles_owner_insert_same_studio"
on public.profiles
for insert
to authenticated
with check (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "profiles_owner_update_same_studio" on public.profiles;
create policy "profiles_owner_update_same_studio"
on public.profiles
for update
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "studios_select_own" on public.studios;
create policy "studios_select_own"
on public.studios
for select
to authenticated
using (id = public.current_studio_id());

drop policy if exists "studios_owner_update_own" on public.studios;
create policy "studios_owner_update_own"
on public.studios
for update
to authenticated
using (public.is_owner() and id = public.current_studio_id())
with check (public.is_owner() and id = public.current_studio_id());

drop policy if exists "members_select_same_studio" on public.members;
create policy "members_select_same_studio"
on public.members
for select
to authenticated
using (studio_id = public.current_studio_id());

drop policy if exists "members_owner_trainer_insert_same_studio" on public.members;
create policy "members_owner_trainer_insert_same_studio"
on public.members
for insert
to authenticated
with check ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id());

drop policy if exists "members_owner_trainer_update_same_studio" on public.members;
create policy "members_owner_trainer_update_same_studio"
on public.members
for update
to authenticated
using ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id())
with check ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id());

drop policy if exists "members_owner_delete_same_studio" on public.members;
create policy "members_owner_delete_same_studio"
on public.members
for delete
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "programs_select_same_studio" on public.programs;
create policy "programs_select_same_studio"
on public.programs
for select
to authenticated
using (studio_id = public.current_studio_id());

drop policy if exists "programs_owner_trainer_write_same_studio" on public.programs;
create policy "programs_owner_trainer_write_same_studio"
on public.programs
for all
to authenticated
using ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id())
with check ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id());

drop policy if exists "sessions_select_same_studio" on public.sessions;
create policy "sessions_select_same_studio"
on public.sessions
for select
to authenticated
using (studio_id = public.current_studio_id());

drop policy if exists "sessions_owner_trainer_write_same_studio" on public.sessions;
create policy "sessions_owner_trainer_write_same_studio"
on public.sessions
for all
to authenticated
using ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id())
with check ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id());

drop policy if exists "finance_owner_only_same_studio" on public.finance_entries;
create policy "finance_owner_only_same_studio"
on public.finance_entries
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "signatures_select_same_studio" on public.signatures;
create policy "signatures_select_same_studio"
on public.signatures
for select
to authenticated
using (studio_id = public.current_studio_id());

drop policy if exists "signatures_owner_trainer_insert_same_studio" on public.signatures;
create policy "signatures_owner_trainer_insert_same_studio"
on public.signatures
for insert
to authenticated
with check ((public.is_owner() or public.is_trainer()) and studio_id = public.current_studio_id());

drop policy if exists "member_program_select_same_studio" on public.member_program_selections;
create policy "member_program_select_same_studio"
on public.member_program_selections
for select
to authenticated
using (
  exists (
    select 1
    from public.members m
    where m.id = member_id
      and m.studio_id = public.current_studio_id()
  )
);

drop policy if exists "member_program_write_same_studio" on public.member_program_selections;
create policy "member_program_write_same_studio"
on public.member_program_selections
for all
to authenticated
using (
  exists (
    select 1
    from public.members m
    where m.id = member_id
      and m.studio_id = public.current_studio_id()
  )
)
with check (
  exists (
    select 1
    from public.members m
    join public.programs p on p.id = program_id
    where m.id = member_id
      and m.studio_id = public.current_studio_id()
      and p.studio_id = public.current_studio_id()
  )
);

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
