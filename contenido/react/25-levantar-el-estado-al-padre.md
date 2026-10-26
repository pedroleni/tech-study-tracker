# Levantar el estado al padre

- **Módulo:** Gestionar el estado
- **Slug:** `levantar-el-estado-al-padre` (autogenerado del título)
- **Orden:** 250
- **Fuentes:** [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) — ver `contenido/react/TEMARIO.md` #25

---

## Qué es y para qué sirve

Desde la lección 16 sabes que el estado de un componente es **privado**: cada copia guarda el suyo y nadie de fuera puede leerlo ni cambiarlo. Y desde la lección 13, que los datos solo viajan en una dirección: **de padre a hijo, por props**. Un hermano no puede pasarle nada a otro hermano.

Las dos reglas son una ventaja hasta que dos componentes necesitan **el mismo dato** o tienen que **ponerse de acuerdo**:

- Un buscador y la lista de resultados: lo que escribes en uno decide lo que enseña la otra.
- Unas pestañas y su contenido: la pestaña marcada y el panel visible tienen que ser la misma.
- Un acordeón en el que solo puede haber una sección abierta: abrir una tiene que cerrar las demás.

La solución tiene nombre propio en React: **levantar el estado** (en inglés, *lifting state up*). Se quita el estado de los hijos, se guarda en su antepasado común más cercano y se les baja por props, junto con las funciones que necesitan para pedir que cambie. Es una de las cosas que más vas a hacer al escribir React.

## Dos paneles que no se pueden poner de acuerdo

El observatorio de Sierra Alta organiza visitas nocturnas, y su página tiene un acordeón con tres preguntas. Cada `Panel` guarda en su propio estado si está abierto. Debajo de la vista previa tienes el panel «Árbol de renders» que estrenaste en la lección 13.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un acordeón con el estado en cada panel",
  "consigna": "Abre «Cómo llegar» y después «Qué ropa llevar». Mira el árbol después de cada clic: ¿qué componentes se han vuelto a renderizar? Después piensa cómo harías, tocando solo Panel.jsx, que al abrir uno se cerraran los demás.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Panel from './Panel'\nimport './estilos.css'\n\nconst PANELES = [\n  {\n    id: 'llegar',\n    titulo: 'Cómo llegar',\n    texto: 'Sale un autobús de la plaza del pueblo a las 20:30. Si vienes en coche, aparca en la explanada de abajo: arriba no se pueden encender los faros.',\n  },\n  {\n    id: 'cielo',\n    titulo: 'Qué se ve esta noche',\n    texto: 'Saturno con sus anillos, la galaxia de Andrómeda y, como no hay luna, la Vía Láctea a simple vista.',\n  },\n  {\n    id: 'ropa',\n    titulo: 'Qué ropa llevar',\n    texto: 'A 2.000 metros refresca aunque sea agosto: trae chaqueta, gorro y una linterna de luz roja, que no deslumbra.',\n  },\n]\n\nfunction Cabecera() {\n  return <h1>Visita nocturna al Observatorio de Sierra Alta</h1>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      {PANELES.map((panel) => (\n        <Panel key={panel.id} titulo={panel.titulo}>\n          {panel.texto}\n        </Panel>\n      ))}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Panel.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Panel({ titulo, children }) {\n  const [abierto, setAbierto] = useState(false)\n\n  return (\n    <section className=\"panel\">\n      <h2>\n        <button aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>\n          {titulo}\n        </button>\n      </h2>\n      {abierto && <p>{children}</p>}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.panel {\n  margin-bottom: 0.5rem;\n  border: 1px solid #c7d2fe;\n  border-radius: 10px;\n  background: #eef2ff;\n}\n\n.panel h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.panel button {\n  width: 100%;\n  padding: 0.6rem 0.9rem;\n  border: 0;\n  border-radius: 10px;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  text-align: left;\n  cursor: pointer;\n}\n\n.panel button[aria-expanded='true'] {\n  color: #3730a3;\n}\n\n.panel p {\n  margin: 0;\n  padding: 0 0.9rem 0.8rem;\n}\n"
    }
  ],
  "archivoInicial": "Panel.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Los dos paneles se quedan abiertos, y el árbol explica por qué: en cada clic solo cambia **un** `Panel`, el que has pulsado, porque «cambió su estado». `App`, `Cabecera` y los otros paneles salen «sin cambios», y el resumen dice «1 renderizado». Cada panel vive en su mundo:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Antes: cada panel guarda su estado",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0
    },
    {
      "nombre": "Cabecera",
      "nivel": 1
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "clave": "llegar",
      "etiqueta": "estado: abierto"
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "clave": "cielo",
      "etiqueta": "estado: abierto"
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "clave": "ropa",
      "etiqueta": "estado: abierto"
    }
  ]
}
```

El observatorio quiere ahora que **solo haya un panel abierto a la vez**. Desde `Panel.jsx` es imposible: un panel no puede leer el estado de sus hermanos ni cerrarlos, y `App` tampoco sabe cuál está abierto. El dato «qué panel está abierto» no es de ningún panel: es de los tres a la vez. Así que tiene que vivir por encima de los tres.

## Levantar el estado en tres pasos

React lo resume en tres pasos: **quitar** el estado de los hijos, **pasar** los datos desde el padre común y **añadir** el estado en el padre, junto con las funciones para cambiarlo.

### Paso 1: quita el estado de los hijos

Borra el `useState` de `Panel` y convierte `abierto` en una prop. A partir de ahora, si un panel está abierto lo decide quien lo usa:

```jsx
// Antes: Panel decide solo
export default function Panel({ titulo, children }) {
  const [abierto, setAbierto] = useState(false)
  // ...
}

