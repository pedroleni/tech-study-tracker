# Temario de JavaScript — planteado desde cero

**Alcance:** temario completo de una tecnología "JavaScript" nueva en
el catálogo, hermana de `contenido/html/TEMARIO.md` y
`contenido/css/TEMARIO.md`. Mismo criterio de fondo: nada de memoria,
todo verificado en vivo (`WebFetch`/`WebSearch`) el 2026-08-27. No
existe ninguna lección de JavaScript en producción todavía — este
documento es el plan a aprobar antes de escribir la primera.

**De dónde sale el contenido — misma lógica de dos fuentes principales
más referencias puntuales que HTML y CSS, adaptada a que JavaScript es
un lenguaje de programación completo, no solo marcado o estilo:**

- **[MDN Learn web development — JavaScript](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting)**
  (Mozilla), repartido en varios módulos reales de su propio índice:
  *Core/Scripting* (fundamentos: variables, tipos, funciones, eventos,
  objetos básicos, DOM scripting, peticiones de red, depuración),
  *Extensions/Async_JS* (asincronía: promesas, workers), y
  *Extensions/Client-side_APIs* (APIs del navegador: audio/vídeo,
  canvas, almacenamiento, APIs de terceros). Fuente principal de la
  mayoría de lecciones, igual que en HTML y CSS.
