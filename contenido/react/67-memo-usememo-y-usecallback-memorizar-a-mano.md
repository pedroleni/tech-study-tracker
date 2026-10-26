# `memo`, `useMemo` y `useCallback`: memorizar a mano

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `memo-usememo-y-usecallback-memorizar-a-mano` (autogenerado del título)
- **Orden:** 670
- **Fuentes:** [memo](https://react.dev/reference/react/memo) + [useMemo](https://react.dev/reference/react/useMemo) + [useCallback](https://react.dev/reference/react/useCallback) — ver `contenido/react/TEMARIO.md` #67

---

## Qué es y para qué sirve

En la lección 66 viste que muchos renders sobran y que casi nunca importa. Cuando sí importa, lo primero es cambiar dónde vive el estado: bajarlo, pasar el contenido como `children` o separar un contexto. Pero a veces no se puede. El componente caro necesita de verdad los datos del componente que cambia, y cada vez que este se renderiza, él va detrás aunque lo que recibe sea lo mismo.

Para ese caso, React tiene tres herramientas que **guardan algo de un render para el siguiente**, lo que en programación se llama *memorizar* (en inglés, *memoization*):

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de memorizar",
  "roles": [
    {
      "etiqueta": "memo",
      "rol": "Se salta un componente",
      "descripcion": "Envuelve un componente. Si su padre se renderiza y todas sus props son las mismas que la vez anterior, React reutiliza su último resultado sin llamarlo."
    },
    {
      "etiqueta": "useMemo",
      "rol": "Guarda un valor",
      "descripcion": "Ejecuta un cálculo y guarda el resultado entre renders. Solo vuelve a calcularlo cuando cambia alguna de sus dependencias."
    },
    {
      "etiqueta": "useCallback",
      "rol": "Guarda una función",
      "descripcion": "Te devuelve la misma función en cada render mientras no cambien sus dependencias. No la ejecuta: te la da para que la pases."
    }
  ]
}
```

Las tres son **optimizaciones**: tu aplicación tiene que funcionar igual sin ellas, solo que haciendo más trabajo. Y las tres se apoyan en lo mismo que has visto en el panel desde la lección 16: React compara con `Object.is`, así que un objeto, un array o una función nuevos son **distintos** aunque tengan el mismo contenido.

Los ejemplos son del censo de aves que hace el grupo ornitológico Los Alcaravanes en la laguna de Gallocanta: una lista de especies con cuántos ejemplares se han contado de cada una.

## `memo`: saltarse el render si las props son las mismas

Por defecto, cuando un componente se renderiza, React renderiza todos sus hijos (lección 17). Un componente envuelto en `memo` cambia esa regla para sí mismo: **si su padre se renderiza y ninguna de sus props ha cambiado, React no lo llama** y se queda con lo que devolvió la última vez, con todo lo que tiene debajo.

En el censo, `App` guarda las especies y un «Modo noche» que solo cambia los colores. La lista está envuelta en `memo`, y cada fila tarda 15 ms en renderizarse, a propósito:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lista que se salta los renders de App",
  "consigna": "Pulsa «Modo noche»: ListaEspecies, con la insignia memo, sale sin cambios, y sus filas también. Pulsa «Anotar 25 grullas»: ahora sí se renderiza. Después, en ListaEspecies.jsx, quita memo (deja la función tal cual, sin envolver) y vuelve a pulsar «Modo noche».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaEspecies from './ListaEspecies'\nimport './estilos.css'\n\nconst CENSO_INICIAL = [\n  { id: 'grulla', nombre: 'Grulla común', cantidad: 310 },\n  { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n  { id: 'anade', nombre: 'Ánade real', cantidad: 40 },\n  { id: 'avoceta', nombre: 'Avoceta', cantidad: 18 },\n]\n\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n\n  function anotarGrullas() {\n    setCenso(censo.map((e) => (e.id === 'grulla' ? { ...e, cantidad: e.cantidad + 25 } : e)))\n  }\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <h1>Censo de la laguna de Gallocanta</h1>\n      <button aria-pressed={noche} onClick={() => setNoche(!noche)}>\n        Modo noche\n      </button>\n      <button onClick={anotarGrullas}>Anotar 25 grullas</button>\n      <ListaEspecies especies={censo} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaEspecies.jsx",
      "codigo": "import { memo } from 'react'\n\nfunction FilaEspecie({ especie }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 15) {\n    // 15 ms por fila, a propósito: una ficha con mucho dentro\n  }\n  return (\n    <li>\n      {especie.nombre}: {especie.cantidad}\n    </li>\n  )\n}\n\nconst ListaEspecies = memo(function ListaEspecies({ especies }) {\n  return (\n    <ul className=\"censo\" aria-label=\"Censo\">\n      {especies.map((especie) => (\n        <FilaEspecie key={especie.id} especie={especie} />\n      ))}\n    </ul>\n  )\n})\n\nexport default ListaEspecies\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n\n.panel {\n  margin-top: 0.75rem;\n  padding: 0.4rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "ListaEspecies.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Con `memo`, «Modo noche» es **1 renderizado · 2 cambios en el DOM**: `App` ← «cambió su estado n.º 2», y los dos cambios son la clase del `<main>` y el `aria-pressed` del botón. La lista y sus cuatro filas, sin cambios. Sin `memo`, el mismo clic renderiza las seis cosas y espera a las cuatro filas lentas: 60 ms, y en este bloque 120, porque `StrictMode` llama dos veces a cada componente.

«Anotar 25 grullas» renderiza la lista igualmente, con «cambió la prop «especies» (array nuevo)»: el censo ha cambiado de verdad, y `memo` lo deja pasar. **`memo` no impide los renders necesarios; se salta los que llegan con las mismas props.**

Lo que conviene saber de cómo compara:

- **Prop a prop, con `Object.is`.** No mira por dentro: un número o un texto iguales son iguales; un objeto, un array o una función creados otra vez son distintos aunque tengan lo mismo.
- **Solo frena los renders que vienen del padre.** Un componente con `memo` se sigue renderizando cuando cambia su propio estado o un contexto que lee (lo viste en la lección 29).
- **`memo` no modifica tu componente: devuelve uno nuevo**, y es ese el que usas en el JSX. Escríbelo con una función con nombre, `memo(function ListaEspecies(…) {…})`: si le pasas una flecha, `memo(({ especies }) => …)`, la función no tiene nombre y el panel la llama «Anónimo».

## Una función nueva lo estropea

Ahora cada especie tiene un botón «+1» para sumar un ejemplar. La función que suma vive en `App`, porque es quien guarda el censo, y baja a la lista como prop:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const ListaEspecies = memo(function ListaEspecies({ especies, onSumar }) {\n  // ...una FilaEspecie por especie, con su botón «+1»\n})\n\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n\n  function sumar(id) {\n    setCenso(censo.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n  }\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <button onClick={() => setNoche(!noche)}>Modo noche</button>\n      <ListaEspecies especies={censo} onSumar={sumar} />\n    </main>\n  )\n}\n\n// Pulsas «Modo noche». ¿Qué dice el panel de ListaEspecies?",
  "opciones": [
    "Sin cambios: tiene memo y el censo no ha cambiado",
    "cambió la prop «onSumar» (función nueva)",
    "se renderizó su padre",
    "cambió la prop «especies» (array nuevo)"
  ],
  "correcta": 1,
  "explicacion": "Cada render de App vuelve a ejecutar la declaración function sumar, y eso crea una función nueva. Hace lo mismo que la anterior, pero Object.is dice que son distintas, así que memo ve una prop cambiada y renderiza la lista. Un memo con una prop que es nueva en cada render no se salta nada: solo añade una comparación."
}
```

