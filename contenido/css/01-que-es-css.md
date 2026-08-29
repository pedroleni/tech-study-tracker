# ¿Qué es CSS y cómo se conecta a HTML?

- **Módulo:** Fundamentos de CSS
- **Slug:** `que-es-css-y-como-se-conecta-a-html` (autogenerado del título)
- **Orden:** 2
- **Fuentes:** [What is CSS? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/What_is_CSS) + [Getting started with CSS (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started) — ver `contenido/css/TEMARIO.md` #1

---

## Qué es y para qué sirve

HTML no sabe nada de estilo — literalmente. Un `<h1>` no es "grande y en negrita" porque el HTML lo diga; se ve así porque el propio navegador ya trae una hoja de estilos por defecto, antes de que escribas una sola línea de CSS. CSS (*Cascading Style Sheets*) es la capa aparte que decide color, tamaño, espaciado, posición — todo lo visual, completamente separado de qué es cada cosa.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué separa HTML de CSS, en la práctica",
  "roles": [
    { "etiqueta": "HTML", "rol": "Qué es cada cosa", "descripcion": "Estructura y significado — un párrafo, un encabezado, una lista. Nada de esto dice cómo se ve en pantalla." },
    { "etiqueta": "CSS", "rol": "Cómo se ve cada cosa", "descripcion": "Color, tamaño, posición, espaciado — toda la presentación vive aquí, separada del contenido que describe." },
    { "etiqueta": "El navegador", "rol": "Aplicar un estilo por defecto siempre", "descripcion": "Antes de que llegue tu CSS, ya existe una hoja de estilos propia del navegador — por eso un h1 sin CSS ya se ve grande y en negrita." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres que tu web tenga una identidad propia",
  "contenido": "Sin CSS, la página sigue siendo legible — el navegador aplica su propio estilo por defecto — pero visualmente genérica. CSS es lo que le da una identidad que no comparte con cualquier otra página sin estilizar."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el mismo estilo se repite en muchas páginas",
  "contenido": "Una hoja externa enlazada desde cada página es la única de las tres formas de aplicar CSS que escala de verdad sin duplicar una sola línea de código."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Casi nunca, para estilos en línea sueltos",
  "contenido": "Salvo casos muy concretos (un CMS restrictivo, compatibilidad con email, JavaScript aplicando un estilo dinámico), el propio MDN lo llama directamente mala práctica."
}
```

## La anatomía de una regla CSS

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Una regla CSS, parte por parte",
  "partes": [
    { "texto": "h1", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "{", "rol": "simbolo" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "color", "rol": "atributo-nombre" },
    { "texto": ":", "rol": "simbolo" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "red", "rol": "atributo-valor" },
    { "texto": ";", "rol": "simbolo" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "}", "rol": "cierre" }
  ]
}
```

## Tres formas de conectar CSS con HTML

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!-- 1. Hoja externa: la recomendada -->\n<link rel=\"stylesheet\" href=\"estilos.css\">\n\n<!-- 2. Hoja interna -->\n<style>\n  p { color: purple; }\n</style>\n\n<!-- 3. Estilo en línea: evitarlo casi siempre -->\n<span style=\"color: purple; font-weight: bold;\">texto</span>",
  "anotaciones": [
    { "fragmento": "<link rel=\"stylesheet\" href=\"estilos.css\">", "nota": "Un archivo .css aparte, enlazado desde el head. La misma hoja puede enlazarse desde tantas páginas como haga falta — un cambio ahí se nota en todas a la vez." },
    { "fragmento": "<style>\n  p { color: purple; }\n</style>", "nota": "Las reglas viven dentro de la propia página HTML. Funciona, pero hay que repetirlas en cada página que las necesite." },
    { "fragmento": "style=\"color: purple; font-weight: bold;\"", "nota": "El estilo vive pegado al propio elemento. MDN lo llama directamente mala práctica: mezcla presentación con contenido y no escala más allá de un elemento suelto." }
  ]
}
```

## Un byte más: comentarios y por qué importan los espacios

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  /* Esto es un comentario: el navegador lo ignora por completo */\n\n  p {\n    margin: 0 auto; /* Correcto: espacio entre los dos valores */\n    /* margin: 0auto; -> inválido, el navegador descarta la línea entera */\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "/* Esto es un comentario: el navegador lo ignora por completo */", "nota": "Todo lo que va entre /* y */, en una línea o en varias, desaparece para el navegador — sirve para dejar notas o \"apagar\" una regla sin borrarla." },
    { "fragmento": "margin: 0 auto;", "nota": "El espacio entre 0 y auto es obligatorio: son dos valores distintos. Sin él (0auto), el navegador no reconoce el valor y descarta la declaración entera, no solo esa palabra." }
  ]
}
```

## La primera transformación visual

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<h1>Aprender CSS</h1>\n<p>Este párrafo no tiene ningún estilo propio — solo el que ya trae el navegador por defecto.</p>",
  "despues": "<style>\n  h1 { color: #7c3aed; font-family: system-ui, sans-serif; }\n  p { color: #52525b; font-family: system-ui, sans-serif; line-height: 1.6; }\n</style>\n<h1>Aprender CSS</h1>\n<p>Este mismo párrafo, con tres líneas de CSS y ningún cambio en el HTML.</p>",
  "nota": "Mismo HTML, cero cambios en la estructura — la única diferencia es un puñado de líneas de CSS. Así de literal es la separación entre \"qué es\" (HTML) y \"cómo se ve\" (CSS)."
}
```

## Lo que CSS NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El estilo por defecto de un h1 o un enlace viene definido en el HTML",
      "realidad": "Viene del propio navegador, en su hoja de estilos por defecto — el HTML no define ningún estilo visual por sí mismo, ni falta que le hace."
    },
    {
      "mito": "El CSS en línea es más rápido de escribir y por eso la mejor opción",
      "realidad": "Es la opción menos recomendada de las tres — mezcla presentación con contenido, y un solo cambio de estilo puede obligar a editar decenas de elementos sueltos."
    },
    {
      "mito": "Hoja interna y externa hacen exactamente lo mismo, es solo preferencia personal",
      "realidad": "Una hoja externa se puede enlazar desde muchas páginas a la vez; una interna hay que repetirla en cada página — la diferencia es de mantenimiento real, no de gustos."
    },
    {
      "mito": "CSS es solo estética, no afecta a nada funcional",
      "realidad": "Puede ocultar contenido del árbol de accesibilidad, reordenar visualmente lo que un lector de pantalla sigue leyendo en otro orden, o quitar pistas reales como el subrayado de un enlace — tiene consecuencias funcionales, no solo visuales."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar el espacio en valores que llevan más de una palabra.", "texto": "margin: 0auto no es lo mismo que margin: 0 auto — sin el espacio, el navegador descarta la declaración entera, no solo la corrige." },
    { "titulo": "Usar estilos en línea por comodidad, sin pensarlo dos veces.", "texto": "Escala mal: el mismo cambio visual puede requerir tocar cada elemento por separado, en vez de una sola regla en un sitio." },
    { "titulo": "Confundir el estilo por defecto del navegador con \"HTML sin CSS\".", "texto": "Un h1 grande y en negrita sin ninguna hoja de estilos propia sigue siendo CSS — el que trae el navegador de fábrica, no ausencia de estilo." },
    { "titulo": "Dejar código \"comentado\" sin explicar por qué sigue ahí.", "texto": "Una regla apagada con /* */ que nadie recuerda por qué se desactivó tiende a acumularse — mejor borrarla si ya no hace falta, o dejar una nota de por qué se conserva." }
  ]
}
```

