# Propiedades lógicas y direcciones de escritura

- **Módulo:** El modelo de caja
- **Slug:** `propiedades-logicas-y-direcciones-de-escritura` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [Handling different text directions (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_different_text_directions) + [Logical properties (web.dev)](https://web.dev/learn/css/logical-properties) — ver `contenido/css/TEMARIO.md` #17

---

## Qué es y para qué sirve

`margin-left` siempre significa "el lado izquierdo de la pantalla" — sin importar el idioma, sin importar cómo se lea el texto. Para un sitio solo en español, eso nunca es un problema. Para un sitio que también se lee en árabe o hebreo (de derecha a izquierda), `margin-left` deja de significar lo que el diseño realmente quería decir. Las propiedades lógicas resuelven esto hablando de "inicio" y "final" en vez de "izquierda" y "derecha" — y se adaptan solas.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita pensar en inicio y final, no en izquierda y derecha",
  "roles": [
    { "etiqueta": "Quien da soporte a idiomas RTL", "rol": "Que el mismo CSS funcione en árabe o hebreo sin duplicarlo", "descripcion": "margin-inline-start se convierte solo en el lado correcto según la dirección de lectura — sin escribir una segunda hoja de estilos para RTL." },
    { "etiqueta": "Quien construye componentes reusables", "rol": "Que un componente no dependa de asumir LTR", "descripcion": "Un botón o una tarjeta escritos con propiedades lógicas funcionan igual de bien si el proyecto algún día necesita soporte multiidioma." },
    { "etiqueta": "Quien ya usa Flexbox o Grid", "rol": "Hablar el mismo idioma de inicio y final", "descripcion": "justify-content: start/end ya piensa en términos lógicos — las propiedades lógicas extienden esa misma idea a margin, padding, border y más." }
  ]
}
```

## Bloque e inline: las dos direcciones que importan

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "No son \"vertical\" y \"horizontal\" — son \"bloque\" e \"inline\"",
  "contenido": "La dimensión de BLOQUE es la dirección en la que se apilan los bloques de la página — de arriba a abajo en el modo de escritura habitual. La dimensión INLINE es la dirección en la que fluye el texto dentro de una línea — de izquierda a derecha en español. En un modo de escritura vertical (como el japonés tradicional) o con direction: rtl, estas dos direcciones cambian — y las propiedades lógicas cambian con ellas."
}
```

## La misma regla, dos lados distintos según la dirección

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .caja {\n    margin-inline-start: 40px;\n    background: #ede9fe;\n    border: 2px solid #7c3aed;\n    padding: 8px;\n    width: 160px;\n    font-family: sans-serif;\n  }\n</style>\n<div dir=\"ltr\">\n  <div class=\"caja\">margin-inline-start: 40px</div>\n</div>",
  "despues": "<style>\n  .caja {\n    margin-inline-start: 40px;\n    background: #ede9fe;\n    border: 2px solid #7c3aed;\n    padding: 8px;\n    width: 160px;\n    font-family: sans-serif;\n  }\n</style>\n<div dir=\"rtl\">\n  <div class=\"caja\">margin-inline-start: 40px</div>\n</div>",
  "nota": "EXACTAMENTE la misma regla CSS en los dos casos — margin-inline-start: 40px, ni una letra distinta. Lo único que cambia es el atributo dir del contenedor. Antes (dir=\"ltr\"): el espacio aparece a la IZQUIERDA de la caja. Después (dir=\"rtl\"): el mismo CSS pone el espacio a la DERECHA. inline-start sigue el inicio de la lectura, no un lado fijo de la pantalla."
}
```

## El mismo mapa, con nombres físicos y lógicos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .fisico {\n    margin-top: 20px;\n    padding-right: 2em;\n    border-left: 1px solid black;\n  }\n\n  .logico {\n    margin-block-start: 20px;\n    padding-inline-end: 2em;\n    border-inline-start: 1px solid black;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".fisico {\n    margin-top: 20px;\n    padding-right: 2em;\n    border-left: 1px solid black;\n  }", "nota": "margin-top, padding-right y border-left están atados a lados FÍSICOS de la pantalla — top siempre es arriba, right siempre es la derecha, sin importar el idioma ni el modo de escritura." },
    { "fragmento": ".logico {\n    margin-block-start: 20px;\n    padding-inline-end: 2em;\n    border-inline-start: 1px solid black;\n  }", "nota": "En un documento normal en español (horizontal-tb, ltr), estas tres reglas producen EXACTAMENTE el mismo resultado visual que las de arriba. La diferencia solo aparece si cambia la dirección de lectura o el modo de escritura — entonces estas se adaptan solas, las físicas no." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "En un modo de escritura vertical, hasta \"arriba\" cambia de sentido",
  "contenido": "Con writing-mode: vertical-rl, los bloques se apilan de derecha a izquierda en vez de de arriba a abajo. margin-top (física) sigue empujando desde el borde superior real de la pantalla — pero margin-block-start (lógica) empuja desde el nuevo INICIO del bloque, que en este modo de escritura es el lado DERECHO, no el de arriba. La misma palabra \"start\" apunta a un sitio distinto según el modo de escritura activo."
}
```

## text-align: right frente a text-align: end

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  p {\n    direction: rtl;\n    font-family: sans-serif;\n    border: 2px dashed #9ca3af;\n    padding: 8px;\n    width: 260px;\n    background: #ede9fe;\n  }\n</style>\n<p style=\"text-align: right;\">Texto de prueba</p>",
  "despues": "<style>\n  p {\n    direction: rtl;\n    font-family: sans-serif;\n    border: 2px dashed #9ca3af;\n    padding: 8px;\n    width: 260px;\n    background: #ede9fe;\n  }\n</style>\n<p style=\"text-align: end;\">Texto de prueba</p>",
  "nota": "En un párrafo normal (ltr), text-align: right y text-align: end se ven idénticos — por eso es fácil no notar la diferencia nunca. Pero este párrafo tiene direction: rtl. Antes (text-align: right): el texto se queda pegado a la derecha, sin importar la dirección. Después (text-align: end): el texto se mueve a la IZQUIERDA — porque en rtl, el final de la lectura es la izquierda, no la derecha."
}
```

## Tamaños, atajos y esquinas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    inline-size: 200px;\n    block-size: 100px;\n    margin-inline: 10px 20px;\n    padding-block: 8px;\n    border-start-start-radius: 12px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "inline-size: 200px;\n    block-size: 100px;", "nota": "Los equivalentes lógicos de width y height. En un documento normal en español se comportan exactamente igual — la diferencia solo aparece con otro modo de escritura." },
    { "fragmento": "margin-inline: 10px 20px;", "nota": "Atajo para margin-inline-start y margin-inline-end a la vez — 10px al inicio, 20px al final de la dirección de lectura." },
    { "fragmento": "padding-block: 8px;", "nota": "Atajo para padding-block-start y padding-block-end — un solo valor para ambos, como margin: 8px pero en la dimensión de bloque." },
    { "fragmento": "border-start-start-radius: 12px;", "nota": "Redondea la esquina donde coinciden el inicio del bloque Y el inicio del inline — en un documento ltr normal, esa es la esquina superior izquierda." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    margin-inline-end: 30px;\n    background: lightblue;\n  }\n</style>\n<div dir=\"rtl\">\n  <div class=\"caja\">Texto</div>\n</div>",
  "opciones": [
    "El margen aparece a la derecha de la caja, como haría margin-right",
    "El margen aparece a la izquierda de la caja: en rtl, el final de lectura (inline-end) es la izquierda",
    "No aparece ningún margen: margin-inline-end no funciona dentro de un dir=\"rtl\""
  ],
  "correcta": 1,
  "explicacion": "inline-end sigue el final de la dirección de lectura, no un lado fijo de la pantalla. En rtl, la lectura va de derecha a izquierda, así que el final cae en la IZQUIERDA — margin-inline-end pone ahí el espacio, no a la derecha como haría margin-right."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Soporte internacional \"gratis\", sin escribir CSS aparte",
  "contenido": "Si un ícono junto a un texto usa margin-inline-end para separarse del texto, y el texto cambia a un idioma que se lee de derecha a izquierda, el ícono se queda pegado al texto igual de bien — automáticamente, sin ninguna hoja de estilos adicional. Esa es la promesa concreta de las propiedades lógicas: soporte de internacionalización sin duplicar una sola regla."
}
```

## Lo que las propiedades lógicas NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las propiedades lógicas solo sirven para idiomas como el árabe o el hebreo",
      "realidad": "También se adaptan a modos de escritura verticales, y simplifican el CSS incluso en proyectos de un solo idioma, al hablar en términos de \"inicio\" y \"final\" en vez de lados fijos."
    },
    {
      "mito": "text-align: right y text-align: end siempre hacen lo mismo",
      "realidad": "Coinciden en un documento LTR, pero se separan por completo en uno RTL — right se queda fijo a la derecha física, end sigue el final real de la lectura."
    },
    {
      "mito": "Cambiar direction: rtl en un elemento invierte automáticamente todo su CSS, márgenes físicos incluidos",
      "realidad": "Solo las propiedades LÓGICAS se adaptan — las físicas (margin-left, text-align: right) se quedan exactamente donde estaban, sin moverse."
    },
    {
      "mito": "Las propiedades lógicas son experimentales y poco soportadas",
      "realidad": "Llevan años con soporte amplio en todos los navegadores modernos — la única razón real para evitarlas es mantener compatibilidad con proyectos muy antiguos."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar margin-left/margin-right por costumbre en un componente reutilizable.", "texto": "Si ese componente algún día se usa en un contexto rtl, el espaciado se queda en el lado equivocado — margin-inline-start/end lo resuelve solo." },
    { "titulo": "Confundir text-align: end con \"alinear visualmente al final del texto\".", "texto": "Significa \"alinear al final de la dirección de LECTURA\" — coincide con la derecha solo mientras el documento sea ltr." },
    { "titulo": "Mezclar propiedades físicas y lógicas en el mismo componente.", "texto": "Deja la mitad del espaciado sin adaptarse cuando cambia la dirección — conviene ser consistente, todo físico o todo lógico." },
    { "titulo": "Pensar que hace falta una hoja de estilos aparte para dar soporte a RTL.", "texto": "Las propiedades lógicas ya resuelven la mayoría de los casos sin duplicar una sola regla de CSS." }
  ]
}
```

## Ejercicios

1. Reescribe esta regla usando solo propiedades lógicas: `margin-top: 10px; margin-right: 20px; padding-left: 15px;`
2. Explica qué le pasaría visualmente a un componente que usa `margin-right: 20px` en vez de `margin-inline-end: 20px`, si se usa dentro de un contenedor con `dir="rtl"`.
3. Escribe una regla con `border-start-start-radius` que redondee solo una esquina de una caja, y explica a qué esquina física corresponde en un documento ltr normal.
4. Explica la diferencia real entre `text-align: right` y `text-align: end`, con un ejemplo de HTML donde las dos produzcan resultados distintos.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Handling different text directions",
      "descripcion": "Guía de MDN sobre modos de escritura, dirección de texto y el mapa completo de propiedades físicas a lógicas.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_different_text_directions",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Logical properties",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con las esquinas lógicas de border-radius y el argumento de internacionalización \"gratis\".",
      "url": "https://web.dev/learn/css/logical-properties",
      "etiqueta": "web.dev"
    }
  ]
}
```
