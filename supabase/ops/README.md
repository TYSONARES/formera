# Tek seferlik operasyon script'leri

Bunlar migration **değildir**. Şemayı değiştirmezler, sıraya girmezler ve
otomatik çalıştırılmazlar. Yalnızca ilgili durum oluştuğunda, ne yaptığını
okuyup anladıktan sonra elle çalıştırın.

| Dosya | Ne zaman |
|---|---|
| `seed.sql` | Boş bir projeye demo verisi doldurmak için. Canlı müşteri verisi olan projede **çalıştırmayın**. |
| `recover-owner-onboarding.sql` | Önceden oluşturulmuş owner + stüdyo kaydını, aynı e-postayla giriş yapan kullanıcıya yeniden bağlamak için. |
| `repair-member-accounts.sql` | Davet sonrası `profiles.role='member'` kaydının kendi `members` kartına bağlanmadığı durumlarda. |
