# Proyecto avanzado: panel en tiempo real, y hacerlo rápido

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-panel-en-tiempo-real-y-hacerlo-rapido` (autogenerado del título)
- **Orden:** 940
- **Fuentes:** [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) + [React Performance tracks](https://react.dev/reference/dev-tools/react-performance-tracks) + [React Compiler: Installation](https://react.dev/learn/react-compiler/installation) + [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction) — ver `contenido/react/TEMARIO.md` #94
- **Requiere:** El proyecto avanzado 79 de JavaScript (panel cripto) y las lecciones 46 (`useSyncExternalStore`), 65 a 69 (medir, renders, memorizar y el React Compiler) y 72 a 74 (React con TypeScript)
- **Repositorio:** [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos) (carpeta `panel-tiempo-real`)

---

## Qué vas a construir

El panel de criptomonedas del proyecto avanzado 79 de JavaScript, otra vez, pero **en directo**. Aquel pedía a CoinGecko las 30 monedas más grandes al cargar la página, y ahí se quedaba. Este enseña los 516 pares que cotizan en USDT en Binance y, cada segundo, un WebSocket trae los que se han movido: unos 70 de media. Se busca por nombre, se ordena por volumen, variación o precio, se marcan favoritos y cada fila lleva su minigráfico, como en la versión en JavaScript.

El proyecto tiene dos mitades:

- **Conectarlo.** Un almacén externo guarda el mercado y abre el WebSocket solo mientras alguien lo mira, y los componentes lo leen con `useSyncExternalStore` (lección 46). Todo en TypeScript: desde este proyecto, los avanzados van en TSX (módulo 10).
- **Hacerlo rápido.** Medir primero, con un `<Profiler>` y las Performance tracks del navegador (lección 65); después, encender el React Compiler (lecciones 68 y 69) y volver a medir; y por último, virtualizar la tabla con [TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction) para que en el DOM solo estén las filas que se ven. Es el módulo 9 entero, en una aplicación de verdad y con números de verdad.

Al final, como en los proyectos 92 y 93, las dos versiones frente a frente: lo que React te quita, lo que te añade y un fallo de la versión en JavaScript que solo aparece cuando los datos llegan solos.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-proyectos (carpeta panel-tiempo-real). La rama main trae el proyecto de Vite montado: los estilos, los tipos, el simulador, los componentes pequeños y todos los tests, y un comentario TODO (paso N) en cada sitio que construyes tú, con el mismo número que los pasos de esta lección. La rama solucion tiene el proyecto completo. Binance no pide ninguna clave: no hay archivo .env."
}
```

### De CoinGecko a Binance

El proyecto de JavaScript usaba la API de CoinGecko, gratuita y sin clave. Su WebSocket no lo es. Su documentación lo dice así: «CoinGecko WebSocket is available for paid plan customers (Basic plan & above)», es decir, solo con un plan de pago. Así que este proyecto usa los datos públicos de mercado de Binance, que no piden clave ni registro:

- **Una foto de todos los pares**: `https://data-api.binance.vision/api/v3/ticker/24hr?type=MINI&symbolStatus=TRADING`. El 22 de octubre de 2026 devolvía 1387 pares (389 KB, 82 KB comprimidos), y el panel se queda con los 516 que acaban en USDT.
- **Los cambios**: `wss://data-stream.binance.vision/ws/!miniTicker@arr`, un WebSocket que manda un mensaje por segundo con todos los pares que han cambiado.

Cambian tres cosas respecto al panel de JavaScript. Los precios van en USDT, una criptomoneda que vale un dólar, en vez de en euros. Binance da el símbolo de cada moneda (BTC, ETH, SOL), pero no su nombre completo ni su logo, así que cada fila lleva una inicial de color. Y el minigráfico enseña los últimos precios que han llegado desde que abriste la página, no los últimos siete días: Binance no los incluye en este stream.

## Antes de empezar

### Lo que necesitas

- **Node.js 22.12 o superior.** Vite 8 se conforma con la 20.19 (lección 2), pero Vitest 5, el que ejecuta los tests, pide la 22.12. Compruébalo con `node --version`.
- **Chrome o Edge.** Para el panel Performance con las pistas de React y para las React DevTools (lección 65). Las Performance tracks usan una API de extensión de las herramientas de Chrome.
- **El código**: `git clone https://github.com/pedroleni/react-proyectos.git`, o el botón verde **Code** → **Download ZIP** en [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos).
- **La versión en JavaScript** al lado: la carpeta `panel-cripto` de [javascript-proyectos](https://github.com/pedroleni/javascript-proyectos/tree/solucion/panel-cripto), rama `solucion`. Cada paso dice qué archivo de allí sustituye.

### Del cero al proyecto en marcha

1. **Abre la carpeta `panel-tiempo-real/`** en tu editor (la del proyecto, no la del repositorio entero).
2. **Instala las dependencias**: `npm install`. React, TanStack Virtual, Vite, el React Compiler, TypeScript, Oxlint y las herramientas de los tests, con versiones exactas en `package.json`.
3. **Arranca el servidor de desarrollo**: `npm run dev` y abre la dirección que imprime la terminal (casi siempre `http://localhost:5173`). Verás la cabecera, los controles, «Conectando…» arriba a la derecha y «Esperando los primeros datos del mercado…» donde irá la tabla. No llega nada: el almacén todavía no abre ninguna conexión.
4. **En otra terminal, ejecuta los tests**: `npm test`. Salen en rojo, y es a propósito:

```text
 Test Files  5 failed (5)
      Tests  24 failed | 3 passed (27)
```

Los tests ya están escritos, los de todos los pasos, y se ponen en verde a medida que avanzas. Los que pasan desde el principio son los de `crearPar`, que ya está hecho. Para que se repitan solos cada vez que guardas, usa `npx vitest`, sin `run`.

5. **El ciclo de trabajo**: busca el `TODO (paso N)` que toca, escríbelo y guarda. Así avanza el marcador de los tests:

- Tras el paso 1, quedan 16 en rojo: pasan los 11 del almacén.
- Tras el paso 2, 12.
- Tras el paso 3, 9.
- Tras el paso 4, 4: el de las medidas y los tres de la tabla virtual.
- Tras el paso 5, 3. El paso 6 no tiene tests: se comprueba midiendo.
- Tras el paso 7, ninguno: 27 en verde.

Dos avisos más de la rama `main`. **`npm run build` falla** hasta el final: TypeScript, con la configuración estricta de la plantilla de Vite, da por error cada variable que todavía no se usa (31 errores, casi todos «is declared but its value is never read» al empezar). Y **`npm run lint`** avisa de los `import` que aún no usas. Las dos cosas desaparecen solas al completar los pasos: son las piezas que vas a necesitar.

## La arquitectura: de `estado.js` a un almacén externo

La versión en JavaScript tenía un router, un estado observable (`estado.js`), unas acciones, dos páginas y dos componentes con su ciclo de vida a mano. La de React no tiene página de detalle (llevarla a una ruta es uno de los retos) y reparte el resto así:

```text
src/
├── mercado/
│   ├── tipos.ts            ← nuevo: Ticker, Par y Mercado, en TypeScript
│   ├── binance.ts          ← api.js: la red, ahora con un WebSocket
│   ├── almacen.ts          ← estado.js: el estado y quién se entera de sus cambios
│   ├── useMercado.ts       ← el suscribir() de main.js, convertido en Hook
│   ├── filtrar.ts          ← obtenerMonedasVisibles() de estado.js
│   ├── simulador.ts        ← nuevo: datos de mentira para medir
│   └── muestra.json        ← una foto real de Binance para el simulador
├── favoritos.ts            ← los favoritos de estado.js, como segundo almacén
├── formato.ts              ← utilidades.js, sin debounce ni canvas
├── medidas.ts              ← nuevo: lo que mide el <Profiler>
├── componentes/
│   ├── TablaPares.tsx      ← dashboard.js: qué filas se ven y en qué orden
│   ├── TablaCompleta.tsx   ← reconciliarTarjetas(), sin Map de instancias
│   ├── TablaVirtual.tsx    ← nuevo: solo las filas que se ven
│   ├── FilaPar.tsx         ← tarjetaMoneda.js, sin crear/actualizar/destruir
│   ├── CeldaPrecio.tsx, MiniGrafico.tsx, Encabezado.tsx
│   ├── Controles.tsx       ← buscador.js
│   ├── EstadoConexion.tsx  ← nuevo: «En directo», «Reconectando…»
│   └── Medidor.tsx         ← nuevo: el resumen del <Profiler>
├── App.tsx                 ← main.js y la cabecera de dashboard.js
└── main.tsx                ← crea el almacén y monta App
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las piezas de JavaScript y su sucesor",
  "roles": [
    {
      "etiqueta": "estado.js",
      "rol": "Un almacén externo",
      "descripcion": "Sigue fuera de React y sigue teniendo suscribir y notificar. Cambian dos reglas: el estado no se modifica, se sustituye, y leerlo devuelve siempre el mismo objeto mientras nada cambie."
    },
    {
      "etiqueta": "main.js",
      "rol": "useSyncExternalStore",
      "descripcion": "suscribir(renderizarRutaActual) vaciaba la página y la volvía a pintar entera. Ahora cada componente se suscribe a la parte del almacén que pinta, y React decide qué cambiar."
    },
    {
      "etiqueta": "tarjetaMoneda.js",
      "rol": "FilaPar y sus celdas",
      "descripcion": "crear, actualizar y destruir eran el ciclo de vida a mano de cada tarjeta. Ahora la fila describe lo que se ve con cada par, y lo que hay que deshacer va en la limpieza de un efecto."
    },
    {
      "etiqueta": "dashboard.js",
      "rol": "Una key por fila",
      "descripcion": "reconciliarTarjetas() guardaba las tarjetas vivas en un Map y decidía cuáles crear, actualizar o destruir. Es exactamente lo que hace React con la key de cada fila (lección 11)."
    }
  ]
}
```

Sobre el árbol, el almacén no está en ningún componente: vive en un módulo, se crea en `main.tsx` y llega por contexto. Tres componentes lo leen, y cada uno pide solo lo que pinta:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Quién lee el almacén",
  "nodos": [
    {
      "nombre": "MercadoContext",
      "nivel": 0,
      "etiqueta": "proveedor",
      "nota": "value = el almacén; no cambia nunca"
    },
    {
      "nombre": "App",
      "nivel": 1,
      "etiqueta": "estado: búsqueda, orden…",
      "nota": "los controles: búsqueda, orden, favoritos, virtual"
    },
    {
      "nombre": "EstadoConexion",
      "nivel": 2,
      "nota": "← useMercado: estado, hora y cambios del último lote"
    },
    {
      "nombre": "Controles",
      "nivel": 2,
      "nota": "buscador, orden, «Solo favoritos», «Virtualizar la tabla»"
    },
    {
      "nombre": "Profiler",
      "nivel": 2,
      "etiqueta": "id: Tabla",
      "nota": "mide cada commit de la tabla (paso 5)"
    },
    {
      "nombre": "TablaPares",
      "nivel": 3,
      "nota": "← useMercado: la lista de pares; useFavoritos()"
    },
    {
      "nombre": "TablaVirtual",
      "nivel": 4,
      "nota": "o TablaCompleta, según la casilla"
    },
    {
      "nombre": "FilaPar",
      "nivel": 5,
      "clave": "simbolo",
      "nota": "recibe su par por props"
    },
    {
      "nombre": "CeldaPrecio",
      "nivel": 6,
      "nota": "el destello cuando cambia el precio"
    },
    {
      "nombre": "MiniGrafico",
      "nivel": 6,
      "nota": "la línea de los últimos precios"
    },
    {
      "nombre": "Medidor",
      "nivel": 2,
      "nota": "← el resumen del Profiler, una vez por segundo"
    }
  ]
}
```

### Por qué un almacén fuera de React

El WebSocket no es de React: llega un mensaje cada segundo, quiera React o no, y lo leen tres componentes que pintan cosas distintas. Con lo de las lecciones 38 a 43, cada uno tendría su `useState` y su efecto suscribiéndose, y habría tres copias de los mismos datos (o tres conexiones). La lección 46 tiene la herramienta para esto: un almacén con dos funciones, `suscribir` y `leer`, y `useSyncExternalStore` en cada componente que lo usa. Una sola copia de los datos, fuera de React, y React se encarga de suscribirse, darse de baja y renderizar cuando cambian.

Hay un detalle de react.dev que conviene tener presente desde ya: los cambios de un almacén externo no pueden ir en una transición. Lo dice así: «mutations to the external store cannot be marked as non-blocking Transition updates». Es decir: **cada mensaje del WebSocket provoca un render bloqueante**, que no se puede interrumpir ni dejar para luego (lección 51). Mientras React renderiza la tabla, el navegador no atiende al scroll ni a las teclas. Por eso, en la segunda mitad del proyecto, importa cuánto tarda.

## Paso 1: el almacén (`src/mercado/almacen.ts`)

Sustituye a `estado.js`. Y se parece más de lo que parece: aquel también tenía una lista de suscriptores, una función `suscribir` que devolvía otra para darse de baja y un `notificar()` que los llamaba a todos. Lo que cambia son dos reglas, las de `useSyncExternalStore`:

- **Leer devuelve siempre el mismo objeto mientras nada cambie.** `obtenerEstado()`, en `estado.js`, construía un objeto nuevo en cada llamada, con un `new Set(favoritos)` dentro. Para React, eso es un estado distinto cada vez que lo mira.
- **El estado no se modifica: se sustituye.** `estado.js` cambiaba sus variables en su sitio (`favoritos.add(id)`, `filtro = texto`) y luego avisaba. Aquí cada lote del WebSocket produce una instantánea nueva, y la anterior se queda como estaba.

Antes de escribirlo, comprueba que la primera regla importa:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Lo esencial de estado.js del proyecto 79, conectado tal cual a React\nlet monedas = [{ id: 'bitcoin', precio: 81616 }]\nconst suscriptores = []\n\nfunction suscribir(fn) {\n  suscriptores.push(fn)\n  return () => suscriptores.splice(suscriptores.indexOf(fn), 1)\n}\n\nfunction obtenerEstado() {\n  return { monedas, filtro: '', favoritos: new Set() }\n}\n\nexport default function App() {\n  const estado = useSyncExternalStore(suscribir, obtenerEstado)\n  return <p>{estado.monedas.length} monedas</p>\n}\n\n// ¿Qué pasa al montar App?",
  "opciones": [
    "Pinta «1 monedas» y funciona",
    "Pinta «1 monedas», pero no se entera de los cambios",
    "React avisa de que getSnapshot debería guardarse y corta con «Maximum update depth exceeded»",
    "Pinta «1 monedas» dos veces, por StrictMode"
  ],
  "correcta": 2,
  "explicacion": "obtenerEstado hace de getSnapshot y devuelve un objeto nuevo en cada llamada. React lo compara con Object.is, cree que el almacén cambia cada vez que lo lee, escribe «The result of getSnapshot should be cached to avoid an infinite loop» y renderiza una y otra vez hasta que corta (lección 46). Comprobado con React 19.3.1."
}
```

