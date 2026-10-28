# Probar rutas: `createRoutesStub`, y `loader` y `action` como funciones

- **Módulo:** Modo framework
- **Slug:** `probar-rutas-createroutesstub-y-loader-y-action-como-funciones` (autogenerado del título)
- **Orden:** 210
- **Fuentes:** [Testing](https://reactrouter.com/start/framework/testing) + [createRoutesStub](https://reactrouter.com/api/utils/createRoutesStub) + [Middleware](https://reactrouter.com/how-to/middleware) — ver `contenido/react-router/TEMARIO.md` #21
- **Requiere:** Las lecciones 14 a 20 de esta ficha (el taller, hasta la 20) y la 10 (middleware y contexto). De React, la 83 y la 84 (Testing Library)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

Desde la lección 14, cada paso del taller ha tenido sus tests: `npm run leccion -- NN` los ponía en verde cuando el código estaba bien. Los escribía otro. **En esta lección los escribes tú**, y aprendes a hacerte la pregunta que importa de cualquier test: si rompo el código, ¿se entera?

Una app en modo framework parece difícil de probar: hay un servidor, un build que parte el código en dos, cookies, hidratación… Pero casi todo lo que escribes son **funciones normales**. Un `loader` recibe un objeto con un `Request` y un `context` y devuelve datos; una `action`, lo mismo; un middleware recibe además `next`. Para probarlas no hace falta arrancar nada: **las llamas tú, con un `Request` de verdad, y miras lo que devuelven**. Así están hechos casi todos los tests del taller.

Lo que no es una función normal son los componentes que usan hooks del router: `useFetcher`, `useLoaderData` o `useNavigation` necesitan un router alrededor. Para eso está `createRoutesStub`, que monta uno de mentira con las rutas que le des. Y la app entera, con el navegador, el servidor y la hidratación, se prueba de otra forma, que queda para la ficha de Testing.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres maneras de probar una ruta del modo framework",
  "roles": [
    {
      "etiqueta": "loader, action y middleware",
      "rol": "Funciones con un Request de verdad",
      "descripcion": "Sin React, sin router y sin servidor. Milisegundos por test. Comprueban estados, cabeceras, redirecciones y lo que se guarda. Es lo que más vas a escribir."
    },
    {
      "etiqueta": "createRoutesStub",
      "rol": "Un componente con hooks del router",
      "descripcion": "Un router en memoria con rutas, loader y action de mentira. Para componentes reutilizables que usan useFetcher, useLoaderData o useNavigation."
    },
    {
      "etiqueta": "extremo a extremo",
      "rol": "La app en marcha, con un navegador",
      "descripcion": "npm run build, npm start y Playwright pulsando como una persona. Lo único que prueba la ruta entera, la hidratación y las cookies del navegador. Ficha de Testing."
    }
  ]
}
```

## Dónde estás en el taller

Vienes de la lección 20, con el taller del [repositorio](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`) en el estado en que la dejaste: 85 tests en verde y 13 en rojo, los 4 de esta lección y los 9 de la 22. El archivo de esta lección es distinto de los demás: no hay ningún `TODO` en `app/`, y `pruebas/21-mis-pruebas.test.tsx` trae cuatro tests vacíos que fallan a propósito, cada uno con un comentario de lo que tiene que probar. Esto da ahora:

```text
$ npm run leccion -- 21

 ❯ pruebas/21-mis-pruebas.test.tsx (4 tests | 4 failed) 6ms
   ❯ lección 21: probar rutas (4)
     × muestra con createRoutesStub el error devuelto por una action falsa 4ms
     × llama al loader de hoy con un contexto tipado 0ms
     × la action de reservar da 400 por campos y 409 si la noche está llena 0ms
     × el middleware no llama a next cuando falta la sesión 0ms

 FAIL  pruebas/21-mis-pruebas.test.tsx > lección 21: probar rutas > muestra con createRoutesStub el error devuelto por una action falsa
AssertionError: TODO (lección 21): prueba el formulario con createRoutesStub.
```

Cada uno empieza con un `expect.fail('TODO (lección 21): …')`. Al final de la lección no queda ninguno y los cuatro prueban algo de verdad. Repasa antes, si hace falta, cómo se busca por rol y por etiqueta y cómo se espera a que aparezca algo con Testing Library: lo viste en las lecciones 83 y 84 de React, y aquí no se repite.

Un detalle del entorno: `vitest.config.ts` no carga el plugin de React Router. Los tests importan los módulos de ruta tal cual (`import { action as reservar } from '~/routes/reservar'`) y llaman a sus funciones; no hay build, ni rutas generadas, ni servidor.

## Un `loader` es una función: llámalo

