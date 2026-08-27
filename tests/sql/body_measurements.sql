-- body_measurements RLS dogrulama (attack_seed.sql tohumu ile).
\set ON_ERROR_STOP 0
\pset tuples_only on
\pset format unaligned

-- superuser: A studyosuna bir olcum ekle
insert into public.body_measurements(studio_id,member_id,measured_on,weight_kg)
  values ('11111111-0000-4000-8000-00000000000a','aaaaaaaa-0000-4000-8000-000000000001','2026-08-01',80.5);

\echo '--- 1) A uyesi KENDI olcumunu gorur (beklenen 1) ---'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000003';
  select 'gorunen='||count(*) from public.body_measurements;
rollback;

\echo '--- 2) B sahibi A olcumunu OKUYAMAZ (beklenen 0) ---'
begin; set local role authenticated; set local test.uid='b0000000-0000-4000-8000-000000000001';
  select 'B_gordugu='||count(*) from public.body_measurements;
rollback;

\echo '--- 3) A sahibi olcum EKLER (beklenen INSERT 0 1) ---'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000001';
  insert into public.body_measurements(studio_id,member_id,measured_on,weight_kg)
    values ('11111111-0000-4000-8000-00000000000a','aaaaaaaa-0000-4000-8000-000000000001','2026-08-15',79.0);
rollback;

\echo '--- 4) A UYESI olcum EKLEYEMEZ (salt okunur, beklenen RLS red) ---'
begin; set local role authenticated; set local test.uid='a0000000-0000-4000-8000-000000000003';
  insert into public.body_measurements(studio_id,member_id,measured_on,weight_kg)
    values ('11111111-0000-4000-8000-00000000000a','aaaaaaaa-0000-4000-8000-000000000001','2026-08-20',78.0);
rollback;

\echo '--- 5) anon OKUYAMAZ (beklenen permission denied) ---'
begin; set local role anon; select count(*) from public.body_measurements; rollback;
