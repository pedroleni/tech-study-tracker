# Self-join y joins de más de dos tablas

- **Módulo:** Joins
- **Slug:** `self-join-y-joins-multiples` (autogenerado del título)
- **Orden:** 190
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #19

---

## Qué es y para qué sirve

Un **self-join** une una tabla consigo misma — útil cuando una fila hace referencia a otra fila de la misma tabla, como un empleado que tiene un jefe que también es empleado. Un `JOIN` no tiene por qué limitarse a dos tablas: se pueden encadenar tantos como haga falta.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Cada empleado, con el nombre de su jefe (otro empleado)",
  "esquemaSql": "CREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, jefe_id INTEGER);\nINSERT INTO empleados VALUES (1, 'Elena', NULL), (2, 'Ana', 1), (3, 'Luis', 1), (4, 'Marta', 2);",
  "consulta": "SELECT e.nombre AS empleado, j.nombre AS jefe\nFROM empleados e\nLEFT JOIN empleados j ON j.id = e.jefe_id",
  "anotaciones": [
    { "fragmento": "FROM empleados e", "nota": "e representa \"el empleado\" en esta consulta — la misma tabla, con un alias distinto." },
    { "fragmento": "LEFT JOIN empleados j ON j.id = e.jefe_id", "nota": "j representa \"el jefe\" — es la MISMA tabla empleados, unida consigo misma con un alias diferente. LEFT JOIN porque Elena no tiene jefe (jefe_id es NULL) y aun así debe aparecer." }
  ]
}
```

## Encadenar más de un JOIN

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Tres tablas, dos JOIN",
  "contenido": "empleados JOIN departamentos JOIN oficinas no tiene ningún límite especial de dos tablas — cada JOIN adicional simplemente añade otra condición ON, y el motor las va resolviendo en cadena. Es habitual en consultas reales necesitar 3, 4 o más tablas unidas a la vez."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar alias distintos al unir una tabla consigo misma.", "texto": "FROM empleados JOIN empleados ON ... es ambiguo — SQLite no puede distinguir cuál \"empleados\" es cuál sin un alias (e, j, o los que sean) para cada aparición." },
    { "titulo": "Perder de vista qué alias representa qué papel en un self-join.", "texto": "En jefe_id = e.jefe_id frente a j.id = e.jefe_id, confundir cuál lado es \"el empleado\" y cuál \"el jefe\" es el error más común al escribir o leer un self-join." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre de cada empleado que SÍ tiene jefe, junto al nombre de ese jefe.",
  "esquemaSql": "CREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, jefe_id INTEGER);\nINSERT INTO empleados VALUES (1, 'Elena', NULL), (2, 'Ana', 1), (3, 'Luis', 1), (4, 'Marta', 2);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT e.nombre AS empleado, j.nombre AS jefe FROM empleados e INNER JOIN empleados j ON j.id = e.jefe_id"
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
      "descripcion": "Referencia oficial de SELECT, incluidos los alias de tabla.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
