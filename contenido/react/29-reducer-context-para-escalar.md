# Reducer + Context para escalar

- **Módulo:** Gestionar el estado
- **Slug:** `reducer-context-para-escalar` (autogenerado del título)
- **Orden:** 290
- **Fuentes:** [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) — ver `contenido/react/TEMARIO.md` #29

---

## Qué es y para qué sirve

En la lección 27 sacaste la lógica de actualización de un componente a un reductor: los manejadores despachan acciones y `tareasReducer` decide el estado siguiente. En la 28 hiciste llegar un dato a cualquier profundidad con un contexto, sin pasarlo de mano en mano. Cada una resuelve un problema distinto, y juntas resuelven el que aparece cuando una aplicación crece: **un estado que cambia de muchas formas y que leen y cambian componentes repartidos por todo el árbol**.

La receta, en una frase:

> **El reductor vive en un componente proveedor; un contexto reparte el estado y otro reparte `dispatch`; cada componente de debajo lee solo el que necesita.**

No hay ninguna API nueva. Son `useReducer`, `createContext` y `useContext`, que ya conoces, combinados de una forma concreta. Lo que vas a aprender es el porqué de cada decisión, y el árbol de renders te lo va a enseñar.

## El problema: el estado y `dispatch`, de mano en mano

El huerto vecinal La Acequia organiza las tareas de la semana por zonas: los bancales, el invernadero y la compostera. Las tareas viven en un reductor en `App`, casi el mismo de la mudanza de la lección 27, con una zona por tarea. Pero `App` no pinta las tareas: lo hace `Tarea`, tres niveles más abajo, y es ahí donde están la casilla para marcarla y el botón para borrarla.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El huerto, con el estado y dispatch pasados por props",
  "consigna": "Marca una tarea, borra otra y añade una nueva: todo funciona. Después abre Tablero.jsx y apunta qué props recibe cada componente y cuáles usa de verdad.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport { tareasReducer, tareasIniciales } from './tareasReducer'\nimport NuevaTarea from './NuevaTarea'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nfunction Cabecera({ tareas }) {\n  const pendientes = tareas.filter((t) => !t.hecha).length\n  return (\n    <header className=\"cabecera\">\n      <h1>Huerto vecinal La Acequia</h1>\n      <p>Pendientes esta semana: {pendientes}</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n\n  return (\n    <main>\n      <Cabecera tareas={tareas} />\n      <NuevaTarea dispatch={dispatch} />\n      <Tablero tareas={tareas} dispatch={dispatch} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "tareasReducer.jsx",
      "codigo": "export function tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, zona: accion.zona, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nexport const tareasIniciales = [\n  { id: 1, texto: 'Regar las tomateras', zona: 'Bancales', hecha: true },\n  { id: 2, texto: 'Atar las judías a las cañas', zona: 'Bancales', hecha: false },\n  { id: 3, texto: 'Trasplantar las lechugas', zona: 'Invernadero', hecha: false },\n  { id: 4, texto: 'Voltear el compost', zona: 'Compostera', hecha: false },\n]\n"
    },
    {
      "nombre": "NuevaTarea.jsx",
      "codigo": "import { useState } from 'react'\n\nlet siguienteId = 5\n\nexport default function NuevaTarea({ dispatch }) {\n  const [texto, setTexto] = useState('')\n  const [zona, setZona] = useState('Bancales')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (texto.trim() === '') return\n    dispatch({ type: 'anadida', id: siguienteId++, texto: texto.trim(), zona })\n    setTexto('')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nueva tarea\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <label>\n        Zona\n        <select value={zona} onChange={(e) => setZona(e.target.value)}>\n          <option>Bancales</option>\n          <option>Invernadero</option>\n          <option>Compostera</option>\n        </select>\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "const ZONAS = ['Bancales', 'Invernadero', 'Compostera']\n\nfunction Tarea({ tarea, dispatch }) {\n  return (\n    <li>\n      <label className={tarea.hecha ? 'hecha' : ''}>\n        <input\n          type=\"checkbox\"\n          checked={tarea.hecha}\n          onChange={() => dispatch({ type: 'marcada', id: tarea.id })}\n        />\n        {tarea.texto}\n      </label>\n      <button\n        aria-label={'Borrar «' + tarea.texto + '»'}\n        onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n      >\n        Borrar\n      </button>\n    </li>\n  )\n}\n\nfunction Zona({ nombre, tareas, dispatch }) {\n  return (\n    <section className=\"zona\">\n      <h2>{nombre}</h2>\n      {tareas.length === 0 ? (\n        <p className=\"vacia\">Sin tareas en esta zona</p>\n      ) : (\n        <ul>\n          {tareas.map((tarea) => (\n            <Tarea key={tarea.id} tarea={tarea} dispatch={dispatch} />\n          ))}\n        </ul>\n      )}\n    </section>\n  )\n}\n\nexport default function Tablero({ tareas, dispatch }) {\n  return (\n    <div className=\"tablero\">\n      {ZONAS.map((zona) => (\n        <Zona\n          key={zona}\n          nombre={zona}\n          tareas={tareas.filter((t) => t.zona === zona)}\n          dispatch={dispatch}\n        />\n      ))}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n  background: #ecfccb;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tablero {\n  display: grid;\n  gap: 0.6rem;\n}\n\n.zona {\n  padding: 0.4rem 0.8rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.zona h2 {\n  margin: 0.2rem 0 0.4rem;\n  color: #3f6212;\n  font-size: 1.05rem;\n}\n\n.zona ul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.zona li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n\n.zona li label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n\n.vacia {\n  margin: 0;\n  color: #78716c;\n}\n"
    }
  ],
  "archivoInicial": "Tablero.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

`App` le pasa `tareas` y `dispatch` a `Tablero`. `Tablero` reparte las tareas por zonas y le pasa `dispatch` a cada `Zona`. `Zona` se lo pasa a cada `Tarea`, que por fin lo usa. Dibujado sobre el árbol:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Antes: el estado vive en App y dispatch baja por props",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: tareas",
      "nota": "useReducer(tareasReducer, …)"
    },
    {
      "nombre": "Cabecera",
      "nivel": 1,
      "nota": "← recibe tareas y las usa"
    },
    {
      "nombre": "NuevaTarea",
      "nivel": 1,
      "nota": "← recibe dispatch y lo usa"
    },
    {
      "nombre": "Tablero",
      "nivel": 1,
      "nota": "usa tareas; recibe dispatch solo para pasarlo"
    },
    {
      "nombre": "Zona",
      "nivel": 2,
      "clave": "Bancales",
      "nota": "recibe dispatch solo para pasarlo"
    },
    {
      "nombre": "Tarea",
      "nivel": 3,
      "clave": "1",
      "nota": "← usa dispatch"
    },
    {
      "nombre": "Tarea",
      "nivel": 3,
      "clave": "2",
      "nota": "← usa dispatch"
    },
    {
      "nombre": "Zona",
      "nivel": 2,
      "clave": "Invernadero",
      "nota": "recibe dispatch solo para pasarlo"
    },
    {
      "nombre": "Tarea",
      "nivel": 3,
      "clave": "3",
      "nota": "← usa dispatch"
    },
    {
      "nombre": "Zona",
      "nivel": 2,
      "clave": "Compostera",
      "nota": "recibe dispatch solo para pasarlo"
    },
    {
      "nombre": "Tarea",
      "nivel": 3,
      "clave": "4",
      "nota": "← usa dispatch"
    }
  ]
}
```

Es el *prop drilling* de la lección 28, con un agravante: ya no viaja un dato, viajan **el estado y la función que lo cambia**. Con tres niveles se aguanta. Pero en una aplicación de verdad puede haber diez componentes entre `App` y el botón, y cada vez que un componente nuevo tenga que despachar algo habrá que abrirle camino a través de todos. Y lo que transportan casi nunca les sirve de nada: `Tablero` y `Zona` no despachan ninguna acción.

La propuesta de la documentación de React es meter las dos cosas en contexto. Así, **cualquier componente por debajo del que tiene el reductor puede leer el estado y despachar acciones sin que nadie se los pase**.

## Reducer y contexto en tres pasos

Son los tres pasos de la lección 28, aquí en el orden en que los cuenta react.dev, y con una diferencia en el primero:

1. **Crear dos contextos**: uno para el estado y otro para `dispatch`.
2. **Proveerlos** desde el componente que tiene el reductor.
3. **Leerlos** donde hagan falta, a cualquier profundidad.

### Paso 1: dos contextos, en su propio archivo

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// TareasContext.jsx\nimport { createContext } from 'react'\n\nexport const TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nexport const TareasDispatchContext = createContext(null)\nTareasDispatchContext.displayName = 'TareasDispatch'",
  "anotaciones": [
    {
      "fragmento": "export const TareasContext = createContext(null)",
      "nota": "El contexto del estado: llevará la lista de tareas. No hay una lista de tareas razonable por defecto, así que null: si alguien lo lee sin proveedor, que se note (lección 28)."
    },
    {
      "fragmento": "export const TareasDispatchContext = createContext(null)",
      "nota": "Un segundo contexto, solo para la función dispatch. Por qué dos y no uno es la pregunta importante de esta lección, y tiene su propio apartado más abajo."
    },
    {
      "fragmento": "TareasDispatchContext.displayName = 'TareasDispatch'",
      "nota": "Con displayName, el árbol de renders y las React DevTools llaman a cada proveedor por su nombre. Sin él, los dos saldrían como Context y no sabrías cuál es cuál."
    }
  ]
}
```

