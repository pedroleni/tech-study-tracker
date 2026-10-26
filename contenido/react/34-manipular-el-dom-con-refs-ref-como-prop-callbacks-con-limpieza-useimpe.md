# Manipular el DOM con refs (`ref` como prop, callbacks con limpieza, `useImperativeHandle`, `flushSync`)

- **Módulo:** Refs y el DOM
- **Slug:** `manipular-el-dom-con-refs-ref-como-prop-callbacks-con-limpieza-useimperativehandle-flushsync` (autogenerado del título)
- **Orden:** 340
- **Fuentes:** [Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) + [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) + [flushSync](https://react.dev/reference/react-dom/flushSync) — ver `contenido/react/TEMARIO.md` #34

---

## Qué es y para qué sirve

React se encarga del DOM: tú describes la interfaz y él crea, cambia y quita los nodos (lección 17). Casi nunca necesitas tocarlos. Pero hay cosas que no son una descripción, sino una orden puntual: **«pon el cursor en este campo»**, **«desplázate hasta esta ficha»**, **«¿cuánto mide este texto?»**. No existe una prop `enfocado` ni `desplazadoHasta`. Para eso hace falta el nodo de verdad, y la forma de pedírselo a React es una ref.

En la lección 33 usaste las refs para guardar valores que no se pintan. Aquí guardarán nodos del DOM, que es su uso más conocido. Verás cómo se consiguen, en qué momento están disponibles, cómo pasarle una ref a un componente tuyo, cómo guardar una por cada elemento de una lista, cómo exponer solo algunos métodos con `useImperativeHandle` y cómo obligar a React a poner el DOM al día con `flushSync`. Y una advertencia: hay cosas que no debes hacerle al DOM que gestiona React.

Estas son las órdenes que no caben en el JSX y para las que necesitarás el nodo:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Enfocar",
      "texto": "Llevar el cursor a un campo al abrir un buscador o al encontrar un error en un formulario: focus()."
    },
    {
      "titulo": "Desplazar",
      "texto": "Ir a una ficha concreta de una lista larga o bajar hasta el último mensaje: scrollIntoView(), o cambiar scrollTop."
    },
    {
      "titulo": "Medir",
      "texto": "Saber si un texto cabe o dónde está un elemento: getBoundingClientRect(), clientWidth, scrollWidth."
    },
    {
      "titulo": "Llamar a APIs del navegador",
      "texto": "play() y pause() de un vídeo, select() para seleccionar el texto de un campo, showModal() de un dialog... Métodos que React no convierte en props."
    }
  ]
}
```

## `ref={miRef}`: React te da el nodo

Se hace en tres pasos: creas una ref vacía con `useRef(null)`, se la pasas a una etiqueta del DOM en la prop especial `ref`, y React, cuando crea ese nodo, lo guarda en `current`. Desde un manejador ya puedes usarlo con cualquier método del navegador. En este refranero, el botón de arriba lleva el cursor al buscador:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un botón que lleva el cursor al buscador",
  "codigo": "import { useRef, useState } from 'react'\n\nconst REFRANES = [\n  'A quien madruga, Dios le ayuda.',\n  'Más vale tarde que nunca.',\n  'En abril, aguas mil.',\n  'No por mucho madrugar amanece más temprano.',\n  'Cuando el río suena, agua lleva.',\n]\n\nexport default function Refranero() {\n  const buscadorRef = useRef(null)\n  const [palabra, setPalabra] = useState('')\n\n  function manejarClic() {\n    buscadorRef.current.focus()\n  }\n\n  const encontrados = REFRANES.filter((refran) =>\n    refran.toLowerCase().includes(palabra.toLowerCase()),\n  )\n\n  return (\n    <main>\n      <h1>Refranero</h1>\n      <button onClick={manejarClic}>Buscar un refrán</button>\n      <ul>\n        {encontrados.map((refran) => (\n          <li key={refran}>{refran}</li>\n        ))}\n      </ul>\n      <label>\n        Palabra que contiene\n        <input\n          ref={buscadorRef}\n          type=\"search\"\n          value={palabra}\n          onChange={(e) => setPalabra(e.target.value)}\n        />\n      </label>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 20rem;\n}",
  "anotaciones": [
    {
      "fragmento": "const buscadorRef = useRef(null)",
      "nota": "La ref empieza vacía, con null: en el primer render el input todavía no existe. Es la misma useRef de la lección 33."
    },
    {
      "fragmento": "ref={buscadorRef}",
      "nota": "ref es una prop especial: no acaba como atributo en el HTML. Le dice a React que, cuando cree este input en la página, guarde el nodo en buscadorRef.current, y que lo vacíe si el input desaparece."
    },
    {
      "fragmento": "buscadorRef.current.focus()",
      "nota": "En el manejador, current es el elemento input real, el mismo que devolvería querySelector, y focus() es el método del navegador de siempre. El cursor salta al campo."
    },
    {
      "fragmento": "value={palabra}",
      "nota": "La ref y el input controlado conviven sin problema: el valor lo manda el estado (lección 22) y la ref solo se usa para enfocarlo. React sigue gestionando el campo."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Pulsa «Buscar un refrán» y empieza a escribir sin hacer clic en el campo: el texto va directamente al buscador.

¿Por qué no `document.querySelector('input').focus()`, como en JavaScript? Funcionaría aquí, pero busca en **toda la página** y se queda con el primero que encuentra. En cuanto el componente aparezca dos veces, o haya otro campo antes, enfocará el que no es; lo verás en los errores típicos. Una ref apunta al nodo que pinta **esta** copia del componente, sin buscar nada.

## Cuándo está el nodo en `ref.current`

Recuerda los pasos de la lección 17: primero React **renderiza** (llama a tus componentes para saber qué debe verse) y después hace el **commit** (cambia el DOM). La ref se rellena en el commit, así que su contenido depende del momento en que la mires:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "La vida de buscadorRef.current",
  "items": [
    {
      "fecha": "Render 1",
      "titulo": "React llama a Refranero",
      "texto": "El input todavía no existe en la página. current vale null."
    },
    {
      "fecha": "Commit 1",
      "titulo": "React crea el input",
      "texto": "Lo mete en la página y, justo después, guarda el nodo en current."
    },
    {
      "fecha": "Clic",
      "titulo": "Un manejador lee la ref",
      "texto": "Los clics llegan cuando la página ya está pintada: current es el input y focus() funciona. Por eso las refs se usan en los manejadores."
    },
    {
      "fecha": "Render 2",
      "titulo": "Mientras React vuelve a renderizar",
      "texto": "current sigue apuntando al nodo del commit anterior. Si este render va a cambiar algo, todavía no ha pasado: es pronto para leerlo."
    },
    {
      "fecha": "Commit",
      "titulo": "El input desaparece",
      "texto": "Si una condición deja de pintar el input, React lo quita de la página y pone current a null."
    }
  ]
}
```

