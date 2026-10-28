# Revalidación: qué `loader` vuelven a ejecutarse, y cuándo no hace falta

- **Módulo:** Cargar y enviar datos
- **Slug:** `revalidacion-que-loader-vuelven-a-ejecutarse-y-cuando-no-hace-falta` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [Revalidation Optimization](https://reactrouter.com/how-to/optimize-revalidation) + [Route Object: shouldRevalidate](https://reactrouter.com/start/data/route-object) + [useRevalidator](https://reactrouter.com/api/hooks/useRevalidator) — ver `contenido/react-router/TEMARIO.md` #4
- **Requiere:** Las lecciones 2 y 3 de esta ficha (y, con ellas, la 99 de React)

---

## Qué es y para qué sirve

En la lección 2 cada ruta cargó sus datos con su `loader`, todos a la vez. En la 3, después de cada `action` el router volvió a cargar la página sin que escribieras nada. A eso se le llama **revalidar**: volver a ejecutar los `loader` de las rutas que están en pantalla, para que lo que se ve coincida con lo que hay en el servidor.

Hasta ahora lo has dado por hecho. En una aplicación con varias rutas anidadas salen preguntas que conviene saber contestar:

- Después de un envío, ¿se repiten **todos** los `loader`, o solo el de la ruta que recibió el envío?
- Al pasar de una página a otra, ¿qué se vuelve a pedir y qué se aprovecha?
- Si la `action` falla, ¿se recarga algo?
- ¿Puedes ahorrarte un `loader` caro que no ha cambiado? ¿Y forzar uno que el router se saltaría?
- ¿Y si los datos cambian por otro lado, sin pasar por tu aplicación?

El ejemplo es el **Concurso de Pinchos de Burgos**. Cada sábado de octubre, el jurado recorre tres bares (una ronda) y prueba el pincho de cada uno. Después, en la web del jurado, pone a cada pincho una nota de sabor y otra de presentación, del 0 al 10, y la clasificación suma las dos. La aplicación tiene tres rutas, una dentro de otra, y cada una con su `loader`:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas del concurso, con su loader cada una",
  "nodos": [
    {
      "nombre": "concurso",
      "nivel": 0,
      "etiqueta": "loader",
      "nota": "path / · la clasificación, siempre a la vista"
    },
    {
      "nombre": "ronda",
      "nivel": 1,
      "etiqueta": "loader",
      "nota": "rondas/:ronda · los tres bares, con un filtro ?tipo="
    },
    {
      "nombre": "cata",
      "nivel": 2,
      "etiqueta": "loader y action",
      "nota": "catas/:cata · el pincho y su hoja de notas"
    }
  ]
}
```

**El router no sabe qué ha cambiado en tu servidor. Decide qué recargar con unas reglas fijas, mirando la URL y si ha habido un envío.** Esas reglas aciertan casi siempre, y por eso existen. Esta lección te las enseña una a una, y te da las dos herramientas para corregirlas donde fallan, por exceso o por defecto: `shouldRevalidate` y `useRevalidator`.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El registro del router, debajo de la vista previa",
  "contenido": "Los bloques en vivo de esta lección llevan el panel «Registro del router»: una entrada por cada cosa que hace el router (Carga inicial, Navegación, Envío, Atrás, Revalidación), sus pasos agrupados por fase («Envío», «Revalidación», «Carga») y, al final, «Se ejecutó», «Se volvió a ejecutar» y «No se volvió a ejecutar». Cada ruta pinta además su contador, «loader concurso · 1 vez»: es un truco de la lección para que los ejercicios lo puedan comprobar. Como en la lección 3, createBrowserRouter usa aquí un historial en memoria."
}
```

## Después de un envío con éxito: toda la página

La primera regla es la más sencilla: **cuando una `action` termina bien, el router vuelve a ejecutar los `loader` de todas las rutas que están en pantalla**, no solo el de la ruta que recibió el envío. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una nota, tres loader",
  "consigna": "Estás en la hoja del Bar Fernán González, todavía sin nota. Pon 9 de sabor y 8 de presentación y pulsa «Guardar la nota». En el registro sale «Envío · POST /rondas/4/catas/11»: primero la action de cata y después, en la fase «Revalidación», los tres loader a la vez. Abajo: «Se volvió a ejecutar: concurso, ronda, cata.» Los tres contadores pasan a 2, la ronda enseña los 17 puntos y el bar se pone primero.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, NavLink, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Ronda, { cargarRonda } from './Ronda'\nimport Cata, { cargarCata, guardarNota } from './Cata'\nimport { cargas, clasificar, pedir, Veces, type Cata as DatosCata } from './comun'\nimport './estilos.css'\n\nexport async function cargarConcurso({ request }: LoaderFunctionArgs) {\n  cargas.concurso += 1\n  const catas = await pedir<DatosCata[]>('/api/catas', { signal: request.signal })\n  return { clasificacion: clasificar(catas), veces: cargas.concurso }\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Concurso de Pinchos de Burgos · Jurado</p>\n        <nav aria-label=\"Rondas\">\n          {[1, 2, 3, 4, 5].map((n) => (\n            <NavLink key={n} to={`/rondas/${n}`}>\n              Ronda {n}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <div className=\"pagina\">\n        <main>\n          <Outlet />\n        </main>\n        <aside aria-labelledby=\"titulo-clasificacion\">\n          <h2 id=\"titulo-clasificacion\">Clasificación</h2>\n          <ol className=\"clasificacion\">\n            {clasificacion.map((f) => (\n              <li key={f.bar}>\n                <span>{f.bar}</span> <span>{f.puntos} pts</span>\n              </li>\n            ))}\n          </ol>\n          <Veces loader=\"concurso\" veces={veces} />\n        </aside>\n      </div>\n    </>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    Component: Concurso,\n    HydrateFallback: () => <p>Abriendo el concurso…</p>,\n    children: [\n      { index: true, Component: () => <p>Elige una ronda.</p> },\n      {\n        id: 'ronda',\n        path: 'rondas/:ronda',\n        loader: cargarRonda,\n        Component: Ronda,\n        children: [\n          {\n            id: 'cata',\n            path: 'catas/:cata',\n            loader: cargarCata,\n            action: guardarNota,\n            Component: Cata,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ronda.tsx",
      "codigo": "import { data, Form, Link, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata } from './comun'\n\nexport async function cargarRonda({ params, request }: LoaderFunctionArgs) {\n  cargas.ronda += 1\n  const numero = Number(params.ronda)\n  // El filtro va en la URL: /rondas/4?tipo=frio\n  const tipo = new URL(request.url).searchParams.get('tipo') ?? ''\n  const todas = await pedir<Cata[]>('/api/catas', { signal: request.signal })\n  const deLaRonda = todas.filter((c) => c.ronda === numero)\n  if (deLaRonda.length === 0) throw data('Esa ronda no existe', { status: 404 })\n  return {\n    numero,\n    dia: deLaRonda[0].dia,\n    tipo,\n    catas: deLaRonda.filter((c) => !tipo || c.tipo === tipo),\n    veces: cargas.ronda,\n  }\n}\n\nexport default function Ronda() {\n  const { numero, dia, tipo, catas, veces } = useLoaderData<typeof cargarRonda>()\n\n  return (\n    <>\n      <section aria-labelledby=\"titulo-ronda\">\n        <h1 id=\"titulo-ronda\">\n          Ronda {numero} · {dia}\n        </h1>\n        <Form method=\"get\" className=\"filtro\" key={`${numero}-${tipo}`}>\n          <label>\n            Tipo\n            <select name=\"tipo\" defaultValue={tipo}>\n              <option value=\"\">Todos</option>\n              <option value=\"caliente\">Caliente</option>\n              <option value=\"frio\">Frío</option>\n            </select>\n          </label>\n          <button>Filtrar</button>\n        </Form>\n        <ul className=\"catas\">\n          {catas.map((c) => (\n            <li key={c.id}>\n              <Link to={`catas/${c.id}`}>\n                {c.bar} · {nota(c)}\n              </Link>\n            </li>\n          ))}\n        </ul>\n        <Veces loader=\"ronda\" veces={veces} />\n      </section>\n      <Outlet />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Cata.tsx",
      "codigo": "import {\n  data,\n  Form,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargas, pedir, Veces, type Cata as DatosCata } from './comun'\n\nexport async function cargarCata({ params, request }: LoaderFunctionArgs) {\n  cargas.cata += 1\n  const respuesta = await fetch(`/api/catas/${params.cata}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Esa cata no existe', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { cata: (await respuesta.json()) as DatosCata, veces: cargas.cata }\n}\n\n// Una nota del 0 al 10; un campo vacío no es un 0\nfunction puntuacion(formData: FormData, nombre: string) {\n  const valor = formData.get(nombre)\n  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN\n  return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null\n}\n\nexport async function guardarNota({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const sabor = puntuacion(formData, 'sabor')\n  const presentacion = puntuacion(formData, 'presentacion')\n  if (sabor === null || presentacion === null) {\n    return data({ error: 'Pon las dos notas, del 0 al 10.' }, { status: 400 })\n  }\n  await pedir(`/api/catas/${params.cata}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ sabor, presentacion }),\n  })\n  return { mensaje: 'Nota guardada.' }\n}\n\nexport default function Cata() {\n  const { cata, veces } = useLoaderData<typeof cargarCata>()\n  const actionData = useActionData<typeof guardarNota>()\n\n  return (\n    <article className=\"cata\" aria-labelledby=\"titulo-cata\">\n      <h2 id=\"titulo-cata\">\n        {cata.bar}: {cata.pincho}\n      </h2>\n      <p>\n        {cata.dia}, {cata.hora}\n      </p>\n      <p>\n        En la hoja del jurado:{' '}\n        {cata.sabor === null ? 'sin nota' : `${cata.sabor} de sabor y ${cata.presentacion} de presentación`}\n      </p>\n      <Form method=\"post\" key={cata.id}>\n        <div className=\"notas\">\n          <label>\n            Sabor\n            <input name=\"sabor\" type=\"number\" defaultValue={cata.sabor ?? ''} />\n          </label>\n          <label>\n            Presentación\n            <input name=\"presentacion\" type=\"number\" defaultValue={cata.presentacion ?? ''} />\n          </label>\n        </div>\n        <button>Guardar la nota</button>\n      </Form>\n      {actionData && 'error' in actionData && <p role=\"alert\">{actionData.error}</p>}\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n      <Veces loader=\"cata\" veces={veces} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "comun.tsx",
      "codigo": "export type Cata = {\n  id: number\n  ronda: number\n  dia: string\n  hora: string\n  bar: string\n  pincho: string\n  tipo: 'caliente' | 'frio'\n  sabor: number | null\n  presentacion: number | null\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\nexport function puntos(c: Cata) {\n  return c.sabor === null || c.presentacion === null ? null : c.sabor + c.presentacion\n}\n\nexport function nota(c: Cata) {\n  const total = puntos(c)\n  return total === null ? 'sin nota' : `${total} puntos`\n}\n\nexport type Fila = { bar: string; puntos: number; sabor: number }\n\n// Los cinco primeros: más puntos y, a igualdad, más nota de sabor\nexport function clasificar(catas: Cata[]): Fila[] {\n  return catas\n    .flatMap((c) => {\n      const total = puntos(c)\n      return total === null ? [] : [{ bar: c.bar, puntos: total, sabor: c.sabor ?? 0 }]\n    })\n    .sort((a, b) => b.puntos - a.puntos || b.sabor - a.sabor)\n    .slice(0, 5)\n}\n\n// Solo para la lección: cuántas veces se ha ejecutado cada loader\nexport const cargas = { concurso: 0, ronda: 0, cata: 0 }\n\nexport function Veces({ loader, veces }: { loader: string; veces: number }) {\n  return (\n    <p className=\"veces\">\n      loader {loader} · {veces} {veces === 1 ? 'vez' : 'veces'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #fdfaf5;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #9a3412;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0 0 0.25rem;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.75rem;\n}\n\nnav a {\n  color: #7c2d12;\n}\n\nnav a.active {\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.pagina {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n  padding: 0.75rem 1rem 1rem;\n}\n\nmain {\n  flex: 1 1 18rem;\n  min-width: 0;\n}\n\naside {\n  flex: 0 1 12rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.clasificacion {\n  margin: 0;\n  padding-left: 1.4rem;\n}\n\n.clasificacion li span:last-child {\n  float: right;\n  font-variant-numeric: tabular-nums;\n}\n\n.catas {\n  padding-left: 1.2rem;\n}\n\n.catas li {\n  margin-bottom: 0.3rem;\n}\n\n/* El contador de la lección: cuántas veces se ha ejecutado cada loader */\n.veces {\n  display: inline-block;\n  margin: 0.25rem 0;\n  padding: 0.05rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n  font: 0.8rem ui-monospace, monospace;\n}\n\n.cata {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a3412;\n  background: #fff;\n}\n\n.cata p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n}\n\n.notas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\ninput[type='number'] {\n  width: 5rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n  cursor: pointer;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  border: 1px dashed #a8a29e;\n  border-radius: 6px;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #7c2d12;\n}\n\n.simulador {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px dashed #b45309;\n  border-radius: 6px;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.simulador p {\n  margin: 0.25rem 0;\n}\n\n.actualizando {\n  min-height: 1.2em;\n  margin: 0;\n  color: #b45309;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "Cata.tsx",
  "urlInicial": "/rondas/4/catas/11",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "catas": [
      {
        "id": 1,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "12:00",
        "bar": "Bar Las Llanas",
        "pincho": "Morcilla con piquillo",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 7
      },
      {
        "id": 2,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "13:00",
        "bar": "Taberna El Espolón",
        "pincho": "Croqueta de queso fresco",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 3,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "14:00",
        "bar": "Café La Flora",
        "pincho": "Tosta de cecina",
        "tipo": "frio",
        "sabor": 6,
        "presentacion": 8
      },
      {
        "id": 4,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "12:00",
        "bar": "Bodega San Lesmes",
        "pincho": "Torrezno con mostaza",
        "tipo": "caliente",
        "sabor": 9,
        "presentacion": 6
      },
      {
        "id": 5,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "13:00",
        "bar": "Mesón La Merced",
        "pincho": "Lechazo en tempura",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 7
      },
      {
        "id": 6,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "14:00",
        "bar": "Bar El Pilón",
        "pincho": "Ensaladilla con ventresca",
        "tipo": "frio",
        "sabor": 5,
        "presentacion": 6
      },
      {
        "id": 7,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "12:00",
        "bar": "Taberna Huerto del Rey",
        "pincho": "Bacalao confitado",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 8
      },
      {
        "id": 8,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "13:00",
        "bar": "Cervecería Gamonal",
        "pincho": "Brocheta de pulpo",
        "tipo": "caliente",
        "sabor": 6,
        "presentacion": 7
      },
      {
        "id": 9,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "14:00",
        "bar": "Bar La Puebla",
        "pincho": "Gilda de anchoa",
        "tipo": "frio",
        "sabor": 7,
        "presentacion": 5
      },
      {
        "id": 10,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "12:00",
        "bar": "Mesón del Arlanzón",
        "pincho": "Pimiento relleno",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 11,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "13:00",
        "bar": "Bar Fernán González",
        "pincho": "Morcilla con miel",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 12,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "14:00",
        "bar": "Taberna Las Huelgas",
        "pincho": "Salmorejo con jamón",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 13,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "12:00",
        "bar": "Bar San Gil",
        "pincho": "Mini hamburguesa de buey",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 14,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "13:00",
        "bar": "Café del Arco",
        "pincho": "Tartar de remolacha",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 15,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "14:00",
        "bar": "Taberna Santa Clara",
        "pincho": "Patata brava",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      }
    ]
  },
  "red": {
    "latencia": 400
  }
}
```

Esta `action` ha hecho volver a ejecutar tres `loader`, y los tres hacían falta: la hoja tiene una nota nueva, la lista de la ronda la enseña y la clasificación ha cambiado de primero. El router no podía saberlo, porque no sabe qué hace tu `action` por dentro. Así que hace lo único seguro: **lo recarga todo**.

Tres detalles que se ven en el registro:

- **Solo las rutas activas**, las que encajan con la URL. Las rondas que no estás viendo no se piden: se cargarán cuando vayas a ellas.
- **A la vez**, como en la lección 2: los tres `loader` empiezan en el mismo milisegundo.
- **Después de la `action`, nunca durante**: la fase «Revalidación» empieza cuando la `action` ha terminado, para que los `loader` lean los datos ya guardados. Lo que devolvió la `action` llega antes: con la latencia alta, el aviso de la `action` sale mientras los contadores siguen en 1, y la clasificación cambia después (comprobado con 500 ms). Si pintas algo con `useActionData`, no cuentes con que los `loader` hayan terminado.

Un envío desde un fetcher, sin navegar, revalida igual la página entera: lo verás en la lección 5.

## Al navegar: solo lo que cambia

Con los enlaces, el router es más ahorrador. En el modo de datos, **una navegación solo ejecuta los `loader` cuyos datos pueden haber cambiado según la URL**. Estas son las reglas, comprobadas con React Router 8.5.0 en el registro:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Una ruta que entra en pantalla carga siempre",
      "texto": "De la ronda a una cata, el loader de cata se ejecuta: antes no había datos. Ninguna regla ni ninguna función tuya puede saltárselo."
    },
    {
      "titulo": "Una ruta que ya estaba se repite si cambian sus parámetros",
      "texto": "Los de su trozo de URL. De la cata 11 a la 12 solo se repite cata. De la ronda 4 a la 2, ronda (y cata, si estaba, porque su URL cuelga de la ronda). La raíz, nunca: su trozo de URL es / y no cambia."
    },
    {
      "titulo": "Si cambia la búsqueda, se repiten todos",
      "texto": "Cualquier cambio en ?tipo=… vuelve a ejecutar todos los loader de la página, también los que no leen la búsqueda. El router no sabe quién lee qué."
    },
    {
      "titulo": "La misma URL exacta cuenta como recargar",
      "texto": "Pulsar el enlace de la página en la que ya estás repite todos los loader. No vuelve a montar nada: solo pide los datos de nuevo."
    },
    {
      "titulo": "Subir a la madre no ejecuta nada",
      "texto": "De la cata 11 a /rondas/4, la ronda ya tiene sus datos y sus parámetros no cambian: el registro dice «No se volvió a ejecutar: concurso, ronda»."
    },
    {
      "titulo": "Atrás y Adelante siguen las mismas reglas",
      "texto": "Volver con Atrás de la cata 12 a la 11 solo repitió cata."
    }
  ]
}
```

