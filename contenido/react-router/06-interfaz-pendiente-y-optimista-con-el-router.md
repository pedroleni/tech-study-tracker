# Interfaz pendiente y optimista con el router

- **Módulo:** Cargar y enviar datos
- **Slug:** `interfaz-pendiente-y-optimista-con-el-router` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [Pending UI](https://reactrouter.com/start/data/pending-ui) + [Pending UI (framework)](https://reactrouter.com/start/framework/pending-ui) + [useNavigation](https://reactrouter.com/api/hooks/useNavigation) + [React Transitions](https://reactrouter.com/explanation/react-transitions) — ver `contenido/react-router/TEMARIO.md` #6
- **Requiere:** La lección 99 de React (el modo datos) y las lecciones 3 (`action` y `<Form>`) y 5 (fetchers) de esta ficha. Para comparar, la 51 (transiciones) y la 60 (`useOptimistic`) de React

---

## Qué es y para qué sirve

La brigada municipal de Calamocha, en Teruel, arregla lo que avisan los vecinos: una farola fundida, un bache, un banco roto. Su aplicación interna reparte los avisos por zonas (Casco antiguo, El Arrabal, La Estación) y deja marcarlos como resueltos desde el móvil, a pie de calle y con la cobertura que haya.

Está hecha con el modo datos: cada zona tiene su `loader` (lección 99 de React), el aviso nuevo va a la `action` de la zona (lección 3) y cada fila cambia su estado con un fetcher (lección 5). Funciona, pero con mala cobertura aparece el problema: **mientras el router espera, la pantalla no cambia**. Pulsas «El Arrabal» y sigues viendo el Casco antiguo segundo y medio. Pulsas «Marcar resuelto» y el aviso sigue pendiente hasta que el servidor contesta y el router recarga la lista. El operario vuelve a pulsar, por si acaso.

El router sabe en todo momento qué está haciendo y te lo cuenta, pero no lo pinta. La guía oficial lo dice así: la interfaz tiene que responder en el acto a lo que hace el usuario, y de eso se encarga el código de tu aplicación. Puedes responder de dos maneras:

- **Interfaz pendiente**: decir «estoy en ello». Un indicador, un enlace que gira, un botón que dice «Enviando…». Sale de `useNavigation`, de `NavLink` y del `state` de cada fetcher.
- **Interfaz optimista**: enseñar ya el resultado, antes de que llegue. Sale de lo que se está enviando (`fetcher.formData` y `navigation.formData`), sin estado propio y sin nada que deshacer si falla.

Al final verás cuándo entra `useOptimistic` (lección 60 de React) y qué hace la opción `useTransitions` del router, que decide cómo se lleva con las transiciones de React.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "React Router 8.5.0 de verdad, con la red simulada",
  "contenido": "Los bloques en vivo ejecutan React Router 8.5.0 en TSX y están escritos como en un proyecto de Vite, con createBrowserRouter. Dentro de la vista previa, createBrowserRouter usa un historial en memoria, y la barra de direcciones lo dice; en tu proyecto usará la dirección del navegador. Los avisos salen de la API simulada: debajo de la vista previa puedes cambiar la latencia y pulsar «Fallar la siguiente petición» para que el servidor responda con un error 500."
}
```

## Lo que sabe `useNavigation`: `state`, `location` y `formData`

En la lección 99 de React usaste `useNavigation` para un «Cargando…». Ahora toca el objeto entero. **`useNavigation()` devuelve la navegación que está en marcha**, la misma en cualquier componente de la app, venga de un `<Link>`, de un `<Form>` o de un `navigate()`. Si no hay ninguna, `state` vale `'idle'` y todo lo demás, `undefined`.

Mejor verlo. Este chivato pinta tal cual lo que devuelve `useNavigation()` en cada render. La API tarda 1,5 segundos, así que te da tiempo a leerlo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Chivato.tsx",
      "codigo": "import { useNavigation } from 'react-router'\n\n// Enseña tal cual lo que devuelve useNavigation() en cada render\nexport default function Chivato() {\n  const navigation = useNavigation()\n  const campos = navigation.formData\n    ? JSON.stringify(Object.fromEntries(navigation.formData))\n    : 'undefined'\n\n  return (\n    <aside className=\"chivato\" aria-label=\"Lo que devuelve useNavigation\">\n      <p>\n        state: <strong>{navigation.state}</strong>\n      </p>\n      <p>\n        location:{' '}\n        {navigation.location\n          ? navigation.location.pathname + navigation.location.search\n          : 'undefined'}\n      </p>\n      <p>formMethod: {navigation.formMethod ?? 'undefined'}</p>\n      <p>formAction: {navigation.formAction ?? 'undefined'}</p>\n      <p>formData: {campos}</p>\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet } from 'react-router'\nimport Chivato from './Chivato'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          <NavLink to=\"/\" end>\n            Inicio\n          </NavLink>\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {nombre}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <Chivato />\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { Form, useActionData, useLoaderData } from 'react-router'\nimport type { cargarZona, crearAviso } from './datos'\n\nexport default function Zona() {\n  const { nombre, q, avisos } = useLoaderData<typeof cargarZona>()\n  const resultado = useActionData<typeof crearAviso>()\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <Form method=\"get\">\n        <label>\n          Buscar <input name=\"q\" defaultValue={q} />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>\n            {aviso.texto} <span className=\"estado\">{aviso.estado}</span>\n          </li>\n        ))}\n      </ul>\n      <Form method=\"post\">\n        <label>\n          Aviso nuevo <input name=\"texto\" />\n        </label>\n        <button>Enviar aviso</button>\n        {resultado?.error && <p role=\"alert\">{resultado.error}</p>}\n      </Form>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "Chivato.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 1500
  },
  "titulo": "El chivato de useNavigation",
  "consigna": "Pulsa «El Arrabal» y mira el chivato mientras carga. Después escribe un aviso nuevo y envíalo, y por último busca «bache». En cada caso, fíjate en state, location y formData. Termina con «Inicio».",
  "urlInicial": "/zonas/casco"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un enlace: loading",
      "texto": "state pasa a loading y location es la dirección de destino (/zonas/arrabal) mientras se ejecutan sus loader. formMethod, formAction y formData siguen en undefined: nadie ha enviado nada."
    },
    {
      "titulo": "Un Form con method=\"post\": submitting",
      "texto": "Mientras trabaja la action, state es submitting, formMethod es POST, formAction y location son la dirección de la ruta que recibe el envío (/zonas/arrabal) y formData lleva los campos del formulario."
    },
    {
      "titulo": "Después de la action: loading, con el envío todavía dentro",
      "texto": "Cuando la action responde, el router recarga los loader de la página. Mientras tanto state vuelve a loading, pero formMethod, formAction y formData siguen con lo que se envió. Solo al terminar la recarga pasa a idle."
    },
    {
      "titulo": "Un Form con method=\"get\": nunca submitting",
      "texto": "Una búsqueda no ejecuta ninguna action: es una navegación a /zonas/arrabal?q=bache. state es loading, location lleva la búsqueda, formMethod es GET y formData tiene el campo q."
    },
    {
      "titulo": "Una ruta sin loader: no hay espera",
      "texto": "Inicio no tiene loader, así que no hay nada que esperar: la navegación termina en el acto y el chivato no llega a pasar por loading."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Envías «Pintada en el frontón» con el <Form method=\"post\"> de El Arrabal.\n// La action ya ha respondido 201 y el router está recargando\n// los avisos de la zona. En este momento:\nconst navigation = useNavigation()\nnavigation.state // ?\nnavigation.formData?.get('texto') // ?",
  "opciones": [
    "'idle' y undefined: la action ya ha terminado",
    "'submitting' y 'Pintada en el frontón', hasta que termine también la recarga",
    "'loading' y 'Pintada en el frontón': el envío sigue ahí mientras se recargan los datos",
    "'loading' y undefined, como al pulsar un enlace"
  ],
  "correcta": 2,
  "explicacion": "Lo has visto en el chivato: cuando la action responde, state pasa de submitting a loading, pero formMethod, formAction y formData no se vacían hasta que terminan los loader y state vuelve a idle. Por eso un «Guardando…» que mire formMethod dura hasta que el aviso está en la lista, y uno que mire state === 'submitting' se apaga antes de tiempo."
}
```

