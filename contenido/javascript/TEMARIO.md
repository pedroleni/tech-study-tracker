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

**Maqueta visual de las dos anteriores** (interactiva, no una captura):
publicada como Artifact, mismo lenguaje visual que el resto de
`bloques-laboratorio` (tarjeta, insignia de icono, eyebrow, tokens
`sintaxis-*` reales). No es el componente final, sirve para validar el
diseño antes de invertir en implementarlo.

**Segunda pasada de investigación 2026-08-28**, tras feedback directo
de "¿solo necesitas esto? investiga más" — cruzados los módulos 4
(objetos/prototipos), 5 (arrays) y 7-8 (DOM/eventos) del temario contra
lo que los 14 bloques existentes + los 2 de arriba NO resuelven bien.
Tres huecos más, misma regla de oro (sin ejecución real, cero
superficie de seguridad nueva):

- **`cadena-de-nodos`** — un único componente para TRES lecciones
  distintas del temario que comparten la misma forma de problema
  ("una secuencia de nodos enlazados, con uno activo en cada paso"):
  el árbol DOM y `parentElement`/`children` (lección 39), la cadena de
  prototipos y la búsqueda de una propiedad subiendo por ella (lección
  27), y el recorrido de un evento al propagarse — capturing bajando,
  bubbling subiendo (lección 45). Esquema aproximado: `{ tipo:
  'cadena-de-nodos', titulo?: string, nodos: [{ id: string, etiqueta:
  string, padre?: string }], pasos: [{ nodoActivo: string, nota:
  string }] }` — `padre` ausente marca la raíz; con nodos sin
  ramificar (todos con como mucho un hijo) sirve igual para una cadena
  lineal (prototipos, propagación) que para un árbol de verdad (DOM).
  Deliberadamente UN componente flexible en vez de tres estrechos.
