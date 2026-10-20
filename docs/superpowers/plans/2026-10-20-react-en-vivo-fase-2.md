# React en vivo, fase 2 (árbol de renders y árbol estático) — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que `react-en-vivo` y `react-anotado` puedan enseñar, debajo de la vista previa, qué componentes se renderizan en cada commit y por qué, con los cambios reales en el DOM; y un bloque estático `arbol-de-componentes` con el mismo dibujo.

**Architecture:** dentro del iframe, un `runtime/arbol.js` (texto `?raw`, como el puente y el montaje) recorre el árbol de fibers en cada `onCommitFiberRoot` del hook que ya instala el puente, observa el DOM con un `MutationObserver` y envía un mensaje `arbol` validado con Zod en la página. En la página, `ArbolVisual` dibuja nodos por nivel; `ArbolDeRenders` lo usa en vivo y `ArbolDeComponentes` como bloque estático.

**Tech Stack:** React 19.3.1 del sandbox (`public/vendor/react-en-vivo/19.3.1/react.js`), Zod, Vitest + Testing Library + jsdom, Tailwind.

**Spec:** `specs/features/react-en-vivo.md`, sección «Alcance de la fase 2» (es la fuente de verdad; léela entera, con su tabla de validación y los hechos de los internos de React).

## Global Constraints

- Los nodos, estados y motivos son exactamente los de la spec: estados `montado` | `renderizado` | `sin-cambios` | `desmontado`; marcas `memo` | `proveedor` | `suspense`; motivos `estado` (con `indice` desde 1), `prop` (con `detalle?` `funcion-nueva` | `objeto-nuevo` | `array-nuevo`), `contexto`, `padre`.
- Límites del mensaje `arbol`: ≤ 200 nodos; `nivel` 0–40; `nombre` ≤ 60; `clave` ≤ 40; ≤ 6 motivos; ≤ 12 props (`nombre` ≤ 40, `valor` ≤ 80); ≤ 12 estados (`valor` ≤ 80).
- `arbol.js` nunca rompe la app del alumno: cualquier excepción dentro del recorrido se traga (la vista previa sigue y el mensaje `commit` se envía igual).
- `arbol.js` solo va en el documento de la vista previa visible: nunca en el de las comprobaciones (`conPruebas`).
- Todo lo que llega del iframe se pinta como texto. Nada de `dangerouslySetInnerHTML`.
- Textos de la interfaz en español, exactamente los de este plan.
- Antes de cerrar cada tarea: `npm run test`, `npm run lint` y `npm run build` en verde (la CI no los ejecuta).

## Review Focus

1. Subárbol saltado (`siguiente.child === previo.child`): sus nodos tienen que salir `sin-cambios` aunque sus fibers conserven el flag `PerformedWork` de un render antiguo.
2. `desmontado` se emite una sola vez (en el commit en que desaparece) y nunca vuelve a salir.
3. Contextos repetidos en `dependencies` con `StrictMode`: un solo motivo por contexto.
4. Valores imposibles de serializar (ciclos, `Symbol`, getters que lanzan, elementos de React anidados): el recorrido no lanza y el valor sale como texto acotado.
5. Un bloque con `mostrarArbol` cuyo código tiene un error de render: el panel no se queda con un árbol viejo engañoso tras reconstruir.

---

### Task 1: el árbol dentro del iframe y el mensaje `arbol`

**Files:**
- Create: `src/lib/react-en-vivo/runtime/arbol.js`
- Modify: `src/lib/react-en-vivo/runtime/puente.js` (pasar la raíz y el número de commit a `window.__arbolReactEnVivo`)
- Modify: `src/lib/react-en-vivo/documento.ts`, `src/lib/react-en-vivo/preparar.ts` (opción `conArbol`)
- Modify: `src/lib/react-en-vivo/mensajes.ts` (mensaje `arbol`)
- Test: `src/lib/react-en-vivo/arbol.test.ts` (nuevo), `src/lib/react-en-vivo/mensajes.test.ts`, `src/lib/react-en-vivo/documento.test.ts`, `src/lib/react-en-vivo/runtime.test.ts`

