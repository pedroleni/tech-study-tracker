# Proyecto avanzado: recetario con React Router y TanStack Query

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-recetario-con-react-router-y-tanstack-query` (autogenerado del título)
- **Orden:** 930
- **Fuentes:** [Routing](https://reactrouter.com/start/declarative/routing) + [URL Values](https://reactrouter.com/start/declarative/url-values) + [TanStack Query: Overview](https://tanstack.com/query/latest/docs/framework/react/overview) + [lazy](https://react.dev/reference/react/lazy) — ver `contenido/react/TEMARIO.md` #93
- **Requiere:** Las lecciones 50 (`lazy`), 76 y 77 (React Router) y 78 (TanStack Query), y el proyecto avanzado 78 de JavaScript, el recetario con router propio
- **Repositorio:** [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos) (carpeta `recetario`)

---

## Qué vas a construir

El recetario del proyecto avanzado 78 de JavaScript, **rehecho en React**. La misma API real (TheMealDB, gratuita y sin clave), las mismas pantallas (la portada con tres recetas al azar, el buscador, la ficha de cada receta y las categorías) y los mismos estilos, con algunas reglas nuevas para lo que aquel no tenía. Lo que cambia es todo lo de debajo. Aquel proyecto tenía un router escrito a mano (`router.js`), un estado observable (`estado.js`) y unas acciones con un contador por cada tipo de petición para que una respuesta vieja no tapara una pantalla nueva (`acciones.js`). Aquí no escribes nada de eso:

- **React Router 8** pone las rutas: anidadas, con parámetros (`/receta/52772`) y con la búsqueda en la URL (`/buscar?q=curry`), que en la versión de JavaScript se quedó en un reto.
- **TanStack Query 5** pide los datos, los guarda en una caché con una entrada por clave y los comparte entre componentes. **Adiós al contador `ultimaBusqueda`.**
- **`lazy`** saca cada página a su propio archivo del build.

Como los proyectos avanzados de JavaScript, no vive en el editor de esta web: es un repositorio que clonas y ejecutas en tu ordenador. Y al final, una sección pone las dos versiones frente a frente, con números.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/2d01a295a818fbc479880fd0e7d6c3974fabbcbe9406136130e830cf3d4bc127.mp4",
  "poster": "https://www.techstudytracker.com/img/c00c460e72ed365d81f8fbe8444a0b5d8a248d4b3e3d7b101299a6ffee50bb69.jpg",
  "titulo": "El recetario en React, contra la API real",
  "descripcion": "Se busca «curry» mientras se escribe, se abre una receta y se vuelve con Atrás al instante, desde la caché; las categorías son rutas anidadas y solo cambia la lista."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-proyectos (carpeta recetario). La rama main trae ya hechos los estilos, la capa de red, los componentes pequeños y los tests, y un comentario TODO (paso N) en cada sitio que construyes tú, con el mismo número que los pasos de esta lección. La rama solucion tiene el proyecto completo, por si te atascas. La API es la del proyecto de JavaScript: sin clave y sin ningún archivo .env."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué en la versión de React",
  "roles": [
    {
      "etiqueta": "React Router",
      "rol": "La URL y las páginas",
      "descripcion": "Decide qué página se pinta en cada dirección, intercepta los enlaces y da los parámetros y la búsqueda de la URL. Es lo que hacía router.js."
    },
    {
      "etiqueta": "TanStack Query",
      "rol": "Los datos del servidor",
      "descripcion": "Pide, guarda por clave, comparte, reintenta y cancela. Es lo que hacían estado.js y acciones.js, contadores incluidos."
    },
    {
      "etiqueta": "lazy y Suspense",
      "rol": "El código de cada página",
      "descripcion": "Cada página en su archivo, que se pide la primera vez que alguien la visita. En la versión de JavaScript todo iba en un solo archivo."
    }
  ]
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 24, la LTS actual (desde la 24.15), o Node 22 desde la 22.22.2.** Es más de lo que pedían los proyectos de JavaScript: React Router 8 pide Node 22.22 o superior, y jsdom, con el que se ejecutan los tests, 22.22.2 en la rama 22 y 24.15 en la 24. Compruébalo con `node --version`.
- **Un editor con terminal**, como en los proyectos de JavaScript: [Visual Studio Code](https://code.visualstudio.com) y su terminal integrada (menú `Terminal` → `New Terminal`).
- **Las lecciones 76, 77 y 78** (React Router y TanStack Query) y la **50** (`lazy`). Este proyecto las aplica; cuando una idea ya tiene su explicación, te remito allí en vez de repetirla.

Con un Node más antiguo no hay un error claro. `npm install` avisa con varios `EBADENGINE`, pero lo instala todo, y `npm run dev` funciona. Lo que se rompe es `npm test`; comprobado con Node 22.12.0:

```text
Error: [vitest-pool]: Failed to start forks worker for test files …/src/utilidades.test.js.
Caused by: TypeError: Cannot read properties of undefined (reading 'bind')
 ❯ Object.<anonymous> node_modules/undici/lib/interceptor/decompress.js:78:30
```

Es decir: Vitest no ha podido arrancar porque undici, una dependencia de jsdom, usa algo que esa versión de Node todavía no tiene. Si te pasa, instala la LTS desde [nodejs.org](https://nodejs.org) y vuelve a ejecutar `npm install`.

### Del cero al proyecto abierto en el navegador

1. **Consigue el código**: `git clone https://github.com/pedroleni/react-proyectos.git`, o en [su página](https://github.com/pedroleni/react-proyectos), botón **Code** → **Download ZIP**.
2. **Abre en VS Code la carpeta `recetario/`** (la de este proyecto, no la del repositorio entero) y su terminal integrada.
3. **Instala y arranca**: `npm install` y después `npm run dev`.
4. **Abre la URL que imprime la terminal**, normalmente `http://localhost:5173`. Cópiala de ahí: si ese puerto está ocupado, Vite usa otro.

Lo primero que verás es un aviso: «Aquí irán las rutas. Empieza por el paso 1, en src/main.jsx.». Es lo esperado. Tres cosas más de la rama `main`:

- **Ya están hechos** `api.js`, `utilidades.js`, `style.css`, los componentes `Mensajes.jsx` y `TarjetaReceta.jsx`, la página `NoEncontrada.jsx` y los tests. Léelos, pero no hace falta tocarlos.
- **`npm run lint` da 57 avisos y ningún error.** Son los `import` que aún no usas: las piezas que vas a necesitar. Van desapareciendo según completas los pasos.
- **`npm test` falla al principio**: pasan los 2 tests de `utilidades.js` y fallan los 7 de `App.test.jsx`. Al terminar el paso 9 tienen que pasar los 9.

## Arquitectura: lo que desaparece y lo que aparece

Pon las dos carpetas `src/` una al lado de la otra:

- **`router.js` (145 líneas) y su test desaparecen.** En su lugar hay un árbol de `<Route>` en `App.jsx`, de 30 líneas.
- **`estado.js` (137) y `acciones.js` (103) desaparecen.** En su lugar, `consultas.js` (65 líneas): un Hook de TanStack Query por cada dato.
- **`pages/*.js`**, cada una con su `render(contenedor)` que creaba el DOM a mano, pasan a ser **`paginas/*.jsx`**: componentes que devuelven JSX. Las categorías dejan de ser dos páginas sueltas y se convierten en una ruta madre con dos hijas.
- **`components/navbar.js`** pasa a ser **`componentes/Maquetacion.jsx`**, una ruta de maquetación con el menú y el hueco de cada página.
- **`api.js` queda casi igual.** Cada función recibe una `signal` para poder cancelar, y `fetchConReintento` se va, porque TanStack Query reintenta solo.
- **`utilidades.js`** conserva `normalizarIngredientes` tal cual. `debounce` se va: la sustituye un efecto (paso 7).

