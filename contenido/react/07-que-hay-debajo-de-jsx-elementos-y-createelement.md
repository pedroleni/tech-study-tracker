# Qué hay debajo de JSX: elementos y `createElement`

- **Módulo:** Qué es React y primeros pasos
- **Slug:** `que-hay-debajo-de-jsx-elementos-y-createelement` (autogenerado del título)
- **Orden:** 70
- **Fuentes:** [createElement](https://react.dev/reference/react/createElement) + [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) — ver `contenido/react/TEMARIO.md` #7

---

## Qué es y para qué sirve

En la lección 2 viste que el navegador no entiende JSX y que alguien tiene que traducirlo antes de ejecutarlo. Esta lección abre esa traducción. No vas a escribir así tus componentes, pero entenderla explica de golpe varias reglas de JSX que hasta ahora parecían caprichos: por qué los componentes empiezan por mayúscula, por qué un componente devuelve un solo elemento o por qué se escribe `className`.

La idea cabe en una frase:

> **Cada etiqueta de JSX se convierte en una llamada a una función, y esa llamada devuelve un objeto: un elemento de React, la descripción de lo que quieres ver en pantalla.**

React recibe esos objetos, calcula qué tiene que cambiar en la página y lo cambia. Tú nunca escribes en el DOM: escribes descripciones.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "No hace falta memorizar la traducción",
  "contenido": "Nadie escribe a mano lo que sale del compilador. El objetivo es reconocerlo: aparece en el código que genera npm run build, en proyectos y tutoriales antiguos y en lo que imprimes en la consola. Entenderlo te ahorra muchos tropiezos con JSX."
}
```

## De JSX a llamadas a funciones

Esta es la tarjeta de un panel de salidas de tren. Arriba, lo que escribes tú; abajo, lo que sale del compilador, con los espacios ordenados para que se lea mejor:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// Lo que escribes en App.jsx\n<section className=\"salida\">\n  <h2>Regional a Zaragoza</h2>\n  <p>Vía <strong>4</strong> · 18:05</p>\n</section>\n\n// Lo que sale del compilador\nimport { jsxs as _jsxs, jsx as _jsx } from \"react/jsx-runtime\"\n\n_jsxs('section', {\n  className: \"salida\",\n  children: [\n    _jsx('h2', { children: \"Regional a Zaragoza\" }),\n    _jsxs('p', { children: [\"Vía \", _jsx('strong', { children: \"4\" }), \" · 18:05\"] }),\n  ],\n})",
  "anotaciones": [
    {
      "fragmento": "import { jsxs as _jsxs, jsx as _jsx } from \"react/jsx-runtime\"",
      "nota": "Este import lo añade el compilador: tú no lo escribes nunca. Trae dos funciones del paquete react, jsx y jsxs, y les pone un guion bajo delante para que no choquen con tus propios nombres."
    },
    {
      "fragmento": "_jsxs('section', {",
      "nota": "Cada etiqueta se convierte en una llamada. El primer argumento dice qué pintar: como section empieza por minúscula, va como cadena de texto, y para React eso significa una etiqueta de HTML."
    },
    {
      "fragmento": "className: \"salida\",",
      "nota": "Los atributos pasan a ser propiedades de un objeto, el segundo argumento: las props. Por eso siguen los nombres de JavaScript y del DOM, como className, que es el nombre de la propiedad element.className."
    },
    {
      "fragmento": "children: [",
      "nota": "Lo que va entre la etiqueta de apertura y la de cierre también acaba dentro de las props, con el nombre children. Con varios hijos, children es un array."
    },
    {
      "fragmento": "_jsx('h2', { children: \"Regional a Zaragoza\" })",
      "nota": "Con un solo hijo, children es directamente ese hijo, aquí una cadena, y la función es jsx en vez de jsxs."
    },
    {
      "fragmento": "[\"Vía \", _jsx('strong', { children: \"4\" }), \" · 18:05\"]",
      "nota": "Texto y etiquetas se mezclan en el mismo array. Una etiqueta dentro de otra es una llamada dentro de otra: el anidamiento del JSX se convierte en anidamiento de llamadas."
    }
  ]
}
```

