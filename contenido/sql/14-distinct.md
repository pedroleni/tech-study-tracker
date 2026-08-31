# DISTINCT

- **Módulo:** Agregación
- **Slug:** `distinct` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #14

---

## Qué es y para qué sirve

`DISTINCT` elimina filas duplicadas del resultado — se aplica sobre la combinación completa de columnas seleccionadas, no columna por columna.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Qué productos se han vendido, sin repetir",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT);\nINSERT INTO ventas VALUES (1, 'Cuaderno'), (2, 'Auriculares'), (3, 'Cuaderno'), (4, 'Cuaderno'), (5, 'Mochila');",
  "consulta": "SELECT DISTINCT producto\nFROM ventas",
  "anotaciones": [
    { "fragmento": "DISTINCT producto", "nota": "Sin DISTINCT, 'Cuaderno' aparecería 3 veces en el resultado (una por cada venta) — con DISTINCT, aparece una sola vez." }
  ]
}
```

## `DISTINCT` sobre varias columnas: la fila completa, no cada una por separado

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "SELECT DISTINCT columna1, columna2 compara la combinación",
  "contenido": "DISTINCT no elimina duplicados de columna1 y de columna2 por separado — elimina filas donde AMBAS columnas juntas ya aparecieron antes. Dos filas con el mismo producto pero distinto vendedor NO se consideran duplicadas entre sí."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar DISTINCT como sustituto de GROUP BY cuando en realidad hace falta agregar algo.", "texto": "DISTINCT solo quita filas repetidas — si además hace falta contar cuántas veces se repetía cada una, GROUP BY con COUNT() es la herramienta correcta, no DISTINCT." },
    { "titulo": "Usar SELECT DISTINCT * en tablas grandes sin necesidad real.", "texto": "Comparar TODAS las columnas para detectar duplicados es más costoso que comparar solo las columnas que de verdad importan — mejor ser explícito sobre qué columnas debe considerar DISTINCT." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra, sin repetir, los nombres distintos de vendedores que aparecen en la tabla.",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, vendedor TEXT);\nINSERT INTO ventas VALUES (1, 'Cuaderno', 'Ana'), (2, 'Auriculares', 'Luis'), (3, 'Cuaderno', 'Ana'), (4, 'Mochila', 'Ana'), (5, 'Teclado', 'Luis');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT DISTINCT vendedor FROM ventas"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SELECT",
      "descripcion": "Referencia oficial de SELECT, incluido DISTINCT.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
