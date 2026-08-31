# PostgreSQL en vivo (PGlite) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extender los bloques `sql-anotado`/`sql-en-vivo` ya existentes para que, con `motor: 'postgres'`, ejecuten de verdad contra PostgreSQL real (vía PGlite/WASM) en el navegador — incluida Row Level Security real con identidad simulada.

**Architecture:** Mismo patrón que `sql-en-vivo` (motor cargado perezosamente vía `import()` dinámico, una base de datos nueva por ejecución para aislamiento), con dos diferencias: el módulo WASM compilado y el snapshot del sistema de ficheros se cachean una vez por sesión del navegador (PGlite pesa ~15 MB sin comprimir, frente a los ~700 KB de sql.js), y las consultas son asíncronas (PGlite, a diferencia de sql.js, no tiene una API síncrona).

**Tech Stack:** `@electric-sql/pglite` (PostgreSQL 18 real vía WebAssembly), Zod, React, Vitest, Playwright.

**Spec:** `specs/features/postgresql-en-vivo.md` — el plan argumenta desde ese spec; ejecuta leyendo los dos.

## Global Constraints

- `motor: z.enum(['sqlite', 'postgres']).default('sqlite')` en `esquemaSqlAnotado`/`esquemaSqlEnVivo` — retrocompatible, las 45 lecciones de SQL ya publicadas no se tocan.
- `@electric-sql/pglite` fijado a versión exacta (sin `^`) — confirmar con `npm view @electric-sql/pglite version` antes de instalar (era `0.5.8` al escribir este plan, puede haber cambiado).
- El sandbox de Codex no tiene red — cualquier `npm install` lo ejecuta Claude, nunca Codex.
- Codex no puede verificar visualmente (sin Chromium/red en su sandbox) — la verificación con Playwright (Tarea 9) la hace Claude.
- Sin `dangerouslySetInnerHTML` en ningún punto nuevo — `TablaResultado.tsx` ya es seguro y no se toca.
- Un superusuario se salta RLS SIEMPRE en Postgres real, con o sin `FORCE ROW LEVEL SECURITY` — cualquier bloque con `identidadSimulada` debe crear un rol `app_user NOSUPERUSER` en su propio `esquemaSql` (ver Tarea 4) o RLS nunca se aplicará.
- Runner de tests de este proyecto: **Vitest**, no `node:test`. `npm run test` → `vitest run`. Un fichero suelto: `npx vitest run <ruta>`.

---

### Task 1: Extraer `compararResultados`/`ResultadoConsulta` a un módulo compartido

**Files:**
- Create: `src/lib/sql-en-vivo/comparar.ts`
- Create: `src/lib/sql-en-vivo/comparar.test.ts`
- Modify: `src/lib/sql-en-vivo/motor.ts:13-24,67-79` (quitar la definición, importar y re-exportar)
- Modify: `src/lib/sql-en-vivo/motor.test.ts:87-124` (quitar el bloque `describe('compararResultados', ...)`, ya movido)

**Interfaces:**
- Produces: `src/lib/sql-en-vivo/comparar.ts` exporta `ResultadoConsultaOk`, `ResultadoConsultaError`, `ResultadoConsulta` (union), `compararResultados(a: ResultadoConsulta, b: ResultadoConsulta): boolean`. `postgres-en-vivo/motor.ts` (Tarea 4) importa directamente de aquí — nunca de `sql-en-vivo/motor.ts`, para no crear una dependencia cruzada entre los dos motores.

Este tipo (`ResultadoConsulta`) y esta comparación son agnósticos de motor — ya lo eran en `sql-en-vivo/motor.ts`, solo se mueven de sitio para que el motor de Postgres (Tarea 4) los reutilice sin duplicar lógica ni depender del módulo de sql.js.

- [ ] **Step 1: Crear el módulo compartido con el código ya existente**

```ts
// src/lib/sql-en-vivo/comparar.ts
//
// Tipos y comparación de resultados de una consulta SQL — agnósticos de
// motor (sql.js o PGlite). Compartido entre src/lib/sql-en-vivo/motor.ts
// y src/lib/postgres-en-vivo/motor.ts.
export interface ResultadoConsultaOk {
  ok: true
  columns: string[]
  values: unknown[][]
}

export interface ResultadoConsultaError {
  ok: false
  mensaje: string
}

export type ResultadoConsulta = ResultadoConsultaOk | ResultadoConsultaError

export function compararResultados(a: ResultadoConsulta, b: ResultadoConsulta): boolean {
  if (!a.ok || !b.ok) return false
  if (a.columns.length !== b.columns.length) return false
  for (let i = 0; i < a.columns.length; i++) {
    if (a.columns[i] !== b.columns[i]) return false
  }

  const normalizar = (filas: unknown[][]) => filas.map((fila) => JSON.stringify(fila)).sort()
  const filasA = normalizar(a.values)
  const filasB = normalizar(b.values)
  if (filasA.length !== filasB.length) return false
  return filasA.every((fila, i) => fila === filasB[i])
}
```

Nota: `values: unknown[][]` en vez de `SqlValue[][]` (el tipo de sql.js) — este módulo no debe depender de `sql.js`, que es específico del motor SQLite. `sql-en-vivo/motor.ts` (Step 3) sigue exponiendo su propio `ResultadoConsulta` tipado con `SqlValue[][]` internamente vía un alias, para no romper el tipado más preciso que ya tenían sus consumidores.

- [ ] **Step 2: Mover los 5 tests de `compararResultados` a su propio fichero**

