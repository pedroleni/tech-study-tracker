# Proyecto avanzado: revista con renderizado en servidor (React Router en modo framework)

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-revista-con-renderizado-en-servidor-react-router-en-modo-framework` (autogenerado del título)
- **Orden:** 980
- **Fuentes:** [Framework: Installation](https://reactrouter.com/start/framework/installation) + [Data Loading](https://reactrouter.com/start/framework/data-loading) + [Actions](https://reactrouter.com/start/framework/actions) + [Using Fetchers](https://reactrouter.com/how-to/fetchers) + [Middleware](https://reactrouter.com/how-to/middleware) + [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) — ver `contenido/react/TEMARIO.md` #98
- **Repositorio:** [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos) (carpeta `revista`)
- **Requiere:** Las lecciones 76 y 77 (React Router), la 99, «El router también carga y envía datos» (`loader`, `action`, `<Form>` y `useFetcher` en el modo de datos), 81 (`<title>` y `<meta>`), 46 (`useSyncExternalStore`), 61 (validar formularios), 87 a 90 (el módulo 13), 83 y 84 (tests) y la 4 de HTML (metadatos del `<head>`), y el módulo 10 (TypeScript)

---

## Qué vas a construir

«Caja Baja» es una revista de tipografía e imprenta que se escribe en el **Taller La Minerva**, un taller de tipos móviles de Zaragoza: seis artículos sobre el oficio (la caja, el componedor), su historia (el impresor Joaquín Ibarra), la ortotipografía (las comillas, la raya) y la letra en la pantalla (por qué un punto no es un píxel). Cada artículo tiene debajo las cartas de sus lectores.

Es el proyecto que convierte en práctica el módulo 13. Lo que las lecciones 87 a 90 enseñaron con código anotado, porque la vista previa de esta web no tiene servidor, aquí corre en uno de verdad: el de **React Router 8 en modo framework**, el mismo que la lección 90 puso frente a Next.js y TanStack Start.

- **Cada página llega del servidor ya renderizada.** Un robot que no ejecuta JavaScript lee el artículo entero, con su `<title>`, su descripción y sus etiquetas Open Graph. Después llega el JavaScript y React **hidrata** la página (lección 87).
- **Los datos los carga un `loader`**, una función que solo se ejecuta en el servidor, antes de pintar.
- **Un 404 de verdad**: la dirección de un artículo que no existe responde con el estado 404, no con una página que dice «no existe» y un 200.
- **Cartas al director con una `action`**, validadas en el servidor. El formulario funciona **también sin JavaScript**, con un `POST` de toda la vida; con JavaScript, se envía sin recargar la página.
- **Un boletín en el pie que no te saca del artículo**: se envía con `useFetcher`, sin navegar.
- **Dos fechas que no rompen la hidratación**: la hora de publicación, que en tu ordenador funciona y en un servidor en UTC no, y «hace dos días», que el servidor no puede saber.
- **Un middleware que mide cada petición** en el servidor y se lo cuenta al navegador con la cabecera `Server-Timing`.
- **Lo que solo vive en el servidor**, en archivos `.server.ts`: los textos de los artículos y los correos de los lectores no llegan nunca al navegador.

```laboratorio
{
  "tipo": "video",
  "src": "https://www.techstudytracker.com/img/a11003c9ac33ffc702a96a781aeb8ca7feff4b646f349cd27cfb71615a171949.mp4",
  "poster": "https://www.techstudytracker.com/img/2d184f408e6410aff2aefcc90c3eea5adaa7c4ac31dbcf87301cb26d2be0acd2.jpg",
  "titulo": "Caja Baja: una revista renderizada en el servidor",
  "descripcion": "La portada y un artículo llegan del servidor; una carta con el correo mal escrito vuelve con su error y, corregida, se publica. Al final, sin JavaScript, el mismo formulario."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué",
  "roles": [
    {
      "etiqueta": "loader",
      "rol": "Los datos, en el servidor",
      "descripcion": "Se ejecuta antes de pintar la página: en la primera visita, para generar el HTML; al navegar, cuando React Router le pide los datos con un fetch."
    },
    {
      "etiqueta": "action",
      "rol": "Los envíos, en el servidor",
      "descripcion": "Recibe el POST del formulario, con o sin JavaScript. Valida, guarda y responde: con errores y un 400, o con una redirección."
    },
    {
      "etiqueta": "<title> y <meta>",
      "rol": "El head de cada página",
      "descripcion": "Las etiquetas de React de la lección 81. En el servidor, van ya dentro del head del HTML que se envía."
    },
    {
      "etiqueta": ".server.ts",
      "rol": "Lo que no sale del servidor",
      "descripcion": "Los módulos con este sufijo no pueden acabar en el navegador: si un componente los importa, el build se para."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-proyectos (carpeta revista). La rama main trae los estilos, los artículos, la capa que guarda las cartas y los tests, y un comentario TODO (paso N) en cada sitio donde va tu trabajo, con el mismo número que los pasos de esta lección. La rama solucion tiene el proyecto terminado."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Server Components, fuera a propósito",
  "contenido": "React Router los admite, pero su documentación avisa: «React Server Components support is experimental and subject to breaking changes in minor/patch releases». Aquí no se usan: es el renderizado en servidor de la lección 87, donde cada componente se ejecuta en el servidor para el HTML y otra vez en el navegador para hidratar. Tampoco hay Server Functions, y el proyecto no instala react-server-dom-webpack (npm ls lo confirma): el CVE de la lección 89 no le afecta."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las imágenes son tarjetas de letras",
  "contenido": "La revista no tiene fotos. Las imágenes de Open Graph, una por artículo y otra para la portada, son tarjetas tipográficas de 1200 × 630 con el título, en public/og. Se generaron con un script y se pueden cambiar por imágenes diseñadas sin tocar el código."
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 22.22.2 o superior, o la LTS actual (24).** React Router 8.5.0 pide Node 22.22 o superior, y jsdom, con el que corren los tests, 22.22.2. La lección 90 ya enseñó lo que pasa con uno más antiguo. Compruébalo con `node --version`.
- **Las lecciones 87 a 90**, sobre todo la 87. Este proyecto las aplica; cuando una idea ya tiene su explicación allí, te remito en vez de repetirla.
- **La lección «El router también carga y envía datos»**: `loader`, `action`, `<Form>`, `useNavigation` y `useFetcher` en el modo de datos. Aquí son los mismos, pero se ejecutan en el servidor.
- **Un navegador con herramientas de desarrollo**, para desactivar JavaScript en el paso 5.

### Del cero al proyecto en marcha

1. **Consigue el código**: `git clone https://github.com/pedroleni/react-proyectos.git`, o en [su página](https://github.com/pedroleni/react-proyectos), botón **Code** → **Download ZIP**.
2. **Abre en el editor la carpeta `revista/`** (la del proyecto, no la del repositorio entero) y su terminal.
3. **Instala y arranca**: `npm install` y después `npm run dev`. Abre la dirección que imprime la terminal, normalmente `http://localhost:5173`. Ese servidor de desarrollo ya renderiza en el servidor: no hay un modo «sin SSR» que pasar a otro.
4. **Ejecuta los tests en otra terminal**: `npm test`. Empiezan casi todos en rojo, y es a propósito:

```text
      Tests  28 failed | 2 passed (30)
```

Los dos que pasan comprueban la capa de datos, que ya está hecha. Los otros veintiocho se ponen en verde a medida que avanzas: tras el paso 1 pasan 4; tras el 2, 6; tras el 3, 8; tras el 4, 11; tras el 5, 17; tras el 6, 18; tras el 7, 23; tras el 8, 24; tras el 9, 27, y tras el 10, los 30.

Al abrir la revista verás «La portada está vacía: le falta su loader (paso 2).», y cualquier dirección de un artículo te dará «Esta página no existe», con un `Error: No route matches URL "/articulos/…"` en la terminal: la ruta todavía no está registrada. `npm run typecheck` también se queja, de tres cosas que se arreglan solas: de `./+types/articulo` hasta el paso 1, de `./+types/boletin` hasta el 7 (los tipos de una ruta solo se generan cuando está registrada) y de los tests hasta el 7, porque usan funciones que todavía no existen.

## Cómo está organizado

```text
app/
├── root.tsx                  el documento (<html>), la cabecera, el pie y el error ← paso 10
├── routes.ts                 las rutas                                             ← pasos 1 y 7
├── routes/
│   ├── portada.tsx           /                  loader de la portada               ← pasos 2 y 4
│   ├── articulo.tsx          /articulos/:slug   loader, 404, action                ← pasos 3 a 6 y 10
│   ├── boletin.tsx           /boletin           la action del boletín              ← paso 7
│   └── no-encontrada.tsx     cualquier otra dirección                              ← paso 3
├── componentes/
│   ├── Metadatos.tsx         <title>, <meta> y Open Graph                          ← paso 4
│   ├── FormularioCarta.tsx   el formulario de las cartas                           ← pasos 5 y 6
│   ├── FormularioBoletin.tsx el boletín, en el pie                                 ← paso 7
│   ├── TarjetaArticulo.tsx   un artículo en la portada
│   ├── FechaPublicacion.tsx  «21 de octubre de 2026 a las 9:30»
│   └── HaceCuanto.tsx        «· anteayer»                                          ← paso 9
├── datos/
│   ├── articulos.server.ts   los seis artículos
│   ├── cartas.server.ts      leer, guardar y validar las cartas                    ← paso 5
│   └── boletin.server.ts     guardar y validar los correos del boletín
├── config.server.ts          la URL pública, de la variable de entorno URL_PUBLICA
├── tiempos.server.ts         el middleware que mide cada petición                  ← paso 10
├── fechas.ts                 formatear fechas                                      ← paso 8
├── reloj.ts                  useAhora(): la hora, como almacén externo             ← paso 9
├── tipos.ts                  los tipos que comparten los dos lados
└── app.css
public/og/                    las tarjetas de Open Graph
pruebas/                      Vitest y Testing Library
```

Sale de la plantilla oficial, `npx create-react-router@latest`, que hoy crea un proyecto de React Router 8.5.0 con TypeScript, Tailwind y un `Dockerfile`. Tiene tres cambios: los estilos van en un CSS normal, sin Tailwind ni la fuente de Google (para que el código de los pasos no se llene de clases), no hay `Dockerfile` (desplegar es cosa de la lección 85) y se añade Vitest. TypeScript es el 7.0.2, como en los proyectos anteriores, aunque la plantilla oficial sigue trayendo el 5.9; la comprobación de tipos pasa limpia igual con las dos.

Lo primero que choca viniendo de Vite: **no hay `index.html` ni `main.tsx`**. El documento entero, desde `<html>`, lo renderiza el componente `Layout` de `root.tsx`, y cada página es un **módulo de ruta**: un archivo que exporta su componente y, si los necesita, su `loader`, su `action` y su `ErrorBoundary`. Las rutas son madres e hijas, como en la lección 77, y `root.tsx` es la madre de todas:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Las rutas de la revista",
  "nodos": [
    {
      "nombre": "root",
      "nivel": 0,
      "etiqueta": "root.tsx",
      "nota": "← el documento, la cabecera y el pie; el middleware de todas las rutas y su ErrorBoundary, para lo inesperado"
    },
    {
      "nombre": "portada",
      "nivel": 1,
      "etiqueta": "index",
      "nota": "← /, con su loader"
    },
    {
      "nombre": "articulo",
      "nivel": 1,
      "etiqueta": "articulos/:slug",
      "nota": "← loader, action y un ErrorBoundary para el 404"
    },
    {
      "nombre": "boletin",
      "nivel": 1,
      "etiqueta": "boletin",
      "nota": "← la action del boletín; sin JavaScript, también su página"
    },
    {
      "nombre": "no-encontrada",
      "nivel": 1,
      "etiqueta": "*",
      "nota": "← cualquier otra dirección, con su 404"
    }
  ]
}
```

Y esto es lo que pasa en una visita, de principio a fin. Todo lo de la lección 87 está aquí; la diferencia es que no lo escribes tú:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Una visita a Caja Baja, en orden",
  "items": [
    {
      "fecha": "Servidor",
      "titulo": "Llega la petición",
      "texto": "GET /articulos/la-raya-no-es-un-guion. React Router busca la ruta que encaja, pasa la petición por el middleware (paso 10) y ejecuta su loader: el artículo y sus cartas."
    },
    {
      "fecha": "Servidor",
      "titulo": "Se renderiza el documento",
      "texto": "Con renderToPipeableStream, el de la lección 87: el HTML entero, con el title y las meta de React dentro del head y, al final, los datos del loader en un script para hidratar."
    },
    {
      "fecha": "Navegador",
      "titulo": "Se pinta el HTML",
      "texto": "El artículo se lee antes de que llegue el JavaScript. Los enlaces son enlaces y el formulario es un formulario: ya funcionan, recargando la página."
    },
    {
      "fecha": "Navegador",
      "titulo": "Se hidrata",
      "texto": "Llega el JavaScript y React Router llama a hydrateRoot. React adopta el DOM que ya existe y le engancha los manejadores: desde ahí, los enlaces y el formulario ya no recargan."
    },
    {
      "fecha": "Navegador",
      "titulo": "Se navega sin recargar",
      "texto": "Un clic en un Link no pide HTML: React Router pide /articulos/<slug>.data, el servidor ejecuta el loader y devuelve solo los datos, y React pinta la página nueva."
    },
    {
      "fecha": "Navegador",
      "titulo": "Se envía una carta",
      "texto": "React Router manda el formulario con un fetch a la action. Si va bien, vuelve a pedir los datos de la página, y la carta nueva aparece en la lista."
    }
  ]
}
```

Las dos llamadas de React, `renderToPipeableStream` en el servidor y `hydrateRoot` en el navegador, viven en dos archivos que la plantilla no te enseña: React Router usa los suyos por defecto, y `npx react-router reveal` los copia a tu `app/` si algún día necesitas cambiarlos. Este es el del navegador, tal cual está en `@react-router/dev` 8.5.0:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { startTransition, StrictMode } from \"react\";\nimport { hydrateRoot } from \"react-dom/client\";\nimport { HydratedRouter } from \"react-router/dom\";\n\nstartTransition(() => {\n  hydrateRoot(\n    document,\n    <StrictMode>\n      <HydratedRouter />\n    </StrictMode>,\n  );\n});",
  "anotaciones": [
    {
      "fragmento": "hydrateRoot(\n    document,",
      "nota": "hydrateRoot sobre el document entero, como en la lección 87: el Layout de root.tsx devuelve desde <html>, así que no hay un div raíz que hidratar."
    },
    {
      "fragmento": "<StrictMode>",
      "nota": "StrictMode viene puesto. Desde 19.3 también repite los efectos al hidratar (lección 87)."
    },
    {
      "fragmento": "<HydratedRouter />",
      "nota": "El router, ya con los datos que el servidor dejó al final de la página: la primera vez no vuelve a llamar a ningún loader."
    },
    {
      "fragmento": "startTransition(() => {",
      "nota": "React Router arranca la hidratación dentro de startTransition, como una actualización no urgente (lección 51)."
    }
  ]
}
```

El del servidor, `entry.server`, hace lo que contó la lección 87 con un detalle: si quien pide la página es un robot (lo decide el paquete `isbot`, que la plantilla instala), espera a `onAllReady` para mandar el HTML completo; a las personas les manda el armazón en cuanto está, con `onShellReady`.

## Paso 1: las rutas (`app/routes.ts`)

En el modo declarativo de la lección 76, las rutas eran componentes `<Route>` dentro de la app. En el modo framework, son **datos en un archivo aparte**, `app/routes.ts`, que React Router lee al construir: así sabe, antes de que se ejecute nada, qué módulos hay que partir en trozos y qué tipos generar. La rama `main` solo trae la portada:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { type RouteConfig, index, route } from '@react-router/dev/routes'\n\nexport default [\n  index('routes/portada.tsx'),\n  route('articulos/:slug', 'routes/articulo.tsx'),\n  // Cualquier otra dirección: la página «no encontrada», con su 404.\n  route('*', 'routes/no-encontrada.tsx'),\n] satisfies RouteConfig",
  "anotaciones": [
    {
      "fragmento": "index('routes/portada.tsx')",
      "nota": "La ruta índice de root: la que se pinta en /. El segundo argumento de cada función es el módulo de ruta, relativo a app/."
    },
    {
      "fragmento": "route('articulos/:slug', 'routes/articulo.tsx')",
      "nota": "Un segmento dinámico, como los de la lección 77. El loader lo recibe en params.slug."
    },
    {
      "fragmento": "route('*', 'routes/no-encontrada.tsx')",
      "nota": "El comodín: cualquier dirección que no encaje con otra. React Router elige la ruta que mejor encaja, no la primera de la lista, así que el orden no importa."
    },
    {
      "fragmento": "satisfies RouteConfig",
      "nota": "satisfies de TypeScript (módulo 10): comprueba que la lista tiene la forma de una configuración de rutas sin cambiar su tipo."
    }
  ]
}
```

Al guardar, el servidor de desarrollo genera los tipos de cada ruta registrada en `.react-router/types/`, y el `import type { Route } from './+types/articulo'` del módulo deja de fallar. Con esos tipos, `loaderData` sabe exactamente qué devuelve tu `loader`, sin escribir ninguna interfaz.

Ahora prueba tres direcciones con el servidor de producción: `npm run build` y `npm start`, que escucha en el puerto 3000. Pide a cada una su estado (`curl -s -o /dev/null -w '%{http_code}' <dirección>`) y su `<h1>` (`curl -s <dirección> | grep -o '<h1>[^<]*</h1>'`). `curl` enseña la respuesta tal cual llega, sin ejecutar nada. Este es el resultado, resumido:

```text
dirección                                  estado   <h1> del HTML
/articulos/la-raya-no-es-un-guion          200      Caja alta y caja baja: de dónde salen las mayúsculas
/articulos/no-existe                       200      Caja alta y caja baja: de dónde salen las mayúsculas
/lo-que-sea                                200      Esta página no existe
```

Las tres responden 200. Las dos primeras enseñan el mismo artículo, porque el `loader` de la rama `main` es provisional y no mira la dirección; la tercera dice que la página no existe, pero con un 200. Para un buscador, las tres son páginas que existen. Lo arreglas en el paso 3.

Algo sí ha mejorado ya: con la ruta comodín, una dirección desconocida tiene quien la pinte, y la terminal deja de llenarse de `Error: No route matches URL` con su pila. El registro de `npm start` solo apunta `GET /lo-que-sea 200`.

## Paso 2: la portada, con datos del servidor (`app/routes/portada.tsx`)

La portada necesita la lista de artículos. En la lección 52 la habrías pedido con un `fetch` dentro de un efecto, y en la 78, con TanStack Query: las dos, **después** de pintar, con un «Cargando…» en medio. Con un `loader`, los datos están antes de pintar:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import TarjetaArticulo from '~/componentes/TarjetaArticulo'\nimport { listarArticulos } from '~/datos/articulos.server'\nimport type { Route } from './+types/portada'\n\n// Se ejecuta en el servidor antes de pintar la portada: en la primera visita,\n// para generar el HTML; al volver a ella navegando, cuando React Router pide\n// los datos con un fetch.\nexport async function loader() {\n  return { articulos: listarArticulos() }\n}\n\nexport default function Portada({ loaderData }: Route.ComponentProps) {\n  const { articulos } = loaderData\n  const [destacado, ...resto] = articulos\n\n  return (\n    <main className=\"portada\">\n      <h1 className=\"visualmente-oculto\">Últimos artículos</h1>\n      <TarjetaArticulo articulo={destacado} destacado />\n      <div className=\"rejilla\">\n        {resto.map((articulo) => (\n          <TarjetaArticulo key={articulo.slug} articulo={articulo} />\n        ))}\n      </div>\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export async function loader() {",
      "nota": "Un export con nombre fijo. React Router lo llama en el servidor antes de renderizar la ruta, y lo quita del JavaScript del navegador al construir."
    },
    {
      "fragmento": "return { articulos: listarArticulos() }",
      "nota": "Lo que devuelves llega al componente tal cual. Puede ser async y devolver fechas, Map o Set: React Router lo serializa por ti."
    },
    {
      "fragmento": "{ loaderData }: Route.ComponentProps",
      "nota": "El componente recibe los datos como prop, ya tipados con lo que devuelve el loader. También existe useLoaderData(), pero la prop no necesita tipos a mano."
    },
    {
      "fragmento": "const [destacado, ...resto] = articulos",
      "nota": "Sin estado, sin efecto y sin «Cargando…»: cuando el componente se ejecuta, los datos ya están. En el servidor y en el navegador."
    }
  ]
}
```

Recarga la portada y pide el HTML con `curl`. Los seis titulares ya vienen dentro:

```text
$ curl -s http://localhost:3000/ | grep -o '<h2 class="tarjeta-titulo"><a [^>]*>[^<]*</a></h2>'
<h2 class="tarjeta-titulo"><a href="/articulos/caja-alta-y-caja-baja">Caja alta y caja baja: de dónde salen las mayúsculas</a></h2>
<h2 class="tarjeta-titulo"><a href="/articulos/un-punto-no-es-un-pixel">Un punto no es un píxel</a></h2>
<h2 class="tarjeta-titulo"><a href="/articulos/componer-una-linea-a-mano">Componer una línea a mano, letra a letra</a></h2>
<h2 class="tarjeta-titulo"><a href="/articulos/las-comillas-que-pide-la-ortografia">Las comillas que pide la Ortografía</a></h2>
<h2 class="tarjeta-titulo"><a href="/articulos/joaquin-ibarra-el-impresor-de-zaragoza">Joaquín Ibarra, el impresor de Zaragoza</a></h2>
<h2 class="tarjeta-titulo"><a href="/articulos/la-raya-no-es-un-guion">La raya no es un guion</a></h2>
```

(Recortado: cada enlace lleva además un atributo `data-discover`, que React Router usa para descubrir las rutas.) Compáralo con lo que la lección 90 vio en una app de Vite: un `<div id="root"></div>` vacío para cualquier dirección.

**Todo lo que devuelve un `loader` viaja al navegador**, y en la primera visita viaja dos veces: pintado en el HTML y, al final de la página, en un `<script>` con los datos que `hydrateRoot` necesita para que el primer render del navegador coincida con el del servidor. Lo comprobamos en el artículo de las comillas: una frase de su cuerpo aparece dos veces en el HTML. Por eso `listarArticulos` devuelve los resúmenes **sin el cuerpo**: la portada no lo pinta, y mandarlo sería mandar seis artículos enteros para nada. El segundo test de este paso lo comprueba.

### Solo en el servidor: los archivos `.server`

`listarArticulos` está en `app/datos/articulos.server.ts`, y ese sufijo no es decorativo. React Router quita el `loader` del JavaScript del navegador, y con él, lo que solo usa el `loader`. Pero basta un `import` desde un componente para que un módulo entre en el paquete del navegador **entero**. Lo medimos con un componente `SigueLeyendo` que llama directamente a `otrosArticulos`, en vez de recibir la lista del `loader`:

- **Con el módulo sin sufijo** (`articulos.ts`), el build termina sin un solo aviso y la página funciona. Pero el trozo del navegador de la página del artículo pasa de 4,7 kB a 15,4 kB: dentro van los seis artículos completos, comprobado buscando una de sus frases en `build/client`.
- **Con el sufijo**, el build se para:

```text
[plugin react-router:dot-server]
Error: Server-only module referenced by client

    '~/datos/articulos.server' imported by 'app/componentes/SigueLeyendo.tsx'

  See https://reactrouter.com/explanation/code-splitting#removal-of-server-code
