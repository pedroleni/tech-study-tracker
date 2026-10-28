# Fetchers a fondo: enviar y cargar sin navegar, varios a la vez

- **Módulo:** Cargar y enviar datos
- **Slug:** `fetchers-a-fondo-enviar-y-cargar-sin-navegar-varios-a-la-vez` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Using Fetchers](https://reactrouter.com/how-to/fetchers) + [Network Concurrency Management](https://reactrouter.com/explanation/concurrency) + [useFetcher](https://reactrouter.com/api/hooks/useFetcher) + [useFetchers](https://reactrouter.com/api/hooks/useFetchers) — ver `contenido/react-router/TEMARIO.md` #5
- **Requiere:** Las lecciones 3 (`action`, `<Form>` y `useSubmit`) y 4 (revalidación) de esta ficha, y la 99 de React (la estrella de favoritos con `useFetcher`)

---

## Qué es y para qué sirve

La Oficina de Turismo de Cuenca tiene en su web un planificador: «Planifica tu visita». Ves la lista de sitios (las Casas Colgadas, la catedral, el puente de San Pablo, la Ciudad Encantada…), añades a tu visita los que te interesan, buscas uno escribiendo su nombre y, si quieres, te apuntas en el pie de la página a la agenda cultural de los viernes.

Ninguna de esas tres cosas debería cambiar de página. Si añadir la Torre de Mangana fuera un `<Form>`, sería una navegación (lección 3): una sola a la vez, con su entrada en el historial y con `useNavigation` ocupado. Quien añade cinco sitios seguidos esperaría cinco veces. Las sugerencias del buscador tampoco son una página: son una lista que aparece y desaparece mientras escribes.

En la lección 99 de React viste la herramienta para esto en una estrella de favoritos: **un fetcher es un envío o una carga con su propio estado, que no navega**. La lección 3 terminó preguntando «¿por qué no un fetcher?». Aquí lo ves entero:

- las tres formas de usarlo: `fetcher.Form`, `fetcher.submit` y `fetcher.load`;
- lo que lleva dentro: `state`, `formData`, `formAction` y `data`;
- una `key` para que dos componentes compartan el mismo fetcher, y `useFetchers` para verlos todos;
- qué hace el router cuando hay varias peticiones a la vez;
- un buscador que sugiere mientras escribes, `fetcher.reset()` y lo que cambió en la 8.5;
- y adónde va el error de un fetcher, que no es donde casi todo el mundo espera.

La lección 6 se apoya en todo esto para la interfaz optimista.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "React Router 8.5.0 de verdad, con su registro",
  "contenido": "Los bloques en vivo ejecutan React Router 8.5.0 en TSX, escritos como en un proyecto de Vite: createBrowserRouter usa aquí un historial en memoria, y la barra lo dice. En varios bloques, debajo de la vista previa sale el «Registro del router»: una línea por cada cosa que hace el router, también por cada llamada de un fetcher, con sus action y sus loader. Debajo, el panel de red de la API simulada enseña cada petición, y las canceladas."
}
```

## Tres maneras de usar un fetcher

`useFetcher()` te da un objeto con tres formas de ponerlo a trabajar. Las tres llaman a la `action` o al `loader` de una ruta, como lo haría una navegación, pero sin moverte de donde estás:

```laboratorio
{
  "tipo": "roles",
  "titulo": "fetcher.Form, fetcher.submit y fetcher.load",
  "roles": [
    {
      "etiqueta": "<fetcher.Form>",
      "rol": "Un formulario que no navega",
      "descripcion": "Es literalmente un <Form navigate={false}> atado a este fetcher. Con method=\"post\" llama a la action de su ruta; con method=\"get\", al loader."
    },
    {
      "etiqueta": "fetcher.submit()",
      "rol": "useSubmit, sin navegar",
      "descripcion": "Envía desde el código: un formulario, un FormData, un objeto o JSON. Mismas opciones y mismos valores por defecto que useSubmit (lección 3): sin method, es un GET."
    },
    {
      "etiqueta": "fetcher.load(href)",
      "rol": "Cargar sin navegar",
      "descripcion": "Un GET al loader de esa dirección. El resultado queda en fetcher.data, sin cambiar de página. Es lo de un buscador con sugerencias."
    }
  ]
}
```

Dos reglas valen para las tres:

- **Solo se ejecuta la ruta hoja.** `fetcher.load('/buscar?q=museo')` ejecuta el `loader` de `/buscar`, no el de la raíz que la envuelve. Lo verás en el registro: «loader buscar» y nada más.
- **Sin `action`, va a la ruta que pinta el fetcher.** Como `<Form>` y `useSubmit` (lección 3): la ruta más cercana al componente, no la dirección de la barra. Por eso casi siempre le darás una `action` explícita.

En la app de Cuenca, `/sitios/:id/visita` es una ruta sin componente, solo con su `action`, igual que la de los favoritos de la lección 99. Cada fila de la lista tiene su propio fetcher, que envía ahí:

```tsx
function FilaSitio({ sitio }: { sitio: Sitio }) {
  const fetcher = useFetcher<typeof cambiarVisita>()
  // …
  <fetcher.Form method="post" action={`/sitios/${sitio.id}/visita`}>
    <input type="hidden" name="enVisita" value={sitio.enVisita ? 'no' : 'si'} />
    <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>
  </fetcher.Form>
}
```

Pruébalo con la red lenta:

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useLoaderData } from 'react-router'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Sitios.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 1200
  },
  "titulo": "Tres sitios a la vez, sin navegar",
  "consigna": "Pulsa «Añadir» en las Casas Colgadas, el puente de San Pablo y la Torre de Mangana, seguidos. Las tres filas dicen «Guardando…» a la vez y la dirección no cambia. En el registro del router, cada fila es una operación «Fetcher «…» · POST /sitios/1/visita», con su action en «Envío» y, en «Revalidación», los loader de / y de sitios. «En tu visita» sube cuando llegan.",
  "mostrarRouter": true
}
```

Tres cosas que mirar en el registro:

- **Cada fetcher es una operación aparte**, y las tres empiezan sin esperar a las demás. Un `<Form>` no podría: la segunda navegación habría cancelado la primera.
- **Un envío de fetcher revalida la página**, como uno de `<Form>`: después de la `action` vuelven a ejecutarse los `loader` de `/` y de `sitios`, con las mismas reglas de la lección 4. Así «En tu visita» y las marcas ✓ salen del servidor, sin que actualices nada a mano.
- **El nombre entre comillas** («_r_0_», «_r_2_»…) es la `key` del fetcher. Si no le das una, React Router se la inventa con `useId` (lección 37 de React). Más abajo le darás un nombre. Y el «acabó en /sitios» de cada línea es solo la dirección de la página al terminar: un fetcher no la cambia.

## Lo que lleva un fetcher: `state`, `formData`, `formAction` y `data`