// Después: abierto le llega del padre
export default function Panel({ titulo, abierto, children }) {
  // ...
}
```

### Paso 2: pasa los datos desde el padre común

Busca el **antepasado común más cercano** de los componentes que quieres coordinar: el componente más bajo del árbol que está por encima de todos ellos. Aquí es `App`, el padre directo de los tres paneles. Antes de meter estado, pásales un dato fijo y comprueba que obedecen:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Paso 2: el padre ya decide, con un dato fijo",
  "consigna": "Cambia 'cielo' por 'ropa' en App.jsx y mira qué panel se abre. Prueba también abierto={true}. Los botones no hacen nada: Panel ya no tiene estado que cambiar, y App todavía no le ha dado ninguna forma de pedirlo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Panel from './Panel'\nimport './estilos.css'\n\nconst PANELES = [\n  {\n    id: 'llegar',\n    titulo: 'Cómo llegar',\n    texto: 'Sale un autobús de la plaza del pueblo a las 20:30. Si vienes en coche, aparca en la explanada de abajo: arriba no se pueden encender los faros.',\n  },\n  {\n    id: 'cielo',\n    titulo: 'Qué se ve esta noche',\n    texto: 'Saturno con sus anillos, la galaxia de Andrómeda y, como no hay luna, la Vía Láctea a simple vista.',\n  },\n  {\n    id: 'ropa',\n    titulo: 'Qué ropa llevar',\n    texto: 'A 2.000 metros refresca aunque sea agosto: trae chaqueta, gorro y una linterna de luz roja, que no deslumbra.',\n  },\n]\n\nfunction Cabecera() {\n  return <h1>Visita nocturna al Observatorio de Sierra Alta</h1>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      {PANELES.map((panel) => (\n        // Paso 2: un dato fijo, de momento. Prueba con 'llegar', 'ropa'... o con true\n        <Panel key={panel.id} titulo={panel.titulo} abierto={panel.id === 'cielo'}>\n          {panel.texto}\n        </Panel>\n      ))}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Panel.jsx",
      "codigo": "// Paso 1: sin useState. Si está abierto lo decide quien lo usa\nexport default function Panel({ titulo, abierto, children }) {\n  return (\n    <section className=\"panel\">\n      <h2>\n        {/* Sin onClick: todavía no hay nada que cambiar */}\n        <button aria-expanded={abierto}>{titulo}</button>\n      </h2>\n      {abierto && <p>{children}</p>}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.panel {\n  margin-bottom: 0.5rem;\n  border: 1px solid #c7d2fe;\n  border-radius: 10px;\n  background: #eef2ff;\n}\n\n.panel h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.panel button {\n  width: 100%;\n  padding: 0.6rem 0.9rem;\n  border: 0;\n  border-radius: 10px;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  text-align: left;\n  cursor: pointer;\n}\n\n.panel button[aria-expanded='true'] {\n  color: #3730a3;\n}\n\n.panel p {\n  margin: 0;\n  padding: 0 0.9rem 0.8rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

### Paso 3: guarda el estado en el padre y pásales funciones para cambiarlo

Al levantar un estado, a menudo **cambia su forma**. Abajo había tres booleanos, uno por panel. Arriba no hace falta guardar tres cosas, sino una: **qué panel está abierto**. Un solo id, y así es imposible que haya dos abiertos a la vez (es «evita las contradicciones» y «guarda el id» de la lección 24):

```jsx
const [abiertoId, setAbiertoId] = useState('llegar')
```

Falta que el botón de un panel pueda cambiar ese estado. `Panel` no puede llamar a `setAbiertoId`, que es de `App`. Así que `App` **le da permiso explícito**: le pasa una función que lo hace. Es el mismo patrón de manejadores como props de la lección 15, con un nombre que dice lo que significa, `onAbrir`:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El acordeón con el estado levantado a App",
  "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst PANELES = [\n  {\n    id: 'llegar',\n    titulo: 'Cómo llegar',\n    texto: 'Sale un autobús de la plaza del pueblo a las 20:30. Si vienes en coche, aparca en la explanada de abajo: arriba no se pueden encender los faros.',\n  },\n  {\n    id: 'cielo',\n    titulo: 'Qué se ve esta noche',\n    texto: 'Saturno con sus anillos, la galaxia de Andrómeda y, como no hay luna, la Vía Láctea a simple vista.',\n  },\n  {\n    id: 'ropa',\n    titulo: 'Qué ropa llevar',\n    texto: 'A 2.000 metros refresca aunque sea agosto: trae chaqueta, gorro y una linterna de luz roja, que no deslumbra.',\n  },\n]\n\nfunction Cabecera() {\n  return <h1>Visita nocturna al Observatorio de Sierra Alta</h1>\n}\n\nfunction Panel({ titulo, abierto, onAbrir, children }) {\n  return (\n    <section className=\"panel\">\n      <h2>\n        <button aria-expanded={abierto} onClick={onAbrir}>\n          {titulo}\n        </button>\n      </h2>\n      {abierto && <p>{children}</p>}\n    </section>\n  )\n}\n\nexport default function App() {\n  const [abiertoId, setAbiertoId] = useState('llegar')\n\n  return (\n    <main>\n      <Cabecera />\n      {PANELES.map((panel) => (\n        <Panel\n          key={panel.id}\n          titulo={panel.titulo}\n          abierto={panel.id === abiertoId}\n          onAbrir={() => setAbiertoId(panel.id)}\n        >\n          {panel.texto}\n        </Panel>\n      ))}\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.3rem;\n}\n\n.panel {\n  margin-bottom: 0.5rem;\n  border: 1px solid #c7d2fe;\n  border-radius: 10px;\n  background: #eef2ff;\n}\n\n.panel h2 {\n  margin: 0;\n  font-size: 1rem;\n}\n\n.panel button {\n  width: 100%;\n  padding: 0.6rem 0.9rem;\n  border: 0;\n  border-radius: 10px;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  text-align: left;\n  cursor: pointer;\n}\n\n.panel button[aria-expanded='true'] {\n  color: #3730a3;\n}\n\n.panel p {\n  margin: 0;\n  padding: 0 0.9rem 0.8rem;\n}",
  "anotaciones": [
    {
      "fragmento": "const [abiertoId, setAbiertoId] = useState('llegar')",
      "nota": "El estado vive ahora en App, el antepasado común de los tres paneles. Y ya no son tres booleanos, sino un solo dato: el id del panel abierto. Con un id no hay forma de abrir dos a la vez."
    },
    {
      "fragmento": "abierto={panel.id === abiertoId}",
      "nota": "Cada panel recibe si está abierto, calculado en el render a partir del estado de App. Ningún panel guarda una copia."
    },
    {
      "fragmento": "onAbrir={() => setAbiertoId(panel.id)}",
      "nota": "Y una función para pedir que lo abran. Cada panel recibe la suya, que ya sabe de qué panel se trata. Panel no sabe qué hace por dentro: solo sabe cuándo llamarla."
    },
    {
      "fragmento": "function Panel({ titulo, abierto, onAbrir, children })",
      "nota": "Panel ya no tiene estado: lo que enseña depende solo de sus props. Si mañana App decide abrir un panel desde otro sitio, Panel no tiene que cambiar."
    },
    {
      "fragmento": "onClick={onAbrir}",
      "nota": "El clic llama a la función del padre. El aviso sube; el dato nuevo baja en el render siguiente."
    },
    {
      "fragmento": "function Cabecera()",
      "nota": "Cabecera no recibe ninguna prop, pero cuelga de App. Fíjate en ella en el árbol cuando pulses un panel."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Pulsa «Qué ropa llevar» y se cierra «Cómo llegar». Ya está levantado:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Después: el estado vive en App",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: abiertoId"
    },
    {
      "nombre": "Cabecera",
      "nivel": 1
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "clave": "llegar",
      "nota": "← recibe abierto y onAbrir"
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "clave": "cielo",
      "nota": "← recibe abierto y onAbrir"
    },
    {
      "nombre": "Panel",
      "nivel": 1,
      "clave": "ropa",
      "nota": "← recibe abierto y onAbrir"
    }
  ]
}
```

