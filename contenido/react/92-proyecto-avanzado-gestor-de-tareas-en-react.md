# Proyecto avanzado: gestor de tareas en React

- **Módulo:** Proyectos avanzados
- **Slug:** `proyecto-avanzado-gestor-de-tareas-en-react` (autogenerado del título)
- **Orden:** 920
- **Fuentes:** [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) + [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) + [useReducer](https://react.dev/reference/react/useReducer) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) — ver `contenido/react/TEMARIO.md` #92
- **Repositorio:** [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos) (carpeta `gestor-de-tareas`)
- **Requiere:** El proyecto avanzado 76 de JavaScript (gestor de tareas) y las lecciones 27–29, 43 y 83–84 de React

---

## Qué vas a construir

El gestor de tareas del proyecto avanzado 76 de JavaScript, otra vez: la misma pantalla, el mismo CSS y las mismas funciones. Se añaden tareas, se marcan como hechas, se borran, se filtran entre todas, pendientes y completadas, un contador dice cuántas quedan y todo sobrevive a cerrar la pestaña porque se guarda en `localStorage`.

Lo que cambia es cómo está hecho por dentro:

- **El estado, en un reductor** puro y en dos contextos, como en la lección 29, en lugar de las variables de módulo y el `notificar()` de `estado.js`.
- **Hooks propios** (lección 43) para leerlo: `useTareas()`, `useFiltro()`, `useTareasVisibles()` y `useTareasDispatch()`, que hacen el papel de los `obtener...()` de `estado.js`, y `useGuardadoAutomatico()` para la persistencia.
- **Componentes** en vez de `vista.js`. Desaparece todo el «pintar a mano»: ni `getElementById`, ni `createElement`, ni `textContent = ''`, ni `setAttribute('aria-pressed', ...)`, ni delegación de eventos con `dataset.id`.
- **Tests de verdad**, los primeros de este temario en un proyecto: Vitest y Testing Library (lecciones 83 y 84), escritos como en esas lecciones y ejecutados en tu terminal.

Al terminar tendrás dos versiones de la misma aplicación, y la última parte de la lección las pone lado a lado. **No es una competición de líneas de código** (React no la gana): se trata de ver qué trabajo desaparece, cuál aparece y qué fallo de la versión en JavaScript se arregla sin que hagas nada.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El repositorio",
  "contenido": "github.com/pedroleni/react-proyectos (carpeta gestor-de-tareas). La rama main trae el proyecto de Vite montado, con el HTML, el CSS, App.jsx y la configuración de los tests terminados, los tests de los pasos 1 a 4 ya escritos y los archivos de src con comentarios TODO numerados por pasos. La rama solucion tiene el proyecto completo, con sus 26 tests en verde."
}
```

## Antes de empezar

### Lo que necesitas

- **Node.js 22.12 o superior.** Vite 8 se conforma con la 20.19 (lección 2), pero Vitest 5, el que ejecuta los tests, pide la 22.12. Compruébalo con `node --version`.
- **Tu editor** con su terminal integrada, como en los proyectos avanzados de JavaScript.
- **El código**: `git clone https://github.com/pedroleni/react-proyectos.git`, o el botón verde **Code** → **Download ZIP** en [github.com/pedroleni/react-proyectos](https://github.com/pedroleni/react-proyectos).
- **La versión en JavaScript a mano**: la carpeta `gestor-de-tareas` de `javascript-proyectos` (rama `solucion`). Te conviene tenerla abierta al lado: cada paso dice qué archivo de allí sustituye.

### Del cero al proyecto en marcha

1. **Abre la carpeta `gestor-de-tareas/`** en el editor (la del proyecto, no la del repositorio entero).
2. **Instala las dependencias**: `npm install`. Son React, Vite, Oxlint y las herramientas de los tests, con versiones exactas en `package.json`.
3. **Arranca el servidor de desarrollo**: `npm run dev`, y abre la dirección que imprime la terminal (casi siempre `http://localhost:5173`). Verás el título, el campo, los tres filtros y «No hay tareas todavía.». Escribir y pulsar «Añadir» no hace nada todavía: eso es lo que vas a construir.
4. **Abre otra terminal y ejecuta los tests**: `npm test`. Sale en rojo, y es a propósito:

```text
      Tests  13 failed | 5 passed | 8 todo (26)
```

Los tests de los pasos 1 a 4 ya están escritos y se ponen en verde a medida que completas cada paso. Los 8 marcados como `todo` los escribirás tú en el paso 5. Para que se repitan solos cada vez que guardas, usa `npx vitest` (sin `run`), que se queda vigilando.

5. **El ciclo de trabajo**: busca el `TODO (paso N)` que toca, escríbelo, guarda. Vite actualiza el navegador sin recargar y Vitest vuelve a pasar los tests. Así avanza el marcador:

- Tras el paso 1, quedan 7 en rojo.
- Tras el paso 2, 5.
- Tras el paso 3, 3: los de la persistencia.
- Tras el paso 4, ninguno: 18 en verde y los 8 pendientes.
- En el paso 5 escribes esos 8, uno de ellos te descubre un fallo, lo arreglas y terminas con 26 en verde.

## La arquitectura: de cuatro archivos a un árbol de componentes

La versión en JavaScript tenía cuatro archivos en `src/`, uno por responsabilidad. La de React tiene más, pero cada uno de los de antes tiene un sucesor claro:

```text
src/
├── tareasReducer.js          ← estado.js: el estado y sus cambios
├── TareasContext.js          ← estado.js: los contextos y los hooks para leerlos
├── ProveedorTareas.jsx       ← estado.js + main.js: guarda el estado, lo carga y lo reparte
├── almacenamiento.js         ← almacenamiento.js, casi igual
├── useGuardadoAutomatico.js  ← el suscribir() de main.js que guardaba en cada cambio
├── componentes/              ← vista.js
│   ├── Cabecera.jsx
│   ├── FormularioTarea.jsx
│   ├── Filtros.jsx
│   ├── ListaTareas.jsx
│   └── Tarea.jsx
├── App.jsx                   ← main.js: coloca la interfaz
├── main.jsx                  ← monta App en el div#root
├── estilos.css               ← styles.css, con una regla más
└── *.test.js, *.test.jsx, setup.js   ← los tests (nuevos)
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cada archivo de JavaScript y su sucesor",
  "roles": [
    {
      "etiqueta": "estado.js",
      "rol": "Un reductor puro y dos contextos",
      "descripcion": "Las funciones que cambiaban las variables del módulo pasan a ser casos de tareasReducer. Suscribir y notificar desaparecen: cuando el estado cambia, React avisa a los componentes que lo leen."
    },
    {
      "etiqueta": "almacenamiento.js",
      "rol": "El mismo archivo",
      "descripcion": "No sabía nada del DOM, así que React no le cambia nada. Solo gana una comprobación que encontrará un test. Lo que sí cambia es quién lo llama y cuándo."
    },
    {
      "etiqueta": "vista.js",
      "rol": "Cinco componentes",
      "descripcion": "Lo que renderizar() y crearElementoTarea() construían con createElement se describe con JSX. React decide qué tocar del DOM."
    },
    {
      "etiqueta": "main.js",
      "rol": "App.jsx, main.jsx y un efecto",
      "descripcion": "Los listeners pasan a onChange y onClick en cada elemento; la carga inicial, al inicializador de useReducer; el guardado, a un efecto."
    }
  ]
}
```

