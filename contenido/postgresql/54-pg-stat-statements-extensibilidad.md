# pg_stat_statements y la extensibilidad real de Postgres

- **Módulo:** Extensiones
- **Slug:** `pg-stat-statements-y-la-extensibilidad-real-de-postgres` (autogenerado del título)
- **Orden:** 540
- **Fuentes:** [Appendix F. Additional Supplied Modules and Extensions](https://www.postgresql.org/docs/current/contrib.html) — ver `contenido/postgresql/TEMARIO.md` #16

---

## Qué es y para qué sirve

`pg_stat_statements` es la extensión que registra, para CADA consulta distinta que se ha ejecutado en el servidor, cuántas veces se llamó, cuánto tiempo total consumió, y su tiempo medio — la base real de cualquier panel de "consultas más lentas" (el propio panel de Query Performance de Supabase se apoya en ella). No se puede activar en PGlite (no viene compilada para el navegador), así que esta lección lo comprueba en vivo y luego explica qué harías con ella en un Postgres real.

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Intenta activar pg_stat_statements y lee el error real.",
  "esquemaSql": "SELECT 1",
  "consultaInicial": "CREATE EXTENSION pg_stat_statements"
}
```

## Un límite del entorno, no de Postgres

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "\"no está disponible\" aquí es distinto de \"no existe\"",
  "contenido": "El error que acabas de ver (extension \"pg_stat_statements\" is not available) es una limitación de ESTE entorno concreto: PGlite (Postgres compilado a WebAssembly para el navegador) solo trae compiladas unas pocas extensiones, y pg_stat_statements no es una de ellas — a diferencia de pgcrypto o uuid-ossp, no hay ningún módulo que cargar aparte para activarla aquí. En un Postgres de servidor real (incluido el que usa este propio proyecto, en Supabase), pg_stat_statements SÍ está disponible y se activa exactamente igual que cualquier otra extensión, con el mismo CREATE EXTENSION."
}
```

## Qué harías con ella en un Postgres real

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "pg_stat_statements agrupa por FORMA de consulta, no por texto exacto.", "texto": "SELECT * FROM productos WHERE id = 1 y SELECT * FROM productos WHERE id = 2 cuentan como la MISMA entrada (los valores literales se normalizan) — así el total de veces que se ejecuta \"esa forma de consulta\" es real, no se fragmenta por cada valor distinto." },
    { "titulo": "La consulta real para encontrar las más lentas.", "texto": "SELECT query, calls, mean_exec_time, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10; — el total_exec_time más alto identifica qué consulta, sumando todas sus ejecuciones, más tiempo real de CPU le está costando al servidor." },
    { "titulo": "Es acumulativo desde que se activó (o el último pg_stat_statements_reset()).", "texto": "Los números no son \"ahora mismo\" — son un acumulado histórico. Antes de comparar el efecto de una optimización, conviene resetear las estadísticas para medir solo el tramo que interesa." }
  ]
}
```

## El verdadero superpoder: el mismo mecanismo, para cosas enormes

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "PostGIS y pgvector: CREATE EXTENSION, pero para dominios enteros",
  "contenido": "pgcrypto y uuid-ossp añaden un puñado de funciones. PostGIS añade un motor geoespacial completo — geometría, distancias reales, índices espaciales — con el mismo CREATE EXTENSION postgis. pgvector añade un tipo vector y operadores de similitud (la base de cualquier búsqueda semántica con embeddings de IA) con CREATE EXTENSION vector. Ninguna viene compilada en PGlite, pero activarlas en un Postgres real usa el mismo mecanismo que ya viste con pgcrypto: una sola sentencia, sin instalar una base de datos especializada aparte."
}
```

## Ejercicios

1. Ejecuta el bloque y confirma el mensaje de error exacto.
2. Si tuvieras acceso a `pg_stat_statements` en producción, ¿qué columna mirarías para encontrar la consulta que se ejecuta MÁS VECES (aunque cada ejecución sea rápida), en vez de la que más tiempo TOTAL consume?
3. ¿Por qué elegir Postgres con pgvector, en vez de una base de datos vectorial dedicada, puede tener sentido para una aplicación que YA guarda sus datos relacionales en Postgres?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Appendix F. Additional Supplied Modules and Extensions",
      "descripcion": "Índice oficial de extensiones, incluida pg_stat_statements.",
      "url": "https://www.postgresql.org/docs/current/contrib.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