Lo que devuelve `useFetcher()` es, además de `Form`, `submit`, `load` y `reset`, el estado de ese fetcher. Este chivato lo pinta tal cual en cada render. Usa un solo fetcher para las cuatro formas de llamarlo, para comparar en la misma tabla; en una app de verdad tendrías un fetcher para cada cosa.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher } from 'react-router'\n\n// Un solo fetcher para las cuatro formas de llamarlo, y así comparar\n// en la misma tabla. En una app de verdad, un fetcher para cada cosa.\nexport default function Sitios() {\n  const fetcher = useFetcher()\n  const campos = fetcher.formData ? JSON.stringify(Object.fromEntries(fetcher.formData)) : 'undefined'\n\n  return (\n    <section>\n      <h2>Torre de Mangana</h2>\n      <fetcher.Form method=\"post\" action=\"/sitios/5/visita\">\n        <input type=\"hidden\" name=\"enVisita\" value=\"si\" />\n        <button>Añadir con fetcher.Form</button>\n      </fetcher.Form>\n      <button onClick={() => fetcher.submit({ enVisita: 'no' }, { method: 'post', action: '/sitios/5/visita' })}>\n        Quitar con fetcher.submit\n      </button>{' '}\n      <button onClick={() => fetcher.load('/buscar?q=museo')}>Sugerir museos con fetcher.load</button>{' '}\n      <button onClick={() => fetcher.submit({ q: 'torre' }, { action: '/buscar' })}>\n        Buscar «torre» con fetcher.submit\n      </button>\n      <aside className=\"chivato\" aria-label=\"Lo que lleva el fetcher\">\n        <p>\n          state: <strong>{fetcher.state}</strong>\n        </p>\n        <p>formMethod: {fetcher.formMethod ?? 'undefined'}</p>\n        <p>formAction: {fetcher.formAction ?? 'undefined'}</p>\n        <p>formData: {campos}</p>\n        <p>data: {fetcher.data === undefined ? 'undefined' : JSON.stringify(fetcher.data)}</p>\n      </aside>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useLoaderData } from 'react-router'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Sitios.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 1500
  },
  "titulo": "El chivato de un fetcher",
  "consigna": "Pulsa cada botón y mira el chivato mientras trabaja (la API tarda 1,5 s): «Añadir con fetcher.Form», después «Quitar con fetcher.submit», «Sugerir museos con fetcher.load» y «Buscar «torre» con fetcher.submit». Fíjate en state, formAction y en qué vale data mientras empieza la llamada siguiente.",
  "mostrarRouter": true
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un envío POST: submitting, loading, idle",
      "texto": "Mientras trabaja la action, state es submitting, formMethod es POST, formAction es /sitios/5/visita, formEncType es application/x-www-form-urlencoded y formData lleva los campos. Cuando la action responde, pasa a loading mientras se revalida la página: data ya trae lo que devolvió la action y formData sigue ahí. Al acabar, idle: los form… vuelven a undefined."
    },
    {
      "titulo": "fetcher.load: solo loading",
      "texto": "state pasa a loading y todos los form… siguen en undefined: no se envía nada. Al terminar, data es lo que devolvió el loader de /buscar."
    },
    {
      "titulo": "Un envío GET: nunca submitting",
      "texto": "fetcher.submit sin method es un GET al loader. state va directo a loading, formMethod es GET, formData lleva q=torre y formAction es /buscar, sin la búsqueda."
    },
    {
      "titulo": "data se queda",
      "texto": "Al acabar, el fetcher vuelve a idle pero data no se vacía. Y mientras trabaja la llamada siguiente, data sigue teniendo el resultado anterior hasta que llega el nuevo."
    },
    {
      "titulo": "formAction: adónde va el envío",
      "texto": "La ruta ya resuelta a la que va el envío. Desde otro componente, es lo que te dice qué se está guardando: lo usarás con useFetchers, y la lección 6 con la interfaz optimista."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "const fetcher = useFetcher()\n\n// 1. Pulsas «Sugerir museos con fetcher.load». Llega la respuesta:\n//    fetcher.data = [{ id: 4, nombre: 'Museo de Arte Abstracto Español' }, …]\n// 2. Pulsas «Añadir con fetcher.Form». La action tarda 1,5 s.\n\n// Durante ese segundo y medio, con state === 'submitting':\nfetcher.data // ?",
  "opciones": [
    "undefined: un envío nuevo vacía lo anterior",
    "Los dos museos: data sigue con el último resultado hasta que llega el nuevo",
    "{ error: null }: el router adelanta lo que devolverá la action",
    "null, como después de fetcher.reset()"
  ],
  "correcta": 1,
  "explicacion": "El router copia el data que había en el estado submitting (comprobado en el chivato y en su código). Solo cambia cuando responde la action. Si pintas fetcher.data mientras el fetcher trabaja, pintas lo de la llamada anterior: compruébalo con state antes de fiarte."
}
```

**En TSX, dale al fetcher el tipo de su función**, como a `useLoaderData` en la lección 2. Comprobado con TypeScript 6.0.3:

```tsx
const fila = useFetcher<typeof cambiarVisita>()
fila.data // { error: string } | { error: null } | undefined

const sugerencias = useFetcher<typeof buscarSitios>()
sugerencias.data // { id: number; nombre: string }[] | undefined

const sinTipo = useFetcher()
sinTipo.data // any
```

`data()` desaparece del tipo y queda lo que envuelve; `undefined` es «todavía no ha devuelto nada». Sin el genérico, `any`, y TypeScript no te avisa de nada. Los tipos de punta a punta son la lección 15.

## Un fetcher para dos componentes: `key`

Cada `useFetcher()` es un fetcher distinto, aunque llame a la misma ruta. Normalmente es lo que quieres: cada fila, el suyo. Pero a veces el formulario está en un sitio y quien tiene que enterarse, en otro. El boletín de la agenda se apunta en el pie, y el aviso de «Te has apuntado» tiene que salir en la cabecera, arriba, donde se ve.

Pasar el fetcher por props de un extremo a otro de la maquetación sería un engorro. **Con `useFetcher({ key: 'boletin' })`, todos los componentes que piden esa `key` reciben el mismo fetcher**: el mismo `state`, el mismo `data`, y cualquiera de ellos puede enviar o vaciarlo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useFetcher } from 'react-router'\nimport type { apuntarBoletin } from './datos'\n\n// El pie de todas las páginas\nexport default function Boletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  return (\n    <footer>\n      <p>Recibe cada viernes la agenda cultural de Cuenca.</p>\n      <boletin.Form method=\"post\" action=\"/boletin\" noValidate>\n        <label>\n          Tu correo <input type=\"email\" name=\"correo\" autoComplete=\"email\" />\n        </label>\n        <button disabled={boletin.state !== 'idle'}>Apuntarme</button>\n      </boletin.Form>\n      {boletin.data?.ok === false && <p role=\"alert\">{boletin.data.error}</p>}\n    </footer>\n  )\n}\n\n// En Maquetacion.tsx, en la cabecera:\nfunction AvisoBoletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  if (boletin.state === 'submitting') return <p>Apuntándote…</p>\n  if (!boletin.data?.ok) return null\n  return (\n    <p>\n      <span>Te has apuntado con {boletin.data.correo}</span>{' '}\n      <button onClick={() => boletin.reset()}>Cerrar</button>\n    </p>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  return (\n    <footer>",
      "nota": "El pie crea el fetcher con un nombre. Con key, el registro del router también lo llama así: «Fetcher «boletin» · POST /boletin»."
    },
    {
      "fragmento": "<boletin.Form method=\"post\" action=\"/boletin\" noValidate>",
      "nota": "Envía a la action de /boletin, otra ruta sin componente. noValidate deja que valide la action, que devuelve un 400 con su mensaje si el correo no lleva @."
    },
    {
      "fragmento": "{boletin.data?.ok === false && <p role=\"alert\">{boletin.data.error}</p>}",
      "nota": "El error se queda en el pie, junto al campo que hay que corregir."
    },
    {
      "fragmento": "function AvisoBoletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })",
      "nota": "Otro componente, en otra punta de la maquetación, con la misma key: es el mismo fetcher. Sin la key, sería uno nuevo, siempre en idle."
    },
    {
      "fragmento": "if (boletin.state === 'submitting') return <p>Apuntándote…</p>",
      "nota": "La cabecera se entera del envío que ha empezado en el pie."
    },
    {
      "fragmento": "<button onClick={() => boletin.reset()}>Cerrar</button>",
      "nota": "Vaciar el fetcher desde la cabecera también vacía el del pie: es el mismo. reset() lo ves a fondo más abajo."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Boletin.tsx",
      "codigo": "import { useFetcher } from 'react-router'\nimport type { apuntarBoletin } from './datos'\n\n// El pie de todas las páginas\nexport default function Boletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  return (\n    <footer>\n      <p>Recibe cada viernes la agenda cultural de Cuenca.</p>\n      <boletin.Form method=\"post\" action=\"/boletin\" noValidate>\n        <label>\n          Tu correo <input type=\"email\" name=\"correo\" autoComplete=\"email\" />\n        </label>\n        <button disabled={boletin.state !== 'idle'}>Apuntarme</button>\n      </boletin.Form>\n      {boletin.data?.ok === false && <p role=\"alert\">{boletin.data.error}</p>}\n    </footer>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useFetcher, useLoaderData } from 'react-router'\nimport Boletin from './Boletin'\nimport type { apuntarBoletin, cargarVisita } from './datos'\n\n// En la cabecera, lejos del pie: el mismo fetcher gracias a la key\nfunction AvisoBoletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  if (boletin.state === 'submitting') return <p>Apuntándote…</p>\n  if (!boletin.data?.ok) return null\n  return (\n    <p>\n      <span>Te has apuntado con {boletin.data.correo}</span>{' '}\n      <button onClick={() => boletin.reset()}>Cerrar</button>\n    </p>\n  )\n}\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <div role=\"status\" className=\"indicador\">\n          <AvisoBoletin />\n        </div>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <Boletin />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Boletin.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 1200
  },
  "titulo": "El boletín: un formulario en el pie, un aviso en la cabecera",
  "consigna": "Escribe un correo en el pie y pulsa «Apuntarme»: la cabecera dice «Apuntándote…» y después «Te has apuntado con…». En el registro, la operación se llama «Fetcher «boletin»». Pulsa «Cerrar». Después prueba un correo sin @: el 400 sale en el pie y, como en la lección 4, no se revalida nada. Quita la key de AvisoBoletin y repite: la cabecera ya no se entera.",
  "mostrarRouter": true
}
```

