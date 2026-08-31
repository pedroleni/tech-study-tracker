# Roles predefinidos: pg_read_all_data y compañía

- **Módulo:** Roles, privilegios y control de acceso real
- **Slug:** `roles-predefinidos-pg-read-all-data-y-compania` (autogenerado del título)
- **Orden:** 440
- **Fuentes:** [21.5. Predefined Roles](https://www.postgresql.org/docs/current/predefined-roles.html) — ver `contenido/postgresql/TEMARIO.md` #13

---

## Qué es y para qué sirve

Postgres trae de fábrica un puñado de roles ya creados — no los creas tú, existen desde que la base de datos existe — pensados para conceder capacidades amplias y concretas sin tener que dar `SUPERUSER`, que lo puede todo sin excepción. `pg_read_all_data`, por ejemplo, da `SELECT` sobre **todas** las tablas de **todas** las bases, sin necesidad de un `GRANT` tabla por tabla.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Los roles predefinidos ya existen, sin que nadie los cree",
  "esquemaSql": "SELECT 1",
  "consulta": "SELECT rolname FROM pg_roles WHERE rolname LIKE 'pg\\_%' ORDER BY rolname",
  "anotaciones": [
    { "fragmento": "esquemaSql: SELECT 1", "nota": "A propósito, esta lección no crea NADA en esquemaSql — los roles que ves en el resultado ya venían con la base de datos, no son un experimento previo." },
    { "fragmento": "WHERE rolname LIKE 'pg\\_%'", "nota": "Todos los roles predefinidos de Postgres empiezan por pg_ — es la convención que los distingue de cualquier rol que crees tú mismo con CREATE ROLE." }
  ]
}
```

## Los más útiles en la práctica

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "pg_read_all_data / pg_write_all_data.", "texto": "Lectura (o escritura) total sobre cualquier tabla, vista o secuencia de cualquier base — el caso de uso típico es un rol de auditoría o de soporte que necesita ver todo sin poder gestionar usuarios ni cambiar configuración." },
    { "titulo": "pg_monitor.", "texto": "Acceso a las vistas de estadísticas y actividad del sistema (pg_stat_activity, pg_stat_user_tables, etc.) sin acceso a los datos de las tablas de la aplicación — perfecto para una herramienta externa de monitorización." },
    { "titulo": "pg_signal_backend.", "texto": "Permite cancelar o terminar consultas de OTRAS sesiones (pg_cancel_backend, pg_terminate_backend) sin ser superusuario — útil para un rol de soporte que necesita poder matar una consulta colgada." }
  ]
}
```

## Compruébalo: acceso real sin ningún GRANT tabla por tabla

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "auditor recibió pg_read_all_data, pero NUNCA se le concedió SELECT sobre finanzas específicamente. Consulta la tabla finanzas como auditor y confirma que sí puede leerla.",
  "esquemaSql": "CREATE TABLE finanzas (id serial primary key, cifra numeric);\nINSERT INTO finanzas (cifra) VALUES (999999);\nCREATE ROLE auditor NOSUPERUSER;\nGRANT auditor TO current_user;\nGRANT pg_read_all_data TO auditor;\nSET ROLE auditor;",
  "consultaInicial": "",
  "consultaSolucion": "SELECT cifra FROM finanzas"
}
```

## Ejercicios

1. Ejecuta el primer bloque y localiza `pg_read_all_data`, `pg_monitor` y `pg_signal_backend` en la lista.
2. Resuelve el segundo bloque y confirma que `auditor` lee `999999` sin que ningún `GRANT SELECT ON finanzas` haya existido nunca en el `esquemaSql`.
3. ¿Por qué `GRANT pg_read_all_data TO un_rol` es preferible a hacer que ese rol sea `SUPERUSER` cuando lo único que necesita es leer datos con fines de auditoría?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "21.5. Predefined Roles",
      "descripcion": "Tabla oficial completa de todos los roles predefinidos de Postgres y qué concede cada uno.",
      "url": "https://www.postgresql.org/docs/current/predefined-roles.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
