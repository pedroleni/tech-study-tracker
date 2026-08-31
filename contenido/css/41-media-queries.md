# Media queries

- **Módulo:** Diseño responsive
- **Slug:** `media-queries` (autogenerado del título)
- **Orden:** 200
- **Fuentes:** [Media queries (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries) — ver `contenido/css/TEMARIO.md` #41

---

## Qué es y para qué sirve

`@media` aplica CSS solo si se cumple una condición sobre el entorno: el ancho de la pantalla, su orientación, si el dispositivo tiene ratón o solo dedo, o si la persona pidió menos movimiento en su sistema. La lección anterior ya usó una — `@media (width >= 600px)` — sin explicar del todo su sintaxis. Esta entra en el detalle completo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién escribe condiciones sobre el entorno de lectura",
  "roles": [
    { "etiqueta": "Quien adapta un layout al ancho", "rol": "Cambiar de una columna a varias según el espacio", "descripcion": "Las condiciones de width son las más habituales — la base de cualquier diseño responsive." },
    { "etiqueta": "Quien respeta preferencias del sistema", "rol": "Detectar modo oscuro o menos movimiento", "descripcion": "prefers-color-scheme y prefers-reduced-motion permiten adaptar el sitio a una preferencia real, ya configurada, sin pedir nada de nuevo." },
    { "etiqueta": "Quien distingue táctil de ratón", "rol": "Ajustar el tamaño de los objetivos de clic", "descripcion": "pointer: coarse detecta pantallas táctiles, donde conviene un objetivo de clic más grande que en un ratón preciso." }
  ]
}
```

## La sintaxis básica

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media screen and (width >= 600px) {\n    body {\n      color: blue;\n    }\n  }\n\n  @media print {\n    body {\n      font-size: 12pt;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@media screen and (width >= 600px) {", "nota": "screen es el TIPO de medio (pantalla, frente a print o all); lo que sigue tras and es la CONDICIÓN que también debe cumplirse." },
    { "fragmento": "@media print {\n    body {\n      font-size: 12pt;\n    }\n  }", "nota": "Los estilos dentro de @media print solo se aplican al imprimir la página — nunca en pantalla, sin importar el ancho de la ventana." }
  ]
}
```

## Sintaxis moderna de rango frente a la clásica

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media (width >= 40em) {\n    /* Moderna: igual o mayor que 40em */\n  }\n\n  @media (min-width: 40em) {\n    /* Clásica: exactamente lo mismo */\n  }\n\n  @media (30em <= width <= 50em) {\n    /* Moderna: entre dos valores a la vez */\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@media (width >= 40em) {\n    /* Moderna: igual o mayor que 40em */\n  }", "nota": "La sintaxis con >=, <=, > y < es la forma moderna de expresar rangos — más legible, pero produce exactamente el mismo resultado que min-width/max-width." },
    { "fragmento": "@media (30em <= width <= 50em) {\n    /* Moderna: entre dos valores a la vez */\n  }", "nota": "Equivale exactamente a @media (min-width: 30em) and (max-width: 50em) — un solo rango con dos límites, en vez de dos condiciones unidas con and." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  @media (30em <= width <= 50em) {\n    body { background: coral; }\n  }\n</style>",
  "opciones": [
    "Es exactamente lo mismo que @media (min-width: 30em) and (max-width: 50em) { }",
    "Solo funciona con un único valor, no con un rango de dos límites",
    "coral se aplica siempre, sin importar el ancho de la pantalla"
  ],
  "correcta": 0,
  "explicacion": "La sintaxis de rango con dos comparaciones (30em <= width <= 50em) es equivalente exacta a combinar min-width y max-width con and — dos formas distintas de escribir la misma condición."
}
```

## Combinar condiciones: and, comas, not

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media screen and (width >= 600px) and (orientation: landscape) {\n    /* Las DOS condiciones deben cumplirse */\n  }\n\n  @media screen and (width >= 600px), screen and (orientation: landscape) {\n    /* Con CUALQUIERA de las dos basta */\n  }\n\n  @media not (width >= 600px) {\n    /* Se cumple cuando la condición NO se cumple */\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@media screen and (width >= 600px) and (orientation: landscape) {", "nota": "and encadena condiciones que deben cumplirse TODAS a la vez." },
    { "fragmento": "@media screen and (width >= 600px), screen and (orientation: landscape) {", "nota": "Una coma actúa como \"o\": basta con que se cumpla cualquiera de las dos consultas separadas por comas." },
    { "fragmento": "@media not (width >= 600px) {", "nota": "not invierte el resultado de la condición — aquí, se cumple cuando la pantalla mide MENOS de 600px, lo contrario de la condición original." }
  ]
}
```

## Elegir un breakpoint: por el contenido, no por el dispositivo

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Los breakpoints no deberían apuntar a un dispositivo concreto",
  "contenido": "Es tentador elegir 375px porque \"es el ancho de tal iPhone\". MDN recomienda lo contrario: usar las herramientas de desarrollador para ir estrechando la ventana hasta encontrar el punto exacto donde el CONTENIDO empieza a verse mal — ese es el breakpoint real, no el ancho de un modelo de teléfono que puede dejar de venderse mañana."
}
```

## orientation, pointer y hover: más allá del ancho

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media (orientation: landscape) {\n    /* Más ancho que alto */\n  }\n\n  @media (pointer: coarse) {\n    /* Pantalla táctil: objetivos de clic más grandes */\n  }\n\n  @media (hover: hover) {\n    /* El DISPOSITIVO puede hacer hover, como un ratón */\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@media (pointer: coarse) {\n    /* Pantalla táctil: objetivos de clic más grandes */\n  }", "nota": "pointer: coarse detecta un dispositivo señalador impreciso, típicamente un dedo en pantalla táctil; pointer: fine detecta uno preciso, como un ratón o un trackpad." },
    { "fragmento": "@media (hover: hover) {\n    /* El DISPOSITIVO puede hacer hover, como un ratón */\n  }", "nota": "Detecta si el DISPOSITIVO tiene capacidad de hover en absoluto — no si el ratón está encima de algo en este instante concreto. Eso último lo hace la pseudo-clase :hover, una cosa completamente distinta." }
  ]
}
```

