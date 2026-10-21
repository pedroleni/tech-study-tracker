# `<StrictMode>` a fondo: qué ejecuta dos veces y para qué

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `strictmode-a-fondo-que-ejecuta-dos-veces-y-para-que` (autogenerado del título)
- **Orden:** 630
- **Fuentes:** [`<StrictMode>`](https://react.dev/reference/react/StrictMode) — ver `contenido/react/TEMARIO.md` #63

---

## Qué es y para qué sirve

`<StrictMode>` es un componente que no pinta nada. Envuelve una parte del árbol (casi siempre la app entera, en `main.jsx`) y, **solo en desarrollo**, hace que React ejecute de más algunas partes de tus componentes y avise de algunas APIs antiguas. En el build de producción no hace nada: tus usuarios no notan que existe.

Lo usas desde la lección 2, porque la plantilla de Vite lo trae y los bloques en vivo de esta web lo activan por defecto, y lo has ido viendo por piezas: el render doble en la lección 12, los inicializadores en la 16, los actualizadores en la 19, el reductor en la 27, las refs de callback en la 34 y la 35, el ensayo de los efectos en la 38 y la 40, y la diferencia entre `useLayoutEffect` y `useInsertionEffect` en la 45. Esta lección lo junta todo y va un paso más allá:

- **Qué ejecuta dos veces exactamente**, con y sin `StrictMode`, en el mismo componente.
- **Qué fallo destapa cada repetición**, con un ejemplo de cada uno en la web de un escape room.
- **Dónde ponerlo**: en toda la app o solo en una parte, y qué cambia.
- **Lo que no comprueba**, para no fiarte de más.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Las cuatro comprobaciones de StrictMode",
  "items": [
    {
      "titulo": "Un render de más",
      "texto": "React llama dos veces a las funciones que deben ser puras: el cuerpo del componente, los inicializadores de useState y useReducer, el cálculo de useMemo, los actualizadores y los reductores. Destapa los renders que cambian algo de fuera."
    },
    {
      "titulo": "Un ciclo de efecto de más",
      "texto": "Al montar un componente, cada efecto se ejecuta, se limpia y se vuelve a ejecutar. Destapa los efectos a los que les falta la limpieza."
    },
    {
      "titulo": "Un ciclo de ref de más",
      "texto": "Desde React 19, cada ref de callback se conecta, se limpia y se vuelve a conectar al montar. Destapa las refs de callback que no deshacen lo que hicieron."
    },
    {
      "titulo": "Avisos de APIs obsoletas",
      "texto": "Si un componente de clase de dentro usa métodos como UNSAFE_componentWillMount, React lo avisa en la consola con un error."
    },
    {
      "titulo": "Solo en desarrollo",
      "texto": "Todo lo anterior pasa con npm run dev. El build de producción ignora StrictMode: ni una llamada de más ni un aviso."
    }
  ]
}
```

## De dónde sale cada comprobación

Ninguna de las cuatro es un capricho. Cada una llegó cuando React empezó a necesitar algo de tus componentes, y la historia explica para qué sirve cada una:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "StrictMode, versión a versión",
  "items": [
    {
      "fecha": "2018 · React 16.3",
      "titulo": "Nace StrictMode",
      "texto": "Avisa de los métodos de ciclo de vida inseguros y de las refs de texto, y llama dos veces al render para detectar efectos secundarios. React se preparaba para poder interrumpir un render y tirarlo, y eso solo es seguro si el render no ha cambiado nada fuera."
    },
    {
      "fecha": "2022 · React 18",
      "titulo": "Montar, desmontar y volver a montar",
      "texto": "Cada componente nuevo se monta, se desmonta y se vuelve a montar conservando su estado, para comprobar que sus efectos aguantan aparecer y desaparecer. Lo pedía una función que React quería añadir: quitar y devolver partes de la interfaz sin perder el estado."
    },
    {
      "fecha": "2024 · React 19",
      "titulo": "Refs de callback y menos ruido",
      "texto": "Las refs de callback pasan también por el ciclo de más al montar. El segundo render reutiliza lo que calcularon useMemo y useCallback en el primero. Y desaparecen de React APIs que StrictMode señalaba, como las refs de texto o findDOMNode."
    },
    {
      "fecha": "2025 · React 19.2",
      "titulo": "Llega <Activity>",
      "texto": "La función que anunciaba React 18: esconder una parte de la interfaz sin perder su estado (lección 54). Al volver a mostrarla, sus efectos se ejecutan otra vez, y con StrictMode repiten el ensayo."
    },
    {
      "fecha": "2026 · React 19.3",
      "titulo": "También al hidratar",
      "texto": "Los efectos se ensayan dos veces también en las raíces que hidratan el HTML del servidor, igual que con createRoot (lección 87)."
    }
  ]
}
```

## Todo lo que se ejecuta dos veces, comparado

En el panel del máster de juego del escape room **La Cerradura**, cada sala enseña cuántas pistas ha pedido el grupo. El componente `Sala` escribe en la consola cada pieza que React ejecuta: el cuerpo del componente, el inicializador de `useState`, el cálculo de `useMemo` (lo verás en la lección 67; aquí basta con saber que es una función que React llama durante el render), un efecto, una ref de callback y el manejador del botón con su actualizador.

Los dos bloques siguientes tienen **exactamente el mismo código**. El primero tiene `StrictMode` apagado; el segundo, encendido, como un proyecto recién creado con Vite. Lee la consola y el registro de efectos de los dos al cargar, y después pulsa «Pedir pista» dos veces en cada uno.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Sin StrictMode: cada pieza, una vez",
  "consigna": "Lee la consola al cargar: una línea por pieza, en el orden en que React las ejecuta. Pulsa «Pedir pista» dos veces y fíjate en qué se vuelve a ejecutar con cada clic y qué no.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useMemo, useState } from 'react'\nimport './estilos.css'\n\nconst PISTAS = [\n  'Mira debajo del cuadro del abad',\n  'El año de la placa abre el baúl',\n  'La llave está dentro del reloj',\n]\n\n// Fuera del componente: la misma función en todos los renders\nfunction registrarSala(nodo) {\n  console.log('▶ ref de callback: registro', nodo.tagName)\n  return () => console.log('⟲ limpieza de la ref')\n}\n\nfunction Sala({ nombre }) {\n  console.log('Render de Sala')\n\n  const [pedidas, setPedidas] = useState(() => {\n    console.log('· inicializador de useState')\n    return 0\n  })\n\n  const quedan = useMemo(() => {\n    console.log('· cálculo de useMemo')\n    return PISTAS.length - pedidas\n  }, [pedidas])\n\n  useEffect(() => {\n    console.log('▶ efecto: arranco el cronómetro')\n    return () => console.log('⟲ limpieza: paro el cronómetro')\n  }, [])\n\n  function pedirPista() {\n    console.log('Manejador de «Pedir pista»')\n    setPedidas((n) => {\n      console.log('· actualizador:', n, '→', n + 1)\n      return n + 1\n    })\n  }\n\n  return (\n    <section ref={registrarSala}>\n      <h2>{nombre}</h2>\n      <p>\n        Pistas pedidas: {pedidas} · Quedan {quedan}\n      </p>\n      {pedidas > 0 && <p>Última pista: {PISTAS[pedidas - 1]}</p>}\n      <button onClick={pedirPista} disabled={quedan === 0}>\n        Pedir pista\n      </button>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Escape room La Cerradura</h1>\n      <Sala nombre=\"La cripta del abad\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con StrictMode: lo que debe ser puro, dos veces",
  "consigna": "El mismo código, con StrictMode. Compara la consola con la del bloque anterior línea a línea, al cargar y después de pulsar «Pedir pista» dos veces. Mira también el commit 1 del registro de efectos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useMemo, useState } from 'react'\nimport './estilos.css'\n\nconst PISTAS = [\n  'Mira debajo del cuadro del abad',\n  'El año de la placa abre el baúl',\n  'La llave está dentro del reloj',\n]\n\n// Fuera del componente: la misma función en todos los renders\nfunction registrarSala(nodo) {\n  console.log('▶ ref de callback: registro', nodo.tagName)\n  return () => console.log('⟲ limpieza de la ref')\n}\n\nfunction Sala({ nombre }) {\n  console.log('Render de Sala')\n\n  const [pedidas, setPedidas] = useState(() => {\n    console.log('· inicializador de useState')\n    return 0\n  })\n\n  const quedan = useMemo(() => {\n    console.log('· cálculo de useMemo')\n    return PISTAS.length - pedidas\n  }, [pedidas])\n\n  useEffect(() => {\n    console.log('▶ efecto: arranco el cronómetro')\n    return () => console.log('⟲ limpieza: paro el cronómetro')\n  }, [])\n\n  function pedirPista() {\n    console.log('Manejador de «Pedir pista»')\n    setPedidas((n) => {\n      console.log('· actualizador:', n, '→', n + 1)\n      return n + 1\n    })\n  }\n\n  return (\n    <section ref={registrarSala}>\n      <h2>{nombre}</h2>\n      <p>\n        Pistas pedidas: {pedidas} · Quedan {quedan}\n      </p>\n      {pedidas > 0 && <p>Última pista: {PISTAS[pedidas - 1]}</p>}\n      <button onClick={pedirPista} disabled={quedan === 0}>\n        Pedir pista\n      </button>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Escape room La Cerradura</h1>\n      <Sala nombre=\"La cripta del abad\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Esta es la cuenta en React 19.3. Sale de esos dos bloques, salvo dos filas que ya conoces: el reductor y el inicializador de `useReducer` se comportan igual que sus parientes de `useState` (lección 27), y `useInsertionEffect` no se repite (lección 45).

