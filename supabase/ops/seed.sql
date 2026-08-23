-- Formera örnek başlangıç verisi
-- Önce Supabase Authentication içinde owner kullanıcısını oluştur.
-- Sonra aşağıdaki owner e-postasını kendi e-postanla değiştirip çalıştır.

do $$
declare
  v_owner_auth_id uuid;
  v_studio_id uuid;
  v_owner_profile_id uuid;
  v_trainer_ece_id uuid;
  v_trainer_kerem_id uuid;
  v_member_selin_id uuid;
  v_member_can_id uuid;
  v_program_lower_id uuid;
  v_program_full_id uuid;
begin
  select id into v_owner_auth_id
  from auth.users
  where email = 'OWNER_EMAIL_ADRESINI_BURAYA_YAZ'
  limit 1;

  if v_owner_auth_id is null then
    raise exception 'Owner auth user bulunamadı. Önce Supabase Auth > Users içinde kullanıcı oluştur.';
  end if;

  insert into public.studios (name, initials, location, status)
  values ('NorthFit Studio', 'NF', 'Kadıköy · İstanbul', 'Pilot aktif')
  returning id into v_studio_id;

  insert into public.profiles (studio_id, auth_user_id, full_name, role, phone)
  values (v_studio_id, v_owner_auth_id, 'Ömer Yıldız', 'owner', null)
  returning id into v_owner_profile_id;

  insert into public.profiles (studio_id, full_name, role, phone)
  values
    (v_studio_id, 'Ece', 'trainer', '0532 100 10 10')
  returning id into v_trainer_ece_id;

  insert into public.profiles (studio_id, full_name, role, phone)
  values
    (v_studio_id, 'Kerem', 'trainer', '0532 200 20 20')
  returning id into v_trainer_kerem_id;

  insert into public.members (studio_id, trainer_profile_id, full_name, initials, phone, last_visit_label, sessions_used, sessions_total, status, risk_type)
  values
    (v_studio_id, v_trainer_ece_id, 'Selin Aksoy', 'SA', '0532 000 00 01', 'Bugün', 7, 12, 'Aktif', 'good')
  returning id into v_member_selin_id;

  insert into public.members (studio_id, trainer_profile_id, full_name, initials, phone, last_visit_label, sessions_used, sessions_total, status, risk_type)
  values
    (v_studio_id, v_trainer_ece_id, 'Can Aydın', 'CA', '0532 000 00 05', 'Dün', 5, 8, 'Aktif', 'good')
  returning id into v_member_can_id;

  insert into public.programs (studio_id, title, goal, level, duration_minutes, exercises)
  values
    (v_studio_id, 'Alt vücut güç', 'Kuvvet ve form', 'Orta', 48, '["Goblet squat · 4 × 10","Romanian deadlift · 3 × 12","Walking lunge · 3 × 10","Hip thrust · 4 × 12"]'::jsonb)
  returning id into v_program_lower_id;

  insert into public.programs (studio_id, title, goal, level, duration_minutes, exercises)
  values
    (v_studio_id, 'Fonksiyonel full body', 'Yağ yakımı ve kondisyon', 'Başlangıç', 42, '["Kettlebell deadlift · 3 × 12","TRX row · 3 × 10","Step-up · 3 × 12","Farmer carry · 4 tur"]'::jsonb)
  returning id into v_program_full_id;

  insert into public.member_program_selections (member_id, program_id)
  values (v_member_selin_id, v_program_lower_id);

  insert into public.sessions (studio_id, member_id, trainer_profile_id, program_id, session_date, session_time, room, status)
  values
    (v_studio_id, v_member_selin_id, v_trainer_ece_id, v_program_lower_id, current_date, '09:30', 'Salon A', 'scheduled'),
    (v_studio_id, v_member_can_id, v_trainer_ece_id, v_program_full_id, current_date, '10:30', 'Salon B', 'scheduled');

  insert into public.finance_entries (studio_id, type, title, category, amount, entry_date, status)
  values
    (v_studio_id, 'income', 'Selin Aksoy · 12 seans paket', 'Paket satışı', 9600, current_date, 'paid'),
    (v_studio_id, 'expense', 'Antrenör prim ödemesi', 'Ekip', 7200, current_date, 'paid');
end $$;
