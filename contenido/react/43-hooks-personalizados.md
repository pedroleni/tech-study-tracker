# Hooks personalizados

- **Módulo:** Efectos
- **Slug:** `hooks-personalizados` (autogenerado del título)
- **Orden:** 430
- **Fuentes:** [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) + [useDebugValue](https://react.dev/reference/react/useDebugValue) — ver `contenido/react/TEMARIO.md` #43

---

## Qué es y para qué sirve

React trae unos cuantos Hooks: `useState`, `useEffect`, `useRef`, `useContext`... Pero a menudo te gustaría tener uno para algo más concreto: saber cuántas plazas libres quedan en un aparcamiento, pedir unos datos al servidor, saber si la pantalla es estrecha. React no los trae, pero **puedes escribirlos tú**: un **Hook personalizado** (o Hook propio) es una función normal cuyo nombre empieza por `use` y que, dentro, llama a otros Hooks.

Ya has usado alguno: el `useHora` de la lección 17, que ponía en hora el reloj con un efecto; `useTareas` y `useTareasDispatch` en la 29, que envolvían un contexto; `usePaginacion` en la 30, que sustituía a una render prop. En esta lección aprendes a escribirlos con criterio: cuándo compensa sacar un Hook, qué comparten (la lógica) y qué no (el estado), qué devuelven y cuándo es mejor no hacerlo.

Encaja al final del módulo de efectos por un motivo: **la mayoría de los efectos de una aplicación acaban dentro de un Hook propio**. Un efecto es una vía de escape hacia algo de fuera de React, y envolverlo en un Hook con un buen nombre deja escrito para qué sirve.

## Dos componentes, la misma lógica

El ayuntamiento tiene un panel con los aparcamientos municipales. Dos componentes necesitan las plazas libres: el rótulo luminoso de la entrada, y el botón de reservar, que se desactiva cuando no queda sitio. Los dos se suscriben a los sensores de las barreras con un efecto, como en la lección 38, y guardan el número en su estado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function Rotulo({ aparcamiento }) {\n  const [libres, setLibres] = useState(null)\n\n  useEffect(() => {\n    return suscribir(aparcamiento, setLibres)\n  }, [aparcamiento])\n\n  if (libres === null) return <p className=\"rotulo\">…</p>\n  return <p className=\"rotulo\">{libres === 0 ? 'Completo' : `Libres: ${libres}`}</p>\n}\n\nfunction BotonReserva({ aparcamiento }) {\n  const [libres, setLibres] = useState(null)\n\n  useEffect(() => {\n    return suscribir(aparcamiento, setLibres)\n  }, [aparcamiento])\n\n  return (\n    <button disabled={!libres}>\n      {libres === 0 ? 'Sin plazas' : 'Reservar plaza'}\n    </button>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "function Rotulo({ aparcamiento }) {",
      "nota": "Un estado para el número y un efecto que se suscribe a los sensores. suscribir devuelve la función que cancela la suscripción, y esa es la limpieza del efecto (lección 38)."
    },
    {
      "fragmento": "function BotonReserva({ aparcamiento }) {",
      "nota": "Las mismas cinco líneas, copiadas. Si mañana cambia la forma de suscribirse, hay que acordarse de cambiarlas en los dos sitios."
    },
    {
      "fragmento": "{libres === 0 ? 'Completo' : `Libres: ${libres}`}",
      "nota": "Lo único que de verdad distingue a los dos componentes es lo que pintan con el número."
    }
  ]
}
```

Funcionan, pero la lógica está duplicada. Se parecen por dentro aunque por fuera sean distintos: uno es un rótulo y el otro un botón. Lo que comparten no es la interfaz (eso sería un componente) sino **una lógica con estado y un efecto**. Para eso están los Hooks personalizados.

## Extraer el Hook: `usePlazasLibres`

Imagina por un momento que React trajera un Hook `usePlazasLibres(aparcamiento)` que te diera el número. Los dos componentes quedarían en una línea cada uno. Como no lo trae, lo escribes: una función llamada `usePlazasLibres`, con el estado y el efecto que estaban repetidos, que devuelve lo que los componentes necesitan.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La lógica, en un Hook; cada componente, en una línea",
  "consigna": "Abre usePlazasLibres.jsx: es lo que estaba repetido. Pulsa «Entra un coche» hasta que el rótulo diga Completo y el botón se desactive. Mira el registro de efectos: cada línea dice qué componente y qué Hook. Después cambia de aparcamiento en el desplegable y vuelve a mirarlo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport usePlazasLibres from './usePlazasLibres'\nimport { entraCoche, saleCoche } from './sensores'\nimport './estilos.css'\n\nfunction Rotulo({ aparcamiento }) {\n  const libres = usePlazasLibres(aparcamiento)\n\n  if (libres === null) return <p className=\"rotulo\">…</p>\n  return <p className=\"rotulo\">{libres === 0 ? 'Completo' : `Libres: ${libres}`}</p>\n}\n\nfunction BotonReserva({ aparcamiento }) {\n  const libres = usePlazasLibres(aparcamiento)\n\n  return (\n    <button disabled={!libres}>\n      {libres === 0 ? 'Sin plazas' : 'Reservar plaza'}\n    </button>\n  )\n}\n\nexport default function Aparcamientos() {\n  const [aparcamiento, setAparcamiento] = useState('Plaza Mayor')\n\n  return (\n    <main>\n      <h1>Aparcamientos municipales</h1>\n      <label>\n        Aparcamiento\n        <select value={aparcamiento} onChange={(e) => setAparcamiento(e.target.value)}>\n          <option>Plaza Mayor</option>\n          <option>Hospital</option>\n          <option>Estación</option>\n        </select>\n      </label>\n      <Rotulo aparcamiento={aparcamiento} />\n      <BotonReserva aparcamiento={aparcamiento} />\n\n      {/* No es parte de la app: hace de barrera física */}\n      <section className=\"simulador\" aria-label=\"Simulador de barreras\">\n        <h2>Simulador de barreras</h2>\n        <button onClick={() => entraCoche(aparcamiento)}>Entra un coche</button>\n        <button onClick={() => saleCoche(aparcamiento)}>Sale un coche</button>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "usePlazasLibres.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { suscribir } from './sensores'\n\n// Un Hook propio: empieza por use y llama a otros Hooks\nexport default function usePlazasLibres(aparcamiento) {\n  const [libres, setLibres] = useState(null)\n\n  useEffect(() => {\n    return suscribir(aparcamiento, setLibres)\n  }, [aparcamiento])\n\n  return libres\n}\n"
    },
    {
      "nombre": "sensores.jsx",
      "codigo": "// Simula los sensores de las barreras de entrada y salida. En una app\n// real, los datos llegarían por un WebSocket. No hace falta que lo cambies.\nconst libres = { 'Plaza Mayor': 2, Hospital: 0, Estación: 41 }\nconst oyentes = new Set()\n\nexport function suscribir(aparcamiento, alCambiar) {\n  const oyente = { aparcamiento, alCambiar }\n  oyentes.add(oyente)\n  alCambiar(libres[aparcamiento])\n  return () => oyentes.delete(oyente)\n}\n\nfunction avisar(aparcamiento) {\n  for (const oyente of oyentes) {\n    if (oyente.aparcamiento === aparcamiento) oyente.alCambiar(libres[aparcamiento])\n  }\n}\n\nexport function entraCoche(aparcamiento) {\n  libres[aparcamiento] = Math.max(0, libres[aparcamiento] - 1)\n  avisar(aparcamiento)\n}\n\nexport function saleCoche(aparcamiento) {\n  libres[aparcamiento] += 1\n  avisar(aparcamiento)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n\n.rotulo {\n  display: inline-block;\n  padding: 0.5rem 0.9rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #facc15;\n  font-family: ui-monospace, monospace;\n  font-size: 1.25rem;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.simulador h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n"
    }
  ],
  "archivoInicial": "usePlazasLibres.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true
}
```

