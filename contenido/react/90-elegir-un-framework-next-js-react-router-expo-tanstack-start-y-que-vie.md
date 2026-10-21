# Elegir un framework (Next.js, React Router, Expo, TanStack Start) y qué viene después

- **Módulo:** React en el servidor
- **Slug:** `elegir-un-framework-next-js-react-router-expo-tanstack-start-y-que-viene-despues` (autogenerado del título)
- **Orden:** 900
- **Fuentes:** [Creating a React App](https://react.dev/learn/creating-a-react-app) + [Next.js](https://nextjs.org/docs) + [React Router: Framework](https://reactrouter.com/start/framework/installation) + [Expo](https://docs.expo.dev/) + [TanStack Start](https://tanstack.com/start/latest) — ver `contenido/react/TEMARIO.md` #90

---

## Qué es y para qué sirve

Todos los proyectos de este temario, y esta misma web, son de **Vite + React**: un `index.html` casi vacío, un paquete de JavaScript y el navegador haciendo el resto. Funciona, y en muchos casos es lo que conviene. Pero a estas alturas has visto sus límites: sin servidor no hay HTML con contenido (lección 87), ni Server Components (88), ni Server Functions (89).

La documentación de React lo resume en una frase: «si quieres crear una app o un sitio web nuevos con React, te recomendamos empezar con un framework». Y a la vez, la misma página recuerda que se puede empezar desde cero «si solo quieres aprender lo básico», que es lo que ha hecho este temario.

Esta lección no te dice cuál elegir, porque **no hay un ganador**. Te da lo necesario para decidir tú: cuándo Vite sigue siendo suficiente, qué aporta cada uno de los cuatro frameworks de la lista (Next.js, React Router, Expo y TanStack Start), con datos que he comprobado hoy, y qué estudiar después de este temario. El hilo es la **Cooperativa Hortelana El Surco**, que necesita tres cosas distintas: una web pública con las noticias y las cestas de la campaña, un panel interno para que las socias consulten el reparto, y una aplicación para los repartidores.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los datos son de hoy, y esto cambia rápido",
  "contenido": "Las versiones y fechas salen de npm (npm view) a 21 de octubre de 2026, y lo que cada framework dice de sí mismo, de su documentación de hoy. Todos publican casi cada semana: antes de decidir, comprueba la versión y la documentación actuales. Lo que sí he hecho es construir y ejecutar la misma página en tres de ellos, y crear la plantilla del cuarto, para no contarte de memoria lo que hacen."
}
```

## Lo que da Vite + React, y lo que no

Con Vite + React tienes un editor rápido, un `dist/` de archivos estáticos que sube cualquier hosting (lección 85), y todo lo demás lo eliges tú: React Router (76 y 77), TanStack Query (78), tu manera de estilar (79). Es un **cascarón** que el navegador rellena. Esto es lo que sirve el `dist/index.html` de la plantilla de `npm create vite` con React, construida hoy:

```html
<title>vite-app</title>
...
<body>
  <div id="root"></div>
</body>
```

Es lo mismo para **cualquier** dirección de tu app. Todo lo que hay en pantalla lo escribe el JavaScript después de descargarlo y ejecutarlo. Para una aplicación detrás de un inicio de sesión no importa. Para una página que alguien tiene que encontrar, compartir o abrir con una conexión mala, sí.

La misma página en los frameworks. Construí y arranqué «una noticia de la cooperativa» (`/noticias/campana-de-la-naranja`) en Next.js, React Router en modo framework y TanStack Start, y pedí el HTML con `curl`, sin ejecutar JavaScript:

```text
Next.js 16.4.2          title: sí  ·  h1: sí  ·  meta description: sí   (en el HTML, sin JavaScript)
React Router 8.5.0      title: sí  ·  h1: sí  ·  meta description: sí
TanStack Start 1.169.3  title: sí  ·  h1: sí  ·  meta description: sí
Vite + React            title: «vite-app», el mismo en toda ruta  ·  sin h1  ·  sin descripción

