# Streaming: datos que no bloquean la página, con `<Await>` o `use`

- **Módulo:** Más allá de cargar y enviar
- **Slug:** `streaming-datos-que-no-bloquean-la-pagina-con-await-o-use` (autogenerado del título)
- **Orden:** 90
- **Fuentes:** [Streaming with Suspense](https://reactrouter.com/how-to/suspense) + [Await](https://reactrouter.com/api/components/Await) + [useAsyncError](https://reactrouter.com/api/hooks/useAsyncError) + [useAsyncValue](https://reactrouter.com/api/hooks/useAsyncValue) — ver `contenido/react-router/TEMARIO.md` #09
- **Requiere:** El módulo 2 de esta ficha (lecciones 2 a 7) y las lecciones 48 y 49 de React (`<Suspense>` y `use`)

---

## Qué es y para qué sirve

El Museo de Ciencias Naturales de Valdemar tiene en su web una ficha para cada pieza destacada: el esqueleto de un rorcual, unos huevos de saurópodo, una geoda de amatista y un meteorito. Cada ficha enseña la pieza (sala, planta y procedencia) y, debajo, las visitas guiadas de hoy en su sala.

La pieza sale del catálogo del museo. Las visitas salen del sistema de reservas, otro servicio, que las organiza por salas: para preguntarle, antes hay que saber en qué sala está la pieza. Son dos peticiones, una detrás de otra. Con lo que viste en el módulo 2, el `loader` espera las dos y el router no pinta la ficha hasta tenerlas. Como en las lecciones anteriores, `createBrowserRouter` usa en la vista previa un historial en memoria; la barra de direcciones lo indica.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Todo o nada: la ficha espera a las visitas",
  "consigna": "La API simulada tarda 800 ms en cada respuesta. Pulsa «Recargar» en la barra de direcciones: «Abriendo el museo…» dura 1,6 s, lo que tardan las dos peticiones seguidas (míralas en el registro de red). Después vuelve a «Todas las piezas» y abre otra: la portada se queda atenuada, con «Cargando…», esos mismos 1,6 s. La mitad de la espera es por las visitas, que no son lo importante de la ficha.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedirJson, type Pieza } from './api'\nimport Ficha, { loader as cargarFicha } from './Ficha'\nimport './estilos.css'\n\nasync function cargarPiezas({ request }: LoaderFunctionArgs) {\n  return { piezas: await pedirJson<Pieza[]>('/api/piezas', request.signal) }\n}\n\nfunction Portada() {\n  const { piezas } = useLoaderData<typeof cargarPiezas>()\n  return (\n    <>\n      <h2>Piezas destacadas</h2>\n      <ul>\n        {piezas.map((pieza) => (\n          <li key={pieza.id}>\n            <Link to={`/piezas/${pieza.id}`}>{pieza.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Museo de Ciencias Naturales de Valdemar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todas las piezas</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo el museo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">La web del museo no está disponible ahora mismo.</p>,\n    children: [\n      { index: true, loader: cargarPiezas, Component: Portada },\n      {\n        path: 'piezas/:piezaId',\n        loader: cargarFicha,\n        Component: Ficha,\n        ErrorBoundary: () => <p role=\"alert\">No hemos podido abrir la ficha de esta pieza.</p>,\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Pieza, type Visitas } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  // Las visitas salen del sistema de reservas, que va por salas:\n  // hasta que no llega la pieza, no se sabe por qué sala preguntar\n  const visitas = await pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`, request.signal)\n  return { pieza, visitas }\n}\n\nfunction VisitasDeHoy({ visitas }: { visitas: Visitas }) {\n  return (\n    <>\n      <p>\n        Con {visitas.guia}: {visitas.horas.join(' · ')}\n      </p>\n      <p>Quedan {visitas.plazas} plazas</p>\n    </>\n  )\n}\n\nexport default function Ficha() {\n  const { pieza, visitas } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{pieza.nombre}</h2>\n      <p>\n        {pieza.sala} · planta {pieza.planta}\n      </p>\n      <p>Procedencia: {pieza.procedencia}</p>\n      <section className=\"visitas\" aria-labelledby=\"visitas-de-hoy\">\n        <h3 id=\"visitas-de-hoy\">Visitas guiadas de hoy</h3>\n        <VisitasDeHoy visitas={visitas} />\n      </section>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Pieza = {\n  id: number\n  nombre: string\n  sala: string\n  salaId: string\n  planta: string\n  procedencia: string\n}\n\nexport type Visitas = {\n  id: string\n  guia: string\n  horas: string[]\n  plazas: number\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a1c;\n  background: #f7f6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f4a2a;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na[aria-current='page'] {\n  color: inherit;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 1.5rem;\n}\n\n/* El hueco de las visitas mide lo mismo vacío que lleno: la ficha no salta */\n.visitas {\n  min-height: 5rem;\n  margin-top: 0.75rem;\n  padding: 0.6rem 0.8rem;\n  border: 1px solid #c9c3a8;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cargando {\n  color: #6b6b5e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "Ficha.tsx",
  "urlInicial": "/piezas/1",
  "mostrarConsola": false,
  "api": {
    "piezas": [
      {
        "id": 1,
        "nombre": "Esqueleto de rorcual",
        "sala": "Sala del Mar",
        "salaId": "mar",
        "planta": "baja",
        "procedencia": "Varó en la playa de Valdemar en 1987"
      },
      {
        "id": 2,
        "nombre": "Huevos de saurópodo",
        "sala": "Sala de los Dinosaurios",
        "salaId": "dinosaurios",
        "planta": "primera",
        "procedencia": "Yacimiento de La Fontaneda"
      },
      {
        "id": 3,
        "nombre": "Geoda de amatista",
        "sala": "Sala de los Minerales",
        "salaId": "minerales",
        "planta": "primera",
        "procedencia": "Donación de una familia de canteros"
      },
      {
        "id": 4,
        "nombre": "Meteorito de Valdemar",
        "sala": "Sala de Restauración",
        "salaId": "restauracion",
        "planta": "sótano",
        "procedencia": "Cayó en un prado del valle en 1926"
      }
    ],
    "visitas": [
      {
        "id": "mar",
        "guia": "Lucía",
        "horas": [
          "11:00",
          "13:00",
          "17:30"
        ],
        "plazas": 12
      },
      {
        "id": "dinosaurios",
        "guia": "Andrés",
        "horas": [
          "10:30",
          "16:00"
        ],
        "plazas": 4
      },
      {
        "id": "minerales",
        "guia": "Inés",
        "horas": [
          "12:00"
        ],
        "plazas": 20
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

**La ficha no necesita las visitas para tener sentido, pero las espera igual.** La parte más lenta y menos importante decide cuándo ve algo el usuario: si el sistema de reservas tarda 3 s, la ficha tarda 3 s, y si falla, se lleva la ficha entera por delante.

**Un `loader` puede devolver una promesa sin esperarla, dentro del objeto que devuelve. El router pinta la página en cuanto tiene lo que sí esperaste, y React pinta lo demás cuando llega, con `<Suspense>` y `<Await>` o con `use`.** La documentación de React Router lo llama *streaming*. En esta lección verás:

- qué se espera con `await` y qué se devuelve como promesa, y por qué la promesa tiene que ir dentro de un objeto;
- cómo se pinta lo que llega después, con `<Await>` o con `use` de React (lecciones 48 y 49 de React);
- qué pasa cuando lo que espera falla, y cómo quedarte con el fallo en su hueco (`errorElement` y `useAsyncError`);
- por qué, al pasar de una pieza a otra, la ficha vuelve a esperar a todo, y cómo evitarlo;
- cómo decidir qué es crítico y qué puede esperar.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "¿Streaming, en una aplicación sin servidor?",
  "contenido": "El nombre viene del modo framework con SSR: allí el servidor empieza a enviar el HTML en cuanto tiene lo crítico, y lo que espera llega después por la misma respuesta, como el HTML por trozos de la lección 87 de React. En el modo datos no hay HTML que enviar: la promesa pasa del loader al componente en la memoria del navegador. El código es el mismo en los dos modos. Todo lo que afirma esta lección está comprobado con React Router 8.5.0 y React 19.3.1, en la vista previa y en un proyecto de Vite."
}
```

## Lo crítico, con `await`; lo que puede esperar, como promesa

El cambio está en el `loader`, y es una palabra: quitar el segundo `await`.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Pieza, type Visitas } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  // Lo crítico, con await: sin la pieza no hay ficha\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  // Lo que puede esperar, sin await: una promesa dentro del objeto\n  const visitas = pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`, request.signal)\n  return { pieza, visitas }\n}\n\n// En el componente, con useLoaderData<typeof loader>():\n//   pieza: Pieza\n//   visitas: Promise<Visitas>",
  "anotaciones": [
    {
      "fragmento": "const pieza = await pedirJson<Pieza>",
      "nota": "El router no termina la navegación hasta que este await se cumple. Mientras tanto, la página anterior sigue en pantalla y useNavigation dice loading, como en la lección 6."
    },
    {
      "fragmento": "const visitas = pedirJson<Visitas>",
      "nota": "Sin await: la petición sale ya, pero el loader no se para a esperarla. visitas es una promesa pendiente."
    },
    {
      "fragmento": "return { pieza, visitas }",
      "nota": "La promesa va dentro del objeto, como un dato más. El loader termina en cuanto tiene la pieza, y el router pinta la ficha."
    },
    {
      "fragmento": "${pieza.salaId}",
      "nota": "Las visitas dependen de la pieza, así que no pueden salir antes. Si no dependieran de ella, lanzarías la promesa antes del await para que empezara cuanto antes. Más abajo verás un detalle de ese caso con los errores."
    },
    {
      "fragmento": "request.signal)\n  return",
      "nota": "El signal se aborta si la navegación se interrumpe antes de que termine el loader (lección 2). Si te vas cuando la ficha ya está pintada, la petición de las visitas sigue hasta el final: el signal de una navegación terminada ya no se aborta (comprobado). La respuesta llega y nadie la pinta."
    },
    {
      "fragmento": "visitas: Promise<Visitas>",
      "nota": "useLoaderData<typeof loader>() conserva la promesa en el tipo (comprobado con TypeScript 6.0.3). Si la usas como si ya hubiera llegado, el panel de tipos lo marca, por ejemplo con Type Promise<Visitas> is not assignable to type string."
    }
  ]
}
```

Si la promesa tiene que ir dentro de un objeto, ¿qué pasa si la devuelves sola, sin objeto?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Sin await y sin objeto: ¿sale antes la ficha?\nexport function loader({ params }: LoaderFunctionArgs) {\n  return pedirJson<Pieza>(`/api/piezas/${params.piezaId}`)\n}\n\nexport default function Ficha() {\n  const pieza = useLoaderData<typeof loader>()\n  return <h2>{pieza.nombre}</h2>\n}\n\n// En la portada pulsas «Geoda de amatista».\n// El catálogo tarda 800 ms en responder.",
  "opciones": [
    "La ficha sale al momento y pieza es la promesa: pieza.nombre vale undefined",
    "La ficha sale al momento con un fallback, y el nombre aparece a los 800 ms",
    "La portada se queda 800 ms y después sale la ficha con el nombre: es lo mismo que haber escrito await",
    "Error: un loader que devuelve una promesa tiene que ser async"
  ],
  "correcta": 2,
  "explicacion": "El router espera lo que devuelve el loader, así que una promesa suelta se espera entera, como un await. Comprobado: useLoaderData devuelve la pieza, sin then, y la ficha sale a los 800 ms. TypeScript coincide: el tipo es Pieza, no Promise<Pieza>. Solo las promesas que van dentro de un objeto llegan sin esperar."
}
```

**Una promesa suelta se espera; una promesa dentro de un objeto, no.** Lo dice la guía de *streaming* de la documentación: *«Note you can't return a single promise, it must be an object with keys»* («no puedes devolver una sola promesa: tiene que ser un objeto con claves»). Y da igual que el `loader` sea `async` o no: el router hace `await` de lo que devuelve, y un `await` sobre una promesa espera a que termine. Sobre un objeto, en cambio, no hay nada que esperar, aunque dentro lleve promesas.

## Pintar lo que espera: `<Suspense>` y `<Await>`

En el componente, `visitas` es una promesa. `<Await>` la recibe en `resolve` y, como hijo, una función que pinta el valor cuando llega. Mientras la promesa está pendiente, `<Await>` se suspende, y el `<Suspense>` que tiene por encima enseña su fallback: lo de la lección 48 de React, sin escribir ninguna caché, porque la promesa la crea el `loader` una sola vez por navegación.

```tsx
<Suspense fallback={<p className="cargando">Consultando las visitas…</p>}>
  <Await resolve={visitas}>{(datos) => <VisitasDeHoy visitas={datos} />}</Await>
</Suspense>
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha primero, las visitas después",
  "consigna": "Con la misma latencia de 800 ms, abre una pieza desde la portada: la ficha sale a los 800 ms, con «Consultando las visitas…» en su hueco, y las visitas 800 ms después. En el registro de red, la petición de las visitas sale justo cuando llega la de la pieza. Fíjate también en «Cargando…» de la cabecera: se apaga con la ficha, no con las visitas. Por último, abre el meteorito, que está en restauración y no tiene visitas: lo arreglas dos secciones más abajo.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedirJson, type Pieza } from './api'\nimport Ficha, { loader as cargarFicha } from './Ficha'\nimport './estilos.css'\n\nasync function cargarPiezas({ request }: LoaderFunctionArgs) {\n  return { piezas: await pedirJson<Pieza[]>('/api/piezas', request.signal) }\n}\n\nfunction Portada() {\n  const { piezas } = useLoaderData<typeof cargarPiezas>()\n  return (\n    <>\n      <h2>Piezas destacadas</h2>\n      <ul>\n        {piezas.map((pieza) => (\n          <li key={pieza.id}>\n            <Link to={`/piezas/${pieza.id}`}>{pieza.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Museo de Ciencias Naturales de Valdemar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todas las piezas</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo el museo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">La web del museo no está disponible ahora mismo.</p>,\n    children: [\n      { index: true, loader: cargarPiezas, Component: Portada },\n      {\n        path: 'piezas/:piezaId',\n        loader: cargarFicha,\n        Component: Ficha,\n        ErrorBoundary: () => <p role=\"alert\">No hemos podido abrir la ficha de esta pieza.</p>,\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { Suspense } from 'react'\nimport { Await, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Pieza, type Visitas } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  // Lo crítico, con await: sin la pieza no hay ficha\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  // Lo que puede esperar, sin await: una promesa dentro del objeto\n  const visitas = pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`, request.signal)\n  return { pieza, visitas }\n}\n\nfunction VisitasDeHoy({ visitas }: { visitas: Visitas }) {\n  return (\n    <>\n      <p>\n        Con {visitas.guia}: {visitas.horas.join(' · ')}\n      </p>\n      <p>Quedan {visitas.plazas} plazas</p>\n    </>\n  )\n}\n\nexport default function Ficha() {\n  const { pieza, visitas } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{pieza.nombre}</h2>\n      <p>\n        {pieza.sala} · planta {pieza.planta}\n      </p>\n      <p>Procedencia: {pieza.procedencia}</p>\n      <section className=\"visitas\" aria-labelledby=\"visitas-de-hoy\">\n        <h3 id=\"visitas-de-hoy\">Visitas guiadas de hoy</h3>\n        <Suspense fallback={<p className=\"cargando\">Consultando las visitas…</p>}>\n          <Await resolve={visitas}>{(datos) => <VisitasDeHoy visitas={datos} />}</Await>\n        </Suspense>\n      </section>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Pieza = {\n  id: number\n  nombre: string\n  sala: string\n  salaId: string\n  planta: string\n  procedencia: string\n}\n\nexport type Visitas = {\n  id: string\n  guia: string\n  horas: string[]\n  plazas: number\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a1c;\n  background: #f7f6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f4a2a;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na[aria-current='page'] {\n  color: inherit;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 1.5rem;\n}\n\n/* El hueco de las visitas mide lo mismo vacío que lleno: la ficha no salta */\n.visitas {\n  min-height: 5rem;\n  margin-top: 0.75rem;\n  padding: 0.6rem 0.8rem;\n  border: 1px solid #c9c3a8;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cargando {\n  color: #6b6b5e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "Ficha.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "api": {
    "piezas": [
      {
        "id": 1,
        "nombre": "Esqueleto de rorcual",
        "sala": "Sala del Mar",
        "salaId": "mar",
        "planta": "baja",
        "procedencia": "Varó en la playa de Valdemar en 1987"
      },
      {
        "id": 2,
        "nombre": "Huevos de saurópodo",
        "sala": "Sala de los Dinosaurios",
        "salaId": "dinosaurios",
        "planta": "primera",
        "procedencia": "Yacimiento de La Fontaneda"
      },
      {
        "id": 3,
        "nombre": "Geoda de amatista",
        "sala": "Sala de los Minerales",
        "salaId": "minerales",
        "planta": "primera",
        "procedencia": "Donación de una familia de canteros"
      },
      {
        "id": 4,
        "nombre": "Meteorito de Valdemar",
        "sala": "Sala de Restauración",
        "salaId": "restauracion",
        "planta": "sótano",
        "procedencia": "Cayó en un prado del valle en 1926"
      }
    ],
    "visitas": [
      {
        "id": "mar",
        "guia": "Lucía",
        "horas": [
          "11:00",
          "13:00",
          "17:30"
        ],
        "plazas": 12
      },
      {
        "id": "dinosaurios",
        "guia": "Andrés",
        "horas": [
          "10:30",
          "16:00"
        ],
        "plazas": 4
      },
      {
        "id": "minerales",
        "guia": "Inés",
        "horas": [
          "12:00"
        ],
        "plazas": 20
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Tres cosas del bloque:

- **La navegación termina con lo crítico.** `useNavigation` vuelve a `idle` en cuanto el `loader` devuelve su objeto, y el «Cargando…» de la cabecera se apaga aunque falten las visitas. Para lo que espera, el aviso es su fallback.
- **El hueco mide lo mismo vacío que lleno.** `.visitas` tiene un `min-height` en `estilos.css`: cuando llegan las visitas, la ficha no da un salto. Si lo que espera está arriba en la página, resérvale el sitio.
- **El valor llega con su tipo.** En la función de `<Await>`, `datos` es `Visitas`, no una promesa: si escribes `datos.hora`, el panel de tipos responde con el mensaje que comprobamos con `tsc`:

```text
Property 'hora' does not exist on type 'Visitas'. Did you mean 'horas'?
```

Es decir: «la propiedad `hora` no existe en el tipo `Visitas`. ¿Querías decir `horas`?».

Lo que acepta `<Await>`, en resumen:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "resolve",
      "texto": "La promesa que llega del loader. Si le das un valor que no es una promesa, pinta sus hijos al momento, sin suspenderse (comprobado)."
    },
    {
      "titulo": "Hijos como función",
      "texto": "La función recibe el valor ya resuelto, con su tipo: en el museo, Visitas. Es la forma más cómoda en TSX."
    },
    {
      "titulo": "Hijos como elementos y useAsyncValue",
      "texto": "Si los hijos son elementos, un componente de dentro lee el valor con useAsyncValue(). Devuelve unknown: en TSX tendrás que comprobarlo antes de usarlo, y por eso esta lección usa la función."
    },
    {
      "titulo": "errorElement",
      "texto": "Lo que se pinta en su lugar si la promesa se rechaza. Sin él, el error sube al ErrorBoundary de la ruta. Lo ves dos secciones más abajo."
    },
    {
      "titulo": "Un <Suspense> por encima",
      "texto": "Mientras la promesa está pendiente, Await se suspende y el fallback lo pone el Suspense más cercano por encima. La documentación lo pide expresamente, y en los errores típicos verás qué pasa si falta."
    }
  ]
}
```

## O con `use` de React

Desde React 19, la misma promesa se puede leer con `use` (lección 49 de React). La documentación de React Router lo propone como alternativa a `<Await>`, con una condición: la lectura tiene que ir en un componente aparte que reciba la promesa. El mismo museo, en un solo archivo y con `use`; abre una pieza desde la portada:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Las visitas, leídas con use",
  "lenguaje": "tsx",
  "codigo": "import { Suspense, use } from 'react'\nimport { createBrowserRouter, Link, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\ntype Pieza = { id: number; nombre: string; sala: string; salaId: string }\ntype Visitas = { guia: string; horas: string[]; plazas: number }\n\nasync function pedirJson<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\nasync function cargarFicha({ params, request }: LoaderFunctionArgs) {\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  const visitas = pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`, request.signal)\n  return { pieza, visitas }\n}\n\n// Recibe la promesa y la lee con use: solo este componente espera\nfunction VisitasDeHoy({ visitas }: { visitas: Promise<Visitas> }) {\n  const datos = use(visitas)\n  return (\n    <p>\n      Con {datos.guia}: {datos.horas.join(' · ')}\n    </p>\n  )\n}\n\nfunction Ficha() {\n  const { pieza, visitas } = useLoaderData<typeof cargarFicha>()\n  return (\n    <article>\n      <h2>{pieza.nombre}</h2>\n      <p>{pieza.sala}</p>\n      <section className=\"visitas\" aria-labelledby=\"visitas-de-hoy\">\n        <h3 id=\"visitas-de-hoy\">Visitas guiadas de hoy</h3>\n        <Suspense fallback={<p className=\"cargando\">Consultando las visitas…</p>}>\n          <VisitasDeHoy visitas={visitas} />\n        </Suspense>\n      </section>\n    </article>\n  )\n}\n\nasync function cargarPiezas({ request }: LoaderFunctionArgs) {\n  return { piezas: await pedirJson<Pieza[]>('/api/piezas', request.signal) }\n}\n\nfunction Portada() {\n  const { piezas } = useLoaderData<typeof cargarPiezas>()\n  return (\n    <ul>\n      {piezas.map((pieza) => (\n        <li key={pieza.id}>\n          <Link to={`/piezas/${pieza.id}`}>{pieza.nombre}</Link>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Museo de Ciencias Naturales de Valdemar</p>\n        <Link to=\"/\">Todas las piezas</Link>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo el museo…</p>,\n    children: [\n      { index: true, loader: cargarPiezas, Component: Portada },\n      { path: 'piezas/:piezaId', loader: cargarFicha, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}",
  "css": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a1c;\n  background: #f7f6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f4a2a;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na[aria-current='page'] {\n  color: inherit;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 1.5rem;\n}\n\n/* El hueco de las visitas mide lo mismo vacío que lleno: la ficha no salta */\n.visitas {\n  min-height: 5rem;\n  margin-top: 0.75rem;\n  padding: 0.6rem 0.8rem;\n  border: 1px solid #c9c3a8;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cargando {\n  color: #6b6b5e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}",
  "anotaciones": [
    {
      "fragmento": "function VisitasDeHoy({ visitas }: { visitas: Promise<Visitas> })",
      "nota": "Un componente aparte que recibe la promesa. Es imprescindible: si llamas a use dentro de Ficha, la que se suspende es la ficha entera."
    },
    {
      "fragmento": "const datos = use(visitas)",
      "nota": "use espera a la promesa y devuelve Visitas, con su tipo. La promesa la creó el loader una vez por navegación, así que todos los intentos de render reciben la misma: el bucle de la lección 49 no aparece."
    },
    {
      "fragmento": "<Suspense fallback={<p className=\"cargando\">Consultando las visitas…</p>}>",
      "nota": "El límite va por encima del componente que llama a use, como pide la lección 48. Por dentro de Ficha, no por fuera: Ficha tiene que pintarse para que se vea la pieza."
    },
    {
      "fragmento": "<VisitasDeHoy visitas={visitas} />",
      "nota": "Se le pasa la promesa tal cual, sin esperarla. Quien espera es VisitasDeHoy."
    }
  ],
  "urlInicial": "/",
  "api": {
    "piezas": [
      {
        "id": 1,
        "nombre": "Esqueleto de rorcual",
        "sala": "Sala del Mar",
        "salaId": "mar",
        "planta": "baja",
        "procedencia": "Varó en la playa de Valdemar en 1987"
      },
      {
        "id": 2,
        "nombre": "Huevos de saurópodo",
        "sala": "Sala de los Dinosaurios",
        "salaId": "dinosaurios",
        "planta": "primera",
        "procedencia": "Yacimiento de La Fontaneda"
      },
      {
        "id": 3,
        "nombre": "Geoda de amatista",
        "sala": "Sala de los Minerales",
        "salaId": "minerales",
        "planta": "primera",
        "procedencia": "Donación de una familia de canteros"
      },
      {
        "id": 4,
        "nombre": "Meteorito de Valdemar",
        "sala": "Sala de Restauración",
        "salaId": "restauracion",
        "planta": "sótano",
        "procedencia": "Cayó en un prado del valle en 1926"
      }
    ],
    "visitas": [
      {
        "id": "mar",
        "guia": "Lucía",
        "horas": [
          "11:00",
          "13:00",
          "17:30"
        ],
        "plazas": 12
      },
      {
        "id": "dinosaurios",
        "guia": "Andrés",
        "horas": [
          "10:30",
          "16:00"
        ],
        "plazas": 4
      },
      {
        "id": "minerales",
        "guia": "Inés",
        "horas": [
          "12:00"
        ],
        "plazas": 20
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

¿Y si llamas a `use(visitas)` directamente en `Ficha`, el componente de la ruta? Lo comprobamos: la portada se queda atenuada, con «Cargando…», hasta que llegan las visitas, y entonces sale la ficha entera. Es lo mismo que haber escrito `await`, y no aparece ningún aviso en la consola. Por encima de `Ficha` no hay ningún `<Suspense>` que pueda poner un fallback, así que espera la navegación. Lo verás con detalle en los errores típicos.

**Las dos formas pintan lo mismo; la diferencia está en los errores.** Lo que cambia entre una y otra:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "De dónde vienen",
      "texto": "Await es de React Router. use es de React y sirve con cualquier promesa que llegue estable, venga del router o de otra librería."
    },
    {
      "titulo": "La forma",
      "texto": "Await acepta una función en línea. use necesita un componente aparte que reciba la promesa por props."
    },
    {
      "titulo": "Los errores",
      "texto": "Await trae errorElement, y el fallo se queda en su hueco. Con use, el error sube al error boundary más cercano: el ErrorBoundary de la ruta, si no pones uno tuyo con una clase, como el de la lección 53 de React."
    },
    {
      "titulo": "El aviso a onError",
      "texto": "Con Await, onError de RouterProvider se entera del rechazo aunque lo pinte su errorElement (lo viste en la lección 8). Con use y tu propio límite de error, en cambio, no se entera: solo le llega si el error alcanza el ErrorBoundary de la ruta (comprobado)."
    }
  ]
}
```

## Cuando lo que espera falla: `errorElement` y `useAsyncError`

El meteorito está en la sala de restauración, que no tiene visitas: el sistema de reservas responde 404 a `/api/visitas/restauracion`. En el bloque de `<Await>` lo has visto: aparece la ficha, con su fallback, y cuando llega el 404 el `ErrorBoundary` de la ruta la sustituye entera, con la pieza que sí había llegado. Es lo que viste en la lección 8: **sin `errorElement`, el rechazo sube al límite de error de la ruta, igual que con `use`**, y un dato secundario se lleva por delante el principal.

La 8 también te dio la salida: `errorElement` es el sitio para ese fallo, y `useAsyncError()`, dentro de él, devuelve el motivo del rechazo del `<Await>` más cercano. Aquí lo tienes en vivo, al lado de un fallo de lo crítico, para que veas la diferencia:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El fallo se queda en su hueco",
  "consigna": "Abre el meteorito: la ficha sigue y, en el hueco de las visitas, sale el aviso con el motivo. Ahora vuelve a la portada, pulsa «Fallar la siguiente petición» en el panel de red y abre la geoda: esta vez falla lo crítico, la pieza, y la ficha entera la sustituye el ErrorBoundary de la ruta. Cada fallo se queda en el nivel de lo que ha fallado.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedirJson, type Pieza } from './api'\nimport Ficha, { loader as cargarFicha } from './Ficha'\nimport './estilos.css'\n\nasync function cargarPiezas({ request }: LoaderFunctionArgs) {\n  return { piezas: await pedirJson<Pieza[]>('/api/piezas', request.signal) }\n}\n\nfunction Portada() {\n  const { piezas } = useLoaderData<typeof cargarPiezas>()\n  return (\n    <>\n      <h2>Piezas destacadas</h2>\n      <ul>\n        {piezas.map((pieza) => (\n          <li key={pieza.id}>\n            <Link to={`/piezas/${pieza.id}`}>{pieza.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Museo de Ciencias Naturales de Valdemar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todas las piezas</Link>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo el museo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">La web del museo no está disponible ahora mismo.</p>,\n    children: [\n      { index: true, loader: cargarPiezas, Component: Portada },\n      {\n        path: 'piezas/:piezaId',\n        loader: cargarFicha,\n        Component: Ficha,\n        ErrorBoundary: () => <p role=\"alert\">No hemos podido abrir la ficha de esta pieza.</p>,\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { Suspense } from 'react'\nimport { Await, useAsyncError, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Pieza, type Visitas } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  const visitas = pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`, request.signal)\n  return { pieza, visitas }\n}\n\nfunction VisitasDeHoy({ visitas }: { visitas: Visitas }) {\n  return (\n    <>\n      <p>\n        Con {visitas.guia}: {visitas.horas.join(' · ')}\n      </p>\n      <p>Quedan {visitas.plazas} plazas</p>\n    </>\n  )\n}\n\n// Va en el sitio de las visitas si la promesa se rechaza\nfunction VisitasNoDisponibles() {\n  const error = useAsyncError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">Ahora no podemos consultar las visitas de esta sala ({motivo}).</p>\n}\n\nexport default function Ficha() {\n  const { pieza, visitas } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{pieza.nombre}</h2>\n      <p>\n        {pieza.sala} · planta {pieza.planta}\n      </p>\n      <p>Procedencia: {pieza.procedencia}</p>\n      <section className=\"visitas\" aria-labelledby=\"visitas-de-hoy\">\n        <h3 id=\"visitas-de-hoy\">Visitas guiadas de hoy</h3>\n        <Suspense fallback={<p className=\"cargando\">Consultando las visitas…</p>}>\n          <Await resolve={visitas} errorElement={<VisitasNoDisponibles />}>\n            {(datos) => <VisitasDeHoy visitas={datos} />}\n          </Await>\n        </Suspense>\n      </section>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Pieza = {\n  id: number\n  nombre: string\n  sala: string\n  salaId: string\n  planta: string\n  procedencia: string\n}\n\nexport type Visitas = {\n  id: string\n  guia: string\n  horas: string[]\n  plazas: number\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a1c;\n  background: #f7f6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f4a2a;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na[aria-current='page'] {\n  color: inherit;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 1.5rem;\n}\n\n/* El hueco de las visitas mide lo mismo vacío que lleno: la ficha no salta */\n.visitas {\n  min-height: 5rem;\n  margin-top: 0.75rem;\n  padding: 0.6rem 0.8rem;\n  border: 1px solid #c9c3a8;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cargando {\n  color: #6b6b5e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "Ficha.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "api": {
    "piezas": [
      {
        "id": 1,
        "nombre": "Esqueleto de rorcual",
        "sala": "Sala del Mar",
        "salaId": "mar",
        "planta": "baja",
        "procedencia": "Varó en la playa de Valdemar en 1987"
      },
      {
        "id": 2,
        "nombre": "Huevos de saurópodo",
        "sala": "Sala de los Dinosaurios",
        "salaId": "dinosaurios",
        "planta": "primera",
        "procedencia": "Yacimiento de La Fontaneda"
      },
      {
        "id": 3,
        "nombre": "Geoda de amatista",
        "sala": "Sala de los Minerales",
        "salaId": "minerales",
        "planta": "primera",
        "procedencia": "Donación de una familia de canteros"
      },
      {
        "id": 4,
        "nombre": "Meteorito de Valdemar",
        "sala": "Sala de Restauración",
        "salaId": "restauracion",
        "planta": "sótano",
        "procedencia": "Cayó en un prado del valle en 1926"
      }
    ],
    "visitas": [
      {
        "id": "mar",
        "guia": "Lucía",
        "horas": [
          "11:00",
          "13:00",
          "17:30"
        ],
        "plazas": 12
      },
      {
        "id": "dinosaurios",
        "guia": "Andrés",
        "horas": [
          "10:30",
          "16:00"
        ],
        "plazas": 4
      },
      {
        "id": "minerales",
        "guia": "Inés",
        "horas": [
          "12:00"
        ],
        "plazas": 20
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

**Cada fallo se queda en el nivel de lo que ha fallado:** lo secundario, en su hueco; lo crítico, en el límite de la ruta. Y como `useRouteError`, `useAsyncError()` devuelve `unknown`, porque una promesa se puede rechazar con cualquier cosa: `VisitasNoDisponibles` lo estrecha con `error instanceof Error` antes de leer `message`, o el panel de tipos diría `'error' is of type 'unknown'.`

### Si la promesa falla antes de que la pinten

En el museo, la petición de las visitas sale cuando ya ha llegado la pieza: cuando falla, `<Await>` ya está pintado y escuchando. Pero si lo que espera no depende de lo crítico y lo lanzas antes del `await`, como aconseja la documentación, puede fallar antes de que la ficha se pinte. Durante ese rato, nadie atiende el rechazo.

Lo comprobamos con las dos peticiones a la vez y la que no es crítica fallando con un 404. `<Await>` pintó bien su `errorElement`, pero antes la vista previa enseñó su recuadro rojo con `Error: El servidor respondió 404`, y Chrome apuntó `Uncaught (in promise) Error: El servidor respondió 404` («error no capturado en una promesa»). Chrome lo da por atendido en cuanto `<Await>` le pone su manejador; el recuadro de la vista previa se queda. Con una línea en el `loader` no aparece ninguno de los dos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params, request }: LoaderFunctionArgs) {\n  // No depende de la pieza: sale la primera, sin await\n  const avisos = pedirJson<Aviso[]>('/api/avisos', request.signal)\n  avisos.catch(() => {})\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  return { pieza, avisos }\n}",
  "anotaciones": [
    {
      "fragmento": "const avisos = pedirJson<Aviso[]>('/api/avisos', request.signal)",
      "nota": "Una promesa independiente de la pieza: la lanzas antes del await para que las dos peticiones vayan a la vez. Si falla antes de que llegue la pieza, nadie la está escuchando todavía."
    },
    {
      "fragmento": "avisos.catch(() => {})",
      "nota": "Le pone un manejador que no hace nada, y así el navegador no la cuenta como un rechazo sin atender. No cambia la promesa: Await recibe igual el rechazo y pinta su errorElement (comprobado)."
    },
    {
      "fragmento": "return { pieza, avisos }",
      "nota": "Se devuelve avisos, la promesa original, no la que crea catch. La de catch nunca se rechaza, y con ella errorElement no se pintaría nunca."
    }
  ]
}
```

En el modo framework, el mismo descuido en un `loader` de servidor es más grave: la documentación avisa de que, en Node, un rechazo sin atender puede tumbar el proceso del servidor si no registras un manejador para `unhandledRejection`. Lo verás con el servidor delante, en el módulo 4.

## Al pasar de una pieza a otra, la transición espera

En los dos bloques anteriores siempre se abre la ficha desde la portada, y cada vez se monta una `Ficha` nueva, con un `<Suspense>` nuevo. Con la lista de piezas al lado de la ficha, como las rutas anidadas de la lección 77 de React, ir de una pieza a otra reutiliza la misma `Ficha`. Y entonces pasa algo que no esperas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Del rorcual a los huevos de saurópodo",
  "consigna": "Abre el esqueleto de rorcual, espera a que salgan sus visitas y pulsa «Huevos de saurópodo». Durante 1,6 s sigue el rorcual, atenuado, aunque la barra de direcciones dice /piezas/2 desde los 800 ms: no ves «Consultando las visitas de la Sala de los Dinosaurios…» en ningún momento. Ahora añade key={pieza.id} al <Suspense> de Ficha.tsx y repite: la ficha nueva sale a los 800 ms, con su espera.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, NavLink, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedirJson, type Pieza } from './api'\nimport Ficha, { loader as cargarFicha } from './Ficha'\nimport './estilos.css'\n\nasync function cargarPiezas({ request }: LoaderFunctionArgs) {\n  return { piezas: await pedirJson<Pieza[]>('/api/piezas', request.signal) }\n}\n\n// La lista se queda a la izquierda; la ficha cambia en el Outlet\nfunction Piezas() {\n  const { piezas } = useLoaderData<typeof cargarPiezas>()\n  return (\n    <div className=\"dos-columnas\">\n      <nav aria-label=\"Piezas\">\n        <ul>\n          {piezas.map((pieza) => (\n            <li key={pieza.id}>\n              <NavLink to={`/piezas/${pieza.id}`}>{pieza.nombre}</NavLink>\n            </li>\n          ))}\n        </ul>\n      </nav>\n      <Outlet />\n    </div>\n  )\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Museo de Ciencias Naturales de Valdemar</p>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo el museo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">La web del museo no está disponible ahora mismo.</p>,\n    children: [\n      { index: true, element: <Link to=\"/piezas\">Ver las piezas</Link> },\n      {\n        path: 'piezas',\n        loader: cargarPiezas,\n        Component: Piezas,\n        children: [\n          { index: true, element: <p>Elige una pieza de la lista.</p> },\n          {\n            path: ':piezaId',\n            loader: cargarFicha,\n            Component: Ficha,\n            ErrorBoundary: () => <p role=\"alert\">No hemos podido abrir la ficha de esta pieza.</p>,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { Suspense } from 'react'\nimport { Await, useAsyncError, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Pieza, type Visitas } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  const visitas = pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`, request.signal)\n  return { pieza, visitas }\n}\n\nfunction VisitasDeHoy({ visitas }: { visitas: Visitas }) {\n  return (\n    <>\n      <p>\n        Con {visitas.guia}: {visitas.horas.join(' · ')}\n      </p>\n      <p>Quedan {visitas.plazas} plazas</p>\n    </>\n  )\n}\n\n// Va en el sitio de las visitas si la promesa se rechaza\nfunction VisitasNoDisponibles() {\n  const error = useAsyncError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">Ahora no podemos consultar las visitas de esta sala ({motivo}).</p>\n}\n\nexport default function Ficha() {\n  const { pieza, visitas } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{pieza.nombre}</h2>\n      <p>\n        {pieza.sala} · planta {pieza.planta}\n      </p>\n      <p>Procedencia: {pieza.procedencia}</p>\n      <section className=\"visitas\" aria-labelledby=\"visitas-de-hoy\">\n        <h3 id=\"visitas-de-hoy\">Visitas guiadas de hoy</h3>\n        <Suspense fallback={<p className=\"cargando\">Consultando las visitas de la {pieza.sala}…</p>}>\n          <Await resolve={visitas} errorElement={<VisitasNoDisponibles />}>\n            {(datos) => <VisitasDeHoy visitas={datos} />}\n          </Await>\n        </Suspense>\n      </section>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Pieza = {\n  id: number\n  nombre: string\n  sala: string\n  salaId: string\n  planta: string\n  procedencia: string\n}\n\nexport type Visitas = {\n  id: string\n  guia: string\n  horas: string[]\n  plazas: number\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a1c;\n  background: #f7f6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f4a2a;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na[aria-current='page'] {\n  color: inherit;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 1.5rem;\n}\n\n/* El hueco de las visitas mide lo mismo vacío que lleno: la ficha no salta */\n.visitas {\n  min-height: 5rem;\n  margin-top: 0.75rem;\n  padding: 0.6rem 0.8rem;\n  border: 1px solid #c9c3a8;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cargando {\n  color: #6b6b5e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "Ficha.tsx",
  "urlInicial": "/piezas",
  "mostrarConsola": false,
  "api": {
    "piezas": [
      {
        "id": 1,
        "nombre": "Esqueleto de rorcual",
        "sala": "Sala del Mar",
        "salaId": "mar",
        "planta": "baja",
        "procedencia": "Varó en la playa de Valdemar en 1987"
      },
      {
        "id": 2,
        "nombre": "Huevos de saurópodo",
        "sala": "Sala de los Dinosaurios",
        "salaId": "dinosaurios",
        "planta": "primera",
        "procedencia": "Yacimiento de La Fontaneda"
      },
      {
        "id": 3,
        "nombre": "Geoda de amatista",
        "sala": "Sala de los Minerales",
        "salaId": "minerales",
        "planta": "primera",
        "procedencia": "Donación de una familia de canteros"
      },
      {
        "id": 4,
        "nombre": "Meteorito de Valdemar",
        "sala": "Sala de Restauración",
        "salaId": "restauracion",
        "planta": "sótano",
        "procedencia": "Cayó en un prado del valle en 1926"
      }
    ],
    "visitas": [
      {
        "id": "mar",
        "guia": "Lucía",
        "horas": [
          "11:00",
          "13:00",
          "17:30"
        ],
        "plazas": 12
      },
      {
        "id": "dinosaurios",
        "guia": "Andrés",
        "horas": [
          "10:30",
          "16:00"
        ],
        "plazas": 4
      },
      {
        "id": "minerales",
        "guia": "Inés",
        "horas": [
          "12:00"
        ],
        "plazas": 20
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

**React Router hace sus navegaciones dentro de una transición (`startTransition`, lección 51 de React), y en una transición React no esconde lo que ya se veía detrás de un fallback: deja la pantalla anterior hasta que lo nuevo está listo (lección 48 de React).** Desde la portada, el `<Suspense>` de la ficha es nuevo y enseña su fallback sin problema. Entre dos piezas es el mismo límite, que ya enseñaba las visitas del rorcual, así que la transición espera a las del saurópodo. Has quitado el `await`, pero la navegación vuelve a esperar a todo.

Este es el registro de la vista previa en Chromium, con 800 ms de latencia, antes y después de la `key`. La flecha `→` es una petición que sale, `←` una respuesta que llega, `BARRA` es la dirección que enseña la barra y `PANTALLA` resume lo que se ve:

```text
Sin key
     0 ms  CLIC «Huevos de saurópodo»
    67 ms  → GET /api/piezas/2
    78 ms  PANTALLA  «Cargando…» · Esqueleto de rorcual · visitas con Lucía (atenuada)
   868 ms  ← /api/piezas/2 200
   868 ms  BARRA     /piezas/2
   868 ms  → GET /api/visitas/dinosaurios
  1670 ms  ← /api/visitas/dinosaurios 200
  1688 ms  PANTALLA  Huevos de saurópodo · visitas con Andrés

Con key={pieza.id}
     0 ms  CLIC «Huevos de saurópodo»
    81 ms  → GET /api/piezas/2
    87 ms  PANTALLA  «Cargando…» · Esqueleto de rorcual · visitas con Lucía (atenuada)
   881 ms  ← /api/piezas/2 200
   882 ms  BARRA     /piezas/2
   882 ms  → GET /api/visitas/dinosaurios
   889 ms  PANTALLA  Huevos de saurópodo · «Consultando las visitas de la Sala de los Dinosaurios…»
  1683 ms  ← /api/visitas/dinosaurios 200
  1690 ms  PANTALLA  Huevos de saurópodo · visitas con Andrés
```

Lo mismo sale en WebKit y en un proyecto de Vite con React 19.3.1 y React Router 8.5.0, también con el botón Atrás del navegador. La salida es la de la lección 48 de React: **una `key` distinta convierte el límite en otro límite**, que enseña su fallback aunque esté dentro de una transición. React lo explica en su referencia de `<Suspense>` y añade que *«Suspense-integrated routers should do this automatically»* («los routers integrados con Suspense deberían hacerlo solos»). React Router 8.5 no lo hace entre dos URL de la misma ruta: lo pones tú.

¿Por qué `pieza.id` y no algo que cambie en cada navegación? Porque si vuelves a cargar la misma pieza, la `key` no cambia y la transición espera: siguen las visitas de antes hasta que llegan las nuevas, sin un fallback de por medio. Comprobado al pulsar el enlace de la pieza en la que ya estás y al revalidar con `useRevalidator` (lección 4), que es lo que pasa también tras una `action`. Para refrescar los mismos datos, suele ser lo que quieres.

## Qué es crítico y qué puede esperar

Dejar algo para después no es gratis: cada promesa sin `await` es otro estado de carga que el usuario va a ver, y otro hueco que puede fallar. Antes de quitar un `await`, piensa qué pierdes. Un caso que parece cómodo: si no quedan plazas, mandar al usuario a otra página desde la promesa de las visitas.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params }: LoaderFunctionArgs) {\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`)\n  const visitas = pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`).then((datos) =>\n    datos.plazas === 0 ? redirect('/visitas-agotadas') : datos,\n  )\n  return { pieza, visitas }\n}\n\n// Las visitas de la Sala del Mar se han quedado sin plazas.\n// Abres el esqueleto de rorcual.",
  "opciones": [
    "Cuando llegan las visitas, el router navega a /visitas-agotadas",
    "El router espera a las visitas para poder redirigir antes de pintar la ficha",
    "La ficha sale con su fallback; cuando llegan las visitas, Await recibe la redirección como un dato más y no se navega a ningún sitio",
    "Error: redirect solo se puede lanzar, no devolver"
  ],
  "correcta": 2,
  "explicacion": "redirect() crea una Response con un 302. El router la sigue cuando la devuelve o la lanza el loader, pero aquí va dentro de una promesa que el loader no espera. Comprobado: Await pintó sus hijos con esa Response como valor, y la dirección no cambió. TypeScript lo avisa a su manera: datos pasa a ser Visitas | Response."
}
```

Con un 404 pasa algo parecido. Si dentro de la promesa lanzas `data('Sin visitas', { status: 404 })`, `useAsyncError` recibe ese objeto tal cual, e `isRouteErrorResponse` da `false` (comprobado): para el router no es una respuesta de error de la ruta, sino el valor con el que se rechazó una promesa. Y en el modo framework con SSR hay una razón más: una vez que el servidor empieza a enviar la página, el código de estado ya no se puede cambiar (lección 87 de React).

**Lo que decide si la página existe o adónde ir es crítico.** Junto con eso, unas preguntas para cada dato de la página:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿La página tiene sentido sin él?",
      "texto": "Si no, es crítico. La ficha sin la pieza no es nada; sin las visitas, sigue siendo la ficha."
    },
    {
      "titulo": "¿Decide un 404 o una redirección?",
      "texto": "Entonces va con await. Dentro de una promesa que llega después, ni el redirect navega ni el data con un 404 llega como respuesta de error de la ruta."
    },
    {
      "titulo": "¿Tarda bastante más que lo crítico?",
      "texto": "Si llega casi a la vez, déjalo con await. Comprobado: con las visitas ya resueltas cuando llegó la pieza, la ficha enseñó «Consultando las visitas…» unos 300 ms, porque React no revela el contenido nuevo hasta 300 ms después del último (lección 48 de React). Peor que esperar."
    },
    {
      "titulo": "¿Puede fallar sin que la página deje de servir?",
      "texto": "Es buena candidata para esperar, con su errorElement o su límite de error, como las visitas del meteorito."
    },
    {
      "titulo": "¿Mueve lo de abajo cuando llega?",
      "texto": "Resérvale el hueco con CSS, como el min-height de .visitas, para que la página no salte. Si es lo primero que se ve, piénsalo dos veces."
    },
    {
      "titulo": "¿Cuántos huecos va a haber?",
      "texto": "Cada promesa con su Suspense es un estado de carga más. Si varias llegan a la vez, mejor un solo límite para todas (lección 48 de React)."
    }
  ]
}
```

