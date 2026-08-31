# Leer un plan real: seq scan, index scan, nested loop, hash join

- **Módulo:** El planificador de consultas de verdad
- **Slug:** `leer-un-plan-real` (autogenerado del título)
- **Orden:** 260
- **Fuentes:** [14. Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html) — ver `contenido/postgresql/TEMARIO.md` #10

---

## Qué es y para qué sirve

Ya viste varios de estos nombres sueltos en módulos anteriores (Seq Scan, Bitmap Index Scan) — esta lección los junta con las estrategias de JOIN que Postgres elige entre sí mismo, sin que tengas que decírselo.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un JOIN real, con el plan que Postgres eligió",
  "esquemaSql": "CREATE TABLE departamentos (id serial primary key, nombre text);\nCREATE TABLE empleados (id serial primary key, nombre text, departamento_id int);\nINSERT INTO departamentos (nombre) VALUES ('Ingeniería'), ('Ventas'), ('Soporte');\nINSERT INTO empleados (nombre, departamento_id)\nSELECT 'Empleado ' || n, 1 + (n % 3) FROM generate_series(1, 300) AS n;\nANALYZE departamentos, empleados;",
  "consulta": "EXPLAIN SELECT e.nombre, d.nombre FROM empleados e JOIN departamentos d ON d.id = e.departamento_id",
  "anotaciones": [
    { "fragmento": "EXPLAIN SELECT e.nombre, d.nombre FROM empleados e JOIN departamentos d ON d.id = e.departamento_id", "nota": "El JOIN en sí es solo la SINTAXIS — el plan real revela la ESTRATEGIA que Postgres eligió para ejecutarlo: Nested Loop (recorre una tabla y busca en la otra para cada fila), Hash Join (construye una tabla hash de una de las dos, y prueba la otra contra ella) o Merge Join (si ambas ya están ordenadas por la clave de unión)." },
    { "fragmento": "ANALYZE departamentos, empleados;", "nota": "Sin esto, el rows= estimado del plan sería una cifra genérica bastante alejada de la realidad — la próxima lección de este mismo módulo explica exactamente por qué. Aquí solo se usa para que el plan muestre estimaciones ya fiables." }
  ]
}
```

## Las tres estrategias de JOIN, en una frase cada una

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Nested Loop: bueno cuando una de las dos tablas (o el resultado filtrado) es pequeña.", "texto": "Por cada fila de la tabla \"externa\", busca las filas que coinciden en la \"interna\" (normalmente usando un índice). Simple, y muy eficiente si el número de vueltas es bajo." },
    { "titulo": "Hash Join: bueno cuando ninguna de las dos está indexada por la clave de unión.", "texto": "Construye una tabla hash en memoria a partir de la tabla más pequeña, y recorre la otra comparando contra ese hash — evita necesitar un índice, a cambio de memoria." },
    { "titulo": "Merge Join: bueno cuando las dos entradas YA están ordenadas por la clave de unión.", "texto": "Avanza por las dos listas ordenadas en paralelo, como fusionar dos mazos de cartas ya ordenados — el más barato de los tres, pero solo aplicable cuando el orden ya existe (por un índice, o porque la consulta ya pedía ORDER BY esa columna)." }
  ]
}
```

## Ejercicios

1. Ejecuta el bloque de arriba y anota qué estrategia de JOIN eligió Postgres para 300 empleados contra 3 departamentos.
2. ¿Por qué, con una tabla `departamentos` tan pequeña (3 filas) frente a `empleados` (300), tiene sentido que Postgres prefiera una estrategia u otra?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "14. Performance Tips",
      "descripcion": "Guía oficial de rendimiento: cómo leer EXPLAIN, estrategias de join.",
      "url": "https://www.postgresql.org/docs/current/performance-tips.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
