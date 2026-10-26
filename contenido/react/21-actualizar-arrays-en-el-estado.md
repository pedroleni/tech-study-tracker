# Actualizar arrays en el estado

- **Módulo:** Interactividad
- **Slug:** `actualizar-arrays-en-el-estado` (autogenerado del título)
- **Orden:** 210
- **Fuentes:** [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) — ver `contenido/react/TEMARIO.md` #21

---

## Qué es y para qué sirve

Casi toda interfaz tiene alguna lista que cambia: la cola de canciones de un karaoke, los productos de un carrito, las tareas pendientes, los comentarios de una entrada. En React, esa lista vive en el estado como un array, y la gente la cambia: añade, quita, marca, reordena.

Un array es un objeto, así que vale todo lo que viste en la lección 20: **trata el array del estado como si fuera de solo lectura y, para cambiarlo, pásale a la función `set` un array nuevo**. React compara el valor nuevo y el anterior con `Object.is`; si le das el mismo array, aunque lo hayas cambiado por dentro, no se entera.

La dificultad está en que muchos métodos de array que usas a diario **cambian el array sobre el que los llamas**: `push`, `splice`, `sort`... Esta lección es la caja de herramientas: para cada operación, la forma de hacerla sin tocar el original.

## Qué métodos mutan y cuáles devuelven un array nuevo

En la lección 12 separaste los métodos de array en dos grupos: los que cambian el original y los que devuelven uno nuevo. Ahora toca ordenarlos por lo que quieres hacer. En el estado, evita la columna del medio y usa la de la derecha:

| Para… | Muta el original | Devuelve un array nuevo |
|---|---|---|
| Añadir | `push`, `unshift` | `[...lista, x]`, `[x, ...lista]` |
| Quitar | `pop`, `shift`, `splice` | `filter`, `slice`, `toSpliced` |
| Cambiar un elemento | `lista[i] = x`, `splice` | `map`, `with` |
| Insertar en medio | `splice` | `toSpliced`, `slice` con spread |
| Ordenar | `sort` | `toSorted` |
| Dar la vuelta | `reverse` | `toReversed` |

