# Políticas por operación (SELECT/INSERT/UPDATE/DELETE) y por rol

- **Módulo:** Row Level Security (RLS)
- **Slug:** `politicas-por-operacion-select-insert-update-delete-y-por-rol` (autogenerado del título)
- **Orden:** 470
- **Fuentes:** [5.9. Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — ver `contenido/postgresql/TEMARIO.md` #14

---

## Qué es y para qué sirve

Las lecciones anteriores usaron una sola política `FOR ALL` con la misma condición para todo. Pero un caso real casi nunca es tan simétrico: es habitual que la LECTURA sea más abierta que la ESCRITURA — cualquiera puede ver todos los posts públicos, pero cada quien solo puede crear o editar los suyos. Postgres permite exactamente eso: varias políticas en la misma tabla, cada una limitada a una operación concreta con `FOR SELECT` / `FOR INSERT` / `FOR UPDATE` / `FOR DELETE`, y coexisten sin pisarse.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Lectura pública, escritura restringida: dos políticas, dos reglas distintas",
  "esquemaSql": "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);\nINSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana'), ('roberto', 'Post de Roberto');\nCREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE;\nALTER TABLE posts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"lectura publica\" ON posts FOR SELECT USING (true);\nCREATE POLICY \"insertar solo lo propio\" ON posts FOR INSERT WITH CHECK (autor_id = auth_uid());\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT, INSERT ON posts TO app_user;\nGRANT USAGE, SELECT ON SEQUENCE posts_id_seq TO app_user;\nSET myapp.current_user_id = 'ana';\nSET ROLE app_user;",
  "consulta": "SELECT autor_id, titulo FROM posts ORDER BY autor_id",
  "anotaciones": [
    { "fragmento": "CREATE POLICY \"lectura publica\" ON posts FOR SELECT USING (true);", "nota": "USING (true) — sin condición real, deja pasar cualquier fila. Conectado como Ana, esta política de SELECT es la única que se evalúa para leer, y no menciona auth_uid() en absoluto." },
    { "fragmento": "CREATE POLICY \"insertar solo lo propio\" ON posts FOR INSERT WITH CHECK (autor_id = auth_uid());", "nota": "Una política totalmente distinta, solo para INSERT — INSERT no tiene filas \"existentes\" que filtrar (por eso INSERT nunca lleva USING, solo WITH CHECK sobre la fila que se está creando)." },
    { "fragmento": "SELECT autor_id, titulo FROM posts ORDER BY autor_id", "nota": "Aunque Ana solo puede INSERTAR sus propios posts, esta consulta (que solo LEE) le muestra el post de Roberto también — la política de SELECT es independiente y más permisiva que la de INSERT." }
  ]
}
```

## Compruébalo: la política de INSERT sí bloquea, aunque la de SELECT no restrinja nada

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Ana intenta crear un post a nombre de Roberto. Lee el error real de WITH CHECK — y fíjate en que auth_uid() como valor, en vez de un texto fijo, siempre inserta a nombre de quien esté conectado.",
  "esquemaSql": "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);\nINSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana'), ('roberto', 'Post de Roberto');\nCREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE;\nALTER TABLE posts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"lectura publica\" ON posts FOR SELECT USING (true);\nCREATE POLICY \"insertar solo lo propio\" ON posts FOR INSERT WITH CHECK (autor_id = auth_uid());\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT, INSERT ON posts TO app_user;\nGRANT USAGE, SELECT ON SEQUENCE posts_id_seq TO app_user;\nSET myapp.current_user_id = 'ana';\nSET ROLE app_user;",
  "consultaInicial": "INSERT INTO posts (autor_id, titulo) VALUES ('roberto', 'Post falso de Ana') RETURNING id",
  "consultaSolucion": "INSERT INTO posts (autor_id, titulo) VALUES (auth_uid(), 'Post real de Ana') RETURNING id"
}
```

## El otro eje: políticas restringidas a un rol concreto con `TO`

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "TO limita a QUÉ ROL aplica la política, no a qué filas.", "texto": "`CREATE POLICY \"...\" ON tabla FOR SELECT TO auditor USING (...)` solo se evalúa cuando quien consulta es (o pertenece a) el rol auditor — cualquier otro rol simplemente no la ve, como si no existiera para él." },
    { "titulo": "Varias políticas PERMISSIVE para el mismo comando se combinan con OR.", "texto": "Si dos políticas de SELECT aplican al mismo rol, una fila es visible si CUALQUIERA de las dos la deja pasar — no hace falta que las cumpla todas. Es el comportamiento por defecto (PERMISSIVE); existe también RESTRICTIVE, que combina con AND, para añadir una restricción adicional obligatoria por encima de las permisivas." },
    { "titulo": "Sin TO, una política aplica a todos los roles.", "texto": "Omitir TO equivale a TO PUBLIC — la política se evalúa sin importar qué rol esté conectado, tal como han hecho todos los bloques de esta lección hasta ahora." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que Ana ve el post de Roberto en el resultado, aunque INSERT esté restringido.
2. Resuelve el segundo bloque y lee el error exacto del primer intento — ¿qué nombre de política menciona, si alguno?
3. ¿Por qué `INSERT INTO posts (autor_id, ...) VALUES (auth_uid(), ...)` es una forma más robusta de escribir el INSERT correcto que escribir 'ana' a mano, incluso aunque en este caso concreto ambas dieran el mismo resultado?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.9. Row Security Policies",
      "descripcion": "Sección oficial que documenta políticas por comando, el rol TO, y la diferencia entre políticas PERMISSIVE y RESTRICTIVE.",
      "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
