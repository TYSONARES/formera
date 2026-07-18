# Formera prototipi

PT stüdyoları için işletmeci, antrenör ve üye arayüzü prototipi.

Canlı tanıtım sayfası: https://tysonares.github.io/formera/

Demo dashboard: https://tysonares.github.io/formera/dashboard.html

## Çalıştırma

Klasörde şu komutu çalıştırın:

```bash
npx serve .
```

Alternatif olarak `index.html` dosyasını doğrudan tarayıcıda açabilirsiniz. Uygulama paneli için `dashboard.html` dosyasını açın.

Sağ üstteki rol düğmesiyle şu görünümler arasında geçiş yapılabilir:

- İşletmeci
- Antrenör
- Üye

## Pilot kapsamı

- Premium funnel / ön tanıtım sayfası
- Yeni Formera logo/favikon sistemi ve optimize edilmiş sinematik fotoğraf/video kullanımı
- Kurucu pilot başvuru formu: canlı başvuru özeti ve profesyonel WhatsApp mesajına dönüşen ücretsiz lead akışı
- Kurucu pilot CRM: başvuru, demo, pilot, teklif ve kazanım aşamalarını takip etme
- Pilot satış odası: funnel görünümü, en sıcak lead, paket önerisi ve sonraki satış hamlesi
- Kurucu pilot teklif metni: CRM lead'ine göre WhatsApp teklif metni kopyalama
- PWA desteği: ana ekrana eklenebilir mobil web uygulaması, manifest ve temel offline önbellek
- Üye yönetimi
- Program seçimi ve program takibi
- Üye/antrenör giriş e-postası ve davet metni kopyalama
- İşletme / antrenör / üye sekmeli giriş ekranı
- İlk kurulum sihirbazı: işletme, ilk antrenör, ilk üye ve ilk program
- Antrenörün üyeye antrenman görevi / beslenme notu göndermesi
- Mikrofonla yazıya döküm: görev, program ve not alanlarında tarayıcı destekliyse sesli dikte
- Studio AI paket alanı: AI Asistan penceresi, kredi görünümü ve rol bazlı demo öneriler
- Dijital imza alma
- Takvim ve seans planlama
- Finans / gelir-gider takibi
- Haftalık raporlar
- Ekip / antrenör performansı
- 4 stüdyo pilot seçici
- 30 günlük pilot takip planı ve aktivasyon skoru
- JSON yedekleme ve geri yükleme

## Backend hazırlığı

Çok cihazlı MVP’ye geçiş için Supabase başlangıç şeması `supabase/` klasöründedir.

Önerilen sıradaki teknik adım:

1. Supabase projesi aç
2. `supabase/schema.sql` dosyasını SQL Editor’da çalıştır
3. `supabase/policies.sql` dosyasını SQL Editor’da çalıştır
4. Supabase Auth içinde owner kullanıcısını oluştur
5. `supabase/seed.sql` içindeki email’i değiştirip örnek veriyi çalıştır
6. Uygulamada üst bardaki `Demo mod` düğmesine bas
7. Supabase Project URL ve anon public key değerlerini gir
8. Owner email/şifre ile giriş yapıp canlı veriyi yükle

Logo, marka rengi, işletme iletişim bilgileri ve üye/antrenör avatarlarını canlı veride saklamak için mevcut projede ayrıca `supabase/branding.sql` dosyasını SQL Editor’da bir kez çalıştırın.

Gerçek antrenör/üye girişleri için ayrıca `supabase/role-accounts.sql` dosyasını SQL Editor’da bir kez çalıştırın. İşletmeci üye veya antrenör kaydına giriş e-postası eklediğinde, kullanıcı aynı e-postayla hesap oluşturup giriş yapınca kendi rol ekranına yönlenir.

İşletmeci üye veya antrenör listesinde hesap durumunu görebilir: `E-posta yok`, `Davet bekliyor`, `Hesap bağlı`. E-posta eklenen kişiler için `Davet` butonu giriş metnini panoya kopyalar.

İşletmecinin antrenörlere görev/öneri göndermesi ve antrenörlerin kendi görevlerini tamamlandı işaretlemesi için `supabase/trainer-tasks.sql` dosyasını SQL Editor’da bir kez çalıştırın.

Antrenörün üyeye antrenman görevi, takip görevi veya beslenme notu göndermesi için `supabase/member-tasks.sql` dosyasını SQL Editor’da bir kez çalıştırın.

`supabase/policies.sql` işletmeciyi üst yetkili bırakır: işletmeci tüm stüdyo verisini görebilir/yönetebilir; antrenör kendi üyeleriyle, üye de kendi verileriyle sınırlandırılır.

Supabase bilgileri GitHub’a yazılmaz; tarayıcıda saklanır. Anon key public kullanıma uygundur, veri güvenliği RLS politikalarıyla sağlanır.
