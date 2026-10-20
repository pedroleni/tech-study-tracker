# Proyecto: tres en raya con viaje en el tiempo

- **Módulo:** Gestionar el estado
- **Slug:** `proyecto-tres-en-raya-con-viaje-en-el-tiempo` (autogenerado del título)
- **Orden:** 320
- **Fuentes:** [Tutorial: Tic-Tac-Toe](https://react.dev/learn/tutorial-tic-tac-toe) + [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) + [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) + [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) + [Render and Commit](https://react.dev/learn/render-and-commit) — ver `contenido/react/TEMARIO.md` #32
- **Requiere:** Módulos 2 a 4 completos (lecciones 8 a 31)

---

## Qué vas a construir

El tres en raya de toda la vida, para dos personas delante del mismo navegador: un tablero de 3 × 3, X y O por turnos, un aviso con el estado de la partida («Siguiente: O», «Ganador: X», «Empate») y la línea ganadora resaltada. Y algo que no tiene el de papel: **una lista con todas las jugadas para volver a cualquier momento de la partida** y, si quieres, seguir jugando desde ahí. Es lo que react.dev llama viajar en el tiempo.

Es el proyecto del tutorial oficial de React, pensado para aprender haciendo sin saber nada de React. Tú llegas con los módulos 2, 3 y 4 hechos, así que aquí cada decisión tiene nombre y número de lección. Lo recorrerás en el mismo orden que el original, con tres diferencias:

- **Accesible desde el primer paso.** Cada casilla es un botón con un nombre que se entiende sin verla («Casilla 5, X»), y un lector de pantalla anuncia el estado de la partida sin que haya que ir a buscarlo. Las comprobaciones encuentran las casillas por ese nombre.
- **Con el árbol de renders delante.** En los pasos en los que el estado cambia de sitio verás qué componentes se vuelven a ejecutar en cada jugada, y por qué.
- **Ampliado.** Las mejoras que el tutorial deja como ejercicio al final (el empate, la línea ganadora, «Estás en la jugada N» y el orden de la lista) son aquí los pasos 6 y 7.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Siete pasos, todos en esta página",
  "contenido": "Cada paso es un bloque React en vivo con sus archivos en pestañas, la vista previa debajo y el botón «Comprobar», que juega por ti unas cuantas partidas y te dice qué falla. Cada paso arranca con la solución del anterior ya escrita: si te atascas, puedes seguir en el siguiente. Lo que cambias en un bloque no pasa al siguiente, y «Reiniciar» lo deja como estaba."
}
```

Si prefieres hacerlo en tu ordenador, crea un proyecto con Vite (lección 2) y copia en `src/` los archivos de cada paso; el `App.jsx` de cada paso sustituye al de la plantilla. Para que se vea igual que aquí, quita de `main.jsx` la importación de `index.css`, que trae los estilos de la plantilla.

## Las piezas del juego

Antes de escribir código, decide las piezas. Lo que se repite es la casilla: nueve iguales con distinta marca. Lo que las agrupa es el tablero. Y por encima está la partida entera: el tablero y la lista de jugadas.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres componentes y un módulo de JavaScript",
  "roles": [
    {
      "etiqueta": "Casilla",
      "rol": "Un botón",
      "descripcion": "Pinta una marca (X, O o nada) y avisa cuando la pulsan. No decide nada: lo que pinta y lo que pasa al pulsarla le llegan por props."
    },
    {
      "etiqueta": "Tablero",
      "rol": "Las reglas",
      "descripcion": "Coloca las nueve casillas, sabe a quién le toca y si alguien ha ganado, y anuncia el estado de la partida."
    },
    {
      "etiqueta": "Juego",
      "rol": "La memoria de la partida",
      "descripcion": "Guarda todos los tableros por los que ha pasado la partida y en cuál estás. Es el componente de App.jsx."
    },
    {
      "etiqueta": "ganador.jsx",
      "rol": "JavaScript sin React",
      "descripcion": "Las ocho líneas del tablero y dos funciones que dicen si alguna está completa. Te llega hecho en el paso 3."
    }
  ]
}
```

Al principio, `Juego` solo envuelve al tablero. Las responsabilidades de la tabla las irá ganando cada componente a medida que el estado se mueva por el árbol: **buena parte de este proyecto consiste en decidir dónde vive cada dato**.

## Paso 1: un tablero de casillas

Una casilla es un `<button>`: se puede pulsar con el ratón, con el dedo y con el teclado (Tab para llegar, Espacio o Intro para pulsar) sin programar nada. Lo que le falta a un botón con una X dentro es un nombre que se entienda: un lector de pantalla leería «X, botón» y, en una casilla vacía, «botón» a secas. Por eso cada casilla lleva un `aria-label` que dice cuál es y qué tiene:

```jsx
<button aria-label="Casilla 5, X">X</button>
<button aria-label="Casilla 6, vacía"></button>
```

Las comprobaciones pulsan las casillas por ese mismo nombre: el código accesible y el código comprobable vuelven a ser el mismo código.

En este paso el tablero es estático: una partida a medias escrita en un array de nueve posiciones, que `Tablero` convierte en nueve `<Casilla>` con un `map` (lección 11). Dos detalles:

- **Las personas cuentan desde 1 y los arrays desde 0.** La casilla 5, la del centro, es `casillas[4]`. Por eso cada casilla recibe `numero={i + 1}`.
- **Aquí el índice sí sirve como `key`.** Es la excepción de la lección 11: el tablero nunca se reordena, ni crece ni encoge, así que la posición 4 es siempre la casilla del centro. La posición es justo lo que identifica a cada casilla.

