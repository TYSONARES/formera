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
