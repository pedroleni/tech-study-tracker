# Rutas anidadas, parámetros y la URL como estado

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `rutas-anidadas-parametros-y-la-url-como-estado` (autogenerado del título)
- **Orden:** 770
- **Fuentes:** [Routing](https://reactrouter.com/start/declarative/routing) + [URL Values](https://reactrouter.com/start/declarative/url-values) + [useSearchParams](https://reactrouter.com/api/hooks/useSearchParams) — ver `contenido/react/TEMARIO.md` #77

---

## Qué es y para qué sirve

Mira esta dirección de la Inmobiliaria El Rellano, que alquila pisos en Zaragoza:

```text
/pisos/21?barrio=actur&habitaciones=2
```

Lleva tres datos: **en qué sección estás** (`/pisos`), **qué piso miras** (`21`) y **cómo has filtrado la lista** (`?barrio=actur&habitaciones=2`). Y la pantalla tiene una cuarta cosa que no se ve en la URL pero se nota: la cabecera, el menú y la lista **siguen ahí** mientras pasas de un piso a otro.

El router de la lección 76 solo sabía comparar direcciones exactas. Para una aplicación así hacen falta cuatro piezas más, que son las de esta lección:

- **Rutas anidadas**: una ruta dentro de otra, que se pinta en el hueco que le deja su madre (`<Outlet />`).
- **Parámetros**: un trozo variable de la ruta, como el `21` de `/pisos/21`, que se lee con `useParams`.
- **La búsqueda** (lo que va detrás de `?`) **como estado**: filtros que se leen y se cambian con `useSearchParams`, y que sobreviven a una recarga, viajan en un enlace y se deshacen con Atrás.
- **Navegar desde el código** con `useNavigate`, para cuando no hay ningún enlace que pulsar.

En la lección 75 viste que lo que tiene que sobrevivir a una recarga, compartirse o deshacerse con Atrás va a la URL. Aquí aprendes a ponerlo ahí: primero ampliando el router a mano, que corre en la vista previa con el navegador de mentira de la lección 76, y después con React Router (todo comprobado con la versión 8.5.0 en un proyecto de Vite).

## Rutas anidadas: la URL también es un árbol

En React Router, un `<Route>` puede llevar otros dentro. **La ruta hija se pinta dentro de la madre, en el sitio donde la madre pone `<Outlet />`**. Así se describe la inmobiliaria entera:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Route, Routes } from 'react-router'\nimport Maquetacion from './Maquetacion.jsx'\nimport Inicio from './paginas/Inicio.jsx'\nimport Pisos from './paginas/Pisos.jsx'\nimport ElegirPiso from './paginas/ElegirPiso.jsx'\nimport FichaPiso from './paginas/FichaPiso.jsx'\nimport NoEncontrada from './paginas/NoEncontrada.jsx'\n\nexport default function App() {\n  return (\n    <Routes>\n      <Route element={<Maquetacion />}>\n        <Route index element={<Inicio />} />\n        <Route path=\"pisos\" element={<Pisos />}>\n          <Route index element={<ElegirPiso />} />\n          <Route path=\":pisoId\" element={<FichaPiso />} />\n        </Route>\n        <Route path=\"*\" element={<NoEncontrada />} />\n      </Route>\n    </Routes>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Route element={<Maquetacion />}>",
      "nota": "Una ruta sin path: no añade nada a la URL, solo un envoltorio. Es una ruta de maquetación (layout route): cabecera, menú y pie para todas sus hijas."
    },
    {
      "fragmento": "<Route index element={<Inicio />} />",
      "nota": "Una ruta índice: lo que se pinta en la URL de su madre cuando no hay nada más detrás. Aquí, en /. No puede tener hijas."
    },
    {
      "fragmento": "<Route path=\"pisos\" element={<Pisos />}>",
      "nota": "Sin barra delante: las rutas hijas se escriben relativas a su madre. Esta encaja con /pisos y con todo lo que cuelga de /pisos."
    },
    {
      "fragmento": "<Route index element={<ElegirPiso />} />",
      "nota": "En /pisos a secas, el hueco de Pisos muestra «Elige un piso de la lista»."
    },
    {
      "fragmento": "<Route path=\":pisoId\" element={<FichaPiso />} />",
      "nota": "Un segmento dinámico: los dos puntos dicen que ahí va un valor, el que sea. Encaja con /pisos/14, /pisos/21... y FichaPiso lo lee con useParams."
    },
    {
      "fragmento": "<Route path=\"*\" element={<NoEncontrada />} />",
      "nota": "La 404 de la lección 76, ahora dentro de la maquetación: una dirección que no existe se ve con su cabecera y su menú. Comprobado: /ofertas y /pisos/14/fotos llegan aquí."
    }
  ]
}
```

El árbol de rutas y el componente que pinta cada una:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas de la inmobiliaria",
  "nodos": [
    {
      "nombre": "Routes",
      "nivel": 0,
      "nota": "← elige la rama que encaja con la URL"
    },
    {
      "nombre": "Maquetacion",
      "nivel": 1,
      "etiqueta": "sin path",
      "nota": "← cabecera, menú y pie; sus hijas van en su <Outlet />"
    },
    {
      "nombre": "Inicio",
      "nivel": 2,
      "etiqueta": "index",
      "nota": "← /"
    },
    {
      "nombre": "Pisos",
      "nivel": 2,
      "etiqueta": "path: pisos",
      "nota": "← la lista, en /pisos y en lo que cuelga de ella; sus hijas, en su <Outlet />"
    },
    {
      "nombre": "ElegirPiso",
      "nivel": 3,
      "etiqueta": "index",
      "nota": "← /pisos"
    },
    {
      "nombre": "FichaPiso",
      "nivel": 3,
      "etiqueta": "path: :pisoId",
      "nota": "← /pisos/14, /pisos/21…"
    },
    {
      "nombre": "NoEncontrada",
      "nivel": 2,
      "etiqueta": "path: *",
      "nota": "← cualquier otra dirección"
    }
  ]
}
```

En `/pisos/14`, `<Routes>` recorre una rama entera: pinta `Maquetacion`; en su `<Outlet />`, `Pisos`; y en el `<Outlet />` de `Pisos`, `FichaPiso`. Cada componente solo sabe que tiene un hueco; **cuál se llena lo decide la URL**:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Link, NavLink, Outlet } from 'react-router'\nimport { PISOS } from './datos.js'\n\nexport function Maquetacion() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Inmobiliaria El Rellano</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/\">Inicio</NavLink>\n          <NavLink to=\"/pisos\">Pisos</NavLink>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <footer>Calle del Portillo, 3 · Zaragoza</footer>\n    </>\n  )\n}\n\nexport function Pisos() {\n  return (\n    <div className=\"dos-columnas\">\n      <ul>\n        {PISOS.map((piso) => (\n          <li key={piso.id}>\n            <Link to={String(piso.id)}>{piso.titulo}</Link>\n          </li>\n        ))}\n      </ul>\n      <Outlet />\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<main>\n        <Outlet />\n      </main>",
      "nota": "El hueco de la maquetación. En / se pinta Inicio; en /pisos/14, Pisos (con la ficha dentro); en /ofertas, NoEncontrada."
    },
    {
      "fragmento": "<NavLink to=\"/pisos\">Pisos</NavLink>",
      "nota": "Sin end, sigue activo en /pisos/14: el menú marca «Pisos» mientras miras cualquier piso (lección 76)."
    },
    {
      "fragmento": "<Link to={String(piso.id)}>",
      "nota": "Un enlace relativo: dentro de la ruta pisos, to=\"14\" lleva a /pisos/14. Igual que una ruta relativa en un sistema de archivos."
    },
    {
      "fragmento": "<Outlet />\n    </div>",
      "nota": "El hueco de Pisos, al lado de la lista. Al pasar de /pisos/14 a /pisos/21, la lista se queda montada y solo cambia lo de aquí."
    }
  ]
}
```

`<Outlet />` es el `children` de una ruta: la lección 9 te avisó de que una maquetación con cabecera, menú y pie sería «el patrón de siempre» al añadir rutas. La diferencia es quién decide qué va dentro: con `children` lo decide el componente padre al escribir el JSX; con `<Outlet />`, la URL.

Y como **la madre no se vuelve a montar al cambiar de hija**, lo que tenga en su estado se conserva: si la lista de `Pisos` tuviera un buscador a medio escribir, seguiría ahí al abrir otro piso.

Dos reglas que conviene saber:

- **Las rutas hijas se escriben sin barra delante** (`path="pisos"`, `path=":pisoId"`). Si una hija lleva una ruta absoluta que no empieza por la de su madre, React Router se para con `Absolute route path "/fichas/:id" nested under path "/pisos" is not valid. An absolute child route path must start with the combined path of all its parent routes.`
- **Una madre sin `<Outlet />` no pinta a sus hijas**, y no avisa de nada:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export function Pisos() {\n  return (\n    <div className=\"dos-columnas\">\n      <ul>\n        {PISOS.map((piso) => (\n          <li key={piso.id}>\n            <Link to={String(piso.id)}>{piso.titulo}</Link>\n          </li>\n        ))}\n      </ul>\n      {/* Se nos ha olvidado el <Outlet /> */}\n    </div>\n  )\n}\n\n// Con las rutas de antes, abres /pisos/14.",
  "opciones": [
    "La lista de pisos y, al lado, la ficha del 14",
    "La lista de pisos, sin ficha, y nada en la consola",
    "Un error: la ruta :pisoId no tiene dónde pintarse",
    "La ficha del 14 sola, sin la lista"
  ],
  "correcta": 1,
  "explicacion": "React Router encaja la ruta y llega hasta FichaPiso, pero Pisos no le deja ningún hueco, así que la ficha no se pinta. No hay error ni aviso (comprobado con React Router 8.5.0): solo una página a la que le falta algo. Si una ruta hija «no aparece», busca el Outlet de su madre."
}
```

