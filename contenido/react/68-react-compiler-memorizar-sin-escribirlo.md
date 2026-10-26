# React Compiler: memorizar sin escribirlo

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `react-compiler-memorizar-sin-escribirlo` (autogenerado del título)
- **Orden:** 680
- **Fuentes:** [Introduction](https://react.dev/learn/react-compiler/introduction) + [Installation](https://react.dev/learn/react-compiler/installation) + [Debugging and Troubleshooting](https://react.dev/learn/react-compiler/debugging) — ver `contenido/react/TEMARIO.md` #68

---

## Qué es y para qué sirve

En la lección 67 memorizaste a mano el censo de aves de la laguna de Gallocanta y viste su punto débil: funciona como una cadena. `memo` en el hijo, `useCallback` en cada función que recibe, `useMemo` en cada array, y basta una prop nueva en cada render para que todo deje de servir sin que nada avise.

El **React Compiler** hace ese trabajo por ti. Es una herramienta que se ejecuta **al construir el proyecto**, no en el navegador: lee tus componentes y tus Hooks, averigua qué valor depende de qué y reescribe el código con la memorización que haría falta. Tú escribes componentes normales, sin un solo `memo`. Es estable desde la versión 1.0, publicada el 7 de octubre de 2025, y se instala como un plugin de Babel: `babel-plugin-react-compiler`.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Trabaja al construir",
      "texto": "Lo ejecuta tu herramienta de build (Vite, Next.js, Expo...) cada vez que transforma un archivo, y al navegador le llega el código ya reescrito. En esta web, los bloques que lo usan compilan dentro de tu navegador con el mismo plugin, la versión 1.0.0."
    },
    {
      "titulo": "Solo componentes y Hooks",
      "texto": "Compila las funciones que parecen componentes (nombre con mayúscula que devuelve JSX) y las que parecen Hooks (nombre que empieza por use y llama a otros Hooks). El resto de tu código lo deja como está."
    },
    {
      "titulo": "Se fía de las reglas de React",
      "texto": "Da por hecho que tus componentes son puros y que no cambias props ni estado (lecciones 12 y 20). Si encuentra código que rompe esas reglas, no lo toca: ese componente se queda sin compilar."
    },
    {
      "titulo": "Sigue siendo una optimización",
      "texto": "Lo que añade es memorización, y en la lección 67 viste que memorizar no puede cambiar el resultado: tu aplicación tiene que funcionar igual con el compilador que sin él, solo que haciendo menos trabajo."
    }
  ]
}
```

Los primeros ejemplos son el censo de la lección 67, ahora sin memorizar nada, para que compares. Después pasarás a la Herboristería La Malva, una tienda de plantas medicinales con su cesta de la compra.

## Lo que escribe el compilador

El bloque siguiente es nuevo. A la izquierda escribes un componente; a la derecha ves lo que sale de `babel-plugin-react-compiler` 1.0.0 de verdad, el mismo que instalarás en tu proyecto. Debajo, «Qué compiló React» dice qué ha hecho con cada función. El código es el censo de la lección 67 sin `memo`, sin `useMemo` y sin `useCallback`:

```laboratorio
{
  "tipo": "compilador-react",
  "titulo": "El censo, sin memorizar nada",
  "consigna": "Busca en la salida de App las tres cosas que en la lección 67 memorizabas a mano: el array ordenado, la función sumar y el elemento ListaEspecies. Después cambia sumar para que use setCenso(censo.map(…)) en vez de la función actualizadora, y mira cómo cambia el bloque que la guarda.",
  "codigo": "import { useState } from 'react'\n\nconst CENSO_INICIAL = [\n  { id: 'grulla', nombre: 'Grulla común', cantidad: 310 },\n  { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n  { id: 'anade', nombre: 'Ánade real', cantidad: 40 },\n]\n\nfunction FilaEspecie({ especie, onSumar }) {\n  return (\n    <li>\n      {especie.nombre}: {especie.cantidad}{' '}\n      <button onClick={() => onSumar(especie.id)}>+1</button>\n    </li>\n  )\n}\n\nfunction ListaEspecies({ especies, onSumar }) {\n  return (\n    <ul>\n      {especies.map((especie) => (\n        <FilaEspecie key={especie.id} especie={especie} onSumar={onSumar} />\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n\n  const visibles = [...censo].sort((a, b) => b.cantidad - a.cantidad)\n\n  function sumar(id) {\n    setCenso((actual) => actual.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n  }\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <button onClick={() => setNoche(!noche)}>Modo noche</button>\n      <ListaEspecies especies={visibles} onSumar={sumar} />\n    </main>\n  )\n}"
}
```

Así se lee la salida de `App`, tal como sale del bloque (arriba va el `import` que añade el compilador; `FilaEspecie` y `ListaEspecies` están compiladas también, pero aquí se omiten):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { c as _c } from \"react/compiler-runtime\";\n\nexport default function App() {\n  const $ = _c(11);\n  const [censo, setCenso] = useState(CENSO_INICIAL);\n  const [noche, setNoche] = useState(false);\n  let t0;\n  if ($[0] !== censo) {\n    t0 = [...censo].sort(_temp);\n    $[0] = censo;\n    $[1] = t0;\n  } else {\n    t0 = $[1];\n  }\n  const visibles = t0;\n  let t1;\n  if ($[2] === Symbol.for(\"react.memo_cache_sentinel\")) {\n    t1 = function sumar(id) {\n      setCenso(actual => actual.map(e => e.id === id ? {\n        ...e,\n        cantidad: e.cantidad + 1\n      } : e));\n    };\n    $[2] = t1;\n  } else {\n    t1 = $[2];\n  }\n  const sumar = t1;\n  const t2 = noche ? \"noche\" : undefined;\n  let t3;\n  if ($[3] !== noche) {\n    t3 = <button onClick={() => setNoche(!noche)}>Modo noche</button>;\n    $[3] = noche;\n    $[4] = t3;\n  } else {\n    t3 = $[4];\n  }\n  let t4;\n  if ($[5] !== visibles) {\n    t4 = <ListaEspecies especies={visibles} onSumar={sumar} />;\n    $[5] = visibles;\n    $[6] = t4;\n  } else {\n    t4 = $[6];\n  }\n  let t5;\n  if ($[7] !== t2 || $[8] !== t3 || $[9] !== t4) {\n    t5 = <main className={t2}>{t3}{t4}</main>;\n    $[7] = t2;\n    $[8] = t3;\n    $[9] = t4;\n    $[10] = t5;\n  } else {\n    t5 = $[10];\n  }\n  return t5;\n}\nfunction _temp(a, b) {\n  return b.cantidad - a.cantidad;\n}",
  "anotaciones": [
    {
      "fragmento": "import { c as _c } from \"react/compiler-runtime\";",
      "nota": "Lo añade el compilador. c es un Hook interno de React: por dentro llama a useMemoCache. Como cualquier Hook, solo funciona dentro de un componente o de otro Hook."
    },
    {
      "fragmento": "const $ = _c(11);",
      "nota": "El caché de App: un array de 11 huecos que React guarda entre renders, igual que guarda el estado (lección 16). Cada App que montes tiene el suyo, y el compilador ha contado cuántos huecos necesita."
    },
    {
      "fragmento": "if ($[0] !== censo) {",
      "nota": "Un useMemo con censo como dependencia. El hueco 0 guarda el censo de la vez anterior y el 1, el array ordenado. Si censo es el mismo, t0 = $[1]: no se vuelve a ordenar."
    },
    {
      "fragmento": "if ($[2] === Symbol.for(\"react.memo_cache_sentinel\")) {",
      "nota": "Esa marca significa «hueco sin rellenar». sumar no depende de nada que cambie (setCenso es siempre la misma, y la función actualizadora recibe el censo actual), así que se crea en el primer render y se reutiliza siempre: un useCallback con []."
    },
    {
      "fragmento": "t4 = <ListaEspecies especies={visibles} onSumar={sumar} />;",
      "nota": "El elemento entero queda guardado mientras visibles no cambie. Si React encuentra en su sitio el mismo objeto que la vez anterior, se salta esa rama (lección 66). Es lo que hacía memo, sin envolver ListaEspecies."
    },
    {
      "fragmento": "const t2 = noche ? \"noche\" : undefined;",
      "nota": "No todo se guarda. Un texto se compara por su valor, así que recalcularlo no cambia nada. El compilador guarda lo que cambia de identidad en cada render: objetos, arrays, funciones y JSX."
    },
    {
      "fragmento": "function _temp(a, b) {",
      "nota": "La función de ordenar no usa nada del componente, así que el compilador la saca fuera: se crea una sola vez, como si la hubieras escrito tú fuera de App."
    },
    {
      "fragmento": "if ($[7] !== t2 || $[8] !== t3 || $[9] !== t4) {",
      "nota": "El <main> depende de tres cosas: la clase, el botón y la lista. Si ninguna ha cambiado, App devuelve exactamente el mismo JSX que la vez anterior."
    }
  ]
}
```

