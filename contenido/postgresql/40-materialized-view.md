# CREATE MATERIALIZED VIEW: por qué SÍ se pueden escribir, a diferencia de SQLite

- **Módulo:** Vistas materializadas
- **Slug:** `materialized-view` (autogenerado del título)
- **Orden:** 400
- **Fuentes:** [CREATE MATERIALIZED VIEW](https://www.postgresql.org/docs/current/sql-creatematerializedview.html) — ver `contenido/postgresql/TEMARIO.md` #15

---

## Qué es y para qué sirve

En el track de SQL ya viste `CREATE VIEW` — una consulta guardada con nombre, que se vuelve a ejecutar EN CADA acceso; nunca guarda datos por sí misma. Postgres tiene una alternativa real que SQLite no tiene: una **vista materializada**, que SÍ guarda el resultado calculado, físicamente, hasta que se le pida explícitamente que se actualice.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una vista materializada real, con datos ya calculados y guardados",
  "esquemaSql": "CREATE TABLE ventas (id serial primary key, producto text, importe numeric);\nINSERT INTO ventas (producto, importe) VALUES ('Teclado', 45.99), ('Teclado', 45.99), ('Ratón', 19.50);\nCREATE MATERIALIZED VIEW resumen_ventas AS\n  SELECT producto, COUNT(*) AS unidades, SUM(importe) AS total\n  FROM ventas\n  GROUP BY producto;",
  "consulta": "SELECT * FROM resumen_ventas ORDER BY producto",
  "anotaciones": [
    { "fragmento": "CREATE MATERIALIZED VIEW resumen_ventas AS", "nota": "La consulta se ejecuta UNA VEZ, en este momento, y el resultado se guarda físicamente — leer resumen_ventas después no vuelve a agrupar ni sumar nada, solo lee los datos ya calculados." }
  ]
}
```

## La diferencia real: no se actualiza sola

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Se insertó una venta nueva DESPUÉS de crear la vista materializada. Consulta resumen_ventas y confirma que NO refleja la venta nueva — sigue mostrando los datos de cuando se creó.",
  "esquemaSql": "CREATE TABLE ventas (id serial primary key, producto text, importe numeric);\nINSERT INTO ventas (producto, importe) VALUES ('Teclado', 45.99);\nCREATE MATERIALIZED VIEW resumen_ventas AS\n  SELECT producto, COUNT(*) AS unidades, SUM(importe) AS total\n  FROM ventas\n  GROUP BY producto;\nINSERT INTO ventas (producto, importe) VALUES ('Teclado', 45.99);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT * FROM resumen_ventas"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Una vista normal SÍ habría reflejado la venta nueva — esta lección demuestra la diferencia real",
  "contenido": "Si resumen_ventas hubiera sido una CREATE VIEW normal, el mismo SELECT habría vuelto a ejecutar la consulta agrupada de cero, incluyendo la segunda venta. Una vista MATERIALIZADA congela el resultado en el momento de su creación (o del último REFRESH, próxima lección) — es la esencia real de la diferencia entre las dos."
}
```

## Ejercicios

1. Ejecuta el segundo bloque y confirma: `unidades` debería seguir siendo 1, no 2, aunque hay dos ventas reales en la tabla `ventas`.
2. ¿En qué situación real preferirías una vista materializada (datos "congelados", más rápidos de leer) frente a una vista normal (siempre al día, más lenta de leer)?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CREATE MATERIALIZED VIEW",
      "descripcion": "Referencia oficial completa de vistas materializadas.",
      "url": "https://www.postgresql.org/docs/current/sql-creatematerializedview.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
