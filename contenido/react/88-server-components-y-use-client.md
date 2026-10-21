# Server Components y `'use client'`

- **Módulo:** React en el servidor
- **Slug:** `server-components-y-use-client` (autogenerado del título)
- **Orden:** 880
- **Fuentes:** [Server Components](https://react.dev/reference/rsc/server-components) + [`'use client'`](https://react.dev/reference/rsc/use-client) + [cache](https://react.dev/reference/react/cache) — ver `contenido/react/TEMARIO.md` #88

---

## Qué es y para qué sirve

En la lección 87 el servidor generaba el HTML, pero el navegador acababa recibiendo **todo** el JavaScript igualmente: para hidratar, React necesita el código de cada componente de la página, también el de los que solo enseñan un texto y no vuelven a cambiar. Si la ficha de un producto convierte su descripción de Markdown a HTML, la librería de Markdown viaja al navegador para hacer otra vez un trabajo que el servidor ya hizo.

Los **Server Components** atacan justo eso. La documentación de React los define como «un nuevo tipo de componente que se renderiza por adelantado, antes del empaquetado, en un entorno separado de tu app de cliente o de tu servidor de SSR». En la práctica:

- **Se ejecutan solo en el servidor**, en cada petición, **o una sola vez en el build**.
- **Pueden ser `async`** y leer datos directamente: una base de datos, un archivo, una API interna. Sin efectos y sin un endpoint intermedio.
- **Su código no llega al navegador.** Llega lo que devuelven, ya calculado. Las librerías que usan se quedan en el servidor.

Y como no llegan al navegador, no pueden ser interactivos. Para eso están los de siempre, que en este mundo se llaman **Client Components** y se marcan con `'use client'`. Esta lección va de dónde está la frontera entre unos y otros y de qué puede cruzarla. El ejemplo es la web de **El Dado Rojo**, una tienda de juegos de mesa.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esto necesita un framework, y aquí no se ejecuta",
  "contenido": "Los Server Components necesitan un bundler que sepa partir tu código en dos mitades y un servidor que los ejecute: hoy, en la práctica, un framework como Next.js. La vista previa de esta web solo ejecuta React en el navegador, así que lo del servidor lo verás en código anotado. Los mensajes de React y la salida del servidor que se citan salen de ejecutar React 19.3.1 de verdad, con el paquete react-server-dom-webpack; los de Next.js, de su código fuente."
}
```

## Un Server Component por dentro

No tienen ninguna sintaxis especial: son funciones que devuelven JSX. Lo que cambia es lo que pueden hacer. Esta es la ficha de un juego en la tienda:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { readFile } from 'node:fs/promises'\nimport { marked } from 'marked'\nimport { db } from './db.js'\nimport BotonCesta from './BotonCesta.jsx'\n\nexport default async function FichaJuego({ id }) {\n  const juego = await db.juegos.buscar(id)\n  const reglas = await readFile(`./reglas/${juego.slug}.md`, 'utf8')\n\n  return (\n    <article>\n      <h1>{juego.nombre}</h1>\n      <p>{juego.jugadores} jugadores · {juego.minutos} minutos</p>\n      <BotonCesta id={juego.id} nombre={juego.nombre} />\n      <div dangerouslySetInnerHTML={{ __html: marked.parse(reglas) }} />\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export default async function FichaJuego",
      "nota": "Un componente async. Solo los Server Components pueden serlo: React suspende el render hasta que se resuelve el await, como con use, y con un Suspense por encima funciona en streaming."
    },
    {
      "fragmento": "await db.juegos.buscar(id)",
      "nota": "Consulta la base de datos directamente, sin un endpoint de API ni un efecto en el navegador. Es código de servidor: las credenciales de la base de datos nunca salen de ahí."
    },
    {
      "fragmento": "await readFile(",
      "nota": "Hasta el sistema de archivos: las reglas de cada juego están en Markdown en el repositorio de la tienda."
    },
    {
      "fragmento": "import { marked } from 'marked'",
      "nota": "La librería que convierte el Markdown se queda en el servidor. Al navegador llega el HTML ya convertido y ni una línea de marked."
    },
    {
      "fragmento": "<BotonCesta id={juego.id} nombre={juego.nombre} />",
      "nota": "Un Client Component: su archivo empieza por 'use client'. El servidor no lo ejecuta; deja en su sitio una referencia a su archivo y sus props, y el navegador lo renderiza."
    },
    {
      "fragmento": "dangerouslySetInnerHTML",
      "nota": "Las reglas las escribe la tienda, no los usuarios. Si vinieran de fuera, habría que sanearlas antes (lección 82)."
    }
  ]
}
```

Para lo mismo sin Server Components, el componente se descarga entero, pide los datos desde un efecto cuando ya se ha montado (lección 52) y necesita un endpoint que alguien tiene que escribir:

```jsx
import { useEffect, useState } from 'react'
import { marked } from 'marked' // viaja al navegador

function FichaJuego({ id }) {
  const [juego, setJuego] = useState(null)

  useEffect(() => {
    fetch(`/api/juegos/${id}`)
      .then((respuesta) => respuesta.json())
      .then(setJuego)
  }, [id])

  if (!juego) return <p>Cargando…</p>
  // ...
}
```

Y si un hijo pide más datos con su propio efecto, no empieza hasta que el padre ha terminado: una **cascada** de peticiones, cada una esperando a la anterior.

