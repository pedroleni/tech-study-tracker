# Indexar JSONB con GIN

- **Módulo:** JSON de verdad: JSONB
- **Slug:** `indexar-jsonb-con-gin` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [65.4. GIN Indexes](https://www.postgresql.org/docs/current/gin.html) — ver `contenido/postgresql/TEMARIO.md` #6

---

## Qué es y para qué sirve

Sin índice, buscar dentro de una columna `jsonb` con `@>` (contiene) obliga a Postgres a revisar fila por fila — un *seq scan* completo (Módulo 5 y 7 de este temario tratan esto con más detalle). Un índice **GIN** (*Generalized Inverted Index*) indexa el CONTENIDO de cada valor `jsonb` — cada clave y cada valor por separado — de forma que una búsqueda `@>` puede saltar directamente a las filas relevantes, sin mirar el resto.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Crear el índice — y una sorpresa real en el plan",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, datos jsonb);\nINSERT INTO productos (datos)\nSELECT jsonb_build_object('categoria', (ARRAY['ropa','electronica','hogar'])[1 + (n % 3)], 'precio', n)\nFROM generate_series(1, 500) AS n;\nCREATE INDEX idx_productos_datos ON productos USING GIN (datos);",
  "consulta": "EXPLAIN SELECT * FROM productos WHERE datos @> '{\"categoria\": \"electronica\"}'",
  "anotaciones": [
    { "fragmento": "CREATE INDEX idx_productos_datos ON productos USING GIN (datos);", "nota": "USING GIN es la parte que importa — sin especificar el tipo de índice, CREATE INDEX crearía un B-tree normal, que no sabe indexar el contenido interno de un jsonb (Módulo 5 de este temario compara los tipos de índice en profundidad)." },
    { "fragmento": "EXPLAIN SELECT", "nota": "El resultado real dice \"Seq Scan\", no \"Bitmap Index Scan\" — aunque el índice GIN existe. Con solo 500 filas repartidas en 3 categorías (~165 filas por categoría), el planificador calcula que revisarlas todas seguidas es MÁS BARATO que saltar de un lado a otro siguiendo un índice. No es un error: es la decisión correcta del planificador con este volumen de datos — se explica en detalle abajo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Que un índice exista no significa que Postgres vaya a usarlo",
  "contenido": "El planificador (Módulo 7 de este temario) decide según costes estimados reales, nunca según \"si hay un índice, úsalo\". Con una tabla de este tamaño, cada categoría tiene cientos de filas — seguir el índice significaría saltar de bloque en bloque en disco cientos de veces; leer la tabla entera de una vez, en orden, es más barato de verdad. El índice GIN se volvería la opción ganadora con una tabla mucho más grande, o con una condición mucho más selectiva (pocas filas cumpliéndola de miles)."
}
```

## Forzar el índice para comprobar que SÍ funciona

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "El planificador prefiere Seq Scan con estos datos (arriba lo viste). Esta vez el esquema ya desactivó esa opción con SET enable_seqscan = off; — escribe el mismo EXPLAIN de antes y confirma que el plan cambia de verdad a Bitmap Index Scan usando idx_productos_datos.",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, datos jsonb);\nINSERT INTO productos (datos)\nSELECT jsonb_build_object('categoria', (ARRAY['ropa','electronica','hogar'])[1 + (n % 3)], 'precio', n)\nFROM generate_series(1, 500) AS n;\nCREATE INDEX idx_productos_datos ON productos USING GIN (datos);\nSET enable_seqscan = off;",
  "consultaInicial": "",
  "consultaSolucion": "EXPLAIN SELECT * FROM productos WHERE datos @> '{\"categoria\": \"electronica\"}'"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "enable_seqscan = off es una herramienta de diagnóstico, no algo para producción",
  "contenido": "Desactivar seq scan sirve exactamente para lo que acabas de hacer: comprobar que un índice funciona de verdad y ver su plan real, aislado de la decisión de coste del planificador. Dejarlo desactivado en una base de datos real sería contraproducente — forzaría a Postgres a usar índices incluso cuando de verdad es más lento que leer la tabla entera."
}
```

## Ejercicios

1. Ejecuta los dos bloques en orden y compara los dos planes reales: ¿qué palabra clave distingue un `Seq Scan` de un `Bitmap Index Scan` en el `QUERY PLAN`?
2. ¿Por qué un índice B-tree normal (sin `USING GIN`) no serviría para acelerar una búsqueda `@>` dentro de un `jsonb`, sin importar cuántas filas tenga la tabla?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "65.4. GIN Indexes",
      "descripcion": "Documentación oficial de índices GIN: cómo funcionan, cuándo usarlos.",
      "url": "https://www.postgresql.org/docs/current/gin.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
