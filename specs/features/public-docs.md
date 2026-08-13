# Feature: Documentación pública, comentarios y favoritos

**Estado:** ✅ implementada y mergeada — PR #16. Migración `0003`
aplicada en remoto y verificada (auditoría de catálogo + curl real con
la anon key, ver `security/reviews/2026-08-13-public-docs.md`). Cuenta
admin promocionada, probado en vivo con las 3 identidades reales
(admin, usuario registrado, visitante anónimo) — todas se comportan
como especifica este documento. Dos fixes adicionales encontrados
durante esas pruebas, en la misma rama: un callejón sin salida en la
pantalla de verificación de código para cuentas ya confirmadas, y el
monitor de Codex mostrando modelo/`reasoning_effort`.

Pivote de alcance: de "tracker privado de un solo usuario" a "documentación
pública curada por un administrador, con comentarios y favoritos de
usuarios registrados". Ver `specs/spec.md` §1-2 para el resumen; este
documento es el cómo completo — modelo de datos, RLS de 3 niveles, rutas,
y el procedimiento (manual, una sola vez) para convertirte en admin.

**Prerrequisito de lectura:** `AGENTS.md`, `specs/features/auth.md` (la
sesión ya existe, esta feature construye sobre ella),
`specs/features/data-layer.md` (el patrón de queries/hooks que hay que
extender, no reinventar), `specs/design-system.md`.

---

## Por qué este cambio, no otro

La alternativa obvia — multiusuario "de verdad", donde cada usuario tiene
su propia colección privada de categorías/tecnologías — se descartó
porque no es lo que se pidió: el contenido (documentación técnica) lo
cura una persona (el administrador), y lo que aportan los demás es
lectura + conversación + curación personal (favoritos), no contenido
propio. Eso encaja mejor con un modelo de **un único autor de contenido +
muchos lectores/comentaristas** que con "cada usuario su propio tracker".

La tabla `profiles.role` que se dejó preparada en la feature de auth
(`0002_profiles.sql`) deja de ser aspiracional aquí: pasa a ser la
comprobación real que decide quién puede escribir `categories`/
`technologies`.

---

## Configuración manual requerida (no la puede hacer un agente)

1. **Prerrequisitos ya verificados.** `profiles` tiene 2 filas para 2 usuarios
   Auth y ninguna cuenta sin perfil; RLS, policy, PK, FK, `CHECK` y el trigger
   existen. El trigger apunta a `private.handle_new_user()`, como debe ocurrir
   después de que `0003` retire los helpers del esquema expuesto. La búsqueda
   anterior de `public.handle_new_user()` fue un preflight incompleto, no una
   migración parcial.
2. **Propiedad previa ya verificada.** Ambas consultas devolvieron 0 filas:
   ```sql
   select user_id, count(*) from categories group by user_id;
   select user_id, count(*) from technologies group by user_id;
   ```
   Por tanto, no hay que borrar, reasignar ni recuperar datos.
3. **`0003_public_docs.sql`, aplicada estructuralmente.** No volver a
   ejecutarla: ya existen `private`, sus cuatro helpers, `comments`,
   `favorites` y las 16 políticas esperadas. Antes de cualquier escritura se
   compara el catálogo remoto con el endurecimiento local (grants por columna,
   configuración/ACL de funciones, roles de policies e índices). Si hay
   diferencias se corrigen mediante una nueva migración forward-only `0004`,
   nunca reescribiendo el historial remoto. La consulta reproducible y de solo
   lectura está en `supabase/diagnostics/0003_catalog_audit.sql`.
4. **Convertirte en administrador — paso manual, una sola vez.** No hay
   UI para esto a propósito (ver `features/auth.md` sobre por qué no
   delegar en interfaces la gestión de permisos sensibles). En el SQL
   Editor de Supabase (que corre con privilegios elevados, no con la
   `anon key`, así que sí puede saltarse la política de solo-lectura de
   `profiles`):
   ```sql
   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'TU_EMAIL_AQUI');
   ```
   Verifica después: `select id, role from profiles where role = 'admin';`
   debe devolver exactamente una fila, la tuya.

---

## Modelo de datos: nueva migración