| Qué ejecuta React | Sin `StrictMode` | Con `StrictMode` |
|---|---|---|
| Cuerpo del componente | 1 | 2 |
| Inicializador de `useState` o `useReducer` | 1 | 2 |
| Cálculo de `useMemo` | 1 | 2 |
| Actualizador `setX((x) => …)` y reductor | 1 | 2 |
| Efecto (`useEffect`, `useLayoutEffect`), al montar | efecto | efecto, limpieza, efecto |
| Ref de callback, al montar | conectar | conectar, limpiar, conectar |
| `useInsertionEffect` | 1 | 1 |
| Manejador de evento | 1 | 1 |

Tres detalles que se ven en la consola del segundo bloque:

- **El orden.** Las dos llamadas al inicializador y las dos a `useMemo` salen seguidas, antes del segundo «Render de Sala». En React 19, la segunda llamada al componente reutiliza lo que calcularon sus Hooks en la primera, así que no los vuelve a llamar: la repetición la hace cada Hook por su cuenta, dentro de la primera.
- **Efectos y refs, solo al montar.** Con los clics, el efecto no se repite (su lista de dependencias está vacía) y la ref tampoco, porque `registrarSala` está fuera del componente y es la misma función en cada render. El render, el cálculo de `useMemo` y el actualizador sí salen dos veces con cada clic.
- **El manejador, una vez.** «Manejador de «Pedir pista»» sale una sola vez por clic, con `StrictMode` o sin él. Lo que ocurre porque alguien ha pulsado algo no se ensaya.

En el registro de efectos, la diferencia es la de la lección 38: sin `StrictMode`, «Sala ▶ efecto · montaje»; con él, además, «Sala ⟲ limpieza» y «Sala ▶ efecto · repetido por StrictMode» en el mismo commit 1.

## Qué fallo destapa cada repetición

Cada repetición está pensada para un tipo de fallo. La idea es siempre la misma: **hacer ahora, en tu ordenador, algo que en producción pasará tarde o temprano**. Un componente se renderiza muchas veces; un efecto se monta y se desmonta cada vez que alguien entra y sale de una pantalla; una ref se conecta y se desconecta cuando su nodo aparece y desaparece. `StrictMode` lo adelanta al primer render. Aquí tienes un ejemplo de cada caso, siempre con la misma estructura: el fallo sin `StrictMode`, que parece funcionar, y el mismo código con él.

### 1. El render doble: un componente que cambia lo que recibe

