-- Formera bakım ekibi ve telafi dersi akışı
-- Antrenör + diyetisyen ortak üye takibi, işletmeci onaylı telafi talebi.
-- RLS: Her satır yalnızca aynı stüdyo ve yetkili kullanıcılar tarafından görülür.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('owner', 'trainer', 'dietitian', 'member'));

alter table public.members
  add column if not exists dietitian_profile_id uuid references public.profiles(id) on delete set null;

alter table public.studios
  add column if not exists makeup_enabled boolean not null default false,
  add column if not exists makeup_notice_hours integer not null default 12 check (makeup_notice_hours between 0 and 168),
  add column if not exists makeup_max_per_month integer not null default 1 check (makeup_max_per_month between 0 and 12);

create table if not exists public.makeup_requests (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  missed_session_id uuid references public.sessions(id) on delete set null,
  requested_session_id uuid references public.sessions(id) on delete set null,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists members_dietitian_profile_id_idx on public.members (dietitian_profile_id);
create index if not exists makeup_requests_studio_status_idx on public.makeup_requests (studio_id, status, created_at desc);
create index if not exists makeup_requests_member_idx on public.makeup_requests (member_id, created_at desc);

grant select, insert, update, delete on public.makeup_requests to authenticated;

create or replace function public.is_dietitian()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() = 'dietitian';
$$;

create or replace function public.is_care_specialist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('trainer', 'dietitian');
$$;

create or replace function public.can_support_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members m
    where m.id = target_member_id
      and m.studio_id = public.current_studio_id()
      and (
        public.is_owner()
        or (public.is_trainer() and m.trainer_profile_id = public.current_profile_id())
        or (public.is_dietitian() and m.dietitian_profile_id = public.current_profile_id())
      )
  );
$$;

create or replace function public.can_access_member(target_member_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members m
    where m.id = target_member_id
      and m.studio_id = public.current_studio_id()
      and (
        public.is_owner()
        or (public.is_trainer() and m.trainer_profile_id = public.current_profile_id())
        or (public.is_dietitian() and m.dietitian_profile_id = public.current_profile_id())
        or (public.is_member() and m.profile_id = public.current_profile_id())
      )
  );
$$;