Compruébalo, y arréglalo con el Hook de la sección siguiente:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una función nueva en cada render",
  "consigna": "Pulsa «Modo noche» y lee el motivo de ListaEspecies y de cada fila. Después, en App.jsx, cambia la declaración de sumar por const sumar = useCallback((id) => { … }, []), con setCenso((actual) => actual.map(…)) dentro, e importa useCallback. Repite «Modo noche» y suma después un ejemplar a dos especies distintas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaEspecies from './ListaEspecies'\nimport './estilos.css'\n\nconst CENSO_INICIAL = [\n  { id: 'grulla', nombre: 'Grulla común', cantidad: 310 },\n  { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n  { id: 'anade', nombre: 'Ánade real', cantidad: 40 },\n  { id: 'avoceta', nombre: 'Avoceta', cantidad: 18 },\n]\n\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n\n  // Una función nueva en cada render de App\n  function sumar(id) {\n    setCenso(censo.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n  }\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <h1>Censo de la laguna de Gallocanta</h1>\n      <button aria-pressed={noche} onClick={() => setNoche(!noche)}>\n        Modo noche\n      </button>\n      <ListaEspecies especies={censo} onSumar={sumar} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaEspecies.jsx",
      "codigo": "import { memo } from 'react'\n\nfunction FilaEspecie({ especie, onSumar }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 15) {\n    // 15 ms por fila, a propósito\n  }\n  return (\n    <li>\n      {especie.nombre}: {especie.cantidad}{' '}\n      <button onClick={() => onSumar(especie.id)} aria-label={`Sumar uno a ${especie.nombre}`}>\n        +1\n      </button>\n    </li>\n  )\n}\n\nconst ListaEspecies = memo(function ListaEspecies({ especies, onSumar }) {\n  return (\n    <ul className=\"censo\" aria-label=\"Censo\">\n      {especies.map((especie) => (\n        <FilaEspecie key={especie.id} especie={especie} onSumar={onSumar} />\n      ))}\n    </ul>\n  )\n})\n\nexport default ListaEspecies\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n\n.panel {\n  margin-top: 0.75rem;\n  padding: 0.4rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Antes del cambio, «Modo noche» deja `ListaEspecies` y cada `FilaEspecie` con «cambió la prop «onSumar» (función nueva)»: **6 renderizados · 2 cambios en el DOM**. El `memo` está, pero no se salta nada.

## `useCallback`: la misma función entre renders

`useCallback` recibe una función y una lista de dependencias, como un efecto:

```jsx
const sumar = useCallback((id) => {
  setCenso((actual) => actual.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))
}, [])
```

En el primer render te devuelve la función que le pasas. En los siguientes, compara las dependencias con las de la vez anterior: **si ninguna ha cambiado, te devuelve la función guardada**, la del primer render, y tira la que acabas de escribir; si alguna ha cambiado, se queda con la nueva. Con el arreglo, «Modo noche» vuelve a **1 renderizado**, y la lista sale sin cambios.

Dos detalles:

- **No evita crear la función.** La flecha se crea en cada render igualmente, porque es una línea del componente; `useCallback` decide cuál te devuelve. Lo que ahorra no es crearla, sino lo que pasa después: que `memo` vea la misma prop.
- **Pocas dependencias, mejor ninguna.** La versión con `[censo]` funcionaría, pero cambiaría con cada suma. Con la función actualizadora de la lección 19, `sumar` no lee `censo`: recibe el estado actual como argumento, y puede quedarse con `[]`.

