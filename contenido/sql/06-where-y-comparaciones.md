# WHERE y los operadores de comparación

- **Módulo:** SELECT y filtrado
- **Slug:** `where-y-comparaciones` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) + [Expression](https://sqlite.org/lang_expr.html) — ver `contenido/sql/TEMARIO.md` #6

---

## Qué es y para qué sirve

`WHERE` filtra filas: de todas las que tiene la tabla, solo pasan las que cumplen la condición. Los operadores de comparación (`=`, `!=`/`<>`, `<`, `>`, `<=`, `>=`) son la base de casi cualquier condición.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Solo los productos con poco stock",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL, categoria TEXT, stock INTEGER);\nINSERT INTO productos VALUES\n  (1, 'Cuaderno', 3.5, 'papeleria', 120),\n  (2, 'Auriculares', 45.0, 'electronica', 8),\n  (3, 'Mochila', 28.9, 'accesorios', 15);",
  "consulta": "SELECT nombre, stock\nFROM productos\nWHERE stock < 20",
  "anotaciones": [
    { "fragmento": "WHERE stock < 20", "nota": "Se evalúa fila por fila: si el stock de esa fila es menor que 20, la fila pasa el filtro; si no, se descarta antes de llegar al resultado." }
  ]
}
```

## Los seis operadores de comparación

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los mismos seis operadores de casi cualquier lenguaje",
  "roles": [
    { "etiqueta": "= y != (o <>)", "rol": "Igualdad y desigualdad", "descripcion": "SQLite acepta tanto != como <> para \"distinto de\" — las dos formas son equivalentes." },
    { "etiqueta": "< y >", "rol": "Menor que y mayor que", "descripcion": "Funcionan tanto con números como con texto (orden alfabético) y con fechas guardadas como texto ISO." },
    { "etiqueta": "<= y >=", "rol": "Menor o igual, mayor o igual", "descripcion": "Incluyen el propio límite — stock <= 10 sí incluye el producto con exactamente 10 unidades." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir = (comparación) con lo que en otros lenguajes es asignación.", "texto": "En SQL, = siempre compara — no existe una asignación de variable dentro de una condición WHERE, a diferencia de C o JavaScript." },
    { "titulo": "Comparar texto con mayúsculas/minúsculas distintas esperando que coincida.", "texto": "'Electronica' y 'electronica' no son iguales para = en SQLite por defecto — hace falta una función como LOWER() de los dos lados si la comparación debe ignorar mayúsculas." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre y el precio de los productos que cuestan 20 o más.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL, categoria TEXT, stock INTEGER);\nINSERT INTO productos VALUES\n  (1, 'Cuaderno', 3.5, 'papeleria', 120),\n  (2, 'Auriculares', 45.0, 'electronica', 8),\n  (3, 'Mochila', 28.9, 'accesorios', 15);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, precio FROM productos WHERE precio >= 20"
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
      "descripcion": "Referencia oficial de expresiones SQL, incluidos los operadores de comparación.",
      "url": "https://sqlite.org/lang_expr.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
