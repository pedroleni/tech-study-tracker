# Dónde vive cada estado, y cuándo hace falta una librería (Zustand, Redux Toolkit)

- **Módulo:** Arquitectura de una aplicación
- **Slug:** `donde-vive-cada-estado-y-cuando-hace-falta-una-libreria-zustand-redux-toolkit` (autogenerado del título)
- **Orden:** 750
- **Fuentes:** [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) + [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) + [Zustand](https://zustand.docs.pmnd.rs/) + [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started) — ver `contenido/react/TEMARIO.md` #75

---

## Qué es y para qué sirve

En el módulo 4 viste todas las herramientas que trae React para guardar estado: `useState` y `useReducer` en un componente (lecciones 16 y 27), levantarlo al padre (25) y repartirlo con contexto (28 y 29). En una aplicación real aparecen además preguntas que no son de React: la página que estás viendo, ¿es estado? ¿Y la lista de libros que llega del servidor? ¿Y lo que escribes en un formulario antes de enviarlo? Y tarde o temprano alguien del equipo pregunta: «¿no deberíamos usar Redux?».

Esta lección responde en dos partes:

> **Primero, clasifica el estado: cada tipo tiene su sitio natural, y la mayoría no necesita ninguna librería. Después, si queda estado de cliente que leen muchos componentes y que cambia a menudo, una librería con selectores renderiza solo a quien le afecta cada cambio.**

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Para decidir y para leer código, no un curso de cada librería",
  "contenido": "Zustand y Redux Toolkit se instalan con npm, y los bloques de esta web solo cargan React, así que su código lo verás en bloques anotados: lo suficiente para leerlo en un proyecto y elegir entre ellas. Lo que hacen por dentro sí cabe en la vista previa: un almacén con suscripciones escrito a mano en veinte líneas, con el mismo Hook de React que usan las dos."
}
```

## Un mapa de los tipos de estado

Relatos al oído es una aplicación de audiolibros: un catálogo con buscador, la ficha de cada libro con sus reseñas, un formulario para escribir la tuya, la sesión de quien escucha y un reproductor que sigue sonando aunque cambies de página. Todo eso es «estado» en sentido amplio, pero de seis clases distintas, y cada una tiene su sitio:

- **Local de un componente.** Si un menú está abierto, qué pestaña de la ficha se ve. Solo le importa a un componente: `useState` en ese componente (lección 16).
- **Compartido por unos pocos.** El orden de las reseñas, que eligen unos botones y aplica la lista que tienen al lado. Se levanta a su antepasado común más cercano (lección 25).
- **De toda la aplicación.** Quién ha iniciado sesión, el tema, el reproductor. Lo leen componentes de cualquier parte del árbol. Es el que se discute en esta lección: contexto (lecciones 28 y 29) o una librería.
- **De la URL.** Qué página ves, qué libro está abierto (`/libros/faro`), qué has buscado (`?q=faro`). Vive en la barra de direcciones: sobrevive a una recarga, se comparte con un enlace y el botón Atrás lo deshace. Lo gestiona el router (lecciones 76 y 77).
- **Del servidor.** El catálogo, las reseñas, tus compras. No son tuyos: son **una copia** de datos que viven en otro sitio, y que hay que pedir, guardar en caché, dar por caducados y volver a pedir. Para eso están las librerías de datos como TanStack Query (lección 78).
- **De formularios.** Lo que llevas escrito en la reseña, si un campo es válido, si se está enviando. Inputs controlados (lección 22) y las Actions del módulo 8; en formularios muy grandes, librerías como React Hook Form.

Y hay una séptima clase que en realidad **no es estado**: lo que se calcula a partir de lo anterior, como cuántos libros llevas en la cola o la lista filtrada por la búsqueda. Se calcula al renderizar (lección 24).

Sobre el árbol de la aplicación queda así:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Relatos al oído: cada estado en su sitio",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "URL: /libros/faro?q=faro",
      "nota": "← el router decide qué página se pinta"
    },
    {
      "nombre": "Cabecera",
      "nivel": 1,
      "nota": "← lee la sesión: estado de toda la app"
    },
    {
      "nombre": "MenuCuenta",
      "nivel": 2,
      "etiqueta": "local: menú abierto"
    },
    {
      "nombre": "PaginaLibro",
      "nivel": 1,
      "etiqueta": "servidor: libro y reseñas",
      "nota": "← una caché de datos (lección 78)"
    },
    {
      "nombre": "Pestanas",
      "nivel": 2,
      "etiqueta": "local: pestaña activa"
    },
    {
      "nombre": "ListaCapitulos",
      "nivel": 2,
      "nota": "← lee qué capítulo suena: estado de toda la app"
    },
    {
      "nombre": "FormularioResena",
      "nivel": 2,
      "etiqueta": "formulario: texto y nota"
    },
    {
      "nombre": "Reproductor",
      "nivel": 1,
      "nota": "← sigue sonando al cambiar de página"
    },
    {
      "nombre": "BarraProgreso",
      "nivel": 2,
      "nota": "← lee el segundo: estado de toda la app"
    },
    {
      "nombre": "Controles",
      "nivel": 2,
      "nota": "← cambia el estado del reproductor"
    }
  ]
}
```

Fíjate en que el estado de toda la aplicación es el único que **no tiene un sitio evidente** en el árbol: lo leen `Cabecera`, `ListaCapitulos` y `BarraProgreso`, que cuelgan de ramas distintas. O vive en un proveedor arriba del todo, o vive **fuera de React**, en un almacén. De esa elección trata el resto de la lección.

Antes, una pregunta de clasificar:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Catalogo() {\n  const [busqueda, setBusqueda] = useState('')\n  const visibles = LIBROS.filter((l) => l.titulo.includes(busqueda))\n  // ...\n}\n\n// Piden un cambio: si buscas «faro» y compartes el enlace,\n// quien lo abra tiene que ver la misma búsqueda.\n// Y al pulsar Atrás, volver a la búsqueda anterior.\n// ¿Dónde tiene que vivir el texto de la búsqueda?",
  "opciones": [
    "Donde está: un useState en Catalogo",
    "En un almacén global, para que lo lea cualquiera",
    "En la URL, como ?q=faro",
    "En el servidor, guardado con la cuenta de quien busca"
  ],
  "correcta": 2,
  "explicacion": "Compartirse con un enlace y deshacerse con Atrás son justo lo que da la URL, y nada más lo da: ni un useState ni un almacén sobreviven a abrir el enlace en otro navegador. El componente leerá y cambiará el parámetro q con el router, como un estado más. Lo harás con React Router en la lección 77."
}
```

## Cómo decidir dónde vive un dato

Para cada dato, hazte estas preguntas **en este orden**. La primera que responda que sí manda:

1. **¿Se puede calcular con lo que ya tienes?** Entonces no es estado: calcúlalo al renderizar (lección 24).
2. **¿Viene del servidor?** Es una caché: una librería de datos (lección 78), no un `useState` que rellenas en un efecto ni un almacén global.
3. **¿Tiene que sobrevivir a una recarga, compartirse en un enlace o deshacerse con Atrás?** A la URL (lección 77).
4. **¿Lo usa un solo componente?** `useState` o `useReducer` en ese componente.
5. **¿Lo usan unos pocos componentes cercanos?** Levántalo a su antepasado común (lección 25).
6. **¿Lo usan muchos componentes repartidos por el árbol?** Contexto, con un reductor si cambia de muchas formas (lecciones 28 y 29).
7. **¿Además cambia muy a menudo y lo leen muchos componentes, cada uno solo una parte? ¿Hay que leerlo o cambiarlo desde código que no es de React? ¿Quieres ver cada cambio en una herramienta de depuración?** Ahí empieza a compensar una librería.

Fíjate en lo estrecho que es el último caso cuando se ha pasado por los seis anteriores. Esta misma web es un buen ejemplo: no instala ninguna librería de estado global. Los datos del servidor van con TanStack Query, las rutas con React Router, los formularios con React Hook Form, y lo demás con `useState`, algún contexto y Hooks propios. Lo verás en la lección 86.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Los datos del servidor no son estado global",
  "contenido": "Durante años, mucho código guardó en Redux todo lo que llegaba de la API: una acción al empezar la petición, otra al recibir los datos, otra si fallaba, y a mano la caché, el refresco y las peticiones repetidas. Si lees código así, ya sabes de dónde viene. Hoy eso lo resuelve una librería de datos como TanStack Query (lección 78), o RTK Query en un proyecto que ya usa Redux. Saca del almacén los datos del servidor y lo que queda suele ser muy poco."
}
```

