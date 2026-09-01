# Consolidar repos de proyecto avanzado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar los 18 repos de GitHub de "proyecto avanzado" (uno por proyecto) en 5 repos (uno por tecnología: SQL, PostgreSQL, Node.js, TypeScript, JavaScript), cada uno con rama `main`/`solucion` y una carpeta por proyecto, actualizar las 18 lecciones ya publicadas + 3 `TEMARIO.md` + 1 mención incidental con las nuevas URLs, y dejar los 18 repos viejos en privado (sin borrar) una vez todo verificado.

**Architecture:** Un script Node reutilizable (`migrar-repo-tecnologia.mjs`, vive en el scratchpad — herramienta de migración de un solo uso, no forma parte del repo de la app) crea cada repo nuevo y copia el contenido de los repos viejos a carpetas, por rama. Cada una de las 5 tareas de este plan invoca ese script con los datos de su tecnología, actualiza el contenido de sus lecciones, y verifica de verdad (tests reales o Playwright) antes de continuar. La tarea final pone los 18 repos viejos en privado, solo después de que las 5 anteriores estén verificadas.

**Tech Stack:** `gh` CLI, `git`, Node.js (script de migración), Playwright (verificación visual), `scripts/security/scan_secrets.sh` (scanner de secretos ya existente en este repo).

**Spec:** `docs/superpowers/specs/2026-09-01-consolidar-repos-proyectos-avanzados-design.md` — mapa de migración completo, checkpoints de seguridad, contexto completo.

## Global Constraints

- No se conserva el historial de commits de los repos viejos al migrar (spec: "scaffolds generados, no código con valor histórico propio").
- Los 5 repos nuevos se crean **públicos** (`--public`), igual que los viejos.
- Los 18 repos viejos **no se borran nunca** — solo pasan a privado, y solo en la Tarea 6, solo después de verificar las Tareas 1-5.
- Antes de cualquier `git push` de contenido migrado: `bash scripts/security/scan_secrets.sh <ruta>` sobre el contenido copiado, sin hallazgos HIGH/CRITICAL reales (el `.env` del propio `tech-study-tracker` es un falso positivo conocido y no aplica aquí — estos repos nuevos no lo contienen).
- Nombre de cada repo nuevo: `<tecnologia>-proyectos-avanzados` (sql, postgresql, nodejs, typescript, javascript).
- Nombre de cada carpeta: el nombre del proyecto sin el sufijo de tecnología (ver tabla de mapeo en cada tarea).
- Las 18 lecciones son lecciones **ya publicadas** — cualquier cambio de contenido debe sincronizarse con la base de datos real vía el editor de administración (`http://localhost:5173/admin/tecnologias/<id>/lecciones/<id>/editar`), verificado con Playwright, no solo con el fichero local en `contenido/`.
- Credenciales admin para Playwright: `TST_EMAIL="escaneruclm@gmail.com" TST_PASSWORD="Pedro123456789."`.
- Ejecutable de Chromium para Playwright (ya usado toda la sesión): `/Users/pedroleridanieto/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`, cargado desde `/Users/pedroleridanieto/.npm-global/lib/node_modules/@playwright/cli/node_modules/playwright/index.mjs`.

---

## Herramienta compartida: `migrar-repo-tecnologia.mjs`

Se crea **una sola vez**, en la Tarea 1, y se reutiliza (con datos distintos) en las Tareas 2-5. Vive en
`/private/tmp/claude-501/-Users-pedroleridanieto-Desktop-Proyectos-IA/b2019b2f-f8b6-4cb4-b70a-9f1bab3b25f6/scratchpad/migrar-repo-tecnologia.mjs`
(o el directorio de scratchpad de la sesión que ejecute este plan — no se comitea a `tech-study-tracker`, es una herramienta de un solo uso).

**Contrato del script:**

- Entrada: un fichero de configuración JSON (uno por tecnología) con esta forma:

```json
{
  "repoNuevo": "sql-proyectos-avanzados",
  "descripcion": "Proyectos avanzados de SQL — Tech Study Tracker",
  "proyectos": [
    { "repoViejo": "inventario-transaccional-sqlite", "carpeta": "inventario-transaccional", "titulo": "Inventario transaccional (SQLite)" }
  ]
}
```

- Uso: `node migrar-repo-tecnologia.mjs config-sql.json`
- Efecto: crea el repo `pedroleni/<repoNuevo>` (público), y puebla sus ramas `main`/`solucion` con el contenido de cada proyecto en su carpeta correspondiente, más un `README.md` raíz de índice. No hace push automáticamente — deja el repo local listo en `./<repoNuevo>/` para que quien ejecuta revise el `scan_secrets.sh` y haga el push a mano (paso explícito de cada tarea, nunca implícito dentro del script).

**Código completo** (crear este fichero exactamente así en la Tarea 1, Step 1):

```js
#!/usr/bin/env node
// migrar-repo-tecnologia.mjs — herramienta de un solo uso para consolidar
// los repos de "proyecto avanzado" por tecnología. Ver
// docs/superpowers/specs/2026-09-01-consolidar-repos-proyectos-avanzados-design.md
//
// Uso: node migrar-repo-tecnologia.mjs config.json
// No hace push ni gh repo create — solo prepara el repo local en ./<repoNuevo>/
// con las dos ramas (main, solucion) listas. El push y la creación del
// repo remoto son pasos explícitos de cada tarea, para poder revisar el
// scanner de secretos entre medias.

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const rutaConfig = process.argv[2]
if (!rutaConfig) {
  console.error('Uso: node migrar-repo-tecnologia.mjs config.json')
  process.exit(1)
}
const config = JSON.parse(readFileSync(rutaConfig, 'utf8'))

function ejecutar(comando, opciones = {}) {
  console.log(`$ ${comando}`)
  execSync(comando, { stdio: 'inherit', ...opciones })
}

function copiarDirectorio(origen, destino) {
  mkdirSync(destino, { recursive: true })
  for (const nombre of readdirSync(origen)) {
    if (nombre === '.git') continue
    ejecutar(`cp -R "${join(origen, nombre)}" "${join(destino, nombre)}"`)
  }
}

const dirRepoNuevo = join(process.cwd(), config.repoNuevo)
if (existsSync(dirRepoNuevo)) {
  console.error(`${dirRepoNuevo} ya existe — bórralo antes de re-ejecutar`)
  process.exit(1)
}
mkdirSync(dirRepoNuevo)

function generarReadmeIndice() {
  const lineas = [
    `# ${config.repoNuevo}`,
    '',
    'Proyectos avanzados de Tech Study Tracker para esta tecnología. Cada',
    'carpeta es un proyecto independiente, con su propio `package.json` —',
    '**entra en la carpeta (`cd <carpeta>`) antes de instalar dependencias**',
    'o ejecutar nada.',
    '',
    '## Proyectos',
    '',
  ]
  for (const p of config.proyectos) {
    lineas.push(`- [\`${p.carpeta}\`](./${p.carpeta}) — ${p.titulo}`)
  }
  lineas.push('')
  lineas.push(
    'La rama `main` de este repo tiene el punto de partida de cada proyecto',
    '(con TODOs); la rama `solucion` tiene la implementación completa de',
    'todos ellos, por si te atascas en alguno.',
    '',
  )
  return lineas.join('\n')
}

