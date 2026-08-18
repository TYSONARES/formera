-- Formera canlı veritabanı durum raporu
-- Supabase Dashboard > SQL Editor > New query > yapıştır > Run.
-- Hiçbir şeyi DEĞİŞTİRMEZ, yalnızca okur.

select 'landing_leads tablosu' as kontrol,
       case when to_regclass('public.landing_leads') is null
            then 'YOK  -> 0014_landing_leads.sql calistirilmali'
            else 'var  -> tamam' end as durum
union all
select 'subscriptions yazma yetkisi',
       case when exists (
              select 1 from information_schema.role_table_grants
              where table_schema='public' and table_name='subscriptions'
                and grantee='authenticated' and privilege_type in ('INSERT','UPDATE'))
            then 'ACIK -> 0010_subscriptions.sql calistirilmali (musteri kendi paketini acabilir)'
            else 'kapali -> tamam' end
union all
select 'uye kendi programini gorebiliyor mu',
       case when pg_get_functiondef(to_regprocedure('public.can_access_program(uuid)')) like '%member_program_selections%'
            then 'evet -> tamam'
            else 'HAYIR -> 0012_member_program_access.sql calistirilmali' end
union all
select 'formera_admins tablosu',
       case when to_regclass('public.formera_admins') is null
            then 'YOK  -> 0013_formera_admins.sql calistirilmali'
            else 'var  -> tamam' end
union all
select 'makeup_requests tablosu',
       case when to_regclass('public.makeup_requests') is null
            then 'YOK  -> 0011_care_makeups.sql calistirilmali'
            else 'var  -> tamam' end
union all
select 'subscriptions tablosu',
       case when to_regclass('public.subscriptions') is null
            then 'YOK  -> 0010_subscriptions.sql calistirilmali'
            else 'var  -> tamam' end;
