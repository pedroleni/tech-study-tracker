# REFRESH MATERIALIZED VIEW (y CONCURRENTLY)

- **Módulo:** Vistas materializadas
- **Slug:** `refresh-materialized-view` (autogenerado del título)
- **Orden:** 410
- **Fuentes:** [REFRESH MATERIALIZED VIEW](https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html) — ver `contenido/postgresql/TEMARIO.md` #15

---

## Qué es y para qué sirve

Ya viste que una vista materializada no se actualiza sola. `REFRESH MATERIALIZED VIEW` es el comando que la recalcula de verdad, sustituyendo los datos guardados por el resultado actual de la consulta original.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "REFRESH trae los datos al día, de verdad",
  "esquemaSql": "CREATE TABLE ventas (id serial primary key, producto text, importe numeric);\nINSERT INTO ventas (producto, importe) VALUES ('Teclado', 45.99);\nCREATE MATERIALIZED VIEW resumen_ventas AS\n  SELECT producto, COUNT(*) AS unidades, SUM(importe) AS total\n  FROM ventas GROUP BY producto;\nINSERT INTO ventas (producto, importe) VALUES ('Teclado', 45.99);\nREFRESH MATERIALIZED VIEW resumen_ventas;",
  "consulta": "SELECT * FROM resumen_ventas",
  "anotaciones": [
    { "fragmento": "REFRESH MATERIALIZED VIEW resumen_ventas;", "nota": "Ejecuta la consulta original de nuevo, por completo, y sustituye los datos guardados — después de esto, resumen_ventas sí refleja las dos ventas reales, a diferencia de la lección anterior (donde no se hizo REFRESH)." }
  ]
}
```

## El precio real de REFRESH normal: bloquea las lecturas mientras dura

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "REFRESH normal bloquea la vista contra lecturas concurrentes",
  "contenido": "Un REFRESH MATERIALIZED VIEW normal toma un bloqueo que impide leer la vista mientras se recalcula — en una vista grande, eso puede significar que cualquier consulta que la use tenga que esperar. REFRESH MATERIALIZED VIEW CONCURRENTLY evita ese bloqueo (permite seguir leyendo la versión vieja mientras se calcula la nueva) — pero tiene un requisito real: la vista materializada necesita al menos un índice UNIQUE, o CONCURRENTLY falla directamente con un error."
}
```

## Compruébalo: CONCURRENTLY exige un índice único

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Intenta REFRESH MATERIALIZED VIEW CONCURRENTLY resumen_ventas; sobre una vista SIN ningún índice único, y lee el error real.",
  "esquemaSql": "CREATE TABLE ventas (id serial primary key, producto text, importe numeric);\nINSERT INTO ventas (producto, importe) VALUES ('Teclado', 45.99);\nCREATE MATERIALIZED VIEW resumen_ventas AS\n  SELECT producto, COUNT(*) AS unidades, SUM(importe) AS total\n  FROM ventas GROUP BY producto;",
  "consultaInicial": "REFRESH MATERIALIZED VIEW CONCURRENTLY resumen_ventas",
  "consultaSolucion": "REFRESH MATERIALIZED VIEW resumen_ventas"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que, tras el `REFRESH`, `unidades` ya muestra 2 — al día de verdad.
2. Ejecuta el segundo bloque tal cual (con `CONCURRENTLY`, sin índice único) y lee el mensaje de error exacto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "REFRESH MATERIALIZED VIEW",
      "descripcion": "Referencia oficial completa de REFRESH MATERIALIZED VIEW, incluida la opción CONCURRENTLY.",
      "url": "https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
