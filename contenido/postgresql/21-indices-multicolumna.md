# Índices multicolumna: por qué el orden de las columnas importa

- **Módulo:** Índices más allá de B-tree
- **Slug:** `indices-multicolumna` (autogenerado del título)
- **Orden:** 210
- **Fuentes:** [11. Indexes](https://www.postgresql.org/docs/current/indexes.html) — ver `contenido/postgresql/TEMARIO.md` #8

---

## Qué es y para qué sirve

Un índice puede cubrir varias columnas a la vez — pero, a diferencia de indexar cada columna por separado, el ORDEN en el que se declaran importa de verdad. Un índice B-tree multicolumna funciona como una guía telefónica ordenada primero por apellido, luego por nombre: buscar por apellido (la primera columna) es rápido; buscar solo por nombre (la segunda, sin el apellido) no aprovecha el orden del índice en absoluto.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un índice por (departamento, salario) — el orden es la clave",
  "esquemaSql": "CREATE TABLE empleados (id serial primary key, departamento text, salario numeric);\nINSERT INTO empleados (departamento, salario)\nSELECT (ARRAY['ventas','ingenieria','soporte'])[1 + (n % 3)], 30000 + (n % 50) * 500\nFROM generate_series(1, 300) AS n;\nCREATE INDEX idx_empleados_depto_salario ON empleados (departamento, salario);\nSET enable_seqscan = off;",
  "consulta": "EXPLAIN SELECT * FROM empleados WHERE departamento = 'ingenieria' AND salario > 40000",
  "anotaciones": [
    { "fragmento": "CREATE INDEX idx_empleados_depto_salario ON empleados (departamento, salario);", "nota": "Ordenado primero por departamento, y DENTRO de cada departamento, por salario — el índice agrupa las filas exactamente en ese orden anidado." },
    { "fragmento": "WHERE departamento = 'ingenieria' AND salario > 40000", "nota": "Esta condición usa las dos columnas EN EL MISMO ORDEN que el índice — primero fija departamento (igualdad), luego acota salario (rango) dentro de ese grupo. Es el caso ideal para este índice." }
  ]
}
```

## Buscar solo por la segunda columna no aprovecha el índice igual

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "(departamento, salario) no ayuda igual a WHERE salario > 40000 a secas",
  "contenido": "Sin fijar departamento, el índice no sabe por dónde \"entrar\" — los salarios de ingeniería, ventas y soporte están intercalados dentro del índice, agrupados cada uno bajo su propio departamento, no en un único bloque ordenado por salario global. Postgres SÍ puede seguir usando el índice para esto (escaneándolo entero), pero pierde gran parte de la ventaja frente a un índice que empezara por salario."
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Confirma con EXPLAIN si una búsqueda que SOLO filtra por salario (sin mencionar departamento) sigue usando el índice (departamento, salario), y compara el coste con el bloque de arriba.",
  "esquemaSql": "CREATE TABLE empleados (id serial primary key, departamento text, salario numeric);\nINSERT INTO empleados (departamento, salario)\nSELECT (ARRAY['ventas','ingenieria','soporte'])[1 + (n % 3)], 30000 + (n % 50) * 500\nFROM generate_series(1, 300) AS n;\nCREATE INDEX idx_empleados_depto_salario ON empleados (departamento, salario);\nSET enable_seqscan = off;",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN SELECT * FROM empleados WHERE salario > 40000"
}
```

## Ejercicios

1. Ejecuta los dos bloques y compara el `cost` estimado de cada plan — ¿cuál es más barato, filtrar por las dos columnas en orden, o solo por la segunda?
2. Si la mayoría de tus consultas reales filtran SOLO por `salario` (nunca por `departamento`), ¿qué cambiarías en la definición del índice?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "11. Indexes",
      "descripcion": "Documentación oficial completa de índices, incluidos los multicolumna.",
      "url": "https://www.postgresql.org/docs/current/indexes.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
