# Componentes de clase, y lo que React 19 dejó atrás (`forwardRef`, `Context.Provider`, `defaultProps`...)

- **Módulo:** Leer React antiguo
- **Slug:** `componentes-de-clase-y-lo-que-react-19-dejo-atras-forwardref-context-provider-defaultprops` (autogenerado del título)
- **Orden:** 910
- **Fuentes:** [Component](https://react.dev/reference/react/Component) + [Legacy React APIs](https://react.dev/reference/react/legacy) + [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) — ver `contenido/react/TEMARIO.md` #91

---

## Qué es y para qué sirve

Todo este temario escribe componentes como funciones. Pero hasta React 16.8, en 2019, **una función no podía tener estado ni ciclo de vida**: para eso había que escribir una clase. Mucho código que sigue en producción, muchas librerías y muchas respuestas de Internet están escritos así, y React 19.3 los sigue ejecutando sin problema.

Esta lección es para **leer ese código y saber traducirlo**:

- Cómo funciona un componente de clase: `render`, `this.props`, `this.state`, `setState` y el eterno problema de `this` en los manejadores.
- Los métodos de ciclo de vida más comunes y su equivalente con Hooks.
- Por qué los *error boundaries* son lo único que todavía obliga a escribir una clase.
- Qué hace React 19.3.1 con cada API que React 19 dejó atrás: cuáles siguen funcionando, cuáles se ignoran sin avisar y cuáles rompen la app. Todo comprobado en la vista previa, con los mensajes reales.

No hace falta que escribas clases en código nuevo: react.dev lo desaconseja. Pero tienes que poder leerlas.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "De las clases a los Hooks, y lo que React 19 retiró",
  "items": [
    {
      "fecha": "2015",
      "titulo": "React 0.13: clases de JavaScript",
      "texto": "Llega class X extends React.Component como alternativa a React.createClass. Hasta 2019 fue la forma habitual de escribir un componente con estado."
    },
    {
      "fecha": "2017",
      "titulo": "React 15.5: PropTypes y createClass, fuera",
      "texto": "Se mueven a sus propios paquetes (prop-types y create-react-class) y empiezan a avisar al usarlos desde React."
    },
    {
      "fecha": "2018",
      "titulo": "React 16.3 y 16.6",
      "texto": "Llegan createContext, forwardRef y createRef (16.3), y contextType y memo (16.6). Las string refs, el contexto antiguo y findDOMNode pasan a ser obsoletos."
    },
    {
      "fecha": "2019",
      "titulo": "React 16.8: Hooks",
      "texto": "useState, useEffect y compañía: las funciones ya pueden tener estado y efectos. Las clases dejan de hacer falta para casi todo."
    },
    {
      "fecha": "2022",
      "titulo": "React 18: createRoot",
      "texto": "react-dom/client sustituye a ReactDOM.render, que pasa a ser obsoleto."
    },
    {
      "fecha": "2024",
      "titulo": "React 19: limpieza",
      "texto": "Se eliminan propTypes, defaultProps en funciones, el contexto antiguo, las string refs, ReactDOM.render y findDOMNode. ref pasa a ser una prop y el contexto se provee con <Contexto>."
    }
  ]
}
```

## Un componente de clase, pieza a pieza

Un componente de clase es una clase de JavaScript que **extiende `Component`** y tiene un método **`render`** que devuelve el JSX. React crea una instancia de la clase por cada `<FichaJugador />` que pintas y la conserva mientras está montado; las props, el estado y los métodos cuelgan de `this`. En el club de ajedrez Enroque:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Una ficha de jugador escrita como clase",
  "codigo": "import { Component } from 'react'\n\nclass FichaJugador extends Component {\n  state = { siguiendo: false }\n\n  manejarSeguir = () => {\n    this.setState({ siguiendo: !this.state.siguiendo })\n  }\n\n  render() {\n    const { nombre, elo } = this.props\n\n    return (\n      <article className=\"ficha\">\n        <h2>{nombre}</h2>\n        <p>Elo: {elo}</p>\n        <button onClick={this.manejarSeguir}>\n          {this.state.siguiendo ? 'Dejar de seguir' : 'Seguir'}\n        </button>\n      </article>\n    )\n  }\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Club de ajedrez Enroque</h1>\n      <FichaJugador nombre=\"Lucía Ferrer\" elo={1874} />\n      <FichaJugador nombre=\"Marcos Ibáñez\" elo={1650} />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.ficha {\n  max-width: 18rem;\n  margin-bottom: 0.75rem;\n  padding: 0.25rem 1rem 1rem;\n  border: 1px solid #a8a29e;\n  border-radius: 8px;\n}\n\n.ficha h2 {\n  margin: 0.5rem 0 0.25rem;\n  font-size: 1.1rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "class FichaJugador extends Component",
      "nota": "Una clase que hereda de Component, que se importa de react. El nombre va con mayúscula, como cualquier componente, y se usa igual en el JSX: <FichaJugador nombre=\"…\" />."
    },
    {
      "fragmento": "state = { siguiendo: false }",
      "nota": "El estado de una clase es siempre un objeto, uno solo, guardado en this.state. Esto es un campo de clase; en código más antiguo lo verás asignado dentro de un constructor."
    },
    {
      "fragmento": "manejarSeguir = () => {",
      "nota": "Un manejador escrito como campo con función flecha. La flecha fija this a la instancia, y por eso se puede pasar tal cual a onClick. Lo verás enseguida: con un método normal, this se pierde."
    },
    {
      "fragmento": "this.setState({ siguiendo: !this.state.siguiendo })",
      "nota": "Para cambiar el estado se llama a this.setState con los campos que cambian. React fusiona ese objeto con el estado actual y vuelve a llamar a render."
    },
    {
      "fragmento": "render() {",
      "nota": "El único método obligatorio. Es el equivalente al cuerpo de un componente de función: lee props y estado y devuelve JSX. Tiene que ser puro, igual que un componente de función (lección 12)."
    },
    {
      "fragmento": "const { nombre, elo } = this.props",
      "nota": "Las props llegan en this.props, no como argumento. Desestructurarlas al principio de render es muy habitual en código de clases."
    },
    {
      "fragmento": "<FichaJugador nombre=\"Lucía Ferrer\" elo={1874} />",
      "nota": "Clases y funciones se mezclan sin problema: App es una función y pinta dos fichas de clase, cada una con su propia instancia y su propio estado."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

La misma ficha como función, para que veas qué va con qué:

```jsx
function FichaJugador({ nombre, elo }) {
  const [siguiendo, setSiguiendo] = useState(false)

  function manejarSeguir() {
    setSiguiendo(!siguiendo)
  }

  return (
    <article className="ficha">
      <h2>{nombre}</h2>
      <p>Elo: {elo}</p>
      <button onClick={manejarSeguir}>{siguiendo ? 'Dejar de seguir' : 'Seguir'}</button>
    </article>
  )
}
```

Las props pasan de `this.props` a los parámetros; el estado, de un objeto en `this.state` a un `useState` por dato; el manejador, de campo de clase a función normal; y `render` desaparece, porque **la propia función es el render**. Hooks como `useState` solo funcionan en funciones: dentro de una clase, React lanza «Invalid hook call. Hooks can only be called inside of the body of a function component.».

## El estado de una clase: un objeto que se fusiona

`setState` no sustituye el estado: **lo fusiona**. Le pasas solo los campos que cambian y el resto se queda como estaba. Es la diferencia más importante con los `set` de `useState`, que sustituyen el valor entero (por eso en la lección 20 copiabas el objeto con `...`).

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "class Partida extends Component {\n  state = { blancas: 'Lucía', negras: 'Marcos', turno: 'blancas' }\n\n  pasarTurno = () => {\n    this.setState({ turno: 'negras' })\n  }\n\n  // render() pinta los tres campos y un botón que llama a pasarTurno\n}\n\n// Después de pulsar el botón, ¿cuánto vale this.state?",
  "opciones": [
    "{ turno: 'negras' }",
    "{ blancas: 'Lucía', negras: 'Marcos', turno: 'negras' }",
    "{ blancas: 'Lucía', negras: 'Marcos', turno: 'blancas' }, porque falta copiar el estado"
  ],
  "correcta": 1,
  "explicacion": "setState fusiona el objeto que le pasas con el estado actual: turno cambia y blancas y negras se quedan como estaban. Con useState pasaría lo contrario: setPartida({ turno: \"negras\" }) dejaría el estado con un solo campo."
}
```

