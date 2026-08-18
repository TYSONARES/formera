-- Supabase ortaminin migration'lari calistirmak icin gereken asgari taklidi
create extension if not exists "pgcrypto";
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $$;
create schema if not exists auth;
create table if not exists auth.users(
  id uuid primary key default gen_random_uuid(),
  email text unique
);
-- Oturum kullanicisi test icin GUC uzerinden ayarlanir
create or replace function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('test.uid', true),'')::uuid $$;
create or replace function auth.email() returns text language sql stable as
$$ select nullif(current_setting('test.email', true),'') $$;
grant usage on schema auth to anon, authenticated, service_role;
