# Temario de Node.js — planteado desde cero

**Alcance:** temario completo de una tecnología "Node.js" nueva en el
catálogo, hermana de `contenido/html/TEMARIO.md`,
`contenido/css/TEMARIO.md`, `contenido/javascript/TEMARIO.md` y
`contenido/typescript/TEMARIO.md`. Mismo criterio de fondo: nada de
memoria, todo verificado en vivo (`WebFetch`/`WebSearch`) el
2026-08-30, contra la versión real y actual de Node.js (v26). No existe
ninguna lección de Node.js en producción todavía — este documento es el
plan a aprobar antes de escribir la primera.

**Primera tecnología de la categoría "Backend".** HTML, CSS, JavaScript y
TypeScript viven en "Frontend web" — Node.js le da al catálogo una
segunda categoría real, no más profundidad en la misma. No repite
JavaScript: da por aprendido todo `contenido/javascript/TEMARIO.md`
(closures, promesas, clases, módulos ES a nivel de lenguaje...) y se
centra en lo que Node.js añade — un entorno de ejecución fuera del
navegador, con sistema de ficheros, red, procesos, y su propio ecosistema
de módulos. Reutiliza también TypeScript donde tiene sentido: uno de los
propios módulos (12) es "TypeScript en Node", y dos de los cuatro
proyectos avanzados están pensados para escribirse en TypeScript, no en
JavaScript puro — la primera vez en este catálogo que un track de
"Proyectos" usa otra tecnología del propio catálogo como herramienta, no
solo como requisito previo.

**De dónde sale el contenido:**

- **[Node.js — Learn](https://nodejs.org/en/learn)** (OpenJS Foundation /
  el propio proyecto Node.js), la guía oficial organizada en módulos
  reales (*Getting Started*, *Command Line*, *HTTP*, *Manipulating
  Files*, *Asynchronous Work*, *TypeScript*, *Test Runner*...) —
  verificado en vivo el índice completo de navegación el 2026-08-30.
  Fuente principal de la mayoría de lecciones — es un tutorial pensado
  para aprender, no solo una referencia técnica.
- **[Node.js API Reference](https://nodejs.org/api/)** (el propio
  proyecto Node.js), puntual: para módulos concretos que la guía Learn
  no cubre con suficiente profundidad práctica (`sqlite`, `test`,
  `crypto`, `packages`) — verificado en vivo el índice completo de
  módulos (65 en la v26 actual) y el contenido real de las páginas de
  `sqlite`, `test`, `packages` y `crypto` antes de diseñar los módulos y
  proyectos que dependen de ellos.
- **[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)**
  y el propio `contenido/typescript/TEMARIO.md`, para el módulo 12 — no
  se repiten conceptos de TypeScript ya enseñados, solo su aplicación
  específica dentro de Node.

A diferencia de CSS/JavaScript (con dos fuentes de cobertura equivalente,
MDN + web.dev), Node.js tiene el mismo caso que TypeScript: una única
documentación oficial dominante y de calidad inusualmente alta, que ya
incluye tanto una guía de aprendizaje real como la referencia técnica —
forzar una segunda fuente de cobertura total no aportaría nada que
Node.js — Learn no dé ya.

## Convenciones compartidas con el resto de temarios

Todas las reglas de `contenido/html/TEMARIO.md` sobre cómo se escribe una
lección aplican igual aquí — se resumen para que este documento se pueda
leer solo:

- **La plantilla de 7 secciones es un mínimo, no un techo.**
- **Sin `editor-en-vivo` en la mayoría de lecciones.** El mecanismo de
  compilación en vivo (HTML/CSS/JS/TS) corre dentro de un `iframe`
  `sandbox="allow-scripts"` sin acceso a `fs`, red real más allá de
  `fetch`, ni proceso — la inmensa mayoría de Node.js (`fs`, `http`,
  `child_process`, `worker_threads`) **no se puede ejecutar ahí dentro**,
  a diferencia de TypeScript. Las lecciones de Node.js usan
  `codigo-anotado`/`comparador-antes-despues` (código envuelto en
  `<script>`, `lenguaje` forzado a `"html"` — la misma limitación real
  del esquema Zod ya documentada en los temarios anteriores) como bloque
  principal, y remiten a "pruébalo en tu terminal" en vez de a un sandbox
  embebido. Única excepción real: fragmentos que son puro cálculo sin
  ningún API de Node (poco frecuente aquí).
