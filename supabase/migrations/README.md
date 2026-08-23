# Formera migration'ları

Bu klasördeki dosyalar **numara sırasıyla, bir kez** çalıştırılır. Sıra
tesadüfi değil: aralarında gerçek bağımlılıklar var.

## Neden sıralı klasöre taşındı

Dosyalar önce `supabase/` altında düz duruyordu ve "SQL Editor'a yapıştır"
notuyla elle çalıştırılıyordu. Bu düzende hangi dosyanın hangi sırada
çalıştırıldığı takip edilmiyordu ve iki gerçek tuzak vardı:

1. **`can_access_program()` üç dosyada tanımlı.**
   `0002` üyeye kendi atanmış programını görme hakkı verir.
   `0011` bu hakkı kaldırır (yalnızca owner/trainer/dietitian bırakır).
   `0012` hakkı geri getirir.
   `0011`'i `0012`'den sonra çalıştırırsanız **tüm üyeler programlarını
   göremez hale gelir** ve bunu fark etmeniz haftalar sürer. Numaralandırma
   bu sırayı zorunlu kılar.

2. **`0012`, `0011`'de tanımlanan `is_dietitian()`'a bağımlı.**
   Tek başına çalıştırılırsa fonksiyon bulunamadı hatası verir.

Ayrıca `0014` (landing_leads) okuma politikası için `0013`'te oluşturulan
`formera_admins` tablosuna, `0015` ise kendinden önceki tüm fonksiyonların
var olmasına bağlıdır — bu yüzden en sonda durur.

## Sıra

| # | Dosya | İçerik |
|---|---|---|
| 0001 | schema | Tablolar, RLS açma |
| 0002 | policies | Yardımcı fonksiyonlar ve temel politikalar |
| 0003 | role_accounts | E-posta kolonları, `claim_profile_by_email` |
| 0004 | branding | Logo, renk, avatar kolonları |
| 0005 | studio_onboarding | `setup_completed` |
| 0006 | session_flow | Seans kapasitesi ve bekleme listesi |
| 0007 | trainer_tasks | Antrenör görevleri |
| 0008 | member_tasks | Üye görevleri |
| 0009 | pilot_leads | Pilot CRM |
| 0010 | subscriptions | Plan/abonelik (yazma yolu tarayıcıya kapalı) |
| 0011 | care_makeups | Diyetisyen rolü, telafi dersi akışı |
| 0012 | member_program_access | Üyenin kendi programına erişimini geri verir |
| 0013 | formera_admins | Kurucu admin yetkisi |
| 0014 | landing_leads | Landing başvuruları (yalnızca insert) |
| 0015 | security_hardening | SECURITY DEFINER fonksiyonlarında revoke |
| 0016 | recover_owner_onboarding | `recover_owner_onboarding()` fonksiyonu — app.js RPC ile çağırır |

## Çalıştırma

Hepsi idempotent (`if not exists`, `create or replace`, `drop policy if exists`),
yani mevcut bir veritabanında yeniden çalıştırmak güvenlidir.

**Supabase CLI ile (önerilen):**
```bash
supabase db push
```

**Panelden:** SQL Editor → New query → dosya içeriğini yapıştır → Run.
Sırayı 0001'den 0015'e doğru takip edin.

## Bu klasöre ne girmez

Tek seferlik onarım ve demo verisi `supabase/ops/` altındadır
(`seed.sql`, `repair-member-accounts.sql`).

> `recover-owner-onboarding.sql` önce buraya konmuştu; yanlıştı. Kalıcı bir
> fonksiyon (`recover_owner_onboarding()`) tanımlıyor ve app.js onu RPC ile
> çağırıyor, yani veritabanında bulunmak zorunda. `0016` olarak migration'lara
> geri alındı — Supabase'in kendi kaydında da en son migration olarak bu
> görünüyor.
Bunlar şema değişikliği değildir, sırayla çalıştırılmaz, yalnızca gerektiğinde
elle kullanılır.