## Parámetros dinámicos: `useParams`

Un segmento que empieza por dos puntos (`:pisoId`) encaja con cualquier valor, y React Router te lo da con `useParams`. Puede haber varios en una misma ruta, como en `/c/:categoriaId/p/:productoId`, y la documentación muestra también segmentos opcionales (`:lang?/categorias`) y comodines (`archivos/*`, que se leen en `params['*']`).

Nuestro router a mano aprende lo mismo con una función, `encajar`, en `router.jsx`. Es la idea de `compilarPatron` del recetario de JavaScript, sin expresiones regulares: parte el patrón y la ruta por las barras, compara tramo a tramo y, donde el patrón tiene `:algo`, apunta el valor. `Rutas` prueba los patrones **en orden**, pinta el primero que encaja (React Router, en cambio, elige el que mejor encaja, como viste en la lección 76) y deja sus parámetros en un contexto, `ParametrosContext`, que lee `useParametros()`, nuestro `useParams`.

Navega por los pisos y usa los marcadores: `/pisos/99` es un piso que ya no existe. Después haz la prueba de la consigna mirando el árbol de renders, debajo de la vista previa.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cada piso, en su dirección",
  "consigna": "Abre «Luminoso junto al parque», pulsa «Ver plano» y después «Ático con terraza», en «En el mismo barrio»: el plano sigue abierto, ahora con el piso 15. En el árbol, DetallePiso sale como re-render y no como montado: es el mismo componente en el mismo sitio, así que conserva su estado. Arréglalo en App.jsx: en FichaPiso, escribe <DetallePiso key={piso.id} piso={piso} /> y repite la prueba.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Navegador from './Navegador'\nimport { Enlace, Rutas, useParametros } from './router'\nimport { BARRIOS, PISOS } from './datos'\nimport './estilos.css'\n\nfunction ListaPisos() {\n  return (\n    <>\n      <h1>Pisos en alquiler</h1>\n      <ul>\n        {PISOS.map((piso) => (\n          <li key={piso.id}>\n            <Enlace a={'/pisos/' + piso.id}>{piso.titulo}</Enlace> · {BARRIOS[piso.barrio]} · {piso.precio} €/mes\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction DetallePiso({ piso }) {\n  const [verPlano, setVerPlano] = useState(false)\n  const vecinos = PISOS.filter((p) => p.barrio === piso.barrio && p.id !== piso.id)\n\n  return (\n    <article>\n      <h1>{piso.titulo}</h1>\n      <p>\n        {BARRIOS[piso.barrio]} · {piso.habitaciones} habitaciones · {piso.metros} m² · {piso.precio} €/mes\n      </p>\n      <button onClick={() => setVerPlano(!verPlano)}>{verPlano ? 'Ocultar plano' : 'Ver plano'}</button>\n      {verPlano && <p className=\"plano\">Plano del piso {piso.id}</p>}\n      <p className=\"vecinos\">\n        En el mismo barrio:{' '}\n        {vecinos.map((vecino) => (\n          <Enlace key={vecino.id} a={'/pisos/' + vecino.id}>\n            {vecino.titulo}\n          </Enlace>\n        ))}\n      </p>\n    </article>\n  )\n}\n\nfunction FichaPiso() {\n  const { pisoId } = useParametros()\n  const piso = PISOS.find((p) => p.id === Number(pisoId))\n\n  if (!piso) {\n    return (\n      <>\n        <h1>Este piso ya no está disponible</h1>\n        <Enlace a=\"/pisos\">Ver los pisos disponibles</Enlace>\n      </>\n    )\n  }\n  return <DetallePiso piso={piso} />\n}\n\nexport default function App() {\n  return (\n    <Navegador inicio=\"/pisos\" marcadores={['/pisos/21', '/pisos/99']}>\n      <nav aria-label=\"Principal\">\n        <Enlace a=\"/\">Inicio</Enlace>\n        <Enlace a=\"/pisos\">Pisos</Enlace>\n      </nav>\n      <main>\n        <Rutas\n          rutas={{\n            '/': <h1>Inmobiliaria El Rellano</h1>,\n            '/pisos': <ListaPisos />,\n            '/pisos/:pisoId': <FichaPiso />,\n            '*': <h1>Página no encontrada</h1>,\n          }}\n        />\n      </main>\n    </Navegador>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { createContext, useContext } from 'react'\nimport { useNavegador } from './Navegador'\n\nconst ParametrosContext = createContext({})\nParametrosContext.displayName = 'Parametros'\n\n// '/pisos/:pisoId' encaja con '/pisos/14' y da { pisoId: '14' }; si no encaja, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\n// Pinta la primera ruta que encaja y deja sus parámetros en un contexto\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  const camino = url.split('?')[0]\n  for (const [patron, elemento] of Object.entries(rutas)) {\n    const parametros = patron === '*' ? {} : encajar(patron, camino)\n    if (parametros) return <ParametrosContext value={parametros}>{elemento}</ParametrosContext>\n  }\n  return null\n}\n\n// Como useParams: los parámetros de la ruta que se está pintando\nexport function useParametros() {\n  return useContext(ParametrosContext)\n}\n\n// Como useSearchParams: lo que va detrás de ? y una función para cambiarlo\nexport function useBusqueda() {\n  const { url, navegar } = useNavegador()\n  const [camino, consulta = ''] = url.split('?')\n\n  function setBusqueda(valores) {\n    const texto = new URLSearchParams(valores).toString()\n    navegar(texto ? camino + '?' + texto : camino)\n  }\n\n  return [new URLSearchParams(consulta), setBusqueda]\n}\n\n// Como NavLink: activo en su ruta y en las que cuelgan de ella\nexport function Enlace({ a, children }) {\n  const { url, navegar } = useNavegador()\n  const camino = url.split('?')[0]\n  const destino = a.split('?')[0]\n  const activo = camino === destino || (destino !== '/' && camino.startsWith(destino + '/'))\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={activo ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// Un navegador de mentira: la URL y el historial viven aquí, fuera de la app.\n// La vista previa no deja cargar /juegos de verdad, así que se simula.\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const BARRIOS = {\n  delicias: 'Delicias',\n  actur: 'Actur',\n  casco: 'Casco Histórico',\n}\n\nexport const PISOS = [\n  { id: 14, titulo: 'Luminoso junto al parque', barrio: 'delicias', habitaciones: 2, metros: 68, precio: 750 },\n  { id: 15, titulo: 'Ático con terraza', barrio: 'delicias', habitaciones: 3, metros: 85, precio: 890 },\n  { id: 21, titulo: 'Exterior con ascensor', barrio: 'actur', habitaciones: 2, metros: 74, precio: 820 },\n  { id: 32, titulo: 'Estudio reformado', barrio: 'casco', habitaciones: 1, metros: 45, precio: 640 },\n  { id: 40, titulo: 'Familiar con garaje', barrio: 'actur', habitaciones: 4, metros: 110, precio: 1050 },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La inmobiliaria */\nnav[aria-label='Principal'] {\n  display: flex;\n  gap: 1rem;\n  padding: 0.5rem 0;\n  border-bottom: 1px solid #d6d3d1;\n}\n\na {\n  color: #1d4ed8;\n}\n\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.vecinos a + a {\n  margin-left: 0.75rem;\n}\n\n.plano {\n  padding: 0.5rem;\n  border: 2px dashed #a8a29e;\n}\n\nbutton,\nselect {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Tres cosas de este ejemplo pasan igual con React Router:

- **Los parámetros son siempre texto.** `useParams()` en `/pisos/14` devuelve `{ pisoId: '14' }`, con comillas (comprobado). Por eso `FichaPiso` busca con `Number(pisoId)`.
- **Que la ruta encaje no significa que el piso exista.** `/pisos/99` encaja con `:pisoId`, así que no llega a la 404 de la app: es `FichaPiso` quien tiene que decir «Este piso ya no está disponible».
- **Cambiar de parámetro no vuelve a montar la página.** Pasar de `/pisos/14` a `/pisos/15` deja `FichaPiso` en su sitio con otro valor, y el estado de dentro se queda (comprobado: el plano seguía abierto). Es la regla de la lección 26, posición y `key`: si quieres empezar de cero con cada piso, dale una `key`.

Con React Router, la ficha queda así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useParams } from 'react-router'\nimport { PISOS } from '../datos.js'\nimport DetallePiso from './DetallePiso.jsx'\n\nexport default function FichaPiso() {\n  const { pisoId } = useParams()\n  const piso = PISOS.find((p) => p.id === Number(pisoId))\n\n  if (!piso) {\n    return <h2>Este piso ya no está disponible</h2>\n  }\n  return <DetallePiso key={piso.id} piso={piso} />\n}",
  "anotaciones": [
    {
      "fragmento": "const { pisoId } = useParams()",
      "nota": "Los valores de los segmentos dinámicos de la URL, con el nombre que les diste en path. Siempre cadenas de texto."
    },
    {
      "fragmento": "p.id === Number(pisoId)",
      "nota": "Convertir antes de comparar: '14' === 14 es false. Si los ids fueran textos, como un slug, no haría falta."
    },
    {
      "fragmento": "<h2>Este piso ya no está disponible</h2>",
      "nota": "La «404 del recurso»: la ruta existe, el piso no. Un mensaje dentro de la maquetación, con la lista al lado, es más útil que una página de error."
    },
    {
      "fragmento": "<DetallePiso key={piso.id} piso={piso} />",
      "nota": "Con la key, cada piso monta su propio DetallePiso: el plano abierto, un formulario a medias o el scroll de una galería no pasan de un piso al siguiente."
    }
  ]
}
```

## La búsqueda de la URL como estado: `useSearchParams`

Los filtros de una lista son estado: el usuario los cambia y la pantalla responde. Si los guardas con `useState`, funcionan... hasta que alguien **recarga**, **comparte el enlace** («mira estos pisos de dos habitaciones en el Actur») o **pulsa Atrás** esperando volver al filtro anterior. Las tres fallan: el estado de React vive en la memoria de la pestaña, así que una recarga lo borra, un enlace no lo lleva y Atrás ni lo toca.

La **búsqueda** de la URL, lo que va detrás de `?`, es el sitio pensado para eso: `?barrio=actur&habitaciones=2`. El navegador la guarda en el historial y en los marcadores, y va dentro de cada enlace que copias. Con una SPA, el servidor responde a `/pisos?barrio=actur` con el mismo `index.html` de siempre: quien entiende el filtro es tu app. En este ejemplo hay **dos filtros, uno en cada sitio**, para que compares:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un filtro en la URL y otro en un useState",
  "consigna": "Elige un barrio y un número de habitaciones. Mira la barra: solo cambia con el barrio. Pulsa Recargar: el barrio sigue y las habitaciones vuelven a «Cualquiera». Elige otro barrio y pulsa Atrás: vuelve el anterior. Por último, abre el marcador /pisos?barrio=actur, como si alguien te hubiera mandado el enlace.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Navegador from './Navegador'\nimport { Enlace, Rutas, useBusqueda } from './router'\nimport { BARRIOS, PISOS } from './datos'\nimport './estilos.css'\n\nfunction ListaPisos() {\n  const [busqueda, setBusqueda] = useBusqueda()\n  const barrio = busqueda.get('barrio') ?? ''\n  const [minimo, setMinimo] = useState('')\n\n  const visibles = PISOS.filter(\n    (piso) => (barrio === '' || piso.barrio === barrio) && piso.habitaciones >= Number(minimo),\n  )\n\n  function manejarBarrio(e) {\n    setBusqueda(e.target.value ? { barrio: e.target.value } : {})\n  }\n\n  return (\n    <>\n      <h1>Pisos en alquiler</h1>\n      <div className=\"filtros\">\n        <label>\n          Barrio (en la URL)\n          <select value={barrio} onChange={manejarBarrio}>\n            <option value=\"\">Todos</option>\n            {Object.entries(BARRIOS).map(([id, nombre]) => (\n              <option key={id} value={id}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <label>\n          Habitaciones (en un useState)\n          <select value={minimo} onChange={(e) => setMinimo(e.target.value)}>\n            <option value=\"\">Cualquiera</option>\n            <option value=\"2\">2 o más</option>\n            <option value=\"3\">3 o más</option>\n          </select>\n        </label>\n      </div>\n      <p role=\"status\">{visibles.length === 1 ? '1 piso' : `${visibles.length} pisos`}</p>\n      <ul>\n        {visibles.map((piso) => (\n          <li key={piso.id}>\n            {piso.titulo} · {BARRIOS[piso.barrio]} · {piso.habitaciones} hab. · {piso.precio} €/mes\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <Navegador inicio=\"/pisos\" marcadores={['/pisos?barrio=actur', '/pisos?barrio=casco']}>\n      <nav aria-label=\"Principal\">\n        <Enlace a=\"/\">Inicio</Enlace>\n        <Enlace a=\"/pisos\">Pisos</Enlace>\n      </nav>\n      <main>\n        <Rutas\n          rutas={{\n            '/': <h1>Inmobiliaria El Rellano</h1>,\n            '/pisos': <ListaPisos />,\n            '*': <h1>Página no encontrada</h1>,\n          }}\n        />\n      </main>\n    </Navegador>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { createContext, useContext } from 'react'\nimport { useNavegador } from './Navegador'\n\nconst ParametrosContext = createContext({})\nParametrosContext.displayName = 'Parametros'\n\n// '/pisos/:pisoId' encaja con '/pisos/14' y da { pisoId: '14' }; si no encaja, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\n// Pinta la primera ruta que encaja y deja sus parámetros en un contexto\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  const camino = url.split('?')[0]\n  for (const [patron, elemento] of Object.entries(rutas)) {\n    const parametros = patron === '*' ? {} : encajar(patron, camino)\n    if (parametros) return <ParametrosContext value={parametros}>{elemento}</ParametrosContext>\n  }\n  return null\n}\n\n// Como useParams: los parámetros de la ruta que se está pintando\nexport function useParametros() {\n  return useContext(ParametrosContext)\n}\n\n// Como useSearchParams: lo que va detrás de ? y una función para cambiarlo\nexport function useBusqueda() {\n  const { url, navegar } = useNavegador()\n  const [camino, consulta = ''] = url.split('?')\n\n  function setBusqueda(valores) {\n    const texto = new URLSearchParams(valores).toString()\n    navegar(texto ? camino + '?' + texto : camino)\n  }\n\n  return [new URLSearchParams(consulta), setBusqueda]\n}\n\n// Como NavLink: activo en su ruta y en las que cuelgan de ella\nexport function Enlace({ a, children }) {\n  const { url, navegar } = useNavegador()\n  const camino = url.split('?')[0]\n  const destino = a.split('?')[0]\n  const activo = camino === destino || (destino !== '/' && camino.startsWith(destino + '/'))\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={activo ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// Un navegador de mentira: la URL y el historial viven aquí, fuera de la app.\n// La vista previa no deja cargar /juegos de verdad, así que se simula.\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const BARRIOS = {\n  delicias: 'Delicias',\n  actur: 'Actur',\n  casco: 'Casco Histórico',\n}\n\nexport const PISOS = [\n  { id: 14, titulo: 'Luminoso junto al parque', barrio: 'delicias', habitaciones: 2, metros: 68, precio: 750 },\n  { id: 15, titulo: 'Ático con terraza', barrio: 'delicias', habitaciones: 3, metros: 85, precio: 890 },\n  { id: 21, titulo: 'Exterior con ascensor', barrio: 'actur', habitaciones: 2, metros: 74, precio: 820 },\n  { id: 32, titulo: 'Estudio reformado', barrio: 'casco', habitaciones: 1, metros: 45, precio: 640 },\n  { id: 40, titulo: 'Familiar con garaje', barrio: 'actur', habitaciones: 4, metros: 110, precio: 1050 },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La inmobiliaria */\nnav[aria-label='Principal'] {\n  display: flex;\n  gap: 1rem;\n  padding: 0.5rem 0;\n  border-bottom: 1px solid #d6d3d1;\n}\n\na {\n  color: #1d4ed8;\n}\n\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.vecinos a + a {\n  margin-left: 0.75rem;\n}\n\n.plano {\n  padding: 0.5rem;\n  border: 2px dashed #a8a29e;\n}\n\nbutton,\nselect {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Fíjate en cómo se lee el filtro de la URL: `const barrio = busqueda.get('barrio') ?? ''`. **No hay ningún `useState` para el barrio: la URL es su único dueño.** Es la «única fuente de verdad» de la lección 25, con una particularidad: este estado vive fuera de React, por encima de toda la app. `useBusqueda`, en `router.jsx`, devuelve un [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) con lo de detrás de `?`, y una función que navega a la misma ruta con otra búsqueda.

React Router hace lo mismo con `useSearchParams`, que devuelve `[searchParams, setSearchParams]`. Así queda la lista de pisos, con la ficha en su `<Outlet />`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Link, Outlet, useSearchParams } from 'react-router'\nimport { BARRIOS, PISOS } from '../datos.js'\n\nexport default function Pisos() {\n  const [searchParams, setSearchParams] = useSearchParams()\n  const barrio = searchParams.get('barrio') ?? ''\n  const visibles = barrio ? PISOS.filter((piso) => piso.barrio === barrio) : PISOS\n\n  function manejarBarrio(e) {\n    const valor = e.target.value\n    setSearchParams((anteriores) => {\n      if (valor) anteriores.set('barrio', valor)\n      else anteriores.delete('barrio')\n      return anteriores\n    })\n  }\n\n  return (\n    <div className=\"dos-columnas\">\n      <section>\n        <label>\n          Barrio{' '}\n          <select value={barrio} onChange={manejarBarrio}>\n            <option value=\"\">Todos</option>\n            {Object.entries(BARRIOS).map(([id, nombre]) => (\n              <option key={id} value={id}>\n                {nombre}\n              </option>\n            ))}\n          </select>\n        </label>\n        <ul>\n          {visibles.map((piso) => (\n            <li key={piso.id}>\n              <Link to={{ pathname: String(piso.id), search: searchParams.toString() }}>{piso.titulo}</Link>\n            </li>\n          ))}\n        </ul>\n      </section>\n      <Outlet />\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const [searchParams, setSearchParams] = useSearchParams()",
      "nota": "Se parece a useState, pero el valor sale de la URL: searchParams es un URLSearchParams con lo que va detrás de ?."
    },
    {
      "fragmento": "const barrio = searchParams.get('barrio') ?? ''",
      "nota": "get devuelve el texto o null si no está. Como con los parámetros, todo son cadenas: un número de habitaciones hay que convertirlo."
    },
    {
      "fragmento": "setSearchParams((anteriores) => {",
      "nota": "Con una función, partes de los parámetros que ya hay y cambias solo el tuyo. Con un objeto, setSearchParams({ barrio }), sustituyes todos: si la URL llevaba ?habitaciones=2, desaparece (comprobado)."
    },
    {
      "fragmento": "else anteriores.delete('barrio')",
      "nota": "Elegir «Todos» quita el parámetro en vez de dejar ?barrio= vacío."
    },
    {
      "fragmento": "<Link to={{ pathname: String(piso.id), search: searchParams.toString() }}>",
      "nota": "Para que el filtro siga puesto al abrir un piso. Con to={String(piso.id)} a secas, la URL pasa a ser /pisos/14 y la lista vuelve a «Todos» (comprobado)."
    }
  ]
}
```

