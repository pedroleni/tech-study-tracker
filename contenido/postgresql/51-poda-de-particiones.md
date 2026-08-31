# Poda de particiones (partition pruning) en el plan de consulta

- **Módulo:** Particionado de tablas
- **Slug:** `poda-de-particiones-partition-pruning-en-el-plan-de-consulta` (autogenerado del título)
- **Orden:** 510
- **Fuentes:** [5.12. Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html) — ver `contenido/postgresql/TEMARIO.md` #15

---

## Qué es y para qué sirve

Ya viste que Postgres reparte las filas entre particiones automáticamente. La otra mitad del beneficio ocurre al **consultar**: si una consulta filtra por la columna de partición, el planificador puede saber — antes de ejecutar nada — qué particiones NO pueden contener ninguna fila relevante, y las descarta del plan por completo. Eso es la **poda de particiones** (`partition pruning`), y se ve directamente en el `EXPLAIN`, como ya sabes leerlo del módulo 7.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Sin filtrar por la columna de partición: el plan escanea las DOS particiones",
  "esquemaSql": "CREATE TABLE ventas (id serial, fecha date not null, importe numeric) PARTITION BY RANGE (fecha);\nCREATE TABLE ventas_2024 PARTITION OF ventas FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');\nCREATE TABLE ventas_2025 PARTITION OF ventas FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');\nINSERT INTO ventas (fecha, importe) SELECT '2024-01-01'::date + (n || ' days')::interval, n FROM generate_series(1,200) n;\nINSERT INTO ventas (fecha, importe) SELECT '2025-01-01'::date + (n || ' days')::interval, n FROM generate_series(1,200) n;\nANALYZE ventas;",
  "consulta": "EXPLAIN SELECT * FROM ventas WHERE importe > 199",
  "anotaciones": [
    { "fragmento": "Append", "nota": "Append combina los resultados de varios nodos hijos en uno — aquí, uno por cada partición que el planificador decidió que SÍ podía tener filas relevantes." },
    { "fragmento": "Seq Scan on ventas_2024 ventas_1", "nota": "El filtro (importe > 199) no menciona fecha, la columna de partición — el planificador no tiene forma de descartar ninguna partición de antemano, así que escanea las dos." },
    { "fragmento": "Seq Scan on ventas_2025 ventas_2", "nota": "La segunda partición, escaneada por el mismo motivo — nótese el _1/_2 al final del alias: son la misma consulta lógica, aplicada dos veces, una por partición física real." }
  ]
}
```

## Compruébalo: filtrar por la columna de partición elimina el Append entero

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Ahora filtra por fecha (la columna de partición) en vez de por importe. Ejecuta el EXPLAIN y compáralo con el bloque de arriba: ¿cuántas particiones aparecen en el plan?",
  "esquemaSql": "CREATE TABLE ventas (id serial, fecha date not null, importe numeric) PARTITION BY RANGE (fecha);\nCREATE TABLE ventas_2024 PARTITION OF ventas FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');\nCREATE TABLE ventas_2025 PARTITION OF ventas FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');\nINSERT INTO ventas (fecha, importe) SELECT '2024-01-01'::date + (n || ' days')::interval, n FROM generate_series(1,200) n;\nINSERT INTO ventas (fecha, importe) SELECT '2025-01-01'::date + (n || ' days')::interval, n FROM generate_series(1,200) n;\nANALYZE ventas;",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN SELECT * FROM ventas WHERE fecha >= '2025-01-01'"
}
```

## Por qué importa de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La poda ocurre en la PLANIFICACIÓN, no filtrando en la ejecución",
  "contenido": "La diferencia no es solo cosmética: en el bloque de arriba, ventas_2024 ni siquiera aparece en el plan — no es que se escanee y se descarte, es que el planificador ya sabe, por los rangos declarados en cada partición, que ninguna fila con fecha >= '2025-01-01' puede estar ahí. En una tabla con 50 particiones (por ejemplo, un histórico mensual de varios años), una consulta que filtra por el mes actual solo toca UNA partición, no 50 — la diferencia de coste real es enorme, y crece con cada partición que se añade."
}
```

## Ejercicios

1. Ejecuta el primer bloque y cuenta cuántos nodos `Seq Scan` aparecen — uno por partición tocada.
2. Resuelve el segundo bloque y confirma que solo aparece `ventas_2025` — ni `Append` ni `ventas_2024` en el plan.
3. Si la consulta filtrara con `WHERE fecha >= '2024-06-01' AND fecha < '2025-06-01'` (un rango que cruza las dos particiones), ¿cuántas particiones esperarías ver en el plan? ¿Por qué la poda no puede descartar ninguna en ese caso?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.12. Table Partitioning",
      "descripcion": "Capítulo oficial de particionado, incluida la sección 5.12.5 sobre Partition Pruning y en qué condiciones se activa.",
      "url": "https://www.postgresql.org/docs/current/ddl-partitioning.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
