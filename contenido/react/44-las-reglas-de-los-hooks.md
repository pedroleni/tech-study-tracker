# Las reglas de los hooks

- **Módulo:** Efectos
- **Slug:** `las-reglas-de-los-hooks` (autogenerado del título)
- **Orden:** 440
- **Fuentes:** [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) + [rules-of-hooks](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks) — ver `contenido/react/TEMARIO.md` #44

---

## Qué es y para qué sirve

Desde la lección 16 conoces las dos reglas de los Hooks: **llamarlos solo en el nivel superior** y **solo desde componentes o Hooks propios**. Allí viste también el porqué, con un `useState` de juguete: React guarda el estado de cada componente en una lista y reparte los cajones por orden de llamada.

Desde entonces has usado muchos más Hooks (`useReducer`, `useContext`, `useRef`, `useEffect`) y en la lección 43 has escrito los tuyos. Esta lección cierra el tema con lo que faltaba:

- **La lista completa** de dónde se puede llamar a un Hook y dónde no, incluidos los casos que no parecen un `if`.
- **Qué pasa de verdad al romper una regla**: unas veces React se para con un error; otras no dice nada y el estado de un sitio aparece en otro.
- **Qué significa cada mensaje**, los de React en la consola y los del linter en tu editor.
- **La excepción**: `use`, que sí puede ir dentro de un `if`.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "No son reglas de estilo",
  "contenido": "Romper una regla de los Hooks no deja el código feo: deja un componente que funciona hasta que una condición cambia. Por eso existe una regla del linter solo para ellas, y por eso la plantilla de Vite de la lección 2 ya la trae activada."
}
```

## Las dos reglas, completas

**Regla 1: solo en el nivel superior.** Un Hook se llama directamente en el cuerpo del componente o del Hook propio, antes de cualquier `return`. Así se ejecuta en todos los renders y siempre en el mismo orden. Según react.dev, eso deja fuera:

- las condiciones (`if`, un ternario, `&&` y `||`) y los bucles (`for`, `while`, la función de un `map`);
- cualquier sitio después de un `return` que solo se ejecuta a veces;
- los manejadores de eventos y cualquier otra función anidada;
- las funciones que pasas a `useMemo`, `useReducer` o `useEffect`;
- los bloques `try`, `catch` y `finally`.

**Regla 2: solo desde componentes o Hooks.** Un Hook se llama desde un componente de función (nombre en mayúscula) o desde un Hook propio (nombre que empieza por `use`, lección 43). Nunca desde una función normal de JavaScript, desde el nivel del módulo, desde un componente de clase (lección 91) ni desde una función `async`.

Los casos de la lección 16 (un `if`, un manejador, un `map`, una función auxiliar) son los evidentes. Estos también rompen las reglas, aunque a primera vista no lo parezcan. Cada nota dice qué pasa al ejecutarlos con React 19.3.1:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useContext, useEffect, useMemo, useState } from 'react'\nimport { MonedaContext } from './moneda'\n\nconst tarifas = useState([])\n\nexport default function Carrito({ botellas, precio, conRegalo }) {\n  const [abierto, setAbierto] = conRegalo ? useState(false) : [false]\n  conRegalo && useEffect(() => console.log('Papel de regalo listo'))\n\n  const total = useMemo(() => {\n    const moneda = useContext(MonedaContext)\n    return `${botellas * precio} ${moneda}`\n  }, [botellas, precio])\n\n  useEffect(() => {\n    const [visto, setVisto] = useState(false)\n  }, [])\n\n  try {\n    const [cupon, setCupon] = useState('')\n  } catch {\n    // ...\n  }\n\n  return <p>Total: {total}</p>\n}\n\nasync function ResumenPedido() {\n  const pedido = await fetch('/api/pedido')\n  const [abierto, setAbierto] = useState(false)\n  // ...\n}",
  "anotaciones": [
    {
      "fragmento": "const tarifas = useState([])",
      "nota": "En el nivel del módulo, fuera de cualquier componente. Cuando se ejecuta esta línea no hay ningún render en marcha: la vista previa se cae con un TypeError (en Chrome, «Cannot read properties of null (reading 'useState')») y la consola dice «Invalid hook call»."
    },
    {
      "fragmento": "conRegalo ? useState(false) : [false]",
      "nota": "Un ternario es una condición, igual que un if: este useState solo se llama cuando conRegalo es true."
    },
    {
      "fragmento": "conRegalo && useEffect(() => console.log('Papel de regalo listo'))",
      "nota": "Y un && también. Es un truco que se ve en código escrito deprisa: el efecto existe en unos renders y en otros no. El linter marca este y el del ternario."
    },
    {
      "fragmento": "const moneda = useContext(MonedaContext)",
      "nota": "Dentro de la función de useMemo. Funciona, pero React avisa en cada render con «Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks». Lee el contexto arriba y usa la variable dentro."
    },
    {
      "fragmento": "const [visto, setVisto] = useState(false)",
      "nota": "Dentro de un efecto. Los efectos se ejecutan después del render, cuando React ya no está llamando a tu componente: la vista previa se cae con «Invalid hook call»."
    },
    {
      "fragmento": "const [cupon, setCupon] = useState('')",
      "nota": "Dentro de un try. Hoy funciona, pero react.dev lo prohíbe: si algo lanza un error dentro del try antes de llegar al Hook, ese render se lo salta y el orden cambia. Oxlint lo marca; la regla de ESLint, en su versión 7.1.1, no."
    },
    {
      "fragmento": "async function ResumenPedido()",
      "nota": "Una función async. Lo que hay después de un await se ejecuta más tarde, cuando el render ya ha terminado. El linter no deja llamar a un Hook aquí."
    }
  ]
}
```

