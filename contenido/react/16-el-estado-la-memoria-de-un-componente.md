# El estado: la memoria de un componente

- **Módulo:** Interactividad
- **Slug:** `el-estado-la-memoria-de-un-componente` (autogenerado del título)
- **Orden:** 160
- **Fuentes:** [State: A Component's Memory](https://react.dev/learn/state-a-components-memory) + [useState](https://react.dev/reference/react/useState) — ver `contenido/react/TEMARIO.md` #16

---

## Qué es y para qué sirve

Hasta ahora tus componentes pintaban lo que recibían por props y nada más: mismas props, misma pantalla. Pero casi cualquier interfaz tiene que **recordar** algo que cambia mientras la usas: en qué tarjeta de un repaso vas, si has destapado la respuesta, qué has escrito en un campo, qué llevas en el carrito. Esa memoria propia de cada componente se llama **estado**.

Lo has usado como caja negra desde la lección 1, siempre con la misma línea: `const [algo, setAlgo] = useState(...)`. En esta lección la abres. Verás por qué una variable normal no sirve, qué hace exactamente `useState`, dónde guarda React cada valor, cómo sabe cuál es cuál y qué merece ser estado y qué no.

Los ejemplos son de una app de tarjetas de vocabulario para repasar inglés: una palabra en español en cada tarjeta, la traducción escondida y un botón para pasar a la siguiente.

## Una variable normal no se acuerda de nada

El primer intento es el que harías en JavaScript sin React: una variable con `let` y un manejador que la cambia. Debajo de la vista previa tienes el panel **«Árbol de renders»**, que estrenaste en la lección 13: cada vez que React vuelve a ejecutar tus componentes y aplica el resultado a la página, el panel dibuja el árbol de nuevo y lo numera, «Commit 2», «Commit 3»..., como las rayas de la consola que viste en la lección 12.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una tarjeta que no pasa de la primera",
  "consigna": "Pulsa «Siguiente» tres veces. La consola dice que indice vale 1, 2 y 3, pero la tarjeta no cambia. Mira el panel: sigue en el commit 1, con App y Mazo montados y ni un solo re-render.",
  "archivos": [
    {
      "nombre": "Mazo.jsx",
      "codigo": "const tarjetas = [\n  { palabra: 'la mariposa', traduccion: 'the butterfly' },\n  { palabra: 'el paraguas', traduccion: 'the umbrella' },\n  { palabra: 'la tormenta', traduccion: 'the storm' },\n  { palabra: 'el andén', traduccion: 'the platform' },\n]\n\nexport default function Mazo() {\n  let indice = 0\n\n  function manejarSiguiente() {\n    indice = indice + 1\n    console.log('indice vale', indice)\n  }\n\n  const tarjeta = tarjetas[indice]\n\n  return (\n    <section className=\"tarjeta\">\n      <p>Tarjeta {indice + 1} de {tarjetas.length}</p>\n      <h2>{tarjeta.palabra}</h2>\n      <button onClick={manejarSiguiente}>Siguiente</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Mazo from './Mazo'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Repaso de inglés</h1>\n      <Mazo />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 22rem;\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0 0.75rem;\n}\n\n.traduccion {\n  margin-top: 0;\n  color: #0369a1;\n  font-style: italic;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "Mazo.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

La variable cambia, eso lo demuestra la consola. Pero hay **dos problemas**, y basta uno de los dos para que no funcione:

1. **Cambiar una variable local no avisa a React.** React no vigila tus variables. Para él no ha pasado nada, así que no vuelve a llamar a `Mazo` y la página se queda con lo que devolvió la primera vez. Por eso el panel no se mueve: no hay ningún render nuevo que enseñar.
2. **Una variable local no sobrevive al siguiente render.** Aunque algo hiciera que React volviera a llamar a `Mazo`, la función empezaría desde arriba y `let indice = 0` crearía otra variable que vale 0. Cada render es una llamada nueva, con sus variables nuevas, como cualquier función de JavaScript.

El primero ya lo viste en la lección 1. El segundo se ve poco, porque necesita que algo provoque un render. Aquí `Mazo` tiene un segundo dato, si se ve la traducción, guardado ya en el estado, y pulsar «Ver traducción» sí hace que React vuelva a llamarlo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// tarjetas: la mariposa, el paraguas, la tormenta y el andén\nexport default function Mazo() {\n  let indice = 0\n  const [verTraduccion, setVerTraduccion] = useState(false)\n  const tarjeta = tarjetas[indice]\n\n  return (\n    <section>\n      <p>Tarjeta {indice + 1} de {tarjetas.length}</p>\n      <h2>{tarjeta.palabra}</h2>\n      {verTraduccion && <p>{tarjeta.traduccion}</p>}\n      <button onClick={() => { indice = indice + 1 }}>Siguiente</button>\n      <button onClick={() => setVerTraduccion(true)}>Ver traducción</button>\n    </section>\n  )\n}\n\n// Pulsas «Siguiente» dos veces y después «Ver traducción». ¿Qué se ve?",
  "opciones": [
    "Tarjeta 3 de 4: la tormenta, con «the storm» debajo",
    "Tarjeta 1 de 4: la mariposa, con «the butterfly» debajo",
    "Tarjeta 1 de 4: la mariposa, sin traducción",
    "Un error: indice ya no existe"
  ],
  "correcta": 1,
  "explicacion": "«Ver traducción» cambia un estado, así que React vuelve a llamar a Mazo. Esa llamada empieza desde arriba: let indice = 0 crea una variable nueva que vale 0, y los dos clics de «Siguiente» se pierden. La traducción sí aparece, porque verTraduccion no es una variable de la función: React la guardó entre un render y otro."
}
```

Para que un componente recuerde algo hacen falta, por tanto, dos cosas:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que necesita un dato para que la pantalla lo siga",
  "roles": [
    {
      "etiqueta": "Conservarse",
      "rol": "Sobrevivir de un render al siguiente",
      "descripcion": "Guardado fuera de tu función, para que cada render reciba el último valor en vez de empezar de cero."
    },
    {
      "etiqueta": "Avisar",
      "rol": "Pedir un render nuevo al cambiar",
      "descripcion": "Cambiar el valor tiene que decirle a React que vuelva a llamar al componente para pintar el dato nuevo."
    }
  ]
}
```

`useState` te da las dos cosas a la vez.

## `useState`: un valor que React guarda por ti

Este es el mismo mazo con estado. Recórrelo línea a línea y pruébalo debajo, con el panel a la vista:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La tarjeta, con estado",
  "codigo": "import { useState } from 'react'\n\nconst tarjetas = [\n  { palabra: 'la mariposa', traduccion: 'the butterfly' },\n  { palabra: 'el paraguas', traduccion: 'the umbrella' },\n  { palabra: 'la tormenta', traduccion: 'the storm' },\n  { palabra: 'el andén', traduccion: 'the platform' },\n]\n\nfunction Mazo() {\n  const [indice, setIndice] = useState(0)\n  const tarjeta = tarjetas[indice]\n\n  function manejarSiguiente() {\n    setIndice((indice + 1) % tarjetas.length)\n  }\n\n  return (\n    <section className=\"tarjeta\">\n      <p>Tarjeta {indice + 1} de {tarjetas.length}</p>\n      <h2>{tarjeta.palabra}</h2>\n      <button onClick={manejarSiguiente}>Siguiente</button>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Repaso de inglés</h1>\n      <Mazo />\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 22rem;\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0 0.75rem;\n}\n\n.traduccion {\n  margin-top: 0;\n  color: #0369a1;\n  font-style: italic;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}",
  "anotaciones": [
    {
      "fragmento": "import { useState } from 'react'",
      "nota": "useState es una función que exporta React, y se importa con nombre como cualquier otra (lección 4). Si se te olvida, el render falla con «useState is not defined»."
    },
    {
      "fragmento": "const [indice, setIndice] = useState(0)",
      "nota": "Le pides a React que este componente recuerde un valor. useState devuelve un array de dos elementos, y la desestructuración les pone nombre: el valor de este render y la función para cambiarlo."
    },
    {
      "fragmento": "useState(0)",
      "nota": "El valor inicial: lo que vale indice en el primer render. En los siguientes, React lo ignora y te devuelve el último valor que guardó."
    },
    {
      "fragmento": "const tarjeta = tarjetas[indice]",
      "nota": "Lo demás se calcula en cada render a partir del estado. tarjeta no es estado: sale de indice, y si indice cambia, tarjeta cambia con él."
    },
    {
      "fragmento": "setIndice((indice + 1) % tarjetas.length)",
      "nota": "La función set guarda el valor nuevo y le pide a React un render. El resto de la división (%) vuelve a la primera tarjeta después de la última, para no salirse del array."
    },
    {
      "fragmento": "<Mazo />",
      "nota": "App no tiene estado ni sabe que Mazo lo tiene. Al pulsar «Siguiente», el panel la deja sin cambios: el render empieza en Mazo."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Pulsa «Siguiente» y mira el panel. Ahora sí aparece un commit nuevo, y en él `Mazo` pasa a **re-render** con el motivo **«cambió su estado»**, mientras `App` se queda **sin cambios**: como viste en la lección 13, el render empieza en el componente cuyo estado cambia y baja, nunca sube. El número que acompaña a cada nombre (`·2`, `·3`...) cuenta cuántas veces se ha renderizado.

Pulsa el nombre `Mazo` dentro del panel: en «Estado» verás el valor que React tiene guardado para él, el mismo `indice` que usa la tarjeta.

### El par que devuelve `useState`

`useState` devuelve siempre un array de dos elementos, en el mismo orden. La desestructuración es solo la forma cómoda de leerlo; esto hace exactamente lo mismo:

```jsx
const par = useState(0)
const indice = par[0]    // el valor de este render
const setIndice = par[1] // la función para cambiarlo
```

La convención es llamarlos `[algo, setAlgo]`: `[indice, setIndice]`, `[verTraduccion, setVerTraduccion]`, `[tarjetas, setTarjetas]`. React no lo exige, podrías escribir `[a, b]`, pero cualquiera que lea tu código espera ese patrón y entiende de un vistazo qué función cambia qué valor.

Fíjate también en el `const`. El estado **no se reasigna**: se cambia siempre con su función `set`, que es la que avisa a React. Qué pasa si lo intentas con un `=`, en «Errores típicos».

## Qué pasa cuando pulsas, render a render

`useState(0)` está escrito en el cuerpo del componente, así que se ejecuta en **cada** render. Lo que cambia es lo que devuelve:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Dos renders de Mazo y un clic en medio",
  "items": [
    {
      "fecha": "Primer render",
      "titulo": "useState(0) devuelve [0, setIndice]",
      "texto": "React no tiene nada guardado todavía para este Mazo, así que usa el valor inicial, 0, y lo apunta. La tarjeta muestra la mariposa."
    },
    {
      "fecha": "Clic",
      "titulo": "setIndice(1)",
      "texto": "El manejador calcula (0 + 1) % 4 y llama a setIndice(1). React apunta que ahora vale 1 y deja un render pendiente. La variable indice de este render sigue valiendo 0: el porqué es la lección 18."
    },
    {
      "fecha": "Segundo render",
      "titulo": "useState(0) devuelve [1, setIndice]",
      "texto": "React vuelve a llamar a Mazo desde la primera línea. El código sigue diciendo useState(0), pero React ya tiene un 1 guardado para este componente y te da ese. El 0 se ignora."
    },
    {
      "fecha": "Después",
      "titulo": "La página se pone al día",
      "texto": "React compara lo que devolvió Mazo con lo de antes y cambia en el DOM solo lo que es distinto: el número y la palabra. Ese último paso, y por qué no toca nada más, es la lección 17."
    }
  ]
}
```

La idea clave: **el componente no guarda nada; lo guarda React**. Tu función se ejecuta entera en cada render y olvida sus variables al terminar. `useState` es la forma de preguntarle a React «¿qué tenías apuntado para mí?».

## Varias variables de estado

Un componente puede tener tantos estados como necesite, y de cualquier tipo: números, textos, booleanos, arrays u objetos. Este `Mazo` recuerda además si se está viendo la traducción:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos estados en el mismo componente",
  "consigna": "Pulsa «Ver traducción» y después «Siguiente», mirando el motivo de Mazo en el panel: primero «cambió su estado n.º 2» y luego «n.º 1». Pulsa el nombre Mazo en el panel para ver sus dos estados. ¿Qué le pasa a la traducción al cambiar de tarjeta?",
  "archivos": [
    {
      "nombre": "Mazo.jsx",
      "codigo": "import { useState } from 'react'\n\nconst tarjetas = [\n  { palabra: 'la mariposa', traduccion: 'the butterfly' },\n  { palabra: 'el paraguas', traduccion: 'the umbrella' },\n  { palabra: 'la tormenta', traduccion: 'the storm' },\n  { palabra: 'el andén', traduccion: 'the platform' },\n]\n\nexport default function Mazo() {\n  const [indice, setIndice] = useState(0)\n  const [verTraduccion, setVerTraduccion] = useState(false)\n  const tarjeta = tarjetas[indice]\n\n  return (\n    <section className=\"tarjeta\">\n      <p>Tarjeta {indice + 1} de {tarjetas.length}</p>\n      <h2>{tarjeta.palabra}</h2>\n      {verTraduccion && <p className=\"traduccion\">{tarjeta.traduccion}</p>}\n      <button onClick={() => setIndice((indice + 1) % tarjetas.length)}>Siguiente</button>\n      <button onClick={() => setVerTraduccion(!verTraduccion)}>\n        {verTraduccion ? 'Ocultar traducción' : 'Ver traducción'}\n      </button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Mazo from './Mazo'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Repaso de inglés</h1>\n      <Mazo />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 22rem;\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0 0.75rem;\n}\n\n.traduccion {\n  margin-top: 0;\n  color: #0369a1;\n  font-style: italic;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "Mazo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

El panel numera los estados: el n.º 1 es `indice` y el n.º 2, `verTraduccion`. No sabe cómo has llamado a tus variables, solo **en qué orden** has llamado a `useState`. React tampoco lo sabe, y eso tiene consecuencias que verás en un momento.

Al pasar de tarjeta, la traducción sigue a la vista. `verTraduccion` no se entera de que ha cambiado `indice`: son dos datos independientes, y cada `set` cambia solo el suyo. Hacer que «Siguiente» la esconda es uno de los retos del final.

¿Uno o varios estados? Si dos datos cambian por separado, como estos, cada uno en su `useState`. Si siempre cambian a la vez, como los campos de un mismo formulario, puede convenirte un solo estado con un objeto: lo verás en las lecciones 20 y 24.

## Cada copia tiene su propio estado

El estado no pertenece a la función `Mazo`, sino a **cada sitio de la pantalla donde la usas**. Si renderizas dos mazos, React guarda dos juegos de estados, uno para cada uno:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Dos Mazo, dos memorias",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "sin estado"
    },
    {
      "nombre": "Mazo",
      "nivel": 1,
      "etiqueta": "estado: indice, verTraduccion",
      "nota": "idioma=\"Inglés\""
    },
    {
      "nombre": "Mazo",
      "nivel": 1,
      "etiqueta": "estado: indice, verTraduccion",
      "nota": "idioma=\"Italiano\""
    }
  ]
}
```

Los mismos nombres, pero no los mismos valores. Compruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos mazos que no se enteran el uno del otro",
  "consigna": "Pulsa «Siguiente» en el mazo de inglés. En el panel solo el primer Mazo pasa a re-render; App y el mazo de italiano siguen sin cambios. Destapa la traducción del italiano y vuelve a mirar. Por último, pulsa cada Mazo en el panel: mismas props por fuera, estados distintos por dentro.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Mazo from './Mazo'\nimport './estilos.css'\n\nconst ingles = [\n  { palabra: 'la mariposa', traduccion: 'the butterfly' },\n  { palabra: 'el paraguas', traduccion: 'the umbrella' },\n  { palabra: 'la tormenta', traduccion: 'the storm' },\n]\n\nconst italiano = [\n  { palabra: 'la mariposa', traduccion: 'la farfalla' },\n  { palabra: 'el paraguas', traduccion: \"l'ombrello\" },\n  { palabra: 'la tormenta', traduccion: 'il temporale' },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Mis mazos de vocabulario</h1>\n      <Mazo idioma=\"Inglés\" tarjetas={ingles} />\n      <Mazo idioma=\"Italiano\" tarjetas={italiano} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Mazo.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Mazo({ idioma, tarjetas }) {\n  const [indice, setIndice] = useState(0)\n  const [verTraduccion, setVerTraduccion] = useState(false)\n  const tarjeta = tarjetas[indice]\n\n  return (\n    <section className=\"tarjeta\">\n      <h2>{idioma}</h2>\n      <p>Tarjeta {indice + 1} de {tarjetas.length}: {tarjeta.palabra}</p>\n      {verTraduccion && <p className=\"traduccion\">{tarjeta.traduccion}</p>}\n      <button onClick={() => setIndice((indice + 1) % tarjetas.length)}>Siguiente</button>\n      <button onClick={() => setVerTraduccion(!verTraduccion)}>\n        {verTraduccion ? 'Ocultar traducción' : 'Ver traducción'}\n      </button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 22rem;\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0 0.75rem;\n}\n\n.traduccion {\n  margin-top: 0;\n  color: #0369a1;\n  font-style: italic;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Es lo que viste con los dos contadores de la lección 1, ahora con el panel delante: **el estado es local a cada copia** del componente. React lo guarda asociado a la posición de cada `Mazo` en el árbol; qué pasa cuando esa posición cambia es la lección 26.

Y es **privado**. `App` no tiene forma de leer en qué tarjeta va cada mazo ni de cambiarla, y eso es una ventaja: puedes añadirle o quitarle estado a un componente sin romper a nadie. Si algún día dos componentes necesitan el mismo dato (un botón «Reiniciar los dos mazos» en `App`, por ejemplo), el estado no se comparte entre hermanos: se sube al padre común y baja por props. Es la lección 25.

## Qué es un Hook

`useState` es el primer **Hook** del temario. Los Hooks son las funciones de React que empiezan por `use` y que dejan a un componente «engancharse» a algo que gestiona React mientras lo renderiza: el estado (`useState`), un valor que se recuerda sin provocar renders (`useRef`, lección 33), un contexto (`useContext`, lección 28), un efecto (`useEffect`, lección 38)... y los que escribas tú, que también empiezan por `use` (lección 43).

Como solo funcionan mientras React está renderizando un componente, tienen **dos reglas**. No son de estilo: si las rompes, el componente falla.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Solo en el nivel superior",
      "texto": "Llámalos al principio del cuerpo del componente, antes de cualquier return, y nunca dentro de un if, un bucle, un map, un manejador de eventos u otra función anidada. Así se ejecutan en todos los renders, y siempre en el mismo orden."
    },
    {
      "titulo": "Solo en componentes o en tus propios Hooks",
      "texto": "Nunca desde una función normal de JavaScript ni desde fuera de un componente. Fuera de un render, React no tiene ningún componente al que asociar ese estado."
    },
    {
      "titulo": "Piensa en ellos como declaraciones",
      "texto": "Un Hook declara algo que el componente necesita, siempre lo mismo y arriba del todo, igual que los import declaran arriba del archivo lo que necesita un módulo."
    },
    {
      "titulo": "A fondo, en la lección 44",
      "texto": "Las reglas completas de los Hooks, sus casos especiales y la regla del linter que las vigila mientras escribes están en la lección 44."
    }
  ]
}
```

Así se ven las dos reglas rotas en un componente de repaso. Solo la primera llamada está bien:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nfunction contarPendientes(tarjetas) {\n  const [pendientes, setPendientes] = useState(tarjetas.length)\n  return pendientes\n}\n\nexport default function Repaso({ tarjetas, modoExamen }) {\n  const [indice, setIndice] = useState(0)\n\n  if (modoExamen) {\n    const [segundos, setSegundos] = useState(60)\n  }\n\n  function manejarFallo() {\n    const [fallos, setFallos] = useState(0)\n  }\n\n  return (\n    <ul>\n      {tarjetas.map((tarjeta) => {\n        const [volteada, setVolteada] = useState(false)\n        return <li key={tarjeta.palabra}>{tarjeta.palabra}</li>\n      })}\n    </ul>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const [indice, setIndice] = useState(0)",
      "nota": "Bien: en el nivel superior del componente, antes de cualquier condición. Se ejecuta en todos los renders."
    },
    {
      "fragmento": "function contarPendientes(tarjetas)",
      "nota": "Mal: contarPendientes es una función normal, ni componente (no empieza por mayúscula) ni Hook (no empieza por use). Si quieres reutilizar lógica con estado, se escribe un Hook propio, useAlgo: lección 43."
    },
    {
      "fragmento": "if (modoExamen) {",
      "nota": "Mal: dentro de un if, el Hook se llama en unos renders sí y en otros no. Decláralo siempre arriba y usa su valor solo cuando haga falta."
    },
    {
      "fragmento": "function manejarFallo() {",
      "nota": "Mal: un manejador se ejecuta al hacer clic, no durante el render. El estado se declara arriba y el manejador solo llama a su set."
    },
    {
      "fragmento": "const [volteada, setVolteada] = useState(false)",
      "nota": "Mal: dentro de un map, el número de llamadas depende de cuántas tarjetas haya. Si cada tarjeta necesita su propio estado, sácala a un componente Tarjeta con su useState y pinta un Tarjeta por elemento."
    }
  ]
}
```

