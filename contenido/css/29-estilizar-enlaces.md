# Estilizar enlaces y sus estados

- **Módulo:** Texto y tipografía
- **Slug:** `estilizar-enlaces-y-sus-estados` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [Styling links (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_links) + [Pseudo-classes (web.dev)](https://web.dev/learn/css/pseudo-classes) — ver `contenido/css/TEMARIO.md` #29

---

## Qué es y para qué sirve

Un enlace tiene, como mínimo, cuatro estados distintos: sin visitar, visitado, con el ratón encima, y en el instante exacto del clic. CSS tiene una pseudo-clase para cada uno — pero el ORDEN en que se declaran no es cosmético: con dos estados activos a la vez (como pasa siempre durante un clic), el orden decide cuál se ve.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita pensar en los cuatro estados de un enlace",
  "roles": [
    { "etiqueta": "Quien navega solo con teclado", "rol": "Ver claramente qué enlace tiene el foco", "descripcion": ":focus es la única señal visual de qué elemento se activaría al pulsar Intro — quitarla sin reemplazo dejaría a quien navega sin ratón completamente perdido." },
    { "etiqueta": "Quien diseña una barra de navegación", "rol": "Convertir enlaces en botones sin perder su semántica", "descripcion": "Un <a> sigue siendo un enlace real, navegable y accesible, aunque se le dé aspecto de botón con flexbox y color de fondo." },
    { "etiqueta": "Quien ordena las pseudo-clases", "rol": "Que el color de :active no quede oculto por :hover", "descripcion": "Durante un clic, el ratón está encima Y pulsando a la vez — el orden LVHA garantiza que se vea el estado correcto en cada momento." }
  ]
}
```

## Las convenciones que la gente ya espera

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Azul, subrayado, morado al visitar — desde los años 90",
  "contenido": "Por defecto, los navegadores pintan los enlaces sin visitar en azul y subrayados, los visitados en morado, y cambian el cursor a una mano al pasar por encima. La gente lleva reconociendo estas señales desde mediados de los 90 — alejarse demasiado de ellas, sin dar ninguna señal alternativa clara, puede confundir sobre qué es y qué no es un enlace."
}
```

## Cinco pseudo-clases, un orden obligatorio: LVHA

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  a:link { color: #6900ff; }\n  a:visited { color: #a5c300; }\n  a:focus { background: #bae498; }\n  a:hover { background: #cdfeaa; }\n  a:active { background: #6900ff; color: #cdfeaa; }\n</style>",
  "anotaciones": [
    { "fragmento": "a:link { color: #6900ff; }", "nota": "Enlace sin visitar, con un destino real. El orden se recuerda con \"LoVe FuArHAte\": Link, Visited, Focus, Hover, Active." },
    { "fragmento": "a:active { background: #6900ff; color: #cdfeaa; }", "nota": "active va SIEMPRE al final. Durante un clic, el ratón está encima (:hover) Y pulsando (:active) a la vez — si :hover se declarara después de :active, su estilo ganaría y el color de \"estoy haciendo clic\" nunca llegaría a verse." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  a:active { color: red; }\n  a:hover { color: blue; }\n</style>\n<a href=\"#\">Enlace</a>",
  "opciones": [
    "Se ve rojo (active) mientras se hace clic, porque active importa más para ese momento concreto",
    "Se ve azul (hover), porque hover está declarado DESPUÉS en el código — el color de active nunca llega a mostrarse mientras se hace clic",
    "Los dos colores se alternan rápidamente mientras se mantiene pulsado"
  ],
  "correcta": 1,
  "explicacion": "Mientras se hace clic, el enlace está en :hover Y en :active a la vez. Con la misma especificidad, gana la regla declarada MÁS TARDE — aquí, :hover. El color de :active queda oculto siempre, exactamente el problema que evita el orden LVHA, donde :active se declara al final."
}
```

## Verlo en vivo: el estado por defecto frente a uno personalizado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"font-family: sans-serif;\">Visita <a href=\"#\">nuestra página de inicio</a> para más información.</p>",
  "despues": "<style>\n  a:link {\n    color: #16a34a;\n    text-decoration: none;\n    border-bottom: 2px solid #16a34a;\n  }\n</style>\n<p style=\"font-family: sans-serif;\">Visita <a href=\"#\">nuestra página de inicio</a> para más información.</p>",
  "nota": "Antes: el azul y el subrayado por defecto del navegador. Después: color e identidad propios (verde), sin subrayado — pero con un borde inferior que sigue funcionando como señal visual clara de que es un enlace, no solo texto normal."
}
```

## Quitar el subrayado exige una señal alternativa

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin subrayado, hace falta OTRA señal clara",
  "contenido": "MDN lo dice sin rodeos: si no se quiere subrayar un enlace, hay que resaltarlo de alguna otra forma. El color por sí solo no es una señal fiable — no todo el mundo distingue bien los colores. Un borde inferior, un fondo distinto, o recuperar el subrayado en :hover y :focus son alternativas habituales."
}
```

## :visited solo puede cambiar un puñado de propiedades

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  a:visited {\n    color: purple;\n    background-color: #f5f5f5;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "a:visited {\n    color: purple;\n    background-color: #f5f5f5;\n  }", "nota": "Por motivos de privacidad, :visited solo puede cambiar color, background-color, border-color, outline-color y fill/stroke en SVG — nunca layout, tamaño de fuente ni contenido. Cualquier otra propiedad escrita aquí, el navegador la ignora." }
  ]
}
```

## :focus y :focus-visible: distinguir teclado de ratón

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  a:focus {\n    outline: none;\n  }\n  a:focus-visible {\n    outline: 2px solid #265301;\n    outline-offset: 2px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "a:focus {\n    outline: none;\n  }", "nota": "Quita el contorno de foco por defecto — SOLO es seguro hacerlo si :focus-visible lo repone después, como en la siguiente regla." },
    { "fragmento": "a:focus-visible {\n    outline: 2px solid #265301;\n    outline-offset: 2px;\n  }", "nota": "Muestra el contorno solo cuando el navegador considera que el foco vino del teclado (Tab), no de un clic con el ratón — el resultado: sin contorno molesto al hacer clic, pero con contorno claro al navegar sin ratón." }
  ]
}
```

## Enlaces con aspecto de botón, sin perder su semántica

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  ul { list-style: none; padding: 0; display: flex; gap: 8px; font-family: sans-serif; }\n</style>\n<ul>\n  <li><a href=\"#\">Inicio</a></li>\n  <li><a href=\"#\">Productos</a></li>\n  <li><a href=\"#\">Contacto</a></li>\n</ul>",
  "despues": "<style>\n  nav { display: flex; gap: 8px; font-family: sans-serif; }\n  nav a {\n    flex: 1;\n    text-decoration: none;\n    text-align: center;\n    line-height: 2.5;\n    background: #ede9fe;\n    color: #7c3aed;\n    border-radius: 6px;\n    font-weight: bold;\n  }\n</style>\n<nav>\n  <a href=\"#\">Inicio</a>\n  <a href=\"#\">Productos</a>\n  <a href=\"#\">Contacto</a>\n</nav>",
  "nota": "Los mismos tres enlaces reales, con el mismo href=\"#\" en los dos casos. Después, con flexbox y algo de color, se ven como tres botones — pero siguen siendo <a>, navegables con teclado y anunciados como enlaces por un lector de pantalla, exactamente igual que antes."
}
```

## Marcar los enlaces externos automáticamente

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  a { color: #2563eb; font-family: sans-serif; }\n</style>\n<p>Visita <a href=\"/interno\">nuestra página</a> o consulta <a href=\"https://ejemplo.com\">este sitio externo</a>.</p>",
  "despues": "<style>\n  a { color: #2563eb; font-family: sans-serif; }\n  a[href^=\"http\"]::after {\n    content: \" ↗\";\n  }\n</style>\n<p>Visita <a href=\"/interno\">nuestra página</a> o consulta <a href=\"https://ejemplo.com\">este sitio externo</a>.</p>",
  "nota": "El selector de atributo [href^=\"http\"] alcanza solo el segundo enlace, cuyo href empieza por \"http\" (una URL absoluta) — el primero, con una ruta interna, nunca coincide. El icono ↗ se añade automáticamente solo donde corresponde, sin marcarlo a mano en el HTML."
}
```

## Lo que los estados de un enlace NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El orden en que se escriben :hover y :active no importa, son estados distintos",
      "realidad": "Cuando los dos coinciden a la vez (durante un clic), el orden decide cuál gana — por eso :active debe ir después de :hover (el orden LVHA), o su color nunca llegaría a verse."
    },
    {
      "mito": ":visited puede cambiar cualquier propiedad, igual que :link",
      "realidad": "Por privacidad, solo puede cambiar color, background-color, border-color, outline-color y fill/stroke en SVG — nada de layout, tamaño ni contenido."
    },
    {
      "mito": "Quitar el subrayado de un enlace no afecta a la accesibilidad si el color ya lo distingue",
      "realidad": "MDN recomienda mantener alguna señal visual clara al quitar el subrayado — el color solo no es un indicador fiable de que algo es un enlace."
    },
    {
      "mito": "outline: none en :focus solo afecta a cómo se ve, no a la navegación",
      "realidad": "Quita la única señal visual de qué elemento tiene el foco al navegar con teclado — sin reemplazo, deja a quien navega sin ratón completamente perdido."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Declarar :hover después de :active.", "texto": "El color de \"estoy haciendo clic\" nunca se llega a ver, tapado por el de :hover durante todo el clic." },
    { "titulo": "Intentar cambiar propiedades no permitidas en :visited.", "texto": "El navegador las ignora por privacidad — solo color, fondo, bordes y algunas propiedades SVG funcionan ahí." },
    { "titulo": "Usar outline: none en :focus sin ningún estilo alternativo.", "texto": "Deja la navegación por teclado sin ninguna señal visual de qué elemento tiene el foco." },
    { "titulo": "Quitar el subrayado de enlaces en texto corrido sin otro indicador claro.", "texto": "El color por sí solo no basta como señal fiable de que algo es un enlace." }
  ]
}
```

## Ejercicios

1. Escribe las cuatro reglas de pseudo-clases de enlace (`:link`, `:visited`, `:hover`, `:active`) en el orden LVHA correcto.
2. Explica qué pasaría si se declarara `a:hover` antes que `a:active`, en un enlace con colores distintos para cada estado.
3. Escribe una regla que quite el subrayado de un enlace en su estado normal, pero lo recupere en `:hover` y `:focus`.
4. Escribe una regla con `:focus-visible` que muestre un contorno solo al navegar con teclado, sin mostrarlo al hacer clic con el ratón.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Styling links",
      "descripcion": "Guía de MDN sobre las pseudo-clases de enlace, el orden LVHA, enlaces como botones e iconos para enlaces externos.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_links",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Pseudo-classes",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con la restricción de privacidad de :visited y el patrón :focus + :focus-visible.",
      "url": "https://web.dev/learn/css/pseudo-classes",
      "etiqueta": "web.dev"
    }
  ]
}
```
