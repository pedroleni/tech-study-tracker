# Pedir datos en React: un efecto, `use` con Suspense o una librería

- **Módulo:** Asincronía y concurrencia
- **Slug:** `pedir-datos-en-react-un-efecto-use-con-suspense-o-una-libreria` (autogenerado del título)
- **Orden:** 520
- **Fuentes:** [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) + [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) + [use](https://react.dev/reference/react/use) + [TanStack Query: Overview](https://tanstack.com/query/latest/docs/framework/react/overview) — ver `contenido/react/TEMARIO.md` #52

---

## Qué es y para qué sirve

«¿Cómo pido datos al servidor?» es la primera pregunta de casi todo el que empieza con React, y la documentación no da una sola respuesta. Da tres, según dónde estés:

- **Un efecto** (lección 38): el componente se monta, el efecto hace `fetch` y guarda la respuesta en el estado. Solo necesita React, y es lo que hay debajo de casi todo lo demás.
- **`use` con Suspense** (lecciones 48 y 49): el componente lee una promesa con `use`; mientras no se cumple, `<Suspense>` enseña un aviso de carga, y si se rechaza, el error sube a un error boundary (lección 53).
- **Una librería o un framework**: TanStack Query, SWR o los *loaders* de un framework piden los datos, los guardan en caché y reintentan por ti.

Esta lección construye **la misma pantalla de las tres formas**, con la API simulada y su panel de red, para que veas qué resuelve cada una y qué te deja a ti. Porque **pedir datos parece una línea (`fetch`) y son cinco problemas**: qué enseñar mientras llegan, qué hacer si fallan, qué pasa si llegan desordenados, cuántas peticiones haces de más y cuánto esperas sin necesidad.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de pedir los mismos datos",
  "roles": [
    {
      "etiqueta": "Efecto + estado",
      "rol": "Lo escribes todo tú",
      "descripcion": "Pides en un efecto y guardas la respuesta en el estado. La carga, el error, la cancelación y cualquier caché son código tuyo."
    },
    {
      "etiqueta": "use + Suspense",
      "rol": "Lees una promesa",
      "descripcion": "El componente lee una promesa ya creada; Suspense se encarga de la espera y un error boundary, de los fallos. Alguien tiene que guardar esas promesas en una caché."
    },
    {
      "etiqueta": "Librería",
      "rol": "Alguien lo escribió por ti",
      "descripcion": "TanStack Query o un framework: caché, reintentos, cancelación y peticiones repetidas, resueltos. Tú dices qué pedir y con qué clave."
    }
  ]
}
```

## La pantalla: la guía de setas de Hojarasca

La asociación micológica Hojarasca tiene una guía en su web: eliges una seta comestible y te enseña su ficha, **la seta tóxica con la que se confunde** y dónde la han encontrado los socios este otoño. El servidor (simulado) tiene dos colecciones:

- `/api/setas/<id>`: la ficha de una seta. Las comestibles traen un campo `confusion` con el id de la tóxica que se les parece: `/api/setas/boleto` trae `confusion: "boleto-de-satanas"`.
- `/api/avistamientos?q=<id>`: los avistamientos de esa seta, con el lugar y la fecha.

Para pintar la ficha completa hacen falta **dos peticiones encadenadas**: no sabes qué seta tóxica pedir hasta que llega la ficha de la comestible. Los avistamientos, en cambio, solo necesitan el id de la seta, que tienes desde el clic. Esa diferencia va a importar.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Una guía de ejemplo",
  "contenido": "Los rasgos de cada seta son reales, pero están resumidos para el ejemplo. Ninguna guía en una web sustituye a una persona experta: ante la duda, la seta no va a la cazuela."
}
```

## Forma 1: un efecto, y una cadena de dos pasos