- **[web.dev — Learn JavaScript](https://web.dev/learn/javascript)**
  (Google, escrito por Mat Marquis), un curso de 28 capítulos centrado
  en la MECÁNICA del lenguaje con más profundidad que MDN Learn: tipos
  de datos uno por uno (number, string, boolean, null/undefined,
  BigInt, Symbol), funciones (expresiones, `new`, `return`, `this`),
  objetos (property accessors, property descriptors, herencia
  prototípica), colecciones indexadas y con clave, y clases (extend,
  campos/métodos, bloques de inicialización estática). Segunda fuente
  en casi todas las lecciones de mecánica del lenguaje.
- **[MDN JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)**
  (`/Web/JavaScript/Guide/...`), tercera fuente con un rol parecido al
  de las páginas de referencia de CSS: para temas que ni MDN Learn ni
  web.dev cubren con suficiente profundidad — closures, promesas y
  `async`/`await`, iteradores y generadores, módulos ES
  (`import`/`export`), expresiones regulares, fechas, gestión de
  memoria. Es contenido de referencia, no un tutorial paso a paso, así
  que se usa como fuente técnica a reescribir con el estilo propio del
  proyecto, igual que las páginas `/Web/CSS/Guides/...` en CSS.
- **[MDN Web APIs reference](https://developer.mozilla.org/en-US/docs/Web/API)**
  y páginas de operadores recientes (`/Web/JavaScript/Reference/Operators/...`),
  puntual: Web Components (`Using_custom_elements`,
  `Using_shadow_DOM`, `Using_templates_and_slots`), Intersection
  Observer, Drag and Drop, optional chaining (`?.`) y nullish
  coalescing (`??`), campos privados de clase (`#`) — funciones
  concretas del navegador o sintaxis reciente sin tutorial "Learn"
  propio todavía, igual que CSS usó `/Web/CSS/Guides/...` para
  `:has()` o `@property`.

Todas las URLs de abajo se verificaron en vivo el 2026-08-27 —
ninguna es de memoria. Mismo criterio de desempate que en HTML/CSS:
cuando dos fuentes discrepen en un detalle, gana la más normativa (la
especificación ECMAScript, en última instancia, aunque no se cite
línea a línea salvo necesidad real).

## Convenciones compartidas con HTML y CSS, más una diferencia real

Todas las reglas de `contenido/html/TEMARIO.md` y
`contenido/css/TEMARIO.md` sobre cómo se escribe una lección aplican
igual aquí (plantilla de 7 secciones como mínimo no como techo,
variedad de bloques real, nunca entidades HTML en texto plano, mismo
pipeline de validación). Una diferencia importante que sí cambia el
reparto de bloques:

- **`comparador-antes-despues` deja de ser el protagonista.** Su
  sandbox bloquea scripts — sirve para mostrar dos ESTADOS finales de
  HTML/CSS, nunca para ejecutar JavaScript de verdad. En un temario de
  JavaScript, casi ninguna lección tiene un "antes" y un "después"
  puramente visual sin ejecutar código.
- **`predice-el-resultado` pasa a ser el bloque más frecuente.** Es la
  herramienta natural para JS: mostrar un fragmento de código real y
  preguntar qué produce (un valor, un error, un `console.log`
  concreto) sin necesitar ejecutarlo en vivo — el mismo patrón que ya
  se usó en CSS para comportamiento no obvio (especificidad, orden de
  `transform`), aquí generalizado a casi cada lección.
- **`codigo-anotado` sigue fijado a `lenguaje: "html"` por el esquema
  Zod** (`src/lib/laboratorio/schemas.ts`), igual que en CSS. Para
  JavaScript, esto significa envolver el código real en un documento
  HTML mínimo con un `<script>` — el mismo patrón que CSS usó
  envolviendo reglas en `<style>`. Nunca forzar `"javascript"` como
  valor de `lenguaje`, el esquema lo rechazaría.
- **`diagrama-etiqueta` gana peso aquí** para descomponer sintaxis
  densa propia del lenguaje (una promesa encadenada, una
  desestructuración con valores por defecto, una clase con campos
  privados) — más útil en JS que en CSS, donde la sintaxis por línea
  suele ser más simple.

## Componentes nuevos a considerar (diseño, sin implementar todavía)

Investigado 2026-08-27 contra el código real (`src/lib/laboratorio/schemas.ts`,
`src/components/bloques-laboratorio/`, `src/components/codigo/resaltador.ts`)
antes de proponer nada — no de memoria. Decisión tomada con el usuario:
quedan documentados aquí, se implementan cuando una lección concreta
los necesite de verdad, no en abstracto.

**Lo que ya funciona sin tocar nada:** el tokenizador tiene un modo
`'js'` completo y ya resalta el contenido de un `<script>` dentro de
HTML automáticamente (igual que hace con `<style>`→CSS) — así que
`codigo-anotado` y `comparador-antes-despues` ya muestran JS bien
coloreado en cuanto se envuelve en un `<script>`, sin ningún cambio de
esquema. `predice-el-resultado` ya cubre razonablemente bien "¿qué
imprime esto?" o "¿en qué orden se ejecuta esto?", sin necesitar
ejecución real.

**El límite que no tiene vuelta:** el iframe de
`comparador-antes-despues` usa `sandbox=""` (vacío, el más
restrictivo posible) — cero scripts, a propósito, una barrera de
seguridad deliberada. Cualquier diseño de aquí en adelante la respeta;
un REPL con JS ejecutándose de verdad sería un cambio de arquitectura
real (superficie nueva, aunque aislada) que necesitaría una decisión
explícita aparte, no algo a colar dentro de este temario.

Dos huecos reales encontrados, los dos deliberadamente **sin
ejecución real** — solo contenido autor-escrito, cero superficie de
seguridad nueva:

- **`traza-de-ejecucion`** — secuencia de pasos para closures,
  hoisting, recursión, o el orden pila-de-llamadas/cola de
  microtareas: cada paso destaca una línea del código y describe el
  estado (variables, profundidad de pila) en ese punto. Esquema
  aproximado: `{ tipo: 'traza-de-ejecucion', codigo: string, pasos:
  [{ fragmento: string, estado: string, nota?: string }] }` — mismo
  patrón de `fragmento` que ya usa `codigo-anotado` para localizar la
  línea, reutilizando esa lógica de búsqueda en el código.
- **`consola-simulada`** — código junto a una consola falsa con cada
  salida emparejada a la línea que la produce, en orden — clave para
  distinguir código síncrono de microtarea de macrotarea en
  asincronía. Esquema aproximado: `{ tipo: 'consola-simulada', codigo:
  string, salidas: [{ fragmento: string, salida: string, tipo?: 'log'
  | 'error' | 'warn' }] }`.

Ninguno de los dos está en `esquemaBloqueLaboratorio` todavía — no
son válidos hasta que se implementen de verdad.

## Módulo 1 — Fundamentos de JavaScript

| # | Lección | Fuentes |
|---|---|---|
| 1 | ¿Qué es JavaScript y cómo se conecta a HTML? | [What is JavaScript? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript) + [Introduction to JavaScript (web.dev)](https://web.dev/learn/javascript/introduction) |
| 2 | Primera toma de contacto: escribir y ejecutar código | [A first splash into JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/A_first_splash) |
| 3 | Qué ha ido mal: depurar los primeros errores | [What went wrong? Troubleshooting JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_went_wrong) |
| 4 | Variables: var, let y const | [Storing the information you need — Variables (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables) + [Variables (web.dev)](https://web.dev/learn/javascript/variables) |
| 5 | Tipos de datos primitivos: number, string y boolean | [Data types and structures (web.dev)](https://web.dev/learn/javascript/data-types) + [Numbers (web.dev)](https://web.dev/learn/javascript/numbers) + [Booleans (web.dev)](https://web.dev/learn/javascript/booleans) |
| 6 | null, undefined, BigInt y Symbol | [Null and undefined values (web.dev)](https://web.dev/learn/javascript/null-and-undefined) + [BigInt (web.dev)](https://web.dev/learn/javascript/bigint) + [Symbols (web.dev)](https://web.dev/learn/javascript/symbols) |
| 7 | Operadores y matemáticas básicas | [Basic math in JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Math) |
| 8 | Comparación de valores y coerción de tipos | [Comparison operators (web.dev)](https://web.dev/learn/javascript/comparison-operators) + [Equality comparisons and sameness (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness) |

## Módulo 2 — Cadenas de texto y control de flujo

| # | Lección | Fuentes |
|---|---|---|
| 9 | Cadenas de texto y template literals | [Handling text — strings in JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Strings) + [Strings (web.dev)](https://web.dev/learn/javascript/strings) |
| 10 | Métodos útiles de cadenas | [Useful string methods (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Useful_string_methods) |
| 11 | Condicionales: if/else y switch | [Making decisions in your code — conditionals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals) + [Control flow (web.dev)](https://web.dev/learn/javascript/control-flow) |
| 12 | El operador ternario y los operadores lógicos &&, \|\| y ?? | [Making decisions in your code — conditionals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals) + [Control flow (web.dev)](https://web.dev/learn/javascript/control-flow) |
| 13 | Bucles: for, while y do-while | [Looping code (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Loops) |
| 14 | for...of y for...in | [Loops and iteration (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) — la lección de MDN Learn no distingue en profundidad for...of de for...in; se añade la guía de referencia |
| 15 | Arrays: fundamentos | [Arrays (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Arrays) |

## Módulo 3 — Funciones

| # | Lección | Fuentes |
|---|---|---|
| 16 | Funciones: declaración, expresión y ámbito | [Functions — reusable blocks of code (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Functions) + [Introduction to functions (web.dev)](https://web.dev/learn/javascript/functions) |
| 17 | Construir tu propia función y valores de retorno | [Build your own function (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Build_your_own_function) + [Function return values (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Return_values) + [The "return" keyword (web.dev)](https://web.dev/learn/javascript/return-keyword) |
| 18 | Parámetros: valores por defecto, rest y arguments | [Functions (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) |
| 19 | Funciones flecha | [Function expressions (web.dev)](https://web.dev/learn/javascript/function-expressions) |
| 20 | this: cómo se determina y sus trampas | [The "this" keyword (web.dev)](https://web.dev/learn/javascript/this-keyword) |
| 21 | El operador new y las funciones constructoras | [The "new" keyword (web.dev)](https://web.dev/learn/javascript/new-keyword) |
| 22 | Hoisting: cómo se procesa realmente el código | [Grammar and types (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) |
| 23 | Closures (clausuras) | [Closures (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) |

## Módulo 4 — Objetos

| # | Lección | Fuentes |
|---|---|---|
| 24 | Objetos: fundamentos | [Object basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics) + [Introduction to objects (web.dev)](https://web.dev/learn/javascript/objects) |
| 25 | Property accessors: notación de punto y corchetes | [Property accessors (web.dev)](https://web.dev/learn/javascript/property-accessors) |
| 26 | Property descriptors: configurar propiedades a fondo, getters y setters | [Property descriptors (web.dev)](https://web.dev/learn/javascript/property-descriptors) |
| 27 | Prototipos y la herencia prototípica | [Prototypal inheritance (web.dev)](https://web.dev/learn/javascript/prototypal-inheritance) + [Inheritance and the prototype chain (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain) |
| 28 | Trabajar con objetos: copiar, comparar, congelar | [Working with objects (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects) |
| 29 | Desestructuración y spread/rest en objetos y arrays | [Grammar and types (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) |

## Módulo 5 — Arrays y colecciones a fondo

| # | Lección | Fuentes |
|---|---|---|
| 30 | Colecciones indexadas: métodos de array | [Indexed collections (web.dev)](https://web.dev/learn/javascript/indexed-collections) + [Indexed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) |
| 31 | Métodos funcionales: map, filter y reduce | [Indexed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) |
| 32 | Colecciones con clave: Map y Set | [Keyed collections (web.dev)](https://web.dev/learn/javascript/keyed-collections) + [Keyed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections) |
| 33 | JSON: serializar y parsear | [Working with JSON (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON) |

## Módulo 6 — Clases y programación orientada a objetos

| # | Lección | Fuentes |
|---|---|---|
| 34 | Introducción a las clases | [Introduction to classes (web.dev)](https://web.dev/learn/javascript/classes) + [Using classes (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes) |
| 35 | Herencia con extends y super | [Extend classes (web.dev)](https://web.dev/learn/javascript/extend-classes) |
| 36 | Campos y métodos de clase, encapsulación privada (#) | [Class fields and methods (web.dev)](https://web.dev/learn/javascript/class-fields) + [Private elements (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) |
| 37 | Bloques de inicialización estática | [Static initialization blocks (web.dev)](https://web.dev/learn/javascript/static-initialization-blocks) |

## Módulo 7 — El DOM

| # | Lección | Fuentes |
|---|---|---|
| 38 | Introducción al scripting del DOM | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) |
| 39 | El árbol DOM y cómo recorrerlo | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) |
| 40 | Seleccionar elementos: getElementById, querySelector y compañía | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) |
| 41 | Leer y modificar contenido, atributos y estilos | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) |
| 42 | Crear, insertar y eliminar nodos | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) + [Challenge: Image gallery (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Image_gallery) |
| 43 | Tamaño, posición y scroll de un elemento | [Client-side web APIs — Introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Introduction) |

## Módulo 8 — Eventos

| # | Lección | Fuentes |
|---|---|---|
| 44 | Introducción a los eventos | [Introduction to events (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) |
| 45 | Propagación y delegación de eventos: bubbling y capturing | [Event bubbling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) |
| 46 | Eventos de formulario y validación con JS | [Sending forms through JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_forms_through_JavaScript) |
| 47 | Enviar datos de formulario con fetch | [Sending and retrieving form data (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_and_retrieving_form_data) |

## Módulo 9 — Asincronía

| # | Lección | Fuentes |
|---|---|---|
| 48 | Introducción a JavaScript asíncrono | [Introducing asynchronous JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing) |
| 49 | Promesas: then, catch y finally | [How to use promises (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises) + [Promises (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) |
| 50 | async/await | [Promises (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) |
| 51 | Implementar una API basada en promesas | [Implementing a promise-based API (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Implementing_a_promise-based_API) |
| 52 | Peticiones de red con fetch() | [Making network requests with JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Network_requests) |
| 53 | Web Workers: JavaScript en un hilo aparte | [Introducing workers (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing_workers) |

## Módulo 10 — JavaScript moderno

| # | Lección | Fuentes |
|---|---|---|
| 54 | Módulos ES: import y export | [JavaScript modules (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) |
| 55 | Optional chaining (?.) y nullish coalescing (??) | [Optional chaining (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) + [Nullish coalescing operator (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) |
| 56 | Iteradores y generadores | [Iterators and generators (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators) |
| 57 | Expresiones regulares | [Regular expressions (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) |
| 58 | Fechas y horas | [Representing dates & times (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Representing_dates_times) |
| 59 | Gestión de memoria y recursos | [Memory management (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management) + [Resource management (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Resource_management) |

## Módulo 11 — Manejo de errores

| # | Lección | Fuentes |
|---|---|---|
| 60 | try/catch/finally y el objeto Error | [JavaScript debugging and error handling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript) + [Control flow and error handling (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling) |
| 61 | Crear errores personalizados | [Control flow and error handling (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling) |

## Módulo 12 — APIs del navegador

| # | Lección | Fuentes |
|---|---|---|
| 62 | Almacenamiento en el cliente: localStorage y sessionStorage | [Client-side storage (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Client-side_storage) |
| 63 | Dibujar en el navegador: la API Canvas | [Drawing graphics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Drawing_graphics) |
| 64 | Audio y vídeo desde JavaScript | [Video and audio APIs (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Video_and_audio_APIs) |
| 65 | Consumir APIs de terceros | [Third-party APIs (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_APIs/Third_party_APIs) |
| 66 | Detectar visibilidad: Intersection Observer | [Intersection Observer API (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) |
| 67 | Arrastrar y soltar: la API Drag and Drop | [HTML Drag and Drop API (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) |
| 68 | Web Components: elementos personalizados, shadow DOM y templates | [Using custom elements (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) + [Using shadow DOM (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) + [Using templates and slots (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots) — completa, sin repetir, la lección de HTML sobre `<template>`/`<slot>` |

## Módulo 13 — Calidad y organización

| # | Lección | Fuentes |
|---|---|---|
| 69 | Depurar JavaScript con DevTools | [JavaScript debugging and error handling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript) |
| 70 | Documentar código con JSDoc | [Use JSDoc: Getting Started with JSDoc 3 (proyecto JSDoc)](https://jsdoc.app/about-getting-started) |
| 71 | Retos finales: generador de historias y galería de imágenes | [Challenge: Silly story generator (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Silly_story_generator) + [Challenge: Building a house data UI (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/House_data_UI) |

---

## Notas de alcance

- **71 lecciones, 13 módulos.** Más grande que CSS (58) y más del
  doble que HTML (31), a propósito: JavaScript no es solo una
  tecnología de la plataforma web, es un lenguaje de programación
  completo — control de flujo, funciones, closures, prototipos,
  clases, asincronía y manejo de errores no existen como conceptos
  equivalentes en HTML o CSS. Sigue siendo un punto de partida, igual
  que los otros dos temarios — puede crecer si al escribir aparece un
  hueco real (algo probable dado el tamaño del lenguaje).
- **Deliberadamente fuera, misma lógica que CSS excluyó
  preprocesadores:** frameworks y librerías (React, Vue, Svelte...) —
  MDN ya los separa en su propio módulo *Core/Frameworks_libraries*,
  fuera del alcance de "JavaScript" a secas; herramientas de build
  (bundlers como Webpack/Vite, transpiladores como Babel, linters como
  ESLint) más allá de una mención de pasada si aparece de forma
  natural en alguna lección — no son JavaScript en sí, son tooling
  alrededor; TypeScript, por ser un lenguaje distinto (superset
  tipado); Node.js y JavaScript del lado del servidor — este catálogo
  es de tecnologías del navegador, como ya establecieron HTML y CSS;
  frameworks de testing (Jest, Vitest, Playwright) — testing merece su
  propio temario transversal, no lecciones sueltas aquí.
- **Web Components (lección 68) completa, sin repetir, lo que HTML
  dejó pendiente.** El temario de HTML excluyó explícitamente
  `Template, slot, and shadow` por no tener sentido sin JavaScript —
  esta lección recoge exactamente eso, desde el lado de la API
  (`customElements.define()`, `attachShadow()`), no desde el marcado.
- **Envío de formularios con JavaScript (lecciones 46-47) completa,
  sin repetir, otro pendiente de HTML.** El temario de HTML excluyó
  `Sending forms through JavaScript` y `How to build custom form
  controls` por la misma razón — aquí sí encajan, del lado del
  comportamiento con JS, no de los atributos HTML del formulario en
  sí (eso ya lo cubre el temario de HTML).
- **Sin lección dedicada a testing, TypeScript ni Web Workers más allá
  de una introducción básica (lección 53).** Cada uno de estos tres
  temas tiene suficiente profundidad real para un temario propio en el
  futuro, no una lección suelta que no le haría justicia — mismo
  criterio que CSS aplicó al dejar fuera Houdini más allá de
  `@property`.
- **JSDoc (lección 70) sí entra, a pesar de sonar "cosa de
  TypeScript".** Es sintaxis de comentarios pura — ninguna herramienta
  de TypeScript hace falta para escribirla ni para beneficiarse de
  ella (autocompletado y chequeo de tipos ya en editores como VS Code
  sobre archivos `.js` normales). El chequeo de tipos vía `tsc
  --checkJs` es opcional y posterior; la propia sintaxis y su valor
  como documentación son JavaScript del todo, con fuente oficial del
  proyecto JSDoc, no de TypeScript.
- **Los retos ("Challenge") de MDN se agrupan en la lección 71 final**,
  a diferencia de HTML/CSS donde los "Test your skills" se
  incorporaban como preguntas dentro de `## Ejercicios` de cada
  lección — aquí, dos de los retos de MDN Learn (generador de
  historias, UI de datos de una casa) combinan tantos conceptos de
  varios módulos a la vez (arrays, funciones, DOM, eventos, JSON) que
  tiene más sentido tratarlos como una lección de síntesis final,
  parecida en espíritu al cierre de organización que tuvo CSS.
