# Sincronizar con efectos

- **Módulo:** Efectos
- **Slug:** `sincronizar-con-efectos` (autogenerado del título)
- **Orden:** 380
- **Fuentes:** [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) + [useEffect](https://react.dev/reference/react/useEffect) — ver `contenido/react/TEMARIO.md` #38

---

## Qué es y para qué sirve

Hasta ahora, tu código en un componente vivía en dos sitios:

- **El render**: calcula qué se ve a partir de las props y del estado. Tiene que ser puro, como una fórmula (lección 12): nada de tocar el DOM, pedir datos o poner temporizadores.
- **Los manejadores de eventos**: hacen cosas porque el usuario ha hecho algo concreto, como pulsar «Comprar» o escribir en un campo (lección 15). Ahí sí caben los efectos secundarios.

Falta un tercer caso: código que tiene que ejecutarse **porque el componente está en pantalla**, sin que nadie haya pulsado nada. La ficha de una pista de esquí tiene que pedir sus datos al servidor en cuanto aparece, la traiga el clic que la traiga. Un reloj tiene que ponerse en marcha al mostrarse y pararse al desaparecer. Para eso existen los **efectos**, que se declaran con el Hook `useEffect`.

**Un efecto mantiene tu componente sincronizado con un sistema externo**: cualquier cosa que React no controla. Un temporizador del navegador, un evento de `window`, un widget escrito sin React, una conexión o el servidor al que le pides datos. React ejecuta el efecto **al final del commit**, cuando el DOM ya está al día (lección 17), y te deja decir cuándo repetirlo y cómo deshacerlo.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres sitios para tu código, según por qué se ejecuta",
  "roles": [
    {
      "etiqueta": "Render",
      "rol": "Calcula qué se ve",
      "descripcion": "Se ejecuta cada vez que React necesita saber cómo debe verse el componente. Tiene que ser puro: mismas props y estado, mismo JSX, y nada más."
    },
    {
      "etiqueta": "Manejador",
      "rol": "Responde a algo que hizo el usuario",
      "descripcion": "Se ejecuta porque alguien pulsó, escribió o envió. Sabe exactamente qué pasó, y ahí van los efectos secundarios de esa acción."
    },
    {
      "etiqueta": "Efecto",
      "rol": "Sincroniza con algo de fuera",
      "descripcion": "Se ejecuta porque el componente se ha mostrado o ha cambiado algo de lo que depende: conectarse, suscribirse, poner un temporizador, pedir datos."
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Antes de escribir un efecto",
  "contenido": "Un efecto es una vía de escape: sirve para salir de React y hablar con algo de fuera. Si lo que quieres es calcular un dato a partir de otros, o reaccionar a un clic, casi seguro que no lo necesitas. La lección 39 está dedicada a esos casos, que son muchos."
}
```

Escribir un efecto tiene **tres pasos**, y esta lección los recorre en orden:

1. **Declarar el efecto.** Por defecto, React lo ejecuta después de cada commit.
2. **Decir de qué depende.** Casi todos deben repetirse solo cuando cambia algo concreto, no en cada render.
3. **Añadir la limpieza si hace falta.** Lo que el efecto pone en marcha (un intervalo, un escuchador, una petición), la limpieza lo para.

Los ejemplos son de la web de la estación de esquí Puerto Blanco, y debajo de cada vista previa tienes el **registro de efectos**: una línea cada vez que React ejecuta un efecto o su limpieza, agrupadas por commit y con el motivo.

## Paso 1: declarar el efecto

En la entrada de la estación hay un rótulo luminoso. Su fabricante da una librería de JavaScript **sin React** con una sola función, `pintarRotulo(nodo, texto)`, que llena un nodo del DOM de bombillas con las letras del mensaje. La web quiere un componente `<Rotulo texto="..." />` que mantenga el rótulo de acuerdo con su prop.

El primer intento es llamar a la librería directamente desde el componente:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useRef } from 'react'\nimport { pintarRotulo } from './rotulo-luminoso'\n\nfunction Rotulo({ texto }) {\n  const nodoRef = useRef(null)\n\n  // El rótulo, pintado mientras React renderiza\n  pintarRotulo(nodoRef.current, texto)\n\n  return <div ref={nodoRef} className=\"rotulo\" role=\"img\" aria-label={texto} />\n}\n\n// <Rotulo texto=\"Bienvenidos a Puerto Blanco\" />\n// ¿Qué pasa al cargar la página?",
  "opciones": [
    "El rótulo se enciende con «BIENVENIDOS A PUERTO BLANCO»",
    "La app se cae con «Cannot read properties of null (reading 'replaceChildren')»",
    "El rótulo aparece vacío y se enciende en el siguiente render"
  ],
  "correcta": 1,
  "explicacion": "En el primer render el div todavía no existe: React lo creará con el JSX que devuelva esta función, así que nodoRef.current vale null (lección 34) y la librería falla al usarlo. Y aunque el nodo existiera, tocar el DOM durante el render rompe la regla de los componentes puros (lección 12)."
}
```

La llamada a la librería no es un cálculo: **cambia algo fuera de React**, así que no puede ir en el render. Tampoco hay ningún clic al que asociarla: el rótulo tiene que mostrar el mensaje porque el componente está en pantalla. Es trabajo de un efecto.

`useEffect` recibe una función y **retrasa su ejecución hasta que React ha terminado el commit**: el `div` ya está en el DOM, `nodoRef.current` apunta a él y la librería puede hacer su trabajo. Elige otro mensaje en la vista previa y mira el registro de efectos y la consola. Este bloque tiene `StrictMode` apagado para que cada ejecución salga una sola vez; lo encenderás en el paso 3.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El rótulo, sincronizado con un efecto",
  "codigo": "import { useEffect, useRef, useState } from 'react'\n\n// Hace de librería del fabricante: JavaScript sin React.\n// En un proyecto real vendría de npm.\nfunction pintarRotulo(nodo, texto) {\n  console.log(`rótulo: pinto «${texto}»`)\n  const bombillas = [...texto.toUpperCase()].map((letra) => {\n    const bombilla = document.createElement('span')\n    bombilla.className = 'bombilla'\n    bombilla.textContent = letra\n    return bombilla\n  })\n  nodo.replaceChildren(...bombillas)\n}\n\nfunction Rotulo({ texto }) {\n  const nodoRef = useRef(null)\n\n  useEffect(() => {\n    pintarRotulo(nodoRef.current, texto)\n  })\n\n  return <div ref={nodoRef} className=\"rotulo\" role=\"img\" aria-label={texto} />\n}\n\nconst MENSAJES = [\n  'Bienvenidos a Puerto Blanco',\n  'Nieve polvo en la Umbría',\n  'Viento: telesilla del Lago cerrado',\n]\n\nexport default function App() {\n  const [mensaje, setMensaje] = useState(MENSAJES[0])\n\n  return (\n    <main>\n      <h1>Estación de esquí Puerto Blanco</h1>\n      <label>\n        Mensaje del rótulo{' '}\n        <select value={mensaje} onChange={(e) => setMensaje(e.target.value)}>\n          {MENSAJES.map((texto) => (\n            <option key={texto}>{texto}</option>\n          ))}\n        </select>\n      </label>\n      <Rotulo texto={mensaje} />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\ninput,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.rotulo {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  min-height: 2rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n}\n\n.bombilla {\n  min-width: 0.7em;\n  color: #fbbf24;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-shadow: 0 0 6px #f59e0b;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.reloj {\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}",
  "anotaciones": [
    {
      "fragmento": "function pintarRotulo(nodo, texto)",
      "nota": "Para React, esta función es un sistema externo: no sabe nada de props ni de estado, solo rellena un nodo del DOM. El trabajo del componente es mantenerla de acuerdo con su prop texto."
    },
    {
      "fragmento": "useEffect(() => {",
      "nota": "useEffect se llama en el nivel superior del componente, como cualquier Hook. Recibe una función que React guarda y ejecuta después del commit, con la pantalla ya actualizada. Sin segundo argumento, lo hace después de cada commit del componente."
    },
    {
      "fragmento": "pintarRotulo(nodoRef.current, texto)",
      "nota": "Cuando el efecto se ejecuta, nodoRef.current ya es el div. Cada render trae su propio efecto con el texto de ese render: al elegir otro mensaje, React ejecuta el efecto nuevo con el texto nuevo."
    },
    {
      "fragmento": "<div ref={nodoRef} className=\"rotulo\" role=\"img\" aria-label={texto} />",
      "nota": "Un div sin hijos en el JSX: React no tiene nada que pintar dentro, así que la librería puede llenarlo a su manera sin pelearse con él (lección 34). role img y aria-label hacen que un lector de pantalla lea el mensaje entero y no letra a letra."
    }
  ],
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Al cargar, el registro dice «commit 1 · Rotulo ▶ efecto · montaje»: el componente acaba de aparecer y su efecto se ha ejecutado por primera vez. Cada vez que eliges otro mensaje aparece un commit nuevo con «▶ efecto · se ejecuta en cada render», y la consola cuenta que la librería ha vuelto a pintar.

El orden es siempre el mismo: **React renderiza, actualiza el DOM y después ejecuta los efectos**. Por eso un efecto puede usar los nodos del DOM. Y por eso, si un efecto cambia el estado, provoca un render más justo después: la lección 39 explica por qué eso casi nunca compensa.

## Paso 2: decir de qué depende el efecto

Sin segundo argumento, el efecto se ejecuta **después de cada commit** del componente. A veces es lento (no quieres reconectar con un servidor a cada tecla) y a veces es incorrecto (una animación de entrada no debe repetirse cada vez que algo cambia). Aquí la web tiene además un campo para el nombre del forfait, que no tiene nada que ver con el rótulo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un rótulo que se repinta a cada tecla",
  "consigna": "Escribe tu nombre en «Nombre para el forfait». El rótulo no cambia, pero la consola y el registro dicen que se ha vuelto a pintar con cada letra. En Rotulo.jsx, añade [texto] como segundo argumento de useEffect, vuelve a escribir y después elige otro mensaje: ahora solo se pinta cuando cambia el texto, y el registro dice qué cambió.",
  "archivos": [
    {
      "nombre": "Rotulo.jsx",
      "codigo": "import { useEffect, useRef } from 'react'\nimport { pintarRotulo } from './rotulo-luminoso'\n\nexport default function Rotulo({ texto }) {\n  const nodoRef = useRef(null)\n\n  // Sin lista de dependencias: se ejecuta después de cada commit\n  useEffect(() => {\n    pintarRotulo(nodoRef.current, texto)\n  })\n\n  return <div ref={nodoRef} className=\"rotulo\" role=\"img\" aria-label={texto} />\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Rotulo from './Rotulo'\nimport './estilos.css'\n\nconst MENSAJES = [\n  'Bienvenidos a Puerto Blanco',\n  'Nieve polvo en la Umbría',\n  'Viento: telesilla del Lago cerrado',\n]\n\nexport default function App() {\n  const [mensaje, setMensaje] = useState(MENSAJES[0])\n  const [nombre, setNombre] = useState('')\n\n  return (\n    <main>\n      <h1>Estación de esquí Puerto Blanco</h1>\n      <label>\n        Mensaje del rótulo{' '}\n        <select value={mensaje} onChange={(e) => setMensaje(e.target.value)}>\n          {MENSAJES.map((texto) => (\n            <option key={texto}>{texto}</option>\n          ))}\n        </select>\n      </label>\n      <Rotulo texto={mensaje} />\n      <label>\n        Nombre para el forfait{' '}\n        <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n      </label>\n      <p>Forfait a nombre de: {nombre || '(sin nombre)'}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "rotulo-luminoso.jsx",
      "codigo": "// Hace de librería del fabricante del rótulo: JavaScript sin React.\n// Solo sabe una cosa: llenar un nodo del DOM de «bombillas».\nexport function pintarRotulo(nodo, texto) {\n  console.log(`rótulo: pinto «${texto}»`)\n  const bombillas = [...texto.toUpperCase()].map((letra) => {\n    const bombilla = document.createElement('span')\n    bombilla.className = 'bombilla'\n    bombilla.textContent = letra\n    return bombilla\n  })\n  nodo.replaceChildren(...bombillas)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\ninput,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.rotulo {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  min-height: 2rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n}\n\n.bombilla {\n  min-width: 0.7em;\n  color: #fbbf24;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-shadow: 0 0 6px #f59e0b;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.reloj {\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "archivoInicial": "Rotulo.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

El segundo argumento de `useEffect` es la **lista de dependencias**: los valores de los que depende el efecto. Con `[texto]`, React compara el `texto` de este render con el del commit anterior (con `Object.is`, uno a uno) y, si todos son iguales, **se salta el efecto**. Escribir en el campo vuelve a renderizar `Rotulo`, pero su `texto` es el mismo y el efecto no se ejecuta. Al elegir otro mensaje, el registro lo explica con todas las letras: «▶ efecto · cambió texto: "Bienvenidos a Puerto Blanco" → "Nieve polvo en la Umbría"».

**Las dependencias no se eligen: las dicta el código del efecto.** Si el efecto usa `texto`, `texto` va en la lista. El linter de React (`eslint-plugin-react-hooks`, con su regla `exhaustive-deps`) lo comprueba por ti; en Oxlint, el linter que propone Vite, la misma regla se llama `react/exhaustive-deps` y hay que activarla. Si dejas la lista vacía en este rótulo, `eslint-plugin-react-hooks` te lo dice así:

```text
React Hook useEffect has a missing dependency: 'texto'. Either include it or remove the dependency array.
```

Es decir: el efecto usa `texto` y no está en la lista; o lo añades, o quitas la lista entera. ¿Y `nodoRef`? No hace falta: React te da **la misma ref en cada render**, así que nunca puede cambiar y nunca dispararía el efecto. Lo mismo pasa con las funciones `set` de `useState`. Qué cuenta exactamente como valor del que se depende lo verás en la lección 40, y qué hacer cuando una dependencia te sobra, en la 42.

## `[]`, `[a, b]` o nada: tres formas de decir cuándo

La diferencia entre no pasar lista y pasar una vacía es enorme, y es la confusión más común con los efectos:

```jsx
useEffect(() => {
  // Después de cada commit del componente
})

useEffect(() => {
  // Solo al montarse: cuando el componente aparece en pantalla
}, [])

useEffect(() => {
  // Al montarse, y después de cada commit en que cambió zona o fecha
}, [zona, fecha])
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Galeria({ zona }) {\n  const [foto, setFoto] = useState(1)\n\n  useEffect(() => {\n    console.log('A')\n  }, [])\n\n  useEffect(() => {\n    console.log('B')\n  })\n\n  useEffect(() => {\n    console.log('C')\n  }, [zona])\n\n  return (\n    <button onClick={() => setFoto(foto + 1)}>\n      Siguiente foto ({foto})\n    </button>\n  )\n}\n\n// <Galeria zona=\"Solana\" /> ya está en pantalla (sin StrictMode).\n// Pulsas «Siguiente foto». ¿Qué escribe la consola?",
  "opciones": [
    "B",
    "A, B y C",
    "B y C",
    "Nada: ningún efecto depende de foto"
  ],
  "correcta": 0,
  "explicacion": "El clic cambia foto, y Galeria vuelve a renderizar. A tiene [] y ya se ejecutó al montarse; C depende de zona, que sigue valiendo \"Solana\". Solo B, que no tiene lista, se ejecuta tras cada commit. Fíjate en la última opción: B no depende de nada, y precisamente por eso se ejecuta siempre, porque sin lista React no tiene con qué comparar."
}
```

Y una matización importante: `[]` significa «no depende de nada que pueda cambiar», no «una sola vez y ya». Si el componente desaparece y vuelve a aparecer, el efecto se ejecuta otra vez. Y en desarrollo, como verás enseguida, se ejecuta dos veces nada más montarse.

## Paso 3: la limpieza

En la lección 33 dejaste un hueco abierto: un intervalo que nadie para cuando el componente desaparece de la pantalla. Aquí lo cierras. La pista de trineos vende bonos de 30 minutos, y la web enseña cuánto te queda con un intervalo que descuenta un segundo cada segundo. Este bloque ya tiene `StrictMode` encendido, como cualquier proyecto creado con Vite:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un bono que descuenta de dos en dos",
  "consigna": "Pulsa «Ver mi bono» y mira el reloj: baja dos segundos cada segundo. El registro dice que el efecto se ha ejecutado dos veces y que no hubo ninguna limpieza. Pulsa «Ocultar mi bono»: la consola sigue escribiendo «tic». Arréglalo en Bono.jsx: guarda el identificador que devuelve setInterval y devuelve desde el efecto una función que llame a clearInterval. Prueba otra vez los dos botones.",
  "archivos": [
    {
      "nombre": "Bono.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\n// 1799 → «29:59»\nfunction formatear(segundos) {\n  const minutos = Math.floor(segundos / 60)\n  return `${minutos}:${String(segundos % 60).padStart(2, '0')}`\n}\n\nexport default function Bono() {\n  const [segundos, setSegundos] = useState(30 * 60)\n\n  useEffect(() => {\n    console.log('Pongo en marcha el descuento')\n    setInterval(() => {\n      console.log('tic')\n      setSegundos((s) => s - 1)\n    }, 1000)\n  }, [])\n\n  return <p className=\"reloj\">Te quedan {formatear(segundos)}</p>\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Bono from './Bono'\nimport './estilos.css'\n\nexport default function App() {\n  const [visible, setVisible] = useState(false)\n\n  return (\n    <main>\n      <h1>Pista de trineos · Bono de 30 minutos</h1>\n      <button onClick={() => setVisible(!visible)}>\n        {visible ? 'Ocultar mi bono' : 'Ver mi bono'}\n      </button>\n      {visible && <Bono />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\ninput,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.rotulo {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  min-height: 2rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n}\n\n.bombilla {\n  min-width: 0.7em;\n  color: #fbbf24;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-shadow: 0 0 6px #f59e0b;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.reloj {\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "archivoInicial": "Bono.jsx",
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

El arreglo cabe en dos líneas:

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setSegundos((s) => s - 1)
  }, 1000)
  return () => clearInterval(id)
}, [])
```

**La función que devuelve el efecto es su limpieza.** React la llama antes de volver a ejecutar el efecto (cuando cambia una dependencia) y una última vez cuando el componente desaparece. Con ella, el registro cuenta la historia completa: al pulsar «Ver mi bono», «▶ efecto · montaje», «⟲ limpieza» y «▶ efecto · repetido por StrictMode», los tres en el mismo commit; al pulsar «Ocultar mi bono», «⟲ limpieza · desmontaje», y la consola deja de escribir «tic». Es lo mismo que hacía, sin explicarlo, el Hook `useHora` de la lección 17.

Dos detalles del arreglo. `setSegundos((s) => s - 1)` usa la función de actualización de la lección 19, así que el efecto no lee `segundos` y la lista vacía es correcta. Con `setSegundos(segundos - 1)` tendrías que poner `[segundos]`, y el intervalo se destruiría y se crearía de nuevo cada segundo (la lección 42 vuelve sobre ello). Y la limpieza tiene que **deshacer exactamente lo que hizo el efecto**: el mismo intervalo, el mismo escuchador, la misma conexión.

## Por qué en desarrollo se ejecuta dos veces

¿Qué ha pasado con el bono sin limpieza? En desarrollo, con `StrictMode`, **React monta cada componente, lo desmonta y lo vuelve a montar** nada más aparecer. Con los efectos, eso es: efecto, limpieza, efecto. El estado y el DOM se conservan; lo que se repite son los efectos (ya viste en la lección 12 que `StrictMode` también renderiza dos veces).

Lo hace a propósito: simula que el usuario se va de la pantalla y vuelve. Si tu efecto no sabe deshacerse, el fallo sale ahora, en tu ordenador, y no cuando alguien navegue por la app de verdad: el bono sin limpieza descontaba doble, igual que acumularía intervalos cada vez que alguien entrara y saliera de la pantalla del bono. En producción no hay ensayo, y el efecto se ejecuta una vez.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function conectarSensor(lugar) {\n  console.log(`Conectado al sensor de ${lugar}`)\n  return {\n    desconectar: () => console.log(`Desconectado del sensor de ${lugar}`),\n  }\n}\n\nfunction EspesorNieve() {\n  useEffect(() => {\n    const sensor = conectarSensor('la cumbre')\n    return () => sensor.desconectar()\n  }, [])\n\n  return <p>Espesor de nieve en la cumbre</p>\n}\n\n// En desarrollo, con StrictMode. ¿Qué escribe la consola al cargar?",
  "opciones": [
    "Conectado al sensor de la cumbre",
    "Conectado… y Conectado…",
    "Conectado…, Desconectado… y Conectado…",
    "Desconectado… y Conectado…"
  ],
  "correcta": 2,
  "explicacion": "StrictMode ejecuta el efecto, su limpieza y otra vez el efecto. Como la limpieza deshace la conexión, al final hay una sola conexión abierta, igual que en producción. Esa es la prueba que hay que superar: que el usuario no note la diferencia entre ejecutar el efecto una vez y hacer efecto, limpieza y efecto."
}
```

En el registro de efectos lo reconocerás siempre así, las tres líneas en el mismo commit:

```text
commit 1
EspesorNieve ▶ efecto · montaje
EspesorNieve ⟲ limpieza
EspesorNieve ▶ efecto · repetido por StrictMode
```

Si el efecto no devuelve limpieza, la línea del medio no sale: el registro solo apunta limpiezas que existen. Eso es justo lo que veías en el bono roto: dos efectos y ninguna limpieza.

**La pregunta correcta no es «cómo hago que el efecto se ejecute una vez», sino «cómo hago que funcione después de volver a montarse».** Casi siempre la respuesta es escribir la limpieza. Y hay una tentación que conviene reconocer:

```jsx
const conectadoRef = useRef(false)

useEffect(() => {
  // 🚩 Así no: esconde el aviso, pero no arregla nada
  if (conectadoRef.current) return
  conectadoRef.current = true
  conectarSensor('la cumbre')
}, [])
```

La consola enseña un solo «Conectado», pero la conexión **nunca se cierra**: si el usuario sale de la pantalla y vuelve, se abre otra, y otra. Has quitado la pista que te daba `StrictMode`, no el fallo. Apagar `StrictMode` tiene el mismo problema; la lección 63 lo cuenta a fondo.

Casi todos los efectos que escribirás encajan en uno de estos patrones de limpieza:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un widget de fuera de React",
      "texto": "Pintar el rótulo o fijar el zoom de un mapa dos veces con el mismo valor no se nota: a menudo no hace falta limpieza. Si la API no admite dos llamadas seguidas (abrir un diálogo con showModal, por ejemplo), la limpieza lo cierra."
    },
    {
      "titulo": "Suscribirse a un evento",
      "texto": "addEventListener en el efecto y removeEventListener en la limpieza, con la misma función. Así nunca hay dos escuchadores a la vez."
    },
    {
      "titulo": "Temporizadores",
      "texto": "setInterval o setTimeout en el efecto, clearInterval o clearTimeout en la limpieza, con el identificador que devolvieron."
    },
    {
      "titulo": "Animaciones",
      "texto": "Si el efecto lleva algo a su estado final (opacidad 1, por ejemplo), la limpieza lo devuelve al inicial."
    },
    {
      "titulo": "Pedir datos",
      "texto": "La limpieza cancela la petición con un AbortController o marca que su respuesta ya no interesa. Lo ves en la sección siguiente."
    },
    {
      "titulo": "Analítica de visitas",
      "texto": "Enviar dos veces «han visto la ficha» en desarrollo no lo nota ningún usuario, y además en desarrollo no deberías mandar nada a tus estadísticas reales. Se deja tal cual."
    },
    {
      "titulo": "Comprar, inscribirse, enviar",
      "texto": "No son efectos: no pasan porque se vea una pantalla, sino porque alguien pulsó un botón. Van en el manejador, y la lección 39 explica por qué."
    }
  ]
}
```

## Pedir datos al servidor con `fetch`

La ficha de cada pista vive en el servidor de la estación. Pedirla es el caso más típico de efecto: la ficha tiene que estar sincronizada con la pista elegida, la elija el usuario con un botón, con un enlace o volviendo atrás en el navegador.

Los bloques de esta sección usan la **API simulada** de la vista previa: `fetch('/api/pistas/roca-negra')` devuelve una respuesta de verdad, con su retraso. Debajo de la vista previa sale el **panel de red**: una línea por petición con su estado, un deslizante para la latencia, el interruptor «Responder desordenado» (dos peticiones seguidas llegan al revés: la última, primero) y el botón «Fallar la siguiente petición».

Este es el primer intento, el que escribe casi todo el mundo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ficha sin limpieza",
  "consigna": "Al cargar, mira el panel de red: dos peticiones completas a la misma pista, una por cada montaje de StrictMode. Ahora sube la latencia a 2 s, activa «Responder desordenado» y pulsa «El Cervunal» y enseguida «Los Sarrios». Mientras esperas, la ficha anterior sigue a la vista; y al final enseña El Cervunal aunque has elegido Los Sarrios.",
  "archivos": [
    {
      "nombre": "FichaPista.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function FichaPista({ pistaId }) {\n  const [pista, setPista] = useState(null)\n\n  useEffect(() => {\n    fetch(`/api/pistas/${pistaId}`)\n      .then((respuesta) => respuesta.json())\n      .then((datos) => setPista(datos))\n  }, [pistaId])\n\n  if (pista === null) return <p>Cargando la ficha…</p>\n\n  return (\n    <article className=\"ficha\">\n      <h2>{pista.nombre}</h2>\n      <p>Pista {pista.dificultad} · {pista.estado}</p>\n      <p>Nieve: {pista.nieve}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaPista from './FichaPista'\nimport './estilos.css'\n\nconst PISTAS = [\n  { id: 'roca-negra', nombre: 'Roca Negra' },\n  { id: 'el-cervunal', nombre: 'El Cervunal' },\n  { id: 'los-sarrios', nombre: 'Los Sarrios' },\n]\n\nexport default function App() {\n  const [pistaId, setPistaId] = useState('roca-negra')\n  const elegida = PISTAS.find((pista) => pista.id === pistaId)\n\n  return (\n    <main>\n      <h1>Pistas de Puerto Blanco</h1>\n      <div>\n        {PISTAS.map((pista) => (\n          <button\n            key={pista.id}\n            aria-pressed={pista.id === pistaId}\n            onClick={() => setPistaId(pista.id)}\n          >\n            {pista.nombre}\n          </button>\n        ))}\n      </div>\n      <p>Has elegido: {elegida.nombre}</p>\n      <FichaPista pistaId={pistaId} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\ninput,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.rotulo {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  min-height: 2rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n}\n\n.bombilla {\n  min-width: 0.7em;\n  color: #fbbf24;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-shadow: 0 0 6px #f59e0b;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.reloj {\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "archivoInicial": "FichaPista.jsx",
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "pistas": [
      {
        "id": "roca-negra",
        "nombre": "Roca Negra",
        "dificultad": "negra",
        "estado": "abierta",
        "nieve": "polvo, 40 cm"
      },
      {
        "id": "el-cervunal",
        "nombre": "El Cervunal",
        "dificultad": "azul",
        "estado": "abierta",
        "nieve": "primavera, 25 cm"
      },
      {
        "id": "los-sarrios",
        "nombre": "Los Sarrios",
        "dificultad": "roja",
        "estado": "cerrada por viento",
        "nieve": "dura, 30 cm"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Cada clic cambia `pistaId`, y cada cambio lanza **una petición que nadie cancela**. Las respuestas pueden llegar en cualquier orden, y la última en llegar gana aunque sea de una pista que ya no te interesa. Es una **condición de carrera**, el mismo fallo que arreglaste a mano en el proyecto 78 de JavaScript.

La limpieza es el sitio para decir «esta petición ya no me interesa». El navegador trae la herramienta: un **`AbortController`**. Le pasas su `signal` a `fetch` y, cuando llamas a `abort()`, la petición se cancela y su promesa se rechaza con un error llamado `AbortError`. Esta es la ficha bien hecha. Prueba lo mismo que antes, y además pulsa «Fallar la siguiente petición» y elige otra pista:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La ficha que cancela lo que ya no le sirve",
  "codigo": "import { useEffect, useState } from 'react'\n\nfunction FichaPista({ pistaId }) {\n  // La respuesta recuerda de qué pista es: { pistaId, pista } o { pistaId, error }\n  const [respuesta, setRespuesta] = useState(null)\n\n  useEffect(() => {\n    const controlador = new AbortController()\n\n    fetch(`/api/pistas/${pistaId}`, { signal: controlador.signal })\n      .then((res) => {\n        if (!res.ok) throw new Error(`el servidor respondió ${res.status}`)\n        return res.json()\n      })\n      .then((pista) => setRespuesta({ pistaId, pista }))\n      .catch((error) => {\n        if (error.name === 'AbortError') return // la cancelamos nosotros\n        setRespuesta({ pistaId, error: error.message })\n      })\n\n    return () => controlador.abort()\n  }, [pistaId])\n\n  if (respuesta?.pistaId !== pistaId) return <p>Cargando la ficha…</p>\n  if (respuesta.error) {\n    return <p role=\"alert\">No se pudo cargar la ficha: {respuesta.error}</p>\n  }\n\n  const { pista } = respuesta\n  return (\n    <article className=\"ficha\">\n      <h2>{pista.nombre}</h2>\n      <p>Pista {pista.dificultad} · {pista.estado}</p>\n      <p>Nieve: {pista.nieve}</p>\n    </article>\n  )\n}\n\nconst PISTAS = [\n  { id: 'roca-negra', nombre: 'Roca Negra' },\n  { id: 'el-cervunal', nombre: 'El Cervunal' },\n  { id: 'los-sarrios', nombre: 'Los Sarrios' },\n]\n\nexport default function App() {\n  const [pistaId, setPistaId] = useState('roca-negra')\n  const elegida = PISTAS.find((pista) => pista.id === pistaId)\n\n  return (\n    <main>\n      <h1>Pistas de Puerto Blanco</h1>\n      <div>\n        {PISTAS.map((pista) => (\n          <button\n            key={pista.id}\n            aria-pressed={pista.id === pistaId}\n            onClick={() => setPistaId(pista.id)}\n          >\n            {pista.nombre}\n          </button>\n        ))}\n      </div>\n      <p>Has elegido: {elegida.nombre}</p>\n      <FichaPista pistaId={pistaId} />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\ninput,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.rotulo {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  min-height: 2rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n}\n\n.bombilla {\n  min-width: 0.7em;\n  color: #fbbf24;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-shadow: 0 0 6px #f59e0b;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.reloj {\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}",
  "anotaciones": [
    {
      "fragmento": "const controlador = new AbortController()",
      "nota": "Cada ejecución del efecto crea su propio controlador, ligado a su propia petición. Es la pieza que permite a la limpieza cancelar justo esta petición y ninguna otra."
    },
    {
      "fragmento": "{ signal: controlador.signal }",
      "nota": "La señal conecta el controlador con fetch. Cuando alguien llame a controlador.abort(), el navegador corta la petición y la promesa de fetch se rechaza."
    },
    {
      "fragmento": "if (!res.ok) throw new Error(`el servidor respondió ${res.status}`)",
      "nota": "fetch solo rechaza si la red falla o si cancelas. Un 404 o un 500 llegan como respuesta normal, con res.ok a false: hay que convertirlos en error a mano para que acaben en el catch."
    },
    {
      "fragmento": "if (error.name === 'AbortError') return",
      "nota": "Cancelar no es un fallo: es lo que has pedido. Sin esta línea, cada cambio rápido de pista enseñaría un aviso de error de la petición que tú mismo cancelaste."
    },
    {
      "fragmento": "return () => controlador.abort()",
      "nota": "La limpieza cancela la petición de este efecto. React la llama antes de ejecutar el efecto de la pista nueva, al desmontar la ficha y, en desarrollo, en el ensayo de StrictMode: por eso al cargar verás una petición cancelada a los pocos milisegundos."
    },
    {
      "fragmento": "if (respuesta?.pistaId !== pistaId) return <p>Cargando la ficha…</p>",
      "nota": "Si la respuesta que hay guardada no es de la pista elegida, todavía no ha llegado la buena: se está cargando. Se calcula durante el render, sin un estado cargando aparte que el efecto tenga que poner a true (la lección 39 explica por qué conviene así)."
    },
    {
      "fragmento": "<p role=\"alert\">",
      "nota": "Con «Fallar la siguiente petición», el servidor simulado responde 500 y el error llega aquí. role alert hace que el lector de pantalla lo anuncie (lección 37)."
    }
  ],
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "pistas": [
      {
        "id": "roca-negra",
        "nombre": "Roca Negra",
        "dificultad": "negra",
        "estado": "abierta",
        "nieve": "polvo, 40 cm"
      },
      {
        "id": "el-cervunal",
        "nombre": "El Cervunal",
        "dificultad": "azul",
        "estado": "abierta",
        "nieve": "primavera, 25 cm"
      },
      {
        "id": "los-sarrios",
        "nombre": "Los Sarrios",
        "dificultad": "roja",
        "estado": "cerrada por viento",
        "nieve": "dura, 30 cm"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Lo que verás en el panel de red al cargar la página:

```text
GET /api/pistas/roca-negra · cancelada · 1 ms
GET /api/pistas/roca-negra · 200 · 805 ms
```

Los milisegundos cambiarán un poco de una vez a otra. La primera es la del ensayo de `StrictMode`: efecto, limpieza (que la cancela) y efecto otra vez. En producción solo habría la segunda. Y al pulsar deprisa dos pistas, la del medio sale «cancelada»: su respuesta ya no puede pisar a nadie. En el registro de efectos, cada cambio es una pareja en el mismo commit: «⟲ limpieza» y «▶ efecto · cambió pistaId: "roca-negra" → "el-cervunal"». **React siempre limpia el efecto anterior antes de ejecutar el siguiente**, así que nunca hay dos peticiones vivas para la misma ficha.

La documentación de React escribe a menudo esta misma limpieza con una variable en lugar de un controlador. No cancela la petición, pero **ignora su respuesta**, y protege también si después del `fetch` encadenas más pasos asíncronos:

```jsx
useEffect(() => {
  let ignorar = false

  async function cargar() {
    const res = await fetch(`/api/pistas/${pistaId}`)
    const pista = await res.json()
    if (!ignorar) setRespuesta({ pistaId, pista })
  }

  cargar()
  return () => {
    ignorar = true
  }
}, [pistaId])
```

Fíjate también en la forma de usar `async`: la función asíncrona se declara **dentro** del efecto y se llama ahí mismo. El efecto en sí no puede ser `async` (lo verás en «Errores típicos»).

Pedir datos en un efecto funciona, pero tiene más costuras de las que parece: no hay caché si vuelves a la misma pista, los efectos no se ejecutan en el servidor y un hijo no empieza a pedir lo suyo hasta que su padre ha terminado. La lección 52 compara esta forma con `use` y Suspense y con una librería como TanStack Query, y vuelve sobre las carreras de peticiones.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Integrar un widget que no es de React",
      "texto": "Un mapa, un editor de texto enriquecido, un gráfico o un reproductor: el efecto les pasa los datos de React cada vez que cambian, y la limpieza los destruye si hace falta."
    },
    {
      "titulo": "Escuchar algo del navegador",
      "texto": "El teclado, el tamaño de la ventana, el desplazamiento o si hay conexión: addEventListener en el efecto y removeEventListener en la limpieza. Para leer un valor externo que cambia, como navigator.onLine, React tiene un Hook específico, useSyncExternalStore (lección 46)."
    },
    {
      "titulo": "Temporizadores mientras algo está a la vista",
      "texto": "Una cuenta atrás, un reloj, un carrusel que avanza solo. Se paran en la limpieza al desmontar."
    },
    {
      "titulo": "Conexiones",
      "texto": "Un WebSocket, una sala de chat o una suscripción a un servicio en tiempo real, que hay que abrir al mostrarse y cerrar al irse o al cambiar de sala. La lección 40 trata este caso a fondo."
    },
    {
      "titulo": "Pedir datos en una app sin framework",
      "texto": "Con su limpieza y su estado de error, como la ficha de la pista. Si tu proyecto usa un framework o TanStack Query, deja que ellos pidan los datos (lección 52)."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Calcular un dato a partir de otros, reiniciar un formulario, avisar al padre o enviar un formulario. Ninguno habla con un sistema externo, y la lección 39 enseña a hacerlos sin efectos."
    }
  ]
}
```