```ts
// src/lib/sql-en-vivo/comparar.test.ts
import { describe, expect, it } from 'vitest'

import { compararResultados } from './comparar'

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

- [ ] **Step 3: Correr el nuevo fichero de tests, debe pasar ya (código idéntico, solo movido)**

Run: `npx vitest run src/lib/sql-en-vivo/comparar.test.ts`
Expected: PASS, 5/5 tests

- [ ] **Step 4: Editar `motor.ts` para importar de `comparar.ts` en vez de definir localmente**

Reemplaza en `src/lib/sql-en-vivo/motor.ts` las líneas 13-24 (las interfaces `ResultadoConsultaOk`/`ResultadoConsultaError`/`ResultadoConsulta`) por:

```ts
import type { ResultadoConsulta } from './comparar'
export type { ResultadoConsulta } from './comparar'
export { compararResultados } from './comparar'
```

(Esto va justo después del `import type { QueryExecResult, SqlJsStatic, SqlValue } from 'sql.js'` ya existente en la línea 11.)

Y elimina por completo las líneas 67-79 del fichero (la función `compararResultados` que ahora vive en `comparar.ts`).

El resto del fichero (`MotorSql`, `crearMotorSql`, `ejecutarConsulta`) no cambia — siguen usando `SqlValue[][]` internamente para `values`, que es un subtipo compatible de `unknown[][]`.

- [ ] **Step 5: Quitar el bloque de tests ya movido de `motor.test.ts`**

Borra las líneas 87-124 de `src/lib/sql-en-vivo/motor.test.ts` (todo el `describe('compararResultados', ...)`) — y borra también el import ya no usado: cambia la línea 5 de

```ts
import { compararResultados, crearMotorSql, ejecutarConsulta } from './motor'
```

a

```ts
import { crearMotorSql, ejecutarConsulta } from './motor'
```

- [ ] **Step 6: Correr toda la suite de `sql-en-vivo` y confirmar que nada se rompió**

Run: `npx vitest run src/lib/sql-en-vivo/`
Expected: PASS — `motor.test.ts` (6 tests, ya sin los 5 de compararResultados) + `comparar.test.ts` (5 tests)

- [ ] **Step 7: Confirmar que los componentes que importan `compararResultados` de `motor.ts` siguen compilando**

`SqlEnVivo.tsx` hace `import { compararResultados, crearMotorSql, ejecutarConsulta, ... } from '@/lib/sql-en-vivo/motor'` — sigue siendo válido gracias al re-export del Step 4. Confirmar con:

Run: `npx tsc -b --noEmit`
Expected: 0 errores

- [ ] **Step 8: Commit**

```bash
git add src/lib/sql-en-vivo/comparar.ts src/lib/sql-en-vivo/comparar.test.ts src/lib/sql-en-vivo/motor.ts src/lib/sql-en-vivo/motor.test.ts
git commit -m "refactor(sql-en-vivo): extraer compararResultados a un módulo compartido"
```

---

### Task 2: Esquema Zod — extender `esquemaSqlAnotado`/`esquemaSqlEnVivo`

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts:205-229`
- Modify: `src/lib/laboratorio/schemas.test.ts` (nuevos tests, ver Step 1)

**Interfaces:**
- Produces: `DatosSqlAnotado`/`DatosSqlEnVivo` (ya existentes, `z.infer` de los esquemas) ganan los campos `motor`, `extensiones`, `identidadSimulada` — las Tareas 6 y 7 (componentes) los destructuran de sus props tal cual.

- [ ] **Step 1: Escribir los tests que fallan primero**

Añade a `src/lib/laboratorio/schemas.test.ts` (junto a los tests ya existentes de `esquemaSqlAnotado`/`esquemaSqlEnVivo` — busca ese bloque `describe` y añade estos `it` dentro, o crea un `describe('extensión postgres', ...)` nuevo si los existentes están en un describe distinto):

```ts
describe('esquemaSqlEnVivo — extensión Postgres', () => {
  const base = {
    tipo: 'sql-en-vivo' as const,
    esquemaSql: 'CREATE TABLE t (id int);',
    consultaInicial: '',
  }

  it('motor por defecto es sqlite (retrocompatible)', () => {
    const resultado = esquemaSqlEnVivo.parse(base)
    expect(resultado.motor).toBe('sqlite')
  })

  it('acepta motor: postgres', () => {
    const resultado = esquemaSqlEnVivo.parse({ ...base, motor: 'postgres' })
    expect(resultado.motor).toBe('postgres')
  })

  it('rechaza un motor que no sea sqlite ni postgres', () => {
    expect(() => esquemaSqlEnVivo.parse({ ...base, motor: 'mysql' })).toThrow()
  })

  it('extensiones es opcional y solo acepta pgcrypto/uuid_ossp', () => {
    expect(esquemaSqlEnVivo.parse(base).extensiones).toBeUndefined()
    expect(
      esquemaSqlEnVivo.parse({ ...base, extensiones: ['pgcrypto', 'uuid_ossp'] }).extensiones,
    ).toEqual(['pgcrypto', 'uuid_ossp'])
    expect(() => esquemaSqlEnVivo.parse({ ...base, extensiones: ['postgis'] })).toThrow()
  })

  it('identidadSimulada es opcional, necesita al menos 2 y como mucho 4', () => {
    expect(esquemaSqlEnVivo.parse(base).identidadSimulada).toBeUndefined()

    const dos = [
      { etiqueta: 'Ana', valor: 'ana' },
      { etiqueta: 'Roberto', valor: 'roberto' },
    ]
    expect(esquemaSqlEnVivo.parse({ ...base, identidadSimulada: dos }).identidadSimulada).toEqual(dos)

    expect(() =>
      esquemaSqlEnVivo.parse({ ...base, identidadSimulada: [dos[0]] }),
    ).toThrow()
  })
})

describe('esquemaSqlAnotado — extensión Postgres', () => {
  it('motor por defecto es sqlite (retrocompatible)', () => {
    const resultado = esquemaSqlAnotado.parse({
      tipo: 'sql-anotado',
      esquemaSql: 'CREATE TABLE t (id int);',
      consulta: 'SELECT * FROM t;',
      anotaciones: [{ fragmento: 'SELECT', nota: 'x' }],
    })
    expect(resultado.motor).toBe('sqlite')
  })
})
```

- [ ] **Step 2: Correr los tests, deben fallar**

Run: `npx vitest run src/lib/laboratorio/schemas.test.ts`
Expected: FAIL — `resultado.motor` es `undefined`, no `'sqlite'` (el campo no existe todavía)

- [ ] **Step 3: Añadir los campos nuevos a los dos esquemas**

En `src/lib/laboratorio/schemas.ts`, reemplaza las líneas 205-229 (`esquemaSqlAnotado` y `esquemaSqlEnVivo` completos) por:

```ts
const esquemaMotorSql = z.enum(['sqlite', 'postgres']).default('sqlite')
const esquemaExtensionPostgres = z.array(z.enum(['pgcrypto', 'uuid_ossp'])).optional()
const esquemaIdentidadSimulada = z
  .array(
    z.object({
      etiqueta: z.string().min(1).max(60),
      valor: z.string().min(1).max(60),
    }),
  )
  .min(2)
  .max(4)
  .optional()

export const esquemaSqlAnotado = z.object({
  tipo: z.literal('sql-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  motor: esquemaMotorSql,
  extensiones: esquemaExtensionPostgres,
  identidadSimulada: esquemaIdentidadSimulada,
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
  motor: esquemaMotorSql,
  extensiones: esquemaExtensionPostgres,
  identidadSimulada: esquemaIdentidadSimulada,
  esquemaSql: z.string().min(1).max(3000),
  consultaInicial: z.string().max(1500).default(''),
  consultaSolucion: z.string().max(1500).optional(),
})
```

- [ ] **Step 4: Correr los tests, deben pasar**

