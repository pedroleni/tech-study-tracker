# Table partitioning declarativo: por qué particionar una tabla enorme

- **Módulo:** Particionado de tablas
- **Slug:** `table-partitioning-declarativo-por-que-particionar-una-tabla-enorme` (autogenerado del título)
- **Orden:** 490
- **Fuentes:** [5.12. Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html) — ver `contenido/postgresql/TEMARIO.md` #15

---

## Qué es y para qué sirve

Una tabla de cientos de millones de filas (registros de ventas de varios años, por ejemplo) sigue siendo UNA tabla lógica, pero Postgres puede guardarla físicamente repartida en varias tablas más pequeñas — sus **particiones**. El **table partitioning declarativo** hace esto de forma transparente: se sigue consultando e insertando en la tabla "padre" con SQL normal, y Postgres decide sola en qué partición física va cada fila.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una tabla particionada por fecha: cada fila cae en su partición física real",
  "esquemaSql": "CREATE TABLE ventas (id serial, fecha date not null, importe numeric) PARTITION BY RANGE (fecha);\nCREATE TABLE ventas_2024 PARTITION OF ventas FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');\nCREATE TABLE ventas_2025 PARTITION OF ventas FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');\nINSERT INTO ventas (fecha, importe) VALUES ('2024-06-15', 100), ('2025-03-10', 200);",
  "consulta": "SELECT tableoid::regclass, fecha, importe FROM ventas ORDER BY fecha",
  "anotaciones": [
    { "fragmento": "PARTITION BY RANGE (fecha)", "nota": "ventas es la tabla \"padre\" — no guarda ninguna fila por sí misma, solo declara CÓMO se reparten sus filas: por rangos de la columna fecha." },
    { "fragmento": "CREATE TABLE ventas_2024 PARTITION OF ventas FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');", "nota": "Cada partición es una tabla real de verdad, con su propio nombre — pero se declara como partición de ventas, para el rango de fechas concreto que le corresponde cubrir." },
    { "fragmento": "INSERT INTO ventas (fecha, importe) VALUES", "nota": "El INSERT se hace sobre ventas (el padre), con SQL completamente normal — nadie tiene que decidir a mano en qué partición va cada fila." },
    { "fragmento": "SELECT tableoid::regclass, fecha, importe FROM ventas", "nota": "tableoid es una columna de sistema que identifica la tabla física real que guarda cada fila — aquí demuestra que, aunque se consultó ventas, Postgres repartió las dos filas entre ventas_2024 y ventas_2025 según su fecha." }
  ]
}
```

## El error real cuando ninguna partición cubre el valor

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Solo existe la partición ventas_2024 (hasta el 1 de enero de 2025). Intenta insertar una venta del 2026 y lee el error real.",
  "esquemaSql": "CREATE TABLE ventas (id serial, fecha date not null, importe numeric) PARTITION BY RANGE (fecha);\nCREATE TABLE ventas_2024 PARTITION OF ventas FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');",
  "consultaInicial": "INSERT INTO ventas (fecha, importe) VALUES ('2026-01-01', 50)",
  "consultaSolucion": "INSERT INTO ventas (fecha, importe) VALUES ('2024-06-01', 50) RETURNING id"
}
```

## Por qué merece la pena, más allá de "es más ordenado"

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Borrar datos viejos es instantáneo.", "texto": "DROP TABLE ventas_2020; elimina de golpe todas las ventas de 2020, sin escanear ni bloquear el resto de la tabla — frente a un DELETE FROM ventas WHERE fecha < '2021-01-01', que tendría que revisar fila por fila y generar un vacuum enorme después." },
    { "titulo": "Los índices también se parten.", "texto": "Un índice sobre ventas en realidad son N índices más pequeños, uno por partición — una consulta que solo toca la partición de 2025 usa un índice mucho más pequeño (y más rápido de mantener) que uno que cubriera todas las ventas históricas." },
    { "titulo": "El planificador puede DESCARTAR particiones enteras.", "texto": "Si una consulta filtra por la columna de partición, Postgres puede saber, antes de ejecutar nada, qué particiones no pueden contener ninguna fila relevante — y no las toca en absoluto. Es el tema de la última lección de este módulo." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `tableoid::regclass` muestra un nombre de partición distinto para cada fila.
2. Resuelve el segundo bloque y lee el mensaje de error exacto del primer intento.
3. ¿Qué pasaría si insertas una fila con `fecha` exactamente `'2025-01-01'`? ¿En qué partición cae, según los rangos declarados arriba (`FROM ... TO ...`)?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.12. Table Partitioning",
      "descripcion": "Capítulo oficial completo sobre particionado declarativo: sintaxis, tipos de partición y sus limitaciones.",
      "url": "https://www.postgresql.org/docs/current/ddl-partitioning.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
