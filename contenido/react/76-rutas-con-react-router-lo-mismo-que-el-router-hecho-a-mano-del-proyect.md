# Rutas con React Router (lo mismo que el router hecho a mano del proyecto `78` de JS)

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `rutas-con-react-router-lo-mismo-que-el-router-hecho-a-mano-del-proyecto-78-de-js` (autogenerado del título)
- **Orden:** 760
- **Fuentes:** [Picking a Mode](https://reactrouter.com/start/modes) + [Declarative: Installation](https://reactrouter.com/start/declarative/installation) + [Navigating](https://reactrouter.com/start/declarative/navigating) — ver `contenido/react/TEMARIO.md` #76

---

## Qué es y para qué sirve

La app de Vite de la lección 2 tiene un único `index.html`, y todo lo que ves sale de un `<div id="root">`. Si cambias de pantalla con un estado (`pantalla === 'catalogo'`), la página cambia, pero **la URL no se entera**. Cualquier usuario lo nota enseguida:

- No puede **compartir ni guardar** el enlace a una pantalla: el enlace lleva siempre a la portada.
- El botón **Atrás** no vuelve a la pantalla anterior: le saca de la aplicación.
- Al **recargar**, vuelve al principio.

Un **router** une cada pantalla con una dirección: `/juegos` pinta el catálogo, `/partidas` pinta las partidas. **Una aplicación de una sola página (SPA) puede tener muchas URL**: el navegador no recarga nunca, pero la dirección cambia de verdad, se puede compartir y Atrás funciona.

Ya lo hiciste a mano en el proyecto 78 de JavaScript, el recetario con router propio: `resolverRuta` elegía la página, `manejarClickInterno` interceptaba los clics, `navegarA` cambiaba la URL con `pushState` y un oyente de `popstate` hacía que funcionara Atrás. **React Router hace esas mismas cuatro cosas** con componentes y Hooks. Es la librería de rutas más descargada para React (unos 33 millones de descargas semanales en npm en octubre de 2026, frente a unos 12 millones de TanStack Router, la alternativa más conocida) y va por la versión **8.5.0**, publicada el 19 de octubre de 2026.

Esta lección tiene dos mitades: primero construyes un router a mano con React, que funciona aquí mismo, y después ves lo mismo con React Router en un proyecto de Vite. La lección 77 sigue con rutas anidadas, parámetros y filtros en la URL.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "React Router no se puede usar en la vista previa",
  "contenido": "Los bloques en vivo de esta web solo cargan React: nada de librerías de npm. Por eso el código de React Router aparece anotado y lo probarás en tu proyecto de Vite, mientras que lo que corre aquí es un router hecho a mano que hace lo mismo. Todo lo que la lección cuenta de React Router está comprobado con la versión 8.5.0 en un proyecto de Vite real."
}
```

## Las cuatro tareas de un router

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "1. Leer la URL y decidir qué se pinta",
      "texto": "La parte de la dirección que identifica la pantalla (/juegos) se compara con la lista de rutas. Si ninguna encaja, se pinta la página 404. En el recetario era resolverRuta."
    },
    {
      "titulo": "2. Cambiar la URL sin recargar",
      "texto": "history.pushState(estado, '', '/juegos') cambia la dirección y añade una entrada al historial, pero no pide nada al servidor ni lanza ningún evento. En el recetario era navegarA."
    },
    {
      "titulo": "3. Interceptar los clics en los enlaces",
      "texto": "Un <a href=\"/juegos\"> haría que el navegador cargara la página entera. El router escucha el clic, llama a preventDefault (lección 15) y cambia la URL él mismo. En el recetario era manejarClickInterno."
    },
    {
      "titulo": "4. Escuchar Atrás y Adelante",
      "texto": "Cuando el usuario se mueve por el historial, el navegador cambia la URL y lanza el evento popstate. El router lo escucha y pinta la pantalla que toca."
    }
  ]
}
```

En React hay una pieza más: **la ruta actual tiene que ser algo que React vigile**, para que al cambiar se vuelva a renderizar lo que depende de ella. Y como la necesitan componentes de toda la aplicación (cada enlace quiere saber si es el de la página actual), **se guarda en un contexto**. Te lo adelantó la lección 28: así lo hacen los routers.

## Un router a mano, en React

