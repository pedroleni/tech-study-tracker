# Herencia: qué propiedades bajan solas y cuáles no

- **Módulo:** Fundamentos de CSS
- **Slug:** `herencia-que-propiedades-bajan-solas-y-cuales-no` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [Handling conflicts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts) + [Inheritance (web.dev)](https://web.dev/learn/css/inheritance) — ver `contenido/css/TEMARIO.md` #9

---

## Qué es y para qué sirve

Poner `color: blue;` en el `body` tiñe automáticamente cada párrafo, cada enlace, cada lista de la página — sin escribir una sola regla más. Poner `width: 300px;` en ese mismo `body` no hace que cada hijo mida 300px. La diferencia no es un capricho: CSS decide, propiedad por propiedad, cuáles heredan de un ancestro a sus descendientes y cuáles no — y solo fluye hacia abajo, nunca hacia arriba.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se topa con la herencia todos los días",
  "roles": [
    { "etiqueta": "Quien define la tipografía base", "rol": "Fijarla una vez en el body, no en cada elemento", "descripcion": "font-family y color heredan por defecto — ponerlos en el body basta para que todo el texto los use, sin repetir la regla en cada etiqueta." },
    { "etiqueta": "Quien construye botones y formularios", "rol": "Saber por qué no usan la tipografía del resto", "descripcion": "button e input tienen su propia fuente por la hoja de estilos del navegador, que compite con la herencia — hace falta font: inherit; para forzarla." },
    { "etiqueta": "Quien mantiene un sistema de diseño", "rol": "Usar inherit, initial y unset a propósito", "descripcion": "Saber la diferencia entre \"vuelve al valor del padre\" e \"vuelve al valor por defecto de la especificación\" evita sorpresas al resetear un componente." }
  ]
}
```

## Herencia selectiva, y en una sola dirección

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Solo baja, y no de cualquier propiedad",
  "contenido": "La herencia fluye únicamente de ancestro a descendiente, nunca al revés — lo que le pase a un hijo no afecta a su padre. Y no todas las propiedades heredan: las de tipografía, texto y listas (color, font-family, line-height, list-style...) sí lo hacen por defecto; las de caja (margin, padding, border, width, background) no."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  body {\n    color: blue;\n    width: 50%;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "color: blue;", "nota": "color hereda por defecto: cada descendiente del body se pinta de azul automáticamente, salvo que tenga su propia regla de color." },
    { "fragmento": "width: 50%;", "nota": "width NO hereda: ningún descendiente del body mide automáticamente el 50% de su padre por esta regla. Si heredara, calcular el tamaño de cualquier cosa en CSS sería un caos." }
  ]
}
```

## Verlo en vivo: lo que sí baja solo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div class=\"envoltorio\">\n  <p>Este párrafo no tiene ninguna regla de color propia.</p>\n</div>",
  "despues": "<style>\n  .envoltorio {\n    color: #2563eb;\n    font-family: sans-serif;\n  }\n</style>\n<div class=\"envoltorio\">\n  <p>Este párrafo no tiene ninguna regla de color propia.</p>\n</div>",
  "nota": "El párrafo nunca recibe una regla de color directamente — hereda el azul del contenedor sin que nadie se lo pida explícitamente. Así funciona color por defecto."
}
```

## Y lo que no baja: cada elemento con lo suyo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div class=\"envoltorio\">\n  <p style=\"border: 1px solid #dc2626;\">Este párrafo tiene su propio borde, para que se note su tamaño real.</p>\n</div>",
  "despues": "<style>\n  .envoltorio {\n    padding: 40px;\n    border: 2px dashed #9ca3af;\n    font-family: sans-serif;\n  }\n</style>\n<div class=\"envoltorio\">\n  <p style=\"border: 1px solid #dc2626;\">Este párrafo tiene su propio borde, para que se note su tamaño real.</p>\n</div>",
  "nota": "El contenedor recibe 40px de padding — se nota en el espacio alrededor de todo. El párrafo de dentro, marcado con su propio borde rojo, se queda pegado a su texto: no hereda ni un píxel del padding del contenedor. Cada elemento tiene su propio padding, por defecto 0."
}
```

