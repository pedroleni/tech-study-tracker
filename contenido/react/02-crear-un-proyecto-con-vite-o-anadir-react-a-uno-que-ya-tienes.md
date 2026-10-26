# Crear un proyecto con Vite… o añadir React a uno que ya tienes

- **Módulo:** Qué es React y primeros pasos
- **Slug:** `crear-un-proyecto-con-vite-o-anadir-react-a-uno-que-ya-tienes` (autogenerado del título)
- **Orden:** 20
- **Fuentes:** [Build a React App from Scratch](https://react.dev/learn/build-a-react-app-from-scratch) + [Creating a React App](https://react.dev/learn/creating-a-react-app) + [Add React to an Existing Project](https://react.dev/learn/add-react-to-an-existing-project) + [Editor Setup](https://react.dev/learn/editor-setup) + [Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) — ver `contenido/react/TEMARIO.md` #2

---

## Qué es y para qué sirve

En la lección anterior React funcionaba dentro de la propia página: esta web lo prepara todo por ti. En tu ordenador hacen falta dos piezas: **Node.js**, que trae `npm` para instalar paquetes, y una **herramienta de construcción** (*build tool*) como [Vite](https://vite.dev/).

¿Por qué no basta con un archivo `.html` y un `<script>`? Por cuatro motivos:

- **El navegador no entiende JSX.** `<h1>Hola</h1>` dentro de un archivo JavaScript es un error de sintaxis para él. Alguien tiene que traducirlo antes a JavaScript normal (en la lección 7 verás a qué).
- **`import { useState } from 'react'` no es una URL.** Apunta a un paquete instalado en `node_modules`, y alguien tiene que encontrarlo y servirlo.
- **Mientras desarrollas quieres ver cada cambio al guardar**, sin recargar la página y sin perder lo que había en pantalla.
- **Para publicar quieres lo contrario:** pocos archivos, pequeños, y con nombres que la caché del navegador no confunda con versiones viejas.

Vite se encarga de las cuatro cosas.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Antes de empezar: Node.js 20.19 o superior",
  "contenido": "Vite 8 necesita Node.js 20.19 o superior, o 22.12 o superior. Compruébalo con node --version en la terminal. Con una versión más antigua, Vite se niega a arrancar con el mensaje «Vite requires Node.js version 20.19+ or 22.12+». Instala la versión LTS desde nodejs.org o con un gestor de versiones como nvm o fnm."
}
```

## Tres formas de empezar

```laboratorio
{
  "tipo": "roles",
  "titulo": "¿Dónde va a vivir tu React?",
  "roles": [
    {
      "etiqueta": "Framework",
      "rol": "Next.js, React Router, Expo",
      "descripcion": "Lo que recomienda react.dev para una app nueva: rutas, carga de datos y renderizado en servidor ya resueltos. Llegan en los módulos 11 y 13."
    },
    {
      "etiqueta": "Desde cero",
      "rol": "Vite (o Parcel, Rsbuild)",
      "descripcion": "Solo React y una herramienta que traduce y sirve tu código. Es lo que usa este temario: sin capas extra, ves React tal cual es."
    },
    {
      "etiqueta": "Por partes",
      "rol": "Una web que ya existe",
      "descripcion": "Montas componentes de React en huecos concretos de una página hecha con otra tecnología, sin reescribir nada."
    }
  ]
}
```

react.dev recomienda un framework para las apps nuevas que van a producción, y documenta empezar desde cero para cuando un framework no encaja o «solo quieres aprender lo básico de una app de React». Este temario empieza desde cero a propósito: un framework añade rutas, servidor y convenciones propias, y todo eso se entiende mucho mejor cuando ya sabes qué hace React por sí solo.

## Crear el proyecto con Vite

Abre una terminal en la carpeta donde guardas tus proyectos y ejecuta:

```bash
npm create vite@latest mi-primera-app
```

El asistente te hace cuatro preguntas:

1. **Select a framework** → `React`.
2. **Select a variant** → `JavaScript`. Verás también variantes con TypeScript (módulo 10), con React Compiler (módulo 9) y accesos directos a frameworks, marcados con ↗.
3. **Which linter to use?** → `Oxlint`, la opción por defecto. Un *linter* lee tu código sin ejecutarlo y avisa de errores, como usar un Hook donde no se puede.
4. **Install with npm and start now?** → `Yes`: instala las dependencias y arranca el servidor de desarrollo.

Si prefieres no contestar preguntas, esto hace lo mismo paso a paso:

```bash
npm create vite@latest mi-primera-app -- --template react
cd mi-primera-app
npm install
npm run dev
```

Los dos guiones sueltos (`--`) separan las opciones de npm de las de create-vite: sin ellos, npm se quedaría `--template` para sí y create-vite nunca lo vería. Cuando el servidor arranca, la terminal muestra:

```text
  VITE v8.3.4  ready in 72 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abre `http://localhost:5173` en el navegador y verás la página de bienvenida, con un botón que dice «Count is 0».

## Qué hay dentro del proyecto

```text
mi-primera-app/
├── index.html         ← la única página HTML, con el hueco de React
├── package.json       ← dependencias y scripts
├── vite.config.js     ← activa el plugin de React
├── .oxlintrc.json     ← reglas del linter
├── public/            ← archivos que se copian tal cual (favicon.svg)
├── node_modules/      ← los paquetes instalados: no se toca ni se sube a Git
└── src/
    ├── main.jsx       ← el punto de entrada
    ├── App.jsx        ← tu primer componente
    ├── App.css
    ├── index.css
    └── assets/        ← imágenes que importas desde el código
```

Todo empieza en `index.html`. Con Vite, este archivo es la puerta de entrada de la app, no un detalle de la carpeta `public`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>",
  "anotaciones": [
    {
      "fragmento": "<html lang=\"en\">",
      "nota": "La plantilla viene en inglés. Si tu página está en español, cámbialo a lang=\"es\": los lectores de pantalla eligen la voz y la pronunciación según este atributo."
    },
    {
      "fragmento": "<title>Vite + React</title>",
      "nota": "El título de la pestaña. Es HTML normal y puedes cambiarlo aquí. React 19 también sabe ponerlo desde un componente, pero eso llega más adelante."
    },
    {
      "fragmento": "<div id=\"root\"></div>",
      "nota": "Un div vacío: es el único trozo de la página que va a gestionar React. Todo lo que pinten tus componentes acaba dentro de él."
    },
    {
      "fragmento": "<script type=\"module\" src=\"/src/main.jsx\"></script>",
      "nota": "El navegador pide main.jsx y Vite se lo entrega ya traducido a JavaScript normal. Al construir para producción, esta línea se cambia por el archivo final, algo como /assets/index-CjD90jDe.js."
    }
  ]
}
```

El script apunta a `src/main.jsx`, que conecta React con ese `div`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.jsx'\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "import { createRoot } from 'react-dom/client'",
      "nota": "React viene en dos paquetes: react tiene lo común (componentes, Hooks) y react-dom lo que sabe hablar con el navegador. createRoot vive en react-dom/client."
    },
    {
      "fragmento": "import './index.css'",
      "nota": "Importar un CSS desde JavaScript no existe en el navegador: es cosa de Vite, que lo inyecta en la página mientras desarrollas y lo saca a un archivo .css al construir."
    },
    {
      "fragmento": "createRoot(document.getElementById('root'))",
      "nota": "Aquí React toma el control del div#root. La lección siguiente se dedica entera a esta línea."
    },
    {
      "fragmento": "<StrictMode>",
      "nota": "Un modo de comprobación que solo actúa en desarrollo: repite a propósito ciertas operaciones para destapar errores. Si ves un console.log repetido, es él. Lo verás en la lección 12."
    },
    {
      "fragmento": "<App />",
      "nota": "Tu componente principal, el de App.jsx. Todo lo demás cuelga de él."
    }
  ]
}
```