## Cómo sabe React qué estado es cuál

Fíjate en algo raro: `useState(0)` no recibe ningún nombre. En cada render, `Mazo` llama a `useState(0)` y luego a `useState(false)`, y React le devuelve a cada uno su valor. ¿Cómo sabe que el primero es `indice` y el segundo, `verTraduccion`?

**Por el orden.** Para cada componente que hay en pantalla, React guarda una lista con sus estados. Antes de cada render pone un marcador al principio de la lista, y cada llamada a `useState` se lleva el valor que hay donde está el marcador y lo pasa al siguiente. En el primer render la lista está vacía, así que cada llamada añade su valor inicial. Nada más: ni nombres, ni magia.

Este bloque no usa React. Es un `useState` de juguete, en JavaScript normal, que funciona con esa idea. El de verdad hace mucho más, pero el principio es este:

```laboratorio
{
  "tipo": "editor-en-vivo",
  "titulo": "Un useState de juguete, sin React",
  "consigna": "Pulsa los botones y mira la lista de cajones: el cajón 0 es indice y el 1, verTraduccion. Después añade en Mazo un tercer estado, const [aciertos, setAciertos] = useState(0), y comprueba que aparece un tercer cajón.",
  "html": "<h2 id=\"tarjeta\"></h2>\n<button id=\"siguiente\">Siguiente</button>\n<button id=\"traducir\">Ver traducción</button>\n<pre id=\"cajones\"></pre>",
  "css": "body {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n\npre {\n  padding: 0.5rem;\n  border-radius: 6px;\n  background: #f1f5f9;\n}",
  "js": "// Un useState de juguete: la idea de cómo funciona, no el código de React.\nconst cajones = [] // los estados de Mazo, en orden\nlet posicion = 0 // qué cajón le toca al próximo useState\n\nfunction useState(valorInicial) {\n  const mio = posicion\n  posicion = posicion + 1\n\n  if (mio === cajones.length) {\n    cajones.push(valorInicial) // primer render: se crea el cajón\n  }\n\n  function setCajon(nuevoValor) {\n    cajones[mio] = nuevoValor // guarda el valor nuevo...\n    renderizar() // ...y vuelve a renderizar\n  }\n\n  return [cajones[mio], setCajon]\n}\n\nconst tarjetas = [\n  { palabra: 'la mariposa', traduccion: 'the butterfly' },\n  { palabra: 'el paraguas', traduccion: 'the umbrella' },\n  { palabra: 'la tormenta', traduccion: 'the storm' },\n]\n\n// El \"componente\": en cada render llama a useState en el mismo orden\nfunction Mazo() {\n  const [indice, setIndice] = useState(0)\n  const [verTraduccion, setVerTraduccion] = useState(false)\n  const tarjeta = tarjetas[indice]\n\n  return {\n    texto: tarjeta.palabra + (verTraduccion ? ' → ' + tarjeta.traduccion : ''),\n    alPulsarSiguiente: () => setIndice((indice + 1) % tarjetas.length),\n    alPulsarTraducir: () => setVerTraduccion(!verTraduccion),\n  }\n}\n\n// Lo que hace React por ti: llamar al componente y poner la página al día\nfunction renderizar() {\n  posicion = 0 // cada render empieza por el primer cajón\n  const salida = Mazo()\n  document.querySelector('#tarjeta').textContent = salida.texto\n  document.querySelector('#siguiente').onclick = salida.alPulsarSiguiente\n  document.querySelector('#traducir').onclick = salida.alPulsarTraducir\n  document.querySelector('#cajones').textContent =\n    'cajones = ' + JSON.stringify(cajones) + '  (useState llamado ' + posicion + ' veces)'\n}\n\nrenderizar()",
  "pestañaInicial": "js"
}
```

