# Container queries

- **Módulo:** Diseño responsive
- **Slug:** `container-queries` (autogenerado del título)
- **Orden:** 205
- **Fuentes:** [CSS container queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) + [Container queries (web.dev)](https://web.dev/learn/css/container-queries) — ver `contenido/css/TEMARIO.md` #42

---

## Qué es y para qué sirve

Una media query responde al viewport completo — nunca sabe si el componente que está estilando vive en una barra lateral estrecha o en el área principal, ancha, de la misma página. Una container query responde al tamaño de su propio **contenedor**: el mismo componente puede verse distinto en cada sitio donde se use, sin depender del ancho de la ventana. Es la pieza que faltaba para un diseño verdaderamente basado en componentes.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién necesita que un componente reaccione a su contenedor",
  "roles": [
    { "etiqueta": "Quien crea componentes reutilizables", "rol": "Que se adapten a cada sitio donde se coloquen", "descripcion": "La misma tarjeta puede verse distinta en una barra lateral estrecha y en el área principal ancha, sin escribir dos versiones." },
    { "etiqueta": "Quien diseña un sistema de diseño", "rol": "Desacoplar el componente del layout que lo rodea", "descripcion": "Container queries permiten que un componente decida su propio estilo según su espacio real, no según el ancho total de la página." }
  ]
}
```

## El problema que resuelven: independencia del viewport

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El mismo componente, contextos distintos",
  "contenido": "Una tarjeta de producto puede vivir en una cuadrícula de tres columnas o en una barra lateral estrecha, en la MISMA página, al MISMO ancho de viewport. Una media query no puede distinguir esos dos casos — ve el mismo ancho de pantalla en ambos. Una container query sí: consulta el ancho real del contenedor de la tarjeta, sea cual sea el sitio donde esta viva."
}
```

## Declarar un contenedor: container-type y container-name

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .tarjeta-contenedora {\n    container-type: inline-size;\n    container-name: tarjeta;\n  }\n\n  /* Forma abreviada, nombre primero, tipo después de la barra */\n  .tarjeta-contenedora {\n    container: tarjeta / inline-size;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "container-type: inline-size;", "nota": "Convierte al elemento en un contenedor de consultas por su eje EN LÍNEA (el ancho, en la escritura horizontal habitual). Es obligatorio: sin container-type, ningún @container que lo referencie tiene efecto." },
    { "fragmento": "container-name: tarjeta;", "nota": "Un nombre opcional para referenciar este contenedor concreto — útil cuando hay varios contenedores anidados y hace falta apuntar a uno en particular, no al más cercano." },
    { "fragmento": "container: tarjeta / inline-size;", "nota": "La forma abreviada de las dos propiedades anteriores: el nombre va ANTES de la barra, el tipo DESPUÉS." }
  ]
}
```

## @container: la condición

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  @container (width > 400px) {\n    .tarjeta h2 {\n      font-size: 2em;\n    }\n  }\n\n  @container tarjeta (inline-size > 30em) {\n    .tarjeta {\n      display: flex;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@container (width > 400px) {", "nota": "Sin nombre, aplica según el CONTENEDOR MÁS CERCANO con container-type declarado — igual que una media query, pero midiendo un contenedor en vez del viewport." },
    { "fragmento": "@container tarjeta (inline-size > 30em) {", "nota": "Con el nombre delante, apunta específicamente a ESE contenedor, aunque no sea el más cercano — útil cuando hay contenedores anidados." }
  ]
}
```

