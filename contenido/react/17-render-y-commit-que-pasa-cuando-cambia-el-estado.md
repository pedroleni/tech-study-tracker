# Render y commit: qué pasa cuando cambia el estado

- **Módulo:** Interactividad
- **Slug:** `render-y-commit-que-pasa-cuando-cambia-el-estado` (autogenerado del título)
- **Orden:** 170
- **Fuentes:** [Render and Commit](https://react.dev/learn/render-and-commit) — ver `contenido/react/TEMARIO.md` #17

---

## Qué es y para qué sirve

En la lección 16 viste que una función `set` «pide un render». Pero ¿qué es exactamente un render, y qué ocurre desde que pulsas un botón hasta que ves el cambio en la pantalla? React lo hace en **tres pasos**, y el navegador pone un cuarto:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cada actualización de la pantalla",
  "roles": [
    {
      "etiqueta": "1. Disparar",
      "rol": "Algo pide un render",
      "descripcion": "La primera vez, el render inicial de createRoot. Después, una llamada a una función set. Nada más dispara un render."
    },
    {
      "etiqueta": "2. Renderizar",
      "rol": "React llama a tus componentes",
      "descripcion": "Ejecuta el componente que cambió y todos los que devuelve, y compara su JSX con el del render anterior. La página sigue sin tocar."
    },
    {
      "etiqueta": "3. Hacer commit",
      "rol": "React cambia el DOM",
      "descripcion": "Aplica solo las diferencias que encontró al renderizar: un texto aquí, un atributo allá. Si no hay ninguna, no toca nada."
    },
    {
      "etiqueta": "4. Pintar",
      "rol": "El navegador lo dibuja",
      "descripcion": "Con el DOM al día, el navegador vuelve a dibujar la pantalla. Esto ya no es cosa de React."
    }
  ]
}
```

Piénsalo como una reforma. Alguien pide un cambio (disparar). El arquitecto dibuja el plano completo de cómo debe quedar la casa y lo compara con el plano actual (renderizar): todavía no se ha movido ni un ladrillo. La cuadrilla hace solo las obras que salen de la comparación, cambiar una ventana, sin tirar la casa (commit). Y al final se abren las persianas y se ve el resultado (pintar). Dibujar planos es barato; tirar tabiques, no. **React dibuja todos los planos que haga falta, pero tira los tabiques imprescindibles.**

La palabra *commit* significa lo mismo que en Git: el momento en que unos cambios se dan por buenos y se aplican. Es la que ves en las rayas de la consola desde la lección 12 y en el panel «Árbol de renders», que en esta lección vas a leer con lupa. Los ejemplos son de la cabina de control del Teatro Alameda, desde donde la regidora lleva cada función: la escena que está en marcha, un reloj y sus notas.

## Paso 1: algo dispara un render

Un componente se renderiza por **dos motivos**, y solo por dos:

1. **Es el render inicial.** Al arrancar la app, tu `main.jsx` crea la raíz y le pide que pinte `App` (lección 3):

   ```jsx
   const raiz = createRoot(document.getElementById('root'))
   raiz.render(<App />)
   ```

   En los bloques de esta web lo hace el propio editor por ti. Es el «Commit 1» del panel, con todos los componentes en verde, montados.

2. **Ha cambiado su estado, o el de algún antepasado.** Cada llamada a una función `set` deja pendiente un render de ese componente, y con él se renderiza todo lo que tiene debajo (lección 13).

Nada más. React no vigila tus variables (lección 16), y tampoco las props: una prop solo cambia porque el padre se ha vuelto a renderizar y le ha pasado otra.

Hay un caso en que llamar a `set` no dispara nada: si le pasas **el mismo valor que ya tiene**, comparado con `Object.is`, React se ahorra el render. A veces llega a llamar al componente una vez antes de darse cuenta, y lo verías en la consola, pero no baja a sus hijos ni toca el DOM: en el panel sale, como mucho, un commit en el que todo aparece sin cambios.

## Paso 2: React llama a tus componentes

**Renderizar es que React llame a tus componentes.** En el render inicial llama al componente raíz; en los siguientes, al componente cuyo estado ha cambiado. Y lo hace de forma recursiva: si ese componente devuelve otros componentes, React los llama, y a los que devuelvan estos, y así hasta que solo quedan etiquetas HTML y sabe exactamente qué debería verse.

Mientras renderiza, React **no toca la página**: solo calcula. Compara lo que devuelve cada componente con lo que devolvió la vez anterior (los elementos de la lección 7, objetos pequeños) y apunta las diferencias para el paso siguiente. Por eso el render tiene que ser puro (lección 12): React puede hacerlo, repetirlo o tirarlo sin que se note fuera.

Pon a prueba la intuición antes de verlo. En la cabina, `App` guarda qué escena está en marcha y se la pasa a `EnEscena`; `Cabecera`, `Notas` y `Pie` no reciben nada que cambie:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  const [posicion, setPosicion] = useState(0)\n\n  return (\n    <main>\n      <Cabecera obra=\"El último tranvía\" />\n      <EnEscena escena={escenas[posicion]} />\n      <button onClick={() => setPosicion((posicion + 1) % escenas.length)}>\n        Siguiente escena\n      </button>\n      <Notas />\n      <Pie />\n    </main>\n  )\n}\n\n// Al pulsar «Siguiente escena» se renderizan App y sus cuatro hijos.\n// ¿Cuántos nodos del DOM cambia React en el commit?",
  "opciones": [
    "Todos: React vuelve a construir el main entero",
    "Los de los cinco componentes que se han renderizado",
    "Solo el texto del párrafo de la escena",
    "Ninguno: el cambio lo hace el navegador al pintar"
  ],
  "correcta": 2,
  "explicacion": "Los cinco componentes se ejecutan, pero cuatro devuelven exactamente lo mismo que antes, y el botón solo estrena una función onClick, que React guarda sin tocar el DOM. La única diferencia es el nombre de la escena, así que el commit cambia ese texto y nada más. Compruébalo en el bloque siguiente."
}
```