Este es un router completo en unas cincuenta líneas. Lee las notas y después **pruébalo**: pulsa los enlaces, mira cómo cambia la línea de la URL y pulsa el botón **Atrás de tu navegador**. La vista previa vuelve a la página anterior y la lección no se mueve. «Ofertas» lleva a una ruta que no existe.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un router de cincuenta líneas para la Ludoteca La Partida",
  "codigo": "import { createContext, useContext, useSyncExternalStore } from 'react'\n\n// Leer la URL. Aquí la ruta va detrás de la # (más abajo, el porqué)\nfunction leerRuta() {\n  return location.hash.slice(1) || '/'\n}\n\n// Avisar a React cada vez que la URL cambia\nfunction suscribirse(avisar) {\n  window.addEventListener('popstate', avisar)\n  window.addEventListener('navegacion', avisar)\n  return () => {\n    window.removeEventListener('popstate', avisar)\n    window.removeEventListener('navegacion', avisar)\n  }\n}\n\n// Cambiar la URL sin recargar la página\nfunction navegar(ruta) {\n  history.pushState(null, '', '#' + ruta)\n  window.dispatchEvent(new Event('navegacion'))\n}\n\nconst RutaContext = createContext('/')\nRutaContext.displayName = 'Ruta'\n\nfunction Router({ children }) {\n  const ruta = useSyncExternalStore(suscribirse, leerRuta)\n  return <RutaContext value={ruta}>{children}</RutaContext>\n}\n\n// Elegir qué se pinta según la ruta\nfunction Rutas({ rutas }) {\n  const ruta = useContext(RutaContext)\n  return rutas[ruta] ?? rutas['*']\n}\n\n// Un enlace que cambia de página sin recargarla\nfunction Enlace({ a, children }) {\n  const ruta = useContext(RutaContext)\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={'#' + a} aria-current={ruta === a ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n\nfunction DireccionActual() {\n  const url = useSyncExternalStore(suscribirse, () => location.href)\n  return <p className=\"direccion\">URL de la vista previa: {url}</p>\n}\n\nfunction Inicio() {\n  return <h1>Ludoteca La Partida</h1>\n}\n\nfunction Juegos() {\n  return <h1>Juegos de mesa</h1>\n}\n\nfunction Partidas() {\n  return <h1>Partidas abiertas</h1>\n}\n\nfunction NoEncontrada() {\n  return <h1>Página no encontrada</h1>\n}\n\nexport default function App() {\n  return (\n    <Router>\n      <nav aria-label=\"Principal\">\n        <Enlace a=\"/\">Inicio</Enlace>\n        <Enlace a=\"/juegos\">Juegos</Enlace>\n        <Enlace a=\"/partidas\">Partidas</Enlace>\n        <Enlace a=\"/ofertas\">Ofertas</Enlace>\n      </nav>\n      <DireccionActual />\n      <main>\n        <Rutas\n          rutas={{\n            '/': <Inicio />,\n            '/juegos': <Juegos />,\n            '/partidas': <Partidas />,\n            '*': <NoEncontrada />,\n          }}\n        />\n      </main>\n    </Router>\n  )\n}",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  padding-bottom: 0.5rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nnav a {\n  color: #1d4ed8;\n}\n\n/* La página actual: el enlace se ve distinto y el lector de pantalla lo dice */\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.direccion {\n  padding: 0.3rem 0.5rem;\n  border-radius: 6px;\n  background: #f5f5f4;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n  overflow-wrap: anywhere;\n}",
  "anotaciones": [
    {
      "fragmento": "return location.hash.slice(1) || '/'",
      "nota": "Tarea 1: leer la URL. En un proyecto de Vite leerías location.pathname (/juegos). Dentro de la vista previa la ruta va detrás de la almohadilla, #/juegos, por un motivo que verás en la sección siguiente."
    },
    {
      "fragmento": "window.addEventListener('popstate', avisar)",
      "nota": "Tarea 4: Atrás y Adelante. El navegador lanza popstate cuando cambias de entrada en el historial, y avisar le dice a React que vuelva a leer la ruta."
    },
    {
      "fragmento": "history.pushState(null, '', '#' + ruta)",
      "nota": "Tarea 2: cambiar la URL sin recargar. pushState no lanza ningún evento, así que el propio router avisa con uno inventado, navegacion, al que también está suscrito."
    },
    {
      "fragmento": "useSyncExternalStore(suscribirse, leerRuta)",
      "nota": "La URL es un valor del navegador que cambia por su cuenta: justo para lo que existe useSyncExternalStore (lección 46). React se suscribe, lee la ruta y vuelve a renderizar cuando cambia."
    },
    {
      "fragmento": "<RutaContext value={ruta}>{children}</RutaContext>",
      "nota": "La ruta actual, en un contexto: cualquier componente de dentro, por profundo que esté, puede leerla sin recibirla por props."
    },
    {
      "fragmento": "return rutas[ruta] ?? rutas['*']",
      "nota": "Tarea 1, segunda parte: elegir qué se pinta. Si la ruta no está en la lista, se pinta la de la clave *, la página no encontrada."
    },
    {
      "fragmento": "e.preventDefault()",
      "nota": "Tarea 3: el enlace es un <a> de verdad, con su href, pero el clic lo gestiona el router. Antes deja pasar el clic con Ctrl, Cmd, Mayúsculas o Alt, o con el botón central, para que abrir en otra pestaña siga funcionando."
    },
    {
      "fragmento": "aria-current={ruta === a ? 'page' : undefined}",
      "nota": "El enlace de la página actual lleva aria-current=\"page\": un lector de pantalla dice «página actual», y el CSS lo usa para resaltarlo. Lo mismo que hace NavLink."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": false
}
```

Fíjate en lo que **no** hay: ningún `querySelector`, ningún `innerHTML`. El recetario tenía que pintar cada página a mano; aquí cada página es un componente y el router solo decide cuál devolver. React se encarga del resto.

## Por qué la ruta va detrás de una almohadilla

En tu proyecto de Vite, el router haría `history.pushState(null, '', '/juegos')` y leería `location.pathname`. En la vista previa no se puede: es un `<iframe>` cuyo documento tiene la dirección `about:srcdoc` (su `location.pathname` vale `"srcdoc"`), y el navegador no le deja cambiar la ruta; lo que sí puede cambiar es lo que va detrás de la almohadilla, `#`. Si lo intentas con una ruta normal, Chrome responde:

```text
SecurityError: Failed to execute 'pushState' on 'History': A history state object with URL '' cannot be created in a document with origin 'null' and URL 'about:srcdoc'.
```

Es decir: en un documento con la dirección `about:srcdoc` y un origen opaco (`null`), no se puede crear una entrada de historial con esa URL. WebKit, el motor de Safari, lo dice con otras palabras («Blocked attempt to use history.pushState()… URL is invalid»). Con `#/juegos`, en cambio, `pushState` funciona igual que con `/juegos`: cambia la dirección, añade una entrada al historial y no recarga nada. Comprobado con los motores de Chrome y de Safari.

Es exactamente lo que hace el **`HashRouter`** de React Router, que guarda la ruta en la almohadilla. Tiene una ventaja y un inconveniente: lo que va detrás de `#` **nunca se envía al servidor**, así que no hace falta configurarlo (lo verás al final de la lección); a cambio, las direcciones quedan como `tusitio.es/#/juegos`. React Router trae tres formas de guardar la ubicación:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde guarda cada router la ubicación",
  "roles": [
    {
      "etiqueta": "BrowserRouter",
      "rol": "La URL de verdad: /juegos",
      "descripcion": "pushState y popstate, como el recetario. Direcciones limpias. Es el que se usa casi siempre, y pide configurar el servidor."
    },
    {
      "etiqueta": "HashRouter",
      "rol": "La almohadilla: /#/juegos",
      "descripcion": "Lo de detrás de # no llega al servidor: funciona en cualquier alojamiento sin tocar nada. Es lo que hace el router de esta lección."
    },
    {
      "etiqueta": "MemoryRouter",
      "rol": "Un historial en memoria",
      "descripcion": "La barra de direcciones no cambia. Para los tests (lección 83) y para entornos sin URL. Es lo que usan los ejemplos siguientes, con un navegador de mentira."
    }
  ]
}
```

Un detalle de la vista previa: cada enlace que pulsas en ella **añade una entrada al historial de esta pestaña**, igual que haría una app de verdad. Por eso funciona el botón Atrás, y por eso, si has jugado un rato, tendrás que pulsarlo varias veces para salir de la lección.

## Instalar React Router en un proyecto de Vite

Parte de un proyecto de Vite como el de la lección 2 e instala el paquete `react-router`:

```bash
npm create vite@latest ludoteca -- --template react
cd ludoteca
npm install
npm install react-router
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Comprueba qué versión se ha instalado",
  "contenido": "React Router 8 pide Node.js 22.22 o superior. Con un Node más antiguo (Vite 8 se conforma con 20.19 o 22.12), npm install react-router no da ningún error: instala la versión 7 sin decir nada. Comprobado con Node 22.12 y npm 10.9: instalaron la 7.18.4. Mira la versión en package.json o con npm ls react-router. Todo lo que hacen esta lección y la siguiente funciona igual en la 7 (también comprobado), pero conviene saber cuál tienes."
}
```

React Router se puede usar de tres maneras, que su documentación llama **modos**. Cada una añade cosas a la anterior:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los tres modos de React Router",
  "roles": [
    {
      "etiqueta": "Declarativo",
      "rol": "<BrowserRouter>, <Routes> y <Route>",
      "descripcion": "Rutas, enlaces, parámetros y navegación, y nada más. Es el que usan esta lección y la siguiente."
    },
    {
      "etiqueta": "De datos",
      "rol": "createBrowserRouter y <RouterProvider>",
      "descripcion": "Las rutas se definen fuera de React, como objetos, y cada una puede cargar sus datos (loader) y recibir formularios (action) antes de pintarse."
    },
    {
      "etiqueta": "Framework",
      "rol": "Un plugin de Vite y un archivo routes.ts",
      "descripcion": "El modo de datos más renderizado en el servidor, división del código por rutas y tipos. Lo verás en la lección 90 y en el proyecto 98."
    }
  ]
}
```

