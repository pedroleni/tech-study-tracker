# Dónde se ejecuta cada cosa: servidor, navegador o los dos

- **Módulo:** Modo framework
- **Slug:** `donde-se-ejecuta-cada-cosa-servidor-navegador-o-los-dos` (autogenerado del título)
- **Orden:** 160
- **Fuentes:** [Server vs. Client Code Execution](https://reactrouter.com/explanation/server-client-execution) + [Client Data](https://reactrouter.com/how-to/client-data) + [Route Module](https://reactrouter.com/start/framework/route-module) + [.server modules](https://reactrouter.com/api/framework-conventions/server-modules) + [.client modules](https://reactrouter.com/api/framework-conventions/client-modules) + [Lazy Route Discovery](https://reactrouter.com/explanation/lazy-route-discovery) + [Automatic Code Splitting](https://reactrouter.com/explanation/code-splitting) + [Hydration](https://reactrouter.com/explanation/hydration) — ver `contenido/react-router/TEMARIO.md` #16
- **Requiere:** Las lecciones 14 y 15. De esta ficha, la 10 (middleware) y la 11 (HydrateFallback). De React, la 87 (hidratar) y la 98 (la revista en modo framework)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

En el modo datos todo pasaba en el navegador. En el modo framework, **un mismo módulo de ruta se ejecuta en dos sitios**, y cada exportación tiene el suyo: el `loader` solo en el servidor, el `clientLoader` solo en el navegador, el componente en los dos (primero en el servidor, para el HTML, y después en el navegador, al hidratar y en cada navegación). Un mismo archivo, `etapa.tsx`, acaba repartido entre el build del servidor y varios trozos de JavaScript para el navegador.

Saber qué corre dónde decide cosas muy concretas: si un secreto puede acabar en el navegador, si una página funciona sin JavaScript, cuántas peticiones hace un clic, si tu middleware de autenticación se ejecuta de verdad o si un buscador ve el contenido. **Esta lección lo mira desde fuera, en la pestaña Red y con `curl`**, que es donde se ve lo que viaja de verdad.

En el taller, el albergue gana tres cosas que solo pueden vivir en el navegador: una caché de las fichas de las etapas, una página «Mi camino» con las etapas que el peregrino ha marcado (guardadas en su `localStorage`) y un medidor de cuánto tarda cada navegación. Y una que solo puede vivir en el servidor: las reservas, guardadas en un archivo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde se ejecuta cada exportación de un módulo de ruta",
  "roles": [
    {
      "etiqueta": "Solo en el servidor",
      "rol": "loader, action, middleware, headers",
      "descripcion": "En cada petición de documento y en cada petición .data. React Router las quita del JavaScript del navegador, y con ellas lo que solo ellas importan."
    },
    {
      "etiqueta": "Solo en el navegador",
      "rol": "clientLoader, clientAction, clientMiddleware",
      "descripcion": "En cada navegación del navegador, y en la carga inicial solo si se lo pides con hydrate. En el servidor no se ejecutan nunca."
    },
    {
      "etiqueta": "En los dos",
      "rol": "El componente, ErrorBoundary, HydrateFallback",
      "descripcion": "El servidor los pinta para el HTML; el navegador los vuelve a ejecutar al hidratar y al navegar. Lo que pinten tiene que salir igual en los dos lados."
    },
    {
      "etiqueta": "Por nombre de archivo",
      "rol": ".server y .client",
      "descripcion": "Un módulo .server no puede llegar al navegador: si lo intenta, el build falla. Uno .client llega vacío al servidor: todo lo que exporta vale undefined."
    }
  ]
}
```

Al empezar, el taller está como lo dejó la 15: tipos limpios y nueve tests de la 16 en rojo. Y dos cosas a medias que ya conoces: `/camas` responde un 500 con el `ErrorBoundary` de root, porque la capa de datos de las reservas todavía lanza su error (`Error: TODO (lección 16): persistencia de reservas en el servidor.`, en la terminal), y el `clientLoader` de la etapa es un marcador que solo hace `return serverLoader()`: funciona, pero no guarda nada.

```text
$ npm run leccion -- 16
     × reutiliza durante cinco minutos el resultado del loader del servidor 4ms
     × vuelve al servidor cuando la caché ha caducado 2ms
     × mantiene los datos SSR de una etapa mientras ceba la caché del navegador 2ms
     × mi camino lee localStorage, ignora slugs desconocidos y tolera JSON roto 2ms
     × mezcla dentro de la cola dos cambios simultáneos sobre la misma reserva 0ms
     × mantiene un JSON válido con dos escrituras simultáneas 0ms
     × serializa la comprobación de camas y evita sobreventa 6ms
     × el middleware cliente devuelve exactamente lo que devuelve next 1ms
     × instala el middleware de cliente en la raíz 1ms
      Tests  9 failed (9)
```

Todas las salidas de esta lección, salvo que diga otra cosa, salen del taller terminado de la 16, construido con `npm run build` y servido con `react-router-serve`, el servidor de producción, en el puerto 3231 (`PORT=3231 npm start`; sin `PORT`, escucha en el 3000). En desarrollo, las peticiones son las mismas, con otros nombres de archivo.

## `loader` en el servidor, `clientLoader` en el navegador

El `loader` de una etapa (el de la lección 15) se ejecuta en el servidor en dos momentos: cuando el navegador pide la página como documento, para pintar el HTML, y cuando la pide **solo con datos**, al navegar desde otra página. La segunda petición lleva `.data` al final:

```text
$ curl -s -D - http://localhost:3231/etapas/sahagun-el-burgo-ranero.data
HTTP/1.1 200 OK
content-type: text/x-script; charset=utf-8
x-remix-response: yes