function lineaUbicacion(carpeta) {
  return `> Este proyecto vive en la carpeta \`${carpeta}/\` de un repo con varios proyectos — clónalo entero y haz \`cd ${carpeta}\` antes de los pasos siguientes.\n\n`
}

function poblarRama(nombreRama) {
  ejecutar(`git checkout --orphan ${nombreRama}`, { cwd: dirRepoNuevo })
  ejecutar('git rm -rf . 2>/dev/null || true', { cwd: dirRepoNuevo, shell: '/bin/bash' })

  for (const proyecto of config.proyectos) {
    const dirTemporal = join(dirRepoNuevo, `__tmp-${proyecto.carpeta}`)
    ejecutar(
      `git clone --branch ${nombreRama} --depth 1 https://github.com/pedroleni/${proyecto.repoViejo}.git "${dirTemporal}"`,
    )
    const dirDestino = join(dirRepoNuevo, proyecto.carpeta)
    copiarDirectorio(dirTemporal, dirDestino)
    rmSync(dirTemporal, { recursive: true, force: true })

    const rutaReadme = join(dirDestino, 'README.md')
    if (existsSync(rutaReadme)) {
      const original = readFileSync(rutaReadme, 'utf8')
      writeFileSync(rutaReadme, lineaUbicacion(proyecto.carpeta) + original)
    }
  }

  writeFileSync(join(dirRepoNuevo, 'README.md'), generarReadmeIndice())

  ejecutar('git add -A', { cwd: dirRepoNuevo })
  ejecutar(
    `git commit -m "Importa los proyectos de ${config.repoNuevo} (rama ${nombreRama})"`,
    { cwd: dirRepoNuevo },
  )
}

ejecutar(`git init -b main "${dirRepoNuevo}"`)
poblarRama('main')
poblarRama('solucion')
ejecutar('git checkout main', { cwd: dirRepoNuevo })

console.log(`\nListo: ${dirRepoNuevo} tiene main+solucion pobladas localmente.`)
console.log('Siguiente paso: scan_secrets.sh, gh repo create, git remote add, git push --all.')
```

---

### Task 1: SQL — `sql-proyectos-avanzados`

**Files:**
- Create (scratchpad, no comitear a `tech-study-tracker`): `migrar-repo-tecnologia.mjs`, `config-sql.json`
- Modify: `contenido/sql/46-proyecto-avanzado-inventario-transaccional.md`, `contenido/sql/47-proyecto-avanzado-analitica-ventas-ventana.md`, `contenido/sql/48-proyecto-avanzado-catalogo-jerarquico-cte.md`, `contenido/sql/49-proyecto-avanzado-reportes-vistas-sql.md`, `contenido/sql/TEMARIO.md`

**Interfaces:**
- Consumes: nada de tareas anteriores (primera tarea).
- Produces: el script `migrar-repo-tecnologia.mjs`, reutilizado tal cual (mismo fichero, distinto `config-*.json`) por las Tareas 2-5.

**Mapa de este proyecto** (repo viejo → carpeta nueva):

| Repo viejo | Carpeta | Lección |
|---|---|---|
| `inventario-transaccional-sqlite` | `inventario-transaccional` | `contenido/sql/46-proyecto-avanzado-inventario-transaccional.md` |
| `analitica-ventas-funciones-ventana` | `analitica-ventas-ventana` | `contenido/sql/47-proyecto-avanzado-analitica-ventas-ventana.md` |
| `catalogo-jerarquico-cte-recursiva` | `catalogo-jerarquico-cte` | `contenido/sql/48-proyecto-avanzado-catalogo-jerarquico-cte.md` |
| `reportes-ventas-vistas-sql` | `reportes-vistas-sql` | `contenido/sql/49-proyecto-avanzado-reportes-vistas-sql.md` |

- [x] **Step 1: Crear el script de migración y el config de SQL**

Crear `migrar-repo-tecnologia.mjs` con el código completo dado en la
sección "Herramienta compartida" de arriba, en el directorio de
scratchpad de la sesión.

Crear `config-sql.json`, en el mismo directorio:

```json
{
  "repoNuevo": "sql-proyectos-avanzados",
  "descripcion": "Proyectos avanzados de SQL — Tech Study Tracker",
  "proyectos": [
    { "repoViejo": "inventario-transaccional-sqlite", "carpeta": "inventario-transaccional", "titulo": "Inventario transaccional (SQLite) — transacciones reales, aislamiento y consistencia" },
    { "repoViejo": "analitica-ventas-funciones-ventana", "carpeta": "analitica-ventas-ventana", "titulo": "Analítica de ventas con funciones de ventana" },
    { "repoViejo": "catalogo-jerarquico-cte-recursiva", "carpeta": "catalogo-jerarquico-cte", "titulo": "Catálogo jerárquico con CTE recursiva" },
    { "repoViejo": "reportes-ventas-vistas-sql", "carpeta": "reportes-vistas-sql", "titulo": "Reportes de ventas con vistas SQL" }
  ]
}
```

- [x] **Step 2: Ejecutar la migración local**

```bash
cd <directorio-scratchpad>
node migrar-repo-tecnologia.mjs config-sql.json
```

Expected: termina con "Listo: sql-proyectos-avanzados tiene main+solucion
pobladas localmente." Verificar a mano: `ls sql-proyectos-avanzados/`
(rama `main` activa) debe mostrar las 4 carpetas + `README.md`; `cd
sql-proyectos-avanzados && git log --oneline --all` debe mostrar 2
commits (uno en `main`, uno en `solucion`).

- [x] **Step 3: Escanear secretos antes de crear nada remoto**

```bash
bash "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker/scripts/security/scan_secrets.sh" sql-proyectos-avanzados
```

Expected: sin hallazgos `[HIGH]`/`[CRITICAL]` reales (a diferencia del
repo de la app, aquí no hay ningún `.env` — cualquier hallazgo real
debe investigarse antes de continuar, no descartarse por rutina).

- [x] **Step 4: Crear el repo remoto y hacer push**

```bash
cd sql-proyectos-avanzados
gh repo create pedroleni/sql-proyectos-avanzados --public --description "Proyectos avanzados de SQL — Tech Study Tracker"
git remote add origin git@github.com:pedroleni/sql-proyectos-avanzados.git
git push -u origin main
git push -u origin solucion
```

Expected: ambas ramas visibles en
`https://github.com/pedroleni/sql-proyectos-avanzados`.