¿Por qué dos funciones? `jsxs` es la versión para **hijos estáticos**: el compilador la usa cuando una etiqueta tiene varios hijos escritos uno detrás de otro. En desarrollo, eso le dice a React que ese array lo has escrito tú a mano, que nunca cambia de orden y que no necesita `key`. `jsx` sirve para todo lo demás, incluidos los arrays que generas con `map`, y para esos sí te pedirá una `key` (lección 11). En producción, `jsx` y `jsxs` son exactamente la misma función.

## Mira la traducción mientras escribes

Este bloque tiene, además de los archivos, una pestaña «JavaScript generado» con lo que sale de tu JSX. Lo traduce [Sucrase](https://github.com/alangpierce/sucrase), el compilador que usa esta web, y se actualiza mientras escribes.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tu JSX, traducido en directo",
  "consigna": "Abre la pestaña «JavaScript generado» y compárala con App.jsx. Después prueba, de uno en uno: quita el strong (el p pasa de jsxs a jsx), añade title=\"Regional\" al h2, añade key=\"r1\" a la section y busca dónde acaba, y cambia la section por un fragmento, <> y </>.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nexport default function App() {\n  return (\n    <section className=\"salida\">\n      <h2>Regional a Zaragoza</h2>\n      <p>Vía <strong>4</strong> · 18:05</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".salida {\n  max-width: 22rem;\n  padding: 0.75rem 1rem;\n  border-left: 4px solid #0e7490;\n  border-radius: 6px;\n  background: #ecfeff;\n  font-family: system-ui, sans-serif;\n}\n\n.salida h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.15rem;\n}\n\n.salida p {\n  margin: 0;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true
}
```

Al compararla con tu código, fíjate en esto:

- **El `import` va pegado a tu primera línea, y hay espacios y comas en sitios raros.** Sucrase respeta tus saltos de línea: cada línea de tu JSX se queda en la misma línea del JavaScript, y gracias a eso los errores de la vista previa pueden señalar la línea correcta de tu archivo.
- **Es la traducción de producción**, la que saldría de `npm run build`. La vista previa ejecuta la de desarrollo, que llama a `jsxDEV` en lugar de `jsx`: crea el mismo elemento, pero además hace las comprobaciones que alimentan los avisos de React y apunta dónde se creó cada elemento, para que esos avisos puedan decirte dónde está el problema.
- **La `key` no va dentro de las props.** Si le pones `key="r1"` a la `section`, aparece como tercer argumento: `_jsxs('section', { ... }, "r1")`. React la guarda aparte, y la lección 11 explica para qué.
- **El fragmento también es un `type`.** Con `<>` y `</>` verás `_jsxs(_Fragment, { children: [...] })`: un tipo especial que React exporta y que no deja ninguna etiqueta en la página.

En tu proyecto, Vite usa otro compilador, Oxc, que produce lo mismo con otro formato.

## El runtime automático y el clásico

El `import` de `react/jsx-runtime` que añade el compilador es lo que se llama el **runtime automático** de JSX. Existe desde 2020, con React 17. Antes, JSX se traducía a llamadas a `React.createElement`, el **runtime clásico**. La misma tarjeta quedaba así:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// La misma tarjeta con el runtime clásico, el de antes de React 17\nimport React from 'react'\n\nReact.createElement('section', { className: \"salida\" },\n  React.createElement('h2', null, \"Regional a Zaragoza\"),\n  React.createElement('p', null, \"Vía \", React.createElement('strong', null, \"4\"), \" · 18:05\"),\n)",
  "anotaciones": [
    {
      "fragmento": "import React from 'react'",
      "nota": "El JSX se convertía en React.createElement, así que la variable React tenía que existir en cada archivo con JSX aunque no la usaras para nada más. Por eso verás este import arriba de todo en tanto código antiguo."
    },
    {
      "fragmento": "React.createElement('section', { className: \"salida\" },",
      "nota": "Primero el tipo y después las props, igual que con jsx. Lo que cambia son los hijos: ya no van dentro de las props."
    },
    {
      "fragmento": "React.createElement('h2', null, \"Regional a Zaragoza\")",
      "nota": "Sin atributos, las props son null. Cada hijo va como un argumento más, después de las props, tantos como haga falta."
    }
  ]
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos traducciones del mismo JSX",
  "roles": [
    {
      "etiqueta": "Runtime automático",
      "rol": "jsx() y jsxs() de react/jsx-runtime",
      "descripcion": "El de hoy: React 19 lo exige. El compilador importa las funciones por ti. Los hijos van dentro de las props, como children, y la key va aparte, como tercer argumento."
    },
    {
      "etiqueta": "Runtime clásico",
      "rol": "React.createElement()",
      "descripcion": "El de antes de 2020. Obligaba a importar React en cada archivo con JSX. Los hijos van como argumentos sueltos después de las props, y la key va dentro de las props."
    }
  ]
}
```

En un proyecto de Vite no tienes que configurar nada: el plugin de React usa el runtime automático por defecto. Si un proyecto antiguo siguiera con el clásico, React 19 te lo diría en la consola mientras desarrollas:

```text
Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform
```

Y si te encuentras `import React from 'react'` en un archivo que solo usa JSX, viene de aquella época: hoy sobra.

## Un elemento es un objeto

Las dos funciones, `jsx` y `createElement`, hacen lo mismo: construir un objeto y devolverlo. Ese objeto es un **elemento de React**, una descripción ligera de un trozo de interfaz. Míralo con tus propios ojos: este bloque crea dos elementos fuera de cualquier componente y los imprime en la consola que hay debajo de la vista previa.

El segundo elemento es de un componente que recibe datos, `TarjetaTren`. Es un adelanto de la lección 8: lo que escribes como atributos en `<TarjetaTren destino="Lleida" hora="19:10" />` le llega a la función en un objeto, el mismo que vas a ver en la consola, y ella lo desestructura en su primera línea, `({ destino, hora })`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos elementos, impresos en la consola",
  "consigna": "Lee la consola de debajo de la vista previa. Después cambia el texto o el className del aviso, o añádele key=\"aviso-1\", y mira cómo cambia el objeto impreso.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import TarjetaTren from './TarjetaTren'\nimport './estilos.css'\n\nconst aviso = <p className=\"aviso\">El regional de las 18:05 sale con retraso</p>\nconst tarjeta = <TarjetaTren destino=\"Lleida\" hora=\"19:10\" />\n\nconsole.log(aviso)\nconsole.log(aviso.$$typeof)\nconsole.log(Object.isFrozen(aviso), Object.isFrozen(aviso.props))\nconsole.log(tarjeta)\nconsole.log(typeof tarjeta.type, tarjeta.type.name)\n\nexport default function App() {\n  return (\n    <main>\n      {aviso}\n      {tarjeta}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaTren.jsx",
      "codigo": "export default function TarjetaTren({ destino, hora }) {\n  return (\n    <article className=\"salida\">\n      <h2>{destino}</h2>\n      <p>Sale a las {hora}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".salida {\n  max-width: 22rem;\n  padding: 0.75rem 1rem;\n  border-left: 4px solid #0e7490;\n  border-radius: 6px;\n  background: #ecfeff;\n  font-family: system-ui, sans-serif;\n}\n\n.salida h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.15rem;\n}\n\n.salida p {\n  margin: 0;\n}\n\nmain {\n  display: grid;\n  gap: 0.75rem;\n  font-family: system-ui, sans-serif;\n}\n\n.aviso {\n  margin: 0;\n  color: #9a3412;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Fíjate en que los `console.log` están fuera del componente: se ejecutan una sola vez, al cargar el archivo. Dentro de un componente se ejecutarían en cada render, y eso tiene sus propias sorpresas (lección 12).

Esta consola es sencilla: convierte cada objeto a texto JSON para enseñarlo, y JSON no sabe escribir funciones ni símbolos, así que esas propiedades no salen en el texto. Por eso hay líneas que las imprimen aparte. En tu ordenador, la consola de las herramientas de desarrollo del navegador te deja desplegar el objeto completo.

La primera línea es el elemento `aviso`. Estos son sus campos:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "type: qué hay que pintar",
      "texto": "Aquí la cadena \"p\": una etiqueta de HTML. En la tarjeta, type es la propia función TarjetaTren: como es una función, no sale en su línea, y por eso la última la imprime aparte."
    },
    {
      "titulo": "props: atributos e hijos",
      "texto": "Un objeto con className y children. Es exactamente lo que recibirá el componente cuando React lo llame: en la lección 8 lo usarás a fondo."
    },
    {
      "titulo": "key: null salvo que la pongas",
      "texto": "Sirve para que React distinga los elementos de una lista (lección 11). Si la escribes en el JSX, aparece aquí y no dentro de props."
    },
    {
      "titulo": "$$typeof: la marca de elemento",
      "texto": "Un Symbol que dice: esto es un elemento de React. Como es un símbolo, no sale en el JSON, y la segunda línea lo imprime aparte. Esa es justo su gracia: como un JSON que llegue de un servidor no puede contener símbolos, nadie puede colar un elemento falso a través de unos datos."
    },
    {
      "titulo": "_owner y _store: internos de desarrollo",
      "texto": "React los añade para darte mejores avisos mientras desarrollas. No los uses: en producción ni siquiera existen."
    }
  ]
}
```

La tercera línea dice `true true`: en desarrollo, React **congela** el elemento y sus props con `Object.freeze`. Un elemento no se modifica después de crearlo. Si quieres otra cosa en pantalla, se crea un elemento nuevo, y eso es justo lo que pasa en cada render: tus componentes se vuelven a ejecutar, devuelven elementos nuevos y React los compara con los anteriores para saber qué cambiar en el DOM (lo verás en la lección 17). Por eso crear elementos es baratísimo: son objetos pequeños, no nodos del DOM.

## Elemento frente a componente

En el JSX se escriben casi igual, pero no son lo mismo. La cuarta línea de la consola era el elemento `tarjeta`, con sus props `destino` y `hora`; la quinta, su `type`: **la propia función** `TarjetaTren`.

Eso quiere decir que escribir `<TarjetaTren destino="Lleida" hora="19:10" />` **no ejecuta** `TarjetaTren`. Solo guarda en un objeto que hay que ejecutarla, y con qué props. Quien la llama es React, más tarde, cuando renderiza ese elemento.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Averia() {\n  throw new Error('El panel de salidas está averiado')\n}\n\nconst panel = <Averia />\n\nexport default function App() {\n  return <p>Todo en orden</p>\n}",
  "opciones": [
    "El error «El panel de salidas está averiado»",
    "El párrafo «Todo en orden»",
    "Nada: la página se queda en blanco"
  ],
  "correcta": 1,
  "explicacion": "Crear el elemento panel no ejecuta Averia: solo guarda un objeto con type: Averia. Como App no lo devuelve, React nunca llega a llamar a esa función y no hay error. Si cambias el return por <main>{panel}<p>Todo en orden</p></main>, React sí la llama al renderizar, y entonces salta el error."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres cosas distintas que a veces se llaman igual",
  "roles": [
    {
      "etiqueta": "Componente",
      "rol": "Una función que escribes tú",
      "descripcion": "Recibe props y devuelve elementos. Su nombre empieza por mayúscula. React la llama cada vez que necesita saber cómo debe verse esa parte de la interfaz."
    },
    {
      "etiqueta": "Elemento",
      "rol": "El objeto que devuelven jsx() y createElement()",
      "descripcion": "Describe qué pintar: un type (una cadena o una función), unas props y una key. Es inmutable, barato de crear y no pinta nada por sí solo."
    },
    {
      "etiqueta": "Nodo del DOM",
      "rol": "Lo que hay de verdad en la página",
      "descripcion": "Un objeto del navegador, como el que devuelve querySelector. Lo crea y lo actualiza React a partir de los elementos; tú no lo tocas."
    }
  ]
}
```

