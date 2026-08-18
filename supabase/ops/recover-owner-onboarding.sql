-- Formera: mevcut işletme hesabını güvenle yeniden eşleştirme
--
-- Amaç: Önceden oluşturulmuş owner + stüdyo kaydını, aynı e-postayla giriş
-- yapan kullanıcıya bağlamak ve sadece o stüdyonun "kurulum tamamlandı"
-- durumunu onarmak. Üye, antrenör, program ve davet kayıtlarını silmez.

create or replace function public.recover_owner_onboarding()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_profile public.profiles;
  v_studio public.studios;
begin
  if auth.uid() is null then
    raise exception 'Oturum bulunamadı.';
  end if;

  v_email := lower(coalesce(auth.email(), nullif(current_setting('request.jwt.claim.email', true), '')));
  if v_email is null or v_email = '' then
    return jsonb_build_object('found', false);
  end if;

  -- Önce oturum kimliğiyle bağlı işletmeciyi bul; yoksa aynı e-postadaki
  -- henüz bir Auth hesabına bağlanmamış owner profilini güvenle sahiplen.
  select * into v_profile
  from public.profiles
  where auth_user_id = auth.uid()
    and role = 'owner'
  limit 1;

  if v_profile.id is null then
    update public.profiles
    set auth_user_id = auth.uid(),
        email = coalesce(email, v_email)
    where id = (
      select id
      from public.profiles
      where role = 'owner'
        and auth_user_id is null
        and lower(email) = v_email
      order by created_at asc
      limit 1
    )
    returning * into v_profile;
  end if;

  if v_profile.id is null or v_profile.studio_id is null then
    return jsonb_build_object('found', false);
  end if;

  update public.studios
  set setup_completed = true,
      status = case
        when coalesce(nullif(trim(status), ''), '') = '' then 'Kurulum tamamlandı'
        else status
      end
  where id = v_profile.studio_id
  returning * into v_studio;

  return jsonb_build_object(
    'found', true,
    'studio_id', v_studio.id,
    'studio_name', v_studio.name,
    'setup_completed', v_studio.setup_completed
  );
end;
$$;

grant execute on function public.recover_owner_onboarding() to authenticated;
