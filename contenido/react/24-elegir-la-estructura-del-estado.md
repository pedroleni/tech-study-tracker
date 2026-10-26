# Elegir la estructura del estado

- **Módulo:** Gestionar el estado
- **Slug:** `elegir-la-estructura-del-estado` (autogenerado del título)
- **Orden:** 240
- **Fuentes:** [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) — ver `contenido/react/TEMARIO.md` #24

---

## Qué es y para qué sirve

Desde la lección 16 sabes declarar estado con `useState`. Lo que aún no has tenido que decidir es **cuántas variables de estado crear y qué forma darles**. Un mismo formulario se puede escribir con tres `useState` o con uno; con un booleano por cada situación o con un texto que diga en cuál estás; guardando el producto elegido entero o solo su `id`.

Todas esas versiones pueden funcionar el primer día. La diferencia llega después: **cuando el estado guarda lo mismo en dos sitios, o admite combinaciones que no tienen sentido, cada cambio es una ocasión para que esos sitios dejen de estar de acuerdo**. Y ese desacuerdo no da ningún error: la pantalla, sencillamente, enseña algo falso.

React no te impone ninguna estructura, pero su documentación propone cinco principios. Los cinco persiguen lo mismo: que el estado sea fácil de actualizar sin equivocarte. Es la idea con la que se diseña una base de datos: cada dato, en un solo sitio.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "1. Agrupa lo que cambia a la vez",
      "texto": "Si dos variables de estado se actualizan siempre juntas, como las dos coordenadas de una posición, únelas en una sola. Así no puedes cambiar una y olvidarte de la otra."
    },
    {
      "titulo": "2. Evita las contradicciones",
      "texto": "Si varias variables pueden llevarse la contraria, como dos booleanos que nunca deberían ser true a la vez, sustitúyelas por una sola que solo admita valores válidos."
    },
    {
      "titulo": "3. Evita el estado redundante",
      "texto": "Si un dato se puede calcular durante el render a partir de las props o de otro estado, no lo guardes en el estado: calcúlalo."
    },
    {
      "titulo": "4. Evita los duplicados",
      "texto": "Si el mismo dato vive en dos variables, o dentro de dos objetos, mantenerlos de acuerdo es cosa tuya. Guarda el dato una vez y, donde lo necesites, su id."
    },
    {
      "titulo": "5. Evita anidar demasiado",
      "texto": "Un estado con muchos niveles es incómodo de actualizar. Si te cuesta, aplánalo: un objeto con todas las piezas indexadas por id, como una tabla."
    }
  ]
}
```

La documentación de React lo resume parafraseando a Einstein: **haz tu estado tan simple como se pueda, pero no más**. Vas a ver cada principio con un ejemplo que funciona... hasta que deja de funcionar.

## Agrupa el estado que cambia a la vez

Un robot aspirador recorre el salón, una cuadrícula de 5 columnas por 4 filas. Su posición son dos números, y hay dos formas de guardarlos:

```jsx
// Dos variables
const [columna, setColumna] = useState(1)
const [fila, setFila] = useState(1)

// Una variable con un objeto
const [posicion, setPosicion] = useState({ columna: 1, fila: 1 })
```

Las dos son válidas. Este robot usa la primera. Llévalo a algún sitio y pulsa «Volver a la base»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un robot con la posición en dos variables",
  "consigna": "Baja dos casillas, ve dos a la derecha y pulsa «Volver a la base». ¿Llega? Busca el fallo y arréglalo sustituyendo columna y fila por una sola variable, posicion, que guarde un objeto { columna, fila }.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst COLUMNAS = 5\nconst FILAS = 4\n\nfunction limitar(valor, maximo) {\n  return Math.min(maximo, Math.max(1, valor))\n}\n\nexport default function App() {\n  const [columna, setColumna] = useState(1)\n  const [fila, setFila] = useState(1)\n\n  function mover(pasoColumna, pasoFila) {\n    setColumna(limitar(columna + pasoColumna, COLUMNAS))\n    setFila(limitar(fila + pasoFila, FILAS))\n  }\n\n  function volverALaBase() {\n    setColumna(1)\n  }\n\n  return (\n    <main>\n      <h1>Robot aspirador</h1>\n      <div className=\"salon\" aria-hidden=\"true\">\n        <div className=\"base\">Base</div>\n        <div className=\"robot\" style={{ gridColumn: columna, gridRow: fila }} />\n      </div>\n      <p>El robot está en la columna {columna}, fila {fila}.</p>\n      <div className=\"mandos\">\n        <button onClick={() => mover(0, -1)}>Arriba</button>\n        <button onClick={() => mover(0, 1)}>Abajo</button>\n        <button onClick={() => mover(-1, 0)}>Izquierda</button>\n        <button onClick={() => mover(1, 0)}>Derecha</button>\n        <button onClick={volverALaBase}>Volver a la base</button>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.salon {\n  display: grid;\n  grid-template-columns: repeat(5, 3rem);\n  grid-template-rows: repeat(4, 3rem);\n  width: max-content;\n  border: 2px solid #78716c;\n  border-radius: 6px;\n  background-color: #f5f5f4;\n  background-image: linear-gradient(#d6d3d1 1px, transparent 1px),\n    linear-gradient(90deg, #d6d3d1 1px, transparent 1px);\n  background-size: 3rem 3rem;\n}\n\n.base {\n  grid-column: 1;\n  grid-row: 1;\n  display: grid;\n  place-items: end center;\n  font-size: 0.7rem;\n  color: #57534e;\n}\n\n.robot {\n  width: 2.2rem;\n  height: 2.2rem;\n  margin: auto;\n  border-radius: 50%;\n  background: #0f766e;\n  box-shadow: inset 0 0 0 4px #5eead4;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.4rem 0.7rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El robot vuelve a la columna 1, pero se queda en la fila 3: `volverALaBase` cambia la columna y se olvida de la fila. Arreglarlo con un `setFila(1)` es fácil; lo que interesa es por qué ha pasado. Columna y fila cambian **siempre juntas**, pero viven separadas, así que cada sitio que mueve el robot tiene que acordarse de las dos.

**Si dos variables de estado cambian siempre a la vez, júntalas en una.** Con un objeto, cada actualización escribe la posición completa y no hay forma de dejarla a medias:

```jsx
const BASE = { columna: 1, fila: 1 }

// Dentro de App:
const [posicion, setPosicion] = useState(BASE)

function mover(pasoColumna, pasoFila) {
  setPosicion({
    columna: limitar(posicion.columna + pasoColumna, COLUMNAS),
    fila: limitar(posicion.fila + pasoFila, FILAS),
  })
}

