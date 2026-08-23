-- Formera görsel depolama — base64'ten Storage'a geçiş
--
-- Sorun: logo, avatar ve imzalar base64 metin olarak Postgres satırlarında
-- duruyordu. Logo tek başına 1.5 MB'a kadar çıkabiliyor ve `select *` her
-- seferinde onu da çekiyordu. Satır bazlı senkronizasyon bunun etkisini
-- azalttı ama kök sorun sürüyordu.
--
-- Çözüm: logo ve avatarlar `formera-media` bucket'ına taşınır. Kolon adları
-- (`logo_data_url`, `avatar_data_url`) DEĞİŞMEZ — artık ya eski bir
-- `data:image/...` değeri ya da kısa bir `https://.../storage/v1/...` adresi
-- tutarlar. İkisi de CSS `url()` içinde çalıştığı için okuma tarafında hiçbir
-- değişiklik gerekmez ve mevcut kayıtlar bozulmaz.
--
-- İmzalar bilerek Postgres'te bırakıldı: 220px'lik bir tuvalden üretilen PNG
-- tipik olarak 10-40 KB, yani boyut sorunu değil. Storage'a taşımak özel
-- bucket + imzalı URL üretimi gerektirir; kazanç bu karmaşıklığı karşılamıyor.
-- `signatures` tablosu zaten RLS ile korunuyor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'formera-media',
  'formera-media',
  true,                                    -- logo ve avatarlar üye ekranında görünür
  2097152,                                 -- 2 MB üst sınır
  array['image/jpeg','image/png','image/webp','image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Dosya yolu kuralı: <studio_id>/<tur>-<id>-<zaman>.jpg
-- Böylece her stüdyo yalnızca kendi klasörüne yazabilir.

drop policy if exists "formera_media_insert_own_studio" on storage.objects;
create policy "formera_media_insert_own_studio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'formera-media'
  and (storage.foldername(name))[1] = public.current_studio_id()::text
);

drop policy if exists "formera_media_update_own_studio" on storage.objects;
create policy "formera_media_update_own_studio"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'formera-media'
  and (storage.foldername(name))[1] = public.current_studio_id()::text
)
with check (
  bucket_id = 'formera-media'
  and (storage.foldername(name))[1] = public.current_studio_id()::text
);

drop policy if exists "formera_media_delete_own_studio" on storage.objects;
create policy "formera_media_delete_own_studio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'formera-media'
  and (storage.foldername(name))[1] = public.current_studio_id()::text
);

-- Okuma: bucket public olduğu için dosyalar adresi bilen herkese açıktır.
-- Bu bilinçli bir seçim — logo ve avatar zaten üye/antrenör ekranında
-- gösteriliyor. Dosya adları tahmin edilemez zaman damgası taşır.
-- Kişisel veri niteliği taşıyan bir görsel (imza, kimlik) BU BUCKET'A KONMAZ.

comment on column public.studios.logo_data_url is
  'Eski kayıtlarda data: URL, yeni kayıtlarda formera-media Storage adresi.';
comment on column public.profiles.avatar_data_url is
  'Eski kayıtlarda data: URL, yeni kayıtlarda formera-media Storage adresi.';
comment on column public.members.avatar_data_url is
  'Eski kayıtlarda data: URL, yeni kayıtlarda formera-media Storage adresi.';
