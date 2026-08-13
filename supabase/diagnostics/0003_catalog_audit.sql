-- Read-only catalog audit for the remote state after 0003_public_docs.sql.
-- It intentionally returns one row so Supabase Studio does not hide an earlier
-- result set when several checks are run together.
select
  (
    select string_agg(
      c.relname || ':rls=' || c.relrowsecurity::text,
      ' | ' order by c.relname
    )
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = any (
        array['profiles', 'categories', 'technologies', 'comments', 'favorites']
      )
  ) as rls,
  (
    select string_agg(
      p.tablename || ':' || p.policyname || ':' || p.cmd
        || ':roles=' || array_to_string(p.roles, ','),
      ' | ' order by p.tablename, p.policyname
    )
    from pg_policies p
    where p.schemaname = 'public'
      and p.tablename = any (
        array['profiles', 'categories', 'technologies', 'comments', 'favorites']
      )
  ) as policy_roles,
  (
    select n.nspacl::text
    from pg_namespace n
    where n.nspname = 'private'
  ) as private_schema_acl,
  (
    select string_agg(
      p.proname
        || ':security_definer=' || p.prosecdef::text
        || ':config=' || coalesce(p.proconfig::text, 'NULL')
        || ':acl=' || coalesce(p.proacl::text, 'DEFAULT_PUBLIC_EXECUTE'),
      ' | ' order by p.proname
    )
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'private'
      and p.proname = any (
        array[
          'category_belongs_to_user',
          'comment_write_is_valid',
          'handle_new_user',
          'is_admin',
          'set_updated_at'
        ]
      )
  ) as function_security,
  coalesce(
    position(
      'new.id is distinct from old.id'
      in lower(pg_get_functiondef(to_regprocedure('private.comment_write_is_valid()')))
    ) > 0,
    false
  ) as comment_locks_id,
  coalesce(
    position(
      'new.created_at is distinct from old.created_at'
      in lower(pg_get_functiondef(to_regprocedure('private.comment_write_is_valid()')))
    ) > 0,
    false
  ) as comment_locks_created_at,
  (
    select string_agg(
      table_namespace.nspname || '.' || table_class.relname || ':' || trigger_row.tgname
        || '->' || function_namespace.nspname || '.' || function_row.proname || '()',
      ' | ' order by table_namespace.nspname, table_class.relname, trigger_row.tgname
    )
    from pg_trigger trigger_row
    join pg_class table_class on table_class.oid = trigger_row.tgrelid
    join pg_namespace table_namespace on table_namespace.oid = table_class.relnamespace
    join pg_proc function_row on function_row.oid = trigger_row.tgfoid
    join pg_namespace function_namespace on function_namespace.oid = function_row.pronamespace
    where not trigger_row.tgisinternal
      and (
        (table_namespace.nspname = 'auth' and table_class.relname = 'users')
        or (table_namespace.nspname = 'public' and table_class.relname = 'comments')
      )
  ) as relevant_triggers,
  coalesce(
    (
      select string_agg(
        grantee || ':' || table_name || ':' || privilege_type,
        ' | ' order by grantee, table_name, privilege_type
      )
      from information_schema.table_privileges
      where table_schema = 'public'
        and table_name = any (
          array['profiles', 'categories', 'technologies', 'comments', 'favorites']
        )
        and grantee = any (array['anon', 'authenticated'])
    ),
    'none'
  ) as table_privileges,
  coalesce(
    (
      select string_agg(
        grants.grantee || ':' || grants.table_name || ':'
          || grants.privilege_type || '(' || grants.columns || ')',
        ' | ' order by grants.grantee, grants.table_name, grants.privilege_type
      )
      from (
        select
          grantee,
          table_name,
          privilege_type,
          string_agg(column_name, ',' order by column_name) as columns
        from information_schema.column_privileges
        where table_schema = 'public'
          and table_name = any (
            array['profiles', 'categories', 'technologies', 'comments', 'favorites']
          )
          and grantee = any (array['anon', 'authenticated'])
          and privilege_type = any (array['INSERT', 'UPDATE'])
        group by grantee, table_name, privilege_type
      ) grants
    ),
    'none'
  ) as write_column_privileges,
  (
    select string_agg(
      indexname || '=' || indexdef,
      ' | ' order by tablename, indexname
    )
    from pg_indexes
    where schemaname = 'public'
      and tablename = any (array['comments', 'favorites'])
  ) as comment_favorite_indexes,
  (select count(*) from public.comments) as comment_rows,
  (select count(*) from public.favorites) as favorite_rows,
  (select count(*) from public.profiles where role = 'admin') as admin_profiles;