Ahora en vivo, con el panel «Árbol de renders» debajo. Ya lo usaste en las lecciones 13 y 16; esto es todo lo que enseña, para que sepas dónde mirar:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El resumen de arriba",
      "texto": "El número de commit, cuántos componentes se han renderizado, montado o desmontado en él y cuántos elementos del DOM han cambiado de verdad. Por ejemplo: Commit 2 · 5 renderizados · 1 cambio en el DOM."
    },
    {
      "titulo": "Lo que le ha pasado a cada componente",
      "texto": "Montado (verde): aparece ahora y su estado empieza de cero. Re-render (ámbar): se ha vuelto a ejecutar y conserva su estado. Sin cambios: no se ha ejecutado en este commit. Desmontado (tachado): ha desaparecido, y su estado con él."
    },
    {
      "titulo": "El motivo de cada re-render",
      "texto": "A la derecha, con una flecha: cambió su estado, cambió una prop (y cuál), cambió un contexto (lección 28) o se renderizó su padre."
    },
    {
      "titulo": "El contador ·N",
      "texto": "Cuántas veces se ha renderizado ese componente, contando el montaje. Con StrictMode no cuenta doble: cuenta los renders que llegan a un commit, no las llamadas a tu función."
    },
    {
      "titulo": "El recuadro ámbar de la vista previa",
      "texto": "Durante un instante, rodea cada elemento del DOM que el commit ha cambiado: el que tiene un texto o un atributo nuevo, el que acaba de añadirse o el padre de uno que se ha quitado. Es la prueba de lo que React ha tocado."
    },
    {
      "titulo": "Pulsar un componente",
      "texto": "Despliega sus props y su estado en ese momento. Vuelve a pulsarlo para cerrarlo."
    }
  ]
}
```

Aquí `StrictMode` está apagado para que la consola escriba una sola línea por componente; enseguida verás qué cambiaría con él.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cinco renders, un cambio",
  "consigna": "Mira primero el panel: Commit 1, cinco componentes montados y 1 cambio en el DOM. Pulsa «Siguiente escena»: la consola escribe cinco líneas, el resumen del panel dice 5 renderizados y 1 cambio en el DOM, y en la vista previa un recuadro ámbar marca solo la escena. Lee el motivo de cada componente.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { Cabecera, EnEscena, Notas, Pie } from './Escenario'\nimport './estilos.css'\n\nconst escenas = ['La estación', 'El vagón vacío', 'La tormenta de nieve', 'El regreso']\n\nexport default function App() {\n  const [posicion, setPosicion] = useState(0)\n  console.log('Renderizo App')\n\n  return (\n    <main>\n      <Cabecera obra=\"El último tranvía\" />\n      <EnEscena escena={escenas[posicion]} />\n      <button onClick={() => setPosicion((posicion + 1) % escenas.length)}>\n        Siguiente escena\n      </button>\n      <Notas />\n      <Pie />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Escenario.jsx",
      "codigo": "export function Cabecera({ obra }) {\n  console.log('Renderizo Cabecera')\n  return <h1>{obra}</h1>\n}\n\nexport function EnEscena({ escena }) {\n  console.log('Renderizo EnEscena')\n  return <p className=\"escena\">En escena: {escena}</p>\n}\n\nexport function Notas() {\n  console.log('Renderizo Notas')\n  return (\n    <label>\n      Notas de la función\n      <textarea rows={3} />\n    </label>\n  )\n}\n\nexport function Pie() {\n  console.log('Renderizo Pie')\n  return <footer>Función de las 20:00 · Sala principal</footer>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\n.cabina {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin-bottom: 0.25rem;\n}\n\n.escena {\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #1e293b;\n  color: #f8fafc;\n}\n\n.reloj {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 24rem;\n  margin: 0.75rem 0;\n}\n\ntextarea,\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.6rem;\n}\n\nfooter {\n  color: #64748b;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Lee el panel de arriba abajo, porque cuenta el paso 2 entero:

- **`App` · re-render · cambió su estado.** Aquí se disparó todo: `setPosicion`.
- **`EnEscena` · cambió la prop «escena».** `App` le ha pasado otra escena.
- **`Cabecera`, `Notas` y `Pie` · se renderizó su padre.** No ha cambiado nada de lo que reciben (`Cabecera` recibe el mismo título; los otros dos, nada), pero cuando un componente se renderiza, React renderiza también **todo lo que devuelve**. Volverás a esto más abajo.

Cinco componentes renderizados, cinco líneas en la consola. Con `StrictMode` encendido, como en tu proyecto de Vite, la consola escribiría diez, porque cada componente se llama dos veces (lección 12), y el panel diría exactamente lo mismo: un commit, y el contador `·N` de cada componente, una unidad más. El panel cuenta los renders que llegan a un commit, no las llamadas a tu función.

## Paso 3: el commit toca solo lo que ha cambiado

Después de renderizar, React **aplica los cambios al DOM**. Eso es el commit, y no trata igual el primer render que los demás:

- **En el render inicial** crea todos los nodos del DOM y los mete en la página. El panel lo resume como «1 cambio en el DOM» aunque haya creado una docena de elementos: React construye el árbol completo aparte y lo inserta de una vez, con un solo `appendChild` del `<main>` en el contenedor.
- **En los siguientes** hace solo las operaciones mínimas que calculó al renderizar: cambiar un texto, poner o quitar un atributo, añadir o quitar un nodo. Si no hay diferencias, no toca nada.

Este es el DOM real que hay dentro de la vista previa justo antes y justo después del primer clic. Cambia de versión y busca la diferencia:

```laboratorio
{
  "tipo": "comparador-antes-despues",
  "antes": "<main>\n  <h1>El último tranvía</h1>\n  <p class=\"escena\">En escena: La estación</p>\n  <button>Siguiente escena</button>\n  <label>Notas de la función<textarea rows=\"3\"></textarea></label>\n  <footer>Función de las 20:00 · Sala principal</footer>\n</main>",
  "despues": "<main>\n  <h1>El último tranvía</h1>\n  <p class=\"escena\">En escena: El vagón vacío</p>\n  <button>Siguiente escena</button>\n  <label>Notas de la función<textarea rows=\"3\"></textarea></label>\n  <footer>Función de las 20:00 · Sala principal</footer>\n</main>",
  "nota": "El DOM antes y después de pulsar «Siguiente escena»: de todo el HTML, solo cambia una línea"
}
```

Eso es lo que acabas de ver: **5 renderizados · 1 cambio en el DOM**. Cinco funciones ejecutadas, cuatro de ellas con un resultado idéntico al anterior, y un único texto cambiado, el de la escena, que es lo que marca el recuadro ámbar. Ese resumen explica React mejor que cualquier definición: **renderizar es barato y se hace a menudo; tocar el DOM es caro y se hace lo justo.**

¿Cómo sabe React qué ha cambiado? Compara los dos resultados **posición por posición**. Si en un sitio sigue habiendo el mismo tipo de elemento (un `<p>` donde había un `<p>`), conserva su nodo del DOM y solo actualiza los atributos o el texto que sean distintos. Si el tipo cambia (un `<div>` donde había un `<main>`), quita el viejo con todo lo que tenía dentro y crea uno nuevo desde cero. Esa segunda regla es la que pone a prueba el ejercicio del final, y la lección 26 la completa con la `key`. Si `App` devuelve sus hijos dentro de un `<main>` en un render y dentro de un `<div>` en el siguiente, el panel lo cuenta así:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "La etiqueta de fuera cambia de main a div",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "estado": "renderizado",
      "nota": "← cambió su estado: ahora devuelve un div"
    },
    {
      "nombre": "Notas",
      "nivel": 1,
      "estado": "desmontado",
      "nota": "el que estaba dentro del main, con lo que hubieras escrito"
    },
    {
      "nombre": "Notas",
      "nivel": 1,
      "estado": "montado",
      "nota": "uno nuevo dentro del div, con el campo vacío"
    }
  ]
}
```

