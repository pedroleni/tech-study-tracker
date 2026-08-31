# Proyecto avanzado: buscador de artículos con búsqueda de texto completo

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-buscador-de-articulos-con-busqueda-de-texto-completo` (autogenerado del título)
- **Orden:** 630
- **Repositorio:** [github.com/pedroleni/buscador-fts-postgres](https://github.com/pedroleni/buscador-fts-postgres)
- **Requiere:** Módulo 6 (Búsqueda de texto completo) y la lección 40-41 (Vistas materializadas) de este mismo temario

---

## Qué vas a construir

Un buscador de artículos que ordena los resultados por relevancia REAL — no por fecha, no por si el título coincide letra por letra — usando `tsvector`/`tsquery`/`ts_rank` contra un Postgres real, con fragmentos resaltados (`ts_headline`) y una vista materializada de términos de búsqueda populares, alimentada por búsquedas reales.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/buscador-fts-postgres — rama main con el esquema (tsvector con pesos, índice GIN, vista materializada) y toda la aplicación completos; solo el filtro y el ranking de buscarArticulos() en src/articulos.ts están recortados. Rama solucion con la consulta completa."
}
```

## El punto de partida: una consulta que nunca encuentra nada

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nconst resultado = await pool.query(\n  `select\n     a.id, a.titulo, a.cuerpo, a.publicado_en,\n     0 as relevancia,       -- TODO: sustituye por ts_rank real\n     a.cuerpo as fragmento  -- TODO: sustituye por ts_headline real\n   from articulos as a\n   where $1::text is null   -- TODO: sustituye por el filtro real con @@\n   order by a.id`,\n  [consulta],\n);\n</script>",
  "anotaciones": [
    { "fragmento": "where $1::text is null", "nota": "consulta nunca es null de verdad (siempre llega como texto) — por eso esta condición es SIEMPRE falsa, y buscarArticulos siempre devuelve un array vacío. npm test falla en las 2 pruebas que dependen de encontrar resultados reales." },
    { "fragmento": "0 as relevancia,       -- TODO", "nota": "relevancia y fragmento están rellenos con valores fijos solo para que el tipo TypeScript ResultadoBusqueda siga siendo válido mientras completas la consulta — no son el resultado final." }
  ]
}
```

## La columna que ya existe: un tsvector con pesos, generado solo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nbusqueda tsvector generated always as (\n  setweight(to_tsvector('spanish', titulo), 'A') ||\n  setweight(to_tsvector('spanish', cuerpo), 'B')\n) stored\n</script>",
  "anotaciones": [
    { "fragmento": "setweight(to_tsvector('spanish', titulo), 'A')", "nota": "El peso 'A' (el más alto) va al título; 'B' al cuerpo. Un artículo que menciona el término buscado en el TÍTULO rankea más alto que uno que solo lo menciona una vez en un párrafo del cuerpo — exactamente lo que comprueba uno de los tests." }
  ]
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Levanta Postgres, migra y siembra artículos reales.", "texto": "docker compose up -d, npm install, npm run migrate, npm run seed — 10 artículos con contenido real y solapado a propósito, para que el ranking sea observable." },
    { "titulo": "Ejecuta los tests tal cual — 2 de 5 deben fallar.", "texto": "Los tests que comprueban ranking y fragmento resaltado fallan; los que comprueban 'sin resultados' o el registro de búsquedas pasan igual, porque no dependen del filtro real." },
    { "titulo": "Completa la consulta y confirma los 5.", "texto": "Sustituye el WHERE y las dos columnas por websearch_to_tsquery + @@ + ts_rank + ts_headline (tal como viste en el módulo 6) y vuelve a correr npm test." }
  ]
}
```

## Un gotcha real de este proyecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cada búsqueda se registra, incluso mientras el ejercicio está sin resolver",
  "contenido": "buscarArticulos() inserta en registros_busqueda ANTES de ejecutar la consulta de ranking — así que, aunque tu WHERE todavía no encuentre nada, la vista materializada busquedas_populares SÍ empieza a acumular datos reales desde el primer intento. Es deliberado: separa \"¿se usó esta función?\" de \"¿la consulta principal ya funciona?\"."
}
```

## Retos para ampliarlo

1. Añade una columna `idioma` a `articulos` y usa `to_tsvector(idioma::regconfig, ...)` en vez de `'spanish'` fijo, para soportar artículos en varios idiomas.
2. Combínalo con la lección de índices por expresión (20): crea un índice adicional sobre `lower(titulo)` para autocompletado exacto de títulos, aparte de la búsqueda por relevancia.
3. Añade un ranking que combine `ts_rank` con la fecha de publicación (artículos más recientes, a igual relevancia, primero) usando una fórmula propia en el `ORDER BY`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "buscador-fts-postgres (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/buscador-fts-postgres/tree/main",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "buscador-fts-postgres (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/buscador-fts-postgres/tree/solucion",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "12.3. Controlling Text Search",
      "descripcion": "Referencia oficial de Postgres sobre ts_rank, ts_headline y las funciones de búsqueda de texto completo.",
      "url": "https://www.postgresql.org/docs/current/textsearch-controls.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
