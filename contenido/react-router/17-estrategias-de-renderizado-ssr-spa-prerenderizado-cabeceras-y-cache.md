# Estrategias de renderizado: SSR, SPA, prerenderizado, cabeceras y caché

- **Módulo:** Modo framework
- **Slug:** `estrategias-de-renderizado-ssr-spa-prerenderizado-cabeceras-y-cache` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [Rendering Strategies](https://reactrouter.com/start/framework/rendering) + [Single Page App](https://reactrouter.com/how-to/spa) + [Pre-Rendering](https://reactrouter.com/how-to/pre-rendering) + [HTTP Headers](https://reactrouter.com/how-to/headers) + [Streaming with Suspense: Timeouts](https://reactrouter.com/how-to/suspense) + [Progressive Enhancement](https://reactrouter.com/explanation/progressive-enhancement) — ver `contenido/react-router/TEMARIO.md` #17
- **Requiere:** Las lecciones 14, 15 y 16 de esta ficha (el taller hasta la 16) y la 9 (streaming). De React, la 85 (desplegar una SPA), la 87 (SSR e hidratación) y la 98 (la revista en modo framework)
- **Repositorio:** [github.com/pedroleni/react-router-proyectos](https://github.com/pedroleni/react-router-proyectos) (carpeta `taller`)

---

## Qué es y para qué sirve

El **Albergue de peregrinos El Cea**, en Sahagún, tiene páginas muy distintas en la misma app, la del taller del módulo 4:

- **«El albergue» y las cinco etapas** cambian una vez por temporada, cuando alguien edita los textos y vuelve a desplegar.
- **La portada** es igual para todo el mundo, pero puede cambiar en cualquier momento: enseña el aviso del Ayuntamiento (un corte de agua, una fiesta), que llega por un *webhook* (lección 19).
- **«Camas libres»** cambia con cada reserva, pero es la misma para todos los peregrinos que miran la misma noche.
- **La zona de hospitaleros** es distinta para cada persona y lleva datos personales: nombres, documentos, llegadas.

Hasta ahora, todas se generaban igual: en el servidor, en cada petición. Es lo que la lección 87 de React llamó renderizar en el servidor, y lo que hizo la revista de la 98. Esta lección va de **decidir, página a página, tres cosas**:

1. **Cuándo se genera el HTML**: en cada petición, una vez al construir, o solo en el navegador.
2. **Quién puede guardar la respuesta**: nadie, solo el navegador de quien la pidió, o también las cachés compartidas que hay por el camino.
3. **Cuánto espera el servidor a lo que llega tarde** por *streaming* (lección 9).

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro maneras de servir una página en el albergue",
  "roles": [
    {
      "etiqueta": "prerender",
      "rol": "El HTML se escribe al construir",
      "descripcion": "«El albergue» y cada etapa. Un archivo en build/client que se sirve tal cual, sin ejecutar ningún loader."
    },
    {
      "etiqueta": "SSR en cada petición",
      "rol": "El HTML se genera al pedirlo",
      "descripcion": "La portada, por el aviso del Ayuntamiento, y todo lo que dependa de quién lo pide o de cuándo."
    },
    {
      "etiqueta": "Cache-Control: public",
      "rol": "Se puede guardar y repetir",
      "descripcion": "«Camas libres»: un minuto en el navegador y cinco en una caché compartida, porque es igual para todos."
    },
    {
      "etiqueta": "private, no-store",
      "rol": "Que no se guarde en ninguna parte",
      "descripcion": "La zona de hospitaleros: cada respuesta es de una persona y lleva datos personales."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Dónde se practica",
  "contenido": "En el taller: github.com/pedroleni/react-router-proyectos, carpeta taller, instalado con npm ci. Empiezas con la lección 16 terminada y acabas con npm run leccion -- 17 en verde. En ese punto, npm test da 27 tests en verde y 71 en rojo, y npm run typecheck no marca ningún error. Todo lo que pasa en el servidor se enseña con la salida real de curl y de la terminal, sacada del propio taller."
}
```

Al empezar, los tres tests de la lección están en rojo:

```text
$ npm run leccion -- 17

 ❯ pruebas/17-renderizado.test.ts (3 tests | 3 failed) 9ms
   ❯ lección 17: estrategias de renderizado (3)
     × prerenderiza el albergue y cada etapa, pero no la portada ni la zona privada 5ms
     × da a las camas una caché pública y corta 2ms
     × limita el flujo del servidor a cinco segundos 1ms
```

Cada uno corresponde a un `TODO (lección 17)`: uno en `react-router.config.ts`, otro en `app/routes/camas.tsx` y otro en `app/entry.server.tsx`. Los pasos están al final; antes, lo que hay detrás de cada uno.

## `ssr: true`, `ssr: false` y el SPA Mode

La primera decisión es de toda la app, y está en `react-router.config.ts`:

- **`ssr: true`** (el valor por defecto, y el del taller desde la 14): hay un servidor en marcha. La primera visita a cada página llega con el HTML ya generado; después, el navegador navega solo y pide al servidor los datos (las peticiones `.data` de la lección 16).
- **`ssr: false`**: no hay servidor en producción. Es el **SPA Mode**: al construir, React Router genera **un solo `index.html`** con la ruta `root` y nada más, y ese archivo sirve para cualquier dirección de la app. El navegador decide qué rutas pintar al hidratar.

La documentación insiste en un detalle: `ssr: false` no quiere decir que no se ejecute nada en Node. **La ruta `root` se renderiza al construir** para escribir ese `index.html`, así que tu código tiene que poder ejecutarse en el servidor aunque no lo haya en producción (sin `window` al pintar). Lo que se ve mientras carga la app es el `HydrateFallback` de `root`, y `root` es la única ruta que puede tener `loader`, que se ejecuta al construir:

```tsx
// root.tsx, en una app en SPA Mode
export function HydrateFallback() {
  return <p>Cargando el albergue…</p>
}
```

Las demás rutas cargan sus datos en el navegador, con `clientLoader` y `clientAction` (lección 16), y el alojamiento tiene que devolver ese `index.html` para cualquier dirección: la reescritura de la lección 85 de React.

**El taller no puede ser una SPA.** Lo probé en una copia: `ssr: false`, sin `prerender`, y `npm run build`. El build se para con errores como estos (salen varios, uno por módulo de ruta, y en cada ejecución en otro orden):

```text
Error: SPA Mode: 2 invalid route export(s) in `routes/hospitaleros/zona.tsx`: `middleware`, `loader`. See https://reactrouter.com/how-to/spa for more information.
Error: SPA Mode: 1 invalid route export(s) in `routes/hospitaleros/pernoctas-csv.ts`: `loader`. See https://reactrouter.com/how-to/spa for more information.
Error: SPA Mode: Invalid `HydrateFallback` export found in `routes/mi-camino.tsx`. `HydrateFallback` is only permitted on the root route in SPA Mode. See https://reactrouter.com/how-to/spa for more information.
```

Es decir: «en SPA Mode, `zona.tsx` exporta dos cosas que no puede tener: `middleware` y `loader`»; y «`HydrateFallback` solo se permite en la ruta raíz». Es lógico: la sesión de los hospitaleros (18), el CSV y el *webhook* (19) necesitan un servidor que los atienda. El SPA Mode es para apps que hablan con una API de otro, y para empezar a usar el modo framework en una SPA que ya existe (el reto opcional del proyecto 25).

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// react-router.config.ts\nexport default { ssr: false } satisfies Config\n\n// app/routes/mi-camino.tsx (lección 16): solo clientLoader,\n// y un HydrateFallback mientras el navegador lee localStorage\nexport async function clientLoader() { /* … */ }\nexport function HydrateFallback() {\n  return <p>Cargando tu camino…</p>\n}\n\n// $ npm run build",
  "opciones": [
    "Construye sin problemas: mi-camino no tiene loader de servidor",
    "Falla: en SPA Mode, HydrateFallback solo se permite en root",
    "Construye, pero el HydrateFallback de mi-camino no se ve nunca",
    "Falla: en SPA Mode no se permite clientLoader"
  ],
  "correcta": 1,
  "explicacion": "En SPA Mode solo se genera el HTML de root, así que solo root puede dar algo que enseñar mientras se hidrata. El build lo dice: Invalid HydrateFallback export found in routes/mi-camino.tsx. HydrateFallback is only permitted on the root route in SPA Mode. clientLoader sí está permitido en cualquier ruta: es justo como se cargan los datos en una SPA."
}
```

## `prerender`: el HTML, una vez, al construir

Prerenderizar es generar al construir el HTML de unas direcciones concretas. Para cada una, `react-router build` hace una petición falsa a tu propia app (*«the build creates a `new Request()` and runs it through your app just like a server would»*, dice la documentación), ejecuta los `loader` como lo haría el servidor y guarda el resultado en `build/client`. Con `ssr: true`, lo que no está en la lista se sigue generando en cada petición, así que **las dos estrategias se mezclan por ruta**.

`prerender` acepta cuatro formas:

- **`true`**: todas las rutas sin parámetros de `routes.ts`. Una ruta con `:etapa` no entra, porque no sabe qué valores darle.
- **Un array** de direcciones, con los parámetros ya puestos.
- **Una función**, que puede ser `async` y recibe `getStaticPaths()`, la lista que daría `true`. Es para cuando las direcciones salen de algo que hay que esperar: un CMS, una base de datos.
- **`{ paths, concurrency }`**, cualquiera de las anteriores en `paths` y cuántas páginas generar a la vez (por defecto, una).

En el taller, las etapas ya están en memoria, en `app/datos/etapas.ts`, y un array basta:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import type { Config } from '@react-router/dev/config'\nimport { ETAPAS } from './app/datos/etapas'\n\nconst configuracion: Config = {\n  // La app usa renderizado de servidor para las páginas que cambian.\n  ssr: true,\n  // app/ es el valor por defecto; se deja escrito para enseñarlo en la lección 14.\n  appDirectory: 'app',\n  // Lección 17. Se generan al construir solo las páginas que son iguales para\n  // todo el mundo y no cambian hasta el próximo despliegue. La portada no:\n  // enseña el aviso del Ayuntamiento, que puede cambiar entre despliegues.\n  prerender: ['/albergue', ...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`)],\n  // TODO (lección 20): autoriza el host público para las actions.\n}\n\nexport default configuracion",
  "anotaciones": [
    {
      "fragmento": "import { ETAPAS } from './app/datos/etapas'",
      "nota": "La configuración es un módulo de TypeScript normal: puede importar los datos de la app. Se ejecuta al construir, en Node, así que no puede importar nada que dependa del navegador."
    },
    {
      "fragmento": "ssr: true,",
      "nota": "Con servidor. Las direcciones de prerender se sirven como archivos, y todas las demás, como hasta ahora: generadas en cada petición."
    },
    {
      "fragmento": "prerender: ['/albergue', ...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`)],",
      "nota": "Una dirección por etapa, con el parámetro ya puesto. Si añades una etapa a ETAPAS, el siguiente build genera su página; hasta entonces, se genera en cada petición como cualquier otra."
    },
    {
      "fragmento": "La portada no:",
      "nota": "La portada está fuera a propósito: la sección siguiente cuenta por qué."
    }
  ]
}
```

Si las etapas vinieran de una API, la función sería así (no es código del taller: es el patrón de la documentación con nuestras rutas):

```tsx
export default {
  async prerender({ getStaticPaths }) {
    const etapas = await fetch('https://cms.albergue-el-cea.example/etapas').then((r) => r.json())
    return [...getStaticPaths(), ...etapas.map((etapa) => `/etapas/${etapa.slug}`)]
  },
} satisfies Config
```

Con `getStaticPaths()` entrarían también `/`, `/camas`, `/reservar`… Justo lo que el taller **no** quiere, y por eso usa un array.

`npm run build` termina enumerando lo que ha generado:

```text
Prerender (html): /albergue -> build/client/albergue/index.html
Prerender (data): /etapas/terradillos-de-los-templarios-sahagun -> build/client/etapas/terradillos-de-los-templarios-sahagun.data
Prerender (html): /etapas/terradillos-de-los-templarios-sahagun -> build/client/etapas/terradillos-de-los-templarios-sahagun/index.html
Prerender (data): /etapas/carrion-de-los-condes-terradillos -> build/client/etapas/carrion-de-los-condes-terradillos.data
Prerender (html): /etapas/carrion-de-los-condes-terradillos -> build/client/etapas/carrion-de-los-condes-terradillos/index.html
…
```

**Dos archivos por cada etapa**: el `index.html`, para quien entra directamente en esa dirección, y el `.data`, para quien llega navegando desde otra página del albergue: el navegador pide `/etapas/….data` y recibe ese archivo, sin que se ejecute el `loader`. `/albergue` no tiene `.data` porque su módulo de ruta no tiene `loader`.

### Por qué la portada no

La portada tiene un `loader` que lee el aviso vigente del Ayuntamiento:

```tsx
export async function loader() {
  return { aviso: await leerAviso() }
}
```

El aviso llega cuando el Ayuntamiento lo manda, por el *webhook* de la lección 19, y se guarda en `datos/avisos.json`. Nada que ver con cuándo despliegas.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// Una copia del taller con la portada en la lista:\nprerender: ['/', '/albergue', ...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`)],\n\n// $ npm run build && npm start\n// Una hora después, el Ayuntamiento manda un aviso:\n//   «Corte de agua en la calle del Arco de 16:00 a 18:00.»\n// y queda guardado en datos/avisos.json.\n//\n// Una peregrina abre la portada. ¿Ve el aviso?",
  "opciones": [
    "Sí: la portada se vuelve a generar cuando cambia avisos.json",
    "Sí, pero solo al recargar la página",
    "No: la portada es el HTML de cuando se construyó, sin aviso",
    "No: el servidor da un error porque el archivo ha cambiado"
  ],
  "correcta": 2,
  "explicacion": "Su loader se ejecutó una vez, al construir, cuando no había aviso. Lo comprobé con dos servidores con el mismo aviso: el del taller (portada en cada petición) lo enseña, y la copia prerenderizada no. Tampoco al navegar hasta la portada: el _.data también es del build. El aviso no saldría hasta el siguiente despliegue."
}
```

Esta es la comprobación, con el mismo `datos/avisos.json` en los dos servidores. Con la portada generada en cada petición (el taller):

```text
$ curl -s http://localhost:3000/ | grep -o 'Aviso del Ayuntamiento:</strong>.\{0,80\}'
Aviso del Ayuntamiento:</strong> <!-- -->Corte de agua en la calle del Arco de 16:00 a 18:00.</aside><section cl
$ curl -s http://localhost:3000/_.data
[{"_1":2},"routes/portada",{"_3":4},"data",{"_5":6},"aviso",{"_7":8,"_9":10,"_11":12},"tipo","corte-agua","texto","Corte de agua en la calle del Arco de 16:00 a 18:00.","hasta","2099-01-01"]
```

Con la portada prerenderizada (la copia):

```text
$ curl -s http://localhost:3000/ | grep -c 'Corte de agua'
0
$ curl -s http://localhost:3000/_.data
[{"_1":2},"routes/portada",{"_3":4},"data",{"_5":-5},"aviso"]
```

El `-5` es como escribe `null` el formato de los `.data` de React Router: al construir no había aviso, y `leerAviso()` devolvió `null`. **La regla: prerenderiza lo que solo cambia cuando despliegas.** Lo que cambia por algo de fuera (un *webhook*, una base de datos, la hora) o según quién lo pida, se genera en cada petición.

### Cómo se sirve una página prerenderizada

`npm start` es `react-router-serve`, el servidor de Express que trae React Router. Antes de pasar la petición a tu app, mira si hay un archivo en `build/client` que encaje, y si lo hay, lo sirve él. Fíjate en la primera respuesta:

```text
$ curl -sI http://localhost:3000/albergue
HTTP/1.1 301 Moved Permanently
Content-Type: text/html; charset=UTF-8
Content-Length: 158
Content-Security-Policy: default-src 'none'
X-Content-Type-Options: nosniff
Location: /albergue/