Esa segunda regla tiene trampa si te la saltas a medias:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const sumar = useCallback((id) => {\n  setCenso(censo.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n}, [])\n\n// El censo empieza con Garza real: 12 y Ánade real: 40.\n// Pulsas «+1» en la garza y después «+1» en el ánade.\n// ¿Qué queda en la lista?",
  "opciones": [
    "Garza real: 13 y Ánade real: 41",
    "Garza real: 12 y Ánade real: 41",
    "Garza real: 13 y Ánade real: 40",
    "Un error en la consola por la dependencia que falta"
  ],
  "correcta": 1,
  "explicacion": "Con [], useCallback devuelve siempre la función del primer render, y esa función se quedó con el censo de entonces (lección 18). El segundo clic suma al ánade sobre el censo original, con la garza en 12, y borra la primera suma. React no avisa en ejecución: lo vigila la regla exhaustive-deps del linter (lección 42), que también mira useMemo y useCallback. El arreglo es la función actualizadora, no quitar dependencias."
}
```

### Una función para todas las filas

Falta un paso. Al sumar un ejemplar a la garza, el censo cambia y la lista se renderiza, como debe. Pero con ella se renderizan **las cuatro filas**, cuando solo ha cambiado una. Para que cada fila se salte su render, la fila también lleva `memo`, y todo lo que recibe tiene que ser estable:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Cada fila se salta su render",
  "codigo": "import { memo, useCallback, useState } from 'react'\n\nconst CENSO_INICIAL = [\n  { id: 'grulla', nombre: 'Grulla común', cantidad: 310 },\n  { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n  { id: 'anade', nombre: 'Ánade real', cantidad: 40 },\n  { id: 'avoceta', nombre: 'Avoceta', cantidad: 18 },\n]\n\nconst FilaEspecie = memo(function FilaEspecie({ especie, onSumar }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 15) {\n    // 15 ms por fila, a propósito\n  }\n  return (\n    <li>\n      {especie.nombre}: {especie.cantidad}{' '}\n      <button onClick={() => onSumar(especie.id)} aria-label={`Sumar uno a ${especie.nombre}`}>\n        +1\n      </button>\n    </li>\n  )\n})\n\nconst ListaEspecies = memo(function ListaEspecies({ especies, onSumar }) {\n  return (\n    <ul className=\"censo\" aria-label=\"Censo\">\n      {especies.map((especie) => (\n        <FilaEspecie key={especie.id} especie={especie} onSumar={onSumar} />\n      ))}\n    </ul>\n  )\n})\n\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n\n  const sumar = useCallback((id) => {\n    setCenso((actual) => actual.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n  }, [])\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <h1>Censo de la laguna de Gallocanta</h1>\n      <button aria-pressed={noche} onClick={() => setNoche(!noche)}>\n        Modo noche\n      </button>\n      <ListaEspecies especies={censo} onSumar={sumar} />\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n\n.panel {\n  margin-top: 0.75rem;\n  padding: 0.4rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 8px;\n}",
  "anotaciones": [
    {
      "fragmento": "const FilaEspecie = memo(function FilaEspecie({ especie, onSumar }) {",
      "nota": "Cada fila con su propio memo. Recibe su especie y la función de sumar, nada más."
    },
    {
      "fragmento": "onClick={() => onSumar(especie.id)}",
      "nota": "La flecha que sabe qué especie sumar se crea dentro de la fila, para el botón, que no lleva memo. Así la fila recibe la misma onSumar que todas las demás."
    },
    {
      "fragmento": "<FilaEspecie key={especie.id} especie={especie} onSumar={onSumar} />",
      "nota": "La lista no envuelve onSumar en una flecha: la pasa tal cual. Si escribiera onSumar={() => onSumar(especie.id)}, cada fila recibiría una función nueva en cada render y su memo no serviría de nada."
    },
    {
      "fragmento": "actual.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e))",
      "nota": "Solo la especie sumada es un objeto nuevo; las demás se devuelven tal cual, el mismo objeto (lección 21). Por eso sus filas reciben la misma prop especie y se saltan el render."
    },
    {
      "fragmento": "}, [])",
      "nota": "Sin dependencias, gracias a la función actualizadora: sumar es la misma en todos los renders de App."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

Pulsa «+1» en la garza: **3 renderizados · 1 cambio en el DOM**. `App` porque cambió su estado, `ListaEspecies` porque cambió la prop «especies» (array nuevo), y solo la fila de la garza, con «cambió la prop «especie» (objeto nuevo)». Las otras tres, sin cambios y con la insignia memo. Y «Modo noche», 1 renderizado.

Fíjate en lo que **no** se puede hacer. Dentro del `map`, cada fila necesita «su» función, y lo natural sería escribir `onSumar={() => onSumar(especie.id)}`. Pero eso crea una función nueva por fila en cada render, y no puedes arreglarlo con `useCallback` dentro del `map`: los Hooks no se llaman en bucles (lección 44). La salida es la del bloque: **pasa la misma función a todas las filas y que cada una le diga cuál es la suya**, `onSumar(especie.id)`. Es el arreglo que necesitan las filas de capítulos de la lección 75: con `memo` solo no bastaría, porque cada fila recibe una flecha nueva.

## `useMemo` para un cálculo caro

`useMemo` guarda **el resultado** de un cálculo. Le pasas una función sin argumentos que lo calcula y las dependencias:

```jsx
const resumen = useMemo(() => resumirMes(AVISTAMIENTOS, mes), [mes])
```

En el primer render llama a tu función y guarda lo que devuelve. En los siguientes, si `mes` es el mismo, te devuelve lo guardado sin llamarla; si ha cambiado, vuelve a calcular.

El grupo tiene 200.000 avistamientos de varios años, y la pantalla de resumen enseña las especies más vistas del mes elegido. `App` mide con `performance.now()` lo que tarda en calcularlo y lo escribe en la consola. `StrictMode` está apagado para que salga una línea por render:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un resumen que se recalcula sin motivo",
  "consigna": "Pulsa «Modo noche» varias veces mirando la consola: cada render vuelve a recorrer los 200.000 avistamientos, aunque el mes es el mismo. Envuelve el cálculo en useMemo(() => resumirMes(AVISTAMIENTOS, mes), [mes]) e importa useMemo. Repite con «Modo noche» y después pulsa «Mes siguiente».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { AVISTAMIENTOS, resumirMes } from './avistamientos'\nimport './estilos.css'\n\nconst MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',\n  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']\n\nexport default function App() {\n  const [mes, setMes] = useState(0)\n  const [noche, setNoche] = useState(false)\n\n  const inicio = performance.now()\n  const resumen = resumirMes(AVISTAMIENTOS, mes)\n  console.log(`Resumen de ${MESES[mes]}: ${(performance.now() - inicio).toFixed(1)} ms`)\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <h1>Las más vistas en {MESES[mes]}</h1>\n      <button aria-pressed={noche} onClick={() => setNoche(!noche)}>\n        Modo noche\n      </button>\n      <button onClick={() => setMes((mes + 1) % 12)}>Mes siguiente</button>\n      <ol>\n        {resumen.slice(0, 5).map((fila) => (\n          <li key={fila.especie}>\n            {fila.especie}: {fila.total.toLocaleString('es-ES')} ejemplares\n          </li>\n        ))}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "avistamientos.jsx",
      "codigo": "const ESPECIES = [\n  'Grulla común', 'Garza real', 'Ánade real', 'Flamenco', 'Avoceta', 'Cigüeñuela',\n  'Somormujo lavanco', 'Focha común', 'Aguilucho lagunero', 'Calamón', 'Martinete', 'Cerceta común',\n]\n\n// 200.000 avistamientos inventados, repartidos por los doce meses\nexport const AVISTAMIENTOS = Array.from({ length: 200000 }, (_, i) => ({\n  id: i + 1,\n  especie: ESPECIES[(i * 7) % ESPECIES.length],\n  cantidad: 1 + ((i * 13) % 9),\n  mes: i % 12,\n}))\n\nexport function resumirMes(avistamientos, mes) {\n  const totales = new Map()\n  for (const a of avistamientos) {\n    if (a.mes !== mes) continue\n    totales.set(a.especie, (totales.get(a.especie) ?? 0) + a.cantidad)\n  }\n  return [...totales]\n    .map(([especie, total]) => ({ especie, total }))\n    .sort((a, b) => b.total - a.total || a.especie.localeCompare(b.especie, 'es'))\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n\n.panel {\n  margin-top: 0.75rem;\n  padding: 0.4rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true
}
```