function volverALaBase() {
  setPosicion(BASE)
}
```

Por el mismo motivo agruparás en un array o en un objeto los datos de los que **no sabes cuántos habrá**: los campos que el usuario añade a un formulario, las paradas de una ruta, las líneas de un pedido.

Agrupar tiene un precio que ya conoces de la lección 20: **un objeto en el estado se sustituye entero**. `setPosicion` no mezcla lo que le pasas con lo que había; lo que no pongas en el objeto nuevo, desaparece.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [posicion, setPosicion] = useState({ columna: 1, fila: 1 })\n\nfunction moverDerecha() {\n  setPosicion({ columna: posicion.columna + 1 })\n}\n\nreturn (\n  <>\n    <p>Columna {posicion.columna}, fila {posicion.fila}</p>\n    <button onClick={moverDerecha}>Derecha</button>\n  </>\n)\n\n// Pulsas «Derecha» una vez. ¿Qué dice el párrafo?",
  "opciones": [
    "Columna 2, fila 1",
    "Columna 2, fila (y nada más)",
    "Columna 2, fila undefined",
    "Nada: salta el error «Cannot read properties of undefined»"
  ],
  "correcta": 1,
  "explicacion": "El objeto nuevo solo tiene columna: fila ha desaparecido del estado, y undefined no pinta nada en JSX. Si después hicieras posicion.fila + 1, saldría «fila NaN», y el robot de arriba, que usa la fila en su style, haría que React avisara en la consola: «NaN is an invalid value for the gridRow css style property» (NaN no es un valor válido para gridRow). Hay que copiar el resto: setPosicion({ ...posicion, columna: posicion.columna + 1 })."
}
```

Agrupar tampoco es una regla para todo. Si dos datos cambian **por separado**, como el texto de un buscador y si el menú lateral está abierto, meterlos en el mismo objeto solo te obliga a copiar el otro en cada actualización. El criterio no es que estén relacionados por el tema, sino **que cambien a la vez**.

## Evita las contradicciones

En la lavandería La Burbuja cada lavadora pasa por tres fases, y cada fase tiene su piloto. Esta versión guarda cada fase en un booleano:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lavadora con tres booleanos",
  "consigna": "Pulsa «Poner en marcha», «Centrifugar» y «Terminar», en ese orden, y mira los pilotos. Después intenta poner otra colada.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [lavando, setLavando] = useState(false)\n  const [centrifugando, setCentrifugando] = useState(false)\n  const [terminada, setTerminada] = useState(false)\n\n  function ponerEnMarcha() {\n    setTerminada(false)\n    setLavando(true)\n  }\n\n  function centrifugar() {\n    setCentrifugando(true)\n  }\n\n  function terminar() {\n    setCentrifugando(false)\n    setTerminada(true)\n  }\n\n  const encendidos = [\n    lavando && 'Lavado',\n    centrifugando && 'Centrifugado',\n    terminada && 'Fin',\n  ].filter(Boolean)\n\n  return (\n    <main>\n      <h1>Lavandería La Burbuja · Lavadora 3</h1>\n      <ul className=\"pilotos\">\n        <li className={lavando ? 'encendido' : ''}>Lavado</li>\n        <li className={centrifugando ? 'encendido' : ''}>Centrifugado</li>\n        <li className={terminada ? 'encendido' : ''}>Fin</li>\n      </ul>\n      <p>Pilotos encendidos: {encendidos.length > 0 ? encendidos.join(', ') : 'ninguno'}</p>\n      <div className=\"mandos\">\n        <button disabled={lavando || centrifugando} onClick={ponerEnMarcha}>\n          Poner en marcha\n        </button>\n        <button disabled={!lavando} onClick={centrifugar}>\n          Centrifugar\n        </button>\n        <button disabled={!centrifugando} onClick={terminar}>\n          Terminar\n        </button>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.pilotos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  padding: 0;\n  list-style: none;\n}\n\n.pilotos li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  color: #78716c;\n}\n\n.pilotos li::before {\n  content: '';\n  width: 0.9rem;\n  height: 0.9rem;\n  border-radius: 50%;\n  background: #d6d3d1;\n}\n\n.pilotos li.encendido {\n  color: #1c1917;\n  font-weight: 600;\n}\n\n.pilotos li.encendido::before {\n  background: #f59e0b;\n  box-shadow: 0 0 6px #f59e0b;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.4rem 0.7rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Al centrifugar se quedan encendidos «Lavado» y «Centrifugado» a la vez, y al terminar, «Lavado» y «Fin». Y la lavadora se bloquea: «Poner en marcha» no vuelve a activarse, porque `lavando` ya no vuelve nunca a `false`. Si pulsas otra vez «Centrifugar», que sigue activo, se encienden los tres pilotos.

El fallo concreto es una línea que falta en `centrifugar`. El problema de fondo es otro: **tres booleanos admiten 8 combinaciones, y la lavadora solo tiene 4 estados reales**: parada, lavando, centrifugando y terminada. Las otras cuatro combinaciones son estados imposibles a los que tu código puede llegar con un solo descuido.

