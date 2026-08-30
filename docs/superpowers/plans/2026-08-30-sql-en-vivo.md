# SQL en vivo (sql.js/WASM) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dos bloques laboratorio nuevos (`sql-anotado`, `sql-en-vivo`) que ejecutan consultas SQL reales contra SQLite compilado a WebAssembly (`sql.js`), en el navegador, sin servidor — con verificación de resultado opcional en el bloque editable.

**Architecture:** `sql.js` se carga con `import()` dinámico + su `.wasm` servido como estático desde `public/`, mismo patrón que `typescript-en-vivo`. Un módulo aislado (`src/lib/sql-en-vivo/motor.ts`) encapsula el ciclo de vida de la base de datos: cada ejecución de consulta recrea una `Database` nueva desde el `esquemaSql` del bloque, la usa, y la cierra — nunca hay una `Database` compartida entre ejecuciones, así un `UPDATE`/`DELETE` de un intento no contamina el siguiente. Un tokenizador nuevo (`sql`) se añade al resaltador de sintaxis propio ya existente para el bloque de solo lectura; el bloque editable usa CodeMirror (`@codemirror/lang-sql`) como el resto de editores en vivo del proyecto.

**Tech Stack:** React 19, TypeScript, Zod, CodeMirror 6, Vite, Vitest, `sql.js@1.14.2`, `@types/sql.js@1.4.11`, `@codemirror/lang-sql@6.10.0`.

**Spec:** [specs/features/sql-en-vivo.md](../../../specs/features/sql-en-vivo.md)

**Out of scope de este plan** (explícito en la spec, se ejecuta después sin plan formal): crear la categoría "Bases de datos" y la tecnología "SQL" vía admin, escribir `contenido/sql/TEMARIO.md` y las lecciones.

## Global Constraints

- `sql.js@1.14.2` exacto (no `^`) — verificado empíricamente antes de este plan: bundla SQLite 3.49.1, soporta JOIN/GROUP BY/CTE(`WITH`)/funciones de ventana/transacciones, y da errores reales (`no such table: x`). MIT, cero dependencias runtime.
- `@types/sql.js@1.4.11` exacto, como devDependency — `sql.js` no trae sus propios tipos.
- `@codemirror/lang-sql@6.10.0` exacto — oficial del equipo de CodeMirror, misma major 6.x que `@codemirror/lang-css`/`lang-html`/`lang-javascript` ya instalados.
- Import de `sql.js` verificado empíricamente con `tsc --strict`: `import initSqlJs from 'sql.js'` + `import type { Database, QueryExecResult, SqlValue } from 'sql.js'` (el paquete usa `export =`, esos tres tipos se importan como named imports directamente, no hace falta `import initSqlJs = require(...)`).
- **Nada de CDN en runtime**: `sql-wasm.wasm` se genera una vez con un script y se comitea en `public/sql-wasm.wasm` (primer binario comiteado del repo — 658 KB).
- **Cada ejecución de consulta recrea la base de datos desde `esquemaSql`** — nunca una `Database` compartida entre la consulta del alumno y la de verificación, ni entre dos pulsaciones seguidas (ver Architecture arriba). Esto vive en `motor.ts`, ninguna otra capa debe crear una `Database` directamente.
- **Los valores de resultado se renderizan como hijos de JSX (texto), nunca `dangerouslySetInnerHTML`** — el alumno controla el contenido de las celdas a través de literales de cadena en su propia consulta (`SELECT '<img src=x onerror=...>' AS x` es SQL válido). Checkpoint de seguridad real de la spec.
- Identificadores y comentarios en español, siguiendo la convención ya establecida en `src/lib/laboratorio`/`src/components/bloques-laboratorio`/`src/components/codigo`.
- Todo el código nuevo que constituye lógica (esquemas Zod, `motor.ts`, `tokenizarSql`) se escribe con TDD: test que falla → implementación → test en verde.
- `sql-en-vivo` limpia la tabla de resultado en error (no conserva el último resultado válido) — diverge a propósito del patrón de `editor-en-vivo`/TypeScript, que sí lo conserva. La razón (un ejercicio de SQL es de intento único, no un demo continuo) debe quedar como comentario en el código, no solo en este plan.

---

## Task 1: Esquema Zod — `esquemaSqlAnotado` y `esquemaSqlEnVivo`

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts:203-238`
- Test: Modify `src/lib/laboratorio/schemas.test.ts`

**Interfaces:**
- Produces: `esquemaSqlAnotado`, `esquemaSqlEnVivo` (exportados), `DatosSqlAnotado`, `DatosSqlEnVivo` (tipos inferidos), y ambos añadidos a `esquemaBloqueLaboratorio` — de esto dependen todas las tareas siguientes (Task 6, 7, 8 tipan sus props contra `DatosSqlAnotado`/`DatosSqlEnVivo`).

- [ ] **Step 1: Escribir los tests que fallan**

Añadir al final de `src/lib/laboratorio/schemas.test.ts` (después del `describe('esquemaEditorEnVivo', ...)` ya existente):

```ts
import { esquemaSqlAnotado, esquemaSqlEnVivo } from './schemas'

describe('esquemaSqlAnotado', () => {
  const base = {
    tipo: 'sql-anotado' as const,
    esquemaSql: "CREATE TABLE t (id INTEGER PRIMARY KEY, nombre TEXT); INSERT INTO t VALUES (1, 'Ana');",
    consulta: 'SELECT nombre FROM t',
    anotaciones: [{ fragmento: 'SELECT nombre', nota: 'Selecciona solo la columna nombre.' }],
  }

  it('acepta un bloque válido con los campos mínimos', () => {
    const resultado = esquemaSqlAnotado.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.esquemaSql).toBe(base.esquemaSql)
      expect(resultado.data.consulta).toBe(base.consulta)
      expect(resultado.data.anotaciones).toHaveLength(1)
    }
  })

  it('acepta titulo opcional', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, titulo: 'Un título' })

    expect(resultado.success).toBe(true)
  })

  it('rechaza un bloque sin esquemaSql', () => {
    const { esquemaSql: _esquemaSql, ...sinEsquema } = base
    const resultado = esquemaSqlAnotado.safeParse(sinEsquema)

    expect(resultado.success).toBe(false)
  })

  it('rechaza un bloque sin ninguna anotación', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, anotaciones: [] })

    expect(resultado.success).toBe(false)
  })

  it('rechaza más de 8 anotaciones', () => {
    const anotaciones = Array.from({ length: 9 }, (_, i) => ({
      fragmento: `frag${i}`,
      nota: `nota ${i}`,
    }))
    const resultado = esquemaSqlAnotado.safeParse({ ...base, anotaciones })

    expect(resultado.success).toBe(false)
  })

  it('rechaza esquemaSql de más de 3000 caracteres', () => {
    const resultado = esquemaSqlAnotado.safeParse({ ...base, esquemaSql: 'a'.repeat(3001) })

    expect(resultado.success).toBe(false)
  })
})

