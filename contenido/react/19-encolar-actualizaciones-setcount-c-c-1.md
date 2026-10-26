# Encolar actualizaciones: `setCount(c => c + 1)`

- **Módulo:** Interactividad
- **Slug:** `encolar-actualizaciones-setcount-c-c-1` (autogenerado del título)
- **Orden:** 190
- **Fuentes:** [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) — ver `contenido/react/TEMARIO.md` #19

---

## Qué es y para qué sirve

En la lección 18, el botón «+3» del ascensor solo subía una planta: las tres llamadas a `setPlanta(planta + 1)` partían de la misma foto, `planta = 0`, y pedían tres veces lo mismo. Quedan dos preguntas en el aire. Si llamas tres veces a `set`, ¿renderiza React tres veces? Y si de verdad necesitas tres actualizaciones seguidas del mismo estado, ¿cómo se las pides?

Las dos respuestas son esta lección:

- **React agrupa las actualizaciones.** Espera a que termine todo el código del manejador y entonces hace un solo render con todos los cambios. Se llama procesamiento por lotes, *batching* en inglés.
- **A una función `set` le puedes pasar una función en vez de un valor**: `setVotos(v => v + 1)`. React la apunta en una cola y, al preparar el siguiente render, se la aplica al valor más reciente, no a la foto del render en el que pulsaste.

El título de la lección usa `setCount(c => c + 1)`, la forma en que lo verás escrito en muchos tutoriales en inglés. Aquí será `setVotos(v => v + 1)`, `setPedidos(p => p + 1)`... La idea es la misma.

## React espera a que termine el manejador

Piensa en la compra de la semana. No vas al súper cada vez que te acuerdas de algo: apuntas leche, huevos, cambias los huevos por media docena, apuntas el pan, y cuando terminas la lista vas una sola vez. React hace lo mismo con tu manejador: cada `set` es una línea en la lista, y el render es el viaje al súper, que ocurre **cuando el manejador ha terminado**.

En este concurso de tortillas de las fiestas, un botón suma un voto a cada una de las dos finalistas y cuenta la papeleta: tres estados distintos que cambian en el mismo clic. Cada componente escribe en la consola cuando React lo ejecuta (con `StrictMode` activado, cada render sale dos veces, como viste en la lección 12).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres cambios de estado, un solo render",
  "consigna": "Pulsa «Votar a las dos» y fíjate en tres cosas: en qué punto de la consola sale «Fin del manejador», cuántos commits añade el clic y qué motivos da el árbol de renders para Concurso.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction Marcador({ tortilla, votos }) {\n  console.log('Render de Marcador:', tortilla)\n  return <p>{tortilla}: {votos} votos</p>\n}\n\nexport default function Concurso() {\n  const [conCebolla, setConCebolla] = useState(0)\n  const [sinCebolla, setSinCebolla] = useState(0)\n  const [papeletas, setPapeletas] = useState(0)\n  console.log('Render de Concurso')\n\n  function manejarVoto() {\n    setConCebolla(conCebolla + 1)\n    setSinCebolla(sinCebolla + 1)\n    setPapeletas(papeletas + 1)\n    console.log('Fin del manejador')\n  }\n\n  return (\n    <main>\n      <h1>Concurso de tortillas</h1>\n      <Marcador tortilla=\"Con cebolla\" votos={conCebolla} />\n      <Marcador tortilla=\"Sin cebolla\" votos={sinCebolla} />\n      <p>Papeletas: {papeletas}</p>\n      <button onClick={manejarVoto}>Votar a las dos</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\np {\n  margin: 0.25rem 0;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin: 0.5rem 0.5rem 0 0;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Tres llamadas a `set` y un solo render:

- **En la consola**, «Fin del manejador» sale antes que cualquier render del clic: mientras el manejador se ejecutaba, React no ha tocado nada.
- **En el árbol de renders**, el clic es un único commit, «Commit 2 · 3 renderizados · 3 cambios en el DOM», y `Concurso` da tres motivos a la vez: «cambió su estado n.º 1 · cambió su estado n.º 2 · cambió su estado n.º 3». Los tres cambios viajan en el mismo render. Si React renderizara después de cada `set`, el clic añadiría tres commits.

