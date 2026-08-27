# CSS Grid: filas, columnas y áreas

- **Módulo:** Layout
- **Slug:** `css-grid-filas-columnas-y-areas` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [CSS grid layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids) + [Grid (web.dev)](https://web.dev/learn/css/grid) — ver `contenido/css/TEMARIO.md` #35

---

## Qué es y para qué sirve

Flexbox reparte espacio en una dimensión a la vez. Grid piensa en las dos a la vez: filas Y columnas, definidas de antemano o generadas sobre la marcha. `fr` reparte espacio en fracciones, `repeat()` evita repetir la misma pista a mano, `minmax()` combinado con `auto-fit` construye cuadrículas responsive sin una sola media query, y `grid-template-areas` dibuja el layout completo como un mapa de texto.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién piensa en dos dimensiones a la vez",
  "roles": [
    { "etiqueta": "Quien construye una cuadrícula de fichas", "rol": "Que se ajuste sola al ancho disponible", "descripcion": "repeat(auto-fit, minmax(200px, 1fr)) genera tantas columnas como quepan, sin escribir ninguna media query." },
    { "etiqueta": "Quien maqueta header, sidebar y footer", "rol": "Definir el layout completo como un mapa visual", "descripcion": "grid-template-areas nombra cada zona y las dibuja como texto — el propio CSS se lee casi como un boceto del diseño." },
    { "etiqueta": "Quien necesita un elemento más ancho", "rol": "Que ocupe varias columnas o filas a la vez", "descripcion": "grid-column: span 2 hace que un elemento cruce dos columnas, sin cambiar el tamaño de los demás." }
  ]
}
```

## display: grid, columnas y la unidad fr

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .item { background: #7c3aed; color: white; padding: 12px; font-family: sans-serif; margin-bottom: 4px; }\n</style>\n<div class=\"item\">Uno</div>\n<div class=\"item\">Dos</div>\n<div class=\"item\">Tres</div>",
  "despues": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }\n  .item { background: #7c3aed; color: white; padding: 12px; font-family: sans-serif; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n  <div class=\"item\">Tres</div>\n</div>",
  "nota": "Antes: tres divs apilados, cada uno en su propia línea. Después: envueltos en un contenedor con display: grid y grid-template-columns: 1fr 1fr 1fr — tres columnas de ancho exactamente igual, cada fr representando una fracción del espacio disponible."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; font-family: sans-serif;\">\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">1fr</div>\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">1fr</div>\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">1fr</div>\n</div>",
  "despues": "<div style=\"display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 6px; font-family: sans-serif;\">\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">2fr</div>\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">1fr</div>\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">1fr</div>\n</div>",
  "nota": "Antes: 1fr 1fr 1fr reparte el espacio en tres partes exactamente iguales. Después: la primera columna pasa a 2fr — con 4 fracciones en total, esa columna se lleva 2/4 (la mitad) del ancho, y las otras dos 1/4 cada una. La primera es visiblemente el doble de ancha."
}
```

## Cuadrículas responsive sin una sola media query

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .contenedor {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "repeat(auto-fit, minmax(100px, 1fr))", "nota": "minmax(100px, 1fr) dice \"nunca menos de 100px, pero crece para llenar el espacio\". auto-fit crea tantas columnas como quepan según ese mínimo, y colapsa a 0 las que se queden vacías — el navegador calcula el número de columnas solo, sin ninguna media query." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 6px; width: 400px; border: 1px dashed #9ca3af; padding: 8px; font-family: sans-serif;\">\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">Uno</div>\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">Dos</div>\n</div>",
  "despues": "<div style=\"display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 6px; width: 400px; border: 1px dashed #9ca3af; padding: 8px; font-family: sans-serif;\">\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">Uno</div>\n  <div style=\"background: #7c3aed; color: white; padding: 12px; text-align: center;\">Dos</div>\n</div>",
  "nota": "Solo dos elementos en un contenedor de 400px con hueco para cuatro columnas de 100px. Antes (auto-fill): crea las cuatro pistas igualmente, pero las dos vacías se QUEDAN ahí ocupando espacio — Uno y Dos se quedan estrechos, dejando un hueco vacío a la derecha. Después (auto-fit): esas mismas pistas vacías COLAPSAN a 0 — el espacio que dejan libre se reparte entre Uno y Dos, que se estiran para llenar el contenedor entero."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .contenedor {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));\n    width: 500px;\n  }\n</style>\n<div class=\"contenedor\">\n  <div>Uno</div>\n</div>",
  "opciones": [
    "El único elemento mide 100px, dejando el resto del ancho vacío",
    "El único elemento se estira para ocupar los 500px completos, porque auto-fit colapsa las pistas vacías a 0",
    "No se crea ninguna pista, el elemento no llega a mostrarse"
  ],
  "correcta": 1,
  "explicacion": "auto-fit colapsa a 0 cualquier pista que no tenga contenido — con un solo elemento, todas las demás pistas posibles desaparecen, y ese único elemento (con 1fr) se estira para ocupar todo el espacio que queda libre: los 500px completos."
}
```

## grid-template-areas: el layout como un mapa

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 3fr; gap: 6px; font-family: sans-serif; }\n  header, aside, main, footer { color: white; padding: 8px; }\n  header { background: #7c3aed; } aside { background: #16a34a; } main { background: #f97316; } footer { background: #6b7280; }\n</style>\n<div class=\"contenedor\">\n  <header>Header</header>\n  <aside>Sidebar</aside>\n  <main>Content</main>\n  <footer>Footer</footer>\n</div>",
  "despues": "<style>\n  .contenedor {\n    display: grid;\n    grid-template-columns: 1fr 3fr;\n    grid-template-areas:\n      \"header header\"\n      \"sidebar content\"\n      \"footer footer\";\n    gap: 6px;\n    font-family: sans-serif;\n  }\n  header, aside, main, footer { color: white; padding: 8px; }\n  header { background: #7c3aed; grid-area: header; }\n  aside { background: #16a34a; grid-area: sidebar; }\n  main { background: #f97316; grid-area: content; }\n  footer { background: #6b7280; grid-area: footer; }\n</style>\n<div class=\"contenedor\">\n  <header>Header</header>\n  <aside>Sidebar</aside>\n  <main>Content</main>\n  <footer>Footer</footer>\n</div>",
  "nota": "Los mismos cuatro elementos, mismo grid-template-columns. Antes, sin grid-template-areas: se colocan automáticamente celda por celda, fila por fila — header y sidebar terminan en la misma fila, sin ningún layout con sentido. Después: grid-template-areas dibuja el mapa completo, y cada elemento se ancla a su zona nombrada con grid-area — header y footer ocupan las dos columnas, sidebar y content se reparten la fila del medio."
}
```

