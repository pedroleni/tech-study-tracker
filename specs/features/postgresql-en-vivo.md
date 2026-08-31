# PostgreSQL: nueva tecnología + ejecución real de consultas en el navegador (PGlite/WASM)

**Estado:** 📝 diseño aprobado (brainstorming + validación empírica),
pendiente de implementar. El temario (`contenido/postgresql/TEMARIO.md`,
61 lecciones en 19 módulos) está escrito como propuesta pero no cerrado
en detalle — este spec puede obligar a ajustarlo (ver "Impacto en el
temario").

**Configuración manual requerida:** ninguna. La tecnología "PostgreSQL"
se crea vía el flujo de admin ya existente, dentro de la categoría
"Bases de datos" (ya existe, creada para SQL) — no hace falta migración
SQL, `technologies`/`lecciones` no ganan columnas nuevas.

## Por qué existe esta feature

`contenido/sql/TEMARIO.md` dejó explícitamente pendiente el track de
PostgreSQL: "lo que un motor de producción real añade por encima — RLS,
JSONB, extensiones, `EXPLAIN ANALYZE` con costes reales". Ese propio
motor de producción es, literalmente, el que corre debajo de Supabase —
la base de datos de este mismo proyecto. Repetir el patrón de SQL
(ejecución real, no `codigo-anotado` de solo lectura) tiene aquí un
valor añadido concreto: la lección de RLS puede enseñar el mecanismo
exacto (`auth.uid()`, `CREATE POLICY`) que protege las propias tablas de
tech-study-tracker.

Decisión de alcance confirmada con el usuario (`AskUserQuestion` +
brainstorming, 2026-08-31):

1. **Reutilizar y parametrizar** los tipos de bloque ya existentes
   (`sql-anotado`/`sql-en-vivo`) con un campo `motor: 'sqlite' |
   'postgres'`, en vez de crear tipos nuevos — menos código, y
   `TablaResultado`/`resaltador` ya sirven para los dos motores.
2. Lo que PGlite no puede ejecutar de verdad en un solo navegador
   (alta disponibilidad/replicación física, principalmente) se resuelve
   con `codigo-anotado` estático — mismo patrón que ya usa Node.js para
   `fs`/red.
3. La simulación de identidad en RLS debe ser **fiel al mecanismo real
   de Supabase** (`auth.uid()` leyendo un claim de sesión), no un
   `CREATE ROLE`/`SET ROLE` genérico y desconectado del propio proyecto.

## Validación

Antes de fijar el diseño se probó `@electric-sql/pglite` empíricamente
(no solo documentación) en un script Node aislado — instalado,
`SELECT version()` devuelve `PostgreSQL 18.3 (PGlite 0.5.8) on
wasm32-unknown-emscripten`. Confirmado con consultas reales:

- **JSONB, arrays, `EXPLAIN ANALYZE`**: funcionan sin configuración
  extra. `EXPLAIN ANALYZE` devuelve costes y `actual time` **reales**
  (no una recreación aproximada) — a diferencia de SQLite, cuyo
  `EXPLAIN QUERY PLAN` no expone tiempos.
- **PL/pgSQL + triggers**: un trigger `BEFORE UPDATE` que fija
  `updated_at = now()` (el patrón exacto que ya usa este proyecto en sus
  propias migraciones) se disparó y modificó la fila correctamente.
- **`gen_random_uuid()`** funciona out-of-the-box, sin ninguna
  extensión — es nativo desde Postgres 13. Simplifica la lección de UUID
  del temario (no hace falta `pgcrypto` solo para eso).
- **Extensiones (`pgcrypto`, `uuid-ossp`)**: `CREATE EXTENSION` falla
  ("extension ... is not available") si no se importan explícitamente
  como módulo JS y se pasan al constructor —
  `import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'` +
  `new PGlite({ extensions: { pgcrypto } })`. Confirmado funcionando así
  (`digest()`, `uuid_generate_v4()` reales). Ver "Motor" abajo para cómo
  esto entra en el esquema.
- **Hallazgo real e importante — RLS necesita un rol no-superusuario,
  no solo `SET`:** la primera prueba (superusuario `postgres` por
  defecto de PGlite + `CREATE POLICY` + cambiar una variable de sesión)
  **no restringió nada** — Ana veía los posts de Roberto. Ni siquiera
  `ALTER TABLE ... FORCE ROW LEVEL SECURITY` lo arregla: en Postgres
  real, **un superusuario se salta RLS siempre, sin excepción** (`FORCE`
  solo afecta al propietario cuando NO es superusuario). La prueba
  correcta — `CREATE ROLE app_user NOSUPERUSER` + `GRANT SELECT ON ...
  TO app_user` + `SET ROLE app_user` — sí aisló correctamente: Ana vio
  solo sus 2 posts, Roberto solo el suyo, una identidad desconocida vio
  0 filas. Esto no es una limitación de PGlite: es el comportamiento
  real de Postgres, y es un hallazgo con valor pedagógico propio (ver
  "Simulación de identidad para RLS").
- **Mensajes de error reales**: `relation "tabla_que_no_existe" does not
  exist` — sintaxis genuina de Postgres, distinta de la de SQLite (`no
  such table: x`), confirma que se puede seguir el mismo patrón de
  mostrar el error real de la lección de SQL.

## Alcance

### 1. Motor: `@electric-sql/pglite` (PostgreSQL 18 vía WebAssembly)

- Dual-licencia Apache 2.0 + PostgreSQL License — permisiva, sin
  problema de compatibilidad.
- Tamaño: bajo 3 MB gzipped (frente a los ~700 KB de sql.js) — más
  pesado, pero del mismo orden de magnitud que otros chunks bajo demanda
  del proyecto; se carga solo cuando una lección tiene un bloque con
  `motor: 'postgres'`.
- Mantenimiento muy activo: v0.5.8 actualizada hace días en el momento
  de este spec. Un bug real de RLS (issue #274, políticas ignoradas) se
  reportó y arregló en la v0.2.9 (octubre 2024) — varias versiones antes
  de la actual, confirmado en los propios comentarios del issue
  (cerrado, verificado por dos usuarios independientes).

### 2. Carga: mismo patrón que `sql-en-vivo`, con caché de módulo

`src/lib/postgres-en-vivo/motor.ts` carga PGlite con `import()` dinámico
la primera vez que una lección lo necesita. A diferencia de sql.js, el
**módulo PGlite ya cargado se cachea en memoria del lado del cliente**
(no la base de datos: cada ejecución sigue creando una `PGlite` nueva,
mismo aislamiento que ya garantiza SQL) — evita volver a descargar ~3 MB
si una misma lección tiene varios bloques Postgres (caso real: la
lección de SQL ya vista tenía `sql-anotado` + `sql-en-vivo` juntos).

**Extensiones**: un bloque puede declarar `extensiones: z.array(z.enum(['pgcrypto', 'uuid_ossp'])).optional()`
(lista cerrada a las dos que de verdad hacen falta en el temario —
Módulo 16). Solo si el array no está vacío, `motor.ts` hace el `import()`
del módulo de contrib correspondiente y lo pasa al constructor de
`PGlite`. El resto de bloques (la inmensa mayoría) no paga ese coste.

### 3. Extensión de los tipos de bloque ya existentes (no tipos nuevos)

`esquemaSqlAnotado`/`esquemaSqlEnVivo` ganan:

```ts
motor: z.enum(['sqlite', 'postgres']).default('sqlite'),
extensiones: z.array(z.enum(['pgcrypto', 'uuid_ossp'])).optional(),
identidadSimulada: z
  .array(z.object({ etiqueta: z.string().min(1).max(60), valor: z.string().min(1).max(60) }))
  .min(2)
  .max(4)
  .optional(),
```

Retrocompatible: las 45 lecciones de SQL ya publicadas no se tocan
(`motor` por defecto es `'sqlite'`, el resto de campos son opcionales).

### 4. Simulación de identidad para RLS

Cuando un bloque declara `identidadSimulada`, el componente renderiza un
selector ("Estás conectado como: Ana / Roberto / (nadie)") encima del
editor/demostración. Cambiar la selección hace, antes de ejecutar la
consulta del bloque:

```sql
SET myapp.current_user_id = '<valor elegido>';
```

El propio `esquemaSql` del bloque debe definir su `auth_uid()` (una
función SQL de una línea que lee ese GUC) — mismo patrón, mencionado
explícitamente en la lección, que usa Supabase de verdad con
`auth.uid()`. **Boilerplate obligatorio en el `esquemaSql` de cualquier
bloque con `identidadSimulada`** (documentado aquí para que
`motor.ts`/la validación de contenido lo puedan comprobar):

```sql
CREATE ROLE app_user NOSUPERUSER;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON <tablas relevantes> TO app_user;
CREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$
  SELECT current_setting('myapp.current_user_id', true);
$$ LANGUAGE sql STABLE;
```

`ejecutarConsulta` para bloques con `identidadSimulada` ejecuta `SET
ROLE app_user;` inmediatamente después de `esquemaSql` (que corre como
superusuario, para poder crear el rol/tablas/políticas) y antes de la
consulta del alumno/solución — **sin este paso, la política nunca se
activa** (el hallazgo de "Validación" de arriba). La propia lección 44
(“Qué es RLS y el problema real que resuelve”) debe explicar por qué
existe este rol — es, de hecho, el motivo de que RLS "no sea magia":
solo se aplica quien no es superusuario/propietario, exactamente como en
un backend real.

### 5. Comportamiento del componente

Idéntico al de `sql-en-vivo`/`sql-anotado` ya implementado (layout
apilado, CodeMirror con `@codemirror/lang-sql` reutilizado tal cual —
ya es SQL genérico, no específico de SQLite —, debounce ~300 ms, error
real limpia la tabla, botón "Reiniciar", verificación por
`compararResultados` reutilizada sin cambios), con dos añadidos:

- El selector de identidad simulada (solo si `identidadSimulada` está
  presente).
- Ampliar la lista de palabras clave de `resaltador.ts` con vocabulario
  de Postgres que no existe en SQLite (`JSONB`, `RETURNING`, `POLICY`,
  `ROLE`, `GRANT`, `MATERIALIZED`, `PARTITION`) — no un tokenizador
  nuevo, solo más palabras reconocidas por el ya existente.

### 6. Validación de contenido (mismo patrón que SQL)

Test desechable (no se comitea) que ejecuta de verdad, contra PGlite en
Node, el `esquemaSql` + `consulta`/`consultaSolucion` de cada bloque
`motor: 'postgres'` de `contenido/postgresql/` antes de publicar —
además de comprobar, para los bloques con `identidadSimulada`, que al
menos dos identidades distintas producen resultados distintos (si no,
la lección de RLS estaría mintiendo sobre lo que enseña).

## Esquema (Zod)

No hay tipos nuevos en el discriminated union — se extienden
`esquemaSqlAnotado`/`esquemaSqlEnVivo` (ver "Alcance", punto 3). Sigue
siendo un cambio en `src/lib/laboratorio/schemas.ts`, con sus propios
tests (TDD, igual que el resto de esquemas del proyecto).

## Componentes

- `src/lib/postgres-en-vivo/motor.ts` (+ `.test.ts`, sin mocks, contra
  PGlite real): `cargarMotor()` (con caché de módulo), `crearBaseDeDatos
  (esquemaSql, extensiones)`, `ejecutarConsulta(db, sql, identidad?)`
  (hace `SET ROLE app_user` cuando aplica), reutiliza `compararResultados`
  de `sql-en-vivo/motor.ts` (extraer a un módulo compartido si hace
  falta, sin duplicar).
- `SqlAnotado.tsx`/`SqlEnVivo.tsx`: branch interno por `bloque.motor`
  para elegir qué motor cargar; UI del selector de identidad.
- `resaltador.ts`: ampliar palabras clave (ver punto 5).
- `scripts/dev/generar-pglite-wasm.mjs`: copia los assets de PGlite
  (verificar en implementación cuántos ficheros son — a diferencia de
  sql.js, que es un único `.wasm`, PGlite puede traer más de un archivo
  de datos) a `public/`.

## Cambios en archivos existentes

- `src/lib/laboratorio/schemas.ts` — campos nuevos en los dos tipos ya
  existentes (ver "Esquema").
- `src/components/codigo/resaltador.ts` — palabras clave nuevas.
- `src/lib/postgres-en-vivo/motor.ts` — nuevo.
- `scripts/dev/generar-pglite-wasm.mjs` — nuevo.
- `public/` — nuevo(s) asset(s) de PGlite comiteados.
- `package.json` — nueva dependencia: `@electric-sql/pglite` (fijar
  versión exacta, `0.5.8` o la que esté vigente al implementar — mismo
  criterio que `sql.js@1.14.2`).
- Tecnología "PostgreSQL" nueva en el catálogo (vía admin), categoría
  "Bases de datos" (ya existe).
- `contenido/postgresql/` — `TEMARIO.md` ya escrito como propuesta;
  las lecciones se escriben después, módulo a módulo, sin plan formal
  (igual que las rondas anteriores) — ver "Impacto en el temario".
- `specs/features/README.md` — fila nueva en el índice.

## Impacto en el temario ya escrito

`contenido/postgresql/TEMARIO.md` dejaba abierta la pregunta de qué
lecciones no podrían ejecutarse de verdad. Con este diseño, el alcance
de "estático" es más pequeño de lo previsto:

- **Módulo 13 (roles/GRANT)** y **Módulo 17 (LISTEN/NOTIFY)**: sí
  pueden ser `sql-en-vivo`/`sql-anotado` reales — `CREATE ROLE`/`GRANT`
  son DDL normal, y `LISTEN`+`NOTIFY` dentro de una misma sesión/pestaña
  sirve para una demo honesta.
- **Módulo 9 (VACUUM)**: `VACUUM`/`VACUUM FULL` ejecutan de verdad; solo
  la afirmación "esto tarda X en producción" (temporización real de
  autovacuum) queda como prosa, no como bloque ejecutable.
- **Lección 59 (alta disponibilidad y replicación)**: única lección que
  se queda claramente como `codigo-anotado` estático o prosa — es
  inherente a varios servidores físicos, no una limitación de PGlite.

Al escribir las lecciones habrá que revisar módulo a módulo si algo más
se resiste a ejecutarse (p. ej. algún límite concreto de qué extensiones
trae PGlite más allá de `pgcrypto`/`uuid_ossp`) y decidirlo entonces,
no aquí.

## Checkpoints de seguridad

- **Una dependencia npm nueva** → aplica
  `security-code-vulns.md`/`security-supply-chain.md`: confirmar que
  `@electric-sql/pglite` es el paquete oficial de `electric-sql/pglite`
  (GitHub, el mismo equipo detrás de ElectricSQL) — sin typosquatting.
  Fijar versión exacta (no `^`), mismo criterio que `sql.js`.
- **Sin RLS nueva en Supabase** — la tecnología "PostgreSQL" cae bajo
  las políticas ya existentes de `categories`/`technologies`/`lecciones`;
  spot-check ligero basta. (La RLS que enseñan las *lecciones* corre
  dentro de PGlite, en el navegador del alumno — no toca la base de
  datos real de este proyecto en ningún momento.)
- **Renderizado de resultados como texto, nunca HTML crudo** — mismo
  checkpoint ya verificado para SQL, `TablaResultado.tsx` es compartido
  y no cambia.
- **El motor corre en el hilo principal, fuera de cualquier iframe** —
  mismo argumento que SQL: PGlite ejecuta SQL interpretado, no JS
  arbitrario del alumno.
- **El rol `app_user` creado dentro de PGlite vive solo en esa instancia
  en memoria, del navegador del alumno** — se destruye con la base de
  datos al terminar la ejecución; no hay ninguna credencial real ni
  persistencia entre ejecuciones.
- Límites de longitud en los campos nuevos del esquema Zod, mismo
  criterio que el resto de tipos de bloque.

## Checklist de implementación

- [ ] Esquema Zod: extender `esquemaSqlAnotado`/`esquemaSqlEnVivo` con
  `motor`/`extensiones`/`identidadSimulada` — Claude, TDD
- [ ] `src/lib/postgres-en-vivo/motor.ts` + tests con PGlite real (sin
  mocks), incluido un test explícito de RLS con `identidadSimulada` —
  Codex
- [ ] `scripts/dev/generar-pglite-wasm.mjs` — Codex (verificar primero
  cuántos ficheros de asset trae PGlite realmente)
- [ ] `npm install @electric-sql/pglite@<versión fijada>` — Claude
  (sandbox de Codex sin acceso a red)
- [ ] Palabras clave nuevas en `resaltador.ts` + tests — Codex
- [ ] `SqlAnotado.tsx`/`SqlEnVivo.tsx`: branch por `motor`, selector de
  identidad simulada — Codex
- [ ] Añadidas al catálogo de referencia
  (`AdminReferenciaContenidoPage`) para verificación visual sin
  necesitar contenido todavía
- [ ] Verificación visual (Playwright, credenciales reales de admin):
  un bloque `motor: postgres` normal, y uno de RLS mostrando resultados
  distintos según la identidad simulada — la captura clave de esta
  feature
- [ ] `npm run build`/`lint`/`test` en verde
- [ ] Tecnología "PostgreSQL" creada vía admin, categoría "Bases de
  datos"
- [ ] Revisar `contenido/postgresql/TEMARIO.md` módulo a módulo contra
  lo que de verdad ejecuta PGlite, ajustar si hace falta
- [ ] Lecciones escritas y publicadas — cada consulta ejecutada de
  verdad contra PGlite antes de publicarse (no asumida)
- [ ] `specs/features/README.md` — fila añadida, estado actualizado
- [ ] Spot-check de seguridad final: `@electric-sql/pglite` es el
  paquete oficial; sin `dangerouslySetInnerHTML` nuevo; sin migraciones
  nuevas (sin superficie RLS nueva en Supabase)