El archivo tiene ya los tipos, las constantes y `crearPar()`, que convierte un ticker en una fila. Te faltan las dos funciones del almacén:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function crearAlmacenMercado(abrir: AbrirFuente): AlmacenMercado {\n  let mercado = MERCADO_VACIO\n  const oyentes = new Set<() => void>()\n  let cerrar: (() => void) | null = null\n  let cierrePendiente: ReturnType<typeof setTimeout> | undefined\n\n  function publicar(nuevo: Mercado) {\n    mercado = nuevo\n    for (const avisar of oyentes) avisar()\n  }\n\n  function recibir(tickers: readonly Ticker[]) {\n    // Un Map nuevo solo si algo cambia. Los pares que no llegan en el lote\n    // conservan su objeto, y su historial, tal cual: así se puede saber, sin\n    // mirar dentro, que su fila no ha cambiado.\n    let pares: Map<string, Par> | null = null\n    let cambios = 0\n    let ultimaHora = mercado.ultimaHora\n\n    for (const ticker of tickers) {\n      const anterior = (pares ?? mercado.pares).get(ticker.simbolo)\n      // La foto puede llegar después que el primer mensaje del WebSocket:\n      // un dato más viejo que el que ya tenemos no pisa nada.\n      if (anterior && anterior.actualizado >= ticker.hora) continue\n      pares ??= new Map(mercado.pares)\n      pares.set(ticker.simbolo, crearPar(ticker, anterior))\n      cambios++\n      ultimaHora = Math.max(ultimaHora ?? 0, ticker.hora)\n    }\n\n    if (pares === null) return\n    publicar({ ...mercado, pares, lista: [...pares.values()], ultimaHora, cambiosUltimoLote: cambios })\n  }\n\n  function cambiarEstado(estado: EstadoConexion) {\n    if (estado !== mercado.estado) publicar({ ...mercado, estado })\n  }\n\n  function suscribir(avisar: () => void) {\n    oyentes.add(avisar)\n    clearTimeout(cierrePendiente)\n    cerrar ??= abrir({ alRecibir: recibir, alCambiarEstado: cambiarEstado })\n\n    return () => {\n      oyentes.delete(avisar)\n      if (oyentes.size > 0) return\n      // No se cierra en el acto: StrictMode da de baja y vuelve a suscribir\n      // enseguida (lección 63), y cerrar un WebSocket que aún se está abriendo\n      // deja un error en la consola. Si en un segundo nadie vuelve, se cierra.\n      cierrePendiente = setTimeout(() => {\n        cerrar?.()\n        cerrar = null\n        mercado = MERCADO_VACIO\n      }, ESPERA_CIERRE)\n    }\n  }\n\n  return {\n    suscribir,\n    leer: () => mercado,\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "let mercado = MERCADO_VACIO",
      "nota": "La instantánea actual. No se modifica nunca: cada cambio la sustituye por otra. Es lo que devuelve leer(), y lo que React compara con Object.is."
    },
    {
      "fragmento": "pares ??= new Map(mercado.pares)",
      "nota": "Una copia del Map, y solo si algún ticker cambia algo. ??= asigna únicamente cuando pares todavía es null: un lote de 70 pares hace una copia, no setenta."
    },
    {
      "fragmento": "if (anterior && anterior.actualizado >= ticker.hora) continue",
      "nota": "La foto de todos los pares (paso 2) y el primer mensaje del WebSocket salen a la vez, y no se sabe cuál llega antes. Comparando la hora de Binance, un dato viejo nunca pisa uno nuevo."
    },
    {
      "fragmento": "pares.set(ticker.simbolo, crearPar(ticker, anterior))",
      "nota": "Un objeto nuevo para el par que ha cambiado. Los otros 446 siguen siendo los mismos objetos, con el mismo historial: así se sabe, sin mirar dentro, que su fila no ha cambiado."
    },
    {
      "fragmento": "lista: [...pares.values()]",
      "nota": "Los pares en un array, que es lo que pinta la tabla. Se construye una vez por lote, aquí, y no en cada lectura: un selector que lo construyera al leer devolvería un array nuevo cada vez (lo verás en los errores típicos)."
    },
    {
      "fragmento": "cerrar ??= abrir({ alRecibir: recibir, alCambiarEstado: cambiarEstado })",
      "nota": "La conexión se abre con el primer suscriptor, no al crear el almacén: si ningún componente mira el mercado, no hay WebSocket. abrir devuelve la función que la cierra."
    },
    {
      "fragmento": "cierrePendiente = setTimeout(() => {",
      "nota": "Con el último oyente fuera, no se cierra en el acto. En desarrollo, StrictMode da de baja y vuelve a suscribir enseguida (lección 63); si se cerrara aquí, cada recarga abriría dos WebSockets. Si alguien vuelve antes del segundo, clearTimeout lo cancela."
    },
    {
      "fragmento": "leer: () => mercado,",
      "nota": "El getSnapshot de useSyncExternalStore: devuelve la instantánea tal cual, sin construir nada. Dos llamadas seguidas sin lotes entre medias dan el mismo objeto."
    }
  ]
}
```

`crearPar()` sigue la misma regla con el historial del minigráfico: cuando llega un precio nuevo, hace un array nuevo en vez de añadirlo al que había:

```ts
historial =
  precio === anterior.precio ? anterior.historial : [...anterior.historial, precio].slice(-PUNTOS_HISTORIAL)
```

Copiar 60 números en cada cambio parece un desperdicio, y la tentación de cambiarlo por un `push` es grande. En los errores típicos verás qué pasa si lo haces, y por qué solo se nota con el React Compiler encendido.

Cuando lo tengas, `npm test` pone en verde los 11 tests de `src/mercado/almacen.test.ts`. No montan ningún componente ni abren ninguna conexión: le dan al almacén una fuente de mentira (`src/pruebas/fuenteFalsa.ts`) y deciden qué llega y cuándo. Este es el que vigila la segunda regla:

```ts
it('conserva el mismo objeto para los pares que no cambian', () => {
  const fuente = crearFuenteFalsa()
  const almacen = crearAlmacenMercado(fuente.abrir)
  almacen.suscribir(() => {})
  fuente.enviar([ticker('BTCUSDT', 81000), ticker('ETHUSDT', 2400)])
  const btcAntes = almacen.leer().pares.get('BTCUSDT')
  const ethAntes = almacen.leer().pares.get('ETHUSDT')

  fuente.enviar([ticker('ETHUSDT', 2410, { hora: 2 })])

  // El mismo objeto, y el mismo historial: así la fila de BTC se puede saltar.
  expect(almacen.leer().pares.get('BTCUSDT')).toBe(btcAntes)
  expect(almacen.leer().pares.get('ETHUSDT')).not.toBe(ethAntes)
  expect(almacen.leer().pares.get('ETHUSDT')?.precio).toBe(2410)
  expect(ethAntes?.precio).toBe(2400) // nada se modifica en su sitio
})
```

Y los dos últimos prueban el cierre con temporizadores falsos (`vi.useFakeTimers()`, lección 84): que la fuente se cierra un segundo después de que se vaya el último oyente, y que no se cierra si alguien vuelve antes, que es justo lo que hace StrictMode.

## Paso 2: el WebSocket (`src/mercado/binance.ts`)

Sustituye a `api.js`, y es la primera vez en el temario que usas un **WebSocket**. Con `fetch`, el navegador pide y el servidor contesta una vez. Un WebSocket es una conexión que se queda abierta, y por la que el servidor manda mensajes cuando quiere, sin que nadie los pida. La API del navegador cabe en cinco piezas ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)):

- `new WebSocket(url)` abre la conexión, con una dirección que empieza por `wss://`.
- `onopen` se llama cuando la conexión está lista.
- `onmessage` se llama con cada mensaje; el texto llega en `evento.data`.
- `onclose` se llama cuando la conexión se cierra, la cierres tú o no.
- `close()` la cierra.