## Qué se vuelve a renderizar ahora

Vuelve al bloque anotado, pulsa «Qué ropa llevar» (o cualquier panel cerrado) y lee el árbol de arriba abajo:

- **`App`**: re-render porque «cambió su estado». El render empieza donde vive el estado.
- **`Cabecera`**: re-render porque «se renderizó su padre». No recibe nada, pero está en la rama de `App` y React ejecuta toda la rama (lección 13).
- **Los dos paneles que cambian**: «cambió la prop «abierto» · cambió la prop «onAbrir» (función nueva)».
- **El panel que se queda igual**: solo «cambió la prop «onAbrir» (función nueva)».

El resumen dice «5 renderizados · 4 cambios en el DOM». Antes, un clic renderizaba un componente; ahora, cinco. **Es el precio de coordinar: el estado vive más arriba y el render empieza más arriba.** Casi nunca importa, porque ejecutar un componente es barato y React solo toca en la página lo que es distinto: los cuatro cambios son los dos `aria-expanded` y los dos párrafos que salen y entran, y el recuadro ámbar de la vista previa solo marca cosas de esos dos paneles.

¿Y esa «función nueva»? Cada vez que `App` se renderiza, la flecha `() => setAbiertoId(panel.id)` se crea otra vez, así que para cada panel su `onAbrir` es una función distinta de la anterior, aunque haga lo mismo. No es un error ni hay que arreglarlo. Si algún día un componente es tan caro que conviene saltárselo, las lecciones 66 a 68 enseñan cómo, y verás que una función nueva en cada render es justo lo que impide saltárselo: para eso existe `useCallback`.

