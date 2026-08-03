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
- trainer_tasks
- member_tasks
- pilot_leads

## 3. RLS politikalarını çalıştır

SQL Editor → New query → `policies.sql` içeriğini yapıştır → Run.

Bu dosya:

- `profiles.auth_user_id` kolonunu ekler
- Kullanıcının stüdyosunu bulan helper fonksiyonları oluşturur
- Owner / trainer / member rollerine göre RLS politikalarını açar
- İşletmeciye aynı stüdyodaki tüm verileri görme/yönetme yetkisi verir
- Antrenör erişimini kendi üyeleri, seansları ve görevleriyle sınırlar
- Üye erişimini kendi programı, seansı, imzası ve görevleriyle sınırlar
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

Uygulama tarafında işletmeci üye/antrenör listesinde hesap durumunu görür ve `Davet` butonuyla giriş metnini kopyalayabilir.

Antrenör görevleri ve işletmeci önerileri için:

SQL Editor → New query → `trainer-tasks.sql` içeriğini yapıştır → Run.

Antrenörün üyeye program/görev/beslenme notu göndermesi için:

SQL Editor → New query → `member-tasks.sql` içeriğini yapıştır → Run.

Landing ve Dashboard Pilot CRM lead’lerini canlı hesaba taşımak için:

SQL Editor → New query → `pilot-leads.sql` içeriğini yapıştır → Run.

Pilotlarda manuel paket durumu ve ilerideki abonelik/webhook altyapısı için:

SQL Editor → New query → `subscriptions.sql` içeriğini yapıştır → Run.

Bu tablo ilk aşamada `activation_mode = 'manual'` ile kullanılır. İyzico hosted checkout ve webhook bağlandığında ödeme olaylarını yalnızca Supabase Edge Function yazmalıdır.

Formera kurucu/admin panelini müşteri işletmeci hesaplarından ayırmak için:

SQL Editor → New query → `formera-admins.sql` içeriğini yapıştır → `ADMIN_EMAIL_ADRESINI_BURAYA_YAZ` alanını kendi admin e-postanla değiştir → Run.

Bu tablo sadece giriş yapan kullanıcının kendi admin yetkisini okuyabileceği şekilde RLS ile korunur. Admin hesabı oluşturma yetkisi uygulama içinden müşterilere verilmez.

İlk kez giriş yapan işletmecinin demo verisi yerine doğrudan işletme kurulumuna yönlenmesi için:

SQL Editor → New query → `studio-onboarding.sql` içeriğini yapıştır → Run.

Bu dosya yalnızca `studios.setup_completed` alanını ekler. Kurulum tamamlanınca işletme adı, logo ve karşılama metni gerçek stüdyo bilgileriyle görünür.

Anon/public RPC erişimini sertleştirmek için:

SQL Editor → New query → `security-hardening.sql` içeriğini yapıştır → Run.

Bu dosya, RLS için gerekli helper fonksiyonlarını authenticated kullanıcıda çalışır bırakır; anonim/public RPC çağrılarını kapatır. Daha ileri seviye private schema refactor’ı ayrı test planıyla yapılmalıdır.

## 6. Güvenlik notu

Şemada RLS açık gelir ve başlangıçta politika yoktur. Bu bilinçli bir tercih: canlı anahtar bağlamadan önce veri dışarı açılmaz.

Bir sonraki backend adımında:

- Her kullanıcı kendi rolüne göre yönlenecek
- Antrenör ve üye erişimleri daha sıkı RLS politikalarıyla daraltılacak
- localStorage verisi Supabase’e göç ettirilecek

## 7. Canlı işletme kurulumu

`bootstrap-studio` Edge Function, yeni oluşturulan işletme hesabı için ayrı bir `studio` ve owner `profile` kaydı açar. Bu fonksiyon JWT doğrulamasıyla çalışır; service role anahtarı yalnızca Supabase sunucusunda kalır.

Antrenör ve üye hesapları, işletmecinin ilk kurulumda girdiği e-posta ile önceden hazırlanır. Bu kişiler aynı e-postayla hesap oluşturup giriş yaptığında mevcut `claim_profile_by_email` akışı kendi rollerine yönlendirir.

Kurulum tamamlanınca bu kişilere davet e-postası göndermek için `send-onboarding-invites` Edge Function'ı kullanılır. Function yalnızca giriş yapmış işletme sahibinin kendi stüdyosu için çağrılabilir; `service_role` anahtarı tarayıcıya hiç gönderilmez.

E-postanın Formera diliyle gitmesi için Supabase Dashboard → **Authentication → Emails → Invite user** alanına `invite-email-template.html` içeriğini yapıştırıp kaydet. Şablondaki `{{ .ConfirmationURL }}` davete özel güvenli giriş bağlantısıdır.

## 8. Frontend bağlantısı

Yayımlanan `config.js` dosyasında yalnızca Supabase **publishable** anahtarı bulunur. Bu anahtar tarayıcıda görünür olması için tasarlanmıştır; veri erişimi RLS politikalarıyla korunur. `service_role` anahtarını hiçbir zaman repoya, tarayıcıya veya istemci koduna ekleme.
