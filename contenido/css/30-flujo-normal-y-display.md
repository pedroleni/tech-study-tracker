# El flujo normal y los valores de display

- **Módulo:** Layout
- **Slug:** `el-flujo-normal-y-los-valores-de-display` (autogenerado del título)
- **Orden:** 145
- **Fuentes:** [Introduction to CSS layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Introduction) + [Layout (web.dev)](https://web.dev/learn/css/layout) — ver `contenido/css/TEMARIO.md` #30

---

## Qué es y para qué sirve

Antes de flexbox, grid o position, cada elemento ya tiene un comportamiento por defecto: el flujo normal. Los elementos de bloque (`<h1>`, `<p>`, `<div>`) ocupan todo el ancho disponible y empiezan en una línea nueva. Los elementos en línea (`<span>`, `<a>`) fluyen junto al texto, sin forzar saltos de línea — y sin poder fijarles un `width` o `height`. `display` cambia ese comportamiento por defecto; `float` saca un elemento parcialmente del flujo para que el texto lo rodee. Esta lección abre el módulo de layout: las herramientas más potentes (position, flexbox, grid) llegan después, pero todas parten de este comportamiento base.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita entender el flujo normal antes de lo demás",
  "roles": [
    { "etiqueta": "Quien depura un span sin tamaño", "rol": "Saber que el problema es el display, no el width", "descripcion": "Un elemento en línea ignora width, height y el margen vertical por diseño — inline-block resuelve esto sin cambiar de etiqueta." },
    { "etiqueta": "Quien envuelve texto en una imagen", "rol": "Usar float para el efecto clásico de revista", "descripcion": "float: left saca la imagen del flujo normal y deja que el texto fluya a su alrededor, en vez de aparecer forzosamente debajo." },
    { "etiqueta": "Quien va a aprender flexbox y grid", "rol": "Partir de una base sólida antes de esas herramientas", "descripcion": "Entender qué hace el navegador por defecto, sin ninguna instrucción de layout, ayuda a saber cuándo de verdad hace falta flexbox o grid, y cuándo no." }
  ]
}
```

## Bloque e inline: el comportamiento por defecto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<h1>Encabezado</h1>\n<p>Un párrafo con <span>un span</span> dentro.</p>",
  "anotaciones": [
    { "fragmento": "<h1>Encabezado</h1>", "nota": "Elemento de bloque por defecto: ocupa el 100% del ancho disponible de su padre, y el siguiente elemento de bloque empieza en una línea nueva, sin excepción." },
    { "fragmento": "<span>un span</span>", "nota": "Elemento en línea por defecto: su tamaño depende solo de su contenido, fluye junto al texto que lo rodea, y NO acepta width ni height — esas propiedades se ignoran por completo." }
  ]
}
```

## inline-block: lo mejor de los dos mundos

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"font-family: sans-serif;\">Texto antes <span style=\"display: inline; width: 150px; height: 60px; background: #ede9fe; margin-top: 30px; border: 2px solid #7c3aed;\">Span</span> texto después.</p>",
  "despues": "<p style=\"font-family: sans-serif;\">Texto antes <span style=\"display: inline-block; width: 150px; height: 60px; background: #ede9fe; margin-top: 30px; border: 2px solid #7c3aed;\">Span</span> texto después.</p>",
  "nota": "Mismo span, con los mismos width, height y margin-top declarados en los dos casos. Antes (display: inline, el valor por defecto): esas tres propiedades se ignoran por completo — el span mide solo lo que ocupa su propio texto. Después (display: inline-block): el span respeta el width, el height y el margin-top, sin dejar de fluir en la misma línea que el texto que lo rodea."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  span.caja { display: inline-block; width: 100px; height: 100px; background: teal; }\n</style>\n<p>Texto <span class=\"caja\"></span> más texto.</p>",
  "opciones": [
    "El span se comporta como un div: ocupa toda una línea propia, con su tamaño de 100×100",
    "El span respeta el width y el height de 100×100, pero sigue fluyendo en la misma línea que el texto",
    "El width y el height se ignoran, igual que con display: inline"
  ],
  "correcta": 1,
  "explicacion": "inline-block combina lo mejor de los dos: respeta width, height y margin como un elemento de bloque, pero fluye en la misma línea que el texto que lo rodea, sin forzar un salto de línea antes o después."
}
```

## Cambiar el comportamiento por defecto de una etiqueta

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p style=\"font-family: sans-serif; width: 220px; border: 1px dashed #9ca3af; padding: 8px;\">Antes <a href=\"#\" style=\"background: #ede9fe; padding: 4px;\">un enlace</a> y más texto después que sigue en la misma línea.</p>",
  "despues": "<p style=\"font-family: sans-serif; width: 220px; border: 1px dashed #9ca3af; padding: 8px;\">Antes <a href=\"#\" style=\"display: block; background: #ede9fe; padding: 4px;\">un enlace</a> y más texto después que sigue en la misma línea.</p>",
  "nota": "Un <a>, en línea por defecto. Antes: fluye junto al texto, en la misma línea. Después, con display: block añadido: se convierte en un bloque que ocupa todo el ancho disponible, empujando el texto que le sigue a la línea de abajo — un cambio de comportamiento completo, sin cambiar de etiqueta HTML."
}
```

