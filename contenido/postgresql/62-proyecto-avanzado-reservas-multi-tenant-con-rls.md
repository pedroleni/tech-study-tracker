# Proyecto avanzado: reservas multi-tenant con Row Level Security

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-reservas-multi-tenant-con-row-level-security` (autogenerado del título)
- **Orden:** 620
- **Repositorio:** [github.com/pedroleni/postgresql-proyectos-avanzados](https://github.com/pedroleni/postgresql-proyectos-avanzados) (carpeta `reservas-multi-tenant-rls`)
- **Requiere:** Módulo 13 (Roles, privilegios y control de acceso real) y Módulo 14 (Row Level Security) de este mismo temario

---

## Qué vas a construir

Un sistema de reservas de salas de reuniones donde varias organizaciones comparten la misma base de datos — pero cada una solo puede ver y modificar SUS PROPIAS salas y reservas, aunque el código de la aplicación no filtre nada por organización. Es exactamente el problema que resuelve Row Level Security, contra un Postgres real (vía Docker), con tests que lo demuestran.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/postgresql-proyectos-avanzados (carpeta reservas-multi-tenant-rls) — rama main con el esquema, los roles y toda la aplicación completos; solo las políticas RLS de migrations/003_rls.sql están recortadas a using(false)/with check(false). Rama solucion con las políticas completas."
}
```

## El punto de partida: `using (false)` deniega todo, a propósito

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\ncreate policy salas_por_organizacion\n  on public.salas\n  for all\n  to app_user\n  using (false)   -- TODO: sustituye por la condicion real\n  with check (false); -- TODO: sustituye por la condicion real\n</script>",
  "anotaciones": [
    { "fragmento": "using (false)", "nota": "Con RLS activado y una política que nunca deja pasar ninguna fila, app_user no ve absolutamente nada — ni siquiera sus propios datos. npm test falla ya en el propio seed, antes de llegar a ningún test real: es la señal de que el ejercicio no está resuelto." },
    { "fragmento": "for all\n  to app_user", "nota": "FOR ALL cubre SELECT/INSERT/UPDATE/DELETE con la misma condición a la vez — y TO app_user limita la política a ese rol concreto, el mismo que src/db.ts activa con SET ROLE antes de cada operación." }
  ]
}
```

## La pieza que ya está resuelta: cómo se simula la identidad de cada organización

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nexport async function clienteComoOrg(orgId) {\n  const client = await poolAdministracion.connect();\n  await client.query(\n    \"select set_config('app.current_org_id', $1, false)\",\n    [orgId],\n  );\n  await client.query('set role app_user');\n  return client;\n}\n</script>",
  "anotaciones": [
    { "fragmento": "await client.query('set role app_user');", "nota": "poolAdministracion se conecta como superusuario (necesario para migrar/sembrar datos) — un superusuario se salta RLS SIEMPRE, con o sin FORCE ROW LEVEL SECURITY. Sin este SET ROLE, ninguna política de la lección anterior se aplicaría nunca." },
    { "fragmento": "set_config('app.current_org_id', $1, false)", "nota": "El mismo mecanismo que ya usaste en las lecciones de RLS del track (allí, current_setting/set_config sobre myapp.current_user_id) — aquí es la variable que lee current_org_id(), la función que las políticas consultan." }
  ]
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Levanta Postgres y aplica las migraciones.", "texto": "Clona postgresql-proyectos-avanzados, entra en reservas-multi-tenant-rls/ y ejecuta docker compose up -d, npm install, npm run migrate — el esquema, los roles y la función current_org_id() quedan listos." },
    { "titulo": "Ejecuta los tests tal cual — deben fallar.", "texto": "npm test falla ya al crear la primera sala (WITH CHECK rechaza todo). Es el punto de partida correcto, no un error tuyo." },
    { "titulo": "Completa las dos políticas y vuelve a correr los tests.", "texto": "Sustituye using(false)/with check(false) por organizacion_id = current_org_id() en ambas políticas de migrations/003_rls.sql, aplica las migraciones sobre una base limpia y confirma que los 5 tests pasan." }
  ]
}
```

## Un gotcha real de este proyecto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El último test demuestra el riesgo, no lo evita",
  "contenido": "El quinto test consulta directamente con poolAdministracion (superusuario, sin SET ROLE) y confirma que ese cliente SÍ ve las filas de ambas organizaciones. No es un fallo — es la prueba, dentro del propio proyecto, de por qué app_user (no-superusuario) es imprescindible: cualquier conexión con privilegios de superusuario ignora RLS por completo, sin excepción."
}
```

## Retos para ampliarlo

1. Añade una tabla `miembros_organizacion` (usuario_id + organizacion_id) y una política donde `current_org_id()` se derive de qué organizaciones pertenece el usuario actual, en vez de fijarse a mano por conexión.
2. Añade un rol `auditor_global` (como en la lección de roles predefinidos) con `pg_read_all_data` que pueda leer todas las organizaciones a la vez, sin `SET ROLE app_user` — y un test que confirme que ese rol sí ve todo.
3. Combínalo con la lección de políticas por operación (47): separa la política `FOR ALL` en una `FOR SELECT` más abierta (por ejemplo, salas visibles para toda la organización) y una `FOR INSERT/UPDATE/DELETE` más estricta.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "postgresql-proyectos-avanzados/reservas-multi-tenant-rls (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en reservas-multi-tenant-rls/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/postgresql-proyectos-avanzados/tree/main/reservas-multi-tenant-rls",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "postgresql-proyectos-avanzados/reservas-multi-tenant-rls (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/postgresql-proyectos-avanzados/tree/solucion/reservas-multi-tenant-rls",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "5.9. Row Security Policies",
      "descripcion": "Referencia oficial de Postgres sobre RLS, ya usada en el módulo 14 de este track.",
      "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