GET /noticias/xx        →  HTTP 404 en los tres frameworks
```

En los tres, el título, el `h1` y la descripción están **ya en el HTML**. Un rastreador o una vista previa de enlace que lea solo el HTML los ve. Y el servidor puede contestar 404 de verdad, no una página «no encontrada» con código 200.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Vite + React basta si…",
      "texto": "Es una aplicación detrás de un inicio de sesión (paneles, herramientas internas, editores) donde nadie tiene que encontrarla en un buscador. O la web es sobre todo interactiva y los datos los sirve una API que ya existe. O estás aprendiendo. Y desplegar archivos estáticos te va bien."
    },
    {
      "titulo": "Un framework conviene si…",
      "texto": "Hay páginas públicas que se comparten y se buscan (noticias, fichas, catálogo). O quieres que lo primero que ve el usuario sea contenido y no una pantalla en blanco. O necesitas código de servidor junto a la interfaz (formularios, sesiones, base de datos). O quieres rutas y datos resueltos de una manera estándar."
    },
    {
      "titulo": "No obligan a tener un servidor",
      "texto": "La documentación de React lo dice así: todos los frameworks de su lista admiten renderizado en el cliente, aplicaciones de una sola página y generación estática, y se pueden publicar en un CDN. El servidor se activa ruta por ruta, cuando hace falta."
    },
    {
      "titulo": "Pasar de uno a otro es posible",
      "texto": "La documentación de React Router incluye guías para llevar un proyecto con rutas en componentes (como el de las lecciones 76 y 77) al modo framework, y la de TanStack Start tiene una para migrar desde Next.js. Empezar con Vite no es una decisión irreversible."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// La Cooperativa Hortelana El Surco necesita tres piezas:\n//\n// A. La web pública: noticias y cestas de la campaña. Se comparte por\n//    WhatsApp y se busca en Google.\n// B. El panel de socias: tras iniciar sesión, consultan sus repartos.\n// C. La ficha de cada cesta, con un enlace que la cooperativa pone\n//    en sus carteles y en el correo.\n//\n// ¿Qué pieza gana MENOS con HTML renderizado en el servidor?",
  "opciones": [
    "A, la web pública",
    "B, el panel de socias tras iniciar sesión",
    "C, la ficha de cada cesta"
  ],
  "correcta": 1,
  "explicacion": "El panel está detrás de un inicio de sesión: ningún buscador ni vista previa de enlace puede entrar, y quien lo usa ya está dispuesto a esperar a que cargue. A y C son contenido público que se enlaza y se comparte, donde el HTML con contenido sí marca la diferencia. Aun así, un framework puede servir bien un panel: no es que no valga, es que la ventaja principal no se nota ahí."
}
```

## Los cuatro de la lista

React mantiene una página con los frameworks que recomienda («Creating a React App»). Hoy lista **tres como recomendados**, Next.js, React Router y Expo, y **dos como emergentes**: TanStack Start y RedwoodSDK. (También hay otros fuera de esa página, como Waku, que el aviso de seguridad de la lección 89 nombra.) La página va a veces por detrás de las novedades: dice «React Router (v7)» cuando la última es la 8.5.0, y «TanStack Start (Beta)» cuando su propia documentación lo da por estable.

Esto es lo que dice npm hoy, 21 de octubre de 2026, de cada uno (la fecha es la de publicación de esa versión):

```text
                 versión     publicada     Node que pide
Next.js          16.4.2      15 oct 2026   >= 20.9
React Router     8.5.0       19 oct 2026   >= 22.22
Expo (SDK 58)    58.0.17     21 oct 2026   ^22.13 || ^24.3 || ^26.0 || >=27.0
TanStack Start   1.169.3     16 oct 2026   >= 22.12

Referencias:     React 19.3.1 (14 oct)   ·   React Native 0.88.0 (15 oct)   ·   Vite 8.3.5 (21 oct)
```

La plantilla de cada uno, creada hoy con su comando oficial y sin instalar nada:

```text
npm create vite@latest              react 19.3.1 · JavaScript · Oxlint
create-next-app@latest --yes        next 16.4.2 + React 19.3.0 · TypeScript, Tailwind, ESLint, Turbopack
create-react-router@latest          react-router 8.5.0 + React ^19.2.8 · TypeScript, Tailwind, Dockerfile
create-expo-app@latest              expo ~58.0.17 + React 19.3.0 + react-native 0.88.0 · ~80 archivos
@tanstack/cli create --blank        @tanstack/react-start 1.169.3 + React ^19.2.0 · TypeScript
```