$ curl -sI http://localhost:3000/albergue/
HTTP/1.1 200 OK
Accept-Ranges: bytes
Cache-Control: public, max-age=0
Last-Modified: Tue, 27 Oct 2026 19:56:38 GMT
ETag: W/"1bee-1a17eefac77"
Content-Type: text/html; charset=utf-8
Content-Length: 7150
```

- **El 301.** El prerenderizado escribe `albergue/index.html`, una carpeta, y el servidor de archivos de Express redirige `/albergue` a `/albergue/`, con la barra. En el navegador no se nota (la página acaba en `/albergue/` y se hidrata bien), pero es un salto más, y con otro servidor de archivos o un CDN puede ser distinto. La cooperativa (24) lo comprobó igual.
- **Las cabeceras no son tuyas.** `Cache-Control: public, max-age=0`, `ETag` y `Last-Modified` las pone el servidor de archivos. Ni el `headers` de tus módulos de ruta ni `entry.server.tsx` intervienen: la petición no llega a React Router.
- **El `.data` de una etapa** también es un archivo, y sale como `Content-Type: application/octet-stream`; al router le da igual, porque lo lee él.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Para la lección 20: la CSP y las páginas prerenderizadas",
  "contenido": "En la 20 añadirás una cabecera Content-Security-Policy con un nonce nuevo en cada petición, desde handleRequest. Las páginas prerenderizadas no pasan por ahí: en la solución del taller, la portada llega con su CSP y un nonce distinto en cada petición, y /albergue/ llega sin cabecera CSP y con el nonce del build, el mismo en las 16 veces que aparece en su HTML. La 20 cuenta qué hacer con eso."
}
```