## Por qué: React solo conoce la posición

Recuerda la idea de la lección 16: para cada componente que hay en pantalla, React guarda una lista con sus Hooks, y en cada render la recorre en orden. El primer Hook que llamas se lleva lo que hay en la posición 1, el segundo lo de la posición 2, y así. **No hay nombres**: `useState(0)` no le dice a React que ese estado se llama `botellas`. La regla del nivel superior es lo que garantiza que la posición 2 sea siempre el mismo Hook.

Lo que la lección 16 no enseñaba es el caso más traicionero: **romper la regla sin que React diga nada**. Esta ficha de la vinoteca El Lagar tiene dos modos: en el de tienda cuentas botellas; en el de cata escribes una nota. Quien la programó pensó que cada modo necesitaba su propio estado, y lo declaró dentro de cada rama:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos estados en dos ramas, y ningún aviso",
  "consigna": "Pulsa «Una más» dos veces y después «Escribir nota de cata»: el campo no sale vacío. Escribe «Afrutado», pulsa «Volver a la tienda» y mira las botellas. Pulsa «Una más» otra vez. Después, en el árbol, pulsa FichaVino y mira su estado en cada modo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction FichaVino({ nombre }) {\n  const [modo, setModo] = useState('tienda')\n\n  if (modo === 'cata') {\n    const [nota, setNota] = useState('')\n    return (\n      <section>\n        <h2>{nombre}</h2>\n        <label>\n          Nota de cata\n          <textarea value={nota} onChange={(e) => setNota(e.target.value)} />\n        </label>\n        <button onClick={() => setModo('tienda')}>Volver a la tienda</button>\n      </section>\n    )\n  }\n\n  const [botellas, setBotellas] = useState(1)\n  return (\n    <section>\n      <h2>{nombre}</h2>\n      <p>Botellas: {botellas}</p>\n      <button onClick={() => setBotellas(botellas + 1)}>Una más</button>\n      <button onClick={() => setModo('cata')}>Escribir nota de cata</button>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <FichaVino nombre=\"Ribera del Duero crianza 2021\" />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nsection {\n  max-width: 24rem;\n  padding: 0.75rem 1rem;\n  border: 1px solid #d6c7b8;\n  border-radius: 10px;\n  background: #fdf8f3;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n  color: #7b1e3a;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n  margin-bottom: 0.5rem;\n}\n\ntextarea {\n  min-height: 4rem;\n  font: inherit;\n}\n\nbutton {\n  margin: 0 0.5rem 0.5rem 0;\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

La nota de cata empieza con un «3», y al volver a la tienda el párrafo dice «Botellas: Afrutado». Con «Una más», «Afrutado1»: el `+ 1` de un texto lo concatena. Y la consola, vacía.

React compara, render a render, **qué clase de Hook hay en cada posición**. Aquí siempre hay dos `useState`: el de `modo` y otro. No tiene forma de saber que el segundo «es» `botellas` en un modo y `nota` en el otro; para él es el estado n.º 2, y le da el valor que tenga. El árbol de renders lo cuenta igual: «Una más» y lo que escribes en la nota salen los dos como «cambió su estado n.º 2», y al pulsar `FichaVino` ves dos valores sin nombre en los dos modos: el del modo y el otro.

Hay dos arreglos, según lo que quieras que pase al cambiar de modo:

```jsx
// 1. Todos los estados arriba: cada uno conserva su valor al ir y volver
const [modo, setModo] = useState('tienda')
const [botellas, setBotellas] = useState(1)
const [nota, setNota] = useState('')

if (modo === 'cata') {
  return /* ...el textarea con nota... */
}
```

```jsx
// 2. Un componente por modo, cada uno con su propio estado dentro
return modo === 'cata' ? <NotaCata /> : <Compra />
```

En el segundo, `NotaCata` y `Compra` son componentes distintos en la misma posición: al cambiar de modo, uno se desmonta y el otro se monta desde cero, y la nota escrita se pierde (lección 26). Los dos arreglos cumplen las reglas; eliges según si la nota tiene que sobrevivir a una vuelta por la tienda.

## Lo que React sí detecta

Que React no compare nombres no significa que no mire nada: **cuenta cuántos Hooks llamas y apunta de qué clase es cada uno**. Si el número cambia de un render a otro, se para. Si solo cambia la clase, avisa en la consola, aunque el componente pueda seguir funcionando (mal).

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de cambiar el orden, tres resultados",
  "roles": [
    {
      "etiqueta": "Más Hooks que antes",
      "rol": "Rendered more hooks than during the previous render",
      "descripcion": "Aparece un Hook que no estaba: dentro de un if que acaba de cumplirse, o después de un return que esta vez no se ejecuta. La vista previa se cae."
    },
    {
      "etiqueta": "Menos Hooks que antes",
      "rol": "Rendered fewer hooks than expected",
      "descripcion": "Falta un Hook que estaba: el if ha dejado de cumplirse, o un return sale antes de llegar a él. React añade que puede ser un return anticipado, la causa más habitual."
    },
    {
      "etiqueta": "Los mismos, en el mismo orden",
      "rol": "Ningún mensaje",
      "descripcion": "El caso de la vinoteca: cada rama llama a los mismos Hooks. React no puede notarlo, y el estado de una rama aparece en la otra."
    }
  ]
}
```

Y cuentan todos los Hooks, no solo los estados. En este pedido, el papel de regalo se guarda en una ref (lección 33) que solo se crea cuando hace falta:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useRef, useState } from 'react'\n\nexport default function Pedido() {\n  const [conRegalo, setConRegalo] = useState(false)\n\n  if (conRegalo) {\n    const papel = useRef('kraft')\n  }\n\n  const [botellas, setBotellas] = useState(1)\n\n  return (\n    <main>\n      <p>Botellas: {botellas}</p>\n      <button onClick={() => setConRegalo(true)}>Con regalo</button>\n    </main>\n  )\n}\n\n// Pulsas «Con regalo». ¿Qué pasa?",
  "opciones": [
    "Nada: una ref no es estado, así que no cuenta",
    "Las botellas pasan a valer «kraft»",
    "La vista previa se cae con «Rendered more hooks than during the previous render»",
    "La vista previa se cae con «Rendered fewer hooks than expected»"
  ],
  "correcta": 2,
  "explicacion": "Antes del clic, Pedido llamaba a dos useState. Después, a useState, useRef y useState: hay un Hook más, así que React para el render. Las refs también son Hooks y ocupan su posición en la lista, igual que los estados y los efectos."
}
```

La consola explica el fallo con una tabla, la misma que viste en la lección 16:

