# Leer y migrar código: de `react-router-dom` 5, 6 y 7, y de Remix 2, a React Router 8

- **Módulo:** El código que ya existe
- **Slug:** `leer-y-migrar-codigo-de-react-router-dom-5-6-y-7-y-de-remix-2-a-react-router-8` (autogenerado del título)
- **Orden:** 230
- **Fuentes:** [Upgrading from v7](https://reactrouter.com/upgrading/v7) + [Future Changes](https://reactrouter.com/upgrading/future) + [Upgrading from v5 (docs de la 6)](https://reactrouter.com/6.30.3/upgrading/v5) + [Upgrading from v6 (docs de la 7)](https://reactrouter.com/7.18.4/upgrading/v6) + [Upgrading from Remix (docs de la 7)](https://reactrouter.com/7.18.4/upgrading/remix) + [Framework Adoption from Component Routes](https://reactrouter.com/upgrading/component-routes) + [API Development Strategy](https://reactrouter.com/community/api-development-strategy) + [remix.run](https://remix.run/) — ver `contenido/react-router/TEMARIO.md` #23
- **Requiere:** La lección 1 de esta ficha (lo que cambió en la 8), las 2, 9 y 10 para el modo datos y la 14 para el modo framework; de React, las 76, 77 y 99

---

## Qué es y para qué sirve

La lección 1 te dio el dato: casi todo el código de React Router que hay hoy en las empresas es de la 6 o de la 7, y todavía queda algo de la 5. La 8 tiene cuatro meses. Lo normal, cuando llegas a un equipo, no es escribir la 8 desde cero: es **abrir un archivo escrito hace años, saber de qué época es y saber qué hay que cambiar para llevarlo a la 8**.

La web de la **Comparsa de Gigantes y Cabezudos de Pamplona** es un buen ejemplo. Nació en 2019 para anunciar los recorridos de San Fermín, y desde entonces la han tocado varios voluntarios, cada uno con la versión de su momento. La portada y las fichas de las figuras se quedaron en la 5; un año alguien rehízo la ficha con los `loader` de la 6.4; la zona de los porteadores ya es de la 7; y la escuela de gaiteros tiene su tablón de ensayos en Remix 2. Las cuatro épocas en una misma web. No es raro.

En esta lección vas a aprender a:

- **reconocer cada época** por sus `import` y sus componentes, con parejas «antes / después»;
- **saber qué cambia** de cada una a la 8, con los errores reales que da cada versión;
- **seguir el camino de Remix 2** a la 7, con su *codemod*, y de ahí a la 8;
- **distinguir Remix 3**, que no es una actualización de nada;
- **entender las *future flags* y los `unstable_`**, el mecanismo con el que React Router hace que una versión mayor sea aburrida.

La práctica completa, con una app entera y sus tests, es el proyecto 25: migrar de la 6 a la 8 paso a paso. Aquí aprendes a leer; allí, a migrar sin romper nada.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Cómo se comprobó lo que cuenta esta lección",
  "contenido": "La vista previa solo carga React Router 8.5.0, así que el código de la 5, la 6 y la 7 va anotado, no en vivo. Cada fragmento se compiló con TypeScript 6.0.3 contra la versión instalada de verdad (react-router-dom 5.3.4, 6.30.6 y 7.18.4, y react-router 8.5.0, las últimas de cada una el 27 de octubre de 2026), y los errores que ves son los que dieron. El código de la 8, cuando aporta, va en vivo."
}
```

## De la 5 a la 8, en una línea de tiempo

Antes de leer código, sitúate. Estas son las versiones que dejaron huella en el código que te vas a encontrar, con las fechas de npm:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "De la 5 a la 8, y Remix por el camino",
  "items": [
    {
      "fecha": "mar 2019 · 5.0 (5.1 en sep)",
      "titulo": "Switch, component y withRouter",
      "texto": "Las rutas se eligen con <Switch> y pintan un component. Para leer la URL desde cualquier componente, withRouter; la 5.1 añadió los hooks useHistory, useParams y useLocation. Todo se importa de react-router-dom. La última es la 5.3.4, de octubre de 2022."
    },
    {
      "fecha": "nov 2021 · 6.0",
      "titulo": "Routes, element y useNavigate",
      "texto": "<Routes> en lugar de <Switch>, element en lugar de component, useNavigate en lugar de useHistory y <Navigate> en lugar de <Redirect>. Sigue importándose de react-router-dom."
    },
    {
      "fecha": "sep 2022 · 6.4",
      "titulo": "Los routers de datos",
      "texto": "createBrowserRouter y RouterProvider, loader, action, <Form> y useFetcher: el modo datos. Los loader devuelven con json() y lo que puede esperar, con defer()."
    },
    {
      "fecha": "sep 2023 · Remix 2.0",
      "titulo": "El framework de los mismos autores",
      "texto": "Remix 2 funciona encima de React Router 6: @remix-run/react 2.17.5 depende de react-router-dom 6.30.4. Prepara su siguiente versión con flags v3_."
    },
    {
      "fecha": "nov 2024 · 7.0",
      "titulo": "React Router y Remix, juntos",
      "texto": "La 7 es la continuación de Remix 2: nace el modo framework con @react-router/dev. Desaparecen json y defer: se devuelven objetos y promesas tal cual. react-router-dom pasa a ser un paquete que reexporta react-router."
    },
    {
      "fecha": "sep 2025 · 7.9",
      "titulo": "Middleware estable",
      "texto": "El middleware, createContext y RouterContextProvider pierden el prefijo unstable_. En modo framework hay que activarlo con la flag v8_middleware."
    },
    {
      "fecha": "jun 2026 · 8.0",
      "titulo": "Sin react-router-dom",
      "texto": "Todo de react-router, salvo RouterProvider y HydratedRouter, de react-router/dom. Middleware siempre activo, solo ESM, Node 22.22 y React 19.2.7. Es la tabla de la lección 1."
    },
    {
      "fecha": "oct 2026 · Remix 3.0 y 8.5",
      "titulo": "Dos caminos distintos",
      "texto": "Remix 3.0.0 sale el 1 de octubre, y es otro framework, sin React. React Router 8.5.0, el 19 de octubre."
    }
  ]
}
```

