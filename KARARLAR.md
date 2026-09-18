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


---

## 2026-08-26 · KRR-formera-08 · Lead bildirimi Vault + pg_net trigger'ı ile

**Karar.** Yeni landing başvurusunda Telegram bildirimi, Edge Function/Database
Webhook yerine doğrudan Postgres trigger'ı (`0018`) + `pg_net` ile yapılıyor.
Bot token ve chat_id Supabase **Vault**'ta şifreli; migration ve repo **sır
içermiyor**. Trigger `security definer` ve tam `exception when others` koruması
altında: bildirim hattındaki hiçbir hata (Vault yok, pg_net yok, ağ hatası)
başvuru INSERT'ini düşürmez.

**Gerekçe.** (1) Sır Git'e asla girmemeli — Vault bunu sağlıyor, migration'da
placeholder bile yok. (2) Edge Function + Webhook, işletmeci için dashboard'da
çok adım demekti; SQL Editor'a yapıştırma akışı Başkan'ın zaten bildiği yol.
(3) `pg_net` asenkron: INSERT'i bekletmez. (4) `parse_mode` yok → kullanıcı
kaynaklı alanlar (stüdyo adı vb.) düz metin, biçim/enjeksiyon riski sıfır.

**Kilit varsayım.** Supabase projesinde `pg_net` ve `supabase_vault` mevcut
(varsayılan). Yoksa bildirim sessizce devre dışı kalır, başvuru yine kaydedilir.
Yerel testte ikisi de shimlenir (`tests/sql/00c_pgnet_vault_shim.sql`).

**Not.** Token herkese açık sohbette paylaşıldığı için, kurulum doğrulandıktan
sonra `@BotFather` `/revoke` ile yenilenmeli.

---

## 2026-08-28 · KRR-formera-09 · Landing "papercraft" (Podia esinli) açık temaya geçti

**Karar.** Web sitesi (landing) koyu/sinematik temadan, Başkan'ın onayladığı
Podia stil rehberine göre sıcak, açık, mat "papercraft" temaya taşındı.
`landing.css` sıfırdan yeniden yazıldı; `index.html` içeriği/görselleri/formu
ve landing.js'in tüm id bağımlılıkları korundu.

- Palet: Fog #f5f5f5 zemin, Paper beyaz kart, Ink #06040e (violet alt tonlu)
  yazı, Sky/Terracotta/Lavanta ürün üçlüsü, Mist hairline. Gölge YOK, gradyan
  YOK — yükseklik renk + yarıçapla. Organik lekeler imza öğe.
- Tipografi: tek aile Manrope (self-hosted 500-800), sıkı-aralıklı iri başlık;
  gövde DM Sans. Google Fonts hotlink'i YOK (KVKK + yayın kuralı).
- Rol üçlüsü (İşletmeci/Antrenör/Üye) Podia ürün-kartı olarak Sky/Terracotta/
  Lavanta; AI bandı Plum koyu vurgu yüzeyi.
- Scroll animasyonu: IntersectionObserver reveal + hafif hero parallax.
  `<html>.reveal-ready` yalnızca prefers-reduced-motion KAPALIYKEN (index.html
  inline script) eklenir; JS'siz veya hareket azaltılmışsa içerik ilk boyamada
  görünür (failsafe). landing.js form mantığı değişmedi.

**Kilit varsayım.** Tema tek dünyaya (açık papercraft) commit; karanlık varyant
yok — Podia zaten açık. Dashboard (uygulama) henüz eski temada; bir sonraki
faz. Marka logosu (assets/formera-logo.svg) kendi renklerinde bırakıldı;
palete tam uyum için ayrıca ele alınabilir.

---

## 2026-09-18 · KRR-formera-10 · Arayüz canlıda yalnızca girişle görünür; demo kaldırıldı

**Karar.** Sitedeki tüm "demo dashboard" bağlantıları kaldırıldı. Canlı sitede
`dashboard.html` — `?demo=1` dahil — arayüzü göstermez; oturum yoksa yalnızca
giriş kapısı görünür (`app.js > loginGateActive`). Demo önizleme yalnızca yerel
geliştirmede (localhost / file:) çalışır; testler ve ekran görüntüsü üretimi
bundan etkilenmez. Arayüz tanıtımı artık index'teki gerçek ekran
görüntüleriyle yapılır: 4 ürün kartı yenilendi + 6 kartlık "Panelin içinden"
galerisi eklendi (takvim, üyeler, programlar, rapor, antrenör, üye ilerlemesi).
Görseller demo panelden Playwright ile alındı; üye ekranındaki ölçüm/duyuru/
talep örnek verisi yalnızca tarayıcıda enjekte edildi, koda girmedi.

**Gerekçe.** Başkan talimatı (2026-09-18): "dashboarda tıklanıldığında insanlar
arayüzü görmesin; arayüz fotoğraflarını web sitesinde sunalım." Ayrıca ölçüldü:
demo'suz `dashboard.html` bile giriş istemeden boş arayüz iskeletini açıyordu;
yani yalnızca link kaldırmak yetmezdi, kapı şarttı.

**Kilit varsayım.** Kapı istemci tarafındadır; veri güvenliği zaten RLS'tedir
(KRR-formera-07). Kapı veri değil, arayüzün kendisini gizler. Davet linkleri
(`?invite_*`) kapıdan etkilenmez: kapıdaki "Giriş yap" aynı modalı açar.

