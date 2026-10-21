# `use`: leer promesas y contexto

- **Módulo:** Asincronía y concurrencia
- **Slug:** `use-leer-promesas-y-contexto` (autogenerado del título)
- **Orden:** 490
- **Fuentes:** [use](https://react.dev/reference/react/use) — ver `contenido/react/TEMARIO.md` #49

---

## Qué es y para qué sirve

En la lección 48 la ficha de cada sala del acuario se leía con una línea, `use(leer(ruta))`, y el `<Suspense>` de encima se encargaba de la espera. Esta lección abre esa línea. **`use` lee un recurso durante el render**: el valor de una promesa o el de un contexto.

```jsx
import { use } from 'react'

const hornada = use(promesaHornada)   // espera a que la promesa termine
const tema = use(TemaContext)         // lee el contexto, como useContext
```

Empieza por `use`, pero react.dev deja claro que **no es un Hook**: a diferencia de ellos, puede ir dentro de un `if` o de un bucle. Lo que sí comparte con los Hooks es que solo se llama durante el render de un componente o de un Hook propio.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que puede leer use",
  "roles": [
    {
      "etiqueta": "use(promesa)",
      "rol": "el valor de una promesa",
      "descripcion": "Si ya ha terminado, lo devuelve. Si no, suspende el componente y enseña el Suspense más cercano. Si se rechaza, lanza el error al error boundary más cercano."
    },
    {
      "etiqueta": "use(Contexto)",
      "rol": "el valor de un contexto",
      "descripcion": "Igual que useContext (lección 28): el valor del proveedor más cercano por encima. Pero puede leerse dentro de un if, de un bucle o después de un return."
    },
    {
      "etiqueta": "use(browser())",
      "rol": "solo en el navegador",
      "descripcion": "Desde React 19.3, marca un componente que no puede renderizarse en el servidor. Es de la lección 87."
    }
  ]
}
```

## Leer una promesa con `use`

El Obrador La Hogaza enseña en su web la hornada de cada día, que llega del servidor. `Hornada` le pasa a `use` la promesa de la petición y recibe directamente los datos. La función `leer` es la misma caché mínima de la lección 48: la primera vez que alguien pide una ruta crea la promesa, y las siguientes devuelve esa misma.

Pulsa «Bollería» y luego vuelve a «Panes»: la primera visita a cada categoría pasa por el fallback; las siguientes son instantáneas.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La hornada de hoy",
  "codigo": "import { Suspense, use, useState } from 'react'\n\nconst cache = new Map()\nfunction leer(ruta) {\n  if (!cache.has(ruta)) {\n    cache.set(ruta, fetch(ruta).then((res) => res.json()))\n  }\n  return cache.get(ruta)\n}\n\nconst euros = (precio) =>\n  precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })\n\nfunction Hornada({ categoria }) {\n  const hornada = use(leer(`/api/hornadas/${categoria}`))\n\n  return (\n    <ul className=\"hornada\">\n      {hornada.piezas.map((pieza) => (\n        <li key={pieza.nombre}>\n          {pieza.nombre}: {euros(pieza.precio)}\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nconst CATEGORIAS = [\n  { id: 'panes', nombre: 'Panes' },\n  { id: 'bolleria', nombre: 'Bollería' },\n  { id: 'dulces', nombre: 'Dulces' },\n]\n\nexport default function App() {\n  const [categoria, setCategoria] = useState('panes')\n\n  return (\n    <main>\n      <h1>Obrador La Hogaza</h1>\n      <nav aria-label=\"Categorías\">\n        {CATEGORIAS.map((c) => (\n          <button\n            key={c.id}\n            aria-pressed={c.id === categoria}\n            onClick={() => setCategoria(c.id)}\n          >\n            {c.nombre}\n          </button>\n        ))}\n      </nav>\n      <Suspense fallback={<p className=\"cargando\">Sacando la hornada…</p>}>\n        <Hornada categoria={categoria} />\n      </Suspense>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}",
  "anotaciones": [
    {
      "fragmento": "const hornada = use(leer(`/api/hornadas/${categoria}`))",
      "nota": "use recibe una promesa y devuelve su valor: el objeto que manda el servidor. No hay await, porque un componente no puede ser async (lección 44). Si la promesa sigue pendiente, use suspende el componente aquí mismo."
    },
    {
      "fragmento": "hornada.piezas.map",
      "nota": "Debajo de use, los datos siempre están. Nada de comprobar si hornada es null ni de un estado de carga: de eso se encarga el Suspense."
    },
    {
      "fragmento": "if (!cache.has(ruta)) {",
      "nota": "Solo la primera lectura de cada ruta crea la promesa. Las demás, de este render o de cualquier otro, reciben la misma. Es la pieza que hace que todo funcione, y la siguiente sección explica por qué."
    },
    {
      "fragmento": "<Suspense fallback={<p className=\"cargando\">Sacando la hornada…</p>}>",
      "nota": "Lo que se ve mientras Hornada está suspendido (lección 48). Sin él, esperaría la app entera, en blanco."
    }
  ],
  "mostrarConsola": false,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "red": {
    "latencia": 1200
  }
}
```