```

Es decir: «un módulo solo de servidor está referenciado por código del cliente», y te dice quién lo importa. Con `npm run dev` el aviso es el mismo, en la terminal: la página sale, porque el servidor sí puede leer el módulo, pero el navegador recibe un 500 al pedir el del componente.

En este proyecto, dos cosas no pueden salir del servidor: los textos de los artículos, que hacen de base de datos, y las cartas, que guardan el correo de cada lector y usan `node:fs`, que en el navegador no existe. `config.server.ts` es el tercero: lee `process.env`. La documentación de React Router propone otra forma de marcarlo, una carpeta `.server/` entera.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// app/datos/articulos.ts (sin .server)\nexport function otrosArticulos(slug) { /* filtra los seis artículos completos */ }\n\n// app/componentes/SigueLeyendo.tsx\nimport { otrosArticulos } from '~/datos/articulos'\n\nexport default function SigueLeyendo({ slug }) {\n  return (\n    <ul>\n      {otrosArticulos(slug).map((otro) => (\n        <li key={otro.slug}><Link to={`/articulos/${otro.slug}`}>{otro.titulo}</Link></li>\n      ))}\n    </ul>\n  )\n}\n\n// npm run build. ¿Qué pasa?",
  "opciones": [
    "El build falla: un componente no puede importar datos",
    "El build termina sin avisos y la página funciona, pero el JavaScript del navegador lleva los seis artículos enteros",
    "El build termina, pero la página falla en el navegador porque los datos solo existen en el servidor",
    "Nada raro: React Router quita esa llamada del navegador, como hace con el loader"
  ],
  "correcta": 1,
  "explicacion": "Sin sufijo, para el bundler es un módulo como cualquier otro: el componente lo importa, así que va al navegador, y la llamada funciona allí también. El trozo de la página del artículo pasó de 4,7 kB a 15,4 kB con todos los textos dentro. React Router solo quita el loader, la action y lo que usan ellos. Con el sufijo .server, el mismo import para el build con «Server-only module referenced by client»."
}
```