Por eso el aviso de la maquetación de la lección 3, que solo mira `state`, pasa de «Enviando…» a «Cargando…» en cuanto responde la `action`, aunque nadie haya pulsado ningún enlace: es la recarga de los datos, o la redirección, que sigue al envío.

En TSX, lo que devuelve `useNavigation()` es una **unión discriminada por `state`**: con `'idle'`, `location` y `formData` son `undefined`; en cuanto compruebas que `state` no es `'idle'`, TypeScript sabe que `location` existe. Con `formData` no basta ni eso: hasta en `'submitting'` puede ser `undefined`, porque un envío con JSON no lleva `FormData`. Si lo lees sin `?.`, el panel de tipos te lo dice:

```text
'navigation.formData' is possibly 'undefined'.
```

Es decir: «`navigation.formData` puede ser `undefined`». Es el mismo mensaje que da `tsc` 6.0.3 con los tipos de React Router 8.5.0.

## Un indicador de carga global

**El sitio del indicador global es la maquetación de la ruta raíz**: se ve en todas las páginas y `useNavigation` le cuenta cualquier navegación de la app. Con lo que acabas de ver, puede decir algo más útil que «Cargando…»: qué se está cargando, o que se está guardando.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { NavLink, Outlet, useNavigation } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n\n  let mensaje = ''\n  if (navigation.state !== 'idle') {\n    // Aquí TypeScript ya sabe que navigation.location no es undefined\n    const destino = ZONAS[navigation.location.pathname.split('/')[2]]\n    if (navigation.formMethod === 'GET') mensaje = 'Buscando…'\n    else if (navigation.formMethod) mensaje = 'Guardando el aviso…'\n    else mensaje = `Cargando ${destino ?? 'la página'}…`\n  }\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          <NavLink to=\"/\" end>\n            Inicio\n          </NavLink>\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {({ isPending }) => (\n                <>\n                  {nombre}\n                  {isPending && <span className=\"girando\" aria-hidden=\"true\" />}\n                </>\n              )}\n            </NavLink>\n          ))}\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const navigation = useNavigation()",
      "nota": "Una sola llamada, en la maquetación. Cubre las navegaciones de toda la app: enlaces, formularios y navigate()."
    },
    {
      "fragmento": "if (navigation.state !== 'idle') {",
      "nota": "Equivale a Boolean(navigation.location), que es lo que usa la guía oficial: location solo tiene valor mientras hay una navegación en marcha."
    },
    {
      "fragmento": "const destino = ZONAS[navigation.location.pathname.split('/')[2]]",
      "nota": "navigation.location dice adónde se va, así que el aviso puede decir qué se carga. Dentro del if, TypeScript ya sabe que location existe; fuera, daría «'navigation.location' is possibly 'undefined'.»."
    },
    {
      "fragmento": "if (navigation.formMethod === 'GET') mensaje = 'Buscando…'",
      "nota": "Las búsquedas con <Form method=\"get\"> también llevan formMethod, pero GET. Por eso se miran antes que los envíos."
    },
    {
      "fragmento": "else if (navigation.formMethod) mensaje = 'Guardando el aviso…'",
      "nota": "Un envío en sus dos fases: mientras trabaja la action y mientras se recargan los datos, porque formMethod no se vacía hasta el final."
    },
    {
      "fragmento": "<p role=\"status\" className=\"indicador\">",
      "nota": "Una región que un lector de pantalla anuncia sin mover el foco. Está siempre en el DOM y solo cambia su texto: la región tiene que existir antes de que cambie su contenido (lección 37 de React)."
    },
    {
      "fragmento": "<main aria-busy={navigation.state !== 'idle'}>",
      "nota": "La página de antes se queda en pantalla mientras llega la siguiente. aria-busy la marca como ocupada, y el CSS la atenúa."
    },
    {
      "fragmento": "{({ isPending }) => (",
      "nota": "Cada enlace de zona sabe si es al que se está yendo. Lo ves en la sección siguiente."
    }
  ]
}
```

**Que no parpadee.** Si la zona llega en 100 ms, atenuar la página y desatenuarla enseguida molesta más de lo que ayuda. Basta con un retraso en la transición de entrada, y ninguno en la de salida:

```css
main {
  transition: opacity 0s;
}

main[aria-busy='true'] {
  opacity: 0.5;
  transition: opacity 0.2s 0.3s;
}
```

Al cambiar a `aria-busy="true"`, el navegador usa la transición de la regla nueva: espera 300 ms y tarda 200 en atenuar. Al volver a `false` usa la de `main`, sin retraso. Medido en Chromium con una zona que tardaba un segundo: la opacidad siguió en 1 durante los primeros 300 ms, llegó a 0,5 hacia los 550 ms y volvió a 1 en cuanto llegaron los datos. Está en el `estilos.css` de todos los bloques de la lección.

## `NavLink` con `isPending`: el enlace que sabe adónde vas

Desde la lección 76 de React sabes que un `NavLink` lleva la clase `active` cuando su destino coincide con la URL. En el modo datos tiene otra: **`pending`, mientras la navegación en marcha va a su destino**. Además, `className`, `style` y `children` aceptan una función que recibe `isActive` e `isPending`, que es lo que usa la maquetación para pintar el círculo que gira:

```tsx
<NavLink to={`/zonas/${id}`}>
  {({ isPending }) => (
    <>
      {nombre}
      {isPending && <span className="girando" aria-hidden="true" />}
    </>
  )}
</NavLink>
```

El círculo lleva `aria-hidden`: un lector de pantalla ya oye «Cargando El Arrabal…» en el párrafo de estado, y así el nombre del enlace no cambia. Pruébalo todo junto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useNavigation } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n\n  let mensaje = ''\n  if (navigation.state !== 'idle') {\n    // Aquí TypeScript ya sabe que navigation.location no es undefined\n    const destino = ZONAS[navigation.location.pathname.split('/')[2]]\n    if (navigation.formMethod === 'GET') mensaje = 'Buscando…'\n    else if (navigation.formMethod) mensaje = 'Guardando el aviso…'\n    else mensaje = `Cargando ${destino ?? 'la página'}…`\n  }\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          <NavLink to=\"/\" end>\n            Inicio\n          </NavLink>\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {({ isPending }) => (\n                <>\n                  {nombre}\n                  {isPending && <span className=\"girando\" aria-hidden=\"true\" />}\n                </>\n              )}\n            </NavLink>\n          ))}\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { Form, useActionData, useLoaderData, useNavigation } from 'react-router'\nimport type { cargarZona, crearAviso } from './datos'\n\nexport default function Zona() {\n  const { nombre, q, avisos } = useLoaderData<typeof cargarZona>()\n  const resultado = useActionData<typeof crearAviso>()\n  const navigation = useNavigation()\n  // POST durante el envío y también durante la recarga de datos que lo sigue\n  const enviando = navigation.formMethod === 'POST'\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <Form method=\"get\">\n        <label>\n          Buscar <input name=\"q\" defaultValue={q} />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>\n            {aviso.texto} <span className=\"estado\">{aviso.estado}</span>\n          </li>\n        ))}\n      </ul>\n      <Form method=\"post\">\n        <label>\n          Aviso nuevo <input name=\"texto\" />\n        </label>\n        <button disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar aviso'}</button>\n        {resultado?.error && <p role=\"alert\">{resultado.error}</p>}\n      </Form>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "Maquetacion.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 1500
  },
  "titulo": "La maquetación de la brigada, con su indicador",
  "consigna": "Cambia de zona y mira el enlace que gira, el párrafo de estado y la página, que se atenúa a los 300 ms. Después envía un aviso nuevo: ¿qué enlace gira ahora? Baja la latencia a 100 ms y vuelve a cambiar de zona: la página ya no parpadea.",
  "urlInicial": "/zonas/casco"
}
```

