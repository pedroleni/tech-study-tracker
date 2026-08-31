# Autovacuum: qué hace solo y cuándo hay que intervenir (VACUUM FULL)

- **Módulo:** Mantenimiento: VACUUM
- **Slug:** `autovacuum-y-vacuum-full` (autogenerado del título)
- **Orden:** 330
- **Fuentes:** [VACUUM](https://www.postgresql.org/docs/current/sql-vacuum.html) — ver `contenido/postgresql/TEMARIO.md` #12

---

## Qué es y para qué sirve

En una base de datos de producción real, casi nunca hace falta lanzar `VACUUM` a mano — un proceso en segundo plano llamado **autovacuum** vigila cada tabla y ejecuta `VACUUM` (y `ANALYZE`) automáticamente cuando detecta suficientes filas muertas o cambios. Pero el `VACUUM` normal tiene un límite real: reutiliza el espacio muerto internamente, sin reducir jamás el tamaño del fichero en disco. Para eso existe una variante distinta: `VACUUM FULL`.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "DELETE no libera espacio al sistema operativo, ni siquiera con VACUUM normal",
  "esquemaSql": "CREATE TABLE t (id serial primary key, datos text);\nINSERT INTO t (datos) SELECT repeat('x', 500) FROM generate_series(1, 500);\nDELETE FROM t;",
  "consulta": "SELECT pg_total_relation_size('t') AS bytes_tras_delete",
  "anotaciones": [
    { "fragmento": "DELETE FROM t;", "nota": "Borra las 500 filas — pero, igual que un UPDATE, no las quita físicamente del fichero: las marca como muertas. El tamaño real del fichero, medido en el resultado, sigue reflejando las 500 filas que ya no existen lógicamente." }
  ]
}
```

## `VACUUM FULL` sí reescribe el fichero desde cero

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Ejecuta VACUUM FULL t; tal cual — confirma que no da ningún error. A diferencia de VACUUM normal (lección anterior), FULL reescribe físicamente el fichero completo, sin las filas muertas.",
  "esquemaSql": "CREATE TABLE t (id serial primary key, datos text);\nINSERT INTO t (datos) SELECT repeat('x', 500) FROM generate_series(1, 500);\nDELETE FROM t;",
  "consultaInicial": "",
  "consultaSolucion": "VACUUM FULL t"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "VACUUM FULL bloquea la tabla entera mientras se ejecuta — no es gratis",
  "contenido": "Para reescribir físicamente el fichero de la tabla desde cero, VACUUM FULL necesita un bloqueo exclusivo sobre ella — nada puede leerla ni escribirla mientras dura. En una tabla grande de producción, eso puede significar minutos de indisponibilidad real. Por eso NO es lo que hace autovacuum de forma rutinaria — autovacuum solo lanza VACUUM normal, nunca FULL, precisamente para no bloquear nada. VACUUM FULL es una intervención manual, deliberada, normalmente en una ventana de mantenimiento."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que el tamaño real del fichero sigue reflejando las 500 filas ya borradas — el `DELETE` por sí solo no lo redujo.
2. ¿Por qué autovacuum, que se ejecuta constantemente y sin avisar, nunca lanza `VACUUM FULL` por su cuenta?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "VACUUM",
      "descripcion": "Referencia oficial completa del comando VACUUM, incluida la opción FULL.",
      "url": "https://www.postgresql.org/docs/current/sql-vacuum.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
