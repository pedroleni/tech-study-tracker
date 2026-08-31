# Claves foráneas: por qué en Postgres SIEMPRE se validan

- **Módulo:** Qué es PostgreSQL, y de un motor embebido a uno de producción real
- **Slug:** `claves-foraneas-por-que-en-postgres-siempre-se-validan` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [Chapter 5. Data Definition](https://www.postgresql.org/docs/current/ddl.html) — ver `contenido/postgresql/TEMARIO.md` #3

---

## Qué es y para qué sirve

Ya conoces las claves foráneas del track de SQL: una columna que referencia la clave primaria de otra tabla, para que la base de datos garantice que esa referencia sea real (no puedes tener un pedido con un `cliente_id` que no exista). Pero ahí aprendiste también una limitación real de SQLite: **las claves foráneas no se validan por defecto** — hace falta `PRAGMA foreign_keys = ON;` explícito en cada conexión, o SQLite deja pasar referencias rotas sin ni siquiera avisar.

En PostgreSQL, esa limitación no existe: una `FOREIGN KEY` se valida siempre, automáticamente, sin ningún `PRAGMA` ni configuración adicional.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n-- SQLite, sin el PRAGMA: esto se acepta sin rechistar\nCREATE TABLE pedidos (\n  id INTEGER PRIMARY KEY,\n  cliente_id INTEGER REFERENCES clientes(id)\n);\nINSERT INTO pedidos (cliente_id) VALUES (999); -- cliente 999 no existe, y SQLite lo deja pasar\n</script>",
  "despues": "<script>\n-- PostgreSQL: se valida siempre, sin ningún PRAGMA\nCREATE TABLE pedidos (\n  id serial primary key,\n  cliente_id int REFERENCES clientes(id)\n);\nINSERT INTO pedidos (cliente_id) VALUES (999);\n-- ERROR: insert or update on table \"pedidos\" violates foreign key constraint\n-- DETAIL: Key (cliente_id)=(999) is not present in table \"clientes\".\n</script>",
  "nota": "El mismo error real que verás si lo ejecutas tú mismo abajo — no es un mensaje inventado para el ejercicio. En SQLite, ese INSERT roto se cuela silenciosamente salvo que hayas activado el PRAGMA a mano."
}
```

## Compruébalo tú mismo, con el error real

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Intenta insertar un pedido con un cliente_id que no existe en la tabla clientes (por ejemplo, 999). Lee el error real que te devuelve Postgres.",
  "esquemaSql": "CREATE TABLE clientes (id serial primary key, nombre text not null);\nCREATE TABLE pedidos (id serial primary key, cliente_id int REFERENCES clientes(id), total numeric);\nINSERT INTO clientes (nombre) VALUES ('Ana'), ('Luis');",
  "consultaInicial": "INSERT INTO pedidos (cliente_id, total) VALUES (999, 49.90)",
  "consultaSolucion": "INSERT INTO pedidos (cliente_id, total) VALUES (1, 49.90)"
}
```

## Por qué importa de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Integridad garantizada por el motor, no por disciplina del programador",
  "contenido": "Con validación automática, es literalmente imposible que la base de datos acumule pedidos huérfanos apuntando a clientes borrados — sin importar cuántas aplicaciones distintas, escritas por equipos distintos, escriban en esas tablas. Con SQLite sin el PRAGMA activo, esa garantía depende de que CADA conexión se acuerde de activarlo."
}
```

## Ejercicios

1. Ejecuta el bloque de arriba con un `cliente_id` que sí exista (1 o 2) y confirma que el `INSERT` funciona sin error.
2. En tus propias palabras: ¿por qué una aplicación real en producción con varios equipos escribiendo en la misma base de datos se beneficia más de "se valida siempre" que de "hay que acordarse de activarlo"?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Chapter 5. Data Definition",
      "descripcion": "Documentación oficial de claves foráneas y restricciones en PostgreSQL.",
      "url": "https://www.postgresql.org/docs/current/ddl.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
