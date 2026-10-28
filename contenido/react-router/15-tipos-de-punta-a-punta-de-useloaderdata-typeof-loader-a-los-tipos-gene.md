# Tipos de punta a punta: de `useLoaderData<typeof loader>` a los tipos generados

- **Módulo:** Modo framework
- **Slug:** `tipos-de-punta-a-punta-de-useloaderdata-typeof-loader-a-los-tipos-generados` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [Type Safety](https://reactrouter.com/explanation/type-safety) + [Route Module Type Safety](https://reactrouter.com/how-to/route-module-type-safety) + [useLoaderData](https://reactrouter.com/api/hooks/useLoaderData) + [href](https://reactrouter.com/api/utils/href) + [createContext](https://reactrouter.com/api/utils/createContext) + [data](https://reactrouter.com/api/utils/data) + [Error Boundaries](https://reactrouter.com/how-to/error-boundary) + [TypeScript: Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) — ver `contenido/react-router/TEMARIO.md` #15
- **Requiere:** La lección 14. De esta ficha, la 2, la 8 y la 10. De TypeScript, la 38 (typeof en los tipos), la 43 (ReturnType), la 45 (infer) y la 52 (declaration merging)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

El router sabe muchas cosas que TypeScript no ve: qué devuelve el `loader` de cada ruta, qué parámetros tiene cada patrón, qué direcciones existen, qué deja el middleware en el contexto y qué puede llegar a un `ErrorBoundary`. Hasta ahora lo has ido viendo de pasada: el primer `useLoaderData<typeof loader>()` en la lección 2, un `params.id` que puede ser `undefined`, el `createContext<T>()` de la 10, el `unknown` de `useRouteError()` en la 8. **Esta lección los junta y responde a dos preguntas: de dónde saca TypeScript cada tipo, y cuándo te miente.**

Hay dos formas de conseguir los tipos, una por modo:

- **En el modo datos, el tipo sale de tus funciones.** Escribes `typeof loader` y TypeScript deduce lo que devuelve. No hay nada que generar, y por eso lo practicas en vivo, con el panel de errores de tipos. El panel usa TypeScript 6.0.3 con `stableTypeOrdering`, que ordena las uniones de los mensajes como la 7, y los tipos de React Router 8.5.0; todos los mensajes de esta lección los comprobamos también con `tsc` 7.0.2, y salen iguales.
- **En el modo framework, React Router los genera** a partir de `routes.ts`: cada ruta tiene sus tipos en `./+types/<ruta>`. Esto lo practicas en el taller, con `npm run typecheck`.

Y en medio, la trampa: lo que un `loader` de servidor devuelve **viaja serializado** hasta el navegador, y el tipo no siempre lo sabe.

## En el modo datos, el tipo sale de la función

Las visitas guiadas de Las Médulas (León) tienen una ficha por ruta. Su `loader` hace cuatro cosas distintas según la ruta: redirige una dirección antigua, lanza un 404, devuelve los datos envueltos en `data()` o los devuelve tal cual. Mira qué tipo le queda al componente. Los datos son de ejemplo y no hay red: el `loader` lee un array.

```laboratorio
{
  "tipo": "react-anotado",
  "lenguaje": "tsx",
  "codigo": "import { createBrowserRouter, data, Link, redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\ntype Ruta = { id: string; nombre: string; km: number; plazas: number }\n\n// Datos de ejemplo: las plazas son inventadas\nconst RUTAS: Ruta[] = [\n  { id: 'orellan', nombre: 'Mirador de Orellán', km: 2.4, plazas: 12 },\n  { id: 'galerias', nombre: 'La Cuevona y La Encantada', km: 3.1, plazas: 0 },\n  { id: 'lago-sumido', nombre: 'Lago Sumido', km: 4.6, plazas: 7 },\n]\n\nasync function cargarRuta({ params }: LoaderFunctionArgs) {\n  // La dirección antigua de las galerías sigue funcionando\n  if (params.id === 'cuevona') return redirect('/rutas/galerias')\n  const ruta = RUTAS.find((r) => r.id === params.id)\n  if (!ruta) throw data('No hay ninguna ruta guiada con ese nombre.', { status: 404 })\n  if (ruta.plazas === 0) return data({ ruta, aviso: 'Sin plazas este fin de semana.' }, { status: 200 })\n  return { ruta, aviso: null }\n}\n\nfunction FichaRuta() {\n  const { ruta, aviso } = useLoaderData<typeof cargarRuta>()\n  return (\n    <article>\n      <h1>{ruta.nombre}</h1>\n      <p>{ruta.km.toLocaleString('es-ES')} km, ida y vuelta</p>\n      {aviso ? <p role=\"status\">{aviso}</p> : <p>Quedan {ruta.plazas} plazas.</p>}\n      <Link to=\"/\">Todas las rutas</Link>\n    </article>\n  )\n}\n\nfunction Lista() {\n  return (\n    <ul>\n      {RUTAS.map((r) => (\n        <li key={r.id}>\n          <Link to={`/rutas/${r.id}`}>{r.nombre}</Link>\n        </li>\n      ))}\n      <li>\n        <Link to=\"/rutas/cuevona\">La Cuevona (enlace antiguo)</Link>\n      </li>\n    </ul>\n  )\n}\n\nconst router = createBrowserRouter([\n  { path: '/', Component: Lista },\n  { path: '/rutas/:id', loader: cargarRuta, Component: FichaRuta, ErrorBoundary: () => <p role=\"alert\">Esa ruta no existe.</p> },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}",
  "css": "",
  "urlInicial": "/rutas/galerias",
  "anotaciones": [
    {
      "fragmento": "async function cargarRuta({ params }: LoaderFunctionArgs) {",
      "nota": "LoaderFunctionArgs no sabe qué path tendrá esta función: se la puedes poner a cualquier ruta. Por eso params es un objeto de string | undefined, y params.id puede no existir."
    },
    {
      "fragmento": "if (params.id === 'cuevona') return redirect('/rutas/galerias')",
      "nota": "Un redirect devuelto es una Response, y el tipo de los datos la quita: el componente nunca la recibe, porque el router navega a otro sitio antes de pintar."
    },
    {
      "fragmento": "throw data('No hay ninguna ruta guiada con ese nombre.', { status: 404 })",
      "nota": "Lo lanzado no cuenta para el tipo de los datos: va al ErrorBoundary. Si lo pintas con useLoaderData, nunca es eso."
    },
    {
      "fragmento": "return data({ ruta, aviso: 'Sin plazas este fin de semana.' }, { status: 200 })",
      "nota": "data() envuelve los datos para ponerles un estado o cabeceras. El tipo lo desenvuelve: al componente le llega el objeto de dentro, no el envoltorio."
    },
    {
      "fragmento": "const { ruta, aviso } = useLoaderData<typeof cargarRuta>()",
      "nota": "Con el genérico, TypeScript deduce de lo que devuelve la función: { ruta: Ruta; aviso: string } | { ruta: Ruta; aviso: null }. Sin él, useLoaderData devuelve any, y ruta.nombr compilaría sin un aviso."
    },
    {
      "fragmento": "{aviso ? <p role=\"status\">{aviso}</p> : <p>Quedan {ruta.plazas} plazas.</p>}",
      "nota": "Como el tipo es una unión, aviso es string | null y hay que comprobarlo. Ruta está en las dos ramas, así que ruta.plazas no necesita comprobación."
    }
  ]
}
```

Para ver el tipo sin pasar el ratón, el truco de siempre: asígnaselo a una variable de un tipo que no cuadre, `const x: number = useLoaderData<typeof cargarRuta>()`, y lee el error:

```text
Type '{ ruta: Ruta; aviso: string; } | { ruta: Ruta; aviso: null; }' is not assignable to type 'number'.
  Type '{ ruta: Ruta; aviso: string; }' is not assignable to type 'number'.
```

Es decir: «el tipo `{ ruta; aviso: string } | { ruta; aviso: null }` no se puede asignar a `number`». La unión tiene dos ramas, las dos formas de llegar al `return`; ni el `redirect` ni el 404 están. Si pruebas el mismo truco con `params.id` en una función que pide un `string`:

```text
Type 'string | undefined' is not assignable to type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

Lo mismo con las otras dos funciones del router que leen el resultado de otra. `useActionData<typeof action>()` y `useFetcher<typeof action>()` deducen de lo que devuelve la `action`, más un `undefined`, porque hasta que alguien envía el formulario no hay nada. Con una `action` que devuelve `data({ error }, { status: 400 })` o `{ ok: true as const }`, `fetcher.data` queda así:

```text
Type '{ error: string; } | { ok: true; } | undefined' is not assignable to type 'number'.
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En modo datos. ¿Qué tipo tiene datos?\nasync function cargarReserva({ params }: LoaderFunctionArgs) {\n  const reserva = await pedirReserva(params.id!)\n  if (!reserva) throw data('No existe', { status: 404 })\n  if (reserva.anulada) return redirect('/reservas')\n  return data({ reserva, pagada: false }, { status: 200 })\n}\n\nfunction FichaReserva() {\n  const datos = useLoaderData<typeof cargarReserva>()\n  // …\n}",
  "opciones": [
    "{ reserva: Reserva; pagada: boolean } | Response",
    "{ reserva: Reserva; pagada: boolean }",
    "DataWithResponseInit<{ reserva: Reserva; pagada: boolean }>",
    "{ reserva: Reserva; pagada: boolean } | string"
  ],
  "correcta": 1,
  "explicacion": "El redirect devuelto es una Response, y el tipo de los datos la quita. El data() se desenvuelve y queda lo de dentro. Lo lanzado no cuenta. Queda un solo objeto, sin unión. Comprobado con TypeScript 6.0.3 y 7.0.2 y los tipos de React Router 8.5.0."
}
```

## Lo que el tipo no sabe: la serialización

En el modo framework, un `loader` se ejecuta en el servidor y lo que devuelve tiene que viajar al navegador: dentro del HTML en la primera visita, en una respuesta `.data` después. Y no todo puede viajar. Una función no se puede mandar por la red; una instancia de una clase llega como un objeto normal, sin sus métodos. React Router lo refleja en el tipo con una transformación, que convierte cada función en `undefined` y cada clase en un objeto con sus campos.

El problema es que **el genérico de `useLoaderData` no sabe en qué modo estás.** Lo decide mirando la **firma** de tu `loader`:

- si su argumento tiene la forma de los argumentos de un `loader` de cliente (`LoaderFunctionArgs` en modo datos, y también `Route.LoaderArgs` del modo framework), **no serializa**: el tipo queda tal cual devuelve la función;
- si no tiene argumentos, **serializa**.

En el modo datos no hay red y nada se serializa nunca, así que un `loader` sin argumentos le hace decir al tipo algo que no pasa. Compruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un loader sin argumentos, en modo datos",
  "consigna": "Mira el panel de errores de tipos: dice que formatear y reserva.total pueden ser undefined. Mira ahora la vista previa: funciona, y formatear es una función. Después dale a cargarReserva un argumento, (_args: LoaderFunctionArgs), importando el tipo de react-router, y vuelve a mirar el panel.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, useLoaderData } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\n\nclass Reserva {\n  personas: number\n  precio: number\n  constructor(personas: number, precio: number) {\n    this.personas = personas\n    this.precio = precio\n  }\n  total() {\n    return this.personas * this.precio\n  }\n}\n\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\n// Sin argumentos: el loader no usa params ni request\nasync function cargarReserva() {\n  return {\n    reserva: new Reserva(3, 6),\n    formatear: (cantidad: number) => euros.format(cantidad),\n  }\n}\n\nfunction Resumen() {\n  const { reserva, formatear } = useLoaderData<typeof cargarReserva>()\n  return (\n    <section>\n      <h1>Tu visita al Mirador de Orellán</h1>\n      <p>\n        {reserva.personas} personas: {formatear(reserva.total())}\n      </p>\n      <p>formatear es de tipo {typeof formatear}</p>\n    </section>\n  )\n}\n\nconst router = createBrowserRouter([{ path: '/', loader: cargarReserva, Component: Resumen }])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    }
  ],
  "mostrarConsola": false
}
```

El panel dice esto, dos veces, una por cada llamada:

```text
Cannot invoke an object which is possibly 'undefined'.
```

Es decir: «no se puede llamar a algo que quizá sea `undefined`». Y la vista previa dice «formatear es de tipo function». **El tipo miente al revés**: avisa de un problema que en el modo datos no existe. Con `_args: LoaderFunctionArgs` en la firma, el panel se queda limpio.

En el modo framework pasa lo contrario, y es peor, porque el tipo calla un problema que sí existe. Lo probamos en el taller: el `loader` de una etapa devuelve, además de la etapa, una fecha, una función y una instancia de una clase con un método:

```tsx
export async function loader({ params }: Route.LoaderArgs) {
  // …
  return { etapa, consultada: new Date(), aKm: (m: number) => m / 1000, reserva: new Plaza(2) }
}
```

Con `useLoaderData<typeof loader>()`, la firma lleva `Route.LoaderArgs`, y el tipo no serializa:

```text
Type '{ etapa: Etapa; consultada: Date; aKm: (m: number) => number; reserva: Plaza; }' is not assignable to type 'number'.
```

Con la prop `loaderData` de `Route.ComponentProps`, que los tipos generados saben que viene del servidor, sí:

```text
Type '{ etapa: Etapa; consultada: Date; aKm: undefined; reserva: { personas: number; precio: undefined; }; }' is not assignable to type 'number'.
```

¿Cuál acierta? Pide la respuesta `.data` con `curl`:

```text
$ curl -s http://localhost:5173/etapas/sahagun-el-burgo-ranero.data
[{"_1":2},"routes/etapa",{"_3":4},"data",{"_5":6,"_7":8,"_9":10,"_11":12},"etapa",{…},"consultada",["D",1793121435082],"aKm",["SingleFetchFallback"],"reserva",["SingleFetchClassInstance",13],{"_14":15},"personas",2, …]
```

La fecha viaja como fecha (`"D"` y sus milisegundos). La función no viaja: en su lugar va un marcador. La instancia viaja como un objeto con sus campos, sin `precio()`. Y lo peor llega al abrir la página. En el servidor, el componente se pinta con los datos tal cual (la función existe); en el navegador, con lo que ha llegado. Pintamos `typeof` de cada cosa en un párrafo, y en Chromium:

```text
HTML del servidor:        aKm: function · precio: function · fecha: true
tras hidratar, en Chromium: aKm: undefined · precio: undefined · fecha: true
Hydration failed because the server rendered text didn't match the client. …
```

El mismo error de hidratación que la lección 98 de React destapó con una fecha. **En el modo framework, usa el `loaderData` de `Route.ComponentProps`**, que tiene el tipo de lo que llega de verdad, y devuelve desde un `loader` de servidor solo datos: objetos, arrays, texto, números, `null` y lo que sabe serializar. Según los tipos de la 8.5.0, eso incluye `Date`, `Map`, `Set`, `Promise` (para el *streaming* de la lección 9), `bigint`, `URL`, `RegExp` y `Error`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// app/routes/etapa.tsx, en el modo framework\nexport async function loader({ params }: Route.LoaderArgs) {\n  const etapa = buscarEtapa(params.etapa)\n  if (!etapa) throw data({ mensaje: 'No conocemos esa etapa.' }, { status: 404 })\n  return { etapa, actualizada: new Date('2026-10-01') }\n}\n\nexport default function Etapa({ loaderData }: Route.ComponentProps) {\n  return <p>Actualizada en {loaderData.actualizada.getFullYear()}</p>\n}\n\n// Abres la etapa en el navegador. ¿Qué pasa al hidratar?",
  "opciones": [
    "Falla: una fecha llega como texto y no tiene getFullYear",
    "Funciona: la fecha llega como Date, y el tipo lo sabe",
    "Funciona en el servidor, pero en el navegador sale un error de hidratación",
    "No compila: loaderData.actualizada es string"
  ],
  "correcta": 1,
  "explicacion": "React Router serializa con su propio formato, no con JSON.stringify, y las fechas viajan como fechas: en la respuesta de datos van como D y sus milisegundos. El tipo de loaderData lo refleja, con actualizada de tipo Date. Con JSON a secas, una fecha sí llegaría como texto."
}
```

## En el modo framework: los tipos generados

En el modo framework, React Router conoce cada ruta antes de ejecutar nada: lee `routes.ts`. Con eso, `react-router typegen` (o el servidor de desarrollo, cada vez que cambias una ruta) escribe un archivo de tipos por ruta en `.react-router/types/`, con la misma estructura de carpetas que `app/`. El de la ficha de una etapa empieza así:

```tsx
// Generated by React Router

