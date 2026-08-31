# De un motor embebido a un motor de producción: qué te llevas de este track

- **Módulo:** Cierre: cómo está construido este propio proyecto sobre Postgres
- **Slug:** `de-un-motor-embebido-a-un-motor-de-produccion-que-te-llevas-de-este-track` (autogenerado del título)
- **Orden:** 610
- **Fuentes:** — (síntesis, sin fuente externa) — ver `contenido/postgresql/TEMARIO.md` #19

---

## Qué es y para qué sirve

El track de SQL empezó con SQLite: un fichero, sin red, sin roles, sin nada corriendo de fondo — perfecto para aprender el LENGUAJE sin distracciones. Este track de PostgreSQL ha sido, de principio a fin, la otra mitad: qué cambia de verdad cuando ese mismo lenguaje corre contra un servidor real, con conexiones concurrentes, roles con contraseña, y datos que sobreviven a decisiones que nadie tomó pensando en un solo usuario a la vez. No es una lección más — es el momento de ver las 19 piezas como un solo mapa.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Lo que se fue añadiendo, módulo a módulo",
  "items": [
    { "titulo": "Tipos y validación reales (módulos 1-4)", "texto": "Claves foráneas que SIEMPRE se validan, sin PRAGMA de por medio; UUID, arrays, enums, tipos compuestos y de rango; JSONB con su propio operador y su propio índice." },
    { "titulo": "Rendimiento medible (módulos 5-7)", "texto": "Índices más allá de B-tree (GIN, parciales, por expresión); búsqueda de texto completo con tsvector; EXPLAIN ANALYZE leído de verdad, no adivinado." },
    { "titulo": "Concurrencia de verdad (módulos 8-9)", "texto": "MVCC, niveles de aislamiento, bloqueos explícitos, deadlocks — todo lo que no existe cuando solo hay un proceso escribiendo en un fichero, y VACUUM, el precio real de que MVCC funcione." },
    { "titulo": "Programabilidad dentro de la base (módulos 10-12)", "texto": "PL/pgSQL, triggers que reaccionan solos a INSERT/UPDATE, vistas materializadas que sí se pueden escribir." },
    { "titulo": "Seguridad como capa de la base de datos (módulos 13-14)", "texto": "Roles reales con GRANT/REVOKE, y Row Level Security — la garantía de que cada fila se filtra sola, viva en la base de datos, no en la disciplina de quien escribe cada consulta." },
    { "titulo": "Escala y extensibilidad (módulos 15-16)", "texto": "Particionar una tabla enorme en piezas manejables, y CREATE EXTENSION como la puerta hacia todo lo que Postgres no trae de fábrica — desde pgcrypto hasta pgvector." },
    { "titulo": "Operación real (módulos 17-18)", "texto": "LISTEN/NOTIFY, COPY para cargas masivas, pg_dump/pg_restore, y por qué la alta disponibilidad exige replicación — física o lógica, cada una para un problema distinto." }
  ]
}
```

## Mitos que este track debería haber desmontado con evidencia, no con afirmaciones

```laboratorio
{
  "tipo": "mitos",
  "titulo": "Lo que probablemente creías antes de empezar — y lo que ejecutaste para comprobarlo",
  "mitos": [
    { "mito": "SQLite y Postgres son básicamente lo mismo, solo cambia el motor por debajo.", "realidad": "Comparten el lenguaje SQL, pero el modelo entero es distinto: Postgres tiene roles, conexiones concurrentes reales, MVCC con VACUUM, un planificador basado en costes, y una arquitectura extensible — nada de eso existe, ni puede existir, en un fichero sin proceso servidor." },
    { "mito": "Row Level Security ralentiza todas las consultas, porque añade trabajo extra a cada una.", "realidad": "Viste en el módulo 14 que una política de RLS es, para el planificador, una condición más — si la columna que usa está indexada, el coste es marginal, el mismo tipo de filtro que ya pagarías con un WHERE escrito a mano." },
    { "mito": "Cuantos más índices, mejor — nunca hacen daño.", "realidad": "En el módulo 5 y en el 7 comprobaste que el planificador a veces IGNORA un índice real y prefiere un Seq Scan, porque es más barato de verdad para esos datos — un índice de más cuesta espacio y ralentiza cada escritura, sin garantía de que se use." },
    { "mito": "Un backup automático diario ya cubre cualquier desastre.", "realidad": "En el módulo 18 viste que un pg_dump o un snapshot físico de las 3:00 AM no incluye nada de lo escrito a las 3:15 — solo la replicación continua del WAL (Point-in-Time Recovery) cierra ese hueco." }
  ]
}
```

## Qué hacer con esto ahora

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El siguiente paso real no es otra lección — es releer lo que ya tienes",
  "contenido": "Ya tienes un proyecto real corriendo sobre Postgres: este mismo (tech-study-tracker, sobre Supabase). El ejercicio más valioso ahora no es un ejercicio más de laboratorio, es abrir supabase/migrations/ con la mirada que acabas de entrenar — qué tabla nueva le falta un índice en su clave foránea, qué política de RLS podría escribirse con USING y WITH CHECK más precisos, qué consulta lenta se entendería mejor con un EXPLAIN ANALYZE real. El track termina aquí; la práctica, no."
}
```

## Ejercicios

1. De las 19 piezas del mapa de arriba, ¿cuál cambiaría más tu forma de diseñar una tabla nueva desde el primer día, y por qué?
2. Elige un mito de la lista que tú mismo creías cierto antes de este track — ¿qué bloque concreto, de qué lección, fue el que te lo desmontó?
3. Abre `supabase/migrations/` de este proyecto (ya lo hiciste en la lección anterior) y busca una tabla que NO haya visto todavía en este track — ¿tiene RLS activo? ¿Tiene sus claves foráneas indexadas?
