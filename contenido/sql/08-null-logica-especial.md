# NULL: por qué rompe la lógica normal (IS NULL frente a = NULL)

- **Módulo:** SELECT y filtrado
- **Slug:** `null-logica-especial` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [Expression](https://sqlite.org/lang_expr.html) — ver `contenido/sql/TEMARIO.md` #8

---

## Qué es y para qué sirve

`NULL` representa "no hay valor" — ni siquiera un texto vacío o un cero, sino la ausencia total de dato. Compararlo con `=` no funciona como cabría esperar, y es una de las sorpresas más reales y más comunes de SQL.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<script>\n// categoria_secundaria es NULL en el producto 'Mochila'\nSELECT nombre FROM productos\nWHERE categoria_secundaria = NULL;\n</script>",
  "opciones": [
    "Devuelve 'Mochila', porque su categoria_secundaria es NULL",
    "Devuelve un error de sintaxis",
    "No devuelve ninguna fila, ni siquiera la que tiene NULL"
  ],
  "correcta": 2,
  "explicacion": "= NULL nunca es verdadero, ni siquiera comparando NULL con NULL — el resultado de esa comparación es siempre NULL (ni verdadero ni falso), y una fila con NULL en la condición del WHERE se descarta. Hace falta IS NULL, no = NULL, para preguntar de verdad \"¿esta columna no tiene valor?\"."
}
```

## `IS NULL` / `IS NOT NULL`: la forma correcta de preguntar

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "La comparación correcta con NULL",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, categoria_secundaria TEXT);\nINSERT INTO productos VALUES (1, 'Cuaderno', 'oficina'), (2, 'Mochila', NULL), (3, 'Auriculares', NULL);",
  "consulta": "SELECT nombre\nFROM productos\nWHERE categoria_secundaria IS NULL",
  "anotaciones": [
    { "fragmento": "IS NULL", "nota": "IS NULL (y su opuesto, IS NOT NULL) son los únicos operadores diseñados para preguntar de verdad por la ausencia de valor — = y != nunca dan un resultado útil con NULL." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir WHERE columna = NULL esperando que funcione.", "texto": "Nunca es verdadero — ni siquiera compara NULL con NULL como \"iguales\". El resultado de esa comparación es NULL, que WHERE trata como \"descarta la fila\"." },
    { "titulo": "Olvidar que NULL puede colarse en un cálculo y contaminarlo entero.", "texto": "precio * cantidad da NULL si cualquiera de los dos es NULL — no cero, no un error, NULL. Vale la pena comprobarlo con IS NOT NULL antes de operar si la columna puede estar vacía." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre de los productos que SÍ tienen una categoría secundaria asignada (no NULL).",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, categoria_secundaria TEXT);\nINSERT INTO productos VALUES (1, 'Cuaderno', 'oficina'), (2, 'Mochila', NULL), (3, 'Auriculares', NULL);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre FROM productos WHERE categoria_secundaria IS NOT NULL"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Expression",
      "descripcion": "Referencia oficial de expresiones SQL, incluido el tratamiento de NULL.",
      "url": "https://sqlite.org/lang_expr.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
