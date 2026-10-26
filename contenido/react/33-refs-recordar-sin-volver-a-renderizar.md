# Refs: recordar sin volver a renderizar

- **Módulo:** Refs y el DOM
- **Slug:** `refs-recordar-sin-volver-a-renderizar` (autogenerado del título)
- **Orden:** 330
- **Fuentes:** [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs) + [useRef](https://react.dev/reference/react/useRef) — ver `contenido/react/TEMARIO.md` #33

---

## Qué es y para qué sirve

Hasta ahora, todo lo que un componente necesitaba recordar iba al estado. Pero hay datos que hay que recordar de un render al siguiente **y que no se ven en pantalla**: el identificador que devuelve `setInterval`, para poder pararlo; el texto que tiene que leer un aviso que sonará dentro de un rato; el valor que tenía un campo antes de que lo tocaras. Si los guardas en el estado, cada cambio provoca un render que no pinta nada nuevo. Si los guardas en una variable normal, se pierden en el siguiente render.

Para eso existen las **refs**: una caja que React conserva entre renders, que es de cada copia del componente y que puedes cambiar cuando quieras **sin que React vuelva a renderizar**. Se crean con el Hook `useRef`.

Este módulo va de las refs y el DOM. En esta lección verás las refs como memoria (temporizadores, valores para más tarde, objetos que no se pintan); en la siguiente, su uso más conocido: guardar un nodo del DOM para enfocarlo, desplazarte hasta él o medirlo. Para situarte, estas son las cuatro formas que tiene un componente de guardar un valor:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dónde puede guardar un valor un componente",
  "roles": [
    {
      "etiqueta": "let dentro",
      "rol": "Variable local del componente",
      "descripcion": "Nace de nuevo en cada render. Lo que guardes en ella se pierde en cuanto React vuelve a llamar a la función (lección 16)."
    },
    {
      "etiqueta": "let fuera",
      "rol": "Variable del módulo",
      "descripcion": "Sobrevive a los renders, pero la comparten todas las copias del componente, y React no sabe que existe (la pescadería de la lección 12)."
    },
    {
      "etiqueta": "useState",
      "rol": "Estado",
      "descripcion": "Sobrevive, es de cada copia y, al cambiarlo con set, React vuelve a renderizar. Para lo que se ve en pantalla."
    },
    {
      "etiqueta": "useRef",
      "rol": "Ref",
      "descripcion": "Sobrevive, es de cada copia y cambiarla no provoca ningún render. Para lo que hay que recordar pero no se pinta."
    }
  ]
}
```

## `useRef`: una caja con una sola propiedad, `current`

Se importa de `react` y se llama arriba del componente, como cualquier Hook, con el valor inicial:

```jsx
import { useRef } from 'react'

function Torno() {
  const entradasRef = useRef(0)
  // entradasRef es { current: 0 }
}
```

`useRef` devuelve un objeto normal de JavaScript con una sola propiedad, `current`, que empieza valiendo lo que le pases. **En cada render, `useRef` te devuelve el mismo objeto**, así que lo que guardes en `current` sigue ahí la próxima vez. Y a diferencia del estado, `current` se cambia asignando, sin función `set`:

```jsx
entradasRef.current = entradasRef.current + 1
```

React no se entera de esa asignación, y es justo lo que se busca: **cambiar `ref.current` no provoca ningún render**. El nombre terminado en `Ref` es una costumbre muy extendida; además de dejar claro qué es, ayuda al linter de React a reconocer las refs, como verás más abajo en esta lección.

Compruébalo en el torno de entrada de un museo. Cada vez que pasa alguien, el torno suma uno en una ref; la pantalla de la sala solo se pone al día cuando la vigilante pulsa «Actualizar el panel». Con mucho trasiego no hace falta repintar nada por cada persona que entra.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un torno que cuenta sin renderizar",
  "codigo": "import { useRef, useState } from 'react'\n\nexport default function Torno() {\n  const entradasRef = useRef(0)\n  const [enPanel, setEnPanel] = useState(0)\n\n  function manejarPaso() {\n    entradasRef.current = entradasRef.current + 1\n    console.log('Pasa alguien. entradasRef.current =', entradasRef.current)\n  }\n\n  function manejarActualizar() {\n    setEnPanel(entradasRef.current)\n  }\n\n  return (\n    <main>\n      <h1>Museo de la Ciudad · Sala 2</h1>\n      <p className=\"panel\">Visitantes según el panel: {enPanel}</p>\n      <button onClick={manejarPaso}>Pasa un visitante</button>\n      <button onClick={manejarActualizar}>Actualizar el panel</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\n.panel {\n  display: inline-block;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #0f172a;\n  color: #fde68a;\n  font-variant-numeric: tabular-nums;\n}",
  "anotaciones": [
    {
      "fragmento": "const entradasRef = useRef(0)",
      "nota": "Una ref que empieza en 0. React la guarda con el componente, como el estado: en cada render, useRef devuelve el mismo objeto con lo que tenga dentro."
    },
    {
      "fragmento": "entradasRef.current = entradasRef.current + 1",
      "nota": "Se cambia asignando a current, sin función set. React no se entera y no renderiza: en el árbol de renders no aparece ningún commit nuevo por mucho que pulses."
    },
    {
      "fragmento": "console.log('Pasa alguien. entradasRef.current =', entradasRef.current)",
      "nota": "La ref cambia al instante: la línea siguiente ya lee el valor nuevo. Con el estado no pasa, porque cada render es una foto (lección 18)."
    },
    {
      "fragmento": "setEnPanel(entradasRef.current)",
      "nota": "Para que algo se vea hay que pasarlo al estado. Aquí se copia el número de la ref en enPanel, y eso sí provoca un render."
    },
    {
      "fragmento": "{enPanel}",
      "nota": "El JSX pinta el estado, nunca la ref. Leer entradasRef.current aquí, en mitad del render, daría un número que no se pone al día solo; enseguida verás por qué."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarArbol": true
}
```

