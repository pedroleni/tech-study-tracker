# `<Suspense>`: qué mostrar mientras algo carga

- **Módulo:** Asincronía y concurrencia
- **Slug:** `suspense-que-mostrar-mientras-algo-carga` (autogenerado del título)
- **Orden:** 480
- **Fuentes:** [`<Suspense>`](https://react.dev/reference/react/Suspense) — ver `contenido/react/TEMARIO.md` #48

---

## Qué es y para qué sirve

En el módulo 6 cada componente que pedía datos llevaba su propia espera: un estado para la respuesta, un `if` que pintaba «Cargando…» y un efecto que hacía el `fetch` (lección 38). Funciona, pero cada componente decide por su cuenta qué enseñar mientras tanto, y una pantalla con cinco piezas que cargan acaba con cinco «Cargando…» apareciendo y desapareciendo cada uno a su ritmo.

`<Suspense>` le da la vuelta al reparto: **el componente se escribe como si los datos ya estuvieran, y un componente de más arriba decide qué se ve mientras no están.**

```jsx
<Suspense fallback={<p>Cargando la sala…</p>}>
  <FichaSala salaId="cantabrico" />
</Suspense>
```

Mientras `FichaSala` no pueda pintarse, React enseña el `fallback` en su lugar. Cuando todo lo que hay dentro está listo, cambia el fallback por el contenido. Tres palabras que vas a leer mucho, en inglés en la documentación:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién hace qué en una espera",
  "roles": [
    {
      "etiqueta": "Se suspende",
      "rol": "el componente que espera",
      "descripcion": "Le falta algo para pintarse: su código o sus datos. No pinta nada a medias: le dice a React que todavía no puede y React lo intentará otra vez cuando llegue lo que falta."
    },
    {
      "etiqueta": "Límite",
      "rol": "el <Suspense> más cercano por encima",
      "descripcion": "En inglés, Suspense boundary. Recoge la espera de todo lo que tiene dentro, por profundo que esté, y decide qué se ve en su lugar."
    },
    {
      "etiqueta": "Fallback",
      "rol": "lo que se ve mientras tanto",
      "descripcion": "El marcado que el límite pinta en lugar de su contenido: un texto, un esqueleto gris con la forma de lo que viene, un indicador de carga."
    }
  ]
}
```

## Tu primer límite de Suspense

La web del Acuario de la Bahía enseña la ficha de cada sala, que vive en el servidor. `FichaSala` lee la ficha con `use`, que verás a fondo en la lección siguiente: por ahora basta con saber que **`use(promesa)` devuelve el valor de la promesa si ya ha terminado, y si no, suspende el componente**. La función `leer` guarda cada promesa para que todos los intentos de render reciban la misma.

La vista previa usa la API simulada con un segundo y medio de latencia. Pulsa «Arrecife»: verás el fallback mientras llega la ficha. Vuelve a «Cantábrico»: aparece al instante, porque su promesa ya estaba guardada y terminada.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La ficha de cada sala, con su fallback",
  "codigo": "import { Suspense, use, useState } from 'react'\n\n// Caché mínima: misma ruta, misma promesa (lección 49)\nconst cache = new Map()\nfunction leer(ruta) {\n  if (!cache.has(ruta)) {\n    cache.set(ruta, fetch(ruta).then((res) => res.json()))\n  }\n  return cache.get(ruta)\n}\n\nfunction FichaSala({ salaId }) {\n  const sala = use(leer(`/api/salas/${salaId}`))\n\n  return (\n    <section className=\"ficha\">\n      <h2>{sala.nombre}</h2>\n      <p>{sala.descripcion}</p>\n      <p>Agua a {sala.temperatura} °C</p>\n    </section>\n  )\n}\n\nconst SALAS = [\n  { id: 'cantabrico', nombre: 'Cantábrico' },\n  { id: 'arrecife', nombre: 'Arrecife' },\n  { id: 'medusas', nombre: 'Medusas' },\n]\n\nexport default function App() {\n  const [salaId, setSalaId] = useState('cantabrico')\n\n  return (\n    <main>\n      <h1>Acuario de la Bahía</h1>\n      <nav aria-label=\"Salas\">\n        {SALAS.map((sala) => (\n          <button\n            key={sala.id}\n            aria-pressed={sala.id === salaId}\n            onClick={() => setSalaId(sala.id)}\n          >\n            {sala.nombre}\n          </button>\n        ))}\n      </nav>\n      <Suspense fallback={<p className=\"cargando\">Cargando la sala…</p>}>\n        <FichaSala salaId={salaId} />\n      </Suspense>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e7490;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #a5f3fc;\n  border-radius: 8px;\n  background: #ecfeff;\n}\n\n.cargando {\n  color: #475569;\n  font-style: italic;\n}",
  "anotaciones": [
    {
      "fragmento": "const sala = use(leer(`/api/salas/${salaId}`))",
      "nota": "Si la promesa de esta sala aún no ha terminado, FichaSala se suspende aquí mismo: no ejecuta nada de lo que viene después y React busca el Suspense más cercano por encima."
    },
    {
      "fragmento": "<h2>{sala.nombre}</h2>",
      "nota": "Fíjate en lo que no hay: ni estado de carga, ni if, ni efecto. Cuando esta línea se ejecuta, sala ya tiene sus datos."
    },
    {
      "fragmento": "<Suspense fallback={<p className=\"cargando\">Cargando la sala…</p>}>",
      "nota": "El límite. Mientras algo de dentro esté suspendido, pinta el fallback en su lugar; cuando todo está listo, lo cambia por el contenido."
    },
    {
      "fragmento": "<h1>Acuario de la Bahía</h1>",
      "nota": "Lo que queda fuera del límite no espera: el título y los botones se ven desde el primer momento."
    },
    {
      "fragmento": "cache.set(ruta, fetch(ruta).then((res) => res.json()))",
      "nota": "La promesa se guarda por ruta. Cuando React reintenta el render, leer devuelve la misma promesa, ya terminada, y use la lee sin esperar. Sin la caché, cada intento lanzaría una petición nueva."
    }
  ],
  "mostrarConsola": false,
  "api": {
    "salas": [
      {
        "id": "cantabrico",
        "nombre": "Sala del Cantábrico",
        "descripcion": "Agua fría y rocas: lo que vive bajo el puerto.",
        "temperatura": 14
      },
      {
        "id": "arrecife",
        "nombre": "Arrecife tropical",
        "descripcion": "Corales y peces de colores en agua templada.",
        "temperatura": 26
      },
      {
        "id": "medusas",
        "nombre": "Túnel de las medusas",
        "descripcion": "Medusas luna bajo una luz azul.",
        "temperatura": 18
      }
    ],
    "especies": [
      {
        "id": "cantabrico",
        "lista": [
          "Pulpo común",
          "Centollo",
          "Lubina",
          "Estrella de mar"
        ]
      },
      {
        "id": "arrecife",
        "lista": [
          "Pez payaso",
          "Cirujano azul",
          "Pez ángel"
        ]
      },
      {
        "id": "medusas",
        "lista": [
          "Medusa luna",
          "Medusa huevo frito"
        ]
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Al pulsar «Arrecife», el estado cambia, `FichaSala` vuelve a renderizarse con otra sala y se suspende porque esa ficha todavía no ha llegado. El límite, que ya enseñaba una ficha, **vuelve a enseñar su fallback**: una sección más abajo verás qué pasa con lo que había dentro mientras tanto.

## Qué hace que un componente se suspenda

Suspense no adivina que algo está cargando: **solo se activa cuando un componente se suspende**, y eso pasa en unos pocos casos concretos:

- **Código que se descarga con `lazy`.** El componente no existe hasta que llega su archivo. Lo viste de pasada en la lección 13 y es la lección 50.
- **Una promesa leída con `use`**, como la ficha de la sala. Es la lección 49.
- **Librerías y frameworks preparados para Suspense**: TanStack Query con `useSuspenseQuery`, Relay o los cargadores de datos de los frameworks. Por dentro hacen lo mismo que `leer`: guardan las promesas en una caché y llaman a `use`.
- **Una hoja de estilos con `precedence`**: React no enseña el componente hasta que la hoja ha cargado (lección 81).
- **En el servidor**, el HTML que aún no ha llegado en streaming y los componentes que solo pueden pintarse en el navegador, con `use(browser())` (lección 87).

Lo que **no** suspende es lo que ocurre fuera del render: un `fetch` dentro de un efecto o de un manejador de eventos. Para entonces el componente ya se ha pintado, y Suspense no tiene nada que esperar.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Especies({ salaId }) {\n  const [lista, setLista] = useState(null)\n\n  useEffect(() => {\n    fetch(`/api/especies/${salaId}`)\n      .then((res) => res.json())\n      .then((datos) => setLista(datos.lista))\n  }, [salaId])\n\n  if (lista === null) return <p>Contando peces…</p>\n  return <ul>{lista.map((e) => <li key={e}>{e}</li>)}</ul>\n}\n\n// En App:\n<Suspense fallback={<p>Cargando la sala…</p>}>\n  <Especies salaId=\"cantabrico\" />\n</Suspense>\n\n// ¿Qué se ve mientras llega la respuesta?",
  "opciones": [
    "«Cargando la sala…», el fallback del Suspense",
    "«Contando peces…», el texto del propio componente",
    "Nada: la pantalla se queda en blanco",
    "Primero el fallback y después «Contando peces…»"
  ],
  "correcta": 1,
  "explicacion": "Especies no se suspende nunca: se pinta enseguida con lista a null y devuelve su propio aviso. El fetch empieza después, en el efecto, y Suspense no se entera. Para que el límite se active, el componente tiene que leer los datos durante el render, con use o con una librería preparada para Suspense."
}
```

