begin;

-- "Proyectos" reutiliza lecciones tal cual (specs/features/editor-en-vivo.md):
-- una lección-proyecto es una lección normal con este flag a true. Cero
-- políticas RLS nuevas — lecciones_select_public/insert_admin/update_admin/
-- delete_admin (0004) ya gobiernan esta fila igual que cualquier otra
-- columna suya, filtrando por status/completado exactamente igual.
alter table public.lecciones
  add column es_proyecto boolean not null default false;

-- Las columnas de insert/update de lecciones están en una lista explícita
-- (0004:205-207), no es "todas menos las gestionadas por el servidor": una
-- columna nueva que no se añada aquí queda invisible para admin aunque RLS
-- ya lo permitiera. Se re-declaran las dos listas completas porque
-- `grant ... update (...)` sustituye la lista anterior, no la amplía.
revoke insert (technology_id, slug, modulo, titulo, resumen, contenido, orden),
  update (slug, modulo, titulo, resumen, contenido, orden, status)
  on table public.lecciones from authenticated;
grant insert (technology_id, slug, modulo, titulo, resumen, contenido, orden, es_proyecto),
  update (slug, modulo, titulo, resumen, contenido, orden, status, es_proyecto)
  on table public.lecciones to authenticated;

commit;