[{"_1":2},"routes/etapa",{"_3":4},"data",{"_5":6},"etapa",{"_7":8,"_9":10,"_11":12,"_13":14,"_15":16},"slug","sahagun-el-burgo-ranero","origen","Sahagún","destino","El Burgo Ranero","kilometros",17.9,"descripcion","La salida clásica por Bercianos del Real Camino y la llanura leonesa."]
```

Es el formato de React Router (*turbo-stream*): cada texto aparece una vez y los objetos apuntan a él por su posición. Es lo que la lección 15 vio viajar, con su fecha y su función. Dentro van los datos de los `loader` de la ruta pedida, por id de ruta: aquí solo `routes/etapa`, porque `root` y `publico` no tienen `loader`.

Un **`clientLoader`** es lo mismo, pero en el navegador. Si una ruta lo tiene, al navegar a ella React Router lo llama a él en vez de pedir el `.data`, y él decide qué hacer. Tiene a mano **`serverLoader()`**, que llama al `loader` del servidor (es decir, hace la petición `.data`) y le devuelve lo que responde. Con eso, la ficha de la etapa gana una caché en memoria de cinco minutos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "let cache: { clave: string; caduca: number; datos: Awaited<ReturnType<typeof loader>> } | undefined\nexport async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {\n  // L16: el slug es la clave y el dato dura cinco minutos; después se vuelve al servidor.\n  const clave = params.etapa ?? ''\n  if (cache?.clave === clave && cache.caduca > Date.now()) return cache.datos\n  const datos = await serverLoader()\n  cache = { clave, caduca: Date.now() + 5 * 60 * 1000, datos }\n  return datos\n}\nclientLoader.hydrate = true as const\n// L16: hydrate ceba esta caché al arrancar; sin HydrateFallback se conserva el HTML del loader en SSR.",
  "anotaciones": [
    {
      "fragmento": "let cache: { clave: string; caduca: number; datos: Awaited<ReturnType<typeof loader>> } | undefined",
      "nota": "Una variable del módulo: en el navegador vive mientras dure la pestaña, y en el servidor ni se usa, porque el clientLoader no corre allí. El tipo de los datos sale del loader, con ReturnType (lección 43 de TypeScript)."
    },
    {
      "fragmento": "export async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {",
      "nota": "Route.ClientLoaderArgs trae lo mismo que los argumentos del loader (params, request, url, context) y además serverLoader."
    },
    {
      "fragmento": "if (cache?.clave === clave && cache.caduca > Date.now()) return cache.datos",
      "nota": "Si ya la tenemos y no ha caducado, la devuelve sin tocar la red. La caché guarda una sola etapa, la última: para volver de la lista a la ficha, basta."
    },
    {
      "fragmento": "const datos = await serverLoader()",
      "nota": "Si no, al servidor. Desde una navegación, esto es la petición .data; al hidratar, ya verás que no."
    },
    {
      "fragmento": "clientLoader.hydrate = true as const",
      "nota": "Que el clientLoader se ejecute también en la carga inicial, al hidratar. Con as const, el tipo es true y no boolean, y los tipos generados pueden deducir qué llega a loaderData (lo pide la documentación)."
    }
  ]
}
```

Esto es lo que pidió Chromium en un recorrido por las etapas, apuntando las peticiones que no son archivos de `/assets` y lo que escribe la consola (el `console.debug` es el medidor de navegaciones, que verás más abajo):

```text
### A. Documento: /etapas/sahagun-el-burgo-ranero
  163 ms  document  GET /etapas/sahagun-el-burgo-ranero         ← 200
  214 ms  fetch     GET /__manifest?paths=%2Fetapas%2C%2Fetapas%2Fsahagun-el-burgo-ranero&version=5bb1305e
  214 ms  fetch     GET /__manifest?paths=%2F%2C%2Falbergue%2C%2Fcamas%2C…&version=5bb1305e
[consola debug] Navegación completada en 1 ms

### B. Clic en «Etapas» del menú
[consola debug] Navegación completada en 11 ms
 1394 ms  fetch     GET /__manifest?paths=%2Fetapas%2C%2Fetapas%2Fcarrion-de-los-condes-terradillos%2C…

### C. Clic en «Carrión de los Condes hasta Terradillos»
 1643 ms  fetch     GET /etapas/carrion-de-los-condes-terradillos.data?_routes=routes%2Fetapa   ← 200
[consola debug] Navegación completada en 13 ms

### D. «Volver a las etapas» y otra vez la misma etapa
[consola debug] Navegación completada en 0 ms
[consola debug] Navegación completada en 0 ms
```

- **A, la carga inicial, no pide ningún `.data`.** El `clientLoader` se ejecutó al hidratar (el medidor apuntó una navegación de 1 ms), y su `serverLoader()` no fue a la red: devolvió los datos que el servidor ya había metido en el HTML.
- **B no pide datos**: la lista de etapas no tiene `loader`, solo un componente que lee un array.
- **C sí**: la caché no tenía esa etapa, y `serverLoader()` pidió el `.data`. El `?_routes=routes%2Fetapa` dice qué `loader` quiere: solo el de esa ruta.
- **D, ninguna petición.** La segunda visita a Carrión salió de la caché.

¿Para qué sirve, entonces, `hydrate`? Para que la caché esté **cebada** desde la carga inicial. Lo probamos abriendo una etapa como documento, volviendo a la lista y entrando otra vez en ella. Con `hydrate = true`, ninguna petición `.data`. Con `hydrate = false`, el `clientLoader` no se ejecutó al hidratar, la caché estaba vacía y la vuelta pidió los datos otra vez:

```text
== hydrate = false
documento /etapas/sahagun-el-burgo-ranero
clic en «Volver a las etapas» y otra vez en la misma etapa
  fetch /etapas/sahagun-el-burgo-ranero.data?_routes=routes%2Fetapa
```