Un detalle de vocabulario que confunde mucho: **no hay ninguna directiva para marcar un Server Component**. En una app con Server Components, todo es de servidor por defecto, salvo lo que marques con `'use client'`. La otra directiva, `'use server'`, es para algo distinto, las Server Functions, y llega en la lección 89.

Tampoco necesitan un servidor encendido. Si lo que leen no cambia en cada visita, como las reglas de un juego, pueden ejecutarse **una vez en el build**, en tu máquina o en la integración continua, y el resultado se sirve como cualquier archivo estático.

## `'use client'`: dónde empieza el código del navegador

`'use client'` se escribe en la primera línea de un archivo y dice: **este módulo, y todo lo que importa, es código de cliente**. Cuando un Server Component importa un archivo así, el bundler corta por ahí: lo de antes se queda en el servidor, y ese archivo y sus dependencias van al navegador.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// BotonCesta.jsx\n'use client'\n\nimport { useState } from 'react'\nimport { formatearUnidades } from './formato.js'\n\nexport default function BotonCesta({ id, nombre }) {\n  const [unidades, setUnidades] = useState(0)\n\n  return (\n    <div className=\"cesta\">\n      <button onClick={() => setUnidades(unidades + 1)}>\n        Añadir {nombre} a la cesta\n      </button>\n      <p>{formatearUnidades(unidades)}</p>\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "'use client'",
      "nota": "Arriba del todo, antes de cualquier import; solo puede tener comentarios encima. Con comillas simples o dobles, nunca con comillas invertidas."
    },
    {
      "fragmento": "import { formatearUnidades } from './formato.js'",
      "nota": "formato.js no lleva directiva, pero lo importa un módulo de cliente: también va al navegador. 'use client' marca el archivo y todo lo que cuelga de él."
    },
    {
      "fragmento": "useState(0)",
      "nota": "Aquí sí: estado, efectos, refs, manejadores de eventos y APIs del navegador. Es un componente de React de los de siempre."
    },
    {
      "fragmento": "{ id, nombre }",
      "nota": "Estas props las escribió un Server Component y viajaron por la red. Por eso solo pueden ser cosas que se puedan serializar: lo verás enseguida."
    }
  ]
}
```

La frontera se dibuja sobre el **árbol de dependencias de módulos** de la lección 13, el de los `import`, no sobre el de render. Este es el de la página del juego. La insignia de cada nodo dice dónde se evalúa ese archivo:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El árbol de módulos de la página de un juego",
  "nodos": [
    {
      "nombre": "pagina.jsx",
      "nivel": 0,
      "etiqueta": "servidor",
      "nota": "la ruta: el punto de entrada"
    },
    {
      "nombre": "db.js",
      "nivel": 1,
      "etiqueta": "servidor"
    },
    {
      "nombre": "FichaJuego.jsx",
      "nivel": 1,
      "etiqueta": "servidor"
    },
    {
      "nombre": "marked",
      "nivel": 2,
      "etiqueta": "servidor",
      "nota": "una librería de npm: no llega al navegador"
    },
    {
      "nombre": "Precio.jsx",
      "nivel": 2,
      "etiqueta": "servidor",
      "nota": "sin directiva: se evalúa donde lo importen"
    },
    {
      "nombre": "BotonCesta.jsx",
      "nivel": 2,
      "etiqueta": "cliente",
      "nota": "← 'use client': aquí empieza la frontera"
    },
    {
      "nombre": "formato.js",
      "nivel": 3,
      "etiqueta": "cliente",
      "nota": "sin directiva, pero lo importa un módulo de cliente"
    },
    {
      "nombre": "Precio.jsx",
      "nivel": 3,
      "etiqueta": "cliente",
      "nota": "el mismo archivo, importado ahora desde el cliente"
    },
    {
      "nombre": "Desplegable.jsx",
      "nivel": 2,
      "etiqueta": "cliente",
      "nota": "← 'use client'"
    },
    {
      "nombre": "Reglas.jsx",
      "nivel": 2,
      "etiqueta": "servidor",
      "nota": "lo importa FichaJuego, no Desplegable"
    }
  ]
}
```

`Precio.jsx` sale dos veces, y no es un error. No tiene directiva y no usa nada exclusivo de ningún lado: solo formatea un número. Si lo importa `FichaJuego`, se ejecuta en el servidor y al navegador llega su resultado; si lo importa `BotonCesta`, su código va en el bundle. **Que un componente sea «de servidor» o «de cliente» depende de dónde se usa, no de cómo está escrito.**

## La frontera está en los `import`, no en lo que se pinta

