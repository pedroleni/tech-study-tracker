# Rendimiento CSS: containment y content-visibility

- **Módulo:** Calidad, rendimiento y organización
- **Slug:** `rendimiento-css-containment-y-content-visibility` (autogenerado del título)
- **Orden:** 275
- **Fuentes:** [CSS performance optimization (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS) + [Using CSS containment (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Using) — ver `contenido/css/TEMARIO.md` #56

---

## Qué es y para qué sirve

No toda propiedad CSS cuesta lo mismo cambiar. El navegador procesa una página en fases — estilo, layout, pintado, composición — y algunas propiedades obligan a repetir fases caras; otras solo tocan la más barata. `contain` y `content-visibility` van más allá: le dicen al navegador que una parte de la página es independiente, para que pueda saltarse trabajo por completo mientras no sea relevante.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que el navegador trabaje menos, no más rápido",
  "roles": [
    { "etiqueta": "Quien anima sin recalcular layout", "rol": "Elegir propiedades baratas de animar", "descripcion": "transform y opacity solo afectan a la fase de composición; width, top o margin obligan a recalcular el layout entero." },
    { "etiqueta": "Quien acelera listas muy largas", "rol": "Saltar el renderizado de lo que no se ve", "descripcion": "content-visibility: auto evita que el navegador calcule el layout y pinte cientos de artículos que están fuera de pantalla." },
    { "etiqueta": "Quien mide antes de optimizar", "rol": "Usar DevTools para encontrar el cuello de botella real", "descripcion": "No todas las técnicas de rendimiento hacen falta en todas partes — hay que medir antes de aplicar cualquiera de ellas a ciegas." }
  ]
}
```

## El pipeline del navegador: por qué no todo cuesta igual

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Estilo → layout → pintado → composición",
  "contenido": "El navegador procesa una página en fases: calcula qué estilos aplican, luego el LAYOUT (posición y tamaño de cada elemento), luego el PINTADO (los píxeles reales) y por último la COMPOSICIÓN (combinar capas). Cambiar width o top obliga a repetir layout, pintado y composición — las tres fases caras. Cambiar transform u opacity solo toca composición, la más barata de las tres."
}
```

## Animar barato: transform y opacity

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caro {\n    transition: width 300ms, top 300ms;\n  }\n\n  .barato {\n    transition: transform 300ms, opacity 300ms;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".caro {\n    transition: width 300ms, top 300ms;\n  }", "nota": "width y top obligan a recalcular el layout en cada fotograma de la transición — el mismo efecto visual (mover, cambiar tamaño) suele lograrse con transform, mucho más barato." },
    { "fragmento": ".barato {\n    transition: transform 300ms, opacity 300ms;\n  }", "nota": "transform y opacity solo afectan a la fase de composición — el navegador puede animarlas sin recalcular el layout de nada más en la página." }
  ]
}
```

## contain: aislar una parte de la página

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  article {\n    contain: layout paint style;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "contain: layout paint style;", "nota": "layout aísla la disposición del elemento del resto de la página (los floats internos no afectan a nada de fuera); paint recorta cualquier desbordamiento visual; style evita que contadores CSS internos afecten al resto del documento." }
  ]
}
```

## contain: content, el shorthand recomendado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  article {\n    contain: content;\n  }\n\n  .maximo {\n    contain: strict;\n    contain-intrinsic-size: 80vw auto none;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "contain: content;", "nota": "Equivale a layout paint style — deliberadamente SIN size, lo que lo hace seguro para aplicar de forma amplia sin riesgo de colapsar elementos." },
    { "fragmento": "contain: strict;", "nota": "Equivale a size layout paint style — el aislamiento máximo, pero incluye size: sin un contain-intrinsic-size explícito, el elemento puede colapsar a tamaño cero." }
  ]
}
```

## content-visibility: saltar el renderizado por completo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  article {\n    content-visibility: auto;\n    contain-intrinsic-size: 1000px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "content-visibility: auto;", "nota": "Aplica automáticamente contain: layout paint style, y ADEMÁS salta por completo el layout y el pintado de artículos que están fuera de pantalla — solo se renderizan cuando se acercan al viewport." },
    { "fragmento": "contain-intrinsic-size: 1000px;", "nota": "Mientras el artículo no se renderiza, el navegador reserva este alto como marcador de posición — sin esto, el scroll saltaría de forma brusca (jank) al no saber cuánto espacio ocupará cada artículo todavía sin renderizar." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "auto no es lo mismo que hidden",
  "contenido": "content-visibility: auto salta el renderizado de contenido fuera de pantalla, pero ese contenido SIGUE siendo accesible para la búsqueda del navegador (Ctrl+F), el tabulado con teclado y la selección de texto. content-visibility: hidden va más allá: oculta el contenido también para esas interacciones, de forma parecida a visibility: hidden."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .con-auto { content-visibility: auto; }\n  .con-hidden { content-visibility: hidden; }\n</style>",
  "opciones": [
    "Las dos se comportan igual frente a la búsqueda del navegador (Ctrl+F)",
    "Solo .con-auto sigue siendo encontrable por búsqueda, tabulado y selección, aunque no se renderice mientras está fuera de pantalla",
    "Solo .con-hidden mantiene el contenido accesible; .con-auto lo oculta por completo"
  ],
  "correcta": 1,
  "explicacion": "content-visibility: auto salta el trabajo de renderizado mientras el contenido no es relevante, pero lo mantiene accesible para búsqueda, tabulado y selección. hidden oculta el contenido también para esas interacciones — una diferencia importante más allá del rendimiento."
}
```

