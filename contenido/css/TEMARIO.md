# Temario de CSS — planteado desde cero

**Alcance:** temario completo de una tecnología "CSS" nueva en el catálogo,
hermana de `contenido/html/TEMARIO.md`. Mismo criterio de fondo: nada de
memoria, todo verificado en vivo (`WebFetch`/`WebSearch`) el 2026-08-27.
No existe ninguna lección de CSS en producción todavía — este documento
es el plan a aprobar antes de escribir la primera.

**De dónde sale el contenido — misma pareja de fuentes que HTML, más una
tercera puntual donde aporta algo real:**

- **[MDN Learn web development — CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)**
  (Mozilla), repartido en tres módulos reales que ya existen así en su
  propio índice: *CSS styling basics*, *CSS text styling* y *CSS
  layout*. Fuente principal de la mayoría de lecciones, igual que en
  HTML.
- **[web.dev — Learn CSS](https://web.dev/learn/css)** (Google), un
  curso de 39 capítulos bastante más volcado en CSS moderno (nesting,
  custom properties, container queries, cascade) que la ruta de
  aprendizaje de MDN — segunda fuente en casi todas las lecciones,
  igual que en HTML.
- **[WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)**
  (W3C/WAI), puntual, para la única lección con un criterio normativo
  real detrás (movimiento y `prefers-reduced-motion` — Success
  Criterion 2.3.3, nivel AAA, verificado directamente contra el texto
  de la norma, no contra un resumen de terceros).

Mismo criterio de desempate que en HTML: cuando dos fuentes discrepen
en un detalle, gana la más normativa. Mismo estilo narrativo propio
del proyecto, no el tono de referencia de ninguna de las tres fuentes.

## Convenciones compartidas con el temario de HTML

Todas las reglas de `contenido/html/TEMARIO.md` sobre cómo se escribe
una lección aplican igual aquí, sin reinventarlas — se resumen para que
este documento se pueda leer solo:

- **La plantilla de 7 secciones es un mínimo, no un techo.** `Qué es y
  para qué sirve` / `Cuándo lo usarías de verdad` / `Cómo se usa` /
  secciones propias cuando el tema tenga subtemas con peso real / `Lo
  que [X] no es` (opcional, solo en lecciones conceptuales con un
  malentendido real que desmontar) / `Errores típicos` / `Ejercicios` /
  `Para profundizar`.
- **Variedad de bloques real, no el mismo tipo repetido.** `callout`
  para "Cuándo lo usarías de verdad" (uno por punto), `mitos` para "Lo
  que X no es", `notas-clave` reservado casi siempre para "Errores
  típicos" (máximo uno por lección), `recursos` para "Para
  profundizar", `roles` para piezas con responsabilidades distintas en
  paralelo, `diagrama-etiqueta` para descomponer una sintaxis de una
  línea, `predice-el-resultado` para comportamiento no obvio,
  `comparador-antes-despues` **siempre que el resultado se pueda
  demostrar en vivo de verdad** (el sandbox del comparador bloquea
  scripts — nada de `autofocus` para forzar :focus, ver la lección 25
  de HTML como precedente del error).
- **En CSS específicamente, el comparador-antes-despues va a ser el
  bloque más frecuente de todo el temario** — a diferencia de HTML,
  aquí casi cada lección tiene un resultado visual real y verificable
  (un `display: flex`, un `border-radius`, una transición) que se
  puede mostrar en vivo sin necesidad de JavaScript. Priorizarlo sobre
  `codigo-anotado` cuando ambos apliquen igual de bien.
- **Cada bloque de código dentro de un `codigo-anotado` tiene que ser
  HTML** — el esquema Zod fija `lenguaje` a `"html"` en ese componente
  (ver `src/lib/laboratorio/schemas.ts`). Para CSS puro, la salida es
  un fence de Markdown normal (` ```css `), que sí se resalta bien vía
  `SafeMarkdown`/`CodigoResaltado` — nunca forzar CSS dentro de un
  `codigo-anotado`.
- **Nunca entidades HTML (`&lt;`, `&gt;`, `&amp;`) en headings ni en
  campos de texto plano de un bloque `laboratorio`** — ese texto se
  renderiza literal, sin pasar por Markdown. Ver el bug real y ya
  corregido de la lección 7 de HTML.
- Validar cada lección con el mismo pipeline ya en uso: JSON de cada
  bloque parseado y comprobado contra el Zod real, grep de entidades,
  `npx vitest run`, `npm run build` (nunca `tsc --noEmit` suelto —
  no comprueba nada con el `tsconfig.json` raíz de este proyecto),
  `npm run lint`, commit, borrador en producción vía Playwright,
  verificación visual en los dos temas sin errores de consola.

## Módulo 1 — Fundamentos de CSS

| # | Lección | Fuentes |
|---|---|---|
| 1 | ¿Qué es CSS y cómo se conecta a HTML? | [What is CSS?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/What_is_CSS) + [Getting started with CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started) (MDN) |
| 2 | Selectores básicos: elemento, clase, id y agrupados | [Basic CSS selectors (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Basic_selectors) + [Selectors (web.dev)](https://web.dev/learn/css/selectors) |
| 3 | Selectores de atributo | [Attribute selectors (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Attribute_selectors) |
| 4 | Pseudo-clases y pseudo-elementos | [Pseudo-classes and pseudo-elements (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements) + [Pseudo-classes (web.dev)](https://web.dev/learn/css/pseudo-classes) |
| 5 | Combinadores: descendiente, hijo directo y hermanos | [Combinators (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Combinators) |
| 6 | La cascada y la especificidad | [Handling conflicts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts) + [The cascade](https://web.dev/learn/css/the-cascade) + [Specificity (web.dev)](https://web.dev/learn/css/specificity) |
| 7 | Herencia: qué propiedades bajan solas y cuáles no | [Handling conflicts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts) + [Inheritance (web.dev)](https://web.dev/learn/css/inheritance) |
| 8 | Anidamiento nativo (CSS nesting) | [Using CSS nesting (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using) + [Nesting (web.dev)](https://web.dev/learn/css/nesting) |
| 9 | Capas de cascada (`@layer`) | [Cascade layers (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) |

## Módulo 2 — El modelo de caja

| # | Lección | Fuentes |
|---|---|---|
| 10 | El modelo de caja: content, padding, border, margin | [The box model (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model) + [Box model (web.dev)](https://web.dev/learn/css/box-model) |
| 11 | box-sizing: content-box frente a border-box | [The box model (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model) + [Box model (web.dev)](https://web.dev/learn/css/box-model) |
| 12 | Valores y unidades: absolutas, relativas y funciones modernas | [Values and units (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) + [Sizing units (web.dev)](https://web.dev/learn/css/sizing) |
| 13 | Tamaño de elementos: width/height, min/max y overflow | [Sizing items in CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Sizing) + [Overflowing content (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Overflow) + [Overflow (web.dev)](https://web.dev/learn/css/overflow) |

## Módulo 3 — Color, fondos y bordes

| # | Lección | Fuentes |
|---|---|---|
| 14 | Color en CSS: hex, rgb, hsl y los espacios de color modernos | [Color (web.dev)](https://web.dev/learn/css/color) |
| 15 | Fondos: colores, imágenes y gradientes | [Backgrounds and borders (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders) + [Backgrounds (web.dev)](https://web.dev/learn/css/backgrounds) |
| 16 | Bordes, border-radius y sombras | [Backgrounds and borders (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders) |
| 17 | Variables CSS (custom properties) | [Custom properties (web.dev)](https://web.dev/learn/css/custom-properties) |

## Módulo 4 — Texto y tipografía

| # | Lección | Fuentes |
|---|---|---|
| 18 | Fundamentos de texto: font-family, tamaño y peso | [Text and font fundamentals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals) + [Text and typography (web.dev)](https://web.dev/learn/css/typography) |
| 19 | Espaciado y alineación de texto | [Text and font fundamentals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals) + [Spacing (web.dev)](https://web.dev/learn/css/spacing) |
| 20 | Web fonts: @font-face y fuentes de terceros | [Web fonts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Web_fonts) |
| 21 | Estilizar listas | [Styling lists (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_lists) |
| 22 | Estilizar enlaces y sus estados | [Styling links (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_links) + [Pseudo-classes (web.dev)](https://web.dev/learn/css/pseudo-classes) |

## Módulo 5 — Layout

| # | Lección | Fuentes |
|---|---|---|
| 23 | El flujo normal y los valores de display | [Introduction to CSS layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Introduction) + [Layout (web.dev)](https://web.dev/learn/css/layout) |
| 24 | Posicionamiento: static, relative, absolute, fixed y sticky | [Positioning (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning) |
| 25 | Flexbox: el contenedor y sus ejes | [Flexbox (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) + [Flexbox (web.dev)](https://web.dev/learn/css/flexbox) |
| 26 | Flexbox: los elementos hijos | [Flexbox (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) + [Flexbox (web.dev)](https://web.dev/learn/css/flexbox) |
| 27 | CSS Grid: filas, columnas y áreas | [CSS grid layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids) + [Grid (web.dev)](https://web.dev/learn/css/grid) |
| 28 | CSS Grid: alineación y distribución | [CSS grid layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids) + [Grid (web.dev)](https://web.dev/learn/css/grid) |

## Módulo 6 — Diseño responsive

| # | Lección | Fuentes |
|---|---|---|
| 29 | Principios de diseño responsive y mobile-first | [Responsive web design (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) |
| 30 | Media queries | [Media queries (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries) |
| 31 | Container queries | [CSS container queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) + [Container queries (web.dev)](https://web.dev/learn/css/container-queries) |
| 32 | Funciones responsivas: clamp, min y max | [Functions (web.dev)](https://web.dev/learn/css/functions) + [Values and units (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) |

## Módulo 7 — Movimiento e interactividad

| # | Lección | Fuentes |
|---|---|---|
| 33 | Transformaciones: translate, rotate y scale | [Using CSS transforms (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms) |
| 34 | Transiciones | [Transitions (web.dev)](https://web.dev/learn/css/transitions) |
| 35 | Animaciones con @keyframes | [Animations (web.dev)](https://web.dev/learn/css/animations) |
| 36 | Movimiento respetuoso: prefers-reduced-motion | [WCAG 2.2 — 2.3.3 Animation from Interactions (W3C/WAI)](https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=233#animation-from-interactions), nivel AAA |

## Módulo 8 — Calidad y organización

| # | Lección | Fuentes |
|---|---|---|
| 37 | Depurar CSS con DevTools | [Debugging CSS (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Debugging_CSS) |
| 38 | Organizar CSS a escala: metodologías y buenas prácticas | [Organizing your CSS (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing) |

---

## Notas de alcance

- **38 lecciones, 8 módulos.** Un poco más grande que el temario de
  HTML (31) porque CSS tiene más superficie real: MDN ya reparte su
  ruta de aprendizaje en tres módulos completos (fundamentos de
  estilo, texto, layout) donde HTML solo necesitaba un módulo por
  bloque temático equivalente. Igual que en HTML, es un punto de
  partida — puede crecer si al escribir aparece un hueco real, no un
  número cerrado a priori.
- **Deliberadamente fuera de este temario, con la misma lógica que
  HTML excluyó JavaScript:** anchor positioning, view transitions,
  blend modes, filtros, `clip-path`/masking avanzado, contadores CSS,
  `cursor`/`pointer-events`, hojas de estilo de impresión, CSS
  Houdini, y preprocesadores (Sass) más allá de la mención de pasada
  que ya hace el propio artículo de MDN sobre organización. Son las 22
  entradas más avanzadas del índice de 39 capítulos de web.dev que no
  tienen equivalente en la ruta "Core" de MDN — material real, pero de
  una segunda tanda, no de una introducción completa a CSS.
- **`popover` y el `::backdrop` de `<dialog>` no se repiten aquí** —
  ya están cubiertos desde el lado de HTML en la lección 22
  (`dialog: modales nativos con backdrop y sin JavaScript`). Si en
  algún momento hiciera falta profundizar en el `::backdrop` como
  selector CSS puro, iría en el módulo 3 o 7, no como lección nueva de
  entrada.
- **Sin lección dedicada a accesibilidad de color/contraste como tal**
  — el contraste de color ya está tratado desde HTML de forma
  transversal (`specs/design-system.md` principio 3) y volverá a
  aparecer con más peso normativo si en el futuro se construye un
  temario de "Accesibilidad" independiente de una tecnología concreta,
  en vez de duplicarlo aquí solo por completismo.