Ahora se entiende la primera regla de los Hooks. Si un `useState` se salta en un render, porque está dentro de un `if` que esta vez no se cumple o después de un `return` que esta vez sí se ejecuta, todos los que vienen detrás se llevan el cajón equivocado. El React de verdad lo detecta en cuanto la lista no le cuadra, y para en seco.

Pasa con un error muy común: un `return` anticipado antes de un Hook. Esta tarjeta solo enseña la traducción cuando la das la vuelta, y quien la escribió pensó que el segundo estado solo hacía falta en ese caso:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un Hook después de un return",
  "consigna": "Pulsa «Ver traducción»: la vista previa se cae. Lee el error y la tabla de la consola. Después arréglalo: sube la línea de laSabia justo debajo de la de volteada, antes del if, y vuelve a probar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction Tarjeta({ palabra, traduccion }) {\n  const [volteada, setVolteada] = useState(false)\n\n  if (!volteada) {\n    return (\n      <section className=\"tarjeta\">\n        <h2>{palabra}</h2>\n        <button onClick={() => setVolteada(true)}>Ver traducción</button>\n      </section>\n    )\n  }\n\n  const [laSabia, setLaSabia] = useState(false)\n\n  return (\n    <section className=\"tarjeta\">\n      <h2>{palabra}: {traduccion}</h2>\n      <button onClick={() => setLaSabia(true)}>Me la sabía</button>\n      {laSabia && <p>¡Bien! Una menos para repasar.</p>}\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Repaso de inglés</h1>\n      <Tarjeta palabra=\"la tormenta\" traduccion=\"the storm\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 22rem;\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0 0.75rem;\n}\n\n.traduccion {\n  margin-top: 0;\n  color: #0369a1;\n  font-style: italic;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El recuadro rojo dice «Rendered more hooks than during the previous render» (se han ejecutado más Hooks que en el render anterior) y señala la línea del segundo `useState`. En el primer render, `Tarjeta` llamó a `useState` una vez y salió por el `return`; en el segundo, con `volteada` a `true`, llegó hasta abajo y lo llamó dos veces. Y la consola enseña **la lista de React** tal cual:

```text
React has detected a change in the order of Hooks called by Tarjeta. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://react.dev/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useState                   useState
2. undefined                  useState
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

Es decir: «React ha detectado un cambio en el orden de los Hooks que llama `Tarjeta`. Esto provocará fallos si no lo arreglas». La tabla compara render con render, posición por posición: en el anterior, la posición 2 no existía (`undefined`); en este hay un `useState`. Es el mismo error que provocaste en la lección 12 al llamar a un componente como si fuera una función: allí los Hooks de `Puerta` acababan en la lista de `App`.

El arreglo es subir el `useState` por encima del `if`. Los dos estados existen siempre, aunque en el primer render `laSabia` todavía no se use. Un `return` anticipado está bien, **siempre que vaya después de todos los Hooks**.

Y ahora sabes por qué el panel dice «cambió su estado n.º 2» y no «cambió verTraduccion»: el número es la posición en esa lista, lo único que React conoce de tus estados.

## El valor inicial solo se usa una vez

El argumento de `useState` es el valor inicial, y React **solo lo usa en el primer render**; en los siguientes lo ignora. Con un `0` o un `false` da igual, pero hay un caso en el que importa: cuando el valor inicial sale de llamar a una función.

En esta versión, el mazo se prepara a partir de un texto con todo el vocabulario, y el botón «Ya me la sé» quita la tarjeta actual. La función `prepararMazo` avisa por la consola cada vez que se ejecuta:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un mazo que se prepara en cada render",
  "consigna": "Mira la consola al cargar y pulsa «Siguiente» un par de veces: cada clic vuelve a preparar el mazo entero, dos veces por StrictMode, aunque React tira el resultado. Pulsa también «Ya me la sé» y fíjate en que la tarjeta quitada no vuelve.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst VOCABULARIO = 'la mariposa=the butterfly; el paraguas=the umbrella; la tormenta=the storm; el andén=the platform; la llave=the key'\n\nfunction prepararMazo() {\n  console.log('Preparo el mazo')\n  return VOCABULARIO.split('; ').map((linea) => {\n    const [palabra, traduccion] = linea.split('=')\n    return { palabra, traduccion }\n  })\n}\n\nexport default function App() {\n  const [tarjetas, setTarjetas] = useState(prepararMazo())\n  const [indice, setIndice] = useState(0)\n\n  if (tarjetas.length === 0) {\n    return <p>¡Mazo terminado! Ya te las sabes todas.</p>\n  }\n\n  const tarjeta = tarjetas[indice]\n\n  function manejarYaMeLaSe() {\n    setTarjetas(tarjetas.filter((t) => t !== tarjeta))\n    setIndice(0)\n  }\n\n  return (\n    <main>\n      <h1>Repaso de inglés</h1>\n      <p>Tarjeta {indice + 1} de {tarjetas.length}: {tarjeta.palabra}</p>\n      <button onClick={() => setIndice((indice + 1) % tarjetas.length)}>Siguiente</button>\n      <button onClick={manejarYaMeLaSe}>Ya me la sé</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 22rem;\n  margin-bottom: 1rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 10px;\n  background: #f8fafc;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0 0.75rem;\n}\n\n.traduccion {\n  margin-top: 0;\n  color: #0369a1;\n  font-style: italic;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

`useState(prepararMazo())` **llama a `prepararMazo` en cada render**. No es cosa de React: JavaScript evalúa los argumentos antes de llamar a una función, así que primero ejecuta `prepararMazo()` y después le pasa el resultado a `useState`, que desde el segundo render lo tira sin mirarlo. Con cinco palabras no se nota; con un vocabulario de miles, o con un cálculo caro, cada clic haría ese trabajo para nada.

Por cierto, el `return` de «¡Mazo terminado!» está bien puesto: va después de los dos `useState`, que se ejecutan siempre.

La solución es pasarle a `useState` **la función**, no su resultado. Si recibe una función, React la trata como un **inicializador**: la llama solo para calcular el valor inicial, en el primer render, y nunca más.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "const [tarjetas, setTarjetas] = useState(prepararMazo())\n\nconst [tarjetas, setTarjetas] = useState(prepararMazo)\n\nconst [tarjetas, setTarjetas] = useState(() => prepararMazo(VOCABULARIO))",
  "anotaciones": [
    {
      "fragmento": "useState(prepararMazo())",
      "nota": "Con paréntesis: prepararMazo se ejecuta en cada render, y React solo aprovecha el resultado del primero."
    },
    {
      "fragmento": "useState(prepararMazo)",
      "nota": "Sin paréntesis: le pasas la función misma. React la llama una sola vez, al crear el estado. Tiene que ser pura y no recibir argumentos."
    },
    {
      "fragmento": "() => prepararMazo(VOCABULARIO)",
      "nota": "Una función flecha que la llama: lo mismo, y es la forma de hacerlo cuando la función necesita argumentos. Es la que verás más a menudo."
    }
  ]
}
```

