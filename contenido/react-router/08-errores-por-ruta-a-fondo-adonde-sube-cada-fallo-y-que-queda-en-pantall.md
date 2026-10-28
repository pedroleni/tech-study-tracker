# Errores por ruta a fondo: adónde sube cada fallo y qué queda en pantalla

- **Módulo:** Más allá de cargar y enviar
- **Slug:** `errores-por-ruta-a-fondo-adonde-sube-cada-fallo-y-que-queda-en-pantalla` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [Error Boundaries](https://reactrouter.com/how-to/error-boundary) + [Error Reporting](https://reactrouter.com/how-to/error-reporting) + [useAsyncError](https://reactrouter.com/api/hooks/useAsyncError) + [Status Codes](https://reactrouter.com/how-to/status) — ver `contenido/react-router/TEMARIO.md` #8
- **Requiere:** La lección 99 de React y el módulo 2 de esta ficha (lecciones 2 a 7)

---

## Qué es y para qué sirve

En la lección 99 de React le diste a una ruta su `ErrorBoundary`, lanzaste un 404 desde un `loader` con `throw data(…)` y viste que, en una ruta sin límite propio, el error subía hasta el de la raíz. Para una app de tres pantallas es suficiente. En una de verdad, con rutas anidadas, formularios y datos que llegan tarde, salen preguntas más finas:

- **¿Adónde sube** el error de una ruta que no tiene `ErrorBoundary`, y qué deja en pantalla al llegar?
- **¿Importa dónde falle?** En un `loader`, en una `action`, en el propio componente al pintar o en una promesa que llega después.
- **¿Qué lanzas?** Un `data()` con su estado (401, 403, 404) o un `Error`, y cómo los distingue tu `ErrorBoundary` en TSX.
- **¿Quién se entera?** El usuario ve tu aviso, pero tú no ves nada… hasta que conectas `onError`.

Las respuestas, con la sala de consulta en línea del Archivo Municipal de Tarazona. Tiene tres fondos (actas del concejo, padrones de vecinos, obras y urbanismo) y, en cada uno, sus expedientes. Hay expedientes que no existen, uno reservado por protección de datos, otro que solo pueden ver los investigadores y uno al que le falta un dato que el componente da por hecho: **fallos de todos los tipos en una app pequeña**.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "React Router de verdad en la vista previa",
  "contenido": "Los bloques en vivo ejecutan React Router 8.5.0, con una barra de direcciones encima de la vista previa: escribe una dirección y pulsa «Ir». El código usa createBrowserRouter, como en un proyecto de Vite; dentro de la vista previa funciona con un historial en memoria, y la barra lo indica. Todo lo que cuenta la lección se comprobó también en un proyecto de Vite con React 19.3.1, abierto en Chromium."
}
```

## Adónde sube un error: al límite más cercano

Cuando algo falla en una ruta, React Router busca un `ErrorBoundary` **en esa ruta; si no lo tiene, en su madre; si tampoco, en su abuela**, y así hasta la raíz. El primero que encuentra es el que se pinta. Si ni siquiera la raíz tiene uno, sale el de serie que viste en la lección 99, el de «Unexpected Application Error!».

Estas son las rutas del archivo. Hay dos límites: `ErrorGeneral` en la raíz y `ErrorFondo` en la ruta de cada fondo. La ruta del expediente no tiene ninguno.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas del archivo y sus límites",
  "nodos": [
    {
      "nombre": "Maquetacion",
      "nivel": 0,
      "etiqueta": "ErrorGeneral",
      "nota": "← path: / · cabecera con los fondos y su Outlet"
    },
    {
      "nombre": "Inicio",
      "nivel": 1,
      "etiqueta": "index"
    },
    {
      "nombre": "Fondo",
      "nivel": 1,
      "etiqueta": "loader + ErrorFondo",
      "nota": "← fondos/:fondoId · lista de expedientes y su Outlet"
    },
    {
      "nombre": "Elige un expediente",
      "nivel": 2,
      "etiqueta": "index"
    },
    {
      "nombre": "Expediente",
      "nivel": 2,
      "etiqueta": "loader",
      "nota": "← :expedienteId · sin ErrorBoundary propio"
    }
  ]
}
```

Con la regla de arriba, el reparto es directo:

- Si falla `Expediente` o su `loader`, lo pinta `ErrorFondo`: es el límite más cercano subiendo desde el expediente.
- Si falla `Fondo` o su `loader`, también `ErrorFondo`: está en su propia ruta.
- Si falla la maquetación, o la dirección no encaja con ninguna ruta, `ErrorGeneral`.

