# Cada ruta, sus datos: `loader` en paralelo, `request` y `signal`, y los datos de la madre

- **Módulo:** Cargar y enviar datos
- **Slug:** `cada-ruta-sus-datos-loader-en-paralelo-request-y-signal-y-los-datos-de-la-madre` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [Data Loading](https://reactrouter.com/start/data/data-loading) + [Route Object](https://reactrouter.com/start/data/route-object) + [Routing](https://reactrouter.com/start/data/routing) + [Race Conditions](https://reactrouter.com/explanation/race-conditions) + [useRouteLoaderData](https://reactrouter.com/api/hooks/useRouteLoaderData) + [useMatches](https://reactrouter.com/api/hooks/useMatches) + [Using handle](https://reactrouter.com/how-to/using-handle) — ver `contenido/react-router/TEMARIO.md` #2
- **Requiere:** La lección 1 de esta ficha y la 99 de React (el modo datos). Para comparar, la 52 de React (pedir datos con efectos) y la 77 (la búsqueda en la URL)

---

## Qué es y para qué sirve

La Liga Comarcal de Fútbol Sala del Bierzo juega cada sábado en los pabellones de Ponferrada, Bembibre, Fabero, Cacabelos y media comarca. Su web es sencilla: un menú con las tres ligas (Sénior, Femenina y Juvenil), la clasificación de cada una, la ficha de cada equipo y un buscador. Pero cada página necesita datos distintos, y algunas necesitan los de otra: la ficha del Atlético Fabero se ve **dentro** de la Liga Sénior, junto a la clasificación, y quiere decir en qué puesto va.

En la lección 99 de React viste lo básico de los `loader`: cada ruta declara los suyos, el router los ejecuta antes de pintar y el componente los lee con `useLoaderData`. En la 1 de esta ficha viste el ciclo entero de una navegación. Esta lección baja al detalle de una app con rutas anidadas, que es donde se nota lo que el router hace por ti:

- **Toda la rama, a la vez.** Los `loader` de la raíz, de la liga y del equipo empiezan juntos, sin la cascada que dejaban los efectos de la lección 52.
- **Lo que recibe cada `loader`**: los `params` de la URL y la petición, `request`, con la dirección completa. Con ella, una búsqueda hecha con `<Form method="get">`.
- **La carrera de peticiones**, el fallo del proyecto 78 de JavaScript: el router la resuelve solo, y `request.signal` le deja además cortar la petición vieja.
- **Los datos de otras rutas**: los de la madre con `useRouteLoaderData`, y los de toda la rama con `useMatches`, que junto con `handle` dan unas migas de pan.

**Cada ruta declara sus datos en su `loader`. El router ejecuta a la vez los de todas las rutas que encajan con la URL, les da a todos la misma petición y solo pinta lo que corresponde a la navegación que sigue en pie.**

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "React Router de verdad, y su registro",
  "contenido": "Los bloques en vivo ejecutan React Router 8.5.0 en TSX, con el panel de errores de tipos. El código es el de un proyecto de Vite: createBrowserRouter funciona, pero dentro de la vista previa usa un historial en memoria, y la barra de encima hace de barra de direcciones. Debajo de la vista previa tienes el panel de red de la API simulada y, en esta lección, el registro del router: cada carga y cada navegación, con los loader que ejecutó, cuándo empezó cada uno (+N ms) y cuánto tardó."
}
```

## Las rutas de la liga, escritas como objetos

Las rutas anidadas, los parámetros y las rutas índice ya los viste en la lección 77, escritos con `<Route>`. En el modo datos son objetos con los mismos campos (`path`, `index`, `children`) y, al lado, lo que el router necesita saber antes de pintar nada, como el `loader`. Este es el árbol de la liga, con lo que carga cada ruta:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas de la liga y lo que carga cada una",
  "nodos": [
    {
      "nombre": "Maquetacion",
      "nivel": 0,
      "etiqueta": "id: raiz",
      "nota": "/ · loader: las ligas del menú"
    },
    {
      "nombre": "Inicio",
      "nivel": 1,
      "nota": "índice · sin loader"
    },
    {
      "nombre": "Buscar",
      "nivel": 1,
      "etiqueta": "id: buscar",
      "nota": "buscar · loader: lee ?q= de la URL"
    },
    {
      "nombre": "LigaPagina",
      "nivel": 1,
      "etiqueta": "id: liga",
      "nota": "ligas/:ligaId · loader: la liga y su clasificación"
    },
    {
      "nombre": "ElegirEquipo",
      "nivel": 2,
      "nota": "índice · sin loader"
    },
    {
      "nombre": "EquipoPagina",
      "nivel": 2,
      "etiqueta": "id: equipo",
      "nota": "equipos/:equipoId · loader: la ficha"
    }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "const router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    loader: cargarLigas,\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la liga…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      { id: 'buscar', path: 'buscar', loader: cargarBusqueda, Component: Buscar },\n      {\n        id: 'liga',\n        path: 'ligas/:ligaId',\n        loader: cargarLiga,\n        Component: LigaPagina,\n        children: [\n          { index: true, Component: ElegirEquipo },\n          { id: 'equipo', path: 'equipos/:equipoId', loader: cargarEquipo, Component: EquipoPagina },\n        ],\n      },\n    ],\n  },\n])",
  "anotaciones": [
    {
      "fragmento": "id: 'raiz',",
      "nota": "Un nombre que le das tú a la ruta. Sin él, React Router le pone uno según su posición: aquí, la búsqueda sería «0-1». Lo necesitarás para useRouteLoaderData, y es el nombre que enseña el registro del router."
    },
    {
      "fragmento": "loader: cargarLigas,",
      "nota": "Cada ruta, su loader. El de la raíz trae las ligas del menú, que se ven en todas las páginas."
    },
    {
      "fragmento": "HydrateFallback:",
      "nota": "Lo que se ve en la carga inicial mientras corren los loader (lección 99)."
    },
    {
      "fragmento": "{ index: true, Component: Inicio },",
      "nota": "Una ruta índice, la de la portada, sin loader: no tiene nada que cargar."
    },
    {
      "fragmento": "path: 'ligas/:ligaId',",
      "nota": "Las hijas, sin barra delante, como en la lección 77. Su componente se pinta en el Outlet de la madre."
    },
    {
      "fragmento": "path: 'equipos/:equipoId'",
      "nota": "La ficha es hija de la liga: en /ligas/senior/equipos/2 encajan tres rutas con loader, la raíz, la liga y el equipo."
    }
  ]
}
```