## will-change: un último recurso, no una prevención

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a-punto-de-animar {\n    will-change: transform, opacity;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "will-change: transform, opacity;", "nota": "Avisa al navegador con antelación de qué va a cambiar, para que pueda prepararse. Debe usarse como ÚLTIMO RECURSO ante un problema de rendimiento ya detectado — no de forma preventiva sobre elementos que \"algún día podrían\" animarse, ya que el propio aviso tiene un coste." }
  ]
}
```

## Selectores simples frente a selectores muy específicos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  /* Más lento de analizar, más frágil */\n  body div#main-content article.post h2.headline {\n    font-size: 24px;\n  }\n\n  /* Más simple, más rápido, más mantenible */\n  .headline {\n    font-size: 24px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "body div#main-content article.post h2.headline {", "nota": "Una cadena larga de selectores no solo es más lenta de analizar — también es más frágil: cualquier cambio en la estructura del HTML puede romper la regla entera." }
  ]
}
```

## Lo que containment y content-visibility NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Todas las propiedades CSS cuestan lo mismo animar",
      "realidad": "width, top o margin obligan a recalcular el layout completo; transform y opacity solo afectan a la fase de composición, mucho más barata."
    },
    {
      "mito": "contain: strict es siempre la opción más segura, por aplicar el máximo aislamiento",
      "realidad": "Incluye size, que puede colapsar el elemento a tamaño cero sin un contain-intrinsic-size explícito — contain: content es la opción segura para aplicar de forma amplia."
    },
    {
      "mito": "content-visibility: hidden y content-visibility: auto hacen exactamente lo mismo",
      "realidad": "auto mantiene el contenido offscreen accesible para búsqueda, tabulado y selección; hidden lo oculta también para esas interacciones."
    },
    {
      "mito": "will-change se debería añadir de forma preventiva a cualquier elemento que algún día podría animarse",
      "realidad": "Es un último recurso para un problema de rendimiento YA detectado — usarlo preventivamente genera más coste del que ahorra."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Animar width o top esperando el mismo rendimiento que transform.", "texto": "Obliga a recalcular layout y pintado en cada fotograma, a diferencia de transform/opacity." },
    { "titulo": "Usar contain: strict sin dar un contain-intrinsic-size explícito.", "texto": "El elemento puede colapsar a tamaño cero al aplicar size containment." },
    { "titulo": "Confundir content-visibility: hidden con auto.", "texto": "La accesibilidad de la búsqueda y el tabulado cambia por completo entre ambos." },
    { "titulo": "Añadir will-change de forma preventiva, sin un problema real detectado.", "texto": "El propio aviso al navegador tiene un coste — no es gratis." }
  ]
}
```

## Ejercicios

1. Escribe una regla que anime `opacity` y `transform` en vez de `top` y `left` para lograr el mismo efecto visual.
2. Escribe una regla `content-visibility: auto` con un `contain-intrinsic-size` razonable para una lista larga de artículos.
3. Explica la diferencia entre `contain: content` y `contain: strict`.
4. Explica por qué `will-change` no debería añadirse a un elemento "por si acaso" en el futuro.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CSS performance optimization",
      "descripcion": "Guía de MDN sobre el pipeline de renderizado, propiedades baratas frente a caras de animar, will-change y selectores eficientes.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Using CSS containment",
      "descripcion": "Referencia de MDN sobre contain (layout, paint, size, style, content, strict), content-visibility y contain-intrinsic-size.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Using",
      "etiqueta": "MDN"
    }
  ]
}
```
