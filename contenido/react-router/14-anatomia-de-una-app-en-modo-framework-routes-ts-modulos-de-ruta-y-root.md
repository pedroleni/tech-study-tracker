# Anatomía de una app en modo framework: `routes.ts`, módulos de ruta y `root.tsx`

- **Módulo:** Modo framework
- **Slug:** `anatomia-de-una-app-en-modo-framework-routes-ts-modulos-de-ruta-y-root-tsx` (autogenerado del título)
- **Orden:** 140
- **Fuentes:** [Installation](https://reactrouter.com/start/framework/installation) + [Routing](https://reactrouter.com/start/framework/routing) + [Route Module](https://reactrouter.com/start/framework/route-module) + [Special Files](https://reactrouter.com/explanation/special-files) + [File Route Conventions](https://reactrouter.com/how-to/file-route-conventions) + [react-router.config.ts](https://reactrouter.com/api/framework-conventions/react-router.config.ts) + [Framework Adoption from RouterProvider](https://reactrouter.com/upgrading/router-provider) — ver `contenido/react-router/TEMARIO.md` #14
- **Requiere:** Los módulos 1 a 3 de esta ficha. De React, la 87 (renderizar en el servidor e hidratar) y la 98 (la revista en modo framework)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

En los módulos 1 a 3 el router era un objeto que creabas tú: `createBrowserRouter([...])` con un array de rutas, cada una con su `path`, su `loader`, su `action` y su `Component`, y un `<RouterProvider>` que lo pintaba. Todo pasaba en el navegador.

En el **modo framework**, las mismas piezas se reparten en archivos con nombre y sitio fijos, y un plugin de Vite las junta. A cambio de seguir sus convenciones, te da lo que en el modo datos tendrías que montar a mano: renderizar cada página en el servidor, partir el JavaScript por rutas, los tipos de cada ruta generados solos y un servidor de producción. La revista de la lección 98 de React lo usó como una receta, paso a paso. **Esta lección la desmonta pieza por pieza, para que sepas qué hace cada archivo y por qué está donde está.**

Lo vas a practicar en tu ordenador, en el **taller**: la web del Albergue de peregrinos El Cea, en Sahagún (León), en el Camino Francés. Es un albergue ficticio, con 24 camas, que crece lección a lección hasta la 22. Hoy la dejas con todas sus rutas registradas y su documento HTML completo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los cuatro archivos que definen una app en modo framework",
  "roles": [
    {
      "etiqueta": "app/routes.ts",
      "rol": "Qué URL va a qué archivo",
      "descripcion": "Las rutas como datos: un patrón y la ruta de un módulo. React Router lo lee al construir, antes de ejecutar nada, para partir el código y generar los tipos."
    },
    {
      "etiqueta": "Un módulo de ruta",
      "rol": "Todo lo de una ruta",
      "descripcion": "Un archivo que exporta el componente por defecto y, si le hacen falta, loader, action, ErrorBoundary, middleware y el resto. Lo que eran las claves del objeto de ruta."
    },
    {
      "etiqueta": "app/root.tsx",
      "rol": "La madre de todas",
      "descripcion": "La ruta raíz, obligatoria. Su Layout pinta el documento entero, desde <html>: aquí no hay index.html."
    },
    {
      "etiqueta": "react-router.config.ts",
      "rol": "Cómo se construye",
      "descripcion": "Opcional. Si hay servidor o no, qué se prerenderiza, cómo se parte el código, dónde está app/. El plugin de Vite lo lee al arrancar."
    }
  ]
}
```

## El taller: el albergue El Cea

Las lecciones 14 a 22 se hacen en una app de verdad, que se ejecuta en tu ordenador. La vista previa de esta web no puede: el modo framework necesita un servidor de Node, un plugin de Vite y un build que parte el código en dos.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-router-proyectos, carpeta taller. La rama main trae la app con un comentario TODO (lección N) en cada sitio donde va tu trabajo, y una batería de tests por lección. La rama solucion tiene la app terminada, por si te atascas. La cooperativa de la lección 24 vive en el mismo repositorio: es el examen final del módulo."
}
```

### Del cero al taller en marcha

Necesitas **Node.js 22.22.2 o superior** (React Router 8 pide 22.22; jsdom, con el que corren los tests, 22.22.2). La versión LTS actual, la 24, va bien. Compruébalo con `node --version`.

1. **Clona el repositorio** y entra en la carpeta del taller: `git clone https://github.com/pedroleni/react-router-proyectos.git` y `cd react-router-proyectos/taller`.
2. **Instala con `npm ci`**, no con `npm install`. `npm ci` instala exactamente las versiones de `package-lock.json` y falla si no cuadran con `package.json`: así tienes las mismas que se usaron para escribir estas lecciones (React Router 8.5.0, React 19.3.1, Vite 8.3.5 y TypeScript 7.0.2, entre otras).

```text
$ npm ci
added 246 packages, and audited 247 packages in 2s

62 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

3. **Arranca el servidor de desarrollo** con `npm run dev` y abre la dirección que imprime (normalmente `http://localhost:5173`).
4. **Ejecuta los tests de esta lección** en otra terminal: `npm run leccion -- 14`. El `--` le pasa el `14` al script, que lanza Vitest solo con `pruebas/14-*`. Con `npm test` corren todos.

Al empezar, casi todo está en rojo, y es a propósito. Solo pasan los cinco de `pruebas/00-base.test.ts`, que comprueban lo que ya viene hecho (los datos de las etapas, las fechas de Sahagún, la validación de una reserva):

```text
$ npm test
 Test Files  9 failed | 1 passed (10)
      Tests  93 failed | 5 passed (98)
```

Cada lección pone en verde sus tests y ninguno de una lección posterior. Los de la 14 son cinco:

```text
$ npm run leccion -- 14
 ❯ pruebas/14-anatomia.test.tsx (5 tests | 5 failed) 16ms
   ❯ lección 14: anatomía (5)
     × cuelga las rutas públicas de un layout 6ms
     × la ruta comodín responde con un 404 HTTP real 1ms
     × agrupa las rutas de hospitaleros bajo su layout 1ms
     × reconoce una etapa dinámica y la ruta comodín 1ms
     × declara el idioma del documento completo 7ms
```

### Por qué `npm run typecheck` falla al empezar

`npm run typecheck` es `react-router typegen && tsc`: primero genera los tipos de cada ruta y después comprueba el proyecto entero. Al empezar marca **20 errores**, y tampoco es un descuido:

```text
$ npm run typecheck
app/routes/camas.tsx(4,28): error TS2307: Cannot find module './+types/camas' or its corresponding type declarations.
app/routes/entrar.tsx(1,28): error TS2307: Cannot find module './+types/entrar' or its corresponding type declarations.
app/routes/etapa.tsx(6,32): error TS7031: Binding element 'params' implicitly has an 'any' type.
…
app/routes/portada.tsx(30,46): error TS2345: Argument of type '"/reservar"' is not assignable to parameter of type '"/"'.
app/routes/publico.tsx(13,29): error TS2345: Argument of type '"/etapas"' is not assignable to parameter of type '"/"'.
…
pruebas/15-tipos.test.tsx(60,35): error TS2554: Expected 1 arguments, but got 2.
```