Sin `useMemo`, cada «Modo noche» cuesta lo mismo que cambiar de mes: unos pocos milisegundos, según tu ordenador, para obtener el mismo resumen. Con `useMemo`, la consola marca 0.0 ms, o muy poco más, mientras el mes no cambie, y «Mes siguiente» vuelve a calcular, como debe.

¿Compensa? La regla de react.dev es la que viste en la lección 24: mide con `console.time` o `performance.now()`, y a partir de **1 ms**, más o menos, empieza a merecer la pena. Por debajo, o si las dependencias cambian en casi todos los renders, `useMemo` solo añade código.

Lo que hay que saber de `useMemo`:

- **No acelera el primer render.** La primera vez tiene que calcular igual; solo ahorra en los siguientes.
- **La función tiene que ser pura** (lección 12): sin argumentos, sin cambiar nada de fuera, devolviendo siempre lo mismo para las mismas dependencias. Con `StrictMode`, cada vez que tiene que calcular, React la llama dos veces seguidas y se queda con uno de los resultados, para destapar cálculos que no lo son.
- **Las dependencias son todo lo que lee el cálculo** y viene del componente: props, estado y variables del cuerpo. La regla `exhaustive-deps` te avisa si falta alguna. `AVISTAMIENTOS` no cuenta, porque es de fuera del componente y no cambia.
- **Es una caché, no una garantía.** React puede tirar lo guardado si tiene un motivo, por ejemplo al editar el archivo en desarrollo o si el componente se suspende al montarse. Tu código tiene que seguir funcionando si recalcula. Si necesitas que un valor no cambie nunca, eso es un estado o una ref (lección 33).

## `useMemo` para que un objeto o un array sean los mismos

El segundo uso de `useMemo` no tiene que ver con ahorrar cálculo, sino con la **identidad**: que un objeto o un array que pasas a un componente con `memo` sean el mismo mientras su contenido no cambie.

Si la lista del censo enseña las especies ordenadas de más a menos, lo natural es ordenarlas en `App`:

```jsx
const visibles = [...censo].sort((a, b) => b.cantidad - a.cantidad)

<ListaEspecies especies={visibles} onSumar={sumar} />
```

