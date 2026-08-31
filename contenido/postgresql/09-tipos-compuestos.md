# Tipos compuestos (composite types)

- **Módulo:** Tipos de datos que SQLite no tiene
- **Slug:** `tipos-compuestos` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [8. Data Types](https://www.postgresql.org/docs/current/datatype.html) — ver `contenido/postgresql/TEMARIO.md` #5

---

## Qué es y para qué sirve

Un **tipo compuesto** es un tipo de dato propio hecho de varios campos con nombre, como una fila reutilizable — algo a medio camino entre una tabla y un tipo simple. Postgres los crea con `CREATE TYPE ... AS (...)`, y una vez creado se puede usar como el tipo de una columna, igual que usarías `text` o `int`.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una dirección como un único valor con varios campos",
  "esquemaSql": "CREATE TYPE direccion AS (calle text, ciudad text, codigo_postal text);\nCREATE TABLE clientes (id serial primary key, nombre text, direccion_envio direccion);\nINSERT INTO clientes (nombre, direccion_envio) VALUES\n  ('Ana', ROW('Calle Mayor 5', 'Madrid', '28001')),\n  ('Roberto', ROW('Av. Diagonal 200', 'Barcelona', '08018'));",
  "consulta": "SELECT nombre, (direccion_envio).ciudad AS ciudad, (direccion_envio).codigo_postal AS cp FROM clientes ORDER BY nombre",
  "anotaciones": [
    { "fragmento": "CREATE TYPE direccion AS (calle text, ciudad text, codigo_postal text);", "nota": "Tres campos con nombre, agrupados en un único tipo reutilizable — se puede usar en cualquier tabla que necesite guardar una dirección, no solo en clientes." },
    { "fragmento": "(direccion_envio).ciudad", "nota": "Los paréntesis alrededor del nombre de columna son obligatorios en esta sintaxis — sin ellos, Postgres interpretaría direccion_envio.ciudad como \"la columna ciudad de una tabla llamada direccion_envio\", que no existe." }
  ]
}
```

## Tipo compuesto frente a JSONB: cuándo cada uno

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Tipo compuesto: campos fijos y conocidos de antemano, con tipos reales.", "texto": "Postgres valida cada campo con su propio tipo (codigo_postal es siempre text, por ejemplo) — más rígido, pero con las mismas garantías de tipado que cualquier columna normal." },
    { "titulo": "JSONB (próxima lección de este módulo): forma variable, anidamiento libre.", "texto": "Cuando los datos no tienen una forma fija (cada fila podría tener campos distintos), o necesitas anidar estructuras arbitrariamente, JSONB es la herramienta correcta — un tipo compuesto no está pensado para eso." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Muestra el nombre y la calle (solo la calle) de los clientes.",
  "esquemaSql": "CREATE TYPE direccion AS (calle text, ciudad text, codigo_postal text);\nCREATE TABLE clientes (id serial primary key, nombre text, direccion_envio direccion);\nINSERT INTO clientes (nombre, direccion_envio) VALUES\n  ('Ana', ROW('Calle Mayor 5', 'Madrid', '28001')),\n  ('Roberto', ROW('Av. Diagonal 200', 'Barcelona', '08018'));",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, (direccion_envio).calle AS calle FROM clientes"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que puedes acceder a `ciudad` y `codigo_postal` por separado, aunque ambos vivan dentro del mismo valor de la columna.
2. ¿Por qué un tipo compuesto sigue siendo más rígido que JSONB, aunque los dos permitan agrupar varios campos en un único valor?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "8. Data Types",
      "descripcion": "El capítulo de tipos de datos de PostgreSQL, incluidos los tipos compuestos.",
      "url": "https://www.postgresql.org/docs/current/datatype.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