Agrupar ahorra renders y, sobre todo, evita **pantallas a medias**: si React pintara después de cada `set`, durante un instante verías una tortilla con el voto sumado y la otra sin él. Funciona igual cuando los `set` son de componentes distintos: si un hijo cambia su propio estado y, en el mismo manejador, llama a una función del padre que cambia el del padre, los dos se renderizan en el mismo commit.

Lo que React no junta son **eventos distintos**. Cada clic se procesa por separado y renderiza al terminar, así que el segundo clic siempre se encuentra la pantalla del primero ya al día. Si el primer clic en «Enviar» desactiva el botón, el segundo clic se lo encuentra desactivado y no envía nada dos veces.

## Lo que se apunta en la cola

Cada vez que llamas a `set`, React no cambia nada en el acto: **apunta la petición en una cola** que tiene cada estado. Cuando el manejador termina, renderiza, y durante ese render recorre la cola para calcular el valor nuevo. Con el «+3» de la lección 18, escrito con votos (`setVotos(votos + 1)` tres veces y `votos` a 0), la cola queda así:

| En la cola | Recibe | Devuelve |
|---|---|---|
| sustituir por 1 | 0 (no lo usa) | 1 |
| sustituir por 1 | 1 (no lo usa) | 1 |
| sustituir por 1 | 1 (no lo usa) | 1 |

Un valor es una orden de **«sustituir por»**: no le importa lo que hubiera antes. Tres órdenes de sustituir por 1 dejan un 1.

## La función actualizadora: `v => v + 1`

Si en vez de un valor le pasas una **función**, React no la usa para sustituir nada: la pone en la cola tal cual. Al recorrer la cola, se la aplica al valor que lleve calculado hasta ese momento y se queda con lo que devuelva. Esa función se llama **función actualizadora** (*updater function*).

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El voto del jurado vale tres",
  "codigo": "import { useState } from 'react'\n\nexport default function Tortilla() {\n  const [votos, setVotos] = useState(0)\n\n  function manejarVotoDelJurado() {\n    setVotos((v) => v + 1)\n    setVotos((v) => v + 1)\n    setVotos((v) => v + 1)\n  }\n\n  return (\n    <main>\n      <h1>Tortilla de Paqui</h1>\n      <p>Votos: {votos}</p>\n      <button onClick={() => setVotos(votos + 1)}>Votar</button>\n      <button onClick={manejarVotoDelJurado}>Voto del jurado (+3)</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\np {\n  margin: 0.25rem 0;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin: 0.5rem 0.5rem 0 0;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}",
  "anotaciones": [
    {
      "fragmento": "setVotos((v) => v + 1)",
      "nota": "No le dices a React qué valor quieres, sino cómo calcularlo a partir del anterior. v no es la variable votos de este render: es el valor pendiente, lo que lleva calculado la cola hasta llegar a esta función."
    },
    {
      "fragmento": "function manejarVotoDelJurado()",
      "nota": "Las tres llamadas añaden tres funciones a la cola. votos sigue valiendo lo mismo hasta el final del manejador: la función actualizadora cambia lo que se apunta, no la foto de este render."
    },
    {
      "fragmento": "onClick={() => setVotos(votos + 1)}",
      "nota": "Un solo set por clic: aquí el valor directo funciona perfectamente. El siguiente clic se ejecuta con el manejador de otro render, en el que votos ya está al día."
    },
    {
      "fragmento": "<p>Votos: {votos}</p>",
      "nota": "En el render siguiente, useState devuelve el resultado de aplicar toda la cola: 3 más de lo que había."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": false
}
```

Pulsa «Voto del jurado (+3)» y los votos suben de tres en tres. Así recorre React la cola, partiendo de 0:

| En la cola | v | Devuelve |
|---|---|---|
| `v => v + 1` | 0 | 1 |
| `v => v + 1` | 1 | 2 |
| `v => v + 1` | 2 | 3 |

React guarda el 3 como estado y `useState` lo devuelve en el siguiente render. **La función actualizadora no lee la foto del render: lee el valor pendiente**, el resultado de todo lo que había antes en la cola.

## Mezclar valores y funciones

En la cola pueden convivir valores y funciones, y aquí es donde las predicciones fallan. La regla es corta: **una función se aplica al valor que le llega; un valor sustituye lo que haya, sin mirarlo.** Ponla a prueba con los casos que usa react.dev, sobre un contador sin más, `numero`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [numero, setNumero] = useState(0)\n\nfunction manejarClic() {\n  setNumero(numero + 5)\n  setNumero((n) => n + 1)\n}\n\n// numero vale 0 y pulsas una vez.\n// ¿Cuánto vale numero en el siguiente render?",
  "opciones": [
    "1",
    "5",
    "6",
    "11"
  ],
  "correcta": 2,
  "explicacion": "setNumero(numero + 5) es setNumero(0 + 5), con la foto: apunta «sustituir por 5». La función recibe ese 5 como n y devuelve 6. El 0 de la foto solo se usa en la primera línea."
}
```

| En la cola | n | Devuelve |
|---|---|---|
| sustituir por 5 | 0 (no lo usa) | 5 |
| `n => n + 1` | 5 | 6 |

Fíjate en que `setNumero(5)` funciona igual que `setNumero(n => 5)`: una función que no usa su `n`. Ahora, una línea más:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function manejarClic() {\n  setNumero(numero + 5)\n  setNumero((n) => n + 1)\n  setNumero(42)\n}\n\n// numero vale 0 y pulsas una vez.\n// ¿Cuánto vale numero en el siguiente render?",
  "opciones": [
    "6",
    "42",
    "43",
    "48"
  ],
  "correcta": 1,
  "explicacion": "La cola es: sustituir por 5, la función (que da 6) y sustituir por 42. Un valor no mira lo que había antes, así que el último reemplazo gana. Si después del 42 hubiera otra n => n + 1, el resultado sería 43."
}
```

| En la cola | n | Devuelve |
|---|---|---|
| sustituir por 5 | 0 (no lo usa) | 5 |
| `n => n + 1` | 5 | 6 |
| sustituir por 42 | 6 (no lo usa) | 42 |

En resumen, esto es lo que añade a la cola cada forma de llamar a `set`:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que añade cada llamada a la cola",
  "roles": [
    {
      "etiqueta": "Un valor",
      "rol": "setNumero(42) o setNumero(numero + 5)",
      "descripcion": "Añade «sustituir por» ese valor, calculado con la foto del render. Ignora lo que hubiera calculado la cola hasta ahí."
    },
    {
      "etiqueta": "Una función",
      "rol": "setNumero(n => n + 1)",
      "descripcion": "Añade la función tal cual. Al recorrer la cola, React se la aplica al valor pendiente y guarda lo que devuelva."
    }
  ]
}
```

