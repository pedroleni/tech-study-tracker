# `useReducer`: sacar la lógica del componente

- **Módulo:** Gestionar el estado
- **Slug:** `usereducer-sacar-la-logica-del-componente` (autogenerado del título)
- **Orden:** 270
- **Fuentes:** [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) + [useReducer](https://react.dev/reference/react/useReducer) — ver `contenido/react/TEMARIO.md` #27

---

## Qué es y para qué sirve

Con `useState`, cada manejador de eventos calcula el estado siguiente y lo guarda: `setTareas([...tareas, nueva])`, `setTareas(tareas.filter(...))`... Con dos manejadores no hay problema. Con seis, repartidos por el JSX y por varios componentes, **para saber todas las formas en que puede cambiar un estado tienes que leer el componente entero**.

`useReducer` propone otra organización. Los manejadores dejan de calcular el estado: solo cuentan **qué ha pasado** («se ha añadido una tarea», «se ha marcado la tarea 2»). Y toda la lógica de actualización se va a una sola función, fuera del componente, que recibe el estado actual y lo que ha pasado, y devuelve el estado siguiente. A esa función se la llama **reductor** (*reducer*, en inglés).

> **Los manejadores dicen qué ha pasado; el reductor decide cómo cambia el estado.**

Esta es la lista de tareas de una mudanza, hecha con lo que ya sabes: un estado `tareas` en `App` y cuatro manejadores que lo actualizan.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La lista de la mudanza, con useState",
  "consigna": "Añade una tarea, marca otra como hecha y pulsa «Quitar las hechas»: todo funciona. Después mira App.jsx y cuenta cuántas funciones llaman a setTareas, y cuántas formas distintas de calcular la lista nueva hay.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport NuevaTarea from './NuevaTarea'\nimport ListaTareas from './ListaTareas'\nimport './estilos.css'\n\nlet siguienteId = 4\n\nconst tareasIniciales = [\n  { id: 1, texto: 'Pedir presupuesto a la empresa de mudanzas', hecha: true },\n  { id: 2, texto: 'Dar de alta la luz en el piso nuevo', hecha: false },\n  { id: 3, texto: 'Comprar cajas y cinta de embalar', hecha: false },\n]\n\nexport default function App() {\n  const [tareas, setTareas] = useState(tareasIniciales)\n\n  function manejarAnadir(texto) {\n    setTareas([...tareas, { id: siguienteId++, texto, hecha: false }])\n  }\n\n  function manejarMarcar(id) {\n    setTareas(tareas.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)))\n  }\n\n  function manejarBorrar(id) {\n    setTareas(tareas.filter((t) => t.id !== id))\n  }\n\n  function manejarQuitarHechas() {\n    setTareas(tareas.filter((t) => !t.hecha))\n  }\n\n  const pendientes = tareas.filter((t) => !t.hecha).length\n\n  return (\n    <main>\n      <h1>Mudanza al piso nuevo</h1>\n      <NuevaTarea onAnadir={manejarAnadir} />\n      <ListaTareas tareas={tareas} onMarcar={manejarMarcar} onBorrar={manejarBorrar} />\n      <p>Pendientes: {pendientes}</p>\n      <button onClick={manejarQuitarHechas}>Quitar las hechas</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "NuevaTarea.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function NuevaTarea({ onAnadir }) {\n  const [texto, setTexto] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (texto.trim() === '') return\n    onAnadir(texto.trim())\n    setTexto('')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nueva tarea\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "ListaTareas.jsx",
      "codigo": "export default function ListaTareas({ tareas, onMarcar, onBorrar }) {\n  return (\n    <ul className=\"tareas\">\n      {tareas.map((tarea) => (\n        <li key={tarea.id}>\n          <label className={tarea.hecha ? 'hecha' : ''}>\n            <input type=\"checkbox\" checked={tarea.hecha} onChange={() => onMarcar(tarea.id)} />\n            {tarea.texto}\n          </label>\n          <button aria-label={'Borrar «' + tarea.texto + '»'} onClick={() => onBorrar(tarea.id)}>\n            Borrar\n          </button>\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tareas {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tareas li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tareas label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Cuatro manejadores, cuatro maneras de construir el array siguiente. No hay ningún fallo, pero sí un problema de crecimiento: si mañana la lista permite renombrar, reordenar y deshacer, serán siete manejadores, cada uno con su trozo de lógica de actualización mezclado con el JSX. Y cuando la lista salga mal, el culpable puede estar en cualquiera de ellos.

## De `useState` a `useReducer` en tres pasos

La migración es mecánica, y se hace siempre igual:

1. **Despachar acciones** desde los manejadores, en vez de fijar el estado.
2. **Escribir el reductor**: la función que calcula el estado siguiente.
3. **Usar el reductor** en el componente con `useReducer`.

### Paso 1: despachar acciones en vez de fijar el estado

Un manejador con `useState` dice **qué hacer** con el estado. Con un reductor, dice **qué ha hecho la persona**:

```jsx
// Antes: el manejador calcula la lista nueva
function manejarMarcar(id) {
  setTareas(tareas.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)))
}

// Después: el manejador cuenta qué ha pasado
function manejarMarcar(id) {
  dispatch({ type: 'marcada', id })
}
```

El objeto que le pasas a `dispatch` se llama **acción**. Así quedan los cuatro manejadores (la función `dispatch` aparece en el paso 3):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function manejarAnadir(texto) {\n  dispatch({ type: 'anadida', id: siguienteId++, texto })\n}\n\nfunction manejarMarcar(id) {\n  dispatch({ type: 'marcada', id })\n}\n\nfunction manejarBorrar(id) {\n  dispatch({ type: 'borrada', id })\n}\n\nfunction manejarQuitarHechas() {\n  dispatch({ type: 'hechas_quitadas' })\n}",
  "anotaciones": [
    {
      "fragmento": "{ type: 'marcada', id }",
      "nota": "Una acción es un objeto normal de JavaScript. Su forma la decides tú, pero la convención es una propiedad type con un texto que dice qué ha pasado, y al lado los datos que hagan falta para calcular el cambio: aquí, qué tarea."
    },
    {
      "fragmento": "'anadida'",
      "nota": "Los nombres cuentan un hecho en pasado: anadida, marcada, borrada. Sin eñe a propósito: el type es un texto que vas a escribir en dos sitios, el manejador y el reductor, y tiene que coincidir letra a letra."
    },
    {
      "fragmento": "id: siguienteId++",
      "nota": "El id nuevo se genera aquí, en el manejador, y viaja dentro de la acción. Un manejador puede cambiar cosas de fuera, como esta variable; el reductor no. Verás por qué más abajo."
    },
    {
      "fragmento": "dispatch({ type: 'hechas_quitadas' })",
      "nota": "Una acción sin más datos: el reductor ya tiene la lista y sabe cuáles están hechas. Cuando el nombre necesita dos palabras, lo habitual es unirlas con un guion bajo."
    }
  ]
}
```

### Paso 2: escribir el reductor

El reductor es una función con dos parámetros, **el estado actual y la acción**, que **devuelve el estado siguiente**. React guardará como estado lo que devuelva. Toda la lógica que antes estaba repartida entre los manejadores cabe en ella:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    case 'hechas_quitadas': {\n      return tareas.filter((t) => !t.hecha)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "function tareasReducer(tareas, accion)",
      "nota": "Recibe todo lo que necesita como argumento, así que no depende de nada del componente: se declara fuera, o incluso en su propio archivo. Se suele llamar como lo que gestiona seguido de Reducer: tareasReducer, cestaReducer."
    },
    {
      "fragmento": "switch (accion.type)",
      "nota": "Por convención, un switch con un case por tipo de acción. Con if y else if funciona exactamente igual; el switch se lee mejor de un vistazo cuando hay muchas."
    },
    {
      "fragmento": "case 'anadida': {",
      "nota": "Cada case entre llaves, para que las constantes de un caso no choquen con las de otro, y terminado en return. Sin return, la ejecución sigue en el case de debajo."
    },
    {
      "fragmento": "return [...tareas, { id: accion.id, texto: accion.texto, hecha: false }]",
      "nota": "Las reglas de las lecciones 20 y 21 siguen valiendo: el reductor no modifica el array que recibe, devuelve uno nuevo. Fíjate en que la lógica es la misma que había en los manejadores; solo ha cambiado de sitio."
    },
    {
      "fragmento": "default: {",
      "nota": "Si llega una acción que el reductor no conoce, lanza un error en vez de callarse. Tiene su propio apartado más abajo."
    }
  ]
}
```

### Paso 3: usar el reductor en el componente

Solo queda conectar el reductor con React. `useReducer` se parece mucho a `useState`: recibe el reductor y el estado inicial, y devuelve un par con **el estado actual y la función `dispatch`**:

```jsx
// Antes
const [tareas, setTareas] = useState(tareasIniciales)

// Después
const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)
```

Aquí está la mudanza completa con el reductor, en un solo archivo para poder recorrerla de arriba abajo. Funciona igual que la de antes:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La misma mudanza, con useReducer",
  "codigo": "import { useReducer, useState } from 'react'\nimport './estilos.css'\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    case 'hechas_quitadas': {\n      return tareas.filter((t) => !t.hecha)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nlet siguienteId = 4\n\nconst tareasIniciales = [\n  { id: 1, texto: 'Pedir presupuesto a la empresa de mudanzas', hecha: true },\n  { id: 2, texto: 'Dar de alta la luz en el piso nuevo', hecha: false },\n  { id: 3, texto: 'Comprar cajas y cinta de embalar', hecha: false },\n]\n\nexport default function App() {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n  const [texto, setTexto] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (texto.trim() === '') return\n    dispatch({ type: 'anadida', id: siguienteId++, texto: texto.trim() })\n    setTexto('')\n  }\n\n  const pendientes = tareas.filter((t) => !t.hecha).length\n\n  return (\n    <main>\n      <h1>Mudanza al piso nuevo</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nueva tarea\n          <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n        </label>\n        <button>Añadir</button>\n      </form>\n      <ul className=\"tareas\">\n        {tareas.map((tarea) => (\n          <li key={tarea.id}>\n            <label className={tarea.hecha ? 'hecha' : ''}>\n              <input\n                type=\"checkbox\"\n                checked={tarea.hecha}\n                onChange={() => dispatch({ type: 'marcada', id: tarea.id })}\n              />\n              {tarea.texto}\n            </label>\n            <button\n              aria-label={'Borrar «' + tarea.texto + '»'}\n              onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n            >\n              Borrar\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p>Pendientes: {pendientes}</p>\n      <button onClick={() => dispatch({ type: 'hechas_quitadas' })}>Quitar las hechas</button>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tareas {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tareas li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tareas label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}",
  "anotaciones": [
    {
      "fragmento": "import { useReducer, useState } from 'react'",
      "nota": "useReducer es un Hook, con las mismas reglas que useState: se llama en el nivel superior del componente, nunca dentro de un if o de un bucle."
    },
    {
      "fragmento": "useReducer(tareasReducer, tareasIniciales)",
      "nota": "El primer argumento es el reductor; el segundo, el estado inicial. Igual que con useState, el valor inicial solo cuenta en el primer render."
    },
    {
      "fragmento": "const [tareas, dispatch]",
      "nota": "Devuelve el estado actual y una función para despachar acciones. Cuando despachas una, React llama a tareasReducer con el estado actual y tu acción, guarda lo que devuelve y vuelve a renderizar."
    },
    {
      "fragmento": "dispatch({ type: 'marcada', id: tarea.id })",
      "nota": "Los manejadores se quedan en una línea. Ya no saben cómo es la lista nueva: solo avisan de lo que ha pasado."
    },
    {
      "fragmento": "const [texto, setTexto] = useState('')",
      "nota": "useState y useReducer conviven sin problema. El texto del campo es un dato sencillo que solo cambia de una forma: no gana nada metiéndolo en el reductor."
    },
    {
      "fragmento": "const pendientes = tareas.filter((t) => !t.hecha).length",
      "nota": "Lo que se puede calcular sigue sin ser estado (lección 24): ni en useState ni en el reductor."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Lo que ha cambiado no es lo que hace la aplicación, sino **dónde vive cada cosa**. Si quieres saber todas las formas en que puede cambiar `tareas`, ya no tienes que leer el JSX: están todas en `tareasReducer`, una por `case`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro piezas y quién hace qué",
  "roles": [
    {
      "etiqueta": "Manejador",
      "rol": "Cuenta qué ha pasado",
      "descripcion": "Responde al clic o al envío y despacha una acción. No sabe cómo se calcula el estado nuevo."
    },
    {
      "etiqueta": "Acción",
      "rol": "El mensaje",
      "descripcion": "Un objeto con type y los datos justos: { type: 'borrada', id: 2 }."
    },
    {
      "etiqueta": "dispatch",
      "rol": "El cartero",
      "descripcion": "Se lo entrega a React, que llamará al reductor con el estado actual y esa acción, y renderizará con el resultado."
    },
    {
      "etiqueta": "Reductor",
      "rol": "Decide el estado siguiente",
      "descripcion": "Una función pura, fuera del componente: con el mismo estado y la misma acción devuelve siempre el mismo resultado."
    }
  ]
}
```

## Por qué se llama reductor

El nombre viene del método `reduce` de los arrays, que ya conoces del temario de JavaScript: recorre una lista y va **acumulando** un resultado, llamando a una función con «lo acumulado hasta ahora» y el elemento siguiente. Un reductor de React tiene exactamente esa forma: «el estado hasta ahora» y la acción siguiente.

Tanto es así que puedes pasarle tu reductor a `reduce` tal cual, sin React por ningún lado:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// tareasReducer es el de arriba, sin tocar\nconst acciones = [\n  { type: 'anadida', id: 1, texto: 'Comprar cajas' },\n  { type: 'anadida', id: 2, texto: 'Desmontar la cama' },\n  { type: 'marcada', id: 1 },\n  { type: 'anadida', id: 3, texto: 'Vaciar la nevera' },\n  { type: 'borrada', id: 2 },\n]\n\nconst final = acciones.reduce(tareasReducer, [])\n\n// ¿Qué hay en final?",
  "opciones": [
    "Tres tareas: «Comprar cajas» (hecha), «Desmontar la cama» y «Vaciar la nevera»",
    "Dos tareas: «Comprar cajas» (hecha) y «Vaciar la nevera»",
    "Dos tareas: «Comprar cajas» y «Vaciar la nevera», ninguna hecha",
    "Un error: reduce no sabe qué hacer con un switch"
  ],
  "correcta": 1,
  "explicacion": "reduce empieza con [] y llama a tareasReducer con lo acumulado y cada acción, en orden: añade dos tareas, marca la 1, añade la 3 y borra la 2. Es lo mismo que hace React, solo que repartido en el tiempo: cada dispatch es un paso más de ese reduce."
}
```

Esa es la idea que conviene quedarse: **el estado de un componente con reductor es el resultado de aplicar, una tras otra, todas las acciones que han pasado**. Si guardas la lista de acciones, puedes reconstruir cualquier momento, y por eso los reductores se llevan tan bien con el «deshacer» y con la depuración.

## Las acciones cuentan qué ha pasado

La forma de la acción la decides tú, pero hay unas costumbres que hacen que el reductor se lea solo:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un hecho, no una orden",
      "texto": "marcada, borrada o pedido_cancelado describen lo que ha hecho la persona. poner_hecha_a_true o actualizar_lista describen cómo cambiar el estado, y eso es justo lo que le toca decidir al reductor."
    },
    {
      "titulo": "Los datos justos",
      "texto": "La acción lleva lo mínimo para calcular el cambio: el id de la tarea, el texto escrito. Si mandas la lista nueva entera, el cálculo ha vuelto al manejador y el reductor ya no hace nada."
    },
    {
      "titulo": "Una interacción, una acción",
      "texto": "Si «Vaciar el formulario» pone en blanco cinco campos, es una acción, formulario_vaciado, aunque cambie cinco datos. Cinco acciones campo_cambiado contarían algo que no ha pasado."
    },
    {
      "titulo": "Un registro que se lee como una historia",
      "texto": "Si apuntaras cada acción que llega, deberías poder reconstruir qué hizo la persona y en qué orden. Es la prueba de que los nombres están bien elegidos."
    },
    {
      "titulo": "El type es cosa de tu componente",
      "texto": "No hay nombres reservados: anadida o tarea_anadida valen igual. Lo que importa es usar siempre el mismo en el manejador y en el reductor."
    }
  ]
}
```

## El reductor tiene que ser puro

Las acciones no se aplican en la línea del `dispatch`: React las pone en cola y **ejecuta el reductor durante el siguiente render**, igual que hace con las funciones actualizadoras de la lección 19. Y todo lo que corre durante el render tiene que ser **puro** (lección 12): con el mismo estado y la misma acción, devolver siempre lo mismo, sin cambiar nada de fuera. Nada de peticiones al servidor, temporizadores, `Math.random()`, mutaciones del estado ni variables externas que se incrementan.

Para ayudarte a cumplirlo, `StrictMode` hace lo de siempre: **en desarrollo llama dos veces al reductor por cada acción** y se queda con uno de los resultados. Este reductor numera las cajas de la mudanza con un contador de fuera:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "let ultimoNumero = 0\n\nfunction cajasReducer(cajas, accion) {\n  switch (accion.type) {\n    case 'caja_anadida': {\n      ultimoNumero = ultimoNumero + 1\n      return [...cajas, { numero: ultimoNumero, habitacion: accion.habitacion }]\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\n// App pinta cada caja como «Caja n.º {caja.numero}».\n// Con StrictMode activado, pulsas «Añadir caja» dos veces.\n// ¿Qué etiquetas salen?",
  "opciones": [
    "Caja n.º 1 y Caja n.º 2",
    "Caja n.º 1 y Caja n.º 3",
    "Caja n.º 2 y Caja n.º 4",
    "Cuatro cajas, de la n.º 1 a la n.º 4"
  ],
  "correcta": 2,
  "explicacion": "StrictMode llama dos veces al reductor por cada acción. La primera llamada sube ultimoNumero a 1, la segunda a 2, y React se queda con el resultado de la segunda: Caja n.º 2. En el segundo clic, 3 y 4, y se queda con la 4. Las cajas no se duplican, porque cada llamada parte del mismo estado; lo que se duplica es el cambio en la variable de fuera."
}
```

