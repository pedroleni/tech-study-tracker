# Quizá no necesitas un efecto

- **Módulo:** Efectos
- **Slug:** `quiza-no-necesitas-un-efecto` (autogenerado del título)
- **Orden:** 390
- **Fuentes:** [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) + [set-state-in-effect](https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect) — ver `contenido/react/TEMARIO.md` #39

---

## Qué es y para qué sirve

En la lección 38 viste para qué sirve un efecto: **salir de React** y sincronizar un componente con algo de fuera, como un widget, un temporizador o el servidor. Es una vía de escape, y como toda vía de escape, se abusa de ella. Mucho código de React que encontrarás (y mucho que escribirás al principio) usa efectos para cosas que no hablan con nada de fuera: calcular un total, vaciar un formulario, avisar al padre, enviar un pedido.

Esos efectos no rompen la app a la primera. Funcionan, más o menos. Pero cada uno tiene un coste:

- **Un render de más.** React renderiza con el valor viejo, actualiza el DOM, ejecuta el efecto, el efecto cambia el estado… y vuelta a empezar. Lo verás en el árbol de renders y en el registro de efectos.
- **Código más largo y frágil.** Un estado que hay que mantener al día a mano, y una lógica que se dispara por razones que nadie recuerda.
- **Fallos difíciles de rastrear.** Avisos que salen al recargar la página, cadenas de efectos que se disparan unos a otros, datos que suben del hijo al padre por caminos ocultos.

La pregunta que decide dónde va cada trozo de código es siempre la misma: **¿por qué tiene que ejecutarse?**

```laboratorio
{
  "tipo": "roles",
  "titulo": "¿Por qué se ejecuta este código?",
  "roles": [
    {
      "etiqueta": "Se calcula",
      "rol": "Durante el render",
      "descripcion": "Sale de las props y del estado que ya tienes: un total, una lista filtrada, si la partida ha terminado. No es estado ni necesita un efecto."
    },
    {
      "etiqueta": "Pasa porque alguien actuó",
      "rol": "En el manejador",
      "descripcion": "Un clic, un envío, una tecla: comprar, inscribirse, avisar de que algo se añadió. El manejador sabe exactamente qué ha pasado."
    },
    {
      "etiqueta": "Pasa porque se ve",
      "rol": "En un efecto",
      "descripcion": "El componente está en pantalla y tiene que estar de acuerdo con algo de fuera: una conexión, un widget, los datos del servidor."
    }
  ]
}
```

Esta lección recorre los casos más habituales de efectos que sobran, cada uno con su alternativa. Varios ya los conoces desde otro ángulo: la lección 24 te enseñó a no guardar en el estado lo que se puede calcular, la 25 a levantar el estado y la 26 a reiniciar un componente con una `key`. Aquí verás **por qué un efecto tampoco es la respuesta** en esos casos, y lo que cuesta.

## Lo que se puede calcular, se calcula durante el render