Sobre el árbol, el estado vive en `ProveedorTareas` y cada componente pide con un hook lo que necesita:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "El gestor de tareas: quién guarda el estado y quién lo lee",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "sin estado: solo coloca la interfaz"
    },
    {
      "nombre": "ProveedorTareas",
      "nivel": 1,
      "etiqueta": "estado: tareas y filtro",
      "nota": "useReducer + useGuardadoAutomatico"
    },
    {
      "nombre": "Tareas",
      "nivel": 2,
      "etiqueta": "proveedor",
      "nota": "value = { tareas, filtro }"
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
      "nombre": "FormularioTarea",
      "nivel": 4,
      "nota": "← useTareasDispatch()"
    },
    {
      "nombre": "Filtros",
      "nivel": 4,
      "nota": "← useFiltro() y useTareasDispatch()"
    },
    {
      "nombre": "ListaTareas",
      "nivel": 4,
      "nota": "← useTareasVisibles()"
    },
    {
      "nombre": "Tarea",
      "nivel": 5,
      "clave": "id",
      "nota": "← useTareasDispatch(); recibe su tarea por props"
    }
  ]
}
```

### Por qué los contextos y el proveedor van en archivos separados

En la lección 29, el reductor, los contextos, el proveedor y los hooks vivían juntos en `TareasContext.jsx`. Aquí se separan en `TareasContext.js` (contextos y hooks, sin JSX) y `ProveedorTareas.jsx` (el componente), y el motivo es el linter que trae la plantilla de Vite. Con todo en un archivo, `npm run lint` avisa una vez por cada hook exportado:

```text
src/TareasContext.jsx:43:17: warning react(only-export-components): Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components.
```

Es decir: «La recarga rápida solo funciona cuando un archivo exporta solo componentes. Usa otro archivo para compartir constantes o funciones entre componentes». La *recarga rápida* (Fast Refresh) es lo que hace Vite cuando guardas un componente: lo sustituye en la página sin perder su estado. Solo puede hacerlo con archivos que exportan componentes y nada más, y eso es lo que avisa el linter. No es un error, pero es un aviso real, y la solución es la que propone: un archivo para el componente y otro para lo demás.

## Paso 1: el reductor (`src/tareasReducer.js`)

Sustituye a `estado.js`. Las cuatro funciones que cambiaban el estado (`añadirTarea`, `alternarCompletada`, `borrarTarea` y `cambiarFiltro`) pasan a ser cuatro casos de un reductor, con los tipos de acción en participio y sin eñe, como en la lección 27: `'anadida'`, `'alternada'`, `'borrada'` y `'filtro_cambiado'`. Abre el archivo: tiene la firma, el `default` que lanza y un `TODO` en cada caso.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "export const ESTADO_VACIO = { tareas: [], filtro: 'todas' }\n\nexport function tareasReducer(estado, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      const texto = accion.texto.trim()\n      if (texto === '') return estado\n\n      const tarea = { id: accion.id, texto, completada: false, creadaEn: accion.creadaEn }\n      return { ...estado, tareas: [...estado.tareas, tarea] }\n    }\n    case 'alternada': {\n      return {\n        ...estado,\n        tareas: estado.tareas.map((tarea) =>\n          tarea.id === accion.id ? { ...tarea, completada: !tarea.completada } : tarea,\n        ),\n      }\n    }\n    case 'borrada': {\n      return { ...estado, tareas: estado.tareas.filter((tarea) => tarea.id !== accion.id) }\n    }\n    case 'filtro_cambiado': {\n      return { ...estado, filtro: accion.filtro }\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nexport function filtrarTareas(tareas, filtro) {\n  if (filtro === 'pendientes') return tareas.filter((tarea) => !tarea.completada)\n  if (filtro === 'completadas') return tareas.filter((tarea) => tarea.completada)\n  return tareas\n}",
  "anotaciones": [
    {
      "fragmento": "export const ESTADO_VACIO = { tareas: [], filtro: 'todas' }",
      "nota": "El mismo estado que estado.js (el array tareas y filtroActual), pero en un solo objeto. Ya no son variables de módulo: el estado lo guardará React con useReducer."
    },
    {
      "fragmento": "if (texto === '') return estado",
      "nota": "Una tarea vacía no cambia nada, y se dice devolviendo el mismo objeto. React lo compara con Object.is, ve que es el mismo y no vuelve a renderizar (lección 27)."
    },
    {
      "fragmento": "const tarea = { id: accion.id, texto, completada: false, creadaEn: accion.creadaEn }",
      "nota": "En estado.js, añadirTarea generaba el id con crypto.randomUUID() y la fecha con new Date(). Un reductor no puede: tiene que devolver lo mismo con la misma entrada. Los dos valores se calculan en el manejador del formulario y llegan en la acción."
    },
    {
      "fragmento": "return { ...estado, tareas: [...estado.tareas, tarea] }",
      "nota": "estado.js hacía tareas.push(...) y luego notificar(). Aquí no se toca el array de antes: se devuelve otro, con la tarea al final, y el cambio de referencia es el aviso."
    },
    {
      "fragmento": "tarea.id === accion.id ? { ...tarea, completada: !tarea.completada } : tarea,",
      "nota": "La misma idea para alternar: una copia de la tarea con completada al revés, en vez de tarea.completada = !tarea.completada. Las demás tareas se reutilizan tal cual."
    },
    {
      "fragmento": "throw Error('Acción desconocida: ' + accion.type)",
      "nota": "Con un teclado español, despachar 'añadida' en vez de 'anadida' es cuestión de tiempo. Este default convierte la errata en un error que dice exactamente qué ha pasado."
    },
    {
      "fragmento": "export function filtrarTareas(tareas, filtro) {",
      "nota": "Es obtenerTareasVisibles() de estado.js, pero recibe las tareas y el filtro en vez de leerlos de variables de módulo. Una función pura más, que se prueba con una línea."
    }
  ]
}
```

Y estas son las equivalencias con lo que llamaba `main.js`:

- `añadirTarea(texto)` → `dispatch({ type: 'anadida', id, texto, creadaEn })`
- `alternarCompletada(id)` → `dispatch({ type: 'alternada', id })`
- `borrarTarea(id)` → `dispatch({ type: 'borrada', id })`
- `cambiarFiltro(filtro)` → `dispatch({ type: 'filtro_cambiado', filtro })`
- `inicializarEstado(tareas)` → el inicializador de `useReducer` (paso 4)
- `suscribir(fn)` y `notificar()` → nada: es el trabajo de React.

Cuando lo tengas, `npm test` pone en verde los 8 tests de `src/tareasReducer.test.js`. Ninguno monta un componente: llaman al reductor con un estado y una acción y miran lo que devuelve, como el bloque de pruebas de la lección 27, pero con Vitest. Este es el que vigila la inmutabilidad:

```js
it('alterna una tarea sin modificar el estado anterior', () => {
  const estado = tareasReducer(conDos, { type: 'alternada', id: 'a1' })

  expect(estado.tareas[0].completada).toBe(true)
  expect(estado.tareas[1]).toBe(dni)
  // Si el reductor hiciera tarea.completada = !tarea.completada, esta
  // línea fallaría: la tarea del estado anterior habría cambiado.
  expect(pan.completada).toBe(false)
})
```

Si escribes el caso como en `estado.js`, buscando la tarea y cambiándole `completada`, Vitest te lo dice:

```text
 FAIL  src/tareasReducer.test.js > tareasReducer > alterna una tarea sin modificar el estado anterior
AssertionError: expected true to be false // Object.is equality
```

Es decir: esperaba que `pan.completada` siguiera siendo `false` y es `true`. Y no falla solo ese: el test de `filtrarTareas`, que usa el mismo objeto `pan`, también se pone en rojo, porque la mutación ha llegado a los datos de prueba de otro test. Así de lejos llega un objeto modificado en su sitio.

## Paso 2: los contextos y el proveedor (`src/TareasContext.js` y `src/ProveedorTareas.jsx`)

Es la receta de la lección 29: un contexto para el estado, otro para `dispatch`, y hooks que los leen y avisan si falta el proveedor.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createContext, useContext } from 'react'\nimport { filtrarTareas } from './tareasReducer'\n\nexport const TareasContext = createContext(null)\nTareasContext.displayName = 'Tareas'\n\nexport const TareasDispatchContext = createContext(null)\nTareasDispatchContext.displayName = 'TareasDispatch'\n\nfunction useEstadoTareas() {\n  const estado = useContext(TareasContext)\n  if (estado === null) {\n    throw new Error('Los hooks de las tareas tienen que usarse dentro de <ProveedorTareas>')\n  }\n  return estado\n}\n\nexport function useTareas() {\n  return useEstadoTareas().tareas\n}\n\nexport function useFiltro() {\n  return useEstadoTareas().filtro\n}\n\nexport function useTareasVisibles() {\n  const { tareas, filtro } = useEstadoTareas()\n  return filtrarTareas(tareas, filtro)\n}\n\nexport function useTareasDispatch() {\n  const dispatch = useContext(TareasDispatchContext)\n  if (dispatch === null) {\n    throw new Error('useTareasDispatch() tiene que usarse dentro de <ProveedorTareas>')\n  }\n  return dispatch\n}",
  "anotaciones": [
    {
      "fragmento": "export const TareasContext = createContext(null)",
      "nota": "Se exportan porque los necesita ProveedorTareas.jsx, que está en otro archivo. Ningún componente más los importa: todos usan los hooks de abajo."
    },
    {
      "fragmento": "TareasDispatchContext.displayName = 'TareasDispatch'",
      "nota": "Con displayName, las React DevTools llaman a cada proveedor por su nombre (lección 28)."
    },
    {
      "fragmento": "if (estado === null) {",
      "nota": "Sin ProveedorTareas por encima, useContext devuelve el valor por defecto, null. Mejor un error que diga qué falta que un «Cannot read properties of null» en otra línea (lección 29)."
    },
    {
      "fragmento": "export function useTareas() {",
      "nota": "obtenerTodasLasTareas() de estado.js, convertida en Hook. Los tres hooks del estado leen el mismo contexto: cada componente pide lo que usa y no sabe de dónde sale."
    },
    {
      "fragmento": "return filtrarTareas(tareas, filtro)",
      "nota": "obtenerTareasVisibles(). La lista visible no se guarda en ningún sitio: se calcula al renderizar a partir de lo que sí es estado (lección 24)."
    },
    {
      "fragmento": "export function useTareasDispatch() {",
      "nota": "Lo que antes eran las funciones exportadas de estado.js. dispatch es siempre la misma función, y por eso su contexto no cambia nunca (lección 29)."
    }
  ]
}
```

`ProveedorTareas.jsx`, de momento, guarda el estado vacío y lo reparte. En el paso 4 aprenderá a cargarlo y a guardarlo:

```jsx
import { useReducer } from 'react'
import { TareasContext, TareasDispatchContext } from './TareasContext'
import { ESTADO_VACIO, tareasReducer } from './tareasReducer'