Míralo en directo. Este refranero tiene un botón para plegar el buscador, y un `console.log` que lee la ref durante el render **solo para espiar qué hay dentro**; en tu código, ya sabes por la lección 33 que no se hace.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ref que se queda vacía",
  "consigna": "Mira la consola al cargar. Pulsa «Buscar un refrán»: funciona. Pulsa «Ocultar el buscador» y después «Buscar un refrán» otra vez, y lee el error que sale debajo de la vista previa. Arréglalo para que, sin buscador, el botón no haga nada.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nexport default function Refranero() {\n  const buscadorRef = useRef(null)\n  const [conBuscador, setConBuscador] = useState(true)\n\n  // Solo para espiar: leer una ref durante el render no se hace\n  console.log('Render. buscadorRef.current:', buscadorRef.current?.tagName ?? null)\n\n  function manejarBuscar() {\n    buscadorRef.current.focus()\n  }\n\n  return (\n    <main>\n      <h1>Refranero</h1>\n      <button onClick={manejarBuscar}>Buscar un refrán</button>\n      <button onClick={() => setConBuscador(!conBuscador)}>\n        {conBuscador ? 'Ocultar el buscador' : 'Mostrar el buscador'}\n      </button>\n      {conBuscador && (\n        <label>\n          Palabra que contiene\n          <input ref={buscadorRef} type=\"search\" />\n        </label>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 20rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Al cargar, la consola dice `null` dos veces: las dos llamadas de `StrictMode` al primer render, cuando el input aún no existe. Al ocultar el buscador, el render escribe `INPUT` (todavía es el nodo del commit anterior), y en el commit React lo quita y vacía la ref. Por eso el siguiente clic falla. En Chrome, debajo de la vista previa:

```text
Error: Uncaught TypeError: Cannot read properties of null (reading 'focus')
```

Es decir: no se puede leer `focus` de `null`. Firefox y Safari lo cuentan con otras palabras, pero es el mismo fallo. Si un nodo puede no estar, compruébalo antes de usarlo; lo más corto es el encadenamiento opcional:

```jsx
function manejarBuscar() {
  buscadorRef.current?.focus()
}
```

Dos consecuencias prácticas de esta línea de tiempo:

- **Usa las refs del DOM en los manejadores**, que siempre llegan después del commit. Durante el render son `null` la primera vez y el nodo viejo las demás.
- **Si necesitas el nodo en cuanto aparece, sin que nadie pulse nada** (enfocar un campo al abrir una página, medir algo nada más pintarlo), un manejador no sirve. Eso es trabajo de un efecto (lección 38) o, para medir antes de que el navegador pinte, de `useLayoutEffect` (lección 45).

## Desplazar y medir

Enfocar es la operación más común, pero cualquier método del nodo está a tu alcance. Para **desplazarte**, `nodo.scrollIntoView()` mueve el scroll hasta dejar el elemento a la vista; con `{ behavior: 'smooth', block: 'nearest' }` lo hace con suavidad y moviendo lo mínimo, sin centrar de golpe. Lo usarás enseguida, en la guía de árboles.

Para **medir**, el nodo tiene `getBoundingClientRect()`, que devuelve su tamaño y su posición en la pantalla, y propiedades como `clientWidth`, el ancho de su interior. En este taller de rotulación comprueban si un nombre cabe en el cartel antes de encargarlo. Hay dos refs en el mismo componente: una para el cartel, que da el espacio disponible, y otra para el texto, que da lo que ocupa:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "¿Cabe el rótulo?",
  "consigna": "Pulsa «Medir» con el texto que viene. Después escribe un nombre más largo, como «Ferretería y Bricolaje La Llave Maestra», y vuelve a medir. Cambia el ancho de .rotulo en estilos.css y comprueba que la medida cambia: se mide el DOM real, no el JSX.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nexport default function Rotulo() {\n  const [texto, setTexto] = useState('Ferretería La Llave')\n  const [medida, setMedida] = useState(null)\n  const rotuloRef = useRef(null)\n  const textoRef = useRef(null)\n\n  function manejarCambio(e) {\n    setTexto(e.target.value)\n    setMedida(null)\n  }\n\n  function manejarMedir() {\n    const disponible = rotuloRef.current.clientWidth\n    const ocupa = Math.ceil(textoRef.current.getBoundingClientRect().width)\n    setMedida({ ocupa, disponible })\n  }\n\n  return (\n    <main>\n      <h1>Rótulos Martín</h1>\n      <label>\n        Texto del rótulo\n        <input value={texto} onChange={manejarCambio} />\n      </label>\n      <div className=\"cartel\">\n        <p ref={rotuloRef} className=\"rotulo\">\n          <span ref={textoRef}>{texto}</span>\n        </p>\n      </div>\n      <button onClick={manejarMedir}>Medir</button>\n      {medida &&\n        (medida.ocupa <= medida.disponible ? (\n          <p>Cabe: el texto ocupa {medida.ocupa} de {medida.disponible} píxeles.</p>\n        ) : (\n          <p>No cabe: sobran {medida.ocupa - medida.disponible} píxeles.</p>\n        ))}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 22rem;\n}\n\n.cartel {\n  display: inline-block;\n  margin: 1rem 0;\n  padding: 0.5rem 0.75rem;\n  border: 3px double #78350f;\n  background: #fef3c7;\n}\n\n.rotulo {\n  width: 15rem;\n  margin: 0;\n  overflow: hidden;\n  white-space: nowrap;\n  color: #78350f;\n  font: 700 1.4rem Georgia, serif;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

