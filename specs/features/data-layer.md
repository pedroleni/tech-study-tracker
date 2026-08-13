# Feature: Capa de datos (queries + hooks de React Query)

**Estado:** ✅ spec cerrada, lista para implementar. Revisada por 3
agentes adversariales (RLS/IDOR, consistencia arquitectónica,
completitud/testabilidad) antes de mandarla a Codex — no solo antes de
mergear, como pasó con la feature de auth. RLS y la invalidación
jerárquica quedaron verificados como correctos contra el SQL real y el
código fuente de TanStack Query; 8 revisiones aplicadas al documento
(marcadas inline como "corregido tras revisión"). Detalle completo de la
crítica en el run del workflow `data-layer-spec-critique`, no repetido
aquí.

CRUD de `categories` y `technologies` sobre Supabase, envuelto en hooks
de TanStack Query. Es la base de la que dependen Dashboard, índice de
categorías y ficha de tecnología — conviene cerrarla bien antes de
construir nada encima.

**Prerrequisito de lectura:** `AGENTS.md`, `specs/plan.md` §1 (decisión
de usar TanStack Query) y §4 (esquema SQL ya aplicado en
`supabase/migrations/0001_init.sql`).

---

## Decisión: mapeo `snake_case` ↔ `camelCase` explícito, no automático

Supabase devuelve filas tal cual están en Postgres (`category_id`,
`created_at`, `updated_at`); `src/types/index.ts` ya define `Category` y
`Technology` en `camelCase` (`categoryId`, `createdAt`, `updatedAt`). No
existe hoy ninguna capa que traduzca entre ambos.

Se descarta usar los tipos generados por `supabase gen types typescript`
directamente en la UI (quedarían en snake_case, distinto del resto del
código) y también descarta un mapeo "automático" genérico
(`camelcaseKeys()` sobre el resultado): un mapper explícito por tabla es
más código pero hace el contrato de cada tabla legible en un solo sitio
(`CategoryRow`/`TechnologyRow` abajo), y dado que solo hay dos tablas el
coste es bajo.

**Matiz importante, corregido tras revisión:** esto **no** falla en
compilación si cambia una columna en Postgres. `supabaseClient.ts` crea
el cliente sin el genérico `Database` (`createClient(url, key)`, no
`createClient<Database>(url, key)`), así que `.from('technologies').select()`
no está ligado a ningún esquema tipado — `mapCategory`/`mapTechnology`
reciben efectivamente `any`, y un cambio de nombre de columna en una
migración futura rompería en runtime (`undefined` silencioso), no en
compilación. Generar tipos desde el esquema real
(`supabase gen types typescript` + `createClient<Database>()`) cerraría
esto de verdad, pero exige la CLI de Supabase enlazada al proyecto —
queda fuera de esta feature, no se instala aquí solo por este matiz.

`src/lib/queries/mappers.ts`:
```ts
import type { Category, Technology } from '@/types'

// Fila cruda tal como la devuelve Supabase (snake_case, sin validar).
interface CategoryRow {
  id: string
  name: string
  created_at: string
}

interface TechnologyRow {
  id: string
  category_id: string
  name: string
  status: Technology['status']
  priority: Technology['priority']
  difficulty: Technology['difficulty']
  notes: string
  resources: Technology['resources']
  created_at: string
  updated_at: string
}

export function mapCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, createdAt: row.created_at }
}

export function mapTechnology(row: TechnologyRow): Technology {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    status: row.status,
    priority: row.priority,
    difficulty: row.difficulty,
    notes: row.notes,
    resources: row.resources,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
```

No se define `user_id` en `Category`/`Technology` (no está en
`types/index.ts` y no debe estar): es un detalle de autorización que
resuelve RLS, no algo que la UI necesite leer o mostrar. Ver siguiente
sección.

**Tipos de entrada, añadidos tras revisión.** La primera versión de este
documento dejaba `createTechnology(input)`/`updateTechnology(id, patch)`
sin tipar en la tabla de Archivos, a diferencia de `CategoryRow`/
`TechnologyRow` que sí llevan tipo completo — eso deja el checkpoint
"nunca un `user_id` pasado desde fuera" dependiendo solo de disciplina,
no del compilador. Mismo fichero `mappers.ts`:

```ts
export type NewCategoryInput = Pick<Category, 'name'>
export type CategoryPatch = Pick<Category, 'name'>

export type NewTechnologyInput = Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>

export type TechnologyPatch = Partial<
  Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>
>
```

Ninguno de los dos incluye `id`/`createdAt`/`updatedAt` (los gestiona la
base de datos) ni `userId` (no existe en `Technology`/`Category`, ver
arriba — no hay forma de que un caller lo cuele en el `patch` porque el
tipo no lo admite). `TechnologyPatch` sí permite cambiar `categoryId`
(mover una tecnología de categoría) — el trigger
`technologies_category_owner_check` ya valida que la categoría destino
sea del propio usuario, así que no hace falta restringirlo aquí también.

## Decisión: nunca filtrar por `user_id` desde el cliente

Todas las queries usan `.select()`/`.insert()`/`.update()`/`.delete()`
**sin** ningún `.eq('user_id', ...)` explícito. RLS ya lo hace en
Postgres (`0001_init.sql`: `using (user_id = (select auth.uid()))`), y
añadir el filtro en el cliente sería:

- **Redundante** cuando el usuario coincide (RLS ya lo aplica).
- **Peligrosamente engañoso** si algún día se toca RLS y se rompe: un
  filtro de cliente que "parece" hacer el trabajo de seguridad da una
  falsa sensación de estar protegido, cuando la única capa que
  realmente importa es la de Postgres. Mejor que una regresión de RLS
  se note inmediatamente (se filtran datos de otro usuario, visible en
  cualquier test manual) que quede enmascarada por un filtro de cliente
  que la disimula.

`user_id` sí se **envía** en los `insert` (no lo genera el servidor por
defecto). Sin esto, el `insert` fallaría contra la política `with check
(user_id = (select auth.uid()))` — Postgres rechazaría cualquier fila
que no llegue con el `user_id` correcto ya puesto.

**De dónde sale ese `user_id` — corregido tras revisión.** La primera
versión de este documento proponía leerlo con
`(await supabase.auth.getUser()).data.user.id` dentro de cada función de
`queries/*.ts`. Se descarta: bajo `strict: true` (activo en
`tsconfig.app.json`) `data.user` tipa como `User | null` — esa línea tal
cual **no compila** — y si se "arreglara" con un `!` en vez de comprobar
`error`, un `user` nulo (sesión expirada mientras el formulario estaba
abierto) produciría un `TypeError` genérico en runtime en vez del
`AuthError` de Supabase que el resto de esta capa promete propagar.
Además es una llamada de red nueva al servidor de Auth en cada `insert`,
cuando la app ya mantiene la sesión validada en memoria vía `useAuth()`
(`session.user`, sin red adicional).

**Decisión:** el `user.id` se obtiene una vez en el hook (que vive
detrás de `ProtectedRoute`, así que siempre hay sesión) y se pasa como
argumento explícito a la función pura de `queries/*.ts` — no se vuelve a
pedir dentro de la query:

```ts
// src/lib/queries/categories.ts — función pura, recibe userId ya validado
export async function createCategory(userId: string, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return mapCategory(data)
}

// src/lib/hooks/useCategories.ts — el hook es el único sitio que lee la sesión
export function useCreateCategory() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => {
      if (!user) throw new Error('No hay sesión activa.')
      return createCategory(user.id, name)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  })
}
```

Esto no es un cambio cosmético: sigue siendo cierto que "nunca un
parámetro pasado desde fuera" (checkpoint de seguridad, abajo) porque el
único caller de `createCategory` en toda la app es este hook, y el hook
controla de dónde sale `userId` — no queda a la disciplina del
implementador, queda fijado por el diseño.

## Decisión: una sola query por tabla, sin variante filtrada por categoría

`listTechnologies()` no acepta `categoryId`: siempre trae **todas** las
tecnologías del usuario, con una única query key `['technologies']`. El
filtrado por categoría (para `CategoryDetailPage`, feature futura) se
hace en cliente sobre esos datos ya cargados — mismo patrón que ya
existe en el propio repo (`src/lib/utils/groupByCategory.ts`), no un
patrón nuevo.