El registro de efectos nombra el Hook en el que vive cada efecto, después del componente:

```text
Rotulo · usePlazasLibres ▶ efecto · montaje
BotonReserva · usePlazasLibres ▶ efecto · montaje
Rotulo · usePlazasLibres ⟲ limpieza
BotonReserva · usePlazasLibres ⟲ limpieza
Rotulo · usePlazasLibres ▶ efecto · repetido por StrictMode
BotonReserva · usePlazasLibres ▶ efecto · repetido por StrictMode
```

El comportamiento es idéntico al de antes de extraer el Hook. Lo que ha cambiado es cómo se lee el código: **los componentes dicen qué quieren** (las plazas libres de este aparcamiento) **y no cómo se consigue** (suscribirse a unos sensores y limpiar la suscripción). Si mañana los datos llegan de otra forma, solo cambia `usePlazasLibres.jsx`.

## El nombre empieza por `use`, y no por capricho

Las convenciones son dos, y ya conoces la primera:

1. **Los componentes empiezan por mayúscula** (`Rotulo`) y devuelven algo que React sepa pintar.
2. **Los Hooks empiezan por `use` seguido de una mayúscula** (`useState`, `usePlazasLibres`) y pueden devolver cualquier cosa: un número, un objeto, una función, nada.

Gracias a eso, al leer un componente sabes dónde puede esconderse estado o un efecto: una llamada a `formatearPrecio()` seguro que no tiene, porque no empieza por `use`; una a `usePlazasLibres()`, seguramente sí. Y el linter lo vigila. Si llamas `obtenerPlazasLibres` a la misma función, protesta en cuanto llama a `useState`:

```text
React Hook "useState" is called in function "obtenerPlazasLibres" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use"
```

Es decir: llamas a `useState` dentro de una función que no es ni un componente ni un Hook personalizado; los componentes empiezan por mayúscula y los Hooks por «use». Solo los componentes y los Hooks pueden llamar a Hooks. **Un Hook personalizado sigue las mismas reglas que los de React**: se llama en el nivel superior de un componente o de otro Hook, nunca dentro de un `if`, un bucle o un manejador. Esas reglas y el porqué son la lección 44.

La convención funciona también al revés: **si una función no llama a ningún Hook, no la llames `use`**. Una función que ordena las vías de un rocódromo por grado es una función normal, `ordenarPorGrado(vias)`, y se puede llamar donde quieras, también dentro de una condición. Si la llamas `useOrdenadasPorGrado`, el linter la trata como un Hook y no te deja llamarla de forma condicional:

```text
React Hook "useOrdenadasPorGrado" is called conditionally. React Hooks must be called in the exact same order in every component render
```

## Cada llamada tiene su propio estado