Pulsa «Pasa un visitante» cinco veces. La consola cuenta 1, 2, 3, 4, 5, pero el panel sigue en 0 y el árbol de renders no se mueve: **ni un commit nuevo, porque nadie ha pedido un render**. Pulsa ahora «Actualizar el panel»: llega el commit 2, `Torno` pasa a re-render con el motivo «cambió su estado», y el panel enseña 5. La ref llevaba la cuenta desde el principio; el estado es lo que la pone en pantalla.

Si vuelves a pulsar «Actualizar el panel» sin que haya pasado nadie, `setEnPanel` recibe el mismo número que ya tenía. Como viste en la lección 17, React puede llegar a llamar al componente para comprobarlo, pero no toca el DOM: en el panel aparece, como mucho, un commit con `Torno` sin cambios.

## Una ref cambia al instante; el estado, en el siguiente render

En la lección 18 viste que el estado es una foto: `set` no cambia la variable del render en curso. Una ref no es una foto, es un objeto que tienes en la mano. Prueba a predecir qué escribe este concurso de tapas en el primer voto:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Votacion() {\n  const [votos, setVotos] = useState(0)\n  const votosRef = useRef(0)\n\n  function manejarVoto() {\n    setVotos(votos + 1)\n    votosRef.current = votosRef.current + 1\n    console.log(votos, votosRef.current)\n  }\n\n  return <button onClick={manejarVoto}>Votar la tapa de Casa Pepa</button>\n}\n\n// Primer clic: ¿qué sale en la consola?",
  "opciones": [
    "0 0",
    "0 1",
    "1 1",
    "1 0"
  ],
  "correcta": 1,
  "explicacion": "votos es la constante del render en el que pulsaste: vale 0 hasta que React vuelva a llamar a Votacion. votosRef.current es una propiedad de un objeto que acabas de cambiar, y la línea siguiente ya lee el 1. Comprobado con React 19.3: la consola escribe «0 1»."
}
```

## Refs frente a estado

Las dos sobreviven a los renders y las dos son de cada copia del componente. Todo lo demás cambia:

| | `useRef` | `useState` |
|---|---|---|
| Devuelve | `{ current: valor }` | `[valor, setValor]` |
| Se cambia | asignando `current` | con la función `set` |
| Al cambiarla | no renderiza | pide un render |
| El valor nuevo | se ve al instante | llega en el siguiente render |
| Leerla al renderizar | no (salvo para inicializarla) | sí, siempre |

La regla práctica cabe en una línea: **si un dato se ve en pantalla, es estado; si solo lo usan los manejadores (o un temporizador) y cambiarlo no tiene que tocar la pantalla, es una ref.** Y si se puede calcular a partir de otra cosa, no es ninguna de las dos: se calcula en el render (lección 24).

Las refs son una **vía de escape**: sirven para salir un momento del flujo de datos de React y tratar con algo de fuera, como el temporizador del navegador o, en la lección 34, el DOM. La mayoría de los componentes no necesitan ninguna. Si te ves guardando en refs buena parte de la lógica de un componente, probablemente ese dato debía ser estado.

## Caso 1: el identificador de un temporizador

`setTimeout` y `setInterval` devuelven un identificador, y para cancelarlos hay que pasárselo a `clearTimeout` o `clearInterval`. Ese identificador no se pinta en ningún sitio: es el caso de libro de una ref.

Así lo ha intentado el grupo de vecinos de un edificio. Los avisos se publican tres segundos después de pulsar «Enviar al grupo», y durante ese tiempo se puede deshacer. El identificador se guarda en una variable normal:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un «Deshacer» que no deshace",
  "consigna": "Pulsa «Enviar al grupo» y, antes de tres segundos, «Deshacer». ¿Se publica el aviso igualmente? Arréglalo: importa useRef, guarda el identificador en una ref y usa su current en los dos manejadores. Vuelve a probarlo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nlet siguienteId = 1\n\nexport default function AvisoVecinos() {\n  const [texto, setTexto] = useState('Mañana cortan el agua de 9 a 11')\n  const [enviando, setEnviando] = useState(false)\n  const [publicados, setPublicados] = useState([])\n  let idTemporizador = null\n\n  function manejarEnvio() {\n    setEnviando(true)\n    idTemporizador = setTimeout(() => {\n      setPublicados((anteriores) => [...anteriores, { id: siguienteId++, texto }])\n      setEnviando(false)\n    }, 3000)\n  }\n\n  function manejarDeshacer() {\n    clearTimeout(idTemporizador)\n    setEnviando(false)\n  }\n\n  return (\n    <main>\n      <h1>Comunidad de la calle Olmo, 14</h1>\n      <label>\n        Aviso para el grupo\n        <textarea\n          value={texto}\n          disabled={enviando}\n          onChange={(e) => setTexto(e.target.value)}\n        />\n      </label>\n      {enviando ? (\n        <p>\n          Se publica en 3 segundos…{' '}\n          <button onClick={manejarDeshacer}>Deshacer</button>\n        </p>\n      ) : (\n        <button onClick={manejarEnvio}>Enviar al grupo</button>\n      )}\n      <h2>Publicados</h2>\n      <ul>\n        {publicados.map((aviso) => (\n          <li key={aviso.id}>{aviso.texto}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\ntextarea {\n  font: inherit;\n  min-height: 3rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El aviso se publica aunque pulses «Deshacer». Sigue el rastro de `idTemporizador`:

1. **Render 1.** `idTemporizador` nace valiendo `null`.
2. **Clic en «Enviar al grupo».** El manejador del render 1 guarda el identificador en *su* `idTemporizador` y llama a `setEnviando(true)`.
3. **Render 2.** React vuelve a llamar a `AvisoVecinos` para enseñar el botón «Deshacer». La función empieza de cero: `let idTemporizador = null` crea **otra** variable, otra vez `null`.
4. **Clic en «Deshacer».** El manejador que se ejecuta es el del render 2, y su `idTemporizador` vale `null`. `clearTimeout(null)` no cancela nada, y tampoco da error.

Con una ref, los dos renders comparten el mismo objeto, y lo que guarda el primero lo lee el segundo:

```jsx
const idTemporizadorRef = useRef(null)

