\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

\echo '### SALDIRI 1: B sahibi, A studyosunun UYE PII sini okuyabiliyor mu? (beklenen 0)'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  select 'A uye satiri gorunur='||count(*) from public.members where studio_id='11111111-0000-4000-8000-00000000000a';
rollback;

\echo '### SALDIRI 2: B sahibi, A finansini okuyabiliyor mu? (beklenen 0)'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  select 'A finans satiri='||count(*) from public.finance_entries where studio_id='11111111-0000-4000-8000-00000000000a';
rollback;

\echo '### SALDIRI 3: B sahibi, A uyesinin telefonunu GUNCELLEYEBILIYOR mu? (beklenen UPDATE 0)'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  update public.members set phone='HACKED' where studio_id='11111111-0000-4000-8000-00000000000a';
rollback;

\echo '### SALDIRI 4: B sahibi, A studyosunun ADINI degistirebiliyor mu? (beklenen UPDATE 0)'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  update public.studios set name='B ELE GECIRDI' where id='11111111-0000-4000-8000-00000000000a';
rollback;

\echo '### SALDIRI 5: A UYESI kendini owner yapabiliyor mu? (rol yukseltme, beklenen UPDATE 0)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000003';
  update public.profiles set role='owner' where auth_user_id='a0000000-0000-4000-8000-000000000003';
rollback;

\echo '### SALDIRI 6: A ANTRENORU kendini owner yapabiliyor mu? (beklenen UPDATE 0)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000002';
  update public.profiles set role='owner' where auth_user_id='a0000000-0000-4000-8000-000000000002';
rollback;

\echo '### SALDIRI 7: A antrenoru BASKA studyoya kendini tasiyabiliyor mu? (studio_id degistir, beklenen UPDATE 0)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000002';
  update public.profiles set studio_id='22222222-0000-4000-8000-00000000000b' where id='aaaa2222-0000-4000-8000-000000000002';
rollback;

\echo '### SALDIRI 8: A uyesi, ayni studyodaki BASKA uyeleri gorebiliyor mu? (yalnizca kendini gormeli)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000003';
  select 'uyenin gordugu uye sayisi='||count(*) from public.members;
rollback;

\echo '### SALDIRI 9: ANON uye PII okuyabiliyor mu? (beklenen 0)'
begin; set local role anon;
  select 'anon uye='||count(*) from public.members;
rollback;

\echo '### SALDIRI 10: ANON studyo/finans okuyabiliyor mu? (beklenen 0 / hata)'
begin; set local role anon;
  select 'anon finans='||count(*) from public.finance_entries;
rollback;

\echo '### SALDIRI 11: B sahibi A studyosuna UYE ENJEKTE edebiliyor mu? (beklenen 0/red)'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  insert into public.members(id,studio_id,full_name) values (gen_random_uuid(),'11111111-0000-4000-8000-00000000000a','Sizinti');
rollback;

\echo '### SALDIRI 12: Hicbir studyoya bagli olmayan kullanici veri gorebiliyor mu? (beklenen 0)'
begin; set local role authenticated; set local test.uid='c0000000-0000-4000-8000-000000000009';
  select 'bagsiz kullanici uye='||count(*) from public.members;
  select 'bagsiz kullanici studyo='||count(*) from public.studios;
rollback;
