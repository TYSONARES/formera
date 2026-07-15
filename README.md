# Formera prototipi

PT stüdyoları için işletmeci, antrenör ve üye arayüzü prototipi.

Canlı demo: https://tysonares.github.io/formera/

## Çalıştırma

Klasörde şu komutu çalıştırın:

```bash
npx serve .
```

Alternatif olarak `index.html` dosyasını doğrudan tarayıcıda açabilirsiniz.

Sağ üstteki rol düğmesiyle şu görünümler arasında geçiş yapılabilir:

- İşletmeci
- Antrenör
- Üye

## Pilot kapsamı

- Üye yönetimi
- Program seçimi ve program takibi
- Dijital imza alma
- Takvim ve seans planlama
- Finans / gelir-gider takibi
- Haftalık raporlar
- Ekip / antrenör performansı
- 4 stüdyo pilot seçici
- JSON yedekleme ve geri yükleme

## Backend hazırlığı

Çok cihazlı MVP’ye geçiş için Supabase başlangıç şeması `supabase/` klasöründedir.

Önerilen sıradaki teknik adım:

1. Supabase projesi aç
2. `supabase/schema.sql` dosyasını SQL Editor’da çalıştır
3. `supabase/policies.sql` dosyasını SQL Editor’da çalıştır
4. Supabase Auth içinde owner kullanıcısını oluştur
5. `supabase/seed.sql` içindeki email’i değiştirip örnek veriyi çalıştır
6. localStorage verisini Supabase’e taşı
