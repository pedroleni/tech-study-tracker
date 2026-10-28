# Proyecto: la intranet de la Protectora de Animales de Calatayud

- **Módulo:** Más allá de cargar y enviar
- **Slug:** `proyecto-la-intranet-de-la-protectora-de-animales-de-calatayud` (autogenerado del título)
- **Orden:** 130
- **Fuentes:** [Middleware](https://reactrouter.com/how-to/middleware) + [Streaming with Suspense](https://reactrouter.com/how-to/suspense) + [Error Boundaries](https://reactrouter.com/how-to/error-boundary) + [Navigation Blocking](https://reactrouter.com/how-to/navigation-blocking) + [Route Object: lazy](https://reactrouter.com/start/data/route-object) — ver `contenido/react-router/TEMARIO.md` #13
- **Requiere:** Las lecciones 1 a 12 de esta ficha

---

## Qué vas a construir

La **Protectora de Animales de Calatayud** tiene unos cuarenta voluntarios que sacan a pasear a los perros, limpian las jaulas, llevan a los animales al veterinario y atienden a las familias que vienen a adoptar. Hasta ahora se organizaban con una hoja de cálculo compartida y un grupo de mensajería. Este proyecto es su intranet:

- **Una puerta.** Sin sesión, cualquier página de la intranet te lleva a «Entrar», y al entrar vuelves a la página que pedías. Pero solo si es una página de la intranet: un enlace trucado no puede mandarte a otra web.
- **Un panel** con los animales que hay ahora en la protectora, al instante, y unas estadísticas del año que el servidor tarda en calcular y que llegan después.
- **La ficha de cada animal**, con dos pestañas: el historial veterinario y la solicitud de adopción. Si el historial no se puede cargar, el aviso sale en su pestaña y el resto de la ficha sigue ahí.
- **Una solicitud de adopción** que no deja que pierdas lo escrito por pulsar un enlace sin querer.
- **Un área de administración** para la coordinación, cuyo código solo se descarga cuando alguien entra en ella.

Casi no hay nada nuevo que aprender: el proyecto junta lo que has visto en el módulo 3. Cada paso remite a su lección, y es ahí donde tienes que volver si te atascas:

- **El middleware y el contexto** (lección 10) para la sesión, con la validación del `?volver=`, que adelanta la lección 20.
- **El streaming** (lección 9) para las estadísticas.
- **Los límites de error por ruta** (lección 8) para el historial.
- **`useBlocker`** (lección 12) para la solicitud.
- **`lazy`** (lección 11) para la administración.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cinco pasos, todos en esta página",
  "contenido": "Cada paso es un bloque en vivo con los seis archivos de la intranet, la barra de direcciones, el registro del router y el botón «Comprobar». Cada paso arranca con la solución del anterior: si te atascas, puedes seguir en el siguiente. Desde el paso 2, la API simulada arranca con la sesión de Pilar Gimeno abierta, para no tener que entrar cada vez. Como en todo el módulo, createBrowserRouter usa aquí un historial en memoria, y la barra lo indica."
}
```

Si prefieres hacerlo en tu ordenador, crea un proyecto con Vite y React Router 8.5 (lección 1) y copia en `src/` los archivos de cada paso. Los datos de `/api/…` los sirve aquí la API simulada; en tu proyecto necesitarás un servidor pequeño que conteste lo mismo, o un plugin de Vite como el de la lección 102 de React. Lo que hacen `pedirEstadisticas` y `descargar` en `intranet.ts` (esperar a propósito) tampoco haría falta: allí las esperas son de verdad.

## Las piezas

La intranet son seis archivos, los mismos en todos los pasos:

- **`App.tsx`**: el árbol de rutas y el `RouterProvider`. Lo tocarás en los pasos 1, 3 y 5.
- **`intranet.ts`**: los tipos y lo que haría el servidor (`pedir`, `quienSoy`, `pedirEstadisticas`…), y debajo, la sesión en el router. Aquí está el trabajo del paso 1.
- **`paginas.tsx`**: la maqueta de la intranet (`Intranet`), la página de entrar, el límite de error de la raíz y el panel. Paso 2.
- **`animales.tsx`**: la ficha, el historial y la solicitud de adopción. Pasos 3 y 4.
- **`admin.tsx`**: el área de administración, con su `loader` y su componente. No lo tocarás, pero en el paso 5 cambia cómo llega.
- **`estilos.css`**: no hace falta que lo mires.

Y este es el árbol de rutas de la intranet terminada:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas de la intranet",
  "nodos": [
    {
      "nombre": "raiz  /",
      "nivel": 0,
      "etiqueta": "ErrorBoundary",
      "nota": "← HydrateFallback: «Abriendo la intranet…»"
    },
    {
      "nombre": "índice",
      "nivel": 1,
      "nota": "← loader: redirect a /panel"
    },
    {
      "nombre": "entrar",
      "nivel": 1,
      "nota": "← action: accionEntrar"
    },
    {
      "nombre": "salir",
      "nivel": 1,
      "nota": "← action: accionSalir, sin componente"
    },
    {
      "nombre": "privada  (sin path)",
      "nivel": 1,
      "etiqueta": "middleware",
      "nota": "← exigirSesion · loader: cargarVoluntario · Intranet"
    },
    {
      "nombre": "panel",
      "nivel": 2,
      "nota": "← las estadísticas, por streaming (paso 2)"
    },
    {
      "nombre": "ficha  animales/:id",
      "nivel": 2,
      "nota": "← loader: cargarAnimal · Ficha"
    },
    {
      "nombre": "historial",
      "nivel": 3,
      "etiqueta": "ErrorBoundary",
      "nota": "← su propio límite (paso 3)"
    },
    {
      "nombre": "adoptar",
      "nivel": 3,
      "nota": "← action + useBlocker (paso 4)"
    },
    {
      "nombre": "admin",
      "nivel": 2,
      "etiqueta": "lazy",
      "nota": "← loader y componente, bajo demanda (paso 5)"
    }
  ]
}
```

La ruta `privada` no tiene `path`: es una ruta de maquetación (lección 77 de React) que envuelve todo lo que exige sesión. Su middleware se ejecuta en cada navegación que pase por cualquiera de sus hijas, y su componente, `Intranet`, pinta la cabecera con el nombre de quien ha entrado. `entrar` y `salir` quedan fuera, porque no pueden exigir una sesión que todavía no tienes.

Los animales y los voluntarios son los de la API simulada. Fíjate en uno: **Canela**, una perra de un año que llegó la semana pasada de la protectora de Ateca. Su historial veterinario todavía está en papel en la clínica, y la API responde 404 cuando lo pides. En el paso 3 te hará falta.

## Paso 1: la puerta de la intranet

Ahora mismo cualquiera entra en todo: la cabecera saluda a «(sin sesión)», porque `cargarVoluntario`, en `intranet.ts`, devuelve un voluntario de mentira. Este paso es la zona de árbitros de la lección 10, hecha desde cero:

1. **La llave del contexto**, `voluntarioContext`, con `createContext<Voluntario>()`. El `createContext` de `react-router`, no el de React.
2. **El middleware `exigirSesion`**: pregunta al servidor con `quienSoy(request.signal)`. Sin sesión, lanza `redirect('/entrar?volver=…')` con la ruta y la búsqueda que pedías, codificadas con `encodeURIComponent`. Con sesión, deja al voluntario en el contexto.
3. **`cargarVoluntario`** devuelve el voluntario del contexto, para que la cabecera lo lea con `useLoaderData`. Recuerda: los componentes no ven el contexto del router.
4. **En `App.tsx`**, el middleware va en la ruta `privada`.

Y una cosa más, que la lección 10 dejó a medias: **`destinoSeguro`**. `accionEntrar` ya lee `?volver=` y redirige adonde diga `destinoSeguro(volver, request.url)`, pero ahora mismo esa función devuelve `volver` tal cual. Cualquiera podría mandar a un voluntario un enlace como este:

```text
/entrar?volver=https%3A%2F%2Fprotectora-falsa.example%2Fpanel
```

El voluntario ve la página de entrar de su intranet, entra, y el router lo lleva a una copia falsa que le puede pedir otra vez la contraseña. Es una **redirección abierta**, y la lección 20 la estudia a fondo con los avisos de seguridad del propio React Router. Aquí basta con la receta de la lección 102 de React: interpretar `volver` con `new URL(volver, base)` y quedarte con su ruta y su búsqueda **solo si el origen es el tuyo y esa ruta no empieza por `//`**; si no, `'/panel'`. Usa `request.url` como base, como en la lección 10: dentro de la vista previa, `window.location.origin` vale `"null"`.

