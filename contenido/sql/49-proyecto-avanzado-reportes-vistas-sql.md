# Proyecto avanzado: reportes de ventas con vistas SQL

- **Módulo:** Proyectos
- **Slug:** `proyecto-avanzado-reportes-de-ventas-con-vistas-sql` (autogenerado del título)
- **Orden:** 490
- **Repositorio:** [github.com/pedroleni/sql-proyectos](https://github.com/pedroleni/sql-proyectos) (carpeta `reportes-vistas-sql`)
- **Requiere:** Módulo 10 (Vistas y funciones auxiliares) de este mismo temario

---

## Qué vas a construir

Un sistema de reportes donde el total de un pedido no vive en una columna que alguien tiene que mantener sincronizada — vive en una VISTA que lo recalcula desde las líneas reales cada vez que se consulta. Ni el total ni el ranking de productos más vendidos pueden desincronizarse nunca, porque no se guardan: se derivan.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/sql-proyectos (carpeta reportes-vistas-sql) — rama main con la vista top_productos, la transacción de crearPedidoConLineas y toda la aplicación completos; solo la columna total de la vista resumen_pedidos está recortada. Rama solucion con el cálculo completo."
}
```

## Antes de empezar

### La primera vez que sales del navegador en este temario

Hasta ahora todo este curso se ha podido hacer en el editor SQL
embebido de la propia lección. Este proyecto es distinto: es una
aplicación real, en TypeScript, que corre en tu ordenador. Necesitas:

- **Node.js.** Descarga la versión **LTS** desde [nodejs.org](https://nodejs.org)
  e instálala como cualquier otro programa. Comprueba tu versión con
  `node --version` en una terminal (pide la 20 o superior).
- **Un editor de código.** [Visual Studio Code](https://code.visualstudio.com)
  (gratis) es el más usado, y trae su propia terminal integrada
  (menú `Terminal` → `New Terminal`).
- **El código de este proyecto**, de una de estas dos formas:
  - **Con git**: `git clone https://github.com/pedroleni/sql-proyectos.git`
  - **Sin git**: entra en [github.com/pedroleni/sql-proyectos](https://github.com/pedroleni/sql-proyectos),
    botón verde **Code** → **Download ZIP**, y descomprímelo donde
    quieras.

No hace falta instalar ningún motor de base de datos aparte: usa
`better-sqlite3`, que guarda todo en un fichero local — `npm install`
lo descarga como cualquier otra dependencia.

Luego `cd sql-proyectos/reportes-vistas-sql` y `npm install` — cada
carpeta de este repositorio es un proyecto independiente con su propio
`package.json`.

### Del cero a los tests pasando, paso a paso

Este proyecto no tiene servidor ni interfaz visual — todo se ve en la
terminal. Aquí el `TODO` no está en un archivo `.ts`, sino dentro de
`migrations/002_vistas.sql`: la columna `total` de la vista
`resumen_pedidos` está incompleta. No hace falta crear ningún archivo
nuevo — todos, incluido ese, **ya existen**.

1. **Abre la carpeta del proyecto en VS Code**: menú `Archivo` →
   `Abrir carpeta...`, y elige la carpeta `reportes-vistas-sql/` de
   dentro de lo que clonaste (no la del repositorio `sql-proyectos`
   entero).
2. **Mira el explorador de archivos**, en la barra lateral izquierda:
   dentro de `migrations/` verás `002_vistas.sql` — ábrelo con un
   clic, no crees ninguno. El resto de `src/` ya está completo.
3. **Abre la terminal integrada**: menú `Terminal` → `New Terminal`
   (o el atajo `` Ctrl+` ``, igual en Windows, Linux y Mac).
4. **Instala las dependencias**: escribe `npm install` y pulsa Intro.
5. **Ejecuta los tests**: escribe `npm test` y pulsa Intro — fallan
   al principio, es tu punto de partida. Los tests usan una base de
   datos en memoria, distinta en cada ejecución, así que no hace
   falta ejecutar `npm run migrate` a mano para probar tus cambios.
6. **El ciclo de trabajo**: abre `002_vistas.sql`, completa la
   definición de la columna `total`, guarda con `Cmd`/`Ctrl` + `S`, y
   vuelve a lanzar `npm test` en la terminal para comprobarlo — el
   resultado aparece ahí mismo, no hay nada que abrir en el
   navegador en este proyecto.
7. **Si además quieres ver los datos con tus propios ojos**: `npm run
   migrate` y `npm run seed` crean y rellenan `ventas.sqlite` con
   clientes, productos y ocho pedidos de ejemplo — puedes abrir ese
   fichero con cualquier explorador de SQLite si quieres inspeccionar
   la vista ya resuelta.

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
    { "titulo": "Instala, migra y siembra — sin Docker.", "texto": "Clona sql-proyectos, entra en reportes-vistas-sql/ y ejecuta npm install, npm run migrate, npm run seed — 3 clientes, 5 productos, 8 pedidos con líneas reales." },
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
      "titulo": "sql-proyectos/reportes-vistas-sql (rama main — punto de partida)",
      "descripcion": "Clona el repo entero y entra en reportes-vistas-sql/ para hacer el proyecto tú mismo.",
      "url": "https://github.com/pedroleni/sql-proyectos/tree/main/reportes-vistas-sql",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "sql-proyectos/reportes-vistas-sql (rama solucion)",
      "descripcion": "La implementación completa, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/sql-proyectos/tree/solucion/reportes-vistas-sql",
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
