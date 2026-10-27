# Proyecto: reservas del Polideportivo Municipal de Monzón

- **Módulo:** Cargar y enviar datos
- **Slug:** `proyecto-reservas-del-polideportivo-municipal-de-monzon` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [Using Fetchers](https://reactrouter.com/how-to/fetchers) + [Revalidation Optimization](https://reactrouter.com/how-to/optimize-revalidation) + [Pending UI](https://reactrouter.com/start/framework/pending-ui) + [useFetchers](https://reactrouter.com/api/hooks/useFetchers) + [data](https://reactrouter.com/api/utils/data) — ver `contenido/react-router/TEMARIO.md` #7
- **Requiere:** Las lecciones 1 a 6 de esta ficha (y, con ellas, la 99 de React)

---

## Qué vas a construir

El **Polideportivo Municipal de Monzón**, en Huesca, alquila sus pistas por horas: dos de pádel y un frontón, en franjas de una hora entre las 18:00 y las 22:00. Hasta ahora las reservas se hacían por teléfono. Vas a construir la página donde los socios eligen día, ven qué franjas quedan libres, reservan y cancelan, sin recargar nada.

Es el proyecto que cierra el módulo 2, y usa todo lo que has visto en él:

- **El día en la URL** (`/reservas?dia=2026-11-05`), leído por un `loader` y elegido con un `<Form method="get">` (lección 2). Atrás y los enlaces compartidos funcionan solos.
- **Reservar con un fetcher** (lección 5), porque reservar no es ir a otra página.
- **Un conflicto, devuelto con su estado**: si otro socio se te adelanta, la `action` responde con `data(…, { status: 409 })` (lecciones 3 y 4).
- **La reserva, al momento**, leída de `fetcher.formData`, y retirada sola si el servidor falla (lección 6).
- **`shouldRevalidate`** en cada ruta para que una reserva recargue solo lo que cambia (lección 4), con el registro del router delante.
- **Cancelar varias reservas a la vez**, un fetcher por envío, con un indicador global hecho con `useFetchers` (lecciones 5 y 6).

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Seis pasos, todos en esta página",
  "contenido": "Cada paso es un bloque en vivo en TSX con los seis archivos en pestañas, la barra de direcciones, el registro del router y el panel de red debajo, y el botón «Comprobar». Cada paso arranca con la solución del anterior: si te atascas, sigue en el siguiente. Las comprobaciones usan la latencia del bloque y exigen que el panel de tipos no marque nada. Como en toda la ficha, createBrowserRouter usa aquí un historial en memoria; en tu proyecto usará la dirección del navegador."
}
```

Como en el proyecto 62 de React, no hay versión para tu ordenador: el servidor es la API simulada de la vista previa, y el botón que hace fallar una petición solo existe aquí.

## El polideportivo y su servidor

La API simulada tiene dos colecciones:

- **`pistas`**: Pádel 1 y Pádel 2, a 8 € la hora, y el Frontón, a 5 €. Nada de lo que hace esta página las cambia.
- **`reservas`**, una por franja ocupada:

```json
{ "id": 1, "pista": 1, "dia": "2026-11-04", "hora": "18:00", "socio": 112 }
```

Se reserva del miércoles 4 al viernes 6 de noviembre de 2026. Tú eres el **socio 112**: tienes tres reservas, una cada día, y el resto de franjas ocupadas son de otros socios. `GET /api/reservas` las devuelve todas, `POST /api/reservas` guarda una nueva y `DELETE /api/reservas/<id>` la borra. La API simulada no comprueba nada: aceptaría dos reservas de la misma pista a la misma hora. Que no pase es cosa de tu `action`.

Los datos viven en memoria: lo que reserves sigue ahí al pulsar Recargar en la barra, y «Reiniciar» lo devuelve todo al principio.

## Las piezas

Tres rutas con `loader`, una dentro de otra, y una cuarta solo con `action`:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas del polideportivo",
  "nodos": [
    {
      "nombre": "polideportivo",
      "nivel": 0,
      "etiqueta": "loader",
      "nota": "path / · las pistas y sus tarifas, en la cabecera"
    },
    {
      "nombre": "tus-reservas",
      "nivel": 1,
      "etiqueta": "loader",
      "nota": "sin path · la columna «Tus reservas», de todos los días"
    },
    {
      "nombre": "cuadrante",
      "nivel": 2,
      "etiqueta": "loader y action",
      "nota": "reservas?dia= · las franjas del día; su action reserva"
    },
    {
      "nombre": "reservas/:id",
      "nivel": 2,
      "etiqueta": "action",
      "nota": "sin componente · cancela una reserva"
    }
  ]
}
```

`tus-reservas` es una ruta de maquetación sin `path` (lección 77 de React): pinta la columna de tus reservas al lado del `<Outlet>` y tiene su propio `loader`. Así cada cosa que se ve tiene su ruta, y en el paso 5 cada ruta podrá decidir por su cuenta si se recarga.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué",
  "roles": [
    {
      "etiqueta": "datos.ts",
      "rol": "El servidor, visto desde el router",
      "descripcion": "Los tipos, los días y las franjas; los tres loader, las dos action y otroSocioReserva, que reserva por su cuenta para provocar un conflicto. Trabajas aquí en los pasos 1 y 3."
    },
    {
      "etiqueta": "App.tsx",
      "rol": "Las rutas",
      "descripcion": "El árbol de arriba con createBrowserRouter. En el paso 5 le añades un shouldRevalidate a cada ruta."
    },
    {
      "etiqueta": "Cuadrante.tsx",
      "rol": "El día y sus franjas",
      "descripcion": "El selector de día y una Franja por pista y hora, con su fetcher. Pasos 1 a 4."
    },
    {
      "etiqueta": "TusReservas.tsx y Maquetacion.tsx",
      "rol": "La columna y la cabecera",
      "descripcion": "Tus reservas, con sus botones de cancelar, y el indicador global. Paso 6."
    }
  ]
}
```

Debajo de cada parte verás un texto como «loader cuadrante · 1 vez». Es el truco de la lección 4: cada `loader` cuenta cuántas veces se ha ejecutado, para que lo veas sin abrir el registro y para que las comprobaciones lo puedan mirar. Al pulsar Recargar en la barra, los contadores vuelven a 1.

## Paso 1: el día, en la URL

El cuadrante enseña siempre el miércoles, elijas lo que elijas: su `loader` no lee la búsqueda y el selector no envía nada. Arréglalo como en la lección 2:

- **En `datos.ts`**, `cargarCuadrante` saca el día de `new URL(request.url).searchParams.get('dia')`. Si no viene, o no es uno de los días de `DIAS`, usa `PRIMER_DIA`: alguien puede escribir `?dia=2026-12-25` en la barra. Y pásale `request.signal` a `pedirReservas`, para que el router pueda cancelar la petición si cambias de día antes de que llegue.
- **En `Cuadrante.tsx`**, el `div` del selector pasa a ser un `<Form method="get">`. Sin `action`, envía a la ruta que lo pinta: `/reservas?dia=…`. El desplegable ya tiene `name="dia"`.
- **Que el desplegable siga a la URL**: si eliges el jueves y pulsas Atrás en la barra, tiene que volver al miércoles. Es la trampa de `defaultValue` de la lección 2, y se arregla con una `key`.

Fíjate en el tipo de `searchParams.get`: devuelve `string | null`. Si escribes `pedido in DIAS ? pedido : PRIMER_DIA` sin descartar antes el `null`, el panel de tipos te para:

```text
'pedido' is possibly 'null'.
```

Es decir: «`pedido` puede ser `null`». Y si lo usas como índice, `DIAS[pedido]`, el mensaje es otro: `Type 'null' cannot be used as an index type.` («el tipo `null` no se puede usar como índice»). Los dos salen de `tsc` 6.0.3 con este mismo código. Comprueba `pedido !== null` primero.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cancelar, cargarCuadrante, cargarPistas, cargarTusReservas, reservar } from './datos'\nimport Cuadrante from './Cuadrante'\nimport Maquetacion from './Maquetacion'\nimport TusReservas from './TusReservas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'polideportivo',\n    path: '/',\n    loader: cargarPistas,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando el polideportivo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">No se ha podido cargar. Pulsa Recargar en la barra.</p>,\n    children: [\n      { index: true, loader: () => redirect('/reservas') },\n      {\n        id: 'tus-reservas',\n        loader: cargarTusReservas,\n        Component: TusReservas,\n        children: [\n          {\n            id: 'cuadrante',\n            path: 'reservas',\n            loader: cargarCuadrante,\n            action: reservar,\n            Component: Cuadrante,\n          },\n          { path: 'reservas/:id', action: cancelar },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Pista = { id: number; nombre: string; tarifa: string }\nexport type Reserva = { id: number; pista: number; dia: string; hora: string; socio: number }\n\nexport const SOCIO = 112\nexport const HORAS = ['18:00', '19:00', '20:00', '21:00']\nexport const DIAS: Record<string, string> = {\n  '2026-11-04': 'Miércoles 4 de noviembre',\n  '2026-11-05': 'Jueves 5 de noviembre',\n  '2026-11-06': 'Viernes 6 de noviembre',\n}\nconst PRIMER_DIA = '2026-11-04'\n\n// Cuántas veces se ha ejecutado cada loader, para verlo en pantalla\nconst cargas = { polideportivo: 0, tuyas: 0, cuadrante: 0 }\nexport const veces = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`\n\nasync function pedirReservas(signal?: AbortSignal): Promise<Reserva[]> {\n  const respuesta = await fetch('/api/reservas', { signal })\n  if (!respuesta.ok) throw new Error('No se pudieron leer las reservas')\n  return respuesta.json()\n}\n\n// Ruta polideportivo: las pistas y sus tarifas\nexport async function cargarPistas({ request }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/pistas', { signal: request.signal })\n  const pistas: Pista[] = await respuesta.json()\n  return { pistas, veces: ++cargas.polideportivo }\n}\n\n// Ruta tus-reservas: las del socio 112, de todos los días\nexport async function cargarTusReservas({ request }: LoaderFunctionArgs) {\n  const reservas = await pedirReservas(request.signal)\n  const tuyas = reservas\n    .filter((reserva) => reserva.socio === SOCIO)\n    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))\n  return { tuyas, veces: ++cargas.tuyas }\n}\n\n// Ruta cuadrante: las reservas del día que dice ?dia=\nexport async function cargarCuadrante({ request }: LoaderFunctionArgs) {\n  // TODO (paso 1): el día sale de ?dia= en request.url. Si no viene,\n  // o no está en DIAS, PRIMER_DIA. Y pásale request.signal a pedirReservas.\n  const dia = PRIMER_DIA\n  const reservas = await pedirReservas()\n  return { dia, reservas: reservas.filter((reserva) => reserva.dia === dia), veces: ++cargas.cuadrante }\n}\n\n// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  // TODO (paso 3): antes de guardar, pide /api/reservas y comprueba que\n  // la franja sigue libre. Si no, devuelve el conflicto con un 409.\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta reservas/:id: cancelar una reserva\nexport async function cancelar({ params }: ActionFunctionArgs) {\n  const respuesta = await fetch(`/api/reservas/${params.id}`, { method: 'DELETE' })\n  if (!respuesta.ok) return data({ error: 'No se pudo cancelar.' }, { status: 500 })\n  return { error: null }\n}\n\n// Para provocar un conflicto: otro socio reserva sin pasar por tu router\nexport async function otroSocioReserva(dia: string) {\n  await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista: 3, dia, hora: '20:00', socio: 77 }),\n  })\n}\n"
    },
    {
      "nombre": "Cuadrante.tsx",
      "codigo": "import { useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, HORAS, SOCIO, veces } from './datos'\nimport type { Reserva, cargarCuadrante, cargarPistas } from './datos'\n\ntype PropsFranja = { hora: string; reserva?: Reserva }\n\nfunction Franja({ hora, reserva }: PropsFranja) {\n  let contenido = ' · Libre'\n  if (reserva) contenido = reserva.socio === SOCIO ? ' · Tuya' : ' · Ocupada'\n  return (\n    <li>\n      {hora}\n      {contenido}\n    </li>\n  )\n}\n\nexport default function Cuadrante() {\n  const { dia, reservas, veces: cargas } = useLoaderData<typeof cargarCuadrante>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  return (\n    <main>\n      <h2>{DIAS[dia]}</h2>\n      {/* TODO (paso 1): que esto sea un <Form method=\"get\">, y que el\n          desplegable enseñe el día de la URL también después de pulsar Atrás */}\n      <div className=\"elegir-dia\">\n        <label>\n          Día{' '}\n          <select name=\"dia\" defaultValue={dia}>\n            {Object.entries(DIAS).map(([valor, nombre]) => (\n              <option key={valor} value={valor}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver el día</button>\n      </div>\n      {pistas.map((pista) => (\n        <section key={pista.id} aria-labelledby={`pista-${pista.id}`}>\n          <h3 id={`pista-${pista.id}`}>{pista.nombre}</h3>\n          <ul>\n            {HORAS.map((hora) => (\n              <Franja\n                key={hora}\n                hora={hora}\n                reserva={reservas.find((r) => r.pista === pista.id && r.hora === hora)}\n              />\n            ))}\n          </ul>\n        </section>\n      ))}\n      <p className=\"contador\">loader cuadrante · {veces(cargas)}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TusReservas.tsx",
      "codigo": "import { Outlet, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, veces } from './datos'\nimport type { Reserva, cargarPistas, cargarTusReservas } from './datos'\n\nexport default function TusReservas() {\n  const { tuyas, veces: cargas } = useLoaderData<typeof cargarTusReservas>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n\n  // «Pádel 1 · miércoles 4 · 18:00»\n  function describir(reserva: Reserva) {\n    const pista = pistas.find((p) => p.id === reserva.pista)?.nombre ?? `Pista ${reserva.pista}`\n    const dia = DIAS[reserva.dia].split(' de ')[0].toLowerCase()\n    return `${pista} · ${dia} · ${reserva.hora}`\n  }\n\n  // TODO (paso 6): un botón «Cancelar» en cada reserva, con su propio\n  // fetcher, y «Cancelar todas» debajo de la lista\n\n  return (\n    <div className=\"cuerpo\">\n      <Outlet />\n      <aside aria-labelledby=\"titulo-tuyas\">\n        <h2 id=\"titulo-tuyas\">Tus reservas (socio 112)</h2>\n        {tuyas.length === 0 ? (\n          <p>No tienes reservas.</p>\n        ) : (\n          <ul>\n            {tuyas.map((reserva) => (\n              <li key={reserva.id}>{describir(reserva)}</li>\n            ))}\n          </ul>\n        )}\n        <p className=\"contador\">loader tus-reservas · {veces(cargas)}</p>\n      </aside>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { Outlet, useLoaderData, useNavigation } from 'react-router'\nimport { veces } from './datos'\nimport type { cargarPistas } from './datos'\n\nexport default function Maquetacion() {\n  const { pistas, veces: cargas } = useLoaderData<typeof cargarPistas>()\n  const navigation = useNavigation()\n\n  // TODO (paso 6): que diga también «Cancelando 3 reservas…» (o «1 reserva»)\n  // y «Reservando…» mientras haya fetchers en marcha\n  let mensaje = ''\n  if (navigation.state !== 'idle') mensaje = 'Cargando el día…'\n\n  return (\n    <div className=\"app\">\n      <header>\n        <h1>Polideportivo Municipal de Monzón</h1>\n        <p className=\"tarifas\">\n          {pistas.map((pista) => `${pista.nombre}: ${pista.tarifa}`).join(' · ')}\n        </p>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <Outlet />\n      <p className=\"contador\">loader polideportivo · {veces(cargas)}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1d2b2a;\n  background: #f4f7f5;\n}\n\n.app {\n  max-width: 56rem;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\nheader {\n  border-bottom: 3px solid #1f7a5c;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n  color: #1f5f49;\n}\n\n.tarifas {\n  margin: 0.25rem 0;\n  color: #4b5d59;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0.25rem 0 0.5rem;\n  font-weight: 600;\n  color: #9a5b00;\n}\n\n.cuerpo {\n  display: grid;\n  gap: 1.25rem;\n  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);\n}\n\n@media (max-width: 40rem) {\n  .cuerpo {\n    grid-template-columns: 1fr;\n  }\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh3 {\n  margin: 0.75rem 0 0.25rem;\n  font-size: 1rem;\n}\n\n.elegir-dia {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  padding: 0.3rem 0.5rem;\n  border-bottom: 1px solid #d9e3df;\n}\n\nli form {\n  margin-left: auto;\n}\n\nli p[role='alert'] {\n  flex-basis: 100%;\n  margin: 0.25rem 0 0;\n  color: #b3261e;\n}\n\nli.cancelando {\n  opacity: 0.55;\n}\n\naside {\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #fff;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);\n}\n\naside > button {\n  margin-top: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #1f7a5c;\n  border-radius: 0.35rem;\n  color: #1f5f49;\n  background: #fff;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: progress;\n}\n\n.contador {\n  margin: 0.75rem 0 0;\n  font: 0.8rem ui-monospace, monospace;\n  color: #6b7a76;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem;\n  border: 1px dashed #9a5b00;\n  border-radius: 0.5rem;\n  background: #fff8ec;\n}\n\n.simulador p {\n  margin: 0.4rem 0 0;\n}\n\n.nota {\n  padding: 1rem;\n  color: #4b5d59;\n}\n"
    }
  ],
  "archivoInicial": "datos.ts",
  "urlInicial": "/reservas?dia=2026-11-04",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "pistas": [
      {
        "id": 1,
        "nombre": "Pádel 1",
        "tarifa": "8 € la hora"
      },
      {
        "id": 2,
        "nombre": "Pádel 2",
        "tarifa": "8 € la hora"
      },
      {
        "id": 3,
        "nombre": "Frontón",
        "tarifa": "5 € la hora"
      }
    ],
    "reservas": [
      {
        "id": 1,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 112
      },
      {
        "id": 2,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "19:00",
        "socio": 87
      },
      {
        "id": 3,
        "pista": 2,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 4,
        "pista": 3,
        "dia": "2026-11-04",
        "hora": "21:00",
        "socio": 230
      },
      {
        "id": 5,
        "pista": 2,
        "dia": "2026-11-05",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 6,
        "pista": 3,
        "dia": "2026-11-05",
        "hora": "18:00",
        "socio": 61
      },
      {
        "id": 7,
        "pista": 1,
        "dia": "2026-11-05",
        "hora": "20:00",
        "socio": 87
      },
      {
        "id": 8,
        "pista": 3,
        "dia": "2026-11-06",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 9,
        "pista": 1,
        "dia": "2026-11-06",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 10,
        "pista": 2,
        "dia": "2026-11-06",
        "hora": "21:00",
        "socio": 230
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "titulo": "Paso 1: el día, en la URL",
  "consigna": "En datos.ts, cargarCuadrante lee el día de ?dia= (PRIMER_DIA si no viene o no existe) y pasa request.signal a pedirReservas. En Cuadrante.tsx, el selector va dentro de un <Form method=\"get\"> y el desplegable enseña el día de la URL, también después de pulsar Atrás. Escribe /reservas?dia=2026-11-06 en la barra para probar.",
  "comprobaciones": [
    {
      "descripcion": "Con ?dia=2026-11-05 en la URL, el cuadrante es el del jueves",
      "urlInicial": "/reservas?dia=2026-11-05",
      "espera": {
        "rol": "heading",
        "nombre": "Jueves 5 de noviembre"
      }
    },
    {
      "descripcion": "Sin ?dia, el cuadrante es el del miércoles 4",
      "urlInicial": "/reservas",
      "espera": {
        "rol": "heading",
        "nombre": "Miércoles 4 de noviembre"
      }
    },
    {
      "descripcion": "Con un día que no está en la lista, también el miércoles 4",
      "urlInicial": "/reservas?dia=2026-12-25",
      "espera": {
        "rol": "heading",
        "nombre": "Miércoles 4 de noviembre"
      }
    },
    {
      "descripcion": "Al elegir el jueves y pulsar «Ver el día», el día queda en la URL",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Día",
            "opcion": "Jueves 5 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver el día"
          }
        }
      ],
      "espera": {
        "url": "/reservas?dia=2026-11-05"
      }
    },
    {
      "descripcion": "El jueves, la franja de Pádel 2 a las 19:00 es tuya",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Día",
            "opcion": "Jueves 5 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver el día"
          }
        }
      ],
      "espera": {
        "texto": "19:00 · Tuya"
      }
    },
    {
      "descripcion": "Al pulsar Atrás, el desplegable vuelve al miércoles",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Día",
            "opcion": "Jueves 5 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver el día"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jueves 5 de noviembre"
          }
        },
        {
          "atras": true
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        }
      ],
      "espera": {
        "etiqueta": "Día",
        "valor": "2026-11-04"
      }
    }
  ]
}
```

Con el paso hecho, mira el registro del router al cambiar de día: la navegación que acaba en `/reservas?dia=2026-11-05` dice «Se ejecutó: polideportivo, tus-reservas, cuadrante». Es la regla de la lección 4: si cambia la búsqueda, el router repite todos los `loader` de la página, porque no sabe cuál la lee. Aquí solo la lee `cuadrante`. Apúntatelo para el paso 5.

## Paso 2: reservar sin cambiar de página

Para reservar, la `action` de la ruta `cuadrante` ya está escrita: lee la pista, el día y la hora del formulario y guarda la reserva con `POST /api/reservas`. Y `Franja` trae un primer intento, con lo de la lección 3:

```tsx
<Form method="post" action="/reservas">
  <input type="hidden" name="pista" value={pista} />
  <input type="hidden" name="dia" value={dia} />
  <input type="hidden" name="hora" value={hora} />
  <button>Reservar {nombre} a las {hora}</button>