Este es el viaje completo de un clic:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Pulsas «Qué ropa llevar»",
  "items": [
    {
      "titulo": "El botón llama a onAbrir",
      "texto": "El button de Panel no sabe nada del acordeón: ejecuta la función que le llegó por props, la flecha que App creó para el panel de la ropa."
    },
    {
      "titulo": "App cambia su estado",
      "texto": "Esa flecha llama a setAbiertoId('ropa'). Es App quien cambia su propio estado; Panel solo ha avisado."
    },
    {
      "titulo": "App se vuelve a renderizar",
      "texto": "Ahora abiertoId vale 'ropa', y App calcula otra vez la prop abierto de cada panel: true para la ropa, false para los demás."
    },
    {
      "titulo": "Los paneles reciben sus props nuevas",
      "texto": "Cada Panel se ejecuta con sus props de este render. El de la ropa pinta su texto; el de cómo llegar ya no."
    },
    {
      "titulo": "React pone la página al día",
      "texto": "Compara con lo que había y solo cambia lo distinto: un párrafo sale, otro entra y dos botones cambian su aria-expanded."
    }
  ]
}
```

**El aviso sube por una función; el dato baja por una prop.** Con este círculo, cualquier componente puede cambiar un estado que no es suyo, siempre que su dueño le haya dado permiso.

## Controlados y no controlados

Las dos versiones de `Panel` tienen nombre, y son las mismas palabras que usaste con los campos de formulario en la lección 22, donde un `<input>` con `defaultValue` va por libre y uno con `value` y `onChange` obedece a tu estado:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos maneras de diseñar el mismo Panel",
  "roles": [
    {
      "etiqueta": "No controlado",
      "rol": "Panel con su propio useState",
      "descripcion": "Decide él solo si está abierto. Es cómodo de usar: el padre lo coloca y se olvida. Pero nadie de fuera puede abrirlo, cerrarlo ni saber cómo está."
    },
    {
      "etiqueta": "Controlado",
      "rol": "Panel con las props abierto y onAbrir",
      "descripcion": "Enseña lo que dicen sus props y avisa cuando quieren cambiarlo. Más trabajo para el padre, que guarda el estado, pero a cambio el padre lo decide todo y puede coordinarlo con otros."
    }
  ]
}
```

Un componente es **controlado** cuando la información que importa le llega por props, y **no controlado** cuando la guarda en su propio estado. No son términos técnicos estrictos: casi todos los componentes mezclan las dos cosas. Un `Panel` controlado en lo de estar abierto podría tener, además, su propio estado para algo que solo le importa a él, como un botón «Me interesa».

Al escribir un componente, decide qué datos deben llegar por props y cuáles puede guardar él mismo. Y si te equivocas, no pasa nada: pasar de uno a otro es justo lo que acabas de hacer.

Cuando un componente admite las dos formas, la convención está en los nombres. Lo has visto en la lección 24 con `colorInicial`: una prop que solo sirve para arrancar lleva `Inicial` en el nombre (en inglés, `initial` o `default`). La versión controlada usa el nombre del dato más un `on` para cambiarlo. Las librerías de componentes que verás en la lección 80 lo hacen así: el acordeón de Radix acepta `defaultValue` para funcionar por su cuenta, o `value` y `onValueChange` para que lo controles tú.

