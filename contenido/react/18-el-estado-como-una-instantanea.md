# El estado como una instantánea

- **Módulo:** Interactividad
- **Slug:** `el-estado-como-una-instantanea` (autogenerado del título)
- **Orden:** 180
- **Fuentes:** [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) — ver `contenido/react/TEMARIO.md` #18

---

## Qué es y para qué sirve

En la lección 16 guardaste datos con `useState`, y en la 17 viste que cambiar el estado pone en marcha un render y un commit. Queda un detalle por mirar de cerca, y es el origen de las sorpresas más habituales de quien empieza con React:

```jsx
function manejarClic() {
  setPlanta(planta + 1)
  console.log(planta) // ¿el valor nuevo? No: el de antes
}
```

La consola no enseña el valor nuevo. No es un fallo ni un retraso: es el diseño. **Una variable de estado no es una caja que vas cambiando: es una foto del estado en el momento de un render.** Llamar a `setPlanta` no retoca la foto que tienes en la mano; le pide a React que haga otra, con el valor nuevo, en el siguiente render.

En esta lección verás qué significa eso en la práctica: por qué tres `setPlanta(planta + 1)` seguidos solo suben una planta, por qué un temporizador te enseña un valor que ya no está en pantalla y por qué, bien entendido, este comportamiento te protege de errores en vez de causarlos.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Partes de las lecciones 16 y 17",
  "contenido": "Aquí se usa useState sin volver a explicarlo, y se habla de render y commit como en la lección 17: render es que React llame a tu componente para saber qué debe verse; commit es cuando aplica el resultado a la página. Si alguno de los dos términos no te suena, repasa esas lecciones antes de seguir."
}
```

## Llamar a `set` no cambia la variable

Empieza por lo más simple: el panel de un ascensor con un botón que sube una planta. El manejador escribe en la consola el valor de `planta` antes y después de llamar a `setPlanta`, y el componente escribe otra línea cada vez que React lo ejecuta. `StrictMode` está apagado para que cada render salga una sola vez en la consola; ya sabes por la lección 12 por qué, si no, saldrían dos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Pides la planta 1, pero planta sigue valiendo 0",
  "consigna": "Pulsa «Subir una planta» y lee la consola de arriba abajo. Después pulsa el nodo Ascensor del árbol de renders, debajo de la vista previa, para ver qué guarda React en su estado.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Ascensor() {\n  const [planta, setPlanta] = useState(0)\n  console.log('Render de Ascensor: planta =', planta)\n\n  function manejarClic() {\n    console.log('Clic: planta vale', planta)\n    setPlanta(planta + 1)\n    console.log('Después de setPlanta, planta sigue valiendo', planta)\n  }\n\n  return (\n    <main>\n      <h1>Planta {planta}</h1>\n      <button onClick={manejarClic}>Subir una planta</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  display: inline-block;\n  min-width: 7ch;\n  padding: 0.25rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #fbbf24;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  display: block;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

La pantalla dice «Planta 1», pero dentro del manejador `planta` vale 0 de la primera línea a la última. El orden de la consola cuenta lo que ha pasado:

1. **Se ejecuta el manejador** con el valor del render en curso: `planta` es 0.
2. **`setPlanta(planta + 1)` pide un render nuevo** en el que `planta` valga 1. No toca la variable que ya tienes: React apunta la petición y tu código sigue.
3. **El manejador termina** y, en su última línea, `planta` sigue valiendo 0.
4. **React vuelve a llamar a `Ascensor`.** Esta vez `useState` devuelve 1 y el JSX nuevo dice «Planta 1». En el árbol de renders, `Ascensor` pasa a re-render, con el contador en `·2` y el motivo «cambió su estado»; si pulsas el nodo, verás el 1 en su estado.

Fíjate en cómo se declara: `const [planta, setPlanta] = useState(0)`. Es una **constante**. Ninguna función puede cambiar el valor de una `const` de JavaScript, tampoco `setPlanta`. Lo que sí puede hacer es pedirle a React que vuelva a llamar a `Ascensor`, y en esa llamada nace **otra** constante `planta`, con el valor nuevo.

## Cada render es una foto

Renderizar es que React llame a tu componente, como viste en la lección 17. Lo que devuelve esa llamada es como una **foto de la interfaz en ese momento**: textos, atributos y también manejadores de eventos, todo calculado con el estado de ese render. A diferencia de una foto de papel, esta es interactiva: lleva dentro el `onClick` que se ejecutará si alguien pulsa el botón.

El estado no vive dentro de tu función, que se ejecuta y termina, sino **en React**. Cada vez que React llama a tu componente, le entrega una copia del estado para ese render. Así se suceden los dos primeros renders del ascensor:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "La vida de planta en el ascensor",
  "items": [
    {
      "fecha": "Render 1",
      "titulo": "React llama a Ascensor con planta = 0",
      "texto": "El JSX dice «Planta 0» y lleva un manejarClic recién creado. Ese manejarClic ve planta = 0, y lo verá siempre."
    },
    {
      "fecha": "Clic",
      "titulo": "Se ejecuta el manejarClic del render 1",
      "texto": "setPlanta(0 + 1) deja apuntado en React que el próximo render tendrá planta = 1. Dentro de este manejador, planta sigue siendo 0 hasta la última línea."
    },
    {
      "fecha": "Render 2",
      "titulo": "React vuelve a llamar a Ascensor y useState devuelve 1",
      "texto": "Nace otra constante planta, que vale 1, y otro manejarClic que ve ese 1. El JSX nuevo dice «Planta 1»."
    },
    {
      "fecha": "Commit 2",
      "titulo": "React pone la pantalla al día",
      "texto": "Cambia el texto del h1 a «Planta 1». El botón pasa a ejecutar el manejarClic del render 2; el del render 1 ya no está enganchado a nada."
    }
  ]
}
```