function manejarEnvio() {
  setEnviando(true)
  idTemporizadorRef.current = setTimeout(() => { /* … */ }, 3000)
}

function manejarDeshacer() {
  clearTimeout(idTemporizadorRef.current)
  setEnviando(false)
}
```

¿Y si la variable va **fuera** del componente, donde no se reinicia? Sobrevive a los renders, sí, pero es una sola para todas las copias. Este panel de domótica tiene dos botones hechos con el mismo componente:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "let temporizador = null\n\nfunction BotonConRetardo({ accion, children }) {\n  function manejarClic() {\n    // Si se pulsa otra vez antes de tiempo, empieza a contar de nuevo\n    clearTimeout(temporizador)\n    temporizador = setTimeout(accion, 2000)\n  }\n\n  return <button onClick={manejarClic}>{children}</button>\n}\n\nexport default function Domotica() {\n  return (\n    <main>\n      <BotonConRetardo accion={() => console.log('Luz del porche encendida')}>\n        Encender el porche en 2 s\n      </BotonConRetardo>\n      <BotonConRetardo accion={() => console.log('Puerta del garaje abierta')}>\n        Abrir el garaje en 2 s\n      </BotonConRetardo>\n    </main>\n  )\n}\n\n// Pulsas los dos botones, uno detrás de otro, en menos de 2 segundos.\n// ¿Qué sale en la consola?",
  "opciones": [
    "Las dos líneas, la del porche primero",
    "Solo «Puerta del garaje abierta»",
    "Solo «Luz del porche encendida»",
    "Nada: los dos temporizadores se anulan"
  ],
  "correcta": 1,
  "explicacion": "Los dos botones usan la misma variable temporizador, la del módulo. El clic en el garaje hace clearTimeout del temporizador que dejó el porche y guarda el suyo encima. Con const temporizadorRef = useRef(null) dentro de BotonConRetardo, cada botón tendría su propia caja y los dos funcionarían."
}
```

Con esto ya tienes las tres propiedades que distinguen a una ref de cualquier variable: **sobrevive a los renders, no provoca ninguno y es de cada copia del componente**. Las tres a la vez solo las tiene `useRef`.

## Caso 2: un cronómetro con `setInterval`

