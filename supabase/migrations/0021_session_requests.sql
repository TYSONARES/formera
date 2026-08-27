-- Formera üye self-servis seans talebi
-- Üye uygulamadan seans ister; işletmeci/personel onaylar veya reddeder.
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create table if not exists public.session_requests (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  requested_date date not null,
  requested_time text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists session_requests_studio_status_idx
  on public.session_requests (studio_id, status, created_at desc);

alter table public.session_requests enable row level security;

grant select, insert, update, delete on public.session_requests to authenticated;

-- İşletmeci: kendi stüdyosunun tüm taleplerini yönetir (onay/ret).
drop policy if exists "session_requests_owner_all_same_studio" on public.session_requests;
create policy "session_requests_owner_all_same_studio"
on public.session_requests
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

-- Antrenör/diyetisyen: kendi stüdyosunda talepleri görür ve karar verir.
drop policy if exists "session_requests_staff_all_same_studio" on public.session_requests;
create policy "session_requests_staff_all_same_studio"
on public.session_requests
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

-- Üye: yalnızca KENDİ adına ve 'pending' durumunda talep oluşturabilir.
drop policy if exists "session_requests_member_insert_own" on public.session_requests;
create policy "session_requests_member_insert_own"
on public.session_requests
for insert
to authenticated
with check (
  public.is_member()
  and status = 'pending'
  and studio_id = public.current_studio_id()
  and exists (
    select 1 from public.members m
    where m.id = member_id and m.profile_id = public.current_profile_id()
  )
);

-- Üye: yalnızca KENDİ taleplerini görür.
drop policy if exists "session_requests_member_select_own" on public.session_requests;
create policy "session_requests_member_select_own"
on public.session_requests
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