No hay nada mágico: **es un closure**, lo mismo que viste en el temario de JavaScript. `manejarClic` se crea dentro de la llamada a `Ascensor` y recuerda las variables de esa llamada. Cada render es una llamada nueva, con sus propias constantes, que crea sus propios manejadores. De ahí sale un truco que funciona siempre y que vas a usar en toda la lección: **sustituir mentalmente cada variable de estado por su valor en ese render** y leer el código así.

Lo que queda fijado en cada foto no es solo el estado:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El estado de ese render",
      "texto": "Lo que devolvió useState en esa llamada. Llamar a la función set no lo cambia: pide otro render, que tendrá su propio valor."
    },
    {
      "titulo": "Las props de ese render",
      "texto": "Las que le pasó el padre en esa llamada. Si el padre le pasa otras, será en otro render y con otra foto."
    },
    {
      "titulo": "Los manejadores y las variables locales",
      "texto": "Se crean de nuevo en cada render, con los valores de ese render. Un manejador antiguo, que todavía espera en un temporizador, sigue viendo lo que había cuando se creó."
    }
  ]
}
```

## El botón «+3» que solo sube una planta

Ahora, el ejemplo clásico. Alguien quiere un botón que suba tres plantas de golpe y, como ya tiene la línea que sube una, la escribe tres veces:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Ascensor() {\n  const [planta, setPlanta] = useState(0)\n\n  function manejarClic() {\n    setPlanta(planta + 1)\n    setPlanta(planta + 1)\n    setPlanta(planta + 1)\n  }\n\n  return (\n    <main>\n      <h1>Planta {planta}</h1>\n      <button onClick={manejarClic}>Subir 3 plantas</button>\n    </main>\n  )\n}\n\n// El ascensor está en la planta 0.\n// Pulsas «Subir 3 plantas» una vez: ¿qué dice el título?",
  "opciones": [
    "Planta 3",
    "Planta 1",
    "Planta 0: los tres set se anulan entre sí",
    "Depende de lo rápido que React procese cada set"
  ],
  "correcta": 1,
  "explicacion": "En el render en el que pulsaste, planta vale 0 en las tres líneas, así que las tres piden lo mismo: setPlanta(0 + 1). Pedir tres veces que la planta sea 1 deja la planta en 1. El siguiente clic se ejecuta con el manejador de otro render, en el que planta vale 1, y la sube a 2."
}
```

