# Qué va en el head: metadatos, título, favicon y CSS

- **Módulo:** Fundamentos del documento
- **Slug:** `que-va-en-el-head-metadatos-titulo-favicon-y-css` (autogenerado del título)
- **Orden:** 15
- **Fuentes:** [What's in the head? Metadata in HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) + [Metadata (web.dev)](https://web.dev/learn/html/metadata) + [Open Graph protocol (ogp.me)](https://ogp.me/) para la parte de redes sociales — ver `contenido/html/TEMARIO.md` #4

---

## Qué es y para qué sirve

El `head` es la zona de un documento HTML que nadie ve pintada en la página — pero que tres lectores distintos consultan todo el rato: el propio navegador, los buscadores, y las redes sociales cuando alguien comparte tu enlace. Cada uno se fija en etiquetas distintas de ahí dentro para hacer su trabajo, y casi ninguna de esas etiquetas se parece a las que ya conoces: no hay contenido entre apertura y cierre, casi todo son pares `name`/`content` o `property`/`content` dentro de una sola etiqueta `meta` vacía.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién lee cada cosa dentro del head",
  "roles": [
    { "etiqueta": "Navegador", "rol": "Pestaña y renderizado", "descripcion": "Lee charset, favicon y title para la pestaña; lee el link al CSS para pintar la página." },
    { "etiqueta": "Buscador", "rol": "Resultados de búsqueda", "descripcion": "Lee title y description para construir el resultado: el title es el enlace azul, la description el texto de debajo." },
    { "etiqueta": "Redes sociales", "rol": "Vista previa al compartir", "descripcion": "Leen metaetiquetas Open Graph (título, imagen, descripción) para la tarjeta que se ve al pegar un enlace." }
  ]
}
```

Ninguna de estas etiquetas cambia lo que ve quien ya está dentro de la página — todas actúan antes o alrededor de esa visita, no durante ella. Por eso esta lección tiene más secciones de las que quizá esperabas: no es un único concepto, son cuatro sistemas de metadatos distintos que conviven en el mismo sitio.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cada vez que creas una página nueva",
  "contenido": "El head no es opcional ni algo que se rellena al final: title y una description mínimamente pensada deberían escribirse a la vez que el contenido, no como última tarea antes de publicar."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando compartes un enlace y te importa cómo se ve",
  "contenido": "El title y la description son literalmente lo que aparece en el resultado de Google o en la tarjeta de WhatsApp/Twitter cuando alguien pega tu URL — no un detalle técnico interno."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando tienes veinte pestañas abiertas",
  "contenido": "Ahí es donde un favicon propio (en vez del icono genérico del navegador) marca la diferencia entre encontrar tu pestaña de un vistazo o tener que ir leyendo títulos uno a uno."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando publicas algo en redes o lo mandas por chat",
  "contenido": "Sin Open Graph, la mayoría de apps muestran el enlace pelado, solo texto azul. Con Open Graph aparece una tarjeta con imagen y título — la diferencia entre que alguien haga clic o lo ignore en el scroll."
}
```

## El título: más que un texto en la pestaña

El `<title>` es la única etiqueta de metadatos que un humano llega a leer directamente, aunque nunca dentro de la página. Aparece en tres sitios que no controlas por separado — la pestaña, el marcador cuando alguien guarda la página, y el enlace azul clicable en un resultado de búsqueda — así que tiene que funcionar igual de bien fuera de contexto que dentro.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Uno por página, siempre distinto.", "texto": "Si dos páginas de tu sitio comparten title, un buscador no puede distinguirlas en sus resultados ni tú en tus propios marcadores." },
    { "titulo": "Específico primero, marca después.", "texto": "\"Cómo cerrar una etiqueta en HTML — Tech Study Tracker\" se entiende antes de leerlo entero. \"Tech Study Tracker — lección 4\" no dice nada hasta el final." },
    { "titulo": "Los buscadores lo truncan sobre los 50-60 caracteres.", "texto": "No hay un límite técnico en HTML, pero un title más largo se corta con puntos suspensivos en el resultado de búsqueda — lo importante tiene que caber ahí." },
    { "titulo": "No es una palabra clave suelta.", "texto": "\"HTML, aprender HTML, curso HTML gratis\" no es un título, es una lista de spam que los buscadores penalizan en vez de premiar." }
  ]
}
```

## La meta description: tu anuncio en los buscadores

Si el title es el titular, la `meta description` es el texto de debajo en un resultado de búsqueda — lo que de verdad convence a alguien de hacer clic entre diez resultados casi iguales.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<meta name=\"description\" content=\"Aprende HTML paso a paso con lecciones interactivas: predice resultados, edita código en vivo y comprueba al momento si lo entendiste.\">",
  "anotaciones": [
    { "fragmento": "name=\"description\"", "nota": "El nombre estándar que buscadores y navegadores reconocen. Con cualquier otro valor en name, esta etiqueta pasa desapercibida." },
    { "fragmento": "content=\"Aprende HTML paso a paso con lecciones interactivas: predice resultados, edita código en vivo y comprueba al momento si lo entendiste.\"", "nota": "155-160 caracteres es la zona segura antes de que Google la trunque con puntos suspensivos — esta tiene 137." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Sin description, Google se la inventa",
  "contenido": "Si no escribes una, el buscador genera una automáticamente cogiendo un fragmento del contenido de la página — casi nunca tan claro ni tan persuasivo como uno escrito a propósito para ese resultado."
}
```