(La de Expo es mucho más grande porque trae iconos, componentes de ejemplo y pestañas ya hechas.)

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los cuatro, en una línea",
  "roles": [
    {
      "etiqueta": "Next.js 16.4.2",
      "rol": "Vercel · App Router, el más completo con RSC",
      "descripcion": "Rutas por carpetas, Server Components y Server Functions de serie. Se despliega en Node, en Docker o como exportación estática."
    },
    {
      "etiqueta": "React Router 8.5.0",
      "rol": "Shopify · tu router de la lección 76, con servidor",
      "descripcion": "Modo framework: plugin de Vite, loaders y actions por ruta, SSR, SPA o prerenderizado. Los Server Components son experimentales."
    },
    {
      "etiqueta": "Expo SDK 58",
      "rol": "Expo · apps nativas con React Native 0.88",
      "descripcion": "Android, iOS y web desde un proyecto, con rutas por archivos (Expo Router). Los componentes no son del DOM: View, Text..."
    },
    {
      "etiqueta": "TanStack Start 1.169.3",
      "rol": "TanStack · sobre TanStack Router, con Vite",
      "descripcion": "SSR con streaming, rutas con tipos completos y server functions propias (createServerFn). Estable según su web; RSC experimental."
    }
  ]
}
```

### Next.js

El de más historia y el que **react.dev llama la implementación más completa** de la arquitectura de Server Components. Lo mantiene Vercel, que además ofrece hosting; pero react.dev recuerda que se puede desplegar en cualquier proveedor con Node.js o Docker, o en tu propio servidor. `npx create-next-app@latest --yes` crea hoy un proyecto con TypeScript, Tailwind, ESLint, App Router y Turbopack.

Lo que aporta: rutas por carpetas (`app/noticias/[slug]/page.js`), Server Components por defecto (lección 88), Server Functions con `'use server'` (89), y herramientas de metadatos, imágenes y fuentes propias. Lo que conviene saber: que **la exportación estática** (`output: 'export'`) no admite Server Actions, ni cookies, ni redirecciones, entre otras (lo dice su documentación), y que trae su propia copia de React, en lugar de la que instales.

Esta es la página de la noticia, probada en Next.js 16.4.2:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// app/noticias/[slug]/page.js\nimport { notFound } from 'next/navigation'\n\nconst noticias = new Map([\n  ['campana-de-la-naranja', {\n    titulo: 'Abre la campaña de la naranja',\n    resumen: 'Reparto desde el 3 de noviembre en tres puntos del pueblo.',\n  }],\n])\n\nexport async function generateMetadata({ params }) {\n  const { slug } = await params\n  const noticia = noticias.get(slug)\n  return noticia\n    ? { title: noticia.titulo, description: noticia.resumen }\n    : { title: 'No encontrada' }\n}\n\nexport default async function Noticia({ params }) {\n  const { slug } = await params\n  const noticia = noticias.get(slug)\n  if (!noticia) notFound()\n\n  return (\n    <article>\n      <h1>{noticia.titulo}</h1>\n      <p>{noticia.resumen}</p>\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "// app/noticias/[slug]/page.js",
      "nota": "La ruta sale de la carpeta: noticias/[slug] responde a /noticias/lo-que-sea y entrega lo que va en [slug] como parámetro. Sin configurar nada."
    },
    {
      "fragmento": "export default async function Noticia({ params })",
      "nota": "Un Server Component (lección 88): async, sin directiva. Corre en el servidor, así que podría leer una base de datos directamente. En Next.js 16 params es una promesa: hay que esperarla con await."
    },
    {
      "fragmento": "export async function generateMetadata({ params })",
      "nota": "Genera el title y la description de esta página en el servidor. Es el equivalente a lo que la lección 81 hacía con los componentes title y meta, y aquí acaban en el HTML que se manda."
    },
    {
      "fragmento": "if (!noticia) notFound()",
      "nota": "Responde 404 de verdad (lo comprobé con curl: /noticias/xx devolvió 404) y pinta la página de no encontrado."
    }
  ]
}
```

### React Router (modo framework)

Es el router de las lecciones 76 y 77, con una capa más. React Router tiene **tres modos**, aditivos: declarativo (`<BrowserRouter>`, el que has usado), datos (`createBrowserRouter` con `loader` y `action`) y **framework**, que añade un plugin de Vite, rutas definidas en un archivo, tipos generados y estrategias de renderizado: servidor, una sola página o prerenderizado. Lo mantiene Shopify y `npx create-react-router@latest` crea el proyecto. Su documentación aconseja el modo framework a quien no tiene opinión formada y a quien viene de Next.js.

Lo que aporta: **`loader`** para leer datos antes de pintar, **`action`** para los envíos de formulario, páginas de error, y SSR o SPA con un interruptor en `react-router.config.ts` (`ssr: true` o `ssr: false`). Lo que conviene saber: sus **Server Components siguen siendo experimentales** (su documentación avisa de que pueden cambiar en versiones menores), y la 8.5.0 pide Node 22.22 o superior.