## Sin ningún límite por encima

Cuando un componente se suspende, React sube por el árbol hasta el `<Suspense>` más cercano. ¿Y si no hay ninguno? Entonces **lo que espera es la raíz entera**. Compruébalo en esta versión de la ficha sin ningún `<Suspense>`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha sin ningún límite",
  "consigna": "Pulsa «Reiniciar» y mira la vista previa: un segundo y medio en blanco, ni siquiera el título. Después pulsa «Arrecife» y enseguida «Contar visitante» dos veces: no se mueve nada hasta que llega la sala nueva, y entonces cambian las dos cosas a la vez. La consola no dice nada. Arréglalo envolviendo <FichaSala> en un <Suspense> con un fallback.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaSala from './FichaSala'\nimport './estilos.css'\n\nconst SALAS = [\n  { id: 'cantabrico', nombre: 'Cantábrico' },\n  { id: 'arrecife', nombre: 'Arrecife' },\n  { id: 'medusas', nombre: 'Medusas' },\n]\n\nexport default function App() {\n  const [salaId, setSalaId] = useState('cantabrico')\n  const [visitantes, setVisitantes] = useState(0)\n\n  return (\n    <main>\n      <h1>Acuario de la Bahía</h1>\n      <p>\n        Visitantes hoy: {visitantes}{' '}\n        <button onClick={() => setVisitantes(visitantes + 1)}>Contar visitante</button>\n      </p>\n      <nav aria-label=\"Salas\">\n        {SALAS.map((sala) => (\n          <button\n            key={sala.id}\n            aria-pressed={sala.id === salaId}\n            onClick={() => setSalaId(sala.id)}\n          >\n            {sala.nombre}\n          </button>\n        ))}\n      </nav>\n      <FichaSala salaId={salaId} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FichaSala.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function FichaSala({ salaId }) {\n  const sala = use(leer(`/api/salas/${salaId}`))\n\n  return (\n    <section className=\"ficha\">\n      <h2>{sala.nombre}</h2>\n      <p>{sala.descripcion}</p>\n      <p>Agua a {sala.temperatura} °C</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Una caché mínima de promesas: la misma ruta devuelve siempre la misma\n// promesa. Es lo que hace por dentro una librería de datos con Suspense,\n// y la lección 49 explica por qué hace falta.\nconst cache = new Map()\n\nexport function leer(ruta) {\n  if (!cache.has(ruta)) {\n    const promesa = fetch(ruta).then((res) => {\n      if (!res.ok) throw new Error(`El servidor respondió ${res.status}`)\n      return res.json()\n    })\n    cache.set(ruta, promesa)\n  }\n  return cache.get(ruta)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e7490;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #a5f3fc;\n  border-radius: 8px;\n  background: #ecfeff;\n}\n\n.cargando {\n  color: #475569;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": true,
  "api": {
    "salas": [
      {
        "id": "cantabrico",
        "nombre": "Sala del Cantábrico",
        "descripcion": "Agua fría y rocas: lo que vive bajo el puerto.",
        "temperatura": 14
      },
      {
        "id": "arrecife",
        "nombre": "Arrecife tropical",
        "descripcion": "Corales y peces de colores en agua templada.",
        "temperatura": 26
      },
      {
        "id": "medusas",
        "nombre": "Túnel de las medusas",
        "descripcion": "Medusas luna bajo una luz azul.",
        "temperatura": 18
      }
    ],
    "especies": [
      {
        "id": "cantabrico",
        "lista": [
          "Pulpo común",
          "Centollo",
          "Lubina",
          "Estrella de mar"
        ]
      },
      {
        "id": "arrecife",
        "lista": [
          "Pez payaso",
          "Cirujano azul",
          "Pez ángel"
        ]
      },
      {
        "id": "medusas",
        "lista": [
          "Medusa luna",
          "Medusa huevo frito"
        ]
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Sin límite, React no tiene dónde poner un fallback, así que hace lo único que puede: **esperar sin pintar nada nuevo**. En la primera carga, la página se queda vacía hasta que llegan los datos. En una actualización, sigue enseñando la pantalla anterior, y cualquier otro clic urgente, como «Contar visitante», se queda en la cola detrás de ella. Ni un aviso ni un error en la consola: solo una interfaz que parece colgada.

**El sitio donde pones el límite decide qué parte de la pantalla espera.** Todo lo que queda fuera se pinta y responde con normalidad.

## Un límite para todo, o un límite por nivel

Todo lo que hay dentro de un límite se trata como **una sola pieza**: aunque solo un componente se suspenda, el fallback sustituye a todos, y cuando todos están listos aparecen juntos. Da igual a qué profundidad estén: el que manda es el `<Suspense>` más cercano.

Si quieres que la pantalla se vaya completando por partes, **anida límites**. Cada uno enseña su fallback hasta que su nivel está listo:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Dos límites, dos esperas",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "el título y los botones no esperan"
    },
    {
      "nombre": "Suspense",
      "nivel": 1,
      "etiqueta": "Cargando la sala…"
    },
    {
      "nombre": "FichaSala",
      "nivel": 2,
      "nota": "← use: la ficha de la sala"
    },
    {
      "nombre": "Suspense",
      "nivel": 3,
      "etiqueta": "Buscando especies…"
    },
    {
      "nombre": "Especies",
      "nivel": 4,
      "nota": "← use: la lista de especies"
    }
  ]
}
```

La secuencia es la que describe react.dev: mientras `FichaSala` no está, el primer fallback ocupa todo el hueco; cuando llega la ficha, aparece con el segundo fallback dentro; y cuando llegan las especies, sustituyen a ese segundo fallback.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La ficha y sus especies, por niveles",
  "codigo": "import { Suspense, use, useState } from 'react'\n\nconst cache = new Map()\nfunction leer(ruta) {\n  if (!cache.has(ruta)) {\n    cache.set(ruta, fetch(ruta).then((res) => res.json()))\n  }\n  return cache.get(ruta)\n}\n\nfunction Especies({ salaId }) {\n  const { lista } = use(leer(`/api/especies/${salaId}`))\n  return (\n    <ul>\n      {lista.map((especie) => <li key={especie}>{especie}</li>)}\n    </ul>\n  )\n}\n\nfunction FichaSala({ salaId }) {\n  const sala = use(leer(`/api/salas/${salaId}`))\n\n  return (\n    <section className=\"ficha\">\n      <h2>{sala.nombre}</h2>\n      <p>{sala.descripcion}</p>\n      <h3>Quién vive aquí</h3>\n      <Suspense fallback={<p className=\"cargando\">Buscando especies…</p>}>\n        <Especies salaId={salaId} />\n      </Suspense>\n    </section>\n  )\n}\n\nconst SALAS = [\n  { id: 'cantabrico', nombre: 'Cantábrico' },\n  { id: 'arrecife', nombre: 'Arrecife' },\n  { id: 'medusas', nombre: 'Medusas' },\n]\n\nexport default function App() {\n  const [salaId, setSalaId] = useState('cantabrico')\n\n  return (\n    <main>\n      <h1>Acuario de la Bahía</h1>\n      <nav aria-label=\"Salas\">\n        {SALAS.map((sala) => (\n          <button\n            key={sala.id}\n            aria-pressed={sala.id === salaId}\n            onClick={() => setSalaId(sala.id)}\n          >\n            {sala.nombre}\n          </button>\n        ))}\n      </nav>\n      <Suspense fallback={<p className=\"cargando\">Cargando la sala…</p>}>\n        <FichaSala salaId={salaId} />\n      </Suspense>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e7490;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #a5f3fc;\n  border-radius: 8px;\n  background: #ecfeff;\n}\n\n.cargando {\n  color: #475569;\n  font-style: italic;\n}",
  "anotaciones": [
    {
      "fragmento": "<Suspense fallback={<p className=\"cargando\">Cargando la sala…</p>}>",
      "nota": "El límite de fuera: espera a la ficha. Mientras no llega, ocupa el hueco de la sala entera, especies incluidas."
    },
    {
      "fragmento": "<Suspense fallback={<p className=\"cargando\">Buscando especies…</p>}>",
      "nota": "El límite de dentro: espera solo a la lista. Así la ficha no tiene que esperar a las especies para enseñarse. Sin él, Especies se suspendería contra el límite de fuera y la ficha entera esperaría a lo más lento."
    },
    {
      "fragmento": "const { lista } = use(leer(`/api/especies/${salaId}`))",
      "nota": "Esta petición no empieza hasta que Especies se renderiza, y eso no pasa hasta que ha llegado la ficha. Mira el panel de red al pulsar una sala nueva: la segunda petición arranca cuando termina la primera."
    },
    {
      "fragmento": "<h3>Quién vive aquí</h3>",
      "nota": "Lo que está fuera del límite de dentro pero dentro del de fuera se ve en cuanto llega la ficha, aunque las especies sigan en camino."
    }
  ],
  "mostrarConsola": false,
  "api": {
    "salas": [
      {
        "id": "cantabrico",
        "nombre": "Sala del Cantábrico",
        "descripcion": "Agua fría y rocas: lo que vive bajo el puerto.",
        "temperatura": 14
      },
      {
        "id": "arrecife",
        "nombre": "Arrecife tropical",
        "descripcion": "Corales y peces de colores en agua templada.",
        "temperatura": 26
      },
      {
        "id": "medusas",
        "nombre": "Túnel de las medusas",
        "descripcion": "Medusas luna bajo una luz azul.",
        "temperatura": 18
      }
    ],
    "especies": [
      {
        "id": "cantabrico",
        "lista": [
          "Pulpo común",
          "Centollo",
          "Lubina",
          "Estrella de mar"
        ]
      },
      {
        "id": "arrecife",
        "lista": [
          "Pez payaso",
          "Cirujano azul",
          "Pez ángel"
        ]
      },
      {
        "id": "medusas",
        "lista": [
          "Medusa luna",
          "Medusa huevo frito"
        ]
      }
    ]
  },
  "red": {
    "latencia": 1000
  }
}
```

