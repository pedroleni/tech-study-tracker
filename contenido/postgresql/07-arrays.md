# Arrays: columnas con más de un valor

- **Módulo:** Tipos de datos que SQLite no tiene
- **Slug:** `arrays-columnas-con-mas-de-un-valor` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [8.15. Arrays](https://www.postgresql.org/docs/current/arrays.html) — ver `contenido/postgresql/TEMARIO.md` #5

---

## Qué es y para qué sirve

En el modelo relacional "puro" (el que enseña el track de SQL), una columna guarda un único valor por fila — si un producto puede tener varias etiquetas, la solución normalizada es una tabla aparte (`producto_etiquetas`) con una fila por combinación. Postgres ofrece una alternativa real que SQLite no tiene: columnas de tipo **array**, que guardan una lista de valores directamente en la propia fila.

```laboratorio
{
  "tipo": "sql-anotado",
  "motor": "postgres",
  "titulo": "Una columna con varias etiquetas, sin tabla aparte",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, etiquetas text[]);\nINSERT INTO productos (nombre, etiquetas) VALUES\n  ('Teclado mecánico', ARRAY['periferico', 'oferta', 'nuevo']),\n  ('Monitor 27\"', ARRAY['periferico', 'pantalla']);",
  "consulta": "SELECT nombre, etiquetas, array_length(etiquetas, 1) AS num_etiquetas FROM productos ORDER BY nombre",
  "anotaciones": [
    { "fragmento": "etiquetas text[]", "nota": "El tipo de la columna es \"array de text\" — el [] tras el tipo base es la sintaxis real de Postgres para declarar un array de ese tipo." },
    { "fragmento": "array_length(etiquetas, 1)", "nota": "El segundo argumento es la dimensión (los arrays de Postgres pueden ser multidimensionales) — 1 para el caso normal de una lista simple." }
  ]
}
```

## Consultar dentro de un array

```laboratorio
{
  "tipo": "sql-en-vivo",
  "motor": "postgres",
  "consigna": "Muestra el nombre de los productos que tengan la etiqueta 'oferta'.",
  "esquemaSql": "CREATE TABLE productos (id serial primary key, nombre text, etiquetas text[]);\nINSERT INTO productos (nombre, etiquetas) VALUES\n  ('Teclado mecánico', ARRAY['periferico', 'oferta', 'nuevo']),\n  ('Monitor 27\"', ARRAY['periferico', 'pantalla']),\n  ('Ratón inalámbrico', ARRAY['periferico', 'oferta']);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre FROM productos WHERE 'oferta' = ANY(etiquetas)"
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "= ANY(array) es el operador real para \"¿está este valor en el array?\"",
  "contenido": "No hace falta ninguna sintaxis especial de más: = ANY(columna_array) es SQL real de Postgres, no un atajo inventado. También existen los operadores @> (¿contiene todos estos valores?) y && (¿comparten algún valor los dos arrays?), útiles cuando la condición involucra varios elementos a la vez."
}
```

## Cuándo SÍ, cuándo NO

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Bien para listas pequeñas, sin necesidad de metadatos propios.", "texto": "Etiquetas, colores disponibles, códigos postales que cubre un repartidor — datos que no necesitan su propia fecha de creación, su propio id, ni relacionarse con nada más." },
    { "titulo": "Mal si cada elemento necesita sus propios datos o relaciones.", "texto": "Si cada 'etiqueta' necesitara un color, una descripción, o contarse cuántos productos la usan de verdad, una tabla normalizada (con su propia clave primaria) vuelve a ser la opción correcta — exactamente el mismo criterio del track de SQL, solo que ahora tienes una alternativa real disponible para el caso simple." }
  ]
}
```

## Ejercicios

1. Ejecuta el primer bloque y confirma que `array_length` cuenta correctamente 3 y 2 etiquetas respectivamente.
2. Reescribe la consulta del segundo bloque usando el operador `@>` (contiene) en vez de `= ANY(...)` — ¿producen el mismo resultado para este caso?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "8.15. Arrays",
      "descripcion": "Documentación oficial completa de arrays: declaración, operadores, funciones.",
      "url": "https://www.postgresql.org/docs/current/arrays.html",
      "etiqueta": "PostgreSQL"
    }
  ]
}
```