Run: `npx vitest run src/lib/laboratorio/schemas.test.ts`
Expected: PASS, incluidos los tests nuevos

- [ ] **Step 5: Correr toda la suite de schemas por si algo dependía de la forma exacta anterior**

Run: `npx vitest run src/lib/laboratorio/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts
git commit -m "feat(laboratorio): motor/extensiones/identidadSimulada en sql-anotado y sql-en-vivo"
```

---

### Task 3: Instalar PGlite y generar sus assets estáticos

**Files:**
- Modify: `package.json` (nueva dependencia)
- Create: `scripts/dev/generar-pglite-wasm.mjs`
- Create (generado, no a mano): `public/pglite.wasm`, `public/pglite.data`

**Interfaces:**
- Produces: `public/pglite.wasm` (~9.6 MB) y `public/pglite.data` (~6 MB) — Tarea 4 (`postgres-en-vivo/motor.ts`) hace `fetch('/pglite.wasm')`/`fetch('/pglite.data')` exactamente con estos nombres.

Investigación ya hecha (no hace falta repetirla, son los nombres reales confirmados en `node_modules/@electric-sql/pglite/dist/` de la versión `0.5.8`): a diferencia de `sql.js` (un único `.wasm`), PGlite necesita **dos** ficheros para arrancar — `pglite.wasm` (el módulo WebAssembly) y `pglite.data` (el snapshot inicial del sistema de ficheros de Postgres, resultado de un `initdb` ya hecho). `initdb.wasm` (también presente en `dist/`) es una herramienta de build-time para generar `pglite.data` desde cero — no hace falta en runtime, no se copia.

**Este paso lo ejecuta Claude** (el sandbox de Codex no tiene red para `npm install`).

- [ ] **Step 1: Confirmar la versión actual de PGlite antes de fijarla**

Run: `npm view @electric-sql/pglite version`
Expected: una versión (p. ej. `0.5.8`) — usa exactamente esa en el Step 2, no la de este plan si ha cambiado.

- [ ] **Step 2: Instalar la dependencia, versión exacta**

```bash
npm install @electric-sql/pglite@<versión del Step 1> --save-exact
```

- [ ] **Step 3: Confirmar que los dos ficheros necesarios existen en el paquete instalado**

Run: `ls -la node_modules/@electric-sql/pglite/dist/pglite.wasm node_modules/@electric-sql/pglite/dist/pglite.data`
Expected: los dos ficheros existen (si no, la estructura de `dist/` cambió respecto a la `0.5.8` investigada para este plan — revisa `node_modules/@electric-sql/pglite/dist/` a mano y ajusta el script del Step 4 a lo que encuentres, documentando el cambio en el commit)

- [ ] **Step 4: Escribir el script generador**

```js
// scripts/dev/generar-pglite-wasm.mjs
//
// Copia los dos ficheros que PGlite necesita en el navegador desde
// node_modules/@electric-sql/pglite/dist/ a public/ — el motor de
// Postgres (src/lib/postgres-en-vivo/motor.ts) los carga con
// fetch('/pglite.wasm') / fetch('/pglite.data'), sin depender de ningún
// CDN en producción. Mismo patrón que generar-sql-wasm.mjs, pero PGlite
// necesita DOS ficheros (a diferencia del único .wasm de sql.js):
// pglite.wasm es el módulo WebAssembly; pglite.data es el snapshot
// inicial del sistema de ficheros de Postgres (un initdb ya hecho) —
// initdb.wasm, también presente en dist/, es solo una herramienta de
// build-time para regenerar pglite.data, no hace falta en runtime.
//
// Se ejecuta una vez (o cada vez que cambie la versión de
// @electric-sql/pglite en package.json) y el resultado se comitea — no
// se regenera en cada build.
//
// Uso: npm run generar-pglite-wasm

import { createRequire } from 'node:module'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const origenWasm = require.resolve('@electric-sql/pglite/dist/pglite.wasm')
const origenData = join(dirname(origenWasm), 'pglite.data')
const directorioDestino = join(process.cwd(), 'public')

mkdirSync(directorioDestino, { recursive: true })
copyFileSync(origenWasm, join(directorioDestino, 'pglite.wasm'))
copyFileSync(origenData, join(directorioDestino, 'pglite.data'))

console.log(`generar-pglite-wasm: copiados pglite.wasm y pglite.data -> ${directorioDestino}`)
```

Nota: `require.resolve('@electric-sql/pglite/dist/pglite.wasm')` puede fallar si el `package.json` de `@electric-sql/pglite` tiene un campo `exports` cerrado que no expone `./dist/*` directamente (mismo problema real que ya apareció con `sql.js` en la feature anterior — ver `specs/features/sql-en-vivo.md`, "Checklist de implementación"). Si el `require.resolve` de arriba lanza un error de resolución, comprueba `node_modules/@electric-sql/pglite/package.json` → campo `"exports"`, y ajusta la ruta de resolución a lo que sí esté expuesto (por ejemplo, resolviendo `@electric-sql/pglite/dist/index.js` y derivando el directorio con `dirname()` en vez de resolver el `.wasm` directamente).

- [ ] **Step 5: Añadir el script a `package.json`**

Junto al script `"generar-sql-wasm"` ya existente en la sección `"scripts"`, añade:

```json
"generar-pglite-wasm": "node scripts/dev/generar-pglite-wasm.mjs"
```

- [ ] **Step 6: Ejecutarlo y confirmar que los assets aparecen en `public/`**

