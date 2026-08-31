# Los tipos de índice de Postgres: cuándo usar cada uno

- **Módulo:** Índices más allá de B-tree
- **Slug:** `tipos-de-indice` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [11.2. Index Types](https://www.postgresql.org/docs/current/indexes-types.html) — ver `contenido/postgresql/TEMARIO.md` #8

---

## Qué es y para qué sirve

El track de SQL solo usó índices B-tree (el tipo por defecto, y el único que tiene SQLite). Postgres trae varios motores de índice distintos, cada uno especializado en un tipo de búsqueda: **B-tree** (igualdad y rangos: `=`, `<`, `BETWEEN` — el generalista, el que ya conoces), **Hash** (solo igualdad exacta, más compacto que B-tree para ese caso concreto), **GIN** (ya lo usaste en JSONB: contenido dentro de un valor — arrays, jsonb, búsqueda de texto), **GiST** (datos geométricos, rangos, búsquedas de vecino más cercano), **SP-GiST** y **BRIN** (casos especializados: datos con particiones naturales, o tablas gigantes con datos ordenados físicamente).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Tres índices distintos, tres propósitos distintos",
  "esquemaSql": "CREATE TABLE eventos (id serial primary key, tipo text, datos jsonb, ocurrido_en timestamptz);\nCREATE INDEX idx_tipo_hash ON eventos USING HASH (tipo);\nCREATE INDEX idx_datos_gin ON eventos USING GIN (datos);\nCREATE INDEX idx_ocurrido_btree ON eventos USING BTREE (ocurrido_en);",
  "consulta": "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'eventos' ORDER BY indexname",
  "anotaciones": [
    { "fragmento": "CREATE INDEX idx_tipo_hash ON eventos USING HASH (tipo);", "nota": "HASH solo sirve para tipo = 'x' — no puede ayudar con tipo > 'x' ni con ORDER BY tipo, a diferencia de B-tree. A cambio, para igualdad exacta pura, puede ser algo más compacto." },
    { "fragmento": "CREATE INDEX idx_datos_gin ON eventos USING GIN (datos);", "nota": "Ya lo viste en el módulo de JSONB — indexa el contenido interno de cada valor, no el valor completo." },
    { "fragmento": "CREATE INDEX idx_ocurrido_btree ON eventos USING BTREE (ocurrido_en);", "nota": "BTREE es el tipo por defecto — tanto da escribir USING BTREE como omitirlo. Aparece explícito aquí solo para que los tres índices se vean uno junto al otro." }
  ]
}
```

## Guía rápida real

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "B-tree: la opción por defecto, casi siempre correcta.", "texto": "Igualdad, rangos (<, >, BETWEEN), ORDER BY, y funciona con casi cualquier tipo de dato comparable. Si dudas, empieza aquí." },
    { "titulo": "GIN: cuando 'contiene' es la pregunta, no 'es igual a'.", "texto": "jsonb con @>, arrays con @>/&&, búsqueda de texto completo (Módulo 6 de este temario) — cualquier caso donde un solo valor de columna 'contiene' varios elementos indexables por separado." },
    { "titulo": "GiST: geometría, rangos que se solapan, vecino más cercano.", "texto": "range types (ya los viste), tipos geométricos, extensiones como PostGIS (datos geoespaciales) — casos donde 'cerca de' o 'se solapa con' es la pregunta real, no una igualdad." },
    { "titulo": "BRIN: tablas gigantes, datos que ya están ordenados físicamente.", "texto": "Un log de eventos insertado en orden cronológico, por ejemplo — BRIN indexa RANGOS de bloques de disco en vez de filas individuales, mucho más pequeño que B-tree para ese caso concreto, a costa de ser menos preciso." }
  ]
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y confirma en `indexdef` que los tres índices reales usan el método (`USING ...`) correcto.
2. Para una columna `email` donde solo harás búsquedas de `email = '...'` (nunca rangos ni ordenación), ¿tendría sentido usar HASH en vez de B-tree? ¿Por qué normalmente se sigue prefiriendo B-tree igualmente?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "11.2. Index Types",
      "descripcion": "Documentación oficial de los tipos de índice de PostgreSQL.",
      "url": "https://www.postgresql.org/docs/current/indexes-types.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