Es el patrón **Client-Side Caching** de la guía [Client Data](https://reactrouter.com/how-to/client-data). La guía añade una pieza que el albergue no necesita: invalidar la caché en una `clientAction`, que es a la `action` lo que el `clientLoader` al `loader` (se ejecuta en el navegador y llama a la del servidor con `serverAction()`). Las fichas de las etapas no se cambian desde la web, y caducar a los cinco minutos basta.

## `hydrate` con `HydrateFallback`, y sin él

Con `hydrate = true`, la carga inicial tiene un problema: el componente necesita datos, y el `clientLoader` todavía no ha terminado. React Router lo resuelve de dos formas, según exportes o no un `HydrateFallback`. El taller tiene un caso de cada, a propósito.

**Sin `HydrateFallback`, como en la etapa**, React Router pinta en el servidor el componente con los datos del `loader`, igual que si no hubiera `clientLoader`, y en el navegador ejecuta el `clientLoader` mientras hidrata. El HTML trae la ficha entera:

```text
$ curl -s http://localhost:3231/etapas/sahagun-el-burgo-ranero | grep -o '<h1>.*</h1>'
<h1>Sahagún<!-- --> <span>hasta</span> <!-- -->El Burgo Ranero</h1>
```

Por eso, dice la guía, el `loader` y el `clientLoader` tienen que devolver lo mismo en la carga inicial: si no, la hidratación falla. Aquí es fácil, porque el `clientLoader` devuelve lo que le da `serverLoader()`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// app/routes/etapa.tsx: alguien añade un HydrateFallback\n// «para que se vea algo mientras carga la caché»\nexport async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {\n  // … la misma caché de cinco minutos\n}\nclientLoader.hydrate = true as const\n\nexport function HydrateFallback() {\n  return <p className=\"cargando\">Cargando la etapa…</p>\n}\n\n// npm run build && npm start, y después:\n// curl -s http://localhost:3000/etapas/sahagun-el-burgo-ranero\n// ¿Qué trae el HTML donde iba la ficha?",
  "opciones": [
    "La ficha, con su h1: el servidor tiene los datos del loader",
    "Cargando la etapa…, y ni rastro de la ficha",
    "Las dos cosas: el fallback y debajo la ficha",
    "Nada: un HydrateFallback solo se pinta en el navegador"
  ],
  "correcta": 1,
  "explicacion": "Lo construimos y lo pedimos con curl: donde iba la ficha llegó un p con Cargando la etapa…, y el h1 de la etapa no aparecía en el HTML. Con hydrate a true y un HydrateFallback, el servidor pinta el fallback y deja el componente para cuando termine el clientLoader. Un buscador, o alguien sin JavaScript, ya no ve la etapa. Por eso el test de la lección exige que etapa.tsx no exporte HydrateFallback."
}
```

**Con `HydrateFallback`, como en «Mi camino»**, es lo que quieres cuando el servidor **no puede** tener los datos. Las etapas que ha marcado un peregrino están en el `localStorage` de su navegador, y el servidor no tiene forma de leerlo. La ruta no tiene `loader`, solo `clientLoader`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function clientLoader() {\n  const guardadas = new Set(leerMiCamino())\n  return { etapas: ETAPAS.filter((etapa) => guardadas.has(etapa.slug)) }\n}\n\n// L16: aquí sí hace falta el fallback: esta ruta solo tiene clientLoader porque\n// el servidor no puede leer el localStorage del navegador del peregrino.\nexport function HydrateFallback() {\n  return (\n    <main className=\"pagina estrecha\">\n      <p className=\"cargando\">Preparando tu camino…</p>\n    </main>\n  )\n}\n\nexport default function MiCamino({ loaderData }: Route.ComponentProps) {\n  return (\n    <main className=\"pagina estrecha\">\n      <title>Mi camino | El Cea</title>",
  "anotaciones": [
    {
      "fragmento": "export async function clientLoader() {",
      "nota": "Sin loader de servidor, el clientLoader se ejecuta siempre al hidratar, aunque no pongas hydrate: si no, el componente no tendría ningún dato."
    },
    {
      "fragmento": "const guardadas = new Set(leerMiCamino())",
      "nota": "leerMiCamino lee localStorage, y solo se puede llamar en el navegador. Aquí siempre lo es: el clientLoader no corre en el servidor."
    },
    {
      "fragmento": "export function HydrateFallback() {",
      "nota": "Lo que pinta el servidor en lugar del componente, y lo que se ve hasta que el clientLoader termina. Lo envuelve el Layout de root, así que la página sale con su cabecera y su pie."
    },
    {
      "fragmento": "export default function MiCamino({ loaderData }: Route.ComponentProps) {",
      "nota": "Aquí loaderData es lo que devolvió el clientLoader, sin pasar por ninguna serialización: no ha viajado por la red."
    }
  ]
}
```

Lo que llega del servidor, con `curl`:

```text
$ curl -s http://localhost:3231/mi-camino | grep -o '<main class="pagina estrecha">.\{0,60\}'
<main class="pagina estrecha"><p class="cargando">Preparando tu camino…</p></main>
$ curl -s http://localhost:3231/mi-camino.data
[{}]
```

El HTML trae el `HydrateFallback`, y la respuesta de datos va vacía: ninguna ruta de `/mi-camino` tiene `loader` en el servidor. En Chromium, tras marcar Carrión con «Añadir a mi camino» y pulsar «Mi camino» en el menú (E), y después recargando la página (F):