**Cada `if` es un `useMemo` que no has escrito**, con las dependencias que ha calculado el compilador. Si cambias `sumar` a `setCenso(censo.map(…))`, su bloque pasa a ser `if ($[…] !== censo)`: ahora la función lee `censo` y tiene que cambiar cuando cambia el censo. Son las mismas dependencias que habrías puesto en `useCallback`, sin que el linter tenga que recordártelas.

### Más fino de lo que escribirías a mano

Las dependencias que calcula son más finas que las tuyas. En la salida de `FilaEspecie`, el `<li>` no depende del objeto `especie` entero, sino de las dos propiedades que lee:

```jsx
  if ($[3] !== especie.cantidad || $[4] !== especie.nombre || $[5] !== t1) {
    t2 = <li>{especie.nombre}: {especie.cantidad}{" "}{t1}</li>;
```

Y en la misma fila, la flecha `() => onSumar(especie.id)` queda guardada con `especie.id` y `onSumar` como dependencias. En la lección 67 no podías estabilizarla: estaba dentro de un `map`, y los Hooks no se llaman en bucles (lección 44). El compilador llama a un solo Hook, el de su caché, al principio del componente, y dentro guarda lo que necesite, así que puede.

Tampoco le estorba un `return` temprano. Un `useMemo` después de un `return` rompería las reglas de los Hooks, porque no se llamaría en todos los renders; el compilador guarda el cálculo igualmente, dentro de la rama que lo usa:

```jsx
function ResumenCenso({ censo }) {
  if (censo.length === 0) {
    return <p>Todavía no hay especies anotadas.</p>
  }
  const ordenadas = [...censo].sort((a, b) => b.cantidad - a.cantidad)
  // ...
}
```

Compilado, el cálculo queda en `if ($[1] !== censo) { const ordenadas = [...censo].sort(_temp); … }`, después del `return`. Pégalo en el bloque de arriba y compruébalo.

## Lo que hacías a mano, sin escribirlo

Las tres herramientas de la lección 67 tienen su equivalente en la salida:

```laboratorio
{
  "tipo": "roles",
  "titulo": "memo, useMemo y useCallback, dentro del caché",
  "roles": [
    {
      "etiqueta": "memo",
      "rol": "Un elemento guardado",
      "descripcion": "El padre guarda el elemento del hijo, como <ListaEspecies … />. Si sus props no cambian, React recibe el mismo objeto y se salta el componente entero."
    },
    {
      "etiqueta": "useMemo",
      "rol": "Un bloque con dependencias",
      "descripcion": "Cada cálculo que crea un objeto o un array queda dentro de un if que compara sus dependencias con las de la vez anterior."
    },
    {
      "etiqueta": "useCallback",
      "rol": "Una función guardada",
      "descripcion": "Las funciones que se pasan como props o se usan en el JSX se guardan igual, y solo se crean de nuevo cuando cambia algo que leen."
    }
  ]
}
```

Y lo hace con todo, no solo con lo que te acordaste de envolver. En la lección 67, `memo` no servía de nada si el hijo recibía `children` o un `style={{ … }}` escritos en el JSX, porque eran objetos nuevos en cada render. Mira qué pasa ahora:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const GRULLA = { id: 'grulla', nombre: 'Grulla común' }\n\nfunction Ficha({ especie, children }) {\n  return (\n    <article>\n      <h2>{especie.nombre}</h2>\n      {children}\n    </article>\n  )\n}\n\nexport default function App() {\n  const [noche, setNoche] = useState(false)\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <button onClick={() => setNoche(!noche)}>Modo noche</button>\n      <Ficha especie={GRULLA}>\n        <p style={{ fontStyle: 'italic' }}>Llegan a la laguna en otoño.</p>\n      </Ficha>\n    </main>\n  )\n}\n\n// Sin memo en ninguna parte, y con el compilador activado.\n// Pulsas «Modo noche». ¿Qué dice el panel de Ficha?",
  "opciones": [
    "cambió la prop «children» (objeto nuevo)",
    "Sin cambios",
    "se renderizó su padre",
    "Nada: sin memo, el compilador no puede optimizar Ficha"
  ],
  "correcta": 1,
  "explicacion": "Nada de lo que hay dentro de <Ficha>…</Ficha> depende de noche: GRULLA es una constante, y el párrafo y su style son siempre iguales. El compilador guarda ese elemento entero, con sus children, en un hueco que se rellena una sola vez. React recibe el mismo objeto y se salta Ficha. Sin compilador, con memo o sin él, el panel diría «cambió la prop «children» (objeto nuevo)»."
}
```

## Los mismos clics, menos renders

Ahora con la vista previa. Los dos bloques siguientes tienen el mismo código: el censo de la lección 67 con sus botones «+1», sin memorizar nada. El primero se ejecuta tal cual; el segundo, compilado, como en tu proyecto con el compilador activado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Sin compilar",
  "consigna": "Pulsa «Modo noche» y mira el panel: cuántos componentes se renderizan y por qué. Después pulsa «+1» en la garza real.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaEspecies from './ListaEspecies'\nimport './estilos.css'\n\nconst CENSO_INICIAL = [\n  { id: 'grulla', nombre: 'Grulla común', cantidad: 310 },\n  { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n  { id: 'anade', nombre: 'Ánade real', cantidad: 40 },\n  { id: 'avoceta', nombre: 'Avoceta', cantidad: 18 },\n]\n\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n\n  const visibles = [...censo].sort((a, b) => b.cantidad - a.cantidad)\n\n  function sumar(id) {\n    setCenso((actual) => actual.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n  }\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <h1>Censo de la laguna de Gallocanta</h1>\n      <button aria-pressed={noche} onClick={() => setNoche(!noche)}>\n        Modo noche\n      </button>\n      <ListaEspecies especies={visibles} onSumar={sumar} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaEspecies.jsx",
      "codigo": "function FilaEspecie({ especie, onSumar }) {\n  return (\n    <li>\n      {especie.nombre}: {especie.cantidad}{' '}\n      <button onClick={() => onSumar(especie.id)} aria-label={`Sumar uno a ${especie.nombre}`}>\n        +1\n      </button>\n    </li>\n  )\n}\n\nexport default function ListaEspecies({ especies, onSumar }) {\n  return (\n    <ul className=\"censo\" aria-label=\"Censo\">\n      {especies.map((especie) => (\n        <FilaEspecie key={especie.id} especie={especie} onSumar={onSumar} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

«Modo noche» renderiza **6 componentes para 2 cambios en el DOM**: `App` ← «cambió su estado n.º 2», `ListaEspecies` ← «cambió la prop «especies» (array nuevo) · cambió la prop «onSumar» (función nueva)», y cada una de las cuatro filas ← «cambió la prop «onSumar» (función nueva)». Es el punto de partida de la lección 67.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Compilado",
  "consigna": "Repite los mismos clics: «Modo noche» y después «+1» en la garza real. Abre también la pestaña «JavaScript generado»: es el código que se está ejecutando.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaEspecies from './ListaEspecies'\nimport './estilos.css'\n\nconst CENSO_INICIAL = [\n  { id: 'grulla', nombre: 'Grulla común', cantidad: 310 },\n  { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n  { id: 'anade', nombre: 'Ánade real', cantidad: 40 },\n  { id: 'avoceta', nombre: 'Avoceta', cantidad: 18 },\n]\n\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n\n  const visibles = [...censo].sort((a, b) => b.cantidad - a.cantidad)\n\n  function sumar(id) {\n    setCenso((actual) => actual.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n  }\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <h1>Censo de la laguna de Gallocanta</h1>\n      <button aria-pressed={noche} onClick={() => setNoche(!noche)}>\n        Modo noche\n      </button>\n      <ListaEspecies especies={visibles} onSumar={sumar} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaEspecies.jsx",
      "codigo": "function FilaEspecie({ especie, onSumar }) {\n  return (\n    <li>\n      {especie.nombre}: {especie.cantidad}{' '}\n      <button onClick={() => onSumar(especie.id)} aria-label={`Sumar uno a ${especie.nombre}`}>\n        +1\n      </button>\n    </li>\n  )\n}\n\nexport default function ListaEspecies({ especies, onSumar }) {\n  return (\n    <ul className=\"censo\" aria-label=\"Censo\">\n      {especies.map((especie) => (\n        <FilaEspecie key={especie.id} especie={especie} onSumar={onSumar} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true,
  "mostrarArbol": true,
  "compilador": true
}
```