**¿Cuánto vive un fetcher, y qué pasa si su componente se desmonta a mitad de envío?**

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Mientras algún componente lo usa",
      "texto": "El fetcher existe mientras haya montado algún componente con su key. Cuando se desmonta el último y el fetcher está en idle, el router lo borra, con su data."
    },
    {
      "titulo": "Si se desmonta a mitad de envío, el envío sigue",
      "texto": "Comprobado: ocultamos la tarjeta que había pulsado «Añadir» mientras la action trabajaba. El PATCH terminó, la página se revalidó y useFetchers lo siguió viendo hasta el final. Después desapareció: un componente montado más tarde con la misma key empezó en idle y sin data."
    },
    {
      "titulo": "Un Form que no navega",
      "texto": "Si no necesitas leer el fetcher en ese componente, <Form navigate={false} fetcherKey=\"boletin\"> hace lo mismo que fetcher.Form: el envío sale como un fetcher con esa key, y cualquier useFetcher({ key: 'boletin' }) lo ve. Comprobado en la 8.5.0."
    }
  ]
}
```

## Todos los fetchers a la vez: `useFetchers`

La `key` sirve cuando sabes qué fetcher buscas. Para la pregunta general, «¿se está guardando algo?», está **`useFetchers()`: un array con todos los fetchers que están trabajando ahora mismo en la app**, los haya creado quien los haya creado. Cada uno lleva lo que ya conoces (`state`, `formMethod`, `formAction`, `formData`…) y además su `key`.

Con eso, la cabecera de Cuenca puede decir «Guardando 2 cambios…» sin saber nada de las filas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { NavLink, Outlet, useFetchers, useLoaderData } from 'react-router'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n  // Todos los fetchers en marcha, los haya creado quien los haya creado\n  const fetchers = useFetchers()\n  const envios = fetchers.filter((fetcher) => fetcher.formMethod === 'POST')\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {envios.length > 0 && `Guardando ${envios.length} ${envios.length === 1 ? 'cambio' : 'cambios'}…`}\n        </p>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <aside className=\"chivato\" aria-label=\"Lo que devuelve useFetchers\">\n        <p>useFetchers(): {fetchers.length} en marcha</p>\n        {fetchers.map((fetcher) => (\n          <p key={fetcher.key}>\n            «{fetcher.key}» · {fetcher.state} · {fetcher.formMethod} {fetcher.formAction}\n          </p>\n        ))}\n      </aside>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const fetchers = useFetchers()",
      "nota": "Solo los que están en marcha. Cuando un fetcher vuelve a idle, desaparece del array (comprobado: con todo terminado, length es 0)."
    },
    {
      "fragmento": "fetchers.filter((fetcher) => fetcher.formMethod === 'POST')",
      "nota": "Cuenta los envíos y deja fuera las cargas, como las sugerencias del buscador, que no guardan nada. formMethod llega en mayúsculas."
    },
    {
      "fragmento": "<p role=\"status\" className=\"indicador\">",
      "nota": "La región de estado está siempre en el DOM y solo cambia su texto, para que el lector de pantalla la anuncie (lección 37 de React)."
    },
    {
      "fragmento": "{fetcher.formMethod} {fetcher.formAction}",
      "nota": "formAction dice qué se está guardando: /sitios/3/visita es el puente de San Pablo. Así puede otro componente saber si una fila concreta está trabajando."
    },
    {
      "fragmento": "<p key={fetcher.key}>",
      "nota": "Cada uno trae su key: la que le diste o la de useId."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useFetchers, useLoaderData } from 'react-router'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n  // Todos los fetchers en marcha, los haya creado quien los haya creado\n  const fetchers = useFetchers()\n  const envios = fetchers.filter((fetcher) => fetcher.formMethod === 'POST')\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {envios.length > 0 && `Guardando ${envios.length} ${envios.length === 1 ? 'cambio' : 'cambios'}…`}\n        </p>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <aside className=\"chivato\" aria-label=\"Lo que devuelve useFetchers\">\n        <p>useFetchers(): {fetchers.length} en marcha</p>\n        {fetchers.map((fetcher) => (\n          <p key={fetcher.key}>\n            «{fetcher.key}» · {fetcher.state} · {fetcher.formMethod} {fetcher.formAction}\n          </p>\n        ))}\n      </aside>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Maquetacion.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 1500
  },
  "titulo": "La cabecera que ve todos los fetchers",
  "consigna": "Añade dos sitios y quita la catedral, seguidos. La cabecera pasa a «Guardando 3 cambios…» y el chivato del final lista los tres fetchers con su key, su state y su formAction. Fíjate en que pasan de submitting a loading uno a uno, y desaparecen de la lista a medida que terminan."
}
```

En TSX, cada elemento de `useFetchers()` es `Fetcher & { key: string }`. Su `data` es `any`: el array mezcla fetchers de cualquier ruta, y TypeScript no puede saber qué devolvió cada uno. Si lo necesitas, valídalo; mejor aún, quédate con `formAction` y `formData`, que sí sabes cómo son.

## Varias peticiones a la vez: quién gana

El navegador, con formularios y enlaces de toda la vida, hace una cosa a la vez: si pulsas otro enlace antes de que cargue el primero, cancela el primero. React Router imita eso con las navegaciones (lo viste con `request.signal` en la lección 2). Con los fetchers puede haber muchas peticiones en el aire, y el router sigue unas reglas que conviene saber:

- **Un fetcher solo se interrumpe a sí mismo.** Si llamas otra vez al mismo fetcher antes de que termine, cancela su petición anterior y empieza la nueva. Fetchers distintos no se cancelan entre sí: los tres «Añadir» de antes fueron a la vez.
- **Sus revalidaciones sí se cruzan.** Cada envío que termina lanza su recarga de la página. Si una recarga llega y otra que **empezó antes** sigue en el aire, el router cancela la vieja: la que se pidió después tiene más probabilidades de incluir los dos cambios.
- **Un envío cancela las cargas de fetcher en curso**, y las repite en su revalidación, para que no lleguen datos de antes del cambio.

La documentación lo dibuja así (`|` empieza el envío, `✓` termina la `action` y empieza la recarga, `✅` se pinta, `❌` se cancela):

```text
Cada recarga llega en orden: se pintan todas
envío 1: |----✓-----✅
envío 2:    |-----✓-----✅
envío 3:             |-----✓-----✅

La recarga del envío 1 empezó antes y llega después que la del 2: se cancela
envío 1: |----✓---------❌
envío 2:    |-----✓-----✅
envío 3:             |-----✓-----✅
```

Con la API simulada, todas las recargas tardan lo mismo, así que siempre llegan en orden: es el primer dibujo. Para ver el segundo sin depender de la suerte, el bloque siguiente simula un servidor irregular: **una recarga de cada dos hace una consulta más antes de responder, y tarda el doble** (está al principio de `datos.ts`).

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// Solo en este bloque, un servidor irregular: una recarga de cada dos\n// hace una consulta más antes de responder, y tarda el doble\nlet cargas = 0\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  cargas += 1\n  if (cargas % 2 === 0) await leer('/api/sitios?consulta=lenta', request.signal)\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useFetchers, useLoaderData } from 'react-router'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n  // Todos los fetchers en marcha, los haya creado quien los haya creado\n  const fetchers = useFetchers()\n  const envios = fetchers.filter((fetcher) => fetcher.formMethod === 'POST')\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {envios.length > 0 && `Guardando ${envios.length} ${envios.length === 1 ? 'cambio' : 'cambios'}…`}\n        </p>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <aside className=\"chivato\" aria-label=\"Lo que devuelve useFetchers\">\n        <p>useFetchers(): {fetchers.length} en marcha</p>\n        {fetchers.map((fetcher) => (\n          <p key={fetcher.key}>\n            «{fetcher.key}» · {fetcher.state} · {fetcher.formMethod} {fetcher.formAction}\n          </p>\n        ))}\n      </aside>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "datos.ts",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 1000
  },
  "titulo": "Dos envíos, dos recargas, una cancelada",
  "consigna": "Pulsa «Añadir» en las Casas Colgadas y, enseguida, en el puente de San Pablo. En el panel de red, la recarga del primero hace su consulta lenta (?consulta=lenta) y, cuando llega la del segundo, su GET /api/sitios?q= sale como cancelada. En la pantalla, los dos sitios aparecen a la vez y «En tu visita» salta de 1 a 3. En el registro, las dos operaciones terminan en el mismo instante.",
  "mostrarRouter": true
}
```

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "items": [
    {
      "fecha": "0 s",
      "titulo": "Dos envíos a la vez",
      "texto": "Sale el PATCH de las Casas Colgadas y, 0,3 s después, el del puente. Dos fetchers, dos operaciones, «Guardando 2 cambios…»."
    },
    {
      "fecha": "1 s",
      "titulo": "Termina el primero",
      "texto": "Empieza su recarga: el loader de / y el de sitios, que en esta vuelta es lento (dos consultas seguidas)."
    },
    {
      "fecha": "1,3 s",
      "titulo": "Termina el segundo",
      "texto": "Empieza su recarga, que esta vez es rápida. La del primero sigue en el aire."
    },
    {
      "fecha": "2,3 s",
      "titulo": "Llega la recarga del segundo",
      "texto": "Se pinta, con los dos sitios. La del primero empezó antes y aún no ha llegado: el router aborta su request.signal y el GET sale cancelado. Los dos fetchers vuelven a idle en el mismo render."
    }
  ]
}
```

**La cancelación se ve en el panel de red, no en el registro.** El registro sigue las operaciones con la API de instrumentación del router, que no avisa de lo que se aborta dentro de una revalidación: la del primer fetcher sale como terminada, justo cuando llega la del segundo. Por eso el `loader` pasa `request.signal` a `fetch`: sin él, la petición vieja seguiría hasta el final. El router ignoraría igual su respuesta (comprobado), pero tu servidor habría trabajado para nada.

