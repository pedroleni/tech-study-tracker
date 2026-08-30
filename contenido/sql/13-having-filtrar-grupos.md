# HAVING: filtrar grupos, no filas

- **Módulo:** Agregación
- **Slug:** `having-filtrar-grupos` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #13

---

## Qué es y para qué sirve

`HAVING` filtra **después** de agrupar y agregar — a diferencia de `WHERE`, que filtra filas individuales antes de que exista ningún grupo. Es la única forma de escribir una condición sobre el resultado de una función de agregado, como `SUM(...) > 100`.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Solo los productos que han vendido más de 10 unidades en total",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, cantidad INTEGER);\nINSERT INTO ventas VALUES\n  (1, 'Cuaderno', 10), (2, 'Auriculares', 2), (3, 'Cuaderno', 5), (4, 'Mochila', 1), (5, 'Auriculares', 3);",
  "consulta": "SELECT producto, SUM(cantidad) AS total\nFROM ventas\nGROUP BY producto\nHAVING SUM(cantidad) > 10",
  "anotaciones": [
    { "fragmento": "HAVING SUM(cantidad) > 10", "nota": "Se evalúa DESPUÉS de que GROUP BY ya haya formado los grupos y SUM ya haya calculado el total de cada uno — por eso HAVING sí puede usar SUM(cantidad) directamente." },
    { "fragmento": "GROUP BY producto", "nota": "Sin este GROUP BY, HAVING no tendría ningún grupo sobre el que filtrar — los dos van casi siempre juntos." }
  ]
}
```

## `WHERE` frente a `HAVING`: el orden real de ejecución

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cada uno filtra en un momento distinto",
  "roles": [
    { "etiqueta": "WHERE", "rol": "Filtra filas, antes de agrupar", "descripcion": "No puede usar SUM(), COUNT() ni ninguna función de agregado — todavía no existen grupos en ese momento." },
    { "etiqueta": "HAVING", "rol": "Filtra grupos, después de agregar", "descripcion": "SÍ puede usar SUM(), COUNT()... porque ya se calcularon para cada grupo." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir WHERE SUM(cantidad) > 10 en vez de HAVING.", "texto": "SQLite lo rechaza con \"misuse of aggregate: SUM()\" (verificado ejecutándolo de verdad) — las funciones de agregado no están permitidas dentro de WHERE, precisamente porque WHERE actúa antes de que existan los grupos." },
    { "titulo": "Usar HAVING para una condición que no necesita agregación.", "texto": "Si la condición es sobre una columna normal (categoria = 'electronica', por ejemplo), va en WHERE — es más eficiente, porque descarta filas antes de agrupar, no después." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra los productos que aparecen en 2 o más ventas distintas (usa COUNT en el HAVING).",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, cantidad INTEGER);\nINSERT INTO ventas VALUES\n  (1, 'Cuaderno', 10), (2, 'Auriculares', 2), (3, 'Cuaderno', 5), (4, 'Mochila', 1), (5, 'Auriculares', 3);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT producto, COUNT(*) AS num_ventas FROM ventas GROUP BY producto HAVING COUNT(*) >= 2"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SELECT",
      "descripcion": "Referencia oficial de SELECT, incluido HAVING.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