Al pulsar «Entra un coche», el rótulo y el botón cambian a la vez. Es fácil pensar que comparten una variable `libres`, pero no: **cada llamada a un Hook es completamente independiente de las demás**. `Rotulo` tiene su `useState` y su efecto, y `BotonReserva` los suyos; el registro de efectos lo enseña con sus dos líneas de montaje. Si coinciden es porque los dos se sincronizan con la misma fuente de fuera, los sensores, que avisan a todos sus suscriptores.

El Hook ni siquiera aparece en el árbol de componentes: no es un componente. Su estado pertenece al componente que lo llama, como si las líneas del Hook estuvieran escritas dentro de él.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Un Hook, dos estados",
  "nodos": [
    {
      "nombre": "Aparcamientos",
      "nivel": 0,
      "etiqueta": "estado: aparcamiento"
    },
    {
      "nombre": "Rotulo",
      "nivel": 1,
      "etiqueta": "estado: libres",
      "nota": "← usePlazasLibres(aparcamiento): su propio useState y su propio efecto"
    },
    {
      "nombre": "BotonReserva",
      "nivel": 1,
      "etiqueta": "estado: libres",
      "nota": "← otra llamada: otro useState y otra suscripción"
    }
  ]
}
```

**Los Hooks personalizados comparten lógica con estado, no el estado en sí.** Si lo que necesitas es que dos componentes vean el mismo estado, las herramientas son otras: levantarlo al padre y pasarlo por props (lección 25), un contexto (lección 28) o un almacén externo con `useSyncExternalStore` (lección 46).

## Pasar valores reactivos de un Hook a otro

Cambia de aparcamiento en el desplegable del bloque anterior. El registro escribe primero las dos limpiezas y después los dos efectos:

```text
Rotulo · usePlazasLibres ⟲ limpieza
BotonReserva · usePlazasLibres ⟲ limpieza
Rotulo · usePlazasLibres ▶ efecto · cambió aparcamiento: "Plaza Mayor" → "Estación"
BotonReserva · usePlazasLibres ▶ efecto · cambió aparcamiento: "Plaza Mayor" → "Estación"
```

**El código de un Hook se vuelve a ejecutar en cada render del componente que lo llama**, con los valores de ese render. Por eso recibe siempre la última prop o el último estado, y por eso su efecto reacciona a los cambios igual que si estuviera escrito en el componente: `aparcamiento` es una dependencia del efecto de dentro, y el nombre que sale en el registro es el del parámetro del Hook. También por eso un Hook tiene que ser puro, como un componente (lección 12): nada de efectos secundarios fuera de los efectos.

Fíjate en la cadena: la salida de un Hook, el `aparcamiento` de `useState`, entra como argumento en otro, `usePlazasLibres`. Se parece a encadenar efectos en una mesa de mezclas: la señal de uno alimenta al siguiente, y cualquier cambio arriba llega abajo en el mismo render.

### Manejadores que entran en un Hook

A veces el componente quiere decidir qué pasa en un momento concreto: por ejemplo, avisar a la central cuando el aparcamiento se completa. Lo natural es pasarle al Hook una función, `onCompleto`. Pero esa función se crea nueva en cada render del componente, y si el efecto la tuviera como dependencia, se volvería a suscribir con cada render. Es el caso de las funciones que llegan por props de la lección 42, y se resuelve igual, con un Effect Event dentro del Hook (lección 41):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "export default function usePlazasLibres(aparcamiento, { onCompleto }) {\n  const [libres, setLibres] = useState(null)\n  const alCompletarse = useEffectEvent(() => onCompleto(aparcamiento))\n\n  useEffect(() => {\n    return suscribir(aparcamiento, (nuevas) => {\n      setLibres(nuevas)\n      if (nuevas === 0) alCompletarse()\n    })\n  }, [aparcamiento])\n\n  return libres\n}\n\n// En el componente, la función puede ser nueva en cada render\nconst libres = usePlazasLibres(aparcamiento, {\n  onCompleto: (nombre) => avisarCentral(`${nombre} está completo`),\n})",
  "anotaciones": [
    {
      "fragmento": "{ onCompleto }",
      "nota": "Las opciones van en un objeto con nombre: al leer la llamada se entiende qué es cada cosa, y se pueden añadir más sin cambiar el orden de los argumentos."
    },
    {
      "fragmento": "const alCompletarse = useEffectEvent(() => onCompleto(aparcamiento))",
      "nota": "El Effect Event lee siempre el onCompleto del último render sin ser una dependencia. Lo que pase dentro de onCompleto no es reactivo: no tiene por qué volver a suscribir nada."
    },
    {
      "fragmento": "}, [aparcamiento])",
      "nota": "La única dependencia sigue siendo el aparcamiento. Comprobado con React 19.3: el componente se renderiza con cada aviso, el efecto no se repite, y onCompleto lee el estado más reciente."
    },
    {
      "fragmento": "onCompleto: (nombre) => avisarCentral(`${nombre} está completo`)",
      "nota": "Quien usa el Hook no tiene que saber nada de esto: puede escribir la función en línea sin miedo a reconexiones."
    }
  ]
}
```

## Devuelve lo mínimo

