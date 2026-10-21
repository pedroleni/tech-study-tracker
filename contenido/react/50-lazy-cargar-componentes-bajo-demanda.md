# `lazy`: cargar componentes bajo demanda

- **Módulo:** Asincronía y concurrencia
- **Slug:** `lazy-cargar-componentes-bajo-demanda` (autogenerado del título)
- **Orden:** 500
- **Fuentes:** [lazy](https://react.dev/reference/react/lazy) — ver `contenido/react/TEMARIO.md` #50

---

## Qué es y para qué sirve

En la lección 13 viste el árbol de módulos: Vite empieza por `main.jsx`, sigue cada `import` y mete en el archivo principal todo lo que encuentra. Eso incluye componentes que casi nadie llega a usar. La web del **Jardín Botánico Las Hiedras** tiene una portada con el horario, que ve todo el mundo, y un mapa interactivo del jardín, con cientos de parcelas, que solo abre quien va a ir de visita. Con un `import` normal, el mapa viaja en el archivo principal y **todos los visitantes lo descargan**, lo abran o no.

`lazy` corta esa rama: **declara un componente cuyo código no se descarga hasta la primera vez que se renderiza**.

```jsx
import { lazy } from 'react'

const MapaJardin = lazy(() => import('./MapaJardin.jsx'))
```

`MapaJardin` se usa como cualquier otro componente. La diferencia es que, la primera vez que React intenta pintarlo, el código todavía no está: el componente **se suspende** y el `<Suspense>` más cercano enseña su `fallback` hasta que llega. Ya conoces `<Suspense>` de la lección 48; `lazy` es una de las cosas que lo activan.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas de importar un componente",
  "roles": [
    {
      "etiqueta": "import Mapa from",
      "rol": "Importación estática",
      "descripcion": "Se resuelve antes de ejecutar nada. El módulo va en el archivo principal y se descarga al cargar la página, aunque nunca se renderice."
    },
    {
      "etiqueta": "import(ruta)",
      "rol": "Importación dinámica",
      "descripcion": "Una expresión que pide el módulo cuando se ejecuta y devuelve una promesa con todo lo que exporta. Vite saca ese módulo a un archivo aparte."
    },
    {
      "etiqueta": "lazy(() => import(ruta))",
      "rol": "Componente bajo demanda",
      "descripcion": "Envuelve esa promesa en un componente. React llama a la función la primera vez que lo renderiza y usa el export default del módulo."
    }
  ]
}
```

## `lazy` y `<Suspense>`: el patrón completo

Así queda en un proyecto de Vite. Es el mismo `App.jsx` que se construye más abajo para ver qué archivos salen:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { lazy, Suspense, useState } from 'react'\nimport Portada from './Portada.jsx'\n\nconst MapaJardin = lazy(() => import('./MapaJardin.jsx'))\n\nexport default function App() {\n  const [verMapa, setVerMapa] = useState(false)\n\n  return (\n    <main>\n      <Portada />\n      <button onClick={() => setVerMapa(true)}>Abrir el mapa</button>\n      {verMapa && (\n        <Suspense fallback={<p>Cargando el mapa…</p>}>\n          <MapaJardin />\n        </Suspense>\n      )}\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import Portada from './Portada.jsx'",
      "nota": "Importación estática: la portada la ve todo el mundo nada más entrar, así que tiene sentido que vaya en el archivo principal."
    },
    {
      "fragmento": "const MapaJardin = lazy(",
      "nota": "lazy se llama una vez, en lo alto del módulo, fuera de cualquier componente. Devuelve un componente que se renderiza como cualquier otro, con sus props."
    },
    {
      "fragmento": "() => import('./MapaJardin.jsx')",
      "nota": "La función de carga. No recibe nada y devuelve una promesa. React no la llama al importar App.jsx, sino la primera vez que intenta pintar MapaJardin, y usa la propiedad default de lo que resuelva."
    },
    {
      "fragmento": "{verMapa && (",
      "nota": "Mientras verMapa sea false, MapaJardin no se renderiza y su archivo no se pide. El clic en el botón es lo que dispara la descarga."
    },
    {
      "fragmento": "<Suspense fallback={<p>Cargando el mapa…</p>}>",
      "nota": "Lo que se ve mientras llega el código. Puede estar justo encima o varios niveles más arriba: vale el Suspense más cercano. Cómo colocarlos lo cuenta la lección 48."
    }
  ]
}
```