export function ProveedorTareas({ children }) {
  const [estado, dispatch] = useReducer(tareasReducer, ESTADO_VACIO)

  return (
    <TareasContext value={estado}>
      <TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>
    </TareasContext>
  )
}
```

Fíjate en lo que no hay: ni un array de suscriptores, ni `suscribir()`, ni `notificar()`. En la versión en JavaScript, cada función de `estado.js` terminaba avisando a mano a quien se hubiera suscrito, y `main.js` tenía que suscribirse **antes** de `inicializarEstado()` para no perderse el primer render. Aquí, cuando `dispatch` produce un estado nuevo, React vuelve a renderizar `ProveedorTareas` y a todos los que leen `TareasContext`. La suscripción es leer el contexto.

Los tests de este paso, en `src/TareasContext.test.jsx`, montan los hooks con `renderHook` dentro del proveedor gracias a la opción `wrapper`, como en la lección 84:

```jsx
it('dentro del proveedor leen el estado, y dispatch lo cambia', () => {
  const { result } = renderHook(() => useTodo(), { wrapper: ProveedorTareas })
  expect(result.current.tareas).toEqual([])
  expect(result.current.filtro).toBe('todas')

  act(() => {
    result.current.dispatch({ type: 'anadida', id: 'a1', texto: 'Comprar pan', creadaEn: '2026-10-20T09:00:00.000Z' })
  })
  act(() => {
    result.current.dispatch({ type: 'filtro_cambiado', filtro: 'completadas' })
  })

  expect(result.current.tareas).toHaveLength(1)
  expect(result.current.filtro).toBe('completadas')
  expect(result.current.visibles).toEqual([])
})
```

`useTodo` es un Hook de mentira, definido en el propio test, que llama a los cuatro y los devuelve juntos. El `dispatch` va dentro de `act` porque se llama desde el test y no desde un evento que Testing Library ya envuelva (lección 84). Otro test del archivo comprueba que, fuera del proveedor, los hooks lanzan el error que escribiste.

## Paso 3: los componentes (`src/componentes/`)

Aquí desaparece `vista.js`. Son cinco componentes pequeños, cada uno con su `TODO`, y el mismo marcado (clases y atributos) que construía la versión en JavaScript: por eso el CSS sirve sin cambios.

### `Tarea`: `crearElementoTarea()` sin `createElement`

Así construía `vista.js` cada tarea:

```js
function crearElementoTarea(tarea) {
  const li = document.createElement('li');
  li.className = 'tarea';
  li.dataset.id = tarea.id;
  if (tarea.completada) li.classList.add('completada');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'tarea-checkbox';
  checkbox.checked = tarea.completada;
  checkbox.setAttribute(
    'aria-label',
    `Marcar "${tarea.texto}" como ${tarea.completada ? 'pendiente' : 'completada'}`,
  );

  const texto = document.createElement('span');
  texto.className = 'tarea-texto';
  texto.textContent = tarea.texto;

  const fecha = document.createElement('time');
  fecha.className = 'tarea-fecha';
  fecha.dateTime = tarea.creadaEn;
  fecha.textContent = formateadorFecha.format(new Date(tarea.creadaEn));

  const borrar = document.createElement('button');
  borrar.type = 'button';
  borrar.className = 'tarea-borrar';
  borrar.textContent = '×';
  borrar.setAttribute('aria-label', `Borrar "${tarea.texto}"`);

  li.append(checkbox, texto, fecha, borrar);
  return li;
}
```

Y así la describe React:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useTareasDispatch } from '../TareasContext'\n\nconst formateadorFecha = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })\n\nexport default function Tarea({ tarea }) {\n  const dispatch = useTareasDispatch()\n\n  return (\n    <li className={tarea.completada ? 'tarea completada' : 'tarea'}>\n      <input\n        type=\"checkbox\"\n        className=\"tarea-checkbox\"\n        checked={tarea.completada}\n        onChange={() => dispatch({ type: 'alternada', id: tarea.id })}\n        aria-label={`Marcar \"${tarea.texto}\" como ${tarea.completada ? 'pendiente' : 'completada'}`}\n      />\n      <span className=\"tarea-texto\">{tarea.texto}</span>\n      <time className=\"tarea-fecha\" dateTime={tarea.creadaEn}>\n        {formateadorFecha.format(new Date(tarea.creadaEn))}\n      </time>\n      <button\n        type=\"button\"\n        className=\"tarea-borrar\"\n        aria-label={`Borrar \"${tarea.texto}\"`}\n        onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n      >\n        ×\n      </button>\n    </li>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<li className={tarea.completada ? 'tarea completada' : 'tarea'}>",
      "nota": "Las cuatro líneas de createElement, className y classList.add se quedan en una: el li y su clase, calculada con la tarea de este render."
    },
    {
      "fragmento": "checked={tarea.completada}",
      "nota": "Una casilla controlada (lección 22): está marcada si la tarea está completada, y nada más. Si el reductor no la cambia, React la devuelve a como estaba."
    },
    {
      "fragmento": "onChange={() => dispatch({ type: 'alternada', id: tarea.id })}",
      "nota": "Adiós a la delegación de main.js, a closest(\".tarea\") y a dataset.id: cada casilla tiene su propio manejador, y el id lo saca de la tarea que recibe por props."
    },
    {
      "fragmento": "aria-label={`Marcar \"${tarea.texto}\" como ${tarea.completada ? 'pendiente' : 'completada'}`}",
      "nota": "La misma etiqueta que ponía setAttribute en vista.js, palabra por palabra. Los tests de Testing Library buscan la casilla por este nombre."
    },
    {
      "fragmento": "{formateadorFecha.format(new Date(tarea.creadaEn))}",
      "nota": "El mismo Intl.DateTimeFormat de vista.js, creado una sola vez fuera del componente: no depende de nada del render."
    }
  ]
}
```

### `Filtros` y `ListaTareas`: el resto de `renderizar()`

`renderizar()` hacía cuatro trabajos cada vez que cambiaba algo: vaciar la lista y reconstruirla, mostrar u ocultar el mensaje de vacío, reescribir el contador y poner `aria-pressed` a cada botón de filtro:

```js
export function renderizar() {
  const visibles = obtenerTareasVisibles();
  const todas = obtenerTodasLasTareas();

  lista.textContent = '';
  for (const tarea of visibles) {
    lista.appendChild(crearElementoTarea(tarea));
  }

  mensajeVacio.hidden = visibles.length > 0;

  const pendientes = todas.filter((tarea) => !tarea.completada).length;
  contador.textContent = `${pendientes} ${pendientes === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;

  const filtroActual = obtenerFiltroActual();
  botonesFiltro.forEach((boton) => {
    boton.setAttribute('aria-pressed', String(boton.dataset.filtro === filtroActual));
  });
}
```

En React, cada trabajo es un componente que describe su trozo. El contador está en `Cabecera`, con la misma frase en singular o plural. La lista y los filtros:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// componentes/ListaTareas.jsx\nimport { useTareasVisibles } from '../TareasContext'\nimport Tarea from './Tarea'\n\nexport default function ListaTareas() {\n  const visibles = useTareasVisibles()\n\n  return (\n    <>\n      <ul className=\"lista-tareas\">\n        {visibles.map((tarea) => (\n          <Tarea key={tarea.id} tarea={tarea} />\n        ))}\n      </ul>\n      {visibles.length === 0 && <p className=\"mensaje-vacio\">No hay tareas todavía.</p>}\n    </>\n  )\n}\n\n// componentes/Filtros.jsx\nimport { useFiltro, useTareasDispatch } from '../TareasContext'\n\nconst FILTROS = [\n  { valor: 'todas', texto: 'Todas' },\n  { valor: 'pendientes', texto: 'Pendientes' },\n  { valor: 'completadas', texto: 'Completadas' },\n]\n\nexport default function Filtros() {\n  const filtro = useFiltro()\n  const dispatch = useTareasDispatch()\n\n  return (\n    <div className=\"filtros\" role=\"group\" aria-label=\"Filtrar tareas\">\n      {FILTROS.map(({ valor, texto }) => (\n        <button\n          key={valor}\n          type=\"button\"\n          className=\"filtro\"\n          aria-pressed={filtro === valor}\n          onClick={() => dispatch({ type: 'filtro_cambiado', filtro: valor })}\n        >\n          {texto}\n        </button>\n      ))}\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const visibles = useTareasVisibles()",
      "nota": "La lista ya filtrada, del Hook del paso 2. ListaTareas no sabe qué filtro hay ni cómo se filtra."
    },
    {
      "fragmento": "<Tarea key={tarea.id} tarea={tarea} />",
      "nota": "El bucle de appendChild, sin vaciar nada antes. La key le dice a React qué li es cuál entre un render y el siguiente (lección 11), y eso tendrá consecuencias enseguida."
    },
    {
      "fragmento": "{visibles.length === 0 && <p className=\"mensaje-vacio\">No hay tareas todavía.</p>}",
      "nota": "mensajeVacio.hidden = visibles.length > 0, al revés: el párrafo existe solo cuando hace falta."
    },
    {
      "fragmento": "aria-pressed={filtro === valor}",
      "nota": "En vista.js, un forEach ponía aria-pressed a cada botón con setAttribute y String(...). Aquí se describe, y React escribe \"true\" o \"false\" en el atributo."
    },
    {
      "fragmento": "onClick={() => dispatch({ type: 'filtro_cambiado', filtro: valor })}",
      "nota": "Cada botón despacha su filtro. Ya no hace falta data-filtro en el HTML para saber cuál se ha pulsado."
    }
  ]
}
```

### `FormularioTarea`: el formulario que estaba en `main.js`

El listener del `submit` de `main.js`, convertido en un componente con su propio estado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useId, useRef, useState } from 'react'\nimport { useTareasDispatch } from '../TareasContext'\n\nexport default function FormularioTarea() {\n  const dispatch = useTareasDispatch()\n  const [texto, setTexto] = useState('')\n  const entradaRef = useRef(null)\n  const idEntrada = useId()\n\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    dispatch({\n      type: 'anadida',\n      id: crypto.randomUUID(),\n      texto,\n      creadaEn: new Date().toISOString(),\n    })\n    setTexto('')\n    entradaRef.current.focus()\n  }\n\n  return (\n    <form className=\"formulario-tarea\" onSubmit={manejarEnvio}>\n      <label htmlFor={idEntrada} className=\"sr-only\">\n        Nueva tarea\n      </label>\n      <input\n        id={idEntrada}\n        ref={entradaRef}\n        type=\"text\"\n        placeholder=\"¿Qué hay que hacer?\"\n        autoComplete=\"off\"\n        required\n        value={texto}\n        onChange={(evento) => setTexto(evento.target.value)}\n      />\n      <button type=\"submit\">Añadir</button>\n    </form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const [texto, setTexto] = useState('')",
      "nota": "Un input controlado (lección 22). Lo que llevas escrito es estado local del formulario: no va al reductor, porque solo le importa a este componente (lección 29)."
    },
    {
      "fragmento": "const idEntrada = useId()",
      "nota": "index.html tenía id=\"entrada-tarea\" escrito a mano. useId da un id único aunque el componente aparezca dos veces (lección 37)."
    },
    {
      "fragmento": "id: crypto.randomUUID(),",
      "nota": "Aquí, y no en el reductor: el manejador se ejecuta una vez por envío y puede hacer lo que quiera. El reductor recibe el id ya hecho."
    },
    {
      "fragmento": "entradaRef.current.focus()",
      "nota": "El entrada.focus() de main.js, con una ref (lección 34). Es una de las tres líneas del proyecto que tocan el DOM; las otras son el evento.target.value del campo y el getElementById de main.jsx."
    },
    {
      "fragmento": "required",
      "nota": "Como en index.html: con el campo vacío, el navegador no deja enviar. Un texto de solo espacios sí pasa, y lo frena el reductor."
    }
  ]
}
```

