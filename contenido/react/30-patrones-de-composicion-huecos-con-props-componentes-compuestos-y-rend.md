# Patrones de composición: huecos con props, componentes compuestos y render props

- **Módulo:** Gestionar el estado
- **Slug:** `patrones-de-composicion-huecos-con-props-componentes-compuestos-y-render-props` (autogenerado del título)
- **Orden:** 300
- **Fuentes:** [Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) + [cloneElement: Alternatives](https://react.dev/reference/react/cloneElement#alternatives) + [Children: Alternatives](https://react.dev/reference/react/Children#alternatives) — ver `contenido/react/TEMARIO.md` #30

---

## Qué es y para qué sirve

En la lección 8 aprendiste a configurar un componente con props y en la 9, a envolver contenido con `children`. Con eso se construye casi todo... hasta que un mismo componente tiene que servir en muchos sitios distintos.

La web de la Alfarería La Rueda empezó con una `TarjetaPieza` sencilla: nombre, descripción y precio. Luego la tarjeta del cuenco necesitó la insignia «Última unidad»; la de los cursos, un horario y un botón «Apuntarme» en vez de «Añadir a la cesta»; el aviso de vacaciones, ni precio ni botón. Cada petición se resolvió con una prop más:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function TarjetaPieza({\n  nombre,\n  descripcion,\n  precio,\n  mostrarPrecio,\n  etiqueta,\n  colorEtiqueta,\n  textoBoton,\n  onBoton,\n  textoSegundoBoton,\n  onSegundoBoton,\n  horario,\n}) {\n  return (\n    <article className=\"tarjeta\">\n      <h2>{nombre}</h2>\n      {etiqueta && <span className={'insignia ' + colorEtiqueta}>{etiqueta}</span>}\n      <p>{descripcion}</p>\n      {horario && <p>{horario}</p>}\n      {mostrarPrecio && <p className=\"precio\">{precio} €</p>}\n      {textoBoton && <button onClick={onBoton}>{textoBoton}</button>}\n      {textoSegundoBoton && <button onClick={onSegundoBoton}>{textoSegundoBoton}</button>}\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "colorEtiqueta,",
      "nota": "Cada variación nueva trae su prop, y a veces dos: la insignia necesita su texto y su color. El día que alguien quiera una insignia con un icono, habrá una tercera."
    },
    {
      "fragmento": "mostrarPrecio,",
      "nota": "Los booleanos que encienden y apagan trozos son el síntoma más claro: la tarjeta intenta prever todas las combinaciones de sus partes."
    },
    {
      "fragmento": "textoSegundoBoton,",
      "nota": "El curso necesitaba dos botones, y salieron dos props más. ¿Y si mañana una pieza necesita un enlace en vez de un botón?"
    },
    {
      "fragmento": "{horario && <p>{horario}</p>}",
      "nota": "El orden de las piezas lo decide la tarjeta, una vez y para todos. Si una página quiere el horario debajo del precio, no hay prop que lo arregle."
    }
  ]
}
```

La tarjeta acaba sabiendo de cestas, de cursos y de vacaciones, y quien la usa solo puede elegir entre las opciones que alguien previó. Los **patrones de composición** le dan la vuelta al reparto:

> **Componer es repartir las decisiones: el componente decide lo que es igual en todos los usos (el marco, el orden, el comportamiento) y deja en manos de quien lo usa lo que cambia de un uso a otro.**

En esta lección verás tres formas de hacer ese reparto, cada una con más libertad para quien usa el componente:

- **Huecos con nombre**: props que reciben JSX, como `cabecera` o `acciones`.
- **Componentes compuestos**: varias piezas que se usan juntas y comparten un estado por contexto, como `Pestanas`, `Pestanas.Lista` y `Pestanas.Panel`.
- **Render props**: una prop que es una función y decide cómo pintar algo con datos que solo tiene el componente.

Y dos APIs de React que verás en código antiguo haciendo lo mismo peor: `Children` y `cloneElement`.

## Huecos con nombre: props que reciben JSX

En la lección 9 lo viste de pasada: `children` es el hueco por defecto, y **cualquier otra prop puede recibir JSX igual que recibe un número o un texto**. Un elemento de JSX es un objeto (lección 7), así que se puede guardar en una prop, pasar y pintar donde haga falta.

Esta es la tarjeta de la alfarería rehecha con cuatro huecos: `cabecera`, `children` para el cuerpo, `pie` y `acciones`. La tarjeta decide el marco y dónde va cada cosa; lo que va dentro de cada hueco lo escribe `App`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una tarjeta con cuatro huecos",
  "consigna": "Pulsa «Añadir a la cesta» y «Apuntarme». Los botones están dentro de TarjetaPieza, pero los escribió App: cambian el estado de App sin que la tarjeta sepa nada de cestas ni de plazas. Después dale a la tarjeta de agosto un pie con un enlace «Ver el horario de verano». No hace falta tocar TarjetaPieza.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport TarjetaPieza from './TarjetaPieza'\nimport './estilos.css'\n\nexport default function App() {\n  const [enCesta, setEnCesta] = useState(0)\n  const [plazas, setPlazas] = useState(4)\n\n  return (\n    <main>\n      <h1>Alfarería La Rueda</h1>\n      <p>Piezas en la cesta: {enCesta}</p>\n      <div className=\"rejilla\">\n        <TarjetaPieza\n          cabecera={\n            <>\n              <h2>Cuenco esmaltado</h2>\n              <span className=\"insignia\">Última unidad</span>\n            </>\n          }\n          pie={<p className=\"precio\">18 €</p>}\n          acciones={<button onClick={() => setEnCesta(enCesta + 1)}>Añadir a la cesta</button>}\n        >\n          <p>Torneado a mano en gres y esmaltado en azul cobalto.</p>\n        </TarjetaPieza>\n\n        <TarjetaPieza\n          cabecera={<h2>Curso de torno</h2>}\n          pie={<p>Sábados de 10:00 a 13:00 · {plazas} plazas libres</p>}\n          acciones={\n            <button disabled={plazas === 0} onClick={() => setPlazas(plazas - 1)}>\n              Apuntarme\n            </button>\n          }\n        >\n          <p>Cuatro sesiones para centrar el barro y levantar tu primer cuenco.</p>\n        </TarjetaPieza>\n\n        <TarjetaPieza cabecera={<h2>Cerramos en agosto</h2>}>\n          <p>Los pedidos que hagas en agosto saldrán la primera semana de septiembre.</p>\n        </TarjetaPieza>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaPieza.jsx",
      "codigo": "export default function TarjetaPieza({ cabecera, children, pie, acciones }) {\n  return (\n    <article className=\"tarjeta\">\n      <header className=\"tarjeta-cabecera\">{cabecera}</header>\n      <div className=\"tarjeta-cuerpo\">{children}</div>\n      {(pie || acciones) && (\n        <footer className=\"tarjeta-pie\">\n          {pie}\n          {acciones && <div className=\"tarjeta-acciones\">{acciones}</div>}\n        </footer>\n      )}\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.25rem;\n  font-size: 1.4rem;\n}\n\n.rejilla {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));\n  gap: 0.75rem;\n}\n\n.tarjeta {\n  display: flex;\n  flex-direction: column;\n  border: 1px solid #e7d8c9;\n  border-radius: 12px;\n  background: #fffaf5;\n  overflow: hidden;\n}\n\n.tarjeta-cabecera {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.4rem;\n  padding: 0.6rem 0.9rem;\n  background: #f3e5d8;\n}\n\n.tarjeta-cabecera h2 {\n  margin: 0;\n  font-size: 1.05rem;\n}\n\n.tarjeta-cuerpo {\n  flex: 1;\n  padding: 0.6rem 0.9rem;\n}\n\n.tarjeta-cuerpo p,\n.tarjeta-pie p {\n  margin: 0;\n}\n\n.tarjeta-pie {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 0.5rem;\n  padding: 0.6rem 0.9rem;\n  border-top: 1px solid #e7d8c9;\n}\n\n.tarjeta-acciones {\n  display: flex;\n  gap: 0.4rem;\n}\n\n.insignia {\n  padding: 0.1rem 0.5rem;\n  border-radius: 999px;\n  background: #9a3412;\n  color: white;\n  font-size: 0.75rem;\n}\n\n.precio {\n  font-weight: 700;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "TarjetaPieza.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Cuatro detalles de esta tarjeta que vas a repetir en cualquier componente con huecos:

- **Un hueco admite cualquier cosa que React sepa pintar**: un elemento, un fragmento con varios (la cabecera del cuenco lleva título e insignia), un texto (`cabecera="Novedades"` también valdría) o nada.
- **El componente decide si pinta el envoltorio.** El aviso de agosto no tiene ni `pie` ni `acciones`, así que `(pie || acciones) && ...` no pinta el `<footer>` y no queda una raya vacía al final. Para comprobar si un hueco viene vacío valen las precauciones de la lección 9: un `0` o un array vacío también cuentan como contenido.
- **Se le puede dar un valor por defecto**, como a cualquier prop: `function TarjetaPieza({ cabecera = <h2>Sin título</h2>, ... })`. Solo se usa cuando el hueco llega como `undefined`.
- **Lo que va en un hueco lo escribe el padre, con sus variables a mano.** El botón del curso usa `plazas` y `setPlazas`, que son de `App`, y la tarjeta no ha tenido que recibir ni la cesta ni un `onAnadir`. Es el mismo truco que en la lección 9 evitaba pasar props de largo, y el que react.dev recomienda probar antes de recurrir al contexto (lección 28).

¿Cuándo un hueco y cuándo una prop de datos? El criterio de la lección 9 sigue valiendo: si la tarjeta **necesita entender el valor** (calcular, formatear, decidir un color), es una prop de datos, como `precio={18}`. Si **solo lo coloca**, es un hueco.

## Componentes compuestos: piezas que comparten un estado

La ficha de cada pieza tiene pestañas: «Descripción», «Medidas», «Cuidados». La primera idea es configurarlas con una prop que reciba un array de objetos. Es una opción buena, y la documentación de React la propone como alternativa a manipular `children`:

```jsx
<Pestanas
  pestanas={[
    { valor: 'descripcion', titulo: 'Descripción', contenido: <p>Torneado a mano...</p> },
    { valor: 'medidas', titulo: 'Medidas', contenido: <p>14 cm de diámetro...</p> },
  ]}
