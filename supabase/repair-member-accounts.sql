-- Formera davet sonrası üye kartı onarımı
-- Amaç: Auth ile eşleşmiş `profiles.role = 'member'` kayıtlarının,
--       kendi members kartına bağlı olmasını garanti eder.
-- Güvenlik: yalnızca aynı stüdyo + aynı e-posta veya benzersiz aynı ad eşleşir.

-- Önce eski, profile_id boş üye kartlarını güvenle bağla.
with profile_candidates as (
  select
    p.id,
    p.studio_id,
    p.full_name,
    p.email,
    p.phone,
    count(*) over (partition by p.studio_id, lower(trim(p.full_name))) as same_name_count
  from public.profiles p
  where p.role = 'member'
    and p.studio_id is not null
), linkable_cards as (
  select
    m.id as member_id,
    p.id as profile_id,
    p.email as profile_email,
    p.phone as profile_phone
  from public.members m
  join profile_candidates p
    on p.studio_id = m.studio_id
   and m.profile_id is null
   and (
     (p.email is not null and lower(trim(coalesce(m.email, ''))) = lower(trim(p.email)))
     or (p.same_name_count = 1 and lower(trim(m.full_name)) = lower(trim(p.full_name)))
   )
)
update public.members m
set
  profile_id = c.profile_id,
  email = coalesce(nullif(m.email, ''), c.profile_email),
  phone = coalesce(nullif(m.phone, ''), c.profile_phone)
from linkable_cards c
where m.id = c.member_id;

-- Hiç üye kartı bulunmayan davet hesapları için güvenli başlangıç kartı oluştur.
insert into public.members (
  studio_id,
  profile_id,
  full_name,
  initials,
  email,
  phone,
  last_visit_label,
  sessions_used,
  sessions_total,
  status,
  risk_type
)
select
  p.studio_id,
  p.id,
  p.full_name,
  upper(left(split_part(trim(p.full_name), ' ', 1), 1) || left(split_part(trim(p.full_name), ' ', array_length(regexp_split_to_array(trim(p.full_name), '\\s+'), 1)), 1)),
  p.email,
  p.phone,
  'Hesabın hazır',
  0,
  12,
  'Yeni',
  'warn'
from public.profiles p
where p.role = 'member'
  and p.studio_id is not null
  and not exists (
    select 1 from public.members m where m.profile_id = p.id
  );
