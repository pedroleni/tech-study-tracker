# Anidamiento nativo (CSS nesting)

- **Módulo:** Fundamentos de CSS
- **Slug:** `anidamiento-nativo-css-nesting` (autogenerado del título)
- **Orden:** 45
- **Fuentes:** [Using CSS nesting (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using) + [Nesting (web.dev)](https://web.dev/learn/css/nesting) — ver `contenido/css/TEMARIO.md` #10

---

## Qué es y para qué sirve

Durante años, escribir `.tarjeta .titulo { }` y `.tarjeta .cuerpo { }` significaba repetir `.tarjeta` en cada regla — o instalar Sass solo para anidarlas. Ahora el propio navegador entiende el anidamiento: escribes `.titulo { }` y `.cuerpo { }` DENTRO de `.tarjeta { }`, y el navegador arma el selector final por ti. Sin compilador, sin build step — CSS puro que el navegador interpreta directamente.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se beneficia de no repetir el selector padre",
  "roles": [
    { "etiqueta": "Quien viene de Sass o SCSS", "rol": "Anidar sin depender de un compilador", "descripcion": "El mismo hábito de organizar selectores por bloques, pero interpretado directamente por el navegador — sin paso de build, sin herramienta externa." },
    { "etiqueta": "Quien organiza CSS por componentes", "rol": "Agrupar todas las reglas de una tarjeta o un botón", "descripcion": "Todo lo que pertenece a .tarjeta vive dentro de un mismo bloque en el archivo, en vez de reglas .tarjeta sueltas repartidas por todo el CSS." },
    { "etiqueta": "Quien necesita nombres de clase largos", "rol": "Reducir el ruido visual de selectores repetidos", "descripcion": "Anidar evita reescribir .componente-de-nombre-largo en cada una de sus diez reglas hijas." }
  ]
}
```

## Anidamiento implícito: sin &, se vuelve descendiente

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tarjeta {\n    border: 1px solid #d1d5db;\n    padding: 16px;\n\n    .titulo {\n      color: #7c3aed;\n      font-size: 1.25em;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".titulo {\n      color: #7c3aed;\n      font-size: 1.25em;\n    }", "nota": "Sin & delante, el navegador añade automáticamente un combinador descendiente — esto se interpreta exactamente como .tarjeta .titulo { }, como si lo hubieras escrito aparte." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div class=\"tarjeta\">\n  <p class=\"titulo\">Título anidado</p>\n  <p>Texto normal</p>\n</div>",
  "despues": "<style>\n  .tarjeta {\n    border: 1px solid #d1d5db;\n    padding: 16px;\n    font-family: sans-serif;\n\n    .titulo {\n      color: #7c3aed;\n      font-size: 1.25em;\n    }\n  }\n</style>\n<div class=\"tarjeta\">\n  <p class=\"titulo\">Título anidado</p>\n  <p>Texto normal</p>\n</div>",
  "nota": "Mismo HTML en los dos casos. El bloque anidado produce el mismo resultado que escribir .tarjeta { border...} y .tarjeta .titulo { color...} por separado — el navegador arma esos selectores completos por ti."
}
```

## &: cuándo hace falta explícitamente

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin &, un selector compuesto se convierte sin querer en descendiente",
  "contenido": ".notice { &.warning { } } produce .notice.warning — el MISMO elemento con las dos clases. Si se omite el & aquí (.notice { .warning { } }), el resultado es .notice .warning — un elemento .warning DENTRO de .notice, un selector completamente distinto. Para selectores compuestos (dos clases en el mismo elemento) y para pseudo-clases, & es obligatorio."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .grupo {\n    &:last-child {\n      border: 3px solid red;\n    }\n  }\n</style>\n<div class=\"grupo\"><p>Primero</p><p>Segundo</p></div>\n<div class=\"grupo\"><p>Único</p></div>",
  "opciones": [
    "Los dos .grupo reciben el borde rojo",
    "Solo el segundo .grupo recibe el borde rojo — el primero no, aunque tenga varios <p> dentro",
    "Ningún .grupo recibe el borde: &:last-child es sintaxis inválida"
  ],
  "correcta": 1,
  "explicacion": "&:last-child (sin espacio) es un selector COMPUESTO: equivale a .grupo:last-child, que pregunta si el propio .grupo es el último hijo de SU padre — no tiene nada que ver con cuántos elementos haya dentro de él. El primer .grupo tiene un hermano .grupo después, así que no es el último, y no recibe el borde pese a tener varios párrafos dentro."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .grupo {\n    &:last-child {\n      border: 3px solid #dc2626;\n      padding: 8px;\n    }\n  }\n</style>\n<div class=\"grupo\">\n  <p>Primero</p>\n  <p>Segundo</p>\n  <p>Tercero (último hijo dentro de este grupo)</p>\n</div>\n<div class=\"grupo\">\n  <p>Otro grupo, este sí es el último</p>\n</div>",
  "despues": "<style>\n  .grupo {\n    & :last-child {\n      color: #dc2626;\n      font-weight: bold;\n    }\n  }\n</style>\n<div class=\"grupo\">\n  <p>Primero</p>\n  <p>Segundo</p>\n  <p>Tercero (último hijo dentro de este grupo)</p>\n</div>\n<div class=\"grupo\">\n  <p>Otro grupo, este sí es el último</p>\n</div>",
  "nota": "Un solo espacio cambia todo. Antes (&:last-child, sin espacio): solo el SEGUNDO .grupo completo recibe un borde, porque es el único que es el último hijo de su propio padre. Después (& :last-child, con espacio — un descendiente cualquiera): el último párrafo DENTRO de cada grupo se pinta de rojo — \"Tercero...\" en el primer grupo y \"Otro grupo...\" en el segundo."
}
```

## Combinadores dentro del anidamiento

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  h2 {\n    color: #111827;\n\n    & + p {\n      color: #6b7280;\n      font-style: italic;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "& + p {\n      color: #6b7280;\n      font-style: italic;\n    }", "nota": "Se puede usar cualquier combinador junto al &: aquí produce h2 + p — el párrafo que viene justo después de un h2. También funciona sin escribir el & (+ p a secas), pero escribirlo explícito deja más claro qué se está seleccionando." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<h2>Título</h2>\n<p>Este párrafo es el hermano inmediato del h2.</p>\n<p>Este otro no lo es.</p>",
  "despues": "<style>\n  h2 {\n    color: #111827;\n    font-family: sans-serif;\n\n    & + p {\n      color: #6b7280;\n      font-style: italic;\n    }\n  }\n  p { font-family: sans-serif; }\n</style>\n<h2>Título</h2>\n<p>Este párrafo es el hermano inmediato del h2.</p>\n<p>Este otro no lo es.</p>",
  "nota": "& + p dentro de h2 produce exactamente h2 + p. Solo el primer párrafo, el que está pegado al h2, recibe el estilo — el segundo, aunque también sea un p en la misma página, no es su hermano inmediato."
}
```

## Anidar consultas de medios y otras at-rules

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .caja {\n    background-color: silver;\n\n    @media (min-width: 600px) {\n      background-color: tomato;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@media (min-width: 600px) {\n      background-color: tomato;\n    }", "nota": "@media, @supports, @container y @layer se pueden anidar directamente dentro de una regla — no hace falta cerrarla y abrir la media query por fuera, como en CSS clásico." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Anidar demasiado profundo dificulta leer el selector final",
  "contenido": "La propia guía de web.dev lo advierte: anidar más de dos o tres niveles se considera mala práctica y complica el mantenimiento. Cada nivel de anidamiento suma al selector final generado — con demasiados niveles, adivinar qué selector completo se está produciendo deja de ser trivial de leer."
}
```

## Lo que el anidamiento nativo NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "&__elemento crea automáticamente una clase como .componente__elemento, igual que en Sass con BEM",
      "realidad": "La concatenación de nombres NO existe en el anidamiento nativo — &__elemento no se pega al nombre de la clase padre. Para BEM, sigue haciendo falta escribir la clase completa: & .componente__elemento."
    },
    {
      "mito": "Un selector de tipo como p se puede anidar como &p, igual que un selector compuesto de clase",
      "realidad": "El selector de tipo debe ir SIEMPRE antes del &, pegado sin espacio: p&. Escribirlo como &p es sintaxis inválida."
    },
    {
      "mito": "&:last-child y & :last-child (con espacio) seleccionan lo mismo",
      "realidad": "Sin espacio es un selector compuesto sobre el propio elemento padre; con espacio es un descendiente cualquiera dentro de él — un solo carácter cambia completamente qué se selecciona."
    },
    {
      "mito": "Cuanto más anidado, más organizado y legible es el CSS",
      "realidad": "Pasar de dos o tres niveles de profundidad se considera mala práctica según la propia documentación — dificulta ver de un vistazo qué selector final se está generando."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir &__hijo esperando el comportamiento de concatenación de Sass.", "texto": "El anidamiento nativo no concatena cadenas de texto — hay que escribir la clase completa aparte, con un combinador si hace falta." },
    { "titulo": "Olvidar el & en un selector compuesto.", "texto": ".notice { .warning { } } se convierte en .notice .warning (descendiente), no en .notice.warning (compuesto) — sin & el resultado cambia de significado por completo." },
    { "titulo": "Confundir &:pseudo-clase con & :pseudo-clase por un simple espacio.", "texto": "El primero apunta al propio elemento padre; el segundo, a cualquier descendiente — la diferencia de un espacio cambia el elemento seleccionado." },
    { "titulo": "Anidar más de dos o tres niveles de profundidad.", "texto": "Hace mucho más difícil leer qué selector final se está generando — mejor aplanar la estructura antes de seguir anidando." }
  ]
}
```

## Ejercicios

1. Reescribe `.tarjeta .titulo { color: purple; }` y `.tarjeta .cuerpo { color: gray; }` usando anidamiento nativo, con un solo bloque `.tarjeta { }`.
2. Escribe una regla anidada dentro de `.boton` que seleccione el propio `.boton` cuando también tenga la clase `.deshabilitado` — como selector compuesto, no descendiente.
3. Con un ejemplo de HTML, explica la diferencia real entre `.lista { &:first-child { } }` y `.lista { & :first-child { } }`.
4. Explica por qué `.bloque { &__elemento { } }` no crea una clase `.bloque__elemento` en anidamiento nativo, a diferencia de lo que haría Sass con el mismo patrón BEM.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Using CSS nesting",
      "descripcion": "Guía de MDN sobre la sintaxis completa del anidamiento nativo: el selector &, combinadores, at-rules anidadas y sus restricciones.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Nesting",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con la advertencia sobre profundidad de anidamiento y el detalle de especificidad de &.",
      "url": "https://web.dev/learn/css/nesting",
      "etiqueta": "web.dev"
    }
  ]
}
```
