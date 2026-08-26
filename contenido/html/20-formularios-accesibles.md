# Formularios accesibles de verdad: label y fieldset/legend

- **Módulo:** Formularios
- **Slug:** `formularios-accesibles-de-verdad-label-y-fieldset-legend` (autogenerado del título)
- **Orden:** 95
- **Fuentes:** [HTML: A good basis for accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) + [Accessibility (web.dev Learn Forms)](https://web.dev/learn/forms/accessibility) + [Creating Accessible Forms (WebAIM)](https://webaim.org/techniques/forms/) — ver `contenido/html/TEMARIO.md` #20

---

## Qué es y para qué sirve

Un formulario que se ve perfecto puede ser inutilizable con un lector de pantalla si le falta una sola pieza: la asociación real entre cada campo y su texto identificativo. No es una cuestión de estar "cerca" en el HTML — hace falta una relación programática de verdad, y esta lección cubre las tres formas de conseguirla: label (por campo), fieldset/legend (por grupo), y usar siempre el elemento nativo antes que reconstruirlo a mano.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué gana quien depende de verdad de la accesibilidad",
  "roles": [
    { "etiqueta": "Quien usa lector de pantalla", "rol": "Oír el nombre real del campo", "descripcion": "Sin un label asociado de verdad, un lector de pantalla solo dice \"editar texto\" — con label, dice \"Nombre: editar texto\", con contexto real." },
    { "etiqueta": "Quien tiene dificultad motora", "rol": "Un objetivo de clic más grande", "descripcion": "Con label asociado, hacer clic en el TEXTO también activa el campo — no hace falta acertar justo en la casilla, a menudo pequeña." },
    { "etiqueta": "Quien navega solo con teclado", "rol": "Que cada control se comporte como se espera", "descripcion": "Un button real recibe foco con Tab y se activa con Enter o espacio de fábrica — un div que solo se le parece necesita reconstruir todo eso a mano." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando cada campo necesita su propio texto identificativo",
  "contenido": "Un label explícito, con for coincidiendo con el id del campo, es la asociación más robusta y la más fácil de comprobar con las herramientas de desarrollador."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando varios campos forman un grupo con sentido propio",
  "contenido": "Un grupo de radio, un conjunto de checkboxes relacionados (\"Método de envío\") — fieldset y legend le dan a ese grupo su propio nombre, por encima del label individual de cada opción."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando necesitas un control con comportamiento interactivo propio",
  "contenido": "Usa el elemento nativo (button, input, select) siempre que exista uno — reconstruir su comportamiento a mano con un div es mucho trabajo para llegar, en el mejor de los casos, al mismo resultado."
}
```

## Cómo se usa: label explícito e implícito

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<div>\n  <label for=\"nombre\">Nombre</label>\n  <input type=\"text\" id=\"nombre\" name=\"nombre\">\n</div>\n\n<label>\n  Apellidos\n  <input type=\"text\" name=\"apellidos\">\n</label>",
  "anotaciones": [
    { "fragmento": "<label for=\"nombre\">Nombre</label>\n  <input type=\"text\" id=\"nombre\" name=\"nombre\">", "nota": "Asociación explícita: for coincide con id. Funciona aunque el label y el input no estén uno justo al lado del otro en el HTML." },
    { "fragmento": "<label>\n  Apellidos\n  <input type=\"text\" name=\"apellidos\">\n</label>", "nota": "Asociación implícita: el input vive DENTRO del propio label, sin necesitar for ni id. Igual de válida — útil cuando no quieres gestionar ids únicos." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "Rellena tu nombre: <input type=\"text\" id=\"nombre\">\n<!-- \"Rellena tu nombre:\" es solo texto suelto, no un label -->",
  "opciones": [
    "El lector de pantalla anuncia \"Rellena tu nombre, editar texto\"",
    "El lector de pantalla anuncia solo \"editar texto\", sin ningún contexto",
    "El navegador crea automáticamente la asociación por estar uno al lado del otro"
  ],
  "correcta": 1,
  "explicacion": "Sin un label real (ni for/id, ni el input envuelto dentro), el texto de al lado es invisible para la asociación accesible — el lector de pantalla solo tiene el propio control, sin ningún nombre que anunciar más allá de su tipo genérico."
}
```

## fieldset y legend: agrupar controles relacionados

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<fieldset>\n  <legend>Método de envío</legend>\n\n  <input type=\"radio\" id=\"estandar\" name=\"envio\" value=\"estandar\">\n  <label for=\"estandar\">Estándar (5 días)</label>\n\n  <input type=\"radio\" id=\"expres\" name=\"envio\" value=\"expres\">\n  <label for=\"expres\">Exprés (24 horas)</label>\n</fieldset>",
  "anotaciones": [
    { "fragmento": "<legend>Método de envío</legend>", "nota": "Un lector de pantalla lo anuncia al ENTRAR en el grupo — el label de cada radio (\"Estándar\", \"Exprés\") no dice nada por sí solo sobre a qué pregunta responden sin este contexto." },
    { "fragmento": "<fieldset>", "nota": "Agrupa los controles relacionados como una unidad — el navegador también suele dibujar un borde visual alrededor, gratis, sin CSS propio." }
  ]
}
```

## Indicar campos obligatorios de forma accesible

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<label for=\"email\">Correo electrónico <span aria-hidden=\"true\">*</span></label>\n<input type=\"email\" id=\"email\" name=\"email\" required aria-describedby=\"email-ayuda\">\n<p id=\"email-ayuda\">Campo obligatorio. Usaremos este correo solo para confirmar tu pedido.</p>",
  "anotaciones": [
    { "fragmento": "<span aria-hidden=\"true\">*</span>", "nota": "El asterisco visual se marca aria-hidden porque, leído literalmente (\"asterisco\"), no aporta nada — conviene además que la palabra \"obligatorio\" aparezca en el propio texto en algún punto del formulario." },
    { "fragmento": "aria-describedby=\"email-ayuda\"", "nota": "Conecta el campo con el párrafo de ayuda por su id — un lector de pantalla lee ambos juntos al llegar al campo, no solo la etiqueta." }
  ]
}
```

## Por qué un div no es un botón, aunque se le parezca

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<button data-accion=\"enviar\">Enviar formulario</button>\n\n<div data-accion=\"enviar\" tabindex=\"0\" role=\"button\">Enviar formulario</div>",
  "anotaciones": [
    { "fragmento": "<button data-accion=\"enviar\">Enviar formulario</button>", "nota": "Foco con Tab, activación con Enter o espacio, rol de botón para un lector de pantalla — todo de fábrica, sin escribir nada extra." },
    { "fragmento": "<div data-accion=\"enviar\" tabindex=\"0\" role=\"button\">Enviar formulario</div>", "nota": "Para acercarse al mismo comportamiento hacen falta tabindex (foco), role (el rol correcto) Y JavaScript propio para que Enter/espacio lo activen — button lo da todo gratis desde el principio." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Reconstruir accesibilidad a mano es mucho trabajo para el mismo resultado",
  "contenido": "tabindex y role acercan visualmente el comportamiento, pero sin JavaScript propio que escuche Enter y espacio, ese div sigue sin activarse con teclado. Usar el elemento nativo desde el principio da todo eso gratis."
}
```

## Lo que un formulario accesible NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un label cerca del campo, sin for ni envolverlo, ya está asociado",
      "realidad": "Sin una de las dos asociaciones reales (for/id, o el input dentro del label), es solo texto suelto — no activa el campo al hacer clic ni lo anuncia un lector de pantalla."
    },
    {
      "mito": "El label de cada radio ya explica de qué trata el grupo",
      "realidad": "\"Estándar\" o \"Exprés\" no dicen nada sobre a qué pregunta responden sin el legend del fieldset que los agrupa."
    },
    {
      "mito": "Un asterisco visual ya indica bien que el campo es obligatorio",
      "realidad": "Leído literalmente por un lector de pantalla (\"asterisco\"), no comunica \"obligatorio\" — la palabra completa en el texto, o aria-hidden en el símbolo más una ayuda real, sí lo hace."
    },
    {
      "mito": "tabindex=\"0\" y role=\"button\" ya convierten un div en un botón real",
      "realidad": "Acercan el rol y el foco, pero sin JavaScript propio que escuche Enter y espacio, ese div sigue sin activarse con teclado — un button real lo trae de fábrica."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Dejar un label sin ninguna asociación real con su campo.", "texto": "Ni for/id, ni el input envuelto dentro — es solo texto suelto que no ayuda a nadie más allá de quien ve la página." },
    { "titulo": "Usar radio o checkboxes relacionados sin fieldset ni legend.", "texto": "El grupo pierde su contexto — cada opción se anuncia sola, sin explicar a qué pregunta responde." },
    { "titulo": "Confiar solo en un asterisco de color para marcar lo obligatorio.", "texto": "Ni el color ni el símbolo solo comunican nada fiable a un lector de pantalla — hace falta texto real en algún punto." },
    { "titulo": "Reconstruir un control interactivo con un div en vez del elemento nativo.", "texto": "Empieza sin foco, sin rol, sin activación por teclado — todo eso hay que añadirlo a mano, y es fácil dejarse algo por el camino." }
  ]
}
```

## Ejercicios

1. Escribe un campo con label explícito (for/id) y otro con label implícito (envolviendo el input) — los dos deben ser accesibles por igual.
2. Agrupa 3 checkboxes relacionados (por ejemplo, "Temas de interés") dentro de un fieldset con un legend que explique la pregunta.
3. Marca un campo obligatorio de forma accesible: con la palabra "obligatorio" en el texto, o un asterisco con aria-hidden más una ayuda conectada con aria-describedby.
4. Encuentra en una web real un elemento clicable que no sea un button ni un a — ¿tiene tabindex y role? ¿Se puede activar con el teclado?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTML: A good basis for accessibility",
      "descripcion": "Guía de referencia de MDN sobre label, texto de enlace con sentido y por qué usar el elemento semántico correcto ahorra trabajo de accesibilidad.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Accessibility",
      "descripcion": "Curso de web.dev Learn Forms sobre cómo indicar campos obligatorios y reglas de formato de forma accesible, con aria-describedby.",
      "url": "https://web.dev/learn/forms/accessibility",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "Creating Accessible Forms",
      "descripcion": "Guía práctica de WebAIM sobre fieldset/legend para agrupar controles relacionados, con ejemplos reales de radio y checkboxes.",
      "url": "https://webaim.org/techniques/forms/",
      "etiqueta": "WebAIM"
    }
  ]
}
```
