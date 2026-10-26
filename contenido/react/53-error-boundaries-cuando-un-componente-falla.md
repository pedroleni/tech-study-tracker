# Error boundaries: cuando un componente falla

- **Módulo:** Asincronía y concurrencia
- **Slug:** `error-boundaries-cuando-un-componente-falla` (autogenerado del título)
- **Orden:** 530
- **Fuentes:** [Component: catching rendering errors](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) + [createRoot](https://react.dev/reference/react-dom/client/createRoot) + [error-boundaries](https://react.dev/reference/eslint-plugin-react-hooks/lints/error-boundaries) — ver `contenido/react/TEMARIO.md` #53

---

## Qué es y para qué sirve

Ya sabes qué hace React con un error que nadie captura: **quita la app entera del contenedor** (lección 3). Un componente que lee `undefined.metros` al renderizar se lleva por delante la cabecera, el menú y todo lo demás, aunque no tengan nada que ver con él. Para el usuario, una página en blanco.

Un **error boundary** es un cortafuegos. Envuelve una parte de la interfaz y, si algo falla **al renderizar** dentro de ella, pinta otra cosa en su lugar (un aviso, un botón para reintentar) mientras el resto de la app sigue funcionando. Ya has visto alguno: en la lección 64, para leer la pila de componentes de un error; en la 91, como la única pieza de uso diario que todavía se escribe como clase; y en las lecciones 49 y 52, recogiendo el fallo de una promesa leída con `use`. Esta lección lo trata entero:

- **Qué captura y qué no.** No todo error pasa por un boundary: los de un manejador de eventos o un temporizador, por ejemplo, no.
- **Dónde ponerlos**, y cómo hacer que se recuperen: desde fuera con una `key`, como en las lecciones 48 y 49, o desde dentro, con un «Reintentar» que es el propio boundary quien ejecuta.
- **Las opciones de errores de `createRoot`**, la librería `react-error-boundary` y la regla del linter que vigila que no uses `try`/`catch` donde hace falta un boundary.
- **Qué pasa con esos errores en producción**: mandarlos a un servicio como Sentry, con *source maps* para poder leer las trazas y sin datos personales.

Los ejemplos son del panel del Centro de Buceo Posidonia: el parte del mar de cada cala y las salidas del día.

## Sin red de seguridad: un fallo se lleva la app entera

El panel recibe un parte del mar por cala. El de Los Farallones ha llegado incompleto: su sensor de visibilidad no ha enviado datos, y `parte.visibilidad` es `undefined`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un parte incompleto tumba el panel",
  "consigna": "Elige «Los Farallones» en el selector. Desaparece todo: el parte, las salidas que no tenían nada que ver y hasta el selector con el que podrías volver a Cala Azul. Debajo de la vista previa queda solo el recuadro rojo con el error.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\n// Así llegan los partes del mar. Al de Los Farallones le falta la\n// visibilidad: su sensor no ha enviado datos esta mañana.\nconst PARTES = {\n  'cala-azul': { cala: 'Cala Azul', oleaje: 'mar llana', temperatura: 22, visibilidad: { metros: 15 } },\n  'el-bajo': { cala: 'El Bajo de la Morena', oleaje: 'marejadilla', temperatura: 21, visibilidad: { metros: 9 } },\n  'los-farallones': { cala: 'Los Farallones', oleaje: 'marejada', temperatura: 20 },\n}\n\nconst SALIDAS = [\n  { id: 1, hora: '09:30', punto: 'Bajo de la Morena', plazas: 4 },\n  { id: 2, hora: '12:00', punto: 'Cueva del Pulpo', plazas: 2 },\n  { id: 3, hora: '17:00', punto: 'Los Farallones', plazas: 6 },\n]\n\nfunction ParteDelMar({ parte }) {\n  return (\n    <section className=\"tarjeta\">\n      <h2>Parte del mar · {parte.cala}</h2>\n      <p>Oleaje: {parte.oleaje}. Agua a {parte.temperatura} °C.</p>\n      <p>Visibilidad: {parte.visibilidad.metros} m</p>\n    </section>\n  )\n}\n\nfunction SalidasDeHoy() {\n  return (\n    <section className=\"tarjeta\">\n      <h2>Salidas de hoy</h2>\n      <ul>\n        {SALIDAS.map((salida) => (\n          <li key={salida.id}>\n            {salida.hora} · {salida.punto} · {salida.plazas} plazas libres\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [calaId, setCalaId] = useState('cala-azul')\n\n  return (\n    <main>\n      <h1>Centro de Buceo Posidonia</h1>\n      <label>\n        Cala{' '}\n        <select value={calaId} onChange={(e) => setCalaId(e.target.value)}>\n          <option value=\"cala-azul\">Cala Azul</option>\n          <option value=\"el-bajo\">El Bajo de la Morena</option>\n          <option value=\"los-farallones\">Los Farallones</option>\n        </select>\n      </label>\n      <ParteDelMar parte={PARTES[calaId]} />\n      <SalidasDeHoy />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e5a6e;\n  color: white;\n}\n\n.tarjeta {\n  padding: 0.25rem 1rem;\n  margin: 0.75rem 0;\n  border: 1px solid #a5d8e6;\n  border-radius: 8px;\n  background: #f0f9fc;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  margin: 0.75rem 0;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "mostrarConsola": false
}
```

El recuadro dice:

```text
Error al renderizar: Cannot read properties of undefined (reading 'metros') — App.jsx, línea 23
```

Es decir: al renderizar, el código ha intentado leer `metros` de algo que es `undefined`. React no puede terminar ese render y, como nadie captura el error, desmonta todo el árbol. La vista previa pinta este recuadro porque monta tu app con su propio `onUncaughtError` (lección 3); en tu proyecto, la página se quedaría en blanco y el error saldría en la consola.

## Escribir un error boundary

Un error boundary es un componente de clase con el método estático `getDerivedStateFromError`. Hoy no hay forma de escribirlo como función (lo viste en la lección 91), así que lo normal es escribir uno una vez, reutilizable, y usarlo en toda la app. Este recibe en la prop `alternativa` una función que dice qué pintar si algo falla:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El parte, con su propio cortafuegos",
  "codigo": "import { Component, useState } from 'react'\n\n// Así llegan los partes del mar. Al de Los Farallones le falta la\n// visibilidad: su sensor no ha enviado datos esta mañana.\nconst PARTES = {\n  'cala-azul': { cala: 'Cala Azul', oleaje: 'mar llana', temperatura: 22, visibilidad: { metros: 15 } },\n  'el-bajo': { cala: 'El Bajo de la Morena', oleaje: 'marejadilla', temperatura: 21, visibilidad: { metros: 9 } },\n  'los-farallones': { cala: 'Los Farallones', oleaje: 'marejada', temperatura: 20 },\n}\n\nconst SALIDAS = [\n  { id: 1, hora: '09:30', punto: 'Bajo de la Morena', plazas: 4 },\n  { id: 2, hora: '12:00', punto: 'Cueva del Pulpo', plazas: 2 },\n  { id: 3, hora: '17:00', punto: 'Los Farallones', plazas: 6 },\n]\n\nclass LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  componentDidCatch(error, info) {\n    console.log(`Al registro de errores: ${error.message}`)\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error)\n    }\n    return this.props.children\n  }\n}\n\nfunction ParteDelMar({ parte }) {\n  return (\n    <section className=\"tarjeta\">\n      <h2>Parte del mar · {parte.cala}</h2>\n      <p>Oleaje: {parte.oleaje}. Agua a {parte.temperatura} °C.</p>\n      <p>Visibilidad: {parte.visibilidad.metros} m</p>\n    </section>\n  )\n}\n\nfunction SalidasDeHoy() {\n  return (\n    <section className=\"tarjeta\">\n      <h2>Salidas de hoy</h2>\n      <ul>\n        {SALIDAS.map((salida) => (\n          <li key={salida.id}>\n            {salida.hora} · {salida.punto} · {salida.plazas} plazas libres\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [calaId, setCalaId] = useState('cala-azul')\n\n  return (\n    <main>\n      <h1>Centro de Buceo Posidonia</h1>\n      <label>\n        Cala{' '}\n        <select value={calaId} onChange={(e) => setCalaId(e.target.value)}>\n          <option value=\"cala-azul\">Cala Azul</option>\n          <option value=\"el-bajo\">El Bajo de la Morena</option>\n          <option value=\"los-farallones\">Los Farallones</option>\n        </select>\n      </label>\n      <LimiteDeError\n        alternativa={() => (\n          <p role=\"alert\">No hemos podido leer el parte de esta cala.</p>\n        )}\n      >\n        <ParteDelMar parte={PARTES[calaId]} />\n      </LimiteDeError>\n      <SalidasDeHoy />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e5a6e;\n  color: white;\n}\n\n.tarjeta {\n  padding: 0.25rem 1rem;\n  margin: 0.75rem 0;\n  border: 1px solid #a5d8e6;\n  border-radius: 8px;\n  background: #f0f9fc;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  margin: 0.75rem 0;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}",
  "anotaciones": [
    {
      "fragmento": "class LimiteDeError extends Component {",
      "nota": "Tiene que ser una clase: getDerivedStateFromError y componentDidCatch no tienen equivalente con Hooks. Un boundary bien hecho se escribe una vez y se usa en toda la app, con distintas alternativas."
    },
    {
      "fragmento": "static getDerivedStateFromError(error) {",
      "nota": "React lo llama durante el render, en cuanto un descendiente lanza un error, y vuelve a pintar el boundary con el estado que devuelve. Tiene que ser puro: con StrictMode, React lo llama varias veces por el mismo error."
    },
    {
      "fragmento": "componentDidCatch(error, info) {",
      "nota": "Se llama en el commit, con el aviso ya en pantalla. Es el sitio de los efectos: mandar el error y info.componentStack a tu registro de errores (lección 64). Es opcional."
    },
    {
      "fragmento": "return this.props.alternativa(this.state.error)",
      "nota": "Con error, el boundary pinta la alternativa; sin él, es transparente y pinta sus hijos. La alternativa es una función que recibe el error, para que cada sitio decida qué aviso enseña. react.dev la llama fallback, como la de Suspense."
    },
    {
      "fragmento": "alternativa={() => (\n          <p role=\"alert\">No hemos podido leer el parte de esta cala.</p>\n        )}",
      "nota": "Un aviso para personas, no el mensaje técnico: «Cannot read properties of undefined» es para tu registro de errores. role alert hace que un lector de pantalla lo anuncie (lección 37)."
    },
    {
      "fragmento": "<SalidasDeHoy />",
      "nota": "Fuera del boundary, igual que el selector. Si el parte falla, solo cae lo que está dentro: las salidas y el selector siguen funcionando."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

Elige «Los Farallones»: el parte se cambia por el aviso, y las salidas y el selector siguen en su sitio. La consola enseña dos cosas: la línea de `componentDidCatch` y el mensaje con el que React avisa de que un boundary ha capturado un error, que ya leíste en la lección 64:

```text
Cannot read properties of undefined (reading 'metros')

