# ANALYZE y estadísticas: por qué el planificador se equivoca sin ellas

- **Módulo:** El planificador de consultas de verdad
- **Slug:** `analyze-y-estadisticas` (autogenerado del título)
- **Orden:** 270
- **Fuentes:** [14. Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html) — ver `contenido/postgresql/TEMARIO.md` #10

---

## Qué es y para qué sirve

El planificador no adivina — decide a partir de estadísticas reales guardadas sobre cada tabla: cuántas filas tiene, cuántos valores distintos hay en cada columna, cómo se distribuyen. `ANALYZE` es el comando que recalcula esas estadísticas. Sin estadísticas actualizadas (una tabla recién cargada con muchos datos nuevos, por ejemplo), el planificador puede tomar decisiones genuinamente malas — no porque el índice no sirva, sino porque no sabe cuántas filas esperar de verdad.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Postgres estima 1 fila... para una consulta que devuelve 100",
  "esquemaSql": "CREATE TABLE pedidos (id serial primary key, estado text);\nINSERT INTO pedidos (estado)\nSELECT CASE WHEN n % 3 = 0 THEN 'entregado' ELSE 'pendiente' END\nFROM generate_series(1, 300) AS n;",
  "consulta": "EXPLAIN SELECT * FROM pedidos WHERE estado = 'entregado'",
  "anotaciones": [
    { "fragmento": "EXPLAIN SELECT * FROM pedidos WHERE estado = 'entregado'", "nota": "Fíjate en el rows= estimado del plan — sin ANALYZE, Postgres puede usar una estimación por defecto genérica (no basada en los datos reales de esta tabla), bastante alejada de las ~100 filas reales que existen." }
  ]
}
```

## El mismo EXPLAIN, después de `ANALYZE`

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Ejecuta ANALYZE pedidos; y repite el mismo EXPLAIN. Compara el rows= estimado con el del bloque de arriba — debería acercarse mucho más a la realidad.",
  "esquemaSql": "CREATE TABLE pedidos (id serial primary key, estado text);\nINSERT INTO pedidos (estado)\nSELECT CASE WHEN n % 3 = 0 THEN 'entregado' ELSE 'pendiente' END\nFROM generate_series(1, 300) AS n;\nANALYZE pedidos;",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN SELECT * FROM pedidos WHERE estado = 'entregado'"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Autovacuum ya ejecuta ANALYZE solo, casi siempre — pero no instantáneamente",
  "contenido": "En una base de datos de producción real, el proceso autovacuum (próximo módulo de este temario) ejecuta ANALYZE automáticamente cuando detecta suficientes cambios en una tabla — no hace falta lanzarlo a mano en el día a día. Pero justo después de una carga masiva de datos nueva (una migración, una importación grande), las estadísticas pueden quedar desactualizadas durante un rato — ejecutar ANALYZE a mano justo después es una práctica real, no solo un ejercicio académico."
}
```

## Ejercicios

1. Ejecuta los dos bloques en orden y compara el `rows=` estimado antes y después de `ANALYZE`.
2. ¿Por qué unas estadísticas desactualizadas podrían llevar al planificador a elegir Nested Loop cuando Hash Join habría sido más rápido (o viceversa)?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "14. Performance Tips",
      "descripcion": "Guía oficial de rendimiento, incluida la sección sobre estadísticas del planificador.",
      "url": "https://www.postgresql.org/docs/current/performance-tips.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
