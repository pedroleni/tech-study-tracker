# Design system: Tech Study Tracker

Documento ligero, no una librería de componentes aparte — para una app
personal de un solo usuario, un Storybook o un design system pesado
sería sobre-ingeniería. El objetivo es solo evitar que cada rama nueva
invente su propia paleta o sus propios patrones.

## Principios

1. **No reinventar lo que ya da shadcn/Tailwind.** Espaciado,
   tipografía, radios de borde, sombras: usa las utilidades de Tailwind
   y los tokens ya definidos en `src/index.css` (`--background`,
   `--foreground`, `--primary`, `--muted`, `--border`, etc.). No añadas
   valores mágicos (`padding: 13px`, colores hex sueltos).
2. **Componentes de UI base → `src/components/ui/`, vía shadcn.** Antes
   de escribir un componente a mano, comprueba si existe en shadcn:
   `npx shadcn@latest add <componente>`. Solo se escribe a mano si no
   hay red disponible (caso de Codex en sandbox) o si shadcn no lo
   cubre — y en ese caso, seguir el mismo estilo que los ya existentes
   (`button.tsx`, `input.tsx`, `label.tsx`, `card.tsx`).
3. **Accesibilidad no es opcional.** Todo componente interactivo nuevo
   pasa por la skill `.agents/skills/web-design-guidelines/` (léela
   antes de escribir el componente) + un test con `vitest-axe`
   (`axe()` sobre el contenedor renderizado) antes de darlo por
   terminado — ya establecido en `specs/plan.md` sección 1.
4. **Modo oscuro siempre.** Cualquier color nuevo necesita su variante
   `dark:` — el toggle ya existe vía la clase `.dark` en `<html>`
   (`@custom-variant dark` en `src/index.css`). No asumas que algo "ya
   se verá bien" en oscuro sin comprobarlo.

## Paleta semántica: status / priority / difficulty

shadcn no trae colores de "éxito/aviso/error" por defecto (nuestro
`baseColor` es `neutral` — solo hay `--destructive` para rojo). Para los
tres campos con significado propio de este dominio, se usa la paleta
estándar de Tailwind directamente (no hace falta un token CSS nuevo por
cada uno — son solo 9 combinaciones fijas, usadas siempre igual):

### Status (estado del workflow, no una escala de severidad)

| Valor | Clases (claro) | Clases (oscuro) | Sentido |
|---|---|---|---|
| `pendiente` | `bg-slate-100 text-slate-700` | `dark:bg-slate-800 dark:text-slate-300` | neutral, aún no empezado |
| `en_progreso` | `bg-blue-100 text-blue-700` | `dark:bg-blue-900/40 dark:text-blue-300` | activo |
| `completado` | `bg-green-100 text-green-700` | `dark:bg-green-900/40 dark:text-green-300` | hecho |

### Priority / Difficulty (misma escala de 3 niveles, reutilizada)

Ambas comparten la escala baja→alta porque conceptualmente son lo
mismo (una severidad de 3 niveles) — así los badges de prioridad y
dificultad en la misma `TechnologyCard` usan el mismo lenguaje visual
entre sí, y quedan visualmente distintos de los de `status` (que usa
azul/verde/slate, no ámbar/rojo) para no confundir ambos sistemas
cuando aparecen juntos.

| Nivel | Priority | Difficulty | Clases (claro) | Clases (oscuro) |
|---|---|---|---|---|
| bajo | `baja` | `facil` | `bg-green-100 text-green-700` | `dark:bg-green-900/40 dark:text-green-300` |
| medio | `media` | `media` | `bg-amber-100 text-amber-700` | `dark:bg-amber-900/40 dark:text-amber-300` |
| alto | `alta` | `dificil` | `bg-red-100 text-red-700` | `dark:bg-red-900/40 dark:text-red-300` |

Implementación: `StatusBadge`, `PriorityBadge`, `DifficultyBadge`
(`src/components/technology/`, pendientes de crear per
`specs/plan.md`) — cada uno un `<span>` con `cva()` mapeando el valor
del enum a estas clases, mismo patrón que `buttonVariants` en
`button.tsx`. No un componente `Badge` genérico configurable por props
de color sueltas — los tres valores posibles de cada enum son fijos y
conocidos, así que el mapeo va hardcodeado dentro del propio componente.

## Inventario de componentes

| Componente | Estado | Base |
|---|---|---|
| `Button` | ✅ instalado | shadcn |
| `Input` | ✅ instalado (a mano, sin red) | estilo shadcn |
| `Label` | ✅ instalado (a mano, sin red) | estilo shadcn |
| `Card` | ✅ instalado (a mano, sin red) | estilo shadcn |
| `StatusBadge` / `PriorityBadge` / `DifficultyBadge` | ⏳ pendiente | paleta semántica de arriba |
| `Dialog` (modal de edición de tecnología) | ⏳ pendiente | `npx shadcn add dialog` si hay red |
| `Select` (categoría, status, priority, difficulty en el form) | ⏳ pendiente | `npx shadcn add select` si hay red |
| `DropdownMenu` (acciones de card: editar/borrar) | ⏳ pendiente | `npx shadcn add dropdown-menu` si hay red |

## Tipografía y espaciado

Sin overrides propios más allá de lo ya en `src/index.css`
(`font-sans` = Geist Variable). Escalas de tamaño/espaciado: las
utilidades estándar de Tailwind (`text-sm`, `text-2xl`, `p-4`, `gap-2`,
etc.) — no se define una escala custom.
