# Proyecto avanzado: reservas multi-tenant con Row Level Security

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-reservas-multi-tenant-con-row-level-security` (autogenerado del título)
- **Orden:** 620
- **Repositorio:** [github.com/pedroleni/postgresql-proyectos](https://github.com/pedroleni/postgresql-proyectos) (carpeta `reservas-multi-tenant-rls`)
- **Requiere:** Módulo 13 (Roles, privilegios y control de acceso real) y Módulo 14 (Row Level Security) de este mismo temario

---

## Qué vas a construir

Un sistema de reservas de salas de reuniones donde varias organizaciones comparten la misma base de datos — pero cada una solo puede ver y modificar SUS PROPIAS salas y reservas, aunque el código de la aplicación no filtre nada por organización. Es exactamente el problema que resuelve Row Level Security, contra un Postgres real (vía Docker), con tests que lo demuestran.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/postgresql-proyectos (carpeta reservas-multi-tenant-rls) — rama main con el esquema, los roles y toda la aplicación completos; solo las políticas RLS de migrations/003_rls.sql están recortadas a using(false)/with check(false). Rama solucion con las políticas completas."
}
```

## Antes de empezar

### La primera vez que sales del navegador en este temario — y la primera vez con Docker

Hasta ahora todo este curso se ha podido hacer en el editor de Postgres
embebido de la propia lección. Este proyecto es distinto: corre contra
un Postgres real en tu ordenador, dentro de un contenedor. Necesitas:

- **Node.js.** Descarga la versión **LTS** desde [nodejs.org](https://nodejs.org)
  e instálala como cualquier otro programa. Comprueba tu versión con
  `node --version` en una terminal (pide la 20 o superior).
- **Docker Desktop.** Descárgalo desde [docker.com](https://www.docker.com/products/docker-desktop/)
  e instálalo — trae Docker Compose incluido, que es lo que este
  proyecto usa para levantar Postgres con un solo comando. No hace
  falta instalar Postgres por separado: vive dentro del contenedor.
- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com)
  (gratis) es el más usado, y trae su propia terminal integrada
  (menú `Terminal` → `New Terminal`).
- **El código de este proyecto**, de una de estas dos formas:
  - **Con git**: `git clone https://github.com/pedroleni/postgresql-proyectos.git`
  - **Sin git**: entra en [github.com/pedroleni/postgresql-proyectos](https://github.com/pedroleni/postgresql-proyectos),
    botón verde **Code** → **Download ZIP**, y descomprímelo donde
    quieras.

Luego, desde `postgresql-proyectos/reservas-multi-tenant-rls`:
`docker compose up -d` para levantar Postgres y `npm install` para las
dependencias — cada carpeta de este repositorio es un proyecto
independiente con su propio `package.json`.

### Del cero a los tests pasando, paso a paso

Este proyecto no tiene servidor ni interfaz visual — todo se ve en la
terminal. Aquí el `TODO` no está en un archivo `.ts`, sino dentro de
`migrations/003_rls.sql`: las políticas RLS están recortadas a
`using(false)`/`with check(false)`. No hace falta crear ningún archivo
nuevo — todos, incluido ese, **ya existen**.

1. **Abre la carpeta del proyecto en VS Code**: menú `Archivo` →
   `Abrir carpeta...`, y elige la carpeta
   `reservas-multi-tenant-rls/` de dentro de lo que clonaste (no la
   del repositorio `postgresql-proyectos` entero).
2. **Mira el explorador de archivos**, en la barra lateral izquierda:
   dentro de `migrations/` verás `003_rls.sql` — ábrelo con un clic,
   no crees ninguno. El resto de `src/` ya está completo.
3. **Abre la terminal integrada**: menú `Terminal` → `New Terminal`
   (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
4. **Levanta Postgres**: escribe `docker compose up -d` y pulsa
   Intro — descarga la imagen la primera vez (tarda un poco) y luego
   deja el contenedor corriendo en segundo plano; te devuelve el
   cursor enseguida, no hace falta dejarlo "abierto" en primer plano.
5. **Instala las dependencias**: escribe `npm install` y pulsa Intro.
6. **Crea las tablas**: escribe `npm run migrate` y pulsa Intro —
   aplica los archivos de `migrations/` en orden, incluido el que
   tiene el `TODO`.
7. **Ejecuta los tests**: escribe `npm test` y pulsa Intro — fallan
   al principio, es tu punto de partida.
8. **El ciclo de trabajo — con un matiz importante**: abre
   `003_rls.sql`, escribe las políticas, guarda con `Cmd`/`Ctrl` +
   `S`. **`npm run migrate` NO vale para volver a aplicarlo**: el
   script recuerda qué migraciones ya ejecutó por nombre de archivo,
   así que la segunda vez la salta (verás "Omitida... (ya aplicada)"
   en la terminal) aunque hayas cambiado el contenido. Para que tu
   cambio se aplique de verdad, resetea la base de datos entera:
   ```bash
   docker compose down -v
   docker compose up -d
   npm run migrate
   npm test
   ```
   (el `-v` sí borra los datos del contenedor — es justo lo que
   quieres aquí, para partir de cero).
9. **Si quieres ver los datos con tus propios ojos**: `npm run seed`
   y luego `npm run dev` muestran, directamente en la terminal, qué
   filas ve cada organización — sin abrir ningún navegador.

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
    { "titulo": "Levanta Postgres y aplica las migraciones.", "texto": "Clona postgresql-proyectos, entra en reservas-multi-tenant-rls/ y ejecuta docker compose up -d, npm install, npm run migrate — el esquema, los roles y la función current_org_id() quedan listos." },
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
      "titulo": "postgresql-proyectos/reservas-multi-tenant-rls (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en reservas-multi-tenant-rls/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/postgresql-proyectos/tree/main/reservas-multi-tenant-rls",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "postgresql-proyectos/reservas-multi-tenant-rls (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/postgresql-proyectos/tree/solucion/reservas-multi-tenant-rls",
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