Lo que tienes que saber de `setSearchParams`, todo comprobado en React Router 8.5.0 o en su documentación:

- **Cada llamada es una navegación**: cambia la URL y añade una entrada al historial. Por eso Atrás deshace el último filtro.
- **Con `{ replace: true }` sustituye la entrada en vez de añadir otra**: `setSearchParams(nuevos, { replace: true })`. Úsalo en un buscador que filtra mientras escribes; si no, cada letra sería una entrada del historial y Atrás iría deshaciendo palabras letra a letra.
- **La forma de función no se encola** como la de `useState` (lección 19). La documentación avisa de que varias llamadas seguidas en el mismo manejador no se suman: haz todos los cambios en una sola.
- **Los valores por defecto, con `??`**: `searchParams.get('orden') ?? 'precio'`. Si la URL no dice nada, usas el tuyo y la dirección queda limpia. `useSearchParams` también acepta un valor inicial, pero su documentación avisa de que no cambia la URL, y en el código de la 8.5.0 deja de aplicarse en cuanto llamas a `setSearchParams`: más fácil con `??`.

## Navegar desde el código: `useNavigate`

Casi siempre se navega con un enlace, porque el usuario pulsa algo. Pero a veces no hay nada que pulsar: después de enviar un formulario, al cerrar la sesión por inactividad, cuando se acaba el tiempo de un examen. Para eso está `useNavigate`, y la documentación insiste en reservarlo para esos casos: **para lo demás, `<Link>`**, que da gratis el teclado, «abrir en otra pestaña» y el menú contextual de un enlace.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useNavigate } from 'react-router'\nimport { iniciarSesion } from '../api.js'\n\nexport default function Entrar() {\n  const navigate = useNavigate()\n\n  async function manejarEnvio(e) {\n    e.preventDefault()\n    await iniciarSesion(new FormData(e.currentTarget))\n    navigate('/mis-pisos', { replace: true })\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Correo <input name=\"correo\" type=\"email\" required />\n      </label>\n      <label>\n        Contraseña <input name=\"clave\" type=\"password\" required />\n      </label>\n      <button>Entrar</button>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const navigate = useNavigate()",
      "nota": "Devuelve una función para navegar. En el router a mano es la función navegar del contexto del navegador."
    },
    {
      "fragmento": "await iniciarSesion(new FormData(e.currentTarget))",
      "nota": "Primero, lo que tenga que pasar. Solo si sale bien se cambia de página."
    },
    {
      "fragmento": "navigate('/mis-pisos', { replace: true })",
      "nota": "replace sustituye la entrada actual del historial, como una redirección del servidor. Así, Atrás no vuelve al formulario de entrar."
    }
  ]
}
```

`navigate` acepta lo mismo que `to` en un `<Link>`: una ruta (`'/pisos/21'`), una ruta con búsqueda (`'/pisos?barrio=actur'`) o un objeto `{ pathname, search }`. Y también un número: `navigate(-1)` es el botón Atrás. **Con cuidado**: la documentación avisa de que, si alguien abre tu página directamente, puede que no haya ninguna entrada a la que volver, o que lleve a otra web.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Historial: / → /entrar\n// En /entrar, el formulario de antes hace al terminar:\nnavigate('/mis-pisos', { replace: true })\n\n// Ya en /mis-pisos, pulsas Atrás. ¿Dónde acabas?",
  "opciones": [
    "En /entrar, con el formulario vacío",
    "En /, la página donde estabas antes de entrar",
    "Fuera de la web: replace borra el historial",
    "En /mis-pisos: Atrás no hace nada"
  ],
  "correcta": 1,
  "explicacion": "replace cambia la entrada de /entrar por la de /mis-pisos, así que el historial queda / → /mis-pisos y Atrás te lleva a /. Sin replace quedaría / → /entrar → /mis-pisos y volverías al formulario. Comprobado en React Router 8.5.0 con los dos casos."
}
```