Y `vite.config.js` es donde se enchufa React a Vite:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import react from '@vitejs/plugin-react'\nimport { defineConfig } from 'vite'\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n})",
  "anotaciones": [
    {
      "fragmento": "import react from '@vitejs/plugin-react'",
      "nota": "El plugin oficial de React para Vite. Configura la traducción de JSX con Oxc, un compilador escrito en Rust, y activa Fast Refresh."
    },
    {
      "fragmento": "plugins: [react()]",
      "nota": "La lista de plugins de Vite. Cuando actives el React Compiler en el módulo 9, también se configurará desde aquí."
    }
  ]
}
```

## El ciclo de trabajo: dev, build y preview

En `package.json` están los cuatro comandos que trae la plantilla:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "oxlint",
  "preview": "vite preview"
}
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "npm run dev: mientras programas",
      "texto": "Arranca el servidor de desarrollo en http://localhost:5173. Traduce cada archivo al vuelo cuando el navegador lo pide y, al guardar, Fast Refresh sustituye solo el componente que has cambiado, sin recargar la página y conservando su estado."
    },
    {
      "titulo": "npm run build: para publicar",
      "texto": "Genera la carpeta dist con el HTML, un JavaScript minificado y el CSS. Cada archivo lleva un código en el nombre (index-CjD90jDe.js) que cambia cuando cambia su contenido, para que el navegador nunca use una versión vieja de su caché."
    },
    {
      "titulo": "npm run preview: para comprobar la build",
      "texto": "Sirve la carpeta dist en http://localhost:4173 para que pruebes la versión de producción antes de subirla. Es una comprobación local, no un servidor para producción."
    },
    {
      "titulo": "npm run lint: para revisar",
      "texto": "Pasa Oxlint por todo el proyecto y lista los problemas que encuentra sin ejecutar el código. La plantilla ya trae activada rules-of-hooks, que detecta Hooks usados donde no se puede."
    }
  ]
}
```

