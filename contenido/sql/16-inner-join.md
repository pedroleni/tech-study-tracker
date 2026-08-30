# INNER JOIN

- **Módulo:** Joins
- **Slug:** `inner-join` (autogenerado del título)
- **Orden:** 160
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #16

---

## Qué es y para qué sirve

`INNER JOIN` combina filas de dos tablas cuando la condición de unión se cumple — y **descarta** las filas que no tienen pareja al otro lado. Es el JOIN por defecto: si se escribe solo `JOIN`, sin más, SQLite lo trata como `INNER JOIN`.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Empleado y nombre real de su departamento",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas'), (3, 'Marketing');\nINSERT INTO empleados VALUES (1, 'Ana', 1), (2, 'Luis', 1), (3, 'Marta', 2);",
  "consulta": "SELECT e.nombre, d.nombre AS departamento\nFROM empleados e\nINNER JOIN departamentos d ON d.id = e.departamento_id",
  "anotaciones": [
    { "fragmento": "INNER JOIN departamentos d ON d.id = e.departamento_id", "nota": "ON indica la condición de unión: la fila de empleados se junta con la de departamentos donde d.id coincide con e.departamento_id." },
    { "fragmento": "e.nombre, d.nombre AS departamento", "nota": "e y d son alias de tabla — necesarios aquí porque las dos tablas tienen una columna llamada nombre, y hay que dejar claro de cuál se habla." }
  ]
}
```

## Por qué "Marketing" no aparece en el resultado

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "INNER JOIN descarta lo que no tiene pareja",
  "contenido": "El departamento 'Marketing' (id 3) no tiene ningún empleado asignado en la tabla empleados — con INNER JOIN, simplemente desaparece del resultado, porque no hay ninguna fila de empleados con la que emparejarlo. Si hiciera falta ver TODOS los departamentos, tengan o no empleados, la herramienta correcta es LEFT JOIN (siguiente lección)."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el ON y escribir un JOIN sin condición de unión.", "texto": "Sin ON, SQLite no sabe qué filas emparejar con cuáles — el resultado real (un producto cartesiano) combina cada fila de una tabla con TODAS las de la otra, casi nunca lo que se buscaba." },
    { "titulo": "Confundir por qué falta una fila esperada: puede ser el WHERE, no el JOIN.", "texto": "Si una fila desaparece del resultado, comprobar primero si el JOIN la descartó (por no tener pareja) o si un WHERE posterior la filtró después de unirla." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre de cada empleado junto al nombre de su departamento, usando INNER JOIN.",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas'), (3, 'Marketing');\nINSERT INTO empleados VALUES (1, 'Ana', 1), (2, 'Luis', 1), (3, 'Marta', 2);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT e.nombre, d.nombre AS departamento FROM empleados e INNER JOIN departamentos d ON d.id = e.departamento_id"
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
      "descripcion": "Referencia oficial de SELECT, incluido INNER JOIN.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