**Revisado tras crítica adversarial — el borrador original tenía un bug
[BLOQUEANTE]:** todas las políticas que comprobaban el rol de **otro**
usuario (`exists (select 1 from profiles p where p.id = <owner> and
p.role = 'admin')`) usaban una subconsulta normal sobre `profiles`, que
sigue sujeta a `profiles_select_own` (`id = (select auth.uid())`). Esa
condición solo puede cumplirse cuando quien pregunta **es** la fila que
se está mirando — es decir, esas comprobaciones daban `false` siempre
para cualquier visitante o usuario no-admin, sin excepción. El resultado
real, de haberse aplicado tal cual: el índice público habría estado
siempre vacío para cualquiera que no fuera el propio admin, y ningún
usuario registrado habría podido insertar un comentario jamás — el
núcleo entero del pivote roto desde el primer día. Arreglado con una
función `security definer` (`private.is_admin`, abajo) que sí puede leer
`profiles` sin las restricciones de `profiles_select_own`, devolviendo
solo un booleano — nunca la fila en sí, así que no abre `profiles` a
nadie más de lo que ya estaba.

`supabase/migrations/0003_public_docs.sql` es la fuente de verdad. El SQL
de esta sección debe mantenerse sincronizado con ese archivo antes de
aplicarlo.

