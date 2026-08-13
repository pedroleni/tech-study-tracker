# Spec: Tech Study Tracker

## 1. Problema y objetivo

App de documentación técnica curada: yo (administrador) organizo y escribo
fichas sobre las tecnologías que voy estudiando, agrupadas por categorías
(como un índice), con un dashboard inicial que muestra el estado de cada
una. **A partir de esta versión, la documentación es pública** — cualquier
visitante puede leerla sin cuenta — y los usuarios registrados pueden
marcarla como favorita y comentar en cada ficha.

> Este es un cambio de alcance respecto a la versión inicial (que era una
> app privada de un único usuario). Detalle completo del pivote —
> modelo de datos, RLS de 3 niveles, cómo te conviertes en admin — en
> [`features/public-docs.md`](features/public-docs.md).

## 2. Usuario

**Tres roles, no uno:**

- **Administrador** (yo, `profiles.role = 'admin'`): único que crea,
  edita y publica/despublica fichas de tecnología y categorías. Solo
  puede haber un administrador en la práctica — no hay UI para
  promocionar a otros, ver `features/public-docs.md`.
- **Visitante (sin cuenta):** puede leer todas las fichas publicadas y
  sus comentarios. No puede comentar ni marcar favoritos.
- **Usuario registrado:** todo lo del visitante, más comentar en
  cualquier ficha (y responder a comentarios) y marcar fichas como
  favoritas en su propio dashboard personal.

Registro abierto (cualquiera con la URL puede crear cuenta de usuario
registrado) — el administrador no se promociona desde el registro, es un
paso manual único, ver `features/public-docs.md`.

## 3. Alcance funcional

### 3.1 Documentación pública (home)
- Cualquier visitante, con o sin cuenta, ve el índice de categorías y
  fichas de tecnología **publicadas** (`status = 'completado'` — ver
  §3.3, reutiliza el campo existente como puerta de publicación en vez
  de añadir un booleano nuevo). Fichas en `pendiente`/`en_progreso` solo
  las ve el administrador (son borradores).
- No hay dashboard de estadísticas en la home pública — eso es una
  vista de administración, ver §3.6.

### 3.2 Índice por apartados
- Las fichas se agrupan por **categoría** (apartado), p. ej. "Frontend",
  "Backend", "DevOps", "Bases de datos", etc. Las categorías las
  gestiona **solo el administrador** (crear/renombrar/eliminar) — deja
  de ser una operación que cualquier usuario autenticado pueda hacer
  sobre sus propias categorías, como era en la versión de un solo
  usuario.
- Dentro de cada categoría, listado de fichas publicadas.

### 3.3 Ficha de tecnología
- Campos: nombre, categoría, estado (`pendiente` | `en_progreso`
  | `completado` — controla si está publicada, ver §3.1), prioridad
  (`alta` | `media` | `baja`), dificultad (`facil` | `media` |
  `dificil` — ahora se muestra también al lector, como señal de "nivel"
  de la ficha), notas (texto libre/markdown), enlaces/recursos (lista de
  URLs con etiqueta), fecha de creación y última actualización.
- CRUD completo: **solo el administrador** crea, edita, cambia estado o
  elimina. Visitantes y usuarios registrados tienen acceso de solo
  lectura a las fichas publicadas.

### 3.4 Autenticación
- Login/registro vía Supabase Auth (email + password), registro abierto
  (cualquiera con la URL puede crear cuenta de **usuario registrado** —
  no de administrador, ver §2 y `features/public-docs.md`).
- **Registro en dos pasos:** tras enviar los datos, se envía un código
  de 6 dígitos al email y hay que introducirlo para activar la cuenta —
  así se comprueba que la dirección existe de verdad. El formulario pide
  la contraseña dos veces.
