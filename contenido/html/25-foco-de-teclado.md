# Foco de teclado: tabindex, orden de tabulación y por qué no quitarlo

- **Módulo:** Accesibilidad
- **Slug:** `foco-de-teclado-tabindex-orden-de-tabulacion-y-por-que-no-quitarlo` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [Focus (web.dev)](https://web.dev/learn/html/focus) + [WCAG 2.2 Quick Reference (W3C/WAI)](https://www.w3.org/WAI/WCAG22/quickref/) — ver `contenido/html/TEMARIO.md` #25

---

## Qué es y para qué sirve

Sin ratón, sin pantalla táctil, quien navega solo con teclado depende de una sola cosa: saber en todo momento qué elemento tiene el foco. Los enlaces, botones y campos de formulario ya son focuseables de fábrica, en el orden en que aparecen en el HTML. `tabindex` puede cambiar eso — para bien, haciendo focuseable algo que no lo era, o para mal, rompiendo un orden que ya funcionaba.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué necesita quien navega solo con teclado",
  "roles": [
    { "etiqueta": "Un orden de foco con sentido", "rol": "Que Tab siga una secuencia lógica", "descripcion": "Lo natural es que coincida con el orden del HTML y con lo que se ve en pantalla — un orden que salta de un lado a otro es difícil de seguir." },
    { "etiqueta": "Una pista visual del foco actual", "rol": "Saber dónde está en todo momento", "descripcion": "Sin un contorno o estilo visible, moverse con Tab es navegar a ciegas — literalmente no se puede saber dónde se está." },
    { "etiqueta": "Elementos realmente interactivos", "rol": "Que lo que reciba foco se pueda usar", "descripcion": "Un elemento focuseable que no hace nada al pulsar Enter o espacio es peor que uno que directamente no recibe foco." }
  ]
}
```

## Cuándo lo tienes en cuenta de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando un elemento no interactivo necesita recibir foco",
  "contenido": "Un panel que se abre dinámicamente, un mensaje de error que debe anunciarse — ahí tabindex=\"-1\" permite enfocarlo por código sin meterlo en el recorrido normal de Tab."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Cuando el CSS reordena visualmente el contenido",
  "contenido": "flexbox, grid o position pueden hacer que algo se VEA primero sin que el foco lo visite primero — comprueba siempre el orden de tabulación después de maquetar, no solo el resultado visual."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Nunca cuando la única razón es que el contorno \"no pega\" con el diseño",
  "contenido": "outline: none sin ningún estilo de foco alternativo dejaría la página inutilizable con teclado — hay formas de personalizar el foco sin eliminarlo."
}
```

