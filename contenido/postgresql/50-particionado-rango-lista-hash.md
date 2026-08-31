# Particionado por rango, por lista y por hash

- **Módulo:** Particionado de tablas
- **Slug:** `particionado-por-rango-por-lista-y-por-hash` (autogenerado del título)
- **Orden:** 500
- **Fuentes:** [5.12. Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html) — ver `contenido/postgresql/TEMARIO.md` #15

---

## Qué es y para qué sirve

La lección anterior usó `RANGE` (rangos, como fechas). Postgres tiene otras dos estrategias de particionado, cada una pensada para un patrón de datos distinto: `LIST` reparte por un conjunto de valores concretos (útil cuando la columna tiene pocos valores posibles y con significado, como un país), y `HASH` reparte de forma pseudoaleatoria pero uniforme (útil cuando no hay un criterio natural de agrupación, solo se quiere repartir la carga de forma pareja).

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Particionado por LIST: cada valor concreto a su partición, con una DEFAULT para lo que no encaja",
  "esquemaSql": "CREATE TABLE pedidos (id serial, pais text not null, importe numeric) PARTITION BY LIST (pais);\nCREATE TABLE pedidos_es PARTITION OF pedidos FOR VALUES IN ('ES');\nCREATE TABLE pedidos_fr PARTITION OF pedidos FOR VALUES IN ('FR');\nCREATE TABLE pedidos_otros PARTITION OF pedidos DEFAULT;\nINSERT INTO pedidos (pais, importe) VALUES ('ES', 10), ('FR', 20), ('DE', 30);",
  "consulta": "SELECT tableoid::regclass, pais FROM pedidos ORDER BY pais",
  "anotaciones": [
    { "fragmento": "PARTITION BY LIST (pais)", "nota": "A diferencia de RANGE, aquí cada partición declara una LISTA concreta de valores exactos que acepta, no un intervalo continuo." },
    { "fragmento": "CREATE TABLE pedidos_otros PARTITION OF pedidos DEFAULT;", "nota": "DEFAULT es la partición \"para todo lo demás\" — sin ella, insertar un pais que no esté en ninguna lista explícita (como 'DE' aquí) lanzaría el mismo error de \"no partition found\" que ya viste con RANGE." },
    { "fragmento": "SELECT tableoid::regclass, pais FROM pedidos", "nota": "'DE' termina en pedidos_otros, la partición DEFAULT — comprobación real de que existe una red de seguridad para valores no previstos." }
  ]
}
```

## Compruébalo: particionado por HASH, sin ningún criterio de negocio

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "eventos está particionada por HASH sobre usuario_id, en 2 particiones (MODULUS 2). Cuenta cuántas filas cayeron en cada partición usando tableoid.",
  "esquemaSql": "CREATE TABLE eventos (id serial, usuario_id int not null, tipo text) PARTITION BY HASH (usuario_id);\nCREATE TABLE eventos_p0 PARTITION OF eventos FOR VALUES WITH (MODULUS 2, REMAINDER 0);\nCREATE TABLE eventos_p1 PARTITION OF eventos FOR VALUES WITH (MODULUS 2, REMAINDER 1);\nINSERT INTO eventos (usuario_id, tipo) VALUES (1,'click'), (2,'click'), (3,'scroll'), (4,'scroll');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT tableoid::regclass, count(*) FROM eventos GROUP BY tableoid ORDER BY 1"
}
```

## Cuál elegir

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "RANGE: series temporales, cualquier cosa que \"avanza\".", "texto": "Fechas, IDs autoincrementales, montos acumulados — cuando tiene sentido preguntar \"¿esto es mayor o menor que aquello?\" y las consultas reales suelen filtrar por rangos (\"el último mes\", \"el último año\")." },
    { "titulo": "LIST: pocos valores, cada uno con significado propio.", "texto": "País, región, tenant/cliente en una aplicación multi-tenant — cuando el número de valores distintos es manejable y cada partición representa algo concreto que alguien podría querer consultar o archivar por separado." },
    { "titulo": "HASH: repartir carga, sin ningún criterio natural.", "texto": "Cuando no hay una forma obvia de agrupar (o agruparía de forma muy desigual) pero igualmente se quiere ganar los beneficios de tener varias tablas físicas más pequeñas en vez de una enorme — MODULUS/REMAINDER solo reparten de forma uniforme, sin ningún significado de negocio." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que 'DE' termina en `pedidos_otros`, no en un error.
2. Resuelve el segundo bloque y confirma que las 4 filas se repartieron 2 y 2 entre las particiones — ¿por qué HASH reparte así, si `usuario_id` no tiene ningún patrón especial?
3. ¿Qué pasaría si intentaras crear una tercera partición HASH con `MODULUS 2, REMAINDER 0` (mismo remainder que una que ya existe)? ¿Por qué eso no puede tener sentido con particionado por HASH?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "5.12. Table Partitioning",
      "descripcion": "Capítulo oficial completo, incluida la sintaxis exacta de PARTITION BY RANGE/LIST/HASH y sus opciones.",
      "url": "https://www.postgresql.org/docs/current/ddl-partitioning.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