## Cabeceras: `headers` y `Cache-Control`

Entre el servidor del albergue y el navegador del peregrino puede haber **cachés compartidas**: la de un CDN, la de un proxy delante del servidor. Guardan una respuesta y se la dan al siguiente que pida lo mismo, sin molestar al servidor. Y está la caché del propio navegador. Quién puede guardar qué, y durante cuánto tiempo, lo decide la cabecera `Cache-Control` de cada respuesta:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "public",
      "texto": "Cualquier caché puede guardarla, también las compartidas. Solo para lo que es igual para todo el mundo."
    },
    {
      "titulo": "private",
      "texto": "Solo la caché del navegador que la pidió. Ninguna compartida puede guardarla."
    },
    {
      "titulo": "max-age=60",
      "texto": "Durante 60 segundos, la copia guardada vale sin preguntar al servidor. Es para el navegador, y para las compartidas si no hay s-maxage."
    },
    {
      "titulo": "s-maxage=300",
      "texto": "Lo mismo, solo para las cachés compartidas: allí manda s-maxage, no max-age."
    },
    {
      "titulo": "stale-while-revalidate=600",
      "texto": "Pasado el max-age, y durante 600 segundos más, la caché puede servir la copia vieja mientras pide una nueva por detrás. Nadie espera, y la siguiente respuesta ya está al día."
    },
    {
      "titulo": "no-store",
      "texto": "No guardes esta respuesta en ninguna parte: ni en una caché compartida ni en el disco del navegador."
    }
  ]
}
```

En un módulo de ruta, las cabeceras de la respuesta se ponen con la función **`headers`**. «Camas libres» es igual para todos los que miran la misma noche, y un dato de hace un minuto vale para decidir si vas a reservar (al reservar, la `action` vuelve a comprobar si quedan camas). Una caché corta le quita trabajo al servidor en el mes de agosto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function headers() {\n  // L17: max-age controla el navegador, s-maxage el proxy compartido y\n  // stale-while-revalidate permite servir el dato anterior mientras se renueva.\n  return { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' }\n}",
  "anotaciones": [
    {
      "fragmento": "export function headers() {",
      "nota": "Una exportación más del módulo de ruta, como loader o meta. Recibe los headers de su loader y de su action, y los de la ruta madre (parentHeaders); aquí no los necesita."
    },
    {
      "fragmento": "'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'",
      "nota": "Un minuto en el navegador, cinco en una caché compartida y, después, diez más sirviendo la copia vieja mientras se renueva. La noche va en la búsqueda (?noche=), así que cada noche se guarda aparte."
    }
  ]
}
```

