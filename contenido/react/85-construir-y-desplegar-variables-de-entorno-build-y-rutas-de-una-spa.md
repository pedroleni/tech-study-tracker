# Construir y desplegar: variables de entorno, build y rutas de una SPA

- **Módulo:** Calidad y producción
- **Slug:** `construir-y-desplegar-variables-de-entorno-build-y-rutas-de-una-spa` (autogenerado del título)
- **Orden:** 850
- **Fuentes:** [Vite: Env Variables and Modes](https://vite.dev/guide/env-and-mode) + [Vite: Deploying a Static Site](https://vite.dev/guide/static-deploy) + [Vercel: Rewrites](https://vercel.com/docs/routing/rewrites) — ver `contenido/react/TEMARIO.md` #85

---

## Qué es y para qué sirve

Hasta ahora tu aplicación ha vivido en `npm run dev`: el servidor de desarrollo de Vite te manda cada módulo por separado y recarga la página al guardar. Eso es cómodo para trabajar y **no es lo que se sube a internet**. Para publicar, `npm run build` empaqueta todo en una carpeta, `dist/`, que es solo un `index.html`, archivos JavaScript y CSS. Una aplicación de React hecha así (una SPA, de *single-page application*) no necesita un servidor que ejecute nada: le vale cualquier alojamiento que sepa entregar archivos.

Que sean archivos fijos tiene tres consecuencias, y la lección va de ellas:

1. **Lo que tenga el proyecto cuando construyes queda escrito en los archivos.** Las variables de entorno no se leen al cargar la página: se copian dentro del JavaScript al construir.
2. **Todo lo que hay en `dist/` es público.** Quien abra las herramientas de desarrollo lo lee.
3. **El servidor no conoce tus rutas.** `/visitas/cata` existe para React Router, no para quien entrega los archivos, y hay que decírselo.

Y dos preguntas más, que responden las últimas secciones: **qué pesa** ese JavaScript y **cómo le va a la web en los navegadores de tus usuarios**, una vez publicada.

Todo lo que ves aquí sale de un proyecto real, creado el 21 de octubre de 2026 con `npm create vite@latest horarios -- --template react`: `create-vite` 9.3.1, que instala Vite 8.3.5, React 19.3.1 y `@vitejs/plugin-react` 6.1.2, más React Router 7.18.4 (Node 22.12.0). Es la web de visitas guiadas de las Salinas del Pozo, con tres pantallas: la portada, una visita (`/visitas/cata`) y un mapa (`/mapa`) que se carga con `lazy` (lección 50). Las salidas de terminal son copia literal de lo que imprimió.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace cada cosa cuando publicas",
  "roles": [
    {
      "etiqueta": "Vite",
      "rol": "Construye, una vez",
      "descripcion": "Con npm run build lee tu código y tus archivos .env, y escribe dist/. Después ya no interviene: lo que decidió, decidido queda."
    },
    {
      "etiqueta": "El alojamiento",
      "rol": "Entrega archivos",
      "descripcion": "Vercel, Netlify, GitHub Pages... Recibe dist/ y responde a cada petición con el archivo que toque. No ejecuta React ni sabe qué es una ruta de tu router."
    },
    {
      "etiqueta": "El navegador",
      "rol": "Ejecuta todo lo demás",
      "descripcion": "Descarga el JavaScript, monta React con createRoot y lee la URL para decidir qué pantalla pintar. Es también donde cualquiera puede leer lo que has publicado."
    }
  ]
}
```

## Construir: qué hay dentro de `dist/`

La plantilla ya trae el script. En el `package.json` del proyecto:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "oxlint",
  "preview": "vite preview"
}
```

Y esto es lo que imprime `npm run build` (la plantilla trae Oxlint, no ESLint, pero no interviene en la construcción):

```text
> horarios@0.0.0 build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 25 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-2b0F2EBd.css    0.05 kB │ gzip:  0.07 kB
dist/assets/Mapa-CyL2or6f.js      0.30 kB │ gzip:  0.23 kB
dist/assets/index-PpWLQx8O.js   260.22 kB │ gzip: 82.87 kB

✓ built in 299ms
```

Cuatro archivos más el icono de `public/`. **El `index-PpWLQx8O.js` es casi toda la aplicación** (React, React Router y tu código: 260 kB, unos 83 kB comprimido), `Mapa-CyL2or6f.js` es el trozo que `lazy(() => import('./Mapa.jsx'))` separó para descargarse solo cuando alguien entre en `/mapa`, y el CSS va aparte. Esto es lo que Vite escribió como `index.html`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!doctype html>\n<html lang=\"es\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Salinas del Pozo</title>\n    <script type=\"module\" crossorigin src=\"/assets/index-PpWLQx8O.js\"></script>\n    <link rel=\"stylesheet\" crossorigin href=\"/assets/index-2b0F2EBd.css\">\n  </head>\n  <body>\n    <div id=\"root\"></div>\n  </body>\n</html>",
  "anotaciones": [
    {
      "fragmento": "<title>Salinas del Pozo</title>",
      "nota": "Tu index.html de la raíz del proyecto, casi igual. Este título y las etiquetas meta son los únicos que verá un robot o una vista previa de enlace que no ejecute JavaScript (lecciones 81 y 87)."
    },
    {
      "fragmento": "<script type=\"module\" crossorigin src=\"/assets/index-PpWLQx8O.js\"></script>",
      "nota": "Vite sustituyó tu <script src=\"/src/main.jsx\"> por el archivo ya empaquetado. El trozo PpWLQx8O es un hash calculado a partir del contenido: si el código cambia, el nombre cambia."
    },
    {
      "fragmento": "<link rel=\"stylesheet\" crossorigin href=\"/assets/index-2b0F2EBd.css\">",
      "nota": "El CSS sale como archivo propio. En construcciones posteriores sin tocar los estilos, este nombre siguió siendo el mismo."
    },
    {
      "fragmento": "<div id=\"root\"></div>",
      "nota": "Vacío, como en la lección 2: la página aparece cuando el JavaScript llama a createRoot (lección 3)."
    }
  ]
}
```

**El hash del nombre no es decoración.** Lo comprobé reconstruyendo varias veces: sin tocar el código, los nombres no cambian; al construir en modo `staging`, con otra dirección de la API, `index-PpWLQx8O.js` pasó a `index-CGG1Ke6G.js` y `Mapa-CyL2or6f.js` a `Mapa-Bdu8qPVJ.js` (`index-2b0F2EBd.css` no cambió, porque no había tocado estilos). Como un archivo con hash nunca cambia de contenido, el navegador y las redes de distribución pueden guardarlo mucho tiempo sin riesgo. El único que no lleva hash es `index.html`, y por eso es el que hay que pedir siempre de nuevo.

## Probar el build antes de subirlo: `npm run preview`

`npm run dev` y el resultado de `build` se comportan distinto (en desarrollo no hay empaquetado, ni trozos de `lazy`, ni valores sustituidos). **Lo que se publica es `dist/`, así que `dist/` es lo que hay que probar**:

```text
$ npm run preview

  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