## Paso 3: cada artículo, y un 404 de verdad (`articulo.tsx` y `no-encontrada.tsx`)

El `loader` del artículo recibe los parámetros de la ruta y busca el suyo. Si no existe, no devuelve nada que pintar: **lanza** una respuesta con el estado 404.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params }: Route.LoaderArgs) {\n  const articulo = buscarArticulo(params.slug)\n  if (!articulo) {\n    // Un 404 de verdad: el estado HTTP de la respuesta y el ErrorBoundary de\n    // abajo. Lo que va dentro de data() llega a ese ErrorBoundary.\n    throw data({ otros: otrosArticulos(params.slug) }, { status: 404 })\n  }\n\n  return { articulo, otros: otrosArticulos(articulo.slug) }\n}\n\n// ...el componente, igual que antes...\n\nexport function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {\n  if (isRouteErrorResponse(error) && error.status === 404) {\n    const otros: { slug: string; titulo: string }[] = error.data?.otros ?? []\n    return (\n      <main className=\"no-encontrada\">\n        <title>Artículo no encontrado · Caja Baja</title>\n        <meta name=\"robots\" content=\"noindex\" />\n        <h1>Este artículo no existe</h1>\n        <p>Puede que la dirección esté mal escrita o que el artículo se haya retirado.</p>\n        {otros.length > 0 && (\n          <>\n            <h2>Lo último de la revista</h2>\n            <ul>\n              {otros.map((otro) => (\n                <li key={otro.slug}>\n                  <Link to={`/articulos/${otro.slug}`}>{otro.titulo}</Link>\n                </li>\n              ))}\n            </ul>\n          </>\n        )}\n        <p>\n          <Link to=\"/\">Volver a la portada</Link>\n        </p>\n      </main>\n    )\n  }\n  // ...y otro mensaje para cualquier otro error\n}",
  "anotaciones": [
    {
      "fragmento": "{ params }: Route.LoaderArgs",
      "nota": "El loader recibe params con los segmentos dinámicos de la ruta (aquí, slug), la request entera y un context. Los tipos salen de routes.ts."
    },
    {
      "fragmento": "throw data({ otros: otrosArticulos(params.slug) }, { status: 404 })",
      "nota": "data(), de react-router, envuelve unos datos con opciones de respuesta. Lanzado, corta el loader: la respuesta sale con un 404 y se pinta el ErrorBoundary de la ruta en vez de su componente."
    },
    {
      "fragmento": "export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {",
      "nota": "El límite de error de esta ruta. Se pinta dentro del Layout de root, así que la cabecera y el pie siguen ahí."
    },
    {
      "fragmento": "isRouteErrorResponse(error) && error.status === 404",
      "nota": "Distingue una respuesta lanzada a propósito (con su status y sus datos) de un error de verdad, como una excepción en el código."
    },
    {
      "fragmento": "error.data?.otros",
      "nota": "Lo que pusiste dentro de data() llega aquí: la página de 404 ofrece los últimos artículos. React Router no lo limpia en producción, porque está pensado para pintarse; los mensajes de las excepciones, sí."
    },
    {
      "fragmento": "<meta name=\"robots\" content=\"noindex\" />",
      "nota": "Que los buscadores no guarden esta página. El 404 ya se lo dice, pero no está de más."
    }
  ]
}
```

Para las direcciones que no son de ninguna ruta, `no-encontrada.tsx` ya pinta su página. Le falta el estado, y lo pone su `loader`, que no tiene datos que dar, pero **devuelve** un `data()` con un 404:

```tsx
export function loader() {
  return data(null, { status: 404 })
}
```

Las dos formas sirven para responder 404, y la diferencia es qué se pinta. **Devuelto**, se pinta el componente de la ruta, con el estado que digas. **Lanzado**, se corta todo y se pinta el `ErrorBoundary`. Para un artículo que no existe, lanzarlo es lo natural: el componente no tendría artículo que pintar.

Repite las pruebas con el servidor de producción:

```text
$ curl -sI http://localhost:3000/articulos/las-comillas-que-pide-la-ortografia | head -1
HTTP/1.1 200 OK
$ curl -sI http://localhost:3000/articulos/las-comillas-que-no-existen | head -1
HTTP/1.1 404 Not Found
$ curl -sI http://localhost:3000/lo-que-sea | head -1
HTTP/1.1 404 Not Found
```

## Paso 4: título, descripción y Open Graph (`Metadatos.tsx`, `portada.tsx` y `articulo.tsx`)

Cada página necesita su `<title>`, su descripción y las etiquetas Open Graph que la lección 4 de HTML explicó: `og:title`, `og:type`, `og:image` y `og:url`, con `property`, y la imagen con una URL absoluta. En la lección 81 viste el problema de ponerlas desde React en una app de Vite: los robots que generan la tarjeta de un enlace leen el HTML que les llega, y en una SPA ese HTML no las tiene. Aquí sí las tendrá, porque el componente se ejecuta en el servidor.

Las pone un componente reutilizable, con las etiquetas de React de la lección 81:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// El <head> de cada página, con las etiquetas de React (lección 81): React\n// las sube al <head> esté donde esté el componente, y en el servidor van ya\n// dentro del HTML que se envía.\n\ntype Props = {\n  /** El título del artículo o de la página, sin el nombre de la revista. */\n  titulo: string\n  descripcion: string\n  /** URL absoluta de la página: https://… */\n  url: string\n  /** URL absoluta de la imagen de la tarjeta, de 1200 × 630. */\n  imagen: string\n  tipo: 'website' | 'article'\n  /** Solo en los artículos. */\n  articulo?: { publicado: string; seccion: string; autoria: string }\n  /** El <title> completo, si no es «titulo · Caja Baja». */\n  tituloPagina?: string\n}\n\nexport default function Metadatos({ titulo, descripcion, url, imagen, tipo, articulo, tituloPagina }: Props) {\n  return (\n    <>\n      <title>{tituloPagina ?? `${titulo} · Caja Baja`}</title>\n      <meta name=\"description\" content={descripcion} />\n      <link rel=\"canonical\" href={url} />\n\n      {/* Open Graph (lección 4 de HTML): con property, no con name */}\n      <meta property=\"og:site_name\" content=\"Caja Baja\" />\n      <meta property=\"og:locale\" content=\"es_ES\" />\n      <meta property=\"og:type\" content={tipo} />\n      <meta property=\"og:title\" content={titulo} />\n      <meta property=\"og:description\" content={descripcion} />\n      <meta property=\"og:url\" content={url} />\n      <meta property=\"og:image\" content={imagen} />\n      <meta property=\"og:image:width\" content=\"1200\" />\n      <meta property=\"og:image:height\" content=\"630\" />\n      <meta property=\"og:image:alt\" content={`${titulo}. Caja Baja, revista de tipografía e imprenta.`} />\n      {articulo && (\n        <>\n          <meta property=\"article:published_time\" content={articulo.publicado} />\n          <meta property=\"article:section\" content={articulo.seccion} />\n          <meta name=\"author\" content={articulo.autoria} />\n        </>\n      )}\n      <meta name=\"twitter:card\" content=\"summary_large_image\" />\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<title>{tituloPagina ?? `${titulo} · Caja Baja`}</title>",
      "nota": "Un solo texto dentro de title, con una plantilla: con llaves sueltas en medio, serían varios hijos y React avisa (lección 81)."
    },
    {
      "fragmento": "<meta name=\"description\" content={descripcion} />",
      "nota": "La descripción para los buscadores: la entradilla del artículo, que ya tiene la medida de una."
    },
    {
      "fragmento": "<link rel=\"canonical\" href={url} />",
      "nota": "La URL oficial de la página. Un link que no es una hoja de estilos: React lo sube al head sin precedence."
    },
    {
      "fragmento": "<meta property=\"og:type\" content={tipo} />",
      "nota": "website para la portada y article para cada artículo, que además lleva las etiquetas article: con la fecha y la sección."
    },
    {
      "fragmento": "<meta property=\"og:image\" content={imagen} />",
      "nota": "Absoluta, con el dominio: la descarga un robot desde fuera. Por eso el componente la recibe ya hecha, y no la calcula él."
    },
    {
      "fragmento": "<meta name=\"twitter:card\" content=\"summary_large_image\" />",
      "nota": "La de X/Twitter usa name, no property (lección 4 de HTML). Con ella, la tarjeta sale con la imagen grande."
    }
  ]
}
```

La documentación de React Router 8 lo recomienda así: «Since React 19, using the built-in `<meta>` element is recommended over the use of the route module's `meta` export», es decir, desde React 19 aconseja las etiquetas de React en vez de la exportación `meta` de cada ruta, la que usó la lección 90. Las dos acaban en el HTML del servidor. El `<Meta />` de `root.tsx` es el que pinta las exportaciones `meta`; aquí no hay ninguna, y se queda vacío.

Para la URL absoluta hace falta el dominio, y eso lo sabe el servidor. `config.server.ts` lo lee de una variable de entorno y, si no está, de la propia petición:

```tsx
// La dirección pública de la revista, para las URL absolutas de Open Graph y la
// canónica. En producción se fija con la variable de entorno URL_PUBLICA (por
// ejemplo, https://cajabaja.example); sin ella, sale de la petición. Como este
// módulo es .server, process.env se lee en el servidor y nunca llega al
// navegador, a diferencia de las variables VITE_ de la lección 85.
export function origenPublico(request: Request): string {
  return process.env.URL_PUBLICA ?? new URL(request.url).origin
}
```

Y el `loader` del artículo calcula las dos direcciones, que el componente le pasa a `Metadatos`:

```tsx
  const origen = origenPublico(request)
  return {
    articulo,
    otros: otrosArticulos(articulo.slug),
    url: `${origen}/articulos/${articulo.slug}`,
    imagen: `${origen}/og/${articulo.slug}.png`,
  }
```

La portada hace lo mismo con su `origen` y la tarjeta `/og/portada.png`. Esto es el `<head>` que manda el servidor para el artículo de las comillas (cada etiqueta en su línea; en el HTML real van seguidas):

```html
<meta charSet="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Las comillas que pide la Ortografía · Caja Baja</title>
<meta name="description" content="Latinas, inglesas y simples: hay tres clases de comillas y un orden para usarlas. Por qué esta revista empieza siempre por las latinas."/>
<link rel="canonical" href="http://localhost:3000/articulos/las-comillas-que-pide-la-ortografia"/>
<meta property="og:site_name" content="Caja Baja"/>
<meta property="og:locale" content="es_ES"/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="Las comillas que pide la Ortografía"/>
<meta property="og:description" content="Latinas, inglesas y simples: hay tres clases de comillas y un orden para usarlas. Por qué esta revista empieza siempre por las latinas."/>
<meta property="og:url" content="http://localhost:3000/articulos/las-comillas-que-pide-la-ortografia"/>
<meta property="og:image" content="http://localhost:3000/og/las-comillas-que-pide-la-ortografia.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="Las comillas que pide la Ortografía. Caja Baja, revista de tipografía e imprenta."/>
<meta property="article:published_time" content="2026-09-30T12:00:00+02:00"/>
<meta property="article:section" content="Ortotipografía"/>
<meta name="author" content="Marta Bielsa"/>
<meta name="twitter:card" content="summary_large_image"/>
```

Ahí está todo lo que pide la lección 4 de HTML, sin ejecutar una línea de JavaScript. Con `URL_PUBLICA=https://cajabaja.example npm start`, la canónica y la imagen pasan a ser `https://cajabaja.example/…`; y como `process.env` se lee en un módulo `.server`, ese valor no aparece en ningún archivo de `build/client` (comprobado). Es lo contrario de las variables `VITE_` de la lección 85, que se escriben dentro del JavaScript del navegador.

Navega ahora de un artículo a otro con los enlaces de «Sigue leyendo»: el título de la pestaña cambia sin recargar, porque React quita las etiquetas del artículo que se va y pone las del que llega. Para quien lee da igual; para un robot, lo que cuenta es el HTML de la primera respuesta.

## Paso 5: cartas al director, validadas en el servidor (`cartas.server.ts`, `articulo.tsx` y `FormularioCarta.tsx`)

La lección 61 terminaba con una regla: **valida en el cliente para ayudar y en el servidor para proteger**, y dejaba el servidor para más adelante. Este es el más adelante. La validación va en `cartas.server.ts`, junto a lo que guarda las cartas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function validarCarta(formData: FormData): ResultadoValidacion {\n  const leer = (campo: CamposCarta) => {\n    const valor = formData.get(campo)\n    return typeof valor === 'string' ? valor.trim() : ''\n  }\n  const valores = { nombre: leer('nombre'), correo: leer('correo'), texto: leer('texto') }\n  const errores: Partial<Record<CamposCarta, string>> = {}\n\n  if (!valores.nombre) {\n    errores.nombre = 'Escribe tu nombre: firmamos todas las cartas.'\n  } else if (valores.nombre.length > LIMITES.nombre) {\n    errores.nombre = `El nombre puede tener como mucho ${LIMITES.nombre} caracteres.`\n  }\n\n  if (!CORREO.test(valores.correo)) {\n    errores.correo = 'Escribe un correo válido, como nombre@ejemplo.es. No lo publicaremos.'\n  }\n\n  if (valores.texto.length < LIMITES.textoMinimo) {\n    errores.texto = `La carta tiene que tener al menos ${LIMITES.textoMinimo} caracteres.`\n  } else if (valores.texto.length > LIMITES.texto) {\n    errores.texto = `La carta puede tener como mucho ${LIMITES.texto} caracteres.`\n  }\n\n  return Object.keys(errores).length > 0 ? { ok: false, errores, valores } : { ok: true, carta: valores }\n}",
  "anotaciones": [
    {
      "fragmento": "const valor = formData.get(campo)\n    return typeof valor === 'string' ? valor.trim() : ''",
      "nota": "Lo que llega puede no ser lo que espera tu formulario: un campo que falta (null) o un archivo. Todo pasa a texto sin espacios a los lados antes de mirarlo."
    },
    {
      "fragmento": "if (!valores.nombre) {",
      "nota": "Un nombre de tres espacios queda vacío tras el trim. El required del HTML lo habría dejado pasar (lección 61)."
    },
    {
      "fragmento": "if (!CORREO.test(valores.correo)) {",
      "nota": "Una expresión sencilla que exige algo, una arroba, algo, un punto y algo. El type=\"email\" del navegador da por bueno ana@correo; esta no."
    },
    {
      "fragmento": "return Object.keys(errores).length > 0 ? { ok: false, errores, valores } : { ok: true, carta: valores }",
      "nota": "Con errores, también los valores: el servidor tiene que volver a pintar el formulario con lo que se escribió, porque sin JavaScript la página es nueva."
    }
  ]
}
```

Los mensajes exactos están en el comentario `TODO (paso 5)` del archivo; los tests los comprueban letra a letra. La `action` va en el módulo del artículo, y el `loader` gana las cartas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function loader({ params, request }: Route.LoaderArgs) {\n  // ...buscar el artículo y lanzar el 404, como en el paso 3...\n  const url = new URL(request.url)\n  const origen = origenPublico(request)\n  return {\n    articulo,\n    cartas: await leerCartas(articulo.slug),\n    // Tras enviar una carta, la action redirige aquí con ?carta=<id>.\n    cartaNueva: url.searchParams.get('carta'),\n    otros: otrosArticulos(articulo.slug),\n    url: `${origen}/articulos/${articulo.slug}`,\n    imagen: `${origen}/og/${articulo.slug}.png`,\n  }\n}\n\nexport async function action({ params, request }: Route.ActionArgs) {\n  // La URL también llega de fuera: el artículo tiene que existir.\n  const articulo = buscarArticulo(params.slug)\n  if (!articulo) throw data({ otros: otrosArticulos(params.slug) }, { status: 404 })\n\n  const resultado = validarCarta(await request.formData())\n  if (!resultado.ok) {\n    // 400: los datos no valen. Se devuelven los errores y lo que se escribió,\n    // para volver a pintar el formulario con todo en su sitio.\n    return data({ errores: resultado.errores, valores: resultado.valores }, { status: 400 })\n  }\n\n  const carta = await guardarCarta(articulo.slug, resultado.carta)\n  // Después de un POST que ha ido bien, una redirección (POST/redirección/GET):\n  // si quien la ha enviado recarga la página, no la envía otra vez.\n  return redirect(`/articulos/${articulo.slug}?carta=${carta.id}#cartas`)\n}",
  "anotaciones": [
    {
      "fragmento": "cartas: await leerCartas(articulo.slug),",
      "nota": "Las cartas publicadas, sin el correo: leerCartas lo quita antes de que salga del servidor. Lo que devuelve el loader viaja al navegador."
    },
    {
      "fragmento": "cartaNueva: url.searchParams.get('carta'),",
      "nota": "El loader recibe la request entera: aquí lee la búsqueda de la URL, a la que redirige la action."
    },
    {
      "fragmento": "export async function action({ params, request }: Route.ActionArgs) {",
      "nota": "Se ejecuta en el servidor cuando llega un POST a esta ruta. Como el loader, desaparece del JavaScript del navegador."
    },
    {
      "fragmento": "if (!articulo) throw data({ otros: otrosArticulos(params.slug) }, { status: 404 })",
      "nota": "La URL también la controla quien envía: una carta a un artículo que no existe es un 404, aunque la carta sea válida."
    },
    {
      "fragmento": "validarCarta(await request.formData())",
      "nota": "request.formData() es la API estándar de la web: lo mismo que harías en cualquier servidor que trabaje con Request."
    },
    {
      "fragmento": "return data({ errores: resultado.errores, valores: resultado.valores }, { status: 400 })",
      "nota": "Devuelto, no lanzado: el componente sigue en pantalla y recibe los errores en actionData. El 400 dice que los datos no valen."
    },
    {
      "fragmento": "return redirect(`/articulos/${articulo.slug}?carta=${carta.id}#cartas`)",
      "nota": "Tras un POST que va bien, una redirección: el patrón POST/redirección/GET. Si quien la envió recarga, el navegador repite el GET, no el POST, y la carta no se publica dos veces."
    }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export default function FormularioCarta({ resultado }: { resultado?: Resultado }) {\n  const errores = resultado?.errores ?? {}\n  const valores = resultado?.valores\n  const formulario = useRef<HTMLFormElement>(null)\n  // Sin JavaScript, la respuesta es una página nueva que se abre arriba del\n  // todo. Con el ancla, el navegador baja hasta las cartas, y los errores se ven.\n  const { pathname } = useLocation()\n\n  // Tras un envío con errores, el foco va al primer campo que hay que corregir.\n  useEffect(() => {\n    formulario.current?.querySelector<HTMLElement>('[aria-invalid=\"true\"]')?.focus()\n  }, [resultado])\n\n  const describir = (campo: CamposCarta) => (errores[campo] ? `carta-${campo}-error` : undefined)\n\n  return (\n    <Form method=\"post\" action={`${pathname}#cartas`} noValidate ref={formulario} className=\"formulario-carta\">\n      <div className=\"campo\">\n        <label htmlFor=\"carta-nombre\">Nombre</label>\n        <input\n          id=\"carta-nombre\"\n          name=\"nombre\"\n          autoComplete=\"name\"\n          required\n          maxLength={60}\n          defaultValue={valores?.nombre}\n          aria-invalid={errores.nombre ? true : undefined}\n          aria-describedby={describir('nombre')}\n        />\n        {errores.nombre && (\n          <p id=\"carta-nombre-error\" className=\"error\">\n            {errores.nombre}\n          </p>\n        )}\n      </div>\n\n      {/* ...el correo y la carta, igual... */}\n\n      <button type=\"submit\">Enviar la carta</button>\n    </Form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Form method=\"post\" action={`${pathname}#cartas`} noValidate",
      "nota": "Form de react-router pinta un form normal. Con method=\"post\", envía a la action de esta ruta. noValidate apaga los globos del navegador para que se vean los mensajes del servidor (lección 61)."
    },
    {
      "fragmento": "const { pathname } = useLocation()",
      "nota": "La dirección del artículo, sin la búsqueda: si la URL lleva ?carta=, el formulario no la arrastra."
    },
    {
      "fragmento": "#cartas",
      "nota": "Sin JavaScript, la respuesta es una página nueva que se abre arriba del todo. Con el ancla, el navegador baja hasta las cartas, y los errores se ven."
    },
    {
      "fragmento": "formulario.current?.querySelector<HTMLElement>('[aria-invalid=\"true\"]')?.focus()",
      "nota": "Con JavaScript, el foco va al primer campo con error tras cada envío (lección 61). Depende de resultado, que es un objeto nuevo en cada respuesta."
    },
    {
      "fragmento": "defaultValue={valores?.nombre}",
      "nota": "Sin JavaScript, el servidor vuelve a pintar el campo con lo que se escribió. Con JavaScript, el campo nunca se desmonta y conserva lo escrito igualmente."
    },
    {
      "fragmento": "aria-invalid={errores.nombre ? true : undefined}",
      "nota": "Con error, el campo se anuncia como no válido y su mensaje queda enlazado con aria-describedby (lección 37)."
    }
  ]
}
```

En el artículo, la sección de las cartas con `id="cartas"`: un `<p role="status">` con «Gracias, Ana: tu carta ya está publicada.» cuando `cartaNueva` es una de la lista, la lista y el `<FormularioCarta resultado={actionData} />`. `actionData` es la otra prop que reciben los módulos de ruta: lo que devolvió la `action`, o `undefined` si no se ha enviado nada.

Esto es lo que manda el servidor en lugar del `<Form>`:

```html
<form noValidate="" class="formulario-carta" data-discover="true" action="/articulos/las-comillas-que-pide-la-ortografia#cartas" method="post">
```

Un formulario HTML de toda la vida: `method="post"` y una dirección. No necesita JavaScript para funcionar.

### Sin JavaScript

Compruébalo. En las herramientas de desarrollo de Chrome, abre el menú de comandos (Ctrl + Mayús + P, o Cmd + Mayús + P en macOS), escribe «Disable JavaScript» y recarga. Envía una carta con el correo `ana@correo` y el texto «Muy bien»; después corrígela y envíala otra vez. Lo comprobamos en Chromium y en WebKit con JavaScript desactivado, y el navegador pidió esto:

```text
GET  /articulos/componer-una-linea-a-mano              → 200   la página
POST /articulos/componer-una-linea-a-mano              → 400   la página otra vez, con los dos errores y los campos rellenos
POST /articulos/componer-una-linea-a-mano              → 302   la carta, guardada
GET  /articulos/componer-una-linea-a-mano?carta=40ff…  → 200   la página, con «Gracias, Ana Lahoz: tu carta ya está publicada.»
```

El primer `POST` lo resuelve entero el servidor: ejecuta la `action`, que devuelve los errores, y después renderiza la página con ellos. Por eso los mensajes son los del servidor, y por eso el correo `ana@correo`, que el navegador habría aceptado, no pasa. Y el ancla importa: sin ella, la página con los errores se abría arriba del todo, con el primer mensaje 1437 píxeles más abajo, fuera de una ventana de 800 de alto.

## Paso 6: con JavaScript, el estado del envío (`FormularioCarta.tsx` y `articulo.tsx`)

Vuelve a activar JavaScript. Todo sigue funcionando igual, pero sin recargar: React Router intercepta el envío y lo hace con un `fetch`. Falta lo que solo tiene sentido con JavaScript: decir que se está enviando, y vaciar el formulario cuando la carta se ha publicado.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// FormularioCarta.tsx\n  const navegacion = useNavigation()\n  const enviando = navegacion.state === 'submitting'\n\n      <button type=\"submit\" disabled={enviando}>\n        {enviando ? 'Enviando…' : 'Enviar la carta'}\n      </button>\n\n// articulo.tsx\n        {/* Con key: cuando se publica una carta nueva, el formulario se monta\n            de nuevo y queda vacío (lección 26). */}\n        <FormularioCarta key={cartaNueva ?? 'nueva'} resultado={actionData} />",
  "anotaciones": [
    {
      "fragmento": "const navegacion = useNavigation()",
      "nota": "La navegación en curso de React Router: idle, loading (cargando los datos de otra página) o submitting (enviando un formulario)."
    },
    {
      "fragmento": "navegacion.state === 'submitting'",
      "nota": "Mientras la action trabaja. Un Form normal provoca una navegación, así que su estado es el de toda la página; un useFetcher tiene el suyo propio (paso 7)."
    },
    {
      "fragmento": "disabled={enviando}",
      "nota": "Sin JavaScript, esto no existe: el navegador ya enseña que está cargando. Es una mejora encima de algo que ya funcionaba."
    },
    {
      "fragmento": "key={cartaNueva ?? 'nueva'}",
      "nota": "Cuando se publica una carta, cartaNueva cambia, y con ella la key: React desmonta el formulario y monta uno vacío (lección 26)."
    }
  ]
}
```

