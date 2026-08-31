# Estilizar listas y sus marcadores

- **Módulo:** Texto y tipografía
- **Slug:** `estilizar-listas-y-sus-marcadores` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [Styling lists (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_lists) + [Lists (web.dev)](https://web.dev/learn/css/lists) — ver `contenido/css/TEMARIO.md` #27

---

## Qué es y para qué sirve

Una lista trae, por defecto, viñetas o números, más un padding-left generoso reservado para ellos. Cambiar el símbolo es solo el principio: `list-style-position` decide si la viñeta forma parte del flujo del texto o vive fuera de él, y quitar la viñeta con `list-style-type: none` no quita el hueco que ocupaba — ese hueco hay que quitarlo aparte.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién personaliza listas más allá del símbolo",
  "roles": [
    { "etiqueta": "Quien construye un menú de navegación", "rol": "Usar una lista sin que se vea como lista", "descripcion": "list-style-type: none, junto con el padding-left correcto, convierte una <ul> semántica en una fila de enlaces sin viñetas ni sangría de sobra." },
    { "etiqueta": "Quien pone iconos como viñeta", "rol": "Controlar tamaño y posición con precisión", "descripcion": "background-image sobre cada <li> da mucho más control que list-style-image, que apenas permite ajustar tamaño o posición." },
    { "etiqueta": "Quien numera pasos hacia atrás", "rol": "Contar en el orden que el contenido necesita", "descripcion": "El atributo reversed hace que una lista ordenada cuente hacia abajo, sin reordenar ni un solo elemento del HTML." }
  ]
}
```

## list-style-type: el símbolo de cada elemento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  ul.cuadrados { list-style-type: square; }\n  ol.romanos { list-style-type: upper-roman; }\n</style>",
  "anotaciones": [
    { "fragmento": "ul.cuadrados { list-style-type: square; }", "nota": "Para listas desordenadas: disc (por defecto), circle o square son los valores más habituales." },
    { "fragmento": "ol.romanos { list-style-type: upper-roman; }", "nota": "Para listas ordenadas: decimal (por defecto), upper-roman, lower-roman, upper-alpha, lower-alpha, entre otros." }
  ]
}
```

## list-style-position: dentro o fuera del flujo del texto

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<ul style=\"width: 160px; font-family: sans-serif; list-style-position: outside;\">\n  <li>Un elemento con texto bastante largo para que se note el ajuste</li>\n</ul>",
  "despues": "<ul style=\"width: 160px; font-family: sans-serif; list-style-position: inside;\">\n  <li>Un elemento con texto bastante largo para que se note el ajuste</li>\n</ul>",
  "nota": "Mismo texto, mismo ancho de columna. Antes (outside, el valor por defecto): la viñeta vive fuera del texto — la segunda línea envuelta se alinea con el texto de la primera, no con la viñeta. Después (inside): la viñeta pasa a formar parte del flujo, como si fuera la primera palabra — la línea envuelta se alinea con el margen izquierdo de la caja, al mismo nivel que la propia viñeta."
}
```

## list-style-image tiene poco control — background-image, mucho más

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<ul style=\"font-family: sans-serif; padding-left: 20px;\">\n  <li>Elemento uno</li>\n  <li>Elemento dos</li>\n</ul>",
  "despues": "<style>\n  ul.iconos { font-family: sans-serif; padding-left: 0; list-style-type: none; }\n  ul.iconos li {\n    padding-left: 28px;\n    background-image: url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27%3E%3Cpath d=%27M8 0l2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1z%27 fill=%27%237c3aed%27/%3E%3C/svg%3E');\n    background-repeat: no-repeat;\n    background-position: 0 2px;\n    background-size: 16px 16px;\n    margin-bottom: 4px;\n  }\n</style>\n<ul class=\"iconos\">\n  <li>Elemento uno</li>\n  <li>Elemento dos</li>\n</ul>",
  "nota": "Antes: viñetas disc por defecto. Después: list-style-type: none quita el símbolo, y cada <li> recibe su propio background-image con un tamaño y una posición exactos (16×16px, 2px desde arriba) — control que list-style-image, por sí solo, no ofrece."
}
```

## El shorthand list-style

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  ul {\n    list-style: square url(\"marca.png\") inside;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "list-style: square url(\"marca.png\") inside;", "nota": "Combina los tres valores en cualquier orden: tipo, imagen y posición. Cualquiera que se omita cae en su valor por defecto (disc, none, outside)." }
  ]
}
```

## El hueco que deja list-style-type: none

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<ul style=\"list-style-type: none; font-family: sans-serif; border-left: 2px dashed #9ca3af;\">\n  <li>Elemento sin viñeta, pero con hueco</li>\n</ul>",
  "despues": "<ul style=\"list-style-type: none; font-family: sans-serif; border-left: 2px dashed #9ca3af; padding-left: 0;\">\n  <li>Elemento sin viñeta, sin hueco de más</li>\n</ul>",
  "nota": "El borde punteado marca el borde real izquierdo de la lista en los dos casos. Antes: sin viñeta visible, pero el padding-left por defecto (40px) sigue ahí — el texto empieza bien lejos del borde. Después: con padding-left: 0 añadido, el texto arranca justo en el borde — quitar la viñeta no quita el espacio que ocupaba, hay que quitarlo aparte."
}
```

