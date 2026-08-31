# Encabezados y párrafos: la jerarquía del contenido

- **Módulo:** Texto y contenido
- **Slug:** `encabezados-y-parrafos-la-jerarquia-del-contenido` (autogenerado del título)
- **Orden:** 25
- **Fuentes:** [Headings and paragraphs (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs) + [Headings and sections (web.dev)](https://web.dev/learn/html/headings-and-sections) — ver `contenido/html/TEMARIO.md` #6

---

## Qué es y para qué sirve

HTML tiene seis niveles de encabezado, `<h1>` a `<h6>`, y un elemento para todo lo demás: `<p>`. Un encabezado no es "texto grande y en negrita" — es una marca de jerarquía, como los niveles de un índice. `<h1>` es el título más importante de la página, `<h2>` los apartados dentro de él, `<h3>` lo que hay dentro de cada apartado, y así sucesivamente. El navegador reduce el tamaño de letra según baja el nivel, pero eso es solo una consecuencia visual — lo que de verdad comunica un encabezado es su **posición en la jerarquía**, no su tamaño.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se apoya en esa jerarquía",
  "roles": [
    { "etiqueta": "Lector de pantalla", "rol": "Navegar por niveles", "descripcion": "El 71,6% de usuarios de lector de pantalla navega así una página larga — por encima de buscar texto o leerla entera, según la encuesta de WebAIM." },
    { "etiqueta": "Buscador", "rol": "Entender qué pesa más", "descripcion": "Las palabras dentro de un h1 o h2 cuentan más para el posicionamiento que las mismas palabras dentro de un párrafo normal." },
    { "etiqueta": "Quien escanea la página", "rol": "Decidir en 3 segundos", "descripcion": "La mayoría de gente lee solo los encabezados antes de decidir si sigue leyendo o se va — una jerarquía clara retiene, una confusa pierde visitas." }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "En cualquier bloque de texto con más de un tema",
  "contenido": "En cuanto un artículo tiene dos apartados distintos, ya hay una jerarquía real que marcar — no hace falta esperar a tener un documento largo."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres que te encuentren en un buscador",
  "contenido": "Las palabras clave importan más dentro de un encabezado que sueltas en medio de un párrafo — es una de las señales que más pesan para SEO."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando alguien navega con lector de pantalla",
  "contenido": "Sin una jerarquía real, la única forma de encontrar algo es escuchar la página entera de arriba a abajo — con encabezados bien puestos, se salta directo al apartado que busca."
}
```

## Cómo se usa

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<h1>Aprende HTML</h1>\n<p>Un curso pensado para aprender haciendo, no solo leyendo.</p>\n\n<h2>Fundamentos del documento</h2>\n<p>Las piezas mínimas que todo HTML necesita.</p>\n\n<h3>El head</h3>\n<p>Metadatos que nadie ve, pero que el navegador y los buscadores sí.</p>\n\n<h2>Texto y contenido</h2>\n<p>Cómo estructurar lo que sí se lee.</p>",
  "anotaciones": [
    { "fragmento": "<h1>Aprende HTML</h1>", "nota": "Uno solo por página, el título de más arriba de todos. Todo lo demás cuelga jerárquicamente de aquí." },
    { "fragmento": "<h2>Fundamentos del documento</h2>", "nota": "Un apartado dentro del h1. Puede haber tantos h2 como apartados reales tenga la página." },
    { "fragmento": "<h3>El head</h3>", "nota": "Un sub-apartado dentro de ESE h2 concreto — no compite con los demás h2, solo con otros h3 que cuelguen del mismo h2." },
    { "fragmento": "<h2>Texto y contenido</h2>", "nota": "Otro apartado al mismo nivel que \"Fundamentos del documento\" — el h3 anterior no le afecta, porque no colgaba de él." }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<h1>Título</h1>\n<h4>Subtítulo</h4>\n<p>Contenido...</p>",
  "opciones": [
    "El navegador rechaza la página por saltarse niveles",
    "Se ve exactamente igual que si hubiera puesto h2 — h4 simplemente sale más pequeño — pero confunde a quien navega por niveles con lector de pantalla",
    "El navegador convierte automáticamente el h4 en h2"
  ],
  "correcta": 1,
  "explicacion": "Saltarse niveles (de h1 directo a h4) es HTML perfectamente válido — el navegador no corrige nada, solo pinta el h4 con su tamaño de letra más pequeño de costumbre. El problema no es visual, es de navegación: alguien que salta de encabezado en encabezado con lector de pantalla espera encontrar un h2 o un h3 antes de un h4, y ese hueco en la jerarquía no tiene ninguna explicación visible."
}
```

## La jerarquía no es tamaño de letra

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<span style=\"font-size: 32px; font-weight: bold; display: block;\">¿Es esto un título?</span>\n<p>Visualmente sí. Semánticamente, no es nada.</p>",
  "despues": "<h1>¿Es esto un título?</h1>\n<p>Visualmente igual. Semánticamente, es el título de la página.</p>",
  "nota": "Pixel por pixel, casi idénticos. La diferencia no la ve un humano mirando la pantalla — la ve un lector de pantalla (que anuncia \"encabezado nivel 1\" en el segundo caso y nada especial en el primero) y un buscador (que pondera el segundo mucho más para el posicionamiento)."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El tamaño de letra se puede cambiar con CSS sin perder el significado",
  "contenido": "Un h2 que necesitas más pequeño visualmente sigue siendo un h2 aunque le bajes el font-size con CSS — sigue anunciándose como \"encabezado nivel 2\" y sigue pesando igual para el buscador. Lo semántico y lo visual son capas separadas."
}
```

## El "esquema" que el navegador NO calcula

Aquí hay un dato que sorprende incluso a quien lleva tiempo escribiendo HTML: la idea de que el navegador construye automáticamente un índice de la página a partir de los encabezados —como hace un editor de texto tipo Word o Google Docs— **nunca llegó a implementarse de verdad**. Estuvo planteada en la especificación de HTML5, pero ningún navegador la construyó como una función real que puedas consultar. Lo único que existe de verdad es el tamaño de letra decreciente y lo que un lector de pantalla puede armar por su cuenta a partir del orden y nivel de tus encabezados.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Entonces, ¿de qué sirve la jerarquía si no hay índice automático?",
  "contenido": "De que las herramientas que SÍ existen — lectores de pantalla, extensiones de accesibilidad, el propio buscador — leen tus niveles de encabezado como la estructura real de la página. El \"índice\" lo construye cada herramienta a su manera a partir de esos niveles, no el navegador por defecto."
}
```

## Encabezados dentro de secciones

Un mismo nivel de encabezado significa algo distinto según en qué región viva — esto conecta directamente con `header`, `main`, `article` y `section` de la lección anterior:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<header>\n  <h1>Nombre del sitio</h1>\n</header>\n\n<main>\n  <h1>Título de esta página</h1>\n  <article>\n    <h2>Título del post</h2>\n    <section>\n      <h3>Un apartado del post</h3>\n    </section>\n  </article>\n</main>",
  "anotaciones": [
    { "fragmento": "<header>\n  <h1>Nombre del sitio</h1>\n</header>", "nota": "Este h1 es el nombre del SITIO, no de esta página concreta — vive en el header global." },
    { "fragmento": "<main>\n  <h1>Título de esta página</h1>", "nota": "¿Otro h1? Sí — dentro de main representa el título de ESTA página, un contexto distinto del header. No es el \"segundo h1 de la jerarquía global\", son dos jerarquías en regiones distintas." },
    { "fragmento": "<h2>Título del post</h2>", "nota": "Dentro del article, cuelga del h1 de main — el título del post concreto." },
    { "fragmento": "<h3>Un apartado del post</h3>", "nota": "Un sub-apartado dentro de ESE post, anidado un nivel más." }
  ]
}
```

## Lo que los encabezados NO son

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un h1 más grande visualmente es más importante que uno más pequeño",
      "realidad": "El tamaño lo decide el CSS, no el HTML — un h1 con font-size reducido sigue siendo el encabezado de más alto nivel semánticamente, aunque un h2 sin estilizar se vea más grande al lado."
    },
    {
      "mito": "El navegador construye un índice automático a partir de tus encabezados",
      "realidad": "Estaba planteado en la especificación de HTML5, pero ningún navegador lo implementó como función real. Lo único automático es el tamaño de letra decreciente."
    },
    {
      "mito": "Usar <span> con CSS grande en vez de un encabezado da el mismo resultado",
      "realidad": "Visualmente puede ser idéntico. Semánticamente, un lector de pantalla no lo anuncia como encabezado y un buscador no le da el mismo peso — pierdes accesibilidad y SEO por algo que se ve igual."
    },
    {
      "mito": "Saltarse un nivel (de h1 a h3) está bien si visualmente queda mejor",
      "realidad": "Es HTML válido, pero rompe la navegación por niveles de quien usa lector de pantalla — el hueco entre h1 y h3 no tiene ninguna explicación para quien navega por la estructura, no por el tamaño."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Elegir el nivel de encabezado por cómo se ve, no por la jerarquía real.", "texto": "\"Necesito que se vea más pequeño\" se resuelve con CSS, no bajando de h2 a h4 saltándote el h3." },
    { "titulo": "Más de un h1 sin que tenga sentido jerárquico.", "texto": "Dos h1 en la misma región (por ejemplo, dos dentro de main) sí es un problema real — a diferencia del ejemplo de header + main, que son regiones distintas con jerarquías propias." },
    { "titulo": "Encabezados vacíos o usados solo para separar visualmente.", "texto": "Un <h2></h2> sin texto, o un encabezado que solo dice \"---\", no aporta nada a quien navega por la estructura — para separar visualmente está el CSS." },
    { "titulo": "Más de tres niveles de profundidad sin necesidad real.", "texto": "h1 a h6 existen, pero encadenar seis niveles hace la jerarquía difícil de seguir incluso con buenas herramientas. La mayoría de páginas no necesitan bajar de h3." }
  ]
}
```