Con el compilador, «Modo noche» es **1 renderizado · 2 cambios en el DOM**: solo `App`. `ListaEspecies` y las cuatro filas salen sin cambios, y no hay escrito ni un `memo` ni un `useCallback`. Es el resultado al que llegaste en la lección 67 con la cadena completa.

«+1» en la garza sí renderiza la lista, con «cambió la prop «especies» (array nuevo)», porque el censo ha cambiado de verdad. Fíjate en las filas: la de la garza dice «cambió la prop «especie» (objeto nuevo)» y las otras tres, «se renderizó su padre». El compilador no guarda cada fila del `map` por separado: cuando cambia el array, vuelve a crear los elementos de la lista, y React llama a cada `FilaEspecie`. Pero cada fila también está compilada: compara lo que recibe con lo que tiene en su caché y devuelve el mismo JSX que la vez anterior. Resultado: **un solo cambio en el DOM**, el número de la garza, y muy poco trabajo. Con `memo` en la fila, como en la lección 67, React ni siquiera la llamaba.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "El panel no enseña «Memo ✨»",
  "contenido": "En tu proyecto, las React DevTools marcan con la insignia «Memo ✨» los componentes que ha optimizado el compilador (lección 65). El árbol de renders de esta web solo pone memo cuando lo escribes tú. Para saber qué se ha compilado aquí, mira la pestaña «JavaScript generado»: cada componente compilado empieza por const $ = _c(…)."
}
```

## Lo que el compilador no compila

El compilador no adivina: **se fía de que tus componentes cumplan las reglas de React** (lección 12). Cuando encuentra algo que las rompe, no se arriesga a cambiar lo que hace tu aplicación: deja ese componente tal como lo escribiste y sigue con los demás. No falla el build ni sale nada en la consola. En este bloque te lo dice su informe; en tu proyecto, el linter y las React DevTools, como verás más abajo.

En el mostrador de la herboristería hay tres componentes escritos con prisa:

```laboratorio
{
  "tipo": "compilador-react",
  "titulo": "Tres componentes que se quedan sin compilar",
  "consigna": "Lee «Qué compiló React»: tres componentes no se compilan, y cada uno dice por qué. Arregla Precio como propone su propio mensaje, con una variable local, y comprueba que pasa a «compilado» y que en la salida aparece su const $ = _c(…).",
  "codigo": "import { useEffect, useRef, useState } from 'react'\n\nlet ultimoTicket = 0\n\n// Le pone el IVA al precio escribiendo en la prop\nfunction Precio({ producto }) {\n  producto.precio = producto.precio * 1.21\n  return <p>{producto.nombre}: {producto.precio.toFixed(2)} €</p>\n}\n\n// Numera los tickets con una variable de fuera\nfunction Ticket({ lineas }) {\n  ultimoTicket = ultimoTicket + 1\n  return <h2>Ticket n.º {ultimoTicket} · {lineas.length} productos</h2>\n}\n\n// Guarda en una ref lo último que se buscó y lo pinta\nfunction Buscador() {\n  const [texto, setTexto] = useState('')\n  const anterior = useRef('')\n\n  useEffect(() => {\n    anterior.current = texto\n  })\n\n  return (\n    <form role=\"search\">\n      <label>\n        Buscar planta <input value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <p>Antes buscaste: {anterior.current}</p>\n    </form>\n  )\n}\n\n// Este cumple las reglas\nfunction Etiqueta({ producto }) {\n  const conIva = producto.precio * 1.21\n  return <p>{producto.nombre}: {conIva.toFixed(2)} €</p>\n}\n\nexport default function Mostrador() {\n  return (\n    <main>\n      <Etiqueta producto={{ nombre: 'Manzanilla a granel', precio: 4 }} />\n      <Buscador />\n    </main>\n  )\n}"
}
```

El informe dice esto (cada línea, tal cual, con el motivo en inglés del compilador; las dos últimas, recortadas):

```text
Precio: no se compiló · This value cannot be modified Modifying component props or hook arguments is not allowed. Consider using a local variable instead
Ticket: no se compiló · Cannot reassign variables declared outside of the component/hook Variable `ultimoTicket` is declared outside of the component/hook. Reassigning this value during render is a form of side effect, …
Buscador: no se compiló · Cannot access refs during render React refs are values that are not needed for rendering. Refs should only be accessed outside of render, such as in event handlers or effects. …
Etiqueta: compilado
Mostrador: compilado
```

Cada motivo tiene dos partes pegadas: una frase corta y su explicación. Es decir:

- **`Precio`**: «Este valor no se puede modificar. No se permite modificar las props de un componente ni los argumentos de un Hook. Usa una variable local». Las props son de solo lectura (lección 12); `Etiqueta` hace lo mismo sin tocar nada.
- **`Ticket`**: «No se pueden reasignar variables declaradas fuera del componente o del Hook». Cambiar `ultimoTicket` mientras se renderiza es un efecto secundario: el número depende de cuántas veces se renderice, y con `StrictMode` son dos. El mensaje sigue: si se pinta, usa un estado; si no, cámbialo en un efecto.
- **`Buscador`**: «No se puede acceder a las refs durante el render». Una ref no avisa a React cuando cambia (lección 33), así que lo que pinta `anterior.current` puede ser un valor viejo. Lo que se pinta va en el estado.

Son los mismos textos que te dará el linter en el editor, cada uno con la regla que vigila ese caso: eso es la lección 70.

**Que un componente no se compile no rompe nada.** `Precio`, `Ticket` y `Buscador` funcionan igual que sin compilador, con sus fallos incluidos, solo que sin memorizar. `Etiqueta` y `Mostrador` se compilan con normalidad. Si prefieres que un caso así rompa el build para no pasarlo por alto, hay una opción para eso en la lección 69.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "No lo ve todo",
  "contenido": "El compilador detecta muchas formas de romper las reglas, pero no todas. Ordenar con sort una prop que es un array, o leer Date.now() o Math.random() mientras se renderiza, se compila igual (comprobado con la versión 1.0.0). Esos componentes pueden funcionar sin compilador y fallar con él. Cómo encontrarlos es la lección 69."
}
```