En el piso de la calle Laurel se reparten los gastos del mes. `Resumen` recibe la lista de gastos y enseña el total. La primera versión guarda el total en un estado y lo mantiene al día con un efecto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un total que llega siempre un render tarde",
  "consigna": "Pulsa «Añadir la compra» y mira el árbol: cada clic produce dos commits. En el primero, App y Resumen se renderizan con la compra ya en la lista y el total viejo; el efecto lo corrige y Resumen vuelve a renderizarse. Cambia Resumen.jsx para calcular el total durante el render, sin estado ni efecto, y repite: un solo commit por clic.",
  "archivos": [
    {
      "nombre": "Resumen.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Resumen({ gastos }) {\n  // 🔴 Un estado que solo copia un cálculo, y un efecto para mantenerlo al día\n  const [total, setTotal] = useState(0)\n\n  useEffect(() => {\n    setTotal(gastos.reduce((suma, gasto) => suma + gasto.importe, 0))\n  }, [gastos])\n\n  return <p className=\"total\">Total del mes: {total} €</p>\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Resumen from './Resumen'\nimport './estilos.css'\n\nconst GASTOS_INICIALES = [\n  { id: 1, concepto: 'Luz de septiembre', importe: 64 },\n  { id: 2, concepto: 'Internet', importe: 30 },\n]\n\nexport default function App() {\n  const [gastos, setGastos] = useState(GASTOS_INICIALES)\n\n  function anadirCompra() {\n    const compra = { id: gastos.length + 1, concepto: 'Compra común', importe: 41 }\n    setGastos([...gastos, compra])\n  }\n\n  return (\n    <main>\n      <h1>Gastos del piso · calle Laurel, 7</h1>\n      <ul>\n        {gastos.map((gasto) => (\n          <li key={gasto.id}>\n            {gasto.concepto}: {gasto.importe} €\n          </li>\n        ))}\n      </ul>\n      <button onClick={anadirCompra}>Añadir la compra</button>\n      <Resumen gastos={gastos} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ntextarea {\n  display: block;\n  width: 100%;\n  min-height: 3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #14532d;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: 700;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "Resumen.jsx",
  "mostrarConsola": false,
  "mostrarArbol": true,
  "mostrarEfectos": true
}
```

Con el efecto, el árbol cuenta la historia completa. **Al cargar**, el primer commit monta `App` y `Resumen` con el total a `0 €`, y el segundo vuelve a renderizar `Resumen` («cambió su estado») con los `94 €` buenos. Ese `0 €` puede llegar a verse: cuando no hay un clic de por medio, React suele dejar que el navegador pinte antes de ejecutar los efectos. **Al pulsar**, otro par de commits: uno en el que `App` y `Resumen` se renderizan con la compra ya en la lista y el total viejo, y otro solo para corregir el total. El registro de efectos marca el motivo entre los dos: «Resumen ▶ efecto · cambió gastos», con el array viejo y el nuevo (recortados).

El arreglo es borrar código:

```jsx
export default function Resumen({ gastos }) {
  const total = gastos.reduce((suma, gasto) => suma + gasto.importe, 0)

  return <p className="total">Total del mes: {total} €</p>
}
```

**Si algo se puede calcular a partir de las props o del estado, no lo guardes en el estado ni lo sincronices con un efecto: calcúlalo durante el render.** El código se vuelve a ejecutar solo cada vez que cambian `gastos`, porque el componente se vuelve a renderizar. Es más rápido (un render en vez de dos), más corto y no puede desincronizarse.

### ¿Y si el cálculo es caro?

Sumar unos cuantos gastos no cuesta nada. Si el cálculo recorriera miles de elementos y el componente se renderizara a menudo por otros motivos, la respuesta tampoco sería un efecto, sino **memorizar** el resultado con `useMemo`:

```jsx
const total = useMemo(
  () => gastos.reduce((suma, gasto) => suma + gasto.importe, 0),
  [gastos],
)
```

`useMemo` también se ejecuta durante el render, y solo vuelve a calcular cuando cambia alguna de sus dependencias. Cómo saber si un cálculo es caro (con `console.time`, a partir de 1 ms, más o menos) ya lo viste en la lección 24; `useMemo` a fondo es la lección 67, y el React Compiler, que memoriza por ti, la 68.

## Reiniciar todo el estado al cambiar una prop: una `key`

En la autoescuela La Rotonda, el profesor lleva una ficha por cada clase práctica: unas notas y las maniobras que han practicado. Al cambiar de alumna, la ficha tiene que empezar vacía. La tentación es vaciarla con un efecto que vigile la alumna:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function FichaClase({ alumna }) {\n  const [notas, setNotas] = useState('')\n\n  useEffect(() => {\n    setNotas('')\n  }, [alumna.id])\n\n  return (\n    <section>\n      <h2>Clase con {alumna.nombre}</h2>\n      <label>\n        Notas de la clase\n        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />\n      </label>\n      {/* Maniobras guarda en su estado las casillas marcadas */}\n      <Maniobras />\n    </section>\n  )\n}\n\n// Con Inés, escribes una nota y marcas «Aparcar en línea».\n// Después eliges a Marta. ¿Qué se ha vaciado?",
  "opciones": [
    "Las notas y las maniobras",
    "Solo las notas: «Aparcar en línea» sigue marcada",
    "Nada: el efecto llega tarde y no vacía nada",
    "Solo las maniobras"
  ],
  "correcta": 1,
  "explicacion": "El efecto solo vacía el estado que toca, notas. Maniobras es un hijo: mismo componente en la misma posición, así que React conserva su estado (lección 26). E incluso las notas llegan tarde: hay un render entero de la ficha de Marta con las notas de Inés antes de que el efecto las borre."
}
```

Para que la ficha de cada alumna empiece de cero **entera**, hijos incluidos, no hace falta vigilar nada: basta decirle a React que la ficha de Marta es **otro componente** que la de Inés. Eso es una `key`, como viste en la lección 26:

```jsx
<FichaClase key={alumna.id} alumna={alumna} />
```

Cuando la `key` cambia, React desmonta la ficha de Inés con todo lo que tiene debajo y monta la de Marta desde cero. Sin efecto, sin render de más y sin olvidarse de ningún estado anidado. Lo harás en el primer ejercicio.

Si no quieres que quien use `FichaClase` tenga que acordarse de la `key`, el componente puede ponérsela a sí mismo: exporta un envoltorio que pinte `<Ficha key={alumna.id} alumna={alumna} />`, y deja la ficha de verdad dentro, sin exportar.

## Ajustar parte del estado al cambiar una prop

A veces no quieres reiniciarlo todo, sino una parte. En la web de Autobuses del Moncayo, `Salidas` recibe las salidas de la línea elegida y guarda cuál has seleccionado. Al cambiar de línea, la selección vieja ya no tiene sentido. Con un efecto (`useEffect(() => setElegida(null), [salidas])`) pasaría lo de siempre: un render entero, hijos incluidos, con una salida que ya no está en la lista. Hay una forma de hacerlo **durante el render**:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function Salidas({ salidas }) {\n  const [elegida, setElegida] = useState(null)\n\n  // Mejor que un efecto: ajustar el estado durante el render\n  const [salidasPrevias, setSalidasPrevias] = useState(salidas)\n  if (salidas !== salidasPrevias) {\n    setSalidasPrevias(salidas)\n    setElegida(null)\n  }\n\n  return (\n    <div>\n      {salidas.map((salida) => (\n        <button key={salida.id} onClick={() => setElegida(salida)}>\n          {salida.hora}\n        </button>\n      ))}\n      <p>Elegida: {elegida ? elegida.hora : 'ninguna'}</p>\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "useState(salidas)",
      "nota": "Guarda las salidas del render anterior. Es una copia a propósito: no se pinta, solo sirve para darse cuenta de que la prop ha cambiado."
    },
    {
      "fragmento": "if (salidas !== salidasPrevias)",
      "nota": "La condición es imprescindible. Sin ella, cada render cambiaría el estado y provocaría otro, y React cortaría el bucle con «Too many re-renders»."
    },
    {
      "fragmento": "setElegida(null)",
      "nota": "Un set durante el render: React descarta el JSX que iba a devolver y vuelve a llamar a Salidas en el acto, antes de renderizar los hijos y de tocar el DOM. Nadie llega a ver la salida vieja. Solo vale con el estado del propio componente: cambiar el de otro durante el render es un aviso de React."
    }
  ]
}
```

Funciona, y el cambio de línea cuesta **un solo commit**, no dos. Pero es difícil de leer, y la documentación de React lo deja claro: la mayoría de componentes no deberían necesitarlo. Antes, pregúntate si puedes reiniciar con una `key` o **calcularlo todo durante el render**. Aquí se puede, con el consejo de la lección 24: guarda **el id**, no una copia del objeto, y busca la salida en cada render:

```jsx
const [elegidaId, setElegidaId] = useState(null)
const elegida = salidas.find((salida) => salida.id === elegidaId) ?? null
```

Si la salida elegida sigue en la lista nueva, sigue elegida; si no, `elegida` sale `null` sola. No hay nada que ajustar.

## El linter lo marca: `set-state-in-effect`

Los tres casos que has visto (el total, las notas y la selección) tienen la misma forma: un efecto que **llama a un `set` nada más empezar**, sin esperar a nada de fuera. El plugin oficial de React para ESLint, `eslint-plugin-react-hooks` (versión 7.1.1), tiene una regla para eso, `set-state-in-effect`, activada como error en su configuración recomendada. Sobre el `Resumen` del piso dice esto:

```text
Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

   6 |
   7 |   useEffect(() => {
>  8 |     setTotal(gastos.reduce((suma, gasto) => suma + gasto.importe, 0))
     |     ^^^^^^^^ Avoid calling setState() directly within an effect
   9 |   }, [gastos])
  10 |
  11 |   return <p className="total">Total del mes: {total} €</p>  react-hooks/set-state-in-effect