Contando comentarios, la fontanería de la versión de JavaScript (router, estado y acciones) suma 385 líneas; lo que la sustituye, `App.jsx` y `consultas.js`, 95. El árbol de rutas que vas a escribir:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas del recetario",
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
      "nombre": "Buscar",
      "nivel": 2,
      "etiqueta": "path: buscar",
      "nota": "← /buscar?q=curry"
    },
    {
      "nombre": "Receta",
      "nivel": 2,
      "etiqueta": "path: receta/:id",
      "nota": "← /receta/52772"
    },
    {
      "nombre": "Categorias",
      "nivel": 2,
      "etiqueta": "path: categorias",
      "nota": "← la fila de categorías; sus hijas, en su <Outlet />"
    },
    {
      "nombre": "ListaCategorias",
      "nivel": 3,
      "etiqueta": "index",
      "nota": "← /categorias"
    },
    {
      "nombre": "Categoria",
      "nivel": 3,
      "etiqueta": "path: :nombre",
      "nota": "← /categorias/Seafood"
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

## Paso 1: los proveedores (`recetario/src/main.jsx`)

Dos proveedores envuelven la aplicación: `QueryClientProvider` reparte la caché y `BrowserRouter`, la URL. Ninguno pinta nada; los dos dejan su pieza en un contexto para que cualquier componente de dentro la use (lección 28).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport { BrowserRouter } from 'react-router'\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query'\nimport { ReactQueryDevtools } from '@tanstack/react-query-devtools'\nimport App from './App.jsx'\nimport './style.css'\n\n// La caché de toda la aplicación: una sola, fuera de cualquier componente.\nconst queryClient = new QueryClient({\n  defaultOptions: {\n    queries: {\n      // Una receta no cambia de un minuto para otro: se da por buena 5 minutos.\n      staleTime: 5 * 60_000,\n      // Un solo reintento: si TheMealDB no responde, mejor decirlo pronto.\n      retry: 1,\n    },\n  },\n})\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <QueryClientProvider client={queryClient}>\n      <BrowserRouter>\n        <App />\n      </BrowserRouter>\n      {/* El panel para ver la caché por dentro. No entra en el build de producción. */}\n      <ReactQueryDevtools />\n    </QueryClientProvider>\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "const queryClient = new QueryClient({",
      "nota": "La caché de toda la aplicación, creada una sola vez en el nivel del módulo. Ocupa el sitio de estado.js, con una diferencia de fondo: guarda una entrada por cada clave, no una variable por pantalla. Dentro de un componente se crearía una caché nueva en cada render (lección 78)."
    },
    {
      "fragmento": "staleTime: 5 * 60_000,",
      "nota": "Las recetas de TheMealDB no cambian de un minuto para otro: durante cinco minutos, volver a una receta o a una categoría ya vista no pide nada. Con el valor por defecto, 0, se volvería a pedir en segundo plano cada vez."
    },
    {
      "fragmento": "retry: 1,",
      "nota": "Un fallo se reintenta una vez. Es el trabajo de fetchConReintento en la versión de JavaScript, con una diferencia: aquel solo reintentaba si fetch lanzaba (sin red); este reintenta cualquier error, también un 500."
    },
    {
      "fragmento": "<BrowserRouter>",
      "nota": "Lee la URL, escucha Atrás y Adelante y deja la ubicación en un contexto: lo que hacían iniciarRouter y el oyente de popstate. Se importa de react-router, no de react-router-dom (lección 76)."
    },
    {
      "fragmento": "<ReactQueryDevtools />",
      "nota": "Un botón abajo a la derecha que abre la caché por dentro: cada clave, su estado y sus datos. En el build de producción no queda nada, porque el paquete exporta una función que devuelve null cuando NODE_ENV no es development (comprobado en su código y en el build)."
    }
  ]
}
```

Guarda: en pantalla no cambia nada todavía. La caché y la URL ya están disponibles; falta decir qué se pinta en cada dirección.

## Paso 2: el árbol de rutas (`recetario/src/App.jsx`)

En la versión de JavaScript, las rutas eran una lista de patrones que `router.js` convertía en expresiones regulares:

```js
registrarRutas([
  { patron: '/', pagina: inicio },
  { patron: '/buscar', pagina: listado },
  { patron: '/receta/:id', pagina: detalle },
  { patron: '/categorias', pagina: categorias },
  { patron: '/categoria/:nombre', pagina: categoria },
]);
```

En React son componentes `<Route>` anidados. En este paso todas las páginas se importan de forma normal; el paso 9 cambiará cinco de esos `import` por `lazy`.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Route, Routes } from 'react-router'\nimport Maquetacion from './componentes/Maquetacion.jsx'\nimport Inicio from './paginas/Inicio.jsx'\nimport NoEncontrada from './paginas/NoEncontrada.jsx'\nimport Buscar from './paginas/Buscar.jsx'\nimport Receta from './paginas/Receta.jsx'\nimport Categorias from './paginas/Categorias.jsx'\nimport ListaCategorias from './paginas/ListaCategorias.jsx'\nimport Categoria from './paginas/Categoria.jsx'\n\nexport default function App() {\n  return (\n    <Routes>\n      <Route element={<Maquetacion />}>\n        <Route index element={<Inicio />} />\n        <Route path=\"buscar\" element={<Buscar />} />\n        <Route path=\"receta/:id\" element={<Receta />} />\n        <Route path=\"categorias\" element={<Categorias />}>\n          <Route index element={<ListaCategorias />} />\n          <Route path=\":nombre\" element={<Categoria />} />\n        </Route>\n        <Route path=\"*\" element={<NoEncontrada />} />\n      </Route>\n    </Routes>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Route element={<Maquetacion />}>",
      "nota": "Una ruta sin path (lección 77): no añade nada a la URL y pone la cabecera, el menú y el pie a todas sus hijas, la página 404 incluida."
    },
    {
      "fragmento": "<Route index element={<Inicio />} />",
      "nota": "La ruta índice: lo que se pinta en la URL de su madre, aquí /, cuando no hay nada más detrás."
    },
    {
      "fragmento": "<Route path=\"receta/:id\" element={<Receta />} />",
      "nota": "Un segmento dinámico. En JavaScript, compilarPatron lo convertía en ([^/]+) y resolverRuta sacaba su valor de la coincidencia; aquí lo leerás con useParams en el paso 6."
    },
    {
      "fragmento": "<Route path=\"categorias\" element={<Categorias />}>",
      "nota": "Una ruta madre con dos hijas. En JavaScript eran dos páginas sin relación, /categorias y /categoria/:nombre; aquí /categorias/Seafood pinta la madre y, dentro de ella, la hija."
    },
    {
      "fragmento": "<Route path=\":nombre\" element={<Categoria />} />",
      "nota": "Relativa a su madre: encaja con /categorias/Seafood, /categorias/Dessert..."
    },
    {
      "fragmento": "<Route path=\"*\" element={<NoEncontrada />} />",
      "nota": "La 404: lo que hacía renderizarNoEncontrada en router.js. Como está dentro de la maquetación, una dirección que no existe se ve con su menú."
    }
  ]
}
```

Guarda y navega por varias direcciones: en todas verás la cabecera y el pie, y nada en medio. No es un fallo tuyo: `Maquetacion` todavía no tiene su `<Outlet />`. Es el error de la lección 77 («una madre sin `<Outlet />` no pinta a sus hijas»), visto en tu propio proyecto, y lo arreglas en el paso siguiente.

## Paso 3: la maquetación (`recetario/src/componentes/Maquetacion.jsx`)