Compruébalo, con el árbol de renders a la vista:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres peticiones, una sola planta",
  "consigna": "Pulsa «Subir 3 plantas» varias veces y mira el título, la consola y el árbol de renders. Después cambia las tres líneas por una sola que suba tres plantas de verdad.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Ascensor() {\n  const [planta, setPlanta] = useState(0)\n\n  function manejarClic() {\n    setPlanta(planta + 1)\n    setPlanta(planta + 1)\n    setPlanta(planta + 1)\n    console.log('Fin del manejador: en este render, planta vale', planta)\n  }\n\n  return (\n    <main>\n      <h1>Planta {planta}</h1>\n      <button onClick={manejarClic}>Subir 3 plantas</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  display: inline-block;\n  min-width: 7ch;\n  padding: 0.25rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #fbbf24;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  display: block;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Cada clic sube **una** planta, y el árbol lo confirma: un clic, un re-render de `Ascensor` (`·2`, `·3`, `·4`...). Aplica la sustitución. En el render 1, `planta` vale 0, así que el manejador de ese render es, a efectos prácticos, este:

```jsx
// Render 1: planta = 0
function manejarClic() {
  setPlanta(0 + 1)
  setPlanta(0 + 1)
  setPlanta(0 + 1)
}
```

Tres veces «que la planta sea 1». En el render 2, `planta` vale 1, y el manejador que se crea es otro:

```jsx
// Render 2: planta = 1
function manejarClic() {
  setPlanta(1 + 1)
  setPlanta(1 + 1)
  setPlanta(1 + 1)
}
```

Por eso el segundo clic deja el ascensor en la 2, el tercero en la 3... **Llamar varias veces a `set` partiendo del mismo valor no acumula nada.** El arreglo directo es pedir lo que quieres de una vez: `setPlanta(planta + 3)`. Y si de verdad necesitas encadenar varias actualizaciones del mismo estado, hay una forma de pedírselo a React que no depende de la foto, la función actualizadora, que es el tema de la lección 19. Allí verás también por qué React no renderiza tres veces aunque llames tres veces a `setPlanta`.

## Ni esperando: el valor de un render no cambia nunca

