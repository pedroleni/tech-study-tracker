# Texto avanzado: citas, código, abreviaturas y datos de contacto

- **Módulo:** Texto y contenido
- **Slug:** `texto-avanzado-citas-codigo-abreviaturas-y-datos-de-contacto` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [Advanced text features (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Advanced_text_features) + [Text-level semantics (WHATWG spec)](https://html.spec.whatwg.org/multipage/text-level-semantics.html) — ver `contenido/html/TEMARIO.md` #9

---

## Qué es y para qué sirve

Más allá de párrafos, encabezados y listas, HTML tiene un puñado de etiquetas para casos concretos y muy frecuentes: citar una fuente, marcar una abreviatura, dar los datos de contacto de quien escribe, mostrar código de programación tal cual, o escribir una fecha de forma que un ordenador la entienda. Cada una existe porque el caso de uso es lo bastante común como para merecer su propia etiqueta, en vez de resolverlo todo con negrita y cursiva.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se beneficia de usar la etiqueta correcta",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Anunciar el tipo de contenido", "descripcion": "Puede avisar de que algo es una cita, deletrear una abreviatura al completo, o leer una fecha con su formato natural en vez del código datetime." },
    { "etiqueta": "Buscador y asistentes", "rol": "Extraer datos estructurados", "descripcion": "Un date con datetime es una fecha real para un calendario o un evento; un blockquote con cite es una cita rastreable hasta su fuente." },
    { "etiqueta": "Quien lee el código", "rol": "Distinguir código de prosa", "descripcion": "code, kbd y samp dejan claro de un vistazo qué es texto de programación y qué es la explicación alrededor, sin depender del color de fondo." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando citas una fuente externa",
  "contenido": "Un artículo, un tutorial, una entrada de blog que reproduce un párrafo de otro sitio o la frase de alguien — para eso son blockquote y q, no unas comillas sueltas en el texto."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando escribes documentación técnica",
  "contenido": "Un tutorial que muestra código, comandos de terminal o teclas que hay que pulsar — code, kbd, samp y pre son exactamente para eso, y existen desde los primeros días de HTML."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando publicas quién escribe y cómo contactar",
  "contenido": "El pie de un artículo con el autor y su email, o el pie de página de todo el sitio con los datos de la empresa — ahí es donde va address, no en cualquier dirección postal que menciones."
}
```

## Citar una fuente: blockquote, q y cite

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<blockquote cite=\"https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/blockquote\">\n  <p>El elemento blockquote indica que el texto contenido es una cita extensa.</p>\n</blockquote>\n\n<p>\n  Como dice la <cite>documentación de MDN</cite>:\n  <q cite=\"https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/q\">está pensado para citas cortas que no necesitan salto de párrafo</q>.\n</p>",
  "anotaciones": [
    { "fragmento": "<blockquote cite=\"https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/blockquote\">", "nota": "Cita extensa, de bloque — el navegador la indenta por defecto. cite guarda la URL de origen, pero OJO: esa URL no se muestra en pantalla, es solo metadato para máquinas." },
    { "fragmento": "<cite>documentación de MDN</cite>", "nota": "El título de la obra citada, visible para el lector — normalmente en cursiva por defecto. Es el complemento visual que le falta al atributo cite." },
    { "fragmento": "<q cite=\"https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/q\">está pensado para citas cortas que no necesitan salto de párrafo</q>", "nota": "Cita corta, dentro del propio párrafo — el navegador añade las comillas automáticamente, así que no hace falta escribirlas a mano." }
  ]
}
```

Antes de nada, así se ve blockquote frente a un párrafo normal — el navegador lo indenta sin que hayas escrito ni una línea de CSS:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Escribir código legible no es opcional, es respeto por quien lo lea después.</p>",
  "despues": "<blockquote>\n  <p>Escribir código legible no es opcional, es respeto por quien lo lea después.</p>\n</blockquote>",
  "nota": "Mismo texto, mismo p por dentro — lo único que cambia es que blockquote lo envuelve. El navegador le añade sangría por defecto para señalar visualmente que es una cita extensa."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<p>Dicen que <q>lo simple es difícil de lograr</q>.</p>",
  "opciones": [
    "El navegador muestra el texto tal cual está escrito, sin nada añadido",
    "El navegador añade automáticamente comillas alrededor del contenido de q",
    "El navegador ignora q porque hace falta el atributo cite para que funcione"
  ],
  "correcta": 1,
  "explicacion": "q genera sus propias comillas por CSS (el navegador las añade con el pseudo-elemento ::before/::after) — por eso nunca se escriben comillas \" a mano dentro de un q, o saldrían duplicadas."
}
```

Así se ve de verdad en el navegador — comillas escritas a mano frente a las que añade q por su cuenta:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Dicen que \"lo simple es difícil de lograr\".</p>",
  "despues": "<p>Dicen que <q>lo simple es difícil de lograr</q>.</p>",
  "nota": "El texto es el mismo en los dos casos. En el de antes, las comillas están escritas a mano como parte del texto; en el de después las genera el propio navegador a partir de q — por eso nunca hay que escribirlas también a mano dentro de un q, o saldrían dobles."
}
```

