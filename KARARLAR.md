# Formera — karar defteri

CLAUDE.md § 1 (Hafıza disiplini) gereği kalıcı kararlar burada tutulur.
Her kayıt: tarih, karar, gerekçe, kilit varsayımlar.

---

## 2026-08-18 · KRR-formera-01 · Canlı modda yerel işletme verisi tutulmaz

**Karar.** Supabase yapılandırması varsa üye/antrenör/finans/program verisi
localStorage'a ne yazılır ne okunur. Tek kaynak sunucudur. Demo verisi yalnızca
açık bayrakla yüklenir (`?demo=1`).

**Gerekçe.** Çıkış yaptıktan sonra üye adı, telefonu ve e-postası ekranda
kalıyor, sayfa yenilense bile localStorage'dan geri geliyordu. Ortak cihazda
doğrudan kişisel veri sızıntısı. Test (`tests/pii_leak_test.py`) düzeltme
öncesi 7 kontrolün 6'sında sızıntı raporladı.

**Kilit varsayım.** PWA'nın çevrimdışı çalışması bu veriler için feda edildi.
Çevrimdışı ihtiyacı doğarsa çözüm localStorage değil, oturum ömrüne bağlı
şifreli bir depo olmalı.

---

## 2026-08-18 · KRR-formera-02 · Yazı tipleri kendi origin'imizden servis edilir

**Karar.** Google Fonts hotlink'i kaldırıldı; DM Sans ve Manrope woff2
dosyaları `assets/fonts/` altında repoda tutuluyor (16 dosya, 204 KB).

**Gerekçe.** CLAUDE.md § 4 madde 2 hotlink'i açıkça yasaklıyor ("Google Fonts
dahil"). Her ziyaretçinin IP'si Google'a gidiyordu — KVKK/GDPR yükümlülüğü.

**Kilit varsayım.** Yalnızca kullanılan ağırlıklar alındı (DM Sans 400-700,
Manrope 500-800). Yeni ağırlık gerekirse `assets/fonts/fonts.css` genişletilmeli.

---

## 2026-08-18 · KRR-formera-03 · supabase-js CDN'den değil repodan yüklenir

**Karar.** `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` yerine
`vendor/supabase-js-2.112.3.min.js` (sabit sürüm).

**Gerekçe.** CLAUDE.md § 4 madde 1. Ayrıca `@2` etiketi sürüm sabitlemesi ve
SRI olmadan üçüncü taraf CDN'e bağlıydı; kütüphane yüklenemediğinde panel
sonsuza kadar "hazırlanıyor" ekranında kilitleniyordu.

**Kilit varsayım.** Sürüm yükseltmesi elle yapılacak; otomatik güncelleme yok.

---

## 2026-08-18 · KRR-formera-04 · SQL dosyaları sıralı migration düzenine geçti

**Karar.** `supabase/migrations/0001..0016` numaralı sıra; tek seferlik
script'ler `supabase/ops/` altında ayrı.

**Gerekçe.** `can_access_program()` üç dosyada tanımlıydı; yanlış sırada
çalıştırıldığında tüm üyeler kendi programlarını göremez hale geliyordu.
Yerel PostgreSQL 16'da ölçüldü: doğru sırada 1 program, yanlış sırada 0.

**Kilit varsayım.** Canlı veritabanında bu dosyaların hangilerinin uygulandığı
`tests/sql/diagnose.sql` ile okunacak; körlemesine yeniden çalıştırma yapılmadı.

---

## 2026-08-24 · KRR-formera-05 · `studios` istemciden yalnızca UPDATE ile yazılır

**Karar.** `syncRemote` artık `studios` için `upsert` değil, satır başına
`update().eq('id', …)` kullanıyor (`UPDATE_ONLY_TABLES`). `studios` üzerine
INSERT politikası **eklenmedi**.