```text
React has detected a change in the order of Hooks called by Pedido. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://react.dev/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useState                   useState
2. useState                   useRef
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

Es decir: «React ha detectado un cambio en el orden de los Hooks que llama `Pedido`. Esto provocará fallos si no lo arreglas». La tabla compara los dos renders posición a posición y **se para en la primera diferencia**, que marca con la línea de `^`. En la lección 16 la posición conflictiva no existía en el render anterior (`undefined`); aquí sí existía, pero era otra clase de Hook: donde antes estaba el `useState` de las botellas, ahora hay un `useRef`. Con un Hook de menos sale el error contrario:

```text
Rendered fewer hooks than expected. This may be caused by an accidental early return statement.
```

Es decir: «Se han ejecutado menos Hooks de lo esperado. Puede deberse a un `return` anticipado puesto sin querer». Lo verás en los errores típicos.

## Fuera del render: «Invalid hook call»

La segunda regla tiene su propio mensaje. React solo puede darle a un Hook su cajón **mientras está renderizando un componente**, porque es entonces cuando sabe de quién es la lista. Un manejador de eventos se ejecuta después, cuando alguien hace clic. En este pedido, quien lo escribió quería un aviso al llegar al máximo de botellas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un Hook dentro de un manejador",
  "consigna": "Pulsa «Una botella más»: el número no cambia y la consola se pone roja. Lee el mensaje. Después arréglalo: ¿hace falta un estado para el aviso, o basta con calcularlo a partir de botellas y pintarlo debajo del botón?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Pedido() {\n  const [botellas, setBotellas] = useState(1)\n\n  function manejarClic() {\n    // Queremos avisar al llegar a 6, el máximo por pedido\n    const [aviso, setAviso] = useState('')\n    if (botellas + 1 === 6) {\n      setAviso('Máximo de 6 botellas por pedido')\n    }\n    setBotellas(botellas + 1)\n  }\n\n  return (\n    <main>\n      <p>Botellas: {botellas}</p>\n      <button onClick={manejarClic}>Una botella más</button>\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

La vista previa no se cae, porque el error no ocurre al renderizar sino al pulsar. Pero `useState` lanza su error en su misma línea, así que `setBotellas` nunca llega a ejecutarse. El mensaje completo es este:

```text
Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.
```

Es decir: «Llamada a un Hook no válida. Los Hooks solo se pueden llamar dentro del cuerpo de un componente de función. Puede deberse a uno de estos motivos: 1. las versiones de React y del renderizador (como React DOM) no coinciden; 2. estás rompiendo las reglas de los Hooks; 3. hay más de una copia de React en la misma aplicación».

Casi siempre es el segundo motivo, y en la vista previa de esta web no puede ser otro. (Este mensaje y los de la sección anterior están también en la lista de consulta de la lección 64, junto con el resto de avisos de React.) Los otros dos son problemas de tu proyecto, no de tu código: una librería que trae su propia copia de `react` en vez de usar la tuya, o un paquete enlazado con `npm link`. Se comprueba con `npm ls react` en la carpeta del proyecto: tiene que salir **una sola** versión de React.

El arreglo del pedido no necesita ningún Hook nuevo: el aviso depende solo de `botellas`, así que se calcula en el render, como en la lección 24.

```jsx
{botellas >= 6 && <p>Máximo de 6 botellas por pedido</p>}
```

El mismo «Invalid hook call» sale con un Hook dentro de un efecto (y ahí la vista previa sí se cae, con el error en el recuadro) o en el nivel del módulo, donde el recuadro muestra un error del tipo «Cannot read properties of null (reading 'useState')» (el texto exacto depende del navegador) y la consola añade el «Invalid hook call». Dentro de una clase pasa lo mismo, y lo verás en la lección 91.

## La segunda regla la vigila el nombre

Hay un caso en el que React no puede ayudarte. Esta función auxiliar lee un contexto (lección 28) para formatear precios, y el componente la llama durante el render:

```jsx
function precioConMoneda(precio) {
  const moneda = useContext(MonedaContext)
  return `${precio} ${moneda}`
}