Prueba los dos arreglos en el bloque de arriba, pero antes, predice:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Con StrictMode activado, como en el bloque de arriba\nconst [tarjetas, setTarjetas] = useState(() => prepararMazo())\n\n// ¿Cuántas veces sale «Preparo el mazo» en la consola\n// al cargar, y luego al pulsar «Siguiente» dos veces?",
  "opciones": [
    "Una al cargar y ninguna después",
    "Dos al cargar y ninguna después",
    "Dos al cargar y dos más por cada clic",
    "Ninguna: React guarda la función, no la llama"
  ],
  "correcta": 1,
  "explicacion": "React llama al inicializador solo al crear el estado. StrictMode lo llama dos veces seguidas para comprobar que es puro, como hace con el cuerpo de los componentes (lección 12), y se queda con uno de los dos resultados. En los renders siguientes, ni una: la consola se queda callada al pulsar."
}
```

El inicializador es el sitio para cualquier valor inicial que cueste calcular: construir un array grande, transformar unos datos o leer algo guardado, como el progreso del repaso en `localStorage` en tu proyecto (en los bloques de esta web, la vista previa tiene un `localStorage` que funciona pero se vacía al recargarla; en tu proyecto, sí persiste).

El mismo razonamiento explica otra cosa: **el valor inicial no es una forma de cambiar el estado**. Si escribes `useState(props.tarjetaInicial)` y luego el padre te pasa otra, el estado no se entera, porque React ya no mira ese argumento. Lo verás con calma en las lecciones 24 y 26.

## ¿Esto tiene que ser estado?

Que puedas guardar algo en el estado no significa que debas. Cada estado es un dato más que mantener al día, y si dos estados dicen lo mismo, tarde o temprano se contradicen: es el problema de la lección 1, ahora dentro de React. Antes de escribir un `useState`, hazte estas preguntas (la lección 24 las convierte en método):

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Cambia mientras se usa la app?",
      "texto": "Si no cambia nunca, como la lista de un mazo fijo o el título de la página, es una constante: déjala fuera del componente, como el array tarjetas de los ejemplos."
    },
    {
      "titulo": "¿Se puede calcular a partir de otra cosa?",
      "texto": "El número de tarjetas sale de tarjetas.length, la tarjeta actual de tarjetas[indice] y si es la última de comparar indice con la longitud. Calcúlalo en el render; no lo guardes."
    },
    {
      "titulo": "¿Llega por props?",
      "texto": "Entonces lo decide el padre. Copiarlo en un estado lo congela con su valor del primer render: si el padre cambia la prop, tu copia no se entera."
    },
    {
      "titulo": "¿Solo lo necesitas dentro de un manejador?",
      "texto": "Una variable normal dentro del manejador basta. El estado es para lo que tiene que sobrevivir de un render al siguiente."
    },
    {
      "titulo": "¿Hay que recordarlo, pero no se ve?",
      "texto": "Por ejemplo, el identificador de un temporizador. Para eso hay otro Hook, useRef, que recuerda un valor sin provocar renders: lección 33."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Marcador() {\n  const [aciertos, setAciertos] = useState(0)\n  const [fallos, setFallos] = useState(0)\n  const [respondidas, setRespondidas] = useState(0)\n\n  function manejarAcierto() {\n    setAciertos(aciertos + 1)\n    setRespondidas(respondidas + 1)\n  }\n\n  function manejarFallo() {\n    setFallos(fallos + 1)\n    setRespondidas(respondidas + 1)\n  }\n\n  return (\n    <p>\n      {aciertos} aciertos y {fallos} fallos de {respondidas} respondidas\n    </p>\n  )\n}\n\n// ¿Cuál de los tres estados sobra?",
  "opciones": [
    "aciertos",
    "fallos",
    "respondidas",
    "Ninguno: los tres son necesarios"
  ],
  "correcta": 2,
  "explicacion": "respondidas es siempre aciertos + fallos, así que se calcula en el render: const respondidas = aciertos + fallos. Guardado aparte, cada manejador tiene que acordarse de actualizarlo, y el día que alguien añada un botón «Saltar» y se le olvide, el marcador dirá algo imposible."
}
```

