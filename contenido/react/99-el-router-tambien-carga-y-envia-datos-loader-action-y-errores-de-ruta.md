# El router también carga y envía datos: `loader`, `action` y errores de ruta

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `el-router-tambien-carga-y-envia-datos-loader-action-y-errores-de-ruta` (autogenerado del título)
- **Orden:** 775
- **Fuentes:** [Picking a Mode](https://reactrouter.com/start/modes) + [Data: Route Object](https://reactrouter.com/start/data/route-object) + [Data Loading](https://reactrouter.com/start/data/data-loading) + [Actions](https://reactrouter.com/start/data/actions) + [Pending UI](https://reactrouter.com/start/framework/pending-ui) + [Error Boundaries](https://reactrouter.com/how-to/error-boundary) + [Using Fetchers](https://reactrouter.com/how-to/fetchers) — ver `contenido/react/TEMARIO.md` #99

---

## Qué es y para qué sirve

En el Realejo de Granada, el taller de guitarras El Clavijero hace guitarras flamencas y clásicas, laúdes y bandurrias por encargo. Su web tiene un catálogo, la ficha de cada instrumento, un formulario para encargar uno y una estrella para guardar los favoritos.

Con lo que sabes de las lecciones 76 y 77, el router decide **qué** se pinta en cada dirección, y los datos los pide cada componente **después** de pintarse: con un efecto o con `use` y Suspense (lección 52). Funciona, pero ya conoces el precio: la página aparece vacía con su «Cargando…», cada componente anidado espera al de arriba para empezar a pedir lo suyo (la cascada) y, si el usuario cambia de página a media carga, hay que limpiar a mano la petición vieja. La lección 52 cerraba las cascadas con una pista: pedir los datos «en la ruta antes de montar la página». Esta lección es esa pista.

**En el modo de datos de React Router, cada ruta dice qué datos necesita (`loader`) y qué hacer con los formularios que se le envían (`action`). El router pide los datos al navegar, antes de pintar la página, y se encarga de lo que rodea a esa espera.** En concreto:

- Ejecuta a la vez los `loader` de todas las rutas de la rama que encaja con la URL: sin cascadas entre madre e hija.
- Mientras tanto, deja la página que había y te dice que está cargando (`useNavigation`), para que decidas qué enseñar.
- Si el usuario se va a otra página antes de que lleguen los datos, cancela la navegación vieja.
- Si un `loader` falla o no encuentra lo que busca, pinta la página de error **de esa ruta** (`ErrorBoundary`).
- Después de un envío (`action`), vuelve a ejecutar los `loader` de la página o redirige a otra (`redirect`).

Es lo que usa el proyecto 98, la revista, en el modo framework: allí los `loader` y las `action` se ejecutan en el servidor. Aquí, en una SPA de Vite, se ejecutan en el navegador. Las piezas son las mismas.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El código real, comprobado; la idea, en vivo",
  "contenido": "La vista previa de esta web solo carga React: no puede importar react-router. Por eso el código de React Router va anotado, y es exactamente el que se ejecutó en un proyecto de Vite con React 19.3.1 y React Router 8.5.0 (publicada el 19 de octubre de 2026), abierto en Chromium con Playwright y con un servidor de pruebas con latencias. Los registros que verás son los de esas ejecuciones. Los bloques en vivo usan un router de juguete escrito con React puro, que imita lo esencial."
}
```

## Del modo declarativo al de datos: `createBrowserRouter` y `RouterProvider`

En la lección 76 viste los tres modos de React Router. El declarativo, el de `<BrowserRouter>`, `<Routes>` y `<Route>`, describe las rutas **dentro** de los componentes, así que el router no las conoce hasta que React las pinta. El de datos las saca de React: **las rutas son una lista de objetos que se le da al router antes de pintar nada**, y por eso el router puede ejecutar el `loader` de una ruta antes de que exista su componente.

La conexión, en `main.jsx`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { rutas } from './rutas.jsx'\nimport './index.css'\n\n// Uno solo para toda la app, creado fuera de cualquier componente\nconst router = createBrowserRouter(rutas)\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <RouterProvider router={router} />\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "import { createBrowserRouter } from 'react-router'",
      "nota": "Crea el router a partir de la lista de rutas. Está en el mismo paquete que BrowserRouter: no hay nada más que instalar. Comprueba, eso sí, que tienes la versión 8 (lección 76)."
    },
    {
      "fragmento": "import { RouterProvider } from 'react-router/dom'",
      "nota": "En la versión 8, RouterProvider se exporta desde react-router y desde react-router/dom. La de react-router/dom es la misma con el flushSync de react-dom ya conectado; la documentación dice que es la que casi siempre quieres en el navegador. Comprobado en el código de la 8.5.0: es lo único que añade."
    },
    {
      "fragmento": "const router = createBrowserRouter(rutas)",
      "nota": "Una vez, fuera de cualquier componente. En cuanto se crea, lee la URL y empieza a ejecutar los loader de esa dirección, antes de que React pinte nada. En los errores típicos verás qué pasa si lo creas dentro de un componente."
    },
    {
      "fragmento": "<RouterProvider router={router} />",
      "nota": "Sustituye a BrowserRouter más Routes: se suscribe al router y pinta las rutas que encajan con la URL. Por dentro, aplica cada cambio de estado del router dentro de startTransition (lección 51)."
    }
  ]
}
```

Y la lista de rutas, en su propio archivo. Es el mismo árbol de la lección 77, escrito con objetos, y cada ruta puede llevar, además de su componente, su `loader`, su `action` y su página de error:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import Maquetacion from './Maquetacion.jsx'\nimport ErrorGeneral from './paginas/ErrorGeneral.jsx'\nimport Inicio from './paginas/Inicio.jsx'\nimport Catalogo, { cargarCatalogo } from './paginas/Catalogo.jsx'\nimport Ficha, { cargarFicha, ErrorFicha } from './paginas/Ficha.jsx'\nimport NuevoEncargo, { cargarOpciones, crearEncargo } from './paginas/NuevoEncargo.jsx'\nimport Encargo, { cargarEncargo } from './paginas/Encargo.jsx'\nimport { cambiarFavorito } from './paginas/favorito.js'\nimport NoEncontrada from './paginas/NoEncontrada.jsx'\n\nexport const rutas = [\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo el taller…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        path: 'instrumentos',\n        loader: cargarCatalogo,\n        Component: Catalogo,\n        children: [\n          { index: true, element: <p>Elige un instrumento de la lista.</p> },\n          { path: ':instrumentoId', loader: cargarFicha, Component: Ficha, ErrorBoundary: ErrorFicha },\n        ],\n      },\n      { path: 'instrumentos/:instrumentoId/favorito', action: cambiarFavorito },\n      { path: 'encargos/nuevo', loader: cargarOpciones, action: crearEncargo, Component: NuevoEncargo },\n      { path: 'encargos/:encargoId', loader: cargarEncargo, Component: Encargo },\n      { path: '*', Component: NoEncontrada },\n    ],\n  },\n]",
  "anotaciones": [
    {
      "fragmento": "Component: Maquetacion,",
      "nota": "Cada ruta es un objeto. Component recibe el componente, sin los signos de JSX; element, un elemento ya creado, como el de la ruta índice de más abajo. Las dos formas valen."
    },
    {
      "fragmento": "ErrorBoundary: ErrorGeneral,",
      "nota": "La página de error de esta ruta y de todas las que cuelgan de ella sin una propia. Lo ves en la sección de errores."
    },
    {
      "fragmento": "HydrateFallback: () => <p>Abriendo el taller…</p>,",
      "nota": "Lo que se pinta en la primera carga, mientras se ejecutan los loader de la dirección con la que se abre la app. Sin él, la pantalla se queda en blanco durante esa espera y la consola lo avisa."
    },
    {
      "fragmento": "loader: cargarCatalogo,",
      "nota": "La función que pide los datos de la ruta. El router la llama al navegar a /instrumentos o a cualquier ruta que cuelgue de ella, antes de pintar Catalogo."
    },
    {
      "fragmento": "children: [",
      "nota": "Las rutas hijas, como en la lección 77: se pintan en el Outlet de su madre y sus path son relativos."
    },
    {
      "fragmento": "{ path: ':instrumentoId', loader: cargarFicha, Component: Ficha, ErrorBoundary: ErrorFicha },",
      "nota": "Una ruta con todo: su loader, su componente y su propia página de error. Si la ficha falla, solo se sustituye la ficha; la lista de su madre sigue en pantalla."
    },
    {
      "fragmento": "{ path: 'instrumentos/:instrumentoId/favorito', action: cambiarFavorito },",
      "nota": "Una ruta sin componente, solo con action: nadie la visita, solo recibe envíos. La usa la estrella de favoritos."
    },
    {
      "fragmento": "{ path: 'encargos/nuevo', loader: cargarOpciones, action: crearEncargo, Component: NuevoEncargo },",
      "nota": "Leer y escribir en la misma ruta: el loader trae las opciones del formulario y la action recibe el encargo."
    }
  ]
}
```

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas del taller, con lo que hace cada una",
  "nodos": [
    {
      "nombre": "Maquetacion",
      "nivel": 0,
      "etiqueta": "path: /",
      "nota": "← cabecera y Outlet; ErrorBoundary general y HydrateFallback"
    },
    {
      "nombre": "Inicio",
      "nivel": 1,
      "etiqueta": "index"
    },
    {
      "nombre": "Catalogo",
      "nivel": 1,
      "etiqueta": "loader",
      "nota": "← /instrumentos: la lista, y su Outlet al lado"
    },
    {
      "nombre": "Elige un instrumento",
      "nivel": 2,
      "etiqueta": "index",
      "nota": "← un element, sin datos propios"
    },
    {
      "nombre": "Ficha",
      "nivel": 2,
      "etiqueta": "loader + ErrorBoundary",
      "nota": "← /instrumentos/:instrumentoId"
    },
    {
      "nombre": "(sin componente)",
      "nivel": 1,
      "etiqueta": "action",
      "nota": "← /instrumentos/:instrumentoId/favorito: solo recibe envíos"
    },
    {
      "nombre": "NuevoEncargo",
      "nivel": 1,
      "etiqueta": "loader + action",
      "nota": "← /encargos/nuevo"
    },
    {
      "nombre": "Encargo",
      "nivel": 1,
      "etiqueta": "loader",
      "nota": "← /encargos/:encargoId"
    },
    {
      "nombre": "NoEncontrada",
      "nivel": 1,
      "etiqueta": "path: *"
    }
  ]
}
```

**Lo que aprendiste en las lecciones 76 y 77 no cambia**: `<Link>`, `<NavLink>`, `<Outlet />`, `useParams`, `useSearchParams` y `useNavigate` funcionan igual en el modo de datos. Lo que desaparece son `<BrowserRouter>`, `<Routes>` y `<Route>` dentro de los componentes. Y lo nuevo de esta lección (`useLoaderData`, `useActionData`, `useNavigation`, `useRouteError`, `<Form>`, `useFetcher`) **solo funciona con un router creado con `createBrowserRouter`**: lo verás en los errores típicos.

## `loader`: los datos llegan antes que la página

