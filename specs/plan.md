# Plan técnico: Tech Study Tracker

Deriva de [`spec.md`](spec.md). Este documento es la entrada para la
implementación (Codex u otro agente): estructura, esquema de datos,
decisiones de arquitectura y orden de construcción.

## 1. Decisiones de arquitectura (no cubiertas por la spec)

- **Data fetching/cache:** TanStack Query (`@tanstack/react-query`) sobre
  el cliente de Supabase. Evita reimplementar loading/cache/invalidación a
  mano y es el pairing estándar con Supabase.
- **Formularios:** `react-hook-form` + `zod` para validación (incluye la
  validación de esquema de URL en `resources` exigida por la spec de
  seguridad).
- **Renderizado de `notes`:** `react-markdown` **sin** el plugin
  `rehype-raw`. Renderiza a elementos React, no a HTML crudo, por lo que
  es seguro frente a XSS por defecto sin necesitar sanitizador aparte
  (cumple el requisito de la sección 9 de la spec).
- **Modo oscuro:** clase `dark` en `<html>`, toggle guardado en
  `localStorage`. Tailwind v4 es CSS-first (sin `tailwind.config.ts`): el
  variant se declara en `src/index.css` con
  `@custom-variant dark (&:where(.dark, .dark *));` — no con la opción
  `darkMode` de un config JS, que v4 ignora.
- **Tailwind:** v4, vía el plugin oficial `@tailwindcss/vite` (sin
  PostCSS). Los tokens de color (`--background`, `--border`, etc.) viven
  como variables CSS en `:root`/`.dark` dentro de `src/index.css`, mapeadas
  a clases de utilidad (`bg-background`, `border-border`...) mediante un
  bloque `@theme inline { --color-*: var(--*) }` en el mismo archivo.
- **Componentes UI:** shadcn/ui (Radix + Tailwind, accesible por defecto).
  No es una dependencia npm normal — el CLI genera los componentes como
  código fuente dentro de `src/components/ui/`, así que se editan
  libremente. Alias de imports `@/*` → `./src/*` configurado en
  `vite.config.ts` y en ambos `tsconfig*.json`.
- **Accesibilidad:** `eslint-plugin-jsx-a11y` (lint-time) +
  `vitest-axe` (auditoría automática con axe-core dentro de los tests de
  Vitest/RTL ya existentes, matcher `toHaveNoViolations`). Todo componente
  interactivo nuevo (formularios, modal de edición, badges clicables)
  debe tener al menos un test que renderice el componente y llame a
  `axe()` sobre el contenedor.

## 2. Estructura de carpetas

```
tech-study-tracker/
├── src/
│   ├── main.tsx
│   ├── App.tsx                  # router + providers (QueryClient, Auth)
│   ├── routes/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CategoryIndexPage.tsx
│   │   ├── CategoryDetailPage.tsx
│   │   └── TechnologyDetailPage.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui — generado por el CLI, editable
│   │   ├── layout/AppShell.tsx, Navbar.tsx, DarkModeToggle.tsx
│   │   ├── dashboard/StatsSummary.tsx, PendingList.tsx, CategoryQuickLinks.tsx
│   │   ├── technology/TechnologyForm.tsx, TechnologyCard.tsx,
│   │   │   StatusBadge.tsx, PriorityBadge.tsx, DifficultyBadge.tsx,
│   │   │   ResourceListEditor.tsx
│   │   ├── category/CategoryForm.tsx, CategoryList.tsx
│   │   └── auth/AuthForm.tsx, ProtectedRoute.tsx
│   ├── lib/
│   │   ├── utils.ts              # cn() — generado por shadcn
│   │   ├── supabaseClient.ts
│   │   ├── queries/categories.ts, technologies.ts   # funciones CRUD puras
│   │   ├── hooks/useCategories.ts, useTechnologies.ts, useAuth.ts
│   │   └── utils/groupByCategory.ts, computeStats.ts, validateResourceUrl.ts
│   ├── types/index.ts
│   └── index.css                 # Tailwind v4 (@theme, tokens, dark variant)
├── supabase/
│   └── migrations/0001_init.sql
├── .env.example
├── vite.config.ts                # plugins react + tailwindcss, alias @/*, Vitest
├── eslint.config.js               # incluye eslint-plugin-jsx-a11y
├── components.json                # config del CLI de shadcn/ui
└── AGENTS.md, CLAUDE.md, specs/, security/   # ya creados
```

## 3. Rutas

| Ruta | Página | Protegida |
|---|---|---|
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/` | DashboardPage | Sí |
| `/categorias` | CategoryIndexPage | Sí |
| `/categorias/:categoryId` | CategoryDetailPage | Sí |
| `/tecnologias/:id` | TechnologyDetailPage (edición) | Sí |
| `/tecnologias/nueva` | TechnologyDetailPage (creación) | Sí |

`ProtectedRoute` redirige a `/login` si `useAuth()` no tiene sesión activa.

## 4. Esquema de datos (Supabase)

`supabase/migrations/0001_init.sql`:

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table technologies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en_progreso', 'completado')),
  priority text not null default 'media'
    check (priority in ('alta', 'media', 'baja')),
  difficulty text not null default 'media'
    check (difficulty in ('facil', 'media', 'dificil')),
  notes text not null default '',
  resources jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index technologies_category_id_idx on technologies(category_id);
create index technologies_user_id_idx on technologies(user_id);

-- RLS: obligatorio desde esta primera migración (spec sección 9)
alter table categories enable row level security;
alter table technologies enable row level security;

create policy "categories_owner_all" on categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "technologies_owner_all" on technologies
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Evita asignar una tecnología a la categoría de otro usuario
create or replace function category_belongs_to_user()
returns trigger as $$
begin
  if not exists (
    select 1 from categories
    where id = new.category_id and user_id = new.user_id
  ) then
    raise exception 'category_id does not belong to user_id';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger technologies_category_owner_check
  before insert or update on technologies
  for each row execute function category_belongs_to_user();
```