Cuando llega una petición, React Router busca las rutas que encajan y llama a su `loader` con un objeto: `request`, `params`, `context`, `url` y `pattern`. En un test, ese objeto lo construyes tú. El taller trae desde el principio una función que lo hace, `argumentos`, en `pruebas/peticion.ts`, y la han usado los tests de todas las lecciones:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const ORIGEN = 'http://localhost:5173'\n\n/** Argumentos equivalentes a los que React Router entrega a cada manejador. */\nexport function argumentos<A>(\n  ruta: string,\n  {\n    init,\n    params = {},\n    context = new RouterContextProvider(),\n  }: { init?: RequestInit; params?: Record<string, string>; context?: RouterContextProvider } = {},\n): A {\n  const request = new Request(`${ORIGEN}${ruta}`, init)\n  const url = new URL(request.url)\n  url.pathname = url.pathname.replace(/\\.data$/, '')\n  return { request, url, params, context, pattern: '' } as unknown as A\n}\n\nexport function respuesta(valor: unknown): Response {\n  if (valor instanceof Response) return valor\n  throw new Error(`Se esperaba una Response y llegó ${JSON.stringify(valor)}`)\n}\n\nexport function envio(campos: Record<string, string>, cabeceras: Record<string, string> = {}): RequestInit {\n  return { method: 'POST', body: new URLSearchParams(campos), headers: cabeceras }\n}",
  "anotaciones": [
    {
      "fragmento": "export const ORIGEN = 'http://localhost:5173'",
      "nota": "Un origen cualquiera para las URL de los Request. Es el del servidor de desarrollo, pero nada se conecta a él: el Request solo es un objeto con una URL."
    },
    {
      "fragmento": "const request = new Request(`${ORIGEN}${ruta}`, init)",
      "nota": "Un Request de la API estándar de la web, el mismo que construye el servidor con cada petición: método, cabeceras (la Cookie, el Origin) y cuerpo."
    },
    {
      "fragmento": "url.pathname = url.pathname.replace(/\\.data$/, '')",
      "nota": "url es la dirección sin el .data de las peticiones que hace el navegador al navegar (lección 16). React Router la prepara así; la ayuda lo imita."
    },
    {
      "fragmento": "context = new RouterContextProvider(),",
      "nota": "El context de verdad, vacío por defecto. Si el loader lee algo que deja un middleware, lo pones tú antes con context.set."
    },
    {
      "fragmento": "return { request, url, params, context, pattern: '' } as unknown as A",
      "nota": "A es el tipo de los argumentos de la función que pruebas. Cada test lo saca con Parameters<typeof loader>[0], y así TypeScript comprueba el uso que haces del resultado."
    },
    {
      "fragmento": "export function respuesta(valor: unknown): Response {",
      "nota": "Para lo que devuelve un Response (un redirect, una ruta de recursos): si llega otra cosa, el test falla con un mensaje claro en vez de con un TypeError."
    },
    {
      "fragmento": "return { method: 'POST', body: new URLSearchParams(campos), headers: cabeceras }",
      "nota": "El cuerpo de un formulario normal, application/x-www-form-urlencoded, como el que manda un form sin JavaScript. La action lo lee con request.formData()."
    }
  ]
}
```

El `loader` de `hospitaleros/hoy.tsx` lee el hospitalero y la sesión del `context`: los dejó allí el middleware de la zona (lección 18). Llamado como función, nadie ha pasado por ese middleware, así que el contexto está vacío, y la lección 15 ya te enseñó lo que pasa entonces: `hospitaleroContext` se creó sin valor por defecto, y leerlo sin que nadie lo haya puesto lanza un error. **En el test haces el trabajo del middleware a mano**: creas un `RouterContextProvider` y le pones un hospitalero y una sesión antes de llamar al `loader`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ context }: Route.LoaderArgs) {\n  const noche = hoyEnSahagun()\n  const hospitalero = context.get(hospitaleroContext)\n  const sesion = context.get(sesionContext)\n  const reservas = await reservasDeNoche(noche)\n  const proximas = (await leerReservas())\n    .filter((reserva) => reserva.noche > noche && reserva.estado !== 'anulada')\n    .sort((a, b) => a.noche.localeCompare(b.noche))\n  return { noche, hospitalero, reservas, proximas, aviso: sesion.get('aviso') ?? null }\n}",
  "anotaciones": [
    {
      "fragmento": "const hospitalero = context.get(hospitaleroContext)",
      "nota": "Sin un context.set antes, esta línea lanza. Es justo lo que quieres en la app (olvidar el middleware falla pronto), y es lo que obliga al test a preparar el contexto."
    },
    {
      "fragmento": "const sesion = context.get(sesionContext)",
      "nota": "La sesión también la deja el middleware. En el test, una sesión vacía basta: crearAlmacenDeSesiones(['prueba']).getSession() la crea sin cookie."
    },
    {
      "fragmento": "const reservas = await reservasDeNoche(noche)",
      "nota": "Lee el archivo de reservas. Cada test usa uno propio en la carpeta temporal (pruebas/preparacion.ts lo cambia en cada beforeEach), y si no existe, salen las tres reservas de ejemplo de esta noche."
    }
  ]
}
```

### Lo que devuelve una `action` que usa `data()`