Ordenar cuatro especies no cuesta nada, pero el resultado es un **array nuevo en cada render**, y la lista vuelve a decir «cambió la prop «especies» (array nuevo)» con cada «Modo noche». La misma trampa que la función, ahora con un array:

```jsx
const visibles = useMemo(() => [...censo].sort((a, b) => b.cantidad - a.cantidad), [censo])
```

Ahora `visibles` es el mismo array mientras `censo` no cambie. Lo mismo vale para un objeto: el `value={{ tema, setTema }}` de un contexto, que en la lección 28 hacía que todos los lectores se renderizaran con cualquier render del proveedor, se estabiliza así:

```jsx
const valor = useMemo(() => ({ tema, setTema }), [tema])

<TemaContext value={valor}>{children}</TemaContext>
```

Y `useCallback` es esto mismo con una función. react.dev lo explica con una versión simplificada de cómo está hecho por dentro: `useMemo(() => fn, dependencias)`. Guarda la función en vez del resultado de llamarla.

Antes de memorizar un objeto, piensa si hace falta el objeto. **Las props sueltas no necesitan memorizarse**: si `FilaEspecie` solo usara el nombre y la cantidad, `nombre={especie.nombre} cantidad={especie.cantidad}` serían un texto y un número, y `Object.is` los compara por su valor. Cuanto menos cambian las props, más fácil le resulta a `memo` acertar.

## Basta una prop nueva para estropearlo

`memo` solo se salta el render si **todas** las props son las mismas. Basta una que sea nueva en cada render para que no sirva de nada, y algunas no se ven a simple vista:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const Ficha = memo(function Ficha({ especie, children }) {\n  return (\n    <article>\n      <h2>{especie.nombre}</h2>\n      {children}\n    </article>\n  )\n})\n\nexport default function App() {\n  const [noche, setNoche] = useState(false)\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <button onClick={() => setNoche(!noche)}>Modo noche</button>\n      <Ficha especie={GRULLA}>\n        <p>Llegan a la laguna en otoño desde el norte de Europa.</p>\n      </Ficha>\n    </main>\n  )\n}\n\n// GRULLA es una constante de fuera del componente.\n// Pulsas «Modo noche». ¿Se renderiza Ficha?",
  "opciones": [
    "No: especie es la misma constante y el párrafo no ha cambiado",
    "Sí: el párrafo es un elemento nuevo, creado en este render de App",
    "Solo si GRULLA tiene propiedades anidadas"
  ],
  "correcta": 1,
  "explicacion": "Lo que va entre las etiquetas de Ficha le llega en la prop children, y es JSX que App crea en cada render: un objeto nuevo. El panel lo dice así: «cambió la prop «children» (objeto nuevo)». Un memo en un componente que recibe children de un padre que se renderiza a menudo casi nunca sirve. Lo mismo pasa con style={{ … }} o con cualquier objeto escrito directamente en el JSX."
}
```

Por eso memorizar a mano es frágil: **funciona como una cadena**. `memo` en el hijo, `useCallback` en cada función que recibe, `useMemo` en cada objeto o array, y ninguna prop nueva en cada render. Así queda la del censo, eslabón a eslabón:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Lo que tiene que ser estable en cada nivel",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "estado: censo, noche",
      "estado": "renderizado",
      "nota": "← cambió su estado (modo noche)"
    },
    {
      "nombre": "ListaEspecies",
      "nivel": 1,
      "etiqueta": "memo",
      "estado": "sin-cambios",
      "nota": "especies: el array de useMemo · onSumar: la función de useCallback"
    },
    {
      "nombre": "FilaEspecie",
      "nivel": 2,
      "clave": "grulla",
      "etiqueta": "memo",
      "estado": "sin-cambios",
      "nota": "especie: el mismo objeto si no ha cambiado · onSumar: la misma de arriba"
    },
    {
      "nombre": "FilaEspecie",
      "nivel": 2,
      "clave": "garza",
      "etiqueta": "memo",
      "estado": "sin-cambios"
    }
  ]
}
```

Si alguien añade mañana un `style={{ … }}` a `ListaEspecies`, la cadena se rompe sin que nada avise, salvo el panel o las React DevTools.

Existe una última salida, que react.dev deja para casos raros: un segundo argumento de `memo` con tu propia comparación, `memo(Componente, sonIguales)`, que recibe las props de antes y las de ahora y devuelve `true` si el render se puede saltar. Si la usas, **tiene que comparar todas las props, también las funciones**: si ignora una función, el componente se queda con la de un render antiguo, con el estado de entonces dentro. Y nada de comparaciones profundas de objetos grandes, que pueden costar más que el render que te ahorras.

## Cuándo no memorizar

Memorizar tiene un precio, y casi siempre es mayor que lo que ahorra:

```laboratorio
{
  "tipo": "mitos",
  "titulo": "Lo que memorizar no te da",
  "mitos": [
    {
      "mito": "Memorizar siempre hace la aplicación más rápida",
      "realidad": "memo compara todas las props en cada render del padre, y useMemo y useCallback comparan sus dependencias y guardan valores en memoria. Si el componente casi siempre recibe props distintas, o renderizarlo cuesta poco, pagas la comparación y no te ahorras nada."
    },
    {
      "mito": "Mejor ponerlo en todas partes, por si acaso",
      "realidad": "react.dev dice que no hace daño, pero el código se lee peor, cada dependencia es algo más que mantener, y basta una prop nueva para que no sirva. Algunos equipos lo hacen así; el coste es la claridad."
    },
    {
      "mito": "useCallback evita crear la función",
      "realidad": "La función se crea en cada render igualmente; useCallback solo decide cuál te devuelve. Sin un memo o un Hook que dependa de ella, no ahorra nada."
    },
    {
      "mito": "Si algo falla sin memo, memo es el arreglo",
      "realidad": "Al revés: memo, useMemo y useCallback son solo optimizaciones, y tu aplicación tiene que funcionar igual sin ellas. Si algo se rompe al quitarlos, hay un fallo debajo, como un componente impuro o un efecto con dependencias de más, y se arregla ese fallo."
    }
  ]
}
```