Un componente controlado depende de que el padre cumpla su parte:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Panel({ titulo, abierto, onAbrir, children }) {\n  return (\n    <section className=\"panel\">\n      <h2>\n        <button aria-expanded={abierto} onClick={onAbrir}>\n          {titulo}\n        </button>\n      </h2>\n      {abierto && <p>{children}</p>}\n    </section>\n  )\n}\n\nexport default function App() {\n  const [abiertoId, setAbiertoId] = useState('llegar')\n\n  return (\n    <main>\n      {PANELES.map((panel) => (\n        <Panel key={panel.id} titulo={panel.titulo} abierto={panel.id === abiertoId}>\n          {panel.texto}\n        </Panel>\n      ))}\n    </main>\n  )\n}\n\n// Pulsas «Qué ropa llevar». ¿Qué pasa?",
  "opciones": [
    "Se abre «Qué ropa llevar» y se cierra «Cómo llegar»",
    "No pasa nada, y la consola tampoco dice nada",
    "Salta el error «onAbrir is not a function»",
    "React avisa en la consola de que falta la prop onAbrir"
  ],
  "correcta": 1,
  "explicacion": "App no le pasa onAbrir, así que llega undefined y el botón queda con onClick={undefined}: un botón sin manejador. Un componente controlado sin su función para cambiar es de solo lectura, y aquí nadie avisa. Con un input sin onChange React sí avisa (lección 22). Si el botón hiciera onClick={() => onAbrir()}, entonces la consola sí mostraría «TypeError: onAbrir is not a function» al pulsar."
}
```

## Una única fuente de verdad

Levantar el estado no es solo un truco para coordinar componentes. Es una regla para no tener nunca el mismo dato en dos sitios: **cada dato del estado tiene un único dueño**, el componente que lo guarda con `useState`, y los demás lo reciben por props. A eso se le llama tener una **única fuente de verdad** (*single source of truth*).

No significa que todo el estado viva en un mismo sitio, sino que **cada dato vive en un sitio concreto**. El id del panel abierto vive en `App`; el «Me interesa» de cada panel podría vivir en cada `Panel`. Lo que no puede pasar es que el mismo dato viva en dos.

Y pasa más de lo que parece, sobre todo cuando un estado se levanta a medias. En esta churrería, el selector guarda su propia copia de las raciones y, además, avisa a `App` de cada cambio para que calcule el total:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las raciones, guardadas en dos sitios",
  "consigna": "Añade tres raciones y pulsa «Vaciar pedido». Compara el selector con el total. En el árbol, pulsa el nodo App y después SelectorRaciones para ver el estado de cada uno. Luego añade otra ración. Arréglalo: quita el useState de SelectorRaciones y haz que reciba raciones y onCambiar de App.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport SelectorRaciones from './SelectorRaciones'\nimport './estilos.css'\n\nconst PRECIO_RACION = 2.4\n\nconst euros = (cantidad) =>\n  cantidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport default function App() {\n  const [raciones, setRaciones] = useState(0)\n\n  return (\n    <main>\n      <h1>Churrería La Esquina</h1>\n      <SelectorRaciones onCambiar={setRaciones} />\n      <p className=\"total\">Total: {euros(raciones * PRECIO_RACION)}</p>\n      <button onClick={() => setRaciones(0)}>Vaciar pedido</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "SelectorRaciones.jsx",
      "codigo": "import { useState } from 'react'\n\n// Guarda su propia copia de las raciones y avisa al padre de cada cambio\nexport default function SelectorRaciones({ onCambiar }) {\n  const [raciones, setRaciones] = useState(0)\n\n  function cambiar(nuevas) {\n    setRaciones(nuevas)\n    onCambiar(nuevas)\n  }\n\n  return (\n    <p>\n      Raciones de churros: {raciones}{' '}\n      <button onClick={() => cambiar(raciones + 1)}>Añadir una ración</button>{' '}\n      <button disabled={raciones === 0} onClick={() => cambiar(raciones - 1)}>\n        Quitar una ración\n      </button>\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.7rem;\n}\n\n.total {\n  font-size: 1.2rem;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "SelectorRaciones.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Tras «Vaciar pedido», el total dice 0,00 € y el selector sigue en 3. En el árbol, el estado de `App` es `0` y el de `SelectorRaciones`, `3`: **el mismo dato con dos dueños, cada uno con su valor**. Y si ahora añades una ración, el selector pasa a 4 y el total salta a 9,60 €: el pedido que habías vaciado ha resucitado.

Mientras solo cambia el selector, las dos copias coinciden y todo parece funcionar. Se separan en cuanto alguien cambia una sin pasar por la otra. El arreglo es terminar de levantar el estado: que `SelectorRaciones` no guarde nada y enseñe lo que le dice `App`.

```jsx
// SelectorRaciones.jsx: sin estado propio
export default function SelectorRaciones({ raciones, onCambiar }) {
  return (
    <p>
      Raciones de churros: {raciones}{' '}
      <button onClick={() => onCambiar(raciones + 1)}>Añadir una ración</button>{' '}
      <button disabled={raciones === 0} onClick={() => onCambiar(raciones - 1)}>
        Quitar una ración
      </button>
    </p>
  )
}

// En App.jsx
<SelectorRaciones raciones={raciones} onCambiar={setRaciones} />
```

Ahora «Vaciar pedido» deja los dos números a cero, porque ya no hay dos números: hay uno, y el selector lo enseña. En el árbol, `SelectorRaciones` pasa a re-renderizarse porque «cambió la prop «raciones»». Fíjate en que `App` le pasa `setRaciones` tal cual como `onCambiar`: se puede, porque recibe justo lo que necesita, el número nuevo.

## Dónde debe vivir cada estado

Para decidir dónde guardar un dato del estado, sigue estos pasos con cada uno:

1. Busca **todos los componentes que lo usan**: los que pintan algo según su valor y los que lo cambian.
2. Busca su **antepasado común más cercano**: el componente más bajo del árbol que está por encima de todos ellos.
3. **El estado vive ahí.** Si en ese punto no hay ningún componente que tenga sentido, crea uno solo para guardarlo.

En la tienda online de la tetería Al-Ándalus, el icono de la cabecera dice cuántos tés llevas, cada ficha tiene un botón «Añadir a la cesta» y el resumen de abajo lista la cesta con su total. Además, cada ficha puede desplegar sus notas de cata. Aplicando los pasos a cada dato:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "La tetería: cada dato en su sitio",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: cesta",
      "nota": "← antepasado común de quienes usan la cesta"
    },
    {
      "nombre": "Cabecera",
      "nivel": 1,
      "nota": "← no usa la cesta: solo se la pasa a IconoCesta"
    },
    {
      "nombre": "IconoCesta",
      "nivel": 2,
      "nota": "← lee la cesta: «3 tés»"
    },
    {
      "nombre": "Catalogo",
      "nivel": 1
    },
    {
      "nombre": "FichaTe",
      "nivel": 2,
      "clave": "matcha",
      "etiqueta": "estado: notasAbiertas",
      "nota": "← cambia la cesta con onAnadir"
    },
    {
      "nombre": "FichaTe",
      "nivel": 2,
      "clave": "rooibos",
      "etiqueta": "estado: notasAbiertas"
    },
    {
      "nombre": "FichaTe",
      "nivel": 2,
      "clave": "earl-grey",
      "etiqueta": "estado: notasAbiertas"
    },
    {
      "nombre": "Resumen",
      "nivel": 1,
      "nota": "← lee la cesta: líneas y total"
    }
  ]
}
```

La **cesta** la usan `IconoCesta`, las tres `FichaTe` y `Resumen`, que cuelgan de ramas distintas: el único antepasado común es `App`. En cambio, **si las notas de cata están desplegadas** solo le importa a cada ficha, así que se queda en cada `FichaTe`, abajo del todo. Subirlo «por si acaso» haría que cada clic en unas notas renderizara la tienda entera y llenaría `App` de datos que no son asunto suyo.

Tu turno con un dato nuevo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// La tetería quiere un buscador en la cabecera que filtre\n// las fichas del catálogo según lo que escribes.\nfunction App() {\n  const [cesta, setCesta] = useState([])\n\n  function anadir(te) {\n    setCesta([...cesta, te])\n  }\n\n  return (\n    <>\n      <Cabecera cesta={cesta} />    {/* aquí va el campo del buscador */}\n      <Catalogo onAnadir={anadir} /> {/* aquí se filtran las fichas */}\n      <Resumen cesta={cesta} />\n    </>\n  )\n}\n\n// ¿Dónde tiene que vivir el texto de la búsqueda?",
  "opciones": [
    "En Cabecera, que es donde se escribe",
    "En Catalogo, que es quien filtra",
    "En App, el antepasado común de Cabecera y Catalogo",
    "En Cabecera y en Catalogo, una copia en cada uno"
  ],
  "correcta": 2,
  "explicacion": "Lo cambia el buscador, dentro de Cabecera, y lo lee Catalogo para filtrar. Si viviera en Cabecera, Catalogo no podría leerlo; si viviera en Catalogo, el buscador no podría cambiarlo. Su antepasado común más cercano es App. Y una copia en cada uno sería repetir la churrería: dos dueños para un dato."
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "¿Y si el antepasado común está muy lejos?",
  "contenido": "Cabecera recibe la cesta sin usarla, solo para pasársela a IconoCesta. Con uno o dos niveles es lo normal. Cuando un dato tiene que atravesar muchos componentes que no lo usan, React tiene una herramienta para hacerlo llegar a toda una rama sin pasarlo de mano en mano: el contexto, en la lección 28. Y cuando las funciones para cambiar un estado levantado se multiplican, useReducer (lección 27) las reúne en un solo sitio."
}
```

## Cuándo lo usarías de verdad

En cuanto una interfaz tiene más de una pieza, aparece un estado que hay que levantar:

- **Pestañas y su contenido**: qué pestaña está activa vive en el componente que contiene las dos cosas.
- **Un buscador o unos filtros y la lista de resultados**: el texto y los filtros viven en el padre, que calcula la lista filtrada.
- **Una lista y su panel de detalle**: el id del elemento elegido, como en la lección 24, en el padre de los dos.
- **Un contador en la cabecera** que depende de lo que pasa en otra parte de la página, como la cesta de la tetería.
- **Un formulario de varios pasos** con un resumen al final: los datos de todos los pasos viven en el componente que los contiene.
- **Dos campos sincronizados**, como kilómetros y millas: se guarda uno solo y el otro se calcula.

Y no hace falta acertar a la primera. Es normal mover un estado hacia abajo o hacia arriba mientras construyes una pantalla y descubres quién lo necesita. La lección 31, «Pensar en React», convierte esta decisión en uno de los pasos de su método.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Levantar el estado es moverlo todo a App",
      "realidad": "Se sube solo hasta el antepasado común más cercano de quienes lo usan. Lo que solo le importa a un componente se queda en él, como las notas de cata de cada ficha."
    },
    {
      "mito": "Un hijo puede cambiar las props que recibe",
      "realidad": "Las props son de solo lectura (lección 8). El hijo pide el cambio llamando a una función que le dio el padre; el padre cambia su estado y la prop nueva llega en el render siguiente."
    },
    {
      "mito": "Dos hermanos pueden pasarse datos",
      "realidad": "Los datos solo bajan. Para que un hermano se entere de algo del otro, ese algo tiene que vivir en el padre de los dos."
    },
    {
      "mito": "Si el padre se re-renderiza, se repinta toda la página",
      "realidad": "Se vuelven a ejecutar los componentes de su rama, pero React solo toca en el DOM lo que es distinto. En el acordeón: cinco renders y cuatro cambios, todos dentro de los dos paneles que cambian."
    },
    {
      "mito": "Para que el hijo cambie el estado hay que pasarle el setter",
      "realidad": "Puedes pasar setAbiertoId, pero entonces el hijo depende de cómo guarda el padre su estado. Una función con el nombre de lo que pasa, como onAbrir, deja al padre libre para cambiar su estado por dentro sin tocar al hijo."
    }
  ]
}
```

