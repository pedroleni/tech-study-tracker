# Datos del servidor con TanStack Query (la carrera de peticiones del `78`, resuelta)

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `datos-del-servidor-con-tanstack-query-la-carrera-de-peticiones-del-78-resuelta` (autogenerado del título)
- **Orden:** 780
- **Fuentes:** [TanStack Query: Overview](https://tanstack.com/query/latest/docs/framework/react/overview) + [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) + [Query Cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation) + [Placeholder Query Data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data) + [Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) — ver `contenido/react/TEMARIO.md` #78

---

## Qué es y para qué sirve

La biblioteca de herramientas Manitas presta taladros, sierras y escaleras a los vecinos del barrio. Su web tiene un buscador, la ficha de cada herramienta y un formulario para dar de alta las nuevas. Todo eso son **datos del servidor**: no son tuyos, son una copia de lo que vive en otro sitio, que hay que pedir, guardar un tiempo, dar por caducada y volver a pedir. En la lección 75 los separaste de los demás tipos de estado, y en la 52 viste tres maneras de pedirlos: un efecto, `use` con Suspense o una librería. Esta lección es la tercera, a fondo.

Y es la que cierra una cuenta pendiente. En el proyecto 78 de JavaScript, el recetario, un bug real hizo que una respuesta vieja tapara una página nueva, y lo arreglaste con un contador (`ultimaBusqueda`) que descartaba lo que llegaba tarde. En la lección 38 lo volviste a arreglar con la limpieza de un efecto, y en el proyecto 56 lo provocaste a propósito con el panel de red. Ahora toca ver por qué ocurre y cómo una librería lo evita **sin que escribas ni un contador ni una limpieza**.

> **TanStack Query no guarda «la respuesta»: guarda una respuesta por cada clave. Cada componente lee la entrada de la clave que le toca, y por eso una respuesta que llega tarde no puede pisar a otra.**

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Hecho a mano para entender, ejecutado de verdad para creer",
  "contenido": "Los bloques de esta web solo cargan React, así que no pueden importar @tanstack/react-query. Por eso la lección va en dos tiempos: primero escribes a mano, en la vista previa, lo mínimo que hace la librería (una caché por clave que comparte peticiones); después ves el código real de TanStack Query con la salida que dio al ejecutarlo en una carpeta de pruebas con React 19.3.1, @tanstack/react-query 5.104.5 (publicada el 19 de octubre de 2026), jsdom 30.1.3 y un servidor simulado con latencias. Las salidas son reales; los milisegundos, los de esa máquina."
}
```

## La carrera, otra vez: dónde se rompe

Este es el buscador de siempre, escrito como se aprende en la lección 38: un estado para el texto, otro para la lista, y un efecto que pide los datos cada vez que cambia el texto. **Sin limpieza**, a propósito.

Pruébalo así: sube la latencia del panel de red a 1500 ms, activa **«Responder desordenado»** (dos peticiones seguidas llegan siempre al revés) y escribe «ta» deprisa. Se envían dos peticiones, la de «t» y la de «ta». La de «ta» llega antes; la de «t» llega la última, y es la que se queda. La frase de arriba dice «ta», la lista es la de «t». (Este bloque y el siguiente llevan StrictMode apagado para que el registro cuente solo tus peticiones.)

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El buscador ingenuo, con las respuestas al revés",
  "consigna": "Latencia a 1500 ms, «Responder desordenado» activado y escribe «ta» deprisa. Compara la frase «Has buscado…» con la lista. Después borra el campo y mira el registro de peticiones.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nexport default function Buscador() {\n  const [texto, setTexto] = useState('')\n  const [herramientas, setHerramientas] = useState([])\n\n  useEffect(() => {\n    fetch(`/api/herramientas?q=${texto}`)\n      .then((respuesta) => respuesta.json())\n      .then((lista) => setHerramientas(lista))\n  }, [texto])\n\n  return (\n    <main>\n      <h1>Biblioteca de herramientas Manitas</h1>\n      <label>\n        Buscar herramienta\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <p className=\"estado\">\n        Has buscado «{texto}» y la pantalla enseña {herramientas.length} herramientas.\n      </p>\n      <ul>\n        {herramientas.map((herramienta) => (\n          <li key={herramienta.id}>{herramienta.nombre}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nul {\n  margin: 0.5rem 0;\n  padding-left: 1.2rem;\n}\n\n.estado {\n  margin: 0.4rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.atenuada {\n  opacity: 0.5;\n}\n\n.botones {\n  display: flex;\n  gap: 0.4rem;\n  margin-bottom: 0.5rem;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": false,
  "api": {
    "herramientas": [
      {
        "id": "taladro",
        "nombre": "Taladro percutor",
        "prestadas": 12,
        "estado": "disponible"
      },
      {
        "id": "sierra",
        "nombre": "Sierra de calar",
        "prestadas": 7,
        "estado": "prestada"
      },
      {
        "id": "lijadora",
        "nombre": "Lijadora orbital",
        "prestadas": 5,
        "estado": "disponible"
      },
      {
        "id": "escalera",
        "nombre": "Escalera de tijera",
        "prestadas": 9,
        "estado": "disponible"
      },
      {
        "id": "tala",
        "nombre": "Tala-setos eléctrico",
        "prestadas": 2,
        "estado": "en reparación"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

El fallo no está en `fetch` ni en el efecto: está en la forma del estado. **Hay una sola variable, `herramientas`, para «la respuesta actual»**, y cualquier respuesta que llegue la sobrescribe, sea de la búsqueda que sea. La que gana es la que llega la última, no la que se pidió la última.

Las dos soluciones que ya conoces atacan eso por el lado de la petición: la limpieza del efecto la marca como obsoleta (una bandera `ignorar` o un `AbortController`, lección 38) y el contador de JavaScript compara identificadores. Funcionan, pero hay que escribirlas en cada sitio donde se pide algo, y se olvidan.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "useEffect(() => {\n  fetch(`/api/herramientas?q=${texto}`)\n    .then((respuesta) => respuesta.json())\n    .then((lista) => setHerramientas(lista))\n}, [texto])\n\n// Escribes «t» y enseguida «ta».\n// La respuesta de «ta» llega primero; la de «t», después.\n// ¿Qué lista enseña la pantalla al final?",
  "opciones": [
    "La de «ta», porque se pidió la última",
    "La de «t», porque es la que llegó la última",
    "Las dos mezcladas, porque setHerramientas añade",
    "React avisa del conflicto y descarta la vieja"
  ],
  "correcta": 1,
  "explicacion": "Cada .then llama a setHerramientas con lo que trae, y el último en llamar gana. Nada compara la respuesta con el texto actual, y React no sabe de qué búsqueda es cada lista. Es el mismo bug que viste en el panel de red del bloque de arriba."
}
```

## Una entrada por clave, escrita a mano

La idea de la librería cabe en una frase: **en vez de una variable para «la respuesta», un mapa con una entrada por cada pregunta**. La pregunta se identifica con una **clave**: `['herramientas', 'ta']` es la búsqueda «ta», `['herramientas', 'tal']` es la búsqueda «tal». Cada componente lee la entrada de *su* clave. Una respuesta que llega tarde se guarda en la entrada de la clave que pidió, que ya no es la que se está mirando: no tiene a quién pisar.

En el archivo `miniConsulta.jsx` hay unas setenta líneas que lo hacen: un `Map` fuera de React, una suscripción con `useSyncExternalStore` (la misma técnica de las lecciones 46 y 75) y un Hook `useConsulta({ clave, funcion })`. En `App.jsx`, dos componentes distintos piden la misma clave: `Recuento` y `Resultados`. Repite la prueba de antes (1500 ms, desordenado, «ta» deprisa) y mira dos cosas:

- La frase y la lista **siempre** son de la misma búsqueda.
- El contador «Peticiones enviadas» sube de una en una por cada búsqueda nueva, aunque dos componentes la pidan: la segunda petición con la misma clave **se comparte** con la que ya está en vuelo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una caché por clave, a mano",
  "consigna": "Latencia a 1500 ms y «Responder desordenado» activado. Escribe «ta» deprisa: la lista nunca es de otra búsqueda. Después borra una letra y vuelve a escribirla: la respuesta de «ta» ya está en la caché, pero como tiempoFresco vale 0, se vuelve a pedir en segundo plano (ejercicio 2).",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { useConsulta, usePeticiones } from './miniConsulta'\nimport './estilos.css'\n\nasync function pedirJson(url) {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction useHerramientas(texto) {\n  return useConsulta({\n    clave: ['herramientas', texto],\n    funcion: () => pedirJson(`/api/herramientas?q=${texto}`),\n  })\n}\n\nfunction Resultados({ texto }) {\n  const { datos, pendiente, error } = useHerramientas(texto)\n\n  if (error) return <p role=\"alert\">Error: {error.message}</p>\n  if (pendiente) return <p>Buscando «{texto}»…</p>\n  return (\n    <ul>\n      {datos.map((herramienta) => (\n        <li key={herramienta.id}>{herramienta.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n\nfunction Recuento({ texto }) {\n  const { datos } = useHerramientas(texto)\n  return <p className=\"estado\">{datos ? `${datos.length} herramientas para «${texto}»` : 'Contando…'}</p>\n}\n\nexport default function Buscador() {\n  const [texto, setTexto] = useState('')\n  const peticiones = usePeticiones()\n\n  return (\n    <main>\n      <h1>Biblioteca de herramientas Manitas</h1>\n      <label>\n        Buscar herramienta\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <Recuento texto={texto} />\n      <Resultados texto={texto} />\n      <p className=\"estado\">Peticiones enviadas: {peticiones}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "miniConsulta.jsx",
      "codigo": "// Una caché por clave escrita a mano: solo para entender qué hace TanStack\n// Query por dentro. La librería real hace muchísimo más (cancelar, reintentar,\n// recoger la basura, refrescar al volver a la pestaña...).\nimport { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react'\n\nconst entradas = new Map() // clave en texto -> { vista, actualizado, promesa }\nconst oyentes = new Set()\nconst VACIA = { datos: undefined, error: undefined, pidiendo: false }\nlet pedidas = { total: 0 }\n\nfunction avisar() {\n  for (const oyente of oyentes) oyente()\n}\n\nfunction suscribir(oyente) {\n  oyentes.add(oyente)\n  return () => oyentes.delete(oyente)\n}\n\nfunction leer(hash) {\n  return entradas.get(hash)?.vista ?? VACIA\n}\n\nfunction pedir(hash, funcion) {\n  const entrada = entradas.get(hash) ?? { vista: VACIA, actualizado: 0, promesa: null }\n  if (entrada.promesa) return // ya hay una petición en curso con esta clave: se comparte\n\n  pedidas = { total: pedidas.total + 1 }\n  const promesa = funcion().then(\n    (datos) => {\n      entradas.set(hash, { vista: { datos, error: undefined, pidiendo: false }, actualizado: Date.now(), promesa: null })\n      avisar()\n    },\n    (error) => {\n      const actual = entradas.get(hash)\n      entradas.set(hash, { ...actual, vista: { ...actual.vista, error, pidiendo: false }, promesa: null })\n      avisar()\n    },\n  )\n  entradas.set(hash, { ...entrada, promesa, vista: { ...entrada.vista, error: undefined, pidiendo: true } })\n  avisar()\n}\n\nexport function useConsulta({ clave, funcion, tiempoFresco = 0, conservarAnterior = false }) {\n  const hash = JSON.stringify(clave)\n  const vista = useSyncExternalStore(suscribir, () => leer(hash))\n\n  const pedirSiHaceFalta = useEffectEvent(() => {\n    const entrada = entradas.get(hash)\n    const fresca = entrada?.vista.datos !== undefined && Date.now() - entrada.actualizado < tiempoFresco\n    if (!fresca) pedir(hash, funcion)\n  })\n  useEffect(() => {\n    pedirSiHaceFalta()\n  }, [hash])\n\n  // Los últimos datos que hubo, para conservarAnterior\n  const [ultimos, setUltimos] = useState(undefined)\n  if (vista.datos !== undefined && vista.datos !== ultimos) setUltimos(vista.datos)\n  const sustituto = conservarAnterior && vista.datos === undefined && ultimos !== undefined\n\n  return {\n    datos: sustituto ? ultimos : vista.datos,\n    error: vista.error,\n    pendiente: vista.datos === undefined && !sustituto, // no hay nada que enseñar\n    pidiendo: vista.pidiendo, // hay una petición en vuelo, haya o no datos\n    esSustituto: sustituto,\n  }\n}\n\nexport function usePeticiones() {\n  return useSyncExternalStore(suscribir, () => pedidas).total\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nul {\n  margin: 0.5rem 0;\n  padding-left: 1.2rem;\n}\n\n.estado {\n  margin: 0.4rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.atenuada {\n  opacity: 0.5;\n}\n\n.botones {\n  display: flex;\n  gap: 0.4rem;\n  margin-bottom: 0.5rem;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": false,
  "api": {
    "herramientas": [
      {
        "id": "taladro",
        "nombre": "Taladro percutor",
        "prestadas": 12,
        "estado": "disponible"
      },
      {
        "id": "sierra",
        "nombre": "Sierra de calar",
        "prestadas": 7,
        "estado": "prestada"
      },
      {
        "id": "lijadora",
        "nombre": "Lijadora orbital",
        "prestadas": 5,
        "estado": "disponible"
      },
      {
        "id": "escalera",
        "nombre": "Escalera de tijera",
        "prestadas": 9,
        "estado": "disponible"
      },
      {
        "id": "tala",
        "nombre": "Tala-setos eléctrico",
        "prestadas": 2,
        "estado": "en reparación"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Dos detalles de `miniConsulta.jsx`, para que no parezca magia:

- `pedir` mira si la entrada ya tiene una `promesa` en curso y, si la tiene, **no lanza otra**: es la deduplicación. Con StrictMode encendido, donde cada efecto se ejecuta dos veces al montar, sigue saliendo una sola petición.
- La clave se convierte en texto con `JSON.stringify`. Por eso dos claves con el mismo contenido son la misma entrada aunque sean arrays distintos en memoria.

Esta versión no cancela, no reintenta, no limpia lo que nadie usa y no vuelve a pedir lo viejo al volver a la pestaña. Todo eso es lo que compras con la librería de verdad, que se instala así:

```bash
npm install @tanstack/react-query
```

## TanStack Query de verdad: `QueryClient`, proveedor y `useQuery`

Dos piezas. El **`QueryClient`** es la caché: el `Map` de antes, con muchas más funciones. Se crea **una sola vez**, fuera de cualquier componente, y se reparte con un **`QueryClientProvider`**, que es un contexto (lección 28). Esta web crea el suyo en `src/lib/queryClient.ts`; más abajo lo verás tal cual.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport { QueryClient, QueryClientProvider } from '@tanstack/react-query'\nimport App from './App.jsx'\n\n// Uno solo, fuera de cualquier componente\nconst queryClient = new QueryClient({\n  defaultOptions: { queries: { staleTime: 30_000 } },\n})\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <QueryClientProvider client={queryClient}>\n      <App />\n    </QueryClientProvider>\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "const queryClient = new QueryClient({",
      "nota": "La caché de toda la aplicación. Vive en el nivel del módulo: si la crearas dentro de un componente, se perdería con cada render (lo comprobarás en «Errores típicos»)."
    },
    {
      "fragmento": "defaultOptions: { queries: { staleTime: 30_000 } },",
      "nota": "Opciones que heredan todas las consultas, para no repetirlas. Aquí, que los datos se den por buenos durante 30 segundos. Cada useQuery puede pisarlas con las suyas."
    },
    {
      "fragmento": "<QueryClientProvider client={queryClient}>",
      "nota": "Reparte el cliente por el árbol, como cualquier proveedor de contexto. Cualquier componente de dentro puede llamar a useQuery sin recibir nada por props."
    }
  ]
}
```

Con eso montado, el buscador es una llamada a `useQuery`. Esta es la versión real del buscador de arriba. Es el código exacto que se ejecutó en la carpeta de pruebas, con un servidor simulado en el que la petición de «ta» tarda 400 ms y la de «tal», 100 ms: justo al revés de como convendría.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\nimport { useQuery } from '@tanstack/react-query'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction Resultados({ texto }) {\n  const { data, isPending, error } = useQuery({\n    queryKey: ['herramientas', texto],\n    queryFn: ({ signal }) => pedirJson(`/api/herramientas?q=${texto}`, signal),\n  })\n\n  if (isPending) return <p>Buscando «{texto}»…</p>\n  if (error) return <p role=\"alert\">Error: {error.message}</p>\n  return (\n    <ul aria-label={`Resultados de «${texto}»`}>\n      {data.map((herramienta) => (\n        <li key={herramienta.id}>{herramienta.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function Buscador() {\n  const [texto, setTexto] = useState('')\n\n  return (\n    <main>\n      <label>\n        Buscar herramienta\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <Resultados texto={texto} />\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "queryKey: ['herramientas', texto],",
      "nota": "La clave de la consulta, un array. Es a la caché lo que el array de dependencias a un efecto: cuando texto cambia, la clave cambia, y useQuery pasa a leer otra entrada. Aquí no hay ningún useEffect."
    },
    {
      "fragmento": "queryFn: ({ signal }) => pedirJson(`/api/herramientas?q=${texto}`, signal),",
      "nota": "La función que pide los datos: cualquier función que devuelva una promesa. Recibe una signal, una AbortSignal normal de la plataforma (lección 38). La pasamos a fetch, y esa es la que permite cancelar."
    },
    {
      "fragmento": "const { data, isPending, error } = useQuery({",
      "nota": "El resultado trae el estado de la entrada de la clave actual: data (lo que hay en caché), isPending (aún no hay datos) y error. Sin useState, sin banderas de carga."
    },
    {
      "fragmento": "if (isPending) return <p>Buscando «{texto}»…</p>",
      "nota": "Mientras la clave nueva no tenga datos, isPending es true. Ve el orden: primero los casos sin datos, después el camino feliz. Como en la lección 23, cada estado posible tiene su rama."
    },
    {
      "fragmento": "<Resultados texto={texto} />",
      "nota": "El estado del texto sigue siendo un useState normal en el padre. TanStack Query guarda el estado del servidor; el del cliente, el campo de búsqueda, sigue siendo cosa de React."
    }
  ]
}
```

Escribes «ta» y, 30 ms después, «tal». Esto es lo que ocurrió, con el registro del servidor simulado (`→` sale una petición, `←` llega la respuesta, `✗` se cancela) y lo que enseñaba la pantalla (`PANTALLA`) en cada momento:

```text
   9 ms  → GET /api/herramientas?q=
  13 ms  PANTALLA  Buscando «»…
  61 ms  ← /api/herramientas?q=
  67 ms  PANTALLA  [lista de 5]
 137 ms  ESCRIBO «ta»
 141 ms  → GET /api/herramientas?q=ta
 142 ms  PANTALLA  Buscando «ta»…
 173 ms  ESCRIBO «tal»
 174 ms  ✗ cancelada /api/herramientas?q=ta
 174 ms  → GET /api/herramientas?q=tal
 175 ms  PANTALLA  Buscando «tal»…
 276 ms  ← /api/herramientas?q=tal
 282 ms  PANTALLA  [Taladro percutor][Lijadora orbital][Tala-setos eléctrico]
Caché: ["herramientas",""] success | ["herramientas","ta"] pending | ["herramientas","tal"] success
```

Lee las líneas con calma, porque es la lección entera:

- Al escribir «tal», **la petición de «ta» se cancela** (`✗ cancelada`). `useQuery` dejó de mirar esa clave y, como la `signal` iba a `fetch`, la petición se abortó.
- La pantalla **nunca** enseñó resultados de «ta» para el texto «tal». No hay nada que descartar a mano: simplemente, el componente lee la entrada de `['herramientas', 'tal']`.
- En la caché queda `["herramientas","ta"] pending`: al cancelar, la entrada **vuelve a su estado anterior**, que era «sin datos». Así lo dice su documentación de cancelación.

¿Y si la petición de «ta» no se cancela, porque no pasas la `signal`? Se probó también. La pantalla es idéntica, porque sigue leyendo la entrada correcta, pero la petición vieja termina y rellena su entrada:

```text
 543 ms  ← /api/herramientas?q=ta
Caché: ["herramientas",""] success | ["herramientas","ta"] success | ["herramientas","tal"] success
```

Eso no es un fallo, es el comportamiento por defecto y tiene su utilidad: si vuelves a escribir «ta», la respuesta ya está en la caché. **La corrección no depende de cancelar; cancelar solo ahorra trabajo.**

## La clave es la lista de dependencias de la consulta

Lo único que tienes que hacer bien es la clave. La regla es la misma que la de las dependencias de un efecto (lección 40): **todo lo que la función usa para pedir los datos va en la clave**. Si `queryFn` usa `texto`, `texto` va en la clave. Si usa un filtro y una página, los dos.

Algunas cosas que conviene saber, comprobadas en la carpeta de pruebas:

```text
gcTime por defecto: 300000 ms
hash de ['x', {b:2, a:1}]: ["x",{"a":1,"b":2}]
hash de ['x', {a:1, b:2}]: ["x",{"a":1,"b":2}]  → misma entrada: true
hash de ['x', [2,1]]: ["x",[2,1]]
hash de ['x', [1,2]]: ["x",[1,2]]  → misma entrada: false
```

- **El orden de las propiedades de un objeto no importa**, y el de los elementos de un array, sí. Por eso las claves suelen ser arrays que empiezan por lo general y acaban en lo concreto: `['herramientas']`, `['herramientas', 'taladro']`, `['herramientas', { estado: 'prestada', pagina: 2 }]`.
- Esa jerarquía no es decorativa: cuando algo cambia, puedes decir «invalida todo lo que empiece por `['herramientas']`» y afecta a la lista, a las fichas y a las búsquedas a la vez. Lo verás con las mutaciones.
- La clave se **serializa a JSON**: nada de funciones ni instancias dentro.

## Compartir peticiones: muchos componentes, una consulta

En una aplicación, la ficha de una herramienta la lee más de un componente: la cabecera, el panel de préstamos, el botón de reserva. Con un efecto en cada uno, cada uno pide lo suyo. Con la clave, todos piden **lo mismo**, y la librería hace una sola petición. Por eso suele convenir un Hook propio por consulta (lección 43), como `useHerramienta`, que es también donde se escribe la clave una sola vez.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useQuery } from '@tanstack/react-query'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction useHerramienta(id) {\n  return useQuery({\n    queryKey: ['herramientas', id],\n    queryFn: ({ signal }) => pedirJson(`/api/herramientas/${id}`, signal),\n  })\n}\n\nfunction Titulo({ id }) {\n  const { data } = useHerramienta(id)\n  return <h1>{data ? data.nombre : 'Cargando…'}</h1>\n}\n\nfunction Prestamos({ id }) {\n  const { data, isFetching } = useHerramienta(id)\n  return <p>{data ? `Prestada ${data.prestadas} veces` : 'Cargando…'}{isFetching ? ' (actualizando)' : ''}</p>\n}\n\nexport default function Ficha() {\n  return (\n    <>\n      <Titulo id=\"taladro\" />\n      <Prestamos id=\"taladro\" />\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "function useHerramienta(id) {",
      "nota": "Un Hook propio que envuelve la consulta. La clave y la función viven aquí, en un solo sitio; los componentes solo dicen qué herramienta quieren."
    },
    {
      "fragmento": "queryKey: ['herramientas', id],",
      "nota": "Mismo id, misma clave, misma entrada de la caché, lo use quien lo use."
    },
    {
      "fragmento": "const { data, isFetching } = useHerramienta(id)",
      "nota": "isFetching es true siempre que hay una petición en vuelo, tenga ya datos o no. Más abajo se distingue de isPending."
    }
  ]
}
```

`Titulo` y `Prestamos` piden la misma ficha a la vez (la línea `PANTALLA` junta los textos de los dos componentes). Resultado, ejecutado sin StrictMode:

```text
   8 ms  → GET /api/herramientas/taladro
  12 ms  PANTALLA  Cargando…Cargando… (actualizando)
 110 ms  ← /api/herramientas/taladro
 116 ms  PANTALLA  Taladro percutorPrestada 12 veces
Peticiones totales: 1
```

**Una petición, dos componentes.** Con StrictMode, que monta, desmonta y vuelve a montar cada componente en desarrollo (lección 63), el registro cambia:

```text
   2 ms  → GET /api/herramientas/taladro
   3 ms  ✗ cancelada /api/herramientas/taladro
   3 ms  → GET /api/herramientas/taladro
   4 ms  PANTALLA  Cargando…Cargando… (actualizando)
 105 ms  ← /api/herramientas/taladro
 109 ms  PANTALLA  Taladro percutorPrestada 12 veces
Peticiones totales: 2
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Una petición cancelada en desarrollo no es un error",
  "contenido": "Con StrictMode, la primera petición sale, los componentes se desmontan un instante, y como la signal va a fetch, la librería la cancela y vuelve a pedir al montar de nuevo. En el panel de red del navegador verás una petición cancelada y otra buena por cada consulta, solo en desarrollo. Si no pasas la signal, la primera termina y la segunda se une a ella, sin cancelaciones."
}
```

## Fresco, viejo y en caché: `staleTime`, `gcTime` y los estados

Una caché plantea dos preguntas: ¿hasta cuándo me creo lo que tengo?, ¿y cuándo lo tiro? Las contesta cada una con una opción, con estos valores por defecto (de la guía «Important Defaults», comprobados donde se indica):

- **`staleTime` (por defecto, 0): cuánto tiempo se considera «fresco» un dato.** Con 0, los datos se consideran viejos en cuanto llegan. Un dato viejo se enseña igualmente, pero se vuelve a pedir en segundo plano cuando se monta una instancia nueva de la consulta, al volver a enfocar la ventana o al recuperar la conexión. Esto último es lo que dice la documentación: aquí se comprobó el caso del montaje, no el del enfoque ni el de la conexión.
- **`gcTime` (por defecto, 5 minutos): cuánto sobrevive una entrada que nadie usa.** Pasado ese tiempo sin ningún componente leyéndola, se borra. Comprobado: `gcTime por defecto: 300000 ms`.
- **`retry` (por defecto, 3): cuántas veces se reintenta si falla**, con espera creciente. Más abajo, medido.

Con los valores por defecto, el recorrido «Taladro, Sierra, otra vez Taladro» se ve así. Fíjate en la última parte, al volver al taladro:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\nimport { useQuery } from '@tanstack/react-query'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction Ficha({ id, staleTime }) {\n  const { data, status, fetchStatus } = useQuery({\n    queryKey: ['herramientas', id],\n    queryFn: ({ signal }) => pedirJson(`/api/herramientas/${id}`, signal),\n    staleTime,\n  })\n  return (\n    <p>\n      {data ? data.nombre : '—'} · status={status} · fetchStatus={fetchStatus}\n    </p>\n  )\n}\n\nexport default function Fichas({ staleTime = 0 }) {\n  const [id, setId] = useState('taladro')\n  return (\n    <main>\n      <button onClick={() => setId('taladro')}>Taladro</button>\n      <button onClick={() => setId('sierra')}>Sierra</button>\n      <Ficha id={id} staleTime={staleTime} />\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const { data, status, fetchStatus } = useQuery({",
      "nota": "status contesta «¿tengo datos?»: pending (no), success (sí) o error. fetchStatus contesta «¿hay una petición en marcha?»: fetching, paused (sin red) o idle. Son dos preguntas distintas, y por eso un dato puede estar a la vez en success y fetching."
    },
    {
      "fragmento": "    staleTime,\n",
      "nota": "Cuánto tiempo se considera fresco el dato. La prueba se ejecuta dos veces, con 0 (el valor por defecto) y con 60 000 ms."
    },
    {
      "fragmento": "<button onClick={() => setId('taladro')}>Taladro</button>",
      "nota": "Cambiar de herramienta cambia la clave: ['herramientas', 'sierra'] es otra entrada, con su propio estado y sus propios datos. Volver al taladro vuelve a la entrada de antes, que sigue en la caché."
    }
  ]
}
```