Son de tres clases, y las tres salen de lo mismo: **`routes.ts` solo registra la portada**.

- **Diez `Cannot find module './+types/…'`.** Los módulos de ruta importan sus tipos de `./+types/<nombre>`, y `typegen` solo los genera para las rutas registradas.
- **Nueve con `href()`.** `href('/etapas')` solo acepta patrones de rutas registradas, y hoy la única es `"/"` (por eso el test de la 15 «espera un argumento»: `"/"` no tiene parámetros).
- **Uno en `etapa.tsx`**, un `params` sin tipo. Ese es el ejercicio de la lección 15.

Cuando registres las rutas, los diecinueve primeros desaparecen solos y queda uno. Tras la 15, ninguno. Así evolucionan los tests y los errores, comprobado en cada estado del taller (recortado):

```text
estado        tests verdes   tests rojos   errores de tipos
inicio              5             93              20
lección 14         10             88               1
lección 15         15             83               0
lección 16         24             74               0
lección 22         98              0               0
```

### Lo que ves en el navegador al empezar

La portada sale, pero **sin estilos y sin JavaScript**. Pide el HTML con `curl`, que lo enseña tal cual llega, sin ejecutar nada:

```text
$ curl -s http://localhost:5173/
<title>Albergue El Cea | Descanso en Sahagún</title><meta name="description" content="Albergue de peregrinos en Sahagún, con 24 camas y reserva por noche."/><main><section class="portada">…</main><!--$--><!--/$-->
```

(Recortado por en medio: es la portada, entera, y nada más.)

Ni `<!DOCTYPE>`, ni `<html>`, ni `<head>`, ni un solo `<script>`: el `Layout` de `root.tsx` todavía devuelve sus hijos sin envolverlos. Y cualquier otra dirección, como `/etapas`, no tiene ruta que la recoja: todavía no está registrada. Responde con un 404 y el `ErrorBoundary` de marcador de `root.tsx`, y en la terminal del servidor de desarrollo sale el error del router:

```text
$ curl -s http://localhost:5173/etapas
<main>TODO (lección 14): frontera de error general.</main><!--$--><!--/$-->

Error: No route matches URL "/etapas"
```

(La última línea es de la terminal donde corre `npm run dev`.) Hasta la lección 22, el `handleError` de `entry.server.tsx` hace lo mismo que React Router por defecto: escribe cada error del servidor en esa terminal. Cuando una página falle, mira ahí.

### Cómo está organizado

```text
app/
├── root.tsx                  el documento y el error general        ← 14, 16
├── routes.ts                 las rutas                               ← 14
├── entry.client.tsx          hidratar en el navegador                ← 22
├── entry.server.tsx          renderizar en el servidor               ← 17, 20, 22
├── routes/
│   ├── publico.tsx           layout: cabecera, menú y pie
│   ├── portada.tsx           /
│   ├── albergue.tsx          /albergue
│   ├── etapas.tsx            /etapas                                 ← 15
│   ├── etapa.tsx             /etapas/:etapa                          ← 15, 16
│   ├── camas.tsx             /camas                                  ← 17
│   ├── reservar.tsx          /reservar
│   ├── mi-camino.tsx         /mi-camino, solo en el navegador        ← 16
│   ├── entrar.tsx, salir.tsx                                         ← 18, 20
│   ├── no-encontrada.tsx     cualquier otra dirección, con su 404    ← 14
│   ├── hospitaleros/         la zona con sesión                      ← 18, 19
│   └── recursos/             etapas.json, sitemap.xml y el webhook   ← 19
├── datos/                    etapas, reservas, avisos (.server)      ← 16
└── …                         sesiones, seguridad, CSV, contexto
react-router.config.ts        la configuración del build              ← 14, 17, 20
pruebas/                      un archivo de tests por lección
```

Los módulos de las rutas públicas ya traen su `loader` y su componente. Hoy los conectas.

## Del objeto de ruta al módulo de ruta

Lo que en el modo datos era **un objeto con claves**, en el modo framework es **un archivo con exportaciones**. Cada clave tiene su exportación con nombre, salvo dos: el `path` y los `children` se van a `routes.ts`, y `lazy` desaparece, porque cada módulo ya se carga por separado.

```text
objeto de ruta (módulos 1 a 3)        módulo de ruta (modo framework)
path, index, children                 en app/routes.ts
Component                             export default function …
loader / action                       export async function loader / action   (en el servidor)
—                                     export async function clientLoader / clientAction   (lección 16)
ErrorBoundary / HydrateFallback       export function ErrorBoundary / HydrateFallback
middleware                            export const middleware = [ … ]   (en el servidor)
—                                     export const clientMiddleware = [ … ]   (lección 16)
shouldRevalidate / handle             export function shouldRevalidate / export const handle
lazy                                  sobra: cada módulo es su propio trozo de JavaScript
—                                     headers, links, meta   (lecciones 17 y 19)
```

Hay un cambio de fondo en la tabla: **`loader`, `action` y `middleware` pasan a ejecutarse en el servidor.** En el modo datos corrían en el navegador; aquí, la pareja que corre en el navegador se llama `clientLoader`, `clientAction` y `clientMiddleware`. Dónde se ejecuta cada cosa es la lección 16.