El panel de red deja ver un efecto secundario de este diseño: una **cascada** (*waterfall*). Las especies no se piden hasta que `Especies` se renderiza, y eso no ocurre hasta que ha llegado la ficha, así que las dos peticiones van una detrás de otra. Cuando los dos componentes son hermanos dentro del mismo límite, React empieza las dos peticiones a la vez. Cómo arrancar antes las peticiones para no esperar en cadena es parte de la lección 52.

Un detalle más que se nota con latencias cortas: **React no revela contenido nuevo más de una vez cada 300 ms**. Si un límite está listo poco después de que otro se haya revelado, no aparece en el acto: React espera a que pasen 300 ms desde la última revelación, y todos los límites que estén listos para entonces aparecen juntos. Así la pantalla no da un salto tras otro.

**No pongas un límite alrededor de cada componente.** Cada límite es un estado de carga que el usuario va a ver; si hay quince, la página parpadea por todas partes mientras se completa. Piensa en la secuencia de carga que quieres que se vea y pon un límite por cada paso de esa secuencia, ni uno más. Si trabajas con alguien de diseño, pregúntale: los estados de carga suelen estar ya en sus bocetos.

## Cuando lo que ya se veía vuelve a esperar

En el primer ejemplo, al pulsar otra sala, la ficha anterior desaparecía tras el fallback. Pero **esconder no es desmontar**: React oculta el contenido con `display: none`, enseña el fallback a su lado y conserva todo lo que había dentro, estado incluido. Cuando llega la sala nueva, quita el fallback y vuelve a enseñar el contenido.