</Form>
```

Pruébalo en el bloque: ve al jueves y reserva el Frontón a las 21:00. **Te devuelve al miércoles.** Un `<Form>` es una navegación: tras el `POST`, el router se queda en la dirección del envío, `/reservas`, sin la búsqueda, y el `loader` vuelve al primer día. Comprobado en la barra: de `/reservas?dia=2026-11-05` a `/reservas`, y en el registro, «Envío · POST /reservas».

Reservar no es ir a otra página. **Es el trabajo de un fetcher** (lección 5): envía a la misma `action`, pero sin navegar, y cada `Franja` tiene el suyo, así que puedes reservar dos franjas a la vez sin que se pisen.

- `useFetcher<typeof reservar>()` y `<fetcher.Form>` en lugar de `<Form>`. El genérico hace que `fetcher.data` sepa lo que devuelve la `action`: lo usarás en el paso 3.
- **Interfaz pendiente**: mientras `fetcher.state` no sea `'idle'`, el botón dice «Reservando…» y está desactivado. Recuerda la lección 6: el envío pasa por `submitting` y después por `loading`, mientras se recarga la página, y el botón tiene que esperar a las dos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cancelar, cargarCuadrante, cargarPistas, cargarTusReservas, reservar } from './datos'\nimport Cuadrante from './Cuadrante'\nimport Maquetacion from './Maquetacion'\nimport TusReservas from './TusReservas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'polideportivo',\n    path: '/',\n    loader: cargarPistas,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando el polideportivo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">No se ha podido cargar. Pulsa Recargar en la barra.</p>,\n    children: [\n      { index: true, loader: () => redirect('/reservas') },\n      {\n        id: 'tus-reservas',\n        loader: cargarTusReservas,\n        Component: TusReservas,\n        children: [\n          {\n            id: 'cuadrante',\n            path: 'reservas',\n            loader: cargarCuadrante,\n            action: reservar,\n            Component: Cuadrante,\n          },\n          { path: 'reservas/:id', action: cancelar },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Pista = { id: number; nombre: string; tarifa: string }\nexport type Reserva = { id: number; pista: number; dia: string; hora: string; socio: number }\n\nexport const SOCIO = 112\nexport const HORAS = ['18:00', '19:00', '20:00', '21:00']\nexport const DIAS: Record<string, string> = {\n  '2026-11-04': 'Miércoles 4 de noviembre',\n  '2026-11-05': 'Jueves 5 de noviembre',\n  '2026-11-06': 'Viernes 6 de noviembre',\n}\nconst PRIMER_DIA = '2026-11-04'\n\n// Cuántas veces se ha ejecutado cada loader, para verlo en pantalla\nconst cargas = { polideportivo: 0, tuyas: 0, cuadrante: 0 }\nexport const veces = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`\n\nasync function pedirReservas(signal?: AbortSignal): Promise<Reserva[]> {\n  const respuesta = await fetch('/api/reservas', { signal })\n  if (!respuesta.ok) throw new Error('No se pudieron leer las reservas')\n  return respuesta.json()\n}\n\n// Ruta polideportivo: las pistas y sus tarifas\nexport async function cargarPistas({ request }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/pistas', { signal: request.signal })\n  const pistas: Pista[] = await respuesta.json()\n  return { pistas, veces: ++cargas.polideportivo }\n}\n\n// Ruta tus-reservas: las del socio 112, de todos los días\nexport async function cargarTusReservas({ request }: LoaderFunctionArgs) {\n  const reservas = await pedirReservas(request.signal)\n  const tuyas = reservas\n    .filter((reserva) => reserva.socio === SOCIO)\n    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))\n  return { tuyas, veces: ++cargas.tuyas }\n}\n\n// Ruta cuadrante: las reservas del día que dice ?dia=\nexport async function cargarCuadrante({ request }: LoaderFunctionArgs) {\n  const pedido = new URL(request.url).searchParams.get('dia')\n  const dia = pedido !== null && pedido in DIAS ? pedido : PRIMER_DIA\n  const reservas = await pedirReservas(request.signal)\n  return { dia, reservas: reservas.filter((reserva) => reserva.dia === dia), veces: ++cargas.cuadrante }\n}\n\n// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  // TODO (paso 3): antes de guardar, pide /api/reservas y comprueba que\n  // la franja sigue libre. Si no, devuelve el conflicto con un 409.\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta reservas/:id: cancelar una reserva\nexport async function cancelar({ params }: ActionFunctionArgs) {\n  const respuesta = await fetch(`/api/reservas/${params.id}`, { method: 'DELETE' })\n  if (!respuesta.ok) return data({ error: 'No se pudo cancelar.' }, { status: 500 })\n  return { error: null }\n}\n\n// Para provocar un conflicto: otro socio reserva sin pasar por tu router\nexport async function otroSocioReserva(dia: string) {\n  await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista: 3, dia, hora: '20:00', socio: 77 }),\n  })\n}\n"
    },
    {
      "nombre": "Cuadrante.tsx",
      "codigo": "import { Form, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, HORAS, SOCIO, veces } from './datos'\nimport type { Reserva, cargarCuadrante, cargarPistas } from './datos'\n\ntype PropsFranja = { pista: number; nombre: string; dia: string; hora: string; reserva?: Reserva }\n\nfunction Franja({ pista, nombre, dia, hora, reserva }: PropsFranja) {\n  // TODO (paso 2): reserva con un fetcher, sin cambiar de página. Mientras\n  // se guarda, el botón dice «Reservando…» y está desactivado\n  let contenido\n  if (reserva) contenido = reserva.socio === SOCIO ? ' · Tuya' : ' · Ocupada'\n  else {\n    contenido = (\n      <Form method=\"post\" action=\"/reservas\">\n        <input type=\"hidden\" name=\"pista\" value={pista} />\n        <input type=\"hidden\" name=\"dia\" value={dia} />\n        <input type=\"hidden\" name=\"hora\" value={hora} />\n        <button>\n          Reservar {nombre} a las {hora}\n        </button>\n      </Form>\n    )\n  }\n  return (\n    <li>\n      {hora}\n      {contenido}\n    </li>\n  )\n}\n\nexport default function Cuadrante() {\n  const { dia, reservas, veces: cargas } = useLoaderData<typeof cargarCuadrante>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  return (\n    <main>\n      <h2>{DIAS[dia]}</h2>\n      <Form method=\"get\" className=\"elegir-dia\">\n        <label>\n          Día{' '}\n          <select name=\"dia\" defaultValue={dia} key={dia}>\n            {Object.entries(DIAS).map(([valor, nombre]) => (\n              <option key={valor} value={valor}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver el día</button>\n      </Form>\n      {pistas.map((pista) => (\n        <section key={pista.id} aria-labelledby={`pista-${pista.id}`}>\n          <h3 id={`pista-${pista.id}`}>{pista.nombre}</h3>\n          <ul>\n            {HORAS.map((hora) => (\n              <Franja\n                key={`${dia}-${pista.id}-${hora}`}\n                pista={pista.id}\n                nombre={pista.nombre}\n                dia={dia}\n                hora={hora}\n                reserva={reservas.find((r) => r.pista === pista.id && r.hora === hora)}\n              />\n            ))}\n          </ul>\n        </section>\n      ))}\n      <p className=\"contador\">loader cuadrante · {veces(cargas)}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TusReservas.tsx",
      "codigo": "import { Outlet, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, veces } from './datos'\nimport type { Reserva, cargarPistas, cargarTusReservas } from './datos'\n\nexport default function TusReservas() {\n  const { tuyas, veces: cargas } = useLoaderData<typeof cargarTusReservas>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n\n  // «Pádel 1 · miércoles 4 · 18:00»\n  function describir(reserva: Reserva) {\n    const pista = pistas.find((p) => p.id === reserva.pista)?.nombre ?? `Pista ${reserva.pista}`\n    const dia = DIAS[reserva.dia].split(' de ')[0].toLowerCase()\n    return `${pista} · ${dia} · ${reserva.hora}`\n  }\n\n  // TODO (paso 6): un botón «Cancelar» en cada reserva, con su propio\n  // fetcher, y «Cancelar todas» debajo de la lista\n\n  return (\n    <div className=\"cuerpo\">\n      <Outlet />\n      <aside aria-labelledby=\"titulo-tuyas\">\n        <h2 id=\"titulo-tuyas\">Tus reservas (socio 112)</h2>\n        {tuyas.length === 0 ? (\n          <p>No tienes reservas.</p>\n        ) : (\n          <ul>\n            {tuyas.map((reserva) => (\n              <li key={reserva.id}>{describir(reserva)}</li>\n            ))}\n          </ul>\n        )}\n        <p className=\"contador\">loader tus-reservas · {veces(cargas)}</p>\n      </aside>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { Outlet, useLoaderData, useNavigation } from 'react-router'\nimport { veces } from './datos'\nimport type { cargarPistas } from './datos'\n\nexport default function Maquetacion() {\n  const { pistas, veces: cargas } = useLoaderData<typeof cargarPistas>()\n  const navigation = useNavigation()\n\n  // TODO (paso 6): que diga también «Cancelando 3 reservas…» (o «1 reserva»)\n  // y «Reservando…» mientras haya fetchers en marcha\n  let mensaje = ''\n  if (navigation.state !== 'idle') mensaje = 'Cargando el día…'\n\n  return (\n    <div className=\"app\">\n      <header>\n        <h1>Polideportivo Municipal de Monzón</h1>\n        <p className=\"tarifas\">\n          {pistas.map((pista) => `${pista.nombre}: ${pista.tarifa}`).join(' · ')}\n        </p>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <Outlet />\n      <p className=\"contador\">loader polideportivo · {veces(cargas)}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1d2b2a;\n  background: #f4f7f5;\n}\n\n.app {\n  max-width: 56rem;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\nheader {\n  border-bottom: 3px solid #1f7a5c;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n  color: #1f5f49;\n}\n\n.tarifas {\n  margin: 0.25rem 0;\n  color: #4b5d59;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0.25rem 0 0.5rem;\n  font-weight: 600;\n  color: #9a5b00;\n}\n\n.cuerpo {\n  display: grid;\n  gap: 1.25rem;\n  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);\n}\n\n@media (max-width: 40rem) {\n  .cuerpo {\n    grid-template-columns: 1fr;\n  }\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh3 {\n  margin: 0.75rem 0 0.25rem;\n  font-size: 1rem;\n}\n\n.elegir-dia {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  padding: 0.3rem 0.5rem;\n  border-bottom: 1px solid #d9e3df;\n}\n\nli form {\n  margin-left: auto;\n}\n\nli p[role='alert'] {\n  flex-basis: 100%;\n  margin: 0.25rem 0 0;\n  color: #b3261e;\n}\n\nli.cancelando {\n  opacity: 0.55;\n}\n\naside {\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #fff;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);\n}\n\naside > button {\n  margin-top: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #1f7a5c;\n  border-radius: 0.35rem;\n  color: #1f5f49;\n  background: #fff;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: progress;\n}\n\n.contador {\n  margin: 0.75rem 0 0;\n  font: 0.8rem ui-monospace, monospace;\n  color: #6b7a76;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem;\n  border: 1px dashed #9a5b00;\n  border-radius: 0.5rem;\n  background: #fff8ec;\n}\n\n.simulador p {\n  margin: 0.4rem 0 0;\n}\n\n.nota {\n  padding: 1rem;\n  color: #4b5d59;\n}\n"
    }
  ],
  "archivoInicial": "Cuadrante.tsx",
  "urlInicial": "/reservas?dia=2026-11-04",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "pistas": [
      {
        "id": 1,
        "nombre": "Pádel 1",
        "tarifa": "8 € la hora"
      },
      {
        "id": 2,
        "nombre": "Pádel 2",
        "tarifa": "8 € la hora"
      },
      {
        "id": 3,
        "nombre": "Frontón",
        "tarifa": "5 € la hora"
      }
    ],
    "reservas": [
      {
        "id": 1,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 112
      },
      {
        "id": 2,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "19:00",
        "socio": 87
      },
      {
        "id": 3,
        "pista": 2,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 4,
        "pista": 3,
        "dia": "2026-11-04",
        "hora": "21:00",
        "socio": 230
      },
      {
        "id": 5,
        "pista": 2,
        "dia": "2026-11-05",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 6,
        "pista": 3,
        "dia": "2026-11-05",
        "hora": "18:00",
        "socio": 61
      },
      {
        "id": 7,
        "pista": 1,
        "dia": "2026-11-05",
        "hora": "20:00",
        "socio": 87
      },
      {
        "id": 8,
        "pista": 3,
        "dia": "2026-11-06",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 9,
        "pista": 1,
        "dia": "2026-11-06",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 10,
        "pista": 2,
        "dia": "2026-11-06",
        "hora": "21:00",
        "socio": 230
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "titulo": "Paso 2: reservar con un fetcher",
  "consigna": "En Cuadrante.tsx, cambia el <Form> de Franja por un fetcher: useFetcher<typeof reservar>() y <fetcher.Form>, con la misma action. Mientras se guarda, el botón dice «Reservando…» y está desactivado. Ve al jueves, reserva el Frontón a las 21:00 y mira la barra: sigues en el jueves. En el registro, la operación se llama «Fetcher «_r_…» · POST /reservas».",
  "comprobaciones": [
    {
      "descripcion": "Al reservar el jueves, sigues en el jueves",
      "urlInicial": "/reservas?dia=2026-11-05",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Frontón a las 21:00"
          }
        },
        {
          "pulsar": {
            "texto": "21:00 · Tuya"
          }
        }
      ],
      "espera": {
        "url": "/reservas?dia=2026-11-05"
      }
    },
    {
      "descripcion": "La reserva aparece en «Tus reservas»",
      "urlInicial": "/reservas?dia=2026-11-05",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Frontón a las 21:00"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Frontón · jueves 5 · 21:00"
      }
    },
    {
      "descripcion": "Mientras se guarda, el botón dice «Reservando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Reservando…"
      }
    }
  ]
}
```

En el registro, la operación del fetcher tiene la `action` de `cuadrante` en «Envío» y, en «Revalidación», los tres `loader`: «Se volvió a ejecutar: polideportivo, tus-reservas, cuadrante». Un fetcher que envía con éxito revalida la página entera, igual que un `<Form>` (lección 4). Las pistas también, aunque una reserva no las cambie: el paso 5 se encarga.

El nombre entre comillas latinas, «_r_…», es la `key` que React Router le pone al fetcher con `useId` cuando no le das una (lección 5).

## Paso 3: la franja que otro socio te quita

Entre que cargas el cuadrante y pulsas «Reservar», otro socio puede quedarse esa franja desde su móvil. Tu pantalla no se entera, y la `action` guarda la segunda reserva sin mirar. Para provocarlo, el cuadrante trae ahora un botón de pruebas, «Otro socio reserva el Frontón a las 20:00», que hace un `POST` directo a la API, sin pasar por tu router.

**La `action` tiene que comprobar que la franja sigue libre**, justo antes de guardar:

1. Pide `GET /api/reservas`. Si falla, devuelve el error con un 500, como ya hace el `POST`.
2. Si ya hay una reserva de esa pista ese día a esa hora, **devuelve** el conflicto: `data({ error: 'Alguien acaba de reservar esta pista a las 20:00.' }, { status: 409 })`. El 409 (*Conflict*) es el estado HTTP para eso: tu petición choca con el estado actual del recurso.
3. Si no, guarda como antes.

Y la `Franja` enseña `fetcher.data?.error` en un párrafo con `role="alert"`, solo cuando el fetcher está en `'idle'`: así, si vuelves a intentarlo, el aviso viejo no se queda a la vista mientras se envía.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  const respuesta = await fetch('/api/reservas')\n  if (!respuesta.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  const reservas: Reserva[] = await respuesta.json()\n  const ocupada = reservas.some((r) => r.pista === pista && r.dia === dia && r.hora === hora)\n  if (ocupada) {\n    return data({ error: `Alguien acaba de reservar esta pista a las ${hora}.` }, { status: 409 })\n  }\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}",
  "anotaciones": [
    {
      "fragmento": "const respuesta = await fetch('/api/reservas')",
      "nota": "Se pregunta al servidor en el momento de reservar, no se fía del cuadrante que tienes en pantalla: puede tener minutos. En un servidor de verdad, la última palabra sería de la base de datos, con una restricción de unicidad sobre pista, día y hora."
    },
    {
      "fragmento": "return data({ error: `Alguien acaba de reservar esta pista a las ${hora}.` }, { status: 409 })",
      "nota": "Se devuelve, no se lanza. Un throw iría al ErrorBoundary más cercano y se llevaría la página entera; devuelto, llega a fetcher.data de esta franja y nada más."
    },
    {
      "fragmento": "return { error: null }",
      "nota": "Con el genérico, fetcher.data es { error: string } | { error: null } | undefined. data() se desenvuelve: el tipo es el del primer argumento, sin el estado."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cancelar, cargarCuadrante, cargarPistas, cargarTusReservas, reservar } from './datos'\nimport Cuadrante from './Cuadrante'\nimport Maquetacion from './Maquetacion'\nimport TusReservas from './TusReservas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'polideportivo',\n    path: '/',\n    loader: cargarPistas,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando el polideportivo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">No se ha podido cargar. Pulsa Recargar en la barra.</p>,\n    children: [\n      { index: true, loader: () => redirect('/reservas') },\n      {\n        id: 'tus-reservas',\n        loader: cargarTusReservas,\n        Component: TusReservas,\n        children: [\n          {\n            id: 'cuadrante',\n            path: 'reservas',\n            loader: cargarCuadrante,\n            action: reservar,\n            Component: Cuadrante,\n          },\n          { path: 'reservas/:id', action: cancelar },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Pista = { id: number; nombre: string; tarifa: string }\nexport type Reserva = { id: number; pista: number; dia: string; hora: string; socio: number }\n\nexport const SOCIO = 112\nexport const HORAS = ['18:00', '19:00', '20:00', '21:00']\nexport const DIAS: Record<string, string> = {\n  '2026-11-04': 'Miércoles 4 de noviembre',\n  '2026-11-05': 'Jueves 5 de noviembre',\n  '2026-11-06': 'Viernes 6 de noviembre',\n}\nconst PRIMER_DIA = '2026-11-04'\n\n// Cuántas veces se ha ejecutado cada loader, para verlo en pantalla\nconst cargas = { polideportivo: 0, tuyas: 0, cuadrante: 0 }\nexport const veces = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`\n\nasync function pedirReservas(signal?: AbortSignal): Promise<Reserva[]> {\n  const respuesta = await fetch('/api/reservas', { signal })\n  if (!respuesta.ok) throw new Error('No se pudieron leer las reservas')\n  return respuesta.json()\n}\n\n// Ruta polideportivo: las pistas y sus tarifas\nexport async function cargarPistas({ request }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/pistas', { signal: request.signal })\n  const pistas: Pista[] = await respuesta.json()\n  return { pistas, veces: ++cargas.polideportivo }\n}\n\n// Ruta tus-reservas: las del socio 112, de todos los días\nexport async function cargarTusReservas({ request }: LoaderFunctionArgs) {\n  const reservas = await pedirReservas(request.signal)\n  const tuyas = reservas\n    .filter((reserva) => reserva.socio === SOCIO)\n    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))\n  return { tuyas, veces: ++cargas.tuyas }\n}\n\n// Ruta cuadrante: las reservas del día que dice ?dia=\nexport async function cargarCuadrante({ request }: LoaderFunctionArgs) {\n  const pedido = new URL(request.url).searchParams.get('dia')\n  const dia = pedido !== null && pedido in DIAS ? pedido : PRIMER_DIA\n  const reservas = await pedirReservas(request.signal)\n  return { dia, reservas: reservas.filter((reserva) => reserva.dia === dia), veces: ++cargas.cuadrante }\n}\n\n// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  // TODO (paso 3): antes de guardar, pide /api/reservas y comprueba que\n  // la franja sigue libre. Si no, devuelve el conflicto con un 409.\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta reservas/:id: cancelar una reserva\nexport async function cancelar({ params }: ActionFunctionArgs) {\n  const respuesta = await fetch(`/api/reservas/${params.id}`, { method: 'DELETE' })\n  if (!respuesta.ok) return data({ error: 'No se pudo cancelar.' }, { status: 500 })\n  return { error: null }\n}\n\n// Para provocar un conflicto: otro socio reserva sin pasar por tu router\nexport async function otroSocioReserva(dia: string) {\n  await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista: 3, dia, hora: '20:00', socio: 77 }),\n  })\n}\n"
    },
    {
      "nombre": "Cuadrante.tsx",
      "codigo": "import { useState } from 'react'\nimport { Form, useFetcher, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, HORAS, SOCIO, otroSocioReserva, veces } from './datos'\nimport type { Reserva, cargarCuadrante, cargarPistas, reservar } from './datos'\n\ntype PropsFranja = { pista: number; nombre: string; dia: string; hora: string; reserva?: Reserva }\n\nfunction Franja({ pista, nombre, dia, hora, reserva }: PropsFranja) {\n  const fetcher = useFetcher<typeof reservar>()\n  const reservando = fetcher.state !== 'idle'\n  // TODO (paso 3): si la action devuelve un error, enséñalo en la franja\n  // en un párrafo con role=\"alert\"\n  let contenido\n  if (reserva) contenido = reserva.socio === SOCIO ? ' · Tuya' : ' · Ocupada'\n  else {\n    contenido = (\n      <fetcher.Form method=\"post\" action=\"/reservas\">\n        <input type=\"hidden\" name=\"pista\" value={pista} />\n        <input type=\"hidden\" name=\"dia\" value={dia} />\n        <input type=\"hidden\" name=\"hora\" value={hora} />\n        <button disabled={reservando}>\n          {reservando ? 'Reservando…' : `Reservar ${nombre} a las ${hora}`}\n        </button>\n      </fetcher.Form>\n    )\n  }\n  return (\n    <li>\n      {hora}\n      {contenido}\n    </li>\n  )\n}\n\nexport default function Cuadrante() {\n  const { dia, reservas, veces: cargas } = useLoaderData<typeof cargarCuadrante>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  const [aviso, setAviso] = useState('')\n\n  async function simularOtroSocio() {\n    await otroSocioReserva(dia)\n    setAviso('Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe.')\n  }\n\n  return (\n    <main>\n      <h2>{DIAS[dia]}</h2>\n      <Form method=\"get\" className=\"elegir-dia\">\n        <label>\n          Día{' '}\n          <select name=\"dia\" defaultValue={dia} key={dia}>\n            {Object.entries(DIAS).map(([valor, nombre]) => (\n              <option key={valor} value={valor}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver el día</button>\n      </Form>\n      {pistas.map((pista) => (\n        <section key={pista.id} aria-labelledby={`pista-${pista.id}`}>\n          <h3 id={`pista-${pista.id}`}>{pista.nombre}</h3>\n          <ul>\n            {HORAS.map((hora) => (\n              <Franja\n                key={`${dia}-${pista.id}-${hora}`}\n                pista={pista.id}\n                nombre={pista.nombre}\n                dia={dia}\n                hora={hora}\n                reserva={reservas.find((r) => r.pista === pista.id && r.hora === hora)}\n              />\n            ))}\n          </ul>\n        </section>\n      ))}\n      <p className=\"contador\">loader cuadrante · {veces(cargas)}</p>\n      <div className=\"simulador\">\n        <button onClick={simularOtroSocio}>Otro socio reserva el Frontón a las 20:00</button>\n        {aviso && <p>{aviso}</p>}\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TusReservas.tsx",
      "codigo": "import { Outlet, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, veces } from './datos'\nimport type { Reserva, cargarPistas, cargarTusReservas } from './datos'\n\nexport default function TusReservas() {\n  const { tuyas, veces: cargas } = useLoaderData<typeof cargarTusReservas>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n\n  // «Pádel 1 · miércoles 4 · 18:00»\n  function describir(reserva: Reserva) {\n    const pista = pistas.find((p) => p.id === reserva.pista)?.nombre ?? `Pista ${reserva.pista}`\n    const dia = DIAS[reserva.dia].split(' de ')[0].toLowerCase()\n    return `${pista} · ${dia} · ${reserva.hora}`\n  }\n\n  // TODO (paso 6): un botón «Cancelar» en cada reserva, con su propio\n  // fetcher, y «Cancelar todas» debajo de la lista\n\n  return (\n    <div className=\"cuerpo\">\n      <Outlet />\n      <aside aria-labelledby=\"titulo-tuyas\">\n        <h2 id=\"titulo-tuyas\">Tus reservas (socio 112)</h2>\n        {tuyas.length === 0 ? (\n          <p>No tienes reservas.</p>\n        ) : (\n          <ul>\n            {tuyas.map((reserva) => (\n              <li key={reserva.id}>{describir(reserva)}</li>\n            ))}\n          </ul>\n        )}\n        <p className=\"contador\">loader tus-reservas · {veces(cargas)}</p>\n      </aside>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { Outlet, useLoaderData, useNavigation } from 'react-router'\nimport { veces } from './datos'\nimport type { cargarPistas } from './datos'\n\nexport default function Maquetacion() {\n  const { pistas, veces: cargas } = useLoaderData<typeof cargarPistas>()\n  const navigation = useNavigation()\n\n  // TODO (paso 6): que diga también «Cancelando 3 reservas…» (o «1 reserva»)\n  // y «Reservando…» mientras haya fetchers en marcha\n  let mensaje = ''\n  if (navigation.state !== 'idle') mensaje = 'Cargando el día…'\n\n  return (\n    <div className=\"app\">\n      <header>\n        <h1>Polideportivo Municipal de Monzón</h1>\n        <p className=\"tarifas\">\n          {pistas.map((pista) => `${pista.nombre}: ${pista.tarifa}`).join(' · ')}\n        </p>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <Outlet />\n      <p className=\"contador\">loader polideportivo · {veces(cargas)}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1d2b2a;\n  background: #f4f7f5;\n}\n\n.app {\n  max-width: 56rem;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\nheader {\n  border-bottom: 3px solid #1f7a5c;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n  color: #1f5f49;\n}\n\n.tarifas {\n  margin: 0.25rem 0;\n  color: #4b5d59;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0.25rem 0 0.5rem;\n  font-weight: 600;\n  color: #9a5b00;\n}\n\n.cuerpo {\n  display: grid;\n  gap: 1.25rem;\n  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);\n}\n\n@media (max-width: 40rem) {\n  .cuerpo {\n    grid-template-columns: 1fr;\n  }\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh3 {\n  margin: 0.75rem 0 0.25rem;\n  font-size: 1rem;\n}\n\n.elegir-dia {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  padding: 0.3rem 0.5rem;\n  border-bottom: 1px solid #d9e3df;\n}\n\nli form {\n  margin-left: auto;\n}\n\nli p[role='alert'] {\n  flex-basis: 100%;\n  margin: 0.25rem 0 0;\n  color: #b3261e;\n}\n\nli.cancelando {\n  opacity: 0.55;\n}\n\naside {\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #fff;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);\n}\n\naside > button {\n  margin-top: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #1f7a5c;\n  border-radius: 0.35rem;\n  color: #1f5f49;\n  background: #fff;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: progress;\n}\n\n.contador {\n  margin: 0.75rem 0 0;\n  font: 0.8rem ui-monospace, monospace;\n  color: #6b7a76;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem;\n  border: 1px dashed #9a5b00;\n  border-radius: 0.5rem;\n  background: #fff8ec;\n}\n\n.simulador p {\n  margin: 0.4rem 0 0;\n}\n\n.nota {\n  padding: 1rem;\n  color: #4b5d59;\n}\n"
    }
  ],
  "archivoInicial": "datos.ts",
  "urlInicial": "/reservas?dia=2026-11-04",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "pistas": [
      {
        "id": 1,
        "nombre": "Pádel 1",
        "tarifa": "8 € la hora"
      },
      {
        "id": 2,
        "nombre": "Pádel 2",
        "tarifa": "8 € la hora"
      },
      {
        "id": 3,
        "nombre": "Frontón",
        "tarifa": "5 € la hora"
      }
    ],
    "reservas": [
      {
        "id": 1,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 112
      },
      {
        "id": 2,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "19:00",
        "socio": 87
      },
      {
        "id": 3,
        "pista": 2,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 4,
        "pista": 3,
        "dia": "2026-11-04",
        "hora": "21:00",
        "socio": 230
      },
      {
        "id": 5,
        "pista": 2,
        "dia": "2026-11-05",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 6,
        "pista": 3,
        "dia": "2026-11-05",
        "hora": "18:00",
        "socio": 61
      },
      {
        "id": 7,
        "pista": 1,
        "dia": "2026-11-05",
        "hora": "20:00",
        "socio": 87
      },
      {
        "id": 8,
        "pista": 3,
        "dia": "2026-11-06",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 9,
        "pista": 1,
        "dia": "2026-11-06",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 10,
        "pista": 2,
        "dia": "2026-11-06",
        "hora": "21:00",
        "socio": 230
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "titulo": "Paso 3: el conflicto, con un 409",
  "consigna": "Pulsa «Otro socio reserva el Frontón a las 20:00» y después «Reservar Frontón a las 20:00»: se guarda otra reserva en la misma franja, y sale en «Tus reservas». En datos.ts, haz que reservar compruebe la franja y devuelva el conflicto con data(…, { status: 409 }). En Cuadrante.tsx, enseña fetcher.data?.error en un role=\"alert\" cuando el fetcher esté en idle. Prueba también «Fallar la siguiente petición».",
  "comprobaciones": [
    {
      "descripcion": "Si otro socio se te adelanta, la franja dice que alguien acaba de reservarla",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otro socio reserva el Frontón a las 20:00"
          }
        },
        {
          "pulsar": {
            "texto": "Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Frontón a las 20:00"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Alguien acaba de reservar esta pista a las 20:00."
      }
    },
    {
      "descripcion": "El conflicto no guarda una segunda reserva en «Tus reservas»",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otro socio reserva el Frontón a las 20:00"
          }
        },
        {
          "pulsar": {
            "texto": "Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Frontón a las 20:00"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Frontón · miércoles 4 · 20:00"
        }
      }
    },
    {
      "descripcion": "Una franja libre se sigue reservando",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        }
      ],
      "espera": {
        "texto": "21:00 · Tuya"
      }
    },
    {
      "descripcion": "Si el servidor falla, la franja lo dice",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se pudo reservar. Inténtalo otra vez."
      }
    }
  ]
}
```

Ahora repite el conflicto con el paso hecho y mira la franja del Frontón a las 20:00: dice que alguien acaba de reservarla, **y sigue ofreciendo «Reservar»**. En el registro, el envío no tiene fase «Revalidación»: «No se volvió a ejecutar: polideportivo, tus-reservas, cuadrante». Es el primer caso de la lección 4: un `data(…, 409)` devuelto no revalida nada, porque el router supone que un envío fallido no ha cambiado nada en el servidor.

Aquí suponía mal. Tu envío no ha cambiado nada, pero el conflicto demuestra que **el cuadrante está viejo**. En el paso 5 se lo dirás al router.

## Paso 4: la reserva, al momento

Con 300 ms de latencia, una reserva son tres viajes: la comprobación, el `POST` y la recarga de la página. Casi un segundo de botón desactivado; con mala cobertura, tres. Lo que se está enviando ya lo sabes, porque está en `fetcher.formData` (lección 6), y puedes pintarlo antes de que conteste el servidor.

Pero la lección 6 te avisaba: una reserva **la decide el servidor**, que puede responder con un 409. Por eso la franja no va a decir «Tuya», sino **«Tuya · reservando…»**: adelanta dónde va a quedar tu reserva, pero sin prometerla. Si el servidor dice que no, se retira sola y el aviso explica por qué.

En `Franja`, el orden de las comprobaciones importa:

1. **Si hay `reserva`**, lo que diga el servidor: «Tuya» u «Ocupada».
2. **Si no, y hay `fetcher.formData`**, la reserva provisional: « · Tuya · reservando…».
3. Si no, el botón. Ya no hace falta desactivarlo: mientras dura el envío, no se pinta.

Sin `useState` y sin nada que deshacer. El valor provisional no se guarda en ningún sitio; se calcula en cada render.

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cancelar, cargarCuadrante, cargarPistas, cargarTusReservas, reservar } from './datos'\nimport Cuadrante from './Cuadrante'\nimport Maquetacion from './Maquetacion'\nimport TusReservas from './TusReservas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    id: 'polideportivo',\n    path: '/',\n    loader: cargarPistas,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando el polideportivo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">No se ha podido cargar. Pulsa Recargar en la barra.</p>,\n    children: [\n      { index: true, loader: () => redirect('/reservas') },\n      {\n        id: 'tus-reservas',\n        loader: cargarTusReservas,\n        Component: TusReservas,\n        children: [\n          {\n            id: 'cuadrante',\n            path: 'reservas',\n            loader: cargarCuadrante,\n            action: reservar,\n            Component: Cuadrante,\n          },\n          { path: 'reservas/:id', action: cancelar },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Pista = { id: number; nombre: string; tarifa: string }\nexport type Reserva = { id: number; pista: number; dia: string; hora: string; socio: number }\n\nexport const SOCIO = 112\nexport const HORAS = ['18:00', '19:00', '20:00', '21:00']\nexport const DIAS: Record<string, string> = {\n  '2026-11-04': 'Miércoles 4 de noviembre',\n  '2026-11-05': 'Jueves 5 de noviembre',\n  '2026-11-06': 'Viernes 6 de noviembre',\n}\nconst PRIMER_DIA = '2026-11-04'\n\n// Cuántas veces se ha ejecutado cada loader, para verlo en pantalla\nconst cargas = { polideportivo: 0, tuyas: 0, cuadrante: 0 }\nexport const veces = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`\n\nasync function pedirReservas(signal?: AbortSignal): Promise<Reserva[]> {\n  const respuesta = await fetch('/api/reservas', { signal })\n  if (!respuesta.ok) throw new Error('No se pudieron leer las reservas')\n  return respuesta.json()\n}\n\n// Ruta polideportivo: las pistas y sus tarifas\nexport async function cargarPistas({ request }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/pistas', { signal: request.signal })\n  const pistas: Pista[] = await respuesta.json()\n  return { pistas, veces: ++cargas.polideportivo }\n}\n\n// Ruta tus-reservas: las del socio 112, de todos los días\nexport async function cargarTusReservas({ request }: LoaderFunctionArgs) {\n  const reservas = await pedirReservas(request.signal)\n  const tuyas = reservas\n    .filter((reserva) => reserva.socio === SOCIO)\n    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))\n  return { tuyas, veces: ++cargas.tuyas }\n}\n\n// Ruta cuadrante: las reservas del día que dice ?dia=\nexport async function cargarCuadrante({ request }: LoaderFunctionArgs) {\n  const pedido = new URL(request.url).searchParams.get('dia')\n  const dia = pedido !== null && pedido in DIAS ? pedido : PRIMER_DIA\n  const reservas = await pedirReservas(request.signal)\n  return { dia, reservas: reservas.filter((reserva) => reserva.dia === dia), veces: ++cargas.cuadrante }\n}\n\n// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  const respuesta = await fetch('/api/reservas')\n  if (!respuesta.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  const reservas: Reserva[] = await respuesta.json()\n  const ocupada = reservas.some((r) => r.pista === pista && r.dia === dia && r.hora === hora)\n  if (ocupada) {\n    return data({ error: `Alguien acaba de reservar esta pista a las ${hora}.` }, { status: 409 })\n  }\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta reservas/:id: cancelar una reserva\nexport async function cancelar({ params }: ActionFunctionArgs) {\n  const respuesta = await fetch(`/api/reservas/${params.id}`, { method: 'DELETE' })\n  if (!respuesta.ok) return data({ error: 'No se pudo cancelar.' }, { status: 500 })\n  return { error: null }\n}\n\n// Para provocar un conflicto: otro socio reserva sin pasar por tu router\nexport async function otroSocioReserva(dia: string) {\n  await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista: 3, dia, hora: '20:00', socio: 77 }),\n  })\n}\n"
    },
    {
      "nombre": "Cuadrante.tsx",
      "codigo": "import { useState } from 'react'\nimport { Form, useFetcher, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, HORAS, SOCIO, otroSocioReserva, veces } from './datos'\nimport type { Reserva, cargarCuadrante, cargarPistas, reservar } from './datos'\n\ntype PropsFranja = { pista: number; nombre: string; dia: string; hora: string; reserva?: Reserva }\n\nfunction Franja({ pista, nombre, dia, hora, reserva }: PropsFranja) {\n  const fetcher = useFetcher<typeof reservar>()\n  const reservando = fetcher.state !== 'idle'\n  // TODO (paso 4): mientras se envía, la franja dice «Tuya · reservando…»\n  // (lo que lleva fetcher.formData), en vez del botón desactivado\n  let contenido\n  if (reserva) contenido = reserva.socio === SOCIO ? ' · Tuya' : ' · Ocupada'\n  else {\n    contenido = (\n      <fetcher.Form method=\"post\" action=\"/reservas\">\n        <input type=\"hidden\" name=\"pista\" value={pista} />\n        <input type=\"hidden\" name=\"dia\" value={dia} />\n        <input type=\"hidden\" name=\"hora\" value={hora} />\n        <button disabled={reservando}>\n          {reservando ? 'Reservando…' : `Reservar ${nombre} a las ${hora}`}\n        </button>\n      </fetcher.Form>\n    )\n  }\n  return (\n    <li>\n      {hora}\n      {contenido}\n      {fetcher.state === 'idle' && fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Cuadrante() {\n  const { dia, reservas, veces: cargas } = useLoaderData<typeof cargarCuadrante>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  const [aviso, setAviso] = useState('')\n\n  async function simularOtroSocio() {\n    await otroSocioReserva(dia)\n    setAviso('Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe.')\n  }\n\n  return (\n    <main>\n      <h2>{DIAS[dia]}</h2>\n      <Form method=\"get\" className=\"elegir-dia\">\n        <label>\n          Día{' '}\n          <select name=\"dia\" defaultValue={dia} key={dia}>\n            {Object.entries(DIAS).map(([valor, nombre]) => (\n              <option key={valor} value={valor}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver el día</button>\n      </Form>\n      {pistas.map((pista) => (\n        <section key={pista.id} aria-labelledby={`pista-${pista.id}`}>\n          <h3 id={`pista-${pista.id}`}>{pista.nombre}</h3>\n          <ul>\n            {HORAS.map((hora) => (\n              <Franja\n                key={`${dia}-${pista.id}-${hora}`}\n                pista={pista.id}\n                nombre={pista.nombre}\n                dia={dia}\n                hora={hora}\n                reserva={reservas.find((r) => r.pista === pista.id && r.hora === hora)}\n              />\n            ))}\n          </ul>\n        </section>\n      ))}\n      <p className=\"contador\">loader cuadrante · {veces(cargas)}</p>\n      <div className=\"simulador\">\n        <button onClick={simularOtroSocio}>Otro socio reserva el Frontón a las 20:00</button>\n        {aviso && <p>{aviso}</p>}\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TusReservas.tsx",
      "codigo": "import { Outlet, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, veces } from './datos'\nimport type { Reserva, cargarPistas, cargarTusReservas } from './datos'\n\nexport default function TusReservas() {\n  const { tuyas, veces: cargas } = useLoaderData<typeof cargarTusReservas>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n\n  // «Pádel 1 · miércoles 4 · 18:00»\n  function describir(reserva: Reserva) {\n    const pista = pistas.find((p) => p.id === reserva.pista)?.nombre ?? `Pista ${reserva.pista}`\n    const dia = DIAS[reserva.dia].split(' de ')[0].toLowerCase()\n    return `${pista} · ${dia} · ${reserva.hora}`\n  }\n\n  // TODO (paso 6): un botón «Cancelar» en cada reserva, con su propio\n  // fetcher, y «Cancelar todas» debajo de la lista\n\n  return (\n    <div className=\"cuerpo\">\n      <Outlet />\n      <aside aria-labelledby=\"titulo-tuyas\">\n        <h2 id=\"titulo-tuyas\">Tus reservas (socio 112)</h2>\n        {tuyas.length === 0 ? (\n          <p>No tienes reservas.</p>\n        ) : (\n          <ul>\n            {tuyas.map((reserva) => (\n              <li key={reserva.id}>{describir(reserva)}</li>\n            ))}\n          </ul>\n        )}\n        <p className=\"contador\">loader tus-reservas · {veces(cargas)}</p>\n      </aside>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { Outlet, useLoaderData, useNavigation } from 'react-router'\nimport { veces } from './datos'\nimport type { cargarPistas } from './datos'\n\nexport default function Maquetacion() {\n  const { pistas, veces: cargas } = useLoaderData<typeof cargarPistas>()\n  const navigation = useNavigation()\n\n  // TODO (paso 6): que diga también «Cancelando 3 reservas…» (o «1 reserva»)\n  // y «Reservando…» mientras haya fetchers en marcha\n  let mensaje = ''\n  if (navigation.state !== 'idle') mensaje = 'Cargando el día…'\n\n  return (\n    <div className=\"app\">\n      <header>\n        <h1>Polideportivo Municipal de Monzón</h1>\n        <p className=\"tarifas\">\n          {pistas.map((pista) => `${pista.nombre}: ${pista.tarifa}`).join(' · ')}\n        </p>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <Outlet />\n      <p className=\"contador\">loader polideportivo · {veces(cargas)}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1d2b2a;\n  background: #f4f7f5;\n}\n\n.app {\n  max-width: 56rem;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\nheader {\n  border-bottom: 3px solid #1f7a5c;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n  color: #1f5f49;\n}\n\n.tarifas {\n  margin: 0.25rem 0;\n  color: #4b5d59;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0.25rem 0 0.5rem;\n  font-weight: 600;\n  color: #9a5b00;\n}\n\n.cuerpo {\n  display: grid;\n  gap: 1.25rem;\n  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);\n}\n\n@media (max-width: 40rem) {\n  .cuerpo {\n    grid-template-columns: 1fr;\n  }\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh3 {\n  margin: 0.75rem 0 0.25rem;\n  font-size: 1rem;\n}\n\n.elegir-dia {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  padding: 0.3rem 0.5rem;\n  border-bottom: 1px solid #d9e3df;\n}\n\nli form {\n  margin-left: auto;\n}\n\nli p[role='alert'] {\n  flex-basis: 100%;\n  margin: 0.25rem 0 0;\n  color: #b3261e;\n}\n\nli.cancelando {\n  opacity: 0.55;\n}\n\naside {\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #fff;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);\n}\n\naside > button {\n  margin-top: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #1f7a5c;\n  border-radius: 0.35rem;\n  color: #1f5f49;\n  background: #fff;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: progress;\n}\n\n.contador {\n  margin: 0.75rem 0 0;\n  font: 0.8rem ui-monospace, monospace;\n  color: #6b7a76;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem;\n  border: 1px dashed #9a5b00;\n  border-radius: 0.5rem;\n  background: #fff8ec;\n}\n\n.simulador p {\n  margin: 0.4rem 0 0;\n}\n\n.nota {\n  padding: 1rem;\n  color: #4b5d59;\n}\n"
    }
  ],
  "archivoInicial": "Cuadrante.tsx",
  "urlInicial": "/reservas?dia=2026-11-04",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "pistas": [
      {
        "id": 1,
        "nombre": "Pádel 1",
        "tarifa": "8 € la hora"
      },
      {
        "id": 2,
        "nombre": "Pádel 2",
        "tarifa": "8 € la hora"
      },
      {
        "id": 3,
        "nombre": "Frontón",
        "tarifa": "5 € la hora"
      }
    ],
    "reservas": [
      {
        "id": 1,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 112
      },
      {
        "id": 2,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "19:00",
        "socio": 87
      },
      {
        "id": 3,
        "pista": 2,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 4,
        "pista": 3,
        "dia": "2026-11-04",
        "hora": "21:00",
        "socio": 230
      },
      {
        "id": 5,
        "pista": 2,
        "dia": "2026-11-05",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 6,
        "pista": 3,
        "dia": "2026-11-05",
        "hora": "18:00",
        "socio": 61
      },
      {
        "id": 7,
        "pista": 1,
        "dia": "2026-11-05",
        "hora": "20:00",
        "socio": 87
      },
      {
        "id": 8,
        "pista": 3,
        "dia": "2026-11-06",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 9,
        "pista": 1,
        "dia": "2026-11-06",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 10,
        "pista": 2,
        "dia": "2026-11-06",
        "hora": "21:00",
        "socio": 230
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "titulo": "Paso 4: la reserva, al momento",
  "consigna": "En Franja, si no hay reserva y fetcher.formData tiene algo, pinta « · Tuya · reservando…» en vez del botón desactivado. Sube la latencia a 2 s y reserva: la franja es tuya al instante y pasa a «Tuya» al llegar la respuesta. Después pulsa «Fallar la siguiente petición» y reserva otra: vuelve sola a su botón, con el aviso. Prueba también el conflicto del Frontón a las 20:00.",
  "comprobaciones": [
    {
      "descripcion": "Al pulsar, la franja dice «Tuya · reservando…» antes de que conteste el servidor",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "21:00 · Tuya · reservando…"
      }
    },
    {
      "descripcion": "Cuando el servidor confirma, la franja queda como «Tuya»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        }
      ],
      "espera": {
        "texto": "21:00 · Tuya"
      }
    },
    {
      "descripcion": "Si el servidor falla, la franja vuelve sola a su botón",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Reservar Pádel 2 a las 21:00"
      }
    },
    {
      "descripcion": "Y el error sale en la franja",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se pudo reservar. Inténtalo otra vez."
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Reservas Pádel 2 a las 21:00, con 300 ms de latencia",
  "items": [
    {
      "fecha": "0 ms",
      "titulo": "Pulsas «Reservar»",
      "texto": "fetcher.state pasa a submitting y fetcher.formData lleva pista, día y hora. La franja dice «21:00 · Tuya · reservando…» y sale el GET que comprueba la franja."
    },
    {
      "fecha": "300 ms",
      "titulo": "La franja está libre",
      "texto": "La action manda el POST. En pantalla, nada cambia."
    },
    {
      "fecha": "600 ms",
      "titulo": "El POST responde 201",
      "texto": "La action devuelve { error: null } y empieza la recarga de la página. fetcher.state es loading, pero formData sigue ahí: la franja sigue igual."
    },
    {
      "fecha": "900 ms",
      "titulo": "Llega el cuadrante recargado",
      "texto": "En el mismo render, la franja ya tiene reserva y formData vuelve a undefined: pasa de «Tuya · reservando…» a «Tuya» sin parpadear (comprobado en el banco de pruebas)."
    },
    {
      "fecha": "300 ms, si falla",
      "titulo": "El GET responde 500",
      "texto": "La action devuelve el error con un 500 y no se recarga nada. El fetcher vuelve a idle, formData a undefined, y la franja pinta otra vez su botón, con el aviso debajo."
    }
  ]
}
```

## Paso 5: recargar solo lo que cambia

Mira otra vez el registro de los pasos anteriores. Cada reserva vuelve a ejecutar los tres `loader`; cada cambio de día, también. Y tras un conflicto, ninguno, aunque el cuadrante esté viejo. **El router no sabe qué ha cambiado: decide con sus reglas, que miran la URL y el resultado del envío** (lección 4). Tú sí lo sabes:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué cambia cada cosa",
  "roles": [
    {
      "etiqueta": "polideportivo",
      "rol": "Nada de esta página",
      "descripcion": "Las pistas y sus tarifas no cambian al reservar, al cancelar ni al cambiar de día. Solo al cargar la página o al pulsar la misma URL."
    },
    {
      "etiqueta": "tus-reservas",
      "rol": "Reservar y cancelar",
      "descripcion": "Son de todos los días, así que cambiar de día no las toca. Un conflicto tampoco: no se ha guardado nada tuyo."
    },
    {
      "etiqueta": "cuadrante",
      "rol": "Todo, y además los conflictos",
      "descripcion": "Cambia con el día, con cada reserva y con cada cancelación. Y tras un 409 está viejo, aunque tu envío no haya cambiado nada."
    }
  ]
}
```

