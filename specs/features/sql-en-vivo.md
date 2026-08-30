# SQL: nueva tecnología + ejecución real de consultas en el navegador (sql.js/WASM)

**Estado:** ⏳ pendiente — diseño cerrado y validado con un prototipo
interactivo (ver "Validación" más abajo); implementación no empezada.

**Configuración manual requerida:** ninguna. La tecnología "SQL" (y más
adelante "PostgreSQL", como track separado) se crea vía el flujo de admin
ya existente — no hace falta migración SQL, `technologies`/`lecciones`
no ganan columnas nuevas. Se crea la categoría "Bases de datos" (hoy solo
existen Frontend web, Backend, Herramientas).

## Por qué existe esta feature

El track de Node.js (ver `contenido/nodejs/`) tuvo que resolver todas sus
lecciones con `codigo-anotado`/`comparador-antes-despues` de solo lectura
porque el navegador no puede ejecutar `fs`, sockets ni `process` reales —
una limitación de plataforma real, no de diseño. **SQL no tiene ese
problema**: SQLite compilado a WebAssembly ejecuta consultas de verdad,
en el propio navegador, sin servidor. Decidido con el usuario: en vez de
repetir el apaño de Node.js, el temario de SQL usa dos bloques nuevos que
ejecutan las consultas contra un motor real y muestran el resultado real.

Decisiones de alcance confirmadas con el usuario (`AskUserQuestion` +
brainstorming):

1. SQL y PostgreSQL son **dos tecnologías separadas** (mismo patrón que
   JavaScript/TypeScript) — SQL primero, agnóstico de motor; PostgreSQL
   después, sin repetir fundamentos, solo lo que Postgres añade (tipos
   avanzados, RLS, `EXPLAIN ANALYZE`, extensiones — spec propia cuando
   toque).
2. El dataset (esquema + datos de ejemplo) es **distinto por módulo**,
   no uno único para las 51 lecciones — más variedad temática, a costa
   de repetir el `CREATE TABLE`/`INSERT` en cada bloque que lo necesita
   (aceptado: cada bloque laboratorio ya es autocontenido hoy, ningún
   tipo existente referencia estado de otro bloque).
3. Dos tipos de bloque, no uno con flags — mismo patrón que ya separa
   `codigo-anotado` (fijo, anotado) de `editor-en-vivo` (editable).
4. El bloque editable **sí verifica el resultado** contra una consulta
   solución, comparando lo que devuelve el motor real — nunca un
   resultado tecleado a mano en el JSON de la lección.

## Validación

Antes de fijar el diseño se probó `sql.js` empíricamente (no solo
documentación): instalado en un script Node aislado, `SELECT
sqlite_version()` devuelve `3.49.1`, y se confirmaron JOIN + GROUP BY +
agregación, CTEs (`WITH`), funciones de ventana (`RANK() OVER`),
transacciones, y mensajes de error reales y útiles (`no such table: x`).

Además se construyó y verificó con Playwright un prototipo interactivo
completo (los dos bloques, dataset de ejemplo, resaltado de sintaxis en
vivo) como Artifact autocontenido (sql.js + su `.wasm` embebidos en un
único HTML) — confirmado en el navegador: agregación real, verificación
✅/❌ funcionando, error real de SQLite mostrado, resaltado de palabras
clave mientras se escribe, cero errores de consola. El prototipo usó
`innerHTML` sin escapar para las celdas de resultado (aceptable en un
Artifact desechable de un único usuario) — **la implementación real no
puede repetir esto** (ver "Checkpoints de seguridad").

## Alcance

### 1. Motor: `sql.js` 1.14.2 (SQLite 3.49.1 vía WebAssembly)

- MIT (SQLite es de dominio público), cero dependencias runtime,
  mantenimiento activo (release v1.14.2, agosto 2026).
- Tamaño: `sql-wasm.wasm` (658 KB) + `sql-wasm.js` (46.5 KB) ≈ 700 KB —
  mismo orden de magnitud que otros chunks ya cargados bajo demanda en
  el proyecto (`typescript-en-vivo`, ~1 MB gzip).
- Se descarta `PGlite` (Postgres real en WASM, ~3 MB gzipped) para este
  track: SQL es agnóstico de motor por diseño, y PGlite es la opción
  correcta más adelante para el track de PostgreSQL (JSONB, RLS,
  extensiones), no aquí.

### 2. Carga: mismo patrón que `typescript-en-vivo`