Con los cinco componentes, `npm run dev` ya es la aplicación: añade, marca, borra y filtra. Recarga la página y lo pierdes todo, porque falta el paso 4. `npm test` deja en rojo solo los tres tests de la persistencia.

### Lo que se nota con el teclado

Antes de seguir, una diferencia que no está en ninguna línea de código. Estos dos bloques tienen tres tareas con sus casillas. El primero es lo esencial de `estado.js`, `vista.js` y `main.js`, sin React:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "La versión en JavaScript: renderizar() reconstruye la lista",
  "consigna": "Haz clic en un hueco vacío de la vista previa, encima de la lista, y pulsa Tab hasta que la casilla de «Renovar el DNI» tenga el borde morado del foco. Pulsa Espacio: se marca. Pulsa Espacio otra vez. ¿Se desmarca? Pulsa Tab: ¿adónde va el foco?",
  "html": "<main>\n  <p id=\"contador\" class=\"contador\"></p>\n  <ul id=\"lista\" class=\"lista\"></ul>\n</main>",
  "css": "main {\n  max-width: 24rem;\n  font-family: system-ui, sans-serif;\n}\n\n.contador {\n  color: #6f6a61;\n}\n\n.lista {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.tarea {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.5rem 0.7rem;\n  border: 1px solid #e2ded6;\n  border-radius: 8px;\n}\n\n.tarea input {\n  width: 1.1rem;\n  height: 1.1rem;\n  accent-color: #7c3aed;\n}\n\n.tarea input:focus-visible {\n  outline: 3px solid #7c3aed;\n  outline-offset: 3px;\n}\n\n.completada span {\n  color: #6f6a61;\n  text-decoration: line-through;\n}",
  "js": "// Lo esencial de estado.js, vista.js y main.js del proyecto 76\nlet tareas = [\n  { id: 'a1', texto: 'Comprar pan', completada: false },\n  { id: 'b2', texto: 'Renovar el DNI', completada: false },\n  { id: 'c3', texto: 'Llamar al fontanero', completada: false },\n]\n\nconst lista = document.getElementById('lista')\nconst contador = document.getElementById('contador')\n\nfunction alternarCompletada(id) {\n  const tarea = tareas.find((t) => t.id === id)\n  tarea.completada = !tarea.completada\n  renderizar()\n}\n\n// vista.js: vaciar la lista y volver a construirla entera\nfunction renderizar() {\n  lista.textContent = ''\n  for (const tarea of tareas) {\n    lista.appendChild(crearElementoTarea(tarea))\n  }\n  const pendientes = tareas.filter((t) => !t.completada).length\n  contador.textContent = pendientes === 1 ? '1 tarea pendiente' : `${pendientes} tareas pendientes`\n}\n\nfunction crearElementoTarea(tarea) {\n  const li = document.createElement('li')\n  li.className = tarea.completada ? 'tarea completada' : 'tarea'\n  li.dataset.id = tarea.id\n\n  const casilla = document.createElement('input')\n  casilla.type = 'checkbox'\n  casilla.checked = tarea.completada\n  casilla.setAttribute(\n    'aria-label',\n    `Marcar \"${tarea.texto}\" como ${tarea.completada ? 'pendiente' : 'completada'}`,\n  )\n\n  const texto = document.createElement('span')\n  texto.textContent = tarea.texto\n\n  li.append(casilla, texto)\n  return li\n}\n\n// main.js: un solo listener en la lista (delegación)\nlista.addEventListener('change', (evento) => {\n  const li = evento.target.closest('li')\n  if (li) alternarCompletada(li.dataset.id)\n})\n\nrenderizar()",
  "pestañaInicial": "js"
}
```

Y este, lo mismo con React, con el panel «Árbol de renders» debajo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La versión en React: la lista se actualiza, no se reconstruye",
  "consigna": "Repite lo mismo: un clic en un hueco de la vista previa, Tab hasta «Renovar el DNI» y Espacio dos veces. Después mira el árbol del último commit: ¿qué componentes se han vuelto a renderizar? ¿Se ha creado algún elemento nuevo en la página?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer } from 'react'\nimport './estilos.css'\n\nconst tareasIniciales = [\n  { id: 'a1', texto: 'Comprar pan', completada: false },\n  { id: 'b2', texto: 'Renovar el DNI', completada: false },\n  { id: 'c3', texto: 'Llamar al fontanero', completada: false },\n]\n\nfunction tareasReducer(tareas, accion) {\n  switch (accion.type) {\n    case 'alternada': {\n      return tareas.map((t) => (t.id === accion.id ? { ...t, completada: !t.completada } : t))\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nfunction Tarea({ tarea, dispatch }) {\n  return (\n    <li className={tarea.completada ? 'tarea completada' : 'tarea'}>\n      <input\n        type=\"checkbox\"\n        checked={tarea.completada}\n        aria-label={`Marcar \"${tarea.texto}\" como ${tarea.completada ? 'pendiente' : 'completada'}`}\n        onChange={() => dispatch({ type: 'alternada', id: tarea.id })}\n      />\n      <span>{tarea.texto}</span>\n    </li>\n  )\n}\n\nexport default function App() {\n  const [tareas, dispatch] = useReducer(tareasReducer, tareasIniciales)\n  const pendientes = tareas.filter((t) => !t.completada).length\n\n  return (\n    <main>\n      <p className=\"contador\">\n        {pendientes === 1 ? '1 tarea pendiente' : `${pendientes} tareas pendientes`}\n      </p>\n      <ul className=\"lista\">\n        {tareas.map((tarea) => (\n          <Tarea key={tarea.id} tarea={tarea} dispatch={dispatch} />\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 24rem;\n  font-family: system-ui, sans-serif;\n}\n\n.contador {\n  color: #6f6a61;\n}\n\n.lista {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.tarea {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.5rem 0.7rem;\n  border: 1px solid #e2ded6;\n  border-radius: 8px;\n}\n\n.tarea input {\n  width: 1.1rem;\n  height: 1.1rem;\n  accent-color: #7c3aed;\n}\n\n.tarea input:focus-visible {\n  outline: 3px solid #7c3aed;\n  outline-offset: 3px;\n}\n\n.completada span {\n  color: #6f6a61;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

En la versión en JavaScript, el primer Espacio marca la casilla y el foco **desaparece**. El segundo no hace nada, y el siguiente Tab (en Chrome) te devuelve a «Comprar pan», al principio de la lista. La casilla que tenía el foco ya no existe: `renderizar()` vació la lista y creó tres `<li>` nuevos (lo comprobamos con un `MutationObserver`: en cada cambio, tres nodos quitados y tres añadidos), y el navegador manda el foco a `body` cuando el elemento enfocado sale de la página. Para quien usa el teclado o un lector de pantalla, cada tarea marcada le devuelve al principio de la lista.

En React, el foco **se queda** en la casilla y el segundo Espacio la desmarca. El árbol dice que se han vuelto a renderizar `App`, porque cambió su estado, y las tres `Tarea`: la de «Renovar el DNI» con «cambió la prop «tarea» (objeto nuevo)» y las otras dos con «se renderizó su padre». Pero renderizar es ejecutar funciones, no reconstruir la página: React ha comparado el resultado con el anterior y ha cambiado atributos y textos de los elementos que ya existían (los recuadros ámbar), sin crear ni quitar ningún `<li>`. Es la diferencia entre volver a renderizar y volver a pintar (lecciones 17 y 66), y la `key` de cada `Tarea` es lo que le dice a React que el `<li>` de «Renovar el DNI» es el mismo de antes.

Arreglar esto en la versión en JavaScript es posible: buscar el `<li>` que cambió y actualizar solo sus atributos, o guardar qué elemento tenía el foco y devolvérselo después de reconstruir. Es exactamente el trabajo que React hace por ti, y el que `vista.js` evitaba a propósito para no desincronizarse del estado.

## Paso 4: la persistencia (`src/useGuardadoAutomatico.js` y `ProveedorTareas.jsx`)