La misma noticia, con un formulario para que te avisen, probada en React Router 8.5.0 (la ruta se registra en `app/routes.ts` con `route("noticias/:slug", "routes/noticia.tsx")`):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// app/routes/noticia.tsx\nimport { data } from \"react-router\";\nimport type { Route } from \"./+types/noticia\";\n\nconst noticias = new Map([\n  [\"campana-de-la-naranja\", {\n    titulo: \"Abre la campaña de la naranja\",\n    resumen: \"Reparto desde el 3 de noviembre en tres puntos del pueblo.\",\n  }],\n]);\n\nexport async function loader({ params }: Route.LoaderArgs) {\n  const noticia = noticias.get(params.slug);\n  if (!noticia) throw data(\"No existe esa noticia\", { status: 404 });\n  return noticia;\n}\n\nexport function meta({ loaderData }: Route.MetaArgs) {\n  if (!loaderData) return [{ title: \"No encontrada\" }];\n  return [\n    { title: loaderData.titulo },\n    { name: \"description\", content: loaderData.resumen },\n  ];\n}\n\nexport async function action({ request }: Route.ActionArgs) {\n  const formData = await request.formData();\n  const correo = String(formData.get(\"correo\") ?? \"\");\n  if (!correo.includes(\"@\")) return { error: \"Escribe un correo válido.\" };\n  return { ok: `Te avisaremos en ${correo}.` };\n}\n\nexport default function Noticia({ loaderData, actionData }: Route.ComponentProps) {\n  return (\n    <article>\n      <h1>{loaderData.titulo}</h1>\n      <p>{loaderData.resumen}</p>\n      <form method=\"post\">\n        <label>Correo <input name=\"correo\" type=\"email\" /></label>\n        <button type=\"submit\">Avisadme</button>\n      </form>\n      {actionData?.error && <p role=\"alert\">{actionData.error}</p>}\n      {actionData?.ok && <p role=\"status\">{actionData.ok}</p>}\n    </article>\n  );\n}",
  "anotaciones": [
    {
      "fragmento": "export async function loader({ params }: Route.LoaderArgs)",
      "nota": "Se ejecuta en el servidor antes de pintar. Lo que devuelve llega al componente ya resuelto, sin useEffect ni estado de carga (comparar con la lección 52). Los tipos Route.* los genera react-router typegen a partir de routes.ts."
    },
    {
      "fragmento": "throw data(\"No existe esa noticia\", { status: 404 })",
      "nota": "Responde 404 con ese estado HTTP (lo comprobé: /noticias/xx devolvió 404) y activa el ErrorBoundary de la ruta."
    },
    {
      "fragmento": "export function meta({ loaderData }: Route.MetaArgs)",
      "nota": "El título y la descripción de la página, calculados con los datos del loader y escritos en el HTML. En la versión 8 el argumento se llama loaderData; en la 7 se llamaba data y estaba ya marcado como obsoleto."
    },
    {
      "fragmento": "export async function action({ request }: Route.ActionArgs)",
      "nota": "Recibe los envíos del formulario como una Request normal de la web. Es el equivalente, en este router, de una Server Function; aquí no hay directiva use server ni nada que importar desde el cliente."
    },
    {
      "fragmento": "<form method=\"post\">",
      "nota": "Un formulario HTML corriente. Probé el POST sin JavaScript y devolvió «Escribe un correo válido.» con «sin-arroba» y «Te avisaremos en ana@correo.es.» con un correo válido. Con JavaScript, React Router lo envía sin recargar la página."
    }
  ]
}
```

### TanStack Start

Se construye sobre **TanStack Router** (rutas con tipos de extremo a extremo, parámetros de búsqueda tipados) y se compila con Vite o Rsbuild. Ofrece renderizado en el servidor con streaming, rutas de servidor y **server functions propias**. Un detalle de vocabulario: se escriben con `createServerFn()`, **no con la directiva `'use server'`**; son otra API, con la misma idea que la lección 89. Se crea con `npx @tanstack/cli@latest create`.

Dos avisos de honestidad. Primero, **la página de React lo llama «Beta»** y la de TanStack dice que «TanStack Start es estable»: la segunda es más reciente, pero comprueba la que te corresponda. Segundo, su documentación incluye una tabla que lo compara con Next.js y React Router; está escrita por TanStack, así que léela como la opinión de una de las partes (aunque es detallada y avisa de que no establece un ganador en rendimiento). Sus Server Components son **experimentales**, y se activan a propósito.

La misma noticia, probada en TanStack Start 1.169.3:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/routes/noticias.$slug.tsx\nimport { createFileRoute, notFound } from '@tanstack/react-router'\nimport { createServerFn } from '@tanstack/react-start'\n\nconst noticias = new Map([\n  ['campana-de-la-naranja', {\n    titulo: 'Abre la campaña de la naranja',\n    resumen: 'Reparto desde el 3 de noviembre en tres puntos del pueblo.',\n  }],\n])\n\nconst leerNoticia = createServerFn()\n  .validator((slug: string) => slug)\n  .handler(async ({ data: slug }) => {\n    const noticia = noticias.get(slug)\n    if (!noticia) throw notFound()\n    return noticia\n  })\n\nexport const Route = createFileRoute('/noticias/$slug')({\n  loader: ({ params }) => leerNoticia({ data: params.slug }),\n  head: ({ loaderData }) => ({\n    meta: [\n      { title: loaderData?.titulo ?? 'No encontrada' },\n      { name: 'description', content: loaderData?.resumen ?? '' },\n    ],\n  }),\n  component: Noticia,\n})\n\nfunction Noticia() {\n  const noticia = Route.useLoaderData()\n  return (\n    <article>\n      <h1>{noticia.titulo}</h1>\n      <p>{noticia.resumen}</p>\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export const Route = createFileRoute('/noticias/$slug')",
      "nota": "El nombre del archivo (noticias.$slug.tsx) y la ruta que se declara dentro tienen que coincidir; TanStack Router genera de ahí los tipos de enlaces y parámetros."
    },
    {
      "fragmento": "const leerNoticia = createServerFn()",
      "nota": "Una server function de TanStack: se define con una función, no con una directiva. Se puede llamar desde el loader, desde un componente o desde otra server function. Al ser una llamada de red, trátala igual que las de la lección 89."
    },
    {
      "fragmento": ".validator((slug: string) => slug)",
      "nota": "El validador de entrada. En mi primera prueba usé inputValidator, que aparece en algunos ejemplos, y el servidor ni arrancó: inputValidator is not a function. En la 1.169.3 y en su documentación de hoy se llama validator. Y ojo: ese tipo es de TypeScript, no frena a un atacante; para eso hace falta validar de verdad (Zod, por ejemplo)."
    },
    {
      "fragmento": "loader: ({ params }) => leerNoticia({ data: params.slug })",
      "nota": "El loader llama a la server function. En la primera visita corre en el servidor y el resultado va ya en el HTML (lo comprobé con curl)."
    }
  ]
}
```