**Con `staleTime` a 0 (el valor por defecto):**

```text
   2 ms  → GET /api/herramientas/taladro
   3 ms  PANTALLA  — · status=pending · fetchStatus=fetching
 103 ms  ← /api/herramientas/taladro
 105 ms  PANTALLA  Taladro percutor · status=success · fetchStatus=idle
 255 ms  CLIC Sierra
 328 ms  → GET /api/herramientas/sierra
 328 ms  PANTALLA  — · status=pending · fetchStatus=fetching
 431 ms  ← /api/herramientas/sierra
 434 ms  PANTALLA  Sierra de calar · status=success · fetchStatus=idle
 580 ms  CLIC Taladro
 588 ms  → GET /api/herramientas/taladro
 588 ms  PANTALLA  Taladro percutor · status=success · fetchStatus=fetching
 690 ms  ← /api/herramientas/taladro
 693 ms  PANTALLA  Taladro percutor · status=success · fetchStatus=idle
Peticiones totales: 3
```

**Con `staleTime` de 60 000 ms:**

```text
   1 ms  → GET /api/herramientas/taladro
   1 ms  PANTALLA  — · status=pending · fetchStatus=fetching
 101 ms  ← /api/herramientas/taladro
 103 ms  PANTALLA  Taladro percutor · status=success · fetchStatus=idle
 252 ms  CLIC Sierra
 260 ms  → GET /api/herramientas/sierra
 260 ms  PANTALLA  — · status=pending · fetchStatus=fetching
 361 ms  ← /api/herramientas/sierra
 363 ms  PANTALLA  Sierra de calar · status=success · fetchStatus=idle
 512 ms  CLIC Taladro
 524 ms  PANTALLA  Taladro percutor · status=success · fetchStatus=idle
Peticiones totales: 2
```

