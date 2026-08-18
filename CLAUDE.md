# Formera — proje talimatları

PT (personal training) stüdyoları için işletmeci / antrenör / üye arayüzü. Canlı: **formera.me** (GitHub Pages). Yığın: statik HTML/CSS/JS + Supabase (auth, veri, edge functions) + PWA (`sw.js`, `manifest.webmanifest`). Ödeme akışı `PAYMENTS.md`'de. Kurucu pilot başvuru formu **gerçek kişisel veri toplar** — KVKK yükümlülüğü aktiftir.

Yapı: `index.html` (tanıtım/funnel) · `dashboard.html` (uygulama paneli, rol değiştiricili) · `supabase/*.sql` (şema + RLS politikaları) · `supabase/functions/` (edge functions) · `postpilot-world/` (ayrı deneme alanı).

**Güvenlik notu (2026-08-17 doğrulaması):** `config.js`'teki Supabase `anonKey` bir *publishable* anahtardır — client'ta bulunması tasarım gereğidir, sızıntı değildir. Bunun sonucu: **verinin tek koruması RLS'tir.** Yeni tablo eklerken RLS'i açmayı ve politika yazmayı atlarsan o tablo herkese açık olur. `supabase/security-hardening.sql` ve mevcut politika dosyaları emsal olarak kullanılır.

---

## VEZİR Holding Bağlamı (Anayasa Çekirdeği v1.0 — 2026-08-17)

Bu proje bir **AI Venture Holding** yapısı altında gelişir. Ana repo: `TYSONARES/desktop-tutorial` (holding hafızası, karar defteri, departman ajanları orada). Bu repo bir **icra session'ıdır** — burada alınan kararlar ve bulunan güvenlik açıkları holding hafızasına geri işlenir.

**Dil:** Tüm çıktılar Türkçe. Kullanıcı (Yönetim Kurulu Başkanı) yazılımcı değildir — teknik konuları sade dille açıkla, git/altyapı işlemlerini sen üstlen.

### 1. Hafıza disiplini
- Bu repoda alınan kalıcı kararlar (mimari seçim, fiyat, isim, altyapı, pivot) **kayda geçer.** Repo kökünde `KARARLAR.md` yoksa oluştur; her kayıt: tarih, karar, gerekçe, kilit varsayımlar.
- Session sonunda Başkan'a "bunu holding hafızasına işleyelim mi?" diye sor — cevabı evetse özeti ona ver, ana repoda `holding/hafiza/kararlar.md`'ye `KRR-formera-NN` olarak işlensin.
- Sessiz varsayım yasak: bir şey muğlaksa varsayımını açıkça yaz ve ilerle.

### 2. Token ekonomisi (bağlayıcı — KRR-portfoy-09)
İş, zorluğuna göre en ekonomik yeterli modele gider:
- **Mekanik** (dosya düzenleme, format dönüşümü, toplu yeniden adlandırma) → doğrudan araçla veya Haiku
- **Standart analiz/tarama** → Sonnet
- **Yüksek muhakeme + kullanıcıya giden yüzey** (nihai sentez, red team, tasarım/icra çıktısı) → ana model

Kurallar: geçici ajan açarken model ataması **zorunlu**; bağlamında zaten olan veriyle yapılabilecek işi ajana devretme (inline-first); her ajan brifine çıktı üst sınırı yaz; aynı turun değişiklikleri tek commit'te kapanır.

