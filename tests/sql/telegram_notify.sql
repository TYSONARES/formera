-- landing_leads Telegram bildirim trigger'i dogrulama senaryolari.
-- pg_net ve vault SHIMLENIR (00c). Gercek Telegram cagrisi yapilmaz; net._calls
-- tablosuna kaydedilen "sanki gonderilecek" istek incelenir.
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

\echo '--- 1) Sir YOKken basvuru kaydedilir, bildirim cagrilmaz (beklenen: kayit var, cagri 0) ---'
insert into public.landing_leads(contact_name,studio_name,city,phone,members,goal,package_code,value,source,consent_at)
  values ('Ayse','FitZone','Izmir','05551112233','50-100','Uye takibi','studio_ai',9600,'landing',now());
select 'kayit='||count(*)||' cagri='||(select count(*) from net._calls) from public.landing_leads;

\echo '--- 2) Vault sirlari eklenince yeni basvuru bildirim cagirir (beklenen: cagri 1) ---'
insert into vault.decrypted_secrets(name,decrypted_secret) values
  ('telegram_bot_token','111:TESTTOKEN'),('telegram_chat_id','999');
insert into public.landing_leads(contact_name,studio_name,city,phone,members,goal,package_code,value,source,consent_at)
  values ('Mehmet','PowerHouse','Ankara','05445556677','0-50','Program','studio',4800,'landing',now());
select 'cagri='||count(*) from net._calls;

\echo '--- 3) URL token+sendMessage, govde chat_id ve mesaj dogru mu ---'
select 'url_ok='||(url = 'https://api.telegram.org/bot111:TESTTOKEN/sendMessage')
       ||' chat_ok='||((body->>'chat_id')='999')
       ||' studio_ok='||((body->>'text') like '%PowerHouse%')
       ||' phone_ok='||((body->>'text') like '%05445556677%')
  from net._calls order by id desc limit 1;

\echo '--- 4) Bicim karakterli alan duz metin olarak gecer (parse_mode yok) ---'
insert into public.landing_leads(contact_name,studio_name,city,phone,members,goal,package_code,value,source,consent_at)
  values ('x','*Mark* _down_','Bursa','0555','10','[l](http://e)','starter',0,'landing',now());
select 'ham_metin='||((body->>'text') like '%*Mark* _down_%') from net._calls order by id desc limit 1;
