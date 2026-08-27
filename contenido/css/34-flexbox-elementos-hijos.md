# Flexbox: los elementos hijos

- **Módulo:** Layout
- **Slug:** `flexbox-los-elementos-hijos` (autogenerado del título)
- **Orden:** 165
- **Fuentes:** [Flexbox (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) + [Flexbox (web.dev)](https://web.dev/learn/css/flexbox) — ver `contenido/css/TEMARIO.md` #34

---

## Qué es y para qué sirve

La lección anterior configuró el CONTENEDOR flex. Esta se ocupa de sus HIJOS: `flex-grow` reparte el espacio sobrante entre ellos, `flex-shrink` decide quién cede espacio cuando falta, `flex-basis` fija el punto de partida antes de crecer o encogerse, `order` cambia el orden visual sin tocar el HTML, y `align-self` anula la alineación del contenedor para un solo elemento.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién ajusta el comportamiento de un elemento flex en concreto",
  "roles": [
    { "etiqueta": "Quien necesita columnas proporcionales", "rol": "Que una columna sea el doble de ancha que otra", "descripcion": "flex-grow: 2 en un elemento, frente a flex-grow: 1 en los demás, reparte el espacio sobrante en esa proporción exacta." },
    { "etiqueta": "Quien reordena sin tocar el HTML", "rol": "Cambiar qué aparece primero, solo con CSS", "descripcion": "order cambia el orden visual de los elementos flex — útil para adaptar un layout sin reescribir la estructura del documento." },
    { "etiqueta": "Quien alinea un solo elemento distinto", "rol": "Que uno se salga de la alineación general del grupo", "descripcion": "align-self anula, solo para ese elemento, lo que align-items definió para todo el contenedor." }
  ]
}
```

## flex-grow: repartir el espacio sobrante

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; width: 300px; padding: 8px; gap: 6px; }\n  .item { background: #7c3aed; color: white; padding: 8px; flex-grow: 0; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; width: 300px; padding: 8px; gap: 6px; }\n  .item { background: #7c3aed; color: white; padding: 8px; flex-grow: 1; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "nota": "Antes (flex-grow: 0, el valor por defecto): cada elemento mide solo lo que ocupa su propio texto, dejando espacio vacío en el contenedor de 300px. Después (flex-grow: 1): los dos elementos crecen para repartirse TODO el espacio sobrante entre ellos, llenando el contenedor por completo."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; width: 300px; padding: 8px; gap: 6px; }\n  .item { background: #7c3aed; color: white; padding: 8px; flex-grow: 1; flex-basis: 0; text-align: center; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; width: 300px; padding: 8px; gap: 6px; }\n  .item { background: #7c3aed; color: white; padding: 8px; flex-grow: 1; flex-basis: 0; text-align: center; }\n  .item:nth-child(3) { flex-grow: 2; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "nota": "Antes: los tres con flex-grow: 1 se reparten el espacio en partes exactamente iguales. Después: el tercero pasa a flex-grow: 2 — el reparto ahora es 1:1:2 (cuatro partes en total), así que el tercero mide el DOBLE que cualquiera de los otros dos, no solo \"un poco más\"."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .contenedor { display: flex; width: 400px; }\n  .item { flex-grow: 1; flex-basis: 0; }\n  .c { flex-grow: 2; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">A</div>\n  <div class=\"item\">B</div>\n  <div class=\"item c\">C</div>\n</div>",
  "opciones": [
    "Los tres miden lo mismo, 400px ÷ 3 cada uno",
    "C mide el doble que A y B: el espacio se reparte en proporción 1:1:2, así que C se lleva la mitad del ancho total",
    "Solo C recibe espacio extra, A y B se quedan en 0px"
  ],
  "correcta": 1,
  "explicacion": "Con flex-basis: 0 en los tres, todo el ancho de 400px es \"espacio sobrante\" a repartir. La proporción 1:1:2 (4 partes en total) da a C 2/4 = 200px, y a A y B 1/4 = 100px cada uno — C mide el doble que cualquiera de los otros dos."
}
```

## flex-shrink: quién cede cuando falta espacio

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; width: 200px; padding: 8px; }\n  .item { color: white; padding: 8px; box-sizing: border-box; flex-basis: 150px; flex-shrink: 1; }\n  .item:nth-child(1) { background: #7c3aed; }\n  .item:nth-child(2) { background: #16a34a; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; width: 200px; padding: 8px; }\n  .item { color: white; padding: 8px; box-sizing: border-box; flex-basis: 150px; flex-shrink: 1; }\n  .item:nth-child(1) { background: #7c3aed; flex-shrink: 0; }\n  .item:nth-child(2) { background: #16a34a; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "nota": "Los dos elementos parten de flex-basis: 150px (300px en total, más de lo que caben en el contenedor de 200px). Antes: con flex-shrink: 1 en ambos (el valor por defecto), los dos ceden espacio casi por igual. Después: el morado pasa a flex-shrink: 0 — se niega a encogerse y se queda en sus 150px completos, así que el verde tiene que ceder TODO el espacio que falta él solo, quedando mucho más estrecho."
}
```

## flex-basis: el punto de partida, antes de crecer o encogerse

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; padding: 8px;\">\n  <div style=\"background: #7c3aed; color: white; padding: 8px; width: 200px; box-sizing: border-box;\">Caja con width: 200px</div>\n</div>",
  "despues": "<div style=\"display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; padding: 8px;\">\n  <div style=\"background: #7c3aed; color: white; padding: 8px; width: 200px; flex-basis: 80px; box-sizing: border-box;\">Caja con width: 200px</div>\n</div>",
  "nota": "El mismo width: 200px en los dos casos. Antes: sin flex-basis declarado (su valor por defecto es auto), el navegador usa el width tal cual — la caja mide 200px. Después: con flex-basis: 80px añadido, ESE valor gana sobre width en un contenedor flex row — la caja mide 80px, ignorando por completo los 200px del width."
}
```