La cabecera de la rama `main` tiene enlaces `<a>` normales. Funcionan, pero cada clic recarga la aplicación entera, y con ella se pierde la caché de TanStack Query. Cámbialos por `Link` y `NavLink`, pon el hueco de las páginas y arregla, de paso, algo que la versión de JavaScript tampoco hacía: volver arriba al cambiar de página.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useEffect } from 'react'\nimport { Link, NavLink, Outlet, useLocation, useNavigationType } from 'react-router'\n\nexport default function Maquetacion() {\n  const { pathname } = useLocation()\n  const tipoDeNavegacion = useNavigationType()\n\n  // Al abrir otra página, arriba del todo. Con Atrás y Adelante (POP) no:\n  // el navegador ya devuelve el scroll a donde estaba.\n  useEffect(() => {\n    if (tipoDeNavegacion !== 'POP') window.scrollTo(0, 0)\n  }, [pathname, tipoDeNavegacion])\n\n  return (\n    <>\n      <header className=\"cabecera-sitio\">\n        <nav className=\"navbar\" aria-label=\"Navegación principal\">\n          <Link className=\"navbar-marca\" to=\"/\">\n            Recetario\n          </Link>\n          <div className=\"navbar-enlaces\">\n            <NavLink to=\"/\">Inicio</NavLink>\n            <NavLink to=\"/buscar\">Buscar</NavLink>\n            <NavLink to=\"/categorias\">Categorías</NavLink>\n          </div>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n      <footer className=\"pie\">\n        Recetas e imágenes de <a href=\"https://www.themealdb.com\">TheMealDB</a>\n      </footer>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const tipoDeNavegacion = useNavigationType()",
      "nota": "Cómo se ha llegado a la URL actual: PUSH (un enlace), REPLACE (una sustitución) o POP (Atrás, Adelante o la primera carga)."
    },
    {
      "fragmento": "if (tipoDeNavegacion !== 'POP') window.scrollTo(0, 0)",
      "nota": "Un router de SPA no toca el scroll. Comprobado en la versión de JavaScript: con la lista bajada 299 px, la categoría que abrías salía también 299 px abajo. Con POP no se toca nada, porque el navegador devuelve el scroll a donde estaba: lista a 864 px, receta arriba, Atrás y otra vez a 864."
    },
    {
      "fragmento": "<Link className=\"navbar-marca\" to=\"/\">",
      "nota": "Un enlace del router: un <a href> de verdad con el clic interceptado (lección 76). Es lo que hacía manejarClickInterno, con sus comprobaciones de Ctrl, Cmd y botón central incluidas."
    },
    {
      "fragmento": "<NavLink to=\"/categorias\">Categorías</NavLink>",
      "nota": "Además, se marca con aria-current=\"page\" cuando la URL es la suya o cuelga de ella, también en /categorias/Seafood. El CSS del proyecto lo subraya con a[aria-current='page']."
    },
    {
      "fragmento": "<Outlet />",
      "nota": "El hueco de la maquetación: aquí se pinta la página de cada ruta."
    }
  ]
}
```

Ahora cada dirección pinta su página, todavía sin datos. Fíjate en que navegar ya no recarga nada: el menú y la cabecera se quedan montados y solo cambia lo de dentro de `<main>`.

## Paso 4: un Hook por dato (`recetario/src/consultas.js`)

Este es el paso que más código borra. En la versión de JavaScript, pedir una receta necesitaba una acción con su contador, varias funciones de `estado.js` para marcar la carga, el éxito y el error con su origen (`establecerCargaReceta`, `establecerRecetaActual`, `establecerError`, `finalizarConExito`...) y una bandera en la página para no pedirla dos veces. La acción era esta:

```js
let ultimaReceta = 0;

export async function cargarReceta(id) {
  const identificador = ++ultimaReceta;
  establecerCargaReceta(id);

  try {
    const receta = await obtenerReceta(id);
    if (identificador === ultimaReceta) establecerRecetaActual(receta);
  } catch (error) {
    if (identificador === ultimaReceta) establecerError(error.message, 'receta');
  }
}
```

En React, cada dato es un Hook propio que envuelve `useQuery` (lección 78), y las claves viven todas juntas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { keepPreviousData, useQuery } from '@tanstack/react-query'\nimport {\n  buscarPorNombre,\n  filtrarPorCategoria,\n  obtenerCategorias,\n  obtenerDestacadas,\n  obtenerReceta,\n} from './api.js'\n\n// Todas las claves en un solo sitio, de lo general a lo concreto.\n// Cada clave lleva todo lo que su función usa para pedir los datos.\nexport const claves = {\n  destacadas: ['recetas', 'destacadas'],\n  busqueda: (texto) => ['recetas', 'busqueda', texto],\n  receta: (id) => ['recetas', 'detalle', id],\n  categorias: ['categorias'],\n  recetasDeCategoria: (nombre) => ['categorias', nombre, 'recetas'],\n}\n\nexport function useRecetasDestacadas() {\n  return useQuery({\n    queryKey: claves.destacadas,\n    queryFn: ({ signal }) => obtenerDestacadas(signal),\n    // Son al azar: si se volvieran a pedir (al volver a esta pestaña cuando ya\n    // están viejas, por ejemplo), cambiarían delante de ti. Nunca caducan; si\n    // nadie las usa durante cinco minutos (gcTime), la caché las borra.\n    staleTime: Infinity,\n  })\n}\n\nexport function useBusquedaRecetas(texto) {\n  return useQuery({\n    queryKey: claves.busqueda(texto),\n    queryFn: ({ signal }) => buscarPorNombre(texto, signal),\n    // Sin texto no hay nada que pedir.\n    enabled: texto !== '',\n    // Mientras llega la búsqueda nueva, se ven los resultados de la anterior.\n    placeholderData: keepPreviousData,\n  })\n}\n\nexport function useReceta(id) {\n  return useQuery({\n    queryKey: claves.receta(id),\n    queryFn: ({ signal }) => obtenerReceta(id, signal),\n  })\n}\n\nexport function useCategorias() {\n  return useQuery({\n    queryKey: claves.categorias,\n    queryFn: ({ signal }) => obtenerCategorias(signal),\n  })\n}\n\nexport function useRecetasDeCategoria(nombre) {\n  return useQuery({\n    queryKey: claves.recetasDeCategoria(nombre),\n    queryFn: ({ signal }) => filtrarPorCategoria(nombre, signal),\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "export const claves = {",
      "nota": "Todas las claves en un sitio, de lo general a lo concreto, como hace esta misma web (lección 78). Ningún Hook escribe la suya a mano, así que no pueden desincronizarse."
    },
    {
      "fragmento": "receta: (id) => ['recetas', 'detalle', id],",
      "nota": "La regla de la lección 78: todo lo que la función usa para pedir va en la clave. Con ['recetas', 'detalle'] a secas, todas las recetas compartirían una entrada y verías siempre la primera que abriste."
    },
    {
      "fragmento": "queryFn: ({ signal }) => obtenerDestacadas(signal),",
      "nota": "TanStack Query le pasa a la función una AbortSignal, y api.js se la da a fetch. Si ningún componente mira ya esa clave, la petición se cancela."
    },
    {
      "fragmento": "staleTime: Infinity,",
      "nota": "Las destacadas son al azar. Con datos que caducan, un refresco en segundo plano (al volver a la pestaña, según la guía de valores por defecto) las cambiaría delante de ti. En JavaScript, la bandera cargaSolicitada hacía que se pidieran una sola vez."
    },
    {
      "fragmento": "enabled: texto !== '',",
      "nota": "Sin texto no se pide nada. Sin esta línea, entrar en /buscar pediría search.php?s= y TheMealDB respondería con 25 recetas que nadie ha buscado (comprobado)."
    },
    {
      "fragmento": "placeholderData: keepPreviousData,",
      "nota": "Mientras llega una búsqueda nueva, se siguen viendo los resultados de la anterior (lección 78). En el paso 7 los atenúas para que se note."
    },
    {
      "fragmento": "export function useReceta(id) {",
      "nota": "Todo lo de cargarReceta, establecerCargaReceta, establecerRecetaActual e idSolicitado cabe aquí. Y no hay ningún identificador: cada componente lee la entrada de su clave, y una respuesta que llega tarde se guarda en la suya, que ya nadie mira."
    }
  ]
}
```

## Paso 5: la primera consulta en pantalla (`recetario/src/paginas/Inicio.jsx`)

