# Iconos de categoría y tecnología

**Estado:** 🚧 en spec, sin implementar.

## Por qué existe esta feature

`categories` y `technologies` hoy solo tienen `name` como identidad
visual — el índice público y el panel de admin son listas de texto. Con
el modelo de tres niveles ya en marcha (`lecciones.md`), y categorías
reales ya creadas (`Frontend web`, `Backend`, `Herramientas`), un icono
representativo por fila mejora el escaneo visual sin cambiar el modelo
de contenido.

Son dos necesidades distintas, no una:

- **Categoría** = concepto amplio ("Frontend web", "Backend"). No tiene
  un logo de marca propio — le corresponde un icono genérico
  (ordenador, servidor, terminal...).
- **Tecnología** = una marca concreta (React, Vue, Node, Python...). Le
  corresponde su logo real, no un icono genérico — lucide-react no
  tiene logos de marca, así que no sirve aquí.

Por eso el icono de cada tabla sale de una librería distinta.

## Dato que simplifica esta migración

`categories` tiene 3 filas reales ya en producción (`Frontend web`,
`Backend`, `Herramientas`, verificadas por curl contra la API), todas
sin icono asignado. `technologies` tiene 0 filas. No hay backfill que
hacer: la columna nace nullable en ambas tablas, con fallback visual
para el caso `null` (ver "Fallback" más abajo) — las 3 categorías
existentes simplemente se editan desde el admin después de desplegar
esto para asignarles icono, igual que se haría con cualquier fila
nueva.

## Modelo de datos

Ninguna tabla nueva, ninguna columna existente cambia de significado —
solo una columna añadida a cada una de las dos tablas ya existentes.

```sql
alter table public.categories
  add column icon text
    check (icon is null or char_length(icon) <= 60);

alter table public.technologies
  add column icon text
    check (icon is null or char_length(icon) <= 60);
```

- **`icon` guarda una key propia y estable** (p. ej. `"server"`,
  `"react"`), **no el nombre del componente de la librería.** El mapeo
  key → componente vive en código (ver siguiente sección). Así, si algún
  día cambia la librería de iconos o el nombre interno de un export, es
  un cambio de código, no una migración de datos.
- El `check` de longitud es el mismo criterio ya aplicado a
  `comments.body`/`lecciones.titulo`: límite explícito en la base, no
  solo en Zod.
- Sin `not null` — una fila sin icono asignado todavía es un estado
  válido, no un error (ver Fallback).

### GRANTs — solo se amplía, no se reescribe

Regla ya establecida en `0003`/`0004`: ninguna columna es escribible
hasta que se declara explícitamente. Los privilegios de columna en
Postgres son aditivos entre sentencias `grant` sobre la misma tabla, así
que esta migración **no** reescribe los `grant insert/update` completos
de `0003` — solo añade `icon` a lo ya concedido:

```sql
grant insert (icon), update (icon) on table public.categories to authenticated;
grant insert (icon), update (icon) on table public.technologies to authenticated;
```

Sin cambios de RLS: las políticas `categories_owner_all`-equivalentes de
`0003` (ownership + `is_admin`) ya cubren cualquier columna de la fila,
incluida esta nueva. No hace falta política nueva ni tocar las
existentes.

## Librerías y listas curadas de iconos

Dos librerías, una por tabla — no se mezclan dentro de la misma columna
de otra tabla, pero **sí conviven dentro de la lista curada de
`technologies`** cuando una tecnología no tiene logo de marca real (ver
más abajo).

### Categorías — `lucide-react` (ya es dependencia)

Lista curada de ~15-20 iconos genéricos en
`src/lib/icons/categoryIcons.ts`, como `key → { label, Icon }`. Ejemplos
de concepto a cubrir (nombres de export exactos a confirmar contra la
versión instalada, no asumir): código/frontend, servidor/backend,
terminal, base de datos, nube, móvil, globo/web, capas, caja/paquete,
chip, control de versiones, seguridad.

### Tecnologías — `react-icons/si` (dependencia nueva)

Lista curada de ~60-80 marcas habituales en
`src/lib/icons/technologyIcons.ts`, mismo formato `key → { label, Icon
}`. Cubre como mínimo las 9 tecnologías ya sobre la mesa (JS, HTML, CSS,
React, Angular, Node, Vue, Python) más margen de crecimiento (TypeScript,
Docker, Git, GitHub, PostgreSQL, MongoDB, Tailwind, Next.js, AWS...).

**Caso sin logo de marca (p. ej. "Terminal"):** no todas las
tecnologías de esta lista son una marca con logo — "Terminal" es un
concepto, no una empresa. Para esas entradas, la lista de
`technologyIcons` referencia un icono genérico de `lucide-react` en vez
de un `Si*`, con el mismo shape `{ label, Icon }` — el picker no
distingue de dónde viene cada icono, solo pinta `Icon`. Cada entrada de
la lista es responsable de traer el componente correcto; no hace falta
un prefijo de key por origen porque las dos listas (categorías,
tecnologías) son mapas independientes y ya no colisionan entre sí.