- [x] **Step 5: Verificación real — al menos un proyecto funciona igual que antes**

`inventario-transaccional-sqlite` es un proyecto Node con test suite
propia (confirmado con `gh api repos/pedroleni/inventario-transaccional-sqlite/contents`
antes de escribir este plan). Clonar la copia migrada y ejecutar sus
tests de verdad:

```bash
git clone --branch solucion https://github.com/pedroleni/sql-proyectos-avanzados.git /tmp/verificar-sql
cd /tmp/verificar-sql/inventario-transaccional
npm install
npm test
```

Expected: los tests pasan (mismo resultado que si se ejecutaran contra
el repo viejo `inventario-transaccional-sqlite`, rama `solucion` —
si hay dudas, ejecutarlos también contra el repo viejo para comparar
antes de seguir).

- [x] **Step 6: Actualizar las 4 lecciones + TEMARIO.md (ficheros locales)**

Para cada una de las 4 lecciones de la tabla de arriba: leer el
fichero completo, localizar toda mención a
`github.com/pedroleni/<repo-viejo>` (el callout "El repositorio", los
enlaces de "Para profundizar" con `/tree/main` y `/tree/solucion`, y
cualquier instrucción de "clona y ejecuta"), y sustituir por:

- URL base nueva: `github.com/pedroleni/sql-proyectos-avanzados`
- Rama + carpeta: `.../tree/main/<carpeta>` y `.../tree/solucion/<carpeta>`
- Instrucción de ejecución: añadir `cd <carpeta> && ` antes de
  `npm install`/`npx serve`/lo que indique cada lección (ej.: antes decía
  "Clona el repositorio y ejecuta `npm install`", ahora "Clona el
  repositorio, entra en `inventario-transaccional/` y ejecuta `npm
  install`").

Aplicar el mismo tipo de sustitución a `contenido/sql/TEMARIO.md` (solo
referencia de autoría, no se sincroniza a ninguna lección publicada).

- [x] **Step 7: Validar los bloques `laboratorio` de las 4 lecciones contra el esquema Zod**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
cat > src/lib/laboratorio/_debug-validar-sql-migrado.test.ts << 'EOF'
import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { esquemaBloqueLaboratorio } from './schemas'

const archivos = [
  'contenido/sql/46-proyecto-avanzado-inventario-transaccional.md',
  'contenido/sql/47-proyecto-avanzado-analitica-ventas-ventana.md',
  'contenido/sql/48-proyecto-avanzado-catalogo-jerarquico-cte.md',
  'contenido/sql/49-proyecto-avanzado-reportes-vistas-sql.md',
]

it('valida los bloques laboratorio de las 4 lecciones de SQL tras la migracion', () => {
  for (const archivo of archivos) {
    const contenido = readFileSync(archivo, 'utf8')
    const regex = /```laboratorio\n([\s\S]*?)\n```/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(contenido)) !== null) {
      const bloque = JSON.parse(m[1])
      const resultado = esquemaBloqueLaboratorio.safeParse(bloque)
      expect(resultado.success, `${archivo}: ${JSON.stringify(resultado.success ? null : resultado.error.issues)}`).toBe(true)
    }
  }
})
EOF
npx vitest run src/lib/laboratorio/_debug-validar-sql-migrado.test.ts
rm src/lib/laboratorio/_debug-validar-sql-migrado.test.ts
```

Expected: `1 passed (1)`.

- [x] **Step 8: Sincronizar las 4 lecciones con la base de datos real**

Arrancar el servidor de dev (`npm run dev`), y para cada una de las 4
lecciones: iniciar sesión de administrador con Playwright, ir a
`/admin/tecnologias/<id-tecnologia-sql>/lecciones/<id-leccion>/editar`
(el `id-leccion` se obtiene navegando la página pública de la
tecnología SQL y leyendo el `href` del enlace "Editar" de cada
lección, igual que se hizo en esta sesión para TypeScript), leer el
`value` actual del `textarea#leccion-contenido`, aplicar la misma
sustitución del Step 6 sobre ese texto (debe encontrarse literalmente
— si no, parar y revisar por qué diverge del fichero local antes de
continuar), rellenar el campo con el resultado, y pulsar "Guardar".

- [x] **Step 9: Verificación visual de una lección actualizada**

Con Playwright: navegar a la lección pública de
`inventario-transaccional` ya actualizada, confirmar que el callout
del repositorio muestra la URL nueva
(`github.com/pedroleni/sql-proyectos-avanzados`) y que el enlace de
"Para profundizar" apunta a
`https://github.com/pedroleni/sql-proyectos-avanzados/tree/main/inventario-transaccional`.
Capturar pantalla para verificación humana.