De momento el archivo solo tiene los dos contextos; al final de la lección guardará todo lo necesario para gestionar las tareas.

### Paso 2: proveerlos desde el componente que tiene el reductor

`App` tiene `tareas` y `dispatch`, los dos valores que devuelve `useReducer`. En vez de pasarlos por props, envuelve el resto de la interfaz con los dos proveedores:

```jsx
export default function App() {
  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)

  return (
    <main>
      <TareasContext value={tareas}>
        <TareasDispatchContext value={dispatch}>
          <Cabecera />
          <NuevaTarea />
          <Tablero />
        </TareasDispatchContext>
      </TareasContext>
    </main>
  )
}
```

Dos proveedores anidados, cada uno con su `value`. El orden entre ellos da igual: son contextos distintos y no se pisan (lección 28). Y `Cabecera`, `NuevaTarea` y `Tablero` ya no reciben ninguna prop.

### Paso 3: leerlos donde hagan falta

Cada componente lee el contexto que necesita, y solo ese:

```jsx
// App.jsx
function Cabecera() {
  const tareas = useContext(TareasContext)
  // ...
}

// NuevaTarea.jsx
export default function NuevaTarea() {
  const dispatch = useContext(TareasDispatchContext)
  // ...
}

// Tablero.jsx
export default function Tablero() {
  const tareas = useContext(TareasContext)
  // ...
}

function Tarea({ tarea }) {
  const dispatch = useContext(TareasDispatchContext)
  // ...
}
```

`Zona` sigue recibiendo por props las tareas de su zona, y `Tarea` la suya: eso no es *prop drilling*, porque cada uno usa lo que recibe. Lo que desaparece es el viaje de `dispatch` por componentes que no lo usan. Así queda el huerto, con el panel «Árbol de renders» debajo de la vista previa:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El huerto con dos contextos, y el estado aún en App",
  "consigna": "Abre Tablero.jsx: Zona ya no sabe nada de dispatch. Después borra una tarea y lee en el árbol el motivo de cada componente. ¿Cuáles dicen «cambió el contexto»? ¿Y NuevaTarea, que solo usa dispatch?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useContext, useReducer } from 'react'\nimport { TareasContext, TareasDispatchContext } from './TareasContext'\nimport { tareasReducer, tareasIniciales } from './tareasReducer'\nimport NuevaTarea from './NuevaTarea'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const tareas = useContext(TareasContext)\n  const pendientes = tareas.filter((t) => !t.hecha).length\n  return (\n    <header className=\"cabecera\">\n      <h1>Huerto vecinal La Acequia</h1>\n      <p>Pendientes esta semana: {pendientes}</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n\n  return (\n    <main>\n      <TareasContext value={tareas}>\n        <TareasDispatchContext value={dispatch}>\n          <Cabecera />\n          <NuevaTarea />\n          <Tablero />\n        </TareasDispatchContext>\n      </TareasContext>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TareasContext.jsx",
      "codigo": "import { createContext } from 'react'\n\nexport const TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nexport const TareasDispatchContext = createContext(null)\nTareasDispatchContext.displayName = 'TareasDispatch'\n"
    },
    {
      "nombre": "tareasReducer.jsx",
      "codigo": "export function tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, zona: accion.zona, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nexport const tareasIniciales = [\n  { id: 1, texto: 'Regar las tomateras', zona: 'Bancales', hecha: true },\n  { id: 2, texto: 'Atar las judías a las cañas', zona: 'Bancales', hecha: false },\n  { id: 3, texto: 'Trasplantar las lechugas', zona: 'Invernadero', hecha: false },\n  { id: 4, texto: 'Voltear el compost', zona: 'Compostera', hecha: false },\n]\n"
    },
    {
      "nombre": "NuevaTarea.jsx",
      "codigo": "import { useContext, useState } from 'react'\nimport { TareasDispatchContext } from './TareasContext'\n\nlet siguienteId = 5\n\nexport default function NuevaTarea() {\n  const dispatch = useContext(TareasDispatchContext)\n  const [texto, setTexto] = useState('')\n  const [zona, setZona] = useState('Bancales')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (texto.trim() === '') return\n    dispatch({ type: 'anadida', id: siguienteId++, texto: texto.trim(), zona })\n    setTexto('')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nueva tarea\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <label>\n        Zona\n        <select value={zona} onChange={(e) => setZona(e.target.value)}>\n          <option>Bancales</option>\n          <option>Invernadero</option>\n          <option>Compostera</option>\n        </select>\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import { useContext } from 'react'\nimport { TareasContext, TareasDispatchContext } from './TareasContext'\n\nconst ZONAS = ['Bancales', 'Invernadero', 'Compostera']\n\nfunction Tarea({ tarea }) {\n  const dispatch = useContext(TareasDispatchContext)\n  return (\n    <li>\n      <label className={tarea.hecha ? 'hecha' : ''}>\n        <input\n          type=\"checkbox\"\n          checked={tarea.hecha}\n          onChange={() => dispatch({ type: 'marcada', id: tarea.id })}\n        />\n        {tarea.texto}\n      </label>\n      <button\n        aria-label={'Borrar «' + tarea.texto + '»'}\n        onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n      >\n        Borrar\n      </button>\n    </li>\n  )\n}\n\nfunction Zona({ nombre, tareas }) {\n  return (\n    <section className=\"zona\">\n      <h2>{nombre}</h2>\n      {tareas.length === 0 ? (\n        <p className=\"vacia\">Sin tareas en esta zona</p>\n      ) : (\n        <ul>\n          {tareas.map((tarea) => (\n            <Tarea key={tarea.id} tarea={tarea} />\n          ))}\n        </ul>\n      )}\n    </section>\n  )\n}\n\nexport default function Tablero() {\n  const tareas = useContext(TareasContext)\n  return (\n    <div className=\"tablero\">\n      {ZONAS.map((zona) => (\n        <Zona key={zona} nombre={zona} tareas={tareas.filter((t) => t.zona === zona)} />\n      ))}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n  background: #ecfccb;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tablero {\n  display: grid;\n  gap: 0.6rem;\n}\n\n.zona {\n  padding: 0.4rem 0.8rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.zona h2 {\n  margin: 0.2rem 0 0.4rem;\n  color: #3f6212;\n  font-size: 1.05rem;\n}\n\n.zona ul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.zona li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n\n.zona li label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n\n.vacia {\n  margin: 0;\n  color: #78716c;\n}\n"
    }
  ],
  "archivoInicial": "Tablero.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Al borrar una tarea, el árbol cuenta esto:

- Dos nodos con la insignia «proveedor», **Tareas** y **TareasDispatch**, con los nombres que les dio `displayName`. Entre los motivos del primero está «cambió la prop «value» (array nuevo)»: el reductor ha devuelto otra lista.
- `Cabecera` y `Tablero`: **«cambió el contexto «Tareas»»**. Son los que leen el estado.
- `NuevaTarea`: «se renderizó su padre». Lee `dispatch`, que no ha cambiado, pero se renderiza igualmente porque `App` lo ha hecho.

Ahí está el detalle: **el estado sigue viviendo en `App`**. Cada cambio vuelve a renderizar `App`, y con él a todos sus hijos, lean o no un contexto (lección 17). El contexto ha quitado las props de en medio, pero el árbol se renderiza igual que antes. Para que el segundo contexto sirva de algo, falta sacar el reductor de `App`.

## Todo el cableado en un componente proveedor

En la lección 28 viste un `ProveedorTema` que guardaba el estado del tema y envolvía a los demás con `children`, y comprobaste en el árbol que así solo se renderizaban él y quienes leían el contexto. Con el reductor se hace lo mismo: un componente `ProveedorTareas` que

