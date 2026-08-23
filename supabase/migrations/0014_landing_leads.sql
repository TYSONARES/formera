-- Formera landing başvuru tablosu
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query (bir kez).
--
-- Neden ayrı tablo: landing formu oturumsuz (anon) yazar. pilot_leads'e anon
-- insert açmak, aynı tablodaki işletmeye ait lead'leri de risk altına sokardı.
-- Buradaki tablo YALNIZCA yazılabilir; okuma hakkı sadece Formera admin'dedir.
-- Böylece bir rakip anon anahtarla başvuruları geri okuyamaz.

create table if not exists public.landing_leads (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  studio_name text not null,
  city text,
  phone text,
  members text,
  goal text,
  package_code text check (package_code in ('starter', 'studio', 'studio_ai')),
  timeline text,
  value numeric(12,2) not null default 0 check (value >= 0),
  source text not null default 'landing',
  consent_at timestamptz,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists landing_leads_created_idx
  on public.landing_leads (created_at desc);

alter table public.landing_leads enable row level security;

-- Anon YALNIZCA insert. select/update/delete yok.
revoke all on public.landing_leads from anon, authenticated;
grant insert on public.landing_leads to anon, authenticated;
grant select on public.landing_leads to authenticated;

drop policy if exists "landing_leads_public_insert" on public.landing_leads;
create policy "landing_leads_public_insert"
on public.landing_leads
for insert
to anon, authenticated
with check (
  -- Alan sınırları veritabanında zorlanır; istemciye güvenilmez.
  char_length(contact_name) between 2 and 100
  and char_length(studio_name) between 2 and 120
  and coalesce(char_length(city), 0) <= 80
  and coalesce(char_length(phone), 0) <= 32
  and coalesce(char_length(goal), 0) <= 400
  and coalesce(char_length(members), 0) <= 40
  and coalesce(char_length(timeline), 0) <= 60
  and coalesce(char_length(user_agent), 0) <= 400
  and source = 'landing'
  and consent_at is not null
);

-- Okuma yalnızca aktif Formera admin hesabına açık.
drop policy if exists "landing_leads_admin_select" on public.landing_leads;
create policy "landing_leads_admin_select"
on public.landing_leads
for select
to authenticated
using (
  exists (
    select 1
    from public.formera_admins a
    where a.auth_user_id = (select auth.uid())
      and a.active
  )
);

-- Not: Bu uç nokta oturumsuz yazılabildiği için spam'e açıktır. Pilot
-- hacminde sorun değil; trafik arttığında Supabase tarafında rate limit veya
-- bir Edge Function + captcha katmanı eklenmelidir.
