# Flexbox: el contenedor y sus ejes

- **Módulo:** Layout
- **Slug:** `flexbox-el-contenedor-y-sus-ejes` (autogenerado del título)
- **Orden:** 160
- **Fuentes:** [Flexbox (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) + [Flexbox (web.dev)](https://web.dev/learn/css/flexbox) — ver `contenido/css/TEMARIO.md` #33

---

## Qué es y para qué sirve

`display: flex` convierte un contenedor y todos sus hijos directos en un sistema de layout completo — con una sola línea, columnas de igual altura, espaciado uniforme y centrado vertical dejan de ser un problema. Todo gira en torno a DOS ejes: el eje principal (la dirección en la que fluyen los elementos) y el eje cruzado (perpendicular a él) — y cuál es cuál depende de `flex-direction`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién resuelve un layout con flexbox en una línea",
  "roles": [
    { "etiqueta": "Quien necesita columnas de igual altura", "rol": "Que ningún elemento quede más bajo que los demás", "descripcion": "display: flex, sin ninguna otra regla, iguala la altura de todos los hijos directos al más alto — un problema clásico resuelto de golpe." },
    { "etiqueta": "Quien construye una barra de botones", "rol": "Repartir y centrar sin márgenes a mano", "descripcion": "justify-content y align-items reparten y centran los elementos a lo largo de cada eje, sin necesitar un solo margin calculado." },
    { "etiqueta": "Quien convierte una fila en columna", "rol": "Cambiar la dirección del layout con una sola propiedad", "descripcion": "flex-direction: column redefine cuál es el eje principal — y justify-content y align-items cambian de sentido automáticamente con él." }
  ]
}
```

## display: flex y los dos ejes

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  section {\n    display: flex;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "display: flex;", "nota": "Convierte a section en un contenedor flex, y a cada uno de sus hijos DIRECTOS en un elemento flex. El eje PRINCIPAL es la dirección en la que fluyen (horizontal por defecto); el eje CRUZADO es perpendicular a él (vertical por defecto)." }
  ]
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { border: 2px dashed #9ca3af; font-family: sans-serif; }\n  article { background: #ede9fe; border: 1px solid #7c3aed; padding: 8px; margin-bottom: 4px; }\n</style>\n<div class=\"contenedor\">\n  <article>Primero</article>\n  <article>Segundo, con bastante más texto para que sea más alto que los demás</article>\n  <article>Tercero</article>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; border: 2px dashed #9ca3af; font-family: sans-serif; gap: 4px; }\n  article { background: #ede9fe; border: 1px solid #7c3aed; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <article>Primero</article>\n  <article>Segundo, con bastante más texto para que sea más alto que los demás</article>\n  <article>Tercero</article>\n</div>",
  "nota": "Los mismos tres artículos, con textos de distinta longitud. Antes: se apilan como bloques normales, cada uno con su propia altura. Después, con un solo display: flex en el contenedor: se colocan en fila, y los TRES igualan su altura a la del más alto — sin haber fijado ninguna altura a mano."
}
```

## flex-direction: qué eje es el principal

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; gap: 6px; padding: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; flex-direction: column; border: 1px dashed #9ca3af; font-family: sans-serif; gap: 6px; padding: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "nota": "Antes (row, el valor por defecto): los tres números se colocan en fila, el eje principal es horizontal. Después (flex-direction: column): se apilan en columna — el eje principal pasó a ser vertical. Nada más cambió: los mismos tres divs, el mismo gap."
}
```

## flex-wrap: una sola línea, o varias

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; width: 200px; border: 1px dashed #9ca3af; font-family: sans-serif; gap: 6px; padding: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; min-width: 80px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n  <div class=\"item\">Tres</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; flex-wrap: wrap; width: 200px; border: 1px dashed #9ca3af; font-family: sans-serif; gap: 6px; padding: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; min-width: 80px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n  <div class=\"item\">Tres</div>\n</div>",
  "nota": "Tres elementos con min-width: 80px cada uno, en un contenedor de solo 200px. Antes (nowrap, el valor por defecto): los tres se fuerzan a caber en una sola línea, desbordando visiblemente el contenedor punteado. Después (flex-wrap: wrap): los elementos que no caben pasan a una nueva línea, sin desbordar nada."
}
```

