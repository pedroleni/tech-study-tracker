# Temario de React Router: ficha derivada de React

**Estado: APROBADO (2026-10-26), con los cambios de TypeScript.** Todavía
no hay ninguna lección escrita. El borrador se revisó con el mismo proceso
que `contenido/react/TEMARIO.md` y `contenido/postgresql/TEMARIO.md`. Lo
que se decidió al aprobarlo está en el «Registro de decisiones», al final.

**Alcance:** ficha nueva «React Router», hermana de «React», igual que
PostgreSQL lo es de SQL. Es la primera de las fichas del ecosistema que
decidió la «Revisión de cobertura (2026-10-26)» del temario de React:
*«React Router: modo datos y modo framework a fondo, SSR, middleware y
despliegue»*. Todo está verificado el **2026-10-26** contra la
documentación oficial, el changelog, npm, una prueba real en el navegador
y TypeScript 6.0.3, la versión del panel de errores de tipos. Nada sale de
memoria. Lo que no he podido comprobar va marcado como **sin verificar**.

**Versión de referencia: React Router 8.5.0**, publicada el 2026-10-19
(`npm view react-router version` y `npm view @react-router/dev version`
dan `8.5.0`). Pide Node 22.22 o superior y React 19.2.7 o superior; la
vista previa usa React 19.3.1. En modo framework, `@react-router/dev`
8.5.0 admite Vite 7 u 8 (hoy, 8.3.5) y TypeScript 5, 6 o 7.

| Versión | Fecha | Lo que importa para el temario |
|---|---|---|
| 8.0.0 | 2026-06-17 | Desaparece `react-router-dom`: todo se importa de `react-router`, salvo `RouterProvider` y `HydratedRouter`, que se importan de `react-router/dom`. El **middleware está siempre activo**: `context` es siempre un `RouterContextProvider`. Paquetes solo ESM. `splitRouteModules` pasa a ser una opción de primer nivel, **activa por defecto**. El `request` llega tal cual a `loader` y `action`. Mínimos: Node 22.22, React 19.2.7 y Vite 7 |
| 8.1.0 | 2026-06-29 | La instrumentación devuelve metadatos (URL, patrón de la ruta, parámetros) |
| 8.2.0 | 2026-07-08 | Entrada de servidor por defecto con Web Streams para los entornos que no son Node |
| 8.3.0 y 8.3.1 | 2026-07-22 y 2026-08-28 | `href()` y `generatePath` codifican los parámetros según el RFC 3986. Validación más estricta del origen de las `action` y de las URL de las redirecciones |
| 8.4.0 | 2026-09-15 | Contextos internos más finos: menos renders de componentes de ruta |
| **8.5.0** | **2026-10-19** | **Las APIs `viewTransition` del router quedan desaconsejadas** en favor de `<ViewTransition>` de React 19.3. Un fetcher vaciado con `fetcher.reset()` ya no recupera sus datos en la siguiente revalidación. Modo «API-only» (`ssr: "unstable_api-only"`), todavía inestable |