El atributo `cite` es invisible para quien lee la página — solo lo leen máquinas. Si quieres que la fuente se vea, hace falta además un `<cite>` visible:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<blockquote cite=\"https://example.com/articulo\">\n  <p>El código abierto gana cuando gana la comunidad.</p>\n</blockquote>",
  "despues": "<p>Según <cite><a href=\"https://example.com/articulo\">este artículo</a></cite>:</p>\n<blockquote cite=\"https://example.com/articulo\">\n  <p>El código abierto gana cuando gana la comunidad.</p>\n</blockquote>",
  "nota": "El atributo cite es idéntico en los dos casos — sigue sin verse. Lo que cambia es que la versión de después añade un cite visible y enlazado, así que quien lee la página puede identificar y visitar la fuente, no solo un lector automático."
}
```

## Abreviaturas: abbr y su expansión

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p>Usamos <abbr title=\"Hypertext Markup Language\">HTML</abbr> para estructurar documentos.</p>\n\n<p>El <abbr title=\"Reverendo\">Rvdo.</abbr> García dio la bendición.</p>",
  "anotaciones": [
    { "fragmento": "<abbr title=\"Hypertext Markup Language\">HTML</abbr>", "nota": "El atributo title contiene la expansión completa y NADA MÁS — ni una frase, ni una nota aparte. Un lector de pantalla puede anunciarla, y en escritorio aparece como tooltip al pasar el ratón." },
    { "fragmento": "<abbr title=\"Reverendo\">Rvdo.</abbr>", "nota": "También sirve para abreviaturas cortas de una palabra, no solo siglas — cualquier forma acortada de un término más largo." }
  ]
}
```

Por defecto, el navegador marca visualmente que hay una expansión disponible, sin escribir ni una línea de CSS:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Usamos HTML para estructurar documentos web.</p>",
  "despues": "<p>Usamos <abbr title=\"Hypertext Markup Language\">HTML</abbr> para estructurar documentos web.</p>",
  "nota": "El navegador subraya con puntos el texto dentro de abbr y cambia el cursor al pasar por encima — la señal de que ahí hay una expansión disponible al pasar el ratón o al usar un lector de pantalla."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "acronym ya no existe",
  "contenido": "HTML tenía antes una etiqueta acronym separada de abbr, pero se eliminó de la especificación. abbr cubre hoy tanto abreviaturas normales (Sr., Ud.) como siglas y acrónimos (HTML, ONU, láser)."
}
```

## Datos de contacto: el elemento address

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<article>\n  <h2>Cómo optimizar imágenes para la web</h2>\n  <p>…contenido del artículo…</p>\n  <address>\n    Escrito por <a href=\"/autores/laura\">Laura Gómez</a> —\n    <a href=\"mailto:laura@ejemplo.com\">laura@ejemplo.com</a>\n  </address>\n</article>",
  "anotaciones": [
    { "fragmento": "<address>\n    Escrito por <a href=\"/autores/laura\">Laura Gómez</a> —\n    <a href=\"mailto:laura@ejemplo.com\">laura@ejemplo.com</a>\n  </address>", "nota": "Los datos de quien escribió ESTE article en concreto — nombre y un modo de contactarla. Puede llevar enlaces, saltos de línea o una lista, no solo texto plano." }
  ]
}
```

