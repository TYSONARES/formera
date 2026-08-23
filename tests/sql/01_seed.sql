-- superuser olarak tohumla (RLS baypas)
insert into auth.users(id,email) values
  ('11111111-1111-4111-8111-111111111111','uye@test.co'),
  ('22222222-2222-4222-8222-222222222222','sahip@test.co') on conflict do nothing;
insert into public.studios(id,name) values ('33333333-3333-4333-8333-333333333333','Test') on conflict do nothing;
insert into public.profiles(id,studio_id,full_name,role,email,auth_user_id) values
  ('44444444-4444-4444-8444-444444444444','33333333-3333-4333-8333-333333333333','Sahip','owner','sahip@test.co','22222222-2222-4222-8222-222222222222'),
  ('55555555-5555-4555-8555-555555555555','33333333-3333-4333-8333-333333333333','Uye','member','uye@test.co','11111111-1111-4111-8111-111111111111')
  on conflict do nothing;
insert into public.members(id,studio_id,profile_id,full_name) values
  ('66666666-6666-4666-8666-666666666666','33333333-3333-4333-8333-333333333333','55555555-5555-4555-8555-555555555555','Uye')
  on conflict do nothing;
insert into public.programs(id,studio_id,title) values
  ('77777777-7777-4777-8777-777777777777','33333333-3333-4333-8333-333333333333','Alt vucut')
  on conflict do nothing;
insert into public.member_program_selections(member_id,program_id) values
  ('66666666-6666-4666-8666-666666666666','77777777-7777-4777-8777-777777777777')
  on conflict do nothing;