describe('esquemaSqlEnVivo', () => {
  const base = {
    tipo: 'sql-en-vivo' as const,
    esquemaSql: "CREATE TABLE t (id INTEGER PRIMARY KEY, nombre TEXT); INSERT INTO t VALUES (1, 'Ana');",
  }

  it('acepta un bloque puramente exploratorio (sin consultaSolucion)', () => {
    const resultado = esquemaSqlEnVivo.safeParse(base)

    expect(resultado.success).toBe(true)
    if (resultado.success) {
      expect(resultado.data.consultaInicial).toBe('')
      expect(resultado.data.consultaSolucion).toBeUndefined()
    }
  })

  it('acepta un bloque de ejercicio con consultaSolucion y consigna', () => {
    const resultado = esquemaSqlEnVivo.safeParse({
      ...base,
      consigna: 'Muestra el nombre de todos.',
      consultaInicial: '',
      consultaSolucion: 'SELECT nombre FROM t',
    })

    expect(resultado.success).toBe(true)
  })

  it('rechaza un bloque sin esquemaSql', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ tipo: 'sql-en-vivo' })

    expect(resultado.success).toBe(false)
  })

  it('rechaza consultaSolucion de más de 1500 caracteres', () => {
    const resultado = esquemaSqlEnVivo.safeParse({ ...base, consultaSolucion: 'a'.repeat(1501) })

    expect(resultado.success).toBe(false)
  })
})