1. guarda las tareas con `useReducer`,
2. provee los dos contextos,
3. y pinta lo que le pongan dentro, que recibe como `children` (lección 9).

Como el reductor y el proveedor van juntos, los dos se mudan al archivo de los contextos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// TareasContext.jsx\nimport { createContext, useReducer } from 'react'\n\nexport const TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nexport const TareasDispatchContext = createContext(null)\nTareasDispatchContext.displayName = 'TareasDispatch'\n\nexport function ProveedorTareas({ children }) {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n\n  return (\n    <TareasContext value={tareas}>\n      <TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>\n    </TareasContext>\n  )\n}\n\nfunction tareasReducer(tareas, accion) {\n  // ...el mismo de antes, ahora sin export\n}\n\nconst tareasIniciales = [\n  // ...las cuatro tareas\n]\n\n// App.jsx\nexport default function App() {\n  return (\n    <main>\n      <ProveedorTareas>\n        <Cabecera />\n        <NuevaTarea />\n        <Tablero />\n      </ProveedorTareas>\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export function ProveedorTareas({ children })",
      "nota": "Un componente normal, con la convención de nombre del ProveedorTema de la lección 28. Recibe en children el JSX que quien lo use ponga dentro."
    },
    {
      "fragmento": "const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)",
      "nota": "El estado ya no vive en App: vive aquí. ProveedorTareas es la parte de la pantalla que sabe gestionar las tareas."
    },
    {
      "fragmento": "<TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>",
      "nota": "Los dos proveedores envuelven a children. Si se te olvida pintar children, la pantalla se queda en blanco y nada avisa: es uno de los errores típicos."
    },
    {
      "fragmento": "function tareasReducer(tareas, accion) {",
      "nota": "El reductor ya no se exporta, porque solo lo usa el proveedor. Desde fuera no hay forma de cambiar las tareas sin pasar por dispatch."
    },
    {
      "fragmento": "<ProveedorTareas>",
      "nota": "App se queda sin estado y sin contextos: solo coloca la interfaz. Añadir mañana un componente que lea las tareas o despache acciones no obliga a tocar App."
    }
  ]
}
```

Pruébalo con el árbol a la vista:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El reductor, dentro de ProveedorTareas",
  "consigna": "Borra una tarea y compara el árbol con el del bloque anterior: ¿qué componentes salen ahora sin cambios? Después borra «Regar las tomateras», que ya estaba hecha, y fíjate en Cabecera: se renderiza, pero ¿cambia su texto?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useContext } from 'react'\nimport { ProveedorTareas, TareasContext } from './TareasContext'\nimport NuevaTarea from './NuevaTarea'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const tareas = useContext(TareasContext)\n  const pendientes = tareas.filter((t) => !t.hecha).length\n  return (\n    <header className=\"cabecera\">\n      <h1>Huerto vecinal La Acequia</h1>\n      <p>Pendientes esta semana: {pendientes}</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <ProveedorTareas>\n        <Cabecera />\n        <NuevaTarea />\n        <Tablero />\n      </ProveedorTareas>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TareasContext.jsx",
      "codigo": "import { createContext, useReducer } from 'react'\n\nexport const TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nexport const TareasDispatchContext = createContext(null)\nTareasDispatchContext.displayName = 'TareasDispatch'\n\nexport function ProveedorTareas({ children }) {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n\n  return (\n    <TareasContext value={tareas}>\n      <TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>\n    </TareasContext>\n  )\n}\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, zona: accion.zona, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nconst tareasIniciales = [\n  { id: 1, texto: 'Regar las tomateras', zona: 'Bancales', hecha: true },\n  { id: 2, texto: 'Atar las judías a las cañas', zona: 'Bancales', hecha: false },\n  { id: 3, texto: 'Trasplantar las lechugas', zona: 'Invernadero', hecha: false },\n  { id: 4, texto: 'Voltear el compost', zona: 'Compostera', hecha: false },\n]\n"
    },
    {
      "nombre": "NuevaTarea.jsx",
      "codigo": "import { useContext, useState } from 'react'\nimport { TareasDispatchContext } from './TareasContext'\n\nlet siguienteId = 5\n\nexport default function NuevaTarea() {\n  const dispatch = useContext(TareasDispatchContext)\n  const [texto, setTexto] = useState('')\n  const [zona, setZona] = useState('Bancales')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (texto.trim() === '') return\n    dispatch({ type: 'anadida', id: siguienteId++, texto: texto.trim(), zona })\n    setTexto('')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nueva tarea\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <label>\n        Zona\n        <select value={zona} onChange={(e) => setZona(e.target.value)}>\n          <option>Bancales</option>\n          <option>Invernadero</option>\n          <option>Compostera</option>\n        </select>\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import { useContext } from 'react'\nimport { TareasContext, TareasDispatchContext } from './TareasContext'\n\nconst ZONAS = ['Bancales', 'Invernadero', 'Compostera']\n\nfunction Tarea({ tarea }) {\n  const dispatch = useContext(TareasDispatchContext)\n  return (\n    <li>\n      <label className={tarea.hecha ? 'hecha' : ''}>\n        <input\n          type=\"checkbox\"\n          checked={tarea.hecha}\n          onChange={() => dispatch({ type: 'marcada', id: tarea.id })}\n        />\n        {tarea.texto}\n      </label>\n      <button\n        aria-label={'Borrar «' + tarea.texto + '»'}\n        onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n      >\n        Borrar\n      </button>\n    </li>\n  )\n}\n\nfunction Zona({ nombre, tareas }) {\n  return (\n    <section className=\"zona\">\n      <h2>{nombre}</h2>\n      {tareas.length === 0 ? (\n        <p className=\"vacia\">Sin tareas en esta zona</p>\n      ) : (\n        <ul>\n          {tareas.map((tarea) => (\n            <Tarea key={tarea.id} tarea={tarea} />\n          ))}\n        </ul>\n      )}\n    </section>\n  )\n}\n\nexport default function Tablero() {\n  const tareas = useContext(TareasContext)\n  return (\n    <div className=\"tablero\">\n      {ZONAS.map((zona) => (\n        <Zona key={zona} nombre={zona} tareas={tareas.filter((t) => t.zona === zona)} />\n      ))}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n  background: #ecfccb;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tablero {\n  display: grid;\n  gap: 0.6rem;\n}\n\n.zona {\n  padding: 0.4rem 0.8rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.zona h2 {\n  margin: 0.2rem 0 0.4rem;\n  color: #3f6212;\n  font-size: 1.05rem;\n}\n\n.zona ul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.zona li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n\n.zona li label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n\n.vacia {\n  margin: 0;\n  color: #78716c;\n}\n"
    }
  ],
  "archivoInicial": "TareasContext.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Ahora `App` y `NuevaTarea` salen **sin cambios**. `App` no tiene estado, así que no vuelve a renderizarse. Y lo que `ProveedorTareas` recibe en `children` son los mismos elementos que `App` creó en su único render, así que React no vuelve a ejecutar esa rama solo porque el proveedor se haya renderizado. Es lo mismo que viste con `ProveedorTema`. Se renderizan:

- `ProveedorTareas`, porque cambió su estado, y sus dos proveedores.
- Los que leen el estado, `Cabecera` y `Tablero`, con «cambió el contexto «Tareas»».
- Los hijos de `Tablero`: cada `Zona`, con «cambió la prop «tareas» (array nuevo)» por el `filter`, y cada `Tarea`, con «se renderizó su padre».

¿Y `NuevaTarea`? Lee `TareasDispatchContext`, cuyo valor es `dispatch`, la misma función de siempre. Su contexto no ha cambiado y su padre no se ha renderizado: **nada la obliga a renderizarse**. Ese es el premio de tener dos contextos.

## Por qué dos contextos y no uno

Después de la lección 28, lo natural sería un solo contexto con las dos cosas dentro, como hiciste con la sesión de La Despensa. Funciona, y te ahorras un contexto. Antes de ver qué cambia, predice:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export function ProveedorTareas({ children }) {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n\n  // Un solo contexto, con el estado y dispatch juntos\n  return <TareasContext value={{ tareas, dispatch }}>{children}</TareasContext>\n}\n\nexport default function NuevaTarea() {\n  const { dispatch } = useContext(TareasContext) // solo usa dispatch\n  // ...\n}\n\n// Cabecera y Tablero hacen const { tareas } = useContext(TareasContext).\n// App es la misma: <ProveedorTareas> con los tres dentro.\n// Borras una tarea. ¿Qué dice el árbol de NuevaTarea?",
  "opciones": [
    "Sin cambios: ni su padre se ha renderizado ni dispatch ha cambiado",
    "se renderizó su padre",
    "cambió el contexto «Tareas»"
  ],
  "correcta": 2,
  "explicacion": "El value es un objeto que lleva dentro las tareas, y es otro objeto cada vez que el proveedor se renderiza. React compara el valor anterior y el nuevo con Object.is, ve que son distintos y avisa a todos los que leen ese contexto. No sabe qué parte del objeto usa cada uno: NuevaTarea solo quería dispatch, pero lee el mismo contexto que las tareas."
}
```