Por dentro, cada componente `lazy` recorre estos pasos una sola vez:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "La vida de un componente lazy",
  "items": [
    {
      "titulo": "Se declara",
      "texto": "lazy guarda la función de carga sin llamarla. Al cargar la página no se pide nada."
    },
    {
      "titulo": "Primer render: se suspende",
      "texto": "React llama a la función de carga, recibe una promesa pendiente y no puede pintar el componente. El Suspense más cercano enseña su fallback."
    },
    {
      "titulo": "Llega el módulo",
      "texto": "La promesa se resuelve con el módulo. React se queda con su export default y vuelve a intentar el render: ahora sí se pinta."
    },
    {
      "titulo": "Renders siguientes",
      "texto": "La promesa y el componente quedan guardados en el propio lazy. Ni se vuelve a llamar a la función de carga ni sale el fallback: lo ves al cerrar y abrir el mapa."
    }
  ]
}
```

Ahora con la vista previa. Pulsa «Abrir el mapa» y mira la consola: el mensaje de `MapaJardin.jsx` sale justo entonces, no al cargar la página, porque **el módulo no se ejecuta hasta que alguien lo pide**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El mapa del jardín, bajo demanda",
  "consigna": "Pulsa «Abrir el mapa»: sale «Cargando el mapa…» y la consola avisa de que MapaJardin.jsx se evalúa en ese momento. Cierra el mapa y vuelve a abrirlo: ni fallback ni mensaje nuevo. Después cambia esperar(1500) por esperar(0) y repite.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { lazy, Suspense, useState } from 'react'\nimport Portada from './Portada'\nimport './estilos.css'\n\n// En la vista previa no hay red: esperar() hace de descarga lenta.\nconst esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))\n\nconst MapaJardin = lazy(() => esperar(1500).then(() => import('./MapaJardin.jsx')))\n\nexport default function App() {\n  const [verMapa, setVerMapa] = useState(false)\n\n  return (\n    <main>\n      <Portada />\n      <button onClick={() => setVerMapa(!verMapa)}>\n        {verMapa ? 'Cerrar el mapa' : 'Abrir el mapa'}\n      </button>\n      {verMapa && (\n        <Suspense fallback={<p className=\"cargando\">Cargando el mapa…</p>}>\n          <MapaJardin />\n        </Suspense>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "MapaJardin.jsx",
      "codigo": "console.log('MapaJardin.jsx: el módulo se evalúa ahora')\n\nconst ZONAS = [\n  { id: 'rosaleda', nombre: 'Rosaleda', especies: 84 },\n  { id: 'invernadero', nombre: 'Invernadero tropical', especies: 212 },\n  { id: 'estanque', nombre: 'Estanque', especies: 37 },\n  { id: 'rocalla', nombre: 'Rocalla', especies: 120 },\n]\n\nexport default function MapaJardin() {\n  return (\n    <section className=\"mapa\">\n      <h2>Mapa del jardín</h2>\n      <ul>\n        {ZONAS.map((zona) => (\n          <li key={zona.id}>\n            {zona.nombre}: {zona.especies} especies\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Portada.jsx",
      "codigo": "export default function Portada() {\n  return (\n    <header>\n      <h1>Jardín Botánico Las Hiedras</h1>\n      <p>Abierto de martes a domingo, de 10:00 a 19:00.</p>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #d9f99d;\n  border: 2px solid #4d7c0f;\n}\n\n.mapa {\n  border: 2px solid #4d7c0f;\n  border-radius: 8px;\n  padding: 0.25rem 1rem 0.75rem;\n  margin-top: 0.75rem;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo que es real y lo que es simulado en esta vista previa",
  "contenido": "import() funciona de verdad: MapaJardin.jsx no se ejecuta hasta que lazy lo pide, como en tu proyecto. Lo que no hay es red: el archivo ya está en memoria y llega al instante, así que esperar(1500) simula lo que tardaría en descargarse, como hace react.dev en sus ejemplos. Con esperar(0) el fallback sigue asomando un momento: React no cambia un fallback por su contenido antes de 300 ms (lo medimos: el mapa sale a los 304 ms del clic). Lo cuenta la lección 48."
}
```

## Qué gana tu proyecto con Vite: un archivo aparte