## ¿En la URL o en el estado?

La lección 75 lo resumió en una pregunta: **¿tiene que sobrevivir a una recarga, compartirse en un enlace o deshacerse con Atrás?** Si la respuesta es sí, a la URL. En la práctica:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "A la URL: lo que identifica lo que ves",
      "texto": "La sección, el elemento abierto (/pisos/21), los filtros, el orden de la lista, la página de resultados, la pestaña de una ficha si tiene sentido enlazarla. Si alguien te manda el enlace, tiene que ver lo mismo que tú."
    },
    {
      "titulo": "Al estado: lo pasajero",
      "texto": "Un menú desplegado, el elemento sobre el que está el ratón, lo que llevas escrito en un formulario sin enviar, si se ve el plano. Nadie lo compartiría, y ponerlo en la URL llenaría el historial de entradas."
    },
    {
      "titulo": "Nunca a la URL: lo privado",
      "texto": "Una URL se copia, se comparte, se guarda en el historial y en los marcadores, y la ven los servidores cuando se pide la página. Nada de contraseñas, tokens ni datos personales."
    },
    {
      "titulo": "Si está en la URL, léelo de ahí",
      "texto": "La URL es el dueño: el componente la lee en cada render, como una prop. Copiarla en un useState crea un segundo dueño que se queda atrás en cuanto alguien pulsa Atrás (lo ves en los errores típicos). Es el error de copiar las props en el estado, de la lección 24."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// En la página de pisos de la inmobiliaria hay:\n// a) el piso que se está viendo\n// b) la página de resultados: la 3 de 5\n// c) el mensaje que llevas escrito en «Pregunta al anunciante»\n// d) el orden de la lista: «más baratos primero»\n\n// ¿Cuál NO pondrías en la URL?",
  "opciones": [
    "a",
    "b",
    "c",
    "d"
  ],
  "correcta": 2,
  "explicacion": "El mensaje a medio escribir cambia con cada tecla, nadie lo compartiría y es tuyo: estado del formulario. El piso es la propia ruta (/pisos/21), y la página y el orden van en la búsqueda (?pagina=3&orden=precio): es lo que alguien esperaría ver al abrir tu enlace y lo que Atrás debería deshacer."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Catálogos con filtros",
      "texto": "Tiendas, portales de pisos, ofertas de empleo, horarios: la búsqueda en la URL permite guardar una búsqueda, mandarla por mensaje y volver a ella con Atrás."
    },
    {
      "titulo": "Lista y detalle a la vez",
      "texto": "Un correo (/bandeja/1234), un gestor de tareas o la inmobiliaria: la lista en la ruta madre, el detalle en su Outlet, y la lista no se vuelve a montar al cambiar de elemento."
    },
    {
      "titulo": "Paneles con secciones",
      "texto": "Una maquetación con su menú lateral y rutas hijas para cada sección (/ajustes/perfil, /ajustes/facturas). Cada sección tiene su dirección y la maquetación se pinta una sola vez."
    },
    {
      "titulo": "Después de una acción",
      "texto": "Al guardar, al entrar, al borrar: useNavigate, casi siempre con replace si no tiene sentido volver al formulario con Atrás."
    }
  ]
}
```

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Los parámetros de la ruta y los de la búsqueda son lo mismo",
      "realidad": "Los de la ruta (/pisos/21) forman parte del path y deciden qué ruta encaja: identifican qué ves. Los de la búsqueda (?barrio=actur) no cuentan para encajar rutas y cualquier página puede llevarlos: dicen cómo lo ves."
    },
    {
      "mito": "useSearchParams es un useState guardado en la URL",
      "realidad": "Se le parece, pero cada cambio es una navegación con su entrada en el historial, los valores son siempre texto y su forma de función no se encola como la de useState."
    },
    {
      "mito": "Una ruta anidada necesita una URL anidada",
      "realidad": "Una ruta sin path, como la de la maquetación, anida componentes sin añadir nada a la URL. Y al revés: un path largo puede ir en una sola ruta sin anidar."
    },
    {
      "mito": "Al cambiar de parámetro, la página se monta de nuevo",
      "realidad": "Pasar de /pisos/14 a /pisos/15 pinta el mismo componente en el mismo sitio con otro valor: el estado se conserva. Si no lo quieres, una key con el id."
    }
  ]
}
```

## Errores típicos

