# Fundamentos de texto: font-family, tamaño y peso

- **Módulo:** Texto y tipografía
- **Slug:** `fundamentos-de-texto-font-family-tamano-y-peso` (autogenerado del título)
- **Orden:** 115
- **Fuentes:** [Text and font fundamentals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals) + [Text and typography (web.dev)](https://web.dev/learn/css/typography) — ver `contenido/css/TEMARIO.md` #24

---

## Qué es y para qué sirve

`font-family` no es "la fuente" — es una LISTA de fuentes, probadas en orden hasta encontrar una disponible. `font-size` casi siempre debería medirse en `rem`, no en `px`, para heredar del tamaño raíz del documento. Y `font-weight: bold` es, literalmente, el mismo valor que `font-weight: 700` — dos formas de escribir la misma cosa.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién configura la tipografía base a propósito",
  "roles": [
    { "etiqueta": "Quien define la tipografía de un sitio", "rol": "Que el texto nunca se quede sin una fuente razonable", "descripcion": "Un font stack bien construido siempre termina en un nombre genérico — así el texto nunca cae en la fuente por defecto del navegador sin ningún aviso." },
    { "etiqueta": "Quien escala texto de forma consistente", "rol": "Cambiar un solo valor y mover todo el tamaño del sitio", "descripcion": "Con font-size en rem en todas partes, cambiar el font-size de la raíz reescala cada texto del documento a la vez, de forma proporcional." },
    { "etiqueta": "Quien pide un peso de fuente concreto", "rol": "Saber si esa fuente de verdad lo tiene disponible", "descripcion": "La mayoría de las fuentes no variables solo tienen 400 y 700 de verdad — pedir un 300 o un 600 puede no dar el resultado esperado." }
  ]
}
```

## El font stack: una lista, no un nombre

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin un genérico al final, el resultado puede sorprender",
  "contenido": "Si ninguna fuente de la lista está disponible y no hay un nombre GENÉRICO al final (serif, sans-serif, monospace...), el navegador usa su propia fuente por defecto — que suele ser un serif como Times New Roman. Para un diseño pensado en sans-serif, eso puede verse completamente fuera de lugar, sin ningún aviso ni error."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"font-family: 'FuenteQueNoExiste'; font-size: 1.4em;\">Texto de prueba con una fuente inventada</p>",
  "despues": "<p style=\"font-family: 'FuenteQueNoExiste', sans-serif; font-size: 1.4em;\">Texto de prueba con una fuente inventada</p>",
  "nota": "\"FuenteQueNoExiste\" no existe en ningún sistema, en los dos casos. Antes, sin ningún genérico de respaldo, el navegador cae en SU propia fuente por defecto — normalmente un serif, con remates visibles en los trazos. Después, con sans-serif al final de la lista, el texto se ve con una tipografía de palo seco limpia — la diferencia entre los dos viene solo de esa última palabra en la lista."
}
```

## font-size: casi siempre en rem

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  html {\n    font-size: 16px;\n  }\n\n  h1 {\n    font-size: 3rem;\n  }\n\n  p {\n    font-size: 1rem;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "html {\n    font-size: 16px;\n  }", "nota": "El font-size de la raíz — 16px es el valor por defecto en todos los navegadores. Cada rem del resto del documento se calcula sobre ESTE valor." },
    { "fragmento": "h1 {\n    font-size: 3rem;\n  }", "nota": "3rem = 3 × 16px = 48px, sin importar el font-size de ningún elemento padre intermedio — a diferencia de em, rem siempre mira a la raíz." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  html { font-size: 16px; }\n  h2 { font-size: 2rem; font-family: sans-serif; margin: 0; }\n  p { font-size: 1rem; font-family: sans-serif; }\n</style>\n<h2>Título</h2>\n<p>Párrafo de prueba</p>",
  "despues": "<style>\n  html { font-size: 24px; }\n  h2 { font-size: 2rem; font-family: sans-serif; margin: 0; }\n  p { font-size: 1rem; font-family: sans-serif; }\n</style>\n<h2>Título</h2>\n<p>Párrafo de prueba</p>",
  "nota": "El único cambio es el font-size del html, de 16px a 24px — ninguna otra regla se toca. El título (2rem) Y el párrafo (1rem) crecen juntos, de forma proporcional, porque los dos están medidos en rem: un solo número en la raíz escala todo el documento a la vez."
}
```

## font-weight: bold es literalmente 700

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { font-weight: bold; }\n  .b { font-weight: 700; }\n  .c { font-weight: 600; }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { font-weight: bold; }", "nota": "bold es un alias directo de 700 — las dos formas producen exactamente el mismo resultado, siempre." },
    { "fragmento": ".c { font-weight: 600; }", "nota": "La mayoría de las fuentes que NO son variable fonts solo tienen de verdad los pesos 400 y 700 en su archivo. Pedir 600 en una de esas fuentes hace que el navegador sustituya el peso disponible más cercano — el resultado puede no verse distinto de 400 o de 700, según la fuente." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"font-weight: normal; font-family: sans-serif; font-size: 1.5em;\">Texto de prueba</p>",
  "despues": "<p style=\"font-weight: bold; font-family: sans-serif; font-size: 1.5em;\">Texto de prueba</p>",
  "nota": "normal (400) frente a bold (700, el peso que casi todas las fuentes garantizan de verdad) — el contraste más fiable entre dos pesos, sin depender de si la fuente tiene variantes intermedias."
}
```

