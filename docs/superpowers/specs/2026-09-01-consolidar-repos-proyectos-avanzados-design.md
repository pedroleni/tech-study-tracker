# Consolidar los repos de "proyecto avanzado" por tecnología

**Estado:** ✅ implementada — 5 repos consolidados, 18 lecciones + 3 TEMARIO.md + 1 mención incidental actualizados y verificados en la base de datos real, 18 repos viejos en privado (sin borrar). Ver `docs/superpowers/plans/2026-09-01-consolidar-repos-proyectos-avanzados.md` para el detalle de verificación de cada tarea.

**Nota posterior (renombrado):** los 5 repos se renombraron después, quitando "avanzados" del nombre (`gh repo rename`, GitHub redirige la URL vieja automáticamente): `sql-proyectos`, `postgresql-proyectos`, `nodejs-proyectos`, `typescript-proyectos`, `javascript-proyectos`. El resto del documento conserva el nombre original (`<tecnologia>-proyectos-avanzados`) como registro de lo decidido en su momento — el nombre real y vigente es el de esta nota.

## Por qué existe

El patrón "proyecto avanzado" (SQL, PostgreSQL, Node.js, TypeScript,
JavaScript) crea un repositorio de GitHub independiente por cada
proyecto, con rama `main` (punto de partida con TODOs) y rama
`solucion` (implementación completa). A día de hoy (2026-09-01) esto
ha producido **18 repos**, mezclados en el perfil de GitHub del
usuario entre todos sus proyectos personales:

| Tecnología | Proyectos (repo actual) |
|---|---|
| SQL | `reportes-ventas-vistas-sql`, `catalogo-jerarquico-cte-recursiva`, `analitica-ventas-funciones-ventana`, `inventario-transaccional-sqlite` |
| PostgreSQL | `analitica-eventos-jsonb`, `auditoria-particionada`, `buscador-fts-postgres`, `reservas-multi-tenant-rls` |
| Node.js | `procesador-ventas-streams`, `acortador-rate-limit`, `api-auth-jwt`, `procesador-webhooks` |
| TypeScript | `maquina-estados-ts`, `cliente-tipado-zod`, `bus-eventos-ts`, `buscador-personajes-ts` |
| JavaScript | `gestor-de-tareas-js`, `explorador-personajes` |

Pedido explícito del usuario: "creo que hacer un repo por cada
proyecto es mucho, ¿podemos hacer un repo con todos los proyectos de
cada tecnología?" — confirmado tras brainstorming (ver historial):
migrar también los 18 repos existentes (no solo aplicar el patrón
nuevo a proyectos futuros), y dejar los 18 repos viejos **en privado**
tras la migración (no borrarlos).

## Validación

Confirmado con `gh api repos/pedroleni/<repo>/contents` sobre 5 repos
representativos (uno de SQL, uno de PostgreSQL, uno de Node.js, uno de
TypeScript, uno de JavaScript): todos son proyectos Node
autocontenidos con su propio `package.json`/`package-lock.json` (y en
el caso de PostgreSQL, `docker-compose.yml` para una instancia local
real), sin dependencias entre sí. Esto confirma que anidarlos como
carpetas hermanas dentro de un único repo no requiere ninguna
herramienta de monorepo (workspaces, lerna, etc.) — cada carpeta sigue
siendo un proyecto Node normal, ejecutable con un `cd` previo.

Todos los 18 repos tienen exactamente dos ramas (`main`, `solucion`),
confirmado con `gh api repos/pedroleni/<repo>/branches`.

## Alcance

### 1. Cinco repos nuevos, uno por tecnología

Nombre: `<tecnologia>-proyectos-avanzados` (todo en minúsculas, guiones):

- `sql-proyectos-avanzados`
- `postgresql-proyectos-avanzados`
- `nodejs-proyectos-avanzados`
- `typescript-proyectos-avanzados`
- `javascript-proyectos-avanzados`

Cada uno con exactamente dos ramas, igual que antes:

- **`main`**: una carpeta por proyecto de esa tecnología, cada una con
  el contenido de la rama `main` del repo viejo correspondiente (punto
  de partida con TODOs).
- **`solucion`**: misma estructura de carpetas, cada una con el
  contenido de la rama `solucion` del repo viejo correspondiente
  (implementación completa).

Nombre de cada carpeta: el nombre del proyecto **sin el sufijo de
tecnología**, ya redundante con el nombre del repo que lo contiene:

| Repo viejo | Carpeta nueva (en `typescript-proyectos-avanzados`) |
|---|---|
| `buscador-personajes-ts` | `buscador-personajes` |
| `bus-eventos-ts` | `bus-eventos` |
| `cliente-tipado-zod` | `cliente-zod` |
| `maquina-estados-ts` | `maquina-estados` |

(Y análogamente para el resto — ver la tabla completa en "Mapa de
migración" más abajo.)

**No se conserva historial de commits** al migrar: son scaffolds
generados para el curso, no código con valor histórico propio. Cada
proyecto se importa como un commit nuevo ("Importa `<proyecto>` desde
`<repo-viejo>`") sobre el árbol de ficheros ya existente del repo
viejo, sin `git subtree`/`filter-repo`.

### 2. README de índice nuevo por repo

Cada uno de los 5 repos nuevos tiene un `README.md` en la raíz (en
ambas ramas, mismo contenido) que:

- Lista los proyectos que contiene, con enlace a su carpeta.
- Enlaza a la lección correspondiente en Tech Study Tracker.
- Explica una vez el patrón común: "cada carpeta es un proyecto
  independiente — entra en ella (`cd <carpeta>`) antes de instalar
  dependencias o ejecutar nada".

El `README.md` propio de cada proyecto (dentro de su carpeta) se
conserva tal cual, con **una línea añadida al principio** recordando
en qué carpeta hay que estar (por si alguien llega directo a esa
carpeta desde un enlace de la lección, sin pasar por el README raíz).

### 3. Cambia el comando para ejecutar cada proyecto

Antes: `git clone <repo-viejo> && cd <repo-viejo> && npm install`.
Ahora: `git clone <repo-nuevo> && cd <repo-nuevo>/<carpeta> && npm
install`. Este cambio se refleja en:

- El README de cada proyecto (la línea añadida del punto 2).
- El texto de la lección correspondiente, en cualquier sitio donde
  ahora mismo diga "clona el repositorio y ejecuta..." — hay que
  añadir el `cd <carpeta>` intermedio.

### 4. Contenido a actualizar (22 ficheros)

Localizados con `grep -rl "github.com/pedroleni/<repo-viejo>"
contenido/`:

**18 lecciones de proyecto** (una por proyecto — mismo fichero que ya
existía, no se crean lecciones nuevas):

- SQL (4): `46-proyecto-avanzado-inventario-transaccional.md`,
  `47-proyecto-avanzado-analitica-ventas-ventana.md`,
  `48-proyecto-avanzado-catalogo-jerarquico-cte.md`,
  `49-proyecto-avanzado-reportes-vistas-sql.md`
- PostgreSQL (4): `62-proyecto-avanzado-reservas-multi-tenant-con-rls.md`,
  `63-proyecto-avanzado-buscador-fts.md`,
  `64-proyecto-avanzado-auditoria-particionada.md`,
  `65-proyecto-avanzado-analitica-eventos-jsonb.md`
- Node.js (4): `52-proyecto-avanzado-api-rest-con-autenticacion-jwt.md`,
  `53-proyecto-avanzado-procesador-de-webhooks-con-firma-hmac.md`,
  `54-proyecto-avanzado-acortador-de-urls-con-rate-limiting.md`,
  `55-proyecto-avanzado-procesador-de-ventas-por-lotes.md`
- TypeScript (4): `55-proyecto-avanzado-buscador-de-personajes-con-typescript.md`,
  `56-proyecto-avanzado-bus-de-eventos-tipado.md`,
  `57-proyecto-avanzado-cliente-tipado-con-zod.md`,
  `58-proyecto-avanzado-maquina-de-estados-tipada.md`
- JavaScript (2): `76-proyecto-avanzado-gestor-de-tareas.md`,
  `77-proyecto-avanzado-explorador-de-personajes-vite.md`

En cada una: el enlace del repo (callout "El repositorio" o similar),
las URLs de `tree/main`/`tree/solucion` en "Para profundizar", y el
paso de "clona y ejecuta" con el `cd` nuevo.

**3 ficheros `TEMARIO.md`** (índices de autoría, no se sincronizan a
ninguna lección publicada — solo referencia para quien escribe
contenido, actualizar por consistencia): `contenido/sql/TEMARIO.md`,
`contenido/typescript/TEMARIO.md`, `contenido/javascript/TEMARIO.md`.

**1 mención incidental**: `contenido/typescript/36-erasablesyntaxonly.md`
cita `github.com/pedroleni/buscador-personajes-ts` en un bloque
`recursos` (el gotcha real de `erasableSyntaxOnly` se encontró en ese
proyecto) — actualizar la URL al nuevo repo/carpeta.

Cada una de las 18 lecciones de proyecto está **ya publicada** — el
cambio de contenido se sincroniza con la lección real vía el editor de
administración, mismo proceso ya usado en esta sesión (leer contenido
actual de la DB, aplicar el mismo reemplazo quirúrgico, guardar,
verificar con Playwright).

### 5. Verificación real antes de tocar nada de producción

Por cada uno de los 5 repos nuevos, al menos un proyecto se verifica
de verdad tras la migración, no solo se asume que copiar ficheros
basta:

- Los proyectos con test suite propio (`tests/`, `vitest.config.ts`):
  clonar la carpeta migrada, `npm install`, `npm test` — deben pasar
  igual que en el repo viejo.
- Los proyectos sin test suite (los frontend puros, `buscador-personajes`,
  `explorador-personajes`, `gestor-de-tareas`): servir con `npx
  serve <carpeta>` (o equivalente) y comprobar con Playwright que la
  app carga y funciona igual que antes de moverla — mismo nivel de
  verificación que ya se hizo con `gestor-de-tareas-js` en esta sesión.

### 6. Los 18 repos viejos, en privado

Una vez verificado que los 5 repos nuevos funcionan y las 18 lecciones
están actualizadas y confirmadas en producción-local:
`gh repo edit pedroleni/<repo-viejo> --visibility private` para cada
uno de los 18. No se borran — quedan como copia de seguridad privada,
recuperable si hiciera falta.

## Fuera de alcance

- No se toca el patrón de proyecto avanzado en sí (rama
  `main`/`solucion`, README con TODOs) — solo dónde vive cada uno.
- No se crea ninguna herramienta de monorepo (workspaces, Nx, Turborepo)
  — cada carpeta sigue siendo un proyecto Node independiente.
- No se conserva el historial de commits de los repos viejos.
- No aplica a proyectos avanzados de Git (no existen todavía — el
  temario de Git aprobado los deja "diseño pendiente hasta llegar a
  esa fase", ver `specs/features/git-en-vivo.md`) ni a HTML/CSS (no
  tienen proyectos avanzados con repo propio, solo proyectos sencillos
  con editor en vivo).

## Checkpoints de seguridad

- **Creación de repos públicos nuevos**: confirmar que cada uno de los
  5 repos nuevos se crea con la visibilidad correcta (`--public`,
  igual que los viejos) y sin secretos en el contenido copiado — los
  proyectos viejos no deberían tener ninguno (son scaffolds de
  ejercicio), pero se hace un `grep` de patrones típicos (`.env` con
  valores reales, claves, tokens) sobre todo el contenido copiado
  antes de hacer push, igual que el scanner de secretos que ya corre
  en cada commit de este repo.
- **Cambio de visibilidad de 18 repos a privado**: acción real e
  irreversible en el sentido de que cualquier enlace externo ya
  indexado (buscadores, capturas, el propio historial de esta
  conversación) dejará de resolver en abierto — se ejecuta **solo**
  después de confirmar que los 5 repos nuevos y las 18 lecciones
  actualizadas funcionan, nunca antes.
- **No se borra nada**: los 18 repos viejos quedan privados, no se
  elimina ningún repo ni ninguna rama — reversible sin más que
  volver a hacerlos públicos si algo falla más adelante.

## Mapa de migración completo

| Tecnología | Repo nuevo | Carpeta | Repo viejo | Lección |
|---|---|---|---|---|
| SQL | `sql-proyectos-avanzados` | `inventario-transaccional` | `inventario-transaccional-sqlite` | `sql/46-proyecto-avanzado-inventario-transaccional.md` |
| SQL | `sql-proyectos-avanzados` | `analitica-ventas-ventana` | `analitica-ventas-funciones-ventana` | `sql/47-proyecto-avanzado-analitica-ventas-ventana.md` |
| SQL | `sql-proyectos-avanzados` | `catalogo-jerarquico-cte` | `catalogo-jerarquico-cte-recursiva` | `sql/48-proyecto-avanzado-catalogo-jerarquico-cte.md` |
| SQL | `sql-proyectos-avanzados` | `reportes-vistas-sql` | `reportes-ventas-vistas-sql` | `sql/49-proyecto-avanzado-reportes-vistas-sql.md` |
| PostgreSQL | `postgresql-proyectos-avanzados` | `reservas-multi-tenant-rls` | `reservas-multi-tenant-rls` | `postgresql/62-proyecto-avanzado-reservas-multi-tenant-con-rls.md` |
| PostgreSQL | `postgresql-proyectos-avanzados` | `buscador-fts` | `buscador-fts-postgres` | `postgresql/63-proyecto-avanzado-buscador-fts.md` |
| PostgreSQL | `postgresql-proyectos-avanzados` | `auditoria-particionada` | `auditoria-particionada` | `postgresql/64-proyecto-avanzado-auditoria-particionada.md` |
| PostgreSQL | `postgresql-proyectos-avanzados` | `analitica-eventos-jsonb` | `analitica-eventos-jsonb` | `postgresql/65-proyecto-avanzado-analitica-eventos-jsonb.md` |
| Node.js | `nodejs-proyectos-avanzados` | `api-auth-jwt` | `api-auth-jwt` | `nodejs/52-proyecto-avanzado-api-rest-con-autenticacion-jwt.md` |
| Node.js | `nodejs-proyectos-avanzados` | `procesador-webhooks` | `procesador-webhooks` | `nodejs/53-proyecto-avanzado-procesador-de-webhooks-con-firma-hmac.md` |
| Node.js | `nodejs-proyectos-avanzados` | `acortador-rate-limit` | `acortador-rate-limit` | `nodejs/54-proyecto-avanzado-acortador-de-urls-con-rate-limiting.md` |
| Node.js | `nodejs-proyectos-avanzados` | `procesador-ventas-streams` | `procesador-ventas-streams` | `nodejs/55-proyecto-avanzado-procesador-de-ventas-por-lotes.md` |
| TypeScript | `typescript-proyectos-avanzados` | `buscador-personajes` | `buscador-personajes-ts` | `typescript/55-proyecto-avanzado-buscador-de-personajes-con-typescript.md` (+ mención en `typescript/36-erasablesyntaxonly.md`) |
| TypeScript | `typescript-proyectos-avanzados` | `bus-eventos` | `bus-eventos-ts` | `typescript/56-proyecto-avanzado-bus-de-eventos-tipado.md` |
| TypeScript | `typescript-proyectos-avanzados` | `cliente-zod` | `cliente-tipado-zod` | `typescript/57-proyecto-avanzado-cliente-tipado-con-zod.md` |
| TypeScript | `typescript-proyectos-avanzados` | `maquina-estados` | `maquina-estados-ts` | `typescript/58-proyecto-avanzado-maquina-de-estados-tipada.md` |
| JavaScript | `javascript-proyectos-avanzados` | `gestor-de-tareas` | `gestor-de-tareas-js` | `javascript/76-proyecto-avanzado-gestor-de-tareas.md` |
| JavaScript | `javascript-proyectos-avanzados` | `explorador-personajes` | `explorador-personajes` | `javascript/77-proyecto-avanzado-explorador-de-personajes-vite.md` |

Más los 3 `TEMARIO.md` (`sql`, `typescript`, `javascript`) — actualizar
los enlaces que listan, sin sincronización a ninguna lección
publicada.

## Checklist de implementación

- [ ] Crear los 5 repos nuevos (`gh repo create`, públicos, con
  descripción)
- [ ] Por cada uno de los 18 proyectos: clonar `main` y `solucion` del
  repo viejo, copiar a la carpeta correspondiente del repo nuevo en
  cada rama respectiva
- [ ] Añadir el `README.md` índice a cada uno de los 5 repos nuevos
  (ambas ramas)
- [ ] Añadir la línea de "estás en la carpeta X" al README propio de
  cada uno de los 18 proyectos
- [ ] `grep` de secretos sobre el contenido copiado antes de cualquier
  push
- [ ] Push de `main` y `solucion` de los 5 repos nuevos
- [ ] Verificación real: al menos un proyecto por tecnología, tests
  automáticos si los tiene o comprobación real con Playwright si es
  frontend puro
- [ ] Actualizar los 22 ficheros de contenido (18 lecciones + 3
  TEMARIO + 1 mención incidental) con las URLs y el paso `cd` nuevos
- [ ] Sincronizar las 18 lecciones actualizadas con la base de datos
  real (editor de administración, verificado con Playwright)
- [ ] `npx vitest run`/`tsc`/`eslint` en verde (por si algún cambio de
  contenido rompiera algún test que referencie estas lecciones)
- [ ] Solo entonces: poner los 18 repos viejos en privado
- [ ] Commit de los cambios de contenido en una rama, PR/merge a `main`