¿Por qué hace falta la `key`? Porque con JavaScript nadie vacía el formulario:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// articulo.tsx, sin la key\n<FormularioCarta resultado={actionData} />\n\n// Con JavaScript, Ana escribe su carta y pulsa «Enviar la carta».\n// La action la guarda y redirige a /articulos/la-raya-no-es-un-guion?carta=…\n// La página enseña «Gracias, Ana Lahoz: tu carta ya está publicada.»\n// ¿Qué hay en el formulario?",
  "opciones": [
    "Está vacío: la redirección recarga la página",
    "Sigue con el nombre y la carta de Ana",
    "Está vacío, porque React vuelve a montar la página al cambiar la URL",
    "Sale con los valores de actionData"
  ],
  "correcta": 1,
  "explicacion": "Con JavaScript, la redirección es una navegación de React Router a la misma ruta: el componente Articulo no se desmonta, FormularioCarta tampoco, y sus campos, que no son controlados, conservan lo que tenían en el DOM. Comprobado: sin la key, el nombre seguía siendo «Ana Lahoz». Sin JavaScript no pasa, porque cada envío trae una página nueva."
}
```

### Lo que va por la red

Esto es lo que pidió Chromium, con JavaScript, desde que se abre la portada hasta que se publica una carta (WebKit pidió exactamente lo mismo):

```text
document GET  /                                           → 200   la primera visita: HTML
fetch    GET  /__manifest?paths=…                         → 200   qué rutas hay detrás de los enlaces
fetch    GET  /articulos/componer-una-linea-a-mano.data   → 200   clic en un artículo: solo datos
fetch    POST /articulos/componer-una-linea-a-mano.data   → 400   una carta con errores
fetch    POST /articulos/componer-una-linea-a-mano.data   → 202   la carta corregida
fetch    GET  /articulos/componer-una-linea-a-mano.data?carta=6f60…  → 200
```

- **Navegar no pide HTML.** Después de la primera visita, un clic en un `Link` pide `.data`: el servidor ejecuta el `loader` y devuelve solo los datos. Para comprobar que no había recarga, dejamos una marca en `window` antes de navegar, y seguía allí después de navegar y de enviar dos veces.
- **`/__manifest`**: React Router no manda al navegador la lista de todas las rutas de golpe; la pide a medida que aparecen enlaces en la página.
- **El 400 no vuelve a pedir nada.** La documentación de React Router lo dice: solo una respuesta 2xx de la `action` hace que se vuelvan a pedir los datos de la página. Unos errores de validación no cambian nada en el servidor.
- **Lo que va bien, sí.** La `action` redirige; a ese `POST` hecho con `fetch` el servidor responde con un 202 en vez de un 302, y React Router pide los datos de la dirección de destino, esta misma página con `?carta=`. Su `loader` se ejecuta otra vez, y la lista de cartas llega con la nueva. Es la **revalidación**: después de cambiar algo en el servidor, los datos de la página se vuelven a pedir solos.

## Paso 7: el boletín, sin cambiar de página (`routes.ts`, `boletin.tsx` y `FormularioBoletin.tsx`)

El pie de todas las páginas tiene un formulario para recibir el boletín de la revista, un correo al mes con los artículos nuevos. En la rama `main` es un `<Form>` como el de las cartas, que envía a `/boletin`, una ruta que todavía no existe. Regístrala en `routes.ts` con `route('boletin', 'routes/boletin.tsx')` y escribe la `action` en ese módulo. La validación ya está hecha en `datos/boletin.server.ts`, con la misma expresión que la de las cartas:

```tsx
export async function action({ request }: Route.ActionArgs) {
  const resultado = validarSuscripcion(await request.formData())
  if (!resultado.ok) return data(resultado, { status: 400 })
  await apuntarAlBoletin(resultado.correo)
  return resultado
}
```

Un correo mal escrito responde con un 400, como una carta (paso 5). Uno bueno **no redirige a ninguna parte: devuelve datos**, porque quien se apunta tiene que quedarse donde estaba. El componente de la ruta, `PaginaBoletin`, ya viene hecho; enseguida verás para qué sirve.

Con la ruta y la `action`, el formulario del pie ya apunta correos. Ahora apúntate desde la mitad de un artículo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// FormularioBoletin.tsx, en la rama main\n<Form method=\"post\" action=\"/boletin\" noValidate className=\"boletin\">\n  {/* el campo del correo y el botón «Apuntarme» */}\n</Form>\n\n// Con JavaScript, Ana lee «La raya no es un guion», baja hasta el pie,\n// escribe su correo y pulsa «Apuntarme». La action responde { ok: true, … }.\n// ¿Qué pasa?",
  "opciones": [
    "Se apunta y sigue en el artículo, a la misma altura",
    "El navegador recarga la página entera y la deja otra vez en el artículo",
    "Acaba en /boletin, arriba del todo y con una entrada nueva en el historial, aunque sin recargar",
    "Nada: un Form solo puede enviar a la action de su propia ruta"
  ],
  "correcta": 2,
  "explicacion": "Un Form es una navegación, con JavaScript o sin él: cambia la URL, añade una entrada al historial y pinta la página de destino. Comprobado: la URL pasó de /articulos/la-raya-no-es-un-guion a /boletin, history.length de 2 a 3 y el scroll de 1162 a 0. La marca que dejamos en window seguía allí: React Router no recarga, pero te saca del artículo."
}
```

