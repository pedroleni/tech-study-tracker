# Tablas: filas, celdas, cabeceras y cómo no romperlas

- **Módulo:** Tablas
- **Slug:** `tablas-filas-celdas-cabeceras-y-como-no-romperlas` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [HTML table basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics) + [Tables (web.dev)](https://web.dev/learn/html/tables) — ver `contenido/html/TEMARIO.md` #15

---

## Qué es y para qué sirve

Una tabla HTML es para datos que se leen de verdad en dos direcciones a la vez — filas Y columnas con sentido cruzado, como un horario o una comparativa de precios. `<table>` la envuelve, `<tr>` (*table row*) agrupa cada fila, y `<td>` (*table data*) crea cada celda de datos. Durante años se usaron también para maquetar páginas enteras — una práctica hoy abandonada del todo, y que esta lección explica por qué.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién depende de una tabla bien estructurada",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Anunciar filas y columnas con sentido", "descripcion": "Con th y scope bien usados, puede decir \"fila Rex, columna Edad: 4\" en vez de leer números sueltos sin ningún contexto." },
    { "etiqueta": "Quien escanea la tabla visualmente", "rol": "Distinguir cabecera de dato de un vistazo", "descripcion": "th se ve en negrita y centrado por defecto, sin escribir una línea de CSS — una señal visual gratuita de qué fila o columna estás mirando." },
    { "etiqueta": "Quien navega en móvil", "rol": "Sufrir si la tabla no es realmente tabular", "descripcion": "Una tabla usada para maquetar (en vez de para datos) no se adapta a pantallas pequeñas — se dimensiona según su contenido, no según el ancho disponible." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando los datos tienen sentido leídos en dos direcciones",
  "contenido": "Un horario semanal, una comparativa de planes de precio, los datos de varios perros (raza, edad, dueño) — cualquier cosa que cruces mentalmente por fila Y por columna."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando cada columna representa el mismo tipo de dato",
  "contenido": "Si la columna \"Edad\" siempre contiene una edad y la columna \"Raza\" siempre una raza, es una señal clara de que es tabular de verdad, no solo texto organizado en columnas."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Nunca para maquetar la estructura visual de una página",
  "contenido": "Una fila para la cabecera, una fila por columna de contenido, una fila para el pie — fue una práctica común en los 2000, hoy es un desastre de accesibilidad y nada responsive. Para maquetar están flexbox y grid en CSS."
}
```

## Cómo se usa: table, tr y td

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<table>\n  <tr>\n    <td>Rex</td>\n    <td>Jack Russell</td>\n    <td>4</td>\n  </tr>\n  <tr>\n    <td>Luna</td>\n    <td>Caniche</td>\n    <td>9</td>\n  </tr>\n</table>",
  "anotaciones": [
    { "fragmento": "<table>", "nota": "Envuelve toda la tabla — ningún otro contenido puede ir suelto directamente dentro, solo sus propios elementos hijos." },
    { "fragmento": "<tr>\n    <td>Rex</td>\n    <td>Jack Russell</td>\n    <td>4</td>\n  </tr>", "nota": "Cada tr es una fila completa. Cuántos td lleve dentro define cuántas columnas tiene esa fila." },
    { "fragmento": "<td>Rex</td>", "nota": "Cada td es una celda de datos individual — el contenido puede ser texto, un número, incluso otro elemento HTML." }
  ]
}
```

## th: por qué unas celdas son distintas

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<table>\n  <tr><td>Perro</td><td>Edad</td></tr>\n  <tr><td>Rex</td><td>4</td></tr>\n</table>",
  "despues": "<table>\n  <tr><th>Perro</th><th>Edad</th></tr>\n  <tr><td>Rex</td><td>4</td></tr>\n</table>",
  "nota": "Sin ningún CSS propio, th ya se muestra en negrita y centrado por defecto — una señal visual gratuita de que esa celda es una cabecera, no un dato más. Semánticamente también es distinto: un lector de pantalla puede anunciar a qué cabecera de fila o columna pertenece cada celda de datos."
}
```

## colspan y rowspan: fusionar celdas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<table>\n  <tr><th colspan=\"2\">Animales</th></tr>\n  <tr><td>Perro</td><td>Gato</td></tr>\n</table>\n\n<table>\n  <tr><th rowspan=\"2\">Caballo</th><td>Yegua</td></tr>\n  <tr><td>Semental</td></tr>\n</table>",
  "anotaciones": [
    { "fragmento": "colspan=\"2\"", "nota": "La celda ocupa el ancho de 2 columnas en vez de 1 — útil para una cabecera que agrupa varias columnas relacionadas." },
    { "fragmento": "rowspan=\"2\"", "nota": "La celda ocupa el alto de 2 filas en vez de 1 — útil para una cabecera compartida por varias filas relacionadas, como aquí \"Caballo\" cubriendo yegua y semental." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<table>\n  <tr><th colspan=\"2\">Animales</th></tr>\n  <tr><td>Perro</td><td>Gato</td></tr>\n</table>",
  "opciones": [
    "La cabecera ocupa el ancho de UNA sola columna, igual que las demás celdas",
    "La cabecera ocupa el ancho de las DOS columnas de la fila siguiente",
    "El navegador ignora colspan porque solo funciona en td, no en th"
  ],
  "correcta": 1,
  "explicacion": "colspan funciona igual en th que en td — le dice a la celda que ocupe el espacio de tantas columnas como indique el número. Aquí \"Animales\" se extiende sobre las dos columnas que \"Perro\" y \"Gato\" ocupan en la fila siguiente."
}
```