function Precio({ precio }) {
  return <p>Precio: {precioConMoneda(precio)}</p>
}
```

**Funciona, y la consola no dice nada.** Mientras `Precio` se renderiza, React recibe una llamada a `useContext` y la atiende como si estuviera escrita en el cuerpo de `Precio`: no sabe ni le importa desde qué función ha llegado. El problema es para las personas: quien lea `precioConMoneda(12)` no tiene forma de saber que dentro hay un Hook, y el día que la llame dentro de un `if` o de un `map` romperá la primera regla sin darse cuenta.

Por eso la segunda regla se apoya en una convención de nombres. **Mayúscula: componente. `use` delante: Hook.** Todo lo demás es una función normal, y una función normal no llama a Hooks. Renombrarla basta para que sea un Hook propio (lección 43), con sus reglas a la vista:

```jsx
function usePrecioConMoneda(precio) {
  const moneda = useContext(MonedaContext)
  return `${precio} ${moneda}`
}
```

El linter, que verás enseguida, decide qué es un componente y qué es un Hook exactamente así: por el nombre.

## `use`: la excepción que sí va en un `if`

`use` (lección 49) empieza por `use`, pero no se comporta como los demás: **puede ir dentro de un `if`, de un bucle o después de un `return` anticipado**. Este precio no lee la moneda cuando el vino está agotado:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "use después de un return anticipado",
  "codigo": "import { createContext, use, useState } from 'react'\n\nconst MonedaContext = createContext('€')\n\nfunction Precio({ agotado, precio }) {\n  if (agotado) {\n    return <p>Agotado</p>\n  }\n\n  const moneda = use(MonedaContext)\n  return <p>Precio: {precio} {moneda}</p>\n}\n\nexport default function App() {\n  const [agotado, setAgotado] = useState(false)\n\n  return (\n    <main>\n      <h1>Albariño 2023</h1>\n      <Precio agotado={agotado} precio={14} />\n      <button onClick={() => setAgotado(!agotado)}>\n        {agotado ? 'Reponer' : 'Marcar como agotado'}\n      </button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "const MonedaContext = createContext('€')",
      "nota": "Un contexto sin proveedor: quien lo lea recibe el valor por defecto, el euro (lección 28)."
    },
    {
      "fragmento": "if (agotado) {\n    return <p>Agotado</p>\n  }",
      "nota": "Un return anticipado. Con useContext debajo, este componente rompería la primera regla: en unos renders habría un Hook y en otros ninguno."
    },
    {
      "fragmento": "const moneda = use(MonedaContext)",
      "nota": "Con use está permitido. Pulsa el botón varias veces: ni errores ni avisos en la consola. use no ocupa ninguna posición en la lista de Hooks del componente, así que da igual que en unos renders se llame y en otros no."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

`use` sigue teniendo dos límites: solo se llama desde componentes o Hooks, y **nunca dentro de un `try`/`catch`**. Si lo envuelves en uno para capturar lo que pase con una promesa, la consola avisa:

```text
`use` was called from inside a try/catch block. This is not allowed and can lead to unexpected behavior. To handle errors triggered by `use`, wrap your component in a error boundary.
```

Es decir: «Se ha llamado a `use` dentro de un bloque `try`/`catch`. No está permitido y puede provocar un comportamiento inesperado. Para gestionar los errores de `use`, envuelve el componente en un error boundary». Y no es un aviso teórico: el `catch` se queda con la espera de `use`, el componente pinta lo que haya en el `catch` y no vuelve a intentarlo cuando la promesa termina. Las promesas con `use` las verás en la lección 49, y los error boundaries, en la 53.

## El linter: `rules-of-hooks`

React solo se entera de un fallo cuando ocurre en el navegador, y el de la vinoteca no lo detecta nunca. Un **linter** lee tu código sin ejecutarlo y marca cada Hook fuera de sitio mientras escribes. La plantilla de Vite que creaste en la lección 2 trae Oxlint con la regla ya activada, en `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "oxc"],
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