Lo que devuelve un Hook es lo que los componentes pueden usar, y todo lo que devuelvas es algo que luego costará cambiar. `usePlazasLibres` devuelve un número y nada más: no devuelve `setLibres` (las plazas las deciden los sensores, no los componentes) ni la suscripción (eso es asunto del Hook). Para elegir la forma, hay tres habituales:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué puede devolver un Hook",
  "roles": [
    {
      "etiqueta": "Un valor",
      "rol": "const libres = usePlazasLibres(a)",
      "descripcion": "Cuando el componente solo necesita leer una cosa. Es lo más sencillo de usar y de cambiar por dentro."
    },
    {
      "etiqueta": "Un par",
      "rol": "const [abierto, alternar] = useAlternar()",
      "descripcion": "Como useState: un valor y la acción que lo cambia. Quien llama elige los nombres al desestructurar, útil si se usa varias veces en un mismo componente."
    },
    {
      "etiqueta": "Un objeto",
      "rol": "const { datos, error } = useDatos(url)",
      "descripcion": "Cuando hay tres o más cosas, o varias del mismo tipo que se confundirían por posición. Cada una se lee por su nombre."
    }
  ]
}
```

Dos cosas más que conviene saber. Si el Hook devuelve un objeto o una función nuevos en cada render, y quien lo llama los pone en las dependencias de su propio efecto, ese efecto se repetirá en cada render: es el problema de los objetos de la lección 42, solo que ahora nace dentro del Hook. Devolver valores primitivos lo evita. Y si un Hook devuelve muchas cosas que nadie usa, probablemente hace demasiado: mejor dos Hooks pequeños con nombres claros.

## Un Hook que pide datos: `useDatos(url)`

El caso más común de todos. En la lección 38 aprendiste a pedir datos en un efecto con su limpieza, y en la 42 dividiste los puertos y los amarres en dos efectos casi iguales. Con un Hook, esa lógica se escribe una sola vez y cada petición es una línea:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos peticiones, dos líneas",
  "consigna": "Pulsa «Norte» y mira el registro de efectos: de las dos llamadas a useDatos, solo se repite la que depende de la zona. Después sube la latencia a 2 s en el panel de red y pulsa «Sur» y «Centro» seguidos: la petición de Sur sale como cancelada, porque la limpieza del Hook la aborta.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport useDatos from './useDatos'\nimport './estilos.css'\n\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport default function Buscador() {\n  const [zona, setZona] = useState('Centro')\n  const zonas = useDatos('/api/zonas')\n  const aparcamientos = useDatos(`/api/aparcamientos?q=${zona}`)\n\n  return (\n    <main>\n      <h1>Aparcamientos por zona</h1>\n      <p>\n        {zonas?.map((z) => (\n          <button key={z.id} aria-pressed={z.nombre === zona} onClick={() => setZona(z.nombre)}>\n            {z.nombre}\n          </button>\n        ))}\n      </p>\n      {aparcamientos === null ? (\n        <p>Cargando…</p>\n      ) : (\n        <ul>\n          {aparcamientos.map((a) => (\n            <li key={a.id}>\n              {a.nombre} · {a.plazas} plazas · {euros.format(a.precioHora)} la hora\n            </li>\n          ))}\n        </ul>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "useDatos.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function useDatos(url) {\n  const [datos, setDatos] = useState(null)\n\n  useEffect(() => {\n    if (!url) return\n    const control = new AbortController()\n    fetch(url, { signal: control.signal })\n      .then((respuesta) => respuesta.json())\n      .then(setDatos)\n      .catch((error) => {\n        if (error.name !== 'AbortError') console.error(error)\n      })\n    return () => control.abort()\n  }, [url])\n\n  return datos\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "useDatos.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "zonas": [
      {
        "id": 1,
        "nombre": "Centro"
      },
      {
        "id": 2,
        "nombre": "Norte"
      },
      {
        "id": 3,
        "nombre": "Sur"
      }
    ],
    "aparcamientos": [
      {
        "id": "plaza-mayor",
        "nombre": "Plaza Mayor",
        "zona": "Centro",
        "plazas": 320,
        "precioHora": 2.1
      },
      {
        "id": "mercado",
        "nombre": "Mercado de Abastos",
        "zona": "Centro",
        "plazas": 180,
        "precioHora": 1.9
      },
      {
        "id": "hospital",
        "nombre": "Hospital",
        "zona": "Norte",
        "plazas": 650,
        "precioHora": 1.2
      },
      {
        "id": "campus",
        "nombre": "Campus",
        "zona": "Norte",
        "plazas": 400,
        "precioHora": 0.8
      },
      {
        "id": "estacion",
        "nombre": "Estación",
        "zona": "Sur",
        "plazas": 500,
        "precioHora": 1.5
      }
    ]
  }
}
```

El registro distingue cada llamada por el componente y el Hook, y te dice cuál se ha repetido y por qué:

```text
Buscador · useDatos ⟲ limpieza
Buscador · useDatos ▶ efecto · cambió url: "/api/aparcamientos?q=Centro" → "/api/aparcamientos?q=Norte"
```

Fíjate en lo que ha ganado el componente:

- **El flujo de datos se ve a simple vista**: entra una `url`, salen unos `datos`. Si cambia la `url` (porque cambia la zona), se piden otros.
- **La limpieza va incluida**. Cada componente que use `useDatos` cancela sus peticiones viejas sin pensar en ello, y la carrera de respuestas desordenadas de la lección 38 no puede pasar.
- **Nadie puede añadir dependencias de más** al efecto, porque el efecto ya no está en el componente. Las recetas de la lección 42 se aplican una vez, dentro del Hook.
- **`null` significa «todavía no»**: con `url` a `null`, el Hook no pide nada. Sirve para datos que dependen de algo que aún no se sabe, como una ficha antes de elegirla. Lo usarás en el ejercicio.

