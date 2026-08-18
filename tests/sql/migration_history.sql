-- Supabase'in kendi migration kaydı: hangi dosyalar uygulanmış?
-- Supabase Dashboard > SQL Editor > New query. Salt okunur.
--
-- Not: Migration'ları yalnızca panelden elle çalıştırdıysanız bu tablo boş
-- veya eksik olabilir; "relation does not exist" hatası da normaldir.
select version, name
from supabase_migrations.schema_migrations
order by version;
