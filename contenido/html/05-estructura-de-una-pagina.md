# La estructura de una página: header, nav, main y footer

- **Módulo:** Fundamentos del documento
- **Slug:** `la-estructura-de-una-pagina-header-nav-main-y-footer` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [Structuring documents (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents) + [Semantic HTML (web.dev)](https://web.dev/learn/html/semantic-html) — ver `contenido/html/TEMARIO.md` #5

---

## Qué es y para qué sirve

Hasta ahora, todo el contenido de una lección ha vivido dentro de un único `<body>` sin dividir en regiones. Una página real sí tiene regiones — una cabecera, una navegación, un contenido principal, un pie — y HTML tiene etiquetas hechas exactamente para nombrar cada una: `<header>`, `<nav>`, `<main>`, `<footer>`, además de `<article>`, `<section>` y `<aside>` para lo que va dentro. Ninguna de estas etiquetas cambia cómo se ve la página por defecto — un `<div>` y un `<main>` con el mismo contenido se pintan exactamente igual. La diferencia está en quién más, además de un humano mirando la pantalla, puede entender la página.

Así se distribuyen esas regiones en una página real — no todas ocupan el ancho completo: `main` y `aside` van lado a lado, no una debajo de otra:

```laboratorio
{
  "tipo": "esquema-de-pagina",
  "header": "Logo y nombre del sitio",
  "nav": "Inicio · Blog · Contacto",
  "main": "El contenido único de esta página",
  "aside": "Enlaces relacionados, no esenciales",
  "footer": "© 2026 — todos los derechos reservados"
}
```

Y así se ven esas mismas regiones en una lista, con la etiqueta que las crea y el landmark que generan cada una:

```laboratorio
{
  "tipo": "mapa-de-regiones",
  "titulo": "Cómo se ve una página por regiones",
  "regiones": [
    { "etiqueta": "Cabecera", "elemento": "header", "landmark": "banner", "contenido": "Logo y nombre del sitio" },
    { "etiqueta": "Navegación", "elemento": "nav", "landmark": "navigation", "contenido": "Inicio · Blog · Contacto" },
    { "etiqueta": "Contenido principal", "elemento": "main", "landmark": "main", "contenido": "El contenido único de esta página" },
    { "etiqueta": "Contenido relacionado", "elemento": "aside", "landmark": "complementary", "contenido": "Enlaces relacionados, no esenciales" },
    { "etiqueta": "Pie", "elemento": "footer", "landmark": "contentinfo", "contenido": "© 2026 — todos los derechos reservados" }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se beneficia de nombrar las regiones",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Navegación por regiones", "descripcion": "Anuncia \"navegación principal\", \"contenido principal\" — quien lo usa puede saltar directo a cada región sin leer todo de arriba a abajo." },
    { "etiqueta": "Buscador", "rol": "Entender qué es importante", "descripcion": "Distingue el contenido real de la página (main) de la cabecera, el menú y el pie, que se repiten en todas las páginas del sitio." },
    { "etiqueta": "Quien lee el código", "rol": "Orientarse de un vistazo", "descripcion": "\"<footer>\" dice más que el quinto <div> anidado — la estructura semántica documenta la página por sí sola." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "En cualquier página con más de un bloque de contenido",
  "contenido": "En cuanto una página tiene cabecera, menú y contenido, ya hay región que nombrar. No hace falta un sitio grande — una sola página ya se beneficia."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando te importa la accesibilidad de verdad",
  "contenido": "Sin regiones nombradas, alguien con lector de pantalla tiene que escuchar toda la cabecera y el menú en cada página antes de llegar al contenido — con landmarks, salta directo a \"contenido principal\" con una tecla."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando vuelves a tu propio código seis meses después",
  "contenido": "Una sopa de <div class=\"wrapper\"><div class=\"inner\"><div class=\"content\"> no dice nada. header/nav/main/footer se explican solos, sin mirar los nombres de las clases."
}
```

## Cómo se usa

El esqueleto mínimo de una página con regiones:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<body>\n  <header>\n    <h1>Nombre del sitio</h1>\n  </header>\n\n  <nav>\n    <ul>\n      <li><a href=\"/\">Inicio</a></li>\n      <li><a href=\"/blog\">Blog</a></li>\n    </ul>\n  </nav>\n\n  <main>\n    <h2>Título de la página</h2>\n    <p>El contenido único de esta página va aquí.</p>\n  </main>\n\n  <footer>\n    <p>&copy; 2026 — todos los derechos reservados</p>\n  </footer>\n</body>",
  "anotaciones": [
    { "fragmento": "<header>\n    <h1>Nombre del sitio</h1>\n  </header>", "nota": "El header aquí, hijo directo de body, es la cabecera GLOBAL del sitio — logo, nombre, quizá una imagen de portada. No confundir con un título de sección cualquiera." },
    { "fragmento": "<nav>\n    <ul>\n      <li><a href=\"/\">Inicio</a></li>\n      <li><a href=\"/blog\">Blog</a></li>\n    </ul>\n  </nav>", "nota": "Reservado para la navegación PRINCIPAL del sitio — no cualquier grupo de enlaces. Un par de enlaces relacionados dentro de un artículo no necesitan su propio nav." },
    { "fragmento": "<main>\n    <h2>Título de la página</h2>\n    <p>El contenido único de esta página va aquí.</p>\n  </main>", "nota": "Solo puede haber UN main por página, y va directamente dentro de body — nunca anidado dentro de header, nav, article ni ningún otro contenedor." },
    { "fragmento": "<footer>\n    <p>&copy; 2026 — todos los derechos reservados</p>\n  </footer>", "nota": "El pie global: copyright, enlaces legales, contacto. Igual que header, puede repetirse dentro de un article o section como pie de ESA sección concreta." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<body>\n  <main>\n    <p>Primer bloque de contenido</p>\n  </main>\n  <main>\n    <p>Segundo bloque de contenido</p>\n  </main>\n</body>",
  "opciones": [
    "El navegador rechaza la página y no muestra nada",
    "Se ve exactamente igual que si fueran dos <div> — visualmente no pasa nada — pero es HTML inválido y confunde a quien use lector de pantalla",
    "El navegador borra automáticamente el segundo <main>"
  ],
  "correcta": 1,
  "explicacion": "El navegador nunca \"corrige\" ni \"borra\" HTML inválido por su cuenta — sencillamente pinta los dos bloques uno detrás de otro, indistinguibles a simple vista de dos <div>. El problema no se ve: un lector de pantalla que salte a \"contenido principal\" ya no sabe a cuál de los dos ir, porque la regla de \"un <main> por página\" existe precisamente para que esa pregunta tenga una única respuesta."
}
```

## Los landmarks: lo que gana un lector de pantalla

Cada etiqueta de esta lección crea, además de estructura visual, un **landmark** — una región con nombre en el árbol de accesibilidad que un lector de pantalla puede listar y saltar directamente, sin tener que escuchar toda la página de arriba a abajo.

| Etiqueta | Landmark ARIA | Lo que anuncia un lector de pantalla |
|---|---|---|
| `<header>` (hijo directo de `<body>`) | `banner` | "Banner" — la cabecera global del sitio |
| `<nav>` | `navigation` | "Navegación" — puede haber varios, cada uno con su propio nombre si hace falta distinguirlos |
| `<main>` | `main` | "Principal" — el destino directo de "saltar al contenido" |
| `<footer>` (hijo directo de `<body>`) | `contentinfo` | "Información del contenido" — el pie global |
| `<aside>` | `complementary` | "Complementario" — contenido relacionado pero no esencial |

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El landmark no es automático por el nombre de la etiqueta",
  "contenido": "header y footer solo generan banner/contentinfo cuando son hijos directos de body. Anidados dentro de article o section, dejan de ser landmarks globales y pasan a ser la cabecera o el pie de ESA sección — más sobre esto un poco más abajo."
}
```

Un uso muy concreto de estos landmarks, que seguramente ya has usado sin darte cuenta: el enlace "Saltar al contenido" que aparece al pulsar Tab nada más cargar muchas páginas (esta lección incluida) apunta directamente al `id` del `<main>`. Sin un `<main>` real que apuntar, ese enlace no tendría destino:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<a href=\"#contenido\" class=\"skip-link\">Saltar al contenido</a>\n\n<header>...</header>\n<nav>...</nav>\n\n<main id=\"contenido\">\n  ...\n</main>",
  "anotaciones": [
    { "fragmento": "<a href=\"#contenido\" class=\"skip-link\">Saltar al contenido</a>", "nota": "Suele ir oculto visualmente y solo aparece al recibir el foco con Tab — así no molesta a quien no lo necesita, pero está ahí para quien sí." },
    { "fragmento": "<main id=\"contenido\">", "nota": "El destino del enlace. Sin este id (y sin que main sea un landmark real), \"saltar al contenido\" no tendría a dónde saltar." }
  ]
}
```

## article vs section: cuál usarías

Esta es la distinción que más cuesta la primera vez, porque visualmente no cambia nada — el navegador pinta ambas exactamente igual. La diferencia es una pregunta que te haces tú, no algo que se vea:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<article>\n  <h2>Cómo hacer pan casero</h2>\n  <p>Con solo cuatro ingredientes...</p>\n</article>",
  "despues": "<section>\n  <h2>Cómo hacer pan casero</h2>\n  <p>Con solo cuatro ingredientes...</p>\n</section>",
  "nota": "Pixel por pixel, idénticos. La pregunta que decide cuál usar: ¿este bloque tendría sentido si lo sacaras de la página y lo pegaras en otro sitio (un feed RSS, otra web que lo cite)? Si sí, es article. Si solo tiene sentido aquí, agrupando una parte del contenido de la página, es section."
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "article: contenido que se sostiene solo.", "texto": "Un post de blog, una noticia, una reseña de producto, un comentario de usuario. Si tiene sentido fuera de esta página concreta, es un article." },
    { "titulo": "section: una parte temática de algo más grande.", "texto": "El apartado \"Opiniones\" de una ficha de producto, o un capítulo dentro de un artículo largo — agrupa, no se sostiene solo. Casi siempre empieza con su propio encabezado." },
    { "titulo": "Se pueden anidar entre sí.", "texto": "Un article puede dividirse en varios section (capítulos de un post largo), y un section puede agrupar varios article (una lista de posts del blog)." }
  ]
}
```

## Cuando header y footer no son "globales"

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<main>\n  <article>\n    <header>\n      <h2>Título del post</h2>\n      <p>Publicado el 20 de agosto de 2026</p>\n    </header>\n    <p>Contenido del post...</p>\n    <footer>\n      <p>Escrito por Ada Lovelace</p>\n    </footer>\n  </article>\n</main>",
  "anotaciones": [
    { "fragmento": "<header>\n      <h2>Título del post</h2>\n      <p>Publicado el 20 de agosto de 2026</p>\n    </header>", "nota": "Este header vive dentro de un article, no es hijo directo de body — así que NO crea el landmark banner. Es solo la cabecera de este post: su título y su fecha." },
    { "fragmento": "<footer>\n      <p>Escrito por Ada Lovelace</p>\n    </footer>", "nota": "Igual que arriba: dentro de article, este footer es el pie de ESTE post (autoría), no el pie global de la página con el copyright del sitio." }
  ]
}
```

Nada impide tener varios `<header>` y `<footer>` en la misma página — uno global y uno por cada `<article>` — mientras solo el que cuelga directamente de `<body>` actúe como landmark de toda la página.

## Lo que la estructura semántica NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Solo puede haber un <header> y un <footer> en toda la página",
      "realidad": "Lo único limitado a uno por página es <main>. Puede haber tantos header y footer como article o section los necesiten — cada uno es la cabecera o el pie de SU sección, no de la página entera."
    },
    {
      "mito": "<section> es solo un <div> con otro nombre",
      "realidad": "Un section sin encabezado propio apenas aporta nada semánticamente — la recomendación es que cada section empiece con su propio h2/h3. Sin eso, un div plano comunica lo mismo."
    },
    {
      "mito": "<nav> hay que ponerlo en cualquier grupo de enlaces",
      "realidad": "Está pensado para la navegación PRINCIPAL del sitio. Dos o tres enlaces relacionados al pie de un artículo no necesitan su propio nav — eso solo añade ruido al árbol de accesibilidad."
    },
    {
      "mito": "Usar header, nav, main y footer ya hace la página accesible",
      "realidad": "Es la base, no el final: sigue haciendo falta un único h1 bien puesto, un orden de encabezados sin saltos, y contraste de color suficiente. La estructura semántica ayuda, pero no sustituye al resto de la accesibilidad."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Anidar <main> dentro de otro contenedor.", "texto": "main tiene que ser hijo directo de body. Meterlo dentro de un div \"wrapper\" es válido en HTML pero rompe la intención semántica — algunas herramientas de accesibilidad esperan encontrarlo ahí." },
    { "titulo": "Dos <main> en la misma página.", "texto": "Ninguna herramienta lo bloquea, pero deja el landmark \"principal\" ambiguo — exactamente el problema del ejercicio de predicción de arriba." },
    { "titulo": "section sin encabezado.", "texto": "Sin un h2/h3 propio, un lector de pantalla no puede anunciar de qué trata esa sección al saltar a ella — es casi indistinguible de un div." },
    { "titulo": "Usar <article> para cualquier tarjeta o recuadro.", "texto": "Una tarjeta de producto que no tiene sentido fuera de su página normalmente es section, no article — la pregunta sigue siendo si ese contenido se sostiene solo fuera de contexto." }
  ]
}
```

## Ejercicios

1. Coge una página HTML que ya tengas (o el código fuente de una web real) y dibuja en un papel qué etiqueta semántica usarías para cada bloque visual: cabecera, menú, contenido, pie. ¿Hay algún bloque que no encaje claramente en ninguna?
2. Escribe el esqueleto de una página de blog con un post: header global, nav, main con un article (que a su vez tenga su propio header con título y fecha), un aside con "posts relacionados", y footer global.
3. Abre una web real con las herramientas de desarrollador y busca cuántos `<main>` tiene. ¿Coincide con lo que has aprendido en esta lección?
4. Para cada uno de estos tres bloques, decide si usarías `article` o `section` y explica por qué en una frase: (a) un comentario de un usuario en un foro, (b) la sección "Preguntas frecuentes" de una página de producto, (c) una entrada de un diccionario dentro de un glosario.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "Structuring documents",
      "descripcion": "Guía de referencia de MDN sobre header, nav, main, footer, article, section y aside, con ejemplos de anidamiento.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Semantic HTML",
      "descripcion": "Curso de web.dev sobre qué significa \"semántico\" de verdad y cómo los landmarks ARIA se generan a partir de estas etiquetas.",
      "url": "https://web.dev/learn/html/semantic-html",
      "etiqueta": "web.dev"
    }
  ]
}
```