Esto es un mensaje real del stream `!miniTicker@arr`, recortado a dos de sus 211 pares: un array con un objeto por cada par que ha cambiado en el último segundo, con los números como textos. El primero cotiza en bitcoins, no en USDT, y el panel lo descarta.

```json
[
  {"e":"24hrMiniTicker","E":1792687680004,"s":"WBTCBTC","c":"0.99780000","o":"0.99800000","h":"0.99880000","l":"0.99770000","v":"227.77475000","q":"227.34881145"},
  {"e":"24hrMiniTicker","E":1792687680017,"s":"BTCUSDT","c":"81179.47000000","o":"84702.16000000","h":"84876.01000000","l":"81163.05000000","v":"20769.23986000","q":"1721221522.45902550"}
]
```

`s` es el par, `c` el último precio, `o` el de hace 24 horas, `h` y `l` el máximo y el mínimo, `q` lo negociado en USDT y `E` la hora. Escuchamos este stream durante 30 segundos: llegaron 29 mensajes, con entre 44 y 129 pares en USDT cada uno (66,6 de media), y en total se movieron 388 de los 516. Por eso hace falta además la foto: sin ella, los pares tranquilos tardarían minutos en aparecer, o no aparecerían nunca. Esa parte, una petición con `fetch` y su `AbortController`, ya está hecha; te falta la conexión:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const abrirBinance: AbrirFuente = ({ alRecibir, alCambiarEstado }) => {\n  let socket = null as WebSocket | null\n  let cerrada = false\n  let intentos = 0\n  let reintento: ReturnType<typeof setTimeout> | undefined\n  const controlador = new AbortController()\n\n  // 1. La foto: todos los pares de golpe, una sola vez.\n  fetch(URL_FOTO, { signal: controlador.signal })\n    .then((respuesta) => {\n      if (!respuesta.ok) throw new Error(`Binance respondió con el estado ${respuesta.status}`)\n      return respuesta.json() as Promise<MiniTickerRest[]>\n    })\n    .then((datos) => alRecibir(datos.filter((t) => t.symbol.endsWith(MONEDA)).map(desdeFoto)))\n    .catch(() => {\n      // Sin foto no se rompe nada: los pares van llegando por el WebSocket.\n    })\n\n  // 2. Los cambios: un mensaje por segundo con los pares que se han movido.\n  function conectar() {\n    socket = new WebSocket(URL_STREAM)\n\n    socket.onopen = () => {\n      intentos = 0\n      alCambiarEstado('en-directo')\n    }\n\n    socket.onmessage = (evento: MessageEvent<string>) => {\n      const lote = JSON.parse(evento.data) as MiniTickerStream[]\n      alRecibir(lote.filter((t) => t.s.endsWith(MONEDA)).map(desdeStream))\n    }\n\n    // Binance corta cada conexión a las 24 horas, y la red se cae a veces:\n    // si no la hemos cerrado nosotros, se vuelve a abrir esperando cada vez más.\n    socket.onclose = () => {\n      if (cerrada) return\n      alCambiarEstado('reconectando')\n      const espera = Math.min(1000 * 2 ** intentos, ESPERA_MAXIMA)\n      intentos++\n      reintento = setTimeout(conectar, espera)\n    }\n  }\n\n  conectar()\n\n  return () => {\n    cerrada = true\n    clearTimeout(reintento)\n    controlador.abort()\n    socket?.close()\n  }\n}",
  "anotaciones": [
    {
      "fragmento": ".then((datos) => alRecibir(datos.filter((t) => t.symbol.endsWith(MONEDA)).map(desdeFoto)))",
      "nota": "La foto, ya hecha: 1387 pares, de los que se queda con los 516 en USDT. desdeFoto convierte los textos en números y le da al almacén el mismo formato que los mensajes del WebSocket."
    },
    {
      "fragmento": "socket = new WebSocket(URL_STREAM)",
      "nota": "La conexión. Se guarda en una variable de fuera porque la necesita la función que cierra, al final."
    },
    {
      "fragmento": "const lote = JSON.parse(evento.data) as MiniTickerStream[]",
      "nota": "El mensaje llega como texto. El as le dice a TypeScript qué forma tiene, sin comprobarlo: lo que viene de la red es de fuera de tu programa (con Zod se podría validar, como en la lección 61)."
    },
    {
      "fragmento": "alRecibir(lote.filter((t) => t.s.endsWith(MONEDA)).map(desdeStream))",
      "nota": "Un mensaje, una llamada a alRecibir, un lote para el almacén y, al final, un render. No se avisa par a par: serían setenta renders por segundo."
    },
    {
      "fragmento": "if (cerrada) return",
      "nota": "onclose también salta cuando cierras tú la conexión. Sin esta línea, cerrar el panel la volvería a abrir."
    },
    {
      "fragmento": "const espera = Math.min(1000 * 2 ** intentos, ESPERA_MAXIMA)",
      "nota": "Reconectar esperando cada vez el doble (1, 2, 4, 8 segundos... hasta 30), y volver a empezar en cuanto una conexión se abre. Binance corta cada conexión a las 24 horas, y la red se cae a veces; si mil pestañas reintentaran a la vez cada segundo, el servidor se saturaría."
    },
    {
      "fragmento": "socket?.close()",
      "nota": "La función que devuelve abrirBinance: lo que el almacén llama cuando se va el último oyente. Es el destruir() del proyecto de JavaScript, pero para la conexión."
    }
  ]
}
```

Binance manda además un ping cada 20 segundos y corta la conexión si no recibe respuesta, según su documentación. No tienes que hacer nada: el navegador contesta solo, y la API de WebSocket ni siquiera te deja ver esos mensajes.

Los tests de este paso, en `src/mercado/binance.test.ts`, cambian el `WebSocket` del navegador por uno de mentira con `vi.stubGlobal`. Así pueden abrir la conexión, mandarle un mensaje o cortarla cuando quieren, y comprobar con temporizadores falsos que la segunda reconexión espera dos segundos y que, después de cerrar, no se reconecta nada.

Para verlo funcionar en el navegador aún falta conectar React al almacén.

## Paso 3: leer el almacén desde React (`useMercado.ts` y `EstadoConexion.tsx`)

Es el `suscribir(renderizarRutaActual)` de `main.js`, convertido en un Hook. Con una diferencia de fondo: allí, cualquier cambio volvía a pintar la página entera; aquí, cada componente dice qué parte del mercado le interesa, con un **selector**, y React solo lo renderiza cuando esa parte cambia.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// mercado/useMercado.ts\nexport const MercadoContext = createContext<AlmacenMercado | null>(null)\nMercadoContext.displayName = 'Mercado'\n\nfunction useAlmacen(): AlmacenMercado {\n  const almacen = useContext(MercadoContext)\n  if (almacen === null) {\n    throw new Error('useMercado tiene que usarse dentro de <MercadoContext value={almacen}>')\n  }\n  return almacen\n}\n\n// Cada componente elige qué parte del mercado lee. React compara lo que\n// devuelve el selector con Object.is: un componente que lee el estado de la\n// conexión no se renderiza cuando solo cambian los precios. El selector tiene\n// que devolver algo que ya esté en la instantánea, nunca un objeto o un\n// array recién creado (lo verás en los errores típicos).\nexport function useMercado<T>(seleccionar: (mercado: Mercado) => T): T {\n  const almacen = useAlmacen()\n  return useSyncExternalStore(almacen.suscribir, () => seleccionar(almacen.leer()))\n}\n\n// componentes/EstadoConexion.tsx\nexport default function EstadoConexion() {\n  // Tres lecturas con su selector: cada una devuelve un texto o un número, y\n  // React solo vuelve a renderizar si alguno es distinto del de antes.\n  const estado = useMercado((mercado) => mercado.estado)\n  const ultimaHora = useMercado((mercado) => mercado.ultimaHora)\n  const cambios = useMercado((mercado) => mercado.cambiosUltimoLote)\n\n  return (\n    <div className=\"estado-conexion\">\n      {/* Solo el estado es una región viva: anunciar la hora cada segundo\n          haría la página inservible con un lector de pantalla. */}\n      <p role=\"status\" className={`indicador ${estado}`}>\n        {TEXTOS[estado]}\n      </p>\n      {ultimaHora !== null && (\n        <p className=\"ultima-hora\">\n          {formatoHora(ultimaHora)} · {cambios} {cambios === 1 ? 'cambio' : 'cambios'}\n        </p>\n      )}\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export const MercadoContext = createContext<AlmacenMercado | null>(null)",
      "nota": "El almacén llega por contexto en vez de importarse. Así los tests pueden montar la aplicación con un almacén nuevo y una fuente de mentira. Su valor no cambia nunca, así que el contexto no provoca ningún render (lección 66)."
    },
    {
      "fragmento": "export function useMercado<T>(seleccionar: (mercado: Mercado) => T): T {",
      "nota": "Un Hook genérico (lección 74): T es lo que devuelva el selector. useMercado((m) => m.estado) es de tipo EstadoConexion, y useMercado((m) => m.lista), readonly Par[], sin escribir ningún tipo."
    },
    {
      "fragmento": "useSyncExternalStore(almacen.suscribir, () => seleccionar(almacen.leer()))",
      "nota": "suscribir es siempre la misma función, la del almacén, así que React no se da de baja y se vuelve a suscribir en cada render (lección 46). La de leer es una flecha nueva cada vez, y da igual: React solo la llama."
    },
    {
      "fragmento": "const estado = useMercado((mercado) => mercado.estado)",
      "nota": "Tres lecturas, tres selectores. Cada uno devuelve un texto o un número, que React compara por su valor: si llega un lote y el estado sigue siendo «en-directo», este selector no provoca nada."
    },
    {
      "fragmento": "<p role=\"status\" className={`indicador ${estado}`}>",
      "nota": "Una región viva (lección 37): un lector de pantalla anuncia «Conexión perdida. Reconectando…» cuando pasa. La hora va fuera a propósito: anunciarla cada segundo haría la página inservible."
    }
  ]
}
```

El almacén se crea una sola vez, en `main.tsx`, fuera de cualquier componente, como el `QueryClient` del proyecto 93. Ese archivo ya está hecho:

```tsx
const parametros = new URLSearchParams(window.location.search)
const fuente =
  parametros.get('fuente') === 'simulada'
    ? crearSimulador({ copias: Number(parametros.get('copias') ?? 1) })
    : abrirBinance

// Un solo almacén para toda la aplicación, creado fuera de cualquier componente.
const almacen = crearAlmacenMercado(fuente)
```