La solución es **una sola variable que solo pueda tomar valores válidos**:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La misma lavadora, con una sola variable de estado",
  "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  // 'parada' | 'lavando' | 'centrifugando' | 'terminada'\n  const [fase, setFase] = useState('parada')\n\n  const lavando = fase === 'lavando'\n  const centrifugando = fase === 'centrifugando'\n  const terminada = fase === 'terminada'\n\n  const encendidos = [\n    lavando && 'Lavado',\n    centrifugando && 'Centrifugado',\n    terminada && 'Fin',\n  ].filter(Boolean)\n\n  return (\n    <main>\n      <h1>Lavandería La Burbuja · Lavadora 3</h1>\n      <ul className=\"pilotos\">\n        <li className={lavando ? 'encendido' : ''}>Lavado</li>\n        <li className={centrifugando ? 'encendido' : ''}>Centrifugado</li>\n        <li className={terminada ? 'encendido' : ''}>Fin</li>\n      </ul>\n      <p>Pilotos encendidos: {encendidos.length > 0 ? encendidos.join(', ') : 'ninguno'}</p>\n      <div className=\"mandos\">\n        <button disabled={lavando || centrifugando} onClick={() => setFase('lavando')}>\n          Poner en marcha\n        </button>\n        <button disabled={!lavando} onClick={() => setFase('centrifugando')}>\n          Centrifugar\n        </button>\n        <button disabled={!centrifugando} onClick={() => setFase('terminada')}>\n          Terminar\n        </button>\n      </div>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.pilotos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  padding: 0;\n  list-style: none;\n}\n\n.pilotos li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  color: #78716c;\n}\n\n.pilotos li::before {\n  content: '';\n  width: 0.9rem;\n  height: 0.9rem;\n  border-radius: 50%;\n  background: #d6d3d1;\n}\n\n.pilotos li.encendido {\n  color: #1c1917;\n  font-weight: 600;\n}\n\n.pilotos li.encendido::before {\n  background: #f59e0b;\n  box-shadow: 0 0 6px #f59e0b;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.4rem 0.7rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "useState('parada')",
      "nota": "Una variable con cuatro valores posibles, uno por cada estado real de la lavadora. No hay forma de estar lavando y centrifugando a la vez: fase solo puede valer una cosa."
    },
    {
      "fragmento": "// 'parada' | 'lavando' | 'centrifugando' | 'terminada'",
      "nota": "Deja escritos los valores posibles. En el módulo 10, con TypeScript, este comentario se convierte en un tipo que el compilador comprueba por ti."
    },
    {
      "fragmento": "const lavando = fase === 'lavando'",
      "nota": "Los booleanos siguen ahí porque se leen bien, pero ya no son estado: se calculan a partir de fase en cada render, así que no pueden desincronizarse."
    },
    {
      "fragmento": "onClick={() => setFase('centrifugando')}",
      "nota": "Pasar de fase es una sola llamada. Ya no hay que acordarse de apagar el piloto anterior: se apaga solo, porque fase ha dejado de valer lavando."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Repite el recorrido: ahora cada pulsación enciende un piloto y apaga el anterior, y al terminar puedes volver a empezar. Es la misma idea de la lección 23, la interfaz como una lista de estados posibles, convertida en regla: **cuando varias variables describen en qué situación está algo, probablemente son una sola variable con varios valores**. En la lección 27, `useReducer` te dará además un sitio donde decidir qué cambios de fase están permitidos.

## Evita el estado redundante

**Si un dato se puede calcular a partir de las props o de otras variables de estado, no es estado: es un cálculo, y se hace durante el render.**

Guardar el nombre completo, además del nombre y los apellidos, parece inofensivo. Pero obliga a recalcularlo en cada manejador que cambie alguna de las piezas, y basta un descuido para que se quede atrás. Este formulario tiene uno de esos descuidos, y es de los que cuesta ver:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [nombre, setNombre] = useState('')\nconst [apellidos, setApellidos] = useState('')\nconst [nombreCompleto, setNombreCompleto] = useState('')\n\nfunction manejarNombre(e) {\n  setNombre(e.target.value)\n  setNombreCompleto(nombre + ' ' + apellidos)\n}\n\nfunction manejarApellidos(e) {\n  setApellidos(e.target.value)\n  setNombreCompleto(nombre + ' ' + apellidos)\n}\n\n// <p>El carné saldrá a nombre de: {nombreCompleto}</p>\n\n// Escribes «Ana» en Nombre y después «Ruiz» en Apellidos,\n// letra a letra. ¿A nombre de quién sale el carné?",
  "opciones": [
    "Ana Ruiz",
    "Ana Rui",
    "An Ruiz",
    "An Rui"
  ],
  "correcta": 1,
  "explicacion": "Cada manejador calcula el nombre completo con nombre y apellidos tal como eran en este render, antes del cambio que acaba de pedir: setNombre no cambia la variable nombre hasta el render siguiente (es la instantánea de la lección 18). Por eso el carné va siempre una pulsación por detrás: después de escribir Ana decía «An», y después de Ruiz dice «Ana Rui»."
}
```

Compruébalo tecleando, y después arréglalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un nombre completo que siempre va por detrás",
  "consigna": "Escribe un nombre y unos apellidos y mira cómo el carné va una letra por detrás. Arréglalo borrando, no añadiendo: quita nombreCompleto del estado, calcúlalo en el cuerpo del componente con una constante y deja que cada manejador cambie solo su campo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n  const [apellidos, setApellidos] = useState('')\n  const [nombreCompleto, setNombreCompleto] = useState('')\n\n  function manejarNombre(e) {\n    setNombre(e.target.value)\n    setNombreCompleto(nombre + ' ' + apellidos)\n  }\n\n  function manejarApellidos(e) {\n    setApellidos(e.target.value)\n    setNombreCompleto(nombre + ' ' + apellidos)\n  }\n\n  return (\n    <main>\n      <h1>Biblioteca municipal: solicitud de carné</h1>\n      <label>\n        Nombre\n        <input value={nombre} onChange={manejarNombre} />\n      </label>\n      <label>\n        Apellidos\n        <input value={apellidos} onChange={manejarApellidos} />\n      </label>\n      <p className=\"carne\">El carné saldrá a nombre de: {nombreCompleto}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 18rem;\n  margin-bottom: 0.6rem;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.carne {\n  padding: 0.6rem 0.8rem;\n  border: 2px solid #4f46e5;\n  border-radius: 8px;\n  background: #eef2ff;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Este es el arreglo:

```jsx
const [nombre, setNombre] = useState('')
const [apellidos, setApellidos] = useState('')

const nombreCompleto = nombre + ' ' + apellidos

// ...
<input value={nombre} onChange={(e) => setNombre(e.target.value)} />
<input value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
```

Cada manejador cambia solo su campo. Ese cambio provoca un render nuevo, y en él `nombreCompleto` se calcula otra vez con los valores recién llegados, así que no puede ir por detrás. **Menos estado, menos código y un bug menos.**

Lo mismo vale para todo lo que sale de otros datos:

- **Un total o un recuento**: `const total = lineas.reduce((suma, l) => suma + l.precio * l.unidades, 0)`, o un simple `tareas.length`.
- **Una lista filtrada u ordenada**: `const visibles = productos.filter(...)`. En la lección 11 ya sacaste así los libros pendientes y los leídos del mismo array.
- **Un booleano que depende de otros datos**: `const puedeEnviar = email !== '' && aceptaCondiciones`.
- **Un texto con formato**: `const precio = total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })`.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "¿No es lento calcularlo en cada render?",
  "contenido": "Casi nunca. La documentación de React lo resume así: salvo que crees o recorras miles de objetos, probablemente no es caro. Si dudas, mídelo con console.time y console.timeEnd; a partir de 1 ms, más o menos, puede compensar memorizar el cálculo con useMemo (lección 67). Aun así sigue siendo un cálculo, no estado. Lo que no conviene es guardarlo en el estado y actualizarlo con un efecto: la lección 39 explica por qué."
}
```

## No copies las props en el estado

