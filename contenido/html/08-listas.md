# Listas: ordenadas, desordenadas y de descripción

- **Módulo:** Texto y contenido
- **Slug:** `listas-ordenadas-desordenadas-y-de-descripcion` (autogenerado del título)
- **Orden:** 35
- **Fuentes:** [Lists (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists) + [Lists (web.dev)](https://web.dev/learn/html/lists) — ver `contenido/html/TEMARIO.md` #8

---

## Qué es y para qué sirve

HTML tiene tres tipos de lista, cada una para una relación distinta entre sus elementos: `<ul>` cuando el orden no importa (ingredientes, opciones), `<ol>` cuando sí importa (pasos de una receta, un ranking), y `<dl>` para pares de término y descripción (un glosario, unas preguntas frecuentes). Las tres comparten una regla: el contenedor (`<ul>`, `<ol>` o `<dl>`) solo puede llevar como hijos directos sus propios elementos de lista — `<li>` en las dos primeras, `<dt>`/`<dd>` en la tercera.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué gana quien usa una lista real",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Saber cuántos elementos hay", "descripcion": "Anuncia \"lista de 5 elementos\" al entrar, y permite saltar de uno a otro — algo que un párrafo con guiones sueltos no ofrece." },
    { "etiqueta": "Buscador", "rol": "Detectar pasos e ingredientes", "descripcion": "Reconoce una receta o un tutorial estructurado como lista, útil para resultados enriquecidos (rich snippets) de recetas paso a paso." },
    { "etiqueta": "Quien lee el código", "rol": "Ver la relación de un vistazo", "descripcion": "ul, ol o dl dicen inmediatamente qué tipo de relación hay entre los elementos, sin tener que leer el contenido para deducirlo." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cada vez que enumeras cosas, aunque sean solo dos",
  "contenido": "No hace falta una lista larga para justificar ul u ol — dos ingredientes ya son una lista real, no un par de frases sueltas."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando el orden cambia el resultado",
  "contenido": "Instrucciones de montaje, pasos de una receta, un ranking — si intercambiar dos elementos rompe el sentido, es ol, no ul."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando tienes pares de término y explicación",
  "contenido": "Un glosario, unas preguntas frecuentes, las especificaciones de un producto (\"Peso: 200g\", \"Color: azul\") — todo eso es exactamente lo que dl/dt/dd está pensado para representar."
}
```

## Cómo se usa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<ul>\n  <li>Leche</li>\n  <li>Huevos</li>\n  <li>Pan</li>\n</ul>\n\n<ol>\n  <li>Precalienta el horno a 180°</li>\n  <li>Mezcla los ingredientes secos</li>\n  <li>Añade los húmedos y remueve</li>\n</ol>",
  "anotaciones": [
    { "fragmento": "<ul>\n  <li>Leche</li>\n  <li>Huevos</li>\n  <li>Pan</li>\n</ul>", "nota": "Una lista de la compra: da igual el orden en que aparezcan, siguen significando lo mismo." },
    { "fragmento": "<ol>\n  <li>Precalienta el horno a 180°</li>\n  <li>Mezcla los ingredientes secos</li>\n  <li>Añade los húmedos y remueve</li>\n</ol>", "nota": "Pasos de una receta: intercambiar el orden cambia el resultado — por eso es ol, no ul." }
  ]
}
```

## Listas de descripción: term y definición

La menos conocida de las tres, y la más útil cuando lo que tienes son pares clave-valor:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<dl>\n  <dt>HTML</dt>\n  <dd>Define la estructura y el significado del contenido.</dd>\n\n  <dt>CSS</dt>\n  <dd>Decide cómo se ve ese contenido.</dd>\n\n  <dt>Sesión</dt>\n  <dd>El estado de un usuario mientras dura su visita.</dd>\n  <dd>En criptografía, un período de comunicación cifrada entre dos partes.</dd>\n</dl>",
  "anotaciones": [
    { "fragmento": "<dt>HTML</dt>\n  <dd>Define la estructura y el significado del contenido.</dd>", "nota": "Un término y su definición — el par mínimo. dt no lleva nunca contenido de bloque complejo, solo el término en sí." },
    { "fragmento": "<dt>Sesión</dt>\n  <dd>El estado de un usuario mientras dura su visita.</dd>\n  <dd>En criptografía, un período de comunicación cifrada entre dos partes.</dd>", "nota": "Un mismo término puede tener varias definiciones — dos dd seguidos, ambos asociados al mismo dt anterior. Útil para palabras con más de un significado según el contexto." }
  ]
}
```

También funciona al revés: varios `<dt>` seguidos pueden compartir una única definición, cuando dos términos significan exactamente lo mismo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<dl>\n  <dt>Frontend</dt>\n  <dt>Lado del cliente</dt>\n  <dd>La parte de una aplicación que se ejecuta en el navegador del usuario.</dd>\n</dl>",
  "anotaciones": [
    { "fragmento": "<dt>Frontend</dt>\n  <dt>Lado del cliente</dt>", "nota": "Dos términos distintos, mismo significado — ambos dt quedan asociados a la única dd que viene después. El navegador y el lector de pantalla entienden que son sinónimos dentro de este glosario." }
  ]
}
```