Es lo que la lección «El router también carga y envía datos» resolvía con la estrella de favoritos de El Clavijero: un envío que no tiene que cambiar de página. **`useFetcher` da un envío con su propio estado, que no navega.** Aquí, su `action` está en el servidor:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useEffect, useRef } from 'react'\nimport { useFetcher } from 'react-router'\nimport type { action } from '~/routes/boletin'\n\n/**\n * El boletín, en el pie de todas las páginas. Con un fetcher, apuntarse no es\n * una navegación: la URL, el historial y la página se quedan como estaban.\n * Sin JavaScript, es un formulario normal que lleva a /boletin.\n */\nexport default function FormularioBoletin() {\n  // Un envío con su propio estado. typeof action le da el tipo de fetcher.data.\n  const fetcher = useFetcher<typeof action>()\n  const enviando = fetcher.state !== 'idle'\n  const resultado = fetcher.data\n  const error = resultado && !resultado.ok ? resultado.error : undefined\n  const formulario = useRef<HTMLFormElement>(null)\n\n  // Apuntado: el campo se vacía. Nadie lo hace por ti, porque no hay navegación\n  // y el formulario sigue montado.\n  useEffect(() => {\n    if (resultado?.ok) formulario.current?.reset()\n  }, [resultado])\n\n  // defaultShouldRevalidate={false}: apuntarse no cambia nada de lo que enseña\n  // la página, así que no hace falta volver a pedir sus datos.\n  return (\n    <fetcher.Form\n      method=\"post\"\n      action=\"/boletin\"\n      defaultShouldRevalidate={false}\n      noValidate\n      ref={formulario}\n      className=\"boletin\"\n    >\n      <label htmlFor=\"boletin-correo\">Recibe el boletín: un correo al mes con los artículos nuevos</label>\n      <div className=\"boletin-fila\">\n        <input\n          id=\"boletin-correo\"\n          name=\"correo\"\n          type=\"email\"\n          autoComplete=\"email\"\n          required\n          aria-invalid={error ? true : undefined}\n          aria-describedby={error ? 'boletin-respuesta' : undefined}\n        />\n        <button type=\"submit\" disabled={enviando}>\n          {enviando ? 'Apuntándote…' : 'Apuntarme'}\n        </button>\n      </div>\n      <p id=\"boletin-respuesta\" role=\"status\" className={error ? 'boletin-respuesta error' : 'boletin-respuesta'}>\n        {resultado?.ok ? `Hecho: te escribiremos a ${resultado.correo}.` : error}\n      </p>\n    </fetcher.Form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import type { action } from '~/routes/boletin'",
      "nota": "Solo el tipo: con import type, la línea desaparece al compilar, y ni la action ni boletin.server llegan al navegador."
    },
    {
      "fragmento": "const fetcher = useFetcher<typeof action>()",
      "nota": "Un fetcher para este formulario, con su propio estado. typeof action le da a fetcher.data el tipo de lo que devuelve la action: { ok: true, correo } o { ok: false, error, correo }."
    },
    {
      "fragmento": "const enviando = fetcher.state !== 'idle'",
      "nota": "idle, submitting o loading, como el useNavigation del paso 6, pero solo de este envío. Comprobado en un test: mientras el boletín se envía, useNavigation sigue en idle, así que el botón de las cartas no se entera."
    },
    {
      "fragmento": "if (resultado?.ok) formulario.current?.reset()",
      "nota": "Sin navegación, el formulario sigue montado y nadie vacía el campo. En el paso 6 lo resolvía la key; aquí basta con reset() cuando la respuesta dice ok."
    },
    {
      "fragmento": "action=\"/boletin\"",
      "nota": "A qué ruta se envía. Sin action, un formulario envía a la ruta en la que está pintado, y el pie es de root: lo verás en los errores típicos."
    },
    {
      "fragmento": "defaultShouldRevalidate={false}",
      "nota": "Tras una action que va bien, React Router vuelve a pedir los datos de la página (paso 6). Apuntarse no cambia nada de lo que se ve, así que aquí se ahorra esa petición."
    },
    {
      "fragmento": "role=\"status\"",
      "nota": "El párrafo está siempre, vacío al principio: cuando cambia su texto, el lector de pantalla anuncia la respuesta (lección 37)."
    }
  ]
}
```

Sin JavaScript, `fetcher.Form` pinta lo mismo que el `<Form>` de antes, un formulario de toda la vida:

```html
<form noValidate="" class="boletin" data-discover="true" action="/boletin" method="post">
```

### Lo que va por la red

Con JavaScript, desde un artículo, primero con un correo mal escrito y después con el bueno, estas fueron las peticiones del boletín en Chromium (en WebKit, las mismas):

```text
fetch    POST /boletin.data   → 400   «Escribe un correo válido, como nombre@ejemplo.es.», junto al campo
fetch    POST /boletin.data   → 200   «Hecho: te escribiremos a ana@correo.es.», y el campo, vacío
```

La URL, `history.length`, el scroll y la marca que dejamos en `window` siguieron igual. Y **después del 200 no hay ninguna petición más**: es el `defaultShouldRevalidate={false}`. Sin él, justo después del `POST` salió un `GET /articulos/la-raya-no-es-un-guion.data → 200`: el `loader` del artículo volvía a leer las cartas, que no habían cambiado.

Sin JavaScript no hay forma de quedarse: el navegador va a donde diga `action`, y lo que vuelve es la página de `/boletin`. Para eso está `PaginaBoletin`, que pinta lo que devolvió la `action` con `actionData`:

```text
GET  /articulos/componer-una-linea-a-mano   → 200
POST /boletin                               → 400   «Escribe un correo válido, como nombre@ejemplo.es. Vuelve a intentarlo en el formulario del pie.»
POST /boletin                               → 200   «Hecho: te escribiremos a ana@correo.es cada vez que salga un número.»
```

La misma `action` responde a los dos: con JavaScript, lo que devuelve llega a `fetcher.data`; sin él, al `actionData` de la página de `/boletin`. Los cinco tests del paso comprueban la ruta y la `action` (`boletin.test.ts`) y el formulario (`formulario-boletin.test.tsx`), montado en un artículo de mentira con `createRoutesStub`: después de apuntarse, el artículo tiene que seguir ahí.

## Paso 8: la hora de publicación, igual en los dos lados (`app/fechas.ts`)

Cada artículo dice cuándo se publicó: «21 de octubre de 2026 a las 9:30». En la rama `main`, `formatearFecha` es así:

```tsx
export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
```

En tu ordenador funciona, y no hay ningún aviso. Es el error de la lista de la lección 87 que más cuesta ver, «fechas según el idioma o la zona horaria del usuario», porque **en tu ordenador el servidor y el navegador están en la misma zona horaria**. En producción, no: los servidores suelen estar en UTC, y tus lectores, en Madrid o en Buenos Aires.

Para verlo, arranca el servidor de desarrollo como si fuera uno de producción, en UTC: `TZ=UTC npm run dev` en macOS o Linux (en Windows, con PowerShell, `$env:TZ = "UTC"; npm run dev`). Abre un artículo con el navegador en hora peninsular. El servidor escribe «a las 7:30»; el navegador, al hidratar, calcula «a las 9:30». En la consola sale este error (comprobado en Chromium; recortamos el camino de componentes, que empieza mucho más arriba, en `App`):

```text
Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...
                      <p className="firma">
                        <FechaPublicacion fecha="2026-10-21...">
                          <time dateTime="2026-10-21T09:30:00+02:00">
