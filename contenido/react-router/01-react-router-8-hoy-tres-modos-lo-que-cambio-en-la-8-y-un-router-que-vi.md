# React Router 8 hoy: tres modos, lo que cambió en la 8 y un router que vive fuera de React

- **Módulo:** React Router 8 por dentro
- **Slug:** `react-router-8-hoy-tres-modos-lo-que-cambio-en-la-8-y-un-router-que-vive-fuera-de-react` (autogenerado del título)
- **Orden:** 10
- **Fuentes:** [Picking a Mode](https://reactrouter.com/start/modes) + [Custom Framework](https://reactrouter.com/start/data/custom) + [createMemoryRouter](https://reactrouter.com/api/data-routers/createMemoryRouter) + [Upgrading from v7](https://reactrouter.com/upgrading/v7) + [Changelog](https://reactrouter.com/changelog) + [Data Strategy](https://reactrouter.com/how-to/data-strategy) — ver `contenido/react-router/TEMARIO.md` #1
- **Requiere:** Las lecciones 76, 77 y 99 de React

---

## Qué es y para qué sirve

En la lección 99 de React pasaste del modo declarativo al de datos. Las rutas dejaron de ser componentes y pasaron a ser una lista de objetos que se le da a `createBrowserRouter`, y `<RouterProvider>` las pinta. Cada ruta puede tener su `loader`, que el router ejecuta antes de pintar la página y que el componente lee con `useLoaderData`, y su `action`, que recibe los envíos de un `<Form method="post">`. Mientras tanto, `useNavigation` cuenta qué está pasando. Si un `loader` falla o lanza un 404 con `data()`, lo recoge el `ErrorBoundary` de la ruta, que distingue una respuesta de un error con `isRouteErrorResponse`. `redirect` te manda a otra página, y `useFetcher` envía o carga sin navegar.

Esta ficha lleva cada una de esas piezas al fondo, una por lección. Antes, esta primera lección hace dos cosas:

- **Situarte**: los tres modos de React Router y cuál elegir, qué ha cambiado en la versión 8 y qué versión te vas a encontrar en un trabajo de verdad.
- **Enseñarte lo que hay debajo de todas las piezas**: un objeto, el router, que vive fuera de React, y un ciclo que se repite en cada navegación. Cuando lo entiendes, la revalidación, los fetchers o el middleware dejan de ser reglas sueltas: son pasos de ese ciclo.

El ejemplo es **Mareas del Cantábrico**, una web que consultan los mariscadores y los pescadores de caña de Cantabria. Tiene una lista de puertos (Santoña, Laredo, Castro Urdiales, Suances y Comillas) y, para cada uno, las pleamares y bajamares de hoy. Son dos rutas anidadas, cada una con su `loader`: la madre carga la lista, y la hija, la tabla del puerto.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "React Router de verdad en la vista previa",
  "contenido": "Desde esta lección, los bloques en vivo ejecutan React Router 8.5.0 en TSX, con su panel de errores de tipos. El código es el de un proyecto de Vite, con createBrowserRouter, pero la vista previa no tiene dirección propia: ahí el router usa un historial en memoria, y la consola y la barra lo avisan. Esa barra hace de barra de direcciones: Atrás y Adelante navegan; Ir y Recargar simulan una carga nueva de la página. Por eso, en un loader, request.url empieza por http://localhost. La API simulada conserva sus datos al recargar; Reiniciar lo devuelve todo al principio."
}
```

## Tres modos, un mismo router

La lección 76 de React te presentó los tres modos de React Router, y la 99 te pasó del primero al segundo. Lo que conviene tener claro ahora es cómo se relacionan, y lo dice la propia guía para elegir: **las funciones de cada modo se suman a las del anterior**. Del declarativo al de datos, y de ahí al framework, solo se añaden cosas, «a cambio de control sobre la arquitectura».

El modo lo decide el punto de entrada, el router «de arriba» que usas. Estos son los tres, tal como los escribirías hoy con la 8:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// ── Modo declarativo (lecciones 76 y 77 de React) · src/main.tsx\nimport { BrowserRouter } from 'react-router'\n\ncreateRoot(document.getElementById('root')!).render(\n  <BrowserRouter>\n    <App />\n  </BrowserRouter>,\n)\n\n// ── Modo datos (lección 99 de React y módulos 1 a 3) · src/main.tsx\nimport { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\nconst router = createBrowserRouter(rutas)\n\ncreateRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)\n\n// ── Modo framework (proyecto 98 de React y módulo 4) · app/routes.ts\nimport { type RouteConfig, index, route } from '@react-router/dev/routes'\n\nexport default [\n  index('routes/portada.tsx'),\n  route('puertos/:puertoId', 'routes/marea.tsx'),\n] satisfies RouteConfig\n\n// …y app/entry.client.tsx, que el plugin trae de serie\nstartTransition(() => {\n  hydrateRoot(\n    document,\n    <StrictMode>\n      <HydratedRouter />\n    </StrictMode>,\n  )\n})",
  "anotaciones": [
    {
      "fragmento": "<BrowserRouter>",
      "nota": "El declarativo: las rutas van dentro de los componentes, con Routes y Route. El router no las conoce hasta que React las pinta, así que no puede cargar datos antes."
    },
    {
      "fragmento": "const router = createBrowserRouter(rutas)",
      "nota": "El de datos: las rutas son una lista de objetos y el router se crea fuera de React, una sola vez. Es el objeto del que va media lección."
    },
    {
      "fragmento": "import { RouterProvider } from 'react-router/dom'",
      "nota": "Desde la 8, lo único que se importa de react-router/dom es RouterProvider (y HydratedRouter, en el framework). Todo lo demás, de react-router."
    },
    {
      "fragmento": "route('puertos/:puertoId', 'routes/marea.tsx'),",
      "nota": "El framework: cada ruta es un archivo, un módulo de ruta con su loader, su componente y su ErrorBoundary. Lo lee el plugin de Vite al construir. Lección 14."
    },
    {
      "fragmento": "<HydratedRouter />",
      "nota": "Aquí no hay createBrowserRouter: HydratedRouter crea el router con las rutas de routes.ts y lo pinta. Si quieres ver y cambiar este archivo, react-router reveal lo saca a tu proyecto."
    }
  ]
}
```

**El modo datos y el framework usan el mismo router.** En el framework no escribes `createBrowserRouter`: `HydratedRouter` crea el router con las rutas de `routes.ts` y lo pinta con un `RouterProvider`. Lo comprobamos en el código de React Router 8.5.0: llama a la misma función interna que `createBrowserRouter`, `createRouter`, con el historial del navegador. El plugin de Vite pone lo demás: el servidor, los tipos generados y el código partido por rutas.

Por eso esta ficha estudia el router en modo datos durante los tres primeros módulos: es el mismo motor, y aquí se puede ejecutar en vivo. El módulo 4 añade lo que trae el plugin.

### El consejo oficial para elegir