## Verlo en vivo: la misma tarjeta, dos contenedores

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"container-type: inline-size; width: 180px; font-family: sans-serif;\">\n  <style>\n    .tarjeta { display: flex; flex-direction: column; gap: 4px; padding: 8px; border: 2px solid #7c3aed; border-radius: 6px; }\n    .tarjeta h3 { margin: 0; font-size: 0.9em; }\n    .tarjeta p { margin: 0; font-size: 0.75em; color: #6b7280; }\n    @container (width > 250px) {\n      .tarjeta { flex-direction: row; align-items: center; gap: 12px; padding: 16px; }\n      .tarjeta h3 { font-size: 1.3em; }\n    }\n  </style>\n  <div class=\"tarjeta\">\n    <h3>Título</h3>\n    <p>Una breve descripción de la tarjeta.</p>\n  </div>\n</div>",
  "despues": "<div style=\"container-type: inline-size; width: 400px; font-family: sans-serif;\">\n  <style>\n    .tarjeta { display: flex; flex-direction: column; gap: 4px; padding: 8px; border: 2px solid #7c3aed; border-radius: 6px; }\n    .tarjeta h3 { margin: 0; font-size: 0.9em; }\n    .tarjeta p { margin: 0; font-size: 0.75em; color: #6b7280; }\n    @container (width > 250px) {\n      .tarjeta { flex-direction: row; align-items: center; gap: 12px; padding: 16px; }\n      .tarjeta h3 { font-size: 1.3em; }\n    }\n  </style>\n  <div class=\"tarjeta\">\n    <h3>Título</h3>\n    <p>Una breve descripción de la tarjeta.</p>\n  </div>\n</div>",
  "nota": "El contenedor mide 180px en 'antes' y 400px en 'después' — exactamente la misma regla @container (width > 250px), sin cambiar ni una línea. En 'antes' no se cumple la condición (180px < 250px): la tarjeta se ve en columna. En 'después' sí se cumple (400px > 250px): pasa a fila, con más espacio y el título más grande. El mismo componente reacciona solo al tamaño de SU contenedor — no al del viewport, que en este caso ni siquiera cambia."
}
```

## Named containers: apuntar a uno concreto

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .sidebar {\n    container-name: barra-lateral;\n    container-type: inline-size;\n  }\n\n  @container barra-lateral (inline-size > 20em) {\n    .grupo-botones {\n      display: flex;\n    }\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "@container barra-lateral (inline-size > 20em) {", "nota": "El contenedor nombrado debe seguir siendo un ANCESTRO real del elemento estilado — el nombre solo elige a cuál de varios contenedores posibles apuntar, no cambia esa relación." }
  ]
}
```

## container-type: size, y su coste

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "size aplica containment también en el eje de bloque",
  "contenido": "container-type: size consulta ancho Y alto, pero también aplica containment de tamaño en AMBOS ejes — el elemento deja de calcular su altura a partir de sus hijos. Sin una altura explícita (block-size, aspect-ratio, o un layout que ya le dé una), el contenedor colapsa a 0 de alto. inline-size es la opción segura en la mayoría de casos; size solo cuando de verdad hace falta consultar la altura, y con una altura fijada a mano."
}
```

## Unidades relativas al contenedor: cqi, cqw, cqh...

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<style>\n  .boton {\n    padding: 2cqi 5cqi;\n  }\n</style>",
  "anotaciones": [
    { "fragmento": "padding: 2cqi 5cqi;", "nota": "cqi es el 1% del tamaño en línea (ancho) del contenedor de consultas más cercano — NO del viewport. El mismo botón recibe distinto padding según en qué contenedor viva, sin escribir ninguna condición explícita." }
  ]
}
```