Con el paso 3, la cabecera cambia de «Conectando…» a «En directo» en cuanto se abre el WebSocket, y a su lado aparecen la hora del último mensaje y cuántos pares traía. La tabla sigue esperando: es el paso 4. Antes, una pregunta sobre los selectores:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "function Indicador() {\n  const estado = useMercado((mercado) => mercado.estado)\n  console.log('render Indicador')\n  return <p>{estado}</p>\n}\n\n// Indicador ya está montado, la conexión está abierta y no\n// se corta. Cada segundo llega un lote con unos 70 pares\n// que han cambiado. En el minuto siguiente, ¿cuántas veces\n// más escribe la consola?",
  "opciones": [
    "Unas 60: una por lote",
    "Ninguna: el selector devuelve el mismo texto y React no renderiza",
    "Unas 4200: una por par que cambia",
    "Unas 120, por StrictMode"
  ],
  "correcta": 1,
  "explicacion": "Con cada lote, el almacén avisa a todos los suscritos y React vuelve a llamar al selector. Devuelve «en-directo», el mismo texto que antes, y Object.is dice que no ha cambiado: Indicador no se renderiza. Lo comprobamos con React 19.3.1 y un almacén de prueba: Precio, que lee la lista, se renderizaba con cada lote; Indicador, ninguna vez."
}
```

## Paso 4: la tabla (`TablaPares.tsx` y `TablaCompleta.tsx`)

Sustituye a `dashboard.js`. `filtrarYOrdenar()`, en `mercado/filtrar.ts`, ya está hecha: es `obtenerMonedasVisibles()` de `estado.js`, pero recibe la lista y los controles en vez de leerlos de variables de módulo. Y `FilaPar`, la fila, también: tiene el mismo papel que `tarjetaMoneda.js`. Te falta leer los datos y repartirlos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// componentes/TablaPares.tsx\nexport default function TablaPares({ busqueda, orden, soloFavoritos, virtual }: TablaParesProps) {\n  // Lee la lista entera del almacén: cada mensaje del WebSocket es una lista\n  // nueva y, por tanto, un render de este componente.\n  const lista = useMercado((mercado) => mercado.lista)\n  const favoritos = useFavoritos()\n  const visibles = filtrarYOrdenar(lista, { busqueda, orden, soloFavoritos, favoritos })\n\n  if (lista.length === 0) {\n    return <p className=\"mensaje-estado\">Esperando los primeros datos del mercado…</p>\n  }\n\n  return (\n    <>\n      <p className=\"recuento\">\n        {visibles.length} de {lista.length} pares\n      </p>\n      {visibles.length === 0 ? (\n        <p className=\"mensaje-estado\">\n          {soloFavoritos\n            ? 'No hay favoritos que coincidan con la búsqueda.'\n            : 'No hay pares que coincidan con la búsqueda.'}\n        </p>\n      ) : virtual ? (\n        <TablaVirtual pares={visibles} favoritos={favoritos} />\n      ) : (\n        <TablaCompleta pares={visibles} favoritos={favoritos} />\n      )}\n    </>\n  )\n}\n\n// componentes/TablaCompleta.tsx\nexport default function TablaCompleta({ pares, favoritos }: TablaProps) {\n  return (\n    <>\n      <div className=\"tabla-desplazable\" tabIndex={0} role=\"region\" aria-label=\"Pares en USDT\">\n        <table className=\"tabla-pares\">\n          <Encabezado />\n          <tbody>\n            {pares.map((par) => (\n              <FilaPar key={par.simbolo} par={par} esFavorito={favoritos.has(par.simbolo)} />\n            ))}\n          </tbody>\n        </table>\n      </div>\n      <p className=\"filas-dom\">Filas en el DOM: {pares.length}</p>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const lista = useMercado((mercado) => mercado.lista)",
      "nota": "El selector devuelve el array que el almacén construyó al recibir el lote, sin crear nada. Cambia una vez por segundo, y por eso TablaPares se renderiza una vez por segundo."
    },
    {
      "fragmento": "const favoritos = useFavoritos()",
      "nota": "El segundo almacén externo, ya hecho en favoritos.ts: un Set guardado en localStorage, leído con el patrón de la lección 46 (el mismo Set mientras el texto guardado no cambie)."
    },
    {
      "fragmento": "const visibles = filtrarYOrdenar(lista, { busqueda, orden, soloFavoritos, favoritos })",
      "nota": "Los visibles no se guardan en ningún sitio: se calculan en cada render a partir de lo que sí es estado (lección 24). Filtrar y ordenar 516 pares cuesta muy poco; lo caro, ya verás, son las filas."
    },
    {
      "fragmento": "<FilaPar key={par.simbolo} par={par} esFavorito={favoritos.has(par.simbolo)} />",
      "nota": "La key es el símbolo. Al ordenar por variación, las filas cambian de sitio en cada lote, y la key le dice a React que la fila de BTC es la misma aunque ahora esté más abajo: la mueve en vez de crearla otra vez."
    },
    {
      "fragmento": "<div className=\"tabla-desplazable\" tabIndex={0} role=\"region\" aria-label=\"Pares en USDT\">",
      "nota": "La tabla va dentro de una caja con scroll propio y altura fija. tabIndex={0} y el role con su nombre la hacen alcanzable con Tab, para moverse por ella con las flechas."
    }
  ]
}
```

Con este paso, `npm run dev` ya es el panel: 516 filas que se mueven solas, el buscador, el orden y los favoritos. Y `npm test` pone en verde los cinco tests de la tabla, en `src/App.test.tsx`. Montan la aplicación entera con una fuente de mentira y le mandan lotes dentro de `act`, porque lo que llega del WebSocket no viene de ningún evento que Testing Library ya envuelva (lección 84):

```tsx
it('cambia el precio y la variación de una fila cuando llega un lote nuevo', () => {
  const { enviar } = montar()
  enviar(MERCADO)
  expect(filaDe('SOL')).toHaveTextContent('104,35')
  expect(filaDe('SOL')).toHaveTextContent('+4,35 %')

  enviar([ticker('SOLUSDT', 98, { apertura: 100, hora: 2 })])

  expect(filaDe('SOL')).toHaveTextContent('98,00')
  expect(filaDe('SOL')).toHaveTextContent('-2,00 %')
})
```

### Lo que ya está hecho en cada fila

`FilaPar` pinta seis celdas: la estrella de favorito, el par con su inicial, el precio, la variación en 24 horas, el volumen y el minigráfico. Dos de ellas son componentes propios, y los dos resuelven a su manera lo que en la versión en JavaScript eran líneas en `crear()` y `destruir()`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// componentes/CeldaPrecio.tsx\nexport default function CeldaPrecio({ precio, tendencia }: CeldaPrecioProps) {\n  const celdaRef = useRef<HTMLTableCellElement>(null)\n  const precioAnterior = useRef(precio)\n\n  // El destello es un efecto: ocurre cuando cambia el precio, no cuando la fila\n  // aparece en pantalla, como al hacer scroll en la tabla virtual.\n  useEffect(() => {\n    if (precioAnterior.current === precio) return\n    precioAnterior.current = precio\n    const celda = celdaRef.current\n    if (!celda?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return\n    celda.animate([{ backgroundColor: tendencia === 'baja' ? ROJO : VERDE }, { backgroundColor: 'transparent' }], {\n      duration: 900,\n      easing: 'ease-out',\n    })\n  }, [precio, tendencia])\n\n  return (\n    <td ref={celdaRef} className=\"celda-numero\">\n      {formatoPrecio(precio)}\n    </td>\n  )\n}\n\n// componentes/MiniGrafico.tsx (recortado)\nexport default function MiniGrafico({ historial }: MiniGraficoProps) {\n  // ... calcula los puntos de la línea con el mínimo y el máximo del historial ...\n  return (\n    <svg\n      className={sube ? 'mini-grafico sube' : 'mini-grafico baja'}\n      viewBox={`0 0 ${ANCHO} ${ALTO}`}\n      aria-hidden=\"true\"\n    >\n      <polyline points={puntos} />\n    </svg>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const precioAnterior = useRef(precio)",
      "nota": "El precio de la vez anterior, en una ref: recordarlo no tiene que provocar ningún render (lección 33)."
    },
    {
      "fragmento": "if (precioAnterior.current === precio) return",
      "nota": "El destello verde o rojo es un efecto que ocurre cuando cambia el precio, no cuando la celda aparece. Con una animación de CSS al montarse, cada fila que entrara al hacer scroll en la tabla virtual (paso 7) destellaría sin haber cambiado."
    },
    {
      "fragmento": "window.matchMedia('(prefers-reduced-motion: reduce)').matches",
      "nota": "Quien ha pedido menos movimiento en su sistema no ve el destello. Setenta parpadeos por segundo pueden marear."
    },
    {
      "fragmento": "celda.animate([",
      "nota": "La Web Animations API: el navegador anima el fondo de la celda sin tocar el estado ni las clases. No hay que limpiar nada: la animación acaba sola, y si la celda desaparece, se va con ella."
    },
    {
      "fragmento": "viewBox={`0 0 ${ANCHO} ${ALTO}`}",
      "nota": "SVG con viewBox: el dibujo se escala solo con su celda. El canvas de la versión en JavaScript tenía que redibujarse al cambiar el tamaño de la ventana, con un listener de resize en window que había que quitar en destruir(), y que se quedaba vivo si se olvidaba."
    }
  ]
}
```

Y la reconciliación de `dashboard.js` desaparece entera. Esto es lo que hacía, en cada render, para no destruir las tarjetas que seguían visibles:

```js
function reconciliarTarjetas(rejilla, monedasVisibles) {
  const idsVisibles = new Set(monedasVisibles.map(({ id }) => id));

  monedasVisibles.forEach((moneda) => {
    const instancia = instancias.get(moneda.id);

    if (instancia) {
      instancia.actualizar(moneda);
    } else {
      instancias.set(moneda.id, crearTarjetaMoneda(moneda));
    }
  });

  instancias.forEach((instancia, id) => {
    if (!idsVisibles.has(id)) {
      instancia.destruir();
      instancias.delete(id);
    }
  });

  rejilla.textContent = '';
  monedasVisibles.forEach(({ id }) => {
    rejilla.append(instancias.get(id).elemento);
  });
}
```

Guardar las instancias vivas en un `Map` por id, actualizar las que siguen, crear las nuevas, destruir las que se van y volver a colocarlas en orden: es, línea por línea, lo que hace React con la `key` de cada fila (lección 11). En React no escribes nada de eso, y la tarjeta no tiene ni `actualizar()` ni `destruir()`: lo que hay que deshacer, si hay algo, va en la limpieza de un efecto.

## Paso 5: medir antes de tocar nada (`medidas.ts` y `App.tsx`)

La regla de las lecciones 17 y 65: antes de optimizar, medir. Y con un plan: medir **siempre lo mismo, en las mismas condiciones**, para poder comparar el antes y el después de cada cambio. En este paso pones el medidor; en los dos siguientes lo usarás.

El `<Profiler>` envuelve la tabla y llama a `registrarRender` después de cada commit en el que se haya renderizado algo de dentro. Las medidas se guardan en un array del módulo, nunca en el estado: un `setState` en `onRender` provocaría otro commit, que volvería a llamar a `onRender`, que es el bucle de «Maximum update depth exceeded» de la lección 65.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// medidas.ts (recortado)\nconst medidas: Medida[] = []\nlet resumen: Resumen | null = null\n\nexport const registrarRender: ProfilerOnRenderCallback = (_id, fase, duracionReal, duracionBase, _inicio, commit) => {\n  // El montaje inicial no cuenta: se mide lo que cuesta cada segundo de mercado.\n  if (fase === 'mount') return\n  medidas.push({ real: duracionReal, base: duracionBase, hora: commit })\n}\n\n// App.tsx (recortado)\n<div className=\"zona-tabla\">\n  <Profiler id=\"Tabla\" onRender={registrarRender}>\n    <TablaPares busqueda={busqueda} orden={orden} soloFavoritos={soloFavoritos} virtual={virtual} />\n  </Profiler>\n</div>",
  "anotaciones": [
    {
      "fragmento": "const medidas: Medida[] = []",
      "nota": "Fuera de React, en el módulo. El Medidor, que ya está hecho, lo resume una vez por segundo con otro useSyncExternalStore: el tercer almacén externo del proyecto."
    },
    {
      "fragmento": "if (fase === 'mount') return",
      "nota": "El primer render de la tabla, el que monta las filas, no cuenta: lo que interesa es lo que cuesta cada segundo de mercado, una y otra vez."
    },
    {
      "fragmento": "medidas.push({ real: duracionReal, base: duracionBase, hora: commit })",
      "nota": "actualDuration es lo que ha tardado este commit; baseDuration, lo que tardaría si React no se saltara nada (lección 65). Mientras no haya memorización, las dos se parecen. Con el compilador, ya verás."
    },
    {
      "fragmento": "<Profiler id=\"Tabla\" onRender={registrarRender}>",
      "nota": "Solo alrededor de la tabla: la cabecera y el medidor se renderizan cada segundo por su cuenta, y meterlos ensuciaría la medida. El Medidor, además, tiene que estar fuera: sus renders contarían como renders de la tabla."
    }
  ]
}
```