Si un día falta una marca muy poco común, se añade con un cambio de
código pequeño (un import + una entrada en el mapa) — igual que ahora
se gestionan las tecnologías, no requiere tocar la base de datos.

## Componente `IconPicker`

Nuevo componente reutilizable, `src/components/ui/icon-picker.tsx` —
va en `ui/` (no en una carpeta de dominio como `category/` o
`technology/`) porque es genérico y lo consumen ambos forms, mismo
criterio que `button.tsx`/`card.tsx`/`input.tsx`:

- Popover (usa `radix-ui`, ya es dependencia) con un input de filtro de
  texto arriba y una lista de botones debajo, cada uno mostrando el
  icono real + su `label`, filtrada en cliente según el texto escrito.
- El trigger del Popover muestra el icono ya elegido (o el fallback si
  `icon` es `null`) más una etiqueta tipo "Cambiar icono".
- Un único componente, parametrizado por `icons: Record<string, {
  label: string; Icon: ComponentType }>` — se usa tanto en `CategoryForm`
  (con `categoryIcons`) como en `TechnologyForm` (con
  `technologyIcons`), sin duplicar lógica de filtrado/Popover.
- Devuelve la `key` elegida (o `null` para "sin icono") al form padre,
  igual que cualquier otro campo controlado por `react-hook-form`.

## Fallback cuando `icon` es `null`