Saber **quién** lo pinta es fácil. Lo que cuesta es saber **qué queda alrededor**:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Las rutas del archivo\n{\n  path: '/',\n  Component: Maquetacion, // cabecera con los fondos y <Outlet />\n  ErrorBoundary: ErrorGeneral,\n  children: [\n    {\n      path: 'fondos/:fondoId',\n      loader: cargarFondo,\n      Component: Fondo, // lista de expedientes y <Outlet />\n      ErrorBoundary: ErrorFondo,\n      children: [\n        // Sin ErrorBoundary\n        { path: ':expedienteId', loader: cargarExpediente, Component: Expediente },\n      ],\n    },\n  ],\n}\n\n// Vas a /fondos/actas/9999 y cargarExpediente lanza un 404.\n// ¿Qué hay en pantalla?",
  "opciones": [
    "La cabecera, la lista de expedientes de las actas y, en el hueco del expediente, lo que pinta ErrorFondo",
    "La cabecera y lo que pinta ErrorFondo: la lista de expedientes también desaparece",
    "Solo lo que pinta ErrorGeneral: como la ruta del expediente no tiene límite, el error llega hasta arriba",
    "La cabecera y la lista, sin ningún aviso: una ruta sin ErrorBoundary no enseña sus errores"
  ],
  "correcta": 1,
  "explicacion": "ErrorFondo es el límite de la ruta del fondo, y lo que sustituye es el componente de esa ruta, Fondo, con su lista y su Outlet. La cabecera es de la raíz, que está por encima, y no se entera. Para que la lista se quede, el límite tiene que estar en la ruta del expediente. Compruébalo en el bloque de abajo con /fondos/actas/9999."
}
```

Ahora en vivo. Los límites de este bloque dicen quién los pinta y qué les ha llegado, para que veas el recorrido de cada error. En una app de verdad no enseñarías esos detalles.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El archivo, con dos límites",
  "consigna": "Escribe en la barra y pulsa «Ir»: /fondos/actas/9999 (un expediente que no existe), /fondos/inventado (un fondo que no existe) y /otra (una dirección sin ruta). Después abre el «Padrón de vecinos de 1857», que falla al pintar. Por último, pulsa «Fallar la siguiente petición» en el panel de red y abre un expediente. El recuadro rojo dice qué límite lo pinta y qué le ha llegado.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cargarExpediente, cargarFondo } from './cargas'\nimport { ErrorFondo, ErrorGeneral } from './errores'\nimport { Expediente, Fondo, Inicio, Maquetacion } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo el archivo…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        path: 'fondos/:fondoId',\n        loader: cargarFondo,\n        Component: Fondo,\n        ErrorBoundary: ErrorFondo,\n        children: [\n          { index: true, element: <p>Elige un expediente.</p> },\n          // Sin ErrorBoundary propio: si falla, el error sube\n          { path: ':expedienteId', loader: cargarExpediente, Component: Expediente },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "cargas.ts",
      "codigo": "import { data, type LoaderFunctionArgs } from 'react-router'\n\nexport type Fondo = { id: string; nombre: string }\nexport type Expediente = {\n  id: number\n  fondo: string\n  titulo: string\n  signatura: string\n  resumen?: string\n  acceso?: 'reservado' | 'investigadores'\n  hasta?: number\n}\n\nasync function pedir<T>(url: string, signal: AbortSignal, queFalta: string): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data(`${queFalta} no está en el archivo`, { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport async function cargarFondo({ params, request }: LoaderFunctionArgs) {\n  const [fondo, expedientes] = await Promise.all([\n    pedir<Fondo>(`/api/fondos/${params.fondoId}`, request.signal, 'Ese fondo'),\n    pedir<Expediente[]>('/api/expedientes', request.signal, 'La lista'),\n  ])\n  return { fondo, expedientes: expedientes.filter((e) => e.fondo === fondo.id) }\n}\n\nexport async function cargarExpediente({ params, request }: LoaderFunctionArgs) {\n  const expediente = await pedir<Expediente>(\n    `/api/expedientes/${params.expedienteId}`,\n    request.signal,\n    'Ese expediente',\n  )\n  if (expediente.fondo !== params.fondoId) {\n    throw data('Ese expediente no está en este fondo', { status: 404 })\n  }\n  if (expediente.acceso === 'investigadores') {\n    throw data('Solo pueden consultarlo investigadores acreditados', { status: 401 })\n  }\n  if (expediente.acceso === 'reservado') {\n    throw data({ hasta: expediente.hasta }, { status: 403 })\n  }\n  return { expediente }\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Link, NavLink, Outlet, useLoaderData } from 'react-router'\nimport type { cargarExpediente, cargarFondo } from './cargas'\n\nexport function Maquetacion() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Archivo Municipal de Tarazona</p>\n        <nav aria-label=\"Fondos\">\n          <NavLink to=\"/fondos/actas\">Actas</NavLink>\n          <NavLink to=\"/fondos/padrones\">Padrones</NavLink>\n          <NavLink to=\"/fondos/obras\">Obras</NavLink>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Inicio() {\n  return <p>Elige un fondo para ver sus expedientes.</p>\n}\n\nexport function Fondo() {\n  const { fondo, expedientes } = useLoaderData<typeof cargarFondo>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{fondo.nombre}</h1>\n        <ul>\n          {expedientes.map((expediente) => (\n            <li key={expediente.id}>\n              <Link to={String(expediente.id)}>{expediente.titulo}</Link>\n            </li>\n          ))}\n        </ul>\n      </section>\n      <Outlet />\n    </div>\n  )\n}\n\nexport function Expediente() {\n  const { expediente } = useLoaderData<typeof cargarExpediente>()\n\n  return (\n    <article>\n      <h2>{expediente.titulo}</h2>\n      {/* El tipo dice que siempre hay signatura; el servidor no siempre la manda */}\n      <p className=\"signatura\">Signatura {expediente.signatura.toUpperCase()}</p>\n      <p>{expediente.resumen}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "errores.tsx",
      "codigo": "import { isRouteErrorResponse, Link, useRouteError } from 'react-router'\n\n// Qué ha llegado al ErrorBoundary, contado para la demostración\nfunction describir(error: unknown) {\n  if (isRouteErrorResponse(error)) return `Respuesta ${error.status}: ${JSON.stringify(error.data)}`\n  if (error instanceof Error) return `Error: ${error.message}`\n  return `Otra cosa: ${String(error)}`\n}\n\n// En la raíz: sustituye a la maquetación, así que trae su propia cabecera\nexport function ErrorGeneral() {\n  const error = useRouteError()\n\n  return (\n    <div className=\"limite limite-general\">\n      <p className=\"logo\">Archivo Municipal de Tarazona</p>\n      <h1>Algo ha fallado en el archivo</h1>\n      <p className=\"quien\">Lo pinta ErrorGeneral · {describir(error)}</p>\n      <Link to=\"/\">Volver al inicio</Link>\n    </div>\n  )\n}\n\nexport function ErrorFondo() {\n  const error = useRouteError()\n\n  return (\n    <section className=\"limite\">\n      <h1>No se ha podido abrir</h1>\n      <p className=\"quien\">Lo pinta ErrorFondo · {describir(error)}</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1.5rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #7c2d12;\n  background: #fdf6e3;\n}\n\n.logo {\n  margin: 0;\n  font-family: Georgia, serif;\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  gap: 0.75rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #7c2d12;\n  font-weight: 700;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 2rem;\n}\n\nh1 {\n  margin: 0.5rem 0;\n  font-size: 1.2rem;\n}\n\nh2 {\n  margin: 0.5rem 0;\n  font-size: 1.05rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.signatura {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.limite {\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n}\n\n.limite-general {\n  margin: 1rem;\n}\n\n.quien {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  color: #7f1d1d;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  color: #7c2d12;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/fondos/actas",
  "mostrarConsola": false,
  "api": {
    "fondos": [
      {
        "id": "actas",
        "nombre": "Actas del concejo"
      },
      {
        "id": "padrones",
        "nombre": "Padrones de vecinos"
      },
      {
        "id": "obras",
        "nombre": "Obras y urbanismo"
      }
    ],
    "expedientes": [
      {
        "id": 1567,
        "fondo": "actas",
        "titulo": "Libro de actas de 1567",
        "signatura": "ac-12",
        "resumen": "Acuerdos del concejo sobre el puente del Queiles."
      },
      {
        "id": 1890,
        "fondo": "actas",
        "titulo": "Libro de actas de 1890",
        "signatura": "ac-87",
        "resumen": "Llegada del ferrocarril y nuevas farolas en la plaza."
      },
      {
        "id": 1857,
        "fondo": "padrones",
        "titulo": "Padrón de vecinos de 1857",
        "resumen": "Casa por casa, con oficios y edades."
      },
      {
        "id": 1991,
        "fondo": "padrones",
        "titulo": "Padrón de habitantes de 1991",
        "signatura": "pa-40",
        "acceso": "reservado",
        "hasta": 2041
      },
      {
        "id": 1923,
        "fondo": "obras",
        "titulo": "Planos del mercado de abastos",
        "signatura": "ob-03",
        "acceso": "investigadores"
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

Lo que acabas de ver es la regla de esta lección: **un límite sustituye al componente de su ruta, y con él a todo lo que cuelga de su `Outlet`**. Lo que hay por encima se pinta como siempre, con sus datos.

- `/fondos/actas/9999` y `/fondos/inventado` acaban igual, aunque el primero falla en el `loader` del expediente y el segundo en el del fondo: la cabecera arriba y `ErrorFondo` en lugar de la lista.
- `/otra` no encaja con ninguna ruta, así que el propio router lanza un 404 en la raíz, y `ErrorGeneral` sustituye a toda la maquetación. Por eso `ErrorGeneral` trae su propia cabecera: **el límite de la raíz no puede contar con la maquetación, porque ocupa su sitio**.
- El padrón de 1857 y el fallo del servidor llegan como `Error`, no como respuesta. Enseguida verás por qué importa.

Si quieres que la lista se quede cuando falla un expediente, el límite va en la ruta del expediente:

```tsx
{ path: ':expedienteId', loader: cargarExpediente, Component: Expediente, ErrorBoundary: ErrorExpediente },
```

Lo harás en el primer ejercicio. **Cada `ErrorBoundary` se pone en el nivel cuya pantalla estás dispuesto a perder.**

## Qué queda en pantalla, y qué datos tiene el límite

En el bloque has visto la idea; estas son las reglas completas, comprobadas con React Router 8.5.0:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Por encima del límite, todo sigue",
      "texto": "Las rutas que están por encima del límite se pintan con normalidad, con sus componentes y sus datos. La cabecera del archivo no se entera de que un expediente ha fallado."
    },
    {
      "titulo": "El límite ocupa el sitio de su ruta",
      "texto": "El ErrorBoundary se pinta donde iría el componente de su ruta, dentro del Outlet de la madre. Lo que colgaba de ese componente, sus rutas hijas incluidas, desaparece."
    },
    {
      "titulo": "Dentro del límite, los datos que sí llegaron",
      "texto": "Si el error vino de una hija, el loader de la ruta del límite funcionó y sus datos están: useLoaderData y useRouteLoaderData los devuelven. Si el que falló fue el loader de la propia ruta, no hay datos: useLoaderData devuelve undefined."
    },
    {
      "titulo": "Un error por límite",
      "texto": "Si fallan dos loader y los dos errores suben al mismo límite, ese límite enseña uno solo. Justo debajo verás cuál."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Abres /fondos/actas/1567 y fallan a la vez los dos loader:\n//   cargarFondo       lanza new Error('No responde el fondo')\n//   cargarExpediente  lanza new Error('No responde el expediente')\n// El expediente no tiene ErrorBoundary: los dos errores suben a ErrorFondo.\n\nfunction ErrorFondo() {\n  const error = useRouteError()\n  return <p>{error instanceof Error ? error.message : 'Otro error'}</p>\n}\n\n// ¿Qué texto pinta ErrorFondo?",
  "opciones": [
    "«No responde el expediente»: gana el último que falla",
    "«No responde el fondo»: gana el de la ruta más alta",
    "Los dos, uno detrás de otro",
    "Depende de cuál de las dos peticiones conteste antes"
  ],
  "correcta": 1,
  "explicacion": "Los dos loader corren a la vez, pero el router reparte los errores cuando han terminado todos: recorre las rutas de arriba abajo y, si un límite ya tiene error, no lo cambia. Se queda el del fondo aunque el expediente fallara antes (comprobado con la 8.5.0). El otro se descarta: ni siquiera llega a onError, que verás al final."
}
```