## Ejercicios

1. Escribe una regla CSS que ponga en azul todos los párrafos de una página, y señala cada una de sus cuatro partes (selector, llave de apertura, declaración, llave de cierre).
2. Crea un archivo estilos.css con una regla simple y enlázalo desde un HTML con `<link>`.
3. Reescribe un elemento con estilo en línea (`style="..."`) moviendo esa misma regla a una hoja interna con `<style>`.
4. Comenta una línea de CSS real (una declaración cualquiera) sin borrarla, usando `/* */`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe una regla que ponga en azul todos los párrafos (ejercicio 1). Cuando la tengas, comenta esa línea con /* */ sin borrarla (ejercicio 4) y comprueba que el párrafo vuelve a su color por defecto.",
  "html": "<p>Un párrafo de prueba.</p>\n<p>Otro párrafo más.</p>",
  "css": "/* Escribe aquí tu regla */",
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
      "titulo": "What is CSS?",
      "descripcion": "Guía de referencia de MDN sobre qué es CSS, la anatomía de una regla, y los estilos por defecto del navegador.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/What_is_CSS",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Getting started with CSS",
      "descripcion": "Guía de referencia de MDN sobre las tres formas de aplicar CSS a HTML, comentarios, y errores de sintaxis comunes.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started",
      "etiqueta": "MDN"
    }
  ]
}
```