La diferencia está en el último clic. En las dos versiones, al volver al taladro **la ficha sale al instante** desde la caché: ni una pantalla de «Cargando». Con 0, el dato se da por viejo, así que sale a la vez una petición en segundo plano (`success` y `fetching` a la vez) y se actualiza si hay algo nuevo. Con 60 s, el dato aún es fresco y **no sale ninguna petición**: 2 en total, en vez de 3.

Esto se llama *stale-while-revalidate*: enseña lo que tienes, comprueba lo que hay. No hay un valor correcto de `staleTime`: depende de cuánto aguanta tu dato sin estar al día. La ficha de una herramienta, minutos; el número de unidades disponibles, segundos o nada.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "status",
      "texto": "pending: la entrada no tiene datos. success: tiene datos, frescos o no. error: la última petición falló y no hay datos que enseñar."
    },
    {
      "titulo": "fetchStatus",
      "texto": "fetching: hay una petición en vuelo, incluso si ya hay datos. paused: la consulta quiere pedir pero no hay red. idle: nada en marcha."
    },
    {
      "titulo": "isPending e isFetching",
      "texto": "isPending es status pending, sin datos. isFetching es fetchStatus fetching, con petición. Un refresco en segundo plano tiene isFetching y no tiene isPending: no muestres un cargando a pantalla completa por él."
    },
    {
      "titulo": "isLoading",
      "texto": "Es isPending y isFetching a la vez: la primera carga de verdad. Si no se pide nada (consulta desactivada), isPending es true pero isLoading es false."
    }
  ]
}
```

## Mantener la lista mientras llega la siguiente: `placeholderData`

En el buscador de arriba, al escribir una letra la lista desaparece y vuelve el «Buscando…»: cada clave nueva es una entrada vacía, y `isPending` es true. Es correcto y a menudo feo: la pantalla parpadea con cada pulsación.

La opción **`placeholderData`** dice qué enseñar mientras la entrada de la clave nueva no tiene datos. Con la función que trae la librería, **`keepPreviousData`**, enseña los datos de la clave anterior. Se comporta como si la entrada ya tuviera datos (`status` es `success`, nunca `pending`) y una bandera, `isPlaceholderData`, te dice que los datos que ves **no son de esta clave**.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\nimport { keepPreviousData, useQuery } from '@tanstack/react-query'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction Resultados({ texto }) {\n  const { data, isPending, isPlaceholderData } = useQuery({\n    queryKey: ['herramientas', texto],\n    queryFn: ({ signal }) => pedirJson(`/api/herramientas?q=${texto}`, signal),\n    placeholderData: keepPreviousData,\n  })\n\n  if (isPending) return <p>Cargando la primera lista…</p>\n  return (\n    <ul aria-busy={isPlaceholderData}>\n      {data.map((herramienta) => (\n        <li key={herramienta.id}>{herramienta.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function Buscador() {\n  const [texto, setTexto] = useState('')\n\n  return (\n    <main>\n      <label>\n        Buscar herramienta\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <Resultados texto={texto} />\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import { keepPreviousData, useQuery } from '@tanstack/react-query'",
      "nota": "En la versión 5 (la de esta lección), keepPreviousData es una función que se importa y se pasa como valor de placeholderData. Las versiones anteriores tenían una opción con ese nombre."
    },
    {
      "fragmento": "placeholderData: keepPreviousData,",
      "nota": "Mientras la clave nueva no tiene datos, enseña los de la anterior. Los datos de sustitución no se guardan en la caché: la entrada de la clave nueva sigue vacía y sigue pidiéndose."
    },
    {
      "fragmento": "aria-busy={isPlaceholderData}",
      "nota": "isPlaceholderData avisa de que la lista es de la búsqueda anterior. Aquí se marca con aria-busy; en una interfaz real, atenúa la lista o enseña un indicador. Si no avisas, el usuario cree que lo que ve es lo que escribió."
    }
  ]
}
```

Escribes «ta» sobre la lista completa; la petición tarda 300 ms:

```text
   5 ms  → GET /api/herramientas?q=
   5 ms  PANTALLA  Cargando la primera lista…
 106 ms  ← /api/herramientas?q=
 110 ms  PANTALLA  [lista de 5]
 260 ms  ESCRIBO «ta»
 263 ms  → GET /api/herramientas?q=ta
 316 ms  aria-busy=true
 566 ms  ← /api/herramientas?q=ta
 569 ms  PANTALLA  [Taladro percutor][Lijadora orbital][Tala-setos eléctrico]
 717 ms  aria-busy=false
```

Desde `ESCRIBO «ta»` hasta que llega la respuesta, la pantalla **no cambia**: sigue la lista de cinco herramientas, pero ya marcada como ocupada (`aria-busy=true`). Cuando llegan los datos de «ta», se sustituyen y la marca desaparece. Es la misma sensación que `useDeferredValue` (lecciones 51 y 56), conseguida de otra manera: allí React mantenía el valor viejo; aquí lo mantiene la caché. Con el mismo cuidado: lo que ves puede ir por detrás de lo que has escrito, y debes decirlo.

Es también lo que su guía de listas paginadas («Paginated Queries») recomienda: al pasar de página, la anterior se queda en pantalla, atenuada, hasta que llega la siguiente.

## Reintentos: un fallo suelto no llega a la pantalla

Si la petición falla (la función lanza un error o la promesa se rechaza), la librería la repite sin decir nada. Medido con un servidor que siempre responde 500, y el temporizador adelantado a mano:

```text
t≈0 s  status=pending · fallos=1 ·   | peticiones=1
t≈1 s  status=pending · fallos=2 ·   | peticiones=2
t≈2 s  status=pending · fallos=2 ·   | peticiones=2
t≈3 s  status=pending · fallos=3 ·   | peticiones=3
t≈4 s  status=pending · fallos=3 ·   | peticiones=3
t≈5 s  status=pending · fallos=3 ·   | peticiones=3
t≈6 s  status=pending · fallos=3 ·   | peticiones=3
t≈7 s  status=error · fallos=4 · el servidor respondió 500  | peticiones=4
t≈8 s  status=error · fallos=4 · el servidor respondió 500  | peticiones=4
```

Cuatro peticiones en total (la primera y tres reintentos), a los 0, 1, 3 y 7 segundos: esperas de 1, 2 y 4 segundos. Solo después de la cuarta, `status` pasa a `error`. Hasta entonces el usuario sigue viendo «Cargando». Es lo que dice la guía de valores por defecto, y es el motivo de que la lección 52 avisara de que «Fallar la siguiente petición» no se nota. Con `retry: false` (lo que hacen casi todas las pruebas) falla a la primera; con un número, hace ese número de reintentos. Esta web usa `retry: 1`.

## Cambiar datos: `useMutation` e invalidación

