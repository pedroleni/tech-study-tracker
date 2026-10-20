# Responder a eventos

- **Módulo:** Interactividad
- **Slug:** `responder-a-eventos` (autogenerado del título)
- **Orden:** 150
- **Fuentes:** [Responding to Events](https://react.dev/learn/responding-to-events) + [Common components](https://react.dev/reference/react-dom/components/common) — ver `contenido/react/TEMARIO.md` #15

---

## Qué es y para qué sirve

Hasta ahora tus componentes describen la interfaz: reciben props y devuelven JSX. Pero una interfaz también tiene que **responder**: a un clic en «Reservar», a una tecla en un buscador, al envío de un formulario.

En JavaScript lo hacías buscando el elemento y enganchándole una función con `addEventListener`. En React no buscas nada: **le pasas la función como prop al propio elemento del JSX**, y React la llama cuando ocurre el evento.

```js
// JavaScript a mano: buscar el botón y engancharle una función
document.querySelector('#reservar').addEventListener('click', () => {
  console.log('Reserva enviada')
})
```

```jsx
// React: la función va en el JSX, pegada al botón que la usa
<button onClick={() => console.log('Reserva enviada')}>Reservar</button>
```

Esa función se llama **manejador de eventos** (*event handler*). En esta lección aprenderás a escribirlos, a pasarlos de un componente a otro, a leer el objeto evento y a controlar dos cosas que ya conoces del DOM: la propagación y lo que el navegador hace por su cuenta. Los ejemplos son de Ruedas del Turia, un alquiler de bicicletas de Valencia.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo que ya sabes de los eventos del DOM sigue valiendo",
  "contenido": "El burbujeo, target y currentTarget, stopPropagation y preventDefault funcionan en React como en las lecciones 44 a 46 del temario de JavaScript. Esta lección se centra en lo que cambia: dónde se escribe el manejador, cómo viaja de un componente a otro y los pocos eventos que React trata distinto que el navegador."
}
```

## Tu primer manejador

Hacen falta tres pasos:

1. Declara una función **dentro** del componente.
2. Escribe en ella lo que tiene que pasar.
3. Pásasela al elemento con `onClick={manejarReserva}`.

Por convención, el nombre empieza por `manejar` seguido del evento o de la acción: `manejarClic`, `manejarEnvio`, `manejarReserva`. En la documentación de React, en inglés, verás `handle`: `handleClick`, `handleSubmit`.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un botón que responde al clic",
  "codigo": "export default function App() {\n  function manejarReserva() {\n    console.log('Reserva enviada: bici urbana, 2 horas')\n  }\n\n  return (\n    <main>\n      <h1>Ruedas del Turia</h1>\n      <p>Bici urbana · 6 € la hora</p>\n      <button onClick={manejarReserva}>Reservar 2 horas</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  cursor: pointer;\n}",
  "anotaciones": [
    {
      "fragmento": "function manejarReserva() {",
      "nota": "Una función normal, declarada dentro del componente. Estar dentro le permite leer las props, como verás enseguida. El nombre dice qué hace: manejar más la acción."
    },
    {
      "fragmento": "console.log('Reserva enviada: bici urbana, 2 horas')",
      "nota": "Lo que pasa al pulsar. Aquí solo escribe en la consola; en una app real enviaría la reserva al servidor."
    },
    {
      "fragmento": "onClick={manejarReserva}",
      "nota": "onClick, en camelCase, recibe la función sin paréntesis. Le das a React la función para que la llame él cuando alguien pulse; no la llamas tú."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

Pulsa el botón varias veces: una línea por clic. Fíjate también en lo que **no** hay: ni `querySelector`, ni `addEventListener`, ni `removeEventListener`. React se encarga de escuchar el evento y, cuando el botón desaparece de la pantalla, su manejador desaparece con él.

El manejador también se puede escribir en línea, dentro del propio JSX, con una función normal o con una flecha:

```jsx
<button onClick={function manejarReserva() {
  console.log('Reserva enviada')
}}>

<button onClick={() => console.log('Reserva enviada')}>
```

Las tres formas son equivalentes. En línea es cómodo para una o dos líneas; si el manejador crece, sácalo a una función con nombre: el JSX se lee mejor y el nombre explica qué hace.

## Pásala, no la llames

El error más típico de esta lección se escribe con dos caracteres: `()`.

| Pasar la función (bien) | Llamarla (mal) |
|---|---|
| `onClick={manejarReserva}` | `onClick={manejarReserva()}` |
| `onClick={() => console.log('…')}` | `onClick={console.log('…')}` |

Lo que va entre llaves se evalúa **mientras React renderiza el componente** (lección 6). `manejarReserva` es la función; `manejarReserva()` es lo que devuelve al ejecutarla, y se ejecuta ahí mismo, al pintar el botón. Compruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos botones, dos paréntesis de diferencia",
  "consigna": "Antes de pulsar nada, mira la consola: ya hay dos reservas enviadas. Pulsa «Reservar (llamada)»: no pasa nada. Pulsa «Reservar (pasada)»: una línea por clic. Después quita los paréntesis del primer botón y repite.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nexport default function App() {\n  function manejarReserva() {\n    console.log('Reserva enviada')\n  }\n\n  return (\n    <main>\n      <h1>Bici urbana · 6 € la hora</h1>\n      <button onClick={manejarReserva()}>Reservar (llamada)</button>\n      <button onClick={manejarReserva}>Reservar (pasada)</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  cursor: pointer;\n}\n\nbutton {\n  margin-right: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Las dos líneas del principio salen del render: `manejarReserva()` se ejecutó al pintar el botón, y dos veces porque `StrictMode` renderiza cada componente dos veces en desarrollo (lección 12). Lo que recibió `onClick` fue lo que devolvió la función, `undefined`, así que el primer botón se quedó sin manejador y pulsarlo no hace nada. **Si un manejador se ejecuta al cargar la página y no al pulsar, busca unos paréntesis de más.**

Cuando la función cambie el estado (lección 16), el mismo despiste es peor: llamarla durante el render cambia el estado, eso provoca otro render, que vuelve a llamarla, que vuelve a cambiar el estado... React corta el bucle y la vista previa enseña este error:

```text
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