## font-style: italic frente a oblique

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { font-style: italic; }\n  .b { font-style: oblique; }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { font-style: italic; }", "nota": "Usa la variante itálica REAL del archivo de la fuente, si el archivo la incluye — un diseño distinto, no solo el normal inclinado." },
    { "fragmento": ".b { font-style: oblique; }", "nota": "Siempre simula la inclinación aplicando una transformación sobre la versión normal de la fuente — nunca usa un archivo itálico separado, exista o no." }
  ]
}
```

## El shorthand font: solo dos partes son obligatorias

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a {\n    font: italic bold 1.2rem/1.5 \"Helvetica\", Arial, sans-serif;\n  }\n\n  .b {\n    font: 1rem sans-serif;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".a {\n    font: italic bold 1.2rem/1.5 \"Helvetica\", Arial, sans-serif;\n  }", "nota": "Estilo, peso, tamaño/interlineado (separados por /) y family, en ese orden. La barra entre 1.2rem y 1.5 es obligatoria cuando se incluye line-height en el shorthand." },
    { "fragmento": ".b {\n    font: 1rem sans-serif;\n  }", "nota": "De todas las partes posibles del shorthand, solo font-size y font-family son obligatorias — el resto (estilo, peso, interlineado) se puede omitir y toma su valor por defecto." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  p { font-family: \"FuenteInventada\", \"OtraFuenteInventada\", sans-serif; }\n</style>\n<p>Texto de prueba</p>",
  "opciones": [
    "El navegador prueba las fuentes en orden: como ninguna de las dos primeras existe, termina usando la genérica sans-serif",
    "El navegador usa siempre la ÚLTIMA fuente de la lista que exista, sin importar el orden en que se escriban",
    "Falla toda la regla porque las dos primeras fuentes no existen en el sistema"
  ],
  "correcta": 0,
  "explicacion": "font-family prueba cada nombre EN ORDEN, de izquierda a derecha, y usa el primero que encuentre disponible. Si ninguna de las fuentes nombradas existe en el sistema, cae en el nombre genérico del final — por eso siempre debería estar presente en la lista."
}
```

## Lo que la tipografía en CSS NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El navegador elige la fuente que mejor le parece si el nombre pedido no existe",
      "realidad": "Sigue el orden EXACTO de la lista, probando cada nombre hasta encontrar uno disponible — sin un genérico al final, puede terminar en el serif por defecto del navegador, sin ningún aviso."
    },
    {
      "mito": "font-weight: bold y font-weight: 700 son valores distintos",
      "realidad": "bold es literalmente un alias de 700 — dan exactamente el mismo resultado, siempre."
    },
    {
      "mito": "Cualquier valor numérico de font-weight (100 a 900) se ve distinto en cualquier fuente",
      "realidad": "La mayoría de las fuentes que no son variable fonts solo tienen de verdad los pesos 400 y 700 — pedir un 300 o un 600 hace que el navegador sustituya el peso disponible más cercano."
    },
    {
      "mito": "italic y oblique son exactamente lo mismo con otro nombre",
      "realidad": "italic usa la variante itálica real del archivo de la fuente si existe; oblique siempre simula una inclinación sobre la versión normal, sin usar un archivo distinto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el nombre genérico al final de un font stack.", "texto": "Sin él, el texto puede caer en el serif por defecto del navegador sin ningún aviso visible en el código." },
    { "titulo": "No poner comillas a un nombre de fuente con espacios.", "texto": "Deja ambigüedad sobre qué se está pidiendo exactamente — las comillas evitan cualquier duda." },
    { "titulo": "Pedir un peso numérico intermedio (300, 600...) sin comprobar si la fuente lo tiene disponible.", "texto": "La mayoría de las fuentes no variables solo garantizan 400 y 700 — un peso intermedio puede sustituirse sin previo aviso." },
    { "titulo": "Cambiar el font-size de contenedores intermedios sin necesidad.", "texto": "Complica cualquier cálculo con em anidado — mejor tocar solo el font-size de la raíz cuando se quiera escalar todo el sitio a la vez." }
  ]
}
```

## Ejercicios

1. Escribe un font stack con dos fuentes preferidas y un genérico apropiado al final, para un bloque de texto sans-serif.
2. Explica qué fuente terminaría usando un párrafo con `font-family: "FuenteInventada";` (sin genérico), si esa fuente no existe en el sistema.
3. Escribe una regla con el shorthand `font` que fije tamaño, interlineado y familia tipográfica en una sola línea.
4. Explica por qué `font-weight: 600` puede no verse distinto de `font-weight: 400` en una fuente concreta, y qué lo solucionaría.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Text and font fundamentals",
      "descripcion": "Guía de MDN sobre font-family, font-size, font-weight, font-style y el shorthand font, con web-safe fonts y ejemplos de font stacks.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Text and typography",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con variable fonts y el rango de pesos que un archivo de fuente puede declarar.",
      "url": "https://web.dev/learn/css/typography",
      "etiqueta": "web.dev"
    }
  ]
}
```