## El límite del contexto: no se puede leer solo una parte

El reproductor de Relatos al oído es estado de toda la aplicación de manual. Con lo que sabes de la lección 29, lo natural es un componente proveedor que guarda el estado y un contexto que lo reparte. Lo leen cuatro componentes, y cada uno usa **una parte distinta**: la cabecera y la lista, el capítulo; la barra, el segundo; los controles, la velocidad.

En un reproductor de verdad, el segundo cambia sin parar: el evento `timeupdate` del elemento `<audio>` salta varias veces por segundo (MDN habla de entre 4 y 66). En la lección 29 viste lo que cuesta eso con un contexto: **cada cambio renderiza a todos sus lectores**. ¿Y si cada componente eligiera la parte que lee? Este Hook recibe un selector, con la misma forma que el de Zustand:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const ReproductorContext = createContext(null)\n\nexport function useReproductor(selector) {\n  return selector(useContext(ReproductorContext))\n}\n\nfunction Controles() {\n  const velocidad = useReproductor((e) => e.velocidad)\n  return <button>Velocidad {velocidad}×</button>\n}\n\n// Pulsas «Avanzar 15 s»: cambia segundo; velocidad sigue en 1.\n// ¿Se vuelve a renderizar Controles?",
  "opciones": [
    "No: su selector devuelve la misma velocidad que antes",
    "Sí: lee el contexto, y el valor del contexto ha cambiado",
    "Solo si Controles está envuelto en memo"
  ],
  "correcta": 1,
  "explicacion": "El selector se ejecuta después de useContext, dentro del render. React decide a quién renderizar comparando el valor del contexto entero con Object.is, sin saber qué parte usa cada uno. El selector filtra lo que el componente ve, no cuándo se renderiza. Y memo tampoco frena un contexto, como viste en la lección 29."
}
```

Compruébalo. `Paneles.jsx` tiene los cuatro componentes, cada uno con su selector; `reproductor.jsx`, el proveedor y el Hook de arriba. Debajo de la vista previa tienes el panel «Árbol de renders»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El reproductor con contexto: un selector que no selecciona",
  "consigna": "Pulsa «Avanzar 15 s» y cuenta en el árbol los componentes que se renderizan. Después pulsa «Velocidad 1×» y compara: ¿cambia la lista de quién se renderiza? Lee también el resumen de arriba del panel: cuántos renderizados y cuántos cambios en el DOM.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ProveedorReproductor } from './reproductor'\nimport { Cabecera, ListaCapitulos, BarraProgreso, Controles } from './Paneles'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <ProveedorReproductor>\n      <main>\n        <Cabecera />\n        <ListaCapitulos />\n        <BarraProgreso />\n        <Controles />\n      </main>\n    </ProveedorReproductor>\n  )\n}\n"
    },
    {
      "nombre": "reproductor.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst ReproductorContext = createContext(null)\nReproductorContext.displayName = 'Reproductor'\n\nexport function ProveedorReproductor({ children }) {\n  const [estado, setEstado] = useState({ capitulo: 1, segundo: 0, velocidad: 1 })\n\n  const valor = {\n    ...estado,\n    avanzar: (segundos) =>\n      setEstado((e) => ({ ...e, segundo: Math.max(0, e.segundo + segundos) })),\n    elegirCapitulo: (capitulo) => setEstado((e) => ({ ...e, capitulo, segundo: 0 })),\n    cambiarVelocidad: () =>\n      setEstado((e) => ({ ...e, velocidad: e.velocidad === 2 ? 1 : e.velocidad + 0.5 })),\n  }\n\n  return <ReproductorContext value={valor}>{children}</ReproductorContext>\n}\n\n// La misma forma que el Hook de Zustand: recibe un selector\nexport function useReproductor(selector) {\n  return selector(useContext(ReproductorContext))\n}\n"
    },
    {
      "nombre": "Paneles.jsx",
      "codigo": "import { useReproductor } from './reproductor'\n\nexport const CAPITULOS = [\n  { numero: 1, titulo: 'La tormenta' },\n  { numero: 2, titulo: 'El farero' },\n  { numero: 3, titulo: 'La carta' },\n  { numero: 4, titulo: 'Bajamar' },\n]\n\nexport function Cabecera() {\n  const capitulo = useReproductor((e) => e.capitulo)\n  return (\n    <header className=\"cabecera\">\n      <h1>El faro de Cabo Gris</h1>\n      <p>Capítulo {capitulo} de {CAPITULOS.length}</p>\n    </header>\n  )\n}\n\nfunction FilaCapitulo({ capitulo, actual, onElegir }) {\n  return (\n    <li>\n      <button aria-current={actual ? 'true' : undefined} onClick={onElegir}>\n        {capitulo.numero}. {capitulo.titulo}\n      </button>\n    </li>\n  )\n}\n\nexport function ListaCapitulos() {\n  const actual = useReproductor((e) => e.capitulo)\n  const elegirCapitulo = useReproductor((e) => e.elegirCapitulo)\n  return (\n    <ol className=\"capitulos\" aria-label=\"Capítulos\">\n      {CAPITULOS.map((c) => (\n        <FilaCapitulo\n          key={c.numero}\n          capitulo={c}\n          actual={c.numero === actual}\n          onElegir={() => elegirCapitulo(c.numero)}\n        />\n      ))}\n    </ol>\n  )\n}\n\nexport function BarraProgreso() {\n  const segundo = useReproductor((e) => e.segundo)\n  const minutos = Math.floor(segundo / 60)\n  const segundos = String(segundo % 60).padStart(2, '0')\n  return (\n    <p className=\"progreso\">\n      <progress max={600} value={segundo} aria-label=\"Progreso del capítulo\" />\n      {minutos}:{segundos} de 10:00\n    </p>\n  )\n}\n\nexport function Controles() {\n  const avanzar = useReproductor((e) => e.avanzar)\n  const velocidad = useReproductor((e) => e.velocidad)\n  const cambiarVelocidad = useReproductor((e) => e.cambiarVelocidad)\n  return (\n    <div className=\"controles\">\n      <button onClick={() => avanzar(-15)}>Retroceder 15 s</button>\n      <button onClick={() => avanzar(15)}>Avanzar 15 s</button>\n      <button onClick={cambiarVelocidad}>Velocidad {velocidad}×</button>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0.6rem;\n  color: #57534e;\n}\n\n.capitulos {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0 0 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.capitulos button {\n  width: 100%;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n  background: #ffffff;\n  font: inherit;\n  text-align: left;\n}\n\n.capitulos button[aria-current='true'] {\n  border-color: #7c3aed;\n  background: #f5f3ff;\n  font-weight: 600;\n}\n\n.progreso {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.progreso progress {\n  flex: 1;\n}\n\n.controles {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\n.controles button {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "reproductor.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Con cada botón, el árbol cuenta lo mismo:

- `ProveedorReproductor`: «cambió su estado». Y el nodo **Reproductor**, con la insignia «proveedor»: «cambió la prop «value» (objeto nuevo)».
- `Cabecera`, `ListaCapitulos`, `BarraProgreso` y `Controles`: **«cambió el contexto «Reproductor»»**, los cuatro, usen o no lo que ha cambiado.
- Las cuatro `FilaCapitulo`: «cambió la prop «onElegir» (función nueva)». No leen el contexto, pero su padre se ha renderizado y les ha creado funciones nuevas.
- `App`, sin cambios: el proveedor recibe a los demás como `children`, el truco de la lección 28.

Diez renderizados para cambiar **dos** cosas en el DOM: el valor de la barra y el texto del tiempo. Con un clic no se nota. Con un `timeupdate` cuatro veces por segundo y una aplicación con cientos de componentes leyendo el reproductor, sí.

Dentro de React hay un remedio, el de la lección 29: partir el contexto, uno para el capítulo, otro para el segundo, otro para la velocidad. Funciona, pero cada parte que alguien quiera leer por separado pide su propio contexto y su propio proveedor. Lo que de verdad hace falta es que **cada componente se suscriba solo a su parte**. Eso es un selector de verdad, y es lo que React no da con el contexto.

## Un almacén fuera de React, con suscripciones

La idea de Zustand y de Redux es sacar el estado de React. El estado vive en una variable normal de JavaScript, dentro de un módulo; los componentes se **suscriben** a ella, y cuando cambia, el almacén avisa a todos los suscritos. Cada uno vuelve a pasar su selector por el estado nuevo, y **solo se renderiza si lo que ha seleccionado es distinto**.

Para conectar un componente con algo que vive fuera de React, React tiene un Hook: `useSyncExternalStore`. Lo verás a fondo en la lección 46; aquí basta con su forma: recibe una función para **suscribirse** y otra que **lee el valor actual**, y vuelve a renderizar el componente cuando ese valor cambia, comparando con `Object.is`. Con él, un almacén cabe en veinte líneas:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useSyncExternalStore } from 'react'\n\n// Un almacén mínimo con la forma de Zustand: el estado vive fuera\n// de React y cada componente se suscribe con un selector.\nexport function crearAlmacen(crearEstado) {\n  let estado\n  const oyentes = new Set()\n\n  function get() {\n    return estado\n  }\n\n  function set(cambio) {\n    const parcial = typeof cambio === 'function' ? cambio(estado) : cambio\n    estado = { ...estado, ...parcial }\n    oyentes.forEach((oyente) => oyente())\n  }\n\n  function subscribe(oyente) {\n    oyentes.add(oyente)\n    return () => oyentes.delete(oyente)\n  }\n\n  estado = crearEstado(set, get)\n\n  return function useAlmacen(selector) {\n    return useSyncExternalStore(subscribe, () => selector(estado))\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "let estado\n  const oyentes = new Set()",
      "nota": "El estado no está en ningún useState: es una variable del módulo, fuera de cualquier componente. Por eso no hace falta un proveedor, y por eso se puede leer y cambiar desde código que no es de React, como un temporizador."
    },
    {
      "fragmento": "estado = { ...estado, ...parcial }",
      "nota": "Cada cambio crea un objeto nuevo y mezcla en él lo que cambia, como hace Zustand con set. Nunca se modifica el objeto anterior: si lo hiciera, React compararía el mismo objeto consigo mismo y no vería el cambio (lección 20)."
    },
    {
      "fragmento": "oyentes.forEach((oyente) => oyente())",
      "nota": "Después de cada cambio, el almacén avisa a todos los suscritos. No sabe quién usa qué: eso lo decide cada componente con su selector."
    },
    {
      "fragmento": "return () => oyentes.delete(oyente)",
      "nota": "subscribe devuelve la función para darse de baja. React la llama cuando el componente se desmonta, así que ningún componente desmontado sigue recibiendo avisos."
    },
    {
      "fragmento": "estado = crearEstado(set, get)",
      "nota": "El estado inicial lo escribe quien crea el almacén, y recibe set para definir las acciones dentro, junto a los datos. Es el mismo contrato que create de Zustand."
    },
    {
      "fragmento": "useSyncExternalStore(subscribe, () => selector(estado))",
      "nota": "El segundo argumento lee el valor actual: aquí, lo que devuelve el selector. Cuando el almacén avisa, React lo vuelve a llamar y lo compara con el anterior. Si el selector da lo mismo, el componente no se renderiza."
    }
  ]
}
```

