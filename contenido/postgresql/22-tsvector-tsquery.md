# tsvector/tsquery: qué son de verdad, más allá de LIKE

- **Módulo:** Búsqueda de texto completo
- **Slug:** `tsvector-tsquery` (autogenerado del título)
- **Orden:** 220
- **Fuentes:** [8.11. Text Search Types](https://www.postgresql.org/docs/current/datatype-textsearch.html) — ver `contenido/postgresql/TEMARIO.md` #9

---

## Qué es y para qué sirve

`LIKE '%palabra%'` (ya lo viste en el track de SQL) busca una coincidencia LITERAL de caracteres — no sabe que "corriendo" y "correr" son formas de la misma palabra, no entiende variaciones, no puede ordenar resultados por relevancia. Postgres trae un sistema real de **búsqueda de texto completo**, con dos tipos propios: `tsvector` (el documento, ya procesado y listo para buscar) y `tsquery` (la consulta de búsqueda, en el mismo formato procesado).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un texto convertido a tsvector, palabra a palabra",
  "esquemaSql": "-- Nada que crear: to_tsvector procesa un texto suelto, sin tabla.",
  "consulta": "SELECT to_tsvector('spanish', 'El gato corría rápidamente por el jardín') AS documento_procesado",
  "anotaciones": [
    { "fragmento": "to_tsvector('spanish', ...)", "nota": "El primer argumento es la configuración de idioma — determina qué palabras se consideran \"vacías\" (el, por, en...) y cómo se reduce cada palabra a su raíz (stemming): corría se indexa como corr, no como la palabra literal." }
  ]
}
```

## `@@`: el operador real de coincidencia

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Comprueba que buscar 'correr' encuentra un texto que contiene 'corría' — formas distintas de la misma raíz — usando el operador @@.",
  "esquemaSql": "-- Nada que crear: se compara un tsvector con una tsquery directamente.",
  "consultaInicial": "",
  "consultaSolucion": "SELECT to_tsvector('spanish', 'El gato corría por el jardín') @@ to_tsquery('spanish', 'correr') AS coincide"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "'corría' y 'correr' coinciden porque comparten la misma raíz procesada, no por casualidad",
  "contenido": "to_tsvector y to_tsquery reducen ambos textos a la misma forma raíz (stemming) usando la configuración de idioma indicada — es exactamente lo que LIKE '%correr%' nunca podría hacer, porque LIKE compara caracteres literales, sin ningún conocimiento de la gramática del idioma."
}
```

## Ejercicios

1. Ejecuta el primer bloque y observa el formato real de un `tsvector` — cada palabra reducida a su raíz, con su posición dentro del texto original.
2. Cambia la consulta del segundo bloque para buscar una palabra que NO esté relacionada con el texto (por ejemplo, `'coche'`) y confirma que `coincide` da `false`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "8.11. Text Search Types",
      "descripcion": "Documentación oficial de tsvector y tsquery.",
      "url": "https://www.postgresql.org/docs/current/datatype-textsearch.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