`almacenamiento.js` no cambia: `cargarTareas()` y `guardarTareas()` son las mismas dos funciones, con su `try/catch`. Lo que cambia es **cuándo** se llaman. En `main.js` eran dos líneas: `inicializarEstado(cargarTareas())` al arrancar y una suscripción que llamaba a `guardarTareas()` en cada `notificar()`. En React, cada una tiene su sitio:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// ProveedorTareas.jsx\nimport { useReducer } from 'react'\nimport { cargarTareas } from './almacenamiento'\nimport { TareasContext, TareasDispatchContext } from './TareasContext'\nimport { tareasReducer } from './tareasReducer'\nimport { useGuardadoAutomatico } from './useGuardadoAutomatico'\n\nfunction crearEstadoInicial() {\n  return { tareas: cargarTareas(), filtro: 'todas' }\n}\n\nexport function ProveedorTareas({ children }) {\n  const [estado, dispatch] = useReducer(tareasReducer, null, crearEstadoInicial)\n  useGuardadoAutomatico(estado.tareas)\n\n  return (\n    <TareasContext value={estado}>\n      <TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>\n    </TareasContext>\n  )\n}\n\n// useGuardadoAutomatico.js\nimport { useEffect } from 'react'\nimport { guardarTareas } from './almacenamiento'\n\nexport function useGuardadoAutomatico(tareas) {\n  useEffect(() => {\n    guardarTareas(tareas)\n  }, [tareas])\n}",
  "anotaciones": [
    {
      "fragmento": "return { tareas: cargarTareas(), filtro: 'todas' }",
      "nota": "El inicializarEstado(cargarTareas()) de main.js. Es una función normal, fuera del componente, que lee localStorage y devuelve el estado inicial."
    },
    {
      "fragmento": "useReducer(tareasReducer, null, crearEstadoInicial)",
      "nota": "El tercer argumento de useReducer (lección 27): React llama a crearEstadoInicial(null) al montar el proveedor, y nunca más. Con StrictMode, en desarrollo, la llama dos veces para comprobar que es pura; leer no cambia nada, así que da igual."
    },
    {
      "fragmento": "useGuardadoAutomatico(estado.tareas)",
      "nota": "El Hook propio de la persistencia. ProveedorTareas dice qué quiere (que las tareas se guarden solas) y no cómo se consigue."
    },
    {
      "fragmento": "useEffect(() => {\n    guardarTareas(tareas)\n  }, [tareas])",
      "nota": "Guardar es sincronizar con algo de fuera de React, el trabajo de un efecto (lección 38). Se ejecuta al montar y cada vez que la lista de tareas es otra."
    },
    {
      "fragmento": "[tareas]",
      "nota": "Cambiar el filtro crea un estado nuevo, pero tareas sigue siendo el mismo array: el efecto no se repite. main.js guardaba en cada notificar(), también al cambiar de filtro. Lo comprobamos contando las llamadas a setItem: una en la versión en JavaScript, ninguna en la de React."
    }
  ]
}
```

Tres detalles que conviene tener claros:

- **Por qué un inicializador y no `useReducer(tareasReducer, { tareas: cargarTareas(), filtro: 'todas' })`.** Las dos formas arrancan igual, pero la segunda llama a `cargarTareas()` (leer `localStorage` y hacer `JSON.parse`) **en cada render**, para tirar el resultado: React solo usa el estado inicial la primera vez. Es la regla de las lecciones 16 y 27: si el estado inicial sale de llamar a una función, pásale la función.
- **StrictMode guarda dos veces al montar.** En desarrollo, StrictMode monta, desmonta y vuelve a montar (lección 63), y el efecto se ejecuta dos veces: dos `setItem` con el mismo contenido. No pasa nada porque guardar es idempotente: hacerlo dos veces deja lo mismo que una. Si lo que tuviera que pasar una sola vez fuera, por ejemplo, enviar una petición, ahí sí habría un problema.
- **¿Y `useSyncExternalStore`?** En el Wordle de la lección 47, la partida guardada se leía con `useSyncExternalStore` (lección 46), porque allí la fuente de la verdad era `localStorage`. Aquí no: la fuente de la verdad es el reductor, y `localStorage` es una copia que se escribe cuando cambia. React manda; el almacenamiento obedece. Si quisieras que dos pestañas abiertas se enterasen de los cambios de la otra, el planteamiento cambiaría: es uno de los retos del final.

`npm test` ya está entero en verde, salvo los 8 pendientes. Los nuevos son los de `src/useGuardadoAutomatico.test.js`, con `renderHook` y `rerender` (lección 84), y el de «recuerda las tareas al volver a abrir la aplicación», que desmonta la aplicación y la vuelve a montar.

## Paso 5: tus primeros tests con Testing Library (`src/App.test.jsx`)

La configuración ya está hecha y es la de la lección 83: `vitest.config.js` con `environment: 'jsdom'`, `globals: true` y un archivo de preparación, `src/setup.js`, que aquí hace una cosa más:

```js
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// jsdom conserva localStorage durante todo un archivo de tests: sin esto,
// lo que guarda un test lo encontraría el siguiente al montar la app.
afterEach(() => {
  localStorage.clear()
})
```

En `App.test.jsx` hay cuatro tests escritos, y son los modelos para los tuyos. Montan la aplicación entera, hacen lo que haría una persona y comprueban lo que vería. Ninguno sabe que hay un reductor o un contexto:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function montarApp() {\n  const usuario = userEvent.setup()\n  const { unmount } = render(<App />, { reactStrictMode: true })\n  return { usuario, desmontar: unmount }\n}\n\nasync function anadir(usuario, texto) {\n  await usuario.type(screen.getByLabelText('Nueva tarea'), texto)\n  await usuario.click(screen.getByRole('button', { name: 'Añadir' }))\n}\n\nit('añade una tarea, vacía el campo y le devuelve el foco', async () => {\n  const { usuario } = montarApp()\n\n  await anadir(usuario, 'Comprar pan')\n\n  expect(screen.getByRole('listitem')).toHaveTextContent('Comprar pan')\n  expect(screen.getByText('1 tarea pendiente')).toBeInTheDocument()\n  expect(screen.getByLabelText('Nueva tarea')).toHaveValue('')\n  expect(screen.getByLabelText('Nueva tarea')).toHaveFocus()\n})\n\nit('recuerda las tareas al volver a abrir la aplicación', async () => {\n  const { usuario, desmontar } = montarApp()\n  await anadir(usuario, 'Comprar pan')\n  await usuario.click(screen.getByRole('checkbox', { name: 'Marcar \"Comprar pan\" como completada' }))\n  desmontar()\n\n  montarApp()\n\n  expect(screen.getByRole('checkbox', { name: 'Marcar \"Comprar pan\" como pendiente' })).toBeChecked()\n})",
  "anotaciones": [
    {
      "fragmento": "render(<App />, { reactStrictMode: true })",
      "nota": "La aplicación entera, dentro de StrictMode como en main.jsx (lección 83). Así, una mutación en el reductor también rompería los tests, no solo la aplicación."
    },
    {
      "fragmento": "async function anadir(usuario, texto) {",
      "nota": "Una función de ayuda con los dos pasos que repiten casi todos los tests. Sigue siendo lo que haría una persona: escribir en el campo y pulsar el botón."
    },
    {
      "fragmento": "screen.getByLabelText('Nueva tarea')",
      "nota": "El campo, por su etiqueta, la del label con la clase sr-only: invisible en pantalla, pero no para un lector de pantalla ni para Testing Library."
    },
    {
      "fragmento": "expect(screen.getByLabelText('Nueva tarea')).toHaveFocus()",
      "nota": "El foco también es comportamiento: tras añadir, se puede seguir escribiendo sin tocar el ratón."
    },
    {
      "fragmento": "screen.getByRole('checkbox', { name: 'Marcar \"Comprar pan\" como completada' })",
      "nota": "La casilla, por su rol y su aria-label. Después del clic se llama de otra forma, «como pendiente», y por eso el test la vuelve a buscar con el nombre nuevo."
    },
    {
      "fragmento": "desmontar()\n\n  montarApp()",
      "nota": "Cerrar y volver a abrir: el segundo montaje no comparte nada con el primero salvo localStorage. Si la tarea sigue marcada, se guardó y se cargó."
    }
  ]
}
```

Debajo, ocho `it.todo` con la descripción de lo que tienen que comprobar. Cambia cada `it.todo('...')` por `it('...', async () => { ... })` y escríbelo:

1. **«añade una tarea al pulsar Intro»**: `user-event` entiende `{Enter}` dentro del texto: `usuario.type(campo, 'Renovar el DNI{Enter}')`.
2. **«no añade una tarea que solo tiene espacios»**: comprueba con `queryByRole('listitem')` que no hay ninguna (lección 83: `getBy` no sirve para comprobar una ausencia).
3. **«borra una tarea»**: añade dos, pulsa el botón `Borrar "Comprar pan"` y cuenta con `getAllByRole('listitem')`.
4. **«filtra las pendientes y las completadas, y marca el filtro activo»**: además de lo que se ve, `toHaveAttribute('aria-pressed', 'true')` en el botón pulsado. Y que el contador sigue contando todas las tareas, no las visibles.
5. **«deja el foco en la casilla que acabas de marcar»**: dale el foco con `casilla.focus()`, pulsa Espacio con `usuario.keyboard(' ')` y comprueba `toHaveFocus()`. Es el experimento del paso 3, convertido en test.
6. **«arranca con las tareas que ya había guardadas»**: prepara `localStorage.setItem('gestor-de-tareas:v1', JSON.stringify([...]))` **antes** de montar.
7. **«arranca vacía si lo guardado no es JSON»**: guarda `'esto no es json'`. `cargarTareas()` escribe el error con `console.error`; silencia la consola con `vi.spyOn(console, 'error').mockImplementation(() => {})` y comprueba que se llamó.
8. **«arranca vacía si lo guardado no es una lista»**: guarda `'{}'`, que es JSON válido.

### El fallo que encuentra un test

El octavo falla. No por el test, sino por la aplicación:

```text
 FAIL  src/App.test.jsx > Persistencia > arranca vacía si lo guardado no es una lista
TypeError: tareas.filter is not a function
 ❯ Cabecera src/componentes/Cabecera.jsx:7:29
```

