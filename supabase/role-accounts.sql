-- Formera gerçek rol ve hesap bağlantısı
-- Çalıştırma: Supabase Dashboard > SQL Editor > New query.
-- Amaç: İşletmecinin e-posta ile antrenör/üye profili hazırlaması,
-- kullanıcının aynı e-postayla giriş yaptığında profilinin otomatik bağlanması.

alter table public.profiles
  add column if not exists email text;

alter table public.members
  add column if not exists profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists email text;

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists members_profile_id_idx on public.members (profile_id);
create index if not exists members_email_idx on public.members (lower(email));

create or replace function public.claim_profile_by_email()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_email text;
begin
  select *
  into v_profile
  from public.profiles
  where auth_user_id = auth.uid()
  limit 1;

  if v_profile.id is not null then
    return v_profile;
  end if;

  v_email := lower(coalesce(auth.email(), nullif(current_setting('request.jwt.claim.email', true), '')));

  if v_email is null or v_email = '' then
    return null;
  end if;

  update public.profiles
  set auth_user_id = auth.uid()
  where id = (
    select id
    from public.profiles
    where auth_user_id is null
      and lower(email) = v_email
    order by created_at asc
    limit 1
  )
  returning * into v_profile;

  return v_profile;
end;
$$;

grant execute on function public.claim_profile_by_email() to authenticated;