## Errores típicos

**Un efecto sin lista que cambia el estado.** Es el bucle más famoso de React:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function ContadorVisitas() {\n  const [visitas, setVisitas] = useState(0)\n\n  useEffect(() => {\n    setVisitas(visitas + 1)\n  })\n\n  return <p>{visitas} visitas a la ficha</p>\n}\n\n// ¿Qué pasa al mostrar el componente?",
  "opciones": [
    "Enseña «1 visitas a la ficha»",
    "Enseña «2 visitas…», por StrictMode",
    "El número no para de subir y la consola se llena de avisos"
  ],
  "correcta": 2,
  "explicacion": "El efecto cambia el estado, el cambio provoca un render, y tras cada render se ejecuta el efecto, que vuelve a cambiar el estado. Es un enchufe conectado a sí mismo. React no tumba la app, pero avisa en la consola una y otra vez de que se ha superado la profundidad máxima de actualizaciones."
}
```

El aviso, que ya conoces de la lección 64, es este:

```text
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

Es decir: un componente cambia su estado dentro de `useEffect`, y el efecto o no tiene lista de dependencias o tiene una que cambia en cada render. Ponerle `[]` para que pare es tapar el síntoma: un efecto que solo cambia estado a partir de otro estado casi nunca debería existir (lección 39), y las dependencias que cambian en cada render son cosa de la lección 42.

