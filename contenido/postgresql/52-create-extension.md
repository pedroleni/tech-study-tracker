# CREATE EXTENSION: cómo Postgres añade funcionalidad sin recompilar

- **Módulo:** Extensiones
- **Slug:** `create-extension-como-postgres-anade-funcionalidad-sin-recompilar` (autogenerado del título)
- **Orden:** 520
- **Fuentes:** [Appendix F. Additional Supplied Modules and Extensions](https://www.postgresql.org/docs/current/contrib.html) — ver `contenido/postgresql/TEMARIO.md` #16

---

## Qué es y para qué sirve

Postgres "base" ya trae mucho — pero funciones de cifrado, tipos geométricos avanzados, generadores de UUID especializados y decenas de cosas más viven en **extensiones**: código ya compilado que existe en el servidor pero está apagado hasta que alguien lo enciende con `CREATE EXTENSION`. No hace falta recompilar Postgres ni reiniciar nada — se activa (o se desactiva, con `DROP EXTENSION`) por base de datos, con una sola sentencia SQL.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "No todo necesita una extensión: gen_random_uuid() ya vive en el núcleo",
  "esquemaSql": "SELECT 1",
  "consulta": "SELECT gen_random_uuid() IS NOT NULL AS genero_un_uuid",
  "anotaciones": [
    { "fragmento": "esquemaSql: SELECT 1", "nota": "A propósito, esta lección no activa ninguna extensión aquí — gen_random_uuid() funciona sin CREATE EXTENSION porque, desde Postgres 13, forma parte del propio núcleo del motor." },
    { "fragmento": "gen_random_uuid()", "nota": "Antes de la versión 13, generar un UUID aleatorio exigía la extensión pgcrypto o uuid-ossp — un buen recordatorio de que el límite entre \"núcleo\" y \"extensión\" se mueve con el tiempo, según qué se vuelve lo bastante universal como para merecer estar siempre disponible." }
  ]
}
```

## Lo que SÍ sigue exigiendo activar una extensión, explícitamente

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "crypt() y gen_salt() son funciones de pgcrypto, una extensión real — pero nadie la ha activado todavía en este bloque. Ejecuta la consulta y lee el error.",
  "esquemaSql": "SELECT 1",
  "consultaInicial": "SELECT crypt('hola', gen_salt('bf'))"
}
```

## Compruébalo: la misma función, tras activar la extensión de verdad

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "CREATE EXTENSION pgcrypto activa el módulo — y las funciones empiezan a existir",
  "extensiones": ["pgcrypto"],
  "esquemaSql": "CREATE EXTENSION pgcrypto;",
  "consulta": "SELECT crypt('hola', gen_salt('bf')) LIKE '$2%' AS parece_un_hash_bcrypt",
  "anotaciones": [
    { "fragmento": "CREATE EXTENSION pgcrypto;", "nota": "En un Postgres de producción real (por ejemplo, Supabase), pgcrypto normalmente ya está compilada en el propio servidor — CREATE EXTENSION solo la activa para ESTA base de datos, no instala nada nuevo en el sistema. Aquí, en el navegador, el módulo se declara aparte al cargar la lección — mismo concepto, empaquetado distinto." },
    { "fragmento": "crypt('hola', gen_salt('bf'))", "nota": "Tras el CREATE EXTENSION, gen_salt('bf') y crypt() ya existen — la misma llamada que acabas de ver fallar en el bloque anterior ahora funciona, sin haber cambiado nada más que activar la extensión." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `gen_random_uuid()` funciona sin ningún `CREATE EXTENSION` de por medio.
2. Ejecuta el segundo bloque y lee el mensaje de error exacto — ¿menciona `pgcrypto`, o solo dice que la función no existe?
3. Ejecuta el tercer bloque y confirma que ahora sí funciona. ¿Qué cambió exactamente entre el segundo bloque y este?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Appendix F. Additional Supplied Modules and Extensions",
      "descripcion": "Índice oficial completo de todas las extensiones que Postgres distribuye de fábrica (contrib), con enlace a la documentación de cada una.",
      "url": "https://www.postgresql.org/docs/current/contrib.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