```

Es decir: llamar a `setState` de forma síncrona dentro de un efecto puede provocar renders en cascada. Los efectos están para sincronizar React con sistemas externos, y su cuerpo debería hacer una de estas dos cosas, o las dos: **actualizar el sistema externo** con el estado de React, o **suscribirse** a ese sistema y llamar a `setState` desde un *callback* cuando cambie. Llamar a `setState` directamente en el cuerpo del efecto provoca renders en cascada que pueden perjudicar el rendimiento, y no se recomienda.

Fíjate en lo que **no** marca: un `set` dentro de un *callback*. El `.then` de un `fetch`, un escuchador de eventos o un temporizador llaman a `set` cuando algo de fuera responde, y eso es justo sincronizar. Por eso la ficha de pista de la lección 38 no ponía un estado `cargando` a `true` al empezar el efecto (la regla lo marca, y su página de react.dev lo pone de ejemplo), sino que deducía la carga de la respuesta guardada.

Tampoco lo marca todo: el `Interruptor` del gimnasio, más abajo, avisa al padre desde un efecto con `onCambiar(activo)`, que no es un `set` de ese componente, y la regla no dice nada aunque cueste el mismo render de más. El linter ayuda; la pregunta de por qué se ejecuta el código la tienes que hacer tú.

La regla vive en `eslint-plugin-react-hooks`, no en el editor de estas lecciones. Si creaste tu proyecto con Vite y elegiste Oxlint (la opción por defecto, lección 2), Oxlint tiene su propia versión de esta regla, `react/set-state-in-effect`, y con la configuración de partida de la plantilla ya sale como aviso (comprobado con Oxlint 1.89). Las reglas del linter de React, una por una, son la lección 70.

## La lógica de un evento va en su manejador

La Quesería El Zurrón vende por internet. La cesta se guarda en el servidor, así que si cierras la pestaña y vuelves mañana, sigue ahí. La ficha de cada queso quiere enseñar un aviso cuando lo añades, y alguien lo ha escrito así:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function FichaQueso({ queso, enCesta, onAnadir }) {\n  const [aviso, setAviso] = useState('')\n\n  useEffect(() => {\n    if (enCesta) setAviso(`${queso.nombre}: añadido a tu cesta`)\n  }, [enCesta, queso.nombre])\n\n  return (\n    <article>\n      <h2>{queso.nombre}</h2>\n      <button onClick={() => onAnadir(queso)}>Añadir a la cesta</button>\n      <p role=\"status\">{aviso}</p>\n    </article>\n  )\n}\n\n// Ayer añadiste el Idiazabal a la cesta. Hoy abres su ficha\n// sin pulsar nada. ¿Qué ves?",
  "opciones": [
    "La ficha, sin aviso",
    "La ficha con «Idiazabal: añadido a tu cesta»",
    "Un error, porque enCesta empieza siendo true"
  ],
  "correcta": 1,
  "explicacion": "El efecto no sabe por qué enCesta es true: solo sabe que lo es. Y lo es desde que se carga la página, porque la cesta viene del servidor. El aviso sale cada vez que abres la ficha de un queso que ya estaba en la cesta, aunque no hayas pulsado nada."
}
```

El aviso tiene que salir **porque alguien ha pulsado «Añadir a la cesta»**, no porque se vea la ficha. Cuando el efecto se ejecuta, ya no sabe qué ha pasado; el manejador del botón sí. Hazte siempre la misma pregunta: **¿este código se ejecuta porque el componente se ha mostrado, o porque el usuario ha hecho algo?** Si es lo segundo, va en el manejador.

Si dos botones comparten esa lógica (por ejemplo, «Añadir a la cesta» y «Comprar ya»), no la subas a un efecto para no repetirla: sácala a una función y llámala desde los dos manejadores.

```jsx
async function anadirALaCesta() {
  const res = await fetch('/api/cesta', { method: 'POST', /* … */ })
  if (res.ok) setAviso(`${queso.nombre}: añadido a tu cesta`)
}

function manejarAnadir() {
  anadirALaCesta()
}

async function manejarComprarYa() {
  await anadirALaCesta()
  irAlPago()
}
```

Lo arreglarás en el segundo ejercicio, con la cesta de verdad.

## Las peticiones POST: ¿por qué se envían?

El Coro Voces del Ebro abre audiciones con un formulario. La página manda dos tipos de `POST`: uno a `/api/visitas` para contar cuánta gente ve el formulario, y otro a `/api/audiciones` cuando alguien se apunta. Aplica la misma pregunta a cada uno.

