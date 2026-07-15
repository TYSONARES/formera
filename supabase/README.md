# Formera Supabase hazırlığı

Bu klasör, Formera’yı tarayıcıdaki localStorage pilotundan çok cihazlı MVP’ye taşımak için başlangıç dosyalarını içerir.

## 1. Supabase projesi oluştur

Supabase’te yeni bir proje aç. Bölge olarak kullanıcılarına yakın bir lokasyon seç.

## 2. Şemayı çalıştır

Supabase Dashboard içinde:

SQL Editor → New query → `schema.sql` içeriğini yapıştır → Run.

Bu işlem şu tabloları oluşturur:

- studios
- profiles
- members
- programs
- member_program_selections
- sessions
- finance_entries
- signatures

## 3. Güvenlik notu

Şemada RLS açık gelir ve başlangıçta politika yoktur. Bu bilinçli bir tercih: canlı anahtar bağlamadan önce veri dışarı açılmaz.

Bir sonraki backend adımında:

- Auth eklenecek
- Her kullanıcı bir stüdyoya bağlanacak
- Owner / trainer / member rollerine göre RLS politikaları yazılacak
- localStorage verisi Supabase’e göç ettirilecek

## 4. Frontend bağlantısı

`config.example.js` dosyasını örnek alarak canlı ortamda `config.js` oluşturulabilir. `config.js` repo’ya eklenmemelidir.

GitHub Pages üzerinde public anon key kullanılabilir; kritik güvenlik RLS politikalarıyla sağlanır.
