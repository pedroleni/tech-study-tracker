# Temario de SQL — planteado desde cero

**Alcance:** temario completo de la tecnología "SQL" nueva en el
catálogo, categoría "Bases de datos" (nueva, hasta ahora solo existían
Frontend web, Backend, Herramientas). Nada de memoria: todo verificado en
vivo (`WebFetch`) el 2026-08-30 contra la documentación oficial de
**SQLite** — el motor real que ejecuta cada `sql-anotado`/`sql-en-vivo`
de este temario (`sql.js` 1.14.2, SQLite 3.49.1, ver
`specs/features/sql-en-vivo.md`).

**Por qué SQLite como referencia, si la tecnología se llama "SQL" a
secas:** el objetivo es enseñar SQL de la forma más agnóstica de motor
posible — pero cada ejemplo de este temario se **ejecuta de verdad**, y
el único motor real disponible en el navegador es SQLite. La solución no
es fingir un "SQL estándar" abstracto que luego no se puede probar: es
elegir sintaxis que SQLite soporta de verdad y que además es común a
prácticamente cualquier motor (PostgreSQL, MySQL, SQL Server) —
documentando explícitamente las pocas veces que algo es particular de
SQLite (tipado dinámico, `PRAGMA foreign_keys`, límites de `ALTER
TABLE`). El futuro track de "PostgreSQL" (separado, después de este,
mismo patrón que JavaScript/TypeScript) es donde vive lo que un motor de
producción real añade por encima — RLS, JSONB, extensiones,
`EXPLAIN ANALYZE` con costes reales.

**De dónde sale el contenido:**

