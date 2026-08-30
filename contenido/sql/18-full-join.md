# FULL JOIN

- **Módulo:** Joins
- **Slug:** `full-join` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) + [Release 3.39.0](https://sqlite.org/releaselog/3_39_0.html) — ver `contenido/sql/TEMARIO.md` #18

---

## Qué es y para qué sirve

`FULL JOIN` (o `FULL OUTER JOIN`) combina lo que hacen `LEFT` y `RIGHT` a la vez: mantiene todas las filas de **ambas** tablas, tengan o no pareja al otro lado. SQLite lo soporta desde la versión 3.39.0 (2022) — antes había que simularlo combinando dos consultas.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Departamentos sin empleados Y empleados sin departamento asignado",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Marketing');\nINSERT INTO empleados VALUES (1, 'Ana', 1), (2, 'Sara', NULL);",
  "consulta": "SELECT d.nombre AS departamento, e.nombre AS empleado\nFROM departamentos d\nFULL JOIN empleados e ON e.departamento_id = d.id",
  "anotaciones": [
    { "fragmento": "FULL JOIN empleados e ON e.departamento_id = d.id", "nota": "Marketing aparece con empleado NULL (departamento sin gente) Y Sara aparece con departamento NULL (empleada sin asignar) — las dos situaciones \"huérfanas\" a la vez, algo que ni LEFT ni RIGHT solos podrían mostrar juntos." }
  ]
}
```

## Cuándo hace falta de verdad un FULL JOIN

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Auditar datos: encontrar registros sin relación en cualquiera de las dos direcciones.", "texto": "Un caso real y común: \"qué departamentos no tienen empleados\" Y \"qué empleados no tienen departamento asignado\", en una sola consulta." },
    { "titulo": "En la mayoría de consultas de negocio del día a día, LEFT JOIN ya basta.", "texto": "FULL JOIN es menos frecuente que INNER o LEFT — resérvalo para cuando de verdad importan los huérfanos de ambos lados, no como opción por defecto." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar FULL JOIN donde LEFT JOIN ya resolvía el problema.", "texto": "Si solo interesan los departamentos sin empleados (no al revés), LEFT JOIN es más simple de leer y hace exactamente lo que hace falta." },
    { "titulo": "Olvidar que las columnas de AMBAS tablas pueden venir NULL en un FULL JOIN.", "texto": "A diferencia de LEFT JOIN (donde solo la tabla de la derecha puede tener NULL), en FULL JOIN cualquiera de las dos columnas de unión puede estar vacía — d.nombre también puede ser NULL." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre del departamento y del empleado para todas las filas, incluyendo departamentos sin gente y empleados sin departamento (FULL JOIN).",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Marketing');\nINSERT INTO empleados VALUES (1, 'Ana', 1), (2, 'Sara', NULL);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT d.nombre AS departamento, e.nombre AS empleado FROM departamentos d FULL JOIN empleados e ON e.departamento_id = d.id"
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
      "descripcion": "Referencia oficial de SELECT, incluido FULL JOIN.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    },
    {
      "titulo": "SQLite Release 3.39.0",
      "descripcion": "Notas de la versión donde se añadió soporte para RIGHT y FULL OUTER JOIN.",
      "url": "https://sqlite.org/releaselog/3_39_0.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