Pero la fusión es **superficial**: solo llega al primer nivel. Si un campo es un objeto, el que pasas sustituye al que había, entero. Ese es el fallo de este reloj, que además enseña otras dos cosas de `setState`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un reloj de ajedrez con un fallo de fusión",
  "consigna": "Pulsa «Pasar turno» y mira la consola: justo después de setState, this.state todavía tiene el turno anterior. Después pulsa «Penalizar un minuto»: a las negras les quita 60 segundos, pero el tiempo de las blancas desaparece. Arréglalo copiando el resto de tiempos con ...tiempos dentro del objeto nuevo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Component } from 'react'\nimport './estilos.css'\n\nclass RelojAjedrez extends Component {\n  state = {\n    turno: 'blancas',\n    jugadas: 0,\n    tiempos: { blancas: 300, negras: 300 },\n  }\n\n  pasarTurno = () => {\n    this.setState({ turno: this.state.turno === 'blancas' ? 'negras' : 'blancas' })\n    this.setState((previo) => ({ jugadas: previo.jugadas + 1 }))\n    console.log('Justo después de setState, turno =', this.state.turno)\n  }\n\n  penalizar = () => {\n    const { turno, tiempos } = this.state\n    this.setState({ tiempos: { [turno]: tiempos[turno] - 60 } })\n  }\n\n  render() {\n    const { turno, jugadas, tiempos } = this.state\n\n    return (\n      <section className=\"reloj\">\n        <p>Turno: {turno} · Jugadas: {jugadas}</p>\n        <p>Blancas: {tiempos.blancas} s</p>\n        <p>Negras: {tiempos.negras} s</p>\n        <button onClick={this.pasarTurno}>Pasar turno</button>\n        <button onClick={this.penalizar}>Penalizar un minuto</button>\n      </section>\n    )\n  }\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Partida rápida</h1>\n      <RelojAjedrez />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.reloj {\n  max-width: 20rem;\n  padding: 0.25rem 1rem 1rem;\n  border: 1px solid #a8a29e;\n  border-radius: 8px;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Después de pasar el turno y penalizar, la pantalla dice «Blancas:  s» y «Negras: 240 s»: el objeto `{ negras: 240 }` ha sustituido a `tiempos` entero. El arreglo es el mismo que con `useState`: `{ tiempos: { ...tiempos, [turno]: tiempos[turno] - 60 } }`. Y de paso, el reloj enseña las otras dos reglas de `setState`, que ya conoces con otro nombre:

- **No cambia `this.state` al momento.** La consola dice «Justo después de setState, turno = blancas»: es la instantánea de la lección 18. El cambio se ve en el siguiente render.
- **Acepta una función actualizadora**, `this.setState((previo) => ({ … }))`, que recibe el estado pendiente. Es el `setCount(c => c + 1)` de la lección 19, y lo que usa `jugadas` para contar bien.

`setState` tiene además un segundo argumento opcional: una función que React llama **después** de aplicar el cambio en la pantalla, con `this.state` ya al día. En código antiguo lo verás para hacer algo justo después de actualizar; con Hooks, eso va en un efecto.

## `this` en los manejadores: `bind` o funciones flecha

El error más famoso de las clases. Un método normal pierde su `this` cuando lo pasas como `onClick`, porque React lo llama como una función suelta. Y como el cuerpo de una clase siempre está en modo estricto, `this` no es `window`: es `undefined`. Este marcador tiene el `bind` comentado:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un manejador que pierde su this",
  "consigna": "Pulsa «Sumar victoria»: debajo de la vista previa sale un TypeError. Quita el comentario de la línea del bind en el constructor y vuelve a probar. Después prueba la otra forma: deja el bind comentado y convierte sumarVictoria en un campo con función flecha, sumarVictoria = () => { … }.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Component } from 'react'\n\nclass Marcador extends Component {\n  constructor(props) {\n    super(props)\n    this.state = { victorias: 0 }\n    // this.sumarVictoria = this.sumarVictoria.bind(this)\n  }\n\n  sumarVictoria() {\n    this.setState({ victorias: this.state.victorias + 1 })\n  }\n\n  render() {\n    return (\n      <section>\n        <p>Victorias de {this.props.jugadora}: {this.state.victorias}</p>\n        <button onClick={this.sumarVictoria}>Sumar victoria</button>\n      </section>\n    )\n  }\n}\n\nexport default function App() {\n  return <Marcador jugadora=\"Lucía Ferrer\" />\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El error que aparece al pulsar:

```text
Error: Uncaught TypeError: Cannot read properties of undefined (reading 'setState')
```

Es decir: no se pueden leer propiedades de `undefined` (al buscar `setState`). `this` era `undefined`. En código de clases verás tres maneras de evitarlo, y las tres funcionan:

```jsx
class Marcador extends Component {
  constructor(props) {
    super(props) // lo primero, siempre: antes de super no se puede usar this
    this.state = { victorias: 0, derrotas: 0 }
    // 1. bind en el constructor: la forma clásica, de antes de los campos de clase
    this.sumarVictoria = this.sumarVictoria.bind(this)
  }

  sumarVictoria() {
    this.setState({ victorias: this.state.victorias + 1 })
  }

  // 2. Campo de clase con flecha: la flecha toma el this de la instancia
  sumarDerrota = () => {
    this.setState({ derrotas: this.state.derrotas + 1 })
  }

  render() {
    return (
      <>
        <button onClick={this.sumarVictoria}>Victoria</button>
        <button onClick={this.sumarDerrota}>Derrota</button>
        {/* 3. Flecha en el propio JSX: crea una función nueva en cada render */}
        <button onClick={() => this.sumarVictoria()}>Otra victoria</button>
      </>
    )
  }
}
```

El `constructor` con `super(props)` aparece en casi todo el código antiguo: era el sitio para el estado inicial y los `bind`. Con campos de clase deja de hacer falta. Lo que nunca debe hacer es llamar a `setState`: React avisa con «Can't call setState on a component that is not yet mounted.» y el estado no se crea. Ahí se asigna `this.state` directamente.

## El ciclo de vida: montar, actualizar, desmontar

Una clase no tiene efectos: tiene **métodos que React llama en momentos concretos** de la vida del componente. Los tres que más verás:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Los tres métodos de ciclo de vida más comunes",
  "roles": [
    {
      "etiqueta": "componentDidMount",
      "rol": "Después de montar",
      "descripcion": "El componente ya está en la pantalla. Aquí se arrancaban intervalos, suscripciones y peticiones."
    },
    {
      "etiqueta": "componentDidUpdate",
      "rol": "Después de cada actualización",
      "descripcion": "Recibe las props y el estado anteriores para compararlos. No se llama en el primer render."
    },
    {
      "etiqueta": "componentWillUnmount",
      "rol": "Antes de desmontar",
      "descripcion": "Para deshacer lo que hizo componentDidMount: parar el intervalo, quitar el escuchador, cancelar la suscripción."
    }
  ]
}
```

Este reloj de ronda arranca un intervalo al montarse, reinicia la cuenta cuando cambia la ronda y para el intervalo al desmontarse:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un reloj de ronda con los tres métodos",
  "consigna": "Mira la consola al cargar: StrictMode monta, desmonta y vuelve a montar, como hace con los efectos (lección 63). Pulsa «Siguiente ronda»: componentDidUpdate ve que la ronda ha cambiado y reinicia la cuenta. Pulsa «Ocultar reloj»: componentWillUnmount para el intervalo. Después borra el clearInterval: ¿a qué velocidad baja ahora la cuenta?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Component, useState } from 'react'\nimport './estilos.css'\n\nfunction formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n\nclass RelojRonda extends Component {\n  state = { segundos: this.props.duracion }\n\n  componentDidMount() {\n    console.log('componentDidMount: arranco el intervalo')\n    this.intervalo = setInterval(() => {\n      this.setState((previo) => ({ segundos: Math.max(previo.segundos - 1, 0) }))\n    }, 1000)\n  }\n\n  componentDidUpdate(propsPrevias) {\n    if (propsPrevias.ronda !== this.props.ronda) {\n      console.log(`componentDidUpdate: empieza la ronda ${this.props.ronda}`)\n      this.setState({ segundos: this.props.duracion })\n    }\n  }\n\n  componentWillUnmount() {\n    console.log('componentWillUnmount: paro el intervalo')\n    clearInterval(this.intervalo)\n  }\n\n  render() {\n    return (\n      <p className=\"reloj\">\n        Ronda {this.props.ronda} · quedan {formatear(this.state.segundos)}\n      </p>\n    )\n  }\n}\n\nexport default function App() {\n  const [ronda, setRonda] = useState(1)\n  const [visible, setVisible] = useState(true)\n\n  return (\n    <main>\n      <h1>Torneo de partidas rápidas</h1>\n      {visible && <RelojRonda ronda={ronda} duracion={300} />}\n      <button onClick={() => setRonda(ronda + 1)}>Siguiente ronda</button>\n      <button onClick={() => setVisible(!visible)}>\n        {visible ? 'Ocultar reloj' : 'Mostrar reloj'}\n      </button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.reloj {\n  font-size: 1.4rem;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Al cargar, la consola muestra:

```text
componentDidMount: arranco el intervalo
componentWillUnmount: paro el intervalo
componentDidMount: arranco el intervalo
```

Fíjate en el problema de diseño que react.dev señala en estos métodos: **una sola idea («mientras el reloj está en pantalla, hay un intervalo») queda repartida en tres sitios**, y `componentDidUpdate` tiene que comparar a mano cada prop que importa. Si alguien añade una prop y olvida compararla, el componente se desincroniza. Los efectos juntan las tres partes en un solo bloque.

Hay más métodos, menos comunes. Los reconocerás por el nombre:

- **`shouldComponentUpdate(propsSiguientes, estadoSiguiente)`** devuelve `false` para saltarse un render. `PureComponent` lo hace solo, comparando props y estado. Su equivalente es `memo` (lección 67).
- **`static getDerivedStateFromProps(props, estado)`** calcula estado a partir de las props antes de cada render. Casi siempre sobra: o se calcula durante el render (lección 24) o se reinicia con una `key` (lección 26).
- **`getSnapshotBeforeUpdate`** lee algo del DOM (la posición del scroll, por ejemplo) justo antes de que cambie. **No tiene equivalente con Hooks**: react.dev reconoce que, para este caso tan raro, hoy hay que escribir una clase.
- **`componentWillMount`**, **`componentWillReceiveProps`** y **`componentWillUpdate`** son los antiguos, renombrados con `UNSAFE_` en React 16.3. Siguen llamándose en 19.3, pero avisan; lo verás al final.

## De la clase a Hooks

Cada pieza de una clase tiene su pareja en un componente de función. Es la tabla que necesitas para leer y para migrar:

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Equivalencias entre clases y Hooks",
  "items": [
    {
      "titulo": "this.props → los parámetros",
      "texto": "function Ficha({ nombre, elo }). Y static defaultProps → valores por defecto en la desestructuración (lección 8)."
    },
    {
      "titulo": "this.state y setState → un useState por dato",
      "texto": "O un useReducer si la lógica es compleja (lección 27). Ojo al migrar: los set de useState sustituyen, no fusionan. Si guardas un objeto, cópialo con ... (lección 20)."
    },
    {
      "titulo": "componentDidMount + componentDidUpdate + componentWillUnmount → useEffect",
      "texto": "Un efecto con sus dependencias y una función de limpieza (módulo 6). Si los métodos hacen varias cosas sin relación, son varios efectos. En los raros casos en que debe ejecutarse antes de pintar, useLayoutEffect (lección 45)."
    },
    {
      "titulo": "Reiniciar el estado cuando cambia una prop → key",
      "texto": "Lo que en una clase hacía componentDidUpdate comparando la prop anterior, en una función suele ser una key en el padre: <Reloj key={ronda} /> monta un reloj nuevo en cada ronda (lección 26)."
    },
    {
      "titulo": "static contextType y this.context → useContext",
      "texto": "Una clase solo puede leer un contexto con contextType; una función puede llamar a useContext tantas veces como contextos necesite (lección 28)."
    },
    {
      "titulo": "createRef y this.campo → useRef",
      "texto": "Las refs de una clase eran campos de la instancia. En una función, useRef (lección 33). Y para guardar cualquier valor que no se pinta, como el id de un intervalo, también useRef."
    },
    {
      "titulo": "PureComponent y shouldComponentUpdate → memo",
      "texto": "Saltarse renders cuando las props no cambian (lección 67). Y forceUpdate, que obligaba a renderizar al leer datos de fuera de React, lo sustituye useSyncExternalStore (lección 46)."
    },
    {
      "titulo": "componentDidCatch y getDerivedStateFromError → sin equivalente",
      "texto": "Los error boundaries siguen siendo clases. Es la única pieza de uso diario que no se puede escribir como función. Lo ves en el apartado siguiente."
    }
  ]
}
```

