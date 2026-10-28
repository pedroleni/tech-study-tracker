# Middleware y contexto del router

- **Módulo:** Más allá de cargar y enviar
- **Slug:** `middleware-y-contexto-del-router` (autogenerado del título)
- **Orden:** 100
- **Fuentes:** [Middleware](https://reactrouter.com/how-to/middleware) + [Route Object: middleware](https://reactrouter.com/start/data/route-object) + [createContext](https://reactrouter.com/api/utils/createContext) + [RouterContextProvider](https://reactrouter.com/api/utils/RouterContextProvider) + [createBrowserRouter: getContext](https://reactrouter.com/api/data-routers/createBrowserRouter) — ver `contenido/react-router/TEMARIO.md` #10
- **Requiere:** El módulo 2 de esta ficha (lecciones 2 a 7) y la lección 102 de React (autenticación en una SPA)

---

## Qué es y para qué sirve

La Liga Comarcal del Júcar organiza los partidos de baloncesto de los pueblos de Cuenca, y su comité de árbitros tiene una web pequeña: una portada pública y una zona privada donde cada árbitro ve sus **designaciones** (los partidos que le toca pitar), las confirma y consulta su ficha. Para entrar en la zona privada hace falta sesión.

En la lección 102 de React protegiste una ruta en modo datos con un `loader` en la ruta madre que lanzaba `redirect('/entrar?volver=…')`. Aquí tienes la zona de árbitros hecha exactamente así. Como en las lecciones anteriores, `createBrowserRouter` usa en la vista previa un historial en memoria, y la barra de direcciones lo indica. Debajo de la vista previa tienes además el **registro del router**: cada operación (la carga inicial, una navegación, un envío) con los `loader`, las `action` y los middleware que ejecutó, cuándo empezó cada uno y cuánto tardó.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La zona privada, protegida con un loader (como en la 102)",
  "consigna": "Arranca en /designaciones sin sesión. En el registro del router, los dos loader de la carga inicial empiezan a la vez, y en el registro de red salen dos GET /api/sesion/1 a la vez: el de las designaciones también pregunta. Entra como Lucía y pasa a «Mi ficha»: no se comprueba nada. Vuelve a «Mis designaciones», pulsa «Caducar la sesión» (la borra en el servidor) y después «Confirmar»: el PATCH sale igual, y solo después te manda a entrar.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { accionEntrar, accionSalir, Entrar, ErrorRaiz, Marco, Portada } from './paginas'\nimport {\n  cargarDesignaciones, confirmar, Designaciones, exigirSesion, Ficha, ZonaPrivada,\n} from './privada'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    Component: Marco,\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la zona de árbitros…</p>,\n    children: [\n      { index: true, Component: Portada },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        loader: exigirSesion,\n        Component: ZonaPrivada,\n        children: [\n          {\n            id: 'designaciones',\n            path: 'designaciones',\n            loader: cargarDesignaciones,\n            action: confirmar,\n            Component: Designaciones,\n          },\n          { id: 'ficha', path: 'ficha', Component: Ficha },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "privada.tsx",
      "codigo": "import { useState } from 'react'\nimport {\n  Form, Outlet, redirect, useLoaderData, useRouteLoaderData,\n  type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { guardarSesion, pedir, quienSoy, type Designacion } from './api'\n\n// Como en la lección 102 de React: el loader de la madre comprueba la sesión\nexport async function exigirSesion({ request }: LoaderFunctionArgs) {\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  return arbitro\n}\n\nexport function ZonaPrivada() {\n  const arbitro = useLoaderData<typeof exigirSesion>()\n  const [caducada, setCaducada] = useState(false)\n  async function caducar() {\n    await guardarSesion(null) // como si la sesión caducara en el servidor\n    setCaducada(true)\n  }\n  return (\n    <>\n      <div className=\"sesion\">\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {arbitro.nombre} <button>Salir</button>\n        </Form>\n        <button type=\"button\" onClick={caducar}>Caducar la sesión</button>\n        {caducada && <p>La sesión ha caducado en el servidor.</p>}\n      </div>\n      <Outlet />\n    </>\n  )\n}\n\n// Empieza a la vez que el de la madre: no puede leer lo que este devuelve\nexport async function cargarDesignaciones({ request }: LoaderFunctionArgs) {\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) return []\n  const { licencia } = arbitro\n  return pedir<Designacion[]>(`/api/designaciones?q=${licencia}`, { signal: request.signal })\n}\n\nexport async function confirmar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('id')\n  await pedir(`/api/designaciones/${id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ confirmada: true }),\n  })\n  return null\n}\n\nexport function Designaciones() {\n  const designaciones = useLoaderData<typeof cargarDesignaciones>()\n  return (\n    <>\n      <h2>Mis designaciones</h2>\n      <ul>\n        {designaciones.map((d) => (\n          <li key={d.id}>\n            {d.partido} · {d.cuando} · {d.pabellon}{' '}\n            {d.confirmada ? (\n              <strong>Confirmada</strong>\n            ) : (\n              <Form method=\"post\">\n                <button name=\"id\" value={d.id}>Confirmar</button>\n              </Form>\n            )}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport function Ficha() {\n  const arbitro = useRouteLoaderData<typeof exigirSesion>('privada')!\n  return (\n    <>\n      <h2>Mi ficha</h2>\n      <p>Licencia {arbitro.licencia} · {arbitro.categoria}</p>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import {\n  Form, Link, Outlet, redirect, useNavigation, useRouteError, useSearchParams,\n  type ActionFunctionArgs,\n} from 'react-router'\nimport { destinoSeguro, guardarSesion, pedir, type Arbitro } from './api'\n\nexport function Marco() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Árbitros · Liga Comarcal del Júcar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Portada</Link> <Link to=\"/designaciones\">Mis designaciones</Link>{' '}\n          <Link to=\"/ficha\">Mi ficha</Link>\n        </nav>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La zona de árbitros no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h2>Portada</h2>\n      <p>Designaciones de la jornada 6. Los árbitros las consultan y confirman desde su zona.</p>\n    </>\n  )\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  await guardarSesion(await pedir<Arbitro>(`/api/arbitros/${datos.get('arbitro')}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <Form method=\"post\">\n      <h2>Entrar</h2>\n      {volver && <p>Para ver {volver}, entra primero.</p>}\n      <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n      <button name=\"arbitro\" value=\"1\">Entrar como Lucía Garrido</button>{' '}\n      <button name=\"arbitro\" value=\"2\">Entrar como Íñigo Sanz</button>\n    </Form>\n  )\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/')\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "// Hace de servidor. La API simulada guarda la sesión en /api/sesion/1, y\n// sobrevive a «Recargar» como la cookie de la lección 102 de React.\nexport type Arbitro = { id: number; nombre: string; licencia: string; categoria: string }\n\nexport type Designacion = {\n  id: number\n  partido: string\n  cuando: string\n  pabellon: string\n  confirmada: boolean\n}\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// Es el GET /api/yo de la 102: ¿de quién es esta sesión?\nexport async function quienSoy(signal?: AbortSignal) {\n  const sesion = await pedir<{ arbitro: Arbitro | null }>('/api/sesion/1', { signal })\n  return sesion.arbitro\n}\n\nexport async function guardarSesion(arbitro: Arbitro | null) {\n  await pedir('/api/sesion/1', {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ arbitro }),\n  })\n}\n\n// Solo direcciones de tu propio origen (lección 102 de React; a fondo, en la 20)\nexport function destinoSeguro(volver: string | null, base: string) {\n  const url = new URL(volver ?? '/designaciones', base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/designaciones'\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #2a1f17;\n  background: #faf6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #7a3412;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1.2rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nli form {\n  display: inline;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #6b5a4c;\n}\n\n.sesion {\n  margin-bottom: 0.6rem;\n  font-size: 0.9rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 0.75rem;\n}\n\n.sesion form {\n  display: inline;\n}\n\n.sesion p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "privada.tsx",
  "urlInicial": "/designaciones",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "arbitro": null
      }
    ],
    "arbitros": [
      {
        "id": 1,
        "nombre": "Lucía Garrido",
        "licencia": "CU-0412",
        "categoria": "Primera comarcal"
      },
      {
        "id": 2,
        "nombre": "Íñigo Sanz",
        "licencia": "CU-0388",
        "categoria": "Segunda comarcal"
      }
    ],
    "designaciones": [
      {
        "id": 1,
        "licencia": "CU-0412",
        "partido": "CB Huete – Tarancón Basket",
        "cuando": "Sábado 7, 18:00",
        "pabellon": "Pabellón de Huete",
        "confirmada": false
      },
      {
        "id": 2,
        "licencia": "CU-0412",
        "partido": "Motilla CB – Las Pedroñeras",
        "cuando": "Domingo 8, 12:00",
        "pabellon": "Pabellón de Motilla del Palancar",
        "confirmada": false
      },
      {
        "id": 3,
        "licencia": "CU-0388",
        "partido": "San Clemente – Quintanar Basket",
        "cuando": "Sábado 7, 17:00",
        "pabellon": "Pabellón de San Clemente",
        "confirmada": true
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

Funciona, pero tiene tres agujeros, y los tres vienen de que un `loader` no es el sitio para esto:

- **Los `loader` de la madre y de la hija van en paralelo** (lección 2). El de las designaciones no puede leer lo que devuelve el de la madre, así que vuelve a preguntar quién eres: dos peticiones a la sesión en cada carga, y el `loader` de la hija tarda el doble.
- **Un `loader` protege las cargas, no los envíos.** En un envío, la `action` va primero y los `loader` después, en la revalidación (lección 4). Con la sesión caducada, `confirmar` hizo su `PATCH` antes de que nadie mirara la sesión. El servidor tendría que rechazarlo, claro (lección 102 de React), pero la app ni siquiera debería intentarlo.
- **Moverse por la zona privada no comprueba nada.** Pasar de «Mis designaciones» a «Mi ficha» no vuelve a ejecutar el `loader` de la madre (lección 4), y en el registro esa navegación sale sin un solo paso. Si la sesión caduca, no te enteras hasta el siguiente envío.

**El middleware es código que el router ejecuta en cada navegación, en cada envío y en cada llamada de un fetcher, antes que los `loader` y que la `action`, y también después: de la ruta madre a la hija al bajar, y de la hija a la madre al volver.** Y el **contexto del router** es el sitio donde un middleware deja lo que averigua (el árbitro que ha entrado, por ejemplo) para que lo lean los de abajo. En esta lección verás:

- la cadena de middleware y qué hace `next()`;
- el contexto tipado: `createContext<T>()`, `context.set` y `context.get`;
- la ruta protegida de la 102, rehecha con un middleware que lanza `redirect('/entrar?volver=…')`;
- cómo medir lo que tarda cada navegación;
- `getContext`, para preparar el contexto con el que empieza cada navegación;
- y cómo compartir datos entre la `action` y el `loader` de un mismo envío.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Middleware de cliente, en modo datos",
  "contenido": "Todo lo de esta lección es middleware de cliente: se ejecuta en el navegador, en una SPA en modo datos o en el clientMiddleware del modo framework. Es estable desde la 7.9 y, desde la 8.0, está siempre activo: el context que reciben los loader y las action es siempre un RouterContextProvider. El middleware de servidor, con su Request y su Response de verdad, es de la lección 18. Lo que cuenta la lección está comprobado con React Router 8.5.0 en la vista previa, en Chromium y en WebKit, y la zona de árbitros, también en un proyecto de Vite."
}
```

## La cadena: de la madre a la hija y de vuelta

Un middleware se declara en el objeto de ruta, en la propiedad `middleware`: una lista de funciones. Cada una recibe lo mismo que un `loader` (`request`, `params` y `context`) y, como segundo argumento, una función `next`. En TSX, el tipo de la función es `MiddlewareFunction`, de `react-router`.

Antes de verlo en marcha, piensa en qué orden pasa todo con dos rutas con middleware y dos `loader`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "const medir: MiddlewareFunction = async (_, next) => {\n  console.log('raíz: antes')\n  await next()\n  console.log('raíz: después')\n}\n\nconst exigirSesion: MiddlewareFunction = async (_, next) => {\n  console.log('privada: antes')\n  await next()\n  console.log('privada: después')\n}\n\n// raíz            middleware: [medir]\n//  └ privada      middleware: [exigirSesion], loader: cargarPrivada\n//     └ designaciones                        loader: cargarDesignaciones\n// Cada loader escribe «loader <ruta>» nada más empezar.\n// Recargas /designaciones. ¿En qué orden sale todo?",
  "opciones": [
    "raíz: antes → privada: antes → loader privada → loader designaciones → privada: después → raíz: después",
    "raíz: antes → raíz: después → privada: antes → privada: después → loader privada → loader designaciones",
    "raíz: antes → loader privada → privada: antes → loader designaciones → privada: después → raíz: después",
    "loader privada → loader designaciones → raíz: antes → privada: antes → privada: después → raíz: después"
  ],
  "correcta": 0,
  "explicacion": "Cada next() llama al siguiente middleware de la cadena, y el next() del último ejecuta los loader, todos a la vez, como en la lección 2. El loader de la madre no se cuela entre los dos middleware: ningún loader empieza hasta que han pasado todos. Al terminar los loader, cada middleware sigue después de su next(), de la hija a la madre. Comprobado en la vista previa, en Chromium y en WebKit."
}
```

**Primero bajan todos los middleware, de la madre a la hija; el `next()` del último ejecuta los `loader`, todos a la vez; y después cada middleware termina lo que tenía detrás de su `next()`, de la hija a la madre.** La documentación lo dibuja como una lista sangrada en la que cada nivel envuelve al de debajo: la raíz envuelve a la zona privada, que envuelve a los `loader`.

En vivo, con un retraso de 200 ms en el middleware de la zona privada, como si preguntara al servidor por la sesión. Abre la consola y el registro del router:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La cadena, paso a paso",
  "lenguaje": "tsx",
  "codigo": "import { createBrowserRouter, Link, Outlet, type MiddlewareFunction } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\nconst esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms))\n\nconst medir: MiddlewareFunction = async ({ request }, next) => {\n  console.log(`raíz: antes · ${new URL(request.url).pathname}`)\n  await next()\n  console.log('raíz: después')\n}\n\nconst exigirSesion: MiddlewareFunction = async (_, next) => {\n  console.log('privada: antes')\n  await esperar(200) // como si preguntara al servidor por la sesión\n  await next()\n  console.log('privada: después')\n}\n\nasync function cargarPrivada() {\n  console.log('loader privada: empieza')\n  await esperar(100)\n  return null\n}\n\nasync function cargarDesignaciones() {\n  console.log('loader designaciones: empieza')\n  await esperar(400)\n  return null\n}\n\nfunction Marco() {\n  return (\n    <>\n      <nav>\n        <Link to=\"/\">Portada</Link> · <Link to=\"/designaciones\">Mis designaciones</Link> ·{' '}\n        <Link to=\"/ficha\">Mi ficha</Link>\n      </nav>\n      <Outlet />\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    middleware: [medir],\n    Component: Marco,\n    HydrateFallback: () => <p>Abriendo…</p>,\n    children: [\n      { index: true, Component: () => <h2>Portada</h2> },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarPrivada,\n        Component: Outlet,\n        children: [\n          {\n            id: 'designaciones',\n            path: 'designaciones',\n            loader: cargarDesignaciones,\n            Component: () => <h2>Mis designaciones</h2>,\n          },\n          { id: 'ficha', path: 'ficha', Component: () => <h2>Mi ficha</h2> },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}",
  "anotaciones": [
    {
      "fragmento": "id: 'raiz',",
      "nota": "El registro del router nombra cada paso por el id de su ruta: middleware raiz, middleware privada, loader designaciones. Sin id, usaría el path o un número."
    },
    {
      "fragmento": "middleware: [medir],",
      "nota": "El middleware de la raíz se ejecuta en todas las navegaciones de la app, porque la raíz encaja siempre. Pulsa «Portada»: en el registro solo sale este."
    },
    {
      "fragmento": "console.log('raíz: después')",
      "nota": "Se ejecuta al volver, cuando ha terminado todo lo de debajo. En el registro, la barra de middleware raiz empieza la primera y dura lo que toda la navegación."
    },
    {
      "fragmento": "await esperar(200) // como si preguntara al servidor por la sesión",
      "nota": "Mientras esto espera, no empieza ningún loader: en el registro, los dos loader arrancan a los 200 ms, a la vez."
    },
    {
      "fragmento": "middleware: [exigirSesion],",
      "nota": "Una ruta sin path que envuelve a las privadas, como en la 102. Su middleware se ejecuta en cualquier navegación que pase por una de sus hijas."
    },
    {
      "fragmento": "async function cargarPrivada() {",
      "nota": "El loader de la madre arranca a la vez que el de la hija, después de todos los middleware. De Mi ficha a Mis designaciones no se repite (lección 4), pero el middleware sí."
    },
    {
      "fragmento": "{ id: 'ficha', path: 'ficha', Component: () => <h2>Mi ficha</h2> },",
      "nota": "Una ruta sin loader. Aun así, al entrar en ella se ejecutan los middleware de la raíz y de la zona privada: el middleware de cliente corre en cada navegación, haya loader que ejecutar o no."
    }
  ],
  "urlInicial": "/designaciones",
  "mostrarConsola": true,
  "mostrarRouter": true
}
```

Recorre «Portada», «Mi ficha» y «Mis designaciones» y compara cada operación del registro:

- **Portada**: solo `middleware raiz`, que dura 0 ms, porque no hay nada debajo.
- **De la portada a «Mi ficha»**: los dos middleware y el `loader` de la zona privada, que vuelve a encajar.
- **De «Mi ficha» a «Mis designaciones»**: otra vez los dos middleware, el `loader` de las designaciones, y «No se volvió a ejecutar: privada».

**El middleware de cliente se ejecuta en cada navegación que pase por su ruta, haya `loader` que ejecutar o no.** La documentación lo dice así: *«Client middlewares will run on every client navigation, regardless of whether there are loaders to run»* («los middleware de cliente se ejecutan en cada navegación de cliente, haya o no `loader` que ejecutar»). Es justo lo que le faltaba a la zona de árbitros: comprobar la sesión también al pasar a «Mi ficha».

## `next()`: antes, después y una sola vez

`next` es la puerta entre las dos mitades de un middleware. Lo que escribas antes se ejecuta al bajar; lo que escribas después, al volver. Lo demás que conviene saber:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Si no lo llamas, lo llama el router",
      "texto": "Cuando tu función termina sin haber llamado a next(), el router lo llama por ti y sigue la cadena. Un middleware que solo mira algo al bajar, como comprobar la sesión, no necesita llamarlo."
    },
    {
      "titulo": "Lanzar corta la cadena",
      "texto": "Un redirect o un error lanzado antes de next() lo para todo: no se ejecuta ningún loader ni la action de esa navegación. Lanzado después, los loader ya se ejecutaron."
    },
    {
      "titulo": "Qué devuelve en el cliente",
      "texto": "Un objeto con el resultado de cada loader o de la action, por el id de su ruta. Por ejemplo { designaciones: { type: \"data\", result: [...] } }, o {} si no había nada que cargar (comprobado). Sirve para mirar qué ha pasado; la documentación pide no cambiarlo. En el servidor devuelve una Response (lección 18)."
    },
    {
      "titulo": "No lanza",
      "texto": "Si un loader falla, next() no lanza: el error va dentro de ese objeto y la madre sigue después de su next() como siempre. Por eso un middleware que mide también mide las navegaciones que acaban en error."
    },
    {
      "titulo": "Una sola vez",
      "texto": "Llamarlo dos veces en el mismo middleware lanza «You may only call `next()` once per middleware», y el error acaba en el ErrorBoundary de la ruta (comprobado)."
    },
    {
      "titulo": "Con await",
      "texto": "await next() o return next(). Llamarlo sin esperarlo tiene un efecto que no te imaginas: lo verás en los errores típicos."
    }
  ]
}
```