## Cuándo lo usarías de verdad

Casi cualquier interacción tiene un estado detrás. Algunos de los más habituales:

- **Lo que se abre y se cierra**: un menú, un acordeón, un diálogo, la pestaña activa. Un booleano o el identificador de lo que está abierto.
- **Por dónde vas**: el paso de un asistente, la página de un listado, la foto de un carrusel. Un número.
- **Lo que la persona escribe o elige**: el texto de un buscador, un filtro, el orden de una tabla. Lo verás con los campos de formulario en la lección 22.
- **Los datos que la persona cambia**: la lista de la compra, el carrito, las tareas de un tablero. Arrays y objetos, en las lecciones 20 y 21.

## Lo que conviene no confundir

Props y estado se parecen, porque los dos son datos que el componente usa para pintar. La diferencia está en quién manda:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Props y estado",
  "roles": [
    {
      "etiqueta": "Props",
      "rol": "Las decide el padre",
      "descripcion": "Llegan de fuera en cada render, como los argumentos de una función. El componente las lee y nunca las cambia; si cambian, es porque el padre se ha renderizado con otras."
    },
    {
      "etiqueta": "Estado",
      "rol": "Lo decide el propio componente",
      "descripcion": "Vive en cada copia del componente y solo esa copia lo cambia, con su función set. Cambiarlo provoca un render nuevo."
    }
  ]
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "useState(0) pone el estado a 0 en cada render",
      "realidad": "El 0 solo se usa en el primer render. En los demás, useState devuelve el último valor guardado y el argumento se ignora."
    },
    {
      "mito": "El estado es de la función Mazo",
      "realidad": "Es de cada Mazo que hay en pantalla. Dos copias del mismo componente tienen dos estados que no se tocan."
    },
    {
      "mito": "Llamar a setIndice cambia indice",
      "realidad": "Cambia lo que React tiene guardado y pide un render nuevo, en el que useState te dará el valor nuevo. La variable del render actual se queda como estaba: lección 18."
    },
    {
      "mito": "Cuanto más estado, más control",
      "realidad": "Cada estado de más es un dato que mantener sincronizado a mano. Lo que se puede calcular, se calcula en el render."
    }
  ]
}
```

## Errores típicos

**Asignar en vez de llamar a `set`.** La costumbre de JavaScript tira de `indice = indice + 1`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Mazo() {\n  const [indice, setIndice] = useState(0)\n\n  return (\n    <section>\n      <p>Tarjeta {indice + 1} de 4</p>\n      <button onClick={() => { indice = indice + 1 }}>Siguiente</button>\n    </section>\n  )\n}\n\n// ¿Qué pasa al pulsar «Siguiente»?",
  "opciones": [
    "Pasa a «Tarjeta 2 de 4»",
    "No pasa nada, y no hay ningún error",
    "Salta el error «Assignment to constant variable.» y la tarjeta no cambia",
    "Pasa a «Tarjeta 2 de 4» y vuelve a la 1 en el siguiente render"
  ],
  "correcta": 2,
  "explicacion": "indice es una constante del render, así que JavaScript no deja reasignarla, y bajo la vista previa aparece, en Chrome, «Error: Uncaught TypeError: Assignment to constant variable.». Si la hubieras declarado con let, no habría error, pero tampoco cambiaría nada: es el problema del principio de la lección. El estado se cambia con setIndice(indice + 1)."
}
```