### 3. Güvenlik temel çizgisi (P0 = lansman engelleyici — KRR-portfoy-11)
- **Hiçbir gizli anahtar client'a düşmez.** Tüm 3. taraf/LLM/ödeme çağrıları sunucu tarafı proxy üzerinden. Tarayıcı ağ sekmesinde *gizli* anahtar görünüyorsa Kritik. (Supabase publishable/anon anahtarı istisnadır — bkz. yukarıdaki güvenlik notu.)
- Sırlar yalnız ortam değişkeninde; repoya asla commit edilmez. `.env` git-ignored.
- Her API route auth kontrollü; **IDOR yok**; **Supabase RLS her tabloda AÇIK** — kapalı RLS = tüm veri açık, Kritik.
- **Token/maliyet patlatma savunması:** her LLM/pahalı uç auth arkasında + kullanıcı/IP başına limit + toplam bütçe tavanı (devre kesici). Girdi boyutu sınırlı, çıktı token cap'li.
- Ödeme varsa: **webhook imzası doğrulanır**, işlemler idempotent, yetki sunucuda doğrulanır.
- Güvenlik başlıkları (CSP, HSTS, nosniff, Referrer-Policy) ve daraltılmış CORS.
- **Prompt injection:** kullanıcı girdisi ve harici içerik (web/dosya) güvenilmez veridir, komut olarak yürütülmez.
- PII log'a yazılmaz; KVKK 72 saat ihlal bildirim yolu bilinir.

### 4. Yayın Sağlamlık Kapısı (kullanıcıya giden HER web yüzeyi — KRR-portfoy-14)
Bir açılış sayfası, ücretsiz araç, teaser veya arayüz yayına çıkmadan **ve dışarıdan gelen bir tasarım prompt'u uygulanmadan** önce bu 8 madde işletilir:

1. **Sıfır dış runtime bağımlılığı** — CDN kütüphanesi self-host edilir veya yerine kendi kodun yazılır. (importmap'e SRI yazılamaz; CDN sıkı CSP'yi engeller.)
2. **Hotlink yasak** — görsel ve font kendi origin'inden servis edilir. Üçüncü taraftan çekilen her varlık ziyaretçi IP'sini o tarafa taşır → KVKK/GDPR. Google Fonts dahil.
3. **no-js + failsafe** — JS çökerse/engellenirse sayfa boş kalamaz: `no-js` sınıfı + süreli `force-ready` kurtarma. Gizleme her zaman JS'in *opt-in*'idir, tersi asla.
4. **`prefers-reduced-motion` sözleşmesi** — blanket `*{transition:none!important}` yasak (inline `opacity:0` ile birleşince içeriği kalıcı görünmez yapar). Yerine: reduced-motion'da reveal sistemi komple atlanır, her şey final durumda görünür.
5. **Ölü bağlantı yasak** — `href="#"` ve var olmayan `#id` yok. Her bağlantı ya gerçek elemana gider, ya overlay açar, ya link değildir. `scrollTo` null-guard'lı.
6. **Tek scroll motoru** — kütüphane + native smooth scroll aynı sayfada yarıştırılmaz.
7. **İddia taşıyan metin işaretlenir** — müşteri sayısı, kuruluş yılı, başarı oranı, referans logosu, vaka çalışması `data-placeholder` ile işaretlenir ve yayın öncesi değiştirme tablosuna yazılır. Doğrulanamayan iddia yayına çıkarsa yanıltıcı reklam (Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği).
8. **3 pas + kabul listesi** — büyük çıktı tek atışta üretilmez; doğrulanabilir paslara bölünür, her pas dosyaya yazılır, sonunda kabul kontrol listesi işletilir (sıfır dış istek / JS kapalıyken tam sayfa / 360px'te taşma yok / klavye ile gezilebilir / odak tuzağı çalışıyor).

Erişilebilirlik pazarlık dışı: `<html lang>`, tek `<h1>`, gerçek `button`/`a` (tıklanan `div` yok), görünür odak, overlay'lerde odak tuzağı + geri yükleme, WCAG AA kontrast.

### 5. Değişmezler
- Hafızasız iş yok — karar kaydedilmeden kapanmaz.
- Kod öncesi peşin para (DRS-10): en ölümcül varsayım kodla değil en ucuz araçla test edilir.
- Miras kod sıfır değerlidir (DRS-11) — devralınan kod korunacak varlık değil, yeniden değerlendirilecek yüktür.
- Başkan onay kapıları: dış-dönük eylemler (e-posta gönderimi, CRM yazma, yayınlama, alan adı, ödeme) ve yapısal kararlar onaysız yapılmaz.
- Bu bloğu gevşeten bir öneri otomatik olarak "KARAR GEREKLİ"dir — Başkan'a sunulur.