`Desplegable` es un Client Component que enseña u oculta lo que lleva dentro. `FichaJuego` lo usa para las reglas:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// FichaJuego.jsx (sin directiva)\nimport Desplegable from './Desplegable.jsx' // empieza por 'use client'\nimport Reglas from './Reglas.jsx'           // sin directiva\n\nexport default async function FichaJuego({ id }) {\n  const juego = await db.juegos.buscar(id)\n  return (\n    <article>\n      <h1>{juego.nombre}</h1>\n      <Desplegable titulo={`reglas de ${juego.nombre}`}>\n        <Reglas pasos={juego.reglas} />\n      </Desplegable>\n    </article>\n  )\n}\n\n// Reglas se pinta dentro de un Client Component.\n// ¿Dónde se ejecuta Reglas?",
  "opciones": [
    "En el navegador: está dentro de Desplegable, que es de cliente",
    "En el servidor: quien la importa y la renderiza es FichaJuego",
    "En los dos: en el servidor para el HTML y en el navegador para hidratar",
    "En ninguno: un Client Component no puede tener dentro uno de servidor"
  ],
  "correcta": 1,
  "explicacion": "'use client' marca el árbol de módulos, no el de render. Desplegable nunca importa Reglas: es FichaJuego quien la importa y la renderiza, en el servidor, y le pasa a Desplegable el resultado como children. Desplegable recibe una lista ya hecha y solo decide si se ve. Que un componente esté dentro de otro al pintarse no dice nada de dónde se ejecuta."
}
```

Este es el árbol de render de la misma página, con el sitio donde se ejecuta cada componente:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El árbol de render: quién se ejecuta dónde",
  "nodos": [
    {
      "nombre": "Pagina",
      "nivel": 0,
      "etiqueta": "servidor"
    },
    {
      "nombre": "FichaJuego",
      "nivel": 1,
      "etiqueta": "servidor"
    },
    {
      "nombre": "Precio",
      "nivel": 2,
      "etiqueta": "servidor",
      "nota": "lo renderiza FichaJuego"
    },
    {
      "nombre": "BotonCesta",
      "nivel": 2,
      "etiqueta": "cliente"
    },
    {
      "nombre": "Precio",
      "nivel": 3,
      "etiqueta": "cliente",
      "nota": "el mismo componente, dentro de un Client Component"
    },
    {
      "nombre": "Desplegable",
      "nivel": 2,
      "etiqueta": "cliente"
    },
    {
      "nombre": "Reglas",
      "nivel": 3,
      "etiqueta": "servidor",
      "nota": "← llega como children, ya renderizado"
    }
  ]
}
```

Un Client Component puede tener **dentro** Server Components, pero solo si se los pasan ya hechos, como `children` o como cualquier otra prop con JSX (lección 9). Lo que no puede es **importarlos**: todo lo que importa un módulo de cliente se convierte en código de cliente. La propia documentación lo resume así: que dos componentes sean padre e hijo al renderizarse no garantiza que se ejecuten en el mismo sitio.

## Qué cruza la frontera: props serializables

El servidor y el navegador no comparten memoria. Lo que un Server Component le pasa a un Client Component viaja por la red, dentro de una descripción del árbol que React manda al navegador. Next.js la llama *RSC Payload*. Con este Server Component:

```jsx
async function FichaJuego({ id }) {
  const juego = await db.juegos.buscar(id)
  return (
    <article>
      <h1>{juego.nombre}</h1>
      <BotonCesta id={juego.id} nombre={juego.nombre} />
      <Desplegable titulo={`reglas de ${juego.nombre}`}>
        <Reglas pasos={juego.reglas} />
      </Desplegable>
    </article>
  )
}
```

React 19.3.1 produce esto (salida real de `react-server-dom-webpack`, en producción):

```text
1:"./BotonCesta.jsx"
2:I["$1",[],"default"]
3:"./Desplegable.jsx"
4:I["$3",[],"default"]
0:["$","article",null,{"children":[["$","h1",null,{"children":"Catan"}],["$","$L2",null,{"id":7,"nombre":"Catan"}],["$","$L4",null,{"titulo":"reglas de Catan","children":["$","ol",null,{"children":[["$","li","Coloca dos poblados.",{"children":"Coloca dos poblados."}],["$","li","Tira los dados.",{"children":"Tira los dados."}]]}]}]]}]
```

No hace falta aprenderse el formato, que es interno, pero se lee bien:

- **`FichaJuego` no aparece.** Ni su código, ni `db`, ni la consulta: solo lo que devolvió, el `article` con su `h1`.
- **`Reglas` tampoco.** En su sitio está la lista `ol` ya renderizada, dentro de los `children` de `Desplegable`.
- **Los Client Components van como referencias.** Las líneas con `I` dicen al navegador qué archivo cargar (`./BotonCesta.jsx`), y `$L2` marca dónde va y con qué props: `{"id":7,"nombre":"Catan"}`.

Por eso las props que cruzan tienen que poder escribirse ahí. La referencia de `'use client'` da la lista:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Datos",
      "texto": "Textos, números, bigint, booleanos, undefined y null; los Symbol registrados con Symbol.for; arrays, Map, Set, typed arrays y ArrayBuffer; Date; y objetos literales con todo eso dentro."
    },
    {
      "titulo": "JSX",
      "texto": "Elementos de Server Components o de Client Components. Así entra lo que renderiza el servidor dentro de un componente de cliente: como children o como cualquier otra prop."
    },
    {
      "titulo": "Promesas",
      "texto": "El servidor puede empezar una consulta sin esperarla y pasar la promesa; el Client Component la lee con use dentro de un Suspense (lección 49). Útil para lo que no hace falta en el primer pintado."
    },
    {
      "titulo": "Funciones: solo las Server Functions",
      "texto": "Las marcadas con 'use server', que el cliente puede llamar a través de la red (lección 89). Ninguna otra función. Tampoco clases, instancias de clases, objetos con prototipo null ni Symbol creados sin Symbol.for."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// FichaJuego es un Server Component; BotonCesta empieza por 'use client'\n<BotonCesta\n  juego={{ id: 7, nombre: 'Catan', etiquetas: new Set(['estrategia']) }}\n  publicado={new Date('1995-01-01')}\n  opiniones={promesaOpiniones}\n  onAnadir={() => registrarVisita(7)}\n/>\n\n// ¿Qué prop no puede cruzar la frontera?",
  "opciones": [
    "etiquetas: un Set no cabe en JSON",
    "publicado: una fecha llega convertida en texto",
    "opiniones: una promesa no se puede mandar por la red",
    "onAnadir: es una función y no es una Server Function"
  ],
  "correcta": 3,
  "explicacion": "Set, Date y las promesas están en la lista: React no usa JSON a secas. En la salida real, la fecha viaja como \"$D1995-01-01T00:00:00.000Z\" y vuelve a ser un Date, y la promesa llega después, cuando se resuelve. La función no: no hay forma de mandar su código ni sus closures. El manejador se escribe dentro de BotonCesta, y si tiene que ejecutar algo en el servidor, eso es una Server Function."
}
```

React lo detecta en el servidor, al preparar lo que manda al navegador, y el mensaje te dice qué prop es. Si la prop se llama como un manejador de eventos, `on` seguido de mayúscula:

```text
Event handlers cannot be passed to Client Component props.
  <... onAnadir={function onAnadir}>
                ^^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