## Ejercicios

1. Coge un artículo largo (un post de blog, una noticia) y anota qué nivel de encabezado (h1-h6) le pondrías a cada título y subtítulo que veas, sin mirar el tamaño de letra — solo la jerarquía de ideas.
2. Escribe una página con un h1, dos h2 dentro de él, y un h3 dentro de uno de esos h2. Ábrela en el navegador y comprueba que los tamaños de letra decrecen tal como esperabas.
3. Busca en las herramientas de desarrollador de tu navegador si existe algún panel de "esquema" o "outline" de la página (algunos navegadores y extensiones sí lo ofrecen, aunque no sea nativo del HTML). ¿Coincide con la jerarquía que esperabas al escribir el HTML?
4. Encuentra un `<span>` o `<div>` con estilos que lo hacen parecer un título en algún proyecto real (tuyo o de código abierto) y explica en una frase qué se pierde exactamente al no ser un encabezado de verdad.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe un h1, dos h2 dentro de él, y un h3 dentro de uno de esos h2 (ejercicio 2). Comprueba en la vista previa que los tamaños decrecen como esperabas.",
  "html": "<!-- Empieza aquí -->",
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
      "titulo": "Headings and paragraphs",
      "descripcion": "Guía de referencia de MDN sobre los seis niveles de encabezado, el elemento párrafo, y por qué no conviene simular un título con CSS.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Headings and sections",
      "descripcion": "Curso de web.dev sobre el esquema (outline) de una página, incluida la nota de que los navegadores nunca lo implementaron como función real.",
      "url": "https://web.dev/learn/html/headings-and-sections",
      "etiqueta": "web.dev"
    }
  ]
}
```
