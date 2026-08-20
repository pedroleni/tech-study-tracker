# Progreso personal por tecnología

**Estado:** ✅ implementada en PR #26; migración `0006` aplicada y verificada con curl real en producción. Extendida con progreso por lección individual en PR #40/#41 (migraciones `0008`/`0009`) — ver sección dedicada más abajo; cambió además el "Estado" de esta sección de manual a derivado, ver esa misma sección.

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

## Progreso por lección individual (`user_leccion_progress`)

**Por qué se añadió después, y no en el diseño original:** la sección
de arriba solo permite un estado por *tecnología completa*. Usando la
app real, esto resultó confuso — no había forma de decir "ya hice
esta lección en concreto", solo un selector de estado manual y
desconectado de lo que realmente se había leído. La primera versión
de este documento (ver abajo) daba esto explícitamente por fuera de
alcance; se revisó esa decisión al tener uso real de la app, no antes.

### Modelo de datos

Misma forma que `user_technology_progress`, a nivel de lección
(migración `0008`):

```sql
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
```

- Sin `current_leccion_id` aquí — ese puntero sigue viviendo solo en
  `user_technology_progress` (arriba); es un concepto distinto ("qué
  lección retomo") del de esta tabla ("qué lecciones ya hice").
- Sin trigger de integridad cruzada: a diferencia de
  `current_leccion_id`, aquí no hay una segunda columna
  (`technology_id`) con la que `leccion_id` pueda desincronizarse.

### RLS — mismo patrón, mismo anti-oráculo que arriba

```sql
alter table public.user_leccion_progress enable row level security;

create policy "user_leccion_progress_select_own" on public.user_leccion_progress
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Mismo anti-oráculo que user_technology_progress_insert_own_public:
-- solo se puede trackear una lección publicada de una tecnología pública real.
create policy "user_leccion_progress_insert_own_public" on public.user_leccion_progress
  for insert to authenticated
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
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "user_leccion_progress_delete_own" on public.user_leccion_progress
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.user_leccion_progress from anon, authenticated;
grant select, delete on table public.user_leccion_progress to authenticated;
grant insert (user_id, leccion_id, status), update (status)
  on table public.user_leccion_progress to authenticated;
```

Revisado por un agente de seguridad adversarial dedicado (no solo el
scanner de patrones automático) antes de mergear, comparado
explícitamente contra este mismo precedente — sin hallazgos.

### El mismo error de `.upsert()` directo, esta vez con un solo campo — y por qué eso no lo salva

Más arriba en este documento ya está el porqué de que
`user_technology_progress` necesite RPC en vez de `.upsert()` directo.
Al implementar esta tabla se asumió que, con un solo campo mutable
(`status`, no dos como allí), un `.upsert()` directo desde el cliente
sí sería seguro. **Error real, no hipotético:** se implementó así
primero (migración `0008`, sin RPC), se probó en vivo contra
producción con una cuenta real, y falló con `403 permission denied for
table user_leccion_progress`.

**Por qué falla igual con un solo campo:** PostgREST no sabe qué
columnas del payload de `.upsert(...)` son "identidad" y cuáles son
"estado mutable" — regenera el `ON CONFLICT DO UPDATE SET` con
*todas* las columnas que mandó el cliente (`user_id`, `leccion_id`,
`status`), no solo con la que la app considera editable. El `GRANT` de
esta tabla deniega `update` sobre `user_id`/`leccion_id` a propósito.
Concederlo para que el upsert funcionara habría sido la solución
rápida y la incorrecta: la política de `update`
(`user_leccion_progress_update_own`) no vuelve a comprobar que la
lección esté publicada, así que un `UPDATE` directo con `leccion_id`
editable podría repuntar la fila hacia una lección en borrador sin
pasar por el anti-oráculo del `insert` — reabriendo exactamente el
agujero que esa política existe para cerrar.

**Solución (migración `0009`, corrigiendo `0008` ya aplicada en
producción):** RPC `security invoker`, mismo patrón que
`upsert_my_technology_progress`, con SQL a mano que solo toca `status`
en el `SET`:

```sql
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
```

`queries/progress.ts`: `upsertMyLeccionProgress(leccionId, status)` —
sin `userId` como parámetro (lo deriva el RPC de `auth.uid()`, igual
que la versión de tecnología).

**Lección para la próxima tabla con upsert desde el cliente:** la
pregunta correcta no es "¿cuántos campos mutables tiene?" sino "¿hay
alguna columna en el `INSERT` que no deba ser editable después?". Si
la respuesta es sí — y casi siempre lo es, para `user_id`/las FKs de
identidad — el upsert va por RPC con `SET` explícito, sin excepción,
aunque solo haya un campo realmente mutable.

### Estado de la tecnología: de manual a derivado

El `<select>` de "Estado" en `ProgressControl` (`TechnologyPage.tsx`,
sección "Mi progreso") **ya no es editable**. Se calcula en el cliente
a partir del progreso real de las lecciones publicadas de esa
tecnología, no se lee ni se escribe
`user_technology_progress.status`:

- `completado`: el 100% de las lecciones publicadas están en
  `completado` (y hay al menos una — cero lecciones publicadas nunca
  cuenta como "completado", para no tratar 0-de-0 como éxito vacío).
- `en_progreso`: al menos una lección publicada está en `en_progreso`
  o `completado`, sin llegar al 100%.
- `pendiente`: ninguna lección tiene progreso, o no hay lecciones
  publicadas todavía.

Se muestra además el conteo real ("X de Y lecciones completadas") en
vez de solo la etiqueta. `user_technology_progress.status` y el
parámetro `p_status` de `upsert_my_technology_progress` (RPC de
arriba) siguen existiendo en la base de datos sin usarse desde la UI
— migrarlos o eliminarlos queda fuera de alcance de este cambio, no se
tocan hasta que haga falta de verdad.

### Qué cambia fuera de la base de datos (además de lo ya listado arriba)

- **`src/types/index.ts`**: `UserLeccionProgress { id, userId,
  leccionId, status: Status, createdAt, updatedAt }`.
- **`src/lib/queries/mappers.ts`**: `LeccionProgressRow` +
  `mapLeccionProgress`.
- **`src/lib/queries/progress.ts`**: `getMyLeccionesProgress(userId,
  leccionIds)` — una sola query con `.in('leccion_id', leccionIds)`;
  si `leccionIds` está vacío devuelve `[]` sin llamar a la API (un
  `.in()` vacío no es seguro de mandar a PostgREST) — y
  `upsertMyLeccionProgress(leccionId, status)` (RPC, ver arriba).
- **`src/lib/queries/queryKeys.ts`**: `leccionesProgress(userId,
  technologyId)` — cacheado por tecnología (granularidad de fetch de
  la UI), no por lección individual.
- **`src/lib/hooks/useProgress.ts`**: `useMyLeccionesProgress
  (technologyId, leccionIds)` + `useSetMyLeccionProgress()` — esta
  última invalida la query tras cada escritura en vez de parchear la
  caché a mano (es un array; más simple refetchear que mantenerlo
  sincronizado a mano).
- **`TechnologyPage.tsx`**: un `<select>` por lección publicada, en su
  fila dentro del módulo (ver `specs/design-system.md` para el estilo
  de pastilla), visible solo con sesión iniciada; sin fila en la tabla
  = `pendiente` por defecto, tal como se pidió. Deshabilitado mientras
  su propia mutación está en curso (no bloquea las demás filas).

### Checkpoints de seguridad específicos de `user_leccion_progress`

- [x] Revisión adversarial dedicada contra el precedente de
      `user_technology_progress` — sin hallazgos (RLS correcta, sin
      IDOR, `user_id` siempre de la sesión, sin fuga de lecciones en
      borrador en el cálculo del estado derivado).
- [ ] Un usuario no puede leer ni escribir el progreso de otro usuario
      — probar con curl real con dos identidades registradas
      distintas.
- [ ] Trackear una lección en `borrador`, o de una tecnología no
      `completado`/no admin, falla igual que un `leccion_id`
      inexistente.
- [ ] `user_id`/`leccion_id` no son editables vía `update` directo a
      la API aunque se envíen en el payload — confirmar que la fila no
      cambia, no solo que la llamada no falla.
- [x] Upsert por RPC probado en vivo contra producción con una cuenta
      real: guardar, recargar, confirmar que persiste de verdad (no
      solo UI optimista) y que el rollup de la tecnología se
      recalcula bien.

## Fuera de alcance de esta feature

- Vista agregada "todo mi progreso" (todas las tecnologías que sigo, en
  un único sitio) — esta spec solo cubre el control en la propia
  `TechnologyPage`. Se revisita si hace falta de verdad.
- Cualquier gamificación (rachas, puntos, insignias) sobre este
  progreso — no pedido, no se añade especulativamente.