`manejarMedir` lee el nodo después de que React haya pintado el último texto que escribiste, así que la medida es la buena. El resultado, en cambio, va al **estado**: se enseña en pantalla. Medir es leer el DOM; lo que haces con la medida sigue el camino de siempre.

## Refs a tus propios componentes: `ref` es una prop

En el refranero, el input estaba en el mismo componente que el botón. En una app real lo normal es tener un componente de campo reutilizable, y entonces el padre no tiene el input a mano. Mira qué pasa si le pasas una ref a un componente tuyo que no hace nada con ella:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function CampoBusqueda({ etiqueta }) {\n  return (\n    <label>\n      {etiqueta}\n      <input type=\"search\" />\n    </label>\n  )\n}\n\nexport default function Agenda() {\n  const busquedaRef = useRef(null)\n\n  return (\n    <main>\n      <button onClick={() => busquedaRef.current.focus()}>\n        Buscar actividad\n      </button>\n      <CampoBusqueda etiqueta=\"Taller o curso\" ref={busquedaRef} />\n    </main>\n  )\n}\n\n// Pulsas «Buscar actividad». ¿Qué pasa?",
  "opciones": [
    "El cursor va al campo de búsqueda",
    "React avisa en la consola de que CampoBusqueda no acepta refs",
    "Error: Cannot read properties of null (reading 'focus')",
    "No pasa nada, sin errores"
  ],
  "correcta": 2,
  "explicacion": "Desde React 19, ref es una prop más de los componentes de función: CampoBusqueda la recibe, pero no se la pasa a nadie, así que ningún nodo del DOM la rellena y current sigue en null. React no avisa de nada (comprobado con 19.3.1). Un componente no expone sus nodos del DOM salvo que lo decida él."
}
```

La solución es la de cualquier prop: el componente la recibe y **decide a qué nodo se la pasa**. Arréglalo tú en el campo de la agenda del centro cívico:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un campo que acepta una ref",
  "consigna": "Pulsa «Buscar actividad»: sale el error del null. En CampoBusqueda.jsx, añade ref a las props que recibe y pásala al input. Vuelve a pulsar: el cursor tiene que ir al campo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef } from 'react'\nimport CampoBusqueda from './CampoBusqueda'\nimport './estilos.css'\n\nconst ACTIVIDADES = ['Yoga suave', 'Taller de encuadernación', 'Huerto urbano', 'Inglés para viajar']\n\nexport default function Agenda() {\n  const busquedaRef = useRef(null)\n\n  return (\n    <main>\n      <h1>Centro cívico El Torreón</h1>\n      <button onClick={() => busquedaRef.current.focus()}>Buscar actividad</button>\n      <ul>\n        {ACTIVIDADES.map((actividad) => (\n          <li key={actividad}>{actividad}</li>\n        ))}\n      </ul>\n      <CampoBusqueda etiqueta=\"Taller o curso\" placeholder=\"Por ejemplo, yoga\" ref={busquedaRef} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "CampoBusqueda.jsx",
      "codigo": "// Le falta recibir ref y pasársela al input.\nexport default function CampoBusqueda({ etiqueta, placeholder }) {\n  return (\n    <label className=\"campo\">\n      {etiqueta}\n      <input type=\"search\" placeholder={placeholder} />\n    </label>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 20rem;\n}\n"
    }
  ],
  "archivoInicial": "CampoBusqueda.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El arreglo es una palabra en las props y otra en el JSX:

```jsx
export default function CampoBusqueda({ etiqueta, placeholder, ref }) {
  return (
    <label className="campo">
      {etiqueta}
      <input type="search" placeholder={placeholder} ref={ref} />
    </label>
  )
}
```

Ahora `busquedaRef`, creada en `Agenda`, apunta al input que pinta `CampoBusqueda`. Un detalle de React 19: como `ref` es una prop más, si tu componente reparte el resto de las props en el input con `{ etiqueta, ...resto }` y `<input {...resto} />`, la ref viaja dentro de `resto` y llega al input sin que la nombres (comprobado con 19.3.1). Funciona, pero sacarla aparte deja claro a qué nodo va.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "En código antiguo verás forwardRef",
  "contenido": "Hasta React 18, un componente de función no podía recibir ref como prop: había que envolverlo en forwardRef, que le pasaba la ref como segundo argumento, aparte de las props. Desde React 19 ya no hace falta, y react.dev anuncia que forwardRef quedará obsoleto en una versión futura. Lo reconocerás en muchos proyectos y librerías; lo verás con calma en la lección 91."
}
```

```jsx
// Antes de React 19
const CampoBusqueda = forwardRef(function CampoBusqueda({ etiqueta }, ref) {
  return (
    <label>
      {etiqueta}
      <input type="search" ref={ref} />
    </label>
  )
})
```

Exponer un nodo es una decisión del componente, y conviene tomarla con cuidado: el padre podrá hacerle **cualquier cosa** a ese input, también cambiarle los estilos o quitarlo. Para campos, botones y otras piezas básicas de un formulario es lo habitual. Para componentes más grandes, a menudo es mejor exponer solo un par de métodos, como verás con `useImperativeHandle`.

## Una ref por cada elemento de una lista: refs de callback

Hasta aquí había una ref por nodo, escrita a mano. ¿Y si son las fichas de una lista que sale de un array y no sabes cuántas habrá? No puedes llamar a `useRef` dentro de un `map`: los Hooks van siempre arriba del componente, en el mismo número y orden (lección 16). Si la lista crece, React lo detecta y la app se rompe con «Rendered more hooks than during the previous render.».

La solución es pasar a `ref` **una función** en vez de un objeto: una **ref de callback**. React la llama con el nodo cuando lo mete en la página. Y desde React 19, esa función puede **devolver otra, de limpieza**, que React llama cuando el nodo desaparece. Con eso mantienes tú un `Map` de identificador a nodo, guardado en una ref:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ficha por árbol, un Map de nodos",
  "consigna": "Pulsa el nombre de un árbol y la lista se desplaza hasta su ficha. Mira la consola al cargar: StrictMode guarda, limpia y vuelve a guardar las ocho fichas. Marca «Solo los de hoja perenne» y fíjate en el tamaño del mapa. Después borra el return con su limpieza y vuelve a marcar y desmarcar la casilla: ¿cuántas fichas dice el mapa que hay?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport { ARBOLES } from './arboles'\nimport './estilos.css'\n\nexport default function GuiaArboles() {\n  const fichasRef = useRef(null)\n  const [soloPerennes, setSoloPerennes] = useState(false)\n\n  function obtenerMapa() {\n    if (fichasRef.current === null) {\n      fichasRef.current = new Map()\n    }\n    return fichasRef.current\n  }\n\n  function manejarIr(id) {\n    const nodo = obtenerMapa().get(id)\n    nodo.scrollIntoView({ behavior: 'smooth', block: 'nearest' })\n  }\n\n  const visibles = soloPerennes ? ARBOLES.filter((arbol) => arbol.perenne) : ARBOLES\n\n  return (\n    <main>\n      <h1>Árboles del parque de la Dehesa</h1>\n      <label>\n        <input\n          type=\"checkbox\"\n          checked={soloPerennes}\n          onChange={(e) => setSoloPerennes(e.target.checked)}\n        />{' '}\n        Solo los de hoja perenne\n      </label>\n      <nav aria-label=\"Ir a un árbol\">\n        {visibles.map((arbol) => (\n          <button key={arbol.id} onClick={() => manejarIr(arbol.id)}>\n            {arbol.nombre}\n          </button>\n        ))}\n      </nav>\n      <ul className=\"fichas\">\n        {visibles.map((arbol) => (\n          <li\n            key={arbol.id}\n            ref={(nodo) => {\n              obtenerMapa().set(arbol.id, nodo)\n              console.log('Guardo', arbol.nombre, '· en el mapa:', obtenerMapa().size)\n              return () => {\n                obtenerMapa().delete(arbol.id)\n                console.log('Limpio', arbol.nombre, '· en el mapa:', obtenerMapa().size)\n              }\n            }}\n          >\n            <h2>{arbol.nombre}</h2>\n            <p>{arbol.donde}</p>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "arboles.jsx",
      "codigo": "export const ARBOLES = [\n  { id: 'encina', nombre: 'Encina', perenne: true, donde: 'Junto a la fuente del León, la más vieja del parque.' },\n  { id: 'castano', nombre: 'Castaño de Indias', perenne: false, donde: 'En el paseo central, en doble fila.' },\n  { id: 'pino', nombre: 'Pino piñonero', perenne: true, donde: 'En la loma del merendero.' },\n  { id: 'platano', nombre: 'Plátano de sombra', perenne: false, donde: 'Alrededor del quiosco de música.' },\n  { id: 'madrono', nombre: 'Madroño', perenne: true, donde: 'Al lado del banco de piedra, frente al estanque.' },\n  { id: 'tilo', nombre: 'Tilo', perenne: false, donde: 'En la entrada norte; en junio huele a flor.' },\n  { id: 'cedro', nombre: 'Cedro del Himalaya', perenne: true, donde: 'Detrás de la casa del guarda.' },\n  { id: 'almez', nombre: 'Almez', perenne: false, donde: 'En el camino del arroyo.' },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\nnav {\n  margin: 0.75rem 0 0.25rem;\n}\n\nnav button {\n  font-size: 0.9rem;\n  padding: 0.25rem 0.5rem;\n}\n\n.fichas {\n  max-height: 13rem;\n  overflow-y: auto;\n  margin: 0;\n  padding: 0.5rem;\n  list-style: none;\n  border: 1px solid #a3a3a3;\n  border-radius: 6px;\n}\n\n.fichas li {\n  padding: 0.5rem 0.75rem;\n  margin-bottom: 0.5rem;\n  border-radius: 6px;\n  background: #ecfccb;\n}\n\n.fichas h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.fichas p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Lo que tienes que mirar, por partes:

- **El `Map` vive en una ref** y se crea la primera vez que hace falta, con la función `obtenerMapa`: es la inicialización perezosa de la lección 33, pero llamada desde las refs de callback y desde el manejador, nunca desde el render.
- **La ref de callback guarda y la limpieza quita.** Al cargar, la consola cuenta hasta 8, baja a 0 y vuelve a 8. Es `StrictMode`: en desarrollo, a cada ref de callback le hace **un ciclo extra de guardar y limpiar** antes del de verdad, para comprobar que tu limpieza deshace lo que hizo la función. En producción, cada ficha se guardaría una sola vez.
- **Al marcar la casilla**, React limpia las ocho fichas y vuelve a guardar las cuatro que siguen, no solo quita las que desaparecen. La flecha que pasas a `ref` es una función nueva en cada render, y cuando React recibe una ref de callback distinta, llama a la limpieza de la anterior y luego a la nueva. Como la limpieza deshace exactamente lo que hizo la función, no pasa nada: el mapa acaba con las cuatro perennes.
- **Sin la limpieza**, el mapa no baja nunca de 8. Si la función no devuelve nada, React mantiene el comportamiento de antes de React 19: cuando el nodo desaparece, vuelve a llamarla, esta vez con `null`. Por eso la consola dice «Guardo» también para las fichas que se van: tu función guarda ese `null` en el mapa, y las fichas que ya no existen siguen ahí, apuntando a nada. Es el fallo que `StrictMode` quiere que veas al cargar, antes de que llegue a producción.

Esa llamada con `null` es lo que verás en código anterior a React 19, con refs de callback escritas como `ref={(nodo) => { if (nodo) … }}`. react.dev avisa de que esa compatibilidad se quitará en una versión futura; con la limpieza no tienes que preocuparte de los `null`.

## `useImperativeHandle`: exponer solo lo que quieres

Pasar una ref al input de `CampoBusqueda` le da al padre el nodo entero. A veces el padre solo necesita **pedir una acción** concreta, y lo que hay dentro es asunto del hijo. En la web de un huerto comunitario, el botón «Escribir un comentario» de la página tiene que bajar la lista de comentarios hasta el final **y** poner el cursor en el campo, dos nodos distintos dentro de `Noticia`. Con `useImperativeHandle`, `Noticia` decide qué recibe el padre en su ref: un objeto con un solo método, `irAComentar`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una noticia que solo expone irAComentar",
  "consigna": "Pulsa «Escribir un comentario»: la lista baja hasta el último y el cursor queda en el campo. Mira en la consola qué ve el padre en su ref. Después añade en manejarComentar la línea noticiaRef.current.style.opacity = 0.5 y vuelve a pulsar: ¿qué error sale?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef } from 'react'\nimport Noticia from './Noticia'\nimport './estilos.css'\n\nexport default function Pagina() {\n  const noticiaRef = useRef(null)\n\n  function manejarComentar() {\n    console.log('El padre ve:', Object.keys(noticiaRef.current))\n    noticiaRef.current.irAComentar()\n  }\n\n  return (\n    <main>\n      <button onClick={manejarComentar}>Escribir un comentario</button>\n      <Noticia ref={noticiaRef} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Noticia.jsx",
      "codigo": "import { useImperativeHandle, useRef } from 'react'\n\nconst COMENTARIOS = [\n  'Las sembramos en noviembre y ya asoman. ¡Qué ilusión!',\n  '¿Hace falta regarlas mucho con estas lluvias?',\n  'Casi nada: con la lluvia de la semana les sobra.',\n  'El sábado llevo cañas para entutorarlas.',\n  'Yo puedo ir el domingo por la mañana.',\n  'Ojo con los pulgones cuando suban las temperaturas.',\n  'Apunto el jabón potásico para la lista de la compra.',\n  '¿Alguien tiene semillas de guisante para la parcela 4?',\n]\n\nexport default function Noticia({ ref }) {\n  const listaRef = useRef(null)\n  const comentarioRef = useRef(null)\n\n  useImperativeHandle(ref, () => {\n    return {\n      irAComentar() {\n        const lista = listaRef.current\n        lista.scrollTop = lista.scrollHeight\n        comentarioRef.current.focus()\n      },\n    }\n  }, [])\n\n  return (\n    <article>\n      <h1>Ya han brotado las habas del huerto comunitario</h1>\n      <p>Tres meses después de la siembra de otoño, la parcela 2 está en flor.</p>\n      <h2>Comentarios</h2>\n      <ul ref={listaRef} className=\"comentarios\">\n        {COMENTARIOS.map((comentario) => (\n          <li key={comentario}>{comentario}</li>\n        ))}\n      </ul>\n      <label className=\"campo\">\n        Tu comentario\n        <textarea ref={comentarioRef} rows={2} />\n      </label>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\n.comentarios {\n  max-height: 8rem;\n  overflow-y: auto;\n  padding: 0.5rem 0.5rem 0.5rem 1.5rem;\n  border: 1px solid #a3a3a3;\n  border-radius: 6px;\n}\n\n.comentarios li {\n  margin-bottom: 0.4rem;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  margin-top: 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "Noticia.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

`useImperativeHandle(ref, crear, dependencias)` recibe la ref que llegó por props, una función que devuelve lo que verá el padre (normalmente, un objeto con métodos) y una lista de dependencias, como las de los efectos que verás en el módulo 6: aquí `[]`, porque los métodos solo usan refs, que no cambian. La ref del padre ya no apunta a ningún nodo, sino a ese objeto: la consola enseña `["irAComentar"]`, y la línea del estilo falla con «Cannot set properties of undefined (setting 'opacity')», porque el objeto no tiene `style`. `Noticia` puede cambiar por dentro (otra lista, otro campo) sin que el padre se entere, mientras siga ofreciendo `irAComentar`.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Si se puede decir con una prop, no uses una ref",
  "contenido": "useImperativeHandle es para acciones que no son un estado: enfocar, desplazar, seleccionar texto, lanzar una animación. Para algo que sí lo es, como si un panel está abierto, no expongas abrir() y cerrar(): recibe abierto como prop y deja que el padre lo controle con su estado. Así el padre sabe siempre cómo está el panel, y React lo pinta como todo lo demás."
}
```

## `flushSync`: que el DOM esté al día antes de seguir

En la lección 19 viste que React no aplica los cambios de estado en cuanto llamas a `set`: los encola y hace un solo render cuando termina el manejador. Casi siempre es lo que quieres. Pero choca con las refs cuando, **en el mismo manejador**, cambias el estado y luego quieres usar el DOM que ese cambio va a producir. En este cuaderno de avistamientos de aves, cada especie nueva se añade al final de la lista y la lista se desplaza hasta ella:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un scroll que siempre llega tarde",
  "consigna": "Añade «Garza real» y mira la consola: ¿hasta qué ave se desplaza? Añade otra y compruébalo de nuevo. Arréglalo: importa flushSync de react-dom y envuelve en él las dos llamadas a set de manejarEnvio. Vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nlet siguienteId = 7\n\nexport default function Cuaderno() {\n  const listaRef = useRef(null)\n  const [especie, setEspecie] = useState('')\n  const [avistamientos, setAvistamientos] = useState([\n    { id: 1, especie: 'Abubilla' },\n    { id: 2, especie: 'Cigüeña blanca' },\n    { id: 3, especie: 'Martín pescador' },\n    { id: 4, especie: 'Petirrojo' },\n    { id: 5, especie: 'Garcilla bueyera' },\n    { id: 6, especie: 'Milano real' },\n  ])\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (especie.trim() === '') return\n    setAvistamientos([...avistamientos, { id: siguienteId++, especie: especie.trim() }])\n    setEspecie('')\n    const ultimo = listaRef.current.lastElementChild\n    console.log('Me desplazo hasta:', ultimo.textContent)\n    ultimo.scrollIntoView({ behavior: 'smooth', block: 'nearest' })\n  }\n\n  return (\n    <main>\n      <h1>Cuaderno de avistamientos · Laguna de las Garzas</h1>\n      <ol ref={listaRef} className=\"lista\">\n        {avistamientos.map((avistamiento) => (\n          <li key={avistamiento.id}>{avistamiento.especie}</li>\n        ))}\n      </ol>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Especie\n          <input value={especie} onChange={(e) => setEspecie(e.target.value)} />\n        </label>\n        <button type=\"submit\">Añadir</button>\n      </form>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\n.lista {\n  max-height: 7rem;\n  overflow-y: auto;\n  padding: 0.5rem 0.5rem 0.5rem 2.25rem;\n  border: 1px solid #a3a3a3;\n  border-radius: 6px;\n}\n\n.lista li {\n  padding: 0.15rem 0;\n}\n\nlabel {\n  display: inline-grid;\n  gap: 0.25rem;\n  margin-right: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

La consola dice «Me desplazo hasta: Milano real» aunque acabas de añadir la garza: cuando el manejador lee `listaRef.current.lastElementChild`, React todavía no ha renderizado. La garza está en la cola de cambios, no en la página. La lista va siempre un ave por detrás.

`flushSync`, de `react-dom`, le dice a React: **aplica ya lo que pida esta función, renderizado y commit incluidos, antes de seguir con la línea siguiente**.

```jsx
import { flushSync } from 'react-dom'