La `action` de `reservar.tsx` devuelve los errores con `data(…, { status: 400 })` (lección 3). Antes de escribir el test, adivina qué tienes en la mano cuando la llamas tú:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "import { action as reservar } from '~/routes/reservar'\nimport { argumentos, envio } from './peticion'\n\nconst invalida = await reservar(\n  argumentos<Parameters<typeof reservar>[0]>('/reservar', {\n    init: envio({ nombre: '', documento: '', noche: 'mal', personas: '0' }),\n  }),\n)\n// En la action:\n//   return data<ResultadoReserva>({ errores: …, valores }, { status: 400 })\n\nconsole.log(invalida instanceof Response, invalida.constructor.name)",
  "opciones": [
    "true Response: data() crea una respuesta con estado 400",
    "false DataWithResponseInit: un objeto con data e init, que el router convierte en respuesta después",
    "false Object: data() devuelve el objeto que le pasas, sin más",
    "Lanza un error: una action solo se puede llamar dentro del router"
  ],
  "correcta": 1,
  "explicacion": "data() no crea una Response: devuelve un objeto DataWithResponseInit con tres campos, type, data e init. Es el router quien lo convierte después en la respuesta. Por eso el test lee el estado en invalida.init.status y los errores en invalida.data.errores. redirect(), en cambio, sí devuelve una Response de verdad, con su cabecera Location."
}
```

Este es el objeto entero, sacado del taller con ese mismo envío:

```json
{
 "type": "DataWithResponseInit",
 "data": {
  "errores": {
   "nombre": ["Escribe tu nombre."],
   "documento": ["Escribe exactamente las tres últimas cifras de tu documento."],
   "noche": [
    "Elige una fecha válida.",
    "Elige una fecha que exista.",
    "El albergue abre del 1 de marzo al 31 de octubre."
   ],
   "personas": ["Reserva al menos una cama."]
  },
  "valores": { "nombre": "", "documento": "", "noche": "mal", "personas": "0" }
 },
 "init": { "status": 400 }
}
```

Si escribes `expect(invalida.status).toBe(400)`, como harías con una `Response`, el test falla con `AssertionError: expected undefined to be 400`, y `npm run typecheck` ya te lo había dicho:

```text
error TS2339: Property 'status' does not exist on type 'DataWithResponseInit<ResultadoReserva>'.
```

Es decir: «la propiedad status no existe en ese tipo». Por eso el test de la solución usa una pequeña función `estado(valor)` que lee `init?.status`.

**Una prueba de una `action` tiene tres partes: preparar lo que hay guardado, llamarla con un `Request` y mirar lo que devuelve y lo que ha guardado.** Para el 409, primero llenas la noche: `guardarReserva` con una reserva de 24 personas (las camas del albergue) en una fecha futura, y después pides una cama más esa misma noche.

## El middleware, con un `next` falso

Un middleware de servidor es una función que recibe los mismos argumentos que un `loader` y, además, `next`: lo que hay que llamar para seguir hacia los `loader` y la `action` (lección 10). **En el test, `next` es una función tuya, y puedes contar si alguien la ha llamado.** Con `vi.fn()` de Vitest obtienes una función vacía que recuerda sus llamadas.

El middleware de la zona, sin sesión, no llama a `next`: lanza un `redirect` a `/entrar?volver=…`. Lanzado, no devuelto, así que el test lo atrapa con `try`/`catch`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const exigirHospitalero: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {\n  const sesion = await leerSesion(request)\n  const hospitalero = buscarHospitalero(sesion.get('hospitaleroId'))\n  const inicio = sesion.get('inicio')\n  const caducada = typeof inicio !== 'number' || Date.now() - inicio > OCHO_HORAS\n  if (!hospitalero || caducada) {\n    // L18/L20: volver conserva el destino interno; throw redirect corta toda la\n    // rama protegida antes de que un loader llegue a ejecutarse.\n    const volver = destinoSeguro(url.pathname + url.search, href('/hospitaleros'))\n    const llegoCookieDeSesion = request.headers\n      .get('Cookie')\n      ?.split(';')\n      .some((cookie) => cookie.trimStart().startsWith('__sesion='))\n    throw redirect(`${href('/entrar')}?${new URLSearchParams({ volver })}`, {\n      headers: caducada && llegoCookieDeSesion ? { 'Set-Cookie': await cerrarSesion(sesion) } : undefined,\n    })\n  }",
  "anotaciones": [
    {
      "fragmento": "export const exigirHospitalero: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {",
      "nota": "Exportado con nombre: zona.tsx lo pone en su array middleware, y el test lo importa y lo llama como cualquier función."
    },
    {
      "fragmento": "const hospitalero = buscarHospitalero(sesion.get('hospitaleroId'))",
      "nota": "Con un Request sin cookie, la sesión está vacía y no hay hospitalero."
    },
    {
      "fragmento": "const volver = destinoSeguro(url.pathname + url.search, href('/hospitaleros'))",
      "nota": "Por eso la ayuda del test rellena url: el middleware lee de ahí la dirección pedida, no de request.url (que en la navegación lleva .data)."
    },
    {
      "fragmento": "throw redirect(`${href('/entrar')}?${new URLSearchParams({ volver })}`, {",
      "nota": "Un throw: la cadena se corta aquí y next no llega a llamarse. El test comprueba las dos cosas, la Response lanzada (302 y su Location) y que next no se ha llamado."
    }
  ]
}
```

Y con sesión, el caso contrario: `next` sí se llama, y lo que devuelva `next` es lo que devuelve el middleware, con las cabeceras que haya añadido. Ahí el `next` falso no puede ser vacío: tiene que devolver una `Response`, por ejemplo `async () => new Response('ok')`. Los tests de la lección 18 lo hacen así.

## Un componente con hooks del router: `createRoutesStub`

`ReservaFormulario` envía la reserva con `useFetcher` (lección 5), sin salir de la página, y pinta los errores que devuelve la `action` junto a cada campo. Si lo montas tal cual en un test, sin router, no llega a pintarse:

```text
Error: useFetcher must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.
```