```

La guía de Vite sobre despliegue lo dice con estas palabras: «It is important to note that `vite preview` is intended for previewing the build locally and not meant as a production server». Es decir: `preview` sirve para comprobar que la construcción funciona, no para publicar con él. Tiene además una trampa que verás en la última sección: se comporta mejor que un alojamiento real.

## Variables de entorno: lo que Vite escribe en tus archivos

Vite expone un objeto, `import.meta.env`, con cinco constantes que existen siempre: `MODE` (el modo en el que corre la aplicación), `BASE_URL` (desde qué ruta se sirve), `PROD` y `DEV` (booleanos, siempre opuestos) y `SSR`. Y además, **tus propias variables, pero solo las que empiezan por `VITE_`**. Las demás no llegan al código del navegador. Este es el componente del mapa del proyecto, que lee una variable con prefijo y otra sin él:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// src/Mapa.jsx\nconst clavePublica = import.meta.env.VITE_MAPA_CLAVE\nconst secreto = import.meta.env.SALINAS_SECRETO\n\nexport default function Mapa() {\n  return (\n    <>\n      <h1>Cómo llegar</h1>\n      <p>Clave del mapa: {clavePublica}</p>\n      <p>Secreto: {String(secreto)}</p>\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import.meta.env.VITE_MAPA_CLAVE",
      "nota": "Con el prefijo VITE_, Vite expone la variable. Vale texto: siempre llega como cadena, aunque en el archivo parezca un número o un booleano."
    },
    {
      "fragmento": "import.meta.env.SALINAS_SECRETO",
      "nota": "Sin prefijo, Vite no la expone. La guía de Vite lo prueba con un console.log que da undefined, y aquí pasa lo mismo: el código llega al navegador, la variable no."
    },
    {
      "fragmento": "String(secreto)",
      "nota": "Sin el String, React no pintaría nada: undefined no se renderiza (lección 10). Así se ve que vale undefined."
    }
  ]
}
```

Estos son los archivos `.env` del proyecto (valores inventados), con el orden de prioridad que da la guía de Vite:

```text
# .env                  se carga siempre
VITE_API_URL=http://localhost:3000/v1
VITE_MAPA_CLAVE=pk_salinas_c41d9e
SALINAS_SECRETO=sk_salinas_7f3a90

# .env.production       solo al ejecutar vite build
VITE_API_URL=https://api.salinasdelpozo.example/v1
```

Vite carga `.env` y `.env.local` en todos los casos, más `.env.[modo]` y `.env.[modo].local` si existe el del modo actual. **Los de un modo concreto pisan a los generales**, y una variable que ya exista en el entorno cuando lanzas Vite (`VITE_API_URL=... npm run build`) gana a todos los archivos. Es una buena ocasión para predecir antes de mirar.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// .env\n//   VITE_API_URL=http://localhost:3000/v1\n//   VITE_MAPA_CLAVE=pk_salinas_c41d9e\n//   SALINAS_SECRETO=sk_salinas_7f3a90\n// .env.production\n//   VITE_API_URL=https://api.salinasdelpozo.example/v1\n\n// En el código:\nconst url = import.meta.env.VITE_API_URL\nconst clave = import.meta.env.VITE_MAPA_CLAVE\nconst secreto = import.meta.env.SALINAS_SECRETO\n\n// Después de ejecutar npm run build,\n// ¿qué textos se pueden encontrar dentro de dist/?",
  "opciones": [
    "Los cinco valores: los tres de .env y el de .env.production",
    "https://api.salinasdelpozo.example/v1 y pk_salinas_c41d9e; ni http://localhost:3000/v1 ni sk_salinas_7f3a90",
    "Los valores de .env y los de .env.production, menos los que empiezan por sk_",
    "Ninguno: las variables se leen del servidor cada vez que se abre la página"
  ],
  "correcta": 1,
  "explicacion": "Vite sustituye cada import.meta.env.VITE_* por su valor al construir. Para VITE_API_URL manda .env.production, que pisa a .env, así que el localhost no aparece. SALINAS_SECRETO no lleva prefijo: Vite la deja como undefined y ni el nombre ni el valor llegan a los archivos. Se comprobó con grep, como verás a continuación."
}
```

Comprobado con `grep` sobre la carpeta `dist/` recién construida (cada comando lista los archivos donde aparece el texto; si no sale ninguno, no está en ninguno):

```text
$ grep -rl "salinasdelpozo.example" dist
dist/assets/index-PpWLQx8O.js

$ grep -rl "localhost:3000" dist

$ grep -rl "pk_salinas_c41d9e" dist
dist/assets/Mapa-CyL2or6f.js

$ grep -rl "sk_salinas_7f3a90" dist

$ grep -rl "SALINAS_SECRETO" dist

```

Y así quedó el trozo del mapa. Las dos variables ya no son variables, son un texto y un `void 0` (la forma corta, y minificada, de escribir `undefined`):

```text
var t=e(),n=`pk_salinas_c41d9e`,r=void 0;
```

Si lo abres en el navegador (con `npm run preview`, en Chrome), `/mapa` pinta exactamente eso: «Clave del mapa: pk_salinas_c41d9e» y «Secreto: undefined».

### Se sustituye al construir, no al cargar

Esto es lo que más sorprende a quien viene de otros mundos. **Un valor de `VITE_` se escribe en el JavaScript durante `npm run build`, y desde ese momento no se puede cambiar sin volver a construir.** Lo comprobé: cambié `.env` después de construir y el `dist/` siguió igual (`grep` no encontró el valor nuevo). Tiene consecuencias prácticas:

- Para una dirección distinta en pruebas y en producción hace falta **una construcción por entorno**, no un único `dist/` que se copia.
- En un alojamiento como Vercel, las variables se definen en su panel y se aplican a la construcción. Su documentación avisa de que «any change you make to environment variables are not applied to previous deployments, they only apply to new deployments»: cambiar una variable en el panel no arregla el sitio publicado hasta que se vuelva a desplegar.
- Si pasas el objeto entero (`console.log(import.meta.env)`, o `JSON.stringify(import.meta.env)`), Vite lo sustituye por un objeto literal con **todas las `VITE_`** del proyecto, las uses o no:

```text
{BASE_URL:`/`,DEV:!1,MODE:`production`,PROD:!0,SSR:!1,VITE_API_URL:`https://api.salinasdelpozo.example/v1`,VITE_MAPA_CLAVE:`pk_salinas_c41d9e`}
```

(`!1` y `!0` son `false` y `true` minificados.) Fíjate en que no está `SALINAS_SECRETO`. Por eso conviene leer las variables una a una (`import.meta.env.VITE_API_URL`): así ves en el código exactamente qué se publica.

### Modos: `development`, `production` y los tuyos

Por defecto `npm run dev` corre en modo `development` y `vite build` en modo `production`, y el modo decide qué archivo `.env.[modo]` se carga. Con `--mode` puedes inventarte otros. Creé un `.env.staging` con una dirección de pruebas y ejecuté `npx vite build --mode staging`:

```text
{BASE_URL:`/`,DEV:!1,MODE:`staging`,PROD:!0,SSR:!1,VITE_API_URL:`https://staging.salinasdelpozo.example/v1`,VITE_MAPA_CLAVE:`pk_salinas_c41d9e`}
```

`MODE` vale `staging` y la dirección es la de pruebas, pero **`PROD` sigue siendo `true`**. La guía de Vite insiste en que el modo y `NODE_ENV` son cosas distintas: `vite build --mode staging` sigue construyendo para producción (`NODE_ENV` es `production`) y solo cambia qué archivo `.env` se lee. Por eso `import.meta.env.PROD` y `import.meta.env.MODE === 'production'` no son lo mismo.

Y una prueba de la prioridad: ejecutando `VITE_API_URL=https://desde-el-shell.example/v1 npx vite build`, el `dist/` contiene la dirección del terminal y no la de `.env.production`.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si cambio la variable en el panel de Vercel o en el .env, la web publicada cambia",
      "realidad": "El valor se escribió en el JavaScript al construir. Hay que volver a construir y desplegar."
    },
    {
      "mito": "Mi clave secreta está a salvo si la pongo sin VITE_ y la uso en un componente",
      "realidad": "Sin el prefijo, Vite no la expone: tu componente recibe undefined y no funciona. Y si la escribes a mano en el código, está en el JavaScript igual. Lo que usa un secreto es un servidor."
    },
    {
      "mito": "MODE === production es lo mismo que PROD",
      "realidad": "Con vite build --mode staging, MODE vale staging y PROD sigue siendo true: el modo escoge el .env, NODE_ENV decide si es una construcción de producción."
    },
    {
      "mito": "En el archivo .env, VITE_ACTIVO=false es un booleano",
      "realidad": "Es el texto false, y un texto no vacío es verdadero. Hay que compararlo con 'true' o convertirlo."
    }
  ]
}
```

Otro detalle de la misma familia: Vite lo expone todo como texto, y la guía lo avisa en un recuadro («Make sure to convert to the desired type when using it in your code»). Predice:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// .env\n//   VITE_RESERVAS_ABIERTAS=false\n\nconst valor = import.meta.env.VITE_RESERVAS_ABIERTAS\nconst abiertas = Boolean(valor)\n\nconsole.log(typeof valor, abiertas)",
  "opciones": [
    "boolean false",
    "string false",
    "string true",
    "undefined false"
  ],
  "correcta": 2,
  "explicacion": "Vite entrega el valor como texto: \"false\" es una cadena, y Boolean(\"false\") es true porque la cadena no está vacía. Para un interruptor, compara con el texto: valor === \"true\". El ejercicio del final de la lección lo arregla."
}
```

