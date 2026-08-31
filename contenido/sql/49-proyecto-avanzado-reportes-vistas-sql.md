# Proyecto avanzado: reportes de ventas con vistas SQL

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-reportes-de-ventas-con-vistas-sql` (autogenerado del título)
- **Orden:** 490
- **Repositorio:** [github.com/pedroleni/reportes-ventas-vistas-sql](https://github.com/pedroleni/reportes-ventas-vistas-sql)
- **Requiere:** Módulo 10 (Vistas y funciones auxiliares) de este mismo temario

---

## Qué vas a construir

Un sistema de reportes donde el total de un pedido no vive en una columna que alguien tiene que mantener sincronizada — vive en una VISTA que lo recalcula desde las líneas reales cada vez que se consulta. Ni el total ni el ranking de productos más vendidos pueden desincronizarse nunca, porque no se guardan: se derivan.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/reportes-ventas-vistas-sql — rama main con la vista top_productos, la transacción de crearPedidoConLineas y toda la aplicación completos; solo la columna total de la vista resumen_pedidos está recortada. Rama solucion con el cálculo completo."
}
```

## El punto de partida: una vista que siempre dice 0

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<script>\nCREATE VIEW resumen_pedidos AS\nSELECT\n  p.id AS pedido_id, p.cliente_id, c.nombre AS cliente_nombre, p.creado_en,\n  0 AS total -- TODO: sustituye por SUM(lp.cantidad * lp.precio_unitario)\nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nJOIN lineas_pedido lp ON lp.pedido_id = p.id\nGROUP BY p.id;\n</script>",
  "anotaciones": [
    { "fragmento": "0 AS total -- TODO", "nota": "La vista es sintácticamente válida y se puede consultar sin error — simplemente cada pedido reporta un total falso de 0, en vez de sumar lo que sus líneas realmente valen." },
    { "fragmento": "GROUP BY p.id", "nota": "Esta parte SÍ está completa — el GROUP BY es lo que convierte varias líneas por pedido en UNA fila de resumen por pedido. Sin él, SUM() se calcularía sobre TODAS las líneas de TODOS los pedidos a la vez." }
  ]
}
```

## Lo que ya funciona: precio_unitario se guarda en la línea, no en el producto

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El precio de un producto puede cambiar después de venderse",
  "contenido": "lineas_pedido.precio_unitario guarda el precio REAL al que se vendió esa línea — no se recalcula leyendo productos.precio en cada consulta. Si mañana ese producto sube de precio, los pedidos ya hechos deben seguir mostrando lo que el cliente pagó de verdad, no el precio actual. Es la misma idea que la vista resumen_pedidos lleva al extremo: cada dato vive en el sitio que garantiza que sea correcto, ni antes ni después."
}
```

## Pruébalo tú, de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Instala, migra y siembra — sin Docker.", "texto": "npm install, npm run migrate, npm run seed — 3 clientes, 5 productos, 8 pedidos con líneas reales." },
    { "titulo": "Ejecuta los tests tal cual — 3 de 5 deben fallar.", "texto": "Los tests que comprueban totales concretos fallan (todos dan 0); el de atomicidad (fallo de clave foránea) y el de top_productos pasan igual, porque no dependen de resumen_pedidos." },
    { "titulo": "Completa el SUM() y confirma los 5.", "texto": "Sustituye 0 AS total por SUM(lp.cantidad * lp.precio_unitario) en migrations/002_vistas.sql, vuelve a migrar sobre una base limpia y corre npm test." }
  ]
}
```

## Retos para ampliarlo

1. Añade una vista `productos_sin_ventas` (productos que existen pero nunca aparecieron en ninguna línea de pedido) usando un `LEFT JOIN ... WHERE ... IS NULL` — el patrón exacto del módulo 4 de este track, aplicado dentro de una vista.
2. Añade `resumenPorMes(db)` reutilizando `resumen_pedidos` con un `GROUP BY substr(creado_en, 1, 7)` por encima — demuestra que una vista se puede seguir agregando, como si fuera una tabla normal.
3. Combínalo con el proyecto de analítica con funciones de ventana (lección 47): usa `top_productos` como base para calcular, con `ROW_NUMBER() OVER`, el top 3 de productos por ingresos dentro de cada mes.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "reportes-ventas-vistas-sql (rama main — punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/reportes-ventas-vistas-sql/tree/main",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "reportes-ventas-vistas-sql (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/reportes-ventas-vistas-sql/tree/solucion",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "CREATE VIEW",
      "descripcion": "Referencia oficial de SQLite sobre vistas, ya usada en el módulo 10 de este track.",
      "url": "https://sqlite.org/lang_createview.html",
      "etiqueta": "SQLite"
    }
  ]
}
```