Y el reproductor, definido con él. Es el mismo estado de antes, con las acciones dentro:

```jsx
import { crearAlmacen } from './almacen'

export const useReproductor = crearAlmacen((set) => ({
  capitulo: 1,
  segundo: 0,
  velocidad: 1,
  avanzar: (segundos) => set((e) => ({ segundo: Math.max(0, e.segundo + segundos) })),
  elegirCapitulo: (capitulo) => set({ capitulo, segundo: 0 }),
  cambiarVelocidad: () => set((e) => ({ velocidad: e.velocidad === 2 ? 1 : e.velocidad + 0.5 })),
}))
```

En el bloque siguiente, `Paneles.jsx` es **idéntico** al del bloque anterior, letra por letra. Solo han cambiado `reproductor.jsx`, que ahora usa el almacén, y `App.jsx`, que ya no necesita proveedor.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El mismo reproductor, con un almacén y selectores",
  "consigna": "Haz los mismos clics que antes: «Avanzar 15 s» y «Velocidad 1×». Después elige «2. El farero». Compara cada vez el árbol con el del bloque anterior.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Cabecera, ListaCapitulos, BarraProgreso, Controles } from './Paneles'\nimport './estilos.css'\n\n// Sin proveedor: cada componente importa el Hook del almacén\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <ListaCapitulos />\n      <BarraProgreso />\n      <Controles />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "almacen.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\n\n// Un almacén mínimo con la forma de Zustand: el estado vive fuera\n// de React y cada componente se suscribe con un selector.\nexport function crearAlmacen(crearEstado) {\n  let estado\n  const oyentes = new Set()\n\n  function get() {\n    return estado\n  }\n\n  function set(cambio) {\n    const parcial = typeof cambio === 'function' ? cambio(estado) : cambio\n    estado = { ...estado, ...parcial }\n    oyentes.forEach((oyente) => oyente())\n  }\n\n  function subscribe(oyente) {\n    oyentes.add(oyente)\n    return () => oyentes.delete(oyente)\n  }\n\n  estado = crearEstado(set, get)\n\n  return function useAlmacen(selector) {\n    return useSyncExternalStore(subscribe, () => selector(estado))\n  }\n}\n"
    },
    {
      "nombre": "reproductor.jsx",
      "codigo": "import { crearAlmacen } from './almacen'\n\nexport const useReproductor = crearAlmacen((set) => ({\n  capitulo: 1,\n  segundo: 0,\n  velocidad: 1,\n  avanzar: (segundos) => set((e) => ({ segundo: Math.max(0, e.segundo + segundos) })),\n  elegirCapitulo: (capitulo) => set({ capitulo, segundo: 0 }),\n  cambiarVelocidad: () => set((e) => ({ velocidad: e.velocidad === 2 ? 1 : e.velocidad + 0.5 })),\n}))\n"
    },
    {
      "nombre": "Paneles.jsx",
      "codigo": "import { useReproductor } from './reproductor'\n\nexport const CAPITULOS = [\n  { numero: 1, titulo: 'La tormenta' },\n  { numero: 2, titulo: 'El farero' },\n  { numero: 3, titulo: 'La carta' },\n  { numero: 4, titulo: 'Bajamar' },\n]\n\nexport function Cabecera() {\n  const capitulo = useReproductor((e) => e.capitulo)\n  return (\n    <header className=\"cabecera\">\n      <h1>El faro de Cabo Gris</h1>\n      <p>Capítulo {capitulo} de {CAPITULOS.length}</p>\n    </header>\n  )\n}\n\nfunction FilaCapitulo({ capitulo, actual, onElegir }) {\n  return (\n    <li>\n      <button aria-current={actual ? 'true' : undefined} onClick={onElegir}>\n        {capitulo.numero}. {capitulo.titulo}\n      </button>\n    </li>\n  )\n}\n\nexport function ListaCapitulos() {\n  const actual = useReproductor((e) => e.capitulo)\n  const elegirCapitulo = useReproductor((e) => e.elegirCapitulo)\n  return (\n    <ol className=\"capitulos\" aria-label=\"Capítulos\">\n      {CAPITULOS.map((c) => (\n        <FilaCapitulo\n          key={c.numero}\n          capitulo={c}\n          actual={c.numero === actual}\n          onElegir={() => elegirCapitulo(c.numero)}\n        />\n      ))}\n    </ol>\n  )\n}\n\nexport function BarraProgreso() {\n  const segundo = useReproductor((e) => e.segundo)\n  const minutos = Math.floor(segundo / 60)\n  const segundos = String(segundo % 60).padStart(2, '0')\n  return (\n    <p className=\"progreso\">\n      <progress max={600} value={segundo} aria-label=\"Progreso del capítulo\" />\n      {minutos}:{segundos} de 10:00\n    </p>\n  )\n}\n\nexport function Controles() {\n  const avanzar = useReproductor((e) => e.avanzar)\n  const velocidad = useReproductor((e) => e.velocidad)\n  const cambiarVelocidad = useReproductor((e) => e.cambiarVelocidad)\n  return (\n    <div className=\"controles\">\n      <button onClick={() => avanzar(-15)}>Retroceder 15 s</button>\n      <button onClick={() => avanzar(15)}>Avanzar 15 s</button>\n      <button onClick={cambiarVelocidad}>Velocidad {velocidad}×</button>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0.2rem 0 0.6rem;\n  color: #57534e;\n}\n\n.capitulos {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0 0 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.capitulos button {\n  width: 100%;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n  background: #ffffff;\n  font: inherit;\n  text-align: left;\n}\n\n.capitulos button[aria-current='true'] {\n  border-color: #7c3aed;\n  background: #f5f3ff;\n  font-weight: 600;\n}\n\n.progreso {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.progreso progress {\n  flex: 1;\n}\n\n.controles {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n}\n\n.controles button {\n  padding: 0.35rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "almacen.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Ahora cada clic mueve solo a quien le afecta:

- **«Avanzar 15 s»**: solo `BarraProgreso`. El panel lo explica con «cambió otro de sus ganchos»: el render no viene de un `useState`, sino de `useSyncExternalStore`, que el panel no sabe nombrar. Todo lo demás, sin cambios.
- **«Velocidad 1×»**: solo `Controles`, que es el único que selecciona `velocidad`.
- **«2. El farero»**: `Cabecera` y `ListaCapitulos`, que seleccionan el capítulo, y, si habías avanzado, `BarraProgreso`, porque el segundo vuelve a 0. Las filas de la lista también, porque su padre les crea funciones nuevas en cada render (evitarlo pide `memo` y, además, que esas funciones no cambien: lección 67).

> **Con un almacén externo, React no renderiza a «todos los lectores del estado», sino a cada componente cuya parte seleccionada ha cambiado.**

Esto no es una imitación: es literalmente lo que hacen las librerías. El Hook que crea Zustand 5 llama a `useSyncExternalStore` con su `subscribe` y con `() => selector(getState())`, como el tuyo. El `useSelector` de React Redux se apoya en el mismo Hook. Cuando React 18 lo presentó, su anuncio lo describía como el Hook recomendado para cualquier librería que se integre con estado de fuera de React. Y su referencia pide usar el estado de React siempre que se pueda: este Hook es para conectar con código que no es de React. Por eso, para el estado de tu aplicación, no escribes tu propio almacén: instalas la librería que ya lo ha escrito, con sus casos raros resueltos.

El precio de sacar el estado de React también conviene conocerlo:

- **Es uno para toda la aplicación.** Un almacén de módulo es único: no puedes tener dos reproductores con su propio estado, como sí podías con dos proveedores (lección 28).
- **No se reinicia solo.** El estado de un componente desaparece al desmontarlo (lección 26); el de un almacén sigue ahí. Entre una prueba y otra, o al cerrar la sesión, hay que reiniciarlo a mano.
- **En el servidor se compartiría entre peticiones.** Por eso la guía de Zustand para Next.js pide crear un almacén por petición en vez de uno global (módulo 13).

## Selectores: pide lo justo, y siempre lo mismo

Un selector decide **cuándo** se renderiza el componente, así que merece cuidado:

- **Selecciona lo mínimo que pintas.** `(e) => e.segundo`, no `(e) => e`. Si seleccionas el estado entero, como cada cambio crea un objeto nuevo, el componente se renderiza con cualquier cambio: vuelves al problema del contexto.
- **Calcular a partir del estado está bien si el resultado es un valor simple.** `(e) => e.libros.length` o `(e) => e.segundo > 300` devuelven un número o un booleano, y dos números iguales son iguales para `Object.is`.
- **No construyas objetos ni arrays nuevos en el selector.** `(e) => ({ velocidad: e.velocidad })` devuelve un objeto distinto en cada llamada, aunque el contenido sea el mismo. Lo verás romperse en los errores típicos. Para leer varias cosas, una llamada por valor, como hace `Controles`.
- **Las acciones también se seleccionan**, y como son siempre la misma función, nunca provocan un render.

## Zustand: el mismo almacén, ya hecho

[Zustand](https://zustand.docs.pmnd.rs/) se presenta como una solución de estado «pequeña, rápida y escalable», y su documentación lo resume en una frase: **el almacén es un Hook**. Lo creas con `create`, lo importas donde quieras y lo lees con un selector, sin proveedores. Si comparas este código con el `reproductor.jsx` del bloque anterior, solo cambian el `import` y `crearAlmacen` por `create`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// reproductor.js\nimport { create } from 'zustand'\n\nexport const useReproductor = create((set) => ({\n  capitulo: 1,\n  segundo: 0,\n  velocidad: 1,\n  avanzar: (segundos) => set((e) => ({ segundo: Math.max(0, e.segundo + segundos) })),\n  elegirCapitulo: (capitulo) => set({ capitulo, segundo: 0 }),\n  cambiarVelocidad: () => set((e) => ({ velocidad: e.velocidad === 2 ? 1 : e.velocidad + 0.5 })),\n}))\n\n// BarraProgreso.jsx\nimport { useReproductor } from './reproductor'\n\nexport function BarraProgreso() {\n  const segundo = useReproductor((e) => e.segundo)\n  // ...\n}\n\n// Controles.jsx: varias cosas a la vez, con useShallow\nimport { useShallow } from 'zustand/react/shallow'\n\nexport function Controles() {\n  const { velocidad, cambiarVelocidad } = useReproductor(\n    useShallow((e) => ({ velocidad: e.velocidad, cambiarVelocidad: e.cambiarVelocidad })),\n  )\n  // ...\n}\n\n// Fuera de React: un temporizador, un WebSocket, una prueba\nuseReproductor.getState().avanzar(1)",
  "anotaciones": [
    {
      "fragmento": "import { create } from 'zustand'",
      "nota": "Se instala con npm install zustand. La versión actual es la 5, que pide React 18 o posterior porque se apoya en useSyncExternalStore."
    },
    {
      "fragmento": "set((e) => ({ segundo: Math.max(0, e.segundo + segundos) }))",
      "nota": "set mezcla lo que le das con el estado actual, en el primer nivel, igual que tu crearAlmacen: no hace falta copiar capitulo ni velocidad. En objetos anidados sí tienes que copiar tú (lección 20), o usar su middleware de Immer."
    },
    {
      "fragmento": "const segundo = useReproductor((e) => e.segundo)",
      "nota": "El mismo selector que en Paneles.jsx. El componente se renderiza solo cuando cambia segundo."
    },
    {
      "fragmento": "useShallow((e) => ({ velocidad: e.velocidad, cambiarVelocidad: e.cambiarVelocidad }))",
      "nota": "Un selector que construye un objeto da uno nuevo en cada llamada. useShallow lo compara propiedad a propiedad con el anterior y, si todas coinciden, devuelve el de antes. Sin él, Zustand 5 entra en el bucle de renders que verás en los errores típicos."
    },
    {
      "fragmento": "useReproductor.getState().avanzar(1)",
      "nota": "El Hook trae pegados getState, setState y subscribe. Como el estado vive fuera de React, cualquier código lo puede leer o cambiar, y los componentes suscritos se enteran. Es lo que haría el evento timeupdate de un audio."
    }
  ]
}
```

Además del núcleo, Zustand trae **middlewares** que envuelven la función de `create`: `persist` guarda el estado en `localStorage` y lo recupera al recargar, `devtools` conecta el almacén con la extensión Redux DevTools del navegador para ver cada cambio, e `immer` deja escribir las actualizaciones «mutando», como verás ahora con Redux.

## Redux Toolkit: acciones y reductores para toda la aplicación

Redux es el veterano: de 2015, y presente en una enorme cantidad de aplicaciones de empresa. Su idea es la del reductor de la lección 27 llevada a toda la aplicación: **un único almacén** fuera de React, **acciones** que cuentan qué ha pasado y **reductores puros** que calculan el estado siguiente. Redux Toolkit (RTK) es la forma oficial de escribirlo hoy: su documentación lo presenta como «la forma estándar de escribir lógica de Redux».

El reproductor, en RTK, se reparte en tres archivos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// reproductorSlice.js\nimport { createSlice } from '@reduxjs/toolkit'\n\nconst reproductorSlice = createSlice({\n  name: 'reproductor',\n  initialState: { capitulo: 1, segundo: 0, velocidad: 1 },\n  reducers: {\n    avanzado(estado, accion) {\n      estado.segundo = Math.max(0, estado.segundo + accion.payload)\n    },\n    capituloElegido(estado, accion) {\n      estado.capitulo = accion.payload\n      estado.segundo = 0\n    },\n    velocidadCambiada(estado) {\n      estado.velocidad = estado.velocidad === 2 ? 1 : estado.velocidad + 0.5\n    },\n  },\n})\n\nexport const { avanzado, capituloElegido, velocidadCambiada } = reproductorSlice.actions\nexport default reproductorSlice.reducer\n\n// store.js\nimport { configureStore } from '@reduxjs/toolkit'\nimport reproductorReducer from './reproductorSlice'\n\nexport const store = configureStore({\n  reducer: { reproductor: reproductorReducer },\n})\n\n// main.jsx\nimport { createRoot } from 'react-dom/client'\nimport { Provider } from 'react-redux'\nimport { store } from './store'\n\ncreateRoot(document.getElementById('root')).render(\n  <Provider store={store}>\n    <App />\n  </Provider>,\n)\n\n// Controles.jsx\nimport { useDispatch, useSelector } from 'react-redux'\nimport { avanzado } from './reproductorSlice'\n\nexport function Controles() {\n  const velocidad = useSelector((estado) => estado.reproductor.velocidad)\n  const dispatch = useDispatch()\n  return <button onClick={() => dispatch(avanzado(15))}>Avanzar 15 s</button>\n}",
  "anotaciones": [
    {
      "fragmento": "name: 'reproductor',",
      "nota": "Un slice es una porción del estado con sus reductores, normalmente uno por funcionalidad. El nombre se antepone a cada tipo de acción: avanzado(15) crea { type: \"reproductor/avanzado\", payload: 15 }. createSlice te genera esas funciones, que en el Redux clásico se escribían a mano."
    },
    {
      "fragmento": "avanzado(estado, accion) {\n      estado.segundo = Math.max(0, estado.segundo + accion.payload)",
      "nota": "Parece que muta, pero createSlice usa Immer, la librería de la lección 20: estado es un borrador, y con lo que cambias se construye un objeto nuevo. El estado anterior queda intacto. Lo que no puedes es modificar el borrador y además devolver otro objeto: Immer lanza un error."
    },
    {
      "fragmento": "avanzado(estado, accion)",
      "nota": "Las acciones, en participio, como en la lección 27: cuentan lo que ha pasado. La guía de estilo de Redux recomienda lo mismo, modelarlas como eventos y no como setters."
    },
    {
      "fragmento": "reducer: { reproductor: reproductorReducer },",
      "nota": "configureStore junta los slices en un solo estado, cada uno bajo su clave: el segundo está en estado.reproductor.segundo. Además conecta por sí mismo la extensión Redux DevTools, que enseña cada acción despachada y cómo cambió el estado."
    },
    {
      "fragmento": "<Provider store={store}>",
      "nota": "Redux sí usa un proveedor, pero lo que reparte por contexto es el almacén, un objeto que no cambia nunca. El estado no viaja por el contexto, así que no hay renders en cascada: cada componente se suscribe por su cuenta."
    },
    {
      "fragmento": "useSelector((estado) => estado.reproductor.velocidad)",
      "nota": "El selector de siempre. useSelector se apoya en useSyncExternalStore y renderiza el componente solo si lo seleccionado cambia."
    },
    {
      "fragmento": "dispatch(avanzado(15))",
      "nota": "Como el dispatch de useReducer, pero el reductor está en el almacén. La acción pasa por los reductores, el estado cambia y se avisa a los suscritos."
    }
  ]
}
```

Lo que RTK añade sobre esto es, sobre todo, para aplicaciones grandes: `createEntityAdapter` guarda listas normalizadas con la forma `{ ids, entities }` que viste en la lección 24; `createAsyncThunk` organiza la lógica asíncrona; y **RTK Query** resuelve los datos del servidor, la misma tarea que TanStack Query (lección 78).

Si lees código Redux anterior a Toolkit, lo reconocerás por las constantes de tipos en mayúsculas (`'AVANZAR'`), los reductores con `switch` que copian el estado a mano y `connect(mapStateToProps)` en lugar de `useSelector`. La idea es la misma; solo había más código que escribir.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Cómo se llegó a las dos librerías de hoy",
  "items": [
    {
      "fecha": "Agosto de 2015",
      "titulo": "Redux 1.0",
      "texto": "Un único almacén, acciones y reductores puros. Con react-redux, los componentes se conectaban al almacén con connect."
    },
    {
      "fecha": "Junio de 2019",
      "titulo": "React Redux 7.1 estrena hooks",
      "texto": "useSelector y useDispatch sustituyen a connect en el código nuevo."
    },
    {
      "fecha": "Junio de 2019",
      "titulo": "Zustand 1.0",
      "texto": "Un almacén que es un Hook, sin proveedores ni acciones con tipo."
    },
    {
      "fecha": "Noviembre de 2019",
      "titulo": "Redux Toolkit",
      "texto": "Redux Starter Kit cambia de nombre y se convierte en el paquete oficial @reduxjs/toolkit: createSlice, configureStore e Immer de serie."
    },
    {
      "fecha": "Junio de 2021",
      "titulo": "RTK Query",
      "texto": "Redux Toolkit 1.6 añade su propia solución para pedir y guardar en caché los datos del servidor."
    },
    {
      "fecha": "Marzo de 2022",
      "titulo": "React 18 y useSyncExternalStore",
      "texto": "React publica el Hook para que las librerías de estado externo funcionen bien con el renderizado concurrente."
    },
    {
      "fecha": "Diciembre de 2023",
      "titulo": "Redux 5, React Redux 9 y RTK 2",
      "texto": "Las tres versiones mayores se publican el mismo día, el 4 de diciembre, y desde entonces avanzan juntas."
    },
    {
      "fecha": "Octubre de 2024",
      "titulo": "Zustand 5",
      "texto": "Exige React 18, usa el useSyncExternalStore de React y pide selectores que devuelvan valores estables."
    }
  ]
}
```

## Cuándo lo usarías de verdad

La documentación de Redux es la primera en decir que no todas las aplicaciones lo necesitan. Recoge una frase de Dan Abramov, uno de sus creadores: *«no uses Redux hasta que tengas problemas con React a secas»*. Y enumera cuándo resulta más útil. Son criterios que valen igual para Zustand:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Mucho estado que se necesita en muchos sitios",
      "texto": "No un tema o una sesión, que un contexto lleva sin esfuerzo, sino bastante estado de cliente que leen pantallas y componentes muy distintos: un editor con lienzo, capas y panel de propiedades; un reproductor; un panel de control."
    },
    {
      "titulo": "Estado que cambia a menudo",
      "texto": "La posición de un audio, el cursor en un editor colaborativo, datos que llegan por un WebSocket varias veces por segundo. Aquí es donde los selectores marcan la diferencia que viste en el árbol. El proyecto 94 lo hace con useSyncExternalStore sobre un WebSocket."
    },
    {
      "titulo": "Lógica de actualización compleja",
      "texto": "Muchas acciones que se cruzan, deshacer y rehacer, reglas que dependen de varias partes del estado. Un reductor ya ordena eso (lección 27); una librería lo saca del árbol de componentes."
    },
    {
      "titulo": "Mucho código y mucha gente",
      "texto": "En una aplicación mediana o grande en la que trabajan muchas personas, unas convenciones fijas (slices, acciones como eventos) evitan que cada cual organice el estado a su manera."
    },
    {
      "titulo": "Ver cómo cambia el estado con el tiempo",
      "texto": "Qué acción llegó, en qué orden y qué cambió cada una. Las Redux DevTools lo enseñan acción por acción y dejan volver a un estado anterior. Con un estado repartido por cien useState, esa pregunta es mucho más difícil de responder."
    }
  ]
}
```

