# Formera — bekleyen işler

Karar defteri `KARARLAR.md`'de. Burası henüz yapılmamış, hatırlatılması gereken işler.

---

## 🔴 İş modeli pivotu (KRR-formera-11) — bekleyen adımlar

Başkan kararı (2026-09-18): tek paket + üye barajlı fiyat + bireysele ücretsiz +
oyunlaştırılmış, sporu teşvik eden platform. Landing yeni modele geçirildi;
kalan adımlar:

1. ✅ **Kademe TL tutarları** — ONAYLANDI ve işlendi (2026-09-18,
   KRR-formera-12): 11–25 → 990 TL/ay, 26–45 → 1.690 TL/ay, 46–60 →
   2.490 TL/ay, 60+ özel. Sitede, lead değerinde ve PAYMENTS.md'de.
2. ✅ **Oyunlaştırma / başarı sistemi** — YAPILDI (2026-09-18,
   KRR-formera-13). Üye panelinde "Başarılarım": 9 davranış-bazlı rozet
   (kilo rozetı bilinçli YOK), bölüm-geçme ilerleme satırı, yeni rozette
   konfeti kutlaması (reduced-motion'da toast). Migration **0022**
   (Supabase'de çalıştırılmalı!). Test: tests/achievements_test.py.
   Landing galerisine "Başarı bölümleri" kartı eklendi.
3. **Bireysel kullanım akışı.** Solo antrenör/sporcu bugün "tek kişilik
   stüdyo" olarak kayıt olabiliyor; kayıt sihirbazında bunu açıkça sunan
   "Bireysel" yolu eklenecek (stüdyo kurulum adımlarını atlayan sade akış).
   SONRAKİ TUR adayı.
4. **Fiyat kademesi uygulaması.** Üye sayısı barajı aşılınca panelde nazik
   uyarı + kademe bilgisi (şimdilik manuel faturalama; İyzico sonrası).
   Üye kaydetmek asla kilitlenmez, yalnızca bilgilendirilir.
5. ✅ **PAYMENTS.md revizyonu** — YAPILDI (2026-09-18): tek paket + kademe
   modeline göre yeniden yazıldı. (Public repodan ayırma kararı hâlâ açık,
   bkz. "Diğer bekleyenler".)
6. **Rozet seti genişletme (fikir).** AI haftalık kişisel motivasyon özeti,
   yıl dönümü rozeti, stüdyo-içi ay sıralaması (opt-in). Başkan isterse.

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

## ✅ Üye deneyimi — TIER 1 (TAMAMLANDI 2026-08-27)

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
2. ✅ **Üye self-servis seans talebi** — YAPILDI (2026-08-27). session_requests
   tablosu + RLS (üye kendi 'pending' talebini açar/görür; personel karar verir).
   Üye panelinde 'Seans taleplerim' kartı + '+ Seans iste' modalı; işletmeci
   panelinde 'Seans talepleri' kartı Onayla/Reddet ile. Onayda talep takvime
   planlı seans olarak düşer. Migration 0021. Test: tests/session_requests_test.py.
3. ✅ **Programlarım / antrenman geçmişi** — YAPILDI (2026-08-27). Üye panelinde
   'Antrenman geçmişim' kartı: kendi seanslarını (tamamlanan ✓ / iptal ✕ / planlı ◷)
   tarih+program+antrenörle listeler. Şema gerekmez; mevcut sessions'tan.
4. ✅ **İşletmeden üyeye duyuru** — YAPILDI (2026-08-27). announcements tablosu
   + RLS (personel yazar, stüdyo üyeleri okur). İşletmeci ana panelinde 'Duyurular'
   kartı + '+ Duyuru' modalı; üye panelinde 'Duyurular' kartı. Migration 0020.
   Test: tests/announcements_test.py (7 kontrol).
5. ✅ **Paket/kalan gün net görünsün** — YAPILDI (2026-08-27). Üye panelinde
   belirgin 'Paketim' kartı: ilerleme çubuğu + büyük 'X seans kaldı' + yenileme
   uyarısı (≤2 seansta turuncu). Seans bazlı (PT paketi). NOT: takvim bazlı
   üyelik (kalan GÜN) istenirse members'a package_end tarihi eklenmeli — Başkan'a
   sorulacak.

## 🟡 Rakip analizi: MAC+ & Gymwork (2026-09-19) — aday özellikler

Başkan'ın isteğiyle incelendi. MAC+ (MACFit/Mars Athletic'in ücretsiz kulüp
uygulaması; 4,8★ / 45B+ oy, kategori #2) ve Gymwork (bağımsız solo antrenman
defteri; 4,9★ / 139 oy, PRO ₺250–2.000/ay).

**Pivotu doğrulayan bulgular:** MAC+ rozet sistemi + zincirin uygulamayı
tamamen ücretsiz dağıtması → bizim KRR-11 (bireysele ücretsiz) ve KRR-13
(davranış rozetleri) kararlarıyla aynı strateji. Gymwork'ün solo kullanıcıya
₺250–2.000/ay istemesi → bizim "0–10 üye ücretsiz" katmanı güçlü koz.

**Aday özellikler (öneri sırası):**
1. **Antrenman defteri: set/ağırlık/tekrar kaydı** (Gymwork'ün çekirdeği).
   Üye "Antrenmanı başlat" akışında her hareket için set×tekrar×kg girer;
   geçmişi ve kişisel rekoru görünür. Solo sporcu pivotunun 1 numaralı
   eksiği. Rozetlere de beslenir (PR rozeti — davranış: "rekorunu yenile").
2. **Set + dinlenme sayacı** — defterin doğal parçası; telefonda titreşim.
3. **Rozet paylaşımı** — kazanılan rozeti tek dokunuşla WhatsApp/Instagram'a
   paylaşılabilir görsel yapmak (viral döngü; feed altyapısı gerektirmez).
4. Haftalık AI kişisel motivasyon özeti (MAC+ FitBot'un bizdeki karşılığı;
   Forma AI altyapısı hazır).
5. Kas grubu dağılım grafiği (mevcut program/hareket verisinden).
6. Dostça meydan okuma: iki üye arası haftalık seri yarışı (opt-in).

**Bilinçli almadıklarımız:** 1500'lük video kütüphanesi (prodüksiyon maliyeti;
çizim animasyon + antrenör bizde kalır), GPS/açık hava takibi, Tanita cihaz
entegrasyonu, herkese açık sosyal feed (butik ruhu + KVKK yükü), genel
liderlik tablosu (küçük stüdyoda alt sıralar moral bozar; ikili yarış yeter).

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
