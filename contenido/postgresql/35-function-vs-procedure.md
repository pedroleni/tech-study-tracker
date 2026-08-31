# CREATE FUNCTION frente a CREATE PROCEDURE

- **Módulo:** Funciones y procedimientos con PL/pgSQL
- **Slug:** `function-vs-procedure` (autogenerado del título)
- **Orden:** 350
- **Fuentes:** [CREATE PROCEDURE](https://www.postgresql.org/docs/current/sql-createprocedure.html) — ver `contenido/postgresql/TEMARIO.md` #13

---

## Qué es y para qué sirve

Ya usaste `CREATE FUNCTION` en la lección anterior. Desde la versión 11, Postgres tiene también `CREATE PROCEDURE` — una diferencia real, no solo de nombre: una función SIEMPRE devuelve un valor y se llama dentro de una expresión (`SELECT mi_funcion()`); un procedimiento no devuelve nada por sí mismo y se invoca con `CALL`, y es el único de los dos que puede controlar transacciones por dentro (`COMMIT`/`ROLLBACK` dentro de su propio cuerpo).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un procedimiento real, invocado con CALL",
  "esquemaSql": "CREATE TABLE registro (id serial primary key, mensaje text);\nCREATE PROCEDURE registrar_evento(msg text) AS $$\nBEGIN\n  INSERT INTO registro (mensaje) VALUES (msg);\nEND;\n$$ LANGUAGE plpgsql;\nCALL registrar_evento('Sistema iniciado');\nCALL registrar_evento('Usuario conectado');",
  "consulta": "SELECT id, mensaje FROM registro ORDER BY id",
  "anotaciones": [
    { "fragmento": "CREATE PROCEDURE registrar_evento(msg text) AS $$", "nota": "Sin RETURNS — un procedimiento, a diferencia de una función, no tiene ningún tipo de retorno declarado. Su trabajo son los efectos (aquí, un INSERT), no devolver un valor." },
    { "fragmento": "CALL registrar_evento('Sistema iniciado');", "nota": "CALL, no SELECT — un procedimiento no se puede invocar dentro de una expresión SELECT, solo con la sentencia CALL propia." }
  ]
}
```

## La diferencia real de fondo

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "FUNCTION: siempre devuelve algo, se usa DENTRO de una consulta.", "texto": "SELECT mi_funcion(x), WHERE columna = mi_funcion(y) — una función se comporta como cualquier función SQL nativa, componible dentro de expresiones más grandes." },
    { "titulo": "PROCEDURE: no devuelve nada por sí mismo, se ejecuta como una sentencia propia.", "texto": "CALL mi_procedimiento(x) — pensado para secuencias de pasos con efectos (varios INSERT/UPDATE relacionados), no para calcular ni devolver un valor." },
    { "titulo": "Solo PROCEDURE puede hacer COMMIT/ROLLBACK dentro de su propio cuerpo.", "texto": "Una función siempre corre dentro de la transacción de quien la llama — no puede confirmarla ni deshacerla ella misma. Un procedimiento sí puede, útil para procesos largos que necesitan ir confirmando por lotes." }
  ]
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y confirma que los dos `CALL` insertaron sus mensajes correctamente, en orden.
2. ¿Por qué `SELECT registrar_evento('otro mensaje')` (usando SELECT en vez de CALL) daría un error real, aunque `registrar_evento` exista de verdad?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CREATE PROCEDURE",
      "descripcion": "Referencia oficial de CREATE PROCEDURE y sus diferencias con CREATE FUNCTION.",
      "url": "https://www.postgresql.org/docs/current/sql-createprocedure.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