Y estas son las pistas que te dicen la época de un archivo sin abrir el `package.json`:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "La 5",
      "texto": "<Switch>, <Redirect>, useHistory, withRouter, useRouteMatch, y Route con exact, component o render. Todo de react-router-dom."
    },
    {
      "titulo": "La 6 sin modo datos",
      "texto": "<Routes> con <Route element={...}>, useNavigate y <Navigate>, todo de react-router-dom. Una 7 que nadie ha tocado es idéntica: la 7 sigue publicando react-router-dom, que reexporta react-router."
    },
    {
      "titulo": "La 6.4 a la 6.30",
      "texto": "createBrowserRouter y RouterProvider de react-router-dom, y loader que devuelven json() o defer(). Un useLoaderData() as Algo, sin genérico, también huele a esa época."
    },
    {
      "titulo": "La 7",
      "texto": "import de react-router, data() en lugar de json(), y flags v8_ en future, o un declare module que amplía la interfaz Future."
    },
    {
      "titulo": "Remix 2",
      "texto": "import de @remix-run/react y @remix-run/node, RemixBrowser en entry.client, el plugin remix() en vite.config.ts y flags v3_."
    },
    {
      "titulo": "La 8",
      "texto": "import de react-router y react-router/dom, middleware sin activar nada, y ninguna flag v8_. Una 7 con todas sus flags activadas se parece tanto que solo la distingue npm ls react-router, como contó la lección 1."
    }
  ]
}
```

## La 5: `<Switch>`, `useHistory` y `withRouter`

La portada y las fichas de la comparsa son de 2019. Es código de la 5.1, con sus hooks recién estrenados y algún resto de antes, como `withRouter`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { BrowserRouter, Link, Redirect, Route, Switch, useHistory, useParams, withRouter } from 'react-router-dom'\nimport type { RouteComponentProps } from 'react-router-dom'\n\nfunction Portada() {\n  return <h1>Gigantes y Cabezudos de Pamplona</h1>\n}\n\nfunction Figura() {\n  const { id } = useParams<{ id: string }>()\n  const history = useHistory()\n  return (\n    <section>\n      <h2>Figura: {id}</h2>\n      <button onClick={() => history.push('/recorrido')}>Ver el recorrido</button>\n    </section>\n  )\n}\n\nfunction Recorrido() {\n  return <h2>Recorrido de mañana</h2>\n}\n\nfunction CabeceraBase({ location }: RouteComponentProps) {\n  return <p>Estás en {location.pathname}</p>\n}\nconst Cabecera = withRouter(CabeceraBase)\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Cabecera />\n      <nav>\n        <Link to=\"/figuras/caravinagre\">Caravinagre</Link>\n      </nav>\n      <Switch>\n        <Route exact path=\"/\" component={Portada} />\n        <Route path=\"/figuras/:id\" component={Figura} />\n        <Route path=\"/recorrido\" component={Recorrido} />\n        <Redirect from=\"/kilikis\" to=\"/\" />\n      </Switch>\n    </BrowserRouter>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "withRouter(CabeceraBase)",
      "nota": "Un componente de orden superior: envuelve a CabeceraBase y le pasa por props history, location y match. Era la forma de leer la URL antes de los hooks. En la 6 desapareció: hoy es useLocation dentro del componente."
    },
    {
      "fragmento": "useHistory()",
      "nota": "El hook de la 5.1 para navegar desde código: history.push y history.replace. En la 6 lo sustituye useNavigate, que devuelve una función: navigate(ruta) o navigate(ruta, { replace: true })."
    },
    {
      "fragmento": "<Switch>",
      "nota": "Recorre sus rutas en orden y pinta la primera que encaja. Por eso importaba el orden, y por eso existía exact. La 6 lo cambió por Routes, que elige la mejor coincidencia sin importar el orden."
    },
    {
      "fragmento": "<Route exact path=\"/\" component={Portada} />",
      "nota": "Sin exact, la ruta / encajaba con cualquier URL que empezara por /. En la 6 y en la 8 las rutas encajan enteras por defecto; para decir «esta y todo lo que cuelga» se escribe path=\"figuras/*\"."
    },
    {
      "fragmento": "component={Figura}",
      "nota": "La 5 recibía el componente y lo creaba ella. Desde la 6 se le da el elemento ya creado, element={<Figura />}, y así le puedes pasar props. Desde la 6.4 también vale Component={Figura}, con mayúscula."
    },
    {
      "fragmento": "<Redirect from=\"/kilikis\" to=\"/\" />",
      "nota": "Dentro de un Switch, redirige de una ruta a otra. Ojo: Redirect sustituye la entrada del historial por defecto, y su sucesor, Navigate, la añade. Lo verás ahora mismo."
    },
    {
      "fragmento": "useParams<{ id: string }>()",
      "nota": "En la 5, el genérico decía la forma de los parámetros y te creías que id era string. En la 6 y en la 8, useParams() da cada parámetro como string | undefined."
    }
  ]
}
```

Instala la 6, compila este archivo y TypeScript te enseña el mapa de lo que hay que cambiar:

```text
src/epoca5.tsx(1,31): error TS2724: '"react-router-dom"' has no exported member named 'Redirect'. Did you mean 'redirect'?
src/epoca5.tsx(1,48): error TS2305: Module '"react-router-dom"' has no exported member 'Switch'.
src/epoca5.tsx(1,56): error TS2305: Module '"react-router-dom"' has no exported member 'useHistory'.
src/epoca5.tsx(1,79): error TS2305: Module '"react-router-dom"' has no exported member 'withRouter'.
src/epoca5.tsx(2,15): error TS2305: Module '"react-router-dom"' has no exported member 'RouteComponentProps'.
src/epoca5.tsx(36,16): error TS2322: Type '{ exact: true; path: string; component: () => Element; }' is not assignable to type 'IntrinsicAttributes & RouteProps'.
  Property 'exact' does not exist on type 'IntrinsicAttributes & RouteProps'.
src/epoca5.tsx(37,36): error TS2322: Type '{ path: string; component: () => Element; }' is not assignable to type 'IntrinsicAttributes & RouteProps'.
  Property 'component' does not exist on type 'IntrinsicAttributes & RouteProps'. Did you mean 'Component'?
```

Es decir: `react-router-dom` 6 ya no exporta `Switch`, `useHistory`, `withRouter` ni `RouteComponentProps`, y `Route` no conoce `exact` ni `component`. En la 8 el error es más corto, porque el paquete ni siquiera existe:

```text
src/epoca5.tsx(1,97): error TS2307: Cannot find module 'react-router-dom' or its corresponding type declarations.
```

Fíjate en la primera línea de la 6. TypeScript busca un nombre parecido y te sugiere uno. ¿Le haces caso?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// TypeScript, con la 6:\n//   '\"react-router-dom\"' has no exported member named 'Redirect'.\n//   Did you mean 'redirect'?\n//\n// En la 5 tenías, dentro del <Switch>:\n<Redirect from=\"/kilikis\" to=\"/\" />\n\n// ¿Qué escribes ahora, dentro de <Routes>?",
  "opciones": [
    "<Route path=\"/kilikis\" element={redirect('/')} />, como sugiere TypeScript",
    "<Route path=\"/kilikis\" element={<Navigate to=\"/\" replace />} />",
    "<Route path=\"/kilikis\" element={<Navigate to=\"/\" />} />",
    "Nada: Routes ya no deja entrar en /kilikis"
  ],
  "correcta": 1,
  "explicacion": "redirect es otra cosa: una función para los loader y las action, que devuelve una Response. Como elemento, TypeScript se queja: Type Response is not assignable to type ReactNode. El sucesor de Redirect es el componente Navigate, y con replace, porque Redirect sustituía la entrada del historial y Navigate, sin replace, la añade. Lo avisa la guía oficial para salir de la 5."
}
```

**Las sugerencias de TypeScript buscan nombres parecidos, no equivalentes.** La segunda, `Did you mean 'Component'?`, sí acierta: desde la 6.4, `Component={Figura}` es válido. La primera te llevaría a meter una `Response` donde va un elemento.

Esta es la misma web, en la 8. Navega con los enlaces y fíjate en la barra: «Kilikis» te deja en `/`, y el botón de la ficha te lleva al recorrido. Como en las demás lecciones, `BrowserRouter` usa en la vista previa un historial en memoria, y la barra lo avisa.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La web de la comparsa, de la 5 a la 8",
  "lenguaje": "tsx",
  "codigo": "import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router'\n\nfunction Portada() {\n  return <h1>Gigantes y Cabezudos de Pamplona</h1>\n}\n\nfunction Figura() {\n  const { id } = useParams()\n  const navigate = useNavigate()\n  return (\n    <section>\n      <h2>Figura: {id}</h2>\n      <button onClick={() => navigate('/recorrido')}>Ver el recorrido</button>\n    </section>\n  )\n}\n\nfunction Recorrido() {\n  return <h2>Recorrido de mañana</h2>\n}\n\nfunction Cabecera() {\n  const location = useLocation()\n  return <p>Estás en {location.pathname}</p>\n}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Cabecera />\n      <nav>\n        <Link to=\"/figuras/caravinagre\">Caravinagre</Link> · <Link to=\"/kilikis\">Kilikis</Link>\n      </nav>\n      <Routes>\n        <Route path=\"/\" element={<Portada />} />\n        <Route path=\"/figuras/:id\" element={<Figura />} />\n        <Route path=\"/recorrido\" element={<Recorrido />} />\n        <Route path=\"/kilikis\" element={<Navigate to=\"/\" replace />} />\n      </Routes>\n    </BrowserRouter>\n  )\n}",
  "urlInicial": "/",
  "anotaciones": [
    {
      "fragmento": "from 'react-router'",
      "nota": "En la 8, todo de react-router. Si te quedas en la 6, este mismo archivo, con react-router-dom en el import, compila sin errores con la 6.30.6: por eso la 6 es el paso intermedio natural."
    },
    {
      "fragmento": "function Cabecera() {",
      "nota": "Adiós a withRouter: el componente lee la ubicación con useLocation, como cualquier otro hook."
    },
    {
      "fragmento": "const navigate = useNavigate()",
      "nota": "navigate es una función, no un objeto history: navigate(ruta), navigate(ruta, { replace: true }) o navigate(-1) para ir atrás."
    },
    {
      "fragmento": "<Routes>",
      "nota": "Sin exact y sin importar el orden: Routes elige la ruta que mejor encaja."
    },
    {
      "fragmento": "element={<Figura />}",
      "nota": "El elemento ya creado. Si Figura necesitara una prop, se la pasas aquí, sin inventos como el render de la 5."
    },
    {
      "fragmento": "<Navigate to=\"/\" replace />",
      "nota": "Pulsa Kilikis: la barra se queda en /. Con replace, la entrada /kilikis no se queda en el historial, como pasaba con Redirect."
    }
  ]
}
```

