-- Formera plan/abonelik altyapısı (pilotlarda manuel, sonrasında webhook)
--
-- Pilot aşamasında bu tabloyu isterseniz çalıştırıp paket durumunu elle
-- `active` yapabilirsiniz. İyzico webhook bağlandığında yalnızca güvenli bir
-- Edge Function bu alanları güncellemelidir; service_role anahtarı tarayıcıya
-- konulmamalıdır.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  plan_code text not null check (plan_code in ('starter', 'studio', 'studio_ai')),
  status text not null default 'pending' check (status in ('pending', 'active', 'past_due', 'paused', 'cancelled')),
  activation_mode text not null default 'manual' check (activation_mode in ('manual', 'webhook')),
  provider text not null default 'iyzico' check (provider in ('iyzico', 'paytr', 'lemonsqueezy', 'paddle', 'manual')),
  provider_customer_id text,
  provider_subscription_id text,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  currency text not null default 'TRY' check (currency in ('TRY', 'USD', 'EUR')),
  current_period_start date,
  current_period_end date,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_studio_status_idx
  on public.subscriptions (studio_id, status);

create unique index if not exists subscriptions_provider_subscription_uidx
  on public.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

alter table public.subscriptions enable row level security;

grant select, insert, update on public.subscriptions to authenticated;

drop policy if exists "subscription_owner_select" on public.subscriptions;
create policy "subscription_owner_select"
on public.subscriptions
for select
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "subscription_owner_insert" on public.subscriptions;
create policy "subscription_owner_insert"
on public.subscriptions
for insert
to authenticated
with check (public.is_owner() and studio_id = public.current_studio_id());

drop policy if exists "subscription_owner_update" on public.subscriptions;
create policy "subscription_owner_update"
on public.subscriptions
for update
to authenticated
using (public.is_owner() and studio_id = public.current_studio_id())
with check (public.is_owner() and studio_id = public.current_studio_id());

-- Pilot için ilk manuel kayıt örneği (çalıştırmak zorunlu değildir):
-- insert into public.subscriptions
--   (studio_id, plan_code, status, activation_mode, provider, amount, currency)
-- values
--   ('STUDIO_UUID', 'studio', 'active', 'manual', 'manual', 1490, 'TRY');