Cuatro de esos métodos son recientes: **`toSorted`, `toReversed`, `toSpliced` y `with`** llegaron a JavaScript en 2023 como las versiones que copian de `sort`, `reverse`, `splice` y la asignación `lista[i] = x`. Funcionan en todos los navegadores desde julio de 2023.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "const cola = ['Mediterráneo', 'Bailando', 'La flaca']\n\ncola.toSorted()                    // ['Bailando', 'La flaca', 'Mediterráneo']\ncola.toReversed()                  // ['La flaca', 'Bailando', 'Mediterráneo']\ncola.with(1, 'Insurrección')       // ['Mediterráneo', 'Insurrección', 'La flaca']\ncola.toSpliced(1, 1)               // ['Mediterráneo', 'La flaca']\ncola.toSpliced(1, 0, 'Chiquilla')  // ['Mediterráneo', 'Chiquilla', 'Bailando', 'La flaca']\n\ncola                               // ['Mediterráneo', 'Bailando', 'La flaca']: intacto",
  "anotaciones": [
    {
      "fragmento": "cola.toSorted()",
      "nota": "Como sort, admite una función de comparación, pero devuelve un array nuevo ordenado y deja cola como estaba."
    },
    {
      "fragmento": "cola.toReversed()",
      "nota": "La versión de reverse que no toca el original."
    },
    {
      "fragmento": "cola.with(1, 'Insurrección')",
      "nota": "Una copia con la posición 1 sustituida. Es lo que harías con cola[1] = ..., sin mutar. Acepta índices negativos, que cuentan desde el final, y lanza un RangeError si la posición no existe."
    },
    {
      "fragmento": "cola.toSpliced(1, 1)",
      "nota": "Los mismos argumentos que splice: desde qué posición, cuántos quitar y qué meter. La diferencia es lo que devuelve: splice devuelve los elementos quitados y cambia el array; toSpliced devuelve el array resultante, nuevo."
    },
    {
      "fragmento": "cola.toSpliced(1, 0, 'Chiquilla')",
      "nota": "Con 0 elementos que quitar, toSpliced inserta: Chiquilla entra en la posición 1 y el resto se desplaza."
    },
    {
      "fragmento": "cola                               // ['Mediterráneo', 'Bailando', 'La flaca']: intacto",
      "nota": "Después de las cinco llamadas, cola sigue igual. Cada una ha creado su propio array."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "slice y splice no son lo mismo",
  "contenido": "Se escriben casi igual y hacen cosas opuestas. slice copia un trozo del array y no lo toca. splice mete o quita elementos en el propio array y devuelve los que ha quitado. Con el estado casi siempre quieres slice, o toSpliced si lo que buscabas era el comportamiento de splice."
}
```

## Añadir: al final o al principio

Para añadir, en vez de `push`, crea un array nuevo con el spread: todos los elementos de antes y el nuevo detrás. Para ponerlo delante, el mismo truco al revés. En este karaoke, cada canción que se apunta recibe su `id` **al crearse**, con `crypto.randomUUID()`, como viste en la lección 11: nunca al pintar.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Apuntarse al karaoke: al final de la cola o la primera",
  "codigo": "import { useState } from 'react'\n\nfunction crearCancion(titulo) {\n  return { id: crypto.randomUUID(), titulo }\n}\n\nconst COLA_INICIAL = [crearCancion('Mediterráneo'), crearCancion('La flaca')]\n\nexport default function App() {\n  const [cola, setCola] = useState(COLA_INICIAL)\n  const [titulo, setTitulo] = useState('')\n  const sinTitulo = titulo.trim() === ''\n\n  function apuntar() {\n    setCola([...cola, crearCancion(titulo)])\n    setTitulo('')\n  }\n\n  function apuntarLaPrimera() {\n    setCola([crearCancion(titulo), ...cola])\n    setTitulo('')\n  }\n\n  return (\n    <main>\n      <h1>Karaoke del bar Gramola</h1>\n      <label>\n        Canción\n        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button onClick={apuntar} disabled={sinTitulo}>Apuntar</button>\n        <button onClick={apuntarLaPrimera} disabled={sinTitulo}>Apuntar la primera</button>\n      </div>\n      <ol>\n        {cola.map((cancion) => (\n          <li key={cancion.id}>{cancion.titulo}</li>\n        ))}\n      </ol>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nol {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\nli button {\n  margin-left: 0.5rem;\n}\n",
  "anotaciones": [
    {
      "fragmento": "return { id: crypto.randomUUID(), titulo }",
      "nota": "El id nace con la canción, una sola vez. Las dos iniciales lo reciben al cargar el módulo; las nuevas, al pulsar el botón. El map solo lo lee."
    },
    {
      "fragmento": "setCola([...cola, crearCancion(titulo)])",
      "nota": "Un array nuevo con todas las canciones de antes y la nueva al final. Hace lo que harías con push, sin tocar cola."
    },
    {
      "fragmento": "setCola([crearCancion(titulo), ...cola])",
      "nota": "El mismo truco al revés: la nueva delante y las de antes detrás. Sustituye a unshift."
    },
    {
      "fragmento": "setTitulo('')",
      "nota": "Después de apuntar, el campo se vacía. Son dos actualizaciones en el mismo manejador, y React las agrupa en un solo render (lección 19)."
    },
    {
      "fragmento": "disabled={sinTitulo}",
      "nota": "Sin título no se apunta nada: los dos botones se desactivan mientras el campo esté vacío o solo tenga espacios."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

`cola.concat(nueva)` también devuelve un array nuevo; el spread es más habitual porque sirve igual para el principio, el final o en medio. Y si actualizas con la forma de función de la lección 19, el patrón es el mismo: `setCola((c) => [...c, nueva])`.

## Quitar: `filter`

La forma más sencilla de quitar un elemento es **quedarte con todos los demás**. `filter` crea un array nuevo con los que cumplen la condición, y la condición más útil es «su id no es el que quiero quitar». Para quitar por posición, `slice`: `cola.slice(1)` es la cola sin la primera.

En la lista, cada canción tiene su botón «Quitar». Como hay varios con el mismo texto, cada uno lleva un `aria-label` que dice cuál quita («Quitar La flaca»): un lector de pantalla los distingue, y las comprobaciones también.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La cola del karaoke: quitar canciones",
  "consigna": "Quita alguna canción con su botón, pasa a la siguiente con «Siguiente canción» y vuelve al principio con «Reiniciar la cola». Después añade un botón «Quitar la última» que saque la última canción sin mutar la cola: con slice o con toSpliced, nada de pop. Si después de quitar, «Reiniciar la cola» no recupera la última, algo estás mutando. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst COLA_INICIAL = [\n  { id: crypto.randomUUID(), titulo: 'Mediterráneo' },\n  { id: crypto.randomUUID(), titulo: 'La flaca' },\n  { id: crypto.randomUUID(), titulo: 'Insurrección' },\n  { id: crypto.randomUUID(), titulo: 'Bailando' },\n]\n\nexport default function App() {\n  const [cola, setCola] = useState(COLA_INICIAL)\n\n  function quitar(id) {\n    setCola(cola.filter((cancion) => cancion.id !== id))\n  }\n\n  function siguiente() {\n    setCola(cola.slice(1))\n  }\n\n  // Escribe aquí quitarLaUltima\n\n  return (\n    <main>\n      <h1>Karaoke del bar Gramola</h1>\n      {cola.length > 0 ? <p>Ahora canta: {cola[0].titulo}</p> : <p>La cola está vacía</p>}\n      <div className=\"acciones\">\n        <button onClick={siguiente}>Siguiente canción</button>\n        <button onClick={() => setCola(COLA_INICIAL)}>Reiniciar la cola</button>\n        {/* Añade aquí el botón «Quitar la última» */}\n      </div>\n      <ol>\n        {cola.map((cancion) => (\n          <li key={cancion.id}>\n            {cancion.titulo}\n            <button aria-label={`Quitar ${cancion.titulo}`} onClick={() => quitar(cancion.id)}>\n              Quitar\n            </button>\n          </li>\n        ))}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nol {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\nli button {\n  margin-left: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Quitar la última», Bailando sale de la cola",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar la última"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Bailando"
        }
      }
    },
    {
      "descripcion": "Las demás canciones siguen en la cola",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar la última"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Insurrección"
      }
    },
    {
      "descripcion": "Pulsar dos veces quita las dos últimas",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar la última"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar la última"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Insurrección"
        }
      }
    },
    {
      "descripcion": "Después de quitar la última, «Reiniciar la cola» la recupera",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar la última"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reiniciar la cola"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Bailando"
      }
    }
  ]
}
```

`cola.slice(0, -1)` copia desde el principio hasta la penúltima; `cola.toSpliced(-1, 1)` quita una desde la última posición. Las dos devuelven un array nuevo. `cola.pop()` también quitaría la última, pero de la cola del estado, y devolvería la canción quitada, no la cola.

## Cambiar elementos: `map`

Para cambiar uno o varios elementos, `map` crea un array nuevo del mismo tamaño, y tú decides qué va en cada posición. En este karaoke se vota la canción favorita para que suba en la cola. Votar cambia **una** canción; «Votos a cero», **todas**:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Votar una canción, o poner todas a cero",
  "codigo": "import { useState } from 'react'\n\nconst COLA_INICIAL = [\n  { id: crypto.randomUUID(), titulo: 'Mediterráneo', votos: 2 },\n  { id: crypto.randomUUID(), titulo: 'La flaca', votos: 0 },\n  { id: crypto.randomUUID(), titulo: 'Bailando', votos: 1 },\n]\n\nexport default function App() {\n  const [cola, setCola] = useState(COLA_INICIAL)\n\n  function votar(id) {\n    setCola(\n      cola.map((cancion) =>\n        cancion.id === id ? { ...cancion, votos: cancion.votos + 1 } : cancion,\n      ),\n    )\n  }\n\n  function votosACero() {\n    setCola(cola.map((cancion) => ({ ...cancion, votos: 0 })))\n  }\n\n  return (\n    <main>\n      <h1>Karaoke del bar Gramola</h1>\n      <div className=\"acciones\">\n        <button onClick={votosACero}>Votos a cero</button>\n      </div>\n      <ol>\n        {cola.map((cancion) => (\n          <li key={cancion.id}>\n            {cancion.titulo}: {cancion.votos} {cancion.votos === 1 ? 'voto' : 'votos'}\n            <button aria-label={`Votar ${cancion.titulo}`} onClick={() => votar(cancion.id)}>\n              +1\n            </button>\n          </li>\n        ))}\n      </ol>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nol {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\nli button {\n  margin-left: 0.5rem;\n}\n",
  "anotaciones": [
    {
      "fragmento": "cola.map((cancion) =>",
      "nota": "map recorre la cola y devuelve un array nuevo, del mismo tamaño, con lo que devuelva la función para cada canción."
    },
    {
      "fragmento": "{ ...cancion, votos: cancion.votos + 1 }",
      "nota": "La canción votada se sustituye por un objeto nuevo: sus mismos datos, con un voto más. Es la copia con spread de la lección 20, ahora dentro de un map."
    },
    {
      "fragmento": ": cancion,",
      "nota": "Las demás se devuelven tal cual, el mismo objeto. No hace falta copiar lo que no cambia: así React, y más adelante memo, ven que esas canciones siguen igual."
    },
    {
      "fragmento": "({ ...cancion, votos: 0 })",
      "nota": "Para cambiarlas todas, cada una es un objeto nuevo. Los paréntesis hacen falta: sin ellos, las llaves serían el cuerpo de la función flecha."
    },
    {
      "fragmento": "{cancion.votos === 1 ? 'voto' : 'votos'}",
      "nota": "Un detalle de los de la lección 10: con un voto, en singular."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Si conoces la **posición** en vez del id, `with` hace lo mismo para un solo elemento: `cola.with(indice, { ...cola[indice], votos: cola[indice].votos + 1 })`. En las listas que cambian de orden, el id es más seguro: la posición de una canción cambia en cuanto alguien se apunta delante.

Fíjate en lo que **no** sirve: `cancion.votos++` dentro del `map`, o `cola[0].votos = 5`. Las dos cambian un objeto que ya está en el estado, aunque el array que devuelve `map` sea nuevo. Lo verás en vivo un poco más abajo.

## Insertar en medio: `slice` con spread, o `toSpliced`

A veces el elemento nuevo no va ni al principio ni al final: en el karaoke, alguien pide cantar justo después de la canción que suena. `slice` corta la cola en dos trozos y el spread los junta con la canción nueva en medio. Antes de verlo escrito en un manejador, compruébalo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const cola = ['Mediterráneo', 'La flaca', 'Bailando']\n\nconst nuevaCola = [\n  ...cola.slice(0, 1),\n  'Chiquilla',\n  ...cola.slice(1),\n]\n\nconsole.log(nuevaCola)",
  "opciones": [
    "['Chiquilla', 'Mediterráneo', 'La flaca', 'Bailando']",
    "['Mediterráneo', 'Chiquilla', 'La flaca', 'Bailando']",
    "['Mediterráneo', 'Chiquilla', 'Bailando']",
    "['Mediterráneo', 'La flaca', 'Chiquilla', 'Bailando']"
  ],
  "correcta": 1,
  "explicacion": "cola.slice(0, 1) es el trozo antes de la posición 1, solo Mediterráneo. cola.slice(1) es todo desde la posición 1, La flaca y Bailando. Entre los dos trozos va Chiquilla, así que queda en la posición 1 y no se pierde nada. cola no cambia."
}
```

En un manejador queda así, con las dos versiones equivalentes:

```jsx
function apuntarDetrasDeLaActual(titulo) {
  const nueva = crearCancion(titulo)

  // Con slice y spread
  setCola([...cola.slice(0, 1), nueva, ...cola.slice(1)])

  // O, lo mismo, con toSpliced: en la posición 1, quita 0 y mete nueva
  // setCola(cola.toSpliced(1, 0, nueva))
}
```

`toSpliced` es más corto y se lee bien si ya conoces `splice`; `slice` con spread funciona también en navegadores anteriores a 2023. Elige una y sé coherente.

## Ordenar y dar la vuelta sin mutar

`sort` y `reverse` cambian el array sobre el que los llamas. Tienes dos salidas:

- **Los métodos que copian**: `cola.toSorted(comparar)` y `cola.toReversed()`.
- **Copiar y después ordenar la copia**: `[...cola].sort(comparar)`. Es la mutación local de la lección 20: el array del spread acaba de nacer y nadie más lo ve.

Para ordenar textos, la comparación por defecto de `sort` (y de `toSorted`) compara códigos de carácter, y las vocales con tilde o la Ñ acaban detrás de la Z. `localeCompare` con el idioma `'es'` compara como un diccionario:

```js
const paradas = ['Zamora', 'Ávila', 'Logroño', 'Écija']

paradas.toSorted()                                     // ['Logroño', 'Zamora', 'Ávila', 'Écija']
paradas.toSorted((a, b) => a.localeCompare(b, 'es'))   // ['Ávila', 'Écija', 'Logroño', 'Zamora']
```

Y una idea que ahorra mucho estado: **a menudo no hace falta guardar la lista ordenada**. Guarda la cola en el orden en que llegó y, aparte, el criterio elegido; la vista ordenada se calcula en cada render. Con `toSorted` es seguro hacerlo durante el render, porque no toca la cola; con `sort` estarías mutando el estado en pleno render, el fallo de la liga de la lección 12.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La cola guarda el orden de llegada; la vista ordenada se calcula",
  "codigo": "import { useState } from 'react'\n\nconst COLA = [\n  { id: crypto.randomUUID(), titulo: 'Mediterráneo', votos: 2 },\n  { id: crypto.randomUUID(), titulo: 'Bailando', votos: 5 },\n  { id: crypto.randomUUID(), titulo: 'La flaca', votos: 3 },\n  { id: crypto.randomUUID(), titulo: 'Chiquilla', votos: 1 },\n]\n\nexport default function App() {\n  // En la app completa, la cola cambiaría al apuntar, quitar y votar\n  const [cola] = useState(COLA)\n  const [orden, setOrden] = useState('llegada')\n\n  let visibles = cola\n  if (orden === 'votos') {\n    visibles = cola.toSorted((a, b) => b.votos - a.votos)\n  } else if (orden === 'titulo') {\n    visibles = cola.toSorted((a, b) => a.titulo.localeCompare(b.titulo, 'es'))\n  } else if (orden === 'al-reves') {\n    visibles = cola.toReversed()\n  }\n\n  return (\n    <main>\n      <h1>Karaoke del bar Gramola</h1>\n      <label>\n        Ordenar por\n        <select value={orden} onChange={(e) => setOrden(e.target.value)}>\n          <option value=\"llegada\">Orden de llegada</option>\n          <option value=\"al-reves\">De la última a la primera</option>\n          <option value=\"votos\">Más votadas</option>\n          <option value=\"titulo\">Título</option>\n        </select>\n      </label>\n      <ol>\n        {visibles.map((cancion) => (\n          <li key={cancion.id}>\n            {cancion.titulo} ({cancion.votos})\n          </li>\n        ))}\n      </ol>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nol {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\nli button {\n  margin-left: 0.5rem;\n}\n",
  "anotaciones": [
    {
      "fragmento": "const [orden, setOrden] = useState('llegada')",
      "nota": "El estado guarda el criterio, no una segunda copia ordenada de la cola. Así no hay dos listas que mantener de acuerdo."
    },
    {
      "fragmento": "visibles = cola.toSorted((a, b) => b.votos - a.votos)",
      "nota": "La vista ordenada se calcula en cada render. toSorted devuelve un array nuevo y deja cola intacta, así que el componente sigue siendo puro."
    },
    {
      "fragmento": "a.titulo.localeCompare(b.titulo, 'es')",
      "nota": "Para textos, localeCompare con el idioma es: tildes y eñes en su sitio, como en un diccionario."
    },
    {
      "fragmento": "visibles = cola.toReversed()",
      "nota": "Dar la vuelta, también sin tocar cola. Vuelve a Orden de llegada y la cola sigue como estaba, porque nadie la ha cambiado."
    },
    {
      "fragmento": "<li key={cancion.id}>",
      "nota": "La key es el id, no la posición: al reordenar, React mueve cada li con su canción (lección 11)."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Cuando el orden sí tiene que guardarse, porque la persona arrastra canciones o pulsa «Subir», se guarda el array reordenado: `setCola(cola.toSorted(comparar))`. Lo que no se hace nunca es `setCola(cola.sort(comparar))`, y en los errores típicos verás por qué.

## Objetos dentro de arrays: copiar el array no basta

Un array no contiene los objetos: **apunta a ellos**, igual que la ficha de la lección 20 apuntaba a su contacto. Por eso `[...lista]` crea un array nuevo, pero con **los mismos objetos dentro**. Y dos listas distintas pueden apuntar a los mismos objetos sin que lo parezca.

Marta y Pablo preparan un viaje a Granada y cada uno marca lo que ya ha visitado. Las dos listas empiezan con los mismos lugares, y eso está bien: compartir objetos no es un problema, **mutarlos sí**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos listas que comparten lugares",
  "consigna": "Marca La Alhambra en la lista de Marta y mira la de Pablo. Después desmarca el mirador de San Nicolás en la de Pablo. Luego arregla los dos manejadores para que cada lista vaya por libre: con map, y un objeto nuevo con spread solo para el lugar que cambia.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst LUGARES = [\n  { id: 'alhambra', nombre: 'La Alhambra', visitado: false },\n  { id: 'albaicin', nombre: 'El Albaicín', visitado: false },\n  { id: 'san-nicolas', nombre: 'El mirador de San Nicolás', visitado: true },\n  { id: 'sacromonte', nombre: 'El Sacromonte', visitado: false },\n]\n\nfunction ListaLugares({ lugares, onAlternar }) {\n  return (\n    <ul>\n      {lugares.map((lugar) => (\n        <li key={lugar.id}>\n          <label>\n            <input\n              type=\"checkbox\"\n              checked={lugar.visitado}\n              onChange={(e) => onAlternar(lugar.id, e.target.checked)}\n            />\n            {lugar.nombre}\n          </label>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [deMarta, setDeMarta] = useState(LUGARES)\n  const [dePablo, setDePablo] = useState(LUGARES)\n\n  function alternarDeMarta(id, visitado) {\n    const copia = [...deMarta]\n    const lugar = copia.find((l) => l.id === id)\n    lugar.visitado = visitado\n    setDeMarta(copia)\n  }\n\n  function alternarDePablo(id, visitado) {\n    const copia = [...dePablo]\n    const lugar = copia.find((l) => l.id === id)\n    lugar.visitado = visitado\n    setDePablo(copia)\n  }\n\n  return (\n    <main>\n      <h1>Qué ver en Granada</h1>\n      <div className=\"columnas\">\n        <section>\n          <h2>Lo que ha visto Marta</h2>\n          <ListaLugares lugares={deMarta} onAlternar={alternarDeMarta} />\n        </section>\n        <section>\n          <h2>Lo que ha visto Pablo</h2>\n          <ListaLugares lugares={dePablo} onAlternar={alternarDePablo} />\n        </section>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));\n  gap: 1rem;\n}\n\nh2 {\n  margin: 0 0 0.4rem;\n  font-size: 1rem;\n}\n\nul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nlabel {\n  display: flex;\n  gap: 0.4rem;\n  align-items: center;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Al marcar La Alhambra en la lista de Marta, aparece marcada también en la de Pablo. `copia` es un array nuevo, así que hay render, pero `lugar` es **el mismo objeto** que está en `LUGARES`, en `deMarta` y en `dePablo`. Al cambiar `lugar.visitado` lo has cambiado para todos, y el render que provoca `setDeMarta` lo pinta en las dos columnas.

El arreglo es el `map` de antes: un objeto nuevo para el lugar que cambia y los demás tal cual.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// Mal: el array es nuevo, el objeto de dentro no\nfunction alternarDeMarta(id, visitado) {\n  const copia = [...deMarta]\n  const lugar = copia.find((l) => l.id === id)\n  lugar.visitado = visitado\n  setDeMarta(copia)\n}\n\n// Bien: un objeto nuevo para el lugar que cambia\nfunction alternarDeMarta(id, visitado) {\n  setDeMarta(\n    deMarta.map((lugar) => (lugar.id === id ? { ...lugar, visitado } : lugar)),\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const copia = [...deMarta]",
      "nota": "Copia superficial: un array nuevo cuyos elementos son los mismos objetos que los de deMarta, y que los de dePablo."
    },
    {
      "fragmento": "lugar.visitado = visitado",
      "nota": "La mutación. lugar es un objeto compartido por las dos listas y por LUGARES: cambiarlo aquí lo cambia en todas partes."
    },
    {
      "fragmento": "{ ...lugar, visitado }",
      "nota": "Un lugar nuevo con lo de antes y el valor de visitado cambiado. visitado sola es la forma abreviada de visitado: visitado."
    },
    {
      "fragmento": ": lugar)),",
      "nota": "Los lugares que no cambian siguen siendo los mismos objetos, compartidos con la lista de Pablo. No pasa nada: nadie los muta."
    }
  ]
}
```

La regla de la lección 20 se aplica igual aquí: **solo puedes mutar lo que acabas de crear**. La canción nueva que vas a añadir, sí; una que ya está en la cola, no.

### Arrays dentro de objetos, y objetos dentro de arrays dentro de objetos

Las dos lecciones se combinan. Si una ficha tiene un array de etiquetas, para añadir una se copia la ficha y, dentro, el array:

```js
setFicha({ ...ficha, etiquetas: [...ficha.etiquetas, 'Veterana'] })
```

Y para cambiar un objeto de un array que está dentro de otro objeto, se copia cada nivel del camino: la ficha, el array (con `map`) y el objeto que cambia. Cuantos más niveles, más copias; si la cuenta empieza a marear, es señal de que conviene un estado más plano (lección 24) o Immer.

## Immer también con arrays

Con `useImmer` (lección 20), sobre el borrador puedes usar `push`, `splice`, `sort` o asignar propiedades de un elemento: Immer construye el array nuevo y los objetos nuevos por ti, y comparte con la versión anterior todo lo que no tocaste.

```jsx
actualizarLugares((borrador) => {
  const lugar = borrador.find((l) => l.id === id)
  lugar.visitado = visitado
})
```

## Errores típicos

**Usar lo que devuelve un método que muta.** Muchos métodos que mutan devuelven algo que no es el array. ¿Qué pasa al pulsar «Apuntar» aquí?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [cola, setCola] = useState([\n  { id: crypto.randomUUID(), titulo: 'Mediterráneo' },\n  { id: crypto.randomUUID(), titulo: 'La flaca' },\n])\n\nfunction apuntar() {\n  setCola(cola.push({ id: crypto.randomUUID(), titulo: 'Bailando' }))\n}\n\n// ...y en el JSX:\n// <ol>{cola.map((cancion) => <li key={cancion.id}>{cancion.titulo}</li>)}</ol>",
  "opciones": [
    "Bailando aparece al final de la cola",
    "No pasa nada: React no ve el cambio",
    "La vista previa se rompe con un error",
    "La cola se vacía"
  ],
  "correcta": 2,
  "explicacion": "push añade Bailando al array del estado y devuelve su nueva longitud, el número 3. setCola(3) cambia el estado a un número, y en el siguiente render cola.map no existe: el render falla con «cola.map is not a function». Con el spread, setCola([...cola, nueva]), recibe un array nuevo."
}
```

Lo mismo con `setCola(cola.shift())`, que deja en el estado la canción quitada en vez de la cola. El caso más traicionero es el de `sort`, porque sí devuelve el array... **el mismo**:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un botón de ordenar que no ordena... hasta que votas",
  "consigna": "Pulsa «Ordenar por votos»: no pasa nada. Ahora vota cualquier canción con su +1 y mira el orden de la cola. Después arregla ordenarPorVotos con toSorted y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst COLA_INICIAL = [\n  { id: crypto.randomUUID(), titulo: 'Bailando', votos: 2 },\n  { id: crypto.randomUUID(), titulo: 'Mediterráneo', votos: 5 },\n  { id: crypto.randomUUID(), titulo: 'La flaca', votos: 3 },\n]\n\nexport default function App() {\n  const [cola, setCola] = useState(COLA_INICIAL)\n\n  function ordenarPorVotos() {\n    setCola(cola.sort((a, b) => b.votos - a.votos))\n  }\n\n  function votar(id) {\n    setCola(\n      cola.map((cancion) =>\n        cancion.id === id ? { ...cancion, votos: cancion.votos + 1 } : cancion,\n      ),\n    )\n  }\n\n  return (\n    <main>\n      <h1>Karaoke del bar Gramola</h1>\n      <div className=\"acciones\">\n        <button onClick={ordenarPorVotos}>Ordenar por votos</button>\n      </div>\n      <ol>\n        {cola.map((cancion) => (\n          <li key={cancion.id}>\n            {cancion.titulo} ({cancion.votos})\n            <button aria-label={`Votar ${cancion.titulo}`} onClick={() => votar(cancion.id)}>\n              +1\n            </button>\n          </li>\n        ))}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nol {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding-left: 1.5rem;\n}\n\nli button {\n  margin-left: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

`cola.sort(...)` ordena el array del estado y lo devuelve. `setCola` recibe el mismo array que ya tenía, `Object.is` dice que no ha cambiado y React ignora la actualización. Pero la cola ya está ordenada por dentro, y en cuanto votas, el `map` copia ese array ordenado y el render lo enseña de golpe. Es el marcador de la lección 20 en versión array.

**Confundir `splice` con `slice`.** Aquí, «Siguiente canción» debería quitar la primera:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [cola, setCola] = useState([\n  { id: crypto.randomUUID(), titulo: 'Mediterráneo' },\n  { id: crypto.randomUUID(), titulo: 'La flaca' },\n  { id: crypto.randomUUID(), titulo: 'Bailando' },\n])\n\nfunction siguiente() {\n  setCola(cola.splice(0, 1))\n}\n\n// Pulsas «Siguiente canción» una vez. ¿Qué queda en la cola?",
  "opciones": [
    "La flaca y Bailando",
    "Solo Mediterráneo",
    "Las tres: no cambia nada",
    "Ninguna: la cola se vacía"
  ],
  "correcta": 1,
  "explicacion": "splice(0, 1) quita Mediterráneo del array del estado, mutándolo, y devuelve un array con lo que ha quitado: [Mediterráneo]. Ese es el array que recibe setCola, así que la cola se queda justo con la canción que querías quitar. Con cola.slice(1) obtienes La flaca y Bailando sin tocar nada."
}
```

**Copiar el array y mutar los objetos.** `[...lista]` o `lista.slice()` no copian los objetos de dentro. Si después cambias una propiedad de uno, mutas el estado, como en la lista de Granada. Para cambiar un elemento: `map` y un objeto nuevo.

**Usar el índice como `key` en una lista que se reordena o se filtra.** Al quitar o reordenar, lo que hay dentro de cada `li` (el texto de un campo, una casilla) se queda en la posición y no viaja con su dato. Lo viste en la lección 11: la `key` sale del id del dato.

**Generar el id al pintar.** `key={crypto.randomUUID()}` estrena una key en cada render y React rehace toda la lista. El id se genera una vez, al crear el elemento, y se guarda con él.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si copio el array con spread, puedo cambiar lo que hay dentro",
      "realidad": "El spread copia el array, no los objetos: la copia apunta a los mismos. Cambiar una propiedad de un elemento sigue siendo mutar el estado. Para eso está map con un objeto nuevo."
    },
    {
      "mito": "Para quitar un elemento hay que buscar su índice",
      "realidad": "Con filter y el id basta: te quedas con todos los demás. El índice solo hace falta para operaciones por posición, como insertar en medio o quitar la última."
    },
    {
      "mito": "toSorted, toSpliced y with son demasiado nuevos para usarlos",
      "realidad": "Funcionan en todos los navegadores desde julio de 2023. Si tu proyecto tiene que dar soporte a navegadores más antiguos, copia con spread y ordena la copia."
    },
    {
      "mito": "map, filter y el spread son lentos porque lo copian todo",
      "realidad": "Crean un array nuevo, pero no copian los objetos de dentro, solo sus referencias. Para las listas de una interfaz es poco trabajo, y es justo lo que React necesita para ver el cambio."
    }
  ]
}
```

## Ejercicios

Una lista de la compra con lo justo: añadir productos, marcarlos como comprados, quitarlos y ordenarlos. Debajo, una línea con lo que queda por comprar, en el orden de la lista. Las cuatro funciones que cambian la lista están vacías.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lista de la compra sin mutaciones",
  "consigna": "Escribe las cuatro funciones vacías sin mutar nada. agregar añade al final un producto hecho con crearProducto. alternar marca o desmarca uno con map y spread. quitar lo saca con filter. ordenar coloca la lista de la A a la Z con toSorted y localeCompare, para que los Ñoquis queden entre la Leche y el Pan. «Empezar de nuevo» ya funciona: si después de añadir, ordenar o marcar no deja la lista como al principio, algo estás mutando. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction crearProducto(nombre) {\n  return { id: crypto.randomUUID(), nombre, comprado: false }\n}\n\nconst LISTA_INICIAL = ['Pan', 'Ñoquis', 'Leche', 'Aceite'].map(crearProducto)\n\nexport default function App() {\n  const [lista, setLista] = useState(LISTA_INICIAL)\n  const [nombre, setNombre] = useState('')\n\n  const pendientes = lista.filter((producto) => !producto.comprado)\n\n  function agregar() {\n    // Añade al final un producto nuevo, creado con crearProducto(nombre)\n    setNombre('')\n  }\n\n  function alternar(id) {\n    // Marca o desmarca como comprado el producto con ese id\n  }\n\n  function quitar(id) {\n    // Quita de la lista el producto con ese id\n  }\n\n  function ordenar() {\n    // Ordena la lista de la A a la Z, con la Ñ en su sitio\n  }\n\n  return (\n    <main>\n      <h1>Lista de la compra</h1>\n      <label className=\"campo\">\n        Producto\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <div className=\"acciones\">\n        <button onClick={agregar}>Añadir</button>\n        <button onClick={ordenar}>Ordenar de la A a la Z</button>\n        <button onClick={() => setLista(LISTA_INICIAL)}>Empezar de nuevo</button>\n      </div>\n      <ul>\n        {lista.map((producto) => (\n          <li key={producto.id} className={producto.comprado ? 'comprado' : undefined}>\n            <label>\n              <input\n                type=\"checkbox\"\n                checked={producto.comprado}\n                onChange={() => alternar(producto.id)}\n              />\n              {producto.nombre}\n            </label>\n            <button aria-label={`Quitar ${producto.nombre}`} onClick={() => quitar(producto.id)}>\n              Quitar\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p className=\"resumen\">Por comprar: {pendientes.map((producto) => producto.nombre).join(', ')}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\n.campo {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\n.campo input {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #a8a29e;\n  border-radius: 6px;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.3rem 0.5rem;\n  border: 1px solid #e7e5e4;\n  border-radius: 8px;\n}\n\nli label {\n  display: flex;\n  gap: 0.4rem;\n  align-items: center;\n}\n\n.comprado label {\n  color: #78716c;\n  text-decoration: line-through;\n}\n\n.resumen {\n  margin-top: 0.75rem;\n  font-weight: bold;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al escribir «Huevos» y pulsar «Añadir», los huevos aparecen al final",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Producto",
            "texto": "Huevos"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        }
      ],
      "espera": {
        "texto": "Por comprar: Pan, Ñoquis, Leche, Aceite, Huevos"
      }
    },
    {
      "descripcion": "Al marcar «Leche», deja de estar por comprar",
      "pasos": [
        {
          "pulsar": {
            "etiqueta": "Leche"
          }
        }
      ],
      "espera": {
        "texto": "Por comprar: Pan, Ñoquis, Aceite"
      }
    },
    {
      "descripcion": "Al pulsar «Quitar Pan», el pan sale de la lista",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar Pan"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Pan"
        }
      }
    },
    {
      "descripcion": "Al ordenar, la lista queda de la A a la Z con los Ñoquis antes del Pan",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ordenar de la A a la Z"
          }
        }
      ],
      "espera": {
        "texto": "Por comprar: Aceite, Leche, Ñoquis, Pan"
      }
    },
    {
      "descripcion": "Tras añadir, «Empezar de nuevo» deja la lista como al principio",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Producto",
            "texto": "Huevos"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar de nuevo"
          }
        }
      ],
      "espera": {
        "texto": "Por comprar: Pan, Ñoquis, Leche, Aceite"
      }
    },
    {
      "descripcion": "Tras ordenar y marcar, «Empezar de nuevo» deja la lista como al principio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ordenar de la A a la Z"
          }
        },
        {
          "pulsar": {
            "etiqueta": "Leche"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar de nuevo"
          }
        }
      ],
      "espera": {
        "texto": "Por comprar: Pan, Ñoquis, Leche, Aceite"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade un botón «Quitar los comprados» que deje en la lista solo lo que falta por comprar.
2. Añade a cada producto los botones «Subir» y «Bajar», que lo intercambien con el de al lado. Pista: localiza su posición con `findIndex` y construye el array nuevo con `with` dos veces, o con `toSpliced`. ¿Qué tiene que pasar con el primero al pulsar «Subir»?
3. Guarda una cantidad en cada producto, con botones «+» y «−». Cuando la cantidad llegue a 0, el producto sale de la lista. Pista: es un `map` o un `filter`, según el caso.
4. Añade «Deshacer»: antes de cada cambio, guarda la lista actual en un estado `historial` (`[...historial, lista]`) y, al deshacer, recupera la última y quítala del historial. Piensa por qué funciona sin copiar nada más: ninguna versión anterior se ha mutado.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Updating Arrays in State",
      "descripcion": "La página de react.dev en la que se basa esta lección: añadir, quitar, transformar, insertar y ordenar, objetos dentro de arrays e Immer.",
      "url": "https://react.dev/learn/updating-arrays-in-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Array: copying methods and mutating methods",
      "descripcion": "La tabla de MDN que pone, frente a cada método que muta, su alternativa que devuelve una copia.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Array.prototype.toSorted()",
      "descripcion": "El sort que no muta, con su función de comparación y ejemplos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Array.prototype.toSpliced()",
      "descripcion": "Insertar, quitar y sustituir por posición devolviendo un array nuevo.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Array.prototype.with()",
      "descripcion": "Sustituir un elemento por su posición sin tocar el original, índices negativos incluidos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with",
      "etiqueta": "MDN"
    },
    {
      "titulo": "String.prototype.localeCompare()",
      "descripcion": "Comparar textos según las reglas de un idioma, para ordenar con tildes y eñes en su sitio.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare",
      "etiqueta": "MDN"
    }
  ]
}
```