La guía [Picking a Mode](https://reactrouter.com/start/modes) empieza descartando la pregunta que casi todo el mundo se hace primero:

```text
Every mode supports any architecture and deployment target, so the question isn't really about if you want SSR, SPA, etc. It's about how much you want to do yourself.
```

Es decir: cualquier modo sirve para cualquier arquitectura y cualquier alojamiento, así que no se trata de si quieres renderizar en el servidor o hacer una SPA, sino de **cuánto quieres hacer tú**. Después da una lista para cada modo:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Framework, si…",
      "texto": "Eres demasiado nuevo para tener una opinión; estás comparando con Next.js, SvelteKit, Astro o TanStack Start; solo quieres construir algo con React; quizá renderices en el servidor y quizá no; o vienes de Next.js. Es lo que la guía propone por defecto para una app nueva."
    },
    {
      "titulo": "Datos, si…",
      "texto": "Quieres los loader, las action y los fetchers, pero decidir tú cómo empaquetas, cómo pides los datos y qué servidor usas. O empezaste un router de datos en la 6.4 y te va bien. La guía de este modo se llama Custom Framework: montas tu propio framework."
    },
    {
      "titulo": "Declarativo, si…",
      "texto": "Quieres React Router de la forma más sencilla; vienes de versiones anteriores y te basta BrowserRouter; o tus datos ya los lleva otra herramienta, con sus propios estados de carga. También si vienes de Create React App, aunque ahí te sugiere mirar el framework."
    }
  ]
}
```

La guía acaba con una tabla que dice en qué modos existe cada API. Resumida:

- **En los tres**: lo de las lecciones 76 y 77. `<Link>`, `<NavLink>`, `<Outlet>`, `useParams`, `useSearchParams`, `useNavigate`…
- **Solo en datos y framework**: lo que depende de que el router conozca las rutas antes de pintar. `loader` y `action`, `useLoaderData`, `useNavigation`, `<Form>`, `useFetcher`, `useBlocker`, `<ScrollRestoration>` y el `isPending` de `NavLink`.
- **Solo en framework**: lo que necesita el plugin y el servidor. `<Meta>`, `<Links>`, `<Scripts>`, `<Link prefetch>` y los tipos de cada módulo de ruta.

En esta ficha usarás el modo datos y el framework. Las reservas del polideportivo (proyecto 7) y la intranet de la protectora (13) son SPA en modo datos; la cooperativa de consumo (24), una app en modo framework, con servidor.

## Lo que trajo la 8, versión a versión

React Router 8.0.0 salió el 17 de junio de 2026. Según sus notas, es la primera de un calendario nuevo: **una versión mayor al año**, a mediados de año, al ritmo del fin de soporte de Node. La 8 coincidió con el final de Node 20, y la 9 llegaría hacia mayo de 2027, cuando acaba el de Node 22.

La otra idea del equipo es que una versión mayor sea aburrida. Los cambios que rompen algo llegan antes, en la versión anterior, detrás de una *future flag* que activas cuando quieres. Si en la 7 activaste todas, pasar a la 8 es cambiar los `import` y subir Node y React, como cuenta la guía [Upgrading from v7](https://reactrouter.com/upgrading/v7). Cómo funcionan esas banderas, en la lección 23.

Desde entonces han salido cinco versiones menores. Lo que importa de cada una, sacado del changelog:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "De la 8.0 a la 8.5",
  "items": [
    {
      "fecha": "17 jun 2026 · 8.0.0",
      "titulo": "Sin react-router-dom, y con el middleware siempre activo",
      "texto": "Todo se importa de react-router, salvo RouterProvider y HydratedRouter, que vienen de react-router/dom. El middleware deja de ser opcional en el modo framework (en el modo datos, la última 7 ya lo ejecutaba), y el context de loader y action es siempre un RouterContextProvider. Las future flags de la 7 son ya lo normal. Solo ESM. Mínimos: Node 22.22, React 19.2.7 y, en el framework, Vite 7."
    },
    {
      "fecha": "29 jun 2026 · 8.1.0",
      "titulo": "La instrumentación trae metadatos",
      "texto": "Las instrumentations, la API para medir lo que hace el router (lección 22), devuelven además la URL, el patrón de la ruta y sus parámetros. Es la API que usa el registro del router de esta web."
    },
    {
      "fecha": "8 jul 2026 · 8.2.0",
      "titulo": "Web Streams en el servidor",
      "texto": "En modo framework, una app que no corre en Node ya no necesita su propio entry.server.tsx: hay uno por defecto con renderToReadableStream."
    },
    {
      "fecha": "22 jul y 28 ago 2026 · 8.3.0 y 8.3.1",
      "titulo": "URL más estrictas",
      "texto": "href() y generatePath codifican los parámetros según el RFC 3986. La 8.3.1 valida mejor el origen de los envíos a una action y las URL de las navegaciones y las redirecciones en el navegador."
    },
    {
      "fecha": "15 sep 2026 · 8.4.0",
      "titulo": "Menos renders",
      "texto": "RouterProvider reparte su estado en cuatro contextos internos. Un componente que solo usa useLocation ya no se vuelve a pintar cuando navigation.state pasa a loading. Lo verás más abajo."
    },
    {
      "fecha": "19 oct 2026 · 8.5.0",
      "titulo": "Las transiciones de vista, a React",
      "texto": "Las APIs viewTransition del router quedan desaconsejadas en favor de <ViewTransition> de React 19.3 (lección 12), y se quitarán en la 9. Un fetcher vaciado con fetcher.reset() ya no recupera sus datos en la siguiente revalidación (lección 5). Y un modo API-only del framework, todavía inestable."
    }
  ]
}
```

Si escribes código nuevo para la 8, lo que más se nota:

- **Los `import`.** Todo sale de `react-router`; solo `RouterProvider` (y `HydratedRouter`, en el framework) sale de `react-router/dom`. Un `import` de `react-router-dom` en un proyecto con la 8 no compila: la lección 76 enseña el error de Vite.
- **El middleware ya está.** Puedes poner `middleware` en cualquier ruta sin activar nada, y el `context` que reciben `loader` y `action` es un `RouterContextProvider` (lección 10).
- **Node 22.22 y React 19.2.7, como mínimo.** Con un Node más viejo, `npm install react-router` instala la 7 sin decir nada: lo comprobó la lección 76.

## Qué versión te vas a encontrar en el trabajo

Que la 8 sea la última no quiere decir que sea la que usa tu empresa. npm publica cuántas veces se descargó cada versión en la última semana. Consultado el 26 de octubre de 2026:

- **`react-router`**: la 7, el 45,6 % de las descargas; la 6, el 33,5 %; **la 8, el 11,6 %**, y la 5, el 8,5 %.
- **`react-router-dom`**: la 7, el 46 %; la 6, el 42,5 %, y la 5, el 10,8 %. No hay 8: el paquete ya no existe en esa versión.
- **`@react-router/dev`**, el plugin del modo framework: la 7, el 61,7 %, y la 8, el 38,3 %.

Ojo al leer la primera línea: `react-router-dom` 6 y 7 dependen de `react-router` de su misma versión, así que cada instalación de `react-router-dom` cuenta también como una de `react-router`. Buena parte de esa «6» son apps que importan de `react-router-dom`.

Para hacerse una idea del tamaño, estas son las descargas de la última semana completa, del 26 de septiembre al 2 de octubre (en octubre, la API de npm tiene días sin datos): `react-router`, 68,4 millones; `react-router-dom`, 55 millones; `next`, 75,6 millones; `@tanstack/react-router`, 26,1 millones, y `@react-router/dev`, 3 millones. El modo framework es minoritario al lado de Next.js; el modo datos y el declarativo, no.

**Lo más probable, si entras hoy en un equipo, es que te encuentres la 6 o la 7**, muchas veces con `react-router-dom`, y alguna app de la 5. La 8 tiene cuatro meses. Y la 7 no está abandonada: la 7.18.4 salió el 15 de septiembre, el mismo día que la 8.4.0.

Para saber qué tiene un proyecto, pregúntale a npm y no al `package.json`, que solo dice qué rango acepta:

```bash
npm ls react-router react-router-dom
```

Esta es la salida real en un proyecto con `react-router-dom` 7 (con la ruta acortada):

```text
tienda-antigua@ /…/tienda-antigua
└─┬ react-router-dom@7.18.4
  └── react-router@7.18.4
```

Si en el código ves `<Switch>`, `useHistory` o `withRouter`, es la 5. Reconocer cada época y migrarla es la lección 23; la migración completa de una app de la 6, el proyecto 25. Y una pregunta sobre lo que instala npm hoy:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Un proyecto nuevo, hoy (26 de octubre de 2026).\n// Sigues un tutorial y escribes en la terminal:\n//\n//   npm install react-router-dom\n//\n// ¿Qué versión de React Router queda instalada?",
  "opciones": [
    "8.5.0, la última",
    "7.18.4: react-router-dom no tiene versión 8",
    "Ninguna: npm da un error, porque el paquete ya no existe",
    "6.30.6, la última de la 6"
  ],
  "correcta": 1,
  "explicacion": "react-router-dom sigue publicado, pero su última versión, la que npm instala por defecto, es la 7.18.4, que trae react-router 7.18.4. npm no avisa de nada. Comprobado el 26 de octubre de 2026 con npm 10.9: el package.json quedó con \"react-router-dom\": \"^7.18.4\". Para la 8, instala react-router."
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El modo framework es para renderizar en el servidor; para una SPA, el de datos",
      "realidad": "Cualquier modo sirve para cualquier arquitectura, dice la guía. El framework tiene un SPA Mode, con ssr: false (lección 17), y el modo datos puede renderizar en el servidor con createStaticHandler, como cuenta la guía Custom Framework."
    },
    {
      "mito": "La 8 es una reescritura y hay que aprenderlo todo otra vez",
      "realidad": "Es casi la 7 con sus future flags activadas y sin react-router-dom. Lo que aprendas en esta ficha vale para la 7, salvo los import y el middleware, que en el modo framework de la 7 había que activar con la flag v8_middleware."
    },
    {
      "mito": "Si usas createBrowserRouter, estás en modo framework",
      "realidad": "No: es el modo datos. El framework se reconoce por el plugin de Vite, app/routes.ts y HydratedRouter."
    },
    {
      "mito": "Remix 3 es la siguiente versión de React Router",
      "realidad": "React Router 7 fue la continuación de Remix 2. Remix 3, cuya 3.0.0 salió el 1 de octubre de 2026, es otro framework: entre sus dependencias ni siquiera está react. Lección 23."
    }
  ]
}
```

## El router es un objeto, y vive fuera de React

Mira otra vez el modo datos: `const router = createBrowserRouter(rutas)`, fuera de cualquier componente. La lección 99 dejó una regla, «créalo una vez, fuera del árbol de React», y un motivo: el router empieza a trabajar en cuanto se crea. Ahora toca verlo de cerca, porque **el router no es un componente ni un Hook: es un objeto**, con su estado, sus métodos y sus suscriptores.

Lo comprobamos en un proyecto de Vite con React 19.3.1 y React Router 8.5.0. Con un `console.log` justo después de `createBrowserRouter` y otro al empezar cada `loader`, los dos `loader` de `/puertos/laredo` escribieron **antes** que la línea de después de `createBrowserRouter`, y mucho antes de `createRoot`. Crear el router ya lanza la carga de la URL actual. En el código de React Router se ve por qué: `createBrowserRouter` crea el router y llama a su `initialize()`, que se pone a escuchar el historial y pide los datos. `createMemoryRouter` hace exactamente lo mismo, con un historial en memoria: es la única diferencia entre los dos.

¿Y `<RouterProvider>`? No carga nada. **Se suscribe al objeto con `router.subscribe`, guarda `router.state` en un estado de React y aplica cada cambio dentro de `startTransition`**. Está en su código; la opción que cambia eso, `useTransitions`, es de la lección 6. Es la misma idea que el router de juguete de la lección 99, que vivía en `motor.jsx` y se conectaba a React con `useSyncExternalStore` (lección 46).

El objeto tiene muchos métodos, pero tres explican casi todo:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "router.state",
      "texto": "Una foto de todo lo que sabe el router: location, la ubicación actual; matches, las rutas que encajan con ella; navigation, la navegación en marcha; loaderData, lo que devolvió cada loader, por id de ruta; fetchers, un Map con cada fetcher. Y más: initialized, errors, actionData, revalidation, historyAction… Con cada cambio es un objeto nuevo."
    },
    {
      "titulo": "router.navigate(destino, opciones)",
      "texto": "Lo que acaban llamando Link, Form, useNavigate y useSubmit (está en su código). Devuelve una promesa que se cumple cuando la navegación ha terminado, con los datos ya cargados."
    },
    {
      "titulo": "router.subscribe(función)",
      "texto": "Llama a tu función con el estado nuevo cada vez que cambia algo, y devuelve otra función para darte de baja."
    }
  ]
}
```

