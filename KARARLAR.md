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