Hay un estado redundante tan habitual que merece apartado propio: **copiar una prop en el estado**. Aquí la noticia recibe de `App` el tamaño de letra:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Noticia({ tamano }) {\n  const [tamanoLetra, setTamanoLetra] = useState(tamano)\n\n  return (\n    <article style={{ fontSize: tamanoLetra }}>\n      <h2>Las fiestas del barrio empiezan el viernes</h2>\n      <p>Letra de {tamanoLetra} px</p>\n    </article>\n  )\n}\n\nexport default function App() {\n  const [tamano, setTamano] = useState(16)\n\n  return (\n    <main>\n      <button onClick={() => setTamano(22)}>Letra grande</button>\n      <Noticia tamano={tamano} />\n    </main>\n  )\n}\n\n// Pulsas «Letra grande». ¿Qué dice el párrafo de la noticia?",
  "opciones": [
    "Letra de 22 px",
    "Letra de 16 px",
    "Letra de 22 px, aunque la letra se sigue viendo igual",
    "Nada: salta un error porque las props no se pueden cambiar"
  ],
  "correcta": 1,
  "explicacion": "App sí cambia: se vuelve a renderizar y le pasa tamano={22} a Noticia. Pero Noticia no pinta la prop, pinta su estado, y el argumento de useState solo cuenta en el primer render. En los siguientes, React lo ignora y devuelve lo que ya tenía guardado. La copia se quedó con el 16 del principio, y la letra no crece."
}
```

La referencia de `useState` lo dice con todas las letras: el valor inicial **se ignora después del primer render**. Copiar una prop en el estado no la guarda, la congela. Si el padre cambia la prop, el hijo no se entera.

La solución es usar la prop directamente. Si quieres un nombre más corto o más claro, una constante:

```jsx
function Noticia({ tamano }) {
  const tamanoLetra = tamano
  // ...
}
```

¿Cuándo sí tiene sentido? Cuando **quieres** ignorar los cambios: la prop solo sirve para arrancar, y desde ahí el componente lleva su propio estado. La convención es dejarlo claro en el nombre de la prop, con la palabra inicial: `colorInicial` (en inglés verás `initialColor` o `defaultColor`). En este tablón, el selector decide el color con el que **nace** cada nota; después, cada nota es dueña del suyo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "colorInicial: una prop que solo cuenta al principio",
  "consigna": "Cambia «Color de las notas nuevas» a rosa: las notas que ya estaban no cambian. Escribe una nota y pulsa «Añadir nota»: esa sí nace rosa. Después cambia el color de cualquier nota con sus botones.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst COLORES = ['amarillo', 'verde', 'rosa']\n\nfunction Nota({ texto, colorInicial }) {\n  // color guarda el PRIMER valor de colorInicial.\n  // Si después colorInicial cambia, esta nota no se entera: es a propósito.\n  const [color, setColor] = useState(colorInicial)\n\n  return (\n    <li className={'nota ' + color}>\n      <p>{texto}</p>\n      <div className=\"colores\">\n        {COLORES.map((c) => (\n          <button key={c} aria-pressed={c === color} onClick={() => setColor(c)}>\n            {c}\n          </button>\n        ))}\n      </div>\n    </li>\n  )\n}\n\nexport default function App() {\n  const [notas, setNotas] = useState([\n    { id: 1, texto: 'Comprar pilas' },\n    { id: 2, texto: 'Llamar al fontanero' },\n  ])\n  const [colorNuevas, setColorNuevas] = useState('amarillo')\n  const [texto, setTexto] = useState('')\n\n  function anadir() {\n    if (texto.trim() === '') return\n    setNotas([...notas, { id: notas.length + 1, texto }])\n    setTexto('')\n  }\n\n  return (\n    <main>\n      <h1>El tablón de la nevera</h1>\n      <div className=\"controles\">\n        <label>\n          Color de las notas nuevas\n          <select value={colorNuevas} onChange={(e) => setColorNuevas(e.target.value)}>\n            {COLORES.map((c) => (\n              <option key={c}>{c}</option>\n            ))}\n          </select>\n        </label>\n        <label>\n          Nueva nota\n          <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n        </label>\n        <button onClick={anadir}>Añadir nota</button>\n      </div>\n      <ul className=\"tablon\">\n        {notas.map((nota) => (\n          <Nota key={nota.id} texto={nota.texto} colorInicial={colorNuevas} />\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.controles {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.35rem 0.5rem;\n  font: inherit;\n}\n\n.tablon {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  padding: 0;\n  list-style: none;\n}\n\n.nota {\n  width: 10rem;\n  padding: 0.6rem;\n  box-shadow: 0 2px 4px rgb(0 0 0 / 0.15);\n}\n\n.nota p {\n  margin: 0 0 0.5rem;\n}\n\n.amarillo {\n  background: #fef08a;\n}\n\n.verde {\n  background: #bbf7d0;\n}\n\n.rosa {\n  background: #fbcfe8;\n}\n\n.colores {\n  display: flex;\n  gap: 0.25rem;\n}\n\n.colores button {\n  padding: 0.1rem 0.3rem;\n  font-size: 0.75rem;\n}\n\n.colores button[aria-pressed='true'] {\n  outline: 2px solid #1c1917;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Todas las notas reciben `colorInicial` en cada render, pero cada una solo lo usó en el primero, al aparecer. Eso es justo lo que se busca, y el nombre de la prop avisa a quien lea el código de que los cambios posteriores se ignoran a propósito.

Dos situaciones parecidas que no se resuelven copiando props:

- **Quieres que el hijo vuelva a empezar cuando cambia una prop**, por ejemplo vaciar un borrador al cambiar de conversación. Basta con darle una `key` distinta: React lo crea de nuevo, con su estado desde cero. Es la lección 26.
- **El dato tiene que guardarse con el resto de la información**: si las notas se fueran a guardar con su color, el color no podría vivir dentro de cada `Nota`; tendría que subir a `App`, junto a la lista. Es la lección 25.

## Evita los duplicados: guarda el id, no una copia

En la comunidad de vecinos de la calle Olivo toca elegir quién preside este año. Esta versión guarda en el estado **el vecino elegido**, el objeto entero:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La presidencia guardada como objeto",
  "consigna": "Carmen preside la comunidad. Corrige su nombre a «Carmen Ortega» y mira el aviso de abajo. Después elige a Julián para presidir y corrige también su nombre.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst vecinosIniciales = [\n  { id: '1A', nombre: 'Carmen' },\n  { id: '1B', nombre: 'Julián' },\n  { id: '2A', nombre: 'Rosa' },\n  { id: '2B', nombre: 'Iñaki' },\n]\n\nexport default function App() {\n  const [vecinos, setVecinos] = useState(vecinosIniciales)\n  const [quienPreside, setQuienPreside] = useState(vecinosIniciales[0])\n\n  function cambiarNombre(id, nombre) {\n    setVecinos(vecinos.map((v) => (v.id === id ? { ...v, nombre } : v)))\n  }\n\n  return (\n    <main>\n      <h1>Comunidad de vecinos de la calle Olivo, 14</h1>\n      <ul className=\"vecinos\">\n        {vecinos.map((vecino) => (\n          <li key={vecino.id}>\n            <label>\n              Piso {vecino.id}\n              <input\n                value={vecino.nombre}\n                onChange={(e) => cambiarNombre(vecino.id, e.target.value)}\n              />\n            </label>\n            <button onClick={() => setQuienPreside(vecino)}>Elegir para presidir</button>\n          </li>\n        ))}\n      </ul>\n      <p className=\"preside\">Preside la comunidad: {quienPreside.nombre}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.vecinos {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.vecinos li {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\ninput,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.preside {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #2563eb;\n  background: #eff6ff;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El campo cambia y el aviso no. Al pulsar «Elegir para presidir», `quienPreside` se quedó con el objeto del vecino **tal como era en ese momento**. Al corregir el nombre, `cambiarNombre` crea un objeto nuevo para ese vecino (en el estado no se modifica nada, se sustituye: lecciones 20 y 21), y la lista pasa a tener el nuevo. `quienPreside` sigue apuntando al viejo. **El mismo dato está en dos sitios y solo se ha actualizado uno.**

El arreglo no es acordarse de actualizar también `quienPreside` en `cambiarNombre`, y en cada manejador que toque vecinos en el futuro. Es **guardar solo lo esencial**: quién preside, es decir, su id. El vecino se busca en la lista en cada render:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La presidencia guardada como id",
  "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst vecinosIniciales = [\n  { id: '1A', nombre: 'Carmen' },\n  { id: '1B', nombre: 'Julián' },\n  { id: '2A', nombre: 'Rosa' },\n  { id: '2B', nombre: 'Iñaki' },\n]\n\nexport default function App() {\n  const [vecinos, setVecinos] = useState(vecinosIniciales)\n  const [presideId, setPresideId] = useState('1A')\n\n  const quienPreside = vecinos.find((v) => v.id === presideId)\n\n  function cambiarNombre(id, nombre) {\n    setVecinos(vecinos.map((v) => (v.id === id ? { ...v, nombre } : v)))\n  }\n\n  return (\n    <main>\n      <h1>Comunidad de vecinos de la calle Olivo, 14</h1>\n      <ul className=\"vecinos\">\n        {vecinos.map((vecino) => (\n          <li key={vecino.id}>\n            <label>\n              Piso {vecino.id}\n              <input\n                value={vecino.nombre}\n                onChange={(e) => cambiarNombre(vecino.id, e.target.value)}\n              />\n            </label>\n            <button onClick={() => setPresideId(vecino.id)}>Elegir para presidir</button>\n          </li>\n        ))}\n      </ul>\n      <p className=\"preside\">Preside la comunidad: {quienPreside.nombre}</p>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.vecinos {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.vecinos li {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\ninput,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.preside {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #2563eb;\n  background: #eff6ff;\n}",
  "anotaciones": [
    {
      "fragmento": "useState('1A')",
      "nota": "El estado guarda el piso de quien preside, que no cambia aunque cambie el nombre. Es lo único esencial: el nombre y los demás datos ya están en vecinos."
    },
    {
      "fragmento": "vecinos.find((v) => v.id === presideId)",
      "nota": "El vecino se busca en la lista actual en cada render. Si editas su nombre, setVecinos provoca un render y find encuentra el objeto nuevo."
    },
    {
      "fragmento": "setPresideId(vecino.id)",
      "nota": "Elegir es guardar el id, no el objeto."
    },
    {
      "fragmento": "{quienPreside.nombre}",
      "nota": "Siempre al día. Corrige el nombre de quien preside y compruébalo."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Compara cómo queda el estado en las dos versiones:

- **Antes**: `vecinos = [{ id: '1A', nombre: 'Carmen' }, …]` y `quienPreside = { id: '1A', nombre: 'Carmen' }`. Carmen está dos veces.
- **Después**: `vecinos = [{ id: '1A', nombre: 'Carmen' }, …]` y `presideId = '1A'`. Carmen está una vez.

**Para cualquier selección (el elemento activo, la pestaña abierta, la fila marcada), guarda el id.** Si se pueden elegir varios, guarda un array o un `Set` de ids. Buscar con `find` en una lista de unos cientos de elementos no cuesta nada que se note.

## Evita anidar demasiado: aplana el estado

La ferretería Hermanos Gil organiza su tienda online en categorías, que tienen subcategorías, que a su vez tienen otras. Lo natural es guardarlas tal como se ven: un árbol de objetos dentro de objetos. Funciona bien para pintarlo. El problema llega al cambiar algo que está abajo del todo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "const catalogoInicial = {\n  id: 0,\n  nombre: 'Catálogo',\n  hijas: [\n    {\n      id: 1,\n      nombre: 'Herramientas',\n      hijas: [\n        { id: 2, nombre: 'Manuales', hijas: [/* Martillos, Destornilladores */] },\n        { id: 5, nombre: 'Eléctricas', hijas: [/* Taladros, Lijadoras */] },\n      ],\n    },\n    {\n      id: 8,\n      nombre: 'Jardín',\n      hijas: [\n        {\n          id: 9,\n          nombre: 'Riego',\n          hijas: [\n            { id: 10, nombre: 'Mangueras', hijas: [] },\n            { id: 11, nombre: 'Aspersores', hijas: [] },\n          ],\n        },\n        { id: 12, nombre: 'Macetas', hijas: [] },\n      ],\n    },\n  ],\n}\n\n// Dentro del componente: cambiar el nombre de Mangueras,\n// que está tres niveles por debajo del catálogo\nfunction renombrarMangueras() {\n  setCatalogo({\n    ...catalogo,\n    hijas: catalogo.hijas.map((nivel1) =>\n      nivel1.id !== 8\n        ? nivel1\n        : {\n            ...nivel1,\n            hijas: nivel1.hijas.map((nivel2) =>\n              nivel2.id !== 9\n                ? nivel2\n                : {\n                    ...nivel2,\n                    hijas: nivel2.hijas.map((nivel3) =>\n                      nivel3.id !== 10 ? nivel3 : { ...nivel3, nombre: 'Mangueras extensibles' },\n                    ),\n                  },\n            ),\n          },\n    ),\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "nombre: 'Riego',",
      "nota": "Cada categoría lleva dentro sus subcategorías completas. Mangueras vive dentro de Riego, que vive dentro de Jardín, que vive dentro del catálogo."
    },
    {
      "fragmento": "hijas: catalogo.hijas.map((nivel1) =>",
      "nota": "En el estado no se modifica nada, se copia (lección 20). Y para cambiar un objeto anidado hay que copiar todo el camino desde la raíz: el catálogo, Jardín, Riego y por fin Mangueras."
    },
    {
      "fragmento": "nivel1.id !== 8",
      "nota": "Además hay que saber de antemano por dónde se baja: los ids de Jardín y Riego están escritos a mano. Para una categoría cualquiera necesitarías una función recursiva que recorriera el árbol buscándola."
    },
    {
      "fragmento": "{ ...nivel3, nombre: 'Mangueras extensibles' }",
      "nota": "El cambio de verdad es esta línea. Todo lo demás es el precio de tener el estado anidado."
    }
  ]
}
```

