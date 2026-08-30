# TypeScript: temario propio + compilación real en el editor en vivo

**Estado:** 🚧 en curso — mecanismo implementado y verificado (esquema,
`typescript-en-vivo`+`@typescript/vfs`, `public/ts-libs/`, `compilar.ts`,
pestaña `ts` + panel de diagnósticos en `EditorEnVivo.tsx`); pendiente el
temario y las lecciones (sección "5. Temario de TypeScript" más abajo), que
se ejecutan después sin plan formal, igual que la ronda de HTML/CSS/JS.

**Configuración manual requerida:** ninguna todavía. La tecnología
"TypeScript" se crea vía el flujo de admin ya existente (no hace falta
migración SQL — `technologies` no tiene columnas nuevas). Si en el futuro
se decide auto-generar `public/ts-libs/` en el pipeline de build en vez de
comitear los ficheros, eso sería una tarea de CI aparte, fuera de alcance
aquí.

## Por qué existe esta feature

El editor en vivo (`editor-en-vivo`, ver
[editor-en-vivo.md](editor-en-vivo.md)) ya deja escribir y ejecutar
HTML/CSS/JS dentro de una lección, pero **no compila TypeScript** — solo
ejecuta JS tal cual en el iframe. Al mismo tiempo, el proyecto avanzado 3
de JavaScript (lección 78, "Buscador de personajes con TypeScript") ya
enseña conceptos reales de TypeScript (uniones discriminadas, `never`,
genéricos) sin que exista ningún temario de TypeScript previo — el
usuario señaló correctamente esta inversión de orden ("Yo creo que primero
habría que hacer las doc de typescript no???").

Dos decisiones de alcance ya confirmadas por el usuario (vía
`AskUserQuestion`, dos rondas):

1. No basta con contenido estático (`codigo-anotado`/`comparador-antes-despues`)
   para TypeScript — se añade compilación **real** (con diagnósticos de
   tipos reales) al editor en vivo, no una transpilación superficial que
   solo borra anotaciones.
2. El temario es extenso (40+ lecciones, no una versión reducida) y
   cubre también tipos avanzados (mapped/conditional/template literal
   types).

## Alcance

### 1. Nueva tecnología "TypeScript" en el catálogo

Sin cambios de esquema: se crea como cualquier otra tecnología, vía el
flujo de admin existente, en la misma categoría que JavaScript. Icono
propio (ya disponible en el sistema de iconos, `icons.md`).

### 2. Nuevo campo `ts` en el bloque `editor-en-vivo`

El bloque pasa de 3 a 4 lenguajes posibles. Sigue siendo **un único
archivo por lenguaje** (sin resolución de módulos entre archivos — mismo
alcance que hoy tiene html/css/js, y suficiente: cada ejercicio ya es un
fragmento autocontenido).

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Corrige el error de tipos",
  "consigna": "El switch no cubre 'error'. Arréglalo y observa cómo el panel de diagnósticos pasa a verde.",
  "ts": "type Estado = { tipo: 'ok' } | { tipo: 'error'; mensaje: string };\n// ...",
  "html": "",
  "css": "",
  "pestañaInicial": "ts"
}
```

- Pestaña `ts` con resaltado de sintaxis vía `@codemirror/lang-javascript`
  en modo `{ typescript: true }` — **no hace falta ningún paquete nuevo de
  CodeMirror**, la dependencia ya instalada lo soporta.
- Al escribir (mismo debounce ~200ms ya existente), el contenido de `ts`
  se compila con TypeScript real (ver sección siguiente) y produce dos
  cosas: una lista de diagnósticos y el JS emitido.
- **Si hay algún diagnóstico de severidad "error"**: el iframe no se
  reconstruye (se queda con el último resultado válido, o vacío si nunca
  hubo uno) y se muestra el panel de diagnósticos en su lugar — línea,
  columna, mensaje, en rojo. La lección enseña que "no compila" es un
  resultado real, no un estado que se deba ocultar.
- **Si no hay errores**: el panel de diagnósticos desaparece (o se colapsa
  a "0 errores") y el JS emitido alimenta el iframe exactamente igual que
  hoy el campo `js`.
- Warnings (si los hay) se muestran pero no bloquean la ejecución.

### 3. Motor de compilación: `typescript` real + `@typescript/vfs`, cargados bajo demanda

**Hallazgo importante de esta sesión, antes de fijar versiones:** el
paquete `typescript` en npm cambió de implementación en su major 7 — pasó
a ser el compilador nativo en Go ("tsgo"), distribuido como binarios
nativos por plataforma (`optionalDependencies` tipo
`@typescript/typescript-darwin-arm64`, etc.), con un `bin: { tsc }` de
solo-CLI y **sin `main`/`types` para uso como librería JS**. Es inservible
para este caso de uso (nada que `import()` en un bundle de navegador).

La última versión que sigue siendo el compilador clásico implementado en
JS (`main: './lib/typescript.js'`, sin binarios nativos) es **`6.0.3`** —
la misma que usa la API pública (`ts.transpileModule`, `ts.createProgram`,
`ts.LanguageService`, etc.) sobre la que se construye el propio Playground
oficial de TypeScript y sobre la que `@typescript/vfs` está diseñado.
**Fijar `typescript@6.0.3` explícito (no `^`, no `latest`)** — instalar
por accidente la v7 rompería esta feature en silencio (el import
funcionaría en Node al bundlear, pero no habría API que llamar en
runtime).

- **Dependencias nuevas**: `typescript@6.0.3` + `@typescript/vfs@1.6.4`
  (peer `typescript: '*'`, compatible). Ambas oficiales de Microsoft/su
  org en npm — mismo checkpoint de supply-chain que se hizo para
  CodeMirror.
- **Carga perezosa**: `import('typescript')` + `import('@typescript/vfs')`
  solo la primera vez que un bloque `editor-en-vivo` de la página tiene
  contenido no vacío en `ts` (code-splitting real vía Vite) — ninguna otra
  lección paga el peso de estas dependencias.
- **Ficheros `lib.*.d.ts`**: se copian desde `node_modules/typescript/lib/`
  a `public/ts-libs/` en el propio repo (comiteados, sin depender de
  ningún CDN en runtime — a diferencia del helper `createDefaultMapFromCDN`
  de `@typescript/vfs`, pensado para demos, no para producción). Qué
  ficheros exactos copiar se resuelve con la función que ya exporta
  `@typescript/vfs` para esto — `knownLibFilesForCompilerOptions(opciones, ts)`
  — en vez de adivinar a mano el grafo de referencias entre libs.
- **Entorno virtual de un solo archivo**: `createSystem(new Map([[nombreArchivo, código]]))`
  + `createVirtualTypeScriptEnvironment(sistema, [nombreArchivo], ts, opciones)`.
  Opciones fijas y razonables para todo el temario: `target: ES2020`,
  `module: ESNext`, `strict: true`, `lib: ['ES2020', 'DOM', 'DOM.Iterable']` —
  coherente con el `tsconfig.json` real ya usado en el proyecto avanzado
  (lección 78/`buscador-personajes-ts`).
- **Salida**: `env.languageService.getSemanticDiagnostics(nombreArchivo)` +
  `getSyntacticDiagnostics(nombreArchivo)` para el panel (categoría
  `Error` → severidad `error`, categoría `Warning` → `aviso`;
  `getSuggestionDiagnostics` se ignora explícitamente, es ruido de editor
  — "usa `const`" — no información de tipos), y
  `env.languageService.getEmitOutput(nombreArchivo).outputFiles[0].text`
  para el JS a inyectar en el iframe cuando no hay errores.
- **Nada cruza el límite de confianza del iframe salvo el JS ya emitido**:
  el compilador corre en el hilo principal de la página (fuera del
  sandbox), igual que ya corre CodeMirror hoy — el iframe sigue recibiendo
  solo texto JS por `srcDoc`, con `sandbox="allow-scripts"` sin
  `allow-same-origin`, sin cambios respecto al modelo ya auditado en
  `editor-en-vivo.md`.
- **Fallback si falla la carga** (red, bloqueo de terceros, etc.): mostrar
  un aviso ("no se pudo cargar el compilador de TypeScript — recarga la
  página") en vez de caer a ejecutar el `ts` sin comprobar o a un error no
  manejado.

### 4. Módulo aislado para la lógica de compilación

`src/lib/typescript-en-vivo/compilar.ts` — función pura
`compilarTypeScript(codigo: string): Promise<ResultadoCompilacionTs>`
(con `ResultadoCompilacionTs = { js: string; diagnosticos: DiagnosticoTs[] }`
y `DiagnosticoTs = { linea: number; columna: number; mensaje: string; severidad: 'error' | 'aviso' }`),
independiente de React y de `EditorEnVivo.tsx` — se puede testear con
casos concretos sin montar ningún componente, y sin necesidad de cargar el
compilador real en tests unitarios que no lo necesiten (se puede mockear
el módulo).

### 5. Temario de TypeScript (~12 módulos, 40-48 lecciones)

Mismo patrón que `contenido/{html,css,javascript}/TEMARIO.md`: doc de
planificación con fuentes citadas (principal: Handbook oficial y release
notes de `typescriptlang.org/docs/handbook`), escrito antes de las
lecciones. No repite fundamentos de JavaScript ya cubiertos (closures,
promesas, DOM) — solo lo específico del sistema de tipos.

Borrador de módulos:

1. Por qué TypeScript y primeros pasos (instalación, `tsconfig.json`
   básico, inferencia de tipos)
2. Tipos primitivos y anotaciones
3. Objetos: interfaces vs. `type`, propiedades opcionales/`readonly`,
   index signatures
4. Funciones tipadas (parámetros, retorno, opcionales/rest, sobrecarga)
5. Uniones, intersecciones y *narrowing* (`typeof`/`in`/`instanceof`,
   uniones discriminadas)
6. Enums y alternativas (`as const`)
7. Genéricos (funciones, interfaces, clases, *constraints*, valores por
   defecto)
8. Clases tipadas (modificadores de acceso, `abstract`, `implements`)
9. Utility types (`Partial`, `Pick`, `Omit`, `Record`, `ReturnType`, etc.)
10. Tipos avanzados (mapped types, conditional types, template literal
    types, `infer`)
11. Módulos, *declaration files* (`.d.ts`), `tsconfig` en profundidad
    (incluye `erasableSyntaxOnly`, ya visto en la lección 78)
12. TypeScript con herramientas reales (Vite, Zod para validación en
    runtime, ESLint) + Proyectos

**Módulo Proyectos**: la lección 78 (`proyecto-avanzado-buscador-de-personajes-con-typescript`)
se **traslada** aquí como proyecto final (cambio de `technology_id`, no
duplicado — deja de aparecer bajo JavaScript), más 2-3 proyectos nuevos
más pequeños usando el editor en vivo con el campo `ts`.

**Convención de "Requisitos" en el README de cada repo de proyecto**
(retrofiteada ya a los 3 repos existentes —`gestor-de-tareas-js`,
`explorador-personajes`, `buscador-personajes-ts`— tras detectar que
ninguno indicaba qué hacía falta instalado antes de `npm install`): todo
repo de proyecto nuevo incluye una sección `## Requisitos` antes de
`## Cómo ejecutarlo` con, como mínimo, la versión de Node.js que exige su
`vite` (`engines.node` del propio paquete, no una versión inventada — para
`vite@8` es `^20.19.0 || >=22.12.0`). El repo de TypeScript añade además
una nota aclarando que la versión de TypeScript del proyecto (`~6.0.2`,
clásica) vive en su propio `node_modules` vía `npm install`, sin relación
con qué versión de TypeScript tenga instalada el alumno en global — evita
la confusión de "por qué aquí usáis una versión vieja" cuando en realidad
es un detalle de aislamiento por proyecto, no una recomendación de qué
versión usar en general.