### Dónde medir: el build de profiling

Los números de `npm run dev` no sirven: en desarrollo, React hace comprobaciones de más y StrictMode renderiza cada componente dos veces (lección 65). Y en el build de producción normal, `onRender` no se llama nunca. Para medir hay un tercer build, el de profiling, y `vite.config.ts` ya lo tiene preparado (lo verás entero en el paso 6):

- `npm run medir:sin-compilador` construye en `dist-perfil-sin-compilador/` con `react-dom/profiling` en vez de `react-dom/client`, el alias de la lección 65, y lo sirve en `http://localhost:4173`.
- Los componentes conservan su nombre (`keepNames`). Sin eso, el minificador los acorta y en las pistas del panel Performance `FilaPar` sale con dos letras: lo comprobamos.

### Con qué datos medir: el simulador

El mercado real no se mueve igual dos minutos seguidos: en 30 segundos vimos lotes de 44 pares y de 129. Si mides antes de un cambio en un minuto tranquilo y después en uno movido, estás midiendo el mercado, no tu código. Por eso el proyecto trae un simulador, `src/mercado/simulador.ts`, que se activa con `?fuente=simulada` en la URL: parte de una foto real de los 516 pares (`muestra.json`) y cada segundo mueve 70, siempre los mismos y en el mismo orden, gracias a una semilla fija. Otra ventaja: si desde tu red no llegas a Binance, el proyecto entero funciona con él.

Con la tabla todavía sin virtualizar, abre `http://localhost:4173/?fuente=simulada&tabla=completa` y espera diez segundos. El medidor, a la derecha, enseña cuántos commits ha habido en los últimos diez segundos, la media de `actualDuration`, el más lento y la media de `baseDuration`.

### Lo que medimos nosotros

Con un Mac con Apple M4 Pro (24 GB, macOS 27.0.1), Chromium 153 sin ventana manejado por Playwright, el build de profiling y el simulador, tres rondas de 30 commits cada una:

- **Sin compilador, con la tabla completa: 5,1 ms por commit** de media (las tres rondas dieron 5,1, 4,1 y 5,1), y 9,4 ms el más lento de los 90 commits.
- En la traza, cada mensaje se reparte así: unos 6,1 ms de Render, 2,0 de Commit y 1,5 de Remaining Effects. El Render dura algo más que lo que mide el Profiler porque incluye trabajo de fuera de la tabla, como la cabecera, que se pone al día con cada lote.

¿Mucho o poco? Cinco milisegundos por segundo es medio por ciento del tiempo: aquí no se nota. Pero lección 66: **lo caro, multiplicado por lo frecuente**. Con la CPU ralentizada cuatro veces (la opción del panel Performance, para parecerse a un móvil o a un portátil modesto), la misma tabla tarda 10,1 ms por commit, y entre Render (12,5 ms) y Commit (4,6 ms) el navegador se queda bloqueado unos 17 ms con cada mensaje: más que un fotograma a 60 imágenes por segundo. Y con diez veces más filas (`&copias=10`, 5160 pares y 700 cambios por segundo), 25,1 ms por commit, con 31 ms de Render y 20 de Commit en la traza: varios fotogramas perdidos cada segundo mientras haces scroll. El problema está ahí aunque en tu ordenador no se vea.

Y en desarrollo, los mismos 516 pares: 58 ms por commit con `npm run dev:sin-compilador` (62 en otra ronda), más de once veces lo que mide el build de profiling. Por eso no se mide con `npm run dev`.

### Las Performance tracks

El medidor da un número; el panel Performance de Chrome enseña dónde se va el tiempo. Con la misma página abierta:

1. Abre las herramientas (F12), panel **Performance**, y pulsa el botón de grabar.
2. Espera cinco segundos sin tocar nada y para la grabación.
3. Busca los grupos **«Scheduler ⚛»** y **«Components ⚛»** en la línea de tiempo.

Esto es lo que salió en las nuestras, leyendo la traza grabada con Playwright:

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Una traza de cinco segundos, sin compilador y con la tabla completa",
  "items": [
    {
      "titulo": "«Scheduler ⚛», subpista «Blocking»",
      "texto": "Un grupo por segundo, uno por mensaje: Update, Render, Commit y Remaining Effects. Todo en Blocking, nunca en Transition: es la advertencia de react.dev sobre los almacenes externos. En las nuestras, el Render de cada mensaje duraba unos 6 ms, el Commit 2 y los Remaining Effects 1,5."
    },
    {
      "titulo": "Los renders pequeños",
      "texto": "Entre medias, otro render por segundo de unos 0,3 ms: el medidor y la hora de la cabecera, que no están dentro de la tabla."
    },
    {
      "titulo": "«Components ⚛»",
      "texto": "Debajo de cada Render, TablaPares, TablaCompleta y una barra por cada FilaPar: más de quinientas por mensaje, aunque solo hayan cambiado 70 pares. Es la factura entera: ninguna fila se salta."
    },
    {
      "titulo": "Remaining Effects",
      "texto": "Los useEffect de CeldaPrecio que lanzan el destello, uno por precio que ha cambiado. Son trabajo necesario: el compilador no los va a quitar."
    }
  ]
}
```

## Paso 6: el React Compiler (`vite.config.ts`)

El proyecto ya trae instalado lo que pide la lección 68 (`babel-plugin-react-compiler`, `@rolldown/plugin-babel` y `@babel/core` 7, con versión exacta). Falta encenderlo, y de forma que se pueda apagar para comparar: con los modos de Vite. `npm run dev` y `npm run medir` lo llevan; los que acaban en `sin-compilador`, no.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import react, { reactCompilerPreset } from '@vitejs/plugin-react'\nimport babel from '@rolldown/plugin-babel'\nimport { defineConfig } from 'vite'\n\nexport default defineConfig(({ mode }) => {\n  const conCompilador = !mode.endsWith('sin-compilador')\n  const perfil = mode.startsWith('perfil')\n  // El build de profiling de React: llama a onRender y escribe las Performance\n  // tracks, como el de desarrollo, pero sin sus comprobaciones extra (lección 65).\n  const alias: Record<string, string> = perfil ? { 'react-dom/client': 'react-dom/profiling' } : {}\n\n  return {\n    plugins: [react(), conCompilador && babel({ presets: [reactCompilerPreset()] })],\n    resolve: { alias },\n    define: {\n      __COMPILADOR__: JSON.stringify(conCompilador),\n    },\n    build: {\n      // ...\n    },\n  }\n})",
  "anotaciones": [
    {
      "fragmento": "const conCompilador = !mode.endsWith('sin-compilador')",
      "nota": "El modo sale de la opción --mode (lección 85). npm run dev:sin-compilador ejecuta vite --mode sin-compilador, y npm run medir:sin-compilador construye con --mode perfil-sin-compilador."
    },
    {
      "fragmento": "conCompilador && babel({ presets: [reactCompilerPreset()] })",
      "nota": "La misma línea que la plantilla react-compiler de create-vite (lección 68), pero condicional. Vite ignora los plugins que valen false, así que sin compilador la lista se queda en [react()]."
    },
    {
      "fragmento": "perfil ? { 'react-dom/client': 'react-dom/profiling' } : {}",
      "nota": "El build de profiling de la lección 65, para los modos que empiezan por perfil. main.tsx sigue importando de react-dom/client y el alias hace el resto."
    },
    {
      "fragmento": "__COMPILADOR__: JSON.stringify(conCompilador),",
      "nota": "Una constante que Vite sustituye al construir (define). El medidor la usa para decir si el compilador está activado, y así nunca dudas de qué build estás mirando."
    }
  ]
}
```

Al guardar `vite.config.ts`, Vite se reinicia solo (la terminal dice «vite.config.ts changed, restarting server...»). Recarga la página y, si tienes las React DevTools, busca la insignia «Memo ✨» junto a `FilaPar`, `CeldaPrecio`, `MiniGrafico`, `TablaPares` y `TablaCompleta` (lección 65). Después, a medir: `npm run medir`, misma dirección, mismos diez segundos.

- **Con compilador, con la tabla completa: 2,2 ms por commit** (2,5, 1,7 y 2,2 en las tres rondas): menos de la mitad que sin él.
- En la traza, el Render baja de 6,1 a 2,6 ms y el Commit de 2,0 a 0,6. Los Remaining Effects se quedan en 1,8: son los destellos de los precios que han cambiado, y siguen siendo los mismos.
- En el medidor, «Sin saltarse nada» (baseDuration) se queda en unos 4,6 ms, el doble de lo que de verdad ha tardado. Esa diferencia es lo que se ahorra.
- Con la CPU ralentizada cuatro veces, 4,5 ms en vez de 10,1. Con 5160 pares, 11,7 en vez de 25,1.

¿Qué ha cambiado? En «Components ⚛» siguen saliendo más de quinientas barras `FilaPar` por mensaje: como viste en la lección 68, cuando cambia el array, el compilador vuelve a crear los elementos de la lista y React llama a cada fila. Lo que cambia es lo que hace cada fila al llamarla. Este es un trozo de lo que sale del compilador para `FilaPar`, sin tipos:

```jsx
export default function FilaPar(t0) {
  const $ = _c(42);
  const { par, esFavorito, indice } = t0;
  const { simbolo, base, precio, variacion, tendencia } = par;
  // ...
  let t12;
  if ($[20] !== precio || $[21] !== tendencia) {
    t12 = <CeldaPrecio precio={precio} tendencia={tendencia} />;
    $[20] = precio;
    $[21] = tendencia;
    $[22] = t12;
  } else {
    t12 = $[22];
  }
  // ...
  let t18;
  if ($[32] !== par.historial) {
    t18 = <td className="celda-grafico"><MiniGrafico historial={par.historial} /></td>;
    $[32] = par.historial;
    $[33] = t18;
  } else {
    t18 = $[33];
  }
```

Cada fila compara con lo que tiene en su caché **las propiedades que lee**: `precio`, `tendencia`, `variacion`, `par.volumen`, `par.historial`... Las 446 filas cuyo par no ha cambiado encuentran los mismos valores, devuelven el mismo JSX de la vez anterior y React no baja a sus celdas. Solo las 70 que han cambiado hacen el trabajo de verdad. Y se nota en las dos fases: el render se acorta porque las filas no formatean ni dibujan nada, y el commit, porque React no tiene que comparar 3000 celdas para descubrir que no han cambiado.