**Interfaces:**
- Produces (iframe): `window.__arbolReactEnVivo(raiz: FiberRoot, commit: number): void`, que envía con `window.__enviarReactEnVivo` (leído en cada llamada, no al cargar) el mensaje `{ tipo: 'arbol', commit, nodos, truncado, cambiosDom }`.
- Produces (`mensajes.ts`): tipos exportados `MotivoRender`, `NodoArbolRender`, `MensajeArbol` (variante `tipo: 'arbol'` de `MensajeReactEnVivo`).
- Produces (`documento.ts`/`preparar.ts`): opción `conArbol: boolean` en `OpcionesDocumentoReact` y en las opciones de `prepararDocumento`. El script de `arbol.js` va en el `<body>` justo después de `<div id="root"></div>` y antes de la configuración y el montaje, solo si `conArbol && !conPruebas`.
- Consumes: el hook de DevTools de `puente.js` (ya existe) y el `react.js` 19.3.1 del sandbox.

- [ ] **Step 1: Write the failing tests**

En `arbol.test.ts`, con el `react.js` del sandbox de verdad: ejecutar `puente.js` (`?raw` + `new Function`), sustituir `window.__enviarReactEnVivo` por un `vi.fn()`, cargar `public/vendor/react-en-vivo/19.3.1/react.js` con `readFileSync` + `new Function`, crear `#root`, ejecutar `arbol.js`, y montar con `montaje.js` (`StrictMode: true`) el código de la validación de la spec, transformado con `transformarArchivos`:

```jsx
// App.jsx
import { createContext, memo, useContext, useState } from 'react'
export const Tema = createContext('claro')
Tema.displayName = 'Tema'
function Cabecera() { return <h1>Tareas</h1> }
function Tarea({ texto }) { return <li>{texto}</li> }
const Pie = memo(function Pie() { return <footer>pie</footer> })
function Etiqueta() { return <span>{useContext(Tema)}</span> }
function Contador() {
  const [n, setN] = useState(0)
  return <p>Contador: {n} <button onClick={() => setN(n + 1)}>Sumar</button></p>
}
export default function App() {
  const [tareas, setTareas] = useState(['a', 'b'])
  const [tema, setTema] = useState('claro')
  return (
    <Tema value={tema}>
      <Cabecera />
      <ul>{tareas.map((t) => <Tarea key={t} texto={t} alPulsar={() => {}} />)}</ul>
      <Contador />
      <Pie />
      <Etiqueta />
      <button onClick={() => setTareas([...tareas, 'c'])}>Añadir</button>
      <button onClick={() => setTareas(tareas.filter((t) => t !== 'a'))}>Quitar a</button>
      <button onClick={() => setTema('oscuro')}>Oscuro</button>
    </Tema>
  )
}
```

Pulsar con `fireEvent.click` y esperar (`waitFor`) al mensaje `arbol` del commit siguiente. Tests (nombres y aserciones):

- `al montar, todos los componentes salen montados con su nivel y su estado`: nodos en orden `App`(0) · `Tema`(1, marca `proveedor`) · `Cabecera`(2) · `Tarea` clave `a`(2) · `Tarea` clave `b`(2) · `Contador`(2) · `Pie`(2, marca `memo`) · `Etiqueta`(2); todos `estado: 'montado'`, `renders: 1`; `App.estados` = `[{ valor: '["a","b"]' }, { valor: '"claro"' }]`; `Contador.estados` = `[{ valor: '0' }]`.
- `pulsar Sumar solo re-renderiza Contador, por su estado`: `Contador` `renderizado`, `renders: 2`, `motivos: [{ tipo: 'estado', indice: 1 }]`, `estados: [{ valor: '1' }]`; el resto `sin-cambios`; `cambiosDom: 1`.
- `añadir una tarea monta la nueva y explica cada re-render`: `App` `[{ tipo: 'estado', indice: 1 }]`; `Tarea` `a` y `b` `[{ tipo: 'prop', nombre: 'alPulsar', detalle: 'funcion-nueva' }]`; `Tarea` `c` `montado`; `Cabecera`, `Contador`, `Etiqueta` `[{ tipo: 'padre' }]`; `Pie` `sin-cambios`.
- `quitar una tarea la emite desmontada una sola vez`: en ese commit `Tarea` `a` sale `desmontado` en su posición anterior (entre `Cabecera` y `Tarea` `b`); en el commit siguiente ya no aparece.
- `cambiar el contexto lo dice una sola vez`: `Etiqueta` `motivos: [{ tipo: 'contexto', nombre: 'Tema' }]` (sin duplicados); `Tema` incluye `{ tipo: 'prop', nombre: 'value' }`.
- `los valores raros no rompen el recorrido`: un componente con props que llevan un objeto con ciclo, un `Symbol`, una función con nombre y un elemento de React → valores de texto `≤ 80` (`ƒ guardar()`, `<Tarjeta />`) y el mensaje se envía.
- `más de 200 componentes se truncan`: 250 hojas → 200 nodos y `truncado: true`.
- `los cambios del DOM se resaltan desde el segundo commit`: tras `Sumar`, existe `#__resaltados-react-en-vivo` con al menos un hijo, `aria-hidden="true"`; con temporizadores falsos, a los 700 ms está vacío; tras el montaje inicial no se creó ningún recuadro.
- `un fallo dentro del árbol no rompe la app`: con `window.__enviarReactEnVivo` que lanza solo para `tipo: 'arbol'`, pulsar `Sumar` sigue actualizando el texto a `Contador: 1`.

