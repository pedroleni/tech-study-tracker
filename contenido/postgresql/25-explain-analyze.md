# EXPLAIN/EXPLAIN ANALYZE con costes y tiempos reales

- **Módulo:** El planificador de consultas de verdad
- **Slug:** `explain-analyze` (autogenerado del título)
- **Orden:** 250
- **Fuentes:** [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html) — ver `contenido/postgresql/TEMARIO.md` #10

---

## Qué es y para qué sirve

Ya usaste `EXPLAIN` varias veces en este temario, sin detenerte en él — es hora de mirarlo de cerca. `EXPLAIN` muestra el plan que Postgres ELEGIRÍA ejecutar, con costes ESTIMADOS, sin ejecutar la consulta de verdad. `EXPLAIN ANALYZE` sí la ejecuta de verdad, y añade tiempos REALES medidos — algo que el `EXPLAIN QUERY PLAN` de SQLite, que ya conoces del track de SQL, no puede darte.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "El mismo EXPLAIN, con y sin ANALYZE",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio numeric);\nINSERT INTO productos (nombre, precio) SELECT 'Producto ' || n, (n % 100) FROM generate_series(1, 1000) AS n;",
  "consulta": "EXPLAIN ANALYZE SELECT * FROM productos WHERE precio > 50",
  "anotaciones": [
    { "fragmento": "EXPLAIN ANALYZE SELECT * FROM productos WHERE precio > 50", "nota": "ANALYZE ejecuta la consulta DE VERDAD (con todos sus efectos, si tuviera algún UPDATE/DELETE) y mide el tiempo real de cada paso — nunca lo uses en una consulta que modifique datos sin pensarlo, porque los cambios sí se aplican." }
  ]
}
```

## Lo que `cost=X..Y` de verdad significa

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "cost=0.00..20.50 son DOS números: arranque y total.", "texto": "El primero es el coste estimado hasta devolver la PRIMERA fila; el segundo, hasta devolver TODAS. Para un LIMIT 1, lo que importa es el primer número, no el segundo." },
    { "titulo": "Son unidades abstractas, no milisegundos ni ninguna unidad real.", "texto": "El coste se calibra con page_cost/cpu_tuple_cost internos del planificador — solo tienen sentido para COMPARAR entre planes alternativos de la MISMA consulta, nunca como un tiempo real. Para tiempo real, hace falta ANALYZE." },
    { "titulo": "actual time=X..Y (solo con ANALYZE) sí son milisegundos reales.", "texto": "Medidos de verdad, ejecutando la consulta — la única forma fiable de saber cuánto tarda algo de verdad, en vez de confiar en la estimación del planificador." }
  ]
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y localiza en el resultado real tanto el `cost` estimado como el `actual time` medido — ¿son números parecidos o muy distintos?
2. ¿Por qué ejecutar `EXPLAIN ANALYZE DELETE FROM productos;` sin un `WHERE` sería peligroso de verdad, a diferencia de un `EXPLAIN` normal sobre la misma sentencia?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "EXPLAIN",
      "descripcion": "Documentación oficial completa del comando EXPLAIN.",
      "url": "https://www.postgresql.org/docs/current/sql-explain.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