Compruébalo. Es el huerto del bloque anterior con un solo contexto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El huerto con un solo contexto para todo",
  "consigna": "Borra una tarea y busca NuevaTarea en el árbol. Mira también las Tarea: ¿qué motivo dan ahora, y qué motivo daban con dos contextos?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useContext } from 'react'\nimport { ProveedorTareas, TareasContext } from './TareasContext'\nimport NuevaTarea from './NuevaTarea'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const { tareas } = useContext(TareasContext)\n  const pendientes = tareas.filter((t) => !t.hecha).length\n  return (\n    <header className=\"cabecera\">\n      <h1>Huerto vecinal La Acequia</h1>\n      <p>Pendientes esta semana: {pendientes}</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <ProveedorTareas>\n        <Cabecera />\n        <NuevaTarea />\n        <Tablero />\n      </ProveedorTareas>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TareasContext.jsx",
      "codigo": "import { createContext, useReducer } from 'react'\n\nexport const TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nexport function ProveedorTareas({ children }) {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n\n  // Un solo contexto, con el estado y dispatch juntos\n  return <TareasContext value={{ tareas, dispatch }}>{children}</TareasContext>\n}\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, zona: accion.zona, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nconst tareasIniciales = [\n  { id: 1, texto: 'Regar las tomateras', zona: 'Bancales', hecha: true },\n  { id: 2, texto: 'Atar las judías a las cañas', zona: 'Bancales', hecha: false },\n  { id: 3, texto: 'Trasplantar las lechugas', zona: 'Invernadero', hecha: false },\n  { id: 4, texto: 'Voltear el compost', zona: 'Compostera', hecha: false },\n]\n"
    },
    {
      "nombre": "NuevaTarea.jsx",
      "codigo": "import { useContext, useState } from 'react'\nimport { TareasContext } from './TareasContext'\n\nlet siguienteId = 5\n\nexport default function NuevaTarea() {\n  const { dispatch } = useContext(TareasContext)\n  const [texto, setTexto] = useState('')\n  const [zona, setZona] = useState('Bancales')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (texto.trim() === '') return\n    dispatch({ type: 'anadida', id: siguienteId++, texto: texto.trim(), zona })\n    setTexto('')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nueva tarea\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <label>\n        Zona\n        <select value={zona} onChange={(e) => setZona(e.target.value)}>\n          <option>Bancales</option>\n          <option>Invernadero</option>\n          <option>Compostera</option>\n        </select>\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import { useContext } from 'react'\nimport { TareasContext } from './TareasContext'\n\nconst ZONAS = ['Bancales', 'Invernadero', 'Compostera']\n\nfunction Tarea({ tarea }) {\n  const { dispatch } = useContext(TareasContext)\n  return (\n    <li>\n      <label className={tarea.hecha ? 'hecha' : ''}>\n        <input\n          type=\"checkbox\"\n          checked={tarea.hecha}\n          onChange={() => dispatch({ type: 'marcada', id: tarea.id })}\n        />\n        {tarea.texto}\n      </label>\n      <button\n        aria-label={'Borrar «' + tarea.texto + '»'}\n        onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n      >\n        Borrar\n      </button>\n    </li>\n  )\n}\n\nfunction Zona({ nombre, tareas }) {\n  return (\n    <section className=\"zona\">\n      <h2>{nombre}</h2>\n      {tareas.length === 0 ? (\n        <p className=\"vacia\">Sin tareas en esta zona</p>\n      ) : (\n        <ul>\n          {tareas.map((tarea) => (\n            <Tarea key={tarea.id} tarea={tarea} />\n          ))}\n        </ul>\n      )}\n    </section>\n  )\n}\n\nexport default function Tablero() {\n  const { tareas } = useContext(TareasContext)\n  return (\n    <div className=\"tablero\">\n      {ZONAS.map((zona) => (\n        <Zona key={zona} nombre={zona} tareas={tareas.filter((t) => t.zona === zona)} />\n      ))}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n  background: #ecfccb;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tablero {\n  display: grid;\n  gap: 0.6rem;\n}\n\n.zona {\n  padding: 0.4rem 0.8rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.zona h2 {\n  margin: 0.2rem 0 0.4rem;\n  color: #3f6212;\n  font-size: 1.05rem;\n}\n\n.zona ul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.zona li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n\n.zona li label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n\n.vacia {\n  margin: 0;\n  color: #78716c;\n}\n"
    }
  ],
  "archivoInicial": "TareasContext.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

`NuevaTarea` y cada `Tarea` dicen ahora «cambió el contexto «Tareas»», aunque solo usan `dispatch`. Con dos contextos, `NuevaTarea` no se renderizaba, y las `Tarea` lo hacían solo porque se renderizaba su padre.

La regla que hay detrás:

> **Un contexto avisa a todos sus lectores cuando cambia su valor, usen la parte que usen. Separa lo que cambia a menudo (el estado) de lo que no cambia nunca (`dispatch`).**

Como `dispatch` es siempre la misma función (lección 27), un contexto que solo lleva `dispatch` **no cambia jamás**, y nadie se renderiza nunca por leerlo. En un huerto con un formulario da igual. En una aplicación con cien botones repartidos que solo despachan acciones, con un contexto los cien se renderizan con cada cambio; con dos, ninguno lo hace por culpa del contexto.

Resumiendo, según lo que lea cada componente:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se renderiza cuando cambian las tareas",
  "roles": [
    {
      "etiqueta": "Lee el estado",
      "rol": "Se renderiza con cada cambio",
      "descripcion": "Cabecera y Tablero. Cuando el reductor devuelve una lista nueva, React los vuelve a renderizar, estén donde estén."
    },
    {
      "etiqueta": "Lee solo dispatch",
      "rol": "Nunca por culpa del contexto",
      "descripcion": "NuevaTarea. Su contexto no cambia jamás: solo se renderiza si cambia su propio estado o si se renderiza su padre."
    },
    {
      "etiqueta": "Hijo de un lector",
      "rol": "Se renderiza por su padre",
      "descripcion": "Zona y Tarea. No leen las tareas del contexto, pero Tablero sí, y al renderizarse arrastra a sus hijos (lección 17)."
    }
  ]
}
```

## Hooks propios: `useTareas()` y `useTareasDispatch()`

Queda un último paso, y es el que más verás en proyectos reales. Ahora mismo, cada componente que quiere las tareas tiene que importar dos cosas, `useContext` y `TareasContext`, y saber cuál de los dos contextos le toca. La documentación de React propone exportar desde `TareasContext.jsx` dos funciones que hagan esa lectura. Aquí van con una comprobación más, la que la lección 28 te propuso como reto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// TareasContext.jsx\nimport { createContext, useContext, useReducer } from 'react'\n\nconst TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nconst TareasDispatchContext = createContext(null)\nTareasDispatchContext.displayName = 'TareasDispatch'\n\nexport function ProveedorTareas({ children }) {\n  // ...igual que antes\n}\n\nexport function useTareas() {\n  const tareas = useContext(TareasContext)\n  if (tareas === null) {\n    throw new Error('useTareas() tiene que usarse dentro de <ProveedorTareas>')\n  }\n  return tareas\n}\n\nexport function useTareasDispatch() {\n  const dispatch = useContext(TareasDispatchContext)\n  if (dispatch === null) {\n    throw new Error('useTareasDispatch() tiene que usarse dentro de <ProveedorTareas>')\n  }\n  return dispatch\n}\n\n// En cualquier componente de dentro del proveedor:\nconst tareas = useTareas()\nconst dispatch = useTareasDispatch()",
  "anotaciones": [
    {
      "fragmento": "const TareasContext = createContext(null)",
      "nota": "Los contextos ya no se exportan. Desde fuera de este archivo, las tareas solo se alcanzan con ProveedorTareas, useTareas y useTareasDispatch."
    },
    {
      "fragmento": "export function useTareas()",
      "nota": "Un Hook propio: una función normal cuyo nombre empieza por use y que llama a otros Hooks, aquí useContext. Como llama a un Hook, se usa como un Hook: en el nivel superior de un componente."
    },
    {
      "fragmento": "if (tareas === null) {",
      "nota": "El valor por defecto es null, y el proveedor nunca da null. Si llega null, es que no hay ningún ProveedorTareas por encima: mejor fallar ya, con un mensaje que diga qué falta."
    },
    {
      "fragmento": "throw new Error('useTareas() tiene que usarse dentro de <ProveedorTareas>')",
      "nota": "El mensaje nombra el hook y el componente que falta. Lo vas a provocar en el bloque de abajo."
    },
    {
      "fragmento": "const dispatch = useTareasDispatch()",
      "nota": "Quien lo usa no sabe que hay dos contextos ni cómo se llaman. Si mañana divides el estado en más contextos o añades lógica a estas funciones, los componentes no se enteran."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Por qué el nombre empieza por use",
  "contenido": "React reconoce un Hook por su nombre: una función que empieza por use seguido de una mayúscula, como useTareas, puede llamar a otros Hooks dentro, y el linter de React comprueba que se llame como useState, en el nivel superior de un componente o de otro Hook. Por eso no se llama getTareas. Los Hooks propios tienen su lección, la 43, y sus reglas, la 44."
}
```