Es decir: «useFetcher tiene que usarse dentro de un router de datos». **`createRoutesStub` crea ese router**: recibe una lista de rutas como las del modo datos (con `path`, `Component`, `loader` y `action`) y devuelve un componente que las monta. Por dentro, en la 8.5.0, es un `createMemoryRouter` con su `RouterProvider`, más el contexto que el modo framework espera encontrar. El `loader` y la `action` son tuyos, de mentira, y el componente es el de verdad. Así se prueba el componente y nada más: si falla, no es por la base de datos ni por la validación de la `action` real.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "  it('muestra con createRoutesStub el error devuelto por una action falsa', async () => {\n    // Se extrajo ReservaFormulario para probarlo con createRoutesStub sin chocar\n    // con los tipos Route.*; para un componente de ruta, la documentación usa\n    // `// @ts-expect-error` porque el stub no pertenece al manifiesto real.\n    const Stub = createRoutesStub([\n      {\n        path: '/reservar',\n        Component: ReservaFormulario,\n        action: () => data({ errores: { noche: ['No quedan camas para esa noche.'] } }, { status: 409 }),\n      },\n    ])\n    render(<Stub initialEntries={['/reservar']} />)\n    const usuario = userEvent.setup()\n    await usuario.type(screen.getByLabelText('Nombre'), 'Rita Nunes')\n    await usuario.type(screen.getByLabelText(/Tres últimas/), '123')\n    await usuario.type(screen.getByLabelText('Noche'), '2030-05-05')\n    await usuario.click(screen.getByRole('button', { name: 'Reservar' }))\n    expect(await screen.findByText('No quedan camas para esa noche.')).toBeInTheDocument()\n  })",
  "anotaciones": [
    {
      "fragmento": "const Stub = createRoutesStub([",
      "nota": "Una sola ruta. No hace falta root, ni el layout público, ni middleware: se prueba el formulario, no la app."
    },
    {
      "fragmento": "Component: ReservaFormulario,",
      "nota": "El componente de verdad, importado de reservar.tsx. Por eso está exportado aparte del componente de la ruta, que solo pone el título y lo envuelve."
    },
    {
      "fragmento": "action: () => data({ errores: { noche: ['No quedan camas para esa noche.'] } }, { status: 409 }),",
      "nota": "La action falsa: devuelve directamente lo que devolvería la real con la noche llena. El texto no tiene por qué ser el mismo de la app; lo que importa es la forma del objeto."
    },
    {
      "fragmento": "render(<Stub initialEntries={['/reservar']} />)",
      "nota": "initialEntries, como en createMemoryRouter: el router arranca en /reservar, la ruta del stub."
    },
    {
      "fragmento": "const usuario = userEvent.setup()",
      "nota": "user-event, como en la lección 83 de React: escribe tecla a tecla y pulsa como una persona."
    },
    {
      "fragmento": "await usuario.click(screen.getByRole('button', { name: 'Reservar' }))",
      "nota": "El fetcher envía a la action del stub. Pasa por el router de verdad: serializa el formulario, llama a la action y deja la respuesta en fetcher.data."
    },
    {
      "fragmento": "expect(await screen.findByText('No quedan camas para esa noche.')).toBeInTheDocument()",
      "nota": "findBy espera a que aparezca (lección 84). Con getBy, el test mira antes de que la action responda, y falla."
    }
  ]
}
```

Esa última nota, comprobada: con `getByText` y sin esperar al clic, el test falla así, aunque el componente esté bien:

```text
TestingLibraryElementError: Unable to find an element with the text: No quedan camas suficientes para esa noche.. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.
```

### Por qué un componente aparte, y no la ruta entera

`reservar.tsx` exporta dos componentes: `Reservar`, el de la ruta (el `export default`), y `ReservaFormulario`, que hace el trabajo. Se separaron por esta lección. La documentación de *Testing* lo dice claro: `createRoutesStub` está pensado para **componentes reutilizables** que usan hooks del router, y no para los componentes de ruta que usan los tipos `Route.*` de la lección 15. Esos tipos salen de tu app de verdad: el `loaderData` es lo que devuelve tu `loader` real, y `matches` sale del árbol de rutas real, con `root` y el layout público. En un stub no hay nada de eso: el `loader` es de mentira y el árbol tiene una sola ruta. Si lo que le das al stub no cuadra con tu app, los tipos te dicen una cosa y el test hace otra.

La documentación enseña un error de tipos al meter un componente de ruta en el stub (*«Types of property 'matches' are incompatible»*) y propone, si de verdad lo necesitas, callarlo con `// @ts-expect-error`. **En la 8.5.0 no sale ese error.** Lo comprobamos en el taller con `Component: Entrar`, un componente con `Route.ComponentProps`: `npm run typecheck`, con TypeScript 7.0.2 (la versión que fija el taller), no dijo nada, porque los tipos de `createRoutesStub` declaran `Component?: React.ComponentType<any>`, y `any` acepta cualquier componente. Y con el `// @ts-expect-error` que aconseja la documentación encima, el error es el contrario:

```text
pruebas/99-tipos-stub.test.tsx(9,7): error TS2578: Unused '@ts-expect-error' directive.
```

Es decir: «la directiva @ts-expect-error no se usa», porque no hay ningún error que esperar. El comentario de la documentación no te sirve tal cual en esta versión, y el problema que describe sigue ahí, solo que **en silencio**: con `any`, TypeScript no comprueba que tus props de mentira se parezcan a las de verdad.

Lo que sí funciona es tipar la `action` falsa con el mismo tipo que la real. `reservar.tsx` exporta `ResultadoReserva`, y con `data<ResultadoReserva>(…)` un error de forma salta al compilar. Si escribes `errores: { noche: 'No quedan camas.' }` (un texto, cuando la app espera una lista):

```text
error TS2322: Type 'string' is not assignable to type 'string[]'.
```