## Otras metaetiquetas que te vas a encontrar

`charset`, `description` y las `og:` de Open Graph son las que vas a escribir en casi cualquier página, pero no son las únicas. Estas son las que te vas a encontrar leyendo el `head` de sitios reales, con la frecuencia con la que de verdad se usan hoy:

| Metaetiqueta | Qué hace | Ejemplo |
|---|---|---|
| `viewport` | Controla el ancho y el zoom inicial en móvil. Ya la viste en la lección anterior — sin ella, un móvil renderiza como si fuera escritorio y luego encoge. | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| `robots` | Le dice a los buscadores si pueden indexar la página y seguir sus enlaces. | `<meta name="robots" content="noindex, nofollow">` |
| `author` | Quién escribió la página. Puramente informativo — no afecta al posicionamiento. | `<meta name="author" content="Ada Lovelace">` |
| `theme-color` | El color que algunos navegadores móviles usan para pintar la barra de interfaz alrededor de la página. | `<meta name="theme-color" content="#0f172a">` |
| `refresh` | Recarga o redirige la página tras N segundos. Desaconsejado: rompe el botón "atrás" del navegador y confunde a quien usa un lector de pantalla, que no espera que la página cambie sola. | `<meta http-equiv="refresh" content="5;url=https://ejemplo.com">` |
| `twitter:card` | El equivalente de Twitter/X a Open Graph — usa `name`, no `property`, a diferencia de las `og:`. Solo hace falta si quieres controlar esa plataforma por separado. | `<meta name="twitter:card" content="summary_large_image">` |

## El favicon, en todos los tamaños que hacen falta

Un solo `favicon.ico` cubre pestañas de escritorio, pero un móvil que "instala" tu web desde el navegador necesita un icono más grande y sin bordes redondeados por defecto — el sistema operativo se los pone él solo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<link rel=\"icon\" href=\"/favicon.ico\">\n<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon-180.png\">\n<link rel=\"apple-touch-icon\" sizes=\"152x152\" href=\"/apple-touch-icon-152.png\">",
  "anotaciones": [
    { "fragmento": "<link rel=\"icon\" href=\"/favicon.ico\">", "nota": "El básico: pestaña y marcadores en escritorio. Si no pones ninguno, muchos navegadores prueban a buscar /favicon.ico en la raíz por su cuenta." },
    { "fragmento": "<link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"/apple-touch-icon-180.png\">", "nota": "El icono cuando alguien añade tu web a la pantalla de inicio de un iPhone — 180×180 cubre los modelos más recientes." },
    { "fragmento": "<link rel=\"apple-touch-icon\" sizes=\"152x152\" href=\"/apple-touch-icon-152.png\">", "nota": "El mismo icono a otro tamaño, para iPad. El navegador elige automáticamente el que mejor encaje según sizes." }
  ]
}
```

## Cómo se ve tu enlace al compartirlo: Open Graph

Pega cualquier URL en WhatsApp, Twitter/X o Slack y espera dos segundos: aparece una tarjeta con imagen, título y descripción. Esa tarjeta no la genera la app del chat improvisando — la construye leyendo metaetiquetas Open Graph que tú pones en el head, un protocolo abierto que casi todas las plataformas sociales adoptaron para no reinventarlo cada una a su manera.

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Una etiqueta Open Graph, atributo por atributo",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "meta", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "property", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"og:title\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "content", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"...\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "property, no name",
  "contenido": "Casi todas las metaetiquetas usan name=\"...\". Open Graph es la excepción: usa property=\"og:...\". Copiar name aquí por costumbre hace que la plataforma social ignore la etiqueta entera sin avisar."
}
```