En el navegador, al pulsar un botón que llamaba a otra server function (`avisar`), la pestaña Red mostró esto:

```text
POST /_serverFn/492baec349a097cf4afa52dbe0e04807c02ee63426b92f603a69ccc26a3a501c   200
cuerpo:    JSON serializado con el formato de TanStack Start; dentro va  data → "ana@correo.es"
respuesta: JSON con el mismo formato; dentro va  result → ok → "Te avisaremos en ana@correo.es."
```

(Lo resumimos: el JSON real anida cada valor con claves cortas de tipo y posición, y es largo de leer. Ábrelo tú en la pestaña Red para verlo entero.)

Otra sintaxis y otro formato de mensaje, pero **la misma estructura que viste en la lección 89**: un `POST` a una dirección de tu servidor, con los argumentos en el cuerpo y el identificador de la función en la URL. Su documentación lo dice con sus palabras: las server functions son «endpoints RPC del mismo origen» de tu aplicación, y trae un middleware contra peticiones de otros orígenes que se instala solo si no defines el tuyo.

### Expo (React Native)

Expo es otra cosa: **un framework para apps nativas** de Android y iOS (y web), construido sobre React Native. Lo mantiene la empresa Expo; construir es gratis y puedes publicar en las tiendas sin restricciones, y tiene servicios en la nube de pago opcionales (así lo cuenta react.dev). Se crea con `npx create-expo-app@latest`. La plantilla de hoy trae **Expo SDK 58, React Native 0.88.0, React 19.3.0** y **Expo Router**, que enruta por archivos en `src/app/`.

La diferencia que importa a quien viene de la web: **no hay DOM**. No existen `div`, `p`, `button` ni CSS: hay componentes como `View` y `Text`, y los estilos se escriben con `StyleSheet`, como objetos de JavaScript. Todo lo demás (componentes, props, estado, efectos, contexto, `key`) es el React que ya sabes. Esto es parte de la plantilla real, recortado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/components/themed-text.tsx (extracto de la plantilla, SDK 58)\nimport { StyleSheet, Text, type TextProps } from 'react-native';\n\nexport function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {\n  const theme = useTheme();\n\n  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;\n}\n\nconst styles = StyleSheet.create({\n  small: {\n    fontSize: 14,\n    lineHeight: 20,\n  },\n});\n\n// src/app/index.tsx (extracto)\nexport default function HomeScreen() {\n  return (\n    <ThemedView style={styles.container}>\n      <SafeAreaView style={styles.safeArea}>\n        <ThemedText type=\"title\">Welcome to&nbsp;Expo</ThemedText>\n        {Platform.OS === 'web' && <WebBadge />}\n      </SafeAreaView>\n    </ThemedView>\n  );\n}",
  "anotaciones": [
    {
      "fragmento": "import { StyleSheet, Text, type TextProps } from 'react-native';",
      "nota": "Text, View y StyleSheet vienen de react-native, no del DOM. Un div o un p en este código no existe."
    },
    {
      "fragmento": "return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;",
      "nota": "Los estilos no son CSS ni className: son objetos, y style admite una lista que se combina. Esta envoltura es el patrón de siempre (lección 79), con otra primitiva."
    },
    {
      "fragmento": "const styles = StyleSheet.create({",
      "nota": "Los estilos se declaran fuera del componente como objetos. No hay selectores ni cascada: cada componente recibe exactamente lo que le pasas."
    },
    {
      "fragmento": "export default function HomeScreen()",
      "nota": "Esto es una pantalla. Expo Router la sirve en la ruta de su archivo (src/app/index.tsx es la de inicio) en Android, iOS y web."
    },
    {
      "fragmento": "{Platform.OS === 'web' && <WebBadge />}",
      "nota": "El mismo código sabe en qué plataforma corre. Con react-native-web, que viene en las dependencias de la plantilla, las mismas pantallas se pintan en el navegador."
    }
  ]
}
```

En la web, Expo Router tiene tres modos de salida (`web.output` en `app.json`): `single` (una SPA con un solo `index.html`), `static` (un HTML por ruta) y `server` (renderizado en cada petición, que necesita un servidor desplegado). Desde el SDK 58, la plantilla viene configurada con `server`. Sus Server Components están marcados como **experimentales y en beta**.

## Cómo llega cada uno al servidor

La pregunta que une las lecciones 88, 89 y esta: **¿cómo cambia el navegador algo en el servidor?** Cuatro respuestas distintas a un mismo problema, y una regla común:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Next.js",
      "texto": "Server Functions de React, con la directiva use server (lección 89). Usadas como action de un formulario, funcionan sin JavaScript. Con exportación estática no están disponibles."
    },
    {
      "titulo": "React Router",
      "texto": "Una action por ruta, con un formulario normal (lo probé sin JavaScript). Las Server Functions de React solo existen en su modo con Server Components, experimental, y su documentación avisa: trátalas como endpoints públicos y no dependas del middleware de rutas para autenticar."
    },
    {
      "titulo": "TanStack Start",
      "texto": "server functions propias con createServerFn: un POST a una dirección /_serverFn/ con un identificador. No usan la directiva de React."
    },
    {
      "titulo": "Expo",
      "texto": "La aplicación nativa no corre en tu servidor, así que habla con una API. Expo Router permite además rutas de API propias en la salida web (la documentación las activa por defecto con el modo server)."
    },
    {
      "titulo": "La regla común",
      "texto": "En los tres de la web, lo que recibe peticiones de tu navegador recibe peticiones de cualquiera. Valida, autentica y autoriza dentro, y actualiza las dependencias (lección 89). Cambiar de framework no cambia eso."
    }
  ]
}
```