En `mensajes.test.ts`: `acepta un mensaje arbol válido`; `rechaza un arbol con 201 nodos`; `rechaza un nombre de 61 caracteres`; `rechaza un estado desconocido`; `rechaza un valor de prop de 81 caracteres`; `rechaza un motivo prop sin nombre`.

En `documento.test.ts`: `conArbol incluye arbol.js entre #root y la configuración`; `sin conArbol no lo incluye`; `con conPruebas nunca incluye arbol.js`.

En `runtime.test.ts`: `el puente pasa la raíz y el número de commit a __arbolReactEnVivo`; `si __arbolReactEnVivo lanza, el mensaje commit se envía igual`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/react-en-vivo`
Expected: FAIL (no existe `runtime/arbol.js`, ni el mensaje `arbol`, ni `conArbol`).

- [ ] **Step 3: Implement**

`arbol.js` según la spec («Runtime: arbol.js», puntos 1–8), IIFE sin dependencias, sin `innerHTML`. Ids estables con un `Map` de fiber → id que también registra el `alternate`. Para `desmontado`, guardar del commit anterior la lista de nodos emitidos y sus posiciones, e insertar los que faltan justo después de su hermano anterior que siga vivo (o al principio de los hijos de su padre). El recuadro del DOM: contenedor `div#__resaltados-react-en-vivo` añadido a `body` (fuera de `#root`), `aria-hidden="true"`, `pointer-events: none`, `position: absolute` por elemento con `getBoundingClientRect()` + scroll, borde de 2px; retirada a los 700 ms; con `matchMedia('(prefers-reduced-motion: reduce)')` sin transición. `puente.js`: `avisarCommit(raiz)` cuenta, envía `commit` y llama a `window.__arbolReactEnVivo?.(raiz, commits)` dentro de `try/catch`; en el hook propio y en el encadenado, `onCommitFiberRoot(id, raiz, ...)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/react-en-vivo` y después `npm run test`
Expected: PASS, todo el proyecto en verde.

- [ ] **Step 5: Commit**

```bash
git add src/lib/react-en-vivo
git commit -m "feat(react-en-vivo): árbol de renders dentro del iframe (fase 2)"
```

### Task 2: el panel, el bloque estático y el catálogo

**Files:**
- Modify: `src/lib/laboratorio/schemas.ts` (`mostrarArbol` en `esquemaReactEnVivo` y `esquemaReactAnotado`; `esquemaArbolDeComponentes` en la unión; tipo `DatosArbolDeComponentes`)
- Create: `src/components/bloques-laboratorio/ArbolVisual.tsx`, `ArbolDeRenders.tsx`, `ArbolDeComponentes.tsx` (+ sus `.test.tsx`)
- Modify: `src/components/bloques-laboratorio/ReactEnVivo.tsx`, `ReactAnotado.tsx`, `registro.ts` (+ tests)
- Modify: el catálogo de `/admin/referencia-contenido` y `specs/features/laboratorios.md`
- Test: `src/lib/laboratorio/schemas.test.ts` (o el archivo de tests de esquemas que ya exista)

**Interfaces:**
- Consumes: `MensajeArbol`, `NodoArbolRender`, `MotivoRender` de `mensajes.ts`; opción `conArbol` de `prepararDocumento` (Task 1).
- Produces: `ArbolVisual({ nodos, etiqueta, destello?, seleccionado?, onSeleccionar? })` donde `nodos: { id: string | number; nivel: number; nombre: string; clave?: string; marca?: string; etiqueta?: string; estado?: EstadoNodo; renders?: number; nota?: string; motivo?: string }[]`; `ArbolDeRenders({ arbol: MensajeArbol | null })`; `ArbolDeComponentes(datos: DatosArbolDeComponentes)`.