Y hay un motivo más para conocerlas, aunque no las elijas tú: **las vas a leer**. Redux lleva una década en aplicaciones de empresa, y Zustand está en muchos proyectos nuevos; las dos se descargan más de cien millones de veces al mes en npm.

### Zustand o Redux Toolkit

Si has llegado hasta aquí y una librería compensa, la elección entre las dos habituales suele decidirse por estas diferencias:

- **Cuánto hay que escribir.** Zustand: un archivo con un `create`. RTK: slices, un almacén, un proveedor y más conceptos (acciones, reductores, middleware, thunks).
- **Proveedor.** Zustand no lo necesita; RTK lleva uno arriba del todo.
- **Cuánta estructura impone.** Zustand deja hacer: las acciones son funciones dentro del almacén, como prefieras. RTK fija una forma (acciones como eventos, reductores puros, slices por funcionalidad), que se nota cuando trabajan muchas personas en el mismo código.
- **Depuración.** Las dos con la extensión Redux DevTools; Zustand, a través de su middleware `devtools`.
- **Datos del servidor.** RTK trae RTK Query. Con Zustand, una librería aparte como TanStack Query.

Hay más librerías de estado (Jotai, MobX, Valtio...), con otras ideas, pero estas dos son las que más te vas a encontrar.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Toda aplicación de React seria necesita Redux",
      "realidad": "La propia documentación de Redux dice que no. Con los datos del servidor en una librería de datos, la URL en el router y los formularios en sus componentes, muchas aplicaciones grandes se quedan sin nada que meter en un almacén global. Esta misma web no usa ninguno."
    },
    {
      "mito": "El contexto es lento y hay que cambiarlo por Zustand",
      "realidad": "El contexto renderiza a todos sus lectores cuando cambia su valor. Para algo que cambia poco, como el tema, la sesión o el idioma, eso no cuesta nada y es la herramienta adecuada. El problema aparece con estado que cambia a menudo y que leen muchos componentes, cada uno una parte."
    },
    {
      "mito": "Con una librería de estado ya no hace falta useState",
      "realidad": "Lo local sigue siendo local: si un menú está abierto o lo que llevas escrito en un campo no le importa al resto de la aplicación. Meterlo en el almacén solo lo hace más difícil de seguir y de reiniciar."
    },
    {
      "mito": "Un almacén global evita los renders innecesarios por sí solo",
      "realidad": "Los evita el selector. Si seleccionas el estado entero, o construyes un objeto nuevo en el selector, el componente se renderiza con cualquier cambio, como con un contexto, o peor."
    },
    {
      "mito": "Redux es muchísimo código repetido",
      "realidad": "Lo era el Redux clásico: constantes de tipos, creadores de acciones y reductores con copias a mano. Con Redux Toolkit, createSlice genera las acciones e Immer se encarga de las copias."
    },
    {
      "mito": "Reducer más contexto es lo mismo que Redux",
      "realidad": "Comparten la idea de acciones y reductor. Pero Redux guarda el estado fuera de React y cada componente se suscribe a su parte con un selector; con contexto, cada cambio llega a todos los lectores. Es la diferencia que has visto en el árbol."
    }
  ]
}
```

## Errores típicos

**Un selector que construye un objeto.** Es el error más traicionero, porque con `useContext` no pasaba nada malo. `Controles` quiere dos cosas del almacén y las pide juntas en un objeto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un selector que devuelve un objeto nuevo en cada llamada",
  "consigna": "La vista previa no llega a pintarse: lee el error y la consola. Después arréglalo en App.jsx con dos llamadas, una para velocidad y otra para cambiarVelocidad, y comprueba que el botón funciona.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useReproductor } from './reproductor'\n\nfunction Controles() {\n  const { velocidad, cambiarVelocidad } = useReproductor((e) => ({\n    velocidad: e.velocidad,\n    cambiarVelocidad: e.cambiarVelocidad,\n  }))\n  return <button onClick={cambiarVelocidad}>Velocidad {velocidad}×</button>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>El faro de Cabo Gris</h1>\n      <Controles />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "almacen.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\n\n// Un almacén mínimo con la forma de Zustand: el estado vive fuera\n// de React y cada componente se suscribe con un selector.\nexport function crearAlmacen(crearEstado) {\n  let estado\n  const oyentes = new Set()\n\n  function get() {\n    return estado\n  }\n\n  function set(cambio) {\n    const parcial = typeof cambio === 'function' ? cambio(estado) : cambio\n    estado = { ...estado, ...parcial }\n    oyentes.forEach((oyente) => oyente())\n  }\n\n  function subscribe(oyente) {\n    oyentes.add(oyente)\n    return () => oyentes.delete(oyente)\n  }\n\n  estado = crearEstado(set, get)\n\n  return function useAlmacen(selector) {\n    return useSyncExternalStore(subscribe, () => selector(estado))\n  }\n}\n"
    },
    {
      "nombre": "reproductor.jsx",
      "codigo": "import { crearAlmacen } from './almacen'\n\nexport const useReproductor = crearAlmacen((set) => ({\n  capitulo: 1,\n  segundo: 0,\n  velocidad: 1,\n  avanzar: (segundos) => set((e) => ({ segundo: Math.max(0, e.segundo + segundos) })),\n  elegirCapitulo: (capitulo) => set({ capitulo, segundo: 0 }),\n  cambiarVelocidad: () => set((e) => ({ velocidad: e.velocidad === 2 ? 1 : e.velocidad + 0.5 })),\n}))\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

React escribe primero un error en la consola y después para el render con otro:

```text
The result of getSnapshot should be cached to avoid an infinite loop

Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

