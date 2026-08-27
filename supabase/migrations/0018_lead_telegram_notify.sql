-- 0018_lead_telegram_notify.sql
-- Yeni bir landing_leads başvurusu düştüğünde Telegram'a anlık bildirim gönderir.
--
-- Güvenlik: bot token'ı ve chat_id BU DOSYADA YOKTUR. İkisi de Supabase Vault'ta
-- şifreli saklanır ve trigger fonksiyonu (security definer) çalışma anında okur.
-- Böylece sır Git'e hiç girmez. Kurulum adımları:
--   supabase/ops/telegram-notify-setup.sql
--
-- Bağımlılıklar: pg_net (HTTP çağrısı) ve supabase_vault (sır saklama).
-- Her ikisi de Supabase projelerinde mevcuttur.

-- pg_net Supabase'de mevcuttur. Eklentinin bulunmadığı ortamlarda (yerel test)
-- migration'ın geri kalanı yine uygulanabilsin diye hatayı yutuyoruz; bildirim
-- özelliği o ortamda sessizce devre dışı kalır.
do $$ begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net eklentisi yok; Telegram bildirimi bu ortamda devre disi.';
end $$;

-- Vault sırlarını isimle okuyan küçük yardımcı. Vault yoksa / sır yoksa null
-- döner; çağıran taraf bunu sessizce tolere eder.
create or replace function public.formera_secret(p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_value text;
begin
  select decrypted_secret into v_value
  from vault.decrypted_secrets
  where name = p_name
  limit 1;
  return v_value;
exception when others then
  -- Vault eklentisi yoksa veya erişilemezse bildirim özelliği devre dışı kalır,
  -- ama başvuru akışı asla kırılmaz.
  return null;
end;
$$;

revoke all on function public.formera_secret(text) from anon, authenticated;

create or replace function public.notify_lead_telegram()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_chat  text;
  v_text  text;
begin
  v_token := public.formera_secret('telegram_bot_token');
  v_chat  := public.formera_secret('telegram_chat_id');

  -- Yapılandırma tamamlanmadıysa sessizce çık. Başvuru yine de kaydedilir.
  if v_token is null or v_chat is null then
    return new;
  end if;

  -- Düz metin mesaj (parse_mode YOK): kullanıcı kaynaklı alanlar biçim
  -- karakterleri içerse bile güvenli, enjeksiyon riski yok.
  v_text :=
    '🔔 Yeni Formera başvurusu' || E'\n' ||
    'Stüdyo: '  || coalesce(new.studio_name, '-')  || E'\n' ||
    'İsim: '    || coalesce(new.contact_name, '-') || E'\n' ||
    'Telefon: ' || coalesce(new.phone, '-')        || E'\n' ||
    'Şehir: '   || coalesce(new.city, '-')         || E'\n' ||
    'Üye: '     || coalesce(new.members, '-')       || E'\n' ||
    'Paket: '   || coalesce(new.package_code, '-')  || E'\n' ||
    'Hedef: '   || coalesce(new.goal, '-')          || E'\n' ||
    'Zaman: '   || to_char(new.created_at, 'DD.MM.YYYY HH24:MI');

  -- pg_net asenkrondur: istek kuyruğa alınır, INSERT'i bekletmez ve bir ağ
  -- hatası başvuruyu düşürmez.
  perform net.http_post(
    url     := 'https://api.telegram.org/bot' || v_token || '/sendMessage',
    body    := jsonb_build_object('chat_id', v_chat, 'text', v_text, 'disable_web_page_preview', true),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );

  return new;
exception when others then
  -- Bildirim hattındaki hiçbir hata başvuru kaydını engellemez.
  -- Görülmeyen lead kötüdür; kaybolan lead felakettir.
  return new;
end;
$$;

drop trigger if exists lead_telegram_notify on public.landing_leads;
create trigger lead_telegram_notify
after insert on public.landing_leads
for each row execute function public.notify_lead_telegram();
