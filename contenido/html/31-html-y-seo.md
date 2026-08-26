# HTML y SEO: qué lee de verdad un buscador

- **Módulo:** Calidad
- **Slug:** `html-y-seo-que-lee-de-verdad-un-buscador` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [SEO Starter Guide (Google Search Central)](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) + [Meta tags que Google soporta (Google Search Central)](https://developers.google.com/search/docs/crawling-indexing/special-tags) — ver `contenido/html/TEMARIO.md` #31

---

## Qué es y para qué sirve

Para "qué lee de verdad un buscador", la autoridad no es un tutorial de terceros — es el propio buscador. Google publica exactamente qué etiquetas usa, cuáles ignora por completo, y desmiente directamente varios mitos de SEO que llevan circulando años. Esta última lección cierra el curso con la fuente más directa posible: qué de todo lo aprendido en las 30 lecciones anteriores le importa de verdad a un motor de búsqueda, y qué nunca le importó.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué necesita Google del mismo HTML que necesita una persona",
  "roles": [
    { "etiqueta": "El propio Google", "rol": "Ver la página como la ve un usuario", "descripcion": "Necesita acceso al CSS y al JavaScript igual que un navegador — si algo se lo esconde, puede entender la página peor de lo esperado." },
    { "etiqueta": "title y meta description", "rol": "Lo primero que se lee en el resultado", "descripcion": "Google los usa como base del título y el resumen que aparecen en la búsqueda — no promete usarlos literalmente, pero son el punto de partida." },
    { "etiqueta": "El texto de un enlace", "rol": "Una señal real, no decorativa", "descripcion": "Ayuda a Google a entender de qué trata la página de destino antes de visitarla — la misma razón por la que \"haz clic aquí\" es mala práctica." }
  ]
}
```

## Cuándo lo tienes en cuenta de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando quieres que tu página aparezca bien en los resultados",
  "contenido": "title y meta description son lo primero que Google toma como base para el resultado de búsqueda, aunque no siempre los use literalmente."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando decides si una página debe indexarse o no",
  "contenido": "Una página de borrador, de agradecimiento tras una compra, duplicada — ahí meta robots controla explícitamente qué hace Google con ella."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Nunca esperando trucos que ya no funcionan",
  "contenido": "meta keywords, un recuento de palabras exacto, repetir palabras clave a la fuerza — Google ha confirmado explícitamente que nada de eso ayuda, y alguno incluso perjudica."
}
```

## Cómo se usa: title y meta description

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<title>Tarta de manzana casera — receta fácil en 40 min | MiBlog</title>\n<meta name=\"description\" content=\"Receta paso a paso de tarta de manzana casera, con ingredientes básicos y lista en 40 minutos. Fotos de cada paso incluidas.\">",
  "anotaciones": [
    { "fragmento": "<title>Tarta de manzana casera — receta fácil en 40 min | MiBlog</title>", "nota": "Único para esta página en concreto, claro y descriptivo — la base del título que aparece en el resultado de búsqueda, aunque Google puede reescribirlo si lo considera necesario." },
    { "fragmento": "content=\"Receta paso a paso de tarta de manzana casera, con ingredientes básicos y lista en 40 minutos. Fotos de cada paso incluidas.\"", "nota": "Un resumen específico de ESTA página, no una descripción genérica repetida en todo el sitio — la base del fragmento de texto bajo el título en la búsqueda." }
  ]
}
```

## Encabezados: importan para las personas, no como "truco SEO"

```laboratorio
{
  "tipo": "predice-el-resultado",
  "codigo": "<h1>Receta de tarta de manzana</h1>\n<h3>Ingredientes</h3>\n<h2>Preparación</h2>\n<!-- Un h3 antes que su h2 correspondiente: orden \"incorrecto\" -->",
  "opciones": [
    "Google penaliza la página por no seguir el orden jerárquico correcto",
    "Google no penaliza el orden — aunque sigue siendo mala práctica para quien usa lector de pantalla",
    "El navegador corrige automáticamente los niveles antes de que Google la indexe"
  ],
  "correcta": 1,
  "explicacion": "Google ha confirmado explícitamente que el orden de los encabezados no afecta al posicionamiento — desde su perspectiva, da igual si están \"desordenados\". Pero eso no cambia nada para quien navega con lector de pantalla: la jerarquía sigue importando para las personas, aunque a Google no le importe (ver la lección 6)."
}
```

## robots y canonical: controlar qué indexa Google

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<meta name=\"robots\" content=\"noindex, nofollow\">\n\n<link rel=\"canonical\" href=\"https://ejemplo.com/receta-tarta-manzana\">",
  "anotaciones": [
    { "fragmento": "content=\"noindex, nofollow\"", "nota": "Le pide a Google que no indexe esta página Y que no siga ninguno de sus enlaces — útil en páginas de borrador, de agradecimiento, o duplicadas que no deben aparecer en resultados." },
    { "fragmento": "<link rel=\"canonical\" href=\"https://ejemplo.com/receta-tarta-manzana\">", "nota": "Cuando el mismo contenido existe en varias URLs (con parámetros de tracking, por ejemplo), esto le dice a Google cuál es la versión \"oficial\" que debe indexar." }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El texto de enlace sigue siendo una señal real",
  "contenido": "Google usa el texto de un enlace para entender de qué trata la página de destino antes de visitarla — la misma razón de fondo por la que \"haz clic aquí\" es mala práctica tanto para accesibilidad como para SEO (lección 10)."
}
```