¿Cuál elegir? La guía «Picking a Mode» recomienda el **modo framework** si empiezas una app nueva y «eres demasiado nuevo para tener una opinión», y el **declarativo** si quieres «usar React Router de la forma más sencilla posible» o tus datos ya los gestiona otra herramienta. Aquí usamos el declarativo por tres motivos: añade rutas a la app de Vite que ya tienes sin cambiar nada más, deja ver el enrutado solo, y los datos los pondrá TanStack Query en la lección 78. Además, **los componentes y Hooks de estas dos lecciones son los mismos en los tres modos**: lo que aprendas aquí sirve igual cuando cambies.

Con el modo declarativo, la conexión se hace en `main.jsx`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport { BrowserRouter } from 'react-router'\nimport App from './App.jsx'\nimport './index.css'\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <BrowserRouter>\n      <App />\n    </BrowserRouter>\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "import { BrowserRouter } from 'react-router'",
      "nota": "Todo se importa del paquete react-router. En tutoriales antiguos verás react-router-dom: era el paquete de las versiones 6 y 7, y en la 8 ya no existe."
    },
    {
      "fragmento": "<BrowserRouter>",
      "nota": "Hace lo que el Router a mano: lee la URL, escucha popstate y deja la ubicación en un contexto. En su código fuente, la guarda con useState y se suscribe al historial en un useLayoutEffect."
    },
    {
      "fragmento": "<App />",
      "nota": "Todo lo que cuelga de BrowserRouter puede usar Routes, Link, NavLink y los Hooks del router. Fuera de él, fallan (lo verás en los errores típicos)."
    }
  ]
}
```

## Las rutas: `<Routes>` y `<Route>`

Cada `<Route>` une un `path` con el elemento que se pinta, y `<Routes>` elige cuál toca según la URL. Lo que queda fuera de `<Routes>`, como la cabecera, se pinta en todas las páginas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { NavLink, Route, Routes } from 'react-router'\nimport Inicio from './paginas/Inicio.jsx'\nimport Juegos from './paginas/Juegos.jsx'\nimport Partidas from './paginas/Partidas.jsx'\nimport NoEncontrada from './paginas/NoEncontrada.jsx'\n\nexport default function App() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Ludoteca La Partida</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/\">Inicio</NavLink>\n          <NavLink to=\"/juegos\">Juegos</NavLink>\n          <NavLink to=\"/partidas\">Partidas</NavLink>\n        </nav>\n      </header>\n      <main>\n        <Routes>\n          <Route path=\"/\" element={<Inicio />} />\n          <Route path=\"/juegos\" element={<Juegos />} />\n          <Route path=\"/partidas\" element={<Partidas />} />\n          <Route path=\"*\" element={<NoEncontrada />} />\n        </Routes>\n      </main>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<header>",
      "nota": "Fuera de Routes: la cabecera y el menú se pintan en todas las páginas y no se vuelven a montar al navegar, así que conservan su estado."
    },
    {
      "fragmento": "<Routes>",
      "nota": "Busca la ruta que mejor encaja con la URL, no la primera de la lista: una ruta fija como /juegos/novedades gana a /juegos/:juegoId, estén en el orden que estén."
    },
    {
      "fragmento": "<Route path=\"/juegos\" element={<Juegos />} />",
      "nota": "path es la dirección y element, lo que se pinta: un elemento de JSX (lección 7), igual que en el objeto rutas del router a mano."
    },
    {
      "fragmento": "<Route path=\"*\" element={<NoEncontrada />} />",
      "nota": "El asterisco encaja con cualquier dirección que no encaje con otra: la página 404."
    },
    {
      "fragmento": "<NavLink to=\"/juegos\">Juegos</NavLink>",
      "nota": "Un enlace del router. Pinta un <a href=\"/juegos\"> de verdad e intercepta el clic. Lo ves en la sección siguiente."
    }
  ]
}
```

