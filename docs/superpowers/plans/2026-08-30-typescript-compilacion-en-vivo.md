# TypeScript en el editor en vivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir una 4ª pestaña `ts` al bloque `editor-en-vivo`, respaldada por un compilador de TypeScript real (no una transpilación superficial) que corre en el navegador y muestra diagnósticos de tipos de verdad, sin depender de ningún CDN en producción.

**Architecture:** `typescript` (aliasado como `typescript-en-vivo`, para no chocar con el `typescript` de las devDependencies del propio proyecto) + `@typescript/vfs` se cargan con `import()` dinámico solo cuando un bloque tiene contenido en `ts`. Un módulo aislado (`src/lib/typescript-en-vivo/compilar.ts`) separa la creación del entorno (async, una vez) de la recompilación por cada pulsación (síncrona). El JS ya emitido — nunca el compilador ni sus internals — es lo único que cruza hacia el `iframe sandbox="allow-scripts"` ya existente.

**Tech Stack:** React 19, TypeScript, Zod, CodeMirror 6, Vite, Vitest, `typescript@6.0.3` (aliasado), `@typescript/vfs@1.6.4`.

**Spec:** [specs/features/typescript-compilacion-en-vivo.md](../../../specs/features/typescript-compilacion-en-vivo.md)

**Out of scope de este plan** (secciones 1 y 5 de la spec, se ejecutan después sin plan formal, igual que la ronda anterior de HTML/CSS/JS): crear la tecnología "TypeScript" vía admin, escribir `contenido/typescript/TEMARIO.md`, redactar las lecciones, y trasladar la lección 78 desde JavaScript.

## Global Constraints

- `typescript@7` es el compilador nativo en Go (binarios por plataforma, sin API de JS importable) — la dependencia real de este plan es `typescript@6.0.3` exacto (sin `^`), instalada bajo el nombre `typescript-en-vivo` vía alias de npm para no chocar con la devDependency `typescript@5.9.3` que ya usa `tsc -b` para compilar el propio proyecto. Nunca `npm install typescript-en-vivo@latest`.
- `@typescript/vfs@1.6.4` exacto, mismo motivo de estabilidad.
- **`typescript` y `typescript-en-vivo` son, por dentro, el mismo paquete** (el alias solo cambia el nombre de la carpeta en `node_modules`, no el `name` de su propio `package.json`, que sigue siendo `"typescript"`) — ambos declaran el mismo `bin: { tsc, tsserver }`, y npm enlaza **uno de los dos, no los dos**, en `node_modules/.bin/tsc`, dependiendo del orden de instalación (verificado empíricamente antes de escribir este plan: instalar `typescript-en-vivo` después de `typescript` deja `.bin/tsc` apuntando a la v6.0.3, no a la v5.9.3 del propio proyecto). El script `"build"` de `package.json` deja de depender de `.bin/tsc` por este motivo exacto (ver Task 2, Step 4) — nunca revertir ese cambio a `"tsc -b && vite build"` mientras conviva con `typescript-en-vivo`.
- Nada de CDN en runtime: los ficheros `lib.*.d.ts` se generan una vez con un script y se comitean en `public/ts-libs/`.
- El iframe de la vista previa sigue siendo `sandbox="allow-scripts"` **sin** `allow-same-origin` — ningún paso de este plan lo toca ni añade una segunda vía de ejecución.
- Identificadores y comentarios en español, siguiendo la convención ya establecida en todo `src/laboratorio`/`bloques-laboratorio`.
- Todo el código nuevo que constituye lógica (esquema, `compilar.ts`) se escribe con TDD: test que falla → implementación → test en verde.

---

## Task 1: Esquema Zod — campo `ts` en `editor-en-vivo`

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts:187-199`
- Test: Create `src/lib/laboratorio/schemas.test.ts`

**Interfaces:**
- Produces: `esquemaEditorEnVivo` acepta un campo `ts: string` (default `''`); `DatosEditorEnVivo['ts']: string`; `DatosEditorEnVivo['pestañaInicial']` acepta también `'ts'`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/laboratorio/schemas.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { esquemaEditorEnVivo } from './schemas'

describe('esquemaEditorEnVivo', () => {
  it('acepta un bloque que solo trae contenido en ts', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x: number = 1;',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('const x: number = 1;')
      expect(resultado.data.html).toBe('')
      expect(resultado.data.pestañaInicial).toBe('html')
    }
  })

  it('acepta pestañaInicial: "ts"', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      ts: 'const x = 1;',
      pestañaInicial: 'ts',
    })

    expect(resultado.success).toBe(true)
  })

  it('sigue rechazando un bloque sin contenido en ningún campo', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
    })

    expect(resultado.success).toBe(false)
  })

  it('sigue validando bloques ya publicados sin el campo ts (retrocompatible)', () => {
    const resultado = esquemaEditorEnVivo.safeParse({
      tipo: 'editor-en-vivo',
      html: '<p>Hola</p>',
    })

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.ts).toBe('')
    }
  })
})
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm run test -- schemas.test.ts`
Expected: FAIL — `ts` no es un campo reconocido / `pestañaInicial: 'ts'` no valida (Zod rechaza el enum).

