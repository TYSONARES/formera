-- Formera marka ve avatar alanları
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.
-- Mevcut tabloları silmeden logo, renk ve avatar kolonlarını ekler.

alter table public.studios
  add column if not exists logo_data_url text,
  add column if not exists accent_color text default '#d9ff64';

alter table public.profiles
  add column if not exists avatar_data_url text;

alter table public.members
  add column if not exists avatar_data_url text;