Puesto al lado del router a mano, cada pieza tiene su pareja:

| Tarea | A mano | React Router |
|---|---|---|
| Guardar la ubicación | `Router` | `<BrowserRouter>` |
| Elegir qué se pinta | `<Rutas rutas={…}>` | `<Routes>` y `<Route>` |
| Enlazar sin recargar | `<Enlace a="…">` | `<Link to="…">` |
| Marcar la página actual | `aria-current` en `Enlace` | `<NavLink>` |
| Página 404 | clave `'*'` | `path="*"` |
| Leer la ruta | `useContext(RutaContext)` | `useLocation()` |

## `<Link>` y `<NavLink>` en vez de `<a>`

`<Link to="/juegos">` pinta un `<a href="/juegos">` normal, así que tiene todo lo de un enlace: se enfoca con el teclado, el lector de pantalla lo anuncia como enlace, se ve la dirección al pasar el ratón y se puede abrir en otra pestaña. Lo que añade es su `onClick`. En el código de React Router 8.5.0, ese manejador **solo actúa con un clic normal**: botón izquierdo, sin Ctrl, Cmd, Mayúsculas ni Alt, y sin `target` distinto de `_self`. En ese caso llama a `preventDefault()` (lo que te anunció la lección 15) y navega. Con Cmd o Ctrl deja hacer al navegador, que abre la página en otra pestaña (comprobado en Chrome). Y si le das una URL de otra web, tampoco la intercepta: los enlaces externos funcionan como un `<a>` cualquiera.

¿Y si pones un `<a href="/juegos">` normal? Funciona... recargando **la página entera**: el navegador pide otra vez el `index.html` y el JavaScript, React arranca de cero y **todo el estado se pierde**. Comprobado en un proyecto de Vite con React Router y un contador en `App`: tras dos clics marcaba 2; navegar con `<Link>` lo dejaba en 2, y con un `<a>`, en 0.

En la vista previa no se puede cargar `/partidas` de verdad (con el motor de Chrome, el marco se queda en blanco; con el de Safari, no pasa nada), así que este bloque trae **un navegador de mentira**: barra de direcciones, Atrás, Adelante y Recargar. La URL y el historial viven en el componente `Navegador`, fuera de la app, y cuando un `<a>` normal pide una página, imita lo que haría el navegador: cambia la dirección y **monta la app desde cero**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un Enlace frente a un <a> normal",
  "consigna": "Ve a «Juegos» y aparta dos. Pulsa «Partidas» en el menú: la dirección cambia y siguen apartados 2. Vuelve atrás con la flecha de la barra y pulsa ahora el «Partidas» del pie, un <a> normal: la dirección cambia igual, pero los apartados vuelven a 0. El navegador ha cargado la página entera. En router.jsx están Rutas y Enlace, como antes, pero ahora leen la URL del navegador de mentira.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Navegador from './Navegador'\nimport { Enlace, Rutas } from './router'\nimport './estilos.css'\n\nconst JUEGOS = ['Catán', 'Carcassonne', 'Dixit']\n\nfunction Juegos({ onApartar }) {\n  return (\n    <>\n      <h1>Juegos de mesa</h1>\n      <ul>\n        {JUEGOS.map((juego) => (\n          <li key={juego}>\n            {juego} <button onClick={() => onApartar(juego)}>Apartar {juego}</button>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Ludoteca() {\n  const [apartados, setApartados] = useState([])\n\n  function apartar(juego) {\n    if (!apartados.includes(juego)) setApartados([...apartados, juego])\n  }\n\n  return (\n    <>\n      <header>\n        <nav aria-label=\"Principal\">\n          <Enlace a=\"/juegos\">Juegos</Enlace>\n          <Enlace a=\"/partidas\">Partidas</Enlace>\n        </nav>\n        <p className=\"apartados\">Apartados: {apartados.length}</p>\n      </header>\n      <main>\n        <Rutas\n          rutas={{\n            '/': <h1>Ludoteca La Partida</h1>,\n            '/juegos': <Juegos onApartar={apartar} />,\n            '/partidas': <h1>Partidas abiertas</h1>,\n          }}\n        />\n      </main>\n      <footer>\n        Con un enlace normal: <a href=\"/partidas\">Partidas</a>\n      </footer>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <Navegador>\n      <Ludoteca />\n    </Navegador>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { useNavegador } from './Navegador'\n\n// Pinta el elemento de la ruta actual, o el de '*' si ninguna encaja\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  const camino = url.split('?')[0]\n  return rutas[camino] ?? rutas['*'] ?? null\n}\n\n// Cambia de página sin recargar y marca la página actual con aria-current\nexport function Enlace({ a, children }) {\n  const { url, navegar } = useNavegador()\n  const camino = url.split('?')[0]\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={camino === a ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// Un navegador de mentira: la URL y el historial viven aquí, fuera de la app.\n// La vista previa no deja cargar /juegos de verdad, así que se simula.\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La ludoteca */\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.apartados {\n  padding: 0.2rem 0.6rem;\n  border-radius: 999px;\n  background: #fef3c7;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #d6d3d1;\n}\n\nbutton {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

### `NavLink`: el enlace que sabe si es el de la página actual

`<NavLink>` es un `<Link>` que compara su destino con la URL. Cuando coincide, el `<a>` que pinta lleva **`aria-current="page"`** y la clase **`active`**; cuando no, `class=""`. Esto es lo que pinta en `/juegos`, copiado del navegador (el atributo `data-discover` lo usa el modo framework para cargar rutas bajo demanda; aquí puedes ignorarlo):

```html
<a class="" href="/" data-discover="true">Inicio</a>
<a class="active" href="/juegos" data-discover="true" aria-current="page">Juegos</a>
```