El reloj de ronda, traducido. El intervalo y su limpieza van juntos en un efecto, y el reinicio por ronda pasa a ser una `key`:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El mismo reloj, como función con Hooks",
  "codigo": "import { useEffect, useState } from 'react'\n\nfunction formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n\nfunction RelojRonda({ ronda, duracion }) {\n  const [segundos, setSegundos] = useState(duracion)\n\n  useEffect(() => {\n    console.log('efecto: arranco el intervalo')\n    const intervalo = setInterval(() => {\n      setSegundos((previo) => Math.max(previo - 1, 0))\n    }, 1000)\n    return () => {\n      console.log('limpieza: paro el intervalo')\n      clearInterval(intervalo)\n    }\n  }, [])\n\n  return (\n    <p className=\"reloj\">\n      Ronda {ronda} · quedan {formatear(segundos)}\n    </p>\n  )\n}\n\nexport default function App() {\n  const [ronda, setRonda] = useState(1)\n  const [visible, setVisible] = useState(true)\n\n  return (\n    <main>\n      <h1>Torneo de partidas rápidas</h1>\n      {visible && <RelojRonda key={ronda} ronda={ronda} duracion={300} />}\n      <button onClick={() => setRonda(ronda + 1)}>Siguiente ronda</button>\n      <button onClick={() => setVisible(!visible)}>\n        {visible ? 'Ocultar reloj' : 'Mostrar reloj'}\n      </button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.reloj {\n  font-size: 1.4rem;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "const [segundos, setSegundos] = useState(duracion)",
      "nota": "El estado inicial que la clase calculaba en state = { segundos: this.props.duracion }."
    },
    {
      "fragmento": "console.log('efecto: arranco el intervalo')",
      "nota": "El cuerpo del efecto hace lo que hacía componentDidMount."
    },
    {
      "fragmento": "setSegundos((previo) => Math.max(previo - 1, 0))",
      "nota": "Función actualizadora, como en la clase: así el intervalo no necesita leer segundos y el efecto puede tener la lista de dependencias vacía."
    },
    {
      "fragmento": "return () => {",
      "nota": "La limpieza es componentWillUnmount, pero mejor: va junto al código que la necesita y React también la ejecuta antes de repetir el efecto."
    },
    {
      "fragmento": "<RelojRonda key={ronda} ronda={ronda} duracion={300} />",
      "nota": "Aquí desaparece componentDidUpdate. Al cambiar la ronda cambia la key, y React monta un reloj nuevo, con su estado desde cero y su propio intervalo (lección 26). En la consola verás la limpieza del viejo y el efecto del nuevo."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

### Una diferencia sutil: `this.props` siempre es la última

Al traducir, el comportamiento casi siempre se conserva. Hay una excepción que conviene conocer porque explica algunos fallos raros del código de clases: `this` es un objeto que React **actualiza**, así que `this.props` apunta siempre a las props más recientes. Una función, en cambio, ve las props **de su render** (la instantánea de la lección 18).

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "class AnuncioClase extends Component {\n  anunciar = () => {\n    setTimeout(() => console.log('Clase:', this.props.jugador), 3000)\n  }\n\n  render() {\n    return <button onClick={this.anunciar}>Anunciar (clase)</button>\n  }\n}\n\nfunction AnuncioFuncion({ jugador }) {\n  function anunciar() {\n    setTimeout(() => console.log('Función:', jugador), 3000)\n  }\n\n  return <button onClick={anunciar}>Anunciar (función)</button>\n}\n\n// App pasa jugador=\"Lucía\" a los dos. Pulsas los dos botones y,\n// antes de que pasen 3 segundos, App cambia jugador a \"Marcos\".",
  "opciones": [
    "Clase: Marcos · Función: Lucía",
    "Clase: Lucía · Función: Lucía",
    "Clase: Marcos · Función: Marcos",
    "Clase: Lucía · Función: Marcos"
  ],
  "correcta": 0,
  "explicacion": "La clase lee this.props cuando salta el temporizador, y para entonces React ya ha puesto ahí las props nuevas: Marcos. La función se ejecutó en el render en que jugador valía Lucía, y su temporizador recuerda ese valor. Comprobado con 19.3.1. Por eso, al migrar, un aviso que «llegaba tarde con el dato nuevo» puede pasar a llevar el dato del momento del clic."
}
```

## Error boundaries: lo único que todavía pide una clase

Un *error boundary* captura los errores que se lanzan al renderizar sus hijos y pinta otra cosa en su lugar, en vez de que se desmonte la app entera. Se escribe con dos métodos que **no tienen equivalente con Hooks**: `static getDerivedStateFromError` y `componentDidCatch`. La documentación de React lo dice sin rodeos: hoy no hay forma de escribirlo como función. Lo normal es tener uno escrito una vez (o usar el paquete `react-error-boundary`, que lo trae hecho) y usarlo en toda la app. La lección 53 lo trata a fondo; aquí basta con reconocerlo:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un error boundary alrededor de la clasificación",
  "codigo": "import { Component, useState } from 'react'\n\nclass LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  componentDidCatch(error, info) {\n    console.log('Lo mandaría a mi registro de errores:', error.message)\n  }\n\n  render() {\n    if (this.state.error) {\n      return <p role=\"alert\">No se ha podido mostrar la clasificación.</p>\n    }\n    return this.props.children\n  }\n}\n\nfunction Clasificacion({ jugadores }) {\n  return (\n    <ol>\n      {jugadores.map((jugador) => (\n        <li key={jugador.nombre}>\n          {jugador.nombre}: {jugador.puntos.toLocaleString('es-ES', { minimumFractionDigits: 1 })} puntos\n        </li>\n      ))}\n    </ol>\n  )\n}\n\nexport default function App() {\n  const [jugadores, setJugadores] = useState([\n    { nombre: 'Lucía Ferrer', puntos: 4.5 },\n    { nombre: 'Marcos Ibáñez', puntos: 3 },\n  ])\n\n  return (\n    <main>\n      <h1>Clasificación del torneo</h1>\n      <LimiteDeError>\n        <Clasificacion jugadores={jugadores} />\n      </LimiteDeError>\n      <button onClick={() => setJugadores([...jugadores, { nombre: 'Ana Ruiz' }])}>\n        Añadir a Ana sin puntos\n      </button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "static getDerivedStateFromError(error) {",
      "nota": "React lo llama cuando un hijo, por profundo que esté, lanza un error al renderizar. Devuelve el estado que hace que render pinte el aviso. Tiene que ser puro: nada de efectos aquí."
    },
    {
      "fragmento": "componentDidCatch(error, info) {",
      "nota": "Se llama después, con el error y un info cuyo componentStack es la pila de componentes. Es el sitio para registrar el error (lección 64)."
    },
    {
      "fragmento": "return this.props.children",
      "nota": "Sin error, el boundary es transparente: pinta lo que envuelve."
    },
    {
      "fragmento": "{ nombre: 'Ana Ruiz' }",
      "nota": "Ana llega sin puntos: jugador.puntos es undefined y toLocaleString lanza un TypeError al renderizar. Pulsa el botón: el h1 y el botón siguen en su sitio y la lista se sustituye por el aviso. La consola enseña el mensaje de React y el de componentDidCatch."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

## Lo que React 19 dejó atrás

React 19 aprovechó para quitar APIs que llevaban años obsoletas y cambiar la forma recomendada de otras. Al leer código anterior a 2024 te las encontrarás todas. Lo que sigue es lo que hace **React 19.3.1 de verdad** con cada una, comprobado en la vista previa, en cuatro grupos: de menos a más grave.

### Siguen funcionando, sin aviso, pero hay una forma nueva

- **`forwardRef`**. Envolvía un componente de función para que recibiera `ref` como segundo argumento. En 19.3.1 funciona igual y no avisa. Hoy `ref` es una prop normal (lección 34), y react.dev anuncia que `forwardRef` quedará obsoleto en una versión futura.
- **`<Contexto.Provider value={…}>`**. Funciona y no avisa: en 19.3.1, `Contexto.Provider` es literalmente el mismo objeto que `Contexto`. Hoy se escribe `<Contexto value={…}>` (lección 28).
- **`<Contexto.Consumer>{(valor) => …}</Contexto.Consumer>`**. La forma de leer un contexto antes de `useContext`. Funciona, sin aviso; la documentación lo llama la forma heredada.
- **`Component`, `PureComponent`, `createRef`, `Children`, `cloneElement`, `createElement` e `isValidElement`**. React las agrupa como *Legacy React APIs*: siguen exportándose y funcionando, pero no se recomiendan en código nuevo. Las alternativas a `Children` y `cloneElement` las viste en la lección 30.
- **`static defaultProps` en una clase**. Sigue funcionando: la documentación lo mantiene porque una clase no tiene otra forma de dar valores por defecto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Lo antiguo y lo nuevo, funcionando a la vez",
  "consigna": "La consola está vacía: React 19.3.1 no avisa de forwardRef, ni de Provider, ni de Consumer. Pulsa los dos «Enfocar»: las dos refs llegan a su input. Pulsa «Cambiar de club»: las dos cabeceras se actualizan. Después reescribe CampoAntiguo y CabeceraAntigua a la forma de React 19 y quita el import de forwardRef.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { createContext, forwardRef, useContext, useRef, useState } from 'react'\nimport './estilos.css'\n\nconst ClubContext = createContext('Enroque')\nClubContext.displayName = 'Club'\n\n// Como se escribía antes de React 19\nconst CampoAntiguo = forwardRef(function CampoAntiguo({ etiqueta }, ref) {\n  return (\n    <label>\n      {etiqueta} <input ref={ref} />\n    </label>\n  )\n})\n\nfunction CabeceraAntigua() {\n  return (\n    <ClubContext.Consumer>\n      {(club) => <h2>Club {club} (con Consumer)</h2>}\n    </ClubContext.Consumer>\n  )\n}\n\n// Como se escribe en React 19\nfunction CampoNuevo({ etiqueta, ref }) {\n  return (\n    <label>\n      {etiqueta} <input ref={ref} />\n    </label>\n  )\n}\n\nfunction CabeceraNueva() {\n  const club = useContext(ClubContext)\n  return <h2>Club {club} (con useContext)</h2>\n}\n\nexport default function App() {\n  const [club, setClub] = useState('Enroque')\n  const antiguoRef = useRef(null)\n  const nuevoRef = useRef(null)\n\n  return (\n    <main>\n      <ClubContext.Provider value={club}>\n        <CabeceraAntigua />\n      </ClubContext.Provider>\n      <ClubContext value={club}>\n        <CabeceraNueva />\n      </ClubContext>\n      <CampoAntiguo etiqueta=\"Jugada (forwardRef)\" ref={antiguoRef} />\n      <CampoNuevo etiqueta=\"Jugada (ref como prop)\" ref={nuevoRef} />\n      <p>\n        <button onClick={() => antiguoRef.current.focus()}>Enfocar el antiguo</button>\n        <button onClick={() => nuevoRef.current.focus()}>Enfocar el nuevo</button>\n        <button onClick={() => setClub('Gambito')}>Cambiar de club</button>\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh2 {\n  margin: 0.5rem 0;\n  font-size: 1.1rem;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.5rem;\n}\n\nbutton {\n  margin: 0 0.5rem 0.5rem 0;\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

### Se ignoran sin avisar

Estos son los peligrosos al migrar, porque **no hay mensaje que te ponga sobre la pista**:

- **`defaultProps` en componentes de función.** React 19 no los aplica: la prop llega como `undefined`. Tampoco en componentes envueltos en `memo` o en `forwardRef` (comprobado con 19.3.1). Hoy: valor por defecto en la desestructuración, `function Plazas({ plazas = 16 })` (lección 8).
- **`propTypes`**, en funciones y en clases. React ya no los comprueba: un tipo equivocado no da ningún aviso. El paquete `prop-types` puede seguir instalado, pero React no lo llama. Hoy: TypeScript (módulo 10).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres formas de dar un valor por defecto",
  "consigna": "La primera línea dice «Open de primavera:  plazas»: el defaultProps de la función se ha ignorado, y la consola no dice nada. La clase sí lo respeta. Cambia PlazasFuncion para que use un valor por defecto en la desestructuración, como PlazasActual.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Component } from 'react'\n\nfunction PlazasFuncion({ torneo, plazas }) {\n  return <li>{torneo}: {plazas} plazas (función con defaultProps)</li>\n}\nPlazasFuncion.defaultProps = { plazas: 16 }\n\nclass PlazasClase extends Component {\n  static defaultProps = { plazas: 16 }\n\n  render() {\n    return <li>{this.props.torneo}: {this.props.plazas} plazas (clase con defaultProps)</li>\n  }\n}\n\nfunction PlazasActual({ torneo, plazas = 16 }) {\n  return <li>{torneo}: {plazas} plazas (función con valor por defecto)</li>\n}\n\nexport default function App() {\n  return (\n    <ul>\n      <PlazasFuncion torneo=\"Open de primavera\" />\n      <PlazasClase torneo=\"Open de primavera\" />\n      <PlazasActual torneo=\"Open de primavera\" />\n    </ul>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

### Avisan, y ya no hacen lo que hacían

**El contexto heredado**: `static childContextTypes` con `getChildContext()` en el proveedor y `static contextTypes` en quien lo lee. No funciona (`this.context` llega sin el dato) y la consola lo dice, una vez por componente:

```text
Partida uses the legacy childContextTypes API which was removed in React 19. Use React.createContext() instead. (https://react.dev/link/legacy-context)
Casilla uses the legacy contextTypes API which was removed in React 19. Use React.createContext() with static contextType instead. (https://react.dev/link/legacy-context)
```

Es decir: `Partida` y `Casilla` usan la API heredada de contexto, que React 19 eliminó; usa `createContext` (y `static contextType` para leerlo desde una clase). Es el contexto de la lección 28.

**`componentWillMount`, `componentWillReceiveProps` y `componentWillUpdate`**. Se siguen llamando, pero cada uno deja un `console.warn` como este:

```text
componentWillMount has been renamed, and is not recommended for use. See https://react.dev/link/unsafe-component-lifecycles for details.
```

Es decir: está renombrado y no se recomienda. Sus versiones con prefijo, como `UNSAFE_componentWillMount`, no avisan fuera de StrictMode, pero dentro sí: «Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code.». Hoy: `componentDidMount`, o un efecto.

**`elemento.ref`**. Leer la ref de un elemento de JSX como `elemento.ref` da: «Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.». Hoy: `elemento.props.ref`.

**`useFormState` de `react-dom`**. Era el nombre de `useActionState` en las versiones de prueba (Canary) anteriores a React 19. Funciona, pero avisa: «ReactDOM.useFormState has been renamed to React.useActionState. Please update Inscripcion to use React.useActionState.» (lección 58).

### Rompen la app

- **Las string refs**: `<input ref="nombre" />` y después `this.refs.nombre`. React 19 lanza un error al renderizar: «Expected ref to be a function, an object returned by React.createRef(), or undefined/null.». Hoy: `createRef` en una clase, `useRef` en una función, o una ref de callback.
- **`ReactDOM.render`, `ReactDOM.hydrate`, `unmountComponentAtNode` y `findDOMNode`**. Ya no existen en `react-dom`: importarlas da `undefined` y llamarlas, un `TypeError`. En una build de Vite con React 19.3.1, un `render(<App />, …)` antiguo deja la página en blanco con «… .render is not a function». Hoy: `createRoot` y `root.render` (lección 3), `hydrateRoot` (lección 87), `root.unmount()`, y refs en vez de `findDOMNode` (lección 34).
- **`React.createFactory`**. Ya no existe. Hoy: JSX.
- **Las «fábricas de módulo»**, funciones que devolvían un objeto con un método `render`. Ahora ese objeto se trata como un hijo cualquiera, y falla con «Objects are not valid as a React child (found: object with keys {render})».

Todo junto, en un archivo como los que todavía circulan:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import React from 'react'\nimport ReactDOM from 'react-dom'\nimport PropTypes from 'prop-types'\n\nclass Inscripcion extends React.Component {\n  static contextTypes = { club: PropTypes.string }\n\n  static propTypes = { torneo: PropTypes.string.isRequired }\n\n  static defaultProps = { plazas: 16 }\n\n  componentWillMount() {\n    this.cargarInscritos()\n  }\n\n  componentDidMount() {\n    this.refs.nombre.focus()\n    ReactDOM.findDOMNode(this).classList.add('activa')\n  }\n\n  cargarInscritos() {\n    // fetch de la lista de inscritos...\n  }\n\n  render() {\n    return (\n      <form>\n        <h2>{this.props.torneo} · {this.context.club}</h2>\n        <p>Plazas: {this.props.plazas}</p>\n        <label>\n          Nombre <input ref=\"nombre\" />\n        </label>\n      </form>\n    )\n  }\n}\n\nReactDOM.render(<Inscripcion torneo=\"Open de primavera\" />, document.getElementById('root'))",
  "anotaciones": [
    {
      "fragmento": "import React from 'react'",
      "nota": "Con la transformación de JSX antigua, cada archivo con JSX necesitaba tener React a mano. Con la actual (lección 7) sobra, aunque no molesta."
    },
    {
      "fragmento": "static contextTypes = { club: PropTypes.string }",
      "nota": "Contexto heredado: en 19.3.1 avisa de que se eliminó en React 19 y this.context.club llega sin valor. Se sustituye por createContext y static contextType."
    },
    {
      "fragmento": "static propTypes = { torneo: PropTypes.string.isRequired }",
      "nota": "Se ignora sin decir nada: si falta torneo, ningún aviso. Hoy, TypeScript."
    },
    {
      "fragmento": "static defaultProps = { plazas: 16 }",
      "nota": "Esto sí sigue funcionando, porque es una clase. En una función se ignoraría."
    },
    {
      "fragmento": "componentWillMount() {",
      "nota": "Se sigue llamando, pero avisa de que está renombrado. La carga de datos iría en componentDidMount, o en un efecto."
    },
    {
      "fragmento": "this.refs.nombre.focus()",
      "nota": "String ref, junto con ref=\"nombre\" más abajo. En React 19 la app ni llega aquí: el render falla con «Expected ref to be a function, an object returned by React.createRef(), or undefined/null.»."
    },
    {
      "fragmento": "ReactDOM.findDOMNode(this)",
      "nota": "Ya no existe en react-dom: sería un TypeError. Para llegar a un nodo del DOM, una ref."
    },
    {
      "fragmento": "ReactDOM.render(<Inscripcion torneo=\"Open de primavera\" />, document.getElementById('root'))",
      "nota": "Tampoco existe: la página se queda en blanco con un TypeError. Hoy: createRoot(document.getElementById('root')).render(<Inscripcion … />), importando createRoot de react-dom/client."
    }
  ]
}
```

Y el arranque, como se escribe hoy:

```jsx
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Mantener una app con clases",
      "texto": "No hace falta reescribirla: clases y funciones conviven en el mismo árbol, se pasan props y comparten contexto. Lo razonable es migrar un componente cuando tienes que tocarlo, con la tabla de equivalencias y probando que se comporta igual."
    },
    {
      "titulo": "Actualizar una app a React 19",
      "texto": "La guía oficial recomienda pasar antes por React 18.3, que es igual que 18.2 pero avisa de todo lo que React 19 quita. Y ofrece codemods, programas que reescriben el código por ti: npx codemod@latest react/19/migration-recipe aplica los más comunes (ReactDOM.render, string refs, propTypes a TypeScript…)."
    },
    {
      "titulo": "Leer librerías y respuestas antiguas",
      "texto": "forwardRef y Context.Provider aparecen en muchísimas librerías que funcionan bien con React 19. Que una librería los use no es un problema; que use string refs o findDOMNode, sí: busca una versión nueva."
    },
    {
      "titulo": "Escribir un error boundary",
      "texto": "La única clase que seguirás escribiendo, o copiando de la documentación. O instalando react-error-boundary, que la trae hecha. La lección 53 lo cuenta entero."
    }
  ]
}
```

## Errores típicos

**Pasar un método sin `bind`.** `onClick={this.manejar}` con un método normal: `this` llega como `undefined` al pulsar. Usa un campo con flecha o haz el `bind` en el constructor.

**Llamar a un Hook dentro de una clase.** `useState` en `render` lanza «Invalid hook call». Si quieres Hooks, el componente tiene que ser una función.

**Copiar `defaultProps` en una función migrada.** No da ningún aviso y la prop llega vacía. Pasa los valores por defecto a la desestructuración.

**Traducir `componentDidMount` a un `useEffect` sin lista de dependencias.** Un efecto sin lista se ejecuta después de **cada** render, no solo al montar. Si en la clase no había `componentDidUpdate` que comparase props, la lista vacía `[]` es la traducción; si lo había, las props que comparaba son las dependencias.

**Cambiar `this.state` a mano.** Como con `useState`, mutar el estado no avisa a React. En una clase tiene además un efecto curioso:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "class Tablero extends Component {\n  state = { partidas: 0 }\n\n  sumarMal = () => {\n    this.state.partidas = this.state.partidas + 1\n  }\n\n  sumarBien = () => {\n    this.setState({ partidas: this.state.partidas + 1 })\n  }\n\n  render() {\n    return (\n      <section>\n        <p>Partidas jugadas: {this.state.partidas}</p>\n        <button onClick={this.sumarMal}>Sumar mal</button>\n        <button onClick={this.sumarBien}>Sumar bien</button>\n      </section>\n    )\n  }\n}\n\n// Pulsas «Sumar mal» dos veces y después «Sumar bien».\n// ¿Qué dice el párrafo al final?",
  "opciones": [
    "Partidas jugadas: 1",
    "Partidas jugadas: 3",
    "Partidas jugadas: 2",
    "Partidas jugadas: 0, porque el estado mutado se descarta"
  ],
  "correcta": 1,
  "explicacion": "«Sumar mal» cambia this.state.partidas a 1 y luego a 2, pero sin setState React no vuelve a renderizar: la pantalla sigue en 0 y la consola no avisa. «Sumar bien» lee ese 2 mutado, pide 3 y React renderiza: el contador salta de 0 a 3. Comprobado con 19.3.1."
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "React 19 ya no admite componentes de clase",
      "realidad": "Los admite y los ejecuta como siempre. Component está en la lista de APIs heredadas: funciona, pero no se recomienda para código nuevo."
    },
    {
      "mito": "forwardRef y Context.Provider dan error en React 19",
      "realidad": "Funcionan y en 19.3.1 ni siquiera avisan. Hay una forma nueva (ref como prop y <Contexto>), pero el código antiguo sigue en pie."
    },
    {
      "mito": "defaultProps ya no existe",
      "realidad": "Se eliminó solo para los componentes de función, donde se ignora sin aviso. En una clase, static defaultProps sigue funcionando."
    },
    {
      "mito": "Si React no avisa, la migración está bien",
      "realidad": "defaultProps en funciones y propTypes se ignoran en silencio. Repasa esas dos a mano, o con los codemods de la guía de React 19."
    }
  ]
}
```

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Migra el visor de partidas a Hooks",
  "consigna": "VisorPartidaClase.jsx funciona: botones y flechas ← → del teclado. Migra su lógica a VisorPartida.jsx, que es el que pinta App, siguiendo los pasos del comentario. Tiene que comportarse igual, también con StrictMode: cada flecha avanza un solo movimiento. Para ver la clase en marcha, cambia un momento el import de App a ./VisorPartidaClase.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import VisorPartida from './VisorPartida'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Club de ajedrez Enroque</h1>\n      <VisorPartida />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "VisorPartida.jsx",
      "codigo": "import { MOVIMIENTOS } from './partida'\n\n// Migra aquí VisorPartidaClase.jsx a un componente de función:\n// 1. this.state.movimiento pasa a ser un useState.\n// 2. avanzar y retroceder, funciones normales (sin this).\n// 3. componentDidMount + componentWillUnmount: un useEffect con limpieza.\n// 4. componentDidUpdate (el título de la pestaña): otro useEffect.\nexport default function VisorPartida() {\n  const movimiento = 0\n  const jugadas = MOVIMIENTOS.slice(0, movimiento)\n\n  function avanzar() {}\n\n  function retroceder() {}\n\n  return (\n    <section className=\"visor\">\n      <h2>Apertura española</h2>\n      <p>Movimiento {movimiento} de {MOVIMIENTOS.length}</p>\n      <p>{movimiento === 0 ? 'Posición inicial' : `Última jugada: ${jugadas.at(-1)}`}</p>\n      <ol className=\"jugadas\">\n        {jugadas.map((jugada, i) => (\n          <li key={i}>{jugada}</li>\n        ))}\n      </ol>\n      <button onClick={retroceder}>Anterior</button>\n      <button onClick={avanzar}>Siguiente</button>\n      <p className=\"ayuda\">También puedes usar las flechas ← y → del teclado.</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "VisorPartidaClase.jsx",
      "codigo": "import { Component } from 'react'\nimport { MOVIMIENTOS } from './partida'\n\nexport default class VisorPartidaClase extends Component {\n  constructor(props) {\n    super(props)\n    this.state = { movimiento: 0 }\n    this.manejarTecla = this.manejarTecla.bind(this)\n  }\n\n  componentDidMount() {\n    window.addEventListener('keydown', this.manejarTecla)\n  }\n\n  componentDidUpdate(propsPrevias, estadoPrevio) {\n    if (estadoPrevio.movimiento !== this.state.movimiento) {\n      document.title = `Movimiento ${this.state.movimiento} · Apertura española`\n    }\n  }\n\n  componentWillUnmount() {\n    window.removeEventListener('keydown', this.manejarTecla)\n  }\n\n  manejarTecla(evento) {\n    if (evento.key === 'ArrowRight') this.avanzar()\n    if (evento.key === 'ArrowLeft') this.retroceder()\n  }\n\n  avanzar = () => {\n    this.setState((previo) => ({\n      movimiento: Math.min(previo.movimiento + 1, MOVIMIENTOS.length),\n    }))\n  }\n\n  retroceder = () => {\n    this.setState((previo) => ({\n      movimiento: Math.max(previo.movimiento - 1, 0),\n    }))\n  }\n\n  render() {\n    const { movimiento } = this.state\n    const jugadas = MOVIMIENTOS.slice(0, movimiento)\n\n    return (\n      <section className=\"visor\">\n        <h2>Apertura española</h2>\n        <p>Movimiento {movimiento} de {MOVIMIENTOS.length}</p>\n        <p>{movimiento === 0 ? 'Posición inicial' : `Última jugada: ${jugadas.at(-1)}`}</p>\n        <ol className=\"jugadas\">\n          {jugadas.map((jugada, i) => (\n            <li key={i}>{jugada}</li>\n          ))}\n        </ol>\n        <button onClick={this.retroceder}>Anterior</button>\n        <button onClick={this.avanzar}>Siguiente</button>\n        <p className=\"ayuda\">También puedes usar las flechas ← y → del teclado.</p>\n      </section>\n    )\n  }\n}\n"
    },
    {
      "nombre": "partida.jsx",
      "codigo": "// Apertura española en notación algebraica en español:\n// C = caballo, A = alfil, T = torre, D = dama, R = rey.\nexport const MOVIMIENTOS = ['e4', 'e5', 'Cf3', 'Cc6', 'Ab5', 'a6', 'Aa4', 'Cf6']\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.visor {\n  max-width: 22rem;\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #a8a29e;\n  border-radius: 8px;\n  background: #fafaf9;\n}\n\n.jugadas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem 1.75rem;\n  min-height: 1.5rem;\n  padding-left: 1.5rem;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n\n.ayuda {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "VisorPartida.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Siguiente» dos veces se ve «Movimiento 2 de 8»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        }
      ],
      "espera": {
        "texto": "Movimiento 2 de 8"
      }
    },
    {
      "descripcion": "Después de dos movimientos, la última jugada es e5",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        }
      ],
      "espera": {
        "texto": "Última jugada: e5"
      }
    },
    {
      "descripcion": "«Anterior» deshace el último movimiento",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Anterior"
          }
        }
      ],
      "espera": {
        "texto": "Movimiento 2 de 8"
      }
    },
    {
      "descripcion": "Cada pulsación de la flecha → avanza un solo movimiento",
      "pasos": [
        {
          "teclear": "{ArrowRight}"
        }
      ],
      "espera": {
        "texto": "Movimiento 1 de 8"
      }
    },
    {
      "descripcion": "Las flechas siguen contando bien después de varias pulsaciones",
      "pasos": [
        {
          "teclear": "{ArrowRight}{ArrowRight}{ArrowRight}{ArrowLeft}"
        }
      ],
      "espera": {
        "texto": "Movimiento 2 de 8"
      }
    },
    {
      "descripcion": "No se pasa del último movimiento",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        }
      ],
      "espera": {
        "texto": "Movimiento 8 de 8"
      }
    },
    {
      "descripcion": "No se baja de la posición inicial",
      "pasos": [
        {
          "teclear": "{ArrowLeft}"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Siguiente"
          }
        }
      ],
      "espera": {
        "texto": "Movimiento 1 de 8"
      }
    }
  ]
}
```

