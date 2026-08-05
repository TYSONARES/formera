# Formera davet e-postası: canlı gönderim kurulumu

Bu kurulum tamamlanmadan e-posta gövdesi Türkçe/Formera görünebilir; ancak gönderen adı **Supabase Auth** olarak kalır. Bu nedenle gerçek davetler öncesinde özel SMTP gereklidir.

## 1. Göndereni belirle

`davet@formera.me` veya `noreply@formera.me` kullan. Bu adres, seçtiğin e-posta servisinde doğrulanmış olmalı.

## 2. Alan adını doğrula

SMTP sağlayıcısının verdiği SPF ve DKIM DNS kayıtlarını Namecheap → Advanced DNS alanına aynen ekle. Sağlayıcı DMARC kaydı öneriyorsa onu da ekle. DNS doğrulaması tamamlanmadan gönderim başlatma.

## 3. Supabase SMTP ayarları

Supabase Dashboard → **Authentication → SMTP Settings**:

- Enable custom SMTP: açık
- Sender name: `Formera`
- Sender email: seçtiğin doğrulanmış Formera adresi
- Host, port, kullanıcı adı ve şifre: SMTP sağlayıcısının verdiği değerler

Şifreyi `config.js`, GitHub veya herhangi bir frontend dosyasına ekleme.

## 4. Davet şablonu

Supabase Dashboard → **Authentication → Emails → Invite user**:

- Subject: `Formera | Hesabın hazır`
- Body: `invite-email-template.html` dosyasının tamamı

Kaydet. Bu şablon antrenör, diyetisyen ve üye için rol bazlı Türkçe karşılama metni ve Formera giriş butonu içerir.

## 5. Test

İşletmeci hesabıyla canlı dashboard’a gir. Ekip veya Üyeler alanından **E-posta gönder** düğmesini kullanarak kendi dışındaki bir test adresine davet gönder.

- Gönderen `Formera <davet@formera.me>` benzeri görünmeli.
- Tıklanan bağlantı `formera.me/dashboard.html?invite=...` adresine dönmeli.
- Üye “Hoş geldin”, antrenör “Ekibe hoş geldin”, diyetisyen “Bakım ekibine hoş geldin” akışına açılmalı.

Önceden gönderilmiş Supabase Auth e-postaları geriye dönük değişmez; test için yeni bir davet gönder.