Primero, el punto de partida: el catálogo del taller pedido como en la lección 52, con un efecto en cada componente. `Catalogo` pide la lista, y `Ficha`, que solo existe cuando la lista ha llegado, pide su instrumento. Los dos efectos llevan su limpieza, como manda la lección 38.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con efectos: primero se pinta, después se pide",
  "consigna": "La latencia del panel de red está en 1500 ms. Pulsa «Reiniciar» y fíjate en el orden: primero «Cargando el catálogo…» y, cuando llega, «Cargando la ficha…». En el registro, la petición de la ficha no sale hasta que termina la del catálogo: tres segundos en total. Después pulsa otro instrumento: la ficha anterior desaparece al instante y vuelve el «Cargando la ficha…». StrictMode está apagado para que el registro no enseñe la petición repetida de cada efecto.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Lo de la lección 52: un efecto que pide los datos después de pintar, con su limpieza\nfunction usePeticion(url) {\n  const [estado, setEstado] = useState({ datos: null, error: null })\n\n  useEffect(() => {\n    const controlador = new AbortController()\n    pedirJson(url, controlador.signal).then(\n      (datos) => setEstado({ datos, error: null }),\n      (error) => {\n        if (error.name !== 'AbortError') setEstado({ datos: null, error })\n      },\n    )\n    return () => controlador.abort()\n  }, [url])\n\n  return estado\n}\n\nfunction Ficha({ id }) {\n  const { datos: instrumento, error } = usePeticion(`/api/instrumentos/${id}`)\n\n  if (error) return <p role=\"alert\">No hemos podido cargar la ficha.</p>\n  if (!instrumento) return <p className=\"cargando\">Cargando la ficha…</p>\n  return (\n    <article>\n      <h2>{instrumento.nombre}</h2>\n      <p>\n        {instrumento.madera} · {instrumento.semanas} semanas · {instrumento.precio} €\n      </p>\n    </article>\n  )\n}\n\nexport default function Catalogo() {\n  const { datos: instrumentos, error } = usePeticion('/api/instrumentos')\n  const [elegido, setElegido] = useState(1)\n\n  return (\n    <>\n      <header>\n        <h1>Taller El Clavijero</h1>\n      </header>\n      <main>\n        {error && <p role=\"alert\">No hemos podido cargar el catálogo.</p>}\n        {!error && !instrumentos && <p className=\"cargando\">Cargando el catálogo…</p>}\n        {instrumentos && (\n          <div className=\"dos-columnas\">\n            <ul>\n              {instrumentos.map((instrumento) => (\n                <li key={instrumento.id}>\n                  <button aria-pressed={instrumento.id === elegido} onClick={() => setElegido(instrumento.id)}>\n                    {instrumento.nombre}\n                  </button>\n                </li>\n              ))}\n            </ul>\n            {/* La ficha no existe hasta que llega el catálogo: su petición espera a la otra */}\n            <Ficha key={elegido} id={elegido} />\n          </div>\n        )}\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #92400e;\n  background: #fffbeb;\n}\n\nheader h1 {\n  margin: 0;\n  font-size: 1.2rem;\n}\n\n.direccion {\n  margin: 0.25rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0.25rem 0 0;\n  color: #92400e;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.45;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.5rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.1rem;\n}\n\n.cargando {\n  color: #78716c;\n  font-style: italic;\n}\n\nbutton[aria-pressed='true'] {\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\n.error,\n[role='alert'] {\n  color: #b91c1c;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #d6d3d1;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": false,
  "api": {
    "instrumentos": [
      {
        "id": 1,
        "nombre": "Guitarra flamenca de ciprés",
        "madera": "ciprés y abeto",
        "semanas": 10,
        "precio": 2400
      },
      {
        "id": 2,
        "nombre": "Guitarra clásica de cedro",
        "madera": "cedro y palosanto",
        "semanas": 14,
        "precio": 3100
      },
      {
        "id": 3,
        "nombre": "Laúd español",
        "madera": "arce y abeto",
        "semanas": 12,
        "precio": 1900
      },
      {
        "id": 4,
        "nombre": "Bandurria",
        "madera": "nogal y abeto",
        "semanas": 8,
        "precio": 1500
      }
    ],
    "encargos": [
      {
        "id": 6,
        "nombre": "Andrés Vílchez",
        "instrumento": "Laúd español"
      }
    ],
    "visitas": [
      {
        "id": 1,
        "autor": "Carmen",
        "mensaje": "Me dejasteis probar la bandurria. ¡Qué sonido!"
      },
      {
        "id": 2,
        "autor": "Óscar",
        "mensaje": "Volveré a por cuerdas nuevas para el laúd."
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Nada de eso es un error de programación: es la forma en que funciona pedir en un efecto. **El componente tiene que existir para pedir sus datos**, así que la petición de la ficha no puede salir antes de que se pinte la ficha, y la ficha no se pinta hasta que llega la lista.

Ahora lo mismo con la idea del modo de datos. El bloque usa un router de juguete en dos archivos: `motor.jsx`, el equivalente del objeto que devuelve `createBrowserRouter` (vive fuera de React y guarda la página actual y la navegación en curso), y `router.jsx`, con las piezas de React. Se conectan con `useSyncExternalStore`, como el router a mano de la lección 76. Cada pieza lleva al lado su equivalente:

| Router de juguete | React Router |
|---|---|
| `crearRouter(rutas, inicio)` | `createBrowserRouter(rutas)` |
| `cargador` en la ruta | `loader` |
| `<ProveedorRouter>` | `<RouterProvider>` |
| `<Pagina />` | `<Outlet />` y `ErrorBoundary` |
| `useDatos()` | `useLoaderData()` |
| `useNavegacion()` | `useNavigation()` |
| `<Enlace a="…">` | `<Link to="…">` |

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con un cargador: primero se pide, después se pinta",
  "consigna": "Con la misma latencia de 1500 ms, pulsa «Reiniciar»: las dos peticiones salen a la vez y «Abriendo el taller…» dura la mitad que antes. Pulsa otro instrumento: la ficha de antes se queda, atenuada, arriba aparece el aviso «Cargando» con la dirección de destino y la línea «Dirección» no cambia hasta que llegan los datos. Por último, pulsa un instrumento y enseguida otro: en el registro, las peticiones del primero salen como canceladas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { crearRouter, Enlace, Pagina, ProveedorRouter, useDatos, useDireccion, useNavegacion } from './router'\nimport './estilos.css'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// El cargador de la ruta: pide todo lo que la página necesita, a la vez\nasync function cargarFicha({ parametros, signal }) {\n  const [instrumentos, instrumento] = await Promise.all([\n    pedirJson('/api/instrumentos', signal),\n    pedirJson(`/api/instrumentos/${parametros.id}`, signal),\n  ])\n  return { instrumentos, instrumento }\n}\n\n// Cuando se pinta, los datos ya están: ni useState, ni useEffect, ni «Cargando…»\nfunction Ficha() {\n  const { instrumentos, instrumento } = useDatos()\n\n  return (\n    <div className=\"dos-columnas\">\n      <ul>\n        {instrumentos.map((otro) => (\n          <li key={otro.id}>\n            <Enlace a={`/instrumentos/${otro.id}`}>{otro.nombre}</Enlace>\n          </li>\n        ))}\n      </ul>\n      <article>\n        <h2>{instrumento.nombre}</h2>\n        <p>\n          {instrumento.madera} · {instrumento.semanas} semanas · {instrumento.precio} €\n        </p>\n      </article>\n    </div>\n  )\n}\n\nconst router = crearRouter(\n  [\n    { ruta: '/instrumentos/:id', cargador: cargarFicha, Componente: Ficha },\n    { ruta: '*', Componente: () => <h2>Página no encontrada</h2> },\n  ],\n  '/instrumentos/1',\n)\n\nfunction Maquetacion() {\n  const navegacion = useNavegacion()\n  const direccion = useDireccion()\n\n  return (\n    <>\n      <header>\n        <h1>Taller El Clavijero</h1>\n        <p className=\"direccion\">Dirección: {direccion}</p>\n        <p role=\"status\">{navegacion.estado === 'cargando' ? `Cargando ${navegacion.destino}…` : ''}</p>\n      </header>\n      <main aria-busy={navegacion.estado !== 'idle'}>\n        <Pagina />\n      </main>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <ProveedorRouter router={router} mientrasCarga={<p className=\"cargando\">Abriendo el taller…</p>}>\n      <Maquetacion />\n    </ProveedorRouter>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "// Las piezas de React del router de juguete. Cada una lleva al lado su\n// equivalente en React Router.\nimport { createContext, useContext, useSyncExternalStore } from 'react'\n\nexport { crearRouter } from './motor' // createBrowserRouter\n\nconst RouterContext = createContext(null)\nRouterContext.displayName = 'Router'\n\n// RouterProvider: se suscribe al router y reparte su estado\nexport function ProveedorRouter({ router, mientrasCarga, children }) {\n  const estado = useSyncExternalStore(router.suscribir, router.leer)\n  if (!estado.pagina) return mientrasCarga // la primera carga (HydrateFallback)\n  return (\n    <RouterContext value={{ ...estado, navegar: router.navegar, enviar: router.enviar }}>{children}</RouterContext>\n  )\n}\n\n// Outlet + ErrorBoundary: la página de la ruta o, si algo falló, su página de error\nexport function Pagina() {\n  const { pagina } = useContext(RouterContext)\n  const Componente = pagina.error ? (pagina.ruta.Error ?? ErrorPorDefecto) : pagina.ruta.Componente\n  return <Componente />\n}\n\nfunction ErrorPorDefecto() {\n  const error = useErrorDeRuta()\n  return <p role=\"alert\">Error inesperado: {error.mensaje ?? error.message}</p>\n}\n\nexport const useDatos = () => useContext(RouterContext).pagina.datos // useLoaderData\nexport const useDatosAccion = () => useContext(RouterContext).pagina.datosAccion // useActionData\nexport const useErrorDeRuta = () => useContext(RouterContext).pagina.error // useRouteError\nexport const useNavegacion = () => useContext(RouterContext).navegacion // useNavigation\nexport const useDireccion = () => useContext(RouterContext).pagina.url // useLocation\n\nexport const redirigir = (destino) => ({ redirigirA: destino }) // redirect\nexport const respuestaDeError = (status, mensaje) => ({ esRespuesta: true, status, mensaje }) // data\nexport const esRespuestaDeError = (error) => error?.esRespuesta === true // isRouteErrorResponse\n\n// Link: cambia de página sin recargar\nexport function Enlace({ a, children }) {\n  const { pagina, navegar } = useContext(RouterContext)\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={pagina.url === a ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n\n// Form method=\"post\": un formulario normal cuyo envío gestiona el router\nexport function Formulario({ children, ...props }) {\n  const { pagina, enviar } = useContext(RouterContext)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    enviar(pagina.url, new FormData(e.currentTarget))\n  }\n\n  return (\n    <form {...props} onSubmit={manejarEnvio}>\n      {children}\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "motor.jsx",
      "codigo": "// El motor de un router de datos de juguete: vive fuera de React, como el\n// router que crea createBrowserRouter. No hace falta que lo leas entero.\n\n// '/instrumentos/:id' encaja con '/instrumentos/3' y da { id: '3' }; si no, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\nfunction buscar(rutas, destino) {\n  for (const ruta of rutas) {\n    const parametros = ruta.ruta === '*' ? {} : encajar(ruta.ruta, destino)\n    if (parametros) return { ruta, parametros }\n  }\n}\n\nexport function crearRouter(rutas, inicio) {\n  let estado = { pagina: null, navegacion: { estado: 'idle', destino: null } }\n  const oyentes = new Set()\n  let enCurso = null\n\n  function cambiar(cambios) {\n    estado = { ...estado, ...cambios }\n    oyentes.forEach((avisar) => avisar())\n  }\n\n  // Primero se cargan los datos; la página cambia cuando han llegado\n  async function navegar(destino, datosAccion) {\n    enCurso?.abort() // una navegación nueva cancela la que estaba a medias\n    const controlador = new AbortController()\n    enCurso = controlador\n    const { ruta, parametros } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'cargando', destino } })\n    let resultado\n    try {\n      resultado = { datos: await ruta.cargador?.({ parametros, signal: controlador.signal }) }\n    } catch (error) {\n      resultado = { error }\n    }\n    if (controlador.signal.aborted) return // llega tarde: ya se va a otra página\n    cambiar({\n      pagina: { url: destino, ruta, datosAccion, ...resultado },\n      navegacion: { estado: 'idle', destino: null },\n    })\n  }\n\n  // Se ejecuta la acción de la ruta y después se va adonde diga (redirigir)\n  // o se vuelve a cargar la misma página, con lo que devolvió la acción\n  async function enviar(destino, formData) {\n    enCurso?.abort()\n    const { ruta } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'enviando', destino } })\n    try {\n      if (!ruta.accion) throw new Error(`La ruta ${ruta.ruta} no tiene acción`)\n      const resultado = await ruta.accion({ formData })\n      if (resultado?.redirigirA) return navegar(resultado.redirigirA)\n      return navegar(destino, resultado)\n    } catch (error) {\n      cambiar({ pagina: { url: destino, ruta, error }, navegacion: { estado: 'idle', destino: null } })\n    }\n  }\n\n  navegar(inicio) // empieza a cargar antes de que React pinte nada\n  return {\n    navegar,\n    enviar,\n    suscribir(avisar) {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    leer: () => estado,\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #92400e;\n  background: #fffbeb;\n}\n\nheader h1 {\n  margin: 0;\n  font-size: 1.2rem;\n}\n\n.direccion {\n  margin: 0.25rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0.25rem 0 0;\n  color: #92400e;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.45;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.5rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.1rem;\n}\n\n.cargando {\n  color: #78716c;\n  font-style: italic;\n}\n\nbutton[aria-pressed='true'] {\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\n.error,\n[role='alert'] {\n  color: #b91c1c;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #d6d3d1;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "instrumentos": [
      {
        "id": 1,
        "nombre": "Guitarra flamenca de ciprés",
        "madera": "ciprés y abeto",
        "semanas": 10,
        "precio": 2400
      },
      {
        "id": 2,
        "nombre": "Guitarra clásica de cedro",
        "madera": "cedro y palosanto",
        "semanas": 14,
        "precio": 3100
      },
      {
        "id": 3,
        "nombre": "Laúd español",
        "madera": "arce y abeto",
        "semanas": 12,
        "precio": 1900
      },
      {
        "id": 4,
        "nombre": "Bandurria",
        "madera": "nogal y abeto",
        "semanas": 8,
        "precio": 1500
      }
    ],
    "encargos": [
      {
        "id": 6,
        "nombre": "Andrés Vílchez",
        "instrumento": "Laúd español"
      }
    ],
    "visitas": [
      {
        "id": 1,
        "autor": "Carmen",
        "mensaje": "Me dejasteis probar la bandurria. ¡Qué sonido!"
      },
      {
        "id": 2,
        "autor": "Óscar",
        "mensaje": "Volveré a por cuerdas nuevas para el laúd."
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Fíjate en `Ficha`: **ni `useState`, ni `useEffect`, ni «Cargando…»**. Cuando se ejecuta, los datos ya están. La espera no ha desaparecido, pero ahora ocurre antes de pintar, en un solo sitio, y la gestiona el router. Por eso tampoco hay carrera que arreglar: el motor guarda la navegación en curso y, si empieza otra, aborta la primera y descarta lo que traiga (las dos líneas de `navegar` que llevan comentario).

Una diferencia con React Router: aquí el cargador de la ficha pide también la lista, con un `Promise.all`, y la vuelve a pedir con cada instrumento. React Router lo resuelve con las rutas anidadas: la lista es el `loader` de la ruta madre y la ficha el de la hija, y él los lanza a la vez. Así queda el catálogo de verdad:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Link, Outlet, useLoaderData } from 'react-router'\nimport { pedirJson } from '../api.js'\nimport Favorito from './Favorito.jsx'\n\nexport async function cargarCatalogo({ request }) {\n  return { instrumentos: await pedirJson('/api/instrumentos', request.signal) }\n}\n\nexport default function Catalogo() {\n  const { instrumentos } = useLoaderData()\n\n  return (\n    <div className=\"dos-columnas\">\n      <ul>\n        {instrumentos.map((instrumento) => (\n          <li key={instrumento.id}>\n            <Link to={String(instrumento.id)}>{instrumento.nombre}</Link> <Favorito instrumento={instrumento} />\n          </li>\n        ))}\n      </ul>\n      <Outlet />\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export async function cargarCatalogo({ request }) {",
      "nota": "Un loader es una función normal, async si hace falta. Recibe params, con los segmentos dinámicos de la ruta (como useParams, y también como texto), y request, la petición de esta navegación."
    },
    {
      "fragmento": "request.signal",
      "nota": "Se aborta si el usuario se va a otra página antes de que esto termine. Pasándola a fetch, la petición se cancela de verdad. pedirJson, en api.js, es el fetch con la comprobación de respuesta.ok de la lección 78."
    },
    {
      "fragmento": "return { instrumentos:",
      "nota": "Lo que devuelve el loader es lo que recibirá el componente. Un objeto con nombre deja sitio para añadir más datos sin cambiar a quien los lee."
    },
    {
      "fragmento": "const { instrumentos } = useLoaderData()",
      "nota": "Los datos del loader de esta ruta. Cuando Catalogo se ejecuta ya han llegado: no hay undefined que comprobar."
    },
    {
      "fragmento": "<Outlet />",
      "nota": "Aquí va la ruta hija: el texto «Elige un instrumento» o la Ficha, que lee los suyos con su propio useLoaderData."
    }
  ]
}
```

Antes de ver qué pasó al ejecutarlo, una pregunta:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// La ficha tiene su loader, y el servidor tarda unos 800 ms en responder\n{ path: ':instrumentoId', loader: cargarFicha, Component: Ficha, ErrorBoundary: ErrorFicha }\n\n// Estás en /instrumentos/3, viendo la ficha del laúd.\n// Pulsas el enlace «Bandurria» de la lista.\n// ¿Qué hay en pantalla durante esos 800 ms?",
  "opciones": [
    "La ficha de la bandurria, vacía, y la dirección /instrumentos/4",
    "Un «Cargando…» en el sitio de la ficha, y la dirección /instrumentos/4",
    "La ficha del laúd y la dirección /instrumentos/3: la página y la URL cambian cuando llegan los datos",
    "Una pantalla en blanco hasta que llegan los datos"
  ],
  "correcta": 2,
  "explicacion": "React Router ejecuta el loader antes de tocar nada: siguen la página y la dirección del laúd, y cuando llegan los datos cambian las dos a la vez. Comprobado en Chromium con la 8.5.0: la URL pasó a /instrumentos/4 justo al llegar la respuesta. Si quieres que se note la espera, la pones tú con useNavigation; aquí la cabecera dice «Cargando…» y la página se atenúa."
}
```

Este es el registro de la app real con 800 ms de latencia: primero, desde la portada, un clic en el enlace al laúd; después, en la lista, un clic en la bandurria. Las flechas son las peticiones (`→` sale, `←` llega), `URL` es cuando cambia la dirección y `PANTALLA` resume lo que se ve: el aviso de la cabecera entre comillas, los títulos, los favoritos con `★` y «(atenuada)» si el contenido lleva `aria-busy`.

```text
    0 ms  CLIC «el laúd español», en la portada
   60 ms  → GET /api/instrumentos
   61 ms  → GET /api/instrumentos/3
   73 ms  PANTALLA  «Cargando…» · Taller El Clavijero · (atenuada)
  864 ms  ← /api/instrumentos 200
  864 ms  ← /api/instrumentos/3 200
  865 ms  URL /instrumentos/3
  899 ms  PANTALLA  lista de 4 instrumentos · Laúd español · ★ Laúd español
    0 ms  CLIC «Bandurria», en la lista
   18 ms  → GET /api/instrumentos/4
   34 ms  PANTALLA  «Cargando…» · lista de 4 instrumentos · Laúd español · ★ Laúd español · (atenuada)
  824 ms  ← /api/instrumentos/4 200
  825 ms  URL /instrumentos/4
  833 ms  PANTALLA  lista de 4 instrumentos · Bandurria · ★ Laúd español
```

Tres cosas que se ven en el registro:

- **Los dos `loader` salen a la vez.** Al ir de la portada al laúd encajan dos rutas, el catálogo y la ficha, y React Router lanza las dos peticiones a la vez, a los 60 y 61 ms. Sin cascada.
- **La página de antes se queda hasta que llega todo**, con el «Cargando…» y atenuada, y la URL cambia al final, junto con la página. Con el botón Atrás del navegador es al revés: la dirección la cambia el propio navegador al momento, y después se ejecutan los `loader` (comprobado).
- **Del laúd a la bandurria, solo se vuelve a pedir la ficha.** El `loader` del catálogo no se repite porque sus parámetros no han cambiado: es la revalidación por defecto de React Router, que tiene sus propias reglas y opciones.

Y si el usuario no espera: un clic en la guitarra flamenca, cuyo servidor tarda 1,5 s, y a los 200 ms otro en la clásica.

```text
    0 ms  CLIC «Guitarra flamenca de ciprés»
   44 ms  → GET /api/instrumentos/1
   58 ms  PANTALLA  «Cargando…» · lista de 4 instrumentos · ★ Laúd español · (atenuada)
  205 ms  CLIC «Guitarra clásica de cedro»
  250 ms  ✗ cancelada /api/instrumentos/1
  251 ms  → GET /api/instrumentos/2
  555 ms  ← /api/instrumentos/2 200
  556 ms  URL /instrumentos/2
  562 ms  PANTALLA  lista de 4 instrumentos · Guitarra clásica de cedro · ★ Laúd español
```

La petición de la flamenca se **cancela** en cuanto empieza la otra navegación, porque el `loader` pasa `request.signal` a `fetch`. Sin pasarla, la petición llega a terminar, pero da igual: lo comprobamos, y la pantalla siguió en la clásica, porque React Router descarta el resultado de una navegación interrumpida. Es la carrera de la lección 52, resuelta sin bandera `ignorar` ni limpieza. TanStack Query la resolverá de otra forma en la lección 78, con una entrada de caché por clave.

**Un `loader` no guarda nada.** Ir de la flamenca a la clásica y volver a la flamenca son tres peticiones, y un clic en el enlace de la página en la que ya estás vuelve a ejecutar todos sus `loader` (comprobado). Para tener una caché hace falta otra pieza, como TanStack Query.

## La interfaz pendiente: `useNavigation`

Como la página no cambia hasta que llegan los datos, **si no enseñas nada, el usuario pulsa un enlace y no ve ninguna reacción**. Puede pensar que no ha pulsado bien y volver a pulsar. `useNavigation` te dice si hay una navegación en curso, de cualquier parte de la app, para que lo enseñes donde quieras. En el taller va en la maquetación:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { NavLink, Outlet, useNavigation } from 'react-router'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Taller El Clavijero</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/\">Inicio</NavLink>\n          <NavLink to=\"/instrumentos\">Instrumentos</NavLink>\n          <NavLink to=\"/encargos/nuevo\">Encargar</NavLink>\n        </nav>\n        <p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const navigation = useNavigation()",
      "nota": "El estado de la navegación en curso, el mismo en toda la app. Es la pieza que en el router de juguete se llama useNavegacion."
    },
    {
      "fragmento": "<p role=\"status\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>",
      "nota": "Un aviso global. Con role=\"status\", un lector de pantalla lo anuncia sin mover el foco (lección 37)."
    },
    {
      "fragmento": "aria-busy={navigation.state !== 'idle'}",
      "nota": "La página de antes sigue en pantalla mientras tanto: aria-busy la marca como ocupada y el CSS la atenúa con main[aria-busy='true'] { opacity: 0.5 }."
    },
    {
      "fragmento": "<NavLink to=\"/instrumentos\">Instrumentos</NavLink>",
      "nota": "Un NavLink también se entera: mientras se cargan los datos de su destino, lleva la clase pending, además de active si toca (comprobado), y className y children reciben isPending."
    }
  ]
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "state: 'idle'",
      "texto": "No hay ninguna navegación en marcha. Es el valor normal."
    },
    {
      "titulo": "state: 'loading'",
      "texto": "Se están ejecutando los loader de la página siguiente. navigation.location dice adónde se va. También pasa después de un envío, mientras se vuelven a cargar los datos o se sigue una redirección."
    },
    {
      "titulo": "state: 'submitting'",
      "texto": "Se está ejecutando una action, porque se ha enviado un Form con method=\"post\". navigation.formData tiene los campos enviados, por si quieres pintar ya el resultado."
    },
    {
      "titulo": "Solo las navegaciones",
      "texto": "useNavigation no se entera de lo que hace un fetcher (lo verás al final de la lección): cada fetcher tiene su propio estado."
    }
  ]
}
```

¿Dónde poner el aviso? Depende de cuánto tarde. Un indicador en la cabecera y la página atenuada sirven para casi todo; si una página tarda varios segundos, puede tener sentido un esqueleto propio. Lo que no conviene es esconder la página de antes y dejar un hueco: el usuario pierde lo que estaba mirando sin ganar nada.

## Cuando algo falla: `ErrorBoundary`, `isRouteErrorResponse` y el 404 desde el `loader`

La lección 53 te enseñó que un error boundary de React captura lo que se rompe al renderizar, pero no lo que falla en código asíncrono. Un `loader` es justo eso: una función asíncrona que se ejecuta fuera del render. **El `ErrorBoundary` de una ruta recoge lo que lanzan su `loader`, su `action` y su componente**, y se pinta en el sitio del componente, dentro de la maquetación de su madre.

Y hay un caso que no es un fallo del código sino una respuesta: la dirección de un instrumento que no existe. En la lección 77, la ficha de un piso que ya no estaba la resolvía el propio componente con un `if`. Con un `loader`, la forma natural es **lanzar una respuesta 404**: el componente ni se ejecuta, porque no tendría nada que pintar.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { data, isRouteErrorResponse, useLoaderData, useRouteError } from 'react-router'\n\nexport async function cargarFicha({ params, request }) {\n  const respuesta = await fetch(`/api/instrumentos/${params.instrumentoId}`, { signal: request.signal })\n  if (respuesta.status === 404) {\n    throw data('Ese instrumento no está en el taller', { status: 404 })\n  }\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { instrumento: await respuesta.json() }\n}\n\nexport default function Ficha() {\n  const { instrumento } = useLoaderData()\n\n  return (\n    <article>\n      <h2>{instrumento.nombre}</h2>\n      <p>\n        {instrumento.madera} · {instrumento.semanas} semanas · {instrumento.precio} €\n      </p>\n    </article>\n  )\n}\n\nexport function ErrorFicha() {\n  const error = useRouteError()\n\n  if (isRouteErrorResponse(error) && error.status === 404) {\n    return (\n      <div>\n        <h2>Ese instrumento no existe</h2>\n        <p>{error.data}</p>\n      </div>\n    )\n  }\n  return <p role=\"alert\">No hemos podido cargar la ficha. Inténtalo de nuevo.</p>\n}",
  "anotaciones": [
    {
      "fragmento": "params.instrumentoId",
      "nota": "Los parámetros de la ruta llegan al loader en params, como texto (lección 77). Aquí van directos a la URL de la API."
    },
    {
      "fragmento": "throw data('Ese instrumento no está en el taller', { status: 404 })",
      "nota": "data(), de react-router, envuelve unos datos con un estado. Lanzado, corta el loader y React Router pinta el ErrorBoundary de esta ruta en vez de Ficha."
    },
    {
      "fragmento": "if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)",
      "nota": "Cualquier otro fallo, como un error normal. fetch no se rechaza con un 404 ni con un 500 (lección 78): sin esta línea, el loader devolvería el cuerpo del error como si fuera el instrumento."
    },
    {
      "fragmento": "const error = useRouteError()",
      "nota": "En el modo de datos, el ErrorBoundary no recibe props: lee el error con useRouteError. En el modo framework lo recibe como prop, error, que es como lo verás en el proyecto 98. Comprobado en el código de la 8.5.0: el modo de datos crea el componente sin props."
    },
    {
      "fragmento": "isRouteErrorResponse(error) && error.status === 404",
      "nota": "isRouteErrorResponse distingue una respuesta lanzada a propósito, con su status y su data, de un error de verdad, como una excepción."
    },
    {
      "fragmento": "<p>{error.data}</p>",
      "nota": "error.data es lo primero que le pasaste a data(): aquí, el mensaje."
    },
    {
      "fragmento": "<p role=\"alert\">No hemos podido cargar la ficha. Inténtalo de nuevo.</p>",
      "nota": "Para lo inesperado (un 500, la red caída), un aviso genérico. El mensaje técnico no le sirve a quien quiere un laúd."
    }
  ]
}
```

