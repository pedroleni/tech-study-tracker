# Subconsultas correlacionadas

- **Módulo:** Subconsultas y CTEs
- **Slug:** `subconsultas-correlacionadas` (autogenerado del título)
- **Orden:** 210
- **Fuentes:** [Expression](https://sqlite.org/lang_expr.html) — ver `contenido/sql/TEMARIO.md` #21

---

## Qué es y para qué sirve

Una subconsulta **correlacionada** hace referencia a una columna de la consulta exterior — no se ejecuta una sola vez, sino **una vez por cada fila** de la consulta exterior, con un valor distinto cada vez.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Cada cliente, con el total de SU pedido más caro",
  "esquemaSql": "CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);\nINSERT INTO clientes VALUES (1, 'Ana'), (2, 'Luis');\nINSERT INTO pedidos VALUES (1, 1, 45.0), (2, 1, 20.0), (3, 2, 60.0), (4, 2, 15.0);",
  "consulta": "SELECT c.nombre,\n  (SELECT MAX(p.total) FROM pedidos p WHERE p.cliente_id = c.id) AS pedido_mas_caro\nFROM clientes c",
  "anotaciones": [
    { "fragmento": "WHERE p.cliente_id = c.id", "nota": "c.id viene de la consulta EXTERIOR (clientes) — por cada cliente distinto, la subconsulta se vuelve a ejecutar con un c.id diferente." },
    { "fragmento": "(SELECT MAX(p.total) FROM pedidos p WHERE p.cliente_id = c.id)", "nota": "Para Ana (id 1), calcula MAX entre sus pedidos (45.0, 20.0) = 45.0. Para Luis (id 2), MAX entre los suyos (60.0, 15.0) = 60.0 — un cálculo distinto por cada fila exterior." }
  ]
}
```

## Correlacionada frente a independiente: la diferencia real

```laboratorio
{
  "tipo": "roles",
  "titulo": "Se distinguen por si miran \"hacia fuera\" o no",
  "roles": [
    { "etiqueta": "Independiente", "rol": "Se ejecuta una sola vez, sin depender de la fila exterior", "descripcion": "(SELECT cliente_id FROM pedidos) de la lección anterior no depende de nada de fuera." },
    { "etiqueta": "Correlacionada", "rol": "Se ejecuta una vez por cada fila exterior", "descripcion": "Referencia una columna de la tabla exterior (c.id) dentro de su propio WHERE — por eso el resultado cambia según la fila." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "No darse cuenta de que una subconsulta correlacionada se repite por cada fila.", "texto": "En una tabla con muchas filas, esto puede ser bastante más lento que un JOIN + GROUP BY equivalente — es una herramienta cómoda de leer, no siempre la más rápida." },
    { "titulo": "Olvidar el alias de la tabla exterior dentro de la subconsulta.", "texto": "Sin c.id (con el alias explícito), SQLite podría interpretar id como una referencia a la propia tabla de la subconsulta, no a la exterior — ambigüedad real, no solo de estilo." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra cada cliente junto al número total de pedidos que ha hecho (usa una subconsulta correlacionada con COUNT).",
  "esquemaSql": "CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);\nINSERT INTO clientes VALUES (1, 'Ana'), (2, 'Luis');\nINSERT INTO pedidos VALUES (1, 1, 45.0), (2, 1, 20.0), (3, 2, 60.0), (4, 2, 15.0);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT c.nombre, (SELECT COUNT(*) FROM pedidos p WHERE p.cliente_id = c.id) AS num_pedidos FROM clientes c"
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