Es decir: «No se pueden pasar manejadores de eventos a las props de un Client Component. Si necesitas interactividad, convierte esa parte en un Client Component». Con cualquier otra función, por ejemplo `formatearPrecio={formatear}`:

```text
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
```

«No se pueden pasar funciones a un Client Component, salvo que las expongas a propósito marcándolas con "use server"». Y con la instancia de una clase, aunque solo tenga datos: *Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.* Los tres, comprobados con React 19.3.1.

## Por qué un Server Component no tiene estado ni efectos

Un Server Component se ejecuta una vez por petición (o una vez en el build), manda lo que devuelve y desaparece. No se queda en la memoria del navegador, así que no tiene dónde guardar un estado ni nadie que lo vuelva a renderizar cuando cambie. Tampoco hay navegador donde ejecutar un efecto ni un clic que escuchar.

No es solo una norma: la versión de React que usan los frameworks para ejecutar Server Components ni siquiera los trae. Comprobado con React 19.3.1, cargado con la condición `react-server`: `useState`, `useEffect` y `createContext` valen `undefined`; `use`, `useId` y `cache` sí existen.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué puede hacer cada uno",
  "roles": [
    {
      "etiqueta": "Server Component",
      "rol": "En el servidor o en el build",
      "descripcion": "Puede ser async, leer la base de datos, archivos y secretos, y usar librerías pesadas gratis. No tiene estado, efectos ni manejadores de eventos."
    },
    {
      "etiqueta": "Client Component",
      "rol": "Se renderiza a HTML y se hidrata",
      "descripcion": "Su código viaja al navegador. Estado, efectos, refs, contexto, manejadores y APIs del navegador. No puede ser async ni leer nada del servidor directamente."
    },
    {
      "etiqueta": "Sin nada de los dos",
      "rol": "Componentes que solo pintan",
      "descripcion": "Como Precio: sin directiva y sin hooks. Será de servidor o de cliente según quién lo importe."
    }
  ]
}
```

En Next.js ni siquiera llegas a ejecutarlo: lo detecta al compilar, en cuanto un archivo de servidor importa `useState`. El mensaje, tal como está en el código de Next.js 16.4.2:

```text
You're importing a module that depends on `useState` into a React Server Component module. This API is only available in Client Components. To fix, mark the file (or its parent) with the `"use client"` directive.
```

Es decir: «Estás importando algo que depende de `useState` en un módulo de Server Component. Esa API solo está disponible en Client Components. Para arreglarlo, marca el archivo, o uno de sus padres, con la directiva `"use client"`».

El contexto merece una nota. Un Server Component no puede **crear** un contexto, porque `createContext` no existe en su lado, pero sí puede **renderizar el proveedor** de uno creado en un archivo de cliente. Desde React 19.3, directamente, sin un componente envoltorio:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// socio-context.js\n'use client'\n\nimport { createContext } from 'react'\n\nexport const SocioContext = createContext(null)\nSocioContext.displayName = 'Socio'\n\n// Layout.jsx: un Server Component\nimport { SocioContext } from './socio-context.js'\nimport { leerSocio } from './sesion.js'\n\nexport default async function Layout({ children }) {\n  const socio = await leerSocio()\n\n  return <SocioContext value={socio}>{children}</SocioContext>\n}",
  "anotaciones": [
    {
      "fragmento": "export const SocioContext = createContext(null)",
      "nota": "El contexto se crea en un archivo de cliente: createContext no existe en la versión de React que ejecuta Server Components."
    },
    {
      "fragmento": "const socio = await leerSocio()",
      "nota": "El Server Component lee los datos del socio de la tienda, con su sesión, en el servidor."
    },
    {
      "fragmento": "<SocioContext value={socio}>",
      "nota": "Y lo pone a disposición de todos los Client Components de debajo, que lo leen con useContext o con use (lección 28). Desde 19.3 basta con importarlo; antes había que exportar también un componente SocioProvider que lo envolviera. value cruza la frontera, así que tiene que ser serializable."
    }
  ]
}
```

## Componer servidor y cliente

Con todo lo anterior sale una forma de trabajar que se repite en cualquier app con Server Components:

1. **Las páginas, los layouts y todo lo que lee datos, en el servidor.** Es el valor por defecto: no hay que hacer nada.
2. **`'use client'` lo más abajo posible**, en las hojas interactivas: el botón de la cesta, el desplegable, el buscador con su campo. Cuanto más abajo, menos código viaja.
3. **El contenido del servidor entra en el cliente como `children`.** Un Client Component que envuelve contenido (un desplegable, un carrusel, unas pestañas) no importa lo que envuelve: lo recibe hecho.
4. **Lo que no hace falta para el primer pintado, como promesa.** Las opiniones de los clientes, debajo de la ficha, pueden empezar a pedirse en el servidor y leerse con `use` en un Client Component dentro de un `<Suspense>`, sin bloquear la ficha.

Las librerías de terceros también cuentan. Un componente de npm que use estado, efectos, `createContext`, `memo` o APIs del navegador tiene que ejecutarse en el cliente; si la librería no trae su propio `'use client'`, te toca envolverlo en un archivo tuyo que lo lleve.

## `cache`: los mismos datos, una sola vez por petición

En el árbol de la ficha, varios Server Components necesitan el mismo juego: el título, el precio, las reglas. Si cada uno lo pide por su cuenta, son varias consultas iguales en la misma petición. `cache`, de `react`, envuelve una función para que, **durante un mismo render en el servidor**, las llamadas con los mismos argumentos devuelvan el resultado de la primera:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// datos.js\nimport { cache } from 'react'\nimport { db } from './db.js'\n\nexport const getJuego = cache(async (id) => {\n  return await db.juegos.buscar(id)\n})\n\n// Titulo.jsx y Jugadores.jsx: dos Server Components de la misma página\nimport { getJuego } from './datos.js'\n\nexport async function Titulo({ id }) {\n  const juego = await getJuego(id)\n  return <h1>{juego.nombre}</h1>\n}\n\nexport async function Jugadores({ id }) {\n  const juego = await getJuego(id)\n  return <p>{juego.jugadores} jugadores</p>\n}",
  "anotaciones": [
    {
      "fragmento": "export const getJuego = cache(",
      "nota": "Se llama a cache una vez, fuera de cualquier componente, en su propio módulo, y se exporta la función que devuelve. Así todos los componentes usan la misma."
    },
    {
      "fragmento": "export async function Titulo",
      "nota": "La primera llamada con el id 7 hace la consulta y guarda la promesa."
    },
    {
      "fragmento": "export async function Jugadores",
      "nota": "La segunda, con el mismo id y en la misma petición, recibe la misma promesa: una sola consulta. Comprobado con React 19.3.1, contando las llamadas a la base de datos."
    },
    {
      "fragmento": "async (id) =>",
      "nota": "Los argumentos se comparan con Object.is. Un número o un texto, perfecto; un objeto creado en cada componente es otra entrada aunque tenga lo mismo dentro. cache también guarda los errores: si la función lanza, vuelve a lanzar lo mismo."
    }
  ]
}
```

Tres reglas, todas comprobadas con React 19.3.1:

- **La caché dura una petición.** React la vacía en cada una: la siguiente visita vuelve a consultar. No es una caché de datos entre usuarios; para eso, la del framework.
- **Fuera de un componente no hace nada.** Una llamada a `getJuego(7)` en el nivel superior de un módulo ejecuta la función, pero ni lee ni guarda en la caché.
- **Solo en Server Components.** En el navegador, `cache` existe pero no guarda nada. Para recordar un cálculo entre renders de un Client Component está `useMemo`, y para no volver a renderizar un componente, `memo` (lección 67).

Junto a `cache` está `cacheSignal` (19.2): devuelve un `AbortSignal` que se aborta cuando React termina de renderizar. Pasándoselo a `fetch` (`fetch(url, { signal: cacheSignal() })`), las peticiones que ya no hacen falta se cancelan solas.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { cache } from 'react'\n\nasync function Titulo({ id }) {\n  const getJuego = cache(async (id) => db.juegos.buscar(id))\n  const juego = await getJuego(id)\n  return <h1>{juego.nombre}</h1>\n}\n\nasync function Jugadores({ id }) {\n  const getJuego = cache(async (id) => db.juegos.buscar(id))\n  const juego = await getJuego(id)\n  return <p>{juego.jugadores} jugadores</p>\n}\n\n// La página renderiza <Titulo id={7} /> y <Jugadores id={7} />.\n// ¿Cuántas consultas a la base de datos hace una petición?",
  "opciones": [
    "Una: cache reconoce que es la misma consulta",
    "Dos: cada componente crea su propia función, con su propia caché",
    "Ninguna: cache no deja llamar a la base de datos dentro de un componente",
    "Cuatro: cada componente se renderiza dos veces"
  ],
  "correcta": 1,
  "explicacion": "Cada render crea una función flecha nueva y la envuelve en un cache nuevo, así que cada componente consulta por su cuenta: dos consultas, comprobado con React 19.3.1. Con un solo getJuego definido fuera, en su módulo, y compartido por los dos, la misma página hace una."
}
```

## Dónde existen hoy