Este bloque tiene activado el árbol de renders para que lo veas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Lo que se esconde conserva su estado",
  "consigna": "Pulsa «Contar un pez» tres veces y después «Arrecife». Mientras se ve el fallback, mira el árbol: FichaSala y ContadorPeces siguen ahí, sin desmontarse. Cuando llega la sala, el contador sigue en 3, aunque ya es otra sala. Ahora añade key={salaId} al Suspense de App.jsx y repite: el árbol desmonta el límite viejo, monta uno nuevo y el contador vuelve a 0.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport FichaSala from './FichaSala'\nimport ContadorPeces from './ContadorPeces'\nimport './estilos.css'\n\nconst SALAS = [\n  { id: 'cantabrico', nombre: 'Cantábrico' },\n  { id: 'arrecife', nombre: 'Arrecife' },\n  { id: 'medusas', nombre: 'Medusas' },\n]\n\nexport default function App() {\n  const [salaId, setSalaId] = useState('cantabrico')\n\n  return (\n    <main>\n      <h1>Acuario de la Bahía</h1>\n      <nav aria-label=\"Salas\">\n        {SALAS.map((sala) => (\n          <button\n            key={sala.id}\n            aria-pressed={sala.id === salaId}\n            onClick={() => setSalaId(sala.id)}\n          >\n            {sala.nombre}\n          </button>\n        ))}\n      </nav>\n      <Suspense fallback={<p className=\"cargando\">Cargando la sala…</p>}>\n        <FichaSala salaId={salaId} />\n        <ContadorPeces />\n      </Suspense>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ContadorPeces.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ContadorPeces() {\n  const [peces, setPeces] = useState(0)\n\n  return (\n    <p>\n      Peces contados en esta sala: {peces}{' '}\n      <button onClick={() => setPeces(peces + 1)}>Contar un pez</button>\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "FichaSala.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function FichaSala({ salaId }) {\n  const sala = use(leer(`/api/salas/${salaId}`))\n\n  return (\n    <section className=\"ficha\">\n      <h2>{sala.nombre}</h2>\n      <p>{sala.descripcion}</p>\n      <p>Agua a {sala.temperatura} °C</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Una caché mínima de promesas: la misma ruta devuelve siempre la misma\n// promesa. Es lo que hace por dentro una librería de datos con Suspense,\n// y la lección 49 explica por qué hace falta.\nconst cache = new Map()\n\nexport function leer(ruta) {\n  if (!cache.has(ruta)) {\n    const promesa = fetch(ruta).then((res) => {\n      if (!res.ok) throw new Error(`El servidor respondió ${res.status}`)\n      return res.json()\n    })\n    cache.set(ruta, promesa)\n  }\n  return cache.get(ruta)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e7490;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #a5f3fc;\n  border-radius: 8px;\n  background: #ecfeff;\n}\n\n.cargando {\n  color: #475569;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "mostrarArbol": true,
  "api": {
    "salas": [
      {
        "id": "cantabrico",
        "nombre": "Sala del Cantábrico",
        "descripcion": "Agua fría y rocas: lo que vive bajo el puerto.",
        "temperatura": 14
      },
      {
        "id": "arrecife",
        "nombre": "Arrecife tropical",
        "descripcion": "Corales y peces de colores en agua templada.",
        "temperatura": 26
      },
      {
        "id": "medusas",
        "nombre": "Túnel de las medusas",
        "descripcion": "Medusas luna bajo una luz azul.",
        "temperatura": 18
      }
    ],
    "especies": [
      {
        "id": "cantabrico",
        "lista": [
          "Pulpo común",
          "Centollo",
          "Lubina",
          "Estrella de mar"
        ]
      },
      {
        "id": "arrecife",
        "lista": [
          "Pez payaso",
          "Cirujano azul",
          "Pez ángel"
        ]
      },
      {
        "id": "medusas",
        "lista": [
          "Medusa luna",
          "Medusa huevo frito"
        ]
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Esconder en vez de desmontar tiene sentido: si el usuario había escrito algo o abierto un desplegable dentro del límite, no lo pierde porque una parte tenga que esperar. Hay una excepción pensada para los efectos que miden el DOM: mientras el contenido está oculto, **React ejecuta la limpieza de sus `useLayoutEffect`** (un elemento con `display: none` no tiene tamaño que medir) y los vuelve a ejecutar al enseñarlo. Los `useEffect` normales no se tocan.

Ojo con lo contrario: si un componente se suspende **antes de haberse montado nunca**, React no guarda nada de ese intento. Cuando llega lo que faltaba, lo renderiza otra vez desde cero. Es justo lo que obliga a guardar las promesas en una caché, y lo verás en la lección 49.

### Que no se vea el fallback: una transición

Volver a enseñar el fallback sobre algo que el usuario ya estaba viendo resulta brusco: la ficha desaparece y vuelve a aparecer. React tiene otra forma de hacer la actualización: **marcarla como transición**. Así le dices que no es urgente y que prefieres seguir viendo lo anterior hasta que lo nuevo esté listo:

```jsx
import { startTransition } from 'react'

function elegirSala(id) {
  startTransition(() => {
    setSalaId(id)
  })
}
```

Con esto, al pulsar otra sala la ficha anterior sigue a la vista hasta que llega la nueva, y entonces se cambia de golpe. Una transición **solo evita esconder lo que ya se veía**: un `<Suspense>` que aparece por primera vez enseña su fallback igualmente. `startTransition`, `useTransition` (que además te dice si hay una transición en marcha, para atenuar la ficha o poner «Cargando…» en el botón) y `useDeferredValue` son la lección 51. Los routers preparados para Suspense hacen sus navegaciones dentro de una transición, así que es el comportamiento que te encontrarás al cambiar de página.

### Que sí se vea: reiniciar el límite con `key`

A veces lo que viene es **otro contenido**, no una versión nueva del mismo: la página de otra sala, el perfil de otra persona. Ahí dejar la ficha anterior durante la espera confunde, porque parece que el botón no ha hecho nada. La salida es la de la lección 26: **una `key` distinta convierte el límite en otro límite**.

```jsx
<Suspense key={salaId} fallback={<p className="cargando">Cargando la sala…</p>}>
  <FichaSala salaId={salaId} />
</Suspense>
```

Para React, el `<Suspense>` con `key="arrecife"` es nuevo: desmonta el anterior con todo su estado y monta uno que todavía no ha enseñado nada, así que enseña su fallback incluso dentro de una transición. La `key` puede ir en el propio `<Suspense>` o en cualquier componente por encima de él. Según react.dev, un router integrado con Suspense debería hacer esto por ti al cambiar de página.

En resumen, cuando un límite que ya enseñaba algo vuelve a suspenderse:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Con una actualización normal (un clic, una tecla)",
      "texto": "React esconde el contenido con display: none y enseña el fallback. Lo escondido conserva su estado; solo se limpian sus useLayoutEffect hasta que vuelve a verse."
    },
    {
      "titulo": "Dentro de una transición",
      "texto": "No esconde nada: sigue enseñando lo anterior hasta que lo nuevo está listo. Los límites que aparecen por primera vez sí enseñan su fallback. Lección 51."
    },
    {
      "titulo": "Con una key distinta",
      "texto": "Es otro límite: el anterior se desmonta con su estado y el nuevo enseña su fallback, haya transición o no."
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
      "titulo": "Con una librería o un framework de datos",
      "texto": "Es el caso más común: TanStack Query con useSuspenseQuery, los cargadores de React Router o Next.js. La librería suspende y tú decides con Suspense dónde se ve la espera. La lección 52 compara esta forma de pedir datos con un efecto."
    },
    {
      "titulo": "Para el código que se carga bajo demanda",
      "texto": "Cada pantalla o panel cargado con lazy necesita un Suspense por encima que enseñe algo mientras llega su archivo (lección 50)."
    },
    {
      "titulo": "Para ordenar cómo aparece una página",
      "texto": "Un límite alrededor de lo principal y otros anidados para lo secundario: comentarios, recomendaciones, estadísticas. La página se puede usar antes y se completa por partes, sin saltos sueltos."
    },
    {
      "titulo": "Con renderizado en el servidor",
      "texto": "Cada límite es un trozo que el servidor puede mandar más tarde por streaming, con su fallback en el HTML inicial mientras tanto (lección 87)."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Si pides los datos en un efecto, Suspense no te sirve: el componente gestiona su propio «Cargando…». Y no envuelvas cada componente en su límite: son estados de carga que el usuario tiene que ver."
    }
  ]
}
```

## Errores típicos

**Poner el `<Suspense>` dentro del componente que se suspende.** Parece lo natural: el componente que espera se envuelve a sí mismo.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function FichaSala({ salaId }) {\n  const sala = use(leer(`/api/salas/${salaId}`))\n\n  return (\n    <Suspense fallback={<p>Cargando la sala…</p>}>\n      <h2>{sala.nombre}</h2>\n    </Suspense>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Acuario de la Bahía</h1>\n      <FichaSala salaId=\"cantabrico\" />\n    </main>\n  )\n}\n\n// ¿Qué se ve mientras llega la ficha?",
  "opciones": [
    "«Acuario de la Bahía» y debajo «Cargando la sala…»",
    "Solo «Cargando la sala…»",
    "Nada, ni siquiera el título",
    "Un error que pide un Suspense"
  ],
  "correcta": 2,
  "explicacion": "Quien se suspende es FichaSala, en la línea del use, antes de llegar a su return: ese Suspense todavía no existe. React busca un límite por encima de FichaSala, no encuentra ninguno y espera la raíz entera, título incluido, sin ningún mensaje. El límite tiene que estar en el padre o más arriba."
}
```

**El límite tiene que estar por encima del componente que se suspende**: en su padre o más arriba.

**Esperar que un `fetch` en un efecto active el fallback.** Ya lo has visto en la predicción: el componente se pinta antes de que empiece la petición, y Suspense no se entera.

**Crear la promesa durante el render.** Si `FichaSala` hiciera `use(fetch(...).then(...))` directamente, cada intento de render crearía una petición nueva y el fallback no se iría nunca. Por eso los ejemplos guardan las promesas con `leer`. La lección 49 enseña qué pasa exactamente y cómo evitarlo.

**Un fallback que parpadea en cada tecla.** Si un buscador lee los resultados con `use` y el texto que escribes es estado normal, cada tecla es una actualización urgente que vuelve a esconder la lista tras el fallback. La lección 51 lo arregla con `useDeferredValue`, que deja la lista anterior a la vista mientras llegan los resultados nuevos.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Suspense enseña el fallback mientras haya cualquier carga dentro",
      "realidad": "Solo si algo se suspende: código con lazy, una promesa leída con use, una librería preparada para Suspense o una hoja de estilos con precedence. Un fetch en un efecto no lo activa."
    },
    {
      "mito": "Sin ningún Suspense, React da un error",
      "realidad": "No dice nada. La raíz entera espera: página en blanco en la primera carga e interfaz congelada en cada actualización que se suspende, con los demás clics en cola."
    },
    {
      "mito": "Cuando vuelve el fallback, lo de dentro se desmonta",
      "realidad": "Se esconde con display: none y conserva su estado. Solo se reinicia si el límite cambia de key o desaparece del árbol."
    },
    {
      "mito": "Cuantos más límites, mejor experiencia",
      "realidad": "Cada límite es un estado de carga visible. Pon los que correspondan a la secuencia de carga que quieres enseñar, no uno por componente."
    }
  ]
}
```

## Ejercicios

**1. La ficha de cada animal.** La página «Conoce a nuestros animales» enseña la ficha de un animal y, dentro, su horario de comidas: dos peticiones, una dentro de otra. Ahora mismo no tiene ningún límite y se queda en blanco hasta que llega todo. Las comprobaciones usan la API simulada con 300 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha de cada animal, por niveles",
  "consigna": "Añade dos límites de Suspense. En App.jsx, uno alrededor de <FichaAnimal> con el fallback «Buscando al animal…», para que el título y los botones se vean desde el principio. En FichaAnimal.jsx, otro alrededor de <HorarioComidas> con el fallback «Consultando el horario…», para que la ficha no espere al horario. Usa className=\"cargando\" en los dos fallbacks.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaAnimal from './FichaAnimal'\nimport './estilos.css'\n\nconst ANIMALES = [\n  { id: 'pulpo', nombre: 'Pulpo común' },\n  { id: 'tortuga', nombre: 'Tortuga boba' },\n  { id: 'medusa', nombre: 'Medusa luna' },\n]\n\nexport default function App() {\n  const [animalId, setAnimalId] = useState('pulpo')\n\n  return (\n    <main>\n      <h1>Conoce a nuestros animales</h1>\n      <nav aria-label=\"Animales\">\n        {ANIMALES.map((animal) => (\n          <button\n            key={animal.id}\n            aria-pressed={animal.id === animalId}\n            onClick={() => setAnimalId(animal.id)}\n          >\n            {animal.nombre}\n          </button>\n        ))}\n      </nav>\n      {/* Mientras llega el animal, aquí debe verse «Buscando al animal…» */}\n      <FichaAnimal animalId={animalId} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FichaAnimal.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\nimport HorarioComidas from './HorarioComidas'\n\nexport default function FichaAnimal({ animalId }) {\n  const animal = use(leer(`/api/animales/${animalId}`))\n\n  return (\n    <section className=\"ficha\">\n      <h2>{animal.nombre}</h2>\n      <p>{animal.descripcion}</p>\n      <p>Lo encontrarás en: {animal.sala}</p>\n      <h3>Horario de comidas</h3>\n      {/* Mientras llega el horario, aquí debe verse «Consultando el horario…» */}\n      <HorarioComidas animalId={animalId} />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "HorarioComidas.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function HorarioComidas({ animalId }) {\n  const { horario } = use(leer(`/api/comidas/${animalId}`))\n\n  return (\n    <ul>\n      {horario.map((toma) => (\n        <li key={toma}>{toma}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Una caché mínima de promesas: la misma ruta devuelve siempre la misma\n// promesa. Es lo que hace por dentro una librería de datos con Suspense,\n// y la lección 49 explica por qué hace falta.\nconst cache = new Map()\n\nexport function leer(ruta) {\n  if (!cache.has(ruta)) {\n    const promesa = fetch(ruta).then((res) => {\n      if (!res.ok) throw new Error(`El servidor respondió ${res.status}`)\n      return res.json()\n    })\n    cache.set(ruta, promesa)\n  }\n  return cache.get(ruta)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e7490;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #a5f3fc;\n  border-radius: 8px;\n  background: #ecfeff;\n}\n\n.cargando {\n  color: #475569;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "api": {
    "animales": [
      {
        "id": "pulpo",
        "nombre": "Pulpo común",
        "descripcion": "Ocho brazos, tres corazones y un escondite distinto cada semana.",
        "sala": "Sala del Cantábrico"
      },
      {
        "id": "tortuga",
        "nombre": "Tortuga boba",
        "descripcion": "Llegó herida en una red de pesca y aquí se recupera.",
        "sala": "Arrecife tropical"
      },
      {
        "id": "medusa",
        "nombre": "Medusa luna",
        "descripcion": "Sin cerebro ni corazón: casi todo su cuerpo es agua.",
        "sala": "Túnel de las medusas"
      }
    ],
    "comidas": [
      {
        "id": "pulpo",
        "horario": [
          "10:30 · cangrejos",
          "17:00 · mejillones"
        ]
      },
      {
        "id": "tortuga",
        "horario": [
          "11:00 · calamar",
          "16:30 · lechuga de mar"
        ]
      },
      {
        "id": "medusa",
        "horario": [
          "12:00 · plancton"
        ]
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Mientras llega el animal, se ve «Buscando al animal…»",
      "pasos": [],
      "espera": {
        "texto": "Buscando al animal…"
      }
    },
    {
      "descripcion": "Cuando llega la ficha, el horario enseña «Consultando el horario…» mientras carga",
      "pasos": [],
      "espera": {
        "texto": "Consultando el horario…"
      }
    },
    {
      "descripcion": "Al final aparece el horario de comidas del pulpo",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "10:30 · cangrejos"
      }
    },
    {
      "descripcion": "Al elegir «Tortuga boba», aparece su horario",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "10:30 · cangrejos"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Tortuga boba"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "16:30 · lechuga de mar"
      }
    }
  ]
}
```

