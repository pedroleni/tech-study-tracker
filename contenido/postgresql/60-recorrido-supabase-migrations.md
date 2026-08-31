# Recorrido real por supabase/migrations/

- **Módulo:** Cierre: cómo está construido este propio proyecto sobre Postgres
- **Slug:** `recorrido-real-por-supabase-migrations` (autogenerado del título)
- **Orden:** 600
- **Fuentes:** `supabase/migrations/` de este propio repositorio + `.agents/skills/supabase-postgres-best-practices/` (fuentes internas) — ver `contenido/postgresql/TEMARIO.md` #19

---

## Qué es y para qué sirve

Ya viste RLS de verdad (módulo 14) y `SECURITY DEFINER` de pasada (lección 48). Queda un tercer pilar, tan real como los otros dos y mucho menos glamuroso: **indexar las columnas de clave foránea**. Postgres NO lo hace automáticamente — y `0001_init.sql`, la primera migración de este propio proyecto, lo hace explícitamente para `technologies.category_id` y `technologies.user_id`. Esta lección reproduce por qué, con el mismo diagnóstico que usarías en un proyecto real.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "El mismo diagnóstico real: encontrar claves foráneas sin indexar",
  "esquemaSql": "CREATE TABLE categorias (id serial primary key, nombre text);\nCREATE TABLE tecnologias (id serial primary key, categoria_id int references categorias(id) on delete cascade, nombre text);\nINSERT INTO categorias (nombre) VALUES ('Backend');\nINSERT INTO tecnologias (categoria_id, nombre) VALUES (1, 'PostgreSQL');",
  "consulta": "SELECT conrelid::regclass AS tabla, a.attname AS columna_fk FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) WHERE c.contype = 'f' AND NOT EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey))",
  "anotaciones": [
    { "fragmento": "categoria_id int references categorias(id) on delete cascade", "nota": "Una clave foránea real, con ON DELETE CASCADE — el mismo patrón que tecnologias.category_id en el proyecto real, referenciando categories(id)." },
    { "fragmento": "WHERE c.contype = 'f'", "nota": "pg_constraint guarda TODAS las restricciones (primary key, unique, check, foreign key...); 'f' filtra solo las de clave foránea." },
    { "fragmento": "NOT EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey))", "nota": "Comprueba, para cada columna de clave foránea, si existe ALGÚN índice que la cubra — si no existe ninguno, esta fila aparece en el resultado: una clave foránea sin indexar, real, detectada con SQL normal." }
  ]
}
```

## Compruébalo: el mismo esquema, con el índice que sí tiene el proyecto real

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Añade el índice que falta (create index tecnologias_categoria_id_idx on tecnologias(categoria_id);) al esquemaSql y confirma que el diagnóstico ya no encuentra nada.",
  "esquemaSql": "CREATE TABLE categorias (id serial primary key, nombre text);\nCREATE TABLE tecnologias (id serial primary key, categoria_id int references categorias(id) on delete cascade, nombre text);\nINSERT INTO categorias (nombre) VALUES ('Backend');\nINSERT INTO tecnologias (categoria_id, nombre) VALUES (1, 'PostgreSQL');",
  "consultaInicial": "SELECT conrelid::regclass AS tabla, a.attname AS columna_fk FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) WHERE c.contype = 'f' AND NOT EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey))",
  "consultaSolucion": "SELECT conrelid::regclass AS tabla, a.attname AS columna_fk FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey) WHERE c.contype = 'f' AND NOT EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey))"
}
```

## Los tres pilares reales, y dónde viven en este repositorio

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "RLS en cada tabla, sin excepción — supabase/migrations/0001_init.sql en adelante.", "texto": "categories, technologies, profiles, comments, favorites, user_technology_progress, user_leccion_progress: todas con alter table ... enable row level security; nada más crearse. Ver el módulo 14 completo de este track." },
    { "titulo": "SECURITY DEFINER, solo donde hace falta saltarse RLS a propósito — 0002_profiles.sql y 0003_public_docs.sql.", "texto": "handle_new_user() (crea el perfil al registrarse) y private.is_admin() (resuelve el rol sin exponer la tabla profiles entera) son las dos únicas funciones con privilegios elevados — todo lo demás respeta RLS como cualquier consulta normal." },
    { "titulo": "Índices en cada clave foránea — 0001_init.sql, 0003_public_docs.sql, 0006_progress.sql, 0008_leccion_progress.sql.", "texto": "technologies_category_id_idx, comments_user_id_idx, favorites_technology_id_idx, user_technology_progress_user_id_idx... cada tabla nueva del proyecto repite el mismo hábito: ninguna clave foránea se queda sin su índice." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `tecnologias.categoria_id` aparece en el resultado — sin índice, de verdad.
2. Resuelve el segundo bloque añadiendo el índice al `esquemaSql` y confirma que el diagnóstico queda vacío.
3. Busca en `supabase/migrations/0001_init.sql` la línea exacta que crea `technologies_category_id_idx` — ¿aparece antes o después de `alter table technologies enable row level security;`? ¿Importa el orden entre las dos, o son independientes?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "supabase/migrations/0001_init.sql",
      "descripcion": "La primera migración real de este proyecto: categories, technologies, sus índices de clave foránea, y el ENABLE ROW LEVEL SECURITY inicial.",
      "url": "https://github.com/pedroleni/tech-study-tracker/blob/main/supabase/migrations/0001_init.sql",
      "etiqueta": "Interno"
    },
    {
      "titulo": "Index Foreign Key Columns",
      "descripcion": "La guía interna de buenas prácticas que documenta por qué y cómo se indexan las claves foráneas en este proyecto.",
      "url": "https://github.com/pedroleni/tech-study-tracker/blob/main/.agents/skills/supabase-postgres-best-practices/references/schema-foreign-key-indexes.md",
      "etiqueta": "Interno"
    }
  ]
}
```