Esto es lo que imprime `npm run build` con la plantilla recién creada:

```text
dist/index.html                   0.46 kB │ gzip:  0.29 kB
dist/assets/react-CHdo91hT.svg    4.12 kB │ gzip:  2.06 kB
dist/assets/vite-BF8QNONU.svg     8.70 kB │ gzip:  1.60 kB
dist/assets/hero-CLDdwZDr.png    13.05 kB
dist/assets/index-DykytF2W.css    4.10 kB │ gzip:  1.47 kB
dist/assets/index-CjD90jDe.js   222.45 kB │ gzip: 69.28 kB

✓ built in 281ms
```

Ese `.js` de 222 kB (69 kB comprimido) es React más tu código, todo en un archivo. La carpeta `dist` es una web estática completa: se puede subir tal cual a cualquier servicio de hosting estático, como Vercel, Netlify o GitHub Pages.

## La App.jsx de la plantilla, funcionando

Este es el `App.jsx` que genera Vite, sin las imágenes del logo. Fíjate en que define la función arriba y la exporta abajo, con `export default App`: es otra forma de escribir lo mismo que `export default function App()`. La lección 4 lo explica.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Haz tu primer cambio en la plantilla",
  "consigna": "Haz lo que harías en tu proyecto recién creado: cambia el título por «Mi primera app con React» y el texto del botón por «Pulsaciones: N», donde N es el valor de count. La vista previa se actualiza sola mientras escribes. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './App.css'\n\nfunction App() {\n  const [count, setCount] = useState(0)\n\n  return (\n    <section id=\"center\">\n      <h1>Get started</h1>\n      <p>\n        Edit <code>src/App.jsx</code> and save to test <code>HMR</code>\n      </p>\n      <button\n        type=\"button\"\n        className=\"counter\"\n        onClick={() => setCount((count) => count + 1)}\n      >\n        Count is {count}\n      </button>\n    </section>\n  )\n}\n\nexport default App\n"
    },
    {
      "nombre": "App.css",
      "codigo": "#center {\n  display: grid;\n  gap: 0.75rem;\n  justify-items: center;\n  padding: 2rem 1rem;\n  font-family: system-ui, sans-serif;\n  text-align: center;\n}\n\nh1 {\n  margin: 0;\n  font-size: 2rem;\n}\n\ncode {\n  padding: 0.1rem 0.35rem;\n  border-radius: 4px;\n  background: #ece9fb;\n  font-size: 0.9em;\n}\n\n.counter {\n  padding: 0.5rem 1rem;\n  border: 2px solid #8a7cf0;\n  border-radius: 8px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "El título dice «Mi primera app con React»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Mi primera app con React"
      }
    },
    {
      "descripcion": "El botón empieza en «Pulsaciones: 0»",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Pulsaciones: 0"
      }
    },
    {
      "descripcion": "Tras dos pulsaciones, el botón dice «Pulsaciones: 2»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button"
          }
        },
        {
          "pulsar": {
            "rol": "button"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Pulsaciones: 2"
      }
    }
  ]
}
```

En tu ordenador, este cambio tiene una diferencia importante: con `npm run dev` en marcha, si pulsas el botón tres veces y después cambias el título, **el contador sigue en 3**. Eso es Fast Refresh: Vite sustituye el componente sin recargar la página y React conserva su estado. Aquí, en cambio, cada edición vuelve a montar la vista previa desde cero.

## Añadir React a un proyecto que ya existe

No siempre empiezas de cero. React se pensó para adoptarse poco a poco: durante años, en Meta se usó sobre todo así, montado en trozos sueltos de páginas generadas por el servidor. Hay dos maneras.

**Una sección entera.** Si quieres que todo lo que cuelga de `/tienda/` sea React, crea esa parte con un framework, configura `/tienda` como su ruta base (*base path*) y haz que tu servidor o tu proxy le pase esas peticiones.

**Un trozo de una página.** Es el caso más habitual, y se hace en dos pasos. Primero, necesitas un entorno que entienda módulos y JSX: si tu proyecto ya usa `import`, prueba a escribir `<div />` en un archivo y mira si da error de sintaxis; si no tienes nada, Vite tiene integraciones con backends como Rails, Django o Laravel. Después instalas React:

```bash
npm install react react-dom
```

Y en tu HTML, marcas con un `id` cada hueco donde quieres un componente. El resto de la página no cambia:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<header>\n  <h1>Librería Aldaba</h1>\n  <nav id=\"navegacion\"></nav>\n</header>\n<main>\n  <p>Este párrafo lo genera tu servidor, como siempre.</p>\n  <div id=\"carrito\"></div>\n</main>\n<script type=\"module\" src=\"/src/main.jsx\"></script>",
  "anotaciones": [
    {
      "fragmento": "<nav id=\"navegacion\"></nav>",
      "nota": "Un hueco vacío con un id único. React lo encontrará con getElementById y pintará dentro la barra de navegación."
    },
    {
      "fragmento": "<p>Este párrafo lo genera tu servidor, como siempre.</p>",
      "nota": "Lo que está fuera de los huecos sigue siendo de tu servidor o de tus plantillas. React no lo toca."
    },
    {
      "fragmento": "<div id=\"carrito\"></div>",
      "nota": "Un segundo hueco, en otra parte de la página, para otro componente."
    }
  ]
}
```

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createRoot } from 'react-dom/client'\nimport BarraNavegacion from './BarraNavegacion.jsx'\nimport Carrito from './Carrito.jsx'\n\nconst navegacion = createRoot(document.getElementById('navegacion'))\nnavegacion.render(<BarraNavegacion />)\n\nconst carrito = createRoot(document.getElementById('carrito'))\ncarrito.render(<Carrito />)",
  "anotaciones": [
    {
      "fragmento": "createRoot(document.getElementById('navegacion'))",
      "nota": "Cada hueco recibe su propia raíz. React solo gestiona lo que hay dentro de #navegacion."
    },
    {
      "fragmento": "navegacion.render(<BarraNavegacion />)",
      "nota": "Pinta el componente dentro del hueco. Si el nav tenía algo dentro, React lo sustituye."
    },
    {
      "fragmento": "const carrito = createRoot(document.getElementById('carrito'))",
      "nota": "Una segunda raíz, independiente de la primera. Son dos árboles de React separados: no comparten estado ni contexto. Si un día necesitan hablar entre ellos, suele ser señal de que deberían ser un solo árbol."
    }
  ]
}
```

## ¿Y si mi app necesita rutas, datos o servidor?

Vite solo no trae rutas (varias páginas con su URL), ni una forma estándar de cargar datos, ni renderizado en el servidor. Puedes añadirlos con librerías, y el módulo 11 lo hace con React Router. Pero si sabes desde el principio que tu app los necesita, react.dev recomienda empezar directamente con un framework:

- **Next.js** (App Router), mantenido por Vercel: `npx create-next-app@latest`.
- **React Router** en modo framework, mantenido por Shopify: `npx create-react-router@latest`. Usa Vite por debajo.
- **Expo**, para apps nativas de Android e iOS (y web): `npx create-expo-app@latest`.

Un framework **no obliga a tener un servidor**: todos pueden generar una web estática o una app de una sola página, como Vite, y activar las funciones de servidor solo en las rutas que las necesiten.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Si un tutorial empieza con npx create-react-app, es antiguo",
  "contenido": "El equipo de React dejó de recomendar Create React App el 14 de febrero de 2025: no tenía quien lo mantuviera y se había quedado atrás. Hoy, al usarlo, muestra un aviso de obsolescencia. Si heredas un proyecto con react-scripts en su package.json, es de Create React App: funciona, pero conviene migrarlo a Vite o a un framework."
}
```