Según cómo esté la promesa cuando el componente llama a `use`, pasa una de estas tres cosas:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Pendiente: el componente se suspende",
      "texto": "use interrumpe el render en esa línea. React enseña el fallback del Suspense más cercano y, cuando la promesa termina, vuelve a ejecutar el componente desde el principio."
    },
    {
      "titulo": "Cumplida: devuelve el valor",
      "texto": "En el siguiente intento, use recibe la misma promesa, ya terminada, y devuelve su valor sin esperar. El componente sigue y se pinta."
    },
    {
      "titulo": "Rechazada: lanza el error",
      "texto": "use lanza el motivo del rechazo, como si el componente hubiera hecho throw. Lo recoge el error boundary más cercano; lo verás más abajo."
    }
  ]
}
```

## La promesa no puede nacer en el render

Fíjate en la primera nota: cuando la promesa termina, React **vuelve a ejecutar el componente desde el principio**. Y si ese componente se suspendió antes de haberse montado nunca, React no guarda nada de aquel intento: ni estado, ni refs, ni memorizaciones. Así que la tentación obvia acaba en bucle:

```jsx
// 🚩 Así no
const hornada = use(fetch('/api/hornadas/panes').then((res) => res.json()))
```

Cada ejecución crea una petición nueva, con una promesa nueva que, claro, está pendiente. El componente se suspende, la promesa termina, React lo vuelve a ejecutar… y vuelta a empezar. En este bloque, `pedir` hace la petición sin caché y lleva un freno para que la demo no siga para siempre:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una promesa nueva en cada render",
  "consigna": "Mira el panel de red: cada segundo sale una petición nueva a /api/hornadas/panes y el fallback no se va nunca, aunque todas las respuestas llegan bien. Hasta que salta el freno de pedir.jsx, la consola no dice nada. Arréglalo con una caché: un Map fuera de la función, de modo que pedir solo haga el fetch la primera vez que recibe una ruta y después devuelva la promesa guardada.",
  "archivos": [
    {
      "nombre": "Escaparate.jsx",
      "codigo": "import { use } from 'react'\nimport { pedir } from './pedir'\n\nexport default function Escaparate() {\n  // 🚩 Una promesa nueva cada vez que se ejecuta el componente\n  const hornada = use(pedir('/api/hornadas/panes'))\n\n  return (\n    <ul className=\"hornada\">\n      {hornada.piezas.map((pieza) => (\n        <li key={pieza.nombre}>{pieza.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "pedir.jsx",
      "codigo": "// Hace la petición, sin caché. Lleva un freno para que el bucle no cuelgue\n// la vista previa: a partir de la petición 15, lanza un error.\nlet peticiones = 0\n\nexport function pedir(ruta) {\n  peticiones += 1\n  if (peticiones > 15) {\n    throw new Error('Freno de la demo: 15 peticiones y la hornada sigue sin verse')\n  }\n  return fetch(ruta).then((res) => res.json())\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense } from 'react'\nimport Escaparate from './Escaparate'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Obrador La Hogaza</h1>\n      <Suspense fallback={<p className=\"cargando\">Sacando la hornada…</p>}>\n        <Escaparate />\n      </Suspense>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "Escaparate.jsx",
  "mostrarConsola": true,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "red": {
    "latencia": 1000
  }
}
```

Guardar la promesa en un `useState`, un `useRef` o un `useMemo` del mismo componente no lo arregla: el componente nunca llega a montarse, así que React tira todo eso en cada intento y la promesa vuelve a crearse. **La promesa tiene que vivir fuera del componente que la lee.**

### El aviso de React, y por qué casi nunca lo verás aquí

React tiene un aviso para este error, el que la lección 64 incluye en su lista. Pero solo puede darlo cuando la promesa nueva termina tan deprisa que React llega a repetir el mismo intento de render y descubre que la promesa ha cambiado. Con una petición de red de verdad casi nunca ocurre: React se rinde antes, enseña el fallback y empieza de cero más tarde, sin decir nada, como acabas de ver.