Un icono genérico de `lucide-react` (p. ej. el mismo usado para "sin
categoría concreta") se muestra en cualquier sitio donde se renderiza el
icono de una fila sin `icon` asignado — nunca un hueco vacío ni un
error. Aplica a las 3 categorías ya existentes hasta que se les asigne
uno, y a cualquier tecnología nueva antes de su primera edición.

## Qué cambia fuera de la base de datos

- **`CategoryForm`**: añade `IconPicker` junto al campo `name` ya
  existente.
- **`TechnologyForm`**: añade `IconPicker` (con la lista de
  tecnologías) a los campos ya existentes.
- **Dónde se pinta el icono ya guardado:**
  - `PublicHomePage` — junto al nombre de cada categoría en `#categorias`.
  - `CategoryPage` — cabecera.
  - `AdminCategoriesPage` — listado.
  - `TechnologyCard` — junto al nombre de la tecnología.
  - `TechnologyPage` — cabecera.
  - listado de tecnologías del admin.
- **`queries/categories.ts` y `queries/technologies.ts`**: el `select`
  ya trae `*` o columnas explícitas — añadir `icon` donde haga falta;
  los `insert`/`update` existentes ganan el campo `icon` en su payload.
- **`types.ts`**: `Category` y `Technology` ganan `icon: string | null`.
- **Dependencia nueva en `package.json`**: `react-icons`.

## Checkpoints de seguridad específicos de esta feature

- [ ] Un `icon` con una key que no existe en el mapa curado (dato
      corrupto o de una versión futura del código) cae al fallback
      genérico sin romper el render — no hay `throw` ni pantalla en
      blanco.
- [ ] Un usuario registrado no-admin no puede cambiar el `icon` de una
      categoría o tecnología ajena vía `PATCH` directo a la API (ya
      cubierto por las políticas RLS existentes de `0003` — este
      checkpoint es solo confirmar con curl real que sigue siéndolo tras
      el `alter table`, no releer el SQL).
- [ ] `icon` no listado en el `grant insert`/`update` antes de esta
      migración se comporta como cualquier otra columna no concedida:
      rechazado, no ignorado en silencio (mismo criterio que
      `lecciones.md`).
- [ ] El valor de `icon` que llega a la API es siempre una key del mapa
      curado (el picker es cerrado, no hay `<input type="text">` libre
      para este campo) — sin superficie nueva de HTML/texto libre que
      sanear.

## Orden de implementación

Un solo commit lógico, en este orden — cada paso deja el árbol en un
estado que compila:

1. **`supabase/migrations/0005_icons.sql`** — el SQL de la sección
   "Modelo de datos" de arriba, literal.
2. **`package.json`** — añade `"react-icons"` a `dependencies` con
   versión exacta, sin `^`/`~` (mismo criterio que el resto de
   dependencias de este `package.json`, p. ej. `"lucide-react":
   "1.31.0"`).
3. **`src/types/index.ts`** — añade `icon: string | null` a
   `Category` (línea 11-15) y a `Technology` (línea 17-29). Como
   `NewTechnologyInput`/`TechnologyPatch` (`src/lib/queries/mappers.ts:93-97`)
   se derivan de `Technology` vía `Omit<...>`, heredan `icon`
   automáticamente — no hay que tocarlos aparte.
4. **`src/lib/queries/mappers.ts`** — añade `icon: string | null` a
   `CategoryRow` (línea 4-8) y `TechnologyRow` (línea 10-20), y a los
   `map...` que las convierten a `Category`/`Technology`.
5. **`src/lib/icons/categoryIcons.ts`** (nuevo) — `Record<string, {
   label: string; Icon: ComponentType<{ className?: string }> }>` con
   ~15-20 entradas de `lucide-react` para conceptos genéricos (código,
   servidor, terminal, base de datos, nube, móvil, web, capas,
   paquete, chip, control de versiones, seguridad). Confirma los
   nombres de export exactos contra la versión instalada
   (`lucide-react@1.31.0`) antes de usarlos — no asumas que un nombre
   "obvio" existe tal cual.
6. **`src/lib/icons/technologyIcons.ts`** (nuevo) — mismo shape,
   ~60-80 entradas de `react-icons/si` cubriendo como mínimo JS, TS,
   HTML5, CSS3, React, Vue, Angular, Node, Python, Docker, Git,
   GitHub, PostgreSQL, MongoDB, Tailwind, Next.js. Para conceptos sin
   logo de marca (p. ej. `terminal`), usa un icono de `lucide-react`
   en la misma entrada — el shape es idéntico, el picker no distingue
   el origen.
7. **`src/components/ui/icon-picker.tsx`** (nuevo) — componente
   `IconPicker({ icons, value, onChange }: { icons: typeof
   categoryIcons; value: string | null; onChange: (key: string |
   null) => void })`. Popover (`radix-ui`) con un `<input>` de filtro
   y una lista de botones (icono + `label`), filtrada en cliente por
   substring case-insensitive sobre `label`. El trigger muestra el
   icono de `value` (o un icono de fallback genérico si `value` es
   `null`) más texto "Cambiar icono". Al elegir una entrada, llama
   `onChange(key)` y cierra el popover. Un botón "Quitar icono" llama
   `onChange(null)`.
8. **`src/lib/queries/categories.ts`** — `createCategory(userId:
   string, name: string, icon?: string | null)` y `renameCategory(id:
   string, name: string, icon?: string | null)` añaden `icon: icon ??
   null` al payload de `insert`/`update`. `listCategories` no cambia
   (`select()` sin columnas trae `*`).
9. **`src/lib/queries/technologies.ts`** — `toTechnologyPayload`
   (línea 7-16) añade la línea `...(input.icon !== undefined &&
   { icon: input.icon }),`, siguiendo el mismo patrón que las demás
   propiedades opcionales de esa función.
10. **`src/lib/hooks/useCategories.ts`** — `useCreateCategory`
    (`mutationFn`) y `useRenameCategory` pasan `icon` desde su
    argumento a `createCategory`/`renameCategory`. Cambia las firmas
    de `mutationFn` a recibir `{ name, icon }` /
    `{ id, name, icon }` en vez de solo `name` — actualiza también
    los sitios que llaman a estos hooks (`CategoryForm` y quien lo use).
11. **`src/components/category/CategoryForm.tsx`** y
    **`src/components/technology/TechnologyForm.tsx`** — añaden
    `IconPicker` (con `categoryIcons`/`technologyIcons`
    respectivamente) como campo opcional del formulario, con su
    propio estado controlado por `react-hook-form` (`icon: string |
    null`, default `initialIcon ?? null`). Los tests existentes que
    rellenan estos forms sin tocar el icono deben seguir pasando sin
    cambios — el campo es opcional, no bloquea el submit.
12. **Renderizado del icono ya guardado**, con fallback si es `null`:
    `src/routes/PublicHomePage.tsx`, `src/routes/CategoryPage.tsx`,
    `src/routes/AdminCategoriesPage.tsx`,
    `src/components/technology/TechnologyCard.tsx`,
    `src/routes/TechnologyPage.tsx`, y el listado de tecnologías del
    admin.
13. **Tests nuevos:** `src/components/ui/icon-picker.test.tsx`
    (filtrado, selección, "quitar icono"). **Tests a actualizar:**
    los que ya cubren `CategoryForm`/`TechnologyForm` en
    `src/routes/AdminPages.test.tsx` deben seguir en verde tal cual
    están; añade un test nuevo para "elige un icono y se guarda" en
    vez de modificar los existentes.
14. `npm run test && npm run build && npm run lint` en verde antes de
    considerar la tarea terminada — el CI de este repo no los corre
    (ver `README.md`).

## Fuera de alcance de esta feature

- Subir un icono/imagen propia (SVG/PNG) — solo librerías curadas, sin
  almacenamiento de ficheros.
- Iconos por lección — esta feature es solo categoría y tecnología.
- Ampliar la lista curada de tecnologías más allá de las ~60-80
  iniciales — se amplía bajo demanda, no de forma especulativa ahora.