¿Y si el código que lee el estado se ejecuta después, cuando React ya ha vuelto a renderizar? Primero, el caso sin espera:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function manejarClic() {\n  setPlanta(planta + 5)\n  alert(`El ascensor va a la planta ${planta}`)\n}\n\n// planta vale 0 y pulsas el botón. ¿Qué dice el aviso?",
  "opciones": [
    "«El ascensor va a la planta 5»",
    "«El ascensor va a la planta 0»",
    "«El ascensor va a la planta undefined»"
  ],
  "correcta": 1,
  "explicacion": "Sustituye: en este render planta vale 0, así que el manejador hace setPlanta(0 + 5) y luego el alert con un 0 dentro. El aviso sale mientras el manejador se ejecuta, antes de que React vuelva a renderizar. Y aunque saliera después, daría lo mismo, como vas a ver ahora."
}
```

Ahora con un temporizador: el mensaje se escribe tres segundos después del clic, cuando la pantalla ya enseña la planta nueva. Antes de pulsar, decide qué número va a salir. Aquí se usa `console.log` en vez de `alert` para que la consola deje constancia del orden de las cosas. (En los bloques de esta web, `alert` no abre ninguna ventana: enseña el mensaje como un aviso dentro de la vista previa y lo copia en la consola. Lo usarás en el semáforo, más abajo.)

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un temporizador que se queda con la foto del clic",
  "consigna": "Pulsa «Subir 5 plantas» y espera tres segundos mirando la consola. Después prueba a pulsar dos veces seguidas, rápido, y explica los dos números que salen.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Ascensor() {\n  const [planta, setPlanta] = useState(0)\n\n  function manejarClic() {\n    console.log('Clic: planta vale', planta, '→ pido la', planta + 5)\n    setPlanta(planta + 5)\n    setTimeout(() => {\n      console.log('Tres segundos después, planta vale', planta)\n    }, 3000)\n  }\n\n  return (\n    <main>\n      <h1>Planta {planta}</h1>\n      <button onClick={manejarClic}>Subir 5 plantas</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  display: inline-block;\n  min-width: 7ch;\n  padding: 0.25rem 0.75rem;\n  border-radius: 6px;\n  background: #111827;\n  color: #fbbf24;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  display: block;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

El título cambia a «Planta 5» en cuanto pulsas, el árbol enseña el re-render de `Ascensor` y en la consola aparece la raya «commit 2»: React ya ha renderizado y ha puesto la pantalla al día. Aun así, tres segundos después el temporizador escribe **0**. Con la sustitución se ve por qué:

```jsx
// El manejador del render en el que pulsaste: planta = 0
setPlanta(0 + 5)
setTimeout(() => {
  console.log('Tres segundos después, planta vale', 0)
}, 3000)
```

La función del temporizador se creó en ese render y se quedó con su foto. Que React haya hecho después otra foto, con un 5, no cambia la que ella tiene. **El valor de una variable de estado no cambia nunca dentro de un render**, aunque el código de ese render se ejecute mucho más tarde. Con dos clics rápidos lo ves dos veces: el primer temporizador dice 0 y el segundo, 5, el valor del render en el que se creó cada uno.

## Una ventaja: lo que envías es lo que había al pulsar

Que cada manejador se quede con su foto no es un defecto que haya que sortear: casi siempre es justo lo que quieres. En esta emisora de barrio, las dedicatorias se leen en antena cinco segundos después de enviarlas. Los campos usan `value` y `onChange` para guardar en el estado lo que escribes; se llaman inputs controlados y los verás a fondo en la lección 22.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dedicatorias en Radio Onda Vecinal",
  "consigna": "Envía la dedicatoria y, antes de que pasen cinco segundos, cambia el destinatario a Jorge y escribe otro mensaje. ¿Qué se lee en antena?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Dedicatorias() {\n  const [para, setPara] = useState('Carmen')\n  const [mensaje, setMensaje] = useState('¡Feliz cumpleaños, abuela!')\n  const [enAntena, setEnAntena] = useState('')\n\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    // La locutora tarda cinco segundos en leerla\n    setTimeout(() => {\n      setEnAntena(`«${mensaje}», para ${para}`)\n    }, 5000)\n  }\n\n  return (\n    <main>\n      <h1>Radio Onda Vecinal</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Para\n          <select value={para} onChange={(evento) => setPara(evento.target.value)}>\n            <option value=\"Carmen\">Carmen</option>\n            <option value=\"Jorge\">Jorge</option>\n          </select>\n        </label>\n        <label>\n          Mensaje\n          <textarea value={mensaje} onChange={(evento) => setMensaje(evento.target.value)} />\n        </label>\n        <button type=\"submit\">Enviar dedicatoria</button>\n      </form>\n      {enAntena && <p className=\"antena\">En antena: {enAntena}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nlabel {\n  display: block;\n  margin-bottom: 0.75rem;\n}\n\nselect,\ntextarea {\n  display: block;\n  margin-top: 0.25rem;\n  font: inherit;\n}\n\ntextarea {\n  width: 100%;\n  max-width: 24rem;\n  min-height: 4rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n\n.antena {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #dc2626;\n  background: #fef2f2;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

En antena se lee la dedicatoria que enviaste, para Carmen, aunque el formulario ya diga otra cosa. El `manejarEnvio` que se ejecutó se creó en el render en el que pulsaste, y en ese render `para` valía «Carmen» y `mensaje`, lo que habías escrito. Si React cambiara esas variables por debajo mientras el temporizador espera, la radio leería un mensaje a medio escribir para alguien a quien no se lo habías dedicado. **React mantiene fijos los valores de cada render para sus manejadores**, y gracias a eso no tienes que preocuparte de que el estado cambie mientras tu código espera.

## Las props también son de su render

La foto no incluye solo el estado: también las props que el componente recibió en ese render. En esta subasta benéfica, cada puja se confirma dos segundos después de pulsar.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const LOTES = ['Bicicleta de paseo', 'Cesta de la huerta', 'Cuadro de la plaza']\n\nfunction Lote({ nombre }) {\n  function manejarPuja() {\n    setTimeout(() => {\n      console.log('Puja confirmada:', nombre)\n    }, 2000)\n  }\n\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <button onClick={manejarPuja}>Pujar 10 €</button>\n    </section>\n  )\n}\n\nexport default function Subasta() {\n  const [indice, setIndice] = useState(0)\n\n  return (\n    <main>\n      <Lote nombre={LOTES[indice]} />\n      <button onClick={() => setIndice((indice + 1) % LOTES.length)}>\n        Siguiente lote\n      </button>\n    </main>\n  )\n}\n\n// Pulsas «Pujar 10 €» por la bicicleta y, antes de dos segundos,\n// pulsas «Siguiente lote». ¿Qué sale en la consola?",
  "opciones": [
    "Puja confirmada: Bicicleta de paseo",
    "Puja confirmada: Cesta de la huerta",
    "Nada: al cambiar de lote, el temporizador se pierde"
  ],
  "correcta": 0,
  "explicacion": "El manejarPuja que pulsaste se creó en el render en el que Lote recibió nombre = «Bicicleta de paseo». Al pasar de lote, Lote se vuelve a renderizar con otra prop y crea otro manejador, pero el temporizador ya estaba en marcha con la foto vieja. Pujas por lo que veías al pulsar, que es lo que quieres."
}
```