Este es un módulo de ruta del taller, la portada, recortado por el final:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { href, Link } from 'react-router'\nimport { leerAviso } from '~/datos/avisos.server'\nimport type { Route } from './+types/portada'\n\nexport async function loader() {\n  return { aviso: await leerAviso() }\n}\n\nexport default function Portada({ loaderData }: Route.ComponentProps) {\n  return (\n    <main>\n      <title>Albergue El Cea | Descanso en Sahagún</title>\n      <meta\n        name=\"description\"\n        content=\"Albergue de peregrinos en Sahagún, con 24 camas y reserva por noche.\"\n      />\n      {loaderData.aviso && (\n        <aside className=\"aviso-publico\" aria-live=\"polite\">\n          <strong>Aviso del Ayuntamiento:</strong> {loaderData.aviso.texto}\n        </aside>\n      )}",
  "anotaciones": [
    {
      "fragmento": "import type { Route } from './+types/portada'",
      "nota": "Los tipos de esta ruta, que React Router genera a partir de routes.ts. El archivo no está al lado: vive en .react-router/types, y tsconfig.json hace que parezca que sí. Lo hondo, en la lección 15."
    },
    {
      "fragmento": "import { leerAviso } from '~/datos/avisos.server'",
      "nota": "Un módulo .server: solo puede usarlo código que se ejecuta en el servidor. Aquí lo usa el loader, que React Router quita del JavaScript del navegador. La virgulilla es un alias de app/, definido en tsconfig.json."
    },
    {
      "fragmento": "export async function loader() {",
      "nota": "El loader de siempre, pero en el servidor: lee el aviso del Ayuntamiento del disco antes de pintar. En la lección 2 era la clave loader de un objeto."
    },
    {
      "fragmento": "export default function Portada({ loaderData }: Route.ComponentProps) {",
      "nota": "El componente, como exportación por defecto. Recibe lo que devolvió el loader como prop, loaderData, ya tipado. useLoaderData() también funciona aquí, pero la prop no necesita genérico."
    },
    {
      "fragmento": "<title>Albergue El Cea | Descanso en Sahagún</title>",
      "nota": "El título y la descripción, con las etiquetas de React 19 (lección 81 de React): las pinta el servidor en el head, y un buscador las lee sin ejecutar JavaScript."
    }
  ]
}
```

Si tienes una app en modo datos y quieres pasarla al modo framework, la guía oficial [Framework Adoption from RouterProvider](https://reactrouter.com/upgrading/router-provider) hace exactamente este viaje: primero mueve cada ruta a un archivo con estas exportaciones (y las carga con `lazy`, todavía con `createBrowserRouter`), después instala el plugin de Vite y, al final, cambia cada `lazy: () => import('./routes/about')` por un `file: './routes/about.tsx'` en `routes.ts`. El paso 4 del proyecto 25 lo aplica a una app real.

## `routes.ts`: las rutas como datos

En la rama `main`, `app/routes.ts` solo registra la portada:

```tsx
import { type RouteConfig, index } from '@react-router/dev/routes'

// TODO (lección 14): registra layouts, rutas dinámicas, recursos, la zona
// anidada de hospitaleros y el comodín. Busca Route Configuration.
export default [index('routes/portada.tsx')] satisfies RouteConfig
```

Es un **array de configuraciones de ruta** que exporta el módulo por defecto. `satisfies RouteConfig` comprueba la forma sin cambiar el tipo (lección 27 de TypeScript). No se ejecuta en el navegador: lo lee el plugin de Vite al arrancar y al construir, y `react-router typegen` para generar los tipos. Por eso es un archivo aparte, y no un objeto dentro de un componente: React Router tiene que conocer todas las rutas **antes** de ejecutar nada.

Se escribe con cuatro funciones de `@react-router/dev/routes`, que no hacen más que devolver objetos con `path`, `file`, `index` y `children`:

- **`route(patrón, archivo, hijas?)`**: una ruta con su segmento de URL. Con un array de hijas, es su madre, y las pinta en su `<Outlet>`.
- **`index(archivo)`**: la hija que se pinta en la URL de su madre. No puede tener hijas.
- **`layout(archivo, hijas)`**: una madre **sin segmento de URL**. Comparte interfaz (una cabecera, un menú) sin cambiar ninguna dirección.
- **`prefix(segmento, rutas)`**: **no crea ninguna ruta**. Solo antepone un segmento al patrón de cada una. Por eso va con `...`: devuelve un array que se esparce dentro del otro.

El albergue tiene que quedar así. `npx react-router routes` lo imprime a partir de `routes.ts`, como si fueran componentes `<Route>`, y es la forma más rápida de comprobar lo que has escrito:

```text
$ npx react-router routes
<Routes>
  <Route file="root.tsx">
    <Route file="routes/publico.tsx">
      <Route index file="routes/portada.tsx" />
      <Route path="albergue" file="routes/albergue.tsx" />
      <Route path="etapas" file="routes/etapas.tsx" />
      <Route path="etapas/:etapa" file="routes/etapa.tsx" />
      <Route path="camas" file="routes/camas.tsx" />
      <Route path="reservar" file="routes/reservar.tsx" />
      <Route path="mi-camino" file="routes/mi-camino.tsx" />
    </Route>
    <Route path="entrar" file="routes/entrar.tsx" />
    <Route path="salir" file="routes/salir.tsx" />
    <Route path="hospitaleros" file="routes/hospitaleros/zona.tsx">
      <Route index file="routes/hospitaleros/hoy.tsx" />
      <Route path="reservas/:id" file="routes/hospitaleros/reserva.tsx" />
      <Route path="pernoctas.csv" file="routes/hospitaleros/pernoctas-csv.ts" />
    </Route>
    <Route path="etapas.json" file="routes/recursos/etapas-json.ts" />
    <Route path="sitemap.xml" file="routes/recursos/sitemap.ts" />
    <Route path="api/avisos" file="routes/recursos/avisos.ts" />
    <Route path="*" file="routes/no-encontrada.tsx" />
  </Route>
</Routes>
```

Fíjate en tres cosas:

- **`root.tsx` no está en `routes.ts`**, pero envuelve a todas. Es la raíz por convención.
- **`publico.tsx` no tiene `path`.** Es un `layout()`: pone la cabecera con el menú y el pie a las siete páginas públicas, y ninguna dirección lleva `/publico`. `entrar` y `salir` no cuelgan de él: son páginas sin el menú público.
- **`pernoctas.csv`, `etapas.json` y `sitemap.xml` son rutas como las demás**, aunque respondan un archivo: son rutas de recursos, módulos sin componente (lección 19).

La parte pública se escribe así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default [\n  // L14: layout() comparte interfaz sin añadir un segmento a la URL.\n  layout('routes/publico.tsx', [\n    index('routes/portada.tsx'),\n    route('albergue', 'routes/albergue.tsx'),\n    route('etapas', 'routes/etapas.tsx'),\n    route('etapas/:etapa', 'routes/etapa.tsx'),\n    route('camas', 'routes/camas.tsx'),\n    route('reservar', 'routes/reservar.tsx'),\n    route('mi-camino', 'routes/mi-camino.tsx'),\n  ]),",
  "anotaciones": [
    {
      "fragmento": "layout('routes/publico.tsx', [",
      "nota": "Una madre sin segmento: las siete hijas se pintan en el Outlet de publico.tsx, y sus direcciones no cambian. Es lo que en la lección 2 era un objeto de ruta sin path."
    },
    {
      "fragmento": "index('routes/portada.tsx'),",
      "nota": "La portada, en /: la URL de su madre, que es la de root."
    },
    {
      "fragmento": "route('etapas/:etapa', 'routes/etapa.tsx'),",
      "nota": "Un segmento dinámico, como en la lección 77 de React. Es hermana de etapas, no hija: la ficha de una etapa no se pinta dentro de la lista, sino en su lugar. Si fuera hija, etapas.tsx necesitaría un Outlet."
    },
    {
      "fragmento": "'routes/mi-camino.tsx'",
      "nota": "Las rutas de archivo son relativas a la carpeta app/. El nombre del archivo no tiene por qué parecerse a la URL: aquí, sí, por claridad."
    }
  ]
}
```

### `prefix` o una ruta madre

Las rutas de los hospitaleros comparten el principio de la dirección, `/hospitaleros`. Parece el caso de `prefix`, y la documentación lo usa así en sus ejemplos. Pruébalo: cambia en una copia el `route('hospitaleros', 'routes/hospitaleros/zona.tsx', [...])` por un `...prefix('hospitaleros', [...])` con las mismas tres hijas, y vuelve a pedir el árbol:

```text
    <Route path="hospitaleros" index file="routes/hospitaleros/hoy.tsx" />
    <Route path="hospitaleros/reservas/:id" file="routes/hospitaleros/reserva.tsx" />
    <Route path="hospitaleros/pernoctas.csv" file="routes/hospitaleros/pernoctas-csv.ts" />
```

Las direcciones son las mismas, pero **`zona.tsx` ha desaparecido del árbol**: ahora son tres rutas sueltas, hijas de root. Y en el taller `zona.tsx` hace falta, porque es donde vivirán el `middleware` que pide sesión a toda la zona (lección 18) y su `Cache-Control: private, no-store` (lección 17), y donde se pinta la cabecera de los hospitaleros. Con `prefix`, cada hija tendría que protegerse por su cuenta. El test «agrupa las rutas de hospitaleros bajo su layout» lo exige: busca una ruta con `path` `hospitaleros`, con su archivo y sus tres hijas.

**`prefix` sirve para ahorrar escritura; una ruta madre, para compartir código.** Si las rutas solo comparten el principio de la URL, `prefix`. Si comparten un middleware, un `loader`, un `ErrorBoundary` o una interfaz, `route` con hijas, o `layout` si además no quieres segmento.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// app/routes.ts: el comodín, el primero de la lista\nexport default [\n  route('*', 'routes/no-encontrada.tsx'),\n  layout('routes/publico.tsx', [\n    index('routes/portada.tsx'),\n    route('etapas', 'routes/etapas.tsx'),\n    route('etapas/:etapa', 'routes/etapa.tsx'),\n    // …\n  ]),\n  // …\n] satisfies RouteConfig\n\n// ¿Qué archivo pinta /etapas/sahagun-el-burgo-ranero?",
  "opciones": [
    "no-encontrada.tsx: el comodín va primero y lo recoge todo",
    "etapa.tsx: React Router elige el patrón más específico, no el primero",
    "Ninguno: el build falla porque el comodín tiene que ir el último",
    "etapas.tsx, porque empieza igual"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos con matchRoutes sobre esta lista: /etapas va a etapas.tsx, la etapa a etapa.tsx y /no/existe a no-encontrada.tsx, igual que con el comodín al final. React Router puntúa cada patrón (los segmentos fijos valen más que los dinámicos, y estos más que el comodín) y se queda con el mejor. El comodín se escribe al final solo para que se lea mejor, como dice el comentario del taller."
}
```

### Lo que falla en `routes.ts`

`routes.ts` se lee al arrancar, así que sus fallos salen en la terminal, no en el navegador. Si escribes mal el archivo de un módulo (`routes/alberge.tsx`), `npm run dev` no llega a arrancar:

```text
Error: ENOENT: no such file or directory, open '…/app/routes/alberge.tsx'
```

Y si apuntas dos rutas al mismo archivo, `npx react-router routes` y el servidor de desarrollo se niegan:

```text
Error: Route config in "routes.ts" is invalid.

Error: Unable to define routes with duplicate route id: "routes/albergue"
```

Cada ruta tiene un **id**, que por defecto es su archivo sin extensión (`routes/albergue`), y tiene que ser único. Si de verdad quieres el mismo módulo en dos direcciones, dale a una su propio id con el tercer argumento: `route('sobre-nosotros', 'routes/albergue.tsx', { id: 'sobre-nosotros' })`.

### La alternativa: rutas a partir de los nombres de archivo

Si prefieres que las rutas salgan de los nombres de los archivos, como en Remix 2 o en Next.js, existe `@react-router/fs-routes` (8.5.0, la misma versión que el resto). Se instala aparte (`npm i @react-router/fs-routes`) y `routes.ts` queda en una línea:

```tsx
import { type RouteConfig } from '@react-router/dev/routes'
import { flatRoutes } from '@react-router/fs-routes'

export default flatRoutes() satisfies RouteConfig
```

Cada archivo de `app/routes/` pasa a ser una ruta, y su nombre dice dónde va. Lo probamos con estos once archivos, que reproducen una parte del albergue:

```text
$ ls app/routes
$.tsx                          _publico.etapas_.$etapa.tsx    hospitaleros.pernoctas[.csv].ts
_publico._index.tsx            _publico.tsx                   hospitaleros.reservas.$id.tsx
_publico.albergue.tsx          etapas[.json].ts               hospitaleros.tsx
_publico.etapas.tsx            hospitaleros._index.tsx

$ npx react-router routes
<Routes>
  <Route file="root.tsx">
    <Route path="etapas.json" file="routes/etapas[.json].ts" />
    <Route path="hospitaleros" file="routes/hospitaleros.tsx">
      <Route path="pernoctas.csv" file="routes/hospitaleros.pernoctas[.csv].ts" />
      <Route path="reservas/:id" file="routes/hospitaleros.reservas.$id.tsx" />
      <Route index file="routes/hospitaleros._index.tsx" />
    </Route>
    <Route file="routes/_publico.tsx">
      <Route path="etapas/:etapa" file="routes/_publico.etapas_.$etapa.tsx" />
      <Route path="albergue" file="routes/_publico.albergue.tsx" />
      <Route index file="routes/_publico._index.tsx" />
      <Route path="etapas" file="routes/_publico.etapas.tsx" />
    </Route>
    <Route path="*" file="routes/$.tsx" />
  </Route>
</Routes>
```

El mismo árbol, con otras reglas:

- **El punto es una barra**: `hospitaleros.reservas.$id.tsx` es `hospitaleros/reservas/:id`, y además cuelga de `hospitaleros.tsx`, porque empieza igual.
- **`$` es un parámetro**, y `$.tsx` a secas, el comodín.
- **`_index`** es la ruta índice.
- **Un `_` delante** (`_publico`) es un layout: hace de madre sin poner segmento.
- **Un `_` detrás** (`etapas_`) rompe el anidamiento: `_publico.etapas_.$etapa.tsx` cuelga del layout, no de `etapas.tsx`. Sin él, la ficha sería hija de la lista.
- **Los corchetes escapan**: `etapas[.json].ts` es la dirección `/etapas.json`, con su punto.

Las dos formas se pueden mezclar en un mismo `routes.ts` (`...(await flatRoutes())` junto a tus `route()`). El taller usa la configuración, que se lee de un vistazo y no obliga a nombres como `_publico.etapas_.$etapa.tsx`. En un equipo que viene de Remix 2 encontrarás a menudo la otra.

## `root.tsx`: el documento entero

En el modo datos, el documento lo ponía `index.html` y React se montaba dentro de un `<div id="root">`. Aquí **no hay `index.html`**: el servidor genera la página entera, desde `<!DOCTYPE html>`, y la saca de `root.tsx`. Así lo dejas hoy:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function Layout({ children }: { children: React.ReactNode }) {\n  // L14: Layout envuelve también ErrorBoundary y cualquier HydrateFallback.\n  return (\n    <html lang=\"es\">\n      <head>\n        <meta charSet=\"utf-8\" />\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n        <Meta />\n        <Links />\n      </head>\n      <body>\n        {children}\n        <ScrollRestoration />\n        <Scripts />\n      </body>\n    </html>\n  )\n}\n\nexport default function App() {\n  return <Outlet />\n}",
  "anotaciones": [
    {
      "fragmento": "export function Layout({ children }: { children: React.ReactNode }) {",
      "nota": "El esqueleto del documento. React Router lo pinta siempre alrededor de lo que toque: el componente de root, su ErrorBoundary o un HydrateFallback. Así, una página de error también lleva su head, sus estilos y sus scripts."
    },
    {
      "fragmento": "<html lang=\"es\">",
      "nota": "El idioma del documento, que usan los lectores de pantalla y los buscadores. Es lo que comprueba el último test de la lección."
    },
    {
      "fragmento": "<Meta />",
      "nota": "Pinta lo que devuelven las exportaciones meta de las rutas. En el taller ninguna lo usa: cada página pone su title con la etiqueta de React 19, que la documentación recomienda desde React 19. Se deja por si alguna ruta lo necesita."
    },
    {
      "fragmento": "<Links />",
      "nota": "Pinta las exportaciones links de las rutas y las hojas de estilos que importan sus módulos. Sin él, app.css no llega: lo probamos, y el HTML salió sin ningún link rel=stylesheet."
    },
    {
      "fragmento": "<ScrollRestoration />",
      "nota": "Devuelve el desplazamiento al volver atrás y lo lleva arriba al navegar, como en la lección 12. Va antes de Scripts."
    },
    {
      "fragmento": "<Scripts />",
      "nota": "Los datos de los loader para la hidratación y el import del JavaScript de entry.client. Sin él, la página se ve, pero no se hidrata: los enlaces recargan la página entera y nada responde a un clic."
    },
    {
      "fragmento": "export default function App() {",
      "nota": "El componente de la ruta raíz: aquí solo un Outlet, donde se pintan publico.tsx, entrar.tsx o la zona de hospitaleros. Si root tuviera un menú común a todo, iría aquí, no en Layout."
    }
  ]
}
```

Con eso, el documento ya llega completo. Este es el principio de lo que manda el servidor de desarrollo, con las etiquetas seguidas, como llegan:

```text
$ curl -s http://localhost:5173/ | grep -o '^.*</head>'
<!DOCTYPE html><html lang="es"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Albergue El Cea | Descanso en Sahagún</title><meta name="description" content="Albergue de peregrinos en Sahagún, con 24 camas y reserva por noche."/><link rel="modulepreload" href="/app/entry.client.tsx"/><link rel="modulepreload" href="/app/root.tsx"/><link rel="modulepreload" href="/app/routes/publico.tsx"/><link rel="modulepreload" href="/app/routes/portada.tsx"/><link data-react-router-critical-css="" rel="stylesheet" href="/@react-router/critical.css?pathname=/"/></head>
```

El `title` y la descripción los puso la portada. Los `modulepreload` anuncian el JavaScript que esta página va a necesitar: el de entrada, root, publico y portada, y nada de las demás rutas (es el reparto por rutas). La hoja de estilos la pone `<Links />`; en desarrollo es una hoja «crítica» que genera el servidor, y en el build, el CSS de verdad (`/assets/root-….css`). Y al final del `<body>`, lo que deja `<Scripts />`:

```text
  window.__reactRouterRouteModules = {"root":route0,"routes/publico":route1,"routes/portada":route2};
import("/app/entry.client.tsx");</script>
<script>window.__reactRouterContext.streamController.enqueue("[{\"_1\":2,\"_3\":-5,\"_4\":-5},\"loaderData\",{\"_5\":6},\"actionData\",\"errors\",\"routes/portada\",{\"_7\":-5},\"aviso\"]\n");</script>
```

(En desarrollo, el `import` apunta al archivo fuente, `/app/entry.client.tsx`; en el build, a uno de `/assets`.) Son los datos del `loader` de la portada (`aviso`, vacío hoy), que viajan dentro del HTML para que el navegador no tenga que volver a pedirlos al hidratar, como contó la lección 98 de React.

### El `ErrorBoundary` de root y el 404 de verdad

El `ErrorBoundary` de `root.tsx` es el último recurso: recoge cualquier error que no haya recogido una ruta más abajo. El del taller distingue un 404 del resto y enseña la pila solo en desarrollo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {\n  const noExiste = isRouteErrorResponse(error) && error.status === 404\n  const detalle = import.meta.env.DEV && error instanceof Error ? error.stack : undefined\n  return (\n    <main className=\"pagina estrecha\">\n      <title>{noExiste ? 'Página no encontrada | Albergue El Cea' : 'Error | Albergue El Cea'}</title>\n      <meta name=\"robots\" content=\"noindex\" />\n      <h1>{noExiste ? 'Esta página no existe' : 'Algo ha fallado'}</h1>\n      <p>\n        {noExiste\n          ? 'Comprueba la dirección o vuelve al inicio.'\n          : 'No hemos podido preparar esta página. Inténtalo de nuevo dentro de un rato.'}\n      </p>\n      {detalle && <pre className=\"pila\">{detalle}</pre>}",
  "anotaciones": [
    {
      "fragmento": "export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {",
      "nota": "Recibe el error como prop. Es unknown: puede ser cualquier cosa que alguien lanzara. Por qué, en la lección 15."
    },
    {
      "fragmento": "isRouteErrorResponse(error) && error.status === 404",
      "nota": "Una respuesta lanzada con un 404 (por ejemplo, con data o con new Response) frente a cualquier otro fallo. La lección 8 contó cada caso."
    },
    {
      "fragmento": "import.meta.env.DEV && error instanceof Error ? error.stack : undefined",
      "nota": "La pila, solo en desarrollo. import.meta.env.DEV lo sustituye Vite al construir: en producción es false y la pila no se pinta. Además, en producción React Router ya sanea los errores que llegan al navegador (lección 20)."
    },
    {
      "fragmento": "<meta name=\"robots\" content=\"noindex\" />",
      "nota": "Que ningún buscador guarde una página de error."
    }
  ]
}
```

El 404 de las direcciones que no existen lo pone la ruta comodín. Pintar «Esta página no existe» no basta: el **estado** de la respuesta tiene que ser 404, o un buscador la guardará como una página más (lo vio la lección 98 de React, con `curl`). Su `loader` no tiene datos que dar, así que **devuelve** un `data()` vacío con el estado:

```tsx
export function loader() {
  // L14: data(null, { status: 404 }) conserva la pantalla y da un 404 HTTP real.
  return data(null, { status: 404 })
}
```

Devuelto, se pinta el componente de la ruta con un 404. Lanzado, se pintaría el `ErrorBoundary` de root. Las dos cosas responden 404; lo que cambia es qué página ve quien llega:

```text
$ curl -s -D - -o /dev/null http://localhost:5173/no/existe | head -1
HTTP/1.1 404
$ curl -s http://localhost:5173/no/existe | grep -o '<h1>[^<]*</h1>'
<h1>Esta página no existe</h1>
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// app/root.tsx: alguien quita <Scripts /> porque «la página se ve igual»\nexport function Layout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang=\"es\">\n      <head>\n        <Meta />\n        <Links />\n      </head>\n      <body>\n        {children}\n        <ScrollRestoration />\n      </body>\n    </html>\n  )\n}\n\n// Abres la portada y pulsas el enlace «Etapas» del menú. ¿Qué pasa?",
  "opciones": [
    "Lo mismo que antes: React Router navega sin recargar",
    "El navegador pide /etapas como documento nuevo: la página se recarga entera, sin error",
    "El enlace no hace nada: sin JavaScript, un Link no funciona",
    "Sale el ErrorBoundary de root"
  ],
  "correcta": 1,
  "explicacion": "Sin Scripts no se carga entry.client, así que nadie hidrata la página: lo que hay es el HTML del servidor, con enlaces a de verdad. Un enlace de HTML sigue funcionando, y el navegador pide la página nueva al servidor, que la renderiza entera. Se ve bien, pero cada clic es una recarga, los formularios no se envían con fetch y ningún botón con un onClick hace nada."
}
```

## `entry.client` y `entry.server`, y `react-router reveal`

Las dos llamadas de React que la lección 87 explicó, `renderToPipeableStream` en el servidor y `hydrateRoot` en el navegador, viven en dos archivos de entrada. **Son opcionales**: si no están en `app/`, React Router usa los suyos. La plantilla oficial no los trae; cuando necesitas cambiar algo, `react-router reveal` copia los que usa por defecto a tu proyecto. Lo probamos en una copia del taller sin ellos:

```text
$ npx react-router reveal
Entry file entry.client created at app/entry.client.tsx.
Entry file entry.server created at app/entry.server.tsx.
```

Y si ya existen, no los pisa:

```text
$ npx react-router reveal
Entry file app/entry.client.tsx already exists.
```

El taller **ya los trae revelados**, porque varias lecciones los cambian. El del navegador es el de React Router, con un comentario para la lección 22:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { startTransition, StrictMode } from 'react'\nimport { hydrateRoot } from 'react-dom/client'\nimport { HydratedRouter } from 'react-router/dom'\n\nstartTransition(() => {\n  hydrateRoot(\n    document,\n    <StrictMode>\n      {/* TODO (lección 22): añade onError para los fallos de navegación del navegador. */}\n      <HydratedRouter />\n    </StrictMode>,\n  )\n})",
  "anotaciones": [
    {
      "fragmento": "startTransition(() => {",
      "nota": "La hidratación va dentro de una transición: si mientras se hidrata llega un clic o una navegación, React puede atenderlo antes de terminar (lección 51 de React)."
    },
    {
      "fragmento": "hydrateRoot(",
      "nota": "Hidrata el documento entero, no un div: el servidor ha pintado desde html, y React lo adopta tal cual."
    },
    {
      "fragmento": "<StrictMode>",
      "nota": "El modo estricto, solo en desarrollo, como en una app de Vite: repite efectos y renders para destapar errores (lección 63 de React)."
    },
    {
      "fragmento": "<HydratedRouter />",
      "nota": "El RouterProvider del modo framework. No le pasas rutas: las lee del manifiesto que dejó Scripts en la página, y los datos de la primera carga, de window.__reactRouterContext."
    }
  ]
}
```

El del servidor, `entry.server.tsx`, exporta `handleRequest`: recibe la `Request`, el estado y las cabeceras que ha calculado React Router y el contexto con las rutas encajadas y sus datos, y devuelve la `Response` con el HTML. Hace lo que contó la 98: a un robot (lo decide `isbot`) le manda la página entera, con `onAllReady`; a una persona, el armazón en cuanto está, con `onShellReady`, y el resto a medida que llega. En el taller tiene además tres exportaciones que tocarás más adelante:

- **`streamTimeout`**: cuánto espera a los datos diferidos antes de cortar. El que saca `reveal` son 5 segundos; en la lección 17 lo ajustas.
- **`handleError`**: dónde se apunta cada error del servidor. Hasta la lección 22, solo lo escribe en la terminal, como haría React Router sin él.
- **`instrumentations`**: medir cada `loader` y cada `action` (lección 22).

Y este es el camino completo de una visita a la portada, con cada archivo en su sitio:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Una visita a / del albergue, de la petición a la página viva",
  "items": [
    {
      "fecha": "Navegador",
      "titulo": "Pide GET /",
      "texto": "Una petición de documento normal, la misma que haría sin JavaScript."
    },
    {
      "fecha": "Servidor",
      "titulo": "Encaja la URL con routes.ts",
      "texto": "La dirección / da tres rutas: root, publico (el layout) y portada (la índice). Es la misma rama que dibuja react-router routes."
    },
    {
      "fecha": "Servidor",
      "titulo": "Middleware y loader",
      "texto": "Se ejecutan los middleware y los loader de esas rutas, en paralelo los loader. Aquí solo hay uno, el de la portada, que lee el aviso del Ayuntamiento."
    },
    {
      "fecha": "Servidor",
      "titulo": "handleRequest de entry.server",
      "texto": "Renderiza ServerRouter con renderToPipeableStream: el Layout de root con App dentro, publico dentro de App y la portada dentro de publico. El HTML sale en cuanto está el armazón."
    },
    {
      "fecha": "Navegador",
      "titulo": "Pinta el HTML",
      "texto": "Ya se ve todo, con sus estilos (Links). Mientras, descarga en paralelo el JavaScript de esta página, que anuncian los modulepreload."
    },
    {
      "fecha": "Navegador",
      "titulo": "entry.client hidrata",
      "texto": "hydrateRoot con HydratedRouter adopta el HTML que ya hay. Los datos de la portada los lee de la propia página: no los vuelve a pedir."
    },
    {
      "fecha": "Navegador",
      "titulo": "Desde aquí, como en el modo datos",
      "texto": "Un clic en Etapas ya no pide HTML: React Router navega en el navegador y, si la ruta tiene loader, pide solo sus datos al servidor. Lo verás en la pestaña Red en la lección 16."
    }
  ]
}
```

## `react-router.config.ts`

El último archivo es opcional, y en la rama `main` está vacío: `export default {} as Config`. El plugin de Vite (`reactRouter()` en `vite.config.ts`) lo lee al arrancar. Así lo dejas hoy:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { Config } from '@react-router/dev/config'\n\nconst configuracion: Config = {\n  // La app usa renderizado de servidor para las páginas que cambian.\n  ssr: true,\n  // app/ es el valor por defecto; se deja escrito para enseñarlo en la lección 14.\n  appDirectory: 'app',\n  // TODO (lección 17): añade el array de rutas prerenderizadas.\n  // TODO (lección 20): autoriza el host público para las actions.\n}\n\nexport default configuracion",
  "anotaciones": [
    {
      "fragmento": "import type { Config } from '@react-router/dev/config'",
      "nota": "El tipo de la configuración, de @react-router/dev: una dependencia de desarrollo, como Vite. Nada de esto llega al servidor de producción."
    },
    {
      "fragmento": "ssr: true,",
      "nota": "Renderizar en el servidor cada petición de documento. Es el valor por defecto, y en el taller se escribe para que se vea. Con false, el build no tiene servidor: sale un index.html y la app funciona como una SPA (el SPA Mode, lección 17)."
    },
    {
      "fragmento": "appDirectory: 'app',",
      "nota": "Dónde están root.tsx, routes.ts y los módulos. app es el valor por defecto; el proyecto 25 usa src, porque la app que migra ya tenía esa carpeta."
    },
    {
      "fragmento": "// TODO (lección 17): añade el array de rutas prerenderizadas.",
      "nota": "El taller deja anunciado lo que viene: prerender en la 17 y allowedActionOrigins en la 20."
    }
  ]
}
```

