# LIKE y patrones de texto

- **Módulo:** SELECT y filtrado
- **Slug:** `like-patrones-de-texto` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [Expression](https://sqlite.org/lang_expr.html) — ver `contenido/sql/TEMARIO.md` #10

---

## Qué es y para qué sirve

`LIKE` busca texto por patrón, no por igualdad exacta — usa `%` para "cualquier secuencia de caracteres" y `_` para "exactamente un carácter". Es la forma más simple de una búsqueda tipo "que contenga esto".

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Productos cuyo nombre empieza por \"Auri\"",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT);\nINSERT INTO productos VALUES (1, 'Auriculares'), (2, 'Auricular inalámbrico'), (3, 'Cuaderno');",
  "consulta": "SELECT nombre\nFROM productos\nWHERE nombre LIKE 'Auri%'",
  "anotaciones": [
    { "fragmento": "LIKE 'Auri%'", "nota": "% significa \"cualquier cosa (incluido nada) a partir de aquí\" — encuentra tanto 'Auriculares' como 'Auricular inalámbrico', ambos empiezan por 'Auri'." }
  ]
}
```

## `%` y `_`: los dos comodines reales

```laboratorio
{
  "tipo": "roles",
  "titulo": "Solo existen estos dos comodines en LIKE",
  "roles": [
    { "etiqueta": "%", "rol": "Cualquier secuencia de caracteres (o ninguno)", "descripcion": "'%mochila%' encuentra 'mochila', 'Mi mochila azul', o 'nueva mochila 2024' — en cualquier posición." },
    { "etiqueta": "_", "rol": "Exactamente un carácter, cualquiera que sea", "descripcion": "'a_a' encuentra 'aza' o 'aja', pero no 'aa' (falta un carácter) ni 'azza' (sobra uno)." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar * como si fuera el comodín de LIKE, copiando la costumbre de la terminal.", "texto": "En SQL el comodín de \"cualquier cosa\" es %, no * — * en SQL solo significa \"todas las columnas\" dentro de un SELECT." },
    { "titulo": "Olvidar el % al principio cuando se busca \"que contenga\" en vez de \"que empiece por\".", "texto": "LIKE 'mochila%' solo encuentra texto que EMPIEZA por 'mochila' — hace falta '%mochila%' para encontrarlo en cualquier posición." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre de los productos cuyo nombre contenga la palabra \"inalámbrico\" en cualquier posición.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT);\nINSERT INTO productos VALUES (1, 'Auriculares'), (2, 'Auricular inalámbrico'), (3, 'Ratón inalámbrico'), (4, 'Cuaderno');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre FROM productos WHERE nombre LIKE '%inalámbrico%'"
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
      "descripcion": "Referencia oficial de expresiones SQL, incluido el operador LIKE.",
      "url": "https://sqlite.org/lang_expr.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