La visita se envía **porque el formulario se ha mostrado**: es un efecto. La inscripción se envía **porque alguien ha pulsado «Apuntarme»**: va en el manejador del envío. Abre el panel de red debajo de la vista previa y apúntate:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Una visita en un efecto, una inscripción en el manejador",
  "codigo": "import { useEffect, useState } from 'react'\n\nexport default function App() {\n  const [nombre, setNombre] = useState('')\n  const [cuerda, setCuerda] = useState('soprano')\n  const [envio, setEnvio] = useState('pendiente')\n\n  // ✅ Se envía porque se ha mostrado el formulario\n  useEffect(() => {\n    fetch('/api/visitas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ pagina: 'audiciones' }),\n    })\n  }, [])\n\n  // ✅ Se envía porque alguien ha pulsado «Apuntarme»\n  async function manejarEnvio(evento) {\n    evento.preventDefault()\n    setEnvio('enviando')\n    const res = await fetch('/api/audiciones', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ nombre, cuerda }),\n    })\n    setEnvio(res.ok ? 'hecho' : 'error')\n  }\n\n  return (\n    <main>\n      <h1>Audiciones del Coro Voces del Ebro</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nombre{' '}\n          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />\n        </label>\n        <label>\n          Cuerda{' '}\n          <select value={cuerda} onChange={(e) => setCuerda(e.target.value)}>\n            <option value=\"soprano\">Soprano</option>\n            <option value=\"contralto\">Contralto</option>\n            <option value=\"tenor\">Tenor</option>\n            <option value=\"bajo\">Bajo</option>\n          </select>\n        </label>\n        <button disabled={envio === 'enviando'}>Apuntarme</button>\n      </form>\n      <p role=\"status\">\n        {envio === 'enviando' && 'Enviando…'}\n        {envio === 'hecho' && `Apuntado: ${nombre}, ${cuerda}. ¡Nos vemos el jueves!`}\n      </p>\n      {envio === 'error' && <p role=\"alert\">No se pudo enviar. Inténtalo de nuevo.</p>}\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ntextarea {\n  display: block;\n  width: 100%;\n  min-height: 3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #14532d;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: 700;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}",
  "anotaciones": [
    {
      "fragmento": "body: JSON.stringify({ pagina: 'audiciones' }),",
      "nota": "Contar visitas es sincronizar con un sistema externo (el servidor de estadísticas) porque la página se ve. En desarrollo verás dos POST /api/visitas en el panel de red: es el ensayo de StrictMode, y react.dev recomienda dejarlo así. En producción sale uno."
    },
    {
      "fragmento": "async function manejarEnvio(evento)",
      "nota": "La inscripción pasa en un momento concreto, el del envío, y solo entonces. El manejador sabe qué se ha pulsado y con qué datos, y puede esperar la respuesta para enseñar el resultado."
    },
    {
      "fragmento": "setEnvio(res.ok ? 'hecho' : 'error')",
      "nota": "El set va después de un await: cuando llega la respuesta del servidor. Pulsa «Fallar la siguiente petición» antes de apuntarte para ver el aviso de error."
    },
    {
      "fragmento": "disabled={envio === 'enviando'}",
      "nota": "Mientras se envía, el botón se desactiva para que nadie se apunte dos veces con dos clics rápidos. En el módulo 8 verás cómo lo resuelven las Actions de React."
    }
  ],
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "visitas": [
      {
        "id": 1,
        "pagina": "portada"
      }
    ],
    "audiciones": [
      {
        "id": 1,
        "nombre": "Pilar",
        "cuerda": "contralto"
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

La versión con efecto que a veces se ve guarda los datos en un estado y deja que un efecto los envíe:

```jsx
// 🔴 Así no: la lógica del envío, escondida en un efecto
const [paraEnviar, setParaEnviar] = useState(null)

useEffect(() => {
  if (paraEnviar !== null) {
    fetch('/api/audiciones', { method: 'POST', body: JSON.stringify(paraEnviar) })
  }
}, [paraEnviar])

function manejarEnvio(evento) {
  evento.preventDefault()
  setParaEnviar({ nombre, cuerda })
}
```

Hace lo mismo, con un estado, un efecto y un render de más, y con la lógica separada del momento en que ocurre. Y es frágil: si el día de mañana ese estado se levanta al padre o se conserva al cambiar de pantalla, el efecto puede volver a enviar una inscripción que nadie ha pedido. El caso extremo es el de la lección 38: un efecto con `[]` que compra al mostrarse compra dos veces en desarrollo y otra más cada vez que alguien vuelve a la página.

## Cadenas de efectos

En el concurso de geografía Vuelta al mapa, tres aciertos seguidos suben de nivel, y al pasar del nivel 3 se termina la partida. Alguien lo ha montado con un efecto por regla, cada uno pendiente del estado que cambia el anterior:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un acierto, tres commits",
  "consigna": "Pulsa «Respuesta correcta» tres veces y fíjate en el tercer clic. En el registro de efectos, cada efecto cambia un estado que dispara el siguiente: «cambió ultima», después «cambió racha: 2 → 3», después «cambió racha: 3 → 0» y «cambió nivel: 1 → 2». En el árbol, App se renderiza tres veces por un solo clic, y en uno de esos commits la pantalla llega a decir «racha de 3 aciertos».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [ultima, setUltima] = useState(null)\n  const [racha, setRacha] = useState(0)\n  const [nivel, setNivel] = useState(1)\n  const [terminada, setTerminada] = useState(false)\n\n  // 🔴 Tres efectos que solo existen para dispararse unos a otros\n  useEffect(() => {\n    if (ultima === null) return\n    if (ultima.acierto) setRacha((r) => r + 1)\n    else setRacha(0)\n  }, [ultima])\n\n  useEffect(() => {\n    if (racha === 3) {\n      setNivel((n) => n + 1)\n      setRacha(0)\n    }\n  }, [racha])\n\n  useEffect(() => {\n    if (nivel > 3) setTerminada(true)\n  }, [nivel])\n\n  function responder(acierto) {\n    if (terminada) return\n    setUltima({ acierto })\n  }\n\n  return (\n    <main>\n      <h1>Vuelta al mapa</h1>\n      <p>\n        Nivel {nivel} · racha de {racha} aciertos\n      </p>\n      {terminada && <p>¡Has dado la vuelta al mapa!</p>}\n      <button onClick={() => responder(true)}>Respuesta correcta</button>\n      <button onClick={() => responder(false)}>Respuesta incorrecta</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ntextarea {\n  display: block;\n  width: 100%;\n  min-height: 3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #14532d;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: 700;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "mostrarConsola": false,
  "mostrarArbol": true,
  "mostrarEfectos": true
}
```

Fíjate también en una línea curiosa del registro: «cambió ultima: {"acierto":true} → {"acierto":true}». Parecen iguales, pero cada clic crea un objeto nuevo, y para `Object.is` son distintos. Por eso incluso el primer y el segundo acierto cuestan dos commits: uno para `ultima`, sin ningún cambio en el DOM, y otro para la racha.

Hay dos problemas. El primero, la **eficiencia**: cada eslabón de la cadena es un render completo del componente y de sus hijos. El segundo, peor, la **fragilidad**: si mañana quieres un botón para revisar la partida jugada, volviendo atrás a una respuesta anterior, al cambiar `ultima` la cadena se dispararía otra vez y te tocaría la racha y el nivel.

La alternativa es calcular lo que se pueda durante el render y **decidir todo el estado siguiente en el manejador**, que es donde se sabe qué ha pasado:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Las reglas del concurso, en el manejador",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [racha, setRacha] = useState(0)\n  const [nivel, setNivel] = useState(1)\n\n  // ✅ Se calcula durante el render\n  const terminada = nivel > 3\n\n  // ✅ Todo el estado siguiente, decidido en el manejador\n  function responder(acierto) {\n    if (terminada) return\n    if (!acierto) {\n      setRacha(0)\n    } else if (racha < 2) {\n      setRacha(racha + 1)\n    } else {\n      setRacha(0)\n      setNivel(nivel + 1)\n    }\n  }\n\n  return (\n    <main>\n      <h1>Vuelta al mapa</h1>\n      <p>\n        Nivel {nivel} · racha de {racha} aciertos\n      </p>\n      {terminada && <p>¡Has dado la vuelta al mapa!</p>}\n      <button onClick={() => responder(true)}>Respuesta correcta</button>\n      <button onClick={() => responder(false)}>Respuesta incorrecta</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ntextarea {\n  display: block;\n  width: 100%;\n  min-height: 3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #14532d;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: 700;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}",
  "anotaciones": [
    {
      "fragmento": "const terminada = nivel > 3",
      "nota": "Si la partida ha terminado no es un dato nuevo: se deduce del nivel. Un estado y un efecto menos."
    },
    {
      "fragmento": "function responder(acierto)",
      "nota": "El manejador sabe si la respuesta fue buena y cuál es la racha. Con eso calcula de una vez la racha y el nivel siguientes. El estado ultima, que solo servía para disparar la cadena, desaparece."
    },
    {
      "fragmento": "} else if (racha < 2) {",
      "nota": "Ojo con la instantánea de la lección 18: dentro del manejador, racha es la del render en que se pulsó. Por eso la comparación es con 2: este acierto es el tercero, y en vez de llegar a 3 se sube de nivel."
    },
    {
      "fragmento": "setNivel(nivel + 1)",
      "nota": "Los dos set de este clic se agrupan (lección 19): un solo render y un solo commit. Míralo en el árbol de renders."
    }
  ],
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Un clic, un commit, y ninguna pantalla intermedia. Y si mañana añades la revisión de la partida, puedes poner cada estado en un valor del pasado sin que nada se dispare solo.

Hay un caso en que una cadena sí tiene sentido: cuando cada paso **depende de la red**. Un formulario con varios desplegables, en el que las opciones de cada uno se piden al servidor según lo elegido en el anterior, es sincronizar con algo de fuera, y ahí cada desplegable puede tener su efecto.

## Avisar al padre de un cambio

En el Gimnasio Fuerza Norte, la lista de clases tiene un interruptor «Solo clases con plazas». `Interruptor` guarda si está activo y avisa a `App` con `onCambiar` para que filtre. La primera versión avisa desde un efecto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un aviso al padre que llega un commit tarde",
  "consigna": "Pulsa «Solo clases con plazas» y mira el árbol: dos commits. En el primero solo cambia Interruptor; después su efecto llama a onCambiar, y en el segundo se renderizan App y la lista. Quita el efecto de Interruptor.jsx y llama a onCambiar dentro de manejarClic, junto a setActivo. Pulsa otra vez: un solo commit, con los tres componentes a la vez.",
  "archivos": [
    {
      "nombre": "Interruptor.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Interruptor({ etiqueta, onCambiar }) {\n  const [activo, setActivo] = useState(false)\n\n  // 🔴 Avisa al padre tarde: cuando Interruptor ya ha hecho su commit\n  useEffect(() => {\n    onCambiar(activo)\n  }, [activo, onCambiar])\n\n  function manejarClic() {\n    setActivo(!activo)\n  }\n\n  return (\n    <button aria-pressed={activo} onClick={manejarClic}>\n      {etiqueta}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Interruptor from './Interruptor'\nimport './estilos.css'\n\nconst CLASES = [\n  { id: 'spinning-9', nombre: 'Spinning, 9:00', plazas: 0 },\n  { id: 'pilates-10', nombre: 'Pilates, 10:00', plazas: 4 },\n  { id: 'boxeo-18', nombre: 'Boxeo, 18:00', plazas: 0 },\n  { id: 'yoga-19', nombre: 'Yoga, 19:30', plazas: 2 },\n]\n\nfunction ListaClases({ clases }) {\n  return (\n    <ul>\n      {clases.map((clase) => (\n        <li key={clase.id}>\n          {clase.nombre} · {clase.plazas} plazas\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [soloConPlazas, setSoloConPlazas] = useState(false)\n  const visibles = soloConPlazas ? CLASES.filter((clase) => clase.plazas > 0) : CLASES\n\n  return (\n    <main>\n      <h1>Gimnasio Fuerza Norte · Clases de hoy</h1>\n      <Interruptor etiqueta=\"Solo clases con plazas\" onCambiar={setSoloConPlazas} />\n      <ListaClases clases={visibles} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ntextarea {\n  display: block;\n  width: 100%;\n  min-height: 3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #14532d;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: 700;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "Interruptor.jsx",
  "mostrarConsola": false,
  "mostrarArbol": true,
  "mostrarEfectos": true
}
```

Con el aviso en el manejador:

```jsx
function manejarClic() {
  setActivo(!activo)
  onCambiar(!activo)
}
```

`setActivo` y el `set` del padre que hay dentro de `onCambiar` ocurren en el mismo evento, y **React agrupa las actualizaciones de varios componentes** en un solo render (lección 19). Fíjate en que se pasa `!activo`, no `activo`: por la instantánea, `activo` sigue siendo el valor viejo hasta el siguiente render.

Y muchas veces se puede ir más lejos: si el padre necesita saber si el interruptor está activo, que sea el padre quien lo guarde. **Levanta el estado** (lección 25) y deja un `Interruptor` controlado, que recibe `activo` por props y solo llama a `onCambiar`. Una sola fuente de verdad, nada que mantener sincronizado.

### Pasar datos al padre

La variante de lo mismo con datos: un hijo pide algo al servidor y se lo pasa al padre desde un efecto (`useEffect(() => { if (datos) onCargados(datos) }, [datos, onCargados])`). En React los datos bajan de padres a hijos; si un hijo sube datos al padre a escondidas, cuando algo se vea mal no sabrás de dónde viene. Si los dos los necesitan, **que los pida el padre y se los pase al hijo** por props.

## Otros casos que no necesitan un efecto

- **Suscribirse a algo de fuera de React.** Mantener en el estado un valor del navegador (si hay conexión, el tamaño de la ventana) con un efecto que escucha sus eventos funciona, pero React tiene un Hook hecho para eso, `useSyncExternalStore`, menos propenso a errores. Es la lección 46.
- **Inicializar la aplicación una sola vez.** Comprobar el token de sesión o leer la configuración al arrancar no es algo que deba repetirse al volver a montarse un componente, y un efecto en `App` se ejecuta dos veces en desarrollo. Pon esa lógica en el nivel superior del módulo, fuera de cualquier componente, o protégela con una variable de módulo:

```jsx
let inicializada = false

export default function App() {
  useEffect(() => {
    if (inicializada) return
    inicializada = true
    comprobarSesion()
    leerPreferencias()
  }, [])
  // …
}
```

- **Pedir datos sí es un efecto.** Puede parecer que contradice el resto: si el usuario escribe en un buscador, ¿no debería ir la petición en el manejador del campo? No, porque lo que importa no es la tecla, sino que lo que se ve esté de acuerdo con la búsqueda actual, venga del campo, de la URL o del botón Atrás. Eso es sincronizar, y va en un efecto con su limpieza (lección 38). Las otras formas de pedir datos son la lección 52.

## Cuándo lo usarías de verdad

Esta es la chuleta de la lección: en vez de un efecto…

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un dato que sale de otros",
      "texto": "Calcúlalo durante el render. Si de verdad es caro, memorízalo con useMemo (lección 67)."
    },
    {
      "titulo": "Reiniciar un componente entero cuando cambia una prop",
      "texto": "Dale una key que dependa de esa prop (lección 26). Se reinicia todo, hijos incluidos."
    },
    {
      "titulo": "Reiniciar o ajustar parte del estado",
      "texto": "Mejor guarda el id y calcula el resto. Si no puedes, ajusta el estado durante el render, con una condición que evite el bucle."
    },
    {
      "titulo": "Algo que pasa porque el usuario actuó",
      "texto": "En el manejador del evento: avisos, envíos, compras, navegación. Si varios manejadores lo comparten, sácalo a una función."
    },
    {
      "titulo": "Varios estados que cambian por la misma acción",
      "texto": "Calcula todo el estado siguiente en el manejador, no en una cadena de efectos."
    },
    {
      "titulo": "Avisar al padre o pasarle datos",
      "texto": "Llama a su función en el mismo manejador, o levanta el estado para que el padre sea la única fuente de verdad (lección 25)."
    },
    {
      "titulo": "Leer un valor externo que cambia",
      "texto": "useSyncExternalStore (lección 46)."
    },
    {
      "titulo": "Y entonces, ¿cuándo sí?",
      "texto": "Cuando el componente, por estar en pantalla, tiene que mantenerse de acuerdo con algo de fuera de React: una conexión, un widget, un temporizador, los datos del servidor (lección 38)."
    }
  ]
}
```

## Errores típicos

**Un efecto que copia un cálculo y depende de un objeto nuevo en cada render.** A los dos problemas de siempre se suma un tercero:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const QUESOS = [\n  { id: 1, nombre: 'Idiazabal', leche: 'oveja' },\n  { id: 2, nombre: 'Cabrales', leche: 'mezcla' },\n]\n\nfunction Catalogo({ leche }) {\n  const filtro = { leche }\n  const [visibles, setVisibles] = useState([])\n\n  useEffect(() => {\n    setVisibles(QUESOS.filter((queso) => queso.leche === filtro.leche))\n  }, [filtro])\n\n  return <p>{visibles.length} quesos</p>\n}\n\n// <Catalogo leche=\"oveja\" />. ¿Qué pasa?",
  "opciones": [
    "Enseña «1 quesos» y ya está",
    "Enseña «0 quesos», porque el efecto llega tarde",
    "Enseña «1 quesos», pero entra en bucle y la consola se llena de «Maximum update depth exceeded»"
  ],
  "correcta": 2,
  "explicacion": "filtro es un objeto nuevo en cada render, así que para Object.is siempre ha cambiado. El efecto se ejecuta tras cada render, setVisibles recibe un array nuevo, eso provoca otro render con otro filtro nuevo, y así sin fin. Calcular visibles durante el render quita el bucle, el estado y el efecto a la vez."
}
```