```text
### E. «Añadir a mi camino» y clic en «Mi camino»
[consola debug] Navegación completada en 18 ms
LISTA: Mi camino | Carrión de los Condes hasta Terradillos de los Templarios26,6 km

### F. Recargar /mi-camino
 3168 ms  document  GET /mi-camino   ← 200
[consola debug] Navegación completada en 0 ms
LISTA: Mi camino | Carrión de los Condes hasta Terradillos de los Templarios26,6 km
```

Ni una sola petición de datos en las dos. **Sin JavaScript, en cambio, «Mi camino» se queda en «Preparando tu camino…» para siempre**: es el precio de unos datos que solo existen en el navegador.

Lo mismo explica el botón «Añadir a mi camino» de la ficha, que solo aparece después de hidratar (con un `useState` que un `useEffect` pone a `true`). En el HTML del servidor no está: `grep -c "Añadir a mi camino"` sobre la ficha da 0. Sin JavaScript no podría guardar nada, y es mejor no pintar un botón que no hace nada.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Las cuatro combinaciones de una ruta con clientLoader",
  "items": [
    {
      "titulo": "Solo loader",
      "texto": "Lo de siempre: HTML con los datos, y un .data en cada navegación."
    },
    {
      "titulo": "loader y clientLoader, sin hydrate",
      "texto": "La carga inicial usa los datos del HTML y no llama al clientLoader; las navegaciones, sí. Es el patrón de saltarse el servidor en las navegaciones (Skip the Server Hop, en la guía)."
    },
    {
      "titulo": "loader y clientLoader con hydrate, sin HydrateFallback",
      "texto": "HTML completo, y el clientLoader se ejecuta al hidratar con los datos que ya trae la página: la etapa del albergue, para cebar su caché."
    },
    {
      "titulo": "clientLoader con HydrateFallback",
      "texto": "El servidor pinta el fallback y el navegador pone los datos. Para lo que solo existe en el navegador, como Mi camino. Con loader y hydrate, también sirve para mezclar datos del servidor y del navegador."
    }
  ]
}
```

## `middleware` en el servidor, `clientMiddleware` en el navegador

La lección 10 escribió middleware de cliente en el modo datos. En el modo framework hay dos exportaciones: **`middleware` envuelve la petición en el servidor** (de documento o `.data`) y devuelve una `Response`; **`clientMiddleware` envuelve la navegación en el navegador**. El taller mide cuánto tarda cada navegación con uno de cliente:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { DataStrategyResult, MiddlewareFunction } from 'react-router'\n\n// L16: `.client` impide meter este medidor del navegador en el bundle servidor;\n// mide la navegación completa, incluido el trabajo de loaders del cliente.\nexport const clientMiddleware: MiddlewareFunction<Record<string, DataStrategyResult>> = async (\n  _argumentos,\n  next,\n) => {\n  const inicio = performance.now()\n  const resultado = await next()\n  console.debug(`Navegación completada en ${Math.round(performance.now() - inicio)} ms`)\n  return resultado\n}",
  "anotaciones": [
    {
      "fragmento": "import type { DataStrategyResult, MiddlewareFunction } from 'react-router'",
      "nota": "Un middleware de cliente no envuelve ninguna Response: lo que devuelve next() son los resultados de los loader de la navegación, por ruta. De ahí el tipo."
    },
    {
      "fragmento": "// L16: `.client` impide meter este medidor del navegador en el bundle servidor;",
      "nota": "El sufijo .client: en el build del servidor este módulo llega vacío. Lo verás más abajo."
    },
    {
      "fragmento": "const inicio = performance.now()",
      "nota": "Antes de next(): justo al empezar la navegación, antes de cualquier loader o clientLoader."
    },
    {
      "fragmento": "const resultado = await next()",
      "nota": "Aquí se ejecuta todo lo de la navegación: los clientLoader y, si hacen falta, las peticiones .data."
    },
    {
      "fragmento": "return resultado",
      "nota": "Devuelve exactamente lo que dio next(). Es lo que comprueba uno de los tests de la lección."
    }
  ]
}
```

En `root.tsx` se instala para toda la app:

```tsx
import { clientMiddleware as medirNavegacion } from '~/medir.client'
import './app.css'

// L16: vive en root para medir todas las navegaciones, no solo una rama.
export const clientMiddleware: Route.ClientMiddlewareFunction[] = [medirNavegacion]
```

Y ahora el experimento que lo explica todo. En una copia del taller añadimos a `root.tsx` un `middleware` **de servidor** que solo apunta cada petición en la terminal, y repetimos el recorrido de antes, de la A a la F. En el navegador, el de cliente escribió siete líneas: una por navegación, la carga inicial y la recarga incluidas. En la terminal del servidor, el de servidor escribió tres:

```text
middleware de servidor: GET /etapas/sahagun-el-burgo-ranero
GET /etapas/sahagun-el-burgo-ranero 200 - - 28.223 ms
GET /__manifest?paths=… 200 - - 1.490 ms
GET /__manifest?paths=… 200 - - 0.645 ms
GET /__manifest?paths=… 200 - - 0.924 ms
middleware de servidor: GET /etapas/carrion-de-los-condes-terradillos.data?_routes=routes%2Fetapa
GET /etapas/carrion-de-los-condes-terradillos.data?_routes=routes%2Fetapa 200 - - 1.251 ms
middleware de servidor: GET /mi-camino
GET /mi-camino 200 - - 4.555 ms
GET /__manifest?paths=… 200 - - 1.086 ms
```

(Las líneas sin «middleware» son el registro de `react-router-serve`.) **El middleware de servidor solo se ejecuta cuando hay una petición al servidor**: los dos documentos y el único `.data`. Ir a la lista, que no tiene `loader`; volver a una etapa que estaba en la caché; ir a «Mi camino»: nada de eso llega al servidor, y el middleware no se entera. Tampoco pasa por él `/__manifest`, que no es de ninguna ruta.