Compruébalo con la consola a la vista: cada clic deja dos mensajes del reductor.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un reductor que numera cajas con un contador de fuera",
  "consigna": "Añade dos o tres cajas y mira los números y la consola. Después arréglalo sin quitar StrictMode: borra ultimoNumero y calcula el número a partir del estado, como la caja con el número más alto más uno (o 1 si no hay ninguna).",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer, useState } from 'react'\nimport './estilos.css'\n\nlet ultimoNumero = 0\n\nfunction cajasReducer(cajas, accion) {\n  switch (accion.type) {\n    case 'caja_anadida': {\n      ultimoNumero = ultimoNumero + 1\n      console.log('El reductor numera la caja', ultimoNumero)\n      return [...cajas, { numero: ultimoNumero, habitacion: accion.habitacion }]\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nexport default function App() {\n  const [cajas, dispatch] = useReducer(cajasReducer, [])\n  const [habitacion, setHabitacion] = useState('Cocina')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    dispatch({ type: 'caja_anadida', habitacion })\n  }\n\n  return (\n    <main>\n      <h1>Etiquetas para las cajas</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Habitación\n          <select value={habitacion} onChange={(e) => setHabitacion(e.target.value)}>\n            <option>Cocina</option>\n            <option>Salón</option>\n            <option>Dormitorio</option>\n          </select>\n        </label>\n        <button>Añadir caja</button>\n      </form>\n      <ul className=\"cajas\">\n        {cajas.map((caja) => (\n          <li key={caja.numero}>\n            Caja n.º {caja.numero} · {caja.habitacion}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nselect,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.cajas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cajas li {\n  padding: 0.6rem 0.8rem;\n  border: 2px solid #a16207;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

Hay dos arreglos limpios, y los dos sacan el cambio de fuera del reductor:

- **Calcularlo a partir del estado**, que es lo que pide el bloque: `const numero = cajas.length === 0 ? 1 : Math.max(...cajas.map((c) => c.numero)) + 1`. Llamarlo dos veces da el mismo número.
- **Generarlo en el manejador** y mandarlo en la acción, como el `siguienteId++` de la mudanza: `dispatch({ type: 'caja_anadida', numero: siguienteNumero++, habitacion })`. El manejador se ejecuta una sola vez por clic, y en él sí se puede cambiar lo que quieras (lección 12).

El `console.log` dentro del reductor es, además, una forma de depurar que propone la propia documentación de React: ves cada acción y el estado que produce. Solo recuerda que, con `StrictMode`, sale dos veces.

## Un `switch` con un `default` que lanza

El `type` es un texto, y los textos admiten erratas. En un teclado español, escribir `'añadida'` en el manejador cuando el reductor espera `'anadida'` es cuestión de tiempo. Este reductor no tiene `default`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una errata en el type, sin default",
  "consigna": "Escribe una tarea y pulsa «Añadir». Lee el error y busca dónde está el fallo de verdad. Después, antes de arreglar la errata, añade al switch un default que lance Error('Acción desconocida: ' + accion.type) y repite.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer, useState } from 'react'\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto }]\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n  }\n}\n\nlet siguienteId = 2\n\nexport default function App() {\n  const [tareas, dispatch] = useReducer(tareasReducer, [\n    { id: 1, texto: 'Avisar al casero de la fecha de salida' },\n  ])\n  const [texto, setTexto] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    dispatch({ type: 'añadida', id: siguienteId++, texto })\n    setTexto('')\n  }\n\n  return (\n    <main>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nueva tarea\n          <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n        </label>\n        <button>Añadir</button>\n      </form>\n      <ul>\n        {tareas.map((t) => (\n          <li key={t.id}>{t.texto}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Sin `default`, ningún `case` coincide, el `switch` termina y la función acaba sin `return`: devuelve `undefined`. React guarda `undefined` como estado, y el error salta más tarde, en otro sitio, cuando el JSX intenta recorrerlo:

```text
Cannot read properties of undefined (reading 'map')
```

Es decir: no se puede leer la propiedad `map` de `undefined`. El mensaje señala al `tareas.map` del JSX, que está bien, y no dice nada de la acción. Con el `default` que lanza, el error sale en el momento y en el sitio exactos:

```text
Acción desconocida: añadida
```

Por eso es costumbre terminar todos los reductores igual. Son tres líneas, y convierten un fallo silencioso en uno que se explica solo. Si la escribes después del `switch`, fuera de él, funciona igual: la documentación de React usa las dos formas. TypeScript va un paso más allá y detecta la errata antes de ejecutar nada (lección 73).

## El estado inicial, calculado una sola vez

`useReducer` acepta un **tercer argumento**: una función inicializadora. Con él, React no usa el segundo argumento como estado inicial, sino que llama a `inicializar(segundoArgumento)` y usa lo que devuelva.

¿Para qué sirve? Para lo mismo que pasarle una función a `useState`, que viste en la lección 16: que un estado inicial costoso **se calcule solo al crear el componente**, y no en cada render.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// 1. Se calcula en cada render, aunque React solo use el primer resultado\nconst [tareas, dispatch] = useReducer(tareasReducer, crearTareas(habitaciones))\n\n// 2. Se calcula una vez: React llama a crearTareas(habitaciones) al crear el estado\nconst [tareas, dispatch] = useReducer(tareasReducer, habitaciones, crearTareas)\n\n// 3. Si el inicializador no necesita ningún dato, el segundo argumento puede ser null\nconst [tareas, dispatch] = useReducer(tareasReducer, null, crearTareasDeEjemplo)",
  "anotaciones": [
    {
      "fragmento": "crearTareas(habitaciones))",
      "nota": "Con paréntesis, JavaScript llama a crearTareas antes de llamar a useReducer, en cada render. React tira el resultado desde el segundo render, pero el trabajo ya está hecho."
    },
    {
      "fragmento": "habitaciones, crearTareas)",
      "nota": "La función sin paréntesis y su argumento por separado. React hace la llamada él, solo al crear el estado. Con StrictMode, dos veces en ese primer render, para comprobar que es pura."
    },
    {
      "fragmento": "null, crearTareasDeEjemplo",
      "nota": "React siempre llama al inicializador con el segundo argumento. Si no le hace falta nada, se le pasa null y la función lo ignora."
    }
  ]
}
```

Pruébalo en una lista que se genera a partir de las habitaciones del piso:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lista que se prepara en cada render",
  "consigna": "Mira la consola y marca un par de tareas: cada clic vuelve a preparar la lista entera, dos veces. Cambia la llamada a useReducer para pasar crearTareas como tercer argumento y repite: la consola se queda callada al marcar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport './estilos.css'\n\nfunction crearTareas(habitaciones) {\n  console.log('Preparo la lista de tareas')\n  return habitaciones.flatMap((habitacion) => [\n    { id: habitacion + '-embalar', texto: 'Embalar ' + habitacion, hecha: false },\n    { id: habitacion + '-limpiar', texto: 'Limpiar ' + habitacion, hecha: false },\n  ])\n}\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nfunction ListaMudanza({ habitaciones }) {\n  const [tareas, dispatch] = useReducer(tareasReducer, crearTareas(habitaciones))\n\n  return (\n    <ul className=\"tareas\">\n      {tareas.map((tarea) => (\n        <li key={tarea.id}>\n          <label className={tarea.hecha ? 'hecha' : ''}>\n            <input\n              type=\"checkbox\"\n              checked={tarea.hecha}\n              onChange={() => dispatch({ type: 'marcada', id: tarea.id })}\n            />\n            {tarea.texto}\n          </label>\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Antes de entregar las llaves</h1>\n      <ListaMudanza habitaciones={['la cocina', 'el salón', 'el baño']} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tareas {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tareas li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tareas label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

Con tres habitaciones no se nota, pero un inicializador puede construir cientos de elementos o leer algo guardado en `localStorage` en tu proyecto (la vista previa de esta web no tiene acceso a `localStorage`). La regla es la de la lección 16: **si el estado inicial sale de llamar a una función, pásale la función a React**. Y como el inicializador también se ejecuta durante el render, también tiene que ser puro.

## Un reductor como máquina de estados

En la lección 23 describiste una pantalla como una lista de estados posibles y las flechas que llevan de uno a otro. En la 24, la lavadora de La Burbuja pasó de tres booleanos a una sola variable `fase`. Pero quedaba un hueco: **nada impedía llamar a `setFase('terminada')` con la lavadora parada**. Los botones desactivados lo evitaban en la interfaz, y cualquier otro código podía saltárselo.

Un reductor cierra ese hueco, porque es **el único sitio por el que pasa cada cambio**. Si decide que una acción no vale en la fase actual, devuelve el estado tal cual y no pasa nada. A esta forma de pensar se la llama **máquina de estados**: un conjunto cerrado de fases y una lista de transiciones permitidas entre ellas.

Este es el seguimiento de un pedido a domicilio. Las transiciones están escritas en una tabla, y los cuatro botones están siempre activos a propósito, para que pruebes a saltarte el orden:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un pedido que solo admite cambios válidos",
  "codigo": "import { useReducer } from 'react'\nimport './estilos.css'\n\n// En cada fase, qué acciones se aceptan y a qué fase llevan\nconst TRANSICIONES = {\n  recibido: { aceptado: 'en-cocina', cancelado: 'cancelado' },\n  'en-cocina': { horneado: 'en-reparto', cancelado: 'cancelado' },\n  'en-reparto': { entregado: 'entregado' },\n  entregado: {},\n  cancelado: {},\n}\n\nconst ACCIONES = ['aceptado', 'horneado', 'entregado', 'cancelado']\n\nconst TEXTOS = {\n  recibido: 'Pedido recibido: falta que la pizzería lo acepte',\n  'en-cocina': 'Tu pizza está en el horno',\n  'en-reparto': 'El repartidor va de camino',\n  entregado: 'Entregado. ¡Que aproveche!',\n  cancelado: 'Pedido cancelado',\n}\n\nfunction pedidoReducer(pedido, accion) {\n  if (!ACCIONES.includes(accion.type)) {\n    throw Error('Acción desconocida: ' + accion.type)\n  }\n  const siguiente = TRANSICIONES[pedido.fase][accion.type]\n  if (siguiente === undefined) {\n    return pedido // no se permite en esta fase: no cambia nada\n  }\n  return { fase: siguiente, historial: [...pedido.historial, siguiente] }\n}\n\nexport default function App() {\n  const [pedido, dispatch] = useReducer(pedidoReducer, {\n    fase: 'recibido',\n    historial: ['recibido'],\n  })\n\n  return (\n    <main>\n      <h1>Pizzería Vesubio · Pedido 1042</h1>\n      <p className=\"fase\">{TEXTOS[pedido.fase]}</p>\n      <div className=\"mandos\">\n        <button onClick={() => dispatch({ type: 'aceptado' })}>Aceptar</button>\n        <button onClick={() => dispatch({ type: 'horneado' })}>Sacar del horno</button>\n        <button onClick={() => dispatch({ type: 'entregado' })}>Marcar como entregado</button>\n        <button onClick={() => dispatch({ type: 'cancelado' })}>Cancelar</button>\n      </div>\n      <p className=\"historial\">Historial: {pedido.historial.join(' → ')}</p>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.fase {\n  padding: 0.6rem 0.8rem;\n  border-left: 4px solid #dc2626;\n  background: #fef2f2;\n  font-weight: 600;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.4rem 0.7rem;\n  font: inherit;\n}\n\n.historial {\n  color: #57534e;\n}",
  "anotaciones": [
    {
      "fragmento": "recibido: { aceptado: 'en-cocina', cancelado: 'cancelado' },",
      "nota": "La tabla es el dibujo de flechas de la lección 23 escrito como datos: desde recibido, la acción aceptado lleva a en-cocina y cancelado a cancelado. Cualquier otra acción no lleva a ninguna parte."
    },
    {
      "fragmento": "'en-reparto': { entregado: 'entregado' },",
      "nota": "Con el pedido en camino ya no hay cancelado: es la regla del negocio, y vive aquí, no repartida por los botones."
    },
    {
      "fragmento": "throw Error('Acción desconocida: ' + accion.type)",
      "nota": "Hay que distinguir dos casos. Una acción que no existe es un fallo del código, y lanza, como el default de antes. Una acción que existe pero no toca ahora es algo normal, y se ignora."
    },
    {
      "fragmento": "return pedido // no se permite en esta fase: no cambia nada",
      "nota": "Devolver el mismo objeto es la forma de decir «nada que hacer». React lo compara con Object.is, ve que es el mismo y no aplica ningún cambio."
    },
    {
      "fragmento": "historial: [...pedido.historial, siguiente]",
      "nota": "Cada transición válida cambia dos datos a la vez, la fase y el historial, en un solo return. Ningún manejador puede actualizar uno y olvidarse del otro."
    },
    {
      "fragmento": "onClick={() => dispatch({ type: 'cancelado' })}",
      "nota": "El botón no comprueba nada: avisa de que la persona quiere cancelar. Si se puede o no, lo decide el reductor."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Prueba a pulsar «Marcar como entregado» nada más empezar, o «Cancelar» con el repartidor en camino: el texto no cambia y el historial tampoco. Mira entonces el panel «Árbol de renders»: `App` sale **sin cambios**, y el resumen del commit dice «0 renderizados» y «0 cambios en el DOM». El reductor ha devuelto el mismo objeto, y React no ha tenido nada que aplicar. Compáralo con una acción válida, que deja `App` en ámbar con el motivo «cambió su estado».

En una interfaz de verdad también desactivarías los botones que no tocan, pero **calculándolo con la misma tabla**: `const permitidas = Object.keys(TRANSICIONES[pedido.fase])`. Así los botones y el reductor no pueden llevarse la contraria, y el reductor protege el estado aunque la acción llegue de otro sitio: un temporizador, la respuesta de un servidor o un componente que alguien añada dentro de un año. Lo practicarás en los ejercicios.

Volviendo a la reserva del observatorio de la lección 23: allí quedaba la combinación imposible de un `error` guardado con el estado en `'exito'`. Con un reductor, la acción `envio_confirmado` devolvería `{ estado: 'exito', error: null }` de una vez, y ninguna acción podría dejar las dos piezas en desacuerdo.

## `dispatch` es siempre la misma función

La función `dispatch` que devuelve `useReducer` **no cambia entre renders**: React te da exactamente la misma en cada uno. Por eso puedes pasársela a los hijos tal cual, sin envolverla en una flecha. En este bloque, `App` le da a un hijo `dispatch` y a otro una función flecha que lo llama:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos hijos, dos formas de recibir el poder de vaciar",
  "consigna": "Pulsa «Añadir caja» y mira en el árbol de renders el motivo de cada hijo. Pulsa también un botón de vaciar: los dos hacen lo mismo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport './estilos.css'\n\nfunction cajasReducer(cajas, accion) {\n  switch (accion.type) {\n    case 'caja_anadida': {\n      return [...cajas, cajas.length + 1]\n    }\n    case 'cajas_vaciadas': {\n      return []\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nfunction PanelConDispatch({ dispatch }) {\n  return (\n    <button onClick={() => dispatch({ type: 'cajas_vaciadas' })}>\n      Vaciar (recibe dispatch)\n    </button>\n  )\n}\n\nfunction PanelConFlecha({ onVaciar }) {\n  return <button onClick={onVaciar}>Vaciar (recibe una flecha)</button>\n}\n\nexport default function App() {\n  const [cajas, dispatch] = useReducer(cajasReducer, [])\n\n  return (\n    <main>\n      <button onClick={() => dispatch({ type: 'caja_anadida' })}>Añadir caja</button>\n      <p>Cajas en la furgoneta: {cajas.length}</p>\n      <PanelConDispatch dispatch={dispatch} />\n      <PanelConFlecha onVaciar={() => dispatch({ type: 'cajas_vaciadas' })} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  justify-items: start;\n  gap: 0.5rem;\n  font-family: system-ui, sans-serif;\n}\n\np {\n  margin: 0;\n}\n\nbutton {\n  padding: 0.4rem 0.7rem;\n  font: inherit;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Los dos hijos se vuelven a renderizar, porque su padre lo ha hecho (lección 17). Lo que cambia es el motivo:

- `PanelConDispatch`: «se renderizó su padre». Su prop `dispatch` es la misma función que en el render anterior, así que no ha cambiado ninguna prop.
- `PanelConFlecha`: «cambió la prop «onVaciar» (función nueva)». La flecha se crea otra vez en cada render de `App`, y una función nueva es una prop distinta.

Hoy da lo mismo, porque los dos se renderizan igualmente. Empieza a importar cuando un hijo se salta los renders si sus props no cambian, con `memo` (lección 67), y en las dependencias de un efecto (lección 42): como `dispatch` no cambia, incluirlo no hace que el efecto se repita, y por eso verás a menudo que se omite. La función `set` de `useState` tiene la misma garantía. Y en la lección 29 harás llegar `dispatch` a toda la aplicación con un contexto.

## ¿`useState` o `useReducer`?

Los dos guardan estado y los dos provocan un render al cambiarlo; de hecho, son intercambiables, y puedes pasar de uno a otro cuando quieras. La documentación de React los compara en cinco puntos:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Tamaño del código",
      "texto": "useState pide menos código al principio. Con useReducer escribes el reductor y además las acciones. A cambio, si muchos manejadores actualizan el estado de forma parecida, el reductor puede acabar ahorrando líneas."
    },
    {
      "titulo": "Legibilidad",
      "texto": "Con actualizaciones sencillas, useState se lee de un vistazo. Cuando se complican, inflan el componente; el reductor separa el qué ha pasado de los manejadores del cómo cambia el estado."
    },
    {
      "titulo": "Depuración",
      "texto": "Con useState cuesta saber dónde y por qué se puso mal el estado. Con un reductor, un console.log dentro te enseña cada acción y lo que produce. Si las acciones son correctas, el fallo está en el reductor."
    },
    {
      "titulo": "Pruebas",
      "texto": "El reductor es una función pura que no depende de React: se exporta y se prueba sola, pasándole un estado y una acción y comprobando lo que devuelve."
    },
    {
      "titulo": "Gusto personal",
      "texto": "A unos les gustan los reductores y a otros no, y está bien. Lo que no tiene sentido es un reductor para un booleano que solo se alterna."
    }
  ]
}
```

La recomendación práctica: **pasa a `useReducer` cuando encuentres a menudo errores por actualizaciones mal hechas en un componente, o cuando varios manejadores cambien el mismo estado de formas distintas**. Y mézclalos sin miedo: en la mudanza, el texto del campo siguió en un `useState`.

El punto de las pruebas merece verse. Como el reductor es solo una función, puedes comprobarlo sin montar ningún componente, sin pulsar botones y sin React. Este bloque no renderiza la mudanza: llama al reductor con estados y acciones inventados y enseña si cada resultado es el esperado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Probar el reductor sin pintar la mudanza",
  "consigna": "Las cinco pruebas pasan. Rompe el reductor a propósito en tareasReducer.jsx y mira cuál falla: quita el default, o cambia el case marcada para que modifique la tarea en vez de copiarla (busca la tarea con find, cambia t.hecha y devuelve [...tareas]).",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { tareasReducer } from './tareasReducer'\nimport './estilos.css'\n\nfunction lista() {\n  return [\n    { id: 1, texto: 'Comprar cajas', hecha: true },\n    { id: 2, texto: 'Desmontar la cama', hecha: false },\n  ]\n}\n\nconst pruebas = [\n  {\n    nombre: 'anadida: la tarea nueva va al final, sin hacer',\n    pasa() {\n      const despues = tareasReducer(lista(), { type: 'anadida', id: 3, texto: 'Vaciar la nevera' })\n      return despues.length === 3 && despues[2].texto === 'Vaciar la nevera' && !despues[2].hecha\n    },\n  },\n  {\n    nombre: 'marcada: cambia solo la tarea indicada',\n    pasa() {\n      const despues = tareasReducer(lista(), { type: 'marcada', id: 2 })\n      return despues[1].hecha === true && despues[0].hecha === true\n    },\n  },\n  {\n    nombre: 'marcada: no toca el estado anterior',\n    pasa() {\n      const antes = lista()\n      tareasReducer(antes, { type: 'marcada', id: 2 })\n      return antes[1].hecha === false\n    },\n  },\n  {\n    nombre: 'hechas_quitadas: solo quedan las pendientes',\n    pasa() {\n      const despues = tareasReducer(lista(), { type: 'hechas_quitadas' })\n      return despues.length === 1 && despues[0].id === 2\n    },\n  },\n  {\n    nombre: 'una acción desconocida lanza un error',\n    pasa() {\n      try {\n        tareasReducer(lista(), { type: 'añadida' })\n        return false\n      } catch {\n        return true\n      }\n    },\n  },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Pruebas de tareasReducer</h1>\n      <ul className=\"pruebas\">\n        {pruebas.map((prueba) => {\n          const ok = prueba.pasa()\n          return (\n            <li key={prueba.nombre} className={ok ? 'pasa' : 'falla'}>\n              {ok ? 'Pasa' : 'Falla'}: {prueba.nombre}\n            </li>\n          )\n        })}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "tareasReducer.jsx",
      "codigo": "export function tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    case 'hechas_quitadas': {\n      return tareas.filter((t) => !t.hecha)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.pruebas {\n  display: grid;\n  gap: 0.3rem;\n  padding: 0;\n  list-style: none;\n}\n\n.pruebas li {\n  padding: 0.35rem 0.6rem;\n  border-left: 4px solid;\n  border-radius: 4px;\n}\n\n.pasa {\n  border-color: #16a34a;\n  background: #f0fdf4;\n}\n\n.falla {\n  border-color: #dc2626;\n  background: #fef2f2;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "tareasReducer.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Fíjate en la tercera prueba. Si el `case 'marcada'` cambia `t.hecha` en el objeto que recibe, el array devuelto es nuevo, pero la tarea de dentro es la misma de antes, ya modificada. Las demás pruebas no lo notan; esta sí, porque mira el estado **anterior**. Es la clase de fallo que en una interfaz se manifiesta lejos, y que en una prueba de tres líneas salta enseguida.

En un proyecto real no harías estas pruebas en un componente, sino con un ejecutor de pruebas como Vitest (las pruebas en React tienen su propia lección, la 83). La idea es idéntica:

```js
import { expect, test } from 'vitest'
import { tareasReducer } from './tareasReducer'

test('marcar una tarea no toca el estado anterior', () => {
  const antes = [{ id: 1, texto: 'Comprar cajas', hecha: false }]
  const despues = tareasReducer(antes, { type: 'marcada', id: 1 })
  expect(despues[0].hecha).toBe(true)
  expect(antes[0].hecha).toBe(false)
})
```

## Menos copias con Immer: `useImmerReducer`

Si los `map` y los spreads del reductor se te hacen pesados, la librería Immer que viste en la lección 20 tiene también una versión para reductores, `useImmerReducer`, en el mismo paquete `use-immer`. El reductor recibe un **borrador** que se puede modificar como si fuera un objeto normal, e Immer construye el estado nuevo a partir de lo que cambias:

```jsx
import { useImmerReducer } from 'use-immer'

function tareasReducer(borrador, accion) {
  switch (accion.type) {
    case 'anadida': {
      borrador.push({ id: accion.id, texto: accion.texto, hecha: false })
      break
    }
    case 'marcada': {
      const tarea = borrador.find((t) => t.id === accion.id)
      tarea.hecha = !tarea.hecha
      break
    }
    default: {
      throw Error('Acción desconocida: ' + accion.type)
    }
  }
}

// En el componente, en lugar de useReducer:
const [tareas, dispatch] = useImmerReducer(tareasReducer, tareasIniciales)
```

Con Immer, cada `case` termina en `break` en vez de en `return`: no hace falta devolver nada, porque el estado nuevo sale del borrador. Sigue siendo una función pura desde el punto de vista de React, que recibe un estado nuevo como siempre. Se instala con npm en tu proyecto; los bloques de esta web solo cargan React.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Listas con muchas operaciones",
      "texto": "Un carrito, una lista de reproducción, un tablero de tareas: añadir, quitar, cambiar cantidades, reordenar, vaciar. Cada operación es un case y se prueba por separado."
    },
    {
      "titulo": "Pantallas con fases",
      "texto": "Un asistente de varios pasos, un reproductor, una partida, una petición pendiente, con error o con éxito. El reductor decide qué transiciones valen. En el proyecto del Wordle (lección 47) usarás useReducer justo así."
    },
    {
      "titulo": "Varios datos que cambian juntos",
      "texto": "Cuando una sola interacción cambia tres variables de estado a la vez, una acción y un return que las devuelve juntas evitan dejarlas a medias."
    },
    {
      "titulo": "Estado que cambian componentes lejanos",
      "texto": "Junto con un contexto, el reductor y dispatch llegan a cualquier parte del árbol: es la lección 29. Redux, que verás en la lección 75, lleva esta misma idea de acciones y reductores a una aplicación entera."
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
      "mito": "useReducer es más rápido que useState",
      "realidad": "No. Es otra forma de organizar el mismo estado, y los dos provocan el mismo render. Se elige por claridad, no por velocidad."
    },
    {
      "mito": "dispatch cambia el estado al momento",
      "realidad": "Pone la acción en cola. El reductor se ejecuta en el siguiente render, y la variable del render actual sigue con su valor, como con useState (lección 18)."
    },
    {
      "mito": "El reductor es un buen sitio para pedir datos al servidor",
      "realidad": "Tiene que ser puro. La petición va en el manejador o en un efecto (lección 38), y cuando llega la respuesta se despacha una acción con los datos."
    },
    {
      "mito": "Si uso useReducer, todo el estado tiene que ir en él",
      "realidad": "Se mezclan sin problema. Un componente puede tener un reductor para la lista y un useState para el texto del campo, o varios reductores."
    }
  ]
}
```

## Errores típicos

**Modificar el estado dentro del reductor.** Es el error más traicionero, porque a veces parece que funciona. Este reductor hace `push` sobre el array que recibe y lo devuelve:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un reductor que hace push",
  "consigna": "Pulsa «Desmontar la cama»: no aparece nada. Ahora pulsa «Quitar las hechas». Después arregla el case anadida para que devuelva un array nuevo y repite.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport './estilos.css'\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      tareas.push({ id: tareas.length + 1, texto: accion.texto, hecha: false })\n      return tareas\n    }\n    case 'hechas_quitadas': {\n      return tareas.filter((t) => !t.hecha)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nconst SUGERENCIAS = ['Desmontar la cama', 'Vaciar la nevera']\n\nexport default function App() {\n  const [tareas, dispatch] = useReducer(tareasReducer, [\n    { id: 1, texto: 'Pedir presupuesto a la empresa de mudanzas', hecha: true },\n  ])\n\n  return (\n    <main>\n      <h1>Mudanza al piso nuevo</h1>\n      <p>Sugerencias:</p>\n      {SUGERENCIAS.map((texto) => (\n        <button key={texto} onClick={() => dispatch({ type: 'anadida', texto })}>\n          {texto}\n        </button>\n      ))}\n      <ul className=\"tareas\">\n        {tareas.map((tarea, i) => (\n          <li key={i} className={tarea.hecha ? 'hecha' : ''}>\n            {tarea.texto}\n          </li>\n        ))}\n      </ul>\n      <button onClick={() => dispatch({ type: 'hechas_quitadas' })}>Quitar las hechas</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tareas {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tareas li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tareas label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n\nbutton {\n  margin-right: 0.4rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Han pasado dos cosas raras, y las dos tienen la misma causa:

1. **Al añadir no cambia nada.** El reductor devuelve el mismo array que recibió, solo que modificado. React compara el estado nuevo con el anterior con `Object.is`, ve que es el mismo objeto y descarta la actualización.
2. **Al quitar las hechas, aparece la tarea... dos veces.** `filter` sí devuelve un array nuevo, así que esta vez React pinta, y el array ya llevaba dentro lo que habían metido los `push`. Dos, porque `StrictMode` llamó dos veces al reductor y cada llamada hizo su `push` sobre el mismo array.

Es el mismo fallo de las lecciones 20 y 21, con un agravante: el síntoma aparece en un momento y en una acción que no tienen nada que ver con la causa. El arreglo es el de siempre: `return [...tareas, { ... }]`.

**Olvidar copiar el resto del objeto.** Cuando el estado es un objeto con varias propiedades, cada `case` tiene que devolverlo **entero**:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function mudanzaReducer(estado, accion) {\n  switch (accion.type) {\n    case 'filtro_cambiado': {\n      return { filtro: accion.filtro }\n    }\n    // ...\n  }\n}\n\n// Estado inicial: { filtro: 'todas', tareas: [ ...tres tareas... ] }\n// El JSX pinta: estado.tareas.filter(...).map(...)\n\n// Pulsas el botón que despacha\n// { type: 'filtro_cambiado', filtro: 'pendientes' }. ¿Qué pasa?",
  "opciones": [
    "Se ven solo las tareas pendientes",
    "La lista se queda vacía, sin ningún error",
    "Error: Cannot read properties of undefined (reading 'filter')",
    "No cambia nada, porque el reductor no ha tocado tareas"
  ],
  "correcta": 2,
  "explicacion": "El reductor devuelve un objeto nuevo con una sola propiedad, filtro. tareas ha desaparecido del estado, estado.tareas vale undefined y el filter del JSX revienta. Lo que no copias, se pierde: return { ...estado, filtro: accion.filtro }."
}
```

**Leer el estado justo después de `dispatch`.** `dispatch` funciona como un `set` de `useState`: pide un render nuevo, pero no cambia la variable del render en el que estás.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [estado, dispatch] = useReducer(cajasReducer, { cajas: 0 })\n\nfunction manejarClic() {\n  dispatch({ type: 'caja_sumada' }) // el reductor devuelve { cajas: estado.cajas + 1 }\n  console.log('Cajas:', estado.cajas)\n}\n\n// Pulsas el botón dos veces. ¿Qué sale en la consola?",
  "opciones": [
    "Cajas: 1 y Cajas: 2",
    "Cajas: 0 y Cajas: 1",
    "Cajas: 0 y Cajas: 0",
    "Cajas: 1 y Cajas: 1"
  ],
  "correcta": 1,
  "explicacion": "Cada clic usa la foto de su render (lección 18). En el primero, estado.cajas vale 0 aunque acabes de despachar; el render siguiente ya trae 1, y el segundo clic imprime ese 1. Si necesitas el valor siguiente dentro del manejador, puedes calcularlo llamando tú al reductor: cajasReducer(estado, accion)."
}
```

**Despachar durante el render.** `onClick={dispatch({ type: 'cajas_vaciadas' })}`, con la llamada escrita directamente, despacha en cada render; el despacho provoca otro render, que vuelve a despachar... React corta el bucle con este error:

```text
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

Es decir: demasiados renders seguidos; React limita su número para no entrar en un bucle infinito. Es el mismo fallo de pasar un manejador llamándolo, de la lección 15: tiene que ser `onClick={() => dispatch({ type: 'cajas_vaciadas' })}`.

**Meter efectos secundarios en el reductor.** Guardar en `localStorage`, programar un `setTimeout` o lanzar un `fetch` desde un `case` parece cómodo, porque «ahí es donde cambia el estado». Pero el reductor se ejecuta durante el render, `StrictMode` lo llama dos veces, y React puede volver a llamarlo cuando quiera. Lo que tenga que pasar una sola vez va en el manejador o en un efecto (lección 38).

**Un reductor para un dato que cambia de una sola forma.** Un panel que se abre y se cierra no necesita acciones ni `switch`. `useReducer` compensa cuando hay varias formas de cambiar el mismo estado, no por costumbre.

## Ejercicios

El primero es el de la mudanza al revés: los manejadores ya despachan sus acciones (paso 1 hecho) y te toca escribir el reductor. En la frutería, añadir dos veces el mismo producto debería sumar una unidad a su línea, y no crear otra.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La cesta de la frutería",
  "consigna": "Completa cestaReducer.jsx: que anadido sume una unidad si el producto ya está en la cesta, y escribe los casos unidad_quitada (si llega a 0, la línea desaparece) y vaciada. Sin modificar nada de lo que recibe el reductor: si lo haces, StrictMode te delatará. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport { cestaReducer } from './cestaReducer'\nimport './estilos.css'\n\nconst PRODUCTOS = [\n  { id: 'manzanas', nombre: 'Manzanas', precio: 0.45 },\n  { id: 'naranjas', nombre: 'Naranjas', precio: 0.3 },\n  { id: 'peras', nombre: 'Peras', precio: 0.55 },\n]\n\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport default function App() {\n  const [cesta, dispatch] = useReducer(cestaReducer, [])\n\n  const total = cesta.reduce((suma, linea) => suma + linea.precio * linea.unidades, 0)\n\n  return (\n    <main>\n      <h1>Frutería La Huerta de Pepa</h1>\n      <section aria-labelledby=\"titulo-mostrador\">\n        <h2 id=\"titulo-mostrador\">Mostrador</h2>\n        <ul className=\"productos\">\n          {PRODUCTOS.map((producto) => (\n            <li key={producto.id}>\n              <button onClick={() => dispatch({ type: 'anadido', producto })}>\n                Añadir {producto.nombre}\n              </button>\n              <span>{euros.format(producto.precio)} la pieza</span>\n            </li>\n          ))}\n        </ul>\n      </section>\n      <section aria-labelledby=\"titulo-cesta\">\n        <h2 id=\"titulo-cesta\">Tu cesta</h2>\n        {cesta.length === 0 ? (\n          <p>La cesta está vacía</p>\n        ) : (\n          <ul className=\"cesta\">\n            {cesta.map((linea) => (\n              <li key={linea.id}>\n                <span>{linea.nombre} × {linea.unidades}</span>\n                <button\n                  aria-label={'Quitar una unidad de ' + linea.nombre}\n                  onClick={() => dispatch({ type: 'unidad_quitada', id: linea.id })}\n                >\n                  −1\n                </button>\n              </li>\n            ))}\n          </ul>\n        )}\n        <p className=\"total\">Total: {euros.format(total)}</p>\n        <button onClick={() => dispatch({ type: 'vaciada' })}>Vaciar la cesta</button>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "cestaReducer.jsx",
      "codigo": "// Las acciones que despacha App:\n//   { type: 'anadido', producto }   producto = { id, nombre, precio }\n//   { type: 'unidad_quitada', id }\n//   { type: 'vaciada' }\n// Cada línea de la cesta es { id, nombre, precio, unidades }.\n\nexport function cestaReducer(cesta, accion) {\n  switch (accion.type) {\n    case 'anadido': {\n      // Si el producto ya está en la cesta, tiene que sumar una unidad\n      // a su línea en vez de añadir otra\n      return [...cesta, { ...accion.producto, unidades: 1 }]\n    }\n    // Escribe aquí los casos 'unidad_quitada' y 'vaciada'\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n}\n\n.cesta li {\n  justify-content: space-between;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 6px;\n  background: #f0fdf4;\n}\n\n.total {\n  font-weight: 700;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "cestaReducer.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "comprobaciones": [
    {
      "descripcion": "Al añadir manzanas dos veces, la cesta tiene una sola línea: «Manzanas × 2»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Manzanas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Manzanas"
          }
        }
      ],
      "espera": {
        "texto": "Manzanas × 2"
      }
    },
    {
      "descripcion": "Con dos manzanas, quitar una unidad deja «Manzanas × 1» y el total en 0,45 €",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Manzanas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Manzanas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar una unidad de Manzanas"
          }
        }
      ],
      "espera": {
        "texto": "Total: 0,45 €"
      }
    },
    {
      "descripcion": "Al quitar la única unidad de un producto, su línea desaparece",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Peras"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar una unidad de Peras"
          }
        }
      ],
      "espera": {
        "texto": "La cesta está vacía"
      }
    },
    {
      "descripcion": "«Vaciar la cesta» la deja vacía y el total vuelve a 0,00 €",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Naranjas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Peras"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vaciar la cesta"
          }
        }
      ],
      "espera": {
        "texto": "Total: 0,00 €"
      }
    }
  ]
}
```

Si en `unidad_quitada` escribiste `linea.unidades--` dentro del `map`, habrás visto desaparecer de un solo clic una línea que tenía dos manzanas: `StrictMode` llamó dos veces al reductor y las dos llamadas restaron sobre el mismo objeto, de 2 a 0. La versión pura copia la línea con `{ ...linea, unidades: linea.unidades - 1 }` y después filtra las que se quedan a cero.

El segundo es una máquina de estados. Una máquina de billetes de autobús tiene todos sus botones siempre a la vista, y pulsar uno que no toca no debe hacer nada. Ahora mismo, el reductor obedece a cualquier botón en cualquier momento.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La máquina de billetes que obedece a todo",
  "consigna": "Pulsa «Pagar con tarjeta» sin elegir destino, o «Cancelar» con el billete ya impreso, y mira la pantalla. Arregla maquinaReducer.jsx para que cada acción solo funcione en su fase y, en cualquier otra, devuelva el estado sin cambios. Vale comprobar la fase en cada case o usar una tabla como la de la pizzería.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport { maquinaReducer } from './maquinaReducer'\nimport './estilos.css'\n\nconst DESTINOS = [\n  { nombre: 'Teruel', precio: '11,40 €' },\n  { nombre: 'Soria', precio: '9,85 €' },\n  { nombre: 'Huesca', precio: '8,10 €' },\n]\n\nfunction Pantalla({ fase, destino }) {\n  if (fase === 'eligiendo') return <p>Elige tu destino</p>\n  const { precio } = DESTINOS.find((d) => d.nombre === destino) ?? { precio: '?' }\n  if (fase === 'pagando') return <p>Destino: {destino}. Importe: {precio}</p>\n  return <p>Recoge tu billete a {destino}</p>\n}\n\nexport default function App() {\n  const [maquina, dispatch] = useReducer(maquinaReducer, { fase: 'eligiendo', destino: null })\n\n  return (\n    <main>\n      <h1>Estación de autobuses · Billetes</h1>\n      <div className=\"pantalla\" role=\"status\">\n        <Pantalla fase={maquina.fase} destino={maquina.destino} />\n      </div>\n      <div className=\"teclado\">\n        {DESTINOS.map((d) => (\n          <button key={d.nombre} onClick={() => dispatch({ type: 'destino_elegido', destino: d.nombre })}>\n            {d.nombre}\n          </button>\n        ))}\n        <button onClick={() => dispatch({ type: 'pagado' })}>Pagar con tarjeta</button>\n        <button onClick={() => dispatch({ type: 'cancelado' })}>Cancelar</button>\n        <button onClick={() => dispatch({ type: 'billete_recogido' })}>Recoger el billete</button>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "maquinaReducer.jsx",
      "codigo": "// Fases: 'eligiendo' → 'pagando' → 'imprimiendo' → vuelta a 'eligiendo'.\n// Desde 'pagando' también se puede cancelar y volver a 'eligiendo'.\n// Ahora el reductor obedece cualquier acción en cualquier fase:\n// haz que cada una solo funcione en la fase que le toca.\n\nexport function maquinaReducer(maquina, accion) {\n  switch (accion.type) {\n    case 'destino_elegido': {\n      return { fase: 'pagando', destino: accion.destino }\n    }\n    case 'pagado': {\n      return { ...maquina, fase: 'imprimiendo' }\n    }\n    case 'cancelado': {\n      return { fase: 'eligiendo', destino: null }\n    }\n    case 'billete_recogido': {\n      return { fase: 'eligiendo', destino: null }\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.2rem;\n}\n\n.pantalla {\n  padding: 0.75rem 1rem;\n  border-radius: 6px;\n  background: #0f172a;\n  color: #86efac;\n  font-family: ui-monospace, monospace;\n}\n\n.teclado {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 0.4rem;\n}\n\nbutton {\n  padding: 0.45rem 0.5rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "maquinaReducer.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Pagar sin haber elegido destino no hace nada: la pantalla sigue en «Elige tu destino»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pagar con tarjeta"
          }
        }
      ],
      "espera": {
        "texto": "Elige tu destino"
      }
    },
    {
      "descripcion": "Mientras pagas, pulsar otro destino no cambia el que ya elegiste",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Teruel"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Soria"
          }
        }
      ],
      "espera": {
        "texto": "Destino: Teruel. Importe: 11,40 €"
      }
    },
    {
      "descripcion": "Con el billete ya impreso, «Cancelar» no hace nada",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Huesca"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pagar con tarjeta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar"
          }
        }
      ],
      "espera": {
        "texto": "Recoge tu billete a Huesca"
      }
    },
    {
      "descripcion": "El recorrido completo funciona: elegir, pagar, recoger y vuelta a empezar",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Soria"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pagar con tarjeta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Recoger el billete"
          }
        }
      ],
      "espera": {
        "texto": "Elige tu destino"
      }
    }
  ]
}
```