Esta app es pequeña y se cambia de una vez. Para una grande, la guía oficial recomienda un paquete de compatibilidad, `react-router-dom-v5-compat` (su última versión es la 6.30.6), que deja convivir la 5 y la 6 en la misma app y migrar componente a componente. Y antes de la 6, la guía pide subir a la 5.1 y cambiar `withRouter` por hooks: así el salto se reparte en pasos pequeños.

## La 6: `<Routes>`, `element` y `react-router-dom`

Si el archivo ya usa `<Routes>` y `element`, estás en la 6 (o en una 7 que nadie ha tocado). Y aquí está la buena noticia: **el modo declarativo apenas cambió de la 6 a la 8**. El proyecto 25 lo comprueba con una app real: tras pasar por la 7 y cambiar los `import`, sus 35 tests siguen en verde en la 8 sin tocar ni una línea más.

Lo que sí trae la 6 son sus *future flags*, con nombres que empiezan por `v7_` porque anuncian la 7. La guía para salir de la 6 enumera seis: `v7_relativeSplatPath` y `v7_startTransition`, que valen para cualquier app, y `v7_fetcherPersist`, `v7_normalizeFormMethod`, `v7_partialHydration` y `v7_skipActionErrorRevalidation`, que solo tocan al modo datos. Si ves `future={{ v7_startTransition: true }}` en un `<BrowserRouter>`, alguien estaba preparando el salto a la 7. El proyecto 25 las activa una a una, con los avisos que da la 6.30.6 y un fallo que los tests no ven.

## La 6.4: el modo datos con `json()` y `defer()`

La ficha de cada figura la rehízo alguien en 2023 con lo que acababa de traer la 6.4: un `loader` por ruta. Lo crítico (la figura) se espera; lo que puede esperar (sus salidas de este año) llega después, como en la lección 9. Pero escrito como se escribía entonces:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { Suspense } from 'react'\nimport { Await, defer, isRouteErrorResponse, json, Outlet, useLoaderData, useRouteError } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { createBrowserRouter, Link, RouterProvider } from 'react-router-dom'\n\n// …\n\nasync function cargarFiguras() {\n  const res = await fetch('/api/figuras')\n  const figuras: Figura[] = await res.json()\n  return json({ figuras })\n}\n\nasync function cargarFigura({ params }: LoaderFunctionArgs) {\n  const res = await fetch(`/api/figuras/${params.id}`)\n  if (res.status === 404) throw json('No existe esa figura', { status: 404 })\n  const figura: Figura = await res.json()\n  // Lo que puede esperar: las salidas de este año, sin await\n  const salidas: Promise<Salidas> = fetch(`/api/salidas/${params.id}`).then((r) => r.json())\n  return defer({ figura, salidas })\n}\n\n// …\n\nfunction Ficha() {\n  const { figura, salidas } = useLoaderData() as { figura: Figura; salidas: Promise<Salidas> }\n  return (\n    <article>\n      <h1>{figura.nombre}</h1>\n      <Suspense fallback={<p>Buscando sus salidas…</p>}>\n        <Await resolve={salidas}>{(s: Salidas) => <p>{s.dias.length} salidas este año</p>}</Await>",
  "anotaciones": [
    {
      "fragmento": "json, Outlet",
      "nota": "json(valor) creaba una Response con el valor en JSON y la cabecera Content-Type. La 6.30.6 ya lo marca como obsoleto: deprecated in favor of returning raw objects. This method will be removed in v7."
    },
    {
      "fragmento": "throw json('No existe esa figura', { status: 404 })",
      "nota": "Lanzar una respuesta con su estado para que la recoja el errorElement. En la 7 y en la 8 es throw data(valor, { status: 404 }), que existe desde la 7."
    },
    {
      "fragmento": "return defer({ figura, salidas })",
      "nota": "defer marcaba qué valores eran promesas que el router no tenía que esperar. Desde la 7 basta con devolver el objeto con la promesa dentro: la lección 9 cuenta por qué una promesa suelta, sin objeto, sí se espera."
    },
    {
      "fragmento": "useLoaderData() as { figura: Figura; salidas: Promise<Salidas> }",
      "nota": "Sin genérico, useLoaderData devolvía unknown y había que afirmar el tipo a mano, con as. Hoy, useLoaderData<typeof cargarFigura>() lo infiere de lo que devuelve el loader."
    },
    {
      "fragmento": "(s: Salidas)",
      "nota": "Con el as de arriba, también había que tipar a mano el valor de Await. En la 8 lo infiere."
    },
    {
      "fragmento": "import { createBrowserRouter, Link, RouterProvider } from 'react-router-dom'",
      "nota": "Dos paquetes en el mismo archivo, algo muy común en la 6: react-router-dom dependía de react-router, el editor autocompletaba de los dos, y los hooks, json y defer existían en ambos. Lo que tocaba el DOM, como createBrowserRouter y Link, solo estaba en react-router-dom."
    }
  ]
}
```

Este archivo compila con la 6.30.6. Con la 7.18.4 ya no:

```text
src/ejercicio-inicial.tsx(2,17): error TS2305: Module '"react-router"' has no exported member 'defer'.
src/ejercicio-inicial.tsx(2,46): error TS2305: Module '"react-router"' has no exported member 'json'.
```

Con la 8.5.0, a esos dos se suma el del paquete que ya no existe:

```text
src/ejercicio-inicial.tsx(4,59): error TS2307: Cannot find module 'react-router-dom' or its corresponding type declarations.
```

Y si nadie compila los tipos, el fallo sale al ejecutar. Esto es lo que dice Node con la 7.18.4 instalada:

```text
import { json } from 'react-router-dom'; console.log(json)
         ^^^^
