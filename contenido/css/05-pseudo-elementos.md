# Pseudo-elementos: partes generadas del elemento

- **Módulo:** Fundamentos de CSS
- **Slug:** `pseudo-elementos-partes-generadas-del-elemento` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [Pseudo-classes and pseudo-elements (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements) + [Pseudo-elements (web.dev)](https://web.dev/learn/css/pseudo-elements) — ver `contenido/css/TEMARIO.md` #5

---

## Qué es y para qué sirve

Un pseudo-elemento actúa como si hubieras insertado un elemento nuevo en el HTML — sin tocar el HTML. `::first-letter` trata la primera letra de un párrafo como si fuera su propia etiqueta; `::before` y `::after` insertan cajas generadas que ni siquiera existen en el documento. La sintaxis usa doble dos puntos (`::`) para distinguirlos de las pseudo-clases (`:hover`, `:nth-child()`), que seleccionan estados de elementos que ya existen, no partes generadas.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se beneficia de generar contenido con CSS en vez de HTML",
  "roles": [
    { "etiqueta": "Quien diseña iconografía decorativa", "rol": "Insertar símbolos sin ensuciar el HTML", "descripcion": "::before y ::after añaden un icono o una flecha sin crear un span vacío en el marcado — y sin que un lector de pantalla lo anuncie como si fuera contenido real." },
    { "etiqueta": "Quien maqueta tipografía editorial", "rol": "Letras capitulares y primeras líneas destacadas", "descripcion": "::first-letter y ::first-line recrean el efecto clásico de revista o libro sin envolver manualmente la primera palabra en un span." },
    { "etiqueta": "Quien cuida el detalle de marca", "rol": "Colorear viñetas y texto seleccionado", "descripcion": "::marker y ::selection llevan los colores de marca hasta las viñetas de una lista o el resaltado al seleccionar texto con el ratón." }
  ]
}
```

## Doble dos puntos, no uno

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un pseudo-elemento crea, una pseudo-clase selecciona",
  "contenido": "::before actúa como si un elemento nuevo apareciera en el documento; :hover selecciona un elemento que ya está ahí, en un estado concreto. Por eso la sintaxis los distingue: doble dos puntos para pseudo-elementos, uno solo para pseudo-clases. Los navegadores modernos siguen aceptando :before con un solo dos puntos por compatibilidad histórica, pero :: es la sintaxis correcta hoy."
}
```

## Primera letra, primera línea

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  p::first-letter {\n    font-size: 3em;\n    color: purple;\n  }\n\n  p::first-line {\n    font-weight: bold;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "p::first-letter {\n    font-size: 3em;\n    color: purple;\n  }", "nota": "Solo funciona sobre contenedores de bloque (block, inline-block, list-item...). Sobre un elemento con display: inline, como un span suelto, no hace nada." },
    { "fragmento": "p::first-line {\n    font-weight: bold;\n  }", "nota": "Selecciona la primera línea RENDERIZADA, no la primera frase ni el primer <br>. Si cambia el ancho de pantalla, la línea que se pone en negrita cambia sola con ella." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  p { font-family: Georgia, serif; line-height: 1.6; max-width: 26em; }\n</style>\n<p>Érase una vez un lenguaje que separaba el contenido de la presentación, y aunque muchos lo dieron por sencillo, guardaba capas de profundidad que solo se revelaban con el tiempo.</p>",
  "despues": "<style>\n  p { font-family: Georgia, serif; line-height: 1.6; max-width: 26em; }\n  p::first-letter {\n    font-size: 3em;\n    font-weight: bold;\n    float: left;\n    line-height: 1;\n    margin-right: 6px;\n    color: #7c3aed;\n  }\n</style>\n<p>Érase una vez un lenguaje que separaba el contenido de la presentación, y aunque muchos lo dieron por sencillo, guardaba capas de profundidad que solo se revelaban con el tiempo.</p>",
  "nota": "El mismo párrafo, sin tocar el HTML. p::first-letter selecciona solo la \"É\" inicial y la convierte en una letra capital clásica de revista — el resto del texto no cambia."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  span.especial::first-letter {\n    font-size: 3em;\n    color: purple;\n  }\n</style>\n<p>Normal <span class=\"especial\">especial</span> texto.</p>",
  "opciones": [
    "La \"e\" de especial se agranda y se pone morada",
    "No cambia nada: first-letter no funciona en elementos inline como span",
    "Toda la palabra especial se pone morada, no solo la primera letra"
  ],
  "correcta": 1,
  "explicacion": "::first-letter solo funciona sobre contenedores de bloque. Un span sin display: block ni inline-block sigue siendo inline por defecto, así que el pseudo-elemento simplemente no se aplica — ni un error, ni un cambio visible."
}
```

## ::before y ::after: contenido generado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .aviso::before {\n    content: \"⚠ \";\n  }\n\n  .caja::before {\n    content: \"\";\n    display: block;\n    width: 40px;\n    height: 4px;\n    background: #7c3aed;\n    margin-bottom: 8px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "content: \"⚠ \";", "nota": "content es OBLIGATORIA para que ::before o ::after existan. Sin ella, el pseudo-elemento no se genera — ni una caja vacía, nada." },
    { "fragmento": "content: \"\";\n    display: block;\n    width: 40px;\n    height: 4px;\n    background: #7c3aed;", "nota": "content: \"\" (cadena vacía) SÍ cuenta como tener la propiedad: genera una caja invisible que después se puede estilizar como cualquier otra — aquí, una barrita decorativa de acento." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  a { color: #2563eb; }\n</style>\n<p>Lee más en <a href=\"https://ejemplo.com\">este artículo externo</a>.</p>",
  "despues": "<style>\n  a { color: #2563eb; }\n  a::after {\n    content: \" ↗\";\n  }\n</style>\n<p>Lee más en <a href=\"https://ejemplo.com\">este artículo externo</a>.</p>",
  "nota": "a::after añade la flechita ↗ después de cada enlace, sin tocar el HTML ni envolver el texto en un span. Y como es contenido generado por CSS, un lector de pantalla normalmente no la anuncia — perfecta para una pista puramente visual."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Lo generado por CSS no es contenido de verdad",
  "contenido": "content en ::before/::after es útil para iconos y decoración, pero no es fiable como forma de transmitir información esencial: los lectores de pantalla no siempre lo anuncian, y ese texto no existe en el HTML — no se puede seleccionar, copiar ni indexar como el resto del contenido. Cualquier información que importe de verdad va en el HTML, nunca solo en un content."
}
```

## ::marker: las viñetas de una lista

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  li::marker {\n    color: #16a34a;\n    content: \"✓ \";\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "color: #16a34a;", "nota": "::marker acepta un conjunto limitado de propiedades: color, content, white-space, y las de fuente y animación — no acepta, por ejemplo, background ni border." },
    { "fragmento": "content: \"✓ \";", "nota": "content en ::marker reemplaza el símbolo de viñeta por defecto (el punto de un ul o el número de un ol) por el que tú definas." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<ul>\n  <li>Café</li>\n  <li>Té</li>\n  <li>Agua</li>\n</ul>",
  "despues": "<style>\n  li::marker {\n    content: \"✓ \";\n    color: #16a34a;\n  }\n</style>\n<ul>\n  <li>Café</li>\n  <li>Té</li>\n  <li>Agua</li>\n</ul>",
  "nota": "Mismo ul, mismos li. li::marker sustituye el punto por defecto por un check verde — sin envolver el texto de cada elemento en un span ni tocar el HTML de la lista."
}
```

## ::placeholder: el texto de ayuda de un campo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  input {\n    padding: 8px;\n    border: 1px solid #d1d5db;\n    border-radius: 4px;\n    font-family: sans-serif;\n    width: 220px;\n  }\n</style>\n<input type=\"email\" placeholder=\"tu@correo.com\">",
  "despues": "<style>\n  input {\n    padding: 8px;\n    border: 1px solid #d1d5db;\n    border-radius: 4px;\n    font-family: sans-serif;\n    width: 220px;\n  }\n  input::placeholder {\n    color: #dc2626;\n    font-style: italic;\n  }\n</style>\n<input type=\"email\" placeholder=\"tu@correo.com\">",
  "nota": "El mismo input vacío en los dos casos — el placeholder se ve sin necesidad de hacer clic ni escribir nada. input::placeholder cambia solo el estilo de ese texto de ayuda, nunca el valor real del campo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un placeholder no es una etiqueta",
  "contenido": "Un placeholder desaparece en cuanto la persona empieza a escribir, y muchos lectores de pantalla lo anuncian distinto a un label real. Sigue haciendo falta un <label> de verdad asociado al campo — ::placeholder solo cambia cómo se ve ese texto de ayuda, no sustituye la etiqueta accesible."
}
```

## Otros pseudo-elementos: ::selection y ::backdrop

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  ::selection {\n    background-color: #7c3aed;\n    color: white;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "background-color: #7c3aed;\n    color: white;", "nota": "::selection solo acepta color, background-color (nunca una imagen de fondo) y algunas propiedades de texto. Se ve al arrastrar el ratón sobre el texto para seleccionarlo — por eso esta lección lo explica con código en vez de un demo en vivo: depende de una interacción real del usuario." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "::backdrop: lo que hay detrás de un <dialog> o un vídeo a pantalla completa",
  "contenido": "Cuando un <dialog> se abre con showModal() o un vídeo entra en pantalla completa, el navegador genera una capa detrás llamada ::backdrop — normalmente un fondo semitransparente oscuro. ::backdrop { background: rgba(0,0,0,.6); } es lo que oscurece el resto de la página detrás de un modal."
}
```

## Lo que un pseudo-elemento NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "::before y ::after modifican el HTML real de la página",
      "realidad": "Solo generan cajas visuales que aparecen en las herramientas de desarrollador — nunca existen en el HTML fuente ni se pueden inspeccionar como un elemento normal del DOM."
    },
    {
      "mito": "content: \"\" (vacío) no sirve para nada porque no muestra texto",
      "realidad": "Sigue contando como tener la propiedad content, así que el pseudo-elemento SÍ se genera — solo que como una caja invisible, lista para estilizarse con width, height, background, etc."
    },
    {
      "mito": ":before con un solo dos puntos ya no funciona en navegadores modernos",
      "realidad": "Sigue funcionando por compatibilidad histórica con CSS2, pero :: (doble dos puntos) es la sintaxis moderna correcta para distinguir pseudo-elementos de pseudo-clases."
    },
    {
      "mito": "::selection y ::marker aceptan las mismas propiedades que cualquier selector normal",
      "realidad": "Cada pseudo-elemento acepta solo un subconjunto limitado: ::selection no admite background con imagen, ::marker no admite border ni background — solo un puñado de propiedades definidas para cada uno."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar la propiedad content en ::before o ::after.", "texto": "Sin content, aunque sea una cadena vacía, el pseudo-elemento no se genera — ni siquiera como caja invisible." },
    { "titulo": "Usar ::first-letter o ::first-line sobre un elemento inline.", "texto": "Ambos exigen un contenedor de bloque (block, inline-block, list-item...) — sobre un span suelto, sencillamente no hacen nada." },
    { "titulo": "Meter información esencial dentro de un content generado.", "texto": "No siempre lo anuncian los lectores de pantalla, y ese texto no se puede seleccionar ni copiar — cualquier contenido que importe va en el HTML." },
    { "titulo": "Pensar que ::placeholder sustituye a un <label>.", "texto": "El placeholder desaparece al escribir y no todos los lectores de pantalla lo tratan como una etiqueta — sigue haciendo falta un <label> real." }
  ]
}
```

## Ejercicios

1. Usa `::first-letter` para crear una letra capital en el primer párrafo de un artículo, con `float: left` para que el resto del texto la rodee.
2. Usa `::before` para añadir el símbolo `★` antes de cada elemento de una lista de "favoritos", sin escribirlo en el HTML.
3. Cambia el color de fondo con el que se resalta el texto al seleccionarlo en tu página, usando `::selection`.
4. Explica por qué `li::marker { content: "→ "; text-decoration: underline; }` no llega a subrayar la flecha (pista: revisa qué propiedades acepta `::marker` en esta lección).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Pseudo-classes and pseudo-elements",
      "descripcion": "Guía de MDN con la sintaxis, ejemplos y diferencias entre pseudo-clases y pseudo-elementos.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Pseudo-elements",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con el listado completo de pseudo-elementos y qué propiedades acepta cada uno.",
      "url": "https://web.dev/learn/css/pseudo-elements",
      "etiqueta": "web.dev"
    }
  ]
}
```