**Copiar en un estado lo que ya está en la URL.** Parece inofensivo: el valor inicial sale de la URL y, al cambiar, se actualizan los dos. Hasta que alguien pulsa Atrás:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos dueños para el mismo filtro",
  "consigna": "Elige «Delicias» y después «Actur». Pulsa Atrás: la barra vuelve a ?barrio=delicias, pero el desplegable y la lista se quedan en Actur. Pulsa Recargar y vuelven a estar de acuerdo, porque el useState se crea otra vez a partir de la URL. Arréglalo: borra el useState, calcula barrio a partir de busqueda y deja en manejarBarrio solo setBusqueda.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Navegador from './Navegador'\nimport { Enlace, Rutas, useBusqueda } from './router'\nimport { BARRIOS, PISOS } from './datos'\nimport './estilos.css'\n\nfunction ListaPisos() {\n  const [busqueda, setBusqueda] = useBusqueda()\n  // El error: copiar en un estado lo que ya está en la URL\n  const [barrio, setBarrio] = useState(busqueda.get('barrio') ?? '')\n\n  const visibles = barrio === '' ? PISOS : PISOS.filter((piso) => piso.barrio === barrio)\n\n  function manejarBarrio(e) {\n    setBarrio(e.target.value)\n    setBusqueda(e.target.value ? { barrio: e.target.value } : {})\n  }\n\n  return (\n    <>\n      <h1>Pisos en alquiler</h1>\n      <label>\n        Barrio{' '}\n        <select value={barrio} onChange={manejarBarrio}>\n          <option value=\"\">Todos</option>\n          {Object.entries(BARRIOS).map(([id, nombre]) => (\n            <option key={id} value={id}>\n              {nombre}\n            </option>\n          ))}\n        </select>\n      </label>\n      <ul>\n        {visibles.map((piso) => (\n          <li key={piso.id}>\n            {piso.titulo} · {BARRIOS[piso.barrio]} · {piso.precio} €/mes\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <Navegador inicio=\"/pisos\">\n      <nav aria-label=\"Principal\">\n        <Enlace a=\"/\">Inicio</Enlace>\n        <Enlace a=\"/pisos\">Pisos</Enlace>\n      </nav>\n      <main>\n        <Rutas rutas={{ '/pisos': <ListaPisos />, '*': <h1>Inmobiliaria El Rellano</h1> }} />\n      </main>\n    </Navegador>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { createContext, useContext } from 'react'\nimport { useNavegador } from './Navegador'\n\nconst ParametrosContext = createContext({})\nParametrosContext.displayName = 'Parametros'\n\n// '/pisos/:pisoId' encaja con '/pisos/14' y da { pisoId: '14' }; si no encaja, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\n// Pinta la primera ruta que encaja y deja sus parámetros en un contexto\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  const camino = url.split('?')[0]\n  for (const [patron, elemento] of Object.entries(rutas)) {\n    const parametros = patron === '*' ? {} : encajar(patron, camino)\n    if (parametros) return <ParametrosContext value={parametros}>{elemento}</ParametrosContext>\n  }\n  return null\n}\n\n// Como useParams: los parámetros de la ruta que se está pintando\nexport function useParametros() {\n  return useContext(ParametrosContext)\n}\n\n// Como useSearchParams: lo que va detrás de ? y una función para cambiarlo\nexport function useBusqueda() {\n  const { url, navegar } = useNavegador()\n  const [camino, consulta = ''] = url.split('?')\n\n  function setBusqueda(valores) {\n    const texto = new URLSearchParams(valores).toString()\n    navegar(texto ? camino + '?' + texto : camino)\n  }\n\n  return [new URLSearchParams(consulta), setBusqueda]\n}\n\n// Como NavLink: activo en su ruta y en las que cuelgan de ella\nexport function Enlace({ a, children }) {\n  const { url, navegar } = useNavegador()\n  const camino = url.split('?')[0]\n  const destino = a.split('?')[0]\n  const activo = camino === destino || (destino !== '/' && camino.startsWith(destino + '/'))\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={activo ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// Un navegador de mentira: la URL y el historial viven aquí, fuera de la app.\n// La vista previa no deja cargar /juegos de verdad, así que se simula.\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const BARRIOS = {\n  delicias: 'Delicias',\n  actur: 'Actur',\n  casco: 'Casco Histórico',\n}\n\nexport const PISOS = [\n  { id: 14, titulo: 'Luminoso junto al parque', barrio: 'delicias', habitaciones: 2, metros: 68, precio: 750 },\n  { id: 15, titulo: 'Ático con terraza', barrio: 'delicias', habitaciones: 3, metros: 85, precio: 890 },\n  { id: 21, titulo: 'Exterior con ascensor', barrio: 'actur', habitaciones: 2, metros: 74, precio: 820 },\n  { id: 32, titulo: 'Estudio reformado', barrio: 'casco', habitaciones: 1, metros: 45, precio: 640 },\n  { id: 40, titulo: 'Familiar con garaje', barrio: 'actur', habitaciones: 4, metros: 110, precio: 1050 },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La inmobiliaria */\nnav[aria-label='Principal'] {\n  display: flex;\n  gap: 1rem;\n  padding: 0.5rem 0;\n  border-bottom: 1px solid #d6d3d1;\n}\n\na {\n  color: #1d4ed8;\n}\n\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.vecinos a + a {\n  margin-left: 0.75rem;\n}\n\n.plano {\n  padding: 0.5rem;\n  border: 2px dashed #a8a29e;\n}\n\nbutton,\nselect {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El valor inicial de `useState` solo se usa una vez, al montar (lección 16). Después, la URL y el estado son dos copias que nadie mantiene de acuerdo: Atrás cambia la URL, y el estado no se entera.