El navegador también le da un estilo propio, aunque lo importante siga siendo la etiqueta y no el aspecto:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Escrito por Laura Gómez — laura@ejemplo.com</p>",
  "despues": "<address>Escrito por Laura Gómez — laura@ejemplo.com</address>",
  "nota": "Por defecto, el navegador pone en cursiva el contenido de address — una pista visual de que es información de contacto, distinta del cuerpo del artículo. El estilo se puede sobrescribir con CSS sin problema; lo que no cambia es la semántica de la etiqueta."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "address es solo para el autor del artículo o del sitio.", "texto": "Los datos de contacto de quien firma el article que lo contiene, o del sitio entero si va suelto en el body o en un footer general — nunca cualquier dirección postal que aparezca mencionada en el texto." },
    { "titulo": "No es para la dirección de una tienda mencionada de pasada.", "texto": "Si un artículo sobre restaurantes menciona la dirección de tres locales, esas direcciones NO van en address — ese elemento está reservado para el contacto de quien escribe el propio documento." }
  ]
}
```

## Código en pantalla: code, pre, var, kbd y samp

| Etiqueta | Para qué sirve |
|---|---|
| `<code>` | Un fragmento de código, en línea o dentro de pre |
| `<pre>` | Conserva espacios y saltos de línea tal cual se escribieron |
| `<var>` | El nombre de una variable, en código o en una fórmula |
| `<kbd>` | Una tecla o combinación de teclas que hay que pulsar |
| `<samp>` | La salida que produce un programa |

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<pre><code>const parrafo = document.querySelector(\"p\");\nparrafo.textContent = \"Hola\";</code></pre>\n\n<p>En el ejemplo, <var>parrafo</var> guarda una referencia al elemento.</p>\n\n<p>Selecciona todo con <kbd>Ctrl</kbd> + <kbd>A</kbd>.</p>\n\n<pre>$ <kbd>ping mozilla.org</kbd>\n<samp>PING mozilla.org: 56 data bytes\n64 bytes from 63.245.215.20: tiempo=158 ms</samp></pre>",
  "anotaciones": [
    { "fragmento": "<pre><code>", "nota": "pre conserva los saltos de línea y la indentación del código tal cual — sin él, el navegador colapsaría todo en una sola línea de espacios." },
    { "fragmento": "<var>parrafo</var>", "nota": "Marca específicamente el nombre de la variable dentro de la frase explicativa, distinguiéndolo del resto del texto en prosa." },
    { "fragmento": "<kbd>Ctrl</kbd> + <kbd>A</kbd>", "nota": "Cada tecla en su propio kbd — así un lector de pantalla puede anunciarlas por separado en vez de leer \"Control más A\" como si fuera una sola palabra." },
    { "fragmento": "<kbd>ping mozilla.org</kbd>\n<samp>PING mozilla.org: 56 data bytes\n64 bytes from 63.245.215.20: tiempo=158 ms</samp>", "nota": "kbd para lo que el usuario escribió en la terminal, samp para lo que la terminal respondió — la distinción deja claro quién \"dijo\" cada línea." }
  ]
}
```