## Errores típicos

**Llamar a la función al pasarla, en vez de pasarla.** Es el «pásala, no la llames» de la lección 15, y al levantar el estado aparece en su versión más dañina:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  const [abiertoId, setAbiertoId] = useState('llegar')\n\n  return (\n    <main>\n      {PANELES.map((panel) => (\n        <Panel\n          key={panel.id}\n          titulo={panel.titulo}\n          abierto={panel.id === abiertoId}\n          onAbrir={setAbiertoId(panel.id)}\n        >\n          {panel.texto}\n        </Panel>\n      ))}\n    </main>\n  )\n}\n\n// Cargas la página. ¿Qué ves?",
  "opciones": [
    "El acordeón con «Cómo llegar» abierto, y funciona al pulsar",
    "El acordeón con «Qué ropa llevar» abierto, el último del array",
    "Un error en lugar del acordeón: «Too many re-renders»",
    "El acordeón, pero los botones no hacen nada"
  ],
  "correcta": 2,
  "explicacion": "setAbiertoId(panel.id) no se pasa: se ejecuta mientras App se renderiza. Cambiar el estado durante el render pide otro render, que vuelve a cambiarlo, y así sin fin. React corta el bucle con un error. Lo que hay que pasar es una función que lo haga más tarde: onAbrir={() => setAbiertoId(panel.id)}."
}
```

El mensaje que sale en la vista previa:

```text
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