En el árbol de renders, ese cambio de lote se vería como un re-render de `Lote` con el motivo «cambió la prop «nombre»»: el mismo componente, con otra foto. El temporizador no se entera, ni tiene por qué.

## Si necesitas el valor siguiente, calcúlalo tú

A veces el manejador sí necesita el valor nuevo para algo más: escribirlo en un aviso, compararlo con otro, enviarlo a un servidor. Como `planta` no va a cambiar dentro del manejador, la solución no es esperar a que cambie, sino **calcular el valor siguiente una sola vez, guardarlo en una constante y usar esa constante para todo**:

```jsx
function manejarClic() {
  const plantaSiguiente = planta + 1
  setPlanta(plantaSiguiente)
  console.log('Vamos a la planta', plantaSiguiente) // 1
  console.log('Salimos de la planta', planta)       // 0, y es correcto
}
```

Las dos fotos conviven sin problema: `planta` es de dónde vienes y `plantaSiguiente`, adónde vas. Pruébalo con un reto que propone react.dev para esta misma idea. Un semáforo de peatones avisa, al pulsar el botón, de qué luz viene después:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Semaforo() {\n  const [enVerde, setEnVerde] = useState(true)\n\n  function manejarClic() {\n    setEnVerde(!enVerde)\n    alert(enVerde ? 'Ahora viene el rojo' : 'Ahora viene el verde')\n  }\n\n  return (\n    <main>\n      <p>{enVerde ? 'Verde: puedes cruzar' : 'Rojo: espera'}</p>\n      <button onClick={manejarClic}>Pulsar</button>\n    </main>\n  )\n}\n\n// El semáforo está en verde y pulsas el botón.\n// ¿Qué dice el aviso? ¿Cambiaría algo con el alert ANTES del setEnVerde?",
  "opciones": [
    "«Ahora viene el rojo», y daría igual ponerlo antes o después",
    "«Ahora viene el verde», porque enVerde ya vale false",
    "«Ahora viene el rojo», pero solo porque el alert va detrás del set"
  ],
  "correcta": 0,
  "explicacion": "enVerde vale true en todo el manejador de este render: delante o detrás de setEnVerde, la condición lee lo mismo. Con la sustitución: setEnVerde(false) y alert(true ? ... : ...). Léelo como una frase: si ahora está en verde, lo siguiente es el rojo."
}
```

Compruébalo y juega con el orden de las líneas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El semáforo del paso de peatones",
  "consigna": "Pulsa varias veces: el aviso aparece arriba, dentro de la vista previa, y también en la consola. Mueve el alert delante de setEnVerde y comprueba que no cambia nada. Después haz que el aviso diga qué luz acaba de encenderse, con una constante que guarde el valor siguiente.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Semaforo() {\n  const [enVerde, setEnVerde] = useState(true)\n\n  function manejarClic() {\n    setEnVerde(!enVerde)\n    alert(enVerde ? 'Ahora viene el rojo' : 'Ahora viene el verde')\n  }\n\n  return (\n    <main>\n      <p className={enVerde ? 'luz verde' : 'luz roja'}>\n        {enVerde ? 'Verde: puedes cruzar' : 'Rojo: espera'}\n      </p>\n      <button onClick={manejarClic}>Pulsar</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.luz {\n  display: inline-block;\n  padding: 0.5rem 1rem;\n  border-radius: 999px;\n  color: #ffffff;\n  font-weight: bold;\n}\n\n.verde {\n  background: #15803d;\n}\n\n.roja {\n  background: #b91c1c;\n}\n\nbutton {\n  display: block;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Envíos y guardados que tardan",
      "texto": "Un formulario que se envía a un servidor, un guardado automático, una confirmación con retraso: el manejador trabaja con los datos que había al pulsar, aunque la persona siga escribiendo mientras tanto."
    },
    {
      "titulo": "Manejadores sin estados a medias",
      "texto": "Todas las líneas de un manejador leen los mismos valores. Si compruebas una condición arriba, sigue siendo cierta abajo, aunque entre medias hayas llamado a set."
    },
    {
      "titulo": "Leer el código sin ejecutarlo",
      "texto": "Con la sustitución mental sabes qué hará cada manejador mirando solo el render en que se creó. Es la herramienta para depurar casi cualquier «mi estado no se actualiza»."
    },
    {
      "titulo": "Cuando lo que necesitas es el último valor",
      "texto": "Un temporizador o una petición que debe trabajar con el valor más reciente, y no con el del clic, necesita otra herramienta: la función actualizadora (lección 19) o una ref (lección 33)."
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
      "mito": "set es asíncrono: el estado cambia, pero un poco más tarde",
      "realidad": "La variable de tu render no cambia nunca, ni un poco más tarde: es una constante. Lo que llega después es otro render, con otra constante. Por eso un temporizador de tres segundos sigue viendo el valor viejo."
    },
    {
      "mito": "Cuando React vuelve a renderizar, mi manejador se actualiza",
      "realidad": "React no toca las funciones que ya existen: crea otras en el render siguiente. La que ya estaba esperando, en un temporizador o tras un await, conserva su foto."
    },
    {
      "mito": "Si pongo el console.log después del set, veré el valor nuevo",
      "realidad": "Da igual dónde lo pongas dentro del manejador: todo el manejador pertenece al mismo render. Para ver el valor nuevo, pon el console.log en el cuerpo del componente, que se ejecuta en el render siguiente, o mira el árbol de renders."
    },
    {
      "mito": "Esto es una rareza de React",
      "realidad": "Es cómo funcionan los closures de JavaScript. React solo se asegura de que cada render sea una llamada nueva a tu función, con sus propias constantes."
    }
  ]
}
```