La forma de 3 × 3 la pone el CSS, con una rejilla de tres columnas, así que `Tablero` solo tiene que pintar las nueve casillas seguidas. Las envuelve un `<div>` con `role="group"` y `aria-label="Tablero"`, para que un lector de pantalla anuncie que entras en el grupo «Tablero».

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 1: un tablero de casillas",
  "consigna": "En Casilla.jsx, recibe numero y valor como props y úsalos: el valor, dentro del botón; los dos, en el aria-label: «Casilla 5, X», o «Casilla 2, vacía» si el valor es null. Si el valor es 'O', añade la clase casilla-o, que lo pinta en rojo. Después, en Tablero.jsx, pinta una Casilla por cada elemento de casillas, con su key, su numero (del 1 al 9) y su valor. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tablero from './Tablero'\nimport './estilos.css'\n\nexport default function Juego() {\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\n\n// Una partida a medias, para ver el tablero. En el paso 2 saldrá del estado.\nconst casillas = ['O', null, 'X', null, 'X', null, 'O', null, null]\n\nexport default function Tablero() {\n  return (\n    <div className=\"partida\">\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {/* Paso 1: una Casilla por cada elemento de casillas, con su numero\n            (del 1 al 9) y su valor */}\n        <Casilla />\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "// Paso 1: ahora mismo, todas las casillas son la casilla 1 con una X.\n// Haz que reciban numero y valor como props y úsalos en lugar del texto fijo.\nexport default function Casilla() {\n  return (\n    <button className=\"casilla\" aria-label=\"Casilla 1, X\">\n      X\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "Casilla.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": false,
  "comprobaciones": [
    {
      "descripcion": "La casilla del centro, la 5, lleva una X",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 5, X"
      }
    },
    {
      "descripcion": "La casilla de arriba a la izquierda, la 1, lleva una O",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 1, O"
      }
    },
    {
      "descripcion": "Una casilla sin marca se anuncia como vacía: la 9",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 9, vacía"
      }
    },
    {
      "descripcion": "La marca también se ve, no solo se anuncia: la casilla 7 enseña una O",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 7, O",
        "texto": "O"
      }
    }
  ]
}
```

Si alguna casilla se anuncia como «Casilla 2, null», has metido el valor tal cual en la plantilla de texto: un template literal convierte `null` en el texto «null». `valor ?? 'vacía'` lo sustituye por lo que tú quieras.

## ¿Dónde se guardan las marcas?

Para jugar, una casilla tiene que poder pasar de vacía a X. La idea más directa, y la primera que sigue el tutorial oficial, es darle a cada `Casilla` su propio estado: un `useState` con su marca. Pruébalo con el árbol de renders debajo de la vista previa:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Cada casilla con su propia marca",
  "codigo": "import { useState } from 'react'\n\nfunction Casilla({ numero }) {\n  // Cada casilla guarda su propia marca: nueve estados sueltos.\n  const [valor, setValor] = useState(null)\n\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n\n  return (\n    <button\n      className={clases}\n      aria-label={`Casilla ${numero}, ${valor ?? 'vacía'}`}\n      onClick={() => setValor('X')}\n    >\n      {valor}\n    </button>\n  )\n}\n\nfunction Tablero() {\n  // ¿A quién le toca? ¿Ha ganado alguien? Desde aquí no se puede saber:\n  // las marcas están dentro de cada Casilla y Tablero no puede leerlas.\n  const posiciones = [0, 1, 2, 3, 4, 5, 6, 7, 8]\n\n  return (\n    <div className=\"partida\">\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {posiciones.map((i) => (\n          <Casilla key={i} numero={i + 1} />\n        ))}\n      </div>\n    </div>\n  )\n}\n\nexport default function Juego() {\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero />\n    </main>\n  )\n}",
  "css": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}",
  "anotaciones": [
    {
      "fragmento": "const [valor, setValor] = useState(null)",
      "nota": "Cada una de las nueve copias de Casilla tiene su propia marca (lección 16). Son nueve estados sueltos, y ninguno lo puede leer nadie más."
    },
    {
      "fragmento": "onClick={() => setValor('X')}",
      "nota": "Siempre X. Para saber si le toca a O, la casilla tendría que saber cuántas marcas tienen las demás, y no puede."
    },
    {
      "fragmento": "// ¿A quién le toca? ¿Ha ganado alguien?",
      "nota": "Tablero pinta las casillas, pero sus marcas son privadas de cada una. Sin las nueve a la vez no hay forma de decidir el turno ni el ganador."
    },
    {
      "fragmento": "<Casilla key={i} numero={i + 1} />",
      "nota": "Solo le pasa el número. Para que Tablero decida qué pinta cada casilla, tendría que pasarle también la marca, y para eso la marca tiene que estar en Tablero."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Pulsa la casilla 5 y lee el panel: **Commit 2 · 1 renderizado · 1 cambio en el DOM**. Solo `Casilla key=4` pasa a re-render, porque cambió su estado (la key es la posición en el array, así que la casilla 5 es la key 4). `Tablero` y las otras ocho casillas se quedan sin cambios. Es muy eficiente, pero deja el juego cojo:

- **Todas las casillas ponen X.** Para alternar, una casilla tendría que saber cuántas marcas hay en las demás.
- **Nadie puede saber si alguien ha ganado.** Hacen falta las nueve marcas a la vez y cada una está encerrada en su casilla. El estado de un componente es privado (lección 16): `Tablero` no puede leer el de sus hijos.

Es el caso de la lección 25: **cuando varios componentes tienen que coordinarse, el estado sube a su padre común y baja a los hijos por props**. Los hijos dejan de recordar y pasan a avisar.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Antes: nueve estados sueltos",
  "nodos": [
    {
      "nombre": "Juego",
      "nivel": 0
    },
    {
      "nombre": "Tablero",
      "nivel": 1,
      "nota": "no puede leer ninguna marca"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "0",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "1",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "2",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "3",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "4",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "5",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "6",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "7",
      "etiqueta": "estado: valor"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "8",
      "etiqueta": "estado: valor"
    }
  ]
}
```

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Después: un solo estado, en Tablero",
  "nodos": [
    {
      "nombre": "Juego",
      "nivel": 0
    },
    {
      "nombre": "Tablero",
      "nivel": 1,
      "etiqueta": "estado: casillas",
      "nota": "← decide la marca en manejarClic(i)"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "0",
      "nota": "← recibe valor y onCasillaClic por props"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "1"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "2"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "3"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "4"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "5"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "6"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "7"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "8"
    }
  ]
}
```

## Paso 2: el estado, en Tablero

El array fijo del paso 1 pasa a ser el estado de `Tablero`, y empieza con las nueve casillas vacías:

```jsx
const [casillas, setCasillas] = useState(Array(9).fill(null))
```

Cada `Casilla` recibe dos props: su `valor`, para pintarlo, y `onCasillaClic`, una función para avisar de que la han pulsado. Quien decide qué pasa es `Tablero`, en su manejador:

```jsx
const marcas = casillas.filter((valor) => valor !== null).length
const siguiente = marcas % 2 === 0 ? 'X' : 'O'

function manejarClic(i) {
  const siguientes = casillas.slice()
  siguientes[i] = siguiente
  setCasillas(siguientes)
}
```

Tres ideas, y las tres las conoces ya:

- **Copia, no mutes.** `casillas.slice()` crea un array nuevo y la marca va en la copia (lección 21; `casillas.with(i, siguiente)` hace lo mismo en una línea). Si escribieras `casillas[i] = siguiente` y después `setCasillas(casillas)`, le darías a React el mismo array que ya tiene: lo compara con `Object.is`, no ve ningún cambio y no renderiza (lección 17). La X no aparecería.
- **El turno no es otro estado.** A X le toca cuando en el tablero hay un número par de marcas: cero, dos, cuatro... Eso sale de `casillas` en cada render, así que no hace falta un segundo `useState` que mantener al día (lección 24). El tutorial oficial sí lo guarda aparte, y en los errores típicos verás lo que le cuesta.
- **Pasa una función, no la llames.** Cada casilla necesita su propio aviso, con su posición dentro: `onCasillaClic={() => manejarClic(i)}`. Sin la flecha, `manejarClic(i)` se ejecutaría al renderizar, no al pulsar (lección 15).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 2: el estado, en Tablero",
  "consigna": "En Tablero.jsx, cambia la partida fija por un estado casillas con nueve null, calcula a quién le toca (siguiente) y escribe manejarClic(i): copia casillas, pon la marca en la posición i y guarda la copia. Pásale a cada Casilla onCasillaClic: una flecha que llame a manejarClic con su posición. En Casilla.jsx, recibe onCasillaClic y dásela al onClick del botón.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tablero from './Tablero'\nimport './estilos.css'\n\nexport default function Juego() {\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\n\n// Paso 2: esta partida fija pasa a ser el estado de Tablero, y empieza vacía\n// (acuérdate de importar useState).\nconst casillas = ['O', null, 'X', null, 'X', null, 'O', null, null]\n\nexport default function Tablero() {\n  // Paso 2: aquí, el estado casillas, a quién le toca (X si hay un número par\n  // de marcas) y manejarClic(i), que pone esa marca en una copia del array.\n\n  return (\n    <div className=\"partida\">\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla key={i} numero={i + 1} valor={valor} />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "// Paso 2: recibe también onCasillaClic y llámala cuando se pulse el botón.\nexport default function Casilla({ numero, valor }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n\n  return (\n    <button className={clases} aria-label={`Casilla ${numero}, ${valor ?? 'vacía'}`}>\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "Tablero.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "La partida empieza con el tablero vacío: la casilla 5 está vacía",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 5, vacía"
      }
    },
    {
      "descripcion": "Al pulsar la casilla 5, se marca con una X",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 5, X"
      }
    },
    {
      "descripcion": "Después de X juega O: tras pulsar la 1 y la 9, la 9 tiene una O",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 9, O"
      }
    },
    {
      "descripcion": "Cada jugada conserva las anteriores: tras pulsar la 1 y la 9, la 1 sigue con su X",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 1, X"
      }
    }
  ]
}
```

Con el paso resuelto, pulsa una casilla y lee el panel. El resumen dice **Commit 2 · 10 renderizados · 1 cambio en el DOM**:

- **`Tablero` · cambió su estado.** Aquí empieza el render: lo ha pedido `setCasillas`.
- **Las nueve `Casilla` · cambió la prop «onCasillaClic» (función nueva).** La flecha `() => manejarClic(i)` se crea otra vez en cada render de `Tablero`, así que para React es otra función. La casilla pulsada añade «cambió la prop «valor»».
- **`Juego` · sin cambios.** El estado vive por debajo de él.

Aunque no les pasaras ninguna función, las nueve casillas se volverían a renderizar igual: cuando un componente se renderiza, se renderizan todos sus hijos (lección 17). La función nueva solo cambia el motivo que lees. Y de diez renders sale **un solo cambio en el DOM**: el botón pulsado, con su texto y su `aria-label` nuevos. Las otras ocho casillas devuelven lo mismo que antes y React no las toca; el recuadro ámbar rodea solo la que has pulsado.

Antes de seguir, una partida rara. ¿Qué pasa si pulsas dos veces la misma casilla?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Tablero.jsx, tal como queda en el paso 2\nconst marcas = casillas.filter((valor) => valor !== null).length\nconst siguiente = marcas % 2 === 0 ? 'X' : 'O'\n\nfunction manejarClic(i) {\n  const siguientes = casillas.slice()\n  siguientes[i] = siguiente\n  setCasillas(siguientes)\n}\n\n// Pulsas la casilla 5, otra vez la 5 y después la 1.\n// ¿Qué marca tienen la 5 y la 1?",
  "opciones": [
    "X en la 5 y O en la 1: el segundo clic no hace nada",
    "O en la 5 y X en la 1",
    "O en la 5 y O en la 1",
    "X en la 5 y X en la 1"
  ],
  "correcta": 2,
  "explicacion": "El primer clic pone una X: no había marcas. En el segundo hay una marca, así que toca O, y nada impide ponerla encima de la X. Pero en el tablero sigue habiendo una sola marca, de modo que en el tercer clic vuelve a tocar O. No pisar casillas ocupadas es la primera regla del paso 3."
}
```

## Paso 3: las reglas del juego

Ahora que `Tablero` ve las nueve casillas, puede aplicar las reglas:

1. **Una casilla ocupada no se vuelve a marcar.** Basta con salir de `manejarClic` antes de tocar nada: `if (casillas[i]) return`. Sin llamada a `setCasillas` no hay render ni commit.
2. **Con la partida ganada, no se juega más.** La misma salida, con otra condición.
3. **Hay que saber si alguien ha ganado.** Eso no es React: es mirar si alguna de las ocho líneas (tres filas, tres columnas y dos diagonales) tiene tres marcas iguales. Te llega hecho en `ganador.jsx`, con dos funciones: `calcularGanador(casillas)` devuelve `'X'`, `'O'` o `null`, y `lineaGanadora(casillas)` devuelve las tres posiciones de la línea, que usarás en el paso 6.
4. **Un aviso encima del tablero**: «Siguiente: X» mientras se juega, «Ganador: O» al final.

El ganador y el aviso son datos calculados, como el turno: salen de `casillas` en cada render.

```jsx
const ganador = calcularGanador(casillas)