function manejarEnvio(e) {
  e.preventDefault()
  if (especie.trim() === '') return
  flushSync(() => {
    setAvistamientos([...avistamientos, { id: siguienteId++, especie: especie.trim() }])
    setEspecie('')
  })
  // Aquí el DOM ya tiene el <li> nuevo
  listaRef.current.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
```

Con este cambio, la consola dice la especie que acabas de añadir y la lista baja hasta ella. Úsalo con mesura:

- **Es un último recurso.** Obliga a React a renderizar en el acto, sin agrupar, y usado a menudo hace la app más lenta. react.dev lo resume así: casi siempre se puede evitar.
- **Solo en manejadores.** Llamado durante un render o dentro de un efecto, React no puede aplicar nada en el acto: el cambio llega cuando le toca, y la consola avisa con «flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task.» (no se puede vaciar la cola mientras React ya está renderizando; mejor llamarlo desde otra tarea).
- **Si solo quieres ver un valor nuevo**, no hace falta: calcúlalo en una constante, como en la lección 18. `flushSync` es para cuando necesitas el **DOM** nuevo.

## No toques a mano el DOM que gestiona React

Enfocar, desplazar y medir son operaciones que **no cambian** el DOM: React no se entera, ni tiene por qué. Otra cosa es cambiarlo. React lleva la cuenta de qué nodos creó y dónde los puso, y da por hecho que siguen ahí. Si alguien los quita o los mueve por detrás, la próxima vez que React quiera tocarlos se encontrará otra cosa. En este aviso de la biblioteca hay dos formas de hacerlo desaparecer:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Quitar a mano lo que pinta React",
  "consigna": "Pulsa «Ocultar el aviso» y «Mostrar el aviso» unas cuantas veces: va bien. Ahora pulsa «Quitar el aviso a mano», que llama a remove() sobre el nodo, y después «Ocultar el aviso». Lee el error.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nexport default function Biblioteca() {\n  const [visible, setVisible] = useState(true)\n  const avisoRef = useRef(null)\n\n  return (\n    <main>\n      <h1>Biblioteca municipal</h1>\n      <button onClick={() => setVisible(!visible)}>\n        {visible ? 'Ocultar el aviso' : 'Mostrar el aviso'}\n      </button>\n      <button onClick={() => avisoRef.current.remove()}>Quitar el aviso a mano</button>\n      {visible && (\n        <p ref={avisoRef} className=\"aviso\">\n          La sala de estudio cierra por obras del 3 al 14 de marzo.\n        </p>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\n.aviso {\n  padding: 0.75rem;\n  border-left: 4px solid #b45309;\n  background: #fffbeb;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Después de quitarlo a mano, la pantalla ya miente: el aviso no está, pero el botón sigue diciendo «Ocultar el aviso», porque el estado `visible` sigue en `true`. Al pulsarlo, React intenta quitar del DOM un párrafo que ya no está donde lo dejó, y la vista previa se queda en blanco con este error (en Chrome):

```text
Error al renderizar: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
```

Es decir: no se pudo ejecutar `removeChild`, porque el nodo que había que quitar ya no es hijo de su padre. React no sabe seguir y desmonta la app entera. La regla:

- **Lo que no cambia el DOM**, siempre: enfocar, desplazar, medir, seleccionar texto, reproducir un vídeo.
- **Lo que sí lo cambia**, nunca sobre nodos que gestiona React: quitar o mover nodos, añadir hijos, cambiar textos o atributos que salen de tu JSX. Para eso está el estado.
- **La excepción**: un elemento que React deja vacío a propósito, como un `<div ref={mapaRef} />` sin hijos en el JSX. React no tiene ningún motivo para tocar su interior, así que una librería de mapas o de gráficos puede llenarlo a su manera. Eso se hace en un efecto (lección 38).

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Gestionar el foco",
      "texto": "Llevar el cursor al buscador al pulsar un botón, al primer campo con error al enviar un formulario o de vuelta al botón que abrió una ventana cuando se cierra. Es la base de la accesibilidad con teclado, y la lección 37 la trata a fondo."
    },
    {
      "titulo": "Desplazar",
      "texto": "Ir a una ficha de una lista larga, bajar al último mensaje de un chat, volver arriba al cambiar de página en un listado."
    },
    {
      "titulo": "Medir",
      "texto": "Saber si un texto cabe, cuánto espacio queda o dónde colocar un aviso flotante. Si hay que medir antes de que el navegador pinte, con useLayoutEffect (lección 45)."
    },
    {
      "titulo": "Componentes de formulario reutilizables",
      "texto": "Campos, botones y selectores propios que aceptan ref y se la pasan a su elemento, como hacen las librerías de componentes (lección 80)."
    },
    {
      "titulo": "Librerías que pintan su propio DOM",
      "texto": "Mapas, gráficos, editores de texto enriquecido: les das un div vacío con una ref y ellas hacen el resto, desde un efecto."
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
      "mito": "Una ref es un querySelector más largo",
      "realidad": "querySelector busca en toda la página y devuelve el primero que encuentra. La ref apunta al nodo que pinta esta copia del componente, aunque haya diez iguales, y React la vacía cuando el nodo desaparece."
    },
    {
      "mito": "La ref está lista en cuanto escribes ref={miRef}",
      "realidad": "Se rellena en el commit. Durante el primer render vale null, y durante los siguientes apunta al nodo anterior. En los manejadores, en cambio, siempre está al día."
    },
    {
      "mito": "Para pasar una ref a un componente propio hace falta forwardRef",
      "realidad": "Desde React 19, ref es una prop: el componente la recibe y se la pasa al elemento que quiera. forwardRef es lo que verás en código anterior."
    },
    {
      "mito": "useImperativeHandle sirve para que el padre controle al hijo",
      "realidad": "Sirve para exponer unas pocas acciones imperativas, como enfocar o desplazar. Si es un estado, como abierto o cerrado, va por props."
    },
    {
      "mito": "flushSync hace que React vaya más rápido",
      "realidad": "Hace lo contrario de lo que React hace por defecto: renderizar en el acto y sin agrupar. Sirve para tener el DOM al día en la línea siguiente, y usado de más hace la app más lenta."
    }
  ]
}
```

## Errores típicos

**Usar `querySelector` dentro de un componente.** Funciona mientras haya una sola copia. En este planificador de rutas en bici, el mismo componente se usa para la salida y para la llegada:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function CampoLugar({ titulo }) {\n  function manejarClic() {\n    document.querySelector('input').focus()\n  }\n\n  return (\n    <fieldset>\n      <legend>{titulo}</legend>\n      <input aria-label={titulo} />\n      <button onClick={manejarClic}>Escribir {titulo.toLowerCase()}</button>\n    </fieldset>\n  )\n}\n\nexport default function Ruta() {\n  return (\n    <main>\n      <CampoLugar titulo=\"Salida\" />\n      <CampoLugar titulo=\"Llegada\" />\n    </main>\n  )\n}\n\n// Pulsas «Escribir llegada». ¿Dónde queda el cursor?",
  "opciones": [
    "En el campo Llegada",
    "En el campo Salida",
    "En ninguno: querySelector no funciona con React",
    "Error: hay dos input en la página"
  ],
  "correcta": 1,
  "explicacion": "querySelector recorre todo el documento y devuelve el primer input, que es el de Salida, la primera copia de CampoLugar. Comprobado en la vista previa con React 19.3. Con const campoRef = useRef(null) y ref={campoRef} en el input, cada copia enfocaría el suyo."
}
```

**Leer una ref del DOM durante el render.** La primera vez es `null`, y después, el nodo del render anterior. Las refs del DOM se usan en manejadores (y, desde el módulo 6, en efectos).

**Llamar a `useRef` dentro de un `map`.** Rompe las reglas de los Hooks: en cuanto la lista cambia de tamaño, «Rendered more hooks than during the previous render.». Para listas, una ref de callback y un `Map`.

**Pasar una ref a tu componente y olvidar pasarla al nodo.** `current` se queda en `null` sin ningún aviso. El componente tiene que recibir `ref` y ponerla en el elemento que quiera exponer.

**Una ref de callback sin limpieza.** Lo que guardas no se borra nunca: un `Map` que no encoge, con entradas de fichas que ya no existen. `StrictMode` te lo enseña al cargar; la limpieza tiene que deshacer exactamente lo que hizo la función.

**Usar el nodo cuando quizá ya no está.** Si una condición puede quitarlo, `ref.current?.focus()`.

**Envolver todo en `flushSync` «por si acaso».** Solo cuando la línea siguiente necesita el DOM nuevo. Si lo que necesitas es el valor nuevo, calcúlalo en una constante.

**Cambiar a mano lo que pinta React.** `remove()`, `appendChild`, `textContent =`... sobre nodos de tu JSX acaban, tarde o temprano, en un error como el de la biblioteca.

## Ejercicios

El banco de tiempo del barrio de San Lorenzo, donde los vecinos se intercambian horas de ayuda, tiene un formulario de alta que ya valida los tres campos y enseña los errores. Pero cuando envías con errores, el cursor se queda en el botón: quien navega con teclado o con un lector de pantalla tiene que buscar a mano dónde está el problema. Haz que, al enviar, **el foco vaya al primer campo con error**, en el orden del formulario.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El foco, al primer campo con error",
  "consigna": "Crea una ref para cada campo en Alta y pásasela a su Campo. Haz que Campo acepte ref y la ponga en el input. Al final de manejarEnvio, busca el primer campo con error, en el orden del formulario, y enfócalo. Pruébalo con el teclado: envía vacío y empieza a escribir sin hacer clic.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Campo from './Campo'\nimport './estilos.css'\n\nfunction validar(datos) {\n  const errores = {}\n  if (datos.nombre.trim() === '') errores.nombre = 'Escribe tu nombre.'\n  if (!datos.correo.includes('@')) errores.correo = 'El correo necesita una @.'\n  if (!/^\\d{9}$/.test(datos.telefono)) errores.telefono = 'El teléfono tiene 9 cifras, sin espacios.'\n  return errores\n}\n\nexport default function Alta() {\n  const [datos, setDatos] = useState({ nombre: '', correo: '', telefono: '' })\n  const [errores, setErrores] = useState({})\n  const [completada, setCompletada] = useState(false)\n\n  function manejarCambio(campo, valor) {\n    setDatos({ ...datos, [campo]: valor })\n  }\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const nuevos = validar(datos)\n    setErrores(nuevos)\n    if (Object.keys(nuevos).length === 0) {\n      setCompletada(true)\n      return\n    }\n    // Aquí: lleva el foco al primer campo con error (nombre, correo, teléfono)\n  }\n\n  if (completada) {\n    return <p role=\"status\">Alta completada. Te escribiremos a {datos.correo}.</p>\n  }\n\n  return (\n    <form onSubmit={manejarEnvio} noValidate>\n      <h1>Banco de tiempo de San Lorenzo</h1>\n      <Campo etiqueta=\"Nombre\" nombre=\"nombre\" valor={datos.nombre} error={errores.nombre} onCambiar={manejarCambio} />\n      <Campo etiqueta=\"Correo\" nombre=\"correo\" tipo=\"email\" valor={datos.correo} error={errores.correo} onCambiar={manejarCambio} />\n      <Campo etiqueta=\"Teléfono\" nombre=\"telefono\" tipo=\"tel\" valor={datos.telefono} error={errores.telefono} onCambiar={manejarCambio} />\n      <button type=\"submit\">Darme de alta</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "Campo.jsx",
      "codigo": "// Un campo con su etiqueta y su mensaje de error.\n// Para poder enfocarlo desde fuera, tendrá que aceptar una ref.\nexport default function Campo({ etiqueta, nombre, tipo = 'text', valor, error, onCambiar }) {\n  const idError = nombre + '-error'\n\n  return (\n    <div className=\"campo\">\n      <label htmlFor={nombre}>{etiqueta}</label>\n      <input\n        id={nombre}\n        type={tipo}\n        value={valor}\n        aria-invalid={error ? true : undefined}\n        aria-describedby={error ? idError : undefined}\n        onChange={(e) => onCambiar(nombre, e.target.value)}\n      />\n      {error && (\n        <p id={idError} className=\"error\">\n          {error}\n        </p>\n      )}\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\ninput,\ntextarea {\n  font: inherit;\n  padding: 0.3rem 0.4rem;\n}\n\nform {\n  font-family: system-ui, sans-serif;\n  max-width: 24rem;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\n[aria-invalid='true'] {\n  border: 2px solid #b91c1c;\n}\n\n.error {\n  margin: 0;\n  color: #b91c1c;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al enviar el formulario vacío, aparece el error del nombre",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Darme de alta"
          }
        }
      ],
      "espera": {
        "texto": "Escribe tu nombre."
      }
    },
    {
      "descripcion": "Con todo vacío, el foco va a «Nombre»: lo que escribes después de enviar acaba en ese campo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Darme de alta"
          }
        },
        {
          "teclear": "Lucía"
        }
      ],
      "espera": {
        "etiqueta": "Nombre",
        "valor": "Lucía"
      }
    },
    {
      "descripcion": "Con el nombre escrito, el foco va a «Correo», el primer campo con error",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Lucía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Darme de alta"
          }
        },
        {
          "teclear": "lucia@correo.es"
        }
      ],
      "espera": {
        "etiqueta": "Correo",
        "valor": "lucia@correo.es"
      }
    },
    {
      "descripcion": "Si solo falla el teléfono, el foco va a «Teléfono»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Lucía"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "lucia@correo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Darme de alta"
          }
        },
        {
          "teclear": "600123456"
        }
      ],
      "espera": {
        "etiqueta": "Teléfono",
        "valor": "600123456"
      }
    },
    {
      "descripcion": "Con los tres campos bien, el alta se completa",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Lucía"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "lucia@correo.es"
          }
        },
        {
          "escribir": {
            "etiqueta": "Teléfono",
            "texto": "600123456"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Darme de alta"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Alta completada"
      }
    }
  ]
}
```

Las comprobaciones no pueden ver dónde está el cursor, pero sí lo que pasa al teclear: después de enviar, escriben sin hacer clic en ningún campo y miran dónde ha ido a parar el texto. Es la misma prueba que harías tú con el teclado.

**Retos para seguir practicando** (sin comprobación automática):

1. En el formulario, el foco llega al campo antes de que React pinte su mensaje de error, así que un lector de pantalla puede no leerlo al llegar. Envuelve `setErrores` en `flushSync` para que el error y su `aria-describedby` ya estén en el DOM cuando muevas el foco. La lección 37 explica por qué importa.
2. En la guía de árboles, añade un botón «Siguiente árbol» que vaya pasando de ficha en ficha. ¿Dónde guardas cuál toca: en el estado, en una ref o se puede sacar del mapa?
3. En el refranero, haz que Escape dentro del buscador lo vacíe y devuelva el foco al botón «Buscar un refrán». Necesitarás una segunda ref.
4. Cambia `CampoBusqueda` para que, en vez del input entero, exponga con `useImperativeHandle` solo `enfocar()` y `seleccionarTodo()` (el método `select()` del input). Comprueba en la consola qué ve el padre.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Manipulating the DOM with Refs",
      "descripcion": "La página de react.dev de esta lección: enfocar, desplazar, refs de callback para listas, refs a otros componentes, cuándo se rellenan, flushSync y qué no hacer con el DOM.",
      "url": "https://react.dev/learn/manipulating-the-dom-with-refs",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useImperativeHandle",
      "descripcion": "La referencia del Hook, con un ejemplo que expone métodos propios y el aviso de no usar refs para lo que se puede expresar con props.",
      "url": "https://react.dev/reference/react/useImperativeHandle",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "flushSync",
      "descripcion": "Cuándo obligar a React a aplicar un cambio en el acto, sus pegas y el aviso que sale si lo llamas dentro de un render o un efecto.",
      "url": "https://react.dev/reference/react-dom/flushSync",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Common components: la función ref",
      "descripcion": "Cómo y cuándo llama React a una ref de callback, la limpieza de React 19 y el ciclo extra de StrictMode.",
      "url": "https://react.dev/reference/react-dom/components/common#ref-callback",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Element: scrollIntoView()",
      "descripcion": "Todas las opciones para desplazarte hasta un elemento: behavior, block e inline.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element: getBoundingClientRect()",
      "descripcion": "Qué devuelve exactamente la medida de un elemento y cómo se relaciona con el scroll de la página.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect",
      "etiqueta": "MDN"
    }
  ]
}
```