**Si el estado está tan anidado que cuesta actualizarlo, aplánalo.** En vez de que cada categoría contenga a sus hijas, cada una guarda **los ids** de sus hijas, y todas viven en un único objeto indexado por id. Es lo que harías en una base de datos: una tabla de categorías, una fila por categoría, y las relaciones guardadas como ids.

```jsx
const categorias = {
  0: { id: 0, nombre: 'Catálogo', hijas: [1, 8] },
  8: { id: 8, nombre: 'Jardín', hijas: [9, 12] },
  9: { id: 9, nombre: 'Riego', hijas: [10, 11] },
  10: { id: 10, nombre: 'Mangueras', hijas: [] },
  // ...
}

// Cambiar el nombre de Mangueras, esté a la profundidad que esté:
setCategorias({ ...categorias, 10: { ...categorias[10], nombre: 'Mangueras extensibles' } })
```

La pirámide de antes se queda en una línea: una copia de la tabla y una copia de la fila que cambia. Aquí tienes la tienda entera con el estado aplanado, y un botón para quitar cada categoría:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Las categorías de la ferretería, normalizadas",
  "codigo": "import { useState } from 'react'\n\nconst categoriasIniciales = {\n  0: { id: 0, nombre: 'Catálogo', hijas: [1, 8] },\n  1: { id: 1, nombre: 'Herramientas', hijas: [2, 5] },\n  2: { id: 2, nombre: 'Manuales', hijas: [3, 4] },\n  3: { id: 3, nombre: 'Martillos', hijas: [] },\n  4: { id: 4, nombre: 'Destornilladores', hijas: [] },\n  5: { id: 5, nombre: 'Eléctricas', hijas: [6, 7] },\n  6: { id: 6, nombre: 'Taladros', hijas: [] },\n  7: { id: 7, nombre: 'Lijadoras', hijas: [] },\n  8: { id: 8, nombre: 'Jardín', hijas: [9, 12] },\n  9: { id: 9, nombre: 'Riego', hijas: [10, 11] },\n  10: { id: 10, nombre: 'Mangueras', hijas: [] },\n  11: { id: 11, nombre: 'Aspersores', hijas: [] },\n  12: { id: 12, nombre: 'Macetas', hijas: [] },\n}\n\nfunction Categoria({ id, padreId, categorias, onQuitar }) {\n  const categoria = categorias[id]\n\n  return (\n    <li>\n      {categoria.nombre}{' '}\n      <button aria-label={'Quitar ' + categoria.nombre} onClick={() => onQuitar(padreId, id)}>\n        Quitar\n      </button>\n      {categoria.hijas.length > 0 && (\n        <ul>\n          {categoria.hijas.map((hijaId) => (\n            <Categoria\n              key={hijaId}\n              id={hijaId}\n              padreId={id}\n              categorias={categorias}\n              onQuitar={onQuitar}\n            />\n          ))}\n        </ul>\n      )}\n    </li>\n  )\n}\n\nexport default function App() {\n  const [categorias, setCategorias] = useState(categoriasIniciales)\n\n  function quitar(padreId, id) {\n    const padre = categorias[padreId]\n    setCategorias({\n      ...categorias,\n      [padreId]: { ...padre, hijas: padre.hijas.filter((hijaId) => hijaId !== id) },\n    })\n  }\n\n  return (\n    <main>\n      <h1>Ferretería Hermanos Gil: categorías de la tienda online</h1>\n      <ul>\n        {categorias[0].hijas.map((id) => (\n          <Categoria key={id} id={id} padreId={0} categorias={categorias} onQuitar={quitar} />\n        ))}\n      </ul>\n      <p>Filas en la tabla: {Object.keys(categorias).length}</p>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\nul {\n  padding-left: 1.2rem;\n}\n\nli {\n  margin: 0.2rem 0;\n}\n\nbutton {\n  padding: 0.1rem 0.4rem;\n  font: inherit;\n  font-size: 0.8rem;\n}",
  "anotaciones": [
    {
      "fragmento": "0: { id: 0, nombre: 'Catálogo', hijas: [1, 8] },",
      "nota": "Cada categoría es una fila de la tabla, con su id como clave. Las hijas no van dentro: solo sus ids, en el orden en que se pintan. La raíz, Catálogo, no se pinta; solo sirve para saber qué categorías van arriba del todo."
    },
    {
      "fragmento": "const categoria = categorias[id]",
      "nota": "Encontrar una categoría es leer una clave del objeto. No hay que recorrer el árbol."
    },
    {
      "fragmento": "padreId={id}",
      "nota": "Categoria se usa a sí misma para pintar sus hijas, y a cada una le dice quién es su padre. Así, cuando la quiten, se sabe de qué lista tiene que salir."
    },
    {
      "fragmento": "[padreId]: { ...padre, hijas: padre.hijas.filter((hijaId) => hijaId !== id) },",
      "nota": "Quitar una categoría, esté a la profundidad que esté, cambia solo dos niveles: una copia de la tabla y una copia del padre sin ese id entre sus hijas."
    },
    {
      "fragmento": "Filas en la tabla: {Object.keys(categorias).length}",
      "nota": "Quita Riego y fíjate: siguen siendo 13 filas. Riego, Mangueras y Aspersores ya no cuelgan de nadie, así que no se pintan, pero siguen en la tabla. Borrarlos también es uno de los retos del final."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Un estado plano (también se dice **normalizado**) no es un estado sin objetos: es uno en el que **cada dato está una sola vez y las relaciones se guardan como ids**. Es la misma idea que separar los datos de una base de datos en tablas relacionadas por clave. Redux Toolkit, que verás en la lección 75, trae una utilidad, `createEntityAdapter`, que guarda las listas justo así, con la forma `{ ids: [], entities: {} }`.

Hay otra forma de quitar niveles: **no todo tiene que estar en el objeto grande**. Si cada categoría se pudiera plegar y desplegar, ese «abierta o cerrada» es estado de interfaz que nadie más necesita guardar. Puede vivir en un `useState` dentro de cada `Categoria`, en vez de en la tabla.

## Cuándo lo usarías de verdad

Antes de escribir un `useState`, cinco preguntas, una por principio:

1. **¿Se puede calcular** a partir de las props o de otro estado? Entonces no es estado: es una constante en el render.
2. **¿Ya está** en otra variable o en una prop? Guarda una referencia, su id, o usa la prop.
3. **¿Cambia siempre junto** a otra variable? Júntalas en un objeto.
4. **¿Puede llevar la contraria** a otra variable? Sustituye las dos por una con los valores válidos.
5. **¿Cuesta actualizarlo** porque está muy anidado? Aplánalo por ids.

Y estos son los sitios donde vas a encontrarte estas decisiones en cuanto salgas de los ejemplos:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Peticiones a un servidor",
      "texto": "En vez de cargando, error y datosListos como tres booleanos, un solo estado con valores como pendiente, error o éxito. TanStack Query, que verás en la lección 78, expone exactamente eso: un status que vale pending, error o success."
    },
    {
      "titulo": "Selecciones",
      "texto": "La fila marcada de una tabla, la pestaña activa, el correo abierto en el panel lateral: un id. Varias filas marcadas: un array o un Set de ids."
    },
    {
      "titulo": "Datos anidados que llegan de una API",
      "texto": "Un pedido con su cliente, sus líneas y los productos de cada línea. Si tienes que editar piezas sueltas, normalízalos al guardarlos: una tabla por tipo de dato, relacionadas por ids. Es la recomendación de la documentación de Redux."
    },
    {
      "titulo": "Formularios",
      "texto": "En el estado van los valores de los campos. Si el formulario es válido, cuántos caracteres quedan o el resumen del pedido se calculan durante el render (la validación tiene su lección, la 61)."
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
      "mito": "Cuantas menos variables de estado, mejor",
      "realidad": "Tan simple como se pueda, pero no más. Meter en un mismo objeto datos que cambian por separado te obliga a copiar el resto en cada actualización. El criterio es cómo cambian los datos, no cuántos useState salen."
    },
    {
      "mito": "Todo lo que se ve en pantalla tiene que estar en el estado",
      "realidad": "En el estado va lo mínimo que no se puede calcular. Totales, listas filtradas, textos compuestos y booleanos que dependen de otros datos se calculan durante el render."
    },
    {
      "mito": "Copiar una prop en el estado la mantiene al día",
      "realidad": "Es justo al revés: la congela en el valor del primer render. Si quieres que el hijo siga a la prop, usa la prop."
    },
    {
      "mito": "Guardar el objeto elegido ahorra tener que buscarlo",
      "realidad": "Ahorras un find que no se nota y ganas una copia que se queda vieja en cuanto alguien edita la lista. Guarda el id."
    },
    {
      "mito": "Un estado plano es siempre mejor que uno anidado",
      "realidad": "Aplana cuando anidar te complica las actualizaciones. Un objeto de dos niveles, como una posición o una dirección postal, está bien tal cual."
    }
  ]
}
```

## Errores típicos

**Comparar la selección con `===` cuando la lista se actualiza.** Es el duplicado de la presidencia, disfrazado. En el karaoke, cada canción se puede resaltar y marcar como favorita:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [canciones, setCanciones] = useState([\n  { id: 1, titulo: 'Mediterráneo', favorita: false },\n  { id: 2, titulo: 'La flaca', favorita: false },\n])\nconst [resaltada, setResaltada] = useState(null)\n\nfunction alternarFavorita(id) {\n  setCanciones(canciones.map((c) => (c.id === id ? { ...c, favorita: !c.favorita } : c)))\n}\n\nreturn (\n  <ul>\n    {canciones.map((cancion) => (\n      <li key={cancion.id}>\n        {cancion.titulo}\n        {cancion === resaltada && ' · resaltada'}\n        {cancion.favorita && ' · favorita'}\n        <button onClick={() => setResaltada(cancion)}>Resaltar</button>\n        <button onClick={() => alternarFavorita(cancion.id)}>Favorita</button>\n      </li>\n    ))}\n  </ul>\n)\n\n// En la fila de «Mediterráneo» pulsas «Resaltar» y después «Favorita».\n// ¿Qué texto queda en esa fila?",
  "opciones": [
    "Mediterráneo · resaltada · favorita",
    "Mediterráneo · favorita",
    "Mediterráneo · resaltada"
  ],
  "correcta": 1,
  "explicacion": "Al marcarla como favorita, map crea un objeto nuevo para Mediterráneo. resaltada sigue apuntando al objeto viejo, y === compara si son el mismo objeto, no si se parecen: da false, y el resaltado desaparece. Con un resaltadaId y la comparación cancion.id === resaltadaId, el resaltado sobrevive a cualquier cambio de la lista."
}
```