Es la razón de que la zona de hospitaleros de la lección 18 tenga un `loader`, y de que la cooperativa de la 24 lo explique con un `predice`: un middleware que pide sesión en el servidor no protege una navegación que no llega al servidor. El código de la ruta (el componente) se descarga igual; lo que protege son los datos, que solo salen del servidor.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// app/root.tsx: un middleware de servidor que cuenta visitas\nlet visitas = 0\nexport const middleware: Route.MiddlewareFunction[] = [\n  async (_args, next) => {\n    visitas++\n    return next()\n  },\n]\n\n// En el navegador: abres /albergue (documento), pulsas «Etapas»\n// y después «Mi camino». Ni root, ni publico, ni etapas, ni mi-camino\n// tienen loader de servidor. ¿Cuánto vale visitas en el servidor?",
  "opciones": [
    "3: una por página",
    "1: solo la petición del documento pasa por el servidor",
    "2: el documento y la primera navegación",
    "0: el middleware de servidor solo envuelve peticiones .data"
  ],
  "correcta": 1,
  "explicacion": "Las dos navegaciones se resuelven en el navegador: ninguna ruta tiene loader de servidor, así que no hay petición .data que envolver. Solo el documento de /albergue pasa por el middleware de servidor. Lo comprobamos con un middleware que apuntaba cada petición: en un recorrido de siete navegaciones, el de servidor se ejecutó tres veces."
}
```

## Los módulos `.server` y `.client`

React Router quita del JavaScript del navegador el `loader`, la `action`, el `middleware` y `headers`, y con ellos lo que solo ellos importan. Pero si algo que sí va al navegador importa un módulo, ese módulo va al navegador **entero**. La lección 98 de React lo vio con un componente que importaba los textos de los artículos. Aquí, el caso que trae esta lección: un `clientLoader` es código del navegador, aunque se llame *loader*.

En una copia del taller, alguien quiere ahorrarse el servidor en `/camas` y llama a `camasLibres` directamente desde un `clientLoader`. `camasLibres` está en `app/datos/reservas.server.ts`, que lee y escribe archivos con `node:fs`. El build se para:

```text
$ npm run build
✗ Build failed in 193ms
Build failed with 1 error:

[plugin react-router:dot-server]
Error: Server-only module referenced by client

    '~/datos/reservas.server' imported by 'app/routes/camas.tsx?route-chunk=clientLoader'

  See https://reactrouter.com/explanation/code-splitting#removal-of-server-code
