# CSS Grid: alineación y distribución

- **Módulo:** Layout
- **Slug:** `css-grid-alineacion-y-distribucion` (autogenerado del título)
- **Orden:** 175
- **Fuentes:** [CSS grid layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids) + [Grid (web.dev)](https://web.dev/learn/css/grid) — ver `contenido/css/TEMARIO.md` #36

---

## Qué es y para qué sirve

La lección anterior definió filas, columnas y áreas. Esta responde una pregunta distinta: dentro de esas celdas, ¿dónde vive cada elemento? `justify-items`/`align-items` alinean cada elemento DENTRO de su propia celda. `justify-content`/`align-content` mueven el conjunto ENTERO de columnas o filas cuando sobra espacio en el contenedor. `justify-self`/`align-self` anulan la alineación general para un elemento en concreto.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién distingue \"dentro de la celda\" de \"el conjunto de columnas\"",
  "roles": [
    { "etiqueta": "Quien centra contenido en cada celda", "rol": "Que un icono o texto no llene toda la celda", "descripcion": "justify-items y align-items centran cada elemento dentro de su propia celda, en vez de estirarlo para llenarla por completo." },
    { "etiqueta": "Quien reparte columnas de tamaño fijo", "rol": "Distribuir el espacio sobrante entre las columnas", "descripcion": "justify-content mueve el conjunto de columnas dentro de un contenedor más ancho que ellas — space-between, center, y más." },
    { "etiqueta": "Quien necesita un elemento distinto", "rol": "Que se salga del patrón general de alineación", "descripcion": "justify-self y align-self anulan, solo para un elemento, la alineación que el resto del grid comparte." }
  ]
}
```

## justify-items y align-items: dentro de cada celda

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 80px; gap: 6px; font-family: sans-serif; }\n  .item { background: #7c3aed; color: white; padding: 8px; box-sizing: border-box; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 80px; gap: 6px; font-family: sans-serif; justify-items: center; align-items: center; }\n  .item { background: #7c3aed; color: white; padding: 8px; box-sizing: border-box; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">Uno</div>\n  <div class=\"item\">Dos</div>\n</div>",
  "nota": "Celdas de 80px de alto en los dos casos. Antes (stretch, el valor por defecto): cada elemento llena su celda entera, en ancho y en alto. Después (justify-items: center; align-items: center;): cada elemento se encoge a su tamaño natural, centrado dentro de su propia celda — con espacio visible alrededor."
}
```

## justify-content y align-content: el conjunto de columnas

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"display: grid; grid-template-columns: 60px 60px 60px; gap: 6px; width: 300px; border: 1px dashed #9ca3af; padding: 8px; font-family: sans-serif; box-sizing: border-box;\">\n  <div style=\"background: #7c3aed; color: white; padding: 8px; text-align: center; box-sizing: border-box;\">1</div>\n  <div style=\"background: #7c3aed; color: white; padding: 8px; text-align: center; box-sizing: border-box;\">2</div>\n  <div style=\"background: #7c3aed; color: white; padding: 8px; text-align: center; box-sizing: border-box;\">3</div>\n</div>",
  "despues": "<div style=\"display: grid; grid-template-columns: 60px 60px 60px; justify-content: space-between; gap: 6px; width: 300px; border: 1px dashed #9ca3af; padding: 8px; font-family: sans-serif; box-sizing: border-box;\">\n  <div style=\"background: #7c3aed; color: white; padding: 8px; text-align: center; box-sizing: border-box;\">1</div>\n  <div style=\"background: #7c3aed; color: white; padding: 8px; text-align: center; box-sizing: border-box;\">2</div>\n  <div style=\"background: #7c3aed; color: white; padding: 8px; text-align: center; box-sizing: border-box;\">3</div>\n</div>",
  "nota": "Tres columnas fijas de 60px, en un contenedor de 300px — sobra espacio real. Antes: las tres columnas se agrupan al inicio (start, el valor por defecto), dejando todo el hueco sobrante a la derecha. Después (justify-content: space-between): el espacio sobrante se reparte ENTRE las columnas — la primera pegada al borde izquierdo, la última al derecho, la del medio repartida entre las dos."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .contenedor {\n    display: grid;\n    grid-template-columns: 50px 50px;\n    width: 300px;\n    justify-content: center;\n  }\n</style>\n<div class=\"contenedor\">\n  <div>A</div>\n  <div>B</div>\n</div>",
  "opciones": [
    "A y B se centran cada uno dentro de su propia celda de 50px, sin moverse del borde izquierdo del contenedor",
    "Las DOS columnas de 50px, como grupo, se centran juntas dentro del ancho de 300px del contenedor",
    "justify-content no tiene ningún efecto en un grid con columnas de tamaño fijo"
  ],
  "correcta": 1,
  "explicacion": "justify-content mueve el conjunto ENTERO de columnas, no cada elemento por separado. Las dos columnas de 50px (100px en total) se centran juntas dentro de los 300px del contenedor, dejando 100px de espacio vacío a cada lado del grupo."
}
```

## justify-self y align-self: anular la regla general

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 1fr 1fr; justify-items: center; gap: 6px; font-family: sans-serif; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "despues": "<style>\n  .contenedor { display: grid; grid-template-columns: 1fr 1fr 1fr; justify-items: center; gap: 6px; font-family: sans-serif; }\n  .item { background: #7c3aed; color: white; padding: 8px; }\n  .item:nth-child(2) { justify-self: stretch; }\n</style>\n<div class=\"contenedor\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
  "nota": "justify-items: center centra a los tres elementos en los dos casos. Después, el segundo recibe justify-self: stretch — solo ÉSE vuelve a llenar su celda por completo, ignorando el center del contenedor; el primero y el tercero se quedan centrados, sin cambios."
}
```

