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
5. **Responsive siempre.** Todo componente o página que se toque —
   nueva o existente — se comprueba en al menos dos anchos (móvil real,
   ~375-390px, y escritorio) antes de darla por terminada, no solo en
   el ancho por defecto del editor. No asumas que un layout de
   escritorio se comporta bien al estrecharlo sin comprobarlo —
   verificación real (Playwright con distintos viewports, o el propio
   navegador), igual que ya se exige para modo oscuro. Precedente: la
   barra de navegación (`Navbar.tsx`) se rompía en móvil por no haberse
   probado nunca por debajo de `sm`.

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

## Bandas de marca (`technologyBrandColors`)

**Qué es:** desde 2026-08 (PR #39), `TechnologyCard` (grid de
tecnologías), la cabecera de `TechnologyPage` y la cabecera de cada
módulo en la lista de lecciones usan una banda de color con el color de
marca real del icono de la tecnología, en vez del tile monocromo
pequeño (`bg-muted` + icono gris) de antes. El icono, de nuevo grande,
se recorta también como marca de agua translúcida de fondo.

**De dónde sale el color — dato, no memoria.** `src/lib/icons/
technologyBrandColors.ts` exporta `Record<string, { hex: string;
iconTone: 'light' | 'dark' }>`, con las mismas claves que
`technologyIcons.ts`. El `hex` no se escribió de memoria: se extrajo
programáticamente del paquete npm `simple-icons` (instalado en
temporal, nunca en `package.json` — mismo patrón que las
verificaciones con Playwright) para los ~68 iconos presentes en esa
versión del paquete; los pocos que faltan ahí (`css3`, `csharp`,
`aws`, `azure`, `vscode` — o bien renombrados/retirados de Simple
Icons por temas de marca registrada, o nunca incluidos) llevan su color
oficial documentado a mano, justo porque son marcas lo bastante
estables y conocidas como para no necesitar la fuente de datos. Si se
añade un icono nuevo a `technologyIcons.ts`, su color debe salir del
mismo sitio (`simple-icons`), no inventarse.

**`iconTone` se calcula, no se elige a ojo.** Luminancia relativa
(fórmula WCAG) sobre el `hex`; por encima de ~0.55 el icono/texto sobre
la banda se pinta oscuro (`text-neutral-900`), si no, blanco
(`text-white`). De los colores actuales, solo `javascript`, `react` y
`linux` caen en el lado claro y necesitan texto oscuro — el resto usa
blanco.

**Lógica compartida, no duplicada.** `TechnologyBrand`
(`src/components/technology/TechnologyCard.tsx`, exportado y reusado
por `TechnologyPage.tsx`) es un componente de render-prop que resuelve
una vez icono + color + clases de contraste + fallback, y expone
`backgroundClassName`/`foregroundClassName`/`glassClassName`/`brandHex`/
`Icon` a quien lo use. Sin entrada en el mapa (p. ej. `terminal`, que
no es una marca) cae a un tratamiento neutro (`bg-muted` /
`text-muted-foreground`), nunca a un color inventado.

**Badges "de cristal" sobre la banda — y el bug real que enseñó por
qué existen.** Los badges que van encima de una banda de color
(dificultad, prioridad, estado, contador de lecciones del módulo) NO
son `StatusBadge`/`DifficultyBadge`/`PriorityBadge` con un `className`
para sobreescribir el color — se probó así y falló en modo oscuro de
verdad: esos componentes llevan sus propias clases `dark:bg-*
dark:text-*` internas, y `tailwind-merge` no las trata como conflicto
con un `bg-white/15` sin prefijo (son "grupos" de modificador
distintos para `twMerge`), así que ambas clases quedan en el DOM a la
vez y gana la que caiga después en la hoja de estilos generada por
Tailwind — en la práctica, el color semántico propio del badge, no el
override. Confirmado visualmente con Playwright contra producción
(pastillas de "Completado"/"Dificultad fácil" en verde en vez del
cristal translúcido esperado). Arreglo real: `<span>` planos con solo
el texto de la etiqueta (`difficultyLabels`/`priorityLabels`/
`statusLabels`, en `src/components/technology/labels.ts` — separados
en su propio archivo porque mezclarlos como export no-componente en
`TechnologyCard.tsx` rompía `react-refresh/only-export-components`),
pintados con `glassClassName` de `TechnologyBrand`. **Regla derivada:**
nunca reusar un badge semántico ya estilado (`StatusBadge` y
compañía) sobre una superficie que no sea `--card`/`--background` lisos
— sobre cualquier fondo de color propio, pastilla de cristal a mano.