## Lo que el SEO NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La etiqueta meta keywords sigue influyendo en el posicionamiento",
      "realidad": "Google ha confirmado explícitamente que no la usa para nada, ni en indexación ni en ranking — lleva años sin efecto real."
    },
    {
      "mito": "Hay un número mágico de palabras que un contenido necesita para posicionar bien",
      "realidad": "Google lo desmiente directamente — no existe un recuento ideal; lo que importa es responder bien a lo que se busca, no alcanzar una cifra."
    },
    {
      "mito": "Repetir palabras clave muchas veces mejora el posicionamiento",
      "realidad": "Es keyword stuffing, y viola directamente las políticas de spam de Google — puede perjudicar en vez de ayudar."
    },
    {
      "mito": "Tener el mismo contenido en varias URLs genera una penalización automática",
      "realidad": "Google lo considera ineficiente, pero no es motivo de una acción manual por sí solo — el problema real es no usar rel=canonical para aclarar cuál es la versión de referencia."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Bloquear a Google el acceso al CSS o al JavaScript de la página.", "texto": "Necesita verlos para entender la página como la vería una persona real — esconderlos puede empeorar cómo la interpreta." },
    { "titulo": "Escribir el mismo title y meta description en todas las páginas.", "texto": "Pierde la utilidad de ambos: deben ser específicos de cada página, no una plantilla repetida sin cambios." },
    { "titulo": "Forzar el orden de los encabezados pensando que mejora el SEO.", "texto": "Google ha confirmado que el orden no afecta al posicionamiento — pero seguir siendo desordenado sí perjudica a quien navega con lector de pantalla." },
    { "titulo": "Usar noindex en una página sin darse cuenta.", "texto": "Puede sacar del todo una página de los resultados de búsqueda sin que nadie note por qué dejó de aparecer." }
  ]
}
```

## Ejercicios

1. Escribe un title y una meta description únicos y descriptivos para una página de producto ficticia.
2. Escribe un meta robots que evite que una página de "gracias por tu compra" aparezca en resultados de búsqueda.
3. Explica con tus palabras por qué el orden de los encabezados puede ser irrelevante para Google pero seguir importando para la accesibilidad.
4. Busca el código fuente de una página real — ¿tiene meta keywords? ¿Tiene algún efecto real si lo tiene?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Fuentes de esta lección",
  "recursos": [
    {
      "titulo": "SEO Starter Guide",
      "descripcion": "La guía oficial de Google Search Central, con los mitos de SEO desmentidos directamente por la fuente: meta keywords, recuento de palabras, E-E-A-T como factor de ranking.",
      "url": "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      "etiqueta": "Google Search Central"
    },
    {
      "titulo": "Meta tags que Google soporta",
      "descripcion": "La lista oficial de qué etiquetas meta y link usa Google de verdad, y cuáles no tienen ningún efecto pese a seguir circulando.",
      "url": "https://developers.google.com/search/docs/crawling-indexing/special-tags",
      "etiqueta": "Google Search Central"
    }
  ]
}
```