**Corregido tras revisión:** la primera versión de este documento
proponía `listTechnologies(categoryId?)` con su propia query key
jerárquica (`['technologies', categoryId]`) *a la vez* que decía en
"Fuera de alcance" que el filtrado se hacía en cliente — las dos cosas
juntas no son consistentes. Con una key separada por categoría, navegar
de "todas las tecnologías" (Dashboard) a una categoría concreta dispara
un segundo *round-trip* a Supabase pidiendo datos que ya estaban en
caché, justo lo contrario de la razón dada para cargar todo de una vez.
Una sola query, un solo caché, cero refetches redundantes.

```ts
// src/lib/queries/queryKeys.ts
export const queryKeys = {
  categories: ['categories'] as const,
  technologies: ['technologies'] as const,
}
```

## Decisión: cada mutación invalida la key de su propia entidad, sin optimistic updates

Mutaciones de `categories` invalidan `queryKeys.categories`; mutaciones
de `technologies` invalidan `queryKeys.technologies`. **Nunca al revés.**

**Corregido tras revisión:** la primera versión decía que *toda*
mutación, de cualquiera de las dos tablas, invalidaba `['technologies']`
— así que crear, renombrar o borrar una categoría nunca habría
refrescado `useCategories()` (dashboard, selector de categoría del
formulario de tecnología, índice de categorías) hasta un reload
completo. Un test escrito siguiendo esa prosa tal cual habría pasado con
el bug presente, porque estaría comprobando exactamente el
comportamiento equivocado — mismo patrón que el hallazgo 3 de
`security/reviews/2026-08-12-auth-flows.md` (test que da cobertura
aparente sobre un control que en realidad falla).

Sin optimistic updates: para una app de un solo usuario con decenas de
filas, no cientos, el refetch completo tras una mutación es instantáneo
y no compensa la complejidad de estado optimista + rollback en error +
tests adicionales por cada mutación. Si el volumen de datos creciera
mucho, se reconsideraría — no antes.

## Decisión: errores de Supabase se propagan tal cual, sin envolver

Cada función de `queries/*.ts` hace `if (error) throw error`: no se crea
una clase de error propia ni se traduce el mensaje aquí. La capa de
presentación (formularios, listas) decide qué mostrar, igual que
`AuthForm.tsx` decide mostrar mensajes genéricos en vez del error crudo.

**Precisión sobre el precedente, corregida tras revisión:** esto **no**
es "el mismo patrón que `useAuth.ts`" sin más — `useAuth.ts` en realidad
tiene dos patrones distintos según el caso: su carga inicial de sesión
(`getSession()` en el `useEffect`) **no lanza** ante un error, hace
`setSession(null)` y sigue; sus siete acciones (`signIn`, `signUp`,
etc.) sí lanzan siempre. La razón real de que **toda** función de
`queries/*.ts` lance (tanto lecturas como escrituras) no es imitar a
`useAuth.ts`, sino que es lo que TanStack Query espera de un
`queryFn`/`mutationFn` para marcar `isError` correctamente — la
justificación va por ahí, no por analogía con un hook que hace algo
distinto en su mitad de lectura.

---

## Archivos

**Nota, corregida tras revisión:** esta lista añade `mappers.ts` y
`queryKeys.ts`, que no aparecían en `specs/plan.md` §2 (solo listaba
`queries/categories.ts`/`technologies.ts` y los hooks). Es una
divergencia aditiva razonable — separar mapeo y query keys es más
limpio que meterlo todo en `categories.ts`/`technologies.ts` — pero hay
que actualizar `plan.md` §2 en el mismo cambio para que no quede
desincronizado con la estructura real.