Con eso, el orden de las líneas lo es todo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function manejarClic() {\n  setNumero((n) => n + 1)\n  setNumero(numero + 5)\n}\n\n// numero vale 0 y pulsas una vez.\n// ¿Cuánto vale numero en el siguiente render?",
  "opciones": [
    "1",
    "5",
    "6"
  ],
  "correcta": 1,
  "explicacion": "La función da 1, pero detrás llega «sustituir por 5» (0 + 5, calculado con la foto), que no mira lo anterior. Las mismas dos llamadas en el orden contrario daban 6: en la cola, el orden importa."
}
```

Comprueba todas tus predicciones en un mismo laboratorio. Cada prueba es una de las colas de esta sección:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Laboratorio de la cola",
  "consigna": "Antes de pulsar cada prueba, lee su función y predice el número. Cada prueba parte del número que haya en pantalla, no de 0: usa «Volver a 0» cuando quieras empezar de cero. Después escribe una prueba 5 con tu propia combinación.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function LaboratorioDeLaCola() {\n  const [numero, setNumero] = useState(0)\n\n  function prueba1() {\n    setNumero(numero + 5)\n    setNumero((n) => n + 1)\n  }\n\n  function prueba2() {\n    setNumero(numero + 5)\n    setNumero((n) => n + 1)\n    setNumero(42)\n  }\n\n  function prueba3() {\n    setNumero((n) => n + 1)\n    setNumero(numero + 5)\n  }\n\n  function prueba4() {\n    setNumero((n) => n * 2)\n    setNumero((n) => n + 1)\n  }\n\n  return (\n    <main>\n      <h1>{numero}</h1>\n      <button onClick={prueba1}>Prueba 1</button>\n      <button onClick={prueba2}>Prueba 2</button>\n      <button onClick={prueba3}>Prueba 3</button>\n      <button onClick={prueba4}>Prueba 4</button>\n      <button onClick={() => setNumero(0)}>Volver a 0</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  display: inline-block;\n  min-width: 3ch;\n  padding: 0.25rem 0.75rem;\n  border-radius: 6px;\n  background: #1e293b;\n  color: #f8fafc;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin: 0 0.5rem 0.5rem 0;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

La prueba 4 es la única que no aparece arriba: desde 0 da 1 (0 × 2 + 1), y desde 3 da 7. Solo con funciones, cada paso parte del anterior, como en una cadena de cálculos.

## Cómo llamar al argumento

El nombre del argumento es cosa tuya. La costumbre más extendida es usar la inicial del estado:

```jsx
setVotos((v) => v + 1)
setAbierto((a) => !a)
setPlazasLibres((pl) => pl - 2)
```

Si prefieres algo más explícito, repite el nombre completo o añade un prefijo. En código en inglés verás mucho `prev` (`prevCount`); en español, `anterior` se entiende igual de bien:

```jsx
setVotos((votos) => votos + 1)
setVotos((votosAnteriores) => votosAnteriores + 1)
```

Con el nombre completo, dentro de la función `votos` es el argumento, no la variable de estado del render: la tapa. Funciona, pero hay quien prefiere evitarlo para no confundir las dos.

## La función actualizadora tiene que ser pura

La función actualizadora no se ejecuta en la línea en que la escribes: React la guarda en la cola y la ejecuta cuando calcula el estado nuevo, normalmente durante el siguiente render. Como todo lo que corre durante el render, **tiene que ser pura** (lección 12): recibir el valor pendiente y devolver el siguiente, sin cambiar nada más. Y `StrictMode` lo comprueba igual que con los componentes: **en desarrollo, llama dos veces a cada actualizador** y se queda con uno de los resultados.

Aquí alguien ha aprovechado el actualizador de los votos para contar también las papeletas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un voto, ¿cuántas papeletas?",
  "consigna": "Pulsa «Votar» una vez y cuenta las papeletas. Después arréglalo: saca setPapeletas del actualizador y llámalo en el manejador, al lado de setVotos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Tortilla() {\n  const [votos, setVotos] = useState(0)\n  const [papeletas, setPapeletas] = useState(0)\n\n  function manejarVoto() {\n    setVotos((v) => {\n      // Mal: un actualizador solo debe calcular y devolver\n      setPapeletas((p) => p + 1)\n      return v + 1\n    })\n  }\n\n  return (\n    <main>\n      <h1>Tortilla de Paqui</h1>\n      <p>Votos: {votos}</p>\n      <p>Papeletas contadas: {papeletas}</p>\n      <button onClick={manejarVoto}>Votar</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\np {\n  margin: 0.25rem 0;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin: 0.5rem 0.5rem 0 0;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Un voto, dos papeletas: `StrictMode` ejecutó dos veces el actualizador, y cada ejecución pidió otra papeleta. Sin `StrictMode` saldría una... de casualidad, porque React no promete cuántas veces ni en qué momento ejecuta un actualizador. El arreglo es dejar el actualizador en lo suyo, calcular, y poner todo lo demás en el manejador, que se ejecuta una sola vez por clic:

```jsx
function manejarVoto() {
  setVotos((v) => v + 1)
  setPapeletas((p) => p + 1)
}
```

Lo mismo vale para cualquier efecto secundario: nada de peticiones al servidor, `push` sobre un array del estado ni cambios en variables de fuera dentro de un actualizador. Un `console.log` para depurar no rompe nada, pero en desarrollo saldrá dos veces. Y no te extrañe si, con un `console.log` en el manejador y otro en el actualizador, ves alguna vez el del actualizador **antes** de que acabe el manejador: React puede adelantar el cálculo del primero de la cola como optimización. El resultado es el mismo, pero es una razón más para que el actualizador no haga nada salvo calcular.

## El lote también fuera de los clics

Desde React 18, el procesamiento por lotes es **automático en cualquier sitio**: dentro de un `setTimeout`, cuando se resuelve una promesa, después de un `await` o en un evento del navegador que escuchas tú con `addEventListener` (lo harás con los efectos del módulo 6). Antes de React 18 solo se agrupaban los `set` de los manejadores de React; en un temporizador, cada `set` provocaba su propio render.

```jsx
setTimeout(() => {
  setVotos((v) => v + 1)
  setPapeletas((p) => p + 1)
  // Desde React 18: un solo render para los dos cambios
}, 1000)
```

El matiz está en el `await`: lo que va antes y lo que va después ocurren en **dos momentos distintos**, y cada uno forma su propio lote. Míralo en el recuento de los votos que llegan por internet, que tarda un segundo y medio:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El recuento de los votos por internet",
  "consigna": "Pulsa «Sumar los votos de internet» y sigue el árbol de renders: cuántos commits provoca y qué estados cambian en cada uno. Después repítelo votando en persona mientras se cuentan. Por último, cambia las dos funciones actualizadoras por conCebolla + votos.conCebolla y sinCebolla + votos.sinCebolla, y repite: ¿qué le pasa al voto en persona?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\n// Hace como si los votos llegaran de un servidor, un segundo y medio después\nfunction pedirVotosDeInternet() {\n  return new Promise((resolver) => {\n    setTimeout(() => resolver({ conCebolla: 12, sinCebolla: 9 }), 1500)\n  })\n}\n\nexport default function Recuento() {\n  const [conCebolla, setConCebolla] = useState(4)\n  const [sinCebolla, setSinCebolla] = useState(3)\n  const [contando, setContando] = useState(false)\n\n  async function manejarRecuento() {\n    setContando(true)\n    const votos = await pedirVotosDeInternet()\n    setConCebolla((c) => c + votos.conCebolla)\n    setSinCebolla((s) => s + votos.sinCebolla)\n    setContando(false)\n  }\n\n  return (\n    <main>\n      <h1>Concurso de tortillas</h1>\n      <p>Con cebolla: {conCebolla} votos</p>\n      <p>Sin cebolla: {sinCebolla} votos</p>\n      <button onClick={() => setConCebolla(conCebolla + 1)}>\n        Voto en persona con cebolla\n      </button>\n      <button onClick={manejarRecuento} disabled={contando}>\n        {contando ? 'Contando los votos de internet…' : 'Sumar los votos de internet'}\n      </button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\np {\n  margin: 0.25rem 0;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin: 0.5rem 0.5rem 0 0;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

El clic provoca **dos commits**. El primero llega en cuanto pulsas, con un solo cambio de estado: `contando` pasa a `true` y el botón se desactiva. Después la función espera a la promesa; cuando sigue, los tres `set` que vienen detrás del `await` se agrupan en un único commit, con tres motivos juntos en el árbol.

Y fíjate en las sumas. El código de después del `await` pertenece al render en el que pulsaste, así que `conCebolla` vale ahí lo mismo que al pulsar: 4. Con la función actualizadora, el voto en persona que llegó mientras tanto se respeta (4 + 1 + 12 = 17). Con `conCebolla + votos.conCebolla` se calcula con la foto vieja, 4 + 12 = 16, y ese «sustituir por 16» se come el voto en persona. Es la foto de la lección 18, con consecuencias.

Si alguna vez necesitas que React aplique un cambio a mitad de un manejador, por ejemplo para medir en el DOM algo que acabas de cambiar, existe `flushSync`, que obliga a React a hacerlo en el acto. Es raro necesitarlo; lo verás en la lección 34.

## ¿Valor o función?

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué pasarle a set en cada caso",
  "roles": [
    {
      "etiqueta": "Un valor",
      "rol": "El estado nuevo no depende del anterior",
      "descripcion": "setTexto(evento.target.value), setAbierto(false), setNumero(0). También vale un solo setVotos(votos + 1) por clic: React se asegura de que cada clic vea el estado al día."
    },
    {
      "etiqueta": "Una función",
      "rol": "Calculas a partir del anterior y hay más",
      "descripcion": "Varias actualizaciones del mismo estado en un evento, una función auxiliar que se llama más de una vez, o código que se ejecuta más tarde (un temporizador, tras un await) y vería una foto vieja."
    },
    {
      "etiqueta": "Un reducer",
      "rol": "Depende de varios estados a la vez",
      "descripcion": "Si el siguiente valor sale de combinar varias variables de estado, la función actualizadora se queda corta: júntalas y usa useReducer, en la lección 27."
    }
  ]
}
```