La tercera regla sirve para hacer un límite más útil. Este `ErrorFondo` enseña el nombre del fondo cuando el error vino de un expediente, distingue lo que no existe de lo que ha fallado y deja reintentar:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { isRouteErrorResponse, useRevalidator, useRouteError, useRouteLoaderData } from 'react-router'\nimport type { cargarFondo } from './cargas'\n\n// En la ruta: { id: 'fondo', path: 'fondos/:fondoId', loader: cargarFondo, Component: Fondo, ErrorBoundary: ErrorFondo, … }\nexport function ErrorFondo() {\n  const error = useRouteError()\n  const datos = useRouteLoaderData<typeof cargarFondo>('fondo')\n  const revalidator = useRevalidator()\n  const noExiste = isRouteErrorResponse(error) && error.status === 404\n\n  return (\n    <section className=\"limite\">\n      <h1>{datos ? datos.fondo.nombre : 'Fondo sin abrir'}</h1>\n      {noExiste ? (\n        <p>Eso no está en el archivo.</p>\n      ) : (\n        <>\n          <p role=\"alert\">No hemos podido abrirlo.</p>\n          <button onClick={() => revalidator.revalidate()} disabled={revalidator.state === 'loading'}>\n            Reintentar\n          </button>\n        </>\n      )}\n    </section>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "useRouteLoaderData<typeof cargarFondo>('fondo')",
      "nota": "Los datos de la ruta cuyo id es «fondo». Hay que darle ese id a la ruta: si no, React Router le pone uno según su posición, como «0-1». Su tipo incluye undefined, y acierta: si el que falló fue cargarFondo, no hay datos."
    },
    {
      "fragmento": "datos ? datos.fondo.nombre : 'Fondo sin abrir'",
      "nota": "Con un expediente roto, el loader del fondo sí funcionó y su nombre sigue disponible. useLoaderData<typeof cargarFondo>() también lo devolvería, pero su tipo no incluye undefined: TypeScript no te avisaría del caso sin datos."
    },
    {
      "fragmento": "isRouteErrorResponse(error) && error.status === 404",
      "nota": "Lo que no existe no se arregla reintentando: ni alerta ni botón."
    },
    {
      "fragmento": "<p role=\"alert\">No hemos podido abrirlo.</p>",
      "nota": "Un fallo sí se anuncia: con role=\"alert\", el lector de pantalla lo lee al aparecer (lección 37 de React)."
    },
    {
      "fragmento": "revalidator.revalidate()",
      "nota": "Vuelve a ejecutar los loader de la página. Comprobado en la vista previa con «Fallar la siguiente petición»: si esta vez responden bien, el límite se retira solo y vuelve el fondo, o el expediente."
    },
    {
      "fragmento": "disabled={revalidator.state === 'loading'}",
      "nota": "Mientras se repiten los loader, el botón no admite otro clic."
    }
  ]
}
```

## Cuatro sitios donde puede fallar una ruta

El límite de una ruta recoge lo que se lanza en ella, o en una hija sin límite propio, desde cuatro sitios. Dos ya los has visto en el archivo.

### En un `loader`

El caso de la lección 99 y de `/fondos/actas/9999`. Un detalle que importará al final: **el error de un `loader` no pasa por React**. React Router lo captura al ejecutar el `loader` y pinta el límite directamente, sin que nada se lance mientras React renderiza.

### En una `action`

Un `<Form method="post">` envía a la `action` de su ruta (lección 3). Si la `action` lanza, el error sube desde esa ruta, igual que el de su `loader`, y el límite sustituye también al formulario: **lo que el usuario había escrito se pierde**. Por eso los errores de validación se devuelven y solo se lanza lo que de verdad impide seguir. En el archivo, pedir una reproducción de un expediente:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { data, redirect, type ActionFunctionArgs } from 'react-router'\n\nexport async function pedirReproduccion({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const correo = String(formData.get('correo') ?? '').trim()\n\n  // Un dato mal escrito: se devuelve y el formulario sigue en pantalla\n  if (!correo.includes('@')) {\n    return data({ error: 'Escribe un correo válido.' }, { status: 400 })\n  }\n\n  const respuesta = await fetch('/api/reproducciones', {\n    method: 'POST',\n    body: JSON.stringify({ expediente: Number(params.expedienteId), correo }),\n  })\n  // El archivo no permite copias de este expediente: se lanza\n  if (respuesta.status === 403) {\n    throw data('Este expediente no admite reproducciones', { status: 403 })\n  }\n  // Cualquier otro fallo del servidor: un Error\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n\n  return redirect(`/fondos/${params.fondoId}/${params.expedienteId}?pedida=1`)\n}",
  "anotaciones": [
    {
      "fragmento": "return data({ error: 'Escribe un correo válido.' }, { status: 400 })",
      "nota": "Devuelto: no es un fallo, es una respuesta para el formulario, que la lee con useActionData y conserva lo escrito (lección 3)."
    },
    {
      "fragmento": "throw data('Este expediente no admite reproducciones', { status: 403 })",
      "nota": "Lanzado: corta la action y el error sube al límite más cercano desde la ruta del expediente, como el de su loader. En el archivo, ErrorFondo; el formulario desaparece."
    },
    {
      "fragmento": "if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)",
      "nota": "Lo inesperado, como un Error. Sube al mismo límite."
    },
    {
      "fragmento": "return redirect(`/fondos/${params.fondoId}/${params.expedienteId}?pedida=1`)",
      "nota": "Si todo va bien, de vuelta a la ficha. Nada nuevo."
    }
  ]
}
```

Después de un envío, el router vuelve a ejecutar los `loader` de la página (lección 4). ¿También si la `action` ha fallado?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// raíz             loader: cargarSesion\n//  └ fondos        loader: cargarFondos      (sin ErrorBoundary)\n//     └ fondo      loader: cargarFondo       ErrorBoundary: ErrorFondo\n//        └ expediente  loader y action       (sin ErrorBoundary)\n\n// Estás en un expediente, envías su formulario y la action lanza:\nthrow new Error('Se ha caído el servidor')\n\n// ErrorFondo sustituye al fondo. ¿Qué loader se vuelven a ejecutar?",
  "opciones": [
    "Los cuatro: después de un envío, el router siempre vuelve a cargar la página",
    "Ninguno: si la action falla, no hay nada que actualizar",
    "cargarSesion y cargarFondos: los de las rutas que quedan por encima de ErrorFondo",
    "Solo cargarExpediente, el de la ruta que recibió el envío"
  ],
  "correcta": 2,
  "explicacion": "Comprobado con la 8.5.0: se repitieron los dos de arriba, que siguen en pantalla y pueden haber cambiado con el envío. El del fondo y el del expediente, no: en su sitio va ErrorFondo, y sus datos no se van a pintar. Si la action devuelve el error en vez de lanzarlo, con un estado de 400 o más, no se repite ninguno (lección 4)."
}
```

### Al pintar

Lo de la lección 53 de React, con el límite de la ruta en lugar del tuyo: **un componente que lanza al renderizar acaba en el `ErrorBoundary` de ruta más cercano**. En el archivo lo provoca el padrón de 1857. El tipo `Expediente` dice que `signatura` es un `string`, el servidor no la manda y `expediente.signatura.toUpperCase()` lanza un `TypeError`. TypeScript no podía saberlo: los tipos describen lo que esperas, no lo que llega. Validar lo que llega es la lección 61 de React, con Zod.

Dos diferencias con un fallo en el `loader`, comprobadas:

- **Esta vez React sí se entera**, porque el error ocurre mientras renderiza. Escribe en la consola su aviso, que empieza por `The above error occurred in the <Expediente> component` («el error de arriba ocurrió en el componente Expediente»), y llama a la opción `onCaughtError` de `createRoot` (lección 53 de React).
- **Los manejadores siguen fuera**, como ya sabías: un `onClick` que lanza no llega a ningún límite y no cambia nada en pantalla.

### En una promesa que llega por *streaming*

La lección 9 enseña a devolver desde un `loader` una promesa sin `await`, para pintar ya lo urgente y lo secundario cuando llegue, con `<Suspense>` y `<Await>`. De sus errores, aquí solo lo justo: **qué pasa si esa promesa se rechaza cuando la página ya está en pantalla**. Las notas del archivero de cada expediente, que tardan:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { Suspense } from 'react'\nimport { Await, useAsyncError } from 'react-router'\n\nfunction NotasDelArchivero({ notas }: { notas: string[] }) {\n  return <ul>{notas.map((nota) => <li key={nota}>{nota}</li>)}</ul>\n}\n\n// En el loader del expediente: lo urgente, con await; las notas, sin await\n// return { expediente, notas: pedirNotas(params.expedienteId) }\n\nexport function Notas({ notas }: { notas: Promise<string[]> }) {\n  return (\n    <Suspense fallback={<p>Cargando las notas del archivero…</p>}>\n      <Await resolve={notas} errorElement={<ErrorNotas />}>\n        {(lista) => <NotasDelArchivero notas={lista} />}\n      </Await>\n    </Suspense>\n  )\n}\n\nfunction ErrorNotas() {\n  const error = useAsyncError()\n  return (\n    <p role=\"alert\">\n      Las notas no han llegado: {error instanceof Error ? error.message : 'error desconocido'}\n    </p>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "// return { expediente, notas: pedirNotas(params.expedienteId) }",
      "nota": "El loader devuelve el expediente ya cargado y la promesa de las notas, sin esperarla. La página se pinta en cuanto llega el expediente."
    },
    {
      "fragmento": "errorElement={<ErrorNotas />}",
      "nota": "Si la promesa se rechaza, Await pinta esto en su sitio. Comprobado: el resto del expediente sigue en pantalla."
    },
    {
      "fragmento": "const error = useAsyncError()",
      "nota": "El motivo del rechazo, para el errorElement. Como useRouteError, devuelve unknown."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Las mismas notas, sin errorElement\n<Suspense fallback={<p>Cargando las notas del archivero…</p>}>\n  <Await resolve={notas}>\n    {(lista) => <NotasDelArchivero notas={lista} />}\n  </Await>\n</Suspense>\n\n// El expediente ya está en pantalla y, 400 ms después,\n// la promesa de las notas se rechaza.\n// La ruta del expediente no tiene ErrorBoundary. ¿Qué pasa?",
  "opciones": [
    "Se queda el «Cargando las notas del archivero…» para siempre",
    "Desaparece solo el hueco de las notas; el resto del expediente sigue",
    "El error sube a ErrorFondo, que sustituye al fondo entero: el expediente que estabas leyendo desaparece",
    "Nada visible: el rechazo solo sale en la consola"
  ],
  "correcta": 2,
  "explicacion": "Sin errorElement, Await relanza el rechazo al pintar y lo recoge el ErrorBoundary de ruta más cercano, como cualquier error de render (comprobado en Chromium con la 8.5.0). Pasa lo mismo con use() de React si no hay un límite alrededor. Un dato secundario se lleva por delante el principal: ponle siempre su errorElement."
}
```

## Un `data()` lanzado o un `Error`: 401, 403, 404 y 500

Los dos acaban en el mismo límite, pero no dicen lo mismo:

- **`throw data(valor, { status })` es una respuesta prevista**: «esto no existe», «esto no puedes verlo». El límite la reconoce con `isRouteErrorResponse` y lee `status` y `data`, que es el valor que le pasaste.
- **Un `Error` es un fallo**: el tuyo, el `TypeError` de un componente o el de un `fetch` que no responde. Algo que no tenía que pasar.