## Y después, el navegador pinta

Cuando React termina el commit, su trabajo ha acabado. Con el DOM ya al día, el navegador **vuelve a pintar**: calcula estilos y posiciones y dibuja los píxeles en la pantalla. Al proceso del navegador también se le llama *rendering* en inglés, así que la documentación de React lo llama *painting* para no confundirlo con el render de React. Aquí, igual: pintar.

React no pinta nada; deja el DOM listo y el navegador hace el resto. Y cuantos menos cambios haya en el DOM, menos tiene que recalcular el navegador.

## Re-renderizar no es repintar la página

Junta los tres pasos y desaparece la confusión más común de quien empieza con React:

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Re-renderizar es volver a pintar la página",
      "realidad": "Es llamar a tus componentes y comparar lo que devuelven con lo de antes. Del DOM solo se toca lo que ha cambiado, y si no ha cambiado nada, nada. El panel lo dice en cada commit: tantos renderizados, tantos cambios en el DOM."
    },
    {
      "mito": "Cada render crea el HTML desde cero",
      "realidad": "React reutiliza los nodos del DOM que siguen en el mismo sitio y con el mismo tipo. Por eso el texto de un campo, el foco o el scroll de una lista sobreviven a los renders."
    },
    {
      "mito": "Un hijo solo se renderiza si cambian sus props",
      "realidad": "Por defecto se renderiza cada vez que lo hace su padre, aunque reciba lo mismo o no reciba nada: Cabecera recibe siempre el mismo título. Saltárselo es una optimización opcional, en las lecciones 66 a 68."
    },
    {
      "mito": "Hay que evitar los re-renders a toda costa",
      "realidad": "Un render es llamar a unas funciones y comparar objetos pequeños: suele costar muy poco. Se optimiza cuando se mide un problema, no antes (lecciones 65 a 68)."
    }
  ]
}
```

## React conserva lo que no cambia

Que React reutilice los nodos del DOM no es solo cuestión de velocidad: **todo lo que guarda un nodo del DOM sobrevive al render**. El texto escrito en un campo, el foco, la posición del cursor o el scroll de una lista son del navegador, no de React, y siguen ahí mientras React no sustituya el nodo.

Para verlo hace falta algo que se renderice solo, sin que pulses nada: el reloj de la cabina, que se pone en hora cada segundo. Lo hace un Hook propio, `useHora`, con un efecto dentro. Los efectos llegan en la lección 38 y los Hooks propios en la 43; de momento, tómalo como una caja negra que llama a `setHora` cada segundo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un reloj que no borra tus notas",
  "consigna": "Escribe algo en las notas y sigue escribiendo mientras el reloj avanza: ni se borra ni pierdes el cursor. En el panel, cada segundo llega un commit con 3 renderizados y 1 cambio en el DOM, y el recuadro ámbar marca solo la hora. Después borra second: '2-digit' de las opciones de toLocaleTimeString y vuelve a mirar el resumen.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import useHora from './useHora'\nimport './estilos.css'\n\nfunction Reloj({ hora }) {\n  return <p className=\"reloj\">{hora}</p>\n}\n\nfunction Notas() {\n  return (\n    <label>\n      Notas de la función\n      <textarea rows={4} />\n    </label>\n  )\n}\n\nexport default function App() {\n  const hora = useHora()\n  const texto = hora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })\n\n  return (\n    <main>\n      <h1>Teatro Alameda</h1>\n      <Reloj hora={texto} />\n      <Notas />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "useHora.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\n// Un Hook propio con un efecto dentro: devuelve la hora y la pone al día\n// cada segundo. Los efectos llegan en la lección 38 y los Hooks propios,\n// en la 43. Por ahora, una caja negra que llama a setHora cada segundo.\nexport default function useHora() {\n  const [hora, setHora] = useState(() => new Date())\n\n  useEffect(() => {\n    const id = setInterval(() => setHora(new Date()), 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return hora\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\n.cabina {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin-bottom: 0.25rem;\n}\n\n.escena {\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #1e293b;\n  color: #f8fafc;\n}\n\n.reloj {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 24rem;\n  margin: 0.75rem 0;\n}\n\ntextarea,\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.6rem;\n}\n\nfooter {\n  color: #64748b;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Cada segundo, `useHora` cambia el estado de `App` y se dispara el ciclo entero: **3 renderizados** (`App` porque cambió su estado, `Reloj` porque cambió la prop «hora» y `Notas` porque se renderizó su padre) y **1 cambio en el DOM**, el texto de la hora. `Notas` se ejecuta sesenta veces por minuto, pero devuelve siempre un `<label>` con un `<textarea>` en el mismo sitio, así que React no toca el campo: lo que escribes, el foco y el cursor se quedan donde estaban.

Fíjate en que el `<textarea>` no tiene ninguna prop que diga qué texto lleva. Lo que escribes vive en el propio nodo del DOM, y React ni lo lee ni lo guarda; simplemente no lo sustituye. Cuando quieras que React mande sobre lo que hay en un campo, lo guardarás en el estado: son los inputs controlados de la lección 22.

Y si borraste los segundos, ya lo has visto: el reloj sigue renderizando cada segundo, porque `setHora` recibe un `Date` nuevo cada vez, pero casi todos los commits dicen **0 cambios en el DOM**, y el motivo de `Reloj` pasa a ser «se renderizó su padre», porque le llega el mismo texto que la vez anterior. React llama a tres componentes, compara y no encuentra nada que cambiar hasta que cambia el minuto.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "¿Y si en vez de un textarea pones un input?",
  "contenido": "Pruébalo: lo escrito tampoco se pierde, pero el recuadro ámbar marcará también el campo y el resumen contará un cambio más en cada commit. En cada actualización de un input, React deja en blanco su atributo name y luego lo vuelve a poner como estaba, para que el campo no interfiera con los botones de opción de su grupo mientras lo actualiza. Su value, lo que has escrito, no lo toca. El panel cuenta cualquier cambio en el DOM, también ese."
}
```