- [ ] **Step 3: Implementar el cambio mínimo**

En `src/lib/laboratorio/schemas.ts`, reemplazar el bloque de `esquemaEditorEnVivo` (líneas 187-199) por:

```ts
// Editor en vivo: la lección deja de describir un resultado y deja probarlo
// de verdad. Al menos uno de html/css/js/ts debe traer contenido — un
// bloque con los cuatro vacíos no tiene sentido y `refine` lo rechaza en
// vez de dejarlo caer en un editor completamente en blanco.
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
    (datos) =>
      datos.html.trim() || datos.css.trim() || datos.js.trim() || datos.ts.trim(),
    { message: 'editor-en-vivo necesita contenido inicial en html, css, js o ts' },
  )
```

- [ ] **Step 4: Ejecutar el test y comprobar que pasa**

Run: `npm run test -- schemas.test.ts`
Expected: PASS (4/4)

- [ ] **Step 5: Comprobar que el resto de la suite sigue en verde**

Run: `npm run test`
Expected: PASS — ningún test existente depende de que `pestañaInicial`/`ts` tengan una forma distinta.

- [ ] **Step 6: Commit**

```bash
git add src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts
git commit -m "feat(laboratorio): campo ts en el bloque editor-en-vivo"
```

---

## Task 2: Instalar `typescript-en-vivo` (alias de `typescript@6.0.3`) y `@typescript/vfs@1.6.4`

Esta tarea la ejecuta Claude directamente (requiere red — el sandbox de Codex no la tiene).

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `node_modules/typescript-en-vivo` (el compilador clásico de TypeScript real, importable como `import('typescript-en-vivo')`) y `node_modules/@typescript/vfs`, disponibles para las Tasks 3 y 4.

- [ ] **Step 1: Instalar las dos dependencias con versión exacta**

Run:
```bash
npm install --save-exact typescript-en-vivo@npm:typescript@6.0.3
npm install --save-exact @typescript/vfs@1.6.4
```

Expected: `package.json` gana, bajo `"dependencies"`:
```json
"typescript-en-vivo": "npm:typescript@6.0.3",
"@typescript/vfs": "1.6.4"
```

- [ ] **Step 2: Verificar que no choca con la devDependency `typescript` existente (resolución por nombre de módulo)**

Run: `node -e "console.log(require('typescript/package.json').version, require('typescript-en-vivo/package.json').version)"`
Expected: imprime dos versiones distintas (`5.9.3` y `6.0.3`) sin error — `require('typescript')`/`require('typescript-en-vivo')` resuelven por nombre de carpeta en `node_modules`, así que esto siempre funciona bien independientemente del problema del Step 3.

- [ ] **Step 3: Comprobar (y corregir si hace falta) la colisión de `node_modules/.bin/tsc`**

`typescript` y `typescript-en-vivo` son, por dentro, el mismo paquete (mismo `bin: { tsc, tsserver }`) — npm solo puede enlazar uno de los dos en `node_modules/.bin/tsc`, y cuál gana depende del orden de instalación, no es determinista de fiar.

Run: `node_modules/.bin/tsc --version`

Si imprime `Version 5.9.3` (la devDependency del proyecto), no hace falta nada más — pero **no confiar en que se mantenga así** tras un `npm install` futuro. Independientemente del resultado, aplicar el Step 4 (usar la ruta explícita en el script `build`), que hace que el resultado de este comando deje de importar.

- [ ] **Step 4: Blindar el script `build` contra la colisión — ruta explícita, no `.bin/tsc`**

En `package.json`, cambiar:

```json
"build": "tsc -b && vite build",
```

por:

```json
"build": "node_modules/typescript/bin/tsc -b && vite build",
```

Esto apunta directamente a la carpeta `typescript` (la devDependency real del proyecto, `5.9.3`), sin pasar por `node_modules/.bin/tsc` — el propio build deja de depender de qué paquete haya ganado el enlace del bin.