Leer es `useQuery`. Escribir (crear, editar, borrar) es **`useMutation`**: no se ejecuta al montar ni se guarda en la caché por clave; la lanzas tú con `mutate`. Lo importante viene después: al terminar, tus listas en caché ya no están al día. Se lo dices con **`invalidateQueries`**: marca como viejas todas las entradas cuya clave **empiece** por la que le das, y las que están en pantalla se vuelven a pedir.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport default function Inventario() {\n  const queryClient = useQueryClient()\n  const lista = useQuery({\n    queryKey: ['herramientas', ''],\n    queryFn: ({ signal }) => pedirJson('/api/herramientas?q=', signal),\n  })\n  const anadir = useMutation({\n    mutationFn: (nombre) =>\n      fetch('/api/herramientas', {\n        method: 'POST',\n        body: JSON.stringify({ nombre, prestadas: 0 }),\n      }).then((r) => r.json()),\n    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['herramientas'] }),\n  })\n\n  return (\n    <main>\n      <button onClick={() => anadir.mutate('Gato hidráulico')}>Añadir gato hidráulico</button>\n      <p>{anadir.isPending ? 'Guardando…' : 'En reposo'}</p>\n      <ul>\n        {lista.data?.map((h) => (\n          <li key={h.id}>{h.nombre}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const queryClient = useQueryClient()",
      "nota": "El mismo QueryClient del proveedor, para hablar con la caché desde un componente."
    },
    {
      "fragmento": "mutationFn: (nombre) =>",
      "nota": "La función que cambia datos en el servidor. Recibe lo que le pases a mutate. Un fetch con POST; en una aplicación real comprobarías respuesta.ok, como en la consulta."
    },
    {
      "fragmento": "onSuccess: () => queryClient.invalidateQueries({ queryKey: ['herramientas'] }),",
      "nota": "Cuando el POST sale bien, invalida todo lo que empiece por herramientas: la lista, las fichas, las búsquedas. La clave de la lista es [\"herramientas\", \"\"], que empieza por [\"herramientas\"], y por eso se refresca."
    },
    {
      "fragmento": "<button onClick={() => anadir.mutate('Gato hidráulico')}>",
      "nota": "mutate lanza la mutación. Si quieres esperar el resultado con await, mutateAsync devuelve una promesa."
    },
    {
      "fragmento": "{anadir.isPending ? 'Guardando…' : 'En reposo'}",
      "nota": "La mutación tiene su propio estado: isPending mientras se guarda, y también isError, error y isSuccess. Sin useState para esto."
    }
  ]
}
```

Pulsas «Añadir gato hidráulico»:

```text
   4 ms  → GET /api/herramientas?q=
   5 ms  PANTALLA  En reposo
 105 ms  ← /api/herramientas?q=
 111 ms  PANTALLA  En reposo[lista de 5]
 258 ms  CLIC Añadir
 277 ms  → POST /api/herramientas
 280 ms  PANTALLA  Guardando…[lista de 5]
 379 ms  ← /api/herramientas
 381 ms  → GET /api/herramientas?q=
 483 ms  ← /api/herramientas?q=
 489 ms  PANTALLA  En reposo[lista de 6]
```

El POST termina, y **sin que escribas ninguna petición** la lista vuelve a pedirse y pasa de 5 a 6 herramientas. Entre medias hay un momento en que la lista aún es de cinco: para evitarlo, `useMutation` tiene `onMutate`, con el que se actualiza la caché *antes* de que conteste el servidor y se deshace si falla. Es la misma idea que `useOptimistic` (lección 60), a nivel de caché; tiene su guía, «Optimistic Updates», y un reto abajo.

## Así lo usa esta web

Tech Study Tracker usa TanStack Query para casi todo lo que lee de Supabase: lecciones, tecnologías, categorías, favoritos, comentarios y progreso. Tres piezas reales de su código, que aplican lo que acabas de ver. Primero, el cliente, en `src/lib/queryClient.ts`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const queryClient = new QueryClient({\n  defaultOptions: {\n    queries: { retry: 1, staleTime: 30_000 },\n  },\n})",
  "anotaciones": [
    {
      "fragmento": "retry: 1",
      "nota": "Un solo reintento en vez de tres: si Supabase no responde, es mejor enseñar el error pronto que tener al usuario esperando siete segundos."
    },
    {
      "fragmento": "staleTime: 30_000",
      "nota": "Treinta segundos de datos frescos. Navegar entre lecciones y volver no dispara una petición cada vez, pero un dato cambiado por otra pestaña se nota en menos de un minuto."
    }
  ]
}
```

Después, las claves. En `src/lib/queries/queryKeys.ts` están todas juntas, de lo general a lo concreto, y la mayoría llevan el identificador de quien mira. Así, cuando alguien cierra sesión, sus datos no se mezclan con los públicos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export const queryKeys = {\n  technologies: ['technologies'] as const,\n  technologiesForViewer: (viewerId: string | null) =>\n    ['technologies', viewerId ?? 'public'] as const,\n  technology: (viewerId: string | null, technologyId: string) =>\n    ['technologies', viewerId ?? 'public', technologyId] as const,\n  leccionBySlug: (viewerId: string | null, technologyId: string, slug: string) =>\n    ['lecciones', viewerId ?? 'public', 'slug', technologyId, slug] as const,\n  progress: ['progress'] as const,\n}",
  "anotaciones": [
    {
      "fragmento": "technologies: ['technologies'] as const,",
      "nota": "El prefijo general. invalidateQueries({ queryKey: queryKeys.technologies }) refresca la lista de tecnologías y la de cada una a la vez, como el [\"herramientas\"] de la mutación de arriba."
    },
    {
      "fragmento": "['technologies', viewerId ?? 'public'] as const,",
      "nota": "El identificador de quien mira va dentro de la clave. Los datos de un usuario y los públicos son entradas distintas de la caché, y no se pisan al iniciar o cerrar sesión."
    },
    {
      "fragmento": "['lecciones', viewerId ?? 'public', 'slug', technologyId, slug] as const,",
      "nota": "Una clave con todo lo que la función necesita para pedir la lección: quién mira, la tecnología y el slug. Es la regla de la lista de dependencias, aplicada."
    },
    {
      "fragmento": "as const",
      "nota": "Es TypeScript (módulo 10): fija el array como una tupla de solo lectura, para que los tipos sepan exactamente qué hay en cada posición."
    }
  ]
}
```

Y, por último, una consulta que todavía no puede pedir. En `src/lib/hooks/useTechnologies.ts`, `enabled` aplaza la petición hasta que se sepa quién está mirando; mientras `enabled` es falso, la consulta ni sale ni da error, como la consulta dependiente de la lección 52:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export function useTechnology(id: string) {\n  const { user, loading } = useAuth()\n  return useQuery({\n    queryKey: queryKeys.technology(user?.id ?? null, id),\n    queryFn: () => getTechnology(id),\n    enabled: !loading && Boolean(id),\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "queryKey: queryKeys.technology(user?.id ?? null, id),",
      "nota": "La clave sale de una función central, no se escribe a mano en cada Hook. Un solo sitio donde cambiarla, y los Hooks de lectura y de mutación no pueden desincronizarse."
    },
    {
      "fragmento": "enabled: !loading && Boolean(id),",
      "nota": "No pidas hasta saber quién eres: si la sesión aún se está recuperando, pedir ahora pediría los datos públicos y, un instante después, los tuyos. enabled evita la primera petición."
    }
  ]
}
```

Todo esto vive en un Hook propio por dato, que es la forma habitual de organizar el código: ningún componente sabe de claves ni de `fetch`. Más sobre cómo está hecha la web, en la lección 86. La versión de TanStack Query de la web (5.101.4, según su `package.json`) es algo anterior a la de esta lección (5.104.5); la API que se ha visto es la misma.

## Cuándo lo usarías de verdad

La regla de la lección 75: si el dato **viene del servidor**, es una caché y se trata como tal. Si tu aplicación pide datos en más de dos o tres sitios, la librería se paga sola. Y no es la única forma de hacerlo:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro maneras de tener datos del servidor",
  "roles": [
    {
      "etiqueta": "Un efecto",
      "rol": "Una petición suelta",
      "descripcion": "Un componente con un dato que no se comparte, con su limpieza (lección 38). Para más, acabas escribiendo la librería a mano."
    },
    {
      "etiqueta": "use con Suspense",
      "rol": "Datos como promesas",
      "descripcion": "Lees promesas durante el render (lecciones 49 y 52), pero la caché de promesas la escribes tú o la trae una librería."
    },
    {
      "etiqueta": "TanStack Query (o SWR)",
      "rol": "La caché del cliente",
      "descripcion": "Para una app de navegador que pide datos a una API: caché, reintentos, cancelación y mutaciones. SWR es más pequeño; RTK Query, si ya usas Redux."
    },
    {
      "etiqueta": "Un framework",
      "rol": "Datos cargados con la ruta",
      "descripcion": "Next.js o React Router en modo framework cargan los datos en el servidor antes de pintar (lecciones 88 y 90). Úsalo si lo tienes."
    }
  ]
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "TanStack Query es un gestor de estado global como Redux",
      "realidad": "Es una caché de datos del servidor. No guarda el estado del cliente (un menú abierto, un campo a medias) ni sustituye a Zustand o a useState; se lleva bien con ellos y, de hecho, les quita los datos que no eran suyos."
    },
    {
      "mito": "Cancelar la petición es lo que evita la condición de carrera",
      "realidad": "Lo evita la clave: cada componente lee la entrada de la suya. Lo comprobaste en la prueba sin signal: sin cancelar nada, la pantalla acierta igual. La cancelación solo ahorra trabajo al servidor y al navegador."
    },
    {
      "mito": "Con la librería ya no hay que pensar en la red",
      "realidad": "Sigues decidiendo la clave, el staleTime y dónde se pide cada cosa. Y las cascadas de peticiones (lección 52) no desaparecen: dos componentes hijos anidados que piden uno tras otro siguen esperándose."
    },
    {
      "mito": "Hay que copiar data a un useState para poder modificarla",
      "realidad": "Es un error muy común. data ya es el estado; copiarlo crea dos fuentes de la verdad que se desincronizan. Si necesitas una versión editada, calcúlala al renderizar (lección 24), o guarda solo lo que escribe el usuario."
    }
  ]
}
```

## Errores típicos

**1. Una clave que no incluye todo lo que usa la función.** Es el error más frecuente y el más silencioso: no hay aviso ni error, y la pantalla no cambia. Pruébalo mentalmente:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\nimport { useQuery } from '@tanstack/react-query'\n\nfunction Ficha({ id }) {\n  const { data } = useQuery({\n    queryKey: ['ficha'],\n    queryFn: () => fetch(`/api/herramientas/${id}`).then((r) => r.json()),\n  })\n  return <h2>{data ? data.nombre : 'Cargando…'}</h2>\n}\n\n// El padre guarda id en un useState, y los botones lo cambian.\n// La pantalla enseña «Taladro percutor». Pulsas «Sierra».\n// ¿Qué enseña la pantalla y qué petición sale?",
  "opciones": [
    "Cargando… y después «Sierra de calar», tras una petición nueva",
    "Sigue «Taladro percutor» y no sale ninguna petición",
    "Un error: la clave no coincide con la función",
    "Sale «Sierra de calar» sin petición, porque ya estaba en caché"
  ],
  "correcta": 1,
  "explicacion": "La clave es siempre [\"ficha\"], así que al cambiar id la librería ve la misma entrada, ya con datos frescos, y no hay nada que pedir. Comprobado: tras pulsar Sierra, el registro no muestra ninguna petición nueva y la pantalla sigue en Taladro percutor. La corrección: queryKey: [\"ficha\", id]."
}
```