describe('esquemaBloqueLaboratorio con los tipos de SQL', () => {
  it('discrimina sql-anotado y sql-en-vivo dentro de la unión', () => {
    const anotado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'sql-anotado',
      esquemaSql: 'CREATE TABLE t (id INTEGER);',
      consulta: 'SELECT * FROM t',
      anotaciones: [{ fragmento: 'SELECT', nota: 'nota' }],
    })
    const enVivo = esquemaBloqueLaboratorio.safeParse({
      tipo: 'sql-en-vivo',
      esquemaSql: 'CREATE TABLE t (id INTEGER);',
    })

    expect(anotado.success).toBe(true)
    expect(enVivo.success).toBe(true)
  })
})
```

Y añadir `esquemaBloqueLaboratorio` al import ya existente de `'./schemas'` en la primera línea del fichero.

- [ ] **Step 2: Ejecutar los tests y comprobar que fallan**

Run: `npm run test -- schemas.test.ts`
Expected: FAIL — `esquemaSqlAnotado`/`esquemaSqlEnVivo` no existen todavía.

- [ ] **Step 3: Implementar los dos esquemas nuevos**

En `src/lib/laboratorio/schemas.ts`, justo antes de la línea `export const esquemaBloqueLaboratorio = z.discriminatedUnion(...)` (línea 203), añadir:

```ts
// Ejecutan de verdad la consulta contra sql.js (motor real, WASM) — nunca
// muestran un resultado tecleado a mano. Ver specs/features/sql-en-vivo.md.
export const esquemaSqlAnotado = z.object({
  tipo: z.literal('sql-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  esquemaSql: z.string().min(1).max(3000),
  consulta: z.string().min(1).max(1500),
  anotaciones: z
    .array(
      z.object({
        fragmento: z.string().min(1),
        nota: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(8),
})

// consultaSolucion es opcional: si falta, el bloque es puramente
// exploratorio (se ejecuta y se muestra el resultado real, sin ✅/❌).
export const esquemaSqlEnVivo = z.object({
  tipo: z.literal('sql-en-vivo'),
  consigna: z.string().min(1).max(600).optional(),
  esquemaSql: z.string().min(1).max(3000),
  consultaInicial: z.string().max(1500).default(''),
  consultaSolucion: z.string().max(1500).optional(),
})
```

Después, reemplazar el bloque `esquemaBloqueLaboratorio` (líneas 203-219 originales) por:

```ts
export const esquemaBloqueLaboratorio = z.discriminatedUnion('tipo', [
  esquemaPrediceElResultado,
  esquemaCodigoAnotado,
  esquemaComparadorAntesDespues,
  esquemaNotasClave,
  esquemaDiagramaEtiqueta,
  esquemaCallout,
  esquemaLineaDeTiempo,
  esquemaRoles,
  esquemaRecursos,
  esquemaMitos,
  esquemaVistaPreviaSocial,
  esquemaMapaDeRegiones,
  esquemaEsquemaDePagina,
  esquemaCapasDeCaja,
  esquemaEditorEnVivo,
  esquemaSqlAnotado,
  esquemaSqlEnVivo,
])
```

Finalmente, añadir al final del fichero (después de `export type DatosEditorEnVivo = ...`, antes de `export type DatosBloqueLaboratorio = ...`):

```ts
export type DatosSqlAnotado = z.infer<typeof esquemaSqlAnotado>
export type DatosSqlEnVivo = z.infer<typeof esquemaSqlEnVivo>
```

- [ ] **Step 4: Ejecutar los tests y comprobar que pasan**

Run: `npm run test -- schemas.test.ts`
Expected: PASS (todos, incluidos los 4 ya existentes de `esquemaEditorEnVivo`).

- [ ] **Step 5: Comprobar que el resto de la suite sigue en verde**

Run: `npm run test`
Expected: PASS — ningún test existente depende del tamaño de la unión discriminada.

- [ ] **Step 6: Commit**

```bash
git add src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts
git commit -m "feat(laboratorio): esquemas sql-anotado y sql-en-vivo"
```

---

## Task 2: Instalar `sql.js`, `@types/sql.js` y `@codemirror/lang-sql`

Esta tarea la ejecuta Claude directamente (requiere red — el sandbox de Codex no la tiene).

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `node_modules/sql.js` (con `dist/sql-wasm.wasm` dentro, usado por la Task 3), `node_modules/@types/sql.js` (tipos, usados por la Task 4), `node_modules/@codemirror/lang-sql` (usado por la Task 8).

- [ ] **Step 1: Instalar las tres dependencias con versión exacta**

Run:
```bash
npm install --save-exact sql.js@1.14.2
npm install --save-exact @codemirror/lang-sql@6.10.0
npm install --save-exact --save-dev @types/sql.js@1.4.11
```

Expected: `package.json` gana, bajo `"dependencies"`, `"sql.js": "1.14.2"` y `"@codemirror/lang-sql": "6.10.0"`; bajo `"devDependencies"`, `"@types/sql.js": "1.4.11"`.

- [ ] **Step 2: Verificar que el binario wasm existe realmente en el paquete instalado**

Run: `ls -la node_modules/sql.js/dist/sql-wasm.wasm node_modules/sql.js/dist/sql-wasm.js`
Expected: dos ficheros, el `.wasm` de aproximadamente 658 KB.

- [ ] **Step 3: Verificar que el build y los tests del proyecto no se rompen con la instalación**

Run: `npm run build && npm run test`
Expected: ambos en verde — todavía no hay código nuevo que use estas dependencias, este paso solo descarta un conflicto de instalación.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: instalar sql.js, @types/sql.js y @codemirror/lang-sql"
```

---

## Task 3: Generar `public/sql-wasm.wasm` (sin CDN en runtime)

**Files:**
- Create: `scripts/dev/generar-sql-wasm.mjs`
- Modify: `package.json` (nuevo script npm)
- Create (generado, se comitea): `public/sql-wasm.wasm`

**Interfaces:**
- Consumes: `node_modules/sql.js/dist/sql-wasm.wasm` (Task 2).
- Produces: `public/sql-wasm.wasm`, servido como estático por Vite en `/sql-wasm.wasm` — de esto depende la Task 4 (`crearMotorSql` por defecto hace `fetch('/sql-wasm.wasm')`).

- [ ] **Step 1: Escribir el script**

Crear `scripts/dev/generar-sql-wasm.mjs`:

```js
// Copia public/sql-wasm.wasm desde node_modules/sql.js/dist/ - el binario
// que src/lib/sql-en-vivo/motor.ts carga en el navegador (fetch('/sql-wasm.wasm'))
// sin depender de ningún CDN en producción. Se ejecuta una vez (o cada vez
// que cambie la versión de sql.js en package.json) y el resultado se
// comitea - no se regenera en cada build.
//
// Uso: npm run generar-sql-wasm

import { createRequire } from 'node:module'
import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
// A diferencia de typescript-en-vivo (generar-ts-libs.mjs), sql.js declara
// un "exports" cerrado en su package.json que NO expone el subpath
// "./package.json" - require.resolve('sql.js/package.json') falla con
// ERR_PACKAGE_PATH_NOT_EXPORTED (encontrado ejecutando esto de verdad, no
// una suposición). Sí expone "./dist/*", así que se resuelve el propio
// .wasm directamente, sin pasar por la carpeta del paquete.
const origen = require.resolve('sql.js/dist/sql-wasm.wasm')
const directorioDestino = join(process.cwd(), 'public')
const destino = join(directorioDestino, 'sql-wasm.wasm')

mkdirSync(directorioDestino, { recursive: true })
copyFileSync(origen, destino)

console.log(`generar-sql-wasm: copiado ${origen} -> ${destino}`)
```

- [ ] **Step 2: Añadir el script npm**

En `package.json`, dentro de `"scripts"`, justo después de `"generar-ts-libs": "node scripts/dev/generar-ts-libs.mjs",`:

```json
"generar-sql-wasm": "node scripts/dev/generar-sql-wasm.mjs",
```

- [ ] **Step 3: Ejecutarlo y comprobar el resultado**

Run: `npm run generar-sql-wasm`
Expected: imprime `generar-sql-wasm: copiado .../node_modules/sql.js/dist/sql-wasm.wasm -> .../public/sql-wasm.wasm`.

Run: `ls -la public/sql-wasm.wasm`
Expected: existe, tamaño ≈ 658 KB.

- [ ] **Step 4: Commit**

```bash
git add scripts/dev/generar-sql-wasm.mjs package.json public/sql-wasm.wasm
git commit -m "feat(sql-en-vivo): generar public/sql-wasm.wasm desde sql.js"
```

---

## Task 4: Módulo `motor.ts` (ejecución real contra sql.js, sin mocks)

**Files:**
- Create: `src/lib/sql-en-vivo/motor.ts`
- Test: Create `src/lib/sql-en-vivo/motor.test.ts`

**Interfaces:**
- Consumes: `public/sql-wasm.wasm` (Task 3) — en tests, se lee del disco directamente (mismo patrón que `compilar.test.ts`/`cargarLibDesdeDisco`), no vía `fetch`.
- Produces:
  - `type ResultadoConsulta = { ok: true; columns: string[]; values: SqlValue[][] } | { ok: false; mensaje: string }`
  - `interface MotorSql` (opaco — lo único que le importa a quien lo consume es pasarlo tal cual a `ejecutarConsulta`)
  - `crearMotorSql(cargarWasm?: () => Promise<ArrayBuffer>): Promise<MotorSql>`
  - `ejecutarConsulta(motor: MotorSql, esquemaSql: string, consulta: string): ResultadoConsulta`
  - `compararResultados(a: ResultadoConsulta, b: ResultadoConsulta): boolean`
  - Usados por la Task 7 (`SqlAnotado.tsx`) y la Task 8 (`SqlEnVivo.tsx`).

**Nota de diseño (ya validada empíricamente en el prototipo de la spec, no una suposición):** `db.exec(consulta)` en `sql.js` devuelve un array de `QueryExecResult` (uno por cada sentencia con resultado) — para una única consulta `SELECT` siempre es como mucho un elemento; si la consulta no devuelve filas (por ejemplo un `UPDATE`), el array viene vacío, no `undefined`.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/lib/sql-en-vivo/motor.test.ts`:

```ts
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { compararResultados, crearMotorSql, ejecutarConsulta } from './motor'

async function cargarWasmDesdeDisco(): Promise<ArrayBuffer> {
  const buffer = await readFile(join(process.cwd(), 'public', 'sql-wasm.wasm'))
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

const ESQUEMA = `
  CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);
  CREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER, salario REAL);
  INSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas');
  INSERT INTO empleados VALUES (1, 'Ana', 1, 55000), (2, 'Luis', 1, 62000), (3, 'Marta', 2, 48000);
`

describe('ejecutarConsulta', () => {
  it('ejecuta un SELECT simple y devuelve columnas y filas reales', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(motor, ESQUEMA, 'SELECT nombre FROM empleados ORDER BY nombre')

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual(['nombre'])
      expect(resultado.values).toEqual([['Ana'], ['Luis'], ['Marta']])
    }
  })

  it('ejecuta JOIN + GROUP BY + agregación', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(
      motor,
      ESQUEMA,
      `SELECT d.nombre, COUNT(*) AS n FROM empleados e JOIN departamentos d ON d.id = e.departamento_id GROUP BY d.nombre ORDER BY d.nombre`,
    )

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual(['nombre', 'n'])
      expect(resultado.values).toEqual([['Ingeniería', 2], ['Ventas', 1]])
    }
  })

  it('ejecuta una CTE (WITH)', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(
      motor,
      ESQUEMA,
      `WITH altos AS (SELECT nombre FROM empleados WHERE salario > 50000) SELECT nombre FROM altos ORDER BY nombre`,
    )

    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([['Ana'], ['Luis']])
  })

  it('devuelve un error real de SQLite en vez de reventar', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(motor, ESQUEMA, 'SELECT * FROM tabla_falsa')

    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.mensaje).toContain('no such table')
  })

  it('un UPDATE en una ejecución no afecta a la siguiente (cada ejecución recrea la base de datos)', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    ejecutarConsulta(motor, ESQUEMA, "UPDATE empleados SET salario = 0 WHERE nombre = 'Ana'")
    const resultado = ejecutarConsulta(motor, ESQUEMA, "SELECT salario FROM empleados WHERE nombre = 'Ana'")

    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([[55000]])
  })

  it('devuelve un array de filas vacío (no undefined) para una consulta sin resultado', async () => {
    const motor = await crearMotorSql(cargarWasmDesdeDisco)
    const resultado = ejecutarConsulta(motor, ESQUEMA, "UPDATE empleados SET salario = salario")

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual([])
      expect(resultado.values).toEqual([])
    }
  })
})