The above error occurred in the <ParteDelMar> component.

React will try to recreate this component tree from scratch using the error boundary you provided, LimiteDeError.
```

Es decir: el error ocurrió en `<ParteDelMar>`, y React reconstruirá esa parte del árbol con el boundary que has puesto, `LimiteDeError`. **El color rojo de la consola no significa que la app se haya caído**: el recuadro rojo de debajo de la vista previa no aparece, porque el error no ha llegado a la raíz.

Ahora vuelve a elegir «Cala Azul». El aviso sigue ahí. ¿Por qué?

## Reiniciar el boundary con una `key`

El boundary guarda el error en su estado, y nada lo borra: aunque `ParteDelMar` reciba ya un parte correcto, `LimiteDeError` sigue pintando la alternativa. La salida ya la conoces de las lecciones 48 y 49, donde reiniciaste un `<Suspense>` y el boundary de la hornada: **una `key` distinta es, para React, otro componente** (lección 26). Con la cala como `key`, cada cala empieza con un boundary nuevo y limpio, y sus hijos se montan desde cero:

```jsx
<LimiteDeError key={calaId} alternativa={() => <p role="alert">…</p>}>
  <ParteDelMar parte={PARTES[calaId]} />
</LimiteDeError>
```

La `key` va en el boundary, no en `ParteDelMar`: quien guarda el error es el boundary, y con la `key` solo en el hijo seguiría siendo el mismo, con el mismo error. Lo harás en el primer ejercicio. Más abajo verás la otra forma, desde dentro, para un botón «Reintentar».

## Qué captura un error boundary y qué no

La regla corta: **un boundary captura los errores que ocurren mientras React renderiza o hace el commit de sus hijos**. Lo que pasa fuera de ese momento (un clic, un temporizador, una promesa que nadie lee con `use`) no lo ve. Compruébalo caso por caso: cada botón del bloque siguiente monta un componente que falla de una forma distinta, dentro del mismo boundary.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Seis formas de fallar, un solo boundary",
  "consigna": "Prueba los seis casos. «Al pintar» y «En un efecto» fallan solos al elegirlos; en los demás, pulsa además el botón que aparece en la tarjeta. Cuando el boundary captura el error, la tarjeta se cambia por su aviso. Cuando no, la tarjeta sigue igual y el error sale en el recuadro rojo de debajo, que se queda puesto hasta que cambies el código: fíjate en si aparece al pulsar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport {\n  FalloAlPintar,\n  FalloEnAsync,\n  FalloEnEfecto,\n  FalloEnManejador,\n  FalloEnTemporizador,\n  FalloEnTransicion,\n} from './Casos'\nimport LimiteDeError from './LimiteDeError'\nimport './estilos.css'\n\nconst CASOS = [\n  { id: 'render', nombre: 'Al pintar', Componente: FalloAlPintar },\n  { id: 'efecto', nombre: 'En un efecto', Componente: FalloEnEfecto },\n  { id: 'manejador', nombre: 'En un manejador', Componente: FalloEnManejador },\n  { id: 'temporizador', nombre: 'En un setTimeout', Componente: FalloEnTemporizador },\n  { id: 'async', nombre: 'En una función async', Componente: FalloEnAsync },\n  { id: 'transicion', nombre: 'En una transición', Componente: FalloEnTransicion },\n]\n\nexport default function App() {\n  const [casoId, setCasoId] = useState(null)\n  const caso = CASOS.find((c) => c.id === casoId)\n\n  return (\n    <main>\n      <h1>¿Quién captura el error?</h1>\n      <div>\n        {CASOS.map((c) => (\n          <button key={c.id} aria-pressed={c.id === casoId} onClick={() => setCasoId(c.id)}>\n            {c.nombre}\n          </button>\n        ))}\n      </div>\n      <LimiteDeError\n        key={casoId}\n        alternativa={(error) => (\n          <p role=\"alert\">El boundary lo ha capturado: {error.message}</p>\n        )}\n      >\n        <section className=\"tarjeta\">\n          {caso ? <caso.Componente /> : <p>Elige dónde quieres que falle.</p>}\n        </section>\n      </LimiteDeError>\n      <p>El resto del panel de Posidonia sigue aquí.</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Casos.jsx",
      "codigo": "import { useEffect, useTransition } from 'react'\n\nconst esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms))\n\nexport function FalloAlPintar() {\n  const parte = { cala: 'Los Farallones' }\n  return <p>Visibilidad: {parte.visibilidad.metros} m</p>\n}\n\nexport function FalloEnEfecto() {\n  useEffect(() => {\n    throw new Error('el sensor de oleaje no responde')\n  }, [])\n  return <p>Conectando con el sensor de oleaje…</p>\n}\n\nexport function FalloEnManejador() {\n  function manejarClic() {\n    throw new Error('la reserva no se ha podido guardar')\n  }\n  return <button onClick={manejarClic}>Reservar plaza</button>\n}\n\nexport function FalloEnTemporizador() {\n  function manejarClic() {\n    setTimeout(() => {\n      throw new Error('el recordatorio ha fallado')\n    }, 500)\n  }\n  return <button onClick={manejarClic}>Recordármelo en medio segundo</button>\n}\n\nexport function FalloEnAsync() {\n  async function manejarClic() {\n    await esperar(500)\n    throw new Error('el pago no se ha confirmado')\n  }\n  return <button onClick={manejarClic}>Pagar la salida</button>\n}\n\nexport function FalloEnTransicion() {\n  const [pagando, empezarTransicion] = useTransition()\n\n  function manejarClic() {\n    empezarTransicion(async () => {\n      await esperar(500)\n      throw new Error('el pago no se ha confirmado')\n    })\n  }\n\n  return (\n    <button onClick={manejarClic} disabled={pagando}>\n      {pagando ? 'Pagando…' : 'Pagar dentro de una transición'}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e5a6e;\n  color: white;\n}\n\n.tarjeta {\n  padding: 0.25rem 1rem;\n  margin: 0.75rem 0;\n  border: 1px solid #a5d8e6;\n  border-radius: 8px;\n  background: #f0f9fc;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  margin: 0.75rem 0;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "Casos.jsx",
  "mostrarConsola": true
}
```

Comprobado con React 19.3.1 en esta vista previa:

- **Al pintar** y **en un efecto**: el boundary los captura. Los efectos (`useEffect`, `useLayoutEffect`) forman parte del ciclo de React, y sus errores van al boundary más cercano igual que los del render.
- **En un manejador**: el boundary no se entera. El botón sigue ahí y el recuadro rojo dice «Error: Uncaught Error: la reserva no se ha podido guardar». React no desmonta nada, porque ningún render se ha roto.
- **En un `setTimeout`**: tampoco. El temporizador se ejecuta medio segundo después, cuando React ya no está renderizando nada: «Error: Uncaught Error: el recordatorio ha fallado».
- **En una función `async`**: una promesa rechazada que nadie atiende. El recuadro dice «Error: el pago no se ha confirmado» y la tarjeta sigue igual.
- **En una transición**: el mismo error asíncrono, pero dentro de la función que le pasas a `startTransition`. Aquí sí: React captura lo que lanza una acción de una transición y lo manda al boundary más cercano. Las transiciones son la lección 51.