- [ ] **Step 1: Write the failing tests**

- Esquemas: `mostrarArbol es false por defecto en react-en-vivo y react-anotado`; `arbol-de-componentes acepta un árbol válido`; `rechaza que el primer nodo no tenga nivel 0`; `rechaza saltar de nivel 0 a 2`; `rechaza claves desconocidas en un nodo`; `rechaza 41 nodos`.
- `ArbolVisual`: pinta `App`, `key=a`, `·3`, la insignia `memo`, y el estado como texto visible: `montado`, `re-render`, `sin cambios`, `desmontado` (este último con el nombre tachado).
- `ArbolDeRenders`:
  - `sin mensajes enseña cómo empezar`: «Usa la vista previa para ver qué se vuelve a renderizar.»
  - `resume el commit`: con 3 renderizados, 1 montado y 2 cambios → «Commit 4 · 3 renderizados · 1 montado · 2 cambios en el DOM»; con 1 renderizado, 0 montados y 1 cambio → «Commit 2 · 1 renderizado · 1 cambio en el DOM» (montados y desmontados solo si > 0, con «desmontado/desmontados»).
  - `explica cada motivo en español`: «cambió su estado» (o «cambió su estado n.º 2» si el nodo tiene más de un valor en `estados`), «cambió la prop «alPulsar» (función nueva)», «(objeto nuevo)», «(array nuevo)», «cambió el contexto «Tema»», «se renderizó su padre»; varios se unen con « · ».
  - `al pulsar un nodo enseña sus props y su estado`: botón con el nombre del nodo y `aria-expanded`; despliega «Props» (`nombre: valor`) y «Estado» (`valor`), o «Sin props» / «Sin estado»; al pulsar otra vez se cierra.
  - `avisa si el árbol se truncó`: «Solo se muestran los primeros 200 componentes.»
- `ArbolDeComponentes`: pinta título, nodos, `etiqueta` y `nota`; leyenda solo si algún nodo trae `estado`.
- `ReactEnVivo`/`ReactAnotado`: `con mostrarArbol muestra el panel «Árbol de renders» y pinta el mensaje arbol que llega del iframe`; `sin mostrarArbol no hay panel ni se pide arbol.js` (`prepararDocumento` recibe `conArbol: false`); `al reconstruir la vista previa el panel vuelve al estado inicial`.
- `registro`: `'arbol-de-componentes'` → `ArbolDeComponentes`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/bloques-laboratorio src/lib/laboratorio`
Expected: FAIL.

- [ ] **Step 3: Implement**

Panel debajo de la vista previa y antes de la consola, con la misma tarjeta y tipografía que `ConsolaReact` y título «Árbol de renders». Colores con tokens que funcionen en claro y oscuro: montado `emerald`, re-render `amber`, sin cambios el gris de `muted-foreground`, desmontado `rose` + `line-through`. Destello: clase de animación en los nodos `montado`/`renderizado` del último commit, re-disparada por commit (`key` con el número de commit) y `motion-reduce:animate-none`. Guías del árbol con bordes CSS según `nivel`, y un texto solo para lectores de pantalla «nivel N». Sin `aria-live` (el árbol cambia en cada tecla). Catálogo: un `ReactEnVivo` con `mostrarArbol` (lista con `key`, un contador y un hijo con `memo`) y un `ArbolDeComponentes` de ejemplo (estado levantado: `App` con etiqueta «estado: tareas» y dos hijos).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test && npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src specs/features/laboratorios.md
git commit -m "feat(react-en-vivo): panel del árbol de renders y bloque arbol-de-componentes (fase 2)"
```

### Task 3 (Claude): verificación real

Playwright con Chromium contra `npm run dev` en `/admin/referencia-contenido`: el escenario de la Task 1 (Sumar → solo `Contador` en ámbar; Añadir → `Tarea c` en verde y el resto con su motivo; Quitar → tachado y desaparece; `memo` en gris), recuadros sobre el DOM cambiado, detalle de props/estado, modo oscuro, ancho de 390 px y `prefers-reduced-motion`. Después, revisión independiente de toda la rama y PR.