+                           21 de octubre de 2026 a las 9:30
-                           21 de octubre de 2026 a las 7:30
```

Es el mensaje que tradujo la lección 87, y la diferencia señala justo el `<time>`: `+` es lo que pintó el navegador; `-`, lo que mandó el servidor. Antes sale otro aviso, «Encountered a script tag while rendering React component», que solo aparece cuando la hidratación falla: no hay ningún `<Suspense>` por encima de la fecha, así que React regenera **el documento entero**, y al crear de nuevo los `<script>` de React Router avisa de que esos no se ejecutarán. Un texto de veinte caracteres ha tirado toda la página. Con el build de producción (`TZ=UTC npm start`), lo mismo llega minificado, como en la lección 64: `Minified React error #418`, en Chromium y en WebKit.

El arreglo no es callar el aviso con `suppressHydrationWarning`, que dejaría en la página la hora del servidor (lección 87). Es que **el texto no dependa de dónde se ejecuta**. La revista publica en hora peninsular, así que la zona horaria se fija:

```tsx
  return new Date(iso).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
```

Con el servidor en UTC, la página se hidrata sin un aviso y dice «a las 9:30»: comprobado en Chromium con el navegador en Madrid y en Ciudad de México, y en WebKit en Madrid. El test del paso lo hace en jsdom: genera el HTML con `renderToString` y `process.env.TZ = 'UTC'`, cambia la zona a `Europe/Madrid` e hidrata con `hydrateRoot`, apuntando lo que llega a `onRecoverableError`.

## Paso 9: «hace dos días», solo en el navegador (`reloj.ts` y `HaceCuanto.tsx`)

Junto a la fecha, la portada dice cuánto hace: «· anteayer», «· hace 2 semanas». En la rama `main` está así:

```tsx
export default function HaceCuanto({ fecha }: { fecha: string }) {
  // TODO (paso 9): el servidor no sabe cuándo vas a leer la página. Si el HTML
  // se generó antes (una caché, un prerenderizado), la hidratación falla.
  // Lee el instante con useAhora() de ~/reloj: null en el servidor y al
  // hidratar (y entonces no pintes nada), y la hora del navegador después.
  return <span className="hace-cuanto"> · {haceCuanto(fecha, Date.now())}</span>
}
```

Y aquí ni siquiera `TZ=UTC` lo destapa: el servidor genera el HTML y el navegador lo hidrata un instante después, los dos calculan «anteayer» y no hay diferencia. **El fallo aparece cuando el HTML se generó antes de que alguien lo lea**: si una caché lo guarda una hora, si se prerenderiza al construir, o si el servidor escribe «hace 59 minutos» y el navegador hidrata cuando ya es «hace 1 hora». El servidor no puede saber cuándo vas a leer la página. Los tests lo simulan con un reloj falso: generan el HTML el 21 de octubre a las 12:30 y lo hidratan dos días después. Con la versión de `main` fallan los tres tests del paso; estos son los dos primeros, recortados:

```text
FAIL  pruebas/hace-cuanto.test.tsx > … > el servidor no escribe cuánto hace: no sabe cuándo se va a leer la página
AssertionError: expected '<span class="hace-cuanto"> · <!-- -->…' to be '' // Object.is equality

+ <span class="hace-cuanto"> · <!-- -->hace 3 horas</span>

FAIL  pruebas/hace-cuanto.test.tsx > … > un HTML generado hace dos días se hidrata sin errores, y después dice «anteayer»
+   "Error: Hydration failed because the server rendered text didn't match the client. …
```

La solución es la que la lección 87 dio para lo que solo sabe el navegador: `useSyncExternalStore` con un `getServerSnapshot`. Esta vez el almacén externo **cambia de verdad**, porque el tiempo pasa:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useSyncExternalStore } from 'react'\n\nconst MINUTO = 60_000\n\nfunction suscribirse(avisar: () => void) {\n  // Cada minuto, React vuelve a leer la hora y repinta si ha cambiado.\n  const id = setInterval(avisar, MINUTO)\n  return () => clearInterval(id)\n}\n\n// Redondeada al minuto: dos lecturas seguidas devuelven el mismo número, y\n// React no ve un cambio en cada render.\nconst ahoraEnElNavegador = () => Math.floor(Date.now() / MINUTO) * MINUTO\n\n// En el servidor y durante la hidratación: «no lo sé».\nconst ahoraEnElServidor = () => null\n\n/** El instante actual, redondeado al minuto, o null si todavía no se sabe. */\nexport function useAhora(): number | null {\n  return useSyncExternalStore(suscribirse, ahoraEnElNavegador, ahoraEnElServidor)\n}\n\n// app/componentes/HaceCuanto.tsx\nexport default function HaceCuanto({ fecha }: { fecha: string }) {\n  const ahora = useAhora()\n  if (ahora === null) return null\n  return <span className=\"hace-cuanto\"> · {haceCuanto(fecha, ahora)}</span>\n}",
  "anotaciones": [
    {
      "fragmento": "const id = setInterval(avisar, MINUTO)",
      "nota": "La suscripción: cada minuto, avisa a React de que la hora puede haber cambiado. Devuelve su limpieza, como cualquier suscripción de la lección 46."
    },
    {
      "fragmento": "const ahoraEnElNavegador = () => Math.floor(Date.now() / MINUTO) * MINUTO",
      "nota": "Redondeada al minuto. Con Date.now() a secas, dos lecturas seguidas darían números distintos y React lo tomaría por un almacén que cambia sin parar: la trampa de «The result of getSnapshot should be cached» de la lección 46."
    },
    {
      "fragmento": "const ahoraEnElServidor = () => null",
      "nota": "El getServerSnapshot. React lo usa al renderizar en el servidor y también al hidratar, así que el primer render del navegador pinta lo mismo que el HTML: nada."
    },
    {
      "fragmento": "if (ahora === null) return null",
      "nota": "Ni «hace…» ni un hueco: el servidor no escribe nada, y justo después de hidratar React vuelve a renderizar con la hora del navegador."
    }
  ]
}
```

Con `reloj.ts` y `HaceCuanto.tsx` así, pasan los tres tests del paso. En el navegador se nota en lo que tarda la firma en completarse: el HTML llega sin «anteayer», y aparece en cuanto React hidrata. En las navegaciones posteriores no hay hidratación, y `useSyncExternalStore` usa directamente la hora del navegador.

En tu proyecto no puedes ver este fallo en directo sin una caché delante. Aquí sí: el simulador de la lección 87 tiene el HTML que generó de verdad `renderToString` con la versión arreglada, y la tuya tiene que hidratarse sobre él.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Lo último de Caja Baja, sin romper la hidratación",
  "consigna": "Pulsa «Hidratar»: falla, porque HaceCuanto calcula cuánto hace en el primer render y el servidor, que no sabe cuándo vas a leer la página, no lo escribió. Arréglalo en HaceCuanto.jsx con useSyncExternalStore: una suscripción con un setInterval de un minuto, la hora del navegador redondeada al minuto y un getServerSnapshot que devuelva null. Con null, no pintes nada. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "HaceCuanto.jsx",
      "codigo": "import { haceCuanto } from './fechas'\n\nexport default function HaceCuanto({ fecha }) {\n  // Tu trabajo: el servidor no sabe cuándo vas a leer la página, así que no\n  // escribió cuánto hace. En el primer render del navegador, esto tampoco\n  // tiene que pintar nada; el «hace…» llega justo después de hidratar.\n  return <span className=\"hace-cuanto\"> · {haceCuanto(fecha, Date.now())}</span>\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Simulador from './Simulador'\nimport Ultimos from './Ultimos'\nimport './estilos.css'\n\n// Lo que manda el servidor de Caja Baja, generado de verdad con\n// renderToString(<Ultimos />). El servidor no sabe cuándo vas a leer la\n// página, así que no escribe cuánto hace que se publicó cada artículo.\nconst HTML_DEL_SERVIDOR =\n  '<section><h1>Caja Baja</h1><ul class=\"ultimos\"><li><p class=\"seccion\">Oficio</p><h2>Caja alta y caja baja: de dónde salen las mayúsculas</h2><p class=\"firma\">Inés Lasheras<!-- --> · <time dateTime=\"2026-10-21T09:30:00+02:00\">21 de octubre de 2026 a las 9:30</time></p></li><li><p class=\"seccion\">Pantalla</p><h2>Un punto no es un píxel</h2><p class=\"firma\">Daniel Ferrer<!-- --> · <time dateTime=\"2026-10-14T18:00:00+02:00\">14 de octubre de 2026 a las 18:00</time></p></li><li><p class=\"seccion\">Ortotipografía</p><h2>La raya no es un guion</h2><p class=\"firma\">Marta Bielsa<!-- --> · <time dateTime=\"2026-09-16T11:00:00+02:00\">16 de septiembre de 2026 a las 11:00</time></p></li></ul></section>'\n\nexport default function App() {\n  return (\n    <Simulador htmlDelServidor={HTML_DEL_SERVIDOR}>\n      <Ultimos />\n    </Simulador>\n  )\n}\n"
    },
    {
      "nombre": "Ultimos.jsx",
      "codigo": "import HaceCuanto from './HaceCuanto'\n\n// La fecha ya va escrita: así no depende de cómo formatea las fechas cada\n// navegador. En el proyecto la escribe formatearFecha (paso 7).\nconst ARTICULOS = [\n  {\n    slug: 'caja-alta-y-caja-baja',\n    seccion: 'Oficio',\n    titulo: 'Caja alta y caja baja: de dónde salen las mayúsculas',\n    autoria: 'Inés Lasheras',\n    publicado: '2026-10-21T09:30:00+02:00',\n    fecha: '21 de octubre de 2026 a las 9:30',\n  },\n  {\n    slug: 'un-punto-no-es-un-pixel',\n    seccion: 'Pantalla',\n    titulo: 'Un punto no es un píxel',\n    autoria: 'Daniel Ferrer',\n    publicado: '2026-10-14T18:00:00+02:00',\n    fecha: '14 de octubre de 2026 a las 18:00',\n  },\n  {\n    slug: 'la-raya-no-es-un-guion',\n    seccion: 'Ortotipografía',\n    titulo: 'La raya no es un guion',\n    autoria: 'Marta Bielsa',\n    publicado: '2026-09-16T11:00:00+02:00',\n    fecha: '16 de septiembre de 2026 a las 11:00',\n  },\n]\n\nexport default function Ultimos() {\n  return (\n    <section>\n      <h1>Caja Baja</h1>\n      <ul className=\"ultimos\">\n        {ARTICULOS.map((articulo) => (\n          <li key={articulo.slug}>\n            <p className=\"seccion\">{articulo.seccion}</p>\n            <h2>{articulo.titulo}</h2>\n            <p className=\"firma\">\n              {articulo.autoria} · <time dateTime={articulo.publicado}>{articulo.fecha}</time>\n              <HaceCuanto fecha={articulo.publicado} />\n            </p>\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "fechas.jsx",
      "codigo": "const MINUTO = 60_000\nconst HORA = 60 * MINUTO\nconst DIA = 24 * HORA\n\nconst relativa = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })\n\n// «hace 5 minutos», «ayer», «hace 3 semanas»... entre una fecha y un instante.\nexport function haceCuanto(iso, ahora) {\n  const diferencia = Date.parse(iso) - ahora\n  const distancia = Math.abs(diferencia)\n  if (distancia < MINUTO) return 'ahora mismo'\n  if (distancia < HORA) return relativa.format(Math.round(diferencia / MINUTO), 'minute')\n  if (distancia < DIA) return relativa.format(Math.round(diferencia / HORA), 'hour')\n  if (distancia < 7 * DIA) return relativa.format(Math.round(diferencia / DIA), 'day')\n  if (distancia < 30 * DIA) return relativa.format(Math.round(diferencia / (7 * DIA)), 'week')\n  if (distancia < 365 * DIA) return relativa.format(Math.round(diferencia / (30 * DIA)), 'month')\n  return relativa.format(Math.round(diferencia / (365 * DIA)), 'year')\n}\n"
    },
    {
      "nombre": "Simulador.jsx",
      "codigo": "import { useEffect, useLayoutEffect, useRef, useState } from 'react'\nimport { hydrateRoot } from 'react-dom/client'\n\n// Imita lo que pasa en el navegador cuando una página viene del servidor:\n// 1. Llega el HTML y se pinta tal cual, todavía sin JavaScript.\n// 2. Al pulsar «Hidratar» «llega el JavaScript» y se llama a hydrateRoot.\n// No hace falta que lo leas entero: lo interesante está en los otros archivos.\n\nconst SIN_JS = 'Solo HTML: el JavaScript todavía no ha llegado'\n\nfunction AvisarAlTerminar({ alTerminar, children }) {\n  useEffect(() => {\n    alTerminar()\n  }, [alTerminar])\n  return children\n}\n\nexport default function Simulador({ htmlDelServidor, children }) {\n  const pagina = useRef(null)\n  const raiz = useRef(null)\n  const [estado, setEstado] = useState(SIN_JS)\n\n  useLayoutEffect(() => {\n    pagina.current.innerHTML = htmlDelServidor\n  }, [htmlDelServidor])\n\n  useEffect(() => {\n    return () => {\n      const anterior = raiz.current\n      if (anterior) setTimeout(() => anterior.unmount())\n    }\n  }, [])\n\n  function hidratar() {\n    const errores = []\n    setEstado('Hidratando…')\n    const alTerminar = () =>\n      setEstado(errores.length === 0 ? 'Hidratación sin errores' : 'La hidratación ha fallado: mira la consola')\n    raiz.current = hydrateRoot(\n      pagina.current,\n      <AvisarAlTerminar alTerminar={alTerminar}>{children}</AvisarAlTerminar>,\n      {\n        onRecoverableError(error) {\n          errores.push(error)\n          console.error(error.message)\n        },\n      },\n    )\n  }\n\n  return (\n    <div className=\"simulador\">\n      <p className=\"rotulo\">Página recibida del servidor</p>\n      <div className=\"pagina\" ref={pagina} />\n      <div className=\"mandos\">\n        <button onClick={hidratar} disabled={estado !== SIN_JS}>\n          Hidratar\n        </button>\n        <p role=\"status\">{estado}</p>\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".simulador {\n  display: grid;\n  gap: 0.5rem;\n  font-family: system-ui, sans-serif;\n}\n\n.rotulo {\n  margin: 0;\n  color: #475569;\n  font-size: 0.85rem;\n}\n\n/* La ventana donde se pinta el HTML que mandó el servidor */\n.pagina {\n  padding: 0.75rem 1rem;\n  border: 2px dashed #a4261d;\n  border-radius: 10px;\n  background: #fbf8f1;\n  color: #1d1b18;\n  font-family: Georgia, serif;\n}\n\n.pagina h1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.5rem;\n}\n\n.ultimos {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.ultimos li {\n  padding: 0.6rem 0;\n  border-top: 2px solid #1d1b18;\n}\n\n.seccion {\n  margin: 0;\n  color: #a4261d;\n  font: 700 0.7rem system-ui, sans-serif;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n}\n\n.ultimos h2 {\n  margin: 0.15rem 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.firma {\n  margin: 0;\n  color: #5b554c;\n  font: 0.85rem system-ui, sans-serif;\n}\n\n.hace-cuanto {\n  color: #a4261d;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n.mandos p {\n  margin: 0;\n  color: #334155;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #a4261d;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "HaceCuanto.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Hidratar», React adopta el HTML del servidor sin encontrar diferencias",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Hidratar"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Hidratación sin errores"
      }
    },
    {
      "descripcion": "Después de hidratar, cada artículo dice cuánto hace que se publicó",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Hidratar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "9:30 ·"
      }
    }
  ]
}
```