## Contar hacia atrás sin reordenar el HTML

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<ol style=\"font-family: sans-serif;\">\n  <li>Primero en el HTML</li>\n  <li>Segundo en el HTML</li>\n  <li>Tercero en el HTML</li>\n</ol>",
  "despues": "<ol reversed style=\"font-family: sans-serif;\">\n  <li>Primero en el HTML</li>\n  <li>Segundo en el HTML</li>\n  <li>Tercero en el HTML</li>\n</ol>",
  "nota": "Los mismos tres <li>, en el mismo orden exacto dentro del HTML, en los dos casos. Antes: cuenta 1, 2, 3 de forma normal. Después, con el atributo reversed: cuenta 3, 2, 1 — el orden de los elementos en el HTML no cambia en absoluto, solo el número que se muestra junto a cada uno."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  ul {\n    width: 140px;\n    font-family: sans-serif;\n    list-style-position: inside;\n  }\n</style>\n<ul>\n  <li>Un elemento con texto bastante largo que necesita más de una línea</li>\n</ul>",
  "opciones": [
    "La línea envuelta se alinea justo debajo del texto de la primera línea, ignorando la viñeta",
    "La línea envuelta se alinea con el borde izquierdo de la caja, al mismo nivel que la propia viñeta",
    "El texto no envuelve nunca con list-style-position: inside, se desborda de la caja"
  ],
  "correcta": 1,
  "explicacion": "Con inside, la viñeta pasa a formar parte del flujo del texto, como si fuera la primera \"palabra\" de la línea. Las líneas siguientes se alinean con el margen izquierdo de la caja — no con el texto que sigue a la viñeta en la primera línea, como sí pasaría con outside."
}
```

## Lo que el estilo de una lista NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "list-style-type: none también quita el espacio de sangría que ocupaba la viñeta",
      "realidad": "Solo quita el símbolo visible — el padding-left que reservaba espacio para la viñeta sigue ahí, hay que quitarlo aparte."
    },
    {
      "mito": "list-style-image es la mejor forma de poner un icono personalizado como viñeta",
      "realidad": "Da muy poco control sobre tamaño y posición — un patrón con background-image y padding ofrece mucho más control."
    },
    {
      "mito": "list-style-position: inside y outside solo cambian dónde se dibuja la viñeta, nada más",
      "realidad": "También cambia cómo se alinean las líneas envueltas de un elemento con texto largo — inside las alinea con el margen de la caja, outside las alinea con el propio texto."
    },
    {
      "mito": "reversed en una lista ordenada reordena los elementos en el HTML",
      "realidad": "NO reordena nada — solo cambia el número que se muestra junto a cada elemento, contando hacia abajo en vez de hacia arriba."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Quitar list-style-type sin resetear el padding-left.", "texto": "Deja un hueco vacío donde antes estaba la viñeta — hace falta padding-left: 0 (u otro valor a propósito) aparte." },
    { "titulo": "Usar list-style-image para un icono que necesita un tamaño o posición concretos.", "texto": "background-image, con list-style-type: none, da mucho más control sobre ambas cosas." },
    { "titulo": "No ajustar line-height y font-size de una lista para que combine con el texto de alrededor.", "texto": "Una lista con su propio ritmo visual, distinto al de los párrafos vecinos, rompe la consistencia tipográfica de la página." },
    { "titulo": "Confundir reversed (invierte el CONTEO) con reordenar los elementos en el propio HTML.", "texto": "El HTML se queda exactamente igual — solo cambia el número mostrado junto a cada elemento." }
  ]
}
```

## Ejercicios

1. Escribe una regla que cambie las viñetas de una lista desordenada a cuadrados.
2. Escribe el patrón recomendado (`list-style-type: none` + `background-image`) para poner un icono personalizado como viñeta, con control total sobre su tamaño.
3. Explica por qué `list-style-type: none` por sí solo no basta para eliminar toda la sangría de una lista, y qué propiedad adicional hace falta.
4. Escribe una lista ordenada que empiece a contar desde el 5 y cuente hacia abajo.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Cambia las viñetas de esta lista a cuadrados (ejercicio 1). Después prueba el patrón list-style-type: none + background-image para un icono personalizado (ejercicio 2). Escribe una ol que empiece en 5 y cuente hacia abajo (ejercicio 4).",
  "html": "<ul class=\"lista\">\n  <li>Elemento uno</li>\n  <li>Elemento dos</li>\n</ul>\n<ol class=\"ranking\">\n  <li>Elemento</li>\n  <li>Elemento</li>\n</ol>",
  "css": ".lista { /* cambia list-style-type aquí */ }",
  "pestañaInicial": "css"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Styling lists",
      "descripcion": "Guía de MDN sobre list-style-type, list-style-position, list-style-image, el shorthand list-style y los atributos start/reversed/value de las listas ordenadas.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_lists",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Lists",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre listas, con detalle de las propiedades limitadas que acepta el pseudo-elemento ::marker.",
      "url": "https://web.dev/learn/css/lists",
      "etiqueta": "web.dev"
    }
  ]
}
```