let estado
if (ganador) {
  estado = 'Ganador: ' + ganador
} else {
  estado = 'Siguiente: ' + siguiente
}
```

`manejarClic` puede usar ese mismo `ganador`: es el valor del render que estaba en pantalla cuando se pulsó la casilla, que es justo el tablero que vio quien jugaba (lección 18).

El párrafo del aviso lleva `role="status"`, que lo convierte en una región viva: cuando su texto cambia, un lector de pantalla lo anuncia sin interrumpir lo que estuviera leyendo. Quien juega sin ver la pantalla oye «Siguiente: O» después de cada jugada y «Ganador: X» al terminar. Los anuncios y el foco tienen su propia lección, la 37.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 3: las reglas del juego",
  "consigna": "En Tablero.jsx: calcula el ganador con calcularGanador (ya está importada) y, con él y siguiente, el texto del estado: «Ganador: X» o «Siguiente: O». Píntalo donde dice el comentario, en un <p className=\"estado\" role=\"status\">. Después, haz que manejarClic no haga nada si la casilla ya tiene marca o si alguien ha ganado. Echa un vistazo a ganador.jsx; no hace falta tocarlo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tablero from './Tablero'\nimport './estilos.css'\n\nexport default function Juego() {\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import { useState } from 'react'\nimport Casilla from './Casilla'\nimport { calcularGanador } from './ganador'\n\n// Paso 3: una casilla ocupada no se puede volver a marcar, con la partida\n// ganada no se juega más, y encima del tablero se anuncia el estado.\nexport default function Tablero() {\n  const [casillas, setCasillas] = useState(Array(9).fill(null))\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n\n  function manejarClic(i) {\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    setCasillas(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      {/* Paso 3: aquí, <p className=\"estado\" role=\"status\"> con «Siguiente: X»,\n          «Siguiente: O» o «Ganador: X» */}\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla key={i} numero={i + 1} valor={valor} onCasillaClic={() => manejarClic(i)} />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "export default function Casilla({ numero, valor, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n\n  return (\n    <button\n      className={clases}\n      aria-label={`Casilla ${numero}, ${valor ?? 'vacía'}`}\n      onClick={onCasillaClic}\n    >\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "Tablero.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": false,
  "comprobaciones": [
    {
      "descripcion": "Al empezar, el estado dice «Siguiente: X»",
      "pasos": [],
      "espera": {
        "rol": "status",
        "texto": "Siguiente: X"
      }
    },
    {
      "descripcion": "Tras la primera jugada, el estado dice «Siguiente: O»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        }
      ],
      "espera": {
        "texto": "Siguiente: O"
      }
    },
    {
      "descripcion": "Una casilla ocupada no cambia: si pulsas dos veces la 5, conserva su X",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, X"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 5, X"
      }
    },
    {
      "descripcion": "Cuando X completa la fila de arriba, el estado dice «Ganador: X»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Ganador: X"
      }
    },
    {
      "descripcion": "Con la partida ganada no se juega más: la casilla 9 sigue vacía",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 9, vacía"
      }
    }
  ]
}
```

Ya se puede jugar una partida entera. Fíjate en que `ganador` y `estado` no se guardan en ningún sitio: si mañana cambiaras las reglas (un tablero de 4 × 4, por ejemplo), tocarías `ganador.jsx` y lo demás se enteraría solo.

## Paso 4: el estado sube otra vez

Para volver a una jugada anterior hace falta algo que el juego todavía no tiene: **los tableros anteriores**. `Tablero` solo recuerda el último. ¿Dónde se guardan todos?

En `Juego`, el componente de más arriba. Es el mismo movimiento del paso 2, un nivel más: la lista de jugadas y el tablero tienen que estar de acuerdo, así que el dato vive en su padre común. Y `Tablero` pasa a ser un componente **controlado**: no guarda nada, pinta lo que le pasan y avisa cuando alguien juega.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Después del paso 4: el historial, en Juego",
  "nodos": [
    {
      "nombre": "Juego",
      "nivel": 0,
      "etiqueta": "estado: historial",
      "nota": "← manejarJugada(siguientes) añade un tablero"
    },
    {
      "nombre": "Tablero",
      "nivel": 1,
      "nota": "← recibe casillas y onJugar; ya no tiene estado"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "0",
      "nota": "← igual que en el paso 3"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "1"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "2"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "3"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "4"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "5"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "6"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "7"
    },
    {
      "nombre": "Casilla",
      "nivel": 2,
      "clave": "8"
    }
  ]
}
```

El historial es un array de tableros, es decir, un array de arrays:

```js
[
  [null, null, null, null, null, null, null, null, null], // al empezar
  [null, null, null, null, 'X', null, null, null, null], // tras la jugada 1
  ['O', null, null, null, 'X', null, null, null, null], // tras la jugada 2
]
```

Aquí se ve por qué el paso 2 copiaba el array en vez de modificarlo: **cada tablero del historial es una foto que nadie vuelve a tocar**. La jugada siguiente crea un array nuevo y deja el anterior como estaba. Si `manejarClic` modificara el tablero que recibe, todas las entradas del historial serían el mismo array, cambiando a la vez; lo verás fallar en los errores típicos.

Las piezas nuevas:

- `useState([Array(9).fill(null)])`: un historial con un solo tablero, el vacío.
- `const casillasActuales = historial[historial.length - 1]`: el tablero que se enseña se calcula, no se guarda.
- `manejarJugada(siguientes)` añade el tablero nuevo al final sin mutar nada: `setHistorial([...historial, siguientes])` (lección 21). El historial es un array nuevo, pero los tableros de dentro son los mismos de antes: no se copia ninguno.
- En `Tablero`, el `useState` desaparece: recibe `{ casillas, onJugar }` y, donde llamaba a `setCasillas`, llama a `onJugar(siguientes)`. El resto no cambia: el turno, el ganador y el aviso ya se calculaban a partir de `casillas`, y les da igual que `casillas` sea estado o una prop.

Y la lista, con un botón por cada tablero del historial:

```jsx
const jugadas = historial.map((casillas, jugada) => (
  <li key={jugada}>
    <button onClick={() => irAJugada(jugada)}>
      {jugada === 0 ? 'Ir al inicio de la partida' : `Ir a la jugada ${jugada}`}
    </button>
  </li>
))
```

La `key` es el número de jugada, que coincide con la posición en el historial. Normalmente desconfiarías del índice como key, pero aquí cumple lo que se le pide a una key: **identifica a cada jugada**, y las jugadas solo se añaden al final, nunca se reordenan ni se meten en medio. Es la misma razón que da el tutorial oficial. En el paso 7 la lista se dará la vuelta, y entonces habrá que tener cuidado.

De momento `irAJugada` está vacía: los botones aparecen, pero no hacen nada hasta el paso 5.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 4: el historial, en Juego",
  "consigna": "En App.jsx, Juego guarda el historial: un array que empieza con un tablero vacío. Pásale a Tablero el último tablero (casillas) y una función manejarJugada (onJugar) que añada el tablero nuevo al final. En Tablero.jsx, quita el useState: recibe casillas y onJugar, y llama a onJugar con la copia en lugar de a setCasillas. Por último, pinta en la lista un li con su botón por cada tablero: «Ir al inicio de la partida» para el primero e «Ir a la jugada N» para los demás. Los botones aún no hacen nada.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Tablero from './Tablero'\nimport './estilos.css'\n\n// Paso 4: el historial de tableros vive aquí, en un estado (importa useState).\n// Tablero recibe el último y avisa con onJugar; debajo, un botón por tablero.\nexport default function Juego() {\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero />\n      <section className=\"historial\" aria-labelledby=\"titulo-jugadas\">\n        <h2 id=\"titulo-jugadas\">Jugadas</h2>\n        <ol>{/* Paso 4: un <li> con su botón por cada tablero del historial */}</ol>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import { useState } from 'react'\nimport Casilla from './Casilla'\nimport { calcularGanador } from './ganador'\n\n// Paso 4: Tablero ya no guarda el estado: recibe casillas y onJugar como props.\nexport default function Tablero() {\n  const [casillas, setCasillas] = useState(Array(9).fill(null))\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n  const ganador = calcularGanador(casillas)\n\n  let estado\n  if (ganador) {\n    estado = 'Ganador: ' + ganador\n  } else {\n    estado = 'Siguiente: ' + siguiente\n  }\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    setCasillas(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla key={i} numero={i + 1} valor={valor} onCasillaClic={() => manejarClic(i)} />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "export default function Casilla({ numero, valor, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n\n  return (\n    <button\n      className={clases}\n      aria-label={`Casilla ${numero}, ${valor ?? 'vacía'}`}\n      onClick={onCasillaClic}\n    >\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Al empezar, la lista de jugadas tiene «Ir al inicio de la partida»",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Ir al inicio de la partida"
      }
    },
    {
      "descripcion": "Cada jugada añade su botón: tras tres jugadas aparece «Ir a la jugada 3»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Ir a la jugada 3"
      }
    },
    {
      "descripcion": "Cada botón va en su elemento de la lista",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Ir a la jugada 1"
      }
    },
    {
      "descripcion": "El juego sigue igual: tras dos jugadas, la casilla 2 tiene una O",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 2, O"
      }
    },
    {
      "descripcion": "El estado sigue anunciando al ganador",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Ganador: X"
      }
    }
  ]
}
```