---

## 2026-09-18 · KRR-formera-11 · İş modeli pivotu: tek paket + üye barajı + bireysele ücretsiz

**Karar.** (Başkan, 2026-09-18) "Kurucu pilot" söylemi bırakıldı → "erken
kayıt avantajı". Paket üçlemesi (Starter/Studio/Studio AI) kaldırıldı → tek
paket; her özellik herkese açık. Fiyat yalnızca üye sayısı barajına göre:
0–10 üye ücretsiz (bireysel antrenör, koç ve kendi antrenmanını yönetenler
böylece ücretsiz kullanır), 11–25 / 26–45 / 46–60 kademeli, 60+ özel teklif.
Uzun vadeli yön: sporu teşvik eden, bireyi oyunlaştırılmış başarı ölçütleri ve
kutlama animasyonlarıyla motive eden AI destekli platform.

**Uygulanan.** Landing tamamen yeni modele geçirildi: fiyat bölümü tek
paket + 5 kademe kartı; form "paket ilgisi" yerine "kullanım" (stüdyo /
bireysel antrenör / kendi antrenmanım) + yeni üye barajları; tüm pilot
söylemleri erken kayıt oldu; plan/faturalama modalı ve landing.js'teki paket
fiyat mantığı kaldırıldı. Lead kaydına `packageCode` artık
`<kullanım>_<kademe>` yazar; kademe fiyatı belli olmadığından `value: 0`.

**KARAR GEREKLİ (Başkan'a).** (1) Kademe TL tutarları — sitede bilerek
yazılmadı, `data-placeholder` ile işaretli; rakamlar onaylanınca eklenecek.
(2) PAYMENTS.md eski üç paketli modeli anlatıyor; revize edilmeli.
(3) Oyunlaştırma kapsamı YAPILACAKLAR'da planlandı, onay bekliyor.

**Kilit varsayım.** "10 üyeye kadar ücretsiz" Başkan'ın açık kararıdır ve
sitede yayınlandı; kademe tutarları yayınlanmadı, yanıltıcı fiyat iddiası yok.

---

## 2026-09-18 · KRR-formera-12 · Kademe fiyatları netleşti

**Karar.** (Başkan onayı: "önerilerin doğrultusunda devam et") 11–25 üye
990 TL/ay · 26–45 üye 1.690 TL/ay · 46–60 üye 2.490 TL/ay · 60+ özel teklif.
0–10 üye ücretsiz (KRR-formera-11). Erken kayıt olan stüdyoya fiyat sabitlenir.

**Gerekçe.** Rakamlar, daha önce yayında olan onaylı paket fiyat noktalarından
(990/1.690/2.490) türetildi — "makul fiyat" ilkesine uygun, yeni rakam
uydurulmadı. Siteye, lead CRM değerine (`value`) ve PAYMENTS.md'ye işlendi.

**Kilit varsayım.** Fiyatlar lokasyon başına aylıktır; yıllık indirim ve ek
lokasyon kuralı bilinçli olarak kaldırıldı (tek paket sadeliği). Gerekirse
ayrı kararla döner.

---

## 2026-09-18 · KRR-formera-13 · Başarı sistemi: davranış bazlı rozet + kutlama

**Karar.** Üye panelinde "Başarılarım" kartı: 9 rozet, bölüm-geçme mantığı
("Sıradaki bölüm: X · N adım kaldı") ve her yeni rozette ekranda konfeti +
madalya kutlaması. Tanımlar `ACHIEVEMENT_DEFS` (app.js). Kayıt:
`member_achievements` tablosu (migration 0022, RLS: üye kendi rozetini
yazar/görür, personel stüdyo içinde görür/yazar).

**Tasarım ilkeleri.**
1. **Rozetler DAVRANIŞA bağlı, kiloya değil** — antrenman sayısı, haftalık
   seri, paket bitirme, ölçüm sürekliliği, erken saat. Kilo/vücut hedefine
   bağlı rozet bilinçli olarak YOK (sağlıksız teşvik riski); test bunu da
   denetliyor.
2. **Taban çizgisi kuralı:** oturumdaki ilk hesaplamada geçmişten gelen
   rozetler sessizce kaydedilir; kutlama yalnızca oturum İÇİNDE kazanılan
   rozet için oynar. İlk açılışta kutlama fırtınası olmaz.
3. **Erişilebilirlik:** prefers-reduced-motion'da animasyon hiç oynamaz,
   yerine toast (Yayın Kapısı §4 sözleşmesi).
4. Rozetler mevcut veriden türetilir; tablo yalnızca "ne zaman açıldı"
   kaydıdır. Antrenman sayısı `max(done seans satırları, paketten kullanılan)`
   ile hesaplanır ki eski üyelerin geçmişi kaybolmasın.

**Doğrulama.** Yerel tarayıcıda uçtan uca ölçüldü: taban çizgisinde kutlama
yok, oturum içi yeni rozette animasyon oynayıp kendini temizliyor,
reduced-motion'da yalnızca toast. Test: `tests/achievements_test.py`
(8 kontrol). Landing galerisine "Başarı bölümleri" kartı eklendi.

**Kilit varsayım.** Migration 0022 canlıda çalıştırılana kadar tablo yoktur;
`tableMissing` deseni sayesinde panel bundan etkilenmez, rozetler yalnızca
sunucuya yazılmaz.