**Durante una navegación, `router.state` sigue describiendo la página de antes.** Lo dice el comentario del tipo `RouterState` en React Router 8.5.0: todo refleja la ubicación «vieja», salvo lo que se indique. La excepción es `navigation`: su `location` es adonde vas.

Y cada Hook del router lee un trozo de ese estado. Desde la 8.4, `RouterProvider` lo reparte en cuatro contextos, así que un componente solo se vuelve a pintar cuando cambia el trozo que usa:

```laboratorio
{
  "tipo": "roles",
  "titulo": "De router.state a los Hooks",
  "roles": [
    {
      "etiqueta": "location y matches",
      "rol": "useLocation, useSearchParams, useMatches",
      "descripcion": "Cambian cuando termina una navegación. Un componente que solo usa esto no se vuelve a pintar mientras se carga la página siguiente."
    },
    {
      "etiqueta": "navigation y revalidation",
      "rol": "useNavigation, useRevalidator",
      "descripcion": "Cambian al empezar y al terminar cada navegación o revalidación: son los que pintan el «Cargando…»."
    },
    {
      "etiqueta": "loaderData y actionData",
      "rol": "useLoaderData, useActionData",
      "descripcion": "Lo que devolvieron los loader y la action, por id de ruta. Cada componente de ruta recibe lo de su ruta."
    },
    {
      "etiqueta": "fetchers",
      "rol": "useFetcher, useFetchers",
      "descripcion": "Un Map con el estado y los datos de cada fetcher. Lección 5."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "¿Puedo usar el objeto en mi app?",
  "contenido": "Con cuidado. En los tipos de React Router 8.5.0, state y subscribe llevan el comentario «PRIVATE - DO NOT USE»; navigate, con una ruta de destino, no. Es decir: el objeto no es la API para escribir componentes. Dentro de RouterProvider, usa los Hooks, que leen lo mismo. El objeto sirve para entender qué pasa, para depurar y para el código que vive fuera de React, como la barra de direcciones de esta web, que está hecha con router.subscribe y router.navigate."
}
```

Para leer el estado desde fuera de `RouterProvider` basta una línea:

```tsx
const estado = useSyncExternalStore(router.subscribe, () => router.state)
```

Funciona porque el router cumple lo que pide `useSyncExternalStore` (lección 46 de React): `subscribe` recibe una función, la llama en cada cambio y devuelve la baja, y `router.state` es el mismo objeto hasta que algo cambia. En el bloque siguiente, el recuadro de líneas discontinuas está fuera de `RouterProvider` y lee así el estado. Además, `router.tsx` escribe en la consola cada aviso de `router.subscribe`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El router, visto desde fuera",
  "consigna": "Mira la consola: «Router creado» sale con initialized: false, antes de que React pinte nada. Pulsa «Santoña» y lee las dos líneas que escribe router.subscribe: durante la carga, location sigue en Laredo. El recuadro de líneas discontinuas está fuera de RouterProvider: no usa ningún Hook del router y aun así se entera de todo. Pulsa «Ir a Comillas desde fuera» y después Atrás en la barra.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { RouterProvider } from 'react-router/dom'\nimport { PanelDelRouter } from './PanelDelRouter'\nimport { router } from './router'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <>\n      {/* Fuera del router: solo tiene el objeto */}\n      <PanelDelRouter />\n      {/* El router pintado: aquí dentro funcionan los hooks */}\n      <RouterProvider router={router} />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "PanelDelRouter.tsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport { router } from './router'\n\n// Este componente está FUERA del RouterProvider: no puede usar los hooks del\n// router, pero puede suscribirse al objeto, como a cualquier almacén externo.\nexport function PanelDelRouter() {\n  const estado = useSyncExternalStore(router.subscribe, () => router.state)\n  const { initialized, location, matches, navigation, loaderData, fetchers } = estado\n  const conDatos = Object.keys(loaderData).filter((id) => loaderData[id] !== undefined)\n\n  return (\n    <aside className=\"fuera\" aria-label=\"El router, visto desde fuera\">\n      <h2>router.state, leído desde fuera de RouterProvider</h2>\n      <dl>\n        <dt>initialized</dt>\n        <dd>{String(initialized)}</dd>\n        <dt>location</dt>\n        <dd>{location.pathname}</dd>\n        <dt>matches</dt>\n        <dd>{matches.map((match) => match.route.id).join(' › ')}</dd>\n        <dt>navigation</dt>\n        <dd>\n          {navigation.state}\n          {navigation.location ? ` → ${navigation.location.pathname}` : ''}\n        </dd>\n        <dt>loaderData</dt>\n        <dd>{conDatos.join(', ') || '(vacío)'}</dd>\n        <dt>fetchers</dt>\n        <dd>{fetchers.size}</dd>\n      </dl>\n      <button type=\"button\" onClick={() => router.navigate('/puertos/comillas')}>\n        Ir a Comillas desde fuera\n      </button>\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "router.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { cargarMarea, cargarPuertos, ElegirPuerto, Maquetacion, Portada, Puertos, TablaMarea } from './Paginas'\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nexport const router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p>Abriendo las mareas…</p>,\n    children: [\n      { index: true, Component: Portada },\n      {\n        id: 'puertos',\n        path: 'puertos',\n        loader: cargarPuertos,\n        Component: Puertos,\n        children: [\n          { index: true, Component: ElegirPuerto },\n          { id: 'marea', path: ':puertoId', loader: cargarMarea, Component: TablaMarea },\n        ],\n      },\n    ],\n  },\n])\n\n// React todavía no ha pintado nada, pero el router ya está cargando datos\nconsole.log(`Router creado en ${router.state.location.pathname} · initialized: ${router.state.initialized}`)\n\n// Cada cambio de router.state llama a esta función\nrouter.subscribe((estado) => {\n  const { navigation, location } = estado\n  if (navigation.state === 'idle') {\n    console.log(`idle · ya estás en ${location.pathname}`)\n  } else {\n    console.log(`${navigation.state} → ${navigation.location.pathname} · location sigue en ${location.pathname}`)\n  }\n})\n"
    },
    {
      "nombre": "Paginas.tsx",
      "codigo": "import { Link, NavLink, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Marea, type Puerto } from './api'\n\n// Loader de la madre: la lista de puertos\nexport async function cargarPuertos() {\n  const puertos = await pedir<Puerto[]>('/api/puertos')\n  return { puertos }\n}\n\n// Loader de la hija: la marea de hoy en un puerto\nexport async function cargarMarea({ params }: LoaderFunctionArgs) {\n  const marea = await pedir<Marea>(`/api/mareas/${params.puertoId}`)\n  return { marea }\n}\n\nexport function Maquetacion() {\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Mareas del Cantábrico</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Inicio</Link> <Link to=\"/puertos\">Puertos</Link>\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h1>Las mareas de hoy</h1>\n      <p>Pleamares y bajamares de los puertos de Cantabria, para mariscar o salir a pescar.</p>\n      <Link to=\"/puertos/laredo\">Ver la marea de Laredo</Link> o <Link to=\"/puertos\">todos los puertos</Link>\n    </>\n  )\n}\n\nexport function Puertos() {\n  // El genérico le dice a TypeScript qué devuelve el loader (lección 2)\n  const { puertos } = useLoaderData<typeof cargarPuertos>()\n\n  return (\n    <div className=\"columnas\">\n      <nav aria-label=\"Puertos\">\n        <h1>Puertos</h1>\n        <ul>\n          {puertos.map((puerto) => (\n            <li key={puerto.id}>\n              <NavLink to={`/puertos/${puerto.id}`}>{puerto.nombre}</NavLink>\n            </li>\n          ))}\n        </ul>\n      </nav>\n      <Outlet />\n    </div>\n  )\n}\n\nexport function ElegirPuerto() {\n  return <p>Elige un puerto para ver sus mareas.</p>\n}\n\nexport function TablaMarea() {\n  const { marea } = useLoaderData<typeof cargarMarea>()\n\n  return (\n    <section aria-labelledby=\"titulo-marea\">\n      <h2 id=\"titulo-marea\">Marea en {marea.nombre}</h2>\n      <dl>\n        <dt>Pleamares</dt>\n        <dd>{marea.pleamares.join(' y ')}</dd>\n        <dt>Bajamares</dt>\n        <dd>{marea.bajamares.join(' y ')}</dd>\n      </dl>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Puerto = { id: string; nombre: string }\n\nexport type Marea = {\n  id: string\n  nombre: string\n  pleamares: string[]\n  bajamares: string[]\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string): Promise<T> {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #0f172a;\n  background: #f8fafc;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #0e7490;\n  background: #ecfeff;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #0e7490;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na.active {\n  font-weight: 700;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: minmax(9rem, 1fr) 2fr;\n  gap: 1rem;\n}\n\n.columnas ul {\n  margin: 0;\n  padding-left: 1.1rem;\n}\n\ndl {\n  display: grid;\n  grid-template-columns: auto 1fr;\n  gap: 0.25rem 0.75rem;\n  margin: 0;\n}\n\ndt {\n  font-weight: 600;\n}\n\ndd {\n  margin: 0;\n}\n\n/* Lo que vive fuera del RouterProvider */\n.fuera {\n  margin: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #64748b;\n  border-radius: 0.5rem;\n  background: #fff;\n  font-size: 0.85rem;\n}\n\n.fuera h2 {\n  font-size: 0.95rem;\n}\n\n.fuera dl {\n  font-family: ui-monospace, monospace;\n}\n\n.fuera p {\n  margin: 0.25rem 0;\n}\n\n.fuera button {\n  margin: 0.4rem 0.4rem 0 0;\n}\n\n.fuera ol {\n  margin: 0;\n  padding-left: 1.4rem;\n  font-family: ui-monospace, monospace;\n}\n"
    }
  ],
  "archivoInicial": "router.tsx",
  "urlInicial": "/puertos/laredo",
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "puertos": [
      {
        "id": "santona",
        "nombre": "Santoña"
      },
      {
        "id": "laredo",
        "nombre": "Laredo"
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales"
      },
      {
        "id": "suances",
        "nombre": "Suances"
      },
      {
        "id": "comillas",
        "nombre": "Comillas"
      }
    ],
    "mareas": [
      {
        "id": "santona",
        "nombre": "Santoña",
        "pleamares": [
          "05:04",
          "17:27"
        ],
        "bajamares": [
          "11:16",
          "23:40"
        ]
      },
      {
        "id": "laredo",
        "nombre": "Laredo",
        "pleamares": [
          "05:02",
          "17:25"
        ],
        "bajamares": [
          "11:14",
          "23:38"
        ]
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales",
        "pleamares": [
          "04:58",
          "17:21"
        ],
        "bajamares": [
          "11:10",
          "23:34"
        ]
      },
      {
        "id": "suances",
        "nombre": "Suances",
        "pleamares": [
          "05:11",
          "17:33"
        ],
        "bajamares": [
          "11:22",
          "23:46"
        ]
      },
      {
        "id": "comillas",
        "nombre": "Comillas",
        "pleamares": [
          "05:14",
          "17:36"
        ],
        "bajamares": [
          "11:25",
          "23:49"
        ]
      }
    ]
  },
  "red": {
    "latencia": 700
  }
}
```

Lo que acabas de ver, por partes:

- **El router trabaja antes que React.** La primera línea de la consola sale al evaluar `router.tsx`, con `initialized: false`: la carga de `/puertos/laredo` ya está en marcha, y el recuadro todavía dice que `loaderData` está vacío. Debajo, la vista previa avisa de que `createBrowserRouter` usa aquí un historial en memoria.
- **La carga inicial no es una navegación.** En ella, `navigation.state` sigue en `'idle'`; lo que cambia es `initialized`, de `false` a `true`. La pantalla, mientras, enseña el `HydrateFallback` de la raíz. Por eso `router.subscribe` solo escribe una línea, al terminar.
- **Durante una navegación, `location` es la página de antes y `navigation.location`, la de después.** Cambian juntas al final, como la URL en la lección 99.
- **`matches` es la rama del árbol que encaja**: `raiz › puertos › marea`. En `/puertos` verás `0-1-0` en el lugar de la ruta índice: a una ruta sin `id`, React Router le pone uno según su posición.
- **El botón de fuera navega igual que un enlace**, porque `<Link>` acaba llamando al mismo `router.navigate`. Y la barra de direcciones de la vista previa también es un cliente del objeto.

Una pregunta sobre el momento exacto en que cambia cada cosa:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Estás en /puertos, con la lista ya cargada.\n// Desde un botón de fuera, sin await:\nrouter.navigate('/puertos/suances')\nconsole.log(router.state.location.pathname)\nconsole.log(router.state.navigation.state)",
  "opciones": [
    "'/puertos/suances' y 'idle': navigate cambia la ubicación al momento",
    "'/puertos' y 'loading': la navegación ha empezado, pero la ubicación no cambia hasta que llegan los datos",
    "'/puertos/suances' y 'loading'",
    "'/puertos' y 'idle': navigate no hace nada hasta la siguiente vuelta del bucle de eventos"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en Chromium y en WebKit con la 8.5.0: justo después de llamar a navigate, navigation.state ya vale loading y navigation.location apunta a /puertos/suances, pero location no cambia hasta que termina el loader. Con await router.navigate(…), la promesa se cumple cuando el router ha terminado: entonces location ya es /puertos/suances, y React pinta la página nueva justo después."
}
```