## La estructura completa: thead, tbody, tfoot y caption

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<table>\n  <caption>Mascotas registradas este mes</caption>\n  <thead>\n    <tr><th>Nombre</th><th>Edad</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Rex</td><td>4</td></tr>\n    <tr><td>Luna</td><td>9</td></tr>\n  </tbody>\n  <tfoot>\n    <tr><td>Total</td><td>2 mascotas</td></tr>\n  </tfoot>\n</table>",
  "anotaciones": [
    { "fragmento": "<caption>Mascotas registradas este mes</caption>", "nota": "El título de la tabla, asociado programáticamente a ella — debe ir como primer hijo directo de table, antes que cualquier fila." },
    { "fragmento": "<thead>\n    <tr><th>Nombre</th><th>Edad</th></tr>\n  </thead>", "nota": "Agrupa las filas de cabecera. Sin thead/tbody/tfoot, las filas sueltas se envuelven igualmente en un tbody implícito — pero escribirlos a mano deja la estructura explícita." },
    { "fragmento": "<tfoot>\n    <tr><td>Total</td><td>2 mascotas</td></tr>\n  </tfoot>", "nota": "Para totales o resúmenes al final — puede colocarse en el HTML después de tbody, pero muchos navegadores lo renderizan al final visualmente aunque esté escrito antes." }
  ]
}
```

## Lo que una tabla NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las tablas son una forma válida de maquetar una página",
      "realidad": "Fue una práctica común en los 2000, hoy es un desastre de accesibilidad (un lector de pantalla anuncia \"tabla\", \"fila\" sin ningún sentido) y nada responsive. Para maquetar existen flexbox y grid en CSS."
    },
    {
      "mito": "cellpadding y cellspacing son la forma normal de dar espacio a las celdas",
      "realidad": "Son atributos HTML heredados de los años 90, sustituidos hace tiempo por padding y border-spacing en CSS — siguen \"funcionando\", pero no deberían usarse en código nuevo."
    },
    {
      "mito": "Cambiar el display de una tabla con CSS no tiene ningún efecto secundario",
      "realidad": "En algunos navegadores puede romper los roles de accesibilidad implícitos de table/tr/td — si haces ese cambio, hace falta añadir a mano los role ARIA correspondientes."
    },
    {
      "mito": "Cualquier dato organizado en columnas necesita una tabla HTML",
      "realidad": "Si la relación entre los datos no es realmente tabular, a veces una lista o un conjunto de tarjetas comunica mejor — la tabla es para datos que de verdad se leen en dos direcciones."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Usar td para las cabeceras de fila o columna.", "texto": "Pierdes tanto el estilo en negrita/centrado por defecto como la asociación semántica que ayuda a un lector de pantalla a anunciar la cabecera de cada celda." },
    { "titulo": "Anidar una tabla dentro de una celda sin necesidad real.", "texto": "Complica muchísimo tanto el HTML como la experiencia de quien usa un lector de pantalla — casi siempre hay una forma más simple de estructurar los mismos datos." },
    { "titulo": "Usar cellpadding/cellspacing en vez de CSS.", "texto": "Son atributos obsoletos; padding y border-spacing en CSS hacen lo mismo con más control, sin mezclar presentación con estructura." },
    { "titulo": "Dar por hecho que una tabla se adapta sola a móvil.", "texto": "Las tablas no son responsive por defecto — se dimensionan según su contenido, no según el ancho de pantalla disponible." }
  ]
}
```

## Ejercicios

1. Escribe una tabla con 3 filas y 3 columnas de datos reales (por ejemplo, un horario semanal) usando th solo para las cabeceras.
2. Añade un colspan a una cabecera que agrupe dos columnas relacionadas, y un rowspan a una celda que abarque dos filas.
3. Reescribe una tabla mal hecha (con td para las cabeceras y cellpadding) usando th y CSS para el espaciado, sin ningún atributo obsoleto.
4. Piensa en un conjunto de datos que NO deberías representar como tabla — ¿qué estructura (lista, tarjetas) comunicaría mejor esa relación?

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe la tabla de 3x3 del ejercicio 1 usando th solo en las cabeceras. Después añade un colspan que agrupe dos columnas y un rowspan que abarque dos filas (ejercicio 2).",
  "html": "<!-- Empieza aquí -->",
  "css": "table { border-collapse: collapse; }\nth, td { border: 1px solid #999; padding: 6px 10px; }",
  "pestañaInicial": "html"
}
```

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "HTML table basics",
      "descripcion": "Guía de referencia de MDN sobre table, tr, td, th, colspan y rowspan, con el aviso explícito contra usar tablas para maquetar.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Tables",
      "descripcion": "Curso de web.dev sobre la estructura completa de una tabla (caption, colgroup, thead/tbody/tfoot) y el orden en que el navegador las dibuja.",
      "url": "https://web.dev/learn/html/tables",
      "etiqueta": "web.dev"
    }
  ]
}
```