El plugin, en `vite.config.ts`, es lo que convierte una app de Vite en una de React Router en modo framework. Sustituye al `react()` de una app normal:

```tsx
import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
})
```

(`tsconfigPaths: true` es la opción de Vite 8 que hace que el alias `~/` de `tsconfig.json` funcione también al construir.)

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Las opciones de react-router.config.ts que verás en este módulo",
  "items": [
    {
      "titulo": "ssr y prerender (lección 17)",
      "texto": "Si hay servidor que renderice cada visita, y qué direcciones se renderizan una sola vez, al construir. Se pueden mezclar: el albergue prerenderiza las páginas que no cambian y renderiza el resto en cada petición."
    },
    {
      "titulo": "splitRouteModules (lección 16)",
      "texto": "Partir cada módulo de ruta en varios trozos, para que el clientLoader se descargue sin esperar al componente. En la 8, activo por defecto."
    },
    {
      "titulo": "routeDiscovery (lección 16)",
      "texto": "Cómo descubre el navegador las rutas: poco a poco, preguntando a /__manifest (por defecto), o todas en la primera carga."
    },
    {
      "titulo": "allowedActionOrigins (lección 20)",
      "texto": "Desde qué dominios se aceptan envíos a las action. Por defecto, solo desde el propio."
    },
    {
      "titulo": "presets (lección 22)",
      "texto": "Configuración que traen los adaptadores de un proveedor, como Vercel."
    },
    {
      "titulo": "basename, buildDirectory, serverBuildFile",
      "texto": "Si la app vive en una subcarpeta del dominio, dónde deja el build sus archivos y cómo se llama el del servidor. Sus valores por defecto: /, build e index.js."
    }
  ]
}
```

## Los tipos generados, en una línea

Casi todos los módulos del taller empiezan con `import type { Route } from './+types/<nombre>'`, y ese archivo no existe al lado del módulo. Lo genera React Router, a partir de `routes.ts`, en la carpeta `.react-router/` (que no se sube al repositorio). Con él, `Route.LoaderArgs` sabe qué parámetros tiene la ruta y `Route.ComponentProps` sabe qué devolvió su `loader`. **Es la lección 15, entera.**

## Cuándo lo usarías de verdad

- **Cuando la primera visita importa**: lo que tiene que leer un buscador o la tarjeta de un enlace (lecciones 81 y 98 de React), o una web que se usa desde el móvil con mala cobertura, como la de un albergue en mitad del Camino. El servidor manda la página hecha.
- **Cuando quieres convenciones en vez de decisiones**: dónde van las rutas, cómo se parte el código, cómo se tipan los datos. En un equipo, cada módulo de ruta se parece a los demás.
- **Cuando no hace falta**: un panel interno detrás de un inicio de sesión, que no lee ningún buscador, va bien en modo datos y se despliega como archivos estáticos (lección 85 de React). El consejo oficial para elegir modo está en la lección 1.

## Errores típicos

**Un `Layout` sin `<Scripts />` o sin `<Links />`.** Es el estado en que empieza el taller: la página se ve, porque el servidor la manda hecha, y por eso cuesta notarlo. Sin `<Links />`, sin estilos; sin `<Scripts />`, sin hidratar. Si «nada responde a los clics» en una app en modo framework, mira primero el `Layout`.

**Poner el menú en `Layout` en lugar de en una ruta.** El `Layout` envuelve también el `ErrorBoundary` de root y el `HydrateFallback`. Lo que pongas ahí sale en las páginas de error, y si depende de datos de un `loader`, puede no tenerlos. El menú del albergue está en `publico.tsx`, un `layout()` de `routes.ts`, y por eso `/entrar` no lo lleva.

**`prefix` cuando hacía falta una madre.** `prefix` no crea ninguna ruta: no hay módulo donde poner un middleware, un `loader` o un `ErrorBoundary` común. Si las rutas comparten algo más que el principio de la URL, `route` con hijas.

**Un archivo mal escrito o repetido en `routes.ts`.** El primero sale como un `ENOENT` al arrancar; el segundo, como `Unable to define routes with duplicate route id`. Los dos, en la terminal, con el servidor parado: no busques el fallo en el navegador.

**Una ruta comodín sin estado.** Sin el `loader` que devuelve `data(null, { status: 404 })`, `/lo-que-sea` pinta «Esta página no existe» con un 200.

**Subir `.react-router/` al repositorio, o editar sus archivos.** Se regenera cada vez que arranca el servidor de desarrollo o ejecutas `typegen`, y lo que cambies a mano se pierde. El `.gitignore` del taller ya lo excluye.

**Instalar con `npm install` en lugar de `npm ci`.** En un proyecto que vas a seguir con un texto, `npm install` puede subir versiones dentro de lo que permite `package.json`, y los mensajes dejan de coincidir. El taller fija versiones exactas, pero `npm ci` es la costumbre buena.

## Ejercicios: la lección 14 en el taller

Los pasos siguen los comentarios `TODO (lección 14)` de la rama `main`. Cuando termines, `npm run leccion -- 14` sale en verde. Si te atascas, la app terminada está en la [rama `solucion`](https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller).

### Paso 1. Registra las rutas (`app/routes.ts`)

Reproduce el árbol que imprimió `npx react-router routes` más arriba. Importa `layout` y `route` además de `index`, y escribe, en este orden:

- el `layout()` de `routes/publico.tsx` con las siete rutas públicas (la parte que ya has visto anotada);
- `entrar` y `salir`, fuera del layout;
- `hospitaleros` con `route()` y tres hijas: el índice `hoy.tsx`, `reservas/:id` y `pernoctas.csv`;
- las tres rutas de recursos, `etapas.json`, `sitemap.xml` y `api/avisos`, que están en `routes/recursos/`;
- el comodín `*`, con `routes/no-encontrada.tsx`.

Comprueba el árbol con `npx react-router routes` hasta que coincida. Se ponen en verde tres tests: «cuelga las rutas públicas de un layout» (mira el `file` y el `path` de cada hija, en orden), «agrupa las rutas de hospitaleros bajo su layout» y «reconoce una etapa dinámica y la ruta comodín» (este usa `matchRoutes` sobre tu configuración, como el `predice` de antes).

En cuanto guardes, el servidor de desarrollo vuelve a generar los tipos, y `npm run typecheck` baja de 20 errores a 1.

### Paso 2. Un 404 de verdad (`app/routes/no-encontrada.tsx`)

El `loader` del comodín lanza un error de marcador. Haz que **devuelva** una respuesta sin datos con el estado 404, con `data` de `react-router`. Ya que estás, dale a la página un `<title>`, un `<meta name="robots" content="noindex" />` y un enlace a la portada hecho con `href('/')`. Test: «la ruta comodín responde con un 404 HTTP real». Compruébalo también con `curl -s -D - -o /dev/null http://localhost:5173/no/existe | head -1`.

