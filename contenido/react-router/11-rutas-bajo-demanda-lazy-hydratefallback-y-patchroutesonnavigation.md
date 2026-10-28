# Rutas bajo demanda: `lazy`, `HydrateFallback` y `patchRoutesOnNavigation`

- **Módulo:** Más allá de cargar y enviar
- **Slug:** `rutas-bajo-demanda-lazy-hydratefallback-y-patchroutesonnavigation` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [Route Object: lazy](https://reactrouter.com/start/data/route-object) + [Custom Framework: Lazy Loading](https://reactrouter.com/start/data/custom) + [createMemoryRouter: patchRoutesOnNavigation](https://reactrouter.com/api/data-routers/createMemoryRouter) — ver `contenido/react-router/TEMARIO.md` #11
- **Requiere:** El módulo 2 de esta ficha (lecciones 2 a 7) y la lección 50 de React (`lazy`). Para comparar, la 93 de React

---

## Qué es y para qué sirve

La asociación **Senderos de Gúdar**, de Mosqueruela (Teruel), mantiene cinco senderos señalizados en la sierra. Su web tiene dos páginas: la portada, con la lista de senderos, y la ficha de cada uno, con la salida, los kilómetros y un perfil de desnivel. En la web de verdad, ese perfil lo dibuja una librería de gráficos de 180 kB que solo necesita quien abre una ficha.

En la lección 50 de React aprendiste a sacar un componente así del archivo principal con `lazy` e `import()`, y en la 93 lo aplicaste a las páginas de un router declarativo. En el modo datos aparece una pregunta nueva: la ficha tiene un `loader`, y ahora hay dos cosas que esperar, **el código de la página y sus datos**. ¿Quién espera a quién? Piénsalo antes de verlo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "import { lazy } from 'react'\n\n// La ficha, con lazy de React: su archivo se pide al pintarla\nconst Ficha = lazy(() => import('./Ficha'))\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion, // con un <Suspense> alrededor de su <Outlet />\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      { path: 'senderos/:id', loader: cargarFicha, Component: Ficha },\n    ],\n  },\n])\n\n// Estás en la portada y pulsas «Masías de Mosqueruela».\n// La API tarda 600 ms y Ficha.tsx, 900 ms en descargarse.",
  "opciones": [
    "Unos 900 ms: el archivo de la ficha y sus datos se piden a la vez",
    "A los 600 ms sale el fallback del Suspense, y la ficha a los 900",
    "Unos 1.500 ms: primero los datos y, cuando llegan, el archivo de la ficha",
    "Unos 1.500 ms: primero el archivo de la ficha y después los datos"
  ],
  "correcta": 2,
  "explicacion": "lazy de React pide el archivo cuando React intenta pintar Ficha, y el router no pinta Ficha hasta tener los datos de su loader. Comprobado en un proyecto de Vite: la API respondió a los 662 ms, la petición de Ficha-….js salió un milisegundo después y la ficha apareció a los 1.608 ms. El fallback no llega a verse porque la navegación va en una transición (lección 93 de React)."
}
```

Lo mismo en la vista previa. Como en las lecciones anteriores, `createBrowserRouter` usa aquí un historial en memoria; la barra de direcciones lo indica. La cabecera lleva un cronómetro, `Cronometro` en `App.tsx`, que mide desde que el router empieza a cargar hasta que la página nueva está en pantalla. Debajo de la vista previa tienes el **registro del router**, que apunta cada `loader` que ejecuta el router, y cada `lazy` escrito como función, con su inicio y su duración.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha con lazy de React: datos primero, código después",
  "consigna": "Abre «Masías de Mosqueruela» y mira el cronómetro de la cabecera: unos 1.500 ms. En el registro del router, esa navegación termina a los 600 ms, con un solo paso, el loader: el router no sabe nada de Ficha.tsx, que pide React después. La barra cambia a /senderos/3 a los 600 ms con la portada aún en pantalla. Vuelve a «Todos los senderos» y abre otra ficha: 600 ms, porque el archivo ya está descargado.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { lazy, Suspense, useEffect, useRef, useState } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useLocation, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { descargar, pedirJson, type Sendero } from './api'\nimport { loader as cargarFicha } from './ficha-datos'\nimport './estilos.css'\n\n// La ficha, con lazy de React: su archivo se pide al pintarla\nconst Ficha = lazy(() => descargar(900, () => import('./Ficha')))\n\nasync function cargarSenderos({ request }: LoaderFunctionArgs) {\n  return { senderos: await pedirJson<Sendero[]>('/api/senderos', request.signal) }\n}\n\nfunction Portada() {\n  const { senderos } = useLoaderData<typeof cargarSenderos>()\n  return (\n    <>\n      <h2>Senderos señalizados</h2>\n      <ul>\n        {senderos.map((sendero) => (\n          <li key={sendero.id}>\n            <Link to={`/senderos/${sendero.id}`}>{sendero.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// Mide desde que el router empieza a cargar hasta que la página nueva está en pantalla\nfunction Cronometro() {\n  const navigation = useNavigation()\n  const location = useLocation()\n  const inicio = useRef<number | null>(null)\n  const [ms, setMs] = useState<number | null>(null)\n  useEffect(() => {\n    if (navigation.state === 'loading') inicio.current ??= performance.now()\n  }, [navigation.state])\n  useEffect(() => {\n    if (inicio.current === null) return\n    setMs(Math.round(performance.now() - inicio.current))\n    inicio.current = null\n  }, [location])\n  return <p>{ms === null ? '' : `Última página: ${ms} ms`}</p>\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Senderos de Gúdar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los senderos</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n        <Cronometro />\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Suspense fallback={<p className=\"cargando\">Descargando la ficha…</p>}>\n          <Outlet />\n        </Suspense>\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      { path: 'senderos/:id', loader: cargarFicha, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { loader } from './ficha-datos'\n\n// En la web de verdad, este archivo trae una librería de gráficos de 180 kB.\n// Aquí el perfil es un SVG sencillo.\nfunction PerfilDesnivel({ alturas }: { alturas: number[] }) {\n  const minima = Math.min(...alturas)\n  const maxima = Math.max(...alturas)\n  const puntos = alturas\n    .map((altura, km) => `${(km / (alturas.length - 1)) * 300},${100 - ((altura - minima) / (maxima - minima)) * 90}`)\n    .join(' ')\n  return (\n    <svg viewBox=\"0 0 300 100\" role=\"img\" aria-label={`Perfil de desnivel: entre ${minima} y ${maxima} m`}>\n      <polyline points={puntos} fill=\"none\" stroke=\"currentColor\" strokeWidth=\"3\" />\n    </svg>\n  )\n}\n\nexport default function Ficha() {\n  const { sendero } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{sendero.nombre}</h2>\n      <p>\n        Sale de {sendero.salida} · {sendero.km.toLocaleString('es-ES')} km · {sendero.desnivel} m de desnivel\n      </p>\n      <h3>Perfil de desnivel</h3>\n      <PerfilDesnivel alturas={sendero.perfil} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha-datos.ts",
      "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Sendero } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  return { sendero: await pedirJson<Sendero>(`/api/senderos/${params.id}`, request.signal) }\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Sendero = {\n  id: number\n  nombre: string\n  salida: string\n  km: number\n  desnivel: number\n  perfil: number[] // la altitud, en metros, en cada kilómetro\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría en llegar el archivo y después lo importa.\nexport function descargar<T>(ms: number, importar: () => Promise<T>): Promise<T> {\n  return new Promise((resolver) => setTimeout(resolver, ms)).then(importar)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #26231c;\n  background: #f6f4ee;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #4a3b24;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nheader p {\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0.6rem 0 0.3rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nsvg {\n  display: block;\n  width: 100%;\n  max-width: 420px;\n  color: #8a5a1c;\n  background: #fff;\n  border: 1px solid #d8d0bd;\n  border-radius: 6px;\n}\n\n.cargando {\n  color: #6b6557;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "senderos": [
      {
        "id": 1,
        "nombre": "Subida a Peñarroya",
        "salida": "Valdelinares",
        "km": 11.4,
        "desnivel": 420,
        "perfil": [
          1690,
          1745,
          1810,
          1880,
          1945,
          2024,
          1960,
          1880,
          1790,
          1720,
          1690
        ]
      },
      {
        "id": 2,
        "nombre": "Pinares de Linares de Mora",
        "salida": "Linares de Mora",
        "km": 8.2,
        "desnivel": 310,
        "perfil": [
          1290,
          1360,
          1450,
          1540,
          1600,
          1520,
          1410,
          1330,
          1290
        ]
      },
      {
        "id": 3,
        "nombre": "Masías de Mosqueruela",
        "salida": "Mosqueruela",
        "km": 14.6,
        "desnivel": 380,
        "perfil": [
          1470,
          1500,
          1560,
          1620,
          1690,
          1740,
          1710,
          1660,
          1600,
          1560,
          1530,
          1500,
          1480,
          1470
        ]
      },
      {
        "id": 4,
        "nombre": "Murallas de Puertomingalvo",
        "salida": "Puertomingalvo",
        "km": 6.3,
        "desnivel": 240,
        "perfil": [
          1460,
          1390,
          1310,
          1250,
          1300,
          1390,
          1460
        ]
      },
      {
        "id": 5,
        "nombre": "Fuentes del Mijares",
        "salida": "El Castellar",
        "km": 9.1,
        "desnivel": 290,
        "perfil": [
          1540,
          1600,
          1680,
          1750,
          1790,
          1720,
          1650,
          1590,
          1560,
          1540
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo que es real y lo que se simula en esta vista previa",
  "contenido": "La vista previa no parte el código en archivos: import() se convierte en un require de un módulo que ya está en memoria y llega al instante. Por eso cada import() pasa por descargar(ms, importar), de api.ts, que espera lo que tardaría el archivo: 900 ms Ficha.tsx, con su librería de gráficos, y 100 ms ficha-datos.ts. En tu proyecto escribirías solo el import(). Lo demás es real: React Router 8.5.0 llama a lazy, espera y guarda lo que recibe. Todo se comprobó también con archivos de verdad, en un proyecto de Vite."
}
```

