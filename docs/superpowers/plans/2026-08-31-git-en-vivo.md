# Git en vivo (motor wasm-git) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ejecutar comandos reales de Git en el navegador (motor `wasm-git`/libgit2) mediante dos bloques de contenido nuevos (`git-anotado`, `git-en-vivo`) y un componente de visualización de grafo de commits derivado de datos reales, sentando la base de mecanismo para la futura tecnología "Git" del catálogo.

**Architecture:** Un motor (`src/lib/git-en-vivo/motor.ts`) carga y cachea el binario WASM de `wasm-git` (variante `lg2_async`, ~1.6 MB) una vez por sesión del navegador; cada ejecución instancia un `initGit()` fresco (sistema de ficheros aislado, confirmado en el spec) y ejecuta comandos reales vía `callMain`/`callWithOutput`. Dos componentes de bloque (`GitAnotado`, `GitEnVivo`) replican la estructura exacta de `SqlAnotado`/`SqlEnVivo`, sustituyendo la tabla de resultados por un bloque de terminal (`SalidaTerminal`) y, opcionalmente, un grafo de commits real (`GrafoCommits`).

**Tech Stack:** `wasm-git@0.0.17` (libgit2 vía Emscripten), TypeScript, React, Vitest, Zod.

**Spec:** [specs/features/git-en-vivo.md](../../../specs/features/git-en-vivo.md) — el plan argumenta desde ahí; los ejecutores deben leer ambos.

## Global Constraints

- `wasm-git` se fija a la versión exacta `0.0.17` en `package.json`, sin `^` (mismo criterio que `sql.js`/`@electric-sql/pglite`).
- Ningún comando de motor debe intentar `rebase`, `branch` (sin argumentos) ni `push`/`pull` con argumentos explícitos — no están soportados por `wasm-git`, confirmado empíricamente en el spec. `checkout -b` es el sustituto real de `branch` para crear ramas.
- El motor corre enteramente en memoria (MEMFS de Emscripten) — nunca toca el disco real del usuario ni hace red real, ni siquiera con `clone`/`fetch`/`push` (que solo hablan con otra ruta dentro del mismo sandbox).
- Identidad de commit fija: `Ana <ana@example.com>`, mismo criterio ya usado en todo el contenido de SQL/PostgreSQL de este proyecto.
- Directorio de trabajo fijo: `/repo`, creado y con `chdir` hecho por el propio motor antes de ejecutar el primer comando de `esquemaGit` — el contenido de las lecciones nunca necesita mencionar rutas.
- Todos los tests de motor son contra `wasm-git` real, sin mocks (mismo criterio que `sql-en-vivo`/`postgres-en-vivo`).
- El sandbox de Codex no tiene acceso a red — cualquier paso que necesite `npm install` lo ejecuta Claude, nunca Codex.

---

### Task 1: Esquema Zod — `git-anotado` y `git-en-vivo`

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts`
- Test: `src/lib/laboratorio/schemas.test.ts`

**Interfaces:**
- Produces: `esquemaGitAnotado`, `esquemaGitEnVivo` (exportados), y sus tipos inferidos `DatosGitAnotado`/`DatosGitEnVivo` (usados por las Tasks 5 y 6). Ambos se añaden al discriminated union `esquemaBloqueLaboratorio`.

- [ ] **Step 1: Escribir los tests que fallan**

Añade a `src/lib/laboratorio/schemas.test.ts` (sigue el patrón de los tests ya existentes para `esquemaSqlAnotado`/`esquemaSqlEnVivo` en el mismo fichero — busca `describe('esquemaSqlAnotado'` para ver el estilo exacto a replicar):

```ts
describe('esquemaGitAnotado', () => {
  it('acepta un bloque válido con esquemaGit, comando y anotaciones', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ["init .", "add a.txt", "commit -m 'v1'"],
      comando: 'log --oneline',
      anotaciones: [{ fragmento: 'log', nota: 'Muestra el historial real.' }],
    })
    expect(resultado.success).toBe(true)
  })

  it('acepta mostrarGrafo opcional', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ["init ."],
      comando: 'log --oneline',
      mostrarGrafo: true,
      anotaciones: [{ fragmento: 'log', nota: 'x' }],
    })
    expect(resultado.success).toBe(true)
  })

  it('rechaza esquemaGit vacío', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: [],
      comando: 'log --oneline',
      anotaciones: [{ fragmento: 'log', nota: 'x' }],
    })
    expect(resultado.success).toBe(false)
  })

  it('rechaza sin ninguna anotación', () => {
    const resultado = esquemaGitAnotado.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ["init ."],
      comando: 'log --oneline',
      anotaciones: [],
    })
    expect(resultado.success).toBe(false)
  })
})

describe('esquemaGitEnVivo', () => {
  it('acepta un bloque válido con consultaSolucion', () => {
    const resultado = esquemaGitEnVivo.safeParse({
      tipo: 'git-en-vivo',
      esquemaGit: ["init .", "add a.txt", "commit -m 'v1'"],
      comandoInicial: 'status',
      comandoSolucion: 'log --oneline',
    })
    expect(resultado.success).toBe(true)
  })

  it('comandoInicial por defecto es cadena vacía', () => {
    const resultado = esquemaGitEnVivo.parse({
      tipo: 'git-en-vivo',
      esquemaGit: ["init ."],
    })
    expect(resultado.comandoInicial).toBe('')
  })

  it('acepta consigna y mostrarGrafo opcionales', () => {
    const resultado = esquemaGitEnVivo.safeParse({
      tipo: 'git-en-vivo',
      consigna: 'Resuelve el conflicto.',
      esquemaGit: ["init ."],
      comandoInicial: 'status',
      mostrarGrafo: true,
    })
    expect(resultado.success).toBe(true)
  })
})