SyntaxError: The requested module 'react-router-dom' does not provide an export named 'json'
```

Es decir: «el módulo `react-router-dom` no exporta nada llamado `json`». La guía de la 7 habla de `json` y `defer` como *deprecated*, pero en la práctica **ya no están desde la 7.0.0**: lo comprobamos instalando esa versión, y su changelog lo dice con todas las letras (*«Remove the deprecated `json` utility»*).

Para llevar este archivo a la 8, cinco cambios:

1. **Los `import`**: todo de `react-router`, y `RouterProvider` de `react-router/dom`.
2. **`return json(valor)`** pasa a **`return valor`**. Si necesitabas el estado o las cabeceras, `data(valor, init)`; si querías una `Response` de verdad, `Response.json()`, como dice la guía.
3. **`throw json(…, { status })`** pasa a **`throw data(…, { status })`**.
4. **`defer({ … })`** pasa a **`{ … }`**: el objeto con sus promesas dentro.
5. **`useLoaderData() as T`** pasa a **`useLoaderData<typeof loader>()`**, y te sobran los tipos a mano.

Lo harás tú en vivo en los ejercicios. Un detalle más, por si ves `import { RouterProvider } from 'react-router'` en código de la 7 o de la 8: compila, porque `react-router` también lo exporta, pero no es el mismo. El de `react-router/dom` es ese mismo componente con el `flushSync` de `react-dom` ya puesto (lo comprobamos en el código de la 8.5.0). La guía de la 7 reserva el de `react-router` para entornos sin DOM, como los tests de Jest.

## La 7: sin `json` ni `defer`, y con *future flags*

La zona de los porteadores es de 2025, con la 7.9 recién salida y su middleware estable (lección 10). Cada porteador ve sus turnos de la semana:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { createRoot } from 'react-dom/client'\nimport { createBrowserRouter, createContext, data, useLoaderData } from 'react-router'\nimport type { LoaderFunctionArgs, MiddlewareFunction } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\ndeclare module 'react-router' {\n  interface Future {\n    v8_middleware: true\n  }\n}\n\ntype Turno = { figura: string; dia: string; hora: string }\nconst porteadorContext = createContext<string | null>(null)\n\nconst leerPorteador: MiddlewareFunction = async ({ context }, next) => {\n  context.set(porteadorContext, sessionStorage.getItem('porteador'))\n  await next()\n}\n\nasync function cargarTurnos({ context }: LoaderFunctionArgs) {\n  const porteador = context.get(porteadorContext)\n  if (!porteador) throw data('Entra con tu usuario', { status: 401 })\n  const res = await fetch(`/api/turnos?q=${encodeURIComponent(porteador)}`)\n  const turnos: Turno[] = await res.json()\n  return { porteador, turnos }\n}\n\nfunction Turnos() {\n  const { porteador, turnos } = useLoaderData<typeof cargarTurnos>()\n  return (\n    <section>\n      <h1>Turnos de {porteador}</h1>\n      <ul>\n        {turnos.map((t) => (\n          <li key={t.dia + t.hora}>\n            {t.figura}: {t.dia}, {t.hora}\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nconst router = createBrowserRouter(\n  [{ path: '/porteadores', middleware: [leerPorteador], loader: cargarTurnos, Component: Turnos }],\n  { future: { v8_middleware: true } },\n)\n\ncreateRoot(document.getElementById('root')!).render(<RouterProvider router={router} />)",
  "anotaciones": [
    {
      "fragmento": "from 'react-router'",
      "nota": "En la 7 ya se puede importar todo de react-router. Pero un archivo de la 7 también puede traer react-router-dom: en la 7.18.4 ese paquete reexporta lo mismo que react-router y añade HydratedRouter."
    },
    {
      "fragmento": "interface Future {\n    v8_middleware: true\n  }",
      "nota": "Un aumento de módulo (lección 15) que le dice a TypeScript que usas middleware. Sin él, en la 7, el context de loader y action es any y aceptas cualquier cosa sin aviso; con él, es Readonly<RouterContextProvider>. En la 8 ya lo es sin nada, y este bloque sobra, aunque no da error."
    },
    {
      "fragmento": "createContext<string | null>(null)",
      "nota": "Sin el prefijo unstable_ desde la 7.9. Si ves unstable_createContext o unstable_RouterContextProvider, el código es de entre la 7.3 y la 7.8."
    },
    {
      "fragmento": "middleware: [leerPorteador]",
      "nota": "Antes de la 7.9 era unstable_middleware. En modo datos, el middleware se ejecuta solo con ponerlo en la ruta."
    },
    {
      "fragmento": "throw data('Entra con tu usuario', { status: 401 })",
      "nota": "data() existe desde la 7: sustituye a json() cuando necesitas un estado o unas cabeceras."
    },
    {
      "fragmento": "{ future: { v8_middleware: true } }",
      "nota": "Lo que pide la guía para pasar a la 8, en modo datos. Pero en la 7.18.4 no hace nada: el middleware ya se ejecutaba sin la flag. Y la 7 no se queja porque, para el router de datos, el tipo de future es una interfaz vacía. La 8 sí."
    }
  ]
}
```

Esa última anotación tiene trampa. ¿Qué pasa en la 7.18.4 si quitas la flag del `createBrowserRouter`?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// React Router 7.18.4, modo datos, SIN future.v8_middleware\nconst router = createMemoryRouter(\n  [\n    {\n      path: '/porteadores',\n      middleware: [\n        async ({ context }, next) => {\n          console.log('middleware')\n          context.set(porteadorContext, 'Ane')\n          await next()\n        },\n      ],\n      loader: ({ context }) => {\n        console.log('loader', context.constructor.name)\n        return context.get(porteadorContext)\n      },\n    },\n  ],\n  { initialEntries: ['/porteadores'] },\n)\n// ¿Qué sale en la consola?",
  "opciones": [
    "Solo «loader undefined»: sin la flag, el middleware se ignora y context no existe",
    "«middleware» y «loader RouterContextProvider», y el loader devuelve Ane",
    "Un error al crear el router: middleware necesita la flag",
    "Solo «loader Object»: el middleware se ignora y context es un objeto vacío"
  ],
  "correcta": 1,
  "explicacion": "En modo datos, la flag no cambia nada desde la 7.8.2. Su changelog lo explica: en modo datos el middleware es una propiedad nueva de la ruta, así que no hay ningún comportamiento que proteger con una flag. Lo ejecutamos en Node con la 7.18.4, con la flag y sin ella: la misma salida. Lo único que cambia en la 7 sin el aumento de Future es el tipo de context, que es any."
}
```

**En modo datos, la flag `v8_middleware` solo importa a los tipos; en modo framework, sí cambia el comportamiento.** En el código de la 7.18.4, la flag la leen el servidor del framework (que construye el `context` de cada petición) y `createRoutesStub` (lección 21), no el router de datos.

¿Y en la 8? Ahí el tipo de `future` ya no está vacío, y la flag que antes se ignoraba sin decir nada ahora no compila:

```text
src/epoca7.tsx(46,15): error TS2353: Object literal may only specify known properties, and 'v8_middleware' does not exist in type 'Partial<FutureConfig>'.
```

Es decir: «en `future` solo puedes poner las propiedades que existen, y `v8_middleware` no es una de ellas». Para llevar este archivo a la 8, quita el `future` del `createBrowserRouter` y el bloque `declare module`. El resto no cambia: lo comprobamos compilándolo con la 8.5.0.

Estas son las *future flags* de la última 7, según la guía para pasar a la 8. Todas son del modo framework y van en `react-router.config.ts`, salvo `v8_middleware`, que la guía pone también en el modo datos:

- **`v8_middleware`**: el middleware y el `context` como `RouterContextProvider`.
- **`v8_splitRouteModules`**: parte el `clientLoader`, el `clientAction` y compañía en trozos propios (lección 16).
- **`v8_viteEnvironmentApi`**: la API de entornos de Vite. Pide Vite 6 o superior, y la 8 pide Vite 7.
- **`v8_passThroughRequests`**: el `request` llega tal cual, con su `.data`; la URL normalizada pasa a un argumento `url`.
- **`v8_trailingSlashAwareDataRequests`**: las peticiones `.data` respetan la barra final.

Y tres cambios sin flag que se pueden hacer en la 7: `data` pasa a `loaderData` en `meta` y en `useMatches()`; el proxy de Cloudflare deja paso a `@cloudflare/vite-plugin`, y el adaptador de Architect cambia de cabecera.

## La 8: cómo sabes que ya estás

Lo que trajo la 8 está en la tabla de la lección 1, y no se repite aquí. Para leer código, lo que importa es esto: **una 7 con todas sus flags activadas y una 8 se escriben igual**. Esa es la promesa de una versión mayor «aburrida», y por eso a veces solo el `package.json` te saca de dudas. Esto es lo que pide la 8.5.0:

```bash
npm view react-router@8.5.0 engines peerDependencies type
```

```text
engines = { node: '>=22.22.0' }
peerDependencies = {
  react: '>=19.2.7',
  'react-dom': '>=19.2.7',
  '@types/react': '>=19.2.0',
  '@types/react-dom': '>=19.2.0'
}
type = 'module'
```

Y lo que pedía la 7.18.4, para comparar:

```text
engines = { node: '>=20.0.0' }
peerDependencies = { react: '>=18', 'react-dom': '>=18' }
```

Tres pistas: Node 22.22 frente a Node 20; React 19.2.7 frente a React 18, y `type = 'module'`, porque la 8 solo se publica como ESM. Tres de esas dependencias, `react-dom`, `@types/react` y `@types/react-dom`, van marcadas como opcionales en `peerDependenciesMeta`: si faltan, npm no se queja.

## Cómo funcionan las *future flags* y los `unstable_`

Has visto flags con tres prefijos y APIs con un cuarto. Detrás hay una sola regla, la que cuenta la página [API Development Strategy](https://reactrouter.com/community/api-development-strategy):

```text
When an API changes in a breaking way, it is introduced in a future flag. This allows you to opt-in to one change a time before it becomes the default in the next major version.
- Without enabling the future flag, nothing changes about your app
- Enabling the flag changes the behavior for that feature
```

Es decir: **cada cambio que rompe algo llega antes detrás de una flag**. Si no la activas, tu app no cambia; si la activas, adoptas ya el comportamiento de la siguiente versión mayor, uno a uno y cuando tú quieres. El nombre de la flag dice adónde va:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los prefijos que te vas a encontrar",
  "roles": [
    {
      "etiqueta": "v7_… (en la 6)",
      "rol": "Future flag: lo que será normal en la 7",
      "descripcion": "v7_startTransition, v7_relativeSplatPath, v7_fetcherPersist… En la 7 dejan de existir: si las dejas, el future de BrowserRouter no compila (proyecto 25)."
    },
    {
      "etiqueta": "v8_… (en la 7)",
      "rol": "Future flag: lo que será normal en la 8",
      "descripcion": "v8_middleware, v8_splitRouteModules… En la 8 dejan de existir, y el framework se niega a arrancar si siguen en la configuración."
    },
    {
      "etiqueta": "v3_… (en Remix 2)",
      "rol": "Future flag: lo que sería Remix 3",
      "descripcion": "v3_singleFetch, v3_routeConfig… Remix 3 iba a ser la siguiente versión de Remix 2. Esa versión acabó llamándose React Router 7, y las flags se quedaron con el nombre."
    },
    {
      "etiqueta": "unstable_…",
      "rol": "Experimental: no es para producción",
      "descripcion": "Puede cambiar o desaparecer en cualquier versión, incluso en un parche, sin guía para migrar. Cuando se estabiliza, pierde el prefijo o se convierte en una future flag."
    }
  ]
}
```

