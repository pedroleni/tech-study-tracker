# Pseudo-clases: estados y condiciones

- **Módulo:** Fundamentos de CSS
- **Slug:** `pseudo-clases-estados-y-condiciones` (autogenerado del título)
- **Orden:** 15
- **Fuentes:** [Pseudo-classes and pseudo-elements (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements) + [Pseudo-classes (web.dev)](https://web.dev/learn/css/pseudo-classes) — ver `contenido/css/TEMARIO.md` #4

---

## Qué es y para qué sirve

Una pseudo-clase selecciona un elemento según su ESTADO, no según lo que tiene escrito en el HTML — un enlace bajo el puntero, el primer hijo de una lista, un campo marcado como obligatorio. Empiezan con un solo `:`, y cubren tres terrenos distintos: interacción en tiempo real, posición en el árbol del documento, y estado de un formulario — sin escribir ni una línea de JavaScript en ninguno de los tres casos.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué tipo de pseudo-clase necesitas según lo que cambia",
  "roles": [
    { "etiqueta": "De interacción (:hover, :focus)", "rol": "Reaccionar a lo que hace la persona", "descripcion": "Cambian con el ratón o el teclado, en tiempo real — no existen en el HTML, solo se activan mientras dura la interacción." },
    { "etiqueta": "Estructurales (:first-child, :nth-child)", "rol": "Reaccionar a la posición en el DOM", "descripcion": "Seleccionan según dónde está un elemento entre sus hermanos, sin necesitar ninguna clase añadida a mano." },
    { "etiqueta": "De formulario (:required, :checked)", "rol": "Reaccionar al propio HTML del campo", "descripcion": "Reflejan atributos y estado ya presentes en el marcado — required, disabled, checked — sin JavaScript de por medio." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres dar feedback visual sin JavaScript",
  "contenido": ":hover, :focus, :checked cambian el estilo solos, reaccionando al estado real del elemento — sin escuchar ni un evento."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el estilo depende de la posición, no de una clase",
  "contenido": "El primer elemento de una lista, las filas pares de una tabla — :first-child y :nth-child() lo resuelven sin tocar el HTML."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres estilizar \"todo menos esto\"",
  "contenido": ":not() invierte la lógica habitual: en vez de listar lo que sí quieres, dices lo único que quieres excluir."
}
```

## Pseudo-clases de interacción y de enlace

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  a:link, a:visited {\n    color: #7c3aed;\n  }\n\n  a:hover {\n    color: #db2777;\n  }\n\n  a:focus-visible {\n    outline: 3px solid #2563eb;\n  }\n\n  a:active {\n    color: #b91c1c;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "a:link, a:visited {\n    color: #7c3aed;\n  }", "nota": "El orden importa: link/visited van PRIMERO, porque son el estado \"de reposo\" que las siguientes reglas necesitan poder sobreescribir." },
    { "fragmento": "a:hover {\n    color: #db2777;\n  }", "nota": "Solo mientras el puntero está encima — desaparece en cuanto se retira, sin ninguna transición extra necesaria para eso." },
    { "fragmento": "a:active {\n    color: #b91c1c;\n  }", "nota": "El más corto de todos: solo dura el instante entre pulsar y soltar el clic. Va el último porque, si fuera antes, otro estado podría taparlo." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El orden LVHA no es una costumbre, es necesario",
  "contenido": "Escribir :hover antes que :link/:visited puede hacer que el color de reposo gane por estar declarado después, con la misma especificidad. El orden (link, visited, hover, focus, active) evita que unas reglas se coman a otras por casualidad de posición en el archivo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": ":visited solo puede cambiar un puñado de propiedades",
  "contenido": "Por motivos de privacidad (para que ninguna web pueda \"leer\" tu historial midiendo el layout), :visited solo permite tocar color, background-color, border-color, outline-color y el color de un SVG — nunca tamaño, posición ni nada medible desde fuera."
}
```

## Pseudo-clases estructurales

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  p { font-weight: normal; }\n</style>\n<article>\n  <p>Primer párrafo</p>\n  <p>Segundo párrafo</p>\n  <p>Tercer párrafo</p>\n</article>",
  "despues": "<style>\n  p { font-weight: normal; }\n  p:first-child {\n    font-weight: bold;\n    font-size: 1.2em;\n  }\n</style>\n<article>\n  <p>Primer párrafo</p>\n  <p>Segundo párrafo</p>\n  <p>Tercer párrafo</p>\n</article>",
  "nota": "Mismo HTML, sin ninguna clase añadida. p:first-child selecciona el primer párrafo por su POSICIÓN entre sus hermanos, no por nada escrito a mano — si se reordenan los párrafos, el estilo \"salta\" solo al que ahora ocupa el primer puesto."
}
```

## La fórmula an+b de :nth-child()

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  li:nth-child(odd) {\n    background: #f1f5f9;\n  }\n\n  li:nth-child(3n) {\n    color: #7c3aed;\n  }\n\n  li:nth-child(n+4) {\n    font-weight: bold;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "li:nth-child(odd) {\n    background: #f1f5f9;\n  }", "nota": "Las filas impares (1ª, 3ª, 5ª...) — el clásico \"cebrado\" de una tabla o lista." },
    { "fragmento": "li:nth-child(3n) {\n    color: #7c3aed;\n  }", "nota": "Cada tercer elemento: 3º, 6º, 9º... la fórmula an+b con a=3 y b=0." },
    { "fragmento": "li:nth-child(n+4) {\n    font-weight: bold;\n  }", "nota": "El 4º elemento y todos los que vienen después — b=4 fija el punto de partida, sin ningún límite superior." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  li:nth-child(2n+1) { color: red; }\n</style>\n<ul>\n  <li>Uno</li>\n  <li>Dos</li>\n  <li>Tres</li>\n  <li>Cuatro</li>\n</ul>",
  "opciones": [
    "Se colorean \"Dos\" y \"Cuatro\" (las posiciones pares)",
    "Se colorean \"Uno\" y \"Tres\" (las posiciones impares)",
    "Se colorean los cuatro elementos"
  ],
  "correcta": 1,
  "explicacion": "2n+1, con n empezando en 0, da 1, 3, 5, 7... — exactamente lo mismo que la palabra clave odd. Aquí selecciona el 1º (\"Uno\") y el 3º (\"Tres\"), dejando \"Dos\" y \"Cuatro\" sin colorear."
}
```

## :not(): excluir en vez de incluir

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  li:not(:last-child) {\n    border-bottom: 1px solid #e2e8f0;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "li:not(:last-child)", "nota": "\"Cualquier li que NO sea el último\" — un patrón muy común para separadores entre elementos de una lista, sin dejar un borde sobrante al final." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  li { padding: 8px 0; }\n</style>\n<ul>\n  <li>Uno</li>\n  <li>Dos</li>\n  <li>Tres</li>\n</ul>",
  "despues": "<style>\n  li { padding: 8px 0; }\n  li:not(:last-child) {\n    border-bottom: 1px solid #94a3b8;\n  }\n</style>\n<ul>\n  <li>Uno</li>\n  <li>Dos</li>\n  <li>Tres</li>\n</ul>",
  "nota": "li:not(:last-child) añade el borde a TODOS los elementos excepto al último — el patrón exacto para separar filas de una lista sin dejar una línea colgando al final."
}
```

## Pseudo-clases de formulario

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  input { border: 2px solid #94a3b8; padding: 6px; border-radius: 4px; }\n</style>\n<input type=\"text\" placeholder=\"Opcional\">\n<input type=\"text\" placeholder=\"Obligatorio\" required>",
  "despues": "<style>\n  input { border: 2px solid #94a3b8; padding: 6px; border-radius: 4px; }\n  input:required {\n    border-color: #dc2626;\n  }\n</style>\n<input type=\"text\" placeholder=\"Opcional\">\n<input type=\"text\" placeholder=\"Obligatorio\" required>",
  "nota": "Los dos campos ya existen igual en el HTML — el segundo lleva required desde el principio. input:required detecta ese atributo solo, sin JavaScript: el segundo campo se marca con un borde rojo, el primero se queda como estaba."
}
```

## Lo que las pseudo-clases NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El orden en que escribes :link, :hover, :focus, :active no importa",
      "realidad": "Si :hover se escribe antes que :link/:visited, con la misma especificidad puede acabar tapado por el color de reposo — el orden LVHA evita justo ese problema."
    },
    {
      "mito": ":visited puede cambiar cualquier propiedad, igual que :hover",
      "realidad": "Por motivos de privacidad, solo permite tocar color, background-color, border-color, outline-color y el color de un SVG — nunca nada medible desde fuera de la página."
    },
    {
      "mito": ":hover funciona igual en cualquier dispositivo",
      "realidad": "En pantallas táctiles sin puntero real, :hover se comporta de forma inconsistente entre navegadores — no es un sustituto fiable de un estado que de verdad necesita funcionar en móvil."
    },
    {
      "mito": ":nth-child(2n) y :nth-of-type(2n) hacen siempre lo mismo",
      "realidad": ":nth-child cuenta TODOS los hermanos, sea cual sea su etiqueta; :nth-of-type cuenta solo los del mismo tipo — con contenido mixto, el resultado puede ser distinto entre los dos."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir :hover antes que :link o :visited.", "texto": "Con la misma especificidad, el orden en el archivo decide qué regla gana — hover tiene que ir después para no quedar tapado." },
    { "titulo": "Intentar cambiar el tamaño o la posición con :visited.", "texto": "El navegador ignora esas propiedades en :visited por diseño, sin ningún error visible que avise de por qué no funciona." },
    { "titulo": "Confundir :nth-child con :nth-of-type en contenido mixto.", "texto": "Si hay etiquetas distintas mezcladas entre los hermanos, elegir el que no corresponde selecciona elementos inesperados." },
    { "titulo": "Depender solo de :hover para información importante en un sitio con uso táctil real.", "texto": "Sin un puntero de verdad, ese estado puede no dispararse nunca — la información debe estar disponible de otra forma también." }
  ]
}
```

## Ejercicios

1. Escribe las cuatro pseudo-clases de un enlace (link, visited, hover, focus-visible) en el orden LVHA correcto.
2. Escribe un selector que cebre (alterne colores) las filas de una tabla usando :nth-child(odd) y :nth-child(even).
3. Escribe un selector con :not() que ponga un margen inferior a todos los párrafos de un artículo excepto al último.
4. Explica con un ejemplo concreto la diferencia entre :nth-child(2) y :nth-of-type(2) en una lista con un h3 mezclado entre los párrafos.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Pseudo-classes and pseudo-elements",
      "descripcion": "Guía de referencia de MDN sobre pseudo-clases de interacción, estructurales y de enlace, con la nota del orden LVHA.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Pseudo-classes",
      "descripcion": "Curso de web.dev con la explicación de por qué :visited solo puede cambiar un conjunto limitado de propiedades por motivos de privacidad.",
      "url": "https://web.dev/learn/css/pseudo-classes",
      "etiqueta": "web.dev"
    }
  ]
}
```