Es decir: `tareas.filter` no es una función. `JSON.parse('{}')` no lanza ningún error, así que el `try/catch` de `cargarTareas()` no lo atrapa, y devuelve un objeto. El reductor lo guarda como `tareas`, y el primer componente que intenta recorrerlo, `Cabecera`, se rompe. En el navegador, la página se quedaría en blanco: no hay ningún error boundary que lo recoja (lección 53).

La versión en JavaScript tenía exactamente el mismo fallo, y ahí no lo descubrió nadie porque no tenía tests. El arreglo es una línea en `cargarTareas()`, el único cambio de `almacenamiento.js` respecto a la versión en JavaScript:

```js
const datos = guardado ? JSON.parse(guardado) : []
return Array.isArray(datos) ? datos : []
```

Con eso, los 26 tests en verde:

```text
 Test Files  4 passed (4)
      Tests  26 passed (26)
```

## Las dos versiones, lado a lado

Con las dos terminadas, se pueden medir. Contando solo líneas de código (sin comentarios ni líneas en blanco):

- **JavaScript**: 4 archivos, 158 líneas. **45 de ellas tocan el DOM**: `getElementById`, `createElement`, `textContent`, `setAttribute`, `addEventListener`, `dataset`, `closest`...
- **React**: 12 archivos, 250 líneas, sin contar los tests. **Tocan el DOM 3**: el `getElementById('root')` de `main.jsx`, y en el formulario el `focus()` y el `evento.target.value` del campo.

React no ha ahorrado líneas: el JSX ocupa más, con un atributo por línea, y hay más archivos. Lo que ha cambiado es **el tipo de trabajo**. En la versión en JavaScript, más de una de cada cuatro líneas decía cómo cambiar la página; en la de React, ese trabajo lo hace React y tu código dice qué debe verse con cada estado.

Por la parte de lo que cambia de verdad:

- **Estado**: variables de módulo que las funciones modifican y luego `notificar()` → un reductor puro que devuelve estados nuevos, dentro de `useReducer`.
- **Avisar de los cambios**: `suscribir(fn)` y el orden correcto en `main.js` → leer un contexto.
- **Pintar**: vaciar la lista y reconstruirla en cada cambio → describir cada trozo; React compara y toca lo justo, y el foco se conserva.
- **Eventos**: un listener en la lista con delegación y `dataset.id` → `onChange` y `onClick` en cada elemento, con la tarea a mano.
- **Persistencia**: guardar en cada `notificar()` → un efecto que guarda cuando cambian las tareas.
- **Probar**: nada → 26 tests que se ejecutan en poco más de un segundo.

Y lo que React añade, que también cuenta:

- **Dependencias y un paso de build.** La versión en JavaScript eran cuatro archivos que el navegador cargaba tal cual: 8 KB, 2,8 KB comprimidos. Esta es la salida de `npm run build` de la de React:

```text
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-Yds26uNg.css    2.63 kB │ gzip:  1.02 kB
dist/assets/index-DyTIbBS3.js   223.62 kB │ gzip: 70.08 kB
```

Casi todo ese JavaScript es React y React DOM. Para una lista de tareas es mucho; en una aplicación de cien pantallas, es lo mismo y se reparte. La lección 85 cuenta cómo se construye y se despliega.

- **Reglas nuevas.** El reductor no puede mutar, ni generar ids, ni leer la hora. Los hooks no se llaman dentro de un `if`. El estado inicial se pasa como función. En la versión en JavaScript no había nada de eso, porque nadie llamaba a tus funciones dos veces para ver si eran puras.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "React vuelve a pintar la lista entera en cada cambio, como renderizar()",
      "realidad": "React vuelve a ejecutar los componentes, pero en el DOM solo cambia lo que es distinto. Lo has visto en el árbol de renders: al marcar una tarea no se crea ningún li. renderizar() sí los destruía y creaba todos, y por eso se perdía el foco."
    },
    {
      "mito": "Con React se escribe menos código",
      "realidad": "En este proyecto, no: 158 líneas en JavaScript frente a 250 en React, sin comentarios ni líneas en blanco. Cambia el tipo de código: de 45 líneas que tocan el DOM a 3."
    },
    {
      "mito": "El reductor es estado.js con otra sintaxis",
      "realidad": "Hace el mismo trabajo con reglas más estrictas: no puede mutar el estado, ni generar ids o fechas, ni avisar a nadie. A cambio se prueba con una llamada, y StrictMode delata cualquier mutación."
    },
    {
      "mito": "Los tests de Testing Library prueban React",
      "realidad": "Prueban lo que ve la persona: roles, etiquetas y textos. Por eso los mismos tests sirven para la versión en JavaScript, cambiando solo cómo se monta. Lo ves justo debajo."
    }
  ]
}
```

### Los mismos tests, contra la versión en JavaScript

Los 12 tests de `App.test.jsx` no importan ningún componente salvo `App`, y solo para montarlo. Cambiando únicamente `montarApp()`, se pueden ejecutar contra la versión en JavaScript: en vez de `render(<App />)`, poner en el documento el HTML de `index.html` y volver a importar `main.js` (como importar es asíncrono, cada llamada pasa a ser `await montarApp()`):

```js
async function montarApp() {
  const usuario = userEvent.setup()
  document.body.innerHTML = cuerpo // el <body> de index.html, sin el <script>
  vi.resetModules()
  await import('./src/main.js')
  return { usuario, desmontar: () => { document.body.innerHTML = '' } }
}
```

Lo hicimos con la rama `solucion` de `javascript-proyectos`. El resultado, recortado:

```text
 ✓ App.test.js > Gestor de tareas > empieza vacío y lo dice
 ✓ App.test.js > Gestor de tareas > añade una tarea, vacía el campo y le devuelve el foco
 ✓ App.test.js > Gestor de tareas > añade una tarea al pulsar Intro
 ✓ App.test.js > Gestor de tareas > no añade una tarea que solo tiene espacios
 ✓ App.test.js > Gestor de tareas > marca una tarea como completada y descuenta el contador
 ✓ App.test.js > Gestor de tareas > borra una tarea
 ✓ App.test.js > Gestor de tareas > filtra las pendientes y las completadas, y marca el filtro activo
 × App.test.js > Gestor de tareas > deja el foco en la casilla que acabas de marcar
   → expect(element).toHaveFocus()
 ✓ App.test.js > Persistencia > recuerda las tareas al volver a abrir la aplicación
 ✓ App.test.js > Persistencia > arranca con las tareas que ya había guardadas
 ✓ App.test.js > Persistencia > arranca vacía si lo guardado no es JSON
 × App.test.js > Persistencia > arranca vacía si lo guardado no es una lista
   → visibles is not iterable

      Tests  2 failed | 10 passed (12)
```

Diez de doce: las dos versiones hacen lo mismo. Los dos fallos son los dos hallazgos de esta lección. El del foco es la reconstrucción de la lista, y el mensaje de error de jsdom confirma lo que viste en el bloque del paso 3: el foco está en `body`. El de `'{}'` es el `JSON.parse` que también estaba en la versión en JavaScript, donde salta en el `for...of` de `renderizar()`. **Un buen test de Testing Library no sabe si hay React debajo**, y por eso sobrevive a una reescritura entera (lección 83).

### Lo que no se traduce solo: el `div` de React y el CSS

Al llevar `styles.css` tal cual al proyecto de React apareció un fallo que no estaba en ningún archivo de JavaScript.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "El síntoma: una lista que cambia de ancho",
  "contenido": "Vacía, la aplicación medía unos 310 píxeles de ancho; al añadir una tarea con un texto largo, se ensanchaba a 450. En la versión en JavaScript, con el mismo CSS, medía siempre 480."
}
```

El CSS centra la aplicación con `body { display: flex; justify-content: center }` y le da a `.app` un `width: 100%` con `max-width: 480px`. En la versión en JavaScript, `<main class="app">` era hijo directo de `body`: el elemento flexible, al que se le aplicaba ese ancho. Con React, entre `body` y `main` está el `<div id="root">` donde se monta la aplicación (lección 3). Ese `div` es ahora el elemento flexible, y como no tiene ningún ancho, mide lo que mida su contenido; el `width: 100%` de `.app` es el 100 % de algo que se estira y se encoge con el texto de las tareas.

El arreglo, en `estilos.css`, es darle el ancho al elemento que ocupa ese sitio:

```css
#root {
  width: 100%;
  max-width: 480px;
}
```

La lección: un CSS escrito para una estructura de HTML concreta da por hecho quién es hijo de quién, y React añade al menos un elemento, el contenedor de la raíz. Al migrar, revisa los selectores que dependen de la estructura: `body > main`, los `display: flex` del `body`, los `:first-child`.

## Errores típicos