Fuentes:
[changelog de `react-router`](https://github.com/remix-run/react-router/blob/main/packages/react-router/CHANGELOG.md),
[changelog de la raíz](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md),
[Upgrading from v7](https://reactrouter.com/upgrading/v7) y las fechas de
`npm view react-router time`.

**De dónde sale el contenido.** De la documentación de reactrouter.com.
Desde la 7.17, el paquete `react-router` trae dentro su documentación en
Markdown (`node_modules/react-router/docs`: 86 páginas, sin la referencia
de la API, la sección de comunidad ni los tutoriales). He leído la de la
8.5.0 y he comprobado que coincide con la publicada
(`curl -s https://reactrouter.com/start/modes.md`, idéntica). Las fuentes
de cada lección enlazan a reactrouter.com. He comprobado que cada enlace
de este documento responde con un 200.

## Para quién es y qué da por sabido

Para quien ha terminado el temario de React, o al menos las lecciones de
la tabla. La ficha **no repite** nada de lo que enseñan; en cada lección
lo recuerda en una línea y enlaza a la original.

| Requisito | Por qué hace falta |
|---|---|
| React **76 y 77**: modo declarativo | `Link`, `NavLink`, rutas anidadas con `<Outlet>`, `useParams`, `useSearchParams` y `useNavigate` se usan desde la primera lección sin explicarlos. |
| React **99** (puente, en preparación): modo datos | `createBrowserRouter` + `RouterProvider`, `loader` + `useLoaderData`, `action` + `<Form>`, `useNavigation`, `ErrorBoundary` con `isRouteErrorResponse` y un 404 lanzado, `redirect` y `useFetcher`. La ficha arranca justo ahí: no vuelve a presentar ninguna de esas piezas, las lleva al fondo. |
| React **72 a 74**: React con TypeScript | **Toda la ficha va en TSX desde la lección 1**, con los errores de tipos reales en la vista previa. |
| TypeScript **38, 43, 45 y 52**: `typeof` en los tipos, `ReturnType`, `infer` y *declaration merging* | `useLoaderData<typeof loader>` sale de ahí, y el registro de tipos del router es un aumento de módulo. La lección 15 los da por sabidos. |
| React **48 a 51 y 53**: Suspense, `use`, transiciones y error boundaries | El router envuelve sus actualizaciones en `startTransition` y el *streaming* va con `<Suspense>`. |
| React **57 a 61**: Actions, `useOptimistic` y validar con Zod | Para comparar con `<Form>` y la `action` del router, y saber cuándo usar cada una. |
| React **102**: autenticación en una SPA | Las lecciones 10 (middleware) y 18 (sesiones) rehacen su ruta protegida, primero en el router y después en el servidor. |
| React **87 y 98**: SSR, hidratar y la revista en modo framework | El módulo 4 no vuelve a explicar qué es hidratar ni repite la revista; la da por hecha. |
| React **82, 85 y 89**: seguridad, desplegar una SPA y Server Functions | Base de las lecciones 20 y 22. |
| React **83 y 84**: Testing Library | Base de la lección 21. |
| Node.js **8** y **35 a 38**: variables de entorno y servidor HTTP | El modo framework es un servidor Node: `Request`, `Response`, estados y cabeceras. |

**Lo que repasa brevemente** (un párrafo y un enlace): las piezas de la
99, al principio de la lección 1; `HashRouter` y la reescritura a
`index.html` (76 y 85), al hablar de despliegue; la hidratación (87), en
la lección 16.

**Lo que no repite nunca:** el router hecho a mano (76), rutas anidadas,
parámetros y búsqueda (77), `React.lazy` (50), qué es SSR o un Server
Component (87 y 88), y los pasos de la revista (98).

## El mercado, con datos (consultado el 2026-10-26)

- **Descargas semanales en npm** (26 de septiembre a 2 de octubre de 2026,
  la última semana completa: desde el 6 de octubre, la API de npm da a cero
  días sueltos, y las semanas posteriores salen a la mitad):
  `react-router` 68,4 millones; `react-router-dom` 55 M; `next` 75,6 M;
  `@tanstack/react-router` 26,1 M; `@tanstack/react-start` 17,7 M;
  `@react-router/dev` (el modo framework) 3 M, y `@remix-run/react`
  (Remix 2) 659 000. Comprobado el 2026-10-27.
- **Por versión** (la última semana que publica la API de npm por
  versiones). `react-router`: la 7 el 45,4 %, la 6 el 33,7 %, **la 8 el
  11,6 %** y la 5 el 8,5 % (cuenta las instalaciones indirectas:
  `react-router-dom` 7 depende de `react-router`). `react-router-dom`: la
  7 el 46 %, la 6 el 42,5 % y la 5 el 10,8 %. `@react-router/dev`: la 7 el
  61,9 % y la 8 el 38,1 %.
- **[State of React 2025](https://2025.stateofreact.com/en-US/libraries/)**:
  el 72,2 % de quienes respondieron dicen haber usado React Router, sobre
  2.706 respuestas a esa pregunta. Next.js, el 80 %, y TanStack Query,
  el 68,1 %.
- **Remix.** La 7 de React Router es la continuación de Remix 2 (*«React
  Router v7 is the next major version of Remix after v2»*,
  [guía de migración de la 7](https://reactrouter.com/7.18.4/upgrading/remix)).
  Remix 3 (3.0.0 el 2026-10-01 y 3.1.0 el 2026-10-23) es un framework
  distinto: entre sus dependencias no está `react` y trae su propio modelo
  de componentes ([remix.run](https://remix.run/)). Una oferta que pide
  «Remix» casi siempre habla de una app de Remix 2 que mantener o migrar.
- **Ofertas de empleo: no he encontrado datos fiables.** InfoJobs no
  devuelve resultados a una lectura automática, y los artículos que
  aparecen en las búsquedas no dan cifras. No pongo ninguna.

**Qué se deduce para el temario:**

- La 8 tiene cuatro meses y solo se lleva el 11,6 % de las descargas. Casi
  todo el código que encontrarás en una empresa es de la 6 o de la 7. Por
  eso hay una lección para leer y migrar código antiguo (23) y un proyecto
  de migración (25).
- El modo framework es minoritario frente a Next.js (3 M frente a
  75,6 M descargas semanales), así que tiene un módulo propio, pero no se
  queda con toda la ficha.
- El modo datos se usa tanto en una SPA como dentro del framework, así que
  lleva el peso de la ficha: dos módulos, practicados en vivo.

## Cómo se ejecutan las lecciones

El temario de React descartó meter React Router en la vista previa
(«cada librería es otro bundle que fijar y mantener») y lo enseñó con
código anotado y routers hechos a mano (76-78). Su revisión de cobertura
ya anticipó que esta ficha necesitaría la librería dentro. Este temario
**revierte aquel descarte a propósito**: los módulos 1 a 3 se practican
con React Router de verdad en la vista previa, en TSX y con los errores de
tipos reales. El modo framework, en cambio, necesita un servidor, y se
practica en un repositorio.

### Prueba rápida (2026-10-26): React Router dentro de la vista previa

Hecha en el *scratchpad*, sin tocar el repositorio:

1. **Empaquetado.** esbuild 0.28.2 empaqueta `react-router` 8.5.0 y
   `react-router/dom` en un IIFE que **no incluye React**. Un plugin
   resuelve `react` y `react-dom` al `globalThis.__reactEnVivo` que ya deja
   el `react.js` del sandbox, así que la librería y el código del alumno
   comparten la misma copia de React (el metafile no tiene ninguna entrada
   de `react`, `react-dom` ni `scheduler`). Build de desarrollo y
   minificado: **224 KB, 71 KB con gzip**. Para comparar, el `react.js` del
   sandbox pesa 437 KB.
2. **Ejecución.** Iframe `srcdoc` con `sandbox="allow-scripts allow-forms"`
   (origen `null`), como el de `react-en-vivo`, con el `react.js` 19.3.1
   del sandbox. Probado con Chromium (Chrome for Testing r1243, sin
   interfaz) y con WebKit (Playwright). Funciona todo esto:
   `createMemoryRouter` + `RouterProvider` de `react-router/dom` con
   `StrictMode`, los `loader`, una `action` con `<Form method="post">` y
   `request.formData()`, la revalidación tras la `action`, `useFetcher`, un
   `data('No existe', { status: 404 })` lanzado que llega al
   `ErrorBoundary`, el middleware de cliente con `createContext`, las
   `instrumentations`, `<Await>`, `use()` de React y `useBlocker`. Lo
   mismo, con el envío del `<Form>` incluido, funciona también en el jsdom
   de Vitest.
3. **Lo que no funciona.** `createHashRouter` y `createBrowserRouter`
   fallan al crearlos o al navegar: Chromium dice «Failed to construct
   'URL': Invalid URL» y WebKit, «"/b" cannot be parsed as a URL.». El
   documento es `about:srcdoc` y su origen es `null`. Dentro de la vista
   previa **solo vale el router en memoria**, y la barra de direcciones
   hay que simularla.
4. **Un detalle que cambia el código.** El `request` de los `loader` lleva
   la URL `http://localhost/…`: es el origen que usa el historial en
   memoria.
5. **Tipos.** Los `.d.ts` de React Router 8.5.0, montados en
   `/node_modules` de la misma VFS que usa el panel de errores de tipos
   (`@typescript/vfs` con TypeScript 6.0.3), dan los mismos diagnósticos
   que `tsc` salvo en un detalle: el orden en que se escriben los miembros
   de una unión en los mensajes, que en la 6.0.3 depende del orden en que
   se crearon los tipos y puede cambiar entre el panel y `tsc`. Con la
   opción `stableTypeOrdering: true` en el panel, ese orden y el resto del
   mensaje coinciden con los de `tsc` 7.0.2, la versión que instala hoy un
   alumno (comprobado el 27-oct-2026 con los mensajes citados en React y
   React Router). Son 61 archivos y 469 KB.

**Firefox, sin verificar.** La especificación de `react-en-vivo` ya tiene
pendiente probarlo.

### Qué va en vivo y qué va en un repositorio

| Lecciones | Dónde se practica | Con qué bloques |
|---|---|---|
| 1 a 13 (módulos 1 a 3) | **En vivo, en TSX**, con React Router 8.5.0 dentro de `react-en-vivo` y `react-anotado` y sus tipos en el panel de errores (fases R0, R1 y R3) | Barra de direcciones, comprobaciones con URL, errores de tipos (y `exigirTiposCorrectos` en los ejercicios), API simulada con sus controles de red, `predice-el-resultado` y `codigo-anotado` en `tsx`, `arbol-de-componentes` estático para dibujar árboles de rutas. El registro del router llega con R2 |
| Partes de la 12 | Código anotado | `<ScrollRestoration>` y `useBeforeUnload` no tienen sentido en un iframe que crece con su contenido y nunca se descarga |
| 14 a 22 (módulo 4) | **Repositorio** `pedroleni/react-router-proyectos`, carpeta `taller/` | `codigo-anotado` en `tsx`, la salida real de la terminal y de `curl` en bloques de texto (como hizo la 98), `linea-de-tiempo`, `roles` |
| 15 | Las dos cosas | Lo del modo datos (`useLoaderData<typeof loader>`, `createContext<T>`, los parámetros), en vivo con el panel de tipos; los tipos generados del modo framework, en el `taller/` con `npm run typecheck` |
| 21 | Las dos cosas | `createRoutesStub` es un componente y se puede montar en la vista previa (**sin verificar**); los tests de verdad, con Vitest en el repositorio |
| 23 | Código anotado | Parejas «antes / después» con `codigo-anotado`. `comparador-antes-despues` no sirve: pinta HTML, no compara código |
| 24 y 25 | Repositorio, con vídeo | |

### Lo que no se puede ejecutar en el navegador, y cómo se practica

El modo framework no es una librería que se carga en una página. Son un
plugin de Vite, un servidor de desarrollo en Node y un build que parte el
código en dos (servidor y cliente). Nada de esto tiene un equivalente
honesto dentro de un iframe:

- `app/routes.ts`, que se lee al construir; los tipos generados
  (`react-router typegen`), y el reparto en trozos (`splitRouteModules`);
- el SSR con `renderToPipeableStream` y la hidratación con
  `HydratedRouter`;
- los `loader`, `action` y `middleware` **de servidor**, con su
  `Request` y su `Response` de verdad: códigos de estado, `headers`,
  `Set-Cookie`, sesiones y rutas de recursos;
- las peticiones `.data` y `/__manifest` del navegador al servidor;
- los módulos `.server`, el prerenderizado al construir y los adaptadores
  de despliegue.

**Cómo se practica:** con un repositorio que se clona, igual que
`pedroleni/react-proyectos`. El módulo 4 trabaja sobre una app de
prácticas (`taller/`) que crece lección a lección, de la 14 a la 22, con
tests que se ponen en verde a medida que avanzas, como en la revista de la
98. Los dos proyectos avanzados (24 y 25) la cierran. En las lecciones, lo
que pasa en el servidor se enseña con código anotado y con la salida real,
copiada de la terminal y comprobada.

## Componentes propios para esta ficha

Ningún bloque nuevo: todo son ampliaciones de `react-en-vivo` y
`react-anotado`, ordenadas por prioridad. El código lo escribe Codex;
Claude planifica y lo verifica después con Playwright, como en las fases
de React. **El detalle de la primera tanda (R0, R1 y R3) está en
`specs/features/react-en-vivo.md`, sección «React Router en la vista
previa (fases R0, R1 y R3)».**

### 1. React Router dentro de la vista previa (imprescindible, R0)

- **Qué es.** Un segundo bundle, `react-router.js`, construido desde
  `scripts/react-en-vivo/` con su lockfile y versiones exactas
  (`react-router@8.5.0`), con React como externo (el plugin de la prueba
  rápida). Se publica en
  `public/vendor/react-en-vivo/react-router/8.5.0/react-router.js`; la
  cabecera de caché inmutable de `vercel.json` ya cubre
  `/vendor/react-en-vivo/(.*)`. Se sirve desde nuestro dominio, nunca
  desde un CDN, por los mismos motivos que React: los bloqueos de LaLiga y
  no depender de terceros.
- **Para qué.** Para que `import { createMemoryRouter } from 'react-router'`
  y `import { RouterProvider } from 'react-router/dom'` funcionen en el
  código del alumno.
- **Alcance mínimo.**
  - `documento.ts` añade el `<script>` solo si algún módulo transformado
    pide `react-router`, así que el resto de lecciones de React no pagan
    sus 71 KB. Un `import type` no cuenta: Sucrase lo borra.
  - `montaje.js` añade `react-router` y `react-router/dom` a `EXTERNOS`,
    y el mensaje de error pasa a decir «solo React, React Router y tus
    archivos».
  - Build de **desarrollo**, como el de React, para conservar avisos como
    «No routes matched location».
  - Un test monta un router conocido (`loader`, `action` y
    `ErrorBoundary`) con el bundle real, para que salte la alarma si una
    versión nueva rompe algo.
- **Pensado para servir también a la próxima ficha.** El mismo mecanismo,
  «una biblioteca, un bundle con React compartido», vale para TanStack
  Query.

### 2. Barra de direcciones (imprescindible, R1)

Las lecciones 76 y 77 tuvieron que meter un «navegador de mentira» en el
código del alumno, en siete bloques: `Navegador.jsx` ocupa uno de los 6
archivos posibles y 3.014 de sus 4.000 caracteres. Aquí la barra es del
bloque, no del alumno:

```
 ← → ↻  [ /pistas/3?dia=2026-11-04                      ] Ir
         Historial en memoria · en tu proyecto, createBrowserRouter usa el del navegador
```

- **Cómo.** El runtime de la vista previa envuelve `createMemoryRouter`.
  Registra el router que crea el alumno, se suscribe con
  `router.subscribe` y envía la ubicación a la página por `postMessage`.
  La barra vive en la página, fuera del iframe: así le llegan el tema
  oscuro y la accesibilidad de la web, y el CSS del alumno no la toca.
  Atrás y Adelante llaman a `router.navigate(-1)` y `router.navigate(1)`.
- **Alias (aprobado).** `createBrowserRouter`, `createHashRouter`,
  `BrowserRouter` y `HashRouter` usan el historial en memoria, con la
  etiqueta de la barra y un aviso en la consola. Así el código es idéntico
  al de un proyecto de Vite.
- **«Ir» y «Recargar» simulan una carga nueva.** La app se desmonta, sus
  módulos se vuelven a evaluar desde cero y arranca en esa URL: se pierde
  el estado y se ejecutan todos los `loader`, como en un navegador.
  **La API simulada conserva sus datos**, como un servidor de verdad, así
  que una lección puede enseñar «guardas, recargas y sigue ahí».
  «Reiniciar» lo devuelve todo al principio. Editar el código conserva la
  URL, como la recarga en caliente de Vite.
- **Ajuste en `red.js`.** Que acepte también `http://localhost/api/…`.
  Si no, `fetch(new URL('/api/x', request.url))`, el patrón natural
  dentro de un `loader`, se escapa a la red de verdad.
- **Seguridad.** Igual que el resto de mensajes del iframe: solo se
  aceptan los que vienen de ese iframe, se validan con Zod y con límites
  de tamaño, y la URL se pinta como texto.

### 3. Comprobaciones con URL (imprescindible, R1)

Las comprobaciones ✅/❌ de `react-en-vivo` ganan cuatro piezas:

```json
"comprobaciones": [
  {
    "descripcion": "Cambiar de día deja el día en la URL",
    "urlInicial": "/pistas/3?dia=2026-11-04",
    "pasos": [{ "pulsar": { "rol": "link", "nombre": "Día siguiente" } }],
    "espera": { "url": "/pistas/3?dia=2026-11-05" }
  },
  {
    "descripcion": "Atrás vuelve al día anterior sin perder la reserva",
    "urlInicial": "/pistas/3?dia=2026-11-04",
    "pasos": [
      { "pulsar": { "rol": "button", "nombre": "Reservar las 18:00" } },
      { "navegar": "/pistas/3?dia=2026-11-05" },
      { "atras": true }
    ],
    "espera": { "texto": "Reservada por ti" }
  }
]
```

- `urlInicial`: en qué URL se monta la app para esa comprobación (cada
  comprobación ya monta la app de cero).
- Pasos `navegar` (como un `navigate()`), `atras`, `adelante` y
  `recargar`.
- Espera `url`: ruta, búsqueda y almohadilla exactas.

### 4. Tipos de React Router en el panel de errores de tipos (imprescindible, R3)

Toda la ficha va en TSX, así que el panel de errores de tipos tiene que
conocer React Router desde la lección 1.

- Los `.d.ts` de `react-router` 8.5.0 (`dist/production`, 58 archivos y
  464 KB) y los de `cookie-es` (11 KB), que el router importa, van en **un
  solo archivo**, `tipos.json`, junto al bundle:
  `public/vendor/react-en-vivo/react-router/8.5.0/tipos.json`.
- El panel lo pide **solo** cuando algún `.ts` o `.tsx` del bloque importa
  `react-router` (también con `import type`), una vez por sesión.
- `react-anotado` gana `lenguaje: 'tsx'`, para que el código que explica
  sea el mismo que el alumno escribe en `react-en-vivo`.
- Comprobado en la prueba rápida: la VFS del panel da los mismos
  diagnósticos que `tsc`.

### 5. Registro del router, `mostrarRouter` (muy recomendable, R2: tanda posterior)

El equivalente al registro de efectos, para la pregunta que más cuesta en
el modo datos: **«¿qué se ha ejecutado, y por qué?»**

```
  navegación   /pistas/3?dia=4 → ?dia=5                         212 ms
    middleware   raíz
    loader       raíz                                            12 ms
    loader       pista                                          180 ms
  fetcher «reserva-18»   POST /pistas/3
    action       pista                                           95 ms
    revalidación: loader raíz, loader pista
```

- **Cómo, sin internos.** Con la API pública de instrumentación
  (`instrumentations`, estable desde la 7.15): el envoltorio de
  `createMemoryRouter` añade la suya a la del alumno. Ve las navegaciones,
  los fetchers y cada `loader`, `action`, `middleware` y `lazy`, por ruta.
  Comprobado en la prueba rápida. Al ser API pública, el riesgo es mucho
  menor que el del árbol de renders, que usa los *fibers*.
- **Lo que no ve la instrumentación** (las peticiones canceladas) ya lo
  enseña el panel de red de la API simulada. Qué campos exactos se pintan
  queda para su especificación.
- **Lecciones que lo usan:** 1, 2, 4, 5, 10 y 11, y los 🧪 7 y 13.

### 6. Opcional

- **Sacar del árbol de renders los componentes del router.** Con
  `mostrarArbol`, el árbol se llenaría de componentes internos del router
  (`RouterProvider`, rutas renderizadas, `Outlet`…) y, al estar
  minificados, con nombres ilegibles. **Deducido, sin verificar.** Solo
  hace falta si alguna lección de la ficha enseña el árbol; hoy ninguna lo
  necesita.

### Descartados, y por qué

- **Los routers del navegador dentro de la vista previa.** Imposible:
  comprobado en Chromium y en WebKit (ver la prueba rápida).
- **Simular el modo framework en la vista previa**, separando a mano
  «servidor» y «cliente» dentro del iframe. Enseñaría algo que no existe:
  ni hay red, ni `Set-Cookie`, ni hidratación de verdad.
- **WebContainers (StackBlitz)** para ejecutar Vite y Node en el
  navegador. Exige servir toda la web aislada entre orígenes
  (`Cross-Origin-Embedder-Policy: require-corp` y
  `Cross-Origin-Opener-Policy: same-origin`,
  [guía oficial](https://webcontainers.io/guides/configuring-headers)), y
  entonces cualquier recurso de otro origen tiene que permitirlo
  expresamente. Además, *«Licensing is required for production usage of
  the API in a commercial, for-profit setting»*, y sería un tercero en
  cada lección, justo lo que se evita por LaLiga.
- **Un bloque estático de «red anotada»** para las peticiones del modo
  framework (`.data`, `/__manifest`). La salida real en un bloque de texto,
  como hizo la 98, basta.
- **Los tipos de React Router en `/vendor/react-kit/`**, junto a los de
  React. Van con el bundle del router, en su carpeta versionada: así una
  versión nueva de React Router cambia una sola ruta.

### Fases, coste y riesgos

| Fase | Qué se construye | Lo que desbloquea | Tanda | Tamaño (estimación) |
|---|---|---|---|---|
| R0 | El bundle de React Router; su carga solo cuando se importa; `EXTERNOS`; el test con el bundle real | Bloques con `createMemoryRouter`, sin barra | Primera | Pequeña |
| R1 | La barra y el alias; recargar sin perder la URL ni los datos de la API simulada; `http://localhost/api`; comprobaciones con URL | Módulos 1 a 3 y los 🧪 7 y 13 | Primera | Media |
| R3 | Los tipos de React Router en el panel; `react-anotado` en TSX | Toda la ficha en TSX desde la lección 1 | Primera | Pequeña |
| R2 | El registro del router (`mostrarRouter`) | La ayuda visual de las lecciones 1, 2, 4, 5, 10 y 11 | Posterior | Media |
| — | Sacar del árbol los componentes del router | Lecciones que enseñen el árbol con el router | Si hace falta | Pequeña |

**Coste medido:** 224 KB más (71 KB con gzip) solo en las lecciones que
importan el router, y 480 KB de tipos (61 archivos en `tipos.json`) solo
en los bloques TSX que lo importan. Si se quitan las exportaciones de
Server Components (`rsc/browser.js` ocupa 24 KB antes de minificar), el
bundle pesaría algo menos: **sin medir**.

**Mantenimiento.** React Router ha publicado seis versiones menores de la
8, y dos parches, en cuatro meses (8.0.0 el 17 de junio; 8.5.0 el 19 de
octubre). La versión de la vista previa queda fijada y su ruta lleva el
número. Se actualiza cuando una lección lo necesita, y entonces se pasa el
test del router conocido y se revisan las lecciones que dicen «desde 8.x».

**Riesgos:**

- **El alias de `createBrowserRouter`** puede esconder que la vista previa
  usa un historial en memoria. Por eso lleva la etiqueta visible de la
  barra y un aviso en la consola.
- **El origen `http://localhost`** de los `request` sorprende. Cada
  lección que lo enseñe debe decirlo.
- **APIs que no tienen sentido en un iframe**: `<ScrollRestoration>`,
  `useBeforeUnload`, `<Link reloadDocument>` y `redirectDocument`. Van con
  código anotado.
- **`lazy` en la vista previa.** Sucrase convierte `import('./Pagina.tsx')`
  en `Promise.resolve().then(() => require('./Pagina.tsx'))` (comprobado
  con el Sucrase de la web), así que el módulo ya está en memoria y no hay
  trozos reales. Para que se note la carga habría que simular una espera.
  Que `lazy` funcione así dentro del router está **sin verificar**.
- **El registro de efectos** envuelve solo el React del alumno, así que
  los efectos internos del router no deberían aparecer. **Deducido de
  `montaje.js`, sin verificar.**

## Convenciones

Las de todos los temarios: plantilla de 7 secciones como mínimo, no como
techo; variedad real de bloques; el mismo pipeline de validación con Zod;
sincronización solo con el editor de administración real; cada lección
nace como **borrador** y se enseña con captura y enlace antes de
publicarla.

Lo propio de esta ficha:

- **TSX desde la lección 1, en todos los bloques.** `react-en-vivo` con
  archivos `.tsx` y el panel de errores de tipos (con los tipos de React
  Router, fase R3); `react-anotado`, `codigo-anotado` y
  `predice-el-resultado` con `lenguaje: "tsx"`. Como en Vite y en el
  módulo 10 de React, los errores de tipos se enseñan pero **no impiden
  ejecutar**. Un ejercicio que quiera exigirlos usa
  `exigirTiposCorrectos`. Los tipos del router se explican donde
  aparecen; la lección 15 los junta y los lleva al fondo.
- **Cada afirmación sobre React Router se comprueba en un proyecto real**
  con la 8.5.0 (Vite para el modo datos, la plantilla oficial para el modo
  framework), como hicieron la 76 y la 77. Cada afirmación sobre tipos se
  comprueba con TypeScript 6.0.3, la versión del panel. Si una lección
  depende de algo reciente, lo dice: «desde 8.5».
- **`predice-el-resultado` vuelve a ser el bloque estrella**, ahora para
  el router: qué `loader` se vuelven a ejecutar, adónde sube un error, qué
  queda en pantalla mientras se navega, qué pasa con dos fetchers a la
  vez, qué tipo infiere TypeScript.
- **Ejemplos situados en España**, como el resto: un polideportivo, una
  protectora, una cooperativa.

## Módulo 1: React Router 8 por dentro

| # | Lección | Fuentes |
|---|---|---|
| 1 | React Router 8 hoy: tres modos, lo que cambió en la 8 y un router que vive fuera de React | [Picking a Mode](https://reactrouter.com/start/modes) + [Custom Framework](https://reactrouter.com/start/data/custom) + [createMemoryRouter](https://reactrouter.com/api/data-routers/createMemoryRouter) + [Upgrading from v7](https://reactrouter.com/upgrading/v7) + [Changelog](https://reactrouter.com/changelog) |

**Qué entra en la 1:**

- Repaso de la 99 en un párrafo.
- Los tres modos y el consejo oficial para elegir.
- Lo que cambió de la 8.0 a la 8.5 (la tabla de arriba).
- Qué versiones te vas a encontrar en el trabajo (los datos de npm).
- El router como objeto fuera de React: `router.state` (`location`,
  `navigation`, `loaderData`, `fetchers`), `router.navigate` y
  `router.subscribe`.
- El ciclo de una navegación: encajar rutas, middleware, `loader` en
  paralelo y render dentro de `startTransition`.
- En vivo y en TSX, con la barra (y el registro, cuando llegue R2).
- Para predecir: ¿se ejecutan en cascada los `loader` de la madre y de la
  hija? No: en paralelo, lo dice
  [Data Strategy](https://reactrouter.com/how-to/data-strategy).

## Módulo 2: Cargar y enviar datos (modo datos, en vivo)

| # | Lección | Fuentes |
|---|---|---|
| 2 | Cada ruta, sus datos: `loader` en paralelo, `request` y `signal`, y los datos de la madre | [Data Loading](https://reactrouter.com/start/data/data-loading) + [Route Object](https://reactrouter.com/start/data/route-object) + [Routing](https://reactrouter.com/start/data/routing) + [Race Conditions](https://reactrouter.com/explanation/race-conditions) + [useRouteLoaderData](https://reactrouter.com/api/hooks/useRouteLoaderData) + [useMatches](https://reactrouter.com/api/hooks/useMatches) + [Using handle](https://reactrouter.com/how-to/using-handle) |
| 3 | Mutaciones: `action`, `<Form>`, `useSubmit` y varias acciones en una ruta | [Actions](https://reactrouter.com/start/data/actions) + [Form vs. fetcher](https://reactrouter.com/explanation/form-vs-fetcher) + [Form Validation](https://reactrouter.com/how-to/form-validation) + [Status Codes](https://reactrouter.com/how-to/status) + [data](https://reactrouter.com/api/utils/data) + [redirect](https://reactrouter.com/api/utils/redirect) |
| 4 | Revalidación: qué `loader` vuelven a ejecutarse, y cuándo no hace falta | [Revalidation Optimization](https://reactrouter.com/how-to/optimize-revalidation) + [Route Object: shouldRevalidate](https://reactrouter.com/start/data/route-object) + [useRevalidator](https://reactrouter.com/api/hooks/useRevalidator) |
| 5 | Fetchers a fondo: enviar y cargar sin navegar, varios a la vez | [Using Fetchers](https://reactrouter.com/how-to/fetchers) + [Network Concurrency Management](https://reactrouter.com/explanation/concurrency) + [useFetcher](https://reactrouter.com/api/hooks/useFetcher) + [useFetchers](https://reactrouter.com/api/hooks/useFetchers) |
| 6 | Interfaz pendiente y optimista con el router | [Pending UI](https://reactrouter.com/start/data/pending-ui) + [Pending UI (framework)](https://reactrouter.com/start/framework/pending-ui) + [useNavigation](https://reactrouter.com/api/hooks/useNavigation) + [React Transitions](https://reactrouter.com/explanation/react-transitions) |
| 7 | 🧪 Proyecto: reservas del polideportivo | Requiere los módulos 1 y 2: ver «Proyectos» más abajo |

**Qué entra en cada una:**

- **2.** El `loader` de cada ruta, en paralelo, frente a la cascada de
  efectos de la lección 52 de React. `params` y `request.url`, con una
  búsqueda hecha con `<Form method="get">` que lee el `loader` (la
  búsqueda de la 77, desde el router). `request.signal` y el bug de
  carrera del proyecto 78 de JavaScript: con la API simulada en
  «desordenar», el router cancela la navegación vieja sin que escribas
  nada. Así lo dice la documentación; se comprobará en la vista previa en
  la fase R1. `useRouteLoaderData` para leer los datos de la madre;
  `handle` + `useMatches` para unas migas de pan. Las rutas de
  maquetación, los segmentos opcionales y los comodines ya los vio la 77;
  aquí solo se escriben como objetos de ruta. En TSX, el primer
  `useLoaderData<typeof loader>()` y el primer `params.id` que puede ser
  `undefined`.
- **3.** `request.formData()`. Varios botones y una sola `action`, con el
  `name` del botón (el patrón *intent*). Devolver los errores de
  validación con `data({ errores }, { status: 400 })` en vez de lanzarlos.
  Redirigir tras un `POST`. `useSubmit` para enviar desde código. Cuándo
  conviene `<form action>` con `useActionState` (57-58 de React) y cuándo
  la `action` del router.
- **4.** El comportamiento por defecto, que **cambia según el modo**
  (verificado en la documentación de 8.5.0):
  - En modo datos y en el SPA Mode del framework, tras un envío con éxito
    se revalidan todos los `loader` activos. Al navegar con un enlace, un
    `loader` solo se repite si cambian los parámetros dinámicos de su ruta
    o cualquier parámetro de búsqueda. Navegar a la misma URL exacta cuenta
    como recargar: se repiten todos.
  - En el modo framework con SSR, se revalida también al navegar.
  - Un envío que falla depende de **cómo** falla (comprobado en 8.5.0 al
    escribir la lección 8):
    - `return data(…, 409)`: no revalida nada;
    - `throw data(…, { status })` o un `Error`: vuelven a ejecutarse los
      `loader` que quedan por encima del límite de error;
    - `throw new Response(…, { status })`: no revalida nada.

    La documentación lo resume como «un 4xx o 5xx no revalida»: la lección
    cuenta los tres casos.

  Después, `shouldRevalidate` con `defaultShouldRevalidate`, y
  `useRevalidator` para revalidar al volver a la pestaña. En vivo, el
  registro (R2) enseña «esta `action` hizo volver a ejecutar estos tres
  `loader`».
- **5.** `fetcher.Form`, `fetcher.submit` y `fetcher.load`; `data`,
  `state` y `formData`. Una `key` para compartir un fetcher entre
  componentes, y `useFetchers` para verlos todos. Varias peticiones a la
  vez: gana la revalidación más reciente y las viejas se cancelan
  ([Network Concurrency Management](https://reactrouter.com/explanation/concurrency)).
  Un buscador que sugiere mientras escribes, con `fetcher.load`. Desde la
  8.5, un fetcher vaciado con `fetcher.reset()` no recupera sus datos en
  la siguiente revalidación.
- **6.**
  - `useNavigation` (`state`, `location` y `formData`), `NavLink` con
    `isPending` y un indicador de carga global.
  - La interfaz optimista que se lee de `fetcher.formData`, sin estado
    propio, y qué pasa cuando falla («fallar la siguiente petición»).
  - Frente a `useOptimistic` (60 de React): la opción `useTransitions` es
    estable desde la 7.15. En la 8.5.0 sigue siendo opcional, aunque la
    documentación aún dice que el plan era activarla por defecto en la 8;
    el changelog de la 8.0 no lo recoge.

## Módulo 3: Más allá de cargar y enviar (modo datos, en vivo)

| # | Lección | Fuentes |
|---|---|---|
| 8 | Errores por ruta a fondo: adónde sube cada fallo y qué queda en pantalla | [Error Boundaries](https://reactrouter.com/how-to/error-boundary) + [Error Reporting](https://reactrouter.com/how-to/error-reporting) + [useAsyncError](https://reactrouter.com/api/hooks/useAsyncError) + [Status Codes](https://reactrouter.com/how-to/status) |
| 9 | Streaming: datos que no bloquean la página, con `<Await>` o `use` | [Streaming with Suspense](https://reactrouter.com/how-to/suspense) + [Await](https://reactrouter.com/api/components/Await) + [useAsyncError](https://reactrouter.com/api/hooks/useAsyncError) |
| 10 | Middleware y contexto del router | [Middleware](https://reactrouter.com/how-to/middleware) + [Route Object: middleware](https://reactrouter.com/start/data/route-object) + [createContext](https://reactrouter.com/api/utils/createContext) |
| 11 | Rutas bajo demanda: `lazy`, `HydrateFallback` y `patchRoutesOnNavigation` | [Route Object: lazy](https://reactrouter.com/start/data/route-object) + [Custom Framework: Lazy Loading](https://reactrouter.com/start/data/custom) + [createMemoryRouter: patchRoutesOnNavigation](https://reactrouter.com/api/data-routers/createMemoryRouter) |
| 12 | Navegar con cuidado: cambios sin guardar, desplazamiento, foco y transiciones | [Navigation Blocking](https://reactrouter.com/how-to/navigation-blocking) + [useBlocker](https://reactrouter.com/api/hooks/useBlocker) + [ScrollRestoration](https://reactrouter.com/api/components/ScrollRestoration) + [Accessibility](https://reactrouter.com/how-to/accessibility) + [View Transitions](https://reactrouter.com/how-to/view-transitions) |
| 13 | 🧪 Proyecto: la intranet de la protectora | Requiere los módulos 1 a 3 |

**Qué entra en cada una:**

- **8.** La 99 presentó el `ErrorBoundary` y el 404; aquí se lleva al
  fondo:
  - Los límites anidados: el error sube al más cercano y la madre sigue
    en pantalla.
  - Un error en un `loader`, en una `action`, al pintar y en una promesa
    que llega por *streaming*.
  - Un `data()` lanzado frente a un `Error`, y los estados 401, 403, 404 y
    500. En TSX, `useRouteError()` devuelve `unknown` y hay que
    estrecharlo con `isRouteErrorResponse` (a fondo, en la 15).
  - `onError` de `RouterProvider` para avisar de un fallo, que en React era
    `informar` (53).

  Es la lección con más `predice-el-resultado` de la ficha.
- **9.** Devolver promesas sin `await` (dentro de un objeto, nunca una
  promesa suelta); `<Suspense>` con `<Await>` o con `use()` de React (48 y
  49); los errores de una promesa (`useAsyncError`); qué es crítico y qué
  puede esperar. Comprobado en vivo. El tiempo límite del servidor
  (`streamTimeout`, 4.950 ms por defecto) se ve en la 17.
- **10.** El middleware de cliente en modo datos (comprobado en vivo). La
  cadena de madre a hija y de vuelta. `next()`, `createContext<T>()`,
  `context.get` y `context.set`, y `getContext`.
  - Autenticación con `throw redirect('/entrar?volver=…')`, que rehace la
    ruta protegida de la 102 de React.
  - Medir lo que tarda cada navegación.
  - Compartir datos entre la `action` y el `loader`.

  El middleware de servidor va en la 18.
- **11.** `lazy` como función y como objeto, que carga el `loader` y el
  componente por separado y a la vez. En qué se diferencia de
  `React.lazy` (50 y 93 de React): el router empieza a cargar los datos
  sin esperar al componente. `HydrateFallback` en la carga inicial;
  `patchRoutesOnNavigation`, solo mencionado.
- **12.**
  - `useBlocker` para los cambios sin guardar (comprobado en vivo).
  - `<ScrollRestoration>`, `preventScrollReset` y `useBeforeUnload`, con
    código anotado.
  - Mover el foco y anunciar el cambio de página (37 de React): la
    documentación lo deja en tus manos.
  - `<ViewTransition>` de React alrededor del `<Outlet>` (55 de React), y
    por qué desde la 8.5 se desaconsejan las APIs `viewTransition` del
    router. Las navegaciones con Atrás y Adelante pueden no animarse:
    React se salta la transición en las actualizaciones síncronas de
    `popstate`.

## Módulo 4: Modo framework (en tu ordenador)

Requiere además la 87 y la 98 de React.

| # | Lección | Fuentes |
|---|---|---|
| 14 | Anatomía de una app en modo framework: `routes.ts`, módulos de ruta y `root.tsx` | [Installation](https://reactrouter.com/start/framework/installation) + [Routing](https://reactrouter.com/start/framework/routing) + [Route Module](https://reactrouter.com/start/framework/route-module) + [Special Files](https://reactrouter.com/explanation/special-files) + [File Route Conventions](https://reactrouter.com/how-to/file-route-conventions) + [react-router.config.ts](https://reactrouter.com/api/framework-conventions/react-router.config.ts) + [Framework Adoption from RouterProvider](https://reactrouter.com/upgrading/router-provider) |
| 15 | Tipos de punta a punta: de `useLoaderData<typeof loader>` a los tipos generados | [Type Safety](https://reactrouter.com/explanation/type-safety) + [Route Module Type Safety](https://reactrouter.com/how-to/route-module-type-safety) + [useLoaderData](https://reactrouter.com/api/hooks/useLoaderData) + [href](https://reactrouter.com/api/utils/href) + [createContext](https://reactrouter.com/api/utils/createContext) + [data](https://reactrouter.com/api/utils/data) + [Error Boundaries](https://reactrouter.com/how-to/error-boundary) + [TypeScript: Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) |
| 16 | Dónde se ejecuta cada cosa: servidor, navegador o los dos | [Server vs. Client Code Execution](https://reactrouter.com/explanation/server-client-execution) + [Client Data](https://reactrouter.com/how-to/client-data) + [Route Module](https://reactrouter.com/start/framework/route-module) + [.server modules](https://reactrouter.com/api/framework-conventions/server-modules) + [.client modules](https://reactrouter.com/api/framework-conventions/client-modules) + [Lazy Route Discovery](https://reactrouter.com/explanation/lazy-route-discovery) + [Automatic Code Splitting](https://reactrouter.com/explanation/code-splitting) + [Hydration](https://reactrouter.com/explanation/hydration) |
| 17 | Estrategias de renderizado: SSR, SPA, prerenderizado, cabeceras y caché | [Rendering Strategies](https://reactrouter.com/start/framework/rendering) + [Single Page App](https://reactrouter.com/how-to/spa) + [Pre-Rendering](https://reactrouter.com/how-to/pre-rendering) + [HTTP Headers](https://reactrouter.com/how-to/headers) + [Streaming with Suspense: Timeouts](https://reactrouter.com/how-to/suspense) + [Progressive Enhancement](https://reactrouter.com/explanation/progressive-enhancement) |
| 18 | Sesiones y cookies: iniciar sesión en el servidor | [Sessions and Cookies](https://reactrouter.com/explanation/sessions-and-cookies) + [Middleware: Authentication](https://reactrouter.com/how-to/middleware) + [createCookieSessionStorage](https://reactrouter.com/api/utils/createCookieSessionStorage) + [createCookie](https://reactrouter.com/api/utils/createCookie) |
| 19 | Rutas de recursos: JSON, archivos, webhooks y subidas | [Resource Routes](https://reactrouter.com/how-to/resource-routes) + [File Uploads](https://reactrouter.com/how-to/file-uploads) + [Backend For Frontend](https://reactrouter.com/explanation/backend-for-frontend) |
| 20 | Seguridad en el modo framework: lo que te protege y lo que no | [Security](https://reactrouter.com/how-to/security) + [react-router.config.ts: allowedActionOrigins](https://reactrouter.com/api/framework-conventions/react-router.config.ts) + [Error Boundaries: Error Sanitization](https://reactrouter.com/how-to/error-boundary) + [Sessions and Cookies: Signing cookies](https://reactrouter.com/explanation/sessions-and-cookies) + [Avisos de seguridad del repositorio](https://github.com/remix-run/react-router/security/advisories) |
| 21 | Probar rutas: `createRoutesStub`, y `loader` y `action` como funciones | [Testing](https://reactrouter.com/start/framework/testing) + [createRoutesStub](https://reactrouter.com/api/utils/createRoutesStub) + [Middleware](https://reactrouter.com/how-to/middleware) |
| 22 | Desplegar y vigilar: adaptadores, variables de entorno y errores en producción | [Deploying](https://reactrouter.com/start/framework/deploying) + [Plantillas oficiales](https://github.com/remix-run/react-router-templates) + [Error Reporting](https://reactrouter.com/how-to/error-reporting) + [Instrumentation](https://reactrouter.com/how-to/instrumentation) + [entry.server.tsx](https://reactrouter.com/api/framework-conventions/entry.server.tsx) |

**Qué entra en cada una:**

- **14.**
  - Del objeto de ruta al módulo de ruta, pieza por pieza, con los
    módulos 2 y 3 al lado.
  - `route`, `index`, `layout` y `prefix`, y `@react-router/fs-routes`
    como alternativa.
  - `root.tsx` (`Layout`, `Links`, `Meta`, `Scripts`,
    `ScrollRestoration`), los `entry.client` y `entry.server`, y
    `react-router reveal`.
  - `react-router.config.ts`.
  - Que existen los tipos generados (`import type { Route } from
    './+types/…'`), en una línea: lo hondo va en la 15.

  La 98 usó todo esto; aquí se entiende.
- **15.** Los tipos del router, de punta a punta. Todo comprobado con
  TypeScript 6.0.3 y React Router 8.5.0:
  - **Modo datos, sin generación de tipos.** `useLoaderData<typeof
    loader>()`, `useActionData<typeof action>()` y `useFetcher<typeof
    action>()` infieren el tipo de lo que devuelve la función. Un
    `data(valor, init)` se desenvuelve en `valor`, y un `redirect()`
    devuelto, que es una `Response`, desaparece del tipo. Sin el genérico,
    `any`. Los `params` son `string | undefined` (`Type 'string |
    undefined' is not assignable to type 'string'.`), y hay que
    comprobarlos.
  - **Lo que el tipo no sabe.** El genérico decide si «serializa» mirando
    la **firma** del `loader`, no el modo. Con `({ params }:
    LoaderFunctionArgs)`, el tipo queda tal cual devuelve el `loader`, con
    funciones e instancias de clase, y en modo datos acierta, porque no
    hay red y nada se serializa. Con un `loader()` sin argumentos, el tipo
    pasa por la serialización (una función sale como `undefined` y una
    clase pierde sus métodos) aunque en modo datos la función llegue
    intacta. Y en modo framework pasa al revés: con `Route.LoaderArgs`, el
    tipo no serializa, pero la respuesta del servidor sí.
  - **Modo framework, con tipos generados.** `react-router typegen` (o el
    servidor de desarrollo) escribe `.react-router/types/…/+types/<ruta>.ts`
    con `Route.LoaderArgs`, `ClientLoaderArgs`, `ActionArgs`,
    `ClientActionArgs`, `ComponentProps`, `ErrorBoundaryProps` y
    `HydrateFallbackProps`. Los `params` salen del patrón de la ruta
    (`:id` es `string`; `:id?`, opcional). El `loaderData` de un `loader`
    de servidor **sí pasa por la serialización**: una función queda como
    `undefined` y una instancia de clase pierde sus métodos, mientras que
    `Date`, `Map`, `Set`, `Promise` y `bigint` se conservan. Por eso aquí
    se usa el `loaderData` de `Route.ComponentProps`, que acierta, y no
    `useLoaderData<typeof loader>`, que con `Route.LoaderArgs` no
    serializa.
    Configurarlo: `rootDirs`, `.gitignore` y `typegen` antes de `tsc`.
  - **`href()` y el registro de tipos.** `typegen` también genera
    `.react-router/types/+routes.ts`, que hace un aumento de módulo
    (`declare module "react-router" { interface Register { pages;
    routeFiles; routeModules } }`; *declaration merging*, lección 52 de
    TypeScript). Con él, `href('/pistas/:id')` exige `{ id }` y una ruta
    inventada no compila. Sin registro, en modo datos, `href()` acepta
    cualquier texto; se puede escribir el `Register` a mano para tiparlo.
    En la 8, la otra interfaz aumentable, `Future`, ya no hace falta para
    tipar el contexto del middleware.
  - **El contexto tipado.** `createContext<Usuario>()`: `context.get`
    devuelve `Usuario`, y `context.set(usuarioContext, 3)` no compila
    (`Argument of type 'number' is not assignable to parameter of type
    'Usuario'.`). Sin valor por defecto, leer uno que nadie ha puesto
    lanza un error.
  - **Los errores.** `useRouteError()` y la prop `error` de
    `Route.ErrorBoundaryProps` son `unknown`. `isRouteErrorResponse` lo
    estrecha a `status`, `statusText` y `data`, pero `data` es `any`: lo
    que lanzas con `data()` no viaja tipado hasta el `ErrorBoundary`, y
    hay que validarlo.
- **16.**
  - `loader` y `action` (en el servidor) frente a `clientLoader` y
    `clientAction` (en el navegador); `serverLoader()`;
    `clientLoader.hydrate` con `HydrateFallback`.
  - `middleware` frente a `clientMiddleware`: el de servidor solo se
    ejecuta si hay una petición al servidor.
  - Los módulos `.server` y `.client`.
  - Por qué existen las peticiones `.data` y `/__manifest`, que la 98
    enseñó en la pestaña Red, y `<Link prefetch>`.
  - `splitRouteModules`, activo por defecto desde la 8.
  - Una caché en el cliente con `clientLoader`.
- **17.**
  - `ssr: true` o `ssr: false`; el SPA Mode, con el `HydrateFallback` de
    root.
  - `prerender` (una lista o una función), con servidor y sin él, y cómo
    se mezcla por ruta.
  - `headers` y `Cache-Control`, y por qué nunca en páginas con datos
    personales.
  - `streamTimeout`.
  - El modo «API-only» (`ssr: "unstable_api-only"`, 8.5), solo mencionado
    porque es inestable.
- **18.**
  - `createCookie` y `createCookieSessionStorage`; firmar con `secrets`,
    y rotarlos.
  - `getSession`, `commitSession` y `destroySession`; mensajes *flash*.
  - Un middleware de servidor que deja el usuario en el contexto y
    protege una rama de rutas; cerrar sesión.
  - Frente a la 102 de React (el token en la SPA) y al JWT del proyecto
    52 de Node.js.
  - Caso real:
    [GHSA-9583-h5hc-x8cw](https://github.com/remix-run/react-router/security/advisories/GHSA-9583-h5hc-x8cw),
    **crítico** (8 de enero de 2026). `createFileSessionStorage` con una
    cookie **sin firmar** permitía leer y escribir fuera de la carpeta de
    sesiones. Afectaba a `@react-router/node` hasta la 7.9.3.
- **19.**
  - Un módulo sin componente que responde lo que quiera, distinto según el
    método.
  - Un CSV, un RSS o un sitemap.
  - Un webhook, que enlaza con el proyecto 53 de Node.js.
  - Enlazar con `reloadDocument`.
  - Subir archivos con `@remix-run/form-data-parser`, el paquete que usa
    la documentación.
  - Ojo: `allowedActionOrigins` no protege las rutas de recursos, como
    avisa su documentación.
- **20.**
  - CSRF en las `action`: el router rechaza los envíos a rutas de interfaz
    desde otros orígenes, salvo los de `allowedActionOrigins`
    ([GHSA-h5cw-625j-3rxh](https://github.com/remix-run/react-router/security/advisories/GHSA-h5cw-625j-3rxh)).
  - Redirecciones abiertas con `?volver=`: hay que validar el destino
    ([GHSA-2w69-qvjg-hvjx](https://github.com/remix-run/react-router/security/advisories/GHSA-2w69-qvjg-hvjx)
    y
    [GHSA-jjmj-jmhj-qwj2](https://github.com/remix-run/react-router/security/advisories/GHSA-jjmj-jmhj-qwj2)).
  - XSS con `meta` y `script:ld+json`
    ([GHSA-3cgp-3xvw-98x8](https://github.com/remix-run/react-router/security/advisories/GHSA-3cgp-3xvw-98x8)):
    mejor las etiquetas de React (81 y 82 de React).
  - Cookies firmadas, CSP con *nonce* y los módulos `.server`.
  - En producción, el navegador recibe los mensajes de error saneados,
    salvo lo que lanzas con `data()`.
  - Mirar la lista de avisos: **22 avisos entre abril de 2025 y julio de
    2026**. Casi todos son del modo framework o de los modos RSC, pero los
    de redirecciones con rutas que vienen de fuera también tocan los otros
    modos: `navigate()` y `<Link>` incluidos
    ([GHSA-9jcx-v3wj-wh4m](https://github.com/remix-run/react-router/security/advisories/GHSA-9jcx-v3wj-wh4m)).
    Su continuación,
    [GHSA-wrjc-x8rr-h8h6](https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6)
    (julio de 2026), afecta a toda la 6 y solo tiene parche desde la
    7.18.0. Es un buen motivo para migrar (23 y 25).
- **21.**
  - `createRoutesStub` para los componentes que usan hooks del router
    (montarlo en la vista previa está **sin verificar**).
  - Probar un `loader` o una `action` llamándolos con un `Request` de
    verdad, y el contexto con `RouterContextProvider`.
  - Por qué la documentación desaconseja usarlo con los tipos `Route.*`
    (los de la 15).
  - Las pruebas de extremo a extremo, en la ficha de Testing.
- **22.**
  - Servidor Node (`react-router-serve`, o Express a medida) y Docker,
    que trae la plantilla.
  - Vercel (`@vercel/react-router` 1.3.7), Netlify
    (`@netlify/vite-plugin-react-router` 4.0.0) y Cloudflare
    (`@cloudflare/vite-plugin`: la 8 retiró el proxy propio).
  - Alojamiento estático para el SPA Mode y el prerenderizado (85 de
    React).
  - Variables de entorno del servidor frente a las `VITE_` (82 de React).
  - `handleError` en `entry.server` y `onError` en el cliente;
    `instrumentations`, estables desde la 7.15, para medir.

## Módulo 5: El código que ya existe

| # | Lección | Fuentes |
|---|---|---|
| 23 | Leer y migrar código: de `react-router-dom` 5, 6 y 7, y de Remix 2, a React Router 8 | [Upgrading from v7](https://reactrouter.com/upgrading/v7) + [Future Changes](https://reactrouter.com/upgrading/future) + [Upgrading from v5 (docs de la 6)](https://reactrouter.com/6.30.3/upgrading/v5) + [Upgrading from v6 (docs de la 7)](https://reactrouter.com/7.18.4/upgrading/v6) + [Upgrading from Remix (docs de la 7)](https://reactrouter.com/7.18.4/upgrading/remix) + [Framework Adoption from Component Routes](https://reactrouter.com/upgrading/component-routes) + [API Development Strategy](https://reactrouter.com/community/api-development-strategy) + [remix.run](https://remix.run/) |

**Qué entra en la 23:**

- Reconocer cada época:
  - la 5 (`<Switch>`, `useHistory`, `withRouter`);
  - la 6 (`react-router-dom`, `createBrowserRouter` desde la 6.4);
  - la 7 (ya sin `json()` ni `defer()`: objetos y promesas tal cual;
    *future flags*);
  - la 8 (la tabla del principio).
- El camino de Remix 2 a la 7, con su *codemod*, y de ahí a la 8.
- Qué es Remix 3 y por qué no es una actualización.
- Cómo funcionan las *future flags* y los `unstable_`.

## Módulo 6: Proyectos avanzados

| # | Proyecto |
|---|---|
| 24 | La cooperativa de consumo: el modo framework de punta a punta |
| 25 | Migrar una app de `react-router-dom` 6 a React Router 8, paso a paso |

**Total: 25 entradas** (21 lecciones, 2 proyectos en el navegador y 2
avanzados) en seis módulos. Una ficha derivada debe ser más corta que la
de React (102 entradas). La documentación tiene 86 páginas sin la
referencia de la API. De ellas salen las páginas del modo declarativo y lo
que ya cubren las lecciones 76, 77, 87, 98 y 99 de React. El resto se
agrupa en lecciones de tres a seis páginas cada una. Al aprobarlo, entró
la lección de tipos (15) y salió la de TanStack Query, así que el total no
cambia.

## Proyectos

### 🧪 En el navegador (intercalados)

Varios bloques `react-en-vivo` en TSX encadenados, como `javascript/72` y
los 🧪 de React, cada paso con sus comprobaciones. Necesitan las fases R0,
R1 y R3, y mejor con la R2.

| # | Proyecto | Qué practica |
|---|---|---|
| 7 | **Reservas del Polideportivo Municipal de Monzón** | Lista de pistas con un `loader` y el día en la URL (`?dia=`), con `<Form method="get">`. Reservar una franja con un fetcher, sin cambiar de página. La `action` comprueba si está libre y devuelve el conflicto con `data(…, { status: 409 })`. La reserva aparece al momento leyendo `fetcher.formData`, y con «fallar la siguiente petición» se ve cómo se retira sola. Con `shouldRevalidate`, solo se recarga lo que la reserva cambia, y el registro lo enseña. Cancelar varias reservas a la vez, con un indicador global hecho con `useFetchers`. |
| 13 | **La intranet de la Protectora de Animales de Calatayud** | Un middleware que pide sesión y, si no la hay, lleva a `/entrar?volver=…` y te devuelve después, solo a una ruta interna (adelanto de la 20). El usuario va en un contexto tipado con `createContext<T>()`. Panel con estadísticas lentas por *streaming* y el resto al instante. La ficha de un animal con su historial veterinario en una ruta hija que falla: su `ErrorBoundary` lo recoge y el resto de la ficha sigue en pantalla. Un formulario de adopción con `useBlocker` si dejas cambios sin guardar. El área de administración, con `lazy`. |

### Avanzados (repositorio `pedroleni/react-router-proyectos`)

El mismo patrón que `pedroleni/react-proyectos`, comprobado en su
repositorio el 2026-10-26:

- una carpeta por proyecto;
- rama `main` con el punto de partida y comentarios `// TODO (paso N)`;
- rama `solucion` terminada;
- tests que se ponen en verde paso a paso;
- vídeo real a 1080p en cada lección;
- imágenes generadas con Codex cuando hagan falta.

**El README de la raíz y el de cada carpeta, en las dos ramas, dicen que
son parte de Tech Study Tracker y enlazan a
[techstudytracker.com](https://www.techstudytracker.com).** El repositorio
tiene además la carpeta `taller/` de las lecciones 14 a 22.

| # | Proyecto | Qué practica |
|---|---|---|
| 24 | **La cooperativa de consumo** (Cooperativa La Huerta del Ebro, Zaragoza: pedidos de cestas semanales) | El modo framework en TSX y con SSR: todo el módulo 4 en una sola app |
| 25 | **Migrar el préstamo de libros de una biblioteca de instituto** | De `react-router-dom` 6 a React Router 8, sin romper nunca los tests |

**24. La cooperativa de consumo.** No repite la revista (98 de React):
allí, el contenido y el SSR; aquí, usuarios, sesiones y seguridad. Los
pasos:

- iniciar sesión con una cookie de sesión firmada;
- un middleware de servidor que deja al socio en un contexto tipado y
  protege su zona;
- la cesta en la sesión, con fetchers y respuesta optimista;
- el pedido con una `action` validada con Zod: un 400 con los errores, o
  una redirección con mensaje *flash*;
- una ruta de recursos con la hoja de reparto en CSV;
- las páginas fijas prerenderizadas, y `Cache-Control` en el catálogo;
- `?volver=` validado y `allowedActionOrigins`;
- `npm run typecheck` limpio, con los tipos generados y `href()`;
- tests con `createRoutesStub`, y con `loader` y `action` llamados como
  funciones;
- desplegarla con `react-router-serve` y Docker, con Vercel como reto.

**25. Migrar el préstamo de libros.** La rama `main` trae una app real de
`react-router-dom` 6: `BrowserRouter`, datos pedidos con `useEffect`, un
`ProtectedRoute` que envuelve rutas y formularios con `onSubmit` y
`fetch`. Trae también tests de caracterización que no deben ponerse nunca
en rojo. Los pasos:

1. A la última 7, con sus *future flags*.
2. A la 8: los `import` y los mínimos de Node y React.
3. Al modo datos, ruta a ruta: `loader` en vez de efectos, `action` en vez
   de `onSubmit`, y `ErrorBoundary` y middleware en vez del
   `ProtectedRoute`.
4. Opcional: el modo framework en SPA Mode, siguiendo *Framework Adoption
   from RouterProvider*.

Al final, con números: las líneas borradas y las peticiones en cascada que
pasan a ir en paralelo. Y un motivo real para hacerlo: la 6 no tiene
parche para GHSA-wrjc-x8rr-h8h6 (ver la lección 20).

### Banco de ideas (sin planificar)

- **Una web estática prerenderizada** (un blog o una documentación)
  desplegada en un CDN.
- **Un webhook firmado con HMAC en una ruta de recursos**, que rehace el
  proyecto 53 de Node.js.

## Lo que queda fuera a propósito

- **React Router con TanStack Query.** La lección que lo juntaba (la 22
  del borrador) **pasa a la ficha de TanStack Query**, igual que el
  proyecto de un panel con las dos librerías que estaba en el banco de
  ideas. TanStack Query a fondo, también allí.
- **Next.js, TanStack Router y TanStack Start.** El mapa ya está en la
  lección 90 de React; Next.js tendrá su ficha.
- **Server Components en React Router.** Siguen siendo experimentales:
  *«React Server Components support is experimental and subject to
  breaking changes in minor/patch releases»* (documentación de 8.5.0).
  Necesitan el plugin experimental `@vitejs/plugin-rsc` y, en modo
  framework, `unstable_reactRouterRSC`. Además, tres de los diecinueve
  avisos de seguridad de 2026 son solo de los modos RSC. Se mencionan en la
  1 y en la 23, y entran cuando dejen de ser experimentales.
- **Lo inestable** (`ssr: "unstable_api-only"`,
  `future.unstable_customRouteDiscovery`,
  `future.unstable_routePatternMatching`, `unstable_fetch`,
  `unstable_SerializesTo`): como mucho, una mención. La documentación
  avisa de que no son para producción.
- **`dataStrategy` a medida.** Es para quien escribe librerías encima del
  router.
- **El router hecho a mano, `HashRouter` y la reescritura a `index.html`**
  (76 y 85 de React), y **la teoría del SSR y de la hidratación** (87):
  ya están en React.
- **React Hook Form** (100 de React) e **internacionalización con el
  idioma en la URL** (101 de React).
- **Remix 3.** Es otro framework, sin React.
- **Pruebas de extremo a extremo con Playwright**: ficha de Testing.

## Registro de decisiones (2026-10-26)

1. **Tamaño: 25 entradas en seis módulos.** Aprobado. La 19 (rutas de
   recursos) no se fusiona con la 17.
2. **Ampliar la vista previa antes de escribir.** Aprobado, en dos tandas:
   la primera, R0, R1 y R3; la segunda, R2 (el registro del router).
3. **Alias al historial en memoria** para `createBrowserRouter`,
   `createHashRouter`, `BrowserRouter` y `HashRouter`, con la etiqueta en
   la barra y un aviso en la consola. Aprobado.
4. **Carpeta `taller/`** en el repositorio para las lecciones 14 a 22, con
   tests que se ponen en verde lección a lección. Aprobado.
5. **Server Components, fuera** hasta que dejen de ser experimentales.
   Aprobado.
6. **La lección de React Router con TanStack Query** sale de esta ficha y
   pasa a la de TanStack Query. Con ella desaparece la duda de si
   escribirla ya o esperar a su bundle.
7. **TypeScript desde el principio.** Toda la ficha va en TSX desde la
   lección 1, con los errores de tipos reales en la vista previa. La fase
   R3 (los tipos de React Router en el panel) entra en la primera tanda, y
   hay una lección nueva de tipos de punta a punta (15) en el módulo 4,
   justo después de la anatomía (14). Las lecciones 15 a 21 del borrador
   pasan a ser la 16 a la 22.

## Pendiente

- [ ] **Publicar antes la lección puente 99 de React**, que es requisito
  de toda la ficha. Mejor también la ampliación de la 98 (el paso con
  middleware).
- [ ] **Implementar la primera tanda (R0, R1 y R3)** según
  `specs/features/react-en-vivo.md`, sección «React Router en la vista
  previa (fases R0, R1 y R3)». Codex implementa. Claude instala las
  dependencias antes (Codex no tiene red) y verifica después con
  Playwright en Chromium, WebKit y **Firefox** (pendiente desde la
  especificación de `react-en-vivo`), y pasa `npm run test`,
  `npm run build` y `npm run lint` en local, porque la CI no los ejecuta.
- [ ] **Especificar e implementar R2** (el registro del router) antes de
  escribir las lecciones que lo usan (1, 2, 4, 5, 10 y 11), o escribirlas
  sin él y ampliarlas después.
- [ ] **Crear la tecnología «React Router» desde el admin**, en la misma
  categoría que React.
- [ ] **Crear el repositorio `pedroleni/react-router-proyectos`** (ramas
  `main` y `solucion`, la carpeta `taller/` y el README con el enlace a
  techstudytracker.com) antes de la lección 14.
- [ ] **Comprobar la versión el día de escribir cada lección**
  (`npm view react-router version`): React Router publica una versión
  menor cada pocas semanas.
- [ ] Quitar de «Pendiente» en `contenido/react/TEMARIO.md` la línea de
  este temario, y avisar a la futura ficha de TanStack Query de la
  lección que hereda.
- [ ] Opcional: un muestreo a mano de ofertas (InfoJobs, LinkedIn), si se
  quiere un dato de empleo que hoy no hay.

## Fuentes principales (consultadas el 2026-10-26)

- Documentación de React Router 8.5.0: el paquete `react-router@8.5.0`
  (`docs/`) y [reactrouter.com](https://reactrouter.com/start/modes).
- Changelogs de [`react-router`](https://github.com/remix-run/react-router/blob/main/packages/react-router/CHANGELOG.md)
  y de `@react-router/dev` (en su paquete de npm, 8.5.0).
- Los `.d.ts` de `react-router` 8.5.0 y la salida de `react-router typegen`
  en `@react-router/dev` 8.5.0, comprobados con `tsc` y con
  `@typescript/vfs` sobre TypeScript 6.0.3.
- npm: `npm view` de `react-router`, `@react-router/dev`, `remix`,
  `vite`, `typescript` y los adaptadores; descargas de
  [api.npmjs.org](https://api.npmjs.org/versions/react-router/last-week).
- [Avisos de seguridad de React Router](https://github.com/remix-run/react-router/security/advisories),
  leídos con `gh api`.
- [State of React 2025: librerías](https://2025.stateofreact.com/en-US/libraries/).
- [remix.run](https://remix.run/) y el `package.json` de `remix@3.1.0`.
- [WebContainers: Configuring Headers](https://webcontainers.io/guides/configuring-headers)
  y [WebContainers Enterprise](https://webcontainers.io/enterprise).
- El código de este repositorio: `scripts/react-en-vivo/`,
  `src/lib/react-en-vivo/`, `src/lib/laboratorio/schemas.ts` y
  `src/components/bloques-laboratorio/registro.ts`; las lecciones 76, 77,
  93 y 98 de React y los temarios de React y de TypeScript.
- La prueba rápida: esbuild 0.28.2, `react-router` 8.5.0,
  `playwright-core` 1.64.1, Chrome for Testing r1243, WebKit, Vitest con
  jsdom, y TypeScript 6.0.3 con `@typescript/vfs`.
