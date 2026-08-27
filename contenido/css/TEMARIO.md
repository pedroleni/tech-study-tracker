# Temario de CSS — planteado desde cero

**Alcance:** temario completo de una tecnología "CSS" nueva en el catálogo,
hermana de `contenido/html/TEMARIO.md`. Mismo criterio de fondo: nada de
memoria, todo verificado en vivo (`WebFetch`/`WebSearch`) el 2026-08-27.
No existe ninguna lección de CSS en producción todavía — este documento
es el plan a aprobar antes de escribir la primera.

**Ampliado 2026-08-27, mismo día de la primera versión**, tras feedback
directo de "hazlo más completo": la primera versión (38 lecciones) se
quedaba en la ruta "Core" de MDN más lo esencial de web.dev. Esta
versión añade el resto del curso de web.dev casi entero (anchor
positioning, view transitions, blend modes, filtros, masking,
contadores, subgrid, scroll-driven animations...) más media docena de
temas reales que no estaban en ninguna de las dos rutas pero sí en la
plataforma web actual: `:has()`, `aspect-ratio`/`object-fit`,
`color-mix()`, `@property`, rendimiento con `content-visibility`, y
hojas de estilo de impresión. Cada uno con su propia fuente verificada
en vivo, no una lista genérica.

**De dónde sale el contenido — misma pareja de fuentes que HTML, más
una tercera puntual, más las páginas de referencia de MDN cuando el
tema es demasiado nuevo para tener ya un tutorial "Learn" propio:**

- **[MDN Learn web development — CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics)**
  (Mozilla), repartido en los tres módulos reales de su propio índice:
  *CSS styling basics*, *CSS text styling* y *CSS layout*. Fuente
  principal de la mayoría de lecciones, igual que en HTML.