La web enseña las salas con el precio para el grupo. `ListaSalas` quiere añadir al final una tarjeta de la sala que están construyendo, y lo hace con `push` sobre el array que le llega por props. Sin `StrictMode`, la lista carga bien:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Sin StrictMode: bien… hasta el siguiente render",
  "consigna": "Al cargar, la lista parece correcta. Pulsa «Añadir jugador» tres veces y cuenta las salas secretas. Lee también la consola.",
  "archivos": [
    {
      "nombre": "ListaSalas.jsx",
      "codigo": "export default function ListaSalas({ salas, jugadores }) {\n  // Añade una tarjeta al final de la lista que llega por props\n  const tarjetas = salas\n  tarjetas.push({ id: 'secreta', nombre: 'Sala secreta (próximamente)', precio: null })\n\n  return (\n    <ul>\n      {tarjetas.map((sala) => (\n        <li key={sala.id}>\n          {sala.nombre}\n          {sala.precio !== null && ` · ${sala.precio * jugadores} € el grupo`}\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaSalas from './ListaSalas'\nimport './estilos.css'\n\nconst SALAS = [\n  { id: 'cripta', nombre: 'La cripta del abad', precio: 15 },\n  { id: 'laboratorio', nombre: 'El laboratorio del doctor Lobo', precio: 17 },\n  { id: 'camarote', nombre: 'Camarote 13', precio: 19 },\n]\n\nexport default function App() {\n  const [jugadores, setJugadores] = useState(4)\n\n  return (\n    <main>\n      <h1>Escape room La Cerradura</h1>\n      <p>\n        Grupo de {jugadores} jugadores{' '}\n        <button onClick={() => setJugadores(jugadores + 1)}>Añadir jugador</button>\n      </p>\n      <ListaSalas salas={SALAS} jugadores={jugadores} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "ListaSalas.jsx",
  "strictMode": false,
  "mostrarConsola": true
}
```

El mismo código, con `StrictMode`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con StrictMode: el fallo, desde el primer render",
  "consigna": "Ahora la sala secreta sale dos veces nada más cargar, y cada clic en «Añadir jugador» suma dos más. Arréglalo en ListaSalas.jsx: crea un array nuevo con [...salas, { … }] en vez de hacer push sobre el que llega por props.",
  "archivos": [
    {
      "nombre": "ListaSalas.jsx",
      "codigo": "export default function ListaSalas({ salas, jugadores }) {\n  // Añade una tarjeta al final de la lista que llega por props\n  const tarjetas = salas\n  tarjetas.push({ id: 'secreta', nombre: 'Sala secreta (próximamente)', precio: null })\n\n  return (\n    <ul>\n      {tarjetas.map((sala) => (\n        <li key={sala.id}>\n          {sala.nombre}\n          {sala.precio !== null && ` · ${sala.precio * jugadores} € el grupo`}\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaSalas from './ListaSalas'\nimport './estilos.css'\n\nconst SALAS = [\n  { id: 'cripta', nombre: 'La cripta del abad', precio: 15 },\n  { id: 'laboratorio', nombre: 'El laboratorio del doctor Lobo', precio: 17 },\n  { id: 'camarote', nombre: 'Camarote 13', precio: 19 },\n]\n\nexport default function App() {\n  const [jugadores, setJugadores] = useState(4)\n\n  return (\n    <main>\n      <h1>Escape room La Cerradura</h1>\n      <p>\n        Grupo de {jugadores} jugadores{' '}\n        <button onClick={() => setJugadores(jugadores + 1)}>Añadir jugador</button>\n      </p>\n      <ListaSalas salas={SALAS} jugadores={jugadores} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "ListaSalas.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

Sin `StrictMode`, el fallo salía con el primer re-render; con él, en el primer render. **La causa es la misma**: `const tarjetas = salas` no copia nada, `tarjetas` es otro nombre para el array `SALAS` de `App.jsx`, y cada llamada a `ListaSalas` le añade una tarjeta más. Como `StrictMode` llama dos veces al componente, el segundo `push` ya encuentra el del primero. La consola lo señala con un aviso que conoces de la lección 12:

```text
Encountered two children with the same key, `secreta`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
```

Es decir: dos hijos tienen la misma `key`, «secreta», y React no garantiza qué hará con ellos. Una `key` repetida en una lista que nadie ha tocado es una pista clásica de render impuro. El arreglo es crear un array nuevo en cada render:

```jsx
const tarjetas = [...salas, { id: 'secreta', nombre: 'Sala secreta (próximamente)', precio: null }]
```

### 2. El ensayo de efectos: una conexión que nadie cierra

Desde el panel del máster se ve la cámara de cada sala. `Monitor` se conecta al servidor de vídeo en un efecto, pero no se desconecta nunca. Debajo, el panel enseña lo que el servidor tiene abierto, leído con `useSyncExternalStore` como en la lección 46. Sin `StrictMode`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Sin StrictMode: una conexión… por ahora",
  "consigna": "Al cargar, el servidor tiene una conexión: parece correcto. Cambia de sala tres o cuatro veces y mira cuántas conexiones quedan abiertas, y de qué salas.",
  "archivos": [
    {
      "nombre": "Monitor.jsx",
      "codigo": "import { useEffect } from 'react'\nimport { conectarCamara } from './camaras'\n\nexport default function Monitor({ sala }) {\n  useEffect(() => {\n    conectarCamara(sala)\n    // Falta la limpieza: nadie desconecta esta cámara\n  }, [sala])\n\n  return <p className=\"monitor\">Viendo la cámara de «{sala}»</p>\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useSyncExternalStore } from 'react'\nimport Monitor from './Monitor'\nimport { camarasConectadas, conexionesAbiertas, suscribirse } from './camaras'\nimport './estilos.css'\n\nconst SALAS = ['La cripta del abad', 'El laboratorio del doctor Lobo', 'Camarote 13']\n\nexport default function App() {\n  const [sala, setSala] = useState(SALAS[0])\n  const abiertas = useSyncExternalStore(suscribirse, conexionesAbiertas)\n  const camaras = useSyncExternalStore(suscribirse, camarasConectadas)\n\n  return (\n    <main>\n      <h1>Panel del máster · La Cerradura</h1>\n      <div>\n        {SALAS.map((nombre) => (\n          <button key={nombre} aria-pressed={nombre === sala} onClick={() => setSala(nombre)}>\n            {nombre}\n          </button>\n        ))}\n      </div>\n      <Monitor sala={sala} />\n      <section className=\"servidor\" aria-label=\"Servidor de vídeo\">\n        <p>Conexiones abiertas: {abiertas}</p>\n        <p>Cámaras conectadas: {camaras}</p>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "camaras.jsx",
      "codigo": "// Hace de servidor de vídeo de las salas: JavaScript sin React.\nlet conectadas = []\nconst oyentes = new Set()\n\nfunction avisar() {\n  oyentes.forEach((oyente) => oyente())\n}\n\nexport function conectarCamara(sala) {\n  conectadas = [...conectadas, sala]\n  console.log(`Conecto la cámara de «${sala}»`)\n  avisar()\n  return {\n    desconectar() {\n      const posicion = conectadas.indexOf(sala)\n      conectadas = conectadas.filter((_, i) => i !== posicion)\n      console.log(`Desconecto la cámara de «${sala}»`)\n      avisar()\n    },\n  }\n}\n\nexport function suscribirse(oyente) {\n  oyentes.add(oyente)\n  return () => oyentes.delete(oyente)\n}\n\n// Para el panel: cuántas hay abiertas y de qué salas\nexport function conexionesAbiertas() {\n  return conectadas.length\n}\n\nexport function camarasConectadas() {\n  return conectadas.length === 0 ? 'ninguna' : conectadas.join(', ')\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Monitor.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

El mismo código, con `StrictMode`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Con StrictMode: dos conexiones antes de tocar nada",
  "consigna": "El servidor tiene dos conexiones a la cripta nada más cargar. Arréglalo en Monitor.jsx: guarda lo que devuelve conectarCamara y devuelve desde el efecto una función que llame a desconectar. Comprueba que el servidor nunca pasa de una conexión, cambies de sala las veces que cambies.",
  "archivos": [
    {
      "nombre": "Monitor.jsx",
      "codigo": "import { useEffect } from 'react'\nimport { conectarCamara } from './camaras'\n\nexport default function Monitor({ sala }) {\n  useEffect(() => {\n    conectarCamara(sala)\n    // Falta la limpieza: nadie desconecta esta cámara\n  }, [sala])\n\n  return <p className=\"monitor\">Viendo la cámara de «{sala}»</p>\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useSyncExternalStore } from 'react'\nimport Monitor from './Monitor'\nimport { camarasConectadas, conexionesAbiertas, suscribirse } from './camaras'\nimport './estilos.css'\n\nconst SALAS = ['La cripta del abad', 'El laboratorio del doctor Lobo', 'Camarote 13']\n\nexport default function App() {\n  const [sala, setSala] = useState(SALAS[0])\n  const abiertas = useSyncExternalStore(suscribirse, conexionesAbiertas)\n  const camaras = useSyncExternalStore(suscribirse, camarasConectadas)\n\n  return (\n    <main>\n      <h1>Panel del máster · La Cerradura</h1>\n      <div>\n        {SALAS.map((nombre) => (\n          <button key={nombre} aria-pressed={nombre === sala} onClick={() => setSala(nombre)}>\n            {nombre}\n          </button>\n        ))}\n      </div>\n      <Monitor sala={sala} />\n      <section className=\"servidor\" aria-label=\"Servidor de vídeo\">\n        <p>Conexiones abiertas: {abiertas}</p>\n        <p>Cámaras conectadas: {camaras}</p>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "camaras.jsx",
      "codigo": "// Hace de servidor de vídeo de las salas: JavaScript sin React.\nlet conectadas = []\nconst oyentes = new Set()\n\nfunction avisar() {\n  oyentes.forEach((oyente) => oyente())\n}\n\nexport function conectarCamara(sala) {\n  conectadas = [...conectadas, sala]\n  console.log(`Conecto la cámara de «${sala}»`)\n  avisar()\n  return {\n    desconectar() {\n      const posicion = conectadas.indexOf(sala)\n      conectadas = conectadas.filter((_, i) => i !== posicion)\n      console.log(`Desconecto la cámara de «${sala}»`)\n      avisar()\n    },\n  }\n}\n\nexport function suscribirse(oyente) {\n  oyentes.add(oyente)\n  return () => oyentes.delete(oyente)\n}\n\n// Para el panel: cuántas hay abiertas y de qué salas\nexport function conexionesAbiertas() {\n  return conectadas.length\n}\n\nexport function camarasConectadas() {\n  return conectadas.length === 0 ? 'ninguna' : conectadas.join(', ')\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Monitor.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Es el fallo de la lección 38 con otra ropa, y la lógica es la misma: **el ensayo simula que el usuario se va de la pantalla y vuelve**, y un efecto sin limpieza deja una conexión abierta por cada visita. Sin `StrictMode` lo descubre quien cambia de sala; con él, lo ves al cargar. El arreglo:

```jsx
useEffect(() => {
  const conexion = conectarCamara(sala)
  return () => conexion.desconectar()
}, [sala])
```

Con la limpieza puesta, el registro de efectos cuenta la historia completa en el commit 1, y el servidor se queda en una conexión:

```text
Monitor ▶ efecto · montaje
Monitor ⟲ limpieza
Monitor ▶ efecto · repetido por StrictMode
```

### 3. El ensayo de refs: un widget que se monta dos veces

El cofre del capitán se abre con un candado de tres ruedas que dibuja una librería sin React, `montarCandado(nodo, cifras)`. Como el candado vive dentro de un nodo concreto, se monta en una ref de callback (lección 34): React llama a la función con el nodo cuando aparece. Pero la función no devuelve limpieza.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un candado con ruedas de más",
  "consigna": "Cuenta las filas de ruedas del candado al cargar y lee la consola. Pulsa «Probar combinación» un par de veces y vuelve a contar. Después arréglalo: guarda lo que devuelve montarCandado y devuelve desde la ref una función que llame a desmontar (el if ya no hará falta).",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { montarCandado } from './candado'\nimport './estilos.css'\n\nfunction Candado({ cifras }) {\n  return (\n    <div\n      className=\"candado\"\n      role=\"img\"\n      aria-label={`Candado de ${cifras} cifras`}\n      ref={(nodo) => {\n        if (nodo) montarCandado(nodo, cifras)\n      }}\n    />\n  )\n}\n\nexport default function App() {\n  const [intentos, setIntentos] = useState(0)\n\n  return (\n    <main>\n      <h1>El cofre del capitán</h1>\n      <Candado cifras={3} />\n      <p>Intentos: {intentos}</p>\n      <button onClick={() => setIntentos(intentos + 1)}>Probar combinación</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "candado.jsx",
      "codigo": "// Hace de librería de candados del escape room: JavaScript sin React.\n// Dibuja una rueda por cifra dentro del nodo que le pasas.\nexport function montarCandado(nodo, cifras) {\n  console.log(`Monto un candado de ${cifras} ruedas`)\n  const ruedas = document.createElement('div')\n  ruedas.className = 'ruedas'\n  for (let i = 0; i < cifras; i++) {\n    const rueda = document.createElement('span')\n    rueda.className = 'rueda'\n    rueda.textContent = '0'\n    ruedas.append(rueda)\n  }\n  nodo.append(ruedas)\n  return {\n    desmontar() {\n      console.log('Desmonto el candado')\n      ruedas.remove()\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

Al cargar hay **dos filas de ruedas**: es el ciclo de más que `StrictMode` hace con cada ref de callback desde React 19. Como la función no devuelve limpieza, React se comporta como antes de React 19: para desconectar la ref, la vuelve a llamar con `null` (de ahí el `if (nodo)`, lección 35), y al conectarla otra vez se monta un segundo candado junto al primero.

Y aquí el fallo no es solo de desarrollo. Cada clic en «Probar combinación» vuelve a renderizar `Candado`, y la flecha que pasas a `ref` es una función nueva en cada render: React desconecta la vieja y conecta la nueva (lección 34). **Sin limpieza, cada render añade un candado, también en producción.** Con ella, el candado se desmonta y se vuelve a montar en cada render, pero nunca hay más de uno:

```jsx
ref={(nodo) => {
  const candado = montarCandado(nodo, cifras)
  return () => candado.desmontar()
}}
```

### 4. Una petición que nadie cancela

Lo que hace `StrictMode` con un efecto que pide datos ya lo viste en la lección 38: en el panel de red salen **dos peticiones completas** a la misma URL donde debería haber una «cancelada» y una buena. Si el efecto sustituye los datos, la segunda respuesta pisa a la primera con lo mismo y no se nota nada. Pero si **los añade** a los que ya había, como hace una lista con «Ver más», sí:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Opiniones() {\n  const [pagina, setPagina] = useState(1)\n  const [opiniones, setOpiniones] = useState([])\n  const [total, setTotal] = useState(null)\n\n  useEffect(() => {\n    fetch(`/api/paginas/${pagina}`)\n      .then((res) => res.json())\n      .then((datos) => {\n        setOpiniones((anteriores) => [...anteriores, ...datos.opiniones])\n        setTotal(datos.total)\n      })\n  }, [pagina])\n\n  return <p>Mostrando {opiniones.length} de {total} opiniones</p>\n  // …y debajo, la lista y el botón «Ver más opiniones»\n}\n\n// Cada página trae 3 opiniones; hay 9 en total.\n// Con StrictMode, ¿qué dice el contador al cargar?",
  "opciones": [
    "Mostrando 3 de 9 opiniones",
    "Mostrando 6 de 9 opiniones",
    "Mostrando 0 de 9 opiniones: la segunda petición cancela la primera"
  ],
  "correcta": 1,
  "explicacion": "StrictMode ejecuta el efecto, intenta limpiarlo (no hay limpieza) y lo ejecuta otra vez: dos peticiones a la página 1, y llegan las dos. Cada respuesta añade sus tres opiniones, así que la página 1 sale repetida, con avisos de key duplicada en la consola. Nadie cancela nada: fetch no sabe que hay otra petición igual."
}
```

Cancelar la primera petición en la limpieza arregla el ensayo. Pero fíjate en lo que `StrictMode` te está diciendo de verdad: **este efecto no aguanta ejecutarse dos veces**. Y en producción también se repite: `<Activity>` vuelve a ejecutar los efectos de lo que muestra otra vez después de esconderlo (lección 54). Si la petición ya había llegado, no queda nada que cancelar, y la página se añade otra vez. Comprobado con React 19.3.1 y sin `StrictMode`: con un `AbortController` en la limpieza, esconder y volver a mostrar la lista pasa de «Mostrando 3» a «Mostrando 6». El arreglo completo es que repetir el efecto no cambie el resultado; lo harás en el ejercicio 2.

### Y lo demás que se ejecuta dos veces

Los inicializadores, los actualizadores y los reductores destapan lo mismo que el render doble, porque también corren durante el render: un inicializador que pide algo al servidor, un actualizador que además lanza otro `set` (la papeleta de más de la lección 19) o un reductor que muta el estado que recibe (la mudanza de la lección 27). La regla es la de la lección 12: **todo lo que React puede llamar durante el render tiene que poder llamarse dos veces sin que se note**.

## No solo al cargar: cada vez que algo se monta

El ensayo de efectos y refs no ocurre «una vez al abrir la página». Ocurre **cada vez que un componente se monta**, y montarse incluye más casos de los que parece:

- Aparecer por un renderizado condicional, como el bono de los trineos de la lección 38.
- Cambiar de `key`, que para React es desmontar un componente y montar otro (lección 26).
- Volver a mostrarse dentro de un `<Activity>` que estaba escondido (lección 54).

En cambio, **no hay ensayo cuando cambia una dependencia**: entonces React hace lo de siempre, una limpieza y un efecto (lección 40). Compruébalo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Cronometro({ sala }) {\n  useEffect(() => {\n    console.log('Arranca el cronómetro de', sala)\n    return () => console.log('Para el cronómetro de', sala)\n  }, [sala])\n\n  return <p>{sala}: 60:00</p>\n}\n\n// En App, con StrictMode y ya en pantalla:\n<Cronometro sala={sala} />\n<Cronometro key={sala} sala={sala} />\n\n// sala pasa de 'cripta' a 'camarote'.\n// ¿Cuántas veces sale «Arranca el cronómetro de camarote»?",
  "opciones": [
    "Dos: una por cada cronómetro",
    "Tres: el de la key se monta de nuevo y StrictMode lo ensaya",
    "Cuatro: StrictMode repite los dos"
  ],
  "correcta": 1,
  "explicacion": "El primer cronómetro sigue montado y solo cambia una dependencia: limpieza y efecto, una vez. El segundo cambia de key, así que React desmonta el de la cripta y monta uno nuevo para el camarote, y a un componente que se monta StrictMode le hace el ensayo: arranca, para y arranca. En total, tres «Arranca… camarote»."
}
```

## Toda la app o solo una parte

**En toda la app** es lo que recomienda react.dev, sobre todo en proyectos nuevos, y lo que hace la plantilla de Vite desde el `main.jsx` de la lección 2:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.jsx'\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "import { StrictMode } from 'react'",
      "nota": "StrictMode es un componente más de react. No recibe props."
    },
    {
      "fragmento": "<StrictMode>\n    <App />\n  </StrictMode>",
      "nota": "Envuelve la raíz: todos los componentes de la app, a cualquier profundidad, pasan las cuatro comprobaciones. Y como está en la raíz, también se ensayan los efectos y las refs del montaje inicial."
    },
    {
      "fragmento": "createRoot",
      "nota": "Si usas un framework, normalmente no escribes createRoot: el StrictMode se activa en su configuración. Next.js, por ejemplo, lo enciende por defecto con el App Router desde la versión 13.5.1."
    }
  ]
}
```