- [ ] **Step 5: Verificar que el build y los tests del proyecto no se rompen con la instalación + el cambio de script**

Run: `npm run build && npm run test`
Expected: ambos en verde — todavía no hay código nuevo que use `typescript-en-vivo`/`@typescript/vfs`, este paso solo descarta un conflicto de instalación o del cambio al script `build`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: instalar typescript-en-vivo (typescript@6.0.3 aliasado) y @typescript/vfs

Cambia además el script build para usar node_modules/typescript/bin/tsc
explícito: typescript y typescript-en-vivo son el mismo paquete por dentro
(mismo bin tsc/tsserver) y npm solo enlaza uno de los dos en .bin/tsc según
el orden de instalación - la ruta explícita hace que el build siempre use
la devDependency del proyecto (5.9.3), no la que gane esa carrera."
```

---

## Task 3: Generar `public/ts-libs/` (ficheros `lib.*.d.ts`, sin CDN en runtime)

**Files:**
- Create: `scripts/dev/generar-ts-libs.mjs`
- Modify: `package.json` (nuevo script npm)
- Create (generados, se comitean): `public/ts-libs/*.d.ts`

**Interfaces:**
- Produces: `public/ts-libs/<nombre>.d.ts`, servidos como estáticos por Vite en `/ts-libs/<nombre>.d.ts` — de esto depende la Task 4 (el `cargarLib` por defecto de `compilar.ts` hace `fetch('/ts-libs/' + nombre)`) y la Task 5 (los tests de `compilar.ts` los leen del disco).

- [ ] **Step 1: Escribir el script**

Crear `scripts/dev/generar-ts-libs.mjs`:

```js
// Genera public/ts-libs/ - los ficheros lib.*.d.ts que el compilador de
// TypeScript en el navegador necesita (src/lib/typescript-en-vivo/compilar.ts)
// para no depender de ningún CDN en producción. Se ejecuta una vez (o cada
// vez que cambie la versión de typescript-en-vivo en package.json) y el
// resultado se comitea - no se regenera en cada build.
//
// Uso: npm run generar-ts-libs

import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import ts from 'typescript-en-vivo'
import { knownLibFilesForCompilerOptions } from '@typescript/vfs'

const require = createRequire(import.meta.url)
const directorioLib = join(dirname(require.resolve('typescript-en-vivo/package.json')), 'lib')
const directorioDestino = join(process.cwd(), 'public', 'ts-libs')

// Debe coincidir con el target/lib que usa
// src/lib/typescript-en-vivo/compilar.ts (ver el comentario allí) - si
// cambias uno, cambia el otro y vuelve a ejecutar este script.
const nombresLib = knownLibFilesForCompilerOptions(
  { target: ts.ScriptTarget.ES2020, lib: ['es2020', 'dom', 'dom.iterable'] },
  ts,
)

mkdirSync(directorioDestino, { recursive: true })

let copiados = 0
let saltados = 0
for (const nombre of nombresLib) {
  const origen = join(directorioLib, nombre)
  if (!existsSync(origen)) {
    // knownLibFilesForCompilerOptions incluye nombres históricos que ya no
    // existen en esta versión de TypeScript - comportamiento documentado
    // por la propia librería (ver su comentario en el código fuente), no
    // un error de este script.
    saltados++
    continue
  }
  writeFileSync(join(directorioDestino, nombre), readFileSync(origen, 'utf8'))
  copiados++
}

console.log(
  `generar-ts-libs: ${copiados} ficheros copiados a public/ts-libs/, ${saltados} saltados (no existen en esta versión de TypeScript)`,
)
if (copiados === 0) {
  throw new Error('No se copió ningún fichero lib - revisa la instalación de typescript-en-vivo')
}
```

- [ ] **Step 2: Añadir el script npm**

En `package.json`, dentro de `"scripts"`:

```json
"generar-ts-libs": "node scripts/dev/generar-ts-libs.mjs"
```

- [ ] **Step 3: Ejecutarlo y comprobar el resultado**

Run: `npm run generar-ts-libs`
Expected: imprime algo como `generar-ts-libs: 60 ficheros copiados a public/ts-libs/, 4 saltados (no existen en esta versión de TypeScript)` (el número exacto puede variar ligeramente entre patch releases de TypeScript, pero **debe ser mayor que 0 copiados** y debe incluir, como mínimo, `lib.es2020.d.ts` y `lib.dom.d.ts`).

Run: `ls public/ts-libs/ | grep -E "^(lib.es2020.d.ts|lib.dom.d.ts|lib.dom.iterable.d.ts)$"`
Expected: los tres nombres aparecen.

- [ ] **Step 4: Commit**

```bash
git add scripts/dev/generar-ts-libs.mjs package.json public/ts-libs/
git commit -m "feat(typescript-en-vivo): generar public/ts-libs desde typescript-en-vivo"
```

---

## Task 4: Módulo `compilar.ts` (entorno TypeScript real, sin mocks)

**Files:**
- Create: `src/lib/typescript-en-vivo/compilar.ts`
- Test: Create `src/lib/typescript-en-vivo/compilar.test.ts`

**Interfaces:**
- Consumes: `public/ts-libs/*.d.ts` (Task 3), `typescript-en-vivo`/`@typescript/vfs` (Task 2).
- Produces:
  - `interface DiagnosticoTs { linea: number; columna: number; mensaje: string; severidad: 'error' | 'aviso' }`
  - `interface ResultadoCompilacionTs { js: string; diagnosticos: DiagnosticoTs[] }`
  - `interface EntornoTypeScript` (opaco — lo único que le importa a quien lo consume es pasarlo tal cual a `compilarEnEntorno`)
  - `crearEntornoTypeScript(cargarLib?: (nombre: string) => Promise<string>): Promise<EntornoTypeScript>`
  - `compilarEnEntorno(entornoTs: EntornoTypeScript, codigo: string): ResultadoCompilacionTs`
  - Usado por la Task 5 (`EditorEnVivo.tsx`).

**Nota de diseño importante (verificada empíricamente antes de escribir este plan, no es una suposición):** `createVirtualTypeScriptEnvironment` lanza `File not found` si el archivo raíz se crea con contenido `''`, y `entorno.updateFile(nombre, '')` deja el languageService incapaz de encontrar el archivo en llamadas posteriores. Por eso el archivo raíz nunca recibe una cadena vacía: se sustituye por `MARCADOR_VACIO = ' '` y `compilarEnEntorno` corta camino antes de llegar a esa función cuando el código está vacío o solo tiene espacios.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/lib/typescript-en-vivo/compilar.test.ts`:

```ts
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { compilarEnEntorno, crearEntornoTypeScript } from './compilar'

async function cargarLibDesdeDisco(nombre: string): Promise<string> {
  return readFile(join(process.cwd(), 'public', 'ts-libs', nombre), 'utf8')
}

describe('compilarEnEntorno', () => {
  it('detecta un error real de tipos y no emite JS', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const resultado = compilarEnEntorno(entorno, 'const x: number = "hola";')

    expect(resultado.js).toBe('')
    expect(resultado.diagnosticos).toHaveLength(1)
    expect(resultado.diagnosticos[0].severidad).toBe('error')
    expect(resultado.diagnosticos[0].mensaje).toContain('not assignable')
  })

  it('emite JS cuando el código es válido', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const resultado = compilarEnEntorno(entorno, 'const x: number = 5;')

    expect(resultado.diagnosticos).toEqual([])
    expect(resultado.js).toContain('5')
  })

  it('reconoce los tipos del DOM (confirma que lib.dom.d.ts se cargó bien)', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const resultado = compilarEnEntorno(
      entorno,
      'const el: HTMLElement | null = document.querySelector("div");',
    )

    expect(resultado.diagnosticos).toEqual([])
  })

  it('detecta un switch no exhaustivo sobre una unión discriminada', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)
    const codigo = `
type Estado = { tipo: 'a' } | { tipo: 'b' };
function f(e: Estado): number {
  switch (e.tipo) {
    case 'a': return 1;
    default:
      const _exhaustivo: never = e;
      return _exhaustivo;
  }
}
`
    const resultado = compilarEnEntorno(entorno, codigo)

    expect(resultado.diagnosticos.some((d) => d.severidad === 'error')).toBe(true)
  })

  it('no revienta con código vacío, ni al pasar de vacío a válido y de vuelta', async () => {
    const entorno = await crearEntornoTypeScript(cargarLibDesdeDisco)

    expect(compilarEnEntorno(entorno, '')).toEqual({ js: '', diagnosticos: [] })
    expect(compilarEnEntorno(entorno, 'const x = 1;').diagnosticos).toEqual([])
    expect(compilarEnEntorno(entorno, '   ')).toEqual({ js: '', diagnosticos: [] })
  })
})
```

- [ ] **Step 2: Ejecutar los tests y comprobar que fallan**

Run: `npm run test -- compilar.test.ts`
Expected: FAIL — `./compilar` no existe todavía.

- [ ] **Step 3: Implementar `compilar.ts`**

Crear `src/lib/typescript-en-vivo/compilar.ts`:

```ts
// Compilador de TypeScript real (no una transpilación superficial) que
// corre en el navegador. `typescript-en-vivo` (alias de typescript@6.0.3 —
// ver Global Constraints del plan) y `@typescript/vfs` se cargan con
// import() dinámico: solo se descargan cuando una lección tiene contenido
// en el campo `ts` de un bloque `editor-en-vivo`, nunca en el resto de
// páginas. Ver specs/features/typescript-compilacion-en-vivo.md.

const NOMBRE_ARCHIVO = 'archivo.ts'
// El entorno no admite un archivo raíz con contenido vacío: createVirtual-
// TypeScriptEnvironment lanza "File not found" con '' (verificado antes de
// escribir este módulo). Ver la nota de diseño en el plan de implementación.
const MARCADOR_VACIO = ' '

// Si cambias estas opciones, actualiza también scripts/dev/generar-ts-libs.mjs
// (debe generar los mismos ficheros lib) — mismo target/lib en los dos sitios.
const OPCIONES_JSON = {
  target: 'ES2020',
  module: 'ESNext',
  lib: ['ES2020', 'DOM', 'DOM.Iterable'],
  strict: true,
}

export interface DiagnosticoTs {
  linea: number
  columna: number
  mensaje: string
  severidad: 'error' | 'aviso'
}

export interface ResultadoCompilacionTs {
  js: string
  diagnosticos: DiagnosticoTs[]
}

export interface EntornoTypeScript {
  ts: typeof import('typescript-en-vivo')
  entorno: import('@typescript/vfs').VirtualTypeScriptEnvironment
}

async function cargarLibPorFetch(nombre: string): Promise<string> {
  const respuesta = await fetch(`/ts-libs/${nombre}`)
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${nombre} (${respuesta.status})`)
  }
  return respuesta.text()
}

export async function crearEntornoTypeScript(
  cargarLib: (nombre: string) => Promise<string> = cargarLibPorFetch,
): Promise<EntornoTypeScript> {
  const [ts, vfs] = await Promise.all([import('typescript-en-vivo'), import('@typescript/vfs')])

  // convertCompilerOptionsFromJson es la única vía soportada para pasar de
  // nombres "amigables" (lib: ["DOM"]) a CompilerOptions ya resueltas
  // (lib: ["lib.dom.d.ts"]) - construir CompilerOptions.lib a mano con los
  // nombres cortos no funciona con createVirtualTypeScriptEnvironment
  // (verificado antes de escribir este módulo).
  const { options: opciones, errors } = ts.convertCompilerOptionsFromJson(OPCIONES_JSON, '/')
  if (errors.length > 0) {
    throw new Error('Opciones de compilador de TypeScript inválidas')
  }

  // knownLibFilesForCompilerOptions, en cambio, quiere los nombres CORTOS
  // en minúscula - hace su propio match de prefijo internamente.
  const nombresLib = vfs.knownLibFilesForCompilerOptions(
    { target: ts.ScriptTarget.ES2020, lib: ['es2020', 'dom', 'dom.iterable'] },
    ts,
  )

  const mapa = new Map<string, string>()
  await Promise.all(
    nombresLib.map(async (nombre) => {
      try {
        mapa.set('/' + nombre, await cargarLib(nombre))
      } catch {
        // knownLibFilesForCompilerOptions devuelve nombres históricos que ya
        // no existen en esta versión de TypeScript (documentado por la
        // propia librería) - se ignora igual que hace createDefaultMapFromCDN
        // internamente, el fichero simplemente no estará disponible.
      }
    }),
  )
  mapa.set(NOMBRE_ARCHIVO, MARCADOR_VACIO)

  const sistema = vfs.createSystem(mapa)
  const entorno = vfs.createVirtualTypeScriptEnvironment(sistema, [NOMBRE_ARCHIVO], ts, opciones)
  return { ts, entorno }
}

export function compilarEnEntorno(
  entornoTs: EntornoTypeScript,
  codigo: string,
): ResultadoCompilacionTs {
  const { ts, entorno } = entornoTs

  if (codigo.trim() === '') {
    entorno.updateFile(NOMBRE_ARCHIVO, MARCADOR_VACIO)
    return { js: '', diagnosticos: [] }
  }

  entorno.updateFile(NOMBRE_ARCHIVO, codigo)
  const diagnosticosRaw = [
    ...entorno.languageService.getSyntacticDiagnostics(NOMBRE_ARCHIVO),
    ...entorno.languageService.getSemanticDiagnostics(NOMBRE_ARCHIVO),
  ]
  const diagnosticos = diagnosticosRaw.map((diagnostico) => mapearDiagnostico(diagnostico, ts))
  const hayErrores = diagnosticosRaw.some((d) => d.category === ts.DiagnosticCategory.Error)

  let js = ''
  if (!hayErrores) {
    const salida = entorno.languageService.getEmitOutput(NOMBRE_ARCHIVO)
    js = salida.outputFiles[0]?.text ?? ''
  }

  return { js, diagnosticos }
}

function mapearDiagnostico(
  diagnostico: import('typescript-en-vivo').Diagnostic,
  ts: typeof import('typescript-en-vivo'),
): DiagnosticoTs {
  const mensaje = ts.flattenDiagnosticMessageText(diagnostico.messageText, '\n')
  const severidad: DiagnosticoTs['severidad'] =
    diagnostico.category === ts.DiagnosticCategory.Error ? 'error' : 'aviso'

  if (diagnostico.file && diagnostico.start !== undefined) {
    const { line, character } = diagnostico.file.getLineAndCharacterOfPosition(diagnostico.start)
    return { linea: line + 1, columna: character + 1, mensaje, severidad }
  }
  return { linea: 0, columna: 0, mensaje, severidad }
}
```

- [ ] **Step 4: Ejecutar los tests y comprobar que pasan**

Run: `npm run test -- compilar.test.ts`
Expected: PASS (5/5). Nota: este test carga el compilador real y los ~60 ficheros lib desde disco en cada `crearEntornoTypeScript()` — es normal que tarde más que un test unitario típico (varios cientos de ms por caso), no es un fallo.

- [ ] **Step 5: `npm run build`, `lint` y la suite completa en verde**

Run: `npm run build && npm run lint && npm run test`
Expected: los tres en verde (el script `build` ya usa la ruta explícita a `typescript/bin/tsc` desde la Task 2 — sigue compilando con la devDependency `5.9.3` del proyecto, no con `typescript-en-vivo`).

- [ ] **Step 6: Commit**

```bash
git add src/lib/typescript-en-vivo/
git commit -m "feat(typescript-en-vivo): módulo compilar.ts con typescript+@typescript/vfs reales"
```

---

## Task 5: Integrar la pestaña `ts` y el panel de diagnósticos en `EditorEnVivo.tsx`

**Files:**
- Modify: `src/components/bloques-laboratorio/EditorEnVivo.tsx`

**Interfaces:**
- Consumes: `crearEntornoTypeScript`, `compilarEnEntorno`, `DiagnosticoTs`, `EntornoTypeScript` de `@/lib/typescript-en-vivo/compilar` (Task 4); `DatosEditorEnVivo` con el campo `ts` (Task 1).

- [ ] **Step 1: Añadir `ts` como lenguaje disponible**

En `src/components/bloques-laboratorio/EditorEnVivo.tsx:12`, cambiar:

```ts
type Lenguaje = 'html' | 'css' | 'js'
```

por:

```ts
type Lenguaje = 'html' | 'css' | 'js' | 'ts'
```

- [ ] **Step 2: Añadir la entrada de CodeMirror para `ts`**

En las líneas 14-22, añadir una cuarta entrada a `LENGUAJES` (reutiliza `@codemirror/lang-javascript`, que ya soporta modo TypeScript con `{ typescript: true }` — no hace falta ningún paquete nuevo de CodeMirror):

```ts
const LENGUAJES: Array<{
  id: Lenguaje
  etiqueta: string
  extension: ReturnType<typeof lenguajeHtml>
}> = [
  { id: 'html', etiqueta: 'HTML', extension: lenguajeHtml() },
  { id: 'css', etiqueta: 'CSS', extension: lenguajeCss() },
  { id: 'js', etiqueta: 'JavaScript', extension: lenguajeJavascript() },
  { id: 'ts', etiqueta: 'TypeScript', extension: lenguajeJavascript({ typescript: true }) },
]
```

- [ ] **Step 3: Importar el módulo de compilación**

Añadir, junto al resto de imports (tras la línea 10):

```ts
import {
  compilarEnEntorno,
  crearEntornoTypeScript,
  type DiagnosticoTs,
  type EntornoTypeScript,
} from '@/lib/typescript-en-vivo/compilar'
```

- [ ] **Step 4: Extender la firma y el estado de `EditorEnVivo`**

En `export function EditorEnVivo({...}: DatosEditorEnVivo)` (línea 167), añadir `ts` a la desestructuración:

```ts
export function EditorEnVivo({
  titulo = 'Prueba el código y observa el resultado.',
  consigna,
  html: htmlOriginal,
  css: cssOriginal,
  js: jsOriginal,
  ts: tsOriginal,
  pestañaInicial,
}: DatosEditorEnVivo) {
  const originales = useMemo(
    () => ({ html: htmlOriginal, css: cssOriginal, js: jsOriginal, ts: tsOriginal }),
    [cssOriginal, htmlOriginal, jsOriginal, tsOriginal],
  )
```

Justo después de `const [srcDoc, setSrcDoc] = useState(...)` (línea 190), añadir el estado del compilador de TypeScript:

```ts
  const usaTypeScript = lenguajesDisponibles.some(({ id }) => id === 'ts')
  const [estadoCompiladorTs, setEstadoCompiladorTs] = useState<'cargando' | 'listo' | 'error'>(
    'cargando',
  )
  const [diagnosticosTs, setDiagnosticosTs] = useState<DiagnosticoTs[]>([])
  const entornoTsRef = useRef<EntornoTypeScript | null>(null)

  useEffect(() => {
    if (!usaTypeScript) return
    let cancelado = false
    crearEntornoTypeScript()
      .then((entorno) => {
        if (cancelado) return
        entornoTsRef.current = entorno
        setEstadoCompiladorTs('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoCompiladorTs('error')
      })
    return () => {
      cancelado = true
    }
  }, [usaTypeScript])
```

(`useRef` ya está importado en la línea 6 — `useEffect, useMemo, useRef, useState` — no hace falta añadir nada al import de React.)

- [ ] **Step 5: Reescribir el efecto de reconstrucción del `srcDoc`**

Reemplazar el efecto de las líneas 192-198:

```ts
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      setSrcDoc(construirDocumento(codigo.html, codigo.css, codigo.js))
    }, 200)

    return () => window.clearTimeout(temporizador)
  }, [codigo])
```

por:

```ts
  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      if (!usaTypeScript) {
        setSrcDoc(construirDocumento(codigo.html, codigo.css, codigo.js))
        return
      }
      // Con ts presente, su JS compilado sustituye a codigo.js por completo
      // (los dos campos no están pensados para combinarse en un mismo bloque).
      if (estadoCompiladorTs !== 'listo' || !entornoTsRef.current) return
      const { js, diagnosticos } = compilarEnEntorno(entornoTsRef.current, codigo.ts)
      setDiagnosticosTs(diagnosticos)
      const hayErrores = diagnosticos.some((d) => d.severidad === 'error')
      if (!hayErrores) {
        setSrcDoc(construirDocumento(codigo.html, codigo.css, js))
      }
      // Si hay errores, no se toca srcDoc: la vista previa se queda en el
      // último resultado válido en vez de mostrar un iframe roto.
    }, 200)

    return () => window.clearTimeout(temporizador)
  }, [codigo, usaTypeScript, estadoCompiladorTs])
```

- [ ] **Step 6: Añadir el subcomponente del panel de diagnósticos**

Justo antes de `export function EditorEnVivo(...)` (línea 167), añadir:

```tsx
function PanelDiagnosticosTs({
  estado,
  diagnosticos,
}: {
  estado: 'cargando' | 'listo' | 'error'
  diagnosticos: DiagnosticoTs[]
}) {
  if (estado === 'cargando') {
    return <p className="text-sm text-muted-foreground">Cargando el compilador de TypeScript…</p>
  }
  if (estado === 'error') {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        No se pudo cargar el compilador de TypeScript. Recarga la página para intentarlo de nuevo.
      </p>
    )
  }
  if (diagnosticos.length === 0) {
    return <p className="text-sm text-green-600 dark:text-green-400">Sin errores de tipos.</p>
  }
  return (
    <ul className="space-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
      {diagnosticos.map((diagnostico, indice) => (
        <li
          key={indice}
          className={
            diagnostico.severidad === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-amber-600 dark:text-amber-400'
          }
        >
          <span className="font-mono text-xs">
            {diagnostico.linea}:{diagnostico.columna}
          </span>{' '}
          {diagnostico.mensaje}
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 7: Renderizar el panel bajo el editor cuando la pestaña activa es `ts`**

En el JSX, justo después del bloque `{lenguajeActivo && (<EditorCodigo ... />)}` (tras la línea 276), añadir:

```tsx
          {usaTypeScript && pestanaActiva === 'ts' && (
            <PanelDiagnosticosTs estado={estadoCompiladorTs} diagnosticos={diagnosticosTs} />
          )}
```

- [ ] **Step 8: Verificación manual con el servidor de desarrollo**

Run: `npm run dev`

En el navegador, en `/admin/referencia-contenido` (o cualquier ruta que renderice un bloque `editor-en-vivo` de prueba con el campo `ts` relleno), comprobar a mano:
1. La pestaña "TypeScript" aparece y tiene resaltado de sintaxis de TypeScript.
2. Escribir `const x: number = "hola";` → aparece "Cargando el compilador de TypeScript…" brevemente, luego el panel muestra el error real de tipos, la vista previa no se actualiza.
3. Corregir a `const x: number = 5;` → el panel pasa a "Sin errores de tipos.", la vista previa se actualiza.
4. Vaciar el editor por completo → no hay ninguna excepción en la consola del navegador (el `try/catch` de `compilarEnEntorno` para código vacío ya está cubierto por los tests de la Task 4, esto es solo para confirmarlo también de extremo a extremo).

- [ ] **Step 9: `npm run build`, `lint` y la suite completa en verde**

Run: `npm run build && npm run lint && npm run test`
Expected: los tres en verde.

- [ ] **Step 10: Commit**

```bash
git add src/components/bloques-laboratorio/EditorEnVivo.tsx
git commit -m "feat(editor-en-vivo): pestaña ts con compilación TypeScript real y panel de diagnósticos"
```

---

## Task 6: Verificación final (Claude — visual y de seguridad)

Codex no puede ejecutar esta tarea: su sandbox no tiene acceso a red/Chromium para Playwright (ver memoria del proyecto). La ejecuta Claude.

**Files:** ninguno nuevo — solo verificación.

- [ ] **Step 1: Verificación visual con Playwright**

Levantar `npm run dev`, navegar (con una lección de prueba que tenga un bloque `editor-en-vivo` con `ts` relleno — se puede crear temporalmente vía `/admin/referencia-contenido` si existe una entrada de referencia para este bloque, o editar temporalmente una lección de borrador) y comprobar con capturas:
1. Pestaña "TypeScript" visible junto a las demás, con resaltado de sintaxis correcto.
2. Estado "cargando compilador" se ve brevemente al entrar.
3. Un error de tipos real se refleja en el panel (mensaje + línea:columna) y la vista previa no se rompe.
4. Al corregir el error, el panel pasa a "Sin errores de tipos." y la vista previa se actualiza con el resultado.
5. Repetir en modo oscuro (comprobar que los colores rojo/ámbar/verde mantienen contraste suficiente).

- [ ] **Step 2: Spot-check de seguridad**

Confirmar, releyendo el diff completo de las Tasks 1, 4 y 5:
- `typescript-en-vivo`/`@typescript/vfs` son exactamente los paquetes oficiales (Microsoft / `microsoft/TypeScript-Website`), sin typosquatting.
- El iframe de la vista previa sigue siendo `sandbox="allow-scripts"` sin `allow-same-origin` — sin cambios.
- Ningún dato del bloque llega a `eval`/`new Function`/`dangerouslySetInnerHTML` — el compilador corre en el hilo principal (como CodeMirror), y lo único que llega al iframe es texto JS ya emitido, igual que hoy.
- Sin RLS nueva — no aplica ninguna migración en esta feature.

- [ ] **Step 3: Actualizar `specs/features/typescript-compilacion-en-vivo.md`**

Marcar como `[x]` los items ya completados del checklist de implementación (esquema, dependencias, `public/ts-libs/`, `compilar.ts`, `EditorEnVivo.tsx`, verificación) y actualizar el **Estado** del encabezado a `🚧 en curso — mecanismo implementado, temario de contenido pendiente` (el temario/lecciones se ejecutan después, fuera de este plan).

- [ ] **Step 4: Actualizar `specs/features/README.md`**

Cambiar el estado de la fila de TypeScript de `⏳ pendiente` a `🚧 en curso — mecanismo implementado, temario pendiente`.

- [ ] **Step 5: Commit**

```bash
git add specs/features/typescript-compilacion-en-vivo.md specs/features/README.md
git commit -m "docs(specs): marcar como implementado el mecanismo de compilación TypeScript en vivo"
```
