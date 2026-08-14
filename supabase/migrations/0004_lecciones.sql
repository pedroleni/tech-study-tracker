begin;

create table public.lecciones (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references public.technologies(id) on delete cascade,
  slug text not null,
  modulo text,
  titulo text not null check (char_length(trim(titulo)) between 1 and 120),
  resumen text not null default '' check (char_length(resumen) <= 300),
  contenido text not null default '' check (char_length(contenido) <= 60000),
  orden integer not null,
  status text not null default 'borrador'
    check (status in ('borrador', 'publicado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (technology_id, slug)
);

alter table public.lecciones enable row level security;

-- Dos ramas, igual que technologies_select_public (0003:90-99):
-- pública real, y auto-vista del admin sobre sus propios borradores.
create policy "lecciones_select_public" on public.lecciones
  for select
  to anon, authenticated
  using (
    (
      status = 'publicado'
      and exists (
        select 1 from public.technologies t
        where t.id = lecciones.technology_id
          and t.status = 'completado'
          and private.is_admin(t.user_id)
      )
    )
    or exists (
      select 1 from public.technologies t
      where t.id = lecciones.technology_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  );

-- Patrón ownership, NO status='completado': crear/editar/borrar lecciones
-- no depende de que la tecnología padre ya esté publicada.
create policy "lecciones_insert_admin" on public.lecciones
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.technologies t
      where t.id = technology_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  );

create policy "lecciones_update_admin" on public.lecciones
  for update
  to authenticated
  using (
    exists (
      select 1 from public.technologies t
      where t.id = lecciones.technology_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.technologies t
      where t.id = technology_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  );

create policy "lecciones_delete_admin" on public.lecciones
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.technologies t
      where t.id = lecciones.technology_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  );

alter table public.comments drop column technology_id;
alter table public.comments
  add column leccion_id uuid not null references public.lecciones(id) on delete cascade;

drop index if exists comments_technology_created_at_idx;
create index comments_leccion_created_at_idx
  on public.comments(leccion_id, created_at);

create or replace function private.comment_write_is_valid()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  parent_leccion_id uuid;
  parent_of_parent uuid;
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.leccion_id is distinct from old.leccion_id
    or new.parent_comment_id is distinct from old.parent_comment_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'comment identity, ownership, relationships, and creation time are immutable';
  end if;

  if new.parent_comment_id is null then
    return new;
  end if;

  select leccion_id, parent_comment_id
    into parent_leccion_id, parent_of_parent
    from public.comments
    where id = new.parent_comment_id;

  if parent_leccion_id is distinct from new.leccion_id then
    raise exception 'parent_comment_id belongs to a different leccion_id';
  end if;

  if parent_of_parent is not null then
    raise exception 'replies can only be one level deep';
  end if;

  return new;
end;
$$;

create policy "comments_select_public" on public.comments
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.lecciones l
      join public.technologies t on t.id = l.technology_id
      where l.id = comments.leccion_id
        and l.status = 'publicado'
        and t.status = 'completado'
        and private.is_admin(t.user_id)
    )
    -- Auto-vista del admin: si revierte una lección publicada a borrador
    -- para editarla, sus comentarios no deben volverse invisibles para
    -- él mientras tanto (ya son borrables vía comments_delete_own_or_admin,
    -- que no depende de esta política — sin esta rama quedaría inconsistente
    -- poder borrar un comentario que no se puede ni ver).
    or exists (
      select 1
      from public.lecciones l
      join public.technologies t on t.id = l.technology_id
      where l.id = comments.leccion_id
        and t.user_id = (select auth.uid())
        and private.is_admin((select auth.uid()))
    )
  );

create policy "comments_insert_own" on public.comments
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

create policy "comments_update_own" on public.comments
  for update
  to authenticated
  using (user_id = (select auth.uid()))
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

grant select on table public.lecciones to anon;
grant select, delete on table public.lecciones to authenticated;
grant insert (technology_id, slug, modulo, titulo, resumen, contenido, orden),
  update (slug, modulo, titulo, resumen, contenido, orden, status)
  on table public.lecciones to authenticated;

revoke all on table public.comments from anon, authenticated;
grant select on table public.comments to anon;
grant select, delete on table public.comments to authenticated;
grant insert (leccion_id, user_id, parent_comment_id, body), update (body)
  on table public.comments to authenticated;

commit;