En `App.tsx` escribe una función `shouldRevalidate` para cada ruta y ponla en su objeto. Ya tienes `soloCambiaElDia(args)`, que dice si es una navegación (sin envío, o un `GET`) que solo cambia la búsqueda. Recuerda lo que aprendiste en la lección 4:

- **Termina siempre con `defaultShouldRevalidate`**: solo cambias los casos que conoces, y en el resto decide el router.
- **`formMethod` dice si hay un envío**: `undefined` o `'GET'` es una navegación; `'POST'` o `'DELETE'`, un envío. Llega en mayúsculas.
- **`actionStatus`** trae el estado de la respuesta de la `action`: 409 en el conflicto.
- Un `shouldRevalidate` que devuelve `false` en una ruta no frena a las demás: **cada ruta decide solo su `loader`**.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Con las tres funciones puestas:\nfunction revalidarCuadrante({ actionStatus, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {\n  if (actionStatus === 409) return true\n  return defaultShouldRevalidate\n}\n\n// Otro socio reserva el Frontón a las 20:00, tú pulsas «Reservar Frontón\n// a las 20:00» y la action devuelve data({ error }, { status: 409 }).\n// ¿Qué loader se vuelven a ejecutar?",
  "opciones": [
    "Ninguno: un 409 devuelto no revalida nada, digan lo que digan las funciones",
    "Solo cuadrante: los demás reciben defaultShouldRevalidate en false y lo devuelven",
    "Los tres: devolver true en una ruta obliga a recargar toda la página",
    "cuadrante y tus-reservas, porque tus-reservas está por encima"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en el registro: «Se volvió a ejecutar: cuadrante. No se volvió a ejecutar: polideportivo, tus-reservas.» Tras un envío de fetcher el router llama igualmente a shouldRevalidate de cada ruta, con actionStatus 409 y defaultShouldRevalidate en false. Cada ruta decide solo la suya."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport type { ShouldRevalidateFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cancelar, cargarCuadrante, cargarPistas, cargarTusReservas, reservar } from './datos'\nimport Cuadrante from './Cuadrante'\nimport Maquetacion from './Maquetacion'\nimport TusReservas from './TusReservas'\nimport './estilos.css'\n\n// ¿Es una navegación que solo cambia la búsqueda (?dia=), y no la ruta?\nfunction soloCambiaElDia({ formMethod, currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {\n  const navega = formMethod === undefined || formMethod === 'GET'\n  return navega && currentUrl.pathname === nextUrl.pathname && currentUrl.search !== nextUrl.search\n}\n\n// TODO (paso 5): una función shouldRevalidate para cada ruta con loader.\n//  · revalidarPistas: las pistas no cambian al reservar, al cancelar ni al cambiar de día\n//  · revalidarTusReservas: tus reservas no cambian al cambiar de día\n//  · revalidarCuadrante: tras un 409, el cuadrante está viejo\n// Después, ponlas en su ruta, abajo. En todo lo demás, defaultShouldRevalidate.\n\nconst router = createBrowserRouter([\n  {\n    id: 'polideportivo',\n    path: '/',\n    loader: cargarPistas,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando el polideportivo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">No se ha podido cargar. Pulsa Recargar en la barra.</p>,\n    children: [\n      { index: true, loader: () => redirect('/reservas') },\n      {\n        id: 'tus-reservas',\n        loader: cargarTusReservas,\n        Component: TusReservas,\n        children: [\n          {\n            id: 'cuadrante',\n            path: 'reservas',\n            loader: cargarCuadrante,\n            action: reservar,\n            Component: Cuadrante,\n          },\n          { path: 'reservas/:id', action: cancelar },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Pista = { id: number; nombre: string; tarifa: string }\nexport type Reserva = { id: number; pista: number; dia: string; hora: string; socio: number }\n\nexport const SOCIO = 112\nexport const HORAS = ['18:00', '19:00', '20:00', '21:00']\nexport const DIAS: Record<string, string> = {\n  '2026-11-04': 'Miércoles 4 de noviembre',\n  '2026-11-05': 'Jueves 5 de noviembre',\n  '2026-11-06': 'Viernes 6 de noviembre',\n}\nconst PRIMER_DIA = '2026-11-04'\n\n// Cuántas veces se ha ejecutado cada loader, para verlo en pantalla\nconst cargas = { polideportivo: 0, tuyas: 0, cuadrante: 0 }\nexport const veces = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`\n\nasync function pedirReservas(signal?: AbortSignal): Promise<Reserva[]> {\n  const respuesta = await fetch('/api/reservas', { signal })\n  if (!respuesta.ok) throw new Error('No se pudieron leer las reservas')\n  return respuesta.json()\n}\n\n// Ruta polideportivo: las pistas y sus tarifas\nexport async function cargarPistas({ request }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/pistas', { signal: request.signal })\n  const pistas: Pista[] = await respuesta.json()\n  return { pistas, veces: ++cargas.polideportivo }\n}\n\n// Ruta tus-reservas: las del socio 112, de todos los días\nexport async function cargarTusReservas({ request }: LoaderFunctionArgs) {\n  const reservas = await pedirReservas(request.signal)\n  const tuyas = reservas\n    .filter((reserva) => reserva.socio === SOCIO)\n    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))\n  return { tuyas, veces: ++cargas.tuyas }\n}\n\n// Ruta cuadrante: las reservas del día que dice ?dia=\nexport async function cargarCuadrante({ request }: LoaderFunctionArgs) {\n  const pedido = new URL(request.url).searchParams.get('dia')\n  const dia = pedido !== null && pedido in DIAS ? pedido : PRIMER_DIA\n  const reservas = await pedirReservas(request.signal)\n  return { dia, reservas: reservas.filter((reserva) => reserva.dia === dia), veces: ++cargas.cuadrante }\n}\n\n// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  const respuesta = await fetch('/api/reservas')\n  if (!respuesta.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  const reservas: Reserva[] = await respuesta.json()\n  const ocupada = reservas.some((r) => r.pista === pista && r.dia === dia && r.hora === hora)\n  if (ocupada) {\n    return data({ error: `Alguien acaba de reservar esta pista a las ${hora}.` }, { status: 409 })\n  }\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta reservas/:id: cancelar una reserva\nexport async function cancelar({ params }: ActionFunctionArgs) {\n  const respuesta = await fetch(`/api/reservas/${params.id}`, { method: 'DELETE' })\n  if (!respuesta.ok) return data({ error: 'No se pudo cancelar.' }, { status: 500 })\n  return { error: null }\n}\n\n// Para provocar un conflicto: otro socio reserva sin pasar por tu router\nexport async function otroSocioReserva(dia: string) {\n  await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista: 3, dia, hora: '20:00', socio: 77 }),\n  })\n}\n"
    },
    {
      "nombre": "Cuadrante.tsx",
      "codigo": "import { useState } from 'react'\nimport { Form, useFetcher, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, HORAS, SOCIO, otroSocioReserva, veces } from './datos'\nimport type { Reserva, cargarCuadrante, cargarPistas, reservar } from './datos'\n\ntype PropsFranja = { pista: number; nombre: string; dia: string; hora: string; reserva?: Reserva }\n\nfunction Franja({ pista, nombre, dia, hora, reserva }: PropsFranja) {\n  const fetcher = useFetcher<typeof reservar>()\n  let contenido\n  if (reserva) contenido = reserva.socio === SOCIO ? ' · Tuya' : ' · Ocupada'\n  // Lo que se está enviando: la franja ya es tuya, pero sin confirmar\n  else if (fetcher.formData) contenido = ' · Tuya · reservando…'\n  else {\n    contenido = (\n      <fetcher.Form method=\"post\" action=\"/reservas\">\n        <input type=\"hidden\" name=\"pista\" value={pista} />\n        <input type=\"hidden\" name=\"dia\" value={dia} />\n        <input type=\"hidden\" name=\"hora\" value={hora} />\n        <button>\n          Reservar {nombre} a las {hora}\n        </button>\n      </fetcher.Form>\n    )\n  }\n  return (\n    <li>\n      {hora}\n      {contenido}\n      {fetcher.state === 'idle' && fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Cuadrante() {\n  const { dia, reservas, veces: cargas } = useLoaderData<typeof cargarCuadrante>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  const [aviso, setAviso] = useState('')\n\n  async function simularOtroSocio() {\n    await otroSocioReserva(dia)\n    setAviso('Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe.')\n  }\n\n  return (\n    <main>\n      <h2>{DIAS[dia]}</h2>\n      <Form method=\"get\" className=\"elegir-dia\">\n        <label>\n          Día{' '}\n          <select name=\"dia\" defaultValue={dia} key={dia}>\n            {Object.entries(DIAS).map(([valor, nombre]) => (\n              <option key={valor} value={valor}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver el día</button>\n      </Form>\n      {pistas.map((pista) => (\n        <section key={pista.id} aria-labelledby={`pista-${pista.id}`}>\n          <h3 id={`pista-${pista.id}`}>{pista.nombre}</h3>\n          <ul>\n            {HORAS.map((hora) => (\n              <Franja\n                key={`${dia}-${pista.id}-${hora}`}\n                pista={pista.id}\n                nombre={pista.nombre}\n                dia={dia}\n                hora={hora}\n                reserva={reservas.find((r) => r.pista === pista.id && r.hora === hora)}\n              />\n            ))}\n          </ul>\n        </section>\n      ))}\n      <p className=\"contador\">loader cuadrante · {veces(cargas)}</p>\n      <div className=\"simulador\">\n        <button onClick={simularOtroSocio}>Otro socio reserva el Frontón a las 20:00</button>\n        {aviso && <p>{aviso}</p>}\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TusReservas.tsx",
      "codigo": "import { Outlet, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, veces } from './datos'\nimport type { Reserva, cargarPistas, cargarTusReservas } from './datos'\n\nexport default function TusReservas() {\n  const { tuyas, veces: cargas } = useLoaderData<typeof cargarTusReservas>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n\n  // «Pádel 1 · miércoles 4 · 18:00»\n  function describir(reserva: Reserva) {\n    const pista = pistas.find((p) => p.id === reserva.pista)?.nombre ?? `Pista ${reserva.pista}`\n    const dia = DIAS[reserva.dia].split(' de ')[0].toLowerCase()\n    return `${pista} · ${dia} · ${reserva.hora}`\n  }\n\n  // TODO (paso 6): un botón «Cancelar» en cada reserva, con su propio\n  // fetcher, y «Cancelar todas» debajo de la lista\n\n  return (\n    <div className=\"cuerpo\">\n      <Outlet />\n      <aside aria-labelledby=\"titulo-tuyas\">\n        <h2 id=\"titulo-tuyas\">Tus reservas (socio 112)</h2>\n        {tuyas.length === 0 ? (\n          <p>No tienes reservas.</p>\n        ) : (\n          <ul>\n            {tuyas.map((reserva) => (\n              <li key={reserva.id}>{describir(reserva)}</li>\n            ))}\n          </ul>\n        )}\n        <p className=\"contador\">loader tus-reservas · {veces(cargas)}</p>\n      </aside>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { Outlet, useLoaderData, useNavigation } from 'react-router'\nimport { veces } from './datos'\nimport type { cargarPistas } from './datos'\n\nexport default function Maquetacion() {\n  const { pistas, veces: cargas } = useLoaderData<typeof cargarPistas>()\n  const navigation = useNavigation()\n\n  // TODO (paso 6): que diga también «Cancelando 3 reservas…» (o «1 reserva»)\n  // y «Reservando…» mientras haya fetchers en marcha\n  let mensaje = ''\n  if (navigation.state !== 'idle') mensaje = 'Cargando el día…'\n\n  return (\n    <div className=\"app\">\n      <header>\n        <h1>Polideportivo Municipal de Monzón</h1>\n        <p className=\"tarifas\">\n          {pistas.map((pista) => `${pista.nombre}: ${pista.tarifa}`).join(' · ')}\n        </p>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <Outlet />\n      <p className=\"contador\">loader polideportivo · {veces(cargas)}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1d2b2a;\n  background: #f4f7f5;\n}\n\n.app {\n  max-width: 56rem;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\nheader {\n  border-bottom: 3px solid #1f7a5c;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n  color: #1f5f49;\n}\n\n.tarifas {\n  margin: 0.25rem 0;\n  color: #4b5d59;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0.25rem 0 0.5rem;\n  font-weight: 600;\n  color: #9a5b00;\n}\n\n.cuerpo {\n  display: grid;\n  gap: 1.25rem;\n  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);\n}\n\n@media (max-width: 40rem) {\n  .cuerpo {\n    grid-template-columns: 1fr;\n  }\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh3 {\n  margin: 0.75rem 0 0.25rem;\n  font-size: 1rem;\n}\n\n.elegir-dia {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  padding: 0.3rem 0.5rem;\n  border-bottom: 1px solid #d9e3df;\n}\n\nli form {\n  margin-left: auto;\n}\n\nli p[role='alert'] {\n  flex-basis: 100%;\n  margin: 0.25rem 0 0;\n  color: #b3261e;\n}\n\nli.cancelando {\n  opacity: 0.55;\n}\n\naside {\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #fff;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);\n}\n\naside > button {\n  margin-top: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #1f7a5c;\n  border-radius: 0.35rem;\n  color: #1f5f49;\n  background: #fff;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: progress;\n}\n\n.contador {\n  margin: 0.75rem 0 0;\n  font: 0.8rem ui-monospace, monospace;\n  color: #6b7a76;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem;\n  border: 1px dashed #9a5b00;\n  border-radius: 0.5rem;\n  background: #fff8ec;\n}\n\n.simulador p {\n  margin: 0.4rem 0 0;\n}\n\n.nota {\n  padding: 1rem;\n  color: #4b5d59;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/reservas?dia=2026-11-04",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "pistas": [
      {
        "id": 1,
        "nombre": "Pádel 1",
        "tarifa": "8 € la hora"
      },
      {
        "id": 2,
        "nombre": "Pádel 2",
        "tarifa": "8 € la hora"
      },
      {
        "id": 3,
        "nombre": "Frontón",
        "tarifa": "5 € la hora"
      }
    ],
    "reservas": [
      {
        "id": 1,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 112
      },
      {
        "id": 2,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "19:00",
        "socio": 87
      },
      {
        "id": 3,
        "pista": 2,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 4,
        "pista": 3,
        "dia": "2026-11-04",
        "hora": "21:00",
        "socio": 230
      },
      {
        "id": 5,
        "pista": 2,
        "dia": "2026-11-05",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 6,
        "pista": 3,
        "dia": "2026-11-05",
        "hora": "18:00",
        "socio": 61
      },
      {
        "id": 7,
        "pista": 1,
        "dia": "2026-11-05",
        "hora": "20:00",
        "socio": 87
      },
      {
        "id": 8,
        "pista": 3,
        "dia": "2026-11-06",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 9,
        "pista": 1,
        "dia": "2026-11-06",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 10,
        "pista": 2,
        "dia": "2026-11-06",
        "hora": "21:00",
        "socio": 230
      }
    ]
  },
  "red": {
    "latencia": 200
  },
  "titulo": "Paso 5: shouldRevalidate en cada ruta",
  "consigna": "En App.tsx, escribe revalidarPistas, revalidarTusReservas y revalidarCuadrante y ponlas en su ruta. Reserva, cambia de día y provoca el conflicto del Frontón a las 20:00, y mira el registro y los contadores: «No se volvió a ejecutar: polideportivo» al reservar, solo cuadrante al cambiar de día y, tras el 409, la franja sale ocupada.",
  "comprobaciones": [
    {
      "descripcion": "Al reservar, las pistas no se vuelven a cargar",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        },
        {
          "pulsar": {
            "texto": "21:00 · Tuya"
          }
        }
      ],
      "espera": {
        "texto": "loader polideportivo · 1 vez"
      }
    },
    {
      "descripcion": "Al reservar, «Tus reservas» sí se recarga",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        },
        {
          "pulsar": {
            "texto": "21:00 · Tuya"
          }
        }
      ],
      "espera": {
        "texto": "loader tus-reservas · 2 veces"
      }
    },
    {
      "descripcion": "Al cambiar de día, «Tus reservas» no se recarga",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Día",
            "opcion": "Jueves 5 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver el día"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jueves 5 de noviembre"
          }
        }
      ],
      "espera": {
        "texto": "loader tus-reservas · 1 vez"
      }
    },
    {
      "descripcion": "Al cambiar de día, las pistas tampoco",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Día",
            "opcion": "Jueves 5 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver el día"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jueves 5 de noviembre"
          }
        }
      ],
      "espera": {
        "texto": "loader polideportivo · 1 vez"
      }
    },
    {
      "descripcion": "Al cambiar de día, el cuadrante sí se recarga",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Día",
            "opcion": "Jueves 5 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver el día"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jueves 5 de noviembre"
          }
        }
      ],
      "espera": {
        "texto": "loader cuadrante · 2 veces"
      }
    },
    {
      "descripcion": "Tras un conflicto, el cuadrante se recarga y la franja sale ocupada",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otro socio reserva el Frontón a las 20:00"
          }
        },
        {
          "pulsar": {
            "texto": "Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Frontón a las 20:00"
          }
        }
      ],
      "espera": {
        "texto": "20:00 · Ocupada"
      }
    },
    {
      "descripcion": "Tras un conflicto, «Tus reservas» no se recarga",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otro socio reserva el Frontón a las 20:00"
          }
        },
        {
          "pulsar": {
            "texto": "Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Frontón a las 20:00"
          }
        },
        {
          "pulsar": {
            "texto": "20:00 · Ocupada"
          }
        }
      ],
      "espera": {
        "texto": "loader tus-reservas · 1 vez"
      }
    }
  ]
}
```

Esto es lo que dijo el registro con la solución, en el banco de pruebas, resumido y sin los tiempos:

```text
Fetcher «_r_7_» · POST /reservas            (una reserva)
  Envío         action cuadrante
  Revalidación  loader tus-reservas, loader cuadrante
  Se volvió a ejecutar: tus-reservas, cuadrante.
  No se volvió a ejecutar: polideportivo.