- **`predice-el-resultado` se usa con el mismo criterio que en
  JavaScript** — para comportamiento asíncrono/del bucle de eventos que
  sorprende de verdad (orden de `process.nextTick` frente a
  `setImmediate`, por ejemplo), no como relleno.
- Validar cada lección con el mismo pipeline ya en uso: JSON de cada
  bloque parseado y comprobado contra el Zod real, grep de entidades,
  `npx vitest run`, `npm run build`, `npm run lint`, commit, borrador en
  producción vía Playwright, verificación visual en los dos temas sin
  errores de consola.

## Módulo 1 — Qué es Node.js y por qué existe

| # | Lección | Fuentes |
|---|---|---|
| 1 | ¿Qué es Node.js y qué problema resuelve? | [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) |
| 2 | El motor V8: cómo Node ejecuta JavaScript fuera del navegador | [The V8 JavaScript Engine](https://nodejs.org/en/learn/getting-started/the-v8-javascript-engine) |
| 3 | Diferencias reales entre Node.js y el navegador | [Differences between Node.js and the Browser](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser) |
| 4 | Desarrollo frente a producción en Node.js | [Node.js, the difference between development and production](https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production) |

## Módulo 2 — Primeros pasos

| # | Lección | Fuentes |
|---|---|---|
| 5 | Ejecutar scripts desde la línea de comandos | [Run Node.js scripts from the command line](https://nodejs.org/en/learn/command-line/run-nodejs-scripts-from-the-command-line) |
| 6 | El REPL de Node.js | [How to use the Node.js REPL](https://nodejs.org/en/learn/command-line/how-to-use-the-nodejs-repl) |
| 7 | Argumentos de línea de comandos y entrada estándar | [Accept input from the command line in Node.js](https://nodejs.org/en/learn/command-line/accept-input-from-the-command-line-in-nodejs) + [Output to the command line using Node.js](https://nodejs.org/en/learn/command-line/output-to-the-command-line-using-nodejs) |
| 8 | Variables de entorno | [How to read environment variables from Node.js](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs) |

## Módulo 3 — El sistema de módulos

| # | Lección | Fuentes |
|---|---|---|
| 9 | CommonJS: `require` y `module.exports` | [Packages reference](https://nodejs.org/api/packages.html) |
| 10 | ES modules en Node: `import`/`export`, `"type": "module"` | [Packages reference](https://nodejs.org/api/packages.html) |
| 11 | Interoperabilidad entre CommonJS y ES modules | [Packages reference](https://nodejs.org/api/packages.html) |
| 12 | Resolución de módulos: rutas, `node_modules` y `exports` maps | [Packages reference](https://nodejs.org/api/packages.html) |

## Módulo 4 — npm en profundidad

| # | Lección | Fuentes |
|---|---|---|
| 13 | `package.json`: campos reales, no solo `name`/`version` | [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) |
| 14 | Instalar, actualizar y fijar versiones (semver) | [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) |
| 15 | Scripts de npm | [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) |
| 16 | Dependencias de desarrollo frente a producción, y `npx` | [An introduction to the npm package manager](https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager) |

## Módulo 5 — El sistema de ficheros (`fs`)

| # | Lección | Fuentes |
|---|---|---|
| 17 | Leer archivos: síncrono, con callback y con promesas | [Reading files with Node.js](https://nodejs.org/en/learn/manipulating-files/reading-files-with-nodejs) |
| 18 | Escribir y añadir contenido a archivos | [Writing files with Node.js](https://nodejs.org/en/learn/manipulating-files/writing-files-with-nodejs) |
| 19 | Rutas de archivo con el módulo `path` | [Node.js File Paths](https://nodejs.org/en/learn/manipulating-files/nodejs-file-paths) |
| 20 | Trabajar con carpetas | [Working with folders in Node.js](https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs) |
| 21 | Metadatos de archivo: `fs.stat` | [Node.js file stats](https://nodejs.org/en/learn/manipulating-files/nodejs-file-stats) |

## Módulo 6 — Buffers y datos binarios

| # | Lección | Fuentes |
|---|---|---|
| 22 | Qué es un `Buffer` y por qué existe | [Buffer](https://nodejs.org/api/buffer.html) |
| 23 | Encodings: utf8, base64, hex | [Buffer](https://nodejs.org/api/buffer.html) |

## Módulo 7 — El bucle de eventos en profundidad

| # | Lección | Fuentes |
|---|---|---|
| 24 | Bloqueante frente a no bloqueante | [Overview of Blocking vs Non-Blocking](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking) |
| 25 | Las fases del bucle de eventos | [The Node.js Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick) |
| 26 | `process.nextTick()` | [Understanding process.nextTick()](https://nodejs.org/en/learn/asynchronous-work/understanding-processnexttick) |
| 27 | `setImmediate()` frente a `setTimeout(fn, 0)` | [Understanding setImmediate()](https://nodejs.org/en/learn/asynchronous-work/understanding-setimmediate) |
| 28 | No bloquear el bucle de eventos: por qué importa de verdad | [Don't Block the Event Loop](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop) |

## Módulo 8 — `EventEmitter`

| # | Lección | Fuentes |
|---|---|---|
| 29 | El patrón `EventEmitter` | [The Node.js Event Emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter) |
| 30 | Crear tu propia clase basada en eventos | [The Node.js Event Emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter) + [Events](https://nodejs.org/api/events.html) |

## Módulo 9 — Streams

| # | Lección | Fuentes |
|---|---|---|
| 31 | Qué es un stream y los cuatro tipos | [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) |
| 32 | Streams de lectura y escritura | [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) |
| 33 | `pipe()` y `pipeline()` | [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) + [Stream](https://nodejs.org/api/stream.html) |
| 34 | Backpressure: por qué existe y qué pasa si se ignora | [Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) |

## Módulo 10 — Construir un servidor HTTP desde cero

| # | Lección | Fuentes |
|---|---|---|
| 35 | Anatomía de una petición/respuesta HTTP en Node | [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) |
| 36 | Crear un servidor con el módulo `http` | [Anatomy of an HTTP Transaction](https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction) + [HTTP](https://nodejs.org/api/http.html) |
| 37 | Enrutamiento manual, sin ningún framework | [HTTP](https://nodejs.org/api/http.html) |
| 38 | Leer el cuerpo de una petición y responder JSON | [HTTP](https://nodejs.org/api/http.html) |

## Módulo 11 — Concurrencia real

| # | Lección | Fuentes |
|---|---|---|
| 39 | `child_process`: ejecutar otros programas | [Child process](https://nodejs.org/api/child_process.html) + [Comparing Node.js concurrency models](https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models) |
| 40 | `worker_threads`: paralelismo real de JavaScript | [Comparing Node.js concurrency models](https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models) + [Worker threads](https://nodejs.org/api/worker_threads.html) |
| 41 | `cluster`: aprovechar varios núcleos | [Comparing Node.js concurrency models](https://nodejs.org/en/learn/concurrency/comparing-nodejs-concurrency-models) + [Cluster](https://nodejs.org/api/cluster.html) |

## Módulo 12 — TypeScript en Node

| # | Lección | Fuentes |
|---|---|---|
| 42 | Soporte nativo de TypeScript en Node (`node archivo.ts`) | [Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively) |
| 43 | Cuándo hace falta transpilar o usar un runner (`tsx`) | [Running TypeScript code using transpilation](https://nodejs.org/en/learn/typescript/transpile) + [Running TypeScript with a runner](https://nodejs.org/en/learn/typescript/run) |
| 44 | Publicar un paquete de npm escrito en TypeScript | [Publishing a TypeScript package](https://nodejs.org/en/learn/typescript/publishing-a-ts-package) |

## Módulo 13 — El test runner nativo

| # | Lección | Fuentes |
|---|---|---|
| 45 | Primeros pasos con `node:test` | [Discovering Node.js's test runner](https://nodejs.org/en/learn/test-runner/introduction) + [Test runner](https://nodejs.org/api/test.html) |
| 46 | Mocking con el test runner nativo | [Mocking in tests](https://nodejs.org/en/learn/test-runner/mocking) |
| 47 | Cobertura de código | [Collecting code coverage in Node.js](https://nodejs.org/en/learn/test-runner/collecting-code-coverage) |

## Módulo 14 — Depuración, configuración y seguridad

| # | Lección | Fuentes |
|---|---|---|
| 48 | El inspector de Node y depurar con las DevTools del navegador | [Debugging Node.js](https://nodejs.org/en/learn/getting-started/debugging) |
| 49 | Buenas prácticas de seguridad básicas | [Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices) |
| 50 | Hashing de contraseñas y comparación segura con `node:crypto` | [Crypto](https://nodejs.org/api/crypto.html) (`scrypt`/`scryptSync`, `timingSafeEqual`) |
| 51 | Firmar y verificar datos con HMAC | [Crypto](https://nodejs.org/api/crypto.html) (`createHmac`, `timingSafeEqual`) |

## Módulo 15 — Proyectos

| # | Lección | Fuentes |
|---|---|---|
| 52 | Proyecto avanzado: API REST con autenticación (JWT + `node:sqlite`) | [SQLite](https://nodejs.org/api/sqlite.html) (Release Candidate en la v26) + [Crypto](https://nodejs.org/api/crypto.html) + [HTTP](https://nodejs.org/api/http.html) — TypeScript |
| 53 | Proyecto avanzado: procesador de webhooks con firma HMAC y reintentos | [Crypto](https://nodejs.org/api/crypto.html) + [HTTP](https://nodejs.org/api/http.html) |
| 54 | Proyecto avanzado: acortador de URLs con rate limiting real | [HTTP](https://nodejs.org/api/http.html) + [SQLite](https://nodejs.org/api/sqlite.html) |
| 55 | Proyecto avanzado: procesador de ventas por lotes (streams de fichero) | [How to use streams](https://nodejs.org/en/learn/modules/how-to-use-streams) + [Backpressuring in Streams](https://nodejs.org/en/learn/modules/backpressuring-in-streams) — TypeScript |

**Total: 55 lecciones en 15 módulos**, incluidos 4 proyectos avanzados
(cada uno con su propio repositorio real en GitHub, rama `main` con TODOs
y rama `solucion` completa — mismo patrón que TypeScript). Dos de los
cuatro proyectos (52 y 55) están pensados para escribirse en TypeScript,
reutilizando el temario ya existente en vez de tratar Node y TypeScript
como mundos separados.

## Nota técnica: `node:sqlite` es Release Candidate, no estable del todo

Verificado en vivo contra la documentación real: `node:sqlite` pasó a
Release Candidate en la v25.7.0 (Stability 1.2) — ya no está detrás de
ningún flag experimental desde la v22.13.0/v23.4.0, pero tampoco es
Stability 2 todavía. Se usa igualmente en los proyectos 52 y 54 porque:
es real, viene integrado sin ninguna dependencia externa (evita el
problema de "necesitas Postgres/MySQL instalado para hacer el ejercicio"
que tendría cualquier alternativa), y es exactamente el tipo de API
reciente que vale la pena conocer. Se documenta su estado real en la
propia lección del proyecto, sin fingir que es una API asentada desde
hace años.

## Pendiente antes de escribir la primera lección

- [ ] Crear la tecnología "Node.js" vía el flujo de admin, categoría
  "Backend" (hasta ahora vacía).
- [ ] Confirmar el orden de publicación.
