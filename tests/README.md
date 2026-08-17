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

> Not: Test `localStorage`'ı temizler. Gerçek verinizin olduğu bir tarayıcı
> profilinde değil, ayrı bir Chromium örneğinde çalışır (Playwright kendi
> profilini açar), bu yüzden mevcut demo verinize dokunmaz.