## El ciclo de una navegación

Un clic en un `<Link>`, un `<Form>` que envía, un `navigate()` o el botón Atrás: todo acaba en `router.navigate`, y todo sigue los mismos pasos. Son los de la función `startNavigation` del código de React Router, contados para una navegación sin envío. Este es el árbol de rutas del bloque que viene después, con un middleware en la raíz:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas de Mareas del Cantábrico",
  "nodos": [
    {
      "nombre": "raiz",
      "nivel": 0,
      "etiqueta": "middleware",
      "nota": "path / · Maquetacion, con <Outlet /> · encaja con /puertos/laredo"
    },
    {
      "nombre": "índice",
      "nivel": 1,
      "nota": "Portada"
    },
    {
      "nombre": "puertos",
      "nivel": 1,
      "etiqueta": "loader",
      "nota": "path puertos · la lista y <Outlet /> · encaja"
    },
    {
      "nombre": "marea",
      "nivel": 2,
      "etiqueta": "loader",
      "nota": "path :puertoId · TablaMarea · encaja, con puertoId = laredo"
    }
  ]
}
```

1. **Corta la navegación anterior**, si queda alguna a medias: aborta su `request.signal` y descarta lo que traiga (lección 2).
2. **Encaja la URL con el árbol de rutas.** Para `/puertos/laredo`, la rama entera: `raiz`, `puertos` y `marea`. Si no encaja ninguna, pinta el 404 en el `ErrorBoundary` de la raíz sin ejecutar nada (lección 8).
3. **Avisa de que empieza.** Si hay algo que esperar, `navigation.state` pasa a `'loading'` (a `'submitting'` si es un envío, que antes ejecuta la `action`: lección 3) y llama a los suscriptores. `useNavigation` ya lo sabe; la página sigue siendo la de antes.
4. **Ejecuta el middleware**, de la ruta madre a la hija. Cada uno llama a `next()` y espera… (lección 10)
5. **…a los `loader` que hacen falta, todos a la vez.** Los de las rutas nuevas y los que toque volver a ejecutar (lección 4).
6. **Cuando han terminado todos, cambia el estado de golpe**: `location`, `matches`, `loaderData` y `navigation`, que vuelve a `'idle'`. Y vuelve a llamar a los suscriptores.
7. **`RouterProvider` recibe el estado nuevo y React pinta la página nueva**, dentro de `startTransition` (lección 6).

Una navegación sin nada que esperar, sin `loader` que ejecutar ni middleware, se salta el paso 3 y termina en el acto: lo comprobamos con el enlace a la portada, que pasó de `/puertos/laredo` a `/` sin que `navigation.state` saliera de `'idle'`. Con un middleware en la raíz, en cambio, siempre pasa por `'loading'`: la documentación dice que el middleware de cliente se ejecuta en cada navegación, haya `loader` o no.

Antes de verlo en vivo, el paso 5:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La API tarda 700 ms en cada respuesta.\n{\n  id: 'puertos', path: 'puertos', loader: cargarPuertos, Component: Puertos,\n  children: [\n    { id: 'marea', path: ':puertoId', loader: cargarMarea, Component: TablaMarea },\n  ],\n}\n\n// cargarPuertos pide /api/puertos y cargarMarea, /api/mareas/laredo.\n// Estás en la portada y pulsas «Ver la marea de Laredo». ¿Qué ves?",
  "opciones": [
    "La lista a los 0,7 s y la tabla de Laredo a los 1,4 s: la hija espera a la madre",
    "La lista y la tabla a la vez, a los 0,7 s",
    "La lista y la tabla a la vez, a los 1,4 s",
    "La lista a los 0,7 s, con la tabla vacía hasta los 1,4 s"
  ],
  "correcta": 1,
  "explicacion": "El router conoce la rama entera antes de pintar, así que lanza los dos loader a la vez: es su estrategia por defecto, que la página Data Strategy de la documentación describe como ejecutar todos tus loader en paralelo. Y no pinta nada hasta tener los dos: la portada se queda, con su «Cargando…», hasta los 0,7 s. Compruébalo abajo, en el registro del router y en el panel de red."
}
```

