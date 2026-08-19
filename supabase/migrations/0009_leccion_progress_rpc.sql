begin;

-- 0008 wired the client to write via a plain supabase-js .upsert(). That
-- breaks in practice: PostgREST's ON CONFLICT DO UPDATE re-applies every
-- column from the insert payload (user_id, leccion_id, status), so it
-- needs UPDATE privilege on user_id/leccion_id too — which was
-- deliberately withheld (only `update (status)` is granted, so a row
-- can't be repointed at a different user or lesson after creation).
-- Widening the grant would let UPDATE change leccion_id to point at a
-- draft lesson, since user_leccion_progress_update_own's WITH CHECK only
-- verifies user_id, not lesson publication status — reopening the exact
-- oracle the insert policy exists to close. Fix: mirror
-- upsert_my_technology_progress (0006) with a security invoker RPC whose
-- hand-written SQL only ever SETs status, matching the existing grant.
create or replace function public.upsert_my_leccion_progress(
  p_leccion_id uuid,
  p_status text
)
returns public.user_leccion_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result public.user_leccion_progress;
begin
  insert into public.user_leccion_progress as p (user_id, leccion_id, status)
  values ((select auth.uid()), p_leccion_id, p_status)
  on conflict (user_id, leccion_id) do update
  set status = p_status
  returning * into result;

  return result;
end;
$$;

revoke all on function public.upsert_my_leccion_progress(uuid, text) from public;
grant execute on function public.upsert_my_leccion_progress(uuid, text) to authenticated;

commit;
