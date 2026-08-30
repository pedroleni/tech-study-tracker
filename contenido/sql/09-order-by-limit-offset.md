# ORDER BY, LIMIT y OFFSET

- **Módulo:** SELECT y filtrado
- **Slug:** `order-by-limit-offset` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [SELECT](https://sqlite.org/lang_select.html) — ver `contenido/sql/TEMARIO.md` #9

---

## Qué es y para qué sirve

`ORDER BY` ordena el resultado; `LIMIT` recorta cuántas filas se devuelven; `OFFSET` salta las primeras N antes de empezar a contar. Juntos son la base de cualquier "paginación" real — mostrar resultados de 20 en 20, por ejemplo.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Los tres productos más caros",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL);\nINSERT INTO productos VALUES\n  (1, 'Cuaderno', 3.5), (2, 'Auriculares', 45.0), (3, 'Mochila', 28.9),\n  (4, 'Teclado', 60.0), (5, 'Ratón', 15.0);",
  "consulta": "SELECT nombre, precio\nFROM productos\nORDER BY precio DESC\nLIMIT 3",
  "anotaciones": [
    { "fragmento": "ORDER BY precio DESC", "nota": "DESC ordena de mayor a menor — sin él (o con ASC explícito), el orden por defecto es ascendente." },
    { "fragmento": "LIMIT 3", "nota": "Se aplica DESPUÉS de ordenar — por eso el resultado son los 3 productos MÁS CAROS, no los 3 primeros que hubiera devuelto la tabla sin ordenar." }
  ]
}
```

## Paginar de verdad con `LIMIT`/`OFFSET`

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La segunda \"página\" de resultados",
  "contenido": "LIMIT 2 OFFSET 2 salta las 2 primeras filas ya ordenadas y devuelve las 2 siguientes — es exactamente lo que hace una paginación real (página 2 de una lista, con 2 elementos por página). OFFSET siempre se combina con un ORDER BY estable: sin orden explícito, qué filas caen en cada \"página\" no está garantizado entre una consulta y la siguiente."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar LIMIT/OFFSET para paginar sin un ORDER BY que dé un orden estable.", "texto": "Sin ORDER BY, el motor es libre de devolver las filas en cualquier orden — dos peticiones seguidas a la misma \"página\" podrían traer resultados distintos o duplicados." },
    { "titulo": "Pensar que LIMIT se aplica antes que ORDER BY.", "texto": "Es al revés: primero se ordenan TODAS las filas que cumplen el WHERE, y solo entonces se recorta con LIMIT — por eso 'los 3 más caros' funciona." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra el nombre y el precio de los dos productos más baratos.",
  "esquemaSql": "CREATE TABLE productos (id INTEGER PRIMARY KEY, nombre TEXT, precio REAL);\nINSERT INTO productos VALUES\n  (1, 'Cuaderno', 3.5), (2, 'Auriculares', 45.0), (3, 'Mochila', 28.9),\n  (4, 'Teclado', 60.0), (5, 'Ratón', 15.0);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT nombre, precio FROM productos ORDER BY precio ASC LIMIT 2"
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
      "descripcion": "Referencia oficial de SELECT, incluidos ORDER BY, LIMIT y OFFSET.",
      "url": "https://sqlite.org/lang_select.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