Y vale para las dos maneras de pedir la página: el documento, al entrar desde fuera, y el `.data`, al llegar navegando:

```text
$ curl -s -D - -o /dev/null 'http://localhost:3000/camas?noche=2026-07-15'
HTTP/1.1 200 OK
cache-control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
content-type: text/html; charset=utf-8

$ curl -s -D - -o /dev/null 'http://localhost:3000/camas.data?noche=2026-07-15'
HTTP/1.1 200 OK
cache-control: public, max-age=60, s-maxage=300, stale-while-revalidate=600
content-type: text/x-script; charset=utf-8
```

La portada, sin función `headers`, no lleva `Cache-Control`: ninguna caché compartida la guarda.

### Rutas anidadas: gana la más profunda

Una página son varias rutas a la vez (`root`, el `layout` público, `camas`). El servidor recorre las rutas de la madre a la hija:

- una ruta **sin** `headers` hereda las de su madre tal cual;
- una ruta **con** `headers` las sustituye por lo que devuelva, salvo que las mezcle a mano con `parentHeaders` (`parentHeaders.set(…)`, `parentHeaders.append(…)` y devolverlas).

Hay una excepción: los `Set-Cookie` de los `loader` y las `action` de cualquier ruta se conservan siempre, aunque nadie los devuelva. La documentación aconseja poner `headers` solo en las rutas hoja, para no tener que mezclar.

### La zona de hospitaleros: `private, no-store`

**Una página con datos de una persona no se guarda en ninguna caché compartida. Nunca.** Una caché compartida no sabe quién eres: guarda la respuesta a `GET /hospitaleros` y se la da al siguiente que pida `GET /hospitaleros`. Si esa respuesta llevaba las reservas de esta noche, con nombres y documentos, el siguiente las ve, tenga sesión o no.