Donde sí salta es con una función `async` que no espera a nada lento. Esta cesta lee lo guardado en `localStorage` con una función asíncrona:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Una promesa que termina enseguida: funciona, pero React avisa",
  "codigo": "import { Suspense, use } from 'react'\n\nasync function leerCesta() {\n  const guardada = localStorage.getItem('cesta')\n  return guardada ? JSON.parse(guardada) : ['Hogaza de centeno', 'Caracola de canela']\n}\n\nfunction Cesta() {\n  const piezas = use(leerCesta())\n\n  return (\n    <ul className=\"hornada\">\n      {piezas.map((pieza) => (\n        <li key={pieza}>{pieza}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Tu cesta</h1>\n      <Suspense fallback={<p className=\"cargando\">Abriendo la cesta…</p>}>\n        <Cesta />\n      </Suspense>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}",
  "anotaciones": [
    {
      "fragmento": "async function leerCesta() {",
      "nota": "Una función async devuelve siempre una promesa nueva, aunque dentro no espere a nada. Llamarla es crear una promesa."
    },
    {
      "fragmento": "const piezas = use(leerCesta())",
      "nota": "El mismo error que antes: una promesa creada en el render. Como termina casi al instante, React consigue repetir el intento, usa la promesa anterior y pinta la cesta. Pero la consola avisa de que la promesa no está en ninguna caché."
    }
  ],
  "mostrarConsola": true
}
```

El aviso, en la consola:

```text
A component was suspended by an uncached promise. Creating promises inside a Client Component or hook is not yet supported, except via a Suspense-compatible library or framework.
```

Es decir: «un componente se ha suspendido con una promesa que no está en caché. Crear promesas dentro de un Client Component o de un Hook todavía no está soportado, salvo a través de una librería o un framework compatible con Suspense». *Client Component* es el componente de siempre, el que se ejecuta en el navegador; la lección 88 explica de dónde sale el nombre. **Si lo ves, busca un `use(...)` que recibe una promesa recién creada.** Y si no lo ves, no te fíes: el bucle silencioso del bloque anterior es el mismo error.

## De dónde sale entonces la promesa

Lo que importa no es dónde se escribe la llamada, sino que **cada render reciba la misma promesa**. Hay tres formas buenas de conseguirlo:

- **De una caché**, como `leer`: una clave (la ruta) y una promesa por clave, guardadas fuera de los componentes. Por eso `use(leer(ruta))` sí puede ir en el render: crea la promesa la primera vez y después siempre devuelve la misma.
- **De un manejador de eventos**: el clic crea la promesa una sola vez y la guarda en el estado de un componente que no se suspende, que se la pasa como prop al que la lee.
- **De un framework, una librería o un Server Component**: el router, TanStack Query o el servidor (lección 88) te dan la promesa ya creada y cacheada. En una app real es lo más habitual.

La segunda forma, funcionando:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La promesa nace en el clic",
  "codigo": "import { Suspense, use, useState } from 'react'\n\nfunction Encargos({ promesaEncargos }) {\n  const encargos = use(promesaEncargos)\n\n  return (\n    <ul className=\"hornada\">\n      {encargos.map((encargo) => (\n        <li key={encargo.id}>\n          {encargo.hora} · {encargo.cliente}: {encargo.pieza}\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [promesaEncargos, setPromesaEncargos] = useState(null)\n\n  function verEncargos() {\n    setPromesaEncargos(fetch('/api/encargos').then((res) => res.json()))\n  }\n\n  return (\n    <main>\n      <h1>Encargos para mañana</h1>\n      <button onClick={verEncargos}>Ver encargos</button>\n      {promesaEncargos && (\n        <Suspense fallback={<p className=\"cargando\">Repasando la libreta…</p>}>\n          <Encargos promesaEncargos={promesaEncargos} />\n        </Suspense>\n      )}\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}",
  "anotaciones": [
    {
      "fragmento": "setPromesaEncargos(fetch('/api/encargos').then((res) => res.json()))",
      "nota": "La promesa se crea en el manejador, una vez por clic, y se guarda en el estado. Ningún render la crea, así que todos los intentos de Encargos reciben la misma."
    },
    {
      "fragmento": "const [promesaEncargos, setPromesaEncargos] = useState(null)",
      "nota": "El estado vive en App, que no se suspende nunca: está por encima del Suspense. Por eso no se pierde mientras Encargos espera."
    },
    {
      "fragmento": "const encargos = use(promesaEncargos)",
      "nota": "Encargos solo lee. Se suspende hasta que la promesa termina y después pinta la lista."
    },
    {
      "fragmento": "<button onClick={verEncargos}>Ver encargos</button>",
      "nota": "Pulsa otra vez cuando ya veas la lista: es una promesa nueva, así que hay petición nueva en el panel de red y el fallback vuelve. Para que la lista anterior se quede a la vista mientras tanto, hace falta una transición (lección 51)."
    }
  ],
  "mostrarConsola": false,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "red": {
    "latencia": 1200
  }
}
```

Esta forma tiene otra ventaja: **la petición empieza en cuanto el usuario pulsa**, sin esperar a que se renderice nadie. Cuándo conviene cada forma de pedir datos (un efecto, `use` con Suspense o una librería) lo compara la lección 52.

## `use` con un contexto

Con un contexto, `use` hace lo mismo que `useContext` (lección 28): devuelve el valor del proveedor más cercano **por encima** del componente. La diferencia es la que viste en la lección 44: **`use` puede ir dentro de un `if`, de un bucle o después de un `return` anticipado**, porque no ocupa ningún puesto en la lista de Hooks del componente.