```sql
begin;

-- ============================================================
-- PARTE 0: helpers internos. Sin esto, ninguna política de lectura
-- pública ni de inserción de comentarios puede comprobar el rol de
-- OTRO usuario (ver nota de arriba) -- profiles_select_own se lo
-- impide. security definer + search_path vacío, mismo patrón que
-- handle_new_user() en 0002_profiles.sql. Los helpers privilegiados
-- viven en un esquema no expuesto por el Data API.
-- ============================================================

create schema if not exists private;
revoke all on schema private from public;

alter function public.category_belongs_to_user() set schema private;
alter function public.set_updated_at() set schema private;
alter function public.handle_new_user() set schema private;

revoke all on function private.category_belongs_to_user() from public;
revoke all on function private.set_updated_at() from public;
revoke all on function private.handle_new_user() from public;

create or replace function private.is_admin(check_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = check_id and role = 'admin'
  )
$$;

revoke all on function private.is_admin(uuid) from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin(uuid) to anon, authenticated;

-- Desde mayo de 2026, las tablas nuevas pueden no quedar expuestas al
-- Data API automáticamente. Privilegios explícitos + RLS, ambos hacen falta.
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

-- ============================================================
-- PARTE 1: categories/technologies pasan de "owner-only" a
-- "lectura pública de contenido del admin, escritura solo admin".
-- ============================================================

drop policy "categories_owner_all" on categories;
drop policy "technologies_owner_all" on technologies;

-- SELECT: público. Una categoría es visible si su dueño es un admin
-- (en la práctica, el único admin). No hay concepto de "categoría en
-- borrador" -- solo las tecnologías dentro tienen estado de publicación.
create policy "categories_select_public" on categories
  for select
  to anon, authenticated
  using (private.is_admin(categories.user_id));

create policy "categories_insert_admin" on categories
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create policy "categories_update_admin" on categories
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

create policy "categories_delete_admin" on categories
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

-- SELECT de technologies: publicada (status='completado' + dueño admin)
-- para cualquiera, O cualquier estado si quien pregunta es el propio
-- admin (para que vea sus borradores).
create policy "technologies_select_public" on technologies
  for select
  to anon, authenticated
  using (
    (status = 'completado' and private.is_admin(technologies.user_id))
    or (
      user_id = (select auth.uid())
      and private.is_admin((select auth.uid()))
    )
  );

create policy "technologies_insert_admin" on technologies
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

create policy "technologies_update_admin" on technologies
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

create policy "technologies_delete_admin" on technologies
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and private.is_admin((select auth.uid()))
  );

-- El trigger technologies_category_owner_check (0001_init.sql) sigue
-- funcionando sin cambios: comprueba que category_id pertenece al mismo
-- user_id que la tecnología, y ahora ese user_id solo puede ser el
-- admin (las políticas de arriba ya no dejan que sea nadie más).

-- ============================================================
-- PARTE 2: comments
-- ============================================================

create table comments (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade,
  -- trim() en el check: un body de solo espacios/saltos de línea no
  -- debe pasar el mínimo de 1 carácter útil.
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_technology_created_at_idx
  on comments(technology_id, created_at);
create index comments_user_id_idx on comments(user_id);
create index comments_parent_comment_id_idx on comments(parent_comment_id);

alter table comments enable row level security;

-- Un solo nivel de respuestas (spec.md §3.5): el padre de una respuesta
-- no puede tener a su vez padre, y debe pertenecer a la misma
-- technology_id que la respuesta. Mismo espíritu que
-- category_belongs_to_user() en 0001_init.sql -- una comprobación de
-- integridad que RLS por sí sola no puede expresar (RLS filtra FILAS,
-- esto compara una fila con OTRA fila referenciada dentro de la misma
-- tabla). Sin esto, una llamada directa a la API podría crear hilos de
-- más de un nivel o respuestas "cruzadas" entre fichas distintas, que
-- la UI (diseñada para un solo nivel) no sabría renderizar. En UPDATE,
-- id/user_id/technology_id/parent_comment_id/created_at son inmutables:
-- editar significa cambiar body, no mover, reatribuir ni falsear la identidad
-- o fecha del comentario.
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
  before insert or update on comments
  for each row execute function private.comment_write_is_valid();

-- Lectura pública, pero solo de comentarios sobre tecnologías visibles
-- (mismo condicional que technologies_select_public). Sin esto, un
-- comentario podría quedar leíble aunque la ficha a la que pertenece
-- sea un borrador -- defensa en profundidad, coste bajo.
create policy "comments_select_public" on comments
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from technologies t
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

-- Insertar: cualquier usuario con sesión, solo sobre tecnologías ya
-- publicadas (ni siquiera el admin comenta sobre sus propios borradores
-- -- para eso ya existe el campo `notes`).
create policy "comments_insert_own" on comments
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from technologies t
      where t.id = technology_id
        and t.status = 'completado'
        and private.is_admin(t.user_id)
    )
  );

-- Editar: solo el propio autor, Y solo si technology_id sigue apuntando
-- a una ficha publicada -- revalidado en CADA update, no solo en el
-- insert. Sin este with_check (bug [BLOQUEANTE] encontrado en la
-- crítica), un PATCH directo podía reescribir technology_id de un
-- comentario propio hacia CUALQUIER ficha existente, incluida una en
-- borrador -- y como Postgres comprueba las FK antes que RLS, el
-- éxito/fallo de ese PATCH revelaba si un UUID de borrador existe
-- todavía (oráculo de enumeración). El admin NO puede editar
-- comentarios ajenos -- borrar sí (moderación), reescribir las
-- palabras de otro no.
create policy "comments_update_own" on comments
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from technologies t
      where t.id = technology_id
        and t.status = 'completado'
        and private.is_admin(t.user_id)
    )
  );

-- Borrar: el propio autor, o el admin como moderación.
create policy "comments_delete_own_or_admin" on comments
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    or private.is_admin((select auth.uid()))
  );

create trigger comments_set_updated_at
  before update on comments
  for each row execute function private.set_updated_at();

revoke all on table public.comments from anon, authenticated;
grant select on table public.comments to anon;
grant select, delete on table public.comments to authenticated;
grant insert (technology_id, user_id, parent_comment_id, body), update (body)
  on table public.comments to authenticated;

-- ============================================================
-- PARTE 3: favorites
-- ============================================================

create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  technology_id uuid not null references technologies(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, technology_id)
);

create index favorites_user_created_at_idx
  on favorites(user_id, created_at desc);
create index favorites_technology_id_idx on favorites(technology_id);

alter table favorites enable row level security;

create policy "favorites_select_own" on favorites
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Owner-only no basta: el destino tiene que ser una ficha pública. Así un
-- UUID de borrador y uno inexistente fallan por la misma política antes de
-- que la FK pueda convertirse en un oráculo de existencia.
create policy "favorites_insert_own_public" on favorites
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from technologies t
      where t.id = technology_id
        and t.status = 'completado'
        and private.is_admin(t.user_id)
    )
  );

create policy "favorites_delete_own" on favorites
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- No existe UPDATE: una relación favorita es inmutable; se borra y se crea.
revoke all on table public.favorites from anon, authenticated;
grant select, delete on table public.favorites to authenticated;
grant insert (user_id, technology_id) on table public.favorites to authenticated;

commit;
```

**Checkpoint:** tras aplicarla,
`select tablename, policyname, cmd from pg_policies where tablename in
('categories','technologies','comments','favorites') order by 1,2;`
debe devolver exactamente: 4 políticas en `categories` (select/insert/
update/delete), 4 en `technologies`, 4 en `comments` y 3 en `favorites`
(select/insert/delete; UPDATE está denegado a propósito). Además, **antes
de dar el checkpoint por cerrado**,
probarlo con una petición HTTP anónima real (sin `Authorization`) contra
`categories`/`technologies` publicadas — no basta con leer el SQL y
asumir que es correcto (así se coló el bug de arriba).