Es decir: el resultado de `getSnapshot` (aquí, lo que devuelve el selector) debería guardarse para no entrar en un bucle infinito; y después, que se ha superado el máximo de actualizaciones anidadas y React corta el bucle. El motivo: React llama al selector, obtiene un objeto; lo vuelve a llamar para comprobar que es estable y obtiene **otro** objeto, distinto para `Object.is`. Para React, el almacén ha cambiado mientras renderizaba, así que renderiza otra vez, y así sin fin.

Zustand 5 falla exactamente igual, con el mismo «Maximum update depth exceeded»: su guía de migración lo documenta y propone `useShallow`. React Redux no entra en bucle, pero en desarrollo avisa en la consola de que el selector «returned a different result when called with the same parameters» (devolvió otro resultado con los mismos datos), y el componente se renderiza con cada cambio del almacén, aunque lo que usa siga igual. En los tres casos, la regla es la del apartado de los selectores: **un valor por llamada, o una comparación superficial**.

**Seleccionar el estado entero.** Parece cómodo y no da ningún error:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Cabecera() {\n  const estado = useReproductor((e) => e)\n  return <p>Capítulo {estado.capitulo}</p>\n}\n\nfunction Controles() {\n  const avanzar = useReproductor((e) => e.avanzar)\n  return <button onClick={() => avanzar(15)}>Avanzar 15 s</button>\n}\n\n// Con el almacén de esta lección, pulsas «Avanzar 15 s».\n// ¿Qué hace Cabecera?",
  "opciones": [
    "Nada: sale sin cambios, porque el capítulo no ha cambiado",
    "Se vuelve a renderizar, aunque el párrafo queda igual",
    "Entra en un bucle: el selector devuelve un objeto"
  ],
  "correcta": 1,
  "explicacion": "Cada set crea un estado nuevo, así que el selector (e) => e devuelve un objeto distinto tras cada cambio, y Cabecera se renderiza con todos, incluido el del segundo. No hay bucle, porque mientras nada cambia el estado es el mismo objeto. Comprobado en el árbol: renderizado con cero cambios en el DOM. La solución: (e) => e.capitulo."
}
```

**Meter en el almacén lo que no es suyo.** Los datos del servidor, con una acción para «cargando», otra para «cargado» y otra para «error», reinventan a mano lo que hace una librería de datos (lección 78). Y el estado local de un componente, como lo que se escribe en un campo, deja de reiniciarse al desmontar el componente: cierras el formulario, lo vuelves a abrir y el borrador sigue ahí. A veces es lo que quieres; casi siempre, un fallo.

**Crear el almacén dentro de un componente.** `const useReproductor = crearAlmacen(...)` dentro de `App` crea un almacén nuevo, vacío, en cada render, y ningún otro archivo puede importarlo. Igual que un contexto (lección 28), un almacén se crea una vez, en su propio módulo, y se exporta.

**Elegir la librería antes que el problema.** Empezar un proyecto instalando Redux «por si acaso» llena el almacén de cosas que no deberían estar ahí. Empieza con estado local, súbelo cuando haga falta, y añade la librería cuando el árbol de renders o el Profiler (lección 65) te den un motivo.

## Ejercicios

Relatos al oído quiere una **cola de escucha**: libros que apuntas para oír después. El botón «Añadir» está en cada libro del catálogo, el contador en la cabecera y la cola en su propio panel. Son tres componentes de ramas distintas, así que la cola va en un almacén. `crearAlmacen` ya está escrito, el mismo de la lección; el buscador del catálogo es estado local y ya funciona.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La cola de escucha, en un almacén",
  "consigna": "En cola.jsx, añade al almacén las acciones anadir(libro), quitar(id) y vaciar(), sin modificar el array. En Paneles.jsx, sustituye los valores de relleno por lecturas del almacén con useCola y un selector para cada valor: la cabecera solo necesita cuántos hay. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Cabecera, Catalogo, Cola } from './Paneles'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <div className=\"columnas\">\n        <Catalogo />\n        <Cola />\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "almacen.jsx",
      "codigo": "import { useSyncExternalStore } from 'react'\n\n// Un almacén mínimo con la forma de Zustand: el estado vive fuera\n// de React y cada componente se suscribe con un selector.\nexport function crearAlmacen(crearEstado) {\n  let estado\n  const oyentes = new Set()\n\n  function get() {\n    return estado\n  }\n\n  function set(cambio) {\n    const parcial = typeof cambio === 'function' ? cambio(estado) : cambio\n    estado = { ...estado, ...parcial }\n    oyentes.forEach((oyente) => oyente())\n  }\n\n  function subscribe(oyente) {\n    oyentes.add(oyente)\n    return () => oyentes.delete(oyente)\n  }\n\n  estado = crearEstado(set, get)\n\n  return function useAlmacen(selector) {\n    return useSyncExternalStore(subscribe, () => selector(estado))\n  }\n}\n"
    },
    {
      "nombre": "cola.jsx",
      "codigo": "import { crearAlmacen } from './almacen'\n\n// La cola de escucha: los libros que quieres oír después.\n// Añade las acciones anadir(libro), quitar(id) y vaciar().\n// Igual que en el reproductor: set((e) => ({ ... })) con copias, sin push.\nexport const useCola = crearAlmacen(() => ({\n  libros: [],\n}))\n"
    },
    {
      "nombre": "Paneles.jsx",
      "codigo": "import { useState } from 'react'\nimport { useCola } from './cola'\n\nconst CATALOGO = [\n  { id: 'faro', titulo: 'El faro de Cabo Gris', autora: 'Marta Ibarra' },\n  { id: 'azotea', titulo: 'Un huerto en la azotea', autora: 'Lucía Pons' },\n  { id: 'canfranc', titulo: 'El último tren a Canfranc', autora: 'Elena Lago' },\n  { id: 'sal', titulo: 'La ruta de la sal', autora: 'Pilar Ortiz' },\n]\n\nexport function Cabecera() {\n  // Lee del almacén cuántos libros hay en la cola\n  const cuantos = 0\n\n  return (\n    <header className=\"cabecera\">\n      <h1>Relatos al oído</h1>\n      <p>En tu cola: {cuantos}</p>\n    </header>\n  )\n}\n\nexport function Catalogo() {\n  // El buscador solo le importa al catálogo: estado local\n  const [busqueda, setBusqueda] = useState('')\n  // Lee del almacén los libros de la cola y la acción anadir\n  const libros = []\n  const anadir = () => {}\n\n  const visibles = CATALOGO.filter((l) =>\n    l.titulo.toLowerCase().includes(busqueda.toLowerCase()),\n  )\n\n  return (\n    <section aria-labelledby=\"titulo-catalogo\">\n      <h2 id=\"titulo-catalogo\">Catálogo</h2>\n      <label>\n        Buscar\n        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />\n      </label>\n      <ul className=\"libros\">\n        {visibles.map((libro) => {\n          const enCola = libros.some((l) => l.id === libro.id)\n          return (\n            <li key={libro.id}>\n              <span>\n                {libro.titulo} <small>{libro.autora}</small>\n              </span>\n              <button\n                disabled={enCola}\n                onClick={() => anadir(libro)}\n                aria-label={\n                  enCola\n                    ? `«${libro.titulo}» ya está en la cola`\n                    : `Añadir «${libro.titulo}» a la cola`\n                }\n              >\n                {enCola ? 'En la cola' : 'Añadir'}\n              </button>\n            </li>\n          )\n        })}\n      </ul>\n    </section>\n  )\n}\n\nexport function Cola() {\n  // Lee del almacén los libros y las acciones quitar y vaciar\n  const libros = []\n  const quitar = () => {}\n  const vaciar = () => {}\n\n  return (\n    <section aria-labelledby=\"titulo-cola\">\n      <h2 id=\"titulo-cola\">Tu cola</h2>\n      {libros.length === 0 ? (\n        <p>Tu cola está vacía</p>\n      ) : (\n        <>\n          <ol className=\"libros\">\n            {libros.map((libro) => (\n              <li key={libro.id}>\n                <span>{libro.titulo}</span>\n                <button\n                  onClick={() => quitar(libro.id)}\n                  aria-label={`Quitar «${libro.titulo}» de la cola`}\n                >\n                  Quitar\n                </button>\n              </li>\n            ))}\n          </ol>\n          <button onClick={vaciar}>Vaciar la cola</button>\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 44rem;\n  font-family: system-ui, sans-serif;\n}\n\n.cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.5rem 0.9rem;\n  border-radius: 8px;\n  background: #f5f3ff;\n}\n\n.cabecera h1 {\n  margin: 0;\n  font-size: 1.3rem;\n}\n\n.cabecera p {\n  margin: 0;\n  font-weight: 600;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));\n  gap: 1rem;\n}\n\nh2 {\n  font-size: 1.05rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\ninput,\nbutton {\n  padding: 0.3rem 0.55rem;\n  font: inherit;\n}\n\n.libros {\n  display: grid;\n  gap: 0.35rem;\n  margin: 0 0 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.libros li {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.libros small {\n  display: block;\n  color: #57534e;\n}\n"
    }
  ],
  "archivoInicial": "cola.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Al añadir «El faro de Cabo Gris», la cabecera dice «En tu cola: 1»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «El faro de Cabo Gris» a la cola"
          }
        }
      ],
      "espera": {
        "texto": "En tu cola: 1"
      }
    },
    {
      "descripcion": "El libro añadido aparece en «Tu cola», con su botón para quitarlo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «El faro de Cabo Gris» a la cola"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Quitar «El faro de Cabo Gris» de la cola"
      }
    },
    {
      "descripcion": "En el catálogo, el libro añadido pasa a «En la cola»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «El faro de Cabo Gris» a la cola"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "«El faro de Cabo Gris» ya está en la cola"
      }
    },
    {
      "descripcion": "Con dos libros añadidos, la cabecera dice «En tu cola: 2»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «El faro de Cabo Gris» a la cola"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «La ruta de la sal» a la cola"
          }
        }
      ],
      "espera": {
        "texto": "En tu cola: 2"
      }
    },
    {
      "descripcion": "Al quitar un libro, desaparece de la cola y el contador baja a 1",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «El faro de Cabo Gris» a la cola"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «La ruta de la sal» a la cola"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar «El faro de Cabo Gris» de la cola"
          }
        }
      ],
      "espera": {
        "texto": "En tu cola: 1"
      }
    },
    {
      "descripcion": "Al quitarlo de la cola, el catálogo vuelve a ofrecer «Añadir» para ese libro",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «El faro de Cabo Gris» a la cola"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar «El faro de Cabo Gris» de la cola"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Añadir «El faro de Cabo Gris» a la cola"
      }
    },
    {
      "descripcion": "«Vaciar la cola» la deja vacía",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «Un huerto en la azotea» a la cola"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir «El último tren a Canfranc» a la cola"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vaciar la cola"
          }
        }
      ],
      "espera": {
        "texto": "Tu cola está vacía"
      }
    }
  ]
}
```