**Gerekçe.** PostgREST'in `upsert`'i `insert ... on conflict do update`
üretiyor; Postgres bu ifadede önce INSERT politikasını arıyor. `studios`
üzerinde INSERT politikası yok (satır kurulum Edge Function'ı ile oluşur),
bu yüzden her marka / işletme bilgisi kaydı sunucuda RLS ile reddediliyordu.
Ekranda "güncellendi" yazıyor, `logo_data_url` / `phone` / `address` NULL
kalıyordu; bu yüzden kurulum rehberindeki "İşletme bilgileri" adımı hiç
tamamlanmıyor ve stüdyo logosu her yenilemede kayboluyordu.

Yerel Postgres'te ölçüldü: aynı veriyle düz `update` 1 satır yazıyor,
`insert ... on conflict` `new row violates row-level security policy` veriyor.
Kontrol edildi: `syncRemote`'un yazdığı 11 tablodan INSERT politikası eksik
olan tek tablo `studios`.

**Kilit varsayım.** İstemci hiçbir zaman yeni stüdyo satırı oluşturmaz;
oluşturma `create_studio` Edge Function'ının işidir. Bu değişirse INSERT
politikası gerekir. INSERT'i kapalı tutmak, politika eklemekten daha dar
bir yüzey bırakır.

---

## 2026-08-24 · KRR-formera-06 · Sunucu yazma hatası her zaman görünür olmalı

**Karar.** `remoteError`, hesap penceresi kapalıyken hatayı `showToast` ile
de gösterir.

**Gerekçe.** Hata yalnızca hesap penceresinin içindeki `accountAlert`
alanına yazılıyordu. Pencere kapalıyken sunucunun 403'ü kullanıcıya hiç
ulaşmıyor, form ise başarı mesajı veriyordu. KRR-formera-05'teki hatanın
haftalarca fark edilmemesinin sebebi budur: sessiz başarısızlık, hatanın
kendisinden daha pahalıya mal oldu.

**Kilit varsayım.** Toast metni sunucudan gelen ham `error.message`. Teknik
görünüyor ama yanlış "başarılı" mesajından iyidir; ileride kullanıcı diline
çevrilebilir.

---

## 2026-08-24 · KRR-formera-07 · Güvenlik denetimi: RLS + XSS + sır taraması

**Karar.** Proje bağımsız bir sızma testi aracıyla (Strix) denetlenmek istendi;
Strix kendi LLM API anahtarını gerektirdiği ve bu oturumun kimliği üçüncü-taraf
bir araca verilemeyeceği için, eşdeğer denetim doğrudan gerçek Postgres ve
gerçek tarayıcıda saldırgan senaryolarıyla yapıldı.

**Bulgular.**
1. **İki gerçek stored-XSS deliği kapatıldı.** `memberDashboard` içindeki üye
   "Bugünkü program" kartı `program.title/goal/level/duration`'ı `esc`'siz
   basıyordu; rapor/ekip/antrenör AI notları üye ve antrenör adını `esc`'siz
   gömüyordu. Antrenör RLS gereği program başlığını ve üye adını yazabildiği
   için, üye kendi panelini açtığında antrenörün payload'ı üyenin oturumunda
   çalışabilirdi. Altı render noktası `esc()` ile sarıldı;
   `tests/xss_render_test.py` eklendi (fix'siz `img=2`).
2. **RLS sağlam.** İki stüdyo, dört rolle 21 saldırgan senaryo — çapraz
   stüdyo okuma/yazma, stüdyo ele geçirme, rol yükseltme, ödeme atlama, anon
   okuma, Storage klasör izolasyonu, landing spam, admin ele geçirme — hepsi
   sunucu tarafında bloklandı.
3. **Sır sızıntısı yok.** Repoda yalnızca yayımlanabilir anahtar var;
   `service_role` her yerde ortam değişkeninden okunuyor.
4. **search_path savunması tam.** 17 `SECURITY DEFINER` fonksiyonunun tümünde
   `search_path=public` sabit.

**Kilit varsayım.** XSS savunması render katmanında `esc()`/`escapeAttr()`'a
bağlı; yeni bir innerHTML interpolasyonu eklenirse mutlaka bu iki testten
(xss_test + xss_render_test) geçmeli. Strix'i çalıştırmak istenirse kendi LLM
anahtarıyla `STRIX_LLM` + `LLM_API_KEY` verilerek `strix -t <hedef>` ile
çalışır.
