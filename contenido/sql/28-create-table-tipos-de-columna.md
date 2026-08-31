# CREATE TABLE y los tipos de columna reales

- **Módulo:** Diseño de esquema
- **Slug:** `create-table-tipos-de-columna` (autogenerado del título)
- **Orden:** 280
- **Fuentes:** [CREATE TABLE](https://sqlite.org/lang_createtable.html) — ver `contenido/sql/TEMARIO.md` #28

---

## Qué es y para qué sirve

`CREATE TABLE` define la estructura de una tabla nueva: su nombre, sus columnas y el tipo de cada una. Cada `esquemaSql` que has visto en este curso es, precisamente, una o varias sentencias `CREATE TABLE`.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Una tabla de posts de blog, con tipos declarados",
  "esquemaSql": "SELECT 1;",
  "consulta": "CREATE TABLE posts (\n  id INTEGER PRIMARY KEY,\n  titulo TEXT NOT NULL,\n  publicado INTEGER DEFAULT 0,\n  vistas INTEGER DEFAULT 0\n);\nINSERT INTO posts (titulo) VALUES ('Mi primer post');\nSELECT * FROM posts;",
  "anotaciones": [
    { "fragmento": "id INTEGER PRIMARY KEY", "nota": "Sobre una columna INTEGER, PRIMARY KEY hace que SQLite le asigne automáticamente un valor único creciente si no se especifica al insertar." },
    { "fragmento": "publicado INTEGER DEFAULT 0", "nota": "SQLite no tiene un tipo BOOLEAN nativo — 0 y 1 sobre INTEGER es la convención real para verdadero/falso. DEFAULT 0 significa que, si no se indica, un post nuevo empieza sin publicar." }
  ]
}
```

## Tipos reales que se usan en la práctica

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro tipos cubren casi cualquier necesidad",
  "roles": [
    { "etiqueta": "INTEGER", "rol": "Números enteros, IDs, booleanos (0/1)", "descripcion": "El tipo más usado de todos — incluso para lo que en otros lenguajes sería un boolean." },
    { "etiqueta": "TEXT", "rol": "Cualquier cadena: nombres, títulos, fechas ISO", "descripcion": "SQLite no distingue VARCHAR(50) de TEXT en la práctica — ambos aceptan texto de cualquier longitud." },
    { "etiqueta": "REAL", "rol": "Números con decimales: precios, medias", "descripcion": "Coma flotante — para dinero exacto en producción real, muchos equipos prefieren guardar céntimos como INTEGER en vez de REAL, para evitar errores de redondeo." },
    { "etiqueta": "BLOB", "rol": "Datos binarios crudos", "descripcion": "Poco frecuente en un esquema típico de aplicación — imágenes o ficheros suelen guardarse fuera de la base de datos, con solo una URL o ruta en una columna TEXT." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Buscar un tipo BOOLEAN o DATE nativo que no existe en SQLite.", "texto": "SQLite no tiene tipos dedicados para booleanos ni fechas — se usan INTEGER (0/1) y TEXT (formato ISO 8601, 'YYYY-MM-DD') por convención, no por obligación del lenguaje." },
    { "titulo": "Olvidar NOT NULL en una columna que de verdad siempre debería tener valor.", "texto": "Sin NOT NULL, SQLite acepta NULL en cualquier columna que no sea la clave primaria — hay que declararlo explícitamente si un titulo vacío no debería ser válido." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Crea una tabla comentarios con: id (clave primaria), texto (TEXT, obligatorio), post_id (INTEGER). Termina con un SELECT * FROM comentarios para comprobar que la tabla existe (estará vacía).",
  "esquemaSql": "SELECT 1;",
  "consultaInicial": "",
  "consultaSolucion": "CREATE TABLE comentarios (id INTEGER PRIMARY KEY, texto TEXT NOT NULL, post_id INTEGER); SELECT * FROM comentarios;"
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
      "descripcion": "Referencia oficial completa de la sentencia CREATE TABLE.",
      "url": "https://sqlite.org/lang_createtable.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
