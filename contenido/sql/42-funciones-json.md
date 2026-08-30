# Funciones JSON

- **Módulo:** Vistas y funciones auxiliares
- **Slug:** `funciones-json` (autogenerado del título)
- **Orden:** 420
- **Fuentes:** [JSON Functions](https://sqlite.org/json1.html) — ver `contenido/sql/TEMARIO.md` #42

---

## Qué es y para qué sirve

SQLite soporta JSON de forma nativa: se guarda como texto en una columna `TEXT`, pero un conjunto real de funciones permite leer y extraer sus campos directamente en una consulta, sin traer todo el JSON a la aplicación para parsearlo.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Extraer un campo de un JSON guardado como texto",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, atributos TEXT);\nINSERT INTO productos VALUES (1, 'Camiseta', '{\"talla\":\"M\",\"color\":\"azul\"}');",
  "consulta": "SELECT nombre,\n  json_extract(atributos, '$.color') AS color,\n  atributos ->> '$.talla' AS talla\nFROM productos",
  "anotaciones": [
    { "fragmento": "json_extract(atributos, '$.color')", "nota": "$.color es una ruta JSON: $ representa la raíz del documento, .color accede a esa propiedad. Extrae 'azul' del texto JSON completo." },
    { "fragmento": "atributos ->> '$.talla'", "nota": "->> es un atajo equivalente a json_extract para un único valor — misma idea, sintaxis más corta." }
  ]
}
```

## Por qué esto importa de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Datos con forma variable, sin una columna por cada atributo posible.", "texto": "Si distintos productos tienen atributos completamente distintos (talla y color para ropa, voltaje para electrónica), una columna JSON evita crear decenas de columnas mayormente vacías." },
    { "titulo": "No sustituye a columnas reales para lo que sí es común a todas las filas.", "texto": "Un precio o un nombre deberían seguir siendo columnas normales, con sus propios tipos e índices — JSON es para lo verdaderamente variable, no para todo el esquema." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el $ al principio de la ruta JSON.", "texto": "json_extract(atributos, 'color') sin el $. inicial no es una ruta JSON válida — siempre empieza por $ (la raíz), luego .propiedad o [índice]." },
    { "titulo": "Filtrar por un campo JSON en el WHERE sin pensar en el rendimiento.", "texto": "WHERE json_extract(atributos, '$.color') = 'azul' no puede aprovechar un índice normal — igual que con UPPER() (lección 34), extraer JSON dentro del WHERE fuerza un SCAN, salvo que se cree un índice de expresión específico." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre del producto y el valor de la propiedad \"talla\" de su JSON, usando json_extract o ->>.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, atributos TEXT);\nINSERT INTO productos VALUES (1, 'Camiseta', '{\"talla\":\"L\",\"color\":\"rojo\"}');",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, json_extract(atributos, '$.talla') AS talla FROM productos"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "JSON Functions",
      "descripcion": "Referencia oficial completa de las funciones JSON de SQLite.",
      "url": "https://sqlite.org/json1.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