Sobre las `unstable_`, la misma página es tajante: *«they will change without warning and without upgrade paths»*, *«they will have bugs»*, *«they aren't documented»* y *«they may be scrapped completely»*. Y añade: *«When you opt-in to an unstable flag you are becoming a contributor to the project, rather than a user»*. Es decir: si usas una, ya no eres un usuario, eres alguien que ayuda a probarla. Por eso salen en versiones de parche: no son API estable.

El middleware recorrió el camino entero, y su rastro está en el changelog de la 7:

1. **7.3.0** (marzo de 2025): *«Support middleware on routes (unstable)»*. Se escribe `unstable_middleware` y se activa con `future.unstable_middleware`.
2. **7.8.2** (agosto de 2025): el modo datos deja de necesitar la flag.
3. **7.9.0** (septiembre de 2025): *«Stabilize middleware and context APIs»*. `createContext` y `RouterContextProvider` pierden el `unstable_`, y la flag del framework pasa a llamarse `v8_middleware` (lo comprobamos en el paquete `@react-router/dev` de la 7.8.2 y de la 7.9.0). Ya no es experimental: es lo que será normal en la 8.
4. **8.0.0** (junio de 2026): siempre activo, sin flag.

Así que, al leer código, **el prefijo te fecha el archivo**: `unstable_middleware` es de entre la 7.3 y la 7.8; `v8_middleware`, de la 7.9 en adelante; nada, de la 8.

¿Y en la 8? Su guía de cambios futuros (*Future Changes*) dice hoy *«No future flags yet»*: todavía no hay ninguna `v9_`. Sí hay flags inestables, como `future.unstable_routePatternMatching`, y exportaciones como `unstable_usePrompt` o `unstable_HistoryRouter`. Lo único anunciado de la 9 es el mínimo de Node: 24. Y un cuarto prefijo, `UNSAFE_`, marca piezas internas que la 8.5.0 exporta, como `UNSAFE_DataRouterContext` o `UNSAFE_createRouter`: si las ves en una app, alguien se ha atado a las tripas del router.

## De Remix 2 a la 7, con su *codemod*, y de ahí a la 8

La escuela de gaiteros de la comparsa tiene su tablón de ensayos en Remix 2. La guía de la 7 lo dice sin rodeos: *«React Router v7 is the next major version of Remix after v2»*. Es decir, **Remix 2 no se actualiza a Remix 3: se actualiza a React Router 7**, y de ahí a la 8.

Para comprobarlo de verdad, montamos un tablón mínimo con Remix 2.17.5 (la última) y lo llevamos hasta la 8.5.0. Estos son los pasos, y lo que pasó en cada uno.

### 1. Las flags `v3_`, todavía en Remix 2

Remix 2.17.5 tiene seis flags `v3_` en su tipo `FutureConfig`: `v3_fetcherPersist`, `v3_relativeSplatPath`, `v3_throwAbortReason`, `v3_routeConfig`, `v3_singleFetch` y `v3_lazyRouteDiscovery`. La guía pide activarlas todas antes de nada. El tablón tenía cinco:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { vitePlugin as remix } from '@remix-run/dev'\nimport { defineConfig } from 'vite'\n\ndeclare module '@remix-run/node' {\n  interface Future {\n    v3_singleFetch: true\n  }\n}\n\nexport default defineConfig({\n  plugins: [\n    remix({\n      future: {\n        v3_fetcherPersist: true,\n        v3_relativeSplatPath: true,\n        v3_throwAbortReason: true,\n        v3_singleFetch: true,\n        v3_lazyRouteDiscovery: true,\n      },\n    }),\n  ],\n})",
  "anotaciones": [
    {
      "fragmento": "import { vitePlugin as remix } from '@remix-run/dev'",
      "nota": "El plugin de Vite de Remix 2. Es la pista más rápida para saber que estás ante Remix 2 y no ante el modo framework de la 7."
    },
    {
      "fragmento": "v3_singleFetch: true",
      "nota": "La más importante: una sola petición por navegación, y loader que devuelven objetos tal cual en lugar de json(). Con ella activada, el json de Remix 2.17.5 dice en sus tipos que está obsoleto: This method will be removed in React Router v7."
    },
    {
      "fragmento": "declare module '@remix-run/node' {",
      "nota": "Single Fetch también pedía este aumento de tipos. Recuerda este bloque: el codemod no lo toca."
    },
    {
      "fragmento": "v3_lazyRouteDiscovery: true",
      "nota": "El navegador descubre las rutas a medida que las necesita, en lugar de descargarse el mapa entero al principio (lección 16)."
    }
  ]
}
```

### 2. El *codemod*

La guía remite a un *codemod*, un programa que reescribe tu código, hecho por un miembro de la comunidad:

```bash
npx codemod remix/2/react-router/upgrade
```

Lo ejecutamos con `codemod` 1.18.6, la última de la CLI. Lo primero que dijo fue esto:

```text
⚠️ Package remix/2/react-router/upgrade is legacy
```

Es decir, el registro lo marca como heredado. Funcionó igual, y este es el resumen de lo que cambió (salida de `diff -ru`, recortada):

```text
-import { RemixBrowser } from '@remix-run/react'
+import { HydratedRouter } from 'react-router/dom';
-      <RemixBrowser />
+      <HydratedRouter />

-import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
-import { Form, useLoaderData } from '@remix-run/react'
+import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
+import { Form, useLoaderData } from 'react-router';

-    "build": "remix vite:build",
-    "dev": "remix vite:dev",
+    "build": "react-router build",
+    "dev": "react-router dev",
-    "typecheck": "tsc"
+    "typecheck": "react-router typegen && tsc"
-    "@remix-run/node": "2.17.5",
-    "@remix-run/react": "2.17.5",
+    "@react-router/node": "^7.0.0",
+    "react-router": "^7.0.0"