## Preferencias del sistema: color y movimiento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @media (prefers-color-scheme: dark) {\n    body {\n      background: #111827;\n      color: #f3f4f6;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@media (prefers-color-scheme: dark) {", "nota": "Se cumple cuando la persona configuró su sistema operativo o navegador en modo oscuro — una preferencia YA existente, sin pedir nada nuevo ni añadir un interruptor propio." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "prefers-reduced-motion tiene su propia lección dedicada",
  "contenido": "prefers-reduced-motion detecta si la persona pidió menos movimiento en su sistema — clave de accesibilidad para quien las animaciones pueden marear o distraer. Por su importancia y su base normativa (WCAG), tiene su propia lección más adelante, con el detalle completo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Las container queries resuelven un problema distinto",
  "contenido": "Una media query siempre responde al VIEWPORT completo — nunca al tamaño de un contenedor concreto dentro de la página. Para eso existen las container queries, un tema relacionado pero distinto, que llega en la siguiente lección."
}
```

## Lo que las media queries NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "min-width y max-width ya no funcionan, hay que usar siempre la sintaxis moderna",
      "realidad": "Siguen totalmente soportados — la sintaxis con >= y <= es más reciente y más legible, pero no sustituye obligatoriamente a la anterior."
    },
    {
      "mito": "Un breakpoint debería coincidir con el ancho exacto de un dispositivo concreto",
      "realidad": "MDN recomienda elegir breakpoints donde el CONTENIDO empieza a romperse, no según el tamaño de un modelo de teléfono en particular."
    },
    {
      "mito": "hover: hover detecta si el ratón está encima de un elemento en este instante",
      "realidad": "Detecta si el DISPOSITIVO tiene capacidad de hover en absoluto — un estado activo de hover lo detecta la pseudo-clase :hover, no esta media query."
    },
    {
      "mito": "Las container queries son solo otra forma de escribir media queries",
      "realidad": "Responden al tamaño del CONTENEDOR de un elemento, no al del viewport — resuelven un problema distinto y complementario."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Elegir breakpoints según el tamaño de un dispositivo concreto.", "texto": "En vez de dónde el propio contenido empieza a romperse — los dispositivos cambian, el contenido es lo que decide de verdad." },
    { "titulo": "Confundir hover: hover con la pseudo-clase :hover.", "texto": "Una es la capacidad del dispositivo; la otra, el estado activo de un elemento en un momento concreto." },
    { "titulo": "No respetar prefers-reduced-motion en animaciones.", "texto": "Ignora una preferencia de accesibilidad real que la persona ya configuró en su sistema." },
    { "titulo": "Usar una media query cuando lo que hace falta es una container query.", "texto": "Una condición de viewport no resuelve una necesidad de tamaño de un contenedor concreto dentro de la página." }
  ]
}
```

## Ejercicios

1. Escribe una media query, en la sintaxis moderna, que aplique estilos solo cuando la pantalla mida 768px o más.
2. Escribe la misma regla del ejercicio anterior usando la sintaxis clásica `min-width`.
3. Escribe una media query que combine dos condiciones con `and`: ancho mínimo de 600px Y orientación landscape.
4. Explica la diferencia entre `hover: hover` y la pseudo-clase `:hover`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe una media query en sintaxis moderna para 768px o más (ejercicio 1) y la misma con min-width clásico (ejercicio 2). Combina dos condiciones con and: ancho mínimo 600px Y orientación landscape (ejercicio 3).",
  "html": "<div class=\"caja\">Cambia de color según el tamaño de la ventana</div>",
  "css": ".caja { background: #ddd; padding: 16px; }\n/* @media (width >= 768px) { .caja { background: lightgreen; } } */",
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
      "titulo": "Media queries",
      "descripcion": "Guía de MDN sobre @media: tipos de medio, sintaxis de rango moderna y clásica, combinación de condiciones, orientation, pointer/hover y las preferencias del sistema.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries",
      "etiqueta": "MDN"
    }
  ]
}
```
