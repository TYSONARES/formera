-- Yerel test icin pg_net ve supabase_vault taklidi.
-- Supabase'de bu nesneler gercek eklentilerle gelir; burada yalnizca
-- 0018 migration'inin fonksiyon govdeleri dogrulanabilsin diye tanimlanir.
create schema if not exists net;
create table if not exists net._calls(id serial primary key, url text, body jsonb, headers jsonb);
create or replace function net.http_post(
  url text,
  body jsonb default '{}'::jsonb,
  params jsonb default '{}'::jsonb,
  headers jsonb default '{}'::jsonb,
  timeout_milliseconds int default 5000
) returns bigint language sql as $$
  insert into net._calls(url, body, headers) values (url, body, headers) returning id::bigint;
$$;
create schema if not exists vault;
create table if not exists vault.decrypted_secrets(id serial, name text, decrypted_secret text);
