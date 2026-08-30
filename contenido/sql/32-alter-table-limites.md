# ALTER TABLE y sus límites reales en SQLite

- **Módulo:** Diseño de esquema
- **Slug:** `alter-table-limites` (autogenerado del título)
- **Orden:** 320
- **Fuentes:** [ALTER TABLE](https://sqlite.org/lang_altertable.html) + [Omitted Features](https://sqlite.org/omitted.html) — ver `contenido/sql/TEMARIO.md` #32

---

## Qué es y para qué sirve

`ALTER TABLE` modifica una tabla que ya existe — pero en SQLite, a diferencia de PostgreSQL o MySQL, solo permite un conjunto reducido de cambios.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Añadir una columna y renombrar otra, en una tabla ya existente",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT);",
  "consulta": "ALTER TABLE productos ADD COLUMN precio REAL DEFAULT 0;\nALTER TABLE productos RENAME COLUMN nombre TO titulo;\nSELECT * FROM productos;",
  "anotaciones": [
    { "fragmento": "ALTER TABLE productos ADD COLUMN precio REAL DEFAULT 0;", "nota": "Añade una columna nueva a una tabla que ya tiene filas — DEFAULT 0 decide qué valor tienen las filas ya existentes en esa columna nueva." },
    { "fragmento": "ALTER TABLE productos RENAME COLUMN nombre TO titulo;", "nota": "Cambia el nombre de la columna sin tocar sus datos — todo lo que ya estaba en nombre sigue ahí, solo bajo el nombre nuevo." }
  ]
}
```

## Lo que SQLite NO permite con ALTER TABLE

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Solo cuatro operaciones — verificado: ALTER COLUMN falla con \"syntax error\"",
  "contenido": "SQLite solo admite RENAME TABLE, ADD COLUMN, RENAME COLUMN y DROP COLUMN. No existe ALTER COLUMN (cambiar el tipo de una columna) ni ADD CONSTRAINT (añadir una restricción a una tabla ya creada) — verificado ejecutándolo: falla con \"near ALTER: syntax error\", ni siquiera llega a intentarlo. Para cualquiera de esos dos cambios, la técnica real es: crear una tabla nueva con la estructura deseada, copiar los datos, borrar la vieja y renombrar la nueva."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Buscar ALTER COLUMN esperando que exista, viniendo de otro motor.", "texto": "PostgreSQL y MySQL sí lo soportan — es una de las diferencias reales más citadas al migrar entre motores, no un descuido de SQLite." },
    { "titulo": "Intentar añadir una restricción NOT NULL a una columna que ya existe.", "texto": "No hay forma directa — ADD COLUMN sí admite NOT NULL en columnas NUEVAS (con un DEFAULT obligatorio, porque las filas existentes necesitan algún valor), pero no se puede aplicar a una columna ya existente sin recrear la tabla." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Añade una columna \"stock\" de tipo INTEGER con valor por defecto 0 a la tabla productos, y comprueba el resultado con un SELECT.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT);\nINSERT INTO productos VALUES (1, 'Cuaderno');",
  "consultaInicial": "",
  "consultaSolucion": "ALTER TABLE productos ADD COLUMN stock INTEGER DEFAULT 0; SELECT * FROM productos;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "ALTER TABLE",
      "descripcion": "Referencia oficial completa de ALTER TABLE en SQLite.",
      "url": "https://sqlite.org/lang_altertable.html",
      "etiqueta": "SQLite"
    },
    {
      "titulo": "SQL Features That SQLite Does Not Implement",
      "descripcion": "Lista oficial de características de SQL que SQLite no soporta.",
      "url": "https://sqlite.org/omitted.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