/>
```

Funciona hasta que una página quiere algo que el componente no previó: el precio entre la fila de pestañas y el contenido, una pestaña con una insignia de «gratis», la fila debajo en vez de arriba... Cada caso pide una prop nueva (`posicionLista`, `insigniaPorPestana`...), y vuelves a la tarjeta del principio.

Los **componentes compuestos** (en inglés, *compound components*) resuelven esto como lo hace HTML con `<select>` y `<option>`: **varias piezas que solo tienen sentido juntas, y que quien las usa coloca como quiera**. La raíz guarda el estado y lo comparte por contexto (lección 28); cada pieza lee lo que necesita:

```jsx
<Pestanas valorInicial="descripcion">
  <Pestanas.Lista etiqueta="Información de la pieza">
    <Pestanas.Pestana valor="descripcion">Descripción</Pestanas.Pestana>
    <Pestanas.Pestana valor="medidas">Medidas</Pestanas.Pestana>
  </Pestanas.Lista>
  <Pestanas.Panel valor="descripcion">...</Pestanas.Panel>
  <Pestanas.Panel valor="medidas">...</Pestanas.Panel>
</Pestanas>
```

Antes de ver cómo está hecho por dentro, una predicción. El estado (qué pestaña está activa) vive en `Pestanas`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Pestanas({ valorInicial, children }) {\n  const [activa, setActiva] = useState(valorInicial)\n  return (\n    <PestanasContexto value={{ activa, setActiva }}>\n      <div className=\"pestanas\">{children}</div>\n    </PestanasContexto>\n  )\n}\n\nfunction Lista({ children }) {\n  // No lee el contexto: solo coloca sus hijos\n  return <div role=\"tablist\">{children}</div>\n}\n\nfunction Pestana({ valor, children }) {\n  const { activa, setActiva } = useContext(PestanasContexto)\n  // ...\n}\n\nfunction Panel({ valor, children }) {\n  const { activa } = useContext(PestanasContexto)\n  // ...\n}\n\n// App pinta un Pestanas con una Lista de tres Pestana y tres Panel.\n// Pulsas «Medidas». ¿Qué componentes se vuelven a renderizar?",
  "opciones": [
    "Solo la Pestana «Medidas», que es la que has pulsado",
    "Pestanas, las tres Pestana y los tres Panel; Lista no",
    "Todos, desde App",
    "Pestanas y Lista, pero ninguna Pestana ni ningún Panel"
  ],
  "correcta": 1,
  "explicacion": "Pestanas se renderiza porque cambió su estado. Lista no: su elemento lo creó App, que no se ha renderizado, así que React ve que es el mismo de antes y se la salta. Pero cada Pestana y cada Panel leen el contexto, y su valor ha cambiado, así que React los renderiza aunque su padre no lo haya hecho. El contexto llega a quien lo lee, esté donde esté."
}
```