## justify-content: alinear a lo largo del eje principal

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; justify-content: flex-start; border: 1px dashed #9ca3af; font-family: sans-serif; height: 60px; padding: 8px; align-items: flex-start; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n  <div class=\"item\">Tres</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; justify-content: space-between; border: 1px dashed #9ca3af; font-family: sans-serif; height: 60px; padding: 8px; align-items: flex-start; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n  <div class=\"item\">Tres</div>\n</div>",
  "nota": "Antes (flex-start, el valor por defecto): los tres elementos se agrupan al inicio del eje principal, pegados entre sí. Después (space-between): el espacio sobrante se reparte ENTRE los elementos — el primero pegado al inicio, el último pegado al final, sin espacio extra en los bordes."
}
```

## align-items: alinear a lo largo del eje cruzado

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: flex; border: 1px dashed #9ca3af; font-family: sans-serif; height: 100px; padding: 8px; gap: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: flex; align-items: center; border: 1px dashed #9ca3af; font-family: sans-serif; height: 100px; padding: 8px; gap: 8px; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "nota": "Contenedor de 100px de alto en los dos casos. Antes (stretch, el valor por defecto): cada elemento se estira para llenar toda la altura disponible. Después (align-items: center): cada elemento conserva su altura natural, mucho más pequeña, centrada verticalmente dentro del contenedor — con espacio visible arriba y abajo."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .contenedor {\n    display: flex;\n    flex-direction: column;\n    justify-content: center;\n    height: 200px;\n  }\n</style>\n<div class=\"contenedor\">\n  <div>Uno</div>\n  <div>Dos</div>\n</div>",
  "opciones": [
    "justify-content: center centra los elementos HORIZONTALMENTE, sin importar flex-direction",
    "justify-content: center centra los elementos VERTICALMENTE, porque flex-direction: column convirtió el eje vertical en el eje principal",
    "justify-content no tiene ningún efecto cuando flex-direction es column"
  ],
  "correcta": 1,
  "explicacion": "justify-content siempre alinea a lo largo del eje PRINCIPAL, no de un lado fijo de la pantalla. Con flex-direction: column, el eje principal pasa a ser vertical — así que justify-content: center centra los elementos verticalmente, no horizontalmente."
}
```

## align-content y gap: multilínea y espaciado

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .contenedor {\n    display: flex;\n    flex-wrap: wrap;\n    align-content: space-around;\n    gap: 10px 15px;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "align-content: space-around;", "nota": "Distribuye las LÍNEAS completas (no los elementos individuales) a lo largo del eje cruzado — solo tiene efecto con flex-wrap: wrap y más de una línea de elementos." },
    { "fragmento": "gap: 10px 15px;", "nota": "Primer valor: espacio entre filas (row-gap). Segundo valor: espacio entre columnas (column-gap). Más limpio que añadir margin a cada elemento, y sin el riesgo de un margen doble en los bordes." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "start y end, no izquierda y derecha",
  "contenido": "flex-start y flex-end no son sinónimos fijos de izquierda y derecha — son relativos al eje y a la dirección de escritura del documento. En un idioma que se lee de derecha a izquierda, o con flex-direction: row-reverse, apuntan al lado contrario. Pensar en términos de \"inicio\" y \"final\" en vez de lados fijos evita sorpresas."
}
```

## Lo que flexbox NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "justify-content siempre alinea horizontalmente y align-items siempre verticalmente",
      "realidad": "Dependen del eje principal, que cambia con flex-direction — en column, justify-content pasa a alinear verticalmente, y align-items, horizontalmente."
    },
    {
      "mito": "flex-wrap: wrap es el comportamiento por defecto de un contenedor flex",
      "realidad": "El valor por defecto es nowrap — los elementos se quedan en una sola línea, encogiéndose o desbordando el contenedor, salvo que se declare wrap explícitamente."
    },
    {
      "mito": "align-items solo importa si los elementos tienen distinta altura",
      "realidad": "El valor por defecto, stretch, hace que TODOS los elementos igualen su altura a la del contenedor, aunque no se note si ya medían lo mismo por casualidad."
    },
    {
      "mito": "flex-start y flex-end siempre significan izquierda y derecha",
      "realidad": "Son relativos al eje y a la dirección de escritura — en un idioma rtl o con row-reverse, apuntan al lado contrario."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar que el eje principal cambia con flex-direction.", "texto": "Esperar que justify-content siga alineando horizontalmente en column lleva a resultados inesperados." },
    { "titulo": "No declarar flex-wrap: wrap en un contenedor con muchos elementos.", "texto": "Se encogen o se desbordan en pantallas estrechas, en vez de pasar a una nueva línea." },
    { "titulo": "Confundir justify-content (eje principal) con align-items (eje cruzado).", "texto": "Intentar centrar algo con la propiedad equivocada según la dirección del contenedor." },
    { "titulo": "Añadir margin a mano en vez de usar gap.", "texto": "Arriesga un espaciado inconsistente o un margen doble en los extremos del contenedor." }
  ]
}
```

## Ejercicios

1. Escribe una regla que convierta un contenedor en un flex container con sus elementos en columna en vez de en fila.
2. Escribe una regla que reparta uniformemente el espacio sobrante entre elementos flex a lo largo del eje principal, sin dejar espacio en los extremos.
3. Escribe una regla que centre elementos flex tanto en el eje principal como en el cruzado, en un contenedor con flex-direction: row.
4. Explica por qué, con flex-direction: column, align-items pasa a controlar la alineación horizontal en vez de la vertical.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Flexbox",
      "descripcion": "Guía de MDN sobre las propiedades del contenedor flex: display, flex-direction, flex-wrap, justify-content, align-items, align-content y gap.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Flexbox",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con la terminología start/end sensible a la dirección de escritura y el gotcha del tamaño mínimo por defecto.",
      "url": "https://web.dev/learn/css/flexbox",
      "etiqueta": "web.dev"
    }
  ]
}
```
