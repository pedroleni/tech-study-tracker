# Espaciado y alineación de texto

- **Módulo:** Texto y tipografía
- **Slug:** `espaciado-y-alineacion-de-texto` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [Text and font fundamentals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals) + [Spacing (web.dev)](https://web.dev/learn/css/spacing) — ver `contenido/css/TEMARIO.md` #25

---

## Qué es y para qué sirve

`text-align` decide hacia dónde se alinea el texto dentro de su caja. `line-height` decide cuánto aire hay entre líneas — y, según cómo se escriba, puede heredarse de formas muy distintas. `letter-spacing` y `word-spacing` ajustan el espacio entre caracteres y entre palabras. Ninguna de las cuatro es tan simple como "más espacio siempre es mejor" — cada una tiene un punto donde deja de ayudar a la lectura y empieza a estorbarla.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién ajusta el espaciado de texto a propósito",
  "roles": [
    { "etiqueta": "Quien maqueta bloques largos de texto", "rol": "Elegir un line-height que no canse la vista", "descripcion": "Un interlineado de 1.5 a 2 facilita seguir la línea siguiente sin perderse — demasiado apretado, las líneas se mezclan visualmente." },
    { "etiqueta": "Quien diseña titulares en mayúsculas", "rol": "Separar las letras sin tocar el espacio entre palabras", "descripcion": "letter-spacing da ese efecto de \"tracking\" tan común en titulares — sin afectar en nada al espacio entre las palabras." },
    { "etiqueta": "Quien justifica columnas estrechas", "rol": "Saber cuándo justify ayuda y cuándo perjudica", "descripcion": "En una columna ancha puede verse bien; en una estrecha, con palabras largas, puede crear huecos irregulares entre palabras." }
  ]
}
```

## text-align: cuatro valores, uno con truco

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .izq { text-align: left; }\n  .der { text-align: right; }\n  .centro { text-align: center; }\n  .justif { text-align: justify; }\n</style>",
  "anotaciones": [
    { "fragmento": ".justif { text-align: justify; }", "nota": "Estira el espacio ENTRE PALABRAS para que todas las líneas midan exactamente el mismo ancho, salvo la última. En columnas estrechas o con palabras largas, ese estiramiento puede quedar muy irregular de una línea a otra." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"width: 180px; font-family: sans-serif; text-align: left;\">Los extraordinarios acontecimientos internacionales sorprendieron a los espectadores.</p>",
  "despues": "<p style=\"width: 180px; font-family: sans-serif; text-align: justify;\">Los extraordinarios acontecimientos internacionales sorprendieron a los espectadores.</p>",
  "nota": "Mismo texto, mismo ancho de columna (180px), con palabras deliberadamente largas. Antes (left): el margen derecho queda irregular (\"en bandera\"), pero el espacio entre palabras es siempre el mismo. Después (justify): los dos márgenes quedan rectos, pero a costa de huecos claramente desiguales entre palabras de una línea a otra."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Si se usa justify, conviene añadir hyphens",
  "contenido": "hyphens permite que el navegador parta palabras largas entre líneas con un guion, reduciendo los huecos irregulares que justify puede crear. Por sí solo, justify no soluciona ese problema — hyphens es el complemento que suele recomendarse junto a él."
}
```