**Olvidar el `import`.** Sin `import { useState } from 'react'`, la vista previa no llega a pintarse y el recuadro rojo dice «Error al renderizar: useState is not defined», con el archivo y la línea donde lo usas (así en Chrome, Edge y Firefox; Safari lo cuenta con otras palabras). Pasa a menudo al copiar un componente de un archivo a otro.

**Esperar el valor nuevo en la línea siguiente.** `set` no cambia la variable que ya tienes; pide un render en el que `useState` devolverá el valor nuevo:

```jsx
function manejarSiguiente() {
  setIndice(indice + 1)
  console.log(indice) // todavía el valor de antes
}
```

Si necesitas el valor nuevo dentro del manejador, calcúlalo en una variable (`const siguiente = indice + 1`) y úsala para las dos cosas. Por qué el estado se comporta así es la lección 18 entera.

**Un Hook dentro de un `if`, un bucle o detrás de un `return`.** Ya lo has visto romperse: todos los Hooks arriba, siempre los mismos y en el mismo orden. Si una parte de la interfaz necesita su propio estado solo a veces, sácala a un componente y renderízalo con una condición: el estado vivirá en ese componente mientras exista.

**`useState(calcularAlgo())` con un cálculo caro.** Se ejecuta en cada render. Pásale la función: `useState(calcularAlgo)` o `useState(() => calcularAlgo(datos))`.

