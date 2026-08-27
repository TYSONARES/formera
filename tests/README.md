# Formera testleri

## xss_test.py — render katmanı XSS regresyon testi

Panel içeriği `app.innerHTML` ile basıldığı için, kullanıcı kaynaklı her değerin
`esc()` / `escapeAttr()` üzerinden geçmesi zorunludur. Bu test, üye adı, antrenör
adı, program başlığı, egzersiz metni, görev notu, seans odası, stüdyo adı ve
pilot lead alanlarına gerçek bir XSS payload'ı yazar; sonra paneli her rol ve
sayfa için render edip payload'ın **element olarak** DOM'a girip girmediğini
kontrol eder.

Neden önemli: `members.full_name` alanını RLS gereği antrenör de yazabiliyor.
Escape edilmeyen bir render noktası, antrenörün işletmecinin oturum token'ını
çalmasına izin verir.

### Çalıştırma

```bash
# 1) bağımlılıklar (bir kez)
pip install playwright
playwright install chromium

# 2) siteyi yerelde sun
python3 -m http.server 8899

# 3) testi çalıştır
python3 tests/xss_test.py
```

Çıkış kodu 0 = temiz. Başarısız olan her nokta rol/sayfa adıyla raporlanır.

## sync_test.py — satır bazlı senkronizasyon testi

Panel eskiden her kayıt işleminde ilgili tablonun tamamını upsert ediyordu.
Bu test sahte bir Supabase oturumu kurar, REST trafiğini sayar ve dört şeyi
doğrular:

1. Girişte sunucudan gelen veri sunucuya geri yazılmaz (eski davranış: 27 satır)
2. Tek üye düzenlemesinde yalnızca o satır gider (eski davranış: 25 satır)
3. Değişiklik yokken hiç istek çıkmaz
4. Yazma hata alırsa satır kirli kalır ve sonraki kayıtta tekrar denenir

```bash
python3 -m http.server 8899        # ayrı terminalde
python3 tests/sync_test.py
```

> Bu testin eşikleri bilinçli olarak kesindir (`== 1`, `== 2`). Tam-tablo
> davranışına dönülürse üçü birden kırmızıya döner.

> Not: Test `localStorage`'ı temizler. Gerçek verinizin olduğu bir tarayıcı
> profilinde değil, ayrı bir Chromium örneğinde çalışır (Playwright kendi
> profilini açar), bu yüzden mevcut demo verinize dokunmaz.

## sql/run.sh — migration sırası ve RLS testi

Migration'ları **boş bir yerel Postgres'e sırayla** uygular, sonra RLS
senaryolarını çalıştırır. Supabase'e bağlanmaz, canlı veriye dokunmaz.

```bash
# yerel postgres (ornek)
initdb -D /var/lib/postgresql/test -U postgres --auth=trust
pg_ctl -D /var/lib/postgresql/test -o "-p 55432 -k /tmp" start

PGPORT=55432 PGHOST=/tmp ./tests/sql/run.sh
```

Doğruladığı beş şey:

1. Üye kendi atanmış programını görebiliyor (`1` dönmeli)
2. İşletmeci kendi abonelik satırını **ekleyemiyor** (`permission denied`)
3. Anon landing başvurusu **yazabiliyor** (`INSERT 0 1`)
4. Anon başvuruları **okuyamıyor** (`permission denied`)
5. KVKK onayı olmayan başvuru **reddediliyor** (`violates row-level security policy`)

> 1. senaryo migration sırasının bekçisidir. `0011_care_makeups.sql`
> `0012_member_program_access.sql`'den sonra çalıştırılırsa bu değer sessizce
> `0` olur ve tüm üyeler programlarını göremez. Ölçtük: doğru sırada 1,
> yanlış sırada 0.

## sql/diagnose.sql — canlı veritabanı durum raporu

Supabase SQL Editor'a yapıştırıp çalıştırın. **Hiçbir şeyi değiştirmez**,
yalnızca hangi migration'ın eksik olduğunu söyler.

Altı satır döner; her biri ya `tamam` ya da çalıştırılması gereken dosyanın
adını gösterir. Hem düzeltilmiş hem bozuk veritabanında test edildi.

## pii_leak_test.py — çıkış sonrası kişisel veri sızıntısı

Sahte Supabase oturumuyla giriş yapar, üye adı/telefon/e-posta render edildiğini
doğrular, sonra çıkış yapıp aynı verilerin **ekranda ve localStorage'da**
kalmadığını kontrol eder. Sayfa yenilendikten sonra tekrar kontrol eder.

```bash
python3 -m http.server 8899        # ayrı terminalde
python3 tests/pii_leak_test.py
```

Düzeltme öncesi bu test 7 kontrolün 6'sında sızıntı raporluyordu.

## storage_test.py — görsel Storage'a mı yükleniyor?

Sahte Supabase oturumu ve sahte Storage ucu kurar, marka formundan bir logo
yükler, sonra kontrol eder:

1. Dosya Storage'a POST edildi mi
2. Yol `<studio_id>/` ile mi başlıyor (politika stüdyoyu buradan doğruluyor)
3. `studios` satırına yazılan değer base64 **değil**, kısa bir https adresi mi

Ölçüm: satırdaki değer 1.5 MB'a kadar base64 yerine 160 karakter.

```bash
python3 -m http.server 8899
python3 tests/storage_test.py
```

## sql/check_logo.sql — logo Storage'a mı gitti?

Salt okunur. İki soruyu birden cevaplar: `studios.logo_data_url` eski base64
biçiminde mi yoksa Storage adresi mi, ve `formera-media` bucket'ında gerçekten
dosya var mı.