Run: `npm run generar-pglite-wasm && ls -la public/pglite.wasm public/pglite.data`
Expected: el script imprime la ruta de destino, y los dos ficheros existen en `public/` con tamaños de varios MB cada uno

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts/dev/generar-pglite-wasm.mjs public/pglite.wasm public/pglite.data
git commit -m "build(postgresql-en-vivo): instalar @electric-sql/pglite + script de generación de assets"
```

---

### Task 4: `src/lib/postgres-en-vivo/motor.ts` — el motor real

**Files:**
- Create: `src/lib/postgres-en-vivo/motor.ts`
- Create: `src/lib/postgres-en-vivo/motor.test.ts`

**Interfaces:**
- Consumes: `compararResultados`, `ResultadoConsulta` de `src/lib/sql-en-vivo/comparar.ts` (Tarea 1).
- Produces: `crearMotorPostgres(): Promise<MotorPostgres>` (cachea internamente — llamarla varias veces en la misma sesión del navegador no vuelve a descargar nada), `ejecutarConsultaPostgres(motor: MotorPostgres, esquemaSql: string, consulta: string, opciones?: OpcionesEjecucionPostgres): Promise<ResultadoConsulta>`, tipo `MotorPostgres`, tipo `IdentidadSimulada = { etiqueta: string; valor: string }`, tipo `ExtensionPostgres = 'pgcrypto' | 'uuid_ossp'`. Las Tareas 6 y 7 (`SqlEnVivo.tsx`/`SqlAnotado.tsx`) importan estos cuatro nombres.

Diseño validado empíricamente antes de este plan (ver "Validación" en `specs/features/postgresql-en-vivo.md`): `PGliteOptions` acepta `pgliteWasmModule: WebAssembly.Module` (un módulo ya compilado, reutilizable entre instancias) y `fsBundle: Blob`; `query(sql, params, { rowMode: 'array' })` devuelve `rows` ya como `unknown[][]` (mismo formato que `values` — sin necesidad de convertir de objetos); `exec(sql)` corre DDL multi-sentencia; **RLS solo se aplica a un rol no-superusuario** — el `esquemaSql` de cualquier bloque con `identidadSimulada` debe crear `app_user NOSUPERUSER` + sus `GRANT` + una función `auth_uid()` que lea `current_setting('myapp.current_user_id', true)` (documentarlo en la propia lección cuando se escriba, fuera de alcance de este plan).

- [ ] **Step 1: Escribir el test que falla primero — el caso simple**

```ts
// src/lib/postgres-en-vivo/motor.test.ts
import { describe, expect, it } from 'vitest'

import { crearMotorPostgres, ejecutarConsultaPostgres } from './motor'

const ESQUEMA = `
  CREATE TABLE departamentos (id serial primary key, nombre text);
  CREATE TABLE empleados (id serial primary key, nombre text, departamento_id int, salario numeric);
  INSERT INTO departamentos (nombre) VALUES ('Ingeniería'), ('Ventas');
  INSERT INTO empleados (nombre, departamento_id, salario) VALUES
    ('Ana', 1, 55000), ('Luis', 1, 62000), ('Marta', 2, 48000);
`

describe('ejecutarConsultaPostgres', () => {
  it('ejecuta un SELECT simple y devuelve columnas y filas reales', async () => {
    const motor = await crearMotorPostgres()
    const resultado = await ejecutarConsultaPostgres(
      motor,
      ESQUEMA,
      'SELECT nombre FROM empleados ORDER BY nombre',
    )

    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      expect(resultado.columns).toEqual(['nombre'])
      expect(resultado.values).toEqual([['Ana'], ['Luis'], ['Marta']])
    }
  })
})
```

- [ ] **Step 2: Correr el test, debe fallar**

Run: `npx vitest run src/lib/postgres-en-vivo/motor.test.ts`
Expected: FAIL — `Cannot find module './motor'` (el fichero no existe todavía)

- [ ] **Step 3: Implementación mínima — carga del motor (con caché) y ejecución simple**

```ts
// src/lib/postgres-en-vivo/motor.ts
//
// Motor de ejecución real de SQL en el navegador, vía PGlite (PostgreSQL
// 18 real compilado a WebAssembly). Ver specs/features/postgresql-en-vivo.md.
//
// A diferencia de sql-en-vivo/motor.ts (sql.js, síncrono), aquí toda
// consulta es asíncrona — es la propia API de PGlite.
//
// El módulo WASM compilado y el fsBundle (snapshot inicial del sistema
// de ficheros de Postgres) se cargan UNA SOLA VEZ por sesión del
// navegador y se cachean — pesan ~15 MB sin comprimir en total, frente a
// los ~700 KB de sql.js, y una misma lección puede tener varios bloques
// Postgres. Pero cada llamada a ejecutarConsultaPostgres sigue creando
// una instancia PGlite nueva a partir de ese mismo módulo/bundle ya
// cacheados — mismo aislamiento que ya garantiza sql-en-vivo/motor.ts:
// un UPDATE/DELETE de un intento no debe contaminar el siguiente.
import { PGlite } from '@electric-sql/pglite'

import { compararResultados, type ResultadoConsulta } from '@/lib/sql-en-vivo/comparar'

export { compararResultados }
export type { ResultadoConsulta }

export type ExtensionPostgres = 'pgcrypto' | 'uuid_ossp'

export interface IdentidadSimulada {
  etiqueta: string
  valor: string
}

export interface OpcionesEjecucionPostgres {
  extensiones?: ExtensionPostgres[]
  identidad?: IdentidadSimulada
}

export interface MotorPostgres {
  pgliteWasmModule: WebAssembly.Module
  fsBundle: Blob
}

async function cargarWasmModulo(): Promise<WebAssembly.Module> {
  const respuesta = await fetch('/pglite.wasm')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar pglite.wasm (${respuesta.status})`)
  }
  // Compilación no-streaming (fetch + arrayBuffer, no
  // WebAssembly.compileStreaming) a propósito: compileStreaming exige
  // que el servidor devuelva Content-Type: application/wasm exacto o
  // lanza — mismo criterio de robustez ya usado en sql-en-vivo/motor.ts,
  // que tampoco usa la variante streaming.
  return WebAssembly.compile(await respuesta.arrayBuffer())
}

async function cargarFsBundle(): Promise<Blob> {
  const respuesta = await fetch('/pglite.data')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar pglite.data (${respuesta.status})`)
  }
  return respuesta.blob()
}

let motorCacheado: Promise<MotorPostgres> | null = null

export function crearMotorPostgres(): Promise<MotorPostgres> {
  if (!motorCacheado) {
    // Se cachea la PROMESA, no solo el resultado ya resuelto — si dos
    // bloques de la misma página llaman a crearMotorPostgres() antes de
    // que la primera carga termine, deben compartir la misma descarga
    // en curso en vez de disparar dos fetch de ~15 MB en paralelo.
    motorCacheado = Promise.all([cargarWasmModulo(), cargarFsBundle()]).then(
      ([pgliteWasmModule, fsBundle]) => ({ pgliteWasmModule, fsBundle }),
    )
  }
  return motorCacheado
}

async function cargarExtensiones(
  nombres: ExtensionPostgres[] = [],
): Promise<Record<string, unknown>> {
  const extensiones: Record<string, unknown> = {}
  if (nombres.includes('pgcrypto')) {
    const { pgcrypto } = await import('@electric-sql/pglite/contrib/pgcrypto')
    extensiones.pgcrypto = pgcrypto
  }
  if (nombres.includes('uuid_ossp')) {
    const { uuid_ossp } = await import('@electric-sql/pglite/contrib/uuid_ossp')
    extensiones.uuid_ossp = uuid_ossp
  }
  return extensiones
}