Pulsa una casilla y mira el panel: ahora dice **11 renderizados · 3 cambios en el DOM**. `Juego` cambió su estado; `Tablero`, «cambió la prop «casillas» (array nuevo) · cambió la prop «onJugar» (función nueva)»; y las nueve casillas, como antes. El estado ha subido un nivel y el render empieza un nivel más arriba: ahora arrastra también a `Juego`. Los tres cambios en el DOM son la casilla, el texto del aviso y el `<li>` nuevo de la lista.

## Paso 5: viajar en el tiempo

Para saber qué tablero enseñar ya no vale «el último»: hay que recordar **en qué jugada estás**. Es un número, `jugadaActual`, y es estado de `Juego`, porque cambia al pulsar un botón de la lista y la pantalla tiene que reflejarlo:

```jsx
const [jugadaActual, setJugadaActual] = useState(0)
const casillasActuales = historial[jugadaActual]
```

Viajar es solo cambiar ese número: `irAJugada(jugada)` llama a `setJugadaActual(jugada)`, y en el render siguiente `Tablero` recibe el tablero de esa jugada.

Lo delicado es **jugar desde el pasado**. Si estás en la jugada 1 de una partida que va por la 3 y juegas, las jugadas 2 y 3 dejan de tener sentido: la partida sigue por otro camino. Hay que descartar el futuro antes de añadir el tablero nuevo:

```jsx
function manejarJugada(siguientes) {
  const nuevoHistorial = [...historial.slice(0, jugadaActual + 1), siguientes]
  setHistorial(nuevoHistorial)
  setJugadaActual(nuevoHistorial.length - 1)
}
```

`historial.slice(0, jugadaActual + 1)` copia el historial hasta la jugada actual, incluida, sin tocar el original (lección 21). Si estás en la última jugada, copia el historial entero y no se descarta nada. Las dos llamadas a `set` van en el mismo manejador, así que React hace un solo render con las dos (lección 19). Y la jugada actual se calcula con `nuevoHistorial`, la variable local: `historial` sigue siendo el de este render, el de antes de jugar (lección 18).

¿Y el turno? **No hay que tocarlo.** `Tablero` lo calcula contando las marcas del tablero que recibe: el de la jugada 2 tiene dos marcas, así que le toca a X. Como nunca se guardó, no hay nada que desincronizar. El tutorial oficial, que sí lo guarda, tiene que corregirlo también al viajar, y al final acaba quitando esa variable y calculándolo como `currentMove % 2 === 0`. Es la misma cuenta que la tuya: el tablero de la jugada N tiene N marcas.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 5: viajar en el tiempo",
  "consigna": "En App.jsx, añade el estado jugadaActual (empieza en 0) y enseña el tablero de esa jugada en vez del último. Haz que irAJugada cambie la jugada actual. En manejarJugada, quédate con el historial hasta la jugada actual, añade el tablero nuevo y pon la jugada actual en la última posición. El turno no hace falta tocarlo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\n// Paso 5: guarda en el estado en qué jugada estás (jugadaActual). El tablero\n// que se ve es el de esa jugada, y jugar desde el pasado descarta el futuro.\nexport default function Juego() {\n  const [historial, setHistorial] = useState([Array(9).fill(null)])\n  const casillasActuales = historial[historial.length - 1]\n\n  function manejarJugada(siguientes) {\n    setHistorial([...historial, siguientes])\n  }\n\n  function irAJugada(jugada) {\n    // Paso 5: viajar a esa jugada\n  }\n\n  const jugadas = historial.map((casillas, jugada) => (\n    <li key={jugada}>\n      <button onClick={() => irAJugada(jugada)}>\n        {jugada === 0 ? 'Ir al inicio de la partida' : `Ir a la jugada ${jugada}`}\n      </button>\n    </li>\n  ))\n\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero casillas={casillasActuales} onJugar={manejarJugada} />\n      <section className=\"historial\" aria-labelledby=\"titulo-jugadas\">\n        <h2 id=\"titulo-jugadas\">Jugadas</h2>\n        <ol>{jugadas}</ol>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\nimport { calcularGanador } from './ganador'\n\nexport default function Tablero({ casillas, onJugar }) {\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n  const ganador = calcularGanador(casillas)\n\n  let estado\n  if (ganador) {\n    estado = 'Ganador: ' + ganador\n  } else {\n    estado = 'Siguiente: ' + siguiente\n  }\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    onJugar(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla key={i} numero={i + 1} valor={valor} onCasillaClic={() => manejarClic(i)} />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "export default function Casilla({ numero, valor, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n\n  return (\n    <button\n      className={clases}\n      aria-label={`Casilla ${numero}, ${valor ?? 'vacía'}`}\n      onClick={onCasillaClic}\n    >\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "«Ir a la jugada 1» vuelve al tablero de esa jugada: la casilla 5 queda vacía",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ir a la jugada 1"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 5, vacía"
      }
    },
    {
      "descripcion": "El turno es el de la jugada a la que vuelves: en la jugada 2, «Siguiente: X»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ir a la jugada 2"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Siguiente: X"
      }
    },
    {
      "descripcion": "Jugar desde el pasado descarta el futuro: desaparece «Ir a la jugada 3»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ir a la jugada 1"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Ir a la jugada 3"
        }
      }
    },
    {
      "descripcion": "Se sigue jugando desde el tablero al que viajas: desde la jugada 2, la casilla 2 recibe una X",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ir a la jugada 2"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 2, X"
      }
    },
    {
      "descripcion": "«Ir al inicio de la partida» deja el tablero vacío",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ir al inicio de la partida"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 1, vacía"
      }
    }
  ]
}
```

Juega tres jugadas, pulsa «Ir a la jugada 1» y lee el panel:

- **`Juego` · cambió su estado n.º 2.** Cuando un componente tiene varios `useState`, el panel los numera en el orden en que los llamas, y `jugadaActual` es el segundo.
- **`Tablero` · cambió la prop «casillas» (array nuevo).** Aunque el array no tiene nada de nuevo: es el tablero de la jugada 1, que estaba guardado en el historial. Para React es nuevo porque no es el mismo array que recibió en el render anterior. **Compara referencias, no contenidos.**
- **2 cambios en el DOM**: las dos casillas que se vacían. El aviso no cambia, porque tras la jugada 1 y tras la 3 le toca a O.

## Paso 6: el final de la partida

Dos de las mejoras que propone el tutorial son cosa de `Tablero`:

- **El empate.** Si las nueve casillas tienen marca y nadie ha ganado, el aviso tiene que decir «Empate», no «Siguiente: O». Ya tienes `marcas`: es otra rama del `if`, después de la del ganador, porque si la novena jugada hace tres en raya, es una victoria, no un empate.
- **La línea ganadora, resaltada.** `lineaGanadora(casillas)` devuelve sus tres posiciones (`[0, 1, 2]` para la fila de arriba) o `null`. Con ella, `Tablero` le dice a cada `Casilla` si forma parte de la línea (`linea !== null && linea.includes(i)`), y la casilla se pinta como si le hubieran pasado un subrayador.

El color no lo ve todo el mundo, así que la casilla ganadora también lo dice en su nombre: «Casilla 1, X, ganadora». Transmitir una información solo con el color es un fallo de accesibilidad clásico (el criterio 1.4.1 de las WCAG).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 6: el final de la partida",
  "consigna": "En Tablero.jsx, si no hay ganador y las nueve casillas tienen marca, el estado dice «Empate». Calcula la línea ganadora con lineaGanadora y pásale a cada Casilla una prop ganadora: true si su posición está en esa línea. En Casilla.jsx, si es ganadora, añade la clase casilla-ganadora y termina su etiqueta en «, ganadora» («Casilla 5, X, ganadora»).",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nexport default function Juego() {\n  const [historial, setHistorial] = useState([Array(9).fill(null)])\n  const [jugadaActual, setJugadaActual] = useState(0)\n  const casillasActuales = historial[jugadaActual]\n\n  function manejarJugada(siguientes) {\n    const nuevoHistorial = [...historial.slice(0, jugadaActual + 1), siguientes]\n    setHistorial(nuevoHistorial)\n    setJugadaActual(nuevoHistorial.length - 1)\n  }\n\n  function irAJugada(jugada) {\n    setJugadaActual(jugada)\n  }\n\n  const jugadas = historial.map((casillas, jugada) => (\n    <li key={jugada}>\n      <button onClick={() => irAJugada(jugada)}>\n        {jugada === 0 ? 'Ir al inicio de la partida' : `Ir a la jugada ${jugada}`}\n      </button>\n    </li>\n  ))\n\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero casillas={casillasActuales} onJugar={manejarJugada} />\n      <section className=\"historial\" aria-labelledby=\"titulo-jugadas\">\n        <h2 id=\"titulo-jugadas\">Jugadas</h2>\n        <ol>{jugadas}</ol>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\nimport { calcularGanador, lineaGanadora } from './ganador'\n\n// Paso 6: «Empate» si el tablero se llena sin ganador, y cada Casilla recibe\n// ganadora: si su posición está en la línea ganadora (usa lineaGanadora).\nexport default function Tablero({ casillas, onJugar }) {\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n  const ganador = calcularGanador(casillas)\n\n  let estado\n  if (ganador) {\n    estado = 'Ganador: ' + ganador\n  } else {\n    estado = 'Siguiente: ' + siguiente\n  }\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    onJugar(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla key={i} numero={i + 1} valor={valor} onCasillaClic={() => manejarClic(i)} />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "// Paso 6: con la prop ganadora, añade la clase casilla-ganadora y termina la\n// etiqueta en «, ganadora» («Casilla 5, X, ganadora»).\nexport default function Casilla({ numero, valor, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n\n  return (\n    <button\n      className={clases}\n      aria-label={`Casilla ${numero}, ${valor ?? 'vacía'}`}\n      onClick={onCasillaClic}\n    >\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "Tablero.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": false,
  "comprobaciones": [
    {
      "descripcion": "Si el tablero se llena sin tres en raya, el estado dice «Empate»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 6, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 8, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 7, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Empate"
      }
    },
    {
      "descripcion": "Las casillas de la línea ganadora se anuncian como ganadoras: la 1",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 1, X, ganadora"
      }
    },
    {
      "descripcion": "La última casilla de la línea, la 3, también es ganadora",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 3, X, ganadora"
      }
    },
    {
      "descripcion": "Las casillas que no forman la línea no cambian: la 4 es «Casilla 4, O»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 4, O"
      }
    },
    {
      "descripcion": "Si la novena jugada hace tres en raya, gana: el estado dice «Ganador: X», no «Empate»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 2, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 3, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 4, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 6, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 8, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 7, vacía"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Ganador: X"
      }
    }
  ]
}
```