La portada pide sus tres recetas y pinta un estado por rama, como en la lección 23. Compara con `inicio.js`, que leía `recetasDestacadas`, `cargando`, `origenCarga`, `error` y `origenError` del estado global y tenía que comprobar que la carga y el error fueran **suyos**: aquí todo lo que devuelve el Hook es de la clave de las destacadas y de nadie más.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Link } from 'react-router'\nimport { MensajeError, MensajeEstado } from '../componentes/Mensajes.jsx'\nimport TarjetaReceta from '../componentes/TarjetaReceta.jsx'\nimport { useRecetasDestacadas } from '../consultas.js'\n\nexport default function Inicio() {\n  const { data: recetas, isPending, error, refetch } = useRecetasDestacadas()\n\n  return (\n    <>\n      {/* Sin <title>: en la portada vale el de index.html */}\n      <section className=\"hero\">\n        <div className=\"hero-contenido\">\n          <p className=\"antetitulo\">Cocina sin complicaciones</p>\n          <h1>Recetas que saben a casa</h1>\n          <p>Encuentra ideas, ingredientes y pasos para tu próxima comida.</p>\n          <Link className=\"boton boton-claro\" to=\"/buscar\">\n            Buscar una receta\n          </Link>\n        </div>\n      </section>\n\n      <section className=\"seccion-contenido\">\n        <div className=\"cabecera-seccion\">\n          <p className=\"antetitulo\">Inspiración diaria</p>\n          <h2>Tres recetas para descubrir</h2>\n        </div>\n\n        {isPending ? (\n          <MensajeEstado>Buscando recetas apetitosas…</MensajeEstado>\n        ) : error ? (\n          <MensajeError error={error} onReintentar={refetch} />\n        ) : recetas.length === 0 ? (\n          <MensajeEstado>No hay recetas destacadas disponibles.</MensajeEstado>\n        ) : (\n          <div className=\"rejilla-recetas rejilla-destacadas\">\n            {recetas.map((receta) => (\n              <TarjetaReceta key={receta.idMeal} receta={receta} />\n            ))}\n          </div>\n        )}\n      </section>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const { data: recetas, isPending, error, refetch } = useRecetasDestacadas()",
      "nota": "El estado de la entrada de su clave: los datos (renombrados a recetas), si aún no hay datos, el error y una función para volver a pedir."
    },
    {
      "fragmento": "{isPending ? (",
      "nota": "Primero los casos sin datos, después el camino feliz. isPending es true mientras no haya datos en la entrada, la primera vez que se pide."
    },
    {
      "fragmento": "<MensajeError error={error} onReintentar={refetch} />",
      "nota": "Un error con su botón «Reintentar», que vuelve a pedir la misma clave. La versión de JavaScript enseñaba el mensaje y nada más."
    },
    {
      "fragmento": "<TarjetaReceta key={receta.idMeal} receta={receta} />",
      "nota": "La key es el id de la receta. Nada impide que random.php dé la misma receta en dos de las tres peticiones, y dos hermanos con la misma key son un error en React (lo ves en Errores típicos). Por eso obtenerDestacadas, en api.js, se queda con una de cada."
    }
  ]
}
```

Ve a otra página y vuelve a la portada: siguen las mismas tres recetas, sin ninguna petición nueva (comprobado: tres `random.php` al entrar y ninguno al volver). Es la caché, no una bandera.

Las fotos las pinta `TarjetaReceta`, que ya está hecha. Un detalle que no tenía la versión de JavaScript: pide la miniatura que ofrece TheMealDB añadiendo `/medium` a la dirección de la foto, 350 × 350 px. Con una foto de prueba, 30 KB en vez de los 124 KB del original de 800 × 800.

## Paso 6: el parámetro de la ruta (`recetario/src/paginas/Receta.jsx`)

La ficha ya está maquetada en `DetalleReceta`: es el mismo HTML que creaba `detalle.js` a mano, ahora en JSX. Te falta lo de arriba: leer el id de la URL, pedir la receta y elegir la rama.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Link, useParams } from 'react-router'\nimport { MensajeError, MensajeEstado } from '../componentes/Mensajes.jsx'\nimport { useReceta } from '../consultas.js'\nimport { normalizarIngredientes } from '../utilidades.js'\n\nexport default function Receta() {\n  const { id } = useParams()\n  const { data: receta, isPending, error, refetch } = useReceta(id)\n\n  return (\n    <section className=\"pagina seccion-contenido\">\n      {isPending ? (\n        <MensajeEstado>Cargando la receta…</MensajeEstado>\n      ) : error ? (\n        <MensajeError error={error} onReintentar={refetch} />\n      ) : receta === null ? (\n        // La ruta /receta/:id encaja con cualquier id; la receta puede no existir.\n        <>\n          <title>Receta no encontrada · Recetario</title>\n          <MensajeEstado>No hemos encontrado esa receta.</MensajeEstado>\n          <Link to=\"/buscar\">Buscar otra receta</Link>\n        </>\n      ) : (\n        <DetalleReceta receta={receta} />\n      )}\n    </section>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const { id } = useParams()",
      "nota": "El :id de la ruta, siempre como texto (lección 77). Aquí no hay que convertirlo: TheMealDB usa los ids como texto (\"52772\") en sus respuestas y en sus URL."
    },
    {
      "fragmento": "useReceta(id)",
      "nota": "Al pasar de una receta a otra cambia el id, cambia la clave y el Hook lee otra entrada. Nada que limpiar a mano."
    },
    {
      "fragmento": ") : receta === null ? (",
      "nota": "La ruta encaja con cualquier id, pero la receta puede no existir: lookup.php responde {\"meals\":null} (comprobado con /receta/1), api.js lo convierte en null y la página lo dice. Es la «404 del recurso» de la lección 77."
    },
    {
      "fragmento": "<DetalleReceta receta={receta} />",
      "nota": "Ya hecho. Dos cosas nuevas respecto a detalle.js: la categoría es un enlace a /categorias/…, y cada ingrediente lleva una key que verás en Errores típicos."
    }
  ]
}
```

## Paso 7: la búsqueda en la URL (`recetario/src/paginas/Buscar.jsx`)