Y cada estado le dice al usuario, y a ti, una cosa distinta:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "401 · No sabemos quién eres",
      "texto": "No hay sesión, o ha caducado. En el archivo, los planos del mercado de abastos solo los ven investigadores con carné. Lo habitual es mandar a iniciar sesión con throw redirect('/entrar?volver=…'), como hará el middleware de la lección 10. Lanzar un 401 sirve cuando prefieres explicarlo en la propia página."
    },
    {
      "titulo": "403 · Sabemos quién eres, pero no puedes",
      "texto": "Con sesión o sin ella, eso no es para ti: el padrón de 1991 está reservado por protección de datos hasta 2041. Iniciar sesión no lo arregla, así que no mandes a entrar."
    },
    {
      "titulo": "404 · No existe",
      "texto": "Un expediente que nunca existió, un enlace viejo, una dirección mal escrita. Ni se arregla reintentando ni es un fallo del servidor."
    },
    {
      "titulo": "500 · Algo se ha roto",
      "texto": "Un servidor caído, un dato que no llega como esperabas. No lo disfraces con data(): lanza un Error o deja que el fallo suba solo. Es lo único que merece un «Reintentar» y un aviso para ti."
    },
    {
      "titulo": "400 · Datos mal escritos",
      "texto": "No se lanza: se devuelve con data({ errores }, { status: 400 }), para que el formulario siga en pantalla con lo escrito (lección 3)."
    }
  ]
}
```

En la lección 99 de React apareció una trampa: un `data()` con estado 404 no trae el `statusText` «Not Found». En la 8.5.0 sigue igual, y no solo con el 404:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En el loader del padrón reservado:\nthrow data({ hasta: 2041 }, { status: 403 })\n\n// Y, aparte, la dirección /otra, que no encaja con ninguna ruta.\n\n// En los dos casos, el ErrorBoundary pinta:\n<h2>{error.status} {error.statusText}</h2>\n\n// ¿Qué dos títulos salen?",
  "opciones": [
    "«403 Forbidden» y «404 Not Found»",
    "«403 Internal Server Error» y «404 Not Found»",
    "«403 Internal Server Error» y «404 Internal Server Error»",
    "«403» a secas y «404 Not Found»"
  ],
  "correcta": 1,
  "explicacion": "data() no deduce el texto del número: si no le pasas statusText, pone «Internal Server Error» con cualquier estado (comprobado con 401, 403 y 404). El 404 de una dirección sin ruta lo lanza el propio router, y ese sí trae «Not Found». Con un new Response(…, { status: 404 }), el texto sale vacío. Decide siempre con error.status."
}
```

### En TSX: de `unknown` a algo que puedas leer

`useRouteError()` devuelve `unknown`: en JavaScript se puede lanzar cualquier cosa, y el router no sabe qué lanzaste. TypeScript no te deja leer nada sin estrecharlo antes. Si escribes `error.status` directamente, el panel de errores de tipos dice:

```text
'error' is of type 'unknown'.
```

Es decir: «error es de tipo unknown». Hay tres casos, y un límite general los cubre todos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { isRouteErrorResponse, Link, useRouteError } from 'react-router'\n\nexport function ErrorGeneral() {\n  const error = useRouteError()\n\n  let titulo = 'Algo ha fallado en el archivo'\n  if (isRouteErrorResponse(error)) {\n    // Una respuesta lanzada con data(), o el 404 de una dirección sin ruta\n    titulo = error.status === 404 ? 'Esa página no existe' : `Error ${error.status}`\n  } else if (error instanceof Error) {\n    // Un fallo de verdad: el mensaje es para ti, no para quien consulta el archivo\n    titulo = 'El archivo no responde'\n  }\n  // Cualquier otra cosa (un throw 'texto') se queda con el título por defecto\n\n  return (\n    <div className=\"limite limite-general\">\n      <p className=\"logo\">Archivo Municipal de Tarazona</p>\n      <h1>{titulo}</h1>\n      <Link to=\"/\">Volver al inicio</Link>\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const error = useRouteError()",
      "nota": "unknown. En el modo datos el límite no recibe props: el error se lee con este Hook (lección 99)."
    },
    {
      "fragmento": "isRouteErrorResponse(error)",
      "nota": "Estrecha el tipo a ErrorResponse, con status, statusText y data. Ojo: data es any, así que TypeScript no sabe qué metiste en data(). Lo llevarás al fondo en la lección 15."
    },
    {
      "fragmento": "error instanceof Error",
      "nota": "Un fallo de verdad: el de un loader, el TypeError de un componente, el de un fetch que no responde."
    },
    {
      "fragmento": "// Cualquier otra cosa (un throw 'texto') se queda con el título por defecto",
      "nota": "También llega lo que no es ninguno de los dos: un throw 'texto' llega al límite tal cual, como texto (comprobado)."
    },
    {
      "fragmento": "titulo = 'El archivo no responde'",
      "nota": "El mensaje del Error es para ti, no para quien consulta el archivo. Cómo te llega a ti, en la sección siguiente."
    }
  ]
}
```

## Enterarte de los fallos: `onError` de `RouterProvider`

Hasta aquí, el usuario ve un aviso digno. ¿Y tú? En la lección 53 de React, una función `informar` mandaba a tu servidor los errores que React te daba en las opciones de `createRoot`. Con el router, eso no basta:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// main.tsx, con lo de la lección 53 de React\ncreateRoot(document.getElementById('root')!, {\n  onCaughtError: (error) => informar('capturado', error),\n}).render(<RouterProvider router={router} />)\n\n// cargarFondo lanza new Error('No responde el fondo')\n// y ErrorFondo lo enseña en pantalla.\n\n// ¿Qué sale en la consola, y qué le llega a informar?",
  "opciones": [
    "El error en rojo en la consola, e informar lo recibe",
    "Nada en la consola, pero informar lo recibe: para eso está onCaughtError",
    "Nada en ningún sitio: ni la consola ni informar se enteran",
    "El aviso de React «The above error occurred…», e informar lo recibe"
  ],
  "correcta": 2,
  "explicacion": "El error de un loader no ocurre al pintar: React Router lo captura al ejecutar el loader y se lo da a su límite. React no ve ninguna excepción, así que onCaughtError no se entera, y el router no escribe nada en la consola (comprobado en Chromium con la 8.5.0). Un fallo al pintar sí llegaría a onCaughtError. Para todo lo demás está onError."
}
```

