# Formera ödeme akışı

Fiyat modeli KRR-formera-11/12 ile değişti: **tek paket, üye barajlı kademe.**
Eski Starter/Studio/Studio AI üçlemesi kaldırıldı; her özellik her müşteriye
açıktır, fiyat yalnızca üye sayısına göre belirlenir.

## Kademeler (KRR-formera-12, 2026-09-18)

| Kademe | Aylık fiyat | Not |
|---|---|---|
| 0–10 üye | **Ücretsiz** | Bireysel antrenör, koç ve kendi antrenmanını yönetenler dahil; süresiz |
| 11–25 üye | 990 TL | Erken kayıt olan stüdyoya fiyat sabitlenir |
| 26–45 üye | 1.690 TL | " |
| 46–60 üye | 2.490 TL | " |
| 60+ üye | Özel teklif | Görüşmeyle |

Kademe, stüdyonun **aktif üye sayısına** göre belirlenir. Baraj aşıldığında
panelde nazik bir bilgilendirme gösterilecek (YAPILACAKLAR — henüz kodda yok);
tahsilat şimdilik manueldir, otomatik kademelendirme İyzico sonrası gelir.

## Şimdiki akış: erken kayıt + manuel aktivasyon

1. Landing'de erken kayıt formu doldurulur (kullanım tipi + üye barajı seçilir).
2. Başvuru `landing_leads`'e düşer, Telegram bildirimi gelir, Formera Admin
   panelinde listelenir.
3. Tanışma görüşmesinde kademe ve fatura bilgileri teyit edilir; 0–10 üye
   ücretsiz olduğundan bu kademede ödeme adımı yoktur, hesap doğrudan açılır.
4. Ücretli kademede ödeme teyidi sonrası admin hesabı aktive eder; erken kayıt
   fiyatı not edilir ve sabitlenir.

Bu aşamadaki butonlar gerçek kart tahsilatı yapmaz. İyzico hesabı ve ödeme
ürünü onaylandıktan sonra hosted checkout eklenir.

## İyzico hesabı açılışı

İyzico hesabını işletme sahibi olarak siz açmalısınız. Başlangıçta iyzico Link
bireysel başvuru ile test edilebilir; düzenli SaaS tahsilatında mali müşavirle
vergi/fatura modelini netleştirip şirket veya şahıs işletmesi bilgileriyle
ilerleyin. Sanal POS entegrasyonu için iyzico'nun istediği işletme belgeleri
gerekir.

## Otomatik abonelik için sonraki aşama

`supabase/subscriptions.sql` plan ve abonelik durumunu güvenli bir tablo olarak
hazırlar (plan alanı artık kademe kodunu tutacak: `free`, `tier_25`, `tier_45`,
`tier_60`, `tier_custom`). İyzico entegrasyonu tamamlandığında:

- Browser yalnızca hosted checkout'a yönlendirilir.
- İyzico gizli anahtarları Supabase Edge Function secrets içinde tutulur.
- İyzico callback/webhook imzası Edge Function'da doğrulanır.
- Doğrulanan olay `subscriptions` tablosuna yazılır.
- Dashboard kademe yetkisini `status = 'active'` ve dönem tarihleriyle okur.
- Üye sayısı barajı aşınca kademe yükseltme akışı tetiklenir (önce uyarı,
  zorla kilitleme yok — üye kaydetmek hiçbir zaman engellenmez).

Kart bilgisi veya iyzico gizli anahtarı `index.html`, `landing.js` veya
`app.js` içine yazılmamalıdır.