En la versión de JavaScript, la búsqueda vivía en `estado.js`: recargar la página o compartir el enlace la perdía, y llevarla a la URL (`/buscar?q=pollo`) era el tercer reto. Aquí es lo primero. Con una condición que no se ve venir: **el campo de texto no puede leer su valor directamente de la URL**. React Router 8 hace cada cambio de URL dentro de una transición, y una transición no puede controlar un campo de texto (lo pruebas en Errores típicos). Por eso hay dos valores: lo que hay escrito en el campo, en un estado propio que se actualiza al instante, y la búsqueda de verdad, en la URL, que va por detrás. Es la primera de las dos salidas que propone react.dev en la página de `useTransition`; la lección 51 usó la segunda, `useDeferredValue`, para separar un campo de su lista.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useEffect, useState } from 'react'\nimport { useSearchParams } from 'react-router'\nimport { MensajeError, MensajeEstado } from '../componentes/Mensajes.jsx'\nimport TarjetaReceta from '../componentes/TarjetaReceta.jsx'\nimport { useBusquedaRecetas } from '../consultas.js'\n\nexport default function Buscar() {\n  const [searchParams, setSearchParams] = useSearchParams()\n  // La búsqueda vive en la URL (/buscar?q=pasta): se comparte, se guarda y\n  // sobrevive a una recarga.\n  const q = (searchParams.get('q') ?? '').trim()\n\n  // Lo que hay escrito en el campo, que va por delante de la URL mientras tecleas.\n  const [texto, setTexto] = useState(q)\n\n  // Si la URL cambia por su cuenta (Atrás, el menú), el campo la sigue.\n  // Es el patrón de ajustar el estado durante el render de la lección 39.\n  const [qAnterior, setQAnterior] = useState(q)\n  if (q !== qAnterior) {\n    setQAnterior(q)\n    if (texto.trim() !== q) setTexto(q)\n  }\n\n  // Escribir también busca, 400 ms después de la última tecla. Con replace,\n  // teclear no llena el historial: Atrás sale de la búsqueda, no la deshace letra a letra.\n  useEffect(() => {\n    const termino = texto.trim()\n    if (termino === q) return\n    const temporizador = setTimeout(() => {\n      setSearchParams(termino ? { q: termino } : {}, { replace: true })\n    }, 400)\n    return () => clearTimeout(temporizador)\n  }, [texto, q, setSearchParams])\n\n  // Intro o el botón «Buscar»: sin esperar.\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    const termino = texto.trim()\n    if (termino !== q) setSearchParams(termino ? { q: termino } : {}, { replace: true })\n  }\n\n  return (\n    <section className=\"pagina seccion-contenido\">\n      <title>{q ? `«${q}» · Recetario` : 'Buscar · Recetario'}</title>\n      <p className=\"antetitulo\">Elige qué cocinar</p>\n      <h1>Buscar recetas</h1>\n\n      <form className=\"buscador\" role=\"search\" onSubmit={manejarEnvio}>\n        <label htmlFor=\"busqueda\" className=\"solo-lectores\">\n          Nombre de la receta\n        </label>\n        <input\n          id=\"busqueda\"\n          type=\"search\"\n          placeholder=\"Por ejemplo: curry, pasta, chicken…\"\n          autoComplete=\"off\"\n          value={texto}\n          onChange={(evento) => setTexto(evento.target.value)}\n        />\n        <button className=\"boton\">Buscar</button>\n      </form>\n\n      <Resultados q={q} />\n    </section>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const q = (searchParams.get('q') ?? '').trim()",
      "nota": "La búsqueda de verdad vive en la URL: sobrevive a una recarga, se comparte en un enlace y Atrás la recupera. La URL es su único dueño (lección 77)."
    },
    {
      "fragmento": "const [texto, setTexto] = useState(q)",
      "nota": "Lo que hay escrito en el campo, que va por delante de la URL mientras tecleas. Se actualiza con cada tecla de forma urgente, nunca dentro de una transición."
    },
    {
      "fragmento": "if (q !== qAnterior) {",
      "nota": "Si la URL cambia por su cuenta (Atrás, el «Buscar» del menú), el campo se pone al día durante el render, sin efecto: el patrón de la lección 39. Comparar con texto.trim() evita borrarte un espacio que acabas de escribir."
    },
    {
      "fragmento": "const temporizador = setTimeout(() => {",
      "nota": "Escribir busca solo, 400 ms después de la última tecla: lo que hacía debounce en la versión de JavaScript, ahora como un efecto con limpieza (lección 38). Cada tecla cambia texto, y la limpieza anula el temporizador anterior."
    },
    {
      "fragmento": "{ replace: true })\n    }, 400)",
      "nota": "Teclear sustituye la entrada del historial en vez de añadir una por búsqueda (lección 77): Atrás te saca del buscador en vez de deshacer palabras."
    },
    {
      "fragmento": "function manejarEnvio(evento) {",
      "nota": "Intro o el botón «Buscar»: sin esperar a los 400 ms. Si ya es la búsqueda que se ve, no hace nada."
    },
    {
      "fragmento": "<title>{q ? `«${q}» · Recetario` : 'Buscar · Recetario'}</title>",
      "nota": "Cada página pone su título (lección 81), siempre como una sola cadena: con la búsqueda, la pestaña dice «curry» · Recetario."
    },
    {
      "fragmento": "value={texto}",
      "nota": "El campo, controlado por su propio estado. La consulta, en cambio, va con q: la de la URL."
    }
  ]
}
```

Los resultados van aparte, en `Resultados`, que solo recibe `q`: la consulta depende de la búsqueda de verdad, nunca de lo que estás tecleando.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function Resultados({ q }) {\n  const { data: recetas, isPending, isPlaceholderData, error, refetch } = useBusquedaRecetas(q)\n\n  if (!q) return <MensajeEstado>Escribe un nombre para empezar.</MensajeEstado>\n  if (isPending) return <MensajeEstado>Buscando recetas…</MensajeEstado>\n  if (error) return <MensajeError error={error} onReintentar={refetch} />\n  // Datos de la búsqueda anterior que no tenían resultados: aún no hay nada que enseñar.\n  if (isPlaceholderData && recetas.length === 0) return <MensajeEstado>Buscando recetas…</MensajeEstado>\n  if (recetas.length === 0) return <MensajeEstado>No encontramos recetas para «{q}».</MensajeEstado>\n\n  return (\n    <>\n      <MensajeEstado>\n        {isPlaceholderData\n          ? `Buscando «${q}»…`\n          : `${recetas.length} ${recetas.length === 1 ? 'resultado' : 'resultados'} para «${q}».`}\n      </MensajeEstado>\n      {/* Con los datos de la búsqueda anterior, la rejilla se atenúa: aún no es lo que has pedido */}\n      <div className=\"rejilla-recetas\" aria-busy={isPlaceholderData}>\n        {recetas.map((receta) => (\n          <TarjetaReceta key={receta.idMeal} receta={receta} />\n        ))}\n      </div>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "useBusquedaRecetas(q)",
      "nota": "Cada q es una entrada de la caché. Busca «curry», abre una receta y vuelve con Atrás: los resultados salen al instante, sin ninguna petición nueva (comprobado)."
    },
    {
      "fragmento": "if (isPlaceholderData && recetas.length === 0)",
      "nota": "Con keepPreviousData, mientras llega la búsqueda nueva se ven los datos de la anterior. Si aquella no tenía resultados, sin esta línea saldría «No encontramos recetas» para lo que acabas de escribir antes de que llegue su respuesta."
    },
    {
      "fragmento": "? `Buscando «${q}»…`",
      "nota": "El aviso dice lo que se está buscando, no lo que se ve: las tarjetas todavía son de la búsqueda anterior."
    },
    {
      "fragmento": "aria-busy={isPlaceholderData}",
      "nota": "La rejilla vieja, marcada como ocupada, y el CSS del proyecto la atenúa con [aria-busy='true'] (lección 78)."
    }
  ]
}
```

Ahora compáralo con lo que pasaba en la versión de JavaScript al escribir con una pausa en medio, algo que haces sin pensar mientras decides qué buscar:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// pages/listado.js, versión de JavaScript (recortado).\n// Cada cambio del estado vacía la página y vuelve a llamar a render().\nexport function render(contenedor) {\n  const { busqueda } = obtenerEstado();\n  // ...\n  const entrada = document.createElement('input');\n  entrada.value = busqueda;\n  const buscarConDebounce = debounce((texto) => buscarRecetas(texto), 400);\n  entrada.addEventListener('input', (evento) => buscarConDebounce(evento.target.value));\n  // ...\n}\n\n// En /buscar, escribes «chi», te paras un segundo\n// y sigues escribiendo «cken». ¿Qué queda en el campo?",
  "opciones": [
    "«chicken», como en cualquier buscador",
    "«chi»: el campo de ahora es otro, sin el foco, y «cken» no llega a ninguna parte",
    "«cken»: el campo nuevo empieza vacío",
    "«chichicken»: el valor viejo y el nuevo se juntan"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en Chromium con la solución del proyecto de JavaScript: a los 400 ms, buscarRecetas cambia el estado, el router vacía la página y render() crea un input nuevo con «chi». El foco se queda en el body y «cken» se pierde. Con React, el mismo input sigue en el DOM entre renders (lección 17): el foco no se mueve, el campo acaba en «chicken» y la URL en /buscar?q=chicken."
}
```

## Paso 8: rutas anidadas (`Categorias.jsx`, `ListaCategorias.jsx` y `Categoria.jsx`)

`Categorias` es la ruta madre: pinta el título y una fila con todas las categorías, y deja un hueco para sus hijas. En `/categorias`, el hueco lo llena `ListaCategorias` (las tarjetas con foto, como la página de JavaScript); en `/categorias/Seafood`, `Categoria` (las recetas de esa categoría).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { NavLink, Outlet } from 'react-router'\nimport { useCategorias } from '../consultas.js'\n\n// La ruta madre de /categorias y /categorias/:nombre. Su cabecera y la fila de\n// categorías se quedan montadas; lo que cambia va en el <Outlet />.\nexport default function Categorias() {\n  const { data: categorias } = useCategorias()\n\n  return (\n    <section className=\"pagina seccion-contenido\">\n      <p className=\"antetitulo\">Explora a tu manera</p>\n      <h1>Categorías</h1>\n\n      {categorias && (\n        <nav className=\"chips\" aria-label=\"Categorías\">\n          {categorias.map((categoria) => (\n            // Enlace relativo: desde /categorias, «Beef» lleva a /categorias/Beef\n            <NavLink key={categoria.idCategory} to={categoria.strCategory}>\n              {categoria.strCategory}\n            </NavLink>\n          ))}\n        </nav>\n      )}\n\n      <Outlet />\n    </section>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const { data: categorias } = useCategorias()",
      "nota": "La madre pide las categorías para su fila. ListaCategorias, su ruta índice, pide exactamente lo mismo con el mismo Hook: misma clave, una sola petición para los dos."
    },
    {
      "fragmento": "{categorias && (",
      "nota": "La fila solo sale cuando hay datos. El aviso de carga y el de error los pinta la hija, así que no se repiten."
    },
    {
      "fragmento": "<NavLink key={categoria.idCategory} to={categoria.strCategory}>",
      "nota": "Un enlace relativo: dentro de la ruta categorias, to=\"Seafood\" lleva a /categorias/Seafood (lección 77). El activo lleva aria-current y el CSS lo rellena. Y «Categorías», en el menú, sigue marcado: un NavLink sin end también está activo en las rutas que cuelgan de la suya."
    },
    {
      "fragmento": "<Outlet />",
      "nota": "El hueco de las hijas. Al pasar de Seafood a Dessert, la madre no se vuelve a montar: la fila no parpadea ni se vuelve a pedir, y solo cambia lo de aquí."
    }
  ]
}
```