Comprobado en la app: en `/instrumentos/99`, la lista del catálogo sigue a la izquierda y en el sitio de la ficha sale «Ese instrumento no existe»; con el servidor respondiendo 500 a la ficha, el mismo sitio dice «No hemos podido cargar la ficha». **El error se queda en la ruta que lo tiene.** En cambio, cuando falló el `loader` del catálogo, que no tiene `ErrorBoundary` propio, el error subió al de la raíz, `ErrorGeneral`, y sustituyó la página entera, cabecera incluida. Es el «boundary más cercano» de la lección 53, aplicado a las rutas: pon cada `ErrorBoundary` en el nivel en el que quieras que se vea el error.

Un detalle que despista:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// En el loader:\nthrow data('Ese instrumento no está en el taller', { status: 404 })\n\n// En el ErrorBoundary de la ruta:\nconst error = useRouteError()\nreturn <h2>{error.status} {error.statusText}</h2>\n\n// ¿Qué título sale?",
  "opciones": [
    "404 Not Found",
    "404 Internal Server Error",
    "404, sin nada detrás",
    "Ninguno: un ErrorBoundary no puede leer el status"
  ],
  "correcta": 1,
  "explicacion": "Si no le das statusText, data() no lo deduce del número: React Router 8.5.0 pone «Internal Server Error» también con un 404 (comprobado, y es lo que hace su código). Con new Response(…, { status: 404 }) sale vacío. Usa error.status y error.data, que son tuyos, o pasa statusText: 'Not Found' en las opciones de data()."
}
```

¿Y si no pones ningún `ErrorBoundary`? React Router trae uno por defecto que sustituye **toda** la app. Esto es lo que pintó con el 404 de `/instrumentos/99`:

```text
Unexpected Application Error!
404 Internal Server Error
💿 Hey developer 👋
You can provide a way better UX than this when your app throws errors by providing your own ErrorBoundary or errorElement prop on your route.
```

Es decir: «error inesperado de la aplicación» y, para quien programa, que puede dar una experiencia mucho mejor con su propio `ErrorBoundary` o con `errorElement`, que es lo mismo en forma de elemento. Además, la consola dice `Error handled by React Router default ErrorBoundary:` con el error. Es una red de seguridad para el desarrollo: **pon al menos un `ErrorBoundary` en la ruta raíz.**

## `action` y `<Form>`: enviar sin escribir el `onSubmit`

En las lecciones 57 a 61 enviaste formularios con una función en el `action` de un `<form>` de React. React Router tiene su propia versión, pegada a las rutas: **un `<Form method="post">` envía sus campos a la `action` de su ruta, y cuando la `action` termina, el router redirige o vuelve a ejecutar los `loader` de la página.** Tú no escribes ni el `onSubmit`, ni el `preventDefault`, ni la recarga de los datos.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { data, Form, redirect, useActionData, useLoaderData, useNavigation } from 'react-router'\nimport { pedirJson } from '../api.js'\n\nexport async function cargarOpciones({ request }) {\n  return { instrumentos: await pedirJson('/api/instrumentos', request.signal) }\n}\n\nexport async function crearEncargo({ request }) {\n  const formData = await request.formData()\n  const nombre = String(formData.get('nombre')).trim()\n  if (!nombre) {\n    return data({ errores: { nombre: 'Escribe tu nombre para el encargo.' } }, { status: 400 })\n  }\n\n  const respuesta = await fetch('/api/encargos', {\n    method: 'POST',\n    body: JSON.stringify({ nombre, instrumento: formData.get('instrumento') }),\n  })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  const encargo = await respuesta.json()\n  return redirect(`/encargos/${encargo.id}`)\n}\n\nexport default function NuevoEncargo() {\n  const { instrumentos } = useLoaderData()\n  const actionData = useActionData()\n  const navigation = useNavigation()\n  const enviando = navigation.state === 'submitting'\n  const error = actionData?.errores?.nombre\n\n  return (\n    <Form method=\"post\">\n      <h2>Encarga tu instrumento</h2>\n      <label>\n        Tu nombre\n        <input name=\"nombre\" aria-invalid={error ? true : undefined} aria-describedby={error ? 'error-nombre' : undefined} />\n      </label>\n      {error && (\n        <p id=\"error-nombre\" role=\"alert\">\n          {error}\n        </p>\n      )}\n      <label>\n        Instrumento\n        <select name=\"instrumento\">\n          {instrumentos.map((instrumento) => (\n            <option key={instrumento.id}>{instrumento.nombre}</option>\n          ))}\n        </select>\n      </label>\n      <button disabled={enviando}>{enviando ? 'Enviando…' : 'Encargar'}</button>\n    </Form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export async function crearEncargo({ request }) {",
      "nota": "La action de la ruta. Se ejecuta cuando se le envía un formulario con method=\"post\". Recibe la misma request que un loader, ahora con cuerpo."
    },
    {
      "fragmento": "const formData = await request.formData()",
      "nota": "Los campos del formulario, por su name, en un FormData: la API de siempre del navegador."
    },
    {
      "fragmento": "return data({ errores: { nombre: 'Escribe tu nombre para el encargo.' } }, { status: 400 })",
      "nota": "Los errores de validación se devuelven, no se lanzan: el formulario sigue en pantalla y los recibe con useActionData. Con un 400, React Router entiende que nada ha cambiado en el servidor y no vuelve a ejecutar el loader (comprobado). Devueltos sin estado, que es un 200, sí lo vuelve a ejecutar."
    },
    {
      "fragmento": "return redirect(`/encargos/${encargo.id}`)",
      "nota": "Si todo va bien, a la página del encargo. El router ejecuta el loader de esa ruta y después cambia la página y la URL."
    },
    {
      "fragmento": "const actionData = useActionData()",
      "nota": "Lo que devolvió la action la última vez, o undefined si no se ha enviado nada."
    },
    {
      "fragmento": "const enviando = navigation.state === 'submitting'",
      "nota": "El mismo useNavigation de la maquetación, aquí para el botón: desactivado y con otro texto mientras la action trabaja."
    },
    {
      "fragmento": "<Form method=\"post\">",
      "nota": "Pinta un form de verdad. Al enviarlo, React Router intercepta el envío, hace con los campos una petición POST y se la da a la action de la ruta en la que está el formulario."
    },
    {
      "fragmento": "<input name=\"nombre\"",
      "nota": "Sin value ni onChange: un campo no controlado (lección 22). Lo que importa es el name, que es la clave en el FormData."
    }
  ]
}
```

