-- Members can read only programs explicitly assigned to them through
-- member_program_selections. Owners, trainers and dietitians retain access
-- to studio programs needed for operational collaboration.
create or replace function public.can_access_program(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.programs p
    where p.id = target_program_id
      and p.studio_id = public.current_studio_id()
      and (
        public.is_owner()
        or public.is_trainer()
        or public.is_dietitian()
        or exists (
          select 1
          from public.member_program_selections s
          join public.members m on m.id = s.member_id
          where s.program_id = p.id
            and m.profile_id = public.current_profile_id()
        )
      )
  );
$$;
