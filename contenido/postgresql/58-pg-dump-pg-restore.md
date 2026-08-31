# pg_dump/pg_restore: backups reales

- **Módulo:** Carga masiva y operación
- **Slug:** `pg-dump-pg-restore-backups-reales` (autogenerado del título)
- **Orden:** 580
- **Fuentes:** [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html) — ver `contenido/postgresql/TEMARIO.md` #18

---

## Qué es y para qué sirve

`pg_dump` y `pg_restore` son programas de línea de comandos, no sentencias SQL — no hay forma de ejecutarlos dentro de este laboratorio en el navegador. Esta lección es conceptual, apoyada en comandos reales que ejecutarías en tu terminal, contra un Postgres de verdad. `pg_dump` produce un **backup lógico**: no copia los ficheros físicos de la base de datos, genera las sentencias (o un formato binario propio) necesarias para RECONSTRUIRLA desde cero — por eso es portable entre versiones de Postgres, e incluso entre proveedores distintos.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Formato plano (--format=plain, el de por defecto): un fichero .sql normal y corriente.", "texto": "pg_dump midb > backup.sql produce SQL legible, línea por línea — se restaura con psql -d otradb -f backup.sql. Fácil de inspeccionar a mano, pero no admite restauración selectiva ni paralela." },
    { "titulo": "Formato custom (-Fc): comprimido, y el único que pg_restore sabe manejar de verdad.", "texto": "pg_dump -Fc midb > backup.dump genera un fichero binario, comprimido — se restaura con pg_restore -d otradb backup.dump. Admite --list para ver qué contiene sin restaurar nada, y -j 4 para restaurar en paralelo con varios procesos." },
    { "titulo": "Restauración selectiva: solo una tabla, o solo el esquema.", "texto": "pg_restore -d otradb -t productos backup.dump restaura ÚNICAMENTE la tabla productos del backup completo — imposible con un backup en formato plano, que es un único bloque de SQL de principio a fin." }
  ]
}
```

## Backup lógico frente a backup físico: no es lo mismo

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los backups automáticos de Supabase NO usan pg_dump",
  "contenido": "Es habitual asumir que un backup automático diario de una plataforma gestionada es \"un pg_dump programado\". No lo es: los backups nativos de Supabase son físicos (una copia del propio volumen de disco), y su Point-in-Time Recovery reproduce el WAL (el mismo log de escritura del módulo de particionado y de RLS) para reconstruir un instante exacto. pg_dump sigue teniendo su sitio: exportar datos hacia OTRO proveedor, guardar una copia portable antes de una migración grande, o generar un dump de desarrollo a partir de producción."
}
```

## Por qué lógico y físico no son intercambiables

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Lógico (pg_dump): portable, pero lento en bases enormes.", "texto": "Al reconstruir fila por fila (o con COPY internamente), un pg_dump/restore de una base de cientos de GB puede tardar horas — pero el resultado funciona igual en una versión de Postgres distinta, o en un proveedor distinto." },
    { "titulo": "Físico (copia de los ficheros / WAL): rapidísimo, pero rígido.", "texto": "Restaurar una copia física es tan rápido como copiar los ficheros de vuelta — pero exige la MISMA versión mayor de Postgres, la misma arquitectura de CPU, y normalmente el mismo sistema operativo. No es portable entre proveedores." },
    { "titulo": "La pregunta que decide cuál usar.", "texto": "¿Necesitas restaurar RÁPIDO, en el mismo sitio donde ocurrió el desastre? Físico. ¿Necesitas LLEVARTE los datos a otro sitio, otra versión, u otro proveedor? Lógico, con pg_dump." }
  ]
}
```

## Ejercicios

1. Si tuvieras que migrar una base de datos de Postgres 15 a Postgres 17 en un proveedor distinto, ¿usarías un backup físico o uno lógico? ¿Por qué el otro tipo probablemente ni siquiera funcionaría?
2. ¿Por qué `pg_restore -t productos backup.dump` (restaurar solo una tabla) no tiene equivalente sencillo con un dump en formato plano (`--format=plain`)?
3. Un backup lógico con `pg_dump` capturado a las 3:00 AM no incluye ningún cambio hecho a las 3:15 AM. Si el desastre ocurre a las 3:20 AM, ¿qué mecanismo del módulo anterior (piensa en el WAL) permitiría recuperar también esos 20 minutos, y por qué `pg_dump` por sí solo no puede?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "pg_dump",
      "descripcion": "Referencia oficial completa de pg_dump: formatos de salida, opciones de filtrado, y su relación con pg_restore.",
      "url": "https://www.postgresql.org/docs/current/app-pgdump.html",
      "etiqueta": "PostgreSQL"
    },
    {
      "titulo": "Database Backups — Supabase Docs",
      "descripcion": "Cómo funcionan realmente los backups nativos de Supabase (físicos) frente a Point-in-Time Recovery (WAL) y cuándo usar pg_dump en su lugar.",
      "url": "https://supabase.com/docs/guides/platform/backups",
      "etiqueta": "Supabase"
    }
  ]
}
```