---

## Por qué `is_admin()` tiene que ser `security definer`

Esta sección explicaba, en el borrador original, por qué un `exists
(select ... from profiles ...)` normal bastaba sin necesidad de una
función `security definer`. **Esa conclusión era errónea** — ver la nota
al inicio de "Modelo de datos" y el hallazgo que la destapó. La versión
correcta:

`profiles` tiene una única política, `profiles_select_own` (`id =
(select auth.uid())`). Una subconsulta *normal* (invoker) sobre
`profiles`, embebida dentro de la política de otra tabla, **sigue sujeta
a esa política** — Postgres no la salta salvo que la función que la
contiene sea `security definer`. Por eso `where p.id = categories.user_id
and p.role = 'admin'` (comprobando la fila de *otro* usuario, el admin)
nunca puede ser verdadero para nadie salvo el propio admin mirando su
propia fila: la condición implícita `and p.id = (select auth.uid())` que
`profiles_select_own` añade por debajo hace que solo pase cuando
`categories.user_id = auth.uid()`.

`private.is_admin()` sí puede leer cualquier fila de `profiles` porque es
`security definer` (corre con los privilegios de quien la definió, no
del que la invoca) — el mismo patrón exacto que `handle_new_user()` en
`0002_profiles.sql`, con la misma razón (`set search_path = ''`, evitar
secuestro de resolución de nombres) y la misma propiedad de seguridad:
**solo devuelve un booleano**, nunca la fila de `profiles` en sí, así que
no abre esa tabla a nadie que antes no pudiera verla. Además vive en
`private`, un esquema no expuesto por PostgREST: `anon`/`authenticated`
pueden ejecutarla dentro de las políticas RLS, pero no invocarla como RPC
del Data API. Un anónimo sigue sin poder hacer `select * from profiles`.

Debe verificarse con una prueba real (no solo argumentarse): tras aplicar la
migración, una petición HTTP con la `anon key` y sin sesión a
`/rest/v1/categories` debe devolver las categorías del admin — si
devuelve un array vacío estando el admin con contenido creado, el bug
del borrador original ha vuelto.

## Revocar el rol admin, añadido tras crítica

No hay UI para esto (igual que para promocionar, ver arriba) — sería
`update profiles set role = 'user' where id = '...'`, ejecutado a mano.
**Efecto no obvio a tener en cuenta antes de hacerlo:** las políticas de
lectura pública evalúan `profiles.role` en el momento de cada consulta,
no en el momento en que se creó la fila de `categories`/`technologies`.
Revocar el rol de un admin con contenido ya publicado **despublica todo
ese contenido de inmediato y en silencio** — sin aviso, sin reasignar
`user_id` a otro admin. Con un solo admin en la práctica esto no tiene
mucho recorrido, pero si algún día hay más de uno, revocar el rol de
alguien con fichas publicadas requiere primero decidir qué pasa con
ellas (reasignarlas a otro admin antes de revocar, o aceptar que
desaparezcan de la vista pública) — no hay automatismo para esto, es una
decisión manual en el momento.

---

## Rutas

Reestructura respecto a `plan.md` §3 — la de entonces asumía todo
protegido tras login; ahora la mayoría es pública:

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Home pública (índice de categorías) | Público |
| `/categorias/:id` | Categoría (fichas publicadas dentro) | Público |
| `/tecnologias/:id` | Ficha + comentarios (lectura) | Público; formulario de comentar solo si hay sesión |
| `/login`, `/register`, `/recuperar-password`, `/nueva-password` | Auth | Público (sin cambios) |
| `/favoritos` | Favoritos del usuario | Requiere sesión (cualquier rol) |
| `/admin` | Panel: contadores + borradores | Requiere `profiles.role = 'admin'`, no solo sesión |
| `/admin/tecnologias/nueva` | Crear ficha | Requiere admin |
| `/admin/tecnologias/:id/editar` | Editar ficha | Requiere admin |
| `/admin/categorias` | Gestionar categorías | Requiere admin |