Al enviar el aviso habrás visto girar el enlace de **la zona en la que ya estás**. No es un fallo: `NavLink` compara su destino con `navigation.location`, y durante un envío esa es la dirección de la ruta que lo recibe, `/zonas/arrabal`. Lo mismo pasa al buscar, porque solo compara la ruta y no la búsqueda (`?q=`). Mientras tanto el enlace lleva las dos clases a la vez, `active pending`. Si no quieres que gire el de la página actual, pinta el círculo con `isPending && !isActive`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "<nav aria-label=\"Zonas\">\n  <NavLink to=\"/zonas\">Todas</NavLink>\n  <NavLink to=\"/zonas/casco\">Casco antiguo</NavLink>\n  <NavLink to=\"/zonas/arrabal\">El Arrabal</NavLink>\n</nav>\n\n// Estás en /zonas/casco y pulsas «El Arrabal».\n// Su loader tarda un segundo. ¿Qué clases llevan\n// los tres enlaces durante ese segundo?",
  "opciones": [
    "Casco antiguo, active; El Arrabal, pending; Todas, nada",
    "Todas, active y pending; Casco antiguo, active; El Arrabal, pending",
    "El Arrabal, active y pending; los otros dos, nada",
    "Todas y El Arrabal, active; Casco antiguo, nada"
  ],
  "correcta": 1,
  "explicacion": "Casco antiguo sigue active hasta que llegan los datos: la URL todavía no ha cambiado. El Arrabal es pending. Y Todas, sin end, encaja con cualquier dirección que empiece por /zonas/: es active por /zonas/casco y pending por /zonas/arrabal (comprobado). Con end en Todas, no sería ni lo uno ni lo otro."
}
```

En TSX, la función de `children`, `className` o `style` recibe un `NavLinkRenderProps` con `isActive`, `isPending` e `isTransitioning`. Este último, y la clase `transitioning`, están desaconsejados desde la 8.5 junto con el resto de APIs `viewTransition` del router: lo verás en la lección 12.

## La interfaz optimista se lee de `fetcher.formData`

Marcar un aviso como resuelto son dos viajes al servidor: el `PATCH` de la `action` y, después, la recarga de los `loader` de la página. Con 1,5 segundos de latencia, tres segundos con el aviso en «Pendiente» después de pulsar. Pero el resultado se sabe desde el principio: si pulsas «Marcar resuelto», va a quedar resuelto.

Mientras un fetcher envía, **`fetcher.formData` tiene lo que se está enviando**. Basta con pintar ese valor en lugar del que dice el servidor:

```tsx
const estado = fetcher.formData ? fetcher.formData.get('estado') : aviso.estado
```

**No hay estado propio ni nada que deshacer.** El valor optimista no se guarda en ningún sitio: se calcula en cada render. Cuando el envío termina, `fetcher.formData` vuelve a `undefined` y la fila pinta otra vez `aviso.estado`, que para entonces ya dice lo que diga el servidor.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useFetcher } from 'react-router'\nimport type { Aviso, cambiarEstado } from './datos'\n\nexport default function FilaAviso({ aviso }: { aviso: Aviso }) {\n  const fetcher = useFetcher<typeof cambiarEstado>()\n  // Mientras el envío está en marcha, lo que se ha pedido; si no, lo que dice el servidor\n  const estado = fetcher.formData ? fetcher.formData.get('estado') : aviso.estado\n  const resuelto = estado === 'resuelto'\n  const accion = resuelto ? 'Marcar pendiente' : 'Marcar resuelto'\n\n  return (\n    <li className={resuelto ? 'resuelto' : undefined}>\n      {aviso.texto}\n      <span className=\"estado\">\n        {resuelto ? 'Resuelto' : 'Pendiente'}\n        {fetcher.state !== 'idle' && ' · guardando'}\n      </span>\n      <fetcher.Form method=\"post\" action={`/avisos/${aviso.id}`}>\n        <button name=\"estado\" value={resuelto ? 'pendiente' : 'resuelto'} aria-label={`${accion}: ${aviso.texto}`}>\n          {accion}\n        </button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const fetcher = useFetcher<typeof cambiarEstado>()",
      "nota": "Un fetcher por fila: cada aviso tiene su propio envío y su propio estado (lección 5). Con el genérico, fetcher.data sabe lo que devuelve la action."
    },
    {
      "fragmento": "const estado = fetcher.formData ? fetcher.formData.get('estado') : aviso.estado",
      "nota": "La interfaz optimista entera. Mientras dura el envío, lo que se pidió; si no, lo que trajo el loader."
    },
    {
      "fragmento": "const resuelto = estado === 'resuelto'",
      "nota": "get devuelve FormDataEntryValue | null (un texto, un File o null). Se compara con un texto: 'resuelto'."
    },
    {
      "fragmento": "{fetcher.state !== 'idle' && ' · guardando'}",
      "nota": "Optimista no quiere decir callado. La marca dice que el cambio aún no está confirmado, durante el envío y durante la recarga que lo sigue."
    },
    {
      "fragmento": "value={resuelto ? 'pendiente' : 'resuelto'}",
      "nota": "El botón envía lo contrario de lo que se ve. Como lo que se ve ya es el valor optimista, dos pulsaciones seguidas envían resuelto y después pendiente."
    },
    {
      "fragmento": "{fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}",
      "nota": "Si la action devuelve un error, fetcher.data lo trae: { error: string } | { error: null } | undefined, según el panel de tipos."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "FilaAviso.tsx",
      "codigo": "import { useFetcher } from 'react-router'\nimport type { Aviso, cambiarEstado } from './datos'\n\nexport default function FilaAviso({ aviso }: { aviso: Aviso }) {\n  const fetcher = useFetcher<typeof cambiarEstado>()\n  // Mientras el envío está en marcha, lo que se ha pedido; si no, lo que dice el servidor\n  const estado = fetcher.formData ? fetcher.formData.get('estado') : aviso.estado\n  const resuelto = estado === 'resuelto'\n  const accion = resuelto ? 'Marcar pendiente' : 'Marcar resuelto'\n\n  return (\n    <li className={resuelto ? 'resuelto' : undefined}>\n      {aviso.texto}\n      <span className=\"estado\">\n        {resuelto ? 'Resuelto' : 'Pendiente'}\n        {fetcher.state !== 'idle' && ' · guardando'}\n      </span>\n      <fetcher.Form method=\"post\" action={`/avisos/${aviso.id}`}>\n        <button name=\"estado\" value={resuelto ? 'pendiente' : 'resuelto'} aria-label={`${accion}: ${aviso.texto}`}>\n          {accion}\n        </button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { Form, useActionData, useLoaderData, useNavigation } from 'react-router'\nimport type { cargarZona, crearAviso } from './datos'\nimport FilaAviso from './FilaAviso'\n\nexport default function Zona() {\n  const { nombre, avisos } = useLoaderData<typeof cargarZona>()\n  const resultado = useActionData<typeof crearAviso>()\n  const navigation = useNavigation()\n  // El texto del aviso que se está enviando con el Form de abajo, si lo hay\n  const nuevo = navigation.formData?.get('texto')\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <ul>\n        {avisos.map((aviso) => (\n          <FilaAviso key={aviso.id} aviso={aviso} />\n        ))}\n        {typeof nuevo === 'string' && nuevo.trim() !== '' && (\n          <li className=\"enviando\">\n            {nuevo} <span className=\"estado\">Enviando…</span>\n          </li>\n        )}\n      </ul>\n      <Form method=\"post\">\n        <label>\n          Aviso nuevo <input name=\"texto\" />\n        </label>\n        <button disabled={nuevo != null}>Enviar aviso</button>\n        {resultado?.error && <p role=\"alert\">{resultado.error}</p>}\n      </Form>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useNavigation } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n\n  let mensaje = ''\n  if (navigation.state !== 'idle') {\n    // Aquí TypeScript ya sabe que navigation.location no es undefined\n    const destino = ZONAS[navigation.location.pathname.split('/')[2]]\n    if (navigation.formMethod === 'GET') mensaje = 'Buscando…'\n    else if (navigation.formMethod) mensaje = 'Guardando el aviso…'\n    else mensaje = `Cargando ${destino ?? 'la página'}…`\n  }\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          <NavLink to=\"/\" end>\n            Inicio\n          </NavLink>\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {({ isPending }) => (\n                <>\n                  {nombre}\n                  {isPending && <span className=\"girando\" aria-hidden=\"true\" />}\n                </>\n              )}\n            </NavLink>\n          ))}\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "FilaAviso.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 1500
  },
  "titulo": "Resuelto al momento, y de vuelta si falla",
  "consigna": "Marca la farola como resuelta: cambia en el acto, con « · guardando» hasta que el servidor confirma. Después pulsa «Fallar la siguiente petición» en el panel de red y marca la pintada: vuelve sola a «Pendiente» y sale el error. Prueba también a enviar un aviso nuevo, con fallo y sin él. Mira el párrafo de estado de la cabecera mientras tanto.",
  "urlInicial": "/zonas/casco"
}
```

