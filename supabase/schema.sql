-- Formera Supabase başlangıç şeması
-- Amaç: localStorage pilotundan çok cihazlı web MVP'ye geçiş.
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.

create extension if not exists "pgcrypto";

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text,
  location text,
  status text default 'Demo',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('owner', 'trainer', 'member')),
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  trainer_profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  initials text,
  phone text,
  last_visit_label text default 'Henüz gelmedi',
  sessions_used integer not null default 0,
  sessions_total integer not null default 12,
  status text default 'Yeni',
  risk_type text default 'warn',
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  title text not null,
  goal text,
  level text default 'Başlangıç',
  duration_minutes integer default 40,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.member_program_selections (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  selected_at timestamptz not null default now(),
  unique(member_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  trainer_profile_id uuid references public.profiles(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  session_date date not null,
  session_time time not null,
  room text default 'Salon A',
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null,
  category text,
  amount numeric(12,2) not null default 0,
  entry_date date not null default current_date,
  status text not null default 'paid' check (status in ('paid', 'pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  member_id uuid references public.members(id) on delete cascade,
  type text not null,
  image_data_url text not null,
  signed_at timestamptz not null default now()
);

alter table public.studios enable row level security;
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.programs enable row level security;
alter table public.member_program_selections enable row level security;
alter table public.sessions enable row level security;
alter table public.finance_entries enable row level security;
alter table public.signatures enable row level security;

-- Pilot aşaması için güvenli başlangıç:
-- RLS açık, politika yok. Bu durumda istemciden veri okunmaz/yazılmaz.
-- Auth ve stüdyo üyelikleri bağlandığında aşağıdaki politikalar daraltılarak açılmalı.
