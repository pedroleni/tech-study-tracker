# Roles a fondo: CREATE ROLE, LOGIN, pertenencia a grupos

- **Módulo:** Roles, privilegios y control de acceso real
- **Slug:** `roles-a-fondo` (autogenerado del título)
- **Orden:** 420
- **Fuentes:** [CREATE ROLE](https://www.postgresql.org/docs/current/sql-createrole.html) — ver `contenido/postgresql/TEMARIO.md` #13

---

## Qué es y para qué sirve

SQLite no tiene ningún concepto de "quién eres" — es un fichero, y quien tenga permiso del sistema operativo para leerlo puede leer todo. Postgres sí: **`CREATE ROLE`** crea una identidad real dentro de la propia base de datos, y esa identidad puede ser dos cosas a la vez (o por separado) — alguien que se conecta (`LOGIN`) o un simple contenedor de permisos que otros roles heredan (un "grupo", sin `LOGIN`). Postgres unificó hace años los conceptos de "usuario" y "grupo" en uno solo: un rol.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un rol que puede conectarse y un rol que solo agrupa permisos",
  "esquemaSql": "CREATE ROLE ana LOGIN PASSWORD 'x123';\nCREATE ROLE equipo_ventas NOLOGIN;\nGRANT equipo_ventas TO ana;",
  "consulta": "SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname IN ('ana', 'equipo_ventas') ORDER BY rolname",
  "anotaciones": [
    { "fragmento": "CREATE ROLE ana LOGIN PASSWORD 'x123';", "nota": "ana es un rol que puede conectarse de verdad a la base de datos — LOGIN es lo que la convierte en lo que normalmente llamarías \"un usuario\"." },
    { "fragmento": "CREATE ROLE equipo_ventas NOLOGIN;", "nota": "equipo_ventas NUNCA se conecta a nada — no tiene contraseña, no tiene LOGIN. Solo existe para agrupar permisos, exactamente lo que otros sistemas llaman \"un grupo\"." },
    { "fragmento": "GRANT equipo_ventas TO ana;", "nota": "Esta es la sintaxis real de pertenencia: GRANT de un rol A otro rol (no de un privilegio) hace que ana herede automáticamente todo lo que se le conceda a equipo_ventas, sin repetir cada GRANT individual." }
  ]
}
```

## Un mismo comando, dos usos: privilegio o pertenencia

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "GRANT tiene dos formas, y es fácil confundirlas",
  "contenido": "`GRANT SELECT ON tabla TO rol` concede un privilegio sobre un objeto. `GRANT rol_a TO rol_b` concede PERTENENCIA a otro rol — hace que rol_b se convierta en miembro de rol_a y herede sus privilegios (y, con LOGIN, sus roles heredados). Es la misma palabra clave, GRANT, para dos operaciones conceptualmente distintas — el objeto que sigue a ON o la ausencia de ON es lo que las distingue."
}
```

## Compruébalo: quién pertenece a equipo_ventas

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Se crearon dos roles LOGIN (ana y luis) y ambos se añadieron a equipo_ventas. Consulta pg_auth_members (la tabla real de pertenencias) para listar los nombres de los miembros de equipo_ventas, ordenados alfabéticamente.",
  "esquemaSql": "CREATE ROLE equipo_ventas NOLOGIN;\nCREATE ROLE ana LOGIN;\nCREATE ROLE luis LOGIN;\nGRANT equipo_ventas TO ana;\nGRANT equipo_ventas TO luis;",
  "consultaInicial": "",
  "consultaSolucion": "SELECT r.rolname FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.member JOIN pg_roles g ON g.oid = m.roleid WHERE g.rolname = 'equipo_ventas' ORDER BY r.rolname"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma: `ana` tiene `rolcanlogin = true`, `equipo_ventas` tiene `rolcanlogin = false`.
2. Resuelve el segundo bloque y confirma que la lista de miembros es exactamente `ana` y `luis`, ni uno más.
3. `pg_roles` es una vista del sistema, no una tabla que tú crees — ¿por qué tiene sentido que Postgres exponga los roles como una vista consultable con SQL normal, en vez de un comando especial aparte?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CREATE ROLE",
      "descripcion": "Referencia oficial completa de CREATE ROLE: todas las opciones (LOGIN, SUPERUSER, PASSWORD, límites de conexión, fecha de expiración).",
      "url": "https://www.postgresql.org/docs/current/sql-createrole.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