Es el ejercicio 1 de abajo.

**2. Crear el `QueryClient` dentro de un componente.** Cada render crea una caché nueva y vacía, y la anterior se pierde con todo lo que tenía. Aquí, un `App` que crea el cliente en el render y una ficha con `staleTime` de 60 s (que debería evitar toda petición al volver):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\nimport { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'\n\nfunction Ficha() {\n  const { data } = useQuery({\n    queryKey: ['herramientas', 'taladro'],\n    queryFn: () => fetch('/api/herramientas/taladro').then((r) => r.json()),\n    staleTime: 60_000,\n  })\n  return <p>{data ? data.nombre : 'Cargando…'}</p>\n}\n\nexport default function App() {\n  const [visible, setVisible] = useState(true)\n  const queryClient = new QueryClient() // se crea de nuevo en cada render de App\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <button onClick={() => setVisible(!visible)}>Alternar ficha</button>\n      {visible && <Ficha />}\n    </QueryClientProvider>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const queryClient = new QueryClient() // se crea de nuevo en cada render de App",
      "nota": "El fallo. Cada vez que App se renderiza (aquí, al pulsar el botón) hay un cliente nuevo y una caché vacía. Lo correcto: crearlo fuera del componente, o con useState(() => new QueryClient()) si de verdad lo necesitas dentro."
    },
    {
      "fragmento": "staleTime: 60_000,",
      "nota": "Con la caché de siempre, esta ficha no se volvería a pedir en un minuto. Con una caché nueva en cada render, el staleTime no sirve de nada."
    }
  ]
}
```

Ocultas la ficha y la vuelves a mostrar:

```text
   2 ms  → GET /api/herramientas/taladro
   2 ms  PANTALLA  Cargando…
 103 ms  ← /api/herramientas/taladro
 108 ms  PANTALLA  Taladro percutor
 253 ms  CLIC ocultar
 272 ms  PANTALLA  
 374 ms  CLIC mostrar
 387 ms  → GET /api/herramientas/taladro
 388 ms  PANTALLA  Cargando…
 489 ms  ← /api/herramientas/taladro
 494 ms  PANTALLA  Taladro percutor
Peticiones totales: 2
```

A pesar del `staleTime`, **la segunda vez vuelve el «Cargando…» y sale una petición nueva**: 2 en total, cuando con el cliente en el nivel del módulo habrían sido 1.

**3. Creer que `fetch` falla con un 404.** `fetch` solo se rechaza si no hay red. Un 404 o un 500 son respuestas válidas, y la librería solo reintenta o pasa a `error` cuando la función **lanza**. Esta consulta se olvida de comprobar `respuesta.ok`, contra una ficha que no existe:

```jsx
function Ficha() {
  const { data, error, status } = useQuery({
    queryKey: ['herramientas', 'fantasma'],
    queryFn: () => fetch('/api/herramientas/fantasma').then((r) => r.json()),
    retry: false,
  })
  return <p>status={status} · error={String(error)} · data={JSON.stringify(data)}</p>
}
```

```text
status=success · error=null · data={"error":"no existe"}
```

`status=success`, sin error, y en `data` el cuerpo del error. En todos los ejemplos de esta lección, `pedirJson` lleva el `if (!respuesta.ok) throw new Error(...)` que lo evita.

**4. Copiar `data` a un `useState`.** `useState(data)` toma el valor de la primera vez, que es `undefined` porque aún no ha llegado nada, y no se entera de los cambios (lección 24). Lee `data` directamente.

**5. Esperar la cancelación sin pasar la `signal`.** Lo viste en la salida de «sin signal»: la petición vieja terminaba igual. No es grave, pero si tu servidor hace trabajo caro por cada petición, pasa la `signal` a `fetch`.

## Ejercicios

Los tres usan la caché a mano de `miniConsulta.jsx` (la API es la misma, `useConsulta({ clave, funcion })`, con la misma idea que `useQuery`). No importes nada de npm: la vista previa no puede. El archivo `miniConsulta.jsx` no hay que cambiarlo.

**1. La clave incompleta.** La ficha de Manitas pide `/api/herramientas/${id}`, pero su clave es siempre `['ficha']`. Pulsa «Sierra» y mira qué pasa, y arréglalo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La clave incompleta",
  "consigna": "Pulsa «Sierra»: la ficha no cambia y no sale ninguna petición. Cambia la clave para que incluya todo lo que usa la petición.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { useConsulta } from './miniConsulta'\nimport './estilos.css'\n\nasync function pedirJson(url) {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction Ficha({ id }) {\n  const { datos, pendiente, error } = useConsulta({\n    // TODO: ¿qué cambia en la petición cuando cambia la herramienta?\n    clave: ['ficha'],\n    funcion: () => pedirJson(`/api/herramientas/${id}`),\n  })\n\n  if (error) return <p role=\"alert\">Error: {error.message}</p>\n  if (pendiente) return <p>Cargando la ficha…</p>\n  return (\n    <article>\n      <h2>{datos.nombre}</h2>\n      <p>Prestada {datos.prestadas} veces. Estado: {datos.estado}.</p>\n    </article>\n  )\n}\n\nexport default function App() {\n  const [id, setId] = useState('taladro')\n\n  return (\n    <main>\n      <h1>Fichas de Manitas</h1>\n      <div className=\"botones\">\n        <button onClick={() => setId('taladro')}>Taladro</button>\n        <button onClick={() => setId('sierra')}>Sierra</button>\n        <button onClick={() => setId('lijadora')}>Lijadora</button>\n      </div>\n      <Ficha id={id} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "miniConsulta.jsx",
      "codigo": "// Una caché por clave escrita a mano: solo para entender qué hace TanStack\n// Query por dentro. La librería real hace muchísimo más (cancelar, reintentar,\n// recoger la basura, refrescar al volver a la pestaña...).\nimport { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react'\n\nconst entradas = new Map() // clave en texto -> { vista, actualizado, promesa }\nconst oyentes = new Set()\nconst VACIA = { datos: undefined, error: undefined, pidiendo: false }\nlet pedidas = { total: 0 }\n\nfunction avisar() {\n  for (const oyente of oyentes) oyente()\n}\n\nfunction suscribir(oyente) {\n  oyentes.add(oyente)\n  return () => oyentes.delete(oyente)\n}\n\nfunction leer(hash) {\n  return entradas.get(hash)?.vista ?? VACIA\n}\n\nfunction pedir(hash, funcion) {\n  const entrada = entradas.get(hash) ?? { vista: VACIA, actualizado: 0, promesa: null }\n  if (entrada.promesa) return // ya hay una petición en curso con esta clave: se comparte\n\n  pedidas = { total: pedidas.total + 1 }\n  const promesa = funcion().then(\n    (datos) => {\n      entradas.set(hash, { vista: { datos, error: undefined, pidiendo: false }, actualizado: Date.now(), promesa: null })\n      avisar()\n    },\n    (error) => {\n      const actual = entradas.get(hash)\n      entradas.set(hash, { ...actual, vista: { ...actual.vista, error, pidiendo: false }, promesa: null })\n      avisar()\n    },\n  )\n  entradas.set(hash, { ...entrada, promesa, vista: { ...entrada.vista, error: undefined, pidiendo: true } })\n  avisar()\n}\n\nexport function useConsulta({ clave, funcion, tiempoFresco = 0, conservarAnterior = false }) {\n  const hash = JSON.stringify(clave)\n  const vista = useSyncExternalStore(suscribir, () => leer(hash))\n\n  const pedirSiHaceFalta = useEffectEvent(() => {\n    const entrada = entradas.get(hash)\n    const fresca = entrada?.vista.datos !== undefined && Date.now() - entrada.actualizado < tiempoFresco\n    if (!fresca) pedir(hash, funcion)\n  })\n  useEffect(() => {\n    pedirSiHaceFalta()\n  }, [hash])\n\n  // Los últimos datos que hubo, para conservarAnterior\n  const [ultimos, setUltimos] = useState(undefined)\n  if (vista.datos !== undefined && vista.datos !== ultimos) setUltimos(vista.datos)\n  const sustituto = conservarAnterior && vista.datos === undefined && ultimos !== undefined\n\n  return {\n    datos: sustituto ? ultimos : vista.datos,\n    error: vista.error,\n    pendiente: vista.datos === undefined && !sustituto, // no hay nada que enseñar\n    pidiendo: vista.pidiendo, // hay una petición en vuelo, haya o no datos\n    esSustituto: sustituto,\n  }\n}\n\nexport function usePeticiones() {\n  return useSyncExternalStore(suscribir, () => pedidas).total\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nul {\n  margin: 0.5rem 0;\n  padding-left: 1.2rem;\n}\n\n.estado {\n  margin: 0.4rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.atenuada {\n  opacity: 0.5;\n}\n\n.botones {\n  display: flex;\n  gap: 0.4rem;\n  margin-bottom: 0.5rem;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "api": {
    "herramientas": [
      {
        "id": "taladro",
        "nombre": "Taladro percutor",
        "prestadas": 12,
        "estado": "disponible"
      },
      {
        "id": "sierra",
        "nombre": "Sierra de calar",
        "prestadas": 7,
        "estado": "prestada"
      },
      {
        "id": "lijadora",
        "nombre": "Lijadora orbital",
        "prestadas": 5,
        "estado": "disponible"
      },
      {
        "id": "escalera",
        "nombre": "Escalera de tijera",
        "prestadas": 9,
        "estado": "disponible"
      },
      {
        "id": "tala",
        "nombre": "Tala-setos eléctrico",
        "prestadas": 2,
        "estado": "en reparación"
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparece la ficha del taladro",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Taladro percutor"
      }
    },
    {
      "descripcion": "Al pulsar «Sierra», aparece la ficha de la sierra",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sierra"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Sierra de calar"
      }
    },
    {
      "descripcion": "Al pulsar «Lijadora», aparece su ficha con sus préstamos",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Lijadora"
          }
        }
      ],
      "espera": {
        "texto": "Prestada 5 veces. Estado: disponible."
      }
    },
    {
      "descripcion": "Se puede volver al taladro después de ver la sierra",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sierra"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Taladro"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Taladro percutor"
      }
    }
  ]
}
```

