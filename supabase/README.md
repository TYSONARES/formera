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

## 3. RLS politikalarını çalıştır

SQL Editor → New query → `policies.sql` içeriğini yapıştır → Run.

Bu dosya:

- `profiles.auth_user_id` kolonunu ekler
- Kullanıcının stüdyosunu bulan helper fonksiyonları oluşturur
- Owner / trainer / member rollerine göre temel RLS politikalarını açar
- Finans verisini sadece owner rolüne sınırlar

## 4. Örnek veriyi ekle

Önce Supabase Authentication → Users ekranından owner kullanıcını oluştur.

Sonra `seed.sql` dosyasında şu satırı kendi email adresinle değiştir:

```sql
where email = 'OWNER_EMAIL_ADRESINI_BURAYA_YAZ'
```

Ardından SQL Editor’da `seed.sql` içeriğini çalıştır.

## 5. Marka ve gerçek hesap alanlarını ekle

Mevcut projede logo, işletme iletişim bilgileri ve avatarlar için:

SQL Editor → New query → `branding.sql` içeriğini yapıştır → Run.

Antrenör/üye gerçek girişleri için:

SQL Editor → New query → `role-accounts.sql` içeriğini yapıştır → Run.

Bu dosya, işletmecinin üye/antrenör kaydına eklediği e-posta ile Supabase Auth kullanıcısını ilk girişte otomatik eşleştirir.

Antrenör görevleri ve işletmeci önerileri için:

SQL Editor → New query → `trainer-tasks.sql` içeriğini yapıştır → Run.

## 6. Güvenlik notu

Şemada RLS açık gelir ve başlangıçta politika yoktur. Bu bilinçli bir tercih: canlı anahtar bağlamadan önce veri dışarı açılmaz.

Bir sonraki backend adımında:

- Her kullanıcı kendi rolüne göre yönlenecek
- Antrenör ve üye erişimleri daha sıkı RLS politikalarıyla daraltılacak
- localStorage verisi Supabase’e göç ettirilecek

## 7. Frontend bağlantısı

`config.example.js` dosyasını örnek alarak canlı ortamda `config.js` oluşturulabilir. `config.js` repo’ya eklenmemelidir.

GitHub Pages üzerinde public anon key kullanılabilir; kritik güvenlik RLS politikalarıyla sağlanır.