`Categoria` es como `Receta`: lee `nombre` con `useParams` y pide sus recetas con `useRecetasDeCategoria(nombre)`. `filter.php` con una categoría que no existe responde `{"meals":null}`, y `api.js` lo convierte en una lista vacía: «No hay recetas disponibles en esta categoría.».

Prueba la caché: abre Seafood, después Dessert y otra vez Seafood. La tercera vez no sale ninguna petición, porque los datos siguen frescos (los cinco minutos del paso 1). Y una pregunta antes de seguir:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Categorias (la madre) y ListaCategorias (su índice)\n// llaman las dos a useCategorias().\n\n// Abres /categorias con la pestaña Red abierta.\n// ¿Cuántas peticiones a categories.php ves?",
  "opciones": [
    "Dos, una por componente",
    "Una con npm run dev y una con npm run preview",
    "Dos con npm run dev, una de ellas cancelada, y una con npm run preview",
    "Ninguna: la fila se pinta con datos de ejemplo"
  ],
  "correcta": 2,
  "explicacion": "Los dos componentes piden la misma clave, así que comparten petición. En desarrollo, StrictMode monta, desmonta y vuelve a montar (lección 63): la primera petición se cancela porque la signal llega a fetch, y sale otra (lección 78). Comprobado en Chromium: con npm run dev, dos categories.php y una cancelada; con el build, una sola."
}
```

## Paso 9: cada página en su archivo (`lazy` y `<Suspense>`)

El último paso cambia cinco `import` de `App.jsx` por `lazy` (lección 50) y añade dos `<Suspense>`: uno en `Maquetacion`, alrededor de su `<Outlet />`, y otro en `Categorias`, alrededor del suyo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { lazy } from 'react'\nimport { Route, Routes } from 'react-router'\nimport Maquetacion from './componentes/Maquetacion.jsx'\nimport Inicio from './paginas/Inicio.jsx'\nimport NoEncontrada from './paginas/NoEncontrada.jsx'\n\n// La portada la ve todo el mundo al entrar: va en el archivo principal.\n// El resto de páginas, cada una en su propio archivo, se piden al visitarlas.\nconst Buscar = lazy(() => import('./paginas/Buscar.jsx'))\nconst Receta = lazy(() => import('./paginas/Receta.jsx'))\nconst Categorias = lazy(() => import('./paginas/Categorias.jsx'))\nconst ListaCategorias = lazy(() => import('./paginas/ListaCategorias.jsx'))\nconst Categoria = lazy(() => import('./paginas/Categoria.jsx'))\n\nexport default function App() {\n  return (\n    <Routes>\n      <Route element={<Maquetacion />}>\n        <Route index element={<Inicio />} />\n        <Route path=\"buscar\" element={<Buscar />} />\n        <Route path=\"receta/:id\" element={<Receta />} />\n        <Route path=\"categorias\" element={<Categorias />}>\n          <Route index element={<ListaCategorias />} />\n          <Route path=\":nombre\" element={<Categoria />} />\n        </Route>\n        <Route path=\"*\" element={<NoEncontrada />} />\n      </Route>\n    </Routes>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import Inicio from './paginas/Inicio.jsx'",
      "nota": "La portada, con un import normal: es lo que ve todo el mundo al entrar, y con lazy solo añadiría una espera (lección 50). NoEncontrada, igual: son doce líneas."
    },
    {
      "fragmento": "const Buscar = lazy(() => import('./paginas/Buscar.jsx'))",
      "nota": "Declarado en lo alto del módulo, nunca dentro de un componente (lección 50). Cada página exporta su componente por defecto, que es lo que lazy espera."
    },
    {
      "fragmento": "<Route path=\"buscar\" element={<Buscar />} />",
      "nota": "Las rutas no cambian nada: un componente lazy se usa como cualquier otro."
    }
  ]
}
```

Cada `lazy` necesita un `<Suspense>` por encima que diga qué enseñar mientras llega su archivo. El de la maquetación cubre todas las páginas; el de `Categorias` hace que, mientras llega el archivo de una hija, la fila de categorías siga a la vista:

```jsx
// En Maquetacion.jsx
<main>
  <Suspense
    fallback={
      <div className="pagina seccion-contenido">
        <MensajeEstado>Cargando la página…</MensajeEstado>
      </div>
    }
  >
    <Outlet />
  </Suspense>
</main>

// En Categorias.jsx
<Suspense fallback={<MensajeEstado>Cargando…</MensajeEstado>}>
  <Outlet />
</Suspense>
```

Ejecuta `npm run build`. Esta es la salida real de la solución:

```text
vite v8.3.5 building client environment for production...
transforming...
✓ 159 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                            0.71 kB │ gzip:  0.44 kB
dist/assets/portada-eT4s7tHp.jpg         438.74 kB
dist/assets/index-B-eEwUAb.css             7.27 kB │ gzip:  2.35 kB
dist/assets/Categoria-CYRkPi4e.js          0.59 kB │ gzip:  0.37 kB
dist/assets/Categorias-DUWDEnsq.js         0.59 kB │ gzip:  0.35 kB
dist/assets/ListaCategorias-CklDxGA4.js    0.60 kB │ gzip:  0.36 kB
dist/assets/Buscar-bUHLnzIZ.js             1.82 kB │ gzip:  0.91 kB
dist/assets/Receta-BdHMPvsI.js             1.83 kB │ gzip:  0.83 kB
dist/assets/index-_-GYkdB4.js            297.01 kB │ gzip: 93.53 kB

✓ built in 101ms
```

Cinco páginas, cinco archivos. Y un dato honesto: con todos los `import` normales, el build daba un solo archivo de 299,96 kB (93,94 kB comprimido). **Aquí el ahorro es mínimo**, porque estas páginas son pequeñas y el grueso es React, React Router y TanStack Query. Lo que te llevas es el patrón: el día que una página arrastre una librería pesada (un editor, un mapa, gráficos), se irá con ella a su archivo sin tocar nada más.

Queda una sorpresa, que tiene que ver con cómo navega React Router:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Estás en la portada y pulsas «Buscar» en el menú.\n// El archivo Buscar-….js tarda 1,5 s en llegar\n// (es la primera vez que lo pides).\n\n<Suspense fallback={<MensajeEstado>Cargando la página…</MensajeEstado>}>\n  <Outlet />\n</Suspense>\n\n// ¿Qué ves durante ese segundo y medio?",
  "opciones": [
    "«Cargando la página…», el fallback de la maquetación",
    "La portada, aunque la URL ya dice /buscar",
    "Una página en blanco hasta que llega el archivo",
    "El buscador sin el campo de texto"
  ],
  "correcta": 1,
  "explicacion": "React Router 8 hace cada navegación dentro de una transición (su BrowserRouter llama a startTransition), y una transición no cambia lo que ya se ve por un fallback: espera a tenerlo todo (lección 51). Comprobado en Chromium retrasando ese archivo 1,5 s. El fallback solo sale cuando no hay nada que conservar: al entrar en /buscar escribiendo la dirección o al recargar."
}
```

## Frente a frente con la versión en JavaScript

### La carrera de respuestas: por qué ya no hace falta el contador

El bug que encontró el proyecto de JavaScript: buscas algo que falla y, antes de que responda, pulsas una categoría; el error de la búsqueda acababa encima de la página de categorías. La causa era que `estado.js` era **uno para toda la aplicación**: cualquier respuesta escribía en el mismo `error` y el mismo `cargando`, y hacían falta un contador por tipo de petición y una etiqueta de origen para saber de quién era cada cosa.

En React, ese trabajo lo hacen **dos mecanismos distintos**, y conviene separarlos. Los tests de `App.test.jsx` comprueban los dos:

- **Al cambiar de página, la respuesta tardía no tiene dónde pintarse.** Cada página lee sus datos en su propio componente, y al salir de `Buscar`, `Buscar` se desmonta. Esto te lo da React por sí solo: una versión ingenua del buscador, con un efecto sin limpieza y un `useState` para los resultados, también supera el test «el error de una búsqueda abandonada no aparece en la página siguiente» (comprobado).
- **En la misma página, lo que lo evita es la clave.** Escribir «tarta» y enseguida «tortilla» deja dos respuestas camino del mismo componente. La versión ingenua falla aquí: la de «tarta», que llega la última, pisa a la de «tortilla». Esta es la salida real de Vitest con esa versión, ya sin colores:

```text
FAIL  src/App.test.jsx > búsqueda > una respuesta que llega tarde no pisa la búsqueda nueva
Error: expect(element).not.toBeInTheDocument()