## line-height: sin unidad, casi siempre

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"width: 220px; font-family: sans-serif; line-height: 1;\">Este es un párrafo de varias líneas para comparar visualmente el espacio entre cada línea de texto.</p>",
  "despues": "<p style=\"width: 220px; font-family: sans-serif; line-height: 1.8;\">Este es un párrafo de varias líneas para comparar visualmente el espacio entre cada línea de texto.</p>",
  "nota": "Mismo texto, mismo ancho. line-height: 1 (antes) apenas deja aire entre líneas — se siente denso, difícil de seguir. line-height: 1.8 (después) separa las líneas lo suficiente para que la vista encuentre fácilmente el inicio de la siguiente. Para texto de lectura larga, MDN recomienda algo entre 1.5 y 2."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "line-height en px se hereda literal, sin recalcularse",
  "contenido": "Un line-height en unidades absolutas (como 20px) se hereda como ESE MISMO número en los hijos, sin importar el font-size de cada uno. Un line-height sin unidad (como 1.4) actúa como un multiplicador que SÍ se recalcula según el font-size propio de cada elemento — el mismo problema que distingue em de rem, aplicado aquí a line-height."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { line-height: 20px; font-family: sans-serif; font-size: 14px; width: 200px; }\n  .grande { font-size: 26px; display: block; }\n</style>\n<div class=\"contenedor\">\n  <span class=\"grande\">Texto grande que ocupa dos líneas completas</span>\n</div>",
  "despues": "<style>\n  .contenedor { line-height: 1.4; font-family: sans-serif; font-size: 14px; width: 200px; }\n  .grande { font-size: 26px; display: block; }\n</style>\n<div class=\"contenedor\">\n  <span class=\"grande\">Texto grande que ocupa dos líneas completas</span>\n</div>",
  "nota": "El texto grande (26px) hereda el line-height del contenedor en los dos casos. Antes (line-height: 20px): hereda literalmente 20px, MENOS que su propio tamaño de letra — las dos líneas quedan apretadas, casi tocándose. Después (line-height: 1.4, sin unidad): se recalcula sobre 26px (26 × 1.4 ≈ 36px) — las mismas dos líneas quedan con un espacio cómodo entre ellas."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .padre { line-height: 20px; font-size: 14px; }\n  .hijo { font-size: 30px; }\n</style>\n<div class=\"padre\">\n  Texto normal<br>\n  <span class=\"hijo\">Texto grande</span>\n</div>",
  "opciones": [
    "El span hereda un line-height proporcional a su propio tamaño de 30px, recalculado automáticamente",
    "El span hereda literalmente 20px de line-height, el mismo valor absoluto que el texto normal más pequeño",
    "El span ignora el line-height heredado y usa el valor por defecto del navegador"
  ],
  "correcta": 1,
  "explicacion": "Un line-height en px se hereda como ese mismo valor calculado, sin recalcularse según el font-size del hijo — 20px sigue siendo 20px, aunque el texto dentro mida 30px. Por eso un valor sin unidad es la opción recomendada: sí se recalcula por cada elemento según su propio tamaño."
}
```

## letter-spacing y word-spacing

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<h3 style=\"font-family: sans-serif; text-transform: uppercase; letter-spacing: normal;\">Título de sección</h3>",
  "despues": "<h3 style=\"font-family: sans-serif; text-transform: uppercase; letter-spacing: 4px;\">Título de sección</h3>",
  "nota": "letter-spacing: 4px separa cada CARÁCTER individual — el efecto de \"tracking\" habitual en titulares en mayúsculas. word-spacing haría lo mismo, pero entre PALABRAS completas, sin tocar el espacio entre las letras de una misma palabra."
}
```

## text-indent: sangría de la primera línea

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  p {\n    text-indent: 2em;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "text-indent: 2em;", "nota": "Sangra solo la PRIMERA línea de cada párrafo donde se aplique — como en un libro impreso. No afecta a las líneas siguientes del mismo párrafo, ni a otros párrafos salvo que la regla también los alcance." }
  ]
}
```

## Lo que el espaciado de texto NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "text-align: justify siempre mejora la legibilidad al alinear los dos márgenes",
      "realidad": "Puede crear huecos irregulares entre palabras, especialmente en columnas estrechas o con palabras largas — a menudo empeora la legibilidad en vez de mejorarla."
    },
    {
      "mito": "line-height en px y line-height sin unidad se comportan igual, solo cambia la sintaxis",
      "realidad": "El valor en px se hereda literal en los hijos, sin recalcularse; el valor sin unidad se recalcula según el font-size de cada elemento — el mismo problema que distingue em de rem, aplicado a line-height."
    },
    {
      "mito": "letter-spacing y word-spacing son la misma propiedad con otro nombre",
      "realidad": "letter-spacing separa CARACTERES individuales; word-spacing separa PALABRAS completas — efectos visuales distintos."
    },
    {
      "mito": "text-indent solo funciona en la primera línea de todo el texto de una página",
      "realidad": "Se aplica a la primera línea de CADA bloque donde se declara — un párrafo, una celda, cualquier contenedor de texto por separado."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar text-align: justify sin probar con contenido real.", "texto": "Arriesga huecos feos entre palabras que solo se notan con texto de verdad, no con un párrafo corto de prueba." },
    { "titulo": "Fijar line-height en px en un contenedor con texto de tamaños distintos dentro.", "texto": "El texto más grande hereda ese mismo valor absoluto, quedando apretado en vez de proporcional a su propio tamaño." },
    { "titulo": "Confundir letter-spacing con word-spacing al ajustar un titular.", "texto": "Uno afecta a las letras dentro de cada palabra, el otro al espacio entre palabras completas." },
    { "titulo": "Abusar de letter-spacing positivo en párrafos largos de texto normal.", "texto": "Legible en titulares cortos, incómodo de leer en bloques largos de texto corrido." }
  ]
}
```

## Ejercicios

1. Escribe una regla que centre un título y justifique un párrafo largo, explicando el riesgo de hacerlo con ese párrafo.
2. Explica por qué `line-height: 24px` en un contenedor puede verse mal en un hijo con `font-size` mucho más grande, y cómo solucionarlo.
3. Escribe una regla que aumente el `letter-spacing` de un titular en mayúsculas, sin afectar al espacio entre palabras.
4. Escribe una regla con `text-indent` que sangre la primera línea de cada párrafo, como en un libro impreso.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Text and font fundamentals",
      "descripcion": "Guía de MDN sobre text-align, line-height, letter-spacing, word-spacing y text-indent.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Spacing",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre márgenes, padding y consistencia en el espaciado — la base del \"ritmo vertical\" entre bloques de texto.",
      "url": "https://web.dev/learn/css/spacing",
      "etiqueta": "web.dev"
    }
  ]
}
```