`updated_at` se actualiza vía trigger estándar `on update` o desde el
cliente al hacer `update`; usar trigger de Postgres (`moddatetime` o
función propia) para no depender de que el cliente lo mande siempre.

## 5. Tipos (`src/types/index.ts`)

```ts
export type Status = 'pendiente' | 'en_progreso' | 'completado'
export type Priority = 'alta' | 'media' | 'baja'
export type Difficulty = 'facil' | 'media' | 'dificil'

export interface Resource { label: string; url: string }

export interface Category { id: string; name: string; createdAt: string }

export interface Technology {
  id: string
  categoryId: string
  name: string
  status: Status
  priority: Priority
  difficulty: Difficulty
  notes: string
  resources: Resource[]
  createdAt: string
  updatedAt: string
}
```

## 6. Testing (Vitest + React Testing Library)

- `jsdom` como entorno, `@testing-library/jest-dom` para matchers.
- El cliente de Supabase se mockea con `vi.mock('../lib/supabaseClient')`
  en cada test que toque `queries/*` — nunca golpear la red real.
- **Utils (unit):** `groupByCategory`, `computeStats`, `validateResourceUrl`
  (casos: `javascript:`, `data:`, url sin esquema → rechazados;
  `http:`/`https:` → aceptados).
- **Componentes:** `TechnologyForm` (validación zod, rechazo de URL con
  esquema inválido), `StatsSummary` (cuenta correcta por estado dado un
  set de datos mockeado), flujo CRUD de `TechnologyDetailPage` (crear →
  aparece en lista mockeada → cambiar estado → contador se actualiza).
- Cobertura mínima: los criterios de aceptación de la sección 7 de
  `spec.md` deben tener al menos un test que los ejercite.

## 7. Checkpoints de seguridad durante la implementación

Ligado a `security/security-review-instructions.md`:

- Al terminar la migración inicial: confirmar RLS habilitado y políticas
  activas (`select * from pg_policies`) antes de seguir.
- Al terminar `supabaseClient.ts`: confirmar que solo lee
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, nunca una service key.
- Al terminar el renderizado de `notes` y `resources`: confirmar que se
  usa `react-markdown` sin `rehype-raw` y que `validateResourceUrl` se
  aplica antes de renderizar cualquier `href`.
- Antes de dar la implementación por cerrada: correr `/security-review`
  (Claude Code) o pedir a Codex que revise contra
  `security/security-review-instructions.md`.

## 8. Orden de implementación

1. ~~`npm create vite@latest . -- --template react-ts`~~ — hecho. Igual que
   Tailwind v4 + `@tailwindcss/vite`, React Router, TanStack Query,
   react-hook-form, zod, react-markdown, supabase-js, Vitest + RTL + jsdom,
   ESLint + jsx-a11y, vitest-axe, shadcn/ui (ver sección 1).
2. ~~Config~~ — hecho: `vite.config.ts` (plugins, alias `@/*`, bloque
   `test`), `src/index.css` (tokens + dark variant), `eslint.config.js`,
   `components.json`. Falta `.env.example` con las vars reales de
   Supabase cuando exista el proyecto (paso 3).
3. Crear proyecto en Supabase (manual, por el usuario) y aplicar
   `supabase/migrations/0001_init.sql`.
4. `types/index.ts`, `lib/supabaseClient.ts`.
5. Auth: `useAuth`, `ProtectedRoute`, `LoginPage`, `RegisterPage`.
6. Data layer: `lib/queries/*.ts` (CRUD), `lib/hooks/*.ts` (React Query).
7. Utils + sus tests: `groupByCategory`, `computeStats`,
   `validateResourceUrl`.
8. UI base: `AppShell`, `Navbar`, `DarkModeToggle` — usando componentes de
   `components/ui/` (añadir con `npx shadcn@latest add <componente>`) en
   vez de HTML a mano donde exista uno equivalente (button, dialog, select,
   dropdown-menu...). Cada componente interactivo nuevo lleva un test con
   `axe()` (ver sección 1, Accesibilidad).
9. `DashboardPage` (+ `StatsSummary`, `PendingList`,
   `CategoryQuickLinks`) y sus tests.
10. `CategoryIndexPage`, `CategoryDetailPage`, `CategoryForm`,
    `CategoryList`.
11. `TechnologyDetailPage`, `TechnologyForm` (con `ResourceListEditor` y
    validación de URL), `TechnologyCard`, badges, y sus tests.
12. Checkpoint de seguridad (sección 7) + `/security-review`.
13. Deploy: proyecto en Vercel apuntando al repo, variables de entorno
    `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas en Vercel.

## 9. Fuera de este plan

Import/export de datos, notificaciones, app móvil — quedan fuera de
alcance según la sección 4 de `spec.md`.
