-- Formera Pilot CRM lead tablosu
-- Mevcut Supabase projesinde schema.sql/policies.sql çalıştıktan sonra bir kez çalıştırın.

create table if not exists public.pilot_leads (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid references public.studios(id) on delete cascade,
  contact_name text not null,
  studio_name text not null,
  city text,
  phone text,
  members text default '0–50',
  goal text,
  stage text not null default 'lead' check (stage in ('lead', 'demo', 'pilot', 'proposal', 'won', 'lost')),
  next_action text,
  follow_up_date date default current_date,
  value numeric(12,2) not null default 990,
  source text default 'dashboard',
  created_at timestamptz not null default now()
);

alter table public.pilot_leads enable row level security;

grant select, insert, update, delete on public.pilot_leads to authenticated;

drop policy if exists "pilot_leads_owner_all_same_studio" on public.pilot_leads;
create policy "pilot_leads_owner_all_same_studio"
on public.pilot_leads
for all
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());