**En una parte.** `<StrictMode>` puede ir en cualquier punto del árbol y afecta a todo lo que tiene dentro, a cualquier profundidad. Hay dos reglas que conviene saber:

- **No hay forma de salir.** Dentro de un `<StrictMode>` se comprueba todo, sin excepciones. Si un componente no puede con él, la única salida es bajar el `<StrictMode>` para que no lo envuelva.
- **Si no está en la raíz, React solo hace lo que podría pasar en producción.** En el montaje inicial no ensaya los efectos ni las refs de lo que hay dentro: sería como desmontar a un hijo sin desmontar a su padre, algo que en producción no ocurre. Lo que se monte **después** dentro de él, sí se ensaya.

En este bloque `StrictMode` está apagado: el único `<StrictMode>` es el que hay dentro de `App`, alrededor de `Sala` y del panel de pistas. La taquilla, que es código antiguo, se queda fuera.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "StrictMode alrededor de una parte del árbol",
  "consigna": "Lee la consola y el registro de efectos al cargar: ¿quién se renderiza dos veces? ¿Hay algún «repetido por StrictMode»? Después pulsa «Abrir el panel de pistas» y vuelve a leer los dos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { StrictMode, useEffect, useState } from 'react'\nimport './estilos.css'\n\n// Código antiguo que todavía no está listo para StrictMode\nfunction Taquilla() {\n  console.log('Render de Taquilla')\n  useEffect(() => {\n    console.log('▶ Taquilla: abro la caja')\n    return () => console.log('⟲ Taquilla: cierro la caja')\n  }, [])\n  return <p>Taquilla abierta</p>\n}\n\nfunction Sala() {\n  console.log('Render de Sala')\n  useEffect(() => {\n    console.log('▶ Sala: enciendo las luces')\n    return () => console.log('⟲ Sala: apago las luces')\n  }, [])\n  return <p>Sala: La cripta del abad</p>\n}\n\nfunction PanelPistas() {\n  console.log('Render de PanelPistas')\n  useEffect(() => {\n    console.log('▶ PanelPistas: conecto el pulsador')\n    return () => console.log('⟲ PanelPistas: desconecto el pulsador')\n  }, [])\n  return <p>Panel de pistas listo</p>\n}\n\nexport default function App() {\n  const [conPistas, setConPistas] = useState(false)\n\n  return (\n    <main>\n      <h1>Escape room La Cerradura</h1>\n      <Taquilla />\n      <StrictMode>\n        <Sala />\n        {conPistas && <PanelPistas />}\n      </StrictMode>\n      <button onClick={() => setConPistas(true)}>Abrir el panel de pistas</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Al cargar, `Sala` se renderiza dos veces y `Taquilla`, una: el render doble funciona desde el principio dentro de `<StrictMode>`. Pero el registro solo dice «montaje» para las dos, sin rastro del ensayo. Al abrir el panel de pistas, `PanelPistas` se monta **dentro** de `<StrictMode>` y ahora sí: «PanelPistas ▶ efecto · montaje», «⟲ limpieza» y «▶ efecto · repetido por StrictMode». En ese mismo clic `Sala` vuelve a renderizarse dos veces, porque `App` ha cambiado de estado y `Sala` está dentro.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Cuándo tiene sentido activarlo solo en una parte",
  "items": [
    {
      "titulo": "Para migrar una app antigua",
      "texto": "Activarlo de golpe en la raíz de una app que nunca lo tuvo puede llenar la consola de fallos. Envuelve primero una sección, arréglala y ve subiendo el StrictMode hasta que lo envuelva todo."
    },
    {
      "titulo": "Para aislar lo que aún no puedes tocar",
      "texto": "Un widget heredado o una librería que falla con el ensayo puede quedarse fuera mientras la arreglas o la sustituyes, como la taquilla del ejemplo."
    },
    {
      "titulo": "Nunca como solución definitiva",
      "texto": "Lo que queda fuera tiene los mismos fallos, solo que sin aviso. El objetivo es que StrictMode acabe envolviendo la app entera."
    }
  ]
}
```

## Las comprobaciones de APIs obsoletas

La cuarta comprobación es la más antigua y hoy la que menos verás. Dentro de `StrictMode`, React avisa si un componente de clase usa alguno de los métodos de ciclo de vida marcados como inseguros: `UNSAFE_componentWillMount`, `UNSAFE_componentWillReceiveProps` o `UNSAFE_componentWillUpdate`. Con React 19.3.1, un componente de clase `CuentaAtras` que usa el primero produce este error en la consola:

```text
Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://react.dev/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.

