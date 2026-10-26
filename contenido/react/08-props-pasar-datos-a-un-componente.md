# Props: pasar datos a un componente

- **Módulo:** Describir la interfaz
- **Slug:** `props-pasar-datos-a-un-componente` (autogenerado del título)
- **Orden:** 80
- **Fuentes:** [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) — ver `contenido/react/TEMARIO.md` #8

---

## Qué es y para qué sirve

Un componente que siempre pinta lo mismo sirve para poco. Esta tarjeta de la agenda de una sala de conciertos solo sabe anunciar un concierto:

```jsx
function Concierto() {
  return (
    <article className="concierto">
      <h2>Orquesta Tranvía</h2>
      <p>12 de mayo · 18 €</p>
    </article>
  )
}
```

Para anunciar el mes entero harían falta tantos componentes como conciertos, todos iguales salvo los datos. Las **props** resuelven esto: son los datos que un componente padre le pasa a un hijo para que este los pinte.

> **Las props son los argumentos de un componente: el padre las escribe como atributos en el JSX y el hijo las recibe todas juntas en un único objeto.**

En la lección 7 viste de dónde sale ese objeto. `<Concierto artista="Orquesta Tranvía" />` crea un elemento con `props: { artista: 'Orquesta Tranvía' }`, y cuando React renderiza ese elemento llama a `Concierto` pasándole ese mismo objeto. Un componente es una función, y las props son su argumento.

## Pasar props y leerlas