Las dos lecturas se combinan bien. Un contexto puede llevar una promesa, y entonces hacen falta dos `use`: uno saca la promesa del contexto y el otro la espera. Así cualquier componente del árbol puede leer los datos del socio sin que nadie le pase props:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Los puntos del socio, desde un contexto",
  "codigo": "import { createContext, Suspense, use, useState } from 'react'\n\nconst cache = new Map()\nfunction leer(ruta) {\n  if (!cache.has(ruta)) {\n    cache.set(ruta, fetch(ruta).then((res) => res.json()))\n  }\n  return cache.get(ruta)\n}\n\nconst SocioContext = createContext(null)\nSocioContext.displayName = 'Socio'\n\nfunction TarjetaPuntos({ abierta }) {\n  if (!abierta) return null\n\n  const promesaSocio = use(SocioContext)\n  const socio = use(promesaSocio)\n\n  return (\n    <p className=\"hornada\">\n      {socio.nombre}: {socio.puntos} puntos. A los 150, una barra de regalo.\n    </p>\n  )\n}\n\nexport default function App() {\n  const [abierta, setAbierta] = useState(false)\n\n  return (\n    <SocioContext value={leer('/api/socios/7')}>\n      <main>\n        <h1>Obrador La Hogaza</h1>\n        <button onClick={() => setAbierta(!abierta)}>\n          {abierta ? 'Ocultar mis puntos' : 'Ver mis puntos'}\n        </button>\n        <Suspense fallback={<p className=\"cargando\">Buscando tu tarjeta…</p>}>\n          <TarjetaPuntos abierta={abierta} />\n        </Suspense>\n      </main>\n    </SocioContext>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}",
  "anotaciones": [
    {
      "fragmento": "if (!abierta) return null",
      "nota": "Un return anticipado con lecturas de contexto debajo. Con useContext rompería la primera regla de los Hooks; con use está permitido (lección 44)."
    },
    {
      "fragmento": "const promesaSocio = use(SocioContext)",
      "nota": "use con un contexto: el valor del proveedor más cercano por encima, como useContext. Aquí ese valor no son los datos del socio, sino la promesa que los traerá."
    },
    {
      "fragmento": "const socio = use(promesaSocio)",
      "nota": "El segundo use espera a la promesa. Si todavía no ha terminado, TarjetaPuntos se suspende y se ve «Buscando tu tarjeta…»."
    },
    {
      "fragmento": "<SocioContext value={leer('/api/socios/7')}>",
      "nota": "App llama a leer en cada render, y no pasa nada: la caché devuelve siempre la misma promesa. La petición sale al cargar la página, antes de que nadie pulse el botón."
    }
  ],
  "mostrarConsola": false,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

La primera vez que pulses «Ver mis puntos» verás «Buscando tu tarjeta…»: el segundo y medio de latencia entero si pulsas nada más cargar la página, y solo un instante si la petición ya había terminado. Ciérralo y vuelve a abrirlo: ahora aparece al momento.

¿Por qué ese instante, si los datos ya estaban? JavaScript no deja consultar si una promesa ha terminado sin esperar al menos un momento, así que la primera vez que `use` ve una promesa se suspende aunque ya esté cumplida, y React enseña el contenido con su pausa de 300 ms entre revelaciones (lección 48). A partir de ahí React apunta en la propia promesa su estado y su valor, y las siguientes lecturas son inmediatas. Las cachés de las librerías apuntan ese estado ellas mismas en cuanto la promesa termina, y así ni siquiera la primera lectura espera; la referencia de `use` en react.dev enseña cómo hacerlo en una caché como `leer`.

## Si la promesa falla

Cuando la promesa se rechaza, `use` **lanza el error**, igual que si el componente hubiera hecho `throw` al renderizarse. No hay forma de leerlo en el propio componente: lo recoge el **error boundary** más cercano por encima, un componente que atrapa los errores de render de todo lo que tiene dentro y pinta otra cosa en su lugar. Si no hay ninguno, React quita la app entera y en la vista previa verías el recuadro de error.

Un error boundary se escribe con una clase, el único caso en que todavía hace falta una. Ya lo has visto en las lecciones 64 y 91 con el nombre `LimiteDeError`, y la lección 53 lo explica a fondo. Aquí envuelve al `<Suspense>`: uno se encarga de la espera y el otro, del fallo.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Una hornada que no llega",
  "codigo": "import { Component, Suspense, use, useState } from 'react'\n\nconst cache = new Map()\nfunction leer(ruta) {\n  if (!cache.has(ruta)) {\n    const promesa = fetch(ruta).then((res) => {\n      if (!res.ok) throw new Error(`el servidor respondió ${res.status}`)\n      return res.json()\n    })\n    cache.set(ruta, promesa)\n  }\n  return cache.get(ruta)\n}\n\n// Un error boundary mínimo (lección 53)\nclass LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) {\n      return <p role=\"alert\">No se pudo sacar la hornada: {this.state.error.message}</p>\n    }\n    return this.props.children\n  }\n}\n\nfunction Hornada({ categoria }) {\n  const hornada = use(leer(`/api/hornadas/${categoria}`))\n\n  return (\n    <ul className=\"hornada\">\n      {hornada.piezas.map((pieza) => (\n        <li key={pieza.nombre}>{pieza.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n\nconst CATEGORIAS = [\n  { id: 'panes', nombre: 'Panes' },\n  { id: 'bolleria', nombre: 'Bollería' },\n  { id: 'dulces', nombre: 'Dulces' },\n]\n\nexport default function App() {\n  const [categoria, setCategoria] = useState('panes')\n\n  return (\n    <main>\n      <h1>Obrador La Hogaza</h1>\n      <nav aria-label=\"Categorías\">\n        {CATEGORIAS.map((c) => (\n          <button\n            key={c.id}\n            aria-pressed={c.id === categoria}\n            onClick={() => setCategoria(c.id)}\n          >\n            {c.nombre}\n          </button>\n        ))}\n      </nav>\n      <LimiteDeError key={categoria}>\n        <Suspense fallback={<p className=\"cargando\">Sacando la hornada…</p>}>\n          <Hornada categoria={categoria} />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}",
  "anotaciones": [
    {
      "fragmento": "if (!res.ok) throw new Error(`el servidor respondió ${res.status}`)",
      "nota": "fetch no rechaza con un 500 (lección 38): hay que convertirlo en error para que la promesa se rechace y use lo lance."
    },
    {
      "fragmento": "static getDerivedStateFromError(error) {",
      "nota": "Cuando un hijo lanza un error al renderizarse, React llama a este método y el límite guarda el error en su estado para pintar el aviso."
    },
    {
      "fragmento": "<LimiteDeError key={categoria}>",
      "nota": "Por fuera del Suspense: si la promesa se rechaza, el aviso sustituye a la hornada, pero el título y los botones siguen. La key hace que cada categoría tenga un límite nuevo, sin el error de la anterior, igual que la key que reiniciaba un Suspense en la lección 48."
    },
    {
      "fragmento": "const hornada = use(leer(`/api/hornadas/${categoria}`))",
      "nota": "Si la promesa se rechaza, esta línea lanza el error. No hay que comprobar nada aquí: el componente solo describe el caso bueno."
    }
  ],
  "mostrarConsola": true,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Prueba esto en orden: pulsa «Fallar la siguiente petición» en el panel de red y después «Bollería». Tras el fallback, aparece el aviso con el mensaje del error, y la consola enseña el texto que React escribe cuando un error boundary captura un error (lo leíste en la lección 64: *The above error occurred in the <Hornada> component…*). Pulsa «Dulces»: carga bien, porque la `key` nueva da un límite limpio.