Es decir: «un string no se puede asignar a string[]». Sin el genérico, el test compilaría, el componente buscaría `errores.noche[0]`, sacaría la primera letra y el test pasaría o no por casualidad.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Y la ruta entera, ¿cómo se prueba?",
  "contenido": "Con la app en marcha. La documentación lo dice así: si necesitas probar un componente de ruta entero, hazlo con un test de integración o de extremo a extremo (Playwright, Cypress) contra la aplicación funcionando, porque eso ya no es una prueba unitaria. La ficha de Testing lo trata a fondo. Aquí, el componente de ruta de reservar.tsx es tan fino (un título y el formulario) que no queda nada que probar en él."
}
```

### `createRoutesStub` en la vista previa

`createRoutesStub` es un componente, y el router que monta es un router en memoria: lo mismo que funciona dentro de la vista previa de esta web. Lo hemos comprobado con el validador de las lecciones, que monta cada bloque con el React Router 8.5.0 de la vista previa: el stub se monta, el formulario envía y la `action` falsa responde. Así que puedes escribir aquí la `action` de mentira y ver el formulario reaccionar.

El formulario es el `ReservaFormulario` del taller, copiado tal cual y partido en dos archivos para que quepa en el editor (`resultado.ts` tiene el tipo y la función que busca el error de un campo). No hay barra de direcciones: el stub crea su propio router, y la vista previa no lo ve como el router de la app.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio: la action falsa del stub",
  "consigna": "En App.tsx, escribe la action del stub: con la noche 2027-08-15, un 409 con el error «No quedan camas suficientes para esa noche.» en errores.noche; con cualquier otra noche, un 201 con confirmado: «r-prueba». Prueba las dos en el formulario y después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createRoutesStub, data } from 'react-router'\nimport { ReservaFormulario } from './ReservaFormulario'\nimport type { ResultadoReserva } from './resultado'\nimport './estilos.css'\n\n// Lo mismo que en el test: un router de mentira con una sola ruta y una\n// action falsa. No hay servidor ni archivo de reservas.\nconst Stub = createRoutesStub([\n  {\n    path: '/reservar',\n    Component: ReservaFormulario,\n    action: async ({ request }) => {\n      const formulario = await request.formData()\n      const noche = String(formulario.get('noche'))\n      // Tu trabajo: si la noche es 2027-08-15 (está llena), devuelve un 409 con\n      // errores.noche = ['No quedan camas suficientes para esa noche.'].\n      // Con cualquier otra noche, un 201 con confirmado: 'r-prueba'.\n      // Usa data<ResultadoReserva>(...) para que TypeScript vigile la forma.\n      void noche\n      return data<ResultadoReserva>({}, { status: 200 })\n    },\n  },\n])\n\nexport default function App() {\n  return <Stub initialEntries={['/reservar']} />\n}\n"
    },
    {
      "nombre": "ReservaFormulario.tsx",
      "codigo": "import { useFetcher } from 'react-router'\nimport { errorDe, type ResultadoReserva } from './resultado'\n\nexport function ReservaFormulario() {\n  // L21: al no depender de Route.ComponentProps, createRoutesStub puede probar\n  // este formulario con una action inventada y sus propios tipos de ruta.\n  // useFetcher envía y recibe la action sin abandonar esta pantalla.\n  const fetcher = useFetcher<ResultadoReserva>()\n  const resultado = fetcher.data\n  if (resultado?.confirmado)\n    return (\n      <p className=\"confirmacion\" role=\"status\">\n        Reserva recibida. Tu referencia es <strong>{resultado.confirmado}</strong>.\n      </p>\n    )\n  return (\n    <fetcher.Form method=\"post\" className=\"formulario\">\n      <div className=\"campo\">\n        <label htmlFor=\"nombre\">Nombre</label>\n        <input\n          id=\"nombre\"\n          name=\"nombre\"\n          autoComplete=\"name\"\n          defaultValue={resultado?.valores?.nombre}\n          aria-invalid={!!errorDe(resultado, 'nombre')}\n          aria-describedby={errorDe(resultado, 'nombre') ? 'nombre-error' : undefined}\n          required\n        />\n        {errorDe(resultado, 'nombre') && (\n          <p id=\"nombre-error\" className=\"error\">\n            {errorDe(resultado, 'nombre')}\n          </p>\n        )}\n      </div>\n      <div className=\"campo\">\n        <label htmlFor=\"documento\">Tres últimas cifras del documento</label>\n        <input\n          id=\"documento\"\n          name=\"documento\"\n          inputMode=\"numeric\"\n          maxLength={3}\n          defaultValue={resultado?.valores?.documento}\n          aria-invalid={!!errorDe(resultado, 'documento')}\n          aria-describedby={errorDe(resultado, 'documento') ? 'documento-error' : 'documento-ayuda'}\n          required\n        />\n        <small id=\"documento-ayuda\">No guardamos el documento completo.</small>\n        {errorDe(resultado, 'documento') && (\n          <p id=\"documento-error\" className=\"error\">\n            {errorDe(resultado, 'documento')}\n          </p>\n        )}\n      </div>\n      <div className=\"campos-dobles\">\n        <div className=\"campo\">\n          <label htmlFor=\"noche-reserva\">Noche</label>\n          <input\n            id=\"noche-reserva\"\n            name=\"noche\"\n            type=\"date\"\n            defaultValue={resultado?.valores?.noche}\n            aria-invalid={!!errorDe(resultado, 'noche')}\n            aria-describedby={errorDe(resultado, 'noche') ? 'noche-error' : undefined}\n            required\n          />\n          {errorDe(resultado, 'noche') && (\n            <p id=\"noche-error\" className=\"error\">\n              {errorDe(resultado, 'noche')}\n            </p>\n          )}\n        </div>\n        <div className=\"campo\">\n          <label htmlFor=\"personas\">Personas</label>\n          <input\n            id=\"personas\"\n            name=\"personas\"\n            type=\"number\"\n            min=\"1\"\n            max=\"6\"\n            defaultValue={resultado?.valores?.personas ?? '1'}\n            aria-invalid={!!errorDe(resultado, 'personas')}\n            aria-describedby={errorDe(resultado, 'personas') ? 'personas-error' : undefined}\n            required\n          />\n          {errorDe(resultado, 'personas') && (\n            <p id=\"personas-error\" className=\"error\">\n              {errorDe(resultado, 'personas')}\n            </p>\n          )}\n        </div>\n      </div>\n      <button type=\"submit\" disabled={fetcher.state !== 'idle'}>\n        {fetcher.state === 'submitting' ? 'Reservando…' : 'Reservar'}\n      </button>\n    </fetcher.Form>\n  )\n}\n"
    },
    {
      "nombre": "resultado.ts",
      "codigo": "// Copiado de app/routes/reservar.tsx del taller.\nexport type ResultadoReserva = {\n  errores?: Record<string, string[] | undefined>\n  valores?: Record<string, string>\n  confirmado?: string\n}\n\nexport function errorDe(resultado: ResultadoReserva | undefined, campo: string): string | undefined {\n  return resultado?.errores?.[campo]?.[0]\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body { font-family: system-ui, sans-serif; margin: 1rem; color: #3b3127; }\n.formulario { display: grid; gap: 0.75rem; max-width: 24rem; }\n.campo { display: grid; gap: 0.25rem; }\n.campos-dobles { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }\ninput { padding: 0.4rem; border: 1px solid #8a7a66; border-radius: 4px; }\ninput[aria-invalid='true'] { border-color: #a3341f; }\n.error { color: #a3341f; margin: 0; }\n.confirmacion { background: #f1e6d0; padding: 0.75rem; border-radius: 4px; }\nbutton { padding: 0.5rem 1rem; background: #9a5b13; color: white; border: 0; border-radius: 4px; }\n"
    }
  ],
  "archivoInicial": "App.tsx",
  "barraDeDirecciones": false,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "comprobaciones": [
    {
      "descripcion": "Con la noche 2027-08-15, el formulario enseña «No quedan camas suficientes para esa noche.»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Rita Nunes"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tres últimas cifras del documento",
            "texto": "123"
          }
        },
        {
          "escribir": {
            "etiqueta": "Noche",
            "texto": "2027-08-15"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar"
          }
        }
      ],
      "espera": {
        "texto": "No quedan camas suficientes para esa noche."
      }
    },
    {
      "descripcion": "Con otra noche, el formulario confirma la reserva con la referencia r-prueba",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Rita Nunes"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tres últimas cifras del documento",
            "texto": "123"
          }
        },
        {
          "escribir": {
            "etiqueta": "Noche",
            "texto": "2027-08-16"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar"
          }
        }
      ],
      "espera": {
        "texto": "r-prueba"
      }
    },
    {
      "descripcion": "Con la noche llena no sale ninguna confirmación",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Rita Nunes"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tres últimas cifras del documento",
            "texto": "123"
          }
        },
        {
          "escribir": {
            "etiqueta": "Noche",
            "texto": "2027-08-15"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "status"
        }
      }
    }
  ]
}
```

