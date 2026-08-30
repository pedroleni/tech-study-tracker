# Subconsultas dentro de WHERE

- **Módulo:** Subconsultas y CTEs
- **Slug:** `subconsultas-en-where` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [Expression](https://sqlite.org/lang_expr.html) — ver `contenido/sql/TEMARIO.md` #20

---

## Qué es y para qué sirve

Una subconsulta es un `SELECT` completo dentro de otra consulta — su resultado se usa como si fuera un valor (o una lista de valores) para la consulta exterior. Es una alternativa a un `JOIN` cuando solo hace falta el resultado de la otra tabla, no sus columnas.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Clientes que han hecho al menos un pedido",
  "esquemaSql": "CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);\nINSERT INTO clientes VALUES (1, 'Ana'), (2, 'Luis'), (3, 'Marta');\nINSERT INTO pedidos VALUES (1, 1, 45.0), (2, 1, 20.0), (3, 3, 60.0);",
  "consulta": "SELECT nombre\nFROM clientes\nWHERE id IN (SELECT cliente_id FROM pedidos)",
  "anotaciones": [
    { "fragmento": "(SELECT cliente_id FROM pedidos)", "nota": "Esta subconsulta se ejecuta primero, sola: devuelve la lista de cliente_id que aparecen en pedidos — en este caso, 1 y 3 (Luis, id 2, no ha pedido nada)." },
    { "fragmento": "id IN (...)", "nota": "IN comprueba si id está dentro de la lista que devolvió la subconsulta — Ana (1) y Marta (3) están, Luis (2) no." }
  ]
}
```

## Cuándo usar una subconsulta en vez de un JOIN

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Cuando solo hace falta filtrar, no traer columnas de la otra tabla.", "texto": "Si el objetivo es \"clientes que han pedido algo\" y no interesa ningún dato del pedido en sí, una subconsulta con IN es más simple de leer que un JOIN + DISTINCT." },
    { "titulo": "Cuando la otra tabla podría duplicar filas del resultado con un JOIN normal.", "texto": "Un cliente con 3 pedidos aparecería 3 veces con un JOIN directo a pedidos — la subconsulta con IN evita ese problema porque solo pregunta \"¿está en la lista?\", no trae cada pedido." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir una subconsulta que devuelve más de una columna donde se espera un solo valor.", "texto": "WHERE id = (SELECT cliente_id, total FROM pedidos) es un error real — un = espera un único valor, no una fila con varias columnas." },
    { "titulo": "Usar = en vez de IN cuando la subconsulta puede devolver más de una fila.", "texto": "WHERE id = (SELECT cliente_id FROM pedidos) falla en tiempo de ejecución si la subconsulta devuelve más de un cliente_id — IN está pensado precisamente para listas de varios valores." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre de los clientes que NO han hecho ningún pedido (pista: NOT IN).",
  "esquemaSql": "CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);\nINSERT INTO clientes VALUES (1, 'Ana'), (2, 'Luis'), (3, 'Marta');\nINSERT INTO pedidos VALUES (1, 1, 45.0), (2, 1, 20.0), (3, 3, 60.0);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre FROM clientes WHERE id NOT IN (SELECT cliente_id FROM pedidos)"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Expression",
      "descripcion": "Referencia oficial de expresiones SQL, incluidas las subconsultas.",
      "url": "https://sqlite.org/lang_expr.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