Los Server Components son una función de React, pero no se pueden usar con React solo: hace falta un bundler que separe los dos mundos y un servidor que hable el protocolo con el navegador. La documentación lo dice sin rodeos: los Server Components de React 19 son estables, pero **las APIs para construir un bundler o un framework que los soporte no siguen el versionado semántico** y pueden romperse entre versiones menores de 19.x. De hecho, la única novedad de 19.3.1 es una mejora de ese protocolo de transporte.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde puedes usar Server Components en octubre de 2026",
  "roles": [
    {
      "etiqueta": "Next.js (App Router)",
      "rol": "La implementación más completa",
      "descripcion": "Lo dice react.dev. Páginas y layouts son Server Components por defecto y 'use client' marca las partes interactivas. Versión actual: 16.4.2."
    },
    {
      "etiqueta": "React Router",
      "rol": "Modos framework y datos, experimental",
      "descripcion": "Su documentación avisa de que el soporte es experimental y puede romperse en versiones menores. Una ruta exporta ServerComponent en vez de default."
    },
    {
      "etiqueta": "Por tu cuenta",
      "rol": "Para quien construye frameworks",
      "descripcion": "react.dev avisa de que montarlo exige mucha experiencia y remite a los ejemplos de Parcel. Hay también un plugin oficial de Vite, @vitejs/plugin-rsc, todavía experimental."
    }
  ]
}
```

Un proyecto de Vite como los de este temario, o como esta misma web, no tiene Server Components: todo es de cliente, y `'use client'` no haría nada. Cómo elegir entre estos frameworks es la lección 90.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Páginas con muchos datos y poca interacción",
      "texto": "Catálogos, fichas de producto, blogs, documentación. Casi todo se queda en el servidor y al navegador solo va el JavaScript de los botones."
    },
    {
      "titulo": "Librerías pesadas que solo producen salida",
      "texto": "Markdown, resaltado de código, formateo de fechas, gráficos estáticos. En un Server Component no cuestan nada al usuario."
    },
    {
      "titulo": "Datos sin una API intermedia",
      "texto": "El componente lee lo que necesita donde está, sin endpoints que mantener ni cascadas de efectos. Y sin que las credenciales salgan del servidor."
    },
    {
      "titulo": "Cuando no compensa",
      "texto": "Una app casi toda interactiva, como un editor o un juego, gana poco: casi todo acabaría siendo de cliente. Y si tu proyecto no usa un framework que los soporte, no hay Server Components que valgan."
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
      "mito": "'use server' marca un Server Component",
      "realidad": "No hay directiva para los Server Components: en una app con ellos, lo son por defecto. 'use server' marca Server Functions, funciones del servidor que el cliente puede llamar (lección 89). Confundirlas es, según la propia documentación, un malentendido muy común."
    },
    {
      "mito": "Server Components y renderizado en servidor son lo mismo",
      "realidad": "Son dos cosas que se combinan. Los Server Components se ejecutan antes y producen una descripción del árbol; el SSR convierte esa descripción y los Client Components en HTML. Hay SSR sin Server Components (la lección 87) y Server Components sin servidor, ejecutados en el build."
    },
    {
      "mito": "Un Client Component solo se ejecuta en el navegador",
      "realidad": "En un framework también se renderiza en el servidor, a HTML, y luego se hidrata, como en la lección 87. 'use client' no significa «solo en el cliente», sino «este código también viaja al navegador»."
    },
    {
      "mito": "Hay que poner 'use client' en cada componente interactivo",
      "realidad": "Solo en el archivo donde empieza la frontera. Todo lo que ese archivo importa ya es de cliente; repetir la directiva más abajo no cambia nada."
    },
    {
      "mito": "Un Client Component no puede tener Server Components dentro",
      "realidad": "Sí puede, si se los pasan ya renderizados como children o como otra prop. Lo que no puede es importarlos: lo que importa un módulo de cliente es código de cliente."
    }
  ]
}
```

## Errores típicos