Fíjate en dos cosas mientras lo pruebas. La primera: con el 409, el campo «Noche» se marca como no válido y su error queda enlazado con `aria-describedby`, y todo eso lo hace el componente de verdad con lo que devuelve tu `action` de mentira. La segunda: si en vez de `data<ResultadoReserva>(…)` escribes `data({ errores: { noche: 'No quedan camas' } })`, el panel de errores de tipos no dice nada y el formulario pinta solo una «N»: `errorDe` toma el primer elemento, y el primer elemento de un texto es su primera letra.

## Los tests que no detectan nada

Un test en verde dice que el código hace lo que el test comprueba. No dice que el test compruebe lo importante. Hay una forma directa de saberlo: **rompe el código a propósito y mira si algún test se pone en rojo**. Si la suite sigue en verde con el código roto, ese fallo podría llegar a producción sin que nadie se entere. Se llama *probar con mutaciones* (*mutation testing*): cada cambio que rompe algo es un mutante, y un buen test lo «mata».

El taller se revisó así antes de darlo por bueno. En la primera versión, con una veintena de cambios que rompían algo de verdad (quitar el middleware de la zona, comparar solo la longitud del token de avisos, no guardar la sesión, un *nonce* fijo, la página 404 respondiendo 200…), los 55 tests que había entonces seguían en verde. Cada uno de esos mutantes tiene ahora un test que lo mata. Estos tres son de esta lección, y los puedes repetir en tu copia: escribe una versión débil del test al lado de la buena, rompe el código y ejecuta las dos.

### Primer mutante: el `loader` de hoy, sin reservas

Era uno de los mutantes de la revisión. La versión débil del test comprueba que todas las reservas que devuelve el `loader` son de la noche de hoy:

```tsx
expect(resultado.reservas.every((reserva) => reserva.noche === resultado.noche)).toBe(true)
```

Parece razonable. Ahora rompe `hoy.tsx`, para que el `loader` devuelva siempre una lista vacía:

```tsx
return { noche, hospitalero, reservas: [] as typeof reservas, proximas, aviso: sesion.get('aviso') ?? null }
```

Y ejecuta los dos tests, el débil y el de la solución:

```text
 ✓ pruebas/21-debiles.test.tsx > versiones débiles > débil: el loader de hoy solo trae reservas de su noche 3ms
 × pruebas/21-mis-pruebas.test.tsx > lección 21: probar rutas > llama al loader de hoy con un contexto tipado 2ms

AssertionError: expected 0 to be greater than 0
```

El débil sigue en verde porque **`every` sobre una lista vacía da `true`**: «todas las reservas son de hoy» es cierto si no hay ninguna. El hospitalero vería «Todavía no hay reservas para esta noche» con el albergue lleno, y el test no se enteraría. El de la solución exige además que haya alguna (`expect(resultado.reservas.length).toBeGreaterThan(0)`), y lo mata. En la suite completa ya no es el único: tras la revisión, un test de la lección 18 comprueba también las reservas exactas que devuelve `hoy`.

### Segundo mutante: la noche llena que nunca se usa

Ahora rompe la reserva: que nadie compruebe si quedan camas. Antes de mirar la respuesta, piensa qué le pasa a esta versión débil del test del 400 y el 409, que prepara la noche llena pero solo comprueba el 400:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La action de reservar, rota: nadie comprueba las camas libres.\n// En reservarSiHayCamas (app/datos/reservas.server.ts):\n//   if (24 - ocupadas < reserva.personas) return false   ← borrada\n\nit('la action de reservar da 400 con campos malos', async () => {\n  await guardarReserva({ id: 'llena', noche: '2031-06-08', personas: 24, … })\n  const invalida = await reservar(\n    argumentos<Parameters<typeof reservar>[0]>('/reservar', {\n      init: envio({ nombre: '', documento: '', noche: 'mal', personas: '0' }),\n    }),\n  )\n  expect(estado(invalida)).toBe(400)\n})\n\n// ¿Qué pasa con este test?",
  "opciones": [
    "Se pone en rojo: la noche está llena y la action ya no lo sabe",
    "Sigue en verde: el envío no pasa la validación, así que nunca llega a mirar las camas",
    "Se pone en rojo por un error de tipos",
    "Sigue en verde, pero solo porque la reserva de 24 personas se guarda en otro archivo"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en el taller: el test débil siguió en verde y el de la solución dio expected 201 to be 409. La validación de Zod corta antes: con campos malos, la action devuelve el 400 sin llamar a reservarSiHayCamas. Llenar la noche y no pedir después una cama válida esa noche es preparar un escenario que nunca se usa. El albergue vendería la cama 25 y la suite, en verde."
}
```

### Tercer mutante: un `catch` que se lo traga todo

La versión débil del test del middleware atrapa lo que lance y solo comprueba que `next` no se ha llamado:

```tsx
const next = vi.fn()
try {
  await exigirHospitalero(argumentos<Parameters<typeof exigirHospitalero>[0]>('/hospitaleros'), next)
} catch {}
expect(next).not.toHaveBeenCalled()
```

Ahora mete en el middleware un fallo de los que pasan de verdad: tratar el id de la sesión como si siempre fuera un texto.

```tsx
const hospitalero = buscarHospitalero(sesion.get('hospitaleroId').trim())
```

Sin sesión, `sesion.get('hospitaleroId')` es `undefined`, y `.trim()` lanza un `TypeError`. En producción, cualquiera sin sesión que abra `/hospitaleros` recibe un 500 en vez de la página de entrar. Los dos tests:

```text
 ✓ pruebas/21-debiles.test.tsx > versiones débiles > débil: el middleware no llama a next sin sesión 1ms
 × pruebas/21-mis-pruebas.test.tsx > lección 21: probar rutas > el middleware no llama a next cuando falta la sesión 2ms