Cambiar de caso borra el aviso porque el boundary tiene `key={casoId}`: es la técnica de la sección anterior.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que llega a un error boundary",
  "roles": [
    {
      "etiqueta": "Sí lo captura",
      "rol": "Errores durante el render y el commit",
      "descripcion": "El render de cualquier descendiente, sus efectos, las funciones de actualización de estado, las acciones de una transición y las promesas rechazadas que se leen con use."
    },
    {
      "etiqueta": "No lo captura",
      "rol": "Errores fuera de ese momento",
      "descripcion": "Los manejadores de eventos, el código asíncrono suelto (setTimeout, promesas sin use), los errores del propio boundary y el renderizado en el servidor."
    }
  ]
}
```

**Un error en un manejador no rompe la interfaz**, así que a menudo no necesita un boundary: lo capturas con un `try`/`catch` normal dentro del manejador y guardas un estado de error para enseñar un aviso junto al botón. Si de verdad quieres que lo pinte el boundary, tienes que meterlo en el render: guárdalo en el estado y lánzalo al renderizar (`if (error) throw error`), haz la operación dentro de una transición, o usa el `showBoundary` de `react-error-boundary`, que verás al final.

## Un boundary no se protege a sí mismo

Un boundary captura los errores de sus **hijos**, no los suyos. Si lo que falla es la propia alternativa, el error sigue subiendo hasta el siguiente boundary de arriba:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "<LimiteDeError alternativa={() => <p>Fuera: algo ha fallado en el panel.</p>}>\n  <section>\n    <LimiteDeError\n      alternativa={(error) => <p>Dentro: {error.mesage.toUpperCase()}</p>}\n    >\n      <ParteDelMar parte={partes['los-farallones']} />\n    </LimiteDeError>\n  </section>\n</LimiteDeError>\n\n// ParteDelMar lanza un error al leer parte.visibilidad.metros.\n// Fíjate bien en la alternativa de dentro. ¿Qué se ve?",
  "opciones": [
    "Dentro: CANNOT READ PROPERTIES OF UNDEFINED…",
    "Fuera: algo ha fallado en el panel.",
    "Nada: la app entera desaparece"
  ],
  "correcta": 1,
  "explicacion": "La alternativa de dentro tiene una errata: error.mesage es undefined, y undefined.toUpperCase() lanza otro error mientras el boundary de dentro se pinta. Ese error ya no es de un hijo suyo, así que sube al boundary de fuera, que cambia toda la sección por su aviso. Si no hubiera otro boundary, la app entera desaparecería."
}
```

Comprobado con React 19.3.1. Por eso **las alternativas tienen que ser lo más simples posible**, y por eso muchas apps ponen un último boundary alrededor de todo, con un aviso que no puede fallar.

## Dónde poner los límites

No hace falta un boundary por componente. La documentación lo plantea con una app de mensajería: tiene sentido uno alrededor de la lista de conversaciones y otro alrededor de cada mensaje, pero no uno alrededor de cada avatar. **La pregunta es dónde tiene sentido enseñar un aviso**, o sea, qué trozo de la pantalla puede fallar sin que el resto deje de servir. En el panel de Posidonia:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Tres niveles de cortafuegos en el panel",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0
    },
    {
      "nombre": "LimiteDeError",
      "nivel": 1,
      "etiqueta": "toda la app",
      "nota": "← último recurso: «Algo ha fallado», con un aviso que no puede fallar"
    },
    {
      "nombre": "Cabecera",
      "nivel": 2
    },
    {
      "nombre": "LimiteDeError",
      "nivel": 2,
      "etiqueta": "parte del mar",
      "nota": "← key={calaId}: cada cala empieza limpia"
    },
    {
      "nombre": "ParteDelMar",
      "nivel": 3
    },
    {
      "nombre": "LimiteDeError",
      "nivel": 2,
      "etiqueta": "salidas"
    },
    {
      "nombre": "SalidasDeHoy",
      "nivel": 3
    },
    {
      "nombre": "Salida",
      "nivel": 4,
      "clave": "1",
      "nota": "← sin boundary propio: si una salida falla, cae la lista entera, y está bien así"
    },
    {
      "nombre": "Salida",
      "nivel": 4,
      "clave": "2"
    }
  ]
}
```

Dos errores opuestos que conviene evitar:

- **Un único boundary arriba del todo.** Es mejor que una página en blanco, pero cualquier fallo, por pequeño que sea, cambia toda la app por el aviso. El usuario pierde también lo que sí funcionaba.
- **Un boundary en cada componente.** Una tarjeta de salida que se sustituye por «No se pudo mostrar esta salida» entre otras que sí se ven confunde más que ayuda, y llena el código de envoltorios.

## Reintentar desde el propio boundary

En la lección 49 escribiste un «Reintentar» para la hornada: el botón del boundary avisaba al padre, y el padre olvidaba la promesa rechazada de la caché y le daba al boundary una `key` nueva. Funciona, pero cada padre tiene que llevar la cuenta de los intentos. La alternativa es que **el boundary se reinicie solo y pregunte al padre qué hay que limpiar antes**:

```jsx
<LimiteDeError
  key={calaId}
  onReintentar={() => olvidar(`/api/partes/${calaId}`)}
  alternativa={(error, reintentar) => (
    <div role="alert">
      <p>No se pudo cargar el parte: {error.message}</p>
      <button onClick={reintentar}>Reintentar</button>
    </div>
  )}
>
  <Suspense fallback={<p>Cargando el parte…</p>}>
    <ParteDelMar calaId={calaId} />
  </Suspense>
</LimiteDeError>
```

Dentro de la clase, `reintentar` es un método que hace dos cosas, en este orden: llama a `onReintentar` si el padre lo ha pasado, y vacía el error de su estado con `this.setState`. Al quedarse sin error, el boundary vuelve a pintar a sus hijos: `ParteDelMar` llama otra vez a `leer`, que ya no tiene la promesa rechazada y hace una petición nueva; `<Suspense>` enseña su espera, y llega el parte. Lo escribirás en el segundo ejercicio.

Las dos formas se reparten el trabajo: la `key={calaId}` reinicia el boundary cuando cambia el contenido, y `reintentar` cuando el usuario lo pide sobre el mismo contenido. Es exactamente el reparto de `react-error-boundary`, que verás enseguida: `resetKeys` para lo primero, `resetErrorBoundary` y `onReset` para lo segundo.

**Reintentar solo sirve si algo puede haber cambiado.** Un fallo de red, sí: la siguiente petición puede salir bien. El parte de Los Farallones del principio, no: sin visibilidad, volver a renderizarlo lanza el mismo error al instante. Para un error de datos, un aviso claro y un camino a otra parte son más honestos que un botón que no arregla nada.

## Las opciones de errores de `createRoot`

Un boundary decide qué ve el usuario. Pero tú también quieres enterarte de que algo ha fallado en el navegador de alguien. Para eso están las tres opciones de `createRoot` que viste por encima en la lección 3. En la 64 las usaste en desarrollo, para escribir las dos pilas en la consola. Este es un `main.jsx` pensado para producción:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\n\nfunction informar(tipo, error, errorInfo) {\n  fetch('/api/errores', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      tipo,\n      mensaje: String(error?.message ?? error),\n      causa: error?.cause ? String(error.cause.message ?? error.cause) : null,\n      pila: errorInfo.componentStack,\n      pagina: location.pathname,\n    }),\n  }).catch(() => {}) // si ni esto llega, no hay nada más que hacer\n}\n\nconst opciones = import.meta.env.PROD\n  ? {\n      onUncaughtError: (error, errorInfo) => {\n        informar('sin capturar', error, errorInfo)\n        document.getElementById('error-global').hidden = false\n      },\n      onCaughtError: (error, errorInfo) => {\n        informar('capturado', error, errorInfo)\n      },\n      onRecoverableError: (error, errorInfo) => {\n        informar('recuperado', error, errorInfo)\n      },\n    }\n  : {}\n\ncreateRoot(document.getElementById('root'), opciones).render(<App />)",
  "anotaciones": [
    {
      "fragmento": "import.meta.env.PROD",
      "nota": "Solo en el build de producción (lección 85). Si pasas estas opciones, React deja de escribir esos errores en la consola por su cuenta; en desarrollo conviene conservar sus mensajes, y la documentación lo recomienda así."
    },
    {
      "fragmento": "onUncaughtError: (error, errorInfo) => {",
      "nota": "Ningún boundary lo ha capturado. Comprobado con 19.3.1: cuando React llama aquí, el contenedor root ya está vacío. Ya no hay app que pinte nada."
    },
    {
      "fragmento": "document.getElementById('error-global').hidden = false",
      "nota": "Por eso el último aviso no lo pinta React: es un elemento que ya estaba en index.html, oculto, fuera de root. HTML plano, que no puede fallar."
    },
    {
      "fragmento": "onCaughtError: (error, errorInfo) => {",
      "nota": "Errores que un boundary ya ha convertido en aviso: el usuario sigue usando la app, pero algo falla. Se registran igual; un boundary que salta a menudo es un fallo que arreglar."
    },
    {
      "fragmento": "onRecoverableError: (error, errorInfo) => {",
      "nota": "Errores de los que React se ha recuperado solo, sin que el usuario vea nada: un desajuste al hidratar HTML del servidor (lección 87) o un render concurrente que falló y salió bien al repetirlo."
    },
    {
      "fragmento": "error?.cause",
      "nota": "En los errores recuperables, error es un aviso de React y el error original viaja en error.cause. Guárdalo: es el que dice qué componente falló de verdad."
    },
    {
      "fragmento": "pila: errorInfo.componentStack",
      "nota": "La pila de componentes de la lección 64. En producción los nombres salen minificados; con los source maps de la build se recuperan."
    }
  ]
}
```