```

Es decir: «un módulo solo de servidor está referenciado por código del cliente». Fíjate en quién lo importa: no `camas.tsx`, sino `camas.tsx?route-chunk=clientLoader`, **el trozo del `clientLoader`** (lo explica `splitRouteModules`, al final de la lección). El `import` está en lo alto del archivo, y el `loader` lo usa sin problema; lo que no puede es usarlo el `clientLoader`.

**Sin el sufijo, el build no se habría quejado**, y el JavaScript del navegador habría llevado dentro el código que lee el disco del servidor, que en el navegador además rompería. El sufijo `.server` (o una carpeta `.server/`) es una promesa que el build hace cumplir.

### `.client`: vacío en el servidor

El sufijo contrario, `.client`, saca un módulo del build del servidor. No falla el build: el módulo llega vacío, y **todo lo que exporta vale `undefined` en el servidor**. `root.tsx` importa el medidor de `~/medir.client`, y esto es lo que queda en el build del servidor:

```text
$ grep -n "clientMiddleware = " build/server/index.js
89:var clientMiddleware = [void 0];
```

Una lista con un `undefined`, que no hace daño, porque el servidor nunca ejecuta `clientMiddleware`. Pero si algo de lo que se ejecuta en el servidor usa una exportación `.client`, rompe. Lo probamos con un `progreso.client.ts` que cuenta las etapas guardadas en `localStorage`, llamado desde el componente de `/albergue` al pintar:

```text
$ curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3231/albergue
500
```

Y en la terminal del servidor:

```text
TypeError: (void 0) is not a function
    at Albergue (file:///…/build/server/index.js:299:15)
```

(El `handleError` provisional del taller lo escribe en la terminal, como haría React Router por defecto.) La página llegó con el `ErrorBoundary` de root, «Algo ha fallado». La documentación lo dice: lo que exporta un módulo `.client` solo se puede usar en un `useEffect` o en un manejador de eventos.

¿Y por qué `app/mi-camino.ts`, que lee `localStorage`, no lleva `.client`? Porque no hace nada al importarse: solo define funciones, y esas funciones solo se llaman desde el navegador (desde un `clientLoader` y desde el clic de un botón). En el servidor se importa sin problema y nunca se ejecuta. `.client` es para los módulos que **al cargarse** ya tocan algo del navegador, como `'vibrate' in window.navigator`, el ejemplo de la documentación.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo que importa el navegador, viaja",
  "contenido": "mi-camino.ts valida lo que lee de localStorage, y lo que usa viaja al navegador: lo cargan la ficha de cada etapa (por el botón Añadir a mi camino) y Mi camino. Con Zod completo, el trozo compartido mi-camino ocupaba 78,94 kB (22,81 kB con gzip). Con zod/mini, que es lo que usa el taller aquí y en el ErrorBoundary de la etapa, ocupa 13,84 kB (4,82 kB con gzip), con la misma validación. Lo medimos construyendo las dos versiones."
}
```

¿Y por qué el resto del taller sigue con `zod` completo? Porque está en código que nunca llega al navegador: las `action` de `reservar.tsx` (y, más adelante, de `entrar.tsx` y del webhook de avisos) y `fechas.ts`, que solo usan los `loader`. React Router quita esas exportaciones del JavaScript del navegador, y con ellas lo que importan: buscamos Zod en `build/client` y solo aparece en el trozo de `mi-camino`. En el servidor, el tamaño no lo descarga nadie.

## Lo que viaja: `.data` y `/__manifest`

La lección 98 de React enseñó estas dos peticiones en la pestaña Red. Ahora puedes leer qué llevan.

**`.data`** es la petición de datos de una navegación, de un envío o de un fetcher: la misma dirección de la página con `.data` detrás. La responde el mismo servidor y el mismo código que el documento, pero sin pintar nada: ejecuta el middleware y los `loader` (o la `action`) y devuelve sus resultados. Sin `?_routes=`, todos los `loader` de la ruta; con él, solo los que se piden, como hizo la etapa.

**`/__manifest`** es el mapa de las rutas, que el navegador pide poco a poco. El HTML de la primera visita solo trae lo que hace falta para la página que se ve. Después, React Router mira los enlaces que hay en pantalla y pregunta por todos a la vez: en A, por `/etapas` y por la propia etapa, y por las siete direcciones del menú. Al llegar a la lista (B), por las cinco etapas que enlaza. Es **Lazy Route Discovery**, activo por defecto. La respuesta dice, de cada ruta, qué tiene y qué archivo cargar (recortado):

```text
$ curl -s "http://localhost:3231/__manifest?paths=%2Fetapas%2C%2Fetapas%2Fcarrion-de-los-condes-terradillos&version=5bb1305e"
{"root":{…},"routes/publico":{…},"routes/etapas":{…},
 "routes/etapa":{"id":"routes/etapa","parentId":"routes/publico","path":"etapas/:etapa","hasAction":false,"hasLoader":true,"hasClientAction":false,"hasClientLoader":true,"hasClientMiddleware":false,"hasDefaultExport":true,"hasErrorBoundary":true,"module":"/assets/etapa-main-PZWme5fG.js",…,"clientLoaderModule":"/assets/etapa-client-loader-BPn4arjB.js"}}
```

Con `hasLoader` y `hasClientLoader`, el navegador sabe antes del clic si tendrá que pedir datos o llamar a un `clientLoader`. Y el `version` es el del build: si despliegas una versión nueva mientras alguien tiene la página abierta, su navegador pregunta con la versión vieja, y el servidor le contesta así:

```text
$ curl -s -D - "http://localhost:3231/__manifest?paths=%2Fetapas&version=viejo"
HTTP/1.1 204 No Content
x-remix-reload-document: true
```

Un 204 que le pide recargar el documento: el JavaScript que tiene ya no casa con el del servidor. La opción `routeDiscovery` de `react-router.config.ts` cambia la ruta del manifiesto o lo desactiva (`{ mode: 'initial' }`, todas las rutas en la primera carga).

## `<Link prefetch>`: adelantar la descarga

Un `<Link>` (o un `<NavLink>`) del modo framework acepta `prefetch`, con cuatro valores: `"none"` (por defecto), `"intent"` (al pasar el ratón por encima o enfocarlo), `"render"` (en cuanto se pinta) y `"viewport"` (cuando entra en pantalla). Lo que hace es poner etiquetas `<link>` detrás del enlace para que el navegador descargue antes lo que hará falta. Lo probamos con `prefetch="intent"` en dos enlaces del taller.

En **«Camas»** del menú, una ruta con `loader` y sin `clientLoader`. Al pasar el ratón por encima:

```text
### hover sobre «Camas»
  824 ms  other      /camas.data
  825 ms  script     /assets/camas-te3SQzc2.js
LINKS:
<link rel="prefetch" as="fetch" href="/camas.data">
<link rel="modulepreload" href="/assets/camas-te3SQzc2.js">
```

Los datos y el código de la ruta, antes del clic. En **una etapa** de la lista, que tiene `clientLoader`:

```text
### hover sobre Carrión
 1026 ms  script     /assets/etapa-main-PZWme5fG.js
 1027 ms  script     /assets/etapa-client-loader-BPn4arjB.js
 1027 ms  script     /assets/mi-camino-mERnS23x.js
```

Solo el código. **Una ruta con `clientLoader` no precarga sus datos**: los decide ella al navegar (aquí, la caché), y React Router no puede adivinarlos. Está en el código de `PrefetchPageLinks` de la 8.5.0: una ruta con `hasClientLoader` se queda fuera de la precarga de datos.

Y un detalle que se ve en el servidor: precargar no siempre ahorra la petición. Sin cabeceras de caché, el clic en «Camas» volvió a pedir `/camas.data`, y el servidor la recibió **dos veces**: el `<link rel="prefetch">` la descargó, pero el navegador no tenía permiso para reutilizarla. Con el `Cache-Control: public, max-age=60, …` que le pones a `/camas` en la lección 17, la recibió **una**: el clic la sacó de la caché del navegador.

## `splitRouteModules`: un módulo, varios trozos

Desde la 8, React Router parte cada módulo de ruta: lo que el navegador ejecuta antes de pintar la ruta (`clientLoader`, `clientAction`, `clientMiddleware` y `HydrateFallback`) va en trozos propios, para poder empezar a ejecutarlo mientras se descarga el componente. La lección 98 de React lo vio con un `clientMiddleware`. En el build del taller tras la 16:

```text
build/client/assets/mi-camino-client-loader-r4fdyMOc.js       0.19 kB │ gzip:  0.16 kB
build/client/assets/etapa-client-loader-BPn4arjB.js           0.22 kB │ gzip:  0.18 kB
build/client/assets/mi-camino-hydrate-fallback-D8joxJXR.js    0.24 kB │ gzip:  0.20 kB
build/client/assets/mi-camino-main-6ZNpB0p1.js                0.80 kB │ gzip:  0.47 kB
build/client/assets/etapa-main-PZWme5fG.js                    1.61 kB │ gzip:  0.82 kB
build/client/assets/mi-camino-mERnS23x.js                    13.84 kB │ gzip:  4.82 kB
```

El `clientLoader` de la etapa ocupa 220 bytes: la caché, y nada del componente. El manifiesto anota cada trozo (`clientLoaderModule`, `hydrateFallbackModule`), y por eso en la precarga de una etapa salieron dos archivos a la vez, `etapa-main` y `etapa-client-loader`. El de `root` no se parte: su `clientMiddleware` va dentro de `root-….js`, que se carga siempre.

`splitRouteModules: false` en `react-router.config.ts` lo desactiva, y `'enforce'` hace fallar el build si una ruta no se puede partir porque el `clientLoader` y el componente comparten código. Lo contó la 98; en el taller no hace falta tocarlo.

## Errores típicos

**Usar un módulo `.server` desde un `clientLoader`.** El `clientLoader` corre en el navegador: no puede leer el disco, ni una base de datos, ni un secreto. Si necesita algo del servidor, se lo pide con `serverLoader()`. El build te para con `Server-only module referenced by client`.

**Usar una exportación `.client` al pintar.** En el servidor vale `undefined`, y el componente se pinta también en el servidor: `TypeError: (void 0) is not a function` y un 500. Úsala dentro de un `useEffect`, de un manejador de eventos o de un `clientLoader`.

**Un `HydrateFallback` en una ruta que el servidor sí puede pintar.** Con `hydrate`, el servidor manda el fallback en vez del contenido: el buscador y quien no tiene JavaScript pierden la página. Si los datos del servidor bastan para el primer HTML, no lo exportes.

**Leer `localStorage` mientras se pinta el componente.** En el servidor no existe, y si lo esquivas con un `typeof window`, el servidor y el navegador pintan cosas distintas y la hidratación falla (lección 87 de React). Llévalo a un `clientLoader` con su `HydrateFallback`, o a un efecto, como el botón de la ficha.

**Proteger con un middleware de servidor rutas sin `loader`.** Si la navegación no pide nada al servidor, el middleware no se ejecuta. Lo que protegen de verdad son los datos, que siempre salen del servidor: la lección 18 pone un `loader` en la zona de hospitaleros.

**Esperar que `prefetch` ahorre la petición sin cabeceras de caché.** Descarga antes, pero si la respuesta no se puede guardar, el clic la vuelve a pedir. Y en una ruta con `clientLoader`, solo precarga el código.

**Una caché en el `clientLoader` que nunca se vacía.** Si una `action` cambia esos datos, la caché sigue enseñando los viejos hasta que caduque. Vacíala en una `clientAction` antes de llamar a `serverAction()`, como propone la guía.

## La lección 16 en el taller

Seis pasos, uno por cada `TODO (lección 16)`. Si te atascas, la app terminada está en la [rama `solucion`](https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller).

### Paso 1. Las reservas, en el servidor (`app/datos/reservas.server.ts`)

Todas las funciones del módulo llaman a `pendiente()`. Escríbelas con `node:fs/promises`:

- **Leer.** El archivo es `process.env.ARCHIVO_RESERVAS` o, si no está, `datos/reservas.json` en la carpeta del proyecto (los tests usan la variable, con un archivo temporal). Si el archivo no existe (`ENOENT`), devuelve tres reservas de ejemplo para la noche de hoy (`hoyEnSahagun()` de `~/fechas`): una `reservada`, una `llegada` y una `anulada`. Cualquier otro error, que suba.
- **Escribir de forma atómica.** Escribe el JSON en un archivo temporal de la misma carpeta (con `randomUUID()` en el nombre) y después renómbralo con `rename` sobre el bueno. `rename` cambia el archivo de una vez: quien lee, lee el viejo o el nuevo, nunca uno a medias.
- **Una cola.** Dos peticiones a la vez que leen, cambian y escriben se pisan: las dos leen lo mismo y gana la última. Encadena cada operación de escritura a la anterior con una promesa compartida del módulo (`colaDeEscritura = colaDeEscritura.then(…)`), y que un fallo no la rompa para las siguientes. Avisa en un comentario de que solo sirve dentro de un proceso.
- **`guardarReserva`, `actualizarReserva` y `reservarSiHayCamas`**, dentro de la cola. La última suma las personas de las reservas de esa noche que no están anuladas y solo guarda si caben en las 24 camas; devuelve `true` o `false`.
- **`buscarReserva`, `reservasDeNoche` y `camasLibres`**, que solo leen.

Tests: «mezcla dentro de la cola dos cambios simultáneos sobre la misma reserva», «mantiene un JSON válido con dos escrituras simultáneas» y «serializa la comprobación de camas y evita sobreventa» (seis grupos de seis personas a la vez: cuatro reservan con un 201 y dos reciben un 409). Este módulo es `.server` porque usa `node:fs`, y ya verás en la 18 por qué no hay que llamarlo desde ningún componente. Con él, `/camas` deja de dar un 500.

### Paso 2. La caché de la etapa (`app/routes/etapa.tsx`)

Cambia el `clientLoader` de marcador por el de esta lección: una caché de una entrada, con el slug como clave y cinco minutos de vida, que llama a `serverLoader()` cuando no le vale lo que tiene. Pon `clientLoader.hydrate = true as const` y **no** exportes `HydrateFallback`. Tests: «reutiliza durante cinco minutos el resultado del loader del servidor», «vuelve al servidor cuando la caché ha caducado» y «mantiene los datos SSR de una etapa mientras ceba la caché del navegador».

### Paso 3. Leer y guardar «Mi camino» (`app/mi-camino.ts`)

- `leerMiCamino()` lee la clave `el-cea:mi-camino` de `localStorage`, la parsea y la valida con `zod/mini` (`import { z } from 'zod/mini'`) como un array de textos. Quita los slugs que no sean de ninguna etapa (`ETAPAS`) y los repetidos. Si el JSON está roto o no es un array, devuelve `[]` sin lanzar.
- `anadirAMiCamino(slug)` añade un slug conocido sin repetirlo.

### Paso 4. La página «Mi camino» (`app/routes/mi-camino.tsx`)

Un `clientLoader` que devuelve `{ etapas }`: las de `ETAPAS` cuyo slug está en `leerMiCamino()`. Un `HydrateFallback` con un `<main>` y el texto «Preparando tu camino…». Y el componente, con su `<title>`, un `<h1>` y la lista de etapas enlazadas con `href`, o «Aún no has añadido ninguna etapa desde su ficha.» si está vacía. Test: «mi camino lee localStorage, ignora slugs desconocidos y tolera JSON roto», que llama a tu `clientLoader` con un slug inventado y después con JSON roto.

### Paso 5. El botón de la ficha (`app/routes/etapa.tsx`)

Un botón «Añadir a mi camino» que llama a `anadirAMiCamino(etapa.slug)` y pasa a decir «Añadida a mi camino», desactivado. Que solo se pinte después de hidratar: un estado `cliente` que empieza en `false` y un `useEffect` que lo pone a `true`. No tiene test: compruébalo en el navegador, y con `curl`, que el HTML no lo trae.

### Paso 6. El medidor de navegaciones (`app/medir.client.ts` y `app/root.tsx`)

El `clientMiddleware` de esta lección: mide con `performance.now()` antes y después de `next()`, escribe `Navegación completada en N ms` con `console.debug` y devuelve lo que devolvió `next()`. En `root.tsx`, impórtalo con otro nombre (`medirNavegacion`) y ponlo en la lista `clientMiddleware`. Tests: «el middleware cliente devuelve exactamente lo que devuelve next» e «instala el middleware de cliente en la raíz».

### Para terminar

```text
$ npm run leccion -- 16
 Test Files  1 passed (1)
      Tests  9 passed (9)

$ npm run typecheck
> react-router typegen && tsc
```

Y míralo en el navegador, con la pestaña Red abierta y filtrada por «Fetch/XHR», y la consola en el nivel «Verbose» para ver el `console.debug`: abre una etapa, vuelve a la lista, entra en otra y otra vez en la primera, marca una con «Añadir a mi camino» y ve a «Mi camino». Tienes que ver las mismas peticiones que en el recorrido de esta lección: un `.data` solo la primera vez que entras en una etapa desde la lista, y ninguno en «Mi camino». Con `npm run dev` los archivos se llaman de otra forma, pero las peticiones son las mismas.

### Retos para seguir practicando

Sin comprobación automática.

1. **Mide el servidor.** Copia el experimento de la lección: un `middleware` de servidor en `root.tsx` que apunte cada petición con `console.log`. Recorre la web y cuenta cuántas líneas salen en la terminal y cuántas en la consola del navegador. Después quítalo.
2. **Precarga con cabeza.** Pon `prefetch="intent"` en el enlace de «Camas» del menú y mira en la pestaña Red qué se descarga al pasar el ratón. Repite cuando hayas hecho la lección 17. ¿Cuántas veces llega `/camas.data` al servidor en cada caso?
3. **Mide lo que viaja.** Cambia `zod/mini` por `zod` en `app/mi-camino.ts`, construye con `npm run build` y compara el tamaño del trozo `mi-camino-….js` (en esta lección midió 78,94 kB frente a 13,84 kB). Después prueba una comprobación a mano (`Array.isArray` y `typeof`), sin Zod. ¿Siguen pasando los tests?
4. **Caché por etapa.** La caché de la ficha guarda una sola etapa. Cámbiala por un `Map` del slug a sus datos, con su caducidad, y comprueba en la pestaña Red que puedes ir y venir entre tres etapas sin ninguna petición `.data` después de la primera visita a cada una.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Documentación",
  "recursos": [
    {
      "titulo": "Client Data",
      "descripcion": "clientLoader y clientAction: saltarse el servidor, mezclar datos de los dos lados, rutas solo de cliente y una caché en el navegador.",
      "url": "https://reactrouter.com/how-to/client-data",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Route Module",
      "descripcion": "Qué hace cada exportación, con middleware, clientMiddleware, clientLoader.hydrate y HydrateFallback.",
      "url": "https://reactrouter.com/start/framework/route-module",
      "etiqueta": "React Router"
    },
    {
      "titulo": ".server modules",
      "descripcion": "Los módulos que nunca pueden llegar al navegador, y el error del build si lo intentan.",
      "url": "https://reactrouter.com/api/framework-conventions/server-modules",
      "etiqueta": "React Router"
    },
    {
      "titulo": ".client modules",
      "descripcion": "Los módulos que no entran en el build del servidor, y por qué allí valen undefined.",
      "url": "https://reactrouter.com/api/framework-conventions/client-modules",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Lazy Route Discovery",
      "descripcion": "Cómo descubre el navegador las rutas con /__manifest, y cómo configurarlo.",
      "url": "https://reactrouter.com/explanation/lazy-route-discovery",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Automatic Code Splitting",
      "descripcion": "El reparto por rutas, splitRouteModules y cómo se quita el código del servidor.",
      "url": "https://reactrouter.com/explanation/code-splitting",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Link: prefetch",
      "descripcion": "Los valores de prefetch y las etiquetas link que añade.",
      "url": "https://reactrouter.com/api/components/Link",
      "etiqueta": "React Router"
    }
  ]
}
```