- [x] **Step 10: Suite completa + commit**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
npx vitest run
npx tsc --noEmit
npx eslint .
git checkout main --quiet
git checkout -b docs/consolidar-sql-proyectos-avanzados --quiet
git add contenido/sql/
git commit -m "docs(sql): apuntar los 4 proyectos avanzados a sql-proyectos-avanzados"
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git merge docs/consolidar-sql-proyectos-avanzados --no-edit
git branch -d docs/consolidar-sql-proyectos-avanzados
```

Expected: `347 passed` (o más, si se han añadido tests desde entonces),
`tsc`/`eslint` limpios, commit hecho sobre la rama de esta iniciativa
(`docs/consolidar-repos-proyectos-avanzados`, ya creada al escribir el
spec — no se fusiona a `main` hasta el final de la Tarea 6).

---

### Task 2: PostgreSQL — `postgresql-proyectos-avanzados`

**Files:**
- Create: `config-postgresql.json` (scratchpad, mismo script de la Tarea 1)
- Modify: `contenido/postgresql/62-proyecto-avanzado-reservas-multi-tenant-con-rls.md`, `contenido/postgresql/63-proyecto-avanzado-buscador-fts.md`, `contenido/postgresql/64-proyecto-avanzado-auditoria-particionada.md`, `contenido/postgresql/65-proyecto-avanzado-analitica-eventos-jsonb.md`

**Interfaces:**
- Consumes: `migrar-repo-tecnologia.mjs` (Tarea 1) tal cual, sin ninguna modificación.
- Produces: nada consumido por tareas posteriores más allá del propio repo `postgresql-proyectos-avanzados`.

**Mapa de este proyecto:**

| Repo viejo | Carpeta | Lección |
|---|---|---|
| `reservas-multi-tenant-rls` | `reservas-multi-tenant-rls` | `contenido/postgresql/62-proyecto-avanzado-reservas-multi-tenant-con-rls.md` |
| `buscador-fts-postgres` | `buscador-fts` | `contenido/postgresql/63-proyecto-avanzado-buscador-fts.md` |
| `auditoria-particionada` | `auditoria-particionada` | `contenido/postgresql/64-proyecto-avanzado-auditoria-particionada.md` |
| `analitica-eventos-jsonb` | `analitica-eventos-jsonb` | `contenido/postgresql/65-proyecto-avanzado-analitica-eventos-jsonb.md` |

(`reservas-multi-tenant-rls` y `auditoria-particionada` mantienen el
mismo nombre de carpeta que de repo — no llevaban sufijo de tecnología
que quitar.)

- [x] **Step 1: Crear el config de PostgreSQL**

```json
{
  "repoNuevo": "postgresql-proyectos-avanzados",
  "descripcion": "Proyectos avanzados de PostgreSQL — Tech Study Tracker",
  "proyectos": [
    { "repoViejo": "reservas-multi-tenant-rls", "carpeta": "reservas-multi-tenant-rls", "titulo": "Reservas multi-tenant con Row Level Security real" },
    { "repoViejo": "buscador-fts-postgres", "carpeta": "buscador-fts", "titulo": "Buscador con Full Text Search de Postgres" },
    { "repoViejo": "auditoria-particionada", "carpeta": "auditoria-particionada", "titulo": "Auditoría con tablas particionadas" },
    { "repoViejo": "analitica-eventos-jsonb", "carpeta": "analitica-eventos-jsonb", "titulo": "Analítica de eventos con JSONB" }
  ]
}
```

- [x] **Step 2: Ejecutar la migración local**

```bash
cd <directorio-scratchpad>
node migrar-repo-tecnologia.mjs config-postgresql.json
```

Expected: igual que Task 1 Step 2, adaptado a `postgresql-proyectos-avanzados`
y sus 4 carpetas.

- [x] **Step 3: Escanear secretos**

```bash
bash "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker/scripts/security/scan_secrets.sh" postgresql-proyectos-avanzados
```

Expected: sin hallazgos `[HIGH]`/`[CRITICAL]` reales. Prestar atención
especial aquí: al menos uno de estos proyectos usa `docker-compose.yml`
(confirmado en la validación del spec) — revisar que no incluya
contraseñas reales de una instancia de desarrollo personal, solo
valores de ejemplo (`postgres`/`postgres` o similar, típico de
`docker-compose` de desarrollo).

- [x] **Step 4: Crear el repo remoto y hacer push**

```bash
cd postgresql-proyectos-avanzados
gh repo create pedroleni/postgresql-proyectos-avanzados --public --description "Proyectos avanzados de PostgreSQL — Tech Study Tracker"
git remote add origin git@github.com:pedroleni/postgresql-proyectos-avanzados.git
git push -u origin main
git push -u origin solucion
```

- [x] **Step 5: Verificación real**

Todos los proyectos de PostgreSQL necesitan una instancia real de
Postgres (vía `docker-compose.yml`, confirmado en la validación del
spec) — antes de ejecutar tests, levantar el contenedor:

```bash
git clone --branch solucion https://github.com/pedroleni/postgresql-proyectos-avanzados.git /tmp/verificar-postgresql
cd /tmp/verificar-postgresql/analitica-eventos-jsonb
docker compose up -d
npm install
npm test
docker compose down
```

Expected: los tests pasan de verdad contra una instancia real de
Postgres. Si `docker` no está disponible en el entorno de ejecución,
documentarlo explícitamente en el resultado de este step (no marcarlo
como hecho sin haberlo comprobado) y verificar en su lugar que
`npm run build`/`tsc --noEmit` del proyecto migrado no tiene errores,
dejando constancia de que la verificación de integración con Postgres
real queda pendiente para cuando haya `docker` disponible.

- [x] **Step 6: Actualizar las 4 lecciones (mismo procedimiento que Task 1 Step 6)**

Mismas sustituciones (URL base `github.com/pedroleni/postgresql-proyectos-avanzados`,
`/tree/main/<carpeta>` y `/tree/solucion/<carpeta>`, `cd <carpeta> &&`
antes de instrucciones de ejecución) sobre las 4 lecciones de la tabla
de mapeo de esta tarea. PostgreSQL no tiene `TEMARIO.md` con enlaces a
repos (confirmado al escribir el spec) — no hay fichero de índice que
tocar aquí.

- [x] **Step 7: Validar los bloques `laboratorio` contra el esquema Zod**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
cat > src/lib/laboratorio/_debug-validar-postgresql-migrado.test.ts << 'EOF'
import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { esquemaBloqueLaboratorio } from './schemas'

const archivos = [
  'contenido/postgresql/62-proyecto-avanzado-reservas-multi-tenant-con-rls.md',
  'contenido/postgresql/63-proyecto-avanzado-buscador-fts.md',
  'contenido/postgresql/64-proyecto-avanzado-auditoria-particionada.md',
  'contenido/postgresql/65-proyecto-avanzado-analitica-eventos-jsonb.md',
]

it('valida los bloques laboratorio de las 4 lecciones de PostgreSQL tras la migracion', () => {
  for (const archivo of archivos) {
    const contenido = readFileSync(archivo, 'utf8')
    const regex = /```laboratorio\n([\s\S]*?)\n```/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(contenido)) !== null) {
      const bloque = JSON.parse(m[1])
      const resultado = esquemaBloqueLaboratorio.safeParse(bloque)
      expect(resultado.success, `${archivo}: ${JSON.stringify(resultado.success ? null : resultado.error.issues)}`).toBe(true)
    }
  }
})
EOF
npx vitest run src/lib/laboratorio/_debug-validar-postgresql-migrado.test.ts
rm src/lib/laboratorio/_debug-validar-postgresql-migrado.test.ts
```

Expected: `1 passed (1)`.

- [x] **Step 8: Sincronizar las 4 lecciones con la base de datos real**

Mismo procedimiento que Task 1 Step 8, con el id de la tecnología
PostgreSQL y las 4 lecciones de esta tarea.

- [x] **Step 9: Verificación visual**

Mismo procedimiento que Task 1 Step 9, sobre una de las 4 lecciones de
PostgreSQL (por ejemplo `analitica-eventos-jsonb`).