- **[web.dev — Learn CSS](https://web.dev/learn/css)** (Google), un
  curso de 39 capítulos con bastante más CSS moderno (nesting, custom
  properties, container queries, anchor positioning, view
  transitions...) que la ruta de aprendizaje de MDN — segunda fuente
  en casi todas las lecciones, y única fuente en varias de las nuevas.
- **[MDN CSS reference guides](https://developer.mozilla.org/en-US/docs/Web/CSS)**
  (`/Web/CSS/Guides/...`), puntual: para funciones y propiedades tan
  recientes que MDN todavía no les ha escrito un tutorial "Learn"
  propio (`:has()`, `color-mix()`, `@property`, subgrid, scroll snap,
  scroll-driven animations, contención/rendimiento), la página de
  referencia técnica de MDN sigue siendo más fiable que un tutorial de
  terceros.
- **[WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)**
  (W3C/WAI), puntual, para la única lección con un criterio normativo
  real detrás (movimiento y `prefers-reduced-motion` — Success
  Criterion 2.3.3, nivel AAA, verificado directamente contra el texto
  de la norma).

Mismo criterio de desempate que en HTML: cuando dos fuentes discrepen
en un detalle, gana la más normativa. Mismo estilo narrativo propio
del proyecto, no el tono de referencia de ninguna de las cuatro
fuentes.

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
  (un `display: flex`, un `border-radius`, una transición, un
  `filter`) que se puede mostrar en vivo sin necesidad de JavaScript.
  Priorizarlo sobre `codigo-anotado` cuando ambos apliquen igual de
  bien. Ojo con lo que SÍ necesita interacción real (`:hover`,
  `scroll-driven animations`, `anchor positioning` con popover): ahí
  el sandbox sin scripts no basta para demostrarlo en vivo — usar
  `codigo-anotado` con anotaciones que describan el comportamiento, no
  forzar un comparador que se quede mudo.
- **Cada bloque de código dentro de un `codigo-anotado` tiene que ser
  HTML** — el esquema Zod fija `lenguaje` a `"html"` en ese componente
  (ver `src/lib/laboratorio/schemas.ts`). Para CSS puro, la salida es
  un fence de Markdown normal (` ```css `), que sí se resalta bien vía
  `SafeMarkdown`/`CodigoResaltado` — nunca forzar CSS dentro de un
  `codigo-anotado`. En la práctica, la mayoría de lecciones de CSS
  necesitarán HTML mínimo + CSS real combinados dentro de un mismo
  `comparador-antes-despues` (que sí acepta el documento completo,
  `<style>` incluido, en su `antes`/`despues`) más un fence ` ```css `
  aparte cuando el bloque es solo la regla, sin HTML alrededor.
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
| 4 | Pseudo-clases: estados y condiciones | [Pseudo-classes and pseudo-elements (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements) + [Pseudo-classes (web.dev)](https://web.dev/learn/css/pseudo-classes) |
| 5 | Pseudo-elementos: partes generadas del elemento | [Pseudo-classes and pseudo-elements (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Pseudo_classes_and_elements) + [Pseudo-elements (web.dev)](https://web.dev/learn/css/pseudo-elements) |
| 6 | Combinadores: descendiente, hijo directo y hermanos | [Combinators (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Combinators) |
| 7 | :has(), el selector de padre que faltaba | [:has() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/:has) |
| 8 | La cascada y la especificidad | [Handling conflicts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts) + [The cascade](https://web.dev/learn/css/the-cascade) + [Specificity (web.dev)](https://web.dev/learn/css/specificity) |
| 9 | Herencia: qué propiedades bajan solas y cuáles no | [Handling conflicts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_conflicts) + [Inheritance (web.dev)](https://web.dev/learn/css/inheritance) |
| 10 | Anidamiento nativo (CSS nesting) | [Using CSS nesting (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting/Using) + [Nesting (web.dev)](https://web.dev/learn/css/nesting) |
| 11 | Capas de cascada (`@layer`) | [Cascade layers (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers) |

## Módulo 2 — El modelo de caja

| # | Lección | Fuentes |
|---|---|---|
| 12 | El modelo de caja: content, padding, border, margin | [The box model (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model) + [Box model (web.dev)](https://web.dev/learn/css/box-model) |
| 13 | box-sizing: content-box frente a border-box | [The box model (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model) + [Box model (web.dev)](https://web.dev/learn/css/box-model) |
| 14 | Valores y unidades: absolutas, relativas y funciones modernas | [Values and units (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) + [Sizing units (web.dev)](https://web.dev/learn/css/sizing) |
| 15 | Tamaño de elementos: width/height, min/max y overflow | [Sizing items in CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Sizing) + [Overflowing content (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Overflow) + [Overflow (web.dev)](https://web.dev/learn/css/overflow) |
| 16 | aspect-ratio y object-fit: controlar la proporción | [Understanding and setting aspect ratios (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_sizing/Aspect_ratios) |
| 17 | Propiedades lógicas y direcciones de escritura | [Handling different text directions (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Handling_different_text_directions) + [Logical properties (web.dev)](https://web.dev/learn/css/logical-properties) |

## Módulo 3 — Color, fondos y bordes

| # | Lección | Fuentes |
|---|---|---|
| 18 | Color en CSS: hex, rgb, hsl y los espacios modernos | [Color (web.dev)](https://web.dev/learn/css/color) |
| 19 | color-mix() y las funciones de color modernas | [color-mix() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) |
| 20 | Fondos: colores, imágenes y gradientes | [Backgrounds and borders (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders) + [Backgrounds (web.dev)](https://web.dev/learn/css/backgrounds) |
| 21 | Bordes, border-radius y sombras | [Backgrounds and borders (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Backgrounds_and_borders) + [Advanced styling effects (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects) |
| 22 | Variables CSS (custom properties) | [Custom properties (web.dev)](https://web.dev/learn/css/custom-properties) |
| 23 | @property: registrar custom properties con tipo | [@property (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property) |

## Módulo 4 — Texto y tipografía

| # | Lección | Fuentes |
|---|---|---|
| 24 | Fundamentos de texto: font-family, tamaño y peso | [Text and font fundamentals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals) + [Text and typography (web.dev)](https://web.dev/learn/css/typography) |
| 25 | Espaciado y alineación de texto | [Text and font fundamentals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals) + [Spacing (web.dev)](https://web.dev/learn/css/spacing) |
| 26 | Web fonts: @font-face y fuentes de terceros | [Web fonts (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Web_fonts) |
| 27 | Estilizar listas y sus marcadores | [Styling lists (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_lists) + [Lists (web.dev)](https://web.dev/learn/css/lists) |
| 28 | Contadores CSS: counter-reset y counter-increment | [Counters (web.dev)](https://web.dev/learn/css/counters) |
| 29 | Estilizar enlaces y sus estados | [Styling links (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Styling_links) + [Pseudo-classes (web.dev)](https://web.dev/learn/css/pseudo-classes) |

## Módulo 5 — Layout

| # | Lección | Fuentes |
|---|---|---|
| 30 | El flujo normal y los valores de display | [Introduction to CSS layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Introduction) + [Layout (web.dev)](https://web.dev/learn/css/layout) |
| 31 | Posicionamiento: static, relative, absolute, fixed y sticky | [Positioning (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning) |
| 32 | z-index y contextos de apilamiento | [Positioning (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Positioning) + [Stacking context (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context) — la página de Positioning no cubre contextos de apilamiento en profundidad, se añade la referencia dedicada |
| 33 | Flexbox: el contenedor y sus ejes | [Flexbox (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) + [Flexbox (web.dev)](https://web.dev/learn/css/flexbox) |
| 34 | Flexbox: los elementos hijos | [Flexbox (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox) + [Flexbox (web.dev)](https://web.dev/learn/css/flexbox) |
| 35 | CSS Grid: filas, columnas y áreas | [CSS grid layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids) + [Grid (web.dev)](https://web.dev/learn/css/grid) |
| 36 | CSS Grid: alineación y distribución | [CSS grid layout (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids) + [Grid (web.dev)](https://web.dev/learn/css/grid) |
| 37 | Subgrid: heredar la rejilla del padre | [Subgrid (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid) |
| 38 | Anchor positioning: anclar un elemento a otro sin JS | [Anchor positioning (web.dev)](https://web.dev/learn/css/anchor-positioning) |
| 39 | popover y ::backdrop, la vista desde CSS | [Popover and dialog (web.dev)](https://web.dev/learn/css/popover-and-dialog) — complementa, sin repetir, la lección 22 de HTML (`dialog`) |

## Módulo 6 — Diseño responsive

| # | Lección | Fuentes |
|---|---|---|
| 40 | Principios de diseño responsive y mobile-first | [Responsive web design (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) |
| 41 | Media queries | [Media queries (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Media_queries) |
| 42 | Container queries | [CSS container queries (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) + [Container queries (web.dev)](https://web.dev/learn/css/container-queries) |
| 43 | Funciones responsivas: clamp, min y max | [Functions (web.dev)](https://web.dev/learn/css/functions) + [Values and units (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) |

## Módulo 7 — Movimiento e interactividad

| # | Lección | Fuentes |
|---|---|---|
| 44 | Transformaciones: translate, rotate y scale | [Using CSS transforms (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms) |
| 45 | Transiciones | [Transitions (web.dev)](https://web.dev/learn/css/transitions) |
| 46 | Animaciones con @keyframes | [Animations (web.dev)](https://web.dev/learn/css/animations) |
| 47 | Movimiento respetuoso: prefers-reduced-motion | [WCAG 2.2 — 2.3.3 Animation from Interactions (W3C/WAI)](https://www.w3.org/WAI/WCAG22/quickref/?showtechniques=233#animation-from-interactions), nivel AAA + [prefers-reduced-motion (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) — WCAG define el requisito de accesibilidad, no la técnica CSS; se añade la referencia de MDN para la sintaxis real de @media |
| 48 | Scroll snap: paginar con CSS | [CSS scroll snap (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap) |
| 49 | Animaciones dirigidas por scroll | [CSS scroll-driven animations (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) |
| 50 | Cursores y estados de puntero | [Cursors and pointers (web.dev)](https://web.dev/learn/css/cursors-and-pointers) |

## Módulo 8 — Efectos visuales avanzados

| # | Lección | Fuentes |
|---|---|---|
| 51 | Filtros CSS (filter) | [Advanced styling effects (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects) + [Filters (web.dev)](https://web.dev/learn/css/filters) |
| 52 | Blend modes | [Advanced styling effects (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Advanced_styling_effects) + [Blend Modes (web.dev)](https://web.dev/learn/css/blend-modes) |
| 53 | Recortes y máscaras: clip-path, shapes y paths | [Paths, shapes, clipping, and masking (web.dev)](https://web.dev/learn/css/paths-shapes-clipping-masking) |
| 54 | View Transitions: transiciones entre vistas | [View Transitions for SPAs (web.dev)](https://web.dev/learn/css/view-transitions-spas) |

## Módulo 9 — Calidad, rendimiento y organización

| # | Lección | Fuentes |
|---|---|---|
| 55 | Depurar CSS con DevTools | [Debugging CSS (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Debugging_CSS) |
| 56 | Rendimiento CSS: containment y content-visibility | [CSS performance optimization (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS) + [Using CSS containment (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Using) |
| 57 | Hojas de estilo de impresión (@media print, @page) | [Printing (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing) |
| 58 | Organizar CSS a escala: metodologías y buenas prácticas | [Organizing your CSS (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing) |

---

## Notas de alcance

- **58 lecciones, 9 módulos.** Casi el doble del temario de HTML (31),
  y a propósito: CSS en 2026 ya no es solo cajas y flexbox — nesting,
  `:has()`, capas de cascada, container queries, anchor positioning y
  scroll-driven animations son parte real de lo que alguien necesita
  hoy, no curiosidades de laboratorio. Sigue siendo un punto de
  partida — puede crecer más si al escribir aparece un hueco real.
- **Deliberadamente fuera, con la misma lógica que HTML excluyó
  JavaScript:** CSS Houdini más allá de `@property` (el Paint API y el
  Layout API completos necesitan JS para registrarse, así que no
  encajan en un curso de solo HTML+CSS), CSS Grid masonry (todavía
  experimental, sin soporte amplio de navegadores — se añade en cuanto
  lo tenga), y los preprocesadores (Sass/Less) más allá de la mención
  de pasada que ya hace el propio artículo de MDN sobre organización,
  porque no son CSS nativo.
- **SVG estilizado con CSS no se repite aquí** — ya se cubrió el
  ángulo de "CSS externo no llega a un SVG referenciado por `img`,
  pero sí a uno inline" en la lección 13 de HTML, con una demostración
  en vivo. Si hiciera falta una lección específica de "SVG y CSS" más
  a fondo (paths animados, `stroke-dasharray`...), sería una ampliación
  futura de este mismo módulo 8, no una lección de entrada.
- **Sin lección dedicada a accesibilidad de color/contraste como tal**
  — ya está tratada de forma transversal desde HTML
  (`specs/design-system.md` principio 3) y la lección 47 de este
  temario (movimiento respetuoso) cubre el otro gran eje de
  accesibilidad que sí es específico de CSS. Un tercer eje dedicado
  solo a contraste tendría más sentido en un futuro temario de
  "Accesibilidad" transversal que aquí, por completismo.
- **popover y ::backdrop (lección 39) complementan, no repiten, la
  lección 22 de HTML.** Esa lección ya cubre `<dialog>`, `command`/
  `commandfor` y el `::backdrop` básico desde el lado del marcado; la
  39 de aquí profundiza en el atributo `popover` como API CSS-first
  (light-dismiss, `:popover-open`, animarlo con transiciones) que no
  necesita ni `<dialog>` ni JavaScript.
