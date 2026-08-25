-- Iki ayri studyo + roller. Saldirgan senaryolari icin capraz veri.
insert into auth.users(id,email) values
  ('a0000000-0000-4000-8000-000000000001','owner-a@x.co'),   -- A studyosu sahibi
  ('a0000000-0000-4000-8000-000000000002','trainer-a@x.co'), -- A studyosu antrenoru
  ('a0000000-0000-4000-8000-000000000003','member-a@x.co'),  -- A studyosu uyesi
  ('b0000000-0000-4000-8000-000000000001','owner-b@x.co'),   -- B studyosu sahibi (SALDIRGAN)
  ('c0000000-0000-4000-8000-000000000009','nobody@x.co')     -- hicbir studyoya bagli degil
  on conflict do nothing;

insert into public.studios(id,name,setup_completed) values
  ('11111111-0000-4000-8000-00000000000a','A Studio',true),
  ('22222222-0000-4000-8000-00000000000b','B Studio',true) on conflict do nothing;

insert into public.profiles(id,studio_id,full_name,role,email,auth_user_id) values
  ('aaaa1111-0000-4000-8000-000000000001','11111111-0000-4000-8000-00000000000a','A Sahip','owner','owner-a@x.co','a0000000-0000-4000-8000-000000000001'),
  ('aaaa2222-0000-4000-8000-000000000002','11111111-0000-4000-8000-00000000000a','A Antrenor','trainer','trainer-a@x.co','a0000000-0000-4000-8000-000000000002'),
  ('aaaa3333-0000-4000-8000-000000000003','11111111-0000-4000-8000-00000000000a','A Uye','member','member-a@x.co','a0000000-0000-4000-8000-000000000003'),
  ('bbbb1111-0000-4000-8000-000000000001','22222222-0000-4000-8000-00000000000b','B Sahip','owner','owner-b@x.co','b0000000-0000-4000-8000-000000000001')
  on conflict do nothing;

insert into public.members(id,studio_id,profile_id,trainer_profile_id,full_name,phone) values
  ('aaaaaaaa-0000-4000-8000-000000000001','11111111-0000-4000-8000-00000000000a','aaaa3333-0000-4000-8000-000000000003','aaaa2222-0000-4000-8000-000000000002','A Uye Gizli','05550001122')
  on conflict do nothing;

insert into public.programs(id,studio_id,title) values
  ('aaaaaaaa-0000-4000-8000-000000000101','11111111-0000-4000-8000-00000000000a','A Program') on conflict do nothing;

insert into public.finance_entries(id,studio_id,type,title,amount,entry_date) values
  ('aaaaaaaa-0000-4000-8000-000000000201','11111111-0000-4000-8000-00000000000a','income','A Gelir',9600,'2026-08-01') on conflict do nothing;
