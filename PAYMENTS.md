# Formera ödeme akışı

## Şimdiki pilot akışı: manuel aktivasyon

1. Landing sayfasında işletme Starter, Studio veya Studio AI planını seçer.
2. Başvuru formu WhatsApp üzerinden gelir ve Formera Admin pilot CRM’e kaydolur.
3. Pilot görüşmesinde ödeme yöntemi ve fatura bilgileri teyit edilir.
4. Ödeme teyit edilince admin, stüdyonun paketini manuel olarak `active` yapar.
5. Aktivasyon ve bitiş tarihi not edilir; ilk 4 stüdyoda kullanım ve geri bildirim takip edilir.

Bu aşamadaki butonlar gerçek kart tahsilatı yapmaz. Kullanıcıyı güvenli pilot başvurusuna taşır; iyzico hesabı ve ödeme ürünü onaylandıktan sonra checkout URL’si eklenir.

## İyzico hesabı açılışı

İyzico hesabını işletme sahibi olarak siz açmalısınız. Başlangıçta iyzico Link bireysel başvuru ile test edilebilir; düzenli SaaS tahsilatında mali müşavirle vergi/fatura modelini netleştirip şirket veya şahıs işletmesi bilgileriyle ilerleyin. Sanal POS entegrasyonu için iyzico’nun istediği işletme belgeleri gerekir.

## Otomatik abonelik için sonraki aşama

`supabase/subscriptions.sql` dosyası plan ve abonelik durumunu güvenli bir tablo olarak hazırlar. İyzico entegrasyonu tamamlandığında:

- Browser yalnızca hosted checkout’a yönlendirilir.
- İyzico gizli anahtarları Supabase Edge Function secrets içinde tutulur.
- İyzico callback/webhook imzası Edge Function’da doğrulanır.
- Doğrulanan olay `subscriptions` tablosuna yazılır.
- Dashboard plan yetkisini `status = 'active'` ve dönem tarihleriyle okur.

Kart bilgisi veya iyzico gizli anahtarı `index.html`, `landing.js` veya `app.js` içine yazılmamalıdır.