Y `private` no basta: con `private`, el navegador sí la guarda en su disco. El ordenador de la recepción del albergue lo usan varios hospitaleros por turnos, y con el botón Atrás o el historial se podría ver la página del turno anterior. `no-store` pide que no se guarde en ningún sitio.

¿Dónde se pone? Lo natural sería una función `headers` en `routes/hospitaleros/zona.tsx`, la madre de toda la zona: sus hijas no tienen `headers` y la heredarían. Lo probé en una copia del taller ya terminada la lección 19, con sesión:

```text
/hospitaleros                    HTTP/1.1 200 OK  cache-control: private, no-store
/hospitaleros.data               HTTP/1.1 200 OK  cache-control: private, no-store
/hospitaleros/reservas/r-1       HTTP/1.1 200 OK  cache-control: private, no-store
/hospitaleros/reservas/r-1.data  HTTP/1.1 200 OK  cache-control: private, no-store
/hospitaleros/pernoctas.csv      HTTP/1.1 200 OK
```

**La última se escapa**: es una ruta de recursos (19), que devuelve su propia `Response`, y a esas no se les aplican las funciones `headers`. Justo la que lleva la lista de todos los peregrinos de la noche. Por eso el taller no lo hace así: el **middleware de la zona** (lección 18), que envuelve todas las peticiones de la zona, sean de páginas, de datos o de recursos, pone la cabecera a la respuesta al volver de `next()`. Con él, las cinco salen con `private, no-store`. Lo escribirás en la lección 18; en esta te basta con saber por qué.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// routes/hospitaleros/zona.tsx (la madre de toda la zona)\nexport function headers() {\n  return { 'Cache-Control': 'private, no-store' }\n}\n\n// routes.ts\nroute('hospitaleros', 'routes/hospitaleros/zona.tsx', [\n  index('routes/hospitaleros/hoy.tsx'),\n  route('reservas/:id', 'routes/hospitaleros/reserva.tsx'),\n  route('pernoctas.csv', 'routes/hospitaleros/pernoctas-csv.ts'), // sin componente\n]),\n\n// Con sesión:\n// $ curl -s -D - -o /dev/null http://localhost:3000/hospitaleros/pernoctas.csv\n// ¿Qué Cache-Control lleva?",
  "opciones": [
    "private, no-store: lo hereda de zona.tsx, como las otras hijas",
    "Ninguno: una ruta de recursos devuelve su propia Response y no pasa por headers",
    "public, max-age=0, como los archivos estáticos",
    "Da un error: una ruta de recursos no puede colgar de una ruta con headers"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en una copia del taller: las páginas y los .data de la zona salieron con private, no-store, y el CSV, sin Cache-Control. Las funciones headers solo se aplican a los documentos y a las peticiones .data de las rutas de interfaz. Para cubrir también los recursos, el taller pone la cabecera en el middleware de la zona (lección 18)."
}
```

## `streamTimeout`: cuánto espera lo que llega tarde

En la lección 9, un `loader` devolvía una promesa sin `await` dentro de un objeto, y la página la pintaba con `<Await>` o `use()` cuando llegaba. En el servidor, eso es *streaming*: el HTML sale al momento con el `fallback` del `<Suspense>`, y lo que falta llega después **por la misma respuesta**, que se queda abierta.

¿Y si la promesa no se resuelve nunca? Una API del tiempo que no contesta, una consulta bloqueada. La respuesta no puede quedarse abierta para siempre. **`streamTimeout`**, exportado desde `app/entry.server.tsx`, es cuántos milisegundos espera React Router antes de **rechazar** las promesas que siguen pendientes. Si no lo exportas, son 4.950 ms. El `entry.server.tsx` que saca `react-router reveal` (lección 14) lo exporta con 5.000, y el del taller venía con 10.000.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const streamTimeout = 5_000\n// L17: el router rechaza a los cinco segundos las promesas pendientes de\n// loaders y actions; el aborto de React espera 1.000 ms para vaciar esos rechazos.\n\nexport function cabecerasDeSeguridad(\n  _nonce: string,\n  _entorno = process.env.NODE_ENV\n): Record<string, string> {\n  // TODO (lección 20): crea las cabeceras habituales y la CSP de producción.\n  throw new Error('TODO (lección 20): cabeceras de seguridad y CSP.')\n}\n\nexport const handleError: HandleErrorFunction = (error, { request }) => {\n  // Mientras llega la lección 22 se conserva exactamente el comportamiento\n  // predeterminado de React Router para no ocultar errores de lecciones previas.\n  if (process.env.NODE_ENV !== 'test' && !request.signal.aborted) {\n    const errorInterno = isRouteErrorResponse(error) && 'error' in error ? error.error : undefined\n    console.error(errorInterno || error)\n  }\n  // TODO (lección 22): sustituye este registro por informarError.\n}\n\n// TODO (lección 22): instrumenta loaders y actions. Busca ServerInstrumentation.\nexport const instrumentations: ServerInstrumentation[] = []\n\nexport default function handleRequest(\n  request: Request,\n  responseStatusCode: number,\n  responseHeaders: Headers,\n  routerContext: EntryContext,\n  _loadContext: RouterContextProvider\n) {\n  if (request.method.toUpperCase() === 'HEAD')\n    return new Response(null, { status: responseStatusCode, headers: responseHeaders })\n\n  return new Promise<Response>((resolve, reject) => {\n    let documentoPreparado = false\n    const agente = request.headers.get('user-agent')\n    const alEstarListo: keyof RenderToPipeableStreamOptions =\n      (agente && isbot(agente)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady'\n    let temporizador: ReturnType<typeof setTimeout> | undefined = setTimeout(\n      () => abort(),\n      streamTimeout + 1_000\n    )\n    const { pipe, abort } = renderToPipeableStream(\n      <ServerRouter context={routerContext} url={request.url} />,\n      {\n        [alEstarListo]() {",
  "anotaciones": [
    {
      "fragmento": "export const streamTimeout = 5_000",
      "nota": "React Router lo lee de este módulo. Pasados 5 segundos, rechaza con un error las promesas de los loader que todavía no han llegado, y el navegador recibe ese error en el Await, que pinta su errorElement."
    },
    {
      "fragmento": "(agente && isbot(agente)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady'",
      "nota": "A una persona se le manda el HTML en cuanto está la estructura (onShellReady) y el resto llega después. A un bot, como el de un buscador, se le espera a tenerlo todo (onAllReady): no sabe esperar al streaming."
    },
    {
      "fragmento": "export const handleError: HandleErrorFunction = (error, { request }) => {",
      "nota": "De paso: el handleError provisional del taller. Hasta la lección 22 solo escribe el error en la terminal, como haría React Router sin él, y no registra las peticiones canceladas. El test de esta lección comprueba que no lanza."
    },
    {
      "fragmento": "streamTimeout + 1_000",
      "nota": "Un segundo después, si la respuesta sigue abierta, abort() corta el render de React. El segundo de margen deja que el rechazo del router llegue antes al navegador."
    },
    {
      "fragmento": "let temporizador: ReturnType<typeof setTimeout> | undefined = setTimeout(",
      "nota": "El temporizador arranca con la petición. Más abajo, cuando el cuerpo de la respuesta termina, se anula con clearTimeout: si todo llega a tiempo, abort no se llama nunca."
    }
  ]
}
```