El bloque siguiente es la misma web en un solo archivo, con un middleware que avisa de cuándo empieza y cuándo termina, y un `console.log` en cada `loader` y en el render de la tabla. Debajo de la vista previa tienes la consola, el **registro del router**, que apunta cada carga y cada navegación con sus pasos, y el panel de red.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El ciclo, en el registro del router",
  "lenguaje": "tsx",
  "codigo": "import { createBrowserRouter, Link, NavLink, Outlet, useLoaderData, useNavigation } from 'react-router'\nimport type { LoaderFunctionArgs, MiddlewareFunction } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\ntype Puerto = { id: string; nombre: string }\ntype Marea = { id: string; nombre: string; pleamares: string[]; bajamares: string[] }\n\nasync function pedir<T>(url: string): Promise<T> {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\n// Un middleware que solo avisa de cuándo empieza y cuándo termina\nconst avisar: MiddlewareFunction = async ({ request }, next) => {\n  console.log(`middleware: empieza ${new URL(request.url).pathname}`)\n  await next()\n  console.log('middleware: termina')\n}\n\nasync function cargarPuertos() {\n  console.log('loader puertos: pide la lista')\n  return { puertos: await pedir<Puerto[]>('/api/puertos') }\n}\n\nasync function cargarMarea({ params }: LoaderFunctionArgs) {\n  console.log(`loader marea: pide ${params.puertoId}`)\n  return { marea: await pedir<Marea>(`/api/mareas/${params.puertoId}`) }\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Mareas del Cantábrico</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Inicio</Link>\n        </nav>\n        <p className=\"aviso\">\n          {navigation.state === 'loading' ? `Cargando ${navigation.location.pathname}…` : ''}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction Portada() {\n  return (\n    <>\n      <h1>Las mareas de hoy</h1>\n      <Link to=\"/puertos/laredo\">Ver la marea de Laredo</Link>\n    </>\n  )\n}\n\nfunction Puertos() {\n  const { puertos } = useLoaderData<typeof cargarPuertos>()\n  return (\n    <div className=\"columnas\">\n      <nav aria-label=\"Puertos\">\n        <h1>Puertos</h1>\n        <ul>\n          {puertos.map((puerto) => (\n            <li key={puerto.id}>\n              <NavLink to={`/puertos/${puerto.id}`}>{puerto.nombre}</NavLink>\n            </li>\n          ))}\n        </ul>\n      </nav>\n      <Outlet />\n    </div>\n  )\n}\n\nfunction TablaMarea() {\n  const { marea } = useLoaderData<typeof cargarMarea>()\n  console.log(`render: la marea de ${marea.nombre}`)\n  return (\n    <section>\n      <h2>Marea en {marea.nombre}</h2>\n      <p>Pleamares: {marea.pleamares.join(' y ')}</p>\n      <p>Bajamares: {marea.bajamares.join(' y ')}</p>\n    </section>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    middleware: [avisar],\n    Component: Maquetacion,\n    HydrateFallback: () => <p>Abriendo las mareas…</p>,\n    children: [\n      { index: true, Component: Portada },\n      {\n        id: 'puertos',\n        path: 'puertos',\n        loader: cargarPuertos,\n        Component: Puertos,\n        children: [{ id: 'marea', path: ':puertoId', loader: cargarMarea, Component: TablaMarea }],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}",
  "css": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #0f172a;\n  background: #f8fafc;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #0e7490;\n  background: #ecfeff;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #0e7490;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na.active {\n  font-weight: 700;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: minmax(9rem, 1fr) 2fr;\n  gap: 1rem;\n}\n\n.columnas ul {\n  margin: 0;\n  padding-left: 1.1rem;\n}\n\ndl {\n  display: grid;\n  grid-template-columns: auto 1fr;\n  gap: 0.25rem 0.75rem;\n  margin: 0;\n}\n\ndt {\n  font-weight: 600;\n}\n\ndd {\n  margin: 0;\n}\n\n/* Lo que vive fuera del RouterProvider */\n.fuera {\n  margin: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #64748b;\n  border-radius: 0.5rem;\n  background: #fff;\n  font-size: 0.85rem;\n}\n\n.fuera h2 {\n  font-size: 0.95rem;\n}\n\n.fuera dl {\n  font-family: ui-monospace, monospace;\n}\n\n.fuera p {\n  margin: 0.25rem 0;\n}\n\n.fuera button {\n  margin: 0.4rem 0.4rem 0 0;\n}\n\n.fuera ol {\n  margin: 0;\n  padding-left: 1.4rem;\n  font-family: ui-monospace, monospace;\n}",
  "anotaciones": [
    {
      "fragmento": "const router = createBrowserRouter([",
      "nota": "Pasos 1 y 2: el árbol de rutas está aquí, fuera de React. Con él, el router sabe qué rama encaja con la URL antes de pintar nada, y qué loader tiene cada ruta."
    },
    {
      "fragmento": "middleware: [avisar],",
      "nota": "Paso 4: el middleware de la raíz se ejecuta en cada navegación y envuelve a todos los loader: avisar escribe antes de llamar a next() y después. A fondo, en la lección 10."
    },
    {
      "fragmento": "async function cargarPuertos() {",
      "nota": "Paso 5, la madre. En el registro, «loader puertos» empieza a la vez que «loader marea»: ninguno espera al otro."
    },
    {
      "fragmento": "async function cargarMarea({ params }: LoaderFunctionArgs) {",
      "nota": "Paso 5, la hija. params.puertoId sale de la URL que acaba de encajar: no hace falta que exista el componente para pedir sus datos. Lección 2."
    },
    {
      "fragmento": "const navigation = useNavigation()",
      "nota": "Paso 3: en cuanto empieza la navegación, navigation.state es loading y navigation.location, el destino. La página de antes sigue ahí, atenuada."
    },
    {
      "fragmento": "console.log(`render: la marea de ${marea.nombre}`)",
      "nota": "Paso 7: el componente de la hija solo se ejecuta con los datos ya en la mano. Por eso este render sale después de «middleware: termina». StrictMode está apagado en este bloque para que no salga dos veces."
    },
    {
      "fragmento": "HydrateFallback: () => <p>Abriendo las mareas…</p>,",
      "nota": "Lo que se pinta en la carga inicial, mientras se ejecutan los loader de la primera URL. En las navegaciones siguientes se queda la página de antes."
    },
    {
      "fragmento": "return <RouterProvider router={router} />",
      "nota": "RouterProvider se suscribe al router y pinta lo que diga router.state. No decide nada: cuando le llega el estado, el ciclo ya ha pasado."
    }
  ],
  "urlInicial": "/",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarRouter": true,
  "api": {
    "puertos": [
      {
        "id": "santona",
        "nombre": "Santoña"
      },
      {
        "id": "laredo",
        "nombre": "Laredo"
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales"
      },
      {
        "id": "suances",
        "nombre": "Suances"
      },
      {
        "id": "comillas",
        "nombre": "Comillas"
      }
    ],
    "mareas": [
      {
        "id": "santona",
        "nombre": "Santoña",
        "pleamares": [
          "05:04",
          "17:27"
        ],
        "bajamares": [
          "11:16",
          "23:40"
        ]
      },
      {
        "id": "laredo",
        "nombre": "Laredo",
        "pleamares": [
          "05:02",
          "17:25"
        ],
        "bajamares": [
          "11:14",
          "23:38"
        ]
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales",
        "pleamares": [
          "04:58",
          "17:21"
        ],
        "bajamares": [
          "11:10",
          "23:34"
        ]
      },
      {
        "id": "suances",
        "nombre": "Suances",
        "pleamares": [
          "05:11",
          "17:33"
        ],
        "bajamares": [
          "11:22",
          "23:46"
        ]
      },
      {
        "id": "comillas",
        "nombre": "Comillas",
        "pleamares": [
          "05:14",
          "17:36"
        ],
        "bajamares": [
          "11:25",
          "23:49"
        ]
      }
    ]
  },
  "red": {
    "latencia": 700
  }
}
```

Pulsa «Ver la marea de Laredo» y mira el registro:

- **«Navegación → /puertos/laredo»** tiene dentro un «middleware raiz», que envuelve a «loader puertos» y «loader marea». Los dos `loader` empiezan en el mismo milisegundo (en nuestra prueba, «+3 ms» los dos) y duran lo mismo: sus barras van una encima de otra. **En paralelo.** En el panel de red, las dos peticiones salen juntas.
- En la consola, el orden del ciclo: empieza el middleware, los dos `loader` piden a la vez, termina el middleware y, al final, el render.
- Pulsa «Santoña». Ahora solo hay «loader marea», y debajo pone «No se volvió a ejecutar: puertos». La lista no ha cambiado: es la revalidación por defecto, que la lección 4 explica entera.
- Pulsa dos puertos seguidos, deprisa. La primera navegación sale «cancelada por #N», y su `loader`, con «terminó después de cancelarse»: el router descartó su resultado. Cómo dejar de pedirlo, con `request.signal`, en la lección 2.

**¿Por qué en paralelo?** Con efectos, como en la lección 52 de React, la hija no puede pedir nada hasta que la madre se pinta, porque hasta entonces no existe: es la cascada. El router no tiene ese problema porque **conoce la rama entera antes de pintar**, así que puede lanzar todos los `loader` a la vez. Es su estrategia por defecto. Se puede cambiar con la opción `dataStrategy`, pensada para quien escribe librerías encima del router; su documentación avisa de que, mal hecha, rompe la app.

**Y no pinta nada hasta que terminan todos.** Para verlo con duraciones distintas, en el proyecto de Vite le dimos a la madre 600 ms y a la hija 900, y apuntamos cada paso desde la portada. Esto es lo que salió en Chromium (en WebKit, lo mismo):

```text
    0 ms  CLIC en «Laredo», desde la portada
   25 ms  subscribe: navigation loading → /puertos/laredo · location /
   25 ms  middleware raiz: antes
   25 ms  loader puertos: empieza
   25 ms  loader marea: empieza
   66 ms  PANTALLA  la portada, con «loading»
  633 ms  loader puertos: termina
  933 ms  loader marea: termina
  933 ms  middleware raiz: después
  934 ms  subscribe: navigation idle · location /puertos/laredo
  942 ms  PANTALLA  la lista y la marea de Laredo · URL /puertos/laredo