La referencia de `useState` en react.dev lo dice sin rodeos: usar siempre la función actualizadora cuando calculas a partir del valor anterior no hace ningún daño, pero tampoco es siempre necesario. Si prefieres la coherencia y escribirla siempre, adelante; si escribes `setVotos(votos + 1)` en un manejador de clic con un solo `set`, también está bien.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Con la función actualizadora, el estado cambia al momento",
      "realidad": "votos sigue valiendo lo mismo hasta el final del manejador, también después de setVotos(v => v + 1). La función cambia lo que se apunta en la cola, no la foto del render en curso."
    },
    {
      "mito": "Si llamo tres veces a set, React renderiza tres veces",
      "realidad": "Las agrupa y renderiza una vez, cuando el manejador termina. Lo has visto en el árbol de renders: tres cambios de estado, un solo commit."
    },
    {
      "mito": "Fuera de los manejadores de React no hay lotes",
      "realidad": "Desde React 18, los set de un temporizador, una promesa o un evento del navegador también se agrupan. Dentro de una función async, un await parte el lote en dos: lo de antes y lo de después van en renders distintos."
    },
    {
      "mito": "Hay que usar siempre la función actualizadora",
      "realidad": "No es obligatorio. Si el valor nuevo no depende del anterior, o hay un solo set por clic, el valor directo funciona igual. Hace falta cuando hay varias actualizaciones seguidas o código que se ejecuta más tarde."
    },
    {
      "mito": "El argumento del actualizador es la variable de estado",
      "realidad": "Es el valor pendiente: lo que lleva calculado la cola. Puede no coincidir ni con lo que hay en pantalla ni con la foto de tu manejador."
    }
  ]
}
```

## Errores típicos

**Llaves sin `return`.** Una función flecha con llaves necesita `return`. Con una actualizadora, olvidarlo no da ningún error:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Tortilla() {\n  const [votos, setVotos] = useState(0)\n\n  return (\n    <main>\n      <p>Votos: {votos}</p>\n      <button onClick={() => setVotos((v) => { v + 1 })}>Votar</button>\n    </main>\n  )\n}\n\n// Pulsas «Votar» una vez. ¿Qué dice el párrafo?",
  "opciones": [
    "Votos: 1",
    "Votos: 0",
    "Votos: (sin ningún número)",
    "La vista previa se cae con un error"
  ],
  "correcta": 2,
  "explicacion": "Con llaves y sin return, la función devuelve undefined, y ese undefined pasa a ser el estado. React no pinta nada para undefined, así que queda «Votos: ». Y si luego otro botón hace setVotos((v) => v + 1), undefined + 1 da NaN. Escribe (v) => v + 1, sin llaves, o pon el return."
}
```

