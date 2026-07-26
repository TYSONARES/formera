-- Formera Seans Akışı v1: kapasite ve bekleme listesi alanları.
-- Mevcut projede schema.sql daha önce çalıştıysa bu migration'ı çalıştırın.

alter table public.sessions
  add column if not exists session_type text not null default 'one_to_one',
  add column if not exists capacity integer not null default 1,
  add column if not exists reserved_count integer not null default 1,
  add column if not exists waitlist_count integer not null default 0;

alter table public.sessions
  drop constraint if exists sessions_session_type_check;

alter table public.sessions
  add constraint sessions_session_type_check
  check (session_type in ('one_to_one', 'group', 'online'));

alter table public.sessions
  drop constraint if exists sessions_capacity_check;

alter table public.sessions
  add constraint sessions_capacity_check
  check (capacity > 0 and reserved_count >= 0 and waitlist_count >= 0);

update public.sessions
set reserved_count = 1
where reserved_count = 0 and status = 'scheduled';