Please update the following components: CuentaAtras
```

Es decir: usar `UNSAFE_componentWillMount` en modo estricto no se recomienda y puede indicar fallos; mueve los efectos secundarios a `componentDidMount` y el estado inicial al constructor, y actualiza estos componentes. Sale como **error**, uno por método, con la lista de componentes que lo usan. Fuera de `StrictMode`, las versiones con `UNSAFE_` no avisan; las antiguas sin prefijo, como `componentWillMount`, avisan siempre, con un *warning* que pide renombrarlas.

Antes de React 19, `StrictMode` también avisaba de las refs de texto, de `findDOMNode` y del contexto antiguo con `contextTypes`. React 19 eliminó esas APIs, así que ya no hay nada de lo que avisar. Leer y migrar componentes de clase es el tema de la lección 91.

## Cómo lo ves en esta web y en tu navegador

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde se nota StrictMode",
  "roles": [
    {
      "etiqueta": "Consola de esta web",
      "rol": "Las dos llamadas, idénticas",
      "descripcion": "Cada console.log del render sale dos veces, exactamente igual. La vista previa no atenúa ni esconde nada (comprobado con React 19.3.1)."
    },
    {
      "etiqueta": "Registro de efectos",
      "rol": "Marca el ensayo",
      "descripcion": "«⟲ limpieza» y «▶ efecto · repetido por StrictMode» en el mismo commit del montaje. Los de useInsertionEffect no se repiten (lección 45)."
    },
    {
      "etiqueta": "Árbol de renders",
      "rol": "Cuenta commits, no llamadas",
      "descripcion": "El ·N de cada componente sube una vez por render que llega a un commit, aunque StrictMode haya llamado dos veces a la función (lección 33)."
    },
    {
      "etiqueta": "Consola del navegador",
      "rol": "Con React DevTools, atenuada",
      "descripcion": "Sin extensiones salen iguales. Con las React DevTools, la segunda llamada sale más clara y sus ajustes permiten esconderla (lección 65)."
    }
  ]
}
```