Las rutas de maquetación sin `path`, los segmentos opcionales (`:temporada?`) y los comodines (`archivos/*`, que se leen en `params['*']`) se escriben igual, dentro de `path` o sin él: la [guía de rutas](https://reactrouter.com/start/data/routing) los recoge todos. **Lo nuevo respecto a la 77 es el `id`**: a partir de esta lección, dale uno a cada ruta cuyos datos vayas a leer desde otra.

## Toda la rama, a la vez

Primero, el punto de partida de la lección 52: cada componente pide sus datos en un efecto, con su bandera `ignorar` en la limpieza. Es la misma app, con las mismas rutas, pero sin un solo `loader`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con efectos: cada página pide al pintarse",
  "consigna": "La latencia está en 800 ms y StrictMode, apagado, para que cada petición salga una sola vez. Pulsa Reiniciar y mira el registro de red: las ligas y la liga salen a la vez, pero el equipo no sale hasta que llega la liga, porque la ficha vive dentro de la página de la liga y no existe hasta que esta se pinta. Dos esperas en fila: 1,6 s. Después pulsa otro equipo: la dirección cambia en el acto y la ficha se queda en «Cargando el equipo…».",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { createBrowserRouter, Link, NavLink, Outlet } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedir, type Liga } from './api'\nimport LigaPagina from './Liga'\nimport EquipoPagina from './Equipo'\nimport './estilos.css'\n\n// Sin loader: la maquetación pide las ligas en un efecto, al montarse\nfunction Maquetacion() {\n  const [ligas, setLigas] = useState<Liga[]>([])\n\n  useEffect(() => {\n    let ignorar = false\n    pedir<Liga[]>('/api/ligas').then((datos) => {\n      if (!ignorar) setLigas(datos)\n    })\n    return () => {\n      ignorar = true\n    }\n  }, [])\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Fútbol sala · Liga Comarcal del Bierzo</p>\n        <nav aria-label=\"Ligas\">\n          {ligas.map((liga) => (\n            <NavLink key={liga.id} to={`/ligas/${liga.id}`}>\n              {liga.corto}\n            </NavLink>\n          ))}\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction Inicio() {\n  return (\n    <>\n      <h1>Temporada 2026-2027</h1>\n      <p>\n        Elige una liga en el menú, o ve directo a la ficha del <Link to=\"/ligas/senior/equipos/2\">Atlético Fabero</Link>.\n      </p>\n    </>\n  )\n}\n\n// Las mismas rutas, pero sin un solo loader\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        path: 'ligas/:ligaId',\n        Component: LigaPagina,\n        children: [\n          { index: true, Component: () => <p>Elige un equipo para ver su ficha.</p> },\n          { path: 'equipos/:equipoId', Component: EquipoPagina },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Liga.tsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { Link, Outlet, useParams } from 'react-router'\nimport { pedir, type Liga } from './api'\n\nexport default function LigaPagina() {\n  const { ligaId } = useParams()\n  const [liga, setLiga] = useState<Liga | null>(null)\n\n  // La liga se pide cuando LigaPagina ya está en pantalla\n  useEffect(() => {\n    let ignorar = false\n    pedir<Liga>(`/api/ligas/${ligaId}`).then((datos) => {\n      if (!ignorar) setLiga(datos)\n    })\n    return () => {\n      ignorar = true\n    }\n  }, [ligaId])\n\n  if (!liga || liga.id !== ligaId) return <p className=\"cargando\">Cargando la liga…</p>\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{liga.nombre}</h1>\n        <p>Clasificación tras la jornada {liga.jornada}:</p>\n        <ol>\n          {liga.clasificacion.map((puesto) => (\n            <li key={puesto.equipoId}>\n              <Link to={`/ligas/${liga.id}/equipos/${puesto.equipoId}`}>{puesto.equipo}</Link> · {puesto.puntos} puntos\n            </li>\n          ))}\n        </ol>\n      </section>\n      {/* La ficha del equipo no existe hasta que llega la liga */}\n      <Outlet />\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Equipo.tsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { useParams } from 'react-router'\nimport { pedir, type Equipo } from './api'\n\nexport default function EquipoPagina() {\n  const { equipoId } = useParams()\n  const [equipo, setEquipo] = useState<Equipo | null>(null)\n\n  // Y el equipo, cuando EquipoPagina ya está en pantalla\n  useEffect(() => {\n    let ignorar = false\n    pedir<Equipo>(`/api/equipos/${equipoId}`).then((datos) => {\n      if (!ignorar) setEquipo(datos)\n    })\n    return () => {\n      ignorar = true\n    }\n  }, [equipoId])\n\n  if (!equipo || String(equipo.id) !== equipoId) return <p className=\"cargando\">Cargando el equipo…</p>\n\n  return (\n    <article className=\"ficha\">\n      <h2>{equipo.nombre}</h2>\n      <p>Localidad: {equipo.localidad}</p>\n      <p>Pabellón: {equipo.pabellon}</p>\n      <p>Entrenador: {equipo.entrenador}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "import { data } from 'react-router'\n\nexport type Puesto = { equipoId: number; equipo: string; puntos: number }\n\nexport type Liga = {\n  id: string\n  nombre: string\n  corto: string\n  jornada: number\n  clasificacion: Puesto[]\n}\n\nexport type Equipo = {\n  id: number\n  nombre: string\n  localidad: string\n  pabellon: string\n  entrenador: string\n  ligaId: string\n}\n\n// fetch con las comprobaciones de siempre. El signal es opcional:\n// si se lo pasas, la petición se puede cancelar.\nexport async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data('No está en la liga', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c2a1f;\n  background: #f7faf6;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #15803d;\n  background: #ecfdf3;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav a {\n  margin-right: 0.6rem;\n  color: #14532d;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh2 {\n  font-size: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.dos-columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\nol,\nul {\n  margin: 0 0 0.75rem;\n  padding-left: 1.3rem;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.ficha {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.ficha p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: end;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.85rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.5rem;\n}\n\n.sugerencias a {\n  margin-right: 0.5rem;\n}\n\n.cargando {\n  color: #6b7280;\n  font-style: italic;\n}\n\n.migas ol {\n  display: flex;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 0.4rem 1rem;\n  list-style: none;\n  font-size: 0.85rem;\n  background: #fff;\n  border-bottom: 1px solid #d1fae5;\n}\n\n.migas li {\n  margin: 0;\n}\n\n.migas li + li::before {\n  content: '›';\n  padding: 0 0.4rem;\n  color: #6b7280;\n}\n"
    }
  ],
  "archivoInicial": "Liga.tsx",
  "urlInicial": "/ligas/senior/equipos/2",
  "strictMode": false,
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "ligas": [
      {
        "id": "senior",
        "nombre": "Liga Sénior",
        "corto": "Sénior",
        "jornada": 9,
        "clasificacion": [
          {
            "equipoId": 3,
            "equipo": "Ponferrada Sur FS",
            "puntos": 22
          },
          {
            "equipoId": 2,
            "equipo": "Atlético Fabero",
            "puntos": 19
          },
          {
            "equipoId": 1,
            "equipo": "CD Bembibre Sala",
            "puntos": 17
          },
          {
            "equipoId": 4,
            "equipo": "FS Cacabelos",
            "puntos": 12
          },
          {
            "equipoId": 6,
            "equipo": "Villafranca FS",
            "puntos": 9
          },
          {
            "equipoId": 5,
            "equipo": "Toreno Sala",
            "puntos": 4
          }
        ]
      },
      {
        "id": "femenina",
        "nombre": "Liga Femenina",
        "corto": "Femenina",
        "jornada": 7,
        "clasificacion": [
          {
            "equipoId": 9,
            "equipo": "Las Médulas FS",
            "puntos": 18
          },
          {
            "equipoId": 7,
            "equipo": "Bembibre Femenino",
            "puntos": 13
          },
          {
            "equipoId": 10,
            "equipo": "Camponaraya FS",
            "puntos": 7
          },
          {
            "equipoId": 8,
            "equipo": "Ponferrada Sur Femenino",
            "puntos": 4
          }
        ]
      },
      {
        "id": "juvenil",
        "nombre": "Liga Juvenil",
        "corto": "Juvenil",
        "jornada": 8,
        "clasificacion": [
          {
            "equipoId": 11,
            "equipo": "Atlético Fabero Juvenil",
            "puntos": 19
          },
          {
            "equipoId": 13,
            "equipo": "Ponferrada Sur Juvenil",
            "puntos": 15
          },
          {
            "equipoId": 14,
            "equipo": "Cubillos del Sil FS",
            "puntos": 9
          },
          {
            "equipoId": 12,
            "equipo": "Cacabelos Juvenil",
            "puntos": 6
          }
        ]
      }
    ],
    "equipos": [
      {
        "id": 1,
        "nombre": "CD Bembibre Sala",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Marta Arias",
        "ligaId": "senior"
      },
      {
        "id": 2,
        "nombre": "Atlético Fabero",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Luis Prada",
        "ligaId": "senior"
      },
      {
        "id": 3,
        "nombre": "Ponferrada Sur FS",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Iván Rodera",
        "ligaId": "senior"
      },
      {
        "id": 4,
        "nombre": "FS Cacabelos",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Rosa Valcarce",
        "ligaId": "senior"
      },
      {
        "id": 5,
        "nombre": "Toreno Sala",
        "localidad": "Toreno",
        "pabellon": "Polideportivo de Toreno",
        "entrenador": "Andrés Gavela",
        "ligaId": "senior"
      },
      {
        "id": 6,
        "nombre": "Villafranca FS",
        "localidad": "Villafranca del Bierzo",
        "pabellon": "Pabellón del Burbia",
        "entrenador": "Nuria Ferradal",
        "ligaId": "senior"
      },
      {
        "id": 7,
        "nombre": "Bembibre Femenino",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Sara Lorenzana",
        "ligaId": "femenina"
      },
      {
        "id": 8,
        "nombre": "Ponferrada Sur Femenino",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Elena Cuadrado",
        "ligaId": "femenina"
      },
      {
        "id": 9,
        "nombre": "Las Médulas FS",
        "localidad": "Carucedo",
        "pabellon": "Polideportivo de Carucedo",
        "entrenador": "Pilar Merayo",
        "ligaId": "femenina"
      },
      {
        "id": 10,
        "nombre": "Camponaraya FS",
        "localidad": "Camponaraya",
        "pabellon": "Pabellón de Camponaraya",
        "entrenador": "Lucía Alba",
        "ligaId": "femenina"
      },
      {
        "id": 11,
        "nombre": "Atlético Fabero Juvenil",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Diego Fidalgo",
        "ligaId": "juvenil"
      },
      {
        "id": 12,
        "nombre": "Cacabelos Juvenil",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Hugo Bello",
        "ligaId": "juvenil"
      },
      {
        "id": 13,
        "nombre": "Ponferrada Sur Juvenil",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Raúl Nogaledo",
        "ligaId": "juvenil"
      },
      {
        "id": 14,
        "nombre": "Cubillos del Sil FS",
        "localidad": "Cubillos del Sil",
        "pabellon": "Polideportivo de Cubillos",
        "entrenador": "Javier Otero",
        "ligaId": "juvenil"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

**El componente tiene que existir para pedir sus datos**, y la ficha está dentro de la liga: la cascada sale de la forma del árbol, no de un descuido. Y mira el registro del router al pulsar otro equipo: una navegación vacía, de 0 a 2 ms, sin un solo paso. El router no tiene nada que hacer; el trabajo llega después, en los efectos.

Ahora, la misma app con un `loader` en cada ruta y sin un solo `useEffect`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con un loader en cada ruta: todo a la vez",
  "consigna": "Pulsa Reiniciar y lee la primera entrada del registro del router: «Carga inicial /ligas/senior/equipos/2», con los loader raiz, liga y equipo empezando a la vez y tardando lo mismo. Ochocientos milisegundos en total, la mitad que con efectos. Después pulsa «Ponferrada Sur FS»: la ficha de antes sigue en pantalla hasta que llegan los datos, y el registro dice qué se ejecutó y qué no. Por último, cambia a «Femenina».",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, NavLink, Outlet, useLoaderData, useNavigation, useRouteError } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedir, type Liga } from './api'\nimport LigaPagina, { cargarLiga, ElegirEquipo } from './Liga'\nimport EquipoPagina, { cargarEquipo } from './Equipo'\nimport './estilos.css'\n\n// El loader de la ruta raíz: las ligas, para el menú\nasync function cargarLigas({ request }: LoaderFunctionArgs) {\n  return { ligas: await pedir<Liga[]>('/api/ligas', request.signal) }\n}\n\nfunction Maquetacion() {\n  const { ligas } = useLoaderData<typeof cargarLigas>()\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Fútbol sala · Liga Comarcal del Bierzo</p>\n        <nav aria-label=\"Ligas\">\n          {ligas.map((liga) => (\n            <NavLink key={liga.id} to={`/ligas/${liga.id}`}>\n              {liga.corto}\n            </NavLink>\n          ))}\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction Inicio() {\n  return (\n    <>\n      <h1>Temporada 2026-2027</h1>\n      <p>\n        Elige una liga en el menú, o ve directo a la ficha del <Link to=\"/ligas/senior/equipos/2\">Atlético Fabero</Link>.\n      </p>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/\">Volver al inicio</Link>\n    </main>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    loader: cargarLigas,\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la liga…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        id: 'liga',\n        path: 'ligas/:ligaId',\n        loader: cargarLiga,\n        Component: LigaPagina,\n        children: [\n          { index: true, Component: ElegirEquipo },\n          { id: 'equipo', path: 'equipos/:equipoId', loader: cargarEquipo, Component: EquipoPagina },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Liga.tsx",
      "codigo": "import { Link, Outlet, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Liga } from './api'\n\nexport async function cargarLiga({ params, request }: LoaderFunctionArgs) {\n  const liga = await pedir<Liga>(`/api/ligas/${params.ligaId}`, request.signal)\n  return { liga }\n}\n\nexport default function LigaPagina() {\n  const { liga } = useLoaderData<typeof cargarLiga>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{liga.nombre}</h1>\n        <p>Clasificación tras la jornada {liga.jornada}:</p>\n        <ol>\n          {liga.clasificacion.map((puesto) => (\n            <li key={puesto.equipoId}>\n              <Link to={`/ligas/${liga.id}/equipos/${puesto.equipoId}`}>{puesto.equipo}</Link> · {puesto.puntos} puntos\n            </li>\n          ))}\n        </ol>\n      </section>\n      {/* Aquí se pinta la ruta hija: la ficha del equipo */}\n      <Outlet />\n    </div>\n  )\n}\n\nexport function ElegirEquipo() {\n  return <p>Elige un equipo para ver su ficha.</p>\n}\n"
    },
    {
      "nombre": "Equipo.tsx",
      "codigo": "import { data, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Equipo } from './api'\n\nexport async function cargarEquipo({ params, request }: LoaderFunctionArgs) {\n  const equipo = await pedir<Equipo>(`/api/equipos/${params.equipoId}`, request.signal)\n  // La hija también recibe :ligaId. /ligas/femenina/equipos/2 no existe\n  if (equipo.ligaId !== params.ligaId) throw data('Ese equipo no juega en esta liga', { status: 404 })\n  return { equipo }\n}\n\nexport default function EquipoPagina() {\n  const { equipo } = useLoaderData<typeof cargarEquipo>()\n\n  return (\n    <article className=\"ficha\">\n      <h2>{equipo.nombre}</h2>\n      <p>Localidad: {equipo.localidad}</p>\n      <p>Pabellón: {equipo.pabellon}</p>\n      <p>Entrenador: {equipo.entrenador}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "import { data } from 'react-router'\n\nexport type Puesto = { equipoId: number; equipo: string; puntos: number }\n\nexport type Liga = {\n  id: string\n  nombre: string\n  corto: string\n  jornada: number\n  clasificacion: Puesto[]\n}\n\nexport type Equipo = {\n  id: number\n  nombre: string\n  localidad: string\n  pabellon: string\n  entrenador: string\n  ligaId: string\n}\n\n// fetch con las comprobaciones de siempre. El signal es opcional:\n// si se lo pasas, la petición se puede cancelar.\nexport async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data('No está en la liga', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c2a1f;\n  background: #f7faf6;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #15803d;\n  background: #ecfdf3;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav a {\n  margin-right: 0.6rem;\n  color: #14532d;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh2 {\n  font-size: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.dos-columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\nol,\nul {\n  margin: 0 0 0.75rem;\n  padding-left: 1.3rem;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.ficha {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.ficha p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: end;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.85rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.5rem;\n}\n\n.sugerencias a {\n  margin-right: 0.5rem;\n}\n\n.cargando {\n  color: #6b7280;\n  font-style: italic;\n}\n\n.migas ol {\n  display: flex;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 0.4rem 1rem;\n  list-style: none;\n  font-size: 0.85rem;\n  background: #fff;\n  border-bottom: 1px solid #d1fae5;\n}\n\n.migas li {\n  margin: 0;\n}\n\n.migas li + li::before {\n  content: '›';\n  padding: 0 0.4rem;\n  color: #6b7280;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/ligas/senior/equipos/2",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "ligas": [
      {
        "id": "senior",
        "nombre": "Liga Sénior",
        "corto": "Sénior",
        "jornada": 9,
        "clasificacion": [
          {
            "equipoId": 3,
            "equipo": "Ponferrada Sur FS",
            "puntos": 22
          },
          {
            "equipoId": 2,
            "equipo": "Atlético Fabero",
            "puntos": 19
          },
          {
            "equipoId": 1,
            "equipo": "CD Bembibre Sala",
            "puntos": 17
          },
          {
            "equipoId": 4,
            "equipo": "FS Cacabelos",
            "puntos": 12
          },
          {
            "equipoId": 6,
            "equipo": "Villafranca FS",
            "puntos": 9
          },
          {
            "equipoId": 5,
            "equipo": "Toreno Sala",
            "puntos": 4
          }
        ]
      },
      {
        "id": "femenina",
        "nombre": "Liga Femenina",
        "corto": "Femenina",
        "jornada": 7,
        "clasificacion": [
          {
            "equipoId": 9,
            "equipo": "Las Médulas FS",
            "puntos": 18
          },
          {
            "equipoId": 7,
            "equipo": "Bembibre Femenino",
            "puntos": 13
          },
          {
            "equipoId": 10,
            "equipo": "Camponaraya FS",
            "puntos": 7
          },
          {
            "equipoId": 8,
            "equipo": "Ponferrada Sur Femenino",
            "puntos": 4
          }
        ]
      },
      {
        "id": "juvenil",
        "nombre": "Liga Juvenil",
        "corto": "Juvenil",
        "jornada": 8,
        "clasificacion": [
          {
            "equipoId": 11,
            "equipo": "Atlético Fabero Juvenil",
            "puntos": 19
          },
          {
            "equipoId": 13,
            "equipo": "Ponferrada Sur Juvenil",
            "puntos": 15
          },
          {
            "equipoId": 14,
            "equipo": "Cubillos del Sil FS",
            "puntos": 9
          },
          {
            "equipoId": 12,
            "equipo": "Cacabelos Juvenil",
            "puntos": 6
          }
        ]
      }
    ],
    "equipos": [
      {
        "id": 1,
        "nombre": "CD Bembibre Sala",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Marta Arias",
        "ligaId": "senior"
      },
      {
        "id": 2,
        "nombre": "Atlético Fabero",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Luis Prada",
        "ligaId": "senior"
      },
      {
        "id": 3,
        "nombre": "Ponferrada Sur FS",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Iván Rodera",
        "ligaId": "senior"
      },
      {
        "id": 4,
        "nombre": "FS Cacabelos",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Rosa Valcarce",
        "ligaId": "senior"
      },
      {
        "id": 5,
        "nombre": "Toreno Sala",
        "localidad": "Toreno",
        "pabellon": "Polideportivo de Toreno",
        "entrenador": "Andrés Gavela",
        "ligaId": "senior"
      },
      {
        "id": 6,
        "nombre": "Villafranca FS",
        "localidad": "Villafranca del Bierzo",
        "pabellon": "Pabellón del Burbia",
        "entrenador": "Nuria Ferradal",
        "ligaId": "senior"
      },
      {
        "id": 7,
        "nombre": "Bembibre Femenino",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Sara Lorenzana",
        "ligaId": "femenina"
      },
      {
        "id": 8,
        "nombre": "Ponferrada Sur Femenino",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Elena Cuadrado",
        "ligaId": "femenina"
      },
      {
        "id": 9,
        "nombre": "Las Médulas FS",
        "localidad": "Carucedo",
        "pabellon": "Polideportivo de Carucedo",
        "entrenador": "Pilar Merayo",
        "ligaId": "femenina"
      },
      {
        "id": 10,
        "nombre": "Camponaraya FS",
        "localidad": "Camponaraya",
        "pabellon": "Pabellón de Camponaraya",
        "entrenador": "Lucía Alba",
        "ligaId": "femenina"
      },
      {
        "id": 11,
        "nombre": "Atlético Fabero Juvenil",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Diego Fidalgo",
        "ligaId": "juvenil"
      },
      {
        "id": 12,
        "nombre": "Cacabelos Juvenil",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Hugo Bello",
        "ligaId": "juvenil"
      },
      {
        "id": 13,
        "nombre": "Ponferrada Sur Juvenil",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Raúl Nogaledo",
        "ligaId": "juvenil"
      },
      {
        "id": 14,
        "nombre": "Cubillos del Sil FS",
        "localidad": "Cubillos del Sil",
        "pabellon": "Polideportivo de Cubillos",
        "entrenador": "Javier Otero",
        "ligaId": "juvenil"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Esto es lo que escribió el registro en Chromium, con los mismos clics (las barras de cada paso no salen aquí):

```text
#1 Carga inicial /ligas/senior/equipos/2 · 808 ms                terminado
   Carga   loader raiz · +4 ms · 803 ms
           loader liga · +4 ms · 804 ms
           loader equipo · +4 ms · 804 ms
   Se ejecutó: raiz, liga, equipo.
#2 Navegación → /ligas/senior/equipos/3 · 803 ms                  terminado
   Carga   loader equipo · +1 ms · 801 ms
   Se ejecutó: equipo.
   No se volvió a ejecutar: raiz, liga.
#3 Navegación → /ligas/femenina · 803 ms                          terminado
   Carga   loader liga · +1 ms · 801 ms
   Se ejecutó: liga.
   No se volvió a ejecutar: raiz.
```

Tres cosas que se leen ahí:

- **Empiezan juntos.** Los tres pasos de la carga inicial dicen `+4 ms`: el router encaja la URL con las rutas, encuentra tres `loader` y los lanza a la vez, sin esperar a que se pinte nadie. El de la hija no espera al de la madre.
- **La página cambia de una vez**, cuando han terminado todos los de la navegación. Hasta entonces se queda la de antes, atenuada; qué enseñar mientras tanto es la lección 6.
- **Solo se repite lo que cambia.** De un equipo a otro solo cambia `:equipoId`, así que solo vuelve a ejecutarse el `loader` del equipo; la liga y el menú siguen valiendo. Es la revalidación por defecto, cuyas reglas completas, con sus excepciones, son la lección 4.

Una consecuencia de que vayan a la vez: **un `loader` no puede leer lo que devuelve el de su madre**, porque cuando empieza, el de la madre tampoco ha terminado. Lo que sí comparten es la URL:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La raíz no tiene parámetros en su path ('/')\nasync function cargarLigas({ params, request }: LoaderFunctionArgs) {\n  console.log(params)\n  return { ligas: await pedir<Liga[]>('/api/ligas', request.signal) }\n}\n\n// Abres /ligas/senior/equipos/2. ¿Qué escribe la consola?",
  "opciones": [
    "{}: la raíz no tiene parámetros",
    "{ ligaId: 'senior' }: solo los de las rutas por encima de la hoja",
    "{ ligaId: 'senior', equipoId: '2' }",
    "{ ligaId: 'senior', equipoId: 2 }"
  ],
  "correcta": 2,
  "explicacion": "Todas las rutas de la rama reciben los parámetros de toda la URL, también la raíz, y siempre como texto: '2', no 2. Comprobado con la 8.5.0 en la vista previa: los tres loader recibieron el mismo objeto, y useParams en la maquetación también ve equipoId. Por eso la ficha puede comprobar :ligaId, como verás enseguida."
}
```

Así que, si la hija necesita algo de la madre:

- Si está en la URL, lo tiene en `params`, como la liga en la ficha del equipo.
- Si son datos que ya cargó la madre, se leen en el **componente** con `useRouteLoaderData`, más abajo.
- Lo que no conviene es que el `loader` de la hija llame al de la madre: lo verás en los errores típicos.
- Compartir algo calculado entre `loader` de la misma navegación es trabajo del middleware y su contexto (lección 10).

## Lo que recibe un `loader`, y lo que devuelve

Un `loader` es una función que recibe un objeto con tres cosas y devuelve lo que quieras:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "params: los de toda la URL",
      "texto": "Los mismos en todas las rutas de la rama, la raíz incluida. Siempre texto, aunque parezcan números, y en TypeScript string | undefined: el tipo no sabe qué ruta usa cada loader."
    },
    {
      "titulo": "request: la petición",
      "texto": "Un Request estándar con method GET. request.url es la dirección completa, con su búsqueda; en la vista previa empieza por http://localhost, el origen del historial en memoria. Y request.signal, que el router aborta si la navegación se interrumpe."
    },
    {
      "titulo": "context: para el middleware",
      "texto": "En React Router 8 siempre existe. Lo que el middleware deja ahí lo leen los loader de la misma navegación: lección 10."
    },
    {
      "titulo": "Lo que devuelve",
      "texto": "Cualquier valor; lo normal es un objeto con lo que necesita el componente. Lanzando data() o redirect() vas al ErrorBoundary o a otra página (lección 99), y con promesas sin await dejas datos para después (lección 9)."
    }
  ]
}
```

En TSX, la ficha del equipo queda así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { data, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Equipo } from './api'\n\nexport async function cargarEquipo({ params, request }: LoaderFunctionArgs) {\n  const equipo = await pedir<Equipo>(`/api/equipos/${params.equipoId}`, request.signal)\n  // La hija también recibe :ligaId. /ligas/femenina/equipos/2 no existe\n  if (equipo.ligaId !== params.ligaId) throw data('Ese equipo no juega en esta liga', { status: 404 })\n  return { equipo }\n}\n\nexport default function EquipoPagina() {\n  const { equipo } = useLoaderData<typeof cargarEquipo>()\n\n  return (\n    <article className=\"ficha\">\n      <h2>{equipo.nombre}</h2>\n      <p>Localidad: {equipo.localidad}</p>\n      <p>Pabellón: {equipo.pabellon}</p>\n      <p>Entrenador: {equipo.entrenador}</p>\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "{ params, request }: LoaderFunctionArgs",
      "nota": "El tipo de lo que recibe un loader. Con él, params y request quedan tipados y el editor te los completa."
    },
    {
      "fragmento": "${params.equipoId}",
      "nota": "Es string | undefined. Dentro de una plantilla de texto TypeScript no protesta, porque undefined también se convierte en texto; si lo pasas a una función que pide un string, sí. Lo ves justo debajo."
    },
    {
      "fragmento": "request.signal)",
      "nota": "El signal de la navegación, que pedir() le pasa a fetch. Para qué sirve, en la sección de las carreras."
    },
    {
      "fragmento": "if (equipo.ligaId !== params.ligaId)",
      "nota": "La hija también recibe :ligaId. Sin esta comprobación, /ligas/femenina/equipos/2 enseñaría al Atlético Fabero dentro de la Liga Femenina."
    },
    {
      "fragmento": "throw data('Ese equipo no juega en esta liga', { status: 404 })",
      "nota": "Un 404 lanzado, como en la lección 99: va al ErrorBoundary. Adónde sube cada error, en la lección 8."
    },
    {
      "fragmento": "useLoaderData<typeof cargarEquipo>()",
      "nota": "Con el genérico, TypeScript deduce el tipo de lo que devuelve el loader: { equipo: Equipo }. Sin él, el resultado es any y no te avisa de nada. Los tipos del router a fondo, en la lección 15."
    }
  ]
}
```

**Un `params` es `string | undefined`, y eso solo te protege donde hace falta un `string`.** Si escribes una función `urlDeEquipo(id: string)` y le pasas `params.equipoId`, el panel de tipos dice (comprobado con TypeScript 6.0.3 y los tipos de React Router 8.5.0):

```text
Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

