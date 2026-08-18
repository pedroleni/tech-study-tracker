begin;

create table public.user_technology_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en_progreso', 'completado')),
  current_leccion_id uuid references public.lecciones(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, technology_id)
);

create index user_technology_progress_user_id_idx
  on public.user_technology_progress(user_id);
create index user_technology_progress_technology_id_idx
  on public.user_technology_progress(technology_id);

create function private.progress_leccion_belongs_to_technology()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.current_leccion_id is not null and not exists (
    select 1 from public.lecciones l
    where l.id = new.current_leccion_id
      and l.technology_id = new.technology_id
      and l.status = 'publicado'
  ) then
    raise exception 'current_leccion_id must be a published lesson of technology_id';
  end if;
  return new;
end;
$$;

create trigger user_technology_progress_leccion_check
  before insert or update on public.user_technology_progress
  for each row execute function private.progress_leccion_belongs_to_technology();

create trigger user_technology_progress_set_updated_at
  before update on public.user_technology_progress
  for each row execute function private.set_updated_at();

alter table public.user_technology_progress enable row level security;

create policy "user_technology_progress_select_own" on public.user_technology_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Mismo anti-oraculo que favorites_insert_own_public (0003:279-293):
-- solo se puede trackear una tecnologia publica real.
create policy "user_technology_progress_insert_own_public" on public.user_technology_progress
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.technologies t
      where t.id = technology_id
        and t.status = 'completado'
        and private.is_admin(t.user_id)
    )
  );

create policy "user_technology_progress_update_own" on public.user_technology_progress
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_technology_progress_delete_own" on public.user_technology_progress
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.user_technology_progress from anon, authenticated;
grant select, delete on table public.user_technology_progress to authenticated;
grant insert (user_id, technology_id, status, current_leccion_id),
  update (status, current_leccion_id)
  on table public.user_technology_progress to authenticated;

create or replace function public.upsert_my_technology_progress(
  p_technology_id uuid,
  p_status text default null,
  p_current_leccion_id uuid default null,
  p_update_current_leccion boolean default false
)
returns public.user_technology_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result public.user_technology_progress;
begin
  insert into public.user_technology_progress as p (user_id, technology_id, status, current_leccion_id)
  values (
    (select auth.uid()),
    p_technology_id,
    coalesce(p_status, 'pendiente'),
    case when p_update_current_leccion then p_current_leccion_id else null end
  )
  on conflict (user_id, technology_id) do update
  set
    status = coalesce(p_status, p.status),
    current_leccion_id = case
      when p_update_current_leccion then p_current_leccion_id
      else p.current_leccion_id
    end
  returning * into result;

  return result;
end;
$$;

revoke all on function public.upsert_my_technology_progress(uuid, text, uuid, boolean) from public;
grant execute on function public.upsert_my_technology_progress(uuid, text, uuid, boolean) to authenticated;

commit;