Con estado y un efecto (`montado`, de la lección 87) también pasa, a costa de un render de más. Lo que no vale es `suppressHydrationWarning` en el `<span>`: lo probamos y la hidratación sigue fallando, porque aquí no difiere un texto, **sobra un elemento entero**, y esa diferencia de estructura no se puede silenciar.

## Paso 10: cuánto tarda cada petición, con un middleware (`tiempos.server.ts`, `root.tsx` y `articulo.tsx`)

Cada `loader` y cada `action` hace lo suyo, pero hay trabajo que es de todas las rutas a la vez: medir cuánto tarda cada petición, comprobar una sesión, añadir una cabecera a todas las respuestas. Para eso React Router tiene **middleware: funciones que envuelven a los `loader` y las `action` de una petición**, de la ruta madre a la hija y vuelta. En la 7 había que activarlo con `future.v8_middleware`; **en la 8 está siempre activo**, y por eso el `context` que reciben los `loader` y las `action` es siempre un `RouterContextProvider`, lo uses o no (los tests de este proyecto le pasan uno a cada `loader`: está en `pruebas/peticion.ts`).

La revista va a medir cuánto tarda cada petición en el servidor y a contárselo al navegador con la cabecera **`Server-Timing`**, que, según MDN, sirve para enseñar en las herramientas de desarrollo del navegador lo que tarda cada parte del trabajo del servidor. El middleware mide el total; el `loader` del artículo, lo que tarda en leer las cartas del disco. Para que el `loader` le pase su medida, el middleware le deja un sitio en el **context**:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { createContext, type MiddlewareFunction } from 'react-router'\n\n/** Lo que tarda cada parte de una petición, en milisegundos: «cartas», «total»... */\nexport type Tiempos = Map<string, number>\n\n// El sitio del context donde el middleware deja los tiempos de cada petición.\n// Vale null si no hay middleware: por ejemplo, en un test que llama a un loader.\nexport const tiemposContext = createContext<Tiempos | null>(null)\n\n/** Ejecuta una tarea y apunta lo que ha tardado, con su nombre. */\nexport async function medir<T>(tiempos: Tiempos | null, nombre: string, tarea: () => Promise<T>): Promise<T> {\n  const inicio = performance.now()\n  try {\n    return await tarea()\n  } finally {\n    tiempos?.set(nombre, performance.now() - inicio)\n  }\n}\n\n/**\n * Envuelve cada petición que llega a React Router, de documento o de datos.\n * Antes de next(), deja en el context dónde apuntar los tiempos; después, con\n * la respuesta ya hecha, añade el total, la cabecera Server-Timing y una línea\n * en la terminal.\n */\nexport const registrarTiempos: MiddlewareFunction<Response> = async ({ request, context }, next) => {\n  const inicio = performance.now()\n  const tiempos: Tiempos = new Map()\n  context.set(tiemposContext, tiempos)\n\n  const respuesta = await next()\n\n  tiempos.set('total', performance.now() - inicio)\n  const cabecera = [...tiempos].map(([nombre, ms]) => `${nombre};dur=${ms.toFixed(1)}`).join(', ')\n  respuesta.headers.set('Server-Timing', cabecera)\n  console.log(`${request.method} ${new URL(request.url).pathname} → ${respuesta.status} · ${cabecera}`)\n  return respuesta\n}",
  "anotaciones": [
    {
      "fragmento": "export const tiemposContext = createContext<Tiempos | null>(null)",
      "nota": "createContext de react-router, no el de React: una clave con tipo para guardar y leer un valor en el context de una petición. El null es su valor por defecto; sin él, leer la clave cuando nadie la ha puesto lanza «No value found for context»."
    },
    {
      "fragmento": "tiempos?.set(nombre, performance.now() - inicio)",
      "nota": "En el finally: la medida se apunta aunque la tarea falle. Con tiempos a null, en un test sin middleware, no se apunta nada."
    },
    {
      "fragmento": "async ({ request, context }, next) => {",
      "nota": "Recibe lo mismo que un loader (request, url, params y context) y, además, next."
    },
    {
      "fragmento": "context.set(tiemposContext, tiempos)",
      "nota": "Antes de next: un Map nuevo para cada petición. Los loader y las action de cualquier ruta lo encuentran con context.get."
    },
    {
      "fragmento": "const respuesta = await next()",
      "nota": "Aquí se ejecutan los loader o la action y, en una petición de documento, se renderiza el HTML. next no lanza: si algo falla por debajo, devuelve la respuesta del ErrorBoundary."
    },
    {
      "fragmento": "respuesta.headers.set('Server-Timing', cabecera)",
      "nota": "Después de next, la respuesta ya existe. La documentación de React Router pide que un middleware de servidor solo lea el estado y las cabeceras y añada cabeceras: el cuerpo no se toca."
    },
    {
      "fragmento": "${new URL(request.url).pathname}",
      "nota": "request.url es la petición tal cual, con su .data. La dirección de la página, sin .data, llega en url."
    }
  ]
}
```

En la rama `main`, `tiempos.server.ts` trae hechos `tiemposContext` y `medir`; lo tuyo es el middleware. Se exporta desde un módulo de ruta, y desde `root.tsx`, que en `main` exporta la lista vacía, envuelve a todas. El `loader` del artículo saca los tiempos del `context` y mide la lectura de las cartas:

```tsx
// app/root.tsx
import { registrarTiempos } from './tiempos.server'

export const middleware: Route.MiddlewareFunction[] = [registrarTiempos]

// app/routes/articulo.tsx
export async function loader({ params, request, context }: Route.LoaderArgs) {
  // ...buscar el artículo, como en el paso 3...
  const tiempos = context.get(tiemposContext)
  return {
    articulo,
    cartas: await medir(tiempos, 'cartas', () => leerCartas(articulo.slug)),
    // ...lo demás, igual...
  }
}
```

`root.tsx` importa un módulo `.server` y el build no se queja: `middleware` desaparece del JavaScript del navegador igual que `loader` y `action`, y con él su `import` (comprobado: ni `registrarTiempos` ni `Server-Timing` aparecen en `build/client`). Cada ruta puede exportar el suyo: los de las madres se ejecutan antes y terminan después, como las capas de una cebolla. En una petición de un artículo, el orden es este:

```text
middleware de root, antes de next()     deja el Map en el context
  loader del artículo                   apunta «cartas»
  (en una visita: el HTML)
middleware de root, después de next()   apunta «total», pone Server-Timing y escribe la línea
```

### Lo que apunta

Este es el registro de `npm run dev` en un recorrido: abrir un artículo, ir a otro, mandar una carta con errores, la misma corregida y apuntarse al boletín. Los tiempos son los del ordenador en el que lo probamos:

```text
GET /articulos/componer-una-linea-a-mano → 200 · cartas;dur=0.1, total;dur=4.2
GET /articulos/caja-alta-y-caja-baja.data → 200 · cartas;dur=0.1, total;dur=0.7
POST /articulos/caja-alta-y-caja-baja.data → 400 · total;dur=1.2
POST /articulos/caja-alta-y-caja-baja.data → 302 · total;dur=1.3
GET /articulos/caja-alta-y-caja-baja.data → 200 · cartas;dur=0.2, total;dur=0.5
POST /boletin.data → 200 · total;dur=1.2
```

- **Solo pasa por él lo que llega a React Router**: las peticiones de documento y las `.data`. Los archivos de JavaScript y CSS, las imágenes de `/og` y las consultas a `/__manifest` no salen.
- **La carta con errores no lleva `cartas`**: la `action` no las lee, y tras un 400 no se vuelven a pedir los datos (paso 6). La corregida, sí: detrás del `POST` va el `GET` de la revalidación.
- **El middleware ve la redirección tal cual, un 302**, aunque el navegador reciba el 202 del paso 6: React Router la convierte después, ya fuera del middleware. Con `npm start` se ve, porque el servidor apunta su propia línea detrás de la nuestra:

```text
POST /articulos/la-raya-no-es-un-guion.data → 302 · total;dur=1.2
POST /articulos/la-raya-no-es-un-guion.data 202 - - 1.681 ms
```

- **`request.url` es la petición tal cual**, con su `.data`: en la 8, React Router ya no la retoca. La dirección de la página, sin `.data` ni los parámetros internos, llega en `url`; en el segundo `GET`, `/articulos/caja-alta-y-caja-baja`.

La cabecera viaja en cada respuesta:

```text
$ curl -s -D - -o /dev/null http://localhost:3000/articulos/la-raya-no-es-un-guion | grep -i server-timing
server-timing: cartas;dur=0.1, total;dur=2.5
```

Y en el navegador, JavaScript la lee con la API de rendimiento. En la consola, sobre un artículo recién abierto (en Chromium y en WebKit salió lo mismo, con otros números):

```js
performance.getEntriesByType('navigation')[0].serverTiming.map(({ name, duration }) => ({ name, duration }))
// [{ name: 'cartas', duration: 0.1 }, { name: 'total', duration: 1.6 }]
```

Las navegaciones posteriores tienen la suya en `performance.getEntriesByType('resource')`, en la entrada de cada `.data`. Los tres tests del paso (`pruebas/tiempos.test.ts`) llaman al middleware con un `next` de mentira que hace de `loader`, y al `loader` del artículo con un `context` preparado a mano.

### Lo que sí viaja al navegador: `clientMiddleware` y `splitRouteModules`

El `middleware` no llega al navegador. Su pareja, **`clientMiddleware`**, sí: envuelve cada navegación en el navegador, tenga la ruta `loader` o no. La revista no lo necesita, pero sirve para ver otra novedad de la 8. Con este en `articulo.tsx`:

```tsx
export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  async (_, next) => {
    const inicio = performance.now()
    await next()
    console.log(`Navegación al artículo: ${Math.round(performance.now() - inicio)} ms`)
  },
]
```

el build saca dos archivos para el artículo, donde antes había uno:

```text
build/client/assets/articulo-client-middleware-CxnaqHBt.js    0.16 kB │ gzip:  0.15 kB
build/client/assets/articulo-main-DTxjWKKA.js                 4.69 kB │ gzip:  1.68 kB
```

Es **`splitRouteModules`**, que en la 7 se activaba con `future.v8_splitRouteModules` y en la 8 viene **activo por defecto**. React Router parte cada módulo de ruta y saca a su propio archivo lo que el navegador ejecuta antes de pintar la ruta: `clientLoader`, `clientAction`, `clientMiddleware` y `HydrateFallback`. Así puede empezar a ejecutarlos mientras el componente todavía se descarga. Al pulsar un artículo en la portada, el navegador pidió los dos archivos en el mismo milisegundo, y después los datos:

```text
633 ms  → /assets/articulo-client-middleware-CxnaqHBt.js
633 ms  → /assets/articulo-main-DTxjWKKA.js
672 ms  → /articulos/la-raya-no-es-un-guion.data
```

La opción se cambia en `react-router.config.ts`. Con `splitRouteModules: false`, vuelve a haber un solo `articulo-….js`, de 4,84 kB, con todo dentro. Con `splitRouteModules: 'enforce'`, el build falla si una ruta no se puede partir, por ejemplo porque el `clientMiddleware` y el componente usan la misma función: «This export could not be split into its own chunk because it shares code with other exports», es decir, esa exportación comparte código con las demás. La revista no exporta nada de eso, así que su build sale con un archivo por ruta y la opción no se nota.

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm test pasa entero?",
      "texto": "Treinta tests: las rutas, los loader, el 404, las etiquetas del head, la action y su validación, el formulario, el boletín, las dos fechas y el middleware."
    },
    {
      "titulo": "¿npm run typecheck no marca nada?",
      "texto": "Genera los tipos de las rutas y comprueba los de todo el proyecto, tests incluidos. El build no los comprueba: hay que pedirlo aparte."
    },
    {
      "titulo": "¿El HTML trae el artículo y su tarjeta?",
      "texto": "npm run build, npm start y curl de un artículo: el h1, el title, la descripción y las og:, con la imagen en URL absoluta. Y un 404 de verdad en una dirección inventada, de artículo y de cualquier otra cosa."
    },
    {
      "titulo": "¿Las cartas funcionan sin JavaScript?",
      "texto": "Con JavaScript desactivado: un envío con errores vuelve con los mensajes del servidor y los campos rellenos, y uno bueno publica la carta. Recargar después no la publica dos veces."
    },
    {
      "titulo": "¿Y con JavaScript, sin recargar?",
      "texto": "En la pestaña Red, al navegar y al enviar solo hay peticiones .data, cada una con su cabecera Server-Timing, y el botón dice «Enviando…» mientras tanto. Tras publicar, el formulario queda vacío."
    },
    {
      "titulo": "¿El boletín te deja donde estabas?",
      "texto": "Apúntate desde la mitad de un artículo: la URL y el scroll no cambian, la respuesta sale en el pie y no hay más petición que el POST a /boletin.data. Sin JavaScript, acabas en /boletin con la misma respuesta."
    },
    {
      "titulo": "¿La consola sigue limpia con el servidor en UTC?",
      "texto": "TZ=UTC npm run dev y un artículo abierto: ni «Hydration failed» ni el aviso de los script."
    },
    {
      "titulo": "¿Nada del servidor en build/client?",
      "texto": "Busca una frase de un artículo o un correo de las cartas iniciales en los archivos de build/client. No tiene que aparecer en ninguno."
    }
  ]
}
```