Es decir: demasiados renders seguidos; React los limita para no entrar en un bucle infinito.

## Leer las props desde el manejador

Como el manejador vive **dentro** del componente, ve todo lo que hay en su ámbito: las props y cualquier valor calculado durante el render. Es un closure de JavaScript de los de siempre. Así, un mismo componente responde distinto según las props que reciba:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Tres tarifas, un solo componente",
  "codigo": "function BotonTarifa({ horas, precioHora }) {\n  const total = horas * precioHora\n\n  function manejarClic() {\n    console.log(`Tarifa elegida: ${horas} h, ${total} €`)\n  }\n\n  return <button onClick={manejarClic}>{horas} h · {total} €</button>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Tándem · 9 € la hora</h1>\n      <BotonTarifa horas={1} precioHora={9} />\n      <BotonTarifa horas={3} precioHora={9} />\n      <BotonTarifa horas={8} precioHora={9} />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  cursor: pointer;\n}\n\nbutton {\n  margin-right: 0.5rem;\n}",
  "anotaciones": [
    {
      "fragmento": "const total = horas * precioHora",
      "nota": "Un valor calculado durante el render a partir de las props. El manejador lo ve igual que ve horas y precioHora."
    },
    {
      "fragmento": "console.log(`Tarifa elegida: ${horas} h, ${total} €`)",
      "nota": "Cada BotonTarifa crea su propio manejarClic en su render, con sus props: el de 3 horas recuerda horas = 3 y total = 27."
    },
    {
      "fragmento": "<BotonTarifa horas={3} precioHora={9} />",
      "nota": "Tres copias del mismo componente, tres manejadores distintos. Ninguno necesita saber nada de los otros."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

## Pasar un argumento: una flecha que espera al clic

A veces el manejador necesita un dato que no está en las props: en una lista (lección 11), **qué fila** se ha pulsado. Escribir `onClick={manejarReserva(bici)}` sería llamarla durante el render, el error de antes. La solución es envolver la llamada en una flecha: `onClick={() => manejarReserva(bici)}` crea una función que no hace nada hasta el clic, y entonces llama a `manejarReserva` con *esa* bici.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cada fila reserva su bici",
  "consigna": "Pulsa «Reservar» en cada fila: el manejador es el mismo, pero cada flecha le pasa su bici. Después quita la flecha de la línea del botón, deja onClick={manejarReserva(bici)} y mira la consola antes de pulsar nada.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nconst bicis = [\n  { id: 'urbana', nombre: 'Bici urbana', precioHora: 6 },\n  { id: 'electrica', nombre: 'Bici eléctrica', precioHora: 11 },\n  { id: 'tandem', nombre: 'Tándem', precioHora: 9 },\n]\n\nexport default function App() {\n  function manejarReserva(bici) {\n    console.log(`Reserva: ${bici.nombre}, ${bici.precioHora} € la hora`)\n  }\n\n  return (\n    <main>\n      <h1>Bicis disponibles hoy</h1>\n      <ul>\n        {bicis.map((bici) => (\n          <li key={bici.id}>\n            {bici.nombre} · {bici.precioHora} € la hora{' '}\n            <button onClick={() => manejarReserva(bici)}>\n              Reservar {bici.nombre.toLowerCase()}\n            </button>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  cursor: pointer;\n}\n\nli {\n  margin-bottom: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Sin la flecha, la consola se llena al cargar: seis reservas, una por bici y por cada uno de los dos renders de `StrictMode`. Y los botones ya no hacen nada.

La flecha crea una función nueva en cada render, por cada fila. No te preocupes por eso: es lo normal en React y casi nunca tiene un coste que se note. Cuándo importa de verdad lo verás en el módulo 9.

## Manejadores como props: el padre decide qué pasa

A menudo el componente que pinta el botón no es el que sabe qué hacer con el clic. Un `Boton` con el estilo de la casa sirve para reservar, para abrir el mapa y para cien cosas más; lo que hace cada uno depende de dónde se use. La solución: **el padre pasa la función como prop**, y el hijo se la entrega al `<button>` de verdad.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El clic ocurre abajo; lo que pasa, lo decide App",
  "consigna": "Pulsa los botones de las dos tarjetas y sigue el rastro en la consola. Luego abre TarjetaBici.jsx: no sabe qué significa reservar, solo avisa de que alguien quiere hacerlo y con qué bici.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import TarjetaBici from './TarjetaBici'\nimport './estilos.css'\n\nconst bicis = [\n  { id: 'electrica', nombre: 'Bici eléctrica', precioHora: 11, estacion: 'Torres de Serranos' },\n  { id: 'tandem', nombre: 'Tándem', precioHora: 9, estacion: 'Ciudad de las Ciencias' },\n]\n\nexport default function App() {\n  function manejarReserva(bici) {\n    console.log(`App: reserva enviada para ${bici.nombre}`)\n  }\n\n  return (\n    <main>\n      <h1>Ruedas del Turia</h1>\n      {bicis.map((bici) => (\n        <TarjetaBici\n          key={bici.id}\n          bici={bici}\n          onReservar={manejarReserva}\n          onVerEstacion={() => console.log(`App: abro el mapa en ${bici.estacion}`)}\n        />\n      ))}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaBici.jsx",
      "codigo": "import Boton from './Boton'\n\nexport default function TarjetaBici({ bici, onReservar, onVerEstacion }) {\n  return (\n    <article className=\"tarjeta\">\n      <h2>{bici.nombre}</h2>\n      <p>\n        {bici.precioHora} € la hora · Estación {bici.estacion}\n      </p>\n      <Boton onClick={() => onReservar(bici)}>Reservar {bici.nombre.toLowerCase()}</Boton>\n      <Boton onClick={onVerEstacion}>Mapa de {bici.estacion}</Boton>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Boton.jsx",
      "codigo": "export default function Boton({ onClick, children }) {\n  return (\n    <button className=\"boton\" onClick={onClick}>\n      {children}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  margin-bottom: 0.75rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-left: 4px solid #ea580c;\n  border-radius: 8px;\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.boton {\n  margin-right: 0.5rem;\n  padding: 0.4rem 0.75rem;\n  border: none;\n  border-radius: 6px;\n  background: #c2410c;\n  color: #ffffff;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El recorrido de un clic en «Reservar tándem»:

1. El `<button>` de `Boton` recibe el clic, y React llama a su `onClick`.
2. Ese `onClick` es la flecha que escribió `TarjetaBici`: `() => onReservar(bici)`.
3. `onReservar` es `manejarReserva`, la función de `App`, que recibe la bici y hace el trabajo.

Los botones del mapa van más directos: `TarjetaBici` entrega `onVerEstacion` tal cual a `Boton`, y la flecha que la creó en `App` ya sabe de qué estación se trata.

**El hijo avisa; el padre decide.** `TarjetaBici` y `Boton` se pueden reutilizar en cualquier pantalla porque no saben qué pasa al pulsar. Es la forma en que los componentes se comunican de abajo arriba, y la usarás constantemente desde la lección 25, cuando el estado suba al padre.

## Ponles nombre: `onReservar`, no `onClick`

`<button>` y el resto de elementos del navegador solo entienden los nombres de evento del DOM (`onClick`, `onChange`, `onSubmit`...). **Tus componentes, en cambio, pueden llamar a sus props de evento como quieran**: para React, `onReservar` es una prop más que contiene una función. La convención es `on` seguido de una mayúscula, como ya viste en la lección 8.

Mejor si el nombre describe lo que significa en tu app y no el gesto: `onReservar` dice qué quiere hacer la persona; `onClick` solo dice que ha pulsado algo. Si mañana `TarjetaBici` permite reservar también con un atajo de teclado, `App` no tiene que cambiar ni una línea. Para un componente genérico como `Boton`, en cambio, `onClick` es el nombre justo: no sabe nada de reservas, solo de que lo pulsan.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres nombres para una misma cadena",
  "roles": [
    {
      "etiqueta": "manejarReserva",
      "rol": "El manejador",
      "descripcion": "La función que hace el trabajo. Vive en el componente que sabe qué hacer, aquí App. Su nombre empieza por manejar."
    },
    {
      "etiqueta": "onReservar",
      "rol": "La prop de evento de tu componente",
      "descripcion": "El nombre con el que la función viaja hacia el hijo. Lo eliges tú: on más un verbo de tu app, como onReservar u onCancelar."
    },
    {
      "etiqueta": "onClick",
      "rol": "La prop del elemento del navegador",
      "descripcion": "De los tres nombres, el único que entiende un button. Al final de la cadena, alguien tiene que entregarle la función a un elemento del DOM con un nombre de evento real."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un botón, no un div con onClick",
  "contenido": "Cualquier elemento acepta onClick, también un div. Pero a un div no se llega con el tabulador, no responde a Enter ni a la barra espaciadora y un lector de pantalla no lo anuncia como botón. Si se pulsa para hacer algo, es un button; si lleva a otra página, un enlace. Y si no te gusta su aspecto, cámbialo con CSS. Las comprobaciones de los ejercicios buscan los botones por su rol, así que un div con onClick tampoco las supera."
}
```

## El objeto evento

React llama a tu manejador con un argumento: el **objeto evento**, que por costumbre se llama `e`. Trae lo que ya conoces del DOM: `e.type`, `e.target`, `e.currentTarget`, `e.key` en los eventos de teclado, `e.preventDefault()`, `e.stopPropagation()`...

Pero no es el evento del navegador, sino un **evento sintético** (*synthetic event*) de React que lo envuelve: tiene las mismas propiedades y métodos estándar y corrige diferencias entre navegadores. Si alguna vez necesitas el original, está en `e.nativeEvent`.

En esta tarjeta, el `article` tiene un manejador que solo registra dónde pulsa la gente, como haría una herramienta de analítica. No es un control: el único botón es «Añadir a favoritos».

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "target, currentTarget y el evento del navegador",
  "codigo": "export default function App() {\n  function registrarClic(e) {\n    console.log('type:', e.type)\n    console.log('target:', e.target.tagName)\n    console.log('currentTarget:', e.currentTarget.tagName)\n    console.log('¿e es un MouseEvent del navegador?', e instanceof MouseEvent)\n    console.log('¿Y e.nativeEvent?', e.nativeEvent instanceof MouseEvent)\n  }\n\n  return (\n    <article className=\"tarjeta\" onClick={registrarClic}>\n      <h2>Bici eléctrica</h2>\n      <p>11 € la hora · Estación Torres de Serranos</p>\n      <button>Añadir a favoritos</button>\n    </article>\n  )\n}",
  "css": ".tarjeta {\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-left: 4px solid #ea580c;\n  border-radius: 8px;\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  cursor: pointer;\n}",
  "anotaciones": [
    {
      "fragmento": "function registrarClic(e) {",
      "nota": "React pasa el objeto evento como primer y único argumento. El nombre e es costumbre; podrías llamarlo evento."
    },
    {
      "fragmento": "console.log('target:', e.target.tagName)",
      "nota": "target es el elemento donde empezó el clic: BUTTON, H2 o P según dónde pulses. Puede ser un hijo lejano del elemento que tiene el manejador."
    },
    {
      "fragmento": "console.log('currentTarget:', e.currentTarget.tagName)",
      "nota": "currentTarget es el elemento que tiene este manejador: siempre ARTICLE, pulses donde pulses. Igual que con addEventListener."
    },
    {
      "fragmento": "e instanceof MouseEvent)",
      "nota": "false: e no es el evento del navegador, sino el objeto de React que lo envuelve, con sus mismas propiedades y métodos estándar."
    },
    {
      "fragmento": "e.nativeEvent instanceof MouseEvent",
      "nota": "true: nativeEvent es el evento original del navegador, para el día que necesites algo que el de React no trae. Casi nunca hace falta."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

Pulsa el botón, luego el título y luego el precio: `target` cambia según dónde pulses; `currentTarget` siempre es el `article`. Dos detalles prácticos:

- **La consola de esta web no despliega objetos**: `console.log(e)` sale como `[object Object]`. Imprime propiedades sueltas, como aquí. En las herramientas de desarrollo del navegador (F12) sí puedes desplegar el evento entero.
- **React escucha desde la raíz.** No pone un oyente en cada botón: escucha los eventos en el contenedor de `createRoot` (el `<div id="root">` de la lección 3) y desde ahí llama a los manejadores que toca. Es la delegación de eventos que conoces de JavaScript, ya hecha. Por eso `e.currentTarget` es el `article`, pero `e.nativeEvent.currentTarget`, el del evento real, es el `<div id="root">`.

## La propagación: el clic sube por el árbol

Como en el DOM, un evento empieza en el elemento donde ocurre y **sube** por sus antepasados, llamando a cada manejador del mismo evento que encuentra por el camino. Primero el del botón, luego el de su padre, luego el del abuelo... En React, esos antepasados son los del JSX, aunque estén en otros componentes.

Casi siempre es lo que quieres, pero a veces dos manejadores se pisan. En el mapa de estaciones, pulsar en el mapa cierra la ficha que haya abierta, y pulsar en una estación abre la suya. ¿Qué pasa al pulsar una estación?

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ficha que se abre y se cierra en el mismo clic",
  "consigna": "Pulsa una estación: la consola dice que se abre su ficha y, justo después, que se cierra. Pulsa en una zona vacía del mapa: solo se cierra. Arréglalo para que el clic en una estación no llegue al mapa.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nconst estaciones = ['Torres de Serranos', 'Mercado Central', 'Ciudad de las Ciencias']\n\nexport default function App() {\n  function manejarClicMapa() {\n    console.log('Mapa: cierro la ficha abierta')\n  }\n\n  function manejarClicEstacion(estacion) {\n    console.log(`Estación: abro la ficha de ${estacion}`)\n  }\n\n  return (\n    <main>\n      <h1>Mapa de estaciones</h1>\n      <div className=\"mapa\" onClick={manejarClicMapa}>\n        {estaciones.map((estacion) => (\n          <button\n            key={estacion}\n            className=\"estacion\"\n            onClick={() => manejarClicEstacion(estacion)}\n          >\n            {estacion}\n          </button>\n        ))}\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.mapa {\n  display: flex;\n  flex-wrap: wrap;\n  align-content: flex-start;\n  gap: 0.5rem;\n  height: 140px;\n  padding: 1rem;\n  border-radius: 8px;\n  background: #dcfce7;\n}\n\n.estacion {\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #15803d;\n  border-radius: 999px;\n  background: #ffffff;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El arreglo es `e.stopPropagation()`: el manejador de la estación lo llama y el evento deja de subir, así que el del mapa no se entera. Fíjate en un detalle: el evento lo recibe **la flecha**, así que si `manejarClicEstacion` lo necesita, la flecha tiene que pasárselo:

```jsx
function manejarClicEstacion(e, estacion) {
  e.stopPropagation()
  console.log(`Estación: abro la ficha de ${estacion}`)
}

// ...
<button onClick={(e) => manejarClicEstacion(e, estacion)}>
```

`stopPropagation()` solo frena la subida: lo que el navegador haga por defecto sigue ocurriendo. (En un mapa de verdad, la ficha también se cerraría con Escape o con un botón «Cerrar»: el clic en el fondo es un atajo para el ratón, no la única forma.)

¿Y si la que corta la subida es una capa intermedia? En este catálogo hay tres manejadores, uno dentro de otro. ¿Qué sale en la consola, y en qué orden, al pulsar «Reservar»?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  return (\n    <section onClick={() => console.log('Catálogo')}>\n      <article\n        onClick={(e) => {\n          e.stopPropagation()\n          console.log('Tarjeta')\n        }}\n      >\n        <h2>Tándem</h2>\n        <button onClick={() => console.log('Botón')}>Reservar</button>\n      </article>\n    </section>\n  )\n}",
  "opciones": [
    "Botón, Tarjeta y Catálogo",
    "Botón y Tarjeta",
    "Solo Botón",
    "Tarjeta y Botón"
  ],
  "correcta": 1,
  "explicacion": "El clic empieza en el botón y sube: primero su manejador, después el del article. Ese llama a stopPropagation, así que la section no se entera. stopPropagation no deshace lo que ya ha pasado más abajo: solo frena lo que queda por encima. Y da igual que lo llame antes o después de su console.log."
}
```

### Pasar manejadores en vez de confiar en la propagación

La propagación es automática, y por eso a veces cuesta seguirla: un clic dispara un manejador que está tres componentes más arriba y no hay nada en el código del botón que lo diga. La alternativa que propone react.dev es hacer la cadena **explícita**: el hijo para la propagación, hace lo suyo y llama a la prop que le pasó el padre.

```jsx
function Estacion({ nombre, onAbrir }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onAbrir(nombre)
      }}
    >
      {nombre}
    </button>
  )
}
```

Así, leyendo `Estacion` sabes exactamente qué pasa al pulsarla. Si un día no entiendes por qué se ejecuta un manejador, prueba este patrón.

### La fase de captura: `onClickCapture`

Como en el DOM, antes de subir el evento **baja** desde la raíz hasta el elemento pulsado. React te deja escuchar esa bajada añadiendo `Capture` al nombre del evento: `onClickCapture`, `onKeyDownCapture`...

```jsx
<main onClickCapture={registrarClic}>
  {/* Toda la app: botones, mapas, tarjetas... */}
</main>
```

El orden completo de un clic en un botón es: los `onClickCapture` de sus antepasados, de fuera hacia dentro; el `onClick` del botón; y los `onClick` de los antepasados, de dentro hacia fuera. Como la captura va antes, **se ejecuta aunque el botón llame a `stopPropagation()`**. Sirve para cosas como registrar cada clic de la página para analítica, o para los routers; en el código de una app casi nunca lo necesitarás.

## Lo que el navegador hace solo: `preventDefault()`

Algunos eventos traen un comportamiento por defecto: un enlace navega a otra página y un formulario, al enviarse, **recarga la página**. En una app de React casi nunca quieres esa recarga: se perdería todo lo que hay en pantalla. La vista previa de esta web se comporta como una página real, así que puedes verlo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un formulario que recarga la página",
  "consigna": "Escribe un correo y pulsa «Suscribirme». La consola recibe la suscripción, pero el campo se vacía: la vista previa se ha recargado entera, como una página. Añade e.preventDefault() como primera línea de manejarEnvio y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nexport default function App() {\n  function manejarEnvio(e) {\n    const datos = new FormData(e.currentTarget)\n    console.log('Suscripción para', datos.get('correo'))\n  }\n\n  return (\n    <main>\n      <h1>Boletín de rutas en bici</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Correo\n          <input name=\"correo\" type=\"email\" required />\n        </label>\n        <button>Suscribirme</button>\n      </form>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: end;\n  gap: 0.5rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n}\n\ninput,\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Con `e.preventDefault()` el navegador deja de enviar el formulario por su cuenta: **el envío pasa a ser tuyo**. Aquí lo lees con `new FormData(e.currentTarget)`, que recoge cada campo por su atributo `name` sin necesidad de nada más: `e.currentTarget` es el `form`, el elemento que tiene el manejador. Hay otras dos formas que verás más adelante: guardar cada campo en el estado (lección 22) y `<form action>` (lección 57), con la que React se encarga del envío y ya no hace falta `preventDefault()`.

Con los enlaces pasa lo mismo: un `onClick` que llama a `e.preventDefault()` en un `<a>` evita la navegación. Es, por ejemplo, lo que hace por dentro el `<Link>` de React Router (lección 76) para cambiar de pantalla sin recargar.

Y dos detalles que no cambian respecto al DOM: `preventDefault()` no frena la propagación, y `stopPropagation()` no evita el comportamiento por defecto. Son dos cosas distintas:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Parecidos, pero no hacen lo mismo",
  "roles": [
    {
      "etiqueta": "e.stopPropagation()",
      "rol": "Corta la subida",
      "descripcion": "Los manejadores de los antepasados no se enteran del evento. Lo que haga el navegador por defecto sigue ocurriendo."
    },
    {
      "etiqueta": "e.preventDefault()",
      "rol": "Cancela lo que haría el navegador",
      "descripcion": "El formulario no se envía y el enlace no navega. El evento sigue subiendo y los demás manejadores se ejecutan."
    },
    {
      "etiqueta": "return false",
      "rol": "En React no hace nada",
      "descripcion": "En un atributo onclick de HTML cancelaba el comportamiento por defecto. React ignora lo que devuelve un manejador: llama a preventDefault()."
    }
  ]
}
```

## Los eventos que más vas a usar

La lista completa está en la referencia «Common components» de react.dev (enlazada al final). En el día a día te bastará con estos:

- **`onClick`**: pulsar con el ratón o el dedo, o con Enter o la barra espaciadora sobre un botón.
- **`onChange`**: en un campo de texto, salta **con cada tecla**. React lo hace funcionar como el evento `input` del navegador, no como `change`, que solo llega al salir del campo. Lo usarás muchísimo con los campos controlados de la lección 22.
- **`onSubmit`**: en el `<form>`, al enviarlo con su botón o con Enter desde un campo.
- **`onKeyDown`**: al pulsar una tecla. `e.key` dice cuál: `'Enter'`, `'Escape'`, `'a'`...
- **`onFocus`** y **`onBlur`**: al entrar en un campo y al salir de él.
- **`onPointerEnter`** y **`onPointerLeave`**: cuando el puntero (ratón, lápiz o dedo) entra en un elemento y cuando sale.

Pruébalos. Escribe en el campo «Estación», pulsa Enter, salta al otro campo con el tabulador y pasa el puntero por la tarifa nocturna:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Teclas, foco y puntero",
  "consigna": "Escribe una estación letra a letra y mira cuántas veces salta onChange. Pulsa Enter y luego Escape. Salta al campo «Código postal» con el tabulador: el div que envuelve los dos campos se entera de los dos onFocus. Pasa el puntero por la tarifa nocturna.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nexport default function App() {\n  function manejarCambio(e) {\n    console.log('onChange:', e.target.value)\n  }\n\n  function manejarTecla(e) {\n    if (e.key === 'Enter') {\n      console.log('onKeyDown: Enter, busco', e.target.value)\n    }\n    if (e.key === 'Escape') {\n      console.log('onKeyDown: Escape, cancelo la búsqueda')\n    }\n  }\n\n  return (\n    <main>\n      <h1>Buscar estación</h1>\n      <div\n        className=\"filtros\"\n        onFocus={(e) => console.log('onFocus en el div, desde', e.target.name)}\n        onBlur={(e) => console.log('onBlur en el div, desde', e.target.name)}\n      >\n        <label>\n          Estación\n          <input name=\"estacion\" onChange={manejarCambio} onKeyDown={manejarTecla} />\n        </label>\n        <label>\n          Código postal\n          <input name=\"codigoPostal\" inputMode=\"numeric\" />\n        </label>\n      </div>\n      <p\n        className=\"tarifa\"\n        onPointerEnter={() => console.log('onPointerEnter: el puntero entra')}\n        onPointerLeave={() => console.log('onPointerLeave: el puntero sale')}\n      >\n        Tarifa nocturna: de 22:00 a 7:00, la hora a mitad de precio\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.filtros {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  padding: 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 8px;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n}\n\ninput {\n  font: inherit;\n  padding: 0.35rem 0.5rem;\n}\n\n.tarifa {\n  padding: 0.75rem;\n  border-radius: 8px;\n  background: #1e293b;\n  color: #f8fafc;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

La consola enseña dos cosas que en el DOM no son así: `onChange` salta con cada letra, no al salir del campo, y el `div` recibe los `onFocus` y `onBlur` de sus campos (`e.target.name` dice de cuál viene). Lo que sí es igual que en el DOM: para leer lo que hay escrito no hace falta buscar el `input`, porque `e.target.value` lo trae.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "onChange salta con cada cambio",
      "texto": "En el DOM, change llega al salir del campo. En React, onChange se comporta como el evento input: una llamada por cada letra que escribes o borras."
    },
    {
      "titulo": "onFocus y onBlur burbujean",
      "texto": "Un onFocus en un contenedor se entera de cuándo entra el foco en cualquiera de sus campos. En el DOM, focus y blur no suben; para eso existen focusin y focusout."
    },
    {
      "titulo": "onScroll no se propaga",
      "texto": "Solo lo recibe el elemento que se desplaza. Un onScroll en un padre no se entera del scroll de sus hijos: ponlo en el contenedor que tiene la barra de desplazamiento."
    },
    {
      "titulo": "onPointerEnter y onPointerLeave no suben como los demás",
      "texto": "No tienen fase de captura ni burbujeo normal: saltan en los elementos de los que sale el puntero y en los que entra. Lo mismo pasa con onMouseEnter y onMouseLeave."
    }
  ]
}
```

## El sitio de los efectos secundarios

En la lección 12 viste que el render tiene que ser puro y que los cambios van en los manejadores. Ahora ya sabes escribirlos: **un manejador puede hacer todo lo que el render no debe**. Enviar la reserva al servidor, guardar algo, cambiar el título de la pestaña, reproducir un sonido. Se ejecuta una vez por evento y nunca durante el render, así que `StrictMode` no lo repite.

Lo que todavía no sabes es **cambiar lo que se ve**. Si un manejador cambia una variable normal, React no se entera y la pantalla no se mueve: lo viste en los errores típicos de la lección 1. Para que un clic cambie la interfaz, el dato tiene que vivir en algún sitio que React vigile: el **estado**, en la próxima lección. Por eso en esta los efectos se ven en la consola.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un manejador tiene que ser puro, como el componente",
      "realidad": "No. Se ejecuta por un evento concreto, una vez, fuera del render. Es justo el sitio para los efectos secundarios: peticiones al servidor, temporizadores, cambiar el título de la pestaña."
    },
    {
      "mito": "Si el manejador cambia una variable, la pantalla se actualiza",
      "realidad": "React solo vuelve a renderizar cuando cambia el estado, y una variable local además vuelve a su valor inicial en cada render. Lo verás en la lección 16."
    },
    {
      "mito": "Hay que quitar los manejadores al desmontar, como con removeEventListener",
      "realidad": "De los manejadores del JSX se encarga React: escucha desde la raíz y, cuando un elemento desaparece, su manejador deja de existir con él. Lo que sí tendrás que limpiar son los oyentes que añadas tú a window o a document, en el módulo 6."
    }
  ]
}
```

## Errores típicos

**Escribirlo como en HTML.** `onclick` en minúsculas no es una prop de evento de React: el botón no responde y la consola avisa.

```text
Invalid event handler property `onclick`. Did you mean `onClick`?
```

Es decir: «onclick» no es una propiedad de evento válida; ¿querías decir `onClick`? Y si le pasas código en un texto, `onClick="reservar()"`, como en un atributo de HTML:

```text
Expected `onClick` listener to be a function, instead got a value of `string` type.
```

Es decir: `onClick` esperaba una función y ha recibido un texto. El aviso sale al renderizar y, si pulsas el botón, salta además un error con el mismo mensaje.

**Llamar al manejador en vez de pasarlo.** `onClick={manejarReserva()}` lo ejecuta al renderizar y deja el botón sin manejador. Lo tienes arriba, en «Pásala, no la llames».

**Pasarle `onClick` a un componente tuyo y esperar que funcione solo.** ¿Qué sale en la consola al pulsar «Reservar»?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Boton({ children }) {\n  return <button className=\"boton\">{children}</button>\n}\n\nexport default function App() {\n  function manejarReserva() {\n    console.log('Bici reservada')\n  }\n\n  return <Boton onClick={manejarReserva}>Reservar</Boton>\n}",
  "opciones": [
    "Bici reservada",
    "Nada",
    "Un aviso de React: Boton no acepta onClick",
    "Bici reservada, dos veces por StrictMode"
  ],
  "correcta": 1,
  "explicacion": "En un componente tuyo, onClick es una prop más: llega a Boton, que no la usa, y no pasa sola al button. React no avisa, porque recibir una prop y no usarla es legal. El arreglo es recibirla y entregársela al elemento: function Boton({ onClick, children }) y <button onClick={onClick}>."
}
```

