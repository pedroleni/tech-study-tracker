# Caso real: cómo protege tech-study-tracker sus propias tablas con RLS

- **Módulo:** Row Level Security (RLS)
- **Slug:** `caso-real-como-protege-tech-study-tracker-sus-propias-tablas-con-rls` (autogenerado del título)
- **Orden:** 480
- **Fuentes:** `supabase/migrations/0002_profiles.sql` y `0003_public_docs.sql` de este propio repositorio (fuentes internas) — ver `contenido/postgresql/TEMARIO.md` #14

---

## Qué es y para qué sirve

Todo lo anterior no es un ejercicio de laboratorio aislado — es literalmente cómo está protegida la base de datos real de esta aplicación, en Supabase. La política `profiles_select_own` que vas a ejecutar abajo es una versión mínima, adaptada para poder correr en el navegador, de la que existe hoy en `supabase/migrations/0002_profiles.sql`: `auth.uid()` (la función real de Supabase, ligada a la sesión autenticada) se sustituye aquí por el mismo `auth_uid()` simulado que ya usaste en todo este módulo — la lógica de la política es idéntica.

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "etiquetaSeccion": "SQL en vivo — la política real de profiles, adaptada",
  "consigna": "Cambia de identidad arriba y confirma: cada perfil solo se ve a sí mismo, ni siquiera puede saber que el otro existe.",
  "esquemaSql": "CREATE TABLE profiles (id text primary key, role text not null default 'user');\nINSERT INTO profiles (id, role) VALUES ('ana', 'user'), ('roberto', 'admin');\nCREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE;\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"profiles_select_own\" ON profiles FOR SELECT USING (id = auth_uid());\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT, UPDATE ON profiles TO app_user;",
  "identidadSimulada": [
    { "etiqueta": "Ana", "valor": "ana" },
    { "etiqueta": "Roberto", "valor": "roberto" }
  ],
  "consultaInicial": "SELECT id, role FROM profiles",
  "consultaSolucion": "SELECT id, role FROM profiles"
}
```

## El detalle que importa: NO existe política de UPDATE, a propósito

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El comentario real de la migración, literal",
  "contenido": "`0002_profiles.sql` dice, literalmente: \"Deliberadamente NO hay política de insert/update/delete: con RLS activo, lo que no tiene política queda denegado. Si existiera un for update using (id = auth.uid()), el usuario podría hacer update profiles set role = 'admin' desde el frontend con la anon key — escalada de privilegios directa.\" No es un descuido — es la ausencia de política, a propósito, la que impide que un usuario se auto-asigne el rol admin."
}
```

## Compruébalo: el intento de escalada de privilegios, en vivo

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Ana intenta ponerse role = 'admin' a sí misma con un UPDATE directo. GRANT UPDATE existe a nivel de tabla — pero no hay ninguna política de UPDATE. Ejecuta el intento y luego confirma qué quedó guardado de verdad.",
  "esquemaSql": "CREATE TABLE profiles (id text primary key, role text not null default 'user');\nINSERT INTO profiles (id, role) VALUES ('ana', 'user');\nCREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE;\nALTER TABLE profiles ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"profiles_select_own\" ON profiles FOR SELECT USING (id = auth_uid());\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT, UPDATE ON profiles TO app_user;\nSET myapp.current_user_id = 'ana';\nSET ROLE app_user;",
  "consultaInicial": "UPDATE profiles SET role = 'admin' WHERE id = 'ana' RETURNING role",
  "consultaSolucion": "SELECT role FROM profiles WHERE id = 'ana'"
}
```

## Cómo se crea entonces la fila, si el cliente no puede escribir en profiles

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Un trigger SECURITY DEFINER crea el perfil, no el cliente.", "texto": "`0002_profiles.sql` define `handle_new_user()`, un trigger `AFTER INSERT ON auth.users` que inserta la fila en `profiles` con privilegios elevados (`security definer`) — se ejecuta con los privilegios de quien lo definió, no con los del usuario que se acaba de registrar, así que no necesita ninguna política de INSERT abierta al cliente." },
    { "titulo": "El mismo patrón escala a roles administrativos reales.", "texto": "`0003_public_docs.sql` define `private.is_admin(check_id uuid)`, una función también `security definer` en un esquema `private` no expuesto por la API — las políticas de `categories`/`technologies` la llaman (`using (private.is_admin(user_id))`) para decidir qué contenido es público, en vez de comprobar el rol columna por columna en cada política." },
    { "titulo": "Esas políticas además usan TO — el mismo mecanismo de la lección anterior.", "texto": "`create policy \"categories_select_public\" on public.categories for select to anon, authenticated using (...)` — TO anon, authenticated es exactamente el TO rol que ya viste, aplicado en la base de datos que sostiene esta misma aplicación." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque como Ana y como Roberto — confirma que ninguno de los dos ve la fila del otro, ni para saber que existe.
2. Resuelve el segundo bloque: ¿el `UPDATE` lanzó algún error, o simplemente no cambió nada? ¿Por qué esa diferencia importa para quien está escribiendo el código del frontend?
3. Busca `0002_profiles.sql` y `0003_public_docs.sql` en el propio repositorio y compara el texto real de `profiles_select_own` y `categories_select_public` con lo que ejecutaste aquí — ¿qué es exactamente lo que se adaptó para que corriera en PGlite?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "supabase/migrations/0002_profiles.sql",
      "descripcion": "La migración real de este proyecto: profiles_select_own, el trigger SECURITY DEFINER que crea cada perfil, y el comentario explícito sobre la escalada de privilegios que evita.",
      "url": "https://github.com/pedroleni/tech-study-tracker/blob/main/supabase/migrations/0002_profiles.sql",
      "etiqueta": "Interno"
    },
    {
      "titulo": "supabase/migrations/0003_public_docs.sql",
      "descripcion": "private.is_admin(), el esquema private no expuesto por la API, y las políticas categories_select_public/technologies_select_public con TO anon, authenticated.",
      "url": "https://github.com/pedroleni/tech-study-tracker/blob/main/supabase/migrations/0003_public_docs.sql",
      "etiqueta": "Interno"
    }
  ]
}
```