## Errores típicos

**Un `<Form>` sin `method`.** Parece que funciona: pulsas, la página no se recarga, no hay ningún error. Pero la carta no se publica.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "<Form action={`${pathname}#cartas`} noValidate className=\"formulario-carta\">\n  {/* nombre, correo y carta, como siempre */}\n</Form>\n\n// Con JavaScript, Ana rellena el formulario bien y pulsa «Enviar la carta».\n// ¿Qué pasa?",
  "opciones": [
    "Se publica igual: Form envía a la action por defecto",
    "React Router avisa en la consola de que falta method",
    "La página navega a la misma dirección con ?nombre=…&correo=…&texto=… en la URL, se ejecuta el loader y la carta no se guarda",
    "El navegador recarga la página entera y envía un POST"
  ],
  "correcta": 2,
  "explicacion": "Como un form de HTML, Form envía con GET si no le dices otra cosa: los campos van a la URL y se ejecuta el loader, no la action. Lo comprobamos: la URL llevaba correo=ana@correo.es, y el servidor apuntó esa misma URL en su registro. Un correo en la URL queda en el historial, en los registros y en cualquier enlace que se copie."
}
```

**Un `<form>` en minúscula.** Al revés que el anterior, este sí publica la carta, porque un formulario HTML con `method="post"` no necesita a React Router. Pero el navegador lo envía él, y la página **se recarga entera**: comprobado, la marca que dejamos en `window` desaparecía, y el navegador pidió un `POST` de documento y otro `GET`, sin ninguna petición `.data`. Funciona como sin JavaScript, sin «Enviando…» ni foco en los errores. Con mayúscula, `Form` es lo mismo más la mejora.

**Lanzar los errores de validación.** Con `throw data({ errores, valores }, { status: 400 })` en vez de `return`, el envío con errores sustituye el artículo entero por su `ErrorBoundary`: comprobado, la página pasó a decir «No hemos podido cargar este artículo». Un `ErrorBoundary` es para lo que impide pintar la página; un campo mal escrito no lo impide. La documentación de React Router lo dice con estas palabras: los límites de error «are not intended for rendering form validation errors».

**Devolver los errores con un 200.** Si la `action` devuelve los errores sin `data()` y sin estado, la respuesta es un 200, y React Router da por hecho que algo ha cambiado: tras el `POST`, vuelve a pedir `/articulos/….data`. Una petición de más, con todas sus consultas, cada vez que alguien se equivoca de correo. Con el 400, no hay ninguna.

**Una página «no encontrada» con un 200.** Pintar «Esta página no existe» no la convierte en un 404. Sin el `loader` del paso 3, `/lo-que-sea` enseña ese texto y responde 200 (comprobado con `curl`), y un buscador puede indexarla como una página más. El estado lo pone la respuesta, no el texto.

**Una `og:image` relativa.** `/og/la-raya-no-es-un-guion.png` funciona en tu página, pero el robot que genera la tarjeta la descarga desde fuera de tu web, y Open Graph pide una URL absoluta (lecciones 4 de HTML y 81). Por eso la calcula el `loader`, que conoce el dominio.

**Importar un módulo `.server` desde un componente.** Lo viste en el paso 2: es un error de build, no de ejecución, y es justo lo que quieres. Sin el sufijo, el mismo `import` no da ningún error y se lleva tus datos al navegador.

**Un `fetcher.Form` sin `action` en el pie.** Sin `action`, un formulario envía a la ruta en la que está pintado, y el pie está en el `Layout` de `root.tsx`. Como root no tiene `action`, React Router ni siquiera hace la petición: comprobado, la página entera pasó al `ErrorBoundary` de root, «Algo ha fallado», y en la consola salió esto:

```text
Route "root" does not have an action, but you are trying to submit to it. To fix this, please add an `action` function to the route
```

Es decir: «la ruta root no tiene action, pero intentas enviarle algo». Al formulario de las cartas, si no fuera por el ancla, le bastaría con no llevar `action`, porque está dentro del artículo, cuya ruta sí la tiene; el del boletín vive en todas las páginas, así que tiene que decir adónde va.

**Usar el `context` como un objeto.** En la 7, si no activabas el middleware, el `context` de los `loader` era un objeto normal, y muchos ejemplos de entonces hacen `context.tiempos = tiempos`. En la 8 es un `RouterContextProvider`, y TypeScript no te deja:

```text
app/tiempos.server.ts(32,11): error TS2339: Property 'tiempos' does not exist on type 'Readonly<RouterContextProvider>'.
```

Es decir: «la propiedad tiempos no existe en el tipo RouterContextProvider». Los valores se guardan con `context.set` y se leen con `context.get`, con una clave hecha con `createContext`.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Renderizar en el servidor es usar Server Components",
      "realidad": "Aquí cada componente se ejecuta dos veces: en el servidor, para el HTML, y en el navegador, para hidratar, así que su código se descarga. Lo que no llega al navegador son los loader, las action y los módulos .server. Los Server Components (lección 88) no se descargan nunca, y en React Router siguen siendo experimentales."
    },
    {
      "mito": "Al navegar, el loader se ejecuta en el navegador",
      "realidad": "Se ejecuta en el servidor (o al construir, si prerenderizas). En la primera visita, para generar el HTML; después, cuando React Router pide /<ruta>.data con un fetch. Lo que se ejecuta en el navegador es clientLoader, si lo exportas."
    },
    {
      "mito": "Si el formulario funciona sin JavaScript, el servidor ya no necesita validar",
      "realidad": "Es al revés: sin JavaScript, el servidor es el único que valida. Y con JavaScript también, porque cualquiera puede mandar un POST a esa dirección sin pasar por tu página (lección 89)."
    },
    {
      "mito": "Un 404 es una página que dice que no existe",
      "realidad": "Es un código de estado de la respuesta. La página puede decir lo que quiera; un buscador mira el número."
    },
    {
      "mito": "El middleware del servidor se ejecuta en cada navegación",
      "realidad": "Solo cuando el navegador le pide algo al servidor: un documento o un .data. Lo comprobamos con un enlace a /boletin, una ruta sin loader: al navegar, el navegador solo descargó su JavaScript, y en la terminal no salió ninguna línea. Para lo que tenga que pasar en cada navegación está clientMiddleware."
    }
  ]
}
```

## Retos para ampliarlo

Sin comprobación automática, salvo la que escribas tú.

1. **Prerenderizar los artículos.** Añade a `react-router.config.ts` una función `prerender` que devuelva la portada y las seis direcciones de los artículos, construye y mira qué aparece en `build/client`. Después piensa en dos cosas: las cartas se guardan mientras el servidor está en marcha (¿qué pasa con las de una página prerenderizada?), y el HTML se genera al construir, que es justo el caso del paso 9.
2. **Caché en los artículos.** Exporta una función `headers` en `articulo.tsx` que devuelva un `Cache-Control` y compruébalo con `curl -I`. ¿Qué duración tiene sentido para una página cuyas cartas cambian? ¿Y qué pasaría con «hace dos días» si una caché la guarda?
3. **Datos estructurados.** Añade a cada artículo un `<script type="application/ld+json">` con su tipo (Article), su título, su autoría y su fecha. Cuidado con cómo metes el JSON dentro del `<script>`: si un título contuviera la etiqueta que cierra el script, `JSON.stringify` no basta (lección 82).
4. **Un buscador que carga sin navegar.** Una ruta `/buscar` con un `loader` que filtre los artículos por `?q=`, y en la cabecera un campo dentro de un `fetcher.Form` con `method="get"` y `action="/buscar"`, que enseñe las sugerencias de `fetcher.data` sin cambiar de página. Envíalo mientras se escribe con `fetcher.submit(evento.currentTarget.form)`, como en la guía «Using Fetchers», y piensa qué tiene que devolver el `loader`: ¿los artículos enteros, o solo el título y el slug (paso 2)?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-proyectos/revista (rama main, punto de partida)",
      "descripcion": "La revista con los estilos, los datos y los tests, y los TODO de cada paso.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/main/revista",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-proyectos/revista (rama solucion)",
      "descripcion": "El proyecto terminado, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/solucion/revista",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Route Module",
      "descripcion": "Todo lo que puede exportar un módulo de ruta: loader, action, ErrorBoundary, headers, meta (con el aviso de que desde React 19 se prefieren las etiquetas de React) y la revalidación.",
      "url": "https://reactrouter.com/start/framework/route-module",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Actions",
      "descripcion": "action y clientAction, cómo se llaman con Form, useSubmit y useFetcher, y la revalidación de los datos de la página.",
      "url": "https://reactrouter.com/start/framework/actions",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Middleware",
      "descripcion": "middleware y clientMiddleware, el context con createContext, el orden de la cadena con next y cuándo se ejecuta cada uno.",
      "url": "https://reactrouter.com/how-to/middleware",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Progressive Enhancement",
      "descripcion": "Por qué los enlaces y formularios de React Router funcionan antes de que llegue el JavaScript, y cómo se mejoran después.",
      "url": "https://reactrouter.com/explanation/progressive-enhancement",
      "etiqueta": "React Router"
    },
    {
      "titulo": ".server modules",
      "descripcion": "Los módulos y carpetas que solo existen en el servidor, y el error de build que te protege.",
      "url": "https://reactrouter.com/api/framework-conventions/server-modules",
      "etiqueta": "React Router"
    },
    {
      "titulo": "hydrateRoot",
      "descripcion": "La hidratación por dentro y las causas de los errores de hidratación, entre ellas las fechas.",
      "url": "https://react.dev/reference/react-dom/client/hydrateRoot",
      "etiqueta": "react.dev"
    }
  ]
}
```
