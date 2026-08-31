# ¿Qué es HTML y para qué sirve?

- **Módulo:** Fundamentos del documento
- **Slug:** `que-es-html-y-para-que-sirve` (autogenerado del título)
- **Orden:** 2
- **Fuentes:** [Creating the content (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content) + [Overview of HTML (web.dev)](https://web.dev/learn/html/overview) — ver `contenido/html/TEMARIO.md` #1

---

## Qué es y para qué sirve

**HTML** (HyperText Markup Language) es un **lenguaje de marcado**, no un lenguaje de programación: no describe pasos ni lógica, describe qué es cada trozo de contenido. Un título es un título, un párrafo es un párrafo, una lista es una lista — HTML es el vocabulario que usas para decírselo al navegador envolviendo el contenido con etiquetas. Sin ese vocabulario, el navegador solo tiene texto plano, sin jerarquía, sin enlaces entre páginas, sin nada que le diga qué es más importante que qué.

Eso es literalmente lo que significa la H de HTML: *HyperText*, texto que enlaza con otro texto. No siempre fue el estándar consistente que es hoy:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Cómo llegó HTML hasta aquí",
  "items": [
    { "fecha": "1991", "titulo": "Tim Berners-Lee publica HTML", "texto": "Nace para conectar documentos entre sí — la H de HyperText. Ni siquiera había una especificación única: cada navegador interpretaba las etiquetas a su manera." },
    { "fecha": "Web 1.0 (años 90)", "titulo": "La web de solo lectura", "texto": "Páginas HTML estáticas pensadas para leer, no para interactuar — sin formularios ricos, sin contenido que cambiara sin recargar la página." },
    { "fecha": "Web 2.0 (desde 2004)", "titulo": "La web se vuelve interactiva", "texto": "Blogs, redes sociales, contenido creado por cualquiera. HTML tuvo que ampliarse — HTML5 trajo <video>, <canvas> y formularios más ricos — para dejar de ser solo un documento." },
    { "fecha": "Web 3.0", "titulo": "Un término todavía en disputa", "texto": "Para el W3C significa \"web semántica\": datos que las máquinas también puedan entender. En el uso más popular hoy, \"Web3\" se asocia a blockchain — un significado distinto, más de marketing que técnico." },
    { "fecha": "Hoy", "titulo": "Living standard del WHATWG", "texto": "Una especificación viva, con los navegadores grandes implicados directamente en su evolución — por eso hoy una etiqueta se comporta igual en Chrome, Firefox o Safari." }
  ]
}
```

Y hoy sigue siendo la base de cualquier página que visitas, incluidas las hechas con frameworks modernos (React, Vue, lo que sea): todos acaban generando HTML, porque es lo único que el navegador sabe leer de verdad.

HTML no trabaja solo. Verás esta idea repetida en casi todo el temario, así que conviene fijarla ya:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué en una página web",
  "roles": [
    { "etiqueta": "HTML", "rol": "Estructura", "descripcion": "\"Esto es un botón\"." },
    { "etiqueta": "CSS", "rol": "Presentación", "descripcion": "Decide de qué color y tamaño se ve ese botón." },
    { "etiqueta": "JavaScript", "rol": "Comportamiento", "descripcion": "Decide qué pasa cuando alguien hace clic en él." }
  ]
}
```

Puedes tener un HTML perfecto con un CSS horrible, o un HTML pésimo con un CSS espectacular por encima — son responsabilidades separadas a propósito, y mezclarlas es una de las fuentes de errores más comunes cuando se empieza.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "En cada página web que existe, sin excepción",
  "contenido": "Da igual si está hecha a mano, con WordPress o con el framework de moda: en algún punto del proceso, lo que llega al navegador es HTML. Es la única lengua que todos los navegadores entienden de forma nativa."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando te importa que el contenido sea accesible y encontrable",
  "contenido": "Los lectores de pantalla y los buscadores no \"ven\" el diseño visual, leen la estructura HTML. Un título marcado como <h1> le dice a ambos que es el título principal; el mismo texto en negrita sin esa etiqueta no dice nada de eso."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cuando trabajas con más gente en el mismo proyecto",
  "contenido": "HTML da nombres compartidos a las cosas — \"el encabezado\", \"el formulario\", \"la lista de productos\" — que diseño, desarrollo y contenido usan igual. Es el terreno común antes de que cada disciplina añada lo suyo."
}
```

## Cómo se usa

El mismo contenido, con y sin HTML — el mismo texto, pero solo uno de los dos comunica su propia estructura:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "Instrucciones para la vida: Come. Duerme. Repite.",
  "despues": "<p>Instrucciones para la vida:</p>\n<ul>\n  <li>Come</li>\n  <li>Duerme</li>\n  <li>Repite</li>\n</ul>",
  "nota": "Mismo contenido, con y sin HTML."
}
```

Sin etiquetas, el navegador ignora los saltos de línea y lo aplasta todo en una frase corrida — el texto no tiene ninguna estructura que respetar. Con HTML, el mismo contenido se convierte en un párrafo seguido de una lista real, con cada elemento separado y navegable.