- [x] **Step 10: Suite completa + commit**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
npx vitest run
npx tsc --noEmit
npx eslint .
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git checkout -b docs/consolidar-postgresql-proyectos-avanzados --quiet
git add contenido/postgresql/
git commit -m "docs(postgresql): apuntar los 4 proyectos avanzados a postgresql-proyectos-avanzados"
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git merge docs/consolidar-postgresql-proyectos-avanzados --no-edit
git branch -d docs/consolidar-postgresql-proyectos-avanzados
```

---

### Task 3: Node.js — `nodejs-proyectos-avanzados`

**Files:**
- Create: `config-nodejs.json` (scratchpad)
- Modify: `contenido/nodejs/52-proyecto-avanzado-api-rest-con-autenticacion-jwt.md`, `contenido/nodejs/53-proyecto-avanzado-procesador-de-webhooks-con-firma-hmac.md`, `contenido/nodejs/54-proyecto-avanzado-acortador-de-urls-con-rate-limiting.md`, `contenido/nodejs/55-proyecto-avanzado-procesador-de-ventas-por-lotes.md`

**Interfaces:**
- Consumes: `migrar-repo-tecnologia.mjs` (Tarea 1), sin modificar.
- Produces: nada consumido por tareas posteriores.

**Mapa de este proyecto:**

| Repo viejo | Carpeta | Lección |
|---|---|---|
| `api-auth-jwt` | `api-auth-jwt` | `contenido/nodejs/52-proyecto-avanzado-api-rest-con-autenticacion-jwt.md` |
| `procesador-webhooks` | `procesador-webhooks` | `contenido/nodejs/53-proyecto-avanzado-procesador-de-webhooks-con-firma-hmac.md` |
| `acortador-rate-limit` | `acortador-rate-limit` | `contenido/nodejs/54-proyecto-avanzado-acortador-de-urls-con-rate-limiting.md` |
| `procesador-ventas-streams` | `procesador-ventas-streams` | `contenido/nodejs/55-proyecto-avanzado-procesador-de-ventas-por-lotes.md` |

(Ninguno de los 4 lleva sufijo de tecnología en su nombre de repo —
carpeta y repo viejo coinciden.)

- [x] **Step 1: Crear el config de Node.js**

```json
{
  "repoNuevo": "nodejs-proyectos-avanzados",
  "descripcion": "Proyectos avanzados de Node.js — Tech Study Tracker",
  "proyectos": [
    { "repoViejo": "api-auth-jwt", "carpeta": "api-auth-jwt", "titulo": "API REST con autenticación JWT construida a mano + node:sqlite" },
    { "repoViejo": "procesador-webhooks", "carpeta": "procesador-webhooks", "titulo": "Procesador de webhooks con firma HMAC y reintentos" },
    { "repoViejo": "acortador-rate-limit", "carpeta": "acortador-rate-limit", "titulo": "Acortador de URLs con rate limiting (token bucket)" },
    { "repoViejo": "procesador-ventas-streams", "carpeta": "procesador-ventas-streams", "titulo": "Procesador de ventas por lotes con streams reales y backpressure" }
  ]
}
```

- [x] **Step 2: Ejecutar la migración local**

```bash
cd <directorio-scratchpad>
node migrar-repo-tecnologia.mjs config-nodejs.json
```

- [x] **Step 3: Escanear secretos**

```bash
bash "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker/scripts/security/scan_secrets.sh" nodejs-proyectos-avanzados
```

Prestar atención especial: `api-auth-jwt` construye JWT a mano —
revisar que no quede ningún secreto de firma real hardcodeado más allá
de un valor de ejemplo evidente (`"secreto-de-desarrollo"` o similar).

- [x] **Step 4: Crear el repo remoto y hacer push**

```bash
cd nodejs-proyectos-avanzados
gh repo create pedroleni/nodejs-proyectos-avanzados --public --description "Proyectos avanzados de Node.js — Tech Study Tracker"
git remote add origin git@github.com:pedroleni/nodejs-proyectos-avanzados.git
git push -u origin main
git push -u origin solucion
```

- [x] **Step 5: Verificación real**

```bash
git clone --branch solucion https://github.com/pedroleni/nodejs-proyectos-avanzados.git /tmp/verificar-nodejs
cd /tmp/verificar-nodejs/procesador-webhooks
npm install
npm test
```

Expected: los tests pasan. Repetir para al menos un segundo proyecto
de esta tanda si el primero no tuviera test suite propia (comprobar
con `ls` tras el clon — si no hay `tests/` ni script `test` en
`package.json`, probar con `acortador-rate-limit` en su lugar antes de
continuar).

- [x] **Step 6: Actualizar las 4 lecciones**

Mismo patrón (URL base `github.com/pedroleni/nodejs-proyectos-avanzados`,
`/tree/main/<carpeta>`, `/tree/solucion/<carpeta>`, `cd <carpeta> &&`).
Node.js no tiene `TEMARIO.md` con enlaces a repos (confirmado al
escribir el spec).

- [x] **Step 7: Validar los bloques `laboratorio` contra el esquema Zod**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
cat > src/lib/laboratorio/_debug-validar-nodejs-migrado.test.ts << 'EOF'
import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { esquemaBloqueLaboratorio } from './schemas'

const archivos = [
  'contenido/nodejs/52-proyecto-avanzado-api-rest-con-autenticacion-jwt.md',
  'contenido/nodejs/53-proyecto-avanzado-procesador-de-webhooks-con-firma-hmac.md',
  'contenido/nodejs/54-proyecto-avanzado-acortador-de-urls-con-rate-limiting.md',
  'contenido/nodejs/55-proyecto-avanzado-procesador-de-ventas-por-lotes.md',
]

it('valida los bloques laboratorio de las 4 lecciones de Node.js tras la migracion', () => {
  for (const archivo of archivos) {
    const contenido = readFileSync(archivo, 'utf8')
    const regex = /```laboratorio\n([\s\S]*?)\n```/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(contenido)) !== null) {
      const bloque = JSON.parse(m[1])
      const resultado = esquemaBloqueLaboratorio.safeParse(bloque)
      expect(resultado.success, `${archivo}: ${JSON.stringify(resultado.success ? null : resultado.error.issues)}`).toBe(true)
    }
  }
})
EOF
npx vitest run src/lib/laboratorio/_debug-validar-nodejs-migrado.test.ts
rm src/lib/laboratorio/_debug-validar-nodejs-migrado.test.ts
```

Expected: `1 passed (1)`.

- [x] **Step 8: Sincronizar las 4 lecciones con la base de datos real**

