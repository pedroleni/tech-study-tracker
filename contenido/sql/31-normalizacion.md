# Normalización: 1FN, 2FN, 3FN

- **Módulo:** Diseño de esquema
- **Slug:** `normalizacion` (autogenerado del título)
- **Orden:** 310
- **Fuentes:** [SQL As Understood By SQLite](https://sqlite.org/lang.html) — ver `contenido/sql/TEMARIO.md` #31

---

## Qué es y para qué sirve

La normalización es un conjunto de reglas progresivas para diseñar tablas que evitan la repetición de datos (módulo 1, lección 4). Se organizan en "formas normales" — 1FN, 2FN, 3FN — cada una más estricta que la anterior.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres reglas, cada una construida sobre la anterior",
  "roles": [
    { "etiqueta": "1FN (Primera Forma Normal)", "rol": "Cada celda tiene un solo valor atómico", "descripcion": "Una columna \"telefonos\" con \"555-1234, 555-5678\" dentro de una sola celda viola la 1FN — debería ser una tabla aparte, un teléfono por fila." },
    { "etiqueta": "2FN (Segunda Forma Normal)", "rol": "Cada columna depende de la CLAVE COMPLETA, no de una parte", "descripcion": "Solo aplica con claves compuestas (dos o más columnas) — si una columna solo depende de una de las dos, pertenece a otra tabla." },
    { "etiqueta": "3FN (Tercera Forma Normal)", "rol": "Ninguna columna depende de otra columna que no sea la clave", "descripcion": "Si el código_postal determina la ciudad, y la ciudad vive en la misma tabla que el código_postal, esa relación transitiva pertenece a una tabla aparte." }
  ]
}
```

## Un ejemplo real de violación de la 1FN

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "autores\nid | nombre | telefonos\n1  | Ana    | 555-1234, 555-5678",
  "despues": "autores              telefonos_autor\nid | nombre          autor_id | numero\n1  | Ana             1        | 555-1234\n                              1        | 555-5678",
  "nota": "Con dos teléfonos en una sola celda, no se puede buscar \"quién tiene el 555-5678\" con una condición simple — una tabla separada, una fila por teléfono, sí lo permite."
}
```

## Por qué a veces se desnormaliza a propósito

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "La normalización completa no siempre es la opción más rápida de leer.", "texto": "Un sistema con muchas lecturas y pocas escrituras a veces desnormaliza a propósito (repite algún dato) para evitar JOINs costosos — es una decisión consciente, no un error, cuando se toma con datos reales de rendimiento delante." },
    { "titulo": "Confundir \"normalizar\" con \"tener muchas tablas\" sin más.", "texto": "El objetivo no es maximizar el número de tablas — es eliminar dependencias que causan inconsistencias reales al actualizar. Dividir en exceso, sin una dependencia real que lo justifique, no aporta nada." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Con las tablas ya normalizadas (autores y telefonos_autor), muestra el nombre del autor junto a cada uno de sus teléfonos.",
  "esquemaSql": "CREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE telefonos_autor (autor_id INTEGER, numero TEXT);\nINSERT INTO autores VALUES (1, 'Ana');\nINSERT INTO telefonos_autor VALUES (1, '555-1234'), (1, '555-5678');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT autores.nombre, telefonos_autor.numero FROM autores JOIN telefonos_autor ON telefonos_autor.autor_id = autores.id"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SQL As Understood By SQLite",
      "descripcion": "Índice completo de la sintaxis SQL real que soporta SQLite.",
      "url": "https://sqlite.org/lang.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