Si al crear el proyecto eliges ESLint, la regla viene del plugin oficial del equipo de React, `eslint-plugin-react-hooks` (versión 7.1.1), y la plantilla lo configura así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// eslint.config.js\nimport js from '@eslint/js'\nimport globals from 'globals'\nimport reactHooks from 'eslint-plugin-react-hooks'\nimport reactRefresh from 'eslint-plugin-react-refresh'\nimport { defineConfig, globalIgnores } from 'eslint/config'\n\nexport default defineConfig([\n  globalIgnores(['dist']),\n  {\n    files: ['**/*.{js,jsx}'],\n    extends: [\n      js.configs.recommended,\n      reactHooks.configs.flat.recommended,\n      reactRefresh.configs.vite,\n    ],\n    languageOptions: {\n      globals: globals.browser,\n      parserOptions: { ecmaFeatures: { jsx: true } },\n    },\n  },\n])",
  "anotaciones": [
    {
      "fragmento": "import reactHooks from 'eslint-plugin-react-hooks'",
      "nota": "El plugin oficial. Se instala como dependencia de desarrollo, igual que ESLint."
    },
    {
      "fragmento": "reactHooks.configs.flat.recommended",
      "nota": "Su configuración recomendada: rules-of-hooks como error, exhaustive-deps como aviso (lección 42) y las reglas que necesita el React Compiler, como purity o refs, que verás en la lección 70."
    },
    {
      "fragmento": "files: ['**/*.{js,jsx}']",
      "nota": "Los archivos que revisa: todos los .js y .jsx del proyecto, menos la carpeta dist."
    },
    {
      "fragmento": "reactRefresh.configs.vite",
      "nota": "Otro plugin de la plantilla, para Fast Refresh: avisa si un archivo de componentes exporta también otras cosas. No tiene que ver con los Hooks."
    }
  ]
}
```

Con `npm run lint` (o en el editor, con la extensión de tu linter) verás mensajes como estos. Son los que da `eslint-plugin-react-hooks` 7.1.1 sobre los casos de esta lección:

```text
React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render
React Hook "useContext" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?
React Hook "useState" may be executed more than once. Possibly because it is called in a loop. React Hooks must be called in the exact same order in every component render
React Hook "useState" cannot be called inside a callback. React Hooks must be called in a React function component or a custom React Hook function
React Hook "useState" is called in function "manejarClic" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use"
React Hook "useState" cannot be called at the top level. React Hooks must be called in a React function component or a custom React Hook function
React Hook "useState" cannot be called in a class component. React Hooks must be called in a React function component or a custom React Hook function
React Hook "useState" cannot be called in an async function
React Hook "use" cannot be called in a try/catch block
```

En orden:

1. **«is called conditionally»**: se llama de forma condicional; los Hooks tienen que llamarse exactamente en el mismo orden en cada render. Sale con un `if`, un ternario o un `&&`. Si el Hook está después de un `return`, añade: «¿Has llamado sin querer a un Hook después de un return anticipado?».
2. **«may be executed more than once»**: puede ejecutarse más de una vez, seguramente porque está en un bucle.
3. **«cannot be called inside a callback»**: no se puede llamar dentro de una función que pasas a otra, como la de un `map`, un `useMemo` o un `useEffect`.
4. **«is called in function … that is neither…»**: la función no es ni un componente ni un Hook propio; los componentes empiezan por mayúscula y los Hooks por `use`. Sale con un manejador con nombre (`function manejarClic`), con una función auxiliar como `precioConMoneda` y también con un componente escrito en minúscula.
5. **«at the top level»**, **«in a class component»** y **«in an async function»**: en el nivel del módulo, en una clase y en una función asíncrona.
6. **«"use" cannot be called in a try/catch block»**: el único límite de `use` que vigila esta regla.

Oxlint, el de la plantilla por defecto, da el mismo texto con un punto al final y, en algunos casos, una línea de ayuda; para el ejercicio de esta lección dice «help: Move the Hook call before the condition, or call it unconditionally and branch inside the Hook/effect instead» (mueve el Hook antes de la condición, o llámalo siempre y decide dentro). Hay una diferencia entre los dos: Oxlint marca un `useState` dentro de un `try`; ESLint 7.1.1, no.

La misma regla vigila también las funciones de `useEffectEvent` (lección 41). Si llamas a una desde un manejador, el mensaje es «`alConectar` is a function created with React Hook "useEffectEvent", and can only be called from Effects and Effect Events in the same component» (solo se puede llamar desde efectos y desde otros Effect Events del mismo componente).

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "No lo calles",
  "contenido": "Un comentario eslint-disable-next-line react-hooks/rules-of-hooks hace desaparecer el mensaje, no el fallo: React seguirá repartiendo los cajones por posición, y el componente se romperá, o mezclará estados, en cuanto cambie la condición. Si el linter marca un Hook, mueve el Hook."
}
```

El resto de reglas del plugin (`purity`, `refs`, `immutability`...) las verás en la lección 70, y `exhaustive-deps` ya la conoces de la 42.

## Cómo se arregla cada caso

Casi todos los arreglos son el mismo movimiento: **el Hook sube al nivel superior y la condición baja**, al argumento, al JSX o al interior del efecto.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un estado que solo hace falta a veces",
      "texto": "Decláralo siempre, arriba, y usa su valor solo cuando toque. El estado de una dedicatoria puede existir aunque el campo no se vea."
    },
    {
      "titulo": "Un valor inicial que depende de algo",
      "texto": "La condición va en el argumento, no alrededor: useState(esSocio ? 10 : 0). Recuerda que el valor inicial solo cuenta en el primer render (lección 16)."
    },
    {
      "titulo": "Un efecto que solo debe actuar a veces",
      "texto": "El useEffect se llama siempre; la condición va dentro, y lo que lea va en sus dependencias (lección 38)."
    },
    {
      "titulo": "Un return anticipado",
      "texto": "Pon todos los Hooks antes del primer return. Salir pronto está bien siempre que no quede ningún Hook debajo."
    },
    {
      "titulo": "Estado para cada elemento de una lista",
      "texto": "Saca el elemento a su propio componente, con su Hook dentro, y pinta uno por elemento con su key (lecciones 11 y 16)."
    },
    {
      "titulo": "Un Hook en un manejador",
      "texto": "El estado se declara arriba y el manejador solo llama a su set. Antes, pregúntate si hace falta estado o si se puede calcular (lección 24)."
    },
    {
      "titulo": "Lógica con Hooks que quieres reutilizar",
      "texto": "Conviértela en un Hook propio con nombre useAlgo (lección 43) y llámalo en el nivel superior, como cualquier otro."
    }
  ]
}
```

## Errores típicos

**Un Hook dentro de un `if` «porque solo hace falta a veces».** Es el origen de casi todos los fallos de esta lección:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Pedido() {\n  const [conRegalo, setConRegalo] = useState(true)\n\n  if (conRegalo) {\n    const [dedicatoria, setDedicatoria] = useState('Para Lucía')\n  }\n\n  const [botellas, setBotellas] = useState(1)\n\n  return (\n    <main>\n      <p>Botellas: {botellas}</p>\n      <button onClick={() => setConRegalo(false)}>\n        Sin envoltorio de regalo\n      </button>\n    </main>\n  )\n}\n\n// Pulsas «Sin envoltorio de regalo». ¿Qué pasa?",
  "opciones": [
    "Nada raro: el párrafo sigue diciendo «Botellas: 1»",
    "El párrafo pasa a decir «Botellas: Para Lucía»",
    "La vista previa se cae con «Rendered fewer hooks than expected»",
    "La vista previa se cae con «Invalid hook call»"
  ],
  "correcta": 2,
  "explicacion": "En el primer render hubo tres useState; en este, dos. Durante el render, botellas llega a leer el cajón de la dedicatoria, pero no se ve: al terminar, a React le sobra una posición de la lista y se para con «Rendered fewer hooks than expected. This may be caused by an accidental early return statement»."
}
```