## order: reordenar sin tocar el HTML

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; font-family: sans-serif; gap: 6px; }\n  .item { background: #7c3aed; color: white; padding: 12px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Primero en el HTML</div>\n  <div class=\"item\">Segundo en el HTML</div>\n  <div class=\"item\">Tercero en el HTML</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; font-family: sans-serif; gap: 6px; }\n  .item { background: #7c3aed; color: white; padding: 12px; }\n  .item:nth-child(1) { order: 1; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Primero en el HTML</div>\n  <div class=\"item\">Segundo en el HTML</div>\n  <div class=\"item\">Tercero en el HTML</div>\n</div>",
  "nota": "Los tres <div> siguen en el mismo orden EXACTO dentro del HTML en los dos casos. Antes: se muestran en ese mismo orden (1, 2, 3), porque todos comparten el order: 0 por defecto. Después: el primero pasa a order: 1, mayor que el 0 de los otros dos — visualmente pasa al final (2, 3, 1), sin haber movido una sola línea de HTML."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "order cambia lo visual, no la navegación por teclado",
  "contenido": "Aunque order reordene visualmente los elementos, la tecla Tab sigue recorriéndolos en el orden del HTML, no en el visual. Reordenar botones importantes con order puede dejar una experiencia confusa para quien navega sin ratón — el foco puede saltar a un sitio inesperado de la pantalla."
}
```

## align-self: anular la alineación de uno solo

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; align-items: center; border: 1px dashed #9ca3af; font-family: sans-serif; height: 100px; padding: 8px; gap: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; align-items: center; border: 1px dashed #9ca3af; font-family: sans-serif; height: 100px; padding: 8px; gap: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n  .item:nth-child(1) { align-self: flex-end; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "nota": "align-items: center centra a los dos elementos en el contenedor de 100px de alto, en los dos casos. Después, el primero recibe align-self: flex-end — solo ÉSE se mueve a la parte inferior, ignorando el align-items del contenedor; \"Dos\" se queda centrado como antes."
}
```

## Lo que las propiedades de los elementos flex NO hacen

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "flex-grow: 2 hace que un elemento mida el doble de ancho que uno con flex-grow: 1",
      "realidad": "Reparte el ESPACIO SOBRANTE en esa proporción, no el ancho total — el resultado exacto depende también del contenido y del flex-basis de cada elemento."
    },
    {
      "mito": "order también cambia el orden en el que un lector de pantalla o el tabulador de teclado recorre los elementos",
      "realidad": "Solo cambia el orden VISUAL — la navegación por teclado sigue el orden del HTML, lo que puede confundir a quien navega sin ratón."
    },
    {
      "mito": "flex-basis y width hacen exactamente lo mismo",
      "realidad": "En un contenedor row, flex-basis gana sobre width si los dos están declarados — width solo se usa si flex-basis es auto o no está declarado."
    },
    {
      "mito": "align-self solo puede usarse si el contenedor ya declaró align-items",
      "realidad": "Funciona igual sin align-items explícito, sobrescribiendo el valor por defecto (normal/stretch) para ese elemento en concreto."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Esperar que flex-grow reparta el ancho TOTAL, no el sobrante.", "texto": "El reparto ocurre solo sobre el espacio que queda después de que cada elemento tome su tamaño natural o su flex-basis." },
    { "titulo": "Usar order sin pensar en el orden de tabulación por teclado.", "texto": "Deja una experiencia confusa para quien navega sin ratón — el foco no sigue el orden visual." },
    { "titulo": "Declarar width y flex-basis a la vez esperando que gane width.", "texto": "En un contenedor row, gana flex-basis si está declarado con un valor distinto de auto." },
    { "titulo": "Olvidar que flex-shrink por defecto es 1, no 0.", "texto": "Un elemento puede encogerse sin querer si no se fija flex-shrink: 0 explícitamente." }
  ]
}
```

## Ejercicios

1. Escribe una regla `flex: 1;` en tres elementos hijos para que se repartan el espacio disponible en partes iguales.
2. Dado un contenedor de 300px con tres elementos con `flex-grow: 1` cada uno y `flex-basis: 0`, calcula cuánto mide cada uno.
3. Escribe una regla que haga que el segundo elemento de una fila flex aparezca visualmente primero, sin cambiar el HTML.
4. Explica por qué cambiar el orden visual de unos botones con `order` puede ser un problema de accesibilidad, aunque se vea bien.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Flexbox",
      "descripcion": "Guía de MDN sobre las propiedades de los elementos flex: flex-grow, flex-shrink, flex-basis, el shorthand flex, order y align-self.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Flexbox",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre flexbox, con el gotcha del tamaño mínimo por defecto al encoger elementos.",
      "url": "https://web.dev/learn/css/flexbox",
      "etiqueta": "web.dev"
    }
  ]
}
```
