# Progreso personal por tecnología

**Estado:** 🚧 en spec, sin implementar.

## Por qué existe esta feature

`technologies.status` ya trackea progreso — pero es **del admin**, sobre
su propio contenido (pendiente/en_progreso/completado como autor). No
existe ningún sitio donde un usuario registrado corriente marque su
propio avance estudiando esa tecnología. Hoy solo puede comentar
lecciones publicadas y marcar tecnologías como favoritas — ninguna de
las dos cosas es "por dónde voy".

Esta feature añade exactamente eso: cada usuario autenticado puede
fijar, para sí mismo y por tecnología, un estado (pendiente / en
progreso / completado) y qué lección concreta está estudiando ahora
mismo dentro de esa tecnología.

## Modelo de datos

Una tabla nueva. No toca `technologies`, `lecciones`, `favorites` ni
sus políticas — es datos completamente aparte, uno por usuario.

```sql
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
```

- **`unique (user_id, technology_id)`**: una fila por usuario y
  tecnología — el cliente hace upsert, no insert repetido.
- **`current_leccion_id` nullable, `on delete set null`**: si la
  lección que estabas estudiando se borra, tu progreso de la
  tecnología no desaparece, solo se limpia el puntero — mismo criterio
  que "el progreso no se pierde por un borrado ajeno a ti".
- **`status` reutiliza los mismos tres valores** que
  `technologies.status` (mismo `check`), por consistencia de
  vocabulario en toda la app — son conceptos independientes que
  comparten enum, no la misma columna.
- **Sin `unique` en `current_leccion_id`**: dos tecnologías nunca
  comparten lecciones (cada lección pertenece a una única tecnología),
  así que no hace falta protegerlo aparte.

### Trigger: `current_leccion_id` debe pertenecer a `technology_id` y estar publicada

Mismo patrón ya establecido en `category_belongs_to_user()` (`0001`) y
`comment_write_is_valid()` (`0003`/`0004`): la integridad cruzada entre
columnas se fuerza en Postgres, no solo en el cliente.

```sql
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
  for each row execute function set_updated_at();
```

**El `and l.status = 'publicado'` no es opcional.** Sin él, el trigger
sería un oráculo: mandar un UUID de una lección en borrador de esa
misma tecnología tendría éxito, y de una tecnología distinta o
inexistente fallaría — eso filtra si un UUID concreto de borrador
existe, sin necesitar verlo. Mismo precedente ya documentado en
`favorites_insert_own_public` (`0003:279-280`) para el mismo tipo de
fuga.

## RLS — mismo patrón que `favorites`, con UPDATE añadido

`favorites` es deliberadamente inmutable (quitar+poner en vez de
editar) porque una relación de favorito no tiene estado propio que
cambiar. Aquí sí lo hay — el progreso cambia todo el rato — así que
esta tabla **sí** necesita política de `update`, a diferencia de
`favorites`.

```sql
alter table public.user_technology_progress enable row level security;

create policy "user_technology_progress_select_own" on public.user_technology_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Mismo anti-oráculo que favorites_insert_own_public (0003:279-293):
-- solo se puede trackear una tecnología pública real.
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
```

Nada de esto es visible para `anon` ni para otros usuarios — es dato
estrictamente privado, a diferencia de `categories`/`technologies`/
`lecciones` (públicas) o `comments` (públicos). Más cerca de
`favorites` que de nada más en este esquema.

## Corrección tras implementación: upsert vía RPC, no `.upsert()` directo

Codex detectó, implementando esta spec, dos problemas reales que la
versión original no cubría:

1. `set_updated_at()` fue movida a `private` en `0003:11`
   (`alter function public.set_updated_at() set schema private`) — el
   trigger de esta tabla debe llamar a `private.set_updated_at()`, no
   al nombre sin cualificar.
2. El cliente no puede usar `supabase.from(...).upsert(...)` tal cual:
   PostgREST genera el `ON CONFLICT DO UPDATE SET` incluyendo **todas**
   las columnas del payload, incluidas `user_id`/`technology_id` — y
   Postgres exige privilegio `UPDATE` sobre cualquier columna citada en
   el `SET`, aunque el valor no cambie. El `GRANT` de esta spec
   deniega `update` sobre esas dos columnas a propósito (para impedir
   reasignar la fila a otro usuario/tecnología) — así que un
   `.upsert()` directo siempre sería rechazado por permisos.

**Solución:** una función RPC `security invoker` (no `definer` — no
eleva privilegios, corre con los del propio usuario, así que las
políticas RLS ya definidas arriba se siguen aplicando igual) que hace
el `insert ... on conflict ... do update` con un `set` explícito solo
sobre `status`/`current_leccion_id`. De paso, la función deriva
`user_id` de `(select auth.uid())` en vez de aceptarlo como parámetro
— el cliente ya no lo envía nunca, cierra esa clase de "qué pasa si
alguien manda un user_id que no es el suyo" a nivel de contrato de API,
no solo a nivel de RLS.

```sql
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
```

- **`p_status` usa `NULL` como "no tocar este campo"** — es seguro
  porque `status` nunca es legítimamente `NULL` (siempre uno de los
  tres valores del `check`), así que no hay ambigüedad.