**Guardar la lista filtrada en el estado.** Es estado redundante (se puede calcular) y duplicado (repite elementos que ya están en la lista completa). En esta quesería, la lista que se ve se guarda aparte y se recalcula al buscar:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const quesosIniciales = [\n  { id: 1, nombre: 'Manchego curado' },\n  { id: 2, nombre: 'Idiazabal' },\n  { id: 3, nombre: 'Tetilla' },\n]\n\nconst [quesos, setQuesos] = useState(quesosIniciales)\nconst [busqueda, setBusqueda] = useState('')\nconst [visibles, setVisibles] = useState(quesosIniciales)\n\nfunction buscar(e) {\n  const texto = e.target.value\n  setBusqueda(texto)\n  setVisibles(quesos.filter((q) => q.nombre.toLowerCase().includes(texto.toLowerCase())))\n}\n\nfunction anadirCabrales() {\n  setQuesos([...quesos, { id: 4, nombre: 'Cabrales' }])\n}\n\n// La lista pinta visibles. Sin escribir nada en el buscador,\n// pulsas «Añadir Cabrales». ¿Cuántos quesos ves?",
  "opciones": [
    "4: los tres de antes y el Cabrales",
    "3: el Cabrales no aparece",
    "Ninguno: la lista se vacía"
  ],
  "correcta": 1,
  "explicacion": "visibles es una copia calculada en la última búsqueda, y anadirCabrales solo cambia quesos. El Cabrales está en el estado, pero no en la lista que se pinta. Aparecerá la próxima vez que escribas en el buscador, que es cuando alguien vuelve a calcular la copia. Sin el tercer useState no hay nada que olvidar: const visibles = quesos.filter(...), en el cuerpo del componente."
}
```

**Sincronizar con un efecto lo que se puede calcular.** Cuando conozcas `useEffect` (lección 38) vas a tener la tentación de escribir `useEffect(() => setTotal(...), [lineas])`. El total acaba saliendo bien, pero React hace primero un render con el total viejo y enseguida otro con el bueno, y el código es más largo. La lección 39 está dedicada a quitar efectos como ese; la respuesta es la de esta lección: una constante.

**Guardar el índice en vez del id.** Elegir por índice (`const [elegida, setElegida] = useState(0)`) funciona mientras la lista no cambie de orden ni pierda elementos. En cuanto se quita uno de los de antes, el índice señala a otro. El id va pegado al dato; el índice, al sitio, como ya viste con la `key` en la lección 11.

**Copiar una prop para poder modificarla.** Si un hijo necesita cambiar un dato que le llega por props, copiarlo en su estado crea dos versiones que se separan en cuanto cualquiera de las dos cambie. El dato tiene que vivir en un solo sitio: en el padre, que le pasa al hijo una función para cambiarlo. Es justo la lección 25.

## Ejercicios

El primero es corto: un componente que copia una prop en el estado y, de paso, guarda un recuento que se puede calcular.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las raciones de la receta no se actualizan",
  "consigna": "Al cambiar las raciones, la lista de ingredientes no se entera. Arréglalo en Ingredientes.jsx sin romper lo que sí funciona: marcar lo que ya tienes en casa. Quita también el estado que se puede calcular. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Ingredientes from './Ingredientes'\nimport './estilos.css'\n\nexport default function App() {\n  const [raciones, setRaciones] = useState(2)\n\n  return (\n    <main>\n      <h1>Lentejas estofadas</h1>\n      <label className=\"raciones\">\n        Raciones\n        <select value={raciones} onChange={(e) => setRaciones(Number(e.target.value))}>\n          <option value=\"2\">2</option>\n          <option value=\"4\">4</option>\n          <option value=\"6\">6</option>\n        </select>\n      </label>\n      <Ingredientes raciones={raciones} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Ingredientes.jsx",
      "codigo": "import { useState } from 'react'\n\nconst POR_RACION = [\n  { id: 'lentejas', nombre: 'lentejas pardinas', gramos: 75 },\n  { id: 'chorizo', nombre: 'chorizo', gramos: 40 },\n  { id: 'patata', nombre: 'patata', gramos: 100 },\n  { id: 'zanahoria', nombre: 'zanahoria', gramos: 50 },\n]\n\nexport default function Ingredientes({ raciones }) {\n  // Hay un estado que copia una prop y otro que se puede calcular\n  const [personas, setPersonas] = useState(raciones)\n  const [enCasa, setEnCasa] = useState([])\n  const [faltan, setFaltan] = useState(POR_RACION.length)\n\n  function alternar(id) {\n    if (enCasa.includes(id)) {\n      setEnCasa(enCasa.filter((otro) => otro !== id))\n      setFaltan(faltan + 1)\n    } else {\n      setEnCasa([...enCasa, id])\n      setFaltan(faltan - 1)\n    }\n  }\n\n  return (\n    <section>\n      <h2>Ingredientes para {personas} personas</h2>\n      <ul className=\"ingredientes\">\n        {POR_RACION.map((ingrediente) => (\n          <li key={ingrediente.id}>\n            <label>\n              <input\n                type=\"checkbox\"\n                checked={enCasa.includes(ingrediente.id)}\n                onChange={() => alternar(ingrediente.id)}\n              />\n              {ingrediente.gramos * personas} g de {ingrediente.nombre}\n            </label>\n          </li>\n        ))}\n      </ul>\n      <p>Ingredientes que te faltan: {faltan}</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.raciones {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\nselect {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.ingredientes {\n  display: grid;\n  gap: 0.3rem;\n  padding: 0;\n  list-style: none;\n}\n\n.ingredientes label {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n"
    }
  ],
  "archivoInicial": "Ingredientes.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al elegir 4 raciones, el título dice «Ingredientes para 4 personas»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Raciones",
            "opcion": "4"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Ingredientes para 4 personas"
      }
    },
    {
      "descripcion": "Al elegir 6 raciones, las lentejas pasan a 450 g",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Raciones",
            "opcion": "6"
          }
        }
      ],
      "espera": {
        "rol": "checkbox",
        "nombre": "450 g de lentejas pardinas"
      }
    },
    {
      "descripcion": "Al marcar las lentejas, quedan 3 ingredientes por conseguir",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "150 g de lentejas pardinas"
          }
        }
      ],
      "espera": {
        "texto": "Ingredientes que te faltan: 3"
      }
    },
    {
      "descripcion": "Lo que has marcado se conserva al cambiar las raciones",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "150 g de lentejas pardinas"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Raciones",
            "opcion": "4"
          }
        }
      ],
      "espera": {
        "texto": "Ingredientes que te faltan: 3"
      }
    }
  ]
}
```

