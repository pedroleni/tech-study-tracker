# INSERT: añadir filas

- **Módulo:** Modificar datos
- **Slug:** `insert-anadir-filas` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [INSERT](https://sqlite.org/lang_insert.html) — ver `contenido/sql/TEMARIO.md` #24

---

## Qué es y para qué sirve

`INSERT` añade filas nuevas a una tabla. Se puede indicar explícitamente en qué columnas se insertan los valores (recomendable) o confiar en el orden exacto de la tabla (frágil).

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Insertar con columnas explícitas frente a por posición",
  "esquemaSql": "CREATE TABLE tareas (id INTEGER PRIMARY KEY, titulo TEXT, estado TEXT, prioridad INTEGER);",
  "consulta": "INSERT INTO tareas (titulo, estado, prioridad)\nVALUES ('Revisar PR', 'pendiente', 2)",
  "anotaciones": [
    { "fragmento": "INSERT INTO tareas (titulo, estado, prioridad)", "nota": "Nombrar las columnas explícitamente hace la instrucción resistente a cambios futuros en la tabla — si se añade una columna nueva en medio, esta consulta sigue funcionando igual." },
    { "fragmento": "VALUES ('Revisar PR', 'pendiente', 2)", "nota": "id no se especifica: al ser PRIMARY KEY sobre una columna INTEGER, SQLite le asigna automáticamente el siguiente valor disponible." }
  ]
}
```

## Insertar varias filas de una vez

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Una sola sentencia, varias filas",
  "contenido": "INSERT INTO tareas (titulo, estado, prioridad) VALUES ('A', 'pendiente', 1), ('B', 'en_progreso', 3), ('C', 'hecho', 2) inserta tres filas en una única sentencia — más eficiente que tres INSERT separados, y es exactamente el patrón que ya se ha usado en el esquemaSql de todas las lecciones anteriores de este curso."
}
```

## Comprobar el resultado con un SELECT justo después

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "INSERT no devuelve filas por sí solo",
  "contenido": "A diferencia de SELECT, un INSERT no produce ningún resultado visible — modifica la tabla, pero no \"devuelve\" nada para mostrar. Por eso, tanto en este curso como en la práctica real, es habitual encadenar el INSERT con un SELECT justo después (separados por ;) para comprobar de un vistazo que la fila quedó como se esperaba."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Insertar por posición sin nombrar las columnas.", "texto": "INSERT INTO tareas VALUES (...) exige los valores EN EL ORDEN EXACTO en que se declararon las columnas de la tabla — un cambio futuro en ese orden rompe cualquier INSERT que confiara en la posición." },
    { "titulo": "Olvidar comillas simples en un valor de texto.", "texto": "VALUES (pendiente) sin comillas se interpreta como un nombre de columna o identificador, no como el texto 'pendiente' — un error real y fácil de cometer viniendo de otros lenguajes." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Inserta una tarea nueva (título \"Escribir tests\", estado \"pendiente\", prioridad 1) y termina con un SELECT * FROM tareas para que el resultado muestre la fila insertada.",
  "esquemaSql": "CREATE TABLE tareas (id INTEGER PRIMARY KEY, titulo TEXT, estado TEXT, prioridad INTEGER);",
  "consultaInicial": "",
  "consultaSolucion": "INSERT INTO tareas (titulo, estado, prioridad) VALUES ('Escribir tests', 'pendiente', 1); SELECT * FROM tareas;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "INSERT",
      "descripcion": "Referencia oficial completa de la sentencia INSERT.",
      "url": "https://sqlite.org/lang_insert.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