## El contexto: `createContext`, `context.set` y `context.get`

Comprobar la sesión en un middleware solo sirve si los `loader` pueden enterarse de quién ha entrado. Para eso está el `context` que reciben todos: middleware, `loader` y `action`. **Funciona con llaves: `createContext<T>()` crea una llave con su tipo, el middleware guarda un valor con `context.set(llave, valor)` y los de debajo lo leen con `context.get(llave)`.** Así quedan el middleware y los `loader` de la zona de árbitros:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// sesion.ts\nimport { createContext, redirect, type MiddlewareFunction } from 'react-router'\nimport { quienSoy, type Arbitro } from './api'\n\nexport const arbitroContext = createContext<Arbitro>()\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(arbitroContext, arbitro)\n}\n\n// privada.tsx\nexport async function cargarDesignaciones({ request, context }: LoaderFunctionArgs) {\n  const { licencia } = context.get(arbitroContext)\n  return pedir<Designacion[]>(`/api/designaciones?q=${licencia}`, { signal: request.signal })\n}\n\n// Los componentes no ven el contexto del router: se lo pasa un loader\nexport function cargarArbitro({ context }: LoaderFunctionArgs) {\n  return context.get(arbitroContext)\n}",
  "anotaciones": [
    {
      "fragmento": "export const arbitroContext = createContext<Arbitro>()",
      "nota": "La llave, con su tipo. El createContext de react-router, no el de React. Sin valor por defecto: si alguien la lee sin que nadie la haya puesto, get lanza un error."
    },
    {
      "fragmento": "export const exigirSesion: MiddlewareFunction = async ({ request, context }) => {",
      "nota": "MiddlewareFunction tipa los argumentos. Sin él, con strict, TypeScript se queja de cada uno: Binding element request implicitly has an any type. No llama a next(): comprueba, guarda y termina, y el router sigue la cadena."
    },
    {
      "fragmento": "await quienSoy(request.signal)",
      "nota": "Con el signal de la navegación: si el usuario se va antes de que conteste el servidor, la petición se cancela (lección 2)."
    },
    {
      "fragmento": "throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))",
      "nota": "Sin sesión, la cadena se corta aquí: ni loader ni action. La página que pediste viaja en la búsqueda, como en la 102."
    },
    {
      "fragmento": "context.set(arbitroContext, arbitro)",
      "nota": "Aquí arbitro ya es Arbitro, no Arbitro | null: el if de arriba lo ha estrechado. Si guardas otra cosa, por ejemplo un número, TypeScript lo para: Argument of type number is not assignable to parameter of type Arbitro."
    },
    {
      "fragmento": "const { licencia } = context.get(arbitroContext)",
      "nota": "get devuelve Arbitro, sin null que comprobar: el loader se fía de que el middleware de su madre ya lo ha puesto. Y no vuelve a preguntar al servidor."
    },
    {
      "fragmento": "export function cargarArbitro({ context }: LoaderFunctionArgs) {",
      "nota": "El contexto del router solo llega a middleware, loader y action. Para que el componente de la zona privada salude a Lucía, este loader le devuelve el árbitro, que lee con useLoaderData, y Mi ficha, con useRouteLoaderData(privada)."
    }
  ]
}
```

Tres cosas del contexto que conviene tener claras desde el principio:

**No es el contexto de React.** Se llaman igual, `createContext`, pero el de React reparte valores entre componentes y el del router, entre middleware, `loader` y `action`. Los componentes no ven el del router: lo que necesiten, que se lo devuelva un `loader`, como `cargarArbitro`. Si el editor te importa el de React por error, TypeScript lo para en el `set` y en el `get` (comprobado con TypeScript 6.0.3):

```text
Type 'Context<Arbitro | null>' has no properties in common with type 'RouterContext<unknown>'.
```

Es decir: «el tipo `Context<Arbitro | null>` no tiene ninguna propiedad en común con `RouterContext<unknown>`». Es la pista de que esa llave es de React.

**Es nuevo en cada navegación.** El router crea un contexto vacío para cada navegación y para cada llamada de un fetcher. Lo que guardes en él no llega a la navegación siguiente: no es una caché ni un almacén global. Hay una excepción, el envío, que verás al final.

**Sin valor por defecto, leer lo que nadie ha puesto lanza un error.** Si un `loader` de la portada, que no pasa por `exigirSesion`, leyera `arbitroContext`, el router recogería este error y lo pintaría su `ErrorBoundary` (comprobado):

```text
No value found for context
```

Es decir: «no hay ningún valor para este contexto». Con `createContext<Arbitro | null>(null)`, en cambio, `get` devuelve `null` y no lanza, pero entonces TypeScript te obliga a comprobarlo (`Object is possibly 'null'.`). La lección 15 lleva los tipos del contexto al fondo.

## Autenticación: la ruta protegida de la 102, con middleware

Con las piezas anteriores, la zona de árbitros se rehace así:

- `exigirSesion` pasa de `loader` a middleware de la ruta `privada`, la ruta sin `path` que envuelve a «Mis designaciones» y a «Mi ficha»;
- la ruta `privada` conserva un `loader`, `cargarArbitro`, que solo devuelve el árbitro del contexto para sus componentes;
- los `loader` y la `action` de las hijas leen el árbitro con `context.get(arbitroContext)`;
- y la raíz lleva otro middleware, `medirNavegacion`, que escribe en la consola lo que tarda cada navegación (lo verás en la sección siguiente).

Prueba lo mismo que en el primer bloque:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La zona privada, protegida con un middleware",
  "consigna": "Arranca en /designaciones sin sesión: en el registro, la carga inicial pasa por los dos middleware y, tras redirigir, acaba en /entrar sin ejecutar ningún loader. Entra como Lucía: vuelves a sus designaciones con una sola petición a la sesión. Pasa a «Mi ficha»: el middleware vuelve a preguntar, aunque no haya loader que ejecutar. Vuelve, pulsa «Caducar la sesión» y «Confirmar»: esta vez no sale ningún PATCH. La consola enseña lo que tarda cada navegación.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { accionEntrar, accionSalir, Entrar, ErrorRaiz, Marco, Portada } from './paginas'\nimport {\n  cargarArbitro, cargarDesignaciones, confirmar, Designaciones, Ficha, ZonaPrivada,\n} from './privada'\nimport { exigirSesion, medirNavegacion } from './sesion'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    middleware: [medirNavegacion],\n    Component: Marco,\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la zona de árbitros…</p>,\n    children: [\n      { index: true, Component: Portada },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarArbitro,\n        Component: ZonaPrivada,\n        children: [\n          {\n            id: 'designaciones',\n            path: 'designaciones',\n            loader: cargarDesignaciones,\n            action: confirmar,\n            Component: Designaciones,\n          },\n          { id: 'ficha', path: 'ficha', Component: Ficha },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "sesion.ts",
      "codigo": "import { createContext, redirect, type MiddlewareFunction } from 'react-router'\nimport { quienSoy, type Arbitro } from './api'\n\n// El árbitro que ha entrado, para los loader y las action de la zona privada\nexport const arbitroContext = createContext<Arbitro>()\n\nexport const medirNavegacion: MiddlewareFunction = async ({ request }, next) => {\n  const inicio = performance.now()\n  await next()\n  const { pathname, search } = new URL(request.url)\n  console.log(`${request.method} ${pathname}${search} · ${Math.round(performance.now() - inicio)} ms`)\n}\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(arbitroContext, arbitro)\n}\n"
    },
    {
      "nombre": "privada.tsx",
      "codigo": "import { useState } from 'react'\nimport {\n  Form, Outlet, useLoaderData, useRouteLoaderData,\n  type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { guardarSesion, pedir, type Designacion } from './api'\nimport { arbitroContext } from './sesion'\n\n// Los componentes no ven el contexto del router: se lo pasa un loader\nexport function cargarArbitro({ context }: LoaderFunctionArgs) {\n  return context.get(arbitroContext)\n}\n\nexport function ZonaPrivada() {\n  const arbitro = useLoaderData<typeof cargarArbitro>()\n  const [caducada, setCaducada] = useState(false)\n  async function caducar() {\n    await guardarSesion(null) // como si la sesión caducara en el servidor\n    setCaducada(true)\n  }\n  return (\n    <>\n      <div className=\"sesion\">\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {arbitro.nombre} <button>Salir</button>\n        </Form>\n        <button type=\"button\" onClick={caducar}>Caducar la sesión</button>\n        {caducada && <p>La sesión ha caducado en el servidor.</p>}\n      </div>\n      <Outlet />\n    </>\n  )\n}\n\nexport async function cargarDesignaciones({ request, context }: LoaderFunctionArgs) {\n  const { licencia } = context.get(arbitroContext)\n  return pedir<Designacion[]>(`/api/designaciones?q=${licencia}`, { signal: request.signal })\n}\n\nexport async function confirmar({ request, context }: ActionFunctionArgs) {\n  const arbitro = context.get(arbitroContext)\n  const id = (await request.formData()).get('id')\n  await pedir(`/api/designaciones/${id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ confirmada: true, confirmadaPor: arbitro.nombre }),\n  })\n  return null\n}\n\nexport function Designaciones() {\n  const designaciones = useLoaderData<typeof cargarDesignaciones>()\n  return (\n    <>\n      <h2>Mis designaciones</h2>\n      <ul>\n        {designaciones.map((d) => (\n          <li key={d.id}>\n            {d.partido} · {d.cuando} · {d.pabellon}{' '}\n            {d.confirmada ? (\n              <strong>Confirmada</strong>\n            ) : (\n              <Form method=\"post\">\n                <button name=\"id\" value={d.id}>Confirmar</button>\n              </Form>\n            )}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport function Ficha() {\n  const arbitro = useRouteLoaderData<typeof cargarArbitro>('privada')!\n  return (\n    <>\n      <h2>Mi ficha</h2>\n      <p>Licencia {arbitro.licencia} · {arbitro.categoria}</p>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import {\n  Form, Link, Outlet, redirect, useNavigation, useRouteError, useSearchParams,\n  type ActionFunctionArgs,\n} from 'react-router'\nimport { destinoSeguro, guardarSesion, pedir, type Arbitro } from './api'\n\nexport function Marco() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Árbitros · Liga Comarcal del Júcar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Portada</Link> <Link to=\"/designaciones\">Mis designaciones</Link>{' '}\n          <Link to=\"/ficha\">Mi ficha</Link>\n        </nav>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La zona de árbitros no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h2>Portada</h2>\n      <p>Designaciones de la jornada 6. Los árbitros las consultan y confirman desde su zona.</p>\n    </>\n  )\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  await guardarSesion(await pedir<Arbitro>(`/api/arbitros/${datos.get('arbitro')}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <Form method=\"post\">\n      <h2>Entrar</h2>\n      {volver && <p>Para ver {volver}, entra primero.</p>}\n      <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n      <button name=\"arbitro\" value=\"1\">Entrar como Lucía Garrido</button>{' '}\n      <button name=\"arbitro\" value=\"2\">Entrar como Íñigo Sanz</button>\n    </Form>\n  )\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/')\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "// Hace de servidor. La API simulada guarda la sesión en /api/sesion/1, y\n// sobrevive a «Recargar» como la cookie de la lección 102 de React.\nexport type Arbitro = { id: number; nombre: string; licencia: string; categoria: string }\n\nexport type Designacion = {\n  id: number\n  partido: string\n  cuando: string\n  pabellon: string\n  confirmada: boolean\n}\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// Es el GET /api/yo de la 102: ¿de quién es esta sesión?\nexport async function quienSoy(signal?: AbortSignal) {\n  const sesion = await pedir<{ arbitro: Arbitro | null }>('/api/sesion/1', { signal })\n  return sesion.arbitro\n}\n\nexport async function guardarSesion(arbitro: Arbitro | null) {\n  await pedir('/api/sesion/1', {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ arbitro }),\n  })\n}\n\n// Solo direcciones de tu propio origen (lección 102 de React; a fondo, en la 20)\nexport function destinoSeguro(volver: string | null, base: string) {\n  const url = new URL(volver ?? '/designaciones', base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/designaciones'\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #2a1f17;\n  background: #faf6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #7a3412;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1.2rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nli form {\n  display: inline;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #6b5a4c;\n}\n\n.sesion {\n  margin-bottom: 0.6rem;\n  font-size: 0.9rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 0.75rem;\n}\n\n.sesion form {\n  display: inline;\n}\n\n.sesion p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "sesion.ts",
  "urlInicial": "/designaciones",
  "mostrarConsola": true,
  "mostrarRouter": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "arbitro": null
      }
    ],
    "arbitros": [
      {
        "id": 1,
        "nombre": "Lucía Garrido",
        "licencia": "CU-0412",
        "categoria": "Primera comarcal"
      },
      {
        "id": 2,
        "nombre": "Íñigo Sanz",
        "licencia": "CU-0388",
        "categoria": "Segunda comarcal"
      }
    ],
    "designaciones": [
      {
        "id": 1,
        "licencia": "CU-0412",
        "partido": "CB Huete – Tarancón Basket",
        "cuando": "Sábado 7, 18:00",
        "pabellon": "Pabellón de Huete",
        "confirmada": false
      },
      {
        "id": 2,
        "licencia": "CU-0412",
        "partido": "Motilla CB – Las Pedroñeras",
        "cuando": "Domingo 8, 12:00",
        "pabellon": "Pabellón de Motilla del Palancar",
        "confirmada": false
      },
      {
        "id": 3,
        "licencia": "CU-0388",
        "partido": "San Clemente – Quintanar Basket",
        "cuando": "Sábado 7, 17:00",
        "pabellon": "Pabellón de San Clemente",
        "confirmada": true
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

**El middleware de la zona privada se ejecuta antes que cualquier `loader` y que cualquier `action` de sus rutas.** Sin sesión, el `redirect` corta la cadena y no llega a ejecutarse nada más; con sesión, deja al árbitro en el contexto y los `loader` lo leen sin volver a preguntar. Los tres agujeros del principio, cerrados:

- Una sola petición a la sesión por navegación, y antes que las de los datos.
- Con la sesión caducada, «Confirmar» te lleva a `/entrar?volver=%2Fdesignaciones` sin hacer el `PATCH`: en el registro, el envío solo tiene los dos middleware, y en el de red, solo `GET /api/sesion/1`.
- Cada navegación por la zona privada vuelve a mirar la sesión.

Tres detalles del código:

- **La carga inicial también pasa por el middleware.** Mientras pregunta por la sesión, el router aún no puede pintar ninguna ruta y enseña el `HydrateFallback` de la raíz, «Abriendo la zona de árbitros…» (lección 11). Sin él, la consola avisa con `No HydrateFallback element provided to render during initial hydration` (comprobado). En el registro, la redirección de la carga inicial queda en la misma operación, con su fase «Tras redirigir».
- **`destinoSeguro` usa `request.url` como base**, y no `window.location.origin` como en la 102. En tu proyecto los dos son tu origen, pero dentro de la vista previa el documento no tiene origen (`window.location.origin` vale `"null"`) y el `request` del router lleva `http://localhost/…`. Además, `request.url` funciona igual en el servidor (lección 18). Por qué hay que validar `?volver=` lo cuenta la 102, y lo lleva al fondo la lección 20.
- **`destinoSeguro` comprueba también la ruta que devuelve**, no solo el origen. `new URL` normaliza la ruta: con `?volver=/.//otra-web.example`, el origen sale `http://localhost`, el tuyo, pero la ruta queda en `//otra-web.example`. Y `redirect('//otra-web.example')` lleva a `https://otra-web.example/` (con el protocolo de tu web), porque el navegador lee una dirección que empieza por `//` como la de otro dominio. Lo mismo pasa con `/a/..//otra-web.example` o `/%2e//otra-web.example`. Por eso descarta las rutas que, ya normalizadas, empiezan por `//`.

Así quedan, una al lado de la otra, las tres formas de proteger rutas que has visto:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de proteger una rama de rutas",
  "roles": [
    {
      "etiqueta": "<Navigate> en un componente",
      "rol": "Modo declarativo (102 de React)",
      "descripcion": "Decide al pintar: necesita el estado «comprobando» y guarda la vuelta en state. No sabe nada de loader ni de action."
    },
    {
      "etiqueta": "loader de la madre",
      "rol": "Modo datos (99 y 102 de React)",
      "descripcion": "Va en paralelo con los loader de las hijas, no protege los envíos y no se repite al moverte entre hijas."
    },
    {
      "etiqueta": "middleware de la madre",
      "rol": "Modo datos, estable desde la 7.9",
      "descripcion": "Va antes que los loader y la action de todas sus hijas, en cada navegación, y deja al usuario en el contexto."
    }
  ]
}
```

Y lo de siempre: **esto es experiencia de usuario, no seguridad**. El middleware evita que la app pida lo que no debe, pero el servidor de la liga tiene que comprobar la sesión en cada petición, también en el `PATCH` de una designación, y que esa designación es tuya (lección 102 de React; con el servidor delante, lección 18).

## Medir lo que tarda cada navegación

El middleware de la raíz envuelve todas las navegaciones de la app, así que es el sitio natural para medirlas. Es el de la zona de árbitros:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const medirNavegacion: MiddlewareFunction = async ({ request }, next) => {\n  const inicio = performance.now()\n  await next()\n  const { pathname, search } = new URL(request.url)\n  console.log(`${request.method} ${pathname}${search} · ${Math.round(performance.now() - inicio)} ms`)\n}\n\n// En la raíz, para que envuelva todas las navegaciones:\n// { id: 'raiz', path: '/', middleware: [medirNavegacion], ... }",
  "anotaciones": [
    {
      "fragmento": "const inicio = performance.now()",
      "nota": "Al bajar, antes que ningún otro middleware: es lo primero que se ejecuta en cada navegación."
    },
    {
      "fragmento": "await next()",
      "nota": "Toda la cadena de debajo: el middleware de la zona privada, los loader o la action. Como next() no lanza, se mide también lo que acaba en error o en una redirección."
    },
    {
      "fragmento": "${request.method}",
      "nota": "GET en una navegación o en la revalidación; POST en la pasada de una action."
    },
    {
      "fragmento": "new URL(request.url)",
      "nota": "En la vista previa, request.url empieza por http://localhost, el origen del historial en memoria. En tu proyecto, por el tuyo. Por eso aquí solo se escribe la ruta y la búsqueda."
    },
    {
      "fragmento": "console.log(",
      "nota": "En una app de verdad, la medida se manda a tu servidor o a tu herramienta de métricas. Sin await: lo verás justo debajo."
    }
  ]
}
```

En el bloque anterior, recargar `/designaciones` sin sesión escribe dos líneas, una por la navegación que redirige y otra por la redirigida:

```text
GET /designaciones · 304 ms
GET /entrar?volver=%2Fdesignaciones · 0 ms
```

¿Y un envío?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La zona de árbitros, con Lucía dentro y 300 ms de latencia.\n// En «Mis designaciones» pulsa «Confirmar» en el partido de Huete:\n//   <Form method=\"post\"><button name=\"id\" value=\"1\">Confirmar</button></Form>\n// La action hace el PATCH y después el router revalida.\n//\n// ¿Qué escribe medirNavegacion en la consola?",
  "opciones": [
    "Una línea: POST /designaciones · 1210 ms",
    "Dos líneas: POST /designaciones · 606 ms y GET /designaciones · 602 ms",
    "Tres líneas: una para la action y una para cada loader que se revalida",
    "Nada: el middleware solo se ejecuta al navegar, no al enviar"
  ],
  "correcta": 1,
  "explicacion": "Un envío recorre la cadena dos veces: una para la action, con el método POST, y otra para la revalidación, con GET. En cada pasada, el middleware de la zona privada vuelve a preguntar por la sesión: 300 ms más la action, y 300 ms más los loader. Comprobado; el registro del router enseña las dos pasadas en la misma operación, en las fases Envío y Revalidación."
}
```

**Un envío recorre la cadena dos veces, y tu middleware se ejecuta en las dos.** Si quieres una sola medida por envío, súmalas tú; en el reto 2 tienes una forma de hacerlo con el contexto.

Lo que mide y lo que no:

- **Mide** los middleware de debajo, los `loader` y la `action`: lo que el usuario espera con «Cargando…» en la cabecera.
- **No mide** pintar la página nueva: el router la pinta cuando toda la cadena ha terminado, después de tu `console.log`.
- **No esperes al envío de la medida.** El router no termina la navegación hasta que termina el middleware de la raíz, también lo que va después de `next()`. Lo comprobamos con un `await fetch('/api/medidas', …)` detrás del `next()` y 300 ms de latencia: ir a «Mi ficha» sin sesión pasó de unos 305 ms a 911, porque esperó el envío de su medida y el de la navegación redirigida a `/entrar`. Lánzalo sin `await` (`void guardarMedida(…)`), o con `navigator.sendBeacon`.

Para algo más completo que un `console.log`, React Router tiene una API de instrumentación, `instrumentations`, estable desde la 7.15, que envuelve cada navegación, cada fetcher y cada `loader`, `action` y middleware por separado. Es la que usa el registro del router de la vista previa, y la verás en la lección 22.

## `getContext`: el contexto con el que empieza cada navegación

Cada navegación empieza con un `RouterContextProvider` vacío, la clase de `context`. **Con la opción `getContext` de `createBrowserRouter` (también de `createMemoryRouter`) lo creas tú, y puedes dejar valores en él antes de que se ejecute ningún middleware.** La documentación lo propone para lo que todas las navegaciones necesitan desde el principio: un cliente de la API, la configuración, un identificador para los registros. Y añade que, en el navegador, un middleware de la raíz suele bastar para lo mismo; en el modo framework, lo equivalente en el servidor es `getLoadContext`.

En la zona de árbitros, para numerar los contextos y saber, en la consola, qué líneas son de la misma navegación:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { createContext, RouterContextProvider, type MiddlewareFunction } from 'react-router'\n\nexport const numeroContext = createContext<number>()\nlet navegaciones = 0\n\nexport function crearContexto() {\n  const contexto = new RouterContextProvider()\n  contexto.set(numeroContext, ++navegaciones)\n  return contexto\n}\n\nexport const medirNavegacion: MiddlewareFunction = async ({ request, context }, next) => {\n  const inicio = performance.now()\n  await next()\n  const { pathname, search } = new URL(request.url)\n  const ms = Math.round(performance.now() - inicio)\n  console.log(`[contexto ${context.get(numeroContext)}] ${request.method} ${pathname}${search} · ${ms} ms`)\n}\n\n// App.tsx\nconst router = createBrowserRouter(rutas, { getContext: crearContexto })",
  "anotaciones": [
    {
      "fragmento": "const contexto = new RouterContextProvider()",
      "nota": "La misma clase que reciben middleware, loader y action como context. Puedes crear tantos como quieras: en los tests (lección 21) le pasarás uno a un loader."
    },
    {
      "fragmento": "contexto.set(numeroContext, ++navegaciones)",
      "nota": "Un número por contexto, guardado antes de que empiece la cadena. Cualquier middleware, loader o action puede leerlo con context.get(numeroContext)."
    },
    {
      "fragmento": "{ getContext: crearContexto }",
      "nota": "El router llama a getContext una vez por navegación, también en la carga inicial y en la navegación que sigue a una redirección, y una vez por cada llamada de un fetcher. Puede devolver el contexto o una promesa del contexto."
    },
    {
      "fragmento": "[contexto ${context.get(numeroContext)}]",
      "nota": "Con el número delante, las líneas de una misma navegación se reconocen en la consola. En el bloque siguiente verás que un envío escribe dos líneas con el mismo número."
    }
  ]
}
```

El registro del router de la vista previa también funciona con un `getContext` propio: sus operaciones salen igual que sin él. Pero no confundas sus números (`#1`, `#2`…), que cuentan operaciones, con los de este contexto: una operación con una redirección dentro, como entrar, usa dos contextos.

## Compartir datos entre la `action` y el `loader`

En la zona de árbitros, cada «Confirmar» pregunta dos veces por la sesión: una en la pasada de la `action` y otra en la de la revalidación. Míralo en el registro de red del bloque de la zona privada: dos `GET /api/sesion/1` por envío. Sobra uno, porque **en un envío, la `action` y la revalidación que la sigue comparten el mismo contexto**: lo que deja la primera pasada, la segunda lo encuentra. Lo mismo pasa con un fetcher que envía (comprobado con los dos).

Para aprovecharlo, el middleware tiene que poder preguntar «¿ya está?», y con `createContext<Arbitro>()` no puede: `get` lanzaría. Por eso la llave pasa a tener `null` por defecto, y los `loader` leen el árbitro con una función que lo comprueba:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una sola consulta de sesión por envío",
  "consigna": "Entra como Lucía y pulsa «Confirmar». En la consola, el envío y su revalidación llevan el mismo número de contexto. En el registro de red sale un solo GET /api/sesion/1, y en el del router, el middleware privada de la revalidación dura 0 ms. Después, en sesion.ts, quita la línea if (context.get(arbitroContext)) return, entra otra vez y confirma el otro partido: vuelven a salir dos peticiones a la sesión.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { accionEntrar, accionSalir, Entrar, ErrorRaiz, Marco, Portada } from './paginas'\nimport {\n  cargarArbitro, cargarDesignaciones, confirmar, Designaciones, Ficha, ZonaPrivada,\n} from './privada'\nimport { crearContexto, exigirSesion, medirNavegacion } from './sesion'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    middleware: [medirNavegacion],\n    Component: Marco,\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la zona de árbitros…</p>,\n    children: [\n      { index: true, Component: Portada },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarArbitro,\n        Component: ZonaPrivada,\n        children: [\n          {\n            id: 'designaciones',\n            path: 'designaciones',\n            loader: cargarDesignaciones,\n            action: confirmar,\n            Component: Designaciones,\n          },\n          { id: 'ficha', path: 'ficha', Component: Ficha },\n        ],\n      },\n    ],\n  },\n], { getContext: crearContexto })\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "sesion.ts",
      "codigo": "import { createContext, redirect, RouterContextProvider, type MiddlewareFunction } from 'react-router'\nimport { quienSoy, type Arbitro } from './api'\n\n// getContext: cada navegación empieza con un contexto nuevo, y con su número\nexport const numeroContext = createContext<number>()\nlet navegaciones = 0\nexport function crearContexto() {\n  const contexto = new RouterContextProvider()\n  contexto.set(numeroContext, ++navegaciones)\n  return contexto\n}\n\nexport const medirNavegacion: MiddlewareFunction = async ({ request, context }, next) => {\n  const inicio = performance.now()\n  await next()\n  const { pathname, search } = new URL(request.url)\n  const ms = Math.round(performance.now() - inicio)\n  console.log(`[contexto ${context.get(numeroContext)}] ${request.method} ${pathname}${search} · ${ms} ms`)\n}\n\n// Con null por defecto, get no lanza: así se puede preguntar si ya está\nexport const arbitroContext = createContext<Arbitro | null>(null)\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  // En un envío, la action y la revalidación comparten contexto\n  if (context.get(arbitroContext)) return\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(arbitroContext, arbitro)\n}\n\n// Para los loader y las action de la zona privada\nexport function arbitroDe(context: Readonly<RouterContextProvider>) {\n  const arbitro = context.get(arbitroContext)\n  if (!arbitro) throw new Error('Esta ruta necesita el middleware exigirSesion')\n  return arbitro\n}\n"
    },
    {
      "nombre": "privada.tsx",
      "codigo": "import { useState } from 'react'\nimport {\n  Form, Outlet, useLoaderData, useRouteLoaderData,\n  type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { guardarSesion, pedir, type Designacion } from './api'\nimport { arbitroDe } from './sesion'\n\n// Los componentes no ven el contexto del router: se lo pasa un loader\nexport function cargarArbitro({ context }: LoaderFunctionArgs) {\n  return arbitroDe(context)\n}\n\nexport function ZonaPrivada() {\n  const arbitro = useLoaderData<typeof cargarArbitro>()\n  const [caducada, setCaducada] = useState(false)\n  async function caducar() {\n    await guardarSesion(null) // como si la sesión caducara en el servidor\n    setCaducada(true)\n  }\n  return (\n    <>\n      <div className=\"sesion\">\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {arbitro.nombre} <button>Salir</button>\n        </Form>\n        <button type=\"button\" onClick={caducar}>Caducar la sesión</button>\n        {caducada && <p>La sesión ha caducado en el servidor.</p>}\n      </div>\n      <Outlet />\n    </>\n  )\n}\n\nexport async function cargarDesignaciones({ request, context }: LoaderFunctionArgs) {\n  const { licencia } = arbitroDe(context)\n  return pedir<Designacion[]>(`/api/designaciones?q=${licencia}`, { signal: request.signal })\n}\n\nexport async function confirmar({ request, context }: ActionFunctionArgs) {\n  const arbitro = arbitroDe(context)\n  const id = (await request.formData()).get('id')\n  await pedir(`/api/designaciones/${id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ confirmada: true, confirmadaPor: arbitro.nombre }),\n  })\n  return null\n}\n\nexport function Designaciones() {\n  const designaciones = useLoaderData<typeof cargarDesignaciones>()\n  return (\n    <>\n      <h2>Mis designaciones</h2>\n      <ul>\n        {designaciones.map((d) => (\n          <li key={d.id}>\n            {d.partido} · {d.cuando} · {d.pabellon}{' '}\n            {d.confirmada ? (\n              <strong>Confirmada</strong>\n            ) : (\n              <Form method=\"post\">\n                <button name=\"id\" value={d.id}>Confirmar</button>\n              </Form>\n            )}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport function Ficha() {\n  const arbitro = useRouteLoaderData<typeof cargarArbitro>('privada')!\n  return (\n    <>\n      <h2>Mi ficha</h2>\n      <p>Licencia {arbitro.licencia} · {arbitro.categoria}</p>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import {\n  Form, Link, Outlet, redirect, useNavigation, useRouteError, useSearchParams,\n  type ActionFunctionArgs,\n} from 'react-router'\nimport { destinoSeguro, guardarSesion, pedir, type Arbitro } from './api'\n\nexport function Marco() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Árbitros · Liga Comarcal del Júcar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Portada</Link> <Link to=\"/designaciones\">Mis designaciones</Link>{' '}\n          <Link to=\"/ficha\">Mi ficha</Link>\n        </nav>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La zona de árbitros no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h2>Portada</h2>\n      <p>Designaciones de la jornada 6. Los árbitros las consultan y confirman desde su zona.</p>\n    </>\n  )\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  await guardarSesion(await pedir<Arbitro>(`/api/arbitros/${datos.get('arbitro')}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <Form method=\"post\">\n      <h2>Entrar</h2>\n      {volver && <p>Para ver {volver}, entra primero.</p>}\n      <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n      <button name=\"arbitro\" value=\"1\">Entrar como Lucía Garrido</button>{' '}\n      <button name=\"arbitro\" value=\"2\">Entrar como Íñigo Sanz</button>\n    </Form>\n  )\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/')\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "// Hace de servidor. La API simulada guarda la sesión en /api/sesion/1, y\n// sobrevive a «Recargar» como la cookie de la lección 102 de React.\nexport type Arbitro = { id: number; nombre: string; licencia: string; categoria: string }\n\nexport type Designacion = {\n  id: number\n  partido: string\n  cuando: string\n  pabellon: string\n  confirmada: boolean\n}\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// Es el GET /api/yo de la 102: ¿de quién es esta sesión?\nexport async function quienSoy(signal?: AbortSignal) {\n  const sesion = await pedir<{ arbitro: Arbitro | null }>('/api/sesion/1', { signal })\n  return sesion.arbitro\n}\n\nexport async function guardarSesion(arbitro: Arbitro | null) {\n  await pedir('/api/sesion/1', {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ arbitro }),\n  })\n}\n\n// Solo direcciones de tu propio origen (lección 102 de React; a fondo, en la 20)\nexport function destinoSeguro(volver: string | null, base: string) {\n  const url = new URL(volver ?? '/designaciones', base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/designaciones'\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #2a1f17;\n  background: #faf6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #7a3412;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1.2rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nli form {\n  display: inline;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #6b5a4c;\n}\n\n.sesion {\n  margin-bottom: 0.6rem;\n  font-size: 0.9rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 0.75rem;\n}\n\n.sesion form {\n  display: inline;\n}\n\n.sesion p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "sesion.ts",
  "urlInicial": "/designaciones",
  "mostrarConsola": true,
  "mostrarRouter": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "arbitro": null
      }
    ],
    "arbitros": [
      {
        "id": 1,
        "nombre": "Lucía Garrido",
        "licencia": "CU-0412",
        "categoria": "Primera comarcal"
      },
      {
        "id": 2,
        "nombre": "Íñigo Sanz",
        "licencia": "CU-0388",
        "categoria": "Segunda comarcal"
      }
    ],
    "designaciones": [
      {
        "id": 1,
        "licencia": "CU-0412",
        "partido": "CB Huete – Tarancón Basket",
        "cuando": "Sábado 7, 18:00",
        "pabellon": "Pabellón de Huete",
        "confirmada": false
      },
      {
        "id": 2,
        "licencia": "CU-0412",
        "partido": "Motilla CB – Las Pedroñeras",
        "cuando": "Domingo 8, 12:00",
        "pabellon": "Pabellón de Motilla del Palancar",
        "confirmada": false
      },
      {
        "id": 3,
        "licencia": "CU-0388",
        "partido": "San Clemente – Quintanar Basket",
        "cuando": "Sábado 7, 17:00",
        "pabellon": "Pabellón de San Clemente",
        "confirmada": true
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

En la consola sale algo así (los números dependen de lo que hayas hecho antes):

```text
[contexto 5] POST /designaciones · 604 ms
[contexto 5] GET /designaciones · 302 ms
```

El envío pasa de 1.210 ms a unos 910: la pasada de la revalidación ya no espera a la sesión. Lo que cambió en `sesion.ts`:

- **`createContext<Arbitro | null>(null)`**: con un valor por defecto, `get` devuelve `null` en vez de lanzar, y el middleware puede salir pronto si ya hay árbitro.
- **`arbitroDe(context)`**: los `loader` y la `action` ya no pueden usar `context.get(arbitroContext).licencia` tal cual, porque ahora puede ser `null` (`Object is possibly 'null'.`). La función lo comprueba en un solo sitio y lanza un error claro si alguien la usa en una ruta sin el middleware.

Ojo con el ejemplo de la documentación para este patrón: usa `createContext<any>()`, **sin valor por defecto**, y pregunta con `if (!context.get(sharedDataContext))`. Tal cual, la primera lectura lanza `No value found for context` (comprobado). Dale un valor por defecto.

La `action` también puede dejarle algo a la revalidación. Si `confirmar` guarda el partido que acaba de confirmar, el `loader` lo encuentra en la pasada siguiente (comprobado: en la revalidación lee el id; en una navegación normal, `null`):

```tsx
export const confirmadaContext = createContext<string | null>(null)

// en confirmar (la action)
context.set(confirmadaContext, String(id))

// en cargarDesignaciones (el loader), durante la revalidación de ese envío
const recienConfirmada = context.get(confirmadaContext) // '1'
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "En el servidor no funciona igual",
  "contenido": "La documentación lo avisa: en el modo framework, el contexto del servidor dura lo que una petición. Solo se comparte entre la action y los loader en un POST de documento, sin JavaScript. En una app ya cargada, el envío y la revalidación son dos peticiones distintas al servidor, cada una con su contexto. En el cliente, como en esta lección, funciona siempre, porque no hay peticiones de por medio. El servidor llega en la lección 18."
}
```

## Cuándo lo usarías de verdad

- **Proteger una rama de rutas**: la sesión en la zona privada, y un segundo middleware más abajo para lo que solo ve un rol (el comité, la administración).
- **Medir y registrar**: lo que tarda cada navegación, con su método y su ruta; un identificador por navegación para seguir sus peticiones.
- **Preparar dependencias con `getContext`**: el cliente de la API, la configuración o un registrador, para no importarlos en cada `loader` y poder cambiarlos en los tests (lección 21).
- **Cargar una vez lo que necesitan la `action` y los `loader`**: el usuario, sus permisos, la temporada en curso.
- **Mirar el resultado después de `next()`**: por ejemplo, si algún `loader` acabó en 404, buscar en tu gestor de contenidos si esa dirección se movió y redirigir. La documentación lo llama *CMS Redirect on 404*.

Y cuándo no: para los datos de una sola ruta, su `loader`; para lo que necesita un componente, lo que devuelva un `loader`; y para guardar algo entre navegaciones, ni el contexto (es nuevo en cada una) ni el middleware.

## Errores típicos

**Llamar a `next()` sin esperarlo.** Parece inofensivo: en el peor caso, piensas, la medida saldría mal.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "const medir: MiddlewareFunction = async ({ request }, next) => {\n  const inicio = performance.now()\n  next() // sin await\n  console.log(`${new URL(request.url).pathname} · ${Math.round(performance.now() - inicio)} ms`)\n}\n\n// La misma cadena de antes:\n// raíz (medir) > privada (exigirSesion, cargarPrivada) > designaciones (cargarDesignaciones)\n// Recargas /designaciones.",
  "opciones": [
    "La medida sale con 0 o 1 ms, y todo lo demás funciona igual",
    "La medida sale con 1 ms, y el middleware de la zona privada y cada loader se ejecutan dos veces",
    "Error: «You may only call `next()` once per middleware»",
    "La navegación no termina nunca"
  ],
  "correcta": 1,
  "explicacion": "medir termina sin esperar a su next(), así que el router cree que no lo ha llamado y lo llama por su cuenta: la cadena de debajo arranca dos veces. Comprobado: privada: antes sale dos veces, cada loader empieza dos veces y la medida dice 1 ms. Con un loader que pide datos, cada petición sale duplicada. TypeScript no avisa. La regla: await next() o return next()."
}
```

**Leer una llave que nadie ha puesto.** Un `loader` que lee `arbitroContext` en una ruta que no pasa por `exigirSesion` lanza `No value found for context`. Lee cada llave solo debajo del middleware que la pone, o dale un valor por defecto.

**Importar `createContext` de React.** El autocompletado ofrece los dos. TypeScript lo para con `has no properties in common with type 'RouterContext<unknown>'`; si ves ese mensaje, mira de dónde viene la llave.

**Esperar a que un middleware que falla se quede en su página.** Las designaciones tienen su propio `ErrorBoundary`. Piensa qué pasa si el que falla es el middleware de la sesión:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "{\n  id: 'raiz', ErrorBoundary: ErrorRaiz, // «La zona de árbitros no está disponible ahora mismo»\n  children: [\n    {\n      id: 'privada', middleware: [exigirSesion], loader: cargarArbitro, // sin ErrorBoundary\n      children: [\n        {\n          id: 'designaciones', loader: cargarDesignaciones,\n          ErrorBoundary: () => <p role=\"alert\">No se han podido cargar tus designaciones.</p>,\n        },\n      ],\n    },\n  ],\n}\n\n// Desde «Mi ficha» pulsas «Mis designaciones», y GET /api/sesion/1\n// responde 500: quienSoy lanza, dentro de exigirSesion. ¿Qué ves?",
  "opciones": [
    "La zona privada con «No se han podido cargar tus designaciones.»",
    "Toda la página sustituida por «La zona de árbitros no está disponible ahora mismo»",
    "Sigues en «Mi ficha»: un middleware que falla cancela la navegación",
    "La página de entrar, porque sin sesión comprobada no hay sesión"
  ],
  "correcta": 1,
  "explicacion": "El error salta antes del next() de exigirSesion, en la ruta privada, y no se ha ejecutado ningún loader. El router busca el límite desde privada hacia arriba (si hubiera un loader más arriba que fuera a ejecutarse, desde ese), nunca en las hijas: sin datos, no puede pintarlas. Privada no tiene, así que llega a la raíz. Comprobado. En cambio, si falla el loader de las designaciones, lo recoge su propio límite. Ponle un ErrorBoundary a la ruta del middleware."
}
```

La documentación lo explica así: si el middleware lanza **antes** de `next()`, no hay datos que pintar, y el router busca el límite a partir de la ruta más alta con un `loader` (comprobado: la más alta cuyo `loader` iba a ejecutarse en esa navegación, o la del middleware si está más arriba); si lanza **después**, el error se queda en su ruta, porque los `loader` ya tienen sus datos. Adónde sube cada error lo viste en la lección 8, y el `onError` de `RouterProvider` también se entera de los del middleware (comprobado).

**Usar el contexto como almacén.** Guardar algo en el contexto en una navegación y buscarlo en la siguiente no funciona: cada navegación empieza con uno nuevo. Lo único que comparten dos pasadas es un envío y su revalidación.

**Esperar al envío de una medida.** Un `await` detrás del `next()` de la raíz retrasa todas las navegaciones lo que tarde ese envío.

**Creer que el middleware protege los datos.** Protege la interfaz. El servidor decide en cada petición (lección 102 de React y lección 18).

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "El middleware se ejecuta una vez por navegación",
      "realidad": "En un envío, dos: una pasada para la action y otra para la revalidación, con el mismo contexto. Y si algo redirige, la navegación redirigida vuelve a pasar por la cadena con un contexto nuevo."
    },
    {
      "mito": "Si la ruta no tiene loader, su middleware no se ejecuta",
      "realidad": "El middleware de cliente se ejecuta en cada navegación que pase por su ruta, haya loader que ejecutar o no. Por eso protege también Mi ficha, que no tiene loader."
    },
    {
      "mito": "El contexto del router se lee con useContext",
      "realidad": "Solo lo ven los middleware, los loader y las action. Lo que necesite un componente, que lo devuelva un loader, y el componente lo lee con useLoaderData o useRouteLoaderData."
    },
    {
      "mito": "Si lanzo un error en el middleware, lo recoge el ErrorBoundary de la página a la que iba",
      "realidad": "Solo si lanza después de next(). Antes de next() no hay datos para pintar esa página, y el error sube desde la ruta del middleware, o desde una más alta."
    }
  ]
}
```

## Ejercicios

**1. La zona privada, con middleware.** El punto de partida es la zona de árbitros protegida como en la 102, con un `loader`. Debajo de «Mis designaciones» hay un contador de depuración, «Consultas de sesión en esta visita», que cuenta las veces que la app ha preguntado por la sesión desde que cargó la página. Las comprobaciones usan la API simulada con 100 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: de loader a middleware",
  "consigna": "Pasa la protección a middleware. En sesion.ts, crea arbitroContext con createContext<Arbitro>() y el middleware exigirSesion: sin sesión, redirect a /entrar?volver=…; con sesión, el árbitro al contexto. En App.tsx, ponlo en la ruta privada. En privada.tsx, que cargarArbitro y cargarDesignaciones lean el árbitro del contexto en vez de preguntar. Con la sesión caducada, «Confirmar» no debe confirmar nada. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "sesion.ts",
      "codigo": "import { createContext, redirect, type MiddlewareFunction } from 'react-router'\nimport { quienSoy, type Arbitro } from './api'\n\n// TODO: arbitroContext, con createContext<Arbitro>(), y el middleware\n// exigirSesion: si no hay sesión, a /entrar?volver=…; si la hay, el árbitro\n// al contexto. Después, ponlo en la ruta privada de App.tsx.\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { accionEntrar, accionSalir, Entrar, ErrorRaiz, Marco, Portada } from './paginas'\nimport {\n  cargarDesignaciones, confirmar, Designaciones, exigirSesion, Ficha, ZonaPrivada,\n} from './privada'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    Component: Marco,\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la zona de árbitros…</p>,\n    children: [\n      { index: true, Component: Portada },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        loader: exigirSesion,\n        Component: ZonaPrivada,\n        children: [\n          {\n            id: 'designaciones',\n            path: 'designaciones',\n            loader: cargarDesignaciones,\n            action: confirmar,\n            Component: Designaciones,\n          },\n          { id: 'ficha', path: 'ficha', Component: Ficha },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "privada.tsx",
      "codigo": "import { useState } from 'react'\nimport {\n  Form, Outlet, redirect, useLoaderData, useRouteLoaderData,\n  type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { consultasDeSesion, guardarSesion, pedir, quienSoy, type Designacion } from './api'\n\n// TODO: pasa esta comprobación a un middleware (en sesion.ts)\nexport async function exigirSesion({ request }: LoaderFunctionArgs) {\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  return arbitro\n}\n\nexport function ZonaPrivada() {\n  const arbitro = useLoaderData<typeof exigirSesion>()\n  const [caducada, setCaducada] = useState(false)\n  async function caducar() {\n    await guardarSesion(null) // como si la sesión caducara en el servidor\n    setCaducada(true)\n  }\n  return (\n    <>\n      <div className=\"sesion\">\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {arbitro.nombre} <button>Salir</button>\n        </Form>\n        <button type=\"button\" onClick={caducar}>Caducar la sesión</button>\n        {caducada && <p>La sesión ha caducado en el servidor.</p>}\n      </div>\n      <Outlet />\n    </>\n  )\n}\n\n// TODO: lee el árbitro del contexto en vez de volver a preguntar\nexport async function cargarDesignaciones({ request }: LoaderFunctionArgs) {\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) return { designaciones: [], consultas: consultasDeSesion() }\n  const url = `/api/designaciones?q=${arbitro.licencia}`\n  const designaciones = await pedir<Designacion[]>(url, { signal: request.signal })\n  return { designaciones, consultas: consultasDeSesion() }\n}\n\nexport async function confirmar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('id')\n  await pedir(`/api/designaciones/${id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ confirmada: true }),\n  })\n  return null\n}\n\nexport function Designaciones() {\n  const { designaciones, consultas } = useLoaderData<typeof cargarDesignaciones>()\n  return (\n    <>\n      <h2>Mis designaciones</h2>\n      <ul>\n        {designaciones.map((d) => (\n          <li key={d.id}>\n            {d.partido} · {d.cuando} · {d.pabellon}{' '}\n            {d.confirmada ? (\n              <strong>Confirmada</strong>\n            ) : (\n              <Form method=\"post\">\n                <button name=\"id\" value={d.id}>Confirmar</button>\n              </Form>\n            )}\n          </li>\n        ))}\n      </ul>\n      <p className=\"depuracion\">Consultas de sesión en esta visita: {consultas}</p>\n    </>\n  )\n}\n\nexport function Ficha() {\n  const arbitro = useRouteLoaderData<typeof exigirSesion>('privada')!\n  return (\n    <>\n      <h2>Mi ficha</h2>\n      <p>Licencia {arbitro.licencia} · {arbitro.categoria}</p>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import {\n  Form, Link, Outlet, redirect, useNavigation, useRouteError, useSearchParams,\n  type ActionFunctionArgs,\n} from 'react-router'\nimport { destinoSeguro, guardarSesion, pedir, type Arbitro } from './api'\n\nexport function Marco() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Árbitros · Liga Comarcal del Júcar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Portada</Link> <Link to=\"/designaciones\">Mis designaciones</Link>{' '}\n          <Link to=\"/ficha\">Mi ficha</Link>\n        </nav>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La zona de árbitros no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h2>Portada</h2>\n      <p>Designaciones de la jornada 6. Los árbitros las consultan y confirman desde su zona.</p>\n    </>\n  )\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  await guardarSesion(await pedir<Arbitro>(`/api/arbitros/${datos.get('arbitro')}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <Form method=\"post\">\n      <h2>Entrar</h2>\n      {volver && <p>Para ver {volver}, entra primero.</p>}\n      <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n      <button name=\"arbitro\" value=\"1\">Entrar como Lucía Garrido</button>{' '}\n      <button name=\"arbitro\" value=\"2\">Entrar como Íñigo Sanz</button>\n    </Form>\n  )\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/')\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "// Hace de servidor. La API simulada guarda la sesión en /api/sesion/1, y\n// sobrevive a «Recargar» como la cookie de la lección 102 de React.\nexport type Arbitro = { id: number; nombre: string; licencia: string; categoria: string }\n\nexport type Designacion = {\n  id: number\n  partido: string\n  cuando: string\n  pabellon: string\n  confirmada: boolean\n}\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// Contador de depuración: consultas de sesión desde que cargó la página\nlet consultas = 0\nexport const consultasDeSesion = () => consultas\n\n// Es el GET /api/yo de la 102: ¿de quién es esta sesión?\nexport async function quienSoy(signal?: AbortSignal) {\n  consultas++\n  const sesion = await pedir<{ arbitro: Arbitro | null }>('/api/sesion/1', { signal })\n  return sesion.arbitro\n}\n\nexport async function guardarSesion(arbitro: Arbitro | null) {\n  await pedir('/api/sesion/1', {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ arbitro }),\n  })\n}\n\n// Solo direcciones de tu propio origen (lección 102 de React; a fondo, en la 20)\nexport function destinoSeguro(volver: string | null, base: string) {\n  const url = new URL(volver ?? '/designaciones', base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/designaciones'\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #2a1f17;\n  background: #faf6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #7a3412;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1.2rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nli form {\n  display: inline;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #6b5a4c;\n}\n\n.sesion {\n  margin-bottom: 0.6rem;\n  font-size: 0.9rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 0.75rem;\n}\n\n.sesion form {\n  display: inline;\n}\n\n.sesion p {\n  margin: 0;\n}\n\n.depuracion {\n  margin-top: 0.8rem;\n  font-size: 0.85rem;\n  color: #6b5a4c;\n}\n"
    }
  ],
  "archivoInicial": "sesion.ts",
  "urlInicial": "/designaciones",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "arbitro": null
      }
    ],
    "arbitros": [
      {
        "id": 1,
        "nombre": "Lucía Garrido",
        "licencia": "CU-0412",
        "categoria": "Primera comarcal"
      },
      {
        "id": 2,
        "nombre": "Íñigo Sanz",
        "licencia": "CU-0388",
        "categoria": "Segunda comarcal"
      }
    ],
    "designaciones": [
      {
        "id": 1,
        "licencia": "CU-0412",
        "partido": "CB Huete – Tarancón Basket",
        "cuando": "Sábado 7, 18:00",
        "pabellon": "Pabellón de Huete",
        "confirmada": false
      },
      {
        "id": 2,
        "licencia": "CU-0412",
        "partido": "Motilla CB – Las Pedroñeras",
        "cuando": "Domingo 8, 12:00",
        "pabellon": "Pabellón de Motilla del Palancar",
        "confirmada": false
      },
      {
        "id": 3,
        "licencia": "CU-0388",
        "partido": "San Clemente – Quintanar Basket",
        "cuando": "Sábado 7, 17:00",
        "pabellon": "Pabellón de San Clemente",
        "confirmada": true
      }
    ]
  },
  "red": {
    "latencia": 100
  },
  "comprobaciones": [
    {
      "descripcion": "Sin sesión, «Mis designaciones» te lleva a entrar con la página de vuelta en la dirección",
      "urlInicial": "/designaciones",
      "pasos": [],
      "espera": {
        "url": "/entrar?volver=%2Fdesignaciones"
      }
    },
    {
      "descripcion": "Al entrar como Íñigo Sanz, vuelves a sus designaciones",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Íñigo Sanz"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "San Clemente – Quintanar Basket"
      }
    },
    {
      "descripcion": "Cada navegación pregunta una sola vez por la sesión: tras entrar, el contador marca 2",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        }
      ],
      "espera": {
        "texto": "Consultas de sesión en esta visita: 2"
      }
    },
    {
      "descripcion": "Con la sesión caducada, «Confirmar» te manda a entrar y el partido sigue sin confirmar",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Caducar la sesión"
          }
        },
        {
          "pulsar": {
            "texto": "La sesión ha caducado en el servidor."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Pabellón de Huete Confirmar"
      }
    },
    {
      "descripcion": "Con la sesión abierta, recargar «Mi ficha» no te saca de la página",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Mis designaciones"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Mi ficha"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Mi ficha"
          }
        },
        {
          "recargar": true
        }
      ],
      "espera": {
        "texto": "Licencia CU-0412 · Primera comarcal"
      }
    },
    {
      "descripcion": "Desde la portada, «Mi ficha» sin sesión también pide entrar",
      "urlInicial": "/",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Mi ficha"
          }
        }
      ],
      "espera": {
        "url": "/entrar?volver=%2Fficha"
      }
    }
  ]
}
```

**2. Medir, y no preguntar dos veces.** La zona de árbitros ya está protegida con middleware y tiene una página nueva, «Medidas», que lista lo que guarda `guardarMedida` (`POST /api/medidas`). Falta escribir la medida y aprovechar el contexto compartido de los envíos. Las comprobaciones usan 100 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: medir y compartir",
  "consigna": "En sesion.ts, escribe medirNavegacion: que guarde cada medida con guardarMedida({ metodo, ruta, ms }), con el pathname como ruta, sin esperar a que conteste el servidor. Las verás en «Medidas». Después, haz que un envío pregunte por la sesión una sola vez: cambia arbitroContext a createContext<Arbitro | null>(null), sal de exigirSesion si ya hay árbitro y arregla los errores de tipos que salgan en privada.tsx. Mira el contador de consultas antes y después.",
  "archivos": [
    {
      "nombre": "sesion.ts",
      "codigo": "import { createContext, redirect, type MiddlewareFunction } from 'react-router'\nimport { guardarMedida, quienSoy, type Arbitro } from './api'\n\nexport const arbitroContext = createContext<Arbitro>()\n\n// TODO (1): mide cada navegación y guárdala con guardarMedida({ metodo, ruta, ms }),\n// sin esperar a que el servidor conteste\nexport const medirNavegacion: MiddlewareFunction = async () => {}\n\n// TODO (2): en un envío, que no vuelva a preguntar en la revalidación\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const arbitro = await quienSoy(request.signal)\n  if (!arbitro) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(arbitroContext, arbitro)\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport {\n  accionEntrar, accionSalir, cargarMedidas, Entrar, ErrorRaiz, Marco, Medidas, Portada,\n} from './paginas'\nimport {\n  cargarArbitro, cargarDesignaciones, confirmar, Designaciones, Ficha, ZonaPrivada,\n} from './privada'\nimport { exigirSesion, medirNavegacion } from './sesion'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    middleware: [medirNavegacion],\n    Component: Marco,\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la zona de árbitros…</p>,\n    children: [\n      { index: true, Component: Portada },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      { path: 'medidas', loader: cargarMedidas, Component: Medidas },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarArbitro,\n        Component: ZonaPrivada,\n        children: [\n          {\n            id: 'designaciones',\n            path: 'designaciones',\n            loader: cargarDesignaciones,\n            action: confirmar,\n            Component: Designaciones,\n          },\n          { id: 'ficha', path: 'ficha', Component: Ficha },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "privada.tsx",
      "codigo": "import { useState } from 'react'\nimport {\n  Form, Outlet, useLoaderData, useRouteLoaderData,\n  type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { consultasDeSesion, guardarSesion, pedir, type Designacion } from './api'\nimport { arbitroContext } from './sesion'\n\n// Los componentes no ven el contexto del router: se lo pasa un loader\nexport function cargarArbitro({ context }: LoaderFunctionArgs) {\n  return context.get(arbitroContext)\n}\n\nexport function ZonaPrivada() {\n  const arbitro = useLoaderData<typeof cargarArbitro>()\n  const [caducada, setCaducada] = useState(false)\n  async function caducar() {\n    await guardarSesion(null) // como si la sesión caducara en el servidor\n    setCaducada(true)\n  }\n  return (\n    <>\n      <div className=\"sesion\">\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {arbitro.nombre} <button>Salir</button>\n        </Form>\n        <button type=\"button\" onClick={caducar}>Caducar la sesión</button>\n        {caducada && <p>La sesión ha caducado en el servidor.</p>}\n      </div>\n      <Outlet />\n    </>\n  )\n}\n\nexport async function cargarDesignaciones({ request, context }: LoaderFunctionArgs) {\n  const url = `/api/designaciones?q=${context.get(arbitroContext).licencia}`\n  const designaciones = await pedir<Designacion[]>(url, { signal: request.signal })\n  return { designaciones, consultas: consultasDeSesion() }\n}\n\nexport async function confirmar({ request, context }: ActionFunctionArgs) {\n  const arbitro = context.get(arbitroContext)\n  const id = (await request.formData()).get('id')\n  await pedir(`/api/designaciones/${id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ confirmada: true, confirmadaPor: arbitro.nombre }),\n  })\n  return null\n}\n\nexport function Designaciones() {\n  const { designaciones, consultas } = useLoaderData<typeof cargarDesignaciones>()\n  return (\n    <>\n      <h2>Mis designaciones</h2>\n      <ul>\n        {designaciones.map((d) => (\n          <li key={d.id}>\n            {d.partido} · {d.cuando} · {d.pabellon}{' '}\n            {d.confirmada ? (\n              <strong>Confirmada</strong>\n            ) : (\n              <Form method=\"post\">\n                <button name=\"id\" value={d.id}>Confirmar</button>\n              </Form>\n            )}\n          </li>\n        ))}\n      </ul>\n      <p className=\"depuracion\">Consultas de sesión en esta visita: {consultas}</p>\n    </>\n  )\n}\n\nexport function Ficha() {\n  const arbitro = useRouteLoaderData<typeof cargarArbitro>('privada')!\n  return (\n    <>\n      <h2>Mi ficha</h2>\n      <p>Licencia {arbitro.licencia} · {arbitro.categoria}</p>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import {\n  Form, Link, Outlet, redirect, useLoaderData, useNavigation, useRouteError, useSearchParams,\n  type ActionFunctionArgs,\n} from 'react-router'\nimport { destinoSeguro, guardarSesion, pedir, type Arbitro, type Medida } from './api'\n\nexport function Marco() {\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Árbitros · Liga Comarcal del Júcar</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/\">Portada</Link> <Link to=\"/designaciones\">Mis designaciones</Link>{' '}\n          <Link to=\"/ficha\">Mi ficha</Link> <Link to=\"/medidas\">Medidas</Link>\n        </nav>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La zona de árbitros no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport function Portada() {\n  return (\n    <>\n      <h2>Portada</h2>\n      <p>Designaciones de la jornada 6. Los árbitros las consultan y confirman desde su zona.</p>\n    </>\n  )\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  await guardarSesion(await pedir<Arbitro>(`/api/arbitros/${datos.get('arbitro')}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <Form method=\"post\">\n      <h2>Entrar</h2>\n      {volver && <p>Para ver {volver}, entra primero.</p>}\n      <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n      <button name=\"arbitro\" value=\"1\">Entrar como Lucía Garrido</button>{' '}\n      <button name=\"arbitro\" value=\"2\">Entrar como Íñigo Sanz</button>\n    </Form>\n  )\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/')\n}\n\nexport async function cargarMedidas() {\n  return pedir<Medida[]>('/api/medidas')\n}\n\nexport function Medidas() {\n  const medidas = useLoaderData<typeof cargarMedidas>()\n  return (\n    <>\n      <h2>Medidas</h2>\n      {medidas.length === 0 && <p>Todavía no hay medidas.</p>}\n      <ul>\n        {medidas.map((m) => (\n          <li key={m.id}>{m.metodo} {m.ruta} · {m.ms} ms</li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "// Hace de servidor. La API simulada guarda la sesión en /api/sesion/1, y\n// sobrevive a «Recargar» como la cookie de la lección 102 de React.\nexport type Arbitro = { id: number; nombre: string; licencia: string; categoria: string }\n\nexport type Medida = { id?: number; metodo: string; ruta: string; ms: number }\n\nexport type Designacion = {\n  id: number\n  partido: string\n  cuando: string\n  pabellon: string\n  confirmada: boolean\n}\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\n// Contador de depuración: consultas de sesión desde que cargó la página\nlet consultas = 0\nexport const consultasDeSesion = () => consultas\n\n// Es el GET /api/yo de la 102: ¿de quién es esta sesión?\nexport async function quienSoy(signal?: AbortSignal) {\n  consultas++\n  const sesion = await pedir<{ arbitro: Arbitro | null }>('/api/sesion/1', { signal })\n  return sesion.arbitro\n}\n\nexport async function guardarSesion(arbitro: Arbitro | null) {\n  await pedir('/api/sesion/1', {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ arbitro }),\n  })\n}\n\n// Solo direcciones de tu propio origen (lección 102 de React; a fondo, en la 20)\nexport function destinoSeguro(volver: string | null, base: string) {\n  const url = new URL(volver ?? '/designaciones', base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/designaciones'\n}\n\n// Guarda una medida en el servidor (POST /api/medidas)\nexport async function guardarMedida(medida: Medida) {\n  await pedir('/api/medidas', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(medida),\n  })\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #2a1f17;\n  background: #faf6f1;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #7a3412;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1.2rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\nli form {\n  display: inline;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #6b5a4c;\n}\n\n.sesion {\n  margin-bottom: 0.6rem;\n  font-size: 0.9rem;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 0.75rem;\n}\n\n.sesion form {\n  display: inline;\n}\n\n.sesion p {\n  margin: 0;\n}\n\n.depuracion {\n  margin-top: 0.8rem;\n  font-size: 0.85rem;\n  color: #6b5a4c;\n}\n"
    }
  ],
  "archivoInicial": "sesion.ts",
  "urlInicial": "/designaciones",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "arbitro": null
      }
    ],
    "arbitros": [
      {
        "id": 1,
        "nombre": "Lucía Garrido",
        "licencia": "CU-0412",
        "categoria": "Primera comarcal"
      },
      {
        "id": 2,
        "nombre": "Íñigo Sanz",
        "licencia": "CU-0388",
        "categoria": "Segunda comarcal"
      }
    ],
    "designaciones": [
      {
        "id": 1,
        "licencia": "CU-0412",
        "partido": "CB Huete – Tarancón Basket",
        "cuando": "Sábado 7, 18:00",
        "pabellon": "Pabellón de Huete",
        "confirmada": false
      },
      {
        "id": 2,
        "licencia": "CU-0412",
        "partido": "Motilla CB – Las Pedroñeras",
        "cuando": "Domingo 8, 12:00",
        "pabellon": "Pabellón de Motilla del Palancar",
        "confirmada": false
      },
      {
        "id": 3,
        "licencia": "CU-0388",
        "partido": "San Clemente – Quintanar Basket",
        "cuando": "Sábado 7, 17:00",
        "pabellon": "Pabellón de San Clemente",
        "confirmada": true
      }
    ],
    "medidas": []
  },
  "red": {
    "latencia": 100
  },
  "comprobaciones": [
    {
      "descripcion": "Cada navegación deja su medida: después de pasar por «Mi ficha», «Medidas» enseña GET /ficha",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Mis designaciones"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Mi ficha"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Mi ficha"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Medidas"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "GET /ficha ·"
      }
    },
    {
      "descripcion": "La pasada de la action de un envío queda medida como POST /designaciones",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Pabellón de Huete Confirmada"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Medidas"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "POST /designaciones ·"
      }
    },
    {
      "descripcion": "Confirmar pregunta una sola vez por la sesión: después del envío, el contador marca 3",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        },
        {
          "pulsar": {
            "texto": "Consultas de sesión en esta visita: 2"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar"
          }
        }
      ],
      "espera": {
        "texto": "Consultas de sesión en esta visita: 3"
      }
    },
    {
      "descripcion": "Confirmar sigue confirmando el partido",
      "urlInicial": "/designaciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Lucía Garrido"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Pabellón de Huete Confirmada"
      }
    },
    {
      "descripcion": "Sin sesión, la zona privada sigue pidiendo entrar",
      "urlInicial": "/ficha",
      "pasos": [],
      "espera": {
        "url": "/entrar?volver=%2Fficha"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade a la zona privada una sección «Partidos de Primera» solo para los árbitros de Primera comarcal: un segundo middleware en esa ruta hija que lea el árbitro del contexto y, si su `categoria` no es «Primera comarcal», lance `data('Solo para árbitros de Primera', { status: 403 })` (lección 8). Mira en el registro en qué orden corren los dos middleware, y ponle a la ruta su `ErrorBoundary`.
2. Haz que `medirNavegacion` guarde una sola medida por envío: en la pasada de la `action`, deja el instante de inicio en el contexto; en la de la revalidación, si lo encuentras, mide desde ahí.
3. Con `getContext`, mete en el contexto un cliente de la API que cuente sus peticiones, haz que `quienSoy`, los `loader` y la `action` pidan a través de él, y añade a cada medida cuántas peticiones hizo esa navegación.
4. En la raíz, lee lo que devuelve `await next()` y, si algún `loader` acabó en un 404 (`isRouteErrorResponse(r.result) && r.result.status === 404`), apúntalo en las medidas. Es el punto de partida del patrón *CMS Redirect on 404* de la documentación.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Middleware y contexto en React Router",
  "recursos": [
    {
      "titulo": "Middleware",
      "descripcion": "La guía de React Router: la cadena, next(), el contexto, getContext, la diferencia entre cliente y servidor y los patrones habituales (autenticación, registro, compartir datos).",
      "url": "https://reactrouter.com/how-to/middleware",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Route Object: middleware",
      "descripcion": "Dónde va la lista de middleware en un objeto de ruta del modo datos.",
      "url": "https://reactrouter.com/start/data/route-object",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "createContext",
      "descripcion": "Referencia de las llaves tipadas del contexto y de su valor por defecto.",
      "url": "https://reactrouter.com/api/utils/createContext",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "RouterContextProvider",
      "descripcion": "La clase del context que reciben middleware, loader y action, con get y set.",
      "url": "https://reactrouter.com/api/utils/RouterContextProvider",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "createBrowserRouter: getContext",
      "descripcion": "La opción que crea el contexto con el que empieza cada navegación o llamada de fetcher.",
      "url": "https://reactrouter.com/api/data-routers/createBrowserRouter",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Instrumentation",
      "descripcion": "La API para medir navegaciones, fetchers, loader, action y middleware por separado; la verás en la lección 22.",
      "url": "https://reactrouter.com/how-to/instrumentation",
      "etiqueta": "reactrouter.com"
    }
  ]
}
```