Para resaltar el enlace activo, apunta el CSS a `aria-current`. Así el mismo atributo sirve al lector de pantalla y al estilo, y no dependes de un nombre de clase:

```css
nav a[aria-current='page'] {
  font-weight: 700;
  text-decoration: none;
}
```

Si necesitas otra clase (por ejemplo, con Tailwind), `className` acepta una función que recibe `{ isActive }`: `className={({ isActive }) => (isActive ? 'font-bold' : '')}`. Y lo mismo `style` y `children`.

Ojo con un detalle: **un `NavLink` también está activo en las rutas que cuelgan de la suya**. Compruébalo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "<nav aria-label=\"Principal\">\n  <NavLink to=\"/\">Inicio</NavLink>\n  <NavLink to=\"/juegos\">Juegos</NavLink>\n  <NavLink to=\"/partidas\" end>Partidas</NavLink>\n</nav>\n\n// La URL es /juegos/carcassonne.\n// ¿Qué enlaces llevan aria-current=\"page\"?",
  "opciones": [
    "Ninguno: ninguna ruta coincide exactamente con /juegos/carcassonne",
    "Solo «Juegos»",
    "«Inicio» y «Juegos», porque las dos son el principio de la URL",
    "Los tres, porque NavLink compara solo el primer tramo"
  ],
  "correcta": 1,
  "explicacion": "Sin end, un NavLink está activo en su ruta y en todas las que cuelgan de ella: /juegos lo está en /juegos/carcassonne. La raíz es la excepción: to=\"/\" solo está activo en / (comprobado en React Router 8.5.0). La prop end hace que solo cuente la coincidencia exacta: «Partidas» con end no estaría activo en /partidas/viernes."
}
```

`end` sirve para los enlaces de un menú que no deben quedarse marcados en las subpáginas; sin él, el comportamiento por defecto suele ser justo el que quieres: «Juegos» resaltado mientras miras un juego. Muchos tutoriales ponen `end` en el enlace a `/`; no hace daño, pero en React Router 7 y 8 no hace falta (comprobado en la 7.18.4 y en la 8.5.0).

Una última diferencia: **`<Link>` es para ir a otra página, y un `<button>` para hacer algo** (apartar, enviar, abrir un diálogo). Un lector de pantalla anuncia los dos de forma distinta, y el usuario espera cosas distintas de cada uno. Cuándo navegar desde el código, sin enlace, lo verás con `useNavigate` en la lección 77.

## La página 404

`path="*"` encaja con cualquier dirección que no encaje con otra ruta. Sin ella, `<Routes>` no pinta nada y React Router avisa en la consola:

```text
No routes matched location "/ofertas"
```

Una buena página 404 dice qué ha pasado y ofrece una salida, como un enlace al inicio. Y ten en cuenta una cosa: **la 404 de una SPA es solo lo que pinta tu app**. El servidor ha respondido con un `200` y el `index.html` de siempre (comprobado con `vite preview` en `/no-existe`); quien mire el código de estado, como un buscador, no sabrá que esa página no existe. Para responder con un `404` de verdad, el servidor tendría que saber qué rutas existen: con una SPA solo lo sabe tu app, y con renderizado en el servidor (módulo 13), también el servidor.

## Recargar en `/juegos`: el servidor también tiene que saberlo

Con React Router todo funciona mientras navegas. El problema llega al **recargar** o al abrir un enlace compartido: el navegador pide `/juegos` al servidor, y en la carpeta `dist` no hay ningún archivo que se llame así.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Subes la carpeta dist a un alojamiento estático sin configurar nada.\n// Abres la portada, pulsas «Juegos» y ves el catálogo en /juegos.\n// Ahora pulsas F5 para recargar.\n\n// dist/\n//   index.html\n//   assets/index-DmSk3UyM.js",
  "opciones": [
    "El catálogo, igual que antes de recargar",
    "La portada: la app arranca siempre en /",
    "Un error 404 del servidor, sin rastro de tu app",
    "Tu página «Página no encontrada»"
  ],
  "correcta": 2,
  "explicacion": "Al recargar, el navegador pide /juegos al servidor, que busca un archivo con ese nombre, no lo encuentra y responde 404 sin enviar tu index.html. Tu app ni siquiera llega a cargarse, así que tampoco puede pintar su propia 404. Mientras navegabas no pasaba porque pushState no pide nada al servidor."
}
```

Comprobado sirviendo `dist` con un servidor estático cualquiera (`python3 -m http.server`): la portada carga, y `/juegos` devuelve `Error code: 404 · Message: File not found`. La solución es decirle al servidor que **cualquier ruta que no sea un archivo devuelva el `index.html`**, con un `200`; después React Router lee la URL y pinta la página que toca.

- **En desarrollo no lo notarás**: `npm run dev` y `npm run preview` ya lo hacen. La opción `appType` de Vite vale `'spa'` por defecto, y su documentación lo describe así: «use SPA fallback». Por eso en el recetario de JavaScript recargar funcionaba sin hacer nada.
- **En producción, depende del alojamiento.** Algunos lo hacen solos y otros necesitan una regla. Con un archivo `_redirects`, como el que muestra la guía de React Router, basta una línea:

```text
/*    /index.html   200
```

