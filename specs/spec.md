# Spec: Tech Study Tracker

## 1. Problema y objetivo

Necesito una app personal para organizar la información de las tecnologías que
estoy estudiando: verlas agrupadas por apartados (como un índice) y tener un
dashboard inicial que muestre de un vistazo qué tecnologías tengo pendientes,
en progreso y completadas.

## 2. Usuario

Un único usuario (yo). No hay multiusuario ni colaboración en esta versión.
Acceso protegido por autenticación simple (email/password vía Supabase Auth)
para poder desplegar la app accesible desde fuera sin dejarla abierta a
cualquiera.

## 3. Alcance funcional

### 3.1 Dashboard (pantalla inicial)
- Resumen numérico: total de tecnologías, cuántas pendientes, en progreso y
  completadas.
- Listado destacado de tecnologías **pendientes de estudio** (las más
  relevantes / próximas a abordar).
- Acceso rápido a cada categoría del índice.

### 3.2 Índice por apartados
- Las tecnologías se agrupan por **categoría** (apartado), p. ej. "Frontend",
  "Backend", "DevOps", "Bases de datos", etc. Las categorías las gestiona el
  usuario (crear/renombrar/eliminar).
- Dentro de cada categoría, listado de tecnologías con su estado.

### 3.3 Ficha de tecnología
- Campos: nombre, categoría, estado (`pendiente` | `en_progreso`
  | `completado`), prioridad (`alta` | `media` | `baja`), dificultad
  (`facil` | `media` | `dificil`), notas (texto libre/markdown),
  enlaces/recursos (lista de URLs con etiqueta), fecha de creación y última
  actualización.
- CRUD completo: crear, editar, cambiar estado, eliminar.

### 3.4 Autenticación
- Login/registro simple vía Supabase Auth (email + password), registro
  abierto (cualquiera con la URL puede crear cuenta).
- Todas las rutas de datos protegidas; sin sesión no se accede al dashboard
  ni al índice.

### 3.5 Diseño visual
- Identidad visual propia (no solo plantilla admin genérica): paleta de
  color definida, modo oscuro desde el inicio, tipografía cuidada.
- El dashboard debe usar la prioridad/dificultad para destacar visualmente
  qué tecnologías pendientes conviene abordar antes.

## 4. Fuera de alcance (por ahora)

- Multiusuario / compartir datos entre personas.
- Colaboración en tiempo real.
- Importación/exportación de datos.
- Notificaciones o recordatorios.
- App móvil nativa.

## 5. Modelo de datos (borrador)

```
categories
  id: uuid (pk)
  user_id: uuid (fk -> auth.users)
  name: text
  created_at: timestamptz

technologies
  id: uuid (pk)
  user_id: uuid (fk -> auth.users)
  category_id: uuid (fk -> categories)
  name: text
  status: text    -- 'pendiente' | 'en_progreso' | 'completado'
  priority: text  -- 'alta' | 'media' | 'baja'
  difficulty: text -- 'facil' | 'media' | 'dificil'
  notes: text
  resources: jsonb  -- [{ label: string, url: string }]
  created_at: timestamptz
  updated_at: timestamptz
```

RLS en Supabase: cada fila solo visible/editable por su `user_id` (=
`auth.uid()`).

## 6. Stack técnico

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + React Router.
- **Testing:** Vitest + React Testing Library.
- **Backend/datos:** Supabase (Postgres + Auth + cliente JS/TS
  autogenerado). Sin servidor Express propio.
- **Despliegue:** Frontend en Vercel; datos en Supabase (cloud). Acceso
  externo mediante login.

## 7. Criterios de aceptación (nivel spec)

- Puedo iniciar sesión y ver un dashboard con contadores correctos por
  estado.
- Puedo crear una categoría y añadir tecnologías dentro de ella.
- Puedo cambiar el estado de una tecnología y el dashboard se actualiza.
- Los tests de Vitest cubren al menos: lógica de agrupación por categoría,
  cálculo de contadores del dashboard, y el flujo CRUD de tecnologías
  (mockeando Supabase).
- La app funciona correctamente desplegada (login + persistencia real en
  Supabase, no solo en local).

## 8. Decisiones cerradas (resueltas tras la fase de descubrimiento)

- Registro abierto vía Supabase Auth (email/password), sin invitaciones.
- Se incluyen `priority` y `difficulty` en la ficha de tecnología desde el
  MVP.
- Diseño con identidad visual propia y modo oscuro desde el inicio, no una
  plantilla admin genérica.

## 9. Seguridad

Checklist completo y metodología de revisión en
[`security/security-review-instructions.md`](../security/security-review-instructions.md)
— usable tanto por Claude Code (`/security-review`) como por Codex (via
`AGENTS.md`). Requisitos que debe cumplir el plan técnico y la
implementación:

- **RLS obligatorio desde la primera migración**: `categories` y
  `technologies` con políticas que restrinjan todo acceso a
  `user_id = auth.uid()`. Sin esto, cualquier usuario autenticado podría
  leer/editar datos de otro (IDOR).
- **`service_role key` nunca en el frontend**: solo la `anon key` (pública
  por diseño) viaja en variables `VITE_*`.
- **Sanitizar `notes`** si se renderiza como HTML/markdown (evitar XSS
  almacenado); si se muestra como texto plano no hace falta.
- **Validar el esquema de las URLs en `resources`** (`http`/`https`
  únicamente) antes de usarlas como `href`.
- `.env` con credenciales reales en `.gitignore`; commitear solo
  `.env.example`.
- Antes de cerrar cualquier tarea de implementación que toque auth, RLS o
  renderizado de contenido de usuario, correr una revisión de seguridad
  contra el checklist de arriba.