**Escribir el efecto como función `async`.** Una función asíncrona siempre devuelve una promesa, y React espera de un efecto una función de limpieza o nada:

```jsx
// 🚩 Así no
useEffect(async () => {
  const res = await fetch('/api/pistas')
  setPistas(await res.json())
}, [])
```

React avisa en la consola con un mensaje que incluye el arreglo:

```text
useEffect must not return anything besides a function, which is used for clean-up.

It looks like you wrote useEffect(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:
```

Es decir: el efecto solo puede devolver una función de limpieza; declara la función asíncrona dentro y llámala. Con `StrictMode` es peor: al hacer el ensayo, React intenta llamar a esa promesa como si fuera la limpieza, y la vista previa se cae con un `TypeError` («… is not a function»). El arreglo es el de la sección anterior: `async function cargar() { … }` dentro, y `cargar()` justo después.

**Una limpieza que no deshace lo que hizo el efecto.** Esta parece correcta, y el registro de efectos incluso apunta «⟲ limpieza»:

```jsx
useEffect(() => {
  function manejarTecla(evento) { /* … */ }
  window.addEventListener('keydown', manejarTecla)
  return () => window.removeEventListener('keydown', (evento) => manejarTecla(evento))
}, [])
```

Pero `removeEventListener` solo quita **la misma función** que se añadió, y aquí recibe una flecha nueva. El escuchador original sigue puesto, y tras el ensayo de `StrictMode` hay dos: cada tecla cuenta doble. Lo arreglarás en el segundo ejercicio.