A este archivo se le suele llamar el **cableado** del estado: el reductor, los contextos, el proveedor y los hooks para leerlo, todo en un sitio. Los componentes piden lo que necesitan y no saben de dónde sale; como dice react.dev, se centran en lo que muestran y no en de dónde sacan los datos. (A diferencia del `TemaContext` de la lección 28, este archivo tiene JSX, el del proveedor, así que en tu proyecto también se llamaría `TareasContext.jsx`.)

Este es el huerto terminado. Comparado con el del principio, `Tablero` y `Zona` ya no transportan nada, y `App` no tiene estado:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El huerto terminado: proveedor y hooks propios",
  "consigna": "Borra una tarea: el árbol es idéntico al del proveedor sin hooks. Después, en App.jsx, saca <Cabecera /> de dentro de <ProveedorTareas> (ponla justo encima) y lee el error. Por último, quita el if de useTareas en TareasContext.jsx, repite y compara los dos mensajes.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ProveedorTareas, useTareas } from './TareasContext'\nimport NuevaTarea from './NuevaTarea'\nimport Tablero from './Tablero'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const tareas = useTareas()\n  const pendientes = tareas.filter((t) => !t.hecha).length\n  return (\n    <header className=\"cabecera\">\n      <h1>Huerto vecinal La Acequia</h1>\n      <p>Pendientes esta semana: {pendientes}</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <ProveedorTareas>\n        <Cabecera />\n        <NuevaTarea />\n        <Tablero />\n      </ProveedorTareas>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TareasContext.jsx",
      "codigo": "import { createContext, useContext, useReducer } from 'react'\n\nconst TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nconst TareasDispatchContext = createContext(null)\nTareasDispatchContext.displayName = 'TareasDispatch'\n\nexport function ProveedorTareas({ children }) {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n\n  return (\n    <TareasContext value={tareas}>\n      <TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>\n    </TareasContext>\n  )\n}\n\nexport function useTareas() {\n  const tareas = useContext(TareasContext)\n  if (tareas === null) {\n    throw new Error('useTareas() tiene que usarse dentro de <ProveedorTareas>')\n  }\n  return tareas\n}\n\nexport function useTareasDispatch() {\n  const dispatch = useContext(TareasDispatchContext)\n  if (dispatch === null) {\n    throw new Error('useTareasDispatch() tiene que usarse dentro de <ProveedorTareas>')\n  }\n  return dispatch\n}\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      return [...tareas, { id: accion.id, texto: accion.texto, zona: accion.zona, hecha: false }]\n    }\n    case 'marcada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t))\n    }\n    case 'borrada': {\n      return tareas.filter((t) => t.id !== accion.id)\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nconst tareasIniciales = [\n  { id: 1, texto: 'Regar las tomateras', zona: 'Bancales', hecha: true },\n  { id: 2, texto: 'Atar las judías a las cañas', zona: 'Bancales', hecha: false },\n  { id: 3, texto: 'Trasplantar las lechugas', zona: 'Invernadero', hecha: false },\n  { id: 4, texto: 'Voltear el compost', zona: 'Compostera', hecha: false },\n]\n"
    },
    {
      "nombre": "NuevaTarea.jsx",
      "codigo": "import { useState } from 'react'\nimport { useTareasDispatch } from './TareasContext'\n\nlet siguienteId = 5\n\nexport default function NuevaTarea() {\n  const dispatch = useTareasDispatch()\n  const [texto, setTexto] = useState('')\n  const [zona, setZona] = useState('Bancales')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (texto.trim() === '') return\n    dispatch({ type: 'anadida', id: siguienteId++, texto: texto.trim(), zona })\n    setTexto('')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nueva tarea\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <label>\n        Zona\n        <select value={zona} onChange={(e) => setZona(e.target.value)}>\n          <option>Bancales</option>\n          <option>Invernadero</option>\n          <option>Compostera</option>\n        </select>\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Tablero.jsx",
      "codigo": "import { useTareas, useTareasDispatch } from './TareasContext'\n\nconst ZONAS = ['Bancales', 'Invernadero', 'Compostera']\n\nfunction Tarea({ tarea }) {\n  const dispatch = useTareasDispatch()\n  return (\n    <li>\n      <label className={tarea.hecha ? 'hecha' : ''}>\n        <input\n          type=\"checkbox\"\n          checked={tarea.hecha}\n          onChange={() => dispatch({ type: 'marcada', id: tarea.id })}\n        />\n        {tarea.texto}\n      </label>\n      <button\n        aria-label={'Borrar «' + tarea.texto + '»'}\n        onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n      >\n        Borrar\n      </button>\n    </li>\n  )\n}\n\nfunction Zona({ nombre, tareas }) {\n  return (\n    <section className=\"zona\">\n      <h2>{nombre}</h2>\n      {tareas.length === 0 ? (\n        <p className=\"vacia\">Sin tareas en esta zona</p>\n      ) : (\n        <ul>\n          {tareas.map((tarea) => (\n            <Tarea key={tarea.id} tarea={tarea} />\n          ))}\n        </ul>\n      )}\n    </section>\n  )\n}\n\nexport default function Tablero() {\n  const tareas = useTareas()\n  return (\n    <div className=\"tablero\">\n      {ZONAS.map((zona) => (\n        <Zona key={zona} nombre={zona} tareas={tareas.filter((t) => t.zona === zona)} />\n      ))}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n  background: #ecfccb;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nselect,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\n.tablero {\n  display: grid;\n  gap: 0.6rem;\n}\n\n.zona {\n  padding: 0.4rem 0.8rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.zona h2 {\n  margin: 0.2rem 0 0.4rem;\n  color: #3f6212;\n  font-size: 1.05rem;\n}\n\n.zona ul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.zona li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n}\n\n.zona li label {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.hecha {\n  color: #78716c;\n  text-decoration: line-through;\n}\n\n.vacia {\n  margin: 0;\n  color: #78716c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Con la comprobación, la vista previa se para con el mensaje que tú escribiste:

```text
useTareas() tiene que usarse dentro de <ProveedorTareas>
```

Sin ella, `useTareas()` devuelve `null` en silencio, y el error salta una línea después, en el `filter` de `Cabecera`. En Chrome dice así (cada navegador lo redacta a su manera):

```text
Cannot read properties of null (reading 'filter')
```

Es decir: no se puede leer la propiedad `filter` de `null`. Señala una línea de `Cabecera` que está bien escrita y no dice nada del proveedor. Tres líneas por hook, y te ahorran buscar.

Fíjate también en el árbol: es idéntico al del bloque del proveedor. **Un Hook propio no es un componente**: no añade nada al árbol ni cambia lo que se renderiza. Solo ordena el código.

Así queda dónde vive cada cosa, comparado con el árbol del principio:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Después: el estado vive en ProveedorTareas y cada uno lee lo suyo",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "sin estado: solo coloca la interfaz"
    },
    {
      "nombre": "ProveedorTareas",
      "nivel": 1,
      "etiqueta": "estado: tareas",
      "nota": "useReducer(tareasReducer, …)"
    },
    {
      "nombre": "Tareas",
      "nivel": 2,
      "etiqueta": "proveedor",
      "nota": "value = tareas"
    },
    {
      "nombre": "TareasDispatch",
      "nivel": 3,
      "etiqueta": "proveedor",
      "nota": "value = dispatch"
    },
    {
      "nombre": "Cabecera",
      "nivel": 4,
      "nota": "← useTareas()"
    },
    {
      "nombre": "NuevaTarea",
      "nivel": 4,
      "nota": "← useTareasDispatch()"
    },
    {
      "nombre": "Tablero",
      "nivel": 4,
      "nota": "← useTareas()"
    },
    {
      "nombre": "Zona",
      "nivel": 5,
      "clave": "Bancales",
      "nota": "recibe las tareas de su zona"
    },
    {
      "nombre": "Tarea",
      "nivel": 6,
      "clave": "1",
      "nota": "← useTareasDispatch()"
    },
    {
      "nombre": "Tarea",
      "nivel": 6,
      "clave": "2",
      "nota": "← useTareasDispatch()"
    },
    {
      "nombre": "Zona",
      "nivel": 5,
      "clave": "Invernadero",
      "nota": "recibe las tareas de su zona"
    },
    {
      "nombre": "Tarea",
      "nivel": 6,
      "clave": "3",
      "nota": "← useTareasDispatch()"
    },
    {
      "nombre": "Zona",
      "nivel": 5,
      "clave": "Compostera",
      "nota": "recibe las tareas de su zona"
    },
    {
      "nombre": "Tarea",
      "nivel": 6,
      "clave": "4",
      "nota": "← useTareasDispatch()"
    }
  ]
}
```

## Muchos pares de reductor y contexto

Una aplicación grande no tiene un único proveedor con todo dentro, sino **un par de reductor y contexto por cada tema**: las tareas, los voluntarios del huerto, la sesión de quien ha entrado... Cada uno con su archivo, su proveedor y sus hooks:

```jsx
export default function App() {
  return (
    <ProveedorSesion>
      <ProveedorVoluntarios>
        <ProveedorTareas>
          <PaginaHuerto />
        </ProveedorTareas>
      </ProveedorVoluntarios>
    </ProveedorSesion>
  )
}
```

- **Son independientes.** Un cambio en las tareas no avisa a quien solo lee voluntarios: cada contexto avisa a sus lectores y a nadie más.
- **El orden importa cuando un proveedor usa los hooks de otro.** Si `ProveedorTareas` llama a `useSesion()` para apuntar quién ha añadido cada tarea, tiene que estar **dentro** de `ProveedorSesion`. Un componente lee los proveedores que tiene por encima, nunca los que pinta él (lección 28).
- **No todo va arriba del todo.** Si las tareas solo las usa la página del huerto, `ProveedorTareas` va en esa página, alrededor de lo que lo necesita. Así, además, el estado nace y desaparece con la página, como cualquier estado (lección 26).
- **El estado de un solo componente se queda en ese componente.** Lo que escribes en el campo de `NuevaTarea` es un `useState` de `NuevaTarea`, y ahí debe seguir. Si estuviera en el reductor, cada tecla renderizaría a todos los lectores de las tareas.

## Lo que cuesta: cada cambio avisa a todos los que leen el estado

Dos contextos libran a los que solo despachan, pero los que leen el estado no se libran de nada. Lo viste al borrar «Regar las tomateras»: la tarea ya estaba hecha, el número de pendientes no cambió, y aun así `Cabecera` se renderizó con «cambió el contexto «Tareas»». **Cuando cambia el valor de un contexto, React vuelve a renderizar a todos sus lectores**, sin mirar qué parte del valor usa cada uno. Y cada lector arrastra a sus hijos: al renderizarse `Tablero`, se renderizan todas las `Zona` y todas las `Tarea`, aunque solo haya cambiado una.

Casi siempre da igual. Renderizar es ejecutar funciones y comparar resultados, y el DOM solo se toca donde algo cambió (lección 17): al borrar esa tarea hecha, React no tocó el párrafo de la cabecera. Empieza a importar con cientos de lectores, o con un estado que cambia con cada tecla. Para entonces hay remedios, cada uno con su lección.

**Medir antes de nada.** Las React DevTools y el `<Profiler>` (lección 65) te dicen si hay un problema de verdad, y la lección 66 explica por qué se renderiza cada componente y cuándo importa.

**Separar más los contextos.** Si `Cabecera` solo necesita el número de pendientes, el proveedor puede calcularlo y darlo en un tercer contexto que solo lleve ese número:

```jsx
export function ProveedorTareas({ children }) {
  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)
  const pendientes = tareas.filter((t) => !t.hecha).length

  return (
    <TareasContext value={tareas}>
      <PendientesContext value={pendientes}>
        <TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>
      </PendientesContext>
    </TareasContext>
  )
}
```

Si `Cabecera` lee solo `PendientesContext`, al borrar una tarea hecha sale **sin cambios**: el número es el mismo, y `Object.is(3, 3)` es `true`.

**`memo`** (lección 67) hace que un componente se salte el render cuando su padre se renderiza y sus props no han cambiado. Con cada `Tarea` envuelta en `memo`, borrar una tarea deja las demás sin cambios. Pero `memo` **no frena un contexto**: si `Cabecera` usa `memo` y lee `TareasContext`, se renderiza igual con cada cambio. La propia documentación de React lo advierte.

**Una librería con selectores** (lección 75), cuando el estado es de toda la aplicación, cambia a menudo y lo leen muchos componentes. Lo ves en el apartado siguiente.

## Cuándo lo usarías de verdad

Reducer más contexto compensa cuando se juntan las dos cosas que resuelve: **un estado que cambia de varias formas** (para eso, el reductor de la lección 27) **y que necesitan componentes lejanos entre sí** (para eso, el contexto de la 28). La señal más clara: te descubres pasando `dispatch` o manejadores por componentes que no los usan. Si el estado solo baja dos niveles, las props siguen siendo lo mejor; y si es un dato que solo cambia de una forma, como el tema, basta con un `useState` y un contexto.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un carrito de la compra",
      "texto": "La cabecera enseña cuántos artículos hay, cada ficha de producto añade, la página de pago lee y vacía. Muchas acciones (producto_anadido, cantidad_cambiada, cupon_aplicado) y componentes repartidos por toda la tienda."
    },
    {
      "titulo": "Un editor con paneles",
      "texto": "Una pizarra o un editor de documentos: la barra de herramientas, el lienzo y el panel de propiedades leen y cambian el mismo documento. Y con un reductor, deshacer es guardar los estados anteriores (lección 27)."
    },
    {
      "titulo": "Un asistente de varios pasos",
      "texto": "Cada paso es un componente que lee los datos del formulario y despacha lo que cambia. El proveedor envuelve el asistente, y al cerrarlo el estado desaparece con él."
    },
    {
      "titulo": "Avisos y notificaciones",
      "texto": "Cualquier componente de la aplicación despacha aviso_anadido, y uno solo los pinta. Es el caso ideal para dos contextos: decenas de lectores de dispatch que nunca se renderizan por él, y un único lector del estado."
    }
  ]
}
```

