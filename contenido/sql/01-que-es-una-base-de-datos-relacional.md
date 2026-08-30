# Qué es una base de datos relacional: tablas, filas y columnas

- **Módulo:** El modelo relacional
- **Slug:** `que-es-una-base-de-datos-relacional` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [SQL As Understood By SQLite](https://sqlite.org/lang.html) — ver `contenido/sql/TEMARIO.md` #1

---

## Qué es y para qué sirve

Una base de datos **relacional** organiza la información en **tablas**: cuadrículas con filas y columnas, muy parecidas a una hoja de cálculo, pero con reglas mucho más estrictas. Cada **columna** tiene un nombre y un tipo de dato fijo (texto, número...); cada **fila** es un registro completo — un libro, un autor, un pedido. El motor que ejecuta cada ejemplo de este curso es **SQLite**, real, corriendo en tu navegador.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Una tabla real, con dos filas y dos columnas",
  "esquemaSql": "CREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT, pais TEXT);\nCREATE TABLE libros (id INTEGER PRIMARY KEY, titulo TEXT, autor_id INTEGER, anio INTEGER);\nINSERT INTO autores VALUES (1, 'Gabriel García Márquez', 'Colombia'), (2, 'Isabel Allende', 'Chile');\nINSERT INTO libros VALUES (1, 'Cien años de soledad', 1, 1967), (2, 'El amor en los tiempos del cólera', 1, 1985), (3, 'La casa de los espíritus', 2, 1982);",
  "consulta": "SELECT titulo, anio\nFROM libros\nORDER BY anio",
  "anotaciones": [
    { "fragmento": "SELECT titulo, anio", "nota": "Elige solo dos columnas de la tabla libros — una consulta casi nunca necesita todas las columnas que existen." },
    { "fragmento": "ORDER BY anio", "nota": "Una tabla no tiene un orden intrínseco propio — sin ORDER BY, las filas podrían salir en cualquier orden. Hay que pedirlo explícitamente." }
  ]
}
```

## Tabla, fila y columna: los tres términos que hay que fijar bien

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cada palabra tiene un significado preciso",
  "roles": [
    { "etiqueta": "Tabla", "rol": "Un conjunto de registros del mismo tipo", "descripcion": "libros es una tabla — todas sus filas son libros, con la misma estructura de columnas." },
    { "etiqueta": "Fila", "rol": "Un registro individual completo", "descripcion": "Una fila de libros es UN libro concreto, con su título, su autor y su año." },
    { "etiqueta": "Columna", "rol": "Un atributo que toda fila comparte", "descripcion": "titulo es una columna — cada libro tiene una, aunque el texto sea distinto en cada fila." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar en una tabla como si fuera una hoja de cálculo sin reglas.", "texto": "Una hoja de cálculo admite cualquier cosa en cualquier celda — una tabla SQL exige que cada columna tenga el mismo tipo de dato en todas las filas, declarado por adelantado." },
    { "titulo": "Asumir que las filas salen en el orden en que se insertaron.", "texto": "Un motor real es libre de devolver las filas en el orden que le resulte más eficiente, salvo que la consulta pida ORDER BY explícitamente." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el título de los libros de Isabel Allende (autor_id = 2), ordenados alfabéticamente por título.",
  "esquemaSql": "CREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT, pais TEXT);\nCREATE TABLE libros (id INTEGER PRIMARY KEY, titulo TEXT, autor_id INTEGER, anio INTEGER);\nINSERT INTO autores VALUES (1, 'Gabriel García Márquez', 'Colombia'), (2, 'Isabel Allende', 'Chile');\nINSERT INTO libros VALUES (1, 'Cien años de soledad', 1, 1967), (2, 'El amor en los tiempos del cólera', 1, 1985), (3, 'La casa de los espíritus', 2, 1982);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT titulo FROM libros WHERE autor_id = 2 ORDER BY titulo"
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