**La pastilla de progreso por lección reutiliza la paleta semántica de
arriba**, no colores nuevos: el `<select>` de estado en cada fila de
lección (`TechnologyPage.tsx`, ver `specs/features/progress.md`) usa
exactamente `leccionProgressPillClassName` = las mismas clases de la
tabla "Status" de esta misma sección, con `appearance-none` +
`ChevronDown` superpuesto para que se lea como una etiqueta de estado
en vez de un campo de formulario — solo se abre como desplegable al
hacer clic o con teclado, igual que cualquier `<select>` nativo.

## Inventario de componentes

| Componente | Estado | Base |
|---|---|---|
| `Button` | ✅ instalado | shadcn |
| `Input` | ✅ instalado (a mano, sin red) | estilo shadcn |
| `Label` | ✅ instalado (a mano, sin red) | estilo shadcn |
| `Card` | ✅ instalado (a mano, sin red) | estilo shadcn |
| `StatusBadge` / `PriorityBadge` / `DifficultyBadge` | ✅ implementado | paleta semántica de arriba |
| `TechnologyBrand` + `technologyBrandColors` | ✅ implementado (PR #39) | banda de marca, ver sección de arriba |
| `TechnologyCard` (grid) | ✅ implementado, banda de marca | banda de marca |
| Pastilla de progreso por lección | ✅ implementado (PR #40/#41) | paleta semántica "Status", ver arriba |
| `Dialog` (modal de edición de tecnología) | ⏳ pendiente | `npx shadcn add dialog` si hay red |
| `Select` (categoría, status, priority, difficulty en el form) | ⏳ pendiente | `npx shadcn add select` si hay red |
| `DropdownMenu` (acciones de card: editar/borrar) | ⏳ pendiente | `npx shadcn add dropdown-menu` si hay red |

## Política de contraseña (registro/login)

**Decisión:** longitud mínima alta, sin reglas de composición — no el
patrón clásico de "mayúscula + minúscula + número + símbolo".

**Por qué (no solo "porque sí"):** el
[OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
dice explícitamente: *"There should be no password composition rules
limiting the type of characters permitted. There should be no
requirement for upper or lower case or numbers or special characters."*
Las reglas de composición clásicas empujan a los usuarios hacia
patrones predecibles (`Passw0rd!`) y no mejoran la resistencia real
frente a fuerza bruta tanto como la longitud. La misma guía fija el
umbral de longitud según si hay MFA:

> "If MFA is enabled passwords shorter than 8 characters are considered
> to be weak" / "If MFA is not enabled passwords shorter than 15
> characters are considered to be weak"

Esta app **no tiene MFA** (fuera de alcance, ver `specs/spec.md`), así
que el mínimo aplicable es **15 caracteres**, no 8. Sin longitud máxima
artificialmente baja (OWASP recomienda soportar al menos 64; aquí se
permite hasta 128 para no bloquear passphrases largas).

**Reglas concretas a implementar:**
- `password`: mínimo 15 caracteres, máximo 128, cualquier carácter
  permitido (sin regex de composición).
- Mensaje de validación explica el porqué en una frase corta, no solo
  "muy corta" — ayuda a que el usuario entienda que puede usar una
  frase en vez de un password "complejo".
- Botón de mostrar/ocultar contraseña (icono ojo) en vez de un segundo
  campo de "confirmar contraseña" — reduce errores de tecleo sin
  necesidad de escribirla dos veces. (Esto es una convención de UX
  extendida, no una recomendación explícita de OWASP — el cheat sheet
  no cubre este punto.)
- **Pendiente, no implementable hoy:** comprobar la contraseña contra
  la base de datos de HaveIBeenPwned vía la integración nativa de
  Supabase Auth — existe, pero
  [solo está disponible en el plan Pro de Supabase](https://supabase.com/docs/guides/auth/password-security),
  no en el gratuito que usa este proyecto. Revisar si se activa el día
  que se pase a Pro.

## Tipografía y espaciado

Sin overrides propios más allá de lo ya en `src/index.css`
(`font-sans` = Geist Variable). Escalas de tamaño/espaciado: las
utilidades estándar de Tailwind (`text-sm`, `text-2xl`, `p-4`, `gap-2`,
etc.) — no se define una escala custom.