`sql-wasm.wasm` se copia a `public/sql-wasm.wasm` mediante un script npm
comiteado (`scripts/dev/generar-sql-wasm.mjs`, análogo a
`generar-ts-libs.mjs`). `src/lib/sql-en-vivo/motor.ts` carga `sql.js`
con `import()` dinámico y pasa el binario vía `fetch('/sql-wasm.wasm')`
como `wasmBinary` — solo se descarga cuando una lección tiene un bloque
`sql-anotado` o `sql-en-vivo`, nunca en el resto de páginas (code-
splitting real vía Vite, mismo criterio ya aplicado a TypeScript).

`public/sql-wasm.wasm` es el **primer binario comiteado** al repo (los
`.d.ts` de `public/ts-libs/` son texto) — 658 KB, tamaño trivial para
git, pero se deja constancia porque es una categoría de asset nueva.

### 3. Dos tipos de bloque laboratorio nuevos

**`sql-anotado`** (demostración, no editable — como `codigo-anotado`
pero ejecutando de verdad):

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Empleados por departamento, con su salario medio",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER, salario REAL);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas');\nINSERT INTO empleados VALUES (1, 'Ana', 1, 55000), (2, 'Luis', 1, 62000), (3, 'Marta', 2, 48000);",
  "consulta": "SELECT d.nombre AS departamento, COUNT(*) AS empleados, AVG(e.salario) AS salario_medio\nFROM empleados e\nJOIN departamentos d ON d.id = e.departamento_id\nGROUP BY d.nombre",
  "anotaciones": [
    { "fragmento": "JOIN departamentos d ON d.id = e.departamento_id", "nota": "Une cada empleado con su departamento por id." },
    { "fragmento": "GROUP BY d.nombre", "nota": "Agrupa antes de agregar — sin esto, COUNT/AVG tratarían la tabla entera como un único grupo." }
  ]
}
```

Al renderizar: el componente ejecuta `esquemaSql` + `consulta` contra el
motor real y muestra la tabla de resultado **real**, junto con la
interacción ya existente de `codigo-anotado` (números clicables que
resaltan un fragmento y muestran su nota).

**`sql-en-vivo`** (editable, para ejercicios):

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre y el salario de los empleados de \"Ingeniería\", ordenados de mayor a menor salario.",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER, salario REAL);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas');\nINSERT INTO empleados VALUES (1, 'Ana', 1, 55000), (2, 'Luis', 1, 62000), (3, 'Marta', 2, 48000);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, salario FROM empleados WHERE departamento_id = 1 ORDER BY salario DESC"
}
```

`consultaSolucion` es opcional: si falta, el bloque es puramente
exploratorio (se ejecuta y se muestra el resultado real, sin ✅/❌).

### 4. Comportamiento del componente

- **Layout apilado** (editor arriba, tabla debajo, ancho completo con
  scroll horizontal si hace falta) — a diferencia de `EditorEnVivo`
  (editor/preview lado a lado), una tabla de resultado es más ancha que
  alta y no encaja bien en una columna estrecha.
- **Editor de `sql-en-vivo`**: CodeMirror con `@codemirror/lang-sql`
  (oficial, MIT, misma major 6.x que el resto de paquetes `@codemirror/
  lang-*` ya instalados — no hace falta ningún paquete nuevo de
  ecosistema distinto).
- **Auto-ejecución con debounce** (~300 ms), igual que la compilación de
  TypeScript en vivo.
- **En error, se limpia la tabla** y se muestra solo el mensaje real de
  SQLite — **diverge a propósito** del precedente de TypeScript (que
  conserva la última vista previa válida): un ejercicio de SQL es de
  intento único ("¿funciona esta consulta, sí o no?"), dejar una tabla
  vieja visible mientras se corrige la actual confunde más de lo que
  ayuda. TypeScript sí conserva la vista previa porque ahí el producto
  es un demo continuo, no un ejercicio de una sola pregunta.
- **Verificación** (cuando hay `consultaSolucion`): cada ejecución
  recrea la base de datos desde `esquemaSql` — tanto para la consulta
  del alumno como para la solución, en instancias `Database` separadas
  — para que un `UPDATE`/`DELETE` de un intento no contamine el
  siguiente. Compara: nombres de columna exactos y en el mismo orden
  (el enunciado del ejercicio debe dejar claro qué columnas/orden se
  esperan cuando importe), filas como multiset ignorando el orden (SQL
  no lo garantiza sin `ORDER BY` explícito). Nunca revela la consulta
  solución, solo ✅/❌ + la tabla real de lo que escribió el alumno.
  Limitación aceptada: comparación por igualdad estricta de valores, sin
  tolerancia a redondeo de coma flotante — evitar ejercicios verificados
  cuya única discrepancia posible sea un decimal de un cálculo con
  `REAL`.
- **Botón "Reiniciar"** en `sql-en-vivo` (vuelve a `consultaInicial`),
  mismo patrón que `EditorEnVivo`.