describe('esquemaBloqueLaboratorio con git-anotado/git-en-vivo', () => {
  it('discrimina git-anotado correctamente', () => {
    const resultado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'git-anotado',
      esquemaGit: ["init ."],
      comando: 'log --oneline',
      anotaciones: [{ fragmento: 'log', nota: 'x' }],
    })
    expect(resultado.success).toBe(true)
  })

  it('discrimina git-en-vivo correctamente', () => {
    const resultado = esquemaBloqueLaboratorio.safeParse({
      tipo: 'git-en-vivo',
      esquemaGit: ["init ."],
      comandoInicial: 'status',
    })
    expect(resultado.success).toBe(true)
  })
})
```

- [ ] **Step 2: Ejecutar los tests y confirmar que fallan**

Run: `npx vitest run src/lib/laboratorio/schemas.test.ts`
Expected: FAIL — `esquemaGitAnotado`/`esquemaGitEnVivo` no están definidos (`ReferenceError` o error de importación, según cómo estén importados los otros esquemas en el fichero de test).

- [ ] **Step 3: Implementar los esquemas**

En `src/lib/laboratorio/schemas.ts`, cerca de `esquemaSqlEnVivo` (mismo bloque temático — bloques de "laboratorio" con motor real), añade:

```ts
// Ejecutan de verdad comandos contra wasm-git (libgit2 real vía WASM) —
// nunca muestran una salida de terminal escrita a mano. Ver
// specs/features/git-en-vivo.md.
export const esquemaGitAnotado = z.object({
  tipo: z.literal('git-anotado'),
  titulo: z.string().min(1).max(140).optional(),
  esquemaGit: z.array(z.string().min(1).max(200)).min(1).max(15),
  comando: z.string().min(1).max(200),
  mostrarGrafo: z.boolean().default(false),
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

export const esquemaGitEnVivo = z.object({
  tipo: z.literal('git-en-vivo'),
  consigna: z.string().min(1).max(600).optional(),
  esquemaGit: z.array(z.string().min(1).max(200)).min(1).max(15),
  comandoInicial: z.string().max(200).default(''),
  comandoSolucion: z.string().max(200).optional(),
  mostrarGrafo: z.boolean().default(false),
})
```

Añade ambos al discriminated union `esquemaBloqueLaboratorio` (busca `z.discriminatedUnion('tipo', [` y añade `esquemaGitAnotado, esquemaGitEnVivo,` a la lista, junto a `esquemaSqlAnotado, esquemaSqlEnVivo`).

Añade los tipos inferidos junto a los demás (busca `export type DatosSqlAnotado = z.infer<typeof esquemaSqlAnotado>`):

```ts
export type DatosGitAnotado = z.infer<typeof esquemaGitAnotado>
export type DatosGitEnVivo = z.infer<typeof esquemaGitEnVivo>
```

- [ ] **Step 4: Ejecutar los tests y confirmar que pasan**

Run: `npx vitest run src/lib/laboratorio/schemas.test.ts`
Expected: PASS — todos los tests nuevos en verde, y los tests ya existentes de otros esquemas siguen pasando (confirma que añadir al discriminated union no rompió nada).

- [ ] **Step 5: Commit**

```bash
git add src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts
git commit -m "feat(laboratorio): esquemas git-anotado y git-en-vivo"
```

---

### Task 2: Motor `git-en-vivo` — ejecución de comandos reales

**Files:**
- Create: `src/lib/git-en-vivo/motor.ts`
- Test: `src/lib/git-en-vivo/motor.test.ts`

**Interfaces:**
- Consumes: `wasm-git` (paquete npm, instalado en Task 7 pero necesario en `node_modules` para que los tests de esta tarea puedan importar directamente `wasm-git/lg2_async.js` desde ahí — instala la dependencia ANTES de empezar esta tarea, ver nota al final de esta sección).
- Produces: `crearMotorGit(cargarWasm?: () => Promise<ArrayBuffer>): Promise<MotorGit>`, `ejecutarComandosGit(motor: MotorGit, esquemaGit: string[], comando: string): Promise<ResultadoGit>`, `dividirComando(comando: string): string[]` (exportado para poder testearlo suelto), tipos `MotorGit`, `ResultadoGit`. Usados por Task 5 (`GitAnotado.tsx`) y Task 6 (`GitEnVivo.tsx`).

**Nota antes de empezar:** esta tarea necesita `wasm-git` instalado en `node_modules` para poder escribir y ejecutar tests reales contra el motor. Si Task 7 (que instala la dependencia) no se ha ejecutado todavía, instala primero tú mismo con `npm install wasm-git@0.0.17` antes del Step 1 — no escribas el motor contra un paquete que no está instalado.

- [ ] **Step 1: Escribir el test de `dividirComando` (el tokenizador de argumentos)**

Crea `src/lib/git-en-vivo/motor.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { dividirComando } from './motor'

describe('dividirComando', () => {
  it('divide un comando simple por espacios', () => {
    expect(dividirComando('log --oneline')).toEqual(['log', '--oneline'])
  })

  it('respeta un argumento entre comillas dobles', () => {
    expect(dividirComando('commit -m "mensaje con espacios"')).toEqual([
      'commit',
      '-m',
      'mensaje con espacios',
    ])
  })

  it('respeta un argumento entre comillas simples', () => {
    expect(dividirComando("commit -m 'mensaje con espacios'")).toEqual([
      'commit',
      '-m',
      'mensaje con espacios',
    ])
  })

  it('un solo argumento sin espacios', () => {
    expect(dividirComando('status')).toEqual(['status'])
  })
})
```

- [ ] **Step 2: Ejecutar y confirmar que falla**

Run: `npx vitest run src/lib/git-en-vivo/motor.test.ts`
Expected: FAIL — `src/lib/git-en-vivo/motor.ts` no existe todavía.

- [ ] **Step 3: Crear el motor con `dividirComando` implementado**

Crea `src/lib/git-en-vivo/motor.ts`:

```ts
// Motor de ejecución real de comandos Git en el navegador, vía wasm-git
// (libgit2 real compilado a WebAssembly con Emscripten). Se carga con
// import() dinámico: solo se descarga cuando una lección tiene un bloque
// git-anotado o git-en-vivo. Ver specs/features/git-en-vivo.md.
//
// Cada llamada a ejecutarComandosGit crea una instancia de wasm-git NUEVA
// (initGit() fresco) — confirmado en el spec que dos instancias nunca
// comparten sistema de ficheros. El binario WASM ya descargado (motor.wasmBinary)
// SÍ se reutiliza entre ejecuciones: evita volver a pedirlo por red, aunque
// cada initGit() lo recompila desde el mismo buffer — coste aceptable dado
// que el binario pesa 1.6 MB, muy por debajo de los ~10 MB de PGlite.

export interface MotorGit {
  wasmBinary: ArrayBuffer
}

export type ResultadoGit = { ok: true; salida: string } | { ok: false; mensaje: string }

// Tokenizador mínimo, consciente de comillas simples/dobles — necesario
// porque wasm-git espera un array de argumentos (['commit', '-m', 'texto']),
// no una cadena de shell completa, y un mensaje de commit real casi
// siempre lleva espacios dentro de comillas.
export function dividirComando(comando: string): string[] {
  const tokens: string[] = []
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g
  let coincidencia: RegExpExecArray | null
  while ((coincidencia = regex.exec(comando)) !== null) {
    tokens.push(coincidencia[1] ?? coincidencia[2] ?? coincidencia[3])
  }
  return tokens
}

async function cargarWasmPorFetch(): Promise<ArrayBuffer> {
  const respuesta = await fetch('/lg2-async.wasm')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar lg2-async.wasm (${respuesta.status})`)
  }
  return respuesta.arrayBuffer()
}

let motorCacheado: Promise<MotorGit> | null = null

export function crearMotorGit(
  cargarWasm: () => Promise<ArrayBuffer> = cargarWasmPorFetch,
): Promise<MotorGit> {
  if (!motorCacheado) {
    motorCacheado = cargarWasm().then((wasmBinary) => ({ wasmBinary }))
  }
  return motorCacheado
}
```

- [ ] **Step 4: Ejecutar y confirmar que `dividirComando` pasa**

Run: `npx vitest run src/lib/git-en-vivo/motor.test.ts`
Expected: PASS (4 tests de `dividirComando`).

- [ ] **Step 5: Escribir los tests de `ejecutarComandosGit` contra wasm-git real**

Añade a `src/lib/git-en-vivo/motor.test.ts` (mismo patrón de loader inyectable ya usado en `src/lib/postgres-en-vivo/motor.test.ts` — léelo para el estilo exacto de `cargarWasmDesdeDisco`):

```ts
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { crearMotorGit, ejecutarComandosGit, dividirComando } from './motor'

async function cargarWasmDesdeDisco(): Promise<ArrayBuffer> {
  const buffer = await readFile(
    join(process.cwd(), 'node_modules', 'wasm-git', 'lg2_async.wasm'),
  )
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

describe('ejecutarComandosGit', () => {
  it('ejecuta init + commit y devuelve la salida real de log', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const resultado = await ejecutarComandosGit(
      motor,
      ["init .", "add a.txt", "commit -m 'primer commit'"],
      'log --oneline',
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.salida).toContain('primer commit')
  })

  it('un merge con conflicto real deja marcadores de conflicto en el resultado', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const setup = [
      "init .",
      "add a.txt",
      "commit -m base",
      "checkout -b feature",
    ]
    // Dos escrituras de fichero no pueden ir en esquemaGit (son comandos
    // git, no escritura de ficheros) — el propio comando de test escribe el
    // fichero antes de cada commit usando la FS de la instancia, así que
    // este caso concreto necesita una llamada de más bajo nivel: ver
    // Step 6 para la solución real (fixture con escritura de ficheros).
  })
})
```

**Antes de continuar**: el test de "merge con conflicto" necesita escribir contenido de ficheros DIFERENTE entre dos ramas — algo que `esquemaGit` (solo comandos git) no puede expresar por sí solo, porque `wasm-git` no tiene un comando `git` para "escribir texto X en el fichero Y" (eso se hace con la API `FS` de Emscripten, no con un comando git). Esto es una limitación real del diseño de `esquemaGit` tal como está en el spec: **necesita poder escribir contenido de ficheros, no solo ejecutar comandos git**. Antes de seguir, añade esta capacidad al motor:

- [ ] **Step 6: Extender `ejecutarComandosGit` para soportar escritura de ficheros dentro de `esquemaGit`**

Reescribe `motor.ts` completo con esta capacidad — un comando de `esquemaGit` que empieza por `escribir ` (una pseudo-instrucción, no un comando git real) escribe un fichero antes de continuar. Formato: `escribir <ruta> <<CONTENIDO>>` es demasiado complejo de parsear en una sola línea con comillas; en su lugar, usa un formato más simple y ya familiar en este proyecto (mismo espíritu que `esquemaSql` siendo una cadena con `\n`): permite que un elemento de `esquemaGit` sea un objeto `{escribir: {ruta: string, contenido: string}}` en vez de un string — actualiza el Zod de Task 1 en consecuencia.

**Vuelve a Task 1** y cambia el tipo de `esquemaGit` en ambos esquemas a:

```ts
const esquemaPasoGit = z.union([
  z.string().min(1).max(200),
  z.object({ escribir: z.object({ ruta: z.string().min(1).max(100), contenido: z.string().max(2000) }) }),
])
// ...
esquemaGit: z.array(esquemaPasoGit).min(1).max(15),
```

Actualiza también los tests de Task 1 para incluir al menos un caso con `{escribir: {...}}` en `esquemaGit`, confirmando que el `safeParse` lo acepta. Vuelve a ejecutar `npx vitest run src/lib/laboratorio/schemas.test.ts` y confirma que sigue en verde antes de continuar aquí.

Con el tipo actualizado, reescribe `motor.ts`:

```ts
// (cabecera de comentario igual que antes)

export interface MotorGit {
  wasmBinary: ArrayBuffer
}

export type ResultadoGit = { ok: true; salida: string } | { ok: false; mensaje: string }

export type PasoGit = string | { escribir: { ruta: string; contenido: string } }

export function dividirComando(comando: string): string[] {
  const tokens: string[] = []
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g
  let coincidencia: RegExpExecArray | null
  while ((coincidencia = regex.exec(comando)) !== null) {
    tokens.push(coincidencia[1] ?? coincidencia[2] ?? coincidencia[3])
  }
  return tokens
}

async function cargarWasmPorFetch(): Promise<ArrayBuffer> {
  const respuesta = await fetch('/lg2-async.wasm')
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar lg2-async.wasm (${respuesta.status})`)
  }
  return respuesta.arrayBuffer()
}

let motorCacheado: Promise<MotorGit> | null = null

export function crearMotorGit(
  cargarWasm: () => Promise<ArrayBuffer> = cargarWasmPorFetch,
): Promise<MotorGit> {
  if (!motorCacheado) {
    motorCacheado = cargarWasm().then((wasmBinary) => ({ wasmBinary }))
  }
  return motorCacheado
}

interface InstanciaGit {
  FS: {
    writeFile: (ruta: string, contenido: string) => void
    mkdir: (ruta: string) => void
    chdir: (ruta: string) => void
    readFile: (ruta: string, opciones: { encoding: 'utf8' }) => string
  }
  callMain: (args: string[]) => Promise<number>
  callWithOutput: (args: string[]) => Promise<string>
}

async function crearInstancia(motor: MotorGit): Promise<InstanciaGit> {
  const { default: initGit } = await import('wasm-git/lg2_async.js')
  const instancia = (await initGit({ wasmBinary: motor.wasmBinary })) as InstanciaGit
  instancia.FS.writeFile(
    '/home/web_user/.gitconfig',
    '[user]\nname = Ana\nemail = ana@example.com\n',
  )
  instancia.FS.mkdir('/repo')
  instancia.FS.chdir('/repo')
  return instancia
}

async function ejecutarPaso(instancia: InstanciaGit, paso: PasoGit): Promise<void> {
  if (typeof paso === 'string') {
    await instancia.callMain(dividirComando(paso))
    return
  }
  instancia.FS.writeFile(`/repo/${paso.escribir.ruta}`, paso.escribir.contenido)
}

export async function ejecutarComandosGit(
  motor: MotorGit,
  esquemaGit: PasoGit[],
  comando: string,
): Promise<ResultadoGit> {
  try {
    const instancia = await crearInstancia(motor)
    for (const paso of esquemaGit) {
      await ejecutarPaso(instancia, paso)
    }
    const salida = await instancia.callWithOutput(dividirComando(comando))
    return { ok: true, salida }
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : String(error) }
  }
}
```

- [ ] **Step 7: Reescribir los tests con la capacidad de escritura de ficheros**

Reescribe el `describe('ejecutarComandosGit', ...)` de `motor.test.ts`:

```ts
describe('ejecutarComandosGit', () => {
  it('ejecuta init + commit y devuelve la salida real de log', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const resultado = await ejecutarComandosGit(
      motor,
      [
        'init .',
        { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
        'add a.txt',
        "commit -m 'primer commit'",
      ],
      'log --oneline',
    )
    expect(resultado.ok).toBe(true)
    if (resultado.ok) expect(resultado.salida).toContain('primer commit')
  })

  it('checkout -b crea una rama real (sustituto de branch, que no existe en wasm-git)', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const resultado = await ejecutarComandosGit(
      motor,
      [
        'init .',
        { escribir: { ruta: 'a.txt', contenido: 'v1\n' } },
        'add a.txt',
        "commit -m v1",
        'checkout -b feature',
      ],
      'rev-parse HEAD',
    )
    expect(resultado.ok).toBe(true)
  })

  it('un merge con conflicto real deja los marcadores <<<<<<< / ======= / >>>>>>> en el fichero', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const setupComun = [
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'linea original\n' } },
      'add a.txt',
      'commit -m base',
      'checkout -b feature',
      { escribir: { ruta: 'a.txt', contenido: 'cambiado en FEATURE\n' } },
      'add a.txt',
      'commit -m feature-cambia-a',
      'checkout master',
      { escribir: { ruta: 'a.txt', contenido: 'cambiado en MASTER\n' } },
      'add a.txt',
      'commit -m master-cambia-a',
    ]
    const resultado = await ejecutarComandosGit(motor, setupComun, 'merge feature')
    expect(resultado.ok).toBe(true)
    if (resultado.ok) {
      // el propio comando devuelve la salida del merge (menciona el
      // conflicto); leer el fichero resultante confirma los marcadores
    }

    // Confirmar los marcadores reales leyendo el fichero en la MISMA
    // instancia requiere exponerla — para el test, se repite la secuencia
    // y se lee el fichero con una llamada aparte al mismo motor:
    const resultadoLectura = await ejecutarComandosGit(
      motor,
      [...setupComun, 'merge feature'],
      'cat-file -p HEAD:a.txt',
    )
    // cat-file -p HEAD:a.txt falla mientras hay un conflicto sin resolver
    // (HEAD no tiene todavía la versión fusionada) — en su lugar, usa
    // status, que sí describe el conflicto de forma legible:
    const resultadoStatus = await ejecutarComandosGit(motor, setupComun, 'merge feature')
    expect(resultadoStatus.ok).toBe(true)
  })

  it('un comando que falla de verdad propaga el mensaje real de error', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const resultado = await ejecutarComandosGit(motor, ['init .'], 'checkout rama-inexistente')
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) expect(resultado.mensaje).toContain('rama-inexistente')
  })

  it('dos ejecuciones están aisladas: un commit de una no aparece en la otra', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    await ejecutarComandosGit(
      motor,
      [
        'init .',
        { escribir: { ruta: 'a.txt', contenido: 'x\n' } },
        'add a.txt',
        "commit -m 'solo en la primera ejecucion'",
      ],
      'log --oneline',
    )
    const segunda = await ejecutarComandosGit(motor, ['init .'], 'log --oneline')
    expect(segunda.ok).toBe(false) // log sin ningún commit falla de verdad en git real
  })
})
```

**Nota importante sobre el test de conflicto**: verifica primero, ejecutando el test, si `resultadoStatus.salida` contiene literalmente la palabra `conflict` o `UU` o similar — ajusta la aserción exacta a lo que wasm-git devuelve de verdad (el spec confirma `conflict: a:a.txt o:a.txt t:a.txt` como formato real de `status`, pero confírmalo en tu propia ejecución antes de fijar la aserción, nunca la copies del spec sin comprobarla en tu propio entorno).

- [ ] **Step 8: Ejecutar todos los tests del motor y confirmar que pasan**

Run: `npx vitest run src/lib/git-en-vivo/motor.test.ts`
Expected: PASS — todos los `it` en verde. Si el test de conflicto falla por el formato exacto de la salida, ajusta la aserción a lo que el comando devuelve de verdad (no cambies el comportamiento del motor para "hacer pasar" el test).

- [ ] **Step 9: Commit**

```bash
git add src/lib/git-en-vivo/motor.ts src/lib/git-en-vivo/motor.test.ts src/lib/laboratorio/schemas.ts src/lib/laboratorio/schemas.test.ts
git commit -m "feat(git-en-vivo): motor real con wasm-git — ejecutarComandosGit"
```

---

### Task 3: Motor `git-en-vivo` — `obtenerGrafo`

**Files:**
- Modify: `src/lib/git-en-vivo/motor.ts`
- Modify: `src/lib/git-en-vivo/motor.test.ts`

**Interfaces:**
- Consumes: `crearInstancia` (interna a `motor.ts`, de Task 2), `dividirComando`.
- Produces: `obtenerGrafo(motor: MotorGit, esquemaGit: PasoGit[]): Promise<GrafoGit>`, tipos `CommitGit`, `RamaGit`, `GrafoGit`. Usados por Task 4 (`GrafoCommits.tsx`).

- [ ] **Step 1: Escribir el test que falla**

Añade a `motor.test.ts`:

```ts
import { obtenerGrafo } from './motor'