Compruébalo en el panel «Árbol de renders» de este ejemplo, que es el componente completo, con su accesibilidad, en un solo archivo:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Pestanas: un estado y tres piezas",
  "codigo": "import { createContext, useContext, useId, useState } from 'react'\nimport './estilos.css'\n\nconst PestanasContexto = createContext(null)\nPestanasContexto.displayName = 'PestanasContexto'\n\nfunction usePestanas(pieza) {\n  const contexto = useContext(PestanasContexto)\n  if (contexto === null) {\n    throw new Error(`<Pestanas.${pieza}> tiene que ir dentro de <Pestanas>`)\n  }\n  return contexto\n}\n\nfunction Pestanas({ valorInicial, children }) {\n  const [activa, setActiva] = useState(valorInicial)\n  const base = useId()\n  return (\n    <PestanasContexto value={{ activa, setActiva, base }}>\n      <div className=\"pestanas\">{children}</div>\n    </PestanasContexto>\n  )\n}\n\nfunction Lista({ etiqueta, children }) {\n  return (\n    <div role=\"tablist\" aria-label={etiqueta}>\n      {children}\n    </div>\n  )\n}\n\nfunction Pestana({ valor, children }) {\n  const { activa, setActiva, base } = usePestanas('Pestana')\n  return (\n    <button\n      type=\"button\"\n      role=\"tab\"\n      id={`${base}-pestana-${valor}`}\n      aria-selected={valor === activa}\n      aria-controls={`${base}-panel-${valor}`}\n      onClick={() => setActiva(valor)}\n    >\n      {children}\n    </button>\n  )\n}\n\nfunction Panel({ valor, children }) {\n  const { activa, base } = usePestanas('Panel')\n  return (\n    <div\n      role=\"tabpanel\"\n      id={`${base}-panel-${valor}`}\n      aria-labelledby={`${base}-pestana-${valor}`}\n      hidden={valor !== activa}\n    >\n      {children}\n    </div>\n  )\n}\n\nPestanas.Lista = Lista\nPestanas.Pestana = Pestana\nPestanas.Panel = Panel\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Cuenco esmaltado</h1>\n      <Pestanas valorInicial=\"descripcion\">\n        <Pestanas.Lista etiqueta=\"Información de la pieza\">\n          <Pestanas.Pestana valor=\"descripcion\">Descripción</Pestanas.Pestana>\n          <Pestanas.Pestana valor=\"medidas\">Medidas</Pestanas.Pestana>\n          <Pestanas.Pestana valor=\"cuidados\">Cuidados</Pestanas.Pestana>\n        </Pestanas.Lista>\n        <Pestanas.Panel valor=\"descripcion\">\n          <p>Torneado a mano en gres y esmaltado en azul cobalto.</p>\n        </Pestanas.Panel>\n        <Pestanas.Panel valor=\"medidas\">\n          <p>14 cm de diámetro y 7 cm de alto. Cabe medio litro.</p>\n        </Pestanas.Panel>\n        <Pestanas.Panel valor=\"cuidados\">\n          <p>Apto para lavavajillas y microondas. No lo metas en el horno.</p>\n        </Pestanas.Panel>\n      </Pestanas>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.4rem;\n}\n\n[role='tablist'] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  border-bottom: 2px solid #e7d8c9;\n}\n\n[role='tab'] {\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 8px 8px 0 0;\n  background: transparent;\n  font: inherit;\n  cursor: pointer;\n}\n\n[role='tab'][aria-selected='true'] {\n  background: #9a3412;\n  color: white;\n}\n\n[role='tabpanel'] {\n  padding: 0.75rem 0.25rem;\n}\n\n[role='tabpanel'] p {\n  margin: 0;\n}",
  "anotaciones": [
    {
      "fragmento": "const PestanasContexto = createContext(null)",
      "nota": "El canal privado de las piezas. No se exporta: solo las funciones de este archivo pueden leerlo. El valor por defecto, null, sirve para detectar una pieza usada fuera de Pestanas."
    },
    {
      "fragmento": "PestanasContexto.displayName = 'PestanasContexto'",
      "nota": "Como en la lección 28: solo pone nombre al contexto en el árbol de renders y en las React DevTools. Sin esta línea, aparecería como Context."
    },
    {
      "fragmento": "throw new Error(",
      "nota": "Una pieza fuera de su raíz recibiría null del contexto y fallaría con un error confuso. Así el mensaje dice exactamente qué pasa. Lo verás en los errores típicos."
    },
    {
      "fragmento": "<PestanasContexto value={{ activa, setActiva, base }}>",
      "nota": "La raíz guarda el estado y lo reparte. Sus hijos no los mira ni los toca: los coloca tal cual, como cualquier contenedor de la lección 9."
    },
    {
      "fragmento": "const base = useId()",
      "nota": "useId da un identificador único a cada Pestanas de la página, para que dos grupos de pestañas no repitan ids. Lo verás a fondo en la lección 37; aquí sirve para unir cada pestaña con su panel."
    },
    {
      "fragmento": "aria-selected={valor === activa}",
      "nota": "Cada pieza calcula su propia situación a partir del contexto. Fíjate en el CSS: el estilo de la pestaña activa sale del mismo atributo que leen los lectores de pantalla."
    },
    {
      "fragmento": "hidden={valor !== activa}",
      "nota": "Los tres paneles están montados; los inactivos solo llevan hidden, que los oculta a la vista y a los lectores de pantalla. Si un panel tuviera estado, como un formulario a medias, se conservaría al cambiar de pestaña (lección 26)."
    },
    {
      "fragmento": "Pestanas.Lista = Lista",
      "nota": "Las piezas se cuelgan como propiedades de la raíz: con un solo import tienes todas, y <Pestanas.Lista> es JSX normal, que se compila a _jsx(Pestanas.Lista, ...)."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Pulsa «Medidas» y lee el árbol: **`Pestanas` ← «cambió su estado»**, el proveedor `PestanasContexto` se renderiza con su `value` nuevo, **`Lista` se queda sin cambios** y cada `Pestana` y cada `Panel` dicen **«cambió el contexto «PestanasContexto»»**. En la página, el recuadro ámbar marca cuatro cambios: el `aria-selected` de dos pestañas y el `hidden` de dos paneles.

No hay nada nuevo de Context: `Pestanas` es un proveedor que envuelve `children`, como el de la lección 28, y por eso `Lista` se salta igual que allí se saltaban los componentes de en medio. Lo nuevo es la forma de la API: quien usa `Pestanas` no ve el contexto ni el estado; ve unas piezas con nombre que encajan entre sí.

### Pestañas accesibles: roles y atributos

Unas pestañas hechas con botones y clases se ven bien, pero para un lector de pantalla son botones sueltos: no sabe que forman un grupo de pestañas, cuál está elegida ni qué parte de la página cambia. El patrón de pestañas de la [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) dice qué tiene que llevar cada pieza, y el componente lo pone una sola vez para todos los usos:

- **`role="tablist"`** en el contenedor de las pestañas, con un nombre (`aria-label`) que diga de qué son.
- **`role="tab"`** en cada pestaña, con **`aria-selected`** a `true` solo en la activa, y **`aria-controls`** apuntando al `id` de su panel.
- **`role="tabpanel"`** en cada panel, con **`aria-labelledby`** apuntando a su pestaña. Así el panel toma su nombre accesible de la pestaña, «Medidas». También por eso una comprobación puede buscar `{ rol: 'tabpanel', nombre: 'Medidas' }`.
- **`hidden`** en los paneles inactivos, para que no se lean.
- **`type="button"`**, para que una pestaña dentro de un formulario no lo envíe (lección 22).

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Falta el teclado completo",
  "contenido": "El patrón de la APG pide además que las flechas izquierda y derecha cambien de pestaña y que solo la activa entre en el orden de tabulación. Eso exige mover el foco desde el código, que verás con refs en la lección 34; el kit de componentes accesibles del proyecto 96 lo completa. Mientras tanto, esta versión deja todas las pestañas en el orden de tabulación como botones normales: se llega con Tab y se activan con Intro o Espacio."
}
```

### Las piezas, donde tú quieras

La ventaja de verdad aparece al usarlo. Esta ficha coloca el precio entre las pestañas y los paneles, envuelve la pestaña de envío en un componente propio con una insignia y pone dos grupos de pestañas independientes en la misma página. `Pestanas.jsx` es el componente de arriba, sin cambiar una línea:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ficha que coloca las piezas a su manera",
  "consigna": "Cambia de pestaña en los dos grupos: cada uno guarda la suya. PestanaConAviso envuelve a Pestanas.Pestana en otro componente, y sigue funcionando porque la pestaña lee el contexto, esté a la profundidad que esté. Prueba a mover el precio debajo de los paneles, o añade a la jarra una pestaña «Cuidados» con su panel.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Pestanas from './Pestanas'\nimport './estilos.css'\n\nfunction PestanaConAviso({ valor, aviso, children }) {\n  return (\n    <Pestanas.Pestana valor={valor}>\n      {children} <span className=\"aviso\">{aviso}</span>\n    </Pestanas.Pestana>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Jarra de agua</h1>\n      <Pestanas valorInicial=\"descripcion\">\n        <Pestanas.Lista etiqueta=\"Información de la jarra\">\n          <Pestanas.Pestana valor=\"descripcion\">Descripción</Pestanas.Pestana>\n          <PestanaConAviso valor=\"envio\" aviso=\"gratis\">\n            Envío\n          </PestanaConAviso>\n        </Pestanas.Lista>\n        <p className=\"precio\">24 €</p>\n        <Pestanas.Panel valor=\"descripcion\">\n          <p>Barro rojo sin esmaltar por fuera: el agua se mantiene fresca.</p>\n        </Pestanas.Panel>\n        <Pestanas.Panel valor=\"envio\">\n          <p>Sale en 48 horas, envuelta en cartón ondulado.</p>\n        </Pestanas.Panel>\n      </Pestanas>\n\n      <h2>Opiniones</h2>\n      <Pestanas valorInicial=\"recientes\">\n        <Pestanas.Lista etiqueta=\"Ordenar opiniones\">\n          <Pestanas.Pestana valor=\"recientes\">Más recientes</Pestanas.Pestana>\n          <Pestanas.Pestana valor=\"mejores\">Mejor valoradas</Pestanas.Pestana>\n        </Pestanas.Lista>\n        <Pestanas.Panel valor=\"recientes\">\n          <p>Lucía: «Llegó perfecta y es más grande de lo que parece».</p>\n        </Pestanas.Panel>\n        <Pestanas.Panel valor=\"mejores\">\n          <p>Andrés: «La uso a diario desde hace un año. Cinco estrellas».</p>\n        </Pestanas.Panel>\n      </Pestanas>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Pestanas.jsx",
      "codigo": "import { createContext, useContext, useId, useState } from 'react'\n\nconst PestanasContexto = createContext(null)\nPestanasContexto.displayName = 'PestanasContexto'\n\nfunction usePestanas(pieza) {\n  const contexto = useContext(PestanasContexto)\n  if (contexto === null) {\n    throw new Error(`<Pestanas.${pieza}> tiene que ir dentro de <Pestanas>`)\n  }\n  return contexto\n}\n\nexport default function Pestanas({ valorInicial, children }) {\n  const [activa, setActiva] = useState(valorInicial)\n  const base = useId()\n  return (\n    <PestanasContexto value={{ activa, setActiva, base }}>\n      <div className=\"pestanas\">{children}</div>\n    </PestanasContexto>\n  )\n}\n\nfunction Lista({ etiqueta, children }) {\n  return (\n    <div role=\"tablist\" aria-label={etiqueta}>\n      {children}\n    </div>\n  )\n}\n\nfunction Pestana({ valor, children }) {\n  const { activa, setActiva, base } = usePestanas('Pestana')\n  return (\n    <button\n      type=\"button\"\n      role=\"tab\"\n      id={`${base}-pestana-${valor}`}\n      aria-selected={valor === activa}\n      aria-controls={`${base}-panel-${valor}`}\n      onClick={() => setActiva(valor)}\n    >\n      {children}\n    </button>\n  )\n}\n\nfunction Panel({ valor, children }) {\n  const { activa, base } = usePestanas('Panel')\n  return (\n    <div\n      role=\"tabpanel\"\n      id={`${base}-panel-${valor}`}\n      aria-labelledby={`${base}-pestana-${valor}`}\n      hidden={valor !== activa}\n    >\n      {children}\n    </div>\n  )\n}\n\nPestanas.Lista = Lista\nPestanas.Pestana = Pestana\nPestanas.Panel = Panel\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.4rem;\n}\n\n[role='tablist'] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  border-bottom: 2px solid #e7d8c9;\n}\n\n[role='tab'] {\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 8px 8px 0 0;\n  background: transparent;\n  font: inherit;\n  cursor: pointer;\n}\n\n[role='tab'][aria-selected='true'] {\n  background: #9a3412;\n  color: white;\n}\n\n[role='tabpanel'] {\n  padding: 0.75rem 0.25rem;\n}\n\n[role='tabpanel'] p {\n  margin: 0;\n}\n\nh2 {\n  margin-top: 1.5rem;\n  font-size: 1.15rem;\n}\n\n.precio {\n  margin: 0.5rem 0 0;\n  font-size: 1.2rem;\n  font-weight: 700;\n}\n\n.aviso {\n  padding: 0 0.4rem;\n  border-radius: 999px;\n  background: #dcfce7;\n  color: #166534;\n  font-size: 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Hay otra forma de exportar las piezas que verás mucho: funciones con nombre en el archivo (`export function Raiz`, `export function Lista`...) y un `import * as Pestanas from './Pestanas'` en quien las usa. El resultado se escribe igual, `<Pestanas.Lista>`, porque `Pestanas` pasa a ser un objeto con todas las exportaciones. Radix, la librería de la lección 80, entrega sus pestañas así: un objeto `Tabs` con `Tabs.Root`, `Tabs.List`, `Tabs.Trigger` y `Tabs.Content`.

## Render props: una función que decide cómo pintar

Un hueco recibe JSX ya hecho. A veces eso no basta, porque **lo que hay que pintar depende de datos que solo tiene el componente**.

La alfarería quiere listas paginadas: las piezas de dos en dos y los cursos también. La lógica es la misma (qué página toca, qué elementos caben, los botones «Anterior» y «Siguiente»), pero cada lista pinta sus elementos a su manera, y `App` no sabe qué elementos tocan en cada página: eso lo sabe la lista. La solución es pasarle una **función** que, dado un elemento, devuelva su JSX. La lista la llama para cada elemento visible:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lista paginada que no sabe qué pinta",
  "consigna": "Pasa de página en las dos listas. ListaPaginada decide cuántos elementos caben, cómo se navega y dónde va cada uno; lo de dentro de cada li lo decide la función que le pasa App. Cambia el renderElemento de las piezas para añadir «oferta» a las que cuestan menos de 25 €, o cambia porPagina a 3. ListaPaginada no cambia.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import ListaPaginada from './ListaPaginada'\nimport './estilos.css'\n\nconst PIEZAS = [\n  { id: 'cuenco', nombre: 'Cuenco esmaltado', precio: 18 },\n  { id: 'jarra', nombre: 'Jarra de agua', precio: 24 },\n  { id: 'fuente', nombre: 'Fuente honda', precio: 32 },\n  { id: 'tazas', nombre: 'Juego de tazas', precio: 40 },\n  { id: 'botijo', nombre: 'Botijo blanco', precio: 27 },\n]\n\nconst CURSOS = [\n  { id: 'torno', nombre: 'Torno para principiantes', dia: 'sábados' },\n  { id: 'esmaltes', nombre: 'Esmaltes y engobes', dia: 'martes' },\n  { id: 'modelado', nombre: 'Modelado a mano', dia: 'jueves' },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Alfarería La Rueda</h1>\n      <ListaPaginada\n        titulo=\"Piezas a la venta\"\n        elementos={PIEZAS}\n        porPagina={2}\n        renderElemento={(pieza) => (\n          <div className=\"pieza\">\n            <strong>{pieza.nombre}</strong>\n            <span>{pieza.precio} €</span>\n          </div>\n        )}\n      />\n      <ListaPaginada\n        titulo=\"Cursos\"\n        elementos={CURSOS}\n        porPagina={2}\n        renderElemento={(curso, posicion) => (\n          <p>\n            {posicion + 1}. {curso.nombre}, los {curso.dia}\n          </p>\n        )}\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaPaginada.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ListaPaginada({ titulo, elementos, porPagina, renderElemento }) {\n  const [pagina, setPagina] = useState(0)\n  const totalPaginas = Math.ceil(elementos.length / porPagina)\n  const inicio = pagina * porPagina\n  const visibles = elementos.slice(inicio, inicio + porPagina)\n\n  return (\n    <section className=\"lista-paginada\" aria-label={titulo}>\n      <h2>{titulo}</h2>\n      <ul>\n        {visibles.map((elemento, i) => (\n          <li key={elemento.id}>{renderElemento(elemento, inicio + i)}</li>\n        ))}\n      </ul>\n      <nav aria-label={'Páginas de ' + titulo}>\n        <button disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>\n          Anterior\n        </button>\n        <span>\n          Página {pagina + 1} de {totalPaginas}\n        </span>\n        <button disabled={pagina === totalPaginas - 1} onClick={() => setPagina(pagina + 1)}>\n          Siguiente\n        </button>\n      </nav>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 1rem;\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0;\n  font-size: 1.4rem;\n}\n\n.lista-paginada {\n  padding: 0.6rem 0.9rem;\n  border: 1px solid #e7d8c9;\n  border-radius: 12px;\n  background: #fffaf5;\n}\n\n.lista-paginada h2 {\n  margin: 0 0 0.4rem;\n  font-size: 1.05rem;\n}\n\n.lista-paginada ul {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0 0 0.6rem;\n  padding: 0;\n  list-style: none;\n}\n\n.lista-paginada p {\n  margin: 0;\n}\n\n.pieza {\n  display: flex;\n  justify-content: space-between;\n  padding: 0.3rem 0.5rem;\n  border-radius: 6px;\n  background: #f3e5d8;\n}\n\nnav {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.25rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "ListaPaginada.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

`renderElemento` no tiene nada de especial: **es una prop normal que resulta ser una función**. Se llama *render prop* porque su trabajo es decidir cómo se pinta algo, y por convención su nombre empieza por `render`: `renderElemento`, `renderVacio`, `renderCelda`. Fíjate en tres cosas:

- **La lista le pasa datos que el padre no tiene.** Los cursos se numeran con `posicion`, la posición en la lista completa, que depende de la página en que esté la lista. `App` ni lo sabe ni lo guarda.
- **La lista decide cuándo llamar a la función.** Solo la llama para los elementos de la página actual. Si en vez de una función le pasaras el JSX de todos los elementos ya hecho, se crearía para todos aunque solo se vean dos.
- **La `key` la pone la lista**, en su propio `<li key={elemento.id}>`. Quien escribe la render prop no tiene que acordarse: la lista es la que pinta una lista.

### `children` como función

Verás la misma idea con otra forma: en vez de una prop con nombre, la función va entre las etiquetas, en `children`:

```jsx
<ListaPaginada titulo="Piezas a la venta" elementos={PIEZAS} porPagina={2}>
  {(pieza) => <strong>{pieza.nombre}</strong>}
</ListaPaginada>

// Y dentro de ListaPaginada: {children(elemento, inicio + i)}
```

Funciona igual, porque `children` es una prop más (lección 9). Lo verás en código y librerías de hace unos años. Una prop con nombre dice mejor qué hace, y es lo que usan los ejemplos de react.dev: `renderItem`, `renderContent`, `renderRow`.

### Render props o un hook propio

Antes de que existieran los hooks, las render props eran la forma habitual de **compartir lógica con estado** entre componentes: un componente que no pintaba nada propio, solo guardaba un estado y llamaba a su función con él. Hoy eso lo hace mejor un hook propio, que verás en la lección 43. La documentación de `cloneElement` lo propone también como alternativa: sacar la lógica que no se ve a un hook y decidir qué pintar con lo que devuelve.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// Antes de los hooks: un componente que solo existe para compartir lógica\nfunction Paginacion({ elementos, porPagina, children }) {\n  const [pagina, setPagina] = useState(0)\n  const visibles = elementos.slice(pagina * porPagina, (pagina + 1) * porPagina)\n  return children({ visibles, pagina, setPagina })\n}\n\nfunction Catalogo({ piezas }) {\n  return (\n    <Paginacion elementos={piezas} porPagina={2}>\n      {({ visibles, pagina, setPagina }) => (\n        <Rejilla piezas={visibles} pagina={pagina} onCambiarPagina={setPagina} />\n      )}\n    </Paginacion>\n  )\n}\n\n// Hoy: la misma lógica en un hook propio (lección 43)\nfunction usePaginacion(elementos, porPagina) {\n  const [pagina, setPagina] = useState(0)\n  const visibles = elementos.slice(pagina * porPagina, (pagina + 1) * porPagina)\n  return { visibles, pagina, setPagina }\n}\n\nfunction CatalogoConHook({ piezas }) {\n  const { visibles, pagina, setPagina } = usePaginacion(piezas, 2)\n  return <Rejilla piezas={visibles} pagina={pagina} onCambiarPagina={setPagina} />\n}",
  "anotaciones": [
    {
      "fragmento": "return children({ visibles, pagina, setPagina })",
      "nota": "Paginacion no pinta nada suyo: ni un ul ni un botón. Solo guarda un estado y se lo da a su función. Esa es la señal de que lo que se comparte es lógica, no interfaz."
    },
    {
      "fragmento": "{({ visibles, pagina, setPagina }) => (",
      "nota": "Para usar la lógica hay que meterse dentro de una función. Con dos o tres de estos componentes combinados, el JSX acaba en una escalera de funciones dentro de funciones."
    },
    {
      "fragmento": "function usePaginacion(elementos, porPagina)",
      "nota": "El hook guarda el mismo estado y devuelve los mismos datos, pero no se coloca en el JSX: se llama arriba del componente, como useState. Cómo se escribe y qué reglas sigue, en la lección 43."
    },
    {
      "fragmento": "const { visibles, pagina, setPagina } = usePaginacion(piezas, 2)",
      "nota": "Los datos quedan en variables normales y el JSX vuelve a ser plano. Si necesitas otra lógica, otra línea, no otro nivel de anidamiento."
    }
  ]
}
```

**La regla práctica: si el componente solo aporta lógica, hazlo hook; si aporta interfaz (una estructura, una navegación, un marco) y te deja decidir una parte, la render prop sigue siendo la herramienta.** `ListaPaginada` pinta el `<ul>`, la navegación y el «Página 1 de 3»; por eso su `renderElemento` tiene sentido. Es lo mismo que decían las [preguntas frecuentes de los hooks](https://legacy.reactjs.org/docs/hooks-faq.html#do-hooks-replace-render-props-and-higher-order-components) en la documentación antigua de React: los hooks son más sencillos para el caso de compartir lógica, pero los dos patrones siguen teniendo su sitio, y el ejemplo que ponían era una lista con una prop `renderItem`. Y nada impide combinarlos: una `ListaPaginada` que use `usePaginacion` por dentro.

## `Children` y `cloneElement`: lo que no conviene usar

Si buscas cómo hacer pestañas o listas en React, encontrarás código que hace estas mismas cosas con dos funciones de React: **`Children`**, que recorre, cuenta o transforma el `children` que recibe un componente, y **`cloneElement`**, que copia un elemento cambiándole props. La documentación de React las tiene en su lista de **APIs heredadas** (*Legacy React APIs*), con una advertencia: no se recomiendan en código nuevo, y su uso «es poco común y puede llevar a código frágil».

Este escaparate de la alfarería destaca una pieza cada vez. Cuenta sus hijos con `Children.count` y le inyecta a cada uno la prop `destacada` con `cloneElement`. Antes de ejecutarlo, predice qué pasa si alguien agrupa dos piezas en un componente propio:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Escaparate({ children }) {\n  const total = Children.count(children)\n  return <p>Pieza 1 de {total}</p>\n  // ...y después pinta las piezas\n}\n\nfunction PiezasDeTemporada() {\n  return (\n    <>\n      <Pieza nombre=\"Botijo blanco\" />\n      <Pieza nombre=\"Jarra de agua\" />\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <Escaparate>\n      <Pieza nombre=\"Cuenco esmaltado\" />\n      <PiezasDeTemporada />\n    </Escaparate>\n  )\n}\n\n// En pantalla se ven tres piezas. ¿Qué dice el párrafo?",
  "opciones": [
    "Pieza 1 de 3",
    "Pieza 1 de 2",
    "Pieza 1 de 1",
    "Nada: Children.count no admite componentes que devuelven un fragmento"
  ],
  "correcta": 1,
  "explicacion": "Children solo ve el JSX que ha recibido: un elemento Pieza y un elemento PiezasDeTemporada. Lo que PiezasDeTemporada pinte después, dos piezas, diez o ninguna, no lo ve, porque todavía no se ha ejecutado. Para el escaparate hay dos hijos, aunque en pantalla haya tres piezas."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un escaparate que se rompe al extraer un componente",
  "consigna": "Pulsa «Siguiente» en los dos escaparates. El primero recorre sus tres piezas. El segundo dice «de 2» y, al avanzar, no destaca ni el botijo ni la jarra: cloneElement le ha dado la prop destacada a PiezasDeTemporada, que no la usa ni se la pasa a sus piezas. Lo único que ha cambiado es que alguien ha extraído un componente.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Escaparate from './Escaparate'\nimport './estilos.css'\n\nfunction Pieza({ nombre, destacada }) {\n  return <li aria-current={destacada}>{nombre}</li>\n}\n\nfunction PiezasDeTemporada() {\n  return (\n    <>\n      <Pieza nombre=\"Botijo blanco\" />\n      <Pieza nombre=\"Jarra de agua\" />\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Escaparate titulo=\"Escaparate de la tienda\">\n        <Pieza nombre=\"Cuenco esmaltado\" />\n        <Pieza nombre=\"Botijo blanco\" />\n        <Pieza nombre=\"Jarra de agua\" />\n      </Escaparate>\n      <Escaparate titulo=\"El mismo escaparate, con un componente extraído\">\n        <Pieza nombre=\"Cuenco esmaltado\" />\n        <PiezasDeTemporada />\n      </Escaparate>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Escaparate.jsx",
      "codigo": "import { Children, cloneElement, useState } from 'react'\n\nexport default function Escaparate({ titulo, children }) {\n  const [indice, setIndice] = useState(0)\n  const total = Children.count(children)\n\n  return (\n    <section className=\"escaparate\">\n      <h2>{titulo}</h2>\n      <p>\n        Pieza {indice + 1} de {total}\n      </p>\n      <ul>\n        {Children.map(children, (hijo, i) => cloneElement(hijo, { destacada: i === indice }))}\n      </ul>\n      <button onClick={() => setIndice((indice + 1) % total)}>Siguiente</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\n.escaparate {\n  padding: 0.6rem 0.9rem;\n  border: 1px solid #e7d8c9;\n  border-radius: 12px;\n}\n\n.escaparate h2 {\n  margin: 0;\n  font-size: 1.05rem;\n}\n\n.escaparate p {\n  margin: 0.25rem 0;\n  color: #57534e;\n}\n\n.escaparate ul {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\n.escaparate li {\n  padding: 0.3rem 0.6rem;\n  border: 1px solid #e7d8c9;\n  border-radius: 6px;\n}\n\n.escaparate li[aria-current='true'] {\n  border-color: #9a3412;\n  background: #9a3412;\n  color: white;\n}\n\nbutton {\n  padding: 0.25rem 0.6rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "Escaparate.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Ese es el problema de fondo: **un componente que manipula sus `children` depende de cómo los escriba quien lo usa**. Extraer un componente, envolver una pieza en un `<div>` o pintarlas con un `map` dentro de un fragmento cambia lo que ve `Children`, y el escaparate se rompe sin dar ningún error. Además, con `cloneElement` es difícil seguir de dónde sale una prop: `Pieza` recibe `destacada` sin que nadie la escriba en el JSX.

Las páginas de `Children` y `cloneElement` de react.dev proponen alternativas, y ya las conoces todas:

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Qué usar en lugar de Children y cloneElement",
  "items": [
    {
      "titulo": "Para envolver cada hijo: exporta la pieza",
      "texto": "En vez de recorrer children para meter cada uno en un envoltorio, exporta el envoltorio (como Pestanas.Panel) y que quien lo usa lo escriba. Sigue funcionando aunque se extraigan componentes."
    },
    {
      "titulo": "Para contar o recorrer: un array de datos",
      "texto": "Si el componente necesita saber cuántos elementos hay, o asociar datos a cada uno, pídelos como un array de objetos, como la prop pestanas del principio. Un array de verdad se recorre con map y se cuenta con length."
    },
    {
      "titulo": "Para inyectar props: una render prop",
      "texto": "En vez de clonar cada hijo para añadirle destacada, recibe los datos y una función: renderPieza(pieza, destacada). Se ve en el JSX de dónde sale cada valor."
    },
    {
      "titulo": "Para que los hijos sepan algo del padre: contexto",
      "texto": "Es lo que hace Pestanas: cada pieza lee del contexto lo que necesita, a cualquier profundidad. Unas pestañas hechas con Children y cloneElement solo funcionan si cada pestaña es hija directa de la lista."
    },
    {
      "titulo": "Para compartir solo lógica: un hook propio",
      "texto": "Si lo que se repite es un estado y sus funciones, no una interfaz, sácalo a un hook (lección 43) y que cada componente pinte lo que quiera con lo que devuelve."
    }
  ]
}
```

Con una render prop, el escaparate queda así, y ya da igual cómo se construya la lista de piezas:

```jsx
import { Fragment, useState } from 'react'

function Escaparate({ titulo, piezas, renderPieza }) {
  const [indice, setIndice] = useState(0)
  return (
    <section className="escaparate">
      <h2>{titulo}</h2>
      <p>Pieza {indice + 1} de {piezas.length}</p>
      <ul>
        {piezas.map((pieza, i) => (
          <Fragment key={pieza.id}>{renderPieza(pieza, i === indice)}</Fragment>
        ))}
      </ul>
      <button onClick={() => setIndice((indice + 1) % piezas.length)}>Siguiente</button>
    </section>
  )
}

// <Escaparate
//   titulo="Escaparate de la tienda"
//   piezas={[...PIEZAS_FIJAS, ...PIEZAS_DE_TEMPORADA]}
//   renderPieza={(pieza, destacada) => <Pieza nombre={pieza.nombre} destacada={destacada} />}
// />
```

Aquí la `key` va en un `Fragment` (lección 11) porque es la render prop la que pinta el `<li>`. Rehacerlo entero es uno de los retos del final.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "children, con minúscula, sigue siendo lo normal",
  "contenido": "Lo que react.dev desaconseja es la API Children, con mayúscula, que se importa de react para manipular los hijos. Recibir children y pintarlo donde toca, como en la lección 9, es lo habitual y lo recomendado. El problema empieza cuando el componente mira dentro."
}
```

## Inversión de control: quién decide qué

Todos estos patrones son variaciones de una misma idea, la **inversión de control**: en vez de que el componente lo decida todo a partir de opciones, le cede parte de las decisiones a quien lo usa. Cuanto más cede, más flexible es... y más tiene que escribir quien lo usa.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién decide qué en cada patrón",
  "roles": [
    {
      "etiqueta": "Props de configuración",
      "rol": "El componente decide todo",
      "descripcion": "Tú eliges entre las opciones que previó: tipo=\"urgente\", porPagina={2}. Lo más fácil de usar y lo más rígido."
    },
    {
      "etiqueta": "Huecos",
      "rol": "Él decide dónde; tú, qué",
      "descripcion": "Pone el marco y el orden. El contenido de cada hueco lo escribes tú, con tu estado y tus manejadores a mano."
    },
    {
      "etiqueta": "Componentes compuestos",
      "rol": "Él decide cómo se comportan; tú, cómo se colocan",
      "descripcion": "Las piezas comparten estado y accesibilidad por contexto. El orden, los envoltorios y lo que va entre ellas lo decides tú."
    },
    {
      "etiqueta": "Render props",
      "rol": "Él decide cuándo y con qué datos; tú, cómo se ve",
      "descripcion": "Te llama con datos que solo él tiene (la página, la posición, si está destacada) y pinta lo que le devuelvas."
    }
  ]
}
```

No es una escalera que haya que subir. **Empieza por lo más sencillo que funcione** y cambia cuando aparezcan las señales:

- **De props a huecos**, cuando una prop empieza a cargar JSX, o los booleanos (`mostrarPrecio`, `mostrarBoton`) se multiplican para encender y apagar trozos.
- **De huecos o arrays a componentes compuestos**, cuando quien usa el componente necesita colocar las piezas a su manera, envolverlas o meter cosas entre ellas.
- **A una render prop**, cuando lo que hay que pintar depende de datos internos del componente.
- **A un hook propio**, cuando lo que se repite no es una interfaz sino una lógica.

Un componente que se usa en un solo sitio no necesita nada de esto: unas props bien puestas son más fáciles de leer que tres piezas y un contexto.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Librerías de componentes headless",
      "texto": "Radix ofrece las pestañas como Tabs.Root, Tabs.List, Tabs.Trigger y Tabs.Content, y su diálogo, su menú o su acordeón siguen la misma forma compuesta. Ellas ponen el comportamiento y la accesibilidad; tú, el aspecto. Lección 80."
    },
    {
      "titulo": "Sistemas de diseño",
      "texto": "La tarjeta de shadcn/ui no tiene props de título ni de pie: se compone con Card, CardHeader, CardTitle, CardContent y CardFooter, piezas que colocas como quieras."
    },
    {
      "titulo": "Maquetaciones de página",
      "texto": "Una Maquetacion con huecos para la cabecera, la barra lateral y el contenido. Cada página rellena los suyos sin que la maquetación sepa qué páginas existen."
    },
    {
      "titulo": "Tablas y listas genéricas",
      "texto": "Una tabla que ordena y pagina, y que recibe por cada columna una función que decide cómo pintar su celda: render props con otro nombre."
    },
    {
      "titulo": "Formularios",
      "texto": "Un Campo compuesto que reparte por contexto el id de la etiqueta y del mensaje de error entre Campo.Etiqueta, Campo.Entrada y Campo.Error, para que se enlacen sin pasar ids a mano. Ese id lo genera useId (lección 37). shadcn/ui tiene su versión con Field, FieldLabel, FieldDescription y FieldError."
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
      "mito": "Cuanto más flexible, mejor componente",
      "realidad": "Cada hueco o pieza de más es algo que quien usa el componente tiene que escribir, y una forma más de usarlo mal. La flexibilidad que nadie usa es solo complejidad."
    },
    {
      "mito": "Los componentes compuestos se hacen con Children y cloneElement",
      "realidad": "Es una forma antigua de hacerlos, y solo funciona con hijos directos. Con contexto, cada pieza busca lo que necesita a cualquier profundidad, aunque esté envuelta en otro componente."
    },
    {
      "mito": "Pestanas.Lista es una sintaxis especial de React",
      "realidad": "Es JSX normal: un nombre con punto se compila a _jsx(Pestanas.Lista, ...). Vale cualquier objeto que guarde componentes en sus propiedades, también el de un import * as."
    },
    {
      "mito": "Las render props están obsoletas",
      "realidad": "Para compartir lógica, los hooks propios las han sustituido casi siempre. Para que un componente te deje pintar una parte con sus datos, siguen siendo la herramienta, y react.dev las propone en lugar de cloneElement."
    }
  ]
}
```

## Errores típicos

**Usar una pieza fuera de su raíz.** Las piezas de un componente compuesto dependen del contexto que pone la raíz. Fuera de ella, `useContext` devuelve el valor por defecto, `null`. Sin la comprobación de `usePestanas`, el fallo sería un `TypeError` que no ayuda nada: «Cannot destructure property 'activa' of … as it is null». Con ella, el error dice qué pieza está fuera de su sitio:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Unas pestañas fuera de su sitio",
  "consigna": "La vista previa muestra el error que lanza usePestanas. Mira dónde está Pestanas.Lista en App.jsx y arréglalo moviéndola dentro de Pestanas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Pestanas from './Pestanas'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Fuente honda</h1>\n      <Pestanas.Lista etiqueta=\"Información de la fuente\">\n        <Pestanas.Pestana valor=\"descripcion\">Descripción</Pestanas.Pestana>\n        <Pestanas.Pestana valor=\"medidas\">Medidas</Pestanas.Pestana>\n      </Pestanas.Lista>\n      <Pestanas valorInicial=\"descripcion\">\n        <Pestanas.Panel valor=\"descripcion\">\n          <p>Para servir legumbres y guisos. Esmalte color miel.</p>\n        </Pestanas.Panel>\n        <Pestanas.Panel valor=\"medidas\">\n          <p>28 cm de diámetro y 6 cm de fondo.</p>\n        </Pestanas.Panel>\n      </Pestanas>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Pestanas.jsx",
      "codigo": "import { createContext, useContext, useId, useState } from 'react'\n\nconst PestanasContexto = createContext(null)\nPestanasContexto.displayName = 'PestanasContexto'\n\nfunction usePestanas(pieza) {\n  const contexto = useContext(PestanasContexto)\n  if (contexto === null) {\n    throw new Error(`<Pestanas.${pieza}> tiene que ir dentro de <Pestanas>`)\n  }\n  return contexto\n}\n\nexport default function Pestanas({ valorInicial, children }) {\n  const [activa, setActiva] = useState(valorInicial)\n  const base = useId()\n  return (\n    <PestanasContexto value={{ activa, setActiva, base }}>\n      <div className=\"pestanas\">{children}</div>\n    </PestanasContexto>\n  )\n}\n\nfunction Lista({ etiqueta, children }) {\n  return (\n    <div role=\"tablist\" aria-label={etiqueta}>\n      {children}\n    </div>\n  )\n}\n\nfunction Pestana({ valor, children }) {\n  const { activa, setActiva, base } = usePestanas('Pestana')\n  return (\n    <button\n      type=\"button\"\n      role=\"tab\"\n      id={`${base}-pestana-${valor}`}\n      aria-selected={valor === activa}\n      aria-controls={`${base}-panel-${valor}`}\n      onClick={() => setActiva(valor)}\n    >\n      {children}\n    </button>\n  )\n}\n\nfunction Panel({ valor, children }) {\n  const { activa, base } = usePestanas('Panel')\n  return (\n    <div\n      role=\"tabpanel\"\n      id={`${base}-panel-${valor}`}\n      aria-labelledby={`${base}-pestana-${valor}`}\n      hidden={valor !== activa}\n    >\n      {children}\n    </div>\n  )\n}\n\nPestanas.Lista = Lista\nPestanas.Pestana = Pestana\nPestanas.Panel = Panel\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  font-size: 1.4rem;\n}\n\n[role='tablist'] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.25rem;\n  border-bottom: 2px solid #e7d8c9;\n}\n\n[role='tab'] {\n  padding: 0.45rem 0.9rem;\n  border: 0;\n  border-radius: 8px 8px 0 0;\n  background: transparent;\n  font: inherit;\n  cursor: pointer;\n}\n\n[role='tab'][aria-selected='true'] {\n  background: #9a3412;\n  color: white;\n}\n\n[role='tabpanel'] {\n  padding: 0.75rem 0.25rem;\n}\n\n[role='tabpanel'] p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

**Pasar el componente en vez del elemento.** `cabecera={TituloPieza}` le da a la tarjeta la función, no un elemento. React no pinta nada en ese hueco y avisa en la consola:

```text
Functions are not valid as a React child. This may happen if you return TituloPieza instead of <TituloPieza /> from render. Or maybe you meant to call this function rather than return it.
```

Es decir: «Las funciones no son hijos válidos. Puede que hayas devuelto `TituloPieza` en vez de `<TituloPieza />`». Un hueco recibe JSX: `cabecera={<TituloPieza />}`.

**Olvidar la `key` de la lista que pinta una render prop.** Si `ListaPaginada` hiciera `visibles.map((e) => renderElemento(e))`, cada elemento que devuelve la función sería un hijo de una lista sin `key`, y React avisaría en la consola:

```text
Each child in a list should have a unique "key" prop.

Check the render method of `ListaPaginada`. See https://react.dev/link/warning-keys for more information.
```

El aviso señala a la lista (que es la que hace el `map`), no a quien escribió la función. Pon la `key` en el envoltorio que pinta la lista, un `<li>` o un `<Fragment>`, como en la lección 11.

**Convertir en compuesto lo que se usa una vez.** Un contexto, una raíz y tres piezas para un componente que solo aparece en una página es trabajo sin recompensa. Los patrones de esta lección pagan cuando un componente se usa en muchos sitios y de muchas formas.

**Mirar dentro de `children`.** Filtrar los hijos por tipo (`hijo.type === Pestana`), contarlos o clonarlos depende de cómo los escriba quien usa el componente, y se rompe en cuanto alguien extrae un componente, como el escaparate. Si necesitas datos de cada hijo, pídelos como datos.

## Ejercicios

En la página de preguntas frecuentes de la alfarería, las respuestas se pliegan y se despliegan, y solo puede haber una abierta a la vez. En la lección 25 resolviste un acordeón así levantando el estado a `App`. Ahora lo vas a guardar dentro del propio componente: un acordeón compuesto en el que `Acordeon` guarda qué sección está abierta y cada `Acordeon.Seccion` lo lee del contexto. Quien lo use solo escribe las secciones. Sigue el patrón del acordeón de la [APG](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/), que ya viene puesto en el JSX: la pregunta es un botón dentro de un encabezado, con `aria-expanded` y `aria-controls`, y la respuesta es una región con `aria-labelledby`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un acordeón compuesto para las preguntas frecuentes",
  "consigna": "Completa Acordeon.jsx siguiendo los cuatro pasos de los comentarios: el estado en la raíz, compartido por contexto; cada sección lee si es la abierta y se abre o se cierra al pulsar su pregunta; y la respuesta solo se ve si está abierta (con hidden o sin pintarla). App.jsx no hay que tocarlo. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Acordeon from './Acordeon'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Alfarería La Rueda</h1>\n      <h2>Preguntas frecuentes</h2>\n      <Acordeon>\n        <Acordeon.Seccion valor=\"barro\" titulo=\"¿Puedo traer mi propio barro?\">\n          <p>Sí, si es gres o arcilla de alta temperatura. Si no sabes cuál es, tráelo y lo miramos.</p>\n        </Acordeon.Seccion>\n        <Acordeon.Seccion valor=\"coccion\" titulo=\"¿Cuándo puedo recoger mis piezas?\">\n          <p>A las dos o tres semanas: se secan, van al horno sin esmalte y vuelven a entrar esmaltadas.</p>\n        </Acordeon.Seccion>\n        <Acordeon.Seccion valor=\"encargos\" titulo=\"¿Hacéis encargos para bodas?\">\n          <p>Sí, a partir de 30 piezas. Escríbenos con tres meses de antelación.</p>\n        </Acordeon.Seccion>\n      </Acordeon>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Acordeon.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\n\nconst AcordeonContexto = createContext(null)\n\nexport default function Acordeon({ children }) {\n  // 1. Guarda en el estado el valor de la sección abierta (null si no hay\n  //    ninguna) y compártelo con las secciones a través de AcordeonContexto.\n  return <div className=\"acordeon\">{children}</div>\n}\n\nfunction Seccion({ valor, titulo, children }) {\n  // 2. Lee del contexto el valor de la sección abierta y calcula si es esta.\n  const abierta = false\n\n  // 3. Al pulsar la pregunta, abre esta sección. Si ya estaba abierta, ciérrala.\n  function alternar() {}\n\n  return (\n    <div className=\"seccion\">\n      <h3>\n        <button\n          type=\"button\"\n          id={'pregunta-' + valor}\n          aria-expanded={abierta}\n          aria-controls={'respuesta-' + valor}\n          onClick={alternar}\n        >\n          {titulo}\n        </button>\n      </h3>\n      {/* 4. La respuesta solo se ve si esta sección está abierta. */}\n      <div id={'respuesta-' + valor} role=\"region\" aria-labelledby={'pregunta-' + valor}>\n        {children}\n      </div>\n    </div>\n  )\n}\n\nAcordeon.Seccion = Seccion\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin-bottom: 0;\n  font-size: 1.4rem;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\n.acordeon {\n  border: 1px solid #e7d8c9;\n  border-radius: 12px;\n  overflow: hidden;\n}\n\n.seccion + .seccion {\n  border-top: 1px solid #e7d8c9;\n}\n\n.seccion h3 {\n  margin: 0;\n}\n\n.seccion button {\n  width: 100%;\n  padding: 0.7rem 0.9rem;\n  border: 0;\n  background: #fffaf5;\n  font: inherit;\n  font-weight: 600;\n  text-align: left;\n  cursor: pointer;\n}\n\n.seccion button[aria-expanded='true'] {\n  background: #f3e5d8;\n}\n\n[role='region'] {\n  padding: 0 0.9rem 0.7rem;\n  background: #f3e5d8;\n}\n\n[role='region'] p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "Acordeon.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al principio no se ve ninguna respuesta",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "region",
          "nombre": "¿Puedo traer mi propio barro?"
        }
      }
    },
    {
      "descripcion": "Al pulsar «¿Puedo traer mi propio barro?», se ve su respuesta",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Puedo traer mi propio barro?"
          }
        }
      ],
      "espera": {
        "rol": "region",
        "nombre": "¿Puedo traer mi propio barro?",
        "texto": "gres o arcilla"
      }
    },
    {
      "descripcion": "Al abrir una pregunta, las demás respuestas siguen cerradas",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Puedo traer mi propio barro?"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "region",
          "nombre": "¿Hacéis encargos para bodas?"
        }
      }
    },
    {
      "descripcion": "Al abrir otra pregunta, la que estaba abierta se cierra",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Puedo traer mi propio barro?"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Cuándo puedo recoger mis piezas?"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "region",
          "nombre": "¿Puedo traer mi propio barro?"
        }
      }
    },
    {
      "descripcion": "Al pulsar otra vez la pregunta abierta, su respuesta se cierra",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Hacéis encargos para bodas?"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "¿Hacéis encargos para bodas?"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "region",
          "nombre": "¿Hacéis encargos para bodas?"
        }
      }
    }
  ]
}
```

Si te atascas: la raíz es casi igual que `Pestanas`, con `useState(null)` porque al principio no hay nada abierto, y `alternar` tiene que distinguir dos casos con un ternario.

**Retos para seguir practicando** (sin comprobación automática):

1. Haz que `Pestanas` funcione también **controlada**, como los componentes controlados de la lección 25: si recibe `valor` y `onCambiar`, manda el padre; si no, usa su propio estado. Pruébalo con un botón «Ver medidas» fuera de las pestañas que abra la de medidas.
2. Rehaz el `Escaparate` sin `Children` ni `cloneElement`, con `piezas` y `renderPieza(pieza, destacada)`. Comprueba que ahora las piezas de temporada se pueden añadir sin romper nada.
3. Añade a `ListaPaginada` un hueco `vacio` que se pinte cuando no hay elementos. ¿Te basta con un hueco, o necesitarías una render prop `renderVacio`? ¿Qué datos tendría que recibir para merecerla?
4. Dale al acordeón una prop `multiple` que permita tener varias secciones abiertas a la vez. Pista: en vez de un valor, guarda un `Set` o un array de valores abiertos (lección 24).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "cloneElement: Alternatives",
      "descripcion": "Las tres alternativas a clonar elementos que propone react.dev: render props, contexto y hooks propios, con un ejemplo de lista con fila destacada.",
      "url": "https://react.dev/reference/react/cloneElement#alternatives",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Children: Alternatives",
      "descripcion": "Exponer varios componentes, pasar un array de objetos o una render prop, y por qué Children no ve lo que pintan los componentes que recibe.",
      "url": "https://react.dev/reference/react/Children#alternatives",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Legacy React APIs",
      "descripcion": "La lista de APIs que React mantiene pero no recomienda en código nuevo: Children, cloneElement, createElement, forwardRef...",
      "url": "https://react.dev/reference/react/legacy",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Passing JSX as children",
      "descripcion": "La sección sobre children de la página de props: un componente como un hueco que rellena el padre.",
      "url": "https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Tabs Pattern",
      "descripcion": "El patrón de pestañas de la WAI-ARIA APG: roles, atributos y el comportamiento de teclado completo que esta lección deja para la 34.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
      "etiqueta": "APG"
    },
    {
      "titulo": "Accordion Pattern",
      "descripcion": "El patrón de acordeón de la APG, el del ejercicio: encabezado con botón, aria-expanded y región con aria-labelledby.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/accordion/",
      "etiqueta": "APG"
    },
    {
      "titulo": "Radix Primitives: Tabs",
      "descripcion": "Unas pestañas compuestas de una librería real: Tabs.Root, Tabs.List, Tabs.Trigger y Tabs.Content, con modo controlado y no controlado.",
      "url": "https://www.radix-ui.com/primitives/docs/components/tabs",
      "etiqueta": "Radix"
    }
  ]
}
```