Esto es lo que pasa, con 1,5 segundos de latencia. Los estados del fetcher salen de un chivato como el de antes, puesto en la fila:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "items": [
    {
      "fecha": "0 s",
      "titulo": "Pulsas «Marcar resuelto»",
      "texto": "fetcher.state pasa a submitting y fetcher.formData guarda estado=resuelto. La fila ya dice «Resuelto · guardando». Sale el PATCH."
    },
    {
      "fecha": "1,5 s",
      "titulo": "El PATCH responde 200",
      "texto": "La action devuelve { error: null } y el router recarga los loader de la página. fetcher.state es loading y fetcher.data ya trae lo que devolvió la action, pero fetcher.formData sigue ahí: la fila no cambia."
    },
    {
      "fecha": "3 s",
      "titulo": "Llega la lista recargada",
      "texto": "fetcher.state vuelve a idle y fetcher.formData a undefined en el mismo render en el que aviso.estado ya vale resuelto. La fila sigue igual: no hay parpadeo."
    },
    {
      "fecha": "1,5 s, si falla",
      "titulo": "El PATCH responde 500",
      "texto": "La action devuelve el error con estado 500 y el router no recarga nada (lección 4). El fetcher vuelve a idle, formData a undefined y la fila pinta otra vez aviso.estado, que sigue en pendiente. fetcher.data trae el mensaje."
    }
  ]
}
```

**El error se devuelve, no se lanza.** La `action` de la fila termina con `return data({ error: '…' }, { status: 500 })`. Con un `throw`, el fallo de un solo botón se llevaría la zona entera por delante: lo verás en los errores típicos.

Fíjate también en la cabecera: **no ha dicho nada mientras se guardaba la fila**. `useNavigation` solo sabe de navegaciones, y un fetcher no navega. Para que un indicador global cuente también los fetchers está `useFetchers()`, de la lección 5: lo usarás en el ejercicio 2.

### Lo mismo con un `<Form>` que navega: `navigation.formData`

El aviso nuevo no va con un fetcher sino con el `<Form method="post">` de la zona, que es una navegación. Su envío está en `navigation.formData`, y `Zona.tsx` lo pinta al final de la lista, atenuado y con «Enviando…»:

```tsx
const nuevo = navigation.formData?.get('texto')
// …
{typeof nuevo === 'string' && nuevo.trim() !== '' && (
  <li className="enviando">
    {nuevo} <span className="estado">Enviando…</span>
  </li>
)}
```

Funciona por lo mismo que la fila: `navigation.formData` dura el envío y la recarga, así que la fila provisional desaparece en el mismo render en el que aparece la de verdad. Comprobado: en ningún momento salen las dos. Y si la `action` devuelve el error 500, la provisional se va y `useActionData` trae el mensaje. Si en la página hubiera una búsqueda, como la del chivato, su `navigation.formData` no tendría campo `texto`: `get` devolvería `null` y no se pintaría nada.

## Frente a `useOptimistic`

En la lección 60 de React adelantaste un resultado con `useOptimistic`: le das el valor real, pones el optimista dentro de una acción o una transición y React lo descarta cuando esta termina. La idea es la misma que la de `fetcher.formData`, con una diferencia: **con el router, el valor optimista ya lo tienes**, porque el router guarda lo que se está enviando. No hay nada que poner ni que descartar.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro formas de adelantar lo que va a pasar",
  "roles": [
    {
      "etiqueta": "fetcher.formData",
      "rol": "Un envío que no navega",
      "descripcion": "Lo que va en una fila: marcar, puntuar, guardar en favoritos. Dura el envío y la recarga que lo sigue."
    },
    {
      "etiqueta": "navigation.formData",
      "rol": "Un Form que navega",
      "descripcion": "El aviso nuevo de la lista, mientras se envía y se recargan los datos."
    },
    {
      "etiqueta": "navigation.location",
      "rol": "Una navegación",
      "descripcion": "Adónde se va: el nombre de la zona en el indicador o, en el ejercicio 3, un desplegable que no se echa atrás."
    },
    {
      "etiqueta": "useOptimistic",
      "rol": "Lo que no pasa por el router",
      "descripcion": "Un form action de React (lecciones 57 a 60) o una petición que haces tú: pones el valor y React lo descarta al acabar la transición."
    }
  ]
}
```

Donde sí podrías echar mano de `useOptimistic` es en algo que no es un envío. La brigada quiere, para el móvil, un desplegable «Ir a la zona». Lo natural es que su valor salga de la URL y que, al cambiarlo, navegue:

```tsx
const zonaActual = useMatch('/zonas/:zona')?.params.zona ?? ''
// …
<select value={zonaActual} onChange={(evento) => navigate(`/zonas/${evento.target.value}`)}>
```

Pero la URL no cambia hasta que llegan los datos. Comprobado: eliges «La Estación» y el desplegable **vuelve a «Casco antiguo»** durante todo lo que tarda la zona, porque es un campo controlado y su valor sigue siendo la zona actual (lección 22 de React). Con `useOptimistic` se arregla: el valor optimista se pone dentro de una transición que dura toda la navegación, porque se espera la promesa que devuelve `navigate`:

```tsx
const [zonaElegida, setZonaElegida] = useOptimistic(zonaActual)

function irAZona(zona: string) {
  startTransition(async () => {
    setZonaElegida(zona)
    await navigate(`/zonas/${zona}`)
  })
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Con este irAZona, eliges «La Estación» en el desplegable.\n// RouterProvider no lleva ninguna opción y el loader tarda un segundo.\n// La maquetación tiene el «Cargando…» de useNavigation\n// y los enlaces con isPending.\n<RouterProvider router={router} />\n\n// ¿Qué se ve durante ese segundo?",
  "opciones": [
    "El desplegable en La Estación, «Cargando…» y el enlace de La Estación girando",
    "El desplegable en La Estación, pero ni «Cargando…» ni ningún enlace girando",
    "El desplegable vuelve a Casco antiguo hasta que llegan los datos",
    "Nada cambia: la transición retiene también el valor optimista"
  ],
  "correcta": 1,
  "explicacion": "El valor optimista sale en el acto. Pero el router actualiza su estado dentro de startTransition y, como la navegación empieza dentro de tu transición, esas actualizaciones se suman a ella y no se pintan hasta que acaba. Comprobado en la vista previa y en Chromium con un proyecto de Vite: useNavigation siguió en idle todo el segundo. Con un enlace normal, el indicador sí sale."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { startTransition, useOptimistic } from 'react'\nimport { NavLink, Outlet, useMatch, useNavigate, useNavigation } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n  const navigate = useNavigate()\n  const zonaActual = useMatch('/zonas/:zona')?.params.zona ?? ''\n  // El desplegable enseña al momento la zona elegida, aunque sus datos no hayan llegado\n  const [zonaElegida, setZonaElegida] = useOptimistic(zonaActual)\n\n  function irAZona(zona: string) {\n    startTransition(async () => {\n      setZonaElegida(zona)\n      await navigate(`/zonas/${zona}`)\n    })\n  }\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {({ isPending }) => (\n                <>\n                  {nombre}\n                  {isPending && <span className=\"girando\" aria-hidden=\"true\" />}\n                </>\n              )}\n            </NavLink>\n          ))}\n        </nav>\n        <label>\n          Ir a la zona{' '}\n          <select value={zonaElegida} onChange={(evento) => irAZona(evento.target.value)}>\n            <option value=\"\" disabled>\n              Elige una\n            </option>\n            {Object.entries(ZONAS).map(([id, nombre]) => (\n              <option key={id} value={id}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <p role=\"status\" className=\"indicador\">\n          {navigation.state === 'loading' ? 'Cargando…' : ''}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  // Prueba a escribir useTransitions como prop de RouterProvider\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { Form, useActionData, useLoaderData, useNavigation } from 'react-router'\nimport type { cargarZona, crearAviso } from './datos'\n\nexport default function Zona() {\n  const { nombre, q, avisos } = useLoaderData<typeof cargarZona>()\n  const resultado = useActionData<typeof crearAviso>()\n  const navigation = useNavigation()\n  // En esta página solo hay un formulario POST: si se envía algo, es este\n  const enviando = navigation.state === 'submitting'\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <Form method=\"get\">\n        <label>\n          Buscar <input name=\"q\" defaultValue={q} />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>\n            {aviso.texto} <span className=\"estado\">{aviso.estado}</span>\n          </li>\n        ))}\n      </ul>\n      <Form method=\"post\">\n        <label>\n          Aviso nuevo <input name=\"texto\" />\n        </label>\n        <button disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar aviso'}</button>\n        {resultado?.error && <p role=\"alert\">{resultado.error}</p>}\n      </Form>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "Maquetacion.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 1500
  },
  "titulo": "useOptimistic y el router, sin y con useTransitions",
  "consigna": "Elige otra zona en el desplegable: cambia al momento, pero el párrafo de estado no dice «Cargando…» y ningún enlace gira. Pulsa un enlace para comparar. Después, en App.tsx, escribe useTransitions en el RouterProvider y vuelve a elegir con el desplegable.",
  "urlInicial": "/zonas/casco"
}
```