La segunda condición hace falta porque `new URL` normaliza la ruta. Con `?volver=/.//protectora-falsa.example/panel`, el origen es el tuyo, pero la ruta queda en `//protectora-falsa.example/panel`, y el navegador lee una dirección que empieza por `//` como la de otra web. Comprobar el origen, por sí solo, la dejaría pasar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 1: la sesión, en un middleware",
  "consigna": "En intranet.ts, crea voluntarioContext con createContext<Voluntario>() y el middleware exigirSesion: sin sesión, redirect a /entrar?volver=<ruta y búsqueda>; con sesión, el voluntario al contexto. Haz que cargarVoluntario lo lea del contexto y que destinoSeguro solo devuelva rutas de tu propio origen que, ya interpretadas con new URL, no empiecen por //; si no, /panel. En App.tsx, pon el middleware en la ruta privada. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport {\n  Adopcion, cargarAnimal, cargarHistorial, enviarSolicitud, Ficha, Historial,\n} from './animales'\nimport Admin, { loader as cargarAdmin } from './admin'\nimport { accionEntrar, accionSalir, cargarVoluntario } from './intranet'\nimport { cargarPanel, Entrar, ErrorRaiz, Intranet, Panel } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la intranet…</p>,\n    children: [\n      { index: true, loader: () => redirect('/panel') },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        // Paso 1: el middleware de la sesión va aquí\n        loader: cargarVoluntario,\n        Component: Intranet,\n        children: [\n          { id: 'panel', path: 'panel', loader: cargarPanel, Component: Panel },\n          {\n            id: 'ficha',\n            path: 'animales/:id',\n            loader: cargarAnimal,\n            Component: Ficha,\n            children: [\n              // Paso 3: si el historial falla, que el aviso salga aquí\n              { id: 'historial', path: 'historial', loader: cargarHistorial, Component: Historial },\n              { id: 'adoptar', path: 'adoptar', action: enviarSolicitud, Component: Adopcion },\n            ],\n          },\n          // Paso 5: que admin.tsx se descargue solo al entrar en administración\n          { id: 'admin', path: 'admin', loader: cargarAdmin, Component: Admin },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "intranet.ts",
      "codigo": "import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'\n\nexport type Voluntario = { id: number; nombre: string; rol: string }\nexport type Animal = { id: number; nombre: string; especie: string; edad: string; estado: string }\nexport type Visita = { fecha: string; motivo: string; clinica: string }\nexport type Estadisticas = { enAdopcion: number; enAcogida: number; adopciones: number }\nexport type Solicitud = { id: number; animal: string; familia: string; telefono: string }\n\n// ---- Lo que haría el servidor de la protectora: no hace falta que lo cambies\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\nexport function enviar<T>(url: string, method: string, datos: unknown) {\n  const headers = { 'Content-Type': 'application/json' }\n  return pedir<T>(url, { method, headers, body: JSON.stringify(datos) })\n}\n\n// La sesión vive en /api/sesion/1 y sobrevive a «Recargar», como una cookie\nexport async function quienSoy(signal?: AbortSignal) {\n  return (await pedir<{ voluntario: Voluntario | null }>('/api/sesion/1', { signal })).voluntario\n}\n\nexport async function guardarSesion(voluntario: Voluntario | null) {\n  await enviar('/api/sesion/1', 'PATCH', { voluntario })\n}\n\n// Las estadísticas tardan: el servidor recorre las fichas de todo el año\nexport async function pedirEstadisticas(anio: string, signal: AbortSignal) {\n  const respuesta = await fetch(`/api/estadisticas/${anio}`, { signal })\n  await new Promise((resolver) => setTimeout(resolver, 900)) // lo que tarda en calcularlas\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<Estadisticas>\n}\n\n// ---- La sesión en el router (paso 1)\n// 1. voluntarioContext: la llave del contexto, con el tipo Voluntario.\n// 2. exigirSesion: sin sesión, a /entrar?volver=<la ruta que pedías>;\n//    con sesión, el voluntario al contexto.\n// 3. cargarVoluntario: el voluntario del contexto, para los componentes.\n\n// Provisional: aquí nadie ha comprobado quién eres\nexport function cargarVoluntario(_: LoaderFunctionArgs): Voluntario {\n  return { id: 0, nombre: '(sin sesión)', rol: '' }\n}\n\n// 4. Solo rutas de esta intranet; cualquier otra cosa, al panel.\n//    Comprueba el origen y también la ruta ya interpretada: si empieza\n//    por //, el navegador la lee como otra web.\nexport function destinoSeguro(volver: string | null, base: string) {\n  return volver ?? '/panel'\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('voluntario')\n  await guardarSesion(await pedir<Voluntario>(`/api/voluntarios/${id}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/entrar')\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import {\n  Form, Link, NavLink, Outlet, useLoaderData, useNavigation,\n  useRouteError, useSearchParams, type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargarVoluntario, pedir, pedirEstadisticas, type Animal } from './intranet'\n\nexport function Intranet() {\n  const voluntario = useLoaderData<typeof cargarVoluntario>()\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Protectora de Animales de Calatayud</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/panel\">Panel</NavLink> <NavLink to=\"/admin\">Administración</NavLink>\n        </nav>\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {voluntario.nombre} <button>Salir</button>\n        </Form>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <main>\n      <h1>Intranet de la protectora</h1>\n      <Form method=\"post\">\n        {volver && <p>Para ver {volver}, entra primero.</p>}\n        <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n        <button name=\"voluntario\" value=\"1\">Entrar como Pilar Gimeno</button>{' '}\n        <button name=\"voluntario\" value=\"2\">Entrar como Javier Lafuente</button>\n      </Form>\n    </main>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La intranet no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport async function cargarPanel({ request }: LoaderFunctionArgs) {\n  const anio = new URL(request.url).searchParams.get('anio') ?? '2026'\n  // Paso 2: el panel no tiene por qué esperar a las estadísticas\n  const [animales, estadisticas] = await Promise.all([\n    pedir<Animal[]>('/api/animales', { signal: request.signal }),\n    pedirEstadisticas(anio, request.signal),\n  ])\n  return { anio, animales, estadisticas }\n}\n\nexport function Panel() {\n  const { anio, animales, estadisticas } = useLoaderData<typeof cargarPanel>()\n  return (\n    <>\n      <h1>Panel</h1>\n      <h2>Animales en la protectora</h2>\n      <ul>\n        {animales.map((animal) => (\n          <li key={animal.id}>\n            <Link to={`/animales/${animal.id}/historial`}>{animal.nombre}</Link> · {animal.estado}\n          </li>\n        ))}\n      </ul>\n      <h2>Estadísticas de {anio}</h2>\n      <p>\n        <Link to=\"?anio=2026\">2026</Link> · <Link to=\"?anio=2025\">2025</Link> ·{' '}\n        <Link to=\"?anio=2024\">2024</Link>\n      </p>\n      <ul className=\"cifras\">\n        <li>En adopción: {estadisticas.enAdopcion}</li>\n        <li>En acogida: {estadisticas.enAcogida}</li>\n        <li>Adopciones: {estadisticas.adopciones}</li>\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "animales.tsx",
      "codigo": "import {\n  Form, NavLink, Outlet, redirect, useLoaderData,\n  useRouteLoaderData, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { enviar, pedir, type Animal, type Visita } from './intranet'\n\nexport function cargarAnimal({ params, request }: LoaderFunctionArgs) {\n  return pedir<Animal>(`/api/animales/${params.id}`, { signal: request.signal })\n}\n\nexport function Ficha() {\n  const animal = useLoaderData<typeof cargarAnimal>()\n  const [busqueda] = useSearchParams()\n  return (\n    <article>\n      <h1>{animal.nombre}</h1>\n      <p>{animal.especie} · {animal.edad} · {animal.estado}</p>\n      {busqueda.has('solicitud') && <p className=\"hecho\">Solicitud de adopción registrada.</p>}\n      <nav aria-label=\"Ficha\">\n        <NavLink to=\"historial\">Historial veterinario</NavLink>{' '}\n        <NavLink to=\"adoptar\">Solicitar adopción</NavLink>\n      </nav>\n      <Outlet />\n    </article>\n  )\n}\n\nexport async function cargarHistorial({ params, request }: LoaderFunctionArgs) {\n  const url = `/api/historiales/${params.id}`\n  return (await pedir<{ visitas: Visita[] }>(url, { signal: request.signal })).visitas\n}\n\nexport function Historial() {\n  const visitas = useLoaderData<typeof cargarHistorial>()\n  return (\n    <ul>\n      {visitas.map((visita) => (\n        <li key={visita.fecha}>{visita.fecha} · {visita.motivo} · {visita.clinica}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport async function enviarSolicitud({ params, request }: ActionFunctionArgs) {\n  const datos = Object.fromEntries(await request.formData())\n  await enviar('/api/solicitudes', 'POST', datos)\n  return redirect(`/animales/${params.id}?solicitud=enviada`)\n}\n\nexport function Adopcion() {\n  const animal = useRouteLoaderData<typeof cargarAnimal>('ficha')!\n  // Paso 4: si has escrito algo y vas a otra página, el router tiene que\n  // pararte y preguntar: «Seguir con la solicitud» (el foco, a la familia)\n  // o «Salir sin enviar». Enviar la solicitud no cuenta como salir.\n  return (\n    <>\n      <Form method=\"post\">\n        <h2>Solicitud de adopción</h2>\n        <input type=\"hidden\" name=\"animal\" value={animal.nombre} />\n        <label>\n          Familia que adopta <input name=\"familia\" required />\n        </label>\n        <label>\n          Teléfono <input name=\"telefono\" type=\"tel\" required />\n        </label>\n        <button>Enviar la solicitud</button>\n      </Form>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "admin.tsx",
      "codigo": "// El área de administración. En la intranet de verdad trae además una\n// librería para exportar las solicitudes a una hoja de cálculo: pesa, y\n// solo la usa la coordinación.\nimport { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Solicitud } from './intranet'\n\nexport function loader({ request }: LoaderFunctionArgs) {\n  return pedir<Solicitud[]>('/api/solicitudes', { signal: request.signal })\n}\n\nexport default function Admin() {\n  const solicitudes = useLoaderData<typeof loader>()\n  return (\n    <>\n      <h1>Administración</h1>\n      <h2>Solicitudes de adopción</h2>\n      <ul>\n        {solicitudes.map((solicitud) => (\n          <li key={solicitud.id}>\n            {solicitud.familia} · {solicitud.animal} · {solicitud.telefono}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a24;\n  background: #f4f7f2;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f5d46;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n/* La sección en la que estás, subrayada en gruesa */\nnav a.active {\n  text-decoration-thickness: 3px;\n}\n\nheader form {\n  margin-left: auto;\n  font-size: 0.9rem;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1 {\n  margin: 0 0 0.4rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 0.8rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n/* Las cifras de las estadísticas, en fichas */\n.cifras {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cifras li {\n  padding: 0.4rem 0.7rem;\n  border-radius: 6px;\n  background: #dde9df;\n  font-weight: 600;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\n.hecho {\n  color: #2f5d46;\n  font-weight: 600;\n}\n\n.aviso {\n  margin-top: 0.8rem;\n  padding: 0.7rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: #fff7ed;\n}\n\n[role='alert'] {\n  color: #9f1239;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #4b5e53;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #c9d6cc;\n  font-size: 0.8rem;\n  color: #4b5e53;\n}\n"
    }
  ],
  "archivoInicial": "intranet.ts",
  "urlInicial": "/panel",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "voluntario": null
      }
    ],
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Pilar Gimeno",
        "rol": "coordinación"
      },
      {
        "id": 2,
        "nombre": "Javier Lafuente",
        "rol": "voluntariado"
      }
    ],
    "animales": [
      {
        "id": 1,
        "nombre": "Tizón",
        "especie": "Perro, mestizo de pastor",
        "edad": "4 años",
        "estado": "En adopción"
      },
      {
        "id": 2,
        "nombre": "Morena",
        "especie": "Perra, galga",
        "edad": "6 años",
        "estado": "En adopción"
      },
      {
        "id": 3,
        "nombre": "Bigotes",
        "especie": "Gato común europeo",
        "edad": "2 años",
        "estado": "En adopción"
      },
      {
        "id": 4,
        "nombre": "Rufo",
        "especie": "Perro, podenco",
        "edad": "9 años",
        "estado": "En casa de acogida"
      },
      {
        "id": 5,
        "nombre": "Canela",
        "especie": "Perra, mestiza",
        "edad": "1 año",
        "estado": "Recién llegada"
      },
      {
        "id": 6,
        "nombre": "Nube",
        "especie": "Gata, angora",
        "edad": "3 años",
        "estado": "Reservada"
      }
    ],
    "historiales": [
      {
        "id": 1,
        "visitas": [
          {
            "fecha": "2026-02-12",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-03-03",
            "motivo": "Vacuna de la rabia",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-09-18",
            "motivo": "Limpieza de oídos",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 2,
        "visitas": [
          {
            "fecha": "2025-11-20",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-01-15",
            "motivo": "Esterilización",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 3,
        "visitas": [
          {
            "fecha": "2026-06-02",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          },
          {
            "fecha": "2026-07-10",
            "motivo": "Vacuna trivalente felina",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      },
      {
        "id": 4,
        "visitas": [
          {
            "fecha": "2025-04-08",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-05-21",
            "motivo": "Analítica de leishmania",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 6,
        "visitas": [
          {
            "fecha": "2026-08-30",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      }
    ],
    "estadisticas": [
      {
        "id": 2026,
        "enAdopcion": 3,
        "enAcogida": 1,
        "adopciones": 41
      },
      {
        "id": 2025,
        "enAdopcion": 7,
        "enAcogida": 3,
        "adopciones": 58
      }
    ],
    "solicitudes": [
      {
        "id": 1,
        "animal": "Tizón",
        "familia": "Familia Sancho Marín",
        "telefono": "976 88 12 34"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Sin sesión, el panel te manda a entrar con la vuelta en la dirección",
      "urlInicial": "/panel",
      "pasos": [],
      "espera": {
        "url": "/entrar?volver=%2Fpanel"
      }
    },
    {
      "descripcion": "Sin sesión, el historial de un animal también, con su ruta entera",
      "urlInicial": "/animales/3/historial",
      "pasos": [],
      "espera": {
        "url": "/entrar?volver=%2Fanimales%2F3%2Fhistorial"
      }
    },
    {
      "descripcion": "Al entrar, vuelves a la página que pedías",
      "urlInicial": "/animales/3/historial",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Pilar Gimeno"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Bigotes"
      }
    },
    {
      "descripcion": "La cabecera saluda a quien ha entrado, leído del contexto",
      "urlInicial": "/entrar?volver=%2Fpanel",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Javier Lafuente"
          }
        }
      ],
      "espera": {
        "texto": "Hola, Javier Lafuente"
      }
    },
    {
      "descripcion": "Con la sesión abierta, recargar te deja donde estabas y con tu nombre",
      "urlInicial": "/entrar?volver=%2Fanimales%2F2%2Fhistorial",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Pilar Gimeno"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Morena"
          }
        },
        {
          "recargar": true
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Morena"
          }
        }
      ],
      "espera": {
        "texto": "Hola, Pilar Gimeno"
      }
    },
    {
      "descripcion": "Un ?volver= con la dirección de otra web te deja en el panel",
      "urlInicial": "/entrar?volver=https%3A%2F%2Fprotectora-falsa.example%2Fpanel",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Pilar Gimeno"
          }
        }
      ],
      "espera": {
        "url": "/panel"
      }
    },
    {
      "descripcion": "Un ?volver= como /.//protectora-falsa.example, que new URL deja en //protectora-falsa.example, también te deja en el panel",
      "urlInicial": "/entrar?volver=%2F.%2F%2Fprotectora-falsa.example%2Fpanel",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Pilar Gimeno"
          }
        }
      ],
      "espera": {
        "url": "/panel"
      }
    },
    {
      "descripcion": "Después de «Salir», el panel vuelve a pedir que entres",
      "urlInicial": "/entrar?volver=%2Fpanel",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Entrar como Pilar Gimeno"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Salir"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Intranet de la protectora"
          }
        },
        {
          "navegar": "/panel"
        }
      ],
      "espera": {
        "url": "/entrar?volver=%2Fpanel"
      }
    }
  ]
}
```

Cuando lo tengas, prueba la puerta a mano y mira el registro del router. Abre `/panel` sin sesión: la carga inicial solo tiene un paso, `middleware privada`, y acaba en `/entrar?volver=%2Fpanel` sin ejecutar ningún `loader`. Entra como Pilar: en la misma operación verás la `action` de entrar y, en la fase «Tras redirigir», el middleware y los dos `loader`. Y prueba el enlace trucado en la barra de direcciones: escribe `/entrar?volver=https%3A%2F%2Fprotectora-falsa.example%2Fpanel`, pulsa «Ir» y entra.

Por qué `new URL` y no algo más sencillo, como comprobar que `volver` empieza por `/`: `//protectora-falsa.example/panel` empieza por `/` y, para el navegador, es una dirección de otra web con el mismo protocolo que la tuya. `new URL` la interpreta igual que la interpretaría el navegador al seguirla, y así la comparación de orígenes no se deja engañar. Pero el origen no es lo único que hay que mirar: lo que devuelves es la ruta ya normalizada, y esa también tiene que empezar por una sola barra. Lo verás en los errores típicos.

## Paso 2: el panel no espera a las estadísticas

Ahora el panel tarda en salir. Con la latencia de la vista previa (600 ms por petición), el middleware pregunta por la sesión y después llegan los animales: la lista podría estar en pantalla en algo más de un segundo. Pero el panel no aparece hasta pasados más de dos: `cargarPanel` espera también a las estadísticas, y el servidor tarda 900 ms más en calcularlas (lo simula `pedirEstadisticas`, en `intranet.ts`). Pulsa «Recargar» en la barra y cuenta lo que dura «Abriendo la intranet…».

**La lista de animales es lo crítico: sin ella, el panel no sirve. Las estadísticas pueden esperar.** Es el reparto de la lección 9:

- **En `cargarPanel`**, lanza `pedirEstadisticas` sin `await` y **antes** del `await` de los animales, para que las dos peticiones salgan a la vez, y devuelve la promesa dentro del objeto. Como puede fallar antes de que el panel se pinte, ponle `estadisticas.catch(() => {})` y devuelve la promesa original: es el detalle de la lección 9.
- **En `Panel`**, píntalas con `<Suspense>` y `<Await>`. Mientras esperan, «Calculando las estadísticas de 2026…» (con el año que toque). Si fallan, un `errorElement` con `role="alert"` que diga «No se han podido calcular las estadísticas» y el motivo, leído con `useAsyncError`.
- **Al cambiar de año** con los enlaces 2026, 2025 y 2024, el panel tiene que enseñar la espera del año nuevo. Es la misma ruta con otra búsqueda: sin una `key` en el `<Suspense>`, la transición del router dejaría en pantalla las cifras viejas hasta que llegaran las nuevas (lección 9).