Primero se envía el formulario con el nombre vacío; después, con «Lucía Garrido». Latencia de 400 ms:

```text
    0 ms  CLIC «Encargar» con el nombre vacío
   67 ms  PANTALLA  Encarga tu instrumento · alerta: Escribe tu nombre para el encargo. · botón «Encargar»
    0 ms  CLIC «Encargar» con nombre
   48 ms  → POST /api/encargos
   50 ms  PANTALLA  Encarga tu instrumento · alerta: Escribe tu nombre para el encargo. · botón «Enviando…» · (atenuada)
  451 ms  ← /api/encargos 201
  455 ms  → GET /api/encargos/7
  460 ms  PANTALLA  «Cargando…» · Encarga tu instrumento · alerta: Escribe tu nombre para el encargo. · botón «Encargar» · (atenuada)
  863 ms  ← /api/encargos/7 200
  865 ms  URL /encargos/7
  870 ms  PANTALLA  Encargo nº 7 recibido
history.length: 2 → 3
    0 ms  ATRÁS
    5 ms  URL /encargos/nuevo (Atrás)
    6 ms  → GET /api/instrumentos
    8 ms  PANTALLA  «Cargando…» · Encargo nº 7 recibido · (atenuada)
  410 ms  ← /api/instrumentos 200
  412 ms  PANTALLA  Encarga tu instrumento · botón «Encargar»
Tu nombre tras Atrás: ""
```

Lo que dice el registro, y lo que se comprobó además:

- **El envío con errores no hace ninguna petición**: la `action` valida antes de llamar a la API, devuelve el 400 y el formulario enseña el aviso. Ningún `loader` se vuelve a ejecutar.
- **El envío bueno pasa por dos estados**: `submitting` mientras va el POST (el botón dice «Enviando…») y `loading` mientras se carga el encargo nuevo (la cabecera dice «Cargando…»). La URL cambia al final, como en cualquier navegación.
- **Una sola entrada nueva en el historial**, la del encargo. Atrás vuelve al formulario, vacío y con su `loader` ejecutado otra vez, y no reenvía nada.
- **Sin `method`, un `Form` envía con GET**, como un formulario de HTML: comprobado, la dirección pasó a `/encargos/nuevo?nombre=&instrumento=…`, se ejecutó el `loader` y la `action` ni se enteró.