**Traer `estado.js` al reductor tal cual.** Es la tentación al migrar: copiar el cuerpo de `añadirTarea` y `alternarCompletada` en cada `case` y, como React necesita un objeto nuevo para enterarse, devolver `{ ...estado }` al final. Antes de probarlo, predice:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// tareasReducer.js: alternarCompletada de estado.js, copiada al reductor\ncase 'alternada': {\n  const tarea = estado.tareas.find((t) => t.id === accion.id)\n  tarea.completada = !tarea.completada\n  return { ...estado }\n}\n\n// main.jsx monta <App /> dentro de <StrictMode>.\n// En la lista está «Renovar el DNI», pendiente, y el contador\n// dice «2 tareas pendientes». Marcas su casilla. ¿Qué ves?",
  "opciones": [
    "La casilla se marca y el contador baja a «1 tarea pendiente»",
    "Nada: la casilla sigue sin marcar y el contador sigue en 2",
    "La casilla se marca, pero el contador sigue en 2",
    "React lanza un error por modificar el estado"
  ],
  "correcta": 1,
  "explicacion": "En desarrollo, StrictMode llama dos veces al reductor con el mismo estado (lección 27). Las dos llamadas encuentran el mismo objeto tarea: la primera pone completada a true y la segunda la devuelve a false. React recibe un objeto nuevo y vuelve a renderizar, pero con la tarea igual que estaba, y la casilla controlada se queda sin marcar. Sin StrictMode funcionaría, y el fallo seguiría ahí, escondido."
}
```

Al añadir pasa algo parecido: `push` se ejecuta dos veces sobre el mismo array y la tarea sale repetida. Compruébalo y arréglalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "estado.js, traducido al reductor tal cual",
  "consigna": "Marca «Renovar el DNI» y añade «Comprar pan»: verás los dos fallos. Arregla tareasReducer.jsx sin modificar nada de lo que recibe, como en el paso 1. Y saca crypto.randomUUID() y new Date() del reductor: que el manejador de App.jsx los calcule y los mande en la acción.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReducer, useState } from 'react'\nimport { tareasReducer, estadoInicial } from './tareasReducer'\nimport './estilos.css'\n\nexport default function App() {\n  const [estado, dispatch] = useReducer(tareasReducer, estadoInicial)\n  const [texto, setTexto] = useState('')\n  const pendientes = estado.tareas.filter((t) => !t.completada).length\n\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    dispatch({ type: 'anadida', texto })\n    setTexto('')\n  }\n\n  return (\n    <main className=\"app\">\n      <header>\n        <h1>Gestor de tareas</h1>\n        <p>{pendientes === 1 ? '1 tarea pendiente' : `${pendientes} tareas pendientes`}</p>\n      </header>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nueva tarea\n          <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n        </label>\n        <button>Añadir</button>\n      </form>\n      <ul>\n        {estado.tareas.map((tarea) => (\n          <li key={tarea.id} className={tarea.completada ? 'completada' : ''}>\n            <input\n              type=\"checkbox\"\n              checked={tarea.completada}\n              aria-label={`Marcar \"${tarea.texto}\" como ${tarea.completada ? 'pendiente' : 'completada'}`}\n              onChange={() => dispatch({ type: 'alternada', id: tarea.id })}\n            />\n            <span>{tarea.texto}</span>\n            <button\n              aria-label={`Borrar \"${tarea.texto}\"`}\n              onClick={() => dispatch({ type: 'borrada', id: tarea.id })}\n            >\n              ×\n            </button>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "tareasReducer.jsx",
      "codigo": "// Las funciones de estado.js, metidas en un reductor casi tal cual.\n// Solo se ha cambiado lo justo: cada caso devuelve un objeto nuevo.\nexport function tareasReducer(estado, accion) {\n  switch (accion.type) {\n    case 'anadida': {\n      const textoLimpio = accion.texto.trim()\n      if (!textoLimpio) return estado\n      estado.tareas.push({\n        id: crypto.randomUUID(),\n        texto: textoLimpio,\n        completada: false,\n        creadaEn: new Date().toISOString(),\n      })\n      return { ...estado }\n    }\n    case 'alternada': {\n      const tarea = estado.tareas.find((t) => t.id === accion.id)\n      if (!tarea) return estado\n      tarea.completada = !tarea.completada\n      return { ...estado }\n    }\n    case 'borrada': {\n      return { ...estado, tareas: estado.tareas.filter((t) => t.id !== accion.id) }\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nexport const estadoInicial = {\n  tareas: [\n    { id: 'a1', texto: 'Renovar el DNI', completada: false, creadaEn: '2026-10-20T09:00:00.000Z' },\n    { id: 'b2', texto: 'Llamar al fontanero', completada: true, creadaEn: '2026-10-20T09:05:00.000Z' },\n    { id: 'c3', texto: 'Devolver los libros', completada: false, creadaEn: '2026-10-21T18:30:00.000Z' },\n  ],\n  filtro: 'todas',\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".app {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nheader {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nheader p {\n  margin: 0;\n  color: #6f6a61;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  flex: 1;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.45rem 0.6rem;\n  border: 1px solid #e2ded6;\n  border-radius: 8px;\n}\n\nli span {\n  flex: 1;\n}\n\nli button {\n  border: none;\n  background: none;\n  font-size: 1.1rem;\n  cursor: pointer;\n}\n\n.completada span {\n  color: #6f6a61;\n  text-decoration: line-through;\n}\n"
    }
  ],
  "archivoInicial": "tareasReducer.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al añadir «Comprar pan», el contador pasa a «3 tareas pendientes»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nueva tarea",
            "texto": "Comprar pan"
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
        "texto": "3 tareas pendientes"
      }
    },
    {
      "descripcion": "Al marcar «Renovar el DNI», el contador baja a «1 tarea pendiente»",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Marcar \"Renovar el DNI\" como completada"
          }
        }
      ],
      "espera": {
        "texto": "1 tarea pendiente"
      }
    },
    {
      "descripcion": "Al marcar «Renovar el DNI», su casilla pasa a llamarse «Marcar \"Renovar el DNI\" como pendiente»",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Marcar \"Renovar el DNI\" como completada"
          }
        }
      ],
      "espera": {
        "rol": "checkbox",
        "nombre": "Marcar \"Renovar el DNI\" como pendiente"
      }
    },
    {
      "descripcion": "Al desmarcar «Llamar al fontanero», que estaba hecha, el contador sube a «3 tareas pendientes»",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Marcar \"Llamar al fontanero\" como pendiente"
          }
        }
      ],
      "espera": {
        "texto": "3 tareas pendientes"
      }
    },
    {
      "descripcion": "Al borrar «Devolver los libros», el contador baja a «1 tarea pendiente»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Borrar \"Devolver los libros\""
          }
        }
      ],
      "espera": {
        "texto": "1 tarea pendiente"
      }
    }
  ]
}
```

Si quitas el `<StrictMode>` de `main.jsx` en tu proyecto, los dos fallos desaparecen: la casilla se marca y la tarea sale una vez. No es que el código esté bien: StrictMode llama dos veces al reductor precisamente para que una mutación no pase desapercibida (lección 63). Por eso `main.jsx` lo deja puesto, y por eso `montarApp()` monta los tests con `reactStrictMode: true`.

**Generar el id o la fecha dentro del reductor.** Con el reductor ya inmutable, `id: crypto.randomUUID()` dentro del `case` parece funcionar: StrictMode lo llama dos veces, salen dos ids distintos y React se queda con uno de los dos resultados. El problema es otro: un reductor que devuelve algo distinto con la misma entrada no se puede probar. El primer test de `tareasReducer.test.js` compara la tarea entera, id y fecha incluidos, y solo puede hacerlo porque llegan en la acción.

**Cargar lo guardado en un efecto.** Parece lo natural: un estado inicial vacío y, al montar, un efecto que lee `localStorage` y despacha una acción `'cargadas'`. En esta vista previa, `sesionAnterior.jsx` deja dos tareas en `localStorage` antes de montar, como si las hubieras guardado ayer:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las tareas de ayer, cargadas con un efecto",
  "consigna": "La vista previa arranca vacía aunque había dos tareas guardadas. Arregla ProveedorTareas.jsx como en el paso 4: que el estado inicial salga de cargarTareas() con el tercer argumento de useReducer. Quita el efecto y la acción cargadas, que ya no hacen falta.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './sesionAnterior'\nimport { ProveedorTareas, useTareas, useTareasDispatch } from './ProveedorTareas'\nimport './estilos.css'\n\nfunction Cabecera() {\n  const tareas = useTareas()\n  const pendientes = tareas.filter((t) => !t.completada).length\n  return (\n    <header>\n      <h1>Gestor de tareas</h1>\n      <p>{pendientes === 1 ? '1 tarea pendiente' : `${pendientes} tareas pendientes`}</p>\n    </header>\n  )\n}\n\nfunction FormularioTarea() {\n  const dispatch = useTareasDispatch()\n  const [texto, setTexto] = useState('')\n\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    dispatch({ type: 'anadida', id: crypto.randomUUID(), texto, creadaEn: new Date().toISOString() })\n    setTexto('')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nueva tarea\n        <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <button>Añadir</button>\n    </form>\n  )\n}\n\nfunction ListaTareas() {\n  const tareas = useTareas()\n  if (tareas.length === 0) return <p className=\"vacia\">No hay tareas todavía.</p>\n  return (\n    <ul>\n      {tareas.map((tarea) => (\n        <li key={tarea.id} className={tarea.completada ? 'completada' : ''}>\n          {tarea.texto}\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <ProveedorTareas>\n      <main className=\"app\">\n        <Cabecera />\n        <FormularioTarea />\n        <ListaTareas />\n      </main>\n    </ProveedorTareas>\n  )\n}\n"
    },
    {
      "nombre": "ProveedorTareas.jsx",
      "codigo": "import { createContext, useContext, useEffect, useReducer } from 'react'\nimport { cargarTareas, useGuardadoAutomatico } from './almacenamiento'\n\nconst TareasContext = createContext(null)\nconst TareasDispatchContext = createContext(null)\n\nfunction tareasReducer(estado, accion) {\n  switch (accion.type) {\n    case 'cargadas': {\n      return { ...estado, tareas: accion.tareas }\n    }\n    case 'anadida': {\n      const texto = accion.texto.trim()\n      if (texto === '') return estado\n      const tarea = { id: accion.id, texto, completada: false, creadaEn: accion.creadaEn }\n      return { ...estado, tareas: [...estado.tareas, tarea] }\n    }\n    default: {\n      throw Error('Acción desconocida: ' + accion.type)\n    }\n  }\n}\n\nexport function ProveedorTareas({ children }) {\n  const [estado, dispatch] = useReducer(tareasReducer, { tareas: [], filtro: 'todas' })\n  useGuardadoAutomatico(estado.tareas)\n\n  // Cargar lo guardado al montar, con un efecto\n  useEffect(() => {\n    dispatch({ type: 'cargadas', tareas: cargarTareas() })\n  }, [])\n\n  return (\n    <TareasContext value={estado}>\n      <TareasDispatchContext value={dispatch}>{children}</TareasDispatchContext>\n    </TareasContext>\n  )\n}\n\nexport function useTareas() {\n  return useContext(TareasContext).tareas\n}\n\nexport function useTareasDispatch() {\n  return useContext(TareasDispatchContext)\n}\n"
    },
    {
      "nombre": "almacenamiento.jsx",
      "codigo": "import { useEffect } from 'react'\n\nconst CLAVE = 'gestor-de-tareas:v1'\n\nexport function cargarTareas() {\n  try {\n    const datos = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')\n    return Array.isArray(datos) ? datos : []\n  } catch {\n    return []\n  }\n}\n\nexport function guardarTareas(tareas) {\n  localStorage.setItem(CLAVE, JSON.stringify(tareas))\n}\n\nexport function useGuardadoAutomatico(tareas) {\n  useEffect(() => {\n    guardarTareas(tareas)\n  }, [tareas])\n}\n"
    },
    {
      "nombre": "sesionAnterior.jsx",
      "codigo": "// Simula lo que dejaste guardado ayer: en tu proyecto, esto ya estaría en\n// localStorage al abrir la página. Aquí se escribe cada vez que la vista\n// previa arranca, porque su localStorage vive en memoria.\nlocalStorage.setItem(\n  'gestor-de-tareas:v1',\n  JSON.stringify([\n    { id: 'a1', texto: 'Devolver los libros', completada: false, creadaEn: '2026-10-21T18:30:00.000Z' },\n    { id: 'b2', texto: 'Renovar el DNI', completada: false, creadaEn: '2026-10-21T19:00:00.000Z' },\n  ]),\n)\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".app {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nheader {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\nheader p,\n.vacia {\n  margin: 0;\n  color: #6f6a61;\n}\n\nform {\n  display: flex;\n  align-items: end;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  flex: 1;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.4rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.45rem 0.6rem;\n  border: 1px solid #e2ded6;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "ProveedorTareas.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparece «Devolver los libros», que estaba guardada",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Devolver los libros"
      }
    },
    {
      "descripcion": "Al abrir, el contador dice «2 tareas pendientes»",
      "pasos": [],
      "espera": {
        "texto": "2 tareas pendientes"
      }
    },
    {
      "descripcion": "Al añadir «Comprar pan», el contador pasa a «3 tareas pendientes»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nueva tarea",
            "texto": "Comprar pan"
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
        "texto": "3 tareas pendientes"
      }
    }
  ]
}
```