Este `useDatos` tiene un descuido sutil: al cambiar de `url`, mientras llega la respuesta nueva, sigue devolviendo los datos de la `url` anterior (con latencia alta se ve un momento la zona vieja bajo el botón nuevo). En la lección 84 lo descubrirás con un test y lo arreglarás guardando la `url` junto a los datos.

Esta versión tiene un límite: mientras llega la respuesta nueva, sigue devolviendo los datos anteriores. Con la latencia a 2 s lo verás: al pulsar «Norte», los aparcamientos del centro siguen en pantalla un par de segundos. A veces es justo lo que quieres, y otras no; uno de los retos del final lo cambia.

Y una idea para más adelante: como los componentes solo ven `useDatos(url)`, puedes cambiar cómo se piden los datos sin tocarlos. En el módulo 7 verás otras formas de pedirlos (la lección 52 las compara), y en la 78, TanStack Query, cuyo `useQuery` es, precisamente, un Hook personalizado muy completo.

## Cuándo no hacer un Hook

No hace falta un Hook para cada trozo de código repetido. Un poco de duplicación está bien, y un Hook que solo envuelve un `useState` (un `useCampo` que guarda el texto de un input) probablemente no aporta nada. Lo que sí merece un Hook es **un efecto con un propósito concreto**: cada vez que escribas uno, pregúntate si quedaría más claro con un nombre.