| Archivo | Contenido |
|---|---|
| `src/lib/queries/mappers.ts` | `mapCategory`, `mapTechnology`, y los tipos `New*Input`/`*Patch` (arriba) |
| `src/lib/queries/queryKeys.ts` | objeto `queryKeys` (arriba) |
| `src/lib/queries/categories.ts` | `listCategories()`, `createCategory(userId, name)`, `renameCategory(id, name)`, `deleteCategory(id)` |
| `src/lib/queries/technologies.ts` | `listTechnologies()`, `getTechnology(id)`, `createTechnology(userId, input: NewTechnologyInput)`, `updateTechnology(id, patch: TechnologyPatch)`, `deleteTechnology(id)` |
| `src/lib/queryClient.ts` | instancia configurada de `QueryClient` (ver sección siguiente) |
| `src/lib/hooks/useCategories.ts` | `useCategories()` (query), `useCreateCategory()`, `useRenameCategory()`, `useDeleteCategory()` (mutations) |
| `src/lib/hooks/useTechnologies.ts` | `useTechnologies()`, `useTechnology(id)`, `useCreateTechnology()`, `useUpdateTechnology()`, `useDeleteTechnology()` |
| `src/App.tsx` | envolver el árbol en `QueryClientProvider` con la instancia de `lib/queryClient.ts` (no existe todavía — el paso 1 de `plan.md` §8 solo instaló las dependencias, el wiring del provider sigue pendiente) |

### Filas inexistentes o de otro usuario, añadido tras revisión

Con RLS, un `id` que no existe y un `id` que pertenece a otro usuario
producen exactamente el mismo resultado — 0 filas — sin ninguna forma de
distinguirlos por el tipo de error (correcto: evita que un código de
error revele "existe pero no es tuyo" vs "no existe", que sería otra
forma de IDOR). Pero **sin especificar qué hace cada función ante esas 0
filas**, el comportamiento por defecto de supabase-js es peligroso:
`.update()`/`.delete()` sin `.select()` devuelven `{data: null, error:
null}` tanto si afectaron 1 fila como si afectaron 0 — es decir, editar
o borrar algo ajeno o ya borrado "funciona" en silencio sin haber hecho
nada, la mutación no lanza, y `invalidateQueries` corre igual sin que la
UI se entere de que fue un no-op.

Contrato fijado para las 5 funciones basadas en `id`:

- `getTechnology(id)`: `.maybeSingle()` → `Promise<Technology | null>`.
  `null` en 0 filas (no existe / no es tuyo, indistinguibles a
  propósito); la página de detalle decide cómo mostrar un "no
  encontrado" — eso es responsabilidad de la feature de ficha de
  tecnología, no de esta capa.