Fíjate en que no has tocado `App.jsx`: los botones siguen despachando lo mismo, y toda la regla del negocio ha entrado por un solo archivo. Es lo que se gana con el reductor.

**Retos para seguir practicando** (sin comprobación automática):

1. En la pizzería, desactiva los botones que no se pueden usar en la fase actual, calculándolo con la tabla `TRANSICIONES` y no con condiciones escritas a mano. Comprueba que el reductor sigue protegiendo el pedido si quitas un `disabled`.
2. Rehaz la reserva del observatorio de la lección 23 con un reductor y las acciones `nombre_cambiado`, `envio_iniciado`, `envio_confirmado` y `envio_fallido`. ¿Puede quedar ya un error guardado con la reserva confirmada?
3. Añade a la frutería un botón «Deshacer». Pista: guarda en el estado `{ anteriores: [], cesta: [] }`; cada acción mete la cesta actual en `anteriores` y `deshecha` saca la última.
4. Escribe tu propio `useReducer` con `useState`: una función `useMiReducer(reductor, estadoInicial)` que devuelva `[estado, dispatch]`. Pista: `dispatch` puede usar la función actualizadora de la lección 19, `setEstado((e) => reductor(e, accion))`. Pruébalo en la mudanza.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Extracting State Logic into a Reducer",
      "descripcion": "La página de react.dev en la que se basa esta lección: la migración en tres pasos, la comparación con useState, cómo escribir buenos reductores y cuatro retos resueltos.",
      "url": "https://react.dev/learn/extracting-state-logic-into-a-reducer",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useReducer",
      "descripcion": "La referencia del hook: el tercer argumento, por qué dispatch es estable, la doble llamada de StrictMode y las soluciones a los errores más habituales.",
      "url": "https://react.dev/reference/react/useReducer",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Scaling Up with Reducer and Context",
      "descripcion": "El paso siguiente: hacer llegar el estado y dispatch a cualquier componente del árbol. Es la lección 29.",
      "url": "https://react.dev/learn/scaling-up-with-reducer-and-context",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "use-immer",
      "descripcion": "El paquete con useImmer y useImmerReducer, con ejemplos de reductores que modifican un borrador.",
      "url": "https://github.com/immerjs/use-immer",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Array.prototype.reduce()",
      "descripcion": "El método del que toman el nombre los reductores, con el acumulador y el valor inicial.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce",
      "etiqueta": "MDN"
    },
    {
      "titulo": "switch",
      "descripcion": "La sentencia que usan casi todos los reductores, con el detalle de qué pasa cuando un case no termina en return o break.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch",
      "etiqueta": "MDN"
    }
  ]
}
```