**Cambio de diseño respecto al plan original:** `/tecnologias/:id` era
antes la ruta de edición (single-user). Ahora es la ruta de **lectura
pública**; la edición se mueve a `/admin/tecnologias/:id/editar`, una
ruta distinta. Es un cambio deliberado, no un descuido — la misma URL no
puede ser a la vez "lo que ve cualquier visitante" y "el formulario de
edición del admin".

`ProtectedRoute` (ya existe, `features/auth.md`) sigue sirviendo para
`/favoritos` (solo necesita sesión). Para `/admin/*` hace falta un
componente nuevo, `AdminRoute`.

**Composición, precisada tras crítica (el borrador original la dejaba
ambigua):** `AdminRoute` se **anida dentro de** `ProtectedRoute`, no la
sustituye ni reimplementa su comprobación de sesión:

```tsx
<Route element={<ProtectedRoute />}>
  <Route element={<AdminRoute />}>
    <Route path="/admin" element={<AdminDashboardPage />} />
    {/* resto de /admin/* */}
  </Route>
  <Route path="/favoritos" element={<FavoritesPage />} />
</Route>
```

`AdminRoute` **solo** comprueba `isAdmin` de `useProfile()` — la
comprobación de sesión ya la hizo `ProtectedRoute` un nivel por encima,
así que si no hay sesión, `AdminRoute` nunca llega a ejecutarse (ya
hubo redirect a `/login`). Sin esta precisión, había dos lecturas
posibles del documento — anidar, o que `AdminRoute` reimplementara su
propia comprobación de sesión — con comportamientos distintos (código
muerto duplicado en el primer caso, dos hooks de sesión compitiendo en
el segundo). Anidar es lo consistente con "extender, no reinventar".

`AdminRoute` depende de **dos** fuentes async — `useAuth()` (ya
resuelta si llegamos aquí, `ProtectedRoute` ya esperó su `loading`) y
`useProfile()` (rol, con su propio `loading`). Mientras
`useProfile().loading` sea `true`, `AdminRoute` debe mostrar el mismo
estado de carga que `ProtectedRoute` (no redirigir todavía) — redirigir
antes de que el rol se confirme dejaría a un admin real rebotado a `/`
brevemente en cada carga/refresco de una ruta `/admin/*`.

Igual que con auth, la seguridad real la da RLS en Postgres, no
`AdminRoute` — este componente es UX (evita que un usuario no-admin vea
un formulario que de todas formas Postgres rechazaría), no la capa de
autorización.

---

## Archivos

**Ampliado tras crítica** — el borrador original solo cubría
infraestructura (migración, queries, hooks) y no decía nada de las
páginas ni de qué pasa con lo que ya existe. De las 9 rutas de la tabla
de arriba, ninguna tenía componente listado.

### Infraestructura

| Archivo | Qué hacer |
|---|---|
| `supabase/migrations/0003_public_docs.sql` | ✅ creada localmente y aplicada estructuralmente en remoto; pendiente comparación de endurecimiento fino |
| `supabase/diagnostics/0003_catalog_audit.sql` | ✅ auditoría de solo lectura de RLS, roles, grants, funciones, triggers e índices remotos |
| `src/types/index.ts` | ✅ añadidos `Profile`, `Comment`, `Favorite` y semántica pública de `completado` |
| `src/lib/queries/queryKeys.ts` | ✅ añadidas keys de perfil, comentarios por tecnología y favoritos; tecnologías separadas por identidad del visitante para no reutilizar borradores del admin tras perder la sesión |
| `src/lib/queries/profiles.ts`, `src/lib/hooks/useProfile.ts` | ✅ creados: consulta de la propia fila + `{ role, isAdmin, loading }` |
| `src/components/auth/AdminRoute.tsx` | ✅ creado: solo comprueba `isAdmin`; se probará integrado en el router completo |
| `src/lib/queries/comments.ts` | ✅ creado con filtro server-side y payloads allowlisted |
| `src/lib/queries/favorites.ts` | ✅ creado: listar/crear/borrar; no existe update |
| `src/lib/hooks/useComments.ts`, `src/lib/hooks/useFavorites.ts` | ✅ creados con keys por tecnología/usuario |
| `src/lib/utils/groupComments.ts` | ✅ creado con tests de raíces, respuestas y huérfanos |
| `src/lib/hooks/useCategories.ts`, `useTechnologies.ts` | ✅ todas las mutaciones administrativas comprueban sesión + rol (RLS sigue siendo la autorización real) |
| `src/lib/hooks/useAuth.ts` | ✅ `signOut` y el evento `SIGNED_OUT` limpian toda la caché; cubre también expiración/revocación externa de la sesión |