Una advertencia de la propia documentación: cancelar en el navegador no deshace nada en el servidor. Un `PATCH` que ya ha salido llega igual. Por eso las `action` de esta app no pasan la señal: una escritura a medias no se puede «cancelar» desde aquí.

## Un buscador que sugiere mientras escribes

El caso que da sentido a `fetcher.load`. En la cabecera hay un buscador con dos partes:

- **Buscar de verdad** es un `<Form method="get" action="/sitios">`: navega a `/sitios?q=museo`, la URL cambia y la lista se filtra. Es una página que se puede compartir.
- **Las sugerencias** no son una página. Con cada tecla, `fetcher.load('/buscar?q=…')` llama al `loader` de `/buscar`, que devuelve como mucho cuatro nombres, y la lista aparece debajo del campo sin tocar la URL.

Es justo el reparto que propone la guía «Form vs. fetcher»: lo que debe cambiar la dirección navega; lo que es un detalle de la vista, va con un fetcher.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { Form, Link, useFetcher } from 'react-router'\nimport type { buscarSitios } from './datos'\n\nexport default function Buscador() {\n  // Las sugerencias no cambian de página: van con un fetcher\n  const sugerencias = useFetcher<typeof buscarSitios>()\n\n  function sugerir(texto: string) {\n    if (texto.trim() === '') sugerencias.reset()\n    else sugerencias.load(`/buscar?q=${encodeURIComponent(texto)}`)\n  }\n\n  return (\n    <div role=\"search\" className=\"buscador\">\n      {/* Buscar de verdad sí cambia de página: un Form que navega a /sitios?q=… */}\n      <Form method=\"get\" action=\"/sitios\" onSubmit={() => sugerencias.reset()}>\n        <label>\n          Busca un sitio{' '}\n          <input\n            name=\"q\"\n            autoComplete=\"off\"\n            onChange={(evento) => sugerir(evento.currentTarget.value)}\n            onKeyDown={(evento) => evento.key === 'Escape' && sugerencias.reset()}\n          />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <p role=\"status\" className=\"indicador\">\n        {sugerencias.state === 'loading' ? 'Buscando…' : ''}\n      </p>\n      {sugerencias.data && (\n        <ul aria-label=\"Sugerencias\">\n          {sugerencias.data.map((sitio) => (\n            <li key={sitio.id}>\n              <Link to={`/sitios?q=${encodeURIComponent(sitio.nombre)}`} onClick={() => sugerencias.reset()}>\n                {sitio.nombre}\n              </Link>\n            </li>\n          ))}\n          {sugerencias.data.length === 0 && <li>Ningún sitio coincide.</li>}\n        </ul>\n      )}\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const sugerencias = useFetcher<typeof buscarSitios>()",
      "nota": "Un fetcher para las sugerencias. Con el tipo de buscarSitios, data es { id: number; nombre: string }[] | undefined."
    },
    {
      "fragmento": "if (texto.trim() === '') sugerencias.reset()",
      "nota": "Con el campo vacío no hay nada que sugerir: se vacía el fetcher en vez de pedir una lista entera."
    },
    {
      "fragmento": "else sugerencias.load(`/buscar?q=${encodeURIComponent(texto)}`)",
      "nota": "Una carga por tecla. Cada load del mismo fetcher cancela el anterior: no escribes ni una línea para evitar la carrera."
    },
    {
      "fragmento": "<Form method=\"get\" action=\"/sitios\" onSubmit={() => sugerencias.reset()}>",
      "nota": "Buscar sí navega. Al enviar, las sugerencias se cierran."
    },
    {
      "fragmento": "onKeyDown={(evento) => evento.key === 'Escape' && sugerencias.reset()}",
      "nota": "Escape las cierra también. reset() devuelve el fetcher a idle y deja data en null."
    },
    {
      "fragmento": "{sugerencias.state === 'loading' ? 'Buscando…' : ''}",
      "nota": "Una región de estado que siempre está, con el texto que cambia."
    },
    {
      "fragmento": "<ul aria-label=\"Sugerencias\">",
      "nota": "Una lista con nombre, para que el lector de pantalla sepa qué es. Un combobox completo, con flechas y aria-activedescendant, es un reto del final."
    },
    {
      "fragmento": "onClick={() => sugerencias.reset()}",
      "nota": "Al elegir una sugerencia, se navega a sus resultados y la lista se cierra."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Buscador.tsx",
      "codigo": "import { Form, Link, useFetcher } from 'react-router'\nimport type { buscarSitios } from './datos'\n\nexport default function Buscador() {\n  // Las sugerencias no cambian de página: van con un fetcher\n  const sugerencias = useFetcher<typeof buscarSitios>()\n\n  function sugerir(texto: string) {\n    if (texto.trim() === '') sugerencias.reset()\n    else sugerencias.load(`/buscar?q=${encodeURIComponent(texto)}`)\n  }\n\n  return (\n    <div role=\"search\" className=\"buscador\">\n      {/* Buscar de verdad sí cambia de página: un Form que navega a /sitios?q=… */}\n      <Form method=\"get\" action=\"/sitios\" onSubmit={() => sugerencias.reset()}>\n        <label>\n          Busca un sitio{' '}\n          <input\n            name=\"q\"\n            autoComplete=\"off\"\n            onChange={(evento) => sugerir(evento.currentTarget.value)}\n            onKeyDown={(evento) => evento.key === 'Escape' && sugerencias.reset()}\n          />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <p role=\"status\" className=\"indicador\">\n        {sugerencias.state === 'loading' ? 'Buscando…' : ''}\n      </p>\n      {sugerencias.data && (\n        <ul aria-label=\"Sugerencias\">\n          {sugerencias.data.map((sitio) => (\n            <li key={sitio.id}>\n              <Link to={`/sitios?q=${encodeURIComponent(sitio.nombre)}`} onClick={() => sugerencias.reset()}>\n                {sitio.nombre}\n              </Link>\n            </li>\n          ))}\n          {sugerencias.data.length === 0 && <li>Ningún sitio coincide.</li>}\n        </ul>\n      )}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useLoaderData } from 'react-router'\nimport Buscador from './Buscador'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <Buscador />\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Buscador.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 1000
  },
  "titulo": "Sugerencias con fetcher.load",
  "consigna": "Escribe «museo» deprisa en «Busca un sitio». En el registro, cada letra es una operación «Fetcher «…» · carga /buscar?q=…», y cada una sale «cancelada por» la siguiente; en el panel de red, sus GET salen cancelados. Solo llega la última. Activa «Responder desordenado» y repite: siguen saliendo los museos, no lo de «m». Pulsa una sugerencia: navegas a sus resultados.",
  "mostrarRouter": true
}
```

En el proyecto 56 de React (el refranero «Al buen entendedor») arreglaste esta carrera a mano: un efecto con su limpieza, un `AbortController` y comprobar qué búsqueda pidió cada respuesta (lección 38). Aquí no hay nada de eso. **Un fetcher que se vuelve a llamar cancela su petición anterior**, y una respuesta cancelada nunca se pinta, llegue cuando llegue.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Escribes «torre» y salen las sugerencias: «Torre de Mangana».\n// Sin cerrarlas, pulsas «Añadir» en las Casas Colgadas.\n// La action va bien y el router revalida la página.\n\n// ¿Qué loader se vuelven a ejecutar?",
  "opciones": [
    "Los de / y de sitios: las sugerencias no son de la página",
    "Los de / y de sitios, y también el de buscar con ?q=torre",
    "Solo el de sitios, que es la ruta que pinta la lista",
    "Ninguno: los fetchers no revalidan la página"
  ],
  "correcta": 1,
  "explicacion": "Un fetcher que cargó con load se revalida junto con la página después de cada action, para que lo que enseña no se quede viejo. El registro del envío dice «Se volvió a ejecutar: /, sitios, buscar». No pasa al navegar con un enlace: al pulsar «Qué ver» se repitieron / y sitios, pero no buscar (comprobado)."
}
```

## `fetcher.reset()`, y lo que cambió en la 8.5

`fetcher.reset()` devuelve el fetcher a como estaba al principio, o casi:

- `state` pasa a `idle` y los `form…` a `undefined`;
- si había una petición en marcha, la aborta (comprobado: el GET sale cancelado). Acepta `{ reason }`, que llega a `AbortController.abort()`;
- **`data` pasa a `null`**, no a `undefined`. Lo verás en los errores típicos, porque el tipo no lo dice.