Para provocar un empate a mano: X en la 1, O en la 2, X en la 3, O en la 5, X en la 4, O en la 6, X en la 8, O en la 7 y X en la 9. Y si viajas hacia atrás desde una partida ganada, el subrayado desaparece y vuelve contigo: se calcula a partir del tablero que se enseña.

## Paso 7: la lista de jugadas

Las dos últimas mejoras son de la lista, así que todo pasa en `App.jsx`.

**«Estás en la jugada N».** El tutorial propone cambiar el botón de la jugada actual por un texto. Aquí se queda como botón, por accesibilidad: si alguien que usa el teclado pulsa «Ir a la jugada 2» y ese botón desaparece, el foco se pierde con él, y quien navega con el teclado o con un lector de pantalla pierde el sitio (el foco es cosa de la lección 37). Así que el botón se queda, cambia su texto a «Estás en la jugada 2» y lleva `aria-current="step"`, el atributo que marca el paso actual de un proceso. Es lo mismo que se hace con la página actual en unas migas de pan: sigue siendo un enlace, con `aria-current="page"`. Pulsarlo no cambia nada, porque le pasa a `setJugadaActual` el valor que ya tiene (lección 17).

**«Recientes primero».** En una partida larga, lo que más interesa es lo último. Un botón de alternar da la vuelta a la lista; su `aria-pressed={recientesPrimero}` le dice al lector de pantalla si está activado. Necesita estado, `recientesPrimero`, pero fíjate en qué clase de estado es: **de la interfaz, no de la partida**. No toca `historial` ni `jugadaActual`; solo decide en qué orden se pinta la lista:

```jsx
<ol>{recientesPrimero ? jugadas.toReversed() : jugadas}</ol>
```