## Controlar el orden y el número

`<ol>` tiene tres atributos propios que van más allá del "1, 2, 3" por defecto:

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Los atributos de ol, uno por uno",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "ol", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "start", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"5\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "reversed", "rol": "atributo-nombre" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "type", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"A\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<ol start=\"5\">\n  <li>Quinto</li>\n  <li>Sexto</li>\n</ol>\n\n<ol reversed>\n  <li>Tercer puesto</li>\n  <li>Segundo puesto</li>\n  <li>Primer puesto</li>\n</ol>\n\n<ol type=\"A\">\n  <li>Primera opción</li>\n  <li>Segunda opción</li>\n</ol>",
  "anotaciones": [
    { "fragmento": "start=\"5\"", "nota": "La numeración empieza en 5 en vez de en 1 — útil para continuar una lista partida en dos bloques." },
    { "fragmento": "reversed", "nota": "Cuenta hacia abajo en vez de hacia arriba: el primer li se numera más alto, el último más bajo. Perfecto para un ranking tipo \"top 3\" contado de atrás para adelante." },
    { "fragmento": "type=\"A\"", "nota": "Cambia el formato de la numeración: A/B/C, a/b/c, i/ii/iii (números romanos), o el 1/2/3 por defecto. Existe también value en cada li individual para saltarte un número concreto." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<ol reversed>\n  <li>Primero</li>\n  <li>Segundo</li>\n  <li>Tercero</li>\n</ol>",
  "opciones": [
    "Se numera 1, 2, 3 — reversed solo cambia el orden visual de los elementos, no los números",
    "Se numera 3, 2, 1 — el primer li recibe el número más alto",
    "El navegador ignora reversed porque no es un atributo real de HTML"
  ],
  "correcta": 1,
  "explicacion": "reversed no cambia el ORDEN de los elementos en el DOM ni en pantalla — \"Primero\" sigue apareciendo arriba. Lo que cambia es la numeración: cuenta hacia abajo, así que el primer li (\"Primero\") se numera 3, y el último (\"Tercero\") se numera 1."
}
```

## Anidar listas

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<ol>\n  <li>Pela y trocea el ajo</li>\n  <li>\n    Procesa los ingredientes\n    <ul>\n      <li>Poco tiempo si lo quieres con tropezones</li>\n      <li>Más tiempo si lo quieres cremoso</li>\n    </ul>\n  </li>\n</ol>",
  "anotaciones": [
    { "fragmento": "<li>\n    Procesa los ingredientes\n    <ul>\n      <li>Poco tiempo si lo quieres con tropezones</li>\n      <li>Más tiempo si lo quieres cremoso</li>\n    </ul>\n  </li>", "nota": "La lista anidada va DENTRO del li padre, no después de él. Si la sacas fuera del li, deja de estar anidada de verdad — pasa a ser una lista nueva, independiente, al mismo nivel que la primera." }
  ]
}
```

## Diseñar los marcadores con CSS

El atributo `type` de `<ol>` solo cambia el formato de la numeración. Todo lo demás — el color, el tamaño, la forma, o cambiar viñetas por un icono — es trabajo de CSS, no de HTML:

```css
ul.tareas {
  list-style-type: "✓ ";
}

ol.ranking {
  list-style-type: upper-roman;
}

ul.avisos li::marker {
  color: crimson;
  font-weight: bold;
}
```

`list-style-type` acepta directamente una cadena de texto como marcador (no solo `disc`, `circle`, `decimal`...), y los mismos formatos de numeración del atributo `type` de `ol` (`A`, `a`, `i`...) también existen como valores CSS — si ambos están presentes, gana el CSS. El pseudo-elemento `::marker` apunta solo al número o viñeta de cada `li`, sin tocar el resto del contenido, así que se le puede dar color o grosor propio sin afectar al texto.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "list-style-type controla el formato", "texto": "disc/circle/square para ul, decimal/upper-roman/lower-alpha para ol, o incluso una cadena de texto o emoji personalizado." },
    { "titulo": "list-style-position", "texto": "Si el marcador queda fuera de la caja del li (outside, el valor por defecto) o dentro, alineado con el texto (inside)." },
    { "titulo": "::marker", "texto": "Pseudo-elemento que da acceso a un subconjunto de propiedades (color, font, content) solo para el marcador, sin duplicar el contenido del li." },
    { "titulo": "El atributo type de ol", "texto": "Sigue funcionando como valor por defecto, pero list-style-type en CSS SIEMPRE gana si ambos están presentes — igual que cualquier estilo en línea puede ganarle a un atributo HTML." }
  ]
}
```

## Cuando el CSS quita la lista sin querer

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "list-style: none puede borrar la semántica, no solo el marcador",
  "contenido": "En Safari con VoiceOver, quitar los marcadores con CSS (list-style-type: none) puede hacer que el lector de pantalla deje de anunciar la lista como lista — dejaría de decir \"lista de 5 elementos\" y de permitir saltar entre ítems."
}
```

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<ul>\n  <li>Inicio</li>\n  <li>Blog</li>\n  <li>Contacto</li>\n</ul>",
  "despues": "<ul style=\"list-style: none; padding: 0;\">\n  <li>Inicio</li>\n  <li>Blog</li>\n  <li>Contacto</li>\n</ul>",
  "nota": "Visualmente cambia (sin marcadores ni sangría) pero el HTML de debajo sigue siendo el mismo ul/li — es exactamente el patrón que usa el menú de navegación de la mayoría de webs, esta incluida."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<ul style=\"list-style: none; padding: 0;\" role=\"list\">\n  <li>Inicio</li>\n  <li>Blog</li>\n</ul>",
  "anotaciones": [
    { "fragmento": "role=\"list\"", "nota": "El parche para el caso de Safari/VoiceOver de arriba: le devuelve explícitamente la semántica de lista que el CSS pudo haberle quitado. No hace falta en todos los casos, pero es la solución cuando SÍ importa que se anuncie como lista." }
  ]
}
```

## Lo que las listas NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las listas son solo para poner viñetas o números en pantalla",
      "realidad": "Son estructura semántica real: un lector de pantalla anuncia cuántos elementos tiene la lista y permite saltar entre ellos — algo que un párrafo con guiones sueltos no ofrece, aunque se vea parecido."
    },
    {
      "mito": "Quitar los marcadores con CSS no afecta nada a la accesibilidad",
      "realidad": "En Safari con VoiceOver, list-style-type: none puede eliminar la semántica de lista por completo — hace falta role=\"list\" para recuperarla cuando importa que se siga anunciando como tal."
    },
    {
      "mito": "dl solo sirve para glosarios de palabras",
      "realidad": "Sirve para cualquier par clave-valor: preguntas y respuestas, las especificaciones de un producto, los metadatos de una ficha — cualquier cosa con la forma \"término → su valor o explicación\"."
    },
    {
      "mito": "Una lista anidada puede ir justo después del li que la contiene",
      "realidad": "Tiene que ir DENTRO de ese li. Fuera de él, deja de estar anidada — pasa a ser una lista independiente al mismo nivel que la primera, no una sub-lista de uno de sus elementos."
    },
    {
      "mito": "menu es una etiqueta distinta, pensada para menús de navegación",
      "realidad": "En el HTML actual, <menu> se comporta exactamente igual que <ul> — incluso acepta los mismos hijos (li) y el mismo CSS. Viene de una versión anterior de la especificación que le daba un uso propio (menús contextuales de aplicación) que los navegadores nunca llegaron a implementar de forma consistente."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Meter contenido directamente en ul/ol sin envolverlo en li.", "texto": "Todo hijo directo de ul u ol tiene que ser un li — texto suelto o un div ahí dentro es HTML inválido, aunque algunos navegadores lo \"arreglen\" solos de forma impredecible." },
    { "titulo": "Usar ol cuando el orden en realidad no importa.", "texto": "Si podrías reordenar los elementos sin que cambie el sentido, es ul — usar ol ahí sugiere una secuencia que no existe." },
    { "titulo": "Simular una lista con saltos de línea y guiones sueltos.", "texto": "\"- Leche<br>- Huevos<br>- Pan\" se ve parecido a una lista pero no lo es para ningún lector de pantalla ni buscador." },
    { "titulo": "Anidar la lista fuera del li, al mismo nivel que sus hermanos.", "texto": "Rompe la jerarquía visual y semántica — dos listas independientes en vez de una lista con una sub-lista dentro de uno de sus elementos." }
  ]
}
```

## Ejercicios

1. Escribe la lista de la compra de una receta sencilla (ul) y, debajo, los pasos para prepararla (ol) — decide en cada caso si el orden importa de verdad.
2. Escribe una lista de descripción (dl) con al menos tres pares término/definición sobre un tema que domines.
3. Crea un ranking de tus tres películas o canciones favoritas usando ol con el atributo reversed, de forma que el número 1 sea tu favorita absoluta.
4. Busca el menú de navegación de una web real (las herramientas de desarrollador te dejan inspeccionar el HTML) — ¿está construido con ul/li? ¿Lleva list-style: none o algo parecido?
5. Coge la lista de la compra del ejercicio 1 y, solo con CSS, cambia sus marcadores por un emoji o símbolo propio usando list-style-type — sin tocar el HTML.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Lists",
      "descripcion": "Guía de referencia de MDN sobre listas ordenadas, desordenadas y de descripción, con ejemplos de anidamiento.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Lists",
      "descripcion": "Curso de web.dev sobre listas, con más detalle en los atributos de ol y en cómo afecta el CSS a la semántica de lista en distintos lectores de pantalla.",
      "url": "https://web.dev/learn/html/lists",
      "etiqueta": "web.dev"
    }
  ]
}
```