Es el aviso que ya citaba la lección 64:

```text
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

Es decir: un componente cambia su estado dentro de `useEffect`, y el efecto o no tiene lista de dependencias o tiene una que cambia en cada render. Qué hacer con las dependencias que son objetos o funciones lo verás en la lección 42; aquí la respuesta es más sencilla: ese efecto no tenía que existir.

**Silenciar la regla.** Un comentario `// eslint-disable-next-line react-hooks/set-state-in-effect` hace callar al linter, pero el render de más sigue ahí. Si el `set` está en un efecto porque esperas a algo de fuera, ponlo en el *callback* de eso; si no, el efecto sobra.

**Pasarse al otro extremo.** No se trata de quitar todos los efectos. Pedir datos, conectarse, escuchar el teclado o controlar un widget **sí** son efectos, con su limpieza. Mover la petición de un buscador al manejador del campo rompe la búsqueda cuando llega desde la URL o desde el botón Atrás.

**Avisos que salen al recargar.** Si un aviso, un sonido o un mensaje se dispara desde un efecto que vigila un estado, saldrá cada vez que ese estado se cargue ya «encendido». Lo provoca un evento: va en su manejador.

## Ejercicios

**1. La ficha de cada alumna, desde cero.** Al cambiar de alumna, el efecto de `FichaClase` vacía las notas, pero las maniobras de la alumna anterior siguen marcadas. Arréglalo sin ningún efecto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha de clase que no se vacía del todo",
  "consigna": "Escribe una nota, marca «Aparcar en línea» y elige a Marta Gil: las notas se vacían, pero la maniobra sigue marcada. Quita el efecto de FichaClase.jsx y haz que App le dé a FichaClase una key que dependa de la alumna. En el árbol de renders verás la ficha vieja desmontada y la nueva montada.",
  "archivos": [
    {
      "nombre": "FichaClase.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport Maniobras from './Maniobras'\n\nexport default function FichaClase({ alumna }) {\n  const [notas, setNotas] = useState('')\n\n  // Vacía las notas al cambiar de alumna… pero no las maniobras\n  useEffect(() => {\n    setNotas('')\n  }, [alumna.id])\n\n  return (\n    <section className=\"ficha\">\n      <h2>Clase con {alumna.nombre}</h2>\n      <label>\n        Notas de la clase\n        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />\n      </label>\n      <Maniobras />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaClase from './FichaClase'\nimport './estilos.css'\n\nconst ALUMNAS = [\n  { id: 'ines', nombre: 'Inés Lacasa' },\n  { id: 'marta', nombre: 'Marta Gil' },\n  { id: 'nuria', nombre: 'Nuria Royo' },\n]\n\nexport default function App() {\n  const [alumnaId, setAlumnaId] = useState('ines')\n  const alumna = ALUMNAS.find((a) => a.id === alumnaId)\n\n  return (\n    <main>\n      <h1>Autoescuela La Rotonda · Clases prácticas</h1>\n      <label>\n        Alumna{' '}\n        <select value={alumnaId} onChange={(e) => setAlumnaId(e.target.value)}>\n          {ALUMNAS.map((a) => (\n            <option key={a.id} value={a.id}>\n              {a.nombre}\n            </option>\n          ))}\n        </select>\n      </label>\n      <FichaClase alumna={alumna} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Maniobras.jsx",
      "codigo": "import { useState } from 'react'\n\nconst MANIOBRAS = [\n  'Aparcar en línea',\n  'Arranque en cuesta',\n  'Rotonda de dos carriles',\n  'Cambio de sentido',\n]\n\nexport default function Maniobras() {\n  const [hechas, setHechas] = useState([])\n\n  function alternar(maniobra) {\n    setHechas(\n      hechas.includes(maniobra)\n        ? hechas.filter((m) => m !== maniobra)\n        : [...hechas, maniobra],\n    )\n  }\n\n  return (\n    <fieldset>\n      <legend>Maniobras practicadas</legend>\n      {MANIOBRAS.map((maniobra) => (\n        <label key={maniobra}>\n          <input\n            type=\"checkbox\"\n            checked={hechas.includes(maniobra)}\n            onChange={() => alternar(maniobra)}\n          />{' '}\n          {maniobra}\n        </label>\n      ))}\n      <p>Practicadas: {hechas.length} de {MANIOBRAS.length}</p>\n    </fieldset>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ntextarea {\n  display: block;\n  width: 100%;\n  min-height: 3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #14532d;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: 700;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "FichaClase.jsx",
  "mostrarConsola": false,
  "mostrarArbol": true,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al marcar una maniobra, el recuento sube a 1",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Aparcar en línea"
          }
        }
      ],
      "espera": {
        "texto": "Practicadas: 1 de 4"
      }
    },
    {
      "descripcion": "Al elegir otra alumna, las notas se vacían",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas de la clase",
            "texto": "Frena tarde en las rotondas"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Alumna",
            "opcion": "Marta Gil"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas de la clase",
        "valor": ""
      }
    },
    {
      "descripcion": "Al elegir otra alumna, no queda ninguna maniobra marcada",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Aparcar en línea"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Alumna",
            "opcion": "Marta Gil"
          }
        }
      ],
      "espera": {
        "texto": "Practicadas: 0 de 4"
      }
    },
    {
      "descripcion": "Al volver a la primera alumna, su ficha también empieza de cero",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Aparcar en línea"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Alumna",
            "opcion": "Marta Gil"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Alumna",
            "opcion": "Inés Lacasa"
          }
        }
      ],
      "espera": {
        "texto": "Practicadas: 0 de 4"
      }
    },
    {
      "descripcion": "La ficha nombra a la alumna elegida",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Alumna",
            "opcion": "Nuria Royo"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Clase con Nuria Royo"
      }
    }
  ]
}
```

**2. La cesta de la quesería.** La ficha de cada queso envía la línea a la cesta y enseña un aviso, las dos cosas desde efectos. Ya sabes qué le pasa al aviso con el Idiazabal, que estaba en la cesta desde ayer. Las comprobaciones usan la API simulada: al empezar, la cesta del servidor tiene un Idiazabal.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un aviso que sale sin que pulses nada",
  "consigna": "Al cargar sale «Idiazabal curado: añadido a tu cesta» sin haber pulsado nada, y vuelve a salir cada vez que vuelves a su ficha. En FichaQueso.jsx, quita los dos efectos y el estado pendiente: haz el POST a /api/cesta en el manejador de «Añadir a la cesta» y, cuando el servidor responda bien, llama a onAnadido con la línea y enseña el aviso. Si la respuesta no es ok, enseña un aviso de error con role=\"alert\".",
  "archivos": [
    {
      "nombre": "FichaQueso.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function FichaQueso({ queso, enCesta, onAnadido }) {\n  const [aviso, setAviso] = useState('')\n  const [pendiente, setPendiente] = useState(null)\n\n  // 🔴 El envío, escondido en un efecto que vigila «pendiente»\n  useEffect(() => {\n    if (pendiente === null) return\n    fetch('/api/cesta', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(pendiente),\n    })\n      .then((res) => res.json())\n      .then((linea) => onAnadido(linea))\n  }, [pendiente])\n\n  // 🔴 El aviso, en un efecto que vigila «enCesta»\n  useEffect(() => {\n    if (enCesta) setAviso(`${queso.nombre}: añadido a tu cesta`)\n  }, [enCesta, queso.nombre])\n\n  function manejarAnadir() {\n    setPendiente({ quesoId: queso.id })\n  }\n\n  return (\n    <article className=\"ficha\">\n      <h2>{queso.nombre}</h2>\n      <p>{enCesta ? 'Ya tienes este queso en la cesta.' : 'Todavía no está en tu cesta.'}</p>\n      <button onClick={manejarAnadir}>Añadir a la cesta</button>\n      <p role=\"status\">{aviso}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport FichaQueso from './FichaQueso'\nimport './estilos.css'\n\nconst QUESOS = [\n  { id: 'idiazabal', nombre: 'Idiazabal curado' },\n  { id: 'torta-del-casar', nombre: 'Torta del Casar' },\n  { id: 'cabrales', nombre: 'Cabrales' },\n]\n\nexport default function App() {\n  const [cesta, setCesta] = useState(null)\n  const [quesoId, setQuesoId] = useState('idiazabal')\n\n  // ✅ Esto sí es un efecto: traer la cesta guardada en el servidor\n  useEffect(() => {\n    const controlador = new AbortController()\n    fetch('/api/cesta', { signal: controlador.signal })\n      .then((res) => res.json())\n      .then((lineas) => setCesta(lineas))\n      .catch((error) => {\n        if (error.name !== 'AbortError') console.error(error)\n      })\n    return () => controlador.abort()\n  }, [])\n\n  if (cesta === null) return <p>Cargando tu cesta…</p>\n\n  const queso = QUESOS.find((q) => q.id === quesoId)\n  const enCesta = cesta.some((linea) => linea.quesoId === quesoId)\n\n  return (\n    <main>\n      <h1>Quesería El Zurrón</h1>\n      <p>Tu cesta: {cesta.length} {cesta.length === 1 ? 'queso' : 'quesos'}</p>\n      <nav aria-label=\"Quesos\">\n        {QUESOS.map((q) => (\n          <button key={q.id} aria-pressed={q.id === quesoId} onClick={() => setQuesoId(q.id)}>\n            {q.nombre}\n          </button>\n        ))}\n      </nav>\n      <FichaQueso\n        key={queso.id}\n        queso={queso}\n        enCesta={enCesta}\n        onAnadido={(linea) => setCesta([...cesta, linea])}\n      />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ntextarea {\n  display: block;\n  width: 100%;\n  min-height: 3rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #14532d;\n  color: white;\n}\n\n.ficha {\n  padding: 0.25rem 1rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.total {\n  font-weight: 700;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n"
    }
  ],
  "archivoInicial": "FichaQueso.jsx",
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "cesta": [
      {
        "id": 1,
        "quesoId": "idiazabal"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, la cesta tiene 1 queso",
      "pasos": [],
      "espera": {
        "texto": "Tu cesta: 1 queso"
      }
    },
    {
      "descripcion": "Al volver a la ficha de un queso que ya estaba en la cesta, no sale ningún aviso de «añadido»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cabrales"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Idiazabal curado"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Idiazabal curado"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "status",
          "texto": "añadido"
        }
      }
    },
    {
      "descripcion": "Al pulsar «Añadir a la cesta», sale el aviso con el nombre del queso",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cabrales"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir a la cesta"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Cabrales: añadido a tu cesta"
      }
    },
    {
      "descripcion": "Al añadir un queso, la cesta pasa a 2 quesos",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cabrales"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir a la cesta"
          }
        }
      ],
      "espera": {
        "texto": "Tu cesta: 2 quesos"
      }
    },
    {
      "descripcion": "Si el servidor falla al añadir, sale un aviso de error",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cabrales"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir a la cesta"
          }
        }
      ],
      "espera": {
        "rol": "alert"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el concurso con efectos, añade un botón «Revisar la jugada anterior» que vuelva a poner en `ultima` la respuesta de antes. ¿Qué les pasa a la racha y al nivel? Hazlo después en la versión con el manejador y compara.
2. En el gimnasio, convierte `Interruptor` en un componente controlado: que reciba `activo` por props y que `App` guarde el estado (lección 25). Comprueba en el árbol que cada clic sigue siendo un solo commit.
3. En la quesería, añade un botón «Comprar ya» que añada el queso a la cesta y después enseñe «Te llevamos al pago…». Saca a una función lo que comparte con «Añadir a la cesta».
4. En `Salidas`, de Autobuses del Moncayo, cambia el estado por `elegidaId` y calcula la salida elegida durante el render. ¿Qué pasa ahora si cambias a una línea que también tiene esa salida?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "You Might Not Need an Effect",
      "descripcion": "La página de react.dev de esta lección: todos los casos, con sus alternativas, y cuatro retos para quitar efectos (transformar datos, memorizar un cálculo, reiniciar estado y enviar un formulario).",
      "url": "https://react.dev/learn/you-might-not-need-an-effect",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "set-state-in-effect",
      "descripcion": "La regla de eslint-plugin-react-hooks que marca los set síncronos dentro de un efecto, con ejemplos de lo que marca y de lo que no.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: storing information from previous renders",
      "descripcion": "El patrón de ajustar el estado durante el render, con sus condiciones y sus límites.",
      "url": "https://react.dev/reference/react/useState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Preserving and Resetting State",
      "descripcion": "Cómo decide React qué estado conservar y cómo reiniciarlo con una key. Es la lección 26.",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useMemo",
      "descripcion": "Memorizar un cálculo caro entre renders, sin estado ni efectos.",
      "url": "https://react.dev/reference/react/useMemo",
      "etiqueta": "react.dev"
    }
  ]
}
```
