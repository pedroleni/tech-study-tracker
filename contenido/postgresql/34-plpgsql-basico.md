# PL/pgSQL: variables, IF/CASE, bucles

- **Módulo:** Funciones y procedimientos con PL/pgSQL
- **Slug:** `pl-pgsql-variables-if-case-bucles` (autogenerado del título)
- **Orden:** 340
- **Fuentes:** [41. PL/pgSQL](https://www.postgresql.org/docs/current/plpgsql.html) — ver `contenido/postgresql/TEMARIO.md` #13

---

## Qué es y para qué sirve

**PL/pgSQL** es el lenguaje procedural propio de Postgres — SQL con variables, condicionales, bucles y control de flujo real, algo que el SQL puro (una consulta declarativa) no tiene. Se usa dentro de funciones, procedimientos y triggers (próximo módulo de este temario).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una función real con variable, IF y bucle",
  "esquemaSql": "CREATE FUNCTION clasificar_edad(edad int) RETURNS text AS $$\nDECLARE\n  categoria text;\nBEGIN\n  IF edad < 13 THEN\n    categoria := 'niño';\n  ELSIF edad < 18 THEN\n    categoria := 'adolescente';\n  ELSE\n    categoria := 'adulto';\n  END IF;\n  RETURN categoria;\nEND;\n$$ LANGUAGE plpgsql;",
  "consulta": "SELECT clasificar_edad(8) AS caso1, clasificar_edad(15) AS caso2, clasificar_edad(30) AS caso3",
  "anotaciones": [
    { "fragmento": "DECLARE\n  categoria text;", "nota": "DECLARE define variables locales de la función — solo existen mientras la función se ejecuta, con su tipo fijo, igual que una variable en cualquier lenguaje de programación real." },
    { "fragmento": "IF edad < 13 THEN\n    categoria := 'niño';\n  ELSIF edad < 18 THEN\n    categoria := 'adolescente';\n  ELSE\n    categoria := 'adulto';\n  END IF;", "nota": "Control de flujo real — algo que SQL puro no tiene (CASE WHEN se acerca, pero es una expresión, no una sentencia con efectos). := es el operador de asignación de PL/pgSQL, distinto de = (comparación)." },
    { "fragmento": "$$ LANGUAGE plpgsql;", "nota": "$$ ... $$ es dollar-quoting: delimita el cuerpo de la función como una única cadena, sin tener que escapar comillas internas — el cuerpo entero, con sus propios ; internos, es UN SOLO argumento de CREATE FUNCTION." }
  ]
}
```

## Un bucle real, sumando algo

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "La función factorial(n) ya está creada (usa un bucle FOR para multiplicar). Escribe la consulta que la pruebe con factorial(5) — debería dar 120.",
  "esquemaSql": "CREATE FUNCTION factorial(n int) RETURNS int AS $$\nDECLARE\n  resultado int := 1;\nBEGIN\n  FOR i IN 1..n LOOP\n    resultado := resultado * i;\n  END LOOP;\n  RETURN resultado;\nEND;\n$$ LANGUAGE plpgsql;",
  "consultaInicial": "",
  "consultaSolucion": "SELECT factorial(5)"
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma los tres resultados: `'niño'`, `'adolescente'`, `'adulto'`.
2. En el segundo bloque, cambia `factorial(5)` por `factorial(0)` — ¿qué esperas que devuelva, dado que el bucle `FOR i IN 1..0` nunca se ejecutaría ni una vez?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "41. PL/pgSQL",
      "descripcion": "Documentación oficial completa de PL/pgSQL: variables, control de flujo, bucles.",
      "url": "https://www.postgresql.org/docs/current/plpgsql.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