## Los shorthands: place-items y place-content

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .a {\n    place-items: center start;\n  }\n  .b {\n    place-content: space-between center;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": ".a {\n    place-items: center start;\n  }", "nota": "Combina align-items y justify-items en una sola línea — el primer valor es align-items (center), el segundo justify-items (start). Alinea DENTRO de cada celda." },
    { "fragmento": ".b {\n    place-content: space-between center;\n  }", "nota": "Combina align-content y justify-content — primero align-content (space-between), después justify-content (center). Distribuye el conjunto ENTERO de columnas o filas." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "justify-content no hace nada si no sobra espacio",
  "contenido": "justify-content y align-content solo tienen efecto cuando las columnas o filas, todas juntas, ocupan MENOS espacio que el contenedor. Con columnas en fr (que siempre se reparten el 100% del ancho disponible), no queda ningún espacio sobrante que repartir — y estas dos propiedades no cambian nada visible."
}
```

## Lo que la alineación en grid NO hace

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "justify-items y justify-content hacen lo mismo, solo cambia el nombre",
      "realidad": "justify-items alinea cada elemento DENTRO de su propia celda; justify-content mueve el conjunto ENTERO de columnas dentro del contenedor, cuando sobra espacio."
    },
    {
      "mito": "justify-content siempre tiene algún efecto visible",
      "realidad": "Si las columnas ya llenan el contenedor por completo (por ejemplo, con fr), no queda espacio sobrante que repartir, y justify-content no cambia nada."
    },
    {
      "mito": "justify-self solo funciona si el contenedor tiene justify-items declarado",
      "realidad": "Funciona igual sin justify-items explícito, sobrescribiendo el valor por defecto (stretch) para ese elemento en concreto."
    },
    {
      "mito": "place-items y place-content son la misma propiedad con dos nombres distintos",
      "realidad": "place-items combina align-items y justify-items (alineación dentro de la celda); place-content combina align-content y justify-content (distribución del conjunto de pistas) — cosas distintas."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Confundir justify-items (dentro de la celda) con justify-content (el conjunto de columnas).", "texto": "Usar la propiedad equivocada al intentar centrar algo en un grid lleva a un resultado inesperado." },
    { "titulo": "Esperar que justify-content haga algo visible sin espacio sobrante.", "texto": "Con columnas que ya llenan el contenedor, no hay nada que repartir." },
    { "titulo": "Olvidar que el valor por defecto de justify-items y align-items es stretch.", "texto": "Los elementos llenan su celda por completo salvo que se diga lo contrario explícitamente." },
    { "titulo": "No usar los shorthands place-items / place-content.", "texto": "Repetir dos declaraciones por separado cuando una sola línea bastaría." }
  ]
}
```

## Ejercicios

1. Escribe una regla que centre todos los elementos de un grid, tanto horizontal como verticalmente, dentro de sus propias celdas.
2. Escribe una regla que distribuya un conjunto de columnas de tamaño fijo con espacio igual entre ellas, en un contenedor más ancho que la suma de las columnas.
3. Escribe una regla que haga que un solo elemento de un grid, con `justify-items: center` en el contenedor, vuelva a estirarse para llenar su celda completa.
4. Explica por qué `justify-content` no tiene ningún efecto en un grid cuyas columnas están definidas en `fr` y llenan todo el contenedor.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "CSS grid layout",
      "descripcion": "Guía de MDN sobre los fundamentos de CSS Grid, base para entender sobre qué se aplican las propiedades de alineación.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Grid",
      "descripcion": "Capítulo del curso Learn CSS de web.dev, con el detalle completo de justify-items/content, align-items/content y los shorthands place-items/place-content.",
      "url": "https://web.dev/learn/css/grid",
      "etiqueta": "web.dev"
    }
  ]
}
```
