# UPDATE: modificar filas existentes

- **Módulo:** Modificar datos
- **Slug:** `update-modificar-filas` (autogenerado del título)
- **Orden:** 250
- **Fuentes:** [UPDATE](https://sqlite.org/lang_update.html) — ver `contenido/sql/TEMARIO.md` #25

---

## Qué es y para qué sirve

`UPDATE` cambia el valor de una o varias columnas en las filas que cumplan un `WHERE` — y esto es crucial: **sin `WHERE`, actualiza todas las filas de la tabla**, sin excepción.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Marcar una tarea concreta como terminada",
  "esquemaSql": "CREATE TABLE tareas (id INTEGER PRIMARY KEY, titulo TEXT, estado TEXT);\nINSERT INTO tareas VALUES (1, 'Revisar PR', 'pendiente'), (2, 'Escribir tests', 'pendiente');",
  "consulta": "UPDATE tareas\nSET estado = 'hecho'\nWHERE id = 1;\nSELECT * FROM tareas;",
  "anotaciones": [
    { "fragmento": "SET estado = 'hecho'", "nota": "SET indica qué columna cambia y a qué valor nuevo — se pueden cambiar varias separándolas por comas: SET estado = 'hecho', prioridad = 0." },
    { "fragmento": "WHERE id = 1", "nota": "Solo la fila con id = 1 cambia — la tarea 2 (\"Escribir tests\") queda intacta, sigue en \"pendiente\"." }
  ]
}
```

## El error más caro de todo SQL: un UPDATE sin WHERE

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "UPDATE tareas SET estado = 'hecho' — sin WHERE — cambia TODA la tabla",
  "contenido": "Es, probablemente, el error más citado en incidentes reales de bases de datos: olvidar el WHERE convierte un cambio pensado para una fila en un cambio para todas. Antes de ejecutar un UPDATE en una base de datos real, es buena práctica probar primero el mismo WHERE con un SELECT — ver exactamente qué filas se verían afectadas antes de cambiarlas de verdad."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el WHERE (ver el aviso de arriba) — el error real más costoso de esta lección.", "texto": "Siempre merece la pena comprobar antes con un SELECT idéntico en su WHERE qué filas se van a tocar." },
    { "titulo": "Escribir la condición del WHERE sobre el valor YA actualizado, no el original.", "texto": "UPDATE tareas SET prioridad = prioridad + 1 WHERE prioridad = 5 usa el valor ANTES de sumar 1 para decidir qué filas tocar — SQLite no reevalúa el WHERE después del cambio." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Cambia el estado de la tarea con id 2 a \"en_progreso\", y termina con un SELECT * FROM tareas para ver el resultado.",
  "esquemaSql": "CREATE TABLE tareas (id INTEGER PRIMARY KEY, titulo TEXT, estado TEXT);\nINSERT INTO tareas VALUES (1, 'Revisar PR', 'pendiente'), (2, 'Escribir tests', 'pendiente');",
  "consultaInicial": "",
  "consultaSolucion": "UPDATE tareas SET estado = 'en_progreso' WHERE id = 2; SELECT * FROM tareas;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "UPDATE",
      "descripcion": "Referencia oficial completa de la sentencia UPDATE.",
      "url": "https://sqlite.org/lang_update.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
