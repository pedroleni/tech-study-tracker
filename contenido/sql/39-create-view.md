# CREATE VIEW: guardar una consulta con nombre

- **Módulo:** Vistas y funciones auxiliares
- **Slug:** `create-view` (autogenerado del título)
- **Orden:** 390
- **Fuentes:** [CREATE VIEW](https://sqlite.org/lang_createview.html) — ver `contenido/sql/TEMARIO.md` #39

---

## Qué es y para qué sirve

Una vista (`VIEW`) guarda una consulta con un nombre, para poder reutilizarla como si fuera una tabla — sin repetir la consulta completa cada vez, y sin duplicar los datos.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "Una vista sobre las ventas grandes",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, total REAL);\nINSERT INTO ventas VALUES (1, 'Auriculares', 100), (2, 'Cuaderno', 50);",
  "consulta": "CREATE VIEW ventas_grandes AS\n  SELECT * FROM ventas WHERE total > 60;\nSELECT * FROM ventas_grandes;",
  "anotaciones": [
    { "fragmento": "CREATE VIEW ventas_grandes AS", "nota": "A partir de aquí, ventas_grandes se puede usar en cualquier SELECT como si fuera una tabla real — pero no guarda datos propios, solo la definición de la consulta." },
    { "fragmento": "SELECT * FROM ventas_grandes;", "nota": "Verificado ejecutándolo: cada vez que se consulta la vista, se vuelve a ejecutar el WHERE total > 60 contra los datos ACTUALES de ventas — nunca datos guardados de una ejecución anterior." }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Pensar que una vista guarda una copia de los datos en el momento en que se crea.", "texto": "Al contrario: una vista se recalcula CADA VEZ que se consulta — si la tabla ventas cambia, la vista refleja el cambio en la siguiente consulta, sin necesidad de recrearla." },
    { "titulo": "Confundir el propósito de una vista con el de una CTE (módulo 5).", "texto": "Una CTE solo existe dentro de UNA consulta concreta; una vista se guarda en el esquema de la base de datos y está disponible para cualquier consulta futura, de cualquier parte del código." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Crea una vista llamada ventas_pequenas que muestre solo las ventas con total menor o igual a 60, y luego selecciona todo de esa vista.",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, producto TEXT, total REAL);\nINSERT INTO ventas VALUES (1, 'Auriculares', 100), (2, 'Cuaderno', 50);",
  "consultaInicial": "",
  "consultaSolucion": "CREATE VIEW ventas_pequenas AS SELECT * FROM ventas WHERE total <= 60; SELECT * FROM ventas_pequenas;"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CREATE VIEW",
      "descripcion": "Referencia oficial completa de la sentencia CREATE VIEW.",
      "url": "https://sqlite.org/lang_createview.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
