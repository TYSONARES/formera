# Formera — bekleyen işler

Karar defteri `KARARLAR.md`'de. Burası henüz yapılmamış, hatırlatılması gereken işler.

---

## ✅ Lead bildirim sistemi — TAMAMLANDI (canlıda doğrulandı 2026-08-27)

**Durum:** ÇÖZÜLDÜ. Başvurular hem Formera Admin panelinde "Web sitesinden gelen
 başvurular" kartında listeleniyor, hem de her yeni başvuruda Başkan'ın
 Telegram'ına anlık bildirim düşüyor. 27.08.2026'da gerçek telefonda test edildi
 ve mesaj geldi (status_code 200). Kurulumdaki tek tuzak: Vault'a önce placeholder
 token kaydedilmişti (Telegram 404 döndü); doğru token'la düzeltilince çalıştı.

- Dashboard bu tabloyu hiçbir yerde okumuyor (Pilot CRM farklı tabloyu okuyor: `pilot_leads`)
- Otomatik bildirim yok
- WhatsApp adımı ziyaretçinin "gönder"e basmasına bağlı; basmazsa haber gitmiyor

**Sonuç:** Başvuru geliyor, Başkan Supabase Table Editor'a elle bakmadan fark etmiyor.
Görülmeyen lead, kaybolmuş lead'den çok farklı değil.

**Çözüm (ücretsiz, iki parça):**

1. ✅ **Pilot CRM'de göster** — YAPILDI (2026-08-26). Dashboard artık
   `landing_leads`'i okuyor; Formera Admin panelinde "Web sitesinden gelen
   başvurular" kartında listeliyor (isim, stüdyo, telefon, paket, değer, hedef,
   zaman + Ara/WhatsApp linki). Salt okunur, yalnızca admin görür (RLS).
   Test: `tests/landing_leads_test.py` (8 kontrol). Bakılacak yer artık kendi
   panel, Supabase değil.
2. ✅ **Telegram bildirimi** — KOD HAZIR (2026-08-26). `landing_leads`'e her
   INSERT'te Postgres trigger'ı (0018) pg_net ile Telegram sendMessage çağırıyor.
   Bot token + chat_id Supabase Vault'ta; **repoda sır yok**. Trigger security
   definer + tam exception koruması: bildirim hattındaki hiçbir hata başvuruyu
   düşürmez. Test: `tests/sql/telegram_test.sh`.
   **Başkan'ın yapması gereken (tek seferlik):** `supabase/ops/telegram-notify-setup.sql`
   → chat_id'yi öğren + iki Vault sırrını yükle + 0018'i çalıştır.

**Alternatifler ve neden seçilmedi:**
- E-posta (Namecheap SMTP, `davet@formera.me`): DKIM/DMARC hazır ama SMTP hâlâ
  doğrulanmamış, spam riski var. İkinci tercih.
- WhatsApp Business API: ücretli, onay süreci var. Bu ölçekte değmez.

**Başkan'ın notu (2026-08-19):** "bir bildirim sistemine ihtiyacım olacak,
mümkünse ücretsiz." B (Storage geçişi) bitince buna dönülecek.

---

## Diğer bekleyenler

| İş | Ne gerekiyor | Not |
|---|---|---|
| WhatsApp numarası | Yeni hattın gelmesi | `config.js` → `FORMERA_CONTACT.whatsapp` |
| Hero videosu sıkıştırma | ffmpeg, yerel makinede | Masaüstünde hâlâ 7 MB iniyor |
| Eşzamanlı düzenleme çakışması | `updated_at` tabanlı tespit | Aynı satırı iki cihaz düzenlerse son yazan kazanıyor |
| Otomatik yedek | Ücretli plana geçiş | Şu an hiç yedek yok |
| İç dokümanları ayır | Karar | `PAYMENTS.md` public repoda duruyor |


---

## 🟢 Üye deneyimi — TIER 1 (yapılıyor, 2026-08-27'de başlandı)

GORİLBEY üye uygulaması incelendi; butik PT stüdyosuna uyan, üye bağını
güçlendiren özellikler seçildi. Zincire özel olanlar (turnike/geçiş logları,
e-cüzdan, çok stüdyo, InBody/kan tahlili, aile hesapları) BİLİNÇLİ olarak
dışarıda bırakıldı — sadelik ve butik ruhu korunuyor.

Sırayla yapılacak (her biri: tablo + RLS + üye ekranı + işletmeci girişi + test):

1. ✅ **İlerleme takibi — vücut ölçümleri + grafik** — YAPILDI (2026-08-27).
   body_measurements tablosu + RLS (üye kendi görür, personel kaydeder). Üye
   panelinde 'İlerlemem' kartı: hafif satır-içi SVG kilo grafiği + son ölçüm
   özeti + ilk→son değişim. İşletmeci üye satırındaki 'Ölçüm' ile kaydeder.
   Migration 0019 (Supabase'de çalıştırılmalı). Test: tests/measurements_test.py
   (10 kontrol) + tests/sql/body_measurements_test.sh.
2. **Üye self-servis seans talebi** — üye uygulamadan seans ister, WhatsApp
   trafiği azalır. (Seans var, üye talebi yok.)
3. **Programlarım / antrenman geçmişi** — bugünkü + geçmiş program kartları.
   (Yarısı var, genişletilecek.)
4. ✅ **İşletmeden üyeye duyuru** — YAPILDI (2026-08-27). announcements tablosu
   + RLS (personel yazar, stüdyo üyeleri okur). İşletmeci ana panelinde 'Duyurular'
   kartı + '+ Duyuru' modalı; üye panelinde 'Duyurular' kartı. Migration 0020.
   Test: tests/announcements_test.py (7 kontrol).
5. ✅ **Paket/kalan gün net görünsün** — YAPILDI (2026-08-27). Üye panelinde
   belirgin 'Paketim' kartı: ilerleme çubuğu + büyük 'X seans kaldı' + yenileme
   uyarısı (≤2 seansta turuncu). Seans bazlı (PT paketi). NOT: takvim bazlı
   üyelik (kalan GÜN) istenirse members'a package_end tarihi eklenmeli — Başkan'a
   sorulacak.

## 🟡 Üye deneyimi — TIER 2 (SONRAKİ TUR — hatırlatılacak)

Tier 1 bitince Başkan'a hatırlat:

- **Diyet / beslenme planı (Diyetlerim)** — diyetisyen rolü zaten var; üyeye
  planını göstermek doğal uzantı.
- **Memnuniyet anketi (Anketler ve Ölçümler)** — stüdyoya geri bildirim toplar.
- **QR ile check-in (hafif yoklama)** — butikte turnike yok; sadece "geldim"
  yoklaması için hafif sürüm.
- **Su tüketimi takibi** — düşük etki, wellness dokunuşu.

## 🔴 Değerlendirildi, Formera'ya (şimdilik) alınmadı

E-cüzdan (ödeme entegrasyonu ister), geçiş/turnike raporları (donanım),
çok stüdyo seçimi (zincir), kan tahlili + segmental/InBody (tıbbi + cihaz),
aile/kayıtlı hesaplar (aile paketi satılırsa). Gerekçe: butik ölçek + sadelik.
