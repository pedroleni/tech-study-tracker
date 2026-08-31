# Qué es RLS y el problema real que resuelve

- **Módulo:** Row Level Security (RLS)
- **Slug:** `que-es-rls-y-el-problema-real-que-resuelve` (autogenerado del título)
- **Orden:** 450
- **Fuentes:** [5.9. Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — ver `contenido/postgresql/TEMARIO.md` #14

---

## Qué es y para qué sirve

`GRANT`/`REVOKE` (módulo anterior) controlan el acceso **tabla por tabla**: o puedes ver toda la tabla `posts`, o no puedes ver nada. Pero una aplicación real casi nunca necesita eso — necesita que cada usuario vea solo SUS PROPIAS filas dentro de una misma tabla compartida. Sin ayuda de la base de datos, esa regla ("`WHERE autor_id = usuario_actual`") tendría que repetirse a mano en cada consulta que escriba la aplicación — y basta con olvidarla en un solo sitio para filtrar datos ajenos. **Row Level Security (RLS)** mueve esa regla dentro de la propia base de datos, como una política que se aplica sola, siempre, sin que quien escribe la consulta tenga que acordarse de nada.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "El riesgo real sin RLS: un GRANT amplio ve todo, siempre",
  "esquemaSql": "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);\nINSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana 1'), ('ana', 'Post de Ana 2'), ('roberto', 'Post de Roberto');\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT ON posts TO app_user;\nSET ROLE app_user;",
  "consulta": "SELECT autor_id, titulo FROM posts ORDER BY autor_id, titulo",
  "anotaciones": [
    { "fragmento": "GRANT SELECT ON posts TO app_user;", "nota": "Este es el mismo GRANT tabla-completa del módulo anterior — app_user puede leer posts, punto. Nada distingue \"sus\" filas de las de cualquier otro autor." },
    { "fragmento": "SET ROLE app_user;", "nota": "app_user representa la conexión que usa la propia aplicación (no un usuario final concreto) — y esta consulta no lleva ningún WHERE por autor. El resultado incluye TODAS las filas, de todos los autores: exactamente el riesgo que RLS existe para evitar." }
  ]
}
```

## La solución: una política que se aplica sola, sin que la consulta la mencione

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "etiquetaSeccion": "SQL en vivo — cambia de identidad y compara",
  "consigna": "Cambia de identidad arriba (Ana / Roberto) y ejecuta la misma consulta, sin ningún WHERE. Fíjate en qué filas devuelve cada quien.",
  "esquemaSql": "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);\nINSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana 1'), ('ana', 'Post de Ana 2'), ('roberto', 'Post de Roberto');\nCREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE;\nALTER TABLE posts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"solo ver los propios posts\" ON posts FOR SELECT USING (autor_id = auth_uid());\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT ON posts TO app_user;",
  "identidadSimulada": [
    { "etiqueta": "Ana", "valor": "ana" },
    { "etiqueta": "Roberto", "valor": "roberto" }
  ],
  "consultaInicial": "SELECT titulo FROM posts ORDER BY titulo",
  "consultaSolucion": "SELECT titulo FROM posts ORDER BY titulo"
}
```

## Por qué esto es distinto de un simple GRANT

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La misma consulta exacta, dos resultados distintos — sin ningún WHERE",
  "contenido": "Fíjate en algo clave: la consulta del bloque de arriba es SELECT titulo FROM posts, idéntica para Ana y para Roberto. Ninguna de las dos la escribió con un WHERE autor_id = .... La política CREATE POLICY es la que añade esa condición por debajo, siempre, para cualquier consulta que llegue — incluida una que la aplicación olvidara filtrar a mano. Esa es la garantía real que RLS aporta: vive en la base de datos, no en la disciplina de quien escribe cada consulta."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `app_user`, con un `GRANT SELECT` normal y sin RLS, ve las tres filas — de dos autores distintos.
2. En el segundo bloque, ejecútalo primero como Ana y anota qué títulos ves; cambia a Roberto y ejecútalo de nuevo. ¿Cuántos títulos ve cada uno?
3. Si a `app_user` NUNCA se le hubiera concedido `SELECT` sobre `posts` (sin RLS de por medio), ¿qué error real esperarías al ejecutar la consulta? Compáralo con lo que pasa cuando SÍ tiene `SELECT` pero RLS filtra las filas — ¿son el mismo tipo de "no puedo verlo"?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.9. Row Security Policies",
      "descripcion": "Capítulo oficial completo de Row Level Security: cómo se activa, qué son las políticas, y su interacción con los privilegios normales de GRANT.",
      "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