En el modo framework hay un límite más: el servidor no espera para siempre a lo que dejaste para después. Pasado un tiempo, rechaza las promesas que siguen pendientes; por defecto, a los 4.950 ms, y lo cambias exportando `streamTimeout` desde `entry.server.tsx`. Lo verás en la lección 17.

## Cuándo lo usarías de verdad

- **Fichas con un bloque secundario lento:** opiniones, recomendaciones, «también te puede interesar», existencias en tienda, las visitas del museo.
- **Datos de un servicio que no controlas**, que a veces tarda o falla: reservas, envíos, el tiempo. Con `errorElement`, su fallo no tumba la página.
- **Paneles con una parte cara de calcular:** el resumen sale ya y las estadísticas, cuando terminan. Lo harás en el proyecto 13, con el panel de la intranet de la protectora.
- **En el modo framework con SSR**, para que el servidor empiece a responder con lo crítico y no con lo más lento (lección 17).

Y cuándo no: cuando el dato es la página misma (la lista de la portada), cuando el formulario lo necesita para pintarse, cuando decide un 404 o una redirección, y cuando llega casi a la vez que lo crítico.

## Errores típicos

**Esperar por costumbre.** Un `await` delante de cada petición, o un `Promise.all` que lo junta todo, convierte la ficha en «todo o nada» otra vez. Pregúntate en cada `await` si la página puede salir sin ese dato.