Las de 2024 no se pueden calcular: se quedaron en la hoja de cálculo antigua, y la API responde 404. Sirven para probar el aviso.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 2: las estadísticas, por streaming",
  "consigna": "En paginas.tsx, haz que cargarPanel devuelva las estadísticas como promesa, lanzada antes del await de los animales y con su catch vacío. En Panel, píntalas con Suspense y Await: «Calculando las estadísticas de <año>…» mientras esperan y, si fallan, un aviso con role=\"alert\" que empiece por «No se han podido calcular las estadísticas», con useAsyncError. Al cambiar de año tiene que verse la espera. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport {\n  Adopcion, cargarAnimal, cargarHistorial, enviarSolicitud, Ficha, Historial,\n} from './animales'\nimport Admin, { loader as cargarAdmin } from './admin'\nimport { accionEntrar, accionSalir, cargarVoluntario, exigirSesion } from './intranet'\nimport { cargarPanel, Entrar, ErrorRaiz, Intranet, Panel } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la intranet…</p>,\n    children: [\n      { index: true, loader: () => redirect('/panel') },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarVoluntario,\n        Component: Intranet,\n        children: [\n          { id: 'panel', path: 'panel', loader: cargarPanel, Component: Panel },\n          {\n            id: 'ficha',\n            path: 'animales/:id',\n            loader: cargarAnimal,\n            Component: Ficha,\n            children: [\n              // Paso 3: si el historial falla, que el aviso salga aquí\n              { id: 'historial', path: 'historial', loader: cargarHistorial, Component: Historial },\n              { id: 'adoptar', path: 'adoptar', action: enviarSolicitud, Component: Adopcion },\n            ],\n          },\n          // Paso 5: que admin.tsx se descargue solo al entrar en administración\n          { id: 'admin', path: 'admin', loader: cargarAdmin, Component: Admin },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "intranet.ts",
      "codigo": "import {\n  createContext, redirect,\n  type ActionFunctionArgs, type LoaderFunctionArgs, type MiddlewareFunction,\n} from 'react-router'\n\nexport type Voluntario = { id: number; nombre: string; rol: string }\nexport type Animal = { id: number; nombre: string; especie: string; edad: string; estado: string }\nexport type Visita = { fecha: string; motivo: string; clinica: string }\nexport type Estadisticas = { enAdopcion: number; enAcogida: number; adopciones: number }\nexport type Solicitud = { id: number; animal: string; familia: string; telefono: string }\n\n// ---- Lo que haría el servidor de la protectora: no hace falta que lo cambies\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\nexport function enviar<T>(url: string, method: string, datos: unknown) {\n  const headers = { 'Content-Type': 'application/json' }\n  return pedir<T>(url, { method, headers, body: JSON.stringify(datos) })\n}\n\n// La sesión vive en /api/sesion/1 y sobrevive a «Recargar», como una cookie\nexport async function quienSoy(signal?: AbortSignal) {\n  return (await pedir<{ voluntario: Voluntario | null }>('/api/sesion/1', { signal })).voluntario\n}\n\nexport async function guardarSesion(voluntario: Voluntario | null) {\n  await enviar('/api/sesion/1', 'PATCH', { voluntario })\n}\n\n// Las estadísticas tardan: el servidor recorre las fichas de todo el año\nexport async function pedirEstadisticas(anio: string, signal: AbortSignal) {\n  const respuesta = await fetch(`/api/estadisticas/${anio}`, { signal })\n  await new Promise((resolver) => setTimeout(resolver, 900)) // lo que tarda en calcularlas\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<Estadisticas>\n}\n\n// ---- La sesión en el router\n\nexport const voluntarioContext = createContext<Voluntario>()\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const voluntario = await quienSoy(request.signal)\n  if (!voluntario) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(voluntarioContext, voluntario)\n}\n\n// Los componentes no ven el contexto del router: se lo pasa este loader\nexport function cargarVoluntario({ context }: LoaderFunctionArgs) {\n  return context.get(voluntarioContext)\n}\n\n// Solo rutas de esta intranet; cualquier otra cosa, al panel\nexport function destinoSeguro(volver: string | null, base: string) {\n  if (!volver) return '/panel'\n  const url = new URL(volver, base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/panel'\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('voluntario')\n  await guardarSesion(await pedir<Voluntario>(`/api/voluntarios/${id}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/entrar')\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import {\n  Form, Link, NavLink, Outlet, useLoaderData, useNavigation,\n  useRouteError, useSearchParams, type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargarVoluntario, pedir, pedirEstadisticas, type Animal } from './intranet'\n\nexport function Intranet() {\n  const voluntario = useLoaderData<typeof cargarVoluntario>()\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Protectora de Animales de Calatayud</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/panel\">Panel</NavLink> <NavLink to=\"/admin\">Administración</NavLink>\n        </nav>\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {voluntario.nombre} <button>Salir</button>\n        </Form>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <main>\n      <h1>Intranet de la protectora</h1>\n      <Form method=\"post\">\n        {volver && <p>Para ver {volver}, entra primero.</p>}\n        <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n        <button name=\"voluntario\" value=\"1\">Entrar como Pilar Gimeno</button>{' '}\n        <button name=\"voluntario\" value=\"2\">Entrar como Javier Lafuente</button>\n      </Form>\n    </main>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La intranet no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport async function cargarPanel({ request }: LoaderFunctionArgs) {\n  const anio = new URL(request.url).searchParams.get('anio') ?? '2026'\n  // Paso 2: el panel no tiene por qué esperar a las estadísticas\n  const [animales, estadisticas] = await Promise.all([\n    pedir<Animal[]>('/api/animales', { signal: request.signal }),\n    pedirEstadisticas(anio, request.signal),\n  ])\n  return { anio, animales, estadisticas }\n}\n\nexport function Panel() {\n  const { anio, animales, estadisticas } = useLoaderData<typeof cargarPanel>()\n  return (\n    <>\n      <h1>Panel</h1>\n      <h2>Animales en la protectora</h2>\n      <ul>\n        {animales.map((animal) => (\n          <li key={animal.id}>\n            <Link to={`/animales/${animal.id}/historial`}>{animal.nombre}</Link> · {animal.estado}\n          </li>\n        ))}\n      </ul>\n      <h2>Estadísticas de {anio}</h2>\n      <p>\n        <Link to=\"?anio=2026\">2026</Link> · <Link to=\"?anio=2025\">2025</Link> ·{' '}\n        <Link to=\"?anio=2024\">2024</Link>\n      </p>\n      <ul className=\"cifras\">\n        <li>En adopción: {estadisticas.enAdopcion}</li>\n        <li>En acogida: {estadisticas.enAcogida}</li>\n        <li>Adopciones: {estadisticas.adopciones}</li>\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "animales.tsx",
      "codigo": "import {\n  Form, NavLink, Outlet, redirect, useLoaderData,\n  useRouteLoaderData, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { enviar, pedir, type Animal, type Visita } from './intranet'\n\nexport function cargarAnimal({ params, request }: LoaderFunctionArgs) {\n  return pedir<Animal>(`/api/animales/${params.id}`, { signal: request.signal })\n}\n\nexport function Ficha() {\n  const animal = useLoaderData<typeof cargarAnimal>()\n  const [busqueda] = useSearchParams()\n  return (\n    <article>\n      <h1>{animal.nombre}</h1>\n      <p>{animal.especie} · {animal.edad} · {animal.estado}</p>\n      {busqueda.has('solicitud') && <p className=\"hecho\">Solicitud de adopción registrada.</p>}\n      <nav aria-label=\"Ficha\">\n        <NavLink to=\"historial\">Historial veterinario</NavLink>{' '}\n        <NavLink to=\"adoptar\">Solicitar adopción</NavLink>\n      </nav>\n      <Outlet />\n    </article>\n  )\n}\n\nexport async function cargarHistorial({ params, request }: LoaderFunctionArgs) {\n  const url = `/api/historiales/${params.id}`\n  return (await pedir<{ visitas: Visita[] }>(url, { signal: request.signal })).visitas\n}\n\nexport function Historial() {\n  const visitas = useLoaderData<typeof cargarHistorial>()\n  return (\n    <ul>\n      {visitas.map((visita) => (\n        <li key={visita.fecha}>{visita.fecha} · {visita.motivo} · {visita.clinica}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport async function enviarSolicitud({ params, request }: ActionFunctionArgs) {\n  const datos = Object.fromEntries(await request.formData())\n  await enviar('/api/solicitudes', 'POST', datos)\n  return redirect(`/animales/${params.id}?solicitud=enviada`)\n}\n\nexport function Adopcion() {\n  const animal = useRouteLoaderData<typeof cargarAnimal>('ficha')!\n  // Paso 4: si has escrito algo y vas a otra página, el router tiene que\n  // pararte y preguntar: «Seguir con la solicitud» (el foco, a la familia)\n  // o «Salir sin enviar». Enviar la solicitud no cuenta como salir.\n  return (\n    <>\n      <Form method=\"post\">\n        <h2>Solicitud de adopción</h2>\n        <input type=\"hidden\" name=\"animal\" value={animal.nombre} />\n        <label>\n          Familia que adopta <input name=\"familia\" required />\n        </label>\n        <label>\n          Teléfono <input name=\"telefono\" type=\"tel\" required />\n        </label>\n        <button>Enviar la solicitud</button>\n      </Form>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "admin.tsx",
      "codigo": "// El área de administración. En la intranet de verdad trae además una\n// librería para exportar las solicitudes a una hoja de cálculo: pesa, y\n// solo la usa la coordinación.\nimport { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Solicitud } from './intranet'\n\nexport function loader({ request }: LoaderFunctionArgs) {\n  return pedir<Solicitud[]>('/api/solicitudes', { signal: request.signal })\n}\n\nexport default function Admin() {\n  const solicitudes = useLoaderData<typeof loader>()\n  return (\n    <>\n      <h1>Administración</h1>\n      <h2>Solicitudes de adopción</h2>\n      <ul>\n        {solicitudes.map((solicitud) => (\n          <li key={solicitud.id}>\n            {solicitud.familia} · {solicitud.animal} · {solicitud.telefono}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a24;\n  background: #f4f7f2;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f5d46;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n/* La sección en la que estás, subrayada en gruesa */\nnav a.active {\n  text-decoration-thickness: 3px;\n}\n\nheader form {\n  margin-left: auto;\n  font-size: 0.9rem;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1 {\n  margin: 0 0 0.4rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 0.8rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n/* Las cifras de las estadísticas, en fichas */\n.cifras {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cifras li {\n  padding: 0.4rem 0.7rem;\n  border-radius: 6px;\n  background: #dde9df;\n  font-weight: 600;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\n.hecho {\n  color: #2f5d46;\n  font-weight: 600;\n}\n\n.aviso {\n  margin-top: 0.8rem;\n  padding: 0.7rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: #fff7ed;\n}\n\n[role='alert'] {\n  color: #9f1239;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #4b5e53;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #c9d6cc;\n  font-size: 0.8rem;\n  color: #4b5e53;\n}\n"
    }
  ],
  "archivoInicial": "paginas.tsx",
  "urlInicial": "/panel",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "voluntario": {
          "id": 1,
          "nombre": "Pilar Gimeno",
          "rol": "coordinación"
        }
      }
    ],
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Pilar Gimeno",
        "rol": "coordinación"
      },
      {
        "id": 2,
        "nombre": "Javier Lafuente",
        "rol": "voluntariado"
      }
    ],
    "animales": [
      {
        "id": 1,
        "nombre": "Tizón",
        "especie": "Perro, mestizo de pastor",
        "edad": "4 años",
        "estado": "En adopción"
      },
      {
        "id": 2,
        "nombre": "Morena",
        "especie": "Perra, galga",
        "edad": "6 años",
        "estado": "En adopción"
      },
      {
        "id": 3,
        "nombre": "Bigotes",
        "especie": "Gato común europeo",
        "edad": "2 años",
        "estado": "En adopción"
      },
      {
        "id": 4,
        "nombre": "Rufo",
        "especie": "Perro, podenco",
        "edad": "9 años",
        "estado": "En casa de acogida"
      },
      {
        "id": 5,
        "nombre": "Canela",
        "especie": "Perra, mestiza",
        "edad": "1 año",
        "estado": "Recién llegada"
      },
      {
        "id": 6,
        "nombre": "Nube",
        "especie": "Gata, angora",
        "edad": "3 años",
        "estado": "Reservada"
      }
    ],
    "historiales": [
      {
        "id": 1,
        "visitas": [
          {
            "fecha": "2026-02-12",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-03-03",
            "motivo": "Vacuna de la rabia",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-09-18",
            "motivo": "Limpieza de oídos",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 2,
        "visitas": [
          {
            "fecha": "2025-11-20",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-01-15",
            "motivo": "Esterilización",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 3,
        "visitas": [
          {
            "fecha": "2026-06-02",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          },
          {
            "fecha": "2026-07-10",
            "motivo": "Vacuna trivalente felina",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      },
      {
        "id": 4,
        "visitas": [
          {
            "fecha": "2025-04-08",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-05-21",
            "motivo": "Analítica de leishmania",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 6,
        "visitas": [
          {
            "fecha": "2026-08-30",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      }
    ],
    "estadisticas": [
      {
        "id": 2026,
        "enAdopcion": 3,
        "enAcogida": 1,
        "adopciones": 41
      },
      {
        "id": 2025,
        "enAdopcion": 7,
        "enAcogida": 3,
        "adopciones": 58
      }
    ],
    "solicitudes": [
      {
        "id": 1,
        "animal": "Tizón",
        "familia": "Familia Sancho Marín",
        "telefono": "976 88 12 34"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Los animales salen sin esperar a las estadísticas, que se están calculando",
      "pasos": [],
      "espera": {
        "texto": "Calculando las estadísticas de 2026…"
      }
    },
    {
      "descripcion": "Las estadísticas llegan después, en su hueco",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Adopciones: 41"
      }
    },
    {
      "descripcion": "Si las estadísticas fallan, el aviso sale en su hueco",
      "urlInicial": "/panel?anio=2024",
      "pasos": [],
      "espera": {
        "rol": "alert",
        "texto": "No se han podido calcular las estadísticas"
      }
    },
    {
      "descripcion": "Y con las estadísticas rotas, la lista de animales sigue en el panel",
      "urlInicial": "/panel?anio=2024",
      "pasos": [
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "rol": "link",
        "nombre": "Canela"
      }
    },
    {
      "descripcion": "Al pasar de 2026 a 2025 se ve la espera del año nuevo",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Adopciones: 41"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "2025"
          }
        }
      ],
      "espera": {
        "texto": "Calculando las estadísticas de 2025…"
      }
    },
    {
      "descripcion": "Y después llegan las cifras de 2025",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Adopciones: 41"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "2025"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Adopciones: 58"
      }
    }
  ]
}
```

Con la solución, recarga y mira el registro de red: `GET /api/estadisticas/2026` y `GET /api/animales` salen a la vez, justo después de la sesión. La lista aparece en cuanto llegan los animales, unos 1,2 s después de recargar, y las cifras, 900 ms más tarde (medido en Chromium). Después ve a la ficha de un animal y vuelve con «Panel»: en el registro del router, el `loader` del panel termina con los animales, porque el router no espera a lo que va por streaming, y «Cargando…» de la cabecera se apaga antes de que lleguen las cifras.

Fíjate también en qué no has tenido que cambiar: el tipo. `useLoaderData<typeof cargarPanel>()` sabe que `estadisticas` es ahora una `Promise<Estadisticas>`, y en la función hija de `<Await>` el parámetro llega ya como `Estadisticas`. Si te dejas el `.enAdopcion` sobre la promesa, el panel de tipos lo dice antes de ejecutar nada.

## Paso 3: el historial de Canela

Este bloque arranca en `/animales/5/historial`, el historial de Canela, y lo que ves es toda la intranet sustituida por una línea: «La intranet no está disponible ahora mismo (El servidor respondió 404).» Sin cabecera, sin la ficha, sin forma de salir de ahí salvo la barra de direcciones. El `loader` del historial ha fallado, ninguna ruta entre el historial y la raíz tiene límite de error, y el error ha subido hasta `ErrorRaiz` (lección 8).

Que un historial no se pueda cargar no es motivo para perder la ficha: el nombre, el estado y la pestaña de adopción siguen siendo útiles. **El límite tiene que ir en la ruta que falla**, la del historial, y así sustituye solo su hueco, el `<Outlet>` de la ficha:

- En `animales.tsx`, escribe `ErrorHistorial`: lee el error con `useRouteError`, lo estrecha con `instanceof Error` y pinta un aviso con `role="alert"` que diga «No se ha podido cargar el historial veterinario» y el motivo.
- En `App.tsx`, ponlo como `ErrorBoundary` de la ruta `historial`.

Las comprobaciones abren también los historiales que sí existen, y pulsan las pestañas y la cabecera desde el historial roto de Canela.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 3: un límite de error para el historial",
  "consigna": "En animales.tsx, escribe ErrorHistorial: un aviso con role=\"alert\" que diga «No se ha podido cargar el historial veterinario» y el motivo del error, leído con useRouteError. En App.tsx, ponlo de ErrorBoundary en la ruta que falla, de modo que el nombre de Canela, sus datos y sus pestañas sigan en pantalla. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport {\n  Adopcion, cargarAnimal, cargarHistorial, enviarSolicitud, Ficha, Historial,\n} from './animales'\nimport Admin, { loader as cargarAdmin } from './admin'\nimport { accionEntrar, accionSalir, cargarVoluntario, exigirSesion } from './intranet'\nimport { cargarPanel, Entrar, ErrorRaiz, Intranet, Panel } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la intranet…</p>,\n    children: [\n      { index: true, loader: () => redirect('/panel') },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarVoluntario,\n        Component: Intranet,\n        children: [\n          { id: 'panel', path: 'panel', loader: cargarPanel, Component: Panel },\n          {\n            id: 'ficha',\n            path: 'animales/:id',\n            loader: cargarAnimal,\n            Component: Ficha,\n            children: [\n              // Paso 3: si el historial falla, que el aviso salga aquí\n              { id: 'historial', path: 'historial', loader: cargarHistorial, Component: Historial },\n              { id: 'adoptar', path: 'adoptar', action: enviarSolicitud, Component: Adopcion },\n            ],\n          },\n          // Paso 5: que admin.tsx se descargue solo al entrar en administración\n          { id: 'admin', path: 'admin', loader: cargarAdmin, Component: Admin },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "intranet.ts",
      "codigo": "import {\n  createContext, redirect,\n  type ActionFunctionArgs, type LoaderFunctionArgs, type MiddlewareFunction,\n} from 'react-router'\n\nexport type Voluntario = { id: number; nombre: string; rol: string }\nexport type Animal = { id: number; nombre: string; especie: string; edad: string; estado: string }\nexport type Visita = { fecha: string; motivo: string; clinica: string }\nexport type Estadisticas = { enAdopcion: number; enAcogida: number; adopciones: number }\nexport type Solicitud = { id: number; animal: string; familia: string; telefono: string }\n\n// ---- Lo que haría el servidor de la protectora: no hace falta que lo cambies\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\nexport function enviar<T>(url: string, method: string, datos: unknown) {\n  const headers = { 'Content-Type': 'application/json' }\n  return pedir<T>(url, { method, headers, body: JSON.stringify(datos) })\n}\n\n// La sesión vive en /api/sesion/1 y sobrevive a «Recargar», como una cookie\nexport async function quienSoy(signal?: AbortSignal) {\n  return (await pedir<{ voluntario: Voluntario | null }>('/api/sesion/1', { signal })).voluntario\n}\n\nexport async function guardarSesion(voluntario: Voluntario | null) {\n  await enviar('/api/sesion/1', 'PATCH', { voluntario })\n}\n\n// Las estadísticas tardan: el servidor recorre las fichas de todo el año\nexport async function pedirEstadisticas(anio: string, signal: AbortSignal) {\n  const respuesta = await fetch(`/api/estadisticas/${anio}`, { signal })\n  await new Promise((resolver) => setTimeout(resolver, 900)) // lo que tarda en calcularlas\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<Estadisticas>\n}\n\n// ---- La sesión en el router\n\nexport const voluntarioContext = createContext<Voluntario>()\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const voluntario = await quienSoy(request.signal)\n  if (!voluntario) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(voluntarioContext, voluntario)\n}\n\n// Los componentes no ven el contexto del router: se lo pasa este loader\nexport function cargarVoluntario({ context }: LoaderFunctionArgs) {\n  return context.get(voluntarioContext)\n}\n\n// Solo rutas de esta intranet; cualquier otra cosa, al panel\nexport function destinoSeguro(volver: string | null, base: string) {\n  if (!volver) return '/panel'\n  const url = new URL(volver, base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/panel'\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('voluntario')\n  await guardarSesion(await pedir<Voluntario>(`/api/voluntarios/${id}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/entrar')\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Suspense } from 'react'\nimport {\n  Await, Form, Link, NavLink, Outlet, useAsyncError, useLoaderData, useNavigation,\n  useRouteError, useSearchParams, type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargarVoluntario, pedir, pedirEstadisticas, type Animal } from './intranet'\n\nexport function Intranet() {\n  const voluntario = useLoaderData<typeof cargarVoluntario>()\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Protectora de Animales de Calatayud</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/panel\">Panel</NavLink> <NavLink to=\"/admin\">Administración</NavLink>\n        </nav>\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {voluntario.nombre} <button>Salir</button>\n        </Form>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <main>\n      <h1>Intranet de la protectora</h1>\n      <Form method=\"post\">\n        {volver && <p>Para ver {volver}, entra primero.</p>}\n        <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n        <button name=\"voluntario\" value=\"1\">Entrar como Pilar Gimeno</button>{' '}\n        <button name=\"voluntario\" value=\"2\">Entrar como Javier Lafuente</button>\n      </Form>\n    </main>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La intranet no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport async function cargarPanel({ request }: LoaderFunctionArgs) {\n  const anio = new URL(request.url).searchParams.get('anio') ?? '2026'\n  // Sin await y antes que la lista, para que salgan a la vez (lección 9)\n  const estadisticas = pedirEstadisticas(anio, request.signal)\n  estadisticas.catch(() => {})\n  const animales = await pedir<Animal[]>('/api/animales', { signal: request.signal })\n  return { anio, animales, estadisticas }\n}\n\nfunction ErrorEstadisticas() {\n  const error = useAsyncError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">No se han podido calcular las estadísticas ({motivo}).</p>\n}\n\nexport function Panel() {\n  const { anio, animales, estadisticas } = useLoaderData<typeof cargarPanel>()\n  return (\n    <>\n      <h1>Panel</h1>\n      <h2>Animales en la protectora</h2>\n      <ul>\n        {animales.map((animal) => (\n          <li key={animal.id}>\n            <Link to={`/animales/${animal.id}/historial`}>{animal.nombre}</Link> · {animal.estado}\n          </li>\n        ))}\n      </ul>\n      <h2>Estadísticas de {anio}</h2>\n      <p>\n        <Link to=\"?anio=2026\">2026</Link> · <Link to=\"?anio=2025\">2025</Link> ·{' '}\n        <Link to=\"?anio=2024\">2024</Link>\n      </p>\n      <Suspense key={anio} fallback={<p>Calculando las estadísticas de {anio}…</p>}>\n        <Await resolve={estadisticas} errorElement={<ErrorEstadisticas />}>\n          {(cifras) => (\n            <ul className=\"cifras\">\n              <li>En adopción: {cifras.enAdopcion}</li>\n              <li>En acogida: {cifras.enAcogida}</li>\n              <li>Adopciones: {cifras.adopciones}</li>\n            </ul>\n          )}\n        </Await>\n      </Suspense>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "animales.tsx",
      "codigo": "import {\n  Form, NavLink, Outlet, redirect, useLoaderData,\n  useRouteLoaderData, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { enviar, pedir, type Animal, type Visita } from './intranet'\n\nexport function cargarAnimal({ params, request }: LoaderFunctionArgs) {\n  return pedir<Animal>(`/api/animales/${params.id}`, { signal: request.signal })\n}\n\nexport function Ficha() {\n  const animal = useLoaderData<typeof cargarAnimal>()\n  const [busqueda] = useSearchParams()\n  return (\n    <article>\n      <h1>{animal.nombre}</h1>\n      <p>{animal.especie} · {animal.edad} · {animal.estado}</p>\n      {busqueda.has('solicitud') && <p className=\"hecho\">Solicitud de adopción registrada.</p>}\n      <nav aria-label=\"Ficha\">\n        <NavLink to=\"historial\">Historial veterinario</NavLink>{' '}\n        <NavLink to=\"adoptar\">Solicitar adopción</NavLink>\n      </nav>\n      <Outlet />\n    </article>\n  )\n}\n\nexport async function cargarHistorial({ params, request }: LoaderFunctionArgs) {\n  const url = `/api/historiales/${params.id}`\n  return (await pedir<{ visitas: Visita[] }>(url, { signal: request.signal })).visitas\n}\n\nexport function Historial() {\n  const visitas = useLoaderData<typeof cargarHistorial>()\n  return (\n    <ul>\n      {visitas.map((visita) => (\n        <li key={visita.fecha}>{visita.fecha} · {visita.motivo} · {visita.clinica}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport async function enviarSolicitud({ params, request }: ActionFunctionArgs) {\n  const datos = Object.fromEntries(await request.formData())\n  await enviar('/api/solicitudes', 'POST', datos)\n  return redirect(`/animales/${params.id}?solicitud=enviada`)\n}\n\nexport function Adopcion() {\n  const animal = useRouteLoaderData<typeof cargarAnimal>('ficha')!\n  // Paso 4: si has escrito algo y vas a otra página, el router tiene que\n  // pararte y preguntar: «Seguir con la solicitud» (el foco, a la familia)\n  // o «Salir sin enviar». Enviar la solicitud no cuenta como salir.\n  return (\n    <>\n      <Form method=\"post\">\n        <h2>Solicitud de adopción</h2>\n        <input type=\"hidden\" name=\"animal\" value={animal.nombre} />\n        <label>\n          Familia que adopta <input name=\"familia\" required />\n        </label>\n        <label>\n          Teléfono <input name=\"telefono\" type=\"tel\" required />\n        </label>\n        <button>Enviar la solicitud</button>\n      </Form>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "admin.tsx",
      "codigo": "// El área de administración. En la intranet de verdad trae además una\n// librería para exportar las solicitudes a una hoja de cálculo: pesa, y\n// solo la usa la coordinación.\nimport { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Solicitud } from './intranet'\n\nexport function loader({ request }: LoaderFunctionArgs) {\n  return pedir<Solicitud[]>('/api/solicitudes', { signal: request.signal })\n}\n\nexport default function Admin() {\n  const solicitudes = useLoaderData<typeof loader>()\n  return (\n    <>\n      <h1>Administración</h1>\n      <h2>Solicitudes de adopción</h2>\n      <ul>\n        {solicitudes.map((solicitud) => (\n          <li key={solicitud.id}>\n            {solicitud.familia} · {solicitud.animal} · {solicitud.telefono}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a24;\n  background: #f4f7f2;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f5d46;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n/* La sección en la que estás, subrayada en gruesa */\nnav a.active {\n  text-decoration-thickness: 3px;\n}\n\nheader form {\n  margin-left: auto;\n  font-size: 0.9rem;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1 {\n  margin: 0 0 0.4rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 0.8rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n/* Las cifras de las estadísticas, en fichas */\n.cifras {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cifras li {\n  padding: 0.4rem 0.7rem;\n  border-radius: 6px;\n  background: #dde9df;\n  font-weight: 600;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\n.hecho {\n  color: #2f5d46;\n  font-weight: 600;\n}\n\n.aviso {\n  margin-top: 0.8rem;\n  padding: 0.7rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: #fff7ed;\n}\n\n[role='alert'] {\n  color: #9f1239;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #4b5e53;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #c9d6cc;\n  font-size: 0.8rem;\n  color: #4b5e53;\n}\n"
    }
  ],
  "archivoInicial": "animales.tsx",
  "urlInicial": "/animales/5/historial",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "voluntario": {
          "id": 1,
          "nombre": "Pilar Gimeno",
          "rol": "coordinación"
        }
      }
    ],
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Pilar Gimeno",
        "rol": "coordinación"
      },
      {
        "id": 2,
        "nombre": "Javier Lafuente",
        "rol": "voluntariado"
      }
    ],
    "animales": [
      {
        "id": 1,
        "nombre": "Tizón",
        "especie": "Perro, mestizo de pastor",
        "edad": "4 años",
        "estado": "En adopción"
      },
      {
        "id": 2,
        "nombre": "Morena",
        "especie": "Perra, galga",
        "edad": "6 años",
        "estado": "En adopción"
      },
      {
        "id": 3,
        "nombre": "Bigotes",
        "especie": "Gato común europeo",
        "edad": "2 años",
        "estado": "En adopción"
      },
      {
        "id": 4,
        "nombre": "Rufo",
        "especie": "Perro, podenco",
        "edad": "9 años",
        "estado": "En casa de acogida"
      },
      {
        "id": 5,
        "nombre": "Canela",
        "especie": "Perra, mestiza",
        "edad": "1 año",
        "estado": "Recién llegada"
      },
      {
        "id": 6,
        "nombre": "Nube",
        "especie": "Gata, angora",
        "edad": "3 años",
        "estado": "Reservada"
      }
    ],
    "historiales": [
      {
        "id": 1,
        "visitas": [
          {
            "fecha": "2026-02-12",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-03-03",
            "motivo": "Vacuna de la rabia",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-09-18",
            "motivo": "Limpieza de oídos",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 2,
        "visitas": [
          {
            "fecha": "2025-11-20",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-01-15",
            "motivo": "Esterilización",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 3,
        "visitas": [
          {
            "fecha": "2026-06-02",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          },
          {
            "fecha": "2026-07-10",
            "motivo": "Vacuna trivalente felina",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      },
      {
        "id": 4,
        "visitas": [
          {
            "fecha": "2025-04-08",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-05-21",
            "motivo": "Analítica de leishmania",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 6,
        "visitas": [
          {
            "fecha": "2026-08-30",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      }
    ],
    "estadisticas": [
      {
        "id": 2026,
        "enAdopcion": 3,
        "enAcogida": 1,
        "adopciones": 41
      },
      {
        "id": 2025,
        "enAdopcion": 7,
        "enAcogida": 3,
        "adopciones": 58
      }
    ],
    "solicitudes": [
      {
        "id": 1,
        "animal": "Tizón",
        "familia": "Familia Sancho Marín",
        "telefono": "976 88 12 34"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "El historial de Tizón sale en su ficha",
      "urlInicial": "/animales/1/historial",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Vacuna de la rabia"
      }
    },
    {
      "descripcion": "Si el historial de Canela no se puede cargar, el aviso sale en su pestaña",
      "pasos": [],
      "espera": {
        "rol": "alert",
        "texto": "No se ha podido cargar el historial veterinario"
      }
    },
    {
      "descripcion": "Con el historial roto, el resto de la ficha de Canela sigue en pantalla",
      "pasos": [
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "texto": "Perra, mestiza · 1 año · Recién llegada"
      }
    },
    {
      "descripcion": "Desde ahí, la pestaña «Solicitar adopción» funciona",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Solicitar adopción"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Solicitud de adopción"
      }
    },
    {
      "descripcion": "Y la cabecera también: «Panel» te lleva al panel",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Panel"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Animales en la protectora"
      }
    },
    {
      "descripcion": "Después del aviso, el historial de otro animal se carga bien",
      "pasos": [
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "navegar": "/animales/4/historial"
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Analítica de leishmania"
      }
    }
  ]
}
```

En el registro del router, la carga de `/animales/5/historial` enseña los tres `loader` (`privada`, `ficha` e `historial`) empezando a la vez, y el del historial en rojo con `Error: El servidor respondió 404`. Los otros dos terminaron bien, y por eso la ficha tiene sus datos: **el límite ocupa el sitio de su ruta, y todo lo que hay por encima se pinta con los datos que sí llegaron** (lección 8).

Prueba también lo que no comprueba nadie: abre la ficha de Tizón, pasa a «Solicitar adopción», pulsa «Fallar la siguiente petición» en el panel de red y vuelve a «Historial veterinario». La primera petición de esa navegación es la de la sesión, la del middleware, y el error no se queda en el historial: sube desde la ruta `privada` hasta la raíz, porque un middleware que falla antes de `next()` no deja pintar ninguna de sus hijas (lección 10). Lo que sale es el aviso genérico de la raíz; el reto 4 del final te propone uno más útil.

## Paso 4: una solicitud que no se pierde

La pestaña «Solicitar adopción» tiene un formulario con la familia y el teléfono. Su `action`, `enviarSolicitud`, guarda la solicitud y redirige a la ficha con `?solicitud=enviada`, y la ficha enseña «Solicitud de adopción registrada.». El problema: quien la está rellenando con la familia delante puede pulsar «Panel» o «Historial veterinario» sin querer, y lo escrito se pierde sin aviso.

Es `useBlocker`, de la lección 12, y allí tienes los detalles. En resumen:

- **Saber si hay cambios.** No hace falta controlar cada campo: un `onChange` en el `<Form>` recibe los cambios de todos sus campos, porque el evento sube. Con eso basta para poner `hayCambios` a `true`.
- **Con la función, no con el booleano.** `useBlocker(hayCambios)` pararía también tu propio envío, que es una navegación más hacia la `action`. La función que compara el `pathname` de `currentLocation` y `nextLocation` deja pasar el envío, que va a la misma ruta, y la redirección posterior nunca pasa por el bloqueador.
- **El aviso lo pintas tú** cuando `blocker.state` vale `'blocked'`: un `role="alertdialog"` con «Seguir con la solicitud» (que llama a `blocker.reset()` y devuelve el foco al campo de la familia) y «Salir sin enviar» (que llama a `blocker.proceed()`). En TSX, `blocker.location` solo existe dentro de esa comprobación.

El bloque arranca en el formulario de Morena.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 4: useBlocker en la solicitud de adopción",
  "consigna": "En animales.tsx, haz que Adopcion sepa si has escrito algo y que, si vas a otra página con un enlace o con el Atrás de la barra, el router te pare y enseñe un aviso con «Seguir con la solicitud» (que devuelve el foco a la familia) y «Salir sin enviar». Enviar la solicitud no cuenta como salir. Las comprobaciones miran la dirección y el aviso; el foco, míralo tú. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport {\n  Adopcion, cargarAnimal, cargarHistorial, enviarSolicitud, ErrorHistorial, Ficha, Historial,\n} from './animales'\nimport Admin, { loader as cargarAdmin } from './admin'\nimport { accionEntrar, accionSalir, cargarVoluntario, exigirSesion } from './intranet'\nimport { cargarPanel, Entrar, ErrorRaiz, Intranet, Panel } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la intranet…</p>,\n    children: [\n      { index: true, loader: () => redirect('/panel') },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarVoluntario,\n        Component: Intranet,\n        children: [\n          { id: 'panel', path: 'panel', loader: cargarPanel, Component: Panel },\n          {\n            id: 'ficha',\n            path: 'animales/:id',\n            loader: cargarAnimal,\n            Component: Ficha,\n            children: [\n              {\n                id: 'historial',\n                path: 'historial',\n                loader: cargarHistorial,\n                Component: Historial,\n                ErrorBoundary: ErrorHistorial,\n              },\n              { id: 'adoptar', path: 'adoptar', action: enviarSolicitud, Component: Adopcion },\n            ],\n          },\n          // Paso 5: que admin.tsx se descargue solo al entrar en administración\n          { id: 'admin', path: 'admin', loader: cargarAdmin, Component: Admin },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "intranet.ts",
      "codigo": "import {\n  createContext, redirect,\n  type ActionFunctionArgs, type LoaderFunctionArgs, type MiddlewareFunction,\n} from 'react-router'\n\nexport type Voluntario = { id: number; nombre: string; rol: string }\nexport type Animal = { id: number; nombre: string; especie: string; edad: string; estado: string }\nexport type Visita = { fecha: string; motivo: string; clinica: string }\nexport type Estadisticas = { enAdopcion: number; enAcogida: number; adopciones: number }\nexport type Solicitud = { id: number; animal: string; familia: string; telefono: string }\n\n// ---- Lo que haría el servidor de la protectora: no hace falta que lo cambies\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\nexport function enviar<T>(url: string, method: string, datos: unknown) {\n  const headers = { 'Content-Type': 'application/json' }\n  return pedir<T>(url, { method, headers, body: JSON.stringify(datos) })\n}\n\n// La sesión vive en /api/sesion/1 y sobrevive a «Recargar», como una cookie\nexport async function quienSoy(signal?: AbortSignal) {\n  return (await pedir<{ voluntario: Voluntario | null }>('/api/sesion/1', { signal })).voluntario\n}\n\nexport async function guardarSesion(voluntario: Voluntario | null) {\n  await enviar('/api/sesion/1', 'PATCH', { voluntario })\n}\n\n// Las estadísticas tardan: el servidor recorre las fichas de todo el año\nexport async function pedirEstadisticas(anio: string, signal: AbortSignal) {\n  const respuesta = await fetch(`/api/estadisticas/${anio}`, { signal })\n  await new Promise((resolver) => setTimeout(resolver, 900)) // lo que tarda en calcularlas\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<Estadisticas>\n}\n\n// ---- La sesión en el router\n\nexport const voluntarioContext = createContext<Voluntario>()\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const voluntario = await quienSoy(request.signal)\n  if (!voluntario) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(voluntarioContext, voluntario)\n}\n\n// Los componentes no ven el contexto del router: se lo pasa este loader\nexport function cargarVoluntario({ context }: LoaderFunctionArgs) {\n  return context.get(voluntarioContext)\n}\n\n// Solo rutas de esta intranet; cualquier otra cosa, al panel\nexport function destinoSeguro(volver: string | null, base: string) {\n  if (!volver) return '/panel'\n  const url = new URL(volver, base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/panel'\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('voluntario')\n  await guardarSesion(await pedir<Voluntario>(`/api/voluntarios/${id}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/entrar')\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Suspense } from 'react'\nimport {\n  Await, Form, Link, NavLink, Outlet, useAsyncError, useLoaderData, useNavigation,\n  useRouteError, useSearchParams, type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargarVoluntario, pedir, pedirEstadisticas, type Animal } from './intranet'\n\nexport function Intranet() {\n  const voluntario = useLoaderData<typeof cargarVoluntario>()\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Protectora de Animales de Calatayud</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/panel\">Panel</NavLink> <NavLink to=\"/admin\">Administración</NavLink>\n        </nav>\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {voluntario.nombre} <button>Salir</button>\n        </Form>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <main>\n      <h1>Intranet de la protectora</h1>\n      <Form method=\"post\">\n        {volver && <p>Para ver {volver}, entra primero.</p>}\n        <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n        <button name=\"voluntario\" value=\"1\">Entrar como Pilar Gimeno</button>{' '}\n        <button name=\"voluntario\" value=\"2\">Entrar como Javier Lafuente</button>\n      </Form>\n    </main>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La intranet no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport async function cargarPanel({ request }: LoaderFunctionArgs) {\n  const anio = new URL(request.url).searchParams.get('anio') ?? '2026'\n  // Sin await y antes que la lista, para que salgan a la vez (lección 9)\n  const estadisticas = pedirEstadisticas(anio, request.signal)\n  estadisticas.catch(() => {})\n  const animales = await pedir<Animal[]>('/api/animales', { signal: request.signal })\n  return { anio, animales, estadisticas }\n}\n\nfunction ErrorEstadisticas() {\n  const error = useAsyncError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">No se han podido calcular las estadísticas ({motivo}).</p>\n}\n\nexport function Panel() {\n  const { anio, animales, estadisticas } = useLoaderData<typeof cargarPanel>()\n  return (\n    <>\n      <h1>Panel</h1>\n      <h2>Animales en la protectora</h2>\n      <ul>\n        {animales.map((animal) => (\n          <li key={animal.id}>\n            <Link to={`/animales/${animal.id}/historial`}>{animal.nombre}</Link> · {animal.estado}\n          </li>\n        ))}\n      </ul>\n      <h2>Estadísticas de {anio}</h2>\n      <p>\n        <Link to=\"?anio=2026\">2026</Link> · <Link to=\"?anio=2025\">2025</Link> ·{' '}\n        <Link to=\"?anio=2024\">2024</Link>\n      </p>\n      <Suspense key={anio} fallback={<p>Calculando las estadísticas de {anio}…</p>}>\n        <Await resolve={estadisticas} errorElement={<ErrorEstadisticas />}>\n          {(cifras) => (\n            <ul className=\"cifras\">\n              <li>En adopción: {cifras.enAdopcion}</li>\n              <li>En acogida: {cifras.enAcogida}</li>\n              <li>Adopciones: {cifras.adopciones}</li>\n            </ul>\n          )}\n        </Await>\n      </Suspense>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "animales.tsx",
      "codigo": "import {\n  Form, NavLink, Outlet, redirect, useLoaderData, useRouteError,\n  useRouteLoaderData, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { enviar, pedir, type Animal, type Visita } from './intranet'\n\nexport function cargarAnimal({ params, request }: LoaderFunctionArgs) {\n  return pedir<Animal>(`/api/animales/${params.id}`, { signal: request.signal })\n}\n\nexport function Ficha() {\n  const animal = useLoaderData<typeof cargarAnimal>()\n  const [busqueda] = useSearchParams()\n  return (\n    <article>\n      <h1>{animal.nombre}</h1>\n      <p>{animal.especie} · {animal.edad} · {animal.estado}</p>\n      {busqueda.has('solicitud') && <p className=\"hecho\">Solicitud de adopción registrada.</p>}\n      <nav aria-label=\"Ficha\">\n        <NavLink to=\"historial\">Historial veterinario</NavLink>{' '}\n        <NavLink to=\"adoptar\">Solicitar adopción</NavLink>\n      </nav>\n      <Outlet />\n    </article>\n  )\n}\n\nexport async function cargarHistorial({ params, request }: LoaderFunctionArgs) {\n  const url = `/api/historiales/${params.id}`\n  return (await pedir<{ visitas: Visita[] }>(url, { signal: request.signal })).visitas\n}\n\nexport function Historial() {\n  const visitas = useLoaderData<typeof cargarHistorial>()\n  return (\n    <ul>\n      {visitas.map((visita) => (\n        <li key={visita.fecha}>{visita.fecha} · {visita.motivo} · {visita.clinica}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport function ErrorHistorial() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">No se ha podido cargar el historial veterinario ({motivo}).</p>\n}\n\nexport async function enviarSolicitud({ params, request }: ActionFunctionArgs) {\n  const datos = Object.fromEntries(await request.formData())\n  await enviar('/api/solicitudes', 'POST', datos)\n  return redirect(`/animales/${params.id}?solicitud=enviada`)\n}\n\nexport function Adopcion() {\n  const animal = useRouteLoaderData<typeof cargarAnimal>('ficha')!\n  // Paso 4: si has escrito algo y vas a otra página, el router tiene que\n  // pararte y preguntar: «Seguir con la solicitud» (el foco, a la familia)\n  // o «Salir sin enviar». Enviar la solicitud no cuenta como salir.\n  return (\n    <>\n      <Form method=\"post\">\n        <h2>Solicitud de adopción</h2>\n        <input type=\"hidden\" name=\"animal\" value={animal.nombre} />\n        <label>\n          Familia que adopta <input name=\"familia\" required />\n        </label>\n        <label>\n          Teléfono <input name=\"telefono\" type=\"tel\" required />\n        </label>\n        <button>Enviar la solicitud</button>\n      </Form>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "admin.tsx",
      "codigo": "// El área de administración. En la intranet de verdad trae además una\n// librería para exportar las solicitudes a una hoja de cálculo: pesa, y\n// solo la usa la coordinación.\nimport { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Solicitud } from './intranet'\n\nexport function loader({ request }: LoaderFunctionArgs) {\n  return pedir<Solicitud[]>('/api/solicitudes', { signal: request.signal })\n}\n\nexport default function Admin() {\n  const solicitudes = useLoaderData<typeof loader>()\n  return (\n    <>\n      <h1>Administración</h1>\n      <h2>Solicitudes de adopción</h2>\n      <ul>\n        {solicitudes.map((solicitud) => (\n          <li key={solicitud.id}>\n            {solicitud.familia} · {solicitud.animal} · {solicitud.telefono}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a24;\n  background: #f4f7f2;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f5d46;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n/* La sección en la que estás, subrayada en gruesa */\nnav a.active {\n  text-decoration-thickness: 3px;\n}\n\nheader form {\n  margin-left: auto;\n  font-size: 0.9rem;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1 {\n  margin: 0 0 0.4rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 0.8rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n/* Las cifras de las estadísticas, en fichas */\n.cifras {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cifras li {\n  padding: 0.4rem 0.7rem;\n  border-radius: 6px;\n  background: #dde9df;\n  font-weight: 600;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\n.hecho {\n  color: #2f5d46;\n  font-weight: 600;\n}\n\n.aviso {\n  margin-top: 0.8rem;\n  padding: 0.7rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: #fff7ed;\n}\n\n[role='alert'] {\n  color: #9f1239;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #4b5e53;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #c9d6cc;\n  font-size: 0.8rem;\n  color: #4b5e53;\n}\n"
    }
  ],
  "archivoInicial": "animales.tsx",
  "urlInicial": "/animales/2/adoptar",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "voluntario": {
          "id": 1,
          "nombre": "Pilar Gimeno",
          "rol": "coordinación"
        }
      }
    ],
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Pilar Gimeno",
        "rol": "coordinación"
      },
      {
        "id": 2,
        "nombre": "Javier Lafuente",
        "rol": "voluntariado"
      }
    ],
    "animales": [
      {
        "id": 1,
        "nombre": "Tizón",
        "especie": "Perro, mestizo de pastor",
        "edad": "4 años",
        "estado": "En adopción"
      },
      {
        "id": 2,
        "nombre": "Morena",
        "especie": "Perra, galga",
        "edad": "6 años",
        "estado": "En adopción"
      },
      {
        "id": 3,
        "nombre": "Bigotes",
        "especie": "Gato común europeo",
        "edad": "2 años",
        "estado": "En adopción"
      },
      {
        "id": 4,
        "nombre": "Rufo",
        "especie": "Perro, podenco",
        "edad": "9 años",
        "estado": "En casa de acogida"
      },
      {
        "id": 5,
        "nombre": "Canela",
        "especie": "Perra, mestiza",
        "edad": "1 año",
        "estado": "Recién llegada"
      },
      {
        "id": 6,
        "nombre": "Nube",
        "especie": "Gata, angora",
        "edad": "3 años",
        "estado": "Reservada"
      }
    ],
    "historiales": [
      {
        "id": 1,
        "visitas": [
          {
            "fecha": "2026-02-12",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-03-03",
            "motivo": "Vacuna de la rabia",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-09-18",
            "motivo": "Limpieza de oídos",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 2,
        "visitas": [
          {
            "fecha": "2025-11-20",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-01-15",
            "motivo": "Esterilización",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 3,
        "visitas": [
          {
            "fecha": "2026-06-02",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          },
          {
            "fecha": "2026-07-10",
            "motivo": "Vacuna trivalente felina",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      },
      {
        "id": 4,
        "visitas": [
          {
            "fecha": "2025-04-08",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-05-21",
            "motivo": "Analítica de leishmania",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 6,
        "visitas": [
          {
            "fecha": "2026-08-30",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      }
    ],
    "estadisticas": [
      {
        "id": 2026,
        "enAdopcion": 3,
        "enAcogida": 1,
        "adopciones": 41
      },
      {
        "id": 2025,
        "enAdopcion": 7,
        "enAcogida": 3,
        "adopciones": 58
      }
    ],
    "solicitudes": [
      {
        "id": 1,
        "animal": "Tizón",
        "familia": "Familia Sancho Marín",
        "telefono": "976 88 12 34"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Sin cambios, «Historial veterinario» te lleva al historial sin preguntar",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Historial veterinario"
          }
        }
      ],
      "espera": {
        "url": "/animales/2/historial"
      }
    },
    {
      "descripcion": "Con cambios, al pulsar «Panel» el router te para y sale el aviso",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Familia que adopta",
            "texto": "Familia Lacasa Ruiz"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Panel"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Salir sin enviar"
      }
    },
    {
      "descripcion": "«Seguir con la solicitud» te deja en el formulario con lo que habías escrito",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Familia que adopta",
            "texto": "Familia Lacasa Ruiz"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Panel"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Seguir con la solicitud"
          }
        }
      ],
      "espera": {
        "etiqueta": "Familia que adopta",
        "valor": "Familia Lacasa Ruiz"
      }
    },
    {
      "descripcion": "«Salir sin enviar» te lleva adonde ibas",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Familia que adopta",
            "texto": "Familia Lacasa Ruiz"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Historial veterinario"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Salir sin enviar"
          }
        }
      ],
      "espera": {
        "url": "/animales/2/historial"
      }
    },
    {
      "descripcion": "El Atrás de la barra también saca el aviso",
      "urlInicial": "/animales/2/historial",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Solicitar adopción"
          }
        },
        {
          "escribir": {
            "etiqueta": "Familia que adopta",
            "texto": "Familia Lacasa Ruiz"
          }
        },
        {
          "atras": true
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Salir sin enviar"
      }
    },
    {
      "descripcion": "«Enviar la solicitud» no pregunta: guarda y vuelve a la ficha",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Familia que adopta",
            "texto": "Familia Lacasa Ruiz"
          }
        },
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "976 30 45 67"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar la solicitud"
          }
        }
      ],
      "espera": {
        "texto": "Solicitud de adopción registrada."
      }
    }
  ]
}
```

En el registro del router, una navegación bloqueada sale como una operación de apenas 1 ms, sin ningún paso, que acaba en la misma página en la que estabas: el router la para antes del middleware. Si eliges «Salir sin enviar», la navegación sale entonces, completa. Y el envío es una sola operación con dos fases: el middleware y la `action` de `adoptar` y, tras redirigir, otra vez el middleware y los `loader` de la ficha. Lo que `useBlocker` no ve (recargar o cerrar la pestaña) sigue siendo cosa de `beforeunload`, como contó la lección 12.

## Paso 5: la administración, bajo demanda

El área de administración es solo para la coordinación: la lista de solicitudes de adopción y, en la intranet de verdad, una librería para exportarlas a una hoja de cálculo que pesa bastante. Ahora mismo `App.tsx` la importa arriba del todo, como todo lo demás, así que cada voluntario que abre el panel en el móvil se la descarga aunque no vaya a entrar nunca.

Es el caso de la lección 11: sacarla con `lazy` en la ruta `admin`. **Hazlo con la forma de función**: una función asíncrona que importa `./admin` y devuelve `{ loader, Component }` con lo que trae el módulo (su `loader` y su exportación por defecto). Aquí la forma de objeto no ganaría nada, porque el `loader` y el componente viven en el mismo archivo; y el registro del router enseña los pasos `lazy` de la función, pero no los de la forma de objeto (lo explica la lección 11).

Como en la lección 11, la vista previa no parte el código en archivos. Para que la descarga se note, `intranet.ts` trae ahora `descargar(archivo, ms, importar)`, que espera lo que tardaría el archivo y apunta su nombre. En tu `lazy`, importa así:

```tsx
descargar('admin.tsx', 700, () => import('./admin'))
```

El pie de la intranet enseña lo que se ha descargado bajo demanda. En tu proyecto escribirías solo el `import()`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 5: lazy en la ruta de administración",
  "consigna": "En App.tsx, quita el import de admin y escribe en la ruta admin un lazy como función: que importe ./admin con descargar('admin.tsx', 700, () => import('./admin')) y devuelva su loader y su componente. El pie dirá qué se ha descargado. Sin errores de tipos.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport {\n  Adopcion, cargarAnimal, cargarHistorial, enviarSolicitud, ErrorHistorial, Ficha, Historial,\n} from './animales'\nimport Admin, { loader as cargarAdmin } from './admin'\nimport { accionEntrar, accionSalir, cargarVoluntario, exigirSesion } from './intranet'\nimport { cargarPanel, Entrar, ErrorRaiz, Intranet, Panel } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la intranet…</p>,\n    children: [\n      { index: true, loader: () => redirect('/panel') },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarVoluntario,\n        Component: Intranet,\n        children: [\n          { id: 'panel', path: 'panel', loader: cargarPanel, Component: Panel },\n          {\n            id: 'ficha',\n            path: 'animales/:id',\n            loader: cargarAnimal,\n            Component: Ficha,\n            children: [\n              {\n                id: 'historial',\n                path: 'historial',\n                loader: cargarHistorial,\n                Component: Historial,\n                ErrorBoundary: ErrorHistorial,\n              },\n              { id: 'adoptar', path: 'adoptar', action: enviarSolicitud, Component: Adopcion },\n            ],\n          },\n          // Paso 5: que admin.tsx se descargue solo al entrar en administración\n          { id: 'admin', path: 'admin', loader: cargarAdmin, Component: Admin },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "intranet.ts",
      "codigo": "import {\n  createContext, redirect,\n  type ActionFunctionArgs, type LoaderFunctionArgs, type MiddlewareFunction,\n} from 'react-router'\n\nexport type Voluntario = { id: number; nombre: string; rol: string }\nexport type Animal = { id: number; nombre: string; especie: string; edad: string; estado: string }\nexport type Visita = { fecha: string; motivo: string; clinica: string }\nexport type Estadisticas = { enAdopcion: number; enAcogida: number; adopciones: number }\nexport type Solicitud = { id: number; animal: string; familia: string; telefono: string }\n\n// ---- Lo que haría el servidor de la protectora: no hace falta que lo cambies\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\nexport function enviar<T>(url: string, method: string, datos: unknown) {\n  const headers = { 'Content-Type': 'application/json' }\n  return pedir<T>(url, { method, headers, body: JSON.stringify(datos) })\n}\n\n// La sesión vive en /api/sesion/1 y sobrevive a «Recargar», como una cookie\nexport async function quienSoy(signal?: AbortSignal) {\n  return (await pedir<{ voluntario: Voluntario | null }>('/api/sesion/1', { signal })).voluntario\n}\n\nexport async function guardarSesion(voluntario: Voluntario | null) {\n  await enviar('/api/sesion/1', 'PATCH', { voluntario })\n}\n\n// Las estadísticas tardan: el servidor recorre las fichas de todo el año\nexport async function pedirEstadisticas(anio: string, signal: AbortSignal) {\n  const respuesta = await fetch(`/api/estadisticas/${anio}`, { signal })\n  await new Promise((resolver) => setTimeout(resolver, 900)) // lo que tarda en calcularlas\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<Estadisticas>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría el archivo y apunta su nombre.\nexport const descargados: string[] = []\n\nexport async function descargar<T>(archivo: string, ms: number, importar: () => Promise<T>) {\n  await new Promise((resolver) => setTimeout(resolver, ms))\n  descargados.push(archivo)\n  return importar()\n}\n\n// ---- La sesión en el router\n\nexport const voluntarioContext = createContext<Voluntario>()\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const voluntario = await quienSoy(request.signal)\n  if (!voluntario) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(voluntarioContext, voluntario)\n}\n\n// Los componentes no ven el contexto del router: se lo pasa este loader\nexport function cargarVoluntario({ context }: LoaderFunctionArgs) {\n  return context.get(voluntarioContext)\n}\n\n// Solo rutas de esta intranet; cualquier otra cosa, al panel\nexport function destinoSeguro(volver: string | null, base: string) {\n  if (!volver) return '/panel'\n  const url = new URL(volver, base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/panel'\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('voluntario')\n  await guardarSesion(await pedir<Voluntario>(`/api/voluntarios/${id}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/entrar')\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Suspense } from 'react'\nimport {\n  Await, Form, Link, NavLink, Outlet, useAsyncError, useLoaderData, useNavigation,\n  useRouteError, useSearchParams, type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargarVoluntario, descargados, pedir, pedirEstadisticas, type Animal } from './intranet'\n\nexport function Intranet() {\n  const voluntario = useLoaderData<typeof cargarVoluntario>()\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Protectora de Animales de Calatayud</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/panel\">Panel</NavLink> <NavLink to=\"/admin\">Administración</NavLink>\n        </nav>\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {voluntario.nombre} <button>Salir</button>\n        </Form>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n      <footer>Descargado bajo demanda: {descargados.join(', ') || 'nada'}</footer>\n    </>\n  )\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <main>\n      <h1>Intranet de la protectora</h1>\n      <Form method=\"post\">\n        {volver && <p>Para ver {volver}, entra primero.</p>}\n        <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n        <button name=\"voluntario\" value=\"1\">Entrar como Pilar Gimeno</button>{' '}\n        <button name=\"voluntario\" value=\"2\">Entrar como Javier Lafuente</button>\n      </Form>\n    </main>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La intranet no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport async function cargarPanel({ request }: LoaderFunctionArgs) {\n  const anio = new URL(request.url).searchParams.get('anio') ?? '2026'\n  // Sin await y antes que la lista, para que salgan a la vez (lección 9)\n  const estadisticas = pedirEstadisticas(anio, request.signal)\n  estadisticas.catch(() => {})\n  const animales = await pedir<Animal[]>('/api/animales', { signal: request.signal })\n  return { anio, animales, estadisticas }\n}\n\nfunction ErrorEstadisticas() {\n  const error = useAsyncError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">No se han podido calcular las estadísticas ({motivo}).</p>\n}\n\nexport function Panel() {\n  const { anio, animales, estadisticas } = useLoaderData<typeof cargarPanel>()\n  return (\n    <>\n      <h1>Panel</h1>\n      <h2>Animales en la protectora</h2>\n      <ul>\n        {animales.map((animal) => (\n          <li key={animal.id}>\n            <Link to={`/animales/${animal.id}/historial`}>{animal.nombre}</Link> · {animal.estado}\n          </li>\n        ))}\n      </ul>\n      <h2>Estadísticas de {anio}</h2>\n      <p>\n        <Link to=\"?anio=2026\">2026</Link> · <Link to=\"?anio=2025\">2025</Link> ·{' '}\n        <Link to=\"?anio=2024\">2024</Link>\n      </p>\n      <Suspense key={anio} fallback={<p>Calculando las estadísticas de {anio}…</p>}>\n        <Await resolve={estadisticas} errorElement={<ErrorEstadisticas />}>\n          {(cifras) => (\n            <ul className=\"cifras\">\n              <li>En adopción: {cifras.enAdopcion}</li>\n              <li>En acogida: {cifras.enAcogida}</li>\n              <li>Adopciones: {cifras.adopciones}</li>\n            </ul>\n          )}\n        </Await>\n      </Suspense>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "animales.tsx",
      "codigo": "import { useRef, useState } from 'react'\nimport {\n  Form, NavLink, Outlet, redirect, useBlocker, useLoaderData, useRouteError,\n  useRouteLoaderData, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { enviar, pedir, type Animal, type Visita } from './intranet'\n\nexport function cargarAnimal({ params, request }: LoaderFunctionArgs) {\n  return pedir<Animal>(`/api/animales/${params.id}`, { signal: request.signal })\n}\n\nexport function Ficha() {\n  const animal = useLoaderData<typeof cargarAnimal>()\n  const [busqueda] = useSearchParams()\n  return (\n    <article>\n      <h1>{animal.nombre}</h1>\n      <p>{animal.especie} · {animal.edad} · {animal.estado}</p>\n      {busqueda.has('solicitud') && <p className=\"hecho\">Solicitud de adopción registrada.</p>}\n      <nav aria-label=\"Ficha\">\n        <NavLink to=\"historial\">Historial veterinario</NavLink>{' '}\n        <NavLink to=\"adoptar\">Solicitar adopción</NavLink>\n      </nav>\n      <Outlet />\n    </article>\n  )\n}\n\nexport async function cargarHistorial({ params, request }: LoaderFunctionArgs) {\n  const url = `/api/historiales/${params.id}`\n  return (await pedir<{ visitas: Visita[] }>(url, { signal: request.signal })).visitas\n}\n\nexport function Historial() {\n  const visitas = useLoaderData<typeof cargarHistorial>()\n  return (\n    <ul>\n      {visitas.map((visita) => (\n        <li key={visita.fecha}>{visita.fecha} · {visita.motivo} · {visita.clinica}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport function ErrorHistorial() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">No se ha podido cargar el historial veterinario ({motivo}).</p>\n}\n\nexport async function enviarSolicitud({ params, request }: ActionFunctionArgs) {\n  const datos = Object.fromEntries(await request.formData())\n  await enviar('/api/solicitudes', 'POST', datos)\n  return redirect(`/animales/${params.id}?solicitud=enviada`)\n}\n\nexport function Adopcion() {\n  const animal = useRouteLoaderData<typeof cargarAnimal>('ficha')!\n  const [hayCambios, setHayCambios] = useState(false)\n  const familia = useRef<HTMLInputElement>(null)\n  // Enviar va a la misma ruta y no cuenta como salir (lección 12)\n  const blocker = useBlocker(\n    ({ currentLocation, nextLocation }) =>\n      hayCambios && currentLocation.pathname !== nextLocation.pathname,\n  )\n  return (\n    <>\n      <Form method=\"post\" onChange={() => setHayCambios(true)}>\n        <h2>Solicitud de adopción</h2>\n        <input type=\"hidden\" name=\"animal\" value={animal.nombre} />\n        <label>\n          Familia que adopta <input ref={familia} name=\"familia\" required />\n        </label>\n        <label>\n          Teléfono <input name=\"telefono\" type=\"tel\" required />\n        </label>\n        <button>Enviar la solicitud</button>\n      </Form>\n      {blocker.state === 'blocked' && (\n        <div role=\"alertdialog\" aria-labelledby=\"aviso\" className=\"aviso\">\n          <h2 id=\"aviso\">La solicitud está a medias</h2>\n          <p>Ibas a {blocker.location.pathname}. Si sales, se pierde lo escrito.</p>\n          <button\n            autoFocus\n            onClick={() => {\n              blocker.reset()\n              familia.current?.focus()\n            }}\n          >\n            Seguir con la solicitud\n          </button>{' '}\n          <button onClick={() => blocker.proceed()}>Salir sin enviar</button>\n        </div>\n      )}\n    </>\n  )\n}\n"
    },
    {
      "nombre": "admin.tsx",
      "codigo": "// El área de administración. En la intranet de verdad trae además una\n// librería para exportar las solicitudes a una hoja de cálculo: pesa, y\n// solo la usa la coordinación.\nimport { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Solicitud } from './intranet'\n\nexport function loader({ request }: LoaderFunctionArgs) {\n  return pedir<Solicitud[]>('/api/solicitudes', { signal: request.signal })\n}\n\nexport default function Admin() {\n  const solicitudes = useLoaderData<typeof loader>()\n  return (\n    <>\n      <h1>Administración</h1>\n      <h2>Solicitudes de adopción</h2>\n      <ul>\n        {solicitudes.map((solicitud) => (\n          <li key={solicitud.id}>\n            {solicitud.familia} · {solicitud.animal} · {solicitud.telefono}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a24;\n  background: #f4f7f2;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f5d46;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n/* La sección en la que estás, subrayada en gruesa */\nnav a.active {\n  text-decoration-thickness: 3px;\n}\n\nheader form {\n  margin-left: auto;\n  font-size: 0.9rem;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1 {\n  margin: 0 0 0.4rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 0.8rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n/* Las cifras de las estadísticas, en fichas */\n.cifras {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cifras li {\n  padding: 0.4rem 0.7rem;\n  border-radius: 6px;\n  background: #dde9df;\n  font-weight: 600;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\n.hecho {\n  color: #2f5d46;\n  font-weight: 600;\n}\n\n.aviso {\n  margin-top: 0.8rem;\n  padding: 0.7rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: #fff7ed;\n}\n\n[role='alert'] {\n  color: #9f1239;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #4b5e53;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #c9d6cc;\n  font-size: 0.8rem;\n  color: #4b5e53;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/panel",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "voluntario": {
          "id": 1,
          "nombre": "Pilar Gimeno",
          "rol": "coordinación"
        }
      }
    ],
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Pilar Gimeno",
        "rol": "coordinación"
      },
      {
        "id": 2,
        "nombre": "Javier Lafuente",
        "rol": "voluntariado"
      }
    ],
    "animales": [
      {
        "id": 1,
        "nombre": "Tizón",
        "especie": "Perro, mestizo de pastor",
        "edad": "4 años",
        "estado": "En adopción"
      },
      {
        "id": 2,
        "nombre": "Morena",
        "especie": "Perra, galga",
        "edad": "6 años",
        "estado": "En adopción"
      },
      {
        "id": 3,
        "nombre": "Bigotes",
        "especie": "Gato común europeo",
        "edad": "2 años",
        "estado": "En adopción"
      },
      {
        "id": 4,
        "nombre": "Rufo",
        "especie": "Perro, podenco",
        "edad": "9 años",
        "estado": "En casa de acogida"
      },
      {
        "id": 5,
        "nombre": "Canela",
        "especie": "Perra, mestiza",
        "edad": "1 año",
        "estado": "Recién llegada"
      },
      {
        "id": 6,
        "nombre": "Nube",
        "especie": "Gata, angora",
        "edad": "3 años",
        "estado": "Reservada"
      }
    ],
    "historiales": [
      {
        "id": 1,
        "visitas": [
          {
            "fecha": "2026-02-12",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-03-03",
            "motivo": "Vacuna de la rabia",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-09-18",
            "motivo": "Limpieza de oídos",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 2,
        "visitas": [
          {
            "fecha": "2025-11-20",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-01-15",
            "motivo": "Esterilización",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 3,
        "visitas": [
          {
            "fecha": "2026-06-02",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          },
          {
            "fecha": "2026-07-10",
            "motivo": "Vacuna trivalente felina",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      },
      {
        "id": 4,
        "visitas": [
          {
            "fecha": "2025-04-08",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-05-21",
            "motivo": "Analítica de leishmania",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 6,
        "visitas": [
          {
            "fecha": "2026-08-30",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      }
    ],
    "estadisticas": [
      {
        "id": 2026,
        "enAdopcion": 3,
        "enAcogida": 1,
        "adopciones": 41
      },
      {
        "id": 2025,
        "enAdopcion": 7,
        "enAcogida": 3,
        "adopciones": 58
      }
    ],
    "solicitudes": [
      {
        "id": 1,
        "animal": "Tizón",
        "familia": "Familia Sancho Marín",
        "telefono": "976 88 12 34"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Mientras no entras en administración, no se descarga nada",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Adopciones: 41"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Tizón"
          }
        }
      ],
      "espera": {
        "texto": "Descargado bajo demanda: nada"
      }
    },
    {
      "descripcion": "Al entrar en «Administración», se descarga admin.tsx",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Administración"
          }
        }
      ],
      "espera": {
        "texto": "Descargado bajo demanda: admin.tsx"
      }
    },
    {
      "descripcion": "Administración enseña las solicitudes de adopción",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Administración"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Familia Sancho Marín · Tizón"
      }
    },
    {
      "descripcion": "Abrir /admin directamente también carga sus datos",
      "urlInicial": "/admin",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Familia Sancho Marín · Tizón"
      }
    },
    {
      "descripcion": "Si vuelves a Administración, admin.tsx no se descarga otra vez",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Administración"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Familia Sancho Marín"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Panel"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Canela"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Administración"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Familia Sancho Marín"
          }
        }
      ],
      "espera": {
        "texto": "Descargado bajo demanda: admin.tsx"
      }
    },
    {
      "descripcion": "Una solicitud enviada desde una ficha aparece en Administración",
      "urlInicial": "/animales/3/adoptar",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Familia que adopta",
            "texto": "Familia Ibáñez Royo"
          }
        },
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "976 61 22 09"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar la solicitud"
          }
        },
        {
          "pulsar": {
            "texto": "Solicitud de adopción registrada."
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Administración"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Familia Ibáñez Royo · Bigotes"
      }
    }
  ]
}
```

Con la solución, entra en «Administración» y mira el registro del router: un paso `lazy admin` de 700 ms y otro, `middleware privada`, que empiezan a la vez; el `loader admin` arranca cuando han terminado los dos. La segunda vez que entras, el paso `lazy` ya no está: el router guardó lo que trajo en la ruta y no vuelve a llamar a la función.

Que el `lazy` y el middleware vayan a la vez tiene una consecuencia que conviene pensar antes de seguir:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "{\n  id: 'privada',\n  middleware: [exigirSesion], // sin sesión, redirect a /entrar?volver=…\n  children: [\n    // …\n    {\n      id: 'admin',\n      path: 'admin',\n      lazy: async () => {\n        const admin = await descargar('admin.tsx', 700, () => import('./admin'))\n        return { loader: admin.loader, Component: admin.default }\n      },\n    },\n  ],\n}\n\n// Sin sesión, alguien abre /admin directamente.\n// La sesión tarda 300 ms en contestar. ¿Qué pasa con admin.tsx?",
  "opciones": [
    "No se descarga: el middleware redirige antes de llegar a la ruta admin",
    "Se descarga, pero la redirección a /entrar sale a los 300 ms sin esperarla",
    "Se descarga, y la redirección a /entrar espera a que llegue: unos 700 ms",
    "Se descarga y se ejecuta su loader, que falla porque no hay sesión"
  ],
  "correcta": 2,
  "explicacion": "El router conoce las rutas que encajan antes de ejecutar nada, y pone en marcha a la vez el lazy y la cadena de middleware. El middleware lanza su redirect a los 300 ms, pero la carga inicial no termina hasta que acaba el lazy: en el registro, 702 ms, y el pie dice admin.tsx. El loader no llega a ejecutarse. Comprobado en la vista previa y en un proyecto de Vite, donde el navegador pidió src/admin.tsx antes de ir a /entrar."
}
```