Llegó como `unstable_reset()` en la 7.9.2 (estable desde la 7.10) y **en la 8.5 se arregló un fallo que lo hacía poco fiable**. Lo acabas de ver: un fetcher que cargó con `load` se revalida después de cada `action`. Hasta la 8.4, `reset()` vaciaba los datos pero el router seguía recordando que ese fetcher tenía que revalidarse, y en el siguiente envío los datos volvían solos. Las sugerencias que el usuario había cerrado con Escape reaparecían al añadir un sitio. El changelog de la 8.5.0 lo resume así: *«Stop revalidating a fetcher after `fetcher.reset()`, so its cleared data no longer comes back on the next revalidation»*.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Cargar, vaciar y revalidar: la 8.4.0 frente a la 8.5.0",
  "items": [
    {
      "fecha": "Paso 1",
      "titulo": "fetcher.load('/buscar?q=museo')",
      "texto": "En las dos versiones: loading y después idle, con el Museo de Arte Abstracto en data."
    },
    {
      "fecha": "Paso 2",
      "titulo": "fetcher.reset()",
      "texto": "En las dos: idle, con data en null."
    },
    {
      "fecha": "Paso 3, en la 8.4.0",
      "titulo": "Otro fetcher envía y la página se revalida",
      "texto": "El loader de /buscar se vuelve a ejecutar y data vuelve a traer el museo: lo vaciado reaparece."
    },
    {
      "fecha": "Paso 3, en la 8.5.0",
      "titulo": "Lo mismo",
      "texto": "El loader de /buscar ya no se ejecuta y data sigue en null."
    }
  ]
}
```

La comparación está hecha con el router solo, sin React, con `react-router` 8.4.0 y 8.5.0 instalados a la vez: mismas rutas, mismos pasos. En la vista previa, que va con la 8.5.0, pruébalo tú:

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Buscador.tsx",
      "codigo": "import { Form, Link, useFetcher } from 'react-router'\nimport type { buscarSitios } from './datos'\n\nexport default function Buscador() {\n  // Las sugerencias no cambian de página: van con un fetcher\n  const sugerencias = useFetcher<typeof buscarSitios>()\n\n  function sugerir(texto: string) {\n    if (texto.trim() === '') sugerencias.reset()\n    else sugerencias.load(`/buscar?q=${encodeURIComponent(texto)}`)\n  }\n\n  return (\n    <div role=\"search\" className=\"buscador\">\n      {/* Buscar de verdad sí cambia de página: un Form que navega a /sitios?q=… */}\n      <Form method=\"get\" action=\"/sitios\" onSubmit={() => sugerencias.reset()}>\n        <label>\n          Busca un sitio{' '}\n          <input\n            name=\"q\"\n            autoComplete=\"off\"\n            onChange={(evento) => sugerir(evento.currentTarget.value)}\n            onKeyDown={(evento) => evento.key === 'Escape' && sugerencias.reset()}\n          />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <p role=\"status\" className=\"indicador\">\n        {sugerencias.state === 'loading' ? 'Buscando…' : ''}\n      </p>\n      {sugerencias.data && (\n        <ul aria-label=\"Sugerencias\">\n          {sugerencias.data.map((sitio) => (\n            <li key={sitio.id}>\n              <Link to={`/sitios?q=${encodeURIComponent(sitio.nombre)}`} onClick={() => sugerencias.reset()}>\n                {sitio.nombre}\n              </Link>\n            </li>\n          ))}\n          {sugerencias.data.length === 0 && <li>Ningún sitio coincide.</li>}\n        </ul>\n      )}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useLoaderData } from 'react-router'\nimport Buscador from './Buscador'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <Buscador />\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Buscador.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 800
  },
  "titulo": "Lo vaciado no vuelve",
  "consigna": "Escribe «torre», espera a la sugerencia y pulsa «Añadir» en las Casas Colgadas: el registro del envío dice «Se volvió a ejecutar: /, sitios, buscar». Ahora pulsa Escape en el campo para cerrar las sugerencias (es fetcher.reset()) y añade otro sitio: esta vez «buscar» ya no está en la revalidación y las sugerencias no vuelven. Hasta la 8.4 habrían vuelto.",
  "mostrarRouter": true
}
```

## Adónde va el error de un fetcher

En la lección 8 verás a fondo adónde sube cada error. Para los fetchers hay una regla que sorprende: **si la `action` o el `loader` de un fetcher lanza, el error va al `ErrorBoundary` más cercano a la ruta que pinta el fetcher, no al de la ruta de su `action`**. El router lo busca desde la ruta del componente que llamó a `useFetcher`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La raíz pinta la maquetación, con el boletín en el pie.\n{ path: '/', Component: Maquetacion, ErrorBoundary: ErrorDeLaRaiz, children: [\n  { path: 'sitios', Component: Sitios, ErrorBoundary: ErrorDeQueVer },\n  { path: 'boletin', action: apuntarBoletin, ErrorBoundary: ErrorDelBoletin },\n] }\n\n// apuntarBoletin lanza un Error si la API responde 500.\n// Estás en /sitios y te apuntas desde el pie. La API falla.\n// ¿Qué ErrorBoundary se pinta?",
  "opciones": [
    "ErrorDelBoletin: es la ruta cuya action ha fallado",
    "ErrorDeQueVer: es la página que estás viendo",
    "ErrorDeLaRaiz: el pie lo pinta la raíz, y la página entera desaparece",
    "Ninguno: un fetcher no navega, así que su error no se pinta"
  ],
  "correcta": 2,
  "explicacion": "El fetcher del pie vive en la maquetación, que es el componente de la raíz. El router busca el límite más cercano desde ahí, y solo encuentra el de la raíz: cabecera, lista y pie desaparecen por un fallo del boletín. El de /boletin no lo recoge nunca: esa ruta no pinta nada. Comprobado en la vista previa y en el registro del router."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { apuntarBoletin, cargarSitios } from './datos'\n\n// La misma action que el pie, pero pintada dentro de la ruta /sitios\nfunction AgendaEnLaPagina() {\n  const agenda = useFetcher<typeof apuntarBoletin>()\n  return (\n    <agenda.Form method=\"post\" action=\"/boletin\" noValidate className=\"recuadro\">\n      <label>\n        Correo para la agenda <input type=\"email\" name=\"correo\" defaultValue=\"luis@ejemplo.es\" />\n      </label>\n      <button>Apuntarme desde la página</button>\n    </agenda.Form>\n  )\n}\n\nexport default function Sitios() {\n  const { sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>Qué ver en Cuenca</h2>\n      <p>{sitios.length} sitios para elegir.</p>\n      <AgendaEnLaPagina />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nfunction Limite({ de }: { de: string }) {\n  const error = useRouteError()\n  return (\n    <section className=\"error\">\n      <h2>Lo ha recogido el ErrorBoundary {de}</h2>\n      <p>{error instanceof Error ? error.message : 'Error desconocido'}</p>\n    </section>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    ErrorBoundary: () => <Limite de=\"de la raíz\" />,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios, ErrorBoundary: () => <Limite de=\"de Qué ver\" /> },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      // Este límite no recoge nunca el fallo de un fetcher\n      { path: 'boletin', action: apuntarBoletin, ErrorBoundary: () => <Limite de=\"del boletín\" /> },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useFetcher, useLoaderData } from 'react-router'\nimport Boletin from './Boletin'\nimport type { apuntarBoletin, cargarVisita } from './datos'\n\n// En la cabecera, lejos del pie: el mismo fetcher gracias a la key\nfunction AvisoBoletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  if (boletin.state === 'submitting') return <p>Apuntándote…</p>\n  if (!boletin.data?.ok) return null\n  return (\n    <p>\n      <span>Te has apuntado con {boletin.data.correo}</span>{' '}\n      <button onClick={() => boletin.reset()}>Cerrar</button>\n    </p>\n  )\n}\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <div role=\"status\" className=\"indicador\">\n          <AvisoBoletin />\n        </div>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <Boletin />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Boletin.tsx",
      "codigo": "import { useFetcher } from 'react-router'\nimport type { apuntarBoletin } from './datos'\n\n// El pie de todas las páginas\nexport default function Boletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  return (\n    <footer>\n      <p>Recibe cada viernes la agenda cultural de Cuenca.</p>\n      <boletin.Form method=\"post\" action=\"/boletin\" noValidate>\n        <label>\n          Tu correo <input type=\"email\" name=\"correo\" autoComplete=\"email\" />\n        </label>\n        <button disabled={boletin.state !== 'idle'}>Apuntarme</button>\n      </boletin.Form>\n      {boletin.data?.ok === false && <p role=\"alert\">{boletin.data.error}</p>}\n    </footer>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  // Lanzado, no devuelto: ¿quién lo recoge?\n  if (!respuesta.ok) throw new Error('La API respondió 500 al guardar la suscripción')\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Sitios.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 600
  },
  "titulo": "La misma action, dos límites distintos",
  "consigna": "Pulsa «Fallar la siguiente petición» y después «Apuntarme desde la página»: el error lo recoge el límite de Qué ver, y la cabecera y el pie siguen. Pulsa Reiniciar, escribe un correo en el pie, falla la siguiente y pulsa «Apuntarme»: ahora lo recoge el de la raíz y desaparece todo. En el registro, «Error en pantalla (ErrorBoundary de …)» dice cuál.",
  "mostrarRouter": true
}
```

Dos detalles más, comprobados en el registro y en el panel de red:

- **Un fetcher que falla no revalida nada.** Tras el 500 no sale ningún GET. Con un `<Form>` que lanza, sí se vuelven a ejecutar los `loader` por encima del límite (lección 8): un fetcher no.
- **Lo mismo vale para un `loader`.** Un `fetcher.load('/no-existe')` va con su 404 («No route matches URL "/no-existe"») al límite de la ruta que pinta el fetcher.

La salida casi siempre es la de la lección 3: **lo que el usuario puede reintentar, se devuelve**. Un `return data({ ok: false, error: '…' }, { status: 500 })` deja el aviso junto al formulario, en `fetcher.data`, y no se lleva la página por delante. Es el ejercicio 3.

## Cuándo lo usarías de verdad

La guía «Form vs. fetcher» lo resume en una pregunta: **¿este envío debería cambiar la dirección, o tener sentido como un paso en el historial?** Si sí, navega. Si no, fetcher.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Navegar o no navegar",
  "roles": [
    {
      "etiqueta": "<Form> y useSubmit",
      "rol": "Cambia la página",
      "descripcion": "Crear algo que tendrá su propia dirección, borrar lo que estás viendo, una búsqueda que se puede compartir (/sitios?q=museo). Atrás tiene que tener sentido."
    },
    {
      "etiqueta": "fetcher.Form y fetcher.submit",
      "rol": "Un cambio dentro de la vista",
      "descripcion": "Añadir a la visita, un favorito, marcar como leído, apuntarse a un boletín. Varios a la vez y cada uno con su estado."
    },
    {
      "etiqueta": "fetcher.load",
      "rol": "Datos que no son de la página",
      "descripcion": "Sugerencias, una vista previa al pasar el ratón, un desplegable que se llena al abrirlo, cargar más."
    },
    {
      "etiqueta": "useFetchers",
      "rol": "Lo que pasa en toda la app",
      "descripcion": "Un indicador global, o saber desde otro componente si algo concreto se está guardando (por su formAction)."
    }
  ]
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un fetcher no recarga los datos de la página",
      "realidad": "Un envío que va bien revalida la página igual que un Form, con las reglas de la lección 4. Y un fetcher que cargó con load también se revalida después de cada action."
    },
    {
      "mito": "Dos useFetcher() a la misma ruta comparten estado",
      "realidad": "Son dos fetchers distintos. Para compartir uno, la misma key."
    },
    {
      "mito": "useFetchers devuelve todos los fetchers de la app",
      "realidad": "Solo los que están trabajando. Uno que ha terminado no sale, aunque tenga data."
    },
    {
      "mito": "Para que un buscador no enseñe resultados viejos hace falta un AbortController",
      "realidad": "Con fetcher.load, el router cancela la carga anterior del mismo fetcher y nunca pinta su respuesta. request.signal en el loader solo ahorra trabajo al servidor."
    },
    {
      "mito": "El error de un fetcher lo recoge el ErrorBoundary de su action",
      "realidad": "Lo recoge el límite más cercano a la ruta que pinta el fetcher. Si está en la maquetación, el de la raíz."
    }
  ]
}
```