create or replace function public.can_access_profile(target_profile_id uuid, target_auth_user_id uuid, target_studio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_auth_user_id = auth.uid()
    or (public.is_owner() and target_studio_id = public.current_studio_id())
    or (public.is_care_specialist() and target_studio_id = public.current_studio_id())
    or (
      public.is_member()
      and exists (
        select 1 from public.members m
        where m.profile_id = public.current_profile_id()
          and (m.trainer_profile_id = target_profile_id or m.dietitian_profile_id = target_profile_id)
      )
    );
$$;

-- Program şablonları bakım ekibinin ortak çalışma alanıdır.
create or replace function public.can_access_program(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.programs p
    where p.id = target_program_id
      and p.studio_id = public.current_studio_id()
      and (public.is_owner() or public.is_trainer() or public.is_dietitian())
  );
$$;

-- Üyeler yalnızca kendi, kaçırılmış seansları için ve işletmenin izin verdiği
-- aylık sınırlar içinde telafi talebi açabilir. Bu kontrol UI'a değil veritabanına aittir.
create or replace function public.validate_makeup_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_enabled boolean;
  monthly_limit integer;
  already_used integer;
begin
  if public.is_member() then
    select s.makeup_enabled, s.makeup_max_per_month
      into is_enabled, monthly_limit
    from public.studios s
    where s.id = new.studio_id;

    if coalesce(is_enabled, false) is not true then
      raise exception 'Telafi dersi bu işletmede aktif değil';
    end if;

    if not exists (
      select 1 from public.members m
      where m.id = new.member_id
        and m.studio_id = new.studio_id
        and m.profile_id = public.current_profile_id()
    ) then
      raise exception 'Yalnızca kendi üyeliğin için telafi talebi açabilirsin';
    end if;

    if new.missed_session_id is null or not exists (
      select 1 from public.sessions ss
      where ss.id = new.missed_session_id
        and ss.studio_id = new.studio_id
        and ss.member_id = new.member_id
        and ss.status = 'cancelled'
    ) then
      raise exception 'Telafi talebi için kaçırılmış bir seans seçmelisin';
    end if;

    select count(*) into already_used
    from public.makeup_requests mr
    where mr.studio_id = new.studio_id
      and mr.member_id = new.member_id
      and mr.created_at >= date_trunc('month', now())
      and mr.status in ('pending', 'approved');

    if already_used >= coalesce(monthly_limit, 0) then
      raise exception 'Bu ay için telafi dersi limitine ulaştın';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_makeup_request_before_insert on public.makeup_requests;
create trigger validate_makeup_request_before_insert
before insert on public.makeup_requests
for each row execute function public.validate_makeup_request();

-- Diyetisyen atanmış üyeleri görebilir; üye profilini/üyelik paketini değiştiremez.
drop policy if exists "members_select_same_studio" on public.members;
create policy "members_select_same_studio"
on public.members for select to authenticated
using (public.can_access_member(id));

drop policy if exists "programs_owner_trainer_write_same_studio" on public.programs;
create policy "programs_owner_trainer_write_same_studio"
on public.programs for all to authenticated
using ((public.is_owner() or public.is_trainer() or public.is_dietitian()) and studio_id = public.current_studio_id())
with check ((public.is_owner() or public.is_trainer() or public.is_dietitian()) and studio_id = public.current_studio_id());

drop policy if exists "sessions_select_same_studio" on public.sessions;
create policy "sessions_select_same_studio"
on public.sessions for select to authenticated
using (
  studio_id = public.current_studio_id()
  and (public.is_owner() or public.can_access_member(member_id) or (member_id is null and public.is_owner()))
);

-- Member task'larında trainer_profile_id geçmiş uyumluluğu için "oluşturan uzman" alanıdır.
drop policy if exists "member_tasks_owner_all_same_studio" on public.member_tasks;
drop policy if exists "member_tasks_trainer_all_own" on public.member_tasks;
drop policy if exists "member_tasks_member_select_own" on public.member_tasks;
drop policy if exists "member_tasks_member_update_own" on public.member_tasks;
drop policy if exists "member_tasks_specialist_select_assigned" on public.member_tasks;
drop policy if exists "member_tasks_specialist_insert_own" on public.member_tasks;
drop policy if exists "member_tasks_specialist_update_own" on public.member_tasks;

create policy "member_tasks_owner_all_same_studio"
on public.member_tasks for all to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

create policy "member_tasks_specialist_select_assigned"
on public.member_tasks for select to authenticated
using (
  public.is_care_specialist()
  and studio_id = public.current_studio_id()
  and public.can_support_member(member_id)
);

create policy "member_tasks_specialist_insert_own"
on public.member_tasks for insert to authenticated
with check (
  public.is_care_specialist()
  and studio_id = public.current_studio_id()
  and trainer_profile_id = public.current_profile_id()
  and public.can_support_member(member_id)
);

create policy "member_tasks_specialist_update_own"
on public.member_tasks for update to authenticated
using (
  public.is_care_specialist()
  and studio_id = public.current_studio_id()
  and trainer_profile_id = public.current_profile_id()
)
with check (
  public.is_care_specialist()
  and studio_id = public.current_studio_id()
  and trainer_profile_id = public.current_profile_id()
  and public.can_support_member(member_id)
);

create policy "member_tasks_member_select_own"
on public.member_tasks for select to authenticated
using (public.is_member() and studio_id = public.current_studio_id() and public.can_access_member(member_id));

create policy "member_tasks_member_update_own"
on public.member_tasks for update to authenticated
using (public.is_member() and studio_id = public.current_studio_id() and public.can_access_member(member_id))
with check (public.is_member() and studio_id = public.current_studio_id() and public.can_access_member(member_id));

alter table public.makeup_requests enable row level security;

drop policy if exists "makeup_requests_owner_all_same_studio" on public.makeup_requests;
drop policy if exists "makeup_requests_specialist_select_assigned" on public.makeup_requests;
drop policy if exists "makeup_requests_member_select_own" on public.makeup_requests;
drop policy if exists "makeup_requests_member_insert_own" on public.makeup_requests;

create policy "makeup_requests_owner_all_same_studio"
on public.makeup_requests for all to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

create policy "makeup_requests_specialist_select_assigned"
on public.makeup_requests for select to authenticated
using (
  public.is_care_specialist()
  and studio_id = public.current_studio_id()
  and public.can_support_member(member_id)
);

create policy "makeup_requests_member_select_own"
on public.makeup_requests for select to authenticated
using (public.is_member() and studio_id = public.current_studio_id() and public.can_access_member(member_id));

create policy "makeup_requests_member_insert_own"
on public.makeup_requests for insert to authenticated
with check (
  public.is_member()
  and studio_id = public.current_studio_id()
  and public.can_access_member(member_id)
  and status = 'pending'
  and requested_session_id is null
  and reviewed_by_profile_id is null
  and reviewed_at is null
);

revoke execute on function public.is_dietitian() from public;
revoke execute on function public.is_care_specialist() from public;
revoke execute on function public.can_support_member(uuid) from public;
revoke execute on function public.can_access_program(uuid) from public;
revoke execute on function public.validate_makeup_request() from public;
grant execute on function public.is_dietitian() to authenticated;
grant execute on function public.is_care_specialist() to authenticated;
grant execute on function public.can_support_member(uuid) to authenticated;
grant execute on function public.can_access_program(uuid) to authenticated;