## Colocación por líneas: span y números de línea

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-family: sans-serif; }\n  .item { background: #7c3aed; color: white; padding: 12px; text-align: center; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; font-family: sans-serif; }\n  .item { background: #7c3aed; color: white; padding: 12px; text-align: center; }\n  .item:nth-child(1) { grid-column: span 2; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "nota": "Tres columnas iguales en los dos casos. Antes: cada elemento ocupa una sola columna. Después: el primero recibe grid-column: span 2 — cruza dos columnas de las tres, quedando el doble de ancho, y el 2 se desplaza a la fila siguiente porque ya no cabe en la primera."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "-1 solo funciona en el grid EXPLÍCITO",
  "contenido": "grid-column: 1 / -1 (de la primera a la última línea) es un patrón habitual para ocupar todo el ancho. Pero -1 solo se refiere a la última línea del grid EXPLÍCITO — el que se definió con grid-template-columns. Las pistas creadas automáticamente por desbordamiento de contenido (el grid implícito) no se pueden referenciar así."
}
```

## Lo que grid-template-areas y auto-fit/auto-fill NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "auto-fill y auto-fit hacen lo mismo, solo cambia el nombre",
      "realidad": "auto-fill CREA pistas vacías que ocupan espacio real; auto-fit las COLAPSA a 0, dejando que los elementos reales se repartan todo el espacio sobrante."
    },
    {
      "mito": "grid-template-areas acepta celdas vacías sin escribir nada",
      "realidad": "Cada celda debe llenarse con un nombre de área o un punto (.) explícito — dejar una celda en blanco invalida TODA la declaración."
    },
    {
      "mito": "Se puede usar -1 para referirse a la última línea de cualquier grid, incluidas las filas creadas automáticamente",
      "realidad": "-1 solo funciona con las líneas del grid EXPLÍCITO — las pistas creadas por desbordamiento no se pueden referenciar así."
    },
    {
      "mito": "fr es una unidad de longitud fija, como px o em",
      "realidad": "Representa una FRACCIÓN del espacio disponible — su tamaño real depende de cuánto espacio quede después de restar las pistas de tamaño fijo."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Dejar una celda sin nombre de área ni punto en grid-template-areas.", "texto": "Invalida toda la declaración, sin ningún aviso visual claro de qué salió mal." },
    { "titulo": "Confundir auto-fill (deja pistas vacías) con auto-fit (las colapsa).", "texto": "El comportamiento cambia por completo al construir una cuadrícula responsive con pocos elementos." },
    { "titulo": "Usar -1 para referirse a una fila o columna creada implícitamente.", "texto": "Solo funciona con las líneas del grid explícito, definido con grid-template-columns o grid-template-rows." },
    { "titulo": "Olvidar minmax() dentro de repeat(auto-fit, ...).", "texto": "Sin un mínimo, las columnas pueden encogerse demasiado en pantallas pequeñas." }
  ]
}
```

## Ejercicios

1. Escribe una regla que cree tres columnas iguales usando `fr`, y otra equivalente usando `repeat()`.
2. Escribe una cuadrícula responsive de tarjetas de al menos 200px de ancho cada una, sin usar ninguna media query.
3. Escribe un layout de header, sidebar, content y footer usando `grid-template-areas`.
4. Explica la diferencia real entre `auto-fill` y `auto-fit` cuando hay menos elementos de los que caben en el contenedor.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CSS grid layout",
      "descripcion": "Guía de MDN sobre grid-template-columns/rows, fr, repeat(), minmax(), grid-template-areas y la colocación por líneas.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Grid",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con el detalle de auto-fill frente a auto-fit y la limitación de las líneas negativas.",
      "url": "https://web.dev/learn/css/grid",
      "etiqueta": "web.dev"
    }
  ]
}
```