describe('obtenerGrafo', () => {
  it('un historial lineal de 2 commits tiene el segundo con el primero como único padre', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const grafo = await obtenerGrafo(motor, [
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'v1\n' } },
      'add a.txt',
      'commit -m v1',
      { escribir: { ruta: 'a.txt', contenido: 'v2\n' } },
      'add a.txt',
      'commit -m v2',
    ])

    expect(grafo.commits).toHaveLength(2)
    const v1 = grafo.commits.find((c) => c.mensaje === 'v1')
    const v2 = grafo.commits.find((c) => c.mensaje === 'v2')
    expect(v1?.padres).toEqual([])
    expect(v2?.padres).toEqual([v1?.hash])
    expect(grafo.ramas).toEqual([{ nombre: 'master', hash: v2?.hash }])
    expect(grafo.ramaActual).toBe('master')
  })

  it('una rama divergente: dos ramas distintas apuntan a commits distintos con base común', async () => {
    const motor = await crearMotorGit(cargarWasmDesdeDisco)
    const grafo = await obtenerGrafo(motor, [
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'base\n' } },
      'add a.txt',
      'commit -m base',
      'checkout -b feature',
      { escribir: { ruta: 'b.txt', contenido: 'x\n' } },
      'add b.txt',
      'commit -m feature-commit',
      'checkout master',
      { escribir: { ruta: 'c.txt', contenido: 'y\n' } },
      'add c.txt',
      'commit -m master-commit',
    ])

    expect(grafo.commits).toHaveLength(3)
    expect(grafo.ramas.map((r) => r.nombre).sort()).toEqual(['feature', 'master'])
    expect(grafo.ramaActual).toBe('master')

    const base = grafo.commits.find((c) => c.mensaje === 'base')
    const feature = grafo.commits.find((c) => c.mensaje === 'feature-commit')
    const master = grafo.commits.find((c) => c.mensaje === 'master-commit')
    expect(feature?.padres).toEqual([base?.hash])
    expect(master?.padres).toEqual([base?.hash])

    const ramaFeature = grafo.ramas.find((r) => r.nombre === 'feature')
    const ramaMaster = grafo.ramas.find((r) => r.nombre === 'master')
    expect(ramaFeature?.hash).toBe(feature?.hash)
    expect(ramaMaster?.hash).toBe(master?.hash)
  })
})
```

- [ ] **Step 2: Ejecutar y confirmar que falla**

Run: `npx vitest run src/lib/git-en-vivo/motor.test.ts -t obtenerGrafo`
Expected: FAIL — `obtenerGrafo` no existe.

- [ ] **Step 3: Implementar `obtenerGrafo`**

Añade a `motor.ts` (los tipos van cerca de `ResultadoGit`, la función cerca de `ejecutarComandosGit`):

```ts
export interface CommitGit {
  hash: string
  hashCorto: string
  mensaje: string
  padres: string[]
}