En la vista previa todo vive en memoria. En un proyecto de verdad, `lazy` cambia **qué archivos genera el build y cuándo los pide el navegador**. Para verlo, construimos con Vite 8 un proyecto mínimo con el `App.jsx` de antes, una `Portada.jsx` y un `MapaJardin.jsx` que importa su propio CSS y un `parcelas.js` con las 400 parcelas del jardín. Esta es la salida real de `npm run build`:

```text
> jardin-botanico@0.0.0 build
> vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 20 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                        0.34 kB │ gzip:  0.25 kB
dist/assets/MapaJardin-BpVPRyVr.css    0.08 kB │ gzip:  0.09 kB
dist/assets/MapaJardin-fybEjl4n.js    55.67 kB │ gzip:  3.78 kB
dist/assets/index-DeMg7YNn.js        221.72 kB │ gzip: 69.53 kB

✓ built in 59ms
```

El mapa sale en su propio archivo, `MapaJardin-fybEjl4n.js`, con su CSS aparte. A estos trozos se les llama *chunks*, y a la técnica, **división del código** (*code splitting*). Para comparar, la misma app con `import MapaJardin from './MapaJardin.jsx'`:

```text
dist/index.html                   0.41 kB │ gzip:  0.28 kB
dist/assets/index-BpVPRyVr.css    0.08 kB │ gzip:  0.09 kB
dist/assets/index-QGI4qhvW.js   275.48 kB │ gzip: 73.09 kB
```