Fíjate en la última comparación: `par.historial`, el array entero. El compilador compara por identidad, como `Object.is`. Si el almacén reutilizara el mismo array para un par que ha cambiado, esa fila devolvería el minigráfico viejo. Lo verás en los errores típicos.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En almacen.ts, al publicar cada lote, alguien añade una copia\n// de cada par «para no compartir objetos con la versión anterior»:\nconst copias = new Map([...pares].map(([simbolo, par]) => [simbolo, { ...par }]))\npublicar({ ...mercado, pares: copias, lista: [...copias.values()], ultimaHora, cambiosUltimoLote: cambios })\n\n// Ahora los 516 pares son objetos nuevos en cada lote, también\n// los que no han cambiado. Con el compilador encendido, ¿qué pasa\n// con el coste de cada commit de la tabla completa?",
  "opciones": [
    "Vuelve a lo de sin compilador: todas las filas se renderizan enteras",
    "Se queda más o menos igual: las filas comparan sus propiedades, no el objeto",
    "Se duplica: hay el doble de objetos",
    "La tabla deja de actualizarse"
  ],
  "correcta": 1,
  "explicacion": "El compilador guarda cada trozo de la fila según las propiedades que lee, no según el objeto par. Una copia con { ...par } tiene los mismos números y el mismo array historial, así que todo sale de la caché. Lo medimos: 1,3 ms por commit, nada que ver con los 5,1 de sin compilador. Con memo(FilaPar), en cambio, que compara las props con Object.is, las 516 filas se volverían a renderizar enteras."
}
```

## Paso 7: virtualizar la tabla (`TablaVirtual.tsx`)

El compilador ha quitado el trabajo que sobraba en cada fila. Pero las 516 filas siguen ahí, y siguen siendo 516 llamadas por mensaje y 516 `<tr>` en el DOM, de los que en pantalla caben unos quince. La última idea es la más simple: **no pintar lo que no se ve**. Virtualizar una lista es pintar solo las filas que caben en la caja con scroll, más unas pocas de margen, y rellenar el resto con espacio vacío de la altura que tendría, para que la barra de scroll no note la diferencia. Al hacer scroll, las filas que salen se desmontan y las que entran se montan.

[TanStack Virtual](https://tanstack.com/virtual/latest/docs/introduction) (versión 3.14.22, ya instalada) hace las cuentas: le dices cuántas filas hay, cuánto mide cada una y cuál es la caja con scroll, y te dice qué filas tocan y dónde. El HTML lo pones tú, y eso permite seguir usando una `<table>` de verdad:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default function TablaVirtual({ pares, favoritos }: TablaProps) {\n  const contenedorRef = useRef<HTMLDivElement>(null)\n\n  // El React Compiler se salta este componente, y npm run lint lo avisa\n  // (incompatible-library): el virtualizador cambia por dentro sin dejar de\n  // ser el mismo objeto, y memorizar lo que devuelve dejaría filas viejas.\n  // Por eso a FilaPar solo le llegan datos, nunca el virtualizador.\n  const virtualizador = useVirtualizer({\n    count: pares.length,\n    getScrollElement: () => contenedorRef.current,\n    estimateSize: () => ALTO_FILA,\n    overscan: 8,\n    // Cada fila se identifica por su par, no por su posición: al reordenar\n    // por variación, la fila de BTC sigue siendo la de BTC.\n    getItemKey: (indice) => pares[indice].simbolo,\n  })\n\n  const filas = virtualizador.getVirtualItems()\n  const rellenoArriba = filas.length > 0 ? filas[0].start : 0\n  const rellenoAbajo = filas.length > 0 ? virtualizador.getTotalSize() - filas[filas.length - 1].end : 0\n\n  return (\n    <>\n      <div ref={contenedorRef} className=\"tabla-desplazable\" tabIndex={0} role=\"region\" aria-label=\"Pares en USDT\">\n        <table className=\"tabla-pares\" aria-rowcount={pares.length + 1}>\n          <Encabezado conIndices />\n          <tbody>\n            {rellenoArriba > 0 && (\n              <tr className=\"relleno\" aria-hidden=\"true\">\n                <td colSpan={COLUMNAS} style={{ height: rellenoArriba }} />\n              </tr>\n            )}\n            {filas.map((fila) => {\n              const par = pares[fila.index]\n              return (\n                <FilaPar key={fila.key} par={par} esFavorito={favoritos.has(par.simbolo)} indice={fila.index + 2} />\n              )\n            })}\n            {rellenoAbajo > 0 && (\n              <tr className=\"relleno\" aria-hidden=\"true\">\n                <td colSpan={COLUMNAS} style={{ height: rellenoAbajo }} />\n              </tr>\n            )}\n          </tbody>\n        </table>\n      </div>\n      <p className=\"filas-dom\">Filas en el DOM: {filas.length}</p>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const virtualizador = useVirtualizer({",
      "nota": "El Hook de TanStack Virtual para una caja con scroll propio (hay otro, useWindowVirtualizer, para cuando la que hace scroll es la página entera)."
    },
    {
      "fragmento": "getScrollElement: () => contenedorRef.current,",
      "nota": "La caja con scroll, por una ref (lección 34). El virtualizador escucha su scroll y mide su altura con un ResizeObserver."
    },
    {
      "fragmento": "estimateSize: () => ALTO_FILA,",
      "nota": "Cuánto mide cada fila: 44 píxeles, los mismos que fija --alto-fila en estilos.css. Si no coinciden, las cuentas se tuercen (está en los errores típicos)."
    },
    {
      "fragmento": "overscan: 8,",
      "nota": "Ocho filas de más por arriba y por abajo, ya montadas, para que un scroll rápido no enseñe huecos en blanco."
    },
    {
      "fragmento": "getItemKey: (indice) => pares[indice].simbolo,",
      "nota": "Sin esto, cada fila virtual se identificaría por su posición. Al reordenar, la posición 0 pasaría a ser otro par y React reutilizaría la fila equivocada. Con el símbolo, fila.key sirve como key de React."
    },
    {
      "fragmento": "const filas = virtualizador.getVirtualItems()",
      "nota": "Las filas que tocan, cada una con su index, su start y su end en píxeles. Con la caja de 616 píxeles que fija el CSS, 22 filas: 14 a la vista y 8 de margen."
    },
    {
      "fragmento": "<table className=\"tabla-pares\" aria-rowcount={pares.length + 1}>",
      "nota": "Un lector de pantalla cuenta las filas que hay en el DOM. aria-rowcount le dice cuántas tiene la tabla de verdad (los pares más la de títulos), y aria-rowindex en cada fila, cuál es."
    },
    {
      "fragmento": "<td colSpan={COLUMNAS} style={{ height: rellenoArriba }} />",
      "nota": "El relleno: una fila vacía, escondida para los lectores de pantalla, con la altura de todas las que no se pintan por encima. Otra igual va al final."
    }
  ]
}
```

Marca y desmarca «Virtualizar la tabla» con `npm run dev` abierto: debajo de la tabla, «Filas en el DOM» pasa de 516 a 22. Y a medir otra vez, ahora con `http://localhost:4173/?fuente=simulada`, sin `tabla=completa`:

- **Sin compilador, con la tabla virtual: 0,6 ms por commit** (1,0, 0,6 y 0,6 en las tres rondas).
- **Con compilador, con la tabla virtual: 0,6 ms** (0,4, 0,6 y 0,7).

Ocho veces menos que la tabla completa sin compilar. Entre las dos versiones virtuales ya no hay diferencia que se pueda medir: con 22 filas no queda trabajo que ahorrar, y lo que separa una ronda de otra es más que lo que separa una versión de otra. Además, en una página como esta el reloj del navegador cuenta de 0,1 en 0,1 milisegundos (lo comprobamos con `performance.now()`: sin aislamiento entre orígenes, no da más precisión), así que por debajo de un milisegundo los decimales dicen poco.

En la traza, debajo de cada Render ya no hay quinientas barras `FilaPar`, sino una veintena. Y **el coste ya no depende de cuántos pares haya**, sino de cuántos caben en la caja: con `&copias=10`, 5160 pares, la tabla virtual tarda 3,1 ms por commit sin compilador y 3,5 con él; la completa, 25,1 y 11,7. Lo que queda en esos milisegundos no son las filas: es `filtrarYOrdenar` recorriendo y ordenando los 5160 pares en cada mensaje, y eso no lo arregla ni el compilador (la lista es nueva cada vez) ni la virtualización. Si algún día fuera un problema, la siguiente idea sería ordenar menos veces, no pintar menos.

### El aviso del linter: el compilador se salta esta tabla

Al terminar el paso, `npm run lint` dice esto:

```text
src/componentes/TablaVirtual.tsx:20:25: warning react(incompatible-library): Use of incompatible library help: This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized
```

Es decir: «Uso de una librería incompatible. Esta API devuelve funciones que no se pueden memorizar sin dejar la interfaz desactualizada. Para evitarlo, el React Compiler se salta, por defecto, la memorización de este componente o Hook. Aun así, puede haber problemas si los valores de esta API se pasan a otros componentes o Hooks memorizados». El compilador 1.0.0 lo confirma con su propio diagnóstico: «TanStack Virtual's `useVirtualizer()` API returns functions that cannot be memoized safely».

El motivo tiene nombre en react.dev, en la página de la regla [incompatible-library](https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library): **mutabilidad interior**. El virtualizador es siempre el mismo objeto, y lo que devuelve `getVirtualItems()` cambia por dentro con el scroll. Un caché que compara por identidad, como los `$[…]` del paso 6, vería el mismo objeto y devolvería las filas de antes de hacer scroll. Por eso el compilador deja `TablaVirtual` como está, y no pasa nada: es un componente pequeño, y las filas que pinta sí están compiladas. La regla que de verdad importa está en el comentario del componente: **a `FilaPar` solo le llegan datos** (el par, si es favorito, su índice), nunca el virtualizador ni nada que salga de él sin copiar. Si se lo pasaras, la fila compilada podría quedarse con valores viejos.

Puedes comprobarlo en el bloque del compilador, con el mismo código en JSX:

```laboratorio
{
  "tipo": "compilador-react",
  "titulo": "TablaVirtual y FilaPar, ante el compilador",
  "consigna": "Lee el informe: TablaVirtual no se compila por useVirtualizer, y Fila sí. Después cambia useVirtualizer por useRef en la primera línea del componente (y quita el import): verás que el motivo desaparece.",
  "codigo": "import { useRef } from 'react'\nimport { useVirtualizer } from '@tanstack/react-virtual'\n\nconst ALTO_FILA = 44\n\nfunction Fila({ par }) {\n  return (\n    <tr>\n      <th scope=\"row\">{par.base}</th>\n      <td>{par.precio.toFixed(2)}</td>\n    </tr>\n  )\n}\n\nexport default function TablaVirtual({ pares }) {\n  const contenedorRef = useRef(null)\n  const virtualizador = useVirtualizer({\n    count: pares.length,\n    getScrollElement: () => contenedorRef.current,\n    estimateSize: () => ALTO_FILA,\n    getItemKey: (indice) => pares[indice].simbolo,\n  })\n\n  return (\n    <div ref={contenedorRef} className=\"tabla-desplazable\">\n      <table>\n        <tbody>\n          {virtualizador.getVirtualItems().map((fila) => (\n            <Fila key={fila.key} par={pares[fila.index]} />\n          ))}\n        </tbody>\n      </table>\n    </div>\n  )\n}"
}
```

### Lo que se pierde al virtualizar

Virtualizar no es gratis, y conviene saber qué cambia antes de hacerlo en cualquier lista:

- **Buscar en la página con Ctrl+F (o Cmd+F) no encuentra las filas que no están en el DOM.** Por eso el panel tiene su propio buscador.
- **Un lector de pantalla solo recorre las filas pintadas.** `aria-rowcount` y `aria-rowindex` le dicen cuántas hay y en qué posición está, pero para llegar a la fila 400 hay que hacer scroll.
- **La altura de cada fila tiene que saberse.** Aquí todas miden 44 píxeles. Si cada una midiera algo distinto, TanStack Virtual las puede medir al pintarlas (`measureElement`), a cambio de más trabajo.

Con 516 filas en un ordenador rápido, el compilador solo ya deja la tabla completa en un par de milisegundos, y podrías quedarte ahí. Virtualizar compensa cuando las filas son miles, o cuando el dispositivo es lento: es lo que cambia la escala del problema.

## Los números, todos juntos

Media de `actualDuration` por commit de la tabla, con el build de profiling, el simulador (516 pares y 70 cambios por segundo, o 5160 y 700 con `&copias=10`) y el mismo ordenador de antes. Son medianas de varias rondas de 30 commits; entre una ronda y otra, los números bailan alrededor de medio milisegundo, así que las diferencias más pequeñas no significan nada.

- **Sin compilador, tabla completa**: 5,1 ms. Con la CPU cuatro veces más lenta, 10,1. Con 5160 pares, 25,1.
- **Con compilador, tabla completa**: 2,2 ms. Con la CPU lenta, 4,5. Con 5160 pares, 11,7.
- **Sin compilador, tabla virtual**: 0,6 ms. Con la CPU lenta, 1,2. Con 5160 pares, 3,1.
- **Con compilador, tabla virtual**: 0,6 ms. Con la CPU lenta, 0,9. Con 5160 pares, 3,5.
- **En desarrollo** (`npm run dev`, con StrictMode): 58 ms sin compilador y 16 con él con la tabla completa; 10,5 y 2,7 con la virtual.
- **Con Binance de verdad** (516 pares, una ronda de 30 segundos): 6,0 y 3,7 ms con la tabla completa, sin y con compilador; 1,1 y 0,8 con la virtual.

Tres conclusiones, y valen para cualquier lista que se actualiza sola:

- **El compilador divide el coste, pero no cambia la escala.** Con diez veces más filas, la tabla completa cuesta unas cinco veces más, compilada o no: cada fila sigue siendo una llamada y un elemento en el DOM.
- **La virtualización cambia la escala.** Con 516 pares o con 5160, la tabla virtual pinta las mismas 22 filas.
- **Juntos, casi no suman.** Con la tabla virtual, el compilador apenas se nota: las filas que se pintan son pocas, y lo que queda es filtrar y ordenar, que cambia en cada lote. Y el componente que virtualiza no se compila.

## Las dos versiones, lado a lado

### El fallo que solo aparece cuando los datos llegan solos

La versión en JavaScript no tenía datos en directo, así que se lo pusimos: un módulo que cada segundo cambia los precios de sus 30 monedas y llama a `establecerMonedas()`, como haría el mensaje de un WebSocket. Y escribimos «solana» en el buscador con Playwright, a dos ritmos:

- **Sin datos en directo, una letra cada 350 ms**: en el campo se queda «s» y el foco se va al `body`. El `debounce` de 250 ms cambia el filtro entre letra y letra, y ese cambio reconstruye la página. Es el fallo del recetario (proyecto 93), que este panel también tenía.
- **Sin datos en directo, una letra cada 100 ms**: «solana» entero, porque el `debounce` no salta hasta que paras. Entonces se va el foco.
- **Con un cambio de precios por segundo, una letra cada 100 ms**: a mitad de palabra el campo se vació y perdió el foco, y acabó en «solan», sin la última letra. Escribir deprisa ya no salva nada: cada mensaje reconstruye el buscador.


La causa está en `main.js`: `suscribir(renderizarRutaActual)`. Cada vez que el estado cambia, el router vacía la página (`contenedorActual.textContent = ''`) y la vuelve a construir entera: el buscador también. La reconciliación de `dashboard.js` salvaba las tarjetas, pero no el `<input>`, que es un elemento nuevo cada segundo. El foco se va al `body` y lo que escribes después no llega a ninguna parte. Sin datos en directo, ya fallaba al escribir despacio, cuando el `debounce` cambiaba el filtro entre letra y letra; con un mensaje por segundo, falla escribas como escribas.

En React, el mismo experimento contra la solución, con Binance de verdad y una letra cada 350 ms, deja «solana» en el campo y el foco en él: el `<input>` de `Controles` es el mismo elemento de un render a otro, y los mensajes del WebSocket no lo tocan (no renderizan ni siquiera `Controles`, que no lee el almacén).

### Lo que desaparece y lo que aparece

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Desaparece el ciclo de vida a mano",
      "texto": "El Map de instancias, crear, actualizar, destruir y el removeEventListener del resize que se olvidaba. La key de cada fila hace la reconciliación, y el SVG con viewBox no necesita ningún listener."
    },
    {
      "titulo": "Desaparece repintar la página entera",
      "texto": "renderizarRutaActual vaciaba el contenedor en cada cambio. Ahora cada componente lee su parte del almacén con un selector, y lo que no ha cambiado no se toca: ni el buscador, ni la cabecera, ni las filas quietas."
    },
    {
      "titulo": "Aparecen reglas para el estado",
      "texto": "leer() devuelve el mismo objeto mientras nada cambie; cada lote produce objetos nuevos solo para lo que cambia, y nunca se modifica nada en su sitio. estado.js no las necesitaba porque repintaba todo. Aquí son lo que permite saltarse el trabajo."
    },
    {
      "titulo": "Aparece medir",
      "texto": "Un Profiler, un build de profiling, un simulador con semilla y dos modos de Vite. La versión en JavaScript no tenía forma de saber cuánto le costaba cada actualización."
    },
    {
      "titulo": "Lo que cuesta",
      "texto": "El JavaScript que se descarga pasa de 13,2 kB (4,9 comprimido) a 274 kB (86,7 comprimido): React, React DOM y TanStack Virtual. Y el código, de 672 líneas en 10 archivos a 875 en 21, sin comentarios, líneas en blanco ni tests; aquel tenía router y página de detalle, y este, simulador y medidor. Además, TypeScript, un paso de build y la configuración del compilador."
    }
  ]
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Con el React Compiler ya no hace falta virtualizar",
      "realidad": "El compilador evita el trabajo que sobra en cada fila, pero cada fila sigue siendo una llamada y un elemento en el DOM. Con 5160 pares, la tabla completa compilada tardó más que la virtual sin compilar."
    },
    {
      "mito": "Si el panel va fluido en mi ordenador, no hay nada que mejorar",
      "realidad": "Con la CPU ralentizada cuatro veces, la misma tabla completa sin compilar bloquea el navegador más de un fotograma por mensaje. Mide también como lo vería alguien con un móvil."
    },
    {
      "mito": "useSyncExternalStore renderiza cada componente que se suscribe",
      "realidad": "Solo los que leen algo distinto: React compara con Object.is lo que devuelve cada lectura. El indicador de conexión no se renderiza con los 70 cambios de cada segundo."
    },
    {
      "mito": "Un almacén externo es solo para librerías como Zustand",
      "realidad": "Zustand y Redux lo usan por dentro (lección 75), pero un WebSocket, localStorage o un medidor de renders se conectan igual: suscribir, leer y nada más."
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
      "texto": "27 tests en 5 archivos: el almacén, la fuente de Binance, la aplicación, las medidas y la tabla virtual. Si fallan a la vez todos los de la aplicación, mira primero useMercado."
    },
    {
      "titulo": "¿npm run build y npm run lint?",
      "texto": "El build tiene que terminar sin errores de TypeScript. El linter, con un solo aviso: el de incompatible-library en TablaVirtual.tsx, que ya sabes leer."
    },
    {
      "titulo": "¿Se abre un solo WebSocket?",
      "texto": "En las herramientas del navegador, pestaña Red, filtrando los WebSockets: con npm run dev, una sola conexión a data-stream.binance.vision, aunque StrictMode suscriba dos veces (lo comprobamos). Y en sus mensajes, uno por segundo."
    },
    {
      "titulo": "¿Y si se corta la conexión?",
      "texto": "Lo comprueba el test «si se corta la conexión, vuelve a conectarse esperando cada vez más». En el navegador no es fácil verlo: el modo «Sin conexión» de la pestaña Red no corta un WebSocket que ya está abierto (lo probamos: los mensajes siguen llegando)."
    },
    {
      "titulo": "¿Has medido las cuatro versiones?",
      "texto": "Con y sin compilador, con la tabla completa y la virtual, con el simulador y en el build de profiling. Apunta tus números: no serán los nuestros, pero las proporciones deberían parecerse."
    },
    {
      "titulo": "¿Los favoritos se guardan?",
      "texto": "Marca dos, recarga la página y pulsa «Solo favoritos». Ábrelo en otra pestaña y marca uno más: la primera se entera sola, por el evento storage (lección 46)."
    }
  ]
}
```

## Errores típicos

**Un selector que construye lo que devuelve.** Parece lo más limpio: que el selector ya entregue los pares filtrados, y el componente solo los pinte. Pero `useMercado((mercado) => mercado.lista.filter(...))` devuelve un array nuevo en cada lectura, y React lee varias veces por render. Con el panel entero, la página se queda en blanco y la consola dice:

```text
The result of getSnapshot should be cached to avoid an infinite loop

Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