En la práctica, memorizar a mano compensa en pocos casos, y react.dev los resume en tres:

1. **Un componente caro que se renderiza a menudo con las mismas props**: `memo`, y la cadena de `useCallback` y `useMemo` que necesite. Compensa más en interfaces con interacciones pequeñas y frecuentes, como un editor de dibujo que mueve formas, que en una web donde casi cada clic cambia la página entera.
2. **Un cálculo que cuesta de verdad** (1 ms o más, medido) y cuyas dependencias cambian poco: `useMemo`.
3. **Un valor que es dependencia de otro Hook**: un objeto o una función que usa un efecto, otro `useMemo` u otro `useCallback`. La lección 42 te enseñó a moverlos dentro del efecto o fuera del componente antes de memorizarlos; cuando no se puede, `useMemo` o `useCallback`. Por eso react.dev recomienda envolver en `useCallback` las funciones que devuelve un Hook propio: así, quien lo use puede optimizar si lo necesita.

Y antes de los tres, los arreglos de la lección 66, que no añaden nada que mantener: bajar el estado, pasar el contenido como `children` y separar contextos.

## El React Compiler lo hace por ti

Todo lo de esta lección tiene un sucesor. El **React Compiler**, estable desde octubre de 2025, es una herramienta que trabaja al construir el proyecto: lee tus componentes y añade por su cuenta el equivalente de `memo`, `useMemo` y `useCallback` donde hacen falta, sin que escribas ninguno. La referencia de `memo` en react.dev lo dice claramente: con el compilador activado, normalmente ya no necesitas `memo`.

Cómo funciona y cómo se activa es la lección 68. Lo de esta lección sigue valiendo: saber qué rompe una memorización te ayuda a entender lo que hace el compilador, y vas a leer `memo`, `useMemo` y `useCallback` durante años en código que no lo usa.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo que el compilador no arregla",
  "contenido": "El compilador memoriza, pero no cambia dónde vive tu estado ni hace más barato un render que de verdad tiene que ocurrir. Un estado demasiado arriba, una lista de diez mil filas o un formateador de fechas creado en cada fila siguen siendo cosa tuya, como en la lección 66."
}
```

## Errores típicos

**Devolver un objeto desde una flecha con llaves.** Con `useMemo` se ve a menudo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const resumen = useMemo(() => {\n  total: censo.reduce((suma, e) => suma + e.cantidad, 0)\n}, [censo])\n\nconsole.log(resumen)\n\n// ¿Qué escribe la consola?",
  "opciones": [
    "{ total: 380 }",
    "undefined",
    "Un error de sintaxis",
    "380"
  ],
  "correcta": 1,
  "explicacion": "Después de una flecha, { abre el cuerpo de la función, no un objeto. total: pasa a ser una etiqueta de JavaScript, la suma se calcula y se tira, y la función no tiene return: devuelve undefined. Sin aviso ni error. Escribe el return a la vista, () => { return { total: … } }, o envuelve el objeto en paréntesis, () => ({ total: … })."
}
```