El protocolo exige solo cuatro propiedades para que una página sea un "objeto" válido dentro del grafo social:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<meta property=\"og:title\" content=\"Anatomía de una etiqueta — Tech Study Tracker\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:image\" content=\"https://tech-study-tracker.example/og/anatomia.png\">\n<meta property=\"og:url\" content=\"https://tech-study-tracker.example/tecnologias/html/anatomia\">",
  "anotaciones": [
    { "fragmento": "og:title", "nota": "El título de la tarjeta. No tiene por qué ser idéntico al <title> del head — puede ser más corto o más llamativo, pensado para leerse en una tarjeta pequeña." },
    { "fragmento": "og:type", "nota": "Qué tipo de contenido es: \"website\" para una página normal, \"article\" para un post con fecha y autor, \"video.movie\" para una ficha de película, etc." },
    { "fragmento": "og:image", "nota": "La imagen de la tarjeta. Tiene que ser una URL absoluta (con https://), no relativa — la plataforma social la descarga desde fuera de tu sitio." },
    { "fragmento": "og:url", "nota": "La URL canónica del contenido. Si tu página es accesible desde varias URLs (con o sin barra final, por ejemplo), esta es la que cuenta como la \"oficial\"." }
  ]
}
```

Con esas cuatro propiedades puestas, así es exactamente lo que aparece cuando alguien pega tu enlace en un chat:

```laboratorio
{
  "tipo": "vista-previa-social",
  "dominio": "tech-study-tracker.vercel.app",
  "ogTitulo": "Anatomía de una etiqueta — Tech Study Tracker",
  "ogDescripcion": "Qué es un elemento, qué son los atributos, y por qué unas pocas etiquetas se cierran solas y el resto no.",
  "imagenEtiqueta": "og:image · 1200×630"
}
```

## Enlazar CSS y JavaScript desde el head

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<!doctype html>\n<html lang=\"es\">\n<head>\n  <meta charset=\"utf-8\">\n  <script>\n    document.querySelector('h1').textContent = 'Cambiado por JS';\n  </script>\n</head>\n<body>\n  <h1>Original</h1>\n</body>\n</html>",
  "opciones": [
    "El texto cambia a \"Cambiado por JS\" sin problema",
    "Error en consola: no se puede leer una propiedad de null, porque el <h1> todavía no existe",
    "El navegador espera automáticamente a que cargue el <body> antes de ejecutar el script"
  ],
  "correcta": 1,
  "explicacion": "Un <script> sin defer se ejecuta en el momento exacto en que el navegador lo encuentra al leer el HTML de arriba a abajo — y si está en head, eso pasa ANTES de que exista el <body>. querySelector('h1') devuelve null y la siguiente línea revienta. Por eso los scripts que tocan el DOM van con el atributo defer (o al final del body, antes de cerrar </html>)."
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<link rel=\"stylesheet\" href=\"/estilos.css\">\n<script src=\"/app.js\" defer></script>",
  "anotaciones": [
    { "fragmento": "<link rel=\"stylesheet\" href=\"/estilos.css\">", "nota": "El CSS sí va en head sin truco: tiene que estar listo antes de pintar, para que la página no aparezca sin estilos un instante y luego \"salte\" cuando el CSS llega." },
    { "fragmento": "defer", "nota": "Le dice al navegador: descarga este script en paralelo, pero no lo ejecutes hasta que todo el HTML esté leído y el DOM exista. Sin este atributo, un script en head que toca elementos del body falla como en el ejemplo anterior." }
  ]
}
```

`defer` no es el único atributo que cambia cuándo se ejecuta un script — hay tres comportamientos distintos, y elegir el que no toca puede reproducir exactamente el error del ejercicio anterior:

| Atributo | ¿Cuándo se descarga? | ¿Cuándo se ejecuta? | ¿Cuándo usarlo? |
|---|---|---|---|
| *(ninguno)* | Bloquea el parseo del HTML mientras descarga | Inmediatamente al terminar de descargar | Casi nunca para código propio en `head` — es justo lo que rompió el ejemplo anterior |
| `async` | En paralelo, sin bloquear el HTML | En cuanto termina de descargar, sin esperar a nada más — puede saltarse el orden con otros scripts | Scripts independientes que no tocan el DOM ni dependen de otro script: analíticas, anuncios |
| `defer` | En paralelo, sin bloquear el HTML | Al terminar de parsear todo el HTML, y siempre en el orden en que aparecen en el documento | Scripts que sí tocan el DOM o dependen unos de otros — la opción por defecto razonable |