**Comparar un parámetro con un número.**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// La URL es /pisos/14 y la ruta, path=\":pisoId\"\nconst { pisoId } = useParams()\nconst piso = PISOS.find((p) => p.id === pisoId)\n\n// PISOS tiene un piso con id: 14. ¿Qué vale piso?",
  "opciones": [
    "El piso 14",
    "undefined",
    "Un error: useParams no devuelve pisoId",
    "El primer piso de la lista"
  ],
  "correcta": 1,
  "explicacion": "pisoId vale '14', una cadena, y p.id vale 14, un número: con === nunca son iguales, así que find no encuentra nada y devuelve undefined. La ficha diría que el piso no existe. Se arregla con Number(pisoId), o con ids de texto en los datos."
}
```

**Perder los filtros al abrir un elemento.** Con `<Link to={String(piso.id)}>` dentro de la lista filtrada, la URL pasa de `/pisos?barrio=actur` a `/pisos/21` y la lista vuelve a «Todos». Si los filtros tienen que seguir puestos, pásalos en el enlace: `to={{ pathname: String(piso.id), search: searchParams.toString() }}`.

**Pisar los demás parámetros.** `setSearchParams({ barrio: 'actur' })` deja la búsqueda en `?barrio=actur` a secas: si había `&habitaciones=2`, se pierde. Con varios filtros, usa la forma de función y cambia solo el tuyo con `set` o `delete`.

**Una ruta hija que no aparece.** Mira si su madre tiene `<Outlet />`: si falta, no hay aviso de ningún tipo. Y escribe las hijas sin barra delante: una ruta absoluta solo vale si empieza por la de su madre; si no, React Router se para con el error de rutas absolutas de más arriba.

**Un estado que pasa de un elemento al siguiente.** Si el plano, un formulario o una galería «se quedan» al cambiar de `/pisos/14` a `/pisos/15`, es la misma posición en el árbol: dale una `key` con el id.

## Ejercicios

Dos ejercicios con el router a mano ampliado: primero los parámetros, después la búsqueda. Los dos usan el navegador de mentira, con historial en memoria, por lo mismo que en la lección 76.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha de cada piso",
  "consigna": "En App.jsx, añade la ruta /pisos/:pisoId, que pinte <FichaPiso />. Nuestro router se queda con la primera que encaja, así que ponla antes de la de *. En FichaPiso.jsx, lee pisoId con useParametros() y busca el piso en PISOS (ojo: pisoId es texto). Si no existe, un título «Este piso ya no está disponible» y un Enlace «Ver los pisos disponibles» a /pisos; si existe, <DetallePiso piso={piso} />. Prueba los marcadores.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Navegador from './Navegador'\nimport { Enlace, Rutas } from './router'\nimport { BARRIOS, PISOS } from './datos'\nimport FichaPiso from './FichaPiso'\nimport './estilos.css'\n\nfunction ListaPisos() {\n  return (\n    <>\n      <h1>Pisos en alquiler</h1>\n      <ul>\n        {PISOS.map((piso) => (\n          <li key={piso.id}>\n            <Enlace a={'/pisos/' + piso.id}>{piso.titulo}</Enlace> · {BARRIOS[piso.barrio]} · {piso.precio} €/mes\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <Navegador inicio=\"/pisos\" marcadores={['/pisos/32', '/pisos/99', '/pisos/32/fotos']}>\n      <nav aria-label=\"Principal\">\n        <Enlace a=\"/\">Inicio</Enlace>\n        <Enlace a=\"/pisos\">Pisos</Enlace>\n      </nav>\n      <main>\n        <Rutas\n          rutas={{\n            '/': <h1>Inmobiliaria El Rellano</h1>,\n            '/pisos': <ListaPisos />,\n            // 1. La ficha de cada piso (/pisos/14, /pisos/21...) pinta <FichaPiso />\n            '*': <h1>Página no encontrada</h1>,\n          }}\n        />\n      </main>\n    </Navegador>\n  )\n}\n"
    },
    {
      "nombre": "FichaPiso.jsx",
      "codigo": "import { Enlace, useParametros } from './router'\nimport { BARRIOS, PISOS } from './datos'\n\nfunction DetallePiso({ piso }) {\n  return (\n    <article>\n      <h1>{piso.titulo}</h1>\n      <p>\n        {BARRIOS[piso.barrio]} · {piso.habitaciones} habitaciones · {piso.metros} m² · {piso.precio} €/mes\n      </p>\n      <Enlace a=\"/pisos\">Volver al listado</Enlace>\n    </article>\n  )\n}\n\nexport default function FichaPiso() {\n  // 2. Lee pisoId con useParametros() y busca ese piso en PISOS\n  // 3. Si no está: un título «Este piso ya no está disponible»\n  //    y un Enlace «Ver los pisos disponibles» a /pisos\n  // 4. Si está: <DetallePiso piso={piso} />\n  return <h1>Ficha de un piso</h1>\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { createContext, useContext } from 'react'\nimport { useNavegador } from './Navegador'\n\nconst ParametrosContext = createContext({})\nParametrosContext.displayName = 'Parametros'\n\n// '/pisos/:pisoId' encaja con '/pisos/14' y da { pisoId: '14' }; si no encaja, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\n// Pinta la primera ruta que encaja y deja sus parámetros en un contexto\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  const camino = url.split('?')[0]\n  for (const [patron, elemento] of Object.entries(rutas)) {\n    const parametros = patron === '*' ? {} : encajar(patron, camino)\n    if (parametros) return <ParametrosContext value={parametros}>{elemento}</ParametrosContext>\n  }\n  return null\n}\n\n// Como useParams: los parámetros de la ruta que se está pintando\nexport function useParametros() {\n  return useContext(ParametrosContext)\n}\n\n// Como useSearchParams: lo que va detrás de ? y una función para cambiarlo\nexport function useBusqueda() {\n  const { url, navegar } = useNavegador()\n  const [camino, consulta = ''] = url.split('?')\n\n  function setBusqueda(valores) {\n    const texto = new URLSearchParams(valores).toString()\n    navegar(texto ? camino + '?' + texto : camino)\n  }\n\n  return [new URLSearchParams(consulta), setBusqueda]\n}\n\n// Como NavLink: activo en su ruta y en las que cuelgan de ella\nexport function Enlace({ a, children }) {\n  const { url, navegar } = useNavegador()\n  const camino = url.split('?')[0]\n  const destino = a.split('?')[0]\n  const activo = camino === destino || (destino !== '/' && camino.startsWith(destino + '/'))\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={activo ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// Un navegador de mentira: la URL y el historial viven aquí, fuera de la app.\n// La vista previa no deja cargar /juegos de verdad, así que se simula.\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const BARRIOS = {\n  delicias: 'Delicias',\n  actur: 'Actur',\n  casco: 'Casco Histórico',\n}\n\nexport const PISOS = [\n  { id: 14, titulo: 'Luminoso junto al parque', barrio: 'delicias', habitaciones: 2, metros: 68, precio: 750 },\n  { id: 15, titulo: 'Ático con terraza', barrio: 'delicias', habitaciones: 3, metros: 85, precio: 890 },\n  { id: 21, titulo: 'Exterior con ascensor', barrio: 'actur', habitaciones: 2, metros: 74, precio: 820 },\n  { id: 32, titulo: 'Estudio reformado', barrio: 'casco', habitaciones: 1, metros: 45, precio: 640 },\n  { id: 40, titulo: 'Familiar con garaje', barrio: 'actur', habitaciones: 4, metros: 110, precio: 1050 },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La inmobiliaria */\nnav[aria-label='Principal'] {\n  display: flex;\n  gap: 1rem;\n  padding: 0.5rem 0;\n  border-bottom: 1px solid #d6d3d1;\n}\n\na {\n  color: #1d4ed8;\n}\n\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.vecinos a + a {\n  margin-left: 0.75rem;\n}\n\n.plano {\n  padding: 0.5rem;\n  border: 2px dashed #a8a29e;\n}\n\nbutton,\nselect {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar un piso de la lista se abre su ficha",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Ático con terraza"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Ático con terraza"
      }
    },
    {
      "descripcion": "Cada piso abre su propia ficha, no siempre la misma",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Exterior con ascensor"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Exterior con ascensor"
      }
    },
    {
      "descripcion": "Abrir /pisos/32 desde los marcadores muestra la ficha de ese piso",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/pisos/32"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Estudio reformado"
      }
    },
    {
      "descripcion": "Desde la ficha, «Volver al listado» lleva a la lista",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Ático con terraza"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Volver al listado"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Pisos en alquiler"
      }
    },
    {
      "descripcion": "Un piso que no existe dice «Este piso ya no está disponible»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/pisos/99"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Este piso ya no está disponible"
      }
    },
    {
      "descripcion": "Desde un piso que no existe se vuelve a los pisos disponibles",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/pisos/99"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Ver los pisos disponibles"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Pisos en alquiler"
      }
    },
    {
      "descripcion": "/pisos/32/fotos no es la ficha de ningún piso: sigue dando «Página no encontrada»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/pisos/32/fotos"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Página no encontrada"
      }
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El filtro, a la URL",
  "consigna": "En ListaPisos.jsx el barrio vive en un useState. Pásalo a la URL: lee el barrio con useBusqueda() (busqueda.get('barrio'), o '' si no hay) y, al cambiar el desplegable, llama a setBusqueda({ barrio }) o, con «Todos», a setBusqueda({}). Después prueba Recargar, Atrás, el marcador /pisos?barrio=actur y a abrir un piso y volver con Atrás.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Navegador from './Navegador'\nimport { Enlace, Rutas, useParametros } from './router'\nimport { BARRIOS, PISOS } from './datos'\nimport ListaPisos from './ListaPisos'\nimport './estilos.css'\n\nfunction FichaPiso() {\n  const { pisoId } = useParametros()\n  const piso = PISOS.find((p) => p.id === Number(pisoId))\n  if (!piso) return <h1>Este piso ya no está disponible</h1>\n\n  return (\n    <article>\n      <h1>{piso.titulo}</h1>\n      <p>\n        {BARRIOS[piso.barrio]} · {piso.habitaciones} habitaciones · {piso.precio} €/mes\n      </p>\n    </article>\n  )\n}\n\nexport default function App() {\n  return (\n    <Navegador inicio=\"/pisos\" marcadores={['/pisos?barrio=actur', '/pisos?barrio=casco']}>\n      <nav aria-label=\"Principal\">\n        <Enlace a=\"/\">Inicio</Enlace>\n        <Enlace a=\"/pisos\">Pisos</Enlace>\n      </nav>\n      <main>\n        <Rutas\n          rutas={{\n            '/': <h1>Inmobiliaria El Rellano</h1>,\n            '/pisos': <ListaPisos />,\n            '/pisos/:pisoId': <FichaPiso />,\n            '*': <h1>Página no encontrada</h1>,\n          }}\n        />\n      </main>\n    </Navegador>\n  )\n}\n"
    },
    {
      "nombre": "ListaPisos.jsx",
      "codigo": "import { useState } from 'react'\nimport { Enlace, useBusqueda } from './router'\nimport { BARRIOS, PISOS } from './datos'\n\nexport default function ListaPisos() {\n  // El barrio vive en un estado: se pierde al recargar, no viaja en el enlace\n  // y Atrás no lo deshace. Pásalo a la URL con useBusqueda(): ?barrio=delicias\n  const [barrio, setBarrio] = useState('')\n\n  function manejarBarrio(e) {\n    setBarrio(e.target.value)\n  }\n\n  const visibles = barrio === '' ? PISOS : PISOS.filter((piso) => piso.barrio === barrio)\n\n  return (\n    <>\n      <h1>Pisos en alquiler</h1>\n      <label>\n        Barrio{' '}\n        <select value={barrio} onChange={manejarBarrio}>\n          <option value=\"\">Todos</option>\n          {Object.entries(BARRIOS).map(([id, nombre]) => (\n            <option key={id} value={id}>\n              {nombre}\n            </option>\n          ))}\n        </select>\n      </label>\n      <p role=\"status\">{visibles.length === 1 ? '1 piso' : `${visibles.length} pisos`}</p>\n      <ul>\n        {visibles.map((piso) => (\n          <li key={piso.id}>\n            <Enlace a={'/pisos/' + piso.id}>{piso.titulo}</Enlace> · {BARRIOS[piso.barrio]} · {piso.precio} €/mes\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { createContext, useContext } from 'react'\nimport { useNavegador } from './Navegador'\n\nconst ParametrosContext = createContext({})\nParametrosContext.displayName = 'Parametros'\n\n// '/pisos/:pisoId' encaja con '/pisos/14' y da { pisoId: '14' }; si no encaja, null\nfunction encajar(patron, camino) {\n  const partes = patron.split('/').filter(Boolean)\n  const trozos = camino.split('/').filter(Boolean)\n  if (partes.length !== trozos.length) return null\n  const parametros = {}\n  for (let i = 0; i < partes.length; i++) {\n    if (partes[i].startsWith(':')) parametros[partes[i].slice(1)] = trozos[i]\n    else if (partes[i] !== trozos[i]) return null\n  }\n  return parametros\n}\n\n// Pinta la primera ruta que encaja y deja sus parámetros en un contexto\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  const camino = url.split('?')[0]\n  for (const [patron, elemento] of Object.entries(rutas)) {\n    const parametros = patron === '*' ? {} : encajar(patron, camino)\n    if (parametros) return <ParametrosContext value={parametros}>{elemento}</ParametrosContext>\n  }\n  return null\n}\n\n// Como useParams: los parámetros de la ruta que se está pintando\nexport function useParametros() {\n  return useContext(ParametrosContext)\n}\n\n// Como useSearchParams: lo que va detrás de ? y una función para cambiarlo\nexport function useBusqueda() {\n  const { url, navegar } = useNavegador()\n  const [camino, consulta = ''] = url.split('?')\n\n  function setBusqueda(valores) {\n    const texto = new URLSearchParams(valores).toString()\n    navegar(texto ? camino + '?' + texto : camino)\n  }\n\n  return [new URLSearchParams(consulta), setBusqueda]\n}\n\n// Como NavLink: activo en su ruta y en las que cuelgan de ella\nexport function Enlace({ a, children }) {\n  const { url, navegar } = useNavegador()\n  const camino = url.split('?')[0]\n  const destino = a.split('?')[0]\n  const activo = camino === destino || (destino !== '/' && camino.startsWith(destino + '/'))\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={activo ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// Un navegador de mentira: la URL y el historial viven aquí, fuera de la app.\n// La vista previa no deja cargar /juegos de verdad, así que se simula.\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const BARRIOS = {\n  delicias: 'Delicias',\n  actur: 'Actur',\n  casco: 'Casco Histórico',\n}\n\nexport const PISOS = [\n  { id: 14, titulo: 'Luminoso junto al parque', barrio: 'delicias', habitaciones: 2, metros: 68, precio: 750 },\n  { id: 15, titulo: 'Ático con terraza', barrio: 'delicias', habitaciones: 3, metros: 85, precio: 890 },\n  { id: 21, titulo: 'Exterior con ascensor', barrio: 'actur', habitaciones: 2, metros: 74, precio: 820 },\n  { id: 32, titulo: 'Estudio reformado', barrio: 'casco', habitaciones: 1, metros: 45, precio: 640 },\n  { id: 40, titulo: 'Familiar con garaje', barrio: 'actur', habitaciones: 4, metros: 110, precio: 1050 },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La inmobiliaria */\nnav[aria-label='Principal'] {\n  display: flex;\n  gap: 1rem;\n  padding: 0.5rem 0;\n  border-bottom: 1px solid #d6d3d1;\n}\n\na {\n  color: #1d4ed8;\n}\n\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\nli {\n  margin-bottom: 0.3rem;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n.filtros label {\n  display: grid;\n  gap: 0.2rem;\n}\n\n.vecinos a + a {\n  margin-left: 0.75rem;\n}\n\n.plano {\n  padding: 0.5rem;\n  border: 2px dashed #a8a29e;\n}\n\nbutton,\nselect {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "ListaPisos.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Elegir «Delicias» deja solo los pisos de Delicias",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Delicias"
          }
        }
      ],
      "espera": {
        "texto": "2 pisos"
      }
    },
    {
      "descripcion": "El barrio elegido aparece en la dirección: /pisos?barrio=delicias",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Delicias"
          }
        }
      ],
      "espera": {
        "etiqueta": "Dirección",
        "valor": "/pisos?barrio=delicias"
      }
    },
    {
      "descripcion": "Al recargar, el filtro sigue puesto",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Delicias"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Recargar"
          }
        }
      ],
      "espera": {
        "etiqueta": "Barrio",
        "valor": "delicias"
      }
    },
    {
      "descripcion": "Un enlace compartido, /pisos?barrio=actur, abre la lista ya filtrada",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/pisos?barrio=actur"
          }
        }
      ],
      "espera": {
        "etiqueta": "Barrio",
        "valor": "actur"
      }
    },
    {
      "descripcion": "«Atrás» deshace el último cambio de barrio",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Delicias"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Actur"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Atrás"
          }
        }
      ],
      "espera": {
        "etiqueta": "Barrio",
        "valor": "delicias"
      }
    },
    {
      "descripcion": "Volver con «Atrás» desde la ficha de un piso conserva el filtro",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Actur"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Exterior con ascensor"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Atrás"
          }
        }
      ],
      "espera": {
        "etiqueta": "Barrio",
        "valor": "actur"
      }
    },
    {
      "descripcion": "Elegir «Todos» quita el filtro de la dirección",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Delicias"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Barrio",
            "opcion": "Todos"
          }
        }
      ],
      "espera": {
        "etiqueta": "Dirección",
        "valor": "/pisos"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática), en un proyecto de Vite con React Router:

1. Monta la inmobiliaria con las rutas anidadas de la lección: `Maquetacion` como ruta sin `path`, `Pisos` con la lista y un `<Outlet />`, `ElegirPiso` como índice y `FichaPiso` con `useParams`. Comprueba que el `NavLink` «Pisos» sigue marcado en cada ficha.
2. Añade un segundo filtro, «Habitaciones», también en la URL, con la forma de función de `setSearchParams` para no pisar el barrio. Haz que los enlaces de la lista conserven los filtros y añade un enlace «Quitar filtros» a `/pisos`.
3. Añade un buscador por texto que filtre mientras escribes. Pruébalo primero sin `replace` y pulsa Atrás unas cuantas veces; después con `{ replace: true }`.
4. Pon un formulario «Pedir visita» en la ficha que, al enviarse, navegue con `useNavigate` a `/pisos/:pisoId/visita-pedida`, una ruta hija nueva. Decide si lleva `replace` y por qué.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Preserving and Resetting State",
      "descripcion": "Por qué el mismo componente en el mismo sitio conserva su estado y cómo empezar de cero con una key: lo que pasa al ir de /pisos/14 a /pisos/15.",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Routing",
      "descripcion": "Rutas anidadas, de maquetación e índice, prefijos, segmentos dinámicos, opcionales y comodines, en el modo declarativo.",
      "url": "https://reactrouter.com/start/declarative/routing",
      "etiqueta": "React Router"
    },
    {
      "titulo": "URL Values",
      "descripcion": "Los tres valores que da la URL: parámetros con useParams, búsqueda con useSearchParams y el objeto location con useLocation.",
      "url": "https://reactrouter.com/start/declarative/url-values",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useSearchParams",
      "descripcion": "La referencia: las formas de llamar a setSearchParams, el aviso sobre la forma de función y el valor por defecto que no cambia la URL.",
      "url": "https://reactrouter.com/api/hooks/useSearchParams",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useNavigate",
      "descripcion": "Navegar desde el código: rutas, objetos, replace, state y el aviso sobre navigate(-1).",
      "url": "https://reactrouter.com/api/hooks/useNavigate",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Outlet",
      "descripcion": "El hueco donde una ruta madre pinta a su hija, y cómo pasarle datos con context.",
      "url": "https://reactrouter.com/api/components/Outlet",
      "etiqueta": "React Router"
    },
    {
      "titulo": "URLSearchParams",
      "descripcion": "El objeto que devuelven useSearchParams y el useBusqueda del router a mano: get, getAll, set, delete y toString.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams",
      "etiqueta": "MDN"
    }
  ]
}
```