## Preparar el editor

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un editor que entienda JSX",
      "texto": "VS Code es el más usado y entiende JSX sin instalar nada. WebStorm, Sublime Text o Vim también sirven."
    },
    {
      "titulo": "La extensión de tu linter",
      "texto": "Oxlint (o ESLint, si lo eliges al crear el proyecto) puede subrayarte los errores mientras escribes, en vez de esperar a npm run lint. Instala su extensión para tu editor."
    },
    {
      "titulo": "Un formateador que actúe al guardar",
      "texto": "Prettier ordena sangrías, comillas y saltos de línea. Activa «formatear al guardar» y olvídate de discutir de estilo: el código siempre tendrá la misma forma."
    },
    {
      "titulo": "React Developer Tools",
      "texto": "Extensión para Chrome, Firefox y Edge que deja inspeccionar los componentes de una página, con sus props y su estado. La usarás a fondo en el módulo 9."
    }
  ]
}
```

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Vite es parte de React",
      "realidad": "Son proyectos distintos. Vite sirve igual para Vue, Svelte o JavaScript sin framework; React funciona igual con Parcel, Rsbuild o dentro de un framework. El plugin @vitejs/plugin-react es el puente entre los dos."
    },
    {
      "mito": "Para usar React necesito un servidor Node.js en producción",
      "realidad": "Node.js solo hace falta en tu ordenador para desarrollar y construir. Lo que sale de npm run build son archivos estáticos que sirve cualquier hosting."
    },
    {
      "mito": "La carpeta node_modules hay que subirla con el proyecto",
      "realidad": "No: se regenera con npm install a partir de package.json y package-lock.json. La plantilla ya la incluye en el .gitignore."
    },
    {
      "mito": "npm run dev y npm run build dan el mismo resultado",
      "realidad": "En desarrollo, Vite sirve cada archivo por separado y React incluye avisos y comprobaciones extra. La build está minificada y sin esas ayudas: por eso se comprueba con npm run preview antes de publicar."
    }
  ]
}
```