En la lección 38 pediste la ficha de una pista de esquí con un efecto, su `AbortController` y una respuesta que recuerda de qué pista es, para deducir el «Cargando…» sin un estado aparte. Aquí se hace igual, pero la ficha necesita **dos `await` seguidos**, y eso abre una grieta nueva: **la limpieza solo puede cancelar lo que conoce**. Este primer intento tiene un fallo escondido en el paso 2:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ficha en dos pasos, con una carrera escondida",
  "consigna": "Sube la latencia al máximo (3 s) y activa «Responder desordenado». Pulsa «Boleto» y, en cuanto el panel de red diga que GET /api/setas/boleto ha llegado con un 200, pulsa «Rebozuelo». La ficha del rebozuelo aparece y, al poco, vuelve «Cargando la ficha…» y ya no sale de ahí. Arréglalo en FichaSeta.jsx pasando la misma señal también al segundo pedirJson, y repite la prueba.",
  "archivos": [
    {
      "nombre": "FichaSeta.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { pedirJson } from './api'\n\nexport default function FichaSeta({ setaId }) {\n  // { setaId, seta, parecida } si llega bien; { setaId, error } si falla\n  const [respuesta, setRespuesta] = useState(null)\n\n  useEffect(() => {\n    const controlador = new AbortController()\n\n    async function cargar() {\n      // Paso 1: la ficha de la seta elegida\n      const seta = await pedirJson(`/api/setas/${setaId}`, {\n        signal: controlador.signal,\n      })\n      // Paso 2: la seta tóxica con la que se confunde\n      const parecida = await pedirJson(`/api/setas/${seta.confusion}`)\n      setRespuesta({ setaId, seta, parecida })\n    }\n\n    cargar().catch((error) => {\n      if (error.name === 'AbortError') return // la cancelamos nosotros\n      setRespuesta({ setaId, error: error.message })\n    })\n\n    return () => controlador.abort()\n  }, [setaId])\n\n  if (respuesta?.setaId !== setaId) return <p>Cargando la ficha…</p>\n  if (respuesta.error) {\n    return <p role=\"alert\">No se pudo cargar la ficha: {respuesta.error}</p>\n  }\n\n  const { seta, parecida } = respuesta\n  return (\n    <article className=\"ficha\">\n      <h2>{seta.nombre}</h2>\n      <p className=\"cientifico\">{seta.cientifico}</p>\n      <p>Temporada: {seta.temporada}. {seta.rasgo}</p>\n      <p className=\"peligro\">Se confunde con: {parecida.nombre}</p>\n      <p>{parecida.rasgo}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaSeta from './FichaSeta'\nimport './estilos.css'\n\nconst SETAS = [\n  { id: 'niscalo', nombre: 'Níscalo' },\n  { id: 'rebozuelo', nombre: 'Rebozuelo' },\n  { id: 'boleto', nombre: 'Boleto' },\n]\n\nexport default function App() {\n  const [setaId, setSetaId] = useState('niscalo')\n\n  return (\n    <main>\n      <h1>Guía de setas · Hojarasca</h1>\n      <div>\n        {SETAS.map((seta) => (\n          <button\n            key={seta.id}\n            aria-pressed={seta.id === setaId}\n            onClick={() => setSetaId(seta.id)}\n          >\n            {seta.nombre}\n          </button>\n        ))}\n      </div>\n      <FichaSeta setaId={setaId} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide una URL y devuelve el JSON. fetch no rechaza con un 404 o un 500:\n// esas respuestas se convierten en error a mano.\nexport async function pedirJson(url, opciones) {\n  const respuesta = await fetch(url, opciones)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #3f2a14;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #d6c7a8;\n  border-radius: 8px;\n  background: #fbf8f1;\n}\n\n.cientifico {\n  font-style: italic;\n  color: #57534e;\n}\n\n.peligro {\n  color: #9a3412;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "FichaSeta.jsx",
  "mostrarConsola": false,
  "api": {
    "setas": [
      {
        "id": "niscalo",
        "nombre": "Níscalo",
        "cientifico": "Lactarius deliciosus",
        "temporada": "otoño",
        "rasgo": "Al cortarlo suelta una leche naranja que con el tiempo verdea.",
        "confusion": "falso-niscalo"
      },
      {
        "id": "rebozuelo",
        "nombre": "Rebozuelo",
        "cientifico": "Cantharellus cibarius",
        "temporada": "de verano a otoño",
        "rasgo": "Debajo del sombrero tiene pliegues gruesos que bajan por el pie, no láminas finas.",
        "confusion": "seta-del-olivo"
      },
      {
        "id": "boleto",
        "nombre": "Boleto",
        "cientifico": "Boletus edulis",
        "temporada": "de finales de verano a otoño",
        "rasgo": "Poros blancos o amarillentos y un pie con una redecilla blanca.",
        "confusion": "boleto-de-satanas"
      },
      {
        "id": "falso-niscalo",
        "nombre": "Falso níscalo",
        "cientifico": "Lactarius torminosus",
        "temporada": "otoño",
        "rasgo": "Leche blanca y un sombrero con pelillos en el borde.",
        "confusion": null
      },
      {
        "id": "seta-del-olivo",
        "nombre": "Seta del olivo",
        "cientifico": "Omphalotus olearius",
        "temporada": "otoño",
        "rasgo": "Láminas finas de verdad y crece en matas sobre tocones y raíces.",
        "confusion": null
      },
      {
        "id": "boleto-de-satanas",
        "nombre": "Boleto de Satanás",
        "cientifico": "Rubroboletus satanas",
        "temporada": "de verano a otoño",
        "rasgo": "Poros rojos y un pie rojizo y abultado.",
        "confusion": null
      }
    ],
    "avistamientos": [
      {
        "id": 1,
        "seta": "niscalo",
        "lugar": "Pinar de la Umbría",
        "fecha": "12 de octubre"
      },
      {
        "id": 2,
        "seta": "niscalo",
        "lugar": "Cerro del Águila",
        "fecha": "18 de octubre"
      },
      {
        "id": 3,
        "seta": "rebozuelo",
        "lugar": "Hayedo del Collado",
        "fecha": "3 de octubre"
      },
      {
        "id": 4,
        "seta": "boleto",
        "lugar": "Robledal de la Fuente",
        "fecha": "9 de octubre"
      },
      {
        "id": 5,
        "seta": "boleto",
        "lugar": "Pinar de la Umbría",
        "fecha": "15 de octubre"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Lo que ha pasado, paso a paso:

1. Pulsas «Boleto». El efecto pide la ficha del boleto **con la señal** y, cuando llega, pide la del boleto de Satanás **sin ella**.
2. Pulsas «Rebozuelo» mientras esa segunda petición está en camino. React limpia el efecto del boleto y llama a `controlador.abort()`, pero la única petición que escuchaba esa señal ya había terminado. La segunda ni se entera.
3. Con «Responder desordenado», la petición vieja llega la última. Su `setRespuesta` guarda `{ setaId: 'boleto', … }`, que no es la seta elegida, y la ficha vuelve a «Cargando la ficha…» para siempre.

**Cada paso de la cadena tiene que poder enterarse de que ya no interesa.** Con un `AbortController`, eso es pasar la misma `signal` a todos los `fetch` del efecto: el que esté en camino se cancela, y el que todavía no ha salido sale ya cancelado (un `fetch` con una señal abortada se rechaza en el acto). Con la bandera `ignorar` de la lección 38, es comprobarla **después de cada `await`**:

```jsx
useEffect(() => {
  let ignorar = false

  async function cargar() {
    const seta = await pedirJson(`/api/setas/${setaId}`)
    if (ignorar) return // ni siquiera pidas el paso 2
    const parecida = await pedirJson(`/api/setas/${seta.confusion}`)
    if (ignorar) return
    setRespuesta({ setaId, seta, parecida })
  }

  cargar().catch((error) => {
    if (!ignorar) setRespuesta({ setaId, error: error.message })
  })
  return () => {
    ignorar = true
  }
}, [setaId])
```

La bandera no cancela nada (las respuestas viejas llegan igual y se tiran), pero vale para cualquier paso asíncrono, no solo para `fetch`: un temporizador, una lectura de un archivo, una librería sin `signal`. Las dos técnicas se pueden juntar. Lo que no funciona es protegerse a medias:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function FichaSeta({ setaId }) {\n  const [seta, setSeta] = useState(null)\n  const [parecida, setParecida] = useState(null)\n\n  useEffect(() => {\n    let ignorar = false\n    async function cargar() {\n      const datos = await pedirJson(`/api/setas/${setaId}`)\n      if (ignorar) return\n      setSeta(datos)\n      const otra = await pedirJson(`/api/setas/${datos.confusion}`)\n      setParecida(otra)\n    }\n    cargar()\n    return () => {\n      ignorar = true\n    }\n  }, [setaId])\n  // Pinta seta.nombre y «Se confunde con: {parecida.nombre}»\n}\n\n// Estás en «Boleto». Pulsas «Rebozuelo» mientras la petición del\n// boleto de Satanás está en camino, y esa llega la última. ¿Qué ves?",
  "opciones": [
    "Rebozuelo · Se confunde con: Seta del olivo",
    "Rebozuelo · Se confunde con: Boleto de Satanás",
    "Boleto · Se confunde con: Boleto de Satanás",
    "«Cargando la ficha…» para siempre"
  ],
  "correcta": 1,
  "explicacion": "La bandera protege setSeta, pero setParecida no la mira. La respuesta vieja del paso 2 llega la última y pisa a la buena: la ficha del rebozuelo dice que se confunde con el boleto de Satanás (comprobado con «Responder desordenado»). En una guía de setas, es justo el dato que no puede salir mezclado."
}
```

Por eso las fichas de esta lección guardan **las dos respuestas juntas, en un solo `setRespuesta`**: queda un único sitio que proteger. Si un efecto reparte lo que llega entre varios estados, cada `set` necesita su comprobación.

## Las cascadas: peticiones que esperan sin necesidad

La cadena de la ficha cuesta dos viajes al servidor, uno detrás de otro, y desde el navegador no se puede evitar: hasta que no llega la ficha no sabes qué seta tóxica pedir. Es una **petición dependiente**. Pero hay otra espera que sí se puede evitar: la **cascada** (*network waterfall*) que viste en la lección 48, donde las especies del acuario no se pedían hasta que llegaba la ficha de su sala. Con efectos pasa exactamente lo mismo, y aquí la vas a medir.

`<Avistamientos>` está dentro de la ficha y pide sus datos en su propio efecto. Para que ese efecto se ejecute, el componente tiene que montarse; y para eso, la ficha tiene que haber llegado. Este bloque tiene `StrictMode` apagado para que cada petición salga una sola vez en la consola, donde `api.jsx` apunta cuándo sale y cuándo llega cada una, contando desde el último clic:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres peticiones en fila",
  "consigna": "Pulsa «Boleto» y lee la consola: cada petición sale cuando llega la anterior, y los avistamientos tardan 3 s aunque solo necesitan el id. Quita <Avistamientos /> (y su import) de FichaSeta.jsx y ponlo en App.jsx, debajo de <FichaSeta />, con setaId={setaId}. Pulsa otra seta: la petición de avistamientos sale en el segundo 0, junto a la de la ficha.",
  "archivos": [
    {
      "nombre": "FichaSeta.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { pedirJson } from './api'\nimport Avistamientos from './Avistamientos'\n\nexport default function FichaSeta({ setaId }) {\n  const [respuesta, setRespuesta] = useState(null)\n\n  useEffect(() => {\n    const controlador = new AbortController()\n    const { signal } = controlador\n\n    async function cargar() {\n      const seta = await pedirJson(`/api/setas/${setaId}`, { signal })\n      const parecida = await pedirJson(`/api/setas/${seta.confusion}`, { signal })\n      setRespuesta({ setaId, seta, parecida })\n    }\n\n    cargar().catch((error) => {\n      if (error.name !== 'AbortError') setRespuesta({ setaId, error: error.message })\n    })\n    return () => controlador.abort()\n  }, [setaId])\n\n  if (respuesta?.setaId !== setaId) return <p>Cargando la ficha…</p>\n  if (respuesta.error) {\n    return <p role=\"alert\">No se pudo cargar la ficha: {respuesta.error}</p>\n  }\n\n  const { seta, parecida } = respuesta\n  return (\n    <article className=\"ficha\">\n      <h2>{seta.nombre}</h2>\n      <p className=\"cientifico\">{seta.cientifico}</p>\n      <p className=\"peligro\">Se confunde con: {parecida.nombre}</p>\n      {/* Los avistamientos solo necesitan setaId... pero esperan aquí dentro */}\n      <Avistamientos setaId={setaId} />\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Avistamientos.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { pedirJson } from './api'\n\nexport default function Avistamientos({ setaId }) {\n  const [respuesta, setRespuesta] = useState(null)\n\n  useEffect(() => {\n    const controlador = new AbortController()\n    pedirJson(`/api/avistamientos?q=${setaId}`, { signal: controlador.signal })\n      .then((lista) => setRespuesta({ setaId, lista }))\n      .catch((error) => {\n        if (error.name !== 'AbortError') setRespuesta({ setaId, error: error.message })\n      })\n    return () => controlador.abort()\n  }, [setaId])\n\n  if (respuesta?.setaId !== setaId) return <p>Cargando avistamientos…</p>\n  if (respuesta.error) return <p role=\"alert\">Sin avistamientos: {respuesta.error}</p>\n\n  return (\n    <section>\n      <h3>Avistamientos de este otoño</h3>\n      <ul>\n        {respuesta.lista.map((avistamiento) => (\n          <li key={avistamiento.id}>\n            {avistamiento.lugar}, {avistamiento.fecha}\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { ponerEnMarcha } from './api'\nimport FichaSeta from './FichaSeta'\nimport './estilos.css'\n\nconst SETAS = [\n  { id: 'niscalo', nombre: 'Níscalo' },\n  { id: 'rebozuelo', nombre: 'Rebozuelo' },\n  { id: 'boleto', nombre: 'Boleto' },\n]\n\nexport default function App() {\n  const [setaId, setSetaId] = useState('niscalo')\n\n  function elegir(id) {\n    ponerEnMarcha()\n    setSetaId(id)\n  }\n\n  return (\n    <main>\n      <h1>Guía de setas · Hojarasca</h1>\n      <div>\n        {SETAS.map((seta) => (\n          <button\n            key={seta.id}\n            aria-pressed={seta.id === setaId}\n            onClick={() => elegir(seta.id)}\n          >\n            {seta.nombre}\n          </button>\n        ))}\n      </div>\n      <FichaSeta setaId={setaId} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Apunta en la consola cuándo sale y cuándo llega cada petición,\n// en segundos desde el último clic (ponerEnMarcha).\nlet inicio = performance.now()\n\nexport function ponerEnMarcha() {\n  inicio = performance.now()\n}\n\nfunction segundos() {\n  return ((performance.now() - inicio) / 1000).toFixed(1)\n}\n\nexport async function pedirJson(url, opciones) {\n  console.log(`${segundos()} s · sale ${url}`)\n  const respuesta = await fetch(url, opciones)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  const datos = await respuesta.json()\n  console.log(`${segundos()} s · llega ${url}`)\n  return datos\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #3f2a14;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #d6c7a8;\n  border-radius: 8px;\n  background: #fbf8f1;\n}\n\n.cientifico {\n  font-style: italic;\n  color: #57534e;\n}\n\n.peligro {\n  color: #9a3412;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "FichaSeta.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "api": {
    "setas": [
      {
        "id": "niscalo",
        "nombre": "Níscalo",
        "cientifico": "Lactarius deliciosus",
        "temporada": "otoño",
        "rasgo": "Al cortarlo suelta una leche naranja que con el tiempo verdea.",
        "confusion": "falso-niscalo"
      },
      {
        "id": "rebozuelo",
        "nombre": "Rebozuelo",
        "cientifico": "Cantharellus cibarius",
        "temporada": "de verano a otoño",
        "rasgo": "Debajo del sombrero tiene pliegues gruesos que bajan por el pie, no láminas finas.",
        "confusion": "seta-del-olivo"
      },
      {
        "id": "boleto",
        "nombre": "Boleto",
        "cientifico": "Boletus edulis",
        "temporada": "de finales de verano a otoño",
        "rasgo": "Poros blancos o amarillentos y un pie con una redecilla blanca.",
        "confusion": "boleto-de-satanas"
      },
      {
        "id": "falso-niscalo",
        "nombre": "Falso níscalo",
        "cientifico": "Lactarius torminosus",
        "temporada": "otoño",
        "rasgo": "Leche blanca y un sombrero con pelillos en el borde.",
        "confusion": null
      },
      {
        "id": "seta-del-olivo",
        "nombre": "Seta del olivo",
        "cientifico": "Omphalotus olearius",
        "temporada": "otoño",
        "rasgo": "Láminas finas de verdad y crece en matas sobre tocones y raíces.",
        "confusion": null
      },
      {
        "id": "boleto-de-satanas",
        "nombre": "Boleto de Satanás",
        "cientifico": "Rubroboletus satanas",
        "temporada": "de verano a otoño",
        "rasgo": "Poros rojos y un pie rojizo y abultado.",
        "confusion": null
      }
    ],
    "avistamientos": [
      {
        "id": 1,
        "seta": "niscalo",
        "lugar": "Pinar de la Umbría",
        "fecha": "12 de octubre"
      },
      {
        "id": 2,
        "seta": "niscalo",
        "lugar": "Cerro del Águila",
        "fecha": "18 de octubre"
      },
      {
        "id": 3,
        "seta": "rebozuelo",
        "lugar": "Hayedo del Collado",
        "fecha": "3 de octubre"
      },
      {
        "id": 4,
        "seta": "boleto",
        "lugar": "Robledal de la Fuente",
        "fecha": "9 de octubre"
      },
      {
        "id": 5,
        "seta": "boleto",
        "lugar": "Pinar de la Umbría",
        "fecha": "15 de octubre"
      }
    ]
  },
  "red": {
    "latencia": 1000
  }
}
```

Con la latencia en 1 s, al pulsar «Boleto» la consola cuenta la cascada entera:

```text
0.0 s · sale /api/setas/boleto
1.0 s · llega /api/setas/boleto
1.0 s · sale /api/setas/boleto-de-satanas
2.0 s · llega /api/setas/boleto-de-satanas
2.0 s · sale /api/avistamientos?q=boleto
3.0 s · llega /api/avistamientos?q=boleto
```

Las décimas pueden bailar un poco. Dibujado en el tiempo, antes y después de sacar `<Avistamientos>` de la ficha:

```text
En cascada: 3 s
|── ficha ──|
            |── seta tóxica ──|
                              |── avistamientos ──|

Con los avistamientos en paralelo: 2 s
|── ficha ──|
            |── seta tóxica ──|
|── avistamientos ──|
```

**Una petición que solo necesita lo que ya sabes no debería esperar a otra.** El primer tramo (ficha → seta tóxica) es dependiente y se queda; el tercero no lo era. En una app real las cascadas se apilan: la página espera al usuario, la lista espera a la página, cada tarjeta espera a la lista... y cada nivel suma un viaje completo al servidor.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Cómo se deshace una cascada",
  "items": [
    {
      "titulo": "Pide desde más arriba",
      "texto": "Saca el componente que pide de dentro del que espera, como has hecho con los avistamientos, o pide los datos de los dos en el mismo padre y pásalos por props."
    },
    {
      "titulo": "Lánzalas a la vez",
      "texto": "Dentro de un mismo efecto, Promise.all([pedirJson(a, { signal }), pedirJson(b, { signal })]) arranca las dos peticiones en el acto y espera a ambas. Con la misma señal, la limpieza las cancela juntas."
    },
    {
      "titulo": "Que el servidor lo dé de una vez",
      "texto": "Un endpoint que devuelva la ficha con su seta tóxica dentro quita el viaje dependiente. Es lo primero que propone la guía de TanStack Query para las peticiones en serie."
    },
    {
      "titulo": "Empieza antes",
      "texto": "Pide al pasar el ratón por el botón, o en la ruta antes de montar la página: es lo que hacen los loaders de los frameworks (lección 90)."
    },
    {
      "titulo": "Llévate la cascada al servidor",
      "texto": "Con Server Components (lección 88), las peticiones encadenadas ocurren junto a la base de datos, donde cada viaje cuesta milisegundos y no la latencia del móvil del usuario."
    }
  ]
}
```

## Forma 2: `use`, una caché de promesas y Suspense

Ahora, la misma ficha sin efectos, con lo que aprendiste en las lecciones 48 y 49: `use` lee la promesa, `<Suspense>` enseña la espera y un error boundary recoge el fallo. De los tres orígenes de una promesa estable que vimos en la 49 (una caché, un manejador de eventos o un framework), aquí se usa el primero: la misma caché `leer`, un `Map` de URL a promesa en `datos.jsx`. Lo nuevo es ponerla frente a la forma 1, con la misma pantalla y las mismas pruebas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La misma ficha, con use y una caché",
  "consigna": "Al cargar, mira el panel de red: una petición por URL, sin la cancelada de StrictMode. Repite la carrera (3 s de latencia, «Responder desordenado», «Boleto» y, tras su primer 200, «Rebozuelo»): sale siempre la seta elegida. Vuelve a una seta ya vista: aparece al instante, sin petición. Por último, pulsa «Fallar la siguiente petición», elige una seta nueva y después vuelve a ella.",
  "archivos": [
    {
      "nombre": "FichaSeta.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function FichaSeta({ setaId }) {\n  const seta = use(leer(`/api/setas/${setaId}`))\n  const parecida = use(leer(`/api/setas/${seta.confusion}`))\n\n  return (\n    <article className=\"ficha\">\n      <h2>{seta.nombre}</h2>\n      <p className=\"cientifico\">{seta.cientifico}</p>\n      <p>Temporada: {seta.temporada}. {seta.rasgo}</p>\n      <p className=\"peligro\">Se confunde con: {parecida.nombre}</p>\n      <p>{parecida.rasgo}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Caché de promesas: una por URL, compartida por toda la app.\n// La documentación de use enseña esta versión mínima; en un proyecto\n// real la caché te la da una librería o un framework.\nconst cache = new Map()\n\nasync function pedirJson(url) {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport function leer(url) {\n  if (!cache.has(url)) {\n    const promesa = pedirJson(url)\n    // Si falla antes de que nadie la lea con use, que el navegador no lo\n    // trate como un error sin capturar: el error lo recogerá use.\n    promesa.catch(() => {})\n    cache.set(url, promesa)\n  }\n  return cache.get(url)\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport FichaSeta from './FichaSeta'\nimport LimiteDeError from './LimiteDeError'\nimport './estilos.css'\n\nconst SETAS = [\n  { id: 'niscalo', nombre: 'Níscalo' },\n  { id: 'rebozuelo', nombre: 'Rebozuelo' },\n  { id: 'boleto', nombre: 'Boleto' },\n]\n\nexport default function App() {\n  const [setaId, setSetaId] = useState('niscalo')\n\n  return (\n    <main>\n      <h1>Guía de setas · Hojarasca</h1>\n      <div>\n        {SETAS.map((seta) => (\n          <button\n            key={seta.id}\n            aria-pressed={seta.id === setaId}\n            onClick={() => setSetaId(seta.id)}\n          >\n            {seta.nombre}\n          </button>\n        ))}\n      </div>\n      <LimiteDeError key={setaId} mensaje=\"No se pudo cargar la ficha\">\n        <Suspense fallback={<p>Cargando la ficha…</p>}>\n          <FichaSeta setaId={setaId} />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\n// Un error boundary mínimo: la lección 53 lo explica pieza a pieza.\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) {\n      return (\n        <p role=\"alert\">\n          {this.props.mensaje}: {this.state.error.message}\n        </p>\n      )\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #3f2a14;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #d6c7a8;\n  border-radius: 8px;\n  background: #fbf8f1;\n}\n\n.cientifico {\n  font-style: italic;\n  color: #57534e;\n}\n\n.peligro {\n  color: #9a3412;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "FichaSeta.jsx",
  "mostrarConsola": false,
  "api": {
    "setas": [
      {
        "id": "niscalo",
        "nombre": "Níscalo",
        "cientifico": "Lactarius deliciosus",
        "temporada": "otoño",
        "rasgo": "Al cortarlo suelta una leche naranja que con el tiempo verdea.",
        "confusion": "falso-niscalo"
      },
      {
        "id": "rebozuelo",
        "nombre": "Rebozuelo",
        "cientifico": "Cantharellus cibarius",
        "temporada": "de verano a otoño",
        "rasgo": "Debajo del sombrero tiene pliegues gruesos que bajan por el pie, no láminas finas.",
        "confusion": "seta-del-olivo"
      },
      {
        "id": "boleto",
        "nombre": "Boleto",
        "cientifico": "Boletus edulis",
        "temporada": "de finales de verano a otoño",
        "rasgo": "Poros blancos o amarillentos y un pie con una redecilla blanca.",
        "confusion": "boleto-de-satanas"
      },
      {
        "id": "falso-niscalo",
        "nombre": "Falso níscalo",
        "cientifico": "Lactarius torminosus",
        "temporada": "otoño",
        "rasgo": "Leche blanca y un sombrero con pelillos en el borde.",
        "confusion": null
      },
      {
        "id": "seta-del-olivo",
        "nombre": "Seta del olivo",
        "cientifico": "Omphalotus olearius",
        "temporada": "otoño",
        "rasgo": "Láminas finas de verdad y crece en matas sobre tocones y raíces.",
        "confusion": null
      },
      {
        "id": "boleto-de-satanas",
        "nombre": "Boleto de Satanás",
        "cientifico": "Rubroboletus satanas",
        "temporada": "de verano a otoño",
        "rasgo": "Poros rojos y un pie rojizo y abultado.",
        "confusion": null
      }
    ],
    "avistamientos": [
      {
        "id": 1,
        "seta": "niscalo",
        "lugar": "Pinar de la Umbría",
        "fecha": "12 de octubre"
      },
      {
        "id": 2,
        "seta": "niscalo",
        "lugar": "Cerro del Águila",
        "fecha": "18 de octubre"
      },
      {
        "id": 3,
        "seta": "rebozuelo",
        "lugar": "Hayedo del Collado",
        "fecha": "3 de octubre"
      },
      {
        "id": 4,
        "seta": "boleto",
        "lugar": "Robledal de la Fuente",
        "fecha": "9 de octubre"
      },
      {
        "id": 5,
        "seta": "boleto",
        "lugar": "Pinar de la Umbría",
        "fecha": "15 de octubre"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

`FichaSeta` ya no tiene estado, ni efecto, ni «Cargando…», ni `AbortController`: dos líneas con `use` y el JSX. La espera la pinta el `<Suspense>` de `App`, y el fallo, el `LimiteDeError` (con `key={setaId}`, como el de la hornada de la lección 49, para que el error de una seta no se quede en las demás). Lo que has visto en el panel de red:

- **Una petición por URL, también con `StrictMode`.** El segundo render de `StrictMode` llama a `leer` con la misma URL y recibe la misma promesa. No hay efecto que montar, limpiar y repetir.
- **Ninguna carrera.** El componente no guarda respuestas en el estado: en cada render lee la promesa de la seta elegida **ahora**. La petición del boleto termina (el panel la marca con su 200), pero nadie la pinta. Ni bandera ni `AbortController`.
- **Volver es instantáneo.** La promesa del boleto sigue en la caché, ya cumplida, y `use` lee su valor sin suspenderse.

Y lo que esta caché tan simple te deja a ti:

- **Nada se cancela.** Las peticiones que ya no interesan llegan igual. Casi siempre da igual; con descargas grandes, no.
- **Nada caduca.** Si alguien corrige una ficha en el servidor, la guía no se entera hasta que recargues la página. Alguien tiene que decidir cuándo se borra cada entrada.
- **Un fallo se queda guardado.** Tras «Fallar la siguiente petición», la promesa rechazada sigue en el `Map`: al volver a esa seta, el error reaparece sin ninguna petición. Es lo que arreglaste en el segundo ejercicio de la lección 49, y la 53 lo lleva al propio error boundary.
- **Cada cambio vuelve al aviso de carga.** Al elegir otra seta, el `fallback` sustituye a la ficha anterior. Para mantenerla a la vista mientras llega la nueva están las transiciones (lección 51).

Y las cascadas tampoco desaparecen: además de la de componentes anidados de la lección 48, hay una que cabe dentro de un solo componente. La verás en «Errores típicos» y la arreglarás en el segundo ejercicio.

## Forma 3: una librería (TanStack Query)

Fíjate en lo que has ido sumando a la lista: una caché, reintentar, caducar entradas, cancelar, no repetir peticiones iguales, refrescar en segundo plano... Es una librería entera, y ya existe. **TanStack Query** (antes React Query, versión 5.104.5) es la más usada para guardar en el navegador el estado del servidor; SWR es otra con la misma idea. En estas vistas previas no se puede instalar nada, así que aquí tienes la guía de setas para leerla. La lección 78 la enseña a fondo en un proyecto con Vite.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'\nimport { useState } from 'react'\n\nconst queryClient = new QueryClient()\n\nasync function pedirJson(url, signal) {\n  const respuesta = await fetch(url, { signal })\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nfunction FichaSeta({ setaId }) {\n  const ficha = useQuery({\n    queryKey: ['setas', setaId],\n    queryFn: ({ signal }) => pedirJson(`/api/setas/${setaId}`, signal),\n  })\n  const confusionId = ficha.data?.confusion\n  const parecida = useQuery({\n    queryKey: ['setas', confusionId],\n    queryFn: ({ signal }) => pedirJson(`/api/setas/${confusionId}`, signal),\n    enabled: Boolean(confusionId),\n  })\n\n  if (ficha.isPending) return <p>Cargando la ficha…</p>\n  if (ficha.error) {\n    return <p role=\"alert\">No se pudo cargar la ficha: {ficha.error.message}</p>\n  }\n\n  return (\n    <article className=\"ficha\">\n      <h2>{ficha.data.nombre}</h2>\n      <p>Temporada: {ficha.data.temporada}</p>\n      {parecida.data && <p>Se confunde con: {parecida.data.nombre}</p>}\n    </article>\n  )\n}\n\nfunction Avistamientos({ setaId }) {\n  const { data, isPending, error } = useQuery({\n    queryKey: ['avistamientos', setaId],\n    queryFn: ({ signal }) => pedirJson(`/api/avistamientos?q=${setaId}`, signal),\n  })\n\n  if (isPending) return <p>Cargando avistamientos…</p>\n  if (error) return <p role=\"alert\">Sin avistamientos: {error.message}</p>\n  return (\n    <ul>\n      {data.map((avistamiento) => (\n        <li key={avistamiento.id}>{avistamiento.lugar}, {avistamiento.fecha}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [setaId, setSetaId] = useState('niscalo')\n\n  return (\n    <QueryClientProvider client={queryClient}>\n      <main>\n        <h1>Guía de setas · Hojarasca</h1>\n        <button onClick={() => setSetaId('niscalo')}>Níscalo</button>\n        <button onClick={() => setSetaId('boleto')}>Boleto</button>\n        <FichaSeta setaId={setaId} />\n        <Avistamientos setaId={setaId} />\n      </main>\n    </QueryClientProvider>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const queryClient = new QueryClient()",
      "nota": "La caché vive en este objeto, fuera de los componentes, y QueryClientProvider la reparte por el árbol como un contexto (lección 28). Se crea una sola vez, en el nivel del módulo."
    },
    {
      "fragmento": "queryKey: ['setas', setaId]",
      "nota": "La clave de la caché. Dos componentes que piden la misma clave comparten una petición y un resultado. Y como cada render lee los datos de la clave actual, una respuesta vieja no puede pisar a la nueva: no hay carrera que arreglar."
    },
    {
      "fragmento": "queryFn: ({ signal }) => pedirJson(`/api/setas/${setaId}`, signal)",
      "nota": "La función que pide los datos: la misma pedirJson de siempre. Recibe una signal que TanStack Query aborta si la consulta deja de interesar, así que la cancelación de la forma 1 viene hecha."
    },
    {
      "fragmento": "enabled: Boolean(confusionId)",
      "nota": "Una consulta dependiente: no sale hasta que llega la ficha y se sabe qué seta tóxica pedir. La cascada sigue ahí, porque es inevitable, pero declarada en una línea."
    },
    {
      "fragmento": "if (ficha.isPending) return <p>Cargando la ficha…</p>",
      "nota": "isPending, error y data sustituyen a la respuesta con su setaId de la forma 1. Una consulta que falla se reintenta sola tres veces (al cabo de 1, 2 y 4 segundos) antes de llegar a error."
    },
    {
      "fragmento": "<Avistamientos setaId={setaId} />",
      "nota": "Hermano de la ficha, no hijo: su consulta sale a la vez que la de la ficha. La librería no te libra de las cascadas de componentes; dónde se pide cada cosa sigue siendo decisión tuya."
    }
  ]
}
```

Ejecutada fuera de esta web con TanStack Query 5.104.5 y React 19.3.1, esta versión hace cosas que las otras dos no:

- **Pinta lo que tiene y pregunta igualmente.** Al volver a una seta ya vista, la ficha sale al instante desde la caché y, a la vez, se vuelve a pedir en segundo plano por si ha cambiado. Por defecto los datos se consideran viejos en cuanto llegan; la opción `staleTime` decide cuánto tiempo siguen frescos.
- **Reintenta en silencio.** Con un fallo suelto, como el de «Fallar la siguiente petición», el usuario ni lo vería: el segundo intento sale bien.
- **Limpia sola.** Según su documentación, las consultas que ningún componente usa se borran de la caché a los cinco minutos, y las viejas se vuelven a pedir al volver a la pestaña o al recuperar la conexión.
- **También habla Suspense.** Con `useSuspenseQuery` en lugar de `useQuery`, la espera la pinta un `<Suspense>` y los errores van al error boundary, como con `use`.

Y si trabajas con un framework (Next.js, React Router en modo framework), el framework trae su propia forma de cargar datos, normalmente antes de renderizar la página y en el servidor: úsala. Lo verás en las lecciones 88 y 90.

## Las tres, frente a frente

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cargando y error",
      "texto": "Efecto: estados que mantienes tú, y la carga deducida de la respuesta en vez de un set al principio del efecto (lección 39). use: un Suspense y un error boundary alrededor del componente. Librería: isPending y error ya calculados."
    },
    {
      "titulo": "Carreras",
      "texto": "Efecto: limpieza con AbortController o con una bandera, en cada paso de la cadena. use y librería: no aparecen, porque nadie guarda en el estado la respuesta de una petición vieja."
    },
    {
      "titulo": "Cascadas",
      "texto": "Las tres pueden caer en ellas y en las tres se deshacen igual: pedir antes, pedir a la vez o pedir más arriba. Ninguna herramienta decide por ti dónde se pide cada cosa."
    },
    {
      "titulo": "Caché y peticiones repetidas",
      "texto": "Efecto: cada montaje pide otra vez, y en desarrollo StrictMode pide dos. use: lo que te dé tu caché; la de esta lección no caduca nunca. Librería: caché con caducidad, refresco en segundo plano y una petición por clave."
    },
    {
      "titulo": "Cancelar",
      "texto": "Efecto: con AbortController, escrito por ti. use: nada se cancela. TanStack Query: aborta la signal de las consultas que dejan de interesar."
    },
    {
      "titulo": "Lo que hay que instalar",
      "texto": "Efecto y use: solo React. Librería: una dependencia más, con su proveedor y su forma de trabajar, que compensa en cuanto varias pantallas piden datos."
    }
  ]
}
```

Y cuatro ideas que conviene desmontar antes de elegir:

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Pedir datos en un efecto está mal",
      "realidad": "Funciona, y es lo que hay debajo de muchas librerías. React lo desaconseja en apps grandes por todo lo que te toca escribir a mano (caché, carreras, cascadas), no porque sea incorrecto. En una app pequeña sin framework, un efecto con su limpieza dentro de un Hook propio (lección 43) es razonable."
    },
    {
      "mito": "Con use y Suspense ya no hace falta una librería de datos",
      "realidad": "use y Suspense resuelven cómo se lee una promesa y qué se ve mientras tanto. Qué promesa guardar, cuándo caduca, cuándo se vuelve a pedir o qué hacer con un fallo sigue siendo trabajo de alguien: tu caché, una librería o un framework."
    },
    {
      "mito": "Suspense pide los datos",
      "realidad": "Suspense no pide nada: enseña su fallback mientras algún componente de dentro está suspendido. Quien pide es tu caché, la librería o el framework."
    },
    {
      "mito": "Con una librería no hay cascadas",
      "realidad": "Una consulta dentro de un hijo que solo se monta cuando llegan los datos del padre es una cascada con cualquier herramienta. La librería te quita la caché y las carreras, no la decisión de dónde pedir."
    }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Una app pequeña sin framework",
      "texto": "Un efecto con su limpieza, metido en un Hook propio como el useDatos de la lección 43. Si mañana cambias a una librería, solo cambia el Hook y no los componentes."
    },
    {
      "titulo": "Varias pantallas que comparten datos del servidor",
      "texto": "TanStack Query: la caché compartida, los reintentos y el refresco en segundo plano son trabajo que no quieres escribir tú. Lo verás en la lección 78 y en el proyecto 93."
    },
    {
      "titulo": "Un framework",
      "texto": "Usa su forma de cargar datos: los loaders de React Router o los Server Components de Next.js piden antes de renderizar y en el servidor, donde las cascadas cuestan poco (lecciones 88 y 90)."
    },
    {
      "titulo": "use con tu propia caché",
      "texto": "Para entender cómo encajan use y Suspense, o para un caso pequeño y acotado, como unos datos que no cambian mientras la app está abierta. Si tienen que caducar, deja la caché a una librería."
    }
  ]
}
```

## Errores típicos

**Dos `use` seguidos para datos que no dependen uno de otro.** Es la cascada más escondida, porque no hay ningún componente hijo de por medio:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function FichaSeta({ setaId }) {\n  const seta = use(leer(`/api/setas/${setaId}`))\n  const avistamientos = use(leer(`/api/avistamientos?q=${setaId}`))\n\n  return (\n    <article>\n      <h2>{seta.nombre}</h2>\n      <p>{avistamientos.length} avistamientos este otoño</p>\n    </article>\n  )\n}\n\n// Con 1 s de latencia, ¿cuándo sale la petición de avistamientos?",
  "opciones": [
    "En el segundo 0, a la vez que la de la ficha",
    "Al cabo de 1 s, cuando llega la ficha",
    "Nunca: el segundo use no llega a ejecutarse"
  ],
  "correcta": 1,
  "explicacion": "El primer use se suspende y React deja el render en esa línea: la siguiente no se ejecuta hasta que React vuelve a intentarlo con la ficha ya cumplida. Dos use seguidos son dos peticiones en fila, aunque la segunda solo necesite setaId. Comprobado con React 19.3.1. Cómo lanzarlas a la vez es el segundo ejercicio."
}
```

**Crear la promesa durante el render.** `use(pedirJson(url))` o `use(leer(url).then(…))` crean una promesa nueva en cada intento de render, y la ficha se queda en «Cargando…» con una petición detrás de otra. Lo viste a fondo en la lección 49.

**Poner `setCargando(true)` al principio del efecto.** Es un `set` síncrono en el cuerpo del efecto, y el linter de React lo marca con `set-state-in-effect` (lección 39). Deduce la carga de la respuesta guardada, como en todas las fichas de esta lección.

**Proteger solo el primer paso de una cadena.** Lo has visto dos veces: una petición sin la señal se queda sin cancelar, y un `set` sin comprobar la bandera mezcla datos de dos setas. Cada `await` es un sitio donde el mundo puede haber cambiado.

## Ejercicios

**1. La ficha y su doble peligroso, con un efecto.** `FichaSeta` ya sabe pintar la ficha, el «Cargando…» y el error; le falta el efecto con la cadena de dos peticiones. Las comprobaciones usan la API simulada con 300 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha y su doble peligroso",
  "consigna": "En FichaSeta.jsx, escribe el efecto: pide la ficha de la seta y después la de la seta con la que se confunde (su campo confusion), guarda las dos juntas con setRespuesta y guarda el mensaje si algo falla. La limpieza tiene que cancelar los dos pasos. Cuando pase las comprobaciones, repite la prueba de la carrera del principio de la lección.",
  "archivos": [
    {
      "nombre": "FichaSeta.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { pedirJson } from './api'\n\nexport default function FichaSeta({ setaId }) {\n  // { setaId, seta, parecida } si llega bien; { setaId, error } si falla\n  const [respuesta, setRespuesta] = useState(null)\n\n  // Escribe aquí el efecto:\n  // 1. Pide /api/setas/<setaId> y, con su campo confusion,\n  //    /api/setas/<seta.confusion>.\n  // 2. Guarda las dos juntas: setRespuesta({ setaId, seta, parecida }).\n  // 3. Si algo falla, guarda { setaId, error: error.message }.\n  // 4. La limpieza cancela los dos pasos: la misma señal en los dos.\n\n  if (respuesta?.setaId !== setaId) return <p>Cargando la ficha…</p>\n  if (respuesta.error) {\n    return <p role=\"alert\">No se pudo cargar la ficha: {respuesta.error}</p>\n  }\n\n  const { seta, parecida } = respuesta\n  return (\n    <article className=\"ficha\">\n      <h2>{seta.nombre}</h2>\n      <p className=\"cientifico\">{seta.cientifico}</p>\n      <p>Temporada: {seta.temporada}. {seta.rasgo}</p>\n      <p className=\"peligro\">Se confunde con: {parecida.nombre}</p>\n      <p>{parecida.rasgo}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaSeta from './FichaSeta'\nimport './estilos.css'\n\nconst SETAS = [\n  { id: 'niscalo', nombre: 'Níscalo' },\n  { id: 'rebozuelo', nombre: 'Rebozuelo' },\n  { id: 'boleto', nombre: 'Boleto' },\n]\n\nexport default function App() {\n  const [setaId, setSetaId] = useState('niscalo')\n\n  return (\n    <main>\n      <h1>Guía de setas · Hojarasca</h1>\n      <div>\n        {SETAS.map((seta) => (\n          <button\n            key={seta.id}\n            aria-pressed={seta.id === setaId}\n            onClick={() => setSetaId(seta.id)}\n          >\n            {seta.nombre}\n          </button>\n        ))}\n      </div>\n      <FichaSeta setaId={setaId} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.jsx",
      "codigo": "// Pide una URL y devuelve el JSON. fetch no rechaza con un 404 o un 500:\n// esas respuestas se convierten en error a mano.\nexport async function pedirJson(url, opciones) {\n  const respuesta = await fetch(url, opciones)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #3f2a14;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #d6c7a8;\n  border-radius: 8px;\n  background: #fbf8f1;\n}\n\n.cientifico {\n  font-style: italic;\n  color: #57534e;\n}\n\n.peligro {\n  color: #9a3412;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "FichaSeta.jsx",
  "mostrarConsola": false,
  "api": {
    "setas": [
      {
        "id": "niscalo",
        "nombre": "Níscalo",
        "cientifico": "Lactarius deliciosus",
        "temporada": "otoño",
        "rasgo": "Al cortarlo suelta una leche naranja que con el tiempo verdea.",
        "confusion": "falso-niscalo"
      },
      {
        "id": "rebozuelo",
        "nombre": "Rebozuelo",
        "cientifico": "Cantharellus cibarius",
        "temporada": "de verano a otoño",
        "rasgo": "Debajo del sombrero tiene pliegues gruesos que bajan por el pie, no láminas finas.",
        "confusion": "seta-del-olivo"
      },
      {
        "id": "boleto",
        "nombre": "Boleto",
        "cientifico": "Boletus edulis",
        "temporada": "de finales de verano a otoño",
        "rasgo": "Poros blancos o amarillentos y un pie con una redecilla blanca.",
        "confusion": "boleto-de-satanas"
      },
      {
        "id": "falso-niscalo",
        "nombre": "Falso níscalo",
        "cientifico": "Lactarius torminosus",
        "temporada": "otoño",
        "rasgo": "Leche blanca y un sombrero con pelillos en el borde.",
        "confusion": null
      },
      {
        "id": "seta-del-olivo",
        "nombre": "Seta del olivo",
        "cientifico": "Omphalotus olearius",
        "temporada": "otoño",
        "rasgo": "Láminas finas de verdad y crece en matas sobre tocones y raíces.",
        "confusion": null
      },
      {
        "id": "boleto-de-satanas",
        "nombre": "Boleto de Satanás",
        "cientifico": "Rubroboletus satanas",
        "temporada": "de verano a otoño",
        "rasgo": "Poros rojos y un pie rojizo y abultado.",
        "confusion": null
      }
    ],
    "avistamientos": [
      {
        "id": 1,
        "seta": "niscalo",
        "lugar": "Pinar de la Umbría",
        "fecha": "12 de octubre"
      },
      {
        "id": 2,
        "seta": "niscalo",
        "lugar": "Cerro del Águila",
        "fecha": "18 de octubre"
      },
      {
        "id": 3,
        "seta": "rebozuelo",
        "lugar": "Hayedo del Collado",
        "fecha": "3 de octubre"
      },
      {
        "id": 4,
        "seta": "boleto",
        "lugar": "Robledal de la Fuente",
        "fecha": "9 de octubre"
      },
      {
        "id": 5,
        "seta": "boleto",
        "lugar": "Pinar de la Umbría",
        "fecha": "15 de octubre"
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparece la ficha del níscalo",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Níscalo"
      }
    },
    {
      "descripcion": "La ficha dice con qué seta tóxica se confunde",
      "pasos": [],
      "espera": {
        "texto": "Se confunde con: Falso níscalo"
      }
    },
    {
      "descripcion": "Mientras llegan los datos, se ve «Cargando la ficha…»",
      "pasos": [],
      "espera": {
        "texto": "Cargando la ficha…"
      }
    },
    {
      "descripcion": "Al pulsar «Boleto», sale el boleto de Satanás",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Boleto"
          }
        }
      ],
      "espera": {
        "texto": "Se confunde con: Boleto de Satanás"
      }
    },
    {
      "descripcion": "Si la carga falla, aparece un aviso de error",
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
      "descripcion": "Después de un error, otra seta se carga bien",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Rebozuelo"
          }
        }
      ],
      "espera": {
        "texto": "Se confunde con: Seta del olivo"
      }
    }
  ]
}
```

