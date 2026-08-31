# Indexar búsqueda de texto con GIN

- **Módulo:** Búsqueda de texto completo
- **Slug:** `indexar-busqueda-de-texto-con-gin` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [12.9. Preferred Index Types for Text Search](https://www.postgresql.org/docs/current/textsearch-indexes.html) — ver `contenido/postgresql/TEMARIO.md` #9

---

## Qué es y para qué sirve

Igual que con JSONB (Módulo 3 de este temario), calcular `to_tsvector(...)` en cada fila de una búsqueda, cada vez, es caro sin un índice. GIN es también aquí el tipo recomendado por la propia documentación de Postgres para búsqueda de texto completo.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un índice GIN sobre una expresión tsvector",
  "esquemaSql": "CREATE TABLE articulos (id serial primary key, titulo text, cuerpo text);\nINSERT INTO articulos (titulo, cuerpo)\nSELECT 'Artículo ' || n, CASE WHEN n % 5 = 0 THEN 'Este habla de pasta y cocina italiana.' ELSE 'Contenido genérico sin relación.' END\nFROM generate_series(1, 300) AS n;\nCREATE INDEX idx_articulos_busqueda ON articulos USING GIN (to_tsvector('spanish', titulo || ' ' || cuerpo));",
  "consulta": "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'articulos'",
  "anotaciones": [
    { "fragmento": "USING GIN (to_tsvector('spanish', titulo || ' ' || cuerpo))", "nota": "Es un índice por EXPRESIÓN (ya lo viste en el Módulo 5) sobre un GIN — la combinación real que recomienda la documentación de Postgres para búsqueda de texto completo sobre columnas que no cambian de idioma." }
  ]
}
```

## Compruébalo: el plan real usa el índice

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Confirma con EXPLAIN que una búsqueda de texto completo real usa el índice GIN creado arriba.",
  "esquemaSql": "CREATE TABLE articulos (id serial primary key, titulo text, cuerpo text);\nINSERT INTO articulos (titulo, cuerpo)\nSELECT 'Artículo ' || n, CASE WHEN n % 5 = 0 THEN 'Este habla de pasta y cocina italiana.' ELSE 'Contenido genérico sin relación.' END\nFROM generate_series(1, 300) AS n;\nCREATE INDEX idx_articulos_busqueda ON articulos USING GIN (to_tsvector('spanish', titulo || ' ' || cuerpo));\nSET enable_seqscan = off;",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN SELECT id FROM articulos WHERE to_tsvector('spanish', titulo || ' ' || cuerpo) @@ to_tsquery('spanish', 'pasta')"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "La consulta debe usar la MISMA expresión que el índice, exactamente",
  "contenido": "El índice se creó sobre to_tsvector('spanish', titulo || ' ' || cuerpo) — una consulta que calcule to_tsvector de forma distinta (otro idioma, otro orden de concatenación, o solo sobre titulo) no coincide con la expresión indexada, y el planificador no podrá usar este índice para ella. Es el mismo principio de los índices por expresión del Módulo 5."
}
```

## Ejercicios

1. Ejecuta el segundo bloque y confirma en el `QUERY PLAN` que aparece `idx_articulos_busqueda`.
2. ¿Por qué una columna `tsvector` PRECALCULADA y guardada (en vez de calcularla al vuelo en cada consulta) suele ser la opción preferida en tablas con muchísimas filas? Piensa en el coste de escribir frente al de leer.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "12.9. Preferred Index Types for Text Search",
      "descripcion": "Documentación oficial sobre qué tipo de índice usar para búsqueda de texto completo.",
      "url": "https://www.postgresql.org/docs/current/textsearch-indexes.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
