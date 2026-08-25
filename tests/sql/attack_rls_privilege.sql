\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

\echo '### INCE 1: profiles owner-only guncelleme; uye/antrenor kendi satirini yazamaz (fail-closed, beklenen UPDATE 0)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000003';
  update public.profiles set full_name='Yeni Ad' where id='aaaa3333-0000-4000-8000-000000000003';
rollback;

\echo '### INCE 2: A uyesi kendi satirinda SADECE rolu owner yapmaya calisiyor (beklenen: red/0)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000003';
  update public.profiles set role='owner' where id='aaaa3333-0000-4000-8000-000000000003';
  select 'guncellenen='||count(*) from public.profiles where id='aaaa3333-0000-4000-8000-000000000003' and role='owner';
rollback;

\echo '### INCE 3: A antrenoru, kendine ATANMAMIS bir uyeyi gorebiliyor mu?'
\echo '        (A studyosunda tek uye zaten antrenore atanmis; atamasiz uye ekleyip test)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000001';
  insert into public.members(id,studio_id,profile_id,trainer_profile_id,full_name)
    values ('dddddddd-0000-4000-8000-000000000001','11111111-0000-4000-8000-00000000000a',null,null,'Atamasiz Uye');
  -- ayni islemde owner ekledi; simdi antrenor gorebiliyor mu bak (owner ekledigi icin commit gerekiyor)
rollback;

\echo '### INCE 4: A UYESI kendine program atayabiliyor mu? (member_program_selections insert, beklenen red)'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000003';
  insert into public.member_program_selections(member_id,program_id)
    values ('aaaaaaaa-0000-4000-8000-000000000001','aaaaaaaa-0000-4000-8000-000000000101');
rollback;

\echo '### INCE 5: A antrenoru, BASKA studyodaki (B) uyeyi gorebiliyor mu? once B ye uye ekleyelim'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  insert into public.members(id,studio_id,full_name) values ('eeeeeeee-0000-4000-8000-000000000001','22222222-0000-4000-8000-00000000000b','B Uye');
  select 'B eklendi='||count(*) from public.members where id='eeeeeeee-0000-4000-8000-000000000001';
rollback;

\echo '### INCE 6: SECURITY DEFINER fonksiyonlari search_path sabitlenmis mi? (injection savunmasi)'
\pset tuples_only off
\pset format aligned
select proname, prosecdef as sec_definer,
       coalesce(array_to_string(proconfig,','),'(YOK!)') as ayarlar
from pg_proc
where pronamespace='public'::regnamespace and prosecdef
order by proname;