En Vercel se hace con una reescritura (*rewrite*) en `vercel.json`. La lección 85 lo ve a fondo, con la configuración real de esta misma web. Y si no puedes tocar el servidor de ninguna manera, ese es el caso del `HashRouter`.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cuando una pantalla merece su propia dirección",
      "texto": "Si alguien querría guardarla, compartirla o volver a ella con Atrás (un catálogo, una ficha, un panel de ajustes), necesita una ruta. Si no, un estado basta: la pestaña abierta de un acordeón no necesita URL."
    },
    {
      "titulo": "En casi cualquier SPA de más de una pantalla",
      "texto": "Paneles de administración, tiendas, aplicaciones de gestión. Esta misma web es una SPA con React Router en modo declarativo."
    },
    {
      "titulo": "Cuando no hace falta",
      "texto": "Un componente de React montado en un hueco de una página que ya tiene sus URL (lección 2), un juego de una sola pantalla o un asistente cuyos pasos no tiene sentido enlazar."
    },
    {
      "titulo": "Cuando conviene un framework",
      "texto": "Si sabes desde el principio que necesitas renderizar en el servidor, cargar datos por ruta o una 404 de verdad, empieza con React Router en modo framework o con otro framework: lección 90."
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
      "mito": "React Router viene con React",
      "realidad": "Es una librería aparte, mantenida por Shopify. React no trae rutas: react.dev recomienda un framework para las apps nuevas y, si empiezas desde cero con Vite, propone React Router o TanStack Router."
    },
    {
      "mito": "El paquete se llama react-router-dom",
      "realidad": "Se llamó así hasta la versión 7 y en la 8 desapareció: todo está en react-router. Aun así, react-router-dom se descargó casi 26 millones de veces la semana del 12 de octubre de 2026, y esta misma web usa react-router-dom 7.18.2. Lo verás en mucho código."
    },
    {
      "mito": "Una SPA no puede tener URL de verdad",
      "realidad": "Puede: pushState cambia la dirección sin recargar y popstate avisa de Atrás y Adelante. Lo único que necesita es que el servidor devuelva el index.html en cualquier ruta."
    },
    {
      "mito": "HashRouter está obsoleto",
      "realidad": "Sigue en React Router 8. Las direcciones quedan peor y lo de detrás de # no llega al servidor, pero es la salida cuando no puedes configurar el alojamiento."
    },
    {
      "mito": "Link es un botón con estilo de enlace",
      "realidad": "Es un <a href> de verdad, con su clic interceptado: se puede abrir en otra pestaña y un lector de pantalla lo anuncia como enlace. Para acciones que no cambian de página, un <button>."
    }
  ]
}
```

## Errores típicos

**Un `<a href>` donde iba un `<Link>`.** La app parece funcionar, pero cada clic recarga la página entera y pierde todo el estado: lo viste con los apartados de la ludoteca. Si algo «se reinicia» al cambiar de página, busca un `<a>` suelto.

**Olvidar la ruta `*`.** No da ningún error:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Ludoteca La Partida</p>\n      </header>\n      <main>\n        <Routes>\n          <Route path=\"/\" element={<Inicio />} />\n          <Route path=\"/juegos\" element={<Juegos />} />\n        </Routes>\n      </main>\n    </>\n  )\n}\n\n// Alguien abre un enlace viejo: /ofertas",
  "opciones": [
    "La página de inicio, porque / es el principio de /ofertas",
    "La cabecera y un <main> vacío, y un aviso en la consola",
    "Un error que deja la pantalla en blanco",
    "Una página 404 que React Router trae por defecto"
  ],
  "correcta": 1,
  "explicacion": "Ninguna ruta encaja, así que Routes no pinta nada; lo de fuera de Routes, como la cabecera, sí se pinta. En la consola aparece el aviso No routes matched location \"/ofertas\". En el modo declarativo no hay ninguna 404 por defecto: la pones tú con path=\"*\"."
}
```

**Importar de `react-router-dom` con React Router 8.** Si copias un tutorial antiguo y no tienes ese paquete instalado, Vite se para con:

```text
[vite] Internal server error: Failed to resolve import "react-router-dom" from "src/main.jsx". Does the file exist?
```

Es decir: no encuentra el paquete `react-router-dom`. Cambia los `import` a `react-router`.

**Usar el router fuera de `<BrowserRouter>`.** Un `useNavigate` fuera del router da un error claro: `useNavigate() may be used only in the context of a <Router> component.` Un `<Link>` fuera del router, en cambio, da uno que despista. En React Router 8.5.0, en un proyecto de Vite, sale esto:

```text
Cannot destructure property 'basename' of 'import_react.useContext(...)' as it is null.
```

Es decir: `Link` intenta leer el contexto del router y no hay ninguno. Si ves algo así, mira si `<BrowserRouter>` envuelve de verdad a ese componente; un caso típico es un test que pinta un componente suelto, sin router.

**Un `<Route>` fuera de `<Routes>`.** Cada `<Route>` tiene que ir dentro de un `<Routes>`; si no, el mensaje es literal: `A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.` Y solo puede haber un router en toda la app: un `<BrowserRouter>` dentro de otro da `You cannot render a <Router> inside another <Router>. You should never have more than one in your app.`

**«En mi ordenador funciona y en producción da 404».** No es tu código: es el servidor, que no devuelve el `index.html` en las rutas de la app. Lo viste en la sección anterior.

## Ejercicios

