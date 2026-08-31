# ALTER TABLE completo: ALTER COLUMN, ADD CONSTRAINT, cambiar de tipo

- **Módulo:** DDL avanzado
- **Slug:** `alter-table-completo` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [Chapter 5. Data Definition](https://www.postgresql.org/docs/current/ddl.html) — ver `contenido/postgresql/TEMARIO.md` #7

---

## Qué es y para qué sirve

En el track de SQL aprendiste los límites reales de `ALTER TABLE` en SQLite: solo `RENAME TABLE`, `ADD COLUMN`, `RENAME COLUMN` y `DROP COLUMN` — nada de cambiar el tipo de una columna existente, ni añadir una restricción a una tabla que ya tiene filas, sin reconstruir la tabla entera a mano. Postgres no tiene esa limitación: `ALTER TABLE` soporta modificar columnas existentes y añadir restricciones directamente.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Tres operaciones que SQLite no puede hacer directamente",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio text);\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', '45.99'), ('Ratón', '19.50');\nALTER TABLE productos ALTER COLUMN precio TYPE numeric USING precio::numeric;\nALTER TABLE productos ADD CONSTRAINT precio_positivo CHECK (precio > 0);\nALTER TABLE productos ALTER COLUMN nombre SET NOT NULL;",
  "consulta": "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'productos' ORDER BY ordinal_position",
  "anotaciones": [
    { "fragmento": "ALTER TABLE productos ALTER COLUMN precio TYPE numeric USING precio::numeric;", "nota": "Cambia el TIPO de una columna que ya tiene datos reales — USING precio::numeric le dice a Postgres cómo convertir cada valor de texto existente al nuevo tipo. Sin USING, Postgres solo lo permite si la conversión es implícita." },
    { "fragmento": "ALTER TABLE productos ADD CONSTRAINT precio_positivo CHECK (precio > 0);", "nota": "Añade una restricción a una tabla que ya tiene filas — Postgres verifica TODAS las filas existentes contra la nueva regla en ese mismo momento; si alguna la violara, el ALTER fallaría entero." }
  ]
}
```

## El ALTER TYPE puede fallar de verdad si los datos no encajan

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Esta tabla tiene un precio con un valor 'gratis' que no es un número. Intenta el mismo ALTER COLUMN ... TYPE numeric y lee el error real.",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, precio text);\nINSERT INTO productos (nombre, precio) VALUES ('Teclado', '45.99'), ('Muestra', 'gratis');",
  "consultaInicial": "ALTER TABLE productos ALTER COLUMN precio TYPE numeric USING precio::numeric",
  "consultaSolucion": "ALTER TABLE productos ALTER COLUMN precio TYPE text"
}
```

## Por qué importa de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Evolucionar un esquema sin reescribir la tabla a mano",
  "contenido": "En SQLite, cambiar el tipo de una columna con datos reales significa crear una tabla nueva, copiar los datos con la conversión, borrar la vieja y renombrar — un proceso manual y propenso a errores. En Postgres es una sola sentencia real, con sus propias garantías de todo-o-nada (si falla, no deja la tabla a medias)."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma en el resultado real: `precio` ahora es `numeric`, no `text`.
2. Ejecuta el segundo bloque tal cual (con el valor `'gratis'`) y lee el mensaje de error exacto — ¿qué parte del mensaje te dice qué valor concreto falló la conversión?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Chapter 5. Data Definition",
      "descripcion": "Documentación oficial de ALTER TABLE y todas sus variantes.",
      "url": "https://www.postgresql.org/docs/current/ddl.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
