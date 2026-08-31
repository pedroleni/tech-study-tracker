# GROUP BY: agrupar antes de agregar

- **Módulo:** Agregación
- **Slug:** `group-by-agrupar` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #12

---

## Qué es y para qué sirve

`GROUP BY` reparte las filas en grupos según el valor de una o varias columnas, y cada función de agregado se calcula **dentro de cada grupo por separado**, no sobre la tabla entera.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Total vendido por producto, no en general",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, cantidad INTEGER);\nINSERT INTO ventas VALUES\n  (1, 'Cuaderno', 10), (2, 'Auriculares', 2), (3, 'Cuaderno', 5), (4, 'Mochila', 1), (5, 'Auriculares', 3);",
  "consulta": "SELECT producto, SUM(cantidad) AS total\nFROM ventas\nGROUP BY producto",
  "anotaciones": [
    { "fragmento": "GROUP BY producto", "nota": "Reparte las 5 filas en 3 grupos (uno por cada producto distinto) — Cuaderno junta sus dos filas, Auriculares las suyas, Mochila la única que tiene." },
    { "fragmento": "SUM(cantidad)", "nota": "Se calcula UNA VEZ POR GRUPO, no sobre las 5 filas juntas — el resultado tiene tantas filas como grupos distintos haya." }
  ]
}
```

## Por qué toda columna sin agregar tiene que estar en el GROUP BY

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "SELECT producto, cantidad, SUM(cantidad) ... GROUP BY producto no tiene sentido",
  "contenido": "Si un grupo (por ejemplo, 'Cuaderno') junta varias filas con cantidades distintas (10 y 5), ¿qué valor de cantidad debería mostrar esa única fila del resultado? No hay una respuesta correcta — por eso toda columna que no sea una función de agregado tiene que aparecer también en el GROUP BY, o la consulta no tiene un significado bien definido."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Poner una columna en el SELECT que no está ni agregada ni en el GROUP BY.", "texto": "El resultado sería ambiguo — SQLite puede permitirlo en algunos casos (a diferencia de Postgres, más estricto), pero el valor que devuelve no está garantizado ni es fiable." },
    { "titulo": "Confundir WHERE con lo que hace HAVING (siguiente lección).", "texto": "WHERE filtra FILAS antes de agrupar; para filtrar GRUPOS después de agregarlos hace falta HAVING, no WHERE." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra cuántas ventas (COUNT) tiene cada producto distinto.",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, cantidad INTEGER);\nINSERT INTO ventas VALUES\n  (1, 'Cuaderno', 10), (2, 'Auriculares', 2), (3, 'Cuaderno', 5), (4, 'Mochila', 1), (5, 'Auriculares', 3);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT producto, COUNT(*) AS num_ventas FROM ventas GROUP BY producto"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SELECT",
      "descripcion": "Referencia oficial de SELECT, incluido GROUP BY.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
