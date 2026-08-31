# CTEs con WITH: nombrar una subconsulta

- **Módulo:** Subconsultas y CTEs
- **Slug:** `ctes-con-with` (autogenerado del título)
- **Orden:** 220
- **Fuentes:** [WITH clause](https://sqlite.org/lang_with.html) — ver `contenido/sql/TEMARIO.md` #22

---

## Qué es y para qué sirve

Una CTE (*Common Table Expression*, `WITH`) le da un nombre a una subconsulta antes de usarla — se puede referenciar por ese nombre como si fuera una tabla más, y si hace falta usarla dos veces, no hay que repetir la subconsulta entera.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Pedidos grandes, con nombre propio",
  "esquemaSql": "CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE pedidos (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);\nINSERT INTO clientes VALUES (1, 'Ana'), (2, 'Luis');\nINSERT INTO pedidos VALUES (1, 1, 45.0), (2, 1, 20.0), (3, 2, 60.0);",
  "consulta": "WITH pedidos_grandes AS (\n  SELECT * FROM pedidos WHERE total > 30\n)\nSELECT c.nombre, pg.total\nFROM pedidos_grandes pg\nJOIN clientes c ON c.id = pg.cliente_id",
  "anotaciones": [
    { "fragmento": "WITH pedidos_grandes AS (\n  SELECT * FROM pedidos WHERE total > 30\n)", "nota": "Define pedidos_grandes como un nombre para esta subconsulta — se calcula una vez, y a partir de aquí se puede usar como si fuera una tabla real." },
    { "fragmento": "FROM pedidos_grandes pg", "nota": "pedidos_grandes se usa exactamente igual que una tabla normal en el resto de la consulta — sin repetir el WHERE total > 30 otra vez." }
  ]
}
```

## Por qué una CTE suele ser más legible que una subconsulta anidada

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "SELECT c.nombre, sub.total\nFROM (SELECT * FROM pedidos WHERE total > 30) sub\nJOIN clientes c ON c.id = sub.cliente_id",
  "despues": "WITH pedidos_grandes AS (\n  SELECT * FROM pedidos WHERE total > 30\n)\nSELECT c.nombre, pg.total\nFROM pedidos_grandes pg\nJOIN clientes c ON c.id = pg.cliente_id",
  "nota": "Mismo resultado exacto — pero pedidos_grandes explica QUÉ es esa subconsulta antes de usarla, en vez de dejarla anónima dentro del FROM."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que una CTE se guarda o se indexa como una tabla real.", "texto": "Una CTE normal se recalcula cada vez que se usa dentro de la misma consulta — no es una tabla temporal persistente, solo un nombre para una subconsulta." },
    { "titulo": "Olvidar la coma al encadenar varias CTEs en el mismo WITH.", "texto": "WITH a AS (...), b AS (...) SELECT ... — varias CTEs se separan por comas, un solo WITH al principio, no uno por cada una." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Usa una CTE llamada clientes_activos que seleccione los clientes con id 1 o 2, y luego selecciona su nombre desde esa CTE.",
  "esquemaSql": "CREATE TABLE clientes (id INTEGER PRIMARY KEY, nombre TEXT);\nINSERT INTO clientes VALUES (1, 'Ana'), (2, 'Luis'), (3, 'Marta');",
  "consultaInicial": "",
  "consultaSolucion": "WITH clientes_activos AS (SELECT * FROM clientes WHERE id IN (1, 2)) SELECT nombre FROM clientes_activos"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "WITH clause",
      "descripcion": "Referencia oficial de la cláusula WITH (CTEs).",
      "url": "https://sqlite.org/lang_with.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
