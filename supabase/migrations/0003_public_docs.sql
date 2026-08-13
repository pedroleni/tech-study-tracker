begin;

-- Internal helpers used by RLS and triggers must not be exposed as Data API RPCs.
create schema if not exists private;
revoke all on schema private from public;

-- Existing trigger helpers were created in the exposed public schema. Moving them
-- preserves their trigger dependencies (Postgres tracks functions by OID) while
-- removing them from the Data API surface.
alter function public.category_belongs_to_user() set schema private;
alter function public.set_updated_at() set schema private;
alter function public.handle_new_user() set schema private;

revoke all on function private.category_belongs_to_user() from public;
revoke all on function private.set_updated_at() from public;
revoke all on function private.handle_new_user() from public;

-- Role lookup for RLS. It returns one boolean and never exposes a profile row.
-- The schema is not exposed by PostgREST; USAGE/EXECUTE only let policies resolve
-- and call the function while processing requests.
create or replace function private.is_admin(check_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = check_id and role = 'admin'
  )
$$;

revoke all on function private.is_admin(uuid) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin(uuid) to anon, authenticated;

-- The May 2026 Data API defaults no longer expose new tables automatically.
-- Make every client-facing privilege explicit and leave authorization to RLS.
revoke all on table public.profiles, public.categories, public.technologies
  from anon, authenticated;
grant select on table public.profiles to authenticated;
grant select on table public.categories, public.technologies to anon;
grant select, delete on table public.categories, public.technologies to authenticated;
grant insert (user_id, name), update (name)
  on table public.categories to authenticated;
grant insert (user_id, category_id, name, status, priority, difficulty, notes, resources),
  update (category_id, name, status, priority, difficulty, notes, resources)
  on table public.technologies to authenticated;

-- categories/technologies change from owner-only to public reads of curated
-- content plus owner-admin writes.
drop policy "categories_owner_all" on public.categories;
drop policy "technologies_owner_all" on public.technologies;

create policy "categories_select_public" on public.categories
  for select
  to anon, authenticated
  using (private.is_admin(user_id));

create policy "categories_insert_admin" on public.categories
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create policy "categories_update_admin" on public.categories
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  )
  with check (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create policy "categories_delete_admin" on public.categories
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create policy "technologies_select_public" on public.technologies
  for select
  to anon, authenticated
  using (
    (status = 'completado' and private.is_admin(user_id))
    or (
      user_id = (select auth.uid())
      and private.is_admin((select auth.uid()))
    )
  );

create policy "technologies_insert_admin" on public.technologies
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create policy "technologies_update_admin" on public.technologies
  for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  )
  with check (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create policy "technologies_delete_admin" on public.technologies
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references public.technologies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_technology_created_at_idx
  on public.comments(technology_id, created_at);
create index comments_user_id_idx on public.comments(user_id);
create index comments_parent_comment_id_idx on public.comments(parent_comment_id);

alter table public.comments enable row level security;

-- A comment update edits body only. Keeping ownership and relationships immutable
-- closes both draft-ID probing and cross-technology/reparenting paths.
create or replace function private.comment_write_is_valid()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  parent_technology_id uuid;
  parent_of_parent uuid;
begin
  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.user_id is distinct from old.user_id
    or new.technology_id is distinct from old.technology_id
    or new.parent_comment_id is distinct from old.parent_comment_id
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'comment identity, ownership, relationships, and creation time are immutable';
  end if;

  if new.parent_comment_id is null then
    return new;
  end if;

  select technology_id, parent_comment_id
    into parent_technology_id, parent_of_parent
    from public.comments
    where id = new.parent_comment_id;

  if parent_technology_id is distinct from new.technology_id then
    raise exception 'parent_comment_id belongs to a different technology_id';
  end if;

  if parent_of_parent is not null then
    raise exception 'replies can only be one level deep';
  end if;

  return new;
end;
$$;

revoke all on function private.comment_write_is_valid() from public;

create trigger comments_write_is_valid
  before insert or update on public.comments
  for each row execute function private.comment_write_is_valid();

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function private.set_updated_at();

create policy "comments_select_public" on public.comments
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.technologies t
      where t.id = comments.technology_id
        and (
          (t.status = 'completado' and private.is_admin(t.user_id))
          or (
            t.user_id = (select auth.uid())
            and private.is_admin((select auth.uid()))
          )
        )
    )
  );

create policy "comments_insert_own" on public.comments
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

create policy "comments_update_own" on public.comments
  for update
  to authenticated
  using (user_id = (select auth.uid()))
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

create policy "comments_delete_own_or_admin" on public.comments
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_admin((select auth.uid()))
  );

revoke all on table public.comments from anon, authenticated;
grant select on table public.comments to anon;
grant select, delete on table public.comments to authenticated;
grant insert (technology_id, user_id, parent_comment_id, body), update (body)
  on table public.comments to authenticated;

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, technology_id)
);

create index favorites_user_created_at_idx
  on public.favorites(user_id, created_at desc);
create index favorites_technology_id_idx on public.favorites(technology_id);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- A favorite may reference only public content. A draft UUID and a nonexistent
-- UUID both fail this RLS check before the foreign-key result can become an oracle.
create policy "favorites_insert_own_public" on public.favorites
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

create policy "favorites_delete_own" on public.favorites
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- UPDATE is intentionally absent: favorite relationships are immutable; remove
-- and insert is the only supported change.
revoke all on table public.favorites from anon, authenticated;
grant select, delete on table public.favorites to authenticated;
grant insert (user_id, technology_id) on table public.favorites to authenticated;

commit;