### ¿Y cuándo una librería?

Reducer más contexto no es la única forma de compartir estado, ni la más potente. Es la que trae React, sin instalar nada, y la que conviene dominar primero, porque las librerías se entienden mejor cuando sabes qué problema te resuelven. Las más habituales, que verás para decidir y para leer código en la lección 75:

```laboratorio
{
  "tipo": "roles",
  "titulo": "De lo más sencillo a lo más potente",
  "roles": [
    {
      "etiqueta": "Props",
      "rol": "Pocos niveles y pocos componentes",
      "descripcion": "Levantar el estado al padre y pasarlo (lección 25). Explícito y fácil de seguir: es lo primero que hay que probar."
    },
    {
      "etiqueta": "Reducer + contexto",
      "rol": "Una parte de la aplicación",
      "descripcion": "Una pantalla o una sección donde componentes lejanos leen y cambian el mismo estado. Sin dependencias: solo React."
    },
    {
      "etiqueta": "Zustand",
      "rol": "Estado global sin proveedores",
      "descripcion": "Un almacén fuera de React que cada componente lee con un selector: solo se renderiza cuando cambia lo que ha seleccionado. No hay proveedores que colocar."
    },
    {
      "etiqueta": "Redux Toolkit",
      "rol": "Aplicaciones grandes y equipos",
      "descripcion": "Reductores y acciones como los tuyos, en un único almacén. useSelector renderiza solo si cambia lo seleccionado, y las Redux DevTools enseñan cada acción."
    }
  ]
}
```