Igual que en la migración de SQL: arrancar el servidor de dev, para
cada una de las 4 lecciones de la tabla de mapeo de esta tarea,
iniciar sesión de administrador con Playwright, ir a
`/admin/tecnologias/<id-tecnologia-nodejs>/lecciones/<id-leccion>/editar`,
leer el `value` actual de `textarea#leccion-contenido`, aplicar la
sustitución del Step 6 (debe encontrarse literalmente — si no, parar y
revisar antes de continuar), rellenar el campo, pulsar "Guardar".

- [x] **Step 9: Verificación visual**

Con Playwright: navegar a la lección pública ya actualizada de uno de
los 4 proyectos de Node.js (por ejemplo `procesador-webhooks`),
confirmar que el callout del repositorio muestra
`github.com/pedroleni/nodejs-proyectos-avanzados` y que el enlace de
"Para profundizar" apunta a
`https://github.com/pedroleni/nodejs-proyectos-avanzados/tree/main/procesador-webhooks`.
Capturar pantalla para verificación humana.

- [x] **Step 10: Suite completa + commit**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
npx vitest run
npx tsc --noEmit
npx eslint .
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git checkout -b docs/consolidar-nodejs-proyectos-avanzados --quiet
git add contenido/nodejs/
git commit -m "docs(nodejs): apuntar los 4 proyectos avanzados a nodejs-proyectos-avanzados"
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git merge docs/consolidar-nodejs-proyectos-avanzados --no-edit
git branch -d docs/consolidar-nodejs-proyectos-avanzados
```

---

### Task 4: TypeScript — `typescript-proyectos-avanzados`

**Files:**
- Create: `config-typescript.json` (scratchpad)
- Modify: `contenido/typescript/55-proyecto-avanzado-buscador-de-personajes-con-typescript.md`, `contenido/typescript/56-proyecto-avanzado-bus-de-eventos-tipado.md`, `contenido/typescript/57-proyecto-avanzado-cliente-tipado-con-zod.md`, `contenido/typescript/58-proyecto-avanzado-maquina-de-estados-tipada.md`, `contenido/typescript/36-erasablesyntaxonly.md`, `contenido/typescript/TEMARIO.md`

**Interfaces:**
- Consumes: `migrar-repo-tecnologia.mjs` (Tarea 1), sin modificar.
- Produces: nada consumido por tareas posteriores.

**Mapa de este proyecto:**

| Repo viejo | Carpeta | Lección |
|---|---|---|
| `buscador-personajes-ts` | `buscador-personajes` | `contenido/typescript/55-proyecto-avanzado-buscador-de-personajes-con-typescript.md` (+ mención en `36-erasablesyntaxonly.md`) |
| `bus-eventos-ts` | `bus-eventos` | `contenido/typescript/56-proyecto-avanzado-bus-de-eventos-tipado.md` |
| `cliente-tipado-zod` | `cliente-zod` | `contenido/typescript/57-proyecto-avanzado-cliente-tipado-con-zod.md` |
| `maquina-estados-ts` | `maquina-estados` | `contenido/typescript/58-proyecto-avanzado-maquina-de-estados-tipada.md` |

- [x] **Step 1: Crear el config de TypeScript**

```json
{
  "repoNuevo": "typescript-proyectos-avanzados",
  "descripcion": "Proyectos avanzados de TypeScript — Tech Study Tracker",
  "proyectos": [
    { "repoViejo": "buscador-personajes-ts", "carpeta": "buscador-personajes", "titulo": "Buscador de personajes — uniones discriminadas y comprobación de exhaustividad" },
    { "repoViejo": "bus-eventos-ts", "carpeta": "bus-eventos", "titulo": "Bus de eventos tipado (publish/subscribe)" },
    { "repoViejo": "cliente-tipado-zod", "carpeta": "cliente-zod", "titulo": "Cliente HTTP tipado y validado con Zod" },
    { "repoViejo": "maquina-estados-ts", "carpeta": "maquina-estados", "titulo": "Máquina de estados finita, genérica y tipada" }
  ]
}
```

- [x] **Step 2: Ejecutar la migración local**

```bash
cd <directorio-scratchpad>
node migrar-repo-tecnologia.mjs config-typescript.json
```

- [x] **Step 3: Escanear secretos**

```bash
bash "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker/scripts/security/scan_secrets.sh" typescript-proyectos-avanzados
```

- [x] **Step 4: Crear el repo remoto y hacer push**

```bash
cd typescript-proyectos-avanzados
gh repo create pedroleni/typescript-proyectos-avanzados --public --description "Proyectos avanzados de TypeScript — Tech Study Tracker"
git remote add origin git@github.com:pedroleni/typescript-proyectos-avanzados.git
git push -u origin main
git push -u origin solucion
```

- [x] **Step 5: Verificación real**

`buscador-personajes` y `explorador-personajes` (Task 5) son frontend
puro (confirmado en la validación del spec: `index.html` + `src/`, sin
`tests/`) — verificar sirviéndolo de verdad y comprobando con
Playwright que carga y funciona igual que antes de moverlo:

```bash
git clone --branch solucion https://github.com/pedroleni/typescript-proyectos-avanzados.git /tmp/verificar-typescript
cd /tmp/verificar-typescript/buscador-personajes
npm install
npx vite build
npx vite preview --port 4321 &
```

Con Playwright (contra `http://localhost:4321`): cargar la página,
buscar un personaje conocido (mismo que se usaba en la lección
original, ej. "pikachu" si es un buscador de Pokémon, o el que
corresponda al dominio real de `buscador-personajes-ts` — confirmar el
dominio real leyendo el `README.md` migrado antes de elegir el caso de
prueba, no asumirlo) y confirmar que el resultado aparece de verdad.
Cerrar el servidor de preview al terminar.

- [x] **Step 6: Actualizar las 4 lecciones + la mención incidental + TEMARIO.md**

Mismo patrón de sustitución de URL/`cd` sobre las 4 lecciones de la
tabla de mapeo. Además:

- `contenido/typescript/36-erasablesyntaxonly.md`: localizar el bloque
  `recursos` que cita `https://github.com/pedroleni/buscador-personajes-ts`
  y actualizar la URL a
  `https://github.com/pedroleni/typescript-proyectos-avanzados/tree/main/buscador-personajes`
  (o a la carpeta+rama que mejor ilustre el gotcha citado — revisar el
  texto de la anotación para decidir si apunta a `main` o `solucion`).
- `contenido/typescript/TEMARIO.md`: actualizar las URLs de
  `bus-eventos-ts`, `cliente-tipado-zod`, `maquina-estados-ts` (y
  `buscador-personajes-ts` si también aparece — confirmar al leer el
  fichero).