En el router de juguete, el mismo formulario. Los campos los recoge `Formulario`, el `<Form>` del juguete, la acción va en la ruta (`accion`) y `redirigir` hace de `redirect`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una acción en la ruta y un formulario sin onSubmit",
  "consigna": "Pulsa «Encargar» sin escribir nada: la acción devuelve el error y el formulario lo enseña. Escribe tu nombre y encarga: el botón pasa a «Enviando…», en el registro de red salen el POST y después el GET del encargo, y la dirección cambia a /encargos/7. Busca en App.jsx un onSubmit, un preventDefault o un useState: no hay ninguno. El envío lo hace Formulario, en router.jsx.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import {\n  crearRouter,\n  Enlace,\n  Formulario,\n  Pagina,\n  ProveedorRouter,\n  redirigir,\n  useDatos,\n  useDatosAccion,\n  useDireccion,\n  useNavegacion,\n} from './router'\nimport './estilos.css'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// La acción de la ruta: recibe los campos del formulario y decide qué pasa\nasync function crearEncargo({ formData }) {\n  const nombre = formData.get('nombre').trim()\n  if (!nombre) return { errores: { nombre: 'Escribe tu nombre para el encargo.' } }\n\n  const respuesta = await fetch('/api/encargos', {\n    method: 'POST',\n    body: JSON.stringify({ nombre, instrumento: formData.get('instrumento') }),\n  })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  const encargo = await respuesta.json()\n  return redirigir(`/encargos/${encargo.id}`)\n}\n\nfunction NuevoEncargo() {\n  const instrumentos = useDatos()\n  const datosAccion = useDatosAccion()\n  const { estado } = useNavegacion()\n  const error = datosAccion?.errores?.nombre\n\n  return (\n    <Formulario>\n      <h2>Encarga tu instrumento</h2>\n      <label>\n        Tu nombre\n        <input name=\"nombre\" aria-invalid={error ? true : undefined} aria-describedby={error ? 'error-nombre' : undefined} />\n      </label>\n      {error && (\n        <p id=\"error-nombre\" role=\"alert\">\n          {error}\n        </p>\n      )}\n      <label>\n        Instrumento\n        <select name=\"instrumento\">\n          {instrumentos.map((instrumento) => (\n            <option key={instrumento.id}>{instrumento.nombre}</option>\n          ))}\n        </select>\n      </label>\n      <button disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Encargar'}</button>\n    </Formulario>\n  )\n}\n\nfunction Encargo() {\n  const encargo = useDatos()\n  return (\n    <>\n      <h2>Encargo nº {encargo.id} recibido</h2>\n      <p>\n        {encargo.nombre}: {encargo.instrumento}. Te llamaremos para elegir las maderas.\n      </p>\n      <Enlace a=\"/encargos/nuevo\">Hacer otro encargo</Enlace>\n    </>\n  )\n}\n\nconst router = crearRouter(\n  [\n    {\n      ruta: '/encargos/nuevo',\n      cargador: ({ signal }) => pedirJson('/api/instrumentos', signal),\n      accion: crearEncargo,\n      Componente: NuevoEncargo,\n    },\n    {\n      ruta: '/encargos/:id',\n      cargador: ({ parametros, signal }) => pedirJson(`/api/encargos/${parametros.id}`, signal),\n      Componente: Encargo,\n    },\n  ],\n  '/encargos/nuevo',\n)\n\nfunction Maquetacion() {\n  const navegacion = useNavegacion()\n  const direccion = useDireccion()\n  const avisos = { cargando: `Cargando ${navegacion.destino}…`, enviando: 'Enviando el formulario…' }\n\n  return (\n    <>\n      <header>\n        <h1>Taller El Clavijero</h1>\n        <p className=\"direccion\">Dirección: {direccion}</p>\n        <p role=\"status\">{avisos[navegacion.estado] ?? ''}</p>\n      </header>\n      <main aria-busy={navegacion.estado !== 'idle'}>\n        <Pagina />\n      </main>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <ProveedorRouter router={router} mientrasCarga={<p className=\"cargando\">Abriendo el taller…</p>}>\n      <Maquetacion />\n    </ProveedorRouter>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "// Las piezas de React del router de juguete. Cada una lleva al lado su\n// equivalente en React Router.\nimport { createContext, useContext, useSyncExternalStore } from 'react'\n\nexport { crearRouter } from './motor' // createBrowserRouter\n\nconst RouterContext = createContext(null)\nRouterContext.displayName = 'Router'\n\n// RouterProvider: se suscribe al router y reparte su estado\nexport function ProveedorRouter({ router, mientrasCarga, children }) {\n  const estado = useSyncExternalStore(router.suscribir, router.leer)\n  if (!estado.pagina) return mientrasCarga // la primera carga (HydrateFallback)\n  return (\n    <RouterContext value={{ ...estado, navegar: router.navegar, enviar: router.enviar }}>{children}</RouterContext>\n  )\n}\n\n// Outlet + ErrorBoundary: la página de la ruta o, si algo falló, su página de error\nexport function Pagina() {\n  const { pagina } = useContext(RouterContext)\n  const Componente = pagina.error ? (pagina.ruta.Error ?? ErrorPorDefecto) : pagina.ruta.Componente\n  return <Componente />\n}\n\nfunction ErrorPorDefecto() {\n  const error = useErrorDeRuta()\n  return <p role=\"alert\">Error inesperado: {error.mensaje ?? error.message}</p>\n}\n\nexport const useDatos = () => useContext(RouterContext).pagina.datos // useLoaderData\nexport const useDatosAccion = () => useContext(RouterContext).pagina.datosAccion // useActionData\nexport const useErrorDeRuta = () => useContext(RouterContext).pagina.error // useRouteError\nexport const useNavegacion = () => useContext(RouterContext).navegacion // useNavigation\nexport const useDireccion = () => useContext(RouterContext).pagina.url // useLocation\n\nexport const redirigir = (destino) => ({ redirigirA: destino }) // redirect\nexport const respuestaDeError = (status, mensaje) => ({ esRespuesta: true, status, mensaje }) // data\nexport const esRespuestaDeError = (error) => error?.esRespuesta === true // isRouteErrorResponse\n\n// Link: cambia de página sin recargar\nexport function Enlace({ a, children }) {\n  const { pagina, navegar } = useContext(RouterContext)\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={pagina.url === a ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n\n// Form method=\"post\": un formulario normal cuyo envío gestiona el router\nexport function Formulario({ children, ...props }) {\n  const { pagina, enviar } = useContext(RouterContext)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    enviar(pagina.url, new FormData(e.currentTarget))\n  }\n\n  return (\n    <form {...props} onSubmit={manejarEnvio}>\n      {children}\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "motor.jsx",
      "codigo": "// El motor de un router de datos de juguete: vive fuera de React, como el\n// router que crea createBrowserRouter. No hace falta que lo leas entero.\n\n// '/instrumentos/:id' encaja con '/instrumentos/3' y da { id: '3' }; si no, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\nfunction buscar(rutas, destino) {\n  for (const ruta of rutas) {\n    const parametros = ruta.ruta === '*' ? {} : encajar(ruta.ruta, destino)\n    if (parametros) return { ruta, parametros }\n  }\n}\n\nexport function crearRouter(rutas, inicio) {\n  let estado = { pagina: null, navegacion: { estado: 'idle', destino: null } }\n  const oyentes = new Set()\n  let enCurso = null\n\n  function cambiar(cambios) {\n    estado = { ...estado, ...cambios }\n    oyentes.forEach((avisar) => avisar())\n  }\n\n  // Primero se cargan los datos; la página cambia cuando han llegado\n  async function navegar(destino, datosAccion) {\n    enCurso?.abort() // una navegación nueva cancela la que estaba a medias\n    const controlador = new AbortController()\n    enCurso = controlador\n    const { ruta, parametros } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'cargando', destino } })\n    let resultado\n    try {\n      resultado = { datos: await ruta.cargador?.({ parametros, signal: controlador.signal }) }\n    } catch (error) {\n      resultado = { error }\n    }\n    if (controlador.signal.aborted) return // llega tarde: ya se va a otra página\n    cambiar({\n      pagina: { url: destino, ruta, datosAccion, ...resultado },\n      navegacion: { estado: 'idle', destino: null },\n    })\n  }\n\n  // Se ejecuta la acción de la ruta y después se va adonde diga (redirigir)\n  // o se vuelve a cargar la misma página, con lo que devolvió la acción\n  async function enviar(destino, formData) {\n    enCurso?.abort()\n    const { ruta } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'enviando', destino } })\n    try {\n      if (!ruta.accion) throw new Error(`La ruta ${ruta.ruta} no tiene acción`)\n      const resultado = await ruta.accion({ formData })\n      if (resultado?.redirigirA) return navegar(resultado.redirigirA)\n      return navegar(destino, resultado)\n    } catch (error) {\n      cambiar({ pagina: { url: destino, ruta, error }, navegacion: { estado: 'idle', destino: null } })\n    }\n  }\n\n  navegar(inicio) // empieza a cargar antes de que React pinte nada\n  return {\n    navegar,\n    enviar,\n    suscribir(avisar) {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    leer: () => estado,\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #92400e;\n  background: #fffbeb;\n}\n\nheader h1 {\n  margin: 0;\n  font-size: 1.2rem;\n}\n\n.direccion {\n  margin: 0.25rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0.25rem 0 0;\n  color: #92400e;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.45;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.5rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.1rem;\n}\n\n.cargando {\n  color: #78716c;\n  font-style: italic;\n}\n\nbutton[aria-pressed='true'] {\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\n.error,\n[role='alert'] {\n  color: #b91c1c;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #d6d3d1;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "instrumentos": [
      {
        "id": 1,
        "nombre": "Guitarra flamenca de ciprés",
        "madera": "ciprés y abeto",
        "semanas": 10,
        "precio": 2400
      },
      {
        "id": 2,
        "nombre": "Guitarra clásica de cedro",
        "madera": "cedro y palosanto",
        "semanas": 14,
        "precio": 3100
      },
      {
        "id": 3,
        "nombre": "Laúd español",
        "madera": "arce y abeto",
        "semanas": 12,
        "precio": 1900
      },
      {
        "id": 4,
        "nombre": "Bandurria",
        "madera": "nogal y abeto",
        "semanas": 8,
        "precio": 1500
      }
    ],
    "encargos": [
      {
        "id": 6,
        "nombre": "Andrés Vílchez",
        "instrumento": "Laúd español"
      }
    ],
    "visitas": [
      {
        "id": 1,
        "autor": "Carmen",
        "mensaje": "Me dejasteis probar la bandurria. ¡Qué sonido!"
      },
      {
        "id": 2,
        "autor": "Óscar",
        "mensaje": "Volveré a por cuerdas nuevas para el laúd."
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Dos acciones que se llaman igual",
  "contenido": "La Action de React de la lección 57 es una función que pasas a <form action={...}>, y React la ejecuta en una transición. La action de React Router es una propiedad de la ruta: <Form method=\"post\"> envía los campos como una petición y el router se encarga de lo que viene después, cargar datos o redirigir. Son dos mecanismos distintos: en una app con React Router en modo de datos, los formularios que cambian datos suelen ir por el de la ruta."
}
```

`redirect` no es solo para las `action`. **Un `loader` también puede lanzarlo** para mandar a otra página antes de pintar nada: `throw redirect('/entrar')` en el `loader` de una zona privada. Comprobado: al navegar a una ruta cuyo `loader` lanza `redirect('/instrumentos')`, se acaba en `/instrumentos` con una sola entrada nueva en el historial, como si nunca se hubiera pasado por la otra. Es la base de las rutas protegidas de la lección «Autenticación en una SPA: sesión, rutas protegidas y dónde guardar el token».

## `useFetcher`: enviar o cargar sin navegar

Un `<Form>` es una navegación: cambia la URL, añade una entrada al historial y ocupa el estado global de `useNavigation`. Para la estrella de favoritos de cada instrumento no quieres nada de eso: el usuario tiene que seguir donde estaba, y poder marcar tres estrellas seguidas sin que cada una espere a la anterior. Para eso está **`useFetcher`: un envío (o una carga) con su propio estado, que no navega.**

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// paginas/favorito.js\nexport async function cambiarFavorito({ params, request }) {\n  const formData = await request.formData()\n  const respuesta = await fetch(`/api/instrumentos/${params.instrumentoId}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ favorito: formData.get('favorito') === 'true' }),\n  })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { ok: true }\n}\n\n// paginas/Favorito.jsx\nimport { useFetcher } from 'react-router'\n\nexport default function Favorito({ instrumento }) {\n  const fetcher = useFetcher()\n  // Mientras se envía, lo que se ha pedido; después, lo que diga el servidor\n  const favorito = fetcher.formData ? fetcher.formData.get('favorito') === 'true' : instrumento.favorito\n\n  return (\n    <fetcher.Form method=\"post\" action={`/instrumentos/${instrumento.id}/favorito`}>\n      <input type=\"hidden\" name=\"favorito\" value={String(!favorito)} />\n      <button aria-label={`Favorito: ${instrumento.nombre}`} aria-pressed={favorito}>\n        {favorito ? '★' : '☆'}\n      </button>\n    </fetcher.Form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export async function cambiarFavorito({ params, request }) {",
      "nota": "La action de la ruta de favoritos, la que no tiene componente. Hace el PATCH y devuelve algo pequeño: aquí no hay ningún sitio al que redirigir."
    },
    {
      "fragmento": "const fetcher = useFetcher()",
      "nota": "Cada estrella tiene su propio fetcher, con su propio estado. Dos estrellas pulsadas seguidas son dos envíos independientes."
    },
    {
      "fragmento": "fetcher.formData ? fetcher.formData.get('favorito') === 'true' : instrumento.favorito",
      "nota": "La interfaz optimista: mientras se envía, fetcher.formData tiene lo que se ha pedido y la estrella cambia al instante. Al terminar, manda otra vez lo que diga el servidor. La misma idea que useOptimistic (lección 60)."
    },
    {
      "fragmento": "<fetcher.Form method=\"post\" action={`/instrumentos/${instrumento.id}/favorito`}>",
      "nota": "Como Form, pero sin navegar. action dice a qué ruta se envía: aquí, la ruta que solo tiene action."
    },
    {
      "fragmento": "<input type=\"hidden\" name=\"favorito\" value={String(!favorito)} />",
      "nota": "Lo que se envía: lo contrario de lo que hay ahora. Un campo oculto viaja en el FormData como cualquier otro."
    },
    {
      "fragmento": "aria-pressed={favorito}",
      "nota": "Un botón que se queda pulsado o no, con un nombre fijo: el lector de pantalla dice si está activado."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Estás en /instrumentos/3, la ficha del laúd, con la lista al lado.\n// Pulsas la estrella de la bandurria:\n<fetcher.Form method=\"post\" action=\"/instrumentos/4/favorito\">…</fetcher.Form>\n\n// La action hace su PATCH y devuelve { ok: true }.\n// ¿Qué pasa con la dirección, el historial y los loader de la página?",
  "opciones": [
    "La dirección pasa a /instrumentos/4/favorito y Atrás vuelve a la ficha del laúd",
    "Nada cambia de sitio y no se vuelve a ejecutar ningún loader: la estrella solo cambia en pantalla",
    "La dirección y el historial no cambian, pero los loader de la página (el catálogo y la ficha) se vuelven a ejecutar",
    "La dirección no cambia, pero se añade una entrada al historial"
  ],
  "correcta": 2,
  "explicacion": "Un fetcher no navega: la URL siguió en /instrumentos/3 y history.length no cambió (comprobado). Pero, como con un Form, una action que va bien hace que React Router vuelva a cargar los datos de la página: justo después del PATCH salen los GET del catálogo y de la ficha. Así la lista enseña lo que dice el servidor sin que la actualices a mano."
}
```

El registro, con 600 ms de latencia:

```text
    0 ms  CLIC ☆ de «Bandurria»
   56 ms  → PATCH /api/instrumentos/4
   59 ms  PANTALLA  lista de 4 instrumentos · Laúd español · ★ Laúd español, Bandurria
  661 ms  ← /api/instrumentos/4 200
  662 ms  → GET /api/instrumentos
  663 ms  → GET /api/instrumentos/3
 1268 ms  ← /api/instrumentos 200
 1268 ms  ← /api/instrumentos/3 200