**Devolver la promesa suelta.** `return pedirJson(...)` se espera entera, como viste al principio. Las promesas que no deben bloquear van dentro del objeto.

**Olvidar el `<Suspense>`.** Antes de mirar la respuesta, piensa qué pasa aquí:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "export default function Ficha() {\n  const { pieza, visitas } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{pieza.nombre}</h2>\n      {/* Sin <Suspense> por encima */}\n      <Await resolve={visitas}>{(datos) => <VisitasDeHoy visitas={datos} />}</Await>\n    </article>\n  )\n}\n\n// Desde la portada pulsas «Esqueleto de rorcual».\n// La pieza tarda 800 ms y las visitas, 800 ms más.",
  "opciones": [
    "Un error en la consola: Await tiene que ir dentro de un Suspense",
    "La ficha sale a los 800 ms sin fallback, y las visitas aparecen a los 1.600",
    "La portada se queda atenuada, con «Cargando…», 1.600 ms, y después sale la ficha entera, sin ningún aviso",
    "La ficha sale a los 800 ms y las visitas no llegan nunca"
  ],
  "correcta": 2,
  "explicacion": "Await se suspende y no hay ningún Suspense dentro de la ruta que ponga un fallback. Como la navegación va en una transición, React deja la página anterior hasta que todo está listo: es lo mismo que haber escrito await. Comprobado, y sin ningún aviso en la consola. Lo mismo pasa con use(visitas) en el componente de la ruta."
}
```

**Llamar a `use` en el componente de la ruta.** El mismo efecto que el anterior: quien se suspende es `Ficha`, y la navegación espera a todo. `use` va en un componente de dentro, con su `<Suspense>` entre los dos.

**Crear la promesa en el componente.** `<Await resolve={pedirJson('/api/visitas/mar')}>` hace una petición en cada render de la ficha: comprobado, dos al montarla, por el doble render de `StrictMode`, y una más con cada render nuevo. Es el error de la lección 49 de React («crear la promesa en el render del padre»). La promesa la crea el `loader`, una vez por navegación.

**Dejar el `<Await>` sin `errorElement`.** El fallo de lo secundario sube al `ErrorBoundary` de la ruta y se lleva la ficha entera, y `onError` lo avisa dos veces (lección 8). Con `use`, lo mismo si no pones tu propio límite de error.

**Olvidar la `key` entre páginas de la misma ruta.** Desde la portada funciona y nadie lo nota; entre dos fichas, la transición espera a todo.

**Tratar el error como `Error`.** `useAsyncError()` devuelve `unknown`: compruébalo con `instanceof Error` antes de leer `message`.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Sin await, la página siempre sale antes",
      "realidad": "Solo si lo que dejas para después tarda bastante más que lo crítico, y solo si hay un Suspense dentro de la ruta y, entre páginas de la misma ruta, una key. Si llega casi a la vez, la página sale igual de tarde y además enseña un fallback 300 ms."
    },
    {
      "mito": "Si me voy de la página, se cancela lo que estaba esperando",
      "realidad": "Solo si te vas antes de que llegue lo crítico: entonces el router interrumpe la navegación y aborta su signal. Con la página ya pintada, la petición de lo que espera sigue hasta el final (comprobado). Nadie pinta la respuesta, pero el trabajo se hace."
    },
    {
      "mito": "Streaming es cosa del servidor",
      "realidad": "El nombre viene del SSR, pero la API es la misma en una SPA: promesas dentro del objeto del loader, Suspense y Await o use. Lo que cambia en el servidor es el envío del HTML, el código de estado y el streamTimeout."
    },
    {
      "mito": "Con use ya no hace falta Await",
      "realidad": "use pinta lo mismo, pero Await trae el sitio para el error, errorElement, y con él onError sigue enterándose del fallo. Con use, ese sitio es un límite de error que escribes tú. Elige por cómo quieres gestionar los fallos."
    }
  ]
}
```