## Sin servidor, pero con framework

Elegir un framework no te obliga a tener un servidor, pero sí **te obliga a que el código sea coherente con lo que elijas**. Un ejemplo real. Configuré React Router para no usar servidor (`ssr: false`, el modo de aplicación de una sola página) y dejé la ruta de la noticia como estaba, con su `loader` y su `action`. El build ni siquiera termina:

```text
Build failed with 1 error:
Error: SPA Mode: 2 invalid route export(s) in `routes/noticia.tsx`: `loader`, `action`.
See https://reactrouter.com/how-to/spa for more information.
```

Es decir: «Modo SPA: 2 exportaciones de ruta no válidas en `routes/noticia.tsx`: `loader`, `action`». Sin servidor, un `loader` no tiene dónde ejecutarse: en ese modo toca usar `clientLoader` y `clientAction`, que corren en el navegador. Es un error útil, porque lo ves al construir y no al desplegar. Next.js hace algo parecido con `output: 'export'`: su documentación lista lo que deja de funcionar, incluidas las Server Actions.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// react-router.config.ts\nexport default { ssr: false }\n\n// app/routes/noticia.tsx (la ruta de antes, sin tocarla)\nexport async function loader({ params }) { /* ... */ }\nexport async function action({ request }) { /* ... */ }\nexport default function Noticia() { /* ... */ }\n\n// ¿Qué pasa al ejecutar `npm run build`?",
  "opciones": [
    "Compila: el loader y el action se ejecutan en el navegador",
    "Falla con «SPA Mode: 2 invalid route export(s)»: sin servidor, un loader y un action de servidor no tienen dónde correr",
    "Compila, y el loader solo falla al visitar la página"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobé con React Router 8.5.0: el build se detiene con «SPA Mode: 2 invalid route export(s) in routes/noticia.tsx: loader, action». Para SPA hay clientLoader y clientAction, que se ejecutan en el navegador. Detectarlo al construir, y no en producción, es justo lo que esperas de un framework."
}
```

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un framework necesita siempre un servidor",
      "realidad": "Los de la lista de react.dev admiten generación estática y aplicaciones de una sola página, y se pueden publicar en un CDN. El servidor se activa ruta por ruta. Lo que sí cambia es qué funciones puedes usar: sin servidor no hay Server Functions."
    },
    {
      "mito": "Next.js es React",
      "realidad": "Next.js es un framework que usa React. Los Server Components y las Server Functions son de React, pero otras cosas son de Next.js: el enrutado por carpetas, generateMetadata, next/image. Un tutorial de uno no sirve tal cual para otro."
    },
    {
      "mito": "Expo es solo para móviles",
      "realidad": "Expo genera Android, iOS y web desde el mismo proyecto. Pero sus componentes son los de React Native (View, Text), no los del DOM, así que el código de tu web de Vite no se pega tal cual."
    },
    {
      "mito": "React Native es React en el navegador",
      "realidad": "Es el mismo React (componentes, props, estado, efectos) con otras primitivas que pintan componentes nativos de Android e iOS en vez de elementos del DOM. Lo que aprendiste de React sirve; lo que sabes de HTML y CSS, no tanto."
    },
    {
      "mito": "Si react.dev lo recomienda, mi proyecto lo necesita",
      "realidad": "La recomendación es para apps nuevas que van a producción. Un panel interno, una herramienta de equipo, un proyecto de aprendizaje o una web que ya funciona en Vite pueden seguir como están. Cambiar cuesta tiempo."
    },
    {
      "mito": "El más reciente o el más usado es el mejor",
      "realidad": "Ninguno de los cuatro es «el mejor». Cambian el modelo mental, el modo de desplegar y lo que es experimental. Mira lo que necesita tu proyecto (HTML en el servidor, móvil, equipo) y cuánto cuesta cambiar si te equivocas."
    }
  ]
}
```