- [x] **Step 7: Validar los bloques `laboratorio` contra el esquema Zod**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
cat > src/lib/laboratorio/_debug-validar-typescript-migrado.test.ts << 'EOF'
import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { esquemaBloqueLaboratorio } from './schemas'

const archivos = [
  'contenido/typescript/55-proyecto-avanzado-buscador-de-personajes-con-typescript.md',
  'contenido/typescript/56-proyecto-avanzado-bus-de-eventos-tipado.md',
  'contenido/typescript/57-proyecto-avanzado-cliente-tipado-con-zod.md',
  'contenido/typescript/58-proyecto-avanzado-maquina-de-estados-tipada.md',
  'contenido/typescript/36-erasablesyntaxonly.md',
]

it('valida los bloques laboratorio de las 5 lecciones de TypeScript tras la migracion', () => {
  for (const archivo of archivos) {
    const contenido = readFileSync(archivo, 'utf8')
    const regex = /```laboratorio\n([\s\S]*?)\n```/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(contenido)) !== null) {
      const bloque = JSON.parse(m[1])
      const resultado = esquemaBloqueLaboratorio.safeParse(bloque)
      expect(resultado.success, `${archivo}: ${JSON.stringify(resultado.success ? null : resultado.error.issues)}`).toBe(true)
    }
  }
})
EOF
npx vitest run src/lib/laboratorio/_debug-validar-typescript-migrado.test.ts
rm src/lib/laboratorio/_debug-validar-typescript-migrado.test.ts
```

Expected: `1 passed (1)`.

- [x] **Step 8: Sincronizar las 5 lecciones con la base de datos real**

Igual que en la migración de SQL: arrancar el servidor de dev, para
cada una de las 4 lecciones de proyecto **más**
`36-erasablesyntaxonly.md` (5 lecciones en total), iniciar sesión de
administrador con Playwright, ir a
`/admin/tecnologias/<id-tecnologia-typescript>/lecciones/<id-leccion>/editar`,
leer el `value` actual de `textarea#leccion-contenido`, aplicar la
sustitución del Step 6 (debe encontrarse literalmente — si no, parar y
revisar antes de continuar), rellenar el campo, pulsar "Guardar".

- [x] **Step 9: Verificación visual**

Mismo procedimiento que Task 1 Step 9, sobre `maquina-estados` (ya
tiene, desde antes de este plan, el bloque `editor-en-vivo` con vista
previa real — confirmar que sigue mostrando "Sin errores de tipos." y
el resultado en la vista previa tras el cambio de contenido, no solo
el enlace del repositorio).

- [x] **Step 10: Suite completa + commit**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
npx vitest run
npx tsc --noEmit
npx eslint .
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git checkout -b docs/consolidar-typescript-proyectos-avanzados --quiet
git add contenido/typescript/
git commit -m "docs(typescript): apuntar los 4 proyectos avanzados a typescript-proyectos-avanzados"
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git merge docs/consolidar-typescript-proyectos-avanzados --no-edit
git branch -d docs/consolidar-typescript-proyectos-avanzados
```

---

### Task 5: JavaScript — `javascript-proyectos-avanzados`

**Files:**
- Create: `config-javascript.json` (scratchpad)
- Modify: `contenido/javascript/76-proyecto-avanzado-gestor-de-tareas.md`, `contenido/javascript/77-proyecto-avanzado-explorador-de-personajes-vite.md`, `contenido/javascript/TEMARIO.md`

**Interfaces:**
- Consumes: `migrar-repo-tecnologia.mjs` (Tarea 1), sin modificar.
- Produces: nada consumido por tareas posteriores (última tarea de migración antes del cierre).

**Mapa de este proyecto:**

| Repo viejo | Carpeta | Lección |
|---|---|---|
| `gestor-de-tareas-js` | `gestor-de-tareas` | `contenido/javascript/76-proyecto-avanzado-gestor-de-tareas.md` |
| `explorador-personajes` | `explorador-personajes` | `contenido/javascript/77-proyecto-avanzado-explorador-de-personajes-vite.md` |

- [x] **Step 1: Crear el config de JavaScript**

```json
{
  "repoNuevo": "javascript-proyectos-avanzados",
  "descripcion": "Proyectos avanzados de JavaScript — Tech Study Tracker",
  "proyectos": [
    { "repoViejo": "gestor-de-tareas-js", "carpeta": "gestor-de-tareas", "titulo": "Gestor de tareas con arquitectura real (estado + módulos ES + localStorage)" },
    { "repoViejo": "explorador-personajes", "carpeta": "explorador-personajes", "titulo": "Explorador de personajes con Vite — estado, paginación, búsqueda y favoritos" }
  ]
}
```

- [x] **Step 2: Ejecutar la migración local**

```bash
cd <directorio-scratchpad>
node migrar-repo-tecnologia.mjs config-javascript.json
```

- [x] **Step 3: Escanear secretos**

```bash
bash "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker/scripts/security/scan_secrets.sh" javascript-proyectos-avanzados
```

`explorador-personajes` tenía `.env.example` en su listado de
contenido (confirmado al escribir el spec) — confirmar que es
literalmente un ejemplo (claves vacías o de mentira) y no un `.env`
real copiado por error.

- [x] **Step 4: Crear el repo remoto y hacer push**

```bash
cd javascript-proyectos-avanzados
gh repo create pedroleni/javascript-proyectos-avanzados --public --description "Proyectos avanzados de JavaScript — Tech Study Tracker"
git remote add origin git@github.com:pedroleni/javascript-proyectos-avanzados.git
git push -u origin main
git push -u origin solucion
```

- [x] **Step 5: Verificación real**

Ya se verificó `gestor-de-tareas` funcionalmente en esta misma sesión
(root-cause del aviso de `file://`, ver historial) — repetir esa
misma comprobación sobre la copia migrada, para confirmar que mover el
contenido a una carpeta no rompió nada:

```bash
git clone --branch solucion https://github.com/pedroleni/javascript-proyectos-avanzados.git /tmp/verificar-javascript
cd /tmp/verificar-javascript/gestor-de-tareas
npx serve . &
```

Con Playwright (contra la URL real que dé `npx serve`, con el path
`/gestor-de-tareas/index.html` si sirve desde la raíz del repo
clonado — confirmar la URL exacta con la salida de `npx serve`):
añadir una tarea, marcarla completada, recargar la página y confirmar
que persiste en `localStorage` — mismos tres pasos ya verificados
antes en esta sesión para el repo viejo. Parar el servidor al
terminar.