Un detalle que se suele pasar por alto: un `<script type="module">` se comporta como si llevara `defer` puesto automáticamente, aunque no lo escribas — otra razón por la que cada vez se ve más ese `type="module"` en proyectos modernos.

## Lo que el head NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El <title> es lo mismo que el <h1> de la página",
      "realidad": "El title es metadato invisible en el contenido — pestaña, buscadores, marcadores. El h1 es el titular visible dentro de la página. Pueden, y a menudo deberían, decir cosas distintas: el title más descriptivo para quien todavía no ha entrado, el h1 más directo para quien ya está leyendo."
    },
    {
      "mito": "La etiqueta meta keywords ayuda a posicionar en buscadores",
      "realidad": "Se abandonó hace años: los buscadores la ignoran por completo desde que se abusó de ella rellenándola de listas de palabras spam. Ponerla hoy no ayuda ni perjudica — simplemente no hace nada."
    },
    {
      "mito": "El favicon es solo un detalle decorativo",
      "realidad": "Es lo que permite reconocer tu pestaña entre otras veinte abiertas, aparece en marcadores e historial, y en móvil (vía apple-touch-icon) es literalmente el icono de la app si alguien la \"instala\" desde el navegador."
    },
    {
      "mito": "El orden de las etiquetas dentro de head da igual",
      "realidad": "No del todo: charset debería ir en los primeros ~1024 bytes del documento (prácticamente la primera línea de head) porque el navegador necesita saber la codificación antes de interpretar cualquier carácter que no sea ASCII básico, tildes y eñes incluidas."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Copiar el favicon de una plantilla y olvidar cambiarlo.", "texto": "Es fácil dejar el icono genérico del framework o boilerplate de turno — revisa siempre que el favicon sea el tuyo antes de publicar." },
    { "titulo": "Escribir una description genérica o repetida en todas las páginas.", "texto": "Si todas tus páginas tienen la misma description (o ninguna), el buscador genera una automáticamente a partir del contenido — casi nunca tan buena como una escrita a mano y específica de cada página." },
    { "titulo": "Poner el link del CSS en el body.", "texto": "Funciona, pero el navegador empieza a pintar la página antes de tener los estilos: se ve un parpadeo de contenido sin estilo que no ocurre si el link está en head." },
    { "titulo": "Usar name en vez de property en las etiquetas Open Graph.", "texto": "og:title, og:image y compañía necesitan property=\"og:...\", no name=\"og:...\". Con name, la plataforma social simplemente no las lee y cae de vuelta a una tarjeta genérica." },
    { "titulo": "Poner una og:image que no existe o pesa demasiado.", "texto": "Si la imagen no carga o supera el límite de la plataforma (Facebook y Twitter tienen límites de tamaño distintos), la tarjeta se muestra sin imagen — mejor probarla siempre con una herramienta de validación antes de publicar." }
  ]
}
```

## Ejercicios

1. Abre el código fuente de tres páginas web reales que uses a menudo y compara sus etiquetas `title`. ¿Cuál te parece más claro fuera de contexto, sin ver el resto de la página?
2. Escribe la `meta description` de una página que te inventes (real, tuya o de un proyecto ficticio) en menos de 155 caracteres, pensando en que es lo que alguien leerá en Google antes de decidir si entra.
3. Busca el favicon de una web que visites a menudo — ¿qué formato usa (`.ico`, `.png`, `.svg`)? Compáralo con el de otra pestaña abierta al lado: ¿se distinguen a simple vista?
4. Coge una URL real (tuya o de cualquier sitio) y pégala en un chat de WhatsApp o Telegram. ¿Aparece tarjeta con imagen? Si no aparece, busca el `<head>` de esa página: ¿le faltan etiquetas `og:`, o es que las tiene mal escritas?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "What's in the head? Metadata in HTML",
      "descripcion": "Guía de referencia de MDN sobre título, favicon, metaetiquetas y cómo enlazar CSS y JavaScript desde el head.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Metadata",
      "descripcion": "Curso de web.dev sobre metaetiquetas, con más detalle en theme-color, Twitter Cards y por qué la etiqueta keywords quedó obsoleta.",
      "url": "https://web.dev/learn/html/metadata",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "The Open Graph protocol",
      "descripcion": "La especificación original del protocolo: las cuatro propiedades obligatorias y por qué usa property en vez de name.",
      "url": "https://ogp.me/",
      "etiqueta": "ogp.me"
    }
  ]
}
```