## Lo que `StrictMode` no destapa

El anuncio de `StrictMode` en React 16.3 ya lo decía: no puede encontrar todos los problemas, por ejemplo algunos tipos de mutación. Es una red muy útil, pero tiene agujeros, y conviene saber dónde están:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Los manejadores de eventos",
      "texto": "Un onClick que envía algo dos veces o que muta el estado no se repite: StrictMode solo repite lo que corre durante el render, los efectos y las refs."
    },
    {
      "titulo": "Lo que pasa al cambiar una dependencia",
      "texto": "El ensayo solo ocurre al montar. Si el fallo está en cómo reacciona el efecto a un cambio (se queda con un valor viejo, por ejemplo), no lo verás hasta que cambie. Para eso está el linter con exhaustive-deps (lección 42)."
    },
    {
      "titulo": "Impurezas que se anulan o se repiten igual",
      "texto": "Escribir el mismo valor dos veces, como document.title en el render, no cambia nada a la vista. Y dos reverse seguidos dejan el array como estaba: la segunda llamada deshace la primera. Lo verás en Errores típicos."
    },
    {
      "titulo": "Las carreras",
      "texto": "Dos peticiones que llegan desordenadas dependen del tiempo, no de cuántas veces se ejecuta el efecto. El ensayo te avisa de que falta la limpieza; la carrera la ves con «Responder desordenado» (lección 38)."
    },
    {
      "titulo": "Lo que solo pasa en producción",
      "texto": "StrictMode no hace nada en el build de producción, así que no ve errores de configuración, de variables de entorno ni de rendimiento real. Para medir, la lección 65."
    },
    {
      "titulo": "Lo que ve el linter",
      "texto": "Leer Math.random en el render, mutar props o llamar a un set durante el render lo marca eslint-plugin-react-hooks antes de ejecutar nada (lección 70). Son dos redes distintas, y conviene tener las dos."
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
      "titulo": "Siempre, en proyectos nuevos",
      "texto": "Vite ya lo pone en main.jsx, y Next.js lo activa por defecto con el App Router. Déjalo puesto: no cuesta nada en producción."
    },
    {
      "titulo": "Al poner al día una app antigua",
      "texto": "Si una app de antes de React 18 no lo tenía, actívalo por partes y arregla lo que destape. Es la forma más barata de encontrar los efectos que no aguantan volver a montarse."
    },
    {
      "titulo": "Antes de usar Activity o renderizar en el servidor",
      "texto": "Un componente que supera el ensayo aguanta que <Activity> lo esconda y lo vuelva a mostrar (lección 54) y que React repita sus efectos al hidratar (lección 87)."
    },
    {
      "titulo": "Para juzgar una librería",
      "texto": "Si un componente de terceros falla con StrictMode, también fallará en producción cuando se vuelva a montar. Es motivo para avisar a quien lo mantiene o para buscar otra."
    }
  ]
}
```

## Errores típicos

**Apagar `StrictMode` o poner una bandera para que el efecto «se ejecute una vez».** Es la tentación más habitual al ver dos conexiones, y la lección 38 ya avisaba de ella:

```jsx
const conectadaRef = useRef(false)

useEffect(() => {
  // Mal: esconde el aviso de StrictMode, no el fallo
  if (conectadaRef.current) return
  conectadaRef.current = true
  conectarCamara(sala)
}, [sala])
```

Al cargar, el servidor tiene una sola conexión y parece arreglado. Pero la ref sobrevive al ensayo (el estado y las refs se conservan), así que solo bloquea la repetición; la conexión no se cierra nunca, porque sigue sin haber limpieza; y cuando cambia la sala, la bandera ya está a `true` y la cámara nueva no llega a conectarse. Apagar `StrictMode` deja exactamente los mismos fallos, sin aviso. Es el ejercicio 1.

**Creer que `StrictMode` lo comprueba todo.** A veces la doble llamada no delata el fallo, sino que lo disfraza. En las sesiones del sábado, `Sesiones` quiere enseñar primero la más tardía:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const SESIONES = ['10:00', '12:00', '14:00']\n\nfunction Sesiones({ horas }) {\n  // La más tardía, primero\n  const alReves = horas.reverse()\n\n  return (\n    <ol>\n      {alReves.map((hora) => (\n        <li key={hora}>{hora}</li>\n      ))}\n    </ol>\n  )\n}\n\n// <Sesiones horas={SESIONES} />, con StrictMode.\n// ¿En qué orden salen al cargar?",
  "opciones": [
    "14:00, 12:00 y 10:00, como se quería",
    "10:00, 12:00 y 14:00: parece que reverse no hace nada",
    "Seis sesiones, la lista repetida"
  ],
  "correcta": 1,
  "explicacion": "reverse no devuelve una copia: da la vuelta al array SESIONES y lo devuelve. La primera llamada lo pone al revés y la segunda lo vuelve a dejar como estaba, que es lo que React pinta. Sin StrictMode saldría bien al cargar y cambiaría de orden en cada render. El arreglo es el de la lección 12: horas.toReversed(), que devuelve un array nuevo."
}
```

`StrictMode` no te dice qué está mal: solo hace que el fallo salga antes. Aquí sale de una forma desconcertante, «`reverse` no funciona», y la pista buena es la de siempre: algo que se comporta distinto con y sin `StrictMode` es un render impuro.

**Medir tiempos con `StrictMode` puesto.** Con `StrictMode`, cada render cuenta doble. Comprobado con un `<Profiler>` (lección 65) en React 19.3.1: un componente que tarda 5 ms en renderizarse se midió en unos 6,5 ms sin `StrictMode` y en unos 11 ms con él. Los tiempos de desarrollo sirven para comparar entre sí, no para saber cuánto tardará la app de tus usuarios.

