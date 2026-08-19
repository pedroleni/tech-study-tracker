begin;

create table public.user_leccion_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  leccion_id uuid not null references public.lecciones(id) on delete cascade,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en_progreso', 'completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, leccion_id)
);

create index user_leccion_progress_user_id_idx
  on public.user_leccion_progress(user_id);
create index user_leccion_progress_leccion_id_idx
  on public.user_leccion_progress(leccion_id);

create trigger user_leccion_progress_set_updated_at
  before update on public.user_leccion_progress
  for each row execute function private.set_updated_at();

alter table public.user_leccion_progress enable row level security;

create policy "user_leccion_progress_select_own" on public.user_leccion_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Mismo anti-oraculo que user_technology_progress_insert_own_public
-- (0006:34-46): solo se puede trackear una leccion publicada real, dentro
-- de una tecnologia publica real. Sin esto, un usuario podria sondear
-- lecciones en borrador probando inserts y observando exito/fallo.
create policy "user_leccion_progress_insert_own_public" on public.user_leccion_progress
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.lecciones l
      join public.technologies t on t.id = l.technology_id
      where l.id = leccion_id
        and l.status = 'publicado'
        and t.status = 'completado'
        and private.is_admin(t.user_id)
    )
  );

create policy "user_leccion_progress_update_own" on public.user_leccion_progress
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_leccion_progress_delete_own" on public.user_leccion_progress
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.user_leccion_progress from anon, authenticated;
grant select, delete on table public.user_leccion_progress to authenticated;
grant insert (user_id, leccion_id, status), update (status)
  on table public.user_leccion_progress to authenticated;

commit;