AssertionError: expected undefined to be an instance of Response
```

El `catch {}` vacío se tragó el `TypeError`, y como el middleware reventó antes de llamar a `next`, «no llama a `next`» seguía siendo verdad. **Un `catch` en un test tiene que comprobar qué ha atrapado**: el de la solución guarda lo lanzado solo si es una `Response`, y después exige que exista, que sea un 302 y que vaya a `/entrar?volver=%2Fhospitaleros`. La revisión del taller encontró justo este `catch {}` vacío en la primera versión de este test.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Cómo escribir un test que mate mutantes",
  "items": [
    {
      "titulo": "Comprueba el resultado, no solo que no explote",
      "texto": "Un test que solo llama a la función y no mira lo que devuelve pasa con casi cualquier mutante. Comprueba el estado, la cabecera o el dato concreto que importa."
    },
    {
      "titulo": "Desconfía de every, some y de las listas vacías",
      "texto": "every sobre una lista vacía da true. Si la lista puede llegar vacía por un fallo, exige también una longitud, o mejor, los elementos que esperas."
    },
    {
      "titulo": "Que el escenario llegue a la línea que quieres probar",
      "texto": "Si preparas una noche llena y envías datos inválidos, la validación corta antes y la noche llena no se usa. Cada test, un camino del código."
    },
    {
      "titulo": "Mira qué atrapa cada catch",
      "texto": "Un catch vacío convierte cualquier error en un test verde. Guarda lo lanzado, comprueba su tipo y después su contenido."
    },
    {
      "titulo": "Rompe el código tú, de vez en cuando",
      "texto": "Antes de dar un test por bueno, cambia una línea del código que prueba (una condición al revés, un return vacío) y mira si se pone en rojo. Si no, al test le falta algo. Hay herramientas que lo automatizan, como Stryker, pero hacerlo a mano con lo importante ya enseña mucho."
    }
  ]
}
```

## Lo que queda para la ficha de Testing

Con funciones y con `createRoutesStub` pruebas casi todo lo que escribes. Lo que no ves así es lo que solo existe con la app en marcha:

- que `routes.ts` lleva cada dirección a su módulo y que `root.tsx` pinta el documento (aquí, los tests de la 14 se acercan con `matchRoutes` y `renderToString`, pero no hidratan);
- la hidratación: que lo que pinta el servidor y lo que pinta el navegador coinciden (lección 87 de React);
- las cookies de verdad en un navegador: `HttpOnly`, `Secure`, `SameSite`;
- las peticiones `.data` y `/__manifest` al navegar (lección 16), la CSP con su *nonce* (lección 20) y lo que hace el navegador con una redirección.

Para eso se arranca la app (`npm run build` y `npm start`) y un navegador automático, Playwright, la usa como una persona: abre `/hospitaleros`, acaba en `/entrar`, escribe la contraseña, vuelve. Son los tests **de extremo a extremo**. Son más lentos y más frágiles, así que se escriben pocos, para los recorridos que no pueden fallar. La ficha de Testing los trata a fondo; el taller no los trae.

## Errores típicos

**Leer `.status` de lo que devuelve `data()`.** Llamada como función, una `action` que devuelve `data(…, { status })` da un `DataWithResponseInit`, no una `Response`. El estado está en `.init.status` y los datos en `.data`. `redirect()` sí devuelve una `Response`.

**Comprobar con `getBy` justo después de enviar.** El envío del fetcher tarda unos milisegundos aunque la `action` sea de mentira, y `getBy` mira una sola vez. Usa `findBy`, que espera.

**Probar la `action` de mentira en vez del componente.** Si el test monta el stub y comprueba lo que devuelve tu `action` falsa, solo has probado tu `action` falsa. Lo que se comprueba es lo que pinta el componente con esa respuesta.

**Una `action` de mentira con otra forma.** Los tipos del stub son `any`: si tu `action` falsa devuelve `{ error: '…' }` y la real `{ errores: { … } }`, el test pasa y la app no. Tipa la falsa con el tipo de la real.

**Olvidar el contexto.** Un `loader` que lee `context.get(hospitaleroContext)` lanza si nadie lo ha puesto. No es un fallo del `loader`: el test tiene que hacer lo que haría el middleware.

**Tests que dependen unos de otros.** Si un test guarda una reserva en el archivo de verdad y otro cuenta las camas, el resultado depende del orden. En el taller, `pruebas/preparacion.ts` da a cada test su propio archivo de reservas, de avisos y de subidas en la carpeta temporal.

**Dar por bueno un test en verde.** Un test que nunca has visto en rojo puede no estar probando nada. Rompe el código una vez y míralo fallar.

## En el taller: tus cuatro tests