**Activarlo en una parte y esperar el ensayo al cargar.** Como viste con la taquilla, un `<StrictMode>` que no está en la raíz no ensaya los efectos del montaje inicial. Si quieres comprobar los efectos de una sección entera al cargar, el `<StrictMode>` tiene que estar en la raíz.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "StrictMode es el «use strict» de JavaScript",
      "realidad": "No tienen nada que ver. «use strict» cambia cómo se ejecuta el propio JavaScript, por ejemplo prohibiendo variables sin declarar. StrictMode es un componente de React que repite renders, efectos y refs en desarrollo y avisa de APIs obsoletas."
    },
    {
      "mito": "Un efecto con [] se ejecuta una sola vez",
      "realidad": "[] significa que no depende de nada que cambie. Con StrictMode se ejecuta dos veces al montar, y en producción se vuelve a ejecutar cada vez que el componente se monta o que un <Activity> lo vuelve a mostrar."
    },
    {
      "mito": "Si algo se rompe con StrictMode, la culpa es de StrictMode",
      "realidad": "StrictMode no inventa fallos: repite cosas que React ya puede repetir por su cuenta. Lo que se rompe con él se rompe también en producción, solo que más tarde y delante de tus usuarios."
    },
    {
      "mito": "StrictMode hace más lenta la app de mis usuarios",
      "realidad": "Solo actúa en desarrollo. Lo que sí ralentiza es tu entorno de desarrollo: los renders cuentan doble, y por eso los tiempos se miden con cuidado."
    },
    {
      "mito": "Puedo desactivarlo para un componente concreto",
      "realidad": "No hay forma de salir de StrictMode dentro de un árbol que lo tiene. Si una parte no puede con él, hay que bajar el StrictMode para que no la envuelva."
    }
  ]
}
```

## Ejercicios

**1. El monitor del máster.** Alguien «arregló» las dos conexiones del ensayo con una bandera en una ref. Al cargar todo parece correcto, pero cambia de sala, oculta el monitor y vuelve a mostrarlo, y mira el servidor.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Quita la bandera y escribe la limpieza",
  "consigna": "Prueba primero los botones: al cambiar de sala, el servidor sigue con la cámara de la cripta, y cada vez que ocultas y muestras el monitor queda una conexión más. En Monitor.jsx, quita la bandera conectadaRef y haz que el efecto devuelva una función que desconecte la cámara. El registro de efectos debe enseñar la limpieza, y el servidor, una sola conexión de la sala elegida.",
  "archivos": [
    {
      "nombre": "Monitor.jsx",
      "codigo": "import { useEffect, useRef } from 'react'\nimport { conectarCamara } from './camaras'\n\n// Arréglalo: quita la bandera y escribe la limpieza del efecto\nexport default function Monitor({ sala }) {\n  const conectadaRef = useRef(false)\n\n  useEffect(() => {\n    // «Arreglo» para que StrictMode no conecte dos veces\n    if (conectadaRef.current) return\n    conectadaRef.current = true\n    conectarCamara(sala)\n  }, [sala])\n\n  return <p className=\"monitor\">Viendo la cámara de «{sala}»</p>\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState, useSyncExternalStore } from 'react'\nimport Monitor from './Monitor'\nimport { camarasConectadas, conexionesAbiertas, suscribirse } from './camaras'\nimport './estilos.css'\n\nconst SALAS = ['La cripta del abad', 'El laboratorio del doctor Lobo', 'Camarote 13']\n\nexport default function App() {\n  const [sala, setSala] = useState(SALAS[0])\n  const [visible, setVisible] = useState(true)\n  const abiertas = useSyncExternalStore(suscribirse, conexionesAbiertas)\n  const camaras = useSyncExternalStore(suscribirse, camarasConectadas)\n\n  return (\n    <main>\n      <h1>Panel del máster · La Cerradura</h1>\n      <div>\n        {SALAS.map((nombre) => (\n          <button key={nombre} aria-pressed={nombre === sala} onClick={() => setSala(nombre)}>\n            {nombre}\n          </button>\n        ))}\n      </div>\n      <button onClick={() => setVisible(!visible)}>\n        {visible ? 'Ocultar monitor' : 'Mostrar monitor'}\n      </button>\n      {visible && <Monitor sala={sala} />}\n      <section className=\"servidor\" aria-label=\"Servidor de vídeo\">\n        <p>Conexiones abiertas: {abiertas}</p>\n        <p>Cámaras conectadas: {camaras}</p>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "camaras.jsx",
      "codigo": "// Hace de servidor de vídeo de las salas: JavaScript sin React.\nlet conectadas = []\nconst oyentes = new Set()\n\nfunction avisar() {\n  oyentes.forEach((oyente) => oyente())\n}\n\nexport function conectarCamara(sala) {\n  conectadas = [...conectadas, sala]\n  console.log(`Conecto la cámara de «${sala}»`)\n  avisar()\n  return {\n    desconectar() {\n      const posicion = conectadas.indexOf(sala)\n      conectadas = conectadas.filter((_, i) => i !== posicion)\n      console.log(`Desconecto la cámara de «${sala}»`)\n      avisar()\n    },\n  }\n}\n\nexport function suscribirse(oyente) {\n  oyentes.add(oyente)\n  return () => oyentes.delete(oyente)\n}\n\n// Para el panel: cuántas hay abiertas y de qué salas\nexport function conexionesAbiertas() {\n  return conectadas.length\n}\n\nexport function camarasConectadas() {\n  return conectadas.length === 0 ? 'ninguna' : conectadas.join(', ')\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Monitor.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al abrir, solo está conectada la cámara de la cripta",
      "pasos": [],
      "espera": {
        "texto": "Cámaras conectadas: La cripta del abad"
      }
    },
    {
      "descripcion": "Al elegir «Camarote 13», el servidor solo tiene la cámara de esa sala",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Camarote 13"
          }
        }
      ],
      "espera": {
        "texto": "Cámaras conectadas: Camarote 13"
      }
    },
    {
      "descripcion": "Al ocultar el monitor, no queda ninguna cámara conectada",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ocultar monitor"
          }
        }
      ],
      "espera": {
        "texto": "Cámaras conectadas: ninguna"
      }
    },
    {
      "descripcion": "Al ocultar y volver a mostrar el monitor, hay una sola conexión",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ocultar monitor"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mostrar monitor"
          }
        }
      ],
      "espera": {
        "texto": "Conexiones abiertas: 1"
      }
    },
    {
      "descripcion": "Después de cambiar de sala varias veces, sigue habiendo una sola conexión",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Camarote 13"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "El laboratorio del doctor Lobo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "La cripta del abad"
          }
        }
      ],
      "espera": {
        "texto": "Conexiones abiertas: 1"
      }
    }
  ]
}
```