URL: /instrumentos/3 · history.length: 2 → 2
```

La estrella se enciende a los 59 ms, mucho antes de que llegue la respuesta del PATCH: es el `fetcher.formData`. La cabecera **no** dice «Cargando…» en ningún momento, porque no hay navegación. El estado está en el propio fetcher: con un `useEffect` que lo apuntaba, se vio pasar `fetcher.state` de `idle` a `submitting` mientras iba el PATCH, a `loading` mientras se volvían a cargar los datos de la página y otra vez a `idle`, con `fetcher.data` valiendo `{"ok":true}`, lo que devolvió la `action`.

Un fetcher también **carga sin navegar**: `fetcher.load('/ruta')` ejecuta el `loader` de esa ruta y deja el resultado en `fetcher.data`, sin cambiar de página. Es lo que usa la guía de React Router para un buscador con sugerencias, y su documentación sobre condiciones de carrera explica que un envío nuevo del mismo fetcher cancela el anterior.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de usar React Router con datos",
  "roles": [
    {
      "etiqueta": "Declarativo + TanStack Query",
      "rol": "Los datos los gestiona una caché",
      "descripcion": "El router solo decide qué se pinta, y cada componente lee sus datos de la caché (lección 78). Es lo que hace esta web."
    },
    {
      "etiqueta": "Modo de datos",
      "rol": "Cada ruta carga y recibe lo suyo",
      "descripcion": "Una SPA con Vite con pantallas que leen datos y formularios que los cambian: paneles de gestión, herramientas internas, la tienda del taller."
    },
    {
      "etiqueta": "Modo framework",
      "rol": "El de datos, con un plugin de Vite",
      "descripcion": "Si quieres renderizar en el servidor, prerenderizar o partir el código por rutas sin configurarlo. Lección 90 y proyecto 98."
    }
  ]
}
```

La documentación de React, en su guía para montar una app desde cero, recomienda pedir los datos en los `loader` del router o en el servidor siempre que se pueda, precisamente para evitar las cascadas de pedir dentro de los componentes. Y las dos ideas no se excluyen: un `loader` puede leer de la caché de TanStack Query, aunque eso ya va más allá de esta lección.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un loader siempre se ejecuta en el servidor",
      "realidad": "En el modo de datos, en una app de Vite, se ejecuta en el navegador: es una función de tu JavaScript que React Router llama antes de pintar. En el modo framework con renderizado en el servidor, sí corre allí (proyecto 98)."
    },
    {
      "mito": "La action de React Router es la Action de React de la lección 57",
      "realidad": "Comparten nombre. La de React es una función que le pasas a un form; la de React Router es una propiedad de la ruta que recibe una petición con request.formData() y después de la cual el router recarga los datos o redirige."
    },
    {
      "mito": "Con loaders ya no hace falta TanStack Query",
      "realidad": "Un loader no guarda nada: ir y volver a una ficha son dos peticiones (comprobado). TanStack Query es una caché, con datos frescos y viejos, reintentos y peticiones compartidas. Resuelven cosas distintas y se pueden combinar."
    },
    {
      "mito": "El ErrorBoundary de una ruta es un error boundary de los de la lección 53",
      "realidad": "Pinta igual, pero también recoge lo que lanzan el loader y la action: código asíncrono y fuera del render, justo lo que un error boundary de React no ve."
    },
    {
      "mito": "Con un loader, la página ya no espera",
      "realidad": "Espera lo mismo, pero antes de pintar y sin cascadas. Si no enseñas nada con useNavigation, el usuario pulsa y no ve ningún cambio mientras tanto."
    }
  ]
}
```

## Errores típicos

**Usar los Hooks de datos con `<BrowserRouter>`.** Si copias un `useLoaderData` en una app con el router declarativo, la página se queda en blanco y la consola dice:

```text
useLoaderData must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.
```

Es decir: «useLoaderData tiene que usarse dentro de un router de datos». Pasa igual con `useActionData`, `useNavigation`, `useFetcher` y `<Form>`: todos necesitan un router creado con `createBrowserRouter` y pintado con `<RouterProvider>`.

**Crear el router dentro de un componente.**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// main.jsx\nfunction App() {\n  const router = createBrowserRouter(rutas)\n  return <RouterProvider router={router} />\n}\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)\n\n// Abres /instrumentos con npm run dev.\n// ¿Cuántas veces se pide /api/instrumentos?",
  "opciones": [
    "Una, igual que con el router fuera de App",
    "Dos: StrictMode ejecuta App dos veces y cada vez se crea un router que empieza a cargar",
    "Ninguna: el router no carga nada hasta que se monta RouterProvider",
    "Sin parar: cada carga vuelve a renderizar App"
  ],
  "correcta": 1,
  "explicacion": "createBrowserRouter empieza a cargar en cuanto se crea, sin esperar a React, y StrictMode llama dos veces a App en desarrollo (lección 12). Comprobado: dos routers creados y dos GET /api/instrumentos. Además, cualquier render de App fabricaría un router nuevo, con el historial y los datos a cero. La documentación lo dice: créalo una vez, fuera del árbol de React."
}
```

**Olvidar el `HydrateFallback`.** Sin él, mientras se ejecutan los `loader` de la primera carga no se pinta nada, y la consola avisa:

```text
No `HydrateFallback` element provided to render during initial hydration
```

Es decir: «no hay ningún elemento HydrateFallback que pintar durante la carga inicial». En una SPA, «hidratación» aquí significa solo la primera carga: ponlo en la ruta raíz.

**Un `<Form method="post">` en una ruta sin `action`.** El envío acaba en el `ErrorBoundary`, con un error de estado 405, «Method Not Allowed», y este mensaje en `error.data`:

```text
Error: You made a POST request to "/encargos/nuevo" but did not provide an `action` for route "0-3", so there is no way to handle the request.
```

Es decir: has hecho un POST a esa dirección, pero su ruta no tiene `action`, así que nadie puede atenderlo. El `"0-3"` es el identificador que React Router da a cada ruta según su posición en el árbol (la cuarta hija de la primera ruta). Si un `Form` envía adonde no esperabas, mira de qué ruta es: sin `action`, envía a la ruta en la que está.

**Lanzar los errores de validación.** Con `throw data({ errores }, { status: 400 })` en vez de `return`, el formulario desaparece: comprobado, como la ruta del encargo no tiene `ErrorBoundary` propio, el de la raíz sustituyó la página entera. La documentación lo dice así: los límites de error «are not intended for rendering form validation errors», no están pensados para los errores de validación de un formulario. Se devuelven.

**Un `<form>` en minúscula.** Sin la mayúscula, React Router no intercepta nada y el navegador hace un POST de verdad a tu servidor. Con `npm run dev`, Vite respondió `404` a ese POST y la página se quedó en blanco, con todo el estado de la app perdido (comprobado). El servidor de Vite solo devuelve el `index.html` de la SPA a las peticiones GET (lección 85).

**No comprobar `respuesta.ok` en el `loader`.** `fetch` no falla con un 404: el `loader` devuelve el cuerpo del error, `{ error: '…' }`, y el componente intenta pintar un instrumento sin nombre. Es justo el punto de partida del primer ejercicio.

## Ejercicios

Los dos usan el router de juguete: `router.jsx` y `motor.jsx` no hay que tocarlos. Todo el trabajo va en `App.jsx`, marcado con comentarios numerados.