- `updateTechnology`, `deleteTechnology`, `renameCategory`,
  `deleteCategory`: encadenan `.select().single()`. Con 0 filas
  afectadas, `.single()` lanza (PostgREST devuelve error si no hay
  exactamente 1 fila) — el no-op silencioso deja de ser posible, y ese
  error se propaga igual que cualquier otro (ver "Decisión: errores de
  Supabase se propagan tal cual").

`createTechnology`/`updateTechnology` con un `categoryId` que no
pertenece al usuario fallan por el trigger
`technologies_category_owner_check` (`0001_init.sql`), no por nada que
tenga que comprobar este código — mismo tratamiento: el error de
Postgres se propaga tal cual.

`deleteCategory(id)` no necesita borrar sus tecnologías a mano: la FK
`technologies.category_id references categories(id) on delete cascade`
ya lo hace en Postgres. **No reimplementar ese borrado en el cliente.**

## `QueryClient`: dónde vive y su configuración, añadido tras revisión

`src/lib/queryClient.ts`:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})
```

Se exporta como instancia de módulo (no inline en `App.tsx`) para que
los tests de hooks puedan reusarla o construir una equivalente con
`retry: false`. **Corregido tras revisión:** sin configurar `retry`, el
default de TanStack Query v5 para queries es `retry: 3` con backoff
exponencial — un error real (sesión expirada, RLS) tardaría ~7 segundos
mínimo en aparecer como `isError`. `retry: 1` es suficiente para
absorber un fallo de red puntual sin ese retraso. Las mutaciones ya
tienen `retry: 0` por defecto en TanStack Query — no hace falta tocarlo.

Tests de hooks que usan `useQuery`/`useMutation` necesitan un
`QueryClientProvider` ancestro (a diferencia de `useAuth`, que es
`useState`/`useEffect` puro y no lo necesita — no sirve de plantilla
para esto). Patrón por test, sin fichero compartido nuevo — es una
función de una línea, no justifica una abstracción:

```ts
function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}
```

`retry: false` en el cliente de test es obligatorio, no opcional: sin
él, un test que fuerza un error de mutación (requisito de test 3, abajo)
reintenta antes de fallar y el test se vuelve lento o flaky.

---

## Tests requeridos

Todos con `vi.mock('@/lib/supabaseClient')`, mismo patrón que
`useAuth.test.ts` — nunca tocar la red real.

1. Cada función de `queries/categories.ts` / `queries/technologies.ts`
   llama al método de Supabase correcto con los argumentos correctos
   (`.from('technologies').select()`, `.insert()`, etc.) y mapea la
   respuesta con `mapCategory`/`mapTechnology`.
2. `createCategory`/`createTechnology` incluyen el `userId` recibido
   como parámetro en el `insert`, y ningún otro caller en el árbol de
   hooks puede colar un `userId` distinto (ver "De dónde sale ese
   `user_id`" arriba) — comprobar contra el mock que el valor que llega
   a Supabase es exactamente el que devolvió `useAuth()`.
3. Un error de Supabase en cualquier función se propaga (`rejects.toThrow`),
   siguiendo el patrón de cobertura que faltó en `useAuth` y se corrigió
   en `security/reviews/2026-08-12-auth-flows.md` hallazgo 2 — **no
   repetir ese agujero aquí**: cada función necesita su propio test de
   error, no solo el camino feliz. Incluye el caso `useCreateCategory`/
   `useCreateTechnology` sin sesión (`user` nulo) → rechaza sin llamar a
   Supabase.
4. **Filas inexistentes o de otro usuario** (los 5 casos de la sección
   "Filas inexistentes o de otro usuario" arriba): `getTechnology` con 0
   filas → `null`, no excepción. `updateTechnology`/`deleteTechnology`/
   `renameCategory`/`deleteCategory` con 0 filas afectadas → lanzan, y el
   error es **idéntico** tanto si el mock simula "no existe" como si
   simula "es de otro usuario" — un test que solo probara uno de los dos
   casos no protegería contra que una implementación futura intente
   "mejorar" el mensaje distinguiéndolos y reintroduzca una fuga.
5. Hooks: `useCategories`/`useTechnologies` devuelven los datos
   mapeados; **cada hook de mutación invalida la query key de su propia
   entidad** — las de `categories` invalidan `queryKeys.categories`, las
   de `technologies` invalidan `queryKeys.technologies`, nunca al revés
   (corregido tras revisión: la redacción anterior de este requisito no
   distinguía por entidad, y un test fiel a esa redacción habría dejado
   pasar el bug de invalidación cruzada descrito arriba). Usar un
   `QueryClient` real de test (`renderWithQueryClient`, arriba) y
   comprobar `getQueryState(...).isInvalidated`, no mockear
   `invalidateQueries` — mockearlo solo probaría que se llamó, no con
   qué key.

## Checkpoints de seguridad

- [ ] Ninguna query añade `.eq('user_id', ...)` — si aparece uno, es
      señal de que alguien no confía en RLS y hay que preguntarse por qué
      en vez de aceptarlo sin más (podría estar compensando un bug real).
- [ ] `createCategory`/`createTechnology` reciben `userId` como parámetro
      explícito, y el único caller de esas funciones en toda la app es el
      hook correspondiente, que lo obtiene de `useAuth()` — nunca desde
      un formulario, un prop, o cualquier fuente que un caller externo
      pudiera manipular.
- [ ] Ningún `console.log` de las filas devueltas (podrían acabar en
      logs de producción con notas/recursos del usuario).
- [ ] Revisar contra `.claude/agents/security-injection.md` si
      `notes`/`resources` se tocan aquí — **no debería hacer falta**: esta
      feature es solo transporte de datos, el renderizado (markdown,
      validación de URL) es de la ficha de tecnología, feature aparte.
      Si algún test o código de esta feature ya renderiza `notes` como
      HTML, es un scope creep a corregir antes de mergear.

## Fuera de alcance de esta feature

- Paginación (la spec no la pide; con un usuario y un volumen personal
  de datos, cargar todo es correcto y más simple).
- Búsqueda/filtrado en servidor (se hace en cliente sobre los datos ya
  cargados, si hace falta, en la feature de Dashboard/Índice).
- Realtime (`supabase.channel(...)`) — la spec descarta explícitamente
  la colaboración en tiempo real (`spec.md` §4).