describe('compararResultados', () => {
  it('son iguales si coinciden columnas y filas, en cualquier orden de filas', () => {
    const a = { ok: true as const, columns: ['nombre', 'salario'], values: [['Ana', 55000], ['Luis', 62000]] }
    const b = { ok: true as const, columns: ['nombre', 'salario'], values: [['Luis', 62000], ['Ana', 55000]] }

    expect(compararResultados(a, b)).toBe(true)
  })

  it('son distintos si difieren los nombres de columna', () => {
    const a = { ok: true as const, columns: ['nombre'], values: [['Ana']] }
    const b = { ok: true as const, columns: ['nombre_completo'], values: [['Ana']] }

    expect(compararResultados(a, b)).toBe(false)
  })

  it('son distintos si difiere el orden de las columnas', () => {
    const a = { ok: true as const, columns: ['nombre', 'salario'], values: [['Ana', 55000]] }
    const b = { ok: true as const, columns: ['salario', 'nombre'], values: [[55000, 'Ana']] }

    expect(compararResultados(a, b)).toBe(false)
  })

  it('son distintos si difiere el número de filas', () => {
    const a = { ok: true as const, columns: ['nombre'], values: [['Ana'], ['Luis']] }
    const b = { ok: true as const, columns: ['nombre'], values: [['Ana']] }

    expect(compararResultados(a, b)).toBe(false)
  })

  it('cualquier resultado con error nunca coincide', () => {
    const ok = { ok: true as const, columns: ['nombre'], values: [['Ana']] }
    const error = { ok: false as const, mensaje: 'no such table: x' }

    expect(compararResultados(ok, error)).toBe(false)
    expect(compararResultados(error, ok)).toBe(false)
    expect(compararResultados(error, error)).toBe(false)
  })
})
```

- [ ] **Step 2: Ejecutar los tests y comprobar que fallan**

Run: `npm run test -- motor.test.ts`
Expected: FAIL — `./motor` no existe todavía.

- [ ] **Step 3: Implementar `motor.ts`**

Crear `src/lib/sql-en-vivo/motor.ts`:

```ts
// Motor de ejecución real de SQL en el navegador, vía sql.js (SQLite
// compilado a WebAssembly). Se carga con import() dinámico: solo se
// descarga cuando una lección tiene un bloque sql-anotado o sql-en-vivo,
// nunca en el resto de páginas. Ver specs/features/sql-en-vivo.md.
//
// Cada llamada a ejecutarConsulta recrea la base de datos desde cero a
// partir de esquemaSql — nunca hay una Database compartida entre dos
// ejecuciones. Esto es deliberado: un UPDATE/DELETE en un intento del
// alumno no debe contaminar el siguiente intento, ni la comparación con
// la consulta solución.
import type { Database, QueryExecResult, SqlValue } from 'sql.js'

export interface ResultadoConsultaOk {
  ok: true
  columns: string[]
  values: SqlValue[][]
}

export interface ResultadoConsultaError {
  ok: false
  mensaje: string
}

export type ResultadoConsulta = ResultadoConsultaOk | ResultadoConsultaError

export interface MotorSql {
  DatabaseCtor: typeof Database
}