### Paso 3. El documento (`app/root.tsx`)

- **El `Layout`**: `<html lang="es">`, un `<head>` con `<meta charSet="utf-8" />`, el `viewport`, `<Meta />` y `<Links />`, y un `<body>` con los hijos, `<ScrollRestoration />` y `<Scripts />`. Importa los cuatro componentes de `react-router`. Test: «declara el idioma del documento completo», que renderiza tu `Layout` en el servidor y busca `<html lang="es"`.
- **El `ErrorBoundary`**: con `isRouteErrorResponse`, distingue un 404 («Esta página no existe») de cualquier otro fallo («Algo ha fallado»), con su `<title>`, el `noindex` y un enlace a la portada. Enseña `error.stack` solo si `import.meta.env.DEV` es `true` y el error es un `Error`. No tiene test: compruébalo abriendo `/camas`. La ruta de las camas todavía falla en el servidor (su capa de datos es de la lección 16), y la recoge tu `ErrorBoundary`: «Algo ha fallado», con la pila debajo porque estás en desarrollo.

### Paso 4. La configuración (`react-router.config.ts`)

Cambia el objeto vacío por una constante con el tipo `Config`, con `ssr: true` y `appDirectory: 'app'`, cada una con un comentario de qué hace, y expórtala. Deja los dos `TODO` de las lecciones 17 y 20.