**Esconder el doble efecto con una ref o apagando `StrictMode`.** Ya lo has visto: el fallo sigue ahí, solo que ya no lo ves. Escribe la limpieza.

**Hacer en un efecto lo que provoca un clic.** Si un efecto con `[]` hace `fetch('/api/compras', { method: 'POST' })`, en desarrollo compras dos veces, y en producción cada vez que alguien vuelva a esa pantalla. Comprar no pasa porque se vea una pantalla, sino porque alguien pulsó «Comprar»: va en el manejador. La lección 39 recorre todos los casos.

## Ejercicios

**1. El parte de nieve por zonas.** La web enseña qué pistas hay abiertas en cada zona de la estación. El componente `ParteZona` ya sabe pintar el parte, el «Cargando…» y el error; le falta el efecto que lo pide al servidor. Las comprobaciones usan la API simulada con 300 ms de latencia.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El parte de nieve por zonas",
  "consigna": "En ParteZona.jsx, escribe un efecto que pida /api/zonas/<zonaId> (por ejemplo, /api/zonas/umbria) cada vez que cambie la zona, guarde la respuesta con setRespuesta y trate como error una respuesta que no sea ok. En la limpieza, cancela la petición con un AbortController. Cuando funcione, sube la latencia y cambia de zona deprisa: el panel de red debe enseñar las peticiones viejas como canceladas.",
  "archivos": [
    {
      "nombre": "ParteZona.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function ParteZona({ zonaId }) {\n  // La respuesta recuerda de qué zona es:\n  // { zonaId, zona } si llega bien, { zonaId, error } si falla\n  const [respuesta, setRespuesta] = useState(null)\n\n  // Escribe aquí el efecto:\n  // 1. Pide /api/zonas/<zonaId> y guarda la respuesta con setRespuesta.\n  // 2. Si res.ok es false, trátalo como un error.\n  // 3. Cancela la petición en la limpieza con un AbortController.\n\n  if (respuesta?.zonaId !== zonaId) return <p>Cargando el parte…</p>\n  if (respuesta.error) {\n    return <p role=\"alert\">No se pudo cargar el parte: {respuesta.error}</p>\n  }\n\n  return (\n    <ul>\n      {respuesta.zona.pistas.map((pista) => (\n        <li key={pista.nombre}>\n          {pista.nombre}: {pista.estado}\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ParteZona from './ParteZona'\nimport './estilos.css'\n\nexport default function App() {\n  const [zonaId, setZonaId] = useState('solana')\n\n  return (\n    <main>\n      <h1>Parte de nieve · Puerto Blanco</h1>\n      <label>\n        Zona{' '}\n        <select value={zonaId} onChange={(e) => setZonaId(e.target.value)}>\n          <option value=\"solana\">Solana</option>\n          <option value=\"umbria\">Umbría</option>\n          <option value=\"cumbre\">Cumbre</option>\n        </select>\n      </label>\n      <ParteZona zonaId={zonaId} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\ninput,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.rotulo {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  min-height: 2rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n}\n\n.bombilla {\n  min-width: 0.7em;\n  color: #fbbf24;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-shadow: 0 0 6px #f59e0b;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.reloj {\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "archivoInicial": "ParteZona.jsx",
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "zonas": [
      {
        "id": "solana",
        "nombre": "Solana",
        "pistas": [
          {
            "nombre": "Roca Negra",
            "estado": "abierta"
          },
          {
            "nombre": "El Cervunal",
            "estado": "abierta"
          },
          {
            "nombre": "Las Marmotas",
            "estado": "cerrada"
          }
        ]
      },
      {
        "id": "umbria",
        "nombre": "Umbría",
        "pistas": [
          {
            "nombre": "Los Sarrios",
            "estado": "abierta"
          },
          {
            "nombre": "Canal del Lobo",
            "estado": "cerrada por viento"
          }
        ]
      },
      {
        "id": "cumbre",
        "nombre": "Cumbre",
        "pistas": [
          {
            "nombre": "Tuca Alta",
            "estado": "abierta"
          }
        ]
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, aparecen las pistas de la Solana",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Roca Negra"
      }
    },
    {
      "descripcion": "Mientras llega el parte, se ve «Cargando el parte…»",
      "pasos": [],
      "espera": {
        "texto": "Cargando el parte…"
      }
    },
    {
      "descripcion": "Al elegir «Umbría», aparecen sus pistas",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Roca Negra"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Zona",
            "opcion": "Umbría"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Los Sarrios"
      }
    },
    {
      "descripcion": "Al elegir «Cumbre», aparece su pista",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Roca Negra"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Zona",
            "opcion": "Cumbre"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Tuca Alta"
      }
    },
    {
      "descripcion": "Si falla la petición al cambiar de zona, aparece un aviso de error",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Roca Negra"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "seleccionar": {
            "etiqueta": "Zona",
            "opcion": "Umbría"
          }
        }
      ],
      "espera": {
        "rol": "alert"
      }
    },
    {
      "descripcion": "Después de un error, otra zona se carga bien",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Roca Negra"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "seleccionar": {
            "etiqueta": "Zona",
            "opcion": "Umbría"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Zona",
            "opcion": "Cumbre"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Tuca Alta"
      }
    }
  ]
}
```

**2. Las webcams con el teclado.** Con las flechas del teclado se pasa de una webcam a otra. Funciona en producción, pero en desarrollo cada flecha salta dos cámaras. Haz clic en la vista previa y pulsa la flecha derecha para verlo, y mira la limpieza en el registro de efectos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las webcams que saltan de dos en dos",
  "consigna": "Haz clic en la vista previa y pulsa la flecha derecha: pasas de la cámara 1 a la 3. El registro dice que hubo limpieza, pero no deshizo nada. Arregla la limpieza de Webcams.jsx para que quite el mismo escuchador que puso el efecto, y comprueba que cada flecha avanza una sola cámara.",
  "archivos": [
    {
      "nombre": "Webcams.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nconst CAMARAS = [\n  'Base de la estación',\n  'Telesilla del Lago',\n  'Pista Roca Negra',\n  'Cumbre del Tuca',\n]\n\nexport default function Webcams() {\n  const [indice, setIndice] = useState(0)\n\n  useEffect(() => {\n    function manejarTecla(evento) {\n      if (evento.key === 'ArrowRight') {\n        setIndice((i) => (i + 1) % CAMARAS.length)\n      }\n      if (evento.key === 'ArrowLeft') {\n        setIndice((i) => (i - 1 + CAMARAS.length) % CAMARAS.length)\n      }\n    }\n\n    window.addEventListener('keydown', manejarTecla)\n    return () => window.removeEventListener('keydown', (evento) => manejarTecla(evento))\n  }, [])\n\n  return (\n    <section>\n      <h2>Webcams</h2>\n      <p>\n        Cámara {indice + 1} de {CAMARAS.length}: {CAMARAS[indice]}\n      </p>\n      <p>Usa las flechas izquierda y derecha del teclado para cambiar de cámara.</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Webcams from './Webcams'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Estación de esquí Puerto Blanco</h1>\n      <Webcams />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 34rem;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\nselect,\ninput,\nbutton {\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.25rem 0.25rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #1e3a8a;\n  color: white;\n}\n\n.rotulo {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 2px;\n  min-height: 2rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n}\n\n.bombilla {\n  min-width: 0.7em;\n  color: #fbbf24;\n  font-family: ui-monospace, monospace;\n  font-weight: 700;\n  text-shadow: 0 0 6px #f59e0b;\n}\n\n.ficha {\n  padding: 0.25rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n}\n\n.reloj {\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "archivoInicial": "Webcams.jsx",
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al abrir, se ve la cámara 1",
      "pasos": [],
      "espera": {
        "texto": "Cámara 1 de 4: Base de la estación"
      }
    },
    {
      "descripcion": "Una flecha derecha lleva a la cámara 2",
      "pasos": [
        {
          "teclear": "{ArrowRight}"
        }
      ],
      "espera": {
        "texto": "Cámara 2 de 4: Telesilla del Lago"
      }
    },
    {
      "descripcion": "Dos flechas derechas llevan a la cámara 3",
      "pasos": [
        {
          "teclear": "{ArrowRight}"
        },
        {
          "teclear": "{ArrowRight}"
        }
      ],
      "espera": {
        "texto": "Cámara 3 de 4: Pista Roca Negra"
      }
    },
    {
      "descripcion": "Desde la cámara 1, la flecha izquierda lleva a la última",
      "pasos": [
        {
          "teclear": "{ArrowLeft}"
        }
      ],
      "espera": {
        "texto": "Cámara 4 de 4: Cumbre del Tuca"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el bono de los trineos, añade un botón «Pausar» que pare el descuento y «Seguir» que lo reanude. Pista: guarda en el estado si el bono está en marcha, ponlo en las dependencias y crea el intervalo solo cuando lo esté. Mira en el registro qué dice al pausar.
2. Añade a la librería del rótulo una función `apagarRotulo(nodo)` que lo deje vacío, y llámala en la limpieza del efecto. Comprueba en la consola el orden en que se apaga y se enciende al cambiar de mensaje.
3. En el parte de nieve, haz que se vuelva a pedir por sí solo cada 30 segundos mientras la zona está a la vista: un `setInterval` dentro del efecto, con su limpieza junto a la del `AbortController`.
4. Quita el `AbortController` del parte, activa «Responder desordenado» y cambia de zona dos veces seguidas. ¿Qué enseña ahora la pantalla? ¿Por qué no es la misma avería que la de la primera ficha de pista?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Synchronizing with Effects",
      "descripcion": "La página de react.dev de esta lección: los tres pasos, por qué StrictMode monta dos veces, los patrones de limpieza y cuatro retos (enfocar un campo, un intervalo que va doble, una carrera al pedir datos).",
      "url": "https://react.dev/learn/synchronizing-with-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useEffect",
      "descripcion": "La referencia completa: parámetros, advertencias, cómo depurar un efecto que se ejecuta de más o en bucle, y ejemplos con widgets, eventos y datos.",
      "url": "https://react.dev/reference/react/useEffect",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "StrictMode: re-running Effects in development",
      "descripcion": "Qué comprueba exactamente StrictMode y cómo te ayuda a encontrar efectos sin limpieza.",
      "url": "https://react.dev/reference/react/StrictMode",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "AbortController",
      "descripcion": "La API del navegador para cancelar peticiones: signal, abort() y el error AbortError.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Lifecycle of Reactive Effects",
      "descripcion": "El siguiente paso: cada efecto como un proceso de sincronización independiente, que se inicia y se detiene las veces que haga falta. Es la lección 40.",
      "url": "https://react.dev/learn/lifecycle-of-reactive-effects",
      "etiqueta": "react.dev"
    }
  ]
}
```