- **Recuperación self-service:** quien olvide su contraseña la
  restablece por email, sin que intervenga nadie más. No hay
  administrador que atienda peticiones de cambio de contraseña — es un
  anti-patrón de seguridad, razonado en
  [`features/auth.md`](features/auth.md#sin-admin-que-gestione-contraseñas--decisión-deliberada).
- **Ya no todas las rutas están protegidas** — cambio respecto a la
  versión de un solo usuario. La documentación (home, índice, fichas,
  comentarios en modo lectura) es pública; solo requieren sesión:
  comentar, marcar favoritos, y el panel de administración (§3.6).
- Detalle completo de flujos, rutas y checkpoints:
  [`features/auth.md`](features/auth.md).

### 3.5 Comentarios
- Cualquier usuario **registrado** (no el visitante anónimo) puede
  comentar en una ficha de tecnología, y responder a un comentario
  existente (un único nivel de respuestas, no hilos anidados
  indefinidamente — mantiene la UI simple; se puede ampliar más
  adelante si hace falta).
- Todo el mundo, con o sin cuenta, puede **leer** los comentarios de una
  ficha publicada.
- Cada usuario puede editar/borrar sus propios comentarios. El
  administrador puede borrar cualquier comentario (moderación) pero no
  editar el de otro — borrar es una acción de moderación razonable,
  editar el texto de otra persona no lo es.
- Sin rate-limiting activo en el MVP (Supabase no lo da gratis para
  tablas propias) — la moderación es reactiva (el admin borra abuso),
  no preventiva. Si se vuelve un problema real, se añade después. Ver
  checkpoints de seguridad en `features/public-docs.md`.

### 3.6 Favoritos y panel de administración
- Cualquier usuario registrado puede marcar/desmarcar una ficha como
  favorita, y ver su propio listado de favoritos — privado, solo él lo
  ve.
- El administrador tiene, además, una vista de administración con el
  resumen numérico que antes vivía en la home (total de fichas, cuántas
  en cada estado) y el listado de fichas en borrador — esto sustituye
  al "dashboard" de la versión de un solo usuario, movido a una ruta
  protegida y solo visible por el rol admin.

### 3.7 Diseño visual
- Identidad visual propia (no solo plantilla admin genérica): paleta de
  color definida, modo oscuro desde el inicio, tipografía cuidada.
- La dificultad se muestra visualmente en cada ficha como señal de
  nivel para el lector (antes era solo una nota interna del
  administrador).

## 4. Fuera de alcance (por ahora)

- Colaboración en tiempo real (comentarios en vivo sin recargar,
  contadores de favoritos actualizándose solos entre pestañas — se lee
  al cargar/refrescar, no vía `supabase.channel`).
- Hilos de comentarios anidados más allá de un nivel (ver §3.5).
- Rate-limiting/anti-spam proactivo en comentarios (moderación reactiva
  por ahora, ver §3.5).
- Importación/exportación de datos.
- Notificaciones o recordatorios.
- App móvil nativa.
- Promoción de administradores desde la UI (sigue siendo un paso manual
  único, ver `features/public-docs.md`).

## 5. Modelo de datos (borrador)

```
profiles
  id: uuid (pk, fk -> auth.users)
  role: text  -- 'user' | 'admin' -- ya no es aspiracional: es lo que
                                   -- decide quién puede escribir contenido
  created_at: timestamptz

categories
  id: uuid (pk)
  user_id: uuid (fk -> auth.users)  -- debe ser el admin; RLS lo exige
  name: text
  created_at: timestamptz

technologies
  id: uuid (pk)
  user_id: uuid (fk -> auth.users)  -- debe ser el admin; RLS lo exige
  category_id: uuid (fk -> categories)
  name: text
  status: text    -- 'pendiente' | 'en_progreso' | 'completado'
                  -- doble función: progreso Y puerta de publicación
                  -- (solo 'completado' es visible fuera del admin)
  priority: text  -- 'alta' | 'media' | 'baja'
  difficulty: text -- 'facil' | 'media' | 'dificil' -- visible al lector
  notes: text
  resources: jsonb  -- [{ label: string, url: string }]
  created_at: timestamptz
  updated_at: timestamptz

comments  -- nueva
  id: uuid (pk)
  technology_id: uuid (fk -> technologies)
  user_id: uuid (fk -> auth.users)      -- autor, cualquier registrado
  parent_comment_id: uuid | null (fk -> comments)  -- null = comentario
                                                    -- raíz; no-null =
                                                    -- respuesta (1 nivel)
  body: text
  created_at: timestamptz
  updated_at: timestamptz

favorites  -- nueva
  id: uuid (pk)
  user_id: uuid (fk -> auth.users)
  technology_id: uuid (fk -> technologies)
  created_at: timestamptz
  -- unique(user_id, technology_id)
```

RLS de **tres niveles**, ya no "cada fila solo visible por su dueño":

- `categories`/`technologies`: **lectura pública** (`anon` incluido) de
  filas publicadas del administrador; **escritura solo si
  `profiles.role = 'admin'`** para el usuario que hace la petición, no
  por ser el dueño de la fila (ya no tiene sentido "eres dueño de tu
  propia categoría", solo hay un autor posible: el admin).
- `comments`: lectura pública; inserción solo con sesión (`user_id =
  auth.uid()`); edición solo del propio autor; borrado del propio autor
  **o** del administrador (moderación).
- `favorites`: cada fila solo es visible/creable/borrable por su dueño
  (`user_id = auth.uid()`), sin excepciones ni para el admin; no existe
  `UPDATE`, y solo puede apuntar a una ficha publicada.
- `profiles`: sin cambios — solo lectura del propio perfil, sin política
  de escritura (si el cliente pudiera actualizarla, se asignaría
  `role = 'admin'` a sí mismo).

Detalle completo de las políticas SQL, por qué la comprobación de rol
necesita una función `security definer` en un esquema privado, y el
procedimiento manual para convertirte en administrador:
[`features/public-docs.md`](features/public-docs.md).

## 6. Stack técnico

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + React Router.
- **Testing:** Vitest + React Testing Library.
- **Backend/datos:** Supabase (Postgres + Auth + cliente JS/TS
  autogenerado). Sin servidor Express propio.
- **Despliegue:** Frontend en Vercel; datos en Supabase (cloud). Acceso
  externo mediante login.

## 7. Criterios de aceptación (nivel spec)

- Un visitante sin cuenta puede navegar el índice y leer fichas
  publicadas y sus comentarios, sin ver ningún prompt de login.
- Como administrador, puedo crear una categoría y fichas dentro de ella,
  y solo se ven publicamente cuando su estado es `completado`.
- Un usuario registrado (no admin) puede comentar en una ficha,
  responder a un comentario, y marcar/desmarcar una ficha como
  favorita — y NO puede crear ni editar categorías/fichas (RLS lo
  rechaza, no solo la UI lo oculta).
- El administrador tiene una vista con contadores por estado y el
  listado de borradores, protegida por rol.
- Los tests de Vitest cubren al menos: lógica de agrupación por
  categoría, cálculo de contadores, el flujo CRUD de fichas restringido
  a admin, y que un usuario no-admin no puede escribir contenido
  (mockeando Supabase).
- La app funciona correctamente desplegada (persistencia real en
  Supabase, no solo en local) y verificada con al menos una prueba
  manual real con dos cuentas distintas (admin y usuario registrado) más
  una petición anónima sin sesión.

## 8. Decisiones cerradas (resueltas tras la fase de descubrimiento)

- Registro abierto vía Supabase Auth (email/password), sin invitaciones
  — pero solo para el rol de usuario registrado, nunca admin.
- Se incluyen `priority` y `difficulty` en la ficha de tecnología desde el
  MVP; `difficulty` pasa a mostrarse también al lector.
- Diseño con identidad visual propia y modo oscuro desde el inicio, no una
  plantilla admin genérica.
- La documentación es pública desde esta versión; el modelo de "un solo
  usuario privado" de las primeras iteraciones queda descartado — ver
  `features/public-docs.md` para el razonamiento completo del pivote.
- `status` de una ficha hace doble función (progreso de escritura +
  puerta de publicación) en vez de añadir un campo `published` nuevo —
  decisión revisable si algún día "en progreso pero visible" hace falta.

## 9. Seguridad

Checklist completo y metodología de revisión en
[`security/security-review-instructions.md`](../security/security-review-instructions.md)
— usable tanto por Claude Code (`/security-review`) como por Codex (via
`AGENTS.md`). Requisitos que debe cumplir el plan técnico y la
implementación:

- **RLS obligatorio desde la primera migración**, ahora de 3 niveles, no
  1: `categories`/`technologies` con escritura restringida a
  `profiles.role = 'admin'` (no a "eres el dueño"); `comments` con
  lectura pública pero escritura solo con sesión; `favorites` con el
  patrón antiguo de owner-only. Sin esto, cualquier usuario autenticado
  podría escribir contenido que debería ser exclusivo del admin, o leer
  favoritos ajenos (IDOR).
- **Escalada de rol sigue bloqueada**: ninguna política de escritura en
  `profiles` — ver §5. Esto es aún más crítico ahora que `role` decide
  quién puede publicar contenido, no solo un campo preparado sin usar.
- **`service_role key` nunca en el frontend**: solo la `anon key` (pública
  por diseño) viaja en variables `VITE_*`.
- **Sanitizar `notes` y `comments.body`** si se renderizan como
  HTML/markdown (evitar XSS almacenado) — ahora el riesgo es mayor
  porque `comments.body` lo escribe cualquier usuario registrado, no
  solo el admin de confianza; si se muestra como texto plano no hace
  falta sanitizador aparte.
- **Validar el esquema de las URLs en `resources`** (`http`/`https`
  únicamente) antes de usarlas como `href`.
- **Abuso de contenido público** (nuevo, no existía cuando todo era
  privado): límite de longitud en `comments.body`; el admin puede
  borrar cualquier comentario; sin rate-limiting proactivo en el MVP
  (§3.5) — riesgo aceptado y documentado, no un descuido.
- `.env` con credenciales reales en `.gitignore`; commitear solo
  `.env.example`.
- Antes de cerrar cualquier tarea de implementación que toque auth, RLS o
  renderizado de contenido de usuario, correr una revisión de seguridad
  contra el checklist de arriba.