**Mutar algo que llega a un componente con `memo`.** La lección 20 te avisó de que `memo` se ahorra el render justo cuando no debería si cambias un objeto en vez de sustituirlo. Aquí lo tienes:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un memo que se queda con la foto vieja",
  "consigna": "Pulsa «Anotar 50 grullas»: el contador de la sesión sube, pero la lista sigue en 300. Mira en el panel qué se ha renderizado. Quita memo y repite: ahora parece que funciona. Después arréglalo de verdad, con memo puesto: setCenso con un array nuevo y la grulla como objeto nuevo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { memo, useState } from 'react'\nimport './estilos.css'\n\nconst ListaEspecies = memo(function ListaEspecies({ especies }) {\n  return (\n    <ul className=\"censo\" aria-label=\"Censo\">\n      {especies.map((e) => (\n        <li key={e.id}>\n          {e.nombre}: {e.cantidad}\n        </li>\n      ))}\n    </ul>\n  )\n})\n\nexport default function App() {\n  const [censo, setCenso] = useState([\n    { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n    { id: 'grulla', nombre: 'Grulla común', cantidad: 300 },\n  ])\n  const [anotadas, setAnotadas] = useState(0)\n\n  function anotarGrullas() {\n    censo[1].cantidad += 50 // 🚩 cambia el objeto que ya tiene la lista\n    setCenso(censo)\n    setAnotadas(anotadas + 50)\n  }\n\n  return (\n    <main>\n      <h1>Censo de la laguna de Gallocanta</h1>\n      <button onClick={anotarGrullas}>Anotar 50 grullas</button>\n      <p>Anotadas en esta sesión: {anotadas}</p>\n      <ListaEspecies especies={censo} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n\n.panel {\n  margin-top: 0.75rem;\n  padding: 0.4rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true
}
```

El panel lo explica: `App` ← «cambió su estado n.º 2», el de `anotadas`, y `ListaEspecies`, sin cambios. `setCenso(censo)` recibe el mismo array, así que el primer estado ni cuenta como cambio; `memo` compara la prop `especies`, ve el mismo array de antes y se salta el render. El objeto de la grulla ya dice 350, pero nadie lo vuelve a pintar.

Sin `memo` la lista se renderiza con `App` y enseña 350: el fallo estaba igual, escondido. El arreglo es el de siempre, sustituir en vez de mutar (lecciones 20 y 21): `setCenso(censo.map((e) => (e.id === 'grulla' ? { ...e, cantidad: e.cantidad + 50 } : e)))`.

**Olvidar el array de dependencias.** `useMemo(() => resumirMes(AVISTAMIENTOS, mes))`, sin el segundo argumento, recalcula en cada render, y `useCallback(fn)` devuelve una función nueva cada vez. No hay ningún error: simplemente no memorizan nada.

**Depender de algo que es nuevo en cada render.** Si el cálculo de un `useMemo` depende de un objeto creado en el cuerpo del componente, `const opciones = { mes, minimo: 10 }` y `[opciones]`, las dependencias cambian siempre y se recalcula siempre. Mete el objeto dentro de la función del `useMemo` y depende de `mes`, que es un número.

**Memorizar antes de medir.** Envolver cada componente en `memo` y cada función en `useCallback` desde el primer día llena el código de dependencias que mantener y no suele cambiar nada que se note. Primero un síntoma, después el Profiler (lección 65), después los arreglos de la lección 66, y al final, si hace falta, esto.

## Ejercicios

En la caseta del censo, la tabla tarda en reaccionar cada vez que alguien activa el modo noche, aunque las cifras no cambian. El bloque trae la misma herramienta de medida que el ejercicio de la lección 66: `TablaCenso` llama a `useContarRenders('TablaCenso')`, y «Contar renders» enseña cuántas veces ha llegado a un commit. `StrictMode` está apagado por la misma razón que entonces.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una tabla que no se entera del modo noche",
  "consigna": "Pulsa «Modo noche» dos veces y después «Contar renders»: la tabla se ha renderizado tres veces. Haz que se salte esos renders sin que deje de funcionar nada: memo en TablaCenso.jsx, y en App.jsx, que visibles y sumar sean los mismos de un render a otro mientras no cambien sus datos. Comprueba también que «+1» y «Ocultar las escasas» siguen funcionando. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport TablaCenso from './TablaCenso'\nimport { Medidor } from './medidor'\nimport './estilos.css'\n\nconst CENSO_INICIAL = [\n  { id: 'grulla', nombre: 'Grulla común', cantidad: 310 },\n  { id: 'garza', nombre: 'Garza real', cantidad: 12 },\n  { id: 'anade', nombre: 'Ánade real', cantidad: 40 },\n  { id: 'aguilucho', nombre: 'Aguilucho lagunero', cantidad: 3 },\n  { id: 'avoceta', nombre: 'Avoceta', cantidad: 18 },\n]\n\n// TablaCenso se renderiza con cada clic en «Modo noche», aunque no cambie nada\n// de lo que pinta. Haz que se lo salte: memo en TablaCenso.jsx y, aquí, que\n// las props que le llegan sean las mismas mientras no cambien sus datos.\nexport default function App() {\n  const [censo, setCenso] = useState(CENSO_INICIAL)\n  const [noche, setNoche] = useState(false)\n  const [ocultarEscasas, setOcultarEscasas] = useState(false)\n\n  // De más a menos, y sin las escasas si así lo pides\n  const visibles = censo\n    .filter((especie) => !ocultarEscasas || especie.cantidad >= 10)\n    .sort((a, b) => b.cantidad - a.cantidad)\n\n  function sumar(id) {\n    setCenso(censo.map((e) => (e.id === id ? { ...e, cantidad: e.cantidad + 1 } : e)))\n  }\n\n  return (\n    <main className={noche ? 'noche' : undefined}>\n      <h1>Censo de la laguna de Gallocanta</h1>\n      <button aria-pressed={noche} onClick={() => setNoche(!noche)}>\n        Modo noche\n      </button>\n      <button aria-pressed={ocultarEscasas} onClick={() => setOcultarEscasas(!ocultarEscasas)}>\n        Ocultar las escasas\n      </button>\n      <TablaCenso especies={visibles} onSumar={sumar} />\n      <Medidor />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TablaCenso.jsx",
      "codigo": "import { useContarRenders } from './medidor'\n\nfunction FilaEspecie({ especie, onSumar }) {\n  const inicio = performance.now()\n  while (performance.now() - inicio < 4) {\n    // 4 ms por fila, a propósito\n  }\n  return (\n    <li>\n      {especie.nombre}: {especie.cantidad}{' '}\n      <button onClick={() => onSumar(especie.id)} aria-label={`Sumar uno a ${especie.nombre}`}>\n        +1\n      </button>\n    </li>\n  )\n}\n\n// Envuelve TablaCenso en memo para que se salte los renders de App\n// en los que no le llega nada nuevo.\nexport default function TablaCenso({ especies, onSumar }) {\n  useContarRenders('TablaCenso')\n\n  return (\n    <ul className=\"censo\" aria-label=\"Censo\">\n      {especies.map((especie) => (\n        <FilaEspecie key={especie.id} especie={especie} onSumar={onSumar} />\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "medidor.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\n// Herramienta de medida para las comprobaciones: cuenta los renders de cada\n// componente que llegan a un commit, igual que el contador ·N del árbol.\n// No hace falta que la toques.\nconst cuentas = new Map()\n\nexport function useContarRenders(nombre) {\n  useEffect(() => {\n    cuentas.set(nombre, (cuentas.get(nombre) ?? 0) + 1)\n  })\n}\n\nexport function Medidor() {\n  const [foto, setFoto] = useState(null)\n\n  return (\n    <aside className=\"panel\">\n      <button onClick={() => setFoto([...cuentas])}>Contar renders</button>\n      {foto && (\n        <ul aria-label=\"Renders\">\n          {foto.map(([nombre, veces]) => (\n            <li key={nombre}>\n              {nombre}: {veces}\n            </li>\n          ))}\n        </ul>\n      )}\n    </aside>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  padding: 0.5rem 1rem 1rem;\n  border-radius: 10px;\n  font-family: system-ui, sans-serif;\n  color: #1c1917;\n  background: #f8fafc;\n}\n\nmain.noche {\n  color: #e2e8f0;\n  background: #0f172a;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.25rem;\n  color: #0f766e;\n}\n\n.noche h1 {\n  color: #5eead4;\n}\n\nbutton {\n  margin: 0 0.4rem 0.4rem 0;\n  padding: 0.35rem 0.7rem;\n  font: inherit;\n}\n\nbutton[aria-pressed='true'] {\n  outline: 2px solid #14b8a6;\n}\n\n.censo {\n  display: grid;\n  gap: 0.3rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.censo li {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0.6rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n}\n\n.censo li button {\n  margin: 0;\n}\n\n.panel {\n  margin-top: 0.75rem;\n  padding: 0.4rem 0.75rem;\n  border: 1px dashed #94a3b8;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": false,
  "mostrarArbol": true,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «+1» en la garza real, pasa de 12 a 13",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar uno a Garza real"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Garza real: 13"
      }
    },
    {
      "descripcion": "Al sumar en dos especies seguidas, se conservan las dos sumas",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar uno a Garza real"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar uno a Ánade real"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Garza real: 13"
      }
    },
    {
      "descripcion": "Al pulsar «Ocultar las escasas», desaparece el aguilucho lagunero, que tiene 3",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ocultar las escasas"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Aguilucho lagunero"
        }
      }
    },
    {
      "descripcion": "El modo noche no vuelve a renderizar la tabla",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Modo noche"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Modo noche"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Contar renders"
          }
        }
      ],
      "espera": {
        "texto": "TablaCenso: 1"
      }
    },
    {
      "descripcion": "Al sumar un ejemplar, la tabla sí se renderiza otra vez",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Sumar uno a Garza real"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Contar renders"
          }
        }
      ],
      "espera": {
        "texto": "TablaCenso: 2"
      }
    }
  ]
}
```