expected document not to contain element, found <h3>
  Tarta de Santiago
</h3> instead
```

«1 resultado para «tortilla».» encima de la tarjeta de la Tarta de Santiago: el mismo síntoma que en JavaScript. Con `useQuery`, cada búsqueda tiene su entrada y `Resultados` lee la de su `q`, así que el test pasa. Y sigue pasando si quitas la `signal` de `api.js` (comprobado): **la corrección viene de la clave, no de cancelar**, como viste en la lección 78. El test está escrito así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "  it('una respuesta que llega tarde no pisa la búsqueda nueva', async () => {\n    // «tarta» tarda 300 ms en llegar; «tortilla», casi nada.\n    servidor.use(\n      http.get(`${API}/search.php`, async ({ request }) => {\n        const texto = new URL(request.url).searchParams.get('s')\n        if (texto === 'tarta') {\n          await delay(300)\n          return HttpResponse.json({ meals: [{ idMeal: '1', strMeal: 'Tarta de Santiago', strMealThumb: '' }] })\n        }\n        return HttpResponse.json({ meals: [{ idMeal: '3', strMeal: 'Tortilla de patatas', strMealThumb: '' }] })\n      }),\n    )\n    const usuario = userEvent.setup()\n    montar('/buscar')\n    const campo = await screen.findByRole('searchbox', { name: 'Nombre de la receta' }, { timeout: 3000 })\n\n    await usuario.type(campo, 'tarta{Enter}')\n    await usuario.clear(campo)\n    await usuario.type(campo, 'tortilla{Enter}')\n\n    expect(await screen.findByText('1 resultado para «tortilla».')).toBeInTheDocument()\n    await esperar(500) // la respuesta de «tarta» ya habría llegado\n    expect(screen.getByText('1 resultado para «tortilla».')).toBeInTheDocument()\n    expect(screen.queryByRole('heading', { name: 'Tarta de Santiago' })).not.toBeInTheDocument()\n  })",
  "anotaciones": [
    {
      "fragmento": "servidor.use(",
      "nota": "Una TheMealDB de mentira con MSW (lección 84), cambiada solo para este test: «tarta» tarda 300 ms y «tortilla», casi nada. Las dos respuestas llegan al revés de como se pidieron."
    },
    {
      "fragmento": "await usuario.type(campo, 'tarta{Enter}')",
      "nota": "Intro busca sin esperar a los 400 ms del temporizador, así el test no depende de él."
    },
    {
      "fragmento": "await esperar(500) // la respuesta de «tarta» ya habría llegado",
      "nota": "Que «tortilla» aparezca no basta: hay que esperar a que la respuesta vieja tenga ocasión de llegar y comprobar que no ha cambiado nada."
    },
    {
      "fragmento": "expect(screen.queryByRole('heading', { name: 'Tarta de Santiago' })).not.toBeInTheDocument()",
      "nota": "queryBy devuelve null en vez de lanzar si no lo encuentra: es el que se usa para comprobar que algo no está (lección 83)."
    }
  ]
}
```

Cada test monta la aplicación con su propia caché (`retry: false`, para que un error llegue a la primera) y un `MemoryRouter` con la dirección de partida, en vez de `BrowserRouter`: por eso `App.jsx` no incluye el router y `main.jsx` sí. Es el montaje de las lecciones 83 y 84.

### Lo que desaparece y lo que ganas

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Desaparecen los contadores y las etiquetas de origen",
      "texto": "ultimaBusqueda, ultimaReceta y ultimaCategoria, y el origen de cada carga y cada error (busqueda, receta, categoria) con finalizarConExito. Cada consulta tiene su clave, su isPending y su error."
    },
    {
      "titulo": "Desaparecen las banderas para no pedir dos veces",
      "texto": "cargaSolicitada, idSolicitado y categoriaSolicitada, con su queueMicrotask. Dos componentes que piden la misma clave comparten una petición, y una clave con datos frescos no pide nada."
    },
    {
      "titulo": "Desaparece el router entero",
      "texto": "compilarPatron, resolverRuta, manejarClickInterno, el oyente de popstate y los tests de router.test.js. Ya no es código tuyo que probar: lo prueban los autores de React Router."
    },
    {
      "titulo": "Ganas sin escribirlo",
      "texto": "El foco se queda en el buscador mientras escribes. La búsqueda va en la URL: recargas o compartes /buscar?q=curry y sale lo mismo. Atrás vuelve a una búsqueda o a una categoría al instante, desde la caché. Y cada error tiene su botón Reintentar."
    },
    {
      "titulo": "Lo que cuesta",
      "texto": "El JavaScript que descarga el navegador pasa de 13,41 kB (4,50 comprimido) en la versión sin librerías a 297 kB (93,5 comprimido), y unos 220 kB de ellos son React y React DOM, lo que pesa cualquier app de Vite (lección 50). Necesitas un Node más nuevo y tres librerías más que mantener al día. A cambio, el código que escribes baja de 958 líneas a 594, contando comentarios y sin contar los tests."
    }
  ]
}
```

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm test pasa entero?",
      "texto": "Nueve tests: dos de utilidades.js y siete de App.test.jsx (rutas, la búsqueda en la URL y las dos carreras). Si fallan todos de golpe con un TypeError de undici, es tu versión de Node, no tu código."
    },
    {
      "titulo": "¿npm run build saca un archivo por página?",
      "texto": "Busca Buscar-…js, Receta-…js, Categorias-…js, ListaCategorias-…js y Categoria-…js en dist/assets. Si solo hay un index-…js, algún import se ha quedado sin lazy."
    },
    {
      "titulo": "¿Atrás desde una receta vuelve a la búsqueda al instante?",
      "texto": "Abre el panel de TanStack Query (el botón de abajo a la derecha, solo con npm run dev): la clave [\"recetas\",\"busqueda\",\"curry\"] sigue ahí, y en la pestaña Red no sale ninguna petición nueva."
    },
    {
      "titulo": "¿Recargar en /buscar?q=curry o en /categorias/Seafood funciona?",
      "texto": "Con npm run dev y npm run preview, sí: Vite devuelve el index.html en cualquier ruta. En un alojamiento de verdad hay que configurarlo, como viste en las lecciones 76 y 85."
    },
    {
      "titulo": "¿Escribir, pararte y seguir escribiendo funciona?",
      "texto": "Es la secuencia que rompía la versión de JavaScript. Pruébala también escribiendo en medio de una palabra, y cambiando de página antes de que llegue una búsqueda."
    }
  ]
}
```

## Errores típicos

**Controlar el campo con la URL.** Parece la versión más limpia del buscador: un solo dueño, sin estado propio.

```jsx
<input
  value={searchParams.get('q') ?? ''}
  onChange={(e) => setSearchParams({ q: e.target.value }, { replace: true })}
/>
```