```

La lista ya había llegado a los 633 ms, pero no se vio hasta los 942: el router esperó a la hija para cambiar la página entera de una vez. Si una parte puede esperar, la lección 9 enseña a devolverla como promesa y pintarla después.

## Cuándo usarías el router fuera de React

**Dentro de `RouterProvider`, los Hooks.** Leen lo mismo, se actualizan solos y, desde la 8.4, solo vuelven a pintar el componente cuando cambia la parte del estado que usan. El objeto tiene su sitio en otros casos:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Para mirar dentro mientras desarrollas",
      "texto": "En tu proyecto de Vite, una línea como if (import.meta.env.DEV) Object.assign(window, { router }) te deja escribir router.state.navigation o router.state.loaderData en la consola de DevTools y ver lo mismo que el recuadro de esta lección."
    },
    {
      "titulo": "En la interfaz que vive fuera de las rutas",
      "texto": "Una barra de estado o una bitácora pintadas al lado de RouterProvider, como las de los ejercicios. Si lo que quieres es mandar al usuario a otra página según los datos, mejor un redirect en un loader o en un middleware (lecciones 3 y 10) que un router.navigate suelto."
    },
    {
      "titulo": "Para medir y registrar",
      "texto": "Para saber cuánto tarda cada navegación en producción, React Router tiene una API pública, instrumentations: es la que usa el registro del router de esta web. Lección 22."
    },
    {
      "titulo": "Donde no hay barra de direcciones",
      "texto": "createMemoryRouter existe para eso, según su documentación: entornos sin la URL del navegador, como los tests o esta vista previa. Para probar componentes con rutas, la lección 21 usa createRoutesStub."
    }
  ]
}
```

## Errores típicos

