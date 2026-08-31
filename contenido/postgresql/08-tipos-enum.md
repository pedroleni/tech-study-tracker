# Tipos ENUM

- **Módulo:** Tipos de datos que SQLite no tiene
- **Slug:** `tipos-enum` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [8.7. Enumerated Types](https://www.postgresql.org/docs/current/datatype-enum.html) — ver `contenido/postgresql/TEMARIO.md` #5

---

## Qué es y para qué sirve

Cuando una columna solo puede tener un valor de una lista fija y conocida (el estado de un pedido: `pendiente`, `enviado`, `entregado`, `cancelado`), la forma habitual en SQL es una columna de texto con un `CHECK` que restrinja los valores válidos. Postgres ofrece una alternativa real: un tipo **ENUM** propio, creado una vez con `CREATE TYPE`, que se comporta como cualquier otro tipo de dato — con la ventaja de que Postgres valida el valor contra la lista completa, y lo guarda de forma más compacta que el texto equivalente.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un tipo ENUM real, con orden implícito",
  "esquemaSql": "CREATE TYPE estado_pedido AS ENUM ('pendiente', 'enviado', 'entregado', 'cancelado');\nCREATE TABLE pedidos (id serial primary key, estado estado_pedido not null default 'pendiente');\nINSERT INTO pedidos (estado) VALUES ('pendiente'), ('enviado'), ('entregado');",
  "consulta": "SELECT id, estado FROM pedidos ORDER BY estado",
  "anotaciones": [
    { "fragmento": "CREATE TYPE estado_pedido AS ENUM ('pendiente', 'enviado', 'entregado', 'cancelado');", "nota": "El tipo se crea UNA VEZ, de forma independiente a cualquier tabla — luego se puede reutilizar en varias tablas distintas que necesiten ese mismo conjunto de estados." },
    { "fragmento": "ORDER BY estado", "nota": "Los valores de un ENUM tienen un orden real, el orden en el que se declararon al crear el tipo — no alfabético. 'pendiente' < 'enviado' < 'entregado' < 'cancelado', aunque alfabéticamente 'cancelado' iría primero." }
  ]
}
```

## El error real si intentas un valor fuera de la lista

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Intenta insertar un pedido con estado 'perdido' (que no está en la lista del ENUM) y lee el error real que devuelve Postgres.",
  "esquemaSql": "CREATE TYPE estado_pedido AS ENUM ('pendiente', 'enviado', 'entregado', 'cancelado');\nCREATE TABLE pedidos (id serial primary key, estado estado_pedido not null default 'pendiente');",
  "consultaInicial": "INSERT INTO pedidos (estado) VALUES ('perdido')",
  "consultaSolucion": "INSERT INTO pedidos (estado) VALUES ('cancelado')"
}
```

## ENUM frente a `CHECK` sobre texto: el trade-off real

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n-- Con CHECK sobre texto: funciona en cualquier motor, ninguna sorpresa\nCREATE TABLE pedidos (\n  id serial primary key,\n  estado text NOT NULL CHECK (estado IN ('pendiente', 'enviado', 'entregado', 'cancelado'))\n);\n</script>",
  "despues": "<script>\n-- Con ENUM: más compacto, con orden real, pero AÑADIR un valor nuevo\n-- necesita ALTER TYPE ... ADD VALUE, y ese cambio no se puede deshacer\n-- dentro de la misma transacción en versiones antiguas de Postgres\nALTER TYPE estado_pedido ADD VALUE 'en_revision';\n</script>",
  "nota": "Un ENUM es más rígido para cambiar que un CHECK sobre texto — añadir un estado nuevo es una migración de esquema real, no solo actualizar una lista de valores permitidos en una restricción. A cambio, gana orden real y un almacenamiento más compacto."
}
```

## Ejercicios

1. Ejecuta el segundo bloque tal cual (con `'perdido'`) y lee el mensaje de error exacto que devuelve Postgres.
2. Cambia la consulta a un valor real del ENUM (`'cancelado'`, por ejemplo) y confirma que el `INSERT` funciona.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "8.7. Enumerated Types",
      "descripcion": "Documentación oficial completa de tipos ENUM: creación, orden, modificación.",
      "url": "https://www.postgresql.org/docs/current/datatype-enum.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