**Quitar el manejador con `&&`.** Para que un botón no haga nada cuando no quedan bicis, es tentador escribir `onClick={hayBicis && manejarReserva}`. Cuando `hayBicis` es `false`, `onClick` recibe `false`, y React lo dice claro:

```text
Expected `onClick` listener to be a function, instead got `false`.

If you used to conditionally omit it with onClick={condition && value}, pass onClick={condition ? value : undefined} instead.
```

Es decir: `onClick` esperaba una función y ha recibido `false`; si querías quitarlo según una condición, usa `condición ? valor : undefined`. Y si lo pulsas, salta un error, porque React intenta llamar a `false`. En un botón hay algo mejor todavía: `disabled={!hayBicis}`. Se ve desactivado, no se puede pulsar y los lectores de pantalla lo anuncian.

**Un botón sin `type` dentro de un formulario.** ¿Qué sale en la consola al pulsar «Ver precio»?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  function manejarEnvio(e) {\n    e.preventDefault()\n    console.log('Reserva enviada')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Nombre\n        <input name=\"nombre\" />\n      </label>\n      <button onClick={() => console.log('Precio: 18 €')}>Ver precio</button>\n      <button type=\"submit\">Reservar</button>\n    </form>\n  )\n}",
  "opciones": [
    "Precio: 18 €",
    "Precio: 18 €, y después Reserva enviada",
    "Reserva enviada",
    "Nada: un botón dentro de un formulario no recibe clics"
  ],
  "correcta": 1,
  "explicacion": "Un button sin type dentro de un form es de tipo submit. Primero se ejecuta su onClick y después el navegador envía el formulario, así que salta onSubmit. Los botones que no deben enviar llevan type=\"button\". Gracias a preventDefault, al menos la página no se recarga."
}
```

**Olvidar `preventDefault()` en un formulario.** Lo viste en el boletín: la consola parece ir bien, pero la página se recarga y se pierde lo que había en pantalla. Si un formulario «borra» los campos al enviarlo y nadie ha escrito código para borrarlos, sospecha de esto.

**Usar un `div` como botón.** Funciona con el ratón, pero no con el teclado ni con un lector de pantalla. Si se pulsa, es un `button`.

## Ejercicios

Ruedas del Turia enseña una ventana para confirmar la reserva sobre un fondo oscuro. `App` ya decide qué pasa en cada caso y se lo pasa a `VentanaReserva` con tres props de evento: `onConfirmar`, `onCancelar` y `onCerrar`. Para que veas el resultado en pantalla, `App` guarda un aviso en el **estado** con `useState`: todavía no lo has estudiado (es la lección 16), pero no tienes que tocarlo. Te basta con saber que `setAviso('…')` cambia el texto de debajo de la ventana. Para no complicarlo, la ventana no llega a desaparecer: cada acción solo cambia ese aviso.

Una ventana de verdad necesita además mover el foco a su interior y cerrarse con Escape; eso llega en la lección 37.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ventana que se cerraba sola",
  "consigna": "Trabaja en VentanaReserva.jsx. Conecta «Confirmar» con onConfirmar y «Cancelar» con onCancelar. Verás que, aun así, el aviso dice «Ventana cerrada sin cambios»: el clic sube hasta el fondo, que llama a onCerrar. Haz que nada de lo que se pulse dentro de la ventana llegue al fondo, y que pulsar fuera la siga cerrando. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport VentanaReserva from './VentanaReserva'\nimport './estilos.css'\n\nconst reserva = { bici: 'Tándem', horas: 2, precio: 18 }\n\nexport default function App() {\n  // aviso es el texto de debajo de la ventana, y setAviso('...') lo cambia.\n  // Es estado: lo verás en la lección 16. Aquí no tienes que tocarlo.\n  const [aviso, setAviso] = useState('Revisa tu reserva antes de confirmarla')\n\n  return (\n    <main>\n      <VentanaReserva\n        reserva={reserva}\n        onConfirmar={() => setAviso(`Reserva confirmada: ${reserva.bici}, ${reserva.horas} horas`)}\n        onCancelar={() => setAviso('Reserva cancelada')}\n        onCerrar={() => setAviso('Ventana cerrada sin cambios')}\n      />\n      <p className=\"aviso\" role=\"status\">\n        {aviso}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "VentanaReserva.jsx",
      "codigo": "export default function VentanaReserva({ reserva, onConfirmar, onCancelar, onCerrar }) {\n  // Pulsar en el fondo oscuro cierra la ventana: eso está bien.\n  // Pero ahora también se cierra al pulsar DENTRO de ella,\n  // y los botones todavía no hacen nada. Arréglalo.\n  return (\n    <div className=\"fondo\" onClick={onCerrar}>\n      <section className=\"ventana\" aria-labelledby=\"titulo-reserva\">\n        <h2 id=\"titulo-reserva\">Tu reserva</h2>\n        <p>\n          {reserva.bici} · {reserva.horas} horas · {reserva.precio} €\n        </p>\n        <div className=\"botones\">\n          <button>Confirmar</button>\n          <button>Cancelar</button>\n        </div>\n      </section>\n      Pulsa fuera de la ventana para cerrarla\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.fondo {\n  display: grid;\n  justify-items: center;\n  gap: 0.75rem;\n  padding: 1.5rem 1rem;\n  border-radius: 8px;\n  background: rgba(15, 23, 42, 0.8);\n  color: #f8fafc;\n  font-size: 0.9rem;\n  cursor: pointer;\n}\n\n.ventana {\n  width: min(100%, 320px);\n  padding: 1rem;\n  border-radius: 8px;\n  background: #ffffff;\n  color: #1e293b;\n  font-size: 1rem;\n  cursor: default;\n}\n\n.ventana h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.2rem;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  cursor: pointer;\n}\n\n.aviso {\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "VentanaReserva.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "«Confirmar» confirma la reserva del tándem",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar"
          }
        }
      ],
      "espera": {
        "texto": "Reserva confirmada: Tándem, 2 horas"
      }
    },
    {
      "descripcion": "«Cancelar» cancela la reserva",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar"
          }
        }
      ],
      "espera": {
        "texto": "Reserva cancelada"
      }
    },
    {
      "descripcion": "Pulsar dentro de la ventana, en el título o en el precio, no la cierra",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Tu reserva"
          }
        },
        {
          "pulsar": {
            "texto": "Tándem · 2 horas · 18 €"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Ventana cerrada sin cambios"
        }
      }
    },
    {
      "descripcion": "Pulsar en el fondo, fuera de la ventana, la sigue cerrando",
      "pasos": [
        {
          "pulsar": {
            "texto": "Pulsa fuera de la ventana para cerrarla"
          }
        }
      ],
      "espera": {
        "texto": "Ventana cerrada sin cambios"
      }
    }
  ]
}
```