Y en `index.html`, junto a `root`:

```html
<div id="root"></div>
<div id="error-global" role="alert" hidden>
  <p>Algo ha fallado en la web de Posidonia.</p>
  <a href="/">Volver a empezar</a>
</div>
```

Lo de `onRecoverableError` lo comprobamos con React 19.3.1 con un componente que falla solo la primera vez que se renderiza dentro de una transición: React repite el render de forma síncrona, sale bien, el usuario no ve nada, y esta opción recibe un error con este mensaje:

```text
There was an error during concurrent rendering but React was able to recover by instead synchronously rendering the entire root.
```

Es decir: hubo un error durante un render concurrente, pero React se recuperó volviendo a renderizar toda la raíz de forma síncrona. El error del componente, el que te interesa, va en `error.cause`.

Esta vista previa no puede enseñarte tu propio `main.jsx`: monta tu `App` con su propio `createRoot` y su `onUncaughtError`, que es el que pinta el recuadro rojo.

## `react-error-boundary`: el boundary ya escrito

Escribir tu `LimiteDeError` es un buen ejercicio, pero en un proyecto real puedes ahorrártelo con **`react-error-boundary`**, el paquete que cita la propia documentación de React como alternativa a escribir la clase (versión 6.1.6; desde la 6 se publica solo como módulo ES, y la documentación del paquete remite a la 5 para proyectos que no los admiten). Trae lo que has ido escribiendo a mano, y algo más:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\nimport { ErrorBoundary, getErrorMessage, useErrorBoundary } from 'react-error-boundary'\n\nfunction AvisoDeError({ error, resetErrorBoundary }) {\n  return (\n    <div role=\"alert\">\n      <p>Algo ha fallado: {getErrorMessage(error)}</p>\n      <button onClick={resetErrorBoundary}>Reintentar</button>\n    </div>\n  )\n}\n\nfunction registrarError(error, info) {\n  console.log('Al registro:', getErrorMessage(error), info.componentStack)\n}\n\nfunction ParteDelMar({ cala }) {\n  if (cala === 'Los Farallones') throw new Error(`sin datos de visibilidad en ${cala}`)\n  return <p>{cala}: visibilidad 15 m</p>\n}\n\nfunction BotonReservar() {\n  const { showBoundary } = useErrorBoundary()\n\n  async function manejarClic() {\n    try {\n      const respuesta = await fetch('/api/reservas', { method: 'POST' })\n      if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n    } catch (error) {\n      showBoundary(error)\n    }\n  }\n\n  return <button onClick={manejarClic}>Reservar plaza</button>\n}\n\nexport default function Panel() {\n  const [cala, setCala] = useState('Los Farallones')\n\n  return (\n    <main>\n      <button onClick={() => setCala('Cala Azul')}>Ver Cala Azul</button>\n      <ErrorBoundary\n        FallbackComponent={AvisoDeError}\n        onError={registrarError}\n        onReset={(detalles) => console.log('Reinicio por', detalles.reason)}\n        resetKeys={[cala]}\n      >\n        <ParteDelMar cala={cala} />\n      </ErrorBoundary>\n      <ErrorBoundary FallbackComponent={AvisoDeError} onError={registrarError}>\n        <BotonReservar />\n      </ErrorBoundary>\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "function AvisoDeError({ error, resetErrorBoundary }) {",
      "nota": "La alternativa como componente (FallbackComponent). Recibe el error y resetErrorBoundary, que limpia el boundary y vuelve a pintar a sus hijos: el «desde dentro» de tu LimiteDeError. También admite fallback, un elemento fijo, y fallbackRender, una función como tu alternativa."
    },
    {
      "fragmento": "getErrorMessage(error)",
      "nota": "En la versión 6, error es de tipo unknown: en JavaScript se puede lanzar cualquier cosa, no solo un Error. getErrorMessage saca el mensaje si lo hay."
    },
    {
      "fragmento": "onError={registrarError}",
      "nota": "El componentDidCatch de tu clase: recibe el error y la información con componentStack, para tu registro de errores."
    },
    {
      "fragmento": "resetKeys={[cala]}",
      "nota": "Si alguno de estos valores cambia mientras hay un error, el boundary se reinicia solo. A diferencia de una key, cuando no hay error no desmonta nada. Comprobado: al pulsar «Ver Cala Azul», el aviso desaparece y sale el parte."
    },
    {
      "fragmento": "onReset={(detalles) => console.log('Reinicio por', detalles.reason)}",
      "nota": "Se llama al reiniciarse, con el motivo: «keys» si fue por resetKeys, «imperative-api» si fue con resetErrorBoundary. Es el sitio para olvidar una promesa rechazada en la caché."
    },
    {
      "fragmento": "const { showBoundary } = useErrorBoundary()",
      "nota": "Un Hook para los errores que un boundary no ve: un manejador, una petición asíncrona. showBoundary(error) se los entrega al boundary más cercano, que pinta su aviso como si hubiera fallado el render."
    }
  ]
}
```

Ejecutado fuera de esta web con `react-error-boundary` 6.1.6 y React 19.3.1: el parte de Los Farallones sale con su aviso, «Ver Cala Azul» lo reinicia por `resetKeys` y, al pulsar «Reservar plaza», el 500 de la reserva aparece en el aviso del segundo boundary gracias a `showBoundary`. En las vistas previas de estas lecciones no se puede instalar, así que aquí sigues usando tu `LimiteDeError`.

## En producción: `informar` se convierte en un servicio de errores

La función `informar` de más arriba manda cada error a `/api/errores`. La idea es buena, pero alguien tiene que recibir ese POST, guardarlo, juntar en uno el mismo fallo cuando se repite trescientas veces, avisarte y, lo más difícil, **traducir una traza de código minificado a tus archivos**. Eso es un **servicio de registro de errores**, y el más extendido en React es **Sentry**, con su SDK `@sentry/react` (versión 11.9.0, del 23 de octubre de 2026).

Todo lo de esta sección lo probamos en un proyecto de Vite 8.3.5 con React 19.3.1 y el panel de Posidonia, **sin cuenta de Sentry**: el DSN apuntaba a una dirección inventada, `errores.posidonia.example`, y un Chromium controlado por Playwright interceptaba esas peticiones. Lo que ves es, literalmente, lo que el SDK intentó enviar.

### Conectar `createRoot` con Sentry

Se instala con `npm install @sentry/react`, y son dos piezas: la configuración, en un archivo propio que se importa el primero, y las tres opciones de `createRoot`, que ya no llaman a `informar` sino al SDK:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// src/instrument.js\nimport * as Sentry from '@sentry/react'\n\nif (import.meta.env.PROD) {\n  Sentry.init({\n    dsn: import.meta.env.VITE_SENTRY_DSN,\n    environment: import.meta.env.MODE,\n  })\n}\n\n// src/main.jsx\nimport './instrument.js'\nimport * as Sentry from '@sentry/react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\n\nconst opciones = import.meta.env.PROD\n  ? {\n      onUncaughtError: Sentry.reactErrorHandler(() => {\n        document.getElementById('error-global').hidden = false\n      }),\n      onCaughtError: Sentry.reactErrorHandler(),\n      onRecoverableError: Sentry.reactErrorHandler(),\n    }\n  : {}\n\ncreateRoot(document.getElementById('root'), opciones).render(<App />)",
  "anotaciones": [
    {
      "fragmento": "if (import.meta.env.PROD) {",
      "nota": "En desarrollo no se envía nada: los errores de npm run dev solo te interesan a ti, y React sigue escribiendo sus mensajes en la consola. Para apagar el SDK del todo, la documentación de Sentry recomienda justo esto: llamar a init solo cuando toca."
    },
    {
      "fragmento": "dsn: import.meta.env.VITE_SENTRY_DSN",
      "nota": "La dirección a la que el SDK manda los eventos, que te da el panel de Sentry. Puede ir en una variable VITE_ (lección 85): según su documentación, el DSN es público a propósito, porque solo sirve para enviar eventos, no para leerlos."
    },
    {
      "fragmento": "environment: import.meta.env.MODE",
      "nota": "production o, con vite build --mode staging, staging (lección 85): en Sentry podrás separar los errores de cada entorno."
    },
    {
      "fragmento": "import './instrument.js'",
      "nota": "El primer import de la app, antes que App: así Sentry ya escucha cuando se ejecuta el resto del código."
    },
    {
      "fragmento": "onUncaughtError: Sentry.reactErrorHandler(() => {",
      "nota": "reactErrorHandler devuelve una función con la forma que espera React: envía el error con su componentStack y después llama a la tuya, que sigue destapando el aviso de index.html."
    },
    {
      "fragmento": "onCaughtError: Sentry.reactErrorHandler(),",
      "nota": "Cada error que captura un boundary, sea tu LimiteDeError, el de react-error-boundary o cualquier otro. Tu boundary no necesita ni una línea de Sentry: lo comprobamos con el LimiteDeError de esta lección y llegó un evento."
    },
    {
      "fragmento": "onRecoverableError: Sentry.reactErrorHandler(),",
      "nota": "Los recuperables, también. El SDK sigue la cadena de error.cause (lo verás en el evento de abajo), así que el error original del componente llega con el aviso de React."
    }
  ]
}
```