## Un render arrastra a sus hijos

En los dos ejemplos se han vuelto a ejecutar componentes que no tenían nada nuevo que pintar: `Cabecera` y `Pie` con cada escena, `Notas` con cada segundo. Es el comportamiento por defecto: **cuando un componente se renderiza, React renderiza todos los que tiene debajo**, cambien o no sus props. Es sencillo, es seguro (nunca se queda nada sin actualizar) y casi siempre es barato.

La consecuencia práctica: **dónde vive un estado decide cuánto se renderiza cuando cambia**. En el reloj, la hora vivía en `App`, el componente de más arriba, y cada segundo arrastraba a toda la app. Así queda si la bajas al único componente que la usa. Mira el panel mientras corre el reloj:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La hora, en el componente que la usa",
  "codigo": "import { useEffect, useState } from 'react'\n\nfunction useHora() {\n  const [hora, setHora] = useState(() => new Date())\n\n  useEffect(() => {\n    const id = setInterval(() => setHora(new Date()), 1000)\n    return () => clearInterval(id)\n  }, [])\n\n  return hora\n}\n\nfunction Reloj() {\n  const hora = useHora()\n  const texto = hora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })\n  return <p className=\"reloj\">{texto}</p>\n}\n\nfunction Notas() {\n  return (\n    <label>\n      Notas de la función\n      <textarea rows={4} />\n    </label>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Teatro Alameda</h1>\n      <Reloj />\n      <Notas />\n    </main>\n  )\n}",
  "css": "main,\n.cabina {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin-bottom: 0.25rem;\n}\n\n.escena {\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #1e293b;\n  color: #f8fafc;\n}\n\n.reloj {\n  margin: 0.25rem 0;\n  font-size: 2rem;\n  font-weight: bold;\n  font-variant-numeric: tabular-nums;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 24rem;\n  margin: 0.75rem 0;\n}\n\ntextarea,\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.6rem;\n}\n\nfooter {\n  color: #64748b;\n  font-size: 0.9rem;\n}",
  "anotaciones": [
    {
      "fragmento": "function useHora()",
      "nota": "El mismo Hook de antes, en el mismo archivo porque este bloque solo tiene App.jsx. Sigue siendo una caja negra hasta las lecciones 38 y 43."
    },
    {
      "fragmento": "const hora = useHora()",
      "nota": "La hora vive ahora en Reloj: cada segundo cambia el estado de Reloj, no el de App. El render empieza aquí y baja; por encima y al lado, nada."
    },
    {
      "fragmento": "<Reloj />",
      "nota": "Sin props: App ya no sabe qué hora es. En el panel, App se queda sin cambios en cada tic."
    },
    {
      "fragmento": "<Notas />",
      "nota": "Notas ya ni se ejecuta: como su padre no se ha renderizado, React se salta su rama entera. Sale en el panel como sin cambios."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Ahora cada segundo hay **1 renderizado · 1 cambio en el DOM**: `Reloj` se renderiza porque cambió su estado, y `App` y `Notas` se quedan sin cambios. La página se ve igual, pero React hace la tercera parte del trabajo. Es la primera herramienta para controlar cuánto se renderiza: poner cada estado lo más cerca posible de donde se usa. La contraria, subirlo al padre cuando dos componentes lo necesitan, es la lección 25.

## El recorrido completo de un clic

Con todas las piezas, esto es lo que pasa desde que pulsas «Siguiente escena» hasta que la ves en pantalla:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Un clic, de principio a fin",
  "items": [
    {
      "fecha": "Clic",
      "titulo": "Tu manejador se ejecuta",
      "texto": "React llama a tu onClick. setPosicion(1) no cambia nada todavía: apunta el valor nuevo y deja un render pendiente. El DOM sigue igual que antes."
    },
    {
      "fecha": "Disparar",
      "titulo": "El manejador termina",
      "texto": "Con tu manejador terminado, React atiende lo pendiente. Si has llamado a varias funciones set en el mismo clic, hace un solo render con todas (lección 19)."
    },
    {
      "fecha": "Renderizar",
      "titulo": "React llama a App y a sus hijos",
      "texto": "App devuelve JSX nuevo; React llama a Cabecera, EnEscena, Notas y Pie, y compara cada resultado con el anterior. Ni un nodo del DOM tocado todavía."
    },
    {
      "fecha": "Commit",
      "titulo": "Un solo cambio en el DOM",
      "texto": "Lo único distinto es el texto de la escena: React cambia ese texto y nada más. El textarea, con lo que hubieras escrito, sigue siendo el mismo nodo."
    },
    {
      "fecha": "Pintar",
      "titulo": "El navegador dibuja",
      "texto": "Con el DOM al día, el navegador pinta la pantalla. La página se queda esperando el siguiente clic, o el siguiente segundo del reloj."
    }
  ]
}
```

## Cuándo importa de verdad

Casi nunca. React está pensado para renderizar a menudo, y en la mayoría de interfaces ni lo notarás. Puede empezar a notarse cuando un componente de arriba se renderiza muchas veces por segundo (un reloj, una animación, cada tecla de un buscador) y debajo tiene un árbol grande o algún componente lento.

Para entonces hay soluciones, más o menos por este orden: bajar el estado hasta donde se usa, como acabas de hacer; memorizar componentes con `memo` o dejar que lo haga el React Compiler (lecciones 67 y 68). Pero antes de nada, **medir**: las herramientas para saber qué se renderiza, cuánto tarda y por qué están en las lecciones 65 y 66. Optimizar sin medir suele complicar el código para nada.

## Errores típicos

**Leer el DOM justo después de llamar a `set`.** El commit todavía no ha llegado:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function manejarSiguiente() {\n  setPosicion((posicion + 1) % escenas.length)\n  const texto = document.querySelector('.escena').textContent\n  console.log(texto)\n}\n\n// Está en marcha «La estación» y pulsas «Siguiente escena».\n// ¿Qué escribe la consola?",
  "opciones": [
    "En escena: El vagón vacío",
    "En escena: La estación",
    "null: React está reconstruyendo el párrafo",
    "Un error: no se puede leer el DOM dentro de un manejador"
  ],
  "correcta": 1,
  "explicacion": "set no toca el DOM: apunta el cambio, y React renderiza y hace el commit cuando tu manejador ha terminado. Mientras se ejecuta, el DOM sigue siendo el del commit anterior. Casi nunca hace falta leerlo: el valor nuevo lo puedes calcular tú. Para los pocos casos en que necesitas el DOM ya actualizado, como hacer scroll hasta un elemento nuevo, existe flushSync (lección 34)."
}
```

**Contar líneas de la consola para saber qué ha cambiado en la página.** Diez líneas de «Renderizo...» por clic no significan que la página se haya reconstruido diez veces: significan que React ha llamado a tus funciones (dos veces cada una, con `StrictMode`). Lo que ha cambiado de verdad lo dice el resumen del panel, «N cambios en el DOM», o el recuadro ámbar.

**Poner trabajo caro o efectos en el cuerpo de un componente.** Ahora sabes que un componente puede renderizarse cada segundo, o con cada tecla. Un cálculo pesado ahí se repite en cada render (la lección 67 enseña a memorizarlo), y algo como una petición al servidor se lanzaría una y otra vez: los efectos secundarios van en los manejadores o en un efecto (lecciones 12 y 38), nunca en el render.

**Llamar a `set` con el mismo valor «para refrescar».** `setPosicion(posicion)` no dispara nada: React compara, ve que no ha cambiado y se ahorra el render. Si necesitas que algo se vuelva a calcular, es que ese algo depende de un dato que debería estar en el estado o llegar por props.

**Cambiar la etiqueta que envuelve algo según el estado.** Si un mismo campo aparece dentro de un `<main>` en un render y dentro de un `<div>` en el siguiente, React no ve el mismo campo en el mismo sitio: lo destruye y crea otro vacío. Es justo el fallo del ejercicio.

## Ejercicios

La regidora va apuntando en las notas lo que tiene que avisar en la segunda parte de la función, pero cada vez que pone la cabina en modo descanso, las notas se borran.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Que las notas sobrevivan al descanso",
  "consigna": "Escribe algo en las notas y pulsa «Pasar al descanso»: se borra. En el panel, Notas sale desmontado y vuelve a montarse desde cero. Arréglalo en App.jsx para que App devuelva siempre la misma estructura: un solo return, con el mismo elemento por fuera, en el que solo cambien la clase, el aviso («En escena» o «Descanso») y el texto del botón. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction Notas() {\n  return (\n    <label>\n      Notas de la función\n      <textarea rows={4} />\n    </label>\n  )\n}\n\n// Al pasar al descanso se borran las notas. Haz que App devuelva siempre\n// la misma estructura: un solo return, con el mismo elemento por fuera,\n// en el que solo cambien la clase, el texto del aviso y el del botón.\nexport default function App() {\n  const [enDescanso, setEnDescanso] = useState(false)\n\n  if (enDescanso) {\n    return (\n      <div className=\"cabina descanso\">\n        <h1>Teatro Alameda</h1>\n        <p className=\"aviso\">Descanso</p>\n        <Notas />\n        <button onClick={() => setEnDescanso(false)}>Volver a la función</button>\n      </div>\n    )\n  }\n\n  return (\n    <main className=\"cabina\">\n      <h1>Teatro Alameda</h1>\n      <p className=\"aviso\">En escena</p>\n      <Notas />\n      <button onClick={() => setEnDescanso(true)}>Pasar al descanso</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".cabina {\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  background: #ecfdf5;\n}\n\n.descanso {\n  background: #fef3c7;\n}\n\n.aviso {\n  font-weight: bold;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  max-width: 24rem;\n  margin: 0.75rem 0;\n}\n\ntextarea,\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.6rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Lo escrito en las notas sigue ahí al pasar al descanso",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas de la función",
            "texto": "Revisar el foco del segundo acto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pasar al descanso"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas de la función",
        "valor": "Revisar el foco del segundo acto"
      }
    },
    {
      "descripcion": "Y sigue ahí al volver a la función",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas de la función",
            "texto": "Revisar el foco del segundo acto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pasar al descanso"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Volver a la función"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas de la función",
        "valor": "Revisar el foco del segundo acto"
      }
    },
    {
      "descripcion": "Al pasar al descanso, el aviso dice «Descanso»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pasar al descanso"
          }
        }
      ],
      "espera": {
        "texto": "Descanso"
      }
    },
    {
      "descripcion": "Al volver, el aviso dice otra vez «En escena»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pasar al descanso"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Volver a la función"
          }
        }
      ],
      "espera": {
        "texto": "En escena"
      }
    }
  ]
}
```

Con la solución, el panel cuenta otra historia: al pasar al descanso, `App` se renderiza porque cambió su estado y `Notas` porque se renderizó su padre, pero ya no se desmonta. El resumen dice **3 cambios en el DOM**: la clase del `<main>`, el texto del aviso y el del botón. El `<textarea>` sigue siendo el mismo nodo.

**Retos para seguir practicando** (sin comprobación automática):

1. En el bloque de las escenas, añade a `App` un estado `aplausos` y un botón «Aplauso» que lo suba. Antes de pulsarlo, predice qué dirá el panel de cada componente y cuántos cambios en el DOM habrá; después compruébalo.
2. En la solución del ejercicio, vuelve a escribir dos `return`, pero los dos con `<main>`. ¿Sobreviven ahora las notas? ¿Por qué? La lección 26 te dará la respuesta completa.
3. En el reloj, haz que la hora se ponga en rojo durante el último minuto de cada hora, con una clase condicional. ¿Qué marca el recuadro ámbar en el commit en que aparece la clase?
4. En el bloque del reloj con la hora en `App`, mete el `<textarea>` directamente en el JSX de `App`, sin el componente `Notas`. ¿Sigue conservando lo que escribes? ¿Qué cambia en el panel?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Render and Commit",
      "descripcion": "La página de react.dev en la que se basa esta lección, con la metáfora del restaurante y un reloj con un campo de texto que no se borra.",
      "url": "https://react.dev/learn/render-and-commit",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: funciones set",
      "descripcion": "La referencia de las funciones set: por qué el mismo valor no provoca un render y cómo agrupa React varias actualizaciones de un mismo evento.",
      "url": "https://react.dev/reference/react/useState#setstate",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Preserving and Resetting State",
      "descripcion": "Cuándo conserva React un componente y su estado y cuándo lo crea de nuevo: posición, tipo y key. Es la lección 26.",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Developer Tools",
      "descripcion": "La extensión del navegador para ver el árbol de componentes de cualquier web hecha con React. La usarás a fondo en la lección 65.",
      "url": "https://react.dev/learn/react-developer-tools",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Populating the page: how browsers work",
      "descripcion": "Qué hace el navegador desde que tiene el DOM hasta que dibuja los píxeles: estilos, layout y pintado.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work",
      "etiqueta": "MDN"
    },
    {
      "titulo": "MutationObserver",
      "descripcion": "La API del navegador que avisa de cada cambio en el DOM. Es la que usa el panel «Árbol de renders» para contar los cambios reales de cada commit.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver",
      "etiqueta": "MDN"
    }
  ]
}
```