export async function ejecutarConsultaPostgres(
  motor: MotorPostgres,
  esquemaSql: string,
  consulta: string,
  opciones: OpcionesEjecucionPostgres = {},
): Promise<ResultadoConsulta> {
  const extensiones = await cargarExtensiones(opciones.extensiones)
  const db = new PGlite({
    pgliteWasmModule: motor.pgliteWasmModule,
    fsBundle: motor.fsBundle,
    extensions: extensiones,
  })
  try {
    await db.exec(esquemaSql)
    if (opciones.identidad) {
      // El esquemaSql ya debe haber creado el rol app_user NOSUPERUSER +
      // sus GRANT + auth_uid() — ver el comentario de cabecera de este
      // fichero. Un superusuario (el que usa PGlite por defecto) se
      // salta RLS SIEMPRE en Postgres real, con o sin FORCE ROW LEVEL
      // SECURITY — sin este SET ROLE, ninguna política se aplicaría.
      const valorEscapado = opciones.identidad.valor.replace(/'/g, "''")
      await db.exec(`SET myapp.current_user_id = '${valorEscapado}'; SET ROLE app_user;`)
    }
    const resultado = await db.query(consulta, [], { rowMode: 'array' })
    return {
      ok: true,
      columns: resultado.fields.map((campo) => campo.name),
      values: resultado.rows as unknown[][],
    }
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : String(error) }
  } finally {
    await db.close()
  }
}
```

- [ ] **Step 4: Correr el test, debe pasar**

Run: `npx vitest run src/lib/postgres-en-vivo/motor.test.ts`
Expected: PASS, 1/1

- [ ] **Step 5: Escribir el test de RLS — el más importante de esta feature**

Añade a `src/lib/postgres-en-vivo/motor.test.ts`:

```ts
describe('RLS con identidad simulada', () => {
  const ESQUEMA_RLS = `
    CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);
    INSERT INTO posts (autor_id, titulo) VALUES
      ('ana', 'Post de Ana 1'), ('ana', 'Post de Ana 2'), ('roberto', 'Post de Roberto');
    CREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$
      SELECT current_setting('myapp.current_user_id', true);
    $$ LANGUAGE sql STABLE;
    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "solo ver los propios posts" ON posts FOR SELECT USING (autor_id = auth_uid());
    CREATE ROLE app_user NOSUPERUSER;
    GRANT USAGE ON SCHEMA public TO app_user;
    GRANT SELECT ON posts TO app_user;
  `
  const CONSULTA = 'SELECT titulo FROM posts ORDER BY titulo'

  it('cada identidad ve solo sus propias filas', async () => {
    const motor = await crearMotorPostgres()

    const comoAna = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA, {
      identidad: { etiqueta: 'Ana', valor: 'ana' },
    })
    expect(comoAna.ok).toBe(true)
    if (comoAna.ok) expect(comoAna.values).toEqual([['Post de Ana 1'], ['Post de Ana 2']])

    const comoRoberto = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA, {
      identidad: { etiqueta: 'Roberto', valor: 'roberto' },
    })
    expect(comoRoberto.ok).toBe(true)
    if (comoRoberto.ok) expect(comoRoberto.values).toEqual([['Post de Roberto']])
  })

  it('una identidad desconocida no ve ninguna fila', async () => {
    const motor = await crearMotorPostgres()
    const resultado = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA, {
      identidad: { etiqueta: 'Nadie', valor: 'nadie-conocido' },
    })
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([])
  })

  it('sin identidad (superusuario) ve todas las filas — RLS no se aplica al superusuario', async () => {
    const motor = await crearMotorPostgres()
    const resultado = await ejecutarConsultaPostgres(motor, ESQUEMA_RLS, CONSULTA)
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toHaveLength(3)
  })
})
```

- [ ] **Step 6: Correr los tests de RLS, deben pasar**

Run: `npx vitest run src/lib/postgres-en-vivo/motor.test.ts`
Expected: PASS, 4/4 (el del Step 1 + los 3 de RLS)

- [ ] **Step 7: Tests de aislamiento, error real, y extensiones**

Añade también:

```ts
describe('aislamiento entre ejecuciones', () => {
  it('un UPDATE en una ejecución no afecta a la siguiente', async () => {
    const motor = await crearMotorPostgres()
    await ejecutarConsultaPostgres(motor, ESQUEMA, "UPDATE empleados SET salario = 0 WHERE nombre = 'Ana'")
    const resultado = await ejecutarConsultaPostgres(
      motor,
      ESQUEMA,
      "SELECT salario FROM empleados WHERE nombre = 'Ana'",
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([['55000']])
  })
})

describe('errores reales', () => {
  it('devuelve un error real de Postgres en vez de reventar', async () => {
    const motor = await crearMotorPostgres()
    const resultado = await ejecutarConsultaPostgres(motor, ESQUEMA, 'SELECT * FROM tabla_falsa')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.mensaje).toContain('does not exist')
  })
})

describe('extensiones', () => {
  it('pgcrypto funciona cuando se declara', async () => {
    const motor = await crearMotorPostgres()
    const resultado = await ejecutarConsultaPostgres(
      motor,
      'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
      "SELECT digest('hola', 'sha256') IS NOT NULL AS funciona",
      { extensiones: ['pgcrypto'] },
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.values).toEqual([[true]])
  })

  it('sin declarar la extensión, CREATE EXTENSION falla', async () => {
    const motor = await crearMotorPostgres()
    const resultado = await ejecutarConsultaPostgres(
      motor,
      'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
      "SELECT 1",
    )
    expect(resultado.ok).toBe(false)
  })
})
```

Nota sobre `expect(resultado.values).toEqual([['55000']])`: PGlite devuelve los valores `numeric` como **string**, no como `number` (evita perder precisión) — a diferencia de sql.js, que sí devuelve `REAL` como `number`. Es una diferencia real de tipos entre los dos motores, documéntala si hace falta al escribir lecciones que comparen salarios/importes con `numeric`.

- [ ] **Step 8: Correr toda la suite del fichero**

Run: `npx vitest run src/lib/postgres-en-vivo/motor.test.ts`
Expected: PASS, 8/8

- [ ] **Step 9: Typecheck**

Run: `npx tsc -b --noEmit`
Expected: 0 errores

- [ ] **Step 10: Commit**

```bash
git add src/lib/postgres-en-vivo/
git commit -m "feat(postgres-en-vivo): motor.ts con PGlite real, incluida RLS con identidad simulada"
```

---

### Task 5: Ampliar palabras clave de Postgres en `resaltador.ts`

**Files:**
- Modify: `src/components/codigo/resaltador.ts:364-372`
- Modify: `src/components/codigo/resaltador.test.ts` (nuevos tests)

**Interfaces:**
- No cambia ninguna firma pública — `tokenizarSql` sigue igual, solo reconoce más palabras.

- [ ] **Step 1: Escribir el test que falla primero**

Añade a `src/components/codigo/resaltador.test.ts` (junto a los tests ya existentes del caso `'sql'`):

```ts
it('reconoce palabras clave de Postgres que no existen en SQLite', () => {
  const codigo = "ALTER TABLE t ADD COLUMN x jsonb; CREATE POLICY p ON t USING (true); GRANT SELECT ON t TO app_user;"
  const tokens = resaltar(codigo, 'sql')
  const palabrasClave = tokens.filter((t) => t.tipo === 'palabra-clave').map((t) => t.texto)

  expect(palabrasClave).toContain('JSONB')
  expect(palabrasClave).toContain('POLICY')
  expect(palabrasClave).toContain('GRANT')
  expect(palabrasClave).toContain('ROLE')
})