**`RouterProvider` acepta una prop `onError`: una función a la que el router llama una vez por cada error que recoge**, venga de un `loader`, de una `action`, del render o de un `Await` (y del middleware, que verás en la lección 10). Es el sitio de tu `informar`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport { createBrowserRouter, isRouteErrorResponse, type ClientOnErrorFunction } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { rutas } from './rutas'\n\nconst router = createBrowserRouter(rutas)\n\nconst informar: ClientOnErrorFunction = (error, { location, params, pattern, errorInfo }) => {\n  // Las respuestas que lanzas a propósito (404, 403…) no son fallos\n  if (isRouteErrorResponse(error) && error.status < 500) return\n\n  fetch('/api/errores', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      mensaje: error instanceof Error ? error.message : String(error),\n      ruta: pattern,\n      direccion: location.pathname + location.search,\n      parametros: params,\n      pila: errorInfo?.componentStack ?? null,\n    }),\n  }).catch(() => {}) // si ni esto llega, no hay nada más que hacer\n  console.error(error)\n}\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <RouterProvider router={router} onError={informar} />\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "type ClientOnErrorFunction",
      "nota": "El tipo de la función, exportado por react-router. Recibe el error, unknown como siempre, y un objeto con location, params, pattern y errorInfo."
    },
    {
      "fragmento": "if (isRouteErrorResponse(error) && error.status < 500) return",
      "nota": "onError recibe todo lo que el router recoge, también tus 404 y tus 403 (comprobado). Son respuestas previstas, no fallos que arreglar: si los mandas, tapan los de verdad."
    },
    {
      "fragmento": "ruta: pattern",
      "nota": "El patrón de la ruta, como «/fondos/:fondoId/:expedienteId»: junta en uno los fallos de todos los expedientes. Con una dirección sin ruta llega «/» (comprobado)."
    },
    {
      "fragmento": "parametros: params",
      "nota": "Todos los parámetros de la dirección, como { fondoId: 'actas', expedienteId: '1890' }."
    },
    {
      "fragmento": "pila: errorInfo?.componentStack ?? null",
      "nota": "errorInfo solo llega con los fallos al pintar, y trae la pila de componentes de la lección 64 de React. Con un loader, una action o un Await con errorElement, no llega (comprobado)."
    },
    {
      "fragmento": "console.error(error)",
      "nota": "La documentación recomienda escribirlo también en la consola. Con onError, React Router deja de escribir su propio aviso de los fallos al pintar (comprobado)."
    },
    {
      "fragmento": "<RouterProvider router={router} onError={informar} />",
      "nota": "Una vez por error, también con StrictMode y aunque el límite se pinte varias veces (comprobado). Hay una excepción, y está en los errores típicos."
    }
  ]
}
```

¿Y las opciones de `createRoot`? Siguen sirviendo para lo que pasa fuera de las rutas, pero un fallo al pintar dentro de una ruta te llegaría dos veces, por `onCaughtError` y por `onError` (comprobado). Para los errores de las rutas, quédate con `onError`.

En vivo, el mismo archivo con un `onError` que escribe en la consola:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El archivo, ahora con onError",
  "consigna": "Abre la consola y repite los fallos: /fondos/actas/9999, /otra, el «Padrón de vecinos de 1857» y un expediente después de «Fallar la siguiente petición». Cada uno deja una línea de onError con su dirección y el patrón de su ruta. La del padrón dice además «al pintar», y antes sale el aviso de React. Después quita onError={informar} y repítelo: los fallos de los loader ya no dejan ningún rastro.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, type ClientOnErrorFunction } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cargarExpediente, cargarFondo } from './cargas'\nimport { ErrorFondo, ErrorGeneral } from './errores'\nimport { Expediente, Fondo, Inicio, Maquetacion } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo el archivo…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        path: 'fondos/:fondoId',\n        loader: cargarFondo,\n        Component: Fondo,\n        ErrorBoundary: ErrorFondo,\n        children: [\n          { index: true, element: <p>Elige un expediente.</p> },\n          { path: ':expedienteId', loader: cargarExpediente, Component: Expediente },\n        ],\n      },\n    ],\n  },\n])\n\n// Se llama una vez por cada error que el router recoge\nconst informar: ClientOnErrorFunction = (error, { location, pattern, errorInfo }) => {\n  const que = isRouteErrorResponse(error)\n    ? `respuesta ${error.status}`\n    : error instanceof Error\n      ? error.message\n      : String(error)\n  console.warn(`onError · ${location.pathname} · ${pattern} · ${que}${errorInfo ? ' · al pintar' : ''}`)\n}\n\nexport default function App() {\n  return <RouterProvider router={router} onError={informar} />\n}\n"
    },
    {
      "nombre": "cargas.ts",
      "codigo": "import { data, type LoaderFunctionArgs } from 'react-router'\n\nexport type Fondo = { id: string; nombre: string }\nexport type Expediente = {\n  id: number\n  fondo: string\n  titulo: string\n  signatura: string\n  resumen?: string\n  acceso?: 'reservado' | 'investigadores'\n  hasta?: number\n}\n\nasync function pedir<T>(url: string, signal: AbortSignal, queFalta: string): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data(`${queFalta} no está en el archivo`, { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport async function cargarFondo({ params, request }: LoaderFunctionArgs) {\n  const [fondo, expedientes] = await Promise.all([\n    pedir<Fondo>(`/api/fondos/${params.fondoId}`, request.signal, 'Ese fondo'),\n    pedir<Expediente[]>('/api/expedientes', request.signal, 'La lista'),\n  ])\n  return { fondo, expedientes: expedientes.filter((e) => e.fondo === fondo.id) }\n}\n\nexport async function cargarExpediente({ params, request }: LoaderFunctionArgs) {\n  const expediente = await pedir<Expediente>(\n    `/api/expedientes/${params.expedienteId}`,\n    request.signal,\n    'Ese expediente',\n  )\n  if (expediente.fondo !== params.fondoId) {\n    throw data('Ese expediente no está en este fondo', { status: 404 })\n  }\n  if (expediente.acceso === 'investigadores') {\n    throw data('Solo pueden consultarlo investigadores acreditados', { status: 401 })\n  }\n  if (expediente.acceso === 'reservado') {\n    throw data({ hasta: expediente.hasta }, { status: 403 })\n  }\n  return { expediente }\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Link, NavLink, Outlet, useLoaderData } from 'react-router'\nimport type { cargarExpediente, cargarFondo } from './cargas'\n\nexport function Maquetacion() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Archivo Municipal de Tarazona</p>\n        <nav aria-label=\"Fondos\">\n          <NavLink to=\"/fondos/actas\">Actas</NavLink>\n          <NavLink to=\"/fondos/padrones\">Padrones</NavLink>\n          <NavLink to=\"/fondos/obras\">Obras</NavLink>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Inicio() {\n  return <p>Elige un fondo para ver sus expedientes.</p>\n}\n\nexport function Fondo() {\n  const { fondo, expedientes } = useLoaderData<typeof cargarFondo>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{fondo.nombre}</h1>\n        <ul>\n          {expedientes.map((expediente) => (\n            <li key={expediente.id}>\n              <Link to={String(expediente.id)}>{expediente.titulo}</Link>\n            </li>\n          ))}\n        </ul>\n      </section>\n      <Outlet />\n    </div>\n  )\n}\n\nexport function Expediente() {\n  const { expediente } = useLoaderData<typeof cargarExpediente>()\n\n  return (\n    <article>\n      <h2>{expediente.titulo}</h2>\n      {/* El tipo dice que siempre hay signatura; el servidor no siempre la manda */}\n      <p className=\"signatura\">Signatura {expediente.signatura.toUpperCase()}</p>\n      <p>{expediente.resumen}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "errores.tsx",
      "codigo": "import { isRouteErrorResponse, Link, useRouteError } from 'react-router'\n\n// Qué ha llegado al ErrorBoundary, contado para la demostración\nfunction describir(error: unknown) {\n  if (isRouteErrorResponse(error)) return `Respuesta ${error.status}: ${JSON.stringify(error.data)}`\n  if (error instanceof Error) return `Error: ${error.message}`\n  return `Otra cosa: ${String(error)}`\n}\n\n// En la raíz: sustituye a la maquetación, así que trae su propia cabecera\nexport function ErrorGeneral() {\n  const error = useRouteError()\n\n  return (\n    <div className=\"limite limite-general\">\n      <p className=\"logo\">Archivo Municipal de Tarazona</p>\n      <h1>Algo ha fallado en el archivo</h1>\n      <p className=\"quien\">Lo pinta ErrorGeneral · {describir(error)}</p>\n      <Link to=\"/\">Volver al inicio</Link>\n    </div>\n  )\n}\n\nexport function ErrorFondo() {\n  const error = useRouteError()\n\n  return (\n    <section className=\"limite\">\n      <h1>No se ha podido abrir</h1>\n      <p className=\"quien\">Lo pinta ErrorFondo · {describir(error)}</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1.5rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #7c2d12;\n  background: #fdf6e3;\n}\n\n.logo {\n  margin: 0;\n  font-family: Georgia, serif;\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  gap: 0.75rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #7c2d12;\n  font-weight: 700;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 2rem;\n}\n\nh1 {\n  margin: 0.5rem 0;\n  font-size: 1.2rem;\n}\n\nh2 {\n  margin: 0.5rem 0;\n  font-size: 1.05rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.signatura {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.limite {\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n}\n\n.limite-general {\n  margin: 1rem;\n}\n\n.quien {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  color: #7f1d1d;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  color: #7c2d12;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/fondos/actas",
  "mostrarConsola": true,
  "api": {
    "fondos": [
      {
        "id": "actas",
        "nombre": "Actas del concejo"
      },
      {
        "id": "padrones",
        "nombre": "Padrones de vecinos"
      },
      {
        "id": "obras",
        "nombre": "Obras y urbanismo"
      }
    ],
    "expedientes": [
      {
        "id": 1567,
        "fondo": "actas",
        "titulo": "Libro de actas de 1567",
        "signatura": "ac-12",
        "resumen": "Acuerdos del concejo sobre el puente del Queiles."
      },
      {
        "id": 1890,
        "fondo": "actas",
        "titulo": "Libro de actas de 1890",
        "signatura": "ac-87",
        "resumen": "Llegada del ferrocarril y nuevas farolas en la plaza."
      },
      {
        "id": 1857,
        "fondo": "padrones",
        "titulo": "Padrón de vecinos de 1857",
        "resumen": "Casa por casa, con oficios y edades."
      },
      {
        "id": 1991,
        "fondo": "padrones",
        "titulo": "Padrón de habitantes de 1991",
        "signatura": "pa-40",
        "acceso": "reservado",
        "hasta": 2041
      },
      {
        "id": 1923,
        "fondo": "obras",
        "titulo": "Planos del mercado de abastos",
        "signatura": "ob-03",
        "acceso": "investigadores"
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

## Cuándo lo usarías de verdad

Siempre que una app tenga más de una pantalla. La pregunta no es si poner límites, sino **dónde**:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde poner cada límite",
  "roles": [
    {
      "etiqueta": "En la raíz",
      "rol": "La red de seguridad",
      "descripcion": "Siempre. Sustituye a toda la maquetación, así que trae su propia cabecera y un enlace al inicio. Recoge también las direcciones sin ruta."
    },
    {
      "etiqueta": "En cada sección",
      "rol": "Que la navegación se quede",
      "descripcion": "Un límite en la ruta de una sección, como el fondo, deja la cabecera y los enlaces a mano para salir del error sin recargar."
    },
    {
      "etiqueta": "En las hojas con datos propios",
      "rol": "La ficha que falla sola",
      "descripcion": "En la ruta del expediente, el límite deja la lista de su madre en pantalla: el usuario prueba con otro sin volver atrás."
    },
    {
      "etiqueta": "En lo secundario",
      "rol": "errorElement en cada Await",
      "descripcion": "Lo que llega por streaming lleva su propio errorElement, para que unas notas que no llegan no tumben el expediente (lección 9)."
    }
  ]
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una ruta sin ErrorBoundary no enseña sus errores",
      "realidad": "Los manda hacia arriba: a su madre, a su abuela… El primer límite que encuentra los pinta en lugar de su propio componente. Si no hay ninguno, sale el de serie de React Router."
    },
    {
      "mito": "El ErrorBoundary de una ruta es solo para los fallos del loader",
      "realidad": "Recoge lo que lanzan el loader, la action y el componente de su ruta y de las hijas sin límite, y el rechazo de un Await sin errorElement."
    },
    {
      "mito": "Si mi ErrorBoundary enseña el error, ya me enteraré",
      "realidad": "Un loader que falla no deja nada en la consola ni pasa por las opciones de createRoot (comprobado). Sin onError, solo lo ve el usuario."
    },
    {
      "mito": "throw data(…, { status: 404 }) trae el statusText «Not Found»",
      "realidad": "Trae «Internal Server Error», con cualquier estado, salvo que le pases statusText. El único 404 con «Not Found» es el que lanza el router cuando ninguna ruta encaja."
    }
  ]
}
```

## Errores típicos

**Decidir con `statusText`.** `if (error.statusText === 'Not Found')` nunca se cumple con tus propios 404, como viste en la sección de los estados. Compara `error.status`.