- [x] **Step 6: Actualizar las 2 lecciones + TEMARIO.md**

Mismo patrón de sustitución sobre las 2 lecciones de la tabla de
mapeo, y sobre `contenido/javascript/TEMARIO.md` (que además menciona
`buscador-personajes-ts` — confirmar si esa mención también debe
actualizarse a la URL de `typescript-proyectos-avanzados/buscador-personajes`,
ya migrado en la Tarea 4).

- [x] **Step 7: Validar los bloques `laboratorio` contra el esquema Zod**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
cat > src/lib/laboratorio/_debug-validar-javascript-migrado.test.ts << 'EOF'
import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'
import { esquemaBloqueLaboratorio } from './schemas'

const archivos = [
  'contenido/javascript/76-proyecto-avanzado-gestor-de-tareas.md',
  'contenido/javascript/77-proyecto-avanzado-explorador-de-personajes-vite.md',
]

it('valida los bloques laboratorio de las 2 lecciones de JavaScript tras la migracion', () => {
  for (const archivo of archivos) {
    const contenido = readFileSync(archivo, 'utf8')
    const regex = /```laboratorio\n([\s\S]*?)\n```/g
    let m: RegExpExecArray | null
    while ((m = regex.exec(contenido)) !== null) {
      const bloque = JSON.parse(m[1])
      const resultado = esquemaBloqueLaboratorio.safeParse(bloque)
      expect(resultado.success, `${archivo}: ${JSON.stringify(resultado.success ? null : resultado.error.issues)}`).toBe(true)
    }
  }
})
EOF
npx vitest run src/lib/laboratorio/_debug-validar-javascript-migrado.test.ts
rm src/lib/laboratorio/_debug-validar-javascript-migrado.test.ts
```

Expected: `1 passed (1)`.

- [x] **Step 8: Sincronizar las 2 lecciones con la base de datos real**

Igual que en la migración de SQL: arrancar el servidor de dev, para
cada una de las 2 lecciones de la tabla de mapeo de esta tarea,
iniciar sesión de administrador con Playwright, ir a
`/admin/tecnologias/<id-tecnologia-javascript>/lecciones/<id-leccion>/editar`,
leer el `value` actual de `textarea#leccion-contenido`, aplicar la
sustitución del Step 6 (debe encontrarse literalmente — si no, parar y
revisar antes de continuar), rellenar el campo, pulsar "Guardar".

- [x] **Step 9: Verificación visual**

Con Playwright: navegar a la lección pública ya actualizada de
`gestor-de-tareas`, confirmar que el callout del repositorio muestra
`github.com/pedroleni/javascript-proyectos-avanzados` y que el enlace
de "Para profundizar" apunta a
`https://github.com/pedroleni/javascript-proyectos-avanzados/tree/main/gestor-de-tareas`,
y que el aviso de "servidor, no file://" (ya arreglado en esta sesión
para este mismo proyecto) sigue siendo correcto con la nueva ruta
(`cd gestor-de-tareas && npx serve .` en vez de solo `npx serve .`).
Capturar pantalla para verificación humana.

- [x] **Step 10: Suite completa + commit**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
npx vitest run
npx tsc --noEmit
npx eslint .
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git checkout -b docs/consolidar-javascript-proyectos-avanzados --quiet
git add contenido/javascript/
git commit -m "docs(javascript): apuntar los 2 proyectos avanzados a javascript-proyectos-avanzados"
git checkout docs/consolidar-repos-proyectos-avanzados --quiet
git merge docs/consolidar-javascript-proyectos-avanzados --no-edit
git branch -d docs/consolidar-javascript-proyectos-avanzados
```

---

### Task 6: Cierre — repos viejos en privado, y merge a `main`

**Files:** ninguno (solo operaciones de GitHub + merge de la rama de esta iniciativa)

**Interfaces:**
- Consumes: confirmación explícita de que las Tareas 1-5 están todas verificadas (Step 5 y Step 9 de cada una, reales, no asumidas).

- [x] **Step 1: Confirmar el estado de las 5 tareas anteriores**

Repasar, para cada una de las 5 tareas: ¿el repo nuevo existe y tiene
`main`+`solucion` con contenido? ¿Pasó la verificación real (Step 5)?
¿Las lecciones están sincronizadas con la base de datos real y
confirmadas visualmente (Step 9)? Si cualquier respuesta es "no" o
"no estoy seguro", **parar aquí** y volver a la tarea correspondiente
— este step es la última puerta antes de una acción semi-irreversible
(ver Global Constraints).

- [x] **Step 2: Poner los 18 repos viejos en privado**

```bash
for repo in \
  inventario-transaccional-sqlite analitica-ventas-funciones-ventana catalogo-jerarquico-cte-recursiva reportes-ventas-vistas-sql \
  reservas-multi-tenant-rls buscador-fts-postgres auditoria-particionada analitica-eventos-jsonb \
  api-auth-jwt procesador-webhooks acortador-rate-limit procesador-ventas-streams \
  buscador-personajes-ts bus-eventos-ts cliente-tipado-zod maquina-estados-ts \
  gestor-de-tareas-js explorador-personajes
do
  echo "=== $repo ==="
  gh repo edit "pedroleni/$repo" --visibility private --accept-visibility-change-consequences
done
```

Expected: cada uno de los 18 termina sin error. Verificar con
`gh repo view pedroleni/<repo> --json visibility` sobre 2-3 al azar,
que devuelvan `{"visibility":"PRIVATE"}`.

- [x] **Step 3: Merge de la rama de la iniciativa a `main`**

```bash
cd "/Users/pedroleridanieto/Desktop/Proyectos IA/tech-study-tracker"
git checkout main --quiet
git pull origin main --quiet
git merge docs/consolidar-repos-proyectos-avanzados --no-edit
npx vitest run
npx tsc --noEmit
npx eslint .
git push origin main
git branch -d docs/consolidar-repos-proyectos-avanzados
```

Expected: fast-forward o merge limpio (nada más ha tocado
`contenido/sql|postgresql|nodejs|typescript|javascript/` mientras
tanto), suite en verde, push sin conflictos.

- [x] **Step 4: Actualizar el estado en la spec**

Editar `docs/superpowers/specs/2026-09-01-consolidar-repos-proyectos-avanzados-design.md`,
cambiar `**Estado:**` de "📝 diseño aprobado por el usuario, pendiente
de implementar" a "✅ implementada — 5 repos consolidados, 18
lecciones actualizadas y verificadas, 18 repos viejos en privado".
Commit directo a `main` (`git add docs/superpowers/specs/... && git
commit -m "docs: marcar consolidación de repos de proyecto avanzado
como implementada" && git push`).