## La mayúscula decide el `type`

En la lección 3 viste la regla y, en la pestaña «JavaScript generado», lo que pasa por debajo: `<sello />` se traduce a `_jsx('sello', …)` y `<Sello />`, a `_jsx(Sello, …)`. Ahora ya sabes qué es ese primer argumento: **el `type` del elemento**.

- Con minúscula, el compilador escribe el nombre entre comillas: una **cadena**. React crea una etiqueta de HTML con ese nombre, exista o no, y tu función ni se usa.
- Con mayúscula, lo escribe sin comillas: una **referencia a una variable**. Lo que valga esa variable será el `type`.

Si el nombre mezcla mayúsculas y minúsculas, como `tarjetaTren`, al aviso que viste en la lección 3 se suma otro:

```text
<tarjetaTren /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.
```

Lo de «lo que valga esa variable» tiene una consecuencia útil: la variable no tiene por qué guardar una función. Si guarda una cadena, el `type` será esa cadena, y así puedes elegir la etiqueta mientras se ejecuta el código:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un type que sale de una variable",
  "consigna": "Abre «JavaScript generado»: <Etiqueta> se traduce a _jsx(Etiqueta, …), sin comillas, porque empieza por mayúscula. Pero Etiqueta guarda una cadena, así que React pinta un h1 y un h2 de verdad. Cambia nivel={2} por nivel={3} y comprueba que el segundo título se hace más pequeño.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "function Encabezado({ nivel, texto }) {\n  const Etiqueta = `h${nivel}`\n  return <Etiqueta>{texto}</Etiqueta>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Encabezado nivel={1} texto=\"Estación del Norte\" />\n      <Encabezado nivel={2} texto=\"Próximas salidas\" />\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true
}
```

En «JavaScript generado» aparece `_jsx(Etiqueta, { children: texto })`, igual que con un componente: la diferencia está en lo que vale `Etiqueta` cuando se ejecuta. Es un recurso habitual en componentes de título que pintan el nivel de encabezado que les pidan.

## Por qué un componente devuelve un solo elemento

En la lección 5 viste la regla y su porqué: `return` solo devuelve un valor. Con la traducción delante se ve tal cual. Dos elementos sueltos serían esto:

```js
return (
  _jsx('h2', { children: "Madrid → Valencia" })
  _jsx('p', { children: "Salida: 09:30" })
)
```

Dos valores seguidos, sin nada entre ellos: JavaScript no lo acepta, y el compilador se para antes de ejecutar nada. El editor de esta web te lo dice con «Unexpected token, expected ","», y ese mensaje esconde una trampa. ¿Qué pasa si le haces caso y pones la coma?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  return (\n    <h2>Madrid → Valencia</h2>,\n    <p>Salida: 09:30</p>\n  )\n}",
  "opciones": [
    "Se ven el título y la hora de salida",
    "Solo se ve «Salida: 09:30»",
    "Sigue el error de sintaxis"
  ],
  "correcta": 1,
  "explicacion": "Con la coma, el código compila: es el operador coma de JavaScript, que evalúa los dos valores y se queda solo con el último. El componente devuelve únicamente el p, y el h2 desaparece sin ningún aviso."
}
```

