# Claves primarias: por qué toda tabla necesita una

- **Módulo:** El modelo relacional
- **Slug:** `claves-primarias` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [CREATE TABLE](https://sqlite.org/lang_createtable.html) — ver `contenido/sql/TEMARIO.md` #2

---

## Qué es y para qué sirve

Una **clave primaria** (`PRIMARY KEY`) es la columna (o combinación de columnas) que identifica una fila de forma única e inequívoca dentro de su tabla — nunca se repite, nunca está vacía. Sin ella, no hay forma fiable de decir "esta fila exacta, no otra parecida".

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Dos personas reales, con el mismo nombre",
  "esquemaSql": "CREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT, pais TEXT);\nINSERT INTO autores VALUES (1, 'Ana García', 'España'), (2, 'Ana García', 'México');",
  "consulta": "SELECT id, nombre, pais\nFROM autores\nWHERE nombre = 'Ana García'",
  "anotaciones": [
    { "fragmento": "WHERE nombre = 'Ana García'", "nota": "Filtrar por nombre encuentra DOS personas reales distintas — el nombre no identifica a nadie de forma única, ni en la vida real ni en una tabla." },
    { "fragmento": "id INTEGER PRIMARY KEY", "nota": "id sí es único por definición — SQLite se lo garantiza. Es la única forma fiable de referirse a 'esta fila exacta'." }
  ]
}
```

## Qué garantiza `PRIMARY KEY` de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Nunca se repite.", "texto": "Dos filas de la misma tabla nunca pueden compartir el mismo valor de clave primaria — el motor lo rechaza." },
    { "titulo": "Nunca queda vacía.", "texto": "Una clave primaria implica NOT NULL de forma implícita — no tiene sentido una identidad vacía." },
    { "titulo": "No cambia con el tiempo.", "texto": "Aunque técnicamente se pueda actualizar, una buena clave primaria es estable — no un dato que vaya a editarse (como un email, que sí puede cambiar)." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar un campo \"natural\" (email, nombre, DNI) como clave primaria sin pensarlo dos veces.", "texto": "Un email puede cambiar; un nombre se puede repetir. Un id numérico autogenerado (como en el ejemplo de arriba) casi siempre es más seguro que confiar en un dato del mundo real." },
    { "titulo": "Olvidar declarar PRIMARY KEY y confiar en que \"ya se sabrá\" cuál es la fila.", "texto": "Sin clave primaria, una tabla puede tener filas duplicadas de forma indistinguible entre sí — un problema real, no solo una mala práctica." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Hay dos autores llamados \"Ana García\" en la tabla. Muestra el id y el país de la que vive en México.",
  "esquemaSql": "CREATE TABLE autores (id INTEGER PRIMARY KEY, nombre TEXT, pais TEXT);\nINSERT INTO autores VALUES (1, 'Ana García', 'España'), (2, 'Ana García', 'México');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT id, pais FROM autores WHERE nombre = 'Ana García' AND pais = 'México'"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CREATE TABLE",
      "descripcion": "Referencia oficial de CREATE TABLE, incluida la cláusula PRIMARY KEY.",
      "url": "https://sqlite.org/lang_createtable.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
