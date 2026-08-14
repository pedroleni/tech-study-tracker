# Lecciones: tercer nivel del contenido (categoría → tecnología → lección)

**Estado:** 🚧 en spec, sin implementar.

## Por qué existe esta feature

`categories` → `technologies` son hoy dos niveles: una categoría agrupa
tecnologías, y cada tecnología es una única fila con `notes` — un solo
campo de texto — como contenido completo.

Eso se ajustaba a un tracker personal, pero no a documentación pública.
Al planear qué categorías crear para empezar con HTML, quedó claro que el
modelo natural es:

- **Categoría** = dominio amplio: "Desarrollo web frontend".
- **Tecnología** = HTML, CSS, JavaScript, React... (coincide con lo que la
  tabla ya se llama).
- **Lección** = una ficha concreta dentro de esa tecnología: "Fundamentos
  del documento", "Formularios", "Tablas"...

El tercer nivel no existe. Meter las ~24 fichas previstas para HTML dentro
de un único `technologies.notes` repite, multiplicado por 24, el problema
que ya se detectó al escribir la primera ficha piloto: sin secciones, sin
poder enlazar directamente a una lección, sin poder anclar un comentario a
"Formularios" en vez de a "HTML" entero.

## Dato que cambia el cálculo de riesgo de esta migración

**`categories` y `technologies` tienen 0 filas en remoto**, confirmado por
auditoría de solo lectura durante el pivote anterior
(`supabase/diagnostics/0003_catalog_audit.sql`). Por tanto `comments` y
`favorites` —que referencian `technologies`— también tienen 0 filas: no
hay ningún dato real que backfillear ni ninguna URL ya compartida que
romper. Esto abre una opción que con datos reales habría sido mucho más
cara: **mover el ancla de los comentarios de `technology_id` a
`leccion_id` directamente**, en vez de añadir una columna opcional y
mantener las dos (la opción "barata" que se recomendó la vez pasada,
precisamente para no tocar RLS ya auditada con datos dentro). Sin datos
que perder, no hay ese coste, y el modelo mental queda más simple: un
comentario pertenece a una lección, no a una tecnología con una lección
opcional colgando.

## Modelo de datos

```
categories          (sin cambios)
  └─ technologies    (cambia el rol de `notes`, ver abajo)
       └─ lecciones  (NUEVA)
            └─ comments   (el ancla pasa de technology_id a leccion_id)
```

### `technologies`: cambia el rol de las columnas, no el esquema

- `notes` deja de ser "el contenido". Pasa a ser una introducción corta a
  la tecnología (p. ej. lo que se lee antes de la lista de lecciones en
  `/tecnologias/html`). Sin migración de columnas — incluso podríamos
  añadir un `check (char_length(notes) <= 600)` ya que deja de necesitar
  50 000 caracteres.
- `status`, `priority`, `difficulty` siguen gobernando la tecnología
  como conjunto, sin cambios.
- `resources` sigue siendo la lista de enlaces generales de la tecnología
  (spec oficial, MDN...), no de una lección concreta.

### `lecciones` (nueva tabla)

```sql
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
```

- **`slug`**: identificador legible y estable en la URL
  (`/tecnologias/html/fundamentos-del-documento`), único por tecnología,
  no globalmente — dos tecnologías pueden tener cada una una lección
  `introduccion`.
- **`modulo`**: texto libre, **no es una tabla ni una FK** — solo agrupa
  visualmente en el índice de la tecnología ("Fundamentos", "Formularios"...).
  Deliberadamente sin integridad referencial: es una etiqueta de
  presentación, no un nivel más de jerarquía con su propio RLS. Si en el
  futuro hiciera falta filtrar/administrar módulos como entidad propia,
  se revisita entonces — no antes.
- **`resumen`**: extracto corto para tarjetas del índice. Sustituye al bug
  ya detectado de renderizar `notes` crudo en `line-clamp-3`
  (`TechnologyCard.tsx`) — aquí no hay Markdown que recortar mal porque el
  resumen es texto plano desde el origen.
- **`orden`**: entero simple, no fraccionario. Convención: múltiplos de
  10 (10, 20, 30...) para poder insertar una lección entre dos existentes
  sin renumerar las demás. Con autoría de una sola persona, sin edición
  concurrente, no hace falta posición fraccionaria ni `deferrable`. Sin
  `unique(technology_id, orden)` — un empate por error humano (copiar un
  formulario sin cambiar el valor) no es un problema de seguridad, así
  que se resuelve con desempate en la consulta, no con una restricción:
  `order by orden, created_at`.