Para verlo, puse en una copia del taller una promesa que no se resuelve nunca en el `loader` de «Camas libres», con su `<Await>` y un `errorElement` que dice «La previsión no ha llegado a tiempo.». Esto vio Chromium, con el `User-Agent` de un Chrome normal:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Una promesa que no llega nunca, con streamTimeout = 5000",
  "items": [
    {
      "fecha": "0,02 s",
      "titulo": "Llega el HTML, con un 200",
      "texto": "El documento sale en cuanto está la estructura. En el sitio de la promesa, el fallback: «Cargando la previsión…». La respuesta sigue abierta."
    },
    {
      "fecha": "5,00 s",
      "titulo": "El router rechaza la promesa",
      "texto": "Por la respuesta abierta llega un script con el error. En producción, saneado: el navegador recibe «Unexpected Server Error», no el mensaje de verdad (lección 20)."
    },
    {
      "fecha": "5,05 s",
      "titulo": "Se pinta el errorElement",
      "texto": "El Await recibe el rechazo y la página dice «La previsión no ha llegado a tiempo.». El resto de la página llevaba 5 segundos funcionando."
    },
    {
      "fecha": "6,02 s",
      "titulo": "abort() y fin de la respuesta",
      "texto": "El temporizador de handleRequest corta el render que seguía esperando en el servidor. En la terminal: Error: The render was aborted by the server without a reason."
    }
  ]
}
```

Y ahora con `curl`, una vez haciéndose pasar por Chrome y otra tal cual. `%{time_starttransfer}` es cuándo llegó el primer byte, y `%{time_total}`, cuándo terminó:

```text
$ curl -s -o /dev/null -w '%{http_code} %{time_starttransfer} %{time_total}\n' \
    -A 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' \
    'http://localhost:3000/camas?noche=2026-07-15'
200 0.034353 6.026736

$ curl -s -o /dev/null -w '%{http_code} %{time_starttransfer} %{time_total}\n' \
    'http://localhost:3000/camas?noche=2026-07-15'
500 6.005702 6.005797
```

**El segundo es un 500.** Para `isbot`, `curl` es un bot (y el Chromium sin interfaz de Playwright también: con su `User-Agent` de serie dio el mismo 500). A un bot se le espera a `onAllReady`; la promesa no llega, a los 6 segundos `abort()` corta el render, `onError` cambia el estado a 500 y entonces se responde. **El buscador que visite esa página se lleva un 500 tras seis segundos de espera**, mientras que una persona ve la página al instante y un aviso en un rincón.

`streamTimeout` es la red de seguridad, no la solución: lo que puede tardar mucho debería tener su propio límite dentro del `loader`, con `AbortSignal.timeout()` en el `fetch`, por ejemplo, y un valor por defecto si no llega.

## El mapa del albergue, ruta a ruta

Al acabar esta lección y la siguiente, cada página tiene su estrategia:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Cómo se sirve cada ruta del taller",
  "nodos": [
    {
      "nombre": "root",
      "nivel": 0,
      "etiqueta": "ssr: true"
    },
    {
      "nombre": "publico",
      "nivel": 1,
      "etiqueta": "layout"
    },
    {
      "nombre": "portada",
      "nivel": 2,
      "etiqueta": "SSR",
      "nota": "← el aviso del Ayuntamiento cambia sin desplegar"
    },
    {
      "nombre": "albergue",
      "nivel": 2,
      "etiqueta": "prerender",
      "nota": "← un archivo: /albergue/index.html"
    },
    {
      "nombre": "etapas",
      "nivel": 2,
      "etiqueta": "SSR",
      "nota": "← con la caché de clientLoader de la 16"
    },
    {
      "nombre": "etapa",
      "nivel": 2,
      "etiqueta": "prerender",
      "nota": "← cinco direcciones, con su .html y su .data"
    },
    {
      "nombre": "camas",
      "nivel": 2,
      "etiqueta": "Cache-Control: public",
      "nota": "← 1 min en el navegador, 5 en una caché compartida"
    },
    {
      "nombre": "reservar",
      "nivel": 2,
      "etiqueta": "SSR",
      "nota": "← tiene action: no tiene sentido guardarla"
    },
    {
      "nombre": "mi-camino",
      "nivel": 2,
      "etiqueta": "navegador",
      "nota": "← solo clientLoader: lee localStorage"
    },
    {
      "nombre": "zona",
      "nivel": 1,
      "etiqueta": "private, no-store",
      "nota": "← lo pone su middleware (18), también al CSV"
    },
    {
      "nombre": "hoy",
      "nivel": 2,
      "etiqueta": "SSR"
    },
    {
      "nombre": "reserva",
      "nivel": 2,
      "etiqueta": "SSR"
    },
    {
      "nombre": "pernoctas.csv",
      "nivel": 2,
      "etiqueta": "recurso"
    }
  ]
}
```

