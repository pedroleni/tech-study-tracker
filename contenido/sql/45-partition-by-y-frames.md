# PARTITION BY y frames: totales acumulados

- **Módulo:** Funciones de ventana
- **Slug:** `partition-by-y-frames` (autogenerado del título)
- **Orden:** 450
- **Fuentes:** [Window Functions](https://sqlite.org/windowfunctions.html) — ver `contenido/sql/TEMARIO.md` #45

---

## Qué es y para qué sirve

Un *frame* (marco) define, dentro de la ventana, exactamente **qué filas** entran en el cálculo de cada fila concreta — no todas las de la partición, sino un subconjunto relativo a la fila actual. Es lo que hace posible un total acumulado real.

```laboratorio
{
  "tipo": "sql-anotado",
  "titulo": "El total de ventas, acumulado día a día",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, fecha TEXT, total REAL);\nINSERT INTO ventas VALUES (1, '2026-01-01', 100), (2, '2026-01-02', 50), (3, '2026-01-03', 80);",
  "consulta": "SELECT fecha, total,\n  SUM(total) OVER (\n    ORDER BY fecha\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS acumulado\nFROM ventas",
  "anotaciones": [
    { "fragmento": "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "nota": "El frame: \"desde el principio de la ventana (UNBOUNDED PRECEDING) hasta la fila actual (CURRENT ROW)\" — por eso cada fila suma todas las anteriores más ella misma, no la ventana entera." },
    { "fragmento": "SUM(total) OVER (\n    ORDER BY fecha", "nota": "Verificado ejecutándolo: 100, luego 150 (100+50), luego 230 (100+50+80) — un acumulado real, creciente fila a fila." }
  ]
}
```

## `PARTITION BY` + frame: acumulado por grupo, no global

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Combinar las dos ideas del módulo",
  "contenido": "PARTITION BY vendedor junto a un frame ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW calcularía un total acumulado POR VENDEDOR, reiniciando en cada partición — cada vendedor empieza su propio acumulado desde cero, en vez de sumar el total de todos juntos."
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Omitir el frame esperando un acumulado, y obtener otra cosa.", "texto": "Sin especificar ROWS BETWEEN..., el frame por defecto de muchas funciones (con ORDER BY presente) ya se comporta como un acumulado hasta la fila actual — pero confiar en el comportamiento implícito, en vez de escribirlo explícito, hace la consulta más difícil de entender para quien la lea después." },
    { "titulo": "Olvidar el ORDER BY dentro del OVER en un cálculo acumulado.", "texto": "Un \"acumulado\" no tiene sentido sin un orden que defina qué es \"antes\" y \"después\" — el ORDER BY dentro de OVER es imprescindible aquí, no opcional." }
  ]
}
```

## Practica

```laboratorio
{
  "tipo": "sql-en-vivo",
  "consigna": "Muestra la fecha, el total de cada venta, y el total acumulado hasta esa fecha (ordenado por fecha).",
  "esquemaSql": "CREATE TABLE ventas (id INTEGER PRIMARY KEY, fecha TEXT, total REAL);\nINSERT INTO ventas VALUES (1, '2026-02-01', 40), (2, '2026-02-02', 60), (3, '2026-02-03', 20);",
  "consultaInicial": "",
  "consultaSolucion": "SELECT fecha, total, SUM(total) OVER (ORDER BY fecha ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS acumulado FROM ventas"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Window Functions",
      "descripcion": "Referencia oficial completa de las funciones de ventana de SQLite, incluidos los frames.",
      "url": "https://sqlite.org/windowfunctions.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
