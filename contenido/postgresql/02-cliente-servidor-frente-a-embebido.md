# Cliente-servidor frente a embebido: qué cambia de verdad al usar Postgres

- **Módulo:** Qué es PostgreSQL, y de un motor embebido a uno de producción real
- **Slug:** `cliente-servidor-frente-a-embebido-que-cambia-de-verdad-al-usar-postgres` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [PostgreSQL Documentation](https://www.postgresql.org/docs/current/index.html) — ver `contenido/postgresql/TEMARIO.md` #2

---

## Qué es y para qué sirve

SQLite es un motor **embebido**: la base de datos entera es un fichero, y el código de SQLite se carga dentro del propio proceso de la aplicación — no hay ningún proceso servidor aparte, ni ninguna conexión de red. PostgreSQL es **cliente-servidor**: hay un proceso `postgres` real corriendo, escuchando en un puerto de red (5432 por defecto), y cualquier aplicación que quiera hablar con él abre una conexión — puede ser la misma máquina, o cualquier otra en la red.

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n// SQLite: la \"conexión\" es abrir un fichero local\nconst db = new Database('mi-app.sqlite');\n// El código de SQLite corre DENTRO del proceso de tu app\n</script>",
  "despues": "<script>\n// Postgres: la conexión es de verdad, por red, a otro proceso\nconst client = new Client({\n  host: 'db.miempresa.com',\n  port: 5432,\n  user: 'app_user',\n  password: '...',\n  database: 'produccion',\n});\nawait client.connect();\n</script>",
  "nota": "No es solo una diferencia de API — es una diferencia real de arquitectura. Con SQLite, si tu proceso se cae, la base de datos sigue en disco tal cual. Con Postgres, el servidor sigue vivo y sirviendo a otros clientes aunque UNA aplicación cliente se caiga."
}
```

## Qué gana un modelo cliente-servidor

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Muchos clientes a la vez, de verdad.", "texto": "Docenas de servidores de aplicación, varios lenguajes distintos, conectándose todos al mismo Postgres al mismo tiempo — el propio servidor gestiona la concurrencia (Módulo de MVCC, más adelante en este temario)." },
    { "titulo": "Los datos viven separados de cualquier aplicación concreta.", "texto": "Puedes reiniciar, actualizar o incluso sustituir por completo tu aplicación sin tocar el servidor de base de datos — con SQLite, el fichero está tan acoplado a la app que lo consume que normalmente vive dentro de su propio despliegue." },
    { "titulo": "Control de acceso real por conexión.", "texto": "Cada conexión se autentica con un usuario y una contraseña reales — Postgres sabe exactamente quién le está hablando en cada momento (Módulo de roles, más adelante)." }
  ]
}
```

## Un vistazo real al propio servidor

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Lo que el servidor sabe de la conexión actual",
  "esquemaSql": "-- Nada que crear: esta consulta solo pregunta al servidor por metadatos de sí mismo.",
  "consulta": "SELECT current_database() AS base_de_datos, current_user AS usuario_conectado",
  "anotaciones": [
    { "fragmento": "current_database()", "nota": "En Postgres, un mismo servidor puede alojar VARIAS bases de datos distintas (con sus propias tablas cada una) — algo que no tiene ningún sentido en SQLite, donde un fichero ES la base de datos entera." },
    { "fragmento": "current_user", "nota": "El usuario con el que esta conexión concreta se autenticó — un concepto real de \"quién me está hablando\" que un motor embebido, sin ninguna autenticación de por medio, no tiene." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "En este temario, PGlite simula 'un servidor', pero sigue siendo WASM en tu navegador",
  "contenido": "Cada bloque ejecutable de este temario corre PostgreSQL real compilado a WebAssembly, en tu propio navegador — no hay una conexión de red real ni un servidor separado atendiendo. Es la misma limitación que ya viste con SQL/SQLite: se prioriza que el SQL sea real y se ejecute de verdad, aunque el propio concepto de 'cliente-servidor por red' de esta lección solo pueda explicarse, no demostrarse en vivo con una conexión real."
}
```

## Ejercicios

1. Nombra dos consecuencias prácticas de que Postgres sea cliente-servidor que SQLite, por diseño, no puede tener.
2. ¿Por qué tiene sentido que `current_database()` exista como función en Postgres pero sería una pregunta sin sentido en SQLite?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "PostgreSQL Documentation",
      "descripcion": "Documentación oficial completa del servidor.",
      "url": "https://www.postgresql.org/docs/current/index.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
