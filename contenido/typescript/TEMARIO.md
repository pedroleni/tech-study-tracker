# Temario de TypeScript — planteado desde cero

**Alcance:** temario completo de una tecnología "TypeScript" nueva en el
catálogo, hermana de `contenido/html/TEMARIO.md`,
`contenido/css/TEMARIO.md` y `contenido/javascript/TEMARIO.md`. Mismo
criterio de fondo: nada de memoria, todo verificado en vivo
(`WebFetch`/`WebSearch`) el 2026-08-30. No existe ninguna lección de
TypeScript en producción todavía — este documento es el plan a aprobar
antes de escribir la primera.

**No repite JavaScript.** TypeScript es una capa de tipos sobre
JavaScript, no un lenguaje aparte — este temario da por aprendido todo
`contenido/javascript/TEMARIO.md` (closures, promesas, DOM, módulos ES,
clases en tiempo de ejecución...) y se centra exclusivamente en lo que
TypeScript añade: el sistema de tipos, su sintaxis, y las herramientas
alrededor. Ninguna lección re-explica qué es una promesa o un closure.

**De dónde sale el contenido — un caso distinto a HTML/CSS/JavaScript,
explicado para que quede claro por qué la lista de fuentes es más
corta:** TypeScript no es un estándar web con varias implementaciones y
varios sitios de referencia independientes (WHATWG/W3C + MDN + web.dev)
— es un producto de Microsoft con una única documentación oficial, que
además es inusualmente completa y es la que usa el propio equipo de
TypeScript para enseñar el lenguaje. Forzar una segunda fuente
"hermana" del mismo peso que MDN/web.dev para cada lección habría
significado citar blogs de terceros de fiabilidad desigual sin necesidad
real.

- **[The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)**
  (Microsoft), concretamente sus capítulos progresivos bajo `/docs/handbook/2/`
  (*The Basics*, *Everyday Types*, *Narrowing*, *More on Functions*,
  *Object Types*, *Type Manipulation*, *Classes*, *Modules*) — fuente
  principal de la inmensa mayoría de lecciones, verificado en vivo el
  índice completo de navegación el 2026-08-30 (estructura y URLs
  confirmadas, no recordadas).