Cada comprobación vigila un fallo distinto. La segunda caza el `useCallback` con `[]` que sigue leyendo `censo`: el segundo «+1» borraría el primero. La tercera, un `useMemo` al que le falta `ocultarEscasas` en las dependencias. La cuarta no pasa si falta cualquiera de los tres eslabones: `memo`, `useMemo` o `useCallback`. Y la quinta, un `memo` con una comparación propia que siempre dice que no ha cambiado nada.

Con la solución, el panel cuenta esto: «Modo noche» es 2 renderizados, `App` y `Medidor`, porque `Medidor` no lleva `memo` y no hace falta; `TablaCenso` y sus filas, sin cambios. Al sumar, `TablaCenso` ← «cambió la prop «especies» (array nuevo)», con todas sus filas.

**Retos para seguir practicando** (sin comprobación automática):

1. Haz que al sumar un ejemplar solo se renderice la fila que cambia, como en «Cada fila se salta su render». ¿Qué más necesita `FilaEspecie`? Cuidado con el orden: al sumar, una especie puede adelantar a otra.
2. Añade un campo «Anotador» en `App`, con un estado de texto, y comprueba que escribir en él no renderiza la tabla. Después piensa: ¿habría bastado con bajar el estado, como en la lección 66, sin memorizar nada?
3. En «Un resumen que se recalcula sin motivo», añade un segundo `useMemo` que calcule el total de ejemplares del mes a partir de `resumen`. ¿Qué pones en sus dependencias, y cuándo se vuelve a calcular?
4. En la solución del ejercicio, dale a `memo` un segundo argumento, `() => true`, y prueba «+1». Explica lo que ves con lo que has aprendido de los comparadores propios.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "memo",
      "descripcion": "La referencia completa: cómo compara las props, cómo minimizar sus cambios, el comparador propio con sus riesgos y la relación con el React Compiler.",
      "url": "https://react.dev/reference/react/memo",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useMemo",
      "descripcion": "Cómo saber si un cálculo es caro, memorizar dependencias de otros Hooks y un nodo de JSX, y los problemas típicos, como la flecha que devuelve undefined.",
      "url": "https://react.dev/reference/react/useMemo",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useCallback",
      "descripcion": "Con su comparación con useMemo, la función actualizadora para quitar dependencias y por qué un Hook propio debería devolver sus funciones memorizadas.",
      "url": "https://react.dev/reference/react/useCallback",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "exhaustive-deps",
      "descripcion": "La regla del linter que vigila las dependencias de useEffect, useMemo y useCallback, con ejemplos de cierres que se quedan con valores viejos.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React Compiler: Introduction",
      "descripcion": "Qué hace el compilador y por qué hace innecesaria la mayor parte de lo que has escrito a mano en esta lección. Es la lección 68.",
      "url": "https://react.dev/learn/react-compiler/introduction",
      "etiqueta": "react.dev"
    }
  ]
}
```