La tercera regla es la que más sorprende. Antes de probarlo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Estás en /rondas/4/catas/11. El filtro está en la ruta ronda:\n<Form method=\"get\">\n  <label>\n    Tipo\n    <select name=\"tipo\">…</select>\n  </label>\n  <button>Filtrar</button>\n</Form>\n\n// Eliges «Frío» y pulsas «Filtrar». La dirección pasa a\n// /rondas/4?tipo=frio. Solo cargarRonda lee ?tipo=.\n// ¿Qué loader se ejecutan?",
  "opciones": [
    "Solo ronda: es la única que lee el parámetro",
    "concurso y ronda: ha cambiado la búsqueda, y eso repite todos los loader de la página",
    "concurso, ronda y cata",
    "Ninguno: un Form con method=\"get\" no ejecuta loader"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en el registro: «Se ejecutó: concurso, ronda.» Cata no, porque el formulario lleva a /rondas/4 y la cata sale de la pantalla. La clasificación se vuelve a pedir aunque no lea ?tipo=: con la búsqueda, el router no se arriesga. Más abajo verás cómo decirle que al concurso no le hace falta."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Navegar por el concurso con el registro delante",
  "consigna": "Mira el registro después de cada paso. 1) Abre «Bar Fernán González» y después «Taberna Las Huelgas»: solo cata. 2) Atrás en la barra: igual. 3) Pulsa «Ronda 4»: no se ejecuta nada. 4) Filtra por «Frío»: concurso y ronda. 5) Pulsa «Ronda 4» dos veces: la primera quita ?tipo y la segunda es la misma URL; las dos lo repiten todo. 6) «Ronda 2»: solo ronda.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, NavLink, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Ronda, { cargarRonda } from './Ronda'\nimport Cata, { cargarCata, guardarNota } from './Cata'\nimport { cargas, clasificar, pedir, Veces, type Cata as DatosCata } from './comun'\nimport './estilos.css'\n\nexport async function cargarConcurso({ request }: LoaderFunctionArgs) {\n  cargas.concurso += 1\n  const catas = await pedir<DatosCata[]>('/api/catas', { signal: request.signal })\n  return { clasificacion: clasificar(catas), veces: cargas.concurso }\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Concurso de Pinchos de Burgos · Jurado</p>\n        <nav aria-label=\"Rondas\">\n          {[1, 2, 3, 4, 5].map((n) => (\n            <NavLink key={n} to={`/rondas/${n}`}>\n              Ronda {n}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <div className=\"pagina\">\n        <main>\n          <Outlet />\n        </main>\n        <aside aria-labelledby=\"titulo-clasificacion\">\n          <h2 id=\"titulo-clasificacion\">Clasificación</h2>\n          <ol className=\"clasificacion\">\n            {clasificacion.map((f) => (\n              <li key={f.bar}>\n                <span>{f.bar}</span> <span>{f.puntos} pts</span>\n              </li>\n            ))}\n          </ol>\n          <Veces loader=\"concurso\" veces={veces} />\n        </aside>\n      </div>\n    </>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    Component: Concurso,\n    HydrateFallback: () => <p>Abriendo el concurso…</p>,\n    children: [\n      { index: true, Component: () => <p>Elige una ronda.</p> },\n      {\n        id: 'ronda',\n        path: 'rondas/:ronda',\n        loader: cargarRonda,\n        Component: Ronda,\n        children: [\n          {\n            id: 'cata',\n            path: 'catas/:cata',\n            loader: cargarCata,\n            action: guardarNota,\n            Component: Cata,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ronda.tsx",
      "codigo": "import { data, Form, Link, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata } from './comun'\n\nexport async function cargarRonda({ params, request }: LoaderFunctionArgs) {\n  cargas.ronda += 1\n  const numero = Number(params.ronda)\n  // El filtro va en la URL: /rondas/4?tipo=frio\n  const tipo = new URL(request.url).searchParams.get('tipo') ?? ''\n  const todas = await pedir<Cata[]>('/api/catas', { signal: request.signal })\n  const deLaRonda = todas.filter((c) => c.ronda === numero)\n  if (deLaRonda.length === 0) throw data('Esa ronda no existe', { status: 404 })\n  return {\n    numero,\n    dia: deLaRonda[0].dia,\n    tipo,\n    catas: deLaRonda.filter((c) => !tipo || c.tipo === tipo),\n    veces: cargas.ronda,\n  }\n}\n\nexport default function Ronda() {\n  const { numero, dia, tipo, catas, veces } = useLoaderData<typeof cargarRonda>()\n\n  return (\n    <>\n      <section aria-labelledby=\"titulo-ronda\">\n        <h1 id=\"titulo-ronda\">\n          Ronda {numero} · {dia}\n        </h1>\n        <Form method=\"get\" className=\"filtro\" key={`${numero}-${tipo}`}>\n          <label>\n            Tipo\n            <select name=\"tipo\" defaultValue={tipo}>\n              <option value=\"\">Todos</option>\n              <option value=\"caliente\">Caliente</option>\n              <option value=\"frio\">Frío</option>\n            </select>\n          </label>\n          <button>Filtrar</button>\n        </Form>\n        <ul className=\"catas\">\n          {catas.map((c) => (\n            <li key={c.id}>\n              <Link to={`catas/${c.id}`}>\n                {c.bar} · {nota(c)}\n              </Link>\n            </li>\n          ))}\n        </ul>\n        <Veces loader=\"ronda\" veces={veces} />\n      </section>\n      <Outlet />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Cata.tsx",
      "codigo": "import {\n  data,\n  Form,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargas, pedir, Veces, type Cata as DatosCata } from './comun'\n\nexport async function cargarCata({ params, request }: LoaderFunctionArgs) {\n  cargas.cata += 1\n  const respuesta = await fetch(`/api/catas/${params.cata}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Esa cata no existe', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { cata: (await respuesta.json()) as DatosCata, veces: cargas.cata }\n}\n\n// Una nota del 0 al 10; un campo vacío no es un 0\nfunction puntuacion(formData: FormData, nombre: string) {\n  const valor = formData.get(nombre)\n  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN\n  return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null\n}\n\nexport async function guardarNota({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const sabor = puntuacion(formData, 'sabor')\n  const presentacion = puntuacion(formData, 'presentacion')\n  if (sabor === null || presentacion === null) {\n    return data({ error: 'Pon las dos notas, del 0 al 10.' }, { status: 400 })\n  }\n  await pedir(`/api/catas/${params.cata}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ sabor, presentacion }),\n  })\n  return { mensaje: 'Nota guardada.' }\n}\n\nexport default function Cata() {\n  const { cata, veces } = useLoaderData<typeof cargarCata>()\n  const actionData = useActionData<typeof guardarNota>()\n\n  return (\n    <article className=\"cata\" aria-labelledby=\"titulo-cata\">\n      <h2 id=\"titulo-cata\">\n        {cata.bar}: {cata.pincho}\n      </h2>\n      <p>\n        {cata.dia}, {cata.hora}\n      </p>\n      <p>\n        En la hoja del jurado:{' '}\n        {cata.sabor === null ? 'sin nota' : `${cata.sabor} de sabor y ${cata.presentacion} de presentación`}\n      </p>\n      <Form method=\"post\" key={cata.id}>\n        <div className=\"notas\">\n          <label>\n            Sabor\n            <input name=\"sabor\" type=\"number\" defaultValue={cata.sabor ?? ''} />\n          </label>\n          <label>\n            Presentación\n            <input name=\"presentacion\" type=\"number\" defaultValue={cata.presentacion ?? ''} />\n          </label>\n        </div>\n        <button>Guardar la nota</button>\n      </Form>\n      {actionData && 'error' in actionData && <p role=\"alert\">{actionData.error}</p>}\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n      <Veces loader=\"cata\" veces={veces} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "comun.tsx",
      "codigo": "export type Cata = {\n  id: number\n  ronda: number\n  dia: string\n  hora: string\n  bar: string\n  pincho: string\n  tipo: 'caliente' | 'frio'\n  sabor: number | null\n  presentacion: number | null\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\nexport function puntos(c: Cata) {\n  return c.sabor === null || c.presentacion === null ? null : c.sabor + c.presentacion\n}\n\nexport function nota(c: Cata) {\n  const total = puntos(c)\n  return total === null ? 'sin nota' : `${total} puntos`\n}\n\nexport type Fila = { bar: string; puntos: number; sabor: number }\n\n// Los cinco primeros: más puntos y, a igualdad, más nota de sabor\nexport function clasificar(catas: Cata[]): Fila[] {\n  return catas\n    .flatMap((c) => {\n      const total = puntos(c)\n      return total === null ? [] : [{ bar: c.bar, puntos: total, sabor: c.sabor ?? 0 }]\n    })\n    .sort((a, b) => b.puntos - a.puntos || b.sabor - a.sabor)\n    .slice(0, 5)\n}\n\n// Solo para la lección: cuántas veces se ha ejecutado cada loader\nexport const cargas = { concurso: 0, ronda: 0, cata: 0 }\n\nexport function Veces({ loader, veces }: { loader: string; veces: number }) {\n  return (\n    <p className=\"veces\">\n      loader {loader} · {veces} {veces === 1 ? 'vez' : 'veces'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #fdfaf5;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #9a3412;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0 0 0.25rem;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.75rem;\n}\n\nnav a {\n  color: #7c2d12;\n}\n\nnav a.active {\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.pagina {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n  padding: 0.75rem 1rem 1rem;\n}\n\nmain {\n  flex: 1 1 18rem;\n  min-width: 0;\n}\n\naside {\n  flex: 0 1 12rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.clasificacion {\n  margin: 0;\n  padding-left: 1.4rem;\n}\n\n.clasificacion li span:last-child {\n  float: right;\n  font-variant-numeric: tabular-nums;\n}\n\n.catas {\n  padding-left: 1.2rem;\n}\n\n.catas li {\n  margin-bottom: 0.3rem;\n}\n\n/* El contador de la lección: cuántas veces se ha ejecutado cada loader */\n.veces {\n  display: inline-block;\n  margin: 0.25rem 0;\n  padding: 0.05rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n  font: 0.8rem ui-monospace, monospace;\n}\n\n.cata {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a3412;\n  background: #fff;\n}\n\n.cata p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n}\n\n.notas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\ninput[type='number'] {\n  width: 5rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n  cursor: pointer;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  border: 1px dashed #a8a29e;\n  border-radius: 6px;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #7c2d12;\n}\n\n.simulador {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px dashed #b45309;\n  border-radius: 6px;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.simulador p {\n  margin: 0.25rem 0;\n}\n\n.actualizando {\n  min-height: 1.2em;\n  margin: 0;\n  color: #b45309;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "Ronda.tsx",
  "urlInicial": "/rondas/4",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "catas": [
      {
        "id": 1,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "12:00",
        "bar": "Bar Las Llanas",
        "pincho": "Morcilla con piquillo",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 7
      },
      {
        "id": 2,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "13:00",
        "bar": "Taberna El Espolón",
        "pincho": "Croqueta de queso fresco",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 3,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "14:00",
        "bar": "Café La Flora",
        "pincho": "Tosta de cecina",
        "tipo": "frio",
        "sabor": 6,
        "presentacion": 8
      },
      {
        "id": 4,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "12:00",
        "bar": "Bodega San Lesmes",
        "pincho": "Torrezno con mostaza",
        "tipo": "caliente",
        "sabor": 9,
        "presentacion": 6
      },
      {
        "id": 5,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "13:00",
        "bar": "Mesón La Merced",
        "pincho": "Lechazo en tempura",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 7
      },
      {
        "id": 6,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "14:00",
        "bar": "Bar El Pilón",
        "pincho": "Ensaladilla con ventresca",
        "tipo": "frio",
        "sabor": 5,
        "presentacion": 6
      },
      {
        "id": 7,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "12:00",
        "bar": "Taberna Huerto del Rey",
        "pincho": "Bacalao confitado",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 8
      },
      {
        "id": 8,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "13:00",
        "bar": "Cervecería Gamonal",
        "pincho": "Brocheta de pulpo",
        "tipo": "caliente",
        "sabor": 6,
        "presentacion": 7
      },
      {
        "id": 9,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "14:00",
        "bar": "Bar La Puebla",
        "pincho": "Gilda de anchoa",
        "tipo": "frio",
        "sabor": 7,
        "presentacion": 5
      },
      {
        "id": 10,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "12:00",
        "bar": "Mesón del Arlanzón",
        "pincho": "Pimiento relleno",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 11,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "13:00",
        "bar": "Bar Fernán González",
        "pincho": "Morcilla con miel",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 12,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "14:00",
        "bar": "Taberna Las Huelgas",
        "pincho": "Salmorejo con jamón",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 13,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "12:00",
        "bar": "Bar San Gil",
        "pincho": "Mini hamburguesa de buey",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 14,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "13:00",
        "bar": "Café del Arco",
        "pincho": "Tartar de remolacha",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 15,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "14:00",
        "bar": "Taberna Santa Clara",
        "pincho": "Patata brava",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

Fíjate en cómo nombra el registro las navegaciones con un enlace relativo: «Navegación → catas/12 · acabó en /rondas/4/catas/12». Lo primero es el `to` del `<Link>`; lo segundo, la URL a la que llegó.

**Las reglas de la navegación salen de la URL, no de tus datos.** Por eso aciertan solas casi siempre: si un `loader` depende de un parámetro y el parámetro no cambia, sus datos tampoco (salvo que alguien los cambie por otro lado: para eso está `useRevalidator`, al final). Y por eso se pasan de prudentes con la búsqueda: el router no puede saber qué `loader` la lee.

## Modo de datos y modo framework: la regla cambia

Todo lo anterior es del **modo de datos** (y del SPA Mode del modo framework, que se comporta igual según la documentación). En el **modo framework con SSR** (módulo 4), la regla de las navegaciones se invierte: **cada navegación vuelve a ejecutar los `loader` de todas las rutas activas**, como si cada enlace fuera la misma URL.

| Qué pasa | Modo de datos y SPA Mode | Framework con SSR |
|---|---|---|
| Un envío que va bien | Todos | Todos |
| Un enlace a otra URL | Los que cambian | Todos |
| La misma URL | Todos | Todos |

Lo comprobamos en un proyecto en modo framework con React Router 8.5.0: tres rutas anidadas como las del concurso, cada una con su `loader` de servidor y un contador. Al pasar de una hija a su hermana, y después a otra madre, el servidor volvió a ejecutar en cada paso la raíz y la madre, además de la hija: los tres contadores subieron a la vez. El navegador hizo una sola petición por navegación, a la URL de destino terminada en `.data`, que trajo los datos de todas las rutas de la página. Por qué es así y qué son esas peticiones `.data` es la lección 16.

Lo que sí es igual en los dos modos son los envíos, y las dos herramientas de esta lección: `shouldRevalidate` y `useRevalidator`. Con SSR, la primera importa todavía más, porque navegar ya no sale gratis por defecto.

## Cuando el envío falla: tres casos

La documentación de React Router lo resume en una línea: un envío que responde con un 4xx o un 5xx no revalida nada, porque se supone que no ha cambiado nada. En la lección 3 lo viste con el 400 de un error de validación. Pero en la 8.5.0 **depende de cómo falla la `action`**: de si devuelve o lanza, y de qué lanza.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de fallar, tres revalidaciones",
  "roles": [
    {
      "etiqueta": "return data(…, 409)",
      "rol": "No se repite ningún loader",
      "descripcion": "Devuelto con un estado de 400 o más. El formulario sigue en pantalla con su aviso, y nada se recarga. Es el caso de la lección 3."
    },
    {
      "etiqueta": "throw data(…, 403) o un Error",
      "rol": "Se repiten los de arriba",
      "descripcion": "Los loader de las rutas que quedan por encima del ErrorBoundary que recoge el error. El de esa ruta y los de debajo, no: en su sitio se pinta el límite."
    },
    {
      "etiqueta": "throw new Response(…, 403)",
      "rol": "No se repite ningún loader",
      "descripcion": "Lanzada, como el caso anterior, pero el router lee el estado de la propia Response y no recarga nada. El límite sale igual."
    }
  ]
}
```

Compruébalo en la hoja de notas. Esta versión tiene cuatro botones que hacen fallar la `action` a propósito, y la ruta de la cata tiene su propio `ErrorBoundary`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cuatro maneras de fallar",
  "consigna": "Pulsa cada botón de «Simular un fallo» y mira el registro y los contadores (entre uno y otro, «Volver a la cata» o Reiniciar). Con el 409, el envío no tiene fase «Revalidación» y dice «No se volvió a ejecutar: concurso, ronda, cata». Con data() 403 y con el Error, «Se volvió a ejecutar: concurso, ronda», y los dos contadores suben. Con la Response, ni revalidación ni contadores: solo el error en pantalla.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, NavLink, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Ronda, { cargarRonda } from './Ronda'\nimport Cata, { cargarCata, ErrorCata, guardarNota } from './Cata'\nimport { cargas, clasificar, pedir, Veces, type Cata as DatosCata } from './comun'\nimport './estilos.css'\n\nexport async function cargarConcurso({ request }: LoaderFunctionArgs) {\n  cargas.concurso += 1\n  const catas = await pedir<DatosCata[]>('/api/catas', { signal: request.signal })\n  return { clasificacion: clasificar(catas), veces: cargas.concurso }\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Concurso de Pinchos de Burgos · Jurado</p>\n        <nav aria-label=\"Rondas\">\n          {[1, 2, 3, 4, 5].map((n) => (\n            <NavLink key={n} to={`/rondas/${n}`}>\n              Ronda {n}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <div className=\"pagina\">\n        <main>\n          <Outlet />\n        </main>\n        <aside aria-labelledby=\"titulo-clasificacion\">\n          <h2 id=\"titulo-clasificacion\">Clasificación</h2>\n          <ol className=\"clasificacion\">\n            {clasificacion.map((f) => (\n              <li key={f.bar}>\n                <span>{f.bar}</span> <span>{f.puntos} pts</span>\n              </li>\n            ))}\n          </ol>\n          <Veces loader=\"concurso\" veces={veces} />\n        </aside>\n      </div>\n    </>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    Component: Concurso,\n    HydrateFallback: () => <p>Abriendo el concurso…</p>,\n    children: [\n      { index: true, Component: () => <p>Elige una ronda.</p> },\n      {\n        id: 'ronda',\n        path: 'rondas/:ronda',\n        loader: cargarRonda,\n        Component: Ronda,\n        children: [\n          {\n            id: 'cata',\n            path: 'catas/:cata',\n            loader: cargarCata,\n            action: guardarNota,\n            Component: Cata,\n            ErrorBoundary: ErrorCata,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Cata.tsx",
      "codigo": "import {\n  data,\n  Form,\n  isRouteErrorResponse,\n  Link,\n  useActionData,\n  useLoaderData,\n  useRouteError,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargas, pedir, Veces, type Cata as DatosCata } from './comun'\n\nexport async function cargarCata({ params, request }: LoaderFunctionArgs) {\n  cargas.cata += 1\n  const respuesta = await fetch(`/api/catas/${params.cata}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Esa cata no existe', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { cata: (await respuesta.json()) as DatosCata, veces: cargas.cata }\n}\n\n// Una nota del 0 al 10; un campo vacío no es un 0\nfunction puntuacion(formData: FormData, nombre: string) {\n  const valor = formData.get(nombre)\n  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN\n  return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null\n}\n\nexport async function guardarNota({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  // Los botones de «Simular un fallo»\n  switch (formData.get('intent')) {\n    case 'devolver-409':\n      return data({ error: 'Devuelto con un 409: la hoja está cerrada.' }, { status: 409 })\n    case 'lanzar-data':\n      throw data('Lanzado con data()', { status: 403 })\n    case 'lanzar-response':\n      throw new Response('Lanzada con Response', { status: 403 })\n    case 'lanzar-error':\n      throw new Error('Lanzado con un Error')\n  }\n  const sabor = puntuacion(formData, 'sabor')\n  const presentacion = puntuacion(formData, 'presentacion')\n  if (sabor === null || presentacion === null) {\n    return data({ error: 'Pon las dos notas, del 0 al 10.' }, { status: 400 })\n  }\n  await pedir(`/api/catas/${params.cata}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ sabor, presentacion }),\n  })\n  return { mensaje: 'Nota guardada.' }\n}\n\nexport default function Cata() {\n  const { cata, veces } = useLoaderData<typeof cargarCata>()\n  const actionData = useActionData<typeof guardarNota>()\n\n  return (\n    <article className=\"cata\" aria-labelledby=\"titulo-cata\">\n      <h2 id=\"titulo-cata\">\n        {cata.bar}: {cata.pincho}\n      </h2>\n      <p>\n        En la hoja del jurado:{' '}\n        {cata.sabor === null ? 'sin nota' : `${cata.sabor} de sabor y ${cata.presentacion} de presentación`}\n      </p>\n      <Form method=\"post\" key={cata.id}>\n        <div className=\"notas\">\n          <label>\n            Sabor\n            <input name=\"sabor\" type=\"number\" defaultValue={cata.sabor ?? ''} />\n          </label>\n          <label>\n            Presentación\n            <input name=\"presentacion\" type=\"number\" defaultValue={cata.presentacion ?? ''} />\n          </label>\n        </div>\n        <button>Guardar la nota</button>\n      </Form>\n      <Form method=\"post\">\n        <fieldset>\n          <legend>Simular un fallo de la action</legend>\n          <button name=\"intent\" value=\"devolver-409\">Devolver un 409</button>\n          <button name=\"intent\" value=\"lanzar-data\">Lanzar data() con 403</button>\n          <button name=\"intent\" value=\"lanzar-response\">Lanzar una Response 403</button>\n          <button name=\"intent\" value=\"lanzar-error\">Lanzar un Error</button>\n        </fieldset>\n      </Form>\n      {actionData && 'error' in actionData && <p role=\"alert\">{actionData.error}</p>}\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n      <Veces loader=\"cata\" veces={veces} />\n    </article>\n  )\n}\n\n// Lo que se lanza desde la action de esta ruta acaba aquí (lección 8)\nexport function ErrorCata() {\n  const error = useRouteError()\n  return (\n    <article className=\"cata\">\n      <h2>No se ha podido guardar</h2>\n      <p role=\"alert\">\n        {isRouteErrorResponse(error) ? `${error.status} · ${error.data}` : String(error)}\n      </p>\n      <Link to=\".\">Volver a la cata</Link>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Ronda.tsx",
      "codigo": "import { data, Form, Link, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata } from './comun'\n\nexport async function cargarRonda({ params, request }: LoaderFunctionArgs) {\n  cargas.ronda += 1\n  const numero = Number(params.ronda)\n  // El filtro va en la URL: /rondas/4?tipo=frio\n  const tipo = new URL(request.url).searchParams.get('tipo') ?? ''\n  const todas = await pedir<Cata[]>('/api/catas', { signal: request.signal })\n  const deLaRonda = todas.filter((c) => c.ronda === numero)\n  if (deLaRonda.length === 0) throw data('Esa ronda no existe', { status: 404 })\n  return {\n    numero,\n    dia: deLaRonda[0].dia,\n    tipo,\n    catas: deLaRonda.filter((c) => !tipo || c.tipo === tipo),\n    veces: cargas.ronda,\n  }\n}\n\nexport default function Ronda() {\n  const { numero, dia, tipo, catas, veces } = useLoaderData<typeof cargarRonda>()\n\n  return (\n    <>\n      <section aria-labelledby=\"titulo-ronda\">\n        <h1 id=\"titulo-ronda\">\n          Ronda {numero} · {dia}\n        </h1>\n        <Form method=\"get\" className=\"filtro\" key={`${numero}-${tipo}`}>\n          <label>\n            Tipo\n            <select name=\"tipo\" defaultValue={tipo}>\n              <option value=\"\">Todos</option>\n              <option value=\"caliente\">Caliente</option>\n              <option value=\"frio\">Frío</option>\n            </select>\n          </label>\n          <button>Filtrar</button>\n        </Form>\n        <ul className=\"catas\">\n          {catas.map((c) => (\n            <li key={c.id}>\n              <Link to={`catas/${c.id}`}>\n                {c.bar} · {nota(c)}\n              </Link>\n            </li>\n          ))}\n        </ul>\n        <Veces loader=\"ronda\" veces={veces} />\n      </section>\n      <Outlet />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "comun.tsx",
      "codigo": "export type Cata = {\n  id: number\n  ronda: number\n  dia: string\n  hora: string\n  bar: string\n  pincho: string\n  tipo: 'caliente' | 'frio'\n  sabor: number | null\n  presentacion: number | null\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\nexport function puntos(c: Cata) {\n  return c.sabor === null || c.presentacion === null ? null : c.sabor + c.presentacion\n}\n\nexport function nota(c: Cata) {\n  const total = puntos(c)\n  return total === null ? 'sin nota' : `${total} puntos`\n}\n\nexport type Fila = { bar: string; puntos: number; sabor: number }\n\n// Los cinco primeros: más puntos y, a igualdad, más nota de sabor\nexport function clasificar(catas: Cata[]): Fila[] {\n  return catas\n    .flatMap((c) => {\n      const total = puntos(c)\n      return total === null ? [] : [{ bar: c.bar, puntos: total, sabor: c.sabor ?? 0 }]\n    })\n    .sort((a, b) => b.puntos - a.puntos || b.sabor - a.sabor)\n    .slice(0, 5)\n}\n\n// Solo para la lección: cuántas veces se ha ejecutado cada loader\nexport const cargas = { concurso: 0, ronda: 0, cata: 0 }\n\nexport function Veces({ loader, veces }: { loader: string; veces: number }) {\n  return (\n    <p className=\"veces\">\n      loader {loader} · {veces} {veces === 1 ? 'vez' : 'veces'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #fdfaf5;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #9a3412;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0 0 0.25rem;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.75rem;\n}\n\nnav a {\n  color: #7c2d12;\n}\n\nnav a.active {\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.pagina {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n  padding: 0.75rem 1rem 1rem;\n}\n\nmain {\n  flex: 1 1 18rem;\n  min-width: 0;\n}\n\naside {\n  flex: 0 1 12rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.clasificacion {\n  margin: 0;\n  padding-left: 1.4rem;\n}\n\n.clasificacion li span:last-child {\n  float: right;\n  font-variant-numeric: tabular-nums;\n}\n\n.catas {\n  padding-left: 1.2rem;\n}\n\n.catas li {\n  margin-bottom: 0.3rem;\n}\n\n/* El contador de la lección: cuántas veces se ha ejecutado cada loader */\n.veces {\n  display: inline-block;\n  margin: 0.25rem 0;\n  padding: 0.05rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n  font: 0.8rem ui-monospace, monospace;\n}\n\n.cata {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a3412;\n  background: #fff;\n}\n\n.cata p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n}\n\n.notas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\ninput[type='number'] {\n  width: 5rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n  cursor: pointer;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  border: 1px dashed #a8a29e;\n  border-radius: 6px;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #7c2d12;\n}\n\n.simulador {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px dashed #b45309;\n  border-radius: 6px;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.simulador p {\n  margin: 0.25rem 0;\n}\n\n.actualizando {\n  min-height: 1.2em;\n  margin: 0;\n  color: #b45309;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "Cata.tsx",
  "urlInicial": "/rondas/4/catas/11",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "catas": [
      {
        "id": 1,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "12:00",
        "bar": "Bar Las Llanas",
        "pincho": "Morcilla con piquillo",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 7
      },
      {
        "id": 2,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "13:00",
        "bar": "Taberna El Espolón",
        "pincho": "Croqueta de queso fresco",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 3,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "14:00",
        "bar": "Café La Flora",
        "pincho": "Tosta de cecina",
        "tipo": "frio",
        "sabor": 6,
        "presentacion": 8
      },
      {
        "id": 4,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "12:00",
        "bar": "Bodega San Lesmes",
        "pincho": "Torrezno con mostaza",
        "tipo": "caliente",
        "sabor": 9,
        "presentacion": 6
      },
      {
        "id": 5,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "13:00",
        "bar": "Mesón La Merced",
        "pincho": "Lechazo en tempura",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 7
      },
      {
        "id": 6,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "14:00",
        "bar": "Bar El Pilón",
        "pincho": "Ensaladilla con ventresca",
        "tipo": "frio",
        "sabor": 5,
        "presentacion": 6
      },
      {
        "id": 7,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "12:00",
        "bar": "Taberna Huerto del Rey",
        "pincho": "Bacalao confitado",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 8
      },
      {
        "id": 8,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "13:00",
        "bar": "Cervecería Gamonal",
        "pincho": "Brocheta de pulpo",
        "tipo": "caliente",
        "sabor": 6,
        "presentacion": 7
      },
      {
        "id": 9,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "14:00",
        "bar": "Bar La Puebla",
        "pincho": "Gilda de anchoa",
        "tipo": "frio",
        "sabor": 7,
        "presentacion": 5
      },
      {
        "id": 10,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "12:00",
        "bar": "Mesón del Arlanzón",
        "pincho": "Pimiento relleno",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 11,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "13:00",
        "bar": "Bar Fernán González",
        "pincho": "Morcilla con miel",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 12,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "14:00",
        "bar": "Taberna Las Huelgas",
        "pincho": "Salmorejo con jamón",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 13,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "12:00",
        "bar": "Bar San Gil",
        "pincho": "Mini hamburguesa de buey",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 14,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "13:00",
        "bar": "Café del Arco",
        "pincho": "Tartar de remolacha",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 15,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "14:00",
        "bar": "Taberna Santa Clara",
        "pincho": "Patata brava",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

Lo mismo salió en la vista previa abierta en Chromium y en WebKit. Dos cosas que conviene mirar en el registro:

- **Con un error en pantalla, el registro no calcula «No se volvió a ejecutar».** En esos casos, la pista es si el envío tiene fase «Revalidación» o no. Y el error sale al final: «Error en pantalla (ErrorBoundary de cata): 403 Lanzado con data()».
- **El contador de cata desaparece en los tres envíos lanzados**: su ruta ya no pinta el componente, sino `ErrorCata`. Adónde sube cada error y qué queda en pantalla es la lección 8.

¿Por qué `data()` lanzado y `Response` lanzada se comportan distinto, si los dos llevan un 403? Lo explica lo que llega a `shouldRevalidate` (lo ves en la sección siguiente) en su argumento `actionStatus`, el estado de la respuesta de la `action`. Lo apuntamos en cada caso:

```text
return data(…, 409)          actionStatus: 409         defaultShouldRevalidate: false
throw data(…, 403)           actionStatus: undefined   defaultShouldRevalidate: true
throw new Response(…, 403)   actionStatus: 403         defaultShouldRevalidate: false
throw new Error(…)           actionStatus: undefined   defaultShouldRevalidate: true
return { mensaje }           actionStatus: undefined   defaultShouldRevalidate: true
```

El estado de un `data()` lanzado no llega a la decisión de revalidar; el de una `Response`, sí. Es un detalle de la 8.5.0, no algo que la documentación prometa, así que **no construyas nada encima**. Si en tu aplicación importa que un fallo recargue o no, dilo tú con `shouldRevalidate`. Fíjate también en la última línea: un objeto devuelto sin `data()` deja `actionStatus` en `undefined`, también cuando todo va bien.

## `shouldRevalidate`: cada ruta tiene la última palabra

Cada ruta puede llevar una función `shouldRevalidate` en su objeto. El router la llama antes de ejecutar su `loader` (salvo cuando la ruta acaba de entrar en pantalla: entonces carga sin preguntar). **Recibe lo que ha pasado y lo que el router había decidido, y devuelve `true` o `false`: si se ejecuta el `loader` de esa ruta.** Lo que había decidido el router llega en `defaultShouldRevalidate`, que vale lo que has visto hasta ahora: `true` tras un envío que va bien, `false` al pasar a otra cata de la misma ronda, etcétera.

Lo demás que recibe, en `ShouldRevalidateFunctionArgs` (se importa como tipo de `react-router`):

- `currentUrl` y `nextUrl`: de dónde viene y adónde va, como objetos `URL`. En un envío o en una revalidación sin navegar, las dos son la misma.
- `currentParams` y `nextParams`: los parámetros de la URL, antes y después.
- `formMethod`, `formAction` y `formData` (o `json` o `text`): el envío, si lo hay. Ojo: un `<Form method="get">` también trae `formMethod`, que vale `'GET'`.
- `actionStatus` y `actionResult`: el estado y lo que devolvió (o lanzó) la `action`.

El patrón que recomienda la documentación es **decidir solo el caso que conoces y devolver `defaultShouldRevalidate` en todo lo demás**. Así, la clasificación del concurso, que no lee nada de la URL:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// La clasificación no lee nada de la URL: navegar a otra dirección no la cambia\nfunction revalidarClasificacion({\n  formMethod,\n  currentUrl,\n  nextUrl,\n  defaultShouldRevalidate,\n}: ShouldRevalidateFunctionArgs) {\n  const navega = formMethod === undefined || formMethod === 'GET'\n  if (navega && currentUrl.href !== nextUrl.href) return false\n  return defaultShouldRevalidate\n}\n\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    shouldRevalidate: revalidarClasificacion,\n    Component: Concurso,\n    // …ronda y cata, sin cambios\n  },\n])",
  "anotaciones": [
    {
      "fragmento": "}: ShouldRevalidateFunctionArgs) {",
      "nota": "El tipo de los argumentos. Se importa con import type { ShouldRevalidateFunctionArgs } from 'react-router'. Escrita dentro del objeto de ruta, TypeScript lo deduce solo."
    },
    {
      "fragmento": "const navega = formMethod === undefined || formMethod === 'GET'",
      "nota": "Un enlace no trae formMethod; un Form con method=\"get\" trae 'GET'. Los dos son navegaciones: no cambian datos en el servidor."
    },
    {
      "fragmento": "currentUrl.href !== nextUrl.href",
      "nota": "Ir a otra dirección. Si es la misma (pulsar la ronda en la que estás, o useRevalidator), se deja decidir al router, que dirá true: quien recarga a propósito quiere datos nuevos."
    },
    {
      "fragmento": "if (navega && currentUrl.href !== nextUrl.href) return false",
      "nota": "Lo único que esta función sabe y el router no: que ningún cambio de URL afecta a la clasificación. Ni el filtro, ni cambiar de ronda."
    },
    {
      "fragmento": "return defaultShouldRevalidate",
      "nota": "Todo lo demás, como siempre: tras un envío que va bien, la clasificación se recarga. Devolver true aquí la recargaría en cada navegación; false, nunca."
    },
    {
      "fragmento": "shouldRevalidate: revalidarClasificacion,",
      "nota": "Solo decide el loader de esta ruta. ronda y cata siguen con sus reglas, y lo que decidan no depende de esta función."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La clasificación, solo cuando hace falta",
  "consigna": "Filtra por tipo, cambia de ronda y abre catas: el registro dice «No se volvió a ejecutar: concurso» y su contador no se mueve. Pulsa la ronda en la que estás o guarda una nota: ahí sí se repite, porque la función devuelve defaultShouldRevalidate. Prueba también «Ver las horas», que no ejecuta ningún loader. Al final, quita la línea shouldRevalidate de App.tsx y vuelve a filtrar.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import {\n  createBrowserRouter,\n  NavLink,\n  Outlet,\n  useLoaderData,\n  type LoaderFunctionArgs,\n  type ShouldRevalidateFunctionArgs,\n} from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Ronda, { cargarRonda } from './Ronda'\nimport Cata, { cargarCata, guardarNota } from './Cata'\nimport { cargas, clasificar, pedir, Veces, type Cata as DatosCata } from './comun'\nimport './estilos.css'\n\nexport async function cargarConcurso({ request }: LoaderFunctionArgs) {\n  cargas.concurso += 1\n  const catas = await pedir<DatosCata[]>('/api/catas', { signal: request.signal })\n  return { clasificacion: clasificar(catas), veces: cargas.concurso }\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Concurso de Pinchos de Burgos · Jurado</p>\n        <nav aria-label=\"Rondas\">\n          {[1, 2, 3, 4, 5].map((n) => (\n            <NavLink key={n} to={`/rondas/${n}`}>\n              Ronda {n}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <div className=\"pagina\">\n        <main>\n          <Outlet />\n        </main>\n        <aside aria-labelledby=\"titulo-clasificacion\">\n          <h2 id=\"titulo-clasificacion\">Clasificación</h2>\n          <ol className=\"clasificacion\">\n            {clasificacion.map((f) => (\n              <li key={f.bar}>\n                <span>{f.bar}</span> <span>{f.puntos} pts</span>\n              </li>\n            ))}\n          </ol>\n          <Veces loader=\"concurso\" veces={veces} />\n        </aside>\n      </div>\n    </>\n  )\n}\n\n// La clasificación no lee nada de la URL: navegar a otra dirección no la cambia\nfunction revalidarClasificacion({\n  formMethod,\n  currentUrl,\n  nextUrl,\n  defaultShouldRevalidate,\n}: ShouldRevalidateFunctionArgs) {\n  const navega = formMethod === undefined || formMethod === 'GET'\n  if (navega && currentUrl.href !== nextUrl.href) return false\n  return defaultShouldRevalidate\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    shouldRevalidate: revalidarClasificacion,\n    Component: Concurso,\n    HydrateFallback: () => <p>Abriendo el concurso…</p>,\n    children: [\n      { index: true, Component: () => <p>Elige una ronda.</p> },\n      {\n        id: 'ronda',\n        path: 'rondas/:ronda',\n        loader: cargarRonda,\n        Component: Ronda,\n        children: [\n          {\n            id: 'cata',\n            path: 'catas/:cata',\n            loader: cargarCata,\n            action: guardarNota,\n            Component: Cata,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ronda.tsx",
      "codigo": "import { data, Form, Link, Outlet, useLoaderData, useSearchParams, type LoaderFunctionArgs } from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata } from './comun'\n\nexport async function cargarRonda({ params, request }: LoaderFunctionArgs) {\n  cargas.ronda += 1\n  const numero = Number(params.ronda)\n  // El filtro va en la URL: /rondas/4?tipo=frio\n  const tipo = new URL(request.url).searchParams.get('tipo') ?? ''\n  const todas = await pedir<Cata[]>('/api/catas', { signal: request.signal })\n  const deLaRonda = todas.filter((c) => c.ronda === numero)\n  if (deLaRonda.length === 0) throw data('Esa ronda no existe', { status: 404 })\n  return {\n    numero,\n    dia: deLaRonda[0].dia,\n    tipo,\n    catas: deLaRonda.filter((c) => !tipo || c.tipo === tipo),\n    veces: cargas.ronda,\n  }\n}\n\nexport default function Ronda() {\n  const { numero, dia, tipo, catas, veces } = useLoaderData<typeof cargarRonda>()\n  // ?horas=1 solo lo lee este componente: ningún loader depende de él\n  const [busqueda] = useSearchParams()\n  const conHoras = busqueda.get('horas') === '1'\n  const siguiente = new URLSearchParams(busqueda)\n  if (conHoras) siguiente.delete('horas')\n  else siguiente.set('horas', '1')\n\n  return (\n    <>\n      <section aria-labelledby=\"titulo-ronda\">\n        <h1 id=\"titulo-ronda\">\n          Ronda {numero} · {dia}\n        </h1>\n        <Form method=\"get\" className=\"filtro\" key={`${numero}-${tipo}`}>\n          <label>\n            Tipo\n            <select name=\"tipo\" defaultValue={tipo}>\n              <option value=\"\">Todos</option>\n              <option value=\"caliente\">Caliente</option>\n              <option value=\"frio\">Frío</option>\n            </select>\n          </label>\n          <button>Filtrar</button>\n        </Form>\n        <ul className=\"catas\">\n          {catas.map((c) => (\n            <li key={c.id}>\n              <Link to={`catas/${c.id}`}>\n                {c.bar} · {nota(c)}\n              </Link>\n              {conHoras && <span> · a las {c.hora}</span>}\n            </li>\n          ))}\n        </ul>\n        <p>\n          <Link to={`?${siguiente}`} defaultShouldRevalidate={false}>\n            {conHoras ? 'Ocultar las horas' : 'Ver las horas'}\n          </Link>\n        </p>\n        <Veces loader=\"ronda\" veces={veces} />\n      </section>\n      <Outlet />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Cata.tsx",
      "codigo": "import {\n  data,\n  Form,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargas, pedir, Veces, type Cata as DatosCata } from './comun'\n\nexport async function cargarCata({ params, request }: LoaderFunctionArgs) {\n  cargas.cata += 1\n  const respuesta = await fetch(`/api/catas/${params.cata}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Esa cata no existe', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { cata: (await respuesta.json()) as DatosCata, veces: cargas.cata }\n}\n\n// Una nota del 0 al 10; un campo vacío no es un 0\nfunction puntuacion(formData: FormData, nombre: string) {\n  const valor = formData.get(nombre)\n  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN\n  return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null\n}\n\nexport async function guardarNota({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const sabor = puntuacion(formData, 'sabor')\n  const presentacion = puntuacion(formData, 'presentacion')\n  if (sabor === null || presentacion === null) {\n    return data({ error: 'Pon las dos notas, del 0 al 10.' }, { status: 400 })\n  }\n  await pedir(`/api/catas/${params.cata}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ sabor, presentacion }),\n  })\n  return { mensaje: 'Nota guardada.' }\n}\n\nexport default function Cata() {\n  const { cata, veces } = useLoaderData<typeof cargarCata>()\n  const actionData = useActionData<typeof guardarNota>()\n\n  return (\n    <article className=\"cata\" aria-labelledby=\"titulo-cata\">\n      <h2 id=\"titulo-cata\">\n        {cata.bar}: {cata.pincho}\n      </h2>\n      <p>\n        {cata.dia}, {cata.hora}\n      </p>\n      <p>\n        En la hoja del jurado:{' '}\n        {cata.sabor === null ? 'sin nota' : `${cata.sabor} de sabor y ${cata.presentacion} de presentación`}\n      </p>\n      <Form method=\"post\" key={cata.id}>\n        <div className=\"notas\">\n          <label>\n            Sabor\n            <input name=\"sabor\" type=\"number\" defaultValue={cata.sabor ?? ''} />\n          </label>\n          <label>\n            Presentación\n            <input name=\"presentacion\" type=\"number\" defaultValue={cata.presentacion ?? ''} />\n          </label>\n        </div>\n        <button>Guardar la nota</button>\n      </Form>\n      {actionData && 'error' in actionData && <p role=\"alert\">{actionData.error}</p>}\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n      <Veces loader=\"cata\" veces={veces} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "comun.tsx",
      "codigo": "export type Cata = {\n  id: number\n  ronda: number\n  dia: string\n  hora: string\n  bar: string\n  pincho: string\n  tipo: 'caliente' | 'frio'\n  sabor: number | null\n  presentacion: number | null\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\nexport function puntos(c: Cata) {\n  return c.sabor === null || c.presentacion === null ? null : c.sabor + c.presentacion\n}\n\nexport function nota(c: Cata) {\n  const total = puntos(c)\n  return total === null ? 'sin nota' : `${total} puntos`\n}\n\nexport type Fila = { bar: string; puntos: number; sabor: number }\n\n// Los cinco primeros: más puntos y, a igualdad, más nota de sabor\nexport function clasificar(catas: Cata[]): Fila[] {\n  return catas\n    .flatMap((c) => {\n      const total = puntos(c)\n      return total === null ? [] : [{ bar: c.bar, puntos: total, sabor: c.sabor ?? 0 }]\n    })\n    .sort((a, b) => b.puntos - a.puntos || b.sabor - a.sabor)\n    .slice(0, 5)\n}\n\n// Solo para la lección: cuántas veces se ha ejecutado cada loader\nexport const cargas = { concurso: 0, ronda: 0, cata: 0 }\n\nexport function Veces({ loader, veces }: { loader: string; veces: number }) {\n  return (\n    <p className=\"veces\">\n      loader {loader} · {veces} {veces === 1 ? 'vez' : 'veces'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #fdfaf5;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #9a3412;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0 0 0.25rem;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.75rem;\n}\n\nnav a {\n  color: #7c2d12;\n}\n\nnav a.active {\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.pagina {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n  padding: 0.75rem 1rem 1rem;\n}\n\nmain {\n  flex: 1 1 18rem;\n  min-width: 0;\n}\n\naside {\n  flex: 0 1 12rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.clasificacion {\n  margin: 0;\n  padding-left: 1.4rem;\n}\n\n.clasificacion li span:last-child {\n  float: right;\n  font-variant-numeric: tabular-nums;\n}\n\n.catas {\n  padding-left: 1.2rem;\n}\n\n.catas li {\n  margin-bottom: 0.3rem;\n}\n\n/* El contador de la lección: cuántas veces se ha ejecutado cada loader */\n.veces {\n  display: inline-block;\n  margin: 0.25rem 0;\n  padding: 0.05rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n  font: 0.8rem ui-monospace, monospace;\n}\n\n.cata {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a3412;\n  background: #fff;\n}\n\n.cata p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n}\n\n.notas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\ninput[type='number'] {\n  width: 5rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n  cursor: pointer;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  border: 1px dashed #a8a29e;\n  border-radius: 6px;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #7c2d12;\n}\n\n.simulador {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px dashed #b45309;\n  border-radius: 6px;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.simulador p {\n  margin: 0.25rem 0;\n}\n\n.actualizando {\n  min-height: 1.2em;\n  margin: 0;\n  color: #b45309;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "urlInicial": "/rondas/4",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "catas": [
      {
        "id": 1,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "12:00",
        "bar": "Bar Las Llanas",
        "pincho": "Morcilla con piquillo",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 7
      },
      {
        "id": 2,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "13:00",
        "bar": "Taberna El Espolón",
        "pincho": "Croqueta de queso fresco",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 3,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "14:00",
        "bar": "Café La Flora",
        "pincho": "Tosta de cecina",
        "tipo": "frio",
        "sabor": 6,
        "presentacion": 8
      },
      {
        "id": 4,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "12:00",
        "bar": "Bodega San Lesmes",
        "pincho": "Torrezno con mostaza",
        "tipo": "caliente",
        "sabor": 9,
        "presentacion": 6
      },
      {
        "id": 5,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "13:00",
        "bar": "Mesón La Merced",
        "pincho": "Lechazo en tempura",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 7
      },
      {
        "id": 6,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "14:00",
        "bar": "Bar El Pilón",
        "pincho": "Ensaladilla con ventresca",
        "tipo": "frio",
        "sabor": 5,
        "presentacion": 6
      },
      {
        "id": 7,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "12:00",
        "bar": "Taberna Huerto del Rey",
        "pincho": "Bacalao confitado",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 8
      },
      {
        "id": 8,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "13:00",
        "bar": "Cervecería Gamonal",
        "pincho": "Brocheta de pulpo",
        "tipo": "caliente",
        "sabor": 6,
        "presentacion": 7
      },
      {
        "id": 9,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "14:00",
        "bar": "Bar La Puebla",
        "pincho": "Gilda de anchoa",
        "tipo": "frio",
        "sabor": 7,
        "presentacion": 5
      },
      {
        "id": 10,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "12:00",
        "bar": "Mesón del Arlanzón",
        "pincho": "Pimiento relleno",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 11,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "13:00",
        "bar": "Bar Fernán González",
        "pincho": "Morcilla con miel",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 12,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "14:00",
        "bar": "Taberna Las Huelgas",
        "pincho": "Salmorejo con jamón",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 13,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "12:00",
        "bar": "Bar San Gil",
        "pincho": "Mini hamburguesa de buey",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 14,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "13:00",
        "bar": "Café del Arco",
        "pincho": "Tartar de remolacha",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 15,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "14:00",
        "bar": "Taberna Santa Clara",
        "pincho": "Patata brava",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

### Para un solo enlace: `defaultShouldRevalidate={false}`

«Ver las horas» añade `?horas=1` a la URL. Solo lo lee el componente de la ronda, con `useSearchParams` (lección 77 de React): ningún `loader` depende de él. Pero ha cambiado la búsqueda, y por la tercera regla el router lo repetiría todo. Para eso no hace falta tocar ninguna ruta: el propio enlace puede decir qué valor tiene `defaultShouldRevalidate` en esa navegación.

```tsx
// En Ronda.tsx. siguiente es la búsqueda actual con horas puesto o quitado
<Link to={`?${siguiente}`} defaultShouldRevalidate={false}>
  {conHoras ? 'Ocultar las horas' : 'Ver las horas'}
</Link>
```

Las rutas sin `shouldRevalidate` usan ese valor tal cual; las que tienen una lo reciben como `defaultShouldRevalidate` y siguen decidiendo. Lo admiten `<Link>`, `<Form>`, `<fetcher.Form>` y, como opción, `useSubmit`, `fetcher.submit`, `useNavigate` y `useSearchParams`.

**Vale para toda la página, no para una ruta.** Ponlo en el formulario del filtro y lo comprobarás: la dirección pasa a `?tipo=frio`, pero la lista sigue con los tres bares, porque el `loader` de la ronda, que sí lee el filtro, tampoco se ejecuta.

### Al revés: recargar donde el router no lo haría

`shouldRevalidate` también puede devolver `true` cuando `defaultShouldRevalidate` es `false`. El caso típico es un fallo que avisa de que lo que tienes en pantalla está viejo: un 409 porque otra persona ha cambiado la hoja mientras la editabas. El router no recarga tras un 409 devuelto; tú puedes pedírselo mirando `actionStatus`. Es el ejercicio 2.

## `useRevalidator`: cuando los datos cambian fuera de tu aplicación

Todas las reglas anteriores reaccionan a algo que pasa **dentro** de la aplicación: un envío o una navegación. Pero el jurado tiene cinco miembros, y cada uno puntúa desde su móvil, en la barra del bar. Lo que ellos guardan cambia el servidor, y tu pantalla no se entera hasta que hagas algo.

`useRevalidator()` devuelve dos cosas:

- `revalidate()`, que vuelve a ejecutar los `loader` de la página como si pulsaras la misma URL (`defaultShouldRevalidate` llega a `true`, y cada `shouldRevalidate` sigue decidiendo). Devuelve una promesa que se cumple al terminar.
- `state`, que vale `'loading'` mientras tanto e `'idle'` el resto del tiempo.

La documentación lo propone para lo que no son mutaciones normales: **al volver a la ventana o cada cierto tiempo**. Y avisa de lo contrario: si lo usas después de guardar algo, probablemente te sobra, porque `<Form>`, `useSubmit` y los fetchers ya revalidan solos (por eso la Action de React de la lección 3 lo necesitaba). En la lección 8 lo usaste para el botón «Reintentar» de un `ErrorBoundary`. Aquí, para refrescar la página cuando vuelves a la pestaña:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// Al volver a la pestaña, vuelve a pedir los datos de toda la página\nfunction useRevalidarAlVolver() {\n  const { revalidate, state } = useRevalidator()\n\n  useEffect(() => {\n    function alCambiar() {\n      if (document.visibilityState === 'visible') revalidate()\n    }\n    document.addEventListener('visibilitychange', alCambiar)\n    return () => document.removeEventListener('visibilitychange', alCambiar)\n  }, [revalidate])\n\n  return state\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  const estado = useRevalidarAlVolver()\n  // …\n  <p className=\"actualizando\" role=\"status\">\n    {estado === 'loading' ? 'Actualizando…' : ''}\n  </p>\n}",
  "anotaciones": [
    {
      "fragmento": "const { revalidate, state } = useRevalidator()",
      "nota": "revalidate es la misma función en cada render (React Router la crea con useCallback), así que puede ir en las dependencias sin volver a suscribirse. El objeto entero cambia cada vez que cambia state."
    },
    {
      "fragmento": "document.visibilityState === 'visible'",
      "nota": "visibilitychange salta al irte y al volver. Solo interesa la vuelta."
    },
    {
      "fragmento": "return () => document.removeEventListener",
      "nota": "La limpieza de la lección 38 de React. Sin ella, cada montaje (y StrictMode monta dos veces) dejaría un oyente más."
    },
    {
      "fragmento": "const estado = useRevalidarAlVolver()",
      "nota": "En la ruta raíz, para que funcione en todas las páginas del concurso. revalidate() no depende de dónde se llame: recarga la página entera."
    },
    {
      "fragmento": "<p className=\"actualizando\" role=\"status\">",
      "nota": "El aviso vive siempre en el DOM y cambia su texto: así un lector de pantalla anuncia «Actualizando…» (lección 37 de React)."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Lo que puntúa otra jueza",
  "consigna": "Pulsa «Otra jueza puntúa: 9 y 8»: el aviso dice que el servidor ya tiene la nota, y la pantalla sigue «sin nota». Cambia a otra pestaña del navegador y vuelve: la cabecera dice «Actualizando…», el registro apunta una «Revalidación /rondas/4/catas/11» que ejecuta los tres loader, y la hoja, la ronda y la clasificación se ponen al día.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect } from 'react'\nimport {\n  createBrowserRouter,\n  NavLink,\n  Outlet,\n  useLoaderData,\n  useRevalidator,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Ronda, { cargarRonda } from './Ronda'\nimport Cata, { cargarCata, guardarNota } from './Cata'\nimport { cargas, clasificar, pedir, Veces, type Cata as DatosCata } from './comun'\nimport './estilos.css'\n\nexport async function cargarConcurso({ request }: LoaderFunctionArgs) {\n  cargas.concurso += 1\n  const catas = await pedir<DatosCata[]>('/api/catas', { signal: request.signal })\n  return { clasificacion: clasificar(catas), veces: cargas.concurso }\n}\n\n// Al volver a la pestaña, vuelve a pedir los datos de toda la página\nfunction useRevalidarAlVolver() {\n  const { revalidate, state } = useRevalidator()\n\n  useEffect(() => {\n    function alCambiar() {\n      if (document.visibilityState === 'visible') revalidate()\n    }\n    document.addEventListener('visibilitychange', alCambiar)\n    return () => document.removeEventListener('visibilitychange', alCambiar)\n  }, [revalidate])\n\n  return state\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  const estado = useRevalidarAlVolver()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Concurso de Pinchos de Burgos · Jurado</p>\n        <nav aria-label=\"Rondas\">\n          {[1, 2, 3, 4, 5].map((n) => (\n            <NavLink key={n} to={`/rondas/${n}`}>\n              Ronda {n}\n            </NavLink>\n          ))}\n        </nav>\n        <p className=\"actualizando\" role=\"status\">\n          {estado === 'loading' ? 'Actualizando…' : ''}\n        </p>\n      </header>\n      <div className=\"pagina\">\n        <main>\n          <Outlet />\n        </main>\n        <aside aria-labelledby=\"titulo-clasificacion\">\n          <h2 id=\"titulo-clasificacion\">Clasificación</h2>\n          <ol className=\"clasificacion\">\n            {clasificacion.map((f) => (\n              <li key={f.bar}>\n                <span>{f.bar}</span> <span>{f.puntos} pts</span>\n              </li>\n            ))}\n          </ol>\n          <Veces loader=\"concurso\" veces={veces} />\n        </aside>\n      </div>\n    </>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    Component: Concurso,\n    HydrateFallback: () => <p>Abriendo el concurso…</p>,\n    children: [\n      { index: true, Component: () => <p>Elige una ronda.</p> },\n      {\n        id: 'ronda',\n        path: 'rondas/:ronda',\n        loader: cargarRonda,\n        Component: Ronda,\n        children: [\n          {\n            id: 'cata',\n            path: 'catas/:cata',\n            loader: cargarCata,\n            action: guardarNota,\n            Component: Cata,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Cata.tsx",
      "codigo": "import {\n  data,\n  Form,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargas, pedir, Veces, type Cata as DatosCata } from './comun'\nimport OtraJueza from './OtraJueza'\n\nexport async function cargarCata({ params, request }: LoaderFunctionArgs) {\n  cargas.cata += 1\n  const respuesta = await fetch(`/api/catas/${params.cata}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Esa cata no existe', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { cata: (await respuesta.json()) as DatosCata, veces: cargas.cata }\n}\n\n// Una nota del 0 al 10; un campo vacío no es un 0\nfunction puntuacion(formData: FormData, nombre: string) {\n  const valor = formData.get(nombre)\n  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN\n  return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null\n}\n\nexport async function guardarNota({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const sabor = puntuacion(formData, 'sabor')\n  const presentacion = puntuacion(formData, 'presentacion')\n  if (sabor === null || presentacion === null) {\n    return data({ error: 'Pon las dos notas, del 0 al 10.' }, { status: 400 })\n  }\n  await pedir(`/api/catas/${params.cata}`, {\n    method: 'PATCH',\n    body: JSON.stringify({ sabor, presentacion }),\n  })\n  return { mensaje: 'Nota guardada.' }\n}\n\nexport default function Cata() {\n  const { cata, veces } = useLoaderData<typeof cargarCata>()\n  const actionData = useActionData<typeof guardarNota>()\n\n  return (\n    <article className=\"cata\" aria-labelledby=\"titulo-cata\">\n      <h2 id=\"titulo-cata\">\n        {cata.bar}: {cata.pincho}\n      </h2>\n      <p>\n        {cata.dia}, {cata.hora}\n      </p>\n      <p>\n        En la hoja del jurado:{' '}\n        {cata.sabor === null ? 'sin nota' : `${cata.sabor} de sabor y ${cata.presentacion} de presentación`}\n      </p>\n      <Form method=\"post\" key={cata.id}>\n        <div className=\"notas\">\n          <label>\n            Sabor\n            <input name=\"sabor\" type=\"number\" defaultValue={cata.sabor ?? ''} />\n          </label>\n          <label>\n            Presentación\n            <input name=\"presentacion\" type=\"number\" defaultValue={cata.presentacion ?? ''} />\n          </label>\n        </div>\n        <button>Guardar la nota</button>\n      </Form>\n      {actionData && 'error' in actionData && <p role=\"alert\">{actionData.error}</p>}\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n      <Veces loader=\"cata\" veces={veces} />\n      <OtraJueza cata={cata} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "OtraJueza.tsx",
      "codigo": "import { useState } from 'react'\nimport { pedir, type Cata } from './comun'\n\n// Simula a otra jueza que puntúa desde su móvil, en la barra del bar.\n// Llama a la API directamente, sin pasar por el router: el router no se entera.\nexport default function OtraJueza({ cata }: { cata: Cata }) {\n  const [aviso, setAviso] = useState('')\n\n  async function puntuar() {\n    await pedir(`/api/catas/${cata.id}`, {\n      method: 'PATCH',\n      body: JSON.stringify({ sabor: 9, presentacion: 8 }),\n    })\n    setAviso('En el servidor ya pone 9 y 8.')\n  }\n\n  return (\n    <div className=\"simulador\">\n      <p>Mientras tanto, en la barra…</p>\n      <button onClick={puntuar}>Otra jueza puntúa: 9 y 8</button>\n      <p>{aviso}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Ronda.tsx",
      "codigo": "import { data, Form, Link, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata } from './comun'\n\nexport async function cargarRonda({ params, request }: LoaderFunctionArgs) {\n  cargas.ronda += 1\n  const numero = Number(params.ronda)\n  // El filtro va en la URL: /rondas/4?tipo=frio\n  const tipo = new URL(request.url).searchParams.get('tipo') ?? ''\n  const todas = await pedir<Cata[]>('/api/catas', { signal: request.signal })\n  const deLaRonda = todas.filter((c) => c.ronda === numero)\n  if (deLaRonda.length === 0) throw data('Esa ronda no existe', { status: 404 })\n  return {\n    numero,\n    dia: deLaRonda[0].dia,\n    tipo,\n    catas: deLaRonda.filter((c) => !tipo || c.tipo === tipo),\n    veces: cargas.ronda,\n  }\n}\n\nexport default function Ronda() {\n  const { numero, dia, tipo, catas, veces } = useLoaderData<typeof cargarRonda>()\n\n  return (\n    <>\n      <section aria-labelledby=\"titulo-ronda\">\n        <h1 id=\"titulo-ronda\">\n          Ronda {numero} · {dia}\n        </h1>\n        <Form method=\"get\" className=\"filtro\" key={`${numero}-${tipo}`}>\n          <label>\n            Tipo\n            <select name=\"tipo\" defaultValue={tipo}>\n              <option value=\"\">Todos</option>\n              <option value=\"caliente\">Caliente</option>\n              <option value=\"frio\">Frío</option>\n            </select>\n          </label>\n          <button>Filtrar</button>\n        </Form>\n        <ul className=\"catas\">\n          {catas.map((c) => (\n            <li key={c.id}>\n              <Link to={`catas/${c.id}`}>\n                {c.bar} · {nota(c)}\n              </Link>\n            </li>\n          ))}\n        </ul>\n        <Veces loader=\"ronda\" veces={veces} />\n      </section>\n      <Outlet />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "comun.tsx",
      "codigo": "export type Cata = {\n  id: number\n  ronda: number\n  dia: string\n  hora: string\n  bar: string\n  pincho: string\n  tipo: 'caliente' | 'frio'\n  sabor: number | null\n  presentacion: number | null\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\nexport function puntos(c: Cata) {\n  return c.sabor === null || c.presentacion === null ? null : c.sabor + c.presentacion\n}\n\nexport function nota(c: Cata) {\n  const total = puntos(c)\n  return total === null ? 'sin nota' : `${total} puntos`\n}\n\nexport type Fila = { bar: string; puntos: number; sabor: number }\n\n// Los cinco primeros: más puntos y, a igualdad, más nota de sabor\nexport function clasificar(catas: Cata[]): Fila[] {\n  return catas\n    .flatMap((c) => {\n      const total = puntos(c)\n      return total === null ? [] : [{ bar: c.bar, puntos: total, sabor: c.sabor ?? 0 }]\n    })\n    .sort((a, b) => b.puntos - a.puntos || b.sabor - a.sabor)\n    .slice(0, 5)\n}\n\n// Solo para la lección: cuántas veces se ha ejecutado cada loader\nexport const cargas = { concurso: 0, ronda: 0, cata: 0 }\n\nexport function Veces({ loader, veces }: { loader: string; veces: number }) {\n  return (\n    <p className=\"veces\">\n      loader {loader} · {veces} {veces === 1 ? 'vez' : 'veces'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #fdfaf5;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #9a3412;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0 0 0.25rem;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.75rem;\n}\n\nnav a {\n  color: #7c2d12;\n}\n\nnav a.active {\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.pagina {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n  padding: 0.75rem 1rem 1rem;\n}\n\nmain {\n  flex: 1 1 18rem;\n  min-width: 0;\n}\n\naside {\n  flex: 0 1 12rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.clasificacion {\n  margin: 0;\n  padding-left: 1.4rem;\n}\n\n.clasificacion li span:last-child {\n  float: right;\n  font-variant-numeric: tabular-nums;\n}\n\n.catas {\n  padding-left: 1.2rem;\n}\n\n.catas li {\n  margin-bottom: 0.3rem;\n}\n\n/* El contador de la lección: cuántas veces se ha ejecutado cada loader */\n.veces {\n  display: inline-block;\n  margin: 0.25rem 0;\n  padding: 0.05rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n  font: 0.8rem ui-monospace, monospace;\n}\n\n.cata {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a3412;\n  background: #fff;\n}\n\n.cata p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n}\n\n.notas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\ninput[type='number'] {\n  width: 5rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n  cursor: pointer;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  border: 1px dashed #a8a29e;\n  border-radius: 6px;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #7c2d12;\n}\n\n.simulador {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px dashed #b45309;\n  border-radius: 6px;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.simulador p {\n  margin: 0.25rem 0;\n}\n\n.actualizando {\n  min-height: 1.2em;\n  margin: 0;\n  color: #b45309;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "urlInicial": "/rondas/4/catas/11",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "catas": [
      {
        "id": 1,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "12:00",
        "bar": "Bar Las Llanas",
        "pincho": "Morcilla con piquillo",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 7
      },
      {
        "id": 2,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "13:00",
        "bar": "Taberna El Espolón",
        "pincho": "Croqueta de queso fresco",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 3,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "14:00",
        "bar": "Café La Flora",
        "pincho": "Tosta de cecina",
        "tipo": "frio",
        "sabor": 6,
        "presentacion": 8
      },
      {
        "id": 4,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "12:00",
        "bar": "Bodega San Lesmes",
        "pincho": "Torrezno con mostaza",
        "tipo": "caliente",
        "sabor": 9,
        "presentacion": 6
      },
      {
        "id": 5,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "13:00",
        "bar": "Mesón La Merced",
        "pincho": "Lechazo en tempura",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 7
      },
      {
        "id": 6,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "14:00",
        "bar": "Bar El Pilón",
        "pincho": "Ensaladilla con ventresca",
        "tipo": "frio",
        "sabor": 5,
        "presentacion": 6
      },
      {
        "id": 7,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "12:00",
        "bar": "Taberna Huerto del Rey",
        "pincho": "Bacalao confitado",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 8
      },
      {
        "id": 8,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "13:00",
        "bar": "Cervecería Gamonal",
        "pincho": "Brocheta de pulpo",
        "tipo": "caliente",
        "sabor": 6,
        "presentacion": 7
      },
      {
        "id": 9,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "14:00",
        "bar": "Bar La Puebla",
        "pincho": "Gilda de anchoa",
        "tipo": "frio",
        "sabor": 7,
        "presentacion": 5
      },
      {
        "id": 10,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "12:00",
        "bar": "Mesón del Arlanzón",
        "pincho": "Pimiento relleno",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 11,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "13:00",
        "bar": "Bar Fernán González",
        "pincho": "Morcilla con miel",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 12,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "14:00",
        "bar": "Taberna Las Huelgas",
        "pincho": "Salmorejo con jamón",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 13,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "12:00",
        "bar": "Bar San Gil",
        "pincho": "Mini hamburguesa de buey",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 14,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "13:00",
        "bar": "Café del Arco",
        "pincho": "Tartar de remolacha",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 15,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "14:00",
        "bar": "Taberna Santa Clara",
        "pincho": "Patata brava",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

`OtraJueza` llama a la API simulada con `fetch`, sin pasar por el router, igual que lo haría el móvil de otra persona: por eso el router no se entera hasta que se lo pides.

Dos variaciones habituales:

- **Cada cierto tiempo.** Un `setInterval` que llame a `revalidate()`, limpiado en el `return` del efecto. Mejor solo mientras la pestaña está visible, y con un intervalo largo: cada revalidación repite todos los `loader` de la página.
- **Cuando lo diga el servidor.** Un aviso por WebSocket o por *Server-Sent Events* («ha cambiado la cata 11») que llame a `revalidate()`. Así no preguntas a ciegas.

Si alguno de los `loader` de la página es caro, recuerda que `shouldRevalidate` también decide en estas revalidaciones: llegan con `currentUrl` y `nextUrl` iguales y sin `formMethod`.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué herramienta para cada caso",
  "roles": [
    {
      "etiqueta": "Lo que hace el router",
      "rol": "Casi siempre",
      "descripcion": "Tras un envío, toda la página; al navegar, lo que cambia. Empieza por aquí y mira el registro (o la pestaña Red) antes de recortar nada."
    },
    {
      "etiqueta": "shouldRevalidate → false",
      "rol": "Un loader caro que algo no cambia",
      "descripcion": "Una clasificación, un menú con permisos, unas estadísticas: cuando sabes qué envíos o qué partes de la URL no les afectan. Siempre con defaultShouldRevalidate al final."
    },
    {
      "etiqueta": "shouldRevalidate → true",
      "rol": "Un fallo que deja datos viejos",
      "descripcion": "Un 409 por conflicto, o una respuesta de la action que diga «esto ha cambiado». Lo lees en actionStatus o actionResult."
    },
    {
      "etiqueta": "useRevalidator",
      "rol": "Cambios que no pasan por tu app",
      "descripcion": "Volver a la pestaña, un temporizador, un aviso del servidor. También el «Reintentar» de un ErrorBoundary (lección 8)."
    }
  ]
}
```

Una advertencia de la propia documentación, que conviene tener presente: **saltarse una revalidación puede dejar la pantalla desincronizada del servidor**. Por eso recomienda decidir un caso concreto y devolver `defaultShouldRevalidate` en el resto, en vez de devolver siempre `false`. La sección siguiente enseña lo que pasa si no.

## Errores típicos

**Un `shouldRevalidate` que siempre dice que no.** «La hoja se carga una vez y ya está», piensa alguien, y escribe `shouldRevalidate: () => false` en la ruta de la cata. Parece una optimización inofensiva:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "{\n  id: 'cata',\n  path: 'catas/:cata',\n  loader: cargarCata,\n  action: guardarNota,\n  shouldRevalidate: () => false,\n  Component: Cata,\n}\n\n// Abres la hoja del Bar Fernán González (/rondas/4/catas/11).\n// Desde la lista, pulsas «Taberna Las Huelgas» (/rondas/4/catas/12),\n// pones 3 y 2 y guardas. ¿Qué pasa?",
  "opciones": [
    "Se abre la hoja de Las Huelgas y el 3 y 2 se guardan en ella",
    "La URL pasa a /catas/12, pero la hoja sigue enseñando el Bar Fernán González… y el 3 y 2 se guardan en Las Huelgas",
    "El router ignora shouldRevalidate cuando cambian los parámetros de la ruta",
    "Sale un error, porque los datos no coinciden con la URL"
  ],
  "correcta": 1,
  "explicacion": "Comprobado. La primera vez el loader se ejecuta (la ruta entra en pantalla y ni se pregunta). Al cambiar a la 12, shouldRevalidate dice false y la ruta se queda con los datos de la 11: el registro dice «No se volvió a ejecutar: concurso, ronda, cata». El formulario envía a la action de la URL actual, la de la 12, y la nota acaba en otro bar. Con parámetros, no te saltes nunca su cambio."
}
```

**Copiar el ejemplo de la documentación sin mirar los envíos.** La guía de optimización trae este ejemplo para no revalidar cuando solo cambia la búsqueda:

```tsx
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) {
    return false
  }
  return defaultShouldRevalidate
}
```

Puesto en la ruta del concurso, apaga algo más que el filtro: en un envío, `currentUrl` y `nextUrl` son la misma, así que la función devuelve `false` **también después de guardar una nota**. Comprobado: tras guardar el 9 y 8 del Bar Fernán González, el registro dijo «No se volvió a ejecutar: concurso», y la clasificación siguió con la Taberna Huerto del Rey en cabeza. Lo mismo con `useRevalidator` y al pulsar la misma URL. Y además no consigue lo que quería: de la cata 11 a `/rondas/4?tipo=frio` cambia el `pathname`, así que el concurso se recargó igual. Antes de comparar URL, mira si hay un envío, como en `revalidarClasificacion`.

**Devolver `true` en vez de `defaultShouldRevalidate`.** `return formData?.get('intent') !== 'horario'` parece lo mismo que el patrón recomendado, pero devuelve `true` en cada navegación: la clasificación se recargaría al abrir cualquier cata.

Y unas cuantas ideas que circulan y no son ciertas:

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un shouldRevalidate en la ruta hija evita que se recargue la madre",
      "realidad": "Cada ruta decide solo su loader. Con shouldRevalidate: () => false en cata, guardar una nota siguió recargando concurso y ronda (comprobado). Para frenar a la madre, pon la función en la madre."
    },
    {
      "mito": "shouldRevalidate decide también la primera carga de una ruta",
      "realidad": "No: una ruta que entra en pantalla carga siempre, y su shouldRevalidate ni se llama (comprobado con un console.log dentro)."
    },
    {
      "mito": "Un 4xx o un 5xx nunca revalida",
      "realidad": "Depende de cómo falla: devuelto o como Response lanzada, no; con data() lanzado o un Error, se recargan las rutas por encima del ErrorBoundary."
    },
    {
      "mito": "Si hay formMethod, es que se han enviado datos al servidor",
      "realidad": "Un Form con method=\"get\" también trae formMethod: 'GET', y su formData. Para separar envíos de navegaciones, compara con 'GET'."
    },
    {
      "mito": "Después de una action conviene llamar a revalidate() por si acaso",
      "realidad": "El router ya revalida tras cada action que va bien. Llamar a revalidate() vuelve a pedir los mismos datos otra vez."
    }
  ]
}
```

## Ejercicios

Los dos usan el concurso en TSX, con el registro debajo. Los contadores de cada ruta son los que miran las comprobaciones. El trabajo va donde dicen los comentarios numerados.

**1. La hora no mueve la clasificación.** La hoja de la cata tiene ahora dos formularios: uno cambia la hora a la que pasa el jurado (`intent=horario`) y el otro guarda la nota (`intent=nota`), con el patrón de la lección 3. Cambiar la hora no afecta a la clasificación, pero ahora la recarga entera.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cambiar la hora sin recargar la clasificación",
  "consigna": "En App.tsx: 1) escribe una función shouldRevalidate para la ruta concurso que devuelva false cuando el envío es el de la hora (mira formData) y defaultShouldRevalidate en todo lo demás; 2) pónsela a la ruta. Cambia la hora del Bar San Gil y mira el registro: «No se volvió a ejecutar: concurso». Después guarda una nota: la clasificación sí tiene que recargarse.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, NavLink, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Ronda, { cargarRonda } from './Ronda'\nimport Cata, { cargarCata, guardarNota } from './Cata'\nimport { cargas, clasificar, pedir, Veces, type Cata as DatosCata } from './comun'\nimport './estilos.css'\n\nexport async function cargarConcurso({ request }: LoaderFunctionArgs) {\n  cargas.concurso += 1\n  const catas = await pedir<DatosCata[]>('/api/catas', { signal: request.signal })\n  return { clasificacion: clasificar(catas), veces: cargas.concurso }\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Concurso de Pinchos de Burgos · Jurado</p>\n        <nav aria-label=\"Rondas\">\n          {[1, 2, 3, 4, 5].map((n) => (\n            <NavLink key={n} to={`/rondas/${n}`}>\n              Ronda {n}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <div className=\"pagina\">\n        <main>\n          <Outlet />\n        </main>\n        <aside aria-labelledby=\"titulo-clasificacion\">\n          <h2 id=\"titulo-clasificacion\">Clasificación</h2>\n          <ol className=\"clasificacion\">\n            {clasificacion.map((f) => (\n              <li key={f.bar}>\n                <span>{f.bar}</span> <span>{f.puntos} pts</span>\n              </li>\n            ))}\n          </ol>\n          <Veces loader=\"concurso\" veces={veces} />\n        </aside>\n      </div>\n    </>\n  )\n}\n\n// 1) Escribe aquí la función shouldRevalidate de la clasificación: que cambiar\n//    la hora de una cata no vuelva a ejecutar cargarConcurso, y que en todo lo\n//    demás el router haga lo de siempre.\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    // 2) Aquí, shouldRevalidate: la función que escribas arriba\n    Component: Concurso,\n    HydrateFallback: () => <p>Abriendo el concurso…</p>,\n    children: [\n      { index: true, Component: () => <p>Elige una ronda.</p> },\n      {\n        id: 'ronda',\n        path: 'rondas/:ronda',\n        loader: cargarRonda,\n        Component: Ronda,\n        children: [\n          {\n            id: 'cata',\n            path: 'catas/:cata',\n            loader: cargarCata,\n            action: guardarNota,\n            Component: Cata,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Cata.tsx",
      "codigo": "import {\n  data,\n  Form,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargas, pedir, Veces, type Cata as DatosCata } from './comun'\n\nconst HORAS = ['12:00', '13:00', '14:00', '19:00', '20:00']\n\nexport async function cargarCata({ params, request }: LoaderFunctionArgs) {\n  cargas.cata += 1\n  const respuesta = await fetch(`/api/catas/${params.cata}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Esa cata no existe', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { cata: (await respuesta.json()) as DatosCata, veces: cargas.cata }\n}\n\n// Una nota del 0 al 10; un campo vacío no es un 0\nfunction puntuacion(formData: FormData, nombre: string) {\n  const valor = formData.get(nombre)\n  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN\n  return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null\n}\n\nexport async function guardarNota({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const url = `/api/catas/${params.cata}`\n\n  if (formData.get('intent') === 'horario') {\n    const hora = String(formData.get('hora'))\n    await pedir(url, { method: 'PATCH', body: JSON.stringify({ hora }) })\n    return { mensaje: `Hora cambiada: ${hora}.` }\n  }\n\n  const sabor = puntuacion(formData, 'sabor')\n  const presentacion = puntuacion(formData, 'presentacion')\n  if (sabor === null || presentacion === null) {\n    return data({ error: 'Pon las dos notas, del 0 al 10.' }, { status: 400 })\n  }\n  await pedir(url, { method: 'PATCH', body: JSON.stringify({ sabor, presentacion }) })\n  return { mensaje: 'Nota guardada.' }\n}\n\nexport default function Cata() {\n  const { cata, veces } = useLoaderData<typeof cargarCata>()\n  const actionData = useActionData<typeof guardarNota>()\n\n  return (\n    <article className=\"cata\" aria-labelledby=\"titulo-cata\">\n      <h2 id=\"titulo-cata\">\n        {cata.bar}: {cata.pincho}\n      </h2>\n      <p>\n        {cata.dia}, {cata.hora}\n      </p>\n      <p>\n        En la hoja del jurado:{' '}\n        {cata.sabor === null ? 'sin nota' : `${cata.sabor} de sabor y ${cata.presentacion} de presentación`}\n      </p>\n      <Form method=\"post\" key={`hora-${cata.id}`}>\n        <label>\n          Hora\n          <select name=\"hora\" defaultValue={cata.hora}>\n            {HORAS.map((h) => (\n              <option key={h}>{h}</option>\n            ))}\n          </select>\n        </label>\n        <button name=\"intent\" value=\"horario\">\n          Cambiar la hora\n        </button>\n      </Form>\n      <Form method=\"post\" key={`nota-${cata.id}`}>\n        <div className=\"notas\">\n          <label>\n            Sabor\n            <input name=\"sabor\" type=\"number\" defaultValue={cata.sabor ?? ''} />\n          </label>\n          <label>\n            Presentación\n            <input name=\"presentacion\" type=\"number\" defaultValue={cata.presentacion ?? ''} />\n          </label>\n        </div>\n        <button name=\"intent\" value=\"nota\">\n          Guardar la nota\n        </button>\n      </Form>\n      {actionData && 'error' in actionData && <p role=\"alert\">{actionData.error}</p>}\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n      <Veces loader=\"cata\" veces={veces} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Ronda.tsx",
      "codigo": "import { data, Form, Link, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata } from './comun'\n\nexport async function cargarRonda({ params, request }: LoaderFunctionArgs) {\n  cargas.ronda += 1\n  const numero = Number(params.ronda)\n  // El filtro va en la URL: /rondas/4?tipo=frio\n  const tipo = new URL(request.url).searchParams.get('tipo') ?? ''\n  const todas = await pedir<Cata[]>('/api/catas', { signal: request.signal })\n  const deLaRonda = todas.filter((c) => c.ronda === numero)\n  if (deLaRonda.length === 0) throw data('Esa ronda no existe', { status: 404 })\n  return {\n    numero,\n    dia: deLaRonda[0].dia,\n    tipo,\n    catas: deLaRonda.filter((c) => !tipo || c.tipo === tipo),\n    veces: cargas.ronda,\n  }\n}\n\nexport default function Ronda() {\n  const { numero, dia, tipo, catas, veces } = useLoaderData<typeof cargarRonda>()\n\n  return (\n    <>\n      <section aria-labelledby=\"titulo-ronda\">\n        <h1 id=\"titulo-ronda\">\n          Ronda {numero} · {dia}\n        </h1>\n        <Form method=\"get\" className=\"filtro\" key={`${numero}-${tipo}`}>\n          <label>\n            Tipo\n            <select name=\"tipo\" defaultValue={tipo}>\n              <option value=\"\">Todos</option>\n              <option value=\"caliente\">Caliente</option>\n              <option value=\"frio\">Frío</option>\n            </select>\n          </label>\n          <button>Filtrar</button>\n        </Form>\n        <ul className=\"catas\">\n          {catas.map((c) => (\n            <li key={c.id}>\n              <Link to={`catas/${c.id}`}>\n                {c.bar} · {nota(c)}\n              </Link>\n            </li>\n          ))}\n        </ul>\n        <Veces loader=\"ronda\" veces={veces} />\n      </section>\n      <Outlet />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "comun.tsx",
      "codigo": "export type Cata = {\n  id: number\n  ronda: number\n  dia: string\n  hora: string\n  bar: string\n  pincho: string\n  tipo: 'caliente' | 'frio'\n  sabor: number | null\n  presentacion: number | null\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\nexport function puntos(c: Cata) {\n  return c.sabor === null || c.presentacion === null ? null : c.sabor + c.presentacion\n}\n\nexport function nota(c: Cata) {\n  const total = puntos(c)\n  return total === null ? 'sin nota' : `${total} puntos`\n}\n\nexport type Fila = { bar: string; puntos: number; sabor: number }\n\n// Los cinco primeros: más puntos y, a igualdad, más nota de sabor\nexport function clasificar(catas: Cata[]): Fila[] {\n  return catas\n    .flatMap((c) => {\n      const total = puntos(c)\n      return total === null ? [] : [{ bar: c.bar, puntos: total, sabor: c.sabor ?? 0 }]\n    })\n    .sort((a, b) => b.puntos - a.puntos || b.sabor - a.sabor)\n    .slice(0, 5)\n}\n\n// Solo para la lección: cuántas veces se ha ejecutado cada loader\nexport const cargas = { concurso: 0, ronda: 0, cata: 0 }\n\nexport function Veces({ loader, veces }: { loader: string; veces: number }) {\n  return (\n    <p className=\"veces\">\n      loader {loader} · {veces} {veces === 1 ? 'vez' : 'veces'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #fdfaf5;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #9a3412;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0 0 0.25rem;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.75rem;\n}\n\nnav a {\n  color: #7c2d12;\n}\n\nnav a.active {\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.pagina {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n  padding: 0.75rem 1rem 1rem;\n}\n\nmain {\n  flex: 1 1 18rem;\n  min-width: 0;\n}\n\naside {\n  flex: 0 1 12rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.clasificacion {\n  margin: 0;\n  padding-left: 1.4rem;\n}\n\n.clasificacion li span:last-child {\n  float: right;\n  font-variant-numeric: tabular-nums;\n}\n\n.catas {\n  padding-left: 1.2rem;\n}\n\n.catas li {\n  margin-bottom: 0.3rem;\n}\n\n/* El contador de la lección: cuántas veces se ha ejecutado cada loader */\n.veces {\n  display: inline-block;\n  margin: 0.25rem 0;\n  padding: 0.05rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n  font: 0.8rem ui-monospace, monospace;\n}\n\n.cata {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a3412;\n  background: #fff;\n}\n\n.cata p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n}\n\n.notas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\ninput[type='number'] {\n  width: 5rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n  cursor: pointer;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  border: 1px dashed #a8a29e;\n  border-radius: 6px;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #7c2d12;\n}\n\n.simulador {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px dashed #b45309;\n  border-radius: 6px;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.simulador p {\n  margin: 0.25rem 0;\n}\n\n.actualizando {\n  min-height: 1.2em;\n  margin: 0;\n  color: #b45309;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/rondas/5/catas/13",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "catas": [
      {
        "id": 1,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "12:00",
        "bar": "Bar Las Llanas",
        "pincho": "Morcilla con piquillo",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 7
      },
      {
        "id": 2,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "13:00",
        "bar": "Taberna El Espolón",
        "pincho": "Croqueta de queso fresco",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 3,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "14:00",
        "bar": "Café La Flora",
        "pincho": "Tosta de cecina",
        "tipo": "frio",
        "sabor": 6,
        "presentacion": 8
      },
      {
        "id": 4,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "12:00",
        "bar": "Bodega San Lesmes",
        "pincho": "Torrezno con mostaza",
        "tipo": "caliente",
        "sabor": 9,
        "presentacion": 6
      },
      {
        "id": 5,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "13:00",
        "bar": "Mesón La Merced",
        "pincho": "Lechazo en tempura",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 7
      },
      {
        "id": 6,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "14:00",
        "bar": "Bar El Pilón",
        "pincho": "Ensaladilla con ventresca",
        "tipo": "frio",
        "sabor": 5,
        "presentacion": 6
      },
      {
        "id": 7,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "12:00",
        "bar": "Taberna Huerto del Rey",
        "pincho": "Bacalao confitado",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 8
      },
      {
        "id": 8,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "13:00",
        "bar": "Cervecería Gamonal",
        "pincho": "Brocheta de pulpo",
        "tipo": "caliente",
        "sabor": 6,
        "presentacion": 7
      },
      {
        "id": 9,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "14:00",
        "bar": "Bar La Puebla",
        "pincho": "Gilda de anchoa",
        "tipo": "frio",
        "sabor": 7,
        "presentacion": 5
      },
      {
        "id": 10,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "12:00",
        "bar": "Mesón del Arlanzón",
        "pincho": "Pimiento relleno",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 11,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "13:00",
        "bar": "Bar Fernán González",
        "pincho": "Morcilla con miel",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 12,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "14:00",
        "bar": "Taberna Las Huelgas",
        "pincho": "Salmorejo con jamón",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 13,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "12:00",
        "bar": "Bar San Gil",
        "pincho": "Mini hamburguesa de buey",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 14,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "13:00",
        "bar": "Café del Arco",
        "pincho": "Tartar de remolacha",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 15,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "14:00",
        "bar": "Taberna Santa Clara",
        "pincho": "Patata brava",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Cambiar la hora no vuelve a ejecutar el loader de la clasificación",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Hora",
            "opcion": "20:00"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cambiar la hora"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Hora cambiada: 20:00."
          }
        },
        {
          "pulsar": {
            "texto": "loader cata · 2 veces"
          }
        }
      ],
      "espera": {
        "texto": "loader concurso · 1 vez"
      }
    },
    {
      "descripcion": "La hora nueva sale en la hoja de la cata",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Hora",
            "opcion": "20:00"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cambiar la hora"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Hora cambiada: 20:00."
          }
        }
      ],
      "espera": {
        "texto": "sábado 31 de octubre, 20:00"
      }
    },
    {
      "descripcion": "Guardar una nota sí vuelve a ejecutar el loader de la clasificación",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Sabor",
            "texto": "9"
          }
        },
        {
          "escribir": {
            "etiqueta": "Presentación",
            "texto": "9"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Nota guardada."
          }
        }
      ],
      "espera": {
        "texto": "loader concurso · 2 veces"
      }
    },
    {
      "descripcion": "Tras un 9 y 9, la clasificación da 18 puntos al Bar San Gil",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Sabor",
            "texto": "9"
          }
        },
        {
          "escribir": {
            "etiqueta": "Presentación",
            "texto": "9"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Bar San Gil 18 pts"
      }
    },
    {
      "descripcion": "Abrir otra cata de la ronda no vuelve a ejecutar la clasificación",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Café del Arco · sin nota"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Café del Arco: Tartar de remolacha"
          }
        }
      ],
      "espera": {
        "texto": "loader concurso · 1 vez"
      }
    },
    {
      "descripcion": "Pulsar la ronda en la que estás vuelve a ejecutar la clasificación",
      "urlInicial": "/rondas/5",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Ronda 5"
          }
        }
      ],
      "espera": {
        "texto": "loader concurso · 2 veces"
      }
    }
  ]
}
```

**2. Un conflicto que sí recarga.** Dos miembros del jurado pueden puntuar el mismo pincho. Para no pisarse, el formulario envía en un campo oculto la nota que estaba viendo (`visto`), y la `action` la compara con la hoja del servidor: si no coinciden, devuelve un 409 y no guarda. Funciona, pero la pantalla se queda con los datos viejos, porque tras un 409 devuelto el router no recarga nada.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tras un 409, la hoja que hay de verdad",
  "consigna": "Pulsa «Otra jueza puntúa: 9 y 8», pon 7 y 7 y guarda: sale el aviso del conflicto, pero la página sigue «sin nota». En comun.tsx, 1) escribe recargarSiHayConflicto, una función shouldRevalidate que devuelva true tras un 409 y defaultShouldRevalidate en todo lo demás; 2) en App.tsx, ponla en las tres rutas, porque las tres pintan la nota.",
  "archivos": [
    {
      "nombre": "comun.tsx",
      "codigo": "export type Cata = {\n  id: number\n  ronda: number\n  dia: string\n  hora: string\n  bar: string\n  pincho: string\n  tipo: 'caliente' | 'frio'\n  sabor: number | null\n  presentacion: number | null\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\nexport function puntos(c: Cata) {\n  return c.sabor === null || c.presentacion === null ? null : c.sabor + c.presentacion\n}\n\nexport function nota(c: Cata) {\n  const total = puntos(c)\n  return total === null ? 'sin nota' : `${total} puntos`\n}\n\nexport type Fila = { bar: string; puntos: number; sabor: number }\n\n// Los cinco primeros: más puntos y, a igualdad, más nota de sabor\nexport function clasificar(catas: Cata[]): Fila[] {\n  return catas\n    .flatMap((c) => {\n      const total = puntos(c)\n      return total === null ? [] : [{ bar: c.bar, puntos: total, sabor: c.sabor ?? 0 }]\n    })\n    .sort((a, b) => b.puntos - a.puntos || b.sabor - a.sabor)\n    .slice(0, 5)\n}\n\n// 1) Escribe aquí recargarSiHayConflicto, una función shouldRevalidate: tras\n//    un 409 tiene que volver a ejecutar el loader; en todo lo demás, lo de siempre.\n\n// Solo para la lección: cuántas veces se ha ejecutado cada loader\nexport const cargas = { concurso: 0, ronda: 0, cata: 0 }\n\nexport function Veces({ loader, veces }: { loader: string; veces: number }) {\n  return (\n    <p className=\"veces\">\n      loader {loader} · {veces} {veces === 1 ? 'vez' : 'veces'}\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, NavLink, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Ronda, { cargarRonda } from './Ronda'\nimport Cata, { cargarCata, guardarNota } from './Cata'\nimport { cargas, clasificar, pedir, Veces, type Cata as DatosCata } from './comun'\nimport './estilos.css'\n\nexport async function cargarConcurso({ request }: LoaderFunctionArgs) {\n  cargas.concurso += 1\n  const catas = await pedir<DatosCata[]>('/api/catas', { signal: request.signal })\n  return { clasificacion: clasificar(catas), veces: cargas.concurso }\n}\n\nfunction Concurso() {\n  const { clasificacion, veces } = useLoaderData<typeof cargarConcurso>()\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Concurso de Pinchos de Burgos · Jurado</p>\n        <nav aria-label=\"Rondas\">\n          {[1, 2, 3, 4, 5].map((n) => (\n            <NavLink key={n} to={`/rondas/${n}`}>\n              Ronda {n}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <div className=\"pagina\">\n        <main>\n          <Outlet />\n        </main>\n        <aside aria-labelledby=\"titulo-clasificacion\">\n          <h2 id=\"titulo-clasificacion\">Clasificación</h2>\n          <ol className=\"clasificacion\">\n            {clasificacion.map((f) => (\n              <li key={f.bar}>\n                <span>{f.bar}</span> <span>{f.puntos} pts</span>\n              </li>\n            ))}\n          </ol>\n          <Veces loader=\"concurso\" veces={veces} />\n        </aside>\n      </div>\n    </>\n  )\n}\n\n// 2) Usa recargarSiHayConflicto en las tres rutas, que pintan la nota\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'concurso',\n    path: '/',\n    loader: cargarConcurso,\n    Component: Concurso,\n    HydrateFallback: () => <p>Abriendo el concurso…</p>,\n    children: [\n      { index: true, Component: () => <p>Elige una ronda.</p> },\n      {\n        id: 'ronda',\n        path: 'rondas/:ronda',\n        loader: cargarRonda,\n        Component: Ronda,\n        children: [\n          {\n            id: 'cata',\n            path: 'catas/:cata',\n            loader: cargarCata,\n            action: guardarNota,\n            Component: Cata,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Cata.tsx",
      "codigo": "import {\n  data,\n  Form,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata as DatosCata } from './comun'\nimport OtraJueza from './OtraJueza'\n\nexport async function cargarCata({ params, request }: LoaderFunctionArgs) {\n  cargas.cata += 1\n  const respuesta = await fetch(`/api/catas/${params.cata}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Esa cata no existe', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { cata: (await respuesta.json()) as DatosCata, veces: cargas.cata }\n}\n\n// Una nota del 0 al 10; un campo vacío no es un 0\nfunction puntuacion(formData: FormData, nombre: string) {\n  const valor = formData.get(nombre)\n  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : NaN\n  return Number.isInteger(n) && n >= 0 && n <= 10 ? n : null\n}\n\nexport async function guardarNota({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const sabor = puntuacion(formData, 'sabor')\n  const presentacion = puntuacion(formData, 'presentacion')\n  if (sabor === null || presentacion === null) {\n    return data({ error: 'Pon las dos notas, del 0 al 10.' }, { status: 400 })\n  }\n  // Si la hoja ha cambiado desde que la cargaste, no la pises\n  const url = `/api/catas/${params.cata}`\n  const actual = await pedir<DatosCata>(url, { signal: request.signal })\n  if (formData.get('visto') !== nota(actual)) {\n    return data({ error: 'Otro miembro del jurado ha cambiado la nota. Revísala antes de guardar.' }, { status: 409 })\n  }\n  await pedir(url, { method: 'PATCH', body: JSON.stringify({ sabor, presentacion }) })\n  return { mensaje: 'Nota guardada.' }\n}\n\nexport default function Cata() {\n  const { cata, veces } = useLoaderData<typeof cargarCata>()\n  const actionData = useActionData<typeof guardarNota>()\n\n  return (\n    <article className=\"cata\" aria-labelledby=\"titulo-cata\">\n      <h2 id=\"titulo-cata\">\n        {cata.bar}: {cata.pincho}\n      </h2>\n      <p>\n        En la hoja del jurado:{' '}\n        {cata.sabor === null ? 'sin nota' : `${cata.sabor} de sabor y ${cata.presentacion} de presentación`}\n      </p>\n      {/* La key cambia con la hoja: si llega otra nota, el formulario arranca de ella */}\n      <Form method=\"post\" key={`${cata.id}-${nota(cata)}`}>\n        <input type=\"hidden\" name=\"visto\" value={nota(cata)} />\n        <div className=\"notas\">\n          <label>\n            Sabor\n            <input name=\"sabor\" type=\"number\" defaultValue={cata.sabor ?? ''} />\n          </label>\n          <label>\n            Presentación\n            <input name=\"presentacion\" type=\"number\" defaultValue={cata.presentacion ?? ''} />\n          </label>\n        </div>\n        <button>Guardar la nota</button>\n      </Form>\n      {actionData && 'error' in actionData && <p role=\"alert\">{actionData.error}</p>}\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n      <Veces loader=\"cata\" veces={veces} />\n      <OtraJueza cata={cata} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "OtraJueza.tsx",
      "codigo": "import { useState } from 'react'\nimport { pedir, type Cata } from './comun'\n\n// Simula a otra jueza que puntúa desde su móvil, en la barra del bar.\n// Llama a la API directamente, sin pasar por el router: el router no se entera.\nexport default function OtraJueza({ cata }: { cata: Cata }) {\n  const [aviso, setAviso] = useState('')\n\n  async function puntuar() {\n    await pedir(`/api/catas/${cata.id}`, {\n      method: 'PATCH',\n      body: JSON.stringify({ sabor: 9, presentacion: 8 }),\n    })\n    setAviso('En el servidor ya pone 9 y 8.')\n  }\n\n  return (\n    <div className=\"simulador\">\n      <p>Mientras tanto, en la barra…</p>\n      <button onClick={puntuar}>Otra jueza puntúa: 9 y 8</button>\n      <p>{aviso}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Ronda.tsx",
      "codigo": "import { data, Form, Link, Outlet, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { cargas, nota, pedir, Veces, type Cata } from './comun'\n\nexport async function cargarRonda({ params, request }: LoaderFunctionArgs) {\n  cargas.ronda += 1\n  const numero = Number(params.ronda)\n  // El filtro va en la URL: /rondas/4?tipo=frio\n  const tipo = new URL(request.url).searchParams.get('tipo') ?? ''\n  const todas = await pedir<Cata[]>('/api/catas', { signal: request.signal })\n  const deLaRonda = todas.filter((c) => c.ronda === numero)\n  if (deLaRonda.length === 0) throw data('Esa ronda no existe', { status: 404 })\n  return {\n    numero,\n    dia: deLaRonda[0].dia,\n    tipo,\n    catas: deLaRonda.filter((c) => !tipo || c.tipo === tipo),\n    veces: cargas.ronda,\n  }\n}\n\nexport default function Ronda() {\n  const { numero, dia, tipo, catas, veces } = useLoaderData<typeof cargarRonda>()\n\n  return (\n    <>\n      <section aria-labelledby=\"titulo-ronda\">\n        <h1 id=\"titulo-ronda\">\n          Ronda {numero} · {dia}\n        </h1>\n        <Form method=\"get\" className=\"filtro\" key={`${numero}-${tipo}`}>\n          <label>\n            Tipo\n            <select name=\"tipo\" defaultValue={tipo}>\n              <option value=\"\">Todos</option>\n              <option value=\"caliente\">Caliente</option>\n              <option value=\"frio\">Frío</option>\n            </select>\n          </label>\n          <button>Filtrar</button>\n        </Form>\n        <ul className=\"catas\">\n          {catas.map((c) => (\n            <li key={c.id}>\n              <Link to={`catas/${c.id}`}>\n                {c.bar} · {nota(c)}\n              </Link>\n            </li>\n          ))}\n        </ul>\n        <Veces loader=\"ronda\" veces={veces} />\n      </section>\n      <Outlet />\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #fdfaf5;\n}\n\nheader {\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #9a3412;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0 0 0.25rem;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 0.75rem;\n}\n\nnav a {\n  color: #7c2d12;\n}\n\nnav a.active {\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.pagina {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n  padding: 0.75rem 1rem 1rem;\n}\n\nmain {\n  flex: 1 1 18rem;\n  min-width: 0;\n}\n\naside {\n  flex: 0 1 12rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 6px;\n  background: #fff;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.clasificacion {\n  margin: 0;\n  padding-left: 1.4rem;\n}\n\n.clasificacion li span:last-child {\n  float: right;\n  font-variant-numeric: tabular-nums;\n}\n\n.catas {\n  padding-left: 1.2rem;\n}\n\n.catas li {\n  margin-bottom: 0.3rem;\n}\n\n/* El contador de la lección: cuántas veces se ha ejecutado cada loader */\n.veces {\n  display: inline-block;\n  margin: 0.25rem 0;\n  padding: 0.05rem 0.5rem;\n  border-radius: 999px;\n  background: #e7e5e4;\n  font: 0.8rem ui-monospace, monospace;\n}\n\n.cata {\n  margin-top: 0.75rem;\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #9a3412;\n  background: #fff;\n}\n\n.cata p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.5rem 0;\n}\n\n.notas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\ninput[type='number'] {\n  width: 5rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n  cursor: pointer;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  margin: 0.5rem 0;\n  border: 1px dashed #a8a29e;\n  border-radius: 6px;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #7c2d12;\n}\n\n.simulador {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px dashed #b45309;\n  border-radius: 6px;\n  background: #fffbeb;\n  font-size: 0.9rem;\n}\n\n.simulador p {\n  margin: 0.25rem 0;\n}\n\n.actualizando {\n  min-height: 1.2em;\n  margin: 0;\n  color: #b45309;\n  font-size: 0.85rem;\n}\n"
    }
  ],
  "archivoInicial": "comun.tsx",
  "urlInicial": "/rondas/4/catas/11",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "catas": [
      {
        "id": 1,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "12:00",
        "bar": "Bar Las Llanas",
        "pincho": "Morcilla con piquillo",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 7
      },
      {
        "id": 2,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "13:00",
        "bar": "Taberna El Espolón",
        "pincho": "Croqueta de queso fresco",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 3,
        "ronda": 1,
        "dia": "sábado 3 de octubre",
        "hora": "14:00",
        "bar": "Café La Flora",
        "pincho": "Tosta de cecina",
        "tipo": "frio",
        "sabor": 6,
        "presentacion": 8
      },
      {
        "id": 4,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "12:00",
        "bar": "Bodega San Lesmes",
        "pincho": "Torrezno con mostaza",
        "tipo": "caliente",
        "sabor": 9,
        "presentacion": 6
      },
      {
        "id": 5,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "13:00",
        "bar": "Mesón La Merced",
        "pincho": "Lechazo en tempura",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 7
      },
      {
        "id": 6,
        "ronda": 2,
        "dia": "sábado 10 de octubre",
        "hora": "14:00",
        "bar": "Bar El Pilón",
        "pincho": "Ensaladilla con ventresca",
        "tipo": "frio",
        "sabor": 5,
        "presentacion": 6
      },
      {
        "id": 7,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "12:00",
        "bar": "Taberna Huerto del Rey",
        "pincho": "Bacalao confitado",
        "tipo": "caliente",
        "sabor": 8,
        "presentacion": 8
      },
      {
        "id": 8,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "13:00",
        "bar": "Cervecería Gamonal",
        "pincho": "Brocheta de pulpo",
        "tipo": "caliente",
        "sabor": 6,
        "presentacion": 7
      },
      {
        "id": 9,
        "ronda": 3,
        "dia": "sábado 17 de octubre",
        "hora": "14:00",
        "bar": "Bar La Puebla",
        "pincho": "Gilda de anchoa",
        "tipo": "frio",
        "sabor": 7,
        "presentacion": 5
      },
      {
        "id": 10,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "12:00",
        "bar": "Mesón del Arlanzón",
        "pincho": "Pimiento relleno",
        "tipo": "caliente",
        "sabor": 7,
        "presentacion": 6
      },
      {
        "id": 11,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "13:00",
        "bar": "Bar Fernán González",
        "pincho": "Morcilla con miel",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 12,
        "ronda": 4,
        "dia": "sábado 24 de octubre",
        "hora": "14:00",
        "bar": "Taberna Las Huelgas",
        "pincho": "Salmorejo con jamón",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 13,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "12:00",
        "bar": "Bar San Gil",
        "pincho": "Mini hamburguesa de buey",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 14,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "13:00",
        "bar": "Café del Arco",
        "pincho": "Tartar de remolacha",
        "tipo": "frio",
        "sabor": null,
        "presentacion": null
      },
      {
        "id": 15,
        "ronda": 5,
        "dia": "sábado 31 de octubre",
        "hora": "14:00",
        "bar": "Taberna Santa Clara",
        "pincho": "Patata brava",
        "tipo": "caliente",
        "sabor": null,
        "presentacion": null
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Si otra jueza ha cambiado la hoja, guardar avisa del conflicto",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otra jueza puntúa: 9 y 8"
          }
        },
        {
          "pulsar": {
            "texto": "En el servidor ya pone 9 y 8."
          }
        },
        {
          "escribir": {
            "etiqueta": "Sabor",
            "texto": "7"
          }
        },
        {
          "escribir": {
            "etiqueta": "Presentación",
            "texto": "7"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Otro miembro del jurado ha cambiado la nota"
      }
    },
    {
      "descripcion": "Tras el conflicto, la hoja enseña lo que hay en el servidor: 9 y 8",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otra jueza puntúa: 9 y 8"
          }
        },
        {
          "pulsar": {
            "texto": "En el servidor ya pone 9 y 8."
          }
        },
        {
          "escribir": {
            "etiqueta": "Sabor",
            "texto": "7"
          }
        },
        {
          "escribir": {
            "etiqueta": "Presentación",
            "texto": "7"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "Otro miembro del jurado ha cambiado la nota"
          }
        }
      ],
      "espera": {
        "texto": "En la hoja del jurado: 9 de sabor y 8 de presentación"
      }
    },
    {
      "descripcion": "Tras el conflicto, la ronda también: «Bar Fernán González · 17 puntos»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otra jueza puntúa: 9 y 8"
          }
        },
        {
          "pulsar": {
            "texto": "En el servidor ya pone 9 y 8."
          }
        },
        {
          "escribir": {
            "etiqueta": "Sabor",
            "texto": "7"
          }
        },
        {
          "escribir": {
            "etiqueta": "Presentación",
            "texto": "7"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "Otro miembro del jurado ha cambiado la nota"
          }
        }
      ],
      "espera": {
        "rol": "link",
        "nombre": "Bar Fernán González · 17 puntos"
      }
    },
    {
      "descripcion": "Tras el conflicto, la clasificación también: el Bar Fernán González con 17 puntos",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Otra jueza puntúa: 9 y 8"
          }
        },
        {
          "pulsar": {
            "texto": "En el servidor ya pone 9 y 8."
          }
        },
        {
          "escribir": {
            "etiqueta": "Sabor",
            "texto": "7"
          }
        },
        {
          "escribir": {
            "etiqueta": "Presentación",
            "texto": "7"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "Otro miembro del jurado ha cambiado la nota"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Bar Fernán González 17 pts"
      }
    },
    {
      "descripcion": "Un error de validación (un 400) no vuelve a ejecutar la clasificación",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "Pon las dos notas, del 0 al 10."
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Taberna Las Huelgas · sin nota"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Taberna Las Huelgas: Salmorejo con jamón"
          }
        }
      ],
      "espera": {
        "texto": "loader concurso · 1 vez"
      }
    },
    {
      "descripcion": "Sin conflicto, guardar un 8 y 8 sigue recargando la clasificación",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Sabor",
            "texto": "8"
          }
        },
        {
          "escribir": {
            "etiqueta": "Presentación",
            "texto": "8"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar la nota"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Nota guardada."
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Bar Fernán González 16 pts"
      }
    },
    {
      "descripcion": "Abrir otra cata de la ronda no vuelve a ejecutar la clasificación",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Taberna Las Huelgas · sin nota"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Taberna Las Huelgas: Salmorejo con jamón"
          }
        }
      ],
      "espera": {
        "texto": "loader concurso · 1 vez"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio 1, cambiar la hora tampoco afecta a la lista de la ronda, que no la enseña. Haz que la ruta `ronda` tampoco se recargue con `intent=horario`. Después añade las horas a la lista, como en «Ver las horas», y decide si tenías que deshacerlo.
2. Añade a `useRevalidarAlVolver` un mínimo: que solo revalide si la pestaña ha estado oculta más de 30 segundos. Guarda en una ref (lección 33 de React) cuándo se ocultó.
3. Los sábados de 12:00 a 15:00 el jurado está de catas. Haz un `useRevalidarCada(milisegundos)` con `setInterval` que solo pregunte mientras la pestaña está visible, y úsalo en la ronda del día. Mira en el registro cada revalidación y cuántos `loader` repite; si alguno sobra, ya sabes qué hacer.
4. En un proyecto de Vite con React Router 8, pon un `console.log` en `shouldRevalidate` de cada ruta y recorre la aplicación: escribe en una tabla qué llega en `formMethod`, `actionStatus` y `defaultShouldRevalidate` en cada caso (un enlace, un filtro, un envío, un 409, `revalidate()`).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Revalidation Optimization",
      "descripcion": "El comportamiento por defecto en cada modo, shouldRevalidate ruta a ruta y defaultShouldRevalidate en un enlace o un envío. La guía de esta lección (con el ejemplo que conviene adaptar).",
      "url": "https://reactrouter.com/how-to/optimize-revalidation",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Route Object: shouldRevalidate",
      "descripcion": "Dónde va shouldRevalidate en el modo de datos y cuándo revalida un loader por defecto.",
      "url": "https://reactrouter.com/start/data/route-object",
      "etiqueta": "React Router"
    },
    {
      "titulo": "ShouldRevalidateFunctionArgs",
      "descripcion": "La referencia de todo lo que recibe shouldRevalidate, con sus comentarios.",
      "url": "https://api.reactrouter.com/v8/interfaces/react-router.ShouldRevalidateFunctionArgs.html",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useRevalidator",
      "descripcion": "revalidate() y state, y para qué casos lo recomienda la documentación (y para cuáles no).",
      "url": "https://reactrouter.com/api/hooks/useRevalidator",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Document: visibilitychange",
      "descripcion": "El evento que salta al cambiar de pestaña o minimizar la ventana, y document.visibilityState (en inglés).",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event",
      "etiqueta": "MDN"
    }
  ]
}
```