- **`status`** por lección: gate de publicación independiente del de la
  tecnología. Una tecnología puede estar visible con 3 lecciones
  publicadas y 21 en borrador. Visibilidad pública real = tecnología
  publicada **y** lección publicada (ver política de `select` abajo).
- Límite de `contenido` en 60 000 — más holgado que los 50 000 de
  `notes` porque ahora es contenido real de una lección, no notas de
  seguimiento, pero sigue siendo un límite explícito en la base, no solo
  en Zod (mismo criterio ya aplicado a `comments.body`).

### `comments`: el ancla cambia

Decisiones ya cerradas tras la crítica adversarial (ver
`security/reviews/` cuando se guarde la revisión final):

- **`technology_id` se elimina**, no convive con `leccion_id`. Limpio
  porque no hay datos que migrar, y evita que ambas columnas puedan
  desincronizarse si algún día una lección cambiara de tecnología.
- **Una lección NO puede reparentarse a otra tecnología** — `update` no
  concede escritura sobre `technology_id` (ver GRANTs). El trigger de
  comentarios no necesita revalidar coherencia lección↔tecnología, solo
  que la lección exista y esté publicada.
- **Favoritos a nivel de lección: fuera de alcance de esta spec.** Hoy
  `favorites.technology_id` significa "me interesa esta tecnología
  entera"; se revisita si hace falta de verdad.
- **Slug: se deriva del título al crear la lección, y se congela.**
  Editar el título después NO cambia el slug salvo que el admin lo pida
  explícitamente — evita romper enlaces ya compartidos.

```sql
alter table public.comments drop column technology_id;
alter table public.comments
  add column leccion_id uuid not null references public.lecciones(id) on delete cascade;

drop index if exists comments_technology_created_at_idx;
create index comments_leccion_created_at_idx
  on public.comments(leccion_id, created_at);
```

## RLS — extiende el patrón ya auditado, no lo reinventa

**Corrección tras crítica adversarial:** la primera versión de esta
sección decía "espeja exactamente `technologies`" pero no lo hacía —
faltaba `ENABLE ROW LEVEL SECURITY` (sin eso, una política es inerte y
la tabla queda abierta a lo que permita el `GRANT`), faltaba la rama que
deja al admin ver sus propios borradores, y las políticas de
insert/update/delete estaban descritas en prosa ambigua que un
implementador razonable podría leer como "exige tecnología ya
`completado`" — lo que crearía un interbloqueo: no se puede completar
una tecnología sin lecciones, ni crear lecciones sin tecnología
completada. Todo el SQL de abajo es literal, no hay ningún paso que
"reutilizar por analogía".

```sql
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
```

`comments_delete_own_or_admin` no cambia — solo mira `user_id` e
`is_admin`, igual que hoy. Las otras tres se reescriben completas,
porque es la zona con más precedente de bug de este proyecto y dejarla
en prosa fue precisamente lo que la crítica adversarial señaló como
inaceptable:

```sql
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
```

**Invariante a mantener si esto se toca en el futuro:** el filtro de
`comments_select_public`/`insert_own`/`update_own` repite explícitamente
`l.status = 'publicado' and t.status = 'completado' and is_admin(...)`
en vez de confiar en que la RLS de `lecciones` ya lo filtra. Es
deliberado — `comments` consulta `lecciones` dentro de su propia
política, y `lecciones` tiene su propia RLS; si algún día
`lecciones_select_public` cambia y `comments_*` no se actualiza a la
vez, esta repetición es lo único que evita que la cadena de tres saltos
(`comments` → `lecciones` → `technologies`) se desincronice en
silencio. Si se simplifica esto alguna vez, hay que volver a probar las
tres identidades reales contra la API, no solo releer el SQL.

**Trigger de inmutabilidad — se reescribe completo, no se toca a
medias.** `private.comment_write_is_valid()` (`0003:148-187`) referencia
`technology_id` en tres sitios; Postgres no falla al hacer `DROP COLUMN`
aunque el trigger siga citándola en su cuerpo — el error aparece después,
en el primer INSERT/UPDATE real. Este `CREATE OR REPLACE FUNCTION` va en
la MISMA transacción que el `ALTER TABLE ... DROP COLUMN technology_id`:

```sql
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
```

Cada `EXISTS` nuevo de esta sección —los de `lecciones` y los tres de
`comments`— se prueba con las tres identidades reales (anónimo,
registrado, admin) contra la API real, no solo se lee. Es el mismo
precedente que ya costó un bug bloqueante en el pivote anterior.

## GRANTs por columna

Regla ya establecida en `0003`: ninguna columna es escribible hasta que
se declara explícitamente.

```sql
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
```

**`status` va en `update` pero deliberadamente NO en `insert`** — igual
que en la tabla de arriba (`technology_id` tampoco está en `update`,
cerrando la decisión de que una lección no se reparenta). El alta de una
lección siempre entra en `borrador`; publicar es un UPDATE explícito
posterior, nunca implícito al crear. Diverge a propósito del patrón de
`technologies` (`0003:48`, donde `status` sí está en el insert) — ahí
tiene sentido porque el estado inicial es intrascendente para la
visibilidad; aquí no, porque `status='publicado'` en el momento de
creación saltaría directo a público sin que nadie lo revisara primero.
`comments`: sin cambios respecto a `0003` salvo `technology_id` →
`leccion_id` en el `insert`.

## Qué cambia fuera de la base de datos

Esto no es solo una migración — reparte una responsabilidad que hoy vive
entera en `TechnologyPage.tsx`:

- **`TechnologyPage`** deja de mostrar `notes` como el artículo. Pasa a
  ser una portada: introducción corta + lista de lecciones agrupada por
  `modulo`, cada una linkando a su propia página.
- **`LeccionPage`** (nueva): renderiza `lecciones.contenido` con
  `SafeMarkdown`, y `CommentsSection` recibe `leccionId` en vez de
  `technologyId`.
- **`AdminLeccionFormPage`** (nueva): formulario de alta/edición de una
  lección. Puede empezar tan simple como el `<textarea>` actual de
  tecnologías — mejorarlo (vista previa, editor con resaltado ya
  construido en `src/components/codigo/EditorCodigo.tsx`) es una mejora
  posterior, no un requisito de esta spec.
- **Rutas nuevas**: `/tecnologias/:id/:leccionSlug`,
  `/admin/tecnologias/:id/lecciones/nueva`,
  `/admin/tecnologias/:id/lecciones/:leccionId/editar`.
- **`queries/`, `hooks/`, `queryKeys`**: nuevo módulo `lecciones.ts`
  espejando `technologies.ts`; `comments.ts` cambia su parámetro de
  `technologyId` a `leccionId`.

## Checkpoints de seguridad específicos de esta feature

- [ ] Una lección en `borrador` no es visible para un no-admin aunque se
      conozca su `id` exacto — probar con curl directo a la API, no solo
      leyendo la política.
- [ ] Una lección `publicado` de una tecnología en `pendiente`/
      `en_progreso` (no `completado`) **tampoco** es visible — las dos
      condiciones del `AND` se prueban por separado, no solo juntas.
- [ ] Insertar un comentario contra una lección en borrador falla igual
      que contra un `leccion_id` inexistente (mismo criterio anti-oráculo
      ya aplicado a `favorites` y `technologies`).
- [ ] Mover un comentario propio hacia una lección en borrador vía
      `PATCH` directo falla (repetir el caso que ya se exige para
      `comments_update_own` en `public-docs.md`, ahora contra `lecciones`
      en vez de `technologies`).
- [ ] `lecciones_select_public` probado con las tres identidades reales
      contra la API, no solo leído — precedente del bug bloqueante
      original de este proyecto.
- [ ] GRANTs por columna verificados: un campo no listado en el `grant
      insert`/`update` debe rechazarse, no ignorarse en silencio.

## Fuera de alcance de esta feature

- Favoritos a nivel de lección (ver decisión abierta arriba).
- Editor de lecciones con vista previa en vivo — el formulario puede
  empezar como un `<textarea>` simple.
- Reordenar lecciones arrastrando en el admin — el campo `orden` se edita
  como número por ahora.
- Migrar `contenido/html/*.md` a la base de datos automáticamente — se
  copia a mano al crear cada lección desde el admin, como ya se hizo con
  la ficha piloto.