**Poner `'use client'` en todo.** Es lo primero que se hace cuando algo falla, y apaga todo lo que ganabas: si la directiva va en el archivo de la página, toda la página y todo lo que importa pasan al navegador.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Con 'use client' en pagina.jsx",
  "nodos": [
    {
      "nombre": "pagina.jsx",
      "nivel": 0,
      "etiqueta": "cliente",
      "nota": "← 'use client' en la raíz de la ruta"
    },
    {
      "nombre": "db.js",
      "nivel": 1,
      "etiqueta": "cliente",
      "nota": "al bundle, con la conexión a la base de datos"
    },
    {
      "nombre": "FichaJuego.jsx",
      "nivel": 1,
      "etiqueta": "cliente",
      "nota": "async: en el navegador, error"
    },
    {
      "nombre": "marked",
      "nivel": 2,
      "etiqueta": "cliente",
      "nota": "otra vez en el bundle"
    },
    {
      "nombre": "BotonCesta.jsx",
      "nivel": 2,
      "etiqueta": "cliente",
      "nota": "ya lo era: su directiva ahora sobra"
    }
  ]
}
```

`FichaJuego` es `async`, y en el navegador eso no se puede. La vista previa de esta web es todo cliente, así que enseña exactamente lo que verías si le pusieras `'use client'` a un Server Component asíncrono:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un componente async con 'use client'",
  "consigna": "La vista previa falla: Catalogo es async y en el navegador eso no se puede. Lee el error y la consola. Después arréglalo como se hace en un Client Component: saca la promesa fuera del componente (const promesaCatalogo = leerCatalogo()), léela con use (lección 49) en un Catalogo normal, sin async, y envuelve <Catalogo /> en un <Suspense> con el fallback «Cargando el catálogo…».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "'use client'\n\n// Este archivo era de servidor, y alguien le añadió 'use client'.\n// En la vista previa todo se ejecuta en el navegador: lo que le pasaría a él.\nimport './estilos.css'\n\nconst juegos = [\n  { id: 'catan', nombre: 'Catan', jugadores: '3-4' },\n  { id: 'carcassonne', nombre: 'Carcassonne', jugadores: '2-5' },\n  { id: 'azul', nombre: 'Azul', jugadores: '2-4' },\n]\n\n// En el servidor sería una consulta a la base de datos\nfunction leerCatalogo() {\n  return Promise.resolve(juegos)\n}\n\nasync function Catalogo() {\n  const lista = await leerCatalogo()\n  return (\n    <ul>\n      {lista.map((juego) => (\n        <li key={juego.id}>\n          {juego.nombre} · {juego.jugadores} jugadores\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>El Dado Rojo</h1>\n      <Catalogo />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Debajo de la vista previa aparece el error, y en la consola, el aviso que lo acompaña:

```text
<Catalogo> is an async Client Component. Only Server Components can be async at the moment. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.
```

Es decir: «`<Catalogo>` es un Client Component asíncrono. Por ahora, solo los Server Components pueden ser async. Este error suele deberse a haber añadido sin querer `'use client'` a un módulo que se escribió para el servidor». React ya sospecha la causa. (El recuadro de error dice *An unknown Component* en lugar de `<Catalogo>`: el nombre solo lo tiene el aviso de la consola).

Lo arreglas como en la consigna, pero en un proyecto real la pregunta es otra: **¿necesitaba ese archivo `'use client'`?** Casi siempre, la respuesta buena es quitar la directiva de ahí y ponerla en el componente pequeño que de verdad necesitaba estado.

**Importar un módulo de servidor desde uno de cliente.** Si `BotonCesta` importa `db.js` para comprobar el stock, `db.js` pasa a ser código de cliente: o falla en el navegador o, peor, mete en el bundle algo que no debía salir del servidor. Para que eso no pase en silencio existe el paquete `server-only`, publicado por el equipo de React: se importa en la primera línea del módulo (`import 'server-only'`) y, si alguien lo importa desde el cliente, salta el error. Su versión para el cliente es una sola línea que lanza *This module cannot be imported from a Client Component module. It should only be used from a Server Component.* Next.js lo convierte en un error de build. Lo mismo vale para las variables de entorno: Next.js solo manda al navegador las que empiezan por `NEXT_PUBLIC_`, igual que Vite con `VITE_` (lección 82).

**Pasar funciones, o instancias de clases, como props a un Client Component.** Lo viste arriba, con sus mensajes. El manejador se escribe dentro del Client Component; lo que tenga que ejecutarse en el servidor, como Server Function.

**Usar `useState` o `useEffect` en un Server Component.** Next.js lo marca al compilar, con el mensaje de arriba. La salida es separar: el Server Component lee los datos y se los pasa a un Client Component pequeño que tiene el estado.

**`'use client'` debajo de los `import`.** Ya no es una directiva: es una cadena suelta que no marca nada. Next.js lo detecta: *The "use client" directive must be placed before other expressions. Move it to the top of the file to resolve this issue.* («La directiva "use client" tiene que ir antes que cualquier otra expresión. Muévela al principio del archivo»).

## Ejercicios

En el ejercicio vas a escribir la pieza clave de la composición: un Client Component que recibe contenido del servidor como `children`. Una advertencia honesta: en la vista previa no hay servidor, así que `App.jsx` *hace* de Server Component pero se ejecuta en el navegador, y `'use client'` no tiene ningún efecto. Las comprobaciones miran el comportamiento; la arquitectura (qué archivo lleva la directiva, dónde vive el estado, qué se importa desde dónde) es cosa tuya.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un desplegable de cliente con reglas del servidor",
  "consigna": "App.jsx hace de Server Component: lee el catálogo y no tiene estado. Completa Desplegable.jsx, de cliente: un estado que diga si está abierto, un botón «Ver reglas de …» que pase a «Ocultar reglas de …» y los children solo cuando esté abierto. Cada juego, el suyo. No importes Reglas en Desplegable ni subas el estado a App. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "Desplegable.jsx",
      "codigo": "'use client'\n\n// Un Client Component. Lo que lleva dentro (children) llega ya renderizado\n// desde el servidor: Desplegable solo decide si se ve o no.\nexport default function Desplegable({ titulo, children }) {\n  // Tu trabajo: un estado que diga si está abierto, un botón que lo cambie\n  // («Ver …» / «Ocultar …») y los children solo cuando esté abierto.\n  return (\n    <section>\n      <button>Ver {titulo}</button>\n      {children}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import BotonCesta from './BotonCesta'\nimport Desplegable from './Desplegable'\nimport './estilos.css'\n\n// En un framework con Server Components, este archivo sería de servidor:\n// leería el catálogo de la base de datos y no tendría estado ni efectos.\nconst juegos = [\n  {\n    id: 'catan',\n    nombre: 'Catan',\n    jugadores: '3-4',\n    reglas: [\n      'Coloca dos poblados y dos caminos.',\n      'Tira los dados y reparte recursos.',\n      'Gana quien llegue antes a 10 puntos.',\n    ],\n  },\n  {\n    id: 'carcassonne',\n    nombre: 'Carcassonne',\n    jugadores: '2-5',\n    reglas: [\n      'Roba una loseta y colócala junto a otra.',\n      'Si quieres, pon uno de tus seguidores en ella.',\n      'Puntúan los caminos, las ciudades y los monasterios.',\n    ],\n  },\n]\n\nfunction Reglas({ pasos }) {\n  return (\n    <ol>\n      {pasos.map((paso) => (\n        <li key={paso}>{paso}</li>\n      ))}\n    </ol>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>El Dado Rojo</h1>\n      {juegos.map((juego) => (\n        <article key={juego.id}>\n          <h2>{juego.nombre}</h2>\n          <p>{juego.jugadores} jugadores</p>\n          <BotonCesta nombre={juego.nombre} />\n          <Desplegable titulo={`reglas de ${juego.nombre}`}>\n            <Reglas pasos={juego.reglas} />\n          </Desplegable>\n        </article>\n      ))}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "BotonCesta.jsx",
      "codigo": "'use client'\n\nimport { useState } from 'react'\n\nexport default function BotonCesta({ nombre }) {\n  const [unidades, setUnidades] = useState(0)\n\n  return (\n    <div className=\"cesta\">\n      <button onClick={() => setUnidades(unidades + 1)}>Añadir {nombre} a la cesta</button>\n      <p>En la cesta: {unidades}</p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\narticle {\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border: 2px solid #b91c1c;\n  border-radius: 10px;\n}\n\narticle h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.15rem;\n}\n\n.cesta {\n  display: flex;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n.cesta p {\n  margin: 0;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #b91c1c;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nsection {\n  margin-top: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "Desplegable.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al cargar la página, las reglas están plegadas",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Coloca dos poblados y dos caminos."
        }
      }
    },
    {
      "descripcion": "Al pulsar «Ver reglas de Catan», aparecen las reglas de Catan",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver reglas de Catan"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Coloca dos poblados y dos caminos."
      }
    },
    {
      "descripcion": "Abrir las reglas de Catan no abre las de Carcassonne",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver reglas de Catan"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Roba una loseta y colócala junto a otra."
        }
      }
    },
    {
      "descripcion": "Al pulsar «Ocultar reglas de Catan», las reglas se vuelven a plegar",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver reglas de Catan"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ocultar reglas de Catan"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Coloca dos poblados y dos caminos."
        }
      }
    },
    {
      "descripcion": "La cesta sigue funcionando: «Añadir Catan a la cesta» suma una unidad",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Catan a la cesta"
          }
        }
      ],
      "espera": {
        "texto": "En la cesta: 1"
      }
    }
  ]
}
```

