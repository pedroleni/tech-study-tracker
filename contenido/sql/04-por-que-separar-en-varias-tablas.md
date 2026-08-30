# Por qué separar datos en varias tablas relacionadas

- **Módulo:** El modelo relacional
- **Slug:** `por-que-separar-en-varias-tablas` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [SQL As Understood By SQLite](https://sqlite.org/lang.html) — ver `contenido/sql/TEMARIO.md` #4

---

## Qué es y para qué sirve

Se podría meter todo en una sola tabla gigante — pero eso repite datos una y otra vez, y repetir datos es repetir errores. Separar la información en varias tablas relacionadas (una idea que se llama **normalización**, y que se estudia en profundidad en el módulo 7) evita esa repetición desde el diseño.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "libros_todo_junto\n-----------------------------------------------------\ntitulo                | autor_nombre          | autor_pais\n-----------------------------------------------------\nCien años de soledad   | García Márquez        | Colombia\nEl amor en los tiempos.| García Márquez        | Colombia   <- repetido\nLa casa de los espíritus| Isabel Allende       | Chile",
  "despues": "autores                          libros\n---------------------           ------------------------------\nid | nombre         | pais       titulo                    | autor_id\n1  | García Márquez | Colombia   Cien años de soledad       | 1\n2  | Isabel Allende | Chile      El amor en los tiempos...  | 1\n                                La casa de los espíritus   | 2",
  "nota": "El país de García Márquez vive en UN solo sitio (la tabla autores), no repetido en cada libro suyo. Si se corrige un dato, se corrige una vez."
}
```

## El problema real de repetir datos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Una actualización a medias deja datos contradictorios.", "texto": "Si el país de un autor cambia y solo se actualiza en algunas filas (por error humano o por un script que no cubre todos los casos), la tabla queda con el mismo autor apareciendo en dos países distintos." },
    { "titulo": "Más espacio ocupado del necesario, sin ganar nada a cambio.", "texto": "Repetir 'García Márquez, Colombia' en cada uno de sus libros no aporta ninguna información nueva — la tabla separada dice exactamente lo mismo, una sola vez." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Con las tablas separadas (autores y libros), muestra el nombre del autor y el título de cada uno de sus libros, uniendo por autor_id (el JOIN se estudia a fondo en el módulo 4 — de momento, fíjate en el resultado).",
  "esquemaSql": "CREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT, pais TEXT);\nCREATE TABLE libros (id INTEGER PRIMARY KEY, titulo TEXT, autor_id INTEGER);\nINSERT INTO autores VALUES (1, 'García Márquez', 'Colombia'), (2, 'Isabel Allende', 'Chile');\nINSERT INTO libros VALUES (1, 'Cien años de soledad', 1), (2, 'El amor en los tiempos del cólera', 1), (3, 'La casa de los espíritus', 2);",
  "consultaInicial": "SELECT autores.nombre, libros.titulo\nFROM libros, autores\nWHERE libros.autor_id = autores.id",
  "consultaSolucion": "SELECT autores.nombre, libros.titulo FROM libros, autores WHERE libros.autor_id = autores.id"
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