- **[TypeScript Reference](https://www.typescriptlang.org/docs/handbook/utility-types.html)**
  (Microsoft), las páginas de referencia fuera de la progresión
  numerada (`Utility Types`, `Decorators`, `Declaration Merging`,
  `Enums`, `Namespaces`, `Type Compatibility`, `Type Inference`,
  `Variable Declarations`) — para temas que el Handbook trata como
  referencia puntual, no como capítulo de un curso.
- **[TSConfig Reference](https://www.typescriptlang.org/tsconfig/)** +
  **[What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)**
  (Microsoft), para el módulo de configuración.
- **[Release notes de TypeScript](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)**
  (Microsoft), puntual: para funciones que nunca tuvieron su propio
  capítulo del Handbook porque llegaron después de escrito (`satisfies`,
  4.9) o para contexto real de versión (`erasableSyntaxOnly`, ya
  documentado en la lección 78 existente; la reescritura del compilador
  en Go de TypeScript 7, anunciada en el
  [devblog oficial](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) —
  ya verificado de primera mano en `specs/features/typescript-compilacion-en-vivo.md`
  al fijar la versión del compilador del editor en vivo).
- **[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)**
  (Google), segunda fuente real pero puntual, no de cobertura total: el
  Handbook enseña el lenguaje, no cuándo conviene usar cada construcción
  en código real — se cita en las lecciones donde hay una decisión de
  estilo genuina detrás (`interface` frente a `type`, cuándo evitar
  `enum`), como contrapunto práctico e independiente de Microsoft.

Mismo criterio de desempate que en HTML/CSS/JS: cuando el Handbook y el
Style Guide de Google discrepen en una recomendación de estilo (ocurre,
por ejemplo, con `enum`), se explican las dos posturas en vez de fingir
consenso — es una discrepancia real de la comunidad, no un error de una
fuente.

## Convenciones compartidas con el resto de temarios

Todas las reglas de `contenido/html/TEMARIO.md` sobre cómo se escribe
una lección aplican igual aquí — se resumen para que este documento se
pueda leer solo:

- **La plantilla de 7 secciones es un mínimo, no un techo.** `Qué es y
  para qué sirve` / `Cuándo lo usarías de verdad` / `Cómo se usa` /
  secciones propias cuando el tema tenga subtemas con peso real / `Lo
  que [X] no es` (opcional) / `Errores típicos` / `Ejercicios` / `Para
  profundizar`.
- **Sin editor en vivo (`editor-en-vivo`) por defecto.** El mecanismo de
  compilación real ya existe (ver
  `specs/features/typescript-compilacion-en-vivo.md`) y se usa donde
  aporte de verdad — sobre todo en el módulo de Narrowing y en
  Genéricos/Utility types, donde ver el panel de diagnósticos pasar de
  rojo a verde ES la lección. En el resto, `codigo-anotado` (envuelto en
  `<script>`, `lenguaje` forzado a `"html"` — la limitación real del
  esquema Zod, ver la lección 78 y su fix documentado en
  `contenido/javascript/TEMARIO.md`) y `comparador-antes-despues` siguen
  siendo el bloque principal, porque la mayoría de lo que hay que
  mostrar en TypeScript es "esto compila / esto no", no un resultado en
  pantalla.
- **`predice-el-resultado` casi no se usa aquí** — ese bloque pregunta
  qué IMPRIME el código; en TypeScript lo interesante casi siempre es si
  COMPILA, no qué imprime. Se reserva para las pocas lecciones donde sí
  hay una diferencia real de comportamiento en tiempo de ejecución
  (`enum` numérico frente a `const enum`, por ejemplo).
- **`notas-clave`** reservado para "Errores típicos", máximo uno por
  lección, igual que en el resto de temarios.
- Validar cada lección con el mismo pipeline ya en uso: JSON de cada
  bloque parseado y comprobado contra el Zod real, grep de entidades,
  `npx vitest run`, `npm run build`, `npm run lint`, commit, borrador en
  producción vía Playwright, verificación visual en los dos temas sin
  errores de consola.

## Módulo 1 — Por qué TypeScript y primeros pasos

| # | Lección | Fuentes |
|---|---|---|
| 1 | ¿Qué problema resuelve TypeScript que JavaScript no resuelve? | [TypeScript for JS Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) + [TS for the New Programmer](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html) |
| 2 | Instalación y tu primer `tsconfig.json` | [TypeScript Tooling in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html) + [What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) |
| 3 | Cómo funciona la inferencia de tipos | [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) |
| 4 | Anotaciones explícitas: cuándo merece la pena escribir el tipo | [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) |

## Módulo 2 — Tipos primitivos y valores

| # | Lección | Fuentes |
|---|---|---|
| 5 | Tipos primitivos: `string`, `number`, `boolean` | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 6 | `null`, `undefined` y `strictNullChecks` | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 7 | Arrays y tuplas tipadas | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 8 | `any`, `unknown` y `never`: los tres casos límite | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 9 | Tipos literales e inferencia de literales | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 10 | Type assertions: `as` y el operador `!` | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |

## Módulo 3 — Objetos y alias de tipos

| # | Lección | Fuentes |
|---|---|---|
| 11 | Tipos de objeto y propiedades opcionales/`readonly` | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) |
| 12 | Alias de tipos con `type` | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 13 | Uniones de tipos | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) |
| 14 | Interfaces: extender y combinar formas | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) |
| 15 | `interface` frente a `type`: cuándo usar cada una | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html) + [Google TypeScript Style Guide — Type Aliases](https://google.github.io/styleguide/tsguide.html) |

## Módulo 4 — Funciones tipadas

| # | Lección | Fuentes |
|---|---|---|
| 16 | Parámetros y retorno tipados | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| 17 | Parámetros opcionales, por defecto y rest | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| 18 | Sobrecarga de funciones | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| 19 | `this` en funciones y métodos | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |
| 20 | Funciones que nunca retornan: `never` | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) |