- **[SQLite Language Reference](https://sqlite.org/lang.html)** — el
  índice completo de la sintaxis SQL real de SQLite, verificado en vivo:
  DDL (`CREATE TABLE`, `CREATE INDEX`, `CREATE VIEW`...), DML (`SELECT`,
  `INSERT`, `UPDATE`, `DELETE`, `UPSERT`), control de transacciones,
  funciones (agregado, núcleo, fecha/hora, JSON, matemáticas), funciones
  de ventana. Fuente principal de casi todas las lecciones.
- **[SQL As Understood By SQLite: SELECT](https://sqlite.org/lang_select.html)**
  — verificado en vivo: soporta `INNER`/`LEFT OUTER`/`RIGHT`/`FULL`/
  `CROSS`/`NATURAL JOIN`, `GROUP BY`/`HAVING`, `ORDER BY`/`LIMIT`/
  `OFFSET`, `DISTINCT`, `UNION`/`INTERSECT`/`EXCEPT`, funciones de
  ventana (`OVER`), CTEs con `WITH` (incluidas recursivas,
  `WITH RECURSIVE`).
- **[SQLite Release 3.39.0](https://sqlite.org/releaselog/3_39_0.html)**
  — verificado en vivo: `RIGHT`/`FULL OUTER JOIN` son soporte
  "(long overdue) support", añadido en esta versión (2022). `sql.js`
  1.14.2 bundla SQLite 3.49.1 — muy por encima del mínimo, sin problema.
- **[Foreign Key Support](https://sqlite.org/foreignkeys.html)** —
  verificado en vivo: las claves foráneas **no se validan por defecto**
  en SQLite, hace falta `PRAGMA foreign_keys = ON;` explícito por
  conexión — a diferencia de PostgreSQL/MySQL, donde sí se aplican
  siempre. Ver la nota técnica más abajo.
- **[Query Planning: EXPLAIN QUERY PLAN](https://sqlite.org/eqp.html)**
  — verificado en vivo: sintaxis, qué información expone (uso de
  índices, estrategia de join, si hace falta un b-tree temporal para
  ordenar), y el aviso de que el formato de salida puede cambiar entre
  versiones (uso interactivo, no para parsear en código).
- **[SQL Features That SQLite Does Not Implement](https://sqlite.org/omitted.html)**
  — verificado en vivo: `ALTER TABLE` solo admite `RENAME TABLE`/`ADD
  COLUMN`/`RENAME COLUMN`/`DROP COLUMN` (nada de `ALTER COLUMN` ni
  `ADD CONSTRAINT`); las vistas son de solo lectura; sin `GRANT`/`REVOKE`
  (SQLite es embebido, sin control de acceso a nivel de base de datos).

## Convenciones compartidas con el resto de temarios

- **Todos los ejemplos se ejecutan de verdad.** A diferencia de
  Node.js/TypeScript (que tuvieron que recurrir a `codigo-anotado` de
  solo lectura por limitaciones reales de plataforma), SQL sí se puede
  ejecutar en el navegador — cada lección usa `sql-anotado` (demostración
  fija, con anotaciones) o `sql-en-vivo` (editable, con verificación
  opcional contra una solución). Ver `specs/features/sql-en-vivo.md`.
- **Dataset distinto por módulo** (decisión ya tomada con el usuario,
  ver el spec) — variedad temática en vez de un único esquema para las
  ~45 lecciones. Cada bloque embebe su propio `esquemaSql`
  (`CREATE TABLE` + `INSERT`), autocontenido.
- **`predice-el-resultado` para sorpresas reales de SQL** — `NULL` en
  comparaciones, `GROUP BY` sin agregar todas las columnas seleccionadas,
  el orden de evaluación de `WHERE` frente a `HAVING`. No relleno.
- Validar cada lección con el mismo pipeline ya en uso: JSON de cada
  bloque parseado y comprobado contra el Zod real, además de una
  ejecución real de `esquemaSql`+`consulta`/`consultaSolucion` contra
  `sql.js` en Node (mismo patrón que las validaciones de contenido
  anteriores, adaptado a que aquí sí hay un motor ejecutable).

## Módulo 1 — El modelo relacional

| # | Lección | Fuentes |
|---|---|---|
| 1 | Qué es una base de datos relacional: tablas, filas y columnas | [Lang Overview](https://sqlite.org/lang.html) |
| 2 | Claves primarias: por qué toda tabla necesita una | [CREATE TABLE](https://sqlite.org/lang_createtable.html) |
| 3 | Tipos de datos en SQL (y el tipado dinámico particular de SQLite) | [Datatypes In SQLite](https://sqlite.org/datatype3.html) |
| 4 | Por qué separar datos en varias tablas relacionadas | [Lang Overview](https://sqlite.org/lang.html) |

## Módulo 2 — SELECT y filtrado

| # | Lección | Fuentes |
|---|---|---|
| 5 | `SELECT`: elegir qué columnas ver | [SELECT](https://sqlite.org/lang_select.html) |
| 6 | `WHERE` y los operadores de comparación | [SELECT](https://sqlite.org/lang_select.html) + [Expression](https://sqlite.org/lang_expr.html) |
| 7 | `AND`/`OR`/`NOT` y su precedencia real | [Expression](https://sqlite.org/lang_expr.html) |
| 8 | `NULL`: por qué rompe la lógica normal (`IS NULL` frente a `= NULL`) | [Expression](https://sqlite.org/lang_expr.html) |
| 9 | `ORDER BY`, `LIMIT` y `OFFSET` | [SELECT](https://sqlite.org/lang_select.html) |
| 10 | `LIKE` y patrones de texto | [Expression](https://sqlite.org/lang_expr.html) |

## Módulo 3 — Agregación

| # | Lección | Fuentes |
|---|---|---|
| 11 | Funciones de agregado: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` | [Aggregate Functions](https://sqlite.org/lang_aggfunc.html) |
| 12 | `GROUP BY`: agrupar antes de agregar | [SELECT](https://sqlite.org/lang_select.html) |
| 13 | `HAVING`: filtrar grupos, no filas | [SELECT](https://sqlite.org/lang_select.html) |
| 14 | `DISTINCT` | [SELECT](https://sqlite.org/lang_select.html) |

## Módulo 4 — Joins

| # | Lección | Fuentes |
|---|---|---|
| 15 | Por qué unir tablas: el problema que resuelve un JOIN | [SELECT](https://sqlite.org/lang_select.html) |
| 16 | `INNER JOIN` | [SELECT](https://sqlite.org/lang_select.html) |
| 17 | `LEFT JOIN` (y por qué `RIGHT JOIN` casi no se usa en la práctica) | [SELECT](https://sqlite.org/lang_select.html) |
| 18 | `FULL JOIN` | [SELECT](https://sqlite.org/lang_select.html) + [Release 3.39.0](https://sqlite.org/releaselog/3_39_0.html) |
| 19 | Self-join y joins de más de dos tablas | [SELECT](https://sqlite.org/lang_select.html) |

## Módulo 5 — Subconsultas y CTEs

| # | Lección | Fuentes |
|---|---|---|
| 20 | Subconsultas dentro de `WHERE` | [Expression](https://sqlite.org/lang_expr.html) |
| 21 | Subconsultas correlacionadas | [Expression](https://sqlite.org/lang_expr.html) |
| 22 | CTEs con `WITH`: nombrar una subconsulta | [WITH clause](https://sqlite.org/lang_with.html) |
| 23 | CTEs recursivas (`WITH RECURSIVE`) | [WITH clause](https://sqlite.org/lang_with.html) |

## Módulo 6 — Modificar datos

| # | Lección | Fuentes |
|---|---|---|
| 24 | `INSERT`: añadir filas | [INSERT](https://sqlite.org/lang_insert.html) |
| 25 | `UPDATE`: modificar filas existentes | [UPDATE](https://sqlite.org/lang_update.html) |
| 26 | `DELETE`: borrar filas | [DELETE](https://sqlite.org/lang_delete.html) |
| 27 | `UPSERT`: insertar o actualizar en un solo paso | [UPSERT](https://sqlite.org/lang_upsert.html) |

## Módulo 7 — Diseño de esquema

| # | Lección | Fuentes |
|---|---|---|
| 28 | `CREATE TABLE` y los tipos de columna reales | [CREATE TABLE](https://sqlite.org/lang_createtable.html) |
| 29 | Restricciones: `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT` | [CREATE TABLE](https://sqlite.org/lang_createtable.html) |
| 30 | Claves foráneas e integridad referencial | [Foreign Key Support](https://sqlite.org/foreignkeys.html) |
| 31 | Normalización: 1FN, 2FN, 3FN | [Lang Overview](https://sqlite.org/lang.html) |
| 32 | `ALTER TABLE` y sus límites reales en SQLite | [ALTER TABLE](https://sqlite.org/lang_altertable.html) + [Omitted Features](https://sqlite.org/omitted.html) |

## Módulo 8 — Índices y rendimiento

| # | Lección | Fuentes |
|---|---|---|
| 33 | Qué es un índice y cómo acelera una consulta | [CREATE INDEX](https://sqlite.org/lang_createindex.html) |
| 34 | Cuándo un índice no ayuda (o perjudica) | [Query Optimizer Overview](https://sqlite.org/optoverview.html) |
| 35 | `EXPLAIN QUERY PLAN`: ver qué hace el motor de verdad | [EXPLAIN QUERY PLAN](https://sqlite.org/eqp.html) |

## Módulo 9 — Transacciones

| # | Lección | Fuentes |
|---|---|---|
| 36 | Qué es una transacción y las propiedades ACID | [Transaction](https://sqlite.org/lang_transaction.html) |
| 37 | `BEGIN`, `COMMIT`, `ROLLBACK` | [Transaction](https://sqlite.org/lang_transaction.html) |
| 38 | Por qué una transacción falla a medias (y qué se deshace) | [Transaction](https://sqlite.org/lang_transaction.html) + [SAVEPOINT](https://sqlite.org/lang_savepoint.html) |

## Módulo 10 — Vistas y funciones auxiliares

| # | Lección | Fuentes |
|---|---|---|
| 39 | `CREATE VIEW`: guardar una consulta con nombre | [CREATE VIEW](https://sqlite.org/lang_createview.html) |
| 40 | Por qué las vistas son de solo lectura en SQLite | [Omitted Features](https://sqlite.org/omitted.html) |
| 41 | Funciones de fecha y hora | [Date And Time Functions](https://sqlite.org/lang_datefunc.html) |
| 42 | Funciones JSON | [JSON Functions](https://sqlite.org/json1.html) |

## Módulo 11 — Funciones de ventana

| # | Lección | Fuentes |
|---|---|---|
| 43 | Qué es una función de ventana y en qué se diferencia de `GROUP BY` | [Window Functions](https://sqlite.org/windowfunctions.html) |
| 44 | `ROW_NUMBER`, `RANK`, `DENSE_RANK` | [Window Functions](https://sqlite.org/windowfunctions.html) |
| 45 | `PARTITION BY` y frames: totales acumulados | [Window Functions](https://sqlite.org/windowfunctions.html) |

**Total: 45 lecciones en 11 módulos**, más un Módulo 12 — Proyectos
(lecciones 46-49) añadido después. Cada lección de los 11 módulos ya
trae su propio ejercicio ejecutable vía `sql-en-vivo`, con verificación
de resultado cuando aplica — eso no cambia. La razón original para no
tener proyectos ("una consulta SQL suelta no necesita un entorno
completo") seguía siendo cierta, pero un proyecto que combina SQL real
con código de aplicación real alrededor (una transacción atómica que
deja de serlo si se quita `db.transaction()`, una vista cuyo cálculo se
consume desde TypeScript, una CTE recursiva que alimenta una API) sí
justifica un repo propio — el mismo criterio que ya se aplicó en
Node.js y PostgreSQL. Motor: `better-sqlite3` contra SQLite real, sin
Docker ni servidor (a diferencia de los proyectos de PostgreSQL).

## Módulo 12 — Proyectos

| # | Lección | Repositorio |
|---|---|---|
| 46 | Proyecto avanzado: inventario transaccional | [inventario-transaccional-sqlite](https://github.com/pedroleni/inventario-transaccional-sqlite) |
| 47 | Proyecto avanzado: analítica de ventas con funciones de ventana | [analitica-ventas-funciones-ventana](https://github.com/pedroleni/analitica-ventas-funciones-ventana) |
| 48 | Proyecto avanzado: catálogo jerárquico con CTE recursiva | [catalogo-jerarquico-cte-recursiva](https://github.com/pedroleni/catalogo-jerarquico-cte-recursiva) |
| 49 | Proyecto avanzado: reportes de ventas con vistas SQL | [reportes-ventas-vistas-sql](https://github.com/pedroleni/reportes-ventas-vistas-sql) |

## Nota técnica: claves foráneas no se validan por defecto en SQLite

Verificado en vivo: a diferencia de PostgreSQL o MySQL (donde una
`FOREIGN KEY` siempre se aplica), SQLite **no valida claves foráneas por
defecto** — hace falta `PRAGMA foreign_keys = ON;` explícito en cada
conexión. Esto afecta directamente a cómo se diseñan los bloques
`esquemaSql` de la lección 30 (claves foráneas): sin ese `PRAGMA`, un
`INSERT` que viole una referencia no fallaría, y el ejercicio mentiría
sobre lo que enseña. La lección debe incluir el `PRAGMA` explícitamente
en su `esquemaSql`, y explicar por qué hace falta — es una diferencia
real con motores de producción, no un detalle a esconder.

## Pendiente antes de escribir la primera lección

- [x] Crear la categoría "Bases de datos" vía el flujo de admin.
- [x] Crear la tecnología "SQL" vía el flujo de admin, categoría "Bases
  de datos".
- [x] Confirmar el orden de publicación — todas de golpe, como Node.js.

## Estado

Las 45 lecciones están escritas, validadas (esquema Zod + ejecución real
contra `sql.js` de cada `esquemaSql`/consulta) y publicadas. Pendiente:
el track de "PostgreSQL" (tecnología separada, después de este, mismo
patrón que JavaScript/TypeScript).