## Errores típicos

**Leer `data` como si después de `reset()` fuera `undefined`.** El tipo dice `… | undefined`, pero `reset()` lo deja en `null`. Este código compila sin una queja y se rompe al pulsar «Cerrar»:

```tsx
const sugerencias = useFetcher<typeof buscarSitios>()
const cuantas = sugerencias.data !== undefined ? sugerencias.data.length : 0
```

Comprobado: el render lanza y el `ErrorBoundary` enseña

```text
TypeError: Cannot read properties of null (reading 'length')
```

Es decir: «no se puede leer `length` de `null`». Escribe `sugerencias.data?.length ?? 0`, o `if (sugerencias.data)`, que cubren los dos casos.

**`fetcher.submit` sin `method`.** Como `useSubmit` (lección 3), el valor por defecto es un `GET`, que no llama a la `action` sino al `loader`. Con `fetcher.submit({ enVisita: 'si' }, { action: '/sitios/1/visita' })` la ruta no tiene `loader` y el fetcher acaba en el límite de error con un 404:

```text
No route matches URL "/sitios/1/visita?enVisita=si"
```

Y sin cambiar la dirección, así que ni siquiera la barra te da la pista. Con un fetcher que envía, escribe siempre `method: 'post'`.

**Un `fetcher.Form` sin `action` en una ruta sin `action`.** Va a la ruta que pinta el fetcher. Si esa ruta no tiene `action`, el error llega a su límite con un 405:

```text
You made a POST request to "/sitios" but did not provide an `action` for route "0-1", so there is no way to handle the request.
```

Es decir: has hecho un `POST` a `/sitios`, pero esa ruta no tiene `action` (`"0-1"` es el `id` que el router le puso, porque no le diste uno).

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La portada es la ruta índice de '/', con su propia action.\n{ path: '/', Component: Maquetacion, children: [\n  { index: true, Component: Portada, action: valorarPortada },\n] }\n\nfunction Portada() {\n  const fetcher = useFetcher()\n  return <fetcher.Form method=\"post\"><button>Valorar</button></fetcher.Form>\n}\n\n// Mientras se envía, ¿qué vale fetcher.formAction?",
  "opciones": [
    "'/'",
    "'/?index'",
    "undefined, porque el formulario no tiene action",
    "'/index'"
  ],
  "correcta": 1,
  "explicacion": "Una ruta índice comparte dirección con su madre. Para que el envío vaya a la action de la índice y no a la de '/', el router añade ?index (comprobado: '/?index', también en useFetchers). Si buscas ese envío desde otro componente comparando formAction === '/', no lo encuentras."
}
```

**Un `useFetcher()` en cada componente, esperando que se hablen.** Es lo que pasaba si quitabas la `key` de `AvisoBoletin`: el aviso tiene su propio fetcher, siempre en `idle`, y nunca se entera del envío del pie. No hay error ni aviso: simplemente no pasa nada. Si dos componentes tienen que ver el mismo envío, la misma `key`.

**Buscar en `useNavigation` el estado de un fetcher.** `useNavigation` solo sabe de navegaciones: mientras se guardan tres sitios, sigue en `idle`. Para los fetchers, `fetcher.state` o `useFetchers()`. La lección 6 junta los dos en un indicador.

**Lanzar en la `action` de un fetcher lo que el usuario puede reintentar.** Ya lo has visto: un apunte al boletín que falla se lleva la página entera. Devuélvelo.

## Ejercicios

Los tres son el planificador de Cuenca, en TSX. El trabajo va donde dicen los comentarios numerados. «Comprobar» arranca la app desde cero en cada comprobación.

**1. Las sugerencias del buscador.** El buscador de la cabecera solo sabe buscar con «Buscar». Haz que sugiera mientras escribes.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Buscador.tsx",
      "codigo": "import { Form } from 'react-router'\n\nexport default function Buscador() {\n  // 1) Un fetcher para las sugerencias, con el tipo de buscarSitios.\n  // 2) Al escribir: con el campo vacío, vacía el fetcher; si no, carga /buscar?q=…\n  // 3) Pinta las sugerencias en una lista con aria-label=\"Sugerencias\": un enlace\n  //    a /sitios?q=<nombre> por sitio, o «Ningún sitio coincide.» si no hay ninguno.\n  // 4) Cierra las sugerencias con Escape, al elegir una y al pulsar «Buscar».\n\n  return (\n    <div role=\"search\" className=\"buscador\">\n      <Form method=\"get\" action=\"/sitios\">\n        <label>\n          Busca un sitio <input name=\"q\" autoComplete=\"off\" />\n        </label>\n        <button>Buscar</button>\n      </Form>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useLoaderData } from 'react-router'\nimport Buscador from './Buscador'\nimport type { cargarVisita } from './datos'\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <Buscador />\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Buscador.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 0
  },
  "titulo": "Ejercicio 1: sugerir mientras escribes",
  "consigna": "En Buscador.tsx: 1) un fetcher para las sugerencias, con el tipo de buscarSitios; 2) al escribir, carga /buscar?q=… (o vacía el fetcher si el campo queda vacío); 3) pinta una lista con aria-label=\"Sugerencias\": un enlace a /sitios?q=<nombre> por sitio, o «Ningún sitio coincide.»; 4) cierra las sugerencias con Escape, al elegir una y al pulsar «Buscar».",
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al escribir «museo», sugiere «Museo de Arte Abstracto Español»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": "museo"
          }
        }
      ],
      "espera": {
        "rol": "link",
        "nombre": "Museo de Arte Abstracto Español"
      }
    },
    {
      "descripcion": "Si nada coincide, dice «Ningún sitio coincide.»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": "zzz"
          }
        }
      ],
      "espera": {
        "texto": "Ningún sitio coincide."
      }
    },
    {
      "descripcion": "Escape cierra las sugerencias",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": "torre"
          }
        },
        {
          "pulsar": {
            "rol": "list",
            "nombre": "Sugerencias"
          }
        },
        {
          "pulsar": {
            "etiqueta": "Busca un sitio"
          }
        },
        {
          "teclear": "{Escape}"
        }
      ],
      "espera": {
        "ausente": {
          "rol": "list",
          "nombre": "Sugerencias"
        }
      }
    },
    {
      "descripcion": "Al vaciar el campo, las sugerencias desaparecen",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": "museo"
          }
        },
        {
          "pulsar": {
            "rol": "list",
            "nombre": "Sugerencias"
          }
        },
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": ""
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "list",
          "nombre": "Sugerencias"
        }
      }
    },
    {
      "descripcion": "Al elegir «Torre de Mangana», vas a sus resultados",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": "mangana"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Torre de Mangana"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Resultados para «Torre de Mangana»"
      }
    },
    {
      "descripcion": "Al elegir una sugerencia, la lista se cierra",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": "mangana"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Torre de Mangana"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Resultados para «Torre de Mangana»"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "list",
          "nombre": "Sugerencias"
        }
      }
    },
    {
      "descripcion": "Al pulsar «Buscar», la lista también se cierra",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Busca un sitio",
            "texto": "museo"
          }
        },
        {
          "pulsar": {
            "rol": "list",
            "nombre": "Sugerencias"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Buscar"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Resultados para «museo»"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "list",
          "nombre": "Sugerencias"
        }
      }
    }
  ]
}
```