## Módulo 5 — Narrowing y uniones discriminadas

| # | Lección | Fuentes |
|---|---|---|
| 21 | `typeof` y comparaciones como guardas de tipo | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| 22 | `in`, `instanceof` y guardas de tipo personalizadas | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| 23 | Uniones discriminadas: el patrón central de TypeScript | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| 24 | Comprobación de exhaustividad con `never` | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |

## Módulo 6 — Enums y alternativas

| # | Lección | Fuentes |
|---|---|---|
| 25 | Enums numéricos y de cadena | [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) |
| 26 | `const enum` y sus trade-offs | [Enums](https://www.typescriptlang.org/docs/handbook/enums.html) |
| 27 | `as const` y `satisfies`: alternativas a los enums | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) + [TypeScript 4.9 — satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) + [Google Style Guide — enums](https://google.github.io/styleguide/tsguide.html) |

## Módulo 7 — Genéricos

| # | Lección | Fuentes |
|---|---|---|
| 28 | Funciones genéricas: tipos que dependen de quien llama | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| 29 | Constraints (`extends`) en genéricos | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| 30 | Valores por defecto en parámetros de tipo | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| 31 | Interfaces y clases genéricas | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |

## Módulo 8 — Clases tipadas

| # | Lección | Fuentes |
|---|---|---|
| 32 | Propiedades y constructores tipados | [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) |
| 33 | Modificadores de acceso: `public`, `private`, `protected` | [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) |
| 34 | Clases abstractas e `implements` | [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) |
| 35 | Genéricos en clases | [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) + [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |
| 36 | `erasableSyntaxOnly`: por qué un parámetro de constructor no siempre compila | Ya documentado y verificado en la lección 78 (`contenido/javascript/78-proyecto-avanzado-buscador-typescript.md`, se traslada a este temario — ver Módulo 13) |

## Módulo 9 — Operadores de manipulación de tipos

| # | Lección | Fuentes |
|---|---|---|
| 37 | `keyof`: las claves de un tipo, como tipo | [Keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html) |
| 38 | `typeof` a nivel de tipos | [Typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) |
| 39 | Indexed access types: el tipo de una propiedad | [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html) |
| 40 | Encadenar operadores: construir un tipo a partir de otro | [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) |

## Módulo 10 — Utility types

| # | Lección | Fuentes |
|---|---|---|
| 41 | `Partial`, `Required`, `Readonly`, `Pick`, `Omit` | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| 42 | `Record`, `Exclude`, `Extract`, `NonNullable` | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| 43 | `ReturnType` y `Parameters`: extraer tipos de una función | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) |

## Módulo 11 — Tipos avanzados

| # | Lección | Fuentes |
|---|---|---|
| 44 | Conditional types: tipos que deciden según otro tipo | [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) |
| 45 | `infer`: extraer un tipo dentro de una condición | [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) |
| 46 | Mapped types: transformar todas las propiedades de un tipo | [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) |
| 47 | Template literal types: tipos construidos como strings | [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) |

## Módulo 12 — Módulos, declaraciones y configuración

| # | Lección | Fuentes |
|---|---|---|
| 48 | Módulos ES en TypeScript: `import`/`export` tipados | [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html) + [Modules — Introduction](https://www.typescriptlang.org/docs/handbook/modules/introduction.html) |
| 49 | Resolución de módulos: cómo decide TypeScript qué `import` es cuál | [Modules — Theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html) |
| 50 | Ficheros de declaración `.d.ts`: tipar JavaScript sin tipos | [Declaration Files — Introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) + [By Example](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html) |
| 51 | `tsconfig.json` en profundidad: `strict`, `target`, `module`, `lib` | [TSConfig Reference](https://www.typescriptlang.org/tsconfig/) + [Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html) |
| 52 | Declaration merging | [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) |

## Módulo 13 — Proyectos

| # | Lección | Fuentes |
|---|---|---|
| 53 | Proyecto: lista de tareas tipada, de cero (editor en vivo) | Aplicación directa de Módulos 2-5 (tipos, narrowing, uniones discriminadas) en un ejercicio sandbox nuevo |
| 54 | Proyecto: validar datos de una API con Zod — cuando un tipo no basta | Continúa el reto #3 de la lección 78 (ya lo planteaba sin resolverlo); fuente técnica: [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) (para tipar la salida de Zod con `z.infer`) |
| 55 | Proyecto avanzado: Buscador de personajes con TypeScript | **Trasladada** desde `contenido/javascript/78-proyecto-avanzado-buscador-typescript.md` (cambio de `technology_id`, no reescritura) — capstone heredado de este temario |
| 56 | Proyecto avanzado: Bus de eventos tipado | Aplicación real de Módulo 5 (narrowing) + Módulo 7 (genéricos) + Módulo 11 (mapped types) — [github.com/pedroleni/typescript-proyectos](https://github.com/pedroleni/typescript-proyectos) (carpeta `bus-eventos`) |
| 57 | Proyecto avanzado: Cliente tipado con Zod | Cierra el reto de la lección 54 contra una API real (PokeAPI) — [github.com/pedroleni/typescript-proyectos](https://github.com/pedroleni/typescript-proyectos) (carpeta `cliente-zod`) |
| 58 | Proyecto avanzado: Máquina de estados tipada | Aplicación real de Módulo 5 (uniones discriminadas) + Módulo 7 (genéricos) + Módulo 9 (indexed access types) — [github.com/pedroleni/typescript-proyectos](https://github.com/pedroleni/typescript-proyectos) (carpeta `maquina-estados`) |

**Total: 58 lecciones en 13 módulos** — por encima de la horquilla
orientativa de la spec (~12 módulos / 40-48 lecciones), mismo patrón que
CSS al ampliarse tras "hazlo más completo": los operadores de
manipulación de tipos (Módulo 9) y los tipos avanzados (Módulo 11) dan
para más lecciones de las estimadas inicialmente sin rellenar con nada
artificial — cada fila de la tabla es un concepto real y verificado del
Handbook, no una subdivisión forzada.

**Ampliado 2026-08-30**, tras pedido directo de "ahora toca proyectos de
typescript": 3 proyectos avanzados nuevos (56-58), nativos de TypeScript
(no heredados de JavaScript como el 55), cada uno con su propio repo real
en GitHub (rama `main` con TODOs, rama `solucion` completa), verificados
con el compilador real y en navegador antes de escribir la lección.
Encontraron gotchas reales al construirse: `Record<string, unknown>` como
constraint no acepta un mapa de eventos cerrado (56); y la máquina de
estados (58) tropezó, sin buscarlo, con el mismo límite de
`erasableSyntaxOnly` sobre el atajo de parámetro de constructor que ya
había aparecido en la lección 78/55 — dos proyectos independientes
chocando con el mismo límite por costumbre, sin que nadie lo forzara, es
la prueba más real de que merecía su propia lección dedicada (Módulo 8,
lección 36).

## Pendiente

- [x] Crear la tecnología "TypeScript" vía el flujo de admin, misma
  categoría que JavaScript.
- [x] Confirmar el orden de publicación: de un tirón, como HTML/CSS/JS.
- [x] Trasladar la lección 78 (ahora 55) — hecho, `contenido/javascript/TEMARIO.md`
  actualizado señalando el traslado.
- [x] 3 proyectos avanzados nuevos (56-58) — hecho, ver arriba.