Un cronómetro junta las dos herramientas. Lo que se ve, el tiempo, sale de dos datos que van al estado: cuándo empezaste y qué hora es ahora. El identificador del intervalo, que solo necesita el botón de parar, va a una ref. Aquí cronometras cuánto tardas en leer un trabalenguas en voz alta: pulsa «Empezar a leer», dilo de corrido y pulsa «He terminado».

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Estado para lo que se ve, ref para lo que no",
  "codigo": "import { useRef, useState } from 'react'\n\nconst TRABALENGUAS = 'Pablito clavó un clavito. ¿Qué clavito clavó Pablito?'\n\nexport default function Trabalenguas() {\n  const [inicio, setInicio] = useState(null)\n  const [ahora, setAhora] = useState(null)\n  const [leyendo, setLeyendo] = useState(false)\n  const intervaloRef = useRef(null)\n\n  function manejarEmpezar() {\n    const momento = Date.now()\n    setInicio(momento)\n    setAhora(momento)\n    setLeyendo(true)\n    intervaloRef.current = setInterval(() => {\n      setAhora(Date.now())\n    }, 100)\n  }\n\n  function manejarTerminar() {\n    clearInterval(intervaloRef.current)\n    setLeyendo(false)\n  }\n\n  const segundos = inicio === null ? 0 : (ahora - inicio) / 1000\n\n  return (\n    <main>\n      <h1>Léelo en voz alta, lo más rápido que puedas</h1>\n      <blockquote>{TRABALENGUAS}</blockquote>\n      <p className=\"tiempo\">{segundos.toFixed(1).replace('.', ',')} s</p>\n      {leyendo ? (\n        <button onClick={manejarTerminar}>He terminado</button>\n      ) : (\n        <button onClick={manejarEmpezar}>Empezar a leer</button>\n      )}\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nblockquote {\n  margin: 0 0 0.75rem;\n  font-size: 1.15rem;\n  font-style: italic;\n}\n\n.tiempo {\n  font-size: 2rem;\n  font-variant-numeric: tabular-nums;\n  margin: 0 0 0.5rem;\n}",
  "anotaciones": [
    {
      "fragmento": "const [inicio, setInicio] = useState(null)\n  const [ahora, setAhora] = useState(null)",
      "nota": "El tiempo que se ve sale de restar estos dos datos, así que van al estado: cuando ahora cambia, React vuelve a pintar el número."
    },
    {
      "fragmento": "const [leyendo, setLeyendo] = useState(false)",
      "nota": "También es estado: decide qué botón aparece. Saber si el cronómetro va no es lo mismo que guardar su identificador."
    },
    {
      "fragmento": "const intervaloRef = useRef(null)",
      "nota": "El identificador del intervalo no se pinta: solo lo necesita manejarTerminar para pararlo. Una ref es su sitio."
    },
    {
      "fragmento": "intervaloRef.current = setInterval(() => {\n      setAhora(Date.now())\n    }, 100)",
      "nota": "El intervalo se pone en marcha en un manejador, porque lo provoca un clic. Cada décima pide un render con la hora nueva; la función del intervalo no lee ningún estado, así que no le afecta tener una foto vieja."
    },
    {
      "fragmento": "clearInterval(intervaloRef.current)",
      "nota": "Este manejador pertenece a un render posterior, pero la ref es el mismo objeto en todos: aquí está el identificador que guardó manejarEmpezar."
    },
    {
      "fragmento": "const segundos = inicio === null ? 0 : (ahora - inicio) / 1000",
      "nota": "Lo que se puede calcular, se calcula en el render, sin guardarlo aparte (lección 24)."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Un hueco que cerrarás en el módulo 6",
  "contenido": "Si el componente desaparece de la pantalla con el cronómetro en marcha, nadie llama a clearInterval y el intervalo sigue vivo, pidiendo renders a un componente que ya no existe. Parar algo cuando el componente se desmonta es trabajo de un efecto con limpieza, y lo verás en la lección 38. Mientras tanto, los intervalos de esta lección se paran siempre desde un botón."
}
```

## Caso 3: leer el valor más reciente desde un temporizador

En la lección 18 viste que un temporizador se queda con la foto del render en el que se creó: si el estado cambia mientras espera, él sigue viendo el valor viejo. Casi siempre es lo que quieres. Pero a veces el código que se ejecuta más tarde necesita **lo último**, no lo que había al pulsar.

En este avisador de cocina programas un aviso para dentro de tres segundos, y mientras tanto puedes corregir la nota. El texto se guarda en el estado, porque se ve en el campo, y además se copia en una ref cada vez que cambia. Hay dos botones: uno lee la nota con la foto y el otro, con la ref.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El avisador del horno",
  "consigna": "Pulsa los dos botones de aviso y, antes de tres segundos, cambia la nota (por ejemplo, añade «y apagar el horno»). Espera y compara los dos avisos. Después pulsa uno, cambia la nota dos veces seguidas y comprueba que la ref se queda con la última.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nlet siguienteId = 1\n\nexport default function Avisador() {\n  const [nota, setNota] = useState('Sacar el bizcocho')\n  const notaRef = useRef(nota)\n  const [avisos, setAvisos] = useState([])\n\n  function manejarCambio(e) {\n    setNota(e.target.value)\n    notaRef.current = e.target.value\n  }\n\n  function apuntar(texto) {\n    setAvisos((anteriores) => [...anteriores, { id: siguienteId++, texto }])\n  }\n\n  function manejarAvisoConFoto() {\n    setTimeout(() => {\n      apuntar('Con la foto del clic: ' + nota)\n    }, 3000)\n  }\n\n  function manejarAvisoConRef() {\n    setTimeout(() => {\n      apuntar('Con la ref: ' + notaRef.current)\n    }, 3000)\n  }\n\n  return (\n    <main>\n      <h1>Avisador del horno</h1>\n      <label>\n        Nota\n        <input value={nota} onChange={manejarCambio} />\n      </label>\n      <button onClick={manejarAvisoConFoto}>Avisar en 3 s (con la foto)</button>\n      <button onClick={manejarAvisoConRef}>Avisar en 3 s (con la ref)</button>\n      <ul>\n        {avisos.map((aviso) => (\n          <li key={aviso.id}>{aviso.texto}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.75rem;\n}\n\ninput {\n  font: inherit;\n  padding: 0.3rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El aviso «con la foto» dice lo que había en el campo cuando pulsaste: la función del temporizador se creó en ese render y se quedó con su `nota`. El aviso «con la ref» dice lo que hay **cuando suena**, porque lee `notaRef.current` en ese momento, y la ref es el mismo objeto en todos los renders.

Fíjate en que hacen falta las dos cosas: el **estado**, para que el campo pinte lo que escribes, y la **ref**, para que el temporizador pueda leer lo último. Cada vez que cambia el texto, el manejador actualiza los dos. Es un patrón poco frecuente, y cuando el código que llega tarde es un efecto en vez de un temporizador, hay una herramienta pensada para ello, `useEffectEvent` (lección 41).

## Caso 4: guardar el valor anterior

Otra cosa que se recuerda sin pintarla: **lo que valía un dato antes**. En la frutería, cada precio se puede corregir en su campo, y al salir del campo se apunta en la lista de cambios del día de qué precio a qué precio ha pasado. Para eso, al entrar en el campo (`onFocus`) se guarda en una ref el precio que había; al salir (`onBlur`) se compara con el actual.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los cambios de precio de la frutería",
  "consigna": "Cambia el precio de las peras, sal del campo con el tabulador o pulsando fuera y mira la lista. Entra en otro campo y sal sin tocar nada: no se apunta nada. Cada CampoPrecio tiene su propia ref; ¿por qué no se mezclan los precios de las tres frutas?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport CampoPrecio from './CampoPrecio'\nimport './estilos.css'\n\nlet siguienteId = 1\n\nexport default function Precios() {\n  const [cambios, setCambios] = useState([])\n\n  function manejarCambio(texto) {\n    setCambios([...cambios, { id: siguienteId++, texto }])\n  }\n\n  return (\n    <main>\n      <h1>Frutería Hermanas Gil · Precios del día</h1>\n      <CampoPrecio fruta=\"Manzanas\" precioInicial=\"1,80\" onCambio={manejarCambio} />\n      <CampoPrecio fruta=\"Peras\" precioInicial=\"2,10\" onCambio={manejarCambio} />\n      <CampoPrecio fruta=\"Naranjas\" precioInicial=\"1,35\" onCambio={manejarCambio} />\n      <h2>Cambios de hoy</h2>\n      {cambios.length === 0 && <p>Todavía no has cambiado ningún precio.</p>}\n      <ul>\n        {cambios.map((cambio) => (\n          <li key={cambio.id}>{cambio.texto}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "CampoPrecio.jsx",
      "codigo": "import { useRef, useState } from 'react'\n\nexport default function CampoPrecio({ fruta, precioInicial, onCambio }) {\n  const [precio, setPrecio] = useState(precioInicial)\n  const alEntrarRef = useRef(null)\n\n  function manejarFoco() {\n    // El precio que había cuando empezaste a editar\n    alEntrarRef.current = precio\n  }\n\n  function manejarSalida() {\n    if (precio === alEntrarRef.current) return\n    onCambio(`${fruta}: de ${alEntrarRef.current} a ${precio} €/kg`)\n  }\n\n  return (\n    <label>\n      {fruta} (€/kg)\n      <input\n        value={precio}\n        inputMode=\"decimal\"\n        onFocus={manejarFoco}\n        onChange={(e) => setPrecio(e.target.value)}\n        onBlur={manejarSalida}\n      />\n    </label>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nlabel {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n  max-width: 18rem;\n  margin-bottom: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  width: 6rem;\n  padding: 0.2rem 0.4rem;\n}\n"
    }
  ],
  "archivoInicial": "CampoPrecio.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El precio que había al entrar no se pinta en ningún sitio: solo lo consulta `manejarSalida`. Por eso es una ref, y guardarlo no cuesta ningún render. Y como cada `CampoPrecio` es una copia distinta, cada una tiene su `alEntrarRef`.

La otra cara de la misma regla: **si quisieras enseñar el valor anterior en pantalla** («Antes: 1,80 €»), tendría que ser estado. Lo guardarías en el mismo manejador que cambia el precio, con otro `set`, o lo calcularías a partir de otro estado. En código de hace unos años encontrarás a menudo este Hook para tener el valor del render anterior:

```jsx
// Un patrón antiguo que todavía circula: no lo copies
function usePrevio(valor) {
  const ref = useRef()
  useEffect(() => {
    ref.current = valor
  })
  return ref.current // lee la ref durante el render
}
```

Guarda el valor en un efecto (los verás en el módulo 6) y lo devuelve leyendo la ref **mientras el componente se renderiza**. Es justo lo que no se debe hacer, y el linter de React (`eslint-plugin-react-hooks` 7.1, con la regla `refs` que trae activada su configuración recomendada) lo marca como error:

```text
Error: Cannot access refs during render

React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. Accessing a ref value (the `current` property) during render can cause your component not to update as expected (https://react.dev/reference/react/useRef).
```

Es decir: las refs guardan valores que no hacen falta para pintar, y solo deben usarse fuera del render, en manejadores o efectos; si lees `current` mientras se renderiza, el componente puede no ponerse al día como esperas. El linter sabe que `ref` es una ref porque sale de `useRef`, y también trata como ref cualquier variable cuyo nombre termine en `Ref` y use `.current`: otra razón para respetar la costumbre del nombre. La sección siguiente explica por qué la regla existe.

## No leas ni escribas `ref.current` durante el render

Un componente tiene que ser puro (lección 12): con las mismas props y el mismo estado, el mismo JSX. Una ref rompe eso por los dos lados. Si **la lees** al renderizar, lo que pintas depende de algo que React no vigila. Si **la escribes** al renderizar, el resultado depende de cuántas veces se haya llamado a tu componente. Empieza por la lectura:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useRef } from 'react'\n\nexport default function Interruptor() {\n  const encendidaRef = useRef(false)\n\n  return (\n    <button\n      onClick={() => {\n        encendidaRef.current = !encendidaRef.current\n      }}\n    >\n      {encendidaRef.current ? 'Apagar la luz del pasillo' : 'Encender la luz del pasillo'}\n    </button>\n  )\n}\n\n// Pulsas el botón tres veces. ¿Qué dice ahora?",
  "opciones": [
    "«Apagar la luz del pasillo»: tres cambios dejan la luz encendida",
    "«Encender la luz del pasillo»: el texto no ha cambiado nunca",
    "Cambia de texto con cada clic, pero va un clic por detrás",
    "Error: no se puede mostrar una ref en el JSX"
  ],
  "correcta": 1,
  "explicacion": "La ref sí cambia: después de tres clics, current vale true. Pero cambiarla no provoca ningún render, así que el JSX que se pintó en el primero, con false, sigue en pantalla. El arreglo es usar estado: const [encendida, setEncendida] = useState(false)."
}
```

Ahora la escritura. Esta encuesta de un club de senderismo quiere saber cuántas veces se ha renderizado, y lo cuenta con una ref que suma uno **en el propio cuerpo del componente**. Pon el árbol de renders al lado y compara los dos números.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ref que cuenta los renders… mal",
  "consigna": "Antes de pulsar nada, compara el número de la pantalla con el contador del nodo Encuesta en el árbol de renders. Elige un día y vuelve a comparar. Después pulsa el mismo día otra vez y fíjate en lo que dice el árbol.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nconst DIAS = ['Sábado', 'Domingo']\n\nexport default function Encuesta() {\n  const rendersRef = useRef(0)\n  rendersRef.current = rendersRef.current + 1 // 🚩 escribir durante el render\n\n  const [dia, setDia] = useState(null)\n\n  return (\n    <main>\n      <h1>¿Qué día prefieres para la ruta del Cañón del Río Lobos?</h1>\n      {DIAS.map((opcion) => (\n        <button key={opcion} onClick={() => setDia(opcion)}>\n          {opcion}\n        </button>\n      ))}\n      <p>Has elegido: {dia ?? 'nada todavía'}</p>\n      {/* 🚩 leer durante el render */}\n      <p className=\"nota\">Renders según la ref: {rendersRef.current}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\n.nota {\n  color: #b45309;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Nada más cargar, la pantalla dice **2** y el árbol, `·1`. Al elegir un día, **4** frente a `·2`. Los dos tienen razón a su manera: el árbol cuenta los renders que llegan a un commit, y la ref cuenta las veces que React ha llamado a la función. `StrictMode` llama dos veces a cada componente para destapar efectos secundarios (lección 12), y las dos llamadas suman en la misma ref. En producción, sin `StrictMode`, la misma app diría 1 y 2: **el componente se comporta distinto según quién y cuántas veces lo llame**, que es justo lo que significa no ser puro.

Al repetir el mismo día, el árbol puede enseñar un commit con `Encuesta` sin cambios: React ha llamado al componente para comprobar el estado, no ha encontrado nada nuevo y no ha tocado el DOM. Esa llamada también ha sumado en la ref, pero la pantalla no lo enseña hasta el siguiente render de verdad: si después eliges Domingo, el número salta de 4 a 8 mientras el árbol pasa a `·3`. Ya no significa nada.

El mismo linter de antes marca las dos cosas: «Cannot update ref during render» en la asignación y «Cannot access ref value during render» en cada lectura. Las dos se arreglan igual: si un dato se pinta, va al estado; si no se pinta, se lee y se escribe en manejadores (y, desde el módulo 6, en efectos).

### La excepción: inicializar la ref una sola vez

Hay un caso en el que sí se escribe una ref durante el render, y react.dev lo da por bueno: **rellenarla la primera vez**. Lo necesitarás cuando el valor inicial sea caro de crear. Este buscador de un taller de poesía construye un índice de palabras por su terminación con la línea `useRef(crearIndice())`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un índice que se reconstruye con cada tecla",
  "consigna": "Escribe una palabra en el buscador y mira la consola: dos líneas por cada tecla, porque StrictMode llama dos veces al componente. Cambia la línea marcada por una ref que empiece en null y se rellene solo si current sigue siendo null. Vuelve a escribir: «Construyo el índice» sale una sola vez.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport { PALABRAS } from './palabras'\nimport './estilos.css'\n\nfunction crearIndice() {\n  console.log('Construyo el índice de', PALABRAS.length, 'palabras')\n  const indice = new Map()\n  for (const palabra of PALABRAS) {\n    const final = palabra.slice(-3)\n    if (!indice.has(final)) indice.set(final, [])\n    indice.get(final).push(palabra)\n  }\n  return indice\n}\n\nexport default function Rimas() {\n  // Cámbialo: crearIndice() se ejecuta en cada render\n  const indiceRef = useRef(crearIndice())\n  const [palabra, setPalabra] = useState('')\n  const [encontradas, setEncontradas] = useState(null)\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const final = palabra.trim().toLowerCase().slice(-3)\n    setEncontradas(indiceRef.current.get(final) ?? [])\n  }\n\n  return (\n    <main>\n      <h1>Taller de poesía: palabras que acaban igual</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Palabra\n          <input value={palabra} onChange={(e) => setPalabra(e.target.value)} />\n        </label>\n        <button type=\"submit\">Buscar</button>\n      </form>\n      {encontradas !== null && (\n        <p>\n          {encontradas.length === 0\n            ? 'Ninguna palabra del índice acaba igual.'\n            : encontradas.join(', ')}\n        </p>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "palabras.jsx",
      "codigo": "export const PALABRAS = [\n  'canción', 'corazón', 'ilusión', 'razón', 'pasión', 'estación',\n  'ventana', 'mañana', 'campana', 'semana', 'manzana', 'lana',\n  'camino', 'destino', 'molino', 'pino', 'vecino', 'marino',\n  'luna', 'cuna', 'laguna', 'fortuna', 'aceituna', 'duna',\n  'cielo', 'vuelo', 'pañuelo', 'abuelo', 'consuelo', 'anzuelo',\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nlabel {\n  display: inline-grid;\n  gap: 0.25rem;\n  margin-right: 0.5rem;\n}\n\ninput {\n  font: inherit;\n  padding: 0.3rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

`useRef`, como `useState`, **usa su argumento solo en el primer render** y lo ignora después. Pero JavaScript evalúa `crearIndice()` antes de llamar a `useRef`, así que el índice se construye en cada render y se tira a la basura. El arreglo:

```jsx
const indiceRef = useRef(null)
if (indiceRef.current === null) {
  indiceRef.current = crearIndice()
}
```

Escribe en la ref durante el render, sí, pero **solo una vez y siempre con el mismo resultado**: es predecible, y por eso es la excepción admitida. El linter de React reconoce este patrón exacto (una comparación con `null` y la asignación dentro) y no lo marca. En la vista previa, con `StrictMode`, «Construyo el índice» sale una sola vez al cargar: las dos llamadas del primer render comparten la misma ref, y la segunda ya la encuentra rellena.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "useRef no acepta una función inicializadora",
  "contenido": "Con useState puedes escribir useState(crearIndice) para que React llame a la función solo en el primer render (lección 16). Con useRef no: useRef(() => crearIndice()) guarda la propia función en current, sin llamarla, e indiceRef.current.get daría error, porque una función no tiene método get. Para una ref, el patrón es el de arriba: empezar en null y rellenarla si sigue vacía."
}
```

## Una ref es como un campo de instancia que React no vigila

Si vienes de las clases de JavaScript, ya conoces algo muy parecido. Cada objeto de una clase tiene sus propios campos, que se pueden cambiar cuando quieras:

```js
class Cronometro {
  intervalo = null // cada cronómetro tiene el suyo

  empezar(alPasar) {
    this.intervalo = setInterval(alPasar, 100)
  }

  parar() {
    clearInterval(this.intervalo)
  }
}
```

Una ref es eso mismo para un componente de función: en vez de `this.intervalo` escribes `intervaloRef.current`, y cada copia del componente tiene la suya. La diferencia con el estado es que **React no vigila esos campos**: puedes cambiarlos cuanto quieras, que no va a volver a renderizar nada.

Por dentro no hay magia. React tiene `useRef` como Hook propio porque se usa mucho, pero se podría escribir con `useState`, guardando un objeto y no llamando nunca a `set`:

```jsx
// Solo para entenderlo: usa useRef
function useRefCasero(valorInicial) {
  const [ref] = useState({ current: valorInicial })
  return ref
}
```

`useState` devuelve en cada render el mismo objeto; como nadie llama a `set`, cambiar su `current` no provoca ningún render. Eso es una ref.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Identificadores de temporizadores",
      "texto": "El número que devuelven setTimeout y setInterval, para poder cancelarlos desde otro manejador: un envío con «Deshacer», un cronómetro, un aviso que se reprograma si vuelves a pulsar."
    },
    {
      "titulo": "Lo último, para código que llega tarde",
      "texto": "Un temporizador o una respuesta que debe trabajar con el valor actual y no con el del clic. Se combina con el estado, que es el que pinta."
    },
    {
      "titulo": "Lo que había antes",
      "texto": "El valor de un campo al empezar a editarlo, el momento del último envío para evitar uno doble en menos de un segundo... Siempre que solo lo consulte un manejador."
    },
    {
      "titulo": "Objetos de fuera de React",
      "texto": "Una instancia de una librería de mapas, un reproductor, un controlador para cancelar una petición: cosas que tu componente usa pero no pinta. Si son caras de crear, con la inicialización perezosa."
    },
    {
      "titulo": "Nodos del DOM",
      "texto": "El uso más conocido: guardar un input para enfocarlo o una lista para desplazarte por ella. Es la lección 34 entera."
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
      "mito": "Una ref es estado sin renders: cuantas más, más rápida la app",
      "realidad": "Lo que se ve tiene que ser estado. Con una ref, la pantalla no se entera de los cambios y acabas pintando valores viejos. Las refs son una vía de escape para lo que no se pinta; la mayoría de los componentes no necesitan ninguna."
    },
    {
      "mito": "useRef(0) vuelve a poner current a 0 en cada render",
      "realidad": "El argumento solo cuenta en el primer render, como en useState. Después useRef devuelve siempre el mismo objeto, con lo último que guardaste."
    },
    {
      "mito": "Cambiar ref.current actualiza la pantalla, aunque sea un poco más tarde",
      "realidad": "No la actualiza nunca. Si el número nuevo acaba apareciendo es porque otra cosa provocó un render, como el minuto que cambia o el día elegido en la encuesta."
    },
    {
      "mito": "Las refs son solo para el DOM",
      "realidad": "Guardan cualquier valor: números, textos, objetos, funciones. El DOM es su uso más común, y por eso tiene una lección propia, la 34."
    },
    {
      "mito": "Si la variable va fuera del componente, me ahorro useRef",
      "realidad": "Sobrevive a los renders, pero es una sola para todas las copias del componente: el porche y el garaje se pisan el temporizador."
    }
  ]
}
```

## Errores típicos

**Pintar `ref.current` en el JSX.** El interruptor del pasillo: la ref cambia, la pantalla no. Si se ve, es estado.

**Guardar el identificador en una variable normal.** El «Deshacer» de la comunidad: `let` dentro del componente vuelve a valer `null` en cada render, y `clearTimeout(null)` no se queja.

**Una variable fuera del componente.** Funciona mientras solo haya una copia. Con dos, se pisan.

**Escribir en una ref durante el render**, por ejemplo para contar renders. Con `StrictMode` el número no cuadra, y en producción haría otra cosa. La única escritura admitida es la inicialización perezosa.

**`useRef(crearAlgo())` con algo caro.** Se ejecuta en cada render aunque solo cuente el primero. Empieza en `null` y rellénala una vez.

**Olvidar `.current`.** Este es silencioso. Un metrónomo para una clase de música:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Metronomo() {\n  const [pulsos, setPulsos] = useState(0)\n  const intervaloRef = useRef(null)\n\n  function manejarEmpezar() {\n    intervaloRef.current = setInterval(() => {\n      setPulsos((p) => p + 1)\n    }, 500)\n  }\n\n  function manejarParar() {\n    clearInterval(intervaloRef)\n  }\n\n  return (\n    <main>\n      <p>Pulsos: {pulsos}</p>\n      <button onClick={manejarEmpezar}>Empezar</button>\n      <button onClick={manejarParar}>Parar</button>\n    </main>\n  )\n}\n\n// Pulsas «Empezar» y, al rato, «Parar». ¿Qué pasa?",
  "opciones": [
    "El metrónomo se para",
    "Sale un error: clearInterval necesita un número",
    "No se para, y no sale ningún error",
    "Se para, y empieza de nuevo desde 0"
  ],
  "correcta": 2,
  "explicacion": "clearInterval recibe el objeto ref entero, no el identificador que guarda dentro. El navegador lo convierte en un número que no corresponde a ningún intervalo y no hace nada, sin avisar (comprobado en Chrome). El identificador está en intervaloRef.current. El setPulsos con una función es el de la lección 19: el intervalo no puede fiarse de la foto de pulsos."
}
```

**Pasar una función a `useRef` esperando que la llame.** `useRef(() => new Map())` guarda la función, no el `Map`.

## Ejercicios

El entrenador del club de natación quiere un cronómetro para la calle 3 de la piscina municipal: «Empezar» pone el tiempo a cero, borra las vueltas anteriores y arranca; «Parar» lo congela; «Vuelta» apunta el tiempo que marca en ese momento. El cronómetro casi funciona: arranca bien, pero «Parar» no para, y «Vuelta» todavía no hace nada. Antes de tocar el código, pulsa «Empezar» dos veces seguidas y luego «Parar»: así sabrás qué más tienes que arreglar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El cronómetro de la calle 3",
  "consigna": "Guarda el identificador del intervalo en una ref para que «Parar» funcione, y haz que «Empezar» pare el intervalo anterior si ya había uno. Después añade las vueltas: son un dato que se ve, así que van al estado. «Empezar» las borra. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\n// 1234 ms → «1,2 s» (décimas cumplidas, como un cronómetro de verdad)\nfunction formatear(ms) {\n  const decimas = Math.floor(ms / 100)\n  return `${Math.floor(decimas / 10)},${decimas % 10} s`\n}\n\nexport default function Cronometro() {\n  const [inicio, setInicio] = useState(null)\n  const [ahora, setAhora] = useState(null)\n  // Arréglalo: una variable normal vuelve a valer null en cada render\n  let intervalo = null\n\n  const transcurrido = inicio === null ? 0 : ahora - inicio\n\n  function manejarEmpezar() {\n    setInicio(Date.now())\n    setAhora(Date.now())\n    intervalo = setInterval(() => {\n      setAhora(Date.now())\n    }, 100)\n  }\n\n  function manejarParar() {\n    clearInterval(intervalo)\n  }\n\n  // Falta manejarVuelta: apunta en la lista el tiempo que marca ahora\n\n  return (\n    <main>\n      <h1>Piscina municipal · Calle 3</h1>\n      <p className=\"marcador\">Tiempo: {formatear(transcurrido)}</p>\n      <div>\n        <button onClick={manejarEmpezar}>Empezar</button>\n        <button onClick={manejarParar}>Parar</button>\n        <button>Vuelta</button>\n      </div>\n      <h2>Vueltas</h2>\n      <ol>\n        {/* Una línea por vuelta, con este texto: «Vuelta 1: 0,0 s» */}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\n.marcador {\n  display: inline-block;\n  min-width: 9ch;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #082f49;\n  color: #7dd3fc;\n  font-size: 1.75rem;\n  font-variant-numeric: tabular-nums;\n}\n\nol {\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Empezar», el tiempo avanza",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        }
      ],
      "espera": {
        "texto": "Tiempo: 0,5 s"
      }
    },
    {
      "descripcion": "Al pulsar «Parar», el tiempo se queda quieto",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Parar"
          }
        },
        {
          "teclear": "{Shift>200/}"
        }
      ],
      "espera": {
        "texto": "Tiempo: 0,0 s"
      }
    },
    {
      "descripcion": "Pulsar «Empezar» dos veces no deja un intervalo suelto: «Parar» lo detiene igual",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Parar"
          }
        },
        {
          "teclear": "{Shift>200/}"
        }
      ],
      "espera": {
        "texto": "Tiempo: 0,0 s"
      }
    },
    {
      "descripcion": "«Vuelta» apunta en la lista el tiempo que marca",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vuelta"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Vuelta 1: 0,0 s"
      }
    },
    {
      "descripcion": "Las vueltas se numeran en orden",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vuelta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vuelta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vuelta"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Vuelta 3:"
      }
    },
    {
      "descripcion": "«Empezar» borra las vueltas de la serie anterior",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vuelta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Vuelta"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem"
        }
      }
    }
  ]
}
```

