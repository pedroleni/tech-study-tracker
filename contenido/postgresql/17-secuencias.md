# Secuencias como objeto de primera clase

- **Módulo:** DDL avanzado
- **Slug:** `secuencias` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [9.17. Sequence Manipulation Functions](https://www.postgresql.org/docs/current/functions-sequence.html) — ver `contenido/postgresql/TEMARIO.md` #7

---

## Qué es y para qué sirve

Detrás de `serial` y de las columnas identity que ya viste en este módulo, hay siempre una **secuencia**: un objeto real de la base de datos, independiente de cualquier tabla, cuyo único trabajo es generar números que nunca se repiten. Postgres deja crear y manipular secuencias directamente, sin que estén atadas a ninguna columna.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una secuencia real, generando valores",
  "esquemaSql": "CREATE SEQUENCE numero_factura START 1000 INCREMENT 1;",
  "consulta": "SELECT nextval('numero_factura') AS primera, nextval('numero_factura') AS segunda, nextval('numero_factura') AS tercera",
  "anotaciones": [
    { "fragmento": "CREATE SEQUENCE numero_factura START 1000 INCREMENT 1;", "nota": "Una secuencia existe por sí misma, sin estar ligada a ninguna tabla ni columna concreta — se puede usar en varias tablas a la vez, o simplemente para generar números de factura sin guardarlos en ningún sitio hasta que hagan falta." },
    { "fragmento": "nextval('numero_factura')", "nota": "Cada llamada devuelve el siguiente valor y avanza la secuencia — de forma segura incluso si varias conexiones la llaman al mismo tiempo (la propia secuencia se encarga de que nunca se repita un valor, sin bloqueos costosos)." }
  ]
}
```

## `nextval` nunca vuelve atrás, ni siquiera si el `INSERT` falla

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Llama a nextval('numero_factura') tres veces seguidas (en la misma consulta) y confirma que devuelve tres números distintos y consecutivos.",
  "esquemaSql": "CREATE SEQUENCE numero_factura START 1;",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nextval('numero_factura'), nextval('numero_factura'), nextval('numero_factura')"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Una secuencia garantiza que NUNCA se repite un valor — no que no haya huecos",
  "contenido": "Si un INSERT que ya consumió un nextval() falla o se deshace (ROLLBACK), ese número NO se reutiliza — la secuencia sigue adelante. Es intencional: reutilizar números crearía una condición de carrera real entre conexiones simultáneas. Un id serial/identity con huecos en la numeración es completamente normal, no un bug."
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que los tres valores son `1000`, `1001`, `1002` — consecutivos, empezando en el `START` indicado.
2. ¿Por qué sería un error real de diseño intentar "rellenar los huecos" de una secuencia reutilizando números de filas borradas?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "9.17. Sequence Manipulation Functions",
      "descripcion": "Documentación oficial completa de secuencias: creación, nextval, currval, setval.",
      "url": "https://www.postgresql.org/docs/current/functions-sequence.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
