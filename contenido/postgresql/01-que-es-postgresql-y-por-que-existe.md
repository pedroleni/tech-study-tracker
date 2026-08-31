# Qué es PostgreSQL y por qué existe

- **Módulo:** Qué es PostgreSQL, y de un motor embebido a uno de producción real
- **Slug:** `que-es-postgresql-y-por-que-existe` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [PostgreSQL Documentation](https://www.postgresql.org/docs/current/index.html) — ver `contenido/postgresql/TEMARIO.md` #1

---

## Qué es y para qué sirve

**PostgreSQL** (a menudo "Postgres" a secas) es un sistema de gestión de bases de datos relacionales de código abierto — un programa real que corre como un proceso servidor, guarda datos en disco de forma duradera, y atiende conexiones de clientes que le mandan SQL. El proyecto lleva desarrollándose de forma continua desde 1986 (nació en Berkeley como "Postgres", sucesor de otro proyecto llamado Ingres), y hoy es uno de los motores relacionales más usados en producción del mundo — no una alternativa de nicho, sino la base de datos por defecto de muchísimas empresas y de plataformas enteras (Supabase, sobre la que corre este propio proyecto, es literalmente PostgreSQL con capas encima).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Preguntarle al propio servidor quién es",
  "esquemaSql": "-- Sin esquema propio: esta consulta solo pregunta al servidor por sí mismo.",
  "consulta": "SELECT version()",
  "anotaciones": [
    { "fragmento": "version()", "nota": "Una función real del servidor — no un dato inventado para el ejercicio. Devuelve la versión exacta de PostgreSQL que está atendiendo esta conexión." }
  ]
}
```

## SQL (el lenguaje) frente a PostgreSQL/SQLite/MySQL (los motores)

Es fácil confundir los dos niveles, así que conviene fijarlo ya: **SQL** es un lenguaje — un estándar con una gramática y un vocabulario (`SELECT`, `WHERE`, `JOIN`...) que ya aprendiste entero en el track de SQL de este catálogo. **PostgreSQL** es un producto concreto: un programa real, escrito en C, que implementa ese lenguaje (y lo extiende con muchísimo más). SQLite, MySQL, SQL Server o Oracle son otros productos distintos que también hablan SQL, cada uno con sus propias particularidades, límites y añadidos.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos niveles que no son lo mismo",
  "roles": [
    { "etiqueta": "SQL", "rol": "El lenguaje", "descripcion": "Una gramática estándar: SELECT, WHERE, JOIN... Lo mismo (casi) en cualquier motor." },
    { "etiqueta": "PostgreSQL", "rol": "Un motor concreto", "descripcion": "Un programa real que ejecuta ese lenguaje — con su propio motor de almacenamiento, su propio planificador, sus propias extensiones." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando la aplicación necesita un servidor de datos real",
  "contenido": "A diferencia de SQLite (un fichero, sin proceso servidor propio), Postgres atiende conexiones de red — varias aplicaciones, varios usuarios, varias máquinas, todos hablando con la misma base de datos a la vez. Es la elección por defecto de una app real en producción con más de un usuario concurrente."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando hace falta control de acceso real",
  "contenido": "Postgres tiene roles, contraseñas y permisos de verdad a nivel de base de datos — algo que un fichero SQLite, por diseño, no puede tener. Si distintos usuarios necesitan distintos niveles de acceso a los mismos datos, esto ya no es opcional."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando los datos son más que texto y números simples",
  "contenido": "JSONB, arrays, tipos geométricos, búsqueda de texto completo, extensiones para vectores (embeddings de IA) o datos geoespaciales — Postgres tiene un sistema de tipos extensible que SQLite no ofrece. Este mismo temario dedica módulos enteros a esto."
}
```

## Lo que este temario da por aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Todo el SQL 'estándar' ya está cubierto.", "texto": "SELECT, WHERE, JOIN, GROUP BY, subconsultas, CTEs, funciones de ventana, transacciones básicas — el track de SQL de este catálogo (45 lecciones) ya lo cubrió, con SQLite como motor de ejecución real. Aquí no se repite nada de eso." },
    { "titulo": "Este temario es 'lo que añade un motor de producción'.", "texto": "Tipos avanzados, RLS, roles reales, el planificador con costes reales, extensiones — específicamente lo que separa un motor embebido de uno cliente-servidor pensado para producción." }
  ]
}
```

## Ejercicios

1. Sin ejecutar nada todavía: escribe de memoria tres motores de bases de datos relacionales distintos de PostgreSQL. ¿Cuál de ellos ya usaste en el track de SQL de este catálogo?
2. Ejecuta `SELECT current_database(), current_user;` en el bloque de arriba (cámbialo tú, es editable donde corresponda) o en el siguiente ejercicio del temario — anota qué te devuelve.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "PostgreSQL Documentation",
      "descripcion": "El índice completo de la documentación oficial — el punto de partida de todo este temario.",
      "url": "https://www.postgresql.org/docs/current/index.html",
      "etiqueta": "PostgreSQL"
    },
    {
      "titulo": "About PostgreSQL",
      "descripcion": "Historia breve y filosofía del proyecto, directamente de sus mantenedores.",
      "url": "https://www.postgresql.org/about/",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
