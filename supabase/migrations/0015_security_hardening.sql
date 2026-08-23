-- Formera Supabase güvenlik sertleştirme
-- Çalıştırma: policies.sql, role-accounts.sql ve ek görev SQL'leri çalıştıktan sonra çalıştır.
-- Amaç: SECURITY DEFINER helper fonksiyonlarının anonim/public RPC çağrısı olarak açılmasını engellemek.
--
-- Not:
-- - RLS helper fonksiyonları policy değerlendirmesinde authenticated kullanıcı için gereklidir.
-- - claim_profile_by_email() antrenör/üye ilk giriş eşleştirmesi için authenticated kullanıcıda gereklidir.
-- - rls_auto_enable() uygulama kullanıcısının doğrudan çağırması gereken bir fonksiyon değildir.

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.can_access_member(uuid)',
    'public.can_access_profile(uuid, uuid, uuid)',
    'public.can_access_program(uuid)',
    'public.can_manage_member(uuid)',
    'public.claim_profile_by_email()',
    'public.current_profile()',
    'public.current_profile_id()',
    'public.current_role()',
    'public.current_studio_id()',
    'public.is_member()',
    'public.is_owner()',
    'public.is_trainer()'
  ]
  loop
    if to_regprocedure(fn) is not null then
      execute format('revoke execute on function %s from public, anon', fn);
      execute format('grant execute on function %s to authenticated', fn);
    end if;
  end loop;

  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;

select n.nspname as schema,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       p.proacl::text as acl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'can_access_member',
    'can_access_profile',
    'can_access_program',
    'can_manage_member',
    'claim_profile_by_email',
    'current_profile',
    'current_profile_id',
    'current_role',
    'current_studio_id',
    'is_member',
    'is_owner',
    'is_trainer',
    'rls_auto_enable'
  )
order by p.proname, args;
