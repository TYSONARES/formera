-- Supabase storage semasinin migration testi icin asgari taklidi
create schema if not exists storage;
create table if not exists storage.buckets(
  id text primary key, name text not null, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table if not exists storage.objects(
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null, owner uuid, created_at timestamptz default now()
);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to authenticated;
grant select on storage.objects to anon;
-- Supabase'in kendi yardimci fonksiyonu
create or replace function storage.foldername(name text)
returns text[] language plpgsql immutable as $$
declare _parts text[];
begin
  _parts := string_to_array(name,'/');
  return _parts[1:array_length(_parts,1)-1];
end $$;
grant usage on schema storage to anon, authenticated, service_role;