**Guardar lo que se puede calcular.** Totales, filtros, textos que dependen de otro estado... en cuanto hay dos fuentes para el mismo dato, se desincronizan. Calcúlalo en el render.

## Ejercicios

La casa rural El Roble quiere controlar la calefacción de cada habitación desde una pantalla. `App` ya pinta un `Termostato` para el salón y otro para el dormitorio, pero el componente tiene el fallo del principio de la lección.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los termostatos de la casa rural",
  "consigna": "En Termostato.jsx, convierte temperatura en estado. Después añade un segundo estado, encendido (empieza en true), y un botón «Apagar» que pase a decir «Encender» cuando esté apagado. Apagado, el párrafo dice «Salón: apagado» (con el nombre de su habitación); al encenderlo, vuelve a enseñar la temperatura que tenía. Usa el panel para ver qué termostato se re-renderiza. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "Termostato.jsx",
      "codigo": "// 1. temperatura es una variable normal: los botones no hacen nada.\n//    Conviértela en estado (empieza en 20).\n// 2. Añade un segundo estado, encendido (empieza en true), y un botón\n//    «Apagar» que pase a decir «Encender» cuando esté apagado.\n//    Apagado, el párrafo dice «Salón: apagado», con su habitación.\n\nexport default function Termostato({ habitacion }) {\n  let temperatura = 20\n\n  return (\n    <section className=\"termostato\">\n      <h2>{habitacion}</h2>\n      <p>{habitacion}: {temperatura} °C</p>\n      <button onClick={() => { temperatura = temperatura + 1 }}>Subir</button>\n      <button onClick={() => { temperatura = temperatura - 1 }}>Bajar</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Termostato from './Termostato'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Casa rural El Roble</h1>\n      <Termostato habitacion=\"Salón\" />\n      <Termostato habitacion=\"Dormitorio\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.termostato {\n  max-width: 20rem;\n  margin-bottom: 1rem;\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #fdba74;\n  border-radius: 10px;\n  background: #fff7ed;\n}\n\n.termostato h2 {\n  margin-bottom: 0;\n}\n\nbutton {\n  margin-right: 0.5rem;\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "Termostato.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "«Subir» sube la temperatura del salón un grado cada vez",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Subir"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Subir"
          }
        }
      ],
      "espera": {
        "texto": "Salón: 22 °C"
      }
    },
    {
      "descripcion": "«Bajar» la baja un grado",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Bajar"
          }
        }
      ],
      "espera": {
        "texto": "Salón: 19 °C"
      }
    },
    {
      "descripcion": "«Apagar» apaga el termostato del salón",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apagar"
          }
        }
      ],
      "espera": {
        "texto": "Salón: apagado"
      }
    },
    {
      "descripcion": "Apagar el salón no apaga el dormitorio: cada termostato tiene su estado",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apagar"
          }
        }
      ],
      "espera": {
        "texto": "Dormitorio: 20 °C"
      }
    },
    {
      "descripcion": "Al volver a encenderlo, recuerda la temperatura que tenía",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Subir"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apagar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Encender"
          }
        }
      ],
      "espera": {
        "texto": "Salón: 21 °C"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el bloque de «Varias variables de estado», haz que «Siguiente» esconda la traducción de la tarjeta nueva. ¿Cuántas funciones `set` llamas en el manejador? Mira qué motivo da el panel cuando la traducción estaba a la vista.
2. Añade al mazo un botón «Anterior» que, desde la primera tarjeta, salte a la última. Pista: el `%` con números negativos no hace lo que esperas en JavaScript; usa `(indice - 1 + tarjetas.length) % tarjetas.length`.
3. Limita el termostato del ejercicio a temperaturas entre 15 y 26 °C, con los botones desactivados (`disabled`) en los extremos. ¿Necesitas un estado nuevo para saber si está en el límite?
4. Mejora el `useState` de juguete para que avise con un `console.log` cuando un render llame a `useState` menos veces que el anterior, como hace React.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "State: A Component's Memory",
      "descripcion": "La página de react.dev en la que se basa esta lección, con una galería de esculturas como ejemplo y cuatro retos para practicar.",
      "url": "https://react.dev/learn/state-a-components-memory",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState",
      "descripcion": "La referencia completa: el inicializador, las funciones set, sus advertencias y una sección de problemas frecuentes con sus mensajes de error.",
      "url": "https://react.dev/reference/react/useState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Rules of Hooks",
      "descripcion": "Las reglas de los Hooks con todos sus casos, la base de la lección 44.",
      "url": "https://react.dev/reference/rules/rules-of-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Choosing the State Structure",
      "descripcion": "Cómo decidir qué va en el estado y cómo organizarlo: estado redundante, duplicado y derivado. Es la lección 24.",
      "url": "https://react.dev/learn/choosing-the-state-structure",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Sharing State Between Components",
      "descripcion": "Qué hacer cuando dos componentes necesitan el mismo estado: subirlo al padre común. Es la lección 25.",
      "url": "https://react.dev/learn/sharing-state-between-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Destructuring",
      "descripcion": "La desestructuración de arrays que usa cada línea de useState, en la referencia de JavaScript de MDN.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring",
      "etiqueta": "MDN"
    }
  ]
}
```
