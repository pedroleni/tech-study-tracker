# CREATE POLICY: USING frente a WITH CHECK

- **Módulo:** Row Level Security (RLS)
- **Slug:** `create-policy-using-frente-a-with-check` (autogenerado del título)
- **Orden:** 460
- **Fuentes:** [5.9. Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — ver `contenido/postgresql/TEMARIO.md` #14

---

## Qué es y para qué sirve

Una política de RLS puede llevar dos cláusulas distintas, y confundirlas es el error más común al escribir RLS: **`USING`** decide qué filas YA EXISTENTES puede ver o tocar el rol (el lado de lectura), mientras que **`WITH CHECK`** decide si una fila NUEVA o MODIFICADA se puede escribir de verdad (el lado de escritura). Para un `UPDATE`, las dos se evalúan en momentos distintos: `USING` sobre la fila antes del cambio, `WITH CHECK` sobre la fila después.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un UPDATE legítimo: pasa USING (la fila es suya) y pasa WITH CHECK (sigue siendo suya)",
  "esquemaSql": "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);\nINSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana');\nCREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE;\nALTER TABLE posts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"solo lo propio\" ON posts FOR ALL USING (autor_id = auth_uid()) WITH CHECK (autor_id = auth_uid());\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT, UPDATE ON posts TO app_user;\nSET myapp.current_user_id = 'ana';\nSET ROLE app_user;",
  "consulta": "UPDATE posts SET titulo = 'Post de Ana (editado)' WHERE autor_id = 'ana' RETURNING titulo",
  "anotaciones": [
    { "fragmento": "FOR ALL USING (autor_id = auth_uid()) WITH CHECK (autor_id = auth_uid());", "nota": "FOR ALL aplica la misma condición a SELECT, INSERT, UPDATE y DELETE a la vez — útil cuando la regla (\"solo lo tuyo\") es idéntica para las cuatro operaciones, en vez de repetir la misma expresión en cuatro CREATE POLICY distintas." },
    { "fragmento": "WHERE autor_id = 'ana' RETURNING titulo", "nota": "Ana está editando SU PROPIO post: USING deja pasar la fila (autor_id ya es 'ana', igual a auth_uid()), y como el UPDATE no toca autor_id, la fila resultante SIGUE cumpliendo WITH CHECK — por eso RETURNING sí devuelve la fila editada." }
  ]
}
```

## El gotcha real: una política solo de UPDATE, sin SELECT, deja la fila invisible para su propio WHERE

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "FOR UPDATE por sí sola no basta para que el propio UPDATE encuentre la fila",
  "contenido": "Si en vez de FOR ALL se hubiera escrito solo CREATE POLICY ... FOR UPDATE USING (...) WITH CHECK (...), sin ninguna política de SELECT, ese mismo UPDATE ... WHERE ... habría afectado CERO filas — sin ningún error, en silencio. Postgres exige que la fila también sea visible bajo una política de SELECT (o una FOR ALL, que cubre SELECT) para que UPDATE/DELETE puedan siquiera localizarla con su cláusula WHERE. Es una razón real, documentada, por la que las políticas de escritura casi siempre van acompañadas de una de lectura sobre las mismas filas."
}
```

## Compruébalo: WITH CHECK rechaza intentar "regalar" una fila a otro autor

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Ana intenta reasignar su propio post a Roberto (cambiar autor_id). USING la deja llegar a la fila (es suya), pero lee qué dice WITH CHECK sobre el resultado.",
  "esquemaSql": "CREATE TABLE posts (id serial primary key, autor_id text not null, titulo text not null);\nINSERT INTO posts (autor_id, titulo) VALUES ('ana', 'Post de Ana');\nCREATE OR REPLACE FUNCTION auth_uid() RETURNS text AS $$ SELECT current_setting('myapp.current_user_id', true); $$ LANGUAGE sql STABLE;\nALTER TABLE posts ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"solo lo propio\" ON posts FOR ALL USING (autor_id = auth_uid()) WITH CHECK (autor_id = auth_uid());\nCREATE ROLE app_user NOSUPERUSER;\nGRANT USAGE ON SCHEMA public TO app_user;\nGRANT SELECT, UPDATE ON posts TO app_user;\nSET myapp.current_user_id = 'ana';\nSET ROLE app_user;",
  "consultaInicial": "UPDATE posts SET autor_id = 'roberto' WHERE id = 1 RETURNING autor_id",
  "consultaSolucion": "SELECT autor_id FROM posts WHERE id = 1"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que el `UPDATE` legítimo (mismo `autor_id`) devuelve la fila editada.
2. Resuelve el segundo bloque y lee el mensaje de error exacto — ¿menciona la propia política violada o algo más genérico?
3. Si `WITH CHECK` se omite por completo en una política (solo se escribe `USING`), Postgres reutiliza esa misma expresión `USING` como `WITH CHECK` — ¿por qué tiene sentido ese comportamiento por defecto, en vez de dejar `WITH CHECK` sin ninguna restricción?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.9. Row Security Policies",
      "descripcion": "Sección oficial que detalla la diferencia exacta entre USING y WITH CHECK, con ejemplos por tipo de comando.",
      "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