Abre `pruebas/21-mis-pruebas.test.tsx`. Cada test tiene un comentario con lo que debe probar; borra su `expect.fail` y escríbelo. Los `import` que vas a necesitar ya los conoces: `createRoutesStub`, `data` y `RouterContextProvider` de `react-router`; `render` y `screen` de `@testing-library/react`, `userEvent` de `@testing-library/user-event`, `vi` de `vitest`, y de `./peticion`, `argumentos` y `envio`. Ejecuta `npm run leccion -- 21` después de cada uno.

### Paso 1: el formulario con `createRoutesStub`

1. Importa `ReservaFormulario` de `~/routes/reservar`.
2. Crea el stub con una ruta `/reservar` cuyo `Component` sea el formulario y cuya `action` devuelva, con `data()` y un 409, un error en `errores.noche`.
3. Móntalo con `initialEntries`, rellena «Nombre», «Tres últimas cifras del documento» y «Noche» con `userEvent` (para la del documento, `getByLabelText(/Tres últimas/)` es más corto) y pulsa «Reservar».
4. Espera el mensaje con `findByText`.

El test necesita `async`, porque espera. Se pone en verde el primero de los cuatro.

### Paso 2: el `loader` de hoy, con su contexto

1. Crea un `RouterContextProvider` y pon con `context.set` un hospitalero (`{ id, usuario, nombre }`, el tipo `Hospitalero` de `~/tipos`) en `hospitaleroContext` y una sesión vacía en `sesionContext`. La sesión sale de `crearAlmacenDeSesiones(['prueba']).getSession()`, de `~/sesiones.server`.
2. Llama al `loader` de `~/routes/hospitaleros/hoy` con `argumentos<Parameters<typeof cargarHoy>[0]>('/hospitaleros', { context })`.
3. Comprueba que devuelve tu hospitalero, que hay alguna reserva y que todas son de su noche. Las dos últimas comprobaciones juntas: ya sabes por qué.

### Paso 3: la `action` de reservar, con 400 y 409

1. Llama a la `action` con `envio({ … })` y campos inválidos, y comprueba el 400 en `.init.status`.
2. Guarda con `guardarReserva` (de `~/datos/reservas.server`) una reserva de 24 personas en una noche futura dentro de temporada, por ejemplo `2031-06-08`, con todos los campos del tipo `Reserva`.
3. Pide una cama válida esa misma noche (nombre de dos letras o más, tres cifras, una persona) y comprueba el 409.

Si el 409 te sale 201, mira la noche: tiene que ser la misma. Si te sale 400, el envío no pasa la validación: revisa los campos con el JSON de más arriba.

### Paso 4: el middleware sin sesión

1. Crea `next` con `vi.fn()`.
2. Llama a `exigirHospitalero` (de `~/middleware/hospitalero.server`) con `argumentos(…)` de `/hospitaleros`, sin cookie, dentro de un `try`.
3. En el `catch`, guarda lo lanzado **solo si es una `Response`**.
4. Comprueba que `next` no se ha llamado, que lo lanzado existe, que es un 302 y que su `Location` es `/entrar?volver=%2Fhospitaleros`.

Con los cuatro:

```text
$ npm run leccion -- 21

 Test Files  1 passed (1)
      Tests  4 passed (4)
```

`npm run typecheck` también tiene que salir limpio: los tests se comprueban como el resto del proyecto. Si te atascas, la [rama `solucion`](https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller) tiene el archivo escrito. Y antes de seguir, haz lo de la sección anterior con uno de tus tests: rompe la línea que prueba y míralo ponerse en rojo.

## Retos para seguir practicando

Sin comprobación automática, salvo la que escribas tú.

1. **El middleware con sesión.** Escribe el caso contrario del paso 4: una cookie válida (fírmala con `crearAlmacenDeSesiones` y `commitSession`), un `next` que devuelve `new Response('ok')`, y comprueba que el middleware lo llama una vez, deja al hospitalero en el contexto y añade `Cache-Control: private, no-store` a la respuesta.
2. **El formulario, confirmado.** Añade un test con `createRoutesStub` en el que la `action` falsa devuelve un 201 con `confirmado`, y comprueba que el formulario desaparece y sale el mensaje con la referencia, con `findByRole('status')`.
3. **Tu propio mutante.** Elige un test de otra lección (el CSV de la 19, por ejemplo), cambia una línea del código que prueba y mira si se pone en rojo. Si no, mejóralo.
4. **Mutantes automáticos.** Instala Stryker con su complemento para Vitest en una copia del taller, lánzalo solo sobre `app/seguridad.ts` y lee el informe: ¿qué mutantes sobreviven a los tests de la lección 20?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-router-proyectos/taller (rama main)",
      "descripcion": "El taller con los cuatro tests vacíos de esta lección y los TODO de la 22.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/main/taller",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-router-proyectos/taller (rama solucion)",
      "descripcion": "El taller terminado, con pruebas/21-mis-pruebas.test.tsx escrito.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Testing",
      "descripcion": "createRoutesStub, para qué está pensado y por qué no casa con los tipos Route.* de los componentes de ruta.",
      "url": "https://reactrouter.com/start/framework/testing",
      "etiqueta": "React Router"
    },
    {
      "titulo": "createRoutesStub",
      "descripcion": "La referencia de la función: las rutas, initialEntries, hydrationData y el contexto opcional.",
      "url": "https://reactrouter.com/api/utils/createRoutesStub",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Middleware",
      "descripcion": "next(), el contexto con RouterContextProvider y getLoadContext, lo que necesitas para llamar a un middleware a mano.",
      "url": "https://reactrouter.com/how-to/middleware",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Mocking",
      "descripcion": "vi.fn() y el resto de funciones de Vitest para sustituir y espiar funciones.",
      "url": "https://vitest.dev/guide/mocking",
      "etiqueta": "Vitest"
    },
    {
      "titulo": "Stryker Mutator",
      "descripcion": "Una herramienta de mutation testing para JavaScript y TypeScript, con complemento para Vitest.",
      "url": "https://stryker-mutator.io/",
      "etiqueta": "Stryker"
    }
  ]
}
```