async function cargarWasmPorFetch(): Promise<ArrayBuffer> {
  const respuesta = await fetch('/sql-wasm.wasm')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar sql-wasm.wasm (${respuesta.status})`)
  }
  return respuesta.arrayBuffer()
}

export async function crearMotorSql(
  cargarWasm: () => Promise<ArrayBuffer> = cargarWasmPorFetch,
): Promise<MotorSql> {
  const [{ default: initSqlJs }, wasmBinary] = await Promise.all([
    import('sql.js'),
    cargarWasm(),
  ])
  const SQL = await initSqlJs({ wasmBinary })
  return { DatabaseCtor: SQL.Database }
}

export function ejecutarConsulta(
  motor: MotorSql,
  esquemaSql: string,
  consulta: string,
): ResultadoConsulta {
  const db = new motor.DatabaseCtor()
  try {
    db.run(esquemaSql)
    const filas: QueryExecResult[] = db.exec(consulta)
    if (filas.length === 0) return { ok: true, columns: [], values: [] }
    return { ok: true, columns: filas[0].columns, values: filas[0].values }
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : String(error) }
  } finally {
    db.close()
  }
}

export function compararResultados(a: ResultadoConsulta, b: ResultadoConsulta): boolean {
  if (!a.ok || !b.ok) return false
  if (a.columns.length !== b.columns.length) return false
  for (let i = 0; i < a.columns.length; i++) {
    if (a.columns[i] !== b.columns[i]) return false
  }

  const normalizar = (filas: SqlValue[][]) => filas.map((fila) => JSON.stringify(fila)).sort()
  const filasA = normalizar(a.values)
  const filasB = normalizar(b.values)
  if (filasA.length !== filasB.length) return false
  return filasA.every((fila, i) => fila === filasB[i])
}
```

- [ ] **Step 4: Ejecutar los tests y comprobar que pasan**

Run: `npm run test -- motor.test.ts`
Expected: PASS (11/11 — 6 en `describe('ejecutarConsulta', ...)` + 5 en `describe('compararResultados', ...)`; la primera versión de este plan decía "12/12" por un error de conteo, corregido tras la implementación real). Nota: cada `ejecutarConsulta` crea y destruye una `Database` de sql.js real — es normal que tarde algo más que un test unitario típico, no es un fallo.

- [ ] **Step 5: `npm run build`, `lint` y la suite completa en verde**

Run: `npm run build && npm run lint && npm run test`
Expected: los tres en verde.

- [ ] **Step 6: Commit**

```bash
git add src/lib/sql-en-vivo/
git commit -m "feat(sql-en-vivo): módulo motor.ts con sql.js real (sin mocks)"
```

---

## Task 5: Nuevo caso `sql` en el tokenizador (`resaltador.ts`)

**Files:**
- Modify: `src/components/codigo/resaltador.ts`
- Test: Modify `src/components/codigo/resaltador.test.ts`

**Interfaces:**
- Produces: `Lenguaje` gana `'sql'`; `tokenizar(codigo, 'sql')`/`tokenizarLineas(codigo, 'sql')` tokenizan SQL real. Usado por la Task 7 (`SqlAnotado.tsx`, vía `CodigoResaltado lenguaje="sql"`).

- [ ] **Step 1: Escribir los tests que fallan**

Añadir a `src/components/codigo/resaltador.test.ts`, dentro del `describe('tokenizar CSS y JavaScript', ...)` — en realidad como un `describe` nuevo, justo después de ese bloque (tras la línea 98):

```ts
describe('tokenizar SQL', () => {
  it('separa palabras clave, identificadores, cadenas, números y puntuación', () => {
    const tokens = tokenizar("SELECT nombre, salario FROM empleados WHERE id = 1", 'sql')

    // Incluye los espacios: 'texto' está en la lista de tipos pedidos, y los
    // espacios entre palabras se tokenizan como 'texto' (verificado
    // ejecutando el tokenizador real antes de escribir este test, no
    // asumido por analogía con el test de HTML).
    expect(tiposYTextos(tokens, ['palabraClave', 'texto', 'numero', 'puntuacion'])).toEqual([
      ['palabraClave', 'SELECT'],
      ['texto', ' '],
      ['texto', 'nombre'],
      ['puntuacion', ','],
      ['texto', ' '],
      ['texto', 'salario'],
      ['texto', ' '],
      ['palabraClave', 'FROM'],
      ['texto', ' '],
      ['texto', 'empleados'],
      ['texto', ' '],
      ['palabraClave', 'WHERE'],
      ['texto', ' '],
      ['texto', 'id'],
      ['texto', ' '],
      ['puntuacion', '='],
      ['texto', ' '],
      ['numero', '1'],
    ])
  })

  it('reconoce palabras clave en minúsculas igual que en mayúsculas', () => {
    const tokens = tokenizar('select nombre from empleados', 'sql')

    expect(tokens.filter((t) => t.tipo === 'palabraClave').map((t) => t.texto)).toEqual([
      'select',
      'from',
    ])
  })

  it('reconoce cadenas con \'\' como escape de comilla simple', () => {
    const tokens = tokenizar("SELECT 'no lo hagas' FROM t", 'sql')

    expect(tokens.some((t) => t.tipo === 'cadena' && t.texto === "'no lo hagas'")).toBe(true)
  })

  it("una cadena con comilla escapada ('') no se corta a mitad", () => {
    const tokens = tokenizar("SELECT 'don''t' FROM t", 'sql')

    expect(tokens.some((t) => t.tipo === 'cadena' && t.texto === "'don''t'")).toBe(true)
  })

  it('reconoce comentarios de línea con --', () => {
    const tokens = tokenizar('SELECT 1 -- una nota\nFROM t', 'sql')

    expect(tokens.some((t) => t.tipo === 'comentario' && t.texto === '-- una nota')).toBe(true)
  })

  it('reconoce funciones agregadas seguidas de paréntesis como palabra clave, y funciones propias como funcion', () => {
    const tokens = tokenizar('SELECT COUNT(*), mi_funcion(x) FROM t', 'sql')

    expect(tokens.some((t) => t.tipo === 'palabraClave' && t.texto === 'COUNT')).toBe(true)
    expect(tokens.some((t) => t.tipo === 'funcion' && t.texto === 'mi_funcion')).toBe(true)
  })
})
```

Y añadir tres casos nuevos al array `CASOS` de `describe('resistencia al código roto', ...)` (tras la línea `{ nombre: 'cadena vacía', codigo: '', lenguaje: 'html' },`):

```ts
    { nombre: 'cadena SQL sin cerrar', codigo: "SELECT 'sin final", lenguaje: 'sql' },
    { nombre: 'comentario SQL sin salto final', codigo: 'SELECT 1 -- nota', lenguaje: 'sql' },
    { nombre: 'comilla escapada SQL', codigo: "SELECT 'don''t stop'", lenguaje: 'sql' },
```

- [ ] **Step 2: Ejecutar los tests y comprobar que fallan**

Run: `npm run test -- resaltador.test.ts`
Expected: FAIL — `tokenizar(..., 'sql')` cae en la rama `else` genérica (`empujar(salida, 'texto', codigo)`), no produce ningún token de tipo `palabraClave`/`cadena`/`comentario`.

- [ ] **Step 3: Implementar `tokenizarSql`**

En `src/components/codigo/resaltador.ts`, cambiar la línea 14:

```ts
export type Lenguaje = 'html' | 'css' | 'js' | 'texto'
```

por:

```ts
export type Lenguaje = 'html' | 'css' | 'js' | 'sql' | 'texto'
```

Añadir, justo después del bloque `// ---------------------------------------------------------------- JavaScript` completo (tras la función `tokenizarJs`, antes de `// ---------------------------------------------------------------- API`, es decir tras la línea 360 original):

```ts
// ---------------------------------------------------------------- SQL

const PALABRAS_CLAVE_SQL = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'IS', 'NULL', 'DISTINCT', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'UNION', 'ALL', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'DEFAULT', 'UNIQUE', 'CHECK', 'INDEX', 'VIEW', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX',
])

/**
 * Avanza sobre una cadena SQL respetando el escape estándar: '' dentro de
 * la cadena representa una comilla simple literal, no un cierre (a
 * diferencia de JS, SQL no usa barra invertida para escapar).
 */
function finDeCadenaSql(codigo: string, inicio: number) {
  let i = inicio + 1
  while (i < codigo.length) {
    if (codigo[i] === "'" && codigo[i + 1] === "'") {
      i += 2
      continue
    }
    if (codigo[i] === "'") return i + 1
    i += 1
  }
  return codigo.length
}

function tokenizarSql(codigo: string, salida: Token[]) {
  let i = 0

  while (i < codigo.length) {
    const caracter = codigo[i]

    if (codigo.startsWith('--', i)) {
      const salto = codigo.indexOf('\n', i)
      const fin = salto === -1 ? codigo.length : salto
      empujar(salida, 'comentario', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (caracter === "'") {
      const fin = finDeCadenaSql(codigo, i)
      empujar(salida, 'cadena', codigo.slice(i, fin))
      i = fin
      continue
    }
    if (/\s/.test(caracter)) {
      const espacios = /^\s+/.exec(codigo.slice(i))![0]
      empujar(salida, 'texto', espacios)
      i += espacios.length
      continue
    }

    const numero = /^\d+\.?\d*/.exec(codigo.slice(i))
    if (numero) {
      empujar(salida, 'numero', numero[0])
      i += numero[0].length
      continue
    }

    // SQL es insensible a mayúsculas en sus palabras clave (a diferencia de
    // JS) — se compara en mayúsculas, pero se conserva el texto tal cual lo
    // escribió quien redactó la consulta.
    const identificador = /^[A-Za-z_][\w]*/.exec(codigo.slice(i))
    if (identificador) {
      const palabra = identificador[0]
      const siguiente = codigo.slice(i + palabra.length).match(/^\s*\(/)
      const tipo: TipoToken = PALABRAS_CLAVE_SQL.has(palabra.toUpperCase())
        ? 'palabraClave'
        : siguiente
          ? 'funcion'
          : 'texto'
      empujar(salida, tipo, palabra)
      i += palabra.length
      continue
    }

    empujar(salida, 'puntuacion', caracter)
    i += 1
  }
}
```

Y en la función `tokenizar` (sección `// ---------------------------------------------------------------- API`), cambiar:

```ts
export function tokenizar(codigo: string, lenguaje: Lenguaje = 'html'): Token[] {
  const salida: Token[] = []
  if (!codigo) return salida

  if (lenguaje === 'html') tokenizarHtml(codigo, salida)
  else if (lenguaje === 'css') tokenizarCss(codigo, salida)
  else if (lenguaje === 'js') tokenizarJs(codigo, salida)
  else empujar(salida, 'texto', codigo)

  return salida
}
```

por:

```ts
export function tokenizar(codigo: string, lenguaje: Lenguaje = 'html'): Token[] {
  const salida: Token[] = []
  if (!codigo) return salida

  if (lenguaje === 'html') tokenizarHtml(codigo, salida)
  else if (lenguaje === 'css') tokenizarCss(codigo, salida)
  else if (lenguaje === 'js') tokenizarJs(codigo, salida)
  else if (lenguaje === 'sql') tokenizarSql(codigo, salida)
  else empujar(salida, 'texto', codigo)

  return salida
}
```

- [ ] **Step 4: Ejecutar los tests y comprobar que pasan**

Run: `npm run test -- resaltador.test.ts`
Expected: PASS (todos, incluidos todos los ya existentes de html/css/js — `it.each(CASOS)` corre automáticamente sobre los 3 casos SQL nuevos añadidos al array).

- [ ] **Step 5: `npm run build`, `lint` y la suite completa en verde**

Run: `npm run build && npm run lint && npm run test`
Expected: los tres en verde.

- [ ] **Step 6: Commit**

```bash
git add src/components/codigo/resaltador.ts src/components/codigo/resaltador.test.ts
git commit -m "feat(resaltador): tokenizador SQL real (palabras clave, cadenas, comentarios, números)"
```

---

## Task 6: `TablaResultado.tsx` (componente compartido)

**Files:**
- Create: `src/components/bloques-laboratorio/TablaResultado.tsx`
- Test: Create `src/components/bloques-laboratorio/TablaResultado.test.tsx`

**Interfaces:**
- Consumes: `SqlValue` de `sql.js` (Task 2).
- Produces: `<TablaResultado columns={string[]} values={SqlValue[][]} />` — usado por la Task 7 y la Task 8.

**Checkpoint de seguridad de esta tarea (ver Global Constraints):** los valores de celda son hijos de JSX (`{valor}`), nunca `dangerouslySetInnerHTML` — React ya escapa el contenido de texto automáticamente, así que basta con no usar esa prop en ningún punto de este componente.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/bloques-laboratorio/TablaResultado.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TablaResultado } from './TablaResultado'