**2. El boletín, compartido.** El pie apunta al boletín, pero la cabecera no se entera: su aviso tiene su propio fetcher. Y la cabecera no dice nada mientras se guardan cambios.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useFetcher, useLoaderData } from 'react-router'\nimport Boletin from './Boletin'\nimport type { apuntarBoletin, cargarVisita } from './datos'\n\nfunction AvisoBoletin() {\n  // 1) Este fetcher no es el del pie, así que nunca se entera de nada\n  const boletin = useFetcher<typeof apuntarBoletin>()\n\n  if (boletin.state === 'submitting') return <p>Apuntándote…</p>\n  if (!boletin.data?.ok) return null\n  return (\n    <p>\n      <span>Te has apuntado con {boletin.data.correo}</span>\n      {/* 2) Un botón «Cerrar» que vacíe el fetcher */}\n    </p>\n  )\n}\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n  // 3) Cuenta los envíos POST en marcha de toda la app\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <div role=\"status\" className=\"indicador\">\n          <AvisoBoletin />\n          {/* 3) «Guardando 1 cambio…» o «Guardando 2 cambios…» */}\n        </div>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <Boletin />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Boletin.tsx",
      "codigo": "import { useFetcher } from 'react-router'\nimport type { apuntarBoletin } from './datos'\n\n// El pie de todas las páginas\nexport default function Boletin() {\n  // 1) Dale una key a este fetcher\n  const boletin = useFetcher<typeof apuntarBoletin>()\n\n  return (\n    <footer>\n      <p>Recibe cada viernes la agenda cultural de Cuenca.</p>\n      <boletin.Form method=\"post\" action=\"/boletin\" noValidate>\n        <label>\n          Tu correo <input type=\"email\" name=\"correo\" autoComplete=\"email\" />\n        </label>\n        <button disabled={boletin.state !== 'idle'}>Apuntarme</button>\n      </boletin.Form>\n      {boletin.data?.ok === false && <p role=\"alert\">{boletin.data.error}</p>}\n    </footer>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      { path: 'boletin', action: apuntarBoletin },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  if (!respuesta.ok) return data({ ok: false as const, error: 'No hemos podido apuntarte.' }, { status: 500 })\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "Maquetacion.tsx",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 500
  },
  "titulo": "Ejercicio 2: una key y useFetchers",
  "consigna": "1) Haz que el pie (Boletin.tsx) y AvisoBoletin (Maquetacion.tsx) compartan el fetcher con la key boletin. 2) Añade al aviso un botón «Cerrar» que lo vacíe. 3) Con useFetchers, que la cabecera diga «Guardando 1 cambio…» o «Guardando 2 cambios…» mientras haya envíos POST en marcha, del boletín o de las filas. La API tarda 0,5 s.",
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al apuntarte en el pie, la cabecera dice «Te has apuntado con marta@ejemplo.es»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        }
      ],
      "espera": {
        "texto": "Te has apuntado con marta@ejemplo.es"
      }
    },
    {
      "descripcion": "Mientras se envía, la cabecera dice «Apuntándote…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        }
      ],
      "espera": {
        "texto": "Apuntándote…"
      }
    },
    {
      "descripcion": "«Cerrar» quita el aviso de la cabecera",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cerrar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Te has apuntado con marta@ejemplo.es"
        }
      }
    },
    {
      "descripcion": "Al añadir un sitio, la cabecera dice «Guardando 1 cambio…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Casas Colgadas"
          }
        }
      ],
      "espera": {
        "texto": "Guardando 1 cambio…"
      }
    },
    {
      "descripcion": "Con dos sitios a la vez, dice «Guardando 2 cambios…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Casas Colgadas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Puente de San Pablo"
          }
        }
      ],
      "espera": {
        "texto": "Guardando 2 cambios…"
      }
    },
    {
      "descripcion": "Apuntarse al boletín también cuenta como un cambio",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        }
      ],
      "espera": {
        "texto": "Guardando 1 cambio…"
      }
    }
  ]
}
```

**3. Que un fallo no se lleve la página.** Las dos `action` de la app lanzan su error. Un apunte que falla tumba la página entera, y un «Añadir» que falla se lleva toda la lista.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Sitio = { id: number; nombre: string; zona: string; enVisita: boolean }\n\nasync function leer<T>(url: string, signal: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`La API respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\n// Raíz: cuántos sitios lleva la visita (se ve en la cabecera)\nexport async function cargarVisita({ request }: LoaderFunctionArgs) {\n  const sitios = await leer<Sitio[]>('/api/sitios', request.signal)\n  return { enVisita: sitios.filter((sitio) => sitio.enVisita).length }\n}\n\n// /sitios: la lista, filtrada con ?q= si se ha buscado algo\nexport async function cargarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, sitios }\n}\n\n// /sitios/:id/visita, sin componente: añade o quita un sitio\nexport async function cambiarVisita({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const enVisita = formData.get('enVisita') === 'si'\n  const respuesta = await fetch(`/api/sitios/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ enVisita }),\n  })\n  // 1) Que un fallo no se lleve la lista: devuélvelo con data() y un 500,\n  //    con el mensaje «No se pudo guardar. Inténtalo otra vez.»\n  if (!respuesta.ok) throw new Error('La API respondió 500 al guardar el sitio')\n  return { error: null }\n}\n\n// /buscar, sin componente: las sugerencias del buscador\nexport async function buscarSitios({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (q === '') return []\n  const sitios = await leer<Sitio[]>(`/api/sitios?q=${encodeURIComponent(q)}&_limite=4`, request.signal)\n  return sitios.map(({ id, nombre }) => ({ id, nombre }))\n}\n\n// /boletin, sin componente: apuntarse a la agenda cultural\nexport async function apuntarBoletin({ request }: ActionFunctionArgs) {\n  const correo = String((await request.formData()).get('correo') ?? '').trim()\n  if (!correo.includes('@')) return data({ ok: false as const, error: 'Escribe un correo válido.' }, { status: 400 })\n  const respuesta = await fetch('/api/suscripciones', { method: 'POST', body: JSON.stringify({ correo }) })\n  // 2) Lo mismo aquí, con «No hemos podido apuntarte.»\n  if (!respuesta.ok) throw new Error('La API respondió 500 al guardar la suscripción')\n  return { ok: true as const, correo }\n}\n"
    },
    {
      "nombre": "Boletin.tsx",
      "codigo": "import { useFetcher } from 'react-router'\nimport type { apuntarBoletin } from './datos'\n\n// El pie de todas las páginas\nexport default function Boletin() {\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  return (\n    <footer>\n      <p>Recibe cada viernes la agenda cultural de Cuenca.</p>\n      <boletin.Form method=\"post\" action=\"/boletin\" noValidate>\n        <label>\n          Tu correo <input type=\"email\" name=\"correo\" autoComplete=\"email\" />\n        </label>\n        <button disabled={boletin.state !== 'idle'}>Apuntarme</button>\n      </boletin.Form>\n      {boletin.data?.ok === false && <p role=\"alert\">{boletin.data.error}</p>}\n    </footer>\n  )\n}\n"
    },
    {
      "nombre": "Sitios.tsx",
      "codigo": "import { useFetcher, useLoaderData } from 'react-router'\nimport type { Sitio, cambiarVisita, cargarSitios } from './datos'\n\nfunction FilaSitio({ sitio }: { sitio: Sitio }) {\n  // Un fetcher por fila: cada una envía, espera y termina por su cuenta\n  const fetcher = useFetcher<typeof cambiarVisita>()\n  const accion = sitio.enVisita ? 'Quitar' : 'Añadir'\n\n  return (\n    <li className={sitio.enVisita ? 'en-visita' : undefined}>\n      <span className=\"nombre\">{sitio.nombre}</span>\n      <span className=\"zona\">{sitio.zona}</span>\n      {fetcher.state !== 'idle' && <span className=\"estado\">Guardando…</span>}\n      <fetcher.Form method=\"post\" action={`/sitios/${sitio.id}/visita`}>\n        <input type=\"hidden\" name=\"enVisita\" value={sitio.enVisita ? 'no' : 'si'} />\n        <button aria-label={`${accion} ${sitio.nombre}`}>{accion}</button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Sitios() {\n  const { q, sitios } = useLoaderData<typeof cargarSitios>()\n\n  return (\n    <section>\n      <h2>{q ? `Resultados para «${q}»` : 'Qué ver en Cuenca'}</h2>\n      {sitios.length === 0 && <p className=\"nota\">Sin resultados.</p>}\n      <ul>\n        {sitios.map((sitio) => (\n          <FilaSitio key={sitio.id} sitio={sitio} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { apuntarBoletin, buscarSitios, cambiarVisita, cargarSitios, cargarVisita } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Sitios from './Sitios'\nimport './estilos.css'\n\nfunction Limite({ de }: { de: string }) {\n  const error = useRouteError()\n  return (\n    <section className=\"error\">\n      <h2>Lo ha recogido el ErrorBoundary {de}</h2>\n      <p>{error instanceof Error ? error.message : 'Error desconocido'}</p>\n    </section>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    loader: cargarVisita,\n    Component: Maquetacion,\n    ErrorBoundary: () => <Limite de=\"de la raíz\" />,\n    HydrateFallback: () => <p className=\"nota\">Cargando la visita…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Empieza por «Qué ver».</p> },\n      { path: 'sitios', loader: cargarSitios, Component: Sitios, ErrorBoundary: () => <Limite de=\"de Qué ver\" /> },\n      { path: 'sitios/:id/visita', action: cambiarVisita },\n      { path: 'buscar', loader: buscarSitios },\n      // Este límite no recoge nunca el fallo de un fetcher\n      { path: 'boletin', action: apuntarBoletin, ErrorBoundary: () => <Limite de=\"del boletín\" /> },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useFetcher, useFetchers, useLoaderData } from 'react-router'\nimport Boletin from './Boletin'\nimport type { apuntarBoletin, cargarVisita } from './datos'\n\nfunction AvisoBoletin() {\n  // La misma key que el pie: el mismo fetcher\n  const boletin = useFetcher<typeof apuntarBoletin>({ key: 'boletin' })\n\n  if (boletin.state === 'submitting') return <p>Apuntándote…</p>\n  if (!boletin.data?.ok) return null\n  return (\n    <p>\n      <span>Te has apuntado con {boletin.data.correo}</span>{' '}\n      <button onClick={() => boletin.reset()}>Cerrar</button>\n    </p>\n  )\n}\n\nexport default function Maquetacion() {\n  const { enVisita } = useLoaderData<typeof cargarVisita>()\n  const envios = useFetchers().filter((fetcher) => fetcher.formMethod === 'POST').length\n\n  return (\n    <>\n      <header>\n        <h1>Cuenca: planifica tu visita</h1>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/sitios\">Qué ver</NavLink>\n          <span>En tu visita: {enVisita}</span>\n        </nav>\n        <div role=\"status\" className=\"indicador\">\n          <AvisoBoletin />\n          {envios > 0 && <p>{`Guardando ${envios} ${envios === 1 ? 'cambio' : 'cambios'}…`}</p>}\n        </div>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <Boletin />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #9a3412;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #9a3412;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: baseline;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #9a3412;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n}\n\nli.en-visita {\n  background: #fff7ed;\n}\n\nli.en-visita .nombre::after {\n  content: ' ✓';\n  color: #15803d;\n}\n\n.zona {\n  font-size: 0.85rem;\n  color: #57534e;\n}\n\nli form {\n  margin: 0 0 0 auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #b45309;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin: 0.75rem 0;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #fed7aa;\n}\n\n.error {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.recuadro {\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #fdba74;\n  border-radius: 6px;\n}\n"
    }
  ],
  "archivoInicial": "datos.ts",
  "urlInicial": "/sitios",
  "mostrarConsola": false,
  "api": {
    "sitios": [
      {
        "id": 1,
        "nombre": "Casas Colgadas",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 2,
        "nombre": "Catedral de Santa María y San Julián",
        "zona": "Plaza Mayor",
        "enVisita": true
      },
      {
        "id": 3,
        "nombre": "Puente de San Pablo",
        "zona": "Hoz del Huécar",
        "enVisita": false
      },
      {
        "id": 4,
        "nombre": "Museo de Arte Abstracto Español",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 5,
        "nombre": "Torre de Mangana",
        "zona": "Casco antiguo",
        "enVisita": false
      },
      {
        "id": 6,
        "nombre": "Museo de las Ciencias de Castilla-La Mancha",
        "zona": "Plaza de la Merced",
        "enVisita": false
      },
      {
        "id": 7,
        "nombre": "Rascacielos de San Martín",
        "zona": "Hoz del Júcar",
        "enVisita": false
      },
      {
        "id": 8,
        "nombre": "Ciudad Encantada",
        "zona": "Serranía de Cuenca",
        "enVisita": false
      }
    ],
    "suscripciones": []
  },
  "red": {
    "latencia": 0
  },
  "titulo": "Ejercicio 3: devolver en vez de lanzar",
  "consigna": "Prueba primero: pulsa «Fallar la siguiente petición» y apúntate, o añade un sitio, y mira qué ErrorBoundary lo recoge. Después, en datos.ts, haz que cambiarVisita y apuntarBoletin devuelvan su error con data() y un 500, con los mensajes de los comentarios 1 y 2. El pie y las filas ya saben enseñar fetcher.data como aviso.",
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Si falla el apunte, el pie avisa «No hemos podido apuntarte.»",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Qué ver en Cuenca"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "escribir": {
            "etiqueta": "Tu correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No hemos podido apuntarte."
      }
    },
    {
      "descripcion": "Tras ese fallo, la lista de sitios sigue en pantalla",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Qué ver en Cuenca"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "escribir": {
            "etiqueta": "Tu correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No hemos podido apuntarte."
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Qué ver en Cuenca"
      }
    },
    {
      "descripcion": "Al volver a intentarlo, te apunta",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Qué ver en Cuenca"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "escribir": {
            "etiqueta": "Tu correo",
            "texto": "marta@ejemplo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No hemos podido apuntarte."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        }
      ],
      "espera": {
        "texto": "Te has apuntado con marta@ejemplo.es"
      }
    },
    {
      "descripcion": "Si falla «Añadir», la fila avisa «No se pudo guardar. Inténtalo otra vez.»",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Qué ver en Cuenca"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Casas Colgadas"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se pudo guardar. Inténtalo otra vez."
      }
    },
    {
      "descripcion": "Tras ese fallo, el resto de sitios sigue en pantalla",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Qué ver en Cuenca"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Casas Colgadas"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "No se pudo guardar. Inténtalo otra vez."
          }
        }
      ],
      "espera": {
        "texto": "Puente de San Pablo"
      }
    }
  ]
}
```

### Retos para seguir practicando

1. **Menos peticiones.** El router ya cancela las cargas viejas, pero cada tecla sigue saliendo hacia el servidor. Espera 300 ms sin teclear antes de llamar a `load` (un `setTimeout` que cada tecla cancela) y compara el panel de red antes y después con «museo».
2. **Un combobox de verdad.** Convierte el buscador en un combobox accesible: `role="combobox"` en el campo con `aria-expanded` y `aria-controls`, las flechas para moverte por las sugerencias con `aria-activedescendant` y Enter para elegir. El patrón está en la guía de prácticas de ARIA (APG), y lo construiste a mano en el proyecto 96 de React.
3. **«Quitar todos».** En la lista, un botón que quite de la visita todos los sitios a la vez, con un envío por sitio. Cuidado: un mismo fetcher que envía varias veces seguidas se cancela a sí mismo. Necesitas un fetcher por envío; `useSubmit` con `navigate: false` y una `fetcherKey` distinta para cada sitio es una forma. ¿Qué dice el indicador? ¿Cuántas revalidaciones salen en el registro?
4. **Vaciar el campo al apuntarse.** `fetcher.Form` no vacía los campos, igual que `<Form>` (lección 3). Haz que el correo del pie se borre cuando el apunte sale bien, pero no cuando falla. Pista: una `key` en el formulario que cambie con cada apunte correcto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Using Fetchers",
      "descripcion": "La guía oficial paso a paso: llamar a una action, el estado pendiente, data con los errores y un combobox que carga con un fetcher.",
      "url": "https://reactrouter.com/how-to/fetchers",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useFetcher",
      "descripcion": "La referencia: key, Form, load, submit y reset, con sus opciones.",
      "url": "https://reactrouter.com/api/hooks/useFetcher",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useFetchers",
      "descripcion": "Todos los fetchers en marcha, cada uno con su key.",
      "url": "https://reactrouter.com/api/hooks/useFetchers",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Network Concurrency Management",
      "descripcion": "Cómo resuelve el router varias navegaciones, envíos y revalidaciones a la vez, con los diagramas de esta lección.",
      "url": "https://reactrouter.com/explanation/concurrency",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Race Conditions",
      "descripcion": "Por qué un fetcher solo se interrumpe a sí mismo y cómo se cancelan las revalidaciones viejas.",
      "url": "https://reactrouter.com/explanation/race-conditions",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Form vs. fetcher",
      "descripcion": "Cuándo un envío debe cambiar la dirección y cuándo debe ir con un fetcher.",
      "url": "https://reactrouter.com/explanation/form-vs-fetcher",
      "etiqueta": "reactrouter.com"
    }
  ]
}
```