Es decir: le pasas algo que puede ser `undefined` a una función que pide un texto. Lo que TypeScript **no** ve es un nombre mal escrito: `params` admite cualquier nombre, así que `params.equipold` (con ele) compila sin aviso, vale `undefined` y acaba en `/api/equipos/undefined`. Cuando el parámetro importa, sácalo y compruébalo una vez:

```tsx
const { equipoId } = params
if (!equipoId) throw data('Falta el equipo', { status: 404 })
// A partir de aquí, equipoId es string
```

## La búsqueda, del formulario al `loader`

En la lección 77, el filtro de la lista vivía en la búsqueda de la URL (`?barrio=actur`) y lo leía el componente con `useSearchParams`. En el modo datos, quien lo lee es el `loader`: la búsqueda es parte de la URL, y la URL entera llega en `request.url`.

```tsx
export async function cargarBusqueda({ request }: LoaderFunctionArgs) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''
  // …
}
```

Para escribir en la URL no hace falta nada tuyo: **un `<Form method="get">` hace lo que hace un formulario de HTML con GET**. Junta sus campos en una búsqueda (`?q=fabero`, con `+` en vez de espacios), navega a la ruta del formulario con ella y el router ejecuta los `loader`. Sin `onSubmit`, sin estado y sin efecto. Como es una navegación, Atrás, Recargar y compartir el enlace funcionan solos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El buscador de equipos: la URL manda",
  "consigna": "Busca «fabero» y después «Flores del Sil». La barra lleva la búsqueda, con + en vez de espacios, y la línea gris enseña la request.url que recibió el loader, con http://localhost delante. Pulsa Atrás y Recargar: la búsqueda se conserva. En el registro del router, fíjate en qué loader se ejecutan con cada búsqueda. El loader está en Buscar.tsx.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, NavLink, Outlet, useLoaderData, useNavigation, useRouteError } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedir, type Liga } from './api'\nimport LigaPagina, { cargarLiga, ElegirEquipo } from './Liga'\nimport EquipoPagina, { cargarEquipo } from './Equipo'\nimport Buscar, { cargarBusqueda } from './Buscar'\nimport './estilos.css'\n\n// El loader de la ruta raíz: las ligas, para el menú\nasync function cargarLigas({ request }: LoaderFunctionArgs) {\n  return { ligas: await pedir<Liga[]>('/api/ligas', request.signal) }\n}\n\nfunction Maquetacion() {\n  const { ligas } = useLoaderData<typeof cargarLigas>()\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Fútbol sala · Liga Comarcal del Bierzo</p>\n        <nav aria-label=\"Ligas\">\n          {ligas.map((liga) => (\n            <NavLink key={liga.id} to={`/ligas/${liga.id}`}>\n              {liga.corto}\n            </NavLink>\n          ))}\n          <NavLink to=\"/buscar\">Buscar</NavLink>\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction Inicio() {\n  return (\n    <>\n      <h1>Temporada 2026-2027</h1>\n      <p>\n        Elige una liga en el menú, o ve directo a la ficha del <Link to=\"/ligas/senior/equipos/2\">Atlético Fabero</Link>.\n      </p>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/\">Volver al inicio</Link>\n    </main>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    loader: cargarLigas,\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la liga…</p>,\n    children: [\n      { index: true, Component: Inicio },\n      { id: 'buscar', path: 'buscar', loader: cargarBusqueda, Component: Buscar },\n      {\n        id: 'liga',\n        path: 'ligas/:ligaId',\n        loader: cargarLiga,\n        Component: LigaPagina,\n        children: [\n          { index: true, Component: ElegirEquipo },\n          { id: 'equipo', path: 'equipos/:equipoId', loader: cargarEquipo, Component: EquipoPagina },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Buscar.tsx",
      "codigo": "import { Form, Link, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Equipo } from './api'\n\nexport async function cargarBusqueda({ request }: LoaderFunctionArgs) {\n  // request.url es la dirección completa: http://localhost/buscar?q=…\n  const q = new URL(request.url).searchParams.get('q')?.trim() ?? ''\n  if (!q) return { q, equipos: [], recibida: request.url }\n\n  const equipos = await pedir<Equipo[]>(`/api/equipos?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, equipos, recibida: request.url }\n}\n\nexport default function Buscar() {\n  const { q, equipos, recibida } = useLoaderData<typeof cargarBusqueda>()\n\n  return (\n    <>\n      <h1>Buscar equipos</h1>\n      <Form method=\"get\">\n        <label>\n          Equipo, localidad o pabellón\n          <input type=\"search\" name=\"q\" defaultValue={q} key={q} />\n        </label>\n        <button>Buscar</button>\n      </Form>\n      <p className=\"cargando\">El loader recibió {recibida}</p>\n      {q && (\n        <p>\n          {equipos.length} {equipos.length === 1 ? 'equipo' : 'equipos'} para «{q}»\n        </p>\n      )}\n      <ul>\n        {equipos.map((equipo) => (\n          <li key={equipo.id}>\n            <Link to={`/ligas/${equipo.ligaId}/equipos/${equipo.id}`}>{equipo.nombre}</Link> · {equipo.localidad}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Liga.tsx",
      "codigo": "import { Link, Outlet, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Liga } from './api'\n\nexport async function cargarLiga({ params, request }: LoaderFunctionArgs) {\n  const liga = await pedir<Liga>(`/api/ligas/${params.ligaId}`, request.signal)\n  return { liga }\n}\n\nexport default function LigaPagina() {\n  const { liga } = useLoaderData<typeof cargarLiga>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{liga.nombre}</h1>\n        <p>Clasificación tras la jornada {liga.jornada}:</p>\n        <ol>\n          {liga.clasificacion.map((puesto) => (\n            <li key={puesto.equipoId}>\n              <Link to={`/ligas/${liga.id}/equipos/${puesto.equipoId}`}>{puesto.equipo}</Link> · {puesto.puntos} puntos\n            </li>\n          ))}\n        </ol>\n      </section>\n      {/* Aquí se pinta la ruta hija: la ficha del equipo */}\n      <Outlet />\n    </div>\n  )\n}\n\nexport function ElegirEquipo() {\n  return <p>Elige un equipo para ver su ficha.</p>\n}\n"
    },
    {
      "nombre": "Equipo.tsx",
      "codigo": "import { data, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Equipo } from './api'\n\nexport async function cargarEquipo({ params, request }: LoaderFunctionArgs) {\n  const equipo = await pedir<Equipo>(`/api/equipos/${params.equipoId}`, request.signal)\n  // La hija también recibe :ligaId. /ligas/femenina/equipos/2 no existe\n  if (equipo.ligaId !== params.ligaId) throw data('Ese equipo no juega en esta liga', { status: 404 })\n  return { equipo }\n}\n\nexport default function EquipoPagina() {\n  const { equipo } = useLoaderData<typeof cargarEquipo>()\n\n  return (\n    <article className=\"ficha\">\n      <h2>{equipo.nombre}</h2>\n      <p>Localidad: {equipo.localidad}</p>\n      <p>Pabellón: {equipo.pabellon}</p>\n      <p>Entrenador: {equipo.entrenador}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "import { data } from 'react-router'\n\nexport type Puesto = { equipoId: number; equipo: string; puntos: number }\n\nexport type Liga = {\n  id: string\n  nombre: string\n  corto: string\n  jornada: number\n  clasificacion: Puesto[]\n}\n\nexport type Equipo = {\n  id: number\n  nombre: string\n  localidad: string\n  pabellon: string\n  entrenador: string\n  ligaId: string\n}\n\n// fetch con las comprobaciones de siempre. El signal es opcional:\n// si se lo pasas, la petición se puede cancelar.\nexport async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data('No está en la liga', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c2a1f;\n  background: #f7faf6;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #15803d;\n  background: #ecfdf3;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav a {\n  margin-right: 0.6rem;\n  color: #14532d;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh2 {\n  font-size: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.dos-columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\nol,\nul {\n  margin: 0 0 0.75rem;\n  padding-left: 1.3rem;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.ficha {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.ficha p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: end;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.85rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.5rem;\n}\n\n.sugerencias a {\n  margin-right: 0.5rem;\n}\n\n.cargando {\n  color: #6b7280;\n  font-style: italic;\n}\n\n.migas ol {\n  display: flex;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 0.4rem 1rem;\n  list-style: none;\n  font-size: 0.85rem;\n  background: #fff;\n  border-bottom: 1px solid #d1fae5;\n}\n\n.migas li {\n  margin: 0;\n}\n\n.migas li + li::before {\n  content: '›';\n  padding: 0 0.4rem;\n  color: #6b7280;\n}\n"
    }
  ],
  "archivoInicial": "Buscar.tsx",
  "urlInicial": "/buscar",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "ligas": [
      {
        "id": "senior",
        "nombre": "Liga Sénior",
        "corto": "Sénior",
        "jornada": 9,
        "clasificacion": [
          {
            "equipoId": 3,
            "equipo": "Ponferrada Sur FS",
            "puntos": 22
          },
          {
            "equipoId": 2,
            "equipo": "Atlético Fabero",
            "puntos": 19
          },
          {
            "equipoId": 1,
            "equipo": "CD Bembibre Sala",
            "puntos": 17
          },
          {
            "equipoId": 4,
            "equipo": "FS Cacabelos",
            "puntos": 12
          },
          {
            "equipoId": 6,
            "equipo": "Villafranca FS",
            "puntos": 9
          },
          {
            "equipoId": 5,
            "equipo": "Toreno Sala",
            "puntos": 4
          }
        ]
      },
      {
        "id": "femenina",
        "nombre": "Liga Femenina",
        "corto": "Femenina",
        "jornada": 7,
        "clasificacion": [
          {
            "equipoId": 9,
            "equipo": "Las Médulas FS",
            "puntos": 18
          },
          {
            "equipoId": 7,
            "equipo": "Bembibre Femenino",
            "puntos": 13
          },
          {
            "equipoId": 10,
            "equipo": "Camponaraya FS",
            "puntos": 7
          },
          {
            "equipoId": 8,
            "equipo": "Ponferrada Sur Femenino",
            "puntos": 4
          }
        ]
      },
      {
        "id": "juvenil",
        "nombre": "Liga Juvenil",
        "corto": "Juvenil",
        "jornada": 8,
        "clasificacion": [
          {
            "equipoId": 11,
            "equipo": "Atlético Fabero Juvenil",
            "puntos": 19
          },
          {
            "equipoId": 13,
            "equipo": "Ponferrada Sur Juvenil",
            "puntos": 15
          },
          {
            "equipoId": 14,
            "equipo": "Cubillos del Sil FS",
            "puntos": 9
          },
          {
            "equipoId": 12,
            "equipo": "Cacabelos Juvenil",
            "puntos": 6
          }
        ]
      }
    ],
    "equipos": [
      {
        "id": 1,
        "nombre": "CD Bembibre Sala",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Marta Arias",
        "ligaId": "senior"
      },
      {
        "id": 2,
        "nombre": "Atlético Fabero",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Luis Prada",
        "ligaId": "senior"
      },
      {
        "id": 3,
        "nombre": "Ponferrada Sur FS",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Iván Rodera",
        "ligaId": "senior"
      },
      {
        "id": 4,
        "nombre": "FS Cacabelos",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Rosa Valcarce",
        "ligaId": "senior"
      },
      {
        "id": 5,
        "nombre": "Toreno Sala",
        "localidad": "Toreno",
        "pabellon": "Polideportivo de Toreno",
        "entrenador": "Andrés Gavela",
        "ligaId": "senior"
      },
      {
        "id": 6,
        "nombre": "Villafranca FS",
        "localidad": "Villafranca del Bierzo",
        "pabellon": "Pabellón del Burbia",
        "entrenador": "Nuria Ferradal",
        "ligaId": "senior"
      },
      {
        "id": 7,
        "nombre": "Bembibre Femenino",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Sara Lorenzana",
        "ligaId": "femenina"
      },
      {
        "id": 8,
        "nombre": "Ponferrada Sur Femenino",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Elena Cuadrado",
        "ligaId": "femenina"
      },
      {
        "id": 9,
        "nombre": "Las Médulas FS",
        "localidad": "Carucedo",
        "pabellon": "Polideportivo de Carucedo",
        "entrenador": "Pilar Merayo",
        "ligaId": "femenina"
      },
      {
        "id": 10,
        "nombre": "Camponaraya FS",
        "localidad": "Camponaraya",
        "pabellon": "Pabellón de Camponaraya",
        "entrenador": "Lucía Alba",
        "ligaId": "femenina"
      },
      {
        "id": 11,
        "nombre": "Atlético Fabero Juvenil",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Diego Fidalgo",
        "ligaId": "juvenil"
      },
      {
        "id": 12,
        "nombre": "Cacabelos Juvenil",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Hugo Bello",
        "ligaId": "juvenil"
      },
      {
        "id": 13,
        "nombre": "Ponferrada Sur Juvenil",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Raúl Nogaledo",
        "ligaId": "juvenil"
      },
      {
        "id": 14,
        "nombre": "Cubillos del Sil FS",
        "localidad": "Cubillos del Sil",
        "pabellon": "Polideportivo de Cubillos",
        "entrenador": "Javier Otero",
        "ligaId": "juvenil"
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

Dos cosas del registro y del formulario.

**Cada búsqueda vuelve a ejecutar también el `loader` de la raíz.** El registro lo dice en cada entrada: «Se ejecutó: raiz, buscar». Por defecto, cuando cambia la búsqueda de la URL, React Router vuelve a ejecutar todos los `loader` de la página, porque cualquiera de ellos podría leerla. Las ligas del menú no dependen de `?q`, y cómo decírselo al router con `shouldRevalidate` es la lección 4.

**El campo tiene que seguir a la URL.** Fíjate en el `key={q}` del campo de búsqueda, y mira qué pasa sin él:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "<Form method=\"get\">\n  <label>\n    Equipo, localidad o pabellón\n    <input type=\"search\" name=\"q\" defaultValue={q} /> {/* sin key */}\n  </label>\n  <button>Buscar</button>\n</Form>\n\n// Buscas «fabero», después «Flores del Sil», y pulsas Atrás.\n// La lista vuelve a los equipos de Fabero. ¿Qué dice el campo?",
  "opciones": [
    "«fabero»: defaultValue cambia con q",
    "«Flores del Sil»: el campo es el mismo y conserva lo que escribiste",
    "Nada: Atrás vacía los formularios",
    "«fabero», pero solo después de un instante, cuando React vuelve a pintar"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en Chromium: el campo siguió diciendo «Flores del Sil» con la lista de Fabero. Atrás cambia la URL y los datos, pero el componente y su input son los mismos, y defaultValue solo es el valor con el que nace un campo no controlado (lección 22). Con key={q}, cada búsqueda es un campo nuevo que nace con la suya: la regla de la lección 26. Con un select pasa igual."
}
```

## Carreras: `request.signal` y la navegación que se queda vieja

En el proyecto 78 de JavaScript apareció un fallo que solo se ve navegando deprisa: dos peticiones en marcha, la lenta llega la última y su resultado tapa el de la buena. La lección 52 de React lo arregló en los efectos con una bandera `ignorar` en la limpieza. **Con un `loader` no tienes que escribir nada**, y en este bloque lo puedes comprobar: el panel de red tiene activado «Responder desordenado», así que, con dos peticiones a la vez, la primera llega siempre la última.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La misma carrera, con un efecto y con un loader",
  "consigna": "En «Con un efecto», pulsa «Ponferrada» y enseguida «Fabero»: el título dice «fabero» y, al rato, la lista se llena con los de Ponferrada. Ahora en «Con un loader», lo mismo: acaba en Fabero, el registro de red da la de Ponferrada como cancelada y el registro del router dice «cancelada por #…». Después, en Buscar.tsx, quita request.signal de la llamada a pedir y repite.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, NavLink, Outlet, redirect, useNavigation } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Buscar, { cargarBusqueda } from './Buscar'\nimport BuscarConEfecto from './BuscarConEfecto'\nimport './estilos.css'\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Fútbol sala · Liga Comarcal del Bierzo</p>\n        <nav aria-label=\"Buscadores\">\n          <NavLink to=\"/buscar-con-efecto\">Con un efecto</NavLink>\n          <NavLink to=\"/buscar\">Con un loader</NavLink>\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    children: [\n      { index: true, loader: () => redirect('/buscar-con-efecto') },\n      { path: 'buscar-con-efecto', Component: BuscarConEfecto },\n      { id: 'buscar', path: 'buscar', loader: cargarBusqueda, Component: Buscar },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "BuscarConEfecto.tsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { Link, useSearchParams } from 'react-router'\nimport { pedir, type Equipo } from './api'\n\nexport default function BuscarConEfecto() {\n  const [searchParams] = useSearchParams()\n  const q = searchParams.get('q') ?? ''\n  const [equipos, setEquipos] = useState<Equipo[]>([])\n\n  // Sin limpieza, a propósito: es el fallo del proyecto 78 de JavaScript.\n  // Cada respuesta que llega se pinta, aunque ya no sea la de la URL.\n  useEffect(() => {\n    if (!q) return\n    pedir<Equipo[]>(`/api/equipos?q=${encodeURIComponent(q)}`).then(setEquipos)\n  }, [q])\n\n  return (\n    <>\n      <h1>Buscar con un efecto</h1>\n      <p className=\"sugerencias\">\n        Prueba: <Link to=\"?q=ponferrada\">Ponferrada</Link>\n        <Link to=\"?q=fabero\">Fabero</Link>\n        <Link to=\"?q=bembibre\">Bembibre</Link>\n      </p>\n      {q && <h2>Resultados para «{q}»</h2>}\n      <ul>\n        {equipos.map((equipo) => (\n          <li key={equipo.id}>\n            {equipo.nombre} ({equipo.localidad})\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Buscar.tsx",
      "codigo": "import { Link, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Equipo } from './api'\n\nexport async function cargarBusqueda({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  if (!q) return { q, equipos: [] }\n  // El signal de la navegación: si empieza otra, esta petición se cancela\n  const equipos = await pedir<Equipo[]>(`/api/equipos?q=${encodeURIComponent(q)}`, request.signal)\n  return { q, equipos }\n}\n\nexport default function Buscar() {\n  const { q, equipos } = useLoaderData<typeof cargarBusqueda>()\n\n  return (\n    <>\n      <h1>Buscar con un loader</h1>\n      <p className=\"sugerencias\">\n        Prueba: <Link to=\"?q=ponferrada\">Ponferrada</Link>\n        <Link to=\"?q=fabero\">Fabero</Link>\n        <Link to=\"?q=bembibre\">Bembibre</Link>\n      </p>\n      {q && <h2>Resultados para «{q}»</h2>}\n      <ul>\n        {equipos.map((equipo) => (\n          <li key={equipo.id}>\n            {equipo.nombre} ({equipo.localidad})\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "import { data } from 'react-router'\n\nexport type Puesto = { equipoId: number; equipo: string; puntos: number }\n\nexport type Liga = {\n  id: string\n  nombre: string\n  corto: string\n  jornada: number\n  clasificacion: Puesto[]\n}\n\nexport type Equipo = {\n  id: number\n  nombre: string\n  localidad: string\n  pabellon: string\n  entrenador: string\n  ligaId: string\n}\n\n// fetch con las comprobaciones de siempre. El signal es opcional:\n// si se lo pasas, la petición se puede cancelar.\nexport async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data('No está en la liga', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c2a1f;\n  background: #f7faf6;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #15803d;\n  background: #ecfdf3;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav a {\n  margin-right: 0.6rem;\n  color: #14532d;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh2 {\n  font-size: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.dos-columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\nol,\nul {\n  margin: 0 0 0.75rem;\n  padding-left: 1.3rem;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.ficha {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.ficha p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: end;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.85rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.5rem;\n}\n\n.sugerencias a {\n  margin-right: 0.5rem;\n}\n\n.cargando {\n  color: #6b7280;\n  font-style: italic;\n}\n\n.migas ol {\n  display: flex;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 0.4rem 1rem;\n  list-style: none;\n  font-size: 0.85rem;\n  background: #fff;\n  border-bottom: 1px solid #d1fae5;\n}\n\n.migas li {\n  margin: 0;\n}\n\n.migas li + li::before {\n  content: '›';\n  padding: 0 0.4rem;\n  color: #6b7280;\n}\n"
    }
  ],
  "archivoInicial": "Buscar.tsx",
  "urlInicial": "/buscar-con-efecto",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "ligas": [
      {
        "id": "senior",
        "nombre": "Liga Sénior",
        "corto": "Sénior",
        "jornada": 9,
        "clasificacion": [
          {
            "equipoId": 3,
            "equipo": "Ponferrada Sur FS",
            "puntos": 22
          },
          {
            "equipoId": 2,
            "equipo": "Atlético Fabero",
            "puntos": 19
          },
          {
            "equipoId": 1,
            "equipo": "CD Bembibre Sala",
            "puntos": 17
          },
          {
            "equipoId": 4,
            "equipo": "FS Cacabelos",
            "puntos": 12
          },
          {
            "equipoId": 6,
            "equipo": "Villafranca FS",
            "puntos": 9
          },
          {
            "equipoId": 5,
            "equipo": "Toreno Sala",
            "puntos": 4
          }
        ]
      },
      {
        "id": "femenina",
        "nombre": "Liga Femenina",
        "corto": "Femenina",
        "jornada": 7,
        "clasificacion": [
          {
            "equipoId": 9,
            "equipo": "Las Médulas FS",
            "puntos": 18
          },
          {
            "equipoId": 7,
            "equipo": "Bembibre Femenino",
            "puntos": 13
          },
          {
            "equipoId": 10,
            "equipo": "Camponaraya FS",
            "puntos": 7
          },
          {
            "equipoId": 8,
            "equipo": "Ponferrada Sur Femenino",
            "puntos": 4
          }
        ]
      },
      {
        "id": "juvenil",
        "nombre": "Liga Juvenil",
        "corto": "Juvenil",
        "jornada": 8,
        "clasificacion": [
          {
            "equipoId": 11,
            "equipo": "Atlético Fabero Juvenil",
            "puntos": 19
          },
          {
            "equipoId": 13,
            "equipo": "Ponferrada Sur Juvenil",
            "puntos": 15
          },
          {
            "equipoId": 14,
            "equipo": "Cubillos del Sil FS",
            "puntos": 9
          },
          {
            "equipoId": 12,
            "equipo": "Cacabelos Juvenil",
            "puntos": 6
          }
        ]
      }
    ],
    "equipos": [
      {
        "id": 1,
        "nombre": "CD Bembibre Sala",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Marta Arias",
        "ligaId": "senior"
      },
      {
        "id": 2,
        "nombre": "Atlético Fabero",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Luis Prada",
        "ligaId": "senior"
      },
      {
        "id": 3,
        "nombre": "Ponferrada Sur FS",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Iván Rodera",
        "ligaId": "senior"
      },
      {
        "id": 4,
        "nombre": "FS Cacabelos",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Rosa Valcarce",
        "ligaId": "senior"
      },
      {
        "id": 5,
        "nombre": "Toreno Sala",
        "localidad": "Toreno",
        "pabellon": "Polideportivo de Toreno",
        "entrenador": "Andrés Gavela",
        "ligaId": "senior"
      },
      {
        "id": 6,
        "nombre": "Villafranca FS",
        "localidad": "Villafranca del Bierzo",
        "pabellon": "Pabellón del Burbia",
        "entrenador": "Nuria Ferradal",
        "ligaId": "senior"
      },
      {
        "id": 7,
        "nombre": "Bembibre Femenino",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Sara Lorenzana",
        "ligaId": "femenina"
      },
      {
        "id": 8,
        "nombre": "Ponferrada Sur Femenino",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Elena Cuadrado",
        "ligaId": "femenina"
      },
      {
        "id": 9,
        "nombre": "Las Médulas FS",
        "localidad": "Carucedo",
        "pabellon": "Polideportivo de Carucedo",
        "entrenador": "Pilar Merayo",
        "ligaId": "femenina"
      },
      {
        "id": 10,
        "nombre": "Camponaraya FS",
        "localidad": "Camponaraya",
        "pabellon": "Pabellón de Camponaraya",
        "entrenador": "Lucía Alba",
        "ligaId": "femenina"
      },
      {
        "id": 11,
        "nombre": "Atlético Fabero Juvenil",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Diego Fidalgo",
        "ligaId": "juvenil"
      },
      {
        "id": 12,
        "nombre": "Cacabelos Juvenil",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Hugo Bello",
        "ligaId": "juvenil"
      },
      {
        "id": 13,
        "nombre": "Ponferrada Sur Juvenil",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Raúl Nogaledo",
        "ligaId": "juvenil"
      },
      {
        "id": 14,
        "nombre": "Cubillos del Sil FS",
        "localidad": "Cubillos del Sil",
        "pabellon": "Polideportivo de Cubillos",
        "entrenador": "Javier Otero",
        "ligaId": "juvenil"
      }
    ]
  },
  "red": {
    "latencia": 1500,
    "desordenar": true
  }
}
```

El efecto pinta lo último que llega, aunque ya no sea lo que dice la URL: es el fallo del 78 tal cual. Con el `loader`, el registro del router lo cuenta así (Chromium):

```text
#4 Navegación → ?q=ponferrada · 352 ms                   cancelada por #5
   Carga   loader buscar · +1 ms · 351 ms · error: AbortError: signal is aborted without reason · terminó después de cancelarse
#5 Navegación → ?q=fabero · acabó en /buscar?q=fabero · 753 ms          terminado
   Carga   loader buscar · +1 ms · 752 ms
   Se ejecutó: buscar.
```

**Cuando empieza una navegación nueva, el router da por perdida la que estaba en marcha**: la marca como cancelada, aborta su `request.signal` y no pinta nada de lo que traiga. El `fetch` de Ponferrada, que llevaba el `signal`, se cortó con un `AbortError` (el texto del mensaje es el de Chromium), y ese error no llegó a ningún `ErrorBoundary`: era de una navegación que ya no existía. La URL nunca llegó a decir `?q=ponferrada`.

¿Y si no pasas el `signal`?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "export async function cargarBusqueda({ request }: LoaderFunctionArgs) {\n  const q = new URL(request.url).searchParams.get('q') ?? ''\n  if (!q) return { q, equipos: [] }\n  // Sin request.signal:\n  const equipos = await pedir<Equipo[]>(`/api/equipos?q=${encodeURIComponent(q)}`)\n  return { q, equipos }\n}\n\n// Con «Responder desordenado», pulsas «Ponferrada» y, antes de que\n// responda, «Fabero». La respuesta de Ponferrada llega la última.\n// ¿Qué queda en pantalla?",
  "opciones": [
    "Los equipos de Ponferrada: es la última respuesta que llega",
    "Los de Fabero, y la petición de Ponferrada sale como cancelada en el registro de red",
    "Los de Fabero; la petición de Ponferrada termina con un 200 y el router tira su resultado",
    "La página de error: el loader de Ponferrada falla al quedar interrumpido"
  ],
  "correcta": 2,
  "explicacion": "Comprobado en la vista previa: la petición de Ponferrada terminó con un 200 a los 2,6 s, la pantalla siguió en Fabero y el registro del router marcó su loader con «terminó después de cancelarse». El router decide qué se pinta lleves signal o no. El signal sirve para otra cosa: cortar una petición que ya no le importa a nadie."
}
```

**Pasa siempre `request.signal` a `fetch`**, o a cualquier función tuya que pueda cancelarse. No cambia lo que se pinta, pero sin él la petición sigue hasta el final: tu servidor trabaja para nadie y la conexión del usuario también. Dos límites que conviene conocer:

- **El `signal` solo vive mientras dura la navegación.** Comprobado: si un `loader` devuelve una promesa sin `await` (lección 9) y te vas cuando la página ya está pintada, el `signal` no se aborta y la petición termina igual.
- **Los fetchers van aparte.** Un fetcher que se vuelve a lanzar cancela su propia petición, pero no las de otros fetchers: la lección 5 lo trata a fondo, con la guía [Network Concurrency Management](https://reactrouter.com/explanation/concurrency).

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Los loader de una página se ejecutan de la madre a la hija",
      "realidad": "A la vez. El router encaja la URL con todas las rutas de la rama y lanza sus loader juntos; en el registro, todos empiezan en el mismo +N ms. La página se pinta cuando han terminado todos."
    },
    {
      "mito": "Sin request.signal puedo acabar viendo resultados viejos",
      "realidad": "No: el router descarta lo que devuelve una navegación interrumpida, lleve signal o no (comprobado con «Responder desordenado»). El signal corta la petición; no decide qué se pinta."
    },
    {
      "mito": "Si el router cancela la petición, el servidor no se entera",
      "realidad": "Si la petición ya salió, el servidor la recibe y la procesa: cancelar solo deja de esperar la respuesta. Con un GET da igual; con las action, la documentación avisa de que la integridad de tus datos sigue siendo cosa del servidor."
    },
    {
      "mito": "useLoaderData devuelve los datos de la página",
      "realidad": "Devuelve los de la ruta en la que se pinta el componente. Un componente de la maquetación recibe los de la raíz aunque estés en la ficha de un equipo (comprobado). Para los de otra ruta, useRouteLoaderData."
    }
  ]
}
```

## Los datos de la madre: `useRouteLoaderData`

La ficha quiere decir «Puesto: 2.º de 6». La clasificación ya está en la página: la trajo el `loader` de la liga. Hay dos caminos. El malo es pedirla otra vez en el `loader` del equipo. El bueno es leerla en el componente: **`useRouteLoaderData(id)` devuelve los datos del `loader` de la ruta con ese `id`, si esa ruta está en la página**.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { data, useLoaderData, useRouteLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Equipo } from './api'\nimport type { cargarLiga } from './Liga'\n\nexport async function cargarEquipo({ params, request }: LoaderFunctionArgs) {\n  const equipo = await pedir<Equipo>(`/api/equipos/${params.equipoId}`, request.signal)\n  // La hija también recibe :ligaId: /ligas/femenina/equipos/2 no existe\n  if (equipo.ligaId !== params.ligaId) throw data('Ese equipo no juega en esta liga', { status: 404 })\n  return { equipo }\n}\n\nexport default function EquipoPagina() {\n  const { equipo } = useLoaderData<typeof cargarEquipo>()\n  // Los datos de la madre, por el id de su ruta: sin volver a pedirlos\n  const datosLiga = useRouteLoaderData<typeof cargarLiga>('liga')\n  const clasificacion = datosLiga?.liga.clasificacion ?? []\n  const puesto = clasificacion.findIndex((fila) => fila.equipoId === equipo.id) + 1\n\n  return (\n    <article className=\"ficha\">\n      <h2>{equipo.nombre}</h2>\n      {puesto > 0 && (\n        <p>\n          Puesto: {puesto}.º de {clasificacion.length}\n        </p>\n      )}\n      <p>Localidad: {equipo.localidad}</p>\n      <p>Pabellón: {equipo.pabellon}</p>\n      <p>Entrenador: {equipo.entrenador}</p>\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import type { cargarLiga } from './Liga'",
      "nota": "Solo el tipo. Un import type desaparece al compilar: la ficha no carga el código de la liga, solo le pregunta a TypeScript qué devuelve su loader."
    },
    {
      "fragmento": "useRouteLoaderData<typeof cargarLiga>('liga')",
      "nota": "Los datos de la ruta cuyo id es «liga». Está en la página porque la ficha es su hija. El genérico funciona como en useLoaderData."
    },
    {
      "fragmento": "datosLiga?.liga.clasificacion ?? []",
      "nota": "Su tipo incluye undefined, y acierta: fuera de una liga (en /buscar) o si su loader falló, no hay datos. Sin el ?., el panel dice 'datosLiga' is possibly 'undefined'."
    },
    {
      "fragmento": "{puesto > 0 && (",
      "nota": "Sin vuelta al servidor: el puesto sale de lo que la liga ya trajo. Al pasar de un equipo a otro, la liga no se vuelve a ejecutar y el puesto cambia igual."
    }
  ]
}
```

Lo que conviene saber de `useRouteLoaderData`, comprobado con la 8.5.0:

- **No pide nada**: lee lo que el `loader` de esa ruta ya dejó en el router. Si quieres los datos al día, es esa ruta la que se tiene que volver a ejecutar (lección 4).
- **Funciona en cualquier sentido.** Una madre puede leer los datos de su hija, y la maquetación, los de la liga, siempre que esa ruta encaje con la URL. Si no encaja, `undefined`.
- **Necesita el `id`.** Sin uno tuyo, tendrías que escribir el automático, algo como `"0-2"`, que cambia en cuanto reordenas las rutas. La lección 8 lo usa dentro de un `ErrorBoundary`, donde es justo lo que hace falta.

## Migas de pan: `handle` y `useMatches`

Unas migas de pan («Inicio › Liga Sénior › Atlético Fabero») van en la maquetación, pero cada trozo lo sabe una ruta distinta. **`useMatches()` devuelve la rama que encaja con la URL, de la raíz a la hoja: un objeto por ruta, con su `id`, su `pathname` (el trozo de URL que encajó), sus `params`, los datos de su `loader` (`loaderData`) y su `handle`.** Y `handle` es un campo libre del objeto de ruta: React Router no lo mira, solo se lo pasa a `useMatches`.

El patrón: cada ruta pone en su `handle` una función que da el texto de su miga, y un componente las recorre todas.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { Link, useMatches } from 'react-router'\nimport type { UIMatch } from 'react-router'\n\n// Lo que cada ruta deja en su handle: una función que da el texto de su miga\nexport type ConMiga = { miga: (match: UIMatch) => string }\n\n// handle es unknown para TypeScript: cada ruta pone lo que quiere\nfunction tieneMiga(match: UIMatch): match is UIMatch<unknown, ConMiga> {\n  const handle = match.handle as Partial<ConMiga> | undefined\n  return typeof handle?.miga === 'function'\n}\n\nexport default function Migas() {\n  // Todas las rutas que encajan con la URL, de la raíz a la hoja\n  const migas = useMatches().filter(tieneMiga)\n\n  return (\n    <nav aria-label=\"Migas de pan\" className=\"migas\">\n      <ol>\n        {migas.map((match, i) => (\n          <li key={match.id}>\n            {i === migas.length - 1 ? (\n              <span aria-current=\"page\">{match.handle.miga(match)}</span>\n            ) : (\n              <Link to={match.pathname}>{match.handle.miga(match)}</Link>\n            )}\n          </li>\n        ))}\n      </ol>\n    </nav>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export type ConMiga = { miga: (match: UIMatch) => string }",
      "nota": "Lo que acordamos que lleva el handle de cada ruta. Es una convención tuya: el router no mira dentro."
    },
    {
      "fragmento": "match.handle as Partial<ConMiga> | undefined",
      "nota": "Para TypeScript, handle es unknown: el router no sabe qué pone cada ruta. Si lo usas sin comprobarlo, el panel dice 'm.handle' is of type 'unknown'. Esta función lo comprueba antes."
    },
    {
      "fragmento": "useMatches().filter(tieneMiga)",
      "nota": "Las rutas de la rama que tienen miga. La ruta índice de la liga no tiene, y no sale."
    },
    {
      "fragmento": "<span aria-current=\"page\">",
      "nota": "La última miga es la página en la que estás: texto, no enlace, y aria-current para que el lector de pantalla lo diga."
    },
    {
      "fragmento": "<Link to={match.pathname}>",
      "nota": "pathname es el trozo de URL que encajó con esa ruta: /ligas/senior para la liga, aunque estés en la ficha de un equipo."
    },
    {
      "fragmento": "<nav aria-label=\"Migas de pan\" className=\"migas\">",
      "nota": "Un nav con nombre propio, para distinguirlo del menú de las ligas (lección 37 de React)."
    }
  ]
}
```