**Efectos secundarios dentro del actualizador.** Llamar a otro `set`, pedir algo al servidor o modificar un array dentro de la función actualizadora: con `StrictMode` se ejecuta dos veces, como las papeletas de antes. Todo eso va en el manejador.

**Esperar que el actualizador te dé el valor nuevo.** `setVotos(v => v + 1)` no devuelve nada, y `votos` no cambia en el render en curso. Si necesitas el valor siguiente para algo más dentro del manejador, calcúlalo en una constante, como en la lección 18.

**Querer guardar una función en el estado.** Como `set` interpreta cualquier función como actualizadora, esto no guarda `formatoCorto`: la ejecuta, le pasa el estado anterior y guarda lo que devuelva.

```jsx
const formatoLargo = (n) => `${n} votos`
const formatoCorto = (n) => `${n} v.`

// Dentro del componente:
const [formato, setFormato] = useState(() => formatoLargo)

setFormato(formatoCorto)        // Mal: llama a formatoCorto(formatoLargo)
setFormato(() => formatoCorto)  // Bien: guarda la función
```

Con `useState` pasa lo mismo: una función como valor inicial se toma como función inicializadora y se ejecuta (`useState(formatoLargo)` guardaría el texto «undefined votos»). Por eso hace falta envolverla también ahí, `useState(() => formatoLargo)`.