Todo en un archivo de 275 kB. Con `lazy`, el principal baja a 222 kB y **los 55 kB del mapa solo los descarga quien lo abre**. El `index.html` que genera el build lo deja claro:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!doctype html>\n<html lang=\"es\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Jardín Botánico Las Hiedras</title>\n    <script type=\"module\" crossorigin src=\"/assets/index-DeMg7YNn.js\"></script>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n  </body>\n</html>",
  "anotaciones": [
    {
      "fragmento": "<script type=\"module\" crossorigin src=\"/assets/index-DeMg7YNn.js\"></script>",
      "nota": "El único JavaScript que pide la página al cargar. Lo comprobamos en Chromium sirviendo esta carpeta dist: al entrar, solo se piden / y este archivo."
    },
    {
      "fragmento": "index-DeMg7YNn",
      "nota": "El trozo final es un hash del contenido. Si cambias el código y vuelves a construir, el nombre cambia, y el navegador nunca usa una copia vieja de su caché. Ese mismo detalle es el que da problemas tras un despliegue, como verás más abajo."
    },
    {
      "fragmento": "<div id=\"root\"></div>",
      "nota": "Ni rastro del mapa. Al pulsar «Abrir el mapa», Chromium pidió MapaJardin-fybEjl4n.js y MapaJardin-BpVPRyVr.css, y nada más."
    }
  ]
}
```

¿Quién pide ese archivo? El propio `index-….js`. Esta es, tal cual, la línea en la que se convirtió tu `lazy` después del build:

```js
ee=(0,d.lazy)(()=>b(()=>import(`./MapaJardin-fybEjl4n.js`),__vite__mapDeps([0,1])))
```

Vite ha cambiado `./MapaJardin.jsx` por el nombre del chunk y ha envuelto el `import()` en una función suya (aquí, minificada, se llama `b`). Esa función descarga a la vez el CSS del chunk (`__vite__mapDeps([0,1])` es la lista con los dos archivos) y, si algo falla, lanza el evento `vite:preloadError`. Lo usarás enseguida.

Fíjate también en los números comprimidos: de 73 kB a 70 kB. Las parcelas del mapa son texto muy repetido y se comprimen casi enteras. El grueso del archivo principal es **React y React DOM**: una app con un campo y un párrafo, construida con la misma plantilla, ya ocupa 220 kB. `lazy` compensa cuando lo que separas pesa de verdad: una librería de mapas o de gráficos, un editor de texto enriquecido, un panel de administración entero.

## Dónde se declara: fuera del componente

`lazy` crea un componente nuevo cada vez que se llama. Si lo llamas **dentro** de un componente, cada render crea otro `MapaJardin` distinto, sin nada cargado, y React tiene que volver a pedirlo. Aquí, el contador de visitantes vive en `App`. Marca una zona en el mapa y después pulsa «Sumar visitante»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un lazy declarado dentro de App",
  "consigna": "Marca «Estanque» y pulsa «Sumar visitante» varias veces. Cada vez, el mapa desaparece medio segundo tras «Cargando el mapa…» y la consola vuelve a decir «Pidiendo MapaJardin.jsx». Después mueve la declaración de MapaJardin fuera de App, debajo de esperar, y repite.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { lazy, Suspense, useState } from 'react'\nimport './estilos.css'\n\nconst esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))\n\nexport default function App() {\n  const [visitantes, setVisitantes] = useState(0)\n\n  // Mal: un componente lazy nuevo en cada render de App\n  const MapaJardin = lazy(() => {\n    console.log('Pidiendo MapaJardin.jsx')\n    return esperar(500).then(() => import('./MapaJardin.jsx'))\n  })\n\n  return (\n    <main>\n      <p>Visitantes hoy: {visitantes}</p>\n      <button onClick={() => setVisitantes(visitantes + 1)}>Sumar visitante</button>\n      <Suspense fallback={<p className=\"cargando\">Cargando el mapa…</p>}>\n        <MapaJardin />\n      </Suspense>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "MapaJardin.jsx",
      "codigo": "import { useState } from 'react'\n\nconst ZONAS = ['Rosaleda', 'Invernadero', 'Estanque', 'Rocalla']\n\nexport default function MapaJardin() {\n  const [zona, setZona] = useState('Rosaleda')\n\n  return (\n    <section className=\"mapa\">\n      <h2>Mapa del jardín</h2>\n      {ZONAS.map((nombre) => (\n        <button key={nombre} aria-pressed={zona === nombre} onClick={() => setZona(nombre)}>\n          {nombre}\n        </button>\n      ))}\n      <p>Zona marcada: {zona}</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #d9f99d;\n  border: 2px solid #4d7c0f;\n}\n\n.mapa {\n  border: 2px solid #4d7c0f;\n  border-radius: 8px;\n  padding: 0.25rem 1rem 0.75rem;\n  margin-top: 0.75rem;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

Cada clic en «Sumar visitante» renderiza `App`, `App` crea un `MapaJardin` nuevo y ese componente nuevo **se suspende otra vez**: React esconde el mapa que ya se veía, enseña el fallback y vuelve a llamar a la función de carga. En tu proyecto no se descargaría nada otra vez, porque el navegador ya tiene el módulo, pero el parpadeo es el mismo: el mapa desaparece con cada cambio de estado de `App`, por pequeño que sea, y no vuelve hasta que se resuelve la promesa nueva y pasan los 300 ms de antes.

La página de `lazy` en react.dev avisa de que así **se pierde el estado** del componente. En React 19.3.1 lo hemos comprobado con este ejemplo y la zona marcada sobrevive: cuando termina la carga, React ve que el componente resuelto es la misma función de antes y conserva su estado. Pero el parpadeo basta para no hacerlo nunca. **Declara cada `lazy` en lo alto del módulo**, como un `import`.

## Si el módulo no tiene `export default`

`lazy` usa la propiedad `default` del módulo que le llega. Si el componente se exporta con nombre, `default` no existe. Pulsa «Abrir el mapa»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un mapa exportado con nombre",
  "consigna": "Pulsa «Abrir el mapa» y lee la consola y el recuadro de error. Después arréglalo de las dos formas que se explican debajo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { lazy, Suspense, useState } from 'react'\nimport './estilos.css'\n\nconst MapaJardin = lazy(() => import('./MapaJardin.jsx'))\n\nexport default function App() {\n  const [verMapa, setVerMapa] = useState(false)\n\n  return (\n    <main>\n      <button onClick={() => setVerMapa(true)}>Abrir el mapa</button>\n      {verMapa && (\n        <Suspense fallback={<p className=\"cargando\">Cargando el mapa…</p>}>\n          <MapaJardin />\n        </Suspense>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "MapaJardin.jsx",
      "codigo": "export function MapaJardin() {\n  return (\n    <section className=\"mapa\">\n      <h2>Mapa del jardín</h2>\n      <p>Rosaleda, invernadero tropical, estanque y rocalla.</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #d9f99d;\n  border: 2px solid #4d7c0f;\n}\n\n.mapa {\n  border: 2px solid #4d7c0f;\n  border-radius: 8px;\n  padding: 0.25rem 1rem 0.75rem;\n  margin-top: 0.75rem;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "MapaJardin.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

La consola avisa primero (en tu proyecto, en lugar de `{}` verás el objeto del módulo):

```text
lazy: Expected the result of a dynamic import() call. Instead received: {}

Your code should look like:
  const MyComponent = lazy(() => import('./MyComponent'))