code, kbd, var y samp comparten algo en pantalla: el navegador les pone fuente monoespaciada por defecto, la misma familia que usan los editores de código:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Escribe const x = 5; y pulsa Ctrl + A para seleccionar todo.</p>",
  "despues": "<p>Escribe <code>const x = 5;</code> y pulsa <kbd>Ctrl</kbd> + <kbd>A</kbd> para seleccionar todo.</p>",
  "nota": "Mismo texto, pero en la versión de después el fragmento de código y las teclas cambian a una fuente monoespaciada — se distinguen del resto de la frase de un vistazo, sin depender de ningún color ni fondo."
}
```

## Fechas que un ordenador puede leer: time y datetime

Una fecha escrita como "20 de enero de 2016" es perfectamente legible para una persona, pero un ordenador no puede saber que eso es una fecha sin ayuda — ni meterla en un calendario, ni calcular cuánto falta para ella. El atributo `datetime` de `<time>` resuelve justo eso: guarda la fecha en un formato fijo y sin ambigüedad, mientras el texto visible sigue siendo el que tú quieras.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p>Publicado el <time datetime=\"2026-01-20\">20 de enero de 2026</time>.</p>\n<p>El evento empieza a las <time datetime=\"19:30\">19:30</time>.</p>",
  "anotaciones": [
    { "fragmento": "<time datetime=\"2026-01-20\">20 de enero de 2026</time>", "nota": "El texto visible puede estar en cualquier idioma o formato; datetime lleva SIEMPRE el formato fijo AAAA-MM-DD que un programa puede parsear sin ambigüedad." },
    { "fragmento": "<time datetime=\"19:30\">19:30</time>", "nota": "time también sirve solo para horas, sin fecha — útil para un horario de apertura o la hora de un evento recurrente." }
  ]
}
```

`datetime` acepta varios niveles de precisión, no solo la fecha completa:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Formatos válidos de datetime, de menos a más preciso",
  "items": [
    { "fecha": "2026", "titulo": "Solo el año", "texto": "datetime=\"2026\" — cuando ni siquiera el mes importa, solo el año." },
    { "fecha": "2026-01", "titulo": "Año y mes", "texto": "datetime=\"2026-01\" — para eventos o publicaciones que solo se sitúan por mes." },
    { "fecha": "2026-01-20", "titulo": "Fecha completa", "texto": "datetime=\"2026-01-20\" — el formato más habitual, año-mes-día." },
    { "fecha": "2026-01-20T19:30", "titulo": "Fecha y hora", "texto": "datetime=\"2026-01-20T19:30\" — la T separa la fecha de la hora, sin espacio." },
    { "fecha": "2026-01-20T19:30+01:00", "titulo": "Con zona horaria", "texto": "datetime=\"2026-01-20T19:30+01:00\" — añade el desfase horario, imprescindible si el evento importa a gente en otro huso." },
    { "fecha": "2026-W04", "titulo": "Número de semana", "texto": "datetime=\"2026-W04\" — la semana 4 del año, formato poco común pero válido para calendarios laborales." }
  ]
}
```

## Superíndice y subíndice: sup y sub

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<p>Mi cumpleaños es el 25<sup>º</sup> de mayo.</p>\n<p>La fórmula de la cafeína es C<sub>8</sub>H<sub>10</sub>N<sub>4</sub>O<sub>2</sub>.</p>\n<p>Si x<sup>2</sup> es 9, x vale 3 ó -3.</p>",
  "anotaciones": [
    { "fragmento": "25<sup>º</sup>", "nota": "Ordinal en superíndice — el uso más habitual y el que menos se nota, pero sigue siendo semántico: dice \"este texto va por encima de la línea base\"." },
    { "fragmento": "C<sub>8</sub>H<sub>10</sub>N<sub>4</sub>O<sub>2</sub>", "nota": "Fórmulas químicas: los subíndices numéricos son parte del significado, no un capricho tipográfico — sin ellos la fórmula ni siquiera se leería igual." },
    { "fragmento": "x<sup>2</sup>", "nota": "Exponentes matemáticos — el mismo caso que la fórmula química, pero por encima de la línea en vez de por debajo." }
  ]
}
```