Fíjate en que nada de esto cambia el componente de ninguna página. **La estrategia es configuración y cabeceras, no otro código**: puedes pasar una página de SSR a prerenderizada, o al revés, sin tocar su JSX. Y todas siguen funcionando sin JavaScript, porque siempre llega HTML de verdad, con enlaces y formularios de verdad: es la mejora progresiva de la que habla la documentación. La única excepción del albergue es `/mi-camino`, que solo existe en el navegador.

## El modo «API-only», solo para que te suene

La 8.5 añadió un tercer valor, todavía inestable: **`ssr: "unstable_api-only"`**. Hay servidor, pero solo para los `loader`, las `action` y el descubrimiento de rutas; los documentos no se generan en el servidor en producción. Las páginas de `prerender` llegan completas, y las demás reciben un HTML vacío como el del SPA Mode, que pide sus datos al servidor al arrancar. Es para una SPA que quiere `loader` y `action` de servidor sin renderizar en el servidor. La documentación avisa de que puede cambiar en cualquier versión menor; como todo lo `unstable_` de la ficha, no lo uses en producción hasta que pierda el prefijo.

## Cuándo lo usarías de verdad

- **Prerenderizar**: textos legales, «quiénes somos», documentación, un blog, páginas de producto que solo cambian al desplegar. Si **todas** tus páginas son así, `ssr: false` con `prerender` y un alojamiento estático (lección 22).
- **`Cache-Control: public` corto**: listados y fichas iguales para todos que cambian a menudo (horarios, stock, resultados), cuando tienes un CDN delante.
- **`private, no-store`**: cualquier cosa detrás de una sesión, y cualquier respuesta con datos personales, también los archivos.
- **El SPA Mode**: un panel interno que habla con una API que ya existe, o el primer paso de una migración al modo framework.
- **Bajar `streamTimeout`** cuando lo que llega por *streaming* es accesorio y prefieres un error rápido a una espera larga.

## Errores típicos

**Prerenderizar algo que cambia sin desplegar.** La portada con el aviso, una página con «plazas libres hoy», una cabecera con «Hola, Marta». El `loader` se ejecuta una vez, al construir, sin petición de nadie, y eso es lo que verá todo el mundo hasta el siguiente despliegue.

**`Cache-Control: public` en una respuesta con datos de alguien.** El error más caro de la lección: una caché compartida sirve a todos lo que vio el primero. Si dudas, `private, no-store`.

**Poner `private, no-store` con `headers` y creer que cubre toda la zona.** Las rutas de recursos no pasan por las funciones `headers`, y una hija que exporte su propio `headers` sustituye el de la madre si no usa `parentHeaders`. Un middleware de servidor en la madre lo cubre todo.

**Esperar que una página prerenderizada pase por tu servidor.** Ni `headers`, ni `handleRequest`, ni el middleware: la sirve el servidor de archivos. Ni siquiera se ejecuta el `loader`, así que tampoco se registra la visita.

**Olvidar a los bots al pensar en el *streaming*.** Para una persona, una promesa lenta es un aviso en un rincón; para un buscador, con el `entry.server.tsx` de la plantilla, una espera hasta que todo llegue, y si no llega, un 500.