## Ejercicios

La Pizzería Vesubio tiene un panel en la cocina. «Un pedido» suma uno; «Mesa de tres» reutiliza esa misma función tres veces; y «Pedido por teléfono» deja la llamada en espera un segundo, mientras se confirma, y después pasa el pedido a cocina. Pruébalo antes de tocar nada: la mesa de tres solo suma uno, y si pulsas el teléfono y en seguida la mesa de tres, al cabo de un segundo la cocina pierde pedidos y las llamadas en espera se quedan en -1.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Arregla el panel de la pizzería",
  "consigna": "Arregla el panel con funciones actualizadoras: que la mesa de tres sume tres pedidos y que el pedido por teléfono, al llegar, cuente con lo que haya en ese momento y no con la foto del clic. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Cocina() {\n  const [enCocina, setEnCocina] = useState(0)\n  const [enEspera, setEnEspera] = useState(0)\n\n  // Arréglalo: la mesa de tres llama tres veces a esta función,\n  // y el teléfono la llama un segundo después del clic.\n  function anadirPedido() {\n    setEnCocina(enCocina + 1)\n  }\n\n  function manejarMesaDeTres() {\n    anadirPedido()\n    anadirPedido()\n    anadirPedido()\n  }\n\n  function manejarTelefono() {\n    setEnEspera(enEspera + 1)\n    // La llamada se confirma al cabo de un segundo\n    setTimeout(() => {\n      setEnEspera(enEspera - 1)\n      anadirPedido()\n    }, 1000)\n  }\n\n  return (\n    <main>\n      <h1>Pizzería Vesubio</h1>\n      <p>En cocina: {enCocina}</p>\n      <p>Llamadas en espera: {enEspera}</p>\n      <button onClick={anadirPedido}>Un pedido</button>\n      <button onClick={manejarMesaDeTres}>Mesa de tres</button>\n      <button onClick={manejarTelefono}>Pedido por teléfono</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\np {\n  margin: 0.25rem 0;\n  font-variant-numeric: tabular-nums;\n}\n\nbutton {\n  margin: 0.5rem 0.5rem 0 0;\n  font: inherit;\n  padding: 0.5rem 0.75rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "«Mesa de tres» suma tres pedidos a la cocina",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mesa de tres"
          }
        }
      ],
      "espera": {
        "texto": "En cocina: 3"
      }
    },
    {
      "descripcion": "Una llamada queda en espera mientras se confirma",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedido por teléfono"
          }
        }
      ],
      "espera": {
        "texto": "Llamadas en espera: 1"
      }
    },
    {
      "descripcion": "Al cabo de un segundo, la llamada sale de la espera y la espera vuelve a 0",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedido por teléfono"
          }
        }
      ],
      "espera": {
        "texto": "Llamadas en espera: 0"
      }
    },
    {
      "descripcion": "Dos llamadas seguidas acaban siendo dos pedidos en cocina",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedido por teléfono"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedido por teléfono"
          }
        }
      ],
      "espera": {
        "texto": "En cocina: 2"
      }
    },
    {
      "descripcion": "Si llega una mesa de tres mientras se confirma una llamada, no se pierde ningún pedido",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedido por teléfono"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mesa de tres"
          }
        }
      ],
      "espera": {
        "texto": "En cocina: 4"
      }
    }
  ]
}
```

Para terminar, construye tú la cola. `estadoFinal` recibe el estado de partida y la lista de lo que se pidió con `set`, en orden: números, que sustituyen el valor, y funciones actualizadoras. Tiene que devolver lo que React guardaría en el siguiente render. La página enseña cinco casos, los de esta lección: cuando todos digan «correcto», está resuelto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La cola de React, hecha a mano",
  "consigna": "Completa estadoFinal en cola.jsx: recorre la cola en orden; si un elemento es una función, aplícasela al estado que llevas; si no, sustituye el estado por ese valor. Pista: typeof te dice si algo es una función. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "cola.jsx",
      "codigo": "// estadoInicial: el estado antes del clic (por ejemplo, 0).\n// cola: lo que se pidió con set, en orden. Cada elemento es un número\n// (sustituir por ese valor) o una función actualizadora (n => n + 1).\n// Devuelve el estado que React guardaría en el siguiente render.\nexport function estadoFinal(estadoInicial, cola) {\n  let estado = estadoInicial\n\n  // Completa aquí: recorre la cola y aplica cada elemento\n\n  return estado\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { estadoFinal } from './cola'\nimport './estilos.css'\n\nconst CASOS = [\n  { inicial: 0, cola: [1, 1, 1], esperado: 1 },\n  { inicial: 0, cola: [(n) => n + 1, (n) => n + 1, (n) => n + 1], esperado: 3 },\n  { inicial: 0, cola: [5, (n) => n + 1], esperado: 6 },\n  { inicial: 0, cola: [5, (n) => n + 1, 42], esperado: 42 },\n  { inicial: 3, cola: [(n) => n * 2, (n) => n + 1], esperado: 7 },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>La cola de React, hecha a mano</h1>\n      <ol>\n        {CASOS.map((caso, indice) => {\n          const obtenido = estadoFinal(caso.inicial, caso.cola)\n          const bien = obtenido === caso.esperado\n          return (\n            <li key={indice} className={bien ? 'bien' : 'mal'}>\n              Caso {indice + 1}: {bien ? 'correcto' : 'incorrecto'}. Parte de {caso.inicial}, cola [\n              {caso.cola.map(String).join(', ')}], esperado {caso.esperado}, sale {String(obtenido)}\n            </li>\n          )\n        })}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nli {\n  margin-bottom: 0.5rem;\n  padding: 0.25rem 0.5rem;\n  border-radius: 6px;\n}\n\n.bien {\n  background: #dcfce7;\n}\n\n.mal {\n  background: #fee2e2;\n}\n"
    }
  ],
  "archivoInicial": "cola.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Tres valores seguidos: gana el último (caso 1)",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Caso 1: correcto"
      }
    },
    {
      "descripcion": "Tres funciones seguidas se encadenan (caso 2)",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Caso 2: correcto"
      }
    },
    {
      "descripcion": "Una función se aplica al valor que la precede (caso 3)",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Caso 3: correcto"
      }
    },
    {
      "descripcion": "Un valor al final sustituye todo lo anterior (caso 4)",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Caso 4: correcto"
      }
    },
    {
      "descripcion": "Con otro estado de partida, las funciones parten de él (caso 5)",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Caso 5: correcto"
      }
    }
  ]
}
```