## Errores típicos

**Abrir `index.html` con doble clic.** Parece lo natural, pero no funciona:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "html",
  "codigo": "<!-- Abres este index.html con doble clic, sin npm run dev -->\n<!doctype html>\n<html lang=\"es\">\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.jsx\"></script>\n  </body>\n</html>",
  "opciones": [
    "La página de bienvenida, con el contador",
    "Una página en blanco",
    "El código de App.jsx como texto"
  ],
  "correcta": 1,
  "explicacion": "Sin servidor, nadie traduce main.jsx: el script no llega a ejecutarse y #root se queda vacío. Arranca npm run dev y abre la dirección que te da. Con dist/index.html pasa lo mismo: compruébalo con npm run preview."
}
```

**`sh: vite: command not found`.** Te has saltado `npm install`. El comando `vite` vive en `node_modules/.bin`, y esa carpeta todavía no existe. Pasa también al clonar un proyecto de otra persona: lo primero, siempre, es `npm install`.

**`npm error enoent Could not read package.json`.** Estás en la carpeta equivocada: npm busca `package.json` en la carpeta actual. Entra en la del proyecto con `cd mi-primera-app`.

**JSX dentro de un archivo `.js`.** Vite solo traduce JSX en archivos `.jsx` (y `.tsx`). Si escribes un componente en `Saludo.js`, Vite 8 se para con:

```text
[builtin:vite-transform] Unexpected JSX expression
  src/Saludo.js:2:10
  Help: JSX syntax is disabled and should be enabled via the parser options