## Verlo en vivo: el mismo padding, dos anchos de contenedor

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<div style=\"container-type: inline-size; width: 150px; font-family: sans-serif;\">\n  <style>\n    button { padding: 2cqi 5cqi; font-size: 1em; border-radius: 4px; border: none; background: #16a34a; color: white; }\n  </style>\n  <button>Botón</button>\n</div>",
  "despues": "<div style=\"container-type: inline-size; width: 400px; font-family: sans-serif;\">\n  <style>\n    button { padding: 2cqi 5cqi; font-size: 1em; border-radius: 4px; border: none; background: #16a34a; color: white; }\n  </style>\n  <button>Botón</button>\n</div>",
  "nota": "El mismo botón, con exactamente el mismo CSS (padding: 2cqi 5cqi), dentro de dos contenedores de distinto ancho: 150px en 'antes', 400px en 'después'. Al ser relativo al contenedor, el padding crece junto con él — sin ninguna regla @container, solo por cómo se calculan las unidades cq*."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<style>\n  .tarjeta {\n    container-name: mi-tarjeta;\n  }\n  @container mi-tarjeta (width > 400px) {\n    h2 { color: teal; }\n  }\n</style>\n<div class=\"tarjeta\"><h2>Título</h2></div>",
  "opciones": [
    "El h2 se pinta de teal si el contenedor mide más de 400px, como es normal",
    "El h2 nunca se pinta de teal — falta container-type en .tarjeta; container-name por sí solo no activa ningún containment",
    "Es un error de sintaxis: container-name no puede usarse junto con @container"
  ],
  "correcta": 1,
  "explicacion": "container-name por sí solo NO crea un contexto de contención — hace falta TAMBIÉN container-type (inline-size o size) en el mismo elemento. Sin container-type, el @container nunca encuentra un contenedor real al que aplicarse, sin importar el nombre."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "inline-size no puede consultar aspect-ratio",
  "contenido": "Con container-type: inline-size, el navegador solo mide el eje en línea — no conoce la altura, así que una condición como aspect-ratio en @container no tiene información suficiente para evaluarse. Para consultar aspect-ratio hace falta container-type: size, con su coste de containment en ambos ejes."
}
```

## Lo que las container queries NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las container queries reemplazan a las media queries",
      "realidad": "Resuelven problemas distintos y complementarios — media queries responden al viewport, container queries al tamaño de un contenedor concreto. Conviven, no se sustituyen."
    },
    {
      "mito": "container-name por sí solo ya activa las container queries",
      "realidad": "Hace falta también container-type — container-name solo asigna un nombre, no crea containment."
    },
    {
      "mito": "container-type: size siempre es la opción segura, funciona en cualquier caso",
      "realidad": "Aplica containment completo (línea y bloque), lo que puede colapsar el elemento sin una altura explícita — inline-size es la opción segura en la mayoría de los casos."
    },
    {
      "mito": "Las unidades cqi/cqw son solo otro nombre para vw/vh",
      "realidad": "Son relativas al contenedor de consultas más cercano, no al viewport — el mismo valor produce resultados distintos según en qué contenedor viva el elemento."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Olvidar container-type y esperar que container-name baste.", "texto": "Sin container-type, el @container correspondiente nunca tiene efecto." },
    { "titulo": "Usar container-type: size sin dar una altura explícita.", "texto": "El contenedor colapsa a 0 de alto al no poder calcularla a partir de sus hijos." },
    { "titulo": "Confundir cqi/cqw con vw/vh del viewport.", "texto": "Son relativas al contenedor más cercano con containment, no a la ventana completa." },
    { "titulo": "Intentar consultar aspect-ratio con container-type: inline-size.", "texto": "Ese tipo no incluye el eje de bloque — hace falta container-type: size." }
  ]
}
```

## Ejercicios

1. Escribe las reglas necesarias para convertir un elemento en un contenedor de consultas por ancho, con el nombre `tarjeta`.
2. Escribe una regla `@container` que aplique estilos cuando ese contenedor mida más de `30em`.
3. Explica por qué `container-name: tarjeta;`, por sí solo, no activa ninguna consulta.
4. Escribe un botón cuyo `padding` use unidades `cqi` en vez de un valor fijo, y explica qué cambia frente a usar `rem`.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Convierte este contenedor en un contenedor de consultas por ancho llamado tarjeta (ejercicio 1). Escribe un @container que aplique estilos cuando mida más de 30em (ejercicio 2).",
  "html": "<div class=\"contenedor-tarjeta\">\n  <div class=\"tarjeta\">Contenido de la tarjeta</div>\n</div>",
  "css": ".contenedor-tarjeta {\n  /* container-type: inline-size;\n  container-name: tarjeta; */\n  resize: horizontal;\n  overflow: auto;\n  border: 1px dashed #999;\n  width: 200px;\n}\n.tarjeta { background: #eee; padding: 12px; }\n/* @container tarjeta (width > 30em) { .tarjeta { background: lightgreen; } } */",
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
      "titulo": "CSS container queries",
      "descripcion": "Referencia de MDN sobre container-type, container-name, @container, unidades cq* y las condiciones de containment.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Container queries",
      "descripcion": "Capítulo del curso Learn CSS de web.dev sobre el problema que resuelven las container queries, contenedores con nombre y unidades relativas al contenedor.",
      "url": "https://web.dev/learn/css/container-queries",
      "etiqueta": "web.dev"
    }
  ]
}
```
