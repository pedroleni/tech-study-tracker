# to_tsvector/to_tsquery y ts_rank: puntuar relevancia

- **Módulo:** Búsqueda de texto completo
- **Slug:** `to-tsvector-ts-rank` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [12. Full Text Search](https://www.postgresql.org/docs/current/textsearch.html) — ver `contenido/postgresql/TEMARIO.md` #9

---

## Qué es y para qué sirve

Buscar en una tabla real de artículos, y ordenar los resultados por qué tan relevante es cada uno — no solo "coincide sí/no", sino "cuánto coincide". `ts_rank()` calcula una puntuación real a partir de cuántas veces aparece cada término buscado, y dónde.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Buscar y ordenar por relevancia real, en una tabla",
  "esquemaSql": "CREATE TABLE articulos (id serial primary key, titulo text, cuerpo text);\nINSERT INTO articulos (titulo, cuerpo) VALUES\n  ('Cómo cocinar pasta', 'La pasta se cocina en agua hirviendo con sal. La pasta italiana es la mejor pasta.'),\n  ('Recetas de verano', 'Ensaladas frescas para el verano, ideales para comer al aire libre.'),\n  ('Historia de la pasta', 'La pasta tiene siglos de historia en la gastronomía italiana.');",
  "consulta": "SELECT titulo, ts_rank(to_tsvector('spanish', titulo || ' ' || cuerpo), to_tsquery('spanish', 'pasta')) AS relevancia\nFROM articulos\nWHERE to_tsvector('spanish', titulo || ' ' || cuerpo) @@ to_tsquery('spanish', 'pasta')\nORDER BY relevancia DESC",
  "anotaciones": [
    { "fragmento": "ts_rank(to_tsvector('spanish', titulo || ' ' || cuerpo), to_tsquery('spanish', 'pasta'))", "nota": "ts_rank necesita el tsvector del documento y la tsquery de búsqueda, en ese orden — devuelve un número real (no acotado a 0-1) que solo tiene sentido COMPARADO entre filas de la misma búsqueda, nunca como un valor absoluto." },
    { "fragmento": "ORDER BY relevancia DESC", "nota": "El artículo que menciona \"pasta\" varias veces (el primero) debería puntuar más alto que el que solo la menciona una vez de pasada (el tercero) — compruébalo tú mismo en el resultado real." }
  ]
}
```

## Combinar términos: `&` (Y), `|` (O), `!` (NO)

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Busca artículos que hablen de 'pasta' pero NO de 'historia' (usa & y ! dentro de to_tsquery).",
  "esquemaSql": "CREATE TABLE articulos (id serial primary key, titulo text, cuerpo text);\nINSERT INTO articulos (titulo, cuerpo) VALUES\n  ('Cómo cocinar pasta', 'La pasta se cocina en agua hirviendo con sal.'),\n  ('Recetas de verano', 'Ensaladas frescas para el verano.'),\n  ('Historia de la pasta', 'La pasta tiene siglos de historia en la gastronomía italiana.');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT titulo FROM articulos WHERE to_tsvector('spanish', titulo || ' ' || cuerpo) @@ to_tsquery('spanish', 'pasta & !historia')"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que "Cómo cocinar pasta" (que menciona "pasta" tres veces) puntúa más alto que "Historia de la pasta" (una sola mención).
2. ¿Qué esperas que devuelva `to_tsquery('spanish', 'pasta | verano')` sobre esta misma tabla? Pruébalo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "12. Full Text Search",
      "descripcion": "Capítulo completo de búsqueda de texto completo en PostgreSQL.",
      "url": "https://www.postgresql.org/docs/current/textsearch.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