## Instalarlo en un proyecto de Vite

Hay dos caminos, y los dos acaban en la misma configuración.

### En un proyecto nuevo

`create-vite` (lección 2) tiene una variante con el compilador ya puesto. Al elegir React, en **Select a variant** elige `JavaScript + React Compiler`, o pásale la plantilla directamente:

```bash
npm create vite@latest herboristeria -- --template react-compiler
cd herboristeria
npm install
```

Comprobado con `create-vite` 9.3.1 el 22 de octubre de 2026. Respecto a la plantilla normal, el `package.json` trae tres dependencias de desarrollo más, `@babel/core`, `@rolldown/plugin-babel` y `babel-plugin-react-compiler`:

```json
"devDependencies": {
  "@babel/core": "^7.29.7",
  "@rolldown/plugin-babel": "^0.2.4",
  "@types/react": "^19.3.0",
  "@types/react-dom": "^19.3.0",
  "@vitejs/plugin-react": "^6.1.2",
  "babel-plugin-react-compiler": "^1.0.0",
  "oxlint": "^1.88.0",
  "vite": "^8.3.4"
}
```

Y este `vite.config.js`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import react, { reactCompilerPreset } from '@vitejs/plugin-react'\nimport babel from '@rolldown/plugin-babel'\nimport { defineConfig } from 'vite'\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [\n    react(),\n    babel({ presets: [reactCompilerPreset()] })\n  ],\n})",
  "anotaciones": [
    {
      "fragmento": "reactCompilerPreset",
      "nota": "Lo exporta @vitejs/plugin-react desde su versión 6. Prepara el compilador con las opciones que le pases y solo le manda los archivos que pueden tener componentes o Hooks: los que contienen alguna palabra que empieza por mayúscula, use seguido de mayúscula, memo o forwardRef."
    },
    {
      "fragmento": "import babel from '@rolldown/plugin-babel'",
      "nota": "@vitejs/plugin-react 6 ya no usa Babel: traduce el JSX con Oxc (lección 2). Pero el compilador es un plugin de Babel, así que este plugin vuelve a meter Babel en el proceso, solo para él."
    },
    {
      "fragmento": "react(),",
      "nota": "El plugin de siempre, que sigue traduciendo el JSX y activando Fast Refresh. El compilador va aparte y no lo sustituye."
    },
    {
      "fragmento": "babel({ presets: [reactCompilerPreset()] })",
      "nota": "Aquí se activa. Sin opciones, compila todos los componentes y Hooks que encuentra y se salta los que rompen las reglas. Las opciones van dentro de reactCompilerPreset({ … }): las verás en la lección 69."
    }
  ]
}
```

### En un proyecto que ya tienes

Instala lo mismo que trae la plantilla y copia ese `vite.config.js`:

```bash
npm install -D babel-plugin-react-compiler @rolldown/plugin-babel @babel/core
```

`@babel/core` va aparte a propósito. Sin él, npm lo instala igualmente porque `@rolldown/plugin-babel` lo necesita, pero el día de la prueba eligió una versión candidata, la 8.0.0-rc.4; la plantilla fija la 7. Y react.dev añade dos consejos:

- **El compilador, el primero.** Si usas más plugins de Babel, tiene que ejecutarse antes que todos: necesita el código tal como lo escribiste.
- **Versión exacta si tienes pocos tests.** Una versión nueva del compilador puede memorizar de otra forma, y si tu código rompe alguna regla sin que se note, eso puede cambiar lo que hace. Con `npm install -D --save-exact babel-plugin-react-compiler@latest`, la versión queda fija y la subes tú, a mano, cuando hayas probado la nueva.

Con otras herramientas cambia la instalación, no la idea: Next.js lo activa con una opción de su configuración, Expo lo trae activado desde el SDK 54 y con Babel a secas basta con añadir el plugin. react.dev tiene una sección para cada una. Con React 17 o 18 necesitas además la opción `target` y el paquete `react-compiler-runtime`.

### El compilador en Rust, todavía experimental

Todo lo anterior usa el compilador estable, el plugin de Babel. En 2026, el equipo de React lo ha portado a Rust, para que las herramientas escritas en Rust lo ejecuten directamente, sin pasar por Babel, y más deprisa. Ya se puede probar de dos formas:

- **Next.js**, desde la 16.3 (3 de agosto de 2026): la opción [`experimental.turbopackRustReactCompiler`](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopackRustReactCompiler), junto a `reactCompiler: true`. Solo funciona con Turbopack y no necesita `babel-plugin-react-compiler`.
- **Oxc**, el que ya traduce tu JSX en Vite, lo [integra](https://oxc.rs/blog/2026-08-18-react-compiler-support) en el paquete `oxc-transform-react`. Si lo instalas, `@vitejs/plugin-react` (desde la 6.1) lo usa con `react({ compiler: true })`, en lugar del `babel(…)` de arriba.

Lo probé el 26 de octubre de 2026 con el `App` del censo, en Next.js 16.4.3 y en Vite con `@vitejs/plugin-react` 6.1.2: en los dos sale lo mismo que leíste en «Lo que escribe el compilador»: `c(11)`, el bloque que compara `censo` y el centinela de `sumar`. Pero **nadie lo da todavía por terminado**. React lo presentó como un port [en desarrollo](https://github.com/react/react/pull/36173), compartido antes de probarlo dentro de Meta; Next.js lo ofrece como experimental para recoger opiniones antes de hacerlo la opción por defecto, y al construir avisa con «Experiments (use with caution)»; Oxc advierte de que sus opciones y su comportamiento pueden cambiar. **Para producción, quédate con el plugin de Babel 1.0**; el de Rust, pruébalo en una rama para comparar tiempos de build.

### Comprobar que funciona

En tu proyecto tienes dos formas de saber qué se ha compilado:

1. **Las React DevTools.** Los componentes compilados llevan la insignia «Memo ✨» (lección 65).
2. **El código que llega al navegador.** Con `npm run dev`, abre las herramientas del navegador, pestaña Fuentes, y busca tu archivo. Así sirve Vite un componente de la herboristería, `Producto`, en desarrollo:

```js
function Producto(t0) {
	const $ = _c(4);
	if ($[0] !== "19d5a17c2e8a850aaf1e3409f6b13a1a0326bf858d5b52a4735687449d0713db") {
		for (let $i = 0; $i < 4; $i += 1) {
			$[$i] = Symbol.for("react.memo_cache_sentinel");
		}
		$[0] = "19d5a17c2e8a850aaf1e3409f6b13a1a0326bf858d5b52a4735687449d0713db";
	}
	const { producto } = t0;
```

El `_c(4)` y los huecos `$[…]` ya los conoces. La cadena larga es un detalle de desarrollo: una huella del contenido del archivo. Si lo editas y guardas, la huella cambia y el caché se vacía, para que Fast Refresh no te enseñe nada calculado con el código anterior. En el build de producción no está.

El tercer apoyo es el linter: el preset `recommended-latest` de `eslint-plugin-react-hooks` te avisa en el editor de lo que rompe las reglas de React, con los mismos mensajes del informe y alguno más. La plantilla de Vite trae Oxlint; cómo añadir esas reglas es la lección 70.

## ¿Sigue haciendo falta `memo`, `useMemo` y `useCallback`?

Para código nuevo, react.dev es claro: **deja que memorice el compilador**, y usa `useMemo` o `useCallback` solo cuando necesites decidir tú qué se memoriza. El caso típico es un valor que es dependencia de un efecto: si tiene que ser el mismo para que el efecto no se repita, decláralo tú en vez de dejarlo en manos de lo que decida el compilador. La referencia de `memo` va más allá: con el compilador activado, normalmente ya no lo necesitas.

Para el código que ya tienes, la recomendación es otra: **no quites la memorización que funciona**, o quítala probando con cuidado. El compilador la respeta y la tiene en cuenta, así que quitarla puede cambiar lo que genera. Y la comprueba: si un `useMemo` tiene dependencias que no cuadran con lo que lee, prefiere no tocar ese componente.

```jsx
function Catalogo({ productos, filtro }) {
  const visibles = useMemo(
    () => productos.filter((p) => p.categoria === filtro.categoria),
    [filtro.categoria],
  )
  // ...
}
```

Falta `productos` en las dependencias, y el informe lo dice así:

```text
Catalogo: no se compiló · Existing memoization could not be preserved React Compiler has skipped optimizing this component because the existing manual memoization could not be preserved. The inferred dependencies did not match the manually specified dependencies, which could cause the value to change more or less frequently than expected. The inferred dependency was `productos`, but the source dependencies were [filtro.categoria]. Inferred different dependency than source
```

Es decir: «No se pudo conservar la memorización que ya había. La dependencia que deduce el compilador es `productos`, pero las que escribiste son `[filtro.categoria]`». Ese `useMemo` tenía un fallo de verdad (lección 67): si cambia la lista de productos, sigue enseñando la vieja.

```laboratorio
{
  "tipo": "mitos",
  "titulo": "Lo que el compilador no hace",
  "mitos": [
    {
      "mito": "Con el compilador ya no hay renders de más",
      "realidad": "Se salta los que llegan con lo mismo, como memo. Pero un estado demasiado arriba sigue renderizando su rama, y las filas de un map vuelven a ejecutarse cuando cambia el array. Lo que arreglaste en la lección 66 bajando el estado sigue siendo cosa tuya."
    },
    {
      "mito": "Memoriza cualquier cálculo caro",
      "realidad": "Solo dentro de componentes y Hooks, y cada uno con su propio caché: si dos componentes hacen el mismo cálculo con los mismos datos, lo hacen dos veces. Para un cálculo de verdad caro que usan varios, react.dev propone memorizarlo fuera de React, y medir antes."
    },
    {
      "mito": "Hace más rápido un render que tiene que ocurrir",
      "realidad": "Si algo cambia de verdad, el componente se renderiza igual. Una lista de diez mil filas o un formateador creado en cada fila (lección 66) cuestan lo mismo compilados."
    },
    {
      "mito": "Si un componente no compila, el build falla",
      "realidad": "Con la configuración por defecto, se lo salta en silencio y ese componente funciona como siempre, sin memorizar. Para enterarte, mira el linter o las DevTools."
    }
  ]
}
```

## Cuándo lo usarías de verdad

- **En un proyecto nuevo, desde el primer día.** react.dev anima a todo el mundo a usarlo, y Vite, Next.js y Expo lo ofrecen al crear el proyecto. Escribe el código sin memorizar y, si algo va lento, mide (lección 65) antes de añadir nada.
- **En un proyecto que ya existe, poco a poco.** Primero el linter, para ver qué se va a quedar fuera; después, una parte de la aplicación cada vez. Es la lección 69.
- **En una librería de componentes que publicas en npm.** react.dev tiene una guía aparte, *Compiling Libraries*: se publica ya compilada, para que la aprovechen también quienes no usan el compilador.

## Errores típicos

**Pensar que un componente que rompe las reglas rompe el build.**

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Cesta.jsx, en un proyecto con el compilador activado\n// con la configuración de la plantilla\n\nfunction Cabecera({ tienda }) {\n  return <h1>{tienda}</h1>\n}\n\nfunction Contador({ cesta }) {\n  const vistas = useRef(0)\n  vistas.current += 1\n  return <p>{cesta.length} productos · {vistas.current} vistas</p>\n}\n\nfunction Total({ cesta }) {\n  const total = cesta.reduce((suma, p) => suma + p.precio, 0)\n  return <p>Total: {total} €</p>\n}\n\n// ¿Qué pasa al hacer npm run build?",
  "opciones": [
    "El build falla con «Cannot access refs during render»",
    "Contador se queda sin compilar y funciona como sin compilador; Cabecera y Total se compilan",
    "Se compilan los tres, y vistas deja de contar",
    "No se compila nada del archivo, porque uno de sus componentes rompe las reglas"
  ],
  "correcta": 1,
  "explicacion": "Por defecto, el compilador se salta lo que no puede compilar sin riesgo y sigue con lo demás, componente a componente: ni falla el build ni avisa en la consola. Contador lee y cambia una ref durante el render, así que se queda tal cual, con su fallo incluido: vistas cuenta renders, y StrictMode los duplica. Para que un caso así rompa el build existe la opción panicThreshold (lección 69)."
}
```

**Quitar todos los `useMemo` y `useCallback` al activarlo.** En código que ya funciona, react.dev recomienda dejarlos o quitarlos de uno en uno y probando: el compilador los tiene en cuenta, y quitarlos puede cambiar cuándo cambia un valor, por ejemplo uno que un efecto usa como dependencia.

**Esperar que arregle un render que tiene que ocurrir.** El compilador se ahorra los renders que sobran, no los necesarios. Si escribir en un campo renderiza una lista enorme porque el estado vive arriba, la solución sigue siendo la de la lección 66.

**Medir en desarrollo.** En desarrollo, `StrictMode` renderiza dos veces y todo es más lento. Para comparar con el compilador y sin él, usa el build de producción y el Profiler (lección 65).

**Escribir código que «funciona» rompiendo las reglas.** Sin compilador, cambiar el estado sin su función `set` o leer `Date.now()` en el render a veces parece funcionar. Con el compilador, los valores se guardan y puede dejar de hacerlo. Es el tema de la lección 69, junto con cómo dar con el culpable.

## Ejercicios

La Herboristería La Malva ha activado el compilador, y su tienda enseña los precios con IVA. Algo falla: la manzanilla a granel cuesta 4 € sin IVA, que son 4,84 € con el 21 %, pero la tarjeta dice otra cosa, y cada vez que añades algo a la cesta, los precios suben.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los precios que suben solos",
  "consigna": "Arregla TarjetaProducto para que no toque la prop que recibe: calcula el precio con IVA en una variable propia. Antes, abre la pestaña «JavaScript generado»: TarjetaProducto no empieza por const $ = _c(…), porque el compilador se la ha saltado. Cuando la arregles, sí. Prueba a añadir productos a la cesta y, cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport TarjetaProducto from './TarjetaProducto'\nimport { PRODUCTOS, conIva, euros } from './productos'\nimport './estilos.css'\n\nexport default function App() {\n  const [cesta, setCesta] = useState([])\n\n  const total = cesta.reduce((suma, producto) => suma + conIva(producto.precio), 0)\n\n  function anadir(producto) {\n    setCesta([...cesta, producto])\n  }\n\n  return (\n    <main>\n      <h1>Herboristería La Malva</h1>\n      <ul className=\"productos\">\n        {PRODUCTOS.map((producto) => (\n          <TarjetaProducto key={producto.id} producto={producto} onAnadir={anadir} />\n        ))}\n      </ul>\n      <section className=\"cesta\" aria-label=\"Cesta\">\n        <p>\n          En la cesta: {cesta.length} {cesta.length === 1 ? 'producto' : 'productos'}\n        </p>\n        <p>Total de la cesta: {euros(total)}</p>\n      </section>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaProducto.jsx",
      "codigo": "import { conIva, euros } from './productos'\n\nexport default function TarjetaProducto({ producto, onAnadir }) {\n  // Pasa el precio a «con IVA» antes de pintarlo\n  producto.precio = conIva(producto.precio)\n\n  return (\n    <li className=\"tarjeta\">\n      <h2>{producto.nombre}</h2>\n      <p>{euros(producto.precio)} con IVA</p>\n      <button onClick={() => onAnadir(producto)}>Añadir {producto.nombre}</button>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "productos.jsx",
      "codigo": "export const PRODUCTOS = [\n  { id: 'manzanilla', nombre: 'Manzanilla a granel', precio: 4 },\n  { id: 'romero', nombre: 'Aceite de romero', precio: 10 },\n  { id: 'lavanda', nombre: 'Jabón de lavanda', precio: 5 },\n]\n\n// Precio con el IVA del 21 %\nexport function conIva(precio) {\n  return precio * 1.21\n}\n\nexport function euros(cantidad) {\n  return cantidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 38rem;\n  padding: 0.5rem 1rem 1rem;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #f7fdf4;\n  border-radius: 10px;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n  color: #3f6212;\n}\n\n.productos {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));\n  gap: 0.6rem;\n  margin: 0 0 0.75rem;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  padding: 0.6rem 0.75rem;\n  background: #fff;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1rem;\n}\n\n.tarjeta p {\n  margin: 0 0 0.5rem;\n  color: #4d7c0f;\n  font-weight: 600;\n}\n\nbutton {\n  padding: 0.3rem 0.6rem;\n  font: inherit;\n  border: 1px solid #65a30d;\n  border-radius: 6px;\n  background: #ecfccb;\n  cursor: pointer;\n}\n\n.cesta {\n  margin: 0;\n  padding: 0.5rem 0.75rem;\n  border: 1px dashed #84cc16;\n  border-radius: 8px;\n}\n\n.cesta p {\n  margin: 0.2rem 0;\n}\n"
    }
  ],
  "archivoInicial": "TarjetaProducto.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true,
  "compilador": true,
  "comprobaciones": [
    {
      "descripcion": "Al abrir la tienda, la manzanilla a granel cuesta 4,84 € con IVA",
      "pasos": [],
      "espera": {
        "texto": "4,84 € con IVA"
      }
    },
    {
      "descripcion": "Al añadir el aceite de romero, la cesta suma 12,10 €",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Aceite de romero"
          }
        }
      ],
      "espera": {
        "texto": "Total de la cesta: 12,10 €"
      }
    },
    {
      "descripcion": "Después de llenar la cesta, el jabón de lavanda sigue costando 6,05 € con IVA",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Aceite de romero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Manzanilla a granel"
          }
        }
      ],
      "espera": {
        "texto": "6,05 € con IVA"
      }
    },
    {
      "descripcion": "Con el aceite de romero y la manzanilla, la cesta suma 16,94 €",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Aceite de romero"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Añadir Manzanilla a granel"
          }
        }
      ],
      "espera": {
        "texto": "Total de la cesta: 16,94 €"
      }
    }
  ]
}
```

Con `StrictMode`, cada tarjeta se renderiza dos veces al montarse, y cada render le vuelve a sumar el IVA a la prop: por eso la manzanilla empieza en 5,86 €. Cada vez que añades algo, `App` vuelve a renderizar las tarjetas y los precios siguen subiendo. Y como la tarjeta pasa a la cesta el mismo objeto que ha cambiado, el total también sale mal.

Las comprobaciones miran lo que hace la tienda, no lo que dice el compilador: un arreglo que funcione sin cumplir las reglas también las pasaría. La segunda caza otro arreglo a medias: crear una copia con el IVA ya sumado, `{ ...producto, precio: conIva(producto.precio) }`, y pasársela a la cesta, que le volvería a sumar el IVA. Para saber si `TarjetaProducto` se compila, mira «JavaScript generado» o pégala en el bloque «Tres componentes que se quedan sin compilar».

**Retos para seguir practicando** (sin comprobación automática):

1. En «Tres componentes que se quedan sin compilar», arregla también `Ticket` y `Buscador` hasta que el informe diga «compilado» en los cinco. Pista: lo que se pinta va en un estado; `Ticket` puede recibir su número como prop.
2. Escribe en el bloque «El censo, sin memorizar nada» un componente con un `return` temprano y un cálculo después, y busca en la salida el `if` que lo guarda.
3. En el bloque «Compilado», añade a `FilaEspecie` un `useState` para marcar una especie como «vista» con un botón. ¿Qué componentes se renderizan al marcarla, con y sin compilador?
4. Crea un proyecto con `--template react-compiler`, abre las React DevTools y busca la insignia «Memo ✨». Después copia en él el `Precio` de esta lección, el que cambia la prop: ¿la sigue teniendo?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "React Compiler: Introduction",
      "descripcion": "Qué hace el compilador, qué tipo de memorización añade, si es seguro usarlo y qué hacer con useMemo, useCallback y memo.",
      "url": "https://react.dev/learn/react-compiler/introduction",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Installation",
      "descripcion": "Cómo instalarlo con Babel, Vite, Next.js, React Router, Expo, Rspack o Rsbuild, la integración con ESLint y cómo comprobar que funciona.",
      "url": "https://react.dev/learn/react-compiler/installation",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Debugging and Troubleshooting",
      "descripcion": "La diferencia entre un error del compilador y un fallo en ejecución, y qué patrones suelen dar problemas. Lo retoma la lección 69.",
      "url": "https://react.dev/learn/react-compiler/debugging",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Compiler v1.0",
      "descripcion": "El anuncio de la versión estable (7 de octubre de 2025): cómo funciona por dentro, resultados en producción y por qué fijar la versión si tienes pocos tests.",
      "url": "https://react.dev/blog/2025/10/07/react-compiler-1",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Compiler Playground",
      "descripcion": "El mismo experimento que el bloque compilador-react, con la última versión del compilador y más opciones para ver su salida.",
      "url": "https://playground.react.dev/",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Components and Hooks must be pure",
      "descripcion": "Las reglas en las que se apoya el compilador: idempotencia, efectos fuera del render y props y estado inmutables.",
      "url": "https://react.dev/reference/rules/components-and-hooks-must-be-pure",
      "etiqueta": "react.dev"
    }
  ]
}
```