`toReversed()` devuelve una copia del array al revés (lección 21). Y como `jugadas` ya son elementos con su `key`, cada `<li>` se lleva la suya a la nueva posición: la jugada 3 sigue siendo `key={3}`, esté arriba o abajo. **La key identifica a la jugada, no el sitio que ocupa en la lista.** Si dieras la vuelta a los datos y usaras como key la posición del `map`, la key y la jugada dejarían de coincidir: es el último de los errores típicos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 7: la lista de jugadas",
  "consigna": "En App.jsx, el botón de la jugada actual dice «Estás en la jugada N» («Estás en el inicio de la partida» en la 0) y lleva aria-current=\"step\"; los demás no cambian. Añade encima de la lista un botón «Recientes primero», con aria-pressed, que active y desactive un estado nuevo (recientesPrimero); con él activado, pinta la lista al revés sin tocar el historial.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\n// Paso 7: el botón de la jugada en la que estás dice «Estás en la jugada 2»\n// y lleva aria-current=\"step\". Y un botón «Recientes primero», con\n// aria-pressed, da la vuelta a la lista.\nexport default function Juego() {\n  const [historial, setHistorial] = useState([Array(9).fill(null)])\n  const [jugadaActual, setJugadaActual] = useState(0)\n  const casillasActuales = historial[jugadaActual]\n\n  function manejarJugada(siguientes) {\n    const nuevoHistorial = [...historial.slice(0, jugadaActual + 1), siguientes]\n    setHistorial(nuevoHistorial)\n    setJugadaActual(nuevoHistorial.length - 1)\n  }\n\n  function irAJugada(jugada) {\n    setJugadaActual(jugada)\n  }\n\n  const jugadas = historial.map((casillas, jugada) => (\n    <li key={jugada}>\n      <button onClick={() => irAJugada(jugada)}>\n        {jugada === 0 ? 'Ir al inicio de la partida' : `Ir a la jugada ${jugada}`}\n      </button>\n    </li>\n  ))\n\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero casillas={casillasActuales} onJugar={manejarJugada} />\n      <section className=\"historial\" aria-labelledby=\"titulo-jugadas\">\n        <h2 id=\"titulo-jugadas\">Jugadas</h2>\n        <ol>{jugadas}</ol>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\nimport { calcularGanador, lineaGanadora } from './ganador'\n\nexport default function Tablero({ casillas, onJugar }) {\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n  const ganador = calcularGanador(casillas)\n  const linea = lineaGanadora(casillas)\n\n  let estado\n  if (ganador) {\n    estado = 'Ganador: ' + ganador\n  } else if (marcas === 9) {\n    estado = 'Empate'\n  } else {\n    estado = 'Siguiente: ' + siguiente\n  }\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    onJugar(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla\n            key={i}\n            numero={i + 1}\n            valor={valor}\n            ganadora={linea !== null && linea.includes(i)}\n            onCasillaClic={() => manejarClic(i)}\n          />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "export default function Casilla({ numero, valor, ganadora, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n  if (ganadora) clases += ' casilla-ganadora'\n\n  let etiqueta = `Casilla ${numero}, ${valor ?? 'vacía'}`\n  if (ganadora) etiqueta += ', ganadora'\n\n  return (\n    <button className={clases} aria-label={etiqueta} onClick={onCasillaClic}>\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": false,
  "comprobaciones": [
    {
      "descripcion": "Al empezar, el botón de la jugada actual dice «Estás en el inicio de la partida»",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Estás en el inicio de la partida"
      }
    },
    {
      "descripcion": "Tras dos jugadas, el botón de la 2 dice «Estás en la jugada 2»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Estás en la jugada 2"
      }
    },
    {
      "descripcion": "Al viajar a la jugada 1, el «Estás en» se va con ella",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ir a la jugada 1"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Estás en la jugada 1"
      }
    },
    {
      "descripcion": "Con «Recientes primero», la lista empieza por el final: su primer «Ir a la jugada» lleva a la 2",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Recientes primero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "texto": "Ir a la jugada"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Estás en la jugada 2"
      }
    },
    {
      "descripcion": "Con la lista al revés, cada botón sigue llevando a su jugada",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 1, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 5, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Casilla 9, vacía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Recientes primero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ir a la jugada 1"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Casilla 5, vacía"
      }
    }
  ]
}
```

## La partida completa

Estos son los cinco archivos con todos los pasos resueltos. Compáralos con los tuyos, juega una partida entera con el panel abierto y lee el resumen de cada commit.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres en raya con viaje en el tiempo",
  "consigna": "Juega, viaja hacia atrás, sigue jugando desde el pasado y da la vuelta a la lista. Una jugada normal renderiza los once componentes y cambia el DOM en cuatro sitios: la casilla, el aviso, el elemento nuevo de la lista y el botón que deja de decir «Estás en».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nexport default function Juego() {\n  const [historial, setHistorial] = useState([Array(9).fill(null)])\n  const [jugadaActual, setJugadaActual] = useState(0)\n  const [recientesPrimero, setRecientesPrimero] = useState(false)\n  const casillasActuales = historial[jugadaActual]\n\n  function manejarJugada(siguientes) {\n    const nuevoHistorial = [...historial.slice(0, jugadaActual + 1), siguientes]\n    setHistorial(nuevoHistorial)\n    setJugadaActual(nuevoHistorial.length - 1)\n  }\n\n  function irAJugada(jugada) {\n    setJugadaActual(jugada)\n  }\n\n  const jugadas = historial.map((casillas, jugada) => {\n    const actual = jugada === jugadaActual\n    let texto\n    if (jugada === 0) {\n      texto = actual ? 'Estás en el inicio de la partida' : 'Ir al inicio de la partida'\n    } else {\n      texto = actual ? `Estás en la jugada ${jugada}` : `Ir a la jugada ${jugada}`\n    }\n    return (\n      <li key={jugada}>\n        <button aria-current={actual ? 'step' : undefined} onClick={() => irAJugada(jugada)}>\n          {texto}\n        </button>\n      </li>\n    )\n  })\n\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero casillas={casillasActuales} onJugar={manejarJugada} />\n      <section className=\"historial\" aria-labelledby=\"titulo-jugadas\">\n        <h2 id=\"titulo-jugadas\">Jugadas</h2>\n        <button aria-pressed={recientesPrimero} onClick={() => setRecientesPrimero(!recientesPrimero)}>\n          Recientes primero\n        </button>\n        <ol>{recientesPrimero ? jugadas.toReversed() : jugadas}</ol>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\nimport { calcularGanador, lineaGanadora } from './ganador'\n\nexport default function Tablero({ casillas, onJugar }) {\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n  const ganador = calcularGanador(casillas)\n  const linea = lineaGanadora(casillas)\n\n  let estado\n  if (ganador) {\n    estado = 'Ganador: ' + ganador\n  } else if (marcas === 9) {\n    estado = 'Empate'\n  } else {\n    estado = 'Siguiente: ' + siguiente\n  }\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    onJugar(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla\n            key={i}\n            numero={i + 1}\n            valor={valor}\n            ganadora={linea !== null && linea.includes(i)}\n            onCasillaClic={() => manejarClic(i)}\n          />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "export default function Casilla({ numero, valor, ganadora, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n  if (ganadora) clases += ' casilla-ganadora'\n\n  let etiqueta = `Casilla ${numero}, ${valor ?? 'vacía'}`\n  if (ganadora) etiqueta += ', ganadora'\n\n  return (\n    <button className={clases} aria-label={etiqueta} onClick={onCasillaClic}>\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Este es el viaje completo de una jugada, de la casilla al DOM:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Una jugada, de principio a fin",
  "items": [
    {
      "fecha": "Clic",
      "titulo": "Casilla avisa",
      "texto": "Pulsas la casilla 5. React llama al onClick de su botón, que es la prop onCasillaClic: la flecha () => manejarClic(4) que Tablero creó para esa casilla. Casilla no sabe qué hace; solo avisa."
    },
    {
      "fecha": "Tablero",
      "titulo": "Las reglas deciden",
      "texto": "manejarClic(4) comprueba que la casilla está libre y que nadie ha ganado, copia el tablero, pone la marca que toca en la copia y se la pasa a onJugar."
    },
    {
      "fecha": "Juego",
      "titulo": "El historial se amplía",
      "texto": "manejarJugada descarta el futuro si lo hay, añade el tablero nuevo y apunta la jugada actual. Son dos llamadas a set en el mismo manejador: un solo render."
    },
    {
      "fecha": "Render",
      "titulo": "Once componentes",
      "texto": "React llama a Juego, que saca del historial el tablero de la jugada actual y se lo pasa a Tablero. Tablero calcula el turno, el ganador, la línea y el aviso, y React llama a las nueve Casilla."
    },
    {
      "fecha": "Commit",
      "titulo": "Cuatro cambios en el DOM",
      "texto": "En una jugada normal, de todo lo calculado el DOM solo cambia en cuatro sitios: la casilla pulsada, el texto del aviso, el elemento nuevo de la lista y el botón que deja de decir «Estás en». Lo demás se queda como estaba."
    }
  ]
}
```

## El estado mínimo de la partida

Mira lo que guarda el juego terminado. Tres variables de estado, las tres en `Juego`:

- `historial`: los tableros por los que ha pasado la partida.
- `jugadaActual`: en cuál de ellos estás.
- `recientesPrimero`: en qué orden se ve la lista.

Todo lo demás se calcula en cada render: el tablero que se ve, cuántas marcas hay, a quién le toca, quién ha ganado, la línea ganadora, el empate, el texto del aviso y la lista de botones. Es el estado mínimo que buscabas en la lección 24, y el método de la lección 31 aplicado a un caso completo. **Cuanto menos se guarda, menos se puede desincronizar.**

## Cuándo lo usarías de verdad

El viaje en el tiempo no es cosa de juegos: es el «Deshacer» y el «Rehacer» de cualquier editor. Una lista de fotos que nadie modifica, un índice que dice cuál se ve y descartar lo que queda por delante cuando haces algo nuevo después de deshacer. Es justo lo que hace un editor de texto si deshaces dos pasos y vuelves a escribir: lo deshecho ya no se puede rehacer.

Funciona porque cada foto sale barata: cada jugada crea un array de nueve posiciones, y las anteriores siguen guardadas tal cual, sin copiarse. Con datos más grandes, la regla de la lección 20 (copiar solo lo que cambia y reutilizar el resto) mantiene el historial ligero. Y cuando las acciones crecen (jugar, viajar, deshacer, empezar de nuevo), lo natural es reunirlas en un reducer, como en la lección 27: es el último reto.

## Errores típicos

