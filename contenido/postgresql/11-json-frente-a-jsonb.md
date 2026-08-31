# JSON frente a JSONB: por qué JSONB casi siempre gana

- **Módulo:** JSON de verdad: JSONB
- **Slug:** `json-frente-a-jsonb-por-que-jsonb-casi-siempre-gana` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [8.14. JSON Types](https://www.postgresql.org/docs/current/datatype-json.html) — ver `contenido/postgresql/TEMARIO.md` #6

---

## Qué es y para qué sirve

En el track de SQL ya viste las funciones JSON de SQLite (JSON1) — trabajan sobre texto, reparseando la cadena JSON en cada consulta. Postgres tiene dos tipos JSON distintos, y la diferencia importa de verdad: **`json`** guarda el texto tal cual, byte a byte (incluido el espaciado y el orden exacto de las claves); **`jsonb`** lo parsea al guardarlo y lo almacena en un formato binario descompuesto — más lento al escribir, pero mucho más rápido al consultar, y es el único de los dos que se puede indexar con GIN (próxima lección).

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<script>\n-- json: guarda el texto EXACTO, tal cual se escribió\nCREATE TABLE eventos (id serial primary key, datos json);\nINSERT INTO eventos (datos) VALUES ('{\"b\": 2, \"a\": 1}');\nSELECT datos FROM eventos;\n-- Resultado: {\"b\": 2, \"a\": 1}  <- mismo orden, mismo espaciado que se escribió\n</script>",
  "despues": "<script>\n-- jsonb: se parsea y se reordena/normaliza al guardar\nCREATE TABLE eventos (id serial primary key, datos jsonb);\nINSERT INTO eventos (datos) VALUES ('{\"b\": 2, \"a\": 1}');\nSELECT datos FROM eventos;\n-- Resultado: {\"a\": 1, \"b\": 2}  <- reordenado alfabéticamente, espacios normalizados\n</script>",
  "nota": "jsonb pierde el formato textual original a propósito — a cambio, cada valor queda descompuesto en una estructura binaria que Postgres puede indexar y consultar sin volver a parsear el texto entero cada vez."
}
```

## Compruébalo tú: el mismo dato, dos tipos distintos

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Compara cómo devuelve cada tipo el mismo JSON de entrada. Selecciona ambas columnas de la tabla eventos.",
  "esquemaSql": "CREATE TABLE eventos (id serial primary key, como_json json, como_jsonb jsonb);\nINSERT INTO eventos (como_json, como_jsonb) VALUES ('{\"z\": 1, \"a\": 2}', '{\"z\": 1, \"a\": 2}');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT como_json, como_jsonb FROM eventos"
}
```

## Cuándo usar cada uno

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "jsonb, casi siempre — es la recomendación oficial de Postgres.", "texto": "Salvo que necesites preservar el texto exacto tal como llegó (auditoría legal de un payload, por ejemplo) o el orden literal de las claves importe por algún motivo externo, jsonb es la elección por defecto: se puede indexar, se consulta más rápido, y sus operadores (próxima lección) son más ricos." },
    { "titulo": "json, cuando el formato textual exacto es el dato.", "texto": "Guardar el cuerpo crudo de un webhook recibido, tal cual llegó, para verificar una firma HMAC contra ÉL (no una versión reordenada) — un caso real donde json (que preserva el texto) es la elección correcta, no jsonb." }
  ]
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y confirma con tus propios ojos: la columna `json` conserva el orden `{"z": 1, "a": 2}`, la `jsonb` lo reordena a `{"a": 2, "z": 1}`.
2. ¿Por qué firmar (HMAC) el cuerpo crudo de un webhook y guardarlo como `jsonb` sería un error real, no solo una preferencia de estilo?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "8.14. JSON Types",
      "descripcion": "Documentación oficial completa de json y jsonb: diferencias, cuándo usar cada uno.",
      "url": "https://www.postgresql.org/docs/current/datatype-json.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