import type { GetInfo, GetAnnotations } from "react-router/internal";

type Module = typeof import("../etapa.js")

type Info = GetInfo<{
  file: "routes/etapa.tsx",
  module: Module
}>

type Matches = [{
  id: "root";
  module: typeof import("../../root.js");
}, {
  id: "routes/publico";
  module: typeof import("../publico.js");
}, {
  id: "routes/etapa";
  module: typeof import("../etapa.js");
}];

type Annotations = GetAnnotations<Info & { module: Module, matches: Matches }>;

export namespace Route {
  // links
  export type LinkDescriptors = Annotations["LinkDescriptors"];
  export type LinksFunction = Annotations["LinksFunction"];

  // meta
  export type MetaArgs = Annotations["MetaArgs"];
  export type MetaDescriptors = Annotations["MetaDescriptors"];
  export type MetaFunction = Annotations["MetaFunction"];

  // headers
  export type HeadersArgs = Annotations["HeadersArgs"];
  export type HeadersFunction = Annotations["HeadersFunction"];

  // middleware
  export type MiddlewareFunction = Annotations["MiddlewareFunction"];

  // clientMiddleware
  export type ClientMiddlewareFunction = Annotations["ClientMiddlewareFunction"];

  // loader
  export type LoaderArgs = Annotations["LoaderArgs"];
  // … ClientLoaderArgs, ActionArgs, ClientActionArgs, HydrateFallbackProps,
  //   ComponentProps, ErrorBoundaryProps y otros
}
```

Fíjate en `typeof import("../etapa.js")`: los tipos de la ruta salen **de tu propio módulo**, como en el modo datos salían de `typeof loader`. Lo nuevo es que `typegen` sabe también el patrón de la ruta y sus madres (`Matches`: root, publico y etapa), así que puede tipar los `params` sin que se los digas. Con `route('etapas/:etapa', …)`, `Route.LoaderArgs` tiene `params: { etapa: string }`: un `string`, sin `undefined`, porque si la URL encaja, el segmento está. Un segmento opcional (`:idioma?`) sale como `idioma?: string`.

### Cómo llega `+types` a tu módulo

El módulo importa `./+types/etapa`, y en `app/routes/` no hay ninguna carpeta `+types`. Lo resuelven dos líneas de `tsconfig.json`:

```json
"include": ["**/*", "**/.server/**/*", "**/.client/**/*", ".react-router/types/**/*"],
"rootDirs": [".", "./.react-router/types"],
```

`rootDirs` le dice a TypeScript que trate las dos carpetas como si fueran una: `app/routes/+types/etapa.ts` y `.react-router/types/app/routes/+types/etapa.ts` son, para él, el mismo sitio. Y `.react-router/` está en el `.gitignore`: se regenera siempre, nunca se sube.

Por eso `npm run typecheck` es `react-router typegen && tsc`, en ese orden. En un clon recién hecho, o en la integración continua, no hay `.react-router/`. Lo probamos en el taller tras la lección 15, borrando la carpeta y lanzando `tsc` solo:

```text
$ rm -rf .react-router && npx tsc
app/root.tsx(2,28): error TS2307: Cannot find module './+types/root' or its corresponding type declarations.
app/routes/camas.tsx(4,28): error TS2307: Cannot find module './+types/camas' or its corresponding type declarations.
app/routes/entrar.tsx(1,28): error TS2307: Cannot find module './+types/entrar' or its corresponding type declarations.
…
```

Trece errores, todos iguales, en un proyecto que con `npm run typecheck` sale limpio.

### La ficha de una etapa, de `any` a tipada

En la rama `main`, el `loader` de `etapa.tsx` no tiene tipo, y es el error que te dejó la lección 14:

```tsx
export async function loader({ params }) {
  return { etapa: buscarEtapa(params.etapa) }
}