## La opción `useTransitions`

Lo que acabas de arreglar con una palabra viene de lejos. Según la página «React Transitions» de la documentación, el router mete sus actualizaciones de estado en `startTransition` desde la 6.13, con una bandera, y siempre desde la 7. Así una navegación no esconde con el `fallback` de `<Suspense>` lo que ya se veía (lección 51 de React). Pero con las transiciones asíncronas de React 19 eso se queda corto: **si la navegación empieza dentro de una transición tuya, el estado del router no se ve hasta que la transición acaba**. Es lo que has visto con el desplegable. `useTransitions` es la prop de `RouterProvider` (y de `HydratedRouter` y los routers declarativos) que lo decide:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Sin ponerla: lo que hay en la 8.5.0",
      "texto": "El router mete sus actualizaciones en startTransition, pero no las pasa por useOptimistic. Link y Form navegan sin transición. Si envuelves tú navigate(), submit() o fetcher.submit() en startTransition, useNavigation, isPending y fetcher.state no cambian hasta que acaba (comprobado con el desplegable y con un fetcher)."
    },
    {
      "titulo": "useTransitions (true)",
      "texto": "Link y Form navegan dentro de startTransition, con la promesa de la navegación. El estado de la navegación, de la revalidación, actionData y los fetchers se enseña durante tu transición a través de useOptimistic. location, loaderData y los errores, no: esos esperan al final. Necesita React 19."
    },
    {
      "titulo": "useTransitions={false}",
      "texto": "El router no usa startTransition para nada. Es la salida para las apps con useSyncExternalStore (lección 46 de React): sus actualizaciones no pueden ser transiciones y pueden enseñar el fallback de Suspense donde una transición no lo haría."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "¿Viene activada en la 8? No",
  "contenido": "La página React Transitions de la documentación dice todavía que el plan era activarla por defecto en la 8. En la 8.5.0 no lo está: el comentario de la prop en RouterProviderProps dice que, si no la pones, solo se envuelven las actualizaciones en startTransition; el código hace exactamente eso, y el changelog de la 8.0 no menciona ningún cambio. Llegó como unstable_useTransitions en la 7.10 y es estable desde la 7.15."
}
```

Con la opción activada, React Router solo envuelve por su cuenta `<Link>` y `<Form>`. Lo demás lo envuelves tú si quieres, y entonces **devuelve o espera la promesa**, para que la transición dure toda la navegación:

```tsx
// Con transición, sin hacer nada
<Link to="/zonas/arrabal">El Arrabal</Link>
<Form method="post">…</Form>

// Con transición, si la abres tú y devuelves o esperas la promesa
startTransition(() => navigate('/zonas/arrabal'))
startTransition(async () => {
  setZonaElegida('arrabal')
  await navigate('/zonas/arrabal')
})
startTransition(() => fetcher.submit(datos, { method: 'post', action: '/avisos/4' }))

// Sin transición
navigate('/zonas/arrabal')
fetcher.submit(datos, { method: 'post', action: '/avisos/4' })
```

¿La activas? En esta app, con enlaces, formularios y fetchers, no cambia nada: el indicador y los enlaces funcionaron igual con ella y sin ella (comprobado). **Actívala si envuelves navegaciones o envíos en tus transiciones**, por ejemplo para combinarlos con `useOptimistic`. Y si vas a usar `useOptimistic` solo para que algo no se eche atrás mientras se navega, mira antes si el router ya te lo da: el ejercicio 3 hace el desplegable sin él.

## Cuándo lo usarías de verdad

- **Un indicador global, siempre.** En la maquetación raíz, con `role="status"` y diciendo qué pasa. Es una línea de `useNavigation` y evita la duda de «¿he pulsado bien?».
- **Lo pendiente en su sitio**: el enlace que gira, el botón que dice «Enviando…» y se desactiva, la fila con « · guardando». El usuario mira ahí, no a la cabecera.
- **Lo optimista, cuando el resultado se sabe y el fallo es raro**: marcar como resuelto, un favorito, reordenar, un comentario. No cuando lo decide el servidor: una reserva que puede chocar con otra (el 409 del proyecto 7), un pago o un número de expediente que todavía no existe. Ahí, interfaz pendiente.
- **Optimista no quiere decir callado.** Marca lo que aún no está confirmado y, si falla, dilo donde ocurrió.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Para una interfaz optimista hace falta useOptimistic",
      "realidad": "Con el router, no: lo que se está enviando ya está en fetcher.formData o en navigation.formData. Lo pintas al renderizar y el router lo retira cuando acaba el envío."
    },
    {
      "mito": "Si el servidor falla, hay que deshacer el cambio optimista",
      "realidad": "No hay nada que deshacer, porque el valor optimista no se guardó en ningún sitio. Al acabar el envío, formData vuelve a undefined y se pinta lo del loader. Si la action devuelve el error con un 4xx o un 5xx, el loader no se recarga: es lo de antes."
    },
    {
      "mito": "useNavigation dice si se está guardando algo",
      "realidad": "Solo las navegaciones: un enlace, un Form o navigate(). Cada fetcher lleva su propio state y, para verlos todos, está useFetchers (lección 5)."
    },
    {
      "mito": "En React Router 8, useTransitions viene activada",
      "realidad": "En la 8.5.0, no, aunque la documentación diga que ese era el plan. Sin ella todo funciona mientras no metas tú las navegaciones en una transición."
    },
    {
      "mito": "Mientras carga la página siguiente, mejor esconder la actual",
      "realidad": "Al revés: deja la de antes, atenuada, y di qué se está cargando. Esconderla quita al usuario lo que estaba mirando sin darle nada a cambio."
    }
  ]
}
```

## Errores típicos

