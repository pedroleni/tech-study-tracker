# Qué va en el head: metadatos, título, favicon y CSS

- **Módulo:** Fundamentos del documento
- **Slug:** `que-va-en-el-head-metadatos-titulo-favicon-y-css` (autogenerado del título)
- **Orden:** 15
- **Fuentes:** [What's in the head? Metadata in HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) + [Metadata (web.dev)](https://web.dev/learn/html/metadata) — ver `contenido/html/TEMARIO.md` #4

---

## Qué es y para qué sirve

El `head` es la zona de un documento HTML que nadie ve pintada en la página — pero que tres lectores distintos consultan todo el rato: el propio navegador, los buscadores, y las redes sociales cuando alguien comparte tu enlace. Cada uno se fija en etiquetas distintas de ahí dentro para hacer su trabajo.

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

Ninguna de estas etiquetas cambia lo que ve quien ya está dentro de la página — todas actúan antes o alrededor de esa visita, no durante ella.

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

## Cómo se usa

Una sola etiqueta `meta` puede llevar varios pares nombre/valor. Así por dentro:

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Una meta etiqueta con dos atributos",
  "partes": [
    { "texto": "<", "rol": "simbolo" },
    { "texto": "meta", "rol": "apertura" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "name", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"description\"", "rol": "atributo-valor" },
    { "texto": " ", "rol": "simbolo" },
    { "texto": "content", "rol": "atributo-nombre" },
    { "texto": "=", "rol": "simbolo" },
    { "texto": "\"Aprende HTML paso a paso\"", "rol": "atributo-valor" },
    { "texto": ">", "rol": "simbolo" }
  ]
}
```

Un `head` real, más allá del mínimo de la lección anterior:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<head>\n  <meta charset=\"utf-8\">\n  <title>Aprende HTML paso a paso — Tech Study Tracker</title>\n  <meta name=\"description\" content=\"Lecciones prácticas de HTML con ejercicios interactivos, pensadas para aprender haciendo.\">\n  <link rel=\"icon\" href=\"/favicon.ico\">\n  <link rel=\"stylesheet\" href=\"/estilos.css\">\n</head>",
  "anotaciones": [
    { "fragmento": "<title>Aprende HTML paso a paso — Tech Study Tracker</title>", "nota": "Lo que se ve en la pestaña, en marcadores y como enlace clicable en resultados de búsqueda. Distinto del <h1> que verá quien entra a la página — pueden decir cosas distintas." },
    { "fragmento": "<meta name=\"description\" content=\"Lecciones prácticas de HTML con ejercicios interactivos, pensadas para aprender haciendo.\">", "nota": "El texto que casi siempre aparece bajo el título en resultados de búsqueda. Los buscadores la truncan sobre los 155-160 caracteres, así que lo importante va primero." },
    { "fragmento": "<link rel=\"icon\" href=\"/favicon.ico\">", "nota": "El icono de la pestaña y de los marcadores. Sin esto, el navegador muestra un icono genérico o intenta adivinar buscando /favicon.ico por su cuenta." },
    { "fragmento": "<link rel=\"stylesheet\" href=\"/estilos.css\">", "nota": "Conecta el CSS. Tiene que ir en head: si el link estuviera en body, la página se pintaría sin estilos un instante antes de aplicarse — un parpadeo visible." }
  ]
}
```

¿Y si te olvidas del `title`?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<!doctype html>\n<html lang=\"es\">\n<head>\n  <meta charset=\"utf-8\">\n</head>\n<body>\n  <p>Hola</p>\n</body>\n</html>",
  "opciones": [
    "La pestaña queda completamente en blanco, sin ningún texto",
    "La pestaña muestra la URL de la página (o \"Untitled\", según el navegador)",
    "El navegador rechaza la página por falta de title"
  ],
  "correcta": 1,
  "explicacion": "Un head sin title nunca es un error — el navegador simplemente no tiene nada que mostrar en la pestaña, así que recurre a la URL o a un texto genérico como \"Untitled\" según el navegador. Ningún dato desaparece, pero la experiencia se degrada: sin title, esa pestaña es indistinguible de cualquier otra hasta que la abres."
}
```

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
    { "titulo": "Rellenar la etiqueta keywords pensando que ayuda al SEO.", "texto": "El tiempo que se pierde rellenándola es tiempo que no se invierte en la description real, que sí importa de verdad." }
  ]
}
```

## Ejercicios

1. Abre el código fuente de tres páginas web reales que uses a menudo y compara sus etiquetas `title`. ¿Cuál te parece más claro fuera de contexto, sin ver el resto de la página?
2. Escribe la description de una página que te inventes (real, tuya o de un proyecto ficticio) en menos de 155 caracteres, pensando en que es lo que alguien leerá en Google antes de decidir si entra.
3. Busca el favicon de una web que visites a menudo — ¿qué formato usa (`.ico`, `.png`, `.svg`)? Compáralo con el de otra pestaña abierta al lado: ¿se distinguen a simple vista?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "What's in the head? Metadata in HTML",
      "descripcion": "Guía de referencia de MDN sobre título, favicon, metaetiquetas y cómo enlazar CSS y JavaScript desde el head.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Metadata",
      "descripcion": "Curso de web.dev sobre metaetiquetas, con más detalle en Open Graph, theme-color y por qué la etiqueta keywords quedó obsoleta.",
      "url": "https://web.dev/learn/html/metadata",
      "etiqueta": "web.dev"
    }
  ]
}
```