-import { vitePlugin as remix } from '@remix-run/dev'
+import { reactRouter } from '@react-router/dev/vite';
-    remix({
+    reactRouter({
```

Cambió los paquetes y los `import`, los *scripts* y los componentes de las entradas. Con `^7.0.0`, `npm install` instala la 7.18.4. Pero **no terminó el trabajo**. `npm run typecheck` se para al principio, porque no hay `app/routes.ts`:

```text
Error: Route config file not found at "app/routes.ts".
```

Y `tsc`, a solas, encuentra todo lo demás:

```text
app/routes/ensayos.$id.tsx(1,10): error TS2305: Module '"react-router"' has no exported member 'json'.
app/routes/ensayos.$id.tsx(18,11): error TS2339: Property 'ensayo' does not exist on type 'undefined'.
vite.config.ts(4,16): error TS2664: Invalid module name in augmentation, module '@remix-run/node' cannot be found.
vite.config.ts(12,17): error TS2554: Expected 0 arguments, but got 1.
```

Línea a línea: el *codemod* cambió de paquete el `import` de `json` pero no lo quitó, y en la 7 no existe (el segundo error es consecuencia del primero); el `declare module '@remix-run/node'` apunta a un paquete que ya no está, y `reactRouter()` no acepta argumentos (*«Expected 0 arguments, but got 1»*): la configuración que le pasabas a `remix()`, con sus `future`, ya no va ahí.

### 3. Lo que queda, a mano

Son los pasos de la guía que el *codemod* no hace:

- **`app/routes.ts`**. Con las rutas por archivos de Remix 2, `flatRoutes()` de `@react-router/fs-routes`.
- **`react-router.config.ts`**, con lo que antes le pasabas al plugin (`ssr: true`). Las flags `v3_` se borran: en la 7 ya son lo normal.
- **`vite.config.ts`**: `reactRouter()` sin argumentos y sin el `declare module`.
- **`json()` fuera**: `return { ensayo }`.
- **Los tipos generados**, si quieres: `Route.LoaderArgs` y `Route.ComponentProps` (lección 15).

Con eso, `react-router typegen && tsc` terminó sin errores en la 7.18.4.

### 4. De la 7 a la 8

Es el mismo camino que cualquier app de la 7 en modo framework: primero los mínimos, todavía en la 7 (React 19.3.1 y Vite 7, porque la 8 pide Vite 7 o superior), y después las flags `v8_`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { Config } from '@react-router/dev/config'\n\nexport default {\n  ssr: true,\n  future: {\n    v8_middleware: true,\n    v8_splitRouteModules: true,\n    v8_viteEnvironmentApi: true,\n    v8_passThroughRequests: true,\n    v8_trailingSlashAwareDataRequests: true,\n  },\n} satisfies Config",
  "anotaciones": [
    {
      "fragmento": "v8_middleware: true",
      "nota": "En el framework sí cambia el comportamiento: el context de cada petición pasa a ser un RouterContextProvider. Si tienes un servidor propio con getLoadContext, hay que adaptarlo; con react-router-serve, no."
    },
    {
      "fragmento": "v8_viteEnvironmentApi: true",
      "nota": "Necesita Vite 6 o superior. Con Vite 7.3.7, el build lo anuncia con una línea: Using Vite Environment API (experimental)."
    },
    {
      "fragmento": "v8_splitRouteModules: true",
      "nota": "Una optimización: no pide cambios en el código."
    },
    {
      "fragmento": "satisfies Config",
      "nota": "Con la 7.18.4, tsc da por buena esta configuración, y react-router build construye el cliente y el servidor sin errores. Commit, y a la 8."
    }
  ]
}
```

Con la 7 al día, llega el salto. Aquí npm nos dio un susto: `npm install react-router@8.5.0 @react-router/dev@8.5.0 …` sobre la instalación de la 7 terminó en `ERESOLVE`, porque el `@react-router/fs-routes` 7.18.4 ya instalado pedía un `@react-router/dev` de la 7. La salida fue escribir `8.5.0` en todos los `@react-router/*` del `package.json`, borrar `node_modules` y `package-lock.json`, e instalar de nuevo.

Ya en la 8, el primer `react-router typegen` se paró en seco. Y cada vez que quitábamos una flag, se paraba en la siguiente:

```text
Error: The `future.v8_splitRouteModules` flag has been moved to a top-level `config.splitRouteModules` field (default `true`)
Error: The `future.v8_viteEnvironmentApi` flag has been removed because Vite Environment API usage is now always enabled
Error: The `future.v8_passThroughRequests` flag has been removed because pass-through requests are now the default behavior
Error: The `future.v8_middleware` flag has been removed because middleware is now always enabled
Error: The `future.v8_trailingSlashAwareDataRequests` flag has been removed because trailing slash-aware data requests are now the default behavior
```

Es decir: cada flag `v8_` es ya el comportamiento normal (o, en el caso de `splitRouteModules`, una opción de primer nivel que viene activada). **Las flags te preparan para la 8, pero no viajan a la 8: hay que borrarlas al llegar.** La 8.5.0 también rechaza sus versiones antiguas con `unstable_`, como `unstable_middleware`. Sin `future`, la configuración queda en `ssr: true`, y `typegen`, `tsc` y `react-router build` terminan sin errores.

## Remix 3 no es una actualización

Ahora mira el otro Remix. Su 3.0.0 salió el 1 de octubre de 2026 y su 3.1.0, el 23 de octubre. Basta con preguntarle a npm qué necesita:

```bash
npm view remix@3.1.0 engines
npm view remix@3.1.0 dependencies
```

```text
{ node: '>=24.3.0' }
{
  '@remix-run/fs': '^1.0.0',
  '@remix-run/cli': '^1.0.1',
  '@remix-run/spa': '^1.0.1',
  '@remix-run/auth': '^1.0.0',
  '@remix-run/mime': '^1.0.0',
  '@remix-run/test': '^1.0.0',
  …
```

Cuarenta y ocho dependencias, todas `@remix-run/*` (`component`, `fetch-router`, `session`, `data-table`…), y **ni `react` ni `react-router`**. Su capa de componentes, `@remix-run/component`, solo depende de `@types/dom-navigation`, los tipos de una API del navegador. Y pide Node 24.3, más que la propia 8. La portada de [remix.run](https://remix.run/) explica que trae su propio modelo de componentes:

```text
A component runs setup once, then returns a function that renders JSX. Keep state in ordinary JavaScript variables, objects, or classes rather than hooks or a prescribed state container.
```

Es decir: un componente prepara lo suyo una vez y devuelve una función que pinta JSX, y el estado vive en variables normales de JavaScript, no en hooks. Hay JSX, pero **no es React**. El equipo lo anunció en mayo de 2025, en el artículo *Wake up, Remix!*, con dos frases que lo resumen: *«That means no critical dependencies, not even React»* y *«This isn't just a new version, it's a new direction»*. Y en el mismo artículo, sobre quienes usaban Remix 1 y 2: React Router 7 es *«a stable platform with long-term support»*.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Una app de Remix 2 se actualiza a Remix 3",
      "realidad": "No hay ese camino. La continuación de Remix 2 es React Router 7, con la guía y el codemod de esta lección. Remix 3 es otro framework, con otros componentes: pasarse sería reescribir la interfaz."
    },
    {
      "mito": "Si una oferta pide «Remix», piden Remix 3",
      "realidad": "Casi seguro que no. Remix 3 tiene semanas. Lo más probable es una app de Remix 2 que mantener o migrar, o una de React Router 7 en modo framework, que es su continuación."
    },
    {
      "mito": "El codemod deja la app lista en la 7",
      "realidad": "Cambia paquetes, import, scripts y entradas. Deja sin hacer routes.ts, react-router.config.ts, los json() y el aumento de tipos de Single Fetch: en nuestra prueba, cuatro errores de tsc y un typegen que no arrancaba."
    },
    {
      "mito": "Con todas las flags activadas, pasar a la 8 es solo cambiar el número",
      "realidad": "Casi: además hay que borrar las flags, porque en la 8 no existen. En el framework, la 8 no arranca con ellas puestas, y en modo datos el future de createBrowserRouter no compila."
    }
  ]
}
```

## Cuándo lo usarías de verdad

- **El primer día en un proyecto heredado.** Antes de tocar nada: `npm ls react-router react-router-dom` (lección 1) y un vistazo a los `import`. En dos minutos sabes en qué época estás y qué guía te toca.
- **Al revisar código de otra persona.** Un `json()` nuevo en una app de la 7 no compila; un `unstable_` en producción merece una pregunta.
- **Al planificar una migración.** Una versión mayor cada vez, con un commit por paso, como piden las guías: de la 5 a la 6, de la 6 a la 7 con sus flags `v7_`, de la 7 a la 8 con sus flags `v8_`. Saltarse escalones junta todos los errores en uno.
- **Por seguridad.** La 6 no tiene parche para el aviso GHSA-wrjc-x8rr-h8h6, que solo se arregla desde la 7.18.0: lo cuenta el proyecto 25, con la salida de `npm audit`.

## Errores típicos

**Hacer caso a la sugerencia de TypeScript.** `Did you mean 'redirect'?` no es el sucesor de `<Redirect>`: es `<Navigate replace />`. TypeScript propone nombres parecidos, no equivalentes.

**Creer que el *codemod* termina el trabajo.** Mira siempre `git diff` después y pasa `typecheck`: en nuestra prueba dejó un `json` importado de `react-router`, un `declare module` hacia un paquete borrado y la configuración dentro de `reactRouter()`.

**Usar `--force` o `--legacy-peer-deps` cuando npm se queja.** Instalarías un router que no funciona con tu React. Sube antes los mínimos, como hace el proyecto 25.

**Pensar que en la 7, sin la flag, no hay middleware.** En modo datos se ejecuta igual desde la 7.8.2; lo que no tienes sin el aumento de `Future` son los tipos: `context` es `any`, y TypeScript no te avisa de nada.

**Llevarte las flags a la 8.** Con una sola en la configuración, ¿qué pasa?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// react-router.config.ts, recién instalada la 8.5.0\nimport type { Config } from '@react-router/dev/config'\n\nexport default {\n  ssr: true,\n  future: {\n    v8_middleware: true,\n  },\n} satisfies Config\n\n// En la terminal:\n//   npx react-router build",
  "opciones": [
    "Construye sin avisar: la 8 ignora las flags que ya son lo normal",
    "Construye, con un aviso de que la flag sobra",
    "No construye: Error: The future.v8_middleware flag has been removed because middleware is now always enabled",
    "Construye, pero el middleware queda desactivado hasta que quites la flag"
  ],
  "correcta": 2,
  "explicacion": "Es la salida real de react-router build con @react-router/dev 8.5.0. Comprueba cada flag de la 7, y también su versión con unstable_, y se para con un mensaje por cada una. tsc tampoco lo deja pasar: v8_middleware does not exist in type Partial<FutureConfig>. Borra el future entero y listo."
}
```

**Saltarse el paso por la última 7.** La guía de la 8 lo pide primero: *«update to the latest minor version of v7.x to make sure you have access to the latest flags»*. Las flags y los avisos más nuevos solo están en la última.

## Ejercicios

Primero, a leer. Cuatro fragmentos de la web de la comparsa: ¿de qué época es cada uno, y qué le hace falta para llegar a la 8?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "import { Route, Routes, useNavigate } from 'react-router-dom'\n\nfunction VolverAlRecorrido() {\n  const navigate = useNavigate()\n  return <button onClick={() => navigate(-1)}>Volver</button>\n}\n\nexport function RutasDeFiguras() {\n  return (\n    <Routes>\n      <Route path=\"/\" element={<Portada />} />\n      <Route path=\":id\" element={<Figura />} />\n    </Routes>\n  )\n}\n\n// ¿De qué época es?",
  "opciones": [
    "La 5",
    "La 6, o una 7 en la que nadie ha tocado los import",
    "La 6.4 o posterior, en modo datos",
    "La 8"
  ],
  "correcta": 1,
  "explicacion": "Routes con element y useNavigate son de la 6 en adelante, y react-router-dom descarta la 8. Pero la 7 sigue publicando react-router-dom, que reexporta react-router, así que este archivo compila igual en la 7.18.4. Solo npm ls lo decide. Para la 8: cambiar el import a react-router y nada más."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "import { useLoaderData } from '@remix-run/react'\nimport type { LoaderFunctionArgs } from '@remix-run/node'\n\nexport async function loader({ params }: LoaderFunctionArgs) {\n  const ensayos = await buscarEnsayos(params.dia!)\n  return { ensayos }\n}\n\nexport default function Ensayos() {\n  const { ensayos } = useLoaderData<typeof loader>()\n  return <ListaDeEnsayos ensayos={ensayos} />\n}\n\n// ¿De qué época es?",
  "opciones": [
    "React Router 7 en modo framework",
    "React Router 6.4",
    "Remix 2, con v3_singleFetch activada",
    "Remix 3"
  ],
  "correcta": 2,
  "explicacion": "Los paquetes @remix-run/react y @remix-run/node son de Remix 2: Remix 3 ni siquiera usa React. Y devolver el objeto tal cual, sin json(), es lo que permite Single Fetch, la flag v3_singleFetch. Para la 8: el camino de Remix 2 a la 7 de esta lección, y de ahí las flags v8_."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "const router = createBrowserRouter(rutas, {\n  future: {\n    v7_fetcherPersist: true,\n    v7_normalizeFormMethod: true,\n    v7_relativeSplatPath: true,\n  },\n})\n\n// ¿De qué época es?",
  "opciones": [
    "La 7, preparando la 8",
    "La 6.4 o posterior, preparando la 7",
    "La 8, preparando la 9",
    "Remix 2, preparando Remix 3"
  ],
  "correcta": 1,
  "explicacion": "Las flags v7_ anuncian la 7, así que el código es de la 6, y createBrowserRouter dice que es de la 6.4 en adelante. En la 7 esas flags ya no existen. Si las dejas, el compilador no se queja, porque el tipo de future del router de datos de la 7.18.4 es una interfaz vacía, pero no hacen nada. En la 8 sí dan error. Para llegar, se borran."
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "import { createBrowserRouter } from 'react-router'\nimport { RouterProvider } from 'react-router-dom'\n\ndeclare module 'react-router' {\n  interface Future {\n    v8_middleware: true\n  }\n}\n\nconst router = createBrowserRouter(rutas, {\n  future: { v8_middleware: true },\n})\n\n// Es de la 7. ¿Qué tienes que cambiar para la 8?",
  "opciones": [
    "Nada: con v8_middleware activada ya es código de la 8",
    "Solo el import de RouterProvider",
    "El import de RouterProvider, que pasa a react-router/dom, y quitar el future del router; el declare module sobra, aunque no rompe nada",
    "Quitar también createBrowserRouter: en la 8 el middleware necesita el modo framework"
  ],
  "correcta": 2,
  "explicacion": "En la 8, react-router-dom no existe, y el future con v8_middleware da TS2353, comprobado con la 8.5.0. El aumento de Future ya no hace falta, porque context es Readonly<RouterContextProvider> sin él; dejarlo no da error. El middleware de cliente funciona en modo datos sin framework (lección 10)."
}
```

Ahora, a migrar. Este es el código de la ficha de la sección de la 6.4, entero, tal como lo dejaron en 2023, con sus dos paquetes mezclados. En la vista previa no arranca, porque `react-router-dom` no está, como en un proyecto con la 8. El panel de tipos enseña los tres errores que viste con `tsc` y la 8.5.0: `defer` y `json` no existen, y `react-router-dom` tampoco.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio: la ficha de la 6.4, a la 8",
  "consigna": "Lleva App.tsx a la 8 con los cinco cambios de la sección de la 6.4: los import (todo de react-router y RouterProvider de react-router/dom), json y defer fuera, data() para el 404 y useLoaderData con su genérico. Sin tocar nada más: la portada, la ficha con sus salidas y el 404 tienen que funcionar igual que antes, y el panel de tipos tiene que quedar limpio. Prueba la ficha de /figuras/gargantua.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { Suspense } from 'react'\nimport { Await, defer, isRouteErrorResponse, json, Outlet, useLoaderData, useRouteError } from 'react-router'\nimport type { LoaderFunctionArgs } from 'react-router'\nimport { createBrowserRouter, Link, RouterProvider } from 'react-router-dom'\nimport './estilos.css'\n\ntype Figura = { id: string; nombre: string; tipo: string }\ntype Salidas = { id: string; dias: string[] }\n\nasync function cargarFiguras() {\n  const res = await fetch('/api/figuras')\n  const figuras: Figura[] = await res.json()\n  return json({ figuras })\n}\n\nasync function cargarFigura({ params }: LoaderFunctionArgs) {\n  const res = await fetch(`/api/figuras/${params.id}`)\n  if (res.status === 404) throw json('No existe esa figura', { status: 404 })\n  const figura: Figura = await res.json()\n  // Lo que puede esperar: las salidas de este año, sin await\n  const salidas: Promise<Salidas> = fetch(`/api/salidas/${params.id}`).then((r) => r.json())\n  return defer({ figura, salidas })\n}\n\nfunction Raiz() {\n  return (\n    <>\n      <header>\n        <Link to=\"/\">Comparsa de Pamplona</Link>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction Portada() {\n  const { figuras } = useLoaderData() as { figuras: Figura[] }\n  return (\n    <>\n      <h1>Gigantes y cabezudos</h1>\n      <ul>\n        {figuras.map((f) => (\n          <li key={f.id}>\n            <Link to={`/figuras/${f.id}`}>{f.nombre}</Link> · {f.tipo}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Ficha() {\n  const { figura, salidas } = useLoaderData() as { figura: Figura; salidas: Promise<Salidas> }\n  return (\n    <article>\n      <h1>{figura.nombre}</h1>\n      <Suspense fallback={<p>Buscando sus salidas…</p>}>\n        <Await resolve={salidas}>{(s: Salidas) => <p>{s.dias.length} salidas este año</p>}</Await>\n      </Suspense>\n    </article>\n  )\n}\n\nfunction ErrorFicha() {\n  const error = useRouteError()\n  if (isRouteErrorResponse(error)) return <p role=\"alert\">{`Error ${error.status}: ${error.data}`}</p>\n  return <p role=\"alert\">Algo ha fallado.</p>\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <Raiz />,\n    children: [\n      { index: true, loader: cargarFiguras, element: <Portada /> },\n      { path: 'figuras/:id', loader: cargarFigura, element: <Ficha />, errorElement: <ErrorFicha /> },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  font-family: system-ui, sans-serif;\n  margin: 0;\n  color: #1f2328;\n}\nheader {\n  background: #b3261e;\n  padding: 0.6rem 1rem;\n}\nheader a {\n  color: #fff;\n  font-weight: 700;\n  text-decoration: none;\n}\nmain {\n  padding: 0.5rem 1rem 1rem;\n}\nli {\n  margin: 0.3rem 0;\n}\n[role='alert'] {\n  color: #b3261e;\n  font-weight: 600;\n}\n"
    }
  ],
  "urlInicial": "/",
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "figuras": [
      {
        "id": "caravinagre",
        "nombre": "Caravinagre",
        "tipo": "kiliki"
      },
      {
        "id": "verrugas",
        "nombre": "Verrugas",
        "tipo": "kiliki"
      },
      {
        "id": "coletas",
        "nombre": "Coletas",
        "tipo": "kiliki"
      },
      {
        "id": "napoleon",
        "nombre": "Napoleón",
        "tipo": "cabezudo"
      }
    ],
    "salidas": [
      {
        "id": "caravinagre",
        "dias": [
          "7 de julio",
          "9 de julio",
          "12 de julio"
        ]
      },
      {
        "id": "verrugas",
        "dias": [
          "7 de julio",
          "10 de julio"
        ]
      },
      {
        "id": "coletas",
        "dias": [
          "8 de julio",
          "11 de julio",
          "13 de julio",
          "14 de julio"
        ]
      },
      {
        "id": "napoleon",
        "dias": [
          "6 de julio"
        ]
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "La portada lista las figuras, cada una con su enlace",
      "urlInicial": "/",
      "pasos": [],
      "espera": {
        "rol": "link",
        "nombre": "Caravinagre"
      }
    },
    {
      "descripcion": "Al pulsar una figura, sale su ficha con su nombre",
      "urlInicial": "/",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Verrugas"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Verrugas"
      }
    },
    {
      "descripcion": "La ficha pinta después cuántas salidas tiene este año",
      "urlInicial": "/figuras/caravinagre",
      "pasos": [],
      "espera": {
        "texto": "3 salidas este año"
      }
    },
    {
      "descripcion": "Una figura que no existe da un 404 en su ficha",
      "urlInicial": "/figuras/gargantua",
      "pasos": [],
      "espera": {
        "rol": "alert",
        "texto": "Error 404: No existe esa figura"
      }
    }
  ]
}
```

Si te atascas: los `import` primero, después `json` y `defer` en los `loader` (el panel de tipos te los señala), y al final los dos `useLoaderData`. Con el genérico, el `(s: Salidas)` de `<Await>` ya no hace falta: TypeScript lo infiere.

**Retos para seguir practicando** (sin comprobación automática):

1. En una carpeta tuya, instala `react-router-dom@5` y copia la app de la sección de la 5. Compílala con `npx tsc --noEmit --strict --jsx react-jsx` y luego sube a la 6 y a la 8, como hicimos aquí. Apunta qué errores salen en cada salto y cuáles arreglas con un cambio mecánico.
2. Añade a la ficha de la 6.4 una `action` que apunte a un vecino a una salida y devuelva `json({ ok: true })`. Llévala a la 8 sin `json` (con un objeto o con `data()`), y comprueba con `useActionData<typeof action>()` qué tipo infiere TypeScript en cada caso.
3. Crea un proyecto con `npx create-remix@2` y ejecuta el *codemod* de esta lección. Haz una lista de lo que dejó sin hacer y compárala con la nuestra.
4. Busca en el changelog de `react-router` (dentro de `node_modules/react-router/CHANGELOG.md`) la historia de otra API que empezó con `unstable_`, por ejemplo `instrumentations`: ¿en qué versión apareció, en cuál se estabilizó y con qué nombre?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Upgrading from v7",
      "descripcion": "La guía para pasar a la 8: los mínimos de Node, React y Vite, cada flag v8_ con lo que cambia, y los cambios sin flag.",
      "url": "https://reactrouter.com/upgrading/v7",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Future Changes",
      "descripcion": "Lo que se prepara para la 9: hoy, el mínimo de Node 24 y las flags inestables de la 8. Se actualiza durante toda la 8.",
      "url": "https://reactrouter.com/upgrading/future",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "API Development Strategy",
      "descripcion": "La regla de las future flags y de las unstable_, en una página corta. Para saber qué te estás jugando al activar una.",
      "url": "https://reactrouter.com/community/api-development-strategy",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Upgrading from v5 (documentación de la 6)",
      "descripcion": "De Switch a Routes, de useHistory a useNavigate y de Redirect a Navigate, con el porqué de cada cambio y el paquete de compatibilidad.",
      "url": "https://reactrouter.com/6.30.3/upgrading/v5",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Upgrading from v6 (documentación de la 7)",
      "descripcion": "Las seis flags v7_, json y defer, y el cambio de react-router-dom a react-router.",
      "url": "https://reactrouter.com/7.18.4/upgrading/v6",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Upgrading from Remix v2 (documentación de la 7)",
      "descripcion": "Los pasos de Remix 2 a la 7: flags v3_, codemod, routes.ts, react-router.config.ts, tipos y entradas.",
      "url": "https://reactrouter.com/7.18.4/upgrading/remix",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Framework Adoption from Component Routes",
      "descripcion": "Si tu app usa Routes y quieres el modo framework: el plugin de Vite paso a paso, sin pasar antes por el modo datos.",
      "url": "https://reactrouter.com/upgrading/component-routes",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Wake up, Remix!",
      "descripcion": "El artículo de mayo de 2025 en el que el equipo explica qué es Remix 3, por qué deja React y qué papel le queda a React Router 7.",
      "url": "https://remix.run/blog/wake-up-remix",
      "etiqueta": "remix.run"
    }
  ]
}
```