## float: sacar un elemento parcialmente del flujo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"font-family: sans-serif; width: 240px;\">\n  <div style=\"width: 60px; height: 60px; background: #7c3aed; border-radius: 4px;\"></div>\n  <p style=\"margin: 4px 0 0;\">Este párrafo debería rodear la caja morada si estuviera flotada — como no lo está, aparece debajo de ella, en su propia línea separada.</p>\n</div>",
  "despues": "<div style=\"font-family: sans-serif; width: 240px;\">\n  <div style=\"width: 60px; height: 60px; background: #7c3aed; border-radius: 4px; float: left; margin-right: 8px;\"></div>\n  <p style=\"margin: 0;\">Este párrafo debería rodear la caja morada si estuviera flotada — y como SÍ lo está, el texto fluye alrededor de ella en vez de aparecer forzosamente debajo.</p>\n</div>",
  "nota": "Antes: sin float, la caja morada y el párrafo se apilan como dos bloques normales, uno debajo del otro. Después, con float: left en la caja: el párrafo rodea la caja por su lado derecho — el efecto clásico de texto envolviendo una imagen en una revista."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un contenedor con solo hijos flotados puede colapsar a altura cero",
  "contenido": "Un elemento flotado no cuenta para calcular la altura de su contenedor — si TODOS los hijos de una caja están flotados, la caja puede colapsar a una altura de prácticamente cero, aunque los elementos flotados sigan siendo visibles. clear en un elemento posterior, o display: flow-root en el propio contenedor, evita este problema."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"border: 3px solid #7c3aed; font-family: sans-serif;\">\n  <div style=\"width: 60px; height: 60px; background: #ede9fe; float: left;\"></div>\n</div>",
  "despues": "<div style=\"border: 3px solid #7c3aed; font-family: sans-serif; display: flow-root;\">\n  <div style=\"width: 60px; height: 60px; background: #ede9fe; float: left;\"></div>\n</div>",
  "nota": "El mismo hijo flotado, único contenido del contenedor, en los dos casos. Antes: el contenedor (borde morado) colapsa a una línea casi invisible — no \"ve\" la altura de su hijo flotado. Después, con display: flow-root en el contenedor: el borde SÍ envuelve correctamente la caja flotada de dentro, mostrando su altura real."
}
```

## Lo que el flujo normal y display NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "display: block y display: inline-block hacen lo mismo, solo con distinto nombre",
      "realidad": "inline-block sigue fluyendo en la misma línea que el texto de alrededor; block siempre fuerza su propia línea, ocupando el ancho disponible."
    },
    {
      "mito": "float saca a un elemento del documento por completo, como position: absolute",
      "realidad": "Solo lo saca del flujo NORMAL — el texto y otros elementos en línea siguen reaccionando a su presencia, rodeándolo, algo que absolute no hace."
    },
    {
      "mito": "Un contenedor con un único hijo flotado siempre mide al menos lo que mide ese hijo",
      "realidad": "Puede colapsar a una altura de prácticamente cero, porque un elemento flotado no cuenta para calcular la altura de su contenedor."
    },
    {
      "mito": "display: inline hace que cualquier elemento se comporte exactamente como un <span>",
      "realidad": "Cambia cómo fluye (en línea, no en bloque), pero un <div> con display: inline sigue siendo semánticamente un div — display no cambia el significado del HTML, solo su presentación."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Fijar width o height en un elemento inline sin cambiar su display.", "texto": "No pasa nada visible — hace falta inline-block o block para que esas propiedades tengan algún efecto." },
    { "titulo": "Olvidar que un contenedor con solo hijos flotados dentro puede colapsar a altura cero.", "texto": "Un problema clásico de los layouts basados en float, resuelto con clear o display: flow-root." },
    { "titulo": "Usar float para layouts complejos hoy en día.", "texto": "flexbox y grid (próximas lecciones) suelen ser herramientas más adecuadas para maquetar una página completa." },
    { "titulo": "No aplicar clear o display: flow-root tras un elemento flotado.", "texto": "El contenido siguiente puede solaparse con él de forma inesperada." }
  ]
}
```

## Ejercicios

1. Explica por qué un `<span>` con `width: 200px` no cambia de tamaño visualmente, y qué cambio de una sola propiedad lo solucionaría.
2. Escribe una regla que haga que una imagen flote a la izquierda, con el texto de un párrafo fluyendo a su alrededor.
3. Explica por qué un contenedor con un solo hijo flotado dentro puede colapsar a una altura de casi cero, y cómo evitarlo.
4. Escribe una regla que convierta un `<a>` normal en un bloque que ocupe toda su línea, útil para un enlace grande y clicable.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Este span tiene width: 200px pero no cambia de tamaño — arréglalo con un cambio de display (ejercicio 1). Haz que la imagen flote a la izquierda con el texto fluyendo alrededor (ejercicio 2). Convierte el enlace en un bloque que ocupe toda su línea (ejercicio 4).",
  "html": "<span class=\"caja-span\">Span con width fijo</span>\n<div class=\"con-flotante\">\n  <img class=\"foto\" src=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23ccc'/%3E%3C/svg%3E\" alt=\"\">\n  <p>Texto largo que debería fluir alrededor de la imagen flotada, si el float está bien aplicado a la imagen de al lado.</p>\n</div>\n<a href=\"#\" class=\"enlace-bloque\">Enlace grande</a>",
  "css": ".caja-span { width: 200px; background: #eee; }",
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
      "titulo": "Introduction to CSS layout",
      "descripcion": "Guía de MDN sobre el flujo normal, block/inline/inline-block, floats y una vista general de las herramientas de layout que vienen después.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Introduction",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Layout",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre el doble papel de display y las advertencias prácticas al usar float.",
      "url": "https://web.dev/learn/css/layout",
      "etiqueta": "web.dev"
    }
  ]
}
```