### TypeScript y las variables

En TypeScript (módulo 10), `import.meta.env.VITE_API_URL` tiene tipo `any` hasta que se lo describes. La guía de Vite propone ampliar la interfaz `ImportMetaEnv` en un archivo `src/vite-env.d.ts`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/vite-env.d.ts\ninterface ImportMetaEnv {\n  readonly VITE_API_URL: string\n  readonly VITE_MAPA_CLAVE: string\n}\n\ninterface ImportMeta {\n  readonly env: ImportMetaEnv\n}",
  "anotaciones": [
    {
      "fragmento": "readonly VITE_API_URL: string",
      "nota": "Cada variable que uses, con su tipo. Todas son string: si necesitas un número o un booleano, conviértelo tú, como en el ejercicio. Tener un tipo no garantiza que la variable exista en tiempo de ejecución."
    },
    {
      "fragmento": "interface ImportMeta",
      "nota": "Conecta esa interfaz con import.meta.env. La guía avisa de que el archivo no debe tener ningún import: con un import deja de ampliar los tipos globales y la ampliación no funciona."
    }
  ]
}
```

## Qué es público y qué no

La lección 82 ya dijo lo esencial: **todo lo que envías al navegador es público**, y las variables `VITE_` se copian al JavaScript. La guía de Vite lo avisa en un recuadro de «Protecting secrets»: las `VITE_*` no deben contener información sensible, como claves de una API, y para producción conviene «a backend server or serverless/edge functions» que guarden los secretos. Lo que añade esta lección es verlo y saber comprobarlo:

- **Antes de publicar, busca tus secretos en `dist/`** con `grep -r` (como arriba). Si encuentras uno, está también en el navegador de cualquier visitante.
- **Un buen `.env.example` documenta qué va a cada lado.** Esta web, la del temario, lo hace: lleva en el repositorio un `.env.example` con solo los nombres. Las dos primeras variables son del cliente (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`: la dirección del proyecto y su clave pública, protegida por las reglas de la base de datos, como cuenta la lección 86). Las de almacenamiento de imágenes, en cambio, llevan el comentario: «solo servidor, nunca prefijadas con VITE_» y las lee una función de servidor (`api/imagenes.ts`), no el código del navegador.
- **Un secreto necesita un servidor.** Si algo exige una clave privada (cobrar, enviar correo, subir archivos a un almacenamiento), el navegador no la usa: le pide al servidor que lo haga, y el servidor comprueba quién lo pide. Es lo que hace esa función de la web.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "La plantilla de Vite no ignora el archivo .env",
  "contenido": "El .gitignore que genera create-vite incluye la línea *.local, pero no .env. Es coherente con la guía de Vite: los .env normales son para valores que pueden ir al repositorio (y las VITE_ acaban publicadas de todos modos), y lo que sea solo tuyo va en .env.local o .env.[modo].local, que sí quedan fuera. Aun así, si guardas en un .env algo que no deba publicarse, añade .env al .gitignore antes de hacer el primer commit: lo que se sube a git no se borra de verdad."
}
```

## Las rutas de una SPA al recargar

Hay una prueba que casi todo el mundo se salta y casi todos fallan la primera vez: **construir, subir y recargar la página en una ruta que no sea la raíz**. Mientras navegas, React Router cambia la URL con `history.pushState` y no se pide nada al servidor (lección 76). Pero si pulsas F5 en `/visitas/cata`, o pegas ese enlace en otra pestaña, es el navegador quien pide `/visitas/cata` al servidor. Probé a servir la carpeta `dist/` con un servidor de archivos cualquiera, el `python3 -m http.server` que trae Python, y con el de `npm run preview`:

```text
                          vite preview     python3 -m http.server