## Esquema (Zod)

Cambio sobre el `esquemaEditorEnVivo` ya existente en
`src/lib/laboratorio/schemas.ts` — no es un tipo de bloque nuevo (seguiría
siendo el #15 de la unión discriminada), es una extensión del mismo:

```ts
export const esquemaEditorEnVivo = z
  .object({
    tipo: z.literal('editor-en-vivo'),
    titulo: z.string().min(1).max(140).optional(),
    consigna: z.string().min(1).max(600).optional(),
    html: z.string().max(4000).default(''),
    css: z.string().max(4000).default(''),
    js: z.string().max(4000).default(''),
    ts: z.string().max(4000).default(''),
    pestañaInicial: z.enum(['html', 'css', 'js', 'ts']).default('html'),
  })
  .refine(
    (datos) => datos.html.trim() || datos.css.trim() || datos.js.trim() || datos.ts.trim(),
    { message: 'editor-en-vivo necesita contenido inicial en html, css, js o ts' },
  )
```

Retrocompatible: los bloques ya publicados sin `ts` siguen validando
(`default('')`).

## Componente

- `EditorEnVivo.tsx` — 4ª pestaña `ts` (solo visible si el bloque trae
  contenido en ese campo, mismo criterio que las otras tres). Al cambiar
  el contenido de `ts`, invoca (debounced) `compilarTypeScript()`;
  gestiona el estado de "compilador cargando" la primera vez.
- Nuevo subcomponente de presentación para el panel de diagnósticos
  (lista línea/columna/mensaje, error en rojo / aviso en ámbar) —
  reutilizando el lenguaje visual ya existente de callouts/badges, sin
  inventar un sistema de color nuevo.
- `src/lib/typescript-en-vivo/compilar.ts` — nuevo módulo, ver sección 4
  del alcance.
- `registro.ts` — sin cambios (el tipo de bloque ya está registrado).

## Cambios en archivos existentes

- `src/lib/laboratorio/schemas.ts` — extender `esquemaEditorEnVivo` (ver
  arriba).
- `src/components/bloques-laboratorio/EditorEnVivo.tsx` — pestaña `ts` +
  integración con el compilador + panel de diagnósticos.
- `src/lib/typescript-en-vivo/compilar.ts` — nuevo.
- `public/ts-libs/` — nuevos ficheros estáticos (`.d.ts` copiados de
  `node_modules/typescript/lib/`, el subconjunto exacto que devuelva
  `knownLibFilesForCompilerOptions`).
- `package.json` — nuevas dependencias: `typescript@6.0.3` (exacto, no
  `^`), `@typescript/vfs@1.6.4`.
- `contenido/typescript/` — carpeta nueva, `TEMARIO.md` + lecciones.
- `contenido/javascript/78-proyecto-avanzado-buscador-typescript.md` —
  se traslada a `contenido/typescript/` (última lección del módulo
  Proyectos) una vez exista la tecnología; `technology_id` de la lección
  ya publicada se actualiza en vez de crear una lección duplicada.
- `contenido/javascript/TEMARIO.md` — nota indicando que la lección 78 se
  trasladó y por qué.
- `specs/features/README.md` — fila nueva en el índice.

## Checkpoints de seguridad

- **Sin RLS nueva** — la tecnología "TypeScript" y sus lecciones caen bajo
  las políticas ya existentes de `technologies`/`lecciones`; no hace falta
  el subagente completo de auth/RLS, spot-check ligero basta (mismo
  criterio ya aplicado a `es_proyecto`).
- **El compilador corre fuera del iframe, en el hilo principal** — no es
  una regresión del modelo de confianza: hoy CodeMirror también corre ahí.
  Lo único que cruza hacia `iframe.srcDoc` sigue siendo texto JS, nunca el
  propio compilador ni sus internals.
- **`sandbox="allow-scripts"` sin `allow-same-origin` se mantiene sin
  cambios** en el iframe existente — revisar que la integración de
  TypeScript no añada una segunda vía de ejecución que la sortee.
- **Dos dependencias npm nuevas** → aplica
  `security-code-vulns.md`/`security-supply-chain.md`: confirmar que
  `typescript` y `@typescript/vfs` son exactamente los paquetes oficiales
  (Microsoft / `microsoft/TypeScript-vfs` en GitHub), sin typosquatting,
  y **fijar la versión exacta de `typescript` en `6.0.3`** por la razón
  explicada arriba (no delegar en semver: un `npm update` sin cuidado
  saltaría a la v7 nativa y rompería la feature en silencio, no por un
  fallo de seguridad sino de compatibilidad — aun así merece quedar
  documentado aquí para que quien haga `npm outdated` en el futuro no lo
  actualice a ciegas).
- **`public/ts-libs/*.d.ts` son ficheros estáticos comiteados**, no
  contenido generado por usuarios ni descargado en runtime — no son
  superficie de inyección.
- Límite de 4000 caracteres en `ts` (mismo orden de magnitud que el resto
  de campos del bloque).

## Checklist de implementación

- [x] Esquema Zod: campo `ts` + `refine` actualizado — Claude, TDD
  (`schemas.test.ts`)
- [x] `src/lib/typescript-en-vivo/compilar.ts` — Codex, con un fix real de
  Claude después: `@typescript/vfs` tipa toda su superficie contra
  `typeof import('typescript')` (el nombre real del paquete), no contra el
  alias `typescript-en-vivo` — un único cast (`TsReal`) al cargar el módulo
  lo resuelve. Ver el comentario en el propio fichero y en el plan.
- [x] Script `scripts/dev/generar-ts-libs.mjs` para poblar `public/ts-libs/`
  desde `node_modules/typescript-en-vivo/lib/` vía
  `knownLibFilesForCompilerOptions` — Codex (60 ficheros copiados, 4
  históricos saltados, documentado)
- [x] `EditorEnVivo.tsx`: pestaña `ts` + panel de diagnósticos + carga
  perezosa del compilador — Codex
- [x] `npm install` de `typescript-en-vivo` (alias exacto de
  `typescript@6.0.3`) + `@typescript/vfs@1.6.4` — Claude (sandbox de Codex
  sin acceso a red). Incluyó un fix real: `typescript` y `typescript-en-vivo`
  comparten el mismo `bin: tsc`, y npm solo enlaza uno de los dos en
  `node_modules/.bin/tsc` según el orden de instalación — el script `build`
  ahora usa la ruta explícita `node_modules/typescript/bin/tsc` para no
  depender de esa carrera.
- [x] Tests unitarios de `compilarEnEntorno()` con el compilador real (no
  mocks): error de tipos, código válido, tipos del DOM, exhaustividad con
  `never`, transiciones a/desde código vacío — 5/5 en verde
- [x] Verificación visual (Playwright, credenciales reales de admin,
  `/admin/referencia-contenido`): un bloque con error de tipos muestra el
  panel en rojo con línea:columna y no ejecuta; al corregirlo en el propio
  editor CodeMirror, el panel pasa a "Sin errores de tipos." y la vista
  previa se actualiza; verificado también en modo oscuro. Cero errores de
  consola/página.
- [x] `npm run build`/`lint`/`test` en verde (259/259 tests). Bundle:
  `typescript-en-vivo` sale en su propio chunk de ~1MB gzip gracias al
  `import()` dinámico — confirmado en el output real de `vite build`, no
  solo en el código.
- [ ] Tecnología "TypeScript" creada vía admin, misma categoría que
  JavaScript
- [x] `contenido/typescript/TEMARIO.md` — investigación de fuentes (índice
  completo del Handbook verificado en vivo) + planificación de 13 módulos
  / 55 lecciones
- [ ] Lecciones de TypeScript escritas módulo a módulo
- [ ] Lección 78 trasladada desde JavaScript (cambio de `technology_id`,
  actualización de `contenido/javascript/TEMARIO.md`)
- [x] `specs/features/README.md` — fila añadida, estado actualizado
- [x] Spot-check de seguridad final: `typescript`/`@typescript/vfs` son
  oficiales de `microsoft/TypeScript` y `microsoft/TypeScript-Website`;
  `sandbox="allow-scripts"` sin `allow-same-origin` sin cambios; sin
  `eval`/`dangerouslySetInnerHTML`/`new Function` en el código nuevo; sin
  migraciones nuevas (sin superficie RLS nueva)
