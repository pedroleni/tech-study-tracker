# Columnas generadas (GENERATED ALWAYS AS ... STORED)

- **Módulo:** DDL avanzado
- **Slug:** `columnas-generadas` (autogenerado del título)
- **Orden:** 160
- **Fuentes:** [5.4. Generated Columns](https://www.postgresql.org/docs/current/ddl-generated-columns.html) — ver `contenido/postgresql/TEMARIO.md` #7

---

## Qué es y para qué sirve

Una **columna generada** calcula su valor automáticamente a partir de otras columnas de la misma fila — nunca se escribe directamente, Postgres la recalcula sola cada vez que cambian las columnas de las que depende. Evita el problema real de mantener una columna calculada "a mano" sincronizada (actualizarla en cada `UPDATE`, arriesgándose a que alguien se olvide en algún punto del código).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un total que Postgres calcula solo, siempre",
  "esquemaSql": "CREATE TABLE lineas_pedido (\n  id serial primary key,\n  cantidad integer,\n  precio_unitario numeric,\n  total numeric GENERATED ALWAYS AS (cantidad * precio_unitario) STORED\n);\nINSERT INTO lineas_pedido (cantidad, precio_unitario) VALUES (3, 15.50), (2, 8.00);",
  "consulta": "SELECT cantidad, precio_unitario, total FROM lineas_pedido ORDER BY id",
  "anotaciones": [
    { "fragmento": "total numeric GENERATED ALWAYS AS (cantidad * precio_unitario) STORED", "nota": "STORED significa que el valor calculado se guarda de verdad en disco (se recalcula en cada escritura) — es la única opción que soporta Postgres hoy (a diferencia de otros motores, que también ofrecen columnas VIRTUAL, calculadas al leer)." },
    { "fragmento": "INSERT INTO lineas_pedido (cantidad, precio_unitario)", "nota": "El INSERT nunca menciona total — no se puede, Postgres rechaza cualquier intento de escribirla directamente, igual que rechaza fijar a mano una columna identity de la lección anterior." }
  ]
}
```

## No se puede escribir directamente — compruébalo

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Intenta insertar una fila fijando tú mismo el valor de total, en vez de dejar que Postgres lo calcule. Lee el error real.",
  "esquemaSql": "CREATE TABLE lineas_pedido (id serial primary key, cantidad integer, precio_unitario numeric, total numeric GENERATED ALWAYS AS (cantidad * precio_unitario) STORED);",
  "consultaInicial": "INSERT INTO lineas_pedido (cantidad, precio_unitario, total) VALUES (3, 15.50, 999)",
  "consultaSolucion": "INSERT INTO lineas_pedido (cantidad, precio_unitario) VALUES (3, 15.50)"
}
```

## Cuándo usarla

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el valor SIEMPRE se deriva de otras columnas de la misma fila",
  "contenido": "Un total (cantidad × precio), un nombre completo (nombre || ' ' || apellidos), un slug derivado de un título — cualquier cálculo que dependa únicamente de columnas de esa misma fila, nunca de otras tablas ni de una consulta agregada, es candidato real a columna generada. Si el cálculo necesitara datos de OTRA tabla, esto ya no serviría — haría falta una vista o un trigger (próximo módulo de este temario)."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `total` = `cantidad × precio_unitario` para cada fila, calculado por Postgres.
2. Ejecuta el segundo bloque tal cual y lee el error real — ¿qué parte del mensaje confirma que el problema es intentar escribir una columna generada?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.4. Generated Columns",
      "descripcion": "Documentación oficial completa de columnas generadas.",
      "url": "https://www.postgresql.org/docs/current/ddl-generated-columns.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