**2. Dos peticiones a la vez en la misma ficha.** Esta guía enseña en cada ficha la seta y sus avistamientos, con dos `use` seguidos en `FichaSeta`: la cascada de «Errores típicos». Con 1 s de latencia, cada ficha tarda 2 s. Las comprobaciones usan esa misma latencia, así que solo pasan si las dos peticiones salen juntas.

Fíjate antes en una línea de `leer` en `datos.jsx`: `promesa.catch(() => {})`. Cuando una promesa se crea antes de que nadie la lea con `use`, puede rechazarse sin que nada la atienda, y el navegador lo trata como un error sin capturar: en la vista previa saldría el recuadro rojo aunque el error boundary también pinte su aviso (comprobado sin esa línea). El `.catch` vacío marca la promesa como atendida; el error lo sigue recogiendo `use`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos peticiones a la vez en la misma ficha",
  "consigna": "En FichaSeta.jsx, haz que la petición de los avistamientos salga a la vez que la de la ficha, sin quitar ningún use ni cambiar el JSX. Mira el panel de red antes y después: las dos peticiones de cada seta tienen que salir juntas, y la ficha, tardar 1 s en vez de 2.",
  "archivos": [
    {
      "nombre": "FichaSeta.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function FichaSeta({ setaId }) {\n  const seta = use(leer(`/api/setas/${setaId}`))\n  const avistamientos = use(leer(`/api/avistamientos?q=${setaId}`))\n\n  return (\n    <article className=\"ficha\">\n      <h2>{seta.nombre}</h2>\n      <p className=\"cientifico\">{seta.cientifico}</p>\n      <p>Temporada: {seta.temporada}. {seta.rasgo}</p>\n      <h3>Avistamientos de este otoño</h3>\n      <ul>\n        {avistamientos.map((avistamiento) => (\n          <li key={avistamiento.id}>\n            {avistamiento.lugar}, {avistamiento.fecha}\n          </li>\n        ))}\n      </ul>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport FichaSeta from './FichaSeta'\nimport LimiteDeError from './LimiteDeError'\nimport './estilos.css'\n\nconst SETAS = [\n  { id: 'niscalo', nombre: 'Níscalo' },\n  { id: 'rebozuelo', nombre: 'Rebozuelo' },\n  { id: 'boleto', nombre: 'Boleto' },\n]\n\nexport default function App() {\n  const [setaId, setSetaId] = useState('niscalo')\n\n  return (\n    <main>\n      <h1>Guía de setas · Hojarasca</h1>\n      <div>\n        {SETAS.map((seta) => (\n          <button\n            key={seta.id}\n            aria-pressed={seta.id === setaId}\n            onClick={() => setSetaId(seta.id)}\n          >\n            {seta.nombre}\n          </button>\n        ))}\n      </div>\n      <LimiteDeError key={setaId} mensaje=\"No se pudo cargar la ficha\">\n        <Suspense fallback={<p>Cargando la ficha…</p>}>\n          <FichaSeta setaId={setaId} />\n        </Suspense>\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Caché de promesas: una por URL, compartida por toda la app.\n// La documentación de use enseña esta versión mínima; en un proyecto\n// real la caché te la da una librería o un framework.\nconst cache = new Map()\n\nasync function pedirJson(url) {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport function leer(url) {\n  if (!cache.has(url)) {\n    const promesa = pedirJson(url)\n    // Si falla antes de que nadie la lea con use, que el navegador no lo\n    // trate como un error sin capturar: el error lo recogerá use.\n    promesa.catch(() => {})\n    cache.set(url, promesa)\n  }\n  return cache.get(url)\n}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\n// Un error boundary mínimo: la lección 53 lo explica pieza a pieza.\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) {\n      return (\n        <p role=\"alert\">\n          {this.props.mensaje}: {this.state.error.message}\n        </p>\n      )\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #3f2a14;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #d6c7a8;\n  border-radius: 8px;\n  background: #fbf8f1;\n}\n\n.cientifico {\n  font-style: italic;\n  color: #57534e;\n}\n\n.peligro {\n  color: #9a3412;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "FichaSeta.jsx",
  "mostrarConsola": false,
  "api": {
    "setas": [
      {
        "id": "niscalo",
        "nombre": "Níscalo",
        "cientifico": "Lactarius deliciosus",
        "temporada": "otoño",
        "rasgo": "Al cortarlo suelta una leche naranja que con el tiempo verdea.",
        "confusion": "falso-niscalo"
      },
      {
        "id": "rebozuelo",
        "nombre": "Rebozuelo",
        "cientifico": "Cantharellus cibarius",
        "temporada": "de verano a otoño",
        "rasgo": "Debajo del sombrero tiene pliegues gruesos que bajan por el pie, no láminas finas.",
        "confusion": "seta-del-olivo"
      },
      {
        "id": "boleto",
        "nombre": "Boleto",
        "cientifico": "Boletus edulis",
        "temporada": "de finales de verano a otoño",
        "rasgo": "Poros blancos o amarillentos y un pie con una redecilla blanca.",
        "confusion": "boleto-de-satanas"
      },
      {
        "id": "falso-niscalo",
        "nombre": "Falso níscalo",
        "cientifico": "Lactarius torminosus",
        "temporada": "otoño",
        "rasgo": "Leche blanca y un sombrero con pelillos en el borde.",
        "confusion": null
      },
      {
        "id": "seta-del-olivo",
        "nombre": "Seta del olivo",
        "cientifico": "Omphalotus olearius",
        "temporada": "otoño",
        "rasgo": "Láminas finas de verdad y crece en matas sobre tocones y raíces.",
        "confusion": null
      },
      {
        "id": "boleto-de-satanas",
        "nombre": "Boleto de Satanás",
        "cientifico": "Rubroboletus satanas",
        "temporada": "de verano a otoño",
        "rasgo": "Poros rojos y un pie rojizo y abultado.",
        "confusion": null
      }
    ],
    "avistamientos": [
      {
        "id": 1,
        "seta": "niscalo",
        "lugar": "Pinar de la Umbría",
        "fecha": "12 de octubre"
      },
      {
        "id": 2,
        "seta": "niscalo",
        "lugar": "Cerro del Águila",
        "fecha": "18 de octubre"
      },
      {
        "id": 3,
        "seta": "rebozuelo",
        "lugar": "Hayedo del Collado",
        "fecha": "3 de octubre"
      },
      {
        "id": 4,
        "seta": "boleto",
        "lugar": "Robledal de la Fuente",
        "fecha": "9 de octubre"
      },
      {
        "id": 5,
        "seta": "boleto",
        "lugar": "Pinar de la Umbría",
        "fecha": "15 de octubre"
      }
    ]
  },
  "red": {
    "latencia": 1000
  },
  "comprobaciones": [
    {
      "descripcion": "Mientras llega la ficha, se ve «Cargando la ficha…»",
      "pasos": [],
      "espera": {
        "texto": "Cargando la ficha…"
      }
    },
    {
      "descripcion": "La ficha del níscalo llega en 1 s, no en 2",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Níscalo"
      }
    },
    {
      "descripcion": "La ficha del níscalo trae sus avistamientos",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Cerro del Águila"
      }
    },
    {
      "descripcion": "Al pulsar «Boleto», su ficha y sus avistamientos llegan en 1 s",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Boleto"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Robledal de la Fuente"
      }
    },
    {
      "descripcion": "Si la carga falla, el error boundary enseña un aviso",
      "pasos": [
        {
          "red": "fallar-siguiente"
        }
      ],
      "espera": {
        "rol": "alert"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade los avistamientos al ejercicio 1 sin crear otro componente: pídelos en el mismo efecto que la ficha, con `Promise.all` y la misma señal, para que salgan a la vez que el primer paso de la cadena. Comprueba en el panel de red que salen juntas.
2. Mide la forma 2: copia en su `datos.jsx` el `console.log` de «sale» y «llega» del bloque de las cascadas y compara con la forma 1 cuántas peticiones salen al cargar, al cambiar de seta y al volver a una ya vista.
3. Precarga al pasar el ratón: en la guía con `use`, llama a `leer` con la URL de la ficha (`/api/setas/<id>`) en el `onMouseEnter` de cada botón. Con 2 s de latencia, pasa el ratón por «Rebozuelo», espera y pulsa. ¿Cuánto tarda ahora la ficha? ¿Por qué no sale al instante?
4. Escribe la forma 1 como Hook propio, `useFichaSeta(setaId)`, que devuelva `{ cargando, error, seta, parecida }`. Después piensa qué cambiaría dentro del Hook, y qué no en los componentes, si mañana usas TanStack Query.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "You Might Not Need an Effect: Fetching data",
      "descripcion": "Por qué pedir datos sí es un efecto, la carrera de la búsqueda, y los problemas que quedan (caché, servidor, cascadas) y que resuelven los frameworks.",
      "url": "https://react.dev/learn/you-might-not-need-an-effect#fetching-data",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Synchronizing with Effects: Fetching data",
      "descripcion": "La limpieza de un efecto que pide datos y el apartado sobre las alternativas: por qué los efectos no se ejecutan en el servidor y cómo crean cascadas.",
      "url": "https://react.dev/learn/synchronizing-with-effects#fetching-data",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "use",
      "descripcion": "La referencia: leer promesas con Suspense, por qué hay que guardarlas en caché, cómo volver a pedirlas con una transición y cómo enseñar sus errores.",
      "url": "https://react.dev/reference/react/use",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "TanStack Query: Overview",
      "descripcion": "Qué problemas del estado del servidor resuelve la librería y su ejemplo más simple con useQuery.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/overview",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "TanStack Query: Performance & Request Waterfalls",
      "descripcion": "Las cascadas a fondo: en un componente, entre componentes anidados y al dividir el código, y cómo aplanarlas.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls",
      "etiqueta": "TanStack"
    },
    {
      "titulo": "TanStack Query: Important Defaults",
      "descripcion": "Lo que hace sin que se lo pidas: datos viejos al llegar, reintentos, refresco al volver a la pestaña y limpieza a los cinco minutos.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults",
      "etiqueta": "TanStack"
    }
  ]
}
```