Lo que decide entre ellas es lo que viste en el apartado del coste: con contexto, **cada cambio renderiza a todos los lectores del estado**; con una librería de selectores, cada componente se suscribe solo a su parte. Si tu estado cambia muy a menudo y lo leen muchísimos componentes, esa diferencia pesa. Si no, reducer y contexto llegan muy lejos.

Y si lo que compartes son datos que vienen del servidor (listas que se piden, se guardan en caché y se refrescan), lo habitual hoy es una librería de datos como TanStack Query, que verás en la lección 78.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Reducer más contexto es lo mismo que Redux",
      "realidad": "Comparten la idea: acciones que cuentan qué ha pasado y un reductor que calcula el estado siguiente. Pero Redux guarda el estado fuera de React y deja que cada componente se suscriba solo a la parte que lee. Con contexto, cada cambio renderiza a todos los lectores del estado. Lo verás en la lección 75."
    },
    {
      "mito": "Con dos contextos ya no se renderiza nada de más",
      "realidad": "Se libran los que solo leen dispatch, y solo del contexto: si su padre se renderiza, ellos también. Los que leen el estado se renderizan con cualquier cambio, les afecte o no."
    },
    {
      "mito": "Los hooks propios hacen que se renderice menos",
      "realidad": "useTareas llama a useContext(TareasContext) y se comporta exactamente igual. El árbol de renders del huerto es idéntico con los hooks y sin ellos. Sirven para ordenar el código y dar un error claro, no para optimizar."
    },
    {
      "mito": "El proveedor tiene que ir en App, arriba del todo",
      "realidad": "Va alrededor de la parte de la interfaz que necesita ese estado. Si solo lo usa una página, el proveedor va en esa página, y el estado nace y desaparece con ella."
    },
    {
      "mito": "Todo el estado de la aplicación debería ir en un único proveedor",
      "realidad": "Mejor un par de reductor y contexto por tema (tareas, voluntarios, sesión). Y el estado que solo usa un componente, como el texto de un campo, en un useState de ese componente."
    }
  ]
}
```

## Errores típicos

**Usar los hooks fuera del proveedor.** Es el más frecuente, sobre todo al mover componentes de sitio o al escribir uno nuevo en otra parte del árbol. Lo provocaste en el huerto terminado: con la comprobación en el hook, el mensaje dice exactamente qué falta; sin ella, el error salta más tarde y en otra línea.

**Poner un proveedor para cada parte de la pantalla.** Parece ordenado: un `ProveedorTareas` para la cabecera y otro para el tablero.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  return (\n    <main>\n      <ProveedorTareas>\n        <Cabecera />\n      </ProveedorTareas>\n      <ProveedorTareas>\n        <NuevaTarea />\n        <Tablero />\n      </ProveedorTareas>\n    </main>\n  )\n}\n\n// Al empezar, la cabecera dice «Pendientes esta semana: 3».\n// Borras «Voltear el compost», que estaba pendiente. ¿Qué pasa?",
  "opciones": [
    "La tarea desaparece y la cabecera pasa a 2",
    "La tarea desaparece, pero la cabecera sigue en 3",
    "Nada: dos proveedores del mismo contexto dan un error",
    "La tarea desaparece y la cabecera pasa a 1, porque el borrado se aplica dos veces"
  ],
  "correcta": 1,
  "explicacion": "Cada ProveedorTareas es un componente con su propio useReducer, y cada uno guarda su propia lista: el estado es de cada instancia (lección 26). Tarea despacha al proveedor que tiene encima, el segundo; Cabecera lee el primero, que no se ha enterado de nada. Todo lo que comparte un estado tiene que estar dentro del mismo proveedor."
}
```

**Olvidar `{children}` en el proveedor.** Si `ProveedorTareas` devuelve `<TareasDispatchContext value={dispatch} />`, sin nada dentro, la pantalla se queda en blanco: React renderiza los proveedores y debajo no hay nada que pintar. No sale ningún error ni ningún aviso en la consola. Si una aplicación con proveedores se queda vacía de repente, lo primero es mirar que cada proveedor pinte `children`.

**Envolver `dispatch` antes de proveerlo.** Parece inofensivo: `value={(accion) => dispatch(accion)}` para poner un `console.log`, o un objeto con funciones de ayuda, `value={{ anadir, borrar }}`. Pero una flecha o un objeto creados durante el render son nuevos en cada render, y el contexto de `dispatch` deja de ser estable. Pruébalo en el huerto terminado: con la flecha, `NuevaTarea` y cada `Tarea` pasan a decir «cambió el contexto «TareasDispatch»» con cada cambio. Pasa `dispatch` tal cual; si quieres funciones de ayuda estables, en la lección 67 verás `useCallback` y `useMemo`.

**Un solo contexto con `{ tareas, dispatch }`.** Funciona, y por eso se cuela tanto: no hay ningún fallo visible, solo componentes que se renderizan sin motivo, como viste en el árbol.

**Pedir el estado por si acaso.** Un componente que solo despacha, pero que también llama a `useTareas()` (porque se quedó del código de antes, o para un `console.log`), es un lector más del estado y se renderiza con cada cambio, como `Cabecera`. Pide solo lo que usas: si solo despachas, `useTareasDispatch()`.

## Ejercicios

En los presupuestos participativos del barrio de la Estación, cada vecino reparte tres apoyos entre las propuestas del año. La aplicación funciona: un reductor en `App`, y dos manejadores que bajan por props a través de `Programa`, `Area` y `Propuesta` hasta el botón de cada propuesta. Ahora piden un botón nuevo en el pie, «Retirar todos mis apoyos», y el reductor ya sabe hacerlo: tiene el caso `apoyos_reiniciados`. Pero `dispatch` no llega al pie.