- **Si `esquemaSql` falla al ejecutarse** (no debería llegar a
  producción — ver "Validación de contenido" abajo, pero es una lección
  real con datos reales y merece un fallo legible en vez de una excepción
  sin manejar): el bloque muestra un mensaje claro ("Error preparando
  esta lección") en vez de romper el render de toda la página.

### 7. Validación de contenido (mismo patrón que HTML/CSS/JS/TS/Node.js)

Test desechable (no se comitea) que, para cada bloque `sql-anotado`/
`sql-en-vivo` de cada lección en `contenido/sql/`, ejecuta de verdad
`esquemaSql` + `consulta` (o `esquemaSql` + `consultaSolucion`, si
existe) contra el motor real en Node antes de publicar — así una lección
nunca llega a producción con SQL que en realidad falla. Mismo esquema
que los tests desechables de validación Zod/sintaxis ya usados en
TypeScript y Node.js.

### 5. `sql-anotado` reutiliza el patrón de anotaciones de `CodigoAnotado.tsx`

Mismo mecanismo de números clicables + fragmento resaltado + nota — pero
el resaltado de sintaxis SQL usa un caso nuevo del tokenizador propio
(`resaltador.ts`), no CodeMirror (`sql-anotado` no es editable, no
necesita un editor real).

### 6. Nuevo caso `sql` en el tokenizador (`src/components/codigo/resaltador.ts`)

El tokenizador actual (deliberadamente propio, sin dependencias, ver su
comentario de cabecera) solo entiende `html`/`css`/`js` — por eso Node.js
y TypeScript tuvieron que forzar `lenguaje: "html"` en sus bloques
`codigo-anotado`. Para SQL se añade un caso real: `Lenguaje` gana `'sql'`,
y `tokenizarSql` reconoce palabras clave (`SELECT`, `FROM`, `JOIN`,
`WHERE`, `GROUP BY`, `ORDER BY`, agregados, etc.), cadenas (`'...'`,
con `''` como escape de comilla simple — sintaxis SQL estándar),
comentarios `--` de línea y números. Mismo invariante que ya comprueban
los tests existentes: concatenar el `texto` de todos los tokens
reconstruye exactamente el código de entrada.

## Esquema (Zod)

Dos tipos nuevos en `esquemaBloqueLaboratorio` (discriminated union,
pasa de 15 a 17 miembros):

```ts
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

export const esquemaSqlEnVivo = z.object({
  tipo: z.literal('sql-en-vivo'),
  consigna: z.string().min(1).max(600).optional(),
  esquemaSql: z.string().min(1).max(3000),
  consultaInicial: z.string().max(1500).default(''),
  consultaSolucion: z.string().max(1500).optional(),
})
```

Límites calcados de los ya existentes en `esquemaCodigoAnotado`/
`esquemaComparadorAntesDespues` (mismo orden de magnitud: `nota` a 500,
`anotaciones` de 1 a 8). `esquemaSql` a 3000 porque un `CREATE
TABLE`+`INSERT` con varias tablas puede ser más largo que un fragmento
de código típico de 4000 (límite ya usado para `codigo`/`html`/`css`/
`js`/`ts`); `consulta`/`consultaInicial`/`consultaSolucion` a 1500,
suficiente para una consulta de nivel curso con CTEs.

## Componente

- `src/lib/sql-en-vivo/motor.ts` (+ `.test.ts`, sin mocks — mismo
  criterio que `typescript-en-vivo/compilar.test.ts`): carga `sql.js`
  perezosamente, `crearBaseDeDatos(esquemaSql)`, `ejecutarConsulta(db,
  sql)` (nunca reutiliza una `Database` entre ejecuciones distintas —
  ver "Comportamiento" arriba), `compararResultados(a, b)`.
- `src/components/bloques-laboratorio/SqlAnotado.tsx`,
  `SqlEnVivo.tsx` — un `TablaResultado.tsx` compartido entre los dos
  para no duplicar el render de `{columns, values}`.
- **Los valores de celda se renderizan como texto (hijos de JSX, nunca
  `dangerouslySetInnerHTML`)** — el alumno controla literalmente el
  contenido de las celdas a través de literales de cadena en su propia
  consulta (`SELECT '<img src=x onerror=...>' AS x` es una consulta SQL
  perfectamente válida). El prototipo de validación usó `innerHTML` sin
  escapar porque era un Artifact HTML plano de un único usuario; **la
  implementación real en React no debe repetir ese patrón** — React ya
  escapa automáticamente el contenido de texto, así que basta con no
  usar `dangerouslySetInnerHTML` en ningún punto de `TablaResultado`.
- `registro.ts` — altas: `'sql-anotado': SqlAnotado`, `'sql-en-vivo':
  SqlEnVivo`.

## Cambios en archivos existentes

- `src/lib/laboratorio/schemas.ts` — dos tipos nuevos en el
  discriminated union (ver "Esquema" arriba).
- `src/components/bloques-laboratorio/registro.ts` — dos altas.
- `src/components/codigo/resaltador.ts` — nuevo `Lenguaje = 'sql'` +
  `tokenizarSql` + tests del invariante de reconstrucción exacta.
- `src/lib/sql-en-vivo/motor.ts` — nuevo.
- `scripts/dev/generar-sql-wasm.mjs` — nuevo, copia `sql-wasm.wasm` a
  `public/`.
- `public/sql-wasm.wasm` — nuevo binario comiteado.
- `package.json` — nuevas dependencias: `sql.js@1.14.2`,
  `@codemirror/lang-sql@6.10.0`.
- Categoría "Bases de datos" nueva en el catálogo (vía admin).
- `contenido/sql/` — carpeta nueva, `TEMARIO.md` + lecciones (fuera de
  alcance de este plan — se escribe después, módulo a módulo, sin plan
  formal, igual que las rondas anteriores).
- `specs/features/README.md` — fila nueva en el índice.

## Checkpoints de seguridad

- **Dos dependencias npm nuevas** → aplica
  `security-code-vulns.md`/`security-supply-chain.md`: confirmar que
  `sql.js` es el paquete oficial de `sql-js/sql.js` (GitHub, MIT) y
  `@codemirror/lang-sql` el oficial del equipo de CodeMirror — sin
  typosquatting. Fijar `sql.js@1.14.2` explícito (no `^`) hasta revisar
  cualquier salto de versión mayor, mismo criterio que `typescript@6.0.3`.
- **Sin RLS nueva** — la categoría "Bases de datos" y la tecnología
  "SQL" caen bajo las políticas ya existentes de
  `categories`/`technologies`/`lecciones`; spot-check ligero basta.
- **Renderizado de resultados como texto, nunca HTML crudo** (ver
  "Componente" arriba) — es el checkpoint específico y real de esta
  feature: a diferencia de todo el contenido anterior (controlado por
  quien escribe la lección), aquí el **alumno** controla parte de lo que
  acaba en pantalla a través del contenido de sus propias consultas.
- **El motor corre en el hilo principal, fuera de cualquier iframe** —
  no ejecuta código JS arbitrario del alumno, solo SQL interpretado por
  SQLite (WASM), que no tiene acceso a `fetch`/DOM/`window` — superficie
  de ataque muy inferior a la del `editor-en-vivo` de JS/TS (que sí
  ejecuta JS real, aunque sandboxed).
- **`public/sql-wasm.wasm` es un asset estático comiteado**, no
  contenido generado por usuarios ni descargado en runtime desde un
  tercero — no es superficie de inyección.
- Límites de longitud en el esquema Zod (ver arriba) acotan el tamaño de
  cada bloque, mismo criterio que el resto de tipos de bloque.

## Checklist de implementación

- [ ] Esquema Zod: `esquemaSqlAnotado` + `esquemaSqlEnVivo` — Claude, TDD
  (`schemas.test.ts`)
- [ ] `src/lib/sql-en-vivo/motor.ts` + tests con el motor real (sin
  mocks) — Codex
- [ ] `scripts/dev/generar-sql-wasm.mjs` — Codex
- [ ] `npm install sql.js@1.14.2 @codemirror/lang-sql@6.10.0` — Claude
  (sandbox de Codex sin acceso a red)
- [ ] Nuevo caso `sql` en `resaltador.ts` + tests del invariante —
  Codex
- [ ] `SqlAnotado.tsx`, `SqlEnVivo.tsx`, `TablaResultado.tsx` — Codex,
  con especial atención al checkpoint de renderizado-como-texto de
  arriba
- [ ] `registro.ts` — altas
- [ ] Verificación visual (Playwright, credenciales reales de admin):
  ambos bloques en modo claro/oscuro, un ejercicio correcto (✅), uno
  incorrecto (❌), y una consulta con error real de SQLite
- [ ] `npm run build`/`lint`/`test` en verde
- [ ] Categoría "Bases de datos" creada vía admin
- [ ] Tecnología "SQL" creada vía admin, categoría "Bases de datos"
- [ ] `contenido/sql/TEMARIO.md` — investigación de fuentes + planificación
- [ ] Lecciones de SQL escritas módulo a módulo
- [ ] `specs/features/README.md` — fila añadida, estado actualizado
- [ ] Spot-check de seguridad final: `sql.js`/`@codemirror/lang-sql` son
  los paquetes oficiales; sin `dangerouslySetInnerHTML` en
  `TablaResultado`; sin migraciones nuevas (sin superficie RLS nueva)