```

Es decir: «lazy esperaba el resultado de una llamada a `import()` dinámico y ha recibido `{}`». Lo que ha recibido es el módulo, pero sin `default`. Y como `module.default` es `undefined`, React no tiene nada que renderizar y el error de render es:

```text
Element type is invalid. Received a promise that resolves to: undefined. Lazy element type must resolve to a class or function.
```

«Tipo de elemento no válido: se ha recibido una promesa que se resuelve en `undefined`, y un tipo lazy tiene que resolverse en una clase o una función». Hay dos arreglos:

```jsx
// 1. En MapaJardin.jsx: exportarlo por defecto
export default function MapaJardin() { /* … */ }

// 2. Sin tocar MapaJardin.jsx: convertir la exportación con nombre en default
const MapaJardin = lazy(() =>
  import('./MapaJardin.jsx').then((modulo) => ({ default: modulo.MapaJardin })),
)
```

El segundo sirve cuando el archivo exporta varios componentes, o cuando no es tuyo: lo que pide `lazy` es **una promesa de un objeto con `default`**, venga de donde venga.

## Si la descarga falla

En la vista previa el archivo nunca falla. En producción, un chunk es otra petición, y puede fallar: el usuario se queda sin cobertura en el tren, o, lo más frecuente, **despliegas una versión nueva mientras alguien tiene la página abierta**. Su `index-….js` es el viejo y pide `MapaJardin-fybEjl4n.js`, pero en el servidor ya solo está el chunk nuevo, con otro hash. Lo reprodujimos en Chromium sirviendo la carpeta `dist` con un 404 para ese archivo:

```text
Failed to fetch dynamically imported module: http://localhost:4812/assets/MapaJardin-fybEjl4n.js
```

«No se pudo descargar el módulo importado dinámicamente». La promesa de `import()` se rechaza, y `lazy` hace con el rechazo lo mismo que con un error de render: lo lanza para que lo recoja el *error boundary* más cercano. Sin ninguno, como en esa prueba, **la página se quedó en blanco**: un error sin capturar desmonta la app entera (lección 3). Los error boundaries tienen su lección, la 53. Con uno puesto, hay una sorpresa:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "let intentos = 0\n\nconst MapaJardin = lazy(() => {\n  intentos++\n  // La primera vez se cae la red; la segunda iría bien\n  if (intentos === 1) return Promise.reject(new Error('Sin conexión'))\n  return import('./MapaJardin.jsx')\n})\n\n// LimiteDeError es el error boundary de la lección 53:\n// si algo falla dentro, enseña «No se pudo cargar» y un\n// botón «Reintentar» que vuelve a pintar sus hijos.\n<LimiteDeError>\n  <Suspense fallback={<p>Cargando el mapa…</p>}>\n    <MapaJardin />\n  </Suspense>\n</LimiteDeError>\n\n// Abres el mapa: sale «No se pudo cargar».\n// Pulsas «Reintentar». ¿Qué pasa?",
  "opciones": [
    "Se vuelve a pedir el archivo y aparece el mapa",
    "Vuelve a salir «No se pudo cargar», y la función de carga no se ha vuelto a llamar",
    "Se queda en «Cargando el mapa…» para siempre"
  ],
  "correcta": 1,
  "explicacion": "lazy guarda el resultado de la primera carga, también si fue un error. Al reintentar, React vuelve a renderizar MapaJardin y lazy lanza el mismo error sin llamar a la función: intentos sigue en 1. Lo comprobamos en la vista previa con un error boundary real. Para reintentar de verdad hace falta otro componente lazy o, lo más sencillo, recargar la página."
}
```

