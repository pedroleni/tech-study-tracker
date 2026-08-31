# Claves foráneas e integridad referencial

- **Módulo:** Diseño de esquema
- **Slug:** `claves-foraneas` (autogenerado del título)
- **Orden:** 300
- **Fuentes:** [Foreign Key Support](https://sqlite.org/foreignkeys.html) — ver `contenido/sql/TEMARIO.md` #30

---

## Qué es y para qué sirve

Una clave foránea (`FOREIGN KEY`/`REFERENCES`) declara que una columna apunta a la clave primaria de otra tabla — y, si se aplica, el motor impide insertar una referencia a algo que no existe.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "En SQLite, las claves foráneas NO se aplican por defecto",
  "contenido": "A diferencia de PostgreSQL o MySQL (donde una FOREIGN KEY siempre se hace cumplir), SQLite las deja desactivadas por compatibilidad hacia atrás — hace falta ejecutar PRAGMA foreign_keys = ON; en cada conexión para que de verdad se validen. Verificado ejecutándolo dos veces: sin el PRAGMA, insertar un autor_id que no existe en absoluto se acepta sin error; con el PRAGMA activado, falla con \"FOREIGN KEY constraint failed\"."
}
```

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "La misma clave foránea, con y sin PRAGMA activado",
  "esquemaSql": "PRAGMA foreign_keys = ON;\nCREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE posts (id INTEGER PRIMARY KEY, titulo TEXT, autor_id INTEGER REFERENCES autores(id));\nINSERT INTO autores VALUES (1, 'Ana');",
  "consulta": "INSERT INTO posts (titulo, autor_id) VALUES ('Un post', 999)",
  "anotaciones": [
    { "fragmento": "PRAGMA foreign_keys = ON;", "nota": "Sin esta línea, la siguiente consulta se aceptaría igualmente pese a que el autor 999 no existe — es la diferencia real que marca todo este esquemaSql." },
    { "fragmento": "autor_id INTEGER REFERENCES autores(id)", "nota": "Declara que autor_id debe corresponder a un id real de la tabla autores — con el PRAGMA activado, este INSERT falla porque 999 no existe en autores." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Declarar REFERENCES y asumir que ya está protegido, sin el PRAGMA.", "texto": "Es el error más específico de SQLite de todo este módulo: la sintaxis se acepta igual con o sin el PRAGMA, pero solo se hace cumplir de verdad con foreign_keys activado." },
    { "titulo": "Activar el PRAGMA una vez y asumir que queda activado para siempre.", "texto": "Es una configuración POR CONEXIÓN — cada vez que se abre una conexión nueva a la base de datos, hay que activarlo de nuevo si se necesita." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Con las claves foráneas activadas, inserta un post con autor_id = 1 (Ana, que sí existe) y comprueba que funciona con un SELECT.",
  "esquemaSql": "PRAGMA foreign_keys = ON;\nCREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT);\nCREATE TABLE posts (id INTEGER PRIMARY KEY, titulo TEXT, autor_id INTEGER REFERENCES autores(id));\nINSERT INTO autores VALUES (1, 'Ana');",
  "consultaInicial": "",
  "consultaSolucion": "INSERT INTO posts (titulo, autor_id) VALUES ('Un post', 1); SELECT * FROM posts;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Foreign Key Support",
      "descripcion": "Referencia oficial sobre claves foráneas en SQLite, incluido PRAGMA foreign_keys.",
      "url": "https://sqlite.org/foreignkeys.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