Con el `LimiteDeError` de esta lección alrededor del parte, elegir «Los Farallones» produjo **una sola petición**. Esto es lo que llevaba, recortado:

```text
POST https://errores.posidonia.example/api/1/envelope/?sentry_version=7&sentry_key=clavepublica&sentry_client=sentry.javascript.react%2F11.9.0

"exception": [
  {
    "type": "React ErrorBoundary TypeError",
    "value": "Cannot read properties of undefined (reading 'metros')",
    "mechanism": { "type": "chained", "source": "cause" },
    "stacktrace": … 4 marcos: la pila de componentes
  },
  {
    "type": "TypeError",
    "value": "Cannot read properties of undefined (reading 'metros')",
    "mechanism": { "type": "auto.function.react.error_handler", "handled": false },
    "stacktrace": … 16 marcos; el último:
      { "filename": "http://localhost:4181/assets/index-C0KANSYa.js",
        "function": "Nl", "lineno": 23, "colno": 51689 }
  }
],
"request": { "url": "http://localhost:4181/", "headers": { "User-Agent": "Mozilla/5.0 (…) HeadlessChrome/153.0.8010.12 Safari/537.36" } },
"contexts": { "react": { "version": "19.3.1" }, "culture": { "locale": "en-US", "timezone": "Europe/Madrid" } },
"environment": "production",
"sdk": { "settings": { "infer_ip": "auto" } }
```

Dos errores encadenados: el tuyo, `TypeError`, y otro que el SDK fabrica con la pila de componentes (lección 64) y cuelga de su `cause`, para que Sentry la enseñe junto a la traza. Con ellos viajan la página, el navegador, la versión de React, el idioma y la zona horaria. Y `"infer_ip": "auto"`, que retomaremos al hablar de datos personales.

El marco que importa es el último: el fallo está en la función `Nl`, línea 23, columna 51 689 de `index-C0KANSYa.js`. Ni `Nl` está en tu código ni tienes un archivo con ese nombre: es el build minificado (lección 64). Lo arreglan los *source maps*, dos apartados más abajo.

Sentry tampoco es gratis en bytes. En esta prueba, el JavaScript de la app pasó de unos 220 kB (69 kB comprimido) sin Sentry a 313 kB (100 kB) con él, y eso solo con la captura de errores, sin las trazas de rendimiento ni la grabación de sesiones que también ofrece. Lo puedes ver con el analizador de la lección 85.

### `Sentry.ErrorBoundary`: un boundary que además informa

El SDK trae también su propio boundary, muy parecido al de `react-error-boundary`, que manda el error desde su `componentDidCatch`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import * as Sentry from '@sentry/react'\nimport { useState } from 'react'\nimport { PARTES } from './datos.js'\nimport { ParteDelMar } from './Panel.jsx'\n\nexport default function App() {\n  const [calaId, setCalaId] = useState('cala-azul')\n\n  return (\n    <main>\n      <h1>Centro de Buceo Posidonia</h1>\n      <label>\n        Cala{' '}\n        <select value={calaId} onChange={(e) => setCalaId(e.target.value)}>\n          <option value=\"cala-azul\">Cala Azul</option>\n          <option value=\"el-bajo\">El Bajo de la Morena</option>\n          <option value=\"los-farallones\">Los Farallones</option>\n        </select>\n      </label>\n      <Sentry.ErrorBoundary\n        key={calaId}\n        beforeCapture={(scope) => scope.setTag('zona', 'parte-del-mar')}\n        fallback={({ resetError }) => (\n          <div role=\"alert\">\n            <p>No hemos podido leer el parte de esta cala.</p>\n            <button onClick={resetError}>Reintentar</button>\n          </div>\n        )}\n      >\n        <ParteDelMar parte={PARTES[calaId]} />\n      </Sentry.ErrorBoundary>\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Sentry.ErrorBoundary",
      "nota": "Un error boundary que, además de pintar la alternativa, envía el error a Sentry. No tiene resetKeys: para que cada cala empiece limpia, la key de siempre."
    },
    {
      "fragmento": "beforeCapture={(scope) => scope.setTag('zona', 'parte-del-mar')}",
      "nota": "Se ejecuta antes de enviar y añade una etiqueta al evento: en Sentry podrás filtrar los errores por zona de la pantalla. Pero lee la pregunta de abajo antes de contar con ella."
    },
    {
      "fragmento": "fallback={({ resetError }) => (",
      "nota": "La alternativa como función, igual que tu alternativa o el FallbackComponent de react-error-boundary. Recibe error, componentStack, resetError (el reintentar desde dentro) y eventId, el identificador del evento en Sentry. También admite un elemento fijo."
    },
    {
      "fragmento": "<button onClick={resetError}>Reintentar</button>",
      "nota": "Con un parte que sigue roto, cada reintento vuelve a fallar y es otro evento: lo comprobamos, dos eventos tras pulsar una vez. Sentry los agrupa en el mismo problema y cuenta las veces."
    }
  ]
}
```

Ahora junta este boundary con el `main.jsx` de antes, el que tiene `onCaughtError` conectado al SDK:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// main.jsx: las tres opciones conectadas, como arriba\ncreateRoot(document.getElementById('root'), {\n  // …\n  onCaughtError: Sentry.reactErrorHandler(),\n  // …\n}).render(<App />)\n\n// App.jsx\n<Sentry.ErrorBoundary\n  key={calaId}\n  beforeCapture={(scope) => scope.setTag('zona', 'parte-del-mar')}\n  fallback={({ resetError }) => (…)}\n>\n  <ParteDelMar parte={PARTES[calaId]} />\n</Sentry.ErrorBoundary>\n\n// Eliges Los Farallones y ParteDelMar falla.\n// ¿Qué le llega a Sentry?",
  "opciones": [
    "Dos eventos: uno de onCaughtError y otro del boundary",
    "Un evento, con la etiqueta zona: parte-del-mar",
    "Un evento, sin la etiqueta zona",
    "Nada: el boundary ya ha capturado el error"
  ],
  "correcta": 2,
  "explicacion": "Llega uno solo, porque el SDK marca los errores que ya ha enviado y no los repite. Pero React llama a onCaughtError antes que al componentDidCatch del boundary, así que lo envía la raíz sin pasar por beforeCapture, y la etiqueta se pierde. Comprobado con React 19.3.1 y @sentry/react 11.9.0: quitando onCaughtError de createRoot, el evento sí lleva zona: parte-del-mar."
}
```

Así que elige un camino, cualquiera de los dos funciona:

- **Una red en la raíz.** Las tres opciones de `createRoot` conectadas al SDK y tus boundaries (`LimiteDeError`, `react-error-boundary`) sin nada de Sentry dentro. Todo error capturado pasa por `onCaughtError`.
- **Los boundaries de Sentry.** `Sentry.ErrorBoundary` donde quieras etiquetas, y `onCaughtError` fuera de `createRoot`. Ojo: entonces un error que capture otro boundary no se envía (con `LimiteDeError`, ni una petición), salvo que ese boundary llame a `Sentry.captureReactException(error, info)` en su `componentDidCatch`, como indica la documentación de Sentry.

### Source maps: de `Nl` a `ParteDelMar`

`Nl`, línea 23, columna 51 689. Así es como el navegador ve tu app después de `npm run build`: unos pocos archivos enormes, con los nombres acortados. Un **source map** es un archivo JSON (`index-C0KANSYa.js.map`) que, para cada posición del archivo construido, dice de qué archivo, línea y columna de tu código viene. Vite lo genera con la opción `build.sourcemap`, y además, por defecto, guarda dentro el texto completo de tus archivos originales.

Con el `.map` de esa misma build, cualquiera puede deshacer el camino. Lo hicimos en local con la librería `@jridgewell/trace-mapping`, que es, en pequeño, lo que hace Sentry en su servidor con cada evento:

```text
TypeError: Cannot read properties of undefined (reading 'metros')
    at Nl (index-C0KANSYa.js:23:51689)  →  src/Panel.jsx:8:42
    at ns (index-C0KANSYa.js:22:49195)  →  react-dom-client.production.js:4645
    at Kc (index-C0KANSYa.js:22:71863)  →  react-dom-client.production.js:6799 (renderWithHooks)
    … 13 marcos más, de React y del SDK

La pila de componentes (el error «React ErrorBoundary»):
    at Nl (index-C0KANSYa.js:23:51453)  →  src/Panel.jsx:3:31
    at jl (index-C0KANSYa.js:23:50916)  →  src/LimiteDeError.jsx:3:1
    at main (<anonymous>)
    at Il (index-C0KANSYa.js:23:52487)  →  src/App.jsx:8:31
```

En ese proyecto, `ParteDelMar` vive en `src/Panel.jsx`: la línea 8, columna 42, es exactamente el `metros` de `{parte.visibilidad.metros}`, y la línea 3, `export function ParteDelMar`. La pila de componentes se traduce igual: `Nl` es `ParteDelMar`, `jl` es tu `LimiteDeError` e `Il`, `App`. Solo `main` conserva su nombre, porque las etiquetas HTML no se minifican (lección 64).

La opción `build.sourcemap` de Vite admite cuatro valores:

- `false`, el valor por defecto: no hay `.map`.
- `true`: un `.map` junto a cada archivo y, al final del JavaScript, un comentario que dice dónde está (`//# sourceMappingURL=index-….js.map`). Las herramientas del navegador lo leen solas.
- `'inline'`: el mapa va dentro del propio JavaScript.
- `'hidden'`: como `true`, pero sin el comentario. El navegador no los busca, y el `.map` sigue en `dist/`.

**Un `.map` publicado es tu código fuente publicado**, con sus comentarios. En la build de prueba, el `.map` llevaba el texto completo de 150 archivos: los cinco de `src/` y los de las librerías.

### Subirlos sin publicarlos

La salida es generarlos, entregárselos al servicio de errores y borrarlos antes de publicar. Sentry tiene un plugin de Vite que hace las tres cosas al construir:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// vite.config.js\nimport { sentryVitePlugin } from '@sentry/vite-plugin'\nimport react from '@vitejs/plugin-react'\nimport { defineConfig } from 'vite'\n\nexport default defineConfig({\n  build: { sourcemap: 'hidden' },\n  plugins: [\n    react(),\n    sentryVitePlugin({\n      org: 'posidonia',\n      project: 'panel',\n      authToken: process.env.SENTRY_AUTH_TOKEN,\n      telemetry: false,\n      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },\n    }),\n  ],\n})",
  "anotaciones": [
    {
      "fragmento": "build: { sourcemap: 'hidden' }",
      "nota": "Genera los .map sin el comentario que dice dónde están: el navegador no los pide. Siguen estando en dist/, así que no basta con esto."
    },
    {
      "fragmento": "sentryVitePlugin({",
      "nota": "El plugin de Sentry para Vite (npm install -D @sentry/vite-plugin, también la 11.9.0). Va el último de la lista, como pide su documentación. Solo actúa al construir: con npm run dev no sube nada."
    },
    {
      "fragmento": "org: 'posidonia',",
      "nota": "La organización y el proyecto de tu cuenta de Sentry, con los nombres cortos que aparecen en sus direcciones."
    },
    {
      "fragmento": "authToken: process.env.SENTRY_AUTH_TOKEN,",
      "nota": "Un token que permite subir archivos a tu cuenta: este sí es un secreto. Va en una variable de la máquina que construye (el CI, el panel del alojamiento), nunca con prefijo VITE_ ni en git. vite.config.js se ejecuta en Node, por eso es process.env."
    },
    {
      "fragmento": "telemetry: false,",
      "nota": "Por defecto, el plugin envía a Sentry datos sobre la propia build (lo avisa en la consola al construir). Con false, no envía nada de eso."
    },
    {
      "fragmento": "filesToDeleteAfterUpload: ['./dist/**/*.map']",
      "nota": "Después de subirlos, borra los .map de dist/: lo que publicas ya no lleva tu código fuente. Comprobado: los borra incluso cuando no ha podido subirlos."
    }
  ]
}
```

Sin token, así fue la build de prueba:

```text
$ npm run build
…
rendering chunks...
[sentry-vite-plugin] Warning: No auth token provided. Will not upload source maps. Please set the `authToken` option. You can find information on how to generate a Sentry auth token here: https://docs.sentry.io/api/auth/
computing gzip size...
dist/index.html                   0.62 kB │ gzip:   0.38 kB
dist/assets/index-qdx_qTh8.css    0.10 kB │ gzip:   0.11 kB
dist/assets/index-Cytt3Q1x.js   313.39 kB │ gzip: 100.56 kB │ map: 2,058.71 kB
```

Es decir: no hay token, así que no sube los source maps (y explica dónde se genera uno). La build no falla. Aun sin subir nada, el plugin hizo dos cosas: borró el `.map` de `dist/assets/`, donde solo quedaron el JavaScript y el CSS, y añadió al principio del JavaScript un fragmento que registra un **debug ID**, `611e7d04-2a65-49eb-985d-1fd19ba0cc77`. Ese identificador viaja en cada evento y, según la documentación de Sentry, es lo que le permite encontrar el `.map` de ese archivo exacto entre todos los que has subido. La subida y la traducción en los servidores de Sentry no las pudimos probar sin cuenta; la traducción en sí es la de arriba.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Con sourcemap hidden, mi código fuente ya no es público",
      "realidad": "hidden solo quita el comentario que apunta al .map. Si el archivo está en dist/ y lo publicas, se descarga con su nombre: lo comprobamos con vite preview, y la petición del .map respondió 200 con el mapa entero. Hay que borrarlo antes de publicar."
    },
    {
      "mito": "El DSN de Sentry es una clave secreta",
      "realidad": "Es público a propósito: solo permite enviar eventos a tu proyecto, no leerlos. El secreto es el token que sube los source maps, y ese nunca va en el código del navegador."
    },
    {
      "mito": "Con Sentry ya no necesito error boundaries",
      "realidad": "Sentry te cuenta qué ha fallado; el boundary decide qué ve el usuario mientras tanto. Son dos trabajos distintos y se usan juntos."
    }
  ]
}
```

### Lo que no debe viajar: datos personales

Un evento es una foto del navegador de alguien en el momento del fallo, y puede llevar datos personales sin que te des cuenta. Lo probamos con un formulario de reserva (nombre y correo) escrito con descuidos típicos: un `console.log` con los datos, el correo en la URL, `Sentry.setUser({ email: correo })` y un error con el correo en el mensaje. Con la configuración de arriba, el evento llevaba el correo de la clienta en cinco sitios, y algo más:

- en el mensaje: `No se pudo guardar la reserva de lucia.ferrer@correo.example`;
- en `user.email`, por el `setUser`;
- en `request.url` y en la miga de navegación, por el `?reserva=lucia.ferrer%40correo.example` de la URL;
- en una miga de la consola, junto al nombre completo: el SDK guarda cada `console.log` como *breadcrumb*, las «migas» de lo que pasó antes del error;
- y `"infer_ip": "auto"`: desde la versión 11, el SDK deja por defecto que Sentry deduzca y guarde la dirección IP de quien visita la web.

Una dirección IP y un correo son datos personales según el RGPD, y en un centro de buceo los hay peores: la declaración médica de cada buceador no debe acercarse a un error. **Lo primero es no ponerlos donde no hacen falta**: un mensaje de error no necesita el correo, le basta el número de reserva. Lo segundo, que el SDK filtre lo que se escape:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// src/instrument.js\nimport * as Sentry from '@sentry/react'\n\nconst CORREO = /[\\w.+-]+@[\\w-]+\\.[\\w.-]+/g\n\nif (import.meta.env.PROD) {\n  Sentry.init({\n    dsn: import.meta.env.VITE_SENTRY_DSN,\n    environment: import.meta.env.MODE,\n    dataCollection: { userInfo: false, urlQueryParams: false },\n    beforeBreadcrumb(miga) {\n      return miga.category === 'console' ? null : miga\n    },\n    beforeSend(evento) {\n      for (const excepcion of evento.exception?.values ?? []) {\n        excepcion.value = excepcion.value?.replace(CORREO, '[correo]')\n      }\n      return evento\n    },\n  })\n}",
  "anotaciones": [
    {
      "fragmento": "userInfo: false",
      "nota": "Que Sentry no deduzca la IP ni rellene datos del usuario por su cuenta. Comprobado: el evento pasa de infer_ip auto a never."
    },
    {
      "fragmento": "urlQueryParams: false",
      "nota": "Las direcciones llegan sin lo que va detrás del signo de interrogación: el ?reserva=… desaparece de la página del evento y de las migas de navegación."
    },
    {
      "fragmento": "return miga.category === 'console' ? null : miga",
      "nota": "beforeBreadcrumb decide qué migas se guardan; devolver null descarta una. Aquí, todas las de la consola. Las de clics, que solo guardan el selector del botón, se quedan."
    },
    {
      "fragmento": "beforeSend(evento) {",
      "nota": "La última aduana: recibe el evento ya montado, y lo que devuelvas es lo que se envía (si devuelves null, nada). Comprobado: el mensaje llega como «No se pudo guardar la reserva de [correo]»."
    },
    {
      "fragmento": "const CORREO = /[\\w.+-]+@[\\w-]+\\.[\\w.-]+/g",
      "nota": "Una expresión sencilla para correos. Un filtro así es una red de seguridad, no la solución: lo seguro es no poner el dato."
    }
  ]
}
```

Lo único que esta configuración no tapó fue `user.email`: **lo que pasas a `Sentry.setUser` se envía siempre**, tal cual (lo dice su documentación y lo comprobamos). Para saber a cuántas personas afecta un fallo basta con un identificador interno: `Sentry.setUser({ id: socio.id })`.

Y fuera del código: un servicio así trata datos de tus usuarios por encargo tuyo, así que tiene que figurar en tu política de privacidad. Sentry puede guardarlos en la Unión Europea (en Fráncfort), pero esa región se elige al crear la organización y después no se puede cambiar. También permite filtrar en su servidor, por si algo se escapa del navegador.

### Otros servicios

Sentry no es el único. **GlitchTip** es de código abierto y acepta los SDK de Sentry (el mismo `@sentry/react`, con su DSN), y Sentry también se puede instalar en tus propios servidores. Con SDK propio están **BugSnag**, **Rollbar**, **Datadog** o **PostHog**, que además de analítica registra errores. La forma de conectarlos es siempre la misma: las opciones de errores de `createRoot`, los source maps entregados y no publicados, y cuidado con lo que se envía.

## El linter: `error-boundaries`

Hay una tentación muy natural cuando sabes JavaScript: si algo puede fallar, `try`/`catch`. ¿Por qué no así?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function PanelSeguro({ parte }) {\n  try {\n    return <ParteDelMar parte={parte} />\n  } catch {\n    return <p role=\"alert\">No se pudo mostrar el parte.</p>\n  }\n}\n\n// <PanelSeguro parte={partes['los-farallones']} />\n// ParteDelMar lanza un error al leer parte.visibilidad.metros.\n// ¿Qué se ve?",
  "opciones": [
    "El aviso «No se pudo mostrar el parte.»",
    "La app entera desaparece",
    "El parte, sin la línea de la visibilidad"
  ],
  "correcta": 1,
  "explicacion": "El try no envuelve la ejecución de ParteDelMar. <ParteDelMar parte={parte} /> solo crea una descripción, un objeto (lección 7); React llama a ParteDelMar más tarde, cuando PanelSeguro ya ha devuelto ese objeto y su try ha terminado. El error salta fuera del try, nadie lo captura, y la app desaparece. Comprobado con React 19.3.1."
}
```