**Callar al linter.** Ya lo has visto: un `eslint-disable` deja el fallo donde estaba. Si una regla te parece absurda en un caso concreto, lo más probable es que el código pueda escribirse de otra forma.

**Un Hook escondido en una función auxiliar.** Funciona hasta que alguien la llama dentro de un `if`. Si una función llama a un Hook, su nombre empieza por `use`.

**Confundir «return anticipado» con «prohibido».** Lo prohibido es un Hook *después* del `return`. Con todos los Hooks arriba, puedes salir tan pronto como quieras; la lección 16 lo arreglaba así.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si no sale ningún error, cumplo las reglas",
      "realidad": "La ficha de la vinoteca no daba ningún error. Un Hook en un bucle con un número fijo de vueltas, o dentro de un try, tampoco: hoy funcionan. react.dev los prohíbe igual, porque basta un cambio pequeño para que dejen de hacerlo."
    },
    {
      "mito": "Las reglas son una manía del linter",
      "realidad": "El linter solo las hace visibles antes de ejecutar. El que se rompe es React, que identifica cada Hook por su posición: lo has visto con «Rendered more hooks» y con un estado saltando de una rama a otra."
    },
    {
      "mito": "use es un Hook como los demás",
      "realidad": "Solo se puede llamar desde componentes y Hooks, pero puede ir en un if, en un bucle o después de un return. Lo que no admite es un try/catch."
    },
    {
      "mito": "Una función que llama a un Hook ya es un Hook",
      "realidad": "Para React, sí, mientras la llames durante el render. Pero si su nombre no empieza por use, ni el linter ni quien lea el código lo sabrán."
    }
  ]
}
```

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El pedido para regalo que se cae",
  "consigna": "En El Lagar puedes envolver un pedido para regalo y escribir una dedicatoria. Marca la casilla: la vista previa se cae. Arréglalo para que el campo aparezca y desaparezca con la casilla y las botellas se conserven. Y una condición más: si desmarcas sin querer y vuelves a marcar, la dedicatoria escrita tiene que seguir ahí. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function Pedido() {\n  const [botellas, setBotellas] = useState(1)\n  const [regalo, setRegalo] = useState(false)\n\n  let campoDedicatoria = null\n  if (regalo) {\n    // La dedicatoria solo hace falta si el pedido va para regalo\n    const [dedicatoria, setDedicatoria] = useState('')\n    campoDedicatoria = (\n      <p className=\"campo\">\n        <label htmlFor=\"dedicatoria\">Dedicatoria</label>\n        <textarea\n          id=\"dedicatoria\"\n          value={dedicatoria}\n          onChange={(e) => setDedicatoria(e.target.value)}\n        />\n      </p>\n    )\n  }\n\n  return (\n    <main>\n      <h1>Tu pedido en El Lagar</h1>\n      <p>Garnacha de Calatayud 2022</p>\n      <p>Botellas: {botellas}</p>\n      <button onClick={() => setBotellas(botellas + 1)}>Una botella más</button>\n      <label className=\"casilla\">\n        <input\n          type=\"checkbox\"\n          checked={regalo}\n          onChange={(e) => setRegalo(e.target.checked)}\n        />\n        Envolver para regalo\n      </label>\n      {campoDedicatoria}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.25rem;\n  font-size: 1.3rem;\n  color: #7b1e3a;\n}\n\nbutton {\n  padding: 0.4rem 0.75rem;\n  font: inherit;\n}\n\n.casilla {\n  display: flex;\n  gap: 0.4rem;\n  align-items: center;\n  margin: 0.75rem 0;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n}\n\ntextarea {\n  min-height: 3.5rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al marcar «Envolver para regalo», aparece el campo «Dedicatoria»",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        }
      ],
      "espera": {
        "etiqueta": "Dedicatoria"
      }
    },
    {
      "descripcion": "Se puede escribir la dedicatoria",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        },
        {
          "escribir": {
            "etiqueta": "Dedicatoria",
            "texto": "Para Lucía, por su santo"
          }
        }
      ],
      "espera": {
        "etiqueta": "Dedicatoria",
        "valor": "Para Lucía, por su santo"
      }
    },
    {
      "descripcion": "Las botellas se conservan al marcar la casilla",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Una botella más"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Una botella más"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        }
      ],
      "espera": {
        "texto": "Botellas: 3"
      }
    },
    {
      "descripcion": "Al desmarcar la casilla, el campo desaparece",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Una botella más"
          }
        }
      ],
      "espera": {
        "ausente": {
          "etiqueta": "Dedicatoria"
        }
      }
    },
    {
      "descripcion": "Después de desmarcar, «Una botella más» sigue sumando",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Una botella más"
          }
        }
      ],
      "espera": {
        "texto": "Botellas: 2"
      }
    },
    {
      "descripcion": "Al volver a marcar la casilla, la dedicatoria escrita sigue ahí",
      "pasos": [
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        },
        {
          "escribir": {
            "etiqueta": "Dedicatoria",
            "texto": "Para Lucía, por su santo"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        },
        {
          "pulsar": {
            "rol": "checkbox",
            "nombre": "Envolver para regalo"
          }
        }
      ],
      "espera": {
        "etiqueta": "Dedicatoria",
        "valor": "Para Lucía, por su santo"
      }
    }
  ]
}
```

