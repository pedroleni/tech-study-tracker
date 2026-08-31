# Índices parciales: indexar solo las filas que importan

- **Módulo:** Índices más allá de B-tree
- **Slug:** `indices-parciales` (autogenerado del título)
- **Orden:** 190
- **Fuentes:** [65. Built-in Index Access Methods](https://www.postgresql.org/docs/current/indextypes.html) — ver `contenido/postgresql/TEMARIO.md` #8

---

## Qué es y para qué sirve

Un índice normal cubre todas las filas de la tabla. Un **índice parcial** añade un `WHERE` a la propia definición del índice — solo indexa las filas que cumplen esa condición. Si el 95% de tus consultas reales solo buscan pedidos `pendiente`, indexar también el 95% de filas ya `entregado`/`cancelado` es puro desperdicio de espacio y de tiempo de escritura.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Indexar solo lo que de verdad se consulta a menudo",
  "esquemaSql": "CREATE TABLE pedidos (id serial primary key, estado text, total numeric);\nINSERT INTO pedidos (estado, total)\nSELECT (ARRAY['pendiente','entregado','cancelado'])[1 + (n % 20 = 0)::int + (n % 7 = 0)::int], n\nFROM generate_series(1, 200) AS n;\nCREATE INDEX idx_pedidos_pendientes ON pedidos (id) WHERE estado = 'pendiente';",
  "consulta": "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'pedidos'",
  "anotaciones": [
    { "fragmento": "CREATE INDEX idx_pedidos_pendientes ON pedidos (id) WHERE estado = 'pendiente';", "nota": "El WHERE va en la definición del ÍNDICE, no en la consulta — este índice ni siquiera contiene entradas para las filas entregado/cancelado, así que pesa menos y se actualiza menos en cada escritura de esas filas." }
  ]
}
```

## El índice solo ayuda si la consulta usa la MISMA condición

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un índice parcial solo cubre exactamente lo que su WHERE promete",
  "contenido": "SELECT * FROM pedidos WHERE estado = 'pendiente' puede usar idx_pedidos_pendientes — pero SELECT * FROM pedidos WHERE estado = 'entregado' no puede, porque esas filas ni siquiera están en el índice. El planificador es lo bastante listo para saber esto solo: nunca usará un índice parcial para una consulta que su condición no garantiza cubrir por completo."
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Confirma con EXPLAIN que una búsqueda por estado = 'pendiente' puede usar el índice parcial idx_pedidos_pendientes.",
  "esquemaSql": "CREATE TABLE pedidos (id serial primary key, estado text, total numeric);\nINSERT INTO pedidos (estado, total)\nSELECT (ARRAY['pendiente','entregado','cancelado'])[1 + (n % 20 = 0)::int + (n % 7 = 0)::int], n\nFROM generate_series(1, 200) AS n;\nCREATE INDEX idx_pedidos_pendientes ON pedidos (id) WHERE estado = 'pendiente';\nSET enable_seqscan = off;",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN SELECT id FROM pedidos WHERE estado = 'pendiente'"
}
```

## Ejercicios

1. Ejecuta el segundo bloque y confirma en el `QUERY PLAN` que aparece `idx_pedidos_pendientes`.
2. ¿Por qué un índice parcial `WHERE estado = 'pendiente'` nunca podría usarse para acelerar `WHERE estado != 'pendiente'`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "65. Built-in Index Access Methods",
      "descripcion": "Documentación oficial de tipos de índice, incluidos los parciales.",
      "url": "https://www.postgresql.org/docs/current/indextypes.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