**El problema no es `lazy` de React, sino quién lo pide.** El router decide cuándo termina una navegación, pero el archivo de la página lo pide React al pintar, cuando el router ya ha terminado. Las dos esperas van una detrás de otra, y el router ni se entera de la segunda: su registro dice 600 ms y tú has esperado 1.500.

React Router tiene su propio `lazy`, una propiedad del objeto de ruta. **La definición de la ruta (`path`, `index`, `children`) se queda en el archivo principal, y la implementación (`loader`, `action`, `Component`, `ErrorBoundary`…) se descarga al navegar a ella.** Como el router sabe qué rutas encajan con la URL antes de descargar nada, puede pedir el código y los datos él mismo, y en el orden que más le conviene. En esta lección verás:

- `lazy` como función y como objeto, y por qué el objeto deja que el `loader` empiece sin esperar al componente;
- en qué se diferencia, con números, de `lazy` de React;
- qué se ve en la primera carga, con `HydrateFallback`, y el aviso que sale cuando falta;
- qué pasa cuando una descarga falla, y dónde poner el límite de error;
- `patchRoutesOnNavigation`, para cuando ni siquiera conoces las rutas de antemano.

## `lazy` como función: la ruta se completa al navegar

La primera forma es una función asíncrona que devuelve las propiedades que le faltan a la ruta. Así queda en tu proyecto, sin la simulación:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        lazy: async () => {\n          const [datos, pagina] = await Promise.all([import('./ficha-datos'), import('./Ficha')])\n          return { loader: datos.loader, Component: pagina.default }\n        },\n      },\n    ],\n  },\n])",
  "anotaciones": [
    {
      "fragmento": "path: 'senderos/:id',",
      "nota": "El path se queda fuera de lazy: el router tiene que saber qué ruta encaja con la URL antes de descargar nada."
    },
    {
      "fragmento": "lazy: async () => {",
      "nota": "El router la llama la primera vez que navegas a esta ruta, ni antes ni después. Cuando se cumple, copia lo que devuelve en la ruta y ya no la vuelve a llamar."
    },
    {
      "fragmento": "Promise.all([import('./ficha-datos'), import('./Ficha')])",
      "nota": "Los dos archivos se piden a la vez, como propone la documentación. Pero la función no termina hasta que llegan los dos, y el más lento manda."
    },
    {
      "fragmento": "return { loader: datos.loader, Component: pagina.default }",
      "nota": "Las propiedades que le faltan a la ruta, con sus nombres de siempre. Ojo con default: lo que trae import() es el módulo entero, no el componente."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "lazy como función: el código primero, los datos después",
  "consigna": "Abre «Masías de Mosqueruela»: otra vez unos 1.500 ms, pero ahora el registro lo cuenta todo: un paso lazy de 900 ms y, cuando termina, el loader, de 600 ms. Fíjate en las barras: van en cadena. La barra de direcciones y «Cargando…» ya no mienten: cambian cuando la ficha está lista. Vuelve a la portada y abre la ficha otra vez: el paso lazy ya no aparece.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef, useState } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useLocation, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { descargar, pedirJson, type Sendero } from './api'\nimport './estilos.css'\n\nasync function cargarSenderos({ request }: LoaderFunctionArgs) {\n  return { senderos: await pedirJson<Sendero[]>('/api/senderos', request.signal) }\n}\n\nfunction Portada() {\n  const { senderos } = useLoaderData<typeof cargarSenderos>()\n  return (\n    <>\n      <h2>Senderos señalizados</h2>\n      <ul>\n        {senderos.map((sendero) => (\n          <li key={sendero.id}>\n            <Link to={`/senderos/${sendero.id}`}>{sendero.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// Mide desde que el router empieza a cargar hasta que la página nueva está en pantalla\nfunction Cronometro() {\n  const navigation = useNavigation()\n  const location = useLocation()\n  const inicio = useRef<number | null>(null)\n  const [ms, setMs] = useState<number | null>(null)\n  useEffect(() => {\n    if (navigation.state === 'loading') inicio.current ??= performance.now()\n  }, [navigation.state])\n  useEffect(() => {\n    if (inicio.current === null) return\n    setMs(Math.round(performance.now() - inicio.current))\n    inicio.current = null\n  }, [location])\n  return <p>{ms === null ? '' : `Última página: ${ms} ms`}</p>\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Senderos de Gúdar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los senderos</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n        <Cronometro />\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        // lazy como función: devuelve todo lo de la ruta de una vez\n        lazy: async () => {\n          const [datos, pagina] = await Promise.all([\n            descargar(100, () => import('./ficha-datos')),\n            descargar(900, () => import('./Ficha')),\n          ])\n          return { loader: datos.loader, Component: pagina.default }\n        },\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { loader } from './ficha-datos'\n\n// En la web de verdad, este archivo trae una librería de gráficos de 180 kB.\n// Aquí el perfil es un SVG sencillo.\nfunction PerfilDesnivel({ alturas }: { alturas: number[] }) {\n  const minima = Math.min(...alturas)\n  const maxima = Math.max(...alturas)\n  const puntos = alturas\n    .map((altura, km) => `${(km / (alturas.length - 1)) * 300},${100 - ((altura - minima) / (maxima - minima)) * 90}`)\n    .join(' ')\n  return (\n    <svg viewBox=\"0 0 300 100\" role=\"img\" aria-label={`Perfil de desnivel: entre ${minima} y ${maxima} m`}>\n      <polyline points={puntos} fill=\"none\" stroke=\"currentColor\" strokeWidth=\"3\" />\n    </svg>\n  )\n}\n\nexport default function Ficha() {\n  const { sendero } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{sendero.nombre}</h2>\n      <p>\n        Sale de {sendero.salida} · {sendero.km.toLocaleString('es-ES')} km · {sendero.desnivel} m de desnivel\n      </p>\n      <h3>Perfil de desnivel</h3>\n      <PerfilDesnivel alturas={sendero.perfil} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha-datos.ts",
      "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Sendero } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  return { sendero: await pedirJson<Sendero>(`/api/senderos/${params.id}`, request.signal) }\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Sendero = {\n  id: number\n  nombre: string\n  salida: string\n  km: number\n  desnivel: number\n  perfil: number[] // la altitud, en metros, en cada kilómetro\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría en llegar el archivo y después lo importa.\nexport function descargar<T>(ms: number, importar: () => Promise<T>): Promise<T> {\n  return new Promise((resolver) => setTimeout(resolver, ms)).then(importar)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #26231c;\n  background: #f6f4ee;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #4a3b24;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nheader p {\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0.6rem 0 0.3rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nsvg {\n  display: block;\n  width: 100%;\n  max-width: 420px;\n  color: #8a5a1c;\n  background: #fff;\n  border: 1px solid #d8d0bd;\n  border-radius: 6px;\n}\n\n.cargando {\n  color: #6b6557;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "senderos": [
      {
        "id": 1,
        "nombre": "Subida a Peñarroya",
        "salida": "Valdelinares",
        "km": 11.4,
        "desnivel": 420,
        "perfil": [
          1690,
          1745,
          1810,
          1880,
          1945,
          2024,
          1960,
          1880,
          1790,
          1720,
          1690
        ]
      },
      {
        "id": 2,
        "nombre": "Pinares de Linares de Mora",
        "salida": "Linares de Mora",
        "km": 8.2,
        "desnivel": 310,
        "perfil": [
          1290,
          1360,
          1450,
          1540,
          1600,
          1520,
          1410,
          1330,
          1290
        ]
      },
      {
        "id": 3,
        "nombre": "Masías de Mosqueruela",
        "salida": "Mosqueruela",
        "km": 14.6,
        "desnivel": 380,
        "perfil": [
          1470,
          1500,
          1560,
          1620,
          1690,
          1740,
          1710,
          1660,
          1600,
          1560,
          1530,
          1500,
          1480,
          1470
        ]
      },
      {
        "id": 4,
        "nombre": "Murallas de Puertomingalvo",
        "salida": "Puertomingalvo",
        "km": 6.3,
        "desnivel": 240,
        "perfil": [
          1460,
          1390,
          1310,
          1250,
          1300,
          1390,
          1460
        ]
      },
      {
        "id": 5,
        "nombre": "Fuentes del Mijares",
        "salida": "El Castellar",
        "km": 9.1,
        "desnivel": 290,
        "perfil": [
          1540,
          1600,
          1680,
          1750,
          1790,
          1720,
          1650,
          1590,
          1560,
          1540
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

La función mejora dos cosas respecto a `lazy` de React. El código del `loader` también sale del archivo principal, y **el router controla toda la espera**: la navegación no termina hasta que la ficha está lista, así que `useNavigation`, la barra y el registro dicen la verdad, y ni siquiera hace falta un `<Suspense>`. Pero la cascada sigue ahí, al revés: **el `loader` va dentro de lo que devuelve la función, y el router no puede llamarlo hasta que la función termina**. Si `Ficha.tsx` tarda 900 ms, los datos no se piden hasta pasados esos 900 ms.

Qué puede traer `lazy`, y qué no:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Lo que puede traer",
      "texto": "Todo lo que hace la ruta una vez encajada: loader, action, Component, ErrorBoundary, shouldRevalidate, handle. Con la función, lo que devuelve; con el objeto, una función por propiedad."
    },
    {
      "titulo": "Lo que no puede traer",
      "texto": "Lo que decide si la ruta encaja: path, index, children, id y caseSensitive. El router lo necesita antes de descargar nada. Si la función lo devuelve, el router lo ignora y avisa en la consola, y TypeScript lo marca antes."
    },
    {
      "titulo": "El middleware, solo en el objeto",
      "texto": "La función tampoco puede traer middleware: se ignora con otro aviso. La forma de objeto sí admite una propiedad middleware, que el router descarga antes de ejecutar la cadena (lección 10)."
    },
    {
      "titulo": "Lo que ya está en la ruta, manda",
      "texto": "Si la ruta tiene un loader escrito y lazy también trae uno, gana el de la ruta y el router avisa de que ignora el otro."
    },
    {
      "titulo": "Una vez por ruta",
      "texto": "Cuando lazy se cumple, el router guarda lo que trae en la ruta. Las navegaciones siguientes van directas al loader, como si el código hubiera estado ahí desde el principio."
    }
  ]
}
```

## `lazy` como objeto: el `loader` no espera al componente

La segunda forma es un objeto con una función por propiedad. Cada una carga su pieza por separado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "{\n  path: 'senderos/:id',\n  lazy: {\n    loader: async () => (await import('./ficha-datos')).loader,\n    Component: async () => (await import('./Ficha')).default,\n  },\n}",
  "anotaciones": [
    {
      "fragmento": "lazy: {",
      "nota": "Al navegar a la ruta, el router llama a todas las funciones del objeto a la vez: cada archivo se pide por su cuenta."
    },
    {
      "fragmento": "loader: async () => (await import('./ficha-datos')).loader,",
      "nota": "Devuelve solo el loader. En cuanto llega este archivo, que es pequeño, el router ejecuta el loader, sin esperar a Ficha.tsx."
    },
    {
      "fragmento": "Component: async () => (await import('./Ficha')).default,",
      "nota": "El componente llega cuando llega. La navegación termina cuando están los datos y el componente, y entonces se pinta la ficha."
    }
  ]
}
```

El reparto en archivos es lo que lo hace posible: `ficha-datos.ts` lleva el `loader` y es diminuto, y `Ficha.tsx` lleva la página y la librería de gráficos. `Ficha.tsx` necesita el tipo del `loader` para su `useLoaderData<typeof loader>()`, y lo trae con `import type`, que desaparece al compilar: no arrastra el código del `loader` a su archivo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "lazy como objeto: el loader sale en cuanto llega su archivo",
  "consigna": "Abre «Masías de Mosqueruela»: unos 900 ms. En el registro no hay paso lazy, solo el loader, que empieza a los 100 ms, lo que tarda en llegar su archivo, y no a los 900. La navegación dura 900 ms aunque el loader acaba a los 700: lo que falta es Ficha.tsx, que llega a la vez. Compara el cronómetro con el de los dos bloques anteriores.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef, useState } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useLocation, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { descargar, pedirJson, type Sendero } from './api'\nimport './estilos.css'\n\nasync function cargarSenderos({ request }: LoaderFunctionArgs) {\n  return { senderos: await pedirJson<Sendero[]>('/api/senderos', request.signal) }\n}\n\nfunction Portada() {\n  const { senderos } = useLoaderData<typeof cargarSenderos>()\n  return (\n    <>\n      <h2>Senderos señalizados</h2>\n      <ul>\n        {senderos.map((sendero) => (\n          <li key={sendero.id}>\n            <Link to={`/senderos/${sendero.id}`}>{sendero.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// Mide desde que el router empieza a cargar hasta que la página nueva está en pantalla\nfunction Cronometro() {\n  const navigation = useNavigation()\n  const location = useLocation()\n  const inicio = useRef<number | null>(null)\n  const [ms, setMs] = useState<number | null>(null)\n  useEffect(() => {\n    if (navigation.state === 'loading') inicio.current ??= performance.now()\n  }, [navigation.state])\n  useEffect(() => {\n    if (inicio.current === null) return\n    setMs(Math.round(performance.now() - inicio.current))\n    inicio.current = null\n  }, [location])\n  return <p>{ms === null ? '' : `Última página: ${ms} ms`}</p>\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Senderos de Gúdar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los senderos</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n        <Cronometro />\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        // lazy como objeto: cada propiedad llega por su cuenta\n        lazy: {\n          loader: async () => (await descargar(100, () => import('./ficha-datos'))).loader,\n          Component: async () => (await descargar(900, () => import('./Ficha'))).default,\n        },\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { loader } from './ficha-datos'\n\n// En la web de verdad, este archivo trae una librería de gráficos de 180 kB.\n// Aquí el perfil es un SVG sencillo.\nfunction PerfilDesnivel({ alturas }: { alturas: number[] }) {\n  const minima = Math.min(...alturas)\n  const maxima = Math.max(...alturas)\n  const puntos = alturas\n    .map((altura, km) => `${(km / (alturas.length - 1)) * 300},${100 - ((altura - minima) / (maxima - minima)) * 90}`)\n    .join(' ')\n  return (\n    <svg viewBox=\"0 0 300 100\" role=\"img\" aria-label={`Perfil de desnivel: entre ${minima} y ${maxima} m`}>\n      <polyline points={puntos} fill=\"none\" stroke=\"currentColor\" strokeWidth=\"3\" />\n    </svg>\n  )\n}\n\nexport default function Ficha() {\n  const { sendero } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{sendero.nombre}</h2>\n      <p>\n        Sale de {sendero.salida} · {sendero.km.toLocaleString('es-ES')} km · {sendero.desnivel} m de desnivel\n      </p>\n      <h3>Perfil de desnivel</h3>\n      <PerfilDesnivel alturas={sendero.perfil} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha-datos.ts",
      "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Sendero } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  return { sendero: await pedirJson<Sendero>(`/api/senderos/${params.id}`, request.signal) }\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Sendero = {\n  id: number\n  nombre: string\n  salida: string\n  km: number\n  desnivel: number\n  perfil: number[] // la altitud, en metros, en cada kilómetro\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría en llegar el archivo y después lo importa.\nexport function descargar<T>(ms: number, importar: () => Promise<T>): Promise<T> {\n  return new Promise((resolver) => setTimeout(resolver, ms)).then(importar)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #26231c;\n  background: #f6f4ee;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #4a3b24;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nheader p {\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0.6rem 0 0.3rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nsvg {\n  display: block;\n  width: 100%;\n  max-width: 420px;\n  color: #8a5a1c;\n  background: #fff;\n  border: 1px solid #d8d0bd;\n  border-radius: 6px;\n}\n\n.cargando {\n  color: #6b6557;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "senderos": [
      {
        "id": 1,
        "nombre": "Subida a Peñarroya",
        "salida": "Valdelinares",
        "km": 11.4,
        "desnivel": 420,
        "perfil": [
          1690,
          1745,
          1810,
          1880,
          1945,
          2024,
          1960,
          1880,
          1790,
          1720,
          1690
        ]
      },
      {
        "id": 2,
        "nombre": "Pinares de Linares de Mora",
        "salida": "Linares de Mora",
        "km": 8.2,
        "desnivel": 310,
        "perfil": [
          1290,
          1360,
          1450,
          1540,
          1600,
          1520,
          1410,
          1330,
          1290
        ]
      },
      {
        "id": 3,
        "nombre": "Masías de Mosqueruela",
        "salida": "Mosqueruela",
        "km": 14.6,
        "desnivel": 380,
        "perfil": [
          1470,
          1500,
          1560,
          1620,
          1690,
          1740,
          1710,
          1660,
          1600,
          1560,
          1530,
          1500,
          1480,
          1470
        ]
      },
      {
        "id": 4,
        "nombre": "Murallas de Puertomingalvo",
        "salida": "Puertomingalvo",
        "km": 6.3,
        "desnivel": 240,
        "perfil": [
          1460,
          1390,
          1310,
          1250,
          1300,
          1390,
          1460
        ]
      },
      {
        "id": 5,
        "nombre": "Fuentes del Mijares",
        "salida": "El Castellar",
        "km": 9.1,
        "desnivel": 290,
        "perfil": [
          1540,
          1600,
          1680,
          1750,
          1790,
          1720,
          1650,
          1590,
          1560,
          1540
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

¿Por qué no hay ningún paso `lazy`? Para medir las funciones de la forma de objeto, la instrumentación de React Router 8.5.0 sustituye el objeto `lazy` entero de la ruta, y eso cambiaba dónde se pintaba el error si fallaba la descarga del componente. El registro nunca debe cambiar cómo se comporta tu aplicación, así que no las mide. Las descargas se leen igual en los tiempos: el `loader` empieza a los `+100 ms`, lo que tardó su archivo, y lo que va del final del `loader` al final de la navegación es lo que tardó `Ficha.tsx`.

**Con el objeto, el router empieza a pedir los datos sin esperar al componente.** La ficha tarda lo que tarde la más lenta de las dos ramas: el archivo del `loader` más los datos, o el archivo de la página. En la vista previa, `máx(100 + 600, 900) = 900 ms` frente a `900 + 600 = 1.500`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "{\n  path: 'senderos/:id',\n  lazy: async () => {\n    const [datos, pagina] = await Promise.all([import('./ficha-datos'), import('./Ficha')])\n    return { loader: datos.loader, Component: pagina.default }\n  },\n}\n\n// Abres «Masías de Mosqueruela», vuelves a la portada\n// y la abres otra vez. ¿Qué pasos enseña el registro\n// del router en la segunda navegación?",
  "opciones": [
    "Los mismos que la primera vez: lazy, de 900 ms, y después el loader",
    "Solo el loader: lazy no se vuelve a llamar",
    "Ninguno: la ficha sale de una caché, sin pedir nada",
    "Solo lazy: los datos ya estaban"
  ],
  "correcta": 1,
  "explicacion": "Cuando lazy se cumple, el router copia el loader y el componente en la ruta y no vuelve a llamarlo. El loader sí se ejecuta, porque la ficha no estaba en pantalla y sus datos se piden al entrar (lección 4). Comprobado en el bloque de la forma de función: la segunda navegación dura 600 ms y tiene un solo paso, el loader. Con la forma de objeto pasa lo mismo, aunque allí el registro no enseña ningún paso lazy."
}
```

## Frente a `lazy` de React: quién espera a quién

Las tres versiones de la web de los senderos, construidas con Vite 8.3.5 y abiertas en Chromium con archivos de verdad. Para que las esperas se vieran, Playwright retrasó 900 ms `Ficha-….js` y 100 ms `ficha-datos-….js`, y la API tardó 600 ms. La flecha `→` es una petición que sale y `←` una respuesta que llega:

```text
lazy de React en Component
     0 ms  clic en «Masías de Mosqueruela»
    58 ms  → /api/senderos/3
   662 ms  ← /api/senderos/3
   663 ms  → /assets/Ficha-Blfz2qn1.js
  1573 ms  ← /assets/Ficha-Blfz2qn1.js
  1608 ms  la ficha en pantalla

lazy de React Router, como función (con Promise.all)
    56 ms  → /assets/ficha-datos-C1oYM5PE.js
    57 ms  → /assets/Ficha-BFiJ9_TL.js
   159 ms  ← /assets/ficha-datos-C1oYM5PE.js
   961 ms  ← /assets/Ficha-BFiJ9_TL.js
   961 ms  → /api/senderos/3
  1566 ms  ← /api/senderos/3
  1598 ms  la ficha en pantalla

lazy de React Router, como objeto
    58 ms  → /assets/ficha-datos-C4l3iAPS.js
    58 ms  → /assets/Ficha-CayXdiIP.js
   161 ms  ← /assets/ficha-datos-C4l3iAPS.js
   162 ms  → /api/senderos/3
   767 ms  ← /api/senderos/3
   968 ms  ← /assets/Ficha-CayXdiIP.js
  1001 ms  la ficha en pantalla
```

Son los mismos números que da la vista previa, en Chromium y en WebKit. Y esto es lo que sale de `npm run build` con la versión de objeto (los nombres de los archivos cambian en cada build):

```text
dist/index.html                        0.30 kB │ gzip:   0.23 kB
dist/assets/index-D53-MtaR.css         0.70 kB │ gzip:   0.40 kB
dist/assets/ficha-datos-C4l3iAPS.js    0.15 kB │ gzip:   0.15 kB
dist/assets/Ficha-CayXdiIP.js          0.72 kB │ gzip:   0.45 kB
dist/assets/index-CcbM9FJr.js        316.96 kB │ gzip: 100.11 kB
```

Cada `import()` es un archivo aparte. `api.ts` se queda en el principal, porque la portada también lo usa. Aquí los dos trozos son pequeños; en la web de verdad, `Ficha-….js` llevaría la librería de gráficos, que es lo que justifica todo esto (lección 50 de React).

Hay una cuarta combinación, que el router también acepta: el `loader` escrito en la ruta, en el archivo principal, y `lazy` solo para el componente. El `loader` empieza al momento y el componente se descarga a la vez; en la vista previa, la ficha sale a los 900 ms y el registro enseña el `loader` desde `+0 ms`. Las cuatro, juntas:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro formas de cargar la ficha bajo demanda",
  "roles": [
    {
      "etiqueta": "lazy de React",
      "rol": "Datos y después código",
      "descripcion": "El archivo se pide al pintar, cuando el router ya ha terminado. Cascada, y el router no sabe que falta algo: su registro y la barra cambian antes de tiempo."
    },
    {
      "etiqueta": "lazy como función",
      "rol": "Código y después datos",
      "descripcion": "El router espera a todo y lo cuenta todo, pero el loader no empieza hasta que llega el archivo más lento. Cascada al revés."
    },
    {
      "etiqueta": "lazy como objeto",
      "rol": "Código y datos a la vez",
      "descripcion": "Cada propiedad se descarga por su cuenta y el loader empieza en cuanto llega su archivo. Es la que enseña la guía Custom Framework, con cada pieza en su archivo."
    },
    {
      "etiqueta": "loader en la ruta + lazy",
      "rol": "Datos al momento",
      "descripcion": "El loader viaja en el archivo principal y empieza sin esperar a nada; lazy trae solo el componente. Vale si el loader es pequeño y no arrastra librerías."
    }
  ]
}
```

## La primera carga: `HydrateFallback`

Hasta ahora siempre has llegado a la ficha desde la portada, con una página anterior que el router dejaba en pantalla mientras cargaba. Pero alguien puede abrir directamente `/senderos/3`: un enlace que le han pasado, o el botón de recargar. Entonces no hay nada que dejar en pantalla, y el router tiene que descargar `lazy` y ejecutar el `loader` antes de poder pintar la ficha. **Lo que se ve mientras tanto es el `HydrateFallback`**, el componente que pusiste en la ruta raíz desde la lección 99 de React. Este bloque arranca en `/senderos/3`, y alguien lo ha quitado de la raíz:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Abrir una ficha directamente, sin HydrateFallback",
  "consigna": "La vista previa arranca en /senderos/3: durante 900 ms no se ve nada, ni siquiera la cabecera, y la consola avisa. En el registro, la operación es una carga inicial, con el loader a partir de los 100 ms, como en una navegación. Ahora añade a la ruta raíz, en App.tsx, HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>. Al editar, la vista previa vuelve a arrancar en /senderos/3: ya no hay hueco en blanco ni aviso.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef, useState } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useLocation, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { descargar, pedirJson, type Sendero } from './api'\nimport './estilos.css'\n\nasync function cargarSenderos({ request }: LoaderFunctionArgs) {\n  return { senderos: await pedirJson<Sendero[]>('/api/senderos', request.signal) }\n}\n\nfunction Portada() {\n  const { senderos } = useLoaderData<typeof cargarSenderos>()\n  return (\n    <>\n      <h2>Senderos señalizados</h2>\n      <ul>\n        {senderos.map((sendero) => (\n          <li key={sendero.id}>\n            <Link to={`/senderos/${sendero.id}`}>{sendero.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// Mide desde que el router empieza a cargar hasta que la página nueva está en pantalla\nfunction Cronometro() {\n  const navigation = useNavigation()\n  const location = useLocation()\n  const inicio = useRef<number | null>(null)\n  const [ms, setMs] = useState<number | null>(null)\n  useEffect(() => {\n    if (navigation.state === 'loading') inicio.current ??= performance.now()\n  }, [navigation.state])\n  useEffect(() => {\n    if (inicio.current === null) return\n    setMs(Math.round(performance.now() - inicio.current))\n    inicio.current = null\n  }, [location])\n  return <p>{ms === null ? '' : `Última página: ${ms} ms`}</p>\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Senderos de Gúdar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los senderos</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n        <Cronometro />\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        // lazy como objeto: cada propiedad llega por su cuenta\n        lazy: {\n          loader: async () => (await descargar(100, () => import('./ficha-datos'))).loader,\n          Component: async () => (await descargar(900, () => import('./Ficha'))).default,\n        },\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { loader } from './ficha-datos'\n\n// En la web de verdad, este archivo trae una librería de gráficos de 180 kB.\n// Aquí el perfil es un SVG sencillo.\nfunction PerfilDesnivel({ alturas }: { alturas: number[] }) {\n  const minima = Math.min(...alturas)\n  const maxima = Math.max(...alturas)\n  const puntos = alturas\n    .map((altura, km) => `${(km / (alturas.length - 1)) * 300},${100 - ((altura - minima) / (maxima - minima)) * 90}`)\n    .join(' ')\n  return (\n    <svg viewBox=\"0 0 300 100\" role=\"img\" aria-label={`Perfil de desnivel: entre ${minima} y ${maxima} m`}>\n      <polyline points={puntos} fill=\"none\" stroke=\"currentColor\" strokeWidth=\"3\" />\n    </svg>\n  )\n}\n\nexport default function Ficha() {\n  const { sendero } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{sendero.nombre}</h2>\n      <p>\n        Sale de {sendero.salida} · {sendero.km.toLocaleString('es-ES')} km · {sendero.desnivel} m de desnivel\n      </p>\n      <h3>Perfil de desnivel</h3>\n      <PerfilDesnivel alturas={sendero.perfil} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha-datos.ts",
      "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Sendero } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  return { sendero: await pedirJson<Sendero>(`/api/senderos/${params.id}`, request.signal) }\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Sendero = {\n  id: number\n  nombre: string\n  salida: string\n  km: number\n  desnivel: number\n  perfil: number[] // la altitud, en metros, en cada kilómetro\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría en llegar el archivo y después lo importa.\nexport function descargar<T>(ms: number, importar: () => Promise<T>): Promise<T> {\n  return new Promise((resolver) => setTimeout(resolver, ms)).then(importar)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #26231c;\n  background: #f6f4ee;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #4a3b24;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nheader p {\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0.6rem 0 0.3rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nsvg {\n  display: block;\n  width: 100%;\n  max-width: 420px;\n  color: #8a5a1c;\n  background: #fff;\n  border: 1px solid #d8d0bd;\n  border-radius: 6px;\n}\n\n.cargando {\n  color: #6b6557;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/senderos/3",
  "mostrarConsola": true,
  "mostrarRouter": true,
  "api": {
    "senderos": [
      {
        "id": 1,
        "nombre": "Subida a Peñarroya",
        "salida": "Valdelinares",
        "km": 11.4,
        "desnivel": 420,
        "perfil": [
          1690,
          1745,
          1810,
          1880,
          1945,
          2024,
          1960,
          1880,
          1790,
          1720,
          1690
        ]
      },
      {
        "id": 2,
        "nombre": "Pinares de Linares de Mora",
        "salida": "Linares de Mora",
        "km": 8.2,
        "desnivel": 310,
        "perfil": [
          1290,
          1360,
          1450,
          1540,
          1600,
          1520,
          1410,
          1330,
          1290
        ]
      },
      {
        "id": 3,
        "nombre": "Masías de Mosqueruela",
        "salida": "Mosqueruela",
        "km": 14.6,
        "desnivel": 380,
        "perfil": [
          1470,
          1500,
          1560,
          1620,
          1690,
          1740,
          1710,
          1660,
          1600,
          1560,
          1530,
          1500,
          1480,
          1470
        ]
      },
      {
        "id": 4,
        "nombre": "Murallas de Puertomingalvo",
        "salida": "Puertomingalvo",
        "km": 6.3,
        "desnivel": 240,
        "perfil": [
          1460,
          1390,
          1310,
          1250,
          1300,
          1390,
          1460
        ]
      },
      {
        "id": 5,
        "nombre": "Fuentes del Mijares",
        "salida": "El Castellar",
        "km": 9.1,
        "desnivel": 290,
        "perfil": [
          1540,
          1600,
          1680,
          1750,
          1790,
          1720,
          1650,
          1590,
          1560,
          1540
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

El aviso de la consola, tal cual:

```text
No `HydrateFallback` element provided to render during initial hydration
```

Es decir: «no se ha dado ningún elemento `HydrateFallback` que pintar durante la hidratación inicial». La palabra viene del renderizado en el servidor: allí, el navegador recibe HTML ya pintado y React lo *hidrata* (lección 87 de React). En una SPA no hay HTML que hidratar, y «hidratación inicial» quiere decir simplemente **la primera carga**. El router lo avisa con `console.warn`, no es un error, y **solo una vez**: si pulsas «Recargar» en la barra sin añadir el `HydrateFallback`, la consola se vacía y el aviso no vuelve a salir, aunque la página siga en blanco.

Cuándo sale exactamente, según el código de React Router 8.5.0 y lo que hemos comprobado:

- **Solo en la primera carga.** En las navegaciones siguientes la página anterior se queda en pantalla, como has visto en todos los bloques; el `HydrateFallback` no vuelve a pintarse.
- **Solo si hay algo que esperar.** Una ruta encajada con un `loader` sin datos o con `lazy` pendiente. Si arrancas en una ruta sin `loader` ni `lazy`, la página sale al momento y no hace falta.
- **El router pinta hasta la primera ruta que no está lista**, y en su lugar pone el `HydrateFallback` más profundo que encuentre hasta ella. Si no hay ninguno, no pinta nada (tampoco la maquetación de la raíz) y avisa.

Esa última regla tiene una consecuencia práctica:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "const router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion, // la cabecera y su <Outlet />; sin loader\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        HydrateFallback: () => <p>Descargando la ficha…</p>,\n        lazy: {\n          loader: async () => (await import('./ficha-datos')).loader,\n          Component: async () => (await import('./Ficha')).default,\n        },\n      },\n    ],\n  },\n])\n\n// La raíz no tiene HydrateFallback. Abres /senderos/3\n// directamente. ¿Qué se ve mientras carga?",
  "opciones": [
    "Nada, y el aviso de la consola: el HydrateFallback tiene que estar en la raíz",
    "La cabecera de Maquetacion y, en su Outlet, «Descargando la ficha…»",
    "Solo «Descargando la ficha…», sin la cabecera",
    "La cabecera con el Outlet vacío, y el aviso"
  ],
  "correcta": 1,
  "explicacion": "La raíz no tiene nada que esperar, así que el router la pinta. La primera ruta que no está lista es la ficha, y su HydrateFallback ocupa su lugar en el Outlet. Comprobado en la vista previa, sin aviso en la consola. Si la raíz tuviera un loader, el router se pararía en ella y haría falta un HydrateFallback en la raíz."
}
```

Dos detalles más. Como `ErrorBoundary` y `errorElement`, existe `hydrateFallbackElement`, que recibe un elemento en vez de un componente. Y **el `HydrateFallback` no puede venir en `lazy`**: llega con el código de la ruta, justo lo que se está esperando. Lo comprobamos poniéndolo en el objeto de `lazy` con 50 ms de descarga: la página se quedó en blanco hasta el final y el aviso salió igual. Va escrito en la ruta.

En el modo framework, `HydrateFallback` hace además su trabajo original, mientras se hidrata el HTML del servidor con un `clientLoader` (lección 16), y en el SPA Mode se prerenderiza dentro del `index.html` (lección 17).

## Si la descarga falla

En producción, un archivo de `import()` es una petición más, y puede fallar: el móvil pierde la cobertura o, lo más frecuente, despliegas una versión nueva mientras alguien tiene la página abierta y su navegador pide un `Ficha-….js` que ya no existe (lección 50 de React). La promesa de `lazy` se rechaza con un error como este, el que da Chromium con un archivo cortado en el proyecto de Vite:

```text
Failed to fetch dynamically imported module: http://localhost:5212/assets/Ficha-JwmjvSD0.js
```

Es decir: «no se pudo descargar el módulo importado dinámicamente». ¿Dónde se pinta? Lo natural sería poner un `ErrorBoundary` en la propia ruta. En este bloque, `Ficha-C3x9.js` ya no está en el servidor (lo simula `descargaRota`, en `api.ts`), y la ruta de la ficha tiene su `ErrorBoundary`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El archivo de la ficha ya no está en el servidor",
  "consigna": "Abre «Masías de Mosqueruela»: a los 900 ms desaparece la portada y el hueco de la página se queda vacío, sin el aviso de ErrorDescarga. Vuelve a «Todos los senderos» y abre la ficha otra vez: el hueco vacío sale al momento, sin esperar la descarga.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef, useState } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useLocation, useNavigation, useRouteError, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { descargar, descargaRota, pedirJson, type Sendero } from './api'\nimport './estilos.css'\n\nasync function cargarSenderos({ request }: LoaderFunctionArgs) {\n  return { senderos: await pedirJson<Sendero[]>('/api/senderos', request.signal) }\n}\n\nfunction Portada() {\n  const { senderos } = useLoaderData<typeof cargarSenderos>()\n  return (\n    <>\n      <h2>Senderos señalizados</h2>\n      <ul>\n        {senderos.map((sendero) => (\n          <li key={sendero.id}>\n            <Link to={`/senderos/${sendero.id}`}>{sendero.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// Mide desde que el router empieza a cargar hasta que la página nueva está en pantalla\nfunction Cronometro() {\n  const navigation = useNavigation()\n  const location = useLocation()\n  const inicio = useRef<number | null>(null)\n  const [ms, setMs] = useState<number | null>(null)\n  useEffect(() => {\n    if (navigation.state === 'loading') inicio.current ??= performance.now()\n  }, [navigation.state])\n  useEffect(() => {\n    if (inicio.current === null) return\n    setMs(Math.round(performance.now() - inicio.current))\n    inicio.current = null\n  }, [location])\n  return <p>{ms === null ? '' : `Última página: ${ms} ms`}</p>\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Senderos de Gúdar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los senderos</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n        <Cronometro />\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction ErrorDescarga() {\n  const error = useRouteError()\n  return (\n    <p role=\"alert\">\n      No se ha podido descargar esta página. Recarga para usar la versión nueva.\n      <br />\n      <small>{error instanceof Error ? error.message : String(error)}</small>\n    </p>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>,\n    ErrorBoundary: () => <p role=\"alert\">La web de los senderos no está disponible ahora mismo.</p>,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        ErrorBoundary: ErrorDescarga,\n        lazy: {\n          loader: async () => (await descargar(100, () => import('./ficha-datos'))).loader,\n          // Tras un despliegue, el archivo viejo de la ficha ya no está en el servidor\n          Component: () => descargaRota('Ficha-C3x9.js', 900),\n        },\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "ficha-datos.ts",
      "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Sendero } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  return { sendero: await pedirJson<Sendero>(`/api/senderos/${params.id}`, request.signal) }\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Sendero = {\n  id: number\n  nombre: string\n  salida: string\n  km: number\n  desnivel: number\n  perfil: number[] // la altitud, en metros, en cada kilómetro\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría en llegar el archivo y después lo importa.\nexport function descargar<T>(ms: number, importar: () => Promise<T>): Promise<T> {\n  return new Promise((resolver) => setTimeout(resolver, ms)).then(importar)\n}\n\n// Simula un archivo que ya no está en el servidor (por ejemplo, tras un despliegue)\nexport async function descargaRota(archivo: string, ms: number): Promise<never> {\n  await new Promise((resolver) => setTimeout(resolver, ms))\n  throw new TypeError(`Failed to fetch dynamically imported module: http://localhost/assets/${archivo}`)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #26231c;\n  background: #f6f4ee;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #4a3b24;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nheader p {\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0.6rem 0 0.3rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nsvg {\n  display: block;\n  width: 100%;\n  max-width: 420px;\n  color: #8a5a1c;\n  background: #fff;\n  border: 1px solid #d8d0bd;\n  border-radius: 6px;\n}\n\n.cargando {\n  color: #6b6557;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "api": {
    "senderos": [
      {
        "id": 1,
        "nombre": "Subida a Peñarroya",
        "salida": "Valdelinares",
        "km": 11.4,
        "desnivel": 420,
        "perfil": [
          1690,
          1745,
          1810,
          1880,
          1945,
          2024,
          1960,
          1880,
          1790,
          1720,
          1690
        ]
      },
      {
        "id": 2,
        "nombre": "Pinares de Linares de Mora",
        "salida": "Linares de Mora",
        "km": 8.2,
        "desnivel": 310,
        "perfil": [
          1290,
          1360,
          1450,
          1540,
          1600,
          1520,
          1410,
          1330,
          1290
        ]
      },
      {
        "id": 3,
        "nombre": "Masías de Mosqueruela",
        "salida": "Mosqueruela",
        "km": 14.6,
        "desnivel": 380,
        "perfil": [
          1470,
          1500,
          1560,
          1620,
          1690,
          1740,
          1710,
          1660,
          1600,
          1560,
          1530,
          1500,
          1480,
          1470
        ]
      },
      {
        "id": 4,
        "nombre": "Murallas de Puertomingalvo",
        "salida": "Puertomingalvo",
        "km": 6.3,
        "desnivel": 240,
        "perfil": [
          1460,
          1390,
          1310,
          1250,
          1300,
          1390,
          1460
        ]
      },
      {
        "id": 5,
        "nombre": "Fuentes del Mijares",
        "salida": "El Castellar",
        "km": 9.1,
        "desnivel": 290,
        "perfil": [
          1540,
          1600,
          1680,
          1750,
          1790,
          1720,
          1650,
          1590,
          1560,
          1540
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

**En React Router 8.5.0, el `ErrorBoundary` de una ruta no se pinta cuando falla su propio `lazy`.** El error está en el estado del router, pero la ruta sigue marcada como «pendiente de descargar», y el router no pinta nada a partir de ella: deja el hueco vacío. Lo comprobamos en la vista previa con las dos formas de `lazy`, en Chromium y en WebKit, y en el proyecto de Vite con un archivo cortado de verdad, en Chromium. Y si el `ErrorBoundary` va dentro de `lazy`, no llega nunca, porque viene en el archivo que ha fallado: el error sube hasta la raíz y su límite sustituye la página entera, cabecera incluida.

La salida es poner el límite **en una ruta madre**. Si no quieres que sea la raíz, una ruta sin `path` alrededor de las rutas perezosas: no cambia ninguna URL, pinta su `<Outlet />` y recoge lo que falla al descargar sus hijas, con la cabecera en su sitio.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>,\n    ErrorBoundary: ErrorGeneral,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        // Sin path: solo un límite para lo que falla al descargar\n        ErrorBoundary: ErrorDescarga,\n        children: [\n          {\n            path: 'senderos/:id',\n            lazy: {\n              loader: async () => (await import('./ficha-datos')).loader,\n              Component: async () => (await import('./Ficha')).default,\n            },\n          },\n        ],\n      },\n    ],\n  },\n])",
  "anotaciones": [
    {
      "fragmento": "ErrorBoundary: ErrorGeneral,",
      "nota": "El de la raíz recoge lo que nadie más recoge, pero sustituye la página entera: la cabecera desaparece y con ella los enlaces para salir."
    },
    {
      "fragmento": "// Sin path: solo un límite para lo que falla al descargar",
      "nota": "Una ruta sin path y sin Component: no añade nada a la URL y pinta sus hijas en un Outlet. Su único trabajo es el límite."
    },
    {
      "fragmento": "ErrorBoundary: ErrorDescarga,",
      "nota": "Comprobado en 8.5.0: con un archivo cortado, el aviso sale aquí, dentro de la maquetación, con el mensaje Failed to fetch dynamically imported module."
    },
    {
      "fragmento": "path: 'senderos/:id',",
      "nota": "La ruta perezosa, sin ErrorBoundary propio para las descargas. Si quieres uno para los errores de su loader, puede tenerlo, pero no esperes que pinte los de su lazy."
    }
  ]
}
```

Queda la segunda parte de lo que has visto en el bloque: al volver a la ficha, el error sale al momento.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "let intentos = 0\n\nconst ficha = {\n  path: 'senderos/:id',\n  lazy: async () => {\n    intentos++\n    // El primer intento falla: el tren entra en un túnel\n    if (intentos === 1) throw new TypeError('Failed to fetch dynamically imported module')\n    const [datos, pagina] = await Promise.all([import('./ficha-datos'), import('./Ficha')])\n    return { loader: datos.loader, Component: pagina.default }\n  },\n}\n\n// La primera vez sale el aviso del límite de la madre.\n// Vuelves a la portada y pulsas otra vez la ficha.",
  "opciones": [
    "El router vuelve a llamar a lazy, esta vez funciona y sale la ficha",
    "Sale el mismo aviso al momento, y lazy no se vuelve a llamar: intentos sigue en 1",
    "Se queda en «Cargando…» para siempre"
  ],
  "correcta": 1,
  "explicacion": "React Router 8.5.0 guarda la promesa de lazy, también si se rechaza, y la reutiliza en cada navegación hasta que recargas la página. Comprobado con el contador en la vista previa y, en el proyecto de Vite, con un archivo cortado: la segunda vez no se volvió a pedir. Es lo mismo que hace lazy de React (lección 50)."
}
```

Esto está cambiando ahora mismo. El 26 de octubre de 2026, el equipo de React Router integró dos correcciones que todavía no han salido en ninguna versión publicada (la última sigue siendo la 8.5.0):

- [#15689](https://github.com/remix-run/react-router/pull/15689) deja de guardar las promesas rechazadas de `lazy`: la siguiente navegación volverá a intentarlo. Lo pedía el aviso [#15688](https://github.com/remix-run/react-router/issues/15688), que recuerda que tras un despliegue reintentar no sirve: hay que recargar.
- [#15658](https://github.com/remix-run/react-router/pull/15658) arregla un caso peor, el del aviso [#15657](https://github.com/remix-run/react-router/issues/15657): un `lazy` de objeto con solo `Component`, sin `loader`, que falla, no deja ni rastro del error. Lo comprobamos en 8.5.0: ni siquiera el límite de la madre se pinta.

El hueco vacío del `ErrorBoundary` de la propia ruta no lo toca ninguna de las dos: sigue igual en el código de la rama principal de hoy. Con la versión de la vista previa, la receta es la de arriba: el límite en la madre, y en el aviso, que recargue.

## Rutas que no conoces de antemano: `patchRoutesOnNavigation`

`lazy` aplaza la implementación, pero el árbol de rutas, con todos sus `path`, tiene que estar entero en el archivo principal. En una aplicación enorme, o en una hecha de piezas que despliegan equipos distintos (los llamados *micro-frontends*), ni eso es posible. Para esos casos, `createBrowserRouter` y `createMemoryRouter` aceptan la opción `patchRoutesOnNavigation`: **el router la llama cuando una URL no encaja con ninguna ruta, y ella puede añadir rutas nuevas al árbol** antes de volver a intentarlo. La documentación lo llama *Fog of War*, como el mapa que se descubre a medida que avanzas en un videojuego.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const router = createBrowserRouter(\n  [\n    {\n      id: 'raiz',\n      path: '/',\n      Component: Maquetacion,\n      children: [{ index: true, loader: cargarSenderos, Component: Portada }],\n    },\n  ],\n  {\n    async patchRoutesOnNavigation({ path, patch }) {\n      if (path === '/avisos') {\n        const { rutasAvisos } = await import('./avisos')\n        patch('raiz', rutasAvisos)\n      }\n    },\n  },\n)",
  "anotaciones": [
    {
      "fragmento": "id: 'raiz',",
      "nota": "patch necesita saber dónde colgar las rutas nuevas, y las busca por su id."
    },
    {
      "fragmento": "async patchRoutesOnNavigation({ path, patch }) {",
      "nota": "Solo se llama cuando la URL no encaja con nada de lo que el router ya conoce, durante la fase de carga de la navegación."
    },
    {
      "fragmento": "patch('raiz', rutasAvisos)",
      "nota": "Añade las rutas como hijas de raiz. Con null, se añaden en lo más alto del árbol. La próxima vez que vayas a /avisos ya encaja y no se vuelve a llamar."
    },
    {
      "fragmento": "if (path === '/avisos') {",
      "nota": "Si no añades nada, el router sigue adelante y la URL acaba en el 404 de siempre."
    }
  ]
}
```

Lo probamos en la vista previa: `/avisos` se descubre en la primera visita y no vuelve a llamar a la función; una URL inventada la llama y acaba en un 404. El registro del router enseña esa navegación sin ningún paso, porque descubrir rutas no es un `loader` ni un `lazy`. La documentación la presenta como una API para casos avanzados, y para la mayoría de las aplicaciones basta con `lazy`. En el modo framework no la escribes tú: el plugin de Vite descubre las rutas solo, con lo que llama *Lazy Route Discovery*, y parte cada módulo de ruta en sus archivos (lección 16).

## Cuándo lo usarías de verdad

- **Páginas que arrastran una librería pesada:** gráficos, mapas, un editor de texto enriquecido, un visor de PDF. La ficha del sendero con su perfil.
- **Zonas que visita poca gente:** el panel de administración, los ajustes, el área de socios. Lo harás con el área de administración en el proyecto 13.
- **Formularios con una validación grande:** la `action` y su esquema, en su propio archivo. Ojo: al navegar a la ruta, el router descarga todas las propiedades del objeto, también la `action`, aunque no envíes nada (comprobado con un console.log en la función de la `action`: sale en cuanto pulsas el enlace). Separarla sirve para que no viaje en el archivo principal, no para retrasarla hasta el envío.
- **Siempre en forma de objeto** si la ruta tiene `loader`, salvo que el `loader` sea pequeño y prefieras dejarlo escrito en la ruta.

Y cuándo no: la portada y lo que todo el mundo ve nada más entrar, que con `lazy` solo añade una espera; las rutas pequeñas, porque cada archivo es una petición más; y las aplicaciones pequeñas, donde todo el código pesa menos que una foto.

## Errores típicos

**Poner `lazy` de React en el `Component` de una ruta con `loader`.** Funciona, pero en cascada, y el router da la navegación por terminada antes de que llegue la página. En el modo datos, `lazy` de la ruta.

**Olvidar el `default`.** `Component: async () => await import('./Ficha')` devuelve el módulo, no el componente. El panel de tipos lo marca:

```text
Type 'typeof import("./Ficha")' is not assignable to type 'ComponentType<{}> | null | undefined'.
```

Es decir: «el módulo no se puede asignar a un componente». Si lo ejecutas igual, el `ErrorBoundary` recibe el error de render de React:

```text
Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: object.
```

**Devolver desde la función lo que decide el encaje, o el `middleware`.** El router lo ignora y lo dice, uno por propiedad:

```text
Route property path is not a supported property to be returned from a lazy route function. This property will be ignored.
Route property middleware is not a supported property to be returned from a lazy route function. This property will be ignored.
```

TypeScript se adelanta con el `path`: `Types of property 'path' are incompatible.` El `middleware` perezoso va en la forma de objeto.

**Escribir la misma propiedad en la ruta y en `lazy`.** Gana la de la ruta, y la consola lo avisa (`0-0` es el identificador que el router da a la primera hija de la raíz):

```text
Route "0-0" has a static property "loader" defined but its lazy function is also returning a value for this property. The lazy route property "loader" will be ignored.
```

**Meter el `HydrateFallback` en `lazy`.** Llega tarde: la primera carga se queda en blanco y sale el aviso igual.

**Confiar en el `ErrorBoundary` de la propia ruta perezosa para las descargas.** En 8.5.0 no se pinta: el límite, en una ruta madre.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Con lazy, la página siempre sale antes",
      "realidad": "lazy hace más pequeño el archivo principal, pero añade una espera al navegar a esa ruta. Como función, además, pone los datos en cola detrás del código. Solo la forma de objeto, o el loader en la ruta, evitan la cascada."
    },
    {
      "mito": "lazy de React y lazy del router son lo mismo con otro nombre",
      "realidad": "lazy de React descarga un componente cuando se pinta, y el router no sabe nada. lazy del router descarga partes de la ruta antes de pintarla, dentro de la navegación, y puede pedir los datos a la vez."
    },
    {
      "mito": "El HydrateFallback sale cada vez que navegas",
      "realidad": "Solo en la primera carga. Después, la página anterior se queda en pantalla mientras se carga la nueva, y para eso tienes useNavigation (lección 6)."
    },
    {
      "mito": "Si la descarga falla, basta con volver a intentarlo",
      "realidad": "En 8.5.0, lazy guarda el fallo hasta que recargas. Y tras un despliegue, el archivo viejo no va a volver: recargar trae el índice nuevo, que apunta a los archivos nuevos."
    }
  ]
}
```

## Ejercicios

**1. La ficha, sin cascada.** Esta versión de la web carga la ficha con `lazy` como función, y con una conexión peor: la API tarda 900 ms y `Ficha.tsx`, 1.100. Abre una ficha y mira el cronómetro, unos 2.000 ms, y el registro, con los dos pasos en cadena. Las comprobaciones esperan a la ficha como mucho 1,5 s, así que solo pasan si el `loader` deja de esperar al componente.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Que el loader no espere a Ficha.tsx",
  "consigna": "En App.tsx, cambia el lazy de la ruta senderos/:id por la forma de objeto: una función para el loader, que sigue tardando 100 ms en descargarse, y otra para el Component, que sigue tardando 1.100. No toques los tiempos ni los otros archivos. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef, useState } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useLocation, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { descargar, pedirJson, type Sendero } from './api'\nimport './estilos.css'\n\nasync function cargarSenderos({ request }: LoaderFunctionArgs) {\n  return { senderos: await pedirJson<Sendero[]>('/api/senderos', request.signal) }\n}\n\nfunction Portada() {\n  const { senderos } = useLoaderData<typeof cargarSenderos>()\n  return (\n    <>\n      <h2>Senderos señalizados</h2>\n      <ul>\n        {senderos.map((sendero) => (\n          <li key={sendero.id}>\n            <Link to={`/senderos/${sendero.id}`}>{sendero.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// Mide desde que el router empieza a cargar hasta que la página nueva está en pantalla\nfunction Cronometro() {\n  const navigation = useNavigation()\n  const location = useLocation()\n  const inicio = useRef<number | null>(null)\n  const [ms, setMs] = useState<number | null>(null)\n  useEffect(() => {\n    if (navigation.state === 'loading') inicio.current ??= performance.now()\n  }, [navigation.state])\n  useEffect(() => {\n    if (inicio.current === null) return\n    setMs(Math.round(performance.now() - inicio.current))\n    inicio.current = null\n  }, [location])\n  return <p>{ms === null ? '' : `Última página: ${ms} ms`}</p>\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Senderos de Gúdar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los senderos</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n        <Cronometro />\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo los senderos…</p>,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        // TODO: que el loader no espere a Ficha.tsx\n        lazy: async () => {\n          const [datos, pagina] = await Promise.all([\n            descargar(100, () => import('./ficha-datos')),\n            descargar(1100, () => import('./Ficha')),\n          ])\n          return { loader: datos.loader, Component: pagina.default }\n        },\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { loader } from './ficha-datos'\n\n// En la web de verdad, este archivo trae una librería de gráficos de 180 kB.\n// Aquí el perfil es un SVG sencillo.\nfunction PerfilDesnivel({ alturas }: { alturas: number[] }) {\n  const minima = Math.min(...alturas)\n  const maxima = Math.max(...alturas)\n  const puntos = alturas\n    .map((altura, km) => `${(km / (alturas.length - 1)) * 300},${100 - ((altura - minima) / (maxima - minima)) * 90}`)\n    .join(' ')\n  return (\n    <svg viewBox=\"0 0 300 100\" role=\"img\" aria-label={`Perfil de desnivel: entre ${minima} y ${maxima} m`}>\n      <polyline points={puntos} fill=\"none\" stroke=\"currentColor\" strokeWidth=\"3\" />\n    </svg>\n  )\n}\n\nexport default function Ficha() {\n  const { sendero } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{sendero.nombre}</h2>\n      <p>\n        Sale de {sendero.salida} · {sendero.km.toLocaleString('es-ES')} km · {sendero.desnivel} m de desnivel\n      </p>\n      <h3>Perfil de desnivel</h3>\n      <PerfilDesnivel alturas={sendero.perfil} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha-datos.ts",
      "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Sendero } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  return { sendero: await pedirJson<Sendero>(`/api/senderos/${params.id}`, request.signal) }\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Sendero = {\n  id: number\n  nombre: string\n  salida: string\n  km: number\n  desnivel: number\n  perfil: number[] // la altitud, en metros, en cada kilómetro\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría en llegar el archivo y después lo importa.\nexport function descargar<T>(ms: number, importar: () => Promise<T>): Promise<T> {\n  return new Promise((resolver) => setTimeout(resolver, ms)).then(importar)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #26231c;\n  background: #f6f4ee;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #4a3b24;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nheader p {\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0.6rem 0 0.3rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nsvg {\n  display: block;\n  width: 100%;\n  max-width: 420px;\n  color: #8a5a1c;\n  background: #fff;\n  border: 1px solid #d8d0bd;\n  border-radius: 6px;\n}\n\n.cargando {\n  color: #6b6557;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "senderos": [
      {
        "id": 1,
        "nombre": "Subida a Peñarroya",
        "salida": "Valdelinares",
        "km": 11.4,
        "desnivel": 420,
        "perfil": [
          1690,
          1745,
          1810,
          1880,
          1945,
          2024,
          1960,
          1880,
          1790,
          1720,
          1690
        ]
      },
      {
        "id": 2,
        "nombre": "Pinares de Linares de Mora",
        "salida": "Linares de Mora",
        "km": 8.2,
        "desnivel": 310,
        "perfil": [
          1290,
          1360,
          1450,
          1540,
          1600,
          1520,
          1410,
          1330,
          1290
        ]
      },
      {
        "id": 3,
        "nombre": "Masías de Mosqueruela",
        "salida": "Mosqueruela",
        "km": 14.6,
        "desnivel": 380,
        "perfil": [
          1470,
          1500,
          1560,
          1620,
          1690,
          1740,
          1710,
          1660,
          1600,
          1560,
          1530,
          1500,
          1480,
          1470
        ]
      },
      {
        "id": 4,
        "nombre": "Murallas de Puertomingalvo",
        "salida": "Puertomingalvo",
        "km": 6.3,
        "desnivel": 240,
        "perfil": [
          1460,
          1390,
          1310,
          1250,
          1300,
          1390,
          1460
        ]
      },
      {
        "id": 5,
        "nombre": "Fuentes del Mijares",
        "salida": "El Castellar",
        "km": 9.1,
        "desnivel": 290,
        "perfil": [
          1540,
          1600,
          1680,
          1750,
          1790,
          1720,
          1650,
          1590,
          1560,
          1540
        ]
      }
    ]
  },
  "red": {
    "latencia": 900
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir directamente /senderos/3, la ficha sale en menos de 1,5 s",
      "urlInicial": "/senderos/3",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Masías de Mosqueruela"
      }
    },
    {
      "descripcion": "Desde la portada, la ficha de Peñarroya sale en menos de 1,5 s",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Subida a Peñarroya"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Subida a Peñarroya"
      }
    },
    {
      "descripcion": "La ficha enseña su perfil de desnivel",
      "urlInicial": "/senderos/1",
      "pasos": [],
      "espera": {
        "rol": "img",
        "nombre": "Perfil de desnivel: entre 1690 y 2024 m"
      }
    }
  ]
}
```

**2. Abrir los senderos sin sustos.** La web tiene ahora una página para avisar de incidencias (un árbol caído, una señal arrancada) en `/avisos`, que se carga con `lazy`. Acaban de desplegar una versión nueva y su archivo, `Avisos-7Hq2.js`, ya no está en el servidor: lo simula `descargaRota`. La ruta tiene su `ErrorBoundary`, pero ya sabes que no se pinta. Además, alguien ha quitado el `HydrateFallback` de la raíz. Las comprobaciones usan 600 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La primera carga y una descarga que falla",
  "consigna": "En App.tsx, haz que mientras se carga la primera página se vea «Abriendo los senderos…», y que si no se puede descargar la página de avisos salga el aviso de ErrorDescarga en el lugar de la página, con la cabecera y sus enlaces en pantalla. No cambies descargaRota ni el ErrorBoundary de la raíz. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef, useState } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useLocation, useNavigation, useRouteError, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { descargar, descargaRota, pedirJson, type Sendero } from './api'\nimport './estilos.css'\n\nasync function cargarSenderos({ request }: LoaderFunctionArgs) {\n  return { senderos: await pedirJson<Sendero[]>('/api/senderos', request.signal) }\n}\n\nfunction Portada() {\n  const { senderos } = useLoaderData<typeof cargarSenderos>()\n  return (\n    <>\n      <h2>Senderos señalizados</h2>\n      <ul>\n        {senderos.map((sendero) => (\n          <li key={sendero.id}>\n            <Link to={`/senderos/${sendero.id}`}>{sendero.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// Mide desde que el router empieza a cargar hasta que la página nueva está en pantalla\nfunction Cronometro() {\n  const navigation = useNavigation()\n  const location = useLocation()\n  const inicio = useRef<number | null>(null)\n  const [ms, setMs] = useState<number | null>(null)\n  useEffect(() => {\n    if (navigation.state === 'loading') inicio.current ??= performance.now()\n  }, [navigation.state])\n  useEffect(() => {\n    if (inicio.current === null) return\n    setMs(Math.round(performance.now() - inicio.current))\n    inicio.current = null\n  }, [location])\n  return <p>{ms === null ? '' : `Última página: ${ms} ms`}</p>\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Senderos de Gúdar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los senderos</Link> · <Link to=\"/avisos\">Avisar de una incidencia</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n        <Cronometro />\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction ErrorDescarga() {\n  const error = useRouteError()\n  return (\n    <p role=\"alert\">\n      No se ha podido descargar esta página. Recarga para usar la versión nueva.\n      <br />\n      <small>{error instanceof Error ? error.message : String(error)}</small>\n    </p>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    // TODO: lo que se ve mientras se carga la primera página\n    ErrorBoundary: () => <p role=\"alert\">La web de los senderos no está disponible ahora mismo.</p>,\n    children: [\n      { index: true, loader: cargarSenderos, Component: Portada },\n      {\n        path: 'senderos/:id',\n        lazy: {\n          loader: async () => (await descargar(100, () => import('./ficha-datos'))).loader,\n          Component: async () => (await descargar(900, () => import('./Ficha'))).default,\n        },\n      },\n      {\n        path: 'avisos',\n        // TODO: este límite no llega a pintarse cuando falla la descarga\n        ErrorBoundary: ErrorDescarga,\n        // Tras un despliegue, el archivo viejo de los avisos ya no está en el servidor\n        lazy: () => descargaRota('Avisos-7Hq2.js', 300),\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { loader } from './ficha-datos'\n\n// En la web de verdad, este archivo trae una librería de gráficos de 180 kB.\n// Aquí el perfil es un SVG sencillo.\nfunction PerfilDesnivel({ alturas }: { alturas: number[] }) {\n  const minima = Math.min(...alturas)\n  const maxima = Math.max(...alturas)\n  const puntos = alturas\n    .map((altura, km) => `${(km / (alturas.length - 1)) * 300},${100 - ((altura - minima) / (maxima - minima)) * 90}`)\n    .join(' ')\n  return (\n    <svg viewBox=\"0 0 300 100\" role=\"img\" aria-label={`Perfil de desnivel: entre ${minima} y ${maxima} m`}>\n      <polyline points={puntos} fill=\"none\" stroke=\"currentColor\" strokeWidth=\"3\" />\n    </svg>\n  )\n}\n\nexport default function Ficha() {\n  const { sendero } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{sendero.nombre}</h2>\n      <p>\n        Sale de {sendero.salida} · {sendero.km.toLocaleString('es-ES')} km · {sendero.desnivel} m de desnivel\n      </p>\n      <h3>Perfil de desnivel</h3>\n      <PerfilDesnivel alturas={sendero.perfil} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha-datos.ts",
      "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Sendero } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  return { sendero: await pedirJson<Sendero>(`/api/senderos/${params.id}`, request.signal) }\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Sendero = {\n  id: number\n  nombre: string\n  salida: string\n  km: number\n  desnivel: number\n  perfil: number[] // la altitud, en metros, en cada kilómetro\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría en llegar el archivo y después lo importa.\nexport function descargar<T>(ms: number, importar: () => Promise<T>): Promise<T> {\n  return new Promise((resolver) => setTimeout(resolver, ms)).then(importar)\n}\n\n// Simula un archivo que ya no está en el servidor (por ejemplo, tras un despliegue)\nexport async function descargaRota(archivo: string, ms: number): Promise<never> {\n  await new Promise((resolver) => setTimeout(resolver, ms))\n  throw new TypeError(`Failed to fetch dynamically imported module: http://localhost/assets/${archivo}`)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #26231c;\n  background: #f6f4ee;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #4a3b24;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nheader p {\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0.6rem 0 0.3rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nsvg {\n  display: block;\n  width: 100%;\n  max-width: 420px;\n  color: #8a5a1c;\n  background: #fff;\n  border: 1px solid #d8d0bd;\n  border-radius: 6px;\n}\n\n.cargando {\n  color: #6b6557;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/",
  "mostrarConsola": true,
  "exigirTiposCorrectos": true,
  "api": {
    "senderos": [
      {
        "id": 1,
        "nombre": "Subida a Peñarroya",
        "salida": "Valdelinares",
        "km": 11.4,
        "desnivel": 420,
        "perfil": [
          1690,
          1745,
          1810,
          1880,
          1945,
          2024,
          1960,
          1880,
          1790,
          1720,
          1690
        ]
      },
      {
        "id": 2,
        "nombre": "Pinares de Linares de Mora",
        "salida": "Linares de Mora",
        "km": 8.2,
        "desnivel": 310,
        "perfil": [
          1290,
          1360,
          1450,
          1540,
          1600,
          1520,
          1410,
          1330,
          1290
        ]
      },
      {
        "id": 3,
        "nombre": "Masías de Mosqueruela",
        "salida": "Mosqueruela",
        "km": 14.6,
        "desnivel": 380,
        "perfil": [
          1470,
          1500,
          1560,
          1620,
          1690,
          1740,
          1710,
          1660,
          1600,
          1560,
          1530,
          1500,
          1480,
          1470
        ]
      },
      {
        "id": 4,
        "nombre": "Murallas de Puertomingalvo",
        "salida": "Puertomingalvo",
        "km": 6.3,
        "desnivel": 240,
        "perfil": [
          1460,
          1390,
          1310,
          1250,
          1300,
          1390,
          1460
        ]
      },
      {
        "id": 5,
        "nombre": "Fuentes del Mijares",
        "salida": "El Castellar",
        "km": 9.1,
        "desnivel": 290,
        "perfil": [
          1540,
          1600,
          1680,
          1750,
          1790,
          1720,
          1650,
          1590,
          1560,
          1540
        ]
      }
    ]
  },
  "red": {
    "latencia": 600
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir directamente una ficha, se ve «Abriendo los senderos…» mientras carga",
      "urlInicial": "/senderos/3",
      "pasos": [],
      "espera": {
        "texto": "Abriendo los senderos…"
      }
    },
    {
      "descripcion": "Si no se puede descargar la página de avisos, sale un aviso en su lugar",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Avisar de una incidencia"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se ha podido descargar esta página"
      }
    },
    {
      "descripcion": "Con el aviso en pantalla, la cabecera sigue ahí y lleva a la portada",
      "urlInicial": "/avisos",
      "pasos": [
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se ha podido descargar esta página"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Todos los senderos"
          }
        }
      ],
      "espera": {
        "rol": "link",
        "nombre": "Masías de Mosqueruela"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el bloque de `lazy` como objeto, importa `loader` de `./ficha-datos` arriba del todo, ponlo en la ruta como `loader: cargarFicha` y deja en `lazy` solo el `Component`. ¿Qué marca el cronómetro? ¿Qué paso del registro empieza ahora en `+0 ms`? ¿Qué has perdido a cambio?
2. Añade al objeto de `lazy` de la ficha una `action` que tarde 300 ms en descargarse, como las demás, con un `console.log` en su función. Abre una ficha y mira la consola: ¿cuándo se descarga, al navegar o al enviar? El registro no te lo dirá: no mide las funciones de la forma de objeto.
3. Añade a la web de los senderos una ruta `/avisos` descubierta con `patchRoutesOnNavigation`, con su archivo `avisos.tsx` que exporte las rutas. Comprueba en la consola que la función solo se llama la primera vez, y qué pasa con `/avisos-viejos`.
4. En tu proyecto de Vite, construye la versión de función y la de objeto. Con las herramientas de desarrollo, limita la red a «3G lenta» y compara el cronómetro y la pestaña Red: ¿cuándo sale la petición de los datos en cada una?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Rutas bajo demanda en React Router",
  "recursos": [
    {
      "titulo": "Route Object: lazy",
      "descripcion": "La propiedad lazy del objeto de ruta, en la guía del modo datos, con el ejemplo de la función que descarga a la vez el componente y el loader.",
      "url": "https://reactrouter.com/start/data/route-object",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Custom Framework: Lazy Loading",
      "descripcion": "La forma de objeto, con una función por propiedad: loader, action y Component, cada uno en su archivo.",
      "url": "https://reactrouter.com/start/data/custom",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "createBrowserRouter: patchRoutesOnNavigation",
      "descripcion": "Referencia de la opción, con ejemplos para añadir hijas, rutas de primer nivel y secciones enteras, y la nota sobre las rutas con parámetros.",
      "url": "https://reactrouter.com/api/data-routers/createBrowserRouter",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Single Page App (SPA)",
      "descripcion": "El HydrateFallback de la raíz en el SPA Mode del modo framework, que se prerenderiza en el index.html.",
      "url": "https://reactrouter.com/how-to/spa",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Instrumentation",
      "descripcion": "La API que usa el registro del router de la vista previa: navegaciones, fetchers y cada loader, action, middleware y lazy escrito como función.",
      "url": "https://reactrouter.com/how-to/instrumentation",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Rejected lazy route import is cached (#15688)",
      "descripcion": "El aviso sobre los fallos de lazy que se guardan hasta recargar, con la explicación de cuándo sirve reintentar y cuándo no. La corrección se integró el 26 de octubre de 2026.",
      "url": "https://github.com/remix-run/react-router/issues/15688",
      "etiqueta": "GitHub"
    }
  ]
}
```