**2. Cada sala es otra página.** Esta versión cambia de sala dentro de una transición, así que al pulsar otra sala la ficha anterior se queda a la vista hasta que llega la nueva. Para la ficha de una misma sala que se actualiza sería lo correcto, pero aquí cada sala es otro contenido: quien pulsa «Arrecife» y sigue viendo el Cantábrico cree que el botón no funciona.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Que cada sala nueva enseñe su espera",
  "consigna": "Pulsa «Arrecife» y fíjate en que la ficha del Cantábrico se queda a la vista durante la espera. Sin quitar la transición, haz que al cambiar de sala se vea «Cargando la sala…» mientras llega la nueva. Basta con un atributo en App.jsx.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, startTransition, useState } from 'react'\nimport FichaSala from './FichaSala'\nimport './estilos.css'\n\nconst SALAS = [\n  { id: 'cantabrico', nombre: 'Cantábrico' },\n  { id: 'arrecife', nombre: 'Arrecife' },\n  { id: 'medusas', nombre: 'Medusas' },\n]\n\nexport default function App() {\n  const [salaId, setSalaId] = useState('cantabrico')\n\n  function elegirSala(id) {\n    // Una transición: mientras llega la sala nueva, sigue a la vista\n    // la anterior (lección 51). No la quites.\n    startTransition(() => {\n      setSalaId(id)\n    })\n  }\n\n  return (\n    <main>\n      <h1>Acuario de la Bahía</h1>\n      <nav aria-label=\"Salas\">\n        {SALAS.map((sala) => (\n          <button\n            key={sala.id}\n            aria-pressed={sala.id === salaId}\n            onClick={() => elegirSala(sala.id)}\n          >\n            {sala.nombre}\n          </button>\n        ))}\n      </nav>\n      <Suspense fallback={<p className=\"cargando\">Cargando la sala…</p>}>\n        <FichaSala salaId={salaId} />\n      </Suspense>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "FichaSala.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function FichaSala({ salaId }) {\n  const sala = use(leer(`/api/salas/${salaId}`))\n\n  return (\n    <section className=\"ficha\">\n      <h2>{sala.nombre}</h2>\n      <p>{sala.descripcion}</p>\n      <p>Agua a {sala.temperatura} °C</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Una caché mínima de promesas: la misma ruta devuelve siempre la misma\n// promesa. Es lo que hace por dentro una librería de datos con Suspense,\n// y la lección 49 explica por qué hace falta.\nconst cache = new Map()\n\nexport function leer(ruta) {\n  if (!cache.has(ruta)) {\n    const promesa = fetch(ruta).then((res) => {\n      if (!res.ok) throw new Error(`El servidor respondió ${res.status}`)\n      return res.json()\n    })\n    cache.set(ruta, promesa)\n  }\n  return cache.get(ruta)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nnav {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e7490;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #a5f3fc;\n  border-radius: 8px;\n  background: #ecfeff;\n}\n\n.cargando {\n  color: #475569;\n  font-style: italic;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "mostrarConsola": false,
  "api": {
    "salas": [
      {
        "id": "cantabrico",
        "nombre": "Sala del Cantábrico",
        "descripcion": "Agua fría y rocas: lo que vive bajo el puerto.",
        "temperatura": 14
      },
      {
        "id": "arrecife",
        "nombre": "Arrecife tropical",
        "descripcion": "Corales y peces de colores en agua templada.",
        "temperatura": 26
      },
      {
        "id": "medusas",
        "nombre": "Túnel de las medusas",
        "descripcion": "Medusas luna bajo una luz azul.",
        "temperatura": 18
      }
    ],
    "especies": [
      {
        "id": "cantabrico",
        "lista": [
          "Pulpo común",
          "Centollo",
          "Lubina",
          "Estrella de mar"
        ]
      },
      {
        "id": "arrecife",
        "lista": [
          "Pez payaso",
          "Cirujano azul",
          "Pez ángel"
        ]
      },
      {
        "id": "medusas",
        "lista": [
          "Medusa luna",
          "Medusa huevo frito"
        ]
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparece la ficha de la Sala del Cantábrico",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Sala del Cantábrico"
      }
    },
    {
      "descripcion": "Al pulsar «Arrecife», se ve «Cargando la sala…» mientras llega la nueva",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Sala del Cantábrico"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Arrecife"
          }
        }
      ],
      "espera": {
        "texto": "Cargando la sala…"
      }
    },
    {
      "descripcion": "Al pulsar «Arrecife», acaba apareciendo su ficha",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Sala del Cantábrico"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Arrecife"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Arrecife tropical"
      }
    },
    {
      "descripcion": "Al pulsar «Medusas», se ve «Cargando la sala…» mientras llega la nueva",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Sala del Cantábrico"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Medusas"
          }
        }
      ],
      "espera": {
        "texto": "Cargando la sala…"
      }
    },
    {
      "descripcion": "Al pulsar «Medusas», acaba apareciendo su ficha",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Sala del Cantábrico"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Medusas"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Túnel de las medusas"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En la ficha de cada animal, cambia el fallback de fuera por un esqueleto: un recuadro gris con la forma de la ficha (un título y dos líneas de texto vacías, hechas con CSS). Comprueba con la latencia a 3 s que la página no da un salto al llegar los datos.
2. En tu solución de la ficha de cada animal, quita el `<Suspense>` de dentro y sube la latencia a 2 s: ¿cuánto tarda ahora en verse la ficha? Vuelve a ponerlo y compara. ¿Cuándo preferirías que la ficha y el horario aparecieran juntos?
3. En el mismo ejercicio, saca `<HorarioComidas>` de `FichaAnimal` y ponlo como hermano de `<FichaAnimal>` dentro del límite de `App`. Mira en el panel de red cuándo empieza cada petición: ¿ha desaparecido la cascada? ¿Qué has perdido a cambio?
4. En el bloque del contador de peces, mueve `ContadorPeces` fuera del `<Suspense>`. ¿Qué pasa ahora al cambiar de sala, con y sin la `key`? ¿Dónde lo pondrías si el contador fuera del día entero y no de cada sala?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<Suspense>",
      "descripcion": "La referencia de esta lección: qué activa un límite, revelar junto o por niveles, evitar que se esconda lo que ya se veía, reiniciar con key y las esperas de hojas de estilo, fuentes e imágenes.",
      "url": "https://react.dev/reference/react/Suspense",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "use",
      "descripcion": "La API con la que un componente lee una promesa y se suspende. Es la lección 49.",
      "url": "https://react.dev/reference/react/use",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "lazy",
      "descripcion": "Cargar el código de un componente bajo demanda, con un Suspense por encima. Es la lección 50.",
      "url": "https://react.dev/reference/react/lazy",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "startTransition",
      "descripcion": "Marcar una actualización como no urgente para no esconder lo que ya se ve. Es la lección 51.",
      "url": "https://react.dev/reference/react/startTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "TanStack Query: Suspense",
      "descripcion": "Cómo se usa Suspense con una librería de datos real: useSuspenseQuery y sus errores con un error boundary.",
      "url": "https://tanstack.com/query/latest/docs/framework/react/guides/suspense",
      "etiqueta": "TanStack"
    }
  ]
}
```