```

La solución es renombrar el archivo a `Saludo.jsx` y cambiar el `import` que lo usa.

**Editar los archivos de `dist`.** Cada `npm run build` borra la carpeta y la genera de nuevo desde `src`: lo que cambies ahí dentro se pierde. Se edita siempre `src`.

## Ejercicios

El ejercicio con comprobación automática es el de la plantilla, más arriba. **Retos para seguir practicando** en tu ordenador:

1. Crea el proyecto con `npm create vite@latest` y arráncalo. Pulsa el contador tres veces y, sin recargar, cambia el título en `App.jsx` y guarda. ¿Se conserva la cuenta? Ahora cambia `useState(0)` por `useState(10)`: ¿qué pasa esta vez?
2. Ejecuta `npm run build`, abre `dist/assets/index-….js` y busca dentro el texto de tu botón. Después sirve la build con `npm run preview`.
3. Cambia `lang="en"` por `lang="es"` y el `<title>` en `index.html`.
4. Crea una página HTML con dos huecos y monta un componente distinto en cada uno con dos `createRoot`, como en la librería del ejemplo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Build a React App from Scratch",
      "descripcion": "La guía oficial para empezar con Vite, Parcel o Rsbuild, y lo que tendrás que resolver tú si no usas un framework: rutas, datos y división del código.",
      "url": "https://react.dev/learn/build-a-react-app-from-scratch",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Creating a React App",
      "descripcion": "Los frameworks que recomienda el equipo de React, con el comando para crear cada uno.",
      "url": "https://react.dev/learn/creating-a-react-app",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Add React to an Existing Project",
      "descripcion": "Cómo meter React en una sección o en un trozo de una página que ya existe.",
      "url": "https://react.dev/learn/add-react-to-an-existing-project",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Editor Setup",
      "descripcion": "Linter, formateador y extensiones recomendadas para trabajar con React.",
      "url": "https://react.dev/learn/editor-setup",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Sunsetting Create React App",
      "descripcion": "Por qué se abandonó Create React App y cómo migrar un proyecto que aún lo usa.",
      "url": "https://react.dev/blog/2025/02/14/sunsetting-create-react-app",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Vite: Getting Started",
      "descripcion": "La guía de Vite: requisitos, plantillas y opciones de create-vite.",
      "url": "https://vite.dev/guide/",
      "etiqueta": "vite.dev"
    }
  ]
}
```