describe('TablaResultado', () => {
  it('renderiza cabeceras y filas', () => {
    render(
      <TablaResultado columns={['nombre', 'salario']} values={[['Ana', 55000], ['Luis', 62000]]} />,
    )

    expect(screen.getByRole('columnheader', { name: 'nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'salario' })).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('62000')).toBeInTheDocument()
  })

  it('muestra NULL en vez de una celda vacía para un valor null', () => {
    render(<TablaResultado columns={['nombre']} values={[[null]]} />)

    expect(screen.getByText('NULL')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay filas', () => {
    render(<TablaResultado columns={[]} values={[]} />)

    expect(screen.getByText('Sin filas')).toBeInTheDocument()
  })

  it('renderiza un valor de cadena con HTML literal como texto, no como marcado', () => {
    render(<TablaResultado columns={['x']} values={[['<img src=x onerror=alert(1)>']]} />)

    // Si esto se hubiera renderizado como HTML habría una etiqueta <img> real
    // en el documento — el checkpoint de seguridad de esta tarea es
    // precisamente que eso no ocurra nunca.
    expect(document.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm run test -- TablaResultado.test.tsx`
Expected: FAIL — `./TablaResultado` no existe todavía.

- [ ] **Step 3: Implementar `TablaResultado.tsx`**

Crear `src/components/bloques-laboratorio/TablaResultado.tsx`:

```tsx
import type { SqlValue } from 'sql.js'

export function TablaResultado({
  columns,
  values,
}: {
  columns: string[]
  values: SqlValue[][]
}) {
  if (columns.length === 0) {
    return <p className="p-3 text-sm text-muted-foreground">Sin filas</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm [font-variant-numeric:tabular-nums]">
        <thead>
          <tr className="border-b bg-muted/40">
            {columns.map((columna) => (
              <th
                key={columna}
                scope="col"
                className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((fila, indiceFila) => (
            <tr key={indiceFila} className="border-b last:border-0">
              {fila.map((valor, indiceCelda) => (
                <td key={indiceCelda} className="px-3 py-2">
                  {/* Nunca dangerouslySetInnerHTML: el alumno controla este
                      valor a través de literales de cadena en su propia
                      consulta. Un hijo de JSX ya se escapa automáticamente. */}
                  {valor === null ? 'NULL' : String(valor)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar el test y comprobar que pasa**

Run: `npm run test -- TablaResultado.test.tsx`
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git add src/components/bloques-laboratorio/TablaResultado.tsx src/components/bloques-laboratorio/TablaResultado.test.tsx
git commit -m "feat(bloques-laboratorio): TablaResultado, valores siempre como texto"
```

---

## Task 7: `SqlAnotado.tsx` + alta en `registro.ts`

**Files:**
- Create: `src/components/bloques-laboratorio/SqlAnotado.tsx`
- Modify: `src/components/bloques-laboratorio/registro.ts`

**Interfaces:**
- Consumes: `DatosSqlAnotado` (Task 1), `crearMotorSql`/`ejecutarConsulta` de `@/lib/sql-en-vivo/motor` (Task 4), `CodigoResaltado` (ya existente, con `lenguaje="sql"` de la Task 5), `TablaResultado` (Task 6).
- Produces: componente registrado bajo `'sql-anotado'` en `registroBloquesLaboratorio`.

- [ ] **Step 1: Implementar `SqlAnotado.tsx`**

Modela el mismo patrón de anotaciones clicables que `CodigoAnotado.tsx` (números → destaca fragmento → muestra nota), pero ejecuta la consulta contra el motor real al montar y muestra el resultado real en vez de solo mostrar código.

Crear `src/components/bloques-laboratorio/SqlAnotado.tsx`:

```tsx
import { Database } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'

import { CodigoResaltado } from '@/components/codigo'
import { Button } from '@/components/ui/button'
import { TablaResultado } from '@/components/bloques-laboratorio/TablaResultado'
import type { DatosSqlAnotado } from '@/lib/laboratorio/schemas'
import {
  crearMotorSql,
  ejecutarConsulta,
  type MotorSql,
  type ResultadoConsulta,
} from '@/lib/sql-en-vivo/motor'
import { cn } from '@/lib/utils'

export function SqlAnotado({ titulo, esquemaSql, consulta, anotaciones }: DatosSqlAnotado) {
  const idNota = useId()
  const anotacionesValidas = useMemo(
    () =>
      anotaciones.flatMap((anotacion) => {
        const posicion = consulta.indexOf(anotacion.fragmento)
        if (posicion === -1) return []

        return [
          {
            ...anotacion,
            linea: consulta.slice(0, posicion).split('\n').length,
          },
        ]
      }),
    [anotaciones, consulta],
  )
  const [anotacionActiva, setAnotacionActiva] = useState(0)
  const activa = anotacionesValidas[anotacionActiva]

  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)

  useEffect(() => {
    let cancelado = false
    crearMotorSql()
      .then((motor: MotorSql) => {
        if (cancelado) return
        setResultado(ejecutarConsulta(motor, esquemaSql, consulta))
      })
      .catch((error: unknown) => {
        if (!cancelado) {
          setResultado({
            ok: false,
            mensaje: error instanceof Error ? error.message : 'No se pudo cargar el motor SQL.',
          })
        }
      })
    return () => {
      cancelado = true
    }
  }, [esquemaSql, consulta])

  return (
    <section
      aria-label="SQL anotado"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-teal-50 dark:bg-teal-950/40">
          <Database aria-hidden="true" className="size-4.75 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-teal-600 uppercase dark:text-teal-400">
            SQL anotado
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            {titulo ?? 'Selecciona un número para destacar el fragmento y leer la nota'}
          </h3>
        </div>
      </div>

      <CodigoResaltado
        codigo={consulta}
        lenguaje="sql"
        numerarLineas
        lineasDestacadas={activa ? [activa.linea] : []}
        etiqueta="Consulta SQL anotada"
      />

      {anotacionesValidas.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" aria-label="Anotaciones de la consulta">
            {anotacionesValidas.map((anotacion, indice) => (
              <Button
                key={`${anotacion.fragmento}-${indice}`}
                type="button"
                variant="outline"
                size="icon"
                aria-pressed={indice === anotacionActiva}
                aria-controls={idNota}
                aria-label={`Ver anotación ${indice + 1}: ${anotacion.nota}`}
                onClick={() => setAnotacionActiva(indice)}
                className={cn(
                  'size-11 touch-manipulation rounded-full transition-colors',
                  indice === anotacionActiva &&
                    'border-teal-500 bg-teal-500 text-white hover:bg-teal-500 dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950',
                )}
              >
                {indice + 1}
              </Button>
            ))}
          </div>
          <p
            key={anotacionActiva}
            id={idNota}
            aria-live="polite"
            className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-lg border-l-4 border-teal-500 bg-teal-50 p-3 text-sm text-pretty duration-200 motion-reduce:animate-none dark:border-teal-400 dark:bg-teal-950/30"
          >
            <span className="font-semibold">Nota {anotacionActiva + 1}.</span> {activa?.nota}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <h4 className="text-sm font-semibold">Resultado</h4>
        {resultado === null && (
          <p className="text-sm text-muted-foreground">Ejecutando la consulta…</p>
        )}
        {resultado?.ok === false && (
          <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {resultado.mensaje}
          </p>
        )}
        {resultado?.ok === true && (
          <>
            <TablaResultado columns={resultado.columns} values={resultado.values} />
            <p className="text-xs text-muted-foreground">
              {resultado.values.length} fila{resultado.values.length === 1 ? '' : 's'} — resultado
              real, no escrito a mano.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Registrar el componente**

En `src/components/bloques-laboratorio/registro.ts`, añadir el import (orden alfabético, junto a `Roles`):

```ts
import { SqlAnotado } from '@/components/bloques-laboratorio/SqlAnotado'
```

Y la entrada en `registroBloquesLaboratorio` (junto a `'editor-en-vivo': EditorEnVivo,`):

```ts
  'sql-anotado': SqlAnotado,
```

- [ ] **Step 3: Verificación manual con el servidor de desarrollo**

Run: `npm run dev`

En `/admin/referencia-contenido` (o cualquier página que renderice bloques laboratorio de prueba), comprobar a mano con un bloque `sql-anotado` real:
1. La consulta se ve resaltada de verdad (palabras clave en color).
2. Los números de anotación destacan la línea correcta y muestran su nota.
3. La tabla de resultado muestra filas reales (no un placeholder).

- [ ] **Step 4: `npm run build`, `lint` y la suite completa en verde**

Run: `npm run build && npm run lint && npm run test`
Expected: los tres en verde.

- [ ] **Step 5: Commit**

```bash
git add src/components/bloques-laboratorio/SqlAnotado.tsx src/components/bloques-laboratorio/registro.ts
git commit -m "feat(bloques-laboratorio): SqlAnotado, ejecuta la consulta de verdad al montar"
```

---

## Task 8: `SqlEnVivo.tsx` + alta en `registro.ts`

**Files:**
- Create: `src/components/bloques-laboratorio/SqlEnVivo.tsx`
- Modify: `src/components/bloques-laboratorio/registro.ts`

**Interfaces:**
- Consumes: `DatosSqlEnVivo` (Task 1), `crearMotorSql`/`ejecutarConsulta`/`compararResultados` de `@/lib/sql-en-vivo/motor` (Task 4), `TablaResultado` (Task 6), `@codemirror/lang-sql` (Task 2).
- Produces: componente registrado bajo `'sql-en-vivo'` en `registroBloquesLaboratorio`.

- [ ] **Step 1: Implementar `SqlEnVivo.tsx`**

Editor CodeMirror de un solo lenguaje (a diferencia de `EditorEnVivo.tsx`, aquí no hay pestañas — siempre es SQL), layout apilado (no lado a lado), debounce de ejecución, y verificación opcional contra `consultaSolucion`.

Crear `src/components/bloques-laboratorio/SqlEnVivo.tsx`:

```tsx
import { sql } from '@codemirror/lang-sql'
import { basicSetup, EditorView } from 'codemirror'
import { CircleCheck, CircleX, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { TablaResultado } from '@/components/bloques-laboratorio/TablaResultado'
import type { DatosSqlEnVivo } from '@/lib/laboratorio/schemas'
import {
  compararResultados,
  crearMotorSql,
  ejecutarConsulta,
  type MotorSql,
  type ResultadoConsulta,
} from '@/lib/sql-en-vivo/motor'

const RETRASO_EJECUCION_MS = 300

const estilosTemaAplicacion = {
  '&': {
    color: 'var(--foreground)',
    backgroundColor: 'var(--muted)',
    fontSize: '0.875rem',
  },
  '&.cm-focused': {
    outline: '2px solid var(--ring)',
    outlineOffset: '-2px',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-content': {
    minHeight: '4.5rem',
    padding: '0.75rem 0',
    caretColor: 'var(--foreground)',
    whiteSpace: 'pre',
  },
  '.cm-line': {
    padding: '0 0.75rem',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-activeLine, .cm-activeLineGutter': {
    backgroundColor: 'var(--accent)',
  },
} as const

function crearTemaAplicacion(modoOscuro: boolean) {
  return EditorView.theme(estilosTemaAplicacion, { dark: modoOscuro })
}

function EditorSql({ valor, onChange }: { valor: string; onChange: (valor: string) => void }) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const vistaRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const valorRef = useRef(valor)
  const [modoOscuro, setModoOscuro] = useState(() =>
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    valorRef.current = valor
  }, [valor])

  useEffect(() => {
    const observador = new MutationObserver(() => {
      setModoOscuro(document.documentElement.classList.contains('dark'))
    })
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!contenedorRef.current) return

    const vista = new EditorView({
      doc: valorRef.current,
      parent: contenedorRef.current,
      extensions: [
        basicSetup,
        sql(),
        crearTemaAplicacion(modoOscuro),
        EditorView.contentAttributes.of({
          'aria-label': 'Editor de consulta SQL',
          'aria-multiline': 'true',
          spellcheck: 'false',
        }),
        EditorView.updateListener.of((actualizacion) => {
          if (actualizacion.docChanged) onChangeRef.current(actualizacion.state.doc.toString())
        }),
      ],
    })
    vistaRef.current = vista

    return () => {
      vista.destroy()
      vistaRef.current = null
    }
  }, [modoOscuro])

  useEffect(() => {
    const vista = vistaRef.current
    if (!vista || vista.state.doc.toString() === valor) return
    vista.dispatch({ changes: { from: 0, to: vista.state.doc.length, insert: valor } })
  }, [valor])

  return (
    <div
      ref={contenedorRef}
      className="min-w-0 max-w-full overflow-hidden rounded-lg border bg-muted [&_.cm-editor]:max-w-full [&_.cm-editor]:overflow-hidden"
    />
  )
}

export function SqlEnVivo({
  consigna,
  esquemaSql,
  consultaInicial,
  consultaSolucion,
}: DatosSqlEnVivo) {
  const [consulta, setConsulta] = useState(consultaInicial)
  const [motor, setMotor] = useState<MotorSql | null>(null)
  const [estadoMotor, setEstadoMotor] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)

  useEffect(() => {
    let cancelado = false
    crearMotorSql()
      .then((motorCargado) => {
        if (cancelado) return
        setMotor(motorCargado)
        setEstadoMotor('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoMotor('error')
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (!motor) return
    const temporizador = window.setTimeout(() => {
      const texto = consulta.trim()
      if (!texto) {
        setResultado(null)
        return
      }
      setResultado(ejecutarConsulta(motor, esquemaSql, texto))
    }, RETRASO_EJECUCION_MS)

    return () => window.clearTimeout(temporizador)
  }, [consulta, motor, esquemaSql])

  const solucion = useMemo(() => {
    if (!motor || !consultaSolucion) return null
    return ejecutarConsulta(motor, esquemaSql, consultaSolucion)
  }, [motor, esquemaSql, consultaSolucion])

  const coincide =
    resultado?.ok === true && solucion?.ok === true && compararResultados(resultado, solucion)

  return (
    <section
      aria-label="SQL en vivo"
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-purple-50 dark:bg-purple-950/40">
            <Play aria-hidden="true" className="size-4.75 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-[11px] font-bold tracking-wider text-purple-600 uppercase dark:text-purple-400">
              SQL en vivo
            </p>
            <h3 className="text-lg font-bold tracking-tight text-balance">
              Escribe tu consulta y comprueba el resultado real
            </h3>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConsulta(consultaInicial)}
        >
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </div>

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      {estadoMotor === 'cargando' && (
        <p className="text-sm text-muted-foreground">Cargando el motor SQL…</p>
      )}
      {estadoMotor === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el motor SQL. Recarga la página para intentarlo de nuevo.
        </p>
      )}

      {estadoMotor === 'listo' && (
        <>
          <EditorSql valor={consulta} onChange={setConsulta} />

          <div className="space-y-1">
            {resultado === null && (
              <p className="text-sm text-muted-foreground">Escribe una consulta para ejecutarla.</p>
            )}
            {/* En error se limpia la tabla: un ejercicio de SQL es de intento
                único ("¿funciona esta consulta, sí o no?"), a diferencia de
                la vista previa continua de HTML/CSS/JS/TS, que sí conserva
                el último resultado válido — aquí dejar una tabla vieja
                confundiría más de lo que ayuda. */}
            {resultado?.ok === false && (
              <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {resultado.mensaje}
              </p>
            )}
            {resultado?.ok === true && (
              <>
                <TablaResultado columns={resultado.columns} values={resultado.values} />
                <p className="text-xs text-muted-foreground">
                  {resultado.values.length} fila{resultado.values.length === 1 ? '' : 's'}
                </p>
              </>
            )}
            {consultaSolucion && resultado?.ok === true && (
              <div
                className={
                  coincide
                    ? 'inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400'
                    : 'inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400'
                }
              >
                {coincide ? (
                  <>
                    <CircleCheck aria-hidden="true" className="size-4" />
                    Coincide con la solución
                  </>
                ) : (
                  <>
                    <CircleX aria-hidden="true" className="size-4" />
                    Todavía no coincide — sigue intentándolo
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Registrar el componente**

En `src/components/bloques-laboratorio/registro.ts`, añadir el import (junto al de `SqlAnotado` de la Task 7):

```ts
import { SqlEnVivo } from '@/components/bloques-laboratorio/SqlEnVivo'
```

Y la entrada en `registroBloquesLaboratorio` (junto a `'sql-anotado': SqlAnotado,`):

```ts
  'sql-en-vivo': SqlEnVivo,
```

- [ ] **Step 3: Verificación manual con el servidor de desarrollo**

Run: `npm run dev`

En `/admin/referencia-contenido` (o una lección de prueba) con un bloque `sql-en-vivo` real (con `consultaSolucion`), comprobar a mano:
1. El editor tiene resaltado de sintaxis SQL real (CodeMirror).
2. Escribir una consulta con un error (`SELECT * FROM tabla_falsa`) → aparece el mensaje real de SQLite, la tabla queda vacía.
3. Escribir la consulta solución exacta → aparece la tabla con el resultado real y el badge "✅ Coincide con la solución".
4. Escribir una consulta distinta pero incorrecta → aparece el badge "❌ Todavía no coincide".
5. Pulsar "Reiniciar" → el editor vuelve a `consultaInicial`.

- [ ] **Step 4: `npm run build`, `lint` y la suite completa en verde**

Run: `npm run build && npm run lint && npm run test`
Expected: los tres en verde.

- [ ] **Step 5: Commit**

```bash
git add src/components/bloques-laboratorio/SqlEnVivo.tsx src/components/bloques-laboratorio/registro.ts
git commit -m "feat(bloques-laboratorio): SqlEnVivo, ejecución real con debounce y verificación opcional"
```

---

## Task 9: Verificación final (Claude — visual y de seguridad)

Codex no puede ejecutar esta tarea: su sandbox no tiene acceso a red/Chromium para Playwright (ver memoria del proyecto). La ejecuta Claude.

**Files:** ninguno nuevo — solo verificación y actualización de los docs de la spec.

- [ ] **Step 1: Verificación visual con Playwright**

Levantar `npm run dev`, navegar con credenciales de admin reales a una página con ambos bloques (`/admin/referencia-contenido` o una lección de prueba) y comprobar con capturas, en claro y en oscuro:
1. `sql-anotado`: consulta resaltada con color real, números de anotación funcionando, tabla de resultado con filas reales.
2. `sql-en-vivo`: editor con resaltado de sintaxis, un intento correcto (✅), uno incorrecto (❌), y una consulta con error real de SQLite mostrado tal cual.
3. Cero errores de consola/página en ambos.

- [ ] **Step 2: Spot-check de seguridad**

Confirmar, releyendo el diff completo de las Tasks 1-8:
- `sql.js`, `@types/sql.js` y `@codemirror/lang-sql` son exactamente los paquetes oficiales (`sql-js/sql.js` en GitHub, DefinitelyTyped, y el equipo de CodeMirror respectivamente) — sin typosquatting.
- Ningún punto de `TablaResultado.tsx`, `SqlAnotado.tsx` ni `SqlEnVivo.tsx` usa `dangerouslySetInnerHTML` (checkpoint real de esta feature — confirmar con `grep -rn dangerouslySetInnerHTML src/components/bloques-laboratorio/`, debe devolver 0 resultados nuevos).
- El motor de sql.js corre en el hilo principal, sin iframe — no ejecuta JS del alumno, solo SQL interpretado (sin acceso a `fetch`/DOM/`window` desde dentro de una consulta).
- `public/sql-wasm.wasm` es un asset estático comiteado, no contenido generado por usuarios.
- Sin RLS nueva — no aplica ninguna migración en esta feature.

- [ ] **Step 3: Actualizar `specs/features/sql-en-vivo.md`**

Marcar como `[x]` los items ya completados del checklist de implementación (esquema, dependencias, `motor.ts`, tokenizador, componentes, registro, verificación) y actualizar el **Estado** del encabezado a `🚧 en curso — mecanismo implementado, temario de contenido pendiente`.

- [ ] **Step 4: Actualizar `specs/features/README.md`**

Cambiar el estado de la fila de SQL de `⏳ pendiente` a `🚧 en curso — mecanismo implementado, temario pendiente`.

- [ ] **Step 5: Commit**

```bash
git add specs/features/sql-en-vivo.md specs/features/README.md
git commit -m "docs(specs): marcar como implementado el mecanismo de SQL en vivo"
```