- **`current_leccion_id` sí puede ser `NULL` de verdad** ("ninguna
  lección actual"), así que necesita el booleano
  `p_update_current_leccion` aparte para distinguir "no lo toques" de
  "ponlo a ninguna" — un solo parámetro nullable no bastaría para
  distinguir ambos casos.
- El trigger `user_technology_progress_leccion_check` (anti-oráculo,
  ya definido arriba) se sigue disparando igual — un RPC `security
  invoker` no se salta triggers ni RLS, solo cambia la forma del SQL
  que genera el propio servidor en vez de dejar que PostgREST lo
  infiera del payload.
- `queries/progress.ts`: `upsertMyProgress(technologyId, patch)` ya no
  recibe `userId` como parámetro (lo deriva el propio RPC) — llama a
  `supabase.rpc('upsert_my_technology_progress', { p_technology_id,
  p_status: patch.status ?? null, p_current_leccion_id:
  patch.currentLeccionId ?? null, p_update_current_leccion:
  patch.currentLeccionId !== undefined })`.

## GRANTs por columna

```sql
revoke all on table public.user_technology_progress from anon, authenticated;
grant select, delete on table public.user_technology_progress to authenticated;
grant insert (user_id, technology_id, status, current_leccion_id),
  update (status, current_leccion_id)
  on table public.user_technology_progress to authenticated;
```

**`technology_id` está en `insert` pero no en `update`** — no se puede
reasignar una fila de progreso a otra tecnología, mismo criterio ya
usado en `lecciones.technology_id`. Si el usuario quiere trackear otra
tecnología, crea otra fila (la `unique (user_id, technology_id)` ya
garantiza que no se duplica sin querer).

## Qué cambia fuera de la base de datos

- **`src/types/index.ts`**: nuevo `UserTechnologyProgress { id,
  userId, technologyId, status: Status, currentLeccionId: string |
  null, createdAt, updatedAt }` — reutiliza el tipo `Status` que ya
  existe para `Technology['status']`.
- **`src/lib/queries/mappers.ts`**: `ProgressRow` + `mapProgress`,
  mismo patrón que el resto de mappers.
- **`src/lib/queries/progress.ts`** (nuevo): `getMyProgress(userId,
  technologyId): Promise<UserTechnologyProgress | null>` y
  `upsertMyProgress(userId, technologyId, { status?, currentLeccionId?
  }): Promise<UserTechnologyProgress>` — un único upsert (`.upsert(...,
  { onConflict: 'user_id,technology_id' })`), no insert/update
  separados, para no duplicar lógica de "¿ya existe la fila?" en el
  cliente.
- **`src/lib/hooks/useProgress.ts`** (nuevo): `useMyProgress(technologyId)`
  (React Query) + `useSetMyProgress()` (mutation), mismo patrón que
  `useFavorites`/`useAddFavorite`.
- **`TechnologyPage.tsx`**: nueva sección "Mi progreso", visible solo
  con sesión iniciada (mismo patrón que `FavoriteControl` — sin
  sesión, botón "Inicia sesión para guardar tu progreso" en vez del
  control). Dos campos: un `<select>` de estado (pendiente/en
  progreso/completado) y un `<select>` de "lección actual", con las
  opciones limitadas a las lecciones publicadas de esa tecnología
  (`leccionesQuery.data`, ya cargado en esa página) más una opción
  "Ninguna".
- **Fuera de esta página no cambia nada** — no hay todavía una vista
  "todo mi progreso" agregada (ver Fuera de alcance).

## Checkpoints de seguridad específicos de esta feature

- [ ] Un usuario no puede leer ni escribir el progreso de otro usuario
      — probar con curl real con dos identidades registradas distintas,
      no solo leer las políticas.
- [ ] `current_leccion_id` apuntando a una lección en borrador (de la
      misma tecnología o de otra) es rechazado por el trigger, tanto en
      `insert` como en `update` — probar ambos casos, no solo uno.
- [ ] Crear progreso sobre una tecnología en `pendiente`/`en_progreso`
      (no `completado`) o de un admin distinto falla igual que un
      `technology_id` inexistente — mismo criterio anti-oráculo que
      `favorites`.
- [ ] `technology_id` no es editable vía `update` directo a la API
      aunque se envíe en el payload — el `GRANT` lo bloquea, confirmar
      que efectivamente no cambia la fila en vez de fallar en silencio.
- [ ] Borrar una lección que era `current_leccion_id` de alguien deja
      el puntero en `null` sin borrar la fila de progreso — confirmar
      el `on delete set null` con una prueba real, no solo leerlo en
      el SQL.

## Fuera de alcance de esta feature

- Vista agregada "todo mi progreso" (todas las tecnologías que sigo, en
  un único sitio) — esta spec solo cubre el control en la propia
  `TechnologyPage`. Se revisita si hace falta de verdad.
- Progreso por lección individual (marcar cada lección como
  vista/completada) — el modelo de esta spec es un único puntero de
  "lección actual" por tecnología, no una lista de lecciones vistas.
  Si se quiere eso, es una tabla y una spec distintas.
- Cualquier gamificación (rachas, puntos, insignias) sobre este
  progreso — no pedido, no se añade especulativamente.
