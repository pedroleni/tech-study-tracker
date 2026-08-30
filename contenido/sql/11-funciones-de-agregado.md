# Funciones de agregado: COUNT, SUM, AVG, MIN, MAX

- **Módulo:** Agregación
- **Slug:** `funciones-de-agregado` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [Aggregate Functions](https://sqlite.org/lang_aggfunc.html) — ver `contenido/sql/TEMARIO.md` #11

---

## Qué es y para qué sirve

Una función de agregado toma muchas filas y las reduce a **un solo valor**: cuántas hay, cuánto suman, cuál es la media... En vez de devolver filas, devuelve un resumen.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Cinco preguntas, cinco funciones de agregado",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, cantidad INTEGER, precio_unitario REAL);\nINSERT INTO ventas VALUES\n  (1, 'Cuaderno', 10, 3.5), (2, 'Auriculares', 2, 45.0), (3, 'Mochila', 1, 28.9), (4, 'Cuaderno', 5, 3.5);",
  "consulta": "SELECT\n  COUNT(*) AS num_ventas,\n  SUM(cantidad) AS unidades_totales,\n  AVG(precio_unitario) AS precio_medio,\n  MIN(precio_unitario) AS mas_barato,\n  MAX(precio_unitario) AS mas_caro\nFROM ventas",
  "anotaciones": [
    { "fragmento": "COUNT(*)", "nota": "Cuenta filas, sin mirar el contenido de ninguna columna — 4 filas en la tabla, 4 ventas registradas." },
    { "fragmento": "SUM(cantidad)", "nota": "Suma la columna cantidad de todas las filas: 10 + 2 + 1 + 5 = 18 unidades vendidas en total." },
    { "fragmento": "AVG(precio_unitario)", "nota": "La media de precio_unitario entre las 4 filas — no pondera por cantidad vendida, solo promedia los precios tal cual aparecen." }
  ]
}
```

## Las cinco funciones más usadas

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cada una responde una pregunta distinta",
  "roles": [
    { "etiqueta": "COUNT", "rol": "¿Cuántas filas hay?", "descripcion": "COUNT(*) cuenta filas; COUNT(columna) cuenta solo las filas donde esa columna NO es NULL." },
    { "etiqueta": "SUM / AVG", "rol": "¿Cuánto suman? ¿Cuál es la media?", "descripcion": "Solo tienen sentido sobre columnas numéricas." },
    { "etiqueta": "MIN / MAX", "rol": "¿Cuál es el más pequeño? ¿Y el más grande?", "descripcion": "Funcionan con números, pero también con texto (orden alfabético) y fechas en formato ISO." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir COUNT(*) con COUNT(columna).", "texto": "COUNT(*) cuenta todas las filas; COUNT(columna) ignora las filas donde esa columna concreta es NULL — pueden dar números distintos sobre la misma tabla." },
    { "titulo": "Mezclar una función de agregado con una columna normal sin GROUP BY (se ve en la próxima lección).", "texto": "SELECT producto, COUNT(*) FROM ventas sin GROUP BY no tiene un significado claro: ¿de cuál producto sería ese conteo? SQLite deja pasar la consulta, pero el resultado no es el que se busca." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra cuántas ventas hay en total (num_ventas) y la suma total de cantidad vendida (unidades_totales).",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, cantidad INTEGER, precio_unitario REAL);\nINSERT INTO ventas VALUES\n  (1, 'Cuaderno', 10, 3.5), (2, 'Auriculares', 2, 45.0), (3, 'Mochila', 1, 28.9), (4, 'Cuaderno', 5, 3.5);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT COUNT(*) AS num_ventas, SUM(cantidad) AS unidades_totales FROM ventas"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Aggregate Functions",
      "descripcion": "Referencia oficial de las funciones de agregado de SQLite.",
      "url": "https://sqlite.org/lang_aggfunc.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