Son dos pasos. **El padre las pasa** como atributos de la etiqueta: entre comillas si son una cadena de texto, entre llaves para cualquier otro valor (lección 6). **El hijo las lee** desestructurando su parámetro, y las usa como variables normales:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La misma tarjeta, ahora con props",
  "codigo": "function Concierto({ artista, fecha, precio }) {\n  return (\n    <article className=\"concierto\">\n      <h2>{artista}</h2>\n      <p>{fecha} · {precio} €</p>\n    </article>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Sala Vinilo · Mayo</h1>\n      <Concierto artista=\"Orquesta Tranvía\" fecha=\"12 de mayo\" precio={18} />\n      <Concierto artista=\"Marta Lobo Trío\" fecha=\"19 de mayo\" precio={22} />\n    </main>\n  )\n}",
  "css": "main {\n  display: grid;\n  gap: 0.75rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.concierto {\n  padding: 0.75rem 1rem;\n  border: 1px solid #d4d4d8;\n  border-left: 4px solid #7c3aed;\n  border-radius: 8px;\n}\n\n.concierto h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.concierto p {\n  margin: 0.15rem 0;\n}",
  "anotaciones": [
    {
      "fragmento": "function Concierto({ artista, fecha, precio })",
      "nota": "Las llaves dentro de los paréntesis desestructuran el único argumento del componente, el objeto props. Es lo mismo que escribir function Concierto(props) y después const artista = props.artista, y así con cada una."
    },
    {
      "fragmento": "<h2>{artista}</h2>",
      "nota": "Dentro del componente, cada prop es una variable más. Concierto no sabe ni le importa quién le pasa los datos."
    },
    {
      "fragmento": "artista=\"Orquesta Tranvía\"",
      "nota": "Una cadena de texto se pasa entre comillas, como un atributo de HTML."
    },
    {
      "fragmento": "precio={18}",
      "nota": "Cualquier otro valor va entre llaves: aquí un número de verdad, no el texto \"18\"."
    },
    {
      "fragmento": "<Concierto artista=\"Marta Lobo Trío\" fecha=\"19 de mayo\" precio={22} />",
      "nota": "La misma función con otros datos: esta es la gracia. Una sola definición sirve para todas las tarjetas."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Si prefieres no desestructurar, puedes recibir el objeto entero y leerlo con puntos. Funciona igual:

```jsx
function Concierto(props) {
  return <h2>{props.artista}</h2>
}
```

La desestructuración es la forma habitual porque la firma del componente te dice, de un vistazo, qué props usa. Lo que no cambia es que **hay un solo argumento**: `function Concierto(artista, fecha)` no recibe dos props, y en Errores típicos verás qué pasa si lo intentas.

## Valores por defecto

Si una prop puede faltar, dale un valor por defecto en la propia desestructuración, con `=`:

```jsx
function Concierto({ artista, fecha, precio = 15 }) {
  // si el padre no pasa precio, vale 15
}
```

Ojo con cuándo se aplica: **solo cuando la prop falta o vale `undefined`**. No es una regla de React, sino la de los valores por defecto de JavaScript, la misma que en cualquier función.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Genero({ nombre = 'Sin clasificar' }) {\n  return <li>Género: «{nombre}»</li>\n}\n\nexport default function App() {\n  return (\n    <ul>\n      <Genero />\n      <Genero nombre={undefined} />\n      <Genero nombre={null} />\n      <Genero nombre=\"\" />\n    </ul>\n  )\n}",
  "opciones": [
    "Los cuatro dicen «Sin clasificar»",
    "Los dos primeros dicen «Sin clasificar» y los dos últimos, «»",
    "Solo el primero dice «Sin clasificar»; los demás, «»"
  ],
  "correcta": 1,
  "explicacion": "El valor por defecto solo se usa si la prop falta o vale undefined, que para JavaScript es lo mismo. null y la cadena vacía son valores que el padre ha pasado a propósito, así que se respetan, y React no pinta nada ni para null ni para una cadena vacía. Con 0 o false pasa igual: el valor por defecto no se aplica."
}
```

Si alguna vez ves `Concierto.defaultProps = { precio: 15 }`, es la forma antigua de hacer lo mismo. React 19 la ignora en los componentes de función, y sin avisar: el precio llegaría como `undefined`. Usa siempre el valor por defecto de la desestructuración (la lección 91 repasa estas APIs antiguas).

## Cualquier valor puede ser una prop

Un atributo de HTML siempre es texto. Una prop, en cambio, puede ser **cualquier valor de JavaScript**: un número, un booleano, un array, un objeto, una función e incluso un elemento de JSX. Esta tarjeta recibe uno de cada:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una prop de cada tipo",
  "consigna": "Mira en App.jsx qué valor recibe cada prop y cómo la usa Cartel.jsx. Después prueba: cambia agotado a true, añade un género al array, cambia la ciudad de la sala y sustituye el aviso por otro elemento, por ejemplo <p>Concierto acústico</p>.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Cartel from './Cartel'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Próximos conciertos</h1>\n      <Cartel\n        artista=\"Los Faros del Norte\"\n        precio={20}\n        agotado={false}\n        generos={['rock', 'blues']}\n        sala={{ nombre: 'Sala Vinilo', ciudad: 'Bilbao' }}\n        formatearPrecio={(euros) => euros.toFixed(2).replace('.', ',') + ' €'}\n        aviso={<p className=\"aviso\">Últimas entradas</p>}\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Cartel.jsx",
      "codigo": "export default function Cartel({ artista, precio, agotado, generos, sala, formatearPrecio, aviso }) {\n  return (\n    <article className=\"concierto\">\n      <h2>{artista}</h2>\n      {aviso}\n      <p>{sala.nombre}, {sala.ciudad}</p>\n      <p>Géneros: {generos.join(', ')}</p>\n      <p>Entrada: {formatearPrecio(precio)}</p>\n      <button disabled={agotado}>Comprar entradas</button>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.concierto {\n  padding: 0.75rem 1rem;\n  border: 1px solid #d4d4d8;\n  border-left: 4px solid #7c3aed;\n  border-radius: 8px;\n}\n\n.concierto h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.concierto p {\n  margin: 0.15rem 0;\n}\n\n.aviso {\n  color: #b45309;\n  font-weight: 600;\n}\n\nbutton {\n  margin-top: 0.5rem;\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Cada tipo tiene su detalle:

- **Números y booleanos** van entre llaves: `precio={20}`, `agotado={false}`. Si escribes solo `agotado`, sin valor, vale `true`, como el atributo `disabled` de HTML.
- **Objetos** con llaves dobles: en `sala={{ nombre: 'Sala Vinilo', ciudad: 'Bilbao' }}`, las de fuera son las de JSX y las de dentro, el objeto. Lo mismo que con `style`, que también recibe un objeto (lección 6).
- **Funciones**: el hijo decide cuándo llamarla. Aquí `Cartel` llama a `formatearPrecio` para escribir el precio a su manera. Las props de tipo función más habituales son las de eventos, como `onClick`, que llegan en la lección 15.
- **Elementos de JSX**: en la lección 7 viste que un elemento es un objeto, así que viaja como cualquier otro valor, y el hijo lo coloca donde quiere con `{aviso}`. Cuando el JSX va entre la etiqueta de apertura y la de cierre, llega en una prop especial, `children`: es la lección 9.

## Reenviar props con `{...props}`

A veces un componente no usa sus props: solo se las pasa a otro. Escribirlas una a una es repetitivo:

```jsx
function ConciertoDestacado({ artista, fecha, precio }) {
  return (
    <div className="destacado">
      <Concierto artista={artista} fecha={fecha} precio={precio} />
    </div>
  )
}
```

Con la sintaxis de propagación de JSX, `{...props}`, se reenvían todas de golpe:

```jsx
function ConciertoDestacado(props) {
  return (
    <div className="destacado">
      <Concierto {...props} />
    </div>
  )
}
```

Por debajo es la propagación de objetos de JavaScript que ya conoces: el compilador lo convierte en `_jsx(Concierto, { ...props })`. Por eso **el orden importa**. En `<Concierto {...props} precio={0} />`, el compilador escribe `{ ...props, precio: 0 }` y gana el `0`, que va detrás. En `<Concierto precio={0} {...props} />`, gana el precio que traiga `props`.

**Úsalo con moderación.** Tiene dos problemas. El primero, que esconde qué props usa el componente: para saber qué acepta `ConciertoDestacado` tienes que irte a leer `Concierto`. El segundo, que reenvía también lo que no toca. Si las props acaban en una etiqueta de HTML, todo lo que no sea un atributo válido llega al DOM:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Reenviarlo todo al DOM",
  "consigna": "Mira la consola: la prop destacada ha llegado al span, y React avisa. Arréglalo en Etiqueta.jsx: saca de props lo que es del componente y reenvía solo el resto, con function Etiqueta({ texto, destacada, ...resto }) y {...resto} en el span. Después usa destacada para elegir la clase: className={destacada ? 'etiqueta destacada' : 'etiqueta'}.",
  "archivos": [
    {
      "nombre": "Etiqueta.jsx",
      "codigo": "export default function Etiqueta(props) {\n  return (\n    <span className=\"etiqueta\" {...props}>\n      {props.texto}\n    </span>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Etiqueta from './Etiqueta'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <p>\n      <Etiqueta texto=\"Jazz\" title=\"Género musical\" />\n      <Etiqueta texto=\"Soul\" destacada />\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "p {\n  display: flex;\n  gap: 0.5rem;\n  font-family: system-ui, sans-serif;\n}\n\n.etiqueta {\n  padding: 0.2rem 0.6rem;\n  border-radius: 999px;\n  background: #ede9fe;\n}\n\n.destacada {\n  background: #fde68a;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "Etiqueta.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El aviso de la consola es este:

```text
Received `true` for a non-boolean attribute `destacada`.

If you want to write it to the DOM, pass a string instead: destacada="true" or destacada={value.toString()}.
```

Y hay un problema que no avisa: `texto="Jazz"` también ha llegado al `span` como un atributo `texto` que no significa nada en HTML. React solo se queja de algunas props. Con una en camelCase, como `esNovedad`, el aviso sería otro: «React does not recognize the `esNovedad` prop on a DOM element».

La forma sana de usar la propagación es la del arreglo: **saca lo que es tuyo y reenvía el resto**. El componente deja claro qué props son suyas, y al DOM solo le llega lo que el DOM entiende, como `title`, `id` o `aria-label`. Y si te ves reenviando props en casi todos tus componentes, la documentación de React lo dice claro: suele ser señal de que te conviene pasar JSX como hijo, con `children` (lección 9).

## Las props cambian con el tiempo

Las props no son fijas. Cada vez que el padre se vuelve a renderizar, crea elementos nuevos y le pasa a su hijo **un objeto de props nuevo**, con los valores de ese momento. En este ejemplo, `App` guarda qué canción está sonando y se la pasa a `AhoraSuena`. Para guardarla usa estado, que verás en la lección 16: por ahora solo importa que, al pulsar el botón, `App` se vuelve a renderizar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las mismas props, otros valores en cada render",
  "consigna": "Pulsa «Siguiente canción» varias veces. Después abre AhoraSuena.jsx: no tiene estado ni sabe nada del botón. Solo pinta las props que recibe en cada render.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport AhoraSuena from './AhoraSuena'\nimport './estilos.css'\n\nconst repertorio = ['Marea baja', 'Faros apagados', 'Carretera al norte', 'Última ronda']\n\nexport default function App() {\n  const [posicion, setPosicion] = useState(0)\n\n  return (\n    <main>\n      <h1>En directo desde la Sala Vinilo</h1>\n      <AhoraSuena titulo={repertorio[posicion]} numero={posicion + 1} total={repertorio.length} />\n      <button onClick={() => setPosicion((posicion + 1) % repertorio.length)}>\n        Siguiente canción\n      </button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "AhoraSuena.jsx",
      "codigo": "export default function AhoraSuena({ titulo, numero, total }) {\n  return (\n    <section className=\"pantalla\">\n      <p>Canción {numero} de {total}</p>\n      <h2>{titulo}</h2>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  justify-items: start;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.pantalla {\n  padding: 0.75rem 1rem;\n  border-radius: 8px;\n  background: #1e1b4b;\n  color: #e0e7ff;\n}\n\n.pantalla p,\n.pantalla h2 {\n  margin: 0;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

En cada render, `AhoraSuena` recibe una **instantánea** de sus props: los datos de ese momento, no de siempre. El componente no guarda nada; cuando el padre le pasa props nuevas, React lo vuelve a llamar con ellas y la pantalla se pone al día.

## Las props son de solo lectura

Que cambien con el tiempo no quiere decir que el hijo pueda cambiarlas. **Las props son de solo lectura**: las decide el padre, y el hijo solo las lee. En desarrollo, React congela el objeto `props` con `Object.freeze` (lo viste en la lección 7), así que intentar modificarlo rompe el componente:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Modificar una prop",
  "consigna": "La vista previa enseña el error que salta al modificar props. Arréglalo sin tocar props: calcula el total en una variable nueva, const total = props.precio + 3, y pinta total.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "function Entrada(props) {\n  props.precio = props.precio + 3\n  return <p>Precio con gastos de gestión: {props.precio} €</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Entrada precio={18} />\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El mensaje es «Cannot assign to read only property 'precio' of object '#<Object>'». La solución es **calcular un valor nuevo** a partir de la prop, sin tocarla: `const total = props.precio + 3`.

Si lo que necesitas es que algo cambie cuando el usuario hace algo, eso no son props: es **estado**, y llega en la lección 16. Un componente nunca cambia sus props. Si necesita otras, es el padre quien tiene que pasárselas.

## `key` y `ref`: dos props que no llegan como las demás

Hay dos nombres de prop que React trata de forma especial:

- **`key`** sirve para que React distinga los elementos de una lista (lección 11), y React se la queda: no llega al componente. Si el hijo intenta leer `props.key`, recibe `undefined` y React avisa en la consola. Si el hijo necesita ese dato, pásaselo también con otro nombre, como `id`.
- **`ref`** sirve para llegar al nodo del DOM de un componente. Desde React 19 llega a los componentes de función como una prop normal; antes hacía falta envolverlos con `forwardRef`. Lo verás en el módulo 5.

Este es el aviso de React 19.3 al leer `props.key` en un componente `Fila`:

```text
Fila: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)
```

## Cómo elegir las props de un componente

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Nómbralas desde el punto de vista del componente",
      "texto": "Concierto recibe artista y fecha, no datosDelConciertoDeMayo. Un buen nombre sirve igual le pase los datos quien se los pase."
    },
    {
      "titulo": "Un objeto o varias props: las dos valen",
      "texto": "concierto={c} es más corto si los datos ya llegan agrupados; artista={c.artista} fecha={c.fecha} deja más claro qué usa el componente. La documentación de React da las dos por buenas."
    },
    {
      "titulo": "Los booleanos, como adjetivos",
      "texto": "agotado, destacado, abierto. Así <Concierto agotado /> se lee solo, como el disabled de un botón."
    },
    {
      "titulo": "Valores por defecto para lo opcional",
      "texto": "Si casi siempre pasas lo mismo, conviértelo en el valor por defecto y pásalo solo cuando cambie."
    },
    {
      "titulo": "Las funciones de evento, con on delante",
      "texto": "onComprar, onSeleccionar: on más un verbo, como el onClick de los botones. Las verás en la lección 15. Una función que no responde a un evento lleva un nombre normal, como formatearPrecio."
    },
    {
      "titulo": "React no comprueba las props",
      "texto": "Si el padre se equivoca de nombre o de tipo, no hay error: el hijo recibe undefined o un valor que no esperaba. TypeScript sí lo comprueba, en el módulo 10."
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
      "mito": "Las props son como los atributos de HTML: solo admiten texto",
      "realidad": "Admiten cualquier valor de JavaScript: números, booleanos, arrays, objetos, funciones y elementos de JSX. Las comillas son solo para las cadenas; todo lo demás va entre llaves."
    },
    {
      "mito": "Si el hijo cambia una prop, el padre se entera",
      "realidad": "Los datos solo bajan, del padre al hijo. El hijo no puede modificar sus props, y aunque modificara un objeto recibido, el padre no se volvería a renderizar. Para avisar al padre, este le pasa una función: lo verás en las lecciones 15 y 25."
    },
    {
      "mito": "Un componente solo se vuelve a renderizar si cambian sus props",
      "realidad": "Por defecto, cuando un componente se renderiza, también se renderizan todos sus hijos, cambien o no sus props. Suele ser barato. Cuándo importa, y cómo evitarlo, lo verás en las lecciones 66 y 67."
    }
  ]
}
```

## Errores típicos

**Olvidar las llaves de la desestructuración.** Sin ellas, la firma parece pedir dos argumentos, pero el componente solo recibe uno:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos parámetros donde solo llega uno",
  "consigna": "La vista previa enseña el error de React. Arréglalo añadiendo las llaves que faltan en la firma de Concierto.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "function Concierto(artista, fecha) {\n  return (\n    <article>\n      <h2>{artista}</h2>\n      <p>{fecha}</p>\n    </article>\n  )\n}\n\nexport default function App() {\n  return <Concierto artista=\"Orquesta Tranvía\" fecha=\"12 de mayo\" />\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El error es «Objects are not valid as a React child (found: object with keys {artista, fecha}). If you meant to render a collection of children, use an array instead». Sin llaves, `artista` no es la prop `artista`: es el objeto props entero, con sus dos claves, y `fecha` es un segundo argumento que nunca llega. React no sabe pintar un objeto dentro del `h2`. Con `function Concierto({ artista, fecha })` se arregla.

**Pasar un número entre comillas.**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Entrada({ precio }) {\n  return <p>Total con gastos: {precio + 3} €</p>\n}\n\nexport default function App() {\n  return <Entrada precio=\"15\" />\n}",
  "opciones": [
    "Total con gastos: 18 €",
    "Total con gastos: 153 €",
    "Total con gastos: NaN €"
  ],
  "correcta": 1,
  "explicacion": "Entre comillas, precio es la cadena \"15\", y en JavaScript \"15\" + 3 concatena: \"153\". Para pasar un número, usa llaves: precio={15}. Las comillas son solo para las cadenas de texto."
}
```

**Equivocarse de nombre.** Si el padre escribe `<Concierto nombre="Orquesta Tranvía" />` y el componente lee `artista`, no hay error ni aviso: `artista` vale `undefined` y el encabezado sale vacío. React no sabe qué props espera tu componente, así que no puede avisarte.

**Modificar un objeto que llega por props.** React solo congela el primer nivel: el objeto `props`. Los objetos y arrays que van dentro no están congelados, así que modificarlos no da ningún error:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const sala = { nombre: 'Sala Vinilo', aforo: 300 }\n\nfunction Ficha({ sala }) {\n  sala.aforo = 0\n  return <p>{sala.nombre}: {sala.aforo} plazas</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Ficha sala={sala} />\n      <p>Aforo total: {sala.aforo}</p>\n    </main>\n  )\n}",
  "opciones": [
    "Un error, porque las props son de solo lectura",
    "«Sala Vinilo: 0 plazas» y «Aforo total: 0»",
    "«Sala Vinilo: 0 plazas» y «Aforo total: 300»"
  ],
  "correcta": 2,
  "explicacion": "Object.freeze solo congela el objeto props, no lo que hay dentro, así que Ficha cambia sin error el objeto del padre. App ya había leído el aforo, 300, al crear sus elementos, antes de que React llamara a Ficha: la pantalla queda incoherente. Calcula un valor nuevo en lugar de modificar lo que recibes."
}
```

Es el mismo fallo que modificar una prop, solo que nadie te avisa. La lección 12 explica por qué un componente nunca debe cambiar nada que exista fuera de él mientras se renderiza.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La agenda de mayo, con props",
  "consigna": "Las dos tarjetas dicen lo mismo porque Concierto ignora sus props. Haz que las lea, con 15 € como precio por defecto, y que pinte los géneros separados por comas. Después añade en App.jsx el concierto de Los Faros del Norte, sin precio. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "Concierto.jsx",
      "codigo": "// Haz que Concierto pinte las props que recibe: artista, fecha, generos y precio.\n// Si no le pasan precio, la entrada cuesta 15 €.\nexport default function Concierto() {\n  return (\n    <article className=\"concierto\">\n      <h2>Orquesta Tranvía</h2>\n      <p>Fecha: 12 de mayo</p>\n      <p>Géneros: swing, jazz</p>\n      <p>Entrada: 18 €</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Concierto from './Concierto'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Sala Vinilo · Mayo</h1>\n      <Concierto artista=\"Orquesta Tranvía\" fecha=\"12 de mayo\" generos={['swing', 'jazz']} precio={18} />\n      <Concierto artista=\"Marta Lobo Trío\" fecha=\"19 de mayo\" generos={['bolero', 'son']} precio={22} />\n      {/* Añade el concierto de Los Faros del Norte: 26 de mayo, rock y blues, sin precio */}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.concierto {\n  padding: 0.75rem 1rem;\n  border: 1px solid #d4d4d8;\n  border-left: 4px solid #7c3aed;\n  border-radius: 8px;\n}\n\n.concierto h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.concierto p {\n  margin: 0.15rem 0;\n}\n"
    }
  ],
  "archivoInicial": "Concierto.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La segunda tarjeta tiene «Marta Lobo Trío» como encabezado",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Marta Lobo Trío"
      }
    },
    {
      "descripcion": "Cada tarjeta enseña su fecha: la de Marta Lobo Trío, «Fecha: 19 de mayo»",
      "pasos": [],
      "espera": {
        "texto": "Fecha: 19 de mayo"
      }
    },
    {
      "descripcion": "Los géneros salen del array, separados por comas: «Géneros: bolero, son»",
      "pasos": [],
      "espera": {
        "texto": "Géneros: bolero, son"
      }
    },
    {
      "descripcion": "Aparece el concierto de «Los Faros del Norte»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Los Faros del Norte"
      }
    },
    {
      "descripcion": "Sin precio, la entrada cuesta lo que marca el valor por defecto: «Entrada: 15 €»",
      "pasos": [],
      "espera": {
        "texto": "Entrada: 15 €"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade a `Concierto` una prop `agotado` y úsala en un botón «Comprar entradas» con `disabled={agotado}`. Pásala solo a uno de los conciertos, con la forma corta: `agotado`.
2. Haz que `Concierto` reciba un objeto `sala`, con `nombre` y `ciudad`, y pinte «Sala Vinilo, Bilbao». ¿Te parece mejor un objeto o dos props sueltas? Piensa en quién llama al componente.
3. Crea un `ConciertoDestacado` que envuelva a `Concierto` en un `div` con la clase `destacado` y le reenvíe todas sus props con `{...props}`. Después compara `<Concierto precio={0} {...props} />` con `<Concierto {...props} precio={0} />`: ¿cuál regala las entradas?
4. Escribe un componente `Precio` que reciba `euros` y una función `formatear`, con un valor por defecto que escriba «18 €» cuando `euros` vale 18. Úsalo una vez sin pasarle `formatear` y otra con una función que escriba «18,00 EUR».

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Passing Props to a Component",
      "descripcion": "El capítulo oficial sobre props: pasarlas, leerlas, valores por defecto, la propagación con {...props} y cómo cambian con el tiempo.",
      "url": "https://react.dev/learn/passing-props-to-a-component",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19 Upgrade Guide",
      "descripcion": "Entre otros cambios, por qué desaparece defaultProps en los componentes de función y se sustituye por los valores por defecto de JavaScript.",
      "url": "https://react.dev/blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Destructuring",
      "descripcion": "La desestructuración, con su apartado sobre desestructurar el objeto que recibe una función como parámetro.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Default parameters",
      "descripcion": "Por qué un valor por defecto se aplica con undefined y no con null: la regla de JavaScript que sigue React.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Spread syntax",
      "descripcion": "La sintaxis de propagación de objetos, la misma que usa {...props}, y por qué gana la última propiedad.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Object.freeze()",
      "descripcion": "Cómo congela React las props en desarrollo, y por qué la congelación es superficial: los objetos de dentro se pueden seguir cambiando.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze",
      "etiqueta": "MDN"
    }
  ]
}
```