## Preguntas para elegir

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "1. ¿Alguien tiene que encontrarlo o compartirlo?",
      "texto": "Si sí (noticias, fichas, catálogo), HTML con contenido: un framework con SSR o prerenderizado. Si es un panel tras un inicio de sesión, Vite basta."
    },
    {
      "titulo": "2. ¿Dónde se va a ejecutar?",
      "texto": "Archivos estáticos en un CDN, un servidor con Node.js, contenedores o un proveedor concreto. Cada framework tiene sus modos y sus límites (lo viste con ssr: false y output: export)."
    },
    {
      "titulo": "3. ¿Hay una app para móvil?",
      "texto": "Si hace falta Android e iOS con interfaz nativa, Expo con React Native es la vía que recomienda react.dev. Compartirás conocimiento de React, no los componentes del DOM."
    },
    {
      "titulo": "4. ¿Qué es experimental en lo que necesitas?",
      "texto": "Los Server Components estables hoy son los de Next.js. En React Router, TanStack Start y Expo siguen siendo experimentales según sus documentaciones. Si los necesitas desde el primer día, pesa en la decisión."
    },
    {
      "titulo": "5. ¿Qué sabe ya tu equipo?",
      "texto": "Si ya usáis React Router, el modo framework es un paso corto. Si ya sabéis Next.js, empezar por otro cuesta un aprendizaje que hay que justificar."
    },
    {
      "titulo": "6. ¿Quién mantiene las actualizaciones?",
      "texto": "Un servidor que acepta peticiones de desconocidos hay que mantenerlo al día (lección 89). Un sitio estático tiene menos superficie de ataque. No es un motivo para elegir, pero sí para contarlo."
    }
  ]
}
```

## Qué viene después

Casi al final del temario, un mapa de dónde seguir, por lo que quieras llegar a hacer, y con la lección del temario que ya cubre cada tramo:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Hacer apps para móvil: React Native",
      "texto": "Es otro temario. Empieza por el tutorial de Expo y la documentación de React Native. Del tuyo se traslada todo lo de componentes, estado, efectos y contexto; hay que aprender las primitivas nativas, el estilo con StyleSheet y la navegación."
    },
    {
      "titulo": "TypeScript",
      "texto": "Los cuatro frameworks traen hoy plantillas en TypeScript (la de Vite con React que usamos en el temario es la única en JavaScript). El módulo 10 (lecciones 72 a 74) y los proyectos avanzados en TSX son el camino."
    },
    {
      "titulo": "Accesibilidad",
      "texto": "La lección 37 y el proyecto 96 (kit de componentes accesibles). Con un framework, además, hay que cuidar el foco al navegar entre rutas."
    },
    {
      "titulo": "Rendimiento",
      "texto": "Las lecciones 65 a 69 (DevTools, memorización y React Compiler) y el proyecto 94. Mide antes de optimizar, y recuerda que un framework con SSR cambia lo que se mide."
    },
    {
      "titulo": "Pruebas",
      "texto": "Las lecciones 83 y 84 (Testing Library, esperas y red simulada). Con un framework, aparecen las pruebas de rutas, loaders y acciones."
    },
    {
      "titulo": "Un proyecto con servidor",
      "texto": "El proyecto 98 convierte el módulo 13 en práctica: una revista con React Router en modo framework, SSR, loaders y actions, y metadatos por artículo."
    },
    {
      "titulo": "Mantenerte al día",
      "texto": "Lee el blog de React y las notas de versión de lo que uses (React 19.3 salió el 9 de septiembre de 2026), activa los avisos de seguridad de tus dependencias y ejecuta npm audit de vez en cuando (lección 89)."
    }
  ]
}
```

## Errores típicos

**Elegir antes de saber qué necesitas.** El orden bueno es: ¿hay páginas públicas?, ¿dónde se despliega?, ¿hay móvil? Y solo entonces el nombre del framework. Si empiezas por el nombre, acabas justificando la elección en vez de tomarla.