En vez de abrirle otro camino de props, migra la aplicación a reducer y contexto, con el mismo esquema que el huerto. Es una refactorización: lo que ya funcionaba tiene que seguir funcionando.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los apoyos del barrio, con reducer y contexto",
  "consigna": "En PropuestasContext.jsx, crea los dos contextos con su displayName, ProveedorPropuestas y los hooks usePropuestas y usePropuestasDispatch, con un error claro fuera del proveedor. En App.jsx, cambia useReducer por <ProveedorPropuestas> y quita las props. Haz que cada componente lea con su hook lo que necesita y conecta «Retirar todos mis apoyos». Las cuatro primeras comprobaciones ya pasan: vigilan que no rompas nada al migrar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport { MAX_APOYOS, propuestasIniciales, propuestasReducer } from './PropuestasContext'\nimport Programa from './Programa'\nimport Pie from './Pie'\nimport './estilos.css'\n\nfunction Cabecera({ propuestas }) {\n  const dados = propuestas.filter((p) => p.apoyada).length\n  return (\n    <header className=\"cabecera\">\n      <h1>Presupuestos participativos · Barrio de la Estación</h1>\n      <p>Apoyos disponibles: {MAX_APOYOS - dados} de {MAX_APOYOS}</p>\n    </header>\n  )\n}\n\nexport default function App() {\n  const [propuestas, dispatch] = useReducer(propuestasReducer, propuestasIniciales)\n\n  function manejarApoyar(id) {\n    dispatch({ type: 'apoyo_dado', id })\n  }\n\n  function manejarRetirar(id) {\n    dispatch({ type: 'apoyo_retirado', id })\n  }\n\n  return (\n    <main>\n      <Cabecera propuestas={propuestas} />\n      <Programa propuestas={propuestas} onApoyar={manejarApoyar} onRetirar={manejarRetirar} />\n      <Pie />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PropuestasContext.jsx",
      "codigo": "// 1. Crea aquí dos contextos, PropuestasContext y PropuestasDispatchContext,\n//    con null como valor por defecto y un displayName cada uno.\n// 2. Escribe ProveedorPropuestas({ children }): guarda las propuestas con\n//    useReducer y provee los dos contextos a sus children.\n// 3. Exporta usePropuestas() y usePropuestasDispatch(), y haz que lancen un\n//    error claro si se usan fuera de <ProveedorPropuestas>.\n// Cuando termines, el reductor y los datos iniciales ya no necesitan export.\n\nexport const MAX_APOYOS = 3\n\nexport function propuestasReducer(propuestas, accion) {\n  switch (accion.type) {\n    case 'apoyo_dado': {\n      const dados = propuestas.filter((p) => p.apoyada).length\n      if (dados >= MAX_APOYOS) return propuestas\n      return propuestas.map((p) => (p.id === accion.id ? { ...p, apoyada: true } : p))\n    }\n    case 'apoyo_retirado': {\n      return propuestas.map((p) => (p.id === accion.id ? { ...p, apoyada: false } : p))\n    }\n    case 'apoyos_reiniciados': {\n      return propuestas.map((p) => ({ ...p, apoyada: false }))\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nexport const propuestasIniciales = [\n  { id: 1, titulo: 'Toldos para el parque infantil', area: 'Parques', apoyada: false },\n  { id: 2, titulo: 'Fuentes en el paseo del río', area: 'Parques', apoyada: false },\n  { id: 3, titulo: 'Carril bici hasta el instituto', area: 'Movilidad', apoyada: true },\n  { id: 4, titulo: 'Autobús nocturno los fines de semana', area: 'Movilidad', apoyada: false },\n  { id: 5, titulo: 'Biblioteca abierta en agosto', area: 'Cultura', apoyada: false },\n]\n"
    },
    {
      "nombre": "Programa.jsx",
      "codigo": "const AREAS = ['Parques', 'Movilidad', 'Cultura']\n\nfunction BotonApoyo({ propuesta, onApoyar, onRetirar }) {\n  if (propuesta.apoyada) {\n    return (\n      <button aria-label={'Retirar apoyo: ' + propuesta.titulo} onClick={() => onRetirar(propuesta.id)}>\n        Retirar apoyo\n      </button>\n    )\n  }\n  return (\n    <button aria-label={'Apoyar: ' + propuesta.titulo} onClick={() => onApoyar(propuesta.id)}>\n      Apoyar\n    </button>\n  )\n}\n\nfunction Propuesta({ propuesta, onApoyar, onRetirar }) {\n  return (\n    <li className={propuesta.apoyada ? 'propuesta apoyada' : 'propuesta'}>\n      <span>{propuesta.titulo}</span>\n      <BotonApoyo propuesta={propuesta} onApoyar={onApoyar} onRetirar={onRetirar} />\n    </li>\n  )\n}\n\nfunction Area({ nombre, propuestas, onApoyar, onRetirar }) {\n  return (\n    <section className=\"area\">\n      <h2>{nombre}</h2>\n      <ul>\n        {propuestas.map((propuesta) => (\n          <Propuesta key={propuesta.id} propuesta={propuesta} onApoyar={onApoyar} onRetirar={onRetirar} />\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nexport default function Programa({ propuestas, onApoyar, onRetirar }) {\n  return (\n    <div className=\"programa\">\n      {AREAS.map((area) => (\n        <Area\n          key={area}\n          nombre={area}\n          propuestas={propuestas.filter((p) => p.area === area)}\n          onApoyar={onApoyar}\n          onRetirar={onRetirar}\n        />\n      ))}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Pie.jsx",
      "codigo": "function BotonReiniciar() {\n  // Este botón tiene que despachar { type: 'apoyos_reiniciados' },\n  // pero hasta aquí no llega dispatch\n  return <button>Retirar todos mis apoyos</button>\n}\n\nexport default function Pie() {\n  return (\n    <footer className=\"pie\">\n      <p>Puedes cambiar tus apoyos hasta el 30 de noviembre.</p>\n      <BotonReiniciar />\n    </footer>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n  background: #e0f2fe;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.25rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0;\n  font-weight: 600;\n}\n\n.programa {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\n.area h2 {\n  margin: 0.3rem 0;\n  color: #075985;\n  font-size: 1.05rem;\n}\n\n.area ul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.propuesta {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.4rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.apoyada {\n  border-color: #0284c7;\n  background: #f0f9ff;\n}\n\n.pie {\n  padding-top: 0.5rem;\n  border-top: 1px solid #cbd5e1;\n}\n\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "PropuestasContext.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Al apoyar «Biblioteca abierta en agosto», la cabecera dice «Apoyos disponibles: 1 de 3»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apoyar: Biblioteca abierta en agosto"
          }
        }
      ],
      "espera": {
        "texto": "Apoyos disponibles: 1 de 3"
      }
    },
    {
      "descripcion": "Una propuesta apoyada ofrece «Retirar apoyo»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apoyar: Toldos para el parque infantil"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Retirar apoyo: Toldos para el parque infantil"
      }
    },
    {
      "descripcion": "Con los tres apoyos repartidos, un cuarto no cuenta: la propuesta sigue ofreciendo «Apoyar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apoyar: Toldos para el parque infantil"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apoyar: Fuentes en el paseo del río"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apoyar: Biblioteca abierta en agosto"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Apoyar: Biblioteca abierta en agosto"
      }
    },
    {
      "descripcion": "Retirar el apoyo al carril bici deja «Apoyos disponibles: 3 de 3»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Retirar apoyo: Carril bici hasta el instituto"
          }
        }
      ],
      "espera": {
        "texto": "Apoyos disponibles: 3 de 3"
      }
    },
    {
      "descripcion": "«Retirar todos mis apoyos» devuelve la cabecera a «Apoyos disponibles: 3 de 3»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apoyar: Biblioteca abierta en agosto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Retirar todos mis apoyos"
          }
        }
      ],
      "espera": {
        "texto": "Apoyos disponibles: 3 de 3"
      }
    },
    {
      "descripcion": "Después de retirarlos todos, el carril bici vuelve a ofrecer «Apoyar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Retirar todos mis apoyos"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Apoyar: Carril bici hasta el instituto"
      }
    }
  ]
}
```

Cuando pasen todas, abre el árbol y apoya una propuesta. Si has seguido el esquema del huerto, `App`, `Pie` y `BotonReiniciar` salen **sin cambios**: `App` ya no tiene estado, `Pie` no lee nada y `BotonReiniciar` solo lee `dispatch`. Y si mañana otro botón, en cualquier parte de la página, tiene que despachar algo, bastará con llamar a `usePropuestasDispatch()` donde esté.

Si por el camino la vista previa se para con el mensaje de error de uno de tus hooks, algún componente que lo usa ha quedado fuera de `<ProveedorPropuestas>`: es tu propia comprobación haciendo su trabajo.

**Retos para seguir practicando** (sin comprobación automática):

1. Añade al pie de los presupuestos una línea «Has apoyado: …» con los títulos de las propuestas que apoyas. ¿Qué hook necesita ahora `Pie`? Apoya una propuesta y mira en el árbol qué cambia para `Pie` y para `BotonReiniciar`.
2. En el huerto, haz que `Cabecera` no se renderice al borrar una tarea ya hecha, con un tercer contexto que solo lleve el número de pendientes y un hook `usePendientes()`. Compruébalo en el árbol.
3. Escribe un hook `useTarea(id)` que use `useTareas()` por dentro y devuelva una sola tarea, o lance un error si no existe. ¿Se renderiza menos el componente que lo usa? Compruébalo en el árbol y explica por qué.
4. Añade al huerto un segundo par de reductor y contexto para los voluntarios (`voluntariosReducer`, `ProveedorVoluntarios`, `useVoluntarios`, `useVoluntariosDispatch`) y deja elegir en cada `Tarea`, con un `select`, quién se encarga. ¿Qué proveedor va por fuera, y importa?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Scaling Up with Reducer and Context",
      "descripcion": "La página de react.dev en la que se basa esta lección: los tres pasos, el componente TasksProvider y los hooks useTasks y useTasksDispatch, con la lista de tareas de un viaje a Kioto.",
      "url": "https://react.dev/learn/scaling-up-with-reducer-and-context",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useContext",
      "descripcion": "La referencia del Hook. Su apartado «Optimizing re-renders when passing objects and functions» explica qué pasa cuando el value es un objeto nuevo en cada render, y cómo evitarlo.",
      "url": "https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Reusing Logic with Custom Hooks",
      "descripcion": "Cómo se escriben los Hooks propios como useTareas, y por qué su nombre empieza por use. Es la lección 43.",
      "url": "https://react.dev/learn/reusing-logic-with-custom-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "memo",
      "descripcion": "La referencia de memo, con la advertencia de que no evita los renders que provoca un contexto. Es la lección 67.",
      "url": "https://react.dev/reference/react/memo",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Zustand: Introduction",
      "descripcion": "Un almacén de estado sin proveedores, que cada componente lee con un selector. Para comparar con lo que has hecho aquí; lo verás en la lección 75.",
      "url": "https://zustand.docs.pmnd.rs/learn/getting-started/introduction",
      "etiqueta": "Zustand"
    },
    {
      "titulo": "Redux Toolkit: Getting Started",
      "descripcion": "La forma estándar de escribir Redux, según su documentación: reductores y acciones en un único almacén, con las Redux DevTools. También en la lección 75.",
      "url": "https://redux-toolkit.js.org/introduction/getting-started",
      "etiqueta": "Redux"
    }
  ]
}
```