Si tus acciones hacen `e.libros.push(libro)` en vez de crear un array nuevo, la cabecera se actualiza y la cola no. Merece la pena probarlo: `(e) => e.libros.length` devuelve un número nuevo, pero `(e) => e.libros` devuelve **el mismo array**, ya modificado, y para `Object.is` nada ha cambiado. Es la inmutabilidad de la lección 21, ahora decidiendo quién se renderiza.

Con la cola ya funcionando, abre el árbol de renders y añade un libro: se renderizan los tres paneles, porque los tres leen la cola. Escribe después en el buscador: solo `Catalogo`, que es el único que tiene ese estado.

**Retos para seguir practicando** (sin comprobación automática):

1. En un proyecto en tu ordenador (la vista previa de esta web no conserva nada entre recargas), haz que la cola sobreviva a recargar la página: en `crearAlmacen`, acepta un nombre, lee el estado inicial de `localStorage` y guárdalo en cada `set`. Es lo que hace el middleware `persist` de Zustand. Ojo: las funciones no se pueden guardar en JSON, así que guarda solo los datos.
2. Añade `getState` a lo que devuelve `crearAlmacen` (`useAlmacen.getState = get`) y, en el reproductor, haz avanzar el segundo desde un `setInterval` escrito en el módulo, fuera de cualquier componente. Mira el árbol: cada segundo se renderiza solo `BarraProgreso`.
3. Escribe tu propio Hook `useShallow`: recibe un selector y devuelve otro que guarda el último resultado en una ref (lección 33) y lo reutiliza si todas sus propiedades coinciden con `Object.is`. Úsalo para que `Controles` lea velocidad y acción en una sola llamada sin entrar en bucle.
4. Rehaz la cola con reducer y dos contextos, como en la lección 29, y compara en el árbol qué se renderiza al añadir un libro y al escribir en el buscador.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useSyncExternalStore",
      "descripcion": "La referencia del Hook con el que se construyen las librerías de estado: suscribirse, leer el valor actual, el error de getSnapshot sin caché y el renderizado en el servidor. Es la lección 46.",
      "url": "https://react.dev/reference/react/useSyncExternalStore",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Choosing the State Structure",
      "descripcion": "Los principios para dar forma al estado, que valen igual dentro de un componente que en un almacén: sin redundancias, sin duplicados y plano. Es la lección 24.",
      "url": "https://react.dev/learn/choosing-the-state-structure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Zustand: Introduction",
      "descripcion": "Crear un almacén con create y leerlo con selectores, sin proveedores, en la documentación oficial.",
      "url": "https://zustand.docs.pmnd.rs/learn/getting-started/introduction",
      "etiqueta": "Zustand"
    },
    {
      "titulo": "Zustand: Comparison",
      "descripcion": "Zustand comparado con Redux, Jotai, Valtio y Recoil: modelo de estado y cómo optimiza los renders cada una.",
      "url": "https://zustand.docs.pmnd.rs/learn/getting-started/comparison",
      "etiqueta": "Zustand"
    },
    {
      "titulo": "Redux Toolkit: Quick Start",
      "descripcion": "Instalar RTK y React Redux, crear el almacén, el primer slice y usarlo con useSelector y useDispatch, también en JavaScript sin TypeScript.",
      "url": "https://redux-toolkit.js.org/tutorials/quick-start",
      "etiqueta": "Redux"
    },
    {
      "titulo": "Redux FAQ: When should I use Redux?",
      "descripcion": "La respuesta de la propia documentación de Redux a si lo necesitas, con los criterios que se citan en esta lección.",
      "url": "https://redux.js.org/faq/general",
      "etiqueta": "Redux"
    },
    {
      "titulo": "Redux Style Guide",
      "descripcion": "Las reglas recomendadas por los mantenedores: RTK, Immer, slices por funcionalidad, acciones como eventos y las Redux DevTools.",
      "url": "https://redux.js.org/style-guide/",
      "etiqueta": "Redux"
    }
  ]
}
```