export async function clientLoader({ serverLoader }: { serverLoader: () => Promise<unknown> }) {
  // TODO (lección 16): cachea serverLoader durante cinco minutos y activa la
  // hidratación. Busca clientLoader.hydrate.
  // Mientras no haya caché, una navegación cliente debe seguir usando el loader que ya funciona.
  return serverLoader()
}
clientLoader.hydrate = false as const

export default function Etapa(_props: Record<string, unknown>) {
  // TODO (lección 15): recibe Route.ComponentProps y usa loaderData tipado.
  const { etapa } = useLoaderData()
```

Hay dos `any` en ese código, y TypeScript solo se queja de uno. El de `params` lo marca porque `strict` incluye `noImplicitAny`: `Binding element 'params' implicitly has an 'any' type.` El de `useLoaderData()` sin genérico, no, porque es un `any` explícito de la librería. Lo comprobamos haciendo solo la mitad del trabajo, poniéndole `Route.LoaderArgs` al `loader`: `npm run typecheck` sale **limpio**, y la etapa sigue siendo `any` en el componente. **Un typecheck sin errores no quiere decir que todo esté tipado.**

El siguiente paso es que el componente reciba la prop `loaderData` con `Route.ComponentProps`. Si lo haces sin tocar nada más, el error que sale no es el que esperas (con TypeScript 7.0.2, la versión del taller):

```text
app/routes/etapa.tsx(21,11): error TS2339: Property 'etapa' does not exist on type 'unknown'.
```

`loaderData` no es solo lo del `loader`: en una ruta con `clientLoader`, puede venir de cualquiera de los dos, y su tipo junta ambos. El `clientLoader` de marcador de la rama `main` solo delega en el servidor (`return serverLoader()`, para que navegar a una etapa funcione hasta la lección 16), pero su argumento está tipado a mano con un `serverLoader` que devuelve `Promise<unknown>`. Un `unknown` en la mezcla lo convierte todo en `unknown`. Con `Route.ClientLoaderArgs` en su firma, `serverLoader()` devuelve lo que devuelve tu `loader`, y TypeScript ve por fin un problema real:

```text
app/routes/etapa.tsx(26,10): error TS18047: 'etapa' is possibly 'null'.
app/routes/etapa.tsx(26,31): error TS18047: 'etapa' is possibly 'null'.
app/routes/etapa.tsx(28,18): error TS18047: 'etapa' is possibly 'null'.
app/routes/etapa.tsx(29,11): error TS18047: 'etapa' is possibly 'null'.
```

Es decir: «la etapa puede ser `null`». `buscarEtapa` devuelve `Etapa | null`, y con una dirección inventada, `/etapas/inventada`, el componente rompía al leer `etapa.origen`. El tipo ha encontrado el fallo que la lección 14 dejó como un 500. El arreglo no es un `!` ni un `as`: es que la ruta no llegue a pintarse sin etapa.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params }: Route.LoaderArgs) {\n  const etapa = buscarEtapa(params.etapa)\n  // L15: data corta la ruta con un 404 real; la frontera valida el cuerpo porque llega como any.\n  if (!etapa) throw data({ mensaje: 'No conocemos esa etapa del Camino.' }, { status: 404 })\n  return { etapa }\n}\n\nexport async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {\n  // TODO (lección 16): cachea serverLoader durante cinco minutos y activa la hidratación.\n  // Mientras no haya caché, una navegación cliente debe seguir usando el loader que ya funciona.\n  return serverLoader()\n}\nclientLoader.hydrate = false as const\n\nexport default function Etapa({ loaderData }: Route.ComponentProps) {\n  const { etapa } = loaderData",
  "anotaciones": [
    {
      "fragmento": "export async function loader({ params }: Route.LoaderArgs) {",
      "nota": "params es { etapa: string }, sacado del patrón etapas/:etapa de routes.ts. Si cambias el patrón a etapas/:slug, este archivo deja de compilar hasta que lo cambies aquí también."
    },
    {
      "fragmento": "if (!etapa) throw data({ mensaje: 'No conocemos esa etapa del Camino.' }, { status: 404 })",
      "nota": "Lanzado: la ruta no se pinta, y en su lugar sale su ErrorBoundary, con un 404 de verdad. Desde aquí hacia abajo, TypeScript sabe que etapa no es null."
    },
    {
      "fragmento": "// L15: data corta la ruta con un 404 real; la frontera valida el cuerpo porque llega como any.",
      "nota": "El cuerpo, el objeto con el mensaje, llega al ErrorBoundary, pero su tipo no: allí es any. Por eso el ErrorBoundary lo valida antes de pintarlo, en la sección de los errores."
    },
    {
      "fragmento": "return { etapa }",
      "nota": "Lo único que llega al componente: { etapa: Etapa }, sin null."
    },
    {
      "fragmento": "export default function Etapa({ loaderData }: Route.ComponentProps) {",
      "nota": "La prop loaderData en vez de useLoaderData: no hace falta genérico, y su tipo es el de lo que llega del servidor, ya serializado. Route.ComponentProps trae también params, actionData y matches."
    }
  ]
}
```

Con eso, la dirección inventada responde lo que debe:

```text
$ curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5173/etapas/inventada
404
$ curl -s http://localhost:5173/etapas/inventada | grep -o '<h1>[^<]*</h1><p>[^<]*</p>'
<h1>Etapa no encontrada</h1><p>No conocemos esa etapa del Camino.</p>
```

## `href()` y el registro de tipos

`typegen` escribe un archivo más, `.react-router/types/+routes.ts`, que no es de ninguna ruta: es de la app entera. Empieza así:

```tsx
// Generated by React Router

import "react-router"

declare module "react-router" {
  interface Register {
    pages: Pages
    routeFiles: RouteFiles
    routeModules: RouteModules
  }
}

type Pages = {
  "/": {
    params: {};
  };
  "/albergue": {
    params: {};
  };
  "/etapas": {
    params: {};
  };
  "/etapas/:etapa": {
    params: {
      "etapa": string;
    };
  };
  // … una entrada por cada dirección de routes.ts
};
```

Es un **aumento de módulo** (lección 52 de TypeScript): `declare module "react-router"` reabre el módulo de la librería e `interface Register` se fusiona con una interfaz vacía que React Router exporta para esto. A partir de ahí, cualquier tipo de la librería que mire `Register` ve tus rutas. El más útil es `href()`, que construye una dirección a partir de un patrón:

```tsx
<Link to={href('/etapas/:etapa', { etapa: etapa.slug })}>
```

Con el registro, `href` solo acepta patrones que existen y exige sus parámetros. Lo comprobamos en `etapas.tsx` con tres errores a propósito:

```text
href('/etapas/:etapa')
  error TS2554: Expected 2 arguments, but got 1.
href('/etapa/sahagun-el-burgo-ranero')
  error TS2345: Argument of type '"/etapa/sahagun-el-burgo-ranero"' is not assignable to parameter of type 'keyof Pages'.
href('/etapas/:etapa', { slug: 'x' })
  error TS2353: Object literal may only specify known properties, and 'slug' does not exist in type '{ etapa: string; }'.
```

Un `` `/etapas/${etapa.slug}` `` escrito a mano no tiene nada de esto: si mañana la ruta pasa a llamarse `/camino/:etapa`, los enlaces de plantilla siguen compilando y llevan a un 404. Con `href`, el `typecheck` te da la lista de los que hay que cambiar. Y `href` además codifica los parámetros (desde la 8.3, según el RFC 3986): `href('/rutas/:id', { id: 'peña alta/2' })` da `/rutas/pe%C3%B1a%20alta%2F2`, con la barra codificada, en vez de partir la dirección en dos.

### Y sin registro

En el modo datos no hay `typegen`, y sin registro **`href` acepta cualquier texto**: `href('/inventada/del/todo')` compila y devuelve `'/inventada/del/todo'`. Ni siquiera exige los parámetros: `href('/rutas/:id')` compila, y al ejecutarse lanza `Path '/rutas/:id' requires param 'id' but it was not provided`.

Puedes escribir el registro a mano, con las mismas líneas que genera `typegen`:

```tsx
declare module 'react-router' {
  interface Register {
    pages: {
      '/': { params: {} }
      '/rutas': { params: {} }
      '/rutas/:id': { params: { id: string } }
    }
  }
}
```

Y entonces `href('/inventada')` deja de compilar, con la lista de lo que sí vale:

```text
Argument of type '"/inventada"' is not assignable to parameter of type '"/" | "/rutas" | "/rutas/:id"'.
```

La pega es que nadie comprueba que esa lista coincida con tus rutas de verdad: si añades una y no la registras, `href` no la acepta, y si borras una y no la quitas, `href` te deja enlazarla. En el modo framework la escribe `typegen` desde `routes.ts`, y no se puede desincronizar.

`Register` no es la única interfaz aumentable de React Router. En la 7 había que aumentar `Future` con `v8_middleware: true` para que el `context` de los `loader` tuviera su tipo (lo verás en código antiguo, lección 23). En la 8, el middleware está siempre activo y no hace falta.

## El contexto tipado

La lección 10 creó las claves del contexto con `createContext<T>()`. El tipo va con la clave: `context.get(clave)` devuelve `T`, y `context.set(clave, valor)` solo acepta un `T`. En el panel, con una guía de Las Médulas:

```tsx
const guiaContext = createContext<Guia>()
context.set(guiaContext, 3)
```

```text
Argument of type 'number' is not assignable to parameter of type 'Guia'.
```

Lo que el tipo no puede comprobar es que alguien haya puesto el valor antes de leerlo. Para eso está **no darle valor por defecto**: leer una clave que nadie ha puesto lanza `No value found for context` (lo viste en la lección 10), en vez de devolver algo. En la rama `main` del taller, `contexto.server.ts` es justo lo contrario:

```tsx
export const hospitaleroContext = createContext<Hospitalero>({
  id: 'TODO',
  usuario: 'TODO',
  nombre: 'TODO (lección 15)',
})
```

Con un valor por defecto inventado, si en la lección 18 te olvidas del middleware en una ruta, su `loader` no falla: recibe un hospitalero que se llama «TODO (lección 15)» y sigue adelante. El tipo dice `Hospitalero` en los dos casos. Sin valor por defecto, el olvido lanza un error en la primera petición, que es lo que quieres:

```tsx
export const hospitaleroContext = createContext<Hospitalero>()
export const sesionContext = createContext<Sesion>()
```

Si de verdad un valor puede faltar, dilo en el tipo: `createContext<Hospitalero | null>(null)` devuelve `null` sin lanzar, y TypeScript te obliga a comprobarlo antes de usarlo.

## Los errores: `unknown`, y `data` como `any`

Un `ErrorBoundary` recibe lo que alguien lanzó, y en JavaScript se puede lanzar cualquier cosa: un `Error`, un `data()`, una `Response`, un texto, un número. Por eso `useRouteError()` y la prop `error` de `Route.ErrorBoundaryProps` son **`unknown`**: antes de usar el error, hay que averiguar qué es.

`isRouteErrorResponse(error)` lo estrecha a una respuesta de error del router, con tres campos. En los tipos de la 8.5.0:

```tsx
type ErrorResponse = {
  status: number;
  statusText: string;
  data: any;
};
```

**`data` es `any`.** El `{ mensaje }` que lanzó el `loader` de la etapa no viaja tipado hasta el `ErrorBoundary`: el tipo no puede saber qué `loader` lanzó, ni si lo que llega es tuyo. Puede ser el 404 del propio router, cuyo `data` es un texto. Y como es `any`, TypeScript te deja escribir cualquier cosa: `error.data.lo.que.sea` compila sin un aviso, y en ejecución da `undefined` o rompe. **Lo que llega en `error.data` hay que validarlo**, como cualquier dato de fuera. El taller lo hace con Zod (lección 61 de React), en su versión pequeña, `zod/mini`: este `ErrorBoundary` también se ejecuta en el navegador, y por qué eso importa es la lección 16. Además, separa un 404 de cualquier otro fallo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { z } from 'zod/mini'\nimport { buscarEtapa } from '~/datos/etapas'\nimport type { Route } from './+types/etapa'\n\nexport async function loader({ params }: Route.LoaderArgs) {\n  const etapa = buscarEtapa(params.etapa)\n  // L15: data corta la ruta con un 404 real; la frontera valida el cuerpo porque llega como any.\n  if (!etapa) throw data({ mensaje: 'No conocemos esa etapa del Camino.' }, { status: 404 })\n  return { etapa }\n}\n\nexport async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {\n  // TODO (lección 16): cachea serverLoader durante cinco minutos y activa la hidratación.\n  // Mientras no haya caché, una navegación cliente debe seguir usando el loader que ya funciona.\n  return serverLoader()\n}\nclientLoader.hydrate = false as const\n\nexport default function Etapa({ loaderData }: Route.ComponentProps) {\n  const { etapa } = loaderData\n  return (\n    <main className=\"pagina estrecha etapa-detalle\">\n      <title>{`${etapa.origen} a ${etapa.destino} | El Cea`}</title>\n      <Link to={href('/etapas')}>Volver a las etapas</Link>\n      <h1>\n        {etapa.origen} <span>hasta</span> {etapa.destino}\n      </h1>\n      <p className=\"distancia\">{String(etapa.kilometros).replace('.', ',')} km aproximados</p>\n      <p>{etapa.descripcion}</p>\n      <p>Antes de caminar, revisa el tiempo, lleva agua y confirma los servicios abiertos en la ruta.</p>\n    </main>\n  )\n}\n\nconst ErrorEtapa = z.object({ mensaje: z.string() })\nexport function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {\n  // L16: zod/mini basta para esta validación y evita enviar Zod completo al navegador.\n  const validado = isRouteErrorResponse(error) ? ErrorEtapa.safeParse(error.data) : null\n  const mensaje = validado?.success ? validado.data.mensaje : 'No hemos podido mostrar esta etapa.'\n  const noEncontrada = isRouteErrorResponse(error) && error.status === 404\n  const titulo = noEncontrada ? 'Etapa no encontrada' : 'Error al mostrar la etapa'",
  "anotaciones": [
    {
      "fragmento": "import { z } from 'zod/mini'",
      "nota": "zod/mini tiene la misma z.object y el mismo safeParse que Zod para esta validación, en un paquete mucho más pequeño para el navegador. Los módulos .server del taller usan Zod normal: allí el tamaño no viaja a nadie."
    },
    {
      "fragmento": "const ErrorEtapa = z.object({ mensaje: z.string() })",
      "nota": "La forma que esperas: la misma que lanza el loader. Si algún día cambia, este esquema es el sitio donde se nota."
    },
    {
      "fragmento": "export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {",
      "nota": "error es unknown. Los params de la ruta, en cambio, sí están tipados: también llegan como prop."
    },
    {
      "fragmento": "isRouteErrorResponse(error) ? ErrorEtapa.safeParse(error.data) : null",
      "nota": "Primero, ¿es una respuesta del router? Si no (un Error al pintar, por ejemplo), null. Si sí, safeParse comprueba data sin lanzar."
    },
    {
      "fragmento": "validado?.success ? validado.data.mensaje : 'No hemos podido mostrar esta etapa.'",
      "nota": "Solo si cuadra se pinta el mensaje, y entonces validado.data.mensaje es string de verdad. Si no, un mensaje genérico: nunca un undefined en pantalla, ni un detalle interno."
    },
    {
      "fragmento": "const noEncontrada = isRouteErrorResponse(error) && error.status === 404",
      "nota": "Etapa no encontrada solo si es un 404. Un 500, o un Error al pintar, dice Error al mostrar la etapa: no le hagas creer al peregrino que la etapa no existe cuando lo que ha fallado es otra cosa."
    }
  ]
}
```

## Ejercicio en vivo: las visitas guiadas de Las Médulas

Una app pequeña en modo datos, con un registro de rutas escrito a mano y un middleware que deja en el contexto la guía de turno. Tiene tres errores de tipos, y dos de ellos son también fallos que se ven. El panel de errores de tipos te dice dónde están; los comentarios numerados, qué hacer.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las Médulas: tipos de punta a punta en modo datos",
  "consigna": "Deja el panel de errores de tipos limpio y que la app funcione. En App.tsx: 1) pon una Guia entera en el contexto. En paginas.tsx: 2) usa en href un patrón registrado; 3) comprueba params.id antes de buscar; 4) dale a useLoaderData el tipo de cargarFicha; 5) en ErrorRuta, enseña el mensaje de data si de verdad es un texto, y «Esa dirección no existe.» si es otro 404. Prueba /rutas/inventada y /no/existe en la barra.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, type MiddlewareFunction } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { cargarFicha, ErrorRuta, Ficha, Lista } from './paginas'\nimport { guiaContext } from './contexto'\nimport './estilos.css'\n\n// Las páginas de la app, registradas a mano: así href() solo acepta estas\ndeclare module 'react-router' {\n  interface Register {\n    pages: {\n      '/': { params: {} }\n      '/rutas/:id': { params: { id: string } }\n    }\n  }\n}\n\nconst guiaDeTurno: MiddlewareFunction = async ({ context }, next) => {\n  // 1. El contexto espera una Guia entera: Nuria habla español, gallego e inglés\n  context.set(guiaContext, 'Nuria Álvarez')\n  return next()\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    middleware: [guiaDeTurno],\n    ErrorBoundary: ErrorRuta,\n    children: [\n      { index: true, Component: Lista },\n      { path: 'rutas/:id', loader: cargarFicha, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "paginas.tsx",
      "codigo": "import { data, href, Link, useLoaderData, useRouteError, type LoaderFunctionArgs } from 'react-router'\nimport { guiaContext } from './contexto'\nimport { buscarRuta, todasLasRutas } from './rutas'\n\nexport function Lista() {\n  return (\n    <main>\n      <h1>Visitas guiadas a Las Médulas</h1>\n      <ul>\n        {todasLasRutas().map((ruta) => (\n          <li key={ruta.id}>\n            {/* 2. El patrón tiene que ser uno de los registrados */}\n            <Link to={href('/ruta/:id', { id: ruta.id })}>{ruta.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n\nexport async function cargarFicha({ params, context }: LoaderFunctionArgs) {\n  // 3. params.id puede ser undefined: compruébalo antes de buscar\n  const ruta = buscarRuta(params.id)\n  if (!ruta) throw data({ mensaje: 'No hay ninguna ruta guiada con ese nombre.' }, { status: 404 })\n  return { ruta, guia: context.get(guiaContext) }\n}\n\nexport function Ficha() {\n  // 4. Dale a useLoaderData el tipo de cargarFicha\n  const { ruta, guia } = useLoaderData()\n  return (\n    <main>\n      <h1>{ruta.nombre}</h1>\n      <p>Salida a las {ruta.salida} desde el aparcamiento. {ruta.km.toLocaleString('es-ES')} km.</p>\n      <p>Guía de turno: {guia.nombre} ({guia.idiomas.join(', ')})</p>\n      <Link to={href('/')}>Todas las visitas</Link>\n    </main>\n  )\n}\n\nexport function ErrorRuta() {\n  const error = useRouteError()\n  // 5. Estrecha el error con isRouteErrorResponse. Si data trae un mensaje de\n  // texto, enséñalo; si es otro 404, «Esa dirección no existe.»\n  return (\n    <main>\n      <p role=\"alert\">Algo ha fallado.</p>\n      <Link to={href('/')}>Todas las visitas</Link>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "contexto.ts",
      "codigo": "import { createContext } from 'react-router'\nimport type { Guia } from './rutas'\n\n// Sin valor por defecto: leerlo sin que el middleware lo haya puesto lanza un error\nexport const guiaContext = createContext<Guia>()\n"
    },
    {
      "nombre": "rutas.ts",
      "codigo": "// Datos de ejemplo de las visitas guiadas de Las Médulas (León)\nexport type Ruta = { id: string; nombre: string; km: number; salida: string }\nexport type Guia = { nombre: string; idiomas: string[] }\n\nconst RUTAS: Ruta[] = [\n  { id: 'orellan', nombre: 'Mirador de Orellán', km: 2.4, salida: '10:00' },\n  { id: 'galerias', nombre: 'La Cuevona y La Encantada', km: 3.1, salida: '11:30' },\n  { id: 'lago-sumido', nombre: 'Lago Sumido', km: 4.6, salida: '16:00' },\n  { id: 'perimetral', nombre: 'Senda Perimetral', km: 9.2, salida: '9:30' },\n]\n\nexport function todasLasRutas(): Ruta[] {\n  return RUTAS\n}\n\nexport function buscarRuta(id: string): Ruta | undefined {\n  return RUTAS.find((ruta) => ruta.id === id)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body { font-family: system-ui, sans-serif; margin: 0; background: #fbf4ec; color: #3b2418; }\nmain { max-width: 36rem; margin: 0 auto; padding: 1rem; }\nh1 { color: #a3401f; font-size: 1.4rem; }\nul { padding-left: 1.2rem; line-height: 1.8; }\na { color: #a3401f; }\n[role='alert'] { background: #f7dccf; border-left: 4px solid #a3401f; padding: 0.5rem 0.75rem; }\n"
    }
  ],
  "archivoInicial": "paginas.tsx",
  "urlInicial": "/",
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Pulsar «Mirador de Orellán» en la lista lleva a /rutas/orellan",
      "urlInicial": "/",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Mirador de Orellán"
          }
        }
      ],
      "espera": {
        "url": "/rutas/orellan"
      }
    },
    {
      "descripcion": "La ficha dice quién es la guía de turno y qué idiomas habla",
      "urlInicial": "/rutas/galerias",
      "pasos": [],
      "espera": {
        "texto": "Guía de turno: Nuria Álvarez (español, gallego, inglés)"
      }
    },
    {
      "descripcion": "Una ruta guiada que no existe enseña el mensaje que lanzó el loader",
      "urlInicial": "/rutas/inventada",
      "pasos": [],
      "espera": {
        "texto": "No hay ninguna ruta guiada con ese nombre."
      }
    },
    {
      "descripcion": "Una dirección que no es de ninguna ruta dice que no existe",
      "urlInicial": "/no/existe",
      "pasos": [],
      "espera": {
        "texto": "Esa dirección no existe."
      }
    }
  ]
}
```

Al empezar hay estos tres errores, aquí como los da `tsc` con las opciones del panel (en el panel salen con su archivo y su línea):

```text
App.tsx(19,28): error TS2345: Argument of type 'string' is not assignable to parameter of type 'Guia'.
paginas.tsx(13,28): error TS2345: Argument of type '"/ruta/:id"' is not assignable to parameter of type '"/" | "/rutas/:id"'.
paginas.tsx(23,27): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

El primero y el segundo rompen algo que se ve: la ficha no puede leer los idiomas de un texto, y el enlace lleva a `/ruta/orellan`, que no existe. El tercero, no: `buscarRuta(undefined)` devuelve `undefined` y el 404 sale igual. El paso 4 no tiene error: `useLoaderData()` sin genérico es `any`, y por eso no te avisa de nada. Y el paso 5 tampoco, porque `error.data` es `any`: es el que más fácil se escapa.

## Errores típicos

**`useLoaderData()` sin genérico.** Devuelve `any`, compila siempre y desactiva TypeScript en todo lo que toque. En el modo framework, usa la prop `loaderData`, que no necesita genérico; en el modo datos, `useLoaderData<typeof loader>()`.

**Un `as` para callar un error de tipos.** `loaderData.etapa as Etapa` hace desaparecer el `'etapa' is possibly 'null'`, pero la etapa sigue pudiendo faltar. El tipo te estaba avisando de un 500; el arreglo es lanzar el 404 en el `loader`.

**Devolver funciones o instancias de clases desde un `loader` de servidor.** No viajan: llegan como `undefined` o como un objeto sin métodos, y la hidratación falla. Y con `useLoaderData<typeof loader>()` y `Route.LoaderArgs`, el tipo ni siquiera te avisa.

**Fiarse de un `loader` sin argumentos en el modo datos.** Al revés: el tipo te avisa de que una función puede ser `undefined`, y en el modo datos no lo es. Pon el tipo de los argumentos en la firma.

**`tsc` sin `typegen` delante.** En la integración continua no hay `.react-router/`, y `tsc` solo da un `Cannot find module './+types/…'` por cada ruta. El script es `react-router typegen && tsc`.

**Rutas escritas como plantillas de texto.** `` `/etapas/${etapa.slug}` `` no sabe si la ruta existe ni codifica el parámetro. `href('/etapas/:etapa', { etapa: etapa.slug })` sí.

**Un valor por defecto de mentira en `createContext`.** Esconde el olvido del middleware detrás de un valor inventado. Sin valor por defecto, el olvido falla en la primera petición.

**Pintar `error.data.mensaje` sin comprobarlo.** `data` es `any`: el tipo no te protege. Con otro error (el 404 del router, un fallo de red), sale `undefined` o la página rompe dentro del propio `ErrorBoundary`.

## La lección 15 en el taller

Empiezas donde te dejó la 14: `npm run typecheck` con un error y los tests de la 15 en rojo:

```text
$ npm run leccion -- 15
 ❯ pruebas/15-tipos.test.tsx (5 tests | 5 failed) 12ms
   ❯ lección 15: tipos de punta a punta (5)
     × lanza un 404 cuando la etapa no existe 4ms
     × pinta el mensaje validado del error de ruta 4ms
     × usa un mensaje genérico si los datos del error no cuadran 1ms
     × no presenta como etapa ausente un error que no sea 404 1ms
     × tipa enlaces dinámicos y contextos sin valor por defecto 2ms
```

La comprobación principal de esta lección no es un test, es `npm run typecheck`. Si te atascas, la app terminada está en la [rama `solucion`](https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller).

### Paso 1. El `loader` y el componente de la etapa (`app/routes/etapa.tsx`)

- Importa `type { Route }` de `./+types/etapa` y ponle `Route.LoaderArgs` al `loader`.
- Cambia el componente: que reciba `{ loaderData }` con `Route.ComponentProps` y quita `useLoaderData()`.
- Cambia el tipo del argumento del `clientLoader` de marcador por `Route.ClientLoaderArgs`, sin tocar lo que hace (`return serverLoader()`). Verás los cuatro `'etapa' is possibly 'null'`.
- En el `loader`, si no hay etapa, **lanza** `data({ mensaje: 'No conocemos esa etapa del Camino.' }, { status: 404 })`. Los cuatro errores desaparecen.
- Ya que estás, cambia el `to="/etapas"` del enlace por `href('/etapas')` y dale a la página un `<title>` con el origen y el destino de la etapa.

Test: «lanza un 404 cuando la etapa no existe». La caché del `clientLoader` es de la lección 16.

### Paso 2. El `ErrorBoundary` de la etapa (`app/routes/etapa.tsx`)

Cambia la firma por `{ error }: Route.ErrorBoundaryProps`. Define con `zod/mini` un esquema con un `mensaje` de texto, estrecha el error con `isRouteErrorResponse` y valida `error.data` con `safeParse`. Si cuadra, pinta el mensaje; si no, «No hemos podido mostrar esta etapa.». El `<h1>` (y el `<title>`) dice «Etapa no encontrada» solo si el estado es 404, y «Error al mostrar la etapa» en cualquier otro caso. Añade un enlace a todas las etapas. Tests: «pinta el mensaje validado del error de ruta», «usa un mensaje genérico si los datos del error no cuadran» y «no presenta como etapa ausente un error que no sea 404».

### Paso 3. Enlaces con `href()` (`app/routes/etapas.tsx`)

Cambia la plantilla de texto del enlace de cada etapa por `href('/etapas/:etapa', { etapa: etapa.slug })`. No hay test que lo distinga (las dos dan la misma dirección): lo comprueba el `typecheck`. Prueba a escribir mal el patrón y mira el error.

### Paso 4. El contexto sin valor por defecto (`app/contexto.server.ts`)

Quita el hospitalero inventado de `hospitaleroContext` y el `{} as Sesion` de `sesionContext`: los dos, `createContext<…>()` sin argumentos. Test: «tipa enlaces dinámicos y contextos sin valor por defecto», que lee `hospitaleroContext` de un `RouterContextProvider` vacío y espera `No value found for context`.

### Para terminar

```text
$ npm run typecheck
> react-router typegen && tsc

$ npm run leccion -- 15
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

Sin errores de tipos, y así se queda hasta la 22. En la tabla del taller: 15 tests en verde y 83 en rojo. Abre `/etapas/inventada` en el navegador: tu `ErrorBoundary`, con un 404.

Y entra en `/etapas` y pulsa una etapa: la ficha sale bien (lo comprobamos en Chromium). Al navegar se ejecuta el `clientLoader` de marcador, que de momento solo llama a `serverLoader()`, es decir, pide los datos al servidor como si no existiera. En la lección 16 lo cambias por una caché.

### Retos para seguir practicando

Sin comprobación automática.

1. **Cambia un patrón.** En `routes.ts`, pasa `etapas/:etapa` a `etapas/:slug`. Ejecuta `npm run typecheck` y cuenta cuántos sitios te señala. Después, vuelve a dejarlo como estaba.
2. **La serialización en tu taller.** Añade al `loader` de la etapa un `consultada: new Date()` y pinta su año. Después prueba con `consultada: new Date().toLocaleString('es-ES')`. ¿Qué tipo tiene en cada caso? ¿Cuál puede dar un error de hidratación si el servidor está en otra zona horaria? (Lección 98 de React.)
3. **Un registro a mano.** En el ejercicio de Las Médulas, añade una ruta `/rutas/:id/reservar` sin registrarla y enlázala con `href`. ¿Qué dice el panel? ¿Y si la registras y te olvidas de crear la ruta?
4. **Un guard sin Zod.** Escribe para el `ErrorBoundary` de la etapa una función `esErrorDeEtapa(valor: unknown): valor is { mensaje: string }`, como la del ejercicio, y compara: ¿qué te da Zod que no te dé el guard?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Documentación",
  "recursos": [
    {
      "titulo": "Type Safety",
      "descripcion": "Cómo genera React Router los tipos de cada ruta, y el comando typegen.",
      "url": "https://reactrouter.com/explanation/type-safety",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Route Module Type Safety",
      "descripcion": "Configurar los tipos generados en un proyecto: .gitignore, rootDirs y typegen antes de tsc.",
      "url": "https://reactrouter.com/how-to/route-module-type-safety",
      "etiqueta": "React Router"
    },
    {
      "titulo": "href",
      "descripcion": "Construir direcciones a partir de patrones, con sus parámetros tipados.",
      "url": "https://reactrouter.com/api/utils/href",
      "etiqueta": "React Router"
    },
    {
      "titulo": "createContext",
      "descripcion": "Claves tipadas para el contexto del router, con y sin valor por defecto.",
      "url": "https://reactrouter.com/api/utils/createContext",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Error Boundaries",
      "descripcion": "Qué llega a un ErrorBoundary y cómo distinguir una respuesta de error de un fallo.",
      "url": "https://reactrouter.com/how-to/error-boundary",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Declaration Merging",
      "descripcion": "La documentación de TypeScript sobre fusionar interfaces y aumentar módulos, lo que hace +routes.ts.",
      "url": "https://www.typescriptlang.org/docs/handbook/declaration-merging.html",
      "etiqueta": "TypeScript"
    }
  ]
}
```