### Páginas y rutas (ausentes del todo en el borrador original)

| Archivo | Ruta | Qué hacer |
|---|---|---|
| `src/routes/PublicHomePage.tsx` | `/` | ✅ índice público de categorías |
| `src/routes/CategoryPage.tsx` | `/categorias/:id` | ✅ fichas publicadas de la categoría |
| `src/routes/TechnologyPage.tsx` | `/tecnologias/:id` | ✅ ficha, recursos, favoritos y comentarios |
| `src/routes/FavoritesPage.tsx` | `/favoritos` | ✅ favoritos del usuario logueado |
| `src/routes/AdminDashboardPage.tsx` | `/admin` | ✅ contadores y borradores; sustituye al dashboard anterior |
| `src/routes/AdminTechnologyFormPage.tsx` | `/admin/tecnologias/nueva`, `/admin/tecnologias/:id/editar` | ✅ formulario compartido de alta/edición y borrado confirmado |
| `src/routes/AdminCategoriesPage.tsx` | `/admin/categorias` | ✅ gestión de categorías |
| `src/routes/DashboardPage.tsx` | — | ✅ eliminado; la home ahora es pública |
| `src/App.tsx` | — | ✅ router reestructurado con layout público y guards anidados |
| `src/components/layout/AppShell.tsx` | — | ✅ envuelve rutas públicas y protegidas |
| `src/components/layout/Navbar.tsx` | — | ✅ navegación contextual para visitante, usuario y admin |

**Por qué `listComments(technologyId)` lleva filtro server-side, a
diferencia de `listCategories()`/`listTechnologies()`:** el borrador
original decía "mismo patrón que `data-layer.md`" (que trae todo sin
filtrar, `data-layer.md` §"una sola query por tabla") y a la vez el test
requerido hablaba de "listar comentarios de una tecnología" — las dos
cosas juntas son contradictorias. La razón por la que
`categories`/`technologies` traen todo es el volumen personal pequeño
(decenas de filas, un solo autor); `comments` no tiene ese límite —
crece con cada usuario registrado que comenta, en todas las fichas.
Traer todos los comentarios del sitio para pintar una sola ficha sería
exactamente el escalado que `data-layer.md` evitó a propósito para el
otro caso. Por eso `useComments(technologyId)` usa una key jerárquica
`['comments', technologyId]` — cambiar de ficha no debe mostrar
comentarios cacheados de la anterior.

No se reescribe `queries/categories.ts`/`technologies.ts` desde cero —
la spec de `data-layer.md` sigue siendo válida en su mayoría (mapeo,
manejo de errores, invalidación por entidad). Lo que cambia es el guard
de rol en los hooks (arriba), no las funciones puras de `queries/*.ts`
en sí.

---

## Tests requeridos

Todos con `vi.mock('@/lib/supabaseClient')`, mismo patrón que el resto
del proyecto.

1. `useProfile`: expone `isAdmin: true` cuando `role === 'admin'`,
   `false` en cualquier otro caso (incluido sin sesión).
2. `AdminRoute`, **corregido tras crítica** — el borrador original
   pedía probar "sin sesión → redirige a `/login`" dentro de un test de
   `AdminRoute` aislado, pero esa comprobación es responsabilidad de
   `ProtectedRoute` (ver "Rutas" — se anida dentro, no la reimplementa).
   Un `AdminRoute` montado sin `ProtectedRoute` alrededor no representa
   el árbol real. En su lugar: renderizar `AdminRoute` **dentro de**
   `ProtectedRoute` (como en producción) y comprobar (a) con sesión
   admin → renderiza el contenido protegido; (b) con sesión no-admin →
   redirige a `/`; (c) mientras `useProfile()` sigue `loading`, no
   redirige todavía (muestra el estado de carga, no un flash a `/`).
3. `queries/comments.ts`: `listComments(technologyId)` filtra por
   `technology_id` (no trae comentarios de otras fichas); insertar
   comentario incluye `user_id` explícito; responder a un comentario
   (`parentCommentId` no nulo); **responder a una respuesta se rechaza**
   (simular el error del trigger `comment_write_is_valid` y confirmar
   que se propaga, no que se "arregla" aplanando el hilo en el
   cliente); error de Supabase se propaga (mismo patrón que
   `data-layer.md`).