Es decir: demasiados renders seguidos; React limita cuántos hace para no quedarse atrapado en un bucle infinito. Cuando lo veas, busca un `set...(...)` que se ejecuta durante el render, casi siempre en una prop `on...` sin su `() =>`.

**Dejar una copia del estado en el hijo.** Es la churrería: el padre guarda el dato y el hijo, además, su propia copia. Una variante muy común es levantar el estado pero conservar en el hijo `const [abierto, setAbierto] = useState(abiertoProp)`: como viste en la lección 24, esa copia se queda con el valor del primer render y deja de obedecer al padre. Al levantar un estado, **en el hijo no queda ningún `useState` de ese dato**.

**Levantar el estado sin cambiarle la forma.** Si en `App` guardas `abiertoLlegar`, `abiertoCielo` y `abiertoRopa`, tres booleanos, cada `onAbrir` tiene que acordarse de cerrar los otros dos, y el día que añadas un cuarto panel alguno se olvidará. Pregúntate qué dato necesita de verdad el padre: aquí, cuál está abierto.

**Subir el estado más arriba de lo necesario.** Llevarlo todo a `App` desde el principio parece prudente, pero hace que cada cambio renderice la app entera y llena el componente raíz de datos que solo usa una hoja. Súbelo cuando dos componentes lo necesiten, y solo hasta su antepasado común.

## Ejercicios

