# DELETE: borrar filas

- **Módulo:** Modificar datos
- **Slug:** `delete-borrar-filas` (autogenerado del título)
- **Orden:** 260
- **Fuentes:** [DELETE](https://sqlite.org/lang_delete.html) — ver `contenido/sql/TEMARIO.md` #26

---

## Qué es y para qué sirve

`DELETE` borra filas completas de una tabla. Igual que `UPDATE`, su `WHERE` decide qué filas se ven afectadas — y, igual que `UPDATE`, sin `WHERE` afecta a todas.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Borrar solo las tareas ya terminadas",
  "esquemaSql": "CREATE TABLE tareas (id INTEGER PRIMARY KEY, titulo TEXT, estado TEXT);\nINSERT INTO tareas VALUES (1, 'Revisar PR', 'hecho'), (2, 'Escribir tests', 'pendiente'), (3, 'Desplegar', 'hecho');",
  "consulta": "DELETE FROM tareas\nWHERE estado = 'hecho';\nSELECT * FROM tareas;",
  "anotaciones": [
    { "fragmento": "DELETE FROM tareas", "nota": "A diferencia de otras sentencias, DELETE siempre borra la FILA completa — no se puede borrar \"solo una columna\" con DELETE (para eso existe UPDATE poniendo esa columna a NULL)." },
    { "fragmento": "WHERE estado = 'hecho'", "nota": "Solo las filas 1 y 3 cumplen la condición y se borran — la fila 2 (\"pendiente\") sobrevive." }
  ]
}
```

## `DELETE FROM tabla` sin WHERE frente a `DROP TABLE`

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas muy distintas de \"vaciar\" o \"quitar\" algo",
  "roles": [
    { "etiqueta": "DELETE FROM tareas", "rol": "Borra todas las filas, la tabla sigue existiendo", "descripcion": "Sin WHERE, deja la tabla vacía (0 filas) pero con su estructura intacta — se puede seguir insertando en ella." },
    { "etiqueta": "DROP TABLE tareas", "rol": "Elimina la tabla entera, estructura incluida", "descripcion": "Después de un DROP TABLE, ni siquiera existe la tabla — hace falta un CREATE TABLE nuevo para volver a usarla." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el WHERE en un DELETE — el mismo error real que en UPDATE, aún más definitivo.", "texto": "Un UPDATE sin WHERE cambia datos que en teoría se podrían corregir después; un DELETE sin WHERE los borra, y sin una copia de seguridad, no hay vuelta atrás." },
    { "titulo": "Confundir DELETE FROM tabla (vacía la tabla) con DROP TABLE (la elimina).", "texto": "Son operaciones muy distintas en severidad — DROP TABLE también borra la propia definición de columnas, índices y restricciones asociadas." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Borra la tarea con id 1, y termina con un SELECT * FROM tareas para comprobar qué queda.",
  "esquemaSql": "CREATE TABLE tareas (id INTEGER PRIMARY KEY, titulo TEXT, estado TEXT);\nINSERT INTO tareas VALUES (1, 'Revisar PR', 'hecho'), (2, 'Escribir tests', 'pendiente');",
  "consultaInicial": "",
  "consultaSolucion": "DELETE FROM tareas WHERE id = 1; SELECT * FROM tareas;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "DELETE",
      "descripcion": "Referencia oficial completa de la sentencia DELETE.",
      "url": "https://sqlite.org/lang_delete.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
