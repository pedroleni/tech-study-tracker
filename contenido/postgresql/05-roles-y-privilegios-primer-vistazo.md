# Roles y privilegios: primer vistazo

- **Módulo:** Qué es PostgreSQL, y de un motor embebido a uno de producción real
- **Slug:** `roles-y-privilegios-primer-vistazo` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Chapter 21. Database Roles](https://www.postgresql.org/docs/current/user-manag.html) — ver `contenido/postgresql/TEMARIO.md` #4

---

## Qué es y para qué sirve

SQLite no tiene ningún control de acceso a nivel de base de datos — es un fichero, y quien tenga permiso de lectura del fichero en el sistema operativo puede leer toda la base de datos. Postgres sí: cada conexión se identifica como un **rol**, y ese rol determina qué puede y qué no puede hacer. Un rol es, a la vez, lo que en otros sistemas llamarías "usuario" (puede tener contraseña, puede conectarse) y lo que llamarías "grupo" (otros roles pueden pertenecer a él) — Postgres unifica los dos conceptos en uno solo.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Crear un rol real y comprobar quién eres",
  "esquemaSql": "CREATE ROLE lector_informes NOSUPERUSER NOCREATEDB NOCREATEROLE;",
  "consulta": "SELECT rolname, rolsuper, rolcanlogin FROM pg_roles WHERE rolname IN ('postgres', 'lector_informes') ORDER BY rolname",
  "anotaciones": [
    { "fragmento": "CREATE ROLE lector_informes NOSUPERUSER NOCREATEDB NOCREATEROLE;", "nota": "Un rol real, creado en este momento — no un dato de ejemplo. NOSUPERUSER es la pieza más importante de esta lección: un superusuario se salta todas las restricciones de seguridad de Postgres, así que casi ningún rol de aplicación real debería serlo (más sobre esto en el módulo de Row Level Security)." },
    { "fragmento": "rolcanlogin", "nota": "Si un rol puede o no abrir una conexión — un rol pensado solo como \"grupo\" (para agrupar permisos) normalmente no puede. Fíjate en el resultado real: lector_informes sale false, aunque el CREATE ROLE de arriba no dijo nada de login." }
  ]
}
```

## Un detalle real que sorprende: `CREATE ROLE` es `NOLOGIN` por defecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "CREATE ROLE sin LOGIN explícito crea un rol que NO puede conectarse",
  "contenido": "En el bloque de arriba, lector_informes no se pudo conectar nunca (rolcanlogin = false) porque CREATE ROLE, a diferencia de CREATE USER (que es solo un alias de CREATE ROLE ... LOGIN), no da capacidad de login por defecto. Si quisieras un rol capaz de conectarse de verdad, haría falta CREATE ROLE lector_informes LOGIN PASSWORD '...' explícito."
}
```

## `rolsuper`: el dato más importante de la tabla de arriba

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un superusuario se salta las reglas, siempre",
  "contenido": "El rol postgres por defecto (el que crea Postgres al arrancar por primera vez) es superusuario — puede leer y modificar absolutamente cualquier cosa, sin excepción. Ese \"sin excepción\" incluye saltarse Row Level Security, que verás más adelante en este temario: ni siquiera activar RLS en una tabla protege sus filas de un superusuario. Los roles de aplicación reales casi nunca deberían ser superusuario."
}
```

## Roles con y sin capacidad de login

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Rol con LOGIN: una identidad que se conecta de verdad.", "texto": "CREATE ROLE app_backend LOGIN PASSWORD '...' — este es el tipo de rol que usaría, por ejemplo, el servidor de una aplicación real para conectarse a la base de datos." },
    { "titulo": "Rol sin LOGIN: un grupo de permisos, nada más.", "texto": "CREATE ROLE solo_lectura NOLOGIN — nadie se conecta directamente como este rol, pero otros roles pueden GRANT solo_lectura TO app_backend para heredar sus permisos." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma en el resultado real: ¿el rol `postgres` es superusuario? ¿Y `lector_informes`?
2. Sin escribir código todavía: ¿por qué crees que un rol pensado para que un backend de aplicación se conecte NUNCA debería tener `SUPERUSER`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Chapter 21. Database Roles",
      "descripcion": "Documentación oficial completa de roles, pertenencia a grupos y atributos.",
      "url": "https://www.postgresql.org/docs/current/user-manag.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