Dos comprobaciones vigilan los fallos típicos de esta migración. Si una pulsación de flecha avanza dos movimientos, el efecto no tiene limpieza: StrictMode lo monta dos veces y quedan dos escuchadores (la clase no tenía el problema porque su `componentWillUnmount` sí los quitaba). Si las flechas se quedan atascadas en el 1, el escuchador lee un `movimiento` viejo: usa la función actualizadora, `setMovimiento((previo) => …)`, como hacía la clase.

**Retos para seguir practicando** (sin comprobación automática):

1. En el bloque del reloj de ajedrez, migra `RelojAjedrez` a una función con dos `useState` (`turno` y `tiempos`) y un tercero para `jugadas`. Comprueba que «Penalizar un minuto» necesita ahora el `...tiempos` sí o sí.
2. En el visor migrado, el título de la pestaña se pone ya en el primer render, cosa que la clase no hacía (su `componentDidUpdate` no se llama al montar). ¿Importa la diferencia? Si quisieras copiar el comportamiento exacto, ¿cómo lo harías?
3. Reescribe el archivo «Inscripcion» del apartado anterior para React 19: función con Hooks, `useRef` para el campo, un contexto creado con `createContext` para el club y `createRoot` para arrancar.
4. Busca en GitHub un proyecto de React anterior a 2019 (por ejemplo, filtrando por `extends React.Component`) y localiza en su código tres APIs de la lista de esta lección. Para cada una, di en qué grupo cae en React 19.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Component",
      "descripcion": "La referencia completa de los componentes de clase: cada método de ciclo de vida, setState, los error boundaries y, al final, cómo migrar cada caso a una función.",
      "url": "https://react.dev/reference/react/Component",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Legacy React APIs",
      "descripcion": "Las APIs que React mantiene pero no recomienda, y las que React 19 eliminó, con la alternativa de cada una.",
      "url": "https://react.dev/reference/react/legacy",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19 Upgrade Guide",
      "descripcion": "La guía oficial para actualizar: todo lo que se eliminó, desde cuándo era obsoleto, el código de antes y después, y los codemods.",
      "url": "https://react.dev/blog/2024/04/25/react-19-upgrade-guide",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "react-codemod",
      "descripcion": "Los programas que reescriben código antiguo de React: renombrar ciclos de vida, cambiar ReactDOM.render, string refs y más.",
      "url": "https://github.com/reactjs/react-codemod",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "react-error-boundary",
      "descripcion": "El paquete que trae hecho un error boundary configurable, para no tener que escribir la clase.",
      "url": "https://github.com/bvaughn/react-error-boundary",
      "etiqueta": "GitHub"
    }
  ]
}
```