En la heladería Los Alpes, el buscador guarda lo que escribes en su propio estado, así que la lista de sabores no se entera y el botón «Borrar búsqueda», que está fuera del buscador, no tiene cómo vaciarlo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Levanta la búsqueda de la heladería",
  "consigna": "Levanta el texto de la búsqueda a App en tres pasos: quita el estado de Buscador, haz que reciba el texto y una función onCambiar, y guarda el texto en App. Con él, App calcula los sabores visibles (sin distinguir mayúsculas) y «Borrar búsqueda» lo vacía. ListaSabores ya está terminado. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Buscador from './Buscador'\nimport ListaSabores from './ListaSabores'\nimport './estilos.css'\n\nconst SABORES = [\n  { id: 'turron', nombre: 'Turrón de Jijona' },\n  { id: 'chocolate', nombre: 'Chocolate negro' },\n  { id: 'chocomenta', nombre: 'Chocolate con menta' },\n  { id: 'limon', nombre: 'Limón' },\n  { id: 'fresa', nombre: 'Fresa' },\n  { id: 'horchata', nombre: 'Horchata' },\n  { id: 'pistacho', nombre: 'Pistacho' },\n  { id: 'mango', nombre: 'Mango' },\n]\n\nexport default function App() {\n  // 1. El texto de la búsqueda tiene que vivir aquí, en el padre común\n  // 2. Calcula los sabores visibles a partir de ese texto\n  const visibles = SABORES\n\n  return (\n    <main>\n      <h1>Heladería Los Alpes</h1>\n      <div className=\"busqueda\">\n        <Buscador />\n        {/* 3. Este botón tiene que vaciar la búsqueda */}\n        <button type=\"button\">Borrar búsqueda</button>\n      </div>\n      <p>\n        Mostrando {visibles.length} de {SABORES.length} sabores\n      </p>\n      <ListaSabores sabores={visibles} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Buscador.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Buscador() {\n  const [texto, setTexto] = useState('')\n\n  return (\n    <label>\n      Buscar sabor\n      <input type=\"search\" value={texto} onChange={(e) => setTexto(e.target.value)} />\n    </label>\n  )\n}\n"
    },
    {
      "nombre": "ListaSabores.jsx",
      "codigo": "export default function ListaSabores({ sabores }) {\n  if (sabores.length === 0) {\n    return <p>No nos queda ningún sabor así.</p>\n  }\n\n  return (\n    <ul className=\"sabores\">\n      {sabores.map((sabor) => (\n        <li key={sabor.id}>{sabor.nombre}</li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\n.busqueda {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: end;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\ninput,\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.6rem;\n}\n\n.sabores {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.sabores li {\n  padding: 0.4rem 0.6rem;\n  border-radius: 8px;\n  background: #fdf2f8;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al escribir «choco» en «Buscar sabor», el recuento dice «Mostrando 2 de 8 sabores»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar sabor",
            "texto": "choco"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 2 de 8 sabores"
      }
    },
    {
      "descripcion": "Al escribir «choco», el limón desaparece de la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar sabor",
            "texto": "choco"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Limón"
        }
      }
    },
    {
      "descripcion": "Si ningún sabor coincide, aparece «No nos queda ningún sabor así.»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar sabor",
            "texto": "kiwi"
          }
        }
      ],
      "espera": {
        "texto": "No nos queda ningún sabor así."
      }
    },
    {
      "descripcion": "Al pulsar «Borrar búsqueda», el campo se vacía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar sabor",
            "texto": "fresa"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Borrar búsqueda"
          }
        }
      ],
      "espera": {
        "etiqueta": "Buscar sabor",
        "valor": ""
      }
    },
    {
      "descripcion": "Al pulsar «Borrar búsqueda», vuelven a verse los 8 sabores",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar sabor",
            "texto": "fresa"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Borrar búsqueda"
          }
        }
      ],
      "espera": {
        "texto": "Mostrando 8 de 8 sabores"
      }
    }
  ]
}
```

Cuando lo tengas, fíjate en lo que ha cambiado de papel: `Buscador` era un componente no controlado y ahora es controlado. Ya no decide qué pone el campo; enseña lo que le dice `App` y le avisa con `onCambiar` cada vez que escribes. Por eso un botón que no es suyo puede vaciarlo.

**Retos para seguir practicando** (sin comprobación automática):

1. En el observatorio, haz que al pulsar el panel que ya está abierto se cierre, y que puedan quedar todos cerrados. ¿Qué valor de `abiertoId` significa «ninguno»?
2. Añade al observatorio un botón «Abrir todos». ¿Te sigue valiendo un solo id? Cambia el estado a un array de ids (o a un `Set`, que también se copia en vez de modificarse) y ajusta `abierto` y `onAbrir`.
3. Kilómetros y millas: dos campos, «Kilómetros» y «Millas», que siempre dicen lo mismo, cada uno en su unidad (1 milla son 1,609 km). Escribe en cualquiera y el otro se pone al día. Pista: guarda un solo dato en el padre y calcula el otro.
4. En la heladería, añade a cada sabor un botón «Favorito» y, en la cabecera, un «Tienes 2 favoritos». ¿Dónde vive la lista de favoritos? ¿Qué tiene que recibir `ListaSabores` ahora?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Sharing State Between Components",
      "descripcion": "La página de react.dev en la que se basa esta lección, con el acordeón original, los componentes controlados y no controlados y dos retos resueltos.",
      "url": "https://react.dev/learn/sharing-state-between-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Responding to Events",
      "descripcion": "Pasar manejadores como props y ponerles nombre de lo que significan. Es la lección 15.",
      "url": "https://react.dev/learn/responding-to-events",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Thinking in React",
      "descripcion": "El método completo para pasar de un diseño a componentes, con un paso dedicado a decidir dónde vive cada estado y otro al flujo de datos inverso. Es la lección 31.",
      "url": "https://react.dev/learn/thinking-in-react",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Passing Data Deeply with Context",
      "descripcion": "Cómo hacer llegar un dato a toda una rama sin pasarlo de mano en mano por cada nivel. Es la lección 28.",
      "url": "https://react.dev/learn/passing-data-deeply-with-context",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Accordion Pattern",
      "descripcion": "El patrón de acordeón accesible de la WAI: un botón dentro de cada encabezado, con aria-expanded, como el del observatorio.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/accordion/",
      "etiqueta": "WAI-ARIA APG"
    },
    {
      "titulo": "Radix: Accordion",
      "descripcion": "Un acordeón de librería que se puede usar controlado (value y onValueChange) o no controlado (defaultValue). Lo verás en la lección 80.",
      "url": "https://www.radix-ui.com/primitives/docs/components/accordion",
      "etiqueta": "Radix"
    }
  ]
}
```
