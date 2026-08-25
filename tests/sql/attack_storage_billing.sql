\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

\echo '### STORAGE 1: B sahibi, A studyosunun klasorune (A/logo.png) dosya YUKLEYEBILIYOR mu? (beklenen red)'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  insert into storage.objects(bucket_id,name,owner) values ('formera-media','11111111-0000-4000-8000-00000000000a/logo.png',auth.uid());
rollback;

\echo '### STORAGE 2: B sahibi KENDI klasorune yukleyebilmeli (mesru, beklenen INSERT 1)'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  insert into storage.objects(bucket_id,name,owner) values ('formera-media','22222222-0000-4000-8000-00000000000b/logo.png',auth.uid());
  select 'B kendi klasorune yukledi='||count(*) from storage.objects where name like '22222222%';
rollback;

\echo '### STORAGE 3: ANON dosya yukleyebiliyor mu? (beklenen red)'
begin; set local role anon;
  insert into storage.objects(bucket_id,name) values ('formera-media','x/evil.png');
rollback;

\echo '### SUB 1: Isletmeci kendi aboneligini "active/pro" yapabiliyor mu? (odeme atlama, beklenen red)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000001';
  insert into public.subscriptions(studio_id,plan_code,status) values ('11111111-0000-4000-8000-00000000000a','studio_ai','active');
rollback;

\echo '### SUB 2: Isletmeci var olan abonelik satirini GUNCELLEYEBILIYOR mu? (beklenen red/0)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000001';
  update public.subscriptions set status='active' where studio_id='11111111-0000-4000-8000-00000000000a';
rollback;

\echo '### LEAD 1: KVKK onayi OLMADAN landing basvurusu (beklenen red)'
begin; set local role anon;
  insert into public.landing_leads(contact_name,studio_name,city,source) values ('X','Y','Z','landing');
rollback;

\echo '### LEAD 2: Anon, girilmis landing basvurularini OKUYABILIYOR mu? (rakip casuslugu, beklenen red)'
begin; set local role anon;
  select 'anon lead okudu='||count(*) from public.landing_leads;
rollback;

\echo '### LEAD 3: Cok uzun alanla landing spam (uzunluk siniri var mi? beklenen red)'
begin; set local role anon;
  insert into public.landing_leads(contact_name,studio_name,city,source,consent_at)
    values (repeat('A',5000),'Y','Z','landing',now());
rollback;

\echo '### ADMIN 1: A sahibi kendini formera_admins tablosuna ekleyebiliyor mu? (beklenen red)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000001';
  insert into public.formera_admins(email) values ('owner-a@x.co');
rollback;
