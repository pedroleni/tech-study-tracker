# UUID como tipo nativo

- **Módulo:** Tipos de datos que SQLite no tiene
- **Slug:** `uuid-como-tipo-nativo` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [8. Data Types](https://www.postgresql.org/docs/current/datatype.html) — ver `contenido/postgresql/TEMARIO.md` #5

---

## Qué es y para qué sirve

Un **UUID** (*Universally Unique Identifier*) es un identificador de 128 bits, escrito normalmente como 32 dígitos hexadecimales agrupados con guiones (`a1b2c3d4-e5f6-7890-abcd-ef1234567890`). En SQLite no existe un tipo `UUID` real — se guarda como texto y punto. Postgres sí tiene un tipo `uuid` nativo, con su propio formato de almacenamiento binario (16 bytes, más compacto y más rápido de comparar que el mismo valor como texto) y validación real de formato.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una tabla con clave primaria UUID, generada por el propio Postgres",
  "esquemaSql": "CREATE TABLE sesiones (id uuid primary key default gen_random_uuid(), usuario text not null, iniciada_en timestamptz default now());\nINSERT INTO sesiones (usuario) VALUES ('ana'), ('roberto');",
  "consulta": "SELECT id, usuario, pg_typeof(id) AS tipo_real FROM sesiones ORDER BY usuario",
  "anotaciones": [
    { "fragmento": "id uuid primary key default gen_random_uuid()", "nota": "gen_random_uuid() es nativa de Postgres desde la versión 13 — no hace falta ninguna extensión para generar UUIDs aleatorios (versión 4). Cada fila recibe un id único generado por el propio servidor, no por la aplicación." },
    { "fragmento": "pg_typeof(id)", "nota": "Confirma en el propio resultado que la columna es de verdad de tipo uuid, no texto disfrazado de UUID." }
  ]
}
```

## Por qué usar UUID como clave primaria (y cuándo NO)

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Se pueden generar en el cliente, antes de tocar la base de datos.", "texto": "Un id autoincremental (serial) solo existe después del INSERT — un UUID se puede generar en la propia aplicación (o en el propio dispositivo, offline) antes de enviar nada al servidor, útil para sincronización o generación distribuida de ids." },
    { "titulo": "No revelan cuántas filas hay, ni el orden de creación.", "texto": "Un id secuencial (1, 2, 3...) filtra información real (\"solo hay 40 usuarios\", \"este pedido es el número 8471\"). Un UUID aleatorio no revela nada de eso." },
    { "titulo": "El coste real: son más grandes y menos ordenables.", "texto": "16 bytes frente a 4-8 de un entero, y al ser aleatorios (no secuenciales) generan más fragmentación en los índices B-tree que un entero autoincremental. Para tablas gigantes con muchísimas escrituras, esto es un trade-off real, no solo teórico." }
  ]
}
```

## Compruébalo tú: dos UUIDs generados nunca coinciden

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Comprueba que gen_random_uuid() genera un valor distinto cada vez que se llama. Escribe una consulta que devuelva dos UUIDs generados en la misma fila, y confirma a simple vista que son distintos.",
  "esquemaSql": "-- No hace falta ninguna tabla: gen_random_uuid() se puede llamar directamente.",
  "consultaInicial": "",
  "consultaSolucion": "SELECT gen_random_uuid() AS primero, gen_random_uuid() AS segundo"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `pg_typeof(id)` devuelve `uuid`, no `text`.
2. En tus propias palabras: ¿por qué un UUID como id de un pedido es mejor, de cara a un cliente externo que ve esa URL, que un id secuencial como `/pedidos/8471`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "8. Data Types",
      "descripcion": "El capítulo completo de tipos de datos de PostgreSQL, incluido uuid.",
      "url": "https://www.postgresql.org/docs/current/datatype.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