Lo medimos en Chromium con el recetario así montado. Escribir « thai» en medio de «chicken curry», a 250 ms por tecla (velocidad de persona), acabó en «chicken  currythai»: tras la primera tecla, el cursor saltó al final. Tres retrocesos en medio dejaron «chicke cur». Y tecleando sin pausa, «chicken curry» se quedó en «hy». La causa es la transición en la que React Router 8 envuelve cada cambio de URL: con `<BrowserRouter useTransitions={false}>` el mismo campo funcionaba bien (también comprobado). react.dev lo dice en la página de `useTransition`: «Transition updates can't be used to control text inputs», es decir, una actualización dentro de una transición no puede controlar un campo de texto. No hace falta React Router para verlo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un campo que se actualiza dentro de una transición",
  "consigna": "En cada campo, pon el cursor justo detrás de «chicken» y escribe « thai». En el primero queda «chicken thai curry». En el segundo, después de la primera tecla, el cursor salta al final. El segundo campo hace lo mismo que uno con value={searchParams.get('q')}: su cambio va dentro de una transición, como cada navegación de React Router 8.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { startTransition, useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [normal, setNormal] = useState('chicken curry')\n  const [enTransicion, setEnTransicion] = useState('chicken curry')\n\n  return (\n    <form className=\"campos\">\n      <label>\n        Con un estado normal\n        <input value={normal} onChange={(e) => setNormal(e.target.value)} />\n      </label>\n      <label>\n        Con el cambio dentro de una transición, como la URL en React Router 8\n        <input\n          value={enTransicion}\n          onChange={(e) => {\n            const valor = e.target.value\n            startTransition(() => setEnTransicion(valor))\n          }}\n        />\n      </label>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n}\n\n.campos {\n  display: grid;\n  gap: 1rem;\n  max-width: 26rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.3rem;\n}\n\ninput {\n  padding: 0.4rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

La solución es la del paso 7: el campo con su estado y la URL detrás. Si lees un código que controla un campo con `searchParams` y funciona, mira qué versión de React Router usa o si lleva `useTransitions={false}`.

**Usar el nombre del ingrediente como `key`.** Parece un buen identificador: dentro de una receta, cada ingrediente sale una vez... o no. Recorrimos TheMealDB entera (790 recetas, con `search.php?f=a` a `f=z`) y **174 repiten algún ingrediente** con el mismo nombre. «Apple & Blackberry Crumble» lleva Butter dos veces, 60g y 30g:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos ingredientes con la misma key",
  "consigna": "Mira la consola: React avisa de dos hermanos con la key «Butter». Cambia la key por el índice (añade indice como segundo parámetro de la función del map y escribe key={indice}) y el aviso desaparece. Aquí vale porque la lista ni cambia de orden ni se edita.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "// Los ingredientes de «Apple & Blackberry Crumble» (TheMealDB, id 52893)\nconst INGREDIENTES = [\n  { ingrediente: 'Plain Flour', medida: '120g' },\n  { ingrediente: 'Caster Sugar', medida: '60g' },\n  { ingrediente: 'Butter', medida: '60g' },\n  { ingrediente: 'Braeburn Apples', medida: '300g' },\n  { ingrediente: 'Butter', medida: '30g' },\n  { ingrediente: 'Demerara Sugar', medida: '30g' },\n  { ingrediente: 'Blackberries', medida: '120g' },\n  { ingrediente: 'Cinnamon', medida: '¼ teaspoon' },\n  { ingrediente: 'Ice Cream', medida: 'to serve' },\n]\n\nexport default function App() {\n  return (\n    <>\n      <h1>Apple &amp; Blackberry Crumble</h1>\n      <ul>\n        {INGREDIENTES.map(({ ingrediente, medida }) => (\n          <li key={ingrediente}>\n            {ingrediente}: {medida}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

El aviso, tal como sale con React 19.3.1:

```text
Encountered two children with the same key, `Butter`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
```

Es decir: hay dos hijos con la misma key, `Butter`; las keys tienen que ser únicas para que cada componente conserve su identidad entre renders, y con keys repetidas puede que algún hijo salga duplicado u omitido. En la lección 11 viste cuándo vale el índice como key: una lista que no se reordena ni cambia, como esta. Con la misma idea, `obtenerDestacadas` quita las recetas repetidas antes de que lleguen a la portada.

**Olvidar `enabled` en la búsqueda.** Nada se rompe a la vista: `Resultados` mira primero si hay `q` y enseña «Escribe un nombre para empezar.». Pero en la pestaña Red, entrar en `/buscar` pide `search.php?s=`, y TheMealDB responde con 25 recetas que nadie ha buscado.

**Dejar la clave sin el parámetro.** Con `queryKey: ['recetas', 'detalle']` en `useReceta`, todas las recetas comparten una entrada: abres una, vuelves y abres otra, y durante los cinco minutos del `staleTime` ves la primera, sin ninguna petición. Es el error número uno de la lección 78.

**Un `<a href>` donde iba un `Link`.** Funciona, pero cada clic recarga la aplicación: la caché de TanStack Query empieza vacía y todo se vuelve a pedir. Si la pestaña Red se llena al navegar entre páginas que ya habías visto, busca un `<a>` suelto.

**Declarar un `lazy` dentro de `App`.** Cada render de `App` crearía otra página con `lazy`, que se volvería a suspender (lección 50). Siempre en lo alto del módulo, como un `import`.

## Retos para ampliarlo

1. **Recetas relacionadas** en la ficha, el segundo reto de la versión de JavaScript: con `useRecetasDeCategoria(receta.strCategory)`, enseña otras cuatro recetas de su categoría, sin la que estás viendo. Como la clave es la misma que la de `/categorias/…`, si ya pasaste por esa categoría saldrán al instante.
2. **Favoritos** en `/favoritos`, el primer reto de la versión de JavaScript: guarda solo los ids en `localStorage` y pide cada receta con `useReceta`. Para que el botón de la ficha y la página de favoritos lean lo mismo, un almacén con `useSyncExternalStore` (lección 46).
3. **Precargar al pasar el ratón** por una tarjeta: `queryClient.prefetchQuery({ queryKey: claves.receta(id), queryFn: … })`, con `useQueryClient`, y la precarga del archivo de `Receta` de la lección 50. En el panel de TanStack Query verás aparecer la entrada antes del clic.
4. **Aprovechar la búsqueda**: `search.php` ya devuelve cada receta completa, así que abrir una desde los resultados no debería esperar a `lookup.php`. Escribe cada resultado en la caché con `queryClient.setQueryData(claves.receta(receta.idMeal), receta)` y comprueba que la ficha sale sin «Cargando la receta…».

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-proyectos/recetario (rama main, punto de partida)",
      "descripcion": "Clona esta rama para hacer el proyecto con los TODO de cada paso.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/main/recetario",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-proyectos/recetario (rama solucion)",
      "descripcion": "El proyecto completo, con sus tests, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/solucion/recetario",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "javascript-proyectos/recetario (rama solucion)",
      "descripcion": "La versión con router propio y estado observable, para ponerla al lado archivo por archivo.",
      "url": "https://github.com/pedroleni/javascript-proyectos/tree/solucion/recetario",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "useTransition",
      "descripcion": "Incluye el apartado «Updating an input in a Transition doesn't work»: por qué una transición no puede controlar un campo y las dos salidas que propone.",
      "url": "https://react.dev/reference/react/useTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Routing",
      "descripcion": "Rutas anidadas, de maquetación e índice y segmentos dinámicos en el modo declarativo, el que usa este proyecto.",
      "url": "https://reactrouter.com/start/declarative/routing",
      "etiqueta": "React Router"
    },
    {
      "titulo": "React Transitions",
      "descripcion": "Cómo usa React Router las transiciones en cada navegación y la opción useTransitions para desactivarlas.",
      "url": "https://reactrouter.com/explanation/react-transitions",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Devtools",
      "descripcion": "El panel de TanStack Query: cómo se instala, sus opciones y por qué no entra en el build de producción.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/devtools",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "TheMealDB API",
      "descripcion": "Las rutas que usa el proyecto (search, lookup, random, categories y filter) y las miniaturas /small, /medium y /large de cada foto.",
      "url": "https://www.themealdb.com/api.php",
      "etiqueta": "API"
    }
  ]
}
```