**Mutar el tablero que llega por props.** En el paso 2, mutar el estado deja el tablero quieto, y el fallo salta a la vista. Con el historial en `Juego` es más traicionero: si `Tablero` escribe la marca en el array que recibe y se lo pasa a `onJugar`, el juego parece funcionar, porque `[...historial, casillas]` sí es un array nuevo y React renderiza. Pero todas las entradas del historial son el mismo array. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un viaje en el tiempo que no viaja",
  "consigna": "Este Tablero.jsx pone la marca directamente en el array casillas que recibe. Juega tres jugadas: todo parece normal. Ahora pulsa «Ir al inicio de la partida»: el tablero no cambia. En el panel, Tablero solo dice «cambió la prop «onJugar» (función nueva)»: casillas es el mismo array de antes. Arréglalo copiando el array en manejarClic.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nexport default function Juego() {\n  const [historial, setHistorial] = useState([Array(9).fill(null)])\n  const [jugadaActual, setJugadaActual] = useState(0)\n  const [recientesPrimero, setRecientesPrimero] = useState(false)\n  const casillasActuales = historial[jugadaActual]\n\n  function manejarJugada(siguientes) {\n    const nuevoHistorial = [...historial.slice(0, jugadaActual + 1), siguientes]\n    setHistorial(nuevoHistorial)\n    setJugadaActual(nuevoHistorial.length - 1)\n  }\n\n  function irAJugada(jugada) {\n    setJugadaActual(jugada)\n  }\n\n  const jugadas = historial.map((casillas, jugada) => {\n    const actual = jugada === jugadaActual\n    let texto\n    if (jugada === 0) {\n      texto = actual ? 'Estás en el inicio de la partida' : 'Ir al inicio de la partida'\n    } else {\n      texto = actual ? `Estás en la jugada ${jugada}` : `Ir a la jugada ${jugada}`\n    }\n    return (\n      <li key={jugada}>\n        <button aria-current={actual ? 'step' : undefined} onClick={() => irAJugada(jugada)}>\n          {texto}\n        </button>\n      </li>\n    )\n  })\n\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero casillas={casillasActuales} onJugar={manejarJugada} />\n      <section className=\"historial\" aria-labelledby=\"titulo-jugadas\">\n        <h2 id=\"titulo-jugadas\">Jugadas</h2>\n        <button aria-pressed={recientesPrimero} onClick={() => setRecientesPrimero(!recientesPrimero)}>\n          Recientes primero\n        </button>\n        <ol>{recientesPrimero ? jugadas.toReversed() : jugadas}</ol>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\nimport { calcularGanador, lineaGanadora } from './ganador'\n\nexport default function Tablero({ casillas, onJugar }) {\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n  const ganador = calcularGanador(casillas)\n  const linea = lineaGanadora(casillas)\n\n  let estado\n  if (ganador) {\n    estado = 'Ganador: ' + ganador\n  } else if (marcas === 9) {\n    estado = 'Empate'\n  } else {\n    estado = 'Siguiente: ' + siguiente\n  }\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    casillas[i] = siguiente\n    onJugar(casillas)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla\n            key={i}\n            numero={i + 1}\n            valor={valor}\n            ganadora={linea !== null && linea.includes(i)}\n            onCasillaClic={() => manejarClic(i)}\n          />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "export default function Casilla({ numero, valor, ganadora, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n  if (ganadora) clases += ' casilla-ganadora'\n\n  let etiqueta = `Casilla ${numero}, ${valor ?? 'vacía'}`\n  if (ganadora) etiqueta += ', ganadora'\n\n  return (\n    <button className={clases} aria-label={etiqueta} onClick={onCasillaClic}>\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "Tablero.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Tras tres jugadas el historial tiene cuatro entradas, y las cuatro son el mismo array, el del principio, con las tres marcas escritas encima. Ir al inicio es enseñar otra vez ese array. Es lo que avisa el tutorial oficial cuando explica la inmutabilidad: sin copias, el viaje en el tiempo sería muy difícil de construir.

**Llamar a `manejarClic` en vez de pasarla.** Olvidar la flecha en `onCasillaClic` es un despiste tan típico que el tutorial oficial se detiene a explicarlo. Aquí tiene un efecto curioso:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Tablero() {\n  const [casillas, setCasillas] = useState(Array(9).fill(null))\n  // ...marcas, siguiente, ganador y estado, como en el paso 3\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    setCasillas(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla key={i} numero={i + 1} valor={valor} onCasillaClic={manejarClic(i)} />\n        ))}\n      </div>\n    </div>\n  )\n}\n\n// Sin la flecha: onCasillaClic={manejarClic(i)}.\n// ¿Qué ves al abrir la vista previa, antes de pulsar nada?",
  "opciones": [
    "Un tablero vacío cuyas casillas no responden a los clics",
    "El error «Too many re-renders»",
    "Una partida ya terminada: X ha ganado sin que nadie pulse nada",
    "Las nueve casillas con una X"
  ],
  "correcta": 2,
  "explicacion": "manejarClic(i) se ejecuta al renderizar, para las nueve casillas. Cada llamada pide un tablero con una marca más y React se queda con la última petición (lección 19), así que cada render juega una jugada y pide otro. En la séptima, X completa la diagonal 3-5-7; a partir de ahí manejarClic sale antes de llamar a setCasillas y el bucle se para solo. Sin esa salida, como en el paso 2, no pararía nunca: «Too many re-renders»."
}
```

Con el código del paso 2, que todavía no tiene la salida anticipada, el bucle no termina nunca y la vista previa enseña el error que ya conoces de la lección 15:

```text
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

Y con el estado en `Juego`, el mismo despiste hace que `Tablero` cambie el estado de su padre mientras se renderiza. React lo dice en la consola:

```text
Cannot update a component (`Juego`) while rendering a different component (`Tablero`). To locate the bad setState() call inside `Tablero`, follow the stack trace as described in https://react.dev/link/setstate-in-render
```

Es decir: no se puede actualizar un componente (`Juego`) mientras se renderiza otro distinto (`Tablero`). Las tres versiones se arreglan igual: `onCasillaClic={() => manejarClic(i)}`.

**Guardar el turno en su propio estado.** Es lo que hace el tutorial oficial durante casi todo el recorrido, y obliga a acordarse de él en cada sitio que cambia la jugada. Basta con olvidar uno:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Juego() {\n  const [historial, setHistorial] = useState([Array(9).fill(null)])\n  const [jugadaActual, setJugadaActual] = useState(0)\n  const [juegaX, setJuegaX] = useState(true)\n  const casillasActuales = historial[jugadaActual]\n\n  function manejarJugada(siguientes) {\n    const nuevoHistorial = [...historial.slice(0, jugadaActual + 1), siguientes]\n    setHistorial(nuevoHistorial)\n    setJugadaActual(nuevoHistorial.length - 1)\n    setJuegaX(!juegaX)\n  }\n\n  function irAJugada(jugada) {\n    setJugadaActual(jugada)\n  }\n\n  // Tablero pone la marca que le dice juegaX:\n  // <Tablero casillas={casillasActuales} juegaX={juegaX} onJugar={manejarJugada} />\n}\n\n// X juega en la 1, O en la 5 y X en la 9. Pulsas «Ir a la jugada 2»\n// y después la casilla 3. ¿Qué marca aparece en ella?",
  "opciones": [
    "Una X: en la jugada 2 le toca a X",
    "Una O: juegaX sigue como estaba después de la jugada 3",
    "Ninguna: desde el pasado no se puede jugar"
  ],
  "correcta": 1,
  "explicacion": "Tras tres jugadas, juegaX vale false. irAJugada cambia la jugada, pero no el turno, así que en la jugada 2, con dos marcas en el tablero, el aviso dice «Siguiente: O» y la casilla 3 recibe una O: dos O seguidas. Se puede parchear con setJuegaX(jugada % 2 === 0) en irAJugada, pero lo sano es no tener esa variable: el turno se calcula del tablero."
}
```

**Usar la posición en la lista como `key`.** Para dar la vuelta a la lista, otra forma que parece igual de buena es dar la vuelta a los datos y calcular el número de cada jugada a partir de la posición. Los textos salen bien y cada botón lleva a su jugada, pero la `key` pasa a ser la posición:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La key, atada a la posición",
  "consigna": "Activa «Recientes primero» y juega cinco jugadas mirando el panel y la vista previa. Cada jugada cambia un elemento más del DOM que la anterior: en la quinta, 8 cambios, y el recuadro ámbar rodea todos los botones de la lista. Cambia key={i} por key={jugada} y repite: 4 cambios en cada jugada, y en la lista el recuadro solo marca las dos primeras filas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nexport default function Juego() {\n  const [historial, setHistorial] = useState([Array(9).fill(null)])\n  const [jugadaActual, setJugadaActual] = useState(0)\n  const [recientesPrimero, setRecientesPrimero] = useState(false)\n  const casillasActuales = historial[jugadaActual]\n\n  function manejarJugada(siguientes) {\n    const nuevoHistorial = [...historial.slice(0, jugadaActual + 1), siguientes]\n    setHistorial(nuevoHistorial)\n    setJugadaActual(nuevoHistorial.length - 1)\n  }\n\n  function irAJugada(jugada) {\n    setJugadaActual(jugada)\n  }\n\n  const orden = recientesPrimero ? historial.toReversed() : historial\n  const jugadas = orden.map((casillas, i) => {\n    const jugada = recientesPrimero ? historial.length - 1 - i : i\n    const actual = jugada === jugadaActual\n    let texto\n    if (jugada === 0) {\n      texto = actual ? 'Estás en el inicio de la partida' : 'Ir al inicio de la partida'\n    } else {\n      texto = actual ? `Estás en la jugada ${jugada}` : `Ir a la jugada ${jugada}`\n    }\n    return (\n      <li key={i}>\n        <button aria-current={actual ? 'step' : undefined} onClick={() => irAJugada(jugada)}>\n          {texto}\n        </button>\n      </li>\n    )\n  })\n\n  return (\n    <main className=\"juego\">\n      <h1>Tres en raya</h1>\n      <Tablero casillas={casillasActuales} onJugar={manejarJugada} />\n      <section className=\"historial\" aria-labelledby=\"titulo-jugadas\">\n        <h2 id=\"titulo-jugadas\">Jugadas</h2>\n        <button aria-pressed={recientesPrimero} onClick={() => setRecientesPrimero(!recientesPrimero)}>\n          Recientes primero\n        </button>\n        <ol>{jugadas}</ol>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import Casilla from './Casilla'\nimport { calcularGanador, lineaGanadora } from './ganador'\n\nexport default function Tablero({ casillas, onJugar }) {\n  const marcas = casillas.filter((valor) => valor !== null).length\n  const siguiente = marcas % 2 === 0 ? 'X' : 'O'\n  const ganador = calcularGanador(casillas)\n  const linea = lineaGanadora(casillas)\n\n  let estado\n  if (ganador) {\n    estado = 'Ganador: ' + ganador\n  } else if (marcas === 9) {\n    estado = 'Empate'\n  } else {\n    estado = 'Siguiente: ' + siguiente\n  }\n\n  function manejarClic(i) {\n    if (casillas[i] || ganador) return\n    const siguientes = casillas.slice()\n    siguientes[i] = siguiente\n    onJugar(siguientes)\n  }\n\n  return (\n    <div className=\"partida\">\n      <p className=\"estado\" role=\"status\">{estado}</p>\n      <div className=\"tablero\" role=\"group\" aria-label=\"Tablero\">\n        {casillas.map((valor, i) => (\n          <Casilla\n            key={i}\n            numero={i + 1}\n            valor={valor}\n            ganadora={linea !== null && linea.includes(i)}\n            onCasillaClic={() => manejarClic(i)}\n          />\n        ))}\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Casilla.jsx",
      "codigo": "export default function Casilla({ numero, valor, ganadora, onCasillaClic }) {\n  let clases = 'casilla'\n  if (valor === 'O') clases += ' casilla-o'\n  if (ganadora) clases += ' casilla-ganadora'\n\n  let etiqueta = `Casilla ${numero}, ${valor ?? 'vacía'}`\n  if (ganadora) etiqueta += ', ganadora'\n\n  return (\n    <button className={clases} aria-label={etiqueta} onClick={onCasillaClic}>\n      {valor}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "ganador.jsx",
      "codigo": "// Las ocho líneas del tablero, con las posiciones del array casillas (de 0 a 8).\nconst LINEAS = [\n  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas\n  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas\n  [0, 4, 8], [2, 4, 6], // diagonales\n]\n\n// Las tres posiciones de la línea ganadora, o null si nadie ha hecho tres en raya.\nexport function lineaGanadora(casillas) {\n  const linea = LINEAS.find(\n    ([a, b, c]) => casillas[a] !== null && casillas[a] === casillas[b] && casillas[a] === casillas[c],\n  )\n  return linea ?? null\n}\n\n// 'X', 'O' o null.\nexport function calcularGanador(casillas) {\n  const linea = lineaGanadora(casillas)\n  return linea ? casillas[linea[0]] : null\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "* {\n  box-sizing: border-box;\n}\n\nbody {\n  margin: 0;\n  padding: 1rem;\n  background-color: #fbfaf5;\n  background-image:\n    linear-gradient(#dde5ee 1px, transparent 1px),\n    linear-gradient(90deg, #dde5ee 1px, transparent 1px);\n  background-size: 1.25rem 1.25rem;\n  color: #1e293b;\n  font-family: system-ui, sans-serif;\n}\n\n.juego {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: flex-start;\n  gap: 1rem 2.5rem;\n}\n\n.juego h1 {\n  flex-basis: 100%;\n  margin: 0;\n  font-size: 1.5rem;\n}\n\n.estado {\n  margin: 0 0 0.75rem;\n  font-weight: 600;\n}\n\n/* El tablero: 3 × 3 casillas, y las cuatro rayas del # como bordes */\n.tablero {\n  display: grid;\n  grid-template-columns: repeat(3, 4.5rem);\n  grid-template-rows: repeat(3, 4.5rem);\n}\n\n.casilla {\n  padding: 0;\n  border: 0;\n  background: transparent;\n  color: #1d4ed8;\n  font: 700 2.75rem/1 'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive;\n  cursor: pointer;\n}\n\n.casilla:not(:nth-child(3n)) {\n  border-right: 3px solid #334155;\n}\n\n.casilla:nth-child(-n + 6) {\n  border-bottom: 3px solid #334155;\n}\n\n.casilla-o {\n  color: #b91c1c;\n}\n\n.casilla:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: -6px;\n}\n\n/* El subrayador de la línea ganadora */\n.casilla-ganadora {\n  background: #fde047;\n}\n\n.historial {\n  min-width: 13rem;\n}\n\n.historial h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\n.historial ol {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0 0;\n  padding: 0;\n  list-style: none;\n}\n\n.historial button {\n  padding: 0.25rem 0.6rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  background: #fff;\n  color: inherit;\n  font: inherit;\n  cursor: pointer;\n}\n\n.historial button[aria-pressed='true'] {\n  border-color: #1d4ed8;\n  background: #dbeafe;\n}\n\n.historial button[aria-current] {\n  border-color: transparent;\n  background: transparent;\n  font-weight: 700;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Con `key={i}`, la key 0 es siempre la fila de arriba, sea cual sea la jugada que tenga. Cuando llega una jugada nueva, React ve que la key 0 sigue ahí y le cambia el texto, y lo mismo a la 1, a la 2...: reescribe todos los botones y añade uno al final. Con `key={jugada}` ve una jugada nueva arriba, la inserta y deja las demás donde estaban.

Aquí solo se nota en el panel, porque los botones de la lista no guardan nada. Pero si cada fila tuviera algo propio, como los campos de las notas de la lección 11 o un estado (lección 26), ese algo saltaría de una jugada a otra. Con la lista en orden de juego, la posición y el número de jugada coinciden, y por eso el tutorial oficial usa el índice sin problema; **en cuanto la lista se da la vuelta, dejan de coincidir**.

## Lo que has aprendido

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Los hijos avisan, el padre decide",
      "texto": "Casilla no sabe qué pasa al pulsarla: llama a onCasillaClic. Tablero no guarda nada: llama a onJugar. Decide quien tiene el estado."
    },
    {
      "titulo": "El estado sube hasta donde se necesita",
      "texto": "Primero a Tablero, para coordinar las nueve casillas; después a Juego, para que el tablero y la lista compartan el historial. Cada subida hace que el render empiece un nivel más arriba."
    },
    {
      "titulo": "Copiar en vez de mutar",
      "texto": "slice, el spread y toReversed crean arrays nuevos. Así React ve el cambio, y cada tablero del historial es una foto que nadie toca: eso es lo que hace posible el viaje en el tiempo."
    },
    {
      "titulo": "Calcular en vez de guardar",
      "texto": "El turno, el ganador, el empate, la línea ganadora y el aviso salen del tablero en cada render. Lo que no se guarda no se puede desincronizar."
    },
    {
      "titulo": "Re-render no es repintar",
      "texto": "Una jugada normal ejecuta once componentes y cambia el DOM en solo cuatro sitios. Las casillas se renderizan porque se renderiza su padre, y React solo toca lo que ha cambiado."
    },
    {
      "titulo": "La key identifica, no ordena",
      "texto": "El número de jugada sirve de key porque identifica a la jugada. Si la lista se da la vuelta, la key tiene que irse con la jugada, no quedarse en la posición."
    }
  ]
}
```

## Retos para seguir practicando

Parte de la partida completa. Estos no tienen comprobación automática:

1. **«Deshacer» y «Rehacer».** Dos botones que mueven `jugadaActual` una posición atrás o adelante, desactivados con `disabled` cuando no hay adónde ir. No necesitan estado nuevo.
2. **Dónde se jugó cada jugada**: «Ir a la jugada 3 (fila 2, columna 1)». No lo guardes: compara `historial[jugada - 1]` con `historial[jugada]` con `findIndex` para saber qué posición cambió. La fila es `Math.floor(i / 3) + 1`, y la columna, `i % 3 + 1`.
3. **Un marcador** de victorias de X, de O y de empates, con un botón «Nueva partida» que vacíe el historial. Piensa dónde vive el marcador y en qué momento se suma: si sumas al ganar, volver una jugada atrás y repetir la jugada ganadora contaría la misma partida dos veces.
4. **Juego con `useReducer`** (lección 27): un reducer con las acciones `{ tipo: 'jugar', casillas }` e `{ tipo: 'ir', jugada }`. Toda la lógica del historial queda en una función que puedes probar sin pintar nada.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Tutorial: Tic-Tac-Toe",
      "descripcion": "El original, de cero: Square, Board y Game, la explicación de por qué importa la inmutabilidad y la lista de mejoras con la que termina.",
      "url": "https://react.dev/learn/tutorial-tic-tac-toe",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Sharing State Between Components",
      "descripcion": "Levantar el estado al padre común, componentes controlados y no controlados, y una sola fuente de verdad para cada dato.",
      "url": "https://react.dev/learn/sharing-state-between-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Choosing the State Structure",
      "descripcion": "Los principios que dejan el turno fuera del estado: evitar el estado redundante, las contradicciones y los duplicados.",
      "url": "https://react.dev/learn/choosing-the-state-structure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Updating Arrays in State",
      "descripcion": "Qué métodos mutan y cuáles devuelven un array nuevo, con slice, el spread y toReversed entre los segundos.",
      "url": "https://react.dev/learn/updating-arrays-in-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "aria-current",
      "descripcion": "Los valores de aria-current, step incluido, y el ejemplo de las migas de pan en el que el enlace actual sigue siendo un enlace.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Button Pattern",
      "descripcion": "Botones normales y botones de alternar con aria-pressed, como «Recientes primero».",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
      "etiqueta": "WAI-ARIA APG"
    }
  ]
}
```