Los efectos se ejecutan en el orden en que aparecen. `useGuardadoAutomatico` va primero, así que al montar guarda la lista que hay en ese momento, la vacía, **encima** de lo que había en `localStorage`; después, el efecto de carga lee esa lista vacía. Las tareas de ayer se han perdido antes de que nadie las leyera.

¿Y al revés, con el efecto de carga primero? Lo probamos: sin StrictMode funciona, porque la carga lee antes de que nadie escriba. Con StrictMode, no. En la primera pasada, la carga lee las dos tareas y el guardado escribe la lista vacía; en la repetición, la carga lee esa lista vacía y la despacha también, y gana la última. Es un fallo latente que StrictMode saca a la luz: cualquier cosa que vuelva a montar el proveedor tendría el mismo problema. Con el inicializador no hay ningún momento en el que el estado esté vacío sin haberse cargado, y no depende del orden.

**Guardar en `localStorage` desde el reductor.** «Es donde cambia el estado», pero el reductor se ejecuta durante el render, StrictMode lo llama dos veces y React puede repetirlo cuando quiera (lección 27). Además, dejaría de poder probarse sin un `localStorage` de por medio. Guardar es sincronizar con algo de fuera: un efecto.

**No vaciar `localStorage` entre tests.** Si quitas el `afterEach` de `src/setup.js`, siete tests se ponen en rojo, empezando por este:

```text
 FAIL  src/App.test.jsx > Gestor de tareas > añade una tarea al pulsar Intro
TestingLibraryElementError: Found multiple elements with the role "listitem"
```

Es decir: hay varios elementos con el rol `listitem` donde el test esperaba uno. El test anterior dejó «Comprar pan» guardada y la aplicación, al montarse, la cargó. jsdom conserva lo guardado de un test a otro dentro del mismo archivo, y cada test tiene que empezar de cero. El síntoma típico es un test que pasa solo y falla cuando se ejecutan todos.

## Antes de darlo por terminado

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿npm test pasa entero?",
      "texto": "26 tests en verde: los 18 que venían escritos y los 8 tuyos. Si alguno pasa solo y falla con los demás, sospecha de localStorage y mira que src/setup.js lo vacíe después de cada test."
    },
    {
      "titulo": "¿npm run lint no marca nada?",
      "texto": "Oxlint vigila las reglas de los Hooks y la recarga rápida de Vite. Si avisa de only-export-components, tienes un componente y otras funciones exportados desde el mismo archivo."
    },
    {
      "titulo": "¿npm run build y npm run preview funcionan?",
      "texto": "Pruébalo también construido: en producción no hay StrictMode ni avisos de desarrollo, y es lo que vería quien usara la aplicación (lección 85)."
    },
    {
      "titulo": "¿Sobrevive a cerrar y abrir la pestaña?",
      "texto": "Añade tareas, marca alguna, cierra la pestaña y vuelve a abrir la dirección. En las DevTools, pestaña Application, verás la clave gestor-de-tareas:v1 con el array."
    },
    {
      "titulo": "¿Y a un localStorage estropeado?",
      "texto": "En la consola de las DevTools escribe localStorage.setItem('gestor-de-tareas:v1', 'esto no es json') y recarga; después prueba con '{}'. En los dos casos la aplicación tiene que arrancar vacía, no romperse."
    },
    {
      "titulo": "¿Se puede usar solo con el teclado?",
      "texto": "Tab hasta una casilla y Espacio para marcarla: el foco tiene que seguir en ella. Tab hasta el botón de borrar y Enter. Es lo que la versión en JavaScript no conseguía."
    }
  ]
}
```

## Retos para ampliarlo

Sin comprobación automática, pero con tests: cada reto se termina cuando su test está en verde.

1. **Un botón «Borrar completadas»**, como el reto de la versión en JavaScript. Empieza por el test: un caso nuevo en `tareasReducer.test.js` para la acción `'completadas_borradas'`. Después el `case`, el botón (¿en qué componente, y qué hook necesita para desactivarse cuando no hay ninguna completada?) y un test de Testing Library que lo pulse.
2. **Edición en línea con doble clic.** Al hacer doble clic en el texto de una tarea, se convierte en un campo; Intro guarda con una acción `'editada'` y Escape cancela. Lo que llevas escrito mientras editas, ¿va al reductor o a un `useState` de `Tarea`? (lección 75). Pruébalo con `usuario.dblClick` y `usuario.keyboard('{Escape}')`.
3. **Dos pestañas sincronizadas.** Abre la aplicación en dos pestañas: lo que añades en una no aparece en la otra hasta recargar. El evento `storage` avisa a las demás pestañas cuando una escribe (lección 46). Escúchalo en un efecto de `ProveedorTareas` y despacha una acción con lo que haya ahora en `localStorage`. Comprueba con las dos pestañas abiertas que no entran en un bucle de avisos.
4. **El proyecto en TypeScript.** Renombra a `.tsx` y `.ts` y tipa la tarea, el estado y las acciones como una unión (lección 73). Vuelve a escribir `'añadida'` en un `dispatch`: ¿qué dice TypeScript antes de ejecutar nada?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "titulo": "Repositorio y referencias",
  "recursos": [
    {
      "titulo": "react-proyectos/gestor-de-tareas (rama main, punto de partida)",
      "descripcion": "El proyecto con los TODO de cada paso y los tests de los pasos 1 a 4 ya escritos.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/main/gestor-de-tareas",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-proyectos/gestor-de-tareas (rama solucion)",
      "descripcion": "El proyecto completo, con sus 26 tests, para comparar si te atascas.",
      "url": "https://github.com/pedroleni/react-proyectos/tree/solucion/gestor-de-tareas",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "javascript-proyectos/gestor-de-tareas (rama solucion)",
      "descripcion": "La versión en JavaScript del proyecto 76, para tenerla abierta al lado mientras haces esta.",
      "url": "https://github.com/pedroleni/javascript-proyectos/tree/solucion/gestor-de-tareas",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Scaling Up with Reducer and Context",
      "descripcion": "La receta de reducer y contexto en la que se basa la arquitectura: dos contextos, un proveedor y los hooks para leerlos.",
      "url": "https://react.dev/learn/scaling-up-with-reducer-and-context",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useReducer: Avoiding recreating the initial state",
      "descripcion": "Por qué el estado inicial que sale de una función se pasa como tercer argumento, y qué pasa si no.",
      "url": "https://react.dev/reference/react/useReducer#avoiding-recreating-the-initial-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Reusing Logic with Custom Hooks",
      "descripcion": "Cómo y cuándo sacar un Hook propio, como useGuardadoAutomatico o useTareas.",
      "url": "https://react.dev/learn/reusing-logic-with-custom-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Testing Library: Introduction",
      "descripcion": "La idea guía de la librería: que los tests se parezcan a cómo se usa la aplicación. Es lo que permite pasarlos también a la versión en JavaScript.",
      "url": "https://testing-library.com/docs/react-testing-library/intro/",
      "etiqueta": "Testing Library"
    }
  ]
}
```