Ahora vuelve a «Bollería». Sigue fallando, y el panel de red no registra ninguna petición: **la promesa rechazada se ha quedado en la caché**, y `use` la vuelve a lanzar al momento. Para reintentar de verdad hay que sacarla de la caché y darle al límite un estado limpio. Es el segundo ejercicio.

Si para una lectura prefieres un valor por defecto en vez de un aviso, la alternativa es que la promesa no llegue a rechazarse: añade un `.catch` **dentro de la caché**, donde la promesa se crea una sola vez, por ejemplo `fetch(ruta).then(...).catch(() => ({ piezas: [] }))`. Escrito en el render, `promesa.catch(...)` sería otra promesa nueva en cada ejecución.

## `use` no va dentro de un `try`/`catch`

Con un error que llega de una promesa, la idea más natural es rodear `use` con un `try`. Antes de ejecutarlo, piensa qué se verá:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Hornada({ categoria }) {\n  let hornada\n  try {\n    hornada = use(leer(`/api/hornadas/${categoria}`))\n  } catch (error) {\n    return <p role=\"alert\">Algo ha fallado: {error.message}</p>\n  }\n\n  return (\n    <ul>\n      {hornada.piezas.map((pieza) => <li key={pieza.nombre}>{pieza.nombre}</li>)}\n    </ul>\n  )\n}\n\n// Dentro de un <Suspense>. La petición tarda 300 ms y sale bien.\n// ¿Qué se ve un segundo después?",
  "opciones": [
    "La lista de panes",
    "El fallback del Suspense y después la lista",
    "«Algo ha fallado: Suspense Exception: This is not a real error!…», y se queda así",
    "El recuadro de error de React"
  ],
  "correcta": 2,
  "explicacion": "use no espera como await: para suspender, interrumpe el render lanzando una excepción especial de React. El catch se la queda, el componente pinta su aviso y React ya no sabe que tenía que esperar: no hay fallback ni nuevo intento cuando llega la hornada. La consola, además, avisa de que use está dentro de un try/catch."
}
```

Lo que recibe el `catch` no es un error de la petición, sino esto:

```text
Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render. You must either rethrow it immediately, or move the `use` call outside of the `try/catch` block. Capturing without rethrowing will lead to unexpected behavior.

To handle async errors, wrap your component in an error boundary, or call the promise's `.catch` method and pass the result to `use`.
```

Es decir: «excepción de Suspense: no es un error de verdad, es un detalle interno de `use` para interrumpir el render. O la vuelves a lanzar enseguida o sacas `use` del `try`/`catch`; capturarla sin relanzarla provoca comportamientos inesperados. Para los errores asíncronos, envuelve el componente en un error boundary o usa el `.catch` de la promesa». Y en la consola aparece el aviso que ya citó la lección 44:

```text
`use` was called from inside a try/catch block. This is not allowed and can lead to unexpected behavior. To handle errors triggered by `use`, wrap your component in a error boundary.
```

Las dos salidas son las de la sección anterior: un error boundary por encima o un `.catch` en la caché.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Con un framework o una librería de datos",
      "texto": "Ellos crean, cachean e invalidan las promesas, y muchas veces llaman a use por ti. Tu parte es colocar los Suspense y los error boundaries."
    },
    {
      "titulo": "Con una promesa que llega del servidor",
      "texto": "Un Server Component empieza una consulta sin esperarla y le pasa la promesa a un componente del navegador, que la lee con use dentro de un Suspense (lección 88)."
    },
    {
      "titulo": "En una app pequeña sin framework",
      "texto": "Una caché como leer, o una promesa creada en un manejador, bastan para pantallas sencillas. En cuanto necesites refrescar, reintentar o compartir datos entre pantallas, una librería te ahorra mucho código (lecciones 52 y 78)."
    },
    {
      "titulo": "Para leer un contexto en una condición",
      "texto": "use(Contexto) hace lo mismo que useContext y además admite if, bucles y returns anticipados. También puedes usarlo donde no hay condición; useContext sigue funcionando y lo verás en mucho código."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Para crear la promesa: use solo lee. Y no hace falta reescribir lo que ya funciona con un efecto; la lección 52 compara las dos formas."
    }
  ]
}
```

## Errores típicos

**Crear la promesa en el render del padre.** Parece que la saca del componente que se suspende, y al principio funciona:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La promesa nace en el render de App",
  "consigna": "Mira el panel de red al cargar: dos peticiones, una por cada render de StrictMode. Pulsa «Añadir a la cesta»: otras dos, y la hornada vuelve a esconderse tras el fallback aunque no ha cambiado nada. Arréglalo sin tocar Hornada.jsx: saca la promesa de App, por ejemplo al nivel del módulo, porque la ruta es siempre la misma.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport Hornada from './Hornada'\nimport './estilos.css'\n\nexport default function App() {\n  const [enCesta, setEnCesta] = useState(0)\n  // 🚩 Una promesa nueva en cada render de App\n  const promesa = fetch('/api/hornadas/panes').then((res) => res.json())\n\n  return (\n    <main>\n      <h1>Obrador La Hogaza</h1>\n      <p>\n        Piezas en la cesta: {enCesta}{' '}\n        <button onClick={() => setEnCesta(enCesta + 1)}>Añadir a la cesta</button>\n      </p>\n      <Suspense fallback={<p className=\"cargando\">Sacando la hornada…</p>}>\n        <Hornada promesa={promesa} />\n      </Suspense>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Hornada.jsx",
      "codigo": "import { use } from 'react'\n\nexport default function Hornada({ promesa }) {\n  const hornada = use(promesa)\n\n  return (\n    <ul className=\"hornada\">\n      {hornada.piezas.map((pieza) => (\n        <li key={pieza.nombre}>{pieza.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

`App` está por encima del `<Suspense>` y no se suspende, así que no entra en bucle: React reintenta solo lo que hay dentro del límite, y eso recibe la misma prop. Pero cada render de `App` crea otra promesa, y en desarrollo `StrictMode` renderiza dos veces cada vez: dos peticiones al montar y otras dos con cada clic, cada letra escrita en un campo o cada cambio de cualquier estado de `App`, con la hornada escondida otra vez tras el fallback. Saca la promesa del render: al nivel del módulo si no depende de nada, a una caché como `leer` si depende de una clave, o al manejador que cambia esa clave.

**Olvidar el `<Suspense>`.** `use` funciona igual, pero quien espera es la raíz: página en blanco al cargar e interfaz congelada en cada cambio (lección 48).

**Saltarse `use` cuando la promesa ya ha terminado.** React apunta en la propia promesa su estado (`status`, `value`), y es tentador leerlo a mano:

```jsx
// 🚩 Así no
if (promesa.status === 'fulfilled') return <Lista piezas={promesa.value} />
const piezas = use(promesa)
```

react.dev lo desaconseja: React necesita ver cada `use` para coordinar Suspense, y las DevTools también. Pásale siempre la promesa a `use`; si ya ha terminado, devuelve el valor al momento sin suspender.

**Llamar a `use` fuera del render.** Dentro de un manejador de eventos o de un efecto, `use` no funciona: se ejecutan cuando el render ya ha terminado. Con un contexto, React lanza:

```text
Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().
```

Es decir: «el contexto solo se puede leer mientras React renderiza». Lee el valor en el cuerpo del componente y úsalo después en el manejador.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "use es el await de los componentes",
      "realidad": "await pausa la función y sigue donde se quedó. use interrumpe el render y, cuando la promesa termina, React ejecuta el componente otra vez desde el principio. Por eso la promesa tiene que sobrevivir fuera de él."
    },
    {
      "mito": "Si la promesa falla, use devuelve undefined",
      "realidad": "Lanza el error. Lo recoge el error boundary más cercano; sin ninguno, React quita la app entera."
    },
    {
      "mito": "use es un Hook más",
      "realidad": "Puede ir en un if, en un bucle o después de un return, cosa que ningún Hook admite. Lo que sí comparte: solo se llama durante el render de un componente o de un Hook, y nunca dentro de un try/catch."
    },
    {
      "mito": "Si no hay aviso en la consola, la promesa está bien",
      "realidad": "El aviso de promesa sin caché solo sale cuando la promesa termina casi al instante. Con una petición de red, el error se ve como un fallback que no se va y un panel de red lleno de peticiones."
    }
  ]
}
```

## Ejercicios

**1. El escaparate del obrador.** `Escaparate` ya lee la hornada con `use`, pero la página no funciona: `leer` crea una promesa nueva en cada llamada y nadie se ocupa ni de la espera ni de los fallos. Las comprobaciones usan la API simulada con 300 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El escaparate del obrador",
  "consigna": "Ahora la vista previa sale en blanco: sin <Suspense>, la carga lo esconde todo (lección 48). Tres arreglos. En datos.jsx, haz que leer guarde la promesa de cada ruta en un Map y devuelva siempre la misma. En App.jsx, envuelve <Escaparate> en un <Suspense> con el fallback «Sacando la hornada…» (con className=\"cargando\") y, por fuera, en <LimiteDeError>, de modo que los botones de categoría queden fuera de los dos. Prueba el fallo con «Fallar la siguiente petición» y otra categoría.",
  "archivos": [
    {
      "nombre": "datos.jsx",
      "codigo": "// pedir hace la petición de verdad. No la toques: lleva un freno para\n// que un bucle de peticiones no cuelgue la vista previa.\nlet peticiones = 0\n\nfunction pedir(ruta) {\n  peticiones += 1\n  if (peticiones > 30) {\n    throw new Error('Más de 30 peticiones: ¿se crea una promesa nueva en cada render?')\n  }\n  return fetch(ruta).then((res) => {\n    if (!res.ok) throw new Error(`el servidor respondió ${res.status}`)\n    return res.json()\n  })\n}\n\n// Arregla leer: para la misma ruta tiene que devolver SIEMPRE la misma\n// promesa. Ahora crea una nueva cada vez que alguien la llama.\nexport function leer(ruta) {\n  return pedir(ruta)\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Escaparate from './Escaparate'\nimport LimiteDeError from './LimiteDeError'\nimport './estilos.css'\n\nconst CATEGORIAS = [\n  { id: 'panes', nombre: 'Panes' },\n  { id: 'bolleria', nombre: 'Bollería' },\n  { id: 'dulces', nombre: 'Dulces' },\n]\n\nexport default function App() {\n  const [categoria, setCategoria] = useState('panes')\n\n  return (\n    <main>\n      <h1>Obrador La Hogaza</h1>\n      <nav aria-label=\"Categorías\">\n        {CATEGORIAS.map((c) => (\n          <button\n            key={c.id}\n            aria-pressed={c.id === categoria}\n            onClick={() => setCategoria(c.id)}\n          >\n            {c.nombre}\n          </button>\n        ))}\n      </nav>\n      {/* Envuelve el escaparate: un límite de error por fuera y un Suspense por dentro */}\n      <Escaparate categoria={categoria} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Escaparate.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function Escaparate({ categoria }) {\n  const hornada = use(leer(`/api/hornadas/${categoria}`))\n\n  return (\n    <ul className=\"hornada\">\n      {hornada.piezas.map((pieza) => (\n        <li key={pieza.nombre}>{pieza.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\n// Un error boundary mínimo: la lección 53 lo explica a fondo.\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) {\n      return <p role=\"alert\">No se pudo sacar la hornada: {this.state.error.message}</p>\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "datos.jsx",
  "mostrarConsola": false,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparecen los panes de la hornada",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Hogaza de centeno"
      }
    },
    {
      "descripcion": "Mientras llega la hornada, se ve «Sacando la hornada…»",
      "pasos": [],
      "espera": {
        "texto": "Sacando la hornada…"
      }
    },
    {
      "descripcion": "Al elegir «Bollería», aparecen sus piezas",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Hogaza de centeno"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Bollería"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Caracola de canela"
      }
    },
    {
      "descripcion": "Si falla la carga, aparece un aviso de error",
      "pasos": [
        {
          "red": "fallar-siguiente"
        }
      ],
      "espera": {
        "rol": "alert"
      }
    },
    {
      "descripcion": "Si falla la carga, los botones de categoría siguen a la vista",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Bollería"
      }
    }
  ]
}
```