## tabindex: tres valores, tres comportamientos distintos

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<div tabindex=\"0\">Ahora es focuseable, en su lugar natural del HTML</div>\n\n<div tabindex=\"-1\" id=\"aviso\">Focuseable solo por código (element.focus()), nunca con Tab</div>\n\n<input type=\"text\" tabindex=\"2\">\n<input type=\"text\" tabindex=\"1\">",
  "anotaciones": [
    { "fragmento": "tabindex=\"0\"", "nota": "Convierte cualquier elemento en focuseable con Tab, respetando su posición natural en el orden del HTML — el valor más seguro y el más habitual." },
    { "fragmento": "tabindex=\"-1\"", "nota": "Focuseable por código, pero fuera del recorrido normal de Tab — útil para mover el foco a un panel o mensaje de error justo cuando aparece, sin añadirlo a la secuencia habitual." },
    { "fragmento": "tabindex=\"2\"", "nota": "Un valor positivo crea su PROPIO orden de prioridad, por encima del orden real del HTML — casi siempre termina en lo que la comunidad llama \"caos de orden de foco\"." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<input type=\"text\" tabindex=\"2\" placeholder=\"Campo A\">\n<input type=\"text\" tabindex=\"1\" placeholder=\"Campo B\">\n<input type=\"text\" placeholder=\"Campo C\">",
  "opciones": [
    "Tab visita los campos en el orden del HTML: A, B, C",
    "Tab visita primero B (tabindex=1), luego A (tabindex=2), y por último C",
    "El navegador ignora tabindex si hay más de un valor distinto en la misma página"
  ],
  "correcta": 1,
  "explicacion": "Los valores positivos de tabindex crean su propio orden de prioridad, por encima del orden del HTML: Tab visita primero el valor más bajo (1, Campo B), luego el siguiente (2, Campo A), y al final los elementos sin tabindex explícito (Campo C), en su orden natural. Mezclar tabindex positivos con el orden normal es la causa más común de un orden de foco confuso."
}
```

## :focus y :focus-visible: por qué no basta con quitar el contorno

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  input:focus { outline: none; }\n</style>\n<input type=\"text\" autofocus placeholder=\"Sin contorno de foco\">",
  "despues": "<style>\n  input:focus { outline: 3px solid #2563eb; outline-offset: 2px; }\n</style>\n<input type=\"text\" autofocus placeholder=\"Con contorno de foco\">",
  "nota": "Los dos campos reciben el foco automáticamente al cargar (autofocus), para ver el estado real de :focus sin pulsar Tab. En el de antes, outline: none deja el campo enfocado SIN ninguna pista visual de que lo está. En el de después, un contorno propio mantiene esa pista — cumpliendo el criterio WCAG 2.4.7 Focus Visible."
}
```

WCAG respalda esto con normativa concreta, no solo con una recomendación de estilo:

| Criterio | Nivel | Qué exige |
|---|---|---|
| 2.4.3 Focus Order | A | El orden de foco debe seguir una secuencia con sentido, cuando ese orden afecta al significado del contenido |
| 2.4.7 Focus Visible | AA | Tiene que existir un modo en el que el foco de teclado sea visible |
| 2.4.11 Focus Not Obscured (mínimo) | AA | Un elemento con foco no puede quedar completamente tapado por contenido superpuesto |

## Lo que el foco de teclado NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Quitar el contorno de foco con outline: none es solo un detalle estético",
      "realidad": "Sin sustituirlo por otra pista visual, deja a quien navega con teclado sin ninguna forma de saber dónde está — incumple directamente el criterio WCAG 2.4.7."
    },
    {
      "mito": "Un tabindex más alto siempre da más prioridad, así que usarlo generosamente ayuda",
      "realidad": "Mezclar valores positivos con el orden natural del HTML es la causa más común de un orden de foco confuso — la recomendación real es casi no usarlos nunca."
    },
    {
      "mito": "Los elementos no interactivos son focuseables si el diseño lo necesita",
      "realidad": "No lo son por defecto — hace falta tabindex=\"0\" explícito para incluirlos en la navegación por teclado, y añadir además el rol y el comportamiento correctos."
    },
    {
      "mito": ":focus y :focus-visible son lo mismo, solo con nombres distintos",
      "realidad": ":focus se activa con cualquier forma de enfocar, incluido un clic de ratón; :focus-visible solo cuando el navegador determina que el contorno es útil, típicamente con teclado — por eso evita mostrar el contorno en un simple clic."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Eliminar el contorno de foco sin poner nada en su lugar.", "texto": "Dejar :focus { outline: none } sin ningún estilo alternativo hace la página inutilizable con teclado, aunque se vea más \"limpia\"." },
    { "titulo": "Usar tabindex con valores positivos para forzar un orden concreto.", "texto": "Casi siempre produce un orden confuso e inconsistente con lo que se ve en pantalla — mejor reordenar el propio HTML si el orden real no es el correcto." },
    { "titulo": "Añadir tabindex=\"0\" a un div sin gestionar también teclado y rol.", "texto": "Lo hace focuseable, pero sin el comportamiento ni el rol ARIA correctos sigue sin ser un control real." },
    { "titulo": "Dejar que el CSS reordene visualmente sin comprobar el orden de tabulación.", "texto": "Un elemento que aparece primero visualmente (con order o position) puede seguir recibiendo el foco en último lugar si el HTML no cambia." }
  ]
}
```

## Ejercicios

1. Escribe un formulario de 3 campos y comprueba con Tab que el orden coincide con el orden del HTML.
2. Reescribe un ejemplo con tabindex positivos usando el orden natural del HTML en su lugar.
3. Escribe CSS para un estilo de :focus-visible propio, claramente visible tanto en tema claro como oscuro.
4. Navega una web real usando solo Tab y Mayús+Tab — ¿el foco sigue un orden lógico? ¿Se ve siempre con claridad dónde está?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Focus",
      "descripcion": "Curso de web.dev sobre elementos focuseables, tabindex y por qué evitar valores positivos.",
      "url": "https://web.dev/learn/html/focus",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "WCAG 2.2 Quick Reference",
      "descripcion": "Los criterios de éxito normativos del W3C/WAI sobre orden de foco y visibilidad del foco, con su nivel de conformidad exacto.",
      "url": "https://www.w3.org/WAI/WCAG22/quickref/",
      "etiqueta": "W3C/WAI"
    }
  ]
}
```