La ludoteca quiere una página de contacto y una 404. El ejercicio usa el navegador de mentira de antes; `paginas.jsx` ya trae `Contacto` y `NoEncontrada`, y todo lo que tienes que tocar está en `App.jsx`.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por qué el ejercicio usa un historial en memoria",
  "contenido": "Las comprobaciones pulsan enlaces decenas de veces. Con la URL de verdad, cada clic dejaría una entrada en el historial de tu navegador y luego tendrías que pulsar Atrás muchas veces para salir de la lección. Por eso aquí el historial vive en memoria, dentro de Navegador.jsx: es lo mismo que hace el MemoryRouter de React Router, el que se suele usar en los tests (lección 83). Enlace y Rutas no cambian."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Contacto, una 404 y un enlace que no recarga",
  "consigna": "En App.jsx: 1) añade al menú un enlace «Contacto» a /contacto; 2) añade la ruta /contacto, que pinte <Contacto />; 3) añade la página 404 para cualquier otra dirección, con <NoEncontrada />; 4) el «Escríbenos» del pie es un <a> normal que recarga la página: cámbialo por un Enlace. Los marcadores de la barra abren una dirección como si la escribieras y pulsaras Intro: úsalos para probar /contacto y /ofertas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Navegador from './Navegador'\nimport { Enlace, Rutas } from './router'\nimport { Contacto, Inicio, Juegos, NoEncontrada, Partidas } from './paginas'\nimport './estilos.css'\n\nfunction Ludoteca() {\n  const [apartados, setApartados] = useState([])\n\n  function apartar(juego) {\n    if (!apartados.includes(juego)) setApartados([...apartados, juego])\n  }\n\n  return (\n    <>\n      <header>\n        <nav aria-label=\"Principal\">\n          <Enlace a=\"/\">Inicio</Enlace>\n          <Enlace a=\"/juegos\">Juegos</Enlace>\n          <Enlace a=\"/partidas\">Partidas</Enlace>\n          {/* 1. Un enlace «Contacto» que lleve a /contacto */}\n        </nav>\n        <p className=\"apartados\">Apartados: {apartados.length}</p>\n      </header>\n      <main>\n        <Rutas\n          rutas={{\n            '/': <Inicio />,\n            '/juegos': <Juegos onApartar={apartar} />,\n            '/partidas': <Partidas />,\n            // 2. La ruta /contacto, que pinta <Contacto />\n            // 3. La página 404 para cualquier otra dirección\n          }}\n        />\n      </main>\n      <footer>\n        {/* 4. Aparta un juego y pulsa este enlace: ¿qué le pasa a «Apartados»? */}\n        <a href=\"/contacto\">Escríbenos</a>\n      </footer>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <Navegador marcadores={['/contacto', '/ofertas']}>\n      <Ludoteca />\n    </Navegador>\n  )\n}\n"
    },
    {
      "nombre": "paginas.jsx",
      "codigo": "import { Enlace } from './router'\n\nconst JUEGOS = ['Catán', 'Carcassonne', 'Dixit', 'Azul']\n\nexport function Inicio() {\n  return (\n    <>\n      <h1>Ludoteca La Partida</h1>\n      <p>Juegos de mesa para jugar aquí o para llevártelos a casa.</p>\n    </>\n  )\n}\n\nexport function Juegos({ onApartar }) {\n  return (\n    <>\n      <h1>Juegos de mesa</h1>\n      <ul>\n        {JUEGOS.map((juego) => (\n          <li key={juego}>\n            {juego} <button onClick={() => onApartar(juego)}>Apartar {juego}</button>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport function Partidas() {\n  return (\n    <>\n      <h1>Partidas abiertas</h1>\n      <ul>\n        <li>Viernes, 20:00 · Catán para principiantes</li>\n        <li>Sábado, 18:00 · Torneo de Azul</li>\n      </ul>\n    </>\n  )\n}\n\nexport function Contacto() {\n  return (\n    <>\n      <h1>Contacto</h1>\n      <p>Calle del Tablero, 7. De martes a domingo, de 17:00 a 23:00.</p>\n    </>\n  )\n}\n\nexport function NoEncontrada() {\n  return (\n    <>\n      <h1>Página no encontrada</h1>\n      <p>Esa dirección no existe en la ludoteca.</p>\n      <Enlace a=\"/\">Volver al inicio</Enlace>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "router.jsx",
      "codigo": "import { useNavegador } from './Navegador'\n\n// Pinta el elemento de la ruta actual, o el de '*' si ninguna encaja\nexport function Rutas({ rutas }) {\n  const { url } = useNavegador()\n  const camino = url.split('?')[0]\n  return rutas[camino] ?? rutas['*'] ?? null\n}\n\n// Cambia de página sin recargar y marca la página actual con aria-current\nexport function Enlace({ a, children }) {\n  const { url, navegar } = useNavegador()\n  const camino = url.split('?')[0]\n\n  function manejarClic(e) {\n    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return\n    e.preventDefault()\n    navegar(a)\n  }\n\n  return (\n    <a href={a} aria-current={camino === a ? 'page' : undefined} onClick={manejarClic}>\n      {children}\n    </a>\n  )\n}\n"
    },
    {
      "nombre": "Navegador.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst NavegadorContext = createContext(null)\nNavegadorContext.displayName = 'Navegador'\n\n// Lo que usa router.jsx para leer la URL y para cambiarla\nexport function useNavegador() {\n  return useContext(NavegadorContext)\n}\n\n// Un navegador de mentira: la URL y el historial viven aquí, fuera de la app.\n// La vista previa no deja cargar /juegos de verdad, así que se simula.\nexport default function Navegador({ inicio = '/', marcadores = [], children }) {\n  const [historial, setHistorial] = useState({ entradas: [inicio], indice: 0 })\n  const [cargas, setCargas] = useState(0)\n  const [escrito, setEscrito] = useState(null)\n  const url = historial.entradas[historial.indice]\n\n  function navegar(destino) {\n    setEscrito(null)\n    setHistorial(({ entradas, indice }) => {\n      if (destino === entradas[indice]) return { entradas, indice }\n      const nuevas = [...entradas.slice(0, indice + 1), destino]\n      return { entradas: nuevas, indice: nuevas.length - 1 }\n    })\n  }\n\n  function saltar(paso) {\n    setEscrito(null)\n    setHistorial((h) => ({ ...h, indice: h.indice + paso }))\n  }\n\n  // Cargar una URL desde cero: la app vuelve a montarse y pierde su estado\n  function cargar(destino) {\n    navegar(destino)\n    setCargas((n) => n + 1)\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const destino = (escrito ?? url).trim()\n    cargar(destino.startsWith('/') ? destino : '/' + destino)\n  }\n\n  // Un <a> normal que nadie intercepta: el navegador cargaría la página entera\n  function manejarClic(e) {\n    const destino = e.target.closest('a')?.getAttribute('href')\n    if (e.defaultPrevented || !destino?.startsWith('/')) return\n    e.preventDefault()\n    cargar(destino)\n  }\n\n  return (\n    <div className=\"navegador\">\n      <form className=\"barra\" onSubmit={manejarEnvio}>\n        <button type=\"button\" aria-label=\"Atrás\" disabled={historial.indice === 0} onClick={() => saltar(-1)}>\n          ←\n        </button>\n        <button\n          type=\"button\"\n          aria-label=\"Adelante\"\n          disabled={historial.indice === historial.entradas.length - 1}\n          onClick={() => saltar(1)}\n        >\n          →\n        </button>\n        <button type=\"button\" aria-label=\"Recargar\" onClick={() => setCargas((n) => n + 1)}>\n          ↻\n        </button>\n        <input aria-label=\"Dirección\" value={escrito ?? url} onChange={(e) => setEscrito(e.target.value)} />\n        <button>Ir</button>\n      </form>\n      {marcadores.length > 0 && (\n        <nav className=\"marcadores\" aria-label=\"Marcadores\">\n          Marcadores:\n          {marcadores.map((marcador) => (\n            <button key={marcador} type=\"button\" onClick={() => cargar(marcador)}>\n              {marcador}\n            </button>\n          ))}\n        </nav>\n      )}\n      <NavegadorContext value={{ url, navegar }}>\n        <div className=\"pagina\" key={cargas} onClick={manejarClic}>\n          {children}\n        </div>\n      </NavegadorContext>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n}\n\n/* El navegador de mentira */\n.barra {\n  display: flex;\n  gap: 0.25rem;\n  padding: 0.4rem;\n  background: #e7e5e4;\n}\n\n.barra button {\n  min-width: 2rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.barra button:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.barra input {\n  flex: 1;\n  min-width: 0;\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #a8a29e;\n  border-radius: 999px;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.marcadores {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0 0.4rem 0.4rem;\n  background: #e7e5e4;\n  font-size: 0.85rem;\n}\n\n.marcadores button {\n  border: 0;\n  border-radius: 6px;\n  background: #d6d3d1;\n  font-family: ui-monospace, monospace;\n  cursor: pointer;\n}\n\n.pagina {\n  padding: 0.5rem 1rem 1rem;\n}\n\n/* La ludoteca */\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  border-bottom: 1px solid #d6d3d1;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\nnav a[aria-current='page'] {\n  color: #1c1917;\n  font-weight: 700;\n  text-decoration: none;\n}\n\n.apartados {\n  padding: 0.2rem 0.6rem;\n  border-radius: 999px;\n  background: #fef3c7;\n}\n\nfooter {\n  margin-top: 1rem;\n  padding-top: 0.5rem;\n  border-top: 1px solid #d6d3d1;\n}\n\nbutton {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "El enlace «Contacto» del menú abre la página de contacto",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Contacto"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Contacto"
      }
    },
    {
      "descripcion": "Una dirección que no existe muestra «Página no encontrada»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/ofertas"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Página no encontrada"
      }
    },
    {
      "descripcion": "Desde la página no encontrada se vuelve al inicio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/ofertas"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Volver al inicio"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Ludoteca La Partida"
      }
    },
    {
      "descripcion": "«Escríbenos», en el pie, abre la página de contacto",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Escríbenos"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Contacto"
      }
    },
    {
      "descripcion": "Ir a contacto desde el pie no pierde los juegos apartados",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Juegos"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apartar Catán"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Escríbenos"
          }
        }
      ],
      "espera": {
        "texto": "Apartados: 1"
      }
    },
    {
      "descripcion": "«Atrás» vuelve de contacto a la página anterior",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Juegos"
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Contacto"
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
        "rol": "heading",
        "nombre": "Juegos de mesa"
      }
    },
    {
      "descripcion": "Abrir /contacto desde los marcadores, como un enlace guardado, muestra la página de contacto",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "/contacto"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Contacto"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática), en un proyecto de Vite con React Router:

1. Monta la ludoteca con `<BrowserRouter>`, `<Routes>` y una página por ruta, con la 404. Cambia los enlaces del menú por `NavLink` y resalta el activo con `a[aria-current='page']`. Después cambia uno por un `<a>` y mira en la pestaña Red de las herramientas de desarrollo todo lo que se vuelve a descargar.
2. Ejecuta `npm run build` y sirve `dist` con un servidor que no sepa nada de SPA, como `python3 -m http.server --directory dist` si tienes Python. Navega hasta `/juegos` y recarga. Después prueba lo mismo con `npm run preview`.
3. Cambia `BrowserRouter` por `HashRouter`. ¿Cómo quedan las direcciones? ¿Sigue fallando la recarga del reto anterior? ¿Por qué?
4. React Router no mueve el foco al cambiar de página: su guía de accesibilidad lo deja en tus manos. Con `useLocation`, un efecto (lección 38) y una ref (lección 34), lleva el foco al `<h1>` de cada página nueva (con `tabIndex={-1}`, como en la lección 37).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useSyncExternalStore",
      "descripcion": "Suscribirse a un valor que cambia fuera de React, con el ejemplo de navigator.onLine: lo que usa el router a mano para leer la URL.",
      "url": "https://react.dev/reference/react/useSyncExternalStore",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Picking a Mode",
      "descripcion": "Los tres modos de React Router, qué añade cada uno y cuál recomienda su documentación según tu caso, con la tabla de qué API hay en cada modo.",
      "url": "https://reactrouter.com/start/modes",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Declarative: Installation",
      "descripcion": "Instalar React Router en una app de Vite y envolverla en BrowserRouter. De aquí siguen Routing y Navigating.",
      "url": "https://reactrouter.com/start/declarative/installation",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Navigating",
      "descripcion": "NavLink, Link y useNavigate: cuándo usar cada uno, la clase active y las funciones de className, style y children.",
      "url": "https://reactrouter.com/start/declarative/navigating",
      "etiqueta": "React Router"
    },
    {
      "titulo": "NavLink",
      "descripcion": "La referencia completa: aria-current, end, caseSensitive y los estados isActive, isPending e isTransitioning.",
      "url": "https://reactrouter.com/api/components/NavLink",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Accessibility",
      "descripcion": "Lo que React Router hace por la accesibilidad (enlaces de verdad, aria-current) y lo que deja en tus manos: el foco y los anuncios al cambiar de ruta.",
      "url": "https://reactrouter.com/how-to/accessibility",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Working with the History API",
      "descripcion": "pushState, replaceState y el evento popstate, las piezas del router que construiste a mano.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API",
      "etiqueta": "MDN"
    }
  ]
}
```