Sin sub ni sup, esos mismos números y símbolos se leen en la línea base, como cualquier otro carácter — la posición es justo lo que aporta el significado:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<p>Mi cumpleaños es el 25º de mayo.</p>\n<p>La fórmula de la cafeína es C8H10N4O2.</p>\n<p>Si x2 es 9, x vale 3 ó -3.</p>",
  "despues": "<p>Mi cumpleaños es el 25<sup>º</sup> de mayo.</p>\n<p>La fórmula de la cafeína es C<sub>8</sub>H<sub>10</sub>N<sub>4</sub>O<sub>2</sub>.</p>\n<p>Si x<sup>2</sup> es 9, x vale 3 ó -3.</p>",
  "nota": "Los tres casos a la vez: sin sup ni sub, el ordinal, los subíndices químicos y el exponente quedan alineados con el resto del texto. Con ellos, el navegador ajusta automáticamente su posición vertical y reduce su tamaño — arriba de la línea con sup, abajo con sub."
}
```

## Lo que estas etiquetas NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "cite se puede usar para marcar el nombre de la persona que dijo la cita",
      "realidad": "La especificación es explícita: cite es el título de una OBRA (un libro, un artículo, un poema) — el nombre de una persona no es el título de nada, así que cite no debe usarse para nombres propios, por muy \"citable\" que sea esa persona."
    },
    {
      "mito": "q sirve para poner comillas de ironía o énfasis sobre una palabra",
      "realidad": "q representa una cita real de otra fuente, no un recurso tipográfico — usarlo para comillas \"de sarcasmo\" es precisamente el caso que la especificación señala como incorrecto."
    },
    {
      "mito": "address es para cualquier dirección postal que aparezca en la página",
      "realidad": "Solo es para los datos de contacto de quien escribe el article o el sitio que lo contiene — la dirección de un restaurante mencionado en una reseña no pinta nada dentro de un address."
    },
    {
      "mito": "El atributo cite de blockquote/q ya deja la fuente visible para el lector",
      "realidad": "cite es un atributo invisible, solo lo leen máquinas — para que un humano vea de dónde viene la cita hace falta además un elemento cite visible, normalmente enlazado a la fuente."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Escribir las comillas a mano dentro de un q.", "texto": "El navegador ya las añade automáticamente por CSS — escribirlas también en el texto produce comillas dobles o mal anidadas." },
    { "titulo": "Usar pre sin code dentro.", "texto": "pre conserva el formato pero no marca semánticamente que sea código — la pareja habitual es pre envolviendo a code, no pre suelto." },
    { "titulo": "Poner una frase entera dentro del title de abbr.", "texto": "title debe contener solo la expansión de la abreviatura, nada más — no es el sitio para una nota aclaratoria o un comentario." },
    { "titulo": "Escribir una fecha en datetime igual que el texto visible, sin normalizar.", "texto": "datetime=\"20 de enero\" no es un formato válido — tiene que seguir el patrón fijo (AAAA-MM-DD, HH:MM...) para que una máquina pueda interpretarlo." }
  ]
}
```

## Ejercicios

1. Busca una frase citable de un artículo o libro que hayas leído recientemente y márcala con blockquote (o q, si es corta), incluyendo el atributo cite con la URL real y un elemento cite visible y enlazado.
2. Escribe un párrafo con al menos dos abreviaturas distintas usando abbr y title, una de una sigla y otra de una palabra acortada.
3. Escribe el pie de un artículo tuyo con address: tu nombre, un enlace y un método de contacto.
4. Documenta un atajo de teclado que uses a menudo (por ejemplo, para copiar o buscar) usando kbd, y describe con var el nombre de una variable de un fragmento de código que hayas escrito últimamente.
5. Escribe la fecha de hoy con time y datetime en al menos dos de los formatos de precisión distinta que aparecen en esta lección.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Advanced text features",
      "descripcion": "Guía de referencia de MDN sobre citas, abreviaturas, datos de contacto, código y fechas, con ejemplos completos de cada etiqueta.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Advanced_text_features",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Text-level semantics",
      "descripcion": "La especificación WHATWG con la definición normativa exacta de cada elemento — por ejemplo, por qué cite no debe usarse para nombres de personas.",
      "url": "https://html.spec.whatwg.org/multipage/text-level-semantics.html",
      "etiqueta": "WHATWG"
    }
  ]
}
```