Y cada ruta, en `App.tsx`, deja su miga. La de la liga sale de los datos de su `loader`:

```tsx
{
  id: 'liga',
  path: 'ligas/:ligaId',
  loader: cargarLiga,
  Component: LigaPagina,
  // loaderData es unknown: aquí dices qué esperas, y cuentas con undefined
  handle: {
    miga: (match) => (match.loaderData as { liga: Liga } | undefined)?.liga.nombre ?? 'Liga',
  } satisfies ConMiga,
  // …
}
```

Dos detalles de TypeScript. El `satisfies ConMiga` es el que le da su tipo a `match`: en un objeto de ruta, `handle` admite cualquier cosa, y sin él el panel dice `Parameter 'match' implicitly has an 'any' type.` («el parámetro `match` es `any` sin que lo digas»). Y `match.loaderData` es `unknown`, porque `useMatches` no sabe de qué ruta es cada objeto: el `as` le dice qué esperar, y el `| undefined` cubre el caso de un `loader` que ha fallado y no ha dejado datos. Tiparlo mejor es cosa de la lección 15.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Migas de pan y el puesto, con los datos de la madre",
  "consigna": "Estás en la ficha del Atlético Fabero: arriba, Inicio › Liga Sénior › Atlético Fabero, y en la ficha, «Puesto: 2.º de 6», sacado de la clasificación de la liga. Pulsa «Toreno Sala»: cambian la miga y el puesto, y el registro dice que la liga no se volvió a ejecutar. Pulsa «Liga Sénior» en las migas. Por último, escribe /ligas/femenina/equipos/2 en la barra y pulsa Ir.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, NavLink, Outlet, useLoaderData, useNavigation, useRouteError } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedir, type Equipo, type Liga } from './api'\nimport Migas, { type ConMiga } from './Migas'\nimport LigaPagina, { cargarLiga, ElegirEquipo } from './Liga'\nimport EquipoPagina, { cargarEquipo } from './Equipo'\nimport './estilos.css'\n\n// El loader de la ruta raíz: las ligas, para el menú\nasync function cargarLigas({ request }: LoaderFunctionArgs) {\n  return { ligas: await pedir<Liga[]>('/api/ligas', request.signal) }\n}\n\nfunction Maquetacion() {\n  const { ligas } = useLoaderData<typeof cargarLigas>()\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Fútbol sala · Liga Comarcal del Bierzo</p>\n        <nav aria-label=\"Ligas\">\n          {ligas.map((liga) => (\n            <NavLink key={liga.id} to={`/ligas/${liga.id}`}>\n              {liga.corto}\n            </NavLink>\n          ))}\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <Migas />\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction Inicio() {\n  return (\n    <>\n      <h1>Temporada 2026-2027</h1>\n      <p>\n        Elige una liga en el menú, o ve directo a la ficha del <Link to=\"/ligas/senior/equipos/2\">Atlético Fabero</Link>.\n      </p>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/\">Volver al inicio</Link>\n    </main>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria\nconst router = createBrowserRouter([\n  {\n    id: 'raiz',\n    path: '/',\n    loader: cargarLigas,\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo la liga…</p>,\n    handle: { miga: () => 'Inicio' } satisfies ConMiga,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        id: 'liga',\n        path: 'ligas/:ligaId',\n        loader: cargarLiga,\n        Component: LigaPagina,\n        // loaderData es unknown: aquí dices qué esperas, y cuentas con undefined\n        handle: {\n          miga: (match) => (match.loaderData as { liga: Liga } | undefined)?.liga.nombre ?? 'Liga',\n        } satisfies ConMiga,\n        children: [\n          { index: true, Component: ElegirEquipo },\n          {\n            id: 'equipo',\n            path: 'equipos/:equipoId',\n            loader: cargarEquipo,\n            Component: EquipoPagina,\n            handle: {\n              miga: (match) => (match.loaderData as { equipo: Equipo } | undefined)?.equipo.nombre ?? 'Equipo',\n            } satisfies ConMiga,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Migas.tsx",
      "codigo": "import { Link, useMatches } from 'react-router'\nimport type { UIMatch } from 'react-router'\n\n// Lo que cada ruta deja en su handle: una función que da el texto de su miga\nexport type ConMiga = { miga: (match: UIMatch) => string }\n\n// handle es unknown para TypeScript: cada ruta pone lo que quiere\nfunction tieneMiga(match: UIMatch): match is UIMatch<unknown, ConMiga> {\n  const handle = match.handle as Partial<ConMiga> | undefined\n  return typeof handle?.miga === 'function'\n}\n\nexport default function Migas() {\n  // Todas las rutas que encajan con la URL, de la raíz a la hoja\n  const migas = useMatches().filter(tieneMiga)\n\n  return (\n    <nav aria-label=\"Migas de pan\" className=\"migas\">\n      <ol>\n        {migas.map((match, i) => (\n          <li key={match.id}>\n            {i === migas.length - 1 ? (\n              <span aria-current=\"page\">{match.handle.miga(match)}</span>\n            ) : (\n              <Link to={match.pathname}>{match.handle.miga(match)}</Link>\n            )}\n          </li>\n        ))}\n      </ol>\n    </nav>\n  )\n}\n"
    },
    {
      "nombre": "Equipo.tsx",
      "codigo": "import { data, useLoaderData, useRouteLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Equipo } from './api'\nimport type { cargarLiga } from './Liga'\n\nexport async function cargarEquipo({ params, request }: LoaderFunctionArgs) {\n  const equipo = await pedir<Equipo>(`/api/equipos/${params.equipoId}`, request.signal)\n  // La hija también recibe :ligaId: /ligas/femenina/equipos/2 no existe\n  if (equipo.ligaId !== params.ligaId) throw data('Ese equipo no juega en esta liga', { status: 404 })\n  return { equipo }\n}\n\nexport default function EquipoPagina() {\n  const { equipo } = useLoaderData<typeof cargarEquipo>()\n  // Los datos de la madre, por el id de su ruta: sin volver a pedirlos\n  const datosLiga = useRouteLoaderData<typeof cargarLiga>('liga')\n  const clasificacion = datosLiga?.liga.clasificacion ?? []\n  const puesto = clasificacion.findIndex((fila) => fila.equipoId === equipo.id) + 1\n\n  return (\n    <article className=\"ficha\">\n      <h2>{equipo.nombre}</h2>\n      {puesto > 0 && (\n        <p>\n          Puesto: {puesto}.º de {clasificacion.length}\n        </p>\n      )}\n      <p>Localidad: {equipo.localidad}</p>\n      <p>Pabellón: {equipo.pabellon}</p>\n      <p>Entrenador: {equipo.entrenador}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Liga.tsx",
      "codigo": "import { Link, Outlet, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Liga } from './api'\n\nexport async function cargarLiga({ params, request }: LoaderFunctionArgs) {\n  const liga = await pedir<Liga>(`/api/ligas/${params.ligaId}`, request.signal)\n  return { liga }\n}\n\nexport default function LigaPagina() {\n  const { liga } = useLoaderData<typeof cargarLiga>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>{liga.nombre}</h1>\n        <p>Clasificación tras la jornada {liga.jornada}:</p>\n        <ol>\n          {liga.clasificacion.map((puesto) => (\n            <li key={puesto.equipoId}>\n              <Link to={`/ligas/${liga.id}/equipos/${puesto.equipoId}`}>{puesto.equipo}</Link> · {puesto.puntos} puntos\n            </li>\n          ))}\n        </ol>\n      </section>\n      {/* Aquí se pinta la ruta hija: la ficha del equipo */}\n      <Outlet />\n    </div>\n  )\n}\n\nexport function ElegirEquipo() {\n  return <p>Elige un equipo para ver su ficha.</p>\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "import { data } from 'react-router'\n\nexport type Puesto = { equipoId: number; equipo: string; puntos: number }\n\nexport type Liga = {\n  id: string\n  nombre: string\n  corto: string\n  jornada: number\n  clasificacion: Puesto[]\n}\n\nexport type Equipo = {\n  id: number\n  nombre: string\n  localidad: string\n  pabellon: string\n  entrenador: string\n  ligaId: string\n}\n\n// fetch con las comprobaciones de siempre. El signal es opcional:\n// si se lo pasas, la petición se puede cancelar.\nexport async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data('No está en la liga', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c2a1f;\n  background: #f7faf6;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #15803d;\n  background: #ecfdf3;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav a {\n  margin-right: 0.6rem;\n  color: #14532d;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh2 {\n  font-size: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.dos-columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\nol,\nul {\n  margin: 0 0 0.75rem;\n  padding-left: 1.3rem;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.ficha {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.ficha p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: end;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.85rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.5rem;\n}\n\n.sugerencias a {\n  margin-right: 0.5rem;\n}\n\n.cargando {\n  color: #6b7280;\n  font-style: italic;\n}\n\n.migas ol {\n  display: flex;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 0.4rem 1rem;\n  list-style: none;\n  font-size: 0.85rem;\n  background: #fff;\n  border-bottom: 1px solid #d1fae5;\n}\n\n.migas li {\n  margin: 0;\n}\n\n.migas li + li::before {\n  content: '›';\n  padding: 0 0.4rem;\n  color: #6b7280;\n}\n"
    }
  ],
  "archivoInicial": "Migas.tsx",
  "urlInicial": "/ligas/senior/equipos/2",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "api": {
    "ligas": [
      {
        "id": "senior",
        "nombre": "Liga Sénior",
        "corto": "Sénior",
        "jornada": 9,
        "clasificacion": [
          {
            "equipoId": 3,
            "equipo": "Ponferrada Sur FS",
            "puntos": 22
          },
          {
            "equipoId": 2,
            "equipo": "Atlético Fabero",
            "puntos": 19
          },
          {
            "equipoId": 1,
            "equipo": "CD Bembibre Sala",
            "puntos": 17
          },
          {
            "equipoId": 4,
            "equipo": "FS Cacabelos",
            "puntos": 12
          },
          {
            "equipoId": 6,
            "equipo": "Villafranca FS",
            "puntos": 9
          },
          {
            "equipoId": 5,
            "equipo": "Toreno Sala",
            "puntos": 4
          }
        ]
      },
      {
        "id": "femenina",
        "nombre": "Liga Femenina",
        "corto": "Femenina",
        "jornada": 7,
        "clasificacion": [
          {
            "equipoId": 9,
            "equipo": "Las Médulas FS",
            "puntos": 18
          },
          {
            "equipoId": 7,
            "equipo": "Bembibre Femenino",
            "puntos": 13
          },
          {
            "equipoId": 10,
            "equipo": "Camponaraya FS",
            "puntos": 7
          },
          {
            "equipoId": 8,
            "equipo": "Ponferrada Sur Femenino",
            "puntos": 4
          }
        ]
      },
      {
        "id": "juvenil",
        "nombre": "Liga Juvenil",
        "corto": "Juvenil",
        "jornada": 8,
        "clasificacion": [
          {
            "equipoId": 11,
            "equipo": "Atlético Fabero Juvenil",
            "puntos": 19
          },
          {
            "equipoId": 13,
            "equipo": "Ponferrada Sur Juvenil",
            "puntos": 15
          },
          {
            "equipoId": 14,
            "equipo": "Cubillos del Sil FS",
            "puntos": 9
          },
          {
            "equipoId": 12,
            "equipo": "Cacabelos Juvenil",
            "puntos": 6
          }
        ]
      }
    ],
    "equipos": [
      {
        "id": 1,
        "nombre": "CD Bembibre Sala",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Marta Arias",
        "ligaId": "senior"
      },
      {
        "id": 2,
        "nombre": "Atlético Fabero",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Luis Prada",
        "ligaId": "senior"
      },
      {
        "id": 3,
        "nombre": "Ponferrada Sur FS",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Iván Rodera",
        "ligaId": "senior"
      },
      {
        "id": 4,
        "nombre": "FS Cacabelos",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Rosa Valcarce",
        "ligaId": "senior"
      },
      {
        "id": 5,
        "nombre": "Toreno Sala",
        "localidad": "Toreno",
        "pabellon": "Polideportivo de Toreno",
        "entrenador": "Andrés Gavela",
        "ligaId": "senior"
      },
      {
        "id": 6,
        "nombre": "Villafranca FS",
        "localidad": "Villafranca del Bierzo",
        "pabellon": "Pabellón del Burbia",
        "entrenador": "Nuria Ferradal",
        "ligaId": "senior"
      },
      {
        "id": 7,
        "nombre": "Bembibre Femenino",
        "localidad": "Bembibre",
        "pabellon": "Pabellón Municipal de Bembibre",
        "entrenador": "Sara Lorenzana",
        "ligaId": "femenina"
      },
      {
        "id": 8,
        "nombre": "Ponferrada Sur Femenino",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Elena Cuadrado",
        "ligaId": "femenina"
      },
      {
        "id": 9,
        "nombre": "Las Médulas FS",
        "localidad": "Carucedo",
        "pabellon": "Polideportivo de Carucedo",
        "entrenador": "Pilar Merayo",
        "ligaId": "femenina"
      },
      {
        "id": 10,
        "nombre": "Camponaraya FS",
        "localidad": "Camponaraya",
        "pabellon": "Pabellón de Camponaraya",
        "entrenador": "Lucía Alba",
        "ligaId": "femenina"
      },
      {
        "id": 11,
        "nombre": "Atlético Fabero Juvenil",
        "localidad": "Fabero",
        "pabellon": "Pabellón del Pozo Viejo",
        "entrenador": "Diego Fidalgo",
        "ligaId": "juvenil"
      },
      {
        "id": 12,
        "nombre": "Cacabelos Juvenil",
        "localidad": "Cacabelos",
        "pabellon": "Pabellón de La Moncloa",
        "entrenador": "Hugo Bello",
        "ligaId": "juvenil"
      },
      {
        "id": 13,
        "nombre": "Ponferrada Sur Juvenil",
        "localidad": "Ponferrada",
        "pabellon": "Pabellón de Flores del Sil",
        "entrenador": "Raúl Nogaledo",
        "ligaId": "juvenil"
      },
      {
        "id": 14,
        "nombre": "Cubillos del Sil FS",
        "localidad": "Cubillos del Sil",
        "pabellon": "Polideportivo de Cubillos",
        "entrenador": "Javier Otero",
        "ligaId": "juvenil"
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

La última dirección encaja con las rutas, pero el Atlético Fabero no juega en la Liga Femenina: el `loader` del equipo lanza su 404 y el registro lo resume en una línea, «Error en pantalla (ErrorBoundary de raiz): 404 Ese equipo no juega en esta liga».

## Cuándo lo usarías de verdad

Cada componente de una app con rutas tiene cuatro sitios de donde sacar datos que no son suyos:

```laboratorio
{
  "tipo": "roles",
  "titulo": "¿De dónde saca cada componente sus datos?",
  "roles": [
    {
      "etiqueta": "useLoaderData()",
      "rol": "Los de su propia ruta",
      "descripcion": "Lo normal: cada página lee lo que cargó su loader. En un componente que no es de ruta, los de la ruta donde se pinta."
    },
    {
      "etiqueta": "useRouteLoaderData('id')",
      "rol": "Los de otra ruta de la página",
      "descripcion": "La madre, la raíz (el usuario con sesión, por ejemplo) o una hija. Necesita el id y puede devolver undefined."
    },
    {
      "etiqueta": "useMatches() + handle",
      "rol": "Los de toda la rama",
      "descripcion": "Migas de pan, el título de la pestaña, qué ayuda enseñar: lo que la maquetación arma con lo que aporta cada ruta."
    },
    {
      "etiqueta": "<Outlet context>",
      "rol": "Lo que la madre calcula al pintar",
      "descripcion": "Algo que no sale de un loader, como un estado de la madre. La hija lo lee con useOutletContext."
    }
  ]
}
```

¿Y los efectos de la lección 52? Para los datos que dependen de la URL, el `loader` gana siempre: empieza antes, va en paralelo y resuelve las carreras. Los efectos se quedan para lo suyo, sincronizar con algo de fuera (lección 38), y los datos que cambian sin cambiar la URL van con un fetcher (lección 5). Si además necesitas caché entre páginas, eso no lo hace un `loader`: es el terreno de TanStack Query (lección 78 de React).

## Errores típicos

**El buscador de la cabecera sin `action`.** Un buscador para toda la web se pone en la maquetación. Pero un `<Form>` sin `action` no envía a la URL que ves:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En Maquetacion, el componente de la ruta raíz:\n<Form method=\"get\">\n  <label>\n    Buscar en la liga <input type=\"search\" name=\"q\" />\n  </label>\n  <button>Ir</button>\n</Form>\n\n// Estás en /ligas/senior/equipos/2, escribes «fabero» y pulsas «Ir».\n// ¿Adónde vas?",
  "opciones": [
    "A /buscar?q=fabero",
    "A /ligas/senior/equipos/2?q=fabero: la misma página, con la búsqueda",
    "A /?q=fabero, que enseña la portada",
    "A ningún sitio: un Form sin action no hace nada"
  ],
  "correcta": 2,
  "explicacion": "Sin action, un Form envía a la ruta en la que está pintado, no a la dirección de la barra. Este vive en la raíz, así que va a /?q=fabero, donde se pinta Inicio, que no busca nada (comprobado con la 8.5.0). Con action=\"/buscar\" va adonde toca. Es la misma regla que el POST sin action de la lección 99."
}
```

**La hija que vuelve a pedir lo de la madre.** Para sacar el puesto, el `loader` del equipo llama al de la liga:

```tsx
export async function cargarEquipo(args: LoaderFunctionArgs) {
  const { liga } = await cargarLiga(args) // ✗ otra vez la liga, y esperándola
  const equipo = await pedir<Equipo>(`/api/equipos/${args.params.equipoId}`, args.request.signal)
  // …
}
```

Comprobado en la vista previa con 600 ms de latencia: en la carga inicial salieron dos `GET /api/ligas/senior`, y el `loader` del equipo tardó 1208 ms, el doble que los demás, porque no pide el equipo hasta tener su propia copia de la liga. Y de un equipo a otro, aunque el registro diga «No se volvió a ejecutar: raiz, liga», la ficha vuelve a pedir la liga cada vez. Es una cascada metida dentro de un `loader`. La solución es `useRouteLoaderData` en el componente. Y, en general, **dos `await` seguidos de peticiones que no dependen una de otra son una cascada**: lánzalas juntas con `Promise.all`.

**`match.data`, de la documentación.** La guía [Using handle](https://reactrouter.com/how-to/using-handle) de la 8.5.0 todavía escribe `match.data` en sus migas. En la 8.5.0 ese campo se llama `loaderData` (comprobado en sus tipos y en su código): `match.data` vale `undefined`, y en TSX el panel avisa:

```text
Property 'data' does not exist on type 'UIMatch<unknown, unknown>'.
```

Es decir: los objetos de `useMatches` no tienen ninguna propiedad `data`.

**Dos rutas con el mismo `id`.** El router no llega a crearse, y la vista previa enseña el error:

```text
Found a route id collision on id "liga".  Route id's must be globally unique within Data Router usages
```

Es decir: hay dos rutas con el `id` «liga», y tienen que ser únicos en todo el router. El caso contrario es más traicionero: usar un `id` automático («0-2») en `useRouteLoaderData` funciona hasta que alguien añade una ruta delante, y entonces devuelve `undefined` sin avisar.

**Un parámetro mal escrito.** Ya lo viste en la sección de TSX: `params.equipold` compila, vale `undefined` y acaba en `/api/equipos/undefined`, un 404. El nombre tiene que ser el mismo que en el `path`, letra a letra.

## Ejercicios

Los dos usan React Router de verdad, en TSX, y el trabajo va donde dicen los comentarios numerados.

**1. El calendario, con la jornada en la URL.** La página del calendario siempre enseña la jornada 10, y el desplegable no hace nada. Haz que la jornada viva en la URL, como el buscador de la lección.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El calendario: ?jornada= en la URL",
  "consigna": "En Calendario.tsx: 1) lee la jornada de request.url, con la 10 si no viene; 2) pásale el signal a pedir(); 3) convierte el div en un <Form method=\"get\"> y da al desplegable el name que toca; 4) que el desplegable enseñe la jornada de la URL, también después de pulsar Atrás. Prueba /calendario?jornada=8 en la barra.",
  "archivos": [
    {
      "nombre": "Calendario.tsx",
      "codigo": "import { useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Jornada } from './api'\n\nconst JORNADAS = [8, 9, 10]\n\nexport async function cargarCalendario({ request }: LoaderFunctionArgs) {\n  // 1. Lee la jornada de la URL (/calendario?jornada=9). Si no viene, la próxima: la 10\n  // 2. Pásale a pedir() el signal de la navegación\n  const jornada = await pedir<Jornada>('/api/jornadas/10')\n  return { jornada }\n}\n\nexport default function Calendario() {\n  const { jornada } = useLoaderData<typeof cargarCalendario>()\n\n  return (\n    <>\n      <h1>\n        Jornada {jornada.id} · {jornada.fecha}\n      </h1>\n      {/* 3. Convierte este div en un <Form method=\"get\"> que envíe la jornada elegida */}\n      {/* 4. Que el desplegable enseñe la jornada de la URL, también después de pulsar Atrás */}\n      <div className=\"filtro\">\n        <label>\n          Jornada\n          <select>\n            {JORNADAS.map((numero) => (\n              <option key={numero} value={numero}>\n                Jornada {numero}\n              </option>\n            ))}\n          </select>\n        </label>\n        <button>Ver</button>\n      </div>\n      <ul>\n        {jornada.partidos.map((partido) => (\n          <li key={partido.id}>\n            {partido.local} {partido.resultado ?? '–'} {partido.visitante}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, NavLink, Outlet, redirect, useNavigation, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Calendario, { cargarCalendario } from './Calendario'\nimport './estilos.css'\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Fútbol sala · Liga Comarcal del Bierzo</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/calendario\">Calendario</NavLink>\n        </nav>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/calendario\">Volver al calendario</Link>\n    </main>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo el calendario…</p>,\n    children: [\n      { index: true, loader: () => redirect('/calendario') },\n      { path: 'calendario', loader: cargarCalendario, Component: Calendario },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "import { data } from 'react-router'\n\nexport type Cruce = { id: number; local: string; visitante: string; resultado: string | null }\n\nexport type Jornada = { id: number; fecha: string; partidos: Cruce[] }\n\nexport type Partido = Cruce & {\n  jornadaId: number\n  hora: string\n  pabellon: string\n  arbitro: string\n}\n\n// fetch con las comprobaciones de siempre. El signal es opcional:\n// si se lo pasas, la petición se puede cancelar.\nexport async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data('No está en el calendario', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c2a1f;\n  background: #f7faf6;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #15803d;\n  background: #ecfdf3;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav a {\n  margin-right: 0.6rem;\n  color: #14532d;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh2 {\n  font-size: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.dos-columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\nol,\nul {\n  margin: 0 0 0.75rem;\n  padding-left: 1.3rem;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.ficha {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.ficha p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: end;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.85rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.5rem;\n}\n\n.sugerencias a {\n  margin-right: 0.5rem;\n}\n\n.cargando {\n  color: #6b7280;\n  font-style: italic;\n}\n\n.migas ol {\n  display: flex;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 0.4rem 1rem;\n  list-style: none;\n  font-size: 0.85rem;\n  background: #fff;\n  border-bottom: 1px solid #d1fae5;\n}\n\n.migas li {\n  margin: 0;\n}\n\n.migas li + li::before {\n  content: '›';\n  padding: 0 0.4rem;\n  color: #6b7280;\n}\n"
    }
  ],
  "archivoInicial": "Calendario.tsx",
  "urlInicial": "/calendario",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "jornadas": [
      {
        "id": 8,
        "fecha": "sábado 17 de octubre",
        "partidos": [
          {
            "id": 1,
            "local": "Ponferrada Sur FS",
            "visitante": "Villafranca FS",
            "resultado": "4-1"
          },
          {
            "id": 2,
            "local": "Atlético Fabero",
            "visitante": "CD Bembibre Sala",
            "resultado": "2-2"
          },
          {
            "id": 3,
            "local": "Toreno Sala",
            "visitante": "FS Cacabelos",
            "resultado": "1-3"
          }
        ]
      },
      {
        "id": 9,
        "fecha": "sábado 24 de octubre",
        "partidos": [
          {
            "id": 4,
            "local": "CD Bembibre Sala",
            "visitante": "FS Cacabelos",
            "resultado": "3-1"
          },
          {
            "id": 5,
            "local": "Atlético Fabero",
            "visitante": "Toreno Sala",
            "resultado": "5-2"
          },
          {
            "id": 6,
            "local": "Villafranca FS",
            "visitante": "Ponferrada Sur FS",
            "resultado": "2-4"
          }
        ]
      },
      {
        "id": 10,
        "fecha": "sábado 31 de octubre",
        "partidos": [
          {
            "id": 7,
            "local": "Ponferrada Sur FS",
            "visitante": "Atlético Fabero",
            "resultado": null
          },
          {
            "id": 8,
            "local": "FS Cacabelos",
            "visitante": "Villafranca FS",
            "resultado": null
          },
          {
            "id": 9,
            "local": "Toreno Sala",
            "visitante": "CD Bembibre Sala",
            "resultado": null
          }
        ]
      }
    ],
    "partidos": [
      {
        "id": 1,
        "jornadaId": 8,
        "local": "Ponferrada Sur FS",
        "visitante": "Villafranca FS",
        "resultado": "4-1",
        "hora": "18:00",
        "pabellon": "Pabellón de Flores del Sil",
        "arbitro": "Ana Rubial"
      },
      {
        "id": 2,
        "jornadaId": 8,
        "local": "Atlético Fabero",
        "visitante": "CD Bembibre Sala",
        "resultado": "2-2",
        "hora": "17:30",
        "pabellon": "Pabellón del Pozo Viejo",
        "arbitro": "Tomás Liébana"
      },
      {
        "id": 3,
        "jornadaId": 8,
        "local": "Toreno Sala",
        "visitante": "FS Cacabelos",
        "resultado": "1-3",
        "hora": "19:00",
        "pabellon": "Polideportivo de Toreno",
        "arbitro": "Carmen Losada"
      },
      {
        "id": 4,
        "jornadaId": 9,
        "local": "CD Bembibre Sala",
        "visitante": "FS Cacabelos",
        "resultado": "3-1",
        "hora": "18:00",
        "pabellon": "Pabellón Municipal de Bembibre",
        "arbitro": "Tomás Liébana"
      },
      {
        "id": 5,
        "jornadaId": 9,
        "local": "Atlético Fabero",
        "visitante": "Toreno Sala",
        "resultado": "5-2",
        "hora": "17:30",
        "pabellon": "Pabellón del Pozo Viejo",
        "arbitro": "Ana Rubial"
      },
      {
        "id": 6,
        "jornadaId": 9,
        "local": "Villafranca FS",
        "visitante": "Ponferrada Sur FS",
        "resultado": "2-4",
        "hora": "19:00",
        "pabellon": "Pabellón del Burbia",
        "arbitro": "Carmen Losada"
      },
      {
        "id": 7,
        "jornadaId": 10,
        "local": "Ponferrada Sur FS",
        "visitante": "Atlético Fabero",
        "resultado": null,
        "hora": "18:00",
        "pabellon": "Pabellón de Flores del Sil",
        "arbitro": "Carmen Losada"
      },
      {
        "id": 8,
        "jornadaId": 10,
        "local": "FS Cacabelos",
        "visitante": "Villafranca FS",
        "resultado": null,
        "hora": "17:30",
        "pabellon": "Pabellón de La Moncloa",
        "arbitro": "Ana Rubial"
      },
      {
        "id": 9,
        "jornadaId": 10,
        "local": "Toreno Sala",
        "visitante": "CD Bembibre Sala",
        "resultado": null,
        "hora": "19:00",
        "pabellon": "Polideportivo de Toreno",
        "arbitro": "Tomás Liébana"
      }
    ]
  },
  "red": {
    "latencia": 400
  },
  "comprobaciones": [
    {
      "descripcion": "Con /calendario?jornada=8, enseña la jornada 8",
      "urlInicial": "/calendario?jornada=8",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Jornada 8 · sábado 17 de octubre"
      }
    },
    {
      "descripcion": "Sin ?jornada=, enseña la próxima: la 10",
      "urlInicial": "/calendario",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Jornada 10 · sábado 31 de octubre"
      }
    },
    {
      "descripcion": "Elegir la jornada 9 y pulsar «Ver» deja ?jornada=9 en la URL",
      "urlInicial": "/calendario",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Jornada",
            "opcion": "Jornada 9"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver"
          }
        }
      ],
      "espera": {
        "url": "/calendario?jornada=9"
      }
    },
    {
      "descripcion": "Después de pulsar «Ver», salen los partidos de la jornada 9",
      "urlInicial": "/calendario",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Jornada",
            "opcion": "Jornada 9"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Atlético Fabero 5-2 Toreno Sala"
      }
    },
    {
      "descripcion": "El desplegable enseña la jornada de la URL",
      "urlInicial": "/calendario?jornada=8",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jornada 8 · sábado 17 de octubre"
          }
        }
      ],
      "espera": {
        "etiqueta": "Jornada",
        "valor": "8"
      }
    },
    {
      "descripcion": "Después de pulsar Atrás, el desplegable vuelve a la jornada de la URL",
      "urlInicial": "/calendario?jornada=8",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Jornada",
            "opcion": "Jornada 9"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jornada 9 · sábado 24 de octubre"
          }
        },
        {
          "atras": true
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jornada 8 · sábado 17 de octubre"
          }
        }
      ],
      "espera": {
        "etiqueta": "Jornada",
        "valor": "8"
      }
    },
    {
      "descripcion": "Recargar conserva la jornada elegida",
      "urlInicial": "/calendario",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Jornada",
            "opcion": "Jornada 9"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Jornada 9 · sábado 24 de octubre"
          }
        },
        {
          "recargar": true
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Jornada 9 · sábado 24 de octubre"
      }
    }
  ]
}
```

**2. Las actas de la jornada.** Las actas de la Liga Sénior tienen la misma forma que la liga de la lección: la jornada es la madre, con su lista de partidos, y el acta de cada partido es su hija. Faltan las migas de pan y que el acta diga de qué jornada es.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las actas: migas de pan y la fecha de la madre",
  "consigna": "En App.tsx: 1) dale a la ruta de la jornada el id y la miga, y a la del partido una miga con sus equipos, sacada de match.loaderData. En Migas.tsx: 2) pinta las migas con useMatches; la última, sin enlace. En Partido.tsx: 3) lee la jornada con useRouteLoaderData, sin volver a pedirla, y escribe su número y su fecha. La raíz ya tiene su miga, «Inicio», de modelo.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, Outlet, useNavigation, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport type { Partido } from './api'\nimport Migas, { type ConMiga } from './Migas'\nimport JornadaPagina, { cargarJornada } from './Jornada'\nimport PartidoPagina, { cargarPartido } from './Partido'\nimport './estilos.css'\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Fútbol sala · Liga Sénior del Bierzo</p>\n        <p className=\"aviso\">{navigation.state === 'loading' ? 'Cargando…' : ''}</p>\n      </header>\n      <Migas />\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction Inicio() {\n  return (\n    <>\n      <h1>Actas de la temporada</h1>\n      <ul>\n        <li>\n          <Link to=\"/jornadas/8\">Jornada 8</Link>\n        </li>\n        <li>\n          <Link to=\"/jornadas/9\">Jornada 9</Link>\n        </li>\n      </ul>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/\">Volver al inicio</Link>\n    </main>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p className=\"cargando\">Abriendo las actas…</p>,\n    handle: { miga: () => 'Inicio' } satisfies ConMiga,\n    children: [\n      { index: true, Component: Inicio },\n      {\n        // 1. Dale a esta ruta el id 'jornada' y un handle con su miga: «Jornada 9»\n        path: 'jornadas/:jornadaId',\n        loader: cargarJornada,\n        Component: JornadaPagina,\n        children: [\n          { index: true, Component: () => <p>Elige un partido para ver su acta.</p> },\n          {\n            // 1. Y a esta, una miga con los equipos: «Atlético Fabero – Toreno Sala».\n            //    Sale de los datos de su loader, match.loaderData\n            path: 'partidos/:partidoId',\n            loader: cargarPartido,\n            Component: PartidoPagina,\n          },\n        ],\n      },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Migas.tsx",
      "codigo": "import { Link, useMatches } from 'react-router'\nimport type { UIMatch } from 'react-router'\n\n// Lo que cada ruta deja en su handle: una función que da el texto de su miga\nexport type ConMiga = { miga: (match: UIMatch) => string }\n\n// handle es unknown para TypeScript: esta función comprueba que hay una miga\nfunction tieneMiga(match: UIMatch): match is UIMatch<unknown, ConMiga> {\n  const handle = match.handle as Partial<ConMiga> | undefined\n  return typeof handle?.miga === 'function'\n}\n\nexport default function Migas() {\n  // 2. Recorre useMatches() y pinta la miga de cada ruta que la tenga (tieneMiga\n  //    te ayuda). Cada una, un <li> con un enlace a match.pathname, menos la\n  //    última, que es la página actual: texto con aria-current=\"page\"\n  return (\n    <nav aria-label=\"Migas de pan\" className=\"migas\">\n      <ol></ol>\n    </nav>\n  )\n}\n"
    },
    {
      "nombre": "Partido.tsx",
      "codigo": "import { data, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Partido } from './api'\n\nexport async function cargarPartido({ params, request }: LoaderFunctionArgs) {\n  const partido = await pedir<Partido>(`/api/partidos/${params.partidoId}`, request.signal)\n  if (String(partido.jornadaId) !== params.jornadaId) throw data('Ese partido no es de esta jornada', { status: 404 })\n  return { partido }\n}\n\nexport default function PartidoPagina() {\n  const { partido } = useLoaderData<typeof cargarPartido>()\n\n  return (\n    <article className=\"ficha\">\n      <h2>\n        {partido.local} {partido.resultado ?? '–'} {partido.visitante}\n      </h2>\n      {/* 3. Lee los datos de la jornada, la ruta madre, con useRouteLoaderData\n          (sin volver a pedirlos) y pinta: Partido de la jornada 9 (sábado 24 de octubre) */}\n      <p>Partido de la jornada ?</p>\n      <p>\n        {partido.pabellon}, {partido.hora}\n      </p>\n      <p>Arbitraje: {partido.arbitro}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Jornada.tsx",
      "codigo": "import { Link, Outlet, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Jornada } from './api'\n\nexport async function cargarJornada({ params, request }: LoaderFunctionArgs) {\n  const jornada = await pedir<Jornada>(`/api/jornadas/${params.jornadaId}`, request.signal)\n  return { jornada }\n}\n\nexport default function JornadaPagina() {\n  const { jornada } = useLoaderData<typeof cargarJornada>()\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <h1>\n          Jornada {jornada.id} · {jornada.fecha}\n        </h1>\n        <ul>\n          {jornada.partidos.map((partido) => (\n            <li key={partido.id}>\n              <Link to={`/jornadas/${jornada.id}/partidos/${partido.id}`}>\n                {partido.local} – {partido.visitante}\n              </Link>{' '}\n              · {partido.resultado ?? 'sin jugar'}\n            </li>\n          ))}\n        </ul>\n      </section>\n      <Outlet />\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "import { data } from 'react-router'\n\nexport type Cruce = { id: number; local: string; visitante: string; resultado: string | null }\n\nexport type Jornada = { id: number; fecha: string; partidos: Cruce[] }\n\nexport type Partido = Cruce & {\n  jornadaId: number\n  hora: string\n  pabellon: string\n  arbitro: string\n}\n\n// fetch con las comprobaciones de siempre. El signal es opcional:\n// si se lo pasas, la petición se puede cancelar.\nexport async function pedir<T>(url: string, signal?: AbortSignal): Promise<T> {\n  const respuesta = await fetch(url, { signal })\n  if (respuesta.status === 404) throw data('No está en el calendario', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1c2a1f;\n  background: #f7faf6;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 3px solid #15803d;\n  background: #ecfdf3;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\nnav a {\n  margin-right: 0.6rem;\n  color: #14532d;\n}\n\nnav a.active {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\nh2 {\n  font-size: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.dos-columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));\n  gap: 1rem;\n}\n\nol,\nul {\n  margin: 0 0 0.75rem;\n  padding-left: 1.3rem;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.ficha {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #fff;\n}\n\n.ficha p {\n  margin: 0.25rem 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  align-items: end;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.15rem;\n  font-size: 0.85rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n  padding: 0.25rem 0.5rem;\n}\n\n.sugerencias a {\n  margin-right: 0.5rem;\n}\n\n.cargando {\n  color: #6b7280;\n  font-style: italic;\n}\n\n.migas ol {\n  display: flex;\n  flex-wrap: wrap;\n  margin: 0;\n  padding: 0.4rem 1rem;\n  list-style: none;\n  font-size: 0.85rem;\n  background: #fff;\n  border-bottom: 1px solid #d1fae5;\n}\n\n.migas li {\n  margin: 0;\n}\n\n.migas li + li::before {\n  content: '›';\n  padding: 0 0.4rem;\n  color: #6b7280;\n}\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "urlInicial": "/jornadas/9/partidos/5",
  "mostrarConsola": false,
  "mostrarRouter": true,
  "exigirTiposCorrectos": true,
  "api": {
    "jornadas": [
      {
        "id": 8,
        "fecha": "sábado 17 de octubre",
        "partidos": [
          {
            "id": 1,
            "local": "Ponferrada Sur FS",
            "visitante": "Villafranca FS",
            "resultado": "4-1"
          },
          {
            "id": 2,
            "local": "Atlético Fabero",
            "visitante": "CD Bembibre Sala",
            "resultado": "2-2"
          },
          {
            "id": 3,
            "local": "Toreno Sala",
            "visitante": "FS Cacabelos",
            "resultado": "1-3"
          }
        ]
      },
      {
        "id": 9,
        "fecha": "sábado 24 de octubre",
        "partidos": [
          {
            "id": 4,
            "local": "CD Bembibre Sala",
            "visitante": "FS Cacabelos",
            "resultado": "3-1"
          },
          {
            "id": 5,
            "local": "Atlético Fabero",
            "visitante": "Toreno Sala",
            "resultado": "5-2"
          },
          {
            "id": 6,
            "local": "Villafranca FS",
            "visitante": "Ponferrada Sur FS",
            "resultado": "2-4"
          }
        ]
      },
      {
        "id": 10,
        "fecha": "sábado 31 de octubre",
        "partidos": [
          {
            "id": 7,
            "local": "Ponferrada Sur FS",
            "visitante": "Atlético Fabero",
            "resultado": null
          },
          {
            "id": 8,
            "local": "FS Cacabelos",
            "visitante": "Villafranca FS",
            "resultado": null
          },
          {
            "id": 9,
            "local": "Toreno Sala",
            "visitante": "CD Bembibre Sala",
            "resultado": null
          }
        ]
      }
    ],
    "partidos": [
      {
        "id": 1,
        "jornadaId": 8,
        "local": "Ponferrada Sur FS",
        "visitante": "Villafranca FS",
        "resultado": "4-1",
        "hora": "18:00",
        "pabellon": "Pabellón de Flores del Sil",
        "arbitro": "Ana Rubial"
      },
      {
        "id": 2,
        "jornadaId": 8,
        "local": "Atlético Fabero",
        "visitante": "CD Bembibre Sala",
        "resultado": "2-2",
        "hora": "17:30",
        "pabellon": "Pabellón del Pozo Viejo",
        "arbitro": "Tomás Liébana"
      },
      {
        "id": 3,
        "jornadaId": 8,
        "local": "Toreno Sala",
        "visitante": "FS Cacabelos",
        "resultado": "1-3",
        "hora": "19:00",
        "pabellon": "Polideportivo de Toreno",
        "arbitro": "Carmen Losada"
      },
      {
        "id": 4,
        "jornadaId": 9,
        "local": "CD Bembibre Sala",
        "visitante": "FS Cacabelos",
        "resultado": "3-1",
        "hora": "18:00",
        "pabellon": "Pabellón Municipal de Bembibre",
        "arbitro": "Tomás Liébana"
      },
      {
        "id": 5,
        "jornadaId": 9,
        "local": "Atlético Fabero",
        "visitante": "Toreno Sala",
        "resultado": "5-2",
        "hora": "17:30",
        "pabellon": "Pabellón del Pozo Viejo",
        "arbitro": "Ana Rubial"
      },
      {
        "id": 6,
        "jornadaId": 9,
        "local": "Villafranca FS",
        "visitante": "Ponferrada Sur FS",
        "resultado": "2-4",
        "hora": "19:00",
        "pabellon": "Pabellón del Burbia",
        "arbitro": "Carmen Losada"
      },
      {
        "id": 7,
        "jornadaId": 10,
        "local": "Ponferrada Sur FS",
        "visitante": "Atlético Fabero",
        "resultado": null,
        "hora": "18:00",
        "pabellon": "Pabellón de Flores del Sil",
        "arbitro": "Carmen Losada"
      },
      {
        "id": 8,
        "jornadaId": 10,
        "local": "FS Cacabelos",
        "visitante": "Villafranca FS",
        "resultado": null,
        "hora": "17:30",
        "pabellon": "Pabellón de La Moncloa",
        "arbitro": "Ana Rubial"
      },
      {
        "id": 9,
        "jornadaId": 10,
        "local": "Toreno Sala",
        "visitante": "CD Bembibre Sala",
        "resultado": null,
        "hora": "19:00",
        "pabellon": "Polideportivo de Toreno",
        "arbitro": "Tomás Liébana"
      }
    ]
  },
  "red": {
    "latencia": 400
  },
  "comprobaciones": [
    {
      "descripcion": "En un acta, las migas llevan un enlace a su jornada",
      "urlInicial": "/jornadas/9/partidos/5",
      "pasos": [],
      "espera": {
        "rol": "link",
        "nombre": "Jornada 9"
      }
    },
    {
      "descripcion": "Pulsar «Jornada 9» en las migas lleva a /jornadas/9",
      "urlInicial": "/jornadas/9/partidos/5",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Jornada 9"
          }
        }
      ],
      "espera": {
        "url": "/jornadas/9"
      }
    },
    {
      "descripcion": "La última miga es el partido, con sus dos equipos",
      "urlInicial": "/jornadas/9/partidos/5",
      "pasos": [],
      "espera": {
        "rol": "navigation",
        "nombre": "Migas de pan",
        "texto": "Atlético Fabero – Toreno Sala"
      }
    },
    {
      "descripcion": "En la página de la jornada, «Jornada 9» es la última miga y no es un enlace",
      "urlInicial": "/jornadas/9",
      "pasos": [
        {
          "pulsar": {
            "rol": "navigation",
            "nombre": "Migas de pan",
            "texto": "Jornada 9"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "link",
          "nombre": "Jornada 9"
        }
      }
    },
    {
      "descripcion": "Al abrir otro partido, la última miga cambia",
      "urlInicial": "/jornadas/9/partidos/5",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "CD Bembibre Sala – FS Cacabelos"
          }
        }
      ],
      "espera": {
        "rol": "navigation",
        "nombre": "Migas de pan",
        "texto": "CD Bembibre Sala – FS Cacabelos"
      }
    },
    {
      "descripcion": "El acta dice de qué jornada es, con su fecha",
      "urlInicial": "/jornadas/9/partidos/5",
      "pasos": [],
      "espera": {
        "texto": "Partido de la jornada 9 (sábado 24 de octubre)"
      }
    },
    {
      "descripcion": "También en un acta de otra jornada",
      "urlInicial": "/jornadas/8/partidos/2",
      "pasos": [],
      "espera": {
        "texto": "Partido de la jornada 8 (sábado 17 de octubre)"
      }
    }
  ]
}
```

Cuando funcione, pasa de un acta a otra de la misma jornada y mira el registro: solo se ejecuta el `loader` del partido, y aun así la fecha sigue ahí.

**Retos para seguir practicando** (sin comprobación automática):

1. En el buscador de la lección, añade al mismo `<Form method="get">` un desplegable con la liga (`name="liga"`) y filtra en el `loader` con los dos parámetros. Fíjate en que cada envío sustituye la búsqueda entera de la URL, y en que la liga elegida sigue en el desplegable tras pulsar Atrás.
2. Que el buscador busque mientras escribes: con `useSubmit` (lección 3) envía el formulario en cada `onChange`, con `replace: true` para no llenar el historial (la idea de la lección 77). Activa «Responder desordenado», escribe deprisa y comprueba en el registro que solo la última navegación llega a terminar.
3. Pon el título de la pestaña desde las rutas: un `handle.titulo` en cada una y un componente en la maquetación que pinte un `<title>` con el de la última que lo tenga (las etiquetas `<title>` de React 19, lección 81).
4. En la liga de la lección, lanza a la vez el `loader` del equipo y una segunda petición que no dependa de él (el próximo partido, por ejemplo): primero con dos `await` seguidos y después con `Promise.all`. Mide la diferencia en el registro.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Data Loading",
      "descripcion": "Los loader del modo datos y cómo los lee cada componente con useLoaderData.",
      "url": "https://reactrouter.com/start/data/data-loading",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Route Object",
      "descripcion": "Todos los campos de un objeto de ruta: loader, action, middleware, shouldRevalidate, lazy y handle.",
      "url": "https://reactrouter.com/start/data/route-object",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Race Conditions",
      "descripcion": "Cómo imita React Router al navegador con las navegaciones interrumpidas, y qué queda en manos del servidor.",
      "url": "https://reactrouter.com/explanation/race-conditions",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useRouteLoaderData",
      "descripcion": "La referencia del hook: los datos de cualquier ruta de la página por su id.",
      "url": "https://reactrouter.com/api/hooks/useRouteLoaderData",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useMatches",
      "descripcion": "Qué trae cada objeto de la rama. Ojo: la guía Using handle todavía usa match.data, que en la 8.5 se llama loaderData.",
      "url": "https://reactrouter.com/api/hooks/useMatches",
      "etiqueta": "React Router"
    },
    {
      "titulo": "AbortSignal",
      "descripcion": "La señal que aborta un fetch: aborted, reason y el evento abort.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal",
      "etiqueta": "MDN"
    }
  ]
}
```