**Leer `router.state` sin suscribirte.** Es lo primero que se le ocurre a cualquiera: si el router es un objeto, se lee y ya está.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Fuera de RouterProvider, sin suscribirse:\nfunction BarraEstado() {\n  return <p>Viendo {router.state.location.pathname}</p>\n}\n\nexport default function App() {\n  return (\n    <>\n      <BarraEstado />\n      <RouterProvider router={router} />\n    </>\n  )\n}\n\n// Abres /puertos y pulsas «Laredo».\n// Cuando termina la carga, ¿qué dice la barra?",
  "opciones": [
    "Viendo /puertos/laredo: router.state ya ha cambiado",
    "Viendo /puertos: nadie vuelve a pintar BarraEstado",
    "Viendo /puertos/laredo, porque RouterProvider vuelve a pintar toda la App",
    "Nada: router.state no se puede leer fuera de RouterProvider"
  ],
  "correcta": 1,
  "explicacion": "router.state cambia, pero leerlo no suscribe a nada. Cuando el router avisa, solo se vuelve a pintar lo de dentro de RouterProvider, no su hermana BarraEstado ni App. Comprobado en Chromium con la 8.5.0: la barra siguió diciendo /puertos con la marea de Laredo en pantalla. Con useSyncExternalStore(router.subscribe, () => router.state) se arregla: es el ejercicio 1."
}
```

**Un Hook del router fuera de `RouterProvider`.** Fuera no hay contexto del router, así que los Hooks no tienen de dónde leer. Un `useNavigation()` en esa `BarraEstado` deja la página en blanco, con este error (comprobado en un proyecto de Vite):

```text
useNavigation must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.
```

Es decir: «useNavigation tiene que usarse dentro de un router de datos». Es el mismo mensaje que viste en la lección 99 con `useLoaderData` en un router declarativo. Fuera, el objeto; dentro, los Hooks.

**Suscribirte en un efecto sin darte de baja.** `router.subscribe` devuelve la función que te da de baja. Si el efecto no la devuelve, la suscripción sobrevive al componente. Y con `StrictMode`, que en desarrollo monta, desmonta y vuelve a montar (lección 38 de React), te quedas con dos suscripciones: cada navegación cuenta doble. Lo comprueba el ejercicio 2.

**El `RouterProvider` de `react-router`.** En la 8.5.0, `react-router` también exporta un `RouterProvider`, y funciona. Pero es el que no conoce `react-dom`: si una navegación pide `flushSync`, la consola avisa (comprobado con `router.navigate('/puertos/laredo', { flushSync: true })`):

```text
You provided the `flushSync` option to a router update, but you are not using the `<RouterProvider>` from `react-router/dom` so `ReactDOM.flushSync()` is unavailable.  Please update your app to `import { RouterProvider } from "react-router/dom"` and ensure you have `react-dom` installed as a dependency to use the `flushSync` option.
```

Es decir: has pedido `flushSync`, pero no usas el `RouterProvider` de `react-router/dom`, así que `ReactDOM.flushSync()` no está disponible. En una app web, impórtalo siempre de `react-router/dom`.

**Seguir un tutorial de otra versión.** Con la 6 en la cabeza escribirás `json()` o `defer()`, que la 7 quitó, o `react-router-dom`, que quitó la 8. Mira primero qué versión tiene el proyecto y lee la documentación de esa versión: reactrouter.com guarda la de cada una, por ejemplo en `reactrouter.com/6.30.3/…` para la 6.

## Ejercicios

Los dos son la web de las mareas, en TSX y con los tipos exigidos: el panel de errores de tipos tiene que quedar limpio. `router.tsx`, `Paginas.tsx` y `api.ts` no hay que tocarlos; el trabajo va donde dicen los comentarios numerados. La API tarda 0,6 s, también en las comprobaciones, para que se vea la carga.

**1. La barra de estado, fuera del router.** En Mareas del Cantábrico quieren una barra encima de la web que diga siempre qué se está viendo y, mientras carga, adónde se va. Y un botón para volver a la lista. La barra vive fuera de `RouterProvider`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una barra que sigue al router",
  "consigna": "Ahora la barra lee router.state una vez y se queda ahí: pulsa «Laredo» y verás que no cambia. En BarraEstado.tsx: 1) suscríbete al router con useSyncExternalStore; 2) mientras navega, la barra dice «Cargando /puertos/laredo…», con la ruta de destino, y en reposo, «Viendo /puertos/laredo»; 3) «Volver a la lista» lleva a /puertos con router.navigate y está desactivado mientras el router navega.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { RouterProvider } from 'react-router/dom'\nimport { BarraEstado } from './BarraEstado'\nimport { router } from './router'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <>\n      <BarraEstado />\n      <RouterProvider router={router} />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "BarraEstado.tsx",
      "codigo": "import { router } from './router'\n\n// La barra vive FUERA del RouterProvider: aquí no hay hooks del router,\n// solo el objeto router.\nexport function BarraEstado() {\n  // 1) Suscríbete al router con useSyncExternalStore, para que la barra se\n  //    vuelva a pintar cada vez que cambia router.state.\n  const estado = router.state\n\n  // 2) Mientras el router navega, la barra dice «Cargando /puertos/laredo…»,\n  //    con la ruta de destino. Cuando termina, «Viendo /puertos/laredo».\n  const texto = `Viendo ${estado.location.pathname}`\n\n  return (\n    <div className=\"fuera\">\n      <p role=\"status\">{texto}</p>\n      {/* 3) Que el botón lleve a /puertos con router.navigate, y que esté\n             desactivado mientras el router navega. */}\n      <button type=\"button\">Volver a la lista</button>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "router.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { cargarMarea, cargarPuertos, ElegirPuerto, Maquetacion, Portada, Puertos, TablaMarea } from './Paginas'\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nexport const router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p>Abriendo las mareas…</p>,\n    children: [\n      { index: true, Component: Portada },\n      {\n        id: 'puertos',\n        path: 'puertos',\n        loader: cargarPuertos,\n        Component: Puertos,\n        children: [\n          { index: true, Component: ElegirPuerto },\n          { id: 'marea', path: ':puertoId', loader: cargarMarea, Component: TablaMarea },\n        ],\n      },\n    ],\n  },\n])\n"
    },
    {
      "nombre": "Paginas.tsx",
      "codigo": "import { Link, NavLink, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Marea, type Puerto } from './api'\n\n// Loader de la madre: la lista de puertos\nexport async function cargarPuertos() {\n  const puertos = await pedir<Puerto[]>('/api/puertos')\n  return { puertos }\n}\n\n// Loader de la hija: la marea de hoy en un puerto\nexport async function cargarMarea({ params }: LoaderFunctionArgs) {\n  const marea = await pedir<Marea>(`/api/mareas/${params.puertoId}`)\n  return { marea }\n}\n\nexport function Maquetacion() {\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Mareas del Cantábrico</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Inicio</Link> <Link to=\"/puertos\">Puertos</Link>\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h1>Las mareas de hoy</h1>\n      <p>Pleamares y bajamares de los puertos de Cantabria, para mariscar o salir a pescar.</p>\n      <Link to=\"/puertos/laredo\">Ver la marea de Laredo</Link> o <Link to=\"/puertos\">todos los puertos</Link>\n    </>\n  )\n}\n\nexport function Puertos() {\n  // El genérico le dice a TypeScript qué devuelve el loader (lección 2)\n  const { puertos } = useLoaderData<typeof cargarPuertos>()\n\n  return (\n    <div className=\"columnas\">\n      <nav aria-label=\"Puertos\">\n        <h1>Puertos</h1>\n        <ul>\n          {puertos.map((puerto) => (\n            <li key={puerto.id}>\n              <NavLink to={`/puertos/${puerto.id}`}>{puerto.nombre}</NavLink>\n            </li>\n          ))}\n        </ul>\n      </nav>\n      <Outlet />\n    </div>\n  )\n}\n\nexport function ElegirPuerto() {\n  return <p>Elige un puerto para ver sus mareas.</p>\n}\n\nexport function TablaMarea() {\n  const { marea } = useLoaderData<typeof cargarMarea>()\n\n  return (\n    <section aria-labelledby=\"titulo-marea\">\n      <h2 id=\"titulo-marea\">Marea en {marea.nombre}</h2>\n      <dl>\n        <dt>Pleamares</dt>\n        <dd>{marea.pleamares.join(' y ')}</dd>\n        <dt>Bajamares</dt>\n        <dd>{marea.bajamares.join(' y ')}</dd>\n      </dl>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Puerto = { id: string; nombre: string }\n\nexport type Marea = {\n  id: string\n  nombre: string\n  pleamares: string[]\n  bajamares: string[]\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string): Promise<T> {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #0f172a;\n  background: #f8fafc;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #0e7490;\n  background: #ecfeff;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #0e7490;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na.active {\n  font-weight: 700;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: minmax(9rem, 1fr) 2fr;\n  gap: 1rem;\n}\n\n.columnas ul {\n  margin: 0;\n  padding-left: 1.1rem;\n}\n\ndl {\n  display: grid;\n  grid-template-columns: auto 1fr;\n  gap: 0.25rem 0.75rem;\n  margin: 0;\n}\n\ndt {\n  font-weight: 600;\n}\n\ndd {\n  margin: 0;\n}\n\n/* Lo que vive fuera del RouterProvider */\n.fuera {\n  margin: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #64748b;\n  border-radius: 0.5rem;\n  background: #fff;\n  font-size: 0.85rem;\n}\n\n.fuera h2 {\n  font-size: 0.95rem;\n}\n\n.fuera dl {\n  font-family: ui-monospace, monospace;\n}\n\n.fuera p {\n  margin: 0.25rem 0;\n}\n\n.fuera button {\n  margin: 0.4rem 0.4rem 0 0;\n}\n\n.fuera ol {\n  margin: 0;\n  padding-left: 1.4rem;\n  font-family: ui-monospace, monospace;\n}\n"
    }
  ],
  "archivoInicial": "BarraEstado.tsx",
  "urlInicial": "/puertos",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "puertos": [
      {
        "id": "santona",
        "nombre": "Santoña"
      },
      {
        "id": "laredo",
        "nombre": "Laredo"
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales"
      },
      {
        "id": "suances",
        "nombre": "Suances"
      },
      {
        "id": "comillas",
        "nombre": "Comillas"
      }
    ],
    "mareas": [
      {
        "id": "santona",
        "nombre": "Santoña",
        "pleamares": [
          "05:04",
          "17:27"
        ],
        "bajamares": [
          "11:16",
          "23:40"
        ]
      },
      {
        "id": "laredo",
        "nombre": "Laredo",
        "pleamares": [
          "05:02",
          "17:25"
        ],
        "bajamares": [
          "11:14",
          "23:38"
        ]
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales",
        "pleamares": [
          "04:58",
          "17:21"
        ],
        "bajamares": [
          "11:10",
          "23:34"
        ]
      },
      {
        "id": "suances",
        "nombre": "Suances",
        "pleamares": [
          "05:11",
          "17:33"
        ],
        "bajamares": [
          "11:22",
          "23:46"
        ]
      },
      {
        "id": "comillas",
        "nombre": "Comillas",
        "pleamares": [
          "05:14",
          "17:36"
        ],
        "bajamares": [
          "11:25",
          "23:49"
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir /puertos, la barra dice «Viendo /puertos»",
      "pasos": [],
      "espera": {
        "texto": "Viendo /puertos"
      }
    },
    {
      "descripcion": "Al pulsar «Laredo», la barra pasa a «Viendo /puertos/laredo»",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        }
      ],
      "espera": {
        "texto": "Viendo /puertos/laredo"
      }
    },
    {
      "descripcion": "Mientras se carga Laredo, la barra dice «Cargando /puertos/laredo…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        }
      ],
      "espera": {
        "texto": "Cargando /puertos/laredo…"
      }
    },
    {
      "descripcion": "«Volver a la lista» lleva a /puertos",
      "urlInicial": "/puertos/laredo",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Marea en Laredo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Volver a la lista"
          }
        }
      ],
      "espera": {
        "url": "/puertos"
      }
    },
    {
      "descripcion": "Mientras el router navega, «Volver a la lista» está desactivado: pulsarlo no corta la carga de Laredo",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Volver a la lista"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Marea en Laredo"
      }
    },
    {
      "descripcion": "Con Atrás, la barra vuelve a «Viendo /puertos»",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        },
        {
          "pulsar": {
            "texto": "Viendo /puertos/laredo"
          }
        },
        {
          "atras": true
        }
      ],
      "espera": {
        "texto": "Viendo /puertos"
      }
    }
  ]
}
```