**Un límite que falla.** El código del `ErrorBoundary` también puede romperse, y suele ser por dar por hecho qué trae `data`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// ErrorFondo da por hecho que data trae un objeto con mensaje\nfunction ErrorFondo() {\n  const error = useRouteError() as { data: { mensaje: string } }\n  return <p>{error.data.mensaje.toUpperCase()}</p>\n}\n\n// Un expediente para investigadores lanza:\nthrow data('Solo para investigadores acreditados', { status: 401 })\n\n// ¿Qué pasa?",
  "opciones": [
    "ErrorFondo se queda en blanco",
    "ErrorFondo pinta «SOLO PARA INVESTIGADORES ACREDITADOS»",
    "ErrorFondo lanza un TypeError al pintar y ese error sube a ErrorGeneral: desaparece también la cabecera",
    "La pantalla entera se queda en blanco: un límite que falla no tiene a quién pasar el error"
  ],
  "correcta": 2,
  "explicacion": "error.data es un texto, así que error.data.mensaje es undefined y toUpperCase lanza. Un límite no se protege a sí mismo (lección 53 de React): el nuevo error sube al siguiente, ErrorGeneral, que lo sustituye todo (comprobado en Chromium). El as de TypeScript ha callado el aviso que te habría dado estrechar con isRouteErrorResponse."
}
```

**Leer con `useLoaderData` los datos de la ruta dentro de su propio límite.** Si el que falló es el `loader` de esa ruta, `useLoaderData()` devuelve `undefined` aunque su tipo diga lo contrario (comprobado), y un `const { fondo } = useLoaderData<typeof cargarFondo>()` lanza al pintar. Ese error sube al límite de arriba, como en la pregunta anterior. Usa `useRouteLoaderData`, cuyo tipo incluye `undefined`.

**Envolver un `Error` en `data()` para darle un estado.**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Para que el límite sepa que es un 503:\nthrow data(new Error('Sala de consulta cerrada hasta las 16:00'), { status: 503 })\n\n// En el ErrorBoundary:\nif (isRouteErrorResponse(error)) return <p>Respuesta {error.status}</p>\nif (error instanceof Error) return <p>Error: {error.message}</p>\n\n// ¿Qué pinta?",
  "opciones": [
    "«Respuesta 503»",
    "«Error: Sala de consulta cerrada hasta las 16:00»",
    "«Respuesta 500», porque un Error siempre es un 500",
    "Nada: data() no admite un Error"
  ],
  "correcta": 1,
  "explicacion": "Si lo que le das a data() es un Error, React Router se queda con el Error y descarta el estado: isRouteErrorResponse da false (comprobado con la 8.5.0, y es lo que hace su código). Si quieres un 503 con su mensaje, lánzalo con datos normales: throw data({ mensaje: '…' }, { status: 503 })."
}
```

**Lanzar los errores de validación.** El formulario desaparece con lo escrito: ya lo viste en la lección 99 de React y en la lección 3. Se devuelven.

**Leer `message` de una respuesta.** Después de `isRouteErrorResponse(error)`, `error.message` no existe. El panel de tipos lo avisa:

```text
Property 'message' does not exist on type 'ErrorResponse'.
```

Es decir: «la propiedad message no existe en el tipo ErrorResponse». Una respuesta trae `status`, `statusText` y `data`; el mensaje lo pusiste tú en `data`.

**Avisar dos veces del mismo fallo.** `onError` es una vez por error… casi siempre:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "<RouterProvider router={router} onError={informar} />\n\n// En el expediente, las notas sin errorElement:\n<Suspense fallback={<p>Cargando las notas del archivero…</p>}>\n  <Await resolve={notas}>\n    {(lista) => <NotasDelArchivero notas={lista} />}\n  </Await>\n</Suspense>\n\n// La promesa de las notas se rechaza.\n// ¿Cuántas veces se llama a informar?",
  "opciones": [
    "Ninguna: los rechazos de Await no pasan por onError",
    "Una, como cualquier otro error",
    "Dos: una al rechazarse la promesa y otra cuando el límite de la ruta recoge el error al pintar",
    "Dos, pero solo en desarrollo, por culpa de StrictMode"
  ],
  "correcta": 2,
  "explicacion": "Comprobado con StrictMode y sin él: primero llega sin errorInfo, cuando Await ve el rechazo, y después con errorInfo, cuando el límite de la ruta lo recoge al pintar. Con errorElement, una sola vez. Otro motivo para ponerlo, y para que tu servicio de errores junte los repetidos."
}
```

## Ejercicios

Los dos parten del archivo, con su API simulada. En el primero, cada expediente tendrá su propio límite; en el segundo, te enterarás de lo que falla. Los dos piden además que el panel de errores de tipos quede limpio.

**1. Cada fallo, en su sitio.** Ahora mismo, un expediente que falla se lleva por delante la lista del fondo, y todos los fallos dicen lo mismo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cada fallo, en su sitio",
  "consigna": "En errores.tsx, escribe ErrorExpediente siguiendo los comentarios 1 a 4; en App.tsx, dáselo a la ruta del expediente (5). Prueba con la barra: /fondos/obras/1923 (401), /fondos/padrones/1991 (403) y /fondos/actas/9999 (404). Para un fallo del servidor, pulsa «Fallar la siguiente petición» y abre un expediente; luego, «Reintentar».",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cargarExpediente, cargarFondo } from './cargas'\nimport { ErrorFondo, ErrorGeneral } from './errores'\nimport { Expediente, Fondo, Inicio, Maquetacion } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo el archivo…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        path: 'fondos/:fondoId',\n        loader: cargarFondo,\n        Component: Fondo,\n        ErrorBoundary: ErrorFondo,\n        children: [\n          { index: true, element: <p>Elige un expediente.</p> },\n          // 5. Dale al expediente su propia página de error, para que la lista del fondo siga en pantalla\n          { path: ':expedienteId', loader: cargarExpediente, Component: Expediente },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "errores.tsx",
      "codigo": "import { isRouteErrorResponse, Link, useRevalidator, useRouteError } from 'react-router'\n\nexport function ErrorGeneral() {\n  return (\n    <div className=\"limite limite-general\">\n      <p className=\"logo\">Archivo Municipal de Tarazona</p>\n      <h1>Algo ha fallado en el archivo</h1>\n      <Link to=\"/\">Volver al inicio</Link>\n    </div>\n  )\n}\n\nexport function ErrorFondo() {\n  const error = useRouteError()\n  const noExiste = isRouteErrorResponse(error) && error.status === 404\n\n  return (\n    <section className=\"limite\">\n      <h1>{noExiste ? 'Eso no está en el archivo' : 'No hemos podido abrir el fondo'}</h1>\n    </section>\n  )\n}\n\n// La página de error de un expediente\nexport function ErrorExpediente() {\n  const error = useRouteError()\n  const revalidator = useRevalidator()\n\n  // 1. Un 401: un h2 «Solo para investigadores» y, debajo, error.data en un párrafo.\n  // 2. Un 403: un h2 «Expediente reservado» y el párrafo\n  //    «Se podrá consultar a partir de 2041.», con el año que viene en error.data.hasta.\n  // 3. Un 404: un h2 «Ese expediente no está en el archivo».\n  // 4. Cualquier otra cosa: un párrafo con role=\"alert\" que diga\n  //    «No hemos podido abrir el expediente.» y un botón «Reintentar»\n  //    que llame a revalidator.revalidate().\n  return <p>Algo ha pasado con este expediente.</p>\n}\n"
    },
    {
      "nombre": "cargas.ts",
      "codigo": "import { data, type LoaderFunctionArgs } from 'react-router'\n\nexport type Fondo = { id: string; nombre: string }\nexport type Expediente = {\n  id: number\n  fondo: string\n  titulo: string\n  signatura: string\n  resumen?: string\n  acceso?: 'reservado' | 'investigadores'\n  hasta?: number\n}\n\nasync function pedir<T>(url: string, signal: AbortSignal, queFalta: string): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data(`${queFalta} no está en el archivo`, { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport async function cargarFondo({ params, request }: LoaderFunctionArgs) {\n  const [fondo, expedientes] = await Promise.all([\n    pedir<Fondo>(`/api/fondos/${params.fondoId}`, request.signal, 'Ese fondo'),\n    pedir<Expediente[]>('/api/expedientes', request.signal, 'La lista'),\n  ])\n  return { fondo, expedientes: expedientes.filter((e) => e.fondo === fondo.id) }\n}\n\nexport async function cargarExpediente({ params, request }: LoaderFunctionArgs) {\n  const expediente = await pedir<Expediente>(\n    `/api/expedientes/${params.expedienteId}`,\n    request.signal,\n    'Ese expediente',\n  )\n  if (expediente.fondo !== params.fondoId) {\n    throw data('Ese expediente no está en este fondo', { status: 404 })\n  }\n  if (expediente.acceso === 'investigadores') {\n    throw data('Solo pueden consultarlo investigadores acreditados', { status: 401 })\n  }\n  if (expediente.acceso === 'reservado') {\n    throw data({ hasta: expediente.hasta }, { status: 403 })\n  }\n  return { expediente }\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Link, NavLink, Outlet, useLoaderData } from 'react-router'\nimport type { cargarExpediente, cargarFondo } from './cargas'\n\nexport function Maquetacion() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Archivo Municipal de Tarazona</p>\n        <nav aria-label=\"Fondos\">\n          <NavLink to=\"/fondos/actas\">Actas</NavLink>\n          <NavLink to=\"/fondos/padrones\">Padrones</NavLink>\n          <NavLink to=\"/fondos/obras\">Obras</NavLink>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Inicio() {\n  return <p>Elige un fondo para ver sus expedientes.</p>\n}\n\nexport function Fondo() {\n  const { fondo, expedientes } = useLoaderData<typeof cargarFondo>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{fondo.nombre}</h1>\n        <ul>\n          {expedientes.map((expediente) => (\n            <li key={expediente.id}>\n              <Link to={String(expediente.id)}>{expediente.titulo}</Link>\n            </li>\n          ))}\n        </ul>\n      </section>\n      <Outlet />\n    </div>\n  )\n}\n\nexport function Expediente() {\n  const { expediente } = useLoaderData<typeof cargarExpediente>()\n\n  return (\n    <article>\n      <h2>{expediente.titulo}</h2>\n      {/* El tipo dice que siempre hay signatura; el servidor no siempre la manda */}\n      <p className=\"signatura\">Signatura {expediente.signatura.toUpperCase()}</p>\n      <p>{expediente.resumen}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1.5rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #7c2d12;\n  background: #fdf6e3;\n}\n\n.logo {\n  margin: 0;\n  font-family: Georgia, serif;\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  gap: 0.75rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #7c2d12;\n  font-weight: 700;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 2rem;\n}\n\nh1 {\n  margin: 0.5rem 0;\n  font-size: 1.2rem;\n}\n\nh2 {\n  margin: 0.5rem 0;\n  font-size: 1.05rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.signatura {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.limite {\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n}\n\n.limite-general {\n  margin: 1rem;\n}\n\n.quien {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  color: #7f1d1d;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  color: #7c2d12;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "errores.tsx",
  "urlInicial": "/fondos/actas",
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "fondos": [
      {
        "id": "actas",
        "nombre": "Actas del concejo"
      },
      {
        "id": "padrones",
        "nombre": "Padrones de vecinos"
      },
      {
        "id": "obras",
        "nombre": "Obras y urbanismo"
      }
    ],
    "expedientes": [
      {
        "id": 1567,
        "fondo": "actas",
        "titulo": "Libro de actas de 1567",
        "signatura": "ac-12",
        "resumen": "Acuerdos del concejo sobre el puente del Queiles."
      },
      {
        "id": 1890,
        "fondo": "actas",
        "titulo": "Libro de actas de 1890",
        "signatura": "ac-87",
        "resumen": "Llegada del ferrocarril y nuevas farolas en la plaza."
      },
      {
        "id": 1857,
        "fondo": "padrones",
        "titulo": "Padrón de vecinos de 1857",
        "resumen": "Casa por casa, con oficios y edades."
      },
      {
        "id": 1991,
        "fondo": "padrones",
        "titulo": "Padrón de habitantes de 1991",
        "signatura": "pa-40",
        "acceso": "reservado",
        "hasta": 2041
      },
      {
        "id": 1923,
        "fondo": "obras",
        "titulo": "Planos del mercado de abastos",
        "signatura": "ob-03",
        "acceso": "investigadores"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Un expediente para investigadores (401) muestra «Solo para investigadores»",
      "urlInicial": "/fondos/obras/1923",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Solo para investigadores"
      }
    },
    {
      "descripcion": "El padrón reservado (403) dice desde cuándo se podrá consultar",
      "urlInicial": "/fondos/padrones/1991",
      "pasos": [],
      "espera": {
        "texto": "Se podrá consultar a partir de 2041."
      }
    },
    {
      "descripcion": "Un expediente que no existe (404) muestra «Ese expediente no está en el archivo»",
      "urlInicial": "/fondos/actas/9999",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Ese expediente no está en el archivo"
      }
    },
    {
      "descripcion": "Con un expediente que no existe, la lista del fondo sigue en pantalla",
      "urlInicial": "/fondos/actas/9999",
      "pasos": [],
      "espera": {
        "rol": "link",
        "nombre": "Libro de actas de 1567"
      }
    },
    {
      "descripcion": "Un 404 no se anuncia como un fallo",
      "urlInicial": "/fondos/actas/9999",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Ese expediente no está en el archivo"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert"
        }
      }
    },
    {
      "descripcion": "Si el servidor falla, se avisa con «No hemos podido abrir el expediente.»",
      "urlInicial": "/fondos/actas",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Actas del concejo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Libro de actas de 1890"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No hemos podido abrir el expediente."
      }
    },
    {
      "descripcion": "Tras un fallo del servidor, «Reintentar» abre el expediente",
      "urlInicial": "/fondos/actas",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Actas del concejo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Libro de actas de 1890"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Libro de actas de 1890"
      }
    }
  ]
}
```