it('sigue cumpliendo el invariante de reconstrucción exacta con vocabulario Postgres', () => {
  const codigo = "CREATE ROLE app_user NOSUPERUSER; CREATE MATERIALIZED VIEW v AS SELECT 1 RETURNING id;"
  const tokens = resaltar(codigo, 'sql')
  expect(tokens.map((t) => t.texto).join('')).toBe(codigo)
})
```

(Ajusta los nombres exactos de la función exportada — `resaltar`/tipo de token `'palabra-clave'`/campo `texto` — a los que ya usan los tests existentes de este mismo fichero; cópialos de un `it` ya existente del caso `'sql'` en vez de adivinarlos, para que coincidan exactamente con la API real ya probada.)

- [ ] **Step 2: Correr los tests, deben fallar**

Run: `npx vitest run src/components/codigo/resaltador.test.ts`
Expected: FAIL — `JSONB`/`POLICY`/`GRANT`/`ROLE` no están en `palabrasClave` (`ALTER`/`ADD`/`COLUMN`/`TABLE`/`ON`/`TO` ya sí lo estarán, si ya estaban en la lista — verifica cuáles de la frase de prueba ya reconocía antes de escribir el test, para que el test falle específicamente por las palabras nuevas, no por otras)

- [ ] **Step 3: Ampliar `PALABRAS_CLAVE_SQL`**

En `src/components/codigo/resaltador.ts:364-372`, añade a la lista ya existente (sin quitar ninguna de las actuales):

```ts
const PALABRAS_CLAVE_SQL = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'IS', 'NULL', 'DISTINCT', 'LIMIT', 'OFFSET', 'ASC', 'DESC', 'UNION', 'ALL', 'EXISTS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'INSERT', 'INTO', 'VALUES', 'UPDATE',
  'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'PRIMARY', 'KEY', 'FOREIGN',
  'REFERENCES', 'DEFAULT', 'UNIQUE', 'CHECK', 'INDEX', 'VIEW', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX',
  // Vocabulario de PostgreSQL sin equivalente en SQLite (motor: 'postgres')
  'JSONB', 'RETURNING', 'POLICY', 'ROLE', 'GRANT', 'REVOKE', 'MATERIALIZED',
  'PARTITION', 'FUNCTION', 'PROCEDURE', 'TRIGGER', 'BEFORE', 'AFTER', 'FOR', 'EACH',
  'ROW', 'EXTENSION', 'SEQUENCE', 'SUPERUSER', 'NOSUPERUSER', 'LOGIN', 'ENABLE',
  'USING', 'ARRAY', 'ENUM',
])
```

- [ ] **Step 4: Correr los tests, deben pasar**

Run: `npx vitest run src/components/codigo/resaltador.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/codigo/resaltador.ts src/components/codigo/resaltador.test.ts
git commit -m "feat(resaltador): vocabulario de PostgreSQL en el tokenizador SQL"
```

---

### Task 6: `SqlEnVivo.tsx` — branch por motor + identidad simulada

**Files:**
- Modify: `src/components/bloques-laboratorio/SqlEnVivo.tsx`

**Interfaces:**
- Consumes: `crearMotorPostgres`, `ejecutarConsultaPostgres`, `type MotorPostgres`, `type IdentidadSimulada` de `@/lib/postgres-en-vivo/motor` (Tarea 4); `motor`, `extensiones`, `identidadSimulada` como nuevos campos de `DatosSqlEnVivo` (Tarea 2).

- [ ] **Step 1: Añadir los imports del motor de Postgres y los nuevos props**

En `src/components/bloques-laboratorio/SqlEnVivo.tsx:9-15`, junto al import ya existente de `sql-en-vivo/motor`, añade:

```ts
import {
  crearMotorPostgres,
  ejecutarConsultaPostgres,
  type IdentidadSimulada,
  type MotorPostgres,
} from '@/lib/postgres-en-vivo/motor'
```

Y cambia la firma de la función (línea 121) de:

```ts
export function SqlEnVivo({
  consigna,
  esquemaSql,
  consultaInicial,
  consultaSolucion,
}: DatosSqlEnVivo) {
```

a:

```ts
export function SqlEnVivo({
  consigna,
  motor: tipoMotor,
  extensiones,
  identidadSimulada,
  esquemaSql,
  consultaInicial,
  consultaSolucion,
}: DatosSqlEnVivo) {
```

- [ ] **Step 2: Reemplazar el estado y los dos `useEffect` de carga/ejecución**

Reemplaza el bloque completo desde `const [consulta, setConsulta] = useState(consultaInicial)` (línea 127) hasta el cierre del segundo `useEffect` (línea 160) por:

```ts
  const [consulta, setConsulta] = useState(consultaInicial)
  const [identidad, setIdentidad] = useState<IdentidadSimulada | undefined>(identidadSimulada?.[0])
  const [motorSql, setMotorSql] = useState<MotorSql | null>(null)
  const [motorPostgres, setMotorPostgres] = useState<MotorPostgres | null>(null)
  const [estadoMotor, setEstadoMotor] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)

  useEffect(() => {
    let cancelado = false
    const carga =
      tipoMotor === 'postgres'
        ? crearMotorPostgres().then((m) => {
            if (!cancelado) setMotorPostgres(m)
          })
        : crearMotorSql().then((m) => {
            if (!cancelado) setMotorSql(m)
          })
    carga
      .then(() => {
        if (!cancelado) setEstadoMotor('listo')
      })
      .catch(() => {
        if (!cancelado) setEstadoMotor('error')
      })
    return () => {
      cancelado = true
    }
  }, [tipoMotor])

  useEffect(() => {
    if (estadoMotor !== 'listo') return
    let cancelado = false
    const temporizador = window.setTimeout(() => {
      const texto = consulta.trim()
      if (!texto) {
        setResultado(null)
        return
      }
      if (tipoMotor === 'postgres' && motorPostgres) {
        ejecutarConsultaPostgres(motorPostgres, esquemaSql, texto, { extensiones, identidad }).then(
          (resultadoEjecucion) => {
            if (!cancelado) setResultado(resultadoEjecucion)
          },
        )
      } else if (motorSql) {
        setResultado(ejecutarConsulta(motorSql, esquemaSql, texto))
      }
    }, RETRASO_EJECUCION_MS)

    return () => {
      cancelado = true
      window.clearTimeout(temporizador)
    }
  }, [consulta, motorSql, motorPostgres, esquemaSql, tipoMotor, extensiones, identidad, estadoMotor])
```

El `cancelado` del segundo efecto es necesario porque `ejecutarConsultaPostgres` es asíncrona (a diferencia de `ejecutarConsulta` de sql.js, que es síncrona): sin ese guard, una consulta lenta que ya quedó obsoleta (el alumno siguió escribiendo) podría resolver DESPUÉS de una más reciente y pisar su resultado en pantalla.

- [ ] **Step 3: Actualizar el cálculo de `solucion` (línea 162-165) para el caso Postgres**

Reemplaza:

```ts
  const solucion = useMemo(() => {
    if (!motor || !consultaSolucion) return null
    return ejecutarConsulta(motor, esquemaSql, consultaSolucion)
  }, [motor, esquemaSql, consultaSolucion])
```

por:

```ts
  const [solucion, setSolucion] = useState<ResultadoConsulta | null>(null)

  useEffect(() => {
    if (!consultaSolucion) {
      setSolucion(null)
      return
    }
    let cancelado = false
    if (tipoMotor === 'postgres' && motorPostgres) {
      ejecutarConsultaPostgres(motorPostgres, esquemaSql, consultaSolucion, {
        extensiones,
        identidad,
      }).then((resultadoEjecucion) => {
        if (!cancelado) setSolucion(resultadoEjecucion)
      })
    } else if (motorSql) {
      setSolucion(ejecutarConsulta(motorSql, esquemaSql, consultaSolucion))
    }
    return () => {
      cancelado = true
    }
  }, [motorSql, motorPostgres, esquemaSql, consultaSolucion, tipoMotor, extensiones, identidad])
```

(Esto cambia `solucion` de un `useMemo` a estado + efecto porque el caso Postgres es asíncrono — un `useMemo` no puede esperar una Promise. Quita el `useMemo` de la lista de imports de React en la línea 4 si ya no se usa en ningún otro punto del fichero — comprueba antes de quitarlo.)

- [ ] **Step 4: Añadir el selector de identidad simulada en el JSX**

Justo antes de `<EditorSql valor={consulta} onChange={setConsulta} />` (dentro del bloque `{estadoMotor === 'listo' && (...)}`, línea 213), añade:

```tsx
          {identidadSimulada && identidadSimulada.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="sql-en-vivo-identidad" className="text-sm font-medium">
                Estás conectado como
              </label>
              <select
                id="sql-en-vivo-identidad"
                value={identidad?.valor ?? ''}
                onChange={(evento) => {
                  const elegida = identidadSimulada.find((i) => i.valor === evento.target.value)
                  setIdentidad(elegida)
                }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {identidadSimulada.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}
```

- [ ] **Step 5: Confirmar que todo compila**

Run: `npx tsc -b --noEmit`
Expected: 0 errores

- [ ] **Step 6: Commit**

```bash
git add src/components/bloques-laboratorio/SqlEnVivo.tsx
git commit -m "feat(SqlEnVivo): soporte motor postgres + selector de identidad simulada"
```

---

### Task 7: `SqlAnotado.tsx` — branch por motor + identidad simulada

**Files:**
- Modify: `src/components/bloques-laboratorio/SqlAnotado.tsx`

**Interfaces:**
- Consumes: igual que Tarea 6 — `crearMotorPostgres`, `ejecutarConsultaPostgres` de `@/lib/postgres-en-vivo/motor`.

- [ ] **Step 1: Añadir imports y nuevos props**

En `src/components/bloques-laboratorio/SqlAnotado.tsx:8-13`, junto al import ya existente, añade:

```ts
import { crearMotorPostgres, ejecutarConsultaPostgres, type IdentidadSimulada } from '@/lib/postgres-en-vivo/motor'
```

Cambia la firma (línea 16) de:

```ts
export function SqlAnotado({ titulo, esquemaSql, consulta, anotaciones }: DatosSqlAnotado) {
```

a:

```ts
export function SqlAnotado({
  titulo,
  motor: tipoMotor,
  extensiones,
  identidadSimulada,
  esquemaSql,
  consulta,
  anotaciones,
}: DatosSqlAnotado) {
```

- [ ] **Step 2: Añadir estado de identidad y reemplazar el `useEffect` de ejecución**

Justo después de `const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)` (línea 36), añade:

```ts
  const [identidad] = useState<IdentidadSimulada | undefined>(identidadSimulada?.[0])
```

(`SqlAnotado` no es editable — a diferencia de `SqlEnVivo`, no hace falta un selector que cambie la identidad dinámicamente en esta primera versión; una demostración fija con una única identidad ya deja claro el mecanismo. Si una lección concreta necesita mostrar dos identidades a la vez, se resuelve con dos bloques `sql-anotado` distintos, uno por identidad — no añadas un selector aquí sin que una lección real lo pida.)

Reemplaza el `useEffect` (líneas 38-56) por:

```ts
  useEffect(() => {
    let cancelado = false
    const ejecutar = async () => {
      try {
        if (tipoMotor === 'postgres') {
          const motor = await crearMotorPostgres()
          if (cancelado) return
          setResultado(
            await ejecutarConsultaPostgres(motor, esquemaSql, consulta, { extensiones, identidad }),
          )
        } else {
          const motor = await crearMotorSql()
          if (cancelado) return
          setResultado(ejecutarConsulta(motor, esquemaSql, consulta))
        }
      } catch (error) {
        if (!cancelado) {
          setResultado({
            ok: false,
            mensaje: error instanceof Error ? error.message : 'No se pudo cargar el motor SQL.',
          })
        }
      }
    }
    void ejecutar()
    return () => {
      cancelado = true
    }
  }, [esquemaSql, consulta, tipoMotor, extensiones, identidad])
```

Necesitarás también añadir el import de `crearMotorSql`/`ejecutarConsulta` que ya existe (línea 9-13) — no lo quites, sigue haciendo falta para el caso `sqlite`.

- [ ] **Step 3: Confirmar que todo compila**

Run: `npx tsc -b --noEmit`
Expected: 0 errores

- [ ] **Step 4: Commit**

```bash
git add src/components/bloques-laboratorio/SqlAnotado.tsx
git commit -m "feat(SqlAnotado): soporte motor postgres"
```

---

### Task 8: Registrar en el catálogo de referencia con un ejemplo real de RLS

**Files:**
- Modify: `src/routes/AdminReferenciaContenidoPage.tsx:465-497`

**Interfaces:**
- No produce nada nuevo — es contenido de ejemplo para verificación visual (Tarea 9).

- [ ] **Step 1: Añadir dos bloques nuevos junto a los de `SqlAnotado`/`SqlEnVivo` ya existentes**

Justo antes de `</GrupoCatalogo>` (línea 498), añade:

```tsx
        <Referencia nombre="SqlAnotado (motor postgres)">
          <SqlAnotado
            tipo="sql-anotado"
            motor="postgres"
            esquemaSql="CREATE TABLE eventos (id serial primary key, datos jsonb); INSERT INTO eventos (datos) VALUES ('{\"tipo\": \"click\", \"x\": 10}'), ('{\"tipo\": \"scroll\"}');"
            consulta="SELECT datos->>'tipo' AS tipo FROM eventos WHERE datos ? 'x'"
            anotaciones={[
              {
                fragmento: "datos->>'tipo'",
                nota: 'JSONB, no JSON: Postgres lo guarda en binario, no como texto — por eso admite índices GIN y operadores como ? (¿existe esta clave?).',
              },
            ]}
          />
        </Referencia>

        <Referencia nombre="SqlEnVivo (motor postgres + RLS con identidad simulada)">
          <SqlEnVivo
            tipo="sql-en-vivo"
            motor="postgres"
            consigna='Cambia de identidad arriba y comprueba que cada quien ve solo sus propios posts.'
            esquemaSql={
              "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null); " +
              "INSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana 1'), ('ana', 'Post de Ana 2'), ('roberto', 'Post de Roberto'); " +
              "CREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE; " +
              "ALTER TABLE posts ENABLE ROW LEVEL SECURITY; " +
              "CREATE POLICY \"solo ver los propios posts\" ON posts FOR SELECT USING (autor_id = auth_uid()); " +
              "CREATE ROLE app_user NOSUPERUSER; GRANT USAGE ON SCHEMA public TO app_user; GRANT SELECT ON posts TO app_user;"
            }
            identidadSimulada={[
              { etiqueta: 'Ana', valor: 'ana' },
              { etiqueta: 'Roberto', valor: 'roberto' },
            ]}
            consultaInicial="SELECT titulo FROM posts ORDER BY titulo"
            consultaSolucion="SELECT titulo FROM posts ORDER BY titulo"
          />
        </Referencia>
```

- [ ] **Step 2: Confirmar que compila**

Run: `npx tsc -b --noEmit`
Expected: 0 errores

- [ ] **Step 3: Commit**

```bash
git add src/routes/AdminReferenciaContenidoPage.tsx
git commit -m "feat(referencia): ejemplos de sql-anotado/sql-en-vivo con motor postgres y RLS"
```

---

### Task 9: Verificación visual real (Playwright) — la hace Claude, no Codex

**Files:** ninguno (verificación, no código)

- [ ] **Step 1: Arrancar el servidor de desarrollo**

Run: `npm run dev` (en segundo plano)

- [ ] **Step 2: Login como admin y capturar `/admin/referencia-contenido` en claro y oscuro**

Con Playwright (credenciales reales de admin, pedidas al usuario si hace falta — nunca escritas a fichero, solo variables de entorno de un script efímero), navega a `/admin/referencia-contenido`, espera a que los dos bloques nuevos terminen de cargar el motor (dan varios segundos más que sql.js — PGlite pesa más), y haz capturas de pantalla completas en modo claro y oscuro. Confirma:
- El bloque `SqlAnotado (motor postgres)` muestra una tabla de resultado real con la columna `tipo` y el valor `click` (JSONB funcionando).
- El bloque `SqlEnVivo (motor postgres + RLS...)` muestra el selector "Estás conectado como" con las opciones Ana/Roberto.

- [ ] **Step 3: La captura clave — cambiar de identidad y confirmar que el resultado cambia de verdad**

Con el mismo script Playwright: selecciona "Ana" en el selector de identidad del bloque `SqlEnVivo (motor postgres...)`, espera al debounce + ejecución, captura el resultado (debe mostrar "Post de Ana 1"/"Post de Ana 2"). Cambia el selector a "Roberto", espera, captura de nuevo (debe mostrar solo "Post de Roberto"). Confirma en el propio script (no solo visualmente) que los dos resultados capturados son distintos — esta es la prueba de que `SET ROLE`/RLS funciona de verdad en la aplicación, no solo en el test aislado de la Tarea 4.

- [ ] **Step 4: Confirmar cero errores de página/consola**

El script debe escuchar `page.on('pageerror', ...)` durante toda la navegación y las interacciones, e imprimir la lista al final — debe estar vacía.

- [ ] **Step 5: Correr la suite completa**

Run: `npm run build && npm run lint && npm run test`
Expected: los tres en verde

---

## Self-Review

**1. Cobertura del spec:** motor PGlite con caché de módulo (Tarea 4) ✓; extensión de schemas retrocompatible (Tarea 2) ✓; RLS con `identidadSimulada` y el hallazgo de `SET ROLE`/superusuario (Tarea 4, Step 5) ✓; reutilización de `compararResultados` sin duplicar (Tarea 1) ✓; script de generación de assets con los nombres reales investigados (Tarea 3) ✓; palabras clave nuevas en el tokenizador (Tarea 5) ✓; los dos componentes con branch por motor (Tareas 6-7) ✓; verificación visual con la captura de RLS como prueba central (Tarea 9) ✓. Fuera de alcance explícito y correctamente excluido: tecnología "PostgreSQL" en el catálogo y contenido de `contenido/postgresql/` (se hacen después, sin plan formal, como dice el spec).

**2. Placeholders:** ninguno — cada paso de código tiene el código real, cada comando es el comando real a ejecutar.

**3. Consistencia de tipos:** `MotorPostgres`, `IdentidadSimulada`, `ExtensionPostgres`, `OpcionesEjecucionPostgres`, `crearMotorPostgres`, `ejecutarConsultaPostgres` se definen todos en la Tarea 4 y se usan con el mismo nombre exacto en las Tareas 6-8. `ResultadoConsulta`/`compararResultados` se definen en la Tarea 1 y se re-exportan sin cambiar de nombre desde ambos motores.

## Execution Handoff

Plan completo y guardado en `docs/superpowers/plans/2026-08-31-postgresql-en-vivo.md`. Dos opciones de ejecución:

**1. Subagent-Driven (recomendado)** — despliego un subagente fresco por tarea, con revisión entre tareas.

**2. Inline Execution** — ejecuto las tareas en esta sesión, por lotes con checkpoints de revisión.

¿Cuál prefieres?
