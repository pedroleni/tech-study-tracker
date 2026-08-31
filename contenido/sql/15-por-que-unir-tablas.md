# Por qué unir tablas: el problema que resuelve un JOIN

- **Módulo:** Joins
- **Slug:** `por-que-unir-tablas` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #15

---

## Qué es y para qué sirve

Los datos suelen vivir separados en varias tablas relacionadas (módulo 1). Un `JOIN` es la operación que las vuelve a juntar en una sola consulta — sin él, `departamento_id` sería solo un número sin nombre legible.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<script>\n// empleados: id, nombre, departamento_id\n// departamentos: id, nombre\nSELECT nombre, departamento_id FROM empleados;\n</script>",
  "opciones": [
    "El nombre del departamento aparece junto al nombre del empleado",
    "Aparece solo un número (departamento_id), no el nombre real del departamento",
    "SQLite falla porque departamento_id no existe en la tabla departamentos"
  ],
  "correcta": 1,
  "explicacion": "Sin un JOIN, la consulta solo ve la tabla empleados — departamento_id es un número que apunta a otra tabla, pero SQL no lo resuelve automáticamente. Hace falta un JOIN explícito con departamentos para traer el nombre real."
}
```

## Las dos tablas antes de unirlas

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "empleados\nid | nombre | departamento_id\n1  | Ana    | 1\n2  | Luis   | 2",
  "despues": "departamentos\nid | nombre\n1  | Ingeniería\n2  | Ventas",
  "nota": "Cada tabla, por separado, cuenta solo la mitad de la historia. Un JOIN las combina usando la columna que las relaciona (departamento_id con id)."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que SQL \"sabe\" automáticamente qué tablas están relacionadas.", "texto": "Una clave foránea (módulo 7) documenta la relación, pero ninguna consulta la sigue por sí sola — cada JOIN necesita indicar explícitamente qué columnas relacionar." },
    { "titulo": "Intentar acceder a una columna de otra tabla sin haberla unido.", "texto": "SELECT nombre_departamento FROM empleados falla si esa columna vive en la tabla departamentos, no en empleados — hace falta el JOIN primero." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "El módulo profundiza en la sintaxis exacta de JOIN a partir de la próxima lección. De momento, explora: ¿cuántos departamentos distintos hay en la tabla departamentos?",
  "esquemaSql": "CREATE TABLE departamentos (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE empleados (id INTEGER PRIMARY KEY, nombre TEXT, departamento_id INTEGER);\nINSERT INTO departamentos VALUES (1, 'Ingeniería'), (2, 'Ventas'), (3, 'Marketing');\nINSERT INTO empleados VALUES (1, 'Ana', 1), (2, 'Luis', 1), (3, 'Marta', 2);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT COUNT(*) FROM departamentos"
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
      "descripcion": "Referencia oficial de SELECT, incluidos los distintos tipos de JOIN.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