El segundo ejercicio es un formulario para que la tienda te avise cuando haya tándems libres. Tiene dos fallos: enviarlo no hace nada (y en la vista previa recarga la página), y el botón «Ver disponibilidad» se comporta de forma rara.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Avísame cuando haya tándems",
  "consigna": "Completa manejarEnvio: que la vista previa no se recargue, lee el correo con FormData y muestra «Te avisaremos en » seguido del correo. Después pulsa «Ver disponibilidad» con un correo escrito: debe decir cuántos tándems quedan, sin enviar el formulario. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  // aviso es el texto de debajo del formulario, y setAviso('...') lo cambia.\n  // Es estado: lo verás en la lección 16. Aquí solo tienes que llamarlo.\n  const [aviso, setAviso] = useState('')\n\n  function manejarEnvio(e) {\n    // 1. Que la vista previa no se recargue.\n    // 2. Lee el correo del formulario y llama a setAviso con\n    //    «Te avisaremos en » seguido del correo.\n  }\n\n  function manejarDisponibilidad() {\n    setAviso('Ahora mismo no queda ningún tándem en Torres de Serranos')\n  }\n\n  return (\n    <main>\n      <h1>Avísame cuando haya tándems</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Correo\n          <input name=\"correo\" type=\"email\" />\n        </label>\n        <div className=\"botones\">\n          <button onClick={manejarDisponibilidad}>Ver disponibilidad</button>\n          <button type=\"submit\">Avisarme</button>\n        </div>\n      </form>\n      <p className=\"aviso\" role=\"status\">\n        {aviso}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nform {\n  display: grid;\n  gap: 0.75rem;\n  max-width: 320px;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n}\n\ninput,\nbutton {\n  font: inherit;\n  padding: 0.35rem 0.5rem;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\n.aviso {\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Avisarme», sale «Te avisaremos en» con el correo escrito",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@example.com"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Avisarme"
          }
        }
      ],
      "espera": {
        "texto": "Te avisaremos en marta@example.com"
      }
    },
    {
      "descripcion": "Pulsar Enter en el campo también envía el formulario",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "luis@example.com"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "texto": "Te avisaremos en luis@example.com"
      }
    },
    {
      "descripcion": "«Ver disponibilidad» dice cuántos tándems quedan y no envía el formulario",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "ana@example.com"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver disponibilidad"
          }
        }
      ],
      "espera": {
        "texto": "Ahora mismo no queda ningún tándem en Torres de Serranos"
      }
    },
    {
      "descripcion": "Después de enviar, el correo sigue escrito en el campo: la página no se ha recargado",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "marta@example.com"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Avisarme"
          }
        }
      ],
      "espera": {
        "etiqueta": "Correo",
        "valor": "marta@example.com"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Resuelve la ventana de reserva de otra forma: sin `stopPropagation()`, haz que el fondo solo cierre la ventana cuando el clic haya sido en el propio fondo. Pista: compara `e.target` con `e.currentTarget`.
2. Haz que Escape cierre la ventana. Pon un `onKeyDown` en el fondo y mira `e.key`. Pulsa «Confirmar» con el tabulador y Enter, y luego Escape: ¿por qué llega la tecla al fondo si el foco está en un botón?
3. En el mapa de estaciones, saca cada estación a un componente `Estacion` con una prop `onAbrir`, que pare la propagación antes de llamarla, como en «Pasar manejadores en vez de confiar en la propagación».
4. En el formulario de avisos, añade un `<select>` con `name="estacion"` y tres estaciones, y haz que el aviso diga en qué estación te avisarán. Léelo también con `FormData`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Responding to Events",
      "descripcion": "La página de react.dev en la que se basa esta lección: manejadores, props de evento, propagación, preventDefault y dos retos para practicar.",
      "url": "https://react.dev/learn/responding-to-events",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React event object",
      "descripcion": "La referencia del objeto evento de React: sus propiedades, sus métodos y qué cambia respecto al evento del navegador.",
      "url": "https://react.dev/reference/react-dom/components/common#react-event-object",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Common components",
      "descripcion": "Todas las props de evento que entienden los elementos del navegador, con las diferencias con el DOM y ejemplos de ratón, puntero, foco y teclado.",
      "url": "https://react.dev/reference/react-dom/components/common",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<form>",
      "descripcion": "Cómo manejar el envío con onSubmit y FormData, y la alternativa con action que verás en el módulo 8.",
      "url": "https://react.dev/reference/react-dom/components/form",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Event bubbling",
      "descripcion": "La guía de MDN sobre propagación, captura y delegación de eventos en el DOM, la base de lo que hace React por debajo.",
      "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling",
      "etiqueta": "MDN"
    }
  ]
}
```
