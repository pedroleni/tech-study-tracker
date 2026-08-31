# COPY: la forma rápida de cargar y exportar datos

- **Módulo:** Carga masiva y operación
- **Slug:** `copy-la-forma-rapida-de-cargar-y-exportar-datos` (autogenerado del título)
- **Orden:** 570
- **Fuentes:** [COPY](https://www.postgresql.org/docs/current/sql-copy.html) — ver `contenido/postgresql/TEMARIO.md` #18

---

## Qué es y para qué sirve

`INSERT` está pensado para insertar filas una a una (o unas pocas), con toda la maquinaria normal de parseo y planificación de cada sentencia. Cuando hay que mover MILES o MILLONES de filas — un volcado inicial, una migración, un export nocturno — Postgres tiene `COPY`: un camino mucho más directo entre los datos (un fichero, o el propio cliente) y la tabla, sin el coste de repetir la misma sentencia una y otra vez.

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Intenta cargar datos desde un fichero CSV que no existe en este entorno y lee el error real de Postgres.",
  "esquemaSql": "CREATE TABLE productos (id serial, nombre text, precio numeric);",
  "consultaInicial": "COPY productos (nombre, precio) FROM '/tmp/productos.csv' WITH (FORMAT csv)"
}
```

## Por qué este error es honesto, no una limitación inventada

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "COPY FROM/TO un fichero necesita el sistema de ficheros DEL SERVIDOR, no del navegador",
  "contenido": "El error de arriba (\"could not open file ... No such file or directory\") es exactamente el que verías en cualquier Postgres real si el fichero no existe en el propio servidor — COPY archivo lee/escribe en el disco donde vive Postgres, no en tu ordenador ni en el navegador. Por eso, en plataformas gestionadas como Supabase, casi nadie usa COPY archivo directamente: se usa \\copy (un meta-comando de psql que SÍ lee el fichero desde tu máquina y lo transmite por la conexión) o herramientas de importación como el CSV import del panel de Supabase, que hacen ese mismo trabajo por debajo."
}
```

## Lo que sí puedes hacer aquí: varias filas en una sola sentencia

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Un INSERT multivalor: no es COPY, pero comparte el mismo principio",
  "esquemaSql": "CREATE TABLE productos (id serial, nombre text, precio numeric);",
  "consulta": "INSERT INTO productos (nombre, precio) VALUES ('Teclado', 45.99), ('Ratón', 19.50), ('Monitor', 199.00), ('Cable USB', 5.25) RETURNING id, nombre",
  "anotaciones": [
    { "fragmento": "VALUES ('Teclado', 45.99), ('Ratón', 19.50), ('Monitor', 199.00), ('Cable USB', 5.25)", "nota": "Cuatro filas, UNA sola sentencia — un único parseo, una única planificación. Frente a cuatro INSERT sueltos, evita repetir ese trabajo por cada fila." },
    { "fragmento": "RETURNING id, nombre", "nota": "RETURNING funciona igual con un INSERT multivalor que con uno de una sola fila — devuelve las cuatro filas insertadas, con sus id reales generados por la secuencia." }
  ]
}
```

## Cuándo usar cada cosa

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Un INSERT multivalor: bien para cientos de filas, generadas dentro de la propia aplicación.", "texto": "Si los datos ya existen como objetos en tu código (por ejemplo, un array que vas a guardar), construir un solo INSERT con varias VALUES suele ser suficiente y evita el problema de rutas de fichero por completo." },
    { "titulo": "\\copy: la forma real de cargar un CSV local sin acceso al servidor.", "texto": "\\copy productos FROM 'productos.csv' WITH (FORMAT csv) en psql lee el fichero desde TU máquina y lo envía por la conexión — no necesita que el fichero exista en el servidor, a diferencia de COPY archivo (sin barra invertida)." },
    { "titulo": "COPY server-side: miles de veces más rápido, pero exige acceso físico al servidor.", "texto": "Cuando el proceso que carga los datos corre en el MISMO servidor que Postgres (un script de mantenimiento, una migración interna), COPY archivo es la opción más rápida de todas — sin el viaje de ida y vuelta por la red que sí tiene \\copy." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y lee el mensaje de error exacto — ¿qué ruta menciona?
2. Ejecuta el tercer bloque y confirma que las cuatro filas se insertaron con `id` consecutivos.
3. Si tuvieras que cargar un CSV de 2 millones de filas exportado desde una hoja de cálculo, en tu propio ordenador, hacia una base de datos en Supabase, ¿usarías `\copy`, `COPY archivo`, o un `INSERT` multivalor? ¿Por qué las otras dos no encajan?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "COPY",
      "descripcion": "Referencia oficial completa de COPY: formatos soportados, opciones, y la diferencia entre COPY y \\copy (meta-comando de psql).",
      "url": "https://www.postgresql.org/docs/current/sql-copy.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