La salida buena es la de la lección 5: un elemento padre o un fragmento. Un fragmento se traduce a `_jsxs(_Fragment, { children: [...] })`: **un solo valor** con los dos elementos dentro. También podrías devolver un array, `[<h2 key="ruta">…</h2>, <p key="hora">…</p>]`: es un único valor y funciona, pero cada elemento necesita su `key` (sin ella, React avisa en la consola) y casi nunca compensa.

## React sin JSX: `createElement`

Todo lo que escribes con JSX se puede escribir llamando tú a `createElement`, que se importa del paquete `react`:

```js
createElement(type, props, ...children)
```

- `type`: el nombre de una etiqueta como cadena (`'li'`) o un componente (`FilaHorario`).
- `props`: un objeto, o `null` si no hay ninguna.
- `...children`: cero o más hijos, como argumentos sueltos.

Es la misma forma que el runtime clásico, y no está obsoleta: es la API que el equipo de React recomienda para crear elementos a mano. `jsx` y `jsxs`, en cambio, son solo para el compilador: no las importes tú. Este horario está escrito sin una sola etiqueta, y funciona:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un horario escrito sin JSX",
  "codigo": "import { createElement } from 'react'\n\nconst salidas = [\n  { id: 'r1', hora: '18:05', destino: 'Zaragoza' },\n  { id: 'r2', hora: '18:20', destino: 'Toledo' },\n  { id: 'r3', hora: '18:45', destino: 'Segovia' },\n]\n\nfunction FilaHorario({ hora, destino }) {\n  return createElement(\n    'li',\n    { className: 'fila' },\n    createElement('strong', null, hora),\n    ' · ',\n    destino,\n  )\n}\n\nexport default function App() {\n  return createElement(\n    'main',\n    null,\n    createElement('h1', null, 'Próximas salidas'),\n    createElement(\n      'ul',\n      null,\n      salidas.map((salida) =>\n        createElement(FilaHorario, { key: salida.id, hora: salida.hora, destino: salida.destino }),\n      ),\n    ),\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nul {\n  padding: 0;\n  list-style: none;\n}\n\n.fila {\n  padding: 0.4rem 0;\n  border-bottom: 1px solid #cbd5e1;\n}",
  "anotaciones": [
    {
      "fragmento": "import { createElement } from 'react'",
      "nota": "createElement es una función pública del paquete react, como useState. A diferencia de jsx, está pensada para que la uses tú."
    },
    {
      "fragmento": "{ className: 'fila' },",
      "nota": "Las props van en un objeto, con los mismos nombres que en JSX."
    },
    {
      "fragmento": "createElement('strong', null, hora),",
      "nota": "Sin props, null. Los hijos van detrás, como argumentos sueltos: aquí un strong, un texto y el destino. Son estáticos: siempre son esos tres."
    },
    {
      "fragmento": "createElement(FilaHorario, {",
      "nota": "Para un componente tuyo, el type es la función, sin comillas: lo mismo que hace el compilador con <FilaHorario />."
    },
    {
      "fragmento": "key: salida.id",
      "nota": "La key va dentro de las props, como en el runtime clásico. React la saca de ahí y la guarda aparte: FilaHorario no la recibe."
    },
    {
      "fragmento": "salidas.map((salida) =>",
      "nota": "Los hijos que salen de un map se pasan como un único array, no como argumentos sueltos. Así React sabe que es una lista que puede cambiar y te avisa si falta la key."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Y este es el mismo `App` con JSX:

```jsx
export default function App() {
  return (
    <main>
      <h1>Próximas salidas</h1>
      <ul>
        {salidas.map((salida) => (
          <FilaHorario key={salida.id} hora={salida.hora} destino={salida.destino} />
        ))}
      </ul>
    </main>
  )
}
```

Las dos versiones hacen lo mismo. La ventaja de JSX es la que señala la propia documentación de React: se ve de un vistazo qué etiqueta de cierre corresponde a cada apertura. Con `createElement`, en cuanto anidas tres niveles, te pierdes entre paréntesis. Por eso casi todo el código de React está escrito con JSX.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Para orientarte en código compilado",
      "texto": "En el JavaScript que genera npm run build, tus etiquetas aparecen como llamadas a jsx y jsxs, minificadas y con nombres de una letra, del estilo de (0,f.jsxs)(...). Saber que cada una es una etiqueta tuya te deja orientarte en ese código."
    },
    {
      "titulo": "Para entender código antiguo",
      "texto": "Proyectos y tutoriales de antes de 2020 importan React en cada archivo, y algunas librerías llaman a React.createElement directamente. Ahora sabes por qué."
    },
    {
      "titulo": "Cuando no hay compilador",
      "texto": "createElement es JavaScript normal: funciona sin traducir nada. Sirve para una prueba rápida o una página donde no quieres montar un proyecto con Vite."
    },
    {
      "titulo": "Para elegir el type mientras se ejecuta el código",
      "texto": "createElement(nivel === 1 ? \"h1\" : \"h2\", null, texto) elige la etiqueta con una expresión. En JSX lo consigues con una variable con mayúscula, como el Encabezado de antes."
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
      "mito": "JSX es HTML dentro de JavaScript",
      "realidad": "Es una sintaxis que se traduce a llamadas a funciones. Al navegador no le llega HTML, sino objetos, y es React quien crea los nodos del DOM. Por eso JSX tiene reglas propias, como className o cerrar todas las etiquetas."
    },
    {
      "mito": "Imprimir un elemento en la consola enseña su HTML",
      "realidad": "Enseña un objeto: la descripción, con type, props y key. El HTML todavía no existe: aparece cuando React renderiza ese elemento y crea los nodos del DOM."
    },
    {
      "mito": "Escribir <TarjetaTren /> ejecuta la función TarjetaTren",
      "realidad": "Solo crea un objeto con type: TarjetaTren. React la ejecuta después, cuando renderiza ese elemento, y puede hacerlo muchas veces a lo largo de la vida de la página."
    },
    {
      "mito": "Crear muchos elementos es lento y conviene evitarlo",
      "realidad": "Un elemento es un objeto pequeño: crearlo es baratísimo. Lo que cuesta es tocar el DOM, y React limita esos cambios a lo que de verdad ha cambiado."
    },
    {
      "mito": "createElement está obsoleto: lo moderno es importar jsx()",
      "realidad": "Al revés. createElement sigue siendo la forma oficial de crear elementos a mano, y jsx y jsxs son solo para el compilador: el equipo de React pide no importarlas tú. Lo que quedó atrás es el runtime clásico, que traducía el JSX a createElement."
    }
  ]
}
```

## Errores típicos

**Intentar cambiar un elemento ya creado.** Parece lo natural: tienes el objeto, cambias una propiedad.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const aviso = <p>El regional de las 18:05 sale con retraso</p>\n\naviso.props.children = 'Cancelado'\n\nexport default function App() {\n  return aviso\n}",
  "opciones": [
    "El párrafo dice «Cancelado»",
    "El párrafo dice «El regional de las 18:05 sale con retraso»",
    "Un error: Cannot assign to read only property 'children' of object '#<Object>'"
  ],
  "correcta": 2,
  "explicacion": "En desarrollo, React congela cada elemento y sus props con Object.freeze, y como los módulos se ejecutan en modo estricto, asignar una propiedad congelada lanza un TypeError: la app ni siquiera llega a mostrarse. En producción React no congela nada, para ir más rápido, pero la regla es la misma: un elemento no se modifica; si quieres otro contenido, crea otro elemento."
}
```

