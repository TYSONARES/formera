-- Formera marka ve avatar alanları
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.
-- Mevcut tabloları silmeden logo, renk ve avatar kolonlarını ekler.

alter table public.studios
  add column if not exists logo_data_url text,
  add column if not exists accent_color text default '#d9ff64',
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists instagram text,
  add column if not exists website text,
  add column if not exists map_url text;

alter table public.profiles
  add column if not exists avatar_data_url text;

alter table public.members
  add column if not exists avatar_data_url text;