Si has sacado el campo a un componente `Dedicatoria` con su propio `useState`, la última comprobación falla: al desmarcar, `Dedicatoria` se desmonta y su estado se pierde (lección 26). Cumple las reglas, pero no lo que pedía el ejercicio; para eso, el estado tiene que vivir en `Pedido`, arriba, aunque el campo no se vea.

**Retos para seguir practicando** (sin comprobación automática):

1. Pega el código inicial del ejercicio en tu proyecto de Vite y ejecuta `npm run lint`. Compara el mensaje de Oxlint con los de esta lección, y fíjate en la línea y la columna: señalan el `useState`, no el `if`.
2. Rehaz la ficha de la vinoteca con los dos arreglos: todos los estados arriba, y un componente por modo (`NotaCata` y `Compra`). Escribe una nota, vuelve a la tienda y regresa a la cata. ¿En cuál se conserva la nota? Explica por qué con la lección 26.
3. Convierte `precioConMoneda` en un Hook propio y úsalo en dos componentes. Después intenta llamarlo dentro de un `map` y lee lo que dice el linter.
4. En tu proyecto, ejecuta `npm ls react` y comprueba que sale una sola versión. Así sabrás descartar los motivos 1 y 3 de «Invalid hook call» la próxima vez que lo veas.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Rules of Hooks",
      "descripcion": "La referencia oficial de las dos reglas, con la lista completa de sitios donde no se puede llamar a un Hook.",
      "url": "https://react.dev/reference/rules/rules-of-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "rules-of-hooks (lint)",
      "descripcion": "La regla del linter: qué detecta, la excepción de use y cómo arreglar un estado o un efecto condicional.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Invalid Hook Call Warning",
      "descripcion": "Adonde lleva el enlace de los mensajes de esta lección: los tres motivos de «Invalid hook call» y cómo encontrar una copia duplicada de React.",
      "url": "https://react.dev/warnings/invalid-hook-call-warning",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "eslint-plugin-react-hooks",
      "descripcion": "Todas las reglas del plugin oficial, las de los Hooks y las del React Compiler.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "use",
      "descripcion": "La referencia de use: por qué puede ir dentro de condiciones y bucles, y qué no admite.",
      "url": "https://react.dev/reference/react/use",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "react/rules-of-hooks en Oxlint",
      "descripcion": "La misma regla en Oxlint, el linter de la plantilla de Vite.",
      "url": "https://oxc.rs/docs/guide/usage/linter/rules/react/rules-of-hooks.html",
      "etiqueta": "oxc.rs"
    }
  ]
}
```