Recargar es, además, lo correcto en el caso del despliegue: la página recargada trae el `index.html` nuevo, que apunta a los chunks nuevos. Vite te avisa con el evento `vite:preloadError`, que lanza esa función envoltorio del `import()` cuando no consigue cargar un chunk. Su documentación propone esto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\n\n// Un chunk que ya no existe tras un despliegue: recarga\n// para traer el index.html nuevo, con los nombres nuevos.\nwindow.addEventListener('vite:preloadError', () => {\n  window.location.reload()\n})\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "window.addEventListener('vite:preloadError', () => {",
      "nota": "Un evento de Vite, no de React ni del navegador. Va en main.jsx porque se registra una vez, antes de que nada pida un chunk. El evento trae el error original en event.payload."
    },
    {
      "fragmento": "window.location.reload()",
      "nota": "Para que funcione, el servidor tiene que servir index.html con la cabecera Cache-Control: no-cache. Si no, el navegador reutiliza el HTML viejo, que sigue apuntando a los chunks que ya no existen. Lo avisa la guía de Vite."
    },
    {
      "fragmento": "<App />",
      "nota": "El error boundary sigue siendo útil para lo demás: si la red de verdad no está, recargar tampoco servirá, y conviene enseñar un mensaje y un botón en vez de una página en blanco."
    }
  ]
}
```

## Precargar antes del clic

Una mejora frecuente: empezar la descarga cuando el usuario **está a punto** de pedir el componente, al pasar el ratón por el botón o al llegar a él con el tabulador. Como `import()` de un módulo ya pedido devuelve ese mismo módulo, basta con llamar a la misma función de carga antes:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { lazy, Suspense, useState } from 'react'\nimport Portada from './Portada.jsx'\n\nconst cargarMapa = () => import('./MapaJardin.jsx')\nconst MapaJardin = lazy(cargarMapa)\n\nexport default function App() {\n  const [verMapa, setVerMapa] = useState(false)\n\n  return (\n    <main>\n      <Portada />\n      <button\n        onPointerEnter={cargarMapa}\n        onFocus={cargarMapa}\n        onClick={() => setVerMapa(true)}\n      >\n        Abrir el mapa\n      </button>\n      {verMapa && (\n        <Suspense fallback={<p>Cargando el mapa…</p>}>\n          <MapaJardin />\n        </Suspense>\n      )}\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const cargarMapa = () => import('./MapaJardin.jsx')",
      "nota": "La función de carga, con nombre, para usarla en dos sitios. El navegador descarga y ejecuta cada módulo una sola vez: el segundo import() recibe el mismo módulo."
    },
    {
      "fragmento": "const MapaJardin = lazy(cargarMapa)",
      "nota": "lazy recibe la misma función. Cuando la llame en el primer render, el archivo ya estará descargado o a medio camino."
    },
    {
      "fragmento": "onPointerEnter={cargarMapa}",
      "nota": "Al pasar el ratón o el dedo por encima. Entre ese momento y el clic suelen pasar unos cientos de milisegundos, que son descarga ganada."
    },
    {
      "fragmento": "onFocus={cargarMapa}",
      "nota": "Lo mismo para quien navega con el teclado y llega al botón con el tabulador."
    }
  ]
}
```

Lo comprobamos en Chromium con el build de este código: al pasar el ratón se pidieron `MapaJardin-….js` y su CSS, y al pulsar no se pidió nada más. Ojo con lo que **no** te ahorra: el clic todavía enseñó «Cargando el mapa…» un instante, y el mapa apareció unos 300 ms después. `lazy` no sabe que el módulo ya está hasta que su promesa se resuelve, así que se suspende igual, y React no cambia el fallback por el mapa antes de esos 300 ms. Con una red lenta, la diferencia entre 300 ms y dos segundos es lo que te llevas.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Páginas enteras",
      "texto": "Cada ruta de una app en su propio chunk: quien entra en la portada no descarga el panel de su cuenta. Con React Router se combina lazy con cada ruta, y lo harás en el proyecto del recetario (lección 93)."
    },
    {
      "titulo": "Piezas que arrastran una librería pesada",
      "texto": "Un mapa, un gráfico, un editor de texto enriquecido, un visor de PDF. Es donde más se nota, porque la librería se va con el componente al chunk."
    },
    {
      "titulo": "Lo que abre poca gente",
      "texto": "El panel de administración, los ajustes, una zona de socios, un diálogo de exportar. Cuanto menos se usa, más sentido tiene que no viaje en el archivo principal."
    },
    {
      "titulo": "Esta misma web",
      "texto": "Los motores de SQL, PostgreSQL y Git, el compilador de TypeScript y el transformador que ejecuta estos bloques de React se cargan con import() solo en las lecciones que los usan. Lo verás por dentro en la lección 86."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Lo que se ve nada más entrar: con lazy, el navegador descarga el principal, lo ejecuta, renderiza, y solo entonces pide el chunk, con un fallback en medio. Tampoco para componentes pequeños: cada chunk es una petición más."
    }
  ]
}
```

## Errores típicos

**Declarar el `lazy` dentro del componente.** Ya lo has visto: con cada render del padre, el contenido se esconde tras el fallback y la función de carga se vuelve a llamar. Siempre en lo alto del módulo.

**Olvidar el `<Suspense>`.** No hay ningún error que te avise: pasa lo que viste en la lección 48 con la ficha sin límite. Lo comprobamos con el mapa: sin ningún `<Suspense>` por encima, el clic en «Abrir el mapa» no cambió nada en pantalla hasta que llegó el archivo, y un clic en el contador de visitantes durante la espera se quedó en la cola, sin pintarse, hasta ese momento. La app parece colgada. Cada componente `lazy` necesita un `<Suspense>` por encima.

**Poner llaves en la función de carga.** Parece la misma función de carga, solo que escrita en varias líneas:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const MapaJardin = lazy(() => {\n  import('./MapaJardin.jsx')\n})\n\n// MapaJardin.jsx tiene su export default.\n// ¿Qué pasa al pulsar «Abrir el mapa»?",
  "opciones": [
    "Funciona igual que sin llaves",
    "Un error: «Cannot read properties of undefined (reading 'then')»",
    "El error «Element type is invalid» de la sección anterior",
    "Se queda en «Cargando el mapa…» para siempre"
  ],
  "correcta": 1,
  "explicacion": "Con llaves, la flecha es un bloque y no devuelve nada si no escribes return: el import() se ejecuta, pero su promesa se pierde. La función de carga devuelve undefined, React intenta llamar a su then y el render falla con ese error, comprobado en la vista previa. Sin llaves, o con return delante del import()."
}
```

