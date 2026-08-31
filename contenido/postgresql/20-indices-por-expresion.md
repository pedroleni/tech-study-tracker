# Índices por expresión

- **Módulo:** Índices más allá de B-tree
- **Slug:** `indices-por-expresion` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [65. Built-in Index Access Methods](https://www.postgresql.org/docs/current/indextypes.html) — ver `contenido/postgresql/TEMARIO.md` #8

---

## Qué es y para qué sirve

Un índice normal indexa el valor tal cual está guardado en la columna. Un **índice por expresión** indexa el RESULTADO de aplicar una función o expresión a esa columna — útil cuando las consultas reales siempre filtran por esa expresión, no por el valor crudo.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Búsquedas de email sin distinguir mayúsculas, indexadas de verdad",
  "esquemaSql": "CREATE TABLE usuarios (id serial primary key, email text);\nINSERT INTO usuarios (email) VALUES ('Ana@Ejemplo.com'), ('roberto@ejemplo.com');\nCREATE INDEX idx_usuarios_email_lower ON usuarios (lower(email));",
  "consulta": "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'usuarios'",
  "anotaciones": [
    { "fragmento": "CREATE INDEX idx_usuarios_email_lower ON usuarios (lower(email));", "nota": "No indexa email tal cual — indexa lower(email). Un índice normal sobre email no ayudaría en nada a una consulta que filtra por lower(email) = '...': son, a efectos del planificador, dos cosas completamente distintas." }
  ]
}
```

## El índice solo sirve si la consulta usa la MISMA expresión

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Confirma con EXPLAIN que buscar por lower(email) = 'ana@ejemplo.com' puede usar el índice por expresión.",
  "esquemaSql": "CREATE TABLE usuarios (id serial primary key, email text);\nINSERT INTO usuarios (email)\nSELECT 'usuario' || n || '@ejemplo.com' FROM generate_series(1, 300) AS n;\nCREATE INDEX idx_usuarios_email_lower ON usuarios (lower(email));\nSET enable_seqscan = off;",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN SELECT id FROM usuarios WHERE lower(email) = 'usuario1@ejemplo.com'"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La alternativa: normalizar el dato al guardarlo, no al consultarlo",
  "contenido": "Si TODAS tus consultas necesitan email en minúsculas, otra opción real es guardar directamente email siempre en minúsculas (con un CHECK, un trigger, o normalizándolo en la aplicación) — así un índice normal ya sirve, sin necesitar uno por expresión. Un índice por expresión tiene más sentido cuando necesitas conservar el valor original tal cual (mayúsculas incluidas) Y consultar por su versión normalizada."
}
```

## Ejercicios

1. Ejecuta el segundo bloque y confirma en el `QUERY PLAN` que usa `idx_usuarios_email_lower`.
2. ¿Por qué una consulta `WHERE email = 'usuario1@ejemplo.com'` (sin `lower()`) NO podría usar este mismo índice?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "65. Built-in Index Access Methods",
      "descripcion": "Documentación oficial de tipos de índice, incluidos los de expresión.",
      "url": "https://www.postgresql.org/docs/current/indextypes.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
