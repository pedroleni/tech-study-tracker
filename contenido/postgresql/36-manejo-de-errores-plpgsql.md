# Manejo de errores: RAISE, EXCEPTION, bloques BEGIN/EXCEPTION

- **Módulo:** Funciones y procedimientos con PL/pgSQL
- **Slug:** `manejo-de-errores-plpgsql` (autogenerado del título)
- **Orden:** 360
- **Fuentes:** [41.9. Errors and Messages](https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html) — ver `contenido/postgresql/TEMARIO.md` #13

---

## Qué es y para qué sirve

PL/pgSQL puede lanzar sus propios errores reales con `RAISE EXCEPTION`, y capturar errores (los suyos o los del propio motor) con un bloque `EXCEPTION` — el mismo concepto que un `try/catch`, con su propia sintaxis.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una validación real, con un error propio y con mensaje claro",
  "esquemaSql": "CREATE FUNCTION retirar(saldo_actual numeric, cantidad numeric) RETURNS numeric AS $$\nBEGIN\n  IF cantidad > saldo_actual THEN\n    RAISE EXCEPTION 'saldo insuficiente: intentaste retirar % pero solo hay %', cantidad, saldo_actual;\n  END IF;\n  RETURN saldo_actual - cantidad;\nEND;\n$$ LANGUAGE plpgsql;",
  "consulta": "SELECT retirar(100, 30) AS resultado",
  "anotaciones": [
    { "fragmento": "RAISE EXCEPTION 'saldo insuficiente: intentaste retirar % pero solo hay %', cantidad, saldo_actual;", "nota": "Cada % del mensaje se sustituye, en orden, por los argumentos que vienen después de la coma — el mismo mecanismo que un printf, pero integrado en el propio lenguaje. RAISE EXCEPTION corta la ejecución de inmediato, como cualquier error real." }
  ]
}
```

## El error real, cuando SÍ se dispara

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Llama a retirar(100, 500) — más de lo que hay disponible — y lee el mensaje de error real y personalizado que devuelve la función.",
  "esquemaSql": "CREATE FUNCTION retirar(saldo_actual numeric, cantidad numeric) RETURNS numeric AS $$\nBEGIN\n  IF cantidad > saldo_actual THEN\n    RAISE EXCEPTION 'saldo insuficiente: intentaste retirar % pero solo hay %', cantidad, saldo_actual;\n  END IF;\n  RETURN saldo_actual - cantidad;\nEND;\n$$ LANGUAGE plpgsql;",
  "consultaInicial": "SELECT retirar(100, 500)",
  "consultaSolucion": "SELECT retirar(100, 30)"
}
```

## Capturar un error dentro de la propia función

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "EXCEPTION WHEN ... THEN captura errores, igual que un catch",
  "contenido": "BEGIN ... EXCEPTION WHEN division_by_zero THEN ... END permite que una función siga adelante (devolviendo, por ejemplo, un valor por defecto) en vez de propagar el error hacia quien la llamó. Es el mismo patrón try/catch que ya conoces de otros lenguajes, con nombres de condición reales de Postgres (division_by_zero, unique_violation, foreign_key_violation...) en vez de tipos de excepción genéricos."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma el resultado real: `70` (100 - 30).
2. Ejecuta el segundo bloque tal cual (con `500`) y lee el mensaje de error exacto — confirma que los dos `%` se sustituyeron correctamente por `500` y `100`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "41.9. Errors and Messages",
      "descripcion": "Documentación oficial completa de RAISE y manejo de excepciones en PL/pgSQL.",
      "url": "https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
