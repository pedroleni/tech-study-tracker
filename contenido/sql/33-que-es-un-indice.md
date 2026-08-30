# Qué es un índice y cómo acelera una consulta

- **Módulo:** Índices y rendimiento
- **Slug:** `que-es-un-indice` (autogenerado del título)
- **Orden:** 330
- **Fuentes:** [CREATE INDEX](https://sqlite.org/lang_createindex.html) — ver `contenido/sql/TEMARIO.md` #33

---

## Qué es y para qué sirve

Un índice es una estructura auxiliar que el motor mantiene para encontrar filas por el valor de una columna **sin recorrerlas todas**. Es exactamente el mismo concepto que el índice alfabético al final de un libro: en vez de leer página por página buscando una palabra, se salta directo a donde está.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Crear un índice sobre email",
  "esquemaSql": "CREATE TABLE usuarios (id INTEGER PRIMARY KEY, email TEXT, pais TEXT);\nINSERT INTO usuarios VALUES (1, 'ana@ejemplo.com', 'ES'), (2, 'luis@ejemplo.com', 'MX');",
  "consulta": "CREATE INDEX idx_usuarios_email ON usuarios(email);\nSELECT * FROM usuarios WHERE email = 'ana@ejemplo.com';",
  "anotaciones": [
    { "fragmento": "CREATE INDEX idx_usuarios_email ON usuarios(email)", "nota": "Crea un índice llamado idx_usuarios_email sobre la columna email de usuarios — a partir de aquí, buscar por email es mucho más rápido en una tabla grande." }
  ]
}
```

## La diferencia real, vista con `EXPLAIN QUERY PLAN`

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "EXPLAIN QUERY PLAN\nSELECT * FROM usuarios WHERE pais = 'ES';\n\n-- \"SCAN usuarios\"\n-- (sin índice en pais: recorre TODAS las filas)",
  "despues": "EXPLAIN QUERY PLAN\nSELECT * FROM usuarios WHERE email = 'ana@ejemplo.com';\n\n-- \"SEARCH usuarios USING INDEX idx_usuarios_email (email=?)\"\n-- (con índice en email: va directo a la fila)",
  "nota": "Verificado ejecutando EXPLAIN QUERY PLAN de verdad sobre las dos consultas: SCAN recorre la tabla entera; SEARCH...USING INDEX usa el índice para ir directo. La lección 35 profundiza en EXPLAIN QUERY PLAN."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que un índice acelera CUALQUIER consulta sobre esa columna.", "texto": "Un índice ayuda sobre todo con WHERE, JOIN y ORDER BY que usen la columna indexada — no acelera, por ejemplo, un cálculo sobre esa columna (UPPER(email) = ... ya no puede usar un índice normal sobre email)." },
    { "titulo": "Crear un índice y no comprobar nunca si de verdad se usa.", "texto": "EXPLAIN QUERY PLAN (lección 35) es la forma real de confirmarlo — un índice mal diseñado puede existir sin que el motor lo use nunca para una consulta concreta." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Crea un índice llamado idx_usuarios_pais sobre la columna pais de usuarios.",
  "esquemaSql": "CREATE TABLE usuarios (id INTEGER PRIMARY KEY, email TEXT, pais TEXT);\nINSERT INTO usuarios VALUES (1, 'ana@ejemplo.com', 'ES'), (2, 'luis@ejemplo.com', 'MX');",
  "consultaInicial": "",
  "consultaSolucion": "CREATE INDEX idx_usuarios_pais ON usuarios(pais)"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CREATE INDEX",
      "descripcion": "Referencia oficial completa de la sentencia CREATE INDEX.",
      "url": "https://sqlite.org/lang_createindex.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