**1. La ficha que ya no existe.** Alguien guardó hace tiempo el enlace al guitarrico, un instrumento que el taller ya no hace. Ahora esa dirección enseña una ficha vacía.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha que ya no existe",
  "consigna": "Pulsa el enlace antiguo del pie: sale una ficha sin nombre. En App.jsx: 1) en cargarFicha, con un 404 lanza respuestaDeError(404, 'Ese instrumento no está en el taller') y, con otra respuesta que no sea ok, un Error; 2) escribe ErrorFicha como dice su comentario; 3) dale a la ruta de la ficha su página de error. Para probar el fallo del servidor, abre un instrumento después de pulsar «Fallar la siguiente petición».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { crearRouter, Enlace, Pagina, ProveedorRouter, useDatos, useErrorDeRuta, esRespuestaDeError, respuestaDeError } from './router'\nimport './estilos.css'\n\nasync function cargarCatalogo({ signal }) {\n  const respuesta = await fetch('/api/instrumentos', { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction Catalogo() {\n  const instrumentos = useDatos()\n  return (\n    <>\n      <h2>Instrumentos</h2>\n      <ul>\n        {instrumentos.map((instrumento) => (\n          <li key={instrumento.id}>\n            <Enlace a={`/instrumentos/${instrumento.id}`}>{instrumento.nombre}</Enlace>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\n// 1. Con un 404, lanza respuestaDeError(404, 'Ese instrumento no está en el taller').\n//    Con cualquier otra respuesta que no sea ok, lanza un Error.\nasync function cargarFicha({ parametros, signal }) {\n  const respuesta = await fetch(`/api/instrumentos/${parametros.id}`, { signal })\n  return respuesta.json()\n}\n\nfunction Ficha() {\n  const instrumento = useDatos()\n  return (\n    <article>\n      <h2>{instrumento.nombre}</h2>\n      <p>\n        {instrumento.madera} · {instrumento.semanas} semanas · {instrumento.precio} €\n      </p>\n      <Enlace a=\"/instrumentos\">Volver al catálogo</Enlace>\n    </article>\n  )\n}\n\n// 2. Con un 404: un título «Ese instrumento no existe» y un Enlace\n//    «Ver todos los instrumentos» a /instrumentos. Con cualquier otro error:\n//    un párrafo con role=\"alert\" que diga «No hemos podido cargar la ficha».\nfunction ErrorFicha() {\n  return null\n}\n\nconst router = crearRouter(\n  [\n    { ruta: '/instrumentos', cargador: cargarCatalogo, Componente: Catalogo },\n    // 3. Dale a esta ruta su página de error: Error: ErrorFicha\n    { ruta: '/instrumentos/:id', cargador: cargarFicha, Componente: Ficha },\n    { ruta: '*', Componente: () => <h2>Página no encontrada</h2> },\n  ],\n  '/instrumentos',\n)\n\nexport default function App() {\n  return (\n    <ProveedorRouter router={router} mientrasCarga={<p className=\"cargando\">Abriendo el taller…</p>}>\n      <header>\n        <h1>Taller El Clavijero</h1>\n        <nav aria-label=\"Principal\">\n          <Enlace a=\"/instrumentos\">Instrumentos</Enlace>\n        </nav>\n      </header>\n      <main>\n        <Pagina />\n      </main>\n      <footer>\n        Un enlace antiguo que alguien guardó: <Enlace a=\"/instrumentos/99\">Guitarrico (retirado)</Enlace>\n      </footer>\n    </ProveedorRouter>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "// Las piezas de React del router de juguete. Cada una lleva al lado su\n// equivalente en React Router.\nimport { createContext, useContext, useSyncExternalStore } from 'react'\n\nexport { crearRouter } from './motor' // createBrowserRouter\n\nconst RouterContext = createContext(null)\nRouterContext.displayName = 'Router'\n\n// RouterProvider: se suscribe al router y reparte su estado\nexport function ProveedorRouter({ router, mientrasCarga, children }) {\n  const estado = useSyncExternalStore(router.suscribir, router.leer)\n  if (!estado.pagina) return mientrasCarga // la primera carga (HydrateFallback)\n  return (\n    <RouterContext value={{ ...estado, navegar: router.navegar, enviar: router.enviar }}>{children}</RouterContext>\n  )\n}\n\n// Outlet + ErrorBoundary: la página de la ruta o, si algo falló, su página de error\nexport function Pagina() {\n  const { pagina } = useContext(RouterContext)\n  const Componente = pagina.error ? (pagina.ruta.Error ?? ErrorPorDefecto) : pagina.ruta.Componente\n  return <Componente />\n}\n\nfunction ErrorPorDefecto() {\n  const error = useErrorDeRuta()\n  return <p role=\"alert\">Error inesperado: {error.mensaje ?? error.message}</p>\n}\n\nexport const useDatos = () => useContext(RouterContext).pagina.datos // useLoaderData\nexport const useDatosAccion = () => useContext(RouterContext).pagina.datosAccion // useActionData\nexport const useErrorDeRuta = () => useContext(RouterContext).pagina.error // useRouteError\nexport const useNavegacion = () => useContext(RouterContext).navegacion // useNavigation\nexport const useDireccion = () => useContext(RouterContext).pagina.url // useLocation\n\nexport const redirigir = (destino) => ({ redirigirA: destino }) // redirect\nexport const respuestaDeError = (status, mensaje) => ({ esRespuesta: true, status, mensaje }) // data\nexport const esRespuestaDeError = (error) => error?.esRespuesta === true // isRouteErrorResponse\n\n// Link: cambia de página sin recargar\nexport function Enlace({ a, children }) {\n  const { pagina, navegar } = useContext(RouterContext)\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={pagina.url === a ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n\n// Form method=\"post\": un formulario normal cuyo envío gestiona el router\nexport function Formulario({ children, ...props }) {\n  const { pagina, enviar } = useContext(RouterContext)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    enviar(pagina.url, new FormData(e.currentTarget))\n  }\n\n  return (\n    <form {...props} onSubmit={manejarEnvio}>\n      {children}\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "motor.jsx",
      "codigo": "// El motor de un router de datos de juguete: vive fuera de React, como el\n// router que crea createBrowserRouter. No hace falta que lo leas entero.\n\n// '/instrumentos/:id' encaja con '/instrumentos/3' y da { id: '3' }; si no, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\nfunction buscar(rutas, destino) {\n  for (const ruta of rutas) {\n    const parametros = ruta.ruta === '*' ? {} : encajar(ruta.ruta, destino)\n    if (parametros) return { ruta, parametros }\n  }\n}\n\nexport function crearRouter(rutas, inicio) {\n  let estado = { pagina: null, navegacion: { estado: 'idle', destino: null } }\n  const oyentes = new Set()\n  let enCurso = null\n\n  function cambiar(cambios) {\n    estado = { ...estado, ...cambios }\n    oyentes.forEach((avisar) => avisar())\n  }\n\n  // Primero se cargan los datos; la página cambia cuando han llegado\n  async function navegar(destino, datosAccion) {\n    enCurso?.abort() // una navegación nueva cancela la que estaba a medias\n    const controlador = new AbortController()\n    enCurso = controlador\n    const { ruta, parametros } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'cargando', destino } })\n    let resultado\n    try {\n      resultado = { datos: await ruta.cargador?.({ parametros, signal: controlador.signal }) }\n    } catch (error) {\n      resultado = { error }\n    }\n    if (controlador.signal.aborted) return // llega tarde: ya se va a otra página\n    cambiar({\n      pagina: { url: destino, ruta, datosAccion, ...resultado },\n      navegacion: { estado: 'idle', destino: null },\n    })\n  }\n\n  // Se ejecuta la acción de la ruta y después se va adonde diga (redirigir)\n  // o se vuelve a cargar la misma página, con lo que devolvió la acción\n  async function enviar(destino, formData) {\n    enCurso?.abort()\n    const { ruta } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'enviando', destino } })\n    try {\n      if (!ruta.accion) throw new Error(`La ruta ${ruta.ruta} no tiene acción`)\n      const resultado = await ruta.accion({ formData })\n      if (resultado?.redirigirA) return navegar(resultado.redirigirA)\n      return navegar(destino, resultado)\n    } catch (error) {\n      cambiar({ pagina: { url: destino, ruta, error }, navegacion: { estado: 'idle', destino: null } })\n    }\n  }\n\n  navegar(inicio) // empieza a cargar antes de que React pinte nada\n  return {\n    navegar,\n    enviar,\n    suscribir(avisar) {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    leer: () => estado,\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #92400e;\n  background: #fffbeb;\n}\n\nheader h1 {\n  margin: 0;\n  font-size: 1.2rem;\n}\n\n.direccion {\n  margin: 0.25rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0.25rem 0 0;\n  color: #92400e;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.45;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.5rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.1rem;\n}\n\n.cargando {\n  color: #78716c;\n  font-style: italic;\n}\n\nbutton[aria-pressed='true'] {\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\n.error,\n[role='alert'] {\n  color: #b91c1c;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #d6d3d1;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "instrumentos": [
      {
        "id": 1,
        "nombre": "Guitarra flamenca de ciprés",
        "madera": "ciprés y abeto",
        "semanas": 10,
        "precio": 2400
      },
      {
        "id": 2,
        "nombre": "Guitarra clásica de cedro",
        "madera": "cedro y palosanto",
        "semanas": 14,
        "precio": 3100
      },
      {
        "id": 3,
        "nombre": "Laúd español",
        "madera": "arce y abeto",
        "semanas": 12,
        "precio": 1900
      },
      {
        "id": 4,
        "nombre": "Bandurria",
        "madera": "nogal y abeto",
        "semanas": 8,
        "precio": 1500
      }
    ],
    "encargos": [
      {
        "id": 6,
        "nombre": "Andrés Vílchez",
        "instrumento": "Laúd español"
      }
    ],
    "visitas": [
      {
        "id": 1,
        "autor": "Carmen",
        "mensaje": "Me dejasteis probar la bandurria. ¡Qué sonido!"
      },
      {
        "id": 2,
        "autor": "Óscar",
        "mensaje": "Volveré a por cuerdas nuevas para el laúd."
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "La ficha de la bandurria enseña su nombre",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Bandurria"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Bandurria"
      }
    },
    {
      "descripcion": "El enlace antiguo del pie muestra «Ese instrumento no existe»",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Guitarrico (retirado)"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Ese instrumento no existe"
      }
    },
    {
      "descripcion": "Desde esa página de error se vuelve a la lista de instrumentos",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Guitarrico (retirado)"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Ver todos los instrumentos"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Instrumentos"
      }
    },
    {
      "descripcion": "Si el servidor falla al pedir una ficha, se avisa con «No hemos podido cargar la ficha»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Bandurria"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Laúd español"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No hemos podido cargar la ficha"
      }
    },
    {
      "descripcion": "Un instrumento que no existe no se anuncia como un fallo del servidor",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Guitarrico (retirado)"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Ese instrumento no existe"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert"
        }
      }
    }
  ]
}
```

**2. El libro de visitas.** El taller tiene un libro de visitas en la web. La lista ya se carga con su cargador; falta poder firmar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El libro de visitas del taller",
  "consigna": "Escribe la acción firmar y termina LibroDeVisitas siguiendo los comentarios numerados. La lista no la toques: después de cada envío, el router vuelve a ejecutar el cargador y la firma nueva aparece sola. Con la latencia del panel puedes ver el «Enviando…» con calma.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { crearRouter, Formulario, Pagina, ProveedorRouter, useDatos, useDatosAccion, useNavegacion } from './router'\nimport './estilos.css'\n\nasync function cargarVisitas({ signal }) {\n  const respuesta = await fetch('/api/visitas', { signal })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// 1. Si el mensaje, sin espacios a los lados, está vacío, devuelve\n//    { error: 'Escribe tu mensaje antes de firmar.' }. Si no, guarda la firma\n//    con un POST a /api/visitas con { autor, mensaje } (sin nombre, el autor\n//    es 'Anónimo'). La lista no la toques: el router la vuelve a cargar solo.\nasync function firmar({ formData }) {}\n\nfunction LibroDeVisitas() {\n  const visitas = useDatos()\n  // 2. Enseña el error que devuelve la acción en un párrafo con role=\"alert\".\n  // 3. Mientras se envía, el botón dice «Enviando…» y está desactivado.\n  // 4. El formulario no se vacía solo: dale una key que cambie cuando\n  //    cambia el número de firmas, para que se monte de nuevo, vacío.\n  return (\n    <>\n      <h2>Libro de visitas</h2>\n      <ul>\n        {visitas.map((visita) => (\n          <li key={visita.id}>\n            <strong>{visita.autor}:</strong> {visita.mensaje}\n          </li>\n        ))}\n      </ul>\n      <Formulario>\n        <label>\n          Tu nombre\n          <input name=\"autor\" />\n        </label>\n        <label>\n          Mensaje\n          <textarea name=\"mensaje\" />\n        </label>\n        <button>Firmar</button>\n      </Formulario>\n    </>\n  )\n}\n\nconst router = crearRouter(\n  [{ ruta: '/visitas', cargador: cargarVisitas, accion: firmar, Componente: LibroDeVisitas }],\n  '/visitas',\n)\n\nexport default function App() {\n  return (\n    <ProveedorRouter router={router} mientrasCarga={<p className=\"cargando\">Abriendo el libro…</p>}>\n      <header>\n        <h1>Taller El Clavijero</h1>\n      </header>\n      <main>\n        <Pagina />\n      </main>\n    </ProveedorRouter>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "// Las piezas de React del router de juguete. Cada una lleva al lado su\n// equivalente en React Router.\nimport { createContext, useContext, useSyncExternalStore } from 'react'\n\nexport { crearRouter } from './motor' // createBrowserRouter\n\nconst RouterContext = createContext(null)\nRouterContext.displayName = 'Router'\n\n// RouterProvider: se suscribe al router y reparte su estado\nexport function ProveedorRouter({ router, mientrasCarga, children }) {\n  const estado = useSyncExternalStore(router.suscribir, router.leer)\n  if (!estado.pagina) return mientrasCarga // la primera carga (HydrateFallback)\n  return (\n    <RouterContext value={{ ...estado, navegar: router.navegar, enviar: router.enviar }}>{children}</RouterContext>\n  )\n}\n\n// Outlet + ErrorBoundary: la página de la ruta o, si algo falló, su página de error\nexport function Pagina() {\n  const { pagina } = useContext(RouterContext)\n  const Componente = pagina.error ? (pagina.ruta.Error ?? ErrorPorDefecto) : pagina.ruta.Componente\n  return <Componente />\n}\n\nfunction ErrorPorDefecto() {\n  const error = useErrorDeRuta()\n  return <p role=\"alert\">Error inesperado: {error.mensaje ?? error.message}</p>\n}\n\nexport const useDatos = () => useContext(RouterContext).pagina.datos // useLoaderData\nexport const useDatosAccion = () => useContext(RouterContext).pagina.datosAccion // useActionData\nexport const useErrorDeRuta = () => useContext(RouterContext).pagina.error // useRouteError\nexport const useNavegacion = () => useContext(RouterContext).navegacion // useNavigation\nexport const useDireccion = () => useContext(RouterContext).pagina.url // useLocation\n\nexport const redirigir = (destino) => ({ redirigirA: destino }) // redirect\nexport const respuestaDeError = (status, mensaje) => ({ esRespuesta: true, status, mensaje }) // data\nexport const esRespuestaDeError = (error) => error?.esRespuesta === true // isRouteErrorResponse\n\n// Link: cambia de página sin recargar\nexport function Enlace({ a, children }) {\n  const { pagina, navegar } = useContext(RouterContext)\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={pagina.url === a ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n\n// Form method=\"post\": un formulario normal cuyo envío gestiona el router\nexport function Formulario({ children, ...props }) {\n  const { pagina, enviar } = useContext(RouterContext)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    enviar(pagina.url, new FormData(e.currentTarget))\n  }\n\n  return (\n    <form {...props} onSubmit={manejarEnvio}>\n      {children}\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "motor.jsx",
      "codigo": "// El motor de un router de datos de juguete: vive fuera de React, como el\n// router que crea createBrowserRouter. No hace falta que lo leas entero.\n\n// '/instrumentos/:id' encaja con '/instrumentos/3' y da { id: '3' }; si no, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\nfunction buscar(rutas, destino) {\n  for (const ruta of rutas) {\n    const parametros = ruta.ruta === '*' ? {} : encajar(ruta.ruta, destino)\n    if (parametros) return { ruta, parametros }\n  }\n}\n\nexport function crearRouter(rutas, inicio) {\n  let estado = { pagina: null, navegacion: { estado: 'idle', destino: null } }\n  const oyentes = new Set()\n  let enCurso = null\n\n  function cambiar(cambios) {\n    estado = { ...estado, ...cambios }\n    oyentes.forEach((avisar) => avisar())\n  }\n\n  // Primero se cargan los datos; la página cambia cuando han llegado\n  async function navegar(destino, datosAccion) {\n    enCurso?.abort() // una navegación nueva cancela la que estaba a medias\n    const controlador = new AbortController()\n    enCurso = controlador\n    const { ruta, parametros } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'cargando', destino } })\n    let resultado\n    try {\n      resultado = { datos: await ruta.cargador?.({ parametros, signal: controlador.signal }) }\n    } catch (error) {\n      resultado = { error }\n    }\n    if (controlador.signal.aborted) return // llega tarde: ya se va a otra página\n    cambiar({\n      pagina: { url: destino, ruta, datosAccion, ...resultado },\n      navegacion: { estado: 'idle', destino: null },\n    })\n  }\n\n  // Se ejecuta la acción de la ruta y después se va adonde diga (redirigir)\n  // o se vuelve a cargar la misma página, con lo que devolvió la acción\n  async function enviar(destino, formData) {\n    enCurso?.abort()\n    const { ruta } = buscar(rutas, destino)\n    cambiar({ navegacion: { estado: 'enviando', destino } })\n    try {\n      if (!ruta.accion) throw new Error(`La ruta ${ruta.ruta} no tiene acción`)\n      const resultado = await ruta.accion({ formData })\n      if (resultado?.redirigirA) return navegar(resultado.redirigirA)\n      return navegar(destino, resultado)\n    } catch (error) {\n      cambiar({ pagina: { url: destino, ruta, error }, navegacion: { estado: 'idle', destino: null } })\n    }\n  }\n\n  navegar(inicio) // empieza a cargar antes de que React pinte nada\n  return {\n    navegar,\n    enviar,\n    suscribir(avisar) {\n      oyentes.add(avisar)\n      return () => oyentes.delete(avisar)\n    },\n    leer: () => estado,\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #92400e;\n  background: #fffbeb;\n}\n\nheader h1 {\n  margin: 0;\n  font-size: 1.2rem;\n}\n\n.direccion {\n  margin: 0.25rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0.25rem 0 0;\n  color: #92400e;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.45;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1.5rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nh2 {\n  margin: 0 0 0.3rem;\n  font-size: 1.1rem;\n}\n\n.cargando {\n  color: #78716c;\n  font-style: italic;\n}\n\nbutton[aria-pressed='true'] {\n  font-weight: 700;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\n.error,\n[role='alert'] {\n  color: #b91c1c;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #d6d3d1;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "instrumentos": [
      {
        "id": 1,
        "nombre": "Guitarra flamenca de ciprés",
        "madera": "ciprés y abeto",
        "semanas": 10,
        "precio": 2400
      },
      {
        "id": 2,
        "nombre": "Guitarra clásica de cedro",
        "madera": "cedro y palosanto",
        "semanas": 14,
        "precio": 3100
      },
      {
        "id": 3,
        "nombre": "Laúd español",
        "madera": "arce y abeto",
        "semanas": 12,
        "precio": 1900
      },
      {
        "id": 4,
        "nombre": "Bandurria",
        "madera": "nogal y abeto",
        "semanas": 8,
        "precio": 1500
      }
    ],
    "encargos": [
      {
        "id": 6,
        "nombre": "Andrés Vílchez",
        "instrumento": "Laúd español"
      }
    ],
    "visitas": [
      {
        "id": 1,
        "autor": "Carmen",
        "mensaje": "Me dejasteis probar la bandurria. ¡Qué sonido!"
      },
      {
        "id": 2,
        "autor": "Óscar",
        "mensaje": "Volveré a por cuerdas nuevas para el laúd."
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Firmar sin mensaje avisa con «Escribe tu mensaje antes de firmar.»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Escribe tu mensaje antes de firmar."
      }
    },
    {
      "descripcion": "Una firma con mensaje aparece en la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Qué bien suena el laúd"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Qué bien suena el laúd"
      }
    },
    {
      "descripcion": "La firma lleva el nombre de quien la escribe",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Lucía"
          }
        },
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Volveré con mi hija"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Lucía: Volveré con mi hija"
      }
    },
    {
      "descripcion": "Sin nombre, la firma sale como «Anónimo»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Muy buena atención"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Anónimo: Muy buena atención"
      }
    },
    {
      "descripcion": "Mientras se envía, el botón dice «Enviando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Hasta pronto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Enviando…"
      }
    },
    {
      "descripcion": "Cuando la firma aparece en la lista, el mensaje queda vacío para la siguiente",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Mensaje",
            "texto": "Hasta pronto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Hasta pronto"
          }
        }
      ],
      "espera": {
        "etiqueta": "Mensaje",
        "valor": ""
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática), en un proyecto de Vite con React Router 8. Si no tienes una API a mano, los `loader` y las `action` pueden leer y escribir en un array en memoria, con un `await new Promise((r) => setTimeout(r, 800))` para simular la red y un `console.log` en cada uno para ver cuándo se ejecutan.

1. Monta El Clavijero en el modo de datos con las rutas de la lección: catálogo con su ficha anidada, el 404 del instrumento con `throw data()` y un `ErrorBoundary` en la raíz. Navega con la consola abierta y comprueba que los dos `loader` empiezan a la vez y que, de una ficha a otra, el del catálogo no se repite.
2. Pasa el libro de visitas del ejercicio 2 a React Router: `action` en la ruta, `<Form method="post">`, `useActionData` y `useNavigation`. Devuelve el error de validación primero sin estado y después con `data(…, { status: 400 })`, y mira en la consola cuándo se vuelve a ejecutar el `loader`.
3. Añade la estrella de favoritos con `useFetcher` y su `fetcher.formData`. Después haz que la `action` lance un error de vez en cuando y averigua qué pasa con la estrella y qué `ErrorBoundary` se pinta.
4. Una zona privada: una ruta `/taller/pedidos` cuyo `loader` lance `redirect('/entrar')` si no hay sesión (de momento, un valor en `localStorage`). La lección «Autenticación en una SPA: sesión, rutas protegidas y dónde guardar el token» lo hace con una sesión de verdad.

## Para profundizar

Esto es lo justo del modo de datos para que el proyecto 98 no estrene nada; el resto (el middleware, `lazy` por ruta, la revalidación a fondo, el modo framework con renderizado en el servidor, los tipos generados y cómo combinarlo con TanStack Query) tiene su sitio en el temario propio de React Router.

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Build a React app from Scratch: Data Fetching",
      "descripcion": "Por qué react.dev recomienda pedir los datos en los loader del router o en el servidor en vez de dentro de los componentes: las cascadas.",
      "url": "https://react.dev/learn/build-a-react-app-from-scratch#data-fetching",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Data Mode: Route Object",
      "descripcion": "Todo lo que puede llevar un objeto de ruta: Component, loader, action, shouldRevalidate, lazy, middleware y handle.",
      "url": "https://reactrouter.com/start/data/route-object",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Data Mode: Actions",
      "descripcion": "action, Form, useSubmit y fetcher.Form, useActionData y la recarga de datos después de un envío.",
      "url": "https://reactrouter.com/start/data/actions",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Error Boundaries",
      "descripcion": "El ErrorBoundary de la raíz, lanzar data() con un 404, los boundaries anidados y su versión para el modo de datos con useRouteError.",
      "url": "https://reactrouter.com/how-to/error-boundary",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Using Fetchers",
      "descripcion": "Enviar a una action y cargar de un loader sin navegar: estado pendiente, interfaz optimista y un buscador con sugerencias.",
      "url": "https://reactrouter.com/how-to/fetchers",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Race Conditions",
      "descripcion": "Cómo cancela React Router las navegaciones y los envíos interrumpidos, igual que hace el navegador con los documentos.",
      "url": "https://reactrouter.com/explanation/race-conditions",
      "etiqueta": "React Router"
    }
  ]
}
```