- **`diagrama-de-referencias`** — cajas de variable con una flecha al
  objeto al que apuntan; dos variables que apuntan al MISMO objeto
  muestran visualmente que comparten referencia — la base de "copiar
  no es clonar" (lección 28, `trabajar con objetos: copiar, comparar,
  congelar`) y de por qué un closure ve cambios hechos por otra
  llamada. Esquema aproximado: `{ tipo: 'diagrama-de-referencias',
  titulo?: string, variables: [{ nombre: string, apuntaA: string }],
  objetos: [{ id: string, etiqueta: string }], nota?: string }`.
- **`tabla-comparativa`** — una tabla de referencia genérica,
  columnas configurables — pensada para los puntos del temario donde
  varias cosas parecidas se comparan a la vez y la prosa las hace
  difíciles de escanear: métodos de array (map/filter/forEach/reduce/sort
  — lecciones 30-31), combinadores de promesas (all/race/allSettled/any
  — módulo 9), `==` frente a `===` (lección 8), o las APIs de
  almacenamiento (lección 62). Esquema aproximado: `{ tipo:
  'tabla-comparativa', titulo?: string, columnas: [string], filas: [{
  etiqueta: string, valores: [string] }] }` — el más reutilizable de
  los cinco, no ligado a ningún módulo concreto.

Ninguno de los cinco está en `esquemaBloqueLaboratorio` todavía — no
son válidos hasta que se implementen de verdad. Misma decisión que la
primera vez: quedan como diseño, se construyen cuando una lección
concreta los necesite, no en abstracto.

**Maqueta ampliada, mismo Artifact que las dos primeras** — los cinco
de arriba están ya en la página, interactivos.

**Tercera pasada de investigación 2026-08-28**, tras un segundo
"¿solo necesitas esto? investiga más" — esta vez cruzado contra las
lecciones 46 (validación de formularios), 48-51 (asincronía/promesas)
y 57 (expresiones regulares). Tres huecos más, misma regla de siempre:

- **`lineas-del-bucle-de-eventos`** — tres carriles (Pila de
  llamadas / Cola de microtareas / Cola de macrotareas), cada paso
  muestra qué hay en cada uno y resalta la línea de código
  correspondiente. `consola-simulada` ya responde QUÉ orden de salida
  produce un fragmento asíncrono (lecciones 48-50); esto responde POR
  QUÉ — el estado real de las colas del motor. Es, además, la
  visualización estándar para este concepto concreto en la industria
  (la charla "What the heck is the event loop?", la herramienta
  loupe.js) — nunca se enseña bien solo con texto. Esquema
  aproximado: `{ tipo: 'lineas-del-bucle-de-eventos', codigo: string,
  pasos: [{ fragmento: string, pila: string[], microtareas: string[],
  macrotareas: string[], nota?: string }] }`.
- **`secuencia-de-estados`** — generaliza `comparador-antes-despues`
  más allá de exactamente DOS estados fijos (antes/después): mismo
  iframe con `sandbox=""`, cero superficie de seguridad nueva, pero
  para cuando una lección necesita 3 o más momentos — el caso real es
  la lección 46 (validación de formularios: vacío → inválido →
  válido), donde dos estados se quedan cortos. Esquema aproximado: `{
  tipo: 'secuencia-de-estados', titulo?: string, estados: [{
  etiqueta: string, html: string }], nota?: string }` — de 3 a 5
  estados.
- **`probador-de-regex`** — un patrón, un texto de prueba, y las
  coincidencias resaltadas dentro de ese texto (índices calculados por
  quien escribe la lección, no por una regex ejecutándose en el
  navegador del lector). Expresiones regulares (lección 57) es de los
  temas donde nada de lo que ya existe — ni `codigo-anotado` ni
  `predice-el-resultado` — comunica bien "qué parte exacta del texto
  coincide", que es la pregunta central del tema. Esquema aproximado:
  `{ tipo: 'probador-de-regex', titulo?: string, patron: string,
  texto: string, coincidencias: [{ desde: number, hasta: number }] }`.

Ocho componentes nuevos en total, ninguno implementado todavía — se
construyen contra una lección real, no en abstracto. Misma decisión
sostenida en las tres pasadas.

## Módulo 1 — Fundamentos de JavaScript

| # | Lección | Fuentes |
|---|---|---|
| 1 | ¿Qué es JavaScript y cómo se conecta a HTML? | [What is JavaScript? (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript) + [Introduction to JavaScript (web.dev)](https://web.dev/learn/javascript/introduction) |
| 2 | Primera toma de contacto: escribir y ejecutar código | [A first splash into JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/A_first_splash) |
| 3 | Qué ha ido mal: depurar los primeros errores | [What went wrong? Troubleshooting JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_went_wrong) |
| 4 | Variables: var, let y const | [Storing the information you need — Variables (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables) + [Variables (web.dev)](https://web.dev/learn/javascript/data-types/variable) |
| 5 | Tipos de datos primitivos: number, string y boolean | [Data types and structures (web.dev)](https://web.dev/learn/javascript/data-types) + [Numbers (web.dev)](https://web.dev/learn/javascript/data-types/number) + [Booleans (web.dev)](https://web.dev/learn/javascript/data-types/boolean) |
| 6 | null, undefined, BigInt y Symbol | [Null and undefined values (web.dev)](https://web.dev/learn/javascript/data-types/null-undefined) + [BigInt (web.dev)](https://web.dev/learn/javascript/data-types/bigint) + [Symbols (web.dev)](https://web.dev/learn/javascript/data-types/symbol) |
| 7 | Operadores y matemáticas básicas | [Basic math in JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Math) |
| 8 | Comparación de valores y coerción de tipos | [Comparison operators (web.dev)](https://web.dev/learn/javascript/comparison) + [Equality comparisons and sameness (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness) |

## Módulo 2 — Cadenas de texto y control de flujo

| # | Lección | Fuentes |
|---|---|---|
| 9 | Cadenas de texto y template literals | [Handling text — strings in JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Strings) + [Strings (web.dev)](https://web.dev/learn/javascript/data-types/string) |
| 10 | Métodos útiles de cadenas | [Useful string methods (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Useful_string_methods) |
| 11 | Condicionales: if/else y switch | [Making decisions in your code — conditionals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals) + [Control flow (web.dev)](https://web.dev/learn/javascript/control-flow) |
| 12 | El operador ternario y los operadores lógicos &&, \|\| y ?? | [Making decisions in your code — conditionals (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Conditionals) + [Control flow (web.dev)](https://web.dev/learn/javascript/control-flow) + [Nullish coalescing operator (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — ninguna de las dos guías cubre ??; se añade la referencia dedicada |
| 13 | Bucles: for, while y do-while | [Looping code (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Loops) |
| 14 | for...of y for...in | [Loops and iteration (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration) — la lección de MDN Learn no distingue en profundidad for...of de for...in; se añade la guía de referencia |
| 15 | Arrays: fundamentos | [Arrays (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Arrays) |

## Módulo 3 — Funciones

| # | Lección | Fuentes |
|---|---|---|
| 16 | Funciones: declaración, expresión y ámbito | [Functions — reusable blocks of code (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Functions) + [Introduction to functions (web.dev)](https://web.dev/learn/javascript/functions) |
| 17 | Construir tu propia función y valores de retorno | [Build your own function (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Build_your_own_function) + [Function return values (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Return_values) + [The "return" keyword (web.dev)](https://web.dev/learn/javascript/functions/return) |
| 18 | Parámetros: valores por defecto, rest y arguments | [Functions (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions) |
| 19 | Funciones flecha | [Function expressions (web.dev)](https://web.dev/learn/javascript/functions/function-expressions) |
| 20 | this: cómo se determina y sus trampas | [The "this" keyword (web.dev)](https://web.dev/learn/javascript/functions/this) |
| 21 | El operador new y las funciones constructoras | [The "new" keyword (web.dev)](https://web.dev/learn/javascript/functions/new) |
| 22 | Hoisting: cómo se procesa realmente el código | [Grammar and types (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types) |
| 23 | Closures (clausuras) | [Closures (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures) |

## Módulo 4 — Objetos

| # | Lección | Fuentes |
|---|---|---|
| 24 | Objetos: fundamentos | [Object basics (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics) + [Introduction to objects (web.dev)](https://web.dev/learn/javascript/objects) |
| 25 | Property accessors: notación de punto y corchetes | [Property accessors (web.dev)](https://web.dev/learn/javascript/objects/property-accessors) |
| 26 | Property descriptors: configurar propiedades a fondo, getters y setters | [Property descriptors (web.dev)](https://web.dev/learn/javascript/objects/property-descriptors) + [get (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) + [set (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) — web.dev no cubre la sintaxis get/set de object literals pese a prometerla en el título; se añaden las referencias dedicadas de MDN |
| 27 | Prototipos y la herencia prototípica | [Prototypal inheritance (web.dev)](https://web.dev/learn/javascript/objects/prototypal-inheritance) + [Inheritance and the prototype chain (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain) |
| 28 | Trabajar con objetos: copiar, comparar, congelar | [Working with objects (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects) + [Object.assign() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) + [Object.freeze() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) — la guía solo cubre comparar (===); no cubre copiar ni congelar pese a prometerlo en el título, se añaden las referencias dedicadas de MDN |
| 29 | Desestructuración y spread/rest en objetos y arrays | [Destructuring assignment (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) + [Spread syntax (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) + [Rest parameters (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) — Grammar and types solo menciona la desestructuración en una línea, sin cubrir spread/rest en absoluto pese a prometerlo en el título; se sustituye por las tres referencias dedicadas de MDN |

## Módulo 5 — Arrays y colecciones a fondo

| # | Lección | Fuentes |
|---|---|---|
| 30 | Colecciones indexadas: métodos de array | [Indexed collections (web.dev)](https://web.dev/learn/javascript/collections/indexed) + [Indexed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) |
| 31 | Métodos funcionales: map, filter y reduce | [Indexed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections) |
| 32 | Colecciones con clave: Map y Set | [Keyed collections (web.dev)](https://web.dev/learn/javascript/collections/keyed) + [Keyed collections (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections) |
| 33 | JSON: serializar y parsear | [Working with JSON (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON) + [JSON.stringify() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) — se añade la referencia dedicada solo para el tercer argumento (indentación), no cubierto por la guía principal |

## Módulo 6 — Clases y programación orientada a objetos

| # | Lección | Fuentes |
|---|---|---|
| 34 | Introducción a las clases | [Introduction to classes (web.dev)](https://web.dev/learn/javascript/classes) + [Using classes (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes) |
| 35 | Herencia con extends y super | [Extend classes (web.dev)](https://web.dev/learn/javascript/classes/extends) |
| 36 | Campos y métodos de clase, encapsulación privada (#) | [Class fields and methods (web.dev)](https://web.dev/learn/javascript/classes/class-fields) + [Private elements (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) |
| 37 | Bloques de inicialización estática | [Static initialization blocks (web.dev)](https://web.dev/learn/javascript/classes/static-initialization-blocks) |

## Módulo 7 — El DOM

| # | Lección | Fuentes |
|---|---|---|
| 38 | Introducción al scripting del DOM | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) |
| 39 | El árbol DOM y cómo recorrerlo | [Node (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Node) + [Element (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element) — la guía introductoria solo cubre la terminología del árbol de forma conceptual, sin las propiedades reales de recorrido (parentNode, children, nextElementSibling...); se sustituye por las referencias dedicadas de MDN |
| 40 | Seleccionar elementos: getElementById, querySelector y compañía | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) + [HTMLCollection (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection) + [NodeList (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/NodeList) — se añaden para cubrir la distinción viva/estática entre HTMLCollection y NodeList, no cubierta por la guía introductoria |
| 41 | Leer y modificar contenido, atributos y estilos | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) + [Element: setAttribute() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute) + [Element: classList (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) — se añaden para cubrir getAttribute/setAttribute y el resto de métodos de classList (remove, toggle, contains), no explicados por la guía introductoria pese a prometer "atributos" en el título |
| 42 | Crear, insertar y eliminar nodos | [DOM scripting introduction (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting) + [Challenge: Image gallery (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Image_gallery) |
| 43 | Tamaño, posición y scroll de un elemento | [Element: getBoundingClientRect() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) + [Element: scrollTop (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop) + [Element: scrollIntoView() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView) — la fuente original citada es una introducción genérica a las Web APIs sin relación con el contenido real de la lección; se sustituye por completo por las referencias dedicadas de MDN |

## Módulo 8 — Eventos

| # | Lección | Fuentes |
|---|---|---|
| 44 | Introducción a los eventos | [Introduction to events (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) |
| 45 | Propagación y delegación de eventos: bubbling y capturing | [Event bubbling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) |
| 46 | Eventos de formulario y validación con JS | [Constraint validation (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) — la fuente citada originalmente ("Sending forms through JavaScript") trata en realidad de enviar formularios con FormData/fetch, tema de la lección 47; se sustituye por la referencia real de la Constraint Validation API, que sí cubre la validación prometida en el título |
| 47 | Enviar datos de formulario con fetch | [Sending forms through JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Sending_forms_through_JavaScript) — la fuente citada originalmente ("Sending and retrieving form data") trata de envío GET/POST tradicional y manejo en servidor (PHP/Python), sin FormData ni fetch; el contenido real de fetch/FormData estaba en la fuente asignada por error a la lección 46, se corrige aquí |

## Módulo 9 — Asincronía

| # | Lección | Fuentes |
|---|---|---|
| 48 | Introducción a JavaScript asíncrono | [Introducing asynchronous JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing) |
| 49 | Promesas: then, catch y finally | [How to use promises (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises) + [Promises (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) + [Promise.prototype.finally() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally) — ninguna de las dos guías cubre finally() pese a prometerlo en el título; se añade la referencia dedicada |
| 50 | async/await | [Promises (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) + [async function (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) — se añade la referencia dedicada para el hecho de que una función async siempre devuelve una promesa, con ejemplo concreto |
| 51 | Implementar una API basada en promesas | [Implementing a promise-based API (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Implementing_a_promise-based_API) |
| 52 | Peticiones de red con fetch() | [Making network requests with JavaScript (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Network_requests) |
| 53 | Web Workers: JavaScript en un hilo aparte | [Introducing workers (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing_workers) + [Worker: terminate() (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/API/Worker/terminate) — se añade la referencia dedicada, no cubierta por la guía principal |

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
| 61 | Crear errores personalizados | [Error (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) — la guía citada originalmente no cubre en absoluto extender Error con class, pese a ser el tema central del título; se sustituye por la referencia real de MDN |

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
| 69 | Depurar JavaScript con DevTools | [JavaScript debugging and error handling (MDN)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript) + [debugger (MDN reference)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger) — se añade la referencia dedicada a la sentencia debugger, no cubierta por la guía principal |
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
