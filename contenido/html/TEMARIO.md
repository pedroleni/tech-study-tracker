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

**Plantilla de lección — es un mínimo, no un techo (aclarado
2026-08-26 tras feedback directo: "no te cierres a una estructura,
esa estructura es una estructura mínima pero puedes y debes añadir
mucha más info").** Toda lección lleva como mínimo estas secciones:

```
## Qué es y para qué sirve
## Cuándo lo usarías de verdad
## Cómo se usa
## Lo que [X] NO es   (opcional, ver nota abajo)
## Errores típicos
## Ejercicios
## Para profundizar
```

Pero cuando el tema tiene varios subtemas reales con peso propio, van
como secciones `##` propias entre "Cómo se usa" y "Lo que [X] NO es"
— no todo tiene que aplastarse dentro de "Cómo se usa" a base de
apilar bloques. La lección 4 (el head) es el ejemplo: además de las
7 secciones mínimas, tiene "El título: más que un texto en la
pestaña", "La meta description: tu anuncio en los buscadores" y
"Cómo se ve tu enlace al compartirlo: Open Graph" como secciones
propias, con sus propios bloques y su propia fuente citada cuando
hace falta una específica (ogp.me para Open Graph, además de MDN y
web.dev). El límite real no es la plantilla, es que cada bloque
aporte algo que la prosa sola no daría — variedad de tipos de bloque
primero, no repetir el mismo dos veces sin motivo.

"Cuándo lo usarías de verdad" y "Errores típicos" son las secciones que
el autor tiene que escribir sí o sí — no existen en la documentación
oficial y son las que justifican que la ficha exista (antes se
marcaban con un emoji 👤 al final del título; se quitó 2026-08-23
porque acabó renderizándose tal cual en la página publicada, que no
era la intención — era una nota solo para quien escribe, no para
quien lee).

**Sección opcional "Lo que [X] no es"** — añadida 2026-08-21 tras
feedback directo de que las lecciones se quedaban cortas en teoría.
Solo tiene sentido en lecciones conceptuales (qué es HTML, qué es la
accesibilidad, WAI-ARIA) donde el principal obstáculo real de un
principiante es un malentendido concreto (confundir HTML con un
lenguaje de programación, con CSS, o pensar que "hace cosas" por sí
solo) — no en lecciones de sintaxis pura (listas, tablas) donde no
aporta nada. Se usa igual de oportunista que `comparador-antes-despues`
o `predice-el-resultado`: no en todas las lecciones, solo donde hay un
malentendido real que desmontar.

**Nuevo tipo de bloque 2026-08-22: `diagrama-etiqueta`** — descompone
una etiqueta de una sola línea en sus partes (apertura, nombre/valor
de atributo, contenido, cierre) con chips de color y leyenda, en vez
de las anotaciones de `codigo-anotado` (que solo resaltan la línea
entera, inútil cuando toda la etiqueta cabe en una línea). Usarlo en
cualquier lección futura que necesite descomponer visualmente una
sintaxis de una línea — `<form action="" method="">`, un `<input
type="">`, etc. — no solo en "Anatomía de una etiqueta". Ver
`specs/features/laboratorios.md`.

**Regla de variedad 2026-08-22: máximo 1 `notas-clave` por lección.**
Las dos primeras lecciones metían `notas-clave` en "Cuándo lo usarías
de verdad", en "Lo que [X] no es" Y en "Errores típicos" — 3 veces el
mismo componente en una sola página. Feedback directo: "repites mucho
este componente". Primer intento — pasar esas dos secciones a prosa
plana — fue corregido también por feedback directo: "no es que lo
quitases y no pusieras ninguno, quiero que te replantees cuál utilizar
que lo sustituya". Regla final desde 2026-08-22:

- **`notas-clave` se reserva casi siempre para "Errores típicos"**, que
  es una lista real de gotchas independientes entre sí — el único caso
  donde agrupar todo en una tarjeta numerada tiene sentido.
- **"Cuándo lo usarías de verdad" usa `callout`**, uno por punto (no
  agrupados en una sola tarjeta): cada escenario es su propio aviso
  suelto, con su propia `variante` (`info` para contexto neutro,
  `aviso` para algo que conviene no pasar por alto). Visualmente
  distinto de `notas-clave` — asides independientes en vez de una lista
  dentro de una tarjeta — así que usarlo ahí no cuenta como "repetir el
  mismo componente".
- **"Lo que [X] no es" usa `mitos`** (desde 2026-08-23; antes usaba
  `callout` uno por punto, pero 4 avisos idénticos apilados volvió a
  leerse como el mismo componente repetido — feedback directo: "haz
  algo más visual estilo cartas 3D"). Cada malentendido es
  `{mito, realidad}`: el mito como titular en la cara frontal de una
  tarjeta, la realidad revelada al voltearla.
- Con 10 tipos de bloque disponibles (`predice-el-resultado`,
  `codigo-anotado`, `comparador-antes-despues`, `notas-clave`,
  `diagrama-etiqueta`, `callout`, `linea-de-tiempo`, `roles`,
  `recursos`, `mitos`), cada lección debería usar al menos 3 tipos
  distintos, no el mismo repetido. `linea-de-tiempo` para contexto
  histórico/evolutivo; `roles` para 2-4 piezas con responsabilidades
  distintas mostradas en paralelo (ni lista agrupada como
  `notas-clave`, ni orden cronológico como `linea-de-tiempo`);
  `recursos` para "Para profundizar" (sustituye la lista plana
  `- [texto](url)` de las 2 primeras lecciones); `mitos` para "Lo que
  [X] no es" (sustituye los `callout` apilados de las 2 primeras
  lecciones). Antes de escribir una
  lección, pensar qué
  tipo encaja mejor con CADA sección en vez de reutilizar el último que
  se usó — y nunca "quitar el bloque y dejar
  prosa" como solución por defecto a la repetición.

## Módulo 1 — Fundamentos del documento

**Ampliado 2026-08-21, dos veces.** Primero al añadir "Anatomía de una
etiqueta" (elemento, atributo, por qué algunas etiquetas no se cierran)
al preguntar directamente por la morfología de las etiquetas. Después,
tras feedback de que la lección de anatomía explicaba qué es una
etiqueta sin haber explicado antes qué es HTML — hueco real: la propia
ruta de MDN mete un artículo dedicado a "qué es HTML y para qué sirve"
(`Getting_started/Your_first_website/Creating_the_content`) *antes* del
módulo de sintaxis del que veníamos citando, y web.dev abre su resumen
de HTML con el mismo encuadre. Ahora el módulo va de lo más abstracto
(qué es HTML) a lo más concreto (cómo se escribe una etiqueta) antes de
entrar en el documento mínimo.

| # | Lección | Fuentes |
|---|---|---|
| 1 | ¿Qué es HTML y para qué sirve? | [Creating the content (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content) + [Overview of HTML (web.dev)](https://web.dev/learn/html/overview) |
| 2 | Anatomía de una etiqueta: elementos, atributos y por qué algunas se cierran solas | [Basic HTML syntax (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) + [Overview of HTML (web.dev)](https://web.dev/learn/html/overview) |
| 3 | Lo mínimo que el navegador necesita para funcionar (`<!doctype>`, `<html>`, `<head>`, `<body>`) | [Basic HTML syntax (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax) + [Document structure (web.dev)](https://web.dev/learn/html/document-structure) |
| 4 | Qué va en el `<head>`: metadatos, `<title>`, favicon, enlaces a CSS | [What's in the head? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata) + [Metadata (web.dev)](https://web.dev/learn/html/metadata) |
| 5 | La estructura de una página: `header`, `nav`, `main`, `footer` | [Structuring documents (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Structuring_documents) + [Semantic HTML (web.dev)](https://web.dev/learn/html/semantic-html) |

## Módulo 2 — Texto y contenido

| # | Lección | Fuentes |
|---|---|---|
| 6 | Encabezados y párrafos: la jerarquía del contenido | [Headings and paragraphs (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs) + [Headings and sections (web.dev)](https://web.dev/learn/html/headings-and-sections) |
| 7 | Énfasis e importancia: por qué `<strong>` no es solo "negrita" | [Emphasis and importance (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Emphasis_and_importance) + [Text basics (web.dev)](https://web.dev/learn/html/text-basics) |
| 8 | Listas: ordenadas, desordenadas y de descripción | [Lists (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists) + [Lists (web.dev)](https://web.dev/learn/html/lists) |
| 9 | Texto avanzado: citas, código, abreviaturas, datos de contacto | [Advanced text features (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Advanced_text_features) + [Text-level semantics (WHATWG spec)](https://html.spec.whatwg.org/multipage/text-level-semantics.html) para precisión de cuándo usar cada etiqueta |

## Módulo 3 — Enlaces

| # | Lección | Fuentes |
|---|---|---|
| 10 | Crear enlaces: rutas relativas/absolutas, `target`, `rel`, buenas prácticas | [Creating links (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links) + [Links (web.dev)](https://web.dev/learn/html/links) |

## Módulo 4 — Multimedia

| # | Lección | Fuentes |
|---|---|---|
| 11 | Imágenes: `<img>`, `alt`, `<figure>`/`<figcaption>`, formatos e imágenes responsive | [HTML images (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images) + [Images (web.dev)](https://web.dev/learn/html/images) — web.dev entra en formatos/rendimiento, MDN en la sintaxis base |
| 12 | Vídeo y audio: `<video>`, `<audio>`, subtítulos | [HTML video and audio (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_video_and_audio) + [Audio and Video (web.dev)](https://web.dev/learn/html/audio-video) |
| 13 | Gráficos vectoriales: SVG inline vs `<img src="*.svg">` | [Including vector graphics in HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Including_vector_graphics_in_HTML) + [especificación SVG 2 (W3C)](https://www.w3.org/TR/SVG2/) para lo normativo |
| 14 | Embeber contenido externo: `<iframe>`, `<embed>`, `<object>` | [From object to iframe (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/General_embedding_technologies) + [iframe, embed, object (WHATWG spec)](https://html.spec.whatwg.org/multipage/iframe-embed-object.html) |

## Módulo 5 — Tablas

| # | Lección | Fuentes |
|---|---|---|
| 15 | Tablas: filas, celdas, cabeceras, cómo no romperlas | [HTML table basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics) + [Tables (web.dev)](https://web.dev/learn/html/tables) |
| 16 | Accesibilidad en tablas: `caption`, `scope`, `thead`/`tbody`/`tfoot` | [HTML table accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility) + [Creating Accessible Tables — Data Tables (WebAIM)](https://webaim.org/techniques/tables/data) |

## Módulo 6 — Formularios

| # | Lección | Fuentes |
|---|---|---|
| 17 | Formularios: anatomía completa (`<form>`, `method`, `action`) | [Your first form (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form) + [Use forms to get data from users (web.dev Learn Forms)](https://web.dev/learn/forms/form-element) |
| 18 | Campos de formulario: tipos de `<input>` y cuándo usar cada uno | [The HTML5 input types (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/HTML5_input_types) + [Help users enter data in forms (web.dev Learn Forms)](https://web.dev/learn/forms/form-fields) |
| 19 | Validación nativa: `required`, `pattern`, mensajes del navegador | [Client-side form validation (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) + [Help users enter the right data in forms (web.dev Learn Forms)](https://web.dev/learn/forms/validation) |
| 20 | Formularios accesibles de verdad: `label`, `fieldset`/`legend` | [HTML: A good basis for accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) + [Accessibility (web.dev Learn Forms)](https://web.dev/learn/forms/accessibility) + [Creating Accessible Forms (WebAIM)](https://webaim.org/techniques/forms/) |

## Módulo 7 — Elementos interactivos nativos

**Nuevo 2026-08-21** — al cruzar el temario contra web.dev aparecieron
dos elementos que no estaban en ningún lado: `<details>`/`<summary>` y
`<dialog>`. Son HTML nativo, sin JavaScript, cada vez más usados en
producción — no tenerlos era un hueco real del temario, no solo de
fuentes.

| # | Lección | Fuentes |
|---|---|---|
| 21 | `<details>` y `<summary>`: desplegables nativos sin JavaScript | [Details and summary (web.dev)](https://web.dev/learn/html/details) + [referencia `<details>` (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) |
| 22 | `<dialog>`: modales nativos, `showModal()` y el backdrop gratis | [Dialog (web.dev)](https://web.dev/learn/html/dialog) + [referencia `<dialog>` (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) |

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
| 23 | Qué es la accesibilidad y por qué te importa | [What is accessibility? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility) |
| 24 | HTML semántico: la base de la accesibilidad | [HTML: A good basis for accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML) |
| 25 | Foco de teclado: `tabindex`, orden de tabulación, y por qué no quitarlo | [Focus (web.dev)](https://web.dev/learn/html/focus) + [WCAG 2.2 Quick Reference (W3C/WAI)](https://www.w3.org/WAI/WCAG22/quickref/), filtrado por los criterios de foco visible y orden de foco |
| 26 | WAI-ARIA: cuándo hace falta y cuándo es un parche mal puesto | [WAI-ARIA basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/WAI-ARIA_basics) + [ARIA Authoring Practices Guide (W3C/WAI)](https://www.w3.org/WAI/ARIA/apg/) para patrones concretos (diálogos, tabs, menús) con ejemplos funcionales |
| 27 | Multimedia accesible: subtítulos, transcripciones, audiodescripción | [Accessible multimedia (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Multimedia) |
| 28 | Accesibilidad móvil y táctil: tamaño de objetivos, zoom, viewport | [Mobile accessibility (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Mobile) |
| 29 | Herramientas para probar accesibilidad de verdad: lector de pantalla, axe, Lighthouse | [Accessibility tooling and assistive technology (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/Tooling) + [Web Accessibility Evaluation Guide (WebAIM)](https://webaim.org/articles/evaluationguide/) |

## Módulo 9 — Calidad

| # | Lección | Fuentes |
|---|---|---|
| 30 | Depurar HTML: DevTools, validador W3C, errores de anidamiento | [Debugging HTML (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML) |
| 31 | HTML y SEO: qué lee de verdad un buscador | [SEO Starter Guide (Google Search Central)](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) + [Meta tags Google soporta (Google Search Central)](https://developers.google.com/search/docs/crawling-indexing/special-tags) — fuente principal ahora es Google, no MDN: para "qué lee un buscador" la autoridad es el propio buscador |

---

## Módulo 10 — Proyectos

**Añadido 2026-08-29**, junto al mecanismo `editor-en-vivo`
(`specs/features/editor-en-vivo.md`): pedido explícito de "hacer más
prácticas las lecciones... proyectos". Cuatro lecciones-proyecto reales,
marcadas `es_proyecto` (aparecen también en `/proyectos`), cada una
guiada paso a paso con varios bloques `editor-en-vivo` que construyen
hacia un resultado final, en vez del formato ficha habitual — ver la
plantilla propia al principio de cada archivo `32-35`.

| # | Lección | Requiere |
|---|---|---|
| 32 | Proyecto: tarjeta de perfil personal | Módulos 1-2, lección 11 (imágenes) |
| 33 | Proyecto: página de aterrizaje de un solo scroll, 100% semántica | Módulo 1, lección 5, lección 10 |
| 34 | Proyecto: formulario de contacto accesible de verdad | Módulo 6, lecciones 19-20 |
| 35 | Proyecto: ficha de producto con tabla de especificaciones | Lección 11, módulo 5, lección 16 |

## Notas de alcance

- **35 lecciones, 10 módulos.** Empezó en 22, subió a 26 al ampliar
  accesibilidad de verdad, subió a 29 al añadir el módulo de elementos
  interactivos nativos y la lección de foco de teclado, subió a 30 al
  añadir "Anatomía de una etiqueta", subió a 31 al añadir "¿Qué es HTML
  y para qué sirve?" delante de esa, subió a 35 al añadir el módulo 10
  de Proyectos (2026-08-29) — todo por huecos reales encontrados al
  cruzar fuentes o al preguntar directamente por lo que faltaba, no por
  forzar ningún número. Las "~24 fichas" que se mencionaban de pasada en
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