**Copiar el valor optimista en un `useState`.** Es lo primero que se le ocurre a cualquiera: un estado con el valor del servidor y un `onSubmit` que lo cambia. Mientras todo va bien, ni se nota. Prueba a hacerlo fallar:

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "FilaAviso.tsx",
      "codigo": "import { useState } from 'react'\nimport { useFetcher } from 'react-router'\nimport type { Aviso, cambiarEstado } from './datos'\n\nexport default function FilaAviso({ aviso }: { aviso: Aviso }) {\n  const fetcher = useFetcher<typeof cambiarEstado>()\n  // Una copia del estado del servidor, que se cambia a mano al pulsar\n  const [resuelto, setResuelto] = useState(aviso.estado === 'resuelto')\n  const accion = resuelto ? 'Marcar pendiente' : 'Marcar resuelto'\n\n  return (\n    <li className={resuelto ? 'resuelto' : undefined}>\n      {aviso.texto}\n      <span className=\"estado\">{resuelto ? 'Resuelto' : 'Pendiente'}</span>\n      <fetcher.Form method=\"post\" action={`/avisos/${aviso.id}`} onSubmit={() => setResuelto(!resuelto)}>\n        <button name=\"estado\" value={resuelto ? 'pendiente' : 'resuelto'} aria-label={`${accion}: ${aviso.texto}`}>\n          {accion}\n        </button>\n      </fetcher.Form>\n      {fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { cargarZona } from './datos'\nimport FilaAviso from './FilaAviso'\n\nexport default function Zona() {\n  const { nombre, avisos } = useLoaderData<typeof cargarZona>()\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <ul>\n        {avisos.map((aviso) => (\n          <FilaAviso key={aviso.id} aviso={aviso} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useNavigation } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n\n  let mensaje = ''\n  if (navigation.state !== 'idle') {\n    // Aquí TypeScript ya sabe que navigation.location no es undefined\n    const destino = ZONAS[navigation.location.pathname.split('/')[2]]\n    if (navigation.formMethod === 'GET') mensaje = 'Buscando…'\n    else if (navigation.formMethod) mensaje = 'Guardando el aviso…'\n    else mensaje = `Cargando ${destino ?? 'la página'}…`\n  }\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          <NavLink to=\"/\" end>\n            Inicio\n          </NavLink>\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {({ isPending }) => (\n                <>\n                  {nombre}\n                  {isPending && <span className=\"girando\" aria-hidden=\"true\" />}\n                </>\n              )}\n            </NavLink>\n          ))}\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "FilaAviso.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 800
  },
  "titulo": "La copia que se queda mintiendo",
  "consigna": "Pulsa «Fallar la siguiente petición» y marca la farola como resuelta. Cuando llegue el error, mira la fila: dice «Resuelto» y, a la vez, que no se pudo guardar.",
  "urlInicial": "/zonas/casco"
}
```

La fila dice «Resuelto», el botón ofrece «Marcar pendiente» y debajo pone que no se pudo guardar: **la pantalla miente**, porque nadie deshace la copia. Para arreglarlo habría que añadir código que la devuelva a su valor cuando falla, y otro que la actualice si el `loader` trae un estado nuevo, porque una copia no sigue a su origen (lección 24 de React). Con `fetcher.formData` no hay copia y no hace falta ninguno de los dos.

**Lanzar el error en la `action` de un fetcher.**

```tsx
if (!respuesta.ok) throw new Error('No se pudo guardar el cambio')
```

Un `throw` va al `ErrorBoundary` más cercano a la ruta en la que está pintado el fetcher. Comprobado con un `ErrorBoundary` en la ruta de la zona: el 500 de una sola fila sustituyó la lista entera y el formulario por la página de error de la zona; solo quedó la cabecera. Para un fallo que el usuario puede reintentar, devuélvelo con `data({ error }, { status: 500 })` y enséñalo en la fila. Los errores por ruta, a fondo, en la lección 8.

**Un «Enviando…» que se apaga antes de tiempo.** Con `navigation.state === 'submitting'`, el botón vuelve a «Enviar aviso» y se puede pulsar en cuanto la `action` responde, aunque el aviso todavía no esté en la lista: la recarga de los datos ya es `'loading'`. Comprobado: durante esa recarga, el botón estaba activo y la cabecera seguía diciendo «Guardando el aviso…». Mira `navigation.formMethod === 'POST'`, o el campo que te interese de `navigation.formData`, que duran las dos fases.

**Buscar en `useNavigation` el estado de un fetcher.** Un indicador hecho con `useNavigation` sigue en `'idle'` mientras un fetcher guarda, porque un fetcher no navega. Su estado está en `fetcher.state` y, desde otro componente, en `useFetchers()`.

**Comparar lo que trae `formData` con un booleano.** `formData.get()` devuelve un texto, un `File` o `null`, nunca `true`. En JavaScript, `fetcher.formData?.get('estado') === true` vale siempre `false` y la interfaz optimista no se ve nunca, sin ningún error. En TSX, el panel de tipos lo marca:

```text
This comparison appears to be unintentional because the types 'FormDataEntryValue | null | undefined' and 'boolean' have no overlap.
```

Es decir: «esta comparación parece un despiste, porque los tipos `FormDataEntryValue | null | undefined` y `boolean` no tienen nada en común». Compara con el texto que envía el botón: `'resuelto'`.

**No devolver la promesa dentro de `startTransition`.** Con `useTransitions` activado, este `irAZona` se queda corto:

```tsx
startTransition(() => {
  setZonaElegida(zona)
  navigate(`/zonas/${zona}`)
})
```

La transición termina en cuanto se llama a `navigate`, no cuando acaba la navegación, y React descarta el valor optimista en ese momento. Comprobado: el «Cargando…» salía, pero el desplegable volvía a la zona de antes hasta que llegaban los datos. Con `await navigate(…)` dentro de una función `async`, o devolviendo la promesa, dura toda la navegación.

## Ejercicios

Los tres son la app de la brigada. `datos.ts` y `App.tsx` no hay que tocarlos; el trabajo va donde dicen los comentarios numerados. El botón «Comprobar» arranca la app desde cero en cada comprobación, con la latencia del bloque.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  // 1. Con useNavigation(), escribe en el párrafo de estado:\n  //    · «Cargando El Arrabal…» (el nombre de la zona a la que se va) al pulsar un enlace\n  //    · «Guardando el aviso…» mientras se envía el aviso nuevo y se recargan los datos\n  const mensaje = ''\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            // 2. Mientras se cargan los datos de su zona, el enlace dice «El Arrabal · cargando»\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {nombre}\n            </NavLink>\n          ))}\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { Form, useActionData, useLoaderData } from 'react-router'\nimport type { cargarZona, crearAviso } from './datos'\n\nexport default function Zona() {\n  const { nombre, avisos } = useLoaderData<typeof cargarZona>()\n  const resultado = useActionData<typeof crearAviso>()\n  // 3. Mientras se envía el aviso (y se recargan los datos), el botón dice\n  //    «Enviando…» y está desactivado\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>\n            {aviso.texto} <span className=\"estado\">{aviso.estado}</span>\n          </li>\n        ))}\n      </ul>\n      <Form method=\"post\">\n        <label>\n          Aviso nuevo <input name=\"texto\" />\n        </label>\n        <button>Enviar aviso</button>\n        {resultado?.error && <p role=\"alert\">{resultado.error}</p>}\n      </Form>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "Maquetacion.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 800
  },
  "titulo": "Ejercicio 1: que se sepa que algo está pasando",
  "consigna": "La app no dice nada mientras espera. 1) En Maquetacion.tsx, el párrafo de estado dice «Cargando El Arrabal…», con el nombre de la zona de destino, al cambiar de zona, y «Guardando el aviso…» mientras se envía uno. 2) El enlace de la zona que se está cargando dice «El Arrabal · cargando». 3) En Zona.tsx, el botón dice «Enviando…» y se desactiva durante el envío y la recarga que lo sigue. La API tarda 0,8 s.",
  "urlInicial": "/zonas/casco",
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «El Arrabal», el párrafo de estado dice «Cargando El Arrabal…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "El Arrabal"
          }
        }
      ],
      "espera": {
        "texto": "Cargando El Arrabal…"
      }
    },
    {
      "descripcion": "Mientras se cargan sus avisos, el enlace dice «El Arrabal · cargando»",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "El Arrabal"
          }
        }
      ],
      "espera": {
        "rol": "link",
        "nombre": "El Arrabal · cargando"
      }
    },
    {
      "descripcion": "Cuando llega El Arrabal, el aviso de carga desaparece",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "El Arrabal"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "El Arrabal"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Cargando El Arrabal…"
        }
      }
    },
    {
      "descripcion": "Al enviar un aviso, el botón dice «Enviando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Aviso nuevo",
            "texto": "Pintada en el frontón"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar aviso"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Enviando…"
      }
    },
    {
      "descripcion": "Mientras se guarda, el párrafo de estado dice «Guardando el aviso…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Aviso nuevo",
            "texto": "Pintada en el frontón"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviar aviso"
          }
        }
      ],
      "espera": {
        "texto": "Guardando el aviso…"
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "FilaAviso.tsx",
      "codigo": "import { useFetcher } from 'react-router'\nimport type { Aviso, cambiarEstado } from './datos'\n\nexport default function FilaAviso({ aviso }: { aviso: Aviso }) {\n  const fetcher = useFetcher<typeof cambiarEstado>()\n  // 1. Mientras el envío está en marcha, pinta el estado que se ha pedido\n  //    (fetcher.formData), sin useState: la fila cambia en el acto\n  const resuelto = aviso.estado === 'resuelto'\n  const accion = resuelto ? 'Marcar pendiente' : 'Marcar resuelto'\n\n  return (\n    <li className={resuelto ? 'resuelto' : undefined}>\n      {aviso.texto}\n      <span className=\"estado\">\n        {resuelto ? 'Resuelto' : 'Pendiente'}\n        {fetcher.state !== 'idle' && ' · guardando'}\n      </span>\n      <fetcher.Form method=\"post\" action={`/avisos/${aviso.id}`}>\n        <button name=\"estado\" value={resuelto ? 'pendiente' : 'resuelto'} aria-label={`${accion}: ${aviso.texto}`}>\n          {accion}\n        </button>\n      </fetcher.Form>\n      {/* 2. Si la action devuelve un error, enséñalo aquí, en un párrafo con role=\"alert\" */}\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { cargarZona } from './datos'\nimport FilaAviso from './FilaAviso'\n\nexport default function Zona() {\n  const { nombre, avisos } = useLoaderData<typeof cargarZona>()\n  // 3. Que el contador también se adelante. Con useFetchers() (lección 5), busca para\n  //    cada aviso el envío cuyo formAction es `/avisos/${aviso.id}` y, si lo hay,\n  //    cuenta el estado que lleva su formData en vez de aviso.estado\n  const pendientes = avisos.filter((aviso) => aviso.estado === 'pendiente').length\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <p>Pendientes: {pendientes}</p>\n      <ul>\n        {avisos.map((aviso) => (\n          <FilaAviso key={aviso.id} aviso={aviso} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { NavLink, Outlet, useNavigation } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n\n  let mensaje = ''\n  if (navigation.state !== 'idle') {\n    // Aquí TypeScript ya sabe que navigation.location no es undefined\n    const destino = ZONAS[navigation.location.pathname.split('/')[2]]\n    if (navigation.formMethod === 'GET') mensaje = 'Buscando…'\n    else if (navigation.formMethod) mensaje = 'Guardando el aviso…'\n    else mensaje = `Cargando ${destino ?? 'la página'}…`\n  }\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          <NavLink to=\"/\" end>\n            Inicio\n          </NavLink>\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {({ isPending }) => (\n                <>\n                  {nombre}\n                  {isPending && <span className=\"girando\" aria-hidden=\"true\" />}\n                </>\n              )}\n            </NavLink>\n          ))}\n        </nav>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "FilaAviso.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "titulo": "Ejercicio 2: resuelto al momento, y el contador también",
  "consigna": "1) En FilaAviso.tsx, pinta el estado que se está enviando (fetcher.formData), sin useState. 2) Si la action devuelve un error, enséñalo en la fila, en un párrafo con role=\"alert\". 3) En Zona.tsx, que «Pendientes: N» también se adelante: con useFetchers() busca el envío en marcha a la ruta de cada aviso (su formAction) y cuenta el estado que lleva. Prueba con «Fallar la siguiente petición»: todo debe volver solo. La API tarda 1 s.",
  "urlInicial": "/zonas/casco",
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Marcar resuelto», la farola sale resuelta antes de que conteste el servidor",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar resuelto: Farola fundida en la calle Real"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Marcar pendiente: Farola fundida en la calle Real"
      }
    },
    {
      "descripcion": "El contador baja a «Pendientes: 1» en el acto",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar resuelto: Farola fundida en la calle Real"
          }
        }
      ],
      "espera": {
        "texto": "Pendientes: 1"
      }
    },
    {
      "descripcion": "Si el servidor falla, sale un aviso de error en la fila",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Casco antiguo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar resuelto: Farola fundida en la calle Real"
          }
        }
      ],
      "espera": {
        "rol": "alert"
      }
    },
    {
      "descripcion": "Tras el fallo, la farola vuelve sola a pendiente",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Casco antiguo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar resuelto: Farola fundida en la calle Real"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Marcar resuelto: Farola fundida en la calle Real"
      }
    },
    {
      "descripcion": "Tras el fallo, el contador vuelve a «Pendientes: 2»",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Casco antiguo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar resuelto: Farola fundida en la calle Real"
          }
        }
      ],
      "espera": {
        "texto": "Pendientes: 2"
      }
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
      "codigo": "import { NavLink, Outlet, useMatch, useNavigate, useNavigation } from 'react-router'\nimport { ZONAS } from './datos'\n\nexport default function Maquetacion() {\n  const navigation = useNavigation()\n  const navigate = useNavigate()\n  const zonaActual = useMatch('/zonas/:zona')?.params.zona ?? ''\n  // Mientras se cargan los avisos de la zona elegida, el desplegable vuelve a la de\n  // antes. Haz que enseñe la zona a la que se va, sin useState ni useOptimistic:\n  // useNavigation ya sabe adónde vas.\n  const zonaElegida = zonaActual\n\n  return (\n    <>\n      <header>\n        <h1>Avisos · Brigada municipal de Calamocha</h1>\n        <nav aria-label=\"Zonas\">\n          {Object.entries(ZONAS).map(([id, nombre]) => (\n            <NavLink key={id} to={`/zonas/${id}`}>\n              {nombre}\n            </NavLink>\n          ))}\n        </nav>\n        <label>\n          Ir a la zona{' '}\n          <select value={zonaElegida} onChange={(evento) => navigate(`/zonas/${evento.target.value}`)}>\n            <option value=\"\" disabled>\n              Elige una\n            </option>\n            {Object.entries(ZONAS).map(([id, nombre]) => (\n              <option key={id} value={id}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <p role=\"status\" className=\"indicador\">\n          {navigation.state === 'loading' ? 'Cargando…' : ''}\n        </p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Zona.tsx",
      "codigo": "import { Form, useActionData, useLoaderData, useNavigation } from 'react-router'\nimport type { cargarZona, crearAviso } from './datos'\n\nexport default function Zona() {\n  const { nombre, q, avisos } = useLoaderData<typeof cargarZona>()\n  const resultado = useActionData<typeof crearAviso>()\n  const navigation = useNavigation()\n  // POST durante el envío y también durante la recarga de datos que lo sigue\n  const enviando = navigation.formMethod === 'POST'\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <Form method=\"get\">\n        <label>\n          Buscar <input name=\"q\" defaultValue={q} />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>\n            {aviso.texto} <span className=\"estado\">{aviso.estado}</span>\n          </li>\n        ))}\n      </ul>\n      <Form method=\"post\">\n        <label>\n          Aviso nuevo <input name=\"texto\" />\n        </label>\n        <button disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar aviso'}</button>\n        {resultado?.error && <p role=\"alert\">{resultado.error}</p>}\n      </Form>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cambiarEstado, cargarZona, crearAviso } from './datos'\nimport Maquetacion from './Maquetacion'\nimport Zona from './Zona'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando los avisos…</p>,\n    children: [\n      { index: true, Component: () => <p className=\"nota\">Elige una zona en el menú.</p> },\n      { path: 'zonas/:zona', loader: cargarZona, action: crearAviso, Component: Zona },\n      { path: 'avisos/:id', action: cambiarEstado },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Aviso = {\n  id: number\n  zona: string\n  texto: string\n  estado: 'pendiente' | 'resuelto'\n}\n\nexport const ZONAS: Record<string, string> = {\n  casco: 'Casco antiguo',\n  arrabal: 'El Arrabal',\n  estacion: 'La Estación',\n}\n\n// Los avisos de una zona, filtrados con ?q= si se ha buscado algo\nexport async function cargarZona({ params, request }: LoaderFunctionArgs) {\n  const zona = params.zona ?? ''\n  if (!(zona in ZONAS)) throw data('Esa zona no existe', { status: 404 })\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  const respuesta = await fetch(`/api/avisos?q=${encodeURIComponent(q)}`, { signal: request.signal })\n  const avisos: Aviso[] = await respuesta.json()\n  return { zona, nombre: ZONAS[zona], q, avisos: avisos.filter((aviso) => aviso.zona === zona) }\n}\n\n// <Form method=\"post\"> de la zona: un aviso nuevo\nexport async function crearAviso({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const texto = String(formulario.get('texto') ?? '').trim()\n  if (texto === '') return data({ error: 'Escribe qué ha pasado.' }, { status: 400 })\n  const respuesta = await fetch('/api/avisos', {\n    method: 'POST',\n    body: JSON.stringify({ zona: params.zona, texto, estado: 'pendiente' }),\n  })\n  if (!respuesta.ok) return data({ error: 'No se pudo guardar el aviso.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta /avisos/:id, sin componente: la usan los fetchers de cada fila\nexport async function cambiarEstado({ params, request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const respuesta = await fetch(`/api/avisos/${params.id}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ estado: formulario.get('estado') }),\n  })\n  if (!respuesta.ok) {\n    return data({ error: 'No se pudo guardar el cambio. Inténtalo otra vez.' }, { status: 500 })\n  }\n  return { error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  border-bottom: 2px solid #0f766e;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  font-size: 1.2rem;\n  color: #0f766e;\n  margin: 0 0 0.5rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.5rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin-bottom: 0.5rem;\n}\n\nnav a {\n  color: #0f766e;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\nnav a.pending {\n  color: #b45309;\n}\n\n.girando {\n  display: inline-block;\n  width: 0.7em;\n  height: 0.7em;\n  margin-left: 0.3em;\n  border: 2px solid currentColor;\n  border-right-color: transparent;\n  border-radius: 50%;\n  animation: girar 0.8s linear infinite;\n}\n\n@keyframes girar {\n  to {\n    transform: rotate(360deg);\n  }\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0 0 0.5rem;\n  color: #b45309;\n  font-size: 0.9rem;\n}\n\n/* Atenuar solo si la espera dura más de 300 ms; al terminar, en el acto */\nmain {\n  transition: opacity 0s;\n}\n\nmain[aria-busy='true'] {\n  opacity: 0.5;\n  transition: opacity 0.2s 0.3s;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #99f6e4;\n  border-radius: 6px;\n}\n\nli form {\n  margin-left: auto;\n}\n\n.estado {\n  font-size: 0.85rem;\n  color: #92400e;\n}\n\n.resuelto .estado {\n  color: #047857;\n}\n\n.enviando {\n  opacity: 0.6;\n  font-style: italic;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin: 0.5rem 0;\n}\n\ninput,\nbutton,\nselect {\n  font: inherit;\n}\n\n[role='alert'] {\n  flex-basis: 100%;\n  margin: 0;\n  padding: 0.3rem 0.6rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.chivato {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.75rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}\n\n.chivato p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "Maquetacion.tsx",
  "mostrarConsola": false,
  "api": {
    "avisos": [
      {
        "id": 1,
        "zona": "casco",
        "texto": "Farola fundida en la calle Real",
        "estado": "pendiente"
      },
      {
        "id": 2,
        "zona": "casco",
        "texto": "Banco roto en la plaza de España",
        "estado": "resuelto"
      },
      {
        "id": 3,
        "zona": "casco",
        "texto": "Pintada en la pared del lavadero",
        "estado": "pendiente"
      },
      {
        "id": 4,
        "zona": "arrabal",
        "texto": "Bache en la avenida de Sagunto",
        "estado": "pendiente"
      },
      {
        "id": 5,
        "zona": "arrabal",
        "texto": "Papelera arrancada junto al frontón",
        "estado": "pendiente"
      },
      {
        "id": 6,
        "zona": "estacion",
        "texto": "Fuga de agua en la fuente de la Glorieta",
        "estado": "pendiente"
      },
      {
        "id": 7,
        "zona": "estacion",
        "texto": "Contenedor quemado en la calle de la Estación",
        "estado": "resuelto"
      }
    ]
  },
  "red": {
    "latencia": 2000
  },
  "titulo": "Ejercicio 3: el desplegable que no se echa atrás",
  "consigna": "Elige «La Estación» en el desplegable: vuelve a «Elige una» hasta que llegan los avisos. Arréglalo en Maquetacion.tsx sin useState ni useOptimistic: useNavigation ya sabe adónde vas. Si pulsas un enlace, el desplegable también tiene que cambiar en el acto. La API tarda 2 s.",
  "urlInicial": "/",
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al elegir «La Estación», el desplegable la enseña mientras se cargan sus avisos",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Ir a la zona",
            "opcion": "La Estación"
          }
        }
      ],
      "espera": {
        "etiqueta": "Ir a la zona",
        "valor": "estacion"
      }
    },
    {
      "descripcion": "Mientras tanto, el párrafo de estado dice «Cargando…»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Ir a la zona",
            "opcion": "La Estación"
          }
        }
      ],
      "espera": {
        "texto": "Cargando…"
      }
    },
    {
      "descripcion": "Al pulsar el enlace «El Arrabal», el desplegable pasa a El Arrabal en el acto",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "El Arrabal"
          }
        }
      ],
      "espera": {
        "etiqueta": "Ir a la zona",
        "valor": "arrabal"
      }
    }
  ]
}
```

En el 3, `useOptimistic` habría resuelto el desplegable, pero no el enlace: al pulsar «El Arrabal» nadie pone el valor optimista y el desplegable seguiría en la zona de antes hasta que llegaran los datos. `navigation.location` sirve para las dos cosas porque no depende de quién empezó la navegación.

### Retos para seguir practicando

1. **Un indicador que también vea los fetchers.** En la maquetación de la brigada, que el párrafo de estado diga «Guardando 2 cambios…» cuando haya fetchers en marcha, además de lo que ya dice para las navegaciones. Necesitas `useFetchers()` (lección 5). Comprueba con la latencia a 3 s y varias filas marcadas seguidas.
2. **Sin parpadeos.** Haz que el enlace de la zona en la que ya estás no gire al enviar un aviso ni al buscar, y que el texto del indicador espere 300 ms antes de aparecer, como la página atenuada. Prueba con la latencia a 100 ms y a 2 s.
3. **Reintentar sin volver a escribir.** Cuando el aviso nuevo falla, el texto tiene que quedarse en el campo; cuando se guarda, el campo se vacía. Piensa en qué momento sabes que se ha guardado (`useActionData`) y prueba con «Fallar la siguiente petición».
4. **El desplegable, a la manera de React.** Pasa el del ejercicio 3 a `useOptimistic` con `startTransition` y `useTransitions`, y compara con tu solución: ¿qué pasa al pulsar un enlace? ¿Y si quitas el `await` de `navigate`?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Pending UI",
      "descripcion": "La guía oficial: indicador global con useNavigation, NavLink con isPending, envíos pendientes e interfaz optimista con fetcher.formData. La página del modo datos remite a esta.",
      "url": "https://reactrouter.com/start/framework/pending-ui",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useNavigation",
      "descripcion": "La referencia del hook y del tipo Navigation, con sus tres estados.",
      "url": "https://reactrouter.com/api/hooks/useNavigation",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "NavLink",
      "descripcion": "Las clases active y pending, la prop end y las funciones de className, style y children.",
      "url": "https://reactrouter.com/api/components/NavLink",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "React Transitions",
      "descripcion": "Qué hace useTransitions con true y con false, y qué funciones envuelve cada una. Ojo: todavía dice que el plan era activarla por defecto en la 8.",
      "url": "https://reactrouter.com/explanation/react-transitions",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Using Fetchers",
      "descripcion": "Enviar con un fetcher, su estado pendiente y la interfaz optimista con fetcher.formData, paso a paso.",
      "url": "https://reactrouter.com/how-to/fetchers",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useOptimistic",
      "descripcion": "La pieza de React para adelantar resultados que no pasan por el router (lección 60).",
      "url": "https://react.dev/reference/react/useOptimistic",
      "etiqueta": "react.dev"
    }
  ]
}
```