/                              200                 200
/visitas/cata                  200                 404
/mapa                          200                 404
/assets/no-existe.js           200 (text/html)     404
```

El servidor de archivos busca un archivo llamado `visitas/cata`, no lo encuentra y devuelve su `404` (en el caso de Python, `Error code: 404 · Message: File not found.`) sin enviar tu `index.html`: tu aplicación ni siquiera se descarga, así que tampoco puede pintar una página de «no encontrado». `vite preview` en cambio devuelve `index.html` para casi cualquier ruta (en la documentación de Vite, la opción `appType` vale `'spa'` por defecto, con el «SPA fallback»), y por eso **no te avisa de este problema**. Funciona en local y falla en producción.

**La solución es siempre la misma: que el servidor responda con `index.html` (y un código `200`) a cualquier ruta que no corresponda a un archivo.** Después, React Router lee la URL y pinta lo que toca. Cada alojamiento lo configura a su manera.

### Netlify: un archivo `_redirects`

Netlify lo explica en la sección «History pushState and single-page apps» de su documentación de rewrites. Una regla con código `200` es una reescritura (la dirección del navegador no cambia), y esta, que va la última si hay más, hace lo que buscamos:

```text
/*  /index.html  200
```

Vite copia tal cual todo lo que haya en `public/` a `dist/`. Comprobado: con ese archivo en `public/_redirects`, `dist/` contiene `_redirects` junto a `index.html` y `assets/`. La documentación de Netlify añade un matiz que conviene saber: una reescritura no «tapa» un archivo que existe (si pides `/assets/index-PpWLQx8O.js`, recibes el JavaScript, no el HTML), salvo que añadas `!` a la regla.

### Vercel: un `rewrite` en `vercel.json`

En Vercel se escribe un `vercel.json` en la raíz del proyecto (no en `public/`, no se copia a `dist/`) con una reescritura. La documentación de `vercel.json` precisa que se da prioridad al sistema de archivos antes de aplicar las reescrituras, lo mismo que Netlify: los archivos reales ganan. La versión mínima:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

(Esta versión mínima no la he podido desplegar en una cuenta de Vercel; la que sigue sí está en producción.) Esta es la configuración real de la web de este temario, en producción en el momento de escribir esto (recortada: quito una cabecera de caché para otra carpeta):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// vercel.json (techstudytracker.com)\n{\n  \"rewrites\": [\n    { \"source\": \"/img/:clave\", \"destination\": \"/api/imagenes-servir?clave=:clave\" },\n    { \"source\": \"/((?!api/|img/).*)\", \"destination\": \"/index.html\" }\n  ],\n  \"headers\": [\n    {\n      \"source\": \"/(.*)\",\n      \"headers\": [\n        { \"key\": \"X-Content-Type-Options\", \"value\": \"nosniff\" }\n      ]\n    }\n  ]\n}",
  "anotaciones": [
    {
      "fragmento": "\"source\": \"/img/:clave\"",
      "nota": "Una ruta que no es de React Router: las imágenes de las lecciones pasan por una función de servidor que las sirve desde el almacenamiento. Va antes de la reescritura general para que la segunda no se la lleve."
    },
    {
      "fragmento": "\"source\": \"/((?!api/|img/).*)\"",
      "nota": "Cualquier ruta salvo las que empiezan por api/ o img/ va a index.html. Sin esa excepción, una petición a /api/algo que no exista recibiría el HTML de la web con un 200 en lugar de un error de verdad."
    },
    {
      "fragmento": "\"destination\": \"/index.html\"",
      "nota": "El navegador sigue viendo la dirección que pidió; Vercel entrega este archivo. Lo comprobé contra la web real: /ruta/que/no/existe devuelve 200 y el index.html."
    },
    {
      "fragmento": "\"key\": \"X-Content-Type-Options\", \"value\": \"nosniff\"",
      "nota": "Una cabecera de seguridad aparte (impide que el navegador adivine el tipo de un archivo). Se declara en el mismo vercel.json, que sirve para más cosas que las reescrituras."
    }
  ]
}
```

Esto es lo que respondió la web real a estas peticiones, comprobado con `curl` el 21 de octubre de 2026:

```text
/                        200  text/html
/tecnologias/react       200  text/html
/ruta/que/no/existe      200  text/html
/assets/no-existe.js     200  text/html
/api/inexistente         404  text/plain
/img/no-existe           404  text/plain
```

### GitHub Pages y otros: la opción `base`

Si el sitio no cuelga de la raíz (por ejemplo `https://usuario.github.io/salinas/`), tienes que decírselo a Vite con la opción `base`, como indica la guía de despliegue: `base: '/<REPO>/'` en `vite.config.js`. Con `npx vite build --base=/salinas/` el `index.html` cambia:

```text
<link rel="icon" type="image/svg+xml" href="/salinas/favicon.svg" />
<script type="module" crossorigin src="/salinas/assets/index-C3HieqoC.js"></script>
```

Y React Router tiene que saber lo mismo. `import.meta.env.BASE_URL` contiene esa base, y `BrowserRouter` la acepta como `basename`. Lo probé en Chrome con `vite preview`:

```jsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

Con eso, `/salinas/visitas/cata` carga la visita y, al pulsar «Mapa», la dirección pasa a `/salinas/mapa`. Y si ni siquiera puedes tocar el servidor (no hay un `_redirects` ni nada parecido), queda el `HashRouter` de la lección 76, que guarda la ruta detrás de `#` y no necesita al servidor para nada.

### La trampa de la reescritura general

Fíjate en una fila de las pruebas de arriba: `/assets/no-existe.js` devuelve `200` con `text/html`, tanto en `vite preview` como en la web real. **Una reescritura general también convierte los archivos que no existen en tu `index.html`.** Si el navegador pide un trozo de JavaScript que el servidor ya no tiene (por ejemplo, una pestaña que lleva abierta desde antes de un despliegue y pide un trozo de `lazy` cuyo nombre con hash ya no existe), recibe HTML. En Chrome, lo que se ve es esto, y no un 404:

```text
TypeError: Failed to fetch dynamically imported module: http://localhost:4173/assets/Mapa-VIEJO.js
```

(Reproducido pidiendo `import('/assets/Mapa-VIEJO.js')` contra `vite preview`.) Es un buen sitio para un error boundary con botón de reintentar (lección 53) alrededor de un `lazy`, y una razón más para que el nombre de cada trozo lleve el hash de su contenido.

### Las páginas «no encontrado» las tienes que hacer tú

Con la reescritura, el servidor nunca responde `404` a una página de tu aplicación: contesta `200` y deja que React decida. Si ninguna ruta casa, React Router, en modo declarativo, no pinta nada y avisa por consola con `No routes matched location "/ruta"`. La ruta comodín `path="*"` es la forma de pintar tu propia página de «no encontrado». La lección 86 cuenta que a la web real, hoy, le falta.

## Qué pesa en el bundle y cómo verlo

La salida de `npm run build` da el tamaño de cada archivo, pero no lo que hay dentro. `index-….js` pesa 260 kB: ¿cuánto es React, cuánto React Router y cuánto tu código? Para responder están los **analizadores del bundle**, que dibujan cada archivo como un mapa de rectángulos, uno por módulo, con un área proporcional a lo que ocupa. Con Vite, el más usado con diferencia es [`rollup-plugin-visualizer`](https://github.com/btd/rollup-plugin-visualizer) (7.1.1): nació para Rollup y funciona igual con Rolldown, el empaquetador de Vite 8. Hay otros, como `vite-bundle-analyzer` o Sonda, y las Vite DevTools, todavía en la versión 0.8, traen su propio análisis de la build.

Lo probé el 26 de octubre en el proyecto de las Salinas, rehecho con las mismas versiones (también React Router 7.18.4). Su `index-….js` pesa 260,69 kB: no es idéntico al de arriba, pero casi. Se instala como dependencia de desarrollo, con `npm install -D rollup-plugin-visualizer`, y se añade a `vite.config.js`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// vite.config.js\nimport react from '@vitejs/plugin-react'\nimport { visualizer } from 'rollup-plugin-visualizer'\nimport { defineConfig } from 'vite'\n\n// npx vite build --mode analisis\nexport default defineConfig(({ mode }) => ({\n  build: { sourcemap: mode === 'analisis' },\n  plugins: [\n    react(),\n    mode === 'analisis' && visualizer({ filename: 'informe-bundle.html', sourcemap: true }),\n  ],\n}))",
  "anotaciones": [
    {
      "fragmento": "// npx vite build --mode analisis",
      "nota": "El informe solo se genera cuando lo pides, con un modo propio, como el staging de arriba: npm run build sigue igual. PROD sigue siendo true, pero este modo lee .env.analisis en lugar de .env.production."
    },
    {
      "fragmento": "build: { sourcemap: mode === 'analisis' },",
      "nota": "El plugin mide cada módulo con los source maps (lección 53); por eso va también sourcemap: true en el plugin. Sin ellos mide el código antes de minificar, y React DOM salía con 517 KiB en lugar de los 198 que ocupa de verdad."
    },
    {
      "fragmento": "mode === 'analisis' && visualizer(",
      "nota": "En cualquier otro modo, la expresión vale false y Vite se salta ese hueco de la lista de plugins."
    },
    {
      "fragmento": "filename: 'informe-bundle.html'",
      "nota": "Se escribe en la raíz del proyecto, fuera de dist/, así que no se publica: ábrelo con el navegador y añádelo a .gitignore. Por defecto es un treemap; con la opción template en markdown escribe el mismo informe como texto, que es el que copio aquí abajo."
    }
  ]
}
```

En el proyecto recién creado, **casi el 80 % es React DOM**. Del informe en texto:

```text
| Package | Modules | Rendered |
| --- | ---: | ---: |
| `react-dom` | 4 | 201.99 KiB |
| `react-router` | 1 | 36.52 KiB |
| `react` | 4 | 7.97 KiB |
| `scheduler` | 2 | 3.42 KiB |
```

Tu código (`App`, `Portada`, `Visita` y los datos) suma poco más de 1,5 KiB. El informe cuenta en KiB, de 1024 bytes, y Vite en kB, de 1000, así que las cifras no cuadran al byte. Esos 200 KiB de React DOM son **el precio fijo de una app de React**: no hay nada que recortar ahí. Lo que vigila el analizador es lo que añades tú.

Supón que alguien, para agrupar las visitas por día en la portada, cambia `Object.groupBy` por lodash, una librería de utilidades muy veterana:

```jsx
import _ from 'lodash'

const porDia = _.groupBy(VISITAS, (visita) => visita.fecha.slice(0, 10))
```

Nada avisa, pero la build lo nota:

```text
dist/assets/index-6cWHqByV.js   332.33 kB │ gzip: 109.10 kB
```

Son 72 kB más (26 kB comprimidos) por una función de una línea. En el informe sale enseguida, y en el treemap, `lodash/lodash.js` es el segundo rectángulo más grande después de React DOM:

```text
- `/node_modules/react-dom/cjs/react-dom-client.production.js`: 61.7% (198.30 KiB)
- `/node_modules/lodash/lodash.js`: 21.6% (69.61 KiB)
- `/node_modules/react-router/dist/development/chunk-OB3PAWPO.mjs`: 11.4% (36.52 KiB)
- `/node_modules/react/cjs/react.production.js`: 2.4% (7.63 KiB)
…
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Antes:\nimport _ from 'lodash'\nconst porDia = _.groupBy(VISITAS, (visita) => visita.fecha.slice(0, 10))\n\n// Después:\nimport { groupBy } from 'lodash'\nconst porDia = groupBy(VISITAS, (visita) => visita.fecha.slice(0, 10))\n\n// Con el primero, index-….js pesaba 332,33 kB.\n// ¿Y con el segundo?",
  "opciones": [
    "Unos 262 kB: solo entra groupBy",
    "332 kB, igual: entra lodash entero",
    "Más de 332 kB: las llaves añaden código"
  ],
  "correcta": 1,
  "explicacion": "El paquete lodash se publica como un único archivo CommonJS, lodash.js. El empaquetador no puede saber qué partes de un módulo así usas y lo mete entero, con llaves o sin ellas: 332,32 kB. Para que el tree shaking deje fuera lo que no usas, la librería tiene que venir en módulos ES, como lodash-es: 276,11 kB. Comprobado con Vite 8.3.5."
}
```

Las cinco formas, construidas una tras otra:

```text
                                         index-….js
import _ from 'lodash'                   332.33 kB │ gzip: 109.10 kB
import { groupBy } from 'lodash'         332.32 kB │ gzip: 109.10 kB
import groupBy from 'lodash/groupBy'     280.42 kB │ gzip:  89.19 kB
import { groupBy } from 'lodash-es'      276.11 kB │ gzip:  88.57 kB
Object.groupBy, sin librería             260.69 kB │ gzip:  83.07 kB
```

Incluso importando solo `groupBy`, lodash trae 15 o 20 kB de piezas internas (el informe las lista: `_baseIsTypedArray.js`, `_equalObjects.js`…), porque su `groupBy` acepta muchas formas de decir por qué agrupar. `Object.groupBy` es del propio JavaScript, y está en todos los navegadores actuales desde 2024 (en Safari, desde la 17.4).

Vite solo avisa cuando un trozo pasa de 500 kB después de minificar. Bajé ese límite, la opción `build.chunkSizeWarningLimit`, a 250 para ver el aviso:

```text
(!) Some chunks are larger than 250 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
```

Es decir: algunos trozos pasan de 250 kB después de minificar; considera usar `import()` dinámico para dividir la aplicación, la opción `codeSplitting` de Rolldown para repartir mejor los trozos, o cambiar el límite del aviso. Subir el límite solo calla el aviso. La web de este temario, por cierto, tiene un JavaScript principal de 2,8 MB: la lección 86 cuenta por qué.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Qué hacer con lo que encuentres",
  "items": [
    {
      "titulo": "Una librería grande para poca cosa",
      "texto": "Cámbiala por lo que ya trae el navegador (Object.groupBy, Intl para fechas y números, lección 101; fetch) o por una versión en módulos ES, de la que el empaquetador solo mete lo que importas."
    },
    {
      "titulo": "Algo pesado que solo usa una pantalla",
      "texto": "Sácalo del archivo principal con lazy o import() (lección 50). Seguirá en el informe, pero en un trozo aparte que solo descarga quien abre esa pantalla."
    },
    {
      "titulo": "El mismo paquete dos veces",
      "texto": "Si aparece con dos rutas distintas dentro de node_modules, tienes dos versiones. npm ls con el nombre del paquete te dice quién trae cada una."
    },
    {
      "titulo": "React DOM, el precio fijo",
      "texto": "Unos 200 KiB que no vas a recortar. No persigas kilobytes ahí: persigue lo que has añadido tú."
    },
    {
      "titulo": "Compara siempre igual",
      "texto": "Antes y después de cada cambio, con la misma build. La columna gzip de Vite se parece más a lo que viaja por la red, porque los alojamientos comprimen los archivos."
    }
  ]
}
```

## Antes de subir: una lista corta

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Construye y lee la salida",
      "texto": "Ejecuta npm run build. Un aviso de tamaño o de módulos no resueltos es mucho más fácil de arreglar aquí que en producción."
    },
    {
      "titulo": "Mira qué pesa",
      "texto": "Genera el informe del analizador y busca librerías grandes para poca cosa y pantallas que deberían ir en su propio trozo."
    },
    {
      "titulo": "Prueba dist/, no el modo desarrollo",
      "texto": "Ejecuta npm run preview, navega por todas las rutas y mira la consola."
    },
    {
      "titulo": "Busca tus secretos en dist/",
      "texto": "Usa grep -r con el valor de cada clave. Si sale, quítalo del código y de las variables VITE_: está en el navegador de cualquier visitante."
    },
    {
      "titulo": "Variables definidas antes de construir",
      "texto": "Comprueba que las de cada entorno están en el panel del alojamiento antes del despliegue, y vuelve a desplegar cada vez que las cambies."
    },
    {
      "titulo": "Recarga una ruta profunda",
      "texto": "Ya publicado, pega en una pestaña nueva la URL de una ruta que no sea la raíz. Si ves un 404 del alojamiento, falta la reescritura."
    },
    {
      "titulo": "Prueba una ruta inventada",
      "texto": "Debería salir tu página de «no encontrado», no una pantalla en blanco."
    }
  ]
}
```

## Medir en producción: las Core Web Vitals

El analizador te dice qué mandas, no cómo lo vive quien lo recibe. Para eso Google definió las **Core Web Vitals**: tres métricas que se miden en los navegadores de los usuarios, con [umbrales publicados en web.dev](https://web.dev/articles/defining-core-web-vitals-thresholds). Una página los cumple si **el 75 % de las visitas** (el percentil 75), contadas por separado en móvil y en escritorio, queda dentro de «bueno».

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres Core Web Vitals",
  "roles": [
    {
      "etiqueta": "LCP",
      "rol": "Carga: cuándo se pinta lo principal",
      "descripcion": "Lo que tarda en pintarse el elemento más grande de la pantalla (una foto, un bloque de texto) desde que empieza la navegación. Bueno: hasta 2,5 s. Malo: más de 4 s."
    },
    {
      "etiqueta": "INP",
      "rol": "Respuesta: cuánto tarda en reaccionar",
      "descripcion": "De cada clic, toque o tecla, el tiempo hasta que la pantalla cambia; cuenta la peor interacción de la visita. Bueno: hasta 200 ms. Malo: más de 500 ms."
    },
    {
      "etiqueta": "CLS",
      "rol": "Estabilidad: cuánto se mueve lo que ves",
      "descripcion": "Suma los saltos inesperados del contenido (la peor ráfaga de la visita). No tiene unidades. Bueno: hasta 0,1. Malo: más de 0,25."
    }
  ]
}
```

Las tres se pueden medir con JavaScript, y la forma más sencilla es la librería **`web-vitals`** del equipo de Chrome (6.2.3), que mide igual que las herramientas de Google. Se instala con `npm install web-vitals` y basta un archivo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// src/metricas.js\nimport { onCLS, onINP, onLCP } from 'web-vitals'\n\nfunction enviar(metrica) {\n  const cuerpo = JSON.stringify({\n    nombre: metrica.name,\n    valor: metrica.value,\n    nota: metrica.rating,\n    id: metrica.id,\n    url: metrica.navigationURL,\n  })\n  navigator.sendBeacon('/api/metricas', cuerpo)\n}\n\nonCLS(enviar)\nonINP(enviar)\nonLCP(enviar)\n\n// src/main.jsx, al final\nif (import.meta.env.PROD) {\n  import('./metricas.js')\n}",
  "anotaciones": [
    {
      "fragmento": "onCLS(enviar)",
      "nota": "Cada función llama a enviar cuando su métrica está lista, y no es al cargar: LCP se cierra con la primera interacción; INP y CLS, cuando la página pasa a segundo plano (cambias de pestaña, sales o la cierras). Pueden llegar más de una vez, y una visita sin clics no tiene INP."
    },
    {
      "fragmento": "navigator.sendBeacon('/api/metricas', cuerpo)",
      "nota": "sendBeacon envía aunque la página se esté cerrando, que es justo cuando llegan INP y CLS. /api/metricas es tu servidor (una función de servidor, como la de imágenes de esta web) o el de una herramienta de analítica."
    },
    {
      "fragmento": "nota: metrica.rating,",
      "nota": "good, needs-improvement o poor, con los umbrales de web.dev ya aplicados."
    },
    {
      "fragmento": "id: metrica.id,",
      "nota": "Identifica la medida. Si CLS llega dos veces en la misma visita, en el servidor te quedas con la última de cada id."
    },
    {
      "fragmento": "url: metrica.navigationURL,",
      "nota": "La página de la que es la medida, que no tiene por qué ser la actual: en una SPA, cuando llega, el usuario puede estar ya en otra ruta. Lo verás un poco más abajo."
    },
    {
      "fragmento": "import('./metricas.js')",
      "nota": "Solo en producción y en un trozo aparte (8 kB, 3 kB comprimido), que se descarga con la app ya en marcha. La librería recoge también lo que pasó antes de cargarse."
    }
  ]
}
```

### Lo que llegó al servidor

Para probarlo, a la página de una visita le añadí dos defectos a propósito: una foto sin `width` ni `height`, que mi servidor de pruebas (un pequeño servidor de Node que sirve `dist/` y escribe en la consola cada POST que recibe) entregaba con un segundo de retraso, como una red lenta; y un botón «Ver horarios del mes» que pinta `CalendarioMes`, con 30 componentes `Dia` que calculan sus plazas libres despacio (unos 10 ms cada uno en un portátil rápido):

```jsx
<img src="/fotos/salinas.svg" alt="Balsas de las Salinas del Pozo al atardecer" />
…
<button onClick={() => setVerMes(true)}>Ver horarios del mes</button>
{verMes && <CalendarioMes />}
```

Después, con Chromium 153 controlado por Playwright: abrir `/visitas/cata`, pulsar el botón y salir de la página. Esto recibió el servidor:

```text
POST /api/metricas {"nombre":"LCP","valor":1040,"nota":"good","id":"v6-1793037262922-5129828159283","url":"http://localhost:4180/visitas/cata"}
POST /api/metricas {"nombre":"INP","valor":312,"nota":"needs-improvement","id":"v6-1793037262922-8644147407764","url":"http://localhost:4180/visitas/cata"}
POST /api/metricas {"nombre":"CLS","valor":0.11122652457524272,"nota":"needs-improvement","id":"v6-1793037262931-8521651438663","url":"http://localhost:4180/visitas/cata"}
```

- **LCP, 1040 ms, «good».** El elemento más grande es la foto, que tardó un segundo en llegar.
- **INP, 312 ms, «needs-improvement».** Lo que tardó la pantalla en cambiar después del clic.
- **CLS, 0,111, «needs-improvement».** Al llegar, la foto empujó hacia abajo el texto, la lista y el botón.

Repetí la prueba con la CPU cuatro veces más lenta, la misma opción del panel Performance de Chrome que viste en la lección 65 (aquí, a través de Playwright):

```text
POST /api/metricas {"nombre":"LCP","valor":1104,"nota":"good",…}
POST /api/metricas {"nombre":"INP","valor":1160,"nota":"poor",…}
POST /api/metricas {"nombre":"CLS","valor":0.11122652457524272,"nota":"needs-improvement",…}
```

**El mismo botón pasa de «mejorable» a «malo»** en un móvil modesto. Las cifras de tu portátil no son las de tus usuarios.

### De la métrica al componente: el Profiler

`web-vitals` tiene una segunda versión, `web-vitals/attribution`, que añade a cada medida un objeto `attribution` con pistas. Para esta página, resumido y redondeado:

```text
LCP  target: "#root>main>img"   url: "http://localhost:4180/fotos/salinas.svg"
INP  interactionTarget: "#root>main>button"
     inputDelay: 3.2   processingDuration: 289.8   presentationDelay: 27
     longestScript: index-BdjYpwc9.js · función "_h" · invoker "DIV#root.onclick"
CLS  largestShiftTarget: "#root>main>ul"
```

Casi todo el INP es *proceso*: 290 ms ejecutando JavaScript después del clic. ¿Qué JavaScript? `_h` es un nombre minificado; con el source map (lección 53) resultó ser `dispatchDiscreteEvent`, de React DOM, al que llama un `onclick` puesto en `#root`: React escucha los clics en la raíz y desde ahí los reparte. **La atribución llega hasta React, pero no hasta tu componente.**

Ahí entra el Profiler de la lección 65. `web-vitals` te dice **dónde** (qué página, qué elemento, qué interacción) y **cuánto**; el Profiler te dice **qué componente**. Reproduce la interacción en desarrollo, con el Profiler grabando y la CPU ralentizada, o, si solo pasa en producción, usa el build de profiling (`react-dom/profiling`) con un `<Profiler>` alrededor de lo sospechoso, como en la lección 65. Con ese build, un `<Profiler id="CalendarioMes">` alrededor del calendario y un `onRender` que escribe el id, la fase y los milisegundos, la consola dijo `CalendarioMes · mount · 300 ms`: de los 312 ms del INP, 300 eran el render del calendario.

Dos cambios:

```jsx
<img src="/fotos/salinas.svg" width="800" height="450" alt="Balsas de las Salinas del Pozo al atardecer" />
…
const [cargandoMes, empezarTransicion] = useTransition()
…
<button onClick={() => empezarTransicion(() => setVerMes(true))}>Ver horarios del mes</button>
{cargandoMes && <p>Calculando plazas…</p>}
```

```text
POST /api/metricas {"nombre":"LCP","valor":1036,"nota":"good",…}
POST /api/metricas {"nombre":"INP","valor":40,"nota":"good",…}
POST /api/metricas {"nombre":"CLS","valor":0,"nota":"good",…}
```

Con la CPU cuatro veces más lenta, el INP siguió en 40 ms y el CLS en 0. Con `width` y `height` (y `height: auto` en el CSS, para que la foto se adapte al ancho), el navegador reserva el hueco de la foto antes de que llegue, y ya nada salta. La transición (lección 51) no hace más rápido el calendario: `plazasLibres` es igual de lenta. Lo que cambia es que React pinta «Calculando plazas…» enseguida y hace el render del calendario en segundo plano, cediendo el paso al navegador entre un `Dia` y el siguiente; y el INP mide justo hasta ese primer pintado. Para que el calendario llegue antes, habría que acelerar el cálculo.

### En una SPA, ¿de qué página es cada medida?

Hasta aquí abrí la visita directamente. En la web real se llega desde la portada con un clic en un `<Link>`, y eso, para el navegador, **no es otra página**: es la misma con otra URL (lección 76). El recorrido fue portada, clic en «Cata de sal y flor de sal», clic en «Ver horarios del mes» y salir:

```text
POST /api/metricas {"nombre":"LCP","valor":36,"nota":"good",…,"url":"http://localhost:4180/"}
POST /api/metricas {"nombre":"INP","valor":288,"nota":"needs-improvement",…,"url":"http://localhost:4180/"}
POST /api/metricas {"nombre":"CLS","valor":0.11122652457524272,"nota":"needs-improvement",…,"url":"http://localhost:4180/"}
```

Todo se apunta a la portada: el LCP es el de la portada (la foto de la visita ya no cuenta), y el INP y el CLS, los de la visita. La versión 6 de `web-vitals` puede separarlos: Chrome detecta él solo una **navegación blanda** (un clic, una URL que cambia y algo que se pinta) y, con la opción `reportSoftNavs`, cada ruta tiene sus propias medidas:

```js
onCLS(enviar, { reportSoftNavs: true })
onINP(enviar, { reportSoftNavs: true })
onLCP(enviar, { reportSoftNavs: true })
```

```text
POST /api/metricas {"nombre":"LCP","valor":40,"nota":"good",…,"url":"http://localhost:4180/"}
POST /api/metricas {"nombre":"CLS","valor":0,"nota":"good",…,"url":"http://localhost:4180/"}
POST /api/metricas {"nombre":"INP","valor":16,"nota":"good",…,"url":"http://localhost:4180/"}
POST /api/metricas {"nombre":"LCP","valor":1029.5,"nota":"good",…,"url":"http://localhost:4180/visitas/cata"}
POST /api/metricas {"nombre":"INP","valor":320,"nota":"needs-improvement",…,"url":"http://localhost:4180/visitas/cata"}
POST /api/metricas {"nombre":"CLS","valor":0.11122652457524272,"nota":"needs-improvement",…,"url":"http://localhost:4180/visitas/cata"}
```

Por eso el código envía `metrica.navigationURL` y no `location.pathname`: cuando llega una medida, el usuario puede estar ya en otra ruta. Según la documentación de la librería, las navegaciones blandas solo se miden en navegadores basados en Chromium desde la versión 151; en los demás, la opción no cambia nada.

### Lighthouse frente a datos de campo

**Lighthouse** es la auditoría de la pestaña «Lighthouse» de las herramientas de Chrome y de PageSpeed Insights. Pasé Lighthouse 13.5.0 a la misma página, todavía con los dos defectos. Simula un móvil: la CPU cuatro veces más lenta y una red de 150 ms de latencia y unos 1,6 Mbit/s. Del informe en JSON:

```text
performance                 91
first-contentful-paint      2.3 s
largest-contentful-paint    2.6 s
total-blocking-time         0 ms
cumulative-layout-shift     0.105
speed-index                 2.3 s
```

**Un 91 para una página cuyo botón tarda más de un segundo en responder en un móvil modesto.** Lighthouse carga la página una vez y no toca nada, así que no puede medir INP: en su lugar da el *Total Blocking Time*, el tiempo que el hilo principal estuvo bloqueado durante la carga. Aquí es 0, porque el trabajo lento solo empieza al pulsar. El LCP sí sube, de 1 s a 2,6 s, por la red y la CPU simuladas. Con los dos arreglos, la nota pasó a 94 (CLS 0); el INP, Lighthouse ni lo vio.

Son dos tipos de datos, y [web.dev insiste](https://web.dev/articles/lab-and-field-data-differences) en que los de laboratorio no sustituyen a los de campo:

- **Datos de laboratorio**: Lighthouse, o el panel Performance de Chrome, que enseña LCP, CLS e INP en vivo mientras usas tu página (con INP, porque ahí sí interactúas). Son repetibles: sirven para comparar antes y después de un cambio y para encontrar la causa.
- **Datos de campo**: lo que miden los navegadores de tus usuarios. Los tuyos, con `web-vitals`, o los del Chrome User Experience Report (CrUX), que Google recoge de usuarios reales de Chrome y enseñan PageSpeed Insights y Search Console cuando tu web aparece en él. Son los que deciden si una web cumple: el percentil 75 de cada métrica.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un 90 en Lighthouse significa que la web va bien",
      "realidad": "Lighthouse carga la página una vez, simulada y sin clics: no mide INP. La visita de las Salinas sacaba un 91 con un botón que tardaba 312 ms en responder, y 1160 con la CPU lenta."
    },
    {
      "mito": "Si en mi portátil va fluido, en producción también",
      "realidad": "Con la CPU cuatro veces más lenta, el mismo clic pasó de 312 a 1160 ms. Tus usuarios tienen móviles de todo tipo: mide en su lado."
    },
    {
      "mito": "web-vitals envía las tres métricas al cargar la página",
      "realidad": "LCP se cierra con la primera interacción; INP y CLS, cuando la página pasa a segundo plano. Por eso se envían con sendBeacon, que funciona aunque la página se esté cerrando."
    }
  ]
}
```

## Errores típicos

**Un secreto en una variable `VITE_`.** Acaba en el JavaScript que descarga cualquiera (lección 82). Y quitarlo del `.env` después no lo borra de lo ya publicado, ni de lo que ya estuviera en git. Si una clave se ha publicado, hay que anularla y generar otra.

**Dar por bueno el `npm run preview`.** Funciona en una ruta donde un alojamiento estático da `404`. Cuando prepares el despliegue, prueba el enlace directo en el alojamiento real (o, al menos, con un servidor de archivos sin reglas, como `python3 -m http.server` dentro de `dist/`).

**Cambiar una variable y esperar que cambie la web.** Hace falta construir otra vez. Si pasas de `localhost` a producción y la web sigue llamando a `localhost`, mira de qué construcción es el `dist/` que estás sirviendo.

**Tratar las variables como si tuvieran tipo.** Todas llegan como texto o `undefined`: `'false'` es verdadero, `'25' + 5` es `'255'`, y una variable que falta no lanza ningún error, simplemente es `undefined`. Compara con `'true'`, convierte con `Number(...)` y **comprueba al arrancar que existen las que necesitas**, con un error claro. Es lo que hace el ejercicio. Esta web, por ejemplo, comprueba al iniciarse que están las dos variables de Supabase y, si no, lanza un error que lo dice.

**Olvidar `base` (o `basename`) al publicar en una subcarpeta.** La página carga sin estilos y sin JavaScript: el navegador busca `/assets/...` en la raíz del dominio. Sale un `404` por cada archivo en la pestaña «Red» de las herramientas de desarrollo.

**Dejar `index.html` en caché de más.** Si el alojamiento (o una CDN) guarda `index.html` mucho tiempo, los visitantes siguen recibiendo una versión que apunta a archivos con hash antiguos. Los archivos con hash pueden guardarse mucho, `index.html` no.

**Una librería entera para una función.** `import { groupBy } from 'lodash'` mete los 70 KiB de lodash: con un paquete CommonJS, las llaves no ahorran nada. Mira el informe del analizador y busca la alternativa nativa o en módulos ES.

**Fiarte de Lighthouse y de tu portátil.** Lighthouse no pulsa nada, y tu ordenador es más rápido que el móvil de tus usuarios. Lo que dice si la web va bien son las Core Web Vitals de campo, en el percentil 75.

El siguiente ejercicio junta tres de estas cosas en un componente que lee la configuración como lo haría con `import.meta.env`.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Leer la configuración sin fiarte de ella",
  "consigna": "El objeto entorno hace de import.meta.env (en esta página no hay Vite): cámbialo con el selector «Entorno». Arregla Reservas.jsx para que (1) «Reservas cerradas» salga con «Cierre de temporada» (VITE_RESERVAS_ABIERTAS vale el texto false), (2) la ampliación de verano sume cinco plazas a 25 y dé 30, no «255», y (3) con «Sin configurar», que no tiene VITE_API_URL, salga un aviso claro con role alert que diga que falta VITE_API_URL.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\nimport Reservas from './Reservas.jsx'\n\n// En un proyecto de Vite, este objeto sería import.meta.env.\n// Aquí, en una página sin Vite, lo simulamos con tres entornos.\nconst entornos = {\n  'Producción': {\n    VITE_API_URL: 'https://api.salinasdelpozo.example/v1',\n    VITE_RESERVAS_ABIERTAS: 'true',\n    VITE_PLAZAS_POR_VISITA: '25',\n  },\n  'Cierre de temporada': {\n    VITE_API_URL: 'https://api.salinasdelpozo.example/v1',\n    VITE_RESERVAS_ABIERTAS: 'false',\n    VITE_PLAZAS_POR_VISITA: '25',\n  },\n  'Sin configurar': {},\n}\n\nexport default function App() {\n  const [nombre, setNombre] = useState('Producción')\n\n  return (\n    <main>\n      <label>\n        Entorno\n        <select value={nombre} onChange={(e) => setNombre(e.target.value)}>\n          {Object.keys(entornos).map((clave) => (\n            <option key={clave}>{clave}</option>\n          ))}\n        </select>\n      </label>\n      <Reservas entorno={entornos[nombre]} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Reservas.jsx",
      "codigo": "export default function Reservas({ entorno }) {\n  // Las variables de entorno llegan siempre como texto (o como undefined\n  // si no existen). Arregla aquí cómo se leen.\n  const abiertas = Boolean(entorno.VITE_RESERVAS_ABIERTAS)\n  const plazas = entorno.VITE_PLAZAS_POR_VISITA\n\n  return (\n    <>\n      <h1>Salinas del Pozo</h1>\n      <p>Servidor: {entorno.VITE_API_URL}</p>\n      <p>Plazas por visita: {plazas}</p>\n      <p>Con la ampliación de verano: {plazas + 5} plazas</p>\n      <p role=\"status\">{abiertas ? 'Reservas abiertas' : 'Reservas cerradas'}</p>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: inline-flex;\n  gap: 0.5rem;\n  align-items: center;\n  margin-bottom: 0.75rem;\n}\n\nselect {\n  padding: 0.25rem 0.5rem;\n  font: inherit;\n}\n\np {\n  margin: 0.35rem 0;\n}\n\n[role='alert'] {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "Reservas.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Con «Producción», las reservas están abiertas",
      "pasos": [],
      "espera": {
        "texto": "Reservas abiertas"
      }
    },
    {
      "descripcion": "Con «Producción», la ampliación de verano suma cinco plazas a las 25: son 30",
      "pasos": [],
      "espera": {
        "texto": "Con la ampliación de verano: 30 plazas"
      }
    },
    {
      "descripcion": "Con «Cierre de temporada», las reservas salen cerradas",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Entorno",
            "opcion": "Cierre de temporada"
          }
        }
      ],
      "espera": {
        "texto": "Reservas cerradas"
      }
    },
    {
      "descripcion": "Con «Sin configurar», sale un aviso porque falta VITE_API_URL",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Entorno",
            "opcion": "Sin configurar"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Falta VITE_API_URL"
      }
    },
    {
      "descripcion": "Con «Sin configurar» no se pinta el estado de las reservas",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Entorno",
            "opcion": "Sin configurar"
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

**Retos para seguir practicando** (sin comprobación automática, en un proyecto tuyo de Vite):

1. Crea un `.env.staging` con una dirección de pruebas, construye con `npx vite build --mode staging` y comprueba con `grep` que el `dist/` lleva esa dirección y no la de `.env.production`. Muestra `import.meta.env.MODE` en pantalla.
2. Añade a una variable tuya un valor que no deba publicarse (invéntatelo) y otra con el mismo valor pero con prefijo `VITE_`. Construye y busca el valor con `grep -r` en `dist/`. ¿En cuál de los dos casos aparece?
3. Construye con `npm run build` y sirve `dist/` con `python3 -m http.server`. Recarga en una ruta de React Router. Después añade `public/_redirects` con la regla de Netlify (o un `vercel.json`), vuelve a construir y despliega en el alojamiento que quieras. Repite la prueba con F5.
4. Añade una ruta `path="*"` con una página «No encontrada» a un proyecto con React Router. Comprueba con `npm run preview` que una URL inventada la enseña y que el aviso `No routes matched location` desaparece de la consola.
5. Publica en una subcarpeta (por ejemplo GitHub Pages con `base: '/<tu-repo>/'`) y haz que los enlaces y rutas funcionen con `basename={import.meta.env.BASE_URL}`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Env Variables and Modes",
      "descripcion": "La referencia de Vite: constantes, prefijo VITE_, orden de los archivos .env, modos, NODE_ENV y tipos en TypeScript.",
      "url": "https://vite.dev/guide/env-and-mode",
      "etiqueta": "Vite"
    },
    {
      "titulo": "Deploying a Static Site",
      "descripcion": "La guía de Vite para construir, probar con preview y desplegar en GitHub Pages, Netlify, Vercel, Cloudflare y otros; incluye la opción base.",
      "url": "https://vite.dev/guide/static-deploy",
      "etiqueta": "Vite"
    },
    {
      "titulo": "Rewrites on Vercel",
      "descripcion": "Qué es una reescritura en Vercel, cómo se declara en vercel.json y en qué se distingue de una redirección.",
      "url": "https://vercel.com/docs/routing/rewrites",
      "etiqueta": "Vercel"
    },
    {
      "titulo": "Rewrites and proxies (Netlify)",
      "descripcion": "La sección «History pushState and single-page apps» con la regla del _redirects, y el comportamiento de las reglas frente a archivos que existen.",
      "url": "https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/",
      "etiqueta": "Netlify"
    },
    {
      "titulo": "Environment variables on Vercel",
      "descripcion": "Cómo se definen las variables por entorno (producción, preview, desarrollo) y por qué solo se aplican a los despliegues nuevos.",
      "url": "https://vercel.com/docs/environment-variables",
      "etiqueta": "Vercel"
    },
    {
      "titulo": "Declarative: Installation (React Router)",
      "descripcion": "La instalación del modo declarativo de React Router, de donde sale el BrowserRouter de la lección 76.",
      "url": "https://reactrouter.com/start/declarative/installation",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Web Vitals",
      "descripcion": "Qué miden LCP, INP y CLS, sus umbrales y qué herramientas los miden en el laboratorio y en el campo.",
      "url": "https://web.dev/articles/vitals",
      "etiqueta": "web.dev"
    },
    {
      "titulo": "web-vitals",
      "descripcion": "La librería del equipo de Chrome para medir las Core Web Vitals en los navegadores de tus usuarios, con atribución y navegaciones blandas.",
      "url": "https://github.com/GoogleChrome/web-vitals",
      "etiqueta": "GitHub"
    }
  ]
}
```