**Llamar al componente como una función.** `{TarjetaTren({ destino: 'Huesca', hora: '20:00' })}` pinta lo mismo que `<TarjetaTren destino="Huesca" hora="20:00" />`, pero no es lo mismo. Estás ejecutando tú la función en mitad del render de tu componente, y React solo recibe lo que devuelve: un elemento con `type: 'article'`. Para React, ahí no hay ningún componente. Mientras no tenga estado ni se nota. Cuando lo tenga (lección 16), ese estado pasa a pertenecer al componente que hace la llamada, y en cuanto la llamada dependa de una condición, React se rompe con «Rendered more hooks than during the previous render» (la lección 44 explica por qué). Escribe siempre la etiqueta.

**Repartir con `...` los hijos que vienen de un array.** `createElement('ul', null, ...filas)` funciona, pero React cree que esos hijos los has escrito a mano uno a uno y deja de avisarte si les falta la `key`. Pasa el array entero como un solo argumento: `createElement('ul', null, filas)`.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un panel de salidas sin JSX",
  "consigna": "Completa Salida para que pinte, con createElement, lo que describe el comentario, y añade en App la salida a Segovia. No escribas ni una etiqueta: todo con createElement. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { createElement } from 'react'\nimport './estilos.css'\n\n// Escribe con createElement, sin JSX, lo que pintaría este JSX:\n//\n// <article className=\"salida\">\n//   <h2>{destino}</h2>\n//   <p>Sale a las {hora} por la vía {via}</p>\n// </article>\nfunction Salida({ destino, hora, via }) {\n  return null // sustituye este null por tu createElement\n}\n\nexport default function App() {\n  return createElement(\n    'main',\n    null,\n    createElement('h1', null, 'Próximas salidas'),\n    createElement(Salida, { destino: 'Toledo', hora: '18:20', via: 7 }),\n    // Añade aquí, también con createElement, la salida a Segovia: 18:45, vía 3\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".salida {\n  max-width: 22rem;\n  padding: 0.75rem 1rem;\n  border-left: 4px solid #0e7490;\n  border-radius: 6px;\n  background: #ecfeff;\n  font-family: system-ui, sans-serif;\n}\n\n.salida h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.15rem;\n}\n\n.salida p {\n  margin: 0;\n}\n\nmain {\n  display: grid;\n  gap: 0.75rem;\n  font-family: system-ui, sans-serif;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La salida a Toledo tiene su destino como encabezado",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Toledo"
      }
    },
    {
      "descripcion": "La salida a Toledo dice «Sale a las 18:20 por la vía 7»",
      "pasos": [],
      "espera": {
        "texto": "Sale a las 18:20 por la vía 7"
      }
    },
    {
      "descripcion": "Aparece la salida a Segovia, con su encabezado",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Segovia"
      }
    },
    {
      "descripcion": "La salida a Segovia dice «Sale a las 18:45 por la vía 3»",
      "pasos": [],
      "espera": {
        "texto": "Sale a las 18:45 por la vía 3"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el primer bloque en vivo, crea un componente `Hora` que pinte `18:05` dentro de un `<time>` y úsalo en el `p` en lugar del texto. Busca en «JavaScript generado» cómo aparece `Hora`: ¿con comillas o sin ellas? ¿Por qué?
2. Copia el horario escrito sin JSX en ese mismo bloque y pásalo a JSX. Después mira en «JavaScript generado» dónde acaba la `key`: ¿dentro de las props, como en `createElement`, o aparte?
3. Imprime en la consola el mismo párrafo creado con JSX y con `createElement`, y compara los dos objetos. ¿Hay alguna diferencia?
4. En tu proyecto de Vite, ejecuta `npm run build`, abre `dist/assets/index-….js` y busca el texto de uno de tus componentes. Identifica las llamadas a `jsx` y `jsxs` que lo rodean.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "createElement",
      "descripcion": "La referencia oficial: sus parámetros, el objeto que devuelve y sus advertencias, como la de congelar los elementos en desarrollo.",
      "url": "https://react.dev/reference/react/createElement",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Writing Markup with JSX",
      "descripcion": "El capítulo sobre JSX, con la explicación de por qué varias etiquetas necesitan un elemento que las envuelva.",
      "url": "https://react.dev/learn/writing-markup-with-jsx",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Introducing the New JSX Transform",
      "descripcion": "El anuncio de 2020 del runtime automático, con la traducción antigua y la nueva lado a lado.",
      "url": "https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html",
      "etiqueta": "legacy.reactjs.org"
    },
    {
      "titulo": "isValidElement",
      "descripcion": "La función que comprueba si un valor es un elemento de React.",
      "url": "https://react.dev/reference/react/isValidElement",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Why Do React Elements Have a $$typeof Property?",
      "descripcion": "Dan Abramov, del equipo de React, explica el problema de seguridad que resuelve el símbolo. Es de 2018: hoy el símbolo se llama react.transitional.element.",
      "url": "https://overreacted.io/why-do-react-elements-have-typeof-property/",
      "etiqueta": "overreacted.io"
    },
    {
      "titulo": "Sucrase",
      "descripcion": "El compilador que traduce el JSX en los bloques en vivo de esta web.",
      "url": "https://github.com/alangpierce/sucrase",
      "etiqueta": "GitHub"
    }
  ]
}
```