**2. Avisar solo de lo que hay que arreglar.** El archivo ya tiene su `ErrorExpediente`, el del ejercicio anterior. Ahora falta enterarse: el panel de abajo hace de servicio de registro de errores.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Avisar solo de lo que hay que arreglar",
  "consigna": "Escribe informar en App.tsx siguiendo los comentarios 1 y 2 y conéctalo con RouterProvider (3). Después prueba: /fondos/actas/9999 y /fondos/padrones/1991 no deben avisar. El «Padrón de vecinos de 1857», que falla al pintar, y un expediente abierto después de «Fallar la siguiente petición», sí: una vez cada uno.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, type ClientOnErrorFunction } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { anadirAviso, useAvisos } from './avisos'\nimport { cargarExpediente, cargarFondo } from './cargas'\nimport { ErrorExpediente, ErrorFondo, ErrorGeneral } from './errores'\nimport { Expediente, Fondo, Inicio, Maquetacion } from './paginas'\nimport './estilos.css'\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo el archivo…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        path: 'fondos/:fondoId',\n        loader: cargarFondo,\n        Component: Fondo,\n        ErrorBoundary: ErrorFondo,\n        children: [\n          { index: true, element: <p>Elige un expediente.</p> },\n          {\n            path: ':expedienteId',\n            loader: cargarExpediente,\n            Component: Expediente,\n            ErrorBoundary: ErrorExpediente,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nconst informar: ClientOnErrorFunction = (error, { pattern, errorInfo }) => {\n  // 1. No avises de las respuestas por debajo de 500 que lanzan tus loader:\n  //    un 404 o un 403 son respuestas previstas, no fallos que arreglar.\n  // 2. Para lo demás, llama a anadirAviso con:\n  //    - mensaje: el message del error si es un Error; si no, 'Error desconocido'\n  //    - ruta: el patrón de la ruta (pattern)\n  //    - cuando: 'al pintar' si llega errorInfo; si no, 'al cargar'\n}\n\nfunction PanelDeAvisos() {\n  const avisos = useAvisos()\n\n  return (\n    <aside className=\"panel-avisos\" aria-label=\"Avisos enviados\">\n      <p>Avisos enviados: {avisos.length}</p>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>\n            {aviso.cuando} · {aviso.mensaje} · {aviso.ruta}\n          </li>\n        ))}\n      </ul>\n    </aside>\n  )\n}\n\nexport default function App() {\n  return (\n    <>\n      {/* 3. Conecta informar con el router */}\n      <RouterProvider router={router} />\n      <PanelDeAvisos />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "avisos.ts",
      "codigo": "import { useSyncExternalStore } from 'react'\n\n// Hace de servicio de registro de errores (lección 53 de React): en tu\n// proyecto, anadirAviso sería un fetch a tu API o una llamada a Sentry.\nexport type Aviso = {\n  id: number\n  mensaje: string\n  ruta: string\n  cuando: 'al cargar' | 'al pintar'\n}\n\nlet avisos: Aviso[] = []\nconst oyentes = new Set<() => void>()\n\nexport function anadirAviso(aviso: Omit<Aviso, 'id'>) {\n  avisos = [...avisos, { ...aviso, id: avisos.length + 1 }]\n  oyentes.forEach((avisar) => avisar())\n}\n\nfunction suscribir(avisar: () => void) {\n  oyentes.add(avisar)\n  return () => {\n    oyentes.delete(avisar)\n  }\n}\n\nexport function useAvisos() {\n  return useSyncExternalStore(suscribir, () => avisos)\n}\n"
    },
    {
      "nombre": "cargas.ts",
      "codigo": "import { data, type LoaderFunctionArgs } from 'react-router'\n\nexport type Fondo = { id: string; nombre: string }\nexport type Expediente = {\n  id: number\n  fondo: string\n  titulo: string\n  signatura: string\n  resumen?: string\n  acceso?: 'reservado' | 'investigadores'\n  hasta?: number\n}\n\nasync function pedir<T>(url: string, signal: AbortSignal, queFalta: string): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data(`${queFalta} no está en el archivo`, { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport async function cargarFondo({ params, request }: LoaderFunctionArgs) {\n  const [fondo, expedientes] = await Promise.all([\n    pedir<Fondo>(`/api/fondos/${params.fondoId}`, request.signal, 'Ese fondo'),\n    pedir<Expediente[]>('/api/expedientes', request.signal, 'La lista'),\n  ])\n  return { fondo, expedientes: expedientes.filter((e) => e.fondo === fondo.id) }\n}\n\nexport async function cargarExpediente({ params, request }: LoaderFunctionArgs) {\n  const expediente = await pedir<Expediente>(\n    `/api/expedientes/${params.expedienteId}`,\n    request.signal,\n    'Ese expediente',\n  )\n  if (expediente.fondo !== params.fondoId) {\n    throw data('Ese expediente no está en este fondo', { status: 404 })\n  }\n  if (expediente.acceso === 'investigadores') {\n    throw data('Solo pueden consultarlo investigadores acreditados', { status: 401 })\n  }\n  if (expediente.acceso === 'reservado') {\n    throw data({ hasta: expediente.hasta }, { status: 403 })\n  }\n  return { expediente }\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { Link, NavLink, Outlet, useLoaderData } from 'react-router'\nimport type { cargarExpediente, cargarFondo } from './cargas'\n\nexport function Maquetacion() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Archivo Municipal de Tarazona</p>\n        <nav aria-label=\"Fondos\">\n          <NavLink to=\"/fondos/actas\">Actas</NavLink>\n          <NavLink to=\"/fondos/padrones\">Padrones</NavLink>\n          <NavLink to=\"/fondos/obras\">Obras</NavLink>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nexport function Inicio() {\n  return <p>Elige un fondo para ver sus expedientes.</p>\n}\n\nexport function Fondo() {\n  const { fondo, expedientes } = useLoaderData<typeof cargarFondo>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{fondo.nombre}</h1>\n        <ul>\n          {expedientes.map((expediente) => (\n            <li key={expediente.id}>\n              <Link to={String(expediente.id)}>{expediente.titulo}</Link>\n            </li>\n          ))}\n        </ul>\n      </section>\n      <Outlet />\n    </div>\n  )\n}\n\nexport function Expediente() {\n  const { expediente } = useLoaderData<typeof cargarExpediente>()\n\n  return (\n    <article>\n      <h2>{expediente.titulo}</h2>\n      {/* El tipo dice que siempre hay signatura; el servidor no siempre la manda */}\n      <p className=\"signatura\">Signatura {expediente.signatura.toUpperCase()}</p>\n      <p>{expediente.resumen}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "errores.tsx",
      "codigo": "import { isRouteErrorResponse, Link, useRevalidator, useRouteError } from 'react-router'\n\nexport function ErrorGeneral() {\n  return (\n    <div className=\"limite limite-general\">\n      <p className=\"logo\">Archivo Municipal de Tarazona</p>\n      <h1>Algo ha fallado en el archivo</h1>\n      <Link to=\"/\">Volver al inicio</Link>\n    </div>\n  )\n}\n\nexport function ErrorFondo() {\n  const error = useRouteError()\n  const noExiste = isRouteErrorResponse(error) && error.status === 404\n\n  return (\n    <section className=\"limite\">\n      <h1>{noExiste ? 'Eso no está en el archivo' : 'No hemos podido abrir el fondo'}</h1>\n    </section>\n  )\n}\n\n// La página de error de un expediente\nexport function ErrorExpediente() {\n  const error = useRouteError()\n  const revalidator = useRevalidator()\n\n  if (isRouteErrorResponse(error)) {\n    if (error.status === 401) {\n      return (\n        <article className=\"limite\">\n          <h2>Solo para investigadores</h2>\n          <p>{error.data}</p>\n        </article>\n      )\n    }\n    if (error.status === 403) {\n      return (\n        <article className=\"limite\">\n          <h2>Expediente reservado</h2>\n          <p>Se podrá consultar a partir de {error.data.hasta}.</p>\n        </article>\n      )\n    }\n    if (error.status === 404) {\n      return (\n        <article className=\"limite\">\n          <h2>Ese expediente no está en el archivo</h2>\n        </article>\n      )\n    }\n  }\n\n  return (\n    <article className=\"limite\">\n      <p role=\"alert\">No hemos podido abrir el expediente.</p>\n      <button onClick={() => revalidator.revalidate()} disabled={revalidator.state === 'loading'}>\n        Reintentar\n      </button>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1.5rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #7c2d12;\n  background: #fdf6e3;\n}\n\n.logo {\n  margin: 0;\n  font-family: Georgia, serif;\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  gap: 0.75rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\na[aria-current='page'] {\n  color: #7c2d12;\n  font-weight: 700;\n}\n\nmain {\n  padding: 0.5rem 1rem 1rem;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem 2rem;\n}\n\nh1 {\n  margin: 0.5rem 0;\n  font-size: 1.2rem;\n}\n\nh2 {\n  margin: 0.5rem 0;\n  font-size: 1.05rem;\n}\n\nul {\n  margin: 0;\n  padding-left: 1.2rem;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.signatura {\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.limite {\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #b91c1c;\n  border-radius: 6px;\n  background: #fef2f2;\n}\n\n.limite-general {\n  margin: 1rem;\n}\n\n.quien {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  color: #7f1d1d;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  min-height: 1.2em;\n  margin: 0;\n  color: #7c2d12;\n  font-size: 0.85rem;\n}\n\n.panel-avisos {\n  margin: 0 1rem 1rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #f1f5f9;\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n}\n\n.panel-avisos p {\n  margin: 0 0 0.25rem;\n  font-weight: 700;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/fondos/actas",
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "fondos": [
      {
        "id": "actas",
        "nombre": "Actas del concejo"
      },
      {
        "id": "padrones",
        "nombre": "Padrones de vecinos"
      },
      {
        "id": "obras",
        "nombre": "Obras y urbanismo"
      }
    ],
    "expedientes": [
      {
        "id": 1567,
        "fondo": "actas",
        "titulo": "Libro de actas de 1567",
        "signatura": "ac-12",
        "resumen": "Acuerdos del concejo sobre el puente del Queiles."
      },
      {
        "id": 1890,
        "fondo": "actas",
        "titulo": "Libro de actas de 1890",
        "signatura": "ac-87",
        "resumen": "Llegada del ferrocarril y nuevas farolas en la plaza."
      },
      {
        "id": 1857,
        "fondo": "padrones",
        "titulo": "Padrón de vecinos de 1857",
        "resumen": "Casa por casa, con oficios y edades."
      },
      {
        "id": 1991,
        "fondo": "padrones",
        "titulo": "Padrón de habitantes de 1991",
        "signatura": "pa-40",
        "acceso": "reservado",
        "hasta": 2041
      },
      {
        "id": 1923,
        "fondo": "obras",
        "titulo": "Planos del mercado de abastos",
        "signatura": "ob-03",
        "acceso": "investigadores"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Un expediente que no existe no genera ningún aviso",
      "urlInicial": "/fondos/actas/9999",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Ese expediente no está en el archivo"
          }
        }
      ],
      "espera": {
        "texto": "Avisos enviados: 0"
      }
    },
    {
      "descripcion": "Un expediente reservado tampoco genera avisos",
      "urlInicial": "/fondos/padrones/1991",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Expediente reservado"
          }
        }
      ],
      "espera": {
        "texto": "Avisos enviados: 0"
      }
    },
    {
      "descripcion": "Si el servidor falla al abrir un expediente, el aviso lleva el mensaje del error",
      "urlInicial": "/fondos/actas",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Actas del concejo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Libro de actas de 1890"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "El servidor respondió 500"
      }
    },
    {
      "descripcion": "El aviso lleva el patrón de la ruta",
      "urlInicial": "/fondos/actas",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Actas del concejo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Libro de actas de 1890"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "/fondos/:fondoId/:expedienteId"
      }
    },
    {
      "descripcion": "Un fallo al cargar se avisa como «al cargar»",
      "urlInicial": "/fondos/actas",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Actas del concejo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Libro de actas de 1890"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "al cargar"
      }
    },
    {
      "descripcion": "Un fallo al pintar se avisa como «al pintar»",
      "urlInicial": "/fondos/padrones/1857",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "al pintar"
      }
    },
    {
      "descripcion": "Cada fallo se avisa una sola vez",
      "urlInicial": "/fondos/padrones/1857",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "al pintar"
          }
        }
      ],
      "espera": {
        "texto": "Avisos enviados: 1"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el bloque «El archivo, con dos límites», mueve `ErrorFondo` a la ruta del expediente y deja el fondo sin límite. Antes de probarlo, apunta qué esperas ver con `/fondos/inventado` y con `/fondos/actas/9999`.
2. Añade a la ruta del fondo el `id: 'fondo'` y cambia su límite por el `ErrorFondo` con `useRouteLoaderData` y «Reintentar» de esta lección. Provoca un fallo en el fondo y otro en un expediente: ¿cuándo sale el nombre del fondo?
3. En un proyecto de Vite, dale a cada expediente unas notas del archivero que lleguen por *streaming* y fallen a veces. Con un `console.count` en `onError`, comprueba que sin `errorElement` cada fallo se avisa dos veces, y arréglalo.
4. En tu proyecto, cambia `anadirAviso` del segundo ejercicio por un `fetch` con POST a una ruta `/api/errores` de tu servidor (el de Express de la ficha de Node.js te sirve), y haz que no repita un aviso con el mismo mensaje y el mismo patrón en menos de un minuto.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Error Boundaries",
      "descripcion": "El límite de la raíz con sus tres casos, lanzar data() con un 404 y la tabla de los límites anidados, en el modo framework y en el de datos.",
      "url": "https://reactrouter.com/how-to/error-boundary",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Error Reporting",
      "descripcion": "Por qué un ErrorBoundary no basta para enterarte de los errores, y onError en RouterProvider y en HydratedRouter.",
      "url": "https://reactrouter.com/how-to/error-reporting",
      "etiqueta": "React Router"
    },
    {
      "titulo": "RouterProvider",
      "descripcion": "Las props de RouterProvider: onError, con location, params, pattern y errorInfo, y useTransitions.",
      "url": "https://reactrouter.com/api/data-routers/RouterProvider",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useAsyncError",
      "descripcion": "El rechazo de la promesa de un Await, para su errorElement. Sin errorElement, el error sube al límite de la ruta.",
      "url": "https://reactrouter.com/api/hooks/useAsyncError",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Status Codes",
      "descripcion": "Estados en los loader y las action con data(): un 400 devuelto con los errores del formulario y un 404 lanzado.",
      "url": "https://reactrouter.com/how-to/status",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Códigos de estado de respuesta HTTP",
      "descripcion": "Qué significa cada estado, con la diferencia entre 401 y 403 contada por el estándar.",
      "url": "https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Status",
      "etiqueta": "MDN"
    }
  ]
}
```