Üç durumu ayırt ettiği yerel Postgres'te doğrulandı: boş / eski base64 /
Storage adresi.

## studio_save_test.py — işletme bilgileri gerçekten sunucuya gidiyor mu?

Panel `studios` satırını `upsert` ile yazıyordu. PostgREST upsert'i
`insert ... on conflict do update` üretir; Postgres bu ifadede önce **INSERT**
politikasını arar. `studios` üzerinde bilinçli olarak INSERT politikası yok,
bu yüzden her marka / işletme bilgisi kaydı sunucuda RLS'e takılıyor, ekranda
ise "güncellendi" yazıyordu.

Yerel Postgres'te ölçüldü: aynı veriyle düz `update` **1 satır** yazıyor,
`insert ... on conflict` ise `new row violates row-level security policy`
hatası veriyor.

Test on kontrol yapar:

1. `studios` yazması **PATCH** mi (POST/upsert değil)
2. `id=eq.<studio_id>` ile tek satırı mı hedefliyor
3. `Prefer: resolution=merge-duplicates` gönderilmiyor mu
4. Sunucu reddederse kullanıcı bunu **görüyor** mu (sessiz başarısızlık yok)
5. Reddedilen satır kirli kalıp bir sonraki kayıtta tekrar deneniyor mu

```bash
python3 -m http.server 8899
python3 tests/studio_save_test.py
```

> Düzeltme öncesi kodda 10 kontrolün 5'i kırmızıya döner; o hâlde ekrandaki
> mesaj `"Test Studio marka ayarları güncellendi."` iken sunucu 403 veriyordu.

## xss_render_test.py — render sinki XSS (üye programı + AI notları)

`xss_test.py` demo modda "giriş yapmış belirli üye"yi taklit edemediği için
üyenin **Bugünkü program** görünümünü (`memberDashboard`) hiç tetiklemiyordu;
orada `program.title` / `program.goal` / `program.level` doğrudan innerHTML'e
giriyordu (stored XSS). Aynı biçimde rapor / ekip / antrenör AI notları, içine
üye ve antrenör adını gömüp `esc`'siz basıyordu.

Bu test state'i doğrudan kurar (giriş yapmış üye + atanmış program + riskli
üye + yoğun antrenör), gerçek render fonksiyonlarını **canlı DOM'a** basar ve
XSS payload'ının element olarak oluşup oluşmadığını ölçer. `memberDashboard`
için ayrıca payload'ın metin olarak işlendiğini doğrular — böylece yol gerçekten
tetikleniyor, kör nokta kalmıyor.

```bash
python3 -m http.server 8899
python3 tests/xss_render_test.py
```

> Düzeltme öncesi `memberDashboard` payload'ı iki `<img>` elementi olarak
> DOM'a sokuyordu (`img=2`); test o hâlde kırmızıya döner.

## Saldırgan RLS denetimi (2026-08-24)

`tests/sql/run.sh` migration sırası + 5 temel RLS senaryosunu doğrular. Buna ek
olarak, iki ayrı stüdyo ve dört rolle (A sahibi/antrenörü/üyesi + B sahibi
"saldırgan") 21 saldırgan senaryo yerel Postgres'te çalıştırıldı ve **hepsi
bloklandı**: çapraz stüdyo PII okuma/yazma, stüdyo ele geçirme, rol yükseltme
(üye/antrenör → owner), başka stüdyoya taşınma, abonelik ile ödeme atlama,
anon veri okuma, Storage'da başka stüdyonun klasörüne yükleme, KVKK'sız/uzun
landing spam'i, `formera_admins`'e kendini ekleme. Ayrıca 17 `SECURITY DEFINER`
fonksiyonunun tümünde `search_path=public` sabitlenmiş (arama yolu enjeksiyonu
savunması). Sonuçlar `KARARLAR.md` KRR-formera-07'de özetlendi.


## sql/telegram_test.sh — landing_leads Telegram bildirim trigger'ı

`0018_lead_telegram_notify.sql` migration'ını boş bir Postgres'e uygular ve
trigger'ın davranışını doğrular. `pg_net` ve `supabase_vault` yerelde
shimlenir (`00c_pgnet_vault_shim.sql`); gerçek Telegram çağrısı yapılmaz,
`net._calls` tablosuna kaydedilen istek incelenir.

```bash
PGPORT=55432 PGHOST=/tmp ./tests/sql/telegram_test.sh
```

Doğruladığı dört şey:
1. Vault sırrı yokken başvuru kaydedilir, bildirim çağrılmaz (sessiz no-op)
2. Sırlar eklenince yeni başvuru bildirim çağırır
3. Çağrı URL'i `bot<token>/sendMessage`, gövde doğru chat_id + mesaj metni
4. Biçim karakterli alan düz metin olarak geçer (parse_mode yok → enjeksiyon yok)

> Sır repoda tutulmaz. Canlı kurulum: `supabase/ops/telegram-notify-setup.sql`.


## measurements_test.py — vücut ölçümü / ilerleme takibi

İki katmanı doğrular: (A) işletmeci bir üyeye ölçüm kaydedince
`body_measurements`'a doğru alanlarla (studio_id, member_id, weight_kg…) yazma
gider; (B) üye panelinde "İlerlemem" kartı ölçümlerle + satır-içi SVG kilo
grafiğiyle render olur, ilk→son değişim hesaplanır, XSS payload'ı element olmaz.

```bash
python3 -m http.server 8899
python3 tests/measurements_test.py
```

RLS tarafı ayrıca `tests/sql/body_measurements_test.sh` ile doğrulanır (üye
kendi ölçümünü görür, başka stüdyo göremez, üye yazamaz, anon engelli).