**2. La bitácora de navegaciones.** Para saber si la web va lenta con la cobertura de los puertos, quieren apuntar cada navegación y lo que tardó. Otra vez fuera de `RouterProvider`, ahora con `router.subscribe` dentro de un efecto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Apuntar cada navegación con router.subscribe",
  "consigna": "En Bitacora.tsx, dentro del useEffect: 1) suscríbete con router.subscribe; 2) cuando una navegación empieza, guarda la hora; 3) cuando termina, añade el apunte con location.key, location.pathname y los milisegundos; 4) devuelve la función que te da subscribe. La carga inicial no cuenta. Compara tus milisegundos con los del registro del router, debajo de la vista previa.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { RouterProvider } from 'react-router/dom'\nimport { Bitacora } from './Bitacora'\nimport { router } from './router'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <>\n      <RouterProvider router={router} />\n      <Bitacora />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Bitacora.tsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { router } from './router'\n\ntype Apunte = { clave: string; ruta: string; ms: number }\n\n// La bitácora apunta cada navegación terminada y lo que tardó.\n// Vive fuera del RouterProvider: habla directamente con el router.\nexport function Bitacora() {\n  const [apuntes, setApuntes] = useState<Apunte[]>([])\n\n  useEffect(() => {\n    // 1) Suscríbete con router.subscribe(estado => …).\n    // 2) Cuando una navegación empieza (navigation.state deja de ser 'idle'),\n    //    guarda la hora con performance.now(), si no la tenías ya.\n    // 3) Cuando vuelve a 'idle' y tenías una hora guardada, añade un apunte:\n    //    clave: location.key, ruta: location.pathname y los ms redondeados.\n    //    Después, olvida la hora. La carga inicial no cuenta.\n    // 4) Devuelve lo que devuelve subscribe: es la limpieza del efecto.\n  }, [])\n\n  return (\n    <aside className=\"fuera\" aria-label=\"Bitácora de navegaciones\">\n      <h2>Bitácora</h2>\n      <p>Navegaciones: {apuntes.length}</p>\n      <ol>\n        {apuntes.map((apunte) => (\n          <li key={apunte.clave}>\n            {apunte.ruta} · {apunte.ms} ms\n          </li>\n        ))}\n      </ol>\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "router.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { cargarMarea, cargarPuertos, ElegirPuerto, Maquetacion, Portada, Puertos, TablaMarea } from './Paginas'\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nexport const router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p>Abriendo las mareas…</p>,\n    children: [\n      { index: true, Component: Portada },\n      {\n        id: 'puertos',\n        path: 'puertos',\n        loader: cargarPuertos,\n        Component: Puertos,\n        children: [\n          { index: true, Component: ElegirPuerto },\n          { id: 'marea', path: ':puertoId', loader: cargarMarea, Component: TablaMarea },\n        ],\n      },\n    ],\n  },\n])\n"
    },
    {
      "nombre": "Paginas.tsx",
      "codigo": "import { Link, NavLink, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Marea, type Puerto } from './api'\n\n// Loader de la madre: la lista de puertos\nexport async function cargarPuertos() {\n  const puertos = await pedir<Puerto[]>('/api/puertos')\n  return { puertos }\n}\n\n// Loader de la hija: la marea de hoy en un puerto\nexport async function cargarMarea({ params }: LoaderFunctionArgs) {\n  const marea = await pedir<Marea>(`/api/mareas/${params.puertoId}`)\n  return { marea }\n}\n\nexport function Maquetacion() {\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Mareas del Cantábrico</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Inicio</Link> <Link to=\"/puertos\">Puertos</Link>\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h1>Las mareas de hoy</h1>\n      <p>Pleamares y bajamares de los puertos de Cantabria, para mariscar o salir a pescar.</p>\n      <Link to=\"/puertos/laredo\">Ver la marea de Laredo</Link> o <Link to=\"/puertos\">todos los puertos</Link>\n    </>\n  )\n}\n\nexport function Puertos() {\n  // El genérico le dice a TypeScript qué devuelve el loader (lección 2)\n  const { puertos } = useLoaderData<typeof cargarPuertos>()\n\n  return (\n    <div className=\"columnas\">\n      <nav aria-label=\"Puertos\">\n        <h1>Puertos</h1>\n        <ul>\n          {puertos.map((puerto) => (\n            <li key={puerto.id}>\n              <NavLink to={`/puertos/${puerto.id}`}>{puerto.nombre}</NavLink>\n            </li>\n          ))}\n        </ul>\n      </nav>\n      <Outlet />\n    </div>\n  )\n}\n\nexport function ElegirPuerto() {\n  return <p>Elige un puerto para ver sus mareas.</p>\n}\n\nexport function TablaMarea() {\n  const { marea } = useLoaderData<typeof cargarMarea>()\n\n  return (\n    <section aria-labelledby=\"titulo-marea\">\n      <h2 id=\"titulo-marea\">Marea en {marea.nombre}</h2>\n      <dl>\n        <dt>Pleamares</dt>\n        <dd>{marea.pleamares.join(' y ')}</dd>\n        <dt>Bajamares</dt>\n        <dd>{marea.bajamares.join(' y ')}</dd>\n      </dl>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Puerto = { id: string; nombre: string }\n\nexport type Marea = {\n  id: string\n  nombre: string\n  pleamares: string[]\n  bajamares: string[]\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string): Promise<T> {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #0f172a;\n  background: #f8fafc;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #0e7490;\n  background: #ecfeff;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #0e7490;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na.active {\n  font-weight: 700;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: minmax(9rem, 1fr) 2fr;\n  gap: 1rem;\n}\n\n.columnas ul {\n  margin: 0;\n  padding-left: 1.1rem;\n}\n\ndl {\n  display: grid;\n  grid-template-columns: auto 1fr;\n  gap: 0.25rem 0.75rem;\n  margin: 0;\n}\n\ndt {\n  font-weight: 600;\n}\n\ndd {\n  margin: 0;\n}\n\n/* Lo que vive fuera del RouterProvider */\n.fuera {\n  margin: 0.5rem;\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #64748b;\n  border-radius: 0.5rem;\n  background: #fff;\n  font-size: 0.85rem;\n}\n\n.fuera h2 {\n  font-size: 0.95rem;\n}\n\n.fuera dl {\n  font-family: ui-monospace, monospace;\n}\n\n.fuera p {\n  margin: 0.25rem 0;\n}\n\n.fuera button {\n  margin: 0.4rem 0.4rem 0 0;\n}\n\n.fuera ol {\n  margin: 0;\n  padding-left: 1.4rem;\n  font-family: ui-monospace, monospace;\n}\n"
    }
  ],
  "archivoInicial": "Bitacora.tsx",
  "urlInicial": "/puertos",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "puertos": [
      {
        "id": "santona",
        "nombre": "Santoña"
      },
      {
        "id": "laredo",
        "nombre": "Laredo"
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales"
      },
      {
        "id": "suances",
        "nombre": "Suances"
      },
      {
        "id": "comillas",
        "nombre": "Comillas"
      }
    ],
    "mareas": [
      {
        "id": "santona",
        "nombre": "Santoña",
        "pleamares": [
          "05:04",
          "17:27"
        ],
        "bajamares": [
          "11:16",
          "23:40"
        ]
      },
      {
        "id": "laredo",
        "nombre": "Laredo",
        "pleamares": [
          "05:02",
          "17:25"
        ],
        "bajamares": [
          "11:14",
          "23:38"
        ]
      },
      {
        "id": "castro",
        "nombre": "Castro Urdiales",
        "pleamares": [
          "04:58",
          "17:21"
        ],
        "bajamares": [
          "11:10",
          "23:34"
        ]
      },
      {
        "id": "suances",
        "nombre": "Suances",
        "pleamares": [
          "05:11",
          "17:33"
        ],
        "bajamares": [
          "11:22",
          "23:46"
        ]
      },
      {
        "id": "comillas",
        "nombre": "Comillas",
        "pleamares": [
          "05:14",
          "17:36"
        ],
        "bajamares": [
          "11:25",
          "23:49"
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Ir a Laredo deja un apunte de /puertos/laredo",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "/puertos/laredo"
      }
    },
    {
      "descripcion": "Una navegación se apunta una sola vez: «Navegaciones: 1»",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "/puertos/laredo"
          }
        }
      ],
      "espera": {
        "texto": "Navegaciones: 1"
      }
    },
    {
      "descripcion": "La carga inicial no se apunta: «Navegaciones: 0»",
      "urlInicial": "/puertos/laredo",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Marea en Laredo"
          }
        }
      ],
      "espera": {
        "texto": "Navegaciones: 0"
      }
    },
    {
      "descripcion": "Dos navegaciones dejan dos apuntes",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "/puertos/laredo"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Suances"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "/puertos/suances"
          }
        }
      ],
      "espera": {
        "texto": "Navegaciones: 2"
      }
    },
    {
      "descripcion": "Atrás también se apunta",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laredo"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "/puertos/laredo"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Suances"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "/puertos/suances"
          }
        },
        {
          "atras": true
        }
      ],
      "espera": {
        "texto": "Navegaciones: 3"
      }
    }
  ]
}
```

Si desde una ficha vas a la portada o a la lista, no se apunta nada: no hay ningún `loader` que esperar, así que la navegación termina sin pasar por `'loading'` (el paso 3 del ciclo). ¿Deberían contar? Es el primer reto.

**Retos para seguir practicando** (sin comprobación automática):

1. **Que cuente todo.** Haz que la bitácora apunte también las navegaciones que no pasan por `'loading'`, comparando el `location.key` de cada estado con el anterior. Y que cada línea diga si fue un enlace o Atrás y Adelante, con `estado.historyAction` (`PUSH`, `REPLACE` o `POP`).
2. **Un Hook a medida.** Escribe `useEstadoDelRouter(selector)` con `useSyncExternalStore`, que devuelva solo una parte de `router.state`; por ejemplo, `(estado) => estado.navigation.state`. Pon un `console.log` en el render de la barra del ejercicio 1 y comprueba que, con el selector, ya no se pinta cuando cambia algo que no usa (lección 46 de React).
3. **El router en la consola de DevTools.** En un proyecto de Vite con React Router 8, añade `if (import.meta.env.DEV) Object.assign(window, { router })` después de crearlo. Desde la consola, navega con `router.navigate('/puertos/suances')`, mira `router.state.loaderData` y prueba `await router.navigate('/puertos')` para ver cuándo se cumple la promesa.
4. **Una pregunta sobre la 8.5.** Su changelog arregla la recuperación del estado cuando cambia «antes de que `RouterProvider` se suscriba». Con lo que sabes del ciclo, explica cómo puede cambiar `router.state` antes de esa suscripción y qué tiene que hacer `RouterProvider` al montarse para no perderse nada.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Picking a Mode",
      "descripcion": "Los tres modos con su punto de entrada, el consejo para elegir y la tabla de qué API existe en cada modo.",
      "url": "https://reactrouter.com/start/modes",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Custom Framework",
      "descripcion": "El modo datos como tu propio framework: createBrowserRouter en el navegador y, si quieres renderizar en el servidor, createStaticHandler.",
      "url": "https://reactrouter.com/start/data/custom",
      "etiqueta": "React Router"
    },
    {
      "titulo": "createMemoryRouter",
      "descripcion": "La referencia del router en memoria y de todas sus opciones: initialEntries, dataStrategy, getContext, instrumentations…",
      "url": "https://reactrouter.com/api/data-routers/createMemoryRouter",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Upgrading from v7",
      "descripcion": "Qué cambia al pasar de la 7 a la 8, future flag a future flag, y los mínimos de Node y React.",
      "url": "https://reactrouter.com/upgrading/v7",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Changelog",
      "descripcion": "Las notas de cada versión. Las de la 8.0.0 explican el calendario de una versión mayor al año.",
      "url": "https://reactrouter.com/changelog",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Data Strategy",
      "descripcion": "Cómo ejecuta el router los loader por defecto, todos en paralelo, y cómo cambiarlo. Una API para casos avanzados.",
      "url": "https://reactrouter.com/how-to/data-strategy",
      "etiqueta": "React Router"
    }
  ]
}
```