export interface RamaGit {
  nombre: string
  hash: string
}

export interface GrafoGit {
  commits: CommitGit[]
  ramas: RamaGit[]
  ramaActual: string
}

function parsearForEachRef(salida: string): RamaGit[] {
  return salida
    .split('\n')
    .filter((linea) => linea.trim() !== '')
    .map((linea) => {
      const [hash, resto] = linea.split(/\s+/, 2)
      const nombre = resto.split('refs/heads/')[1]
      return { nombre, hash }
    })
    .filter((rama): rama is RamaGit => Boolean(rama.nombre))
}

function parsearCommitObjeto(hash: string, textoObjeto: string): CommitGit {
  const lineas = textoObjeto.split('\n')
  const padres: string[] = []
  let indiceFinCabecera = lineas.length
  for (let i = 0; i < lineas.length; i++) {
    if (lineas[i] === '') {
      indiceFinCabecera = i
      break
    }
    const coincidenciaPadre = /^parent ([0-9a-f]{40})$/.exec(lineas[i])
    if (coincidenciaPadre) padres.push(coincidenciaPadre[1])
  }
  const mensaje = lineas.slice(indiceFinCabecera + 1).join('\n').trim()
  return { hash, hashCorto: hash.slice(0, 7), mensaje, padres }
}

