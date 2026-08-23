// Bu anahtar tarayıcı uygulamaları için yayımlanabilir Supabase anahtarıdır.
// Güvenlik, Supabase Row Level Security politikalarıyla sağlanır; service_role
// anahtarı kesinlikle istemciye eklenmez.
window.FORMERA_SUPABASE = {
  url: 'https://andrqqhjuyverydgpelu.supabase.co',
  anonKey: 'sb_publishable_ohnWARHjU8MpLDCP3zMuwg_P9VxN8mL'
};

// Landing başvurusunun WhatsApp'a düşmesi için işletme numarası.
// Biçim: ülke kodu + numara, yalnızca rakam. Örn. Türkiye 0532 111 22 33 -> '905321112233'
// Boş bırakılırsa WhatsApp butonu gizlenir; başvuru yine Supabase'e kaydedilir.
window.FORMERA_CONTACT = {
  whatsapp: ''
};
