# Principios de diseño responsive y mobile-first

- **Módulo:** Diseño responsive
- **Slug:** `principios-de-diseno-responsive-y-mobile-first` (autogenerado del título)
- **Orden:** 195
- **Fuentes:** [Responsive web design (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) — ver `contenido/css/TEMARIO.md` #40

---

## Qué es y para qué sirve

Antes de 2010, un sitio se diseñaba para escritorio, y punto — los móviles recibían una versión aparte, más simple, detectada en el servidor. Ethan Marcotte acuñó "responsive web design" ese año para describir un enfoque distinto: un mismo sitio, con grids fluidos, imágenes fluidas y media queries, que se adapta al ancho real de cada pantalla. Mobile-first invierte el orden habitual: se diseña primero para la pantalla más pequeña, y se añade complejidad progresivamente para las más grandes.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién decide el orden de diseño a propósito",
  "roles": [
    { "etiqueta": "Quien prioriza el rendimiento en móvil", "rol": "Servir lo esencial primero, lo demás después", "descripcion": "Empezar por el diseño móvil, más simple, suele significar menos CSS y menos peso inicial para quien navega desde un móvil." },
    { "etiqueta": "Quien mantiene un solo sitio universal", "rol": "Evitar una versión aparte para móvil", "descripcion": "Grids fluidos, imágenes fluidas y media queries adaptan un único sitio, sin necesitar servir un HTML distinto según el dispositivo." },
    { "etiqueta": "Quien escribe media queries desde cero", "rol": "Elegir min-width en vez de max-width por defecto", "descripcion": "mobile-first construye hacia arriba con min-width — cada media query añade algo, nunca quita." }
  ]
}
```

## El problema que resolvió el diseño responsive

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "De sitios fijos a un solo diseño fluido",
  "contenido": "Antes del diseño responsive, un sitio de ancho fijo mostraba barras de scroll en pantallas estrechas y espacio vacío de sobra en las anchas. La solución de la época era detectar el dispositivo en el servidor y servir una versión distinta para móvil. Ethan Marcotte propuso en 2010 un enfoque unificado: un solo diseño, construido con grids fluidos, imágenes fluidas y media queries, que se adapta él mismo al ancho disponible."
}
```

## La etiqueta viewport: sin ella, nada de esto funciona

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<head>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n</head>",
  "anotaciones": [
    { "fragmento": "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">", "nota": "Sin esta etiqueta, los navegadores móviles asumen por defecto un ancho de página de 980px — como si fuera una pantalla de escritorio, encogida para caber. Cualquier media query pensada para una pantalla estrecha real jamás se dispararía en un móvil sin esta línea." }
  ]
}
```

## Las tres técnicas que trabajan juntas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .contenedor {\n    display: grid;\n    grid-template-columns: 1fr 1fr 1fr;\n  }\n\n  img, video {\n    max-width: 100%;\n  }\n\n  @media (width >= 80rem) {\n    .contenedor {\n      margin: 1em 2em;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "grid-template-columns: 1fr 1fr 1fr;", "nota": "Grid fluido: las columnas se reparten en fracciones del espacio disponible, no en anchos fijos — se adaptan solas a cualquier ancho de contenedor." },
    { "fragmento": "img, video {\n    max-width: 100%;\n  }", "nota": "Medios fluidos: una imagen nunca crece más de lo que su contenedor permite, evitando que desborde en pantallas estrechas." },
    { "fragmento": "@media (width >= 80rem) {\n    .contenedor {\n      margin: 1em 2em;\n    }\n  }", "nota": "Media query: aplica reglas solo quando se cumple una condición sobre el ancho de la pantalla — el detalle completo llega en la próxima lección." }
  ]
}
```

