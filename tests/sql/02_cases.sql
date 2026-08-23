-- Formera RLS dogrulama senaryolari
-- Her senaryo kendi islem blogunda calisir ve geri alinir.
\set ON_ERROR_STOP 0
\echo '--- 1) Uye kendi atanmis programini gorebilmeli (beklenen: 1) ---'
begin;
  set local role authenticated;
  set local test.uid = '11111111-1111-4111-8111-111111111111';
  select count(*) as uyenin_gordugu_program from public.programs;
rollback;

\echo '--- 2) Isletmeci abonelik satiri EKLEYEMEMELI (beklenen: permission denied) ---'
begin;
  set local role authenticated;
  set local test.uid = '22222222-2222-4222-8222-222222222222';
  insert into public.subscriptions(studio_id,plan_code,status)
  values ('33333333-3333-4333-8333-333333333333','studio_ai','active');
rollback;

\echo '--- 3) Anon landing basvurusu YAZABILMELI (beklenen: INSERT 0 1) ---'
begin;
  set local role anon;
  insert into public.landing_leads(contact_name,studio_name,city,source,consent_at)
  values ('Ayse Test','Test Studio','Istanbul','landing',now());
rollback;

\echo '--- 4) Anon basvurulari OKUYAMAMALI (beklenen: permission denied) ---'
begin;
  set local role anon;
  select count(*) from public.landing_leads;
rollback;

\echo '--- 5) Onaysiz basvuru REDDEDILMELI (beklenen: violates RLS policy) ---'
begin;
  set local role anon;
  insert into public.landing_leads(contact_name,studio_name,source)
  values ('Onaysiz','X Studio','landing');
rollback;