Este fallo es tan habitual que `eslint-plugin-react-hooks` (7.1.1) tiene una regla para él, `error-boundaries`, activada como error en su configuración recomendada. Sobre `PanelSeguro` dice:

```text
Error: Avoid constructing JSX within try/catch

React does not immediately render components when JSX is rendered, so any errors from this component will not be caught by the try/catch. To catch errors in rendering a given component, wrap that component in an error boundary. (https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary).
```

Es decir: evita construir JSX dentro de un `try`/`catch`. React no renderiza un componente en el momento en que escribes su JSX, así que sus errores no pasarán por ese `try`/`catch`. Para capturar los errores al renderizar un componente, envuélvelo en un error boundary.

Lo comprobamos instalando el plugin en un proyecto aparte, como en las lecciones 39 y 44. Tres matices de esa prueba:

- **Un `try`/`catch` sin JSX dentro es correcto** y la regla no dice nada: `JSON.parse` de un texto que puede venir mal, o el `try`/`catch` de un manejador de eventos, son JavaScript de toda la vida.
- **`use` dentro de un `try`/`catch` lo marca otra regla**, `rules-of-hooks`, con «React Hook "use" cannot be called in a try/catch block». La viste en la lección 44: los errores de `use` también van a un boundary.
- La regla vive en `eslint-plugin-react-hooks`: con la plantilla de Vite solo la tienes si eliges ESLint, porque por defecto trae Oxlint (lección 2). El texto de arriba es el de ESLint.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un boundary de último recurso",
      "texto": "Alrededor de toda la app, con un aviso simple y un enlace para volver a empezar. Mejor que una página en blanco, y junto a onUncaughtError en createRoot para enterarte de lo que se escapa."
    },
    {
      "titulo": "Uno por zona independiente",
      "texto": "Cada panel de un tablero, cada columna, la barra lateral, el contenido de una ruta: zonas que pueden fallar sin que el resto deje de servir."
    },
    {
      "titulo": "Junto a cada Suspense que pide datos",
      "texto": "Suspense para la espera, un boundary para el fallo, con su «Reintentar». Es la pareja de use (lecciones 48, 49 y 52) y la de useSuspenseQuery en TanStack Query."
    },
    {
      "titulo": "Alrededor de lo que no controlas",
      "texto": "Un widget de terceros, un componente que pinta contenido que escriben los usuarios, un editor complejo: si falla, que falle solo."
    }
  ]
}
```

## Errores típicos

**Envolver JSX en un `try`/`catch`.** Lo acabas de ver: el error salta fuera del `try`. Para los errores de render, un boundary; el linter te lo recuerda.

**Esperar que el boundary capture el error de un clic.** No lo hará. Captúralo en el manejador y enseña el aviso junto al botón, o llévalo al render (un estado que lanzas, una transición o `showBoundary`).

**Un boundary que no se reinicia.** El aviso se queda puesto aunque el usuario cambie de cala, de pestaña o de ruta. Dale una `key` con lo que identifica el contenido, o usa `resetKeys` en `react-error-boundary`.

**Reintentar sin cambiar nada.** Si el error sale de los datos (el parte sin visibilidad), volver a renderizar falla igual. Un «Reintentar» tiene sentido cuando hace algo nuevo: otra petición, otros datos. Con `use`, eso incluye olvidar la promesa rechazada.

**Efectos en `getDerivedStateFromError`.** Se llama durante el render, varias veces en desarrollo: registrar el error ahí lo registra de más. Los efectos, en `componentDidCatch`. Y lo contrario tampoco: llamar a `setState` en `componentDidCatch` para pintar el aviso es una forma antigua que la documentación da por obsoleta.

**Enseñar al usuario el mensaje técnico.** «Cannot read properties of undefined (reading 'metros')» es para tu registro de errores, no para quien quiere reservar una inmersión. Los ejemplos de esta lección lo enseñan para que veas qué ha pasado; en tu app, un aviso claro y un botón.

**Publicar los source maps.** Con `build.sourcemap` activado y sin borrarlos, `dist/` lleva un `.map` por archivo con todo tu código fuente, comentarios incluidos. Entrégaselos al servicio de errores y bórralos antes de publicar.

**Mandar datos personales con el error.** El correo en el mensaje, un `console.log` con el formulario o `Sentry.setUser({ email })` acaban en el servicio de errores. Usa identificadores internos y filtra en `beforeSend` lo que se escape.

## Ejercicios

**1. Un cortafuegos para el parte del mar.** El panel del principio de la lección, separado en archivos. `LimiteDeError.jsx` está casi vacío: escríbelo y úsalo en `App.jsx` para que un parte roto no tumbe el panel.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un cortafuegos para el parte del mar",
  "consigna": "Escribe LimiteDeError.jsx con getDerivedStateFromError y una prop alternativa (una función que recibe el error). En App.jsx, envuelve solo el parte, con el aviso «No hemos podido leer el parte de esta cala.» en un párrafo con role=\"alert\". Haz que al elegir otra cala el aviso desaparezca.",
  "archivos": [
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\nexport default class LimiteDeError extends Component {\n  // 1. Un estado con el error: null mientras todo va bien.\n  // 2. static getDerivedStateFromError(error): devuelve el estado con el error.\n  // 3. En render, si hay error, pinta this.props.alternativa(error).\n\n  render() {\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { PARTES } from './datos'\nimport LimiteDeError from './LimiteDeError'\nimport { ParteDelMar, SalidasDeHoy } from './Panel'\nimport './estilos.css'\n\nexport default function App() {\n  const [calaId, setCalaId] = useState('cala-azul')\n\n  return (\n    <main>\n      <h1>Centro de Buceo Posidonia</h1>\n      <label>\n        Cala{' '}\n        <select value={calaId} onChange={(e) => setCalaId(e.target.value)}>\n          <option value=\"cala-azul\">Cala Azul</option>\n          <option value=\"el-bajo\">El Bajo de la Morena</option>\n          <option value=\"los-farallones\">Los Farallones</option>\n        </select>\n      </label>\n      {/* Envuelve solo el parte con LimiteDeError */}\n      <ParteDelMar parte={PARTES[calaId]} />\n      <SalidasDeHoy />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Panel.jsx",
      "codigo": "import { SALIDAS } from './datos'\n\nexport function ParteDelMar({ parte }) {\n  return (\n    <section className=\"tarjeta\">\n      <h2>Parte del mar · {parte.cala}</h2>\n      <p>Oleaje: {parte.oleaje}. Agua a {parte.temperatura} °C.</p>\n      <p>Visibilidad: {parte.visibilidad.metros} m</p>\n    </section>\n  )\n}\n\nexport function SalidasDeHoy() {\n  return (\n    <section className=\"tarjeta\">\n      <h2>Salidas de hoy</h2>\n      <ul>\n        {SALIDAS.map((salida) => (\n          <li key={salida.id}>\n            {salida.hora} · {salida.punto} · {salida.plazas} plazas libres\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "// Así llegan los partes del mar. Al de Los Farallones le falta la\n// visibilidad: su sensor no ha enviado datos esta mañana.\nexport const PARTES = {\n  'cala-azul': { cala: 'Cala Azul', oleaje: 'mar llana', temperatura: 22, visibilidad: { metros: 15 } },\n  'el-bajo': { cala: 'El Bajo de la Morena', oleaje: 'marejadilla', temperatura: 21, visibilidad: { metros: 9 } },\n  'los-farallones': { cala: 'Los Farallones', oleaje: 'marejada', temperatura: 20 },\n}\n\nexport const SALIDAS = [\n  { id: 1, hora: '09:30', punto: 'Bajo de la Morena', plazas: 4 },\n  { id: 2, hora: '12:00', punto: 'Cueva del Pulpo', plazas: 2 },\n  { id: 3, hora: '17:00', punto: 'Los Farallones', plazas: 6 },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e5a6e;\n  color: white;\n}\n\n.tarjeta {\n  padding: 0.25rem 1rem;\n  margin: 0.75rem 0;\n  border: 1px solid #a5d8e6;\n  border-radius: 8px;\n  background: #f0f9fc;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  margin: 0.75rem 0;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "LimiteDeError.jsx",
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "Al abrir, se ve el parte de Cala Azul",
      "pasos": [],
      "espera": {
        "texto": "Visibilidad: 15 m"
      }
    },
    {
      "descripcion": "Al elegir Los Farallones, el parte se cambia por el aviso",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Cala",
            "opcion": "Los Farallones"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No hemos podido leer el parte de esta cala."
      }
    },
    {
      "descripcion": "Con el parte roto, las salidas de hoy siguen a la vista",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Cala",
            "opcion": "Los Farallones"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Cueva del Pulpo"
      }
    },
    {
      "descripcion": "Con el parte roto, el selector sigue funcionando",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Cala",
            "opcion": "Los Farallones"
          }
        }
      ],
      "espera": {
        "etiqueta": "Cala",
        "valor": "los-farallones"
      }
    },
    {
      "descripcion": "Al volver a Cala Azul, el parte vuelve a verse",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Cala",
            "opcion": "Los Farallones"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Cala",
            "opcion": "Cala Azul"
          }
        }
      ],
      "espera": {
        "texto": "Visibilidad: 15 m"
      }
    },
    {
      "descripcion": "Al pasar de Los Farallones a El Bajo de la Morena, el aviso desaparece",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Cala",
            "opcion": "Los Farallones"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Cala",
            "opcion": "El Bajo de la Morena"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert"
        }
      }
    }
  ]
}
```