Y lo que conviene evitar del todo son los **Hooks «de ciclo de vida»**, que envuelven `useEffect` en vez de resolver un problema: `useMount(fn)`, `useEffectOnce(fn)`, `useUpdateEffect(fn)`. Parecen cómodos. Este rótulo usa uno:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un useMount que no se entera de nada",
  "consigna": "Elige «Estación» en el desplegable. El rótulo cambia de nombre, pero no de plazas: la Estación tiene 41 libres. Mira el registro de efectos: «Rotulo · useMount ▶ efecto · montaje» y nada más. Arréglalo sin useMount: un useEffect con sus dependencias en Rotulo, o mejor, un Hook con propósito como usePlazasLibres.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { suscribir } from './sensores'\nimport './estilos.css'\n\n// Un Hook «de ciclo de vida»: parece cómodo, pero esconde un fallo\nfunction useMount(alMontar) {\n  useEffect(() => {\n    return alMontar()\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [])\n}\n\nfunction Rotulo({ aparcamiento }) {\n  const [libres, setLibres] = useState(null)\n\n  useMount(() => suscribir(aparcamiento, setLibres))\n\n  return (\n    <p className=\"rotulo\">\n      {aparcamiento} · {libres === 0 ? 'Completo' : `Libres: ${libres}`}\n    </p>\n  )\n}\n\nexport default function Aparcamientos() {\n  const [aparcamiento, setAparcamiento] = useState('Plaza Mayor')\n\n  return (\n    <main>\n      <h1>Rótulo de la entrada</h1>\n      <label>\n        Aparcamiento\n        <select value={aparcamiento} onChange={(e) => setAparcamiento(e.target.value)}>\n          <option>Plaza Mayor</option>\n          <option>Hospital</option>\n          <option>Estación</option>\n        </select>\n      </label>\n      <Rotulo aparcamiento={aparcamiento} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "sensores.jsx",
      "codigo": "// Simula los sensores de las barreras de entrada y salida. En una app\n// real, los datos llegarían por un WebSocket. No hace falta que lo cambies.\nconst libres = { 'Plaza Mayor': 2, Hospital: 0, Estación: 41 }\nconst oyentes = new Set()\n\nexport function suscribir(aparcamiento, alCambiar) {\n  const oyente = { aparcamiento, alCambiar }\n  oyentes.add(oyente)\n  alCambiar(libres[aparcamiento])\n  return () => oyentes.delete(oyente)\n}\n\nfunction avisar(aparcamiento) {\n  for (const oyente of oyentes) {\n    if (oyente.aparcamiento === aparcamiento) oyente.alCambiar(libres[aparcamiento])\n  }\n}\n\nexport function entraCoche(aparcamiento) {\n  libres[aparcamiento] = Math.max(0, libres[aparcamiento] - 1)\n  avisar(aparcamiento)\n}\n\nexport function saleCoche(aparcamiento) {\n  libres[aparcamiento] += 1\n  avisar(aparcamiento)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n\n.rotulo {\n  display: inline-block;\n  padding: 0.5rem 0.9rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #facc15;\n  font-family: ui-monospace, monospace;\n  font-size: 1.25rem;\n}\n\n.simulador {\n  margin-top: 1rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.simulador h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true
}
```

El rótulo dice «Estación · Libres: 2», con las plazas de la Plaza Mayor. El efecto no reacciona a `aparcamiento`, y lo peor es que **nadie te avisa**. El linter solo analiza las llamadas directas a `useEffect`: dentro de `useMount` sí protesta, pero por `alMontar`, no por `aparcamiento`:

```text
React Hook useEffect has a missing dependency: 'alMontar'. Either include it or remove the dependency array. If 'alMontar' changes too often, find the parent component that defines it and wrap that definition in useCallback
```

Quien escribió `useMount` silenció ese aviso una vez, y desde entonces ningún componente que lo use recibe avisos sobre lo que lee. Un Hook de ciclo de vida esconde justo lo que el linter vigila. Empieza siempre con `useEffect` directamente, y si después sacas un Hook, que sea para un caso de uso concreto: `usePlazasLibres(aparcamiento)`, `useDatos(url)`, `useMediaQuery(consulta)`.

Una prueba rápida: **si no se te ocurre un nombre claro para el Hook, probablemente aún no está listo para salir**. Un buen nombre dice qué recibe y qué devuelve, y alguien que no programa podría adivinarlo. Un Hook bien elegido hace el código más declarativo porque limita lo que puede hacer: `useDatos` solo pide datos; `useMount` puede hacer cualquier cosa, y por eso no dice nada. Y a veces la respuesta ni siquiera es un Hook: una animación de entrada se hace mejor con una animación de CSS que con un efecto.

## `useDebugValue`: una etiqueta para las React DevTools

Cuando inspeccionas un componente con las React DevTools, la extensión del navegador que verás en la lección 65, la lista de sus Hooks enseña lo que guarda cada uno. Para un Hook propio eso puede ser poco legible: un número, un objeto anidado. `useDebugValue` le pone una etiqueta. Se llama en el nivel superior del Hook, con el valor que quieres ver:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useDebugValue, useEffect, useState } from 'react'\nimport { suscribir } from './sensores'\n\nexport default function usePlazasLibres(aparcamiento) {\n  const [libres, setLibres] = useState(null)\n\n  useEffect(() => {\n    return suscribir(aparcamiento, setLibres)\n  }, [aparcamiento])\n\n  useDebugValue(libres === 0 ? 'Completo' : `${libres} libres`)\n\n  return libres\n}\n\n// Con una función de formato, solo se calcula al inspeccionar\nfunction useUltimaLectura(sensor) {\n  const fecha = useFechaDeLectura(sensor)\n  useDebugValue(fecha, (f) => f.toLocaleTimeString('es-ES'))\n  return fecha\n}",
  "anotaciones": [
    {
      "fragmento": "import { useDebugValue, useEffect, useState } from 'react'",
      "nota": "Se importa de react como cualquier otro Hook. No devuelve nada."
    },
    {
      "fragmento": "useDebugValue(libres === 0 ? 'Completo' : `${libres} libres`)",
      "nota": "Al inspeccionar Rotulo, las DevTools ponen esta etiqueta junto al Hook. Según react.dev, sin ella solo verías el dato de debajo, aquí el número del useState."
    },
    {
      "fragmento": "useDebugValue(fecha, (f) => f.toLocaleTimeString('es-ES'))",
      "nota": "El segundo argumento es opcional: una función de formato que las DevTools solo llaman cuando inspeccionas el componente. Así no se formatea la fecha en cada render."
    },
    {
      "fragmento": "const fecha = useFechaDeLectura(sensor)",
      "nota": "Un Hook inventado para el ejemplo: lo que importa es que un Hook puede llamar a otros Hooks propios, y cada uno puede llevar su etiqueta."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Aquí no lo vas a ver",
  "contenido": "useDebugValue no cambia nada en la aplicación: solo lo leen las React DevTools. El árbol de renders de esta web enseña el estado de cada componente, pero no estas etiquetas. Y no lo pongas en todos tus Hooks: react.dev lo recomienda para los de librerías compartidas, cuyos datos internos son difíciles de leer."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Pedir datos",
      "texto": "useDatos(url), useAparcamiento(id), useBusqueda(texto). La petición, la cancelación y los errores, escritos una sola vez."
    },
    {
      "titulo": "Suscribirse a algo del navegador",
      "texto": "useMediaQuery(consulta) para el ancho de pantalla, useEnLinea() para la conexión, useVisible(ref) con IntersectionObserver. Un efecto con su limpieza, con un nombre que dice para qué es."
    },
    {
      "titulo": "Conectarse a un sistema externo",
      "texto": "Un WebSocket, un mapa, el SDK de un proveedor: useConexion(sala), useCarta(zona). Quien lo usa no tiene que saber cómo se abre ni cómo se cierra."
    },
    {
      "titulo": "Envolver un contexto",
      "texto": "Como useTareas en la lección 29: un Hook que llama a useContext y lanza un error claro si falta el proveedor."
    },
    {
      "titulo": "Leer los Hooks de las librerías",
      "texto": "useQuery de TanStack Query (lección 78), useParams y useNavigate de React Router (lección 77): son Hooks personalizados como los tuyos, con las mismas reglas."
    }
  ]
}
```

## Errores típicos