Es decir: «El resultado de getSnapshot debería guardarse para no entrar en un bucle infinito», y después «Se ha superado el máximo de actualizaciones anidadas». Es el mismo bucle de la lección 46 y de `obtenerEstado()` en el paso 1, escrito de otra forma. Arréglalo en pequeño:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un selector que filtra",
  "consigna": "La vista previa se cae nada más montarse: lee el error. Arregla Tabla para que el selector devuelva mercado.lista tal cual, y filtra después, en el cuerpo del componente. Prueba después «Llega un lote» y el buscador.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useState, useSyncExternalStore } from 'react'\nimport { leer, llegaUnLote, suscribir, type Mercado } from './mercado'\nimport './estilos.css'\n\nfunction useMercado<T>(seleccionar: (mercado: Mercado) => T): T {\n  return useSyncExternalStore(suscribir, () => seleccionar(leer()))\n}\n\nfunction Tabla({ busqueda }: { busqueda: string }) {\n  // El selector ya entrega los pares que contienen lo buscado\n  const visibles = useMercado((mercado) =>\n    mercado.lista.filter((par) => par.simbolo.includes(busqueda.toUpperCase())),\n  )\n  const total = useMercado((mercado) => mercado.lista.length)\n\n  return (\n    <>\n      <p>{visibles.length} de {total} pares</p>\n      <ul>\n        {visibles.map((par) => (\n          <li key={par.simbolo}>\n            {par.simbolo}: {par.precio.toFixed(2)} USDT\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport default function App() {\n  const [busqueda, setBusqueda] = useState('')\n\n  return (\n    <main>\n      <h1>Mercado en directo</h1>\n      <label>\n        Buscar par <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />\n      </label>\n      <button onClick={llegaUnLote}>Llega un lote</button>\n      <Tabla busqueda={busqueda} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "mercado.ts",
      "codigo": "export interface Par {\n  simbolo: string\n  precio: number\n}\n\nexport interface Mercado {\n  lista: readonly Par[]\n}\n\nlet mercado: Mercado = {\n  lista: [\n    { simbolo: 'BTC', precio: 81616.4 },\n    { simbolo: 'ETH', precio: 2396.59 },\n    { simbolo: 'SOL', precio: 104.35 },\n    { simbolo: 'XRP', precio: 1.32 },\n  ],\n}\nconst oyentes = new Set<() => void>()\nlet lotes = 0\n\nexport function suscribir(avisar: () => void) {\n  oyentes.add(avisar)\n  return () => {\n    oyentes.delete(avisar)\n  }\n}\n\nexport function leer(): Mercado {\n  return mercado\n}\n\n// Lo que haría un mensaje del WebSocket: un par cambia de precio\nexport function llegaUnLote() {\n  lotes++\n  const cambia = lotes % mercado.lista.length\n  mercado = {\n    lista: mercado.lista.map((par, i) => (i === cambia ? { ...par, precio: par.precio * 1.01 } : par)),\n  }\n  for (const avisar of oyentes) avisar()\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.6rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  padding-left: 1.2rem;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "comprobaciones": [
    {
      "descripcion": "Al abrir, la lista enseña los cuatro pares",
      "pasos": [],
      "espera": {
        "texto": "4 de 4 pares"
      }
    },
    {
      "descripcion": "Al pulsar «Llega un lote», ETH pasa a 2420.56 USDT",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Llega un lote"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "ETH: 2420.56 USDT"
      }
    },
    {
      "descripcion": "Al buscar «x», queda un solo par de los cuatro",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar par",
            "texto": "x"
          }
        }
      ],
      "espera": {
        "texto": "1 de 4 pares"
      }
    }
  ]
}
```

El arreglo es la regla del paso 3: **el selector devuelve algo que ya está en la instantánea**, y lo que se calcula a partir de ello se calcula al renderizar. Si filtrar fuera caro, el compilador (o un `useMemo`) lo guardaría mientras la lista y la búsqueda no cambien.

**Cerrar la conexión en cuanto se va el último oyente.** Parece lo correcto: si nadie escucha, fuera el WebSocket. Pero en desarrollo, StrictMode suscribe, da de baja y vuelve a suscribir nada más montar (lección 63). Con el cierre inmediato, la primera conexión se cierra antes de llegar a abrirse, y Chrome lo deja en la consola:

```text
WebSocket connection to 'wss://data-stream.binance.vision/ws/!miniTicker@arr' failed: WebSocket is closed before the connection is established.
```

Es decir: «Falló la conexión del WebSocket: se cerró antes de llegar a establecerse». Y en la pestaña Red, dos conexiones y dos peticiones de la foto, una de ellas cancelada. En producción no pasa, porque StrictMode no repite nada, pero un componente que se desmonta y se vuelve a montar enseguida (al cambiar de pestaña en la propia aplicación, por ejemplo) haría lo mismo. El segundo de espera del paso 1 lo evita.

**Añadir al historial con `push`.** Es el error que solo aparece con el compilador encendido. Si `crearPar()` hiciera `anterior.historial.push(precio)` en vez de crear un array nuevo, la fila recibiría un par nuevo pero con el mismo array dentro. Sin compilador, la fila se vuelve a renderizar entera, lee el array cambiado y todo parece funcionar. Con el compilador, la fila compara `par.historial` con lo que tiene guardado, ve el mismo array y devuelve el minigráfico de antes. Lo medimos en el panel, con la tabla completa: en cinco segundos, de las 40 primeras filas, sin compilador cambiaron 20 precios y 23 minigráficos; con el compilador, los mismos 20 precios y ningún minigráfico. Pruébalo en pequeño; este bloque sí ejecuta el código compilado:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El historial que no se mueve",
  "consigna": "Pulsa «Llega un lote» tres veces: los precios cambian, pero las líneas no y siguen diciendo «1 precio». En mercado.ts, cambia el push por un array nuevo para cada par, con historial: [...par.historial, precio], y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useSyncExternalStore } from 'react'\nimport { leer, llegaUnLote, suscribir, type Par } from './mercado'\nimport './estilos.css'\n\nfunction MiniGrafico({ historial }: { historial: number[] }) {\n  const minimo = Math.min(...historial)\n  const maximo = Math.max(...historial)\n  const puntos = historial\n    .map((precio, i) => `${i * 30},${38 - ((precio - minimo) / (maximo - minimo || 1)) * 36}`)\n    .join(' ')\n\n  return (\n    <span className=\"grafico\">\n      <svg viewBox=\"0 0 240 40\" aria-hidden=\"true\">\n        <polyline points={puntos} />\n      </svg>\n      {historial.length} {historial.length === 1 ? 'precio' : 'precios'}\n    </span>\n  )\n}\n\nfunction FilaPar({ par }: { par: Par }) {\n  return (\n    <li>\n      <strong>{par.simbolo}</strong> {par.precio.toFixed(2)} <MiniGrafico historial={par.historial} />\n    </li>\n  )\n}\n\nexport default function App() {\n  const lista = useSyncExternalStore(suscribir, leer)\n\n  return (\n    <main>\n      <ul>\n        {lista.map((par) => (\n          <FilaPar key={par.simbolo} par={par} />\n        ))}\n      </ul>\n      <button onClick={llegaUnLote}>Llega un lote</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "mercado.ts",
      "codigo": "export interface Par {\n  simbolo: string\n  precio: number\n  historial: number[]\n}\n\nlet lista: readonly Par[] = [\n  { simbolo: 'BTC', precio: 81616.4, historial: [81616.4] },\n  { simbolo: 'ETH', precio: 2396.59, historial: [2396.59] },\n  { simbolo: 'SOL', precio: 104.35, historial: [104.35] },\n]\nconst oyentes = new Set<() => void>()\nlet lotes = 0\n\nexport function suscribir(avisar: () => void) {\n  oyentes.add(avisar)\n  return () => {\n    oyentes.delete(avisar)\n  }\n}\n\nexport function leer() {\n  return lista\n}\n\nexport function llegaUnLote() {\n  lotes++\n  lista = lista.map((par) => {\n    const precio = par.precio * (lotes % 2 === 1 ? 1.004 : 0.997)\n    // Para no copiar el historial en cada lote, se añade al que ya había\n    par.historial.push(precio)\n    return { ...par, precio }\n  })\n  for (const avisar of oyentes) avisar()\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nul {\n  padding: 0;\n  list-style: none;\n  font-variant-numeric: tabular-nums;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  margin-bottom: 0.4rem;\n}\n\n.grafico {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.4rem;\n  color: #56647a;\n  font-size: 0.85rem;\n}\n\nsvg {\n  width: 120px;\n  height: 20px;\n}\n\npolyline {\n  fill: none;\n  stroke: #3457d5;\n  stroke-width: 2;\n  vector-effect: non-scaling-stroke;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "mercado.ts",
  "strictMode": true,
  "mostrarConsola": false,
  "compilador": true
}
```

Es la mutabilidad interior del paso 7, escrita por ti: un objeto que cambia por dentro sin cambiar de identidad. La regla de la lección 69 vale aquí entera: si algo funciona sin el compilador y falla con él, casi seguro que hay una regla rota, y la primera sospechosa es una mutación. El test de `crearPar` que comprueba que el par anterior no se ha tocado (`expect(antes.historial).toEqual([100])`) lo caza sin abrir el navegador.

**Una altura de fila que no coincide con `estimateSize`.** Si `ALTO_FILA` dice 40 y el CSS le da 44 píxeles a cada fila, TanStack Virtual hace las cuentas con una altura que no es. Lo probamos: la altura total de la tabla cambiaba mientras bajabas (20 780, 20 812 y 20 768 píxeles), así que la barra de scroll se mueve sola, y a 11 000 píxeles del principio se veían las filas 275 a 288, cuando con 44 son la 250 a la 263. Las filas siguen apareciendo, pero no donde tocan. Por eso `ALTO_FILA` y `--alto-fila` llevan cada uno un comentario que apunta al otro. Y si las filas no pudieran medir todas lo mismo, `measureElement` mide cada una al pintarla.

**Medir en desarrollo, o con el mercado de verdad.** En desarrollo, StrictMode renderiza dos veces y React comprueba cosas de más: 58 ms por commit con la tabla completa y sin compilador, frente a los 5,1 del build de profiling. Y con Binance de verdad, el número depende del minuto: en una ronda de 30 segundos, 6,0 ms con la tabla completa sin compilador, cuando con el simulador eran 5,1; y en los 30 segundos que escuchamos el stream en el paso 2 hubo lotes de 44 pares y de 129. Para comparar dos versiones, el build de profiling y el simulador; para saber cómo va de verdad, el mercado real, sabiendo que cada medida es de su momento.

## Retos para ampliarlo

1. **Ordenar al pulsar cada columna.** Convierte los títulos de la tabla en botones que ordenan por esa columna, y pon `aria-sort` en el `<th>` activo («ascending» o «descending»). El orden ya vive en `App`: ¿qué cambia en `Controles` y en `Encabezado`?
2. **El detalle de un par en su propia ruta.** Con React Router (lecciones 76 y 77), `/par/BTCUSDT` enseña un gráfico grande con las velas de un minuto del stream `btcusdt@kline_1m` de Binance. Es otro WebSocket, solo mientras la página está abierta: ¿dónde lo abres y dónde lo cierras?
3. **Agrupar los mensajes.** Haz que el almacén publique como mucho cada dos segundos, juntando los lotes que lleguen entre medias. Mide con el simulador cuánto baja el coste por segundo, y piensa qué pierde quien mira el panel.
4. **Que el buscador no espere a la tabla.** Ralentiza la CPU cuatro veces, desactiva la virtualización y escribe en el buscador: cada letra espera al render de la tabla. Pasa la lista a `TablaCompleta` a través de `useDeferredValue` (lección 51) y graba el panel Performance: ¿dónde aparecen ahora los renders de la tabla, en «Blocking» o en «Transition»?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-proyectos/panel-tiempo-real (rama main, punto de partida)",
      "descripcion": "El proyecto con los TODO de cada paso y todos los tests ya escritos.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/main/panel-tiempo-real",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-proyectos/panel-tiempo-real (rama solucion)",
      "descripcion": "El proyecto completo, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/solucion/panel-tiempo-real",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "javascript-proyectos/panel-cripto (rama solucion)",
      "descripcion": "La versión en JavaScript del proyecto 79, con su reconciliación a mano, para tenerla al lado.",
      "url": "https://github.com/pedroleni/javascript-proyectos/tree/solucion/panel-cripto",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "useSyncExternalStore",
      "descripcion": "La referencia del Hook: las dos funciones, por qué getSnapshot tiene que devolver lo mismo y por qué los cambios de un almacén externo no pueden ir en una transición.",
      "url": "https://react.dev/reference/react/useSyncExternalStore",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Performance tracks",
      "descripcion": "Las pistas «Scheduler ⚛» y «Components ⚛» del panel Performance, qué enseña cada una y en qué builds salen.",
      "url": "https://react.dev/reference/dev-tools/react-performance-tracks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "incompatible-library",
      "descripcion": "La regla que avisa de TablaVirtual: qué es la mutabilidad interior y por qué el compilador se salta los componentes que usan estas librerías.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "TanStack Virtual: Introduction",
      "descripcion": "Qué hace la librería, qué deja en tus manos (el HTML) y cómo empezar con useVirtualizer.",
      "url": "https://tanstack.com/virtual/latest/docs/introduction",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "Binance: WebSocket Streams",
      "descripcion": "Los streams públicos de mercado, el de todos los pares (!miniTicker@arr), el ping cada 20 segundos y el corte a las 24 horas.",
      "url": "https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md",
      "etiqueta": "Binance"
    }
  ]
}
```