## mobile-first: construir hacia arriba con min-width

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .wrapper {\n    max-width: 960px;\n    margin: 2em auto;\n  }\n\n  @media (width >= 600px) {\n    .wrapper {\n      display: flex;\n    }\n    .col1 { flex: 1; margin-right: 5%; }\n    .col2 { flex: 2; }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".wrapper {\n    max-width: 960px;\n    margin: 2em auto;\n  }", "nota": "Los estilos BASE, fuera de cualquier media query, son los que aplican en pantallas pequeñas por defecto — aquí, una sola columna, sin flex declarado todavía." },
    { "fragmento": "@media (width >= 600px) {\n    .wrapper {\n      display: flex;\n    }", "nota": "Desde 600px de ancho EN ADELANTE, se añade la disposición en dos columnas — el diseño gana complejidad a medida que hay más espacio, nunca al revés." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja { background: lightblue; }\n  @media (width >= 600px) {\n    .caja { background: coral; }\n  }\n</style>\n<div class=\"caja\">Caja de prueba</div>",
  "opciones": [
    "En una pantalla de 375px de ancho, la caja se ve coral, porque los media queries mobile-first siempre aplican primero el estilo más nuevo",
    "En una pantalla de 375px de ancho, la caja se ve azul claro — el media query solo aplica su regla desde 600px de ancho en adelante, nunca por debajo",
    "El resultado es el mismo en cualquier ancho de pantalla, min-width no cambia nada visualmente"
  ],
  "correcta": 1,
  "explicacion": "width >= 600px (equivalente a min-width: 600px) solo activa esa regla cuando la pantalla mide 600px o más. Por debajo de ese ancho, la regla base (lightblue) sigue aplicando — así funciona la progresión mobile-first: se añade, nunca se quita."
}
```

## Tipografía responsive: combinar unidades, no elegir solo una

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  h1 {\n    font-size: calc(1.5rem + 4vw);\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "font-size: calc(1.5rem + 4vw);", "nota": "Combina un valor fijo (1.5rem) con uno relativo al viewport (4vw) — el tamaño crece con la pantalla, pero nunca depende SOLO de vw. Un font-size en vw puro ignoraría el zoom del navegador; combinado con rem, la persona sigue pudiendo ampliar el texto." }
  ]
}
```

## Lo que el diseño responsive NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Diseño responsive significa simplemente \"hacer que quepa en cualquier pantalla\"",
      "realidad": "Es un enfoque con tres técnicas concretas trabajando juntas — grids fluidos, imágenes fluidas y media queries — no solo evitar el scroll horizontal."
    },
    {
      "mito": "mobile-first significa diseñar solo para móvil y ya está",
      "realidad": "Significa empezar por el diseño más simple y AÑADIR complejidad progresivamente para pantallas más grandes con min-width — el resultado final cubre todos los tamaños."
    },
    {
      "mito": "La etiqueta meta viewport es solo una buena práctica opcional",
      "realidad": "Sin ella, los navegadores móviles asumen un ancho de página de 980px por defecto, rompiendo cualquier media query pensada para pantallas estrechas."
    },
    {
      "mito": "vw por sí solo es la mejor unidad para tipografía responsive",
      "realidad": "Usar solo vw impide que la persona amplíe el zoom del navegador para agrandar el texto — combinarlo con una unidad fija mantiene esa posibilidad."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar la etiqueta meta viewport.", "texto": "Cualquier media query pensada para móvil no llega a dispararse nunca en un móvil real." },
    { "titulo": "Diseñar primero para escritorio y luego \"encoger\" para móvil.", "texto": "En vez de empezar por lo simple y añadir complejidad, obliga a quitar cosas — el enfoque contrario a mobile-first." },
    { "titulo": "Usar max-width en vez de min-width en media queries mobile-first.", "texto": "Invierte sin querer la lógica de progressive enhancement, pensada para construir hacia arriba." },
    { "titulo": "Usar solo vw para tipografía.", "texto": "Bloquea sin querer la capacidad de zoom del navegador de quien lee." }
  ]
}
```

## Ejercicios

1. Escribe la etiqueta meta viewport estándar que debería llevar cualquier página responsive.
2. Escribe un ejemplo mobile-first: una regla base de una sola columna, y un media query con `min-width` que la convierta en dos columnas a partir de 700px.
3. Explica la diferencia entre progressive enhancement (mobile-first) y graceful degradation (desktop-first).
4. Explica por qué `font-size: calc(1.5rem + 4vw);` es mejor que `font-size: 4vw;` para la accesibilidad del zoom del navegador.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe la etiqueta meta viewport estándar (ejercicio 1) — pruébala en la pestaña HTML. Escribe después una regla base de una columna y un media query min-width que pase a dos columnas a partir de 700px (ejercicio 2).",
  "html": "<!-- Escribe aquí tu <meta name=\"viewport\" ...> -->\n<div class=\"columnas\">\n  <div>A</div><div>B</div>\n</div>",
  "css": ".columnas { display: grid; grid-template-columns: 1fr; gap: 8px; }\n.columnas > div { background: #eee; padding: 12px; }\n/* @media (min-width: 700px) { .columnas { grid-template-columns: 1fr 1fr; } } */",
  "pestañaInicial": "html"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Responsive web design",
      "descripcion": "Guía de MDN sobre los principios del diseño responsive: la etiqueta viewport, grids e imágenes fluidas, y el enfoque mobile-first.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design",
      "etiqueta": "MDN"
    }
  ]
}
```