**Creer que los componentes comparten el estado del Hook.** Es el error de concepto más extendido. La taquilla del aparcamiento y el marcador de la entrada usan el mismo Hook:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function useReservas() {\n  const [reservas, setReservas] = useState(0)\n\n  function reservar() {\n    setReservas((r) => r + 1)\n  }\n\n  return { reservas, reservar }\n}\n\nfunction Taquilla() {\n  const { reservas, reservar } = useReservas()\n  return <button onClick={reservar}>Reservar plaza ({reservas})</button>\n}\n\nfunction Marcador() {\n  const { reservas } = useReservas()\n  return <p>Reservas de hoy: {reservas}</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Taquilla />\n      <Marcador />\n    </main>\n  )\n}\n\n// Pulsas el botón tres veces. ¿Qué dice el párrafo?",
  "opciones": [
    "Reservas de hoy: 3",
    "Reservas de hoy: 0",
    "Reservas de hoy: 1",
    "Un error: dos componentes no pueden usar el mismo Hook"
  ],
  "correcta": 1,
  "explicacion": "Cada llamada a useReservas crea su propio useState. El botón dice Reservar plaza (3), pero el marcador sigue en 0: su estado nunca ha cambiado. Comprobado con React 19.3. Para que los dos vean el mismo número, el estado tiene que vivir en App y bajar por props, o en un contexto."
}
```

**Llamar `getAlgo` u `obtenerAlgo` a una función que usa Hooks.** El linter la rechaza, como viste más arriba, y con razón: sin el `use`, nadie sabe que hay que llamarla en el nivel superior.

**Llamar `useAlgo` a una función que no usa Hooks.** Al revés: le impones reglas que no necesita, como no poder llamarla dentro de un `if`. Si no hay Hooks dentro, es una función normal.

**Llamar al Hook donde no toca.** Dentro de un manejador (`onClick={() => useDatos(url)}`), en un `if` o en un bucle. Es la misma regla que para `useState`: React lanza «Invalid hook call» o «Rendered more hooks than during the previous render», que ya conoces de las lecciones 12 y 64. Las reglas completas, en la lección 44.

**Esconder un efecto en un Hook de ciclo de vida.** `useMount`, `useEffectOnce`, `useUpdateEffect`: el linter deja de vigilar las dependencias de quien los usa, como acabas de ver.

**Devolver objetos o funciones nuevos y usarlos como dependencias.** El efecto de quien llama al Hook se repetirá en cada render, o entrará en bucle si además cambia un estado (lección 42).

**Olvidar la limpieza dentro del Hook.** Un fallo en un Hook se multiplica por cada componente que lo usa: un `useDatos` sin `abort()` trae la carrera de respuestas a toda la aplicación.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un Hook personalizado es como un componente sin JSX",
      "realidad": "No aparece en el árbol ni tiene estado propio: su estado y sus efectos son del componente que lo llama, como si sus líneas estuvieran escritas dentro de él."
    },
    {
      "mito": "Si dos componentes usan el mismo Hook, comparten los datos",
      "realidad": "Comparten la lógica. Cada llamada tiene su useState y sus efectos. Si coinciden es porque se sincronizan con la misma fuente externa."
    },
    {
      "mito": "Toda función que se llama al renderizar debería empezar por use",
      "realidad": "Solo las que llaman a algún Hook. Una función de formato o de cálculo es una función normal, y así se puede llamar en cualquier sitio."
    },
    {
      "mito": "Hay que sacar a un Hook toda la lógica repetida",
      "realidad": "Algo de duplicación está bien. Compensa cuando hay un efecto con un propósito claro o una lógica con estado que se usa en varios sitios, y se le puede dar un nombre concreto."
    },
    {
      "mito": "useDebugValue sirve para depurar desde la consola",
      "realidad": "Solo pone una etiqueta que leen las React DevTools al inspeccionar un componente. No escribe nada en la consola ni cambia el comportamiento."
    }
  ]
}
```

## Ejercicios

