# Temario de PostgreSQL — propuesta a aprobar

**Estado: PROPUESTA, no aprobada todavía.** Este documento es el temario
a discutir y ajustar contigo antes de escribir la primera lección —
mismo proceso que se siguió con `contenido/sql/TEMARIO.md` y
`contenido/nodejs/TEMARIO.md`.

**Alcance:** temario completo de una tecnología "PostgreSQL" nueva,
hermana de "SQL" dentro de la categoría "Bases de datos". Verificado en
vivo (`WebSearch`/`WebFetch`) el 2026-08-31 contra la documentación
oficial de PostgreSQL 18 (`postgresql.org/docs/current`) — cada URL de
la tabla "Fuentes" se comprobó real, no de memoria.

**Requisito previo: el temario completo de "SQL".** Este track da por
aprendido TODO `contenido/sql/TEMARIO.md` (45 lecciones: `SELECT`,
`WHERE`, agregación, los 4 tipos de `JOIN`, subconsultas, CTEs
—incluidas recursivas—, `INSERT`/`UPDATE`/`DELETE`/`UPSERT`, diseño de
esquema, normalización, índices básicos, transacciones/ACID, vistas,
funciones de fecha/JSON, funciones de ventana). **No se repite nada de
eso aquí.** Este temario se centra exclusivamente en lo que un motor de
producción cliente-servidor real añade por encima de un motor embebido
como SQLite — literalmente la frase que ya dejó pendiente
`contenido/sql/TEMARIO.md`: *"RLS, JSONB, extensiones, `EXPLAIN
ANALYZE` con costes reales"*.

**Por qué esto no es "relleno" para este proyecto en concreto:**
tech-study-tracker corre sobre Supabase, que es PostgreSQL real por
debajo — RLS, `SECURITY DEFINER`, índices en claves foráneas,
migraciones, todo lo que ya se sigue en
`.agents/skills/supabase-postgres-best-practices/` y
`security/security-review-instructions.md` es, literalmente, el
contenido de este temario. El módulo de cierre lo hace explícito con un
recorrido real por `supabase/migrations/` del propio repo.

---

## Pregunta abierta antes de escribir la primera lección: cómo se ejecuta

`contenido/sql/TEMARIO.md` pudo asumir que **todo** se ejecuta de
verdad porque sql.js (SQLite→WASM) corre entero en el navegador sin
red. PostgreSQL es un motor cliente-servidor real, y algunas de las
piezas de este temario (roles/`GRANT` multi-usuario, replicación,
tiempos reales de autovacuum, `LISTEN`/`NOTIFY` entre sesiones
distintas) no tienen un equivalente limpio de "un solo navegador, sin
servidor". Antes de escribir contenido hace falta una decisión de
ingeniería explícita (su propio brainstorm/spec, no improvisada aquí):

- **Candidato real: [PGlite](https://pglite.dev/)** (PostgreSQL de
  verdad compilado a WASM, del equipo de ElectricSQL) — a diferencia de
  sql.js, esto SÍ ejecutaría Postgres real, no un motor distinto. Un
  vistazo rápido sugiere que cubriría de verdad: DDL/DML avanzado,
  JSONB, todos los tipos de índice (aunque los costes de `EXPLAIN
  ANALYZE` en una base en memoria no reflejan un disco real), PL/pgSQL,
  triggers, vistas materializadas, secuencias/identity, y — el más
  importante para este proyecto — **RLS real** (`CREATE POLICY` de
  verdad, no una simulación).
- **Lo que casi seguro NO puede ser `sql-en-vivo`** (por ser
  intrínsecamente multi-conexión/multi-servidor, no por limitación de
  PGlite en concreto): roles con contraseña real y `GRANT` entre
  usuarios distintos, replicación/alta disponibilidad, temporización
  real de autovacuum, `LISTEN`/`NOTIFY` cruzando dos sesiones — esto
  probablemente cae en `codigo-anotado` (demostración fija) o un
  diagrama, mismo patrón que Node.js tuvo que usar para lo que el
  navegador no puede ejecutar de verdad.
- Esto se resuelve con su propio brainstorm antes de tocar código —
  aquí solo se deja marcado para que no se dé por hecho que "todo será
  como SQL".

## Convenciones que si se mantienen del track de SQL

- Dataset propio por módulo, autocontenido.
- `predice-el-resultado` para sorpresas reales (aquí hay más que nunca:
  `NULL` en arrays, `JSONB` con claves ausentes frente a `null`,
  aislamiento de transacción con lecturas concurrentes).
- Validación con el mismo pipeline: Zod real + ejecución real contra el
  motor que se acabe eligiendo.
- Sin módulo de "Proyectos" separado — siguiendo el mismo criterio que
  SQL: cada lección trae su propio ejercicio ejecutable.

---

## Módulo 1 — Qué es PostgreSQL, y de un motor embebido a uno de producción real

| # | Lección | Fuentes |
|---|---|---|
| 1 | Qué es PostgreSQL y por qué existe: historia breve, quién lo usa en producción real, y qué relación tiene con "SQL" (el lenguaje) frente a SQLite/MySQL (otros motores) | [About](https://www.postgresql.org/about/) |
| 2 | Cliente-servidor frente a embebido: qué cambia de verdad al usar Postgres | [PostgreSQL Documentation](https://www.postgresql.org/docs/current/index.html) |
| 3 | Claves foráneas: por qué en Postgres SIEMPRE se validan (a diferencia de SQLite) | [Chapter 5. Data Definition](https://www.postgresql.org/docs/current/ddl.html) |
| 4 | Esquemas (`schemas`): espacios de nombres reales dentro de una base de datos | [5.10. Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html) |
| 5 | Roles y privilegios: primer vistazo (usuarios Y grupos a la vez) | [Chapter 21. Database Roles](https://www.postgresql.org/docs/current/user-manag.html) |

## Módulo 2 — Tipos de datos que SQLite no tiene

| # | Lección | Fuentes |
|---|---|---|
| 6 | UUID como tipo nativo | [8. Data Types](https://www.postgresql.org/docs/current/datatype.html) |
| 7 | Arrays: columnas con más de un valor | [8.15. Arrays](https://www.postgresql.org/docs/current/arrays.html) |
| 8 | Tipos `ENUM` | [8.7. Enumerated Types](https://www.postgresql.org/docs/current/datatype-enum.html) |
| 9 | Tipos compuestos (`composite types`) | [8. Data Types](https://www.postgresql.org/docs/current/datatype.html) |
| 10 | Range types: modelar un rango (de fechas, de números) como un solo valor | [8.17. Range Types](https://www.postgresql.org/docs/current/rangetypes.html) |

## Módulo 3 — JSON de verdad: JSONB

| # | Lección | Fuentes |
|---|---|---|
| 11 | `json` frente a `jsonb`: por qué `jsonb` casi siempre gana | [8.14. JSON Types](https://www.postgresql.org/docs/current/datatype-json.html) |
| 12 | Operadores y funciones JSONB (`->`, `->>`, `@>`, `?`, `jsonb_set`) | [9.16. JSON Functions and Operators](https://www.postgresql.org/docs/current/functions-json.html) |
| 13 | Indexar JSONB con GIN | [65.4. GIN Indexes](https://www.postgresql.org/docs/current/gin.html) |

## Módulo 4 — DDL avanzado

| # | Lección | Fuentes |
|---|---|---|
| 14 | `ALTER TABLE` completo: `ALTER COLUMN`, `ADD CONSTRAINT`, cambiar de tipo con `USING` | [Chapter 5. Data Definition](https://www.postgresql.org/docs/current/ddl.html) |
| 15 | Columnas identity (`GENERATED ALWAYS AS IDENTITY`) frente al viejo `SERIAL` | [5.3. Identity Columns](https://www.postgresql.org/docs/current/ddl-identity-columns.html) |
| 16 | Columnas generadas (`GENERATED ALWAYS AS (...) STORED`) | [5.4. Generated Columns](https://www.postgresql.org/docs/current/ddl-generated-columns.html) |
| 17 | Secuencias como objeto de primera clase (`CREATE SEQUENCE`, `nextval`) | [9.17. Sequence Manipulation Functions](https://www.postgresql.org/docs/current/functions-sequence.html) |

## Módulo 5 — Índices más allá de B-tree

| # | Lección | Fuentes |
|---|---|---|
| 18 | Los tipos de índice de Postgres: B-tree, Hash, GiST, SP-GiST, GIN, BRIN — cuándo usar cada uno | [11.2. Index Types](https://www.postgresql.org/docs/current/indexes-types.html) |
| 19 | Índices parciales: indexar solo las filas que importan | [65. Built-in Index Access Methods](https://www.postgresql.org/docs/current/indextypes.html) |
| 20 | Índices por expresión | [65. Built-in Index Access Methods](https://www.postgresql.org/docs/current/indextypes.html) |
| 21 | Índices multicolumna: por qué el orden de las columnas importa | [11. Indexes](https://www.postgresql.org/docs/current/indexes.html) |

## Módulo 6 — Búsqueda de texto completo

| # | Lección | Fuentes |
|---|---|---|
| 22 | `tsvector`/`tsquery`: qué son de verdad, más allá de `LIKE` | [8.11. Text Search Types](https://www.postgresql.org/docs/current/datatype-textsearch.html) |
| 23 | `to_tsvector`/`to_tsquery` y `ts_rank`: puntuar relevancia | [12. Full Text Search](https://www.postgresql.org/docs/current/textsearch.html) |
| 24 | Indexar búsqueda de texto con GIN | [12.9. Preferred Index Types for Text Search](https://www.postgresql.org/docs/current/textsearch-indexes.html) |

## Módulo 7 — El planificador de consultas de verdad

| # | Lección | Fuentes |
|---|---|---|
| 25 | `EXPLAIN`/`EXPLAIN ANALYZE` con costes y tiempos reales (frente al `EXPLAIN QUERY PLAN` de SQLite) | [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html) |
| 26 | Leer un plan real: seq scan, index scan, index only scan, nested loop, hash join, merge join | [14. Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html) |
| 27 | `ANALYZE` y estadísticas: por qué el planificador se equivoca sin ellas | [14. Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html) |

## Módulo 8 — Concurrencia real: MVCC

| # | Lección | Fuentes |
|---|---|---|
| 28 | MVCC: cómo Postgres deja leer y escribir a la vez sin bloquearse | [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) |
| 29 | Niveles de aislamiento de transacción: Read Committed, Repeatable Read, Serializable | [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) |
| 30 | Bloqueos explícitos: `FOR UPDATE`, `FOR SHARE` | [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) |
| 31 | Deadlocks: cómo ocurren y cómo Postgres los detecta | [13. Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html) |

## Módulo 9 — Mantenimiento: VACUUM

| # | Lección | Fuentes |
|---|---|---|
| 32 | Por qué existe `VACUUM` (MVCC deja "tuplas muertas" detrás) | [24.1. Routine Vacuuming](https://www.postgresql.org/docs/current/routine-vacuuming.html) |
| 33 | Autovacuum: qué hace solo y cuándo hay que intervenir a mano (`VACUUM FULL`) | [VACUUM](https://www.postgresql.org/docs/current/sql-vacuum.html) |

## Módulo 10 — Funciones y procedimientos con PL/pgSQL

| # | Lección | Fuentes |
|---|---|---|
| 34 | PL/pgSQL: variables, `IF`/`CASE`, bucles | [41. PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html) |
| 35 | `CREATE FUNCTION` frente a `CREATE PROCEDURE`: cuándo cada uno | [CREATE PROCEDURE](https://www.postgresql.org/docs/current/sql-createprocedure.html) |
| 36 | Manejo de errores: `RAISE`, `EXCEPTION`, bloques `BEGIN`/`EXCEPTION` | [41.9. Errors and Messages](https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html) |

## Módulo 11 — Triggers

| # | Lección | Fuentes |
|---|---|---|
| 37 | `CREATE TRIGGER`: `BEFORE`/`AFTER`, por fila o por sentencia | [37. Triggers](https://www.postgresql.org/docs/current/triggers.html) |
| 38 | `NEW` y `OLD` dentro de un trigger | [37. Triggers](https://www.postgresql.org/docs/current/triggers.html) |
| 39 | Caso real: un `updated_at` automático (el patrón que ya usa este propio proyecto) | [37. Triggers](https://www.postgresql.org/docs/current/triggers.html) |

## Módulo 12 — Vistas materializadas

| # | Lección | Fuentes |
|---|---|---|
| 40 | `CREATE MATERIALIZED VIEW`: por qué SÍ se pueden escribir, a diferencia de las vistas de SQLite | [CREATE MATERIALIZED VIEW](https://www.postgresql.org/docs/current/sql-creatematerializedview.html) |
| 41 | `REFRESH MATERIALIZED VIEW` (y `CONCURRENTLY`): cuándo tiene sentido frente a una vista normal | [39.3. Materialized Views](https://www.postgresql.org/docs/current/rules-materializedviews.html) |

## Módulo 13 — Roles, privilegios y control de acceso real

| # | Lección | Fuentes |
|---|---|---|
| 42 | Roles a fondo: `CREATE ROLE`, `LOGIN`, pertenencia a grupos | [CREATE ROLE](https://www.postgresql.org/docs/current/sql-createrole.html) |
| 43 | `GRANT`/`REVOKE`: control de acceso real que SQLite no tiene | [5.8. Privileges](https://www.postgresql.org/docs/current/ddl-priv.html) |
| 44 | Roles predefinidos (`pg_read_all_data`, etc.) | [21.5. Predefined Roles](https://www.postgresql.org/docs/current/predefined-roles.html) |

## Módulo 14 — Row Level Security (RLS)

| # | Lección | Fuentes |
|---|---|---|
| 45 | Qué es RLS y el problema real que resuelve | [5.9. Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) |
| 46 | `CREATE POLICY`: `USING` frente a `WITH CHECK` | [5.9. Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) |
| 47 | Políticas por operación (`SELECT`/`INSERT`/`UPDATE`/`DELETE`) y por rol | [5.9. Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) |
| 48 | Caso real: así protege sus tablas este propio proyecto (RLS de tech-study-tracker sobre Supabase) | `.agents/skills/supabase-postgres-best-practices/` + `security/security-review-instructions.md` (fuentes internas del repo) |

## Módulo 15 — Particionado de tablas

| # | Lección | Fuentes |
|---|---|---|
| 49 | Table partitioning declarativo: por qué particionar una tabla enorme | [5.12. Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html) |
| 50 | Particionado por rango, por lista y por hash | [5.12. Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html) |
| 51 | Poda de particiones (`partition pruning`) en el plan de consulta | [5.12. Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html) |

## Módulo 16 — Extensiones

| # | Lección | Fuentes |
|---|---|---|
| 52 | `CREATE EXTENSION`: cómo Postgres añade funcionalidad sin recompilar | [Appendix F. Additional Supplied Modules and Extensions](https://www.postgresql.org/docs/current/contrib.html) |
| 53 | `pgcrypto` y `uuid-ossp`: dos extensiones de uso real | [Appendix F. Additional Supplied Modules and Extensions](https://www.postgresql.org/docs/current/contrib.html) |
| 54 | `pg_stat_statements`: observabilidad real de qué consultas pesan más (y por qué Postgres "gana" en extensibilidad — mención de PostGIS/pgvector) | [Appendix F. Additional Supplied Modules and Extensions](https://www.postgresql.org/docs/current/contrib.html) |

## Módulo 17 — Comunicación entre sesiones: LISTEN/NOTIFY

| # | Lección | Fuentes |
|---|---|---|
| 55 | `LISTEN`/`NOTIFY`: pub/sub real dentro de la propia base de datos | [LISTEN](https://www.postgresql.org/docs/current/sql-listen.html) + [NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html) |
| 56 | Caso real de uso: así se apoya Supabase Realtime en este mismo mecanismo | [LISTEN](https://www.postgresql.org/docs/current/sql-listen.html) |

## Módulo 18 — Carga masiva y operación

| # | Lección | Fuentes |
|---|---|---|
| 57 | `COPY`: la forma rápida de cargar/exportar datos | [COPY](https://www.postgresql.org/docs/current/sql-copy.html) |
| 58 | `pg_dump`/`pg_restore`: backups reales | [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) |
| 59 | Alta disponibilidad y replicación: panorama conceptual (física frente a lógica, por qué importa) | [26. High Availability, Load Balancing, and Replication](https://www.postgresql.org/docs/current/high-availability.html) + [29. Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html) |

## Módulo 19 — Cierre: cómo está construido este propio proyecto sobre Postgres

| # | Lección | Fuentes |
|---|---|---|
| 60 | Recorrido real por `supabase/migrations/`: RLS, funciones `SECURITY DEFINER`, índices en claves foráneas, en producción | Fuente interna: `supabase/migrations/` de este repo |
| 61 | De un motor embebido a un motor de producción: qué te llevas de este track | — (síntesis, sin fuente externa) |

---

**Total propuesto: 61 lecciones en 19 módulos.**

## Notas técnicas a documentar explícitamente en las lecciones (diferencias reales con SQLite)

- **Claves foráneas**: en Postgres se validan siempre, sin ningún
  `PRAGMA` — al revés que SQLite (que lo dejó opt-in). Contraste directo
  con la nota técnica que ya tiene `contenido/sql/TEMARIO.md`.
- **`ALTER TABLE`**: Postgres soporta `ALTER COLUMN` (tipo, default,
  `NOT NULL`) y `ADD CONSTRAINT` — justo lo que SQLite documenta como no
  soportado en `omitted.html`.
- **Vistas**: en SQLite son de solo lectura siempre; en Postgres una
  vista simple es automáticamente actualizable (`INSERT`/`UPDATE` a
  través de ella) bajo ciertas condiciones, y además existen las vistas
  MATERIALIZADAS, que SQLite no tiene en absoluto.
- **Roles/`GRANT`**: SQLite no tiene control de acceso a nivel de base
  de datos (es un fichero); Postgres sí, de verdad, con roles reales.
- **JSON**: SQLite solo tiene funciones JSON1 sobre texto; Postgres
  tiene un tipo binario dedicado (`jsonb`) con su propio índice GIN.

## Pendiente antes de escribir la primera lección

- [ ] **Aprobar o ajustar este temario** (módulos, orden, profundidad).
- [ ] **Brainstorm de ingeniería aparte**: decidir el motor de ejecución
  (PGlite vs. demostraciones estáticas para lo no ejecutable en
  navegador) — su propio spec, como se hizo con "SQL en vivo".
- [ ] Crear la tecnología "PostgreSQL" vía el flujo de admin, categoría
  "Bases de datos" (después de aprobar el temario, no antes).