**2. Las opiniones que se repiten.** La lista de opiniones se carga por páginas con «Ver más opiniones», y está dentro de un `<Activity>` para que «Ocultar opiniones» no pierda lo cargado. Al cargar, la primera página sale dos veces. Las comprobaciones usan la API simulada sin latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un efecto que aguante ejecutarse de más",
  "consigna": "Haz que el efecto de Opiniones.jsx dé igual cuántas veces se ejecute: cancela la petición en la limpieza con un AbortController y guarda cada página por su número ({ 1: [...], 2: [...] }) en vez de añadirla al final, para que repetir una petición la sustituya. Calcula la lista y el «Cargando…» a partir de ahí. Prueba también a ocultar y mostrar las opiniones: el Activity vuelve a ejecutar el efecto.",
  "archivos": [
    {
      "nombre": "Opiniones.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Opiniones() {\n  const [pagina, setPagina] = useState(1)\n  const [opiniones, setOpiniones] = useState([])\n  const [total, setTotal] = useState(null)\n  const [cargando, setCargando] = useState(true)\n\n  useEffect(() => {\n    // Pide la página y añade sus opiniones al final de las que ya había.\n    // Arréglalo: que el efecto aguante ejecutarse de más.\n    fetch(`/api/paginas/${pagina}`)\n      .then((res) => res.json())\n      .then((datos) => {\n        setOpiniones((anteriores) => [...anteriores, ...datos.opiniones])\n        setTotal(datos.total)\n        setCargando(false)\n      })\n  }, [pagina])\n\n  function verMas() {\n    setCargando(true)\n    setPagina(pagina + 1)\n  }\n\n  return (\n    <section>\n      <h2>Opiniones de los grupos</h2>\n      <ul>\n        {opiniones.map((opinion) => (\n          <li key={opinion.id}>\n            <strong>{opinion.grupo}</strong> ({opinion.nota}/5): {opinion.texto}\n          </li>\n        ))}\n      </ul>\n      {total !== null && (\n        <p>\n          Mostrando {opiniones.length} de {total} opiniones\n        </p>\n      )}\n      {cargando ? (\n        <p>Cargando opiniones…</p>\n      ) : (\n        opiniones.length < total && <button onClick={verMas}>Ver más opiniones</button>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Activity, useState } from 'react'\nimport Opiniones from './Opiniones'\nimport './estilos.css'\n\nexport default function App() {\n  const [visibles, setVisibles] = useState(true)\n\n  return (\n    <main>\n      <h1>Escape room La Cerradura</h1>\n      <button onClick={() => setVisibles(!visibles)}>\n        {visibles ? 'Ocultar opiniones' : 'Mostrar opiniones'}\n      </button>\n      {/* Esconde la lista sin desmontarla (lección 54) */}\n      <Activity mode={visibles ? 'visible' : 'hidden'}>\n        <Opiniones />\n      </Activity>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #4c1d95;\n  color: white;\n}\n\nli {\n  margin-bottom: 0.25rem;\n}\n\n.monitor {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #a7f3d0;\n  font-family: ui-monospace, monospace;\n}\n\n.servidor {\n  margin-top: 0.75rem;\n  padding: 0 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 6px;\n}\n\n.candado {\n  display: inline-block;\n  min-height: 1.5rem;\n  padding: 0.5rem;\n  border-radius: 8px;\n  background: #78350f;\n}\n\n.ruedas {\n  display: flex;\n  gap: 4px;\n  margin: 2px 0;\n}\n\n.rueda {\n  width: 1.5rem;\n  border-radius: 4px;\n  background: #fef3c7;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-align: center;\n}\n"
    }
  ],
  "archivoInicial": "Opiniones.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "paginas": [
      {
        "id": 1,
        "total": 9,
        "opiniones": [
          {
            "id": 101,
            "grupo": "Los Linces",
            "nota": 5,
            "texto": "El Camarote 13 nos tuvo en vilo hasta el último minuto."
          },
          {
            "id": 102,
            "grupo": "Familia Ortega",
            "nota": 4,
            "texto": "La cripta da un poco de miedo, pero los niños salieron encantados."
          },
          {
            "id": 103,
            "grupo": "Despedida de Sara",
            "nota": 5,
            "texto": "El máster nos dio la pista justa en el momento justo."
          }
        ]
      },
      {
        "id": 2,
        "total": 9,
        "opiniones": [
          {
            "id": 104,
            "grupo": "Club de ajedrez",
            "nota": 3,
            "texto": "El candado de cuatro cifras se nos atragantó."
          },
          {
            "id": 105,
            "grupo": "Las Primas",
            "nota": 5,
            "texto": "Repetiremos con el laboratorio del doctor Lobo."
          },
          {
            "id": 106,
            "grupo": "Oficina 3B",
            "nota": 4,
            "texto": "Buena forma de hacer equipo, aunque salimos con un minuto de retraso."
          }
        ]
      },
      {
        "id": 3,
        "total": 9,
        "opiniones": [
          {
            "id": 107,
            "grupo": "Los del pueblo",
            "nota": 4,
            "texto": "Decorado de cine y acertijos muy variados."
          },
          {
            "id": 108,
            "grupo": "Peña Atlética",
            "nota": 5,
            "texto": "Escapamos con 12 minutos de sobra."
          },
          {
            "id": 109,
            "grupo": "Clase de 4.º B",
            "nota": 4,
            "texto": "Ideal para un grupo de seis."
          }
        ]
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, se ven las 3 opiniones de la primera página, sin repetir",
      "pasos": [],
      "espera": {
        "texto": "Mostrando 3 de 9 opiniones"
      }
    },
    {
      "descripcion": "Al pulsar «Ver más opiniones», se ven 6",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver más opiniones"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 6 de 9 opiniones"
      }
    },
    {
      "descripcion": "Las opiniones de la segunda página aparecen en la lista",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver más opiniones"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Repetiremos con el laboratorio del doctor Lobo."
      }
    },
    {
      "descripcion": "Con dos clics en «Ver más opiniones», se ven las 9",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver más opiniones"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver más opiniones"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 9 de 9 opiniones"
      }
    },
    {
      "descripcion": "Al ocultar y volver a mostrar las opiniones, no se repite ninguna",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ocultar opiniones"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mostrar opiniones"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Opiniones de los grupos"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Escape room La Cerradura"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 3 de 9 opiniones"
      }
    }
  ]
}
```

Si solo añades el `AbortController`, las cuatro primeras comprobaciones pasan, pero la última no: al volver a mostrar la lista, la petición de la página 1 ya había llegado, el efecto se repite y la añade otra vez. **Una limpieza evita que el ensayo deje dos peticiones vivas; que el efecto sea repetible es lo que hace que no importe cuántas veces se ejecute.** Guardar por número de página consigue lo segundo: pedir otra vez la página 1 escribe las mismas tres opiniones en el mismo sitio.

**Retos para seguir practicando** (sin comprobación automática):

1. En el panel de pistas del principio, cambia `ref={registrarSala}` por una flecha escrita en el JSX que haga lo mismo. Pulsa «Pedir pista» y explica por qué ahora la ref se limpia y se vuelve a conectar en cada clic, con `StrictMode` y sin él.
2. En el bloque de la lista de salas sin `StrictMode`, importa `StrictMode` y envuelve solo `<ListaSalas />` dentro de `App`. Comprueba que la sala secreta sale repetida al cargar aunque el bloque tenga `StrictMode` apagado: el render doble no necesita estar en la raíz.
3. Con el ejercicio 2 resuelto, sube la latencia a 2 s, pulsa «Ver más opiniones» y oculta la lista antes de que llegue la respuesta. Mira el panel de red al ocultarla y al volver a mostrarla: ¿qué le pasa a la petición de la página 2, y llega la página al final?
4. Escribe un componente de clase con `UNSAFE_componentWillReceiveProps` dentro de un bloque con `StrictMode`, lee el error de la consola y pásalo a un componente de función (la lección 91 te enseña cómo).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<StrictMode>",
      "descripcion": "La referencia: las cuatro comprobaciones, cómo activarlo en toda la app o en una parte, y un ejemplo de cada fallo que destapa.",
      "url": "https://react.dev/reference/react/StrictMode",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "How to handle the Effect firing twice in development",
      "descripcion": "La sección de Synchronizing with Effects que explica qué hacer con el ensayo según el tipo de efecto: widgets, suscripciones, animaciones, peticiones y analítica.",
      "url": "https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React v18.0: New Strict Mode Behaviors",
      "descripcion": "Por qué React 18 empezó a montar, desmontar y volver a montar cada componente en desarrollo, contado por el equipo de React.",
      "url": "https://react.dev/blog/2022/03/29/react-v18#new-strict-mode-behaviors",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19 Upgrade Guide: StrictMode changes",
      "descripcion": "Los cambios de React 19: refs de callback ensayadas al montar y useMemo y useCallback reutilizados en el segundo render.",
      "url": "https://react.dev/blog/2024/04/25/react-19-upgrade-guide#strict-mode-improvements",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Ref callback",
      "descripcion": "Cómo y cuándo llama React a una ref de callback, la función de limpieza de React 19 y el ciclo de más de StrictMode.",
      "url": "https://react.dev/reference/react-dom/components/common#ref-callback",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "reactStrictMode en Next.js",
      "descripcion": "Cómo se activa y desactiva StrictMode en un framework que llama a createRoot por ti.",
      "url": "https://nextjs.org/docs/app/api-reference/config/next-config-js/reactStrictMode",
      "etiqueta": "Next.js"
    }
  ]
}
```