## El gotcha clásico: botones que no heredan la tipografía

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor {\n    font-family: Georgia, serif;\n    font-size: 20px;\n  }\n</style>\n<div class=\"contenedor\">\n  <p>Texto con la tipografía del contenedor.</p>\n  <button>Botón</button>\n</div>",
  "despues": "<style>\n  .contenedor {\n    font-family: Georgia, serif;\n    font-size: 20px;\n  }\n  button {\n    font: inherit;\n  }\n</style>\n<div class=\"contenedor\">\n  <p>Texto con la tipografía del contenedor.</p>\n  <button>Botón</button>\n</div>",
  "nota": "Antes: el button usa la fuente del sistema del navegador, no Georgia — la hoja de estilos por defecto del navegador le pone una fuente propia que compite con la herencia. Después: font: inherit; fuerza al botón a usar la misma tipografía que el resto — por eso casi todo sistema de diseño incluye esa regla para button e input."
}
```

## Los valores especiales: inherit, initial, unset

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a { color: inherit; }\n  .b { color: initial; }\n  .c { color: unset; }\n  .d { color: revert; }\n</style>",
  "anotaciones": [
    { "fragmento": ".a { color: inherit; }", "nota": "Fuerza la herencia aunque otra regla más específica esté compitiendo — copia el valor calculado del elemento padre, siempre." },
    { "fragmento": ".b { color: initial; }", "nota": "Usa el valor inicial que define la ESPECIFICACIÓN de CSS para esa propiedad — casi nunca coincide con lo que el navegador aplica por defecto." },
    { "fragmento": ".c { color: unset; }", "nota": "Se comporta como inherit si la propiedad hereda por naturaleza (como color), o como initial si no hereda por naturaleza (como width)." },
    { "fragmento": ".d { color: revert; }", "nota": "Deshace los estilos de autor y vuelve al estilo del navegador o de las preferencias del usuario — útil para \"olvidar\" todo el CSS de la página sobre esa propiedad." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .caja {\n    color: green;\n    font-family: sans-serif;\n    padding: 12px;\n  }\n</style>\n<div class=\"caja\">\n  <p>Un <a href=\"#\">enlace</a> dentro de un párrafo verde.</p>\n</div>",
  "despues": "<style>\n  .caja {\n    color: green;\n    font-family: sans-serif;\n    padding: 12px;\n  }\n  .caja a {\n    color: initial;\n  }\n</style>\n<div class=\"caja\">\n  <p>Un <a href=\"#\">enlace</a> dentro de un párrafo verde.</p>\n</div>",
  "nota": "Antes, el enlace es azul: la propia hoja de estilos del navegador le pone ese color por defecto, y gana a la herencia del verde. Después, con color: initial, el enlace pasa a NEGRO — ni el azul del navegador ni el verde heredado, sino el valor inicial que define la especificación de CSS para la propiedad color."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .caja {\n    color: green;\n    width: 300px;\n    border: 1px solid black;\n  }\n  .caja p {\n    color: unset;\n    width: unset;\n  }\n</style>\n<div class=\"caja\">\n  <p>Texto de prueba</p>\n</div>",
  "opciones": [
    "El párrafo se pone verde (hereda el color) y conserva su ancho normal (no hereda el width) — unset se comporta distinto según la propiedad",
    "El párrafo se pone verde Y toma los 300px de ancho del contenedor, porque unset copia todo del padre",
    "El párrafo pierde el color verde y usa negro, porque unset siempre reinicia al valor inicial de la especificación"
  ],
  "correcta": 0,
  "explicacion": "unset no tiene un único comportamiento: en color, que hereda por naturaleza, actúa como inherit y toma el verde del padre. En width, que NO hereda por naturaleza, actúa como initial y vuelve a su valor inicial (auto) — nunca copia los 300px del contenedor."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "all: unset, el botón de reinicio total",
  "contenido": "La propiedad abreviada all acepta cualquiera de estos valores especiales y los aplica a casi todas las propiedades de golpe. all: unset; en un componente borra tanto los estilos de autor como los heredados, dejando cada propiedad en su comportamiento natural — una forma cómoda de partir de cero antes de reconstruir el estilo de un elemento."
}
```

## Lo que la herencia NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Todas las propiedades de CSS se heredan de padres a hijos",
      "realidad": "Solo un subconjunto hereda por defecto — sobre todo tipografía, texto y listas. Las propiedades de caja (margin, padding, border, width, background) no heredan nunca."
    },
    {
      "mito": "inherit y unset hacen exactamente lo mismo",
      "realidad": "inherit fuerza la herencia siempre, sea la propiedad heredable por naturaleza o no. unset depende de esa naturaleza: hereda solo si la propiedad ya heredaba por defecto."
    },
    {
      "mito": "initial pone el valor que aplica el navegador por defecto",
      "realidad": "initial usa el valor inicial definido por la especificación de CSS, que casi nunca coincide con el estilo por defecto del navegador — color: initial da negro, no el azul típico de un enlace."
    },
    {
      "mito": "La herencia también puede subir de un hijo a su elemento padre",
      "realidad": "Solo fluye hacia abajo, de ancestro a descendiente — el estilo de un hijo nunca cambia el de su padre."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que width, margin o padding se hereden igual que color o font-family.", "texto": "Las propiedades de caja nunca heredan por defecto — cada elemento parte de sus propios valores iniciales, normalmente 0 o auto." },
    { "titulo": "Olvidar font: inherit; en botones e inputs.", "texto": "La hoja de estilos del navegador les pone su propia fuente, que gana a la herencia — sin esa regla, no usan la tipografía del resto de la página." },
    { "titulo": "Confundir initial con \"lo que hace el navegador por defecto\".", "texto": "Casi nunca coinciden: initial es el valor de la especificación de CSS, no el de la hoja de estilos particular de cada navegador." },
    { "titulo": "Usar unset esperando el mismo resultado en cualquier propiedad.", "texto": "El resultado depende de si esa propiedad concreta hereda por naturaleza — conviene comprobarlo antes de asumirlo." }
  ]
}
```

## Ejercicios

1. Sin ejecutarlo, di si estas dos propiedades heredan por defecto: `line-height` y `border`. Comprueba tu respuesta en la sección "Formal definition" de la página de cada propiedad en MDN.
2. Escribe una regla que ponga `font: inherit;` en todos los `button` e `input` de una página, y explica qué problema concreto resuelve.
3. Escribe una regla que ponga `color: initial` en un enlace dentro de un contenedor con color heredado, y explica qué color exacto tomará — no el azul del navegador, no el heredado.
4. Explica la diferencia entre `all: unset` y `all: initial` sobre un mismo elemento, citando al menos una propiedad donde el resultado sería distinto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Handling conflicts",
      "descripcion": "Guía de MDN con la sección de herencia: qué heredan las propiedades por defecto y los cinco valores especiales para controlarla.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Inheritance",
      "descripcion": "Capítulo del curso Learn CSS de web.dev con la lista completa de propiedades heredadas y el gotcha de font: inherit; en formularios.",
      "url": "https://web.dev/learn/css/inheritance",
      "etiqueta": "web.dev"
    }
  ]
}
```
