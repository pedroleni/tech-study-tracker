# Esquemas: espacios de nombres reales dentro de una base de datos

- **Módulo:** Qué es PostgreSQL, y de un motor embebido a uno de producción real
- **Slug:** `esquemas-espacios-de-nombres-reales-dentro-de-una-base-de-datos` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [5.10. Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html) — ver `contenido/postgresql/TEMARIO.md` #3

---

## Qué es y para qué sirve

En SQLite, un fichero es una base de datos, y dentro solo hay un espacio de nombres plano para todas las tablas — dos tablas nunca pueden llamarse igual. Postgres añade un nivel intermedio que SQLite no tiene: los **esquemas** (`schema`), espacios de nombres reales *dentro* de una misma base de datos. Puedes tener `ventas.pedidos` y `archivo.pedidos` como dos tablas completamente distintas, en la misma base de datos, sin ningún conflicto.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Dos tablas 'pedidos' distintas, sin conflicto",
  "esquemaSql": "CREATE SCHEMA ventas;\nCREATE SCHEMA archivo;\nCREATE TABLE ventas.pedidos (id serial primary key, total numeric);\nCREATE TABLE archivo.pedidos (id serial primary key, total numeric, archivado_en date);\nINSERT INTO ventas.pedidos (total) VALUES (49.90);\nINSERT INTO archivo.pedidos (total, archivado_en) VALUES (12.50, '2025-01-15');",
  "consulta": "SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'pedidos'",
  "anotaciones": [
    { "fragmento": "CREATE SCHEMA ventas;", "nota": "Un esquema es, ante todo, un espacio de nombres — como una carpeta para tablas. No contiene datos por sí mismo, solo agrupa objetos." },
    { "fragmento": "CREATE TABLE ventas.pedidos", "nota": "El nombre completo de una tabla es esquema.tabla — igual que en un sistema de ficheros, dos ficheros llamados igual pueden coexistir en carpetas distintas." }
  ]
}
```

## El esquema `public` y el `search_path`

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por qué nunca has escrito 'esquema.tabla' hasta ahora",
  "contenido": "Toda base de datos nueva de Postgres trae, por defecto, un esquema llamado public — y una nueva conexión busca las tablas ahí primero (su search_path). Por eso CREATE TABLE productos (...) y SELECT * FROM productos funcionan sin mencionar ningún esquema: siempre te has referido, sin saberlo, a public.productos."
}
```

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Ver el search_path real de esta conexión",
  "esquemaSql": "-- Nada que crear: solo se pregunta la configuración de la sesión actual.",
  "consulta": "SHOW search_path",
  "anotaciones": [
    { "fragmento": "SHOW search_path", "nota": "El orden real en el que Postgres busca una tabla cuando no le dices en qué esquema mirar. En una instalación real suele incluir un esquema \"$user\" antes de public (que se ignora si no existe un esquema con el nombre del usuario actual) — aquí solo aparece public." }
  ]
}
```

## Cuándo usarías esquemas de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Separar datos de varias aplicaciones en la misma base de datos.", "texto": "Un esquema por aplicación (facturacion, inventario, analytics) evita colisiones de nombres y facilita dar permisos distintos a cada equipo sobre su propio esquema." },
    { "titulo": "Multi-tenancy simple: un esquema por cliente.", "texto": "Una estrategia real (con sus propios trade-offs frente a una columna tenant_id) para aislar los datos de cada cliente en su propio espacio de nombres, dentro de la misma base de datos física." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y observa: la consulta a `information_schema.tables` devuelve DOS filas para `pedidos`, una por cada esquema — confirma que son tablas realmente distintas.
2. ¿Qué tabla encontraría Postgres si escribieras `SELECT * FROM pedidos` sin cualificar el esquema, dado el `search_path` por defecto que viste arriba?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.10. Schemas",
      "descripcion": "Documentación oficial completa de esquemas, search_path y privilegios asociados.",
      "url": "https://www.postgresql.org/docs/current/ddl-schemas.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