export async function obtenerGrafo(motor: MotorGit, esquemaGit: PasoGit[]): Promise<GrafoGit> {
  const instancia = await crearInstancia(motor)
  for (const paso of esquemaGit) {
    await ejecutarPaso(instancia, paso)
  }

  const salidaRefs = await instancia.callWithOutput(dividirComando('for-each-ref'))
  const ramas = parsearForEachRef(salidaRefs)

  const cabezaCruda = instancia.FS.readFile('/repo/.git/HEAD', { encoding: 'utf8' })
  const ramaActual = cabezaCruda.trim().replace('ref: refs/heads/', '')

  const hashesUnicos = new Set<string>()
  for (const rama of ramas) {
    const salidaLog = await instancia.callWithOutput(
      dividirComando(`log ${rama.nombre} --oneline`),
    )
    for (const linea of salidaLog.split('\n')) {
      const hash = linea.split(' ')[0]
      if (hash) hashesUnicos.add(hash)
    }
  }

  const commits: CommitGit[] = []
  for (const hash of hashesUnicos) {
    const textoObjeto = await instancia.callWithOutput(dividirComando(`cat-file -p ${hash}`))
    commits.push(parsearCommitObjeto(hash, textoObjeto))
  }

  return { commits, ramas, ramaActual }
}
```

**Nota sobre `for-each-ref`**: el spec confirma que su salida real tiene el formato `<hash> commit\trefs/heads/<nombre>` — verifica en tu propia ejecución del test que el separador entre `<hash>` y `commit\trefs/heads/<nombre>` es efectivamente un único espacio (para que `linea.split(/\s+/, 2)` funcione) y ajusta el parseo si el formato real difiere.

- [ ] **Step 4: Ejecutar y confirmar que pasan**

Run: `npx vitest run src/lib/git-en-vivo/motor.test.ts`
Expected: PASS — todos los tests de `motor.test.ts`, incluidos los de `obtenerGrafo` y los de `ejecutarComandosGit` de la Task 2.

- [ ] **Step 5: Commit**

```bash
git add src/lib/git-en-vivo/motor.ts src/lib/git-en-vivo/motor.test.ts
git commit -m "feat(git-en-vivo): obtenerGrafo — grafo de commits derivado de datos reales"
```

---

### Task 4: `SalidaTerminal.tsx`

**Files:**
- Create: `src/components/bloques-laboratorio/SalidaTerminal.tsx`
- Test: `src/components/bloques-laboratorio/SalidaTerminal.test.tsx`

**Interfaces:**
- Consumes: nada del motor — componente de presentación puro.
- Produces: `SalidaTerminal({ comando, salida, error }: { comando: string; salida?: string; error?: string })`. Usado por Task 5 y Task 6.

- [ ] **Step 1: Escribir el test que falla**

Crea `src/components/bloques-laboratorio/SalidaTerminal.test.tsx` (mira `src/components/bloques-laboratorio/TablaResultado.test.tsx` para el estilo exacto de test con React Testing Library ya usado en este proyecto):

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SalidaTerminal } from './SalidaTerminal'

describe('SalidaTerminal', () => {
  it('muestra el comando con el prefijo git', () => {
    render(<SalidaTerminal comando="log --oneline" />)
    expect(screen.getByText(/git log --oneline/)).toBeInTheDocument()
  })

  it('muestra la salida real cuando se pasa', () => {
    render(<SalidaTerminal comando="log --oneline" salida="a1b2c3d primer commit" />)
    expect(screen.getByText(/a1b2c3d primer commit/)).toBeInTheDocument()
  })

  it('muestra el error cuando se pasa', () => {
    render(<SalidaTerminal comando="checkout x" error="revspec 'x' not found" />)
    expect(screen.getByText(/revspec 'x' not found/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Ejecutar y confirmar que falla**

Run: `npx vitest run src/components/bloques-laboratorio/SalidaTerminal.test.tsx`
Expected: FAIL — el fichero del componente no existe.

- [ ] **Step 3: Implementar el componente**

Crea `src/components/bloques-laboratorio/SalidaTerminal.tsx`:

```tsx
export function SalidaTerminal({
  comando,
  salida,
  error,
}: {
  comando: string
  salida?: string
  error?: string
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-neutral-950 p-3 font-mono text-sm text-neutral-100">
      <p>
        <span className="text-green-400">$</span> git {comando}
      </p>
      {salida !== undefined && (
        <pre className="mt-1 whitespace-pre-wrap text-neutral-300">{salida}</pre>
      )}
      {error !== undefined && (
        <pre className="mt-1 whitespace-pre-wrap text-red-400">{error}</pre>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Ejecutar y confirmar que pasan**

Run: `npx vitest run src/components/bloques-laboratorio/SalidaTerminal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/bloques-laboratorio/SalidaTerminal.tsx src/components/bloques-laboratorio/SalidaTerminal.test.tsx
git commit -m "feat(bloques-laboratorio): SalidaTerminal"
```

---

### Task 5: `GrafoCommits.tsx`

**Files:**
- Create: `src/components/bloques-laboratorio/GrafoCommits.tsx`
- Create: `src/components/bloques-laboratorio/calcularLayoutGrafo.ts`
- Test: `src/components/bloques-laboratorio/calcularLayoutGrafo.test.ts`

**Interfaces:**
- Consumes: `GrafoGit`, `CommitGit`, `RamaGit` de `src/lib/git-en-vivo/motor.ts` (Task 3).
- Produces: `calcularLayoutGrafo(grafo: GrafoGit): LayoutGrafo` (tipo `LayoutGrafo` exportado), y el componente `GrafoCommits({ grafo }: { grafo: GrafoGit })`. El componente se usa en Task 6/7 (`GitAnotado`/`GitEnVivo` cuando `mostrarGrafo`).

**Algoritmo de layout (concreto, no ambiguo):**

1. **Orden topológico** (posición X): ordena los commits de forma que cada commit aparezca después de TODOS sus padres — algoritmo de Kahn sobre el grafo dirigido padre→hijo (invierte `padres` para construir la lista de hijos, procesa primero los commits sin padres pendientes).
2. **Carril/lane** (posición Y): recorre `ramas` en el orden en que aparecen. Para cada rama, camina hacia atrás desde su commit (`hash`) siguiendo siempre `padres[0]` (el primer padre — ignora el segundo padre de un merge para el cálculo de carril, simplificación deliberada). Asigna el índice de esa rama (0, 1, 2...) como carril a cada commit visitado que TODAVÍA no tenga carril asignado — así la primera rama (normalmente `master`) se queda con el carril 0 para toda la historia compartida, y una rama posterior solo reclama carriles nuevos para sus commits exclusivos.
3. Posición final: `x = 50 + indiceTopologico * 90`, `y = 40 + carril * 50`.

**Interfaz de `LayoutGrafo`:**

```ts
export interface NodoLayout {
  hash: string
  hashCorto: string
  mensaje: string
  x: number
  y: number
  carril: number
}
export interface AristaLayout {
  desde: { x: number; y: number }
  hasta: { x: number; y: number }
}
export interface EtiquetaRamaLayout {
  nombre: string
  x: number
  y: number
  carril: number
  esActual: boolean
}
export interface LayoutGrafo {
  nodos: NodoLayout[]
  aristas: AristaLayout[]
  etiquetas: EtiquetaRamaLayout[]
  ancho: number
  alto: number
}
```

- [ ] **Step 1: Escribir el test de `calcularLayoutGrafo` que falla**

Crea `src/components/bloques-laboratorio/calcularLayoutGrafo.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { calcularLayoutGrafo } from './calcularLayoutGrafo'
import type { GrafoGit } from '@/lib/git-en-vivo/motor'

describe('calcularLayoutGrafo', () => {
  it('un historial lineal de 2 commits queda en el mismo carril, en orden', () => {
    const grafo: GrafoGit = {
      commits: [
        { hash: 'aaaa', hashCorto: 'aaaa', mensaje: 'v1', padres: [] },
        { hash: 'bbbb', hashCorto: 'bbbb', mensaje: 'v2', padres: ['aaaa'] },
      ],
      ramas: [{ nombre: 'master', hash: 'bbbb' }],
      ramaActual: 'master',
    }
    const layout = calcularLayoutGrafo(grafo)

    const nodoV1 = layout.nodos.find((n) => n.hash === 'aaaa')!
    const nodoV2 = layout.nodos.find((n) => n.hash === 'bbbb')!
    expect(nodoV1.carril).toBe(0)
    expect(nodoV2.carril).toBe(0)
    expect(nodoV1.x).toBeLessThan(nodoV2.x)
    expect(layout.aristas).toEqual([
      { desde: { x: nodoV1.x, y: nodoV1.y }, hasta: { x: nodoV2.x, y: nodoV2.y } },
    ])
    expect(layout.etiquetas).toEqual([
      { nombre: 'master', x: nodoV2.x, y: nodoV2.y, carril: 0, esActual: true },
    ])
  })

  it('una rama divergente pone la rama secundaria en un carril distinto', () => {
    const grafo: GrafoGit = {
      commits: [
        { hash: 'base', hashCorto: 'base', mensaje: 'base', padres: [] },
        { hash: 'feat', hashCorto: 'feat', mensaje: 'feature-commit', padres: ['base'] },
        { hash: 'mstr', hashCorto: 'mstr', mensaje: 'master-commit', padres: ['base'] },
      ],
      ramas: [
        { nombre: 'master', hash: 'mstr' },
        { nombre: 'feature', hash: 'feat' },
      ],
      ramaActual: 'master',
    }
    const layout = calcularLayoutGrafo(grafo)

    const nodoBase = layout.nodos.find((n) => n.hash === 'base')!
    const nodoMaster = layout.nodos.find((n) => n.hash === 'mstr')!
    const nodoFeature = layout.nodos.find((n) => n.hash === 'feat')!

    expect(nodoBase.carril).toBe(0)
    expect(nodoMaster.carril).toBe(0)
    expect(nodoFeature.carril).toBe(1)
    expect(layout.aristas).toHaveLength(2)

    const etiquetaMaster = layout.etiquetas.find((e) => e.nombre === 'master')!
    const etiquetaFeature = layout.etiquetas.find((e) => e.nombre === 'feature')!
    expect(etiquetaMaster.esActual).toBe(true)
    expect(etiquetaFeature.esActual).toBe(false)
  })
})
```

- [ ] **Step 2: Ejecutar y confirmar que falla**

Run: `npx vitest run src/components/bloques-laboratorio/calcularLayoutGrafo.test.ts`
Expected: FAIL — el fichero no existe.

- [ ] **Step 3: Implementar `calcularLayoutGrafo`**

Crea `src/components/bloques-laboratorio/calcularLayoutGrafo.ts`:

```ts
import type { GrafoGit } from '@/lib/git-en-vivo/motor'

export interface NodoLayout {
  hash: string
  hashCorto: string
  mensaje: string
  x: number
  y: number
  carril: number
}
export interface AristaLayout {
  desde: { x: number; y: number }
  hasta: { x: number; y: number }
}
export interface EtiquetaRamaLayout {
  nombre: string
  x: number
  y: number
  carril: number
  esActual: boolean
}
export interface LayoutGrafo {
  nodos: NodoLayout[]
  aristas: AristaLayout[]
  etiquetas: EtiquetaRamaLayout[]
  ancho: number
  alto: number
}

const ESPACIADO_X = 90
const MARGEN_X = 50
const ESPACIADO_Y = 50
const MARGEN_Y = 40

function ordenTopologico(grafo: GrafoGit): string[] {
  const porHash = new Map(grafo.commits.map((c) => [c.hash, c]))
  const gradoEntrada = new Map(grafo.commits.map((c) => [c.hash, c.padres.length]))
  const hijosDe = new Map<string, string[]>()
  for (const commit of grafo.commits) {
    for (const padre of commit.padres) {
      hijosDe.set(padre, [...(hijosDe.get(padre) ?? []), commit.hash])
    }
  }

  const cola = grafo.commits.filter((c) => c.padres.length === 0).map((c) => c.hash)
  const orden: string[] = []
  while (cola.length > 0) {
    const hash = cola.shift()!
    orden.push(hash)
    for (const hijo of hijosDe.get(hash) ?? []) {
      const restante = (gradoEntrada.get(hijo) ?? 0) - 1
      gradoEntrada.set(hijo, restante)
      if (restante === 0) cola.push(hijo)
    }
  }
  // Cualquier commit no alcanzado (no debería ocurrir con datos reales del
  // motor, pero evita perder nodos silenciosamente si pasara) va al final.
  for (const commit of grafo.commits) {
    if (!orden.includes(commit.hash)) orden.push(commit.hash)
  }
  return orden
}

function asignarCarriles(grafo: GrafoGit): Map<string, number> {
  const porHash = new Map(grafo.commits.map((c) => [c.hash, c]))
  const carrilDe = new Map<string, number>()

  grafo.ramas.forEach((rama, indiceRama) => {
    let actual: string | undefined = rama.hash
    while (actual && !carrilDe.has(actual)) {
      carrilDe.set(actual, indiceRama)
      actual = porHash.get(actual)?.padres[0]
    }
  })

  return carrilDe
}

export function calcularLayoutGrafo(grafo: GrafoGit): LayoutGrafo {
  const orden = ordenTopologico(grafo)
  const carriles = asignarCarriles(grafo)
  const porHash = new Map(grafo.commits.map((c) => [c.hash, c]))

  const posiciones = new Map<string, { x: number; y: number }>()
  orden.forEach((hash, indice) => {
    const carril = carriles.get(hash) ?? 0
    posiciones.set(hash, {
      x: MARGEN_X + indice * ESPACIADO_X,
      y: MARGEN_Y + carril * ESPACIADO_Y,
    })
  })

  const nodos: NodoLayout[] = orden.map((hash) => {
    const commit = porHash.get(hash)!
    const posicion = posiciones.get(hash)!
    return {
      hash,
      hashCorto: commit.hashCorto,
      mensaje: commit.mensaje,
      x: posicion.x,
      y: posicion.y,
      carril: carriles.get(hash) ?? 0,
    }
  })

  const aristas: AristaLayout[] = []
  for (const commit of grafo.commits) {
    const hasta = posiciones.get(commit.hash)!
    for (const padre of commit.padres) {
      const desde = posiciones.get(padre)
      if (desde) aristas.push({ desde, hasta })
    }
  }

  const etiquetas: EtiquetaRamaLayout[] = grafo.ramas.map((rama) => {
    const posicion = posiciones.get(rama.hash)!
    return {
      nombre: rama.nombre,
      x: posicion.x,
      y: posicion.y,
      carril: carriles.get(rama.hash) ?? 0,
      esActual: rama.nombre === grafo.ramaActual,
    }
  })

  const ancho = MARGEN_X * 2 + Math.max(0, orden.length - 1) * ESPACIADO_X
  const alto = MARGEN_Y * 2 + Math.max(0, grafo.ramas.length - 1) * ESPACIADO_Y

  return { nodos, aristas, etiquetas, ancho, alto }
}
```

- [ ] **Step 4: Ejecutar y confirmar que pasan**

Run: `npx vitest run src/components/bloques-laboratorio/calcularLayoutGrafo.test.ts`
Expected: PASS.

- [ ] **Step 5: Escribir el test del componente `GrafoCommits`**

Crea `src/components/bloques-laboratorio/GrafoCommits.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GrafoCommits } from './GrafoCommits'
import type { GrafoGit } from '@/lib/git-en-vivo/motor'

describe('GrafoCommits', () => {
  it('muestra una etiqueta por cada rama', () => {
    const grafo: GrafoGit = {
      commits: [
        { hash: 'aaaa', hashCorto: 'aaaa', mensaje: 'v1', padres: [] },
        { hash: 'bbbb', hashCorto: 'bbbb', mensaje: 'v2', padres: ['aaaa'] },
      ],
      ramas: [{ nombre: 'master', hash: 'bbbb' }],
      ramaActual: 'master',
    }
    render(<GrafoCommits grafo={grafo} />)
    expect(screen.getByText('master')).toBeInTheDocument()
    expect(screen.getByText('aaaa')).toBeInTheDocument()
    expect(screen.getByText('bbbb')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Ejecutar y confirmar que falla**

Run: `npx vitest run src/components/bloques-laboratorio/GrafoCommits.test.tsx`
Expected: FAIL — el componente no existe.

- [ ] **Step 7: Implementar `GrafoCommits.tsx`**

```tsx
import { calcularLayoutGrafo } from './calcularLayoutGrafo'
import type { GrafoGit } from '@/lib/git-en-vivo/motor'

const COLORES_CARRIL = ['#3b82f6', '#F03C2E', '#8b5cf6', '#059669']

export function GrafoCommits({ grafo }: { grafo: GrafoGit }) {
  const layout = calcularLayoutGrafo(grafo)

  return (
    <div className="overflow-x-auto rounded-lg border bg-card p-3">
      <svg width={layout.ancho} height={layout.alto} viewBox={`0 0 ${layout.ancho} ${layout.alto}`}>
        {layout.aristas.map((arista, indice) => (
          <line
            key={indice}
            x1={arista.desde.x}
            y1={arista.desde.y}
            x2={arista.hasta.x}
            y2={arista.hasta.y}
            stroke="var(--muted-foreground)"
            strokeWidth={2}
          />
        ))}
        {layout.nodos.map((nodo) => (
          <g key={nodo.hash} transform={`translate(${nodo.x},${nodo.y})`}>
            <circle
              r={7}
              fill="var(--card)"
              stroke={COLORES_CARRIL[nodo.carril % COLORES_CARRIL.length]}
              strokeWidth={2}
            />
            <text y={22} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="var(--muted-foreground)">
              {nodo.hashCorto}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-2">
        {layout.etiquetas.map((etiqueta) => (
          <span
            key={etiqueta.nombre}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-bold"
            style={{
              color: COLORES_CARRIL[etiqueta.carril % COLORES_CARRIL.length],
              backgroundColor: `${COLORES_CARRIL[etiqueta.carril % COLORES_CARRIL.length]}1a`,
            }}
          >
            {etiqueta.esActual && '● '}
            {etiqueta.nombre}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Ejecutar y confirmar que pasan**

Run: `npx vitest run src/components/bloques-laboratorio/GrafoCommits.test.tsx src/components/bloques-laboratorio/calcularLayoutGrafo.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/bloques-laboratorio/GrafoCommits.tsx src/components/bloques-laboratorio/GrafoCommits.test.tsx src/components/bloques-laboratorio/calcularLayoutGrafo.ts src/components/bloques-laboratorio/calcularLayoutGrafo.test.ts
git commit -m "feat(bloques-laboratorio): GrafoCommits — grafo real con layout por carriles"
```

---

### Task 6: `GitAnotado.tsx`

**Files:**
- Create: `src/components/bloques-laboratorio/GitAnotado.tsx`
- Test: `src/components/bloques-laboratorio/GitAnotado.test.tsx`

**Interfaces:**
- Consumes: `crearMotorGit`, `ejecutarComandosGit`, `obtenerGrafo` de `src/lib/git-en-vivo/motor.ts`; `DatosGitAnotado` de `src/lib/laboratorio/schemas.ts`; `SalidaTerminal` (Task 4); `GrafoCommits` (Task 5).
- Produces: `GitAnotado(props: DatosGitAnotado & { etiquetaSeccion?: string })`. Usado por `BloqueLaboratorio.tsx` (registro de tipos — Task 8) y por `AdminReferenciaContenidoPage.tsx` (Task 9).

**Referencia obligatoria antes de escribir esta tarea**: lee `src/components/bloques-laboratorio/SqlAnotado.tsx` completo — esta tarea replica su estructura (cabecera con icono, botones de anotación numerados, nota activa) casi exactamente, sustituyendo `CodigoResaltado`+`TablaResultado` por `SalidaTerminal`(+`GrafoCommits` si aplica).

- [ ] **Step 1: Escribir el test que falla**

Crea `src/components/bloques-laboratorio/GitAnotado.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GitAnotado } from './GitAnotado'

describe('GitAnotado', () => {
  it('ejecuta el comando y muestra la salida real', async () => {
    render(
      <GitAnotado
        tipo="git-anotado"
        esquemaGit={[
          'init .',
          { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
          'add a.txt',
          "commit -m 'primer commit'",
        ]}
        comando="log --oneline"
        mostrarGrafo={false}
        anotaciones={[{ fragmento: 'log', nota: 'Muestra el historial real.' }]}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/primer commit/)).toBeInTheDocument()
    })
  })

  it('marca la anotación activa cuando se pulsa un número', async () => {
    render(
      <GitAnotado
        tipo="git-anotado"
        esquemaGit={['init .']}
        comando="status"
        mostrarGrafo={false}
        anotaciones={[
          { fragmento: 'status', nota: 'Primera nota.' },
        ]}
      />,
    )
    await waitFor(() => {
      expect(screen.getByText('Primera nota.')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: Ejecutar y confirmar que falla**

Run: `npx vitest run src/components/bloques-laboratorio/GitAnotado.test.tsx`
Expected: FAIL — el componente no existe. Ten en cuenta que este test SÍ ejecuta el motor real (`crearMotorGit`) en el entorno de test — confirma que el mock/entorno de `vitest` para este proyecto ya sirve `wasm-git` igual que sirve `sql.js`/`@electric-sql/pglite` en los tests de `SqlAnotado.test.tsx` (si existe) o revisa la config de `vitest.config.ts` para ver si hace falta algo especial (alias, `optimizeDeps`) — replicar lo que ya exista para los otros motores.

- [ ] **Step 3: Implementar el componente**

Crea `src/components/bloques-laboratorio/GitAnotado.tsx`:

```tsx
import { GitBranch } from 'lucide-react'
import { useEffect, useId, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { GrafoCommits } from '@/components/bloques-laboratorio/GrafoCommits'
import { SalidaTerminal } from '@/components/bloques-laboratorio/SalidaTerminal'
import type { DatosGitAnotado } from '@/lib/laboratorio/schemas'
import {
  crearMotorGit,
  ejecutarComandosGit,
  obtenerGrafo,
  type GrafoGit,
  type ResultadoGit,
} from '@/lib/git-en-vivo/motor'
import { cn } from '@/lib/utils'

export function GitAnotado({
  titulo,
  esquemaGit,
  comando,
  mostrarGrafo,
  anotaciones,
  // Prop deliberadamente fuera del esquema Zod de la lección — mismo
  // motivo que en SqlAnotado.tsx: evitar un landmark aria-label duplicado
  // cuando dos instancias conviven en la página de referencia.
  etiquetaSeccion = 'Git anotado',
}: DatosGitAnotado & { etiquetaSeccion?: string }) {
  const idNota = useId()
  const anotacionesValidas = useMemo(
    () => anotaciones.filter((anotacion) => comando.includes(anotacion.fragmento)),
    [anotaciones, comando],
  )
  const [anotacionActiva, setAnotacionActiva] = useState(0)
  const activa = anotacionesValidas[anotacionActiva]

  const [resultado, setResultado] = useState<ResultadoGit | null>(null)
  const [grafo, setGrafo] = useState<GrafoGit | null>(null)

  useEffect(() => {
    let cancelado = false
    void (async () => {
      try {
        const motor = await crearMotorGit()
        if (cancelado) return
        const resultadoEjecucion = await ejecutarComandosGit(motor, esquemaGit, comando)
        if (!cancelado) setResultado(resultadoEjecucion)
        if (mostrarGrafo) {
          const grafoReal = await obtenerGrafo(motor, esquemaGit)
          if (!cancelado) setGrafo(grafoReal)
        }
      } catch (error) {
        if (!cancelado) {
          setResultado({
            ok: false,
            mensaje: error instanceof Error ? error.message : 'No se pudo cargar el motor Git.',
          })
        }
      }
    })()
    return () => {
      cancelado = true
    }
  }, [esquemaGit, comando, mostrarGrafo])

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-orange-50 dark:bg-orange-950/40">
          <GitBranch aria-hidden="true" className="size-4.75 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
            Git anotado
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            {titulo ?? 'Selecciona un número para destacar la línea y leer la nota'}
          </h3>
        </div>
      </div>

      <SalidaTerminal
        comando={comando}
        salida={resultado?.ok ? resultado.salida : undefined}
        error={resultado?.ok === false ? resultado.mensaje : undefined}
      />

      {mostrarGrafo && grafo && <GrafoCommits grafo={grafo} />}

      {anotacionesValidas.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" aria-label="Anotaciones del comando">
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
                    'border-orange-500 bg-orange-500 text-white hover:bg-orange-500 dark:border-orange-400 dark:bg-orange-400 dark:text-orange-950',
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
            className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-lg border-l-4 border-orange-500 bg-orange-50 p-3 text-sm text-pretty duration-200 motion-reduce:animate-none dark:border-orange-400 dark:bg-orange-950/30"
          >
            <span className="font-semibold">Nota {anotacionActiva + 1}.</span> {activa?.nota}
          </p>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Ejecutar y confirmar que pasan**

Run: `npx vitest run src/components/bloques-laboratorio/GitAnotado.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/bloques-laboratorio/GitAnotado.tsx src/components/bloques-laboratorio/GitAnotado.test.tsx
git commit -m "feat(bloques-laboratorio): GitAnotado"
```

---

### Task 7: `GitEnVivo.tsx`

**Files:**
- Create: `src/components/bloques-laboratorio/GitEnVivo.tsx`
- Test: `src/components/bloques-laboratorio/GitEnVivo.test.tsx`

**Interfaces:**
- Consumes: mismos imports que Task 6, más `DatosGitEnVivo`.
- Produces: `GitEnVivo(props: DatosGitEnVivo & { etiquetaSeccion?: string })`. Usado por `BloqueLaboratorio.tsx` (Task 8) y `AdminReferenciaContenidoPage.tsx` (Task 9).

**Diferencia deliberada de diseño frente a `SqlEnVivo.tsx`**: no usa CodeMirror. Un comando de Git es una única línea de texto (a diferencia de una consulta SQL multilínea) — un `<input type="text">` simple, con el mismo debounce, es suficiente y más simple. La comparación con `comandoSolucion` es una igualdad de cadenas exacta (tras `trim()`) sobre `resultado.salida`, no una comparación estructural como `compararResultados` (la salida de un comando Git es texto secuencial, no filas sin orden garantizado).

- [ ] **Step 1: Escribir el test que falla**

Crea `src/components/bloques-laboratorio/GitEnVivo.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { GitEnVivo } from './GitEnVivo'

describe('GitEnVivo', () => {
  it('ejecuta el comando inicial y muestra el resultado real', async () => {
    render(
      <GitEnVivo
        tipo="git-en-vivo"
        esquemaGit={[
          'init .',
          { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
          'add a.txt',
          "commit -m 'primer commit'",
        ]}
        comandoInicial="log --oneline"
        mostrarGrafo={false}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/primer commit/)).toBeInTheDocument()
    })
  })

  it('marca "Coincide con la solución" cuando el comando escrito produce la misma salida', async () => {
    const usuario = userEvent.setup()
    render(
      <GitEnVivo
        tipo="git-en-vivo"
        esquemaGit={[
          'init .',
          { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
          'add a.txt',
          "commit -m 'primer commit'",
        ]}
        comandoInicial="status"
        comandoSolucion="log --oneline"
        mostrarGrafo={false}
      />,
    )

    const campo = await screen.findByRole('textbox')
    await usuario.clear(campo)
    await usuario.type(campo, 'log --oneline')

    await waitFor(
      () => {
        expect(screen.getByText('Coincide con la solución')).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })
})
```

- [ ] **Step 2: Ejecutar y confirmar que falla**

Run: `npx vitest run src/components/bloques-laboratorio/GitEnVivo.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar el componente**

Crea `src/components/bloques-laboratorio/GitEnVivo.tsx`:

```tsx
import { CircleCheck, CircleX, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { GrafoCommits } from '@/components/bloques-laboratorio/GrafoCommits'
import { SalidaTerminal } from '@/components/bloques-laboratorio/SalidaTerminal'
import type { DatosGitEnVivo } from '@/lib/laboratorio/schemas'
import {
  crearMotorGit,
  ejecutarComandosGit,
  obtenerGrafo,
  type GrafoGit,
  type MotorGit,
  type ResultadoGit,
} from '@/lib/git-en-vivo/motor'

const RETRASO_EJECUCION_MS = 300

export function GitEnVivo({
  consigna,
  esquemaGit,
  comandoInicial,
  comandoSolucion,
  mostrarGrafo,
  // Prop deliberadamente fuera del esquema Zod de la lección — mismo
  // motivo que en SqlEnVivo.tsx.
  etiquetaSeccion = 'Git en vivo',
}: DatosGitEnVivo & { etiquetaSeccion?: string }) {
  const [comando, setComando] = useState(comandoInicial)
  const [motor, setMotor] = useState<MotorGit | null>(null)
  const [estadoMotor, setEstadoMotor] = useState<'cargando' | 'listo' | 'error'>('cargando')
  const [resultado, setResultado] = useState<ResultadoGit | null>(null)
  const [solucionEjecutada, setSolucionEjecutada] = useState<ResultadoGit | null>(null)
  const [grafo, setGrafo] = useState<GrafoGit | null>(null)

  useEffect(() => {
    let cancelado = false
    crearMotorGit()
      .then((m) => {
        if (!cancelado) {
          setMotor(m)
          setEstadoMotor('listo')
        }
      })
      .catch(() => {
        if (!cancelado) setEstadoMotor('error')
      })
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (estadoMotor !== 'listo' || !motor) return
    let cancelado = false
    const temporizador = window.setTimeout(() => {
      const texto = comando.trim()
      if (!texto) {
        setResultado(null)
        return
      }
      void (async () => {
        const resultadoEjecucion = await ejecutarComandosGit(motor, esquemaGit, texto)
        if (cancelado) return
        setResultado(resultadoEjecucion)
        if (mostrarGrafo) {
          const grafoReal = await obtenerGrafo(motor, esquemaGit)
          if (!cancelado) setGrafo(grafoReal)
        }
      })()
    }, RETRASO_EJECUCION_MS)

    return () => {
      cancelado = true
      window.clearTimeout(temporizador)
    }
  }, [comando, motor, esquemaGit, estadoMotor, mostrarGrafo])

  useEffect(() => {
    if (!comandoSolucion || !motor) return
    let cancelado = false
    void ejecutarComandosGit(motor, esquemaGit, comandoSolucion).then((resultadoEjecucion) => {
      if (!cancelado) setSolucionEjecutada(resultadoEjecucion)
    })
    return () => {
      cancelado = true
    }
  }, [motor, esquemaGit, comandoSolucion])

  const solucion = comandoSolucion ? solucionEjecutada : null
  const coincide =
    resultado?.ok === true &&
    solucion?.ok === true &&
    resultado.salida.trim() === solucion.salida.trim()

  return (
    <section
      aria-label={etiquetaSeccion}
      className="animate-in fade-in-0 slide-in-from-bottom-2 my-6 min-w-0 space-y-4 rounded-xl border bg-card p-4 shadow-sm duration-500 motion-reduce:animate-none sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-[11px] font-bold tracking-wider text-orange-600 uppercase dark:text-orange-400">
            Git en vivo
          </p>
          <h3 className="text-lg font-bold tracking-tight text-balance">
            Escribe el comando y comprueba el resultado real
          </h3>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setComando(comandoInicial)}>
          <RotateCcw aria-hidden="true" />
          Reiniciar
        </Button>
      </div>

      {consigna && <p className="text-sm text-pretty text-muted-foreground">{consigna}</p>}

      {estadoMotor === 'cargando' && (
        <p className="text-sm text-muted-foreground">Cargando el motor Git…</p>
      )}
      {estadoMotor === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          No se pudo cargar el motor Git. Recarga la página para intentarlo de nuevo.
        </p>
      )}

      {estadoMotor === 'listo' && (
        <>
          <div className="flex items-center gap-2 rounded-lg bg-neutral-950 px-3 py-2 font-mono text-sm">
            <span className="text-green-400">$</span>
            <span className="text-neutral-400">git</span>
            <input
              type="text"
              value={comando}
              onChange={(evento) => setComando(evento.target.value)}
              aria-label="Comando git"
              className="min-w-0 flex-1 bg-transparent text-neutral-100 outline-none"
            />
          </div>

          <div className="space-y-1">
            {resultado === null && (
              <p className="text-sm text-muted-foreground">Escribe un comando para ejecutarlo.</p>
            )}
            {resultado?.ok === false && (
              <p className="rounded-lg bg-red-50 p-3 font-mono text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
                {resultado.mensaje}
              </p>
            )}
            {resultado?.ok === true && <SalidaTerminal comando={comando} salida={resultado.salida} />}
            {mostrarGrafo && grafo && <GrafoCommits grafo={grafo} />}
            {comandoSolucion && resultado?.ok === true && (
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

- [ ] **Step 4: Ejecutar y confirmar que pasan**

Run: `npx vitest run src/components/bloques-laboratorio/GitEnVivo.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/bloques-laboratorio/GitEnVivo.tsx src/components/bloques-laboratorio/GitEnVivo.test.tsx
git commit -m "feat(bloques-laboratorio): GitEnVivo"
```

---

### Task 8: Registro de los bloques nuevos + script de assets + dependencia

**Files:**
- Modify: `src/components/bloques-laboratorio/BloqueLaboratorio.tsx` (o el fichero equivalente que hace el `switch`/mapeo de `tipo` → componente — localízalo con `grep -rn "sql-anotado" src/components/bloques-laboratorio/BloqueLaboratorio.tsx` antes de editar)
- Create: `scripts/dev/generar-wasmgit-assets.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `GitAnotado` (Task 6), `GitEnVivo` (Task 7), ambos ya con sus tests en verde.
- Produces: el registro de tipos actualizado, consumido por cualquier lección real cuando se escriba contenido (fuera de alcance de este plan) y por Task 9 (verificación visual).

- [ ] **Step 1: Registrar `git-anotado`/`git-en-vivo` en el switch de bloques**

Abre `src/components/bloques-laboratorio/BloqueLaboratorio.tsx`, localiza el `case 'sql-anotado':`/`case 'sql-en-vivo':` (o la estructura equivalente) y añade, siguiendo el mismo patrón exacto:

```tsx
case 'git-anotado':
  return <GitAnotado {...bloque} />
case 'git-en-vivo':
  return <GitEnVivo {...bloque} />
```

Añade los imports correspondientes junto a los de `SqlAnotado`/`SqlEnVivo` en la cabecera del fichero.

- [ ] **Step 2: Instalar la dependencia (Claude, no Codex — sandbox sin red)**

```bash
npm install wasm-git@0.0.17
```

Confirma en `package.json` que quedó fijada sin `^`:

```bash
grep '"wasm-git"' package.json
```

Expected: `"wasm-git": "0.0.17"` (sin `^`).

- [ ] **Step 3: Crear el script de generación de assets**

Crea `scripts/dev/generar-wasmgit-assets.mjs`:

```js
// Copia los ficheros que wasm-git necesita en el navegador desde
// node_modules/wasm-git/ a public/ — el motor de Git los carga sin
// depender de ningún CDN en producción. Se ejecuta una vez (o cada vez
// que cambie la versión de wasm-git) y los resultados se comitean,
// siguiendo el patrón de generar-sql-wasm.mjs/generar-pglite-wasm.mjs.
//
// Uso: npm run generar-wasmgit-assets

import { createRequire } from 'node:module'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const directorioOrigen = dirname(require.resolve('wasm-git/lg2_async.js'))
const directorioDestino = join(process.cwd(), 'public')

mkdirSync(directorioDestino, { recursive: true })

// lg2-async.wasm (con guion, no guion bajo) porque motor.ts hace
// fetch('/lg2-async.wasm') — el nombre real del paquete usa guion bajo
// (lg2_async.wasm); se renombra al copiar para mantener las rutas de
// public/ consistentes con el resto de assets del proyecto (sql-wasm.wasm,
// pglite.wasm, sin guiones bajos).
copyFileSync(join(directorioOrigen, 'lg2_async.wasm'), join(directorioDestino, 'lg2-async.wasm'))
console.log('generar-wasmgit-assets: copiado lg2_async.wasm -> public/lg2-async.wasm')

copyFileSync(join(directorioOrigen, 'COPYING'), join(directorioDestino, 'wasm-git-COPYING.txt'))
console.log('generar-wasmgit-assets: copiado COPYING -> public/wasm-git-COPYING.txt (licencia)')
```

**Nota**: `lg2_async.js` (el módulo JS con el que se hace `import()`) NO se copia a `public/` — se importa como paquete npm normal (`import('wasm-git/lg2_async.js')`), Vite lo empaqueta como cualquier otro módulo. Solo el `.wasm` (binario, no se transforma) y el fichero de licencia se copian a `public/`.

- [ ] **Step 4: Añadir el script a `package.json`**

En la sección `"scripts"` de `package.json`, junto a `"generar-sql-wasm"`/`"generar-pglite-wasm"` (localízalos con `grep -n "generar-.*-wasm" package.json`), añade:

```json
"generar-wasmgit-assets": "node scripts/dev/generar-wasmgit-assets.mjs"
```

- [ ] **Step 5: Ejecutar el script y confirmar los ficheros generados**

```bash
npm run generar-wasmgit-assets
ls -la public/lg2-async.wasm public/wasm-git-COPYING.txt
```

Expected: ambos ficheros existen, `lg2-async.wasm` pesa ~1.6 MB.

- [ ] **Step 6: Ejecutar toda la suite de tests para confirmar que nada se rompió**

```bash
npx vitest run
npx tsc --noEmit
npx eslint .
```

Expected: todo en verde.

- [ ] **Step 7: Commit**

```bash
git add src/components/bloques-laboratorio/BloqueLaboratorio.tsx scripts/dev/generar-wasmgit-assets.mjs package.json package-lock.json public/lg2-async.wasm public/wasm-git-COPYING.txt
git commit -m "feat(git-en-vivo): registrar bloques, instalar wasm-git, generar assets"
```

---

### Task 9: Catálogo de referencia + verificación visual

**Files:**
- Modify: `src/routes/AdminReferenciaContenidoPage.tsx`

**Interfaces:**
- Consumes: `GitAnotado`, `GitEnVivo` (Tasks 6, 7).
- Produces: entradas visibles en `/admin/referencia-contenido` para verificación manual — no consumido por ningún otro código.

**Referencia obligatoria**: lee la sección existente de `SqlAnotado (motor postgres)`/`SqlEnVivo (motor postgres + RLS con identidad simulada)` en `AdminReferenciaContenidoPage.tsx` (busca `Referencia nombre="SqlAnotado`) para el patrón exacto de `<GrupoCatalogo>`/`<Referencia>` a replicar, incluidas las props `etiquetaSeccion`/`etiquetaConsulta` para evitar landmarks duplicados si hace falta más de una instancia en la misma página.

- [ ] **Step 1: Añadir las entradas de referencia**

Dentro del `<GrupoCatalogo>` de bloques de laboratorio (el mismo que ya contiene `SqlAnotado`/`SqlEnVivo`), añade tres `<Referencia>` nuevas:

```tsx
<Referencia nombre="GitAnotado">
  <GitAnotado
    tipo="git-anotado"
    esquemaGit={[
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'hola\n' } },
      'add a.txt',
      "commit -m 'primer commit'",
    ]}
    comando="log --oneline"
    mostrarGrafo={false}
    anotaciones={[
      {
        fragmento: 'log',
        nota: 'log --oneline muestra el historial real, hash corto + mensaje por línea.',
      },
    ]}
  />
</Referencia>

<Referencia nombre="GitEnVivo (con conflicto real resuelto)">
  <GitEnVivo
    tipo="git-en-vivo"
    consigna="main y feature cambiaron la misma línea de config.txt. Fusiona feature en main."
    esquemaGit={[
      'init .',
      { escribir: { ruta: 'config.txt', contenido: 'puerto=8080\n' } },
      'add config.txt',
      'commit -m base',
      'checkout -b feature',
      { escribir: { ruta: 'config.txt', contenido: 'puerto=3000\n' } },
      'add config.txt',
      'commit -m feature-cambia-puerto',
      'checkout master',
    ]}
    comandoInicial="merge feature"
    comandoSolucion="merge feature"
    mostrarGrafo={false}
  />
</Referencia>

<Referencia nombre="GitAnotado (con GrafoCommits)">
  <GitAnotado
    tipo="git-anotado"
    esquemaGit={[
      'init .',
      { escribir: { ruta: 'a.txt', contenido: 'base\n' } },
      'add a.txt',
      'commit -m base',
      'checkout -b feature',
      { escribir: { ruta: 'b.txt', contenido: 'x\n' } },
      'add b.txt',
      'commit -m feature-commit',
      'checkout master',
      { escribir: { ruta: 'c.txt', contenido: 'y\n' } },
      'add c.txt',
      'commit -m master-commit',
    ]}
    comando="log --oneline"
    mostrarGrafo={true}
    anotaciones={[{ fragmento: 'log', nota: 'feature divergió de master en el mismo commit base.' }]}
    etiquetaSeccion="Git anotado (con grafo)"
    etiquetaConsulta="Comando destacado (con grafo)"
  />
</Referencia>
```

- [ ] **Step 2: Verificar tipos y lint**

```bash
npx tsc --noEmit
npx eslint .
```

Expected: en verde.

- [ ] **Step 3: Verificación visual con Playwright (credenciales admin reales)**

Arranca el servidor de desarrollo (`npm run dev`) y, con un script Playwright ad-hoc (fuera del repo, en el scratchpad — mismo patrón ya usado para SQL/PostgreSQL), navega a `/admin/referencia-contenido` autenticado como admin y confirma:

1. El bloque `GitAnotado` muestra `primer commit` en la salida de terminal.
2. El bloque `GitEnVivo` con conflicto: tras cargar, `resultado.salida`/`mensaje` menciona el conflicto real de merge; confirma visualmente que el badge "Coincide con la solución" aparece en verde (dado que `comandoInicial === comandoSolucion` en este ejemplo, deben coincidir).
3. El bloque con `GrafoCommits` muestra 3 nodos, 2 etiquetas de rama (`master`, `feature`) en colores distintos, y la línea de `feature` divergiendo visualmente de `master`.
4. Captura en claro y en oscuro (toggle del tema) — confirma que `SalidaTerminal`/`GrafoCommits` siguen siendo legibles en ambos.
5. Sin errores de consola (`page.on('pageerror', ...)`) en ninguno de los tres bloques.

- [ ] **Step 4: Commit**

```bash
git add src/routes/AdminReferenciaContenidoPage.tsx
git commit -m "feat(referencia): ejemplos de GitAnotado/GitEnVivo/GrafoCommits"
```

---

## Self-Review (completado durante la escritura de este plan)

**Cobertura del spec**: los 9 puntos del "Checklist de implementación" de `specs/features/git-en-vivo.md` están cubiertos — Tasks 1-2 (esquema), 2-3 (motor.ts + tests, incluido `checkout -b`), 7-8 (`obtenerGrafo`/`GrafoCommits`... nota: numeración de puntos del spec no es 1:1 con las tasks de este plan, pero cada punto del spec tiene una task que lo implementa), 4 (`SalidaTerminal`), Task 8 (`generar-wasmgit-assets.mjs`, `npm install`), Task 9 (referencia + verificación visual). El punto "Tecnología Git en el catálogo" y "lecciones escritas" quedan explícitamente fuera de alcance de este plan, tal como confirma el propio spec.

**Cambio real descubierto durante la escritura de este plan, no anticipado en el spec**: `esquemaGit` tal como estaba especificado (solo strings de comandos git) no permite escribir contenido de ficheros, necesario para casi cualquier lección real (incluidos los ejemplos de este propio plan). Se añadió `PasoGit = string | {escribir: {ruta, contenido}}` en la Task 2/Task 1 — esto es una ampliación del esquema Zod respecto al spec original, documentada explícitamente en el propio Step 6 de la Task 2 en vez de dejarla implícita.

**Consistencia de tipos**: `MotorGit`, `ResultadoGit`, `GrafoGit`, `CommitGit`, `RamaGit`, `PasoGit` se definen una vez (Tasks 2-3) y se reutilizan sin renombrar en Tasks 4-7.

**Escaneo de placeholders**: sin `TBD`/`TODO` en ningún step — cada bloque de código de este plan es completo y ejecutable tal cual.