**2. Un «Reintentar» que es del boundary.** Las salidas de hoy y de mañana llegan del servidor con `use` y la caché de promesas de las lecciones 49 y 52. Si la petición falla, el boundary enseña un aviso, pero no hay forma de volver a intentarlo sin cambiar de día. Las comprobaciones hacen fallar la carga a propósito con la API simulada.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un «Reintentar» que es del boundary",
  "consigna": "En LimiteDeError.jsx, escribe el método reintentar: que llame a this.props.onReintentar si existe y después vacíe el error del estado, y pásaselo a la alternativa como segundo argumento. En App.jsx, añade a la alternativa un botón «Reintentar» que lo use, y pasa al boundary un onReintentar que olvide la promesa de las salidas del día elegido. Para probarlo a mano, pulsa «Fallar la siguiente petición» y cambia de día.",
  "archivos": [
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  // Escribe aquí el método reintentar: que avise al padre con\n  // this.props.onReintentar (si lo hay) y después vacíe el error.\n\n  render() {\n    if (this.state.error) {\n      // Pásale reintentar a la alternativa como segundo argumento\n      return this.props.alternativa(this.state.error)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport { olvidar } from './datos'\nimport LimiteDeError from './LimiteDeError'\nimport Salidas from './Salidas'\nimport './estilos.css'\n\nexport default function App() {\n  const [dia, setDia] = useState('hoy')\n\n  return (\n    <main>\n      <h1>Centro de Buceo Posidonia</h1>\n      <label>\n        Salidas de{' '}\n        <select value={dia} onChange={(e) => setDia(e.target.value)}>\n          <option value=\"hoy\">Hoy</option>\n          <option value=\"manana\">Mañana</option>\n        </select>\n      </label>\n      <section className=\"tarjeta\">\n        <LimiteDeError\n          key={dia}\n          alternativa={(error) => (\n            <div role=\"alert\">\n              <p>No se pudieron cargar las salidas: {error.message}</p>\n              {/* Aquí, un botón «Reintentar» */}\n            </div>\n          )}\n        >\n          <Suspense fallback={<p>Cargando las salidas…</p>}>\n            <Salidas dia={dia} />\n          </Suspense>\n        </LimiteDeError>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Salidas.jsx",
      "codigo": "import { use } from 'react'\nimport { leer } from './datos'\n\nexport default function Salidas({ dia }) {\n  const salidas = use(leer(`/api/salidas?q=${dia}`))\n\n  return (\n    <ul>\n      {salidas.map((salida) => (\n        <li key={salida.id}>\n          {salida.hora} · {salida.punto} · {salida.plazas} plazas libres\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "const cache = new Map()\n\nasync function pedirJson(url) {\n  const respuesta = await fetch(url)\n  if (!respuesta.ok) throw new Error(`el servidor respondió ${respuesta.status}`)\n  return respuesta.json()\n}\n\nexport function leer(url) {\n  if (!cache.has(url)) cache.set(url, pedirJson(url))\n  return cache.get(url)\n}\n\nexport function olvidar(url) {\n  cache.delete(url)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0e5a6e;\n  color: white;\n}\n\n.tarjeta {\n  padding: 0.25rem 1rem;\n  margin: 0.75rem 0;\n  border: 1px solid #a5d8e6;\n  border-radius: 8px;\n  background: #f0f9fc;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  margin: 0.75rem 0;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "LimiteDeError.jsx",
  "mostrarConsola": false,
  "api": {
    "salidas": [
      {
        "id": 1,
        "dia": "hoy",
        "hora": "09:30",
        "punto": "Bajo de la Morena",
        "plazas": 4
      },
      {
        "id": 2,
        "dia": "hoy",
        "hora": "12:00",
        "punto": "Cueva del Pulpo",
        "plazas": 2
      },
      {
        "id": 3,
        "dia": "hoy",
        "hora": "17:00",
        "punto": "Los Farallones",
        "plazas": 6
      },
      {
        "id": 4,
        "dia": "manana",
        "hora": "10:00",
        "punto": "Cala Azul (bautismo)",
        "plazas": 8
      },
      {
        "id": 5,
        "dia": "manana",
        "hora": "16:30",
        "punto": "Bajo de la Morena",
        "plazas": 3
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparecen las salidas de hoy",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Cueva del Pulpo"
      }
    },
    {
      "descripcion": "Al elegir «Mañana», aparecen las salidas de mañana",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Salidas de",
            "opcion": "Mañana"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Cala Azul (bautismo)"
      }
    },
    {
      "descripcion": "Si la carga falla, aparece un aviso con un botón «Reintentar»",
      "pasos": [
        {
          "red": "fallar-siguiente"
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Reintentar"
      }
    },
    {
      "descripcion": "Tras un fallo, «Reintentar» vuelve a cargar las salidas",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Los Farallones"
      }
    },
    {
      "descripcion": "Después de reintentar, el aviso desaparece",
      "pasos": [
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert"
        }
      }
    },
    {
      "descripcion": "Si falla la carga de mañana, «Reintentar» pide las de mañana",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Cueva del Pulpo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "seleccionar": {
            "etiqueta": "Salidas de",
            "opcion": "Mañana"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reintentar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Cala Azul (bautismo)"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade a tu `LimiteDeError` del ejercicio 1 un `componentDidCatch` que escriba en la consola `info.componentStack`. Elige Los Farallones y lee la pila de dentro afuera, como en la lección 64.
2. Haz que `alternativa` acepte también un elemento fijo, además de una función, como hacen `fallback` y `fallbackRender` en `react-error-boundary`. Pista: `typeof this.props.alternativa === 'function'`. Después, en el ejercicio 2, añade un `onError` que haga de `componentDidCatch` configurable desde fuera.
3. En el bloque de los seis casos, haz que el error de «Reservar plaza» acabe en el boundary sin librerías: captúralo en el manejador, guárdalo en un estado y lánzalo al renderizar con `if (error) throw error`.
4. En el panel del ejercicio 1, pon un boundary alrededor de cada salida y haz que una tenga los datos rotos. ¿Se entiende mejor la pantalla que con un solo boundary para toda la lista? Compáralo con el ejemplo de los avatares de react.dev.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Catching rendering errors with an Error Boundary",
      "descripcion": "La referencia: getDerivedStateFromError, componentDidCatch, qué no captura un boundary y cómo decidir dónde ponerlos.",
      "url": "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "createRoot: Error logging in production",
      "descripcion": "onCaughtError, onUncaughtError y onRecoverableError, con un ejemplo de registro de errores para producción.",
      "url": "https://react.dev/reference/react-dom/client/createRoot#error-logging-in-production",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "error-boundaries",
      "descripcion": "La regla del linter de React: por qué un try/catch no captura los errores de render y qué hacer con use.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/error-boundaries",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "use: Displaying an error with an Error Boundary",
      "descripcion": "Una promesa rechazada en un boundary con un botón para reintentar, guardando la promesa en el estado y con startTransition.",
      "url": "https://react.dev/reference/react/use#displaying-an-error-with-an-error-boundary",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useTransition: Displaying an error to users with an error boundary",
      "descripcion": "Por qué los errores de una acción dentro de una transición sí llegan al boundary.",
      "url": "https://react.dev/reference/react/useTransition#displaying-an-error-to-users-with-error-boundary",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "react-error-boundary",
      "descripcion": "El paquete que trae hecho un error boundary configurable: FallbackComponent, resetKeys, onReset y useErrorBoundary.",
      "url": "https://github.com/bvaughn/react-error-boundary",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Sentry for React",
      "descripcion": "Instalar @sentry/react, conectar las opciones de errores de createRoot con reactErrorHandler, Sentry.ErrorBoundary y la subida de source maps.",
      "url": "https://docs.sentry.io/platforms/javascript/guides/react/",
      "etiqueta": "Sentry"
    }
  ]
}
```