## Ejercicios

**1. Las opiniones de La Suela.** Alpargatas La Suela vende en su web alpargatas hechas en un taller de La Rioja. La ficha de cada modelo enseña el precio, la suela y los colores y, debajo, las opiniones de quienes las llevan. Las opiniones las guarda otro servicio, por la referencia del almacén, y el `loader` las espera: la ficha tarda el doble de lo necesario, y la edición limitada de verano, que aún no tiene opiniones, ni siquiera se abre. Las comprobaciones usan la API simulada con 400 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha del modelo, sin esperar a las opiniones",
  "consigna": "En Modelo.tsx, haz que la ficha salga en cuanto llega el modelo: devuelve las opiniones como una promesa dentro del objeto y píntalas con Suspense y Await, con «Cargando opiniones…» mientras tanto. Si fallan, en su hueco tiene que salir un aviso con role=\"alert\" que diga el motivo, leído con useAsyncError. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "Modelo.tsx",
      "codigo": "import { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Modelo, type Opiniones } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  const modelo = await pedirJson<Modelo>(`/api/modelos/${params.modeloId}`, request.signal)\n  // Las opiniones las guarda otro servicio, por referencia del almacén\n  const opiniones = await pedirJson<Opiniones>(`/api/opiniones/${modelo.referencia}`, request.signal)\n  return { modelo, opiniones }\n}\n\nfunction ResumenOpiniones({ opiniones }: { opiniones: Opiniones }) {\n  return (\n    <>\n      <p>\n        {opiniones.media.toLocaleString('es')} de 5 ({opiniones.total} opiniones)\n      </p>\n      <blockquote>{opiniones.destacada}</blockquote>\n    </>\n  )\n}\n\n// TODO: que la ficha salga sin esperar a las opiniones, con su espera y su aviso de error\nexport default function FichaModelo() {\n  const { modelo, opiniones } = useLoaderData<typeof loader>()\n  return (\n    <article>\n      <h2>{modelo.nombre}</h2>\n      <p className=\"precio\">{modelo.precio} €</p>\n      <p>Suela de {modelo.suela}</p>\n      <p>Colores: {modelo.colores.join(', ')}</p>\n      <section className=\"opiniones\" aria-labelledby=\"titulo-opiniones\">\n        <h3 id=\"titulo-opiniones\">Lo que dicen quienes las llevan</h3>\n        <ResumenOpiniones opiniones={opiniones} />\n      </section>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedirJson, type Modelo } from './api'\nimport FichaModelo, { loader as cargarModelo } from './Modelo'\nimport './estilos.css'\n\nasync function cargarModelos({ request }: LoaderFunctionArgs) {\n  return { modelos: await pedirJson<Modelo[]>('/api/modelos', request.signal) }\n}\n\nfunction Portada() {\n  const { modelos } = useLoaderData<typeof cargarModelos>()\n  return (\n    <>\n      <h2>Modelos</h2>\n      <ul>\n        {modelos.map((modelo) => (\n          <li key={modelo.id}>\n            <Link to={`/modelos/${modelo.id}`}>{modelo.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Maquetacion() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Alpargatas La Suela</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Todos los modelos</Link>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la tienda…</p>,\n    children: [\n      { index: true, loader: cargarModelos, Component: Portada },\n      {\n        path: 'modelos/:modeloId',\n        loader: cargarModelo,\n        Component: FichaModelo,\n        ErrorBoundary: () => <p role=\"alert\">No hemos podido abrir este modelo.</p>,\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Modelo = {\n  id: number\n  nombre: string\n  precio: number\n  suela: string\n  colores: string[]\n  referencia: string\n}\n\nexport type Opiniones = {\n  id: string\n  media: number\n  total: number\n  destacada: string\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #2b2118;\n  background: #fbf7f0;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #8a5a2b;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\n.precio {\n  font-size: 1.1rem;\n  font-weight: 700;\n}\n\n/* El hueco de las opiniones mide lo mismo vacío que lleno */\n.opiniones {\n  min-height: 4.5rem;\n  margin-top: 0.75rem;\n  padding: 0.6rem 0.8rem;\n  border: 1px solid #e0cfb5;\n  border-radius: 6px;\n  background: #fff;\n}\n\nblockquote {\n  margin: 0;\n  font-style: italic;\n}\n\n.cargando {\n  color: #7a6a58;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "Modelo.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "modelos": [
      {
        "id": 1,
        "nombre": "Alpargata clásica de lona",
        "precio": 24,
        "suela": "yute cosido a mano",
        "colores": [
          "azul marino",
          "rojo",
          "crudo"
        ],
        "referencia": "CL-01"
      },
      {
        "id": 2,
        "nombre": "Valenciana de cuña",
        "precio": 39,
        "suela": "yute y goma",
        "colores": [
          "negro",
          "mostaza"
        ],
        "referencia": "VA-07"
      },
      {
        "id": 3,
        "nombre": "Alpargata de piel",
        "precio": 55,
        "suela": "yute cosido a mano",
        "colores": [
          "cuero"
        ],
        "referencia": "PI-03"
      },
      {
        "id": 4,
        "nombre": "Edición limitada de verano",
        "precio": 32,
        "suela": "yute teñido",
        "colores": [
          "turquesa"
        ],
        "referencia": "ED-26"
      }
    ],
    "opiniones": [
      {
        "id": "CL-01",
        "media": 4.7,
        "total": 128,
        "destacada": "Cómodas desde el primer día."
      },
      {
        "id": "VA-07",
        "media": 4.4,
        "total": 56,
        "destacada": "La cuña no cansa nada."
      },
      {
        "id": "PI-03",
        "media": 4.8,
        "total": 23,
        "destacada": "Se adaptan al pie en una semana."
      }
    ]
  },
  "red": {
    "latencia": 400
  },
  "comprobaciones": [
    {
      "descripcion": "La ficha del modelo sale antes que las opiniones, con «Cargando opiniones…»",
      "urlInicial": "/modelos/1",
      "pasos": [],
      "espera": {
        "texto": "Cargando opiniones…"
      }
    },
    {
      "descripcion": "Desde la portada, la ficha de la valenciana sale sin esperar a sus opiniones",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Valenciana de cuña"
          }
        }
      ],
      "espera": {
        "texto": "Cargando opiniones…"
      }
    },
    {
      "descripcion": "Cuando llegan, las opiniones aparecen en la ficha",
      "urlInicial": "/modelos/1",
      "pasos": [],
      "espera": {
        "texto": "4,7 de 5 (128 opiniones)"
      }
    },
    {
      "descripcion": "Si las opiniones fallan, su hueco enseña un aviso con el motivo",
      "urlInicial": "/modelos/4",
      "pasos": [],
      "espera": {
        "rol": "alert",
        "texto": "El servidor respondió 404"
      }
    }
  ]
}
```

**2. Las visitas, con `use`.** Volvemos al museo, ahora con la lista de piezas al lado de la ficha. Esta versión ya devuelve las visitas como promesa, pero las lee con `use` en el propio componente de la ruta: la ficha espera a todo, y el meteorito, sin visitas, se lleva la ficha entera. En `LimiteDeError.tsx` tienes el error boundary de la lección 53 de React, en TypeScript. Las comprobaciones usan 400 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cada pieza, su espera y su aviso",
  "consigna": "En Ficha.tsx, lleva el use a VisitasDeHoy, que recibirá la promesa, y rodéalo con un Suspense cuyo fallback nombre la sala de la pieza: «Consultando las visitas de la Sala del Mar…». Si las visitas fallan, un LimiteDeError tiene que pintar en su hueco un aviso con role=\"alert\" y el mensaje del error. Al pasar a otra pieza de la lista, la ficha nueva tiene que salir ya, con su espera, y sin arrastrar el aviso de la anterior. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { use } from 'react'\nimport { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedirJson, type Pieza, type Visitas } from './api'\n\nexport async function loader({ params, request }: LoaderFunctionArgs) {\n  const pieza = await pedirJson<Pieza>(`/api/piezas/${params.piezaId}`, request.signal)\n  const visitas = pedirJson<Visitas>(`/api/visitas/${pieza.salaId}`, request.signal)\n  return { pieza, visitas }\n}\n\nfunction VisitasDeHoy({ visitas }: { visitas: Visitas }) {\n  return (\n    <>\n      <p>\n        Con {visitas.guia}: {visitas.horas.join(' · ')}\n      </p>\n      <p>Quedan {visitas.plazas} plazas</p>\n    </>\n  )\n}\n\nexport default function Ficha() {\n  const { pieza, visitas } = useLoaderData<typeof loader>()\n  // TODO: que la ficha no espere a las visitas, y que no se caiga entera si fallan\n  const datos = use(visitas)\n  return (\n    <article>\n      <h2>{pieza.nombre}</h2>\n      <p>\n        {pieza.sala} · planta {pieza.planta}\n      </p>\n      <p>Procedencia: {pieza.procedencia}</p>\n      <section className=\"visitas\" aria-labelledby=\"visitas-de-hoy\">\n        <h3 id=\"visitas-de-hoy\">Visitas guiadas de hoy</h3>\n        <VisitasDeHoy visitas={datos} />\n      </section>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "LimiteDeError.tsx",
      "codigo": "import { Component, type ReactNode } from 'react'\n\ntype Props = {\n  alternativa: (error: Error) => ReactNode\n  children: ReactNode\n}\n\ntype Estado = { error: Error | null }\n\n// El error boundary de la lección 53 de React, en TypeScript\nexport default class LimiteDeError extends Component<Props, Estado> {\n  state: Estado = { error: null }\n\n  static getDerivedStateFromError(error: Error): Estado {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) return this.props.alternativa(this.state.error)\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, NavLink, Outlet, useLoaderData, useNavigation, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedirJson, type Pieza } from './api'\nimport Ficha, { loader as cargarFicha } from './Ficha'\nimport './estilos.css'\n\nasync function cargarPiezas({ request }: LoaderFunctionArgs) {\n  return { piezas: await pedirJson<Pieza[]>('/api/piezas', request.signal) }\n}\n\n// La lista se queda a la izquierda; la ficha cambia en el Outlet\nfunction Piezas() {\n  const { piezas } = useLoaderData<typeof cargarPiezas>()\n  return (\n    <div className=\"dos-columnas\">\n      <nav aria-label=\"Piezas\">\n        <ul>\n          {piezas.map((pieza) => (\n            <li key={pieza.id}>\n              <NavLink to={`/piezas/${pieza.id}`}>{pieza.nombre}</NavLink>\n            </li>\n          ))}\n        </ul>\n      </nav>\n      <Outlet />\n    </div>\n  )\n}\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Museo de Ciencias Naturales de Valdemar</p>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo el museo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">La web del museo no está disponible ahora mismo.</p>,\n    children: [\n      { index: true, element: <Link to=\"/piezas\">Ver las piezas</Link> },\n      {\n        path: 'piezas',\n        loader: cargarPiezas,\n        Component: Piezas,\n        children: [\n          { index: true, element: <p>Elige una pieza de la lista.</p> },\n          {\n            path: ':piezaId',\n            loader: cargarFicha,\n            Component: Ficha,\n            ErrorBoundary: () => <p role=\"alert\">No hemos podido abrir la ficha de esta pieza.</p>,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Pieza = {\n  id: number\n  nombre: string\n  sala: string\n  salaId: string\n  planta: string\n  procedencia: string\n}\n\nexport type Visitas = {\n  id: string\n  guia: string\n  horas: string[]\n  plazas: number\n}\n\nexport async function pedirJson<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a1c;\n  background: #f7f6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f4a2a;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.2rem;\n}\n\nh3 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na[aria-current='page'] {\n  color: inherit;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 1.5rem;\n}\n\n/* El hueco de las visitas mide lo mismo vacío que lleno: la ficha no salta */\n.visitas {\n  min-height: 5rem;\n  margin-top: 0.75rem;\n  padding: 0.6rem 0.8rem;\n  border: 1px solid #c9c3a8;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.cargando {\n  color: #6b6b5e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b42318;\n}\n"
    }
  ],
  "archivoInicial": "Ficha.tsx",
  "urlInicial": "/piezas/1",
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "piezas": [
      {
        "id": 1,
        "nombre": "Esqueleto de rorcual",
        "sala": "Sala del Mar",
        "salaId": "mar",
        "planta": "baja",
        "procedencia": "Varó en la playa de Valdemar en 1987"
      },
      {
        "id": 2,
        "nombre": "Huevos de saurópodo",
        "sala": "Sala de los Dinosaurios",
        "salaId": "dinosaurios",
        "planta": "primera",
        "procedencia": "Yacimiento de La Fontaneda"
      },
      {
        "id": 3,
        "nombre": "Geoda de amatista",
        "sala": "Sala de los Minerales",
        "salaId": "minerales",
        "planta": "primera",
        "procedencia": "Donación de una familia de canteros"
      },
      {
        "id": 4,
        "nombre": "Meteorito de Valdemar",
        "sala": "Sala de Restauración",
        "salaId": "restauracion",
        "planta": "sótano",
        "procedencia": "Cayó en un prado del valle en 1926"
      }
    ],
    "visitas": [
      {
        "id": "mar",
        "guia": "Lucía",
        "horas": [
          "11:00",
          "13:00",
          "17:30"
        ],
        "plazas": 12
      },
      {
        "id": "dinosaurios",
        "guia": "Andrés",
        "horas": [
          "10:30",
          "16:00"
        ],
        "plazas": 4
      },
      {
        "id": "minerales",
        "guia": "Inés",
        "horas": [
          "12:00"
        ],
        "plazas": 20
      }
    ]
  },
  "red": {
    "latencia": 400
  },
  "comprobaciones": [
    {
      "descripcion": "La ficha del rorcual sale antes que sus visitas, con su espera",
      "urlInicial": "/piezas/1",
      "pasos": [],
      "espera": {
        "texto": "Consultando las visitas de la Sala del Mar…"
      }
    },
    {
      "descripcion": "Al pasar del rorcual a los huevos de saurópodo, la ficha nueva sale con su propia espera",
      "urlInicial": "/piezas/1",
      "pasos": [
        {
          "pulsar": {
            "texto": "Quedan 12 plazas"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Huevos de saurópodo"
          }
        }
      ],
      "espera": {
        "texto": "Consultando las visitas de la Sala de los Dinosaurios…"
      }
    },
    {
      "descripcion": "Si las visitas del meteorito fallan, su hueco enseña un aviso con el motivo",
      "urlInicial": "/piezas/4",
      "pasos": [],
      "espera": {
        "rol": "alert",
        "texto": "El servidor respondió 404"
      }
    },
    {
      "descripcion": "Después del meteorito, el rorcual vuelve a enseñar sus visitas",
      "urlInicial": "/piezas/4",
      "pasos": [
        {
          "pulsar": {
            "rol": "alert",
            "texto": "El servidor respondió 404"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Esqueleto de rorcual"
          }
        }
      ],
      "espera": {
        "texto": "Con Lucía: 11:00 · 13:00 · 17:30"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En La Suela, añade a la ficha un bloque «Con la misma suela» con los otros modelos que la comparten (`GET /api/modelos?q=` y la suela del modelo), también sin bloquear. ¿Un `<Suspense>` para las opiniones y otro para este bloque, o uno para los dos? Prueba las dos formas con la latencia a 1.500 ms.
2. En el bloque de `<Await>` del museo, baja la latencia del panel a 100 ms y abre varias piezas. ¿Llegas a ver «Consultando las visitas…»? ¿Merece la pena el *streaming* con un servidor tan rápido? Súbela a 3.000 ms y compara.
3. En tu solución del ejercicio 2, cambia la `key` por `useLocation().key`, que cambia en cada navegación. ¿Qué ves ahora al pulsar el enlace de la pieza en la que ya estás? ¿Cuál de las dos prefieres para esta ficha, y por qué?
4. En la ficha del museo, añade una franja de avisos del día (cierres de salas, obras) que no dependa de la pieza: lánzala antes del `await` y píntala con su propio `<Await>`. Provoca un fallo con «Fallar la siguiente petición» y comprueba qué cambia si quitas el `catch` vacío.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Streaming con React Router",
  "recursos": [
    {
      "titulo": "Streaming with Suspense",
      "descripcion": "La guía de React Router: devolver promesas desde el loader, Await, use, el tiempo límite del servidor y los rechazos tempranos en Node.",
      "url": "https://reactrouter.com/how-to/suspense",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Await",
      "descripcion": "Referencia del componente: resolve, children como función o como elemento, y errorElement.",
      "url": "https://reactrouter.com/api/components/Await",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useAsyncError",
      "descripcion": "El hook que devuelve el motivo del rechazo dentro del errorElement de un Await.",
      "url": "https://reactrouter.com/api/hooks/useAsyncError",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useAsyncValue",
      "descripcion": "El valor resuelto del Await más cercano, para cuando sus hijos son elementos y no una función.",
      "url": "https://reactrouter.com/api/hooks/useAsyncValue",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "React Transitions",
      "descripcion": "Por qué el router envuelve sus actualizaciones en startTransition, y la opción useTransitions.",
      "url": "https://reactrouter.com/explanation/react-transitions",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "<Suspense>: Resetting Suspense boundaries on navigation",
      "descripcion": "La referencia de React sobre reiniciar un límite con key al navegar a otro contenido.",
      "url": "https://react.dev/reference/react/Suspense#resetting-suspense-boundaries-on-navigation",
      "etiqueta": "react.dev"
    }
  ]
}
```