## Errores típicos

**«Mi estado no se actualiza».** Casi siempre es un `console.log` justo después del `set`. El estado sí se actualiza, pero para el siguiente render; la línea que lo lee pertenece al render de antes. Si necesitas el valor nuevo dentro del manejador, guárdalo antes en una constante, como en el semáforo.

**Usar el valor viejo para algo más.** Este no da ninguna pista en pantalla, y por eso es peligroso:

```jsx
function manejarVoto() {
  setVotos(votos + 1)
  enviarAlServidor(votos) // envía el número de ANTES del voto
}
```

La pantalla dice 8 y el servidor ha recibido 7. El arreglo es el mismo de siempre: `const votosNuevos = votos + 1`, y usar `votosNuevos` en las dos líneas.

**Esperar a que el estado cambie.** Ya sabes que un temporizador no sirve. ¿Y un `await`?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "async function manejarClic() {\n  setPlanta(planta + 1)\n  await new Promise((resolver) => setTimeout(resolver, 1000))\n  console.log('Ha pasado un segundo y planta vale', planta)\n}\n\n// planta vale 0 y pulsas una vez. ¿Qué sale en la consola?",
  "opciones": [
    "Ha pasado un segundo y planta vale 1",
    "Ha pasado un segundo y planta vale 0",
    "Un error: un manejador de eventos no puede ser async"
  ],
  "correcta": 1,
  "explicacion": "await pausa manejarClic, pero cuando continúa sigue siendo el manejador del render en el que pulsaste, con planta = 0. React ya ha renderizado con 1 entretanto, en otra llamada a Ascensor y con otra constante. Un manejador async es perfectamente válido; lo que no hace es cambiar su foto."
}
```

**Llamar a `set` varias veces para acumular.** Es el «+3» de antes: con valores, todas las llamadas parten del mismo número y la última manda. Para acumular, calcula el total de una vez (`planta + 3`) o usa la función actualizadora de la lección 19.

## Ejercicios

El microbús que sube al castillo tiene seis plazas. Su panel cuenta los viajeros que van a bordo y guarda el máximo del trayecto, un dato que no se puede calcular a partir de los que van ahora, porque la gente también baja. Pero `manejarSubida` está escrito como si `aBordo` cambiara en cuanto se llama a `setABordo`: el máximo va siempre uno por detrás y, con el microbús lleno, el contador se pasa de las plazas. Antes de tocar nada, sube a siete viajeros y mira lo que pasa.

Una pista: no todo lo que hace `manejarSubida` necesita el valor siguiente. Para decidir si cabe alguien más, lo que importa es cuántos van **ahora**, y eso es justo lo que dice la foto de este render.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Arregla el panel del microbús",
  "consigna": "Arregla manejarSubida: calcula una sola vez cuántos irán a bordo, usa ese valor para el estado y para el máximo, y que no suba nadie si el microbús está lleno. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst PLAZAS = 6\n\nexport default function Microbus() {\n  const [aBordo, setABordo] = useState(0)\n  const [maximo, setMaximo] = useState(0)\n\n  // Arréglalo: este manejador da por hecho que aBordo\n  // cambia en cuanto se llama a setABordo.\n  function manejarSubida() {\n    setABordo(aBordo + 1)\n\n    // Si nos hemos pasado de plazas, lo dejo en el máximo permitido\n    if (aBordo > PLAZAS) {\n      setABordo(PLAZAS)\n    }\n\n    // Si es el récord del trayecto, lo apunto\n    if (aBordo > maximo) {\n      setMaximo(aBordo)\n    }\n  }\n\n  function manejarBajada() {\n    if (aBordo === 0) return\n    setABordo(aBordo - 1)\n  }\n\n  return (\n    <main>\n      <h1>Microbús al castillo</h1>\n      <p>A bordo: {aBordo} de {PLAZAS}</p>\n      <p>Máximo del trayecto: {maximo}</p>\n      {aBordo === PLAZAS && <p className=\"completo\">Microbús completo</p>}\n      <button onClick={manejarSubida}>Sube un viajero</button>\n      <button onClick={manejarBajada}>Baja un viajero</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.completo {\n  display: inline-block;\n  padding: 0.25rem 0.75rem;\n  border-radius: 6px;\n  background: #fef3c7;\n  color: #92400e;\n  font-weight: bold;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al subir tres viajeros, el máximo del trayecto es 3",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        }
      ],
      "espera": {
        "texto": "Máximo del trayecto: 3"
      }
    },
    {
      "descripcion": "El máximo no baja cuando se baja alguien",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Baja un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Baja un viajero"
          }
        }
      ],
      "espera": {
        "texto": "Máximo del trayecto: 3"
      }
    },
    {
      "descripcion": "Con las seis plazas ocupadas no sube nadie más",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        }
      ],
      "espera": {
        "texto": "A bordo: 6 de 6"
      }
    },
    {
      "descripcion": "Al bajar un viajero, queda uno menos a bordo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sube un viajero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Baja un viajero"
          }
        }
      ],
      "espera": {
        "texto": "A bordo: 1 de 6"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el microbús, añade un botón «Bajan todos» que lo vacíe y escriba en la consola cuántos viajeros se han bajado. ¿Qué valor necesitas, el de antes o el de después del `set`? ¿Hace falta alguna constante nueva?
2. Haz que la subida escriba en la consola «Sube un viajero: ahora van N» con el número correcto, sin añadir estado nuevo.
3. Añade al microbús un botón «Sube un grupo de 3» que respete las plazas libres: si solo quedan dos, suben dos. Hazlo con una sola llamada a `setABordo`; en la lección 19 verás otra forma de encadenar actualizaciones.
4. En el semáforo, guarda en el estado cuántas veces se ha pulsado el botón y haz que el aviso diga «Pulsación n.º N», contando la que acabas de hacer.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "State as a Snapshot",
      "descripcion": "La página de react.dev en la que se basa esta lección: el estado como foto, la sustitución mental y el reto del semáforo.",
      "url": "https://react.dev/learn/state-as-a-snapshot",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: «I've updated the state, but logging gives me the old value»",
      "descripcion": "La entrada de la referencia de useState para el error más común de esta lección, con el arreglo de guardar el valor siguiente en una constante.",
      "url": "https://react.dev/reference/react/useState#ive-updated-the-state-but-logging-gives-me-the-old-value",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Render and Commit",
      "descripcion": "Qué pasa entre que llamas a set y la pantalla cambia: la base de la lección 17.",
      "url": "https://react.dev/learn/render-and-commit",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Queueing a Series of State Updates",
      "descripcion": "La continuación natural: el procesamiento por lotes y la función actualizadora, que verás en la lección 19.",
      "url": "https://react.dev/learn/queueing-a-series-of-state-updates",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Closures",
      "descripcion": "La guía de MDN sobre closures: el mecanismo de JavaScript que explica por qué cada manejador recuerda los valores de su render.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
      "etiqueta": "MDN"
    }
  ]
}
```