El bucle que acabas de escribir es, en esencia, lo que hace React con la cola de cada estado al preparar el siguiente render. Con él delante, ninguna de las predicciones de esta lección tiene truco.

**Retos para seguir practicando** (sin comprobación automática):

1. En la pizzería, añade un botón «Cancelar un pedido» que reste uno de la cocina sin bajar nunca de 0. Pista: `Math.max` dentro de la función actualizadora.
2. Añade a la pizzería un contador «Pedidos de hoy» que sume todos los pedidos que entran en cocina, vengan de donde vengan, y que no baje al cancelar.
3. En el laboratorio de la cola, escribe una prueba 5 que, partiendo de 0, deje el número en 10 usando un valor y dos funciones. Antes de pulsar, apunta la tabla de la cola en un papel.
4. En el recuento de votos, añade un segundo botón de voto en persona, sin cebolla, y comprueba que tampoco se pierde ningún voto mientras se cuentan los de internet.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Queueing a Series of State Updates",
      "descripcion": "La página de react.dev en la que se basa esta lección: el procesamiento por lotes, las funciones actualizadoras y la tabla de la cola, con el reto de implementarla.",
      "url": "https://react.dev/learn/queueing-a-series-of-state-updates",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useState: actualizar el estado a partir del anterior",
      "descripcion": "La sección de la referencia de useState sobre las funciones actualizadoras, con la pregunta de si conviene usarlas siempre.",
      "url": "https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React v18.0: Automatic Batching",
      "descripcion": "El anuncio de React 18, que extendió el procesamiento por lotes a temporizadores, promesas y eventos del navegador.",
      "url": "https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Automatic batching for fewer renders in React 18",
      "descripcion": "La explicación detallada del equipo de React, con ejemplos de antes y después y cómo salir del lote con flushSync.",
      "url": "https://github.com/reactwg/react-18/discussions/21",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "flushSync",
      "descripcion": "La API para obligar a React a aplicar un cambio de estado en el acto. Rara vez hace falta; la verás en la lección 34.",
      "url": "https://react.dev/reference/react-dom/flushSync",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Extracting State Logic into a Reducer",
      "descripcion": "Cuando el siguiente estado depende de varios a la vez: el paso siguiente después de las funciones actualizadoras, en la lección 27.",
      "url": "https://react.dev/learn/extracting-state-logic-into-a-reducer",
      "etiqueta": "react.dev"
    }
  ]
}
```