### Para terminar

```text
$ npm run leccion -- 14
 Test Files  1 passed (1)
      Tests  5 passed (5)

$ npm run typecheck
app/routes/etapa.tsx(6,32): error TS7031: Binding element 'params' implicitly has an 'any' type.
```

Ese último error es el punto de partida de la lección 15. Y en el navegador, con el servidor de desarrollo, estas son las respuestas que tienes que ver ahora (las que dan 500 se arreglan en su lección):

```text
/                                  200
/albergue                          200
/etapas                            200
/etapas/sahagun-el-burgo-ranero    200
/reservar                          200
/mi-camino                         200
/no/existe                         404
/etapas/inventada                  500   ← lección 15
/camas                             500   ← lección 16
/entrar, /hospitaleros             500   ← lección 18
/etapas.json                       500   ← lección 19
```

Cada 500 llega con tu `ErrorBoundary` de root, «Algo ha fallado», y el error de verdad sale en la terminal del servidor. Por ejemplo, para `/camas`:

```text
Error: TODO (lección 16): persistencia de reservas en el servidor.
```

### Retos para seguir practicando

Sin comprobación automática.

1. **Pásalo a `fs-routes`.** En una copia del taller, instala `@react-router/fs-routes` y renombra los módulos de la parte pública para que `flatRoutes()` dé el mismo árbol que `routes.ts`. Compáralos con `npx react-router routes`. ¿Qué nombre necesita la ficha de una etapa para no colgar de la lista?
2. **Una dirección vieja.** Añade `route('etapa/:etapa', …)` para los enlaces antiguos que alguien dejó en un foro, con un módulo cuyo `loader` redirija a `/etapas/:etapa` con `redirect` y un 301. ¿Qué id le tienes que dar si reutilizas un archivo?
3. **Revela y compara.** En otra copia, borra `app/entry.server.tsx`, ejecuta `npx react-router reveal` y compara con `diff` el archivo que sale con el del taller. ¿Qué ha añadido el taller, y para qué lecciones?
4. **Sin `<Links />`.** Quítalo del `Layout`, construye con `npm run build` y arranca con `npm start`. Mira el `<head>` con `curl` y la página en el navegador. Después pon en marcha el servidor de desarrollo: ¿se ve igual? (Pista: en desarrollo, Vite puede meter el CSS desde JavaScript.)

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Documentación y repositorio",
  "recursos": [
    {
      "titulo": "react-router-proyectos/taller (rama main)",
      "descripcion": "El albergue El Cea al empezar la lección 14, con los TODO de cada lección y sus tests.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/main/taller",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Routing (modo framework)",
      "descripcion": "routes.ts, route, index, layout y prefix, segmentos dinámicos y opcionales, y el comodín.",
      "url": "https://reactrouter.com/start/framework/routing",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Route Module",
      "descripcion": "Todas las exportaciones de un módulo de ruta, una a una: del componente a shouldRevalidate.",
      "url": "https://reactrouter.com/start/framework/route-module",
      "etiqueta": "React Router"
    },
    {
      "titulo": "File Route Conventions",
      "descripcion": "Las reglas completas de @react-router/fs-routes: puntos, guiones bajos, $, corchetes y carpetas.",
      "url": "https://reactrouter.com/how-to/file-route-conventions",
      "etiqueta": "React Router"
    },
    {
      "titulo": "root.tsx",
      "descripcion": "La ruta raíz, Layout y los componentes Meta, Links, ScrollRestoration y Scripts.",
      "url": "https://reactrouter.com/api/framework-conventions/root.tsx",
      "etiqueta": "React Router"
    },
    {
      "titulo": "react-router.config.ts",
      "descripcion": "Cada opción de la configuración, con su valor por defecto.",
      "url": "https://reactrouter.com/api/framework-conventions/react-router.config.ts",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Framework Adoption from RouterProvider",
      "descripcion": "Cómo pasar una app del modo datos al modo framework, ruta a ruta.",
      "url": "https://reactrouter.com/upgrading/router-provider",
      "etiqueta": "React Router"
    }
  ]
}
```