Fíjate en lo que **no** ha hecho falta: `Desplegable` no sabe nada de juegos ni de reglas, y `App` no tiene ni un `useState`. En un framework, `Reglas` y todo `App.jsx` se quedarían en el servidor, y al navegador solo irían `Desplegable` y `BotonCesta`. El `aria-expanded` del botón le cuenta a un lector de pantalla si la sección está abierta (lección 37).

Este ejercicio no puede comprobar la frontera en sí: no hay servidor que la haga cumplir. Para eso, los retos.

**Retos para seguir practicando** (sin comprobación automática):

1. Crea un proyecto con `npx create-next-app@latest` y escribe una página `async` que lea un JSON del disco con `readFile` y pinte una lista. Añade un contador con `'use client'` en su propio archivo. Construye con `npm run build` y busca en los archivos de `.next/static` el texto del JSON y el del contador: ¿cuál aparece?
2. En ese proyecto, provoca uno a uno los errores de esta lección: un `useState` en la página, una función como prop del contador y un `datos.js` con `import 'server-only'` que importes desde el contador. Lee cada mensaje y relaciónalo con su sección.
3. Rehaz el ejercicio en Next.js: `Reglas` en su archivo, sin directiva, y `Desplegable` con `'use client'`. Pon `console.log('Reglas', typeof window)` en uno y lo mismo con su nombre en el otro, y mira la terminal donde corre `npm run dev` y la consola del navegador. ¿Quién llega a escribir `object`? ¿Y por qué `Desplegable` escribe también en la terminal? Pista: lección 87.
4. Envuelve en `cache` la función que lee el JSON del reto 1, úsala desde dos componentes de la misma página con un `console.log` dentro y recarga: ¿cuántas veces se escribe por petición? Quita `cache` y compara.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Server Components",
      "descripcion": "La referencia de React: Server Components con y sin servidor, componentes async, cómo añadir interactividad y el contexto en Server Components.",
      "url": "https://react.dev/reference/rsc/server-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "'use client'",
      "descripcion": "La directiva a fondo: cómo marca el árbol de módulos, por qué un mismo componente puede ser de servidor y de cliente, y la lista de props serializables.",
      "url": "https://react.dev/reference/rsc/use-client",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "cache",
      "descripcion": "Memorizar datos y cálculos durante una petición, con los fallos más comunes, y cuándo usar cache, useMemo o memo.",
      "url": "https://react.dev/reference/react/cache",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "cacheSignal",
      "descripcion": "El AbortSignal que se aborta cuando React termina de renderizar, para cancelar peticiones que ya no hacen falta.",
      "url": "https://react.dev/reference/react/cacheSignal",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Server and Client Components",
      "descripcion": "Cómo funcionan en Next.js: qué se hace en el servidor y en el navegador, cómo componerlos, proveedores de contexto, librerías de terceros y server-only.",
      "url": "https://nextjs.org/docs/app/getting-started/server-and-client-components",
      "etiqueta": "Next.js"
    },
    {
      "titulo": "React Server Components",
      "descripcion": "El soporte, todavía experimental, de React Router para Server Components en sus modos framework y datos, con plantillas para empezar.",
      "url": "https://reactrouter.com/how-to/react-server-components",
      "etiqueta": "React Router"
    }
  ]
}
```