Dos de las comprobaciones esperan un momento después de «Parar» y miran si el tiempo sigue en «0,0 s»: es la forma de saber que el intervalo se ha parado de verdad, porque un intervalo suelto lo habría hecho avanzar.

**Retos para seguir practicando** (sin comprobación automática):

1. Haz que «Parar» y «Seguir» sean el mismo botón: al seguir, el tiempo continúa desde donde se quedó en vez de volver a cero. Pista: guarda cuánto llevabas antes de parar; ¿eso se pinta o no?
2. Junto a cada vuelta, enseña el parcial: lo que ha durado esa vuelta sola. ¿Necesitas una ref o se puede calcular a partir de las vueltas que ya tienes?
3. En el avisador del horno, añade un botón «Cancelar los avisos» que cancele todos los temporizadores pendientes. Pista: una ref puede guardar un array o un `Set` de identificadores.
4. En el panel de domótica, arregla `BotonConRetardo` con una ref y comprueba que el porche y el garaje ya no se pisan. Después, haz que el botón diga «Pendiente…» mientras espera: ¿qué parte va al estado y qué parte se queda en la ref?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Referencing Values with Refs",
      "descripcion": "La página de react.dev de esta lección: el cronómetro original, la comparación con el estado y cuatro retos (el chat que no deshace, el interruptor, los botones que se pisan, leer el último valor).",
      "url": "https://react.dev/learn/referencing-values-with-refs",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useRef",
      "descripcion": "La referencia completa del Hook: parámetros, avisos, la inicialización perezosa y qué hacer si no consigues una ref a tu propio componente.",
      "url": "https://react.dev/reference/react/useRef",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "refs (eslint-plugin-react-hooks)",
      "descripcion": "La regla del linter que avisa cuando lees o escribes una ref durante el render, con ejemplos válidos e inválidos y cómo detecta qué es una ref.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/refs",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: guardar información de renders anteriores",
      "descripcion": "Cuando necesitas pintar algo que depende del valor anterior, la forma recomendada es con estado, no con una ref.",
      "url": "https://react.dev/reference/react/useState#storing-information-from-previous-renders",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "setInterval()",
      "descripcion": "Cómo funcionan los intervalos del navegador, qué devuelve setInterval y cómo se cancela con clearInterval.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval",
      "etiqueta": "MDN"
    }
  ]
}
```
