# LEFT JOIN (y por qué RIGHT JOIN casi no se usa en la práctica)

- **Módulo:** Joins
- **Slug:** `left-join` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #17

---

## Qué es y para qué sirve

`LEFT JOIN` mantiene **todas** las filas de la tabla de la izquierda, tengan o no pareja en la derecha — cuando no la tienen, las columnas de la derecha aparecen como `NULL` en vez de desaparecer la fila entera.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Todos los departamentos, tengan o no empleados",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas'), (3, 'Marketing');\nINSERT INTO empleados VALUES (1, 'Ana', 1), (2, 'Luis', 1), (3, 'Marta', 2);",
  "consulta": "SELECT d.nombre AS departamento, e.nombre AS empleado\nFROM departamentos d\nLEFT JOIN empleados e ON e.departamento_id = d.id",
  "anotaciones": [
    { "fragmento": "FROM departamentos d", "nota": "departamentos es ahora la tabla de la IZQUIERDA — LEFT JOIN garantiza que las tres filas de esta tabla aparecen sí o sí en el resultado." },
    { "fragmento": "LEFT JOIN empleados e ON e.departamento_id = d.id", "nota": "Marketing no tiene ningún empleado — su fila aparece igualmente, con empleado en NULL, en vez de desaparecer como pasaba con INNER JOIN." }
  ]
}
```

## `RIGHT JOIN` existe, pero casi nadie lo usa

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "RIGHT JOIN es un LEFT JOIN con las tablas al revés",
  "contenido": "SQLite soporta RIGHT JOIN desde la versión 3.39.0 (2022) — mantiene todas las filas de la tabla de la DERECHA. En la práctica, casi cualquier RIGHT JOIN se puede reescribir como un LEFT JOIN cambiando el orden de las tablas en el FROM, y esa reescritura es la convención más extendida: la inmensa mayoría de bases de código reales usan solo LEFT JOIN, nunca RIGHT, por pura costumbre de lectura de izquierda a derecha."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Poner una condición sobre la tabla de la derecha en el WHERE en vez de en el ON.", "texto": "WHERE e.nombre = 'Ana' después de un LEFT JOIN elimina las filas con empleado NULL — convierte, sin querer, el LEFT JOIN en un INNER JOIN de facto. Esa condición debería ir en el ON si el objetivo era seguir viendo los departamentos sin empleados." },
    { "titulo": "Olvidar que las columnas de la tabla \"opcional\" pueden venir NULL.", "texto": "Cualquier cálculo sobre una columna de la tabla de la derecha (e.nombre, por ejemplo) puede encontrarse con NULL — hay que contarlo como caso real, no como una excepción rara." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra todos los departamentos con el nombre de sus empleados (o NULL si no tienen ninguno), usando LEFT JOIN.",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas'), (3, 'Marketing');\nINSERT INTO empleados VALUES (1, 'Ana', 1), (2, 'Luis', 1), (3, 'Marta', 2);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT d.nombre AS departamento, e.nombre AS empleado FROM departamentos d LEFT JOIN empleados e ON e.departamento_id = d.id"
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
      "descripcion": "Referencia oficial de SELECT, incluido LEFT JOIN.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