4. `queries/favorites.ts`: mismo patrón owner-only que `data-layer.md`
   — crear/listar/borrar, error se propaga.
5. Regresión de seguridad explícita, **corregido tras crítica** — el
   borrador original pedía mockear un error `42501` genérico en
   `createCategory`/`createTechnology`, indistinguible del test de
   propagación de errores que ya exige `data-layer.md` (no verificaba
   nada específico de "rechazado por no-admin"). Con el guard de rol
   añadido en `useCreateCategory`/`useCreateTechnology` (ver Archivos),
   este test sí tiene algo propio que comprobar: con `useProfile().isAdmin
   === false`, la mutación rechaza con el mensaje limpio **sin haber
   llamado a Supabase** — mismo patrón que ya existe para el guard de
   "sin sesión" en `data-layer.md`.
6. `axe()` sin violaciones en las pantallas nuevas (`/admin`, ficha con
   comentarios, `/favoritos`).

## Checkpoints de seguridad

- [ ] `pg_policies` sobre las 4 tablas coincide exactamente con lo
      descrito arriba — ninguna política de más, ninguna de menos.
- [ ] Probado con **3 identidades reales**, no solo mockeadas: petición
      anónima (sin `Authorization`, o con la `anon key` sin sesión),
      usuario registrado no-admin, y admin. Cada una debe ver
      exactamente lo que le corresponde — especialmente que el no-admin
      reciba un rechazo de Postgres (no un 200 vacío que parezca "no hay
      datos" cuando en realidad es "no tienes permiso").
- [ ] Un usuario no-admin no puede, vía API directa (no solo vía UI),
      crear/editar/borrar `categories`/`technologies` — probar con curl
      + un JWT de una cuenta no-admin real, no solo confiar en que la UI
      no muestra el botón.
- [x] `comments.body` tiene límite de longitud (ya en el `check` de la
      migración, con `trim()`) — confirmar que el cliente también valida
      antes de enviar (UX), pero que el límite real está en la base de
      datos, no solo en el formulario.
- [x] **Renderizado de `comments.body`, fijado tras crítica (el borrador
      original lo dejaba "a revisar al implementar", ambigüedad no
      aceptable para el primer campo que escribe cualquier usuario
      registrado, no solo el admin de confianza):** mismo pipeline ya
      aprobado para `notes` — `react-markdown` **sin** `rehype-raw`
      (`.claude/agents/security-injection.md`). No se introduce un
      sanitizador nuevo ni una decisión distinta solo para comentarios.
      Los enlaces se limitan a HTTP(S) y las imágenes remotas se omiten.
- [ ] Ningún comentario de una tecnología en borrador es visible para
      un no-admin, ni siquiera si se conoce el `id` exacto — probar
      también el caso de `comments_update_own` (mover un comentario
      propio hacia una ficha en borrador vía `PATCH` directo debe
      fallar, no solo el `insert` inicial).
- [ ] Insertar un favorito con el UUID de una ficha en borrador falla igual
      que con un UUID inexistente; `favorites` no concede `UPDATE`.
- [ ] `private.is_admin()` no está en un esquema expuesto por el Data API y
      solo conserva los privilegios necesarios para ejecutarse dentro de RLS.
- [ ] Los `GRANT` explícitos permiten las operaciones previstas a `anon` y
      `authenticated`; RLS sigue filtrando las filas. Los permisos de escritura
      son por columna: IDs y timestamps gestionados por el servidor no se
      aceptan desde el Data API.
- [x] Revisar contra `.claude/agents/security-auth-crypto.md` (RLS,
      roles) y `security-injection.md` (`comments.body` es contenido de
      usuario no confiable, más que `notes` — lo escribe cualquiera
      registrado, no solo el admin de confianza).
- [x] Guardar la revisión en `security/reviews/2026-08-13-public-docs.md`
      **antes** de abrir el PR.

## Fuera de alcance de esta feature

- Rate-limiting/anti-spam proactivo en comentarios (moderación reactiva
  por ahora — el admin borra abuso).
- Notificaciones (nadie se entera de una respuesta a su comentario salvo
  volviendo a mirar).
- Edición de comentarios con historial/"editado hace X" visible.
- Búsqueda de contenido público.
- Realtime (comentarios apareciendo sin recargar).