El rocódromo El Bloque enseña sus vías abiertas. La lista ya funciona, con un efecto escrito dentro de `ListaVias`. Falta la ficha: al pulsar una vía, `FichaVia` tiene que pedir `/api/vias/{id}` y enseñar su grado, sector y longitud, o un aviso si la petición falla. La ficha necesita la misma lógica que la lista, así que es el momento de sacarla a un Hook.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha de cada vía, con useDatos",
  "consigna": "Escribe useDatos en useDatos.jsx: devuelve { datos, error }, no pide nada si url es null y cancela en la limpieza. Úsalo en FichaVia con la url de la vía elegida, y después cambia ListaVias para que use el mismo Hook. Prueba a pulsar varias vías, y a pulsar «Fallar la siguiente petición» en el panel de red antes de elegir otra.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport useDatos from './useDatos'\nimport './estilos.css'\n\nfunction ListaVias({ onElegir }) {\n  // Esta es la lógica que tienes que llevarte a useDatos.jsx\n  const [vias, setVias] = useState(null)\n\n  useEffect(() => {\n    const control = new AbortController()\n    fetch('/api/vias', { signal: control.signal })\n      .then((respuesta) => respuesta.json())\n      .then(setVias)\n      .catch(() => {})\n    return () => control.abort()\n  }, [])\n\n  if (!vias) return <p>Cargando vías…</p>\n  return (\n    <ul className=\"vias\">\n      {vias.map((via) => (\n        <li key={via.id}>\n          <button onClick={() => onElegir(via.id)}>{via.nombre}</button>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nfunction FichaVia({ id }) {\n  // Pide /api/vias/{id} con useDatos, y nada si id es null\n  const { datos: via, error } = useDatos(null)\n\n  if (id === null) return <p>Elige una vía para ver su ficha.</p>\n  if (error) return <p role=\"alert\">No se pudo cargar la ficha de la vía.</p>\n  if (!via) return <p>Cargando ficha…</p>\n  return (\n    <article className=\"ficha\">\n      <h2>{via.nombre}</h2>\n      <p>Grado: {via.grado}</p>\n      <p>Sector: {via.sector}</p>\n      <p>Longitud: {via.metros} m</p>\n    </article>\n  )\n}\n\nexport default function Rocodromo() {\n  const [elegida, setElegida] = useState(null)\n\n  return (\n    <main>\n      <h1>Rocódromo El Bloque · Vías abiertas</h1>\n      <ListaVias onElegir={setElegida} />\n      <FichaVia id={elegida} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "useDatos.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\n// Escribe aquí el Hook. Tiene que devolver { datos, error }:\n// - datos: lo que responde el servidor, o null mientras no llega\n// - error: un Error si la petición falla, o null\n// Si url es null, no pide nada. Cancela las peticiones viejas\n// en la limpieza, con AbortController, como en la lección.\nexport default function useDatos(url) {\n  return { datos: null, error: null }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n\n.vias {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  padding: 0;\n  list-style: none;\n}\n\n.ficha {\n  padding: 0.75rem 1rem;\n  border-left: 6px solid #ea580c;\n  border-radius: 6px;\n  background: #fff7ed;\n}\n\n.ficha h2 {\n  margin-top: 0;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "useDatos.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "vias": [
      {
        "id": 1,
        "nombre": "La Grieta",
        "grado": "5+",
        "sector": "Placa",
        "metros": 12
      },
      {
        "id": 2,
        "nombre": "Desplome Rojo",
        "grado": "6b",
        "sector": "Desplome",
        "metros": 14
      },
      {
        "id": 3,
        "nombre": "El Diedro",
        "grado": "6a",
        "sector": "Diedro",
        "metros": 15
      },
      {
        "id": 4,
        "nombre": "Techo Negro",
        "grado": "7a",
        "sector": "Techo",
        "metros": 10
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "La lista enseña las vías del rocódromo",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Desplome Rojo"
      }
    },
    {
      "descripcion": "Al pulsar una vía, aparece su ficha con el grado",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Desplome Rojo"
          }
        }
      ],
      "espera": {
        "texto": "Grado: 6b"
      }
    },
    {
      "descripcion": "Al pulsar otra vía, la ficha cambia a la nueva",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Desplome Rojo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "El Diedro"
          }
        }
      ],
      "espera": {
        "texto": "Sector: Diedro"
      }
    },
    {
      "descripcion": "Si falla la petición de una ficha, se avisa con un error",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Desplome Rojo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "El Diedro"
          }
        }
      ],
      "espera": {
        "rol": "alert"
      }
    },
    {
      "descripcion": "Después de un fallo, otra vía se carga bien",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Desplome Rojo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "El Diedro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Techo Negro"
          }
        }
      ],
      "espera": {
        "texto": "Grado: 7a"
      }
    }
  ]
}
```

Dos pistas. Para el error, comprueba `respuesta.ok`: un 500 no hace fallar a `fetch`, así que tendrás que lanzar tú el error para que llegue al `catch`. Y cuando una petición salga bien, vuelve a poner el error a `null`, o la ficha se quedará en el aviso para siempre. Cuando funcione, mira el registro de efectos: «FichaVia · useDatos ▶ efecto · cambió url: null → "/api/vias/2"».

**Retos para seguir practicando** (sin comprobación automática):

1. Añade `useDebugValue` a `useDatos` para que enseñe la url y si está cargando, con error o con datos. Lo verás cuando instales las React DevTools (lección 65).
2. Ahora, al pasar de una vía a otra, la ficha vieja se ve mientras llega la nueva. Haz que `useDatos` devuelva también `cargando` y que la ficha diga «Cargando ficha…» en ese momento. Pista: guarda en el estado la url a la que pertenecen los datos y compárala con la actual al renderizar, sin poner ningún `set` suelto en el efecto.
3. Escribe `useMediaQuery(consulta)` con `window.matchMedia` y su evento `change`, con la limpieza que toca, y úsalo para enseñar las vías en dos columnas en pantallas anchas.
4. Recupera el taxímetro de la lección 42 y saca `useIntervalo(alPasar, milisegundos)`, con un Effect Event dentro para que quien lo llame pueda pasar una función nueva en cada render sin reiniciar el intervalo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Reusing Logic with Custom Hooks",
      "descripcion": "La guía de react.dev sobre Hooks personalizados: extraerlos, nombrarlos, pasarles valores y manejadores, y cuándo no hacerlos. Con cinco retos resueltos.",
      "url": "https://react.dev/learn/reusing-logic-with-custom-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useDebugValue",
      "descripcion": "La referencia de useDebugValue, con la función de formato diferida y una captura de cómo se ve en las React DevTools.",
      "url": "https://react.dev/reference/react/useDebugValue",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Rules of Hooks",
      "descripcion": "Las reglas que siguen todos los Hooks, también los tuyos: solo en el nivel superior y solo desde componentes u otros Hooks. Es la lección 44.",
      "url": "https://react.dev/reference/rules/rules-of-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Developer Tools",
      "descripcion": "Cómo instalar las React DevTools para inspeccionar componentes, sus Hooks y las etiquetas de useDebugValue. Es la lección 65.",
      "url": "https://react.dev/learn/react-developer-tools",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useSyncExternalStore",
      "descripcion": "El Hook de React pensado para suscribirse a algo de fuera, como los sensores de esta lección. Es la lección 46.",
      "url": "https://react.dev/reference/react/useSyncExternalStore",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "AbortController",
      "descripcion": "La API del navegador con la que useDatos cancela las peticiones que ya no hacen falta.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
      "etiqueta": "MDN"
    }
  ]
}
```