**Exportar con nombre y olvidar el `default`.** Es la sección de antes: el aviso «lazy: Expected the result of a dynamic import() call» y el error «Element type is invalid». Exporta por defecto o convierte el módulo con `.then`.

**Esperar que «Reintentar» vuelva a pedir el archivo.** `lazy` guarda también el fallo. Para un chunk que no se pudo descargar, recarga la página.

**Separar lo que todo el mundo ve al entrar.** Un `lazy` en la portada no ahorra nada: el chunk se va a pedir siempre, y encima después del principal, con un fallback en medio. Divide lo que se abre después.

## Ejercicios

La web del jardín carga el mapa y la zona de socios con importaciones normales, así que los dos viajan en el archivo principal aunque casi nadie los abra. Sácalos con `lazy`. Ojo: `ZonaSocios.jsx` exporta su componente **con nombre**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio: el mapa y la zona de socios, bajo demanda",
  "consigna": "Convierte MapaJardin y ZonaSocios en componentes lazy, declarados fuera de App, con esperar(800) antes de cada import(). Envuelve cada uno en su Suspense: «Cargando el mapa…» para el mapa y «Cargando la zona de socios…» para la zona de socios. No cambies ZonaSocios.jsx.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Portada from './Portada'\nimport MapaJardin from './MapaJardin'\nimport { ZonaSocios } from './ZonaSocios'\nimport './estilos.css'\n\n// En la vista previa no hay red: pon esperar(800) delante de cada\n// import() para notar la descarga, como en los ejemplos de la lección.\nconst esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))\n\nexport default function App() {\n  const [panel, setPanel] = useState(null)\n\n  return (\n    <main>\n      <Portada />\n      <nav aria-label=\"Secciones\">\n        <button onClick={() => setPanel('mapa')}>Abrir el mapa</button>\n        <button onClick={() => setPanel('socios')}>Zona de socios</button>\n      </nav>\n      {/* Carga los dos paneles con lazy, cada uno con su fallback */}\n      {panel === 'mapa' && <MapaJardin />}\n      {panel === 'socios' && <ZonaSocios />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "MapaJardin.jsx",
      "codigo": "export default function MapaJardin() {\n  return (\n    <section className=\"mapa\">\n      <h2>Mapa del jardín</h2>\n      <ul>\n        <li>Rosaleda: 84 especies</li>\n        <li>Invernadero tropical: 212 especies</li>\n        <li>Estanque: 37 especies</li>\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "ZonaSocios.jsx",
      "codigo": "export function ZonaSocios() {\n  return (\n    <section className=\"mapa\">\n      <h2>Zona de socios</h2>\n      <p>Tu carné caduca el 31 de diciembre.</p>\n      <p>Próxima visita guiada para socios: sábado a las 11:00.</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Portada.jsx",
      "codigo": "export default function Portada() {\n  return (\n    <header>\n      <h1>Jardín Botánico Las Hiedras</h1>\n      <p>Abierto de martes a domingo, de 10:00 a 19:00.</p>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #365314;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #d9f99d;\n  border: 2px solid #4d7c0f;\n}\n\n.mapa {\n  border: 2px solid #4d7c0f;\n  border-radius: 8px;\n  padding: 0.25rem 1rem 0.75rem;\n  margin-top: 0.75rem;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Abrir el mapa», se lee «Cargando el mapa…» mientras llega",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Abrir el mapa"
          }
        }
      ],
      "espera": {
        "texto": "Cargando el mapa…"
      }
    },
    {
      "descripcion": "Después aparece el mapa, con su título «Mapa del jardín»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Abrir el mapa"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Mapa del jardín"
      }
    },
    {
      "descripcion": "Al pulsar «Zona de socios», se lee «Cargando la zona de socios…» mientras llega",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Zona de socios"
          }
        }
      ],
      "espera": {
        "texto": "Cargando la zona de socios…"
      }
    },
    {
      "descripcion": "Después aparece la zona de socios, con su título y la fecha del carné",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Zona de socios"
          }
        }
      ],
      "espera": {
        "texto": "Tu carné caduca el 31 de diciembre."
      }
    },
    {
      "descripcion": "Se puede pasar del mapa a la zona de socios",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Abrir el mapa"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Mapa del jardín"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Zona de socios"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Zona de socios"
      }
    }
  ]
}
```

Si el mapa funciona y la zona de socios rompe la vista previa con «Element type is invalid», es la trampa del enunciado: `lazy` busca `default` y `ZonaSocios.jsx` no lo tiene. Conviértelo con `.then((modulo) => ({ default: modulo.ZonaSocios }))`, después del `import()`.

**Retos para seguir practicando** (sin comprobación automática):

1. Precarga el mapa al pasar el ratón por «Abrir el mapa» y al llegar con el tabulador. En la vista previa, el retraso de `esperar` se repetiría con cada llamada: guarda la promesa en una variable de módulo (`let promesaMapa`) y devuélvela si ya existe, que es lo que hace el navegador con un módulo ya pedido.
2. Escribe una función `cargarConFallo(cargar)` que rechace la primera llamada con un `Error('Sin conexión')` y úsala con la zona de socios. Copia el `LimiteDeError` de la lección 53, con su botón «Reintentar», y comprueba que «Reintentar» no vuelve a llamar a tu función. Después cambia el botón por uno que recargue la página.
3. En tu proyecto de Vite, ejecuta `npm run build` antes y después de pasar un componente a `lazy`, y compara las líneas de `dist/assets`. ¿Cuánto baja el archivo principal? ¿Y comprimido?
4. Cambia los dos `<Suspense>` por uno solo alrededor de los dos paneles. Abre el mapa, espera a que salga y pulsa «Zona de socios»: el fallback sustituye al mapa mientras llega. En la lección 51 verás cómo dejar el mapa a la vista hasta entonces, y por qué con dos `<Suspense>` separados no se puede.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "lazy",
      "descripcion": "La referencia: la función de carga, qué tiene que devolver, la caché de la promesa y el aviso de no declararlo dentro de un componente.",
      "url": "https://react.dev/reference/react/lazy",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Suspense>",
      "descripcion": "Qué activa un límite de Suspense, cómo se anidan y por qué una transición no esconde lo que ya se ve. Es la lección 48.",
      "url": "https://react.dev/reference/react/Suspense",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "import()",
      "descripcion": "La importación dinámica de JavaScript: qué devuelve la promesa, el objeto del módulo y su propiedad default.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Building for Production: Load Error Handling",
      "descripcion": "El evento vite:preloadError y por qué el index.html debe servirse sin caché tras un despliegue.",
      "url": "https://vite.dev/guide/build#load-error-handling",
      "etiqueta": "Vite"
    },
    {
      "titulo": "Features: Build Optimizations",
      "descripcion": "Lo que Vite hace con cada chunk: separar su CSS y descargar a la vez lo que necesita.",
      "url": "https://vite.dev/guide/features#build-optimizations",
      "etiqueta": "Vite"
    },
    {
      "titulo": "Reduce JavaScript payloads with code splitting",
      "descripcion": "Por qué dividir el código mejora la carga, y cómo medirlo con las herramientas del navegador.",
      "url": "https://web.dev/articles/reduce-javascript-payloads-with-code-splitting",
      "etiqueta": "web.dev"
    }
  ]
}
```