**Escribir `ssr: false` en una app con servidor.** El build se para con `SPA Mode: N invalid route export(s)…` en cada `loader`, `action`, `headers` o `middleware` de una ruta que no sea `root`.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Prerenderizar es solo para webs estáticas sin servidor",
      "realidad": "Con ssr: true, el albergue sirve dos páginas como archivos y genera las demás en cada petición. Se mezcla por ruta."
    },
    {
      "mito": "En SPA Mode no se ejecuta nada en el servidor",
      "realidad": "No hay servidor en producción, pero la ruta root se renderiza al construir para escribir index.html: tu código tiene que poder ejecutarse en Node."
    },
    {
      "mito": "Con private ya es seguro guardar datos personales en caché",
      "realidad": "private impide las cachés compartidas, pero el navegador sí la guarda en disco. En un ordenador compartido, como el de la recepción del albergue, hace falta no-store."
    },
    {
      "mito": "streamTimeout hace que la página tarde como mucho 5 segundos",
      "realidad": "La página llega al instante; lo que se corta a los 5 segundos son las promesas pendientes. Y a un bot se le hace esperar a todo: si la promesa no llega, recibe un 500 a los 6 segundos."
    },
    {
      "mito": "headers en la ruta madre se aplica a todo lo que cuelga de ella",
      "realidad": "Solo a las rutas de interfaz que no exportan su propio headers. Las rutas de recursos devuelven su propia Response."
    }
  ]
}
```

## Ejercicios: la lección 17 en el taller

Esta lección no tiene un ejercicio en la vista previa: nada de lo que cuenta existe en el navegador. Se practica en el taller, siguiendo los tres `TODO (lección 17)`. Si te atascas, cada paso enlaza al archivo terminado en la rama `solucion`.

### Paso 1: el array `prerender` (`react-router.config.ts`)

```tsx
// TODO (lección 17): añade el array de rutas prerenderizadas.
```

Añade `prerender` con `/albergue` y una dirección por etapa, sacadas de `ETAPAS` (`app/datos/etapas.ts`), cada una como `/etapas/<slug>`. Ni la portada ni nada de la zona de hospitaleros. Tendrás que importar `ETAPAS` en la configuración.

Pone en verde **«prerenderiza el albergue y cada etapa, pero no la portada ni la zona privada»**, que compara el array con el esperado, en el mismo orden. [Solución: `react-router.config.ts`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/react-router.config.ts)

### Paso 2: la caché de «Camas libres» (`app/routes/camas.tsx`)

```tsx
export function headers() {
  // TODO (lección 17): añade una caché corta para navegador y proxy. Busca la
  // exportación headers de un módulo de ruta y stale-while-revalidate.
  return {}
}
```

Devuelve un `Cache-Control` público: 60 segundos para el navegador, 300 para una caché compartida y 600 de `stale-while-revalidate`, en ese orden. Pone en verde **«da a las camas una caché pública y corta»**. [Solución: `camas.tsx`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/routes/camas.tsx)

### Paso 3: `streamTimeout` (`app/entry.server.tsx`)

```tsx
// TODO (lección 17): limita a cinco segundos las promesas pendientes de los
// loaders y actions. Busca streamTimeout en la plantilla de entry.server.
export const streamTimeout = 10_000
```

Cinco segundos, como la plantilla. Mira también dónde se usa más abajo, en el temporizador de `handleRequest`. Pone en verde **«limita el flujo del servidor a cinco segundos»**, que además comprueba que el `handleError` provisional del taller no lanza (ya viene así: escribe el error en la terminal, como haría React Router sin él, hasta que la lección 22 lo sustituya). [Solución: `entry.server.tsx`](https://github.com/pedroleni/react-router-proyectos/blob/solucion/taller/app/entry.server.tsx)

### Comprueba

```text
$ npm run leccion -- 17

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

En todo el taller, `npm test` da ahora 27 tests en verde y 71 en rojo (los de las lecciones 18 a 22), y `npm run typecheck`, con el TypeScript 7.0.2 del taller, no marca ningún error.

Y mira el resultado de verdad, que es lo que importa de esta lección:

1. `npm run build`: al final salen las líneas `Prerender (html)` y `Prerender (data)` de `/albergue` y de las cinco etapas, y ninguna de `/`.
2. `npm start` y, en otra terminal, `curl -sI http://localhost:3000/albergue`: el 301 a `/albergue/`.
3. `curl -s -D - -o /dev/null 'http://localhost:3000/camas?noche=2026-07-15'`: el `cache-control` público. Repite con `/camas.data?noche=2026-07-15`.
4. `curl -s -D - -o /dev/null http://localhost:3000/`: la portada, sin `Cache-Control`.

### Retos para seguir practicando

1. **La función en vez del array.** Reescribe `prerender` como una función `async` que reciba `getStaticPaths`. Imprime lo que devuelve `getStaticPaths()` y explica por qué el taller no lo usa.
2. **Concurrencia.** Pasa a `{ paths, concurrency: 3 }` y compara el orden de las líneas `Prerender` con el de antes.
3. **Una caché para las etapas.** `/etapas` no está prerenderizada. ¿Qué `Cache-Control` le pondrías? Ten en cuenta la caché de `clientLoader` que le añadiste en la lección 16: ¿se pisan o se suman?
4. **Un `loader` con límite propio.** En una copia, haz que el `loader` de «Camas libres» pida algo a una URL que tarda, con `fetch(url, { signal: AbortSignal.timeout(2000) })` y un valor por defecto si falla. Comprueba con `curl` (que es un bot) que ya no hay 500.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Documentación y referencias",
  "recursos": [
    {
      "titulo": "Rendering Strategies",
      "descripcion": "SSR, renderizado en el cliente y prerenderizado, y el modo API-only, inestable.",
      "url": "https://reactrouter.com/start/framework/rendering",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Pre-Rendering",
      "descripcion": "prerender como booleano, array o función, la concurrencia, y cómo se combina con ssr: true y con ssr: false.",
      "url": "https://reactrouter.com/how-to/pre-rendering",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Single Page App (SPA)",
      "descripcion": "El SPA Mode: index.html al construir, HydrateFallback de root y la reescritura en el alojamiento.",
      "url": "https://reactrouter.com/how-to/spa",
      "etiqueta": "React Router"
    },
    {
      "titulo": "HTTP Headers",
      "descripcion": "La exportación headers, las cabeceras de loader y action, y cómo se mezclan en rutas anidadas.",
      "url": "https://reactrouter.com/how-to/headers",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Streaming with Suspense",
      "descripcion": "Promesas sin await en los loader y la sección Timeouts, con streamTimeout.",
      "url": "https://reactrouter.com/how-to/suspense",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Cache-Control",
      "descripcion": "Todas las directivas, con public, private, no-store, s-maxage y stale-while-revalidate.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control",
      "etiqueta": "MDN"
    },
    {
      "titulo": "taller (rama solucion)",
      "descripcion": "El taller terminado, para comparar tus tres cambios.",
      "url": "https://github.com/pedroleni/react-router-proyectos/tree/solucion/taller",
      "etiqueta": "GitHub"
    }
  ]
}
```