Fetcher «_r_a_» · POST /reservas            (el conflicto)
  Envío         action cuadrante
  Revalidación  loader cuadrante
  Se volvió a ejecutar: cuadrante.
  No se volvió a ejecutar: polideportivo, tus-reservas.

Navegación … acabó en /reservas?dia=2026-11-05   (cambio de día)
  Carga         loader cuadrante
  Se ejecutó: cuadrante.
  No se volvió a ejecutar: polideportivo, tus-reservas.
```

Cada reserva se ahorra una petición, y cada cambio de día, dos. Con tres pistas no se nota; en un polideportivo con un catálogo que tarda en cargarse, sí. Y el conflicto, que antes dejaba la pantalla mintiendo, ahora la pone al día.

## Paso 6: cancelar varias a la vez

Falta poder arrepentirse. En «Tus reservas», cada fila tendrá su botón «Cancelar», y debajo de la lista, «Cancelar todas». La `action` ya existe: la ruta `reservas/:id` borra la reserva con `DELETE`.

- **Un fetcher por fila, con nombre.** `FilaReserva` usa `` useFetcher<typeof cancelar>({ key: `cancelar-${reserva.id}` }) `` y un `` <fetcher.Form method="delete" action={`/reservas/${reserva.id}`}> ``. Mientras no esté en `'idle'`, en lugar del botón, « · Cancelando…». El botón se llama «Cancelar», pero su nombre accesible tiene que decir cuál: `` aria-label={`Cancelar ${texto}`} ``.
- **«Cancelar todas», un envío por reserva.** Un mismo fetcher que envía otra vez cancela su envío anterior (lección 5), así que hacen falta tantos fetchers como reservas. `useSubmit` lo hace sin componentes: `` submit(null, { method: 'delete', action, navigate: false, fetcherKey: `cancelar-${id}` }) ``. Con `navigate: false`, el envío sale como un fetcher; con la **misma `key` que la fila**, la fila lo ve y dice «Cancelando…».
- **El indicador global, con `useFetchers`.** En `Maquetacion.tsx`, el párrafo de estado solo mira `useNavigation`, que no sabe nada de fetchers (lección 6). Cuenta los fetchers en marcha con `formMethod === 'DELETE'` para decir «Cancelando 3 reservas…» (o «1 reserva»), y si no hay ninguno pero hay alguno con `'POST'`, «Reservando…».

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport type { ShouldRevalidateFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cancelar, cargarCuadrante, cargarPistas, cargarTusReservas, reservar } from './datos'\nimport Cuadrante from './Cuadrante'\nimport Maquetacion from './Maquetacion'\nimport TusReservas from './TusReservas'\nimport './estilos.css'\n\n// ¿Es una navegación que solo cambia la búsqueda (?dia=), y no la ruta?\nfunction soloCambiaElDia({ formMethod, currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {\n  const navega = formMethod === undefined || formMethod === 'GET'\n  return navega && currentUrl.pathname === nextUrl.pathname && currentUrl.search !== nextUrl.search\n}\n\n// Las pistas no cambian al reservar, al cancelar ni al cambiar de día\nfunction revalidarPistas(args: ShouldRevalidateFunctionArgs) {\n  const envio = args.formMethod !== undefined && args.formMethod !== 'GET'\n  if (envio || soloCambiaElDia(args)) return false\n  return args.defaultShouldRevalidate\n}\n\n// Tus reservas son de todos los días: cambiar de día no las cambia\nfunction revalidarTusReservas(args: ShouldRevalidateFunctionArgs) {\n  if (soloCambiaElDia(args)) return false\n  return args.defaultShouldRevalidate\n}\n\n// Tras un 409, el cuadrante está viejo: hay que recargarlo\nfunction revalidarCuadrante({ actionStatus, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {\n  if (actionStatus === 409) return true\n  return defaultShouldRevalidate\n}\n\nconst router = createBrowserRouter([\n  {\n    id: 'polideportivo',\n    path: '/',\n    loader: cargarPistas,\n    shouldRevalidate: revalidarPistas,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando el polideportivo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">No se ha podido cargar. Pulsa Recargar en la barra.</p>,\n    children: [\n      { index: true, loader: () => redirect('/reservas') },\n      {\n        id: 'tus-reservas',\n        loader: cargarTusReservas,\n        shouldRevalidate: revalidarTusReservas,\n        Component: TusReservas,\n        children: [\n          {\n            id: 'cuadrante',\n            path: 'reservas',\n            loader: cargarCuadrante,\n            action: reservar,\n            shouldRevalidate: revalidarCuadrante,\n            Component: Cuadrante,\n          },\n          { path: 'reservas/:id', action: cancelar },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Pista = { id: number; nombre: string; tarifa: string }\nexport type Reserva = { id: number; pista: number; dia: string; hora: string; socio: number }\n\nexport const SOCIO = 112\nexport const HORAS = ['18:00', '19:00', '20:00', '21:00']\nexport const DIAS: Record<string, string> = {\n  '2026-11-04': 'Miércoles 4 de noviembre',\n  '2026-11-05': 'Jueves 5 de noviembre',\n  '2026-11-06': 'Viernes 6 de noviembre',\n}\nconst PRIMER_DIA = '2026-11-04'\n\n// Cuántas veces se ha ejecutado cada loader, para verlo en pantalla\nconst cargas = { polideportivo: 0, tuyas: 0, cuadrante: 0 }\nexport const veces = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`\n\nasync function pedirReservas(signal?: AbortSignal): Promise<Reserva[]> {\n  const respuesta = await fetch('/api/reservas', { signal })\n  if (!respuesta.ok) throw new Error('No se pudieron leer las reservas')\n  return respuesta.json()\n}\n\n// Ruta polideportivo: las pistas y sus tarifas\nexport async function cargarPistas({ request }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/pistas', { signal: request.signal })\n  const pistas: Pista[] = await respuesta.json()\n  return { pistas, veces: ++cargas.polideportivo }\n}\n\n// Ruta tus-reservas: las del socio 112, de todos los días\nexport async function cargarTusReservas({ request }: LoaderFunctionArgs) {\n  const reservas = await pedirReservas(request.signal)\n  const tuyas = reservas\n    .filter((reserva) => reserva.socio === SOCIO)\n    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))\n  return { tuyas, veces: ++cargas.tuyas }\n}\n\n// Ruta cuadrante: las reservas del día que dice ?dia=\nexport async function cargarCuadrante({ request }: LoaderFunctionArgs) {\n  const pedido = new URL(request.url).searchParams.get('dia')\n  const dia = pedido !== null && pedido in DIAS ? pedido : PRIMER_DIA\n  const reservas = await pedirReservas(request.signal)\n  return { dia, reservas: reservas.filter((reserva) => reserva.dia === dia), veces: ++cargas.cuadrante }\n}\n\n// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  const respuesta = await fetch('/api/reservas')\n  if (!respuesta.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  const reservas: Reserva[] = await respuesta.json()\n  const ocupada = reservas.some((r) => r.pista === pista && r.dia === dia && r.hora === hora)\n  if (ocupada) {\n    return data({ error: `Alguien acaba de reservar esta pista a las ${hora}.` }, { status: 409 })\n  }\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta reservas/:id: cancelar una reserva\nexport async function cancelar({ params }: ActionFunctionArgs) {\n  const respuesta = await fetch(`/api/reservas/${params.id}`, { method: 'DELETE' })\n  if (!respuesta.ok) return data({ error: 'No se pudo cancelar.' }, { status: 500 })\n  return { error: null }\n}\n\n// Para provocar un conflicto: otro socio reserva sin pasar por tu router\nexport async function otroSocioReserva(dia: string) {\n  await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista: 3, dia, hora: '20:00', socio: 77 }),\n  })\n}\n"
    },
    {
      "nombre": "Cuadrante.tsx",
      "codigo": "import { useState } from 'react'\nimport { Form, useFetcher, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, HORAS, SOCIO, otroSocioReserva, veces } from './datos'\nimport type { Reserva, cargarCuadrante, cargarPistas, reservar } from './datos'\n\ntype PropsFranja = { pista: number; nombre: string; dia: string; hora: string; reserva?: Reserva }\n\nfunction Franja({ pista, nombre, dia, hora, reserva }: PropsFranja) {\n  const fetcher = useFetcher<typeof reservar>()\n  let contenido\n  if (reserva) contenido = reserva.socio === SOCIO ? ' · Tuya' : ' · Ocupada'\n  // Lo que se está enviando: la franja ya es tuya, pero sin confirmar\n  else if (fetcher.formData) contenido = ' · Tuya · reservando…'\n  else {\n    contenido = (\n      <fetcher.Form method=\"post\" action=\"/reservas\">\n        <input type=\"hidden\" name=\"pista\" value={pista} />\n        <input type=\"hidden\" name=\"dia\" value={dia} />\n        <input type=\"hidden\" name=\"hora\" value={hora} />\n        <button>\n          Reservar {nombre} a las {hora}\n        </button>\n      </fetcher.Form>\n    )\n  }\n  return (\n    <li>\n      {hora}\n      {contenido}\n      {fetcher.state === 'idle' && fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Cuadrante() {\n  const { dia, reservas, veces: cargas } = useLoaderData<typeof cargarCuadrante>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  const [aviso, setAviso] = useState('')\n\n  async function simularOtroSocio() {\n    await otroSocioReserva(dia)\n    setAviso('Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe.')\n  }\n\n  return (\n    <main>\n      <h2>{DIAS[dia]}</h2>\n      <Form method=\"get\" className=\"elegir-dia\">\n        <label>\n          Día{' '}\n          <select name=\"dia\" defaultValue={dia} key={dia}>\n            {Object.entries(DIAS).map(([valor, nombre]) => (\n              <option key={valor} value={valor}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver el día</button>\n      </Form>\n      {pistas.map((pista) => (\n        <section key={pista.id} aria-labelledby={`pista-${pista.id}`}>\n          <h3 id={`pista-${pista.id}`}>{pista.nombre}</h3>\n          <ul>\n            {HORAS.map((hora) => (\n              <Franja\n                key={`${dia}-${pista.id}-${hora}`}\n                pista={pista.id}\n                nombre={pista.nombre}\n                dia={dia}\n                hora={hora}\n                reserva={reservas.find((r) => r.pista === pista.id && r.hora === hora)}\n              />\n            ))}\n          </ul>\n        </section>\n      ))}\n      <p className=\"contador\">loader cuadrante · {veces(cargas)}</p>\n      <div className=\"simulador\">\n        <button onClick={simularOtroSocio}>Otro socio reserva el Frontón a las 20:00</button>\n        {aviso && <p>{aviso}</p>}\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TusReservas.tsx",
      "codigo": "import { Outlet, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, veces } from './datos'\nimport type { Reserva, cargarPistas, cargarTusReservas } from './datos'\n\nexport default function TusReservas() {\n  const { tuyas, veces: cargas } = useLoaderData<typeof cargarTusReservas>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n\n  // «Pádel 1 · miércoles 4 · 18:00»\n  function describir(reserva: Reserva) {\n    const pista = pistas.find((p) => p.id === reserva.pista)?.nombre ?? `Pista ${reserva.pista}`\n    const dia = DIAS[reserva.dia].split(' de ')[0].toLowerCase()\n    return `${pista} · ${dia} · ${reserva.hora}`\n  }\n\n  // TODO (paso 6): un botón «Cancelar» en cada reserva, con su propio\n  // fetcher, y «Cancelar todas» debajo de la lista\n\n  return (\n    <div className=\"cuerpo\">\n      <Outlet />\n      <aside aria-labelledby=\"titulo-tuyas\">\n        <h2 id=\"titulo-tuyas\">Tus reservas (socio 112)</h2>\n        {tuyas.length === 0 ? (\n          <p>No tienes reservas.</p>\n        ) : (\n          <ul>\n            {tuyas.map((reserva) => (\n              <li key={reserva.id}>{describir(reserva)}</li>\n            ))}\n          </ul>\n        )}\n        <p className=\"contador\">loader tus-reservas · {veces(cargas)}</p>\n      </aside>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { Outlet, useLoaderData, useNavigation } from 'react-router'\nimport { veces } from './datos'\nimport type { cargarPistas } from './datos'\n\nexport default function Maquetacion() {\n  const { pistas, veces: cargas } = useLoaderData<typeof cargarPistas>()\n  const navigation = useNavigation()\n\n  // TODO (paso 6): que diga también «Cancelando 3 reservas…» (o «1 reserva»)\n  // y «Reservando…» mientras haya fetchers en marcha\n  let mensaje = ''\n  if (navigation.state !== 'idle') mensaje = 'Cargando el día…'\n\n  return (\n    <div className=\"app\">\n      <header>\n        <h1>Polideportivo Municipal de Monzón</h1>\n        <p className=\"tarifas\">\n          {pistas.map((pista) => `${pista.nombre}: ${pista.tarifa}`).join(' · ')}\n        </p>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <Outlet />\n      <p className=\"contador\">loader polideportivo · {veces(cargas)}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1d2b2a;\n  background: #f4f7f5;\n}\n\n.app {\n  max-width: 56rem;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\nheader {\n  border-bottom: 3px solid #1f7a5c;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n  color: #1f5f49;\n}\n\n.tarifas {\n  margin: 0.25rem 0;\n  color: #4b5d59;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0.25rem 0 0.5rem;\n  font-weight: 600;\n  color: #9a5b00;\n}\n\n.cuerpo {\n  display: grid;\n  gap: 1.25rem;\n  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);\n}\n\n@media (max-width: 40rem) {\n  .cuerpo {\n    grid-template-columns: 1fr;\n  }\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh3 {\n  margin: 0.75rem 0 0.25rem;\n  font-size: 1rem;\n}\n\n.elegir-dia {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  padding: 0.3rem 0.5rem;\n  border-bottom: 1px solid #d9e3df;\n}\n\nli form {\n  margin-left: auto;\n}\n\nli p[role='alert'] {\n  flex-basis: 100%;\n  margin: 0.25rem 0 0;\n  color: #b3261e;\n}\n\nli.cancelando {\n  opacity: 0.55;\n}\n\naside {\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #fff;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);\n}\n\naside > button {\n  margin-top: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #1f7a5c;\n  border-radius: 0.35rem;\n  color: #1f5f49;\n  background: #fff;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: progress;\n}\n\n.contador {\n  margin: 0.75rem 0 0;\n  font: 0.8rem ui-monospace, monospace;\n  color: #6b7a76;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem;\n  border: 1px dashed #9a5b00;\n  border-radius: 0.5rem;\n  background: #fff8ec;\n}\n\n.simulador p {\n  margin: 0.4rem 0 0;\n}\n\n.nota {\n  padding: 1rem;\n  color: #4b5d59;\n}\n"
    }
  ],
  "archivoInicial": "TusReservas.tsx",
  "urlInicial": "/reservas?dia=2026-11-04",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "pistas": [
      {
        "id": 1,
        "nombre": "Pádel 1",
        "tarifa": "8 € la hora"
      },
      {
        "id": 2,
        "nombre": "Pádel 2",
        "tarifa": "8 € la hora"
      },
      {
        "id": 3,
        "nombre": "Frontón",
        "tarifa": "5 € la hora"
      }
    ],
    "reservas": [
      {
        "id": 1,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 112
      },
      {
        "id": 2,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "19:00",
        "socio": 87
      },
      {
        "id": 3,
        "pista": 2,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 4,
        "pista": 3,
        "dia": "2026-11-04",
        "hora": "21:00",
        "socio": 230
      },
      {
        "id": 5,
        "pista": 2,
        "dia": "2026-11-05",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 6,
        "pista": 3,
        "dia": "2026-11-05",
        "hora": "18:00",
        "socio": 61
      },
      {
        "id": 7,
        "pista": 1,
        "dia": "2026-11-05",
        "hora": "20:00",
        "socio": 87
      },
      {
        "id": 8,
        "pista": 3,
        "dia": "2026-11-06",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 9,
        "pista": 1,
        "dia": "2026-11-06",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 10,
        "pista": 2,
        "dia": "2026-11-06",
        "hora": "21:00",
        "socio": 230
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "titulo": "Paso 6: cancelar varias a la vez",
  "consigna": "En TusReservas.tsx, un componente FilaReserva con su fetcher (key cancelar-<id>) y su botón «Cancelar», que dice « · Cancelando…» mientras trabaja y enseña el error en un role=\"alert\"; y un botón «Cancelar todas» con useSubmit. En Maquetacion.tsx, el indicador cuenta los fetchers con useFetchers(). Pulsa «Cancelar todas» y mira el registro: tres operaciones «Fetcher «cancelar-…»» a la vez.",
  "comprobaciones": [
    {
      "descripcion": "Al cancelar una reserva, desaparece de «Tus reservas»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar Pádel 1 · miércoles 4 · 18:00"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Pádel 1 · miércoles 4 · 18:00"
        }
      }
    },
    {
      "descripcion": "Y su franja vuelve a estar libre",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar Pádel 1 · miércoles 4 · 18:00"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Reservar Pádel 1 a las 18:00"
      }
    },
    {
      "descripcion": "Mientras se cancela, la fila dice «Cancelando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar Pádel 1 · miércoles 4 · 18:00"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Pádel 1 · miércoles 4 · 18:00 · Cancelando…"
      }
    },
    {
      "descripcion": "Con «Cancelar todas», el indicador dice «Cancelando 3 reservas…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar todas"
          }
        }
      ],
      "espera": {
        "texto": "Cancelando 3 reservas…"
      }
    },
    {
      "descripcion": "Con «Cancelar todas», cada fila dice «Cancelando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar todas"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Frontón · viernes 6 · 19:00 · Cancelando…"
      }
    },
    {
      "descripcion": "Al terminar, «Tus reservas» dice «No tienes reservas.»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar todas"
          }
        }
      ],
      "espera": {
        "texto": "No tienes reservas."
      }
    },
    {
      "descripcion": "Al reservar, el indicador dice «Reservando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar Pádel 2 a las 21:00"
          }
        }
      ],
      "espera": {
        "texto": "Reservando…"
      }
    },
    {
      "descripcion": "Si falla una cancelación, la fila lo dice",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Miércoles 4 de noviembre"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar Pádel 1 · miércoles 4 · 18:00"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se pudo cancelar."
      }
    }
  ]
}
```

Con «Cancelar todas», los tres `DELETE` salen en el mismo milisegundo y el registro enseña tres operaciones, «Fetcher «cancelar-1»», «cancelar-5» y «cancelar-8», cada una con su `action` y su revalidación de `tus-reservas` y `cuadrante`. `polideportivo` no aparece en ninguna: es tu `shouldRevalidate` del paso 5, que también vale para cancelar.

Fíjate en un momento intermedio: cuando llega la primera revalidación, la lista ya dice «No tienes reservas.» (el servidor ya ha borrado las tres), pero el indicador sigue en «Cancelando 2 reservas…» unos milisegundos, hasta que terminan las otras dos. El indicador cuenta fetchers en marcha, no filas.

## La app completa

Los seis archivos con todos los pasos resueltos, con un segundo de latencia para que se vea todo. Es el sitio para jugar con el panel de red y el registro sin miedo a romper nada:

```laboratorio
{
  "tipo": "react-en-vivo",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, redirect } from 'react-router'\nimport type { ShouldRevalidateFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cancelar, cargarCuadrante, cargarPistas, cargarTusReservas, reservar } from './datos'\nimport Cuadrante from './Cuadrante'\nimport Maquetacion from './Maquetacion'\nimport TusReservas from './TusReservas'\nimport './estilos.css'\n\n// ¿Es una navegación que solo cambia la búsqueda (?dia=), y no la ruta?\nfunction soloCambiaElDia({ formMethod, currentUrl, nextUrl }: ShouldRevalidateFunctionArgs) {\n  const navega = formMethod === undefined || formMethod === 'GET'\n  return navega && currentUrl.pathname === nextUrl.pathname && currentUrl.search !== nextUrl.search\n}\n\n// Las pistas no cambian al reservar, al cancelar ni al cambiar de día\nfunction revalidarPistas(args: ShouldRevalidateFunctionArgs) {\n  const envio = args.formMethod !== undefined && args.formMethod !== 'GET'\n  if (envio || soloCambiaElDia(args)) return false\n  return args.defaultShouldRevalidate\n}\n\n// Tus reservas son de todos los días: cambiar de día no las cambia\nfunction revalidarTusReservas(args: ShouldRevalidateFunctionArgs) {\n  if (soloCambiaElDia(args)) return false\n  return args.defaultShouldRevalidate\n}\n\n// Tras un 409, el cuadrante está viejo: hay que recargarlo\nfunction revalidarCuadrante({ actionStatus, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {\n  if (actionStatus === 409) return true\n  return defaultShouldRevalidate\n}\n\nconst router = createBrowserRouter([\n  {\n    id: 'polideportivo',\n    path: '/',\n    loader: cargarPistas,\n    shouldRevalidate: revalidarPistas,\n    Component: Maquetacion,\n    HydrateFallback: () => <p className=\"nota\">Cargando el polideportivo…</p>,\n    ErrorBoundary: () => <p role=\"alert\">No se ha podido cargar. Pulsa Recargar en la barra.</p>,\n    children: [\n      { index: true, loader: () => redirect('/reservas') },\n      {\n        id: 'tus-reservas',\n        loader: cargarTusReservas,\n        shouldRevalidate: revalidarTusReservas,\n        Component: TusReservas,\n        children: [\n          {\n            id: 'cuadrante',\n            path: 'reservas',\n            loader: cargarCuadrante,\n            action: reservar,\n            shouldRevalidate: revalidarCuadrante,\n            Component: Cuadrante,\n          },\n          { path: 'reservas/:id', action: cancelar },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "datos.ts",
      "codigo": "import { data } from 'react-router'\nimport type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'\n\nexport type Pista = { id: number; nombre: string; tarifa: string }\nexport type Reserva = { id: number; pista: number; dia: string; hora: string; socio: number }\n\nexport const SOCIO = 112\nexport const HORAS = ['18:00', '19:00', '20:00', '21:00']\nexport const DIAS: Record<string, string> = {\n  '2026-11-04': 'Miércoles 4 de noviembre',\n  '2026-11-05': 'Jueves 5 de noviembre',\n  '2026-11-06': 'Viernes 6 de noviembre',\n}\nconst PRIMER_DIA = '2026-11-04'\n\n// Cuántas veces se ha ejecutado cada loader, para verlo en pantalla\nconst cargas = { polideportivo: 0, tuyas: 0, cuadrante: 0 }\nexport const veces = (n: number) => `${n} ${n === 1 ? 'vez' : 'veces'}`\n\nasync function pedirReservas(signal?: AbortSignal): Promise<Reserva[]> {\n  const respuesta = await fetch('/api/reservas', { signal })\n  if (!respuesta.ok) throw new Error('No se pudieron leer las reservas')\n  return respuesta.json()\n}\n\n// Ruta polideportivo: las pistas y sus tarifas\nexport async function cargarPistas({ request }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/pistas', { signal: request.signal })\n  const pistas: Pista[] = await respuesta.json()\n  return { pistas, veces: ++cargas.polideportivo }\n}\n\n// Ruta tus-reservas: las del socio 112, de todos los días\nexport async function cargarTusReservas({ request }: LoaderFunctionArgs) {\n  const reservas = await pedirReservas(request.signal)\n  const tuyas = reservas\n    .filter((reserva) => reserva.socio === SOCIO)\n    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))\n  return { tuyas, veces: ++cargas.tuyas }\n}\n\n// Ruta cuadrante: las reservas del día que dice ?dia=\nexport async function cargarCuadrante({ request }: LoaderFunctionArgs) {\n  const pedido = new URL(request.url).searchParams.get('dia')\n  const dia = pedido !== null && pedido in DIAS ? pedido : PRIMER_DIA\n  const reservas = await pedirReservas(request.signal)\n  return { dia, reservas: reservas.filter((reserva) => reserva.dia === dia), veces: ++cargas.cuadrante }\n}\n\n// action de cuadrante: reservar una franja (la envía un fetcher)\nexport async function reservar({ request }: ActionFunctionArgs) {\n  const formulario = await request.formData()\n  const pista = Number(formulario.get('pista'))\n  const dia = String(formulario.get('dia'))\n  const hora = String(formulario.get('hora'))\n  const respuesta = await fetch('/api/reservas')\n  if (!respuesta.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  const reservas: Reserva[] = await respuesta.json()\n  const ocupada = reservas.some((r) => r.pista === pista && r.dia === dia && r.hora === hora)\n  if (ocupada) {\n    return data({ error: `Alguien acaba de reservar esta pista a las ${hora}.` }, { status: 409 })\n  }\n  const nueva = await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista, dia, hora, socio: SOCIO }),\n  })\n  if (!nueva.ok) return data({ error: 'No se pudo reservar. Inténtalo otra vez.' }, { status: 500 })\n  return { error: null }\n}\n\n// Ruta reservas/:id: cancelar una reserva\nexport async function cancelar({ params }: ActionFunctionArgs) {\n  const respuesta = await fetch(`/api/reservas/${params.id}`, { method: 'DELETE' })\n  if (!respuesta.ok) return data({ error: 'No se pudo cancelar.' }, { status: 500 })\n  return { error: null }\n}\n\n// Para provocar un conflicto: otro socio reserva sin pasar por tu router\nexport async function otroSocioReserva(dia: string) {\n  await fetch('/api/reservas', {\n    method: 'POST',\n    body: JSON.stringify({ pista: 3, dia, hora: '20:00', socio: 77 }),\n  })\n}\n"
    },
    {
      "nombre": "Cuadrante.tsx",
      "codigo": "import { useState } from 'react'\nimport { Form, useFetcher, useLoaderData, useRouteLoaderData } from 'react-router'\nimport { DIAS, HORAS, SOCIO, otroSocioReserva, veces } from './datos'\nimport type { Reserva, cargarCuadrante, cargarPistas, reservar } from './datos'\n\ntype PropsFranja = { pista: number; nombre: string; dia: string; hora: string; reserva?: Reserva }\n\nfunction Franja({ pista, nombre, dia, hora, reserva }: PropsFranja) {\n  const fetcher = useFetcher<typeof reservar>()\n  let contenido\n  if (reserva) contenido = reserva.socio === SOCIO ? ' · Tuya' : ' · Ocupada'\n  // Lo que se está enviando: la franja ya es tuya, pero sin confirmar\n  else if (fetcher.formData) contenido = ' · Tuya · reservando…'\n  else {\n    contenido = (\n      <fetcher.Form method=\"post\" action=\"/reservas\">\n        <input type=\"hidden\" name=\"pista\" value={pista} />\n        <input type=\"hidden\" name=\"dia\" value={dia} />\n        <input type=\"hidden\" name=\"hora\" value={hora} />\n        <button>\n          Reservar {nombre} a las {hora}\n        </button>\n      </fetcher.Form>\n    )\n  }\n  return (\n    <li>\n      {hora}\n      {contenido}\n      {fetcher.state === 'idle' && fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function Cuadrante() {\n  const { dia, reservas, veces: cargas } = useLoaderData<typeof cargarCuadrante>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  const [aviso, setAviso] = useState('')\n\n  async function simularOtroSocio() {\n    await otroSocioReserva(dia)\n    setAviso('Otro socio ha reservado el Frontón a las 20:00. Tu pantalla aún no lo sabe.')\n  }\n\n  return (\n    <main>\n      <h2>{DIAS[dia]}</h2>\n      <Form method=\"get\" className=\"elegir-dia\">\n        <label>\n          Día{' '}\n          <select name=\"dia\" defaultValue={dia} key={dia}>\n            {Object.entries(DIAS).map(([valor, nombre]) => (\n              <option key={valor} value={valor}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver el día</button>\n      </Form>\n      {pistas.map((pista) => (\n        <section key={pista.id} aria-labelledby={`pista-${pista.id}`}>\n          <h3 id={`pista-${pista.id}`}>{pista.nombre}</h3>\n          <ul>\n            {HORAS.map((hora) => (\n              <Franja\n                key={`${dia}-${pista.id}-${hora}`}\n                pista={pista.id}\n                nombre={pista.nombre}\n                dia={dia}\n                hora={hora}\n                reserva={reservas.find((r) => r.pista === pista.id && r.hora === hora)}\n              />\n            ))}\n          </ul>\n        </section>\n      ))}\n      <p className=\"contador\">loader cuadrante · {veces(cargas)}</p>\n      <div className=\"simulador\">\n        <button onClick={simularOtroSocio}>Otro socio reserva el Frontón a las 20:00</button>\n        {aviso && <p>{aviso}</p>}\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TusReservas.tsx",
      "codigo": "import { Outlet, useFetcher, useLoaderData, useRouteLoaderData, useSubmit } from 'react-router'\nimport { DIAS, veces } from './datos'\nimport type { Reserva, cancelar, cargarPistas, cargarTusReservas } from './datos'\n\nfunction FilaReserva({ reserva, texto }: { reserva: Reserva; texto: string }) {\n  // La misma key que usa «Cancelar todas»: así la fila ve también ese envío\n  const fetcher = useFetcher<typeof cancelar>({ key: `cancelar-${reserva.id}` })\n  const cancelando = fetcher.state !== 'idle'\n  return (\n    <li className={cancelando ? 'cancelando' : undefined}>\n      {texto}\n      {cancelando ? (\n        ' · Cancelando…'\n      ) : (\n        <fetcher.Form method=\"delete\" action={`/reservas/${reserva.id}`}>\n          <button aria-label={`Cancelar ${texto}`}>Cancelar</button>\n        </fetcher.Form>\n      )}\n      {!cancelando && fetcher.data?.error && <p role=\"alert\">{fetcher.data.error}</p>}\n    </li>\n  )\n}\n\nexport default function TusReservas() {\n  const { tuyas, veces: cargas } = useLoaderData<typeof cargarTusReservas>()\n  const pistas = useRouteLoaderData<typeof cargarPistas>('polideportivo')?.pistas ?? []\n  const submit = useSubmit()\n\n  // «Pádel 1 · miércoles 4 · 18:00»\n  function describir(reserva: Reserva) {\n    const pista = pistas.find((p) => p.id === reserva.pista)?.nombre ?? `Pista ${reserva.pista}`\n    const dia = DIAS[reserva.dia].split(' de ')[0].toLowerCase()\n    return `${pista} · ${dia} · ${reserva.hora}`\n  }\n\n  function cancelarTodas() {\n    for (const reserva of tuyas) {\n      submit(null, {\n        method: 'delete',\n        action: `/reservas/${reserva.id}`,\n        navigate: false,\n        fetcherKey: `cancelar-${reserva.id}`,\n      })\n    }\n  }\n\n  return (\n    <div className=\"cuerpo\">\n      <Outlet />\n      <aside aria-labelledby=\"titulo-tuyas\">\n        <h2 id=\"titulo-tuyas\">Tus reservas (socio 112)</h2>\n        {tuyas.length === 0 ? (\n          <p>No tienes reservas.</p>\n        ) : (\n          <>\n            <ul>\n              {tuyas.map((reserva) => (\n                <FilaReserva key={reserva.id} reserva={reserva} texto={describir(reserva)} />\n              ))}\n            </ul>\n            <button onClick={cancelarTodas}>Cancelar todas</button>\n          </>\n        )}\n        <p className=\"contador\">loader tus-reservas · {veces(cargas)}</p>\n      </aside>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Maquetacion.tsx",
      "codigo": "import { Outlet, useFetchers, useLoaderData, useNavigation } from 'react-router'\nimport { veces } from './datos'\nimport type { cargarPistas } from './datos'\n\nexport default function Maquetacion() {\n  const { pistas, veces: cargas } = useLoaderData<typeof cargarPistas>()\n  const navigation = useNavigation()\n  // Todos los fetchers en marcha, los haya creado quien los haya creado\n  const fetchers = useFetchers()\n  const cancelando = fetchers.filter((fetcher) => fetcher.formMethod === 'DELETE').length\n  const reservando = fetchers.filter((fetcher) => fetcher.formMethod === 'POST').length\n\n  let mensaje = ''\n  if (cancelando > 0) mensaje = `Cancelando ${cancelando} ${cancelando === 1 ? 'reserva' : 'reservas'}…`\n  else if (reservando > 0) mensaje = 'Reservando…'\n  else if (navigation.state !== 'idle') mensaje = 'Cargando el día…'\n\n  return (\n    <div className=\"app\">\n      <header>\n        <h1>Polideportivo Municipal de Monzón</h1>\n        <p className=\"tarifas\">\n          {pistas.map((pista) => `${pista.nombre}: ${pista.tarifa}`).join(' · ')}\n        </p>\n        <p role=\"status\" className=\"indicador\">\n          {mensaje}\n        </p>\n      </header>\n      <Outlet />\n      <p className=\"contador\">loader polideportivo · {veces(cargas)}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1d2b2a;\n  background: #f4f7f5;\n}\n\n.app {\n  max-width: 56rem;\n  margin: 0 auto;\n  padding: 1rem;\n}\n\nheader {\n  border-bottom: 3px solid #1f7a5c;\n  margin-bottom: 1rem;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n  color: #1f5f49;\n}\n\n.tarifas {\n  margin: 0.25rem 0;\n  color: #4b5d59;\n}\n\n.indicador {\n  min-height: 1.4em;\n  margin: 0.25rem 0 0.5rem;\n  font-weight: 600;\n  color: #9a5b00;\n}\n\n.cuerpo {\n  display: grid;\n  gap: 1.25rem;\n  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);\n}\n\n@media (max-width: 40rem) {\n  .cuerpo {\n    grid-template-columns: 1fr;\n  }\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh3 {\n  margin: 0.75rem 0 0.25rem;\n  font-size: 1rem;\n}\n\n.elegir-dia {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  padding: 0.3rem 0.5rem;\n  border-bottom: 1px solid #d9e3df;\n}\n\nli form {\n  margin-left: auto;\n}\n\nli p[role='alert'] {\n  flex-basis: 100%;\n  margin: 0.25rem 0 0;\n  color: #b3261e;\n}\n\nli.cancelando {\n  opacity: 0.55;\n}\n\naside {\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #fff;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);\n}\n\naside > button {\n  margin-top: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #1f7a5c;\n  border-radius: 0.35rem;\n  color: #1f5f49;\n  background: #fff;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: progress;\n}\n\n.contador {\n  margin: 0.75rem 0 0;\n  font: 0.8rem ui-monospace, monospace;\n  color: #6b7a76;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem;\n  border: 1px dashed #9a5b00;\n  border-radius: 0.5rem;\n  background: #fff8ec;\n}\n\n.simulador p {\n  margin: 0.4rem 0 0;\n}\n\n.nota {\n  padding: 1rem;\n  color: #4b5d59;\n}\n"
    }
  ],
  "archivoInicial": "Cuadrante.tsx",
  "urlInicial": "/reservas?dia=2026-11-04",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": false,
  "api": {
    "pistas": [
      {
        "id": 1,
        "nombre": "Pádel 1",
        "tarifa": "8 € la hora"
      },
      {
        "id": 2,
        "nombre": "Pádel 2",
        "tarifa": "8 € la hora"
      },
      {
        "id": 3,
        "nombre": "Frontón",
        "tarifa": "5 € la hora"
      }
    ],
    "reservas": [
      {
        "id": 1,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 112
      },
      {
        "id": 2,
        "pista": 1,
        "dia": "2026-11-04",
        "hora": "19:00",
        "socio": 87
      },
      {
        "id": 3,
        "pista": 2,
        "dia": "2026-11-04",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 4,
        "pista": 3,
        "dia": "2026-11-04",
        "hora": "21:00",
        "socio": 230
      },
      {
        "id": 5,
        "pista": 2,
        "dia": "2026-11-05",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 6,
        "pista": 3,
        "dia": "2026-11-05",
        "hora": "18:00",
        "socio": 61
      },
      {
        "id": 7,
        "pista": 1,
        "dia": "2026-11-05",
        "hora": "20:00",
        "socio": 87
      },
      {
        "id": 8,
        "pista": 3,
        "dia": "2026-11-06",
        "hora": "19:00",
        "socio": 112
      },
      {
        "id": 9,
        "pista": 1,
        "dia": "2026-11-06",
        "hora": "18:00",
        "socio": 45
      },
      {
        "id": 10,
        "pista": 2,
        "dia": "2026-11-06",
        "hora": "21:00",
        "socio": 230
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "titulo": "Reservas del Polideportivo Municipal de Monzón",
  "consigna": "Reserva dos franjas seguidas: las dos salen al momento como «Tuya · reservando…» y el indicador dice «Reservando…». Provoca el conflicto del Frontón a las 20:00. Cancela todas y mira el registro. Pulsa «Fallar la siguiente petición» antes de reservar o de cancelar, y cambia de día con la latencia a 3 s."
}
```

Lo que **no** hay: ni un `useEffect`, ni un `useState` para lo que se está cargando o enviando, ni una copia de las reservas en el cliente. Los datos son de los `loader`; los envíos, de los fetchers; y lo que está pasando, de `useNavigation` y `useFetchers`. El único estado de React es el aviso del botón de pruebas.

## Errores típicos

**Lanzar el conflicto.** Con `throw data({ error }, { status: 409 })` en la `action`, el error no llega a `fetcher.data`: sube al `ErrorBoundary` más cercano a la ruta que pinta el fetcher (lección 6). `cuadrante` no tiene, así que lo recoge el de `polideportivo`. Comprobado: la página entera cambió por «No se ha podido cargar. Pulsa Recargar en la barra.», y el registro dijo «Error en pantalla (ErrorBoundary de polideportivo): 409 …». Un conflicto es una respuesta esperada: se devuelve.

**Un solo fetcher para «Cancelar todas».**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "const todas = useFetcher()\n\nfunction cancelarTodas() {\n  for (const reserva of tuyas) {\n    todas.submit(null, { method: 'delete', action: `/reservas/${reserva.id}` })\n  }\n}\n\n// Tienes tres reservas y pulsas «Cancelar todas». La action\n// de reservas/:id no le pasa request.signal a fetch.\n// ¿Qué pasa?",
  "opciones": [
    "Solo se borra la última: las dos primeras se cancelan antes de llegar al servidor",
    "Se borran las tres, pero el indicador dice «Cancelando 1 reserva…» y ninguna fila dice «Cancelando…»",
    "Se borran las tres y todo se ve igual que con useSubmit",
    "El router lanza un error: un fetcher no puede enviar dos veces seguidas"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en el banco. Cada submit cancela el envío anterior del mismo fetcher, y el registro lo dice: «cancelada por #3», «cancelada por #4». Pero lo que se cancela es la espera del router: los tres DELETE ya habían salido y el servidor los cumplió. useFetchers ve un solo fetcher, y las filas, con sus keys, ninguno. Y si fallara el primero, su error se perdería."
}
```

Cancelar en el navegador no deshace nada en el servidor, lo decía la lección 5. Un fetcher por envío, con la `key` de su fila.

**`formMethod` en minúsculas.** En el `<fetcher.Form>` escribes `method="delete"`, pero el fetcher lo guarda en mayúsculas. Con `fetcher.formMethod === 'delete'`, el indicador no diría nunca «Cancelando…». En TSX no llegas a probarlo, porque el panel de tipos lo marca:

```text
This comparison appears to be unintentional because the types '"DELETE" | "GET" | "PATCH" | "POST" | "PUT" | undefined' and '"delete"' have no overlap.
```

Es decir: «esta comparación parece un despiste, porque los tipos `"DELETE" | "GET" | …` y `"delete"` no tienen nada en común». Es el mensaje de `tsc` 7.0.2, la versión que instala hoy `npm install -D typescript`, con los tipos de React Router 8.5.0. El orden de la unión no significa nada: TypeScript 7 la escribe siempre ordenada así, y la 6 podía escribirla en otro orden.

**Una `key` de la franja sin el día.** Con `` key={`${pista.id}-${hora}`} ``, al cambiar del miércoles al jueves React conserva cada `Franja` (lección 26 de React), y con ella su fetcher. Comprobado: un «No se pudo reservar» del Frontón a las 20:00 del miércoles siguió debajo del Frontón a las 20:00 del jueves. Con el día en la `key`, cada día tiene sus franjas y sus fetchers.

**Un `shouldRevalidate` que solo compara URL.** En la lección 4 lo viste: en un envío, `currentUrl` y `nextUrl` son la misma. Una función como `({ currentUrl, nextUrl }) => currentUrl.href !== nextUrl.href` en `tus-reservas` devolvería `false` tras cada reserva, y la columna no se enteraría de nada. Por eso `soloCambiaElDia` mira antes `formMethod`.

**Fiarse del cuadrante para decidir si la franja está libre.** Lo que tienes en pantalla puede tener minutos; la `action` pregunta al servidor en el momento de reservar. Y ni siquiera eso es infalible: dos socios que reservan a la vez pueden pasar los dos la comprobación. En un servidor de verdad, la última palabra es de la base de datos.

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Lo que se comparte, en la URL",
      "texto": "El día es un parámetro de búsqueda que lee el loader. Un Form con method=\"get\" lo escribe, Atrás lo deshace, y una key en el desplegable hace que lo siga."
    },
    {
      "titulo": "Lo que no es ir a otra página, con un fetcher",
      "texto": "Reservar y cancelar envían a una action sin navegar: el día se queda donde estaba, y cada franja o fila tiene su propio envío."
    },
    {
      "titulo": "Un fallo esperado se devuelve",
      "texto": "data({ error }, { status: 409 }) llega a fetcher.data de esa franja. Lanzado, se llevaría la página. Devuelto, tampoco revalida nada."
    },
    {
      "titulo": "Lo provisional se lee, no se guarda",
      "texto": "fetcher.formData dice qué se está enviando. La franja lo pinta como «Tuya · reservando…» y, al terminar, vuelve a lo que diga el loader. Si falla, no hay nada que deshacer."
    },
    {
      "titulo": "Cada ruta decide su recarga",
      "texto": "shouldRevalidate con formMethod, actionStatus y defaultShouldRevalidate al final: las pistas no se recargan nunca por una reserva, tus reservas no se recargan por cambiar de día, y el cuadrante sí tras un 409."
    },
    {
      "titulo": "Varios envíos, varios fetchers",
      "texto": "Un fetcher que envía otra vez cancela su envío anterior. useSubmit con navigate: false y fetcherKey crea uno por envío, y la misma key lo comparte con la fila. useFetchers los ve todos."
    }
  ]
}
```

## Retos para seguir practicando

Parte de la app completa. Estos no tienen comprobación automática:

1. **Tus reservas, también al momento.** Que la reserva provisional salga también en «Tus reservas», como «Pádel 2 · miércoles 4 · 21:00 · reservando…». `TusReservas` no tiene el fetcher de la franja, pero `useFetchers()` sí lo ve: busca los que tienen `formAction === '/reservas'` y `formMethod === 'POST'`, y lee pista, día y hora de su `formData`. ¿Qué pasa con la fila provisional si el servidor responde 409?
2. **Cancelar al momento.** Que una fila desaparezca en cuanto pulsas «Cancelar» y vuelva si falla. Piensa en dónde lo decides: en la fila, o en la lista, con `useFetchers`. Prueba con «Fallar la siguiente petición»: la fila tiene que volver con su aviso, y en su sitio.
3. **Recargar el cuadrante solo si hace falta.** Al cancelar una reserva del viernes mientras miras el miércoles, el cuadrante se recarga para nada. Envía el día con la cancelación (un campo oculto, y en «Cancelar todas» un `FormData`) y haz que `revalidarCuadrante` lo compare con el `?dia=` de `currentUrl`. Mira el registro antes y después.
4. **Siempre al día.** Los socios reservan desde otros móviles. Con `useRevalidator` (lección 4), vuelve a cargar la página cuando la pestaña vuelve a estar visible. ¿Qué `loader` se repiten con tus `shouldRevalidate`? ¿Deberían?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Using Fetchers",
      "descripcion": "Enviar sin navegar, el estado de cada fetcher y la interfaz optimista con fetcher.formData, paso a paso.",
      "url": "https://reactrouter.com/how-to/fetchers",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Revalidation Optimization",
      "descripcion": "Qué revalida el router por defecto y cómo afinarlo ruta a ruta con shouldRevalidate.",
      "url": "https://reactrouter.com/how-to/optimize-revalidation",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Network Concurrency Management",
      "descripcion": "Qué pasa con varios envíos y varias revalidaciones a la vez, y quién cancela a quién.",
      "url": "https://reactrouter.com/explanation/concurrency",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useFetchers",
      "descripcion": "Todos los fetchers en marcha, cada uno con su key, para un indicador global.",
      "url": "https://reactrouter.com/api/hooks/useFetchers",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "useSubmit",
      "descripcion": "Enviar desde el código, con navigate: false y fetcherKey para que el envío sea un fetcher.",
      "url": "https://reactrouter.com/api/hooks/useSubmit",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "data",
      "descripcion": "Devolver un valor con su estado HTTP, como el 409 del conflicto.",
      "url": "https://reactrouter.com/api/utils/data",
      "etiqueta": "reactrouter.com"
    }
  ]
}
```