**El middleware protege los datos y las acciones de una rama de rutas, pero no su código.** Aquí no es un problema: el código de una SPA es público de todas formas (cualquiera puede descargar los archivos de tu web), y lo que importa, las solicitudes con los teléfonos de las familias, solo lo da el servidor a quien tenga sesión y permiso. Lo que sí notas es la espera: la redirección tarda lo que tarde la descarga. Si un área pesada la visitan sobre todo quienes no tienen sesión, merece la pena ponerle la puerta antes, en una ruta que no sea perezosa.

## La intranet completa

Esta es la intranet terminada, con la API simulada desde cero: sin sesión y con la latencia a 300 ms. Recórrela con el registro del router abierto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La intranet de la Protectora de Animales de Calatayud",
  "consigna": "Arrancas en /panel sin sesión: el middleware te manda a entrar. Entra como Pilar y mira en el registro la action, el middleware y los loader de la misma operación. Cambia de año en las estadísticas, abre el historial de Canela, rellena a medias una solicitud y prueba a salir, envíala y entra en «Administración» para verla. Por último, «Salir», y prueba en la barra /entrar?volver=%2F%2Fprotectora-falsa.example.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport {\n  Adopcion, cargarAnimal, cargarHistorial, enviarSolicitud, ErrorHistorial, Ficha, Historial,\n} from './animales'\nimport {\n  accionEntrar, accionSalir, cargarVoluntario, descargar, exigirSesion,\n} from './intranet'\nimport { cargarPanel, Entrar, ErrorRaiz, Intranet, Panel } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    ErrorBoundary: ErrorRaiz,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la intranet…</p>,\n    children: [\n      { index: true, loader: () => redirect('/panel') },\n      { path: 'entrar', action: accionEntrar, Component: Entrar },\n      { path: 'salir', action: accionSalir },\n      {\n        id: 'privada',\n        middleware: [exigirSesion],\n        loader: cargarVoluntario,\n        Component: Intranet,\n        children: [\n          { id: 'panel', path: 'panel', loader: cargarPanel, Component: Panel },\n          {\n            id: 'ficha',\n            path: 'animales/:id',\n            loader: cargarAnimal,\n            Component: Ficha,\n            children: [\n              {\n                id: 'historial',\n                path: 'historial',\n                loader: cargarHistorial,\n                Component: Historial,\n                ErrorBoundary: ErrorHistorial,\n              },\n              { id: 'adoptar', path: 'adoptar', action: enviarSolicitud, Component: Adopcion },\n            ],\n          },\n          {\n            id: 'admin',\n            path: 'admin',\n            // Solo se descarga cuando alguien entra en administración\n            lazy: async () => {\n              const admin = await descargar('admin.tsx', 700, () => import('./admin'))\n              return { loader: admin.loader, Component: admin.default }\n            },\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "intranet.ts",
      "codigo": "import {\n  createContext, redirect,\n  type ActionFunctionArgs, type LoaderFunctionArgs, type MiddlewareFunction,\n} from 'react-router'\n\nexport type Voluntario = { id: number; nombre: string; rol: string }\nexport type Animal = { id: number; nombre: string; especie: string; edad: string; estado: string }\nexport type Visita = { fecha: string; motivo: string; clinica: string }\nexport type Estadisticas = { enAdopcion: number; enAcogida: number; adopciones: number }\nexport type Solicitud = { id: number; animal: string; familia: string; telefono: string }\n\n// ---- Lo que haría el servidor de la protectora: no hace falta que lo cambies\n\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<T>\n}\n\nexport function enviar<T>(url: string, method: string, datos: unknown) {\n  const headers = { 'Content-Type': 'application/json' }\n  return pedir<T>(url, { method, headers, body: JSON.stringify(datos) })\n}\n\n// La sesión vive en /api/sesion/1 y sobrevive a «Recargar», como una cookie\nexport async function quienSoy(signal?: AbortSignal) {\n  return (await pedir<{ voluntario: Voluntario | null }>('/api/sesion/1', { signal })).voluntario\n}\n\nexport async function guardarSesion(voluntario: Voluntario | null) {\n  await enviar('/api/sesion/1', 'PATCH', { voluntario })\n}\n\n// Las estadísticas tardan: el servidor recorre las fichas de todo el año\nexport async function pedirEstadisticas(anio: string, signal: AbortSignal) {\n  const respuesta = await fetch(`/api/estadisticas/${anio}`, { signal })\n  await new Promise((resolver) => setTimeout(resolver, 900)) // lo que tarda en calcularlas\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json() as Promise<Estadisticas>\n}\n\n// En la vista previa, import() no descarga nada: el módulo ya está en memoria.\n// descargar() espera lo que tardaría el archivo y apunta su nombre.\nexport const descargados: string[] = []\n\nexport async function descargar<T>(archivo: string, ms: number, importar: () => Promise<T>) {\n  await new Promise((resolver) => setTimeout(resolver, ms))\n  descargados.push(archivo)\n  return importar()\n}\n\n// ---- La sesión en el router\n\nexport const voluntarioContext = createContext<Voluntario>()\n\nexport const exigirSesion: MiddlewareFunction = async ({ request, context }) => {\n  const voluntario = await quienSoy(request.signal)\n  if (!voluntario) {\n    const { pathname, search } = new URL(request.url)\n    throw redirect('/entrar?volver=' + encodeURIComponent(pathname + search))\n  }\n  context.set(voluntarioContext, voluntario)\n}\n\n// Los componentes no ven el contexto del router: se lo pasa este loader\nexport function cargarVoluntario({ context }: LoaderFunctionArgs) {\n  return context.get(voluntarioContext)\n}\n\n// Solo rutas de esta intranet; cualquier otra cosa, al panel\nexport function destinoSeguro(volver: string | null, base: string) {\n  if (!volver) return '/panel'\n  const url = new URL(volver, base)\n  // Mirar el origen no basta: «/.//otra-web.example» es de tu origen, pero su ruta\n  // normalizada, «//otra-web.example», el navegador la lee como otro dominio\n  const ruta = url.pathname + url.search\n  return url.origin === new URL(base).origin && !ruta.startsWith('//') ? ruta : '/panel'\n}\n\nexport async function accionEntrar({ request }: ActionFunctionArgs) {\n  const id = (await request.formData()).get('voluntario')\n  await guardarSesion(await pedir<Voluntario>(`/api/voluntarios/${id}`))\n  const volver = new URL(request.url).searchParams.get('volver')\n  return redirect(destinoSeguro(volver, request.url))\n}\n\nexport async function accionSalir() {\n  await guardarSesion(null)\n  return redirect('/entrar')\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Suspense } from 'react'\nimport {\n  Await, Form, Link, NavLink, Outlet, useAsyncError, useLoaderData, useNavigation,\n  useRouteError, useSearchParams, type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargarVoluntario, descargados, pedir, pedirEstadisticas, type Animal } from './intranet'\n\nexport function Intranet() {\n  const voluntario = useLoaderData<typeof cargarVoluntario>()\n  const navigation = useNavigation()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Protectora de Animales de Calatayud</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/panel\">Panel</NavLink> <NavLink to=\"/admin\">Administración</NavLink>\n        </nav>\n        <Form method=\"post\" action=\"/salir\">\n          Hola, {voluntario.nombre} <button>Salir</button>\n        </Form>\n        <p role=\"status\">{navigation.state !== 'idle' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n      <footer>Descargado bajo demanda: {descargados.join(', ') || 'nada'}</footer>\n    </>\n  )\n}\n\nexport function Entrar() {\n  const [busqueda] = useSearchParams()\n  const volver = busqueda.get('volver')\n  return (\n    <main>\n      <h1>Intranet de la protectora</h1>\n      <Form method=\"post\">\n        {volver && <p>Para ver {volver}, entra primero.</p>}\n        <p>En la vista previa no hay contraseñas: elige quién eres.</p>\n        <button name=\"voluntario\" value=\"1\">Entrar como Pilar Gimeno</button>{' '}\n        <button name=\"voluntario\" value=\"2\">Entrar como Javier Lafuente</button>\n      </Form>\n    </main>\n  )\n}\n\nexport function ErrorRaiz() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">La intranet no está disponible ahora mismo ({motivo}).</p>\n}\n\nexport async function cargarPanel({ request }: LoaderFunctionArgs) {\n  const anio = new URL(request.url).searchParams.get('anio') ?? '2026'\n  // Sin await y antes que la lista, para que salgan a la vez (lección 9)\n  const estadisticas = pedirEstadisticas(anio, request.signal)\n  estadisticas.catch(() => {})\n  const animales = await pedir<Animal[]>('/api/animales', { signal: request.signal })\n  return { anio, animales, estadisticas }\n}\n\nfunction ErrorEstadisticas() {\n  const error = useAsyncError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">No se han podido calcular las estadísticas ({motivo}).</p>\n}\n\nexport function Panel() {\n  const { anio, animales, estadisticas } = useLoaderData<typeof cargarPanel>()\n  return (\n    <>\n      <h1>Panel</h1>\n      <h2>Animales en la protectora</h2>\n      <ul>\n        {animales.map((animal) => (\n          <li key={animal.id}>\n            <Link to={`/animales/${animal.id}/historial`}>{animal.nombre}</Link> · {animal.estado}\n          </li>\n        ))}\n      </ul>\n      <h2>Estadísticas de {anio}</h2>\n      <p>\n        <Link to=\"?anio=2026\">2026</Link> · <Link to=\"?anio=2025\">2025</Link> ·{' '}\n        <Link to=\"?anio=2024\">2024</Link>\n      </p>\n      <Suspense key={anio} fallback={<p>Calculando las estadísticas de {anio}…</p>}>\n        <Await resolve={estadisticas} errorElement={<ErrorEstadisticas />}>\n          {(cifras) => (\n            <ul className=\"cifras\">\n              <li>En adopción: {cifras.enAdopcion}</li>\n              <li>En acogida: {cifras.enAcogida}</li>\n              <li>Adopciones: {cifras.adopciones}</li>\n            </ul>\n          )}\n        </Await>\n      </Suspense>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "animales.tsx",
      "codigo": "import { useRef, useState } from 'react'\nimport {\n  Form, NavLink, Outlet, redirect, useBlocker, useLoaderData, useRouteError,\n  useRouteLoaderData, useSearchParams, type ActionFunctionArgs, type LoaderFunctionArgs,\n} from 'react-router'\nimport { enviar, pedir, type Animal, type Visita } from './intranet'\n\nexport function cargarAnimal({ params, request }: LoaderFunctionArgs) {\n  return pedir<Animal>(`/api/animales/${params.id}`, { signal: request.signal })\n}\n\nexport function Ficha() {\n  const animal = useLoaderData<typeof cargarAnimal>()\n  const [busqueda] = useSearchParams()\n  return (\n    <article>\n      <h1>{animal.nombre}</h1>\n      <p>{animal.especie} · {animal.edad} · {animal.estado}</p>\n      {busqueda.has('solicitud') && <p className=\"hecho\">Solicitud de adopción registrada.</p>}\n      <nav aria-label=\"Ficha\">\n        <NavLink to=\"historial\">Historial veterinario</NavLink>{' '}\n        <NavLink to=\"adoptar\">Solicitar adopción</NavLink>\n      </nav>\n      <Outlet />\n    </article>\n  )\n}\n\nexport async function cargarHistorial({ params, request }: LoaderFunctionArgs) {\n  const url = `/api/historiales/${params.id}`\n  return (await pedir<{ visitas: Visita[] }>(url, { signal: request.signal })).visitas\n}\n\nexport function Historial() {\n  const visitas = useLoaderData<typeof cargarHistorial>()\n  return (\n    <ul>\n      {visitas.map((visita) => (\n        <li key={visita.fecha}>{visita.fecha} · {visita.motivo} · {visita.clinica}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport function ErrorHistorial() {\n  const error = useRouteError()\n  const motivo = error instanceof Error ? error.message : 'error desconocido'\n  return <p role=\"alert\">No se ha podido cargar el historial veterinario ({motivo}).</p>\n}\n\nexport async function enviarSolicitud({ params, request }: ActionFunctionArgs) {\n  const datos = Object.fromEntries(await request.formData())\n  await enviar('/api/solicitudes', 'POST', datos)\n  return redirect(`/animales/${params.id}?solicitud=enviada`)\n}\n\nexport function Adopcion() {\n  const animal = useRouteLoaderData<typeof cargarAnimal>('ficha')!\n  const [hayCambios, setHayCambios] = useState(false)\n  const familia = useRef<HTMLInputElement>(null)\n  // Enviar va a la misma ruta y no cuenta como salir (lección 12)\n  const blocker = useBlocker(\n    ({ currentLocation, nextLocation }) =>\n      hayCambios && currentLocation.pathname !== nextLocation.pathname,\n  )\n  return (\n    <>\n      <Form method=\"post\" onChange={() => setHayCambios(true)}>\n        <h2>Solicitud de adopción</h2>\n        <input type=\"hidden\" name=\"animal\" value={animal.nombre} />\n        <label>\n          Familia que adopta <input ref={familia} name=\"familia\" required />\n        </label>\n        <label>\n          Teléfono <input name=\"telefono\" type=\"tel\" required />\n        </label>\n        <button>Enviar la solicitud</button>\n      </Form>\n      {blocker.state === 'blocked' && (\n        <div role=\"alertdialog\" aria-labelledby=\"aviso\" className=\"aviso\">\n          <h2 id=\"aviso\">La solicitud está a medias</h2>\n          <p>Ibas a {blocker.location.pathname}. Si sales, se pierde lo escrito.</p>\n          <button\n            autoFocus\n            onClick={() => {\n              blocker.reset()\n              familia.current?.focus()\n            }}\n          >\n            Seguir con la solicitud\n          </button>{' '}\n          <button onClick={() => blocker.proceed()}>Salir sin enviar</button>\n        </div>\n      )}\n    </>\n  )\n}\n"
    },
    {
      "nombre": "admin.tsx",
      "codigo": "// El área de administración. En la intranet de verdad trae además una\n// librería para exportar las solicitudes a una hoja de cálculo: pesa, y\n// solo la usa la coordinación.\nimport { useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Solicitud } from './intranet'\n\nexport function loader({ request }: LoaderFunctionArgs) {\n  return pedir<Solicitud[]>('/api/solicitudes', { signal: request.signal })\n}\n\nexport default function Admin() {\n  const solicitudes = useLoaderData<typeof loader>()\n  return (\n    <>\n      <h1>Administración</h1>\n      <h2>Solicitudes de adopción</h2>\n      <ul>\n        {solicitudes.map((solicitud) => (\n          <li key={solicitud.id}>\n            {solicitud.familia} · {solicitud.animal} · {solicitud.telefono}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2a24;\n  background: #f4f7f2;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.25rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #2f5d46;\n  color: #fff;\n}\n\nheader a {\n  color: #fff;\n}\n\n/* La sección en la que estás, subrayada en gruesa */\nnav a.active {\n  text-decoration-thickness: 3px;\n}\n\nheader form {\n  margin-left: auto;\n  font-size: 0.9rem;\n}\n\n.logo {\n  margin: 0;\n  font-weight: 700;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  font-size: 0.9rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router carga otra página, la actual se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1 {\n  margin: 0 0 0.4rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 0.8rem 0 0.4rem;\n  font-size: 1.1rem;\n}\n\np {\n  margin: 0 0 0.4rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n/* Las cifras de las estadísticas, en fichas */\n.cifras {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cifras li {\n  padding: 0.4rem 0.7rem;\n  border-radius: 6px;\n  background: #dde9df;\n  font-weight: 600;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\n.hecho {\n  color: #2f5d46;\n  font-weight: 600;\n}\n\n.aviso {\n  margin-top: 0.8rem;\n  padding: 0.7rem;\n  border: 2px solid #b45309;\n  border-radius: 6px;\n  background: #fff7ed;\n}\n\n[role='alert'] {\n  color: #9f1239;\n}\n\n.cargando {\n  padding: 1rem;\n  color: #4b5e53;\n}\n\nfooter {\n  padding: 0.5rem 1rem;\n  border-top: 1px solid #c9d6cc;\n  font-size: 0.8rem;\n  color: #4b5e53;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/panel",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "sesion": [
      {
        "id": 1,
        "voluntario": null
      }
    ],
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Pilar Gimeno",
        "rol": "coordinación"
      },
      {
        "id": 2,
        "nombre": "Javier Lafuente",
        "rol": "voluntariado"
      }
    ],
    "animales": [
      {
        "id": 1,
        "nombre": "Tizón",
        "especie": "Perro, mestizo de pastor",
        "edad": "4 años",
        "estado": "En adopción"
      },
      {
        "id": 2,
        "nombre": "Morena",
        "especie": "Perra, galga",
        "edad": "6 años",
        "estado": "En adopción"
      },
      {
        "id": 3,
        "nombre": "Bigotes",
        "especie": "Gato común europeo",
        "edad": "2 años",
        "estado": "En adopción"
      },
      {
        "id": 4,
        "nombre": "Rufo",
        "especie": "Perro, podenco",
        "edad": "9 años",
        "estado": "En casa de acogida"
      },
      {
        "id": 5,
        "nombre": "Canela",
        "especie": "Perra, mestiza",
        "edad": "1 año",
        "estado": "Recién llegada"
      },
      {
        "id": 6,
        "nombre": "Nube",
        "especie": "Gata, angora",
        "edad": "3 años",
        "estado": "Reservada"
      }
    ],
    "historiales": [
      {
        "id": 1,
        "visitas": [
          {
            "fecha": "2026-02-12",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-03-03",
            "motivo": "Vacuna de la rabia",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-09-18",
            "motivo": "Limpieza de oídos",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 2,
        "visitas": [
          {
            "fecha": "2025-11-20",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-01-15",
            "motivo": "Esterilización",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 3,
        "visitas": [
          {
            "fecha": "2026-06-02",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          },
          {
            "fecha": "2026-07-10",
            "motivo": "Vacuna trivalente felina",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      },
      {
        "id": 4,
        "visitas": [
          {
            "fecha": "2025-04-08",
            "motivo": "Revisión de entrada y microchip",
            "clinica": "Clínica Veterinaria Bílbilis"
          },
          {
            "fecha": "2026-05-21",
            "motivo": "Analítica de leishmania",
            "clinica": "Clínica Veterinaria Bílbilis"
          }
        ]
      },
      {
        "id": 6,
        "visitas": [
          {
            "fecha": "2026-08-30",
            "motivo": "Revisión de entrada y desparasitación",
            "clinica": "Clínica Veterinaria del Jalón"
          }
        ]
      }
    ],
    "estadisticas": [
      {
        "id": 2026,
        "enAdopcion": 3,
        "enAcogida": 1,
        "adopciones": 41
      },
      {
        "id": 2025,
        "enAdopcion": 7,
        "enAcogida": 3,
        "adopciones": 58
      }
    ],
    "solicitudes": [
      {
        "id": 1,
        "animal": "Tizón",
        "familia": "Familia Sancho Marín",
        "telefono": "976 88 12 34"
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

La operación más larga de la intranet es entrar. En el registro sale como un solo envío con dos fases, y en el panel de red, con todas sus peticiones. Con 300 ms de latencia, desde que pulsas «Entrar como Pilar Gimeno» hasta que salen las cifras del año (medido en Chromium; tus números variarán unos milisegundos):

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Entrar, de principio a fin",
  "items": [
    {
      "fecha": "0 ms",
      "titulo": "La action de entrar",
      "texto": "accionEntrar pide el voluntario (GET /api/voluntarios/1) y guarda la sesión (PATCH /api/sesion/1): dos peticiones seguidas, unos 600 ms. Devuelve el redirect que ha decidido destinoSeguro."
    },
    {
      "fecha": "600 ms",
      "titulo": "Tras redirigir: el middleware",
      "texto": "La navegación a /panel recorre la cadena desde el principio, con un contexto nuevo. exigirSesion vuelve a preguntar por la sesión, esta vez con respuesta, y deja a Pilar en el contexto."
    },
    {
      "fecha": "900 ms",
      "titulo": "Los loader, a la vez",
      "texto": "cargarVoluntario lee el contexto y termina en 0 ms. cargarPanel lanza las estadísticas y los animales a la vez, y espera solo a los animales."
    },
    {
      "fecha": "1.200 ms",
      "titulo": "El panel en pantalla",
      "texto": "Llegan los animales y termina la operación: la barra cambia a /panel y se pinta la intranet con «Calculando las estadísticas de 2026…» en su hueco."
    },
    {
      "fecha": "2.100 ms",
      "titulo": "Las cifras",
      "texto": "La petición de las estadísticas llegó a la vez que la de los animales, pero el servidor tarda 900 ms más en calcularlas. Await las pinta sin que el router haga nada: para él, la operación terminó hace 900 ms."
    }
  ]
}
```

## Cuándo lo usarías de verdad

Casi cualquier aplicación interna (la intranet de una asociación, el panel de una tienda, la gestión de un club) tiene estas cinco piezas, y casi siempre en este orden de importancia:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "La puerta, siempre",
      "texto": "Un middleware en una ruta de maquetación sin path protege toda la rama de una vez, incluidas las páginas sin loader y los envíos. Y cualquier destino que venga de la URL, como volver, se valida antes de redirigir."
    },
    {
      "titulo": "Streaming, para lo caro y secundario",
      "texto": "Informes, contadores, recomendaciones: lo que tarda bastante más que la página y no la deja inservible si falla. Lo que llega casi a la vez, mejor con await (lección 9)."
    },
    {
      "titulo": "Un límite por pieza que puede fallar sola",
      "texto": "Cada pestaña, panel o ruta hija que carga sus propios datos lleva su ErrorBoundary. Así un servicio caído se lleva su hueco y no la página."
    },
    {
      "titulo": "useBlocker, en formularios largos",
      "texto": "Solicitudes, fichas de alta, cualquier cosa que cueste rellenar. En un buscador o un filtro, no: ahí perder lo escrito no importa."
    },
    {
      "titulo": "lazy, en las áreas que usa poca gente",
      "texto": "Administración, informes, ajustes, editores con librerías pesadas. Lo que todos usan al entrar, como el panel, no gana nada yendo aparte."
    }
  ]
}
```

## Errores típicos

**Validar `?volver=` mirando cómo empieza.** Es lo primero que se le ocurre a casi todo el mundo, y parece suficiente: si empieza por `/`, es una ruta de mi web.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "export function destinoSeguro(volver: string | null) {\n  return volver?.startsWith('/') ? volver : '/panel'\n}\n\n// En accionEntrar:\n//   return redirect(destinoSeguro(volver))\n//\n// En tu proyecto de Vite, abres\n//   /entrar?volver=%2F%2Fprotectora-falsa.example%2Fpanel\n// y entras como Pilar. ¿Dónde acabas?",
  "opciones": [
    "En /panel: //protectora-falsa.example no es una ruta de la intranet",
    "En la ruta //protectora-falsa.example/panel de tu intranet, que no existe: un 404",
    "En http://protectora-falsa.example/panel: el navegador sale de tu web",
    "En /entrar otra vez: el router rechaza la redirección"
  ],
  "correcta": 2,
  "explicacion": "//protectora-falsa.example/panel empieza por /, así que pasa el filtro. Pero para el navegador es una dirección sin protocolo, de otro dominio, y el router la trata como una redirección externa: carga el documento nuevo. Comprobado en un proyecto de Vite en Chromium. En la vista previa no se ve, porque el iframe no puede irse a otra web y te quedas en Entrar. Con new URL y la comparación de orígenes, sale /panel."
}
```

Lo mismo pasa con `/\protectora-falsa.example`: el navegador trata la barra invertida como una barra normal en las direcciones `http` y `https`. **No intentes adivinar cómo va a interpretar el navegador una dirección: pídele que la interprete él, con `new URL`, y comprueba el resultado.**

Y comprueba el resultado entero, no solo el origen. `new URL` resuelve los `.` y los `..` de la ruta, así que una dirección de tu web puede convertirse en otra cosa:

| `volver` | Origen | `pathname` | El navegador va a |
|---|---|---|---|
| `/.//protectora-falsa.example/panel` | El tuyo | `//protectora-falsa.example/panel` | `protectora-falsa.example` |
| `/a/..//protectora-falsa.example` | El tuyo | `//protectora-falsa.example` | `protectora-falsa.example` |
| `/%2e//protectora-falsa.example` | El tuyo | `//protectora-falsa.example` | `protectora-falsa.example` |
| `/animales/3/../2/historial` | El tuyo | `/animales/2/historial` | Tu intranet |

Si solo comparas el origen, las tres primeras pasan y `redirect` recibe una dirección que empieza por `//`. Por eso `destinoSeguro` descarta también las rutas normalizadas que empiezan así. La lección 20 vuelve sobre todo esto con los avisos de seguridad de React Router que salieron de este mismo fallo.

**Poner el límite de error una ruta más arriba.** Parece igual de bueno: la ficha es la que «contiene» el historial.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "{\n  id: 'ficha',\n  path: 'animales/:id',\n  loader: cargarAnimal,\n  Component: Ficha,\n  ErrorBoundary: ErrorHistorial, // aquí, y no en la hija\n  children: [\n    { id: 'historial', path: 'historial', loader: cargarHistorial, Component: Historial },\n    { id: 'adoptar', path: 'adoptar', action: enviarSolicitud, Component: Adopcion },\n  ],\n}\n\n// Abres /animales/5/historial: el historial de Canela responde 404.\n// ¿Qué se ve?",
  "opciones": [
    "La ficha de Canela, con el aviso en la pestaña del historial",
    "La cabecera de la intranet y, debajo, solo el aviso: ni el nombre de Canela ni sus pestañas",
    "Solo el aviso, sin cabecera: el error sigue subiendo hasta la raíz",
    "La ficha de Canela sin aviso: el límite de la madre no recoge errores de las hijas"
  ],
  "correcta": 1,
  "explicacion": "El error sube al límite más cercano, que ahora es el de la ficha, y ese límite ocupa el sitio de su ruta: la ficha entera, con el nombre, los datos y las pestañas. Por encima, la ruta privada sigue pintando la cabecera. Comprobado en la vista previa. Para que la ficha siga, el límite va en la ruta que falla, el historial."
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si el middleware redirige, el router no descarga el lazy de la ruta",
      "realidad": "Los pone en marcha a la vez, y la redirección espera a que termine la descarga. El middleware protege los datos y las acciones, no el código."
    },
    {
      "mito": "Para que no se pierda la solicitud basta con useBlocker(hayCambios)",
      "realidad": "Con el booleano, el router para también tu propio envío, que es una navegación hacia la action. Usa la función que compara el pathname, como en la lección 12."
    },
    {
      "mito": "Con streaming, las estadísticas empiezan a pedirse antes",
      "realidad": "Empiezan cuando las lanzas. Si las devuelves sin await pero las creas después del await de los animales, siguen yendo en cadena: lánzalas primero."
    },
    {
      "mito": "Comprobar el origen con new URL hace segura la intranet",
      "realidad": "Evita que la intranet mande a sus voluntarios a otra web. La seguridad de los datos sigue siendo cosa del servidor, que comprueba la sesión en cada petición (lección 102 de React y lección 18)."
    }
  ]
}
```

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Una puerta para toda una rama",
      "texto": "El middleware de una ruta sin path se ejecuta en cada navegación y en cada envío de sus hijas, antes que sus loader y su action, y deja al usuario en un contexto tipado con createContext."
    },
    {
      "titulo": "volver, siempre validado",
      "texto": "Se interpreta con new URL contra la URL de la petición y solo se usa si el origen es el tuyo y la ruta normalizada no empieza por //. Cualquier otra cosa, a una página conocida."
    },
    {
      "titulo": "Lo crítico, con await; lo demás, como promesa",
      "texto": "Lanzada antes del await, con su catch vacío y pintada con Suspense, Await y errorElement. Con key en el Suspense si cambian los parámetros de la misma ruta."
    },
    {
      "titulo": "Cada fallo, en su hueco",
      "texto": "El ErrorBoundary va en la ruta que falla. Todo lo que queda por encima se pinta con los datos que sí llegaron."
    },
    {
      "titulo": "Preguntar solo cuando de verdad te vas",
      "texto": "useBlocker con una función que compara el pathname: el envío y la redirección pasan, los enlaces y Atrás se paran."
    },
    {
      "titulo": "Lo que usa poca gente, aparte",
      "texto": "lazy como función devuelve el loader y el componente. El router lo llama una vez, a la vez que el middleware, y guarda lo que trae en la ruta."
    }
  ]
}
```

## Retos para seguir practicando

Sin comprobación automática. Parte de la intranet completa:

1. **Solo la coordinación en administración.** Javier es voluntario, no coordinador. Añade a la ruta `admin` un segundo middleware, `exigirCoordinacion`, que lea el voluntario del contexto y, si su `rol` no es `'coordinación'`, lance `data('Solo para la coordinación', { status: 403 })` (lección 8). Va en la ruta, no dentro de `lazy`: la forma de función no admite middleware (lección 11). Dale a `admin` un `ErrorBoundary` que lo pinte, y mira en el registro el orden de los dos middleware. ¿Se sigue descargando `admin.tsx` cuando entra Javier?
2. **Aprobar solicitudes.** Añade a `admin.tsx` una `action` que marque una solicitud como aprobada (`PATCH /api/solicitudes/:id`), con un botón por solicitud en un `fetcher.Form` (lección 5), y devuélvela también desde `lazy`. Mira en el registro qué `loader` se revalidan después.
3. **«Enviar y salir».** Añade al aviso de la solicitud un tercer botón que la envíe con un fetcher y, cuando `fetcher.data` diga que se ha guardado, llame a `blocker.proceed()`. Para eso, `enviarSolicitud` tendrá que devolver un objeto en vez de redirigir cuando la llame el fetcher (pista: el `intent` de la lección 3).
4. **Un límite para la puerta.** Pon en la ruta `privada` un `ErrorBoundary` que diga «No se ha podido comprobar tu sesión» y ofrezca un enlace «Reintentar» a la misma dirección (con `useLocation`), y repite la prueba de «Fallar la siguiente petición» del paso 3. ¿Por qué tampoco ahora se ve la cabecera? Piensa qué componente pinta la ruta que ha fallado.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Las piezas de la intranet, en la documentación",
  "recursos": [
    {
      "titulo": "Middleware",
      "descripcion": "La cadena de middleware, next(), el contexto y el patrón de autenticación que usa la puerta de la intranet.",
      "url": "https://reactrouter.com/how-to/middleware",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Streaming with Suspense",
      "descripcion": "Devolver promesas sin await desde un loader y pintarlas con Suspense y Await, como las estadísticas del panel.",
      "url": "https://reactrouter.com/how-to/suspense",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Error Boundaries",
      "descripcion": "Los límites de error por ruta y adónde sube cada fallo, como el del historial de Canela.",
      "url": "https://reactrouter.com/how-to/error-boundary",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Navigation Blocking",
      "descripcion": "useBlocker paso a paso, con la variante que guarda antes de salir del reto 3.",
      "url": "https://reactrouter.com/how-to/navigation-blocking",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Route Object: lazy",
      "descripcion": "La propiedad lazy del objeto de ruta, como función y como objeto.",
      "url": "https://reactrouter.com/start/data/route-object",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Unvalidated Redirects and Forwards Cheat Sheet",
      "descripcion": "La guía de OWASP sobre las redirecciones abiertas: por qué pasan y cómo validar el destino.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    }
  ]
}
```
