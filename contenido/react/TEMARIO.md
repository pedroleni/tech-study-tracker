# Temario de React: planteado desde cero

**Alcance:** temario completo de una tecnología "React" nueva en el
catálogo, hermana de `contenido/javascript/TEMARIO.md` y
`contenido/typescript/TEMARIO.md`. Mismo criterio de fondo: nada de
memoria, todo verificado en vivo el 2026-10-20. No existe ninguna
lección de React en producción todavía. Este documento es el plan a
aprobar antes de escribir la primera.

**Versión de referencia: React 19.3.1** (publicada el 2026-10-14,
`npm view react dist-tags` → `latest: 19.3.1`). Lo que cambia respecto
a lo que se suele encontrar en tutoriales:

- **19.3.0 (2026-09-09)** estabiliza `<ViewTransition>` +
  `addTransitionType` y los **refs en `<Fragment>`**; añade `browser()`
  en `react-dom` (marcar un subárbol como solo-navegador con
  `use(browser())`), integración con Trusted Types, y las transiciones
  pasan a renderizarse **de forma independiente** (una transición lenta
  ya no bloquea a otra). Aviso nuevo en desarrollo si `use()` se llama
  de forma condicional.
  [Post oficial](https://react.dev/blog/2026/09/09/react-19-3) ·
  [CHANGELOG](https://github.com/facebook/react/blob/main/CHANGELOG.md).
- **19.3.1 (2026-10-14)**: sus notas solo dicen «Improve transport
  protocol», pero es la versión que corrige un fallo crítico de ejecución
  remota de código y una denegación de servicio en los paquetes de Server
  Components ([GHSA-xqc2-xf4c-x3h3](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3),
  [GHSA-h3gv-c5rc-p453](https://github.com/react/react/security/advisories/GHSA-h3gv-c5rc-p453);
  [release](https://github.com/facebook/react/releases/tag/v19.3.1)). Los
  avisos de 2026 no salen en el blog de React: están en la
  [lista de avisos del repositorio](https://github.com/react/react/security/advisories).
- **19.2 (2025-10-01)** trajo `<Activity>`, `useEffectEvent`,
  `cacheSignal` y las *Performance tracks* de las DevTools del
  navegador.
- **React Compiler 1.0** (2025-10-07) es estable
  (`babel-plugin-react-compiler@1.0.0`), y `eslint-plugin-react-hooks`
  (hoy `7.1.1`) incluye las reglas que el compilador necesita
  (`purity`, `refs`, `immutability`, `set-state-in-effect`...).
- **Create React App está retirado** desde febrero de 2025: el punto de
  partida oficial es un framework o una herramienta de build (Vite,
  Parcel, Rsbuild).
- **React pertenece a la React Foundation** (Linux Foundation) desde
  febrero de 2026. Contexto, no contenido de lección.

**De dónde sale el contenido.** Igual que TypeScript, React es un
proyecto con una documentación oficial única y muy completa:

- **[react.dev/learn](https://react.dev/learn)**: la progresión
  *Describing the UI → Adding Interactivity → Managing State → Escape
  Hatches* es la columna vertebral de los módulos 2 a 6. Índice
  completo verificado en vivo vía
  [react.dev/llms.txt](https://react.dev/llms.txt) el 2026-10-20.
- **[react.dev/reference](https://react.dev/reference/react)**: una
  página por hook, componente y API. Fuente principal de los módulos 7
  a 9.
- **[Rules of React](https://react.dev/reference/rules)** y las páginas
  de cada regla de
  [eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks).
- **Documentación de terceros, solo donde React no llega** (módulos 8,
  11 y 12): [React Router](https://reactrouter.com/start/modes) (8.5.0),
  [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
  (5.104.5), [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  (16.3.3), [Vite](https://vite.dev/guide/) (8.3.4), [Zod](https://zod.dev/),
  [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) y MDN. Versiones
  comprobadas con `npm view` el 2026-10-20.

**No repite JavaScript, TypeScript ni HTML.** Da por aprendidos los
temarios anteriores: módulos ES, desestructuración, `map`/`filter`,
spread, closures, promesas, `fetch`, eventos del DOM, ARIA y
formularios accesibles (módulo 8 de HTML), Zod (proyecto `54` de
TypeScript). Ninguna lección re-explica qué es un closure. Sí se apoya
**a propósito** en los cuatro proyectos avanzados de JavaScript
(`76`-`79`), que ya construyeron a mano lo que React automatiza: estado
→ render, router con la History API, peticiones que llegan
desordenadas, limpieza de listeners.

## Revisión crítica (2026-10-20)

La primera versión de este plan (81 entradas) se revisó contra tres
referencias, no de memoria:

1. **El índice completo de react.dev** (`llms.txt`), página por página.
2. **El roadmap de React de roadmap.sh**, leído desde su repositorio
   (`kamranahmedse/developer-roadmap`, `src/data/roadmaps/react/content`)
   porque la web se renderiza con JavaScript.
3. **Los otros temarios de este proyecto**, para respetar sus
   convenciones y no repetir lo que ya enseñan.

### Errores de orden que tenía la primera versión

- **Inputs controlados iban después de "La interfaz como lista de
  estados"**, que ya construye un formulario. Pasan al final del
  módulo 3.
- **"Pensar en React" iba antes del estado**, pero su método (encontrar
  el estado mínimo, decidir dónde vive, el flujo de datos inverso)
  necesita los módulos 3 y 4. Pasa a cerrar el módulo 4.
- **Actions iba antes que transiciones.** `useOptimistic` y las
  acciones de formulario se ejecutan dentro de una transición. El
  módulo de formularios pasa detrás del de asincronía.
- **`StrictMode` activo en el sandbox pero explicado en la penúltima
  lección del bloque de rendimiento.** react.dev lo presenta en
  *Keeping Components Pure*. Aquí también: lección 12, y ningún ejemplo
  anterior imprime nada durante el render.
- **Todos los proyectos al final**: 76 lecciones sin construir nada.
  Los demás temarios usan dos niveles (🧪 proyectos en el navegador
  intercalados, como `html/11` o `javascript/72`, y proyectos avanzados
  con repositorio). Ahora hay seis 🧪 intercalados.

### Huecos de contenido: 13 lecciones nuevas

| Hueco | Por qué hace falta | Lección |
|---|---|---|
| Patrones de composición (huecos con props, componentes compuestos, render props) | Es como se diseñan las APIs de componentes; roadmap.sh lo trata como bloque propio | 30 |
| Accesibilidad en React | react.dev no tiene capítulo; el foco, los anuncios y `useId` son problemas propios de una interfaz que cambia sin recargar | 37 |
| Pedir datos: las tres formas | La pregunta número uno de quien empieza; estaba repartida entre cuatro lecciones sin ninguna que la cerrara | 52 |
| Validar formularios | Las Actions resuelven el envío, no la validación | 61 |
| Leer los errores de React | Avisos, *owner stacks* y errores minificados (`react.dev/errors/31`) | 64 |
| Dónde vive cada estado, y librerías (Zustand, Redux Toolkit) | Excluir Redux del todo deja al alumno sin poder leer el código de muchas empresas | 75 |
| Rutas anidadas, parámetros y la URL como estado | Una sola lección de router no llegaba ni a los parámetros | 77 |
| Librerías de componentes (Radix, React Aria, shadcn/ui) | Es como se construyen hoy la mayoría de interfaces, esta web incluida | 80 |
| Seguridad en React | Qué escapa React por ti, `dangerouslySetInnerHTML`, `javascript:` bloqueado (comprobado en el build de 19.3.1: *"React has blocked a javascript: URL as a security precaution."*), Trusted Types (19.3) y que las variables `VITE_` acaban en el navegador | 82 |
| Probar lo asíncrono | Una lección de tests no llegaba a esperas ni red simulada | 84 |
| Construir y desplegar | Variables de entorno, `vite build` y la reescritura a `index.html` de una SPA (la de esta web, real) | 85 |
| Así está hecha esta web | El equivalente a `git/55`: React real en producción, leído desde el código de Tech Study Tracker | 86 |
| Elegir un framework | react.dev empuja a usar uno; hacía falta un mapa honesto antes de despedirse | 90 |

### Huecos menores de react.dev, integrados sin lecciones nuevas

`createRoot` (lección 3) y sus avisos de error en la raíz
`onCaughtError`/`onUncaughtError` (53); *Add React to an Existing
Project* y *Editor Setup* (2); *React calls Components and Hooks* (12);
`flushSync` (34); `useDebugValue` (43); `<Profiler>`,
`captureOwnerStack` y *React DevTools for agents*, experimental (64-65);
*Debugging and Troubleshooting* del compilador (68); `<style>`,
`<script>`, `preload`/`preinit` (81); `cache` y `cacheSignal` (88).

### Fusiones para compensar

- `useId` entra en la lección de accesibilidad, que es para lo que existe.
- `useTransition` y `useDeferredValue`, una sola lección.
- "Tipar estado, reducers y contexto" y "Tipar eventos y refs", una sola.
- Componentes de clase y APIs heredadas, una sola lección de lectura.

### Lo que sigue fuera, a propósito

- **GraphQL** (Apollo, Relay, urql), **Formik**, **MobX/Jotai**:
  minoritarios frente a lo que sí entra.
- **React Native**: otro temario; se menciona en la lección 90.
- **Librerías de animación** (Motion, react-spring): mención en la 55,
  `<ViewTransition>` cubre el caso.
- **Testing general** (teoría, cobertura, Playwright E2E): el temario
  de JavaScript ya decidió que "testing merece su propio temario
  transversal". Aquí solo lo específico de React (83-84).
- **Server Components en práctica**: en React Router siguen siendo
  experimentales (*"experimental and subject to breaking changes in
  minor/patch releases"*, verificado en su documentación) y Next.js es
  otro temario. Se enseñan conceptualmente; el SSR sí se practica
  (proyecto 98).

### Tamaño y mantenimiento

- **98 entradas: el temario más grande del catálogo** (JavaScript tiene
  80). Se publica por tandas; la primera, los módulos 1-4. Si se quiere
  recortar, lo más prescindible son los módulos 13-14 (servidor y React
  antiguo, 5 lecciones) y los proyectos 97-98.
- **React publica a menudo** (19.2 en octubre de 2025, 19.3 en
  septiembre de 2026). El sandbox queda fijado a 19.3.1; las lecciones
  que dependen de una función reciente lo dicen ("desde 19.3"). Cuando
  salga una versión nueva: actualizar el bundle, pasar el test del árbol
  de renders y revisar las lecciones marcadas.

## Decisiones de alcance (tomadas por Claude, pendientes de tu visto bueno)

- **JSX por defecto, TypeScript en su propio módulo (10).** react.dev
  enseña en JavaScript; mezclar tipos desde la lección 1 duplica la
  carga. Los proyectos avanzados desde el 94 van en TSX.
- **Ecosistema acotado:** React Router, TanStack Query, Zustand/Redux
  Toolkit (solo para decidir y leer), Testing Library, Tailwind y
  shadcn/ui, sin convertir el temario en un curso de cada librería.
- **Componentes de clase solo para leer código antiguo** (módulo 14).

## Convenciones compartidas con el resto de temarios

Aplican todas las reglas de los temarios anteriores: plantilla de 7
secciones como mínimo, no como techo; variedad real de bloques; mismo
pipeline de validación Zod; sincronización solo a través del editor
admin real. Además, por la preferencia ya acordada: cada lección se
guarda como **borrador**, se enseña con captura y enlace, y solo se
publica con aprobación explícita.

Lo que cambia en React:

- **`editor-en-vivo` no sirve para código React.** Ejecuta HTML/CSS/JS
  tal cual y no tiene React dentro. Lo sustituye `react-en-vivo`. Se
  sigue usando en las pocas lecciones que comparan con JavaScript sin
  React.
- **`predice-el-resultado` es el bloque estrella de los módulos 3 y
  4.** Las ideas que más cuestan en React son predicciones que fallan:
  qué vale `count` después de tres `setCount(count + 1)`, qué componente
  se re-renderiza, si un estado sobrevive a un cambio de posición.
- **`codigo-anotado` y `predice-el-resultado` necesitan aprender JSX.**
  Hoy su esquema fija `lenguaje: "html"` y el resaltador
  (`src/components/codigo/resaltador.ts`) no tiene modo JSX. Envolver
  JSX en un `<script>`, como se hizo con JavaScript, lo colorearía mal
  (las etiquetas se leerían como comparaciones `<`). Es un
  prerrequisito (fase 0).
- **Los 🧪 proyectos en el navegador** siguen el patrón de
  `javascript/72`: sin VS Code, sin terminal, sin clonar nada; varios
  bloques `react-en-vivo` encadenados, cada uno con sus comprobaciones.

## Componentes propios para esta documentación

Cada temario con algo que ejecutar ganó su pareja de bloques "anotado +
en vivo" con el motor real: `sql-anotado`/`sql-en-vivo` (sql.js,
PGlite), `git-anotado`/`git-en-vivo` (wasm-git), compilación TypeScript
real en `editor-en-vivo`. React sigue el mismo patrón, más lo que solo
tiene sentido aquí: **ver los renders y los efectos**.

La revisión crítica encontró cuatro huecos en la primera propuesta:
`react-en-vivo` no podía **comprobar** un ejercicio (los bloques de SQL
y Git sí, con su solución), era de **un solo archivo** (la lección 4
trata de importar entre archivos), no tenía **ninguna fuente de datos**
(sin red real, las lecciones de asincronía y formularios no tienen qué
esperar) y dejaba **los efectos invisibles** (el módulo más difícil, sin
ninguna ayuda visual). Se añaden más abajo, ordenados por prioridad.

### 1. `react-en-vivo`: React de verdad dentro de la lección

Editor + vista previa con **React 19.3.1 real**. El alumno escribe
componentes, hace clic y ve cómo responden.

- **Cómo ejecuta.** Mismo iframe aislado que `editor-en-vivo`
  (`srcdoc`, `sandbox="allow-scripts allow-forms"`, altura por
  `postMessage`). El JSX se transforma con
  [Sucrase](https://github.com/alangpierce/sucrase): 46 KB comprimido
  frente a los 1,6 MB del compilador de TypeScript que ya carga la web
  (medido en la validación de
  [specs/features/react-en-vivo.md](../../specs/features/react-en-vivo.md)).
  TypeScript solo se cargará para los errores de tipos del módulo 10.
- **Varios archivos.** Pestañas `App.jsx`, `Tarjeta.jsx`,
  `estilos.css`...; los `import './Tarjeta.jsx'` entre ellos se
  resuelven dentro del iframe. Imprescindible para la lección 4 y para
  los proyectos en el navegador.
- **React servido desde nuestro propio dominio, nunca desde un CDN**
  (esm.sh, unpkg, jsDelivr), por tres motivos: los cortes judiciales de
  LaLiga bloquean IPs de Cloudflare durante los partidos; no
  depender de un tercero en cada lección; y la versión queda fijada.
  React 19 ya no publica builds UMD, así que un script genera un
  bundle IIFE desde los paquetes de npm fijados y lo deja en
  `public/vendor/react-en-vivo/19.3.1/`, igual que `public/ts-libs/`.
- **Build de desarrollo a propósito.** Pesa más (≈200 KB gzip entre
  `react` y `react-dom/client`, medido) pero trae los avisos que
  enseñan: "Each child in a list should have a unique key", hooks
  llamados en un condicional, el aviso de `use()` condicional de 19.3.
  Aparecen en un **panel de consola** propio que agrupa los
  `console.log` por commit ("— commit 3 —").
- **Ver el JavaScript generado.** Una pestaña muestra la salida real
  del compilador (`_jsx("h1", { children: ... })`). Para las lecciones
  5-7, que desmontan JSX.
- **`StrictMode` activado por defecto**, como en la plantilla de Vite,
  con opción de apagarlo por bloque.
- **Errores de render** en un recuadro dentro de la vista previa con el
  mensaje real de React, en vez de una pantalla en blanco.

### 2. `react-anotado`: código explicado + el resultado real funcionando

El equivalente a `sql-anotado`: el código no se edita, pero cada
fragmento lleva su nota (mismas reglas: cada `fragmento` debe ser una
subcadena literal del código, 1–8 anotaciones) y **debajo se ejecuta
de verdad**, con clics incluidos. Es el bloque de explicar; el anterior
es el de practicar. Admite las mismas opciones de panel (`mostrarArbol`,
`mostrarEfectos`, `api`).

### 3. Comprobaciones: ejercicios con ✅/❌ (imprescindible)

Lo que `consultaSolucion` es para `sql-en-vivo`. El autor escribe pasos
declarativos y el bloque los ejecuta sobre el componente del alumno,
recién montado, con [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
dentro del iframe:

```json
"comprobaciones": [
  {
    "descripcion": "Al añadir una tarea, aparece en la lista",
    "pasos": [
      { "escribir": { "etiqueta": "Nueva tarea", "texto": "Comprar pan" } },
      { "pulsar": { "rol": "button", "nombre": "Añadir" } }
    ],
    "espera": { "rol": "listitem", "nombre": "Comprar pan" }
  }
]
```

Resultado: ✅ o ❌ por comprobación, con el motivo ("no encuentro ningún
botón llamado «Añadir»"). Efecto secundario buscado: como los elementos
se buscan por **rol y etiqueta**, un `<div onClick>` no supera "pulsa el
botón Añadir". El alumno aprende marcado accesible sin que nadie se lo
pida.

### 4. API simulada con controles de red (imprescindible)

Un servidor de mentira dentro del iframe, con los datos que define la
lección (`"api": { "recetas": [...] }`), que el código usa como si fuera
`fetch`. Debajo de la vista previa, tres controles:

- **Latencia** (0-3 s): para ver un fallback de `<Suspense>` o un botón
  en "Enviando...".
- **Fallar la siguiente petición**: para ver un error boundary o cómo
  `useOptimistic` deshace solo el cambio.
- **Responder desordenado**: reproduce a voluntad el bug de carrera del
  proyecto `78` de JavaScript, y después su arreglo.

Promesas reales y tiempos reales, pero sin red: nada que LaLiga pueda
cortar, ningún tercero que se caiga, siempre los mismos datos. La
necesitan los módulos 7 y 8, los proyectos 56, 62 y 71 y la lección 84.

### 5. Árbol de renders (`mostrarArbol: true`): el componente diferencial

La confusión número uno de quien aprende React es **qué se re-renderiza
y por qué**. Este panel lo deja ver mientras se usa la vista previa:

```
  App ·3
  ├── Cabecera ·1            ← gris: no se ha vuelto a renderizar
  ├── Lista ·3               ← ámbar: re-render, estado conservado
  │   ├── Tarea key=a ·3       motivo: cambió la prop «alHacerClic» (función nueva)
  │   └── Tarea key=c ·1     ← verde: montada ahora (estado desde cero)
  └── Contador ·2   { count: 4 }   ← clic: props y estado actuales
```

- Cada nodo es un componente del alumno, con su **contador de
  renders**. En cada commit, los que se han renderizado **parpadean**.
- **Colores con significado:** montado (verde, el estado empieza de
  cero), re-renderizado (ámbar, el estado se conserva), sin cambios
  (gris), desmontado (se tacha un instante y desaparece).
- **Motivo del render**, como el "¿por qué se renderizó?" de las React
  DevTools: cambió su estado, cambió una prop (cuál), cambió un
  contexto, o simplemente se renderizó su padre. Es la lección 67 de
  `memo`/`useCallback` entera en una línea.
- **Cambios reales en el DOM:** un resaltado sobre la vista previa
  marca los nodos del DOM que React tocó de verdad en ese commit
  (`MutationObserver`). Junto al árbol, desmonta el mito de que
  "re-render = repintar la página": seis componentes renderizados, un
  solo texto cambiado.
- **Clic en un nodo:** sus props y el valor actual de cada `useState`.
- **Nada inventado.** Sale de los commits reales de React. Dentro del
  iframe se instala un `__REACT_DEVTOOLS_GLOBAL_HOOK__` mínimo, el
  mismo punto de enganche que usan las React DevTools; React avisa en
  cada `onCommitFiberRoot` (comprobado: el build de desarrollo de
  `react-dom` 19.3.1 lo llama). El iframe envía el árbol resumido por
  `postMessage`.
- **Seguridad:** el código del alumno corre en el mismo iframe y podría
  falsificar mensajes. La página solo acepta mensajes cuyo
  `event.source` sea ese iframe, los valida con Zod y límites de
  tamaño, y los pinta como texto, nunca como HTML. Lo peor que puede
  pasar es que alguien se dibuje un árbol falso en su propio navegador.
- **Riesgo asumido:** el hook usa internos de React (los *fibers*), no
  API pública. Como la versión del sandbox está fijada no cambia por
  sorpresa. Un test que renderiza un caso conocido y compara el árbol
  obtenido actúa de alarma al actualizar React.

Lecciones que lo usan: 13, 16–19, 25–26, 28, 66, 67 y 68, y el 🧪 71.

### 6. Registro de efectos (`mostrarEfectos: true`)

El módulo 6 es el que más cuesta, y los efectos no se ven. Este panel
los pone en una línea de tiempo por commit:

```
  commit 1   Chat  ▶ efecto      roomId: "general"
  commit 1   Chat  ⟲ limpieza    ← StrictMode: montar, desmontar, montar
  commit 1   Chat  ▶ efecto      roomId: "general"
  commit 4   Chat  ⟲ limpieza
  commit 4   Chat  ▶ efecto      cambió roomId: "general" → "viaje"
```

Responde a "¿por qué se volvió a ejecutar mi efecto?" con la dependencia
exacta que cambió. **Cómo:** el bundle de React del sandbox es nuestro,
así que `useEffect` (y `useLayoutEffect`) se envuelven para anotar
montaje, limpieza y qué dependencia cambió; React sigue ejecutando el
efecto real. Lecciones 38–46 y 63, el Wordle y el 🧪 71.

### 7. `arbol-de-componentes` estático

El mismo dibujo del árbol, pero escrito por el autor, para diagramas que
no salen de ejecutar código: árbol de render frente a árbol de
dependencias (13), dónde vive el estado antes y después de levantarlo
(25), proveedor y consumidores de un contexto (28), frontera servidor /
cliente (88). Reutiliza el componente visual del árbol de renders, así
que cuesta poco.

### 8. Kit del compilador (fase 4, tras una prueba rápida)

Dos funciones que comparten la misma dependencia pesada (Babel + el
compilador), cargadas **solo** en las lecciones que las usan:

- **`compilador-react`**: el componente a la izquierda y, a la derecha,
  la salida **real** de `babel-plugin-react-compiler@1.0.0` (las
  ranuras de caché `$[0]`, `$[1]`...).
- **Diagnósticos de `eslint-plugin-react-hooks`** dentro de
  `react-en-vivo`: `rules-of-hooks`, `exhaustive-deps`,
  `set-state-in-effect`, `purity`, `refs`... con el mensaje real del
  linter.

La lección 68 además quiere enseñar en el árbol de renders "los mismos
clics, menos nodos parpadeando", lo que exige ejecutar código compilado.
Si la prueba rápida demuestra que Babel en el navegador no compensa, la
alternativa es compilar el ejemplo **al escribir la lección** con un
script, guardar la salida en el bloque con la versión exacta y tener un
test que la regenere y avise si deja de coincidir.

### 9. Opcionales

- **Tests en vivo**: el alumno escribe sus propios tests contra su
  componente, reutilizando el motor de las comprobaciones. Para las
  lecciones 83–84.
- **Panel de anuncios**: muestra lo que leería un lector de pantalla
  cuando cambia una región `aria-live`. Para la lección 37 y el Wordle.

### Descartados, y por qué

- **Meter React Router o TanStack Query en el sandbox.** Cada librería
  es otro bundle que fijar y mantener; esas lecciones se ven mejor en un
  proyecto real con repositorio y vídeo.
- **Una línea de tiempo de Suspense aparte.** El árbol ya muestra los
  límites de `<Suspense>` y su fallback, y la API simulada controla
  cuánto se espera.

### Fases

| Fase | Qué se construye | Lo que desbloquea |
|---|---|---|
| 0 | Modo JSX/TSX en el resaltador; `lenguaje: 'jsx' \| 'tsx'` en `codigo-anotado` y `predice-el-resultado`; crear la tecnología "React" desde el admin | Lecciones 1–3 y 5–7 con bloques estáticos |
| 1 | `react-en-vivo` (varios archivos, consola, JavaScript generado) + `react-anotado` + comprobaciones | Módulos 1–5 (sin árbol), 🧪 14 y 🧪 32 |
| 2 | Árbol de renders (motivo y cambios del DOM incluidos) + árbol estático | Revisión de 13, 16–19 y 25–28; módulo 9 en parte |
| 3 | API simulada + registro de efectos | Módulos 6–8, 🧪 47, 🧪 56, 🧪 62 y 🧪 71 |
| 4 | Kit del compilador (tras la prueba) + opcionales | Módulo 9 completo, 83–84 |

El código de cada fase lo escribe Codex (Claude planifica y verifica con
Playwright real después). Cada fase tendrá su especificación en
`specs/features/react-en-vivo.md` antes de empezar, como `sql-en-vivo.md`
y `git-en-vivo.md`.

## Módulo 1: Qué es React y primeros pasos

| # | Lección | Fuentes |
|---|---|---|
| 1 | ¿Qué problema resuelve React? De pintar el DOM a mano a describir la interfaz | [Quick Start](https://react.dev/learn) + [Describing the UI](https://react.dev/learn/describing-the-ui) |
| 2 | Crear un proyecto con Vite… o añadir React a uno que ya tienes | [Build a React App from Scratch](https://react.dev/learn/build-a-react-app-from-scratch) + [Creating a React App](https://react.dev/learn/creating-a-react-app) + [Add React to an Existing Project](https://react.dev/learn/add-react-to-an-existing-project) + [Editor Setup](https://react.dev/learn/editor-setup) + [Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) |
| 3 | Tu primer componente, y dónde empieza todo: `createRoot` | [Your First Component](https://react.dev/learn/your-first-component) + [createRoot](https://react.dev/reference/react-dom/client/createRoot) |
| 4 | Importar y exportar componentes | [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) |
| 5 | JSX: marcado con reglas propias | [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) |
| 6 | JavaScript dentro de JSX: las llaves | [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) |
| 7 | Qué hay debajo de JSX: elementos y `createElement` | [createElement](https://react.dev/reference/react/createElement) + [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) |

## Módulo 2: Describir la interfaz

| # | Lección | Fuentes |
|---|---|---|
| 8 | Props: pasar datos a un componente | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) |
| 9 | `children`: componentes que envuelven a otros | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) |
| 10 | Renderizado condicional | [Conditional Rendering](https://react.dev/learn/conditional-rendering) |
| 11 | Listas y por qué `key` importa | [Rendering Lists](https://react.dev/learn/rendering-lists) |
| 12 | Componentes puros, y por qué `StrictMode` los renderiza dos veces | [Keeping Components Pure](https://react.dev/learn/keeping-components-pure) + [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) + [React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks) |
| 13 | Tu interfaz como un árbol | [Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree) |
| 14 | 🧪 Proyecto: la carta de un restaurante | Requiere este módulo completo — ver "Proyectos" más abajo |

## Módulo 3: Interactividad

| # | Lección | Fuentes |
|---|---|---|
| 15 | Responder a eventos | [Responding to Events](https://react.dev/learn/responding-to-events) + [Common components](https://react.dev/reference/react-dom/components/common) |
| 16 | El estado: la memoria de un componente | [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) + [useState](https://react.dev/reference/react/useState) |
| 17 | Render y commit: qué pasa cuando cambia el estado | [Render and Commit](https://react.dev/learn/render-and-commit) |
| 18 | El estado como una instantánea | [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) |
| 19 | Encolar actualizaciones: `setCount(c => c + 1)` | [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) |
| 20 | Actualizar objetos en el estado | [Updating Objects in State](https://react.dev/learn/updating-objects-in-state) |
| 21 | Actualizar arrays en el estado | [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) |
| 22 | Inputs controlados: el estado manda sobre el campo | [`<input>`](https://react.dev/reference/react-dom/components/input) + [`<select>`](https://react.dev/reference/react-dom/components/select) + [`<textarea>`](https://react.dev/reference/react-dom/components/textarea) |

## Módulo 4: Gestionar el estado

| # | Lección | Fuentes |
|---|---|---|
| 23 | La interfaz como una lista de estados posibles | [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state) |
| 24 | Elegir la estructura del estado | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) |
| 25 | Levantar el estado al padre | [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) |
| 26 | Conservar y reiniciar el estado: posición y `key` | [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) |
| 27 | `useReducer`: sacar la lógica del componente | [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) + [useReducer](https://react.dev/reference/react/useReducer) |
| 28 | Context: pasar datos en profundidad | [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) + [useContext](https://react.dev/reference/react/useContext) + [createContext](https://react.dev/reference/react/createContext) |
| 29 | Reducer + Context para escalar | [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) |
| 30 | Patrones de composición: huecos con props, componentes compuestos y render props | [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) + [cloneElement: Alternatives](https://react.dev/reference/react/cloneElement#alternatives) + [Children: Alternatives](https://react.dev/reference/react/Children#alternatives) |
| 31 | Pensar en React: de un diseño a componentes | [Thinking in React](https://react.dev/learn/thinking-in-react) |
| 32 | 🧪 Proyecto: tres en raya con viaje en el tiempo | Requiere los módulos 2–4 · [Tutorial: Tic-Tac-Toe](https://react.dev/learn/tutorial-tic-tac-toe) |

## Módulo 5: Refs y el DOM

| # | Lección | Fuentes |
|---|---|---|
| 33 | Refs: recordar sin volver a renderizar | [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs) + [useRef](https://react.dev/reference/react/useRef) |
| 34 | Manipular el DOM con refs (`ref` como prop, callbacks con limpieza, `useImperativeHandle`, `flushSync`) | [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) + [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) + [flushSync](https://react.dev/reference/react-dom/flushSync) |
| 35 | Refs en `<Fragment>`: un grupo de hermanos sin envoltorio (19.3) | [`<Fragment>`](https://react.dev/reference/react/Fragment) |
| 36 | Portales: renderizar fuera de tu sitio en el DOM | [createPortal](https://react.dev/reference/react-dom/createPortal) |
| 37 | Accesibilidad en React: foco, `useId` y anunciar cambios | [useId](https://react.dev/reference/react/useId) + [Dialog (Modal) Pattern (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) + [ARIA live regions (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) |

## Módulo 6: Efectos

| # | Lección | Fuentes |
|---|---|---|
| 38 | Sincronizar con efectos | [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) + [useEffect](https://react.dev/reference/react/useEffect) |
| 39 | Quizá no necesitas un efecto | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) + [set-state-in-effect](https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect) |
| 40 | El ciclo de vida de un efecto reactivo | [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) |
| 41 | `useEffectEvent`: separar eventos de efectos | [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) + [useEffectEvent](https://react.dev/reference/react/useEffectEvent) |
| 42 | Quitar dependencias de un efecto | [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) + [exhaustive-deps](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps) |
| 43 | Hooks personalizados | [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) + [useDebugValue](https://react.dev/reference/react/useDebugValue) |
| 44 | Las reglas de los hooks | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) + [rules-of-hooks](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks) |
| 45 | `useLayoutEffect` y `useInsertionEffect`: cuándo (casi nunca) | [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) + [useInsertionEffect](https://react.dev/reference/react/useInsertionEffect) |
| 46 | `useSyncExternalStore`: suscribirse a algo de fuera de React | [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) |
| 47 | 🧪 Proyecto: Wordle en español | Requiere los módulos 2–6 |

## Módulo 7: Asincronía y concurrencia

| # | Lección | Fuentes |
|---|---|---|
| 48 | `<Suspense>`: qué mostrar mientras algo carga | [`<Suspense>`](https://react.dev/reference/react/Suspense) |
| 49 | `use`: leer promesas y contexto | [use](https://react.dev/reference/react/use) |
| 50 | `lazy`: cargar componentes bajo demanda | [lazy](https://react.dev/reference/react/lazy) |
| 51 | Transiciones y valores diferidos: `useTransition`, `startTransition` y `useDeferredValue` | [useTransition](https://react.dev/reference/react/useTransition) + [startTransition](https://react.dev/reference/react/startTransition) + [useDeferredValue](https://react.dev/reference/react/useDeferredValue) |
| 52 | Pedir datos en React: un efecto, `use` con Suspense o una librería | [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) + [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) + [use](https://react.dev/reference/react/use) + [TanStack Query: Overview](https://tanstack.com/query/latest/docs/framework/react/overview) |
| 53 | Error boundaries: cuando un componente falla | [Component: catching rendering errors](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) + [createRoot](https://react.dev/reference/react-dom/client/createRoot) + [error-boundaries](https://react.dev/reference/eslint-plugin-react-hooks/lints/error-boundaries) |
| 54 | `<Activity>`: ocultar sin perder el estado | [`<Activity>`](https://react.dev/reference/react/Activity) |
| 55 | `<ViewTransition>` y `addTransitionType`: animar cambios de interfaz (19.3) | [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition) + [addTransitionType](https://react.dev/reference/react/addTransitionType) |
| 56 | 🧪 Proyecto: un buscador con la red bajo tu control | Requiere los módulos 2–7 |

## Módulo 8: Formularios y Actions

| # | Lección | Fuentes |
|---|---|---|
| 57 | `<form action>`: enviar un formulario con una función | [`<form>`](https://react.dev/reference/react-dom/components/form) |
| 58 | `useActionState`: el estado que devuelve una acción | [useActionState](https://react.dev/reference/react/useActionState) |
| 59 | `useFormStatus`: el estado del envío desde un hijo | [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) |
| 60 | `useOptimistic`: mostrar el resultado antes de que llegue | [useOptimistic](https://react.dev/reference/react/useOptimistic) |
| 61 | Validar formularios: el navegador, tu acción y Zod | [Constraint validation (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation) + [useActionState](https://react.dev/reference/react/useActionState) + [Zod](https://zod.dev/) |
| 62 | 🧪 Proyecto: comentarios con respuesta optimista | Requiere los módulos 2–8 |

## Módulo 9: Depurar, medir y optimizar

| # | Lección | Fuentes |
|---|---|---|
| 63 | `<StrictMode>` a fondo: qué ejecuta dos veces y para qué | [`<StrictMode>`](https://react.dev/reference/react/StrictMode) |
| 64 | Leer los errores de React: avisos, *owner stacks* y errores minificados | [captureOwnerStack](https://react.dev/reference/react/captureOwnerStack) + [Rules of React](https://react.dev/reference/rules) + [Minified error #31](https://react.dev/errors/31) |
| 65 | React DevTools, `<Profiler>` y las Performance tracks del navegador | [React Developer Tools](https://react.dev/learn/react-developer-tools) + [`<Profiler>`](https://react.dev/reference/react/Profiler) + [React Performance tracks](https://react.dev/reference/dev-tools/react-performance-tracks) + [React DevTools for agents](https://react.dev/reference/dev-tools/react-devtools-cdt-mcp) |
| 66 | Por qué se vuelve a renderizar un componente (y cuándo importa) | [Render and Commit](https://react.dev/learn/render-and-commit) + [React Developer Tools](https://react.dev/learn/react-developer-tools) |
| 67 | `memo`, `useMemo` y `useCallback`: memorizar a mano | [memo](https://react.dev/reference/react/memo) + [useMemo](https://react.dev/reference/react/useMemo) + [useCallback](https://react.dev/reference/react/useCallback) |
| 68 | React Compiler: memorizar sin escribirlo | [Introduction](https://react.dev/learn/react-compiler/introduction) + [Installation](https://react.dev/learn/react-compiler/installation) + [Debugging and Troubleshooting](https://react.dev/learn/react-compiler/debugging) |
| 69 | Adoptar el compilador poco a poco: `"use memo"` y `"use no memo"` | [Incremental Adoption](https://react.dev/learn/react-compiler/incremental-adoption) + [Directives](https://react.dev/reference/react-compiler/directives) + [compilationMode](https://react.dev/reference/react-compiler/compilationMode) |
| 70 | Las reglas que vigila el linter | [Lints](https://react.dev/reference/eslint-plugin-react-hooks) + [purity](https://react.dev/reference/eslint-plugin-react-hooks/lints/purity) + [refs](https://react.dev/reference/eslint-plugin-react-hooks/lints/refs) + [immutability](https://react.dev/reference/eslint-plugin-react-hooks/lints/immutability) + [static-components](https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components) |
| 71 | 🧪 Proyecto: caza de cinco bugs clásicos de React | Requiere los módulos 2–9 |

## Módulo 10: React con TypeScript

| # | Lección | Fuentes |
|---|---|---|
| 72 | Tipar props y `children` | [Using TypeScript](https://react.dev/learn/typescript) |
| 73 | Tipar estado, reducers, contexto, eventos y refs | [Using TypeScript](https://react.dev/learn/typescript) |
| 74 | Componentes genéricos | [Using TypeScript](https://react.dev/learn/typescript) + [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) |

## Módulo 11: Arquitectura de una aplicación

| # | Lección | Fuentes |
|---|---|---|
| 75 | Dónde vive cada estado, y cuándo hace falta una librería (Zustand, Redux Toolkit) | [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) + [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) + [Zustand](https://zustand.docs.pmnd.rs/) + [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started) |
| 76 | Rutas con React Router (lo mismo que el router hecho a mano del proyecto `78` de JS) | [Picking a Mode](https://reactrouter.com/start/modes) + [Declarative: Installation](https://reactrouter.com/start/declarative/installation) |
| 77 | Rutas anidadas, parámetros y la URL como estado | [Routing](https://reactrouter.com/start/declarative/routing) + [URL Values](https://reactrouter.com/start/declarative/url-values) |
| 78 | Datos del servidor con TanStack Query (la carrera de peticiones del `78`, resuelta) | [TanStack Query: Overview](https://tanstack.com/query/latest/docs/framework/react/overview) |
| 79 | Estilos en React: `className`, `style`, CSS Modules y Tailwind | [Common components](https://react.dev/reference/react-dom/components/common) + [Vite: CSS Modules](https://vite.dev/guide/features#css-modules) + [Tailwind con Vite](https://tailwindcss.com/docs/installation/using-vite) |
| 80 | Librerías de componentes: headless, Radix, React Aria y shadcn/ui | [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction) + [React Aria](https://react-spectrum.adobe.com/react-aria/) + [shadcn/ui](https://ui.shadcn.com/docs) |

## Módulo 12: Calidad y producción

| # | Lección | Fuentes |
|---|---|---|
| 81 | `<title>`, `<meta>`, `<link>`, `<style>` y `<script>` desde un componente | [`<title>`](https://react.dev/reference/react-dom/components/title) + [`<meta>`](https://react.dev/reference/react-dom/components/meta) + [`<link>`](https://react.dev/reference/react-dom/components/link) + [`<style>`](https://react.dev/reference/react-dom/components/style) + [`<script>`](https://react.dev/reference/react-dom/components/script) + [preload](https://react.dev/reference/react-dom/preload) |
| 82 | Seguridad en React: lo que React escapa por ti y lo que no | [dangerouslySetInnerHTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html) + [DOMPurify](https://github.com/cure53/DOMPurify) + [Trusted Types (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) + [Vite: Env Variables](https://vite.dev/guide/env-and-mode) |
| 83 | Probar componentes con Testing Library | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [user-event](https://testing-library.com/docs/user-event/intro) + [act](https://react.dev/reference/react/act) |
| 84 | Probar lo asíncrono: esperas, red simulada y hooks | [RTL API (`renderHook`)](https://testing-library.com/docs/react-testing-library/api) + [MSW](https://mswjs.io/docs/) |
| 85 | Construir y desplegar: variables de entorno, build y rutas de una SPA | [Vite: Env Variables and Modes](https://vite.dev/guide/env-and-mode) + [Vite: Deploying a Static Site](https://vite.dev/guide/static-deploy) + [Vercel: Rewrites](https://vercel.com/docs/rewrites) |
| 86 | Así está hecha esta web: React real en producción | El código de Tech Study Tracker (ver "Hallazgos" más abajo) |

## Módulo 13: React en el servidor (conceptual, sin editor en vivo)

| # | Lección | Fuentes |
|---|---|---|
| 87 | Renderizar en el servidor e hidratar; `browser()` para lo que solo existe en el navegador | [Server APIs](https://react.dev/reference/react-dom/server) + [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) + [browser](https://react.dev/reference/react-dom/browser) |
| 88 | Server Components y `'use client'` | [Server Components](https://react.dev/reference/rsc/server-components) + [`'use client'`](https://react.dev/reference/rsc/use-client) + [cache](https://react.dev/reference/react/cache) |
| 89 | Server Functions y `'use server'`, con un caso real: las vulnerabilidades de diciembre de 2025 | [Server Functions](https://react.dev/reference/rsc/server-functions) + [`'use server'`](https://react.dev/reference/rsc/use-server) + [Critical Security Vulnerability in RSC](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) |
| 90 | Elegir un framework (Next.js, React Router, Expo, TanStack Start) y qué viene después | [Creating a React App](https://react.dev/learn/creating-a-react-app) + [Next.js](https://nextjs.org/docs) + [React Router: Framework](https://reactrouter.com/start/framework/installation) + [Expo](https://docs.expo.dev/) + [TanStack Start](https://tanstack.com/start/latest) |

## Módulo 14: Leer React antiguo

| # | Lección | Fuentes |
|---|---|---|
| 91 | Componentes de clase, y lo que React 19 dejó atrás (`forwardRef`, `Context.Provider`, `defaultProps`...) | [Component](https://react.dev/reference/react/Component) + [Legacy React APIs](https://react.dev/reference/react/legacy) + [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) |

## Módulo 15: Proyectos avanzados

| # | Proyecto |
|---|---|
| 92 | Gestor de tareas en React (rehace el `76` de JS) |
| 93 | Recetario con React Router y TanStack Query (rehace el `78` de JS) |
| 94 | Panel en tiempo real, y hacerlo rápido (rehace el `79` de JS) |
| 95 | Reserva de refugios de montaña |
| 96 | Kit de componentes accesibles |
| 97 | Galería con `<ViewTransition>` y `<Activity>` |
| 98 | Revista con renderizado en servidor (React Router en modo framework) |

## Proyectos

Trece proyectos en dos niveles, como el resto del catálogo.

### 🧪 En el navegador (intercalados)

Sin instalar nada: varios bloques `react-en-vivo` encadenados, cada paso
con sus comprobaciones ✅/❌. Uno al final de cada bloque que se puede
practicar en el navegador (módulos 2 a 9). A partir del módulo 10 la
práctica son los proyectos avanzados: React Router, TanStack Query o los
tests necesitan un proyecto de verdad, no un sandbox.

| # | Proyecto | Qué practica |
|---|---|---|
| 14 | **La carta de un restaurante** | De datos a interfaz: componentes, props, `children`, listas con `key` y condicionales (alérgenos, "agotado"). Fotos de los platos generadas con Codex. |
| 32 | **Tres en raya con viaje en el tiempo** | El tutorial oficial, en castellano y ampliado: estado levantado, inmutabilidad, historial. El árbol de renders enseña qué se vuelve a pintar en cada jugada. |
| 47 | **Wordle en español** | `useReducer` como máquina de estados, un efecto con limpieza para el teclado físico, `useEffectEvent`, la partida guardada con `useSyncExternalStore` sobre `localStorage`, y anuncios para lector de pantalla. |
| 56 | **Un buscador con la red bajo tu control** | Con la API simulada: `<Suspense>`, `use`, transiciones, `useDeferredValue` y un error boundary. El alumno provoca respuestas desordenadas, ve el bug de carrera del proyecto `78` de JS y lo arregla. |
| 62 | **Comentarios con respuesta optimista** | `<form action>`, `useActionState`, `useFormStatus` y `useOptimistic`; "fallar la siguiente petición" enseña cómo el comentario optimista se retira solo. |
| 71 | **Caza de cinco bugs clásicos** | Una app pequeña con cinco fallos reales sembrados: `key` con el índice (al borrar una fila, lo escrito salta a otra), estado mutado con `push` (no se repinta), un intervalo sin limpieza (`StrictMode` lo duplica y lo delata), un cierre obsoleto (el contador se queda en 1) y `setState` durante el render ("Too many re-renders"). Se diagnostican con el árbol de renders y el registro de efectos; cada arreglo lo confirma una comprobación. |

### Avanzados (repositorio `pedroleni/react-proyectos`)

Mismo patrón que `css-proyectos` y `javascript-proyectos`: rama `main`
con TODOs, rama `solucion` completa, vídeo real a 1080p en cada lección,
imágenes generadas con Codex cuando el proyecto las necesite.

**Tres rehacen en React un proyecto de JavaScript** que el alumno ya
construyó a mano. Así ve exactamente qué le quita React y qué le añade,
en vez de creérselo: la lección compara las dos versiones lado a lado.

| # | Proyecto | Qué practica |
|---|---|---|
| 92 | **Gestor de tareas en React** (rehace el `76`) | `useReducer` + Context, hooks propios, persistencia; los primeros tests con Testing Library. Desaparece todo el "pintar a mano" de la versión en JavaScript. |
| 93 | **Recetario** (rehace el `78`) | Rutas anidadas, parámetros y búsqueda en la URL con React Router; TanStack Query (caché, y adiós al contador anti-carreras escrito a mano); páginas con `lazy`. |
| 94 | **Panel en tiempo real, y hacerlo rápido** (rehace el `79`) | `useSyncExternalStore` sobre el WebSocket, en TSX. Y rendimiento: cientos de filas que cambian cada segundo, medidas con las Performance tracks antes y después del React Compiler, más virtualización con [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction). Cubre el módulo 9 en un caso real. |
| 95 | **Reserva de refugios de montaña** | Formulario de varios pasos con Actions, validación con Zod, `useOptimistic` para la disponibilidad y accesibilidad completa. Fotos de los refugios generadas con Codex. |
| 96 | **Kit de componentes accesibles** | Diálogo, menú, pestañas y combobox desde cero: portales, foco, refs en `<Fragment>`, `useId`, teclado. Tests por rol y con axe, y al final la comparación con Radix: lo que te ahorra una librería headless. |
| 97 | **Galería con `<ViewTransition>` y `<Activity>`** | Transición de elemento compartido entre la cuadrícula y el detalle, animación según la dirección con `addTransitionType`, pestañas que conservan su estado. Fotografía generada con Codex. El más visual. |
| 98 | **Revista con renderizado en servidor** | React Router en [modo framework](https://reactrouter.com/start/framework/installation): SSR e hidratación, [loaders](https://reactrouter.com/start/framework/data-loading) y [actions](https://reactrouter.com/start/framework/actions), `<title>`/`<meta>` y Open Graph por artículo (enlaza con la lección `04` de HTML). Convierte el módulo 13 en práctica. |

### Banco de ideas (sin planificar)

- **Tests primero: arregla la tienda.** La rama `main` trae tests en
  rojo como TODOs y el alumno los pone en verde. Formato distinto,
  pensado para el futuro temario transversal de testing.
- **Chat con salas.** El ejemplo canónico de efectos de react.dev
  (conectar, desconectar, cambiar de sala), si el módulo 6 pide más
  práctica.
- **Kanban accesible con arrastrar y soltar.** Solapa con el gestor de
  tareas; solo si se quiere un proyecto de interacción compleja.

## Hallazgos sobre la propia web (material para la lección 86)

Leyendo el código real de Tech Study Tracker para la lección 86:

- **Usa React 19.2.4** con shadcn/ui (estilo `radix-nova`), Tailwind 4,
  TanStack Query envuelto en hooks propios (`useLeccion`,
  `useComments`, `useFavorites`...), React Router en modo declarativo,
  Zod y React Hook Form. Casi todo el ecosistema del módulo 11, en
  producción.
- **Lo que hace bien:** los motores pesados (sql.js, wasm-git, PGlite,
  TypeScript) se cargan con `import()` solo cuando una lección los
  necesita; el registro de bloques está cerrado a propósito (el JSON no
  puede elegir un componente arbitrario).
- **Lo que no:** no hay **ningún error boundary** ni avisos de error en
  `createRoot` (`src/main.tsx`). Si un bloque de laboratorio lanza un
  error al renderizar, se desmonta la aplicación entera y la página
  queda en blanco. Tampoco hay rutas con `lazy`: todas las páginas,
  admin incluido, van en el mismo bundle. Las dos cosas pueden ser la
  "mejora real" de la lección 86, como el PR #44 lo fue de `git/55`.

## Pendiente

- Aprobación de este plan, sobre todo de las decisiones de alcance, los
  nueve componentes y los trece proyectos.
- Tras aprobarlo: commit de este documento y la especificación de las
  fases 0 y 1 en `specs/features/react-en-vivo.md`.