**2. Fresco el tiempo justo.** Ahora la clave está bien, pero cada vez que vuelves a una herramienta que ya habías visto, el contador de peticiones sube. La ficha de una herramienta casi no cambia: dale a `useConsulta` un `tiempoFresco` para que Taladro, Sierra y otra vez Taladro sean dos peticiones, no tres. El tiempo, en milisegundos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Fresco el tiempo justo",
  "consigna": "Pulsa «Taladro», «Sierra» y otra vez «Taladro». El contador debería quedarse en 2: la segunda vez que ves el taladro, la ficha no hace falta pedirla. Mira también cómo aparece «Comprobando si ha cambiado…» mientras se vuelve a pedir.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { useConsulta, usePeticiones } from './miniConsulta'\nimport './estilos.css'\n\nasync function pedirJson(url) {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction Ficha({ id }) {\n  const { datos, pendiente, pidiendo, error } = useConsulta({\n    clave: ['ficha', id],\n    funcion: () => pedirJson(`/api/herramientas/${id}`),\n    // TODO: la ficha de una herramienta casi no cambia. ¿Cuánto tiempo\n    // puede darse por buena una ficha ya pedida?\n  })\n\n  if (error) return <p role=\"alert\">Error: {error.message}</p>\n  if (pendiente) return <p>Cargando la ficha…</p>\n  return (\n    <article>\n      <h2>{datos.nombre}</h2>\n      <p>Prestada {datos.prestadas} veces. Estado: {datos.estado}.</p>\n      {pidiendo && <p className=\"estado\">Comprobando si ha cambiado…</p>}\n    </article>\n  )\n}\n\nexport default function App() {\n  const [id, setId] = useState('taladro')\n  const peticiones = usePeticiones()\n\n  return (\n    <main>\n      <h1>Fichas de Manitas</h1>\n      <div className=\"botones\">\n        <button onClick={() => setId('taladro')}>Taladro</button>\n        <button onClick={() => setId('sierra')}>Sierra</button>\n        <button onClick={() => setId('lijadora')}>Lijadora</button>\n      </div>\n      <Ficha id={id} />\n      <p className=\"estado\">Peticiones enviadas: {peticiones}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "miniConsulta.jsx",
      "codigo": "// Una caché por clave escrita a mano: solo para entender qué hace TanStack\n// Query por dentro. La librería real hace muchísimo más (cancelar, reintentar,\n// recoger la basura, refrescar al volver a la pestaña...).\nimport { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react'\n\nconst entradas = new Map() // clave en texto -> { vista, actualizado, promesa }\nconst oyentes = new Set()\nconst VACIA = { datos: undefined, error: undefined, pidiendo: false }\nlet pedidas = { total: 0 }\n\nfunction avisar() {\n  for (const oyente of oyentes) oyente()\n}\n\nfunction suscribir(oyente) {\n  oyentes.add(oyente)\n  return () => oyentes.delete(oyente)\n}\n\nfunction leer(hash) {\n  return entradas.get(hash)?.vista ?? VACIA\n}\n\nfunction pedir(hash, funcion) {\n  const entrada = entradas.get(hash) ?? { vista: VACIA, actualizado: 0, promesa: null }\n  if (entrada.promesa) return // ya hay una petición en curso con esta clave: se comparte\n\n  pedidas = { total: pedidas.total + 1 }\n  const promesa = funcion().then(\n    (datos) => {\n      entradas.set(hash, { vista: { datos, error: undefined, pidiendo: false }, actualizado: Date.now(), promesa: null })\n      avisar()\n    },\n    (error) => {\n      const actual = entradas.get(hash)\n      entradas.set(hash, { ...actual, vista: { ...actual.vista, error, pidiendo: false }, promesa: null })\n      avisar()\n    },\n  )\n  entradas.set(hash, { ...entrada, promesa, vista: { ...entrada.vista, error: undefined, pidiendo: true } })\n  avisar()\n}\n\nexport function useConsulta({ clave, funcion, tiempoFresco = 0, conservarAnterior = false }) {\n  const hash = JSON.stringify(clave)\n  const vista = useSyncExternalStore(suscribir, () => leer(hash))\n\n  const pedirSiHaceFalta = useEffectEvent(() => {\n    const entrada = entradas.get(hash)\n    const fresca = entrada?.vista.datos !== undefined && Date.now() - entrada.actualizado < tiempoFresco\n    if (!fresca) pedir(hash, funcion)\n  })\n  useEffect(() => {\n    pedirSiHaceFalta()\n  }, [hash])\n\n  // Los últimos datos que hubo, para conservarAnterior\n  const [ultimos, setUltimos] = useState(undefined)\n  if (vista.datos !== undefined && vista.datos !== ultimos) setUltimos(vista.datos)\n  const sustituto = conservarAnterior && vista.datos === undefined && ultimos !== undefined\n\n  return {\n    datos: sustituto ? ultimos : vista.datos,\n    error: vista.error,\n    pendiente: vista.datos === undefined && !sustituto, // no hay nada que enseñar\n    pidiendo: vista.pidiendo, // hay una petición en vuelo, haya o no datos\n    esSustituto: sustituto,\n  }\n}\n\nexport function usePeticiones() {\n  return useSyncExternalStore(suscribir, () => pedidas).total\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nul {\n  margin: 0.5rem 0;\n  padding-left: 1.2rem;\n}\n\n.estado {\n  margin: 0.4rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.atenuada {\n  opacity: 0.5;\n}\n\n.botones {\n  display: flex;\n  gap: 0.4rem;\n  margin-bottom: 0.5rem;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "api": {
    "herramientas": [
      {
        "id": "taladro",
        "nombre": "Taladro percutor",
        "prestadas": 12,
        "estado": "disponible"
      },
      {
        "id": "sierra",
        "nombre": "Sierra de calar",
        "prestadas": 7,
        "estado": "prestada"
      },
      {
        "id": "lijadora",
        "nombre": "Lijadora orbital",
        "prestadas": 5,
        "estado": "disponible"
      },
      {
        "id": "escalera",
        "nombre": "Escalera de tijera",
        "prestadas": 9,
        "estado": "disponible"
      },
      {
        "id": "tala",
        "nombre": "Tala-setos eléctrico",
        "prestadas": 2,
        "estado": "en reparación"
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparece la ficha del taladro",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Taladro percutor"
      }
    },
    {
      "descripcion": "Al ver la sierra, la ficha cambia",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sierra"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Sierra de calar"
      }
    },
    {
      "descripcion": "Taladro, Sierra y otra vez Taladro son solo 2 peticiones",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Taladro percutor"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sierra"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Sierra de calar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Taladro"
          }
        }
      ],
      "espera": {
        "texto": "Peticiones enviadas: 2"
      }
    },
    {
      "descripcion": "Al volver a una ficha ya vista no sale «Comprobando si ha cambiado…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Taladro percutor"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sierra"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Sierra de calar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Taladro"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Comprobando si ha cambiado…"
        }
      }
    }
  ]
}
```

**3. La lista que no desaparece.** El buscador de Manitas parpadea con cada letra: la lista se esconde detrás de un «Buscando…». Con `conservarAnterior` (el equivalente de `placeholderData: keepPreviousData`), mientras llega la búsqueda nueva debe seguir la lista anterior, atenuada y con el aviso «Actualizando…». Esas dos cosas ya están en el JSX; solo falta activar la opción.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La lista que no desaparece",
  "consigna": "Escribe «tal» y fíjate en la lista durante los 800 ms que tarda la respuesta. Tiene que seguir la lista anterior, con «Actualizando…», hasta que lleguen los resultados nuevos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { useConsulta } from './miniConsulta'\nimport './estilos.css'\n\nasync function pedirJson(url) {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction Resultados({ texto }) {\n  const { datos, pendiente, error, esSustituto } = useConsulta({\n    clave: ['herramientas', texto],\n    funcion: () => pedirJson(`/api/herramientas?q=${texto}`),\n    // TODO: mientras llega la búsqueda nueva, que no desaparezca la lista\n  })\n\n  if (error) return <p role=\"alert\">Error: {error.message}</p>\n  if (pendiente) return <p>Buscando «{texto}»…</p>\n  return (\n    <>\n      {esSustituto && <p className=\"estado\">Actualizando…</p>}\n      <ul className={esSustituto ? 'atenuada' : undefined}>\n        {datos.map((herramienta) => (\n          <li key={herramienta.id}>{herramienta.nombre}</li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nexport default function App() {\n  const [texto, setTexto] = useState('')\n\n  return (\n    <main>\n      <h1>Biblioteca de herramientas Manitas</h1>\n      <label>\n        Buscar herramienta\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <Resultados texto={texto} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "miniConsulta.jsx",
      "codigo": "// Una caché por clave escrita a mano: solo para entender qué hace TanStack\n// Query por dentro. La librería real hace muchísimo más (cancelar, reintentar,\n// recoger la basura, refrescar al volver a la pestaña...).\nimport { useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react'\n\nconst entradas = new Map() // clave en texto -> { vista, actualizado, promesa }\nconst oyentes = new Set()\nconst VACIA = { datos: undefined, error: undefined, pidiendo: false }\nlet pedidas = { total: 0 }\n\nfunction avisar() {\n  for (const oyente of oyentes) oyente()\n}\n\nfunction suscribir(oyente) {\n  oyentes.add(oyente)\n  return () => oyentes.delete(oyente)\n}\n\nfunction leer(hash) {\n  return entradas.get(hash)?.vista ?? VACIA\n}\n\nfunction pedir(hash, funcion) {\n  const entrada = entradas.get(hash) ?? { vista: VACIA, actualizado: 0, promesa: null }\n  if (entrada.promesa) return // ya hay una petición en curso con esta clave: se comparte\n\n  pedidas = { total: pedidas.total + 1 }\n  const promesa = funcion().then(\n    (datos) => {\n      entradas.set(hash, { vista: { datos, error: undefined, pidiendo: false }, actualizado: Date.now(), promesa: null })\n      avisar()\n    },\n    (error) => {\n      const actual = entradas.get(hash)\n      entradas.set(hash, { ...actual, vista: { ...actual.vista, error, pidiendo: false }, promesa: null })\n      avisar()\n    },\n  )\n  entradas.set(hash, { ...entrada, promesa, vista: { ...entrada.vista, error: undefined, pidiendo: true } })\n  avisar()\n}\n\nexport function useConsulta({ clave, funcion, tiempoFresco = 0, conservarAnterior = false }) {\n  const hash = JSON.stringify(clave)\n  const vista = useSyncExternalStore(suscribir, () => leer(hash))\n\n  const pedirSiHaceFalta = useEffectEvent(() => {\n    const entrada = entradas.get(hash)\n    const fresca = entrada?.vista.datos !== undefined && Date.now() - entrada.actualizado < tiempoFresco\n    if (!fresca) pedir(hash, funcion)\n  })\n  useEffect(() => {\n    pedirSiHaceFalta()\n  }, [hash])\n\n  // Los últimos datos que hubo, para conservarAnterior\n  const [ultimos, setUltimos] = useState(undefined)\n  if (vista.datos !== undefined && vista.datos !== ultimos) setUltimos(vista.datos)\n  const sustituto = conservarAnterior && vista.datos === undefined && ultimos !== undefined\n\n  return {\n    datos: sustituto ? ultimos : vista.datos,\n    error: vista.error,\n    pendiente: vista.datos === undefined && !sustituto, // no hay nada que enseñar\n    pidiendo: vista.pidiendo, // hay una petición en vuelo, haya o no datos\n    esSustituto: sustituto,\n  }\n}\n\nexport function usePeticiones() {\n  return useSyncExternalStore(suscribir, () => pedidas).total\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  margin-left: 0.4rem;\n  padding: 0.25rem 0.4rem;\n}\n\nul {\n  margin: 0.5rem 0;\n  padding-left: 1.2rem;\n}\n\n.estado {\n  margin: 0.4rem 0;\n  color: #57534e;\n  font-size: 0.9rem;\n}\n\n.atenuada {\n  opacity: 0.5;\n}\n\n.botones {\n  display: flex;\n  gap: 0.4rem;\n  margin-bottom: 0.5rem;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "api": {
    "herramientas": [
      {
        "id": "taladro",
        "nombre": "Taladro percutor",
        "prestadas": 12,
        "estado": "disponible"
      },
      {
        "id": "sierra",
        "nombre": "Sierra de calar",
        "prestadas": 7,
        "estado": "prestada"
      },
      {
        "id": "lijadora",
        "nombre": "Lijadora orbital",
        "prestadas": 5,
        "estado": "disponible"
      },
      {
        "id": "escalera",
        "nombre": "Escalera de tijera",
        "prestadas": 9,
        "estado": "disponible"
      },
      {
        "id": "tala",
        "nombre": "Tala-setos eléctrico",
        "prestadas": 2,
        "estado": "en reparación"
      }
    ]
  },
  "red": {
    "latencia": 800
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparece la lista completa",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Sierra de calar"
      }
    },
    {
      "descripcion": "Al escribir «tal», la lista anterior sigue visible mientras llega la nueva",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Sierra de calar"
          }
        },
        {
          "escribir": {
            "etiqueta": "Buscar herramienta",
            "texto": "tal"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Sierra de calar"
      }
    },
    {
      "descripcion": "Mientras llega la búsqueda nueva, se avisa con «Actualizando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Sierra de calar"
          }
        },
        {
          "escribir": {
            "etiqueta": "Buscar herramienta",
            "texto": "tal"
          }
        }
      ],
      "espera": {
        "texto": "Actualizando…"
      }
    },
    {
      "descripcion": "Cuando llega la búsqueda, la lista es la de «tal»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Sierra de calar"
          }
        },
        {
          "escribir": {
            "etiqueta": "Buscar herramienta",
            "texto": "tal"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Lijadora orbital"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade **cancelación** a `miniConsulta.jsx`: crea un `AbortController` en `pedir`, pásale su `signal` a `funcion`, y aborta cuando la entrada se quede sin componentes que la lean. Pasa la `signal` a `fetch` en `App.jsx` y mira en el registro de peticiones cuántas salen como canceladas.
2. Añade **reintentos**: si `funcion` falla, que `pedir` lo intente de nuevo una vez tras un segundo. Usa «Fallar la siguiente petición» del panel de red para ver que el error no llega a la pantalla.
3. En un proyecto de Vite, instala `@tanstack/react-query` y reescribe el hook `useHerramientas(texto)` con `useQuery`, `placeholderData: keepPreviousData` y un `staleTime` razonable. Si ya tienes una API a mano, como la del recetario del proyecto 78 de JavaScript, usa esa.
4. Añade una mutación con **actualización optimista**: al marcar una herramienta como prestada, `onMutate` cambia la caché con `queryClient.setQueryData` al instante y `onError` la deja como estaba. Compáralo con `useOptimistic` (lección 60).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "You Might Not Need an Effect: Fetching data",
      "descripcion": "La condición de carrera de la búsqueda y la limpieza del efecto, y por qué la propia documentación de React recomienda una librería o un framework para pedir datos.",
      "url": "https://react.dev/learn/you-might-not-need-an-effect#fetching-data",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "TanStack Query: Overview",
      "descripcion": "Qué problemas del estado del servidor resuelve la librería y su ejemplo más simple con useQuery.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/overview",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "TanStack Query: Important Defaults",
      "descripcion": "Lo que hace sin que se lo pidas: datos viejos al llegar, reintentos, refresco al volver a la pestaña y limpieza a los cinco minutos.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "TanStack Query: Query Keys",
      "descripcion": "Cómo se forman las claves, por qué el orden de las propiedades de un objeto no importa y cómo las claves dirigen la invalidación.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/query-keys",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "TanStack Query: Query Cancellation",
      "descripcion": "La signal de cada consulta, qué pasa si no la usas y a qué estado vuelve una consulta cancelada.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "TanStack Query: Placeholder Query Data",
      "descripcion": "placeholderData, keepPreviousData e isPlaceholderData, con la diferencia entre datos de sustitución y datos iniciales.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data",
      "etiqueta": "TanStack"
    }
  ]
}
```