El segundo es el de verdad. Este planificador del Camino de Santiago guarda en el estado las etapas, los kilómetros totales, los kilómetros hechos y la etapa de hoy entera. Antes de tocar nada, provoca sus fallos: marca la etapa 1 como hecha y quítala; elige una etapa para hoy y corrige su nombre; elige otra y quítala. Los botones llevan un `aria-label` para que cada uno tenga un nombre propio, como «Quitar la etapa 3».

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Deja el planificador con el estado mínimo",
  "consigna": "Deja en el estado solo lo esencial: las etapas y el id de la etapa de hoy. Los kilómetros totales, los hechos y la etapa de hoy completa se calculan durante el render. Fíjate en que los manejadores se quedan más cortos. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst etapasIniciales = [\n  { id: 1, nombre: 'Sarria – Portomarín', km: 22, hecha: false },\n  { id: 2, nombre: 'Portomarín – Palas de Rei', km: 25, hecha: false },\n  { id: 3, nombre: 'Palas de Rei – Arzúa', km: 29, hecha: false },\n  { id: 4, nombre: 'Arzúa – O Pedrouzo', km: 19, hecha: false },\n  { id: 5, nombre: 'O Pedrouzo – Santiago', km: 20, hecha: false },\n]\n\nexport default function App() {\n  const [etapas, setEtapas] = useState(etapasIniciales)\n  // Estas tres repiten información que ya está en etapas\n  const [kmTotales, setKmTotales] = useState(115)\n  const [kmHechos, setKmHechos] = useState(0)\n  const [etapaDeHoy, setEtapaDeHoy] = useState(null)\n\n  function cambiarNombre(id, nombre) {\n    setEtapas(etapas.map((e) => (e.id === id ? { ...e, nombre } : e)))\n  }\n\n  function alternarHecha(etapa) {\n    setEtapas(etapas.map((e) => (e.id === etapa.id ? { ...e, hecha: !e.hecha } : e)))\n    setKmHechos(etapa.hecha ? kmHechos - etapa.km : kmHechos + etapa.km)\n  }\n\n  function quitar(etapa) {\n    setEtapas(etapas.filter((e) => e.id !== etapa.id))\n    setKmTotales(kmTotales - etapa.km)\n  }\n\n  return (\n    <main>\n      <h1>Mi Camino desde Sarria</h1>\n      <ul className=\"etapas\">\n        {etapas.map((etapa) => (\n          <li key={etapa.id}>\n            <label className=\"nombre\">\n              Etapa {etapa.id}\n              <input value={etapa.nombre} onChange={(e) => cambiarNombre(etapa.id, e.target.value)} />\n            </label>\n            <span className=\"km\">{etapa.km} km</span>\n            <label>\n              <input\n                type=\"checkbox\"\n                aria-label={`Etapa ${etapa.id} hecha`}\n                checked={etapa.hecha}\n                onChange={() => alternarHecha(etapa)}\n              />\n              Hecha\n            </label>\n            <button aria-label={`Caminar hoy la etapa ${etapa.id}`} onClick={() => setEtapaDeHoy(etapa)}>\n              Hoy\n            </button>\n            <button aria-label={`Quitar la etapa ${etapa.id}`} onClick={() => quitar(etapa)}>\n              Quitar\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p className=\"resumen\">Llevas {kmHechos} de {kmTotales} km</p>\n      <p className=\"hoy\">\n        {etapaDeHoy ? `Hoy caminas: ${etapaDeHoy.nombre}` : 'Aún no has elegido la etapa de hoy'}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 42rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.etapas {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.etapas li {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.5rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.nombre {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  font-weight: 600;\n}\n\n.nombre input {\n  width: 13rem;\n  font-weight: normal;\n}\n\n.km {\n  color: #57534e;\n}\n\ninput,\nbutton {\n  padding: 0.3rem 0.5rem;\n  font: inherit;\n}\n\n.resumen {\n  font-weight: 600;\n}\n\n.hoy {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #ca8a04;\n  background: #fefce8;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al marcar la etapa 1 como hecha, llevas 22 de 115 km",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Etapa 1 hecha"
          }
        }
      ],
      "espera": {
        "texto": "Llevas 22 de 115 km"
      }
    },
    {
      "descripcion": "Al quitar una etapa ya hecha, sus kilómetros dejan de contar en los dos números",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Etapa 1 hecha"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar la etapa 1"
          }
        }
      ],
      "espera": {
        "texto": "Llevas 0 de 93 km"
      }
    },
    {
      "descripcion": "Si corriges el nombre de la etapa de hoy, el aviso enseña el nombre nuevo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Caminar hoy la etapa 2"
          }
        },
        {
          "escribir": {
            "etiqueta": "Etapa 2",
            "texto": "Portomarín – Ligonde"
          }
        }
      ],
      "espera": {
        "texto": "Hoy caminas: Portomarín – Ligonde"
      }
    },
    {
      "descripcion": "Si quitas la etapa de hoy, el aviso vuelve a decir que aún no la has elegido",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Caminar hoy la etapa 3"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar la etapa 3"
          }
        }
      ],
      "espera": {
        "texto": "Aún no has elegido la etapa de hoy"
      }
    }
  ]
}
```

Cuando lo tengas, cuenta: de cuatro variables de estado has pasado a dos, `quitar` y `alternarHecha` hacen una sola cosa cada uno, y ninguno de los tres fallos puede volver, porque ya no queda nada que sincronizar.

**Retos para seguir practicando** (sin comprobación automática):

1. En el planificador, deja elegir **varias** etapas para esta semana, con un botón que las marque y desmarque y un texto «Has elegido 3 etapas». Guarda un array de ids; después prueba con un `Set` (recuerda que tampoco se modifica: se copia con `new Set(anterior)`).
2. Añade a la lavadora la fase «Aclarado», entre el lavado y el centrifugado. ¿Cuántas combinaciones tendrían cuatro booleanos? ¿Cuántos valores nuevos necesita `fase`?
3. En la ferretería, haz que al quitar una categoría desaparezcan también de la tabla ella y todas sus descendientes, hasta que «Filas en la tabla» baje. Pista: una función recursiva que reúna sus ids, y una copia de la tabla sin esas claves.
4. Añade a cada categoría de la ferretería un botón para plegar y desplegar sus hijas, con el estado dentro de `Categoria`. ¿Qué le pasa a ese estado cuando quitas la categoría de su padre?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Choosing the State Structure",
      "descripcion": "La página de react.dev en la que se basa esta lección, con los cinco principios y cuatro retos resueltos, entre ellos la selección múltiple con un Set.",
      "url": "https://react.dev/learn/choosing-the-state-structure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Reacting to Input with State",
      "descripcion": "Cómo describir una pantalla como una lista de estados posibles y quedarte solo con el estado esencial. Es la lección 23.",
      "url": "https://react.dev/learn/reacting-to-input-with-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "You Might Not Need an Effect",
      "descripcion": "Por qué lo que se puede calcular no va en el estado ni en un efecto, y cómo saber si un cálculo es caro. Es la lección 39.",
      "url": "https://react.dev/learn/you-might-not-need-an-effect",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Thinking in React",
      "descripcion": "El método completo para pasar de un diseño a componentes, con un paso dedicado a encontrar el estado mínimo. Es la lección 31.",
      "url": "https://react.dev/learn/thinking-in-react",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState",
      "descripcion": "La referencia del hook, donde se explica que el valor inicial se ignora después del primer render.",
      "url": "https://react.dev/reference/react/useState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Normalizing State Shape",
      "descripcion": "La guía de Redux para normalizar datos: una tabla por tipo de dato, objetos indexados por id y arrays de ids para el orden. Sirve igual sin Redux.",
      "url": "https://redux.js.org/usage/structuring-reducers/normalizing-state-shape",
      "etiqueta": "Redux"
    }
  ]
}
```
