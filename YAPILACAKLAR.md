# Formera — bekleyen işler

Karar defteri `KARARLAR.md`'de. Burası henüz yapılmamış, hatırlatılması gereken işler.

---

## 🔴 Lead bildirim sistemi — HATIRLATILACAK

**Durum:** Landing başvurusu `landing_leads` tablosuna düşüyor ama **kimse görmüyor.**

- Dashboard bu tabloyu hiçbir yerde okumuyor (Pilot CRM farklı tabloyu okuyor: `pilot_leads`)
- Otomatik bildirim yok
- WhatsApp adımı ziyaretçinin "gönder"e basmasına bağlı; basmazsa haber gitmiyor

**Sonuç:** Başvuru geliyor, Başkan Supabase Table Editor'a elle bakmadan fark etmiyor.
Görülmeyen lead, kaybolmuş lead'den çok farklı değil.

**Çözüm (ücretsiz, iki parça):**

1. **Pilot CRM'de göster** — dashboard `landing_leads`'i okusun, Formera Admin
   panelinde listelesin. Bakılacak yer Supabase değil kendi panel olur.
2. **Telegram bildirimi** — Supabase Database Webhook → Telegram Bot API.
   Ücretsiz, anında, spam'e düşmez. Başkan'ın `@BotFather`'dan bot token alması
   gerekiyor (2 dakika), kalanı kodla halledilir.

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
