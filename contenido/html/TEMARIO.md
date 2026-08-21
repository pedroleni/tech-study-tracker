# Temario de HTML — planteado desde cero

**Alcance:** temario completo de la tecnología "HTML", pensado desde
cero (2026-08-21) sin dar por buenas las 3 lecciones que ya existen en
producción ("Pruebas", "La estructura de una página", "Lo mínimo que
el navegador necesita para funcionar") — se reescriben también, siguen
este temario igual que cualquier lección nueva.

**De dónde sale el contenido — tres fuentes independientes, no una
sola.** La primera versión de este documento citaba casi solo MDN.
Reescrito 2026-08-21 para que cada lección tenga al menos dos fuentes
reales de instituciones distintas — no dos artículos del mismo sitio
con nombres distintos:

- **[MDN Learn web
  development](https://developer.mozilla.org/en-US/docs/Learn_web_development)**
  (Mozilla) — referencia técnica de HTML más citada de la industria,
  gratuita, la que ya seguisteis de facto en las 2 lecciones piloto.
  Sigue siendo la fuente principal de la mayoría de lecciones por eso.
- **[web.dev — Learn HTML](https://web.dev/learn/html) / [Learn
  Forms](https://web.dev/learn/forms)** (Google) — curso estructurado
  independiente de Mozilla, con más profundidad práctica en imágenes,
  formularios y rendimiento que el equivalente de MDN. Segunda fuente
  en casi todas las lecciones de este documento.
- **[WHATWG HTML Living
  Standard](https://html.spec.whatwg.org/)** (la especificación
  misma), **[Google Search
  Central](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)**
  (para la lección de SEO — quién mejor que el propio buscador para
  decir qué lee), **[WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)**
  y **[WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/)** (W3C/WAI),
  y **[WebAIM](https://webaim.org/)** — fuentes puntuales donde
  aportan algo que ni MDN ni web.dev cubren igual de bien (la norma
  legal de accesibilidad, patrones de componentes ARIA con ejemplos
  funcionales, o pruebas de tablas/formularios accesibles con casos
  reales).

Todas las URLs de abajo se verificaron en vivo (`WebFetch`/`WebSearch`)
el 2026-08-21 — ninguna es de memoria. Úsalas como referencia técnica
al escribir, no para copiar/traducir: el estilo narrativo propio de
este proyecto ("Qué es y para qué sirve" / "Cuándo lo usarías de
verdad" / "Errores típicos" / "Ejercicios") es más informal y con más
contexto de "por qué te importa esto en 2026" que el tono de
referencia de cualquiera de estas fuentes. Cuando dos fuentes discrepen
en un detalle, se prioriza la especificación (WHATWG/W3C) como
desempate — es la única de las tres que es normativa, no un tutorial.

**Plantilla de lección** (la que ya usan las 2 lecciones piloto —
mantenerla):

```
## Qué es y para qué sirve
## Cuándo lo usarías de verdad 👤
## Cómo se usa
## Errores típicos 👤
## Ejercicios
## Para profundizar
```

---

## Módulo 1 — Fundamentos del documento

**Ampliado 2026-08-21** — faltaba la lección más básica de todas: qué
es un elemento, qué es un atributo y por qué algunas etiquetas no se
cierran. Se detectó al preguntar directamente por la morfología de las
etiquetas — ni MDN ni web.dev la dejan implícita, las dos la tratan
como lección propia antes de entrar en `<!doctype>`. Va primera porque
todo el resto del temario asume que ya sabes leer una etiqueta.

| # | Lección | Fuentes |
|---|---|---|
| 1 | Anatomía de una etiqueta: elementos, atributos y por qué algunas se cierran solas | [Basic HTML syntax (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) + [Overview of HTML (web.dev)](https://web.dev/learn/html/overview) |
| 2 | Lo mínimo que el navegador necesita para funcionar (`<!doctype>`, `<html>`, `<head>`, `<body>`) | [Basic HTML syntax (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) + [Document structure (web.dev)](https://web.dev/learn/html/document-structure) |
| 3 | Qué va en el `<head>`: metadatos, `<title>`, favicon, enlaces a CSS | [What's in the head? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) + [Metadata (web.dev)](https://web.dev/learn/html/metadata) |
| 4 | La estructura de una página: `header`, `nav`, `main`, `footer` | [Structuring documents (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents) + [Semantic HTML (web.dev)](https://web.dev/learn/html/semantic-html) |

## Módulo 2 — Texto y contenido

| # | Lección | Fuentes |
|---|---|---|
| 5 | Encabezados y párrafos: la jerarquía del contenido | [Headings and paragraphs (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs) + [Headings and sections (web.dev)](https://web.dev/learn/html/headings-and-sections) |
| 6 | Énfasis e importancia: por qué `<strong>` no es solo "negrita" | [Emphasis and importance (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Emphasis_and_importance) + [Text basics (web.dev)](https://web.dev/learn/html/text-basics) |
| 7 | Listas: ordenadas, desordenadas y de descripción | [Lists (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists) + [Lists (web.dev)](https://web.dev/learn/html/lists) |
| 8 | Texto avanzado: citas, código, abreviaturas, datos de contacto | [Advanced text features (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Advanced_text_features) + [Text-level semantics (WHATWG spec)](https://html.spec.whatwg.org/multipage/text-level-semantics.html) para precisión de cuándo usar cada etiqueta |

## Módulo 3 — Enlaces

| # | Lección | Fuentes |
|---|---|---|
| 9 | Crear enlaces: rutas relativas/absolutas, `target`, `rel`, buenas prácticas | [Creating links (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links) + [Links (web.dev)](https://web.dev/learn/html/links) |

## Módulo 4 — Multimedia

| # | Lección | Fuentes |
|---|---|---|
| 10 | Imágenes: `<img>`, `alt`, `<figure>`/`<figcaption>`, formatos e imágenes responsive | [HTML images (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images) + [Images (web.dev)](https://web.dev/learn/html/images) — web.dev entra en formatos/rendimiento, MDN en la sintaxis base |
| 11 | Vídeo y audio: `<video>`, `<audio>`, subtítulos | [HTML video and audio (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio) + [Audio and Video (web.dev)](https://web.dev/learn/html/audio-video) |
| 12 | Gráficos vectoriales: SVG inline vs `<img src="*.svg">` | [Including vector graphics in HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Including_vector_graphics_in_HTML) + [especificación SVG 2 (W3C)](https://www.w3.org/TR/SVG2/) para lo normativo |
| 13 | Embeber contenido externo: `<iframe>`, `<embed>`, `<object>` | [From object to iframe (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/General_embedding_technologies) + [iframe, embed, object (WHATWG spec)](https://html.spec.whatwg.org/multipage/iframe-embed-object.html) |

## Módulo 5 — Tablas

| # | Lección | Fuentes |
|---|---|---|
| 14 | Tablas: filas, celdas, cabeceras, cómo no romperlas | [HTML table basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics) + [Tables (web.dev)](https://web.dev/learn/html/tables) |
| 15 | Accesibilidad en tablas: `caption`, `scope`, `thead`/`tbody`/`tfoot` | [HTML table accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility) + [Creating Accessible Tables — Data Tables (WebAIM)](https://webaim.org/techniques/tables/data) |

## Módulo 6 — Formularios

| # | Lección | Fuentes |
|---|---|---|
| 16 | Formularios: anatomía completa (`<form>`, `method`, `action`) | [Your first form (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form) + [Use forms to get data from users (web.dev Learn Forms)](https://web.dev/learn/forms/form-element) |
| 17 | Campos de formulario: tipos de `<input>` y cuándo usar cada uno | [The HTML5 input types (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/HTML5_input_types) + [Help users enter data in forms (web.dev Learn Forms)](https://web.dev/learn/forms/form-fields) |
| 18 | Validación nativa: `required`, `pattern`, mensajes del navegador | [Client-side form validation (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) + [Help users enter the right data in forms (web.dev Learn Forms)](https://web.dev/learn/forms/validation) |
| 19 | Formularios accesibles de verdad: `label`, `fieldset`/`legend` | [HTML: A good basis for accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) + [Accessibility (web.dev Learn Forms)](https://web.dev/learn/forms/accessibility) + [Creating Accessible Forms (WebAIM)](https://webaim.org/techniques/forms/) |

## Módulo 7 — Elementos interactivos nativos

**Nuevo 2026-08-21** — al cruzar el temario contra web.dev aparecieron
dos elementos que no estaban en ningún lado: `<details>`/`<summary>` y
`<dialog>`. Son HTML nativo, sin JavaScript, cada vez más usados en
producción — no tenerlos era un hueco real del temario, no solo de
fuentes.

| # | Lección | Fuentes |
|---|---|---|
| 20 | `<details>` y `<summary>`: desplegables nativos sin JavaScript | [Details and summary (web.dev)](https://web.dev/learn/html/details) + [referencia `<details>` (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) |
| 21 | `<dialog>`: modales nativos, `showModal()` y el backdrop gratis | [Dialog (web.dev)](https://web.dev/learn/html/dialog) + [referencia `<dialog>` (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) |

## Módulo 8 — Accesibilidad

**Ampliado 2026-08-21** — la primera versión de este temario metía
"HTML semántico" y "ARIA" como 2 lecciones que además reciclaban el
mismo artículo de MDN como fuente para las dos. Insuficiente para algo
que este proyecto ya trata como transversal (ver
`specs/design-system.md` principio 3). Cada lección tiene ahora fuentes
de instituciones distintas — MDN, W3C/WAI y WebAIM — para no depender
de un único punto de vista en el tema que más se presta a quedarse
corto si solo se copia un artículo.

| # | Lección | Fuentes |
|---|---|---|
| 22 | Qué es la accesibilidad y por qué te importa | [What is accessibility? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility) |
| 23 | HTML semántico: la base de la accesibilidad | [HTML: A good basis for accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) |
| 24 | Foco de teclado: `tabindex`, orden de tabulación, y por qué no quitarlo | [Focus (web.dev)](https://web.dev/learn/html/focus) + [WCAG 2.2 Quick Reference (W3C/WAI)](https://www.w3.org/WAI/WCAG22/quickref/), filtrado por los criterios de foco visible y orden de foco |
| 25 | WAI-ARIA: cuándo hace falta y cuándo es un parche mal puesto | [WAI-ARIA basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics) + [ARIA Authoring Practices Guide (W3C/WAI)](https://www.w3.org/WAI/ARIA/apg/) para patrones concretos (diálogos, tabs, menús) con ejemplos funcionales |
| 26 | Multimedia accesible: subtítulos, transcripciones, audiodescripción | [Accessible multimedia (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia) |
| 27 | Accesibilidad móvil y táctil: tamaño de objetivos, zoom, viewport | [Mobile accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Mobile) |
| 28 | Herramientas para probar accesibilidad de verdad: lector de pantalla, axe, Lighthouse | [Accessibility tooling and assistive technology (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Tooling) + [Web Accessibility Evaluation Guide (WebAIM)](https://webaim.org/articles/evaluationguide/) |

## Módulo 9 — Calidad

| # | Lección | Fuentes |
|---|---|---|
| 29 | Depurar HTML: DevTools, validador W3C, errores de anidamiento | [Debugging HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML) |
| 30 | HTML y SEO: qué lee de verdad un buscador | [SEO Starter Guide (Google Search Central)](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) + [Meta tags Google soporta (Google Search Central)](https://developers.google.com/search/docs/crawling-indexing/special-tags) — fuente principal ahora es Google, no MDN: para "qué lee un buscador" la autoridad es el propio buscador |

---

## Notas de alcance

- **30 lecciones, 9 módulos.** Empezó en 22, subió a 26 al ampliar
  accesibilidad de verdad, subió a 29 al añadir el módulo de elementos
  interactivos nativos y la lección de foco de teclado, subió a 30 al
  añadir "Anatomía de una etiqueta" como nueva lección 1 — todo por
  huecos reales encontrados al cruzar fuentes o al preguntar
  directamente por lo que faltaba, no por forzar ningún número. Las
  "~24 fichas" que se mencionaban de pasada en
  `specs/features/lecciones.md` al planear el modelo de datos nunca
  fueron un temario real, solo una estimación de orden de magnitud.
- **Fuera de este temario, a propósito:** todo lo que en los módulos de
  formularios/HTML de MDN y web.dev es CSS (`Styling web forms`,
  `Advanced form styling`, `Customizable select`, estilos de
  formulario en general) o JavaScript (`Sending forms through
  JavaScript`, `How to build custom form controls`, `HTML APIs`,
  `Template, slot, and shadow` — Web Components sin JS no tienen mucho
  sentido) — pertenece a las tecnologías CSS/JavaScript de este mismo
  catálogo cuando existan, no a HTML. Mismo criterio para "CSS and
  JavaScript accessibility best practices" del módulo de accesibilidad
  de MDN.
- Los "Test your skills"/"Challenge" de MDN y web.dev no se traducen en
  lecciones propias — se incorporan como preguntas dentro de la
  sección `## Ejercicios` de la lección correspondiente, igual que ya
  hacían las 2 lecciones piloto.
- Las 3 lecciones que ya existen en producción se sustituyen por las
  del módulo 1 correspondientes (y "Pruebas" se borra, es un
  placeholder) — no se ha tocado nada en producción todavía, esto es
  solo el plan.