**2. Un «Reintentar» que reintente.** Ahora el límite de error trae un botón «Reintentar» que llama a `reintentar`, en `App`. Pero la función está vacía, y llenarla no es tan obvio como parece: ya has visto que la promesa rechazada se queda en la caché.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Reintentar de verdad",
  "consigna": "Pulsa «Fallar la siguiente petición» y después «Bollería»: sale el aviso con «Reintentar», que no hace nada. Escribe reintentar en App.jsx para que vuelva a pedir la hornada de la categoría actual. Necesitas dos cosas: sacar la promesa rechazada de la caché con olvidar y que el límite de error empiece de cero (piensa en su key).",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport Escaparate from './Escaparate'\nimport LimiteDeError from './LimiteDeError'\nimport { olvidar } from './datos'\nimport './estilos.css'\n\nconst CATEGORIAS = [\n  { id: 'panes', nombre: 'Panes' },\n  { id: 'bolleria', nombre: 'Bollería' },\n  { id: 'dulces', nombre: 'Dulces' },\n]\n\nexport default function App() {\n  const [categoria, setCategoria] = useState('panes')\n\n  function reintentar() {\n    // Que «Reintentar» vuelva a pedir la hornada de esta categoría.\n    // Pista: la promesa rechazada sigue guardada en la caché, y el\n    // límite de error sigue recordando su error.\n  }\n\n  return (\n    <main>\n      <h1>Obrador La Hogaza</h1>\n      <nav aria-label=\"Categorías\">\n        {CATEGORIAS.map((c) => (\n          <button\n            key={c.id}\n            aria-pressed={c.id === categoria}\n            onClick={() => setCategoria(c.id)}\n          >\n            {c.nombre}\n          </button>\n        ))}\n      </nav>\n      <LimiteDeError key={categoria} onReintentar={reintentar}>\n        <Suspense fallback={<p className=\"cargando\">Sacando la hornada…</p>}>\n          <Escaparate categoria={categoria} />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "const cache = new Map()\n\nexport function leer(ruta) {\n  if (!cache.has(ruta)) {\n    const promesa = fetch(ruta).then((res) => {\n      if (!res.ok) throw new Error(`el servidor respondió ${res.status}`)\n      return res.json()\n    })\n    cache.set(ruta, promesa)\n  }\n  return cache.get(ruta)\n}\n\n// Saca una ruta de la caché: la próxima vez que alguien la lea,\n// se volverá a pedir al servidor.\nexport function olvidar(ruta) {\n  cache.delete(ruta)\n}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\n// Un error boundary mínimo: la lección 53 lo explica a fondo.\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) {\n      return (\n        <div role=\"alert\">\n          <p>No se pudo sacar la hornada: {this.state.error.message}</p>\n          <button onClick={this.props.onReintentar}>Reintentar</button>\n        </div>\n      )\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "Escaparate.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function Escaparate({ categoria }) {\n  const hornada = use(leer(`/api/hornadas/${categoria}`))\n\n  return (\n    <ul className=\"hornada\">\n      {hornada.piezas.map((pieza) => (\n        <li key={pieza.nombre}>{pieza.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #92400e;\n  color: white;\n}\n\n.hornada {\n  padding: 0.5rem 1rem 0.5rem 2rem;\n  border: 1px solid #fcd34d;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\n.cargando {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "api": {
    "hornadas": [
      {
        "id": "panes",
        "nombre": "Panes",
        "piezas": [
          {
            "nombre": "Hogaza de centeno",
            "precio": 4.2
          },
          {
            "nombre": "Barra de masa madre",
            "precio": 1.9
          },
          {
            "nombre": "Pan de espelta",
            "precio": 3.6
          }
        ]
      },
      {
        "id": "bolleria",
        "nombre": "Bollería",
        "piezas": [
          {
            "nombre": "Caracola de canela",
            "precio": 2.1
          },
          {
            "nombre": "Croissant de mantequilla",
            "precio": 1.6
          }
        ]
      },
      {
        "id": "dulces",
        "nombre": "Dulces",
        "piezas": [
          {
            "nombre": "Roscón de vino",
            "precio": 8.5
          },
          {
            "nombre": "Torta de aceite",
            "precio": 1.8
          }
        ]
      }
    ],
    "socios": [
      {
        "id": 7,
        "nombre": "Marta Lozano",
        "puntos": 120
      }
    ],
    "encargos": [
      {
        "id": 1,
        "hora": "7:30",
        "cliente": "Bar Las Tejas",
        "pieza": "20 barras de masa madre"
      },
      {
        "id": 2,
        "hora": "9:00",
        "cliente": "Colegio San Blas",
        "pieza": "pan para la excursión"
      },
      {
        "id": 3,
        "hora": "12:00",
        "cliente": "Marta Lozano",
        "pieza": "un roscón de vino"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparece la hornada de panes",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Hogaza de centeno"
      }
    },
    {
      "descripcion": "Si falla la carga, aparece el aviso con su botón «Reintentar»",
      "pasos": [
        {
          "red": "fallar-siguiente"
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Reintentar"
      }
    },
    {
      "descripcion": "Tras un fallo, «Reintentar» vuelve a pedir la hornada y la enseña",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Hogaza de centeno"
      }
    },
    {
      "descripcion": "Si falla la bollería, «Reintentar» la carga",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Hogaza de centeno"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Bollería"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Caracola de canela"
      }
    },
    {
      "descripcion": "Después de reintentar, otra categoría también carga",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Hogaza de centeno"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Dulces"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Roscón de vino"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el escaparate, enseña el precio de cada pieza junto a su nombre, y añade debajo de la lista un total de la hornada calculado durante el render. ¿Hace falta algún estado nuevo?
2. En el ejemplo de los puntos del socio, añade en la cabecera un componente `Saludo` que lea la misma promesa del contexto y enseñe «Hola, Marta». Ponle su propio `<Suspense>`. Comprueba en el panel de red que sigue habiendo una sola petición al socio.
3. En la caché del ejercicio 2, añade un `.catch` que convierta un fallo en una hornada vacía (`{ piezas: [] }`) y enseña «Hoy no hay hornada de esta categoría» cuando la lista esté vacía. ¿Qué ventajas e inconvenientes tiene frente al error boundary?
4. Cambia los encargos de «La promesa nace en el clic» para que, en vez de un botón, la promesa se cree al cambiar un `<select>` con el día. Mira en el panel de red cuántas peticiones salen si eliges el mismo día dos veces, y añade una caché por día si te sobran.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "use",
      "descripcion": "La referencia de esta lección: leer contexto y promesas, cachear promesas en el navegador, volver a pedir, precargar al pasar el ratón, errores con un error boundary y los dos mensajes de la sección de problemas.",
      "url": "https://react.dev/reference/react/use",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Suspense>",
      "descripcion": "Dónde colocar los límites que enseñan la espera de use. Es la lección 48.",
      "url": "https://react.dev/reference/react/Suspense",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Catching rendering errors with an Error Boundary",
      "descripcion": "Cómo se escribe el límite de error que recoge las promesas rechazadas. Es la lección 53.",
      "url": "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useContext",
      "descripcion": "La forma de leer un contexto que use amplía: proveedores, valor por defecto y cómo se actualiza.",
      "url": "https://react.dev/reference/react/useContext",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Promise",
      "descripcion": "Los estados de una promesa (pendiente, cumplida y rechazada) y sus métodos then y catch.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
      "etiqueta": "MDN"
    },
    {
      "titulo": "react-error-boundary",
      "descripcion": "El paquete que trae hecho un error boundary con fallback y reinicio, el que usan los ejemplos de react.dev.",
      "url": "https://github.com/bvaughn/react-error-boundary",
      "etiqueta": "GitHub"
    }
  ]
}
```