**Copiar un tutorial de otra versión.** Los frameworks cambian los nombres con cada mayor. Un ejemplo que me pasó escribiendo esta lección: en React Router, `meta({ data })` era lo que mostraban los ejemplos de la 7 (ya marcado como obsoleto), pero en la 8.5.0 el argumento se llama `loaderData`, y `data` llega `undefined`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// app/routes/noticia.tsx, escrito como en un ejemplo antiguo\nexport function meta({ data }: Route.MetaArgs) {\n  return [{ title: data.titulo }]\n}\n\n// React Router 8.5.0. ¿Qué detecta cada herramienta?",
  "opciones": [
    "Nada: el título sale bien",
    "Al visitar la página, el servidor responde 500 con «Cannot read properties of undefined (reading 'titulo')»; y npm run typecheck ya lo marca antes",
    "El título sale como «undefined»"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobé. En ejecución, la petición devolvió 500 con ese TypeError, porque data es undefined en la 8. Y npm run typecheck (react-router typegen y tsc) lo avisa antes de ejecutar: error TS2339, Property 'data' does not exist. Moraleja: con TypeScript, tu editor te enseña los cambios de nombre; sin él, los descubres en producción."
}
```

**Ignorar el aviso de versión de Node.** React Router 8.5.0 pide Node 22.22 o superior. Con Node 22.12 el proyecto funcionó, pero cada comando imprimía: `Oops, Node v22.12.0 detected. react-router requires a Node version greater than 22.22.0.` Es un aviso, no un error, hasta que deja de serlo. Mira `engines` en `package.json` antes de crear el proyecto.

**Mover tu proyecto de Vite a un framework «porque toca».** Sin una necesidad concreta (HTML con contenido, código de servidor, móvil), te llevas más conceptos (Server Components, rutas de servidor, despliegue con Node) y ninguna ventaja visible. Si todo funciona y no hay un problema que resolver, no lo cambies.

**Esperar que un componente de Vite funcione en Expo.** `<div>`, `<p>`, `<button>`, `className` y los archivos CSS no existen en React Native. Hay que reescribir la capa de presentación; lo demás sí se traslada.

**Meter Server Components o Server Functions donde no los hay.** Un `'use client'` o un `'use server'` en un proyecto de Vite no hace nada. Y en un framework donde son experimentales, compruébalo en la documentación de la versión que tengas.

## Ejercicios

Esta lección es una **elección**, no una técnica, así que no hay un ejercicio con editor en vivo: ni los frameworks ni su servidor caben en la vista previa de esta web. Lo que sí puedes hacer es lo que hice yo, con un proyecto de cada y los mismos 10 minutos.

**Retos para seguir practicando** (sin comprobación automática):

1. Crea en una carpeta temporal las plantillas de Vite, Next.js y React Router (los comandos están arriba). En las dos últimas, haz que `/noticias/campana-de-la-naranja` enseñe un título y un párrafo; en la de Vite, que `App.jsx` pinte lo mismo. Con `curl`, mira el HTML que sirve cada una y escribe tres frases sobre lo que ves. ¿Cuáles entregan el título sin ejecutar JavaScript?
2. En el proyecto de React Router, deja la noticia como en la lección y cambia `ssr: true` por `ssr: false`. Lee el error del build, cámbialo por `clientLoader` y `clientAction`, y mira qué se sirve ahora con `curl`. ¿Qué has perdido?
3. En el proyecto de Next.js, añade `output: 'export'` a `next.config` y una Server Action como las de la lección 89. Antes de ejecutar nada, escribe qué crees que pasará; después compáralo con la lista de funciones no admitidas de su guía de exportación estática.
4. Crea una app con `npx create-expo-app@latest`, arráncala con `npx expo start --web` y cambia el texto de la pantalla de inicio. Intenta añadir un `<div>`. ¿Qué mensaje recibes? Apunta tres cosas del código de la plantilla que reconozcas de este temario y tres que no.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Creating a React App",
      "descripcion": "La página de React con los frameworks que recomienda, los emergentes, y cuándo empezar desde cero. Léela completa antes de decidir.",
      "url": "https://react.dev/learn/creating-a-react-app",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Next.js: Getting Started",
      "descripcion": "Instalación, rutas, Server y Client Components, mutación de datos y despliegue, en la documentación del App Router.",
      "url": "https://nextjs.org/docs/app/getting-started",
      "etiqueta": "Next.js"
    },
    {
      "titulo": "React Router: Picking a Mode",
      "descripcion": "Los tres modos de React Router y cuándo elegir cada uno, con el camino hacia el modo framework.",
      "url": "https://reactrouter.com/start/modes",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Expo: Create a project",
      "descripcion": "Cómo crear un proyecto con Expo SDK 58, los requisitos y el siguiente paso para ejecutarlo en un dispositivo o en el navegador.",
      "url": "https://docs.expo.dev/get-started/create-a-project/",
      "etiqueta": "Expo"
    },
    {
      "titulo": "TanStack Start: Overview",
      "descripcion": "Qué es, sobre qué se construye y cuándo usar Start o solo TanStack Router, con su comparación con Next.js y React Router (escrita por TanStack).",
      "url": "https://tanstack.com/start/latest/docs/framework/react/overview",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "React Native: Getting Started",
      "descripcion": "La puerta de entrada a React Native y a lo que cambia respecto al React del navegador.",
      "url": "https://reactnative.dev/docs/getting-started",
      "etiqueta": "React Native"
    }
  ]
}
```