```laboratorio
{
  "tipo": "codigo-anotado",
  "codigo": "<p>Instrucciones para la vida:</p>\n<ul>\n  <li>Come</li>\n  <li>Duerme</li>\n  <li>Repite</li>\n</ul>",
  "anotaciones": [
    { "fragmento": "<p>Instrucciones para la vida:</p>", "nota": "Un párrafo: HTML le dice al navegador que este texto es una unidad independiente, no una continuación de lo que venga después." },
    { "fragmento": "<ul>", "nota": "Una lista sin orden concreto: el contenido de dentro son elementos de la misma categoría, no pasos numerados que dependan de un orden." },
    { "fragmento": "<li>Come</li>", "nota": "Cada elemento de la lista va en su propia etiqueta — es lo que permite que un lector de pantalla anuncie 'lista de 3 elementos, elemento 1 de 3' en vez de leer todo seguido." }
  ]
}
```

## Lo que HTML NO es

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "HTML no es un lenguaje de programación",
      "realidad": "No tiene variables, ni bucles, ni condicionales — no le puedes decir \"si pasa esto, haz aquello\". Solo describe qué es cada trozo de contenido. Aprender HTML es el primer paso hacia programar, pero no es programar todavía."
    },
    {
      "mito": "HTML no es CSS",
      "realidad": "HTML dice qué es cada cosa (un título, una lista); CSS decide cómo se ve (colores, tamaños, disposición). Son dos lenguajes distintos con trabajos distintos, aunque en la práctica siempre vayan juntos."
    },
    {
      "mito": "HTML no es interactivo por sí mismo",
      "realidad": "Un botón de HTML no hace nada al pulsarlo hasta que JavaScript le dice qué hacer. HTML solo declara \"aquí hay un botón\" — el comportamiento es responsabilidad de otra tecnología."
    },
    {
      "mito": "HTML no \"se compila\" ni \"se ejecuta\" como un programa",
      "realidad": "El navegador lo lee (lo parsea) y construye directamente un árbol de elementos con él — no hay un paso previo de compilación como en un lenguaje de programación tradicional."
    }
  ]
}
```

## Errores típicos

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    { "titulo": "Creer que aprender HTML es 'aprender a programar'.", "texto": "Es una confusión muy extendida al empezar. HTML es el primer escalón — imprescindible — pero la lógica y la programación de verdad llegan con JavaScript, no con HTML." },
    { "titulo": "Meter la presentación dentro del HTML.", "texto": "Usar el atributo style o etiquetas antiguas pensadas solo para el aspecto visual mezcla dos responsabilidades que conviene mantener separadas: qué es el contenido (HTML) y cómo se ve (CSS)." },
    { "titulo": "Pensar que 'si se ve bien, el HTML está bien escrito'.", "texto": "Una página puede verse perfecta y tener una estructura HTML pésima por debajo — mal indexable para buscadores, inaccesible para lectores de pantalla. El aspecto visual y la calidad del HTML son cosas distintas." }
  ]
}
```

## Ejercicios

1. Abre cualquier página web y mira su código fuente: clic derecho → "Ver código fuente de la página", o el atajo de tu navegador (`Ctrl` + `U` en Windows/Linux; en Mac es `Cmd` + `Opción` + `U` en Chrome, o `Cmd` + `U` en Safari/Firefox). Busca tres etiquetas que reconozcas y anota qué contenido envuelve cada una.
2. Escribe, sin usar ninguna etiqueta, el texto de una receta de cocina (un título y una lista de pasos) tal cual lo pegarías en un bloc de notas plano. Después reescríbelo usando las etiquetas de esta lección. Abre las dos versiones en el navegador y compara qué se ve.
3. Explica en dos frases, con tus propias palabras y sin tecnicismos, la diferencia entre HTML, CSS y JavaScript a alguien que no sabe nada de desarrollo web.

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Pruébalo tú",
  "consigna": "Escribe el ejercicio 2 aquí mismo: primero el texto de la receta sin ninguna etiqueta, tal cual en un bloc de notas. Míralo en la vista previa, bórralo y reescríbelo con las etiquetas de esta lección.",
  "html": "Receta de tortilla de patatas\n\nIngredientes: patatas, huevos, cebolla, sal\n\nPasos\n1. Pela y corta las patatas\n2. Fríelas a fuego lento\n3. Bate los huevos\n4. Mezcla todo y cuaja la tortilla",
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
      "titulo": "Creating the content",
      "descripcion": "El artículo de MDN que sirvió de base para esta lección: qué es HTML y cómo se crea el primer documento, con ejemplos paso a paso.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Overview of HTML",
      "descripcion": "El resumen de web.dev sobre qué es HTML y cómo estructura el contenido — la segunda fuente de esta lección.",
      "url": "https://web.dev/learn/html/overview",
      "etiqueta": "web.dev"
    }
  ]
}
```
