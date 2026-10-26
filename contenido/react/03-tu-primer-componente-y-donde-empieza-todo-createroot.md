# Tu primer componente, y dónde empieza todo: `createRoot`

- **Módulo:** Qué es React y primeros pasos
- **Slug:** `tu-primer-componente-y-donde-empieza-todo-createroot` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [Your First Component](https://react.dev/learn/your-first-component) + [createRoot](https://react.dev/reference/react-dom/client/createRoot) — ver `contenido/react/TEMARIO.md` #3

---

## Qué es y para qué sirve

En la lección 1 usaste `App` y `Contador` sin pararte a pensar qué los convertía en componentes. Aquí lo ves con calma, y también la otra mitad de la historia: cómo llega todo eso a la página.

HTML te da un repertorio fijo de etiquetas: `<h1>`, `<ul>`, `<button>`... **React te deja inventar las tuyas.** Un componente es una pieza de interfaz con nombre propio, como `<Horario />` o `<TarjetaFidelizacion />`, que por dentro usa las etiquetas de siempre y que puedes colocar tantas veces como quieras. La definición cabe en una frase:

> **Un componente es una función de JavaScript que devuelve marcado.**

Así se lee la página de una cafetería hecha con React:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "export default function PaginaCafeteria() {\n  return (\n    <main>\n      <Cabecera />\n      <Horario />\n      <TarjetaFidelizacion />\n      <Pie />\n    </main>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export default function PaginaCafeteria()",
      "nota": "Un componente es una función normal de JavaScript. Esta describe la página entera juntando otras piezas."
    },
    {
      "fragmento": "<main>",
      "nota": "En minúscula: una etiqueta HTML de toda la vida. React crea ese elemento tal cual en el DOM."
    },
    {
      "fragmento": "<Horario />",
      "nota": "Con mayúscula: un componente tuyo. Es la función Horario, definida en otro sitio, que devuelve su propio marcado. Puede ser tan pequeño como un párrafo o tan grande como una página."
    },
    {
      "fragmento": "<TarjetaFidelizacion />",
      "nota": "Cada pieza se encarga de lo suyo. Si la tarjeta cambia de diseño, se toca un solo sitio; si otra página la necesita, basta con escribir allí <TarjetaFidelizacion />."
    }
  ]
}
```

Este código no se puede ejecutar todavía: faltan las funciones `Cabecera`, `Horario` y compañía. En esta lección escribirás varias de ellas.

## Definir un componente

Un componente se escribe en tres pasos. Este es completo y funciona: la vista previa de debajo lo ejecuta con React 19.3.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un componente en tres pasos",
  "codigo": "export default function TarjetaFidelizacion() {\n  return (\n    <section>\n      <h1>Cafetería La Molienda</h1>\n      <p>Por cada café, un sello. Con seis sellos, el siguiente es gratis.</p>\n    </section>\n  )\n}",
  "css": "section {\n  font-family: system-ui, sans-serif;\n  padding: 1rem;\n  border: 2px solid #6f4e37;\n  border-radius: 12px;\n}",
  "anotaciones": [
    {
      "fragmento": "export default",
      "nota": "Paso 1, exportar. Es sintaxis estándar de JavaScript, no de React: marca la función principal del archivo para poder importarla desde otro. En la lección 4 verás todas las formas de exportar."
    },
    {
      "fragmento": "function TarjetaFidelizacion()",
      "nota": "Paso 2, definir la función. Una función normal cuyo nombre empieza por mayúscula: así sabe React que es un componente y no una etiqueta HTML. Enseguida verás qué pasa si no."
    },
    {
      "fragmento": "return (",
      "nota": "Paso 3, devolver el marcado. Como empieza en la línea siguiente, va entre paréntesis, y el paréntesis se abre en la misma línea que el return. Más abajo verás por qué es obligatorio."
    },
    {
      "fragmento": "<h1>Cafetería La Molienda</h1>",
      "nota": "Esto es JSX: parece HTML, pero es JavaScript, y por eso puede ir detrás de un return. Tiene reglas propias, como cerrar todas las etiquetas, que llegan en la lección 5."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

También verás componentes escritos como funciones flecha, `const TarjetaFidelizacion = () => { ... }`. Para React son iguales; este temario usa `function`, como la documentación oficial.

## Usar un componente dentro de otro

Una vez definido, un componente se usa como una etiqueta: `<Sello />`. Un componente puede pintar otros, y cada `<Sello />` es una llamada independiente a la misma función. Al que los pinta se le llama **componente padre**, y a los pintados, **hijos**.

En la tarjeta de abajo, `App` usa dos componentes pequeños: `Sello` y `HuecoLibre`. Están en el mismo archivo, algo normal cuando son pequeños o van siempre juntos. (En JSX, el atributo `class` se escribe `className`; lo verás en la lección 5.)

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una tarjeta de sellos hecha con dos componentes",
  "consigna": "Pon un sello más: cambia un <HuecoLibre /> por un <Sello />. Después cambia el texto que devuelve Sello y fíjate en que cambia en todas sus copias a la vez.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Sello() {\n  return <li className=\"sello\">Sellado</li>\n}\n\nfunction HuecoLibre() {\n  return <li>Libre</li>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Cafetería La Molienda</h1>\n      <p>Con seis sellos, el siguiente café es gratis.</p>\n      <ul>\n        <Sello />\n        <Sello />\n        <Sello />\n        <HuecoLibre />\n        <HuecoLibre />\n        <HuecoLibre />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nul {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #b9a48a;\n  border-radius: 999px;\n}\n\n.sello {\n  border-style: solid;\n  background: #6f4e37;\n  color: white;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

**Define una vez, usa tantas veces como quieras**: si mañana el sello pasa a decir «Café», cambias una línea y cambian todos.

¿Y qué ve el navegador de todo esto?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Sello() {\n  return <li>Café sellado</li>\n}\n\nexport default function App() {\n  return (\n    <ul>\n      <Sello />\n      <Sello />\n    </ul>\n  )\n}\n\n// ¿Qué HTML queda dentro de #root?",
  "opciones": [
    "<ul><Sello></Sello><Sello></Sello></ul>",
    "<ul><li>Café sellado</li><li>Café sellado</li></ul>",
    "<ul><sello><li>Café sellado</li></sello><sello><li>Café sellado</li></sello></ul>"
  ],
  "correcta": 1,
  "explicacion": "Los componentes no llegan al DOM. React llama a Sello cada vez que encuentra <Sello /> y pone en su sitio lo que devuelve, así que el navegador solo ve etiquetas HTML. Por eso en el inspector no encontrarás ningún Sello: para ver los componentes hacen falta las React Developer Tools, que usarás en el módulo 9."
}
```

## Por qué el nombre empieza por mayúscula

JSX mira la primera letra de cada etiqueta para decidir qué es:

- **En minúscula** (`<li>`, `<section>`), es una etiqueta del navegador: React crea ese elemento HTML.
- **Con mayúscula** (`<Sello />`), es una variable de tu código: React llama a esa función y pinta lo que devuelve.

Así que `<sello />` no tiene nada que ver con tu función `sello`: para React es una etiqueta HTML llamada «sello», que no existe. Compruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un componente con el nombre en minúscula",
  "consigna": "La lista sale vacía. Mira la consola, y después la pestaña JavaScript generado: cada <sello /> se ha convertido en _jsx('sello', …), con el nombre entre comillas, un simple texto. Arréglalo renombrando la función y sus tres usos a Sello, y vuelve a mirar esa pestaña: ahora pone _jsx(Sello, …), sin comillas, una referencia a tu función.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction sello() {\n  return <li className=\"sello\">Sellado</li>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Cafetería La Molienda</h1>\n      <ul>\n        <sello />\n        <sello />\n        <sello />\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nul {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #b9a48a;\n  border-radius: 999px;\n}\n\n.sello {\n  border-style: solid;\n  background: #6f4e37;\n  color: white;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": true
}
```

La app no se rompe: React crea tres elementos `<sello></sello>` vacíos, porque tu función ni siquiera llega a ejecutarse, y escribe un único mensaje en la consola. Sale marcado como error, pero no detiene nada:

```text
The tag <sello> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.
```

Es decir: «El navegador no reconoce la etiqueta `<sello>`. Si querías pintar un componente de React, empieza su nombre por mayúscula». Si trabajas con la plantilla de Vite, `npm run lint` te da otra pista: avisa de que la función `sello` está declarada pero nunca se usa (*«Function 'sello' is declared but never used»*). Y es verdad: `<sello />` no la usa. En la lección 7 verás qué es exactamente ese `_jsx`.

## El `return`: en una línea o entre paréntesis

Si el marcado cabe en la misma línea que el `return`, no hace falta nada más. Si ocupa varias líneas, va entre paréntesis, y **el paréntesis se abre en la misma línea que el `return`**:

```jsx
function Sello() {
  return <li>Café sellado</li>
}

function Cabecera() {
  return (
    <header>
      <h1>Cafetería La Molienda</h1>
    </header>
  )
}
```

Parece una manía de estilo, pero no lo es. ¿Qué pinta esto?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Cabecera() {\n  return\n    <h1>Cafetería La Molienda</h1>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <p>Tarjeta de fidelización</p>\n    </main>\n  )\n}",
  "opciones": [
    "El título y el párrafo",
    "Solo el párrafo, sin ningún error ni aviso",
    "Un error que dice que Cabecera no devuelve nada",
    "Nada: la página se queda en blanco"
  ],
  "correcta": 1,
  "explicacion": "JavaScript da por terminado un return que acaba en un salto de línea: Cabecera devuelve undefined y la línea del h1 nunca se ejecuta. Para React, que un componente no devuelva nada es válido: no pinta nada y no avisa. Por eso cuesta tanto de ver. El linter de la plantilla de Vite sí lo detecta: marca el h1 como Unreachable code, código que nunca se ejecuta."
}
```

Es la **inserción automática de punto y coma** de JavaScript: tras un `return` seguido de salto de línea, JavaScript pone un `;` por su cuenta. Con `return (` en la misma línea, el paréntesis abierto le obliga a seguir leyendo.

La trampa contraria es dejar un punto y coma *dentro* de los paréntesis, detrás del JSX: `return ( <h1>…</h1>; )`. Eso ya es un error de sintaxis. El editor de esta web lo marca con *«Unexpected token, expected ","»*, y Vite 8, con *«Expected `,` or `)` but found `;`»*. Si usas punto y coma, va después del paréntesis de cierre: `);`.

## Anidar componentes sí; definir uno dentro de otro, no

**Usar** `<Sello />` dentro de `App` es lo normal. Lo que no se hace nunca es **definir** la función de un componente dentro del cuerpo de otro. Cada vez que `App` se vuelve a ejecutar, crea una función nueva; React ve un componente distinto del de la vez anterior, tira el viejo con todo lo que tenía dentro y monta uno nuevo desde cero.

En este ejemplo, el botón cambia el estado de `App` con `useState` (lo verás en la lección 16) y la obliga a ejecutarse de nuevo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El mismo campo, definido fuera y dentro de App",
  "consigna": "Escribe algo en los dos campos, por ejemplo «sin azúcar», y pulsa «Pedir café». El campo de NotaDentro se vacía; el de NotaFuera, no. Después saca la función NotaDentro fuera de App, al nivel de NotaFuera, y repite la prueba.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nfunction NotaFuera() {\n  return (\n    <label>\n      Nota (definida fuera) <input />\n    </label>\n  )\n}\n\nexport default function App() {\n  const [cafes, setCafes] = useState(0)\n\n  // Mal: un componente definido dentro de otro\n  function NotaDentro() {\n    return (\n      <label>\n        Nota (definida dentro) <input />\n      </label>\n    )\n  }\n\n  return (\n    <main>\n      <p>Cafés pedidos: {cafes}</p>\n      <button onClick={() => setCafes(cafes + 1)}>Pedir café</button>\n      <NotaFuera />\n      <NotaDentro />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  display: grid;\n  gap: 0.75rem;\n  justify-items: start;\n  font-family: system-ui, sans-serif;\n}\n\nbutton,\ninput {\n  font: inherit;\n  padding: 0.35rem 0.6rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Lo que habías escrito desaparece porque React ha tirado el campo antiguo y ha creado otro vacío. Con estado dentro del componente pasaría lo mismo: se perdería en cada render. El porqué exacto está en la lección 26, «Conservar y reiniciar el estado». Por ahora, la regla: **todos los componentes, en el nivel superior del archivo**. Si un hijo necesita datos del padre, se los pasa con props (lección 8).

Es un fallo tan común que el linter lo vigila: Oxlint, el de la plantilla de Vite, avisa con *«Cannot create components during render»*, y en `eslint-plugin-react-hooks`, el plugin oficial de React para ESLint, la misma regla se llama `static-components` (lección 70).

## Dónde empieza todo: `createRoot`

Hasta ahora, en esta web, alguien montaba tu `App` por ti: el propio editor. En tu proyecto de Vite lo hace `src/main.jsx`, que viste por encima en la lección 2. Este es el mismo código con cada paso en su propia línea; la plantilla lo escribe encadenado, `createRoot(...).render(...)`, y es exactamente lo mismo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.jsx'\n\nconst contenedor = document.getElementById('root')\nconst raiz = createRoot(contenedor)\n\nraiz.render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n)",
  "anotaciones": [
    {
      "fragmento": "document.getElementById('root')",
      "nota": "El contenedor: el div vacío de index.html. Tiene que ser un elemento del DOM de verdad. Si el id no coincide, getElementById devuelve null y createRoot falla con «Target container is not a DOM element.»"
    },
    {
      "fragmento": "const raiz = createRoot(contenedor)",
      "nota": "Crea una raíz de React para ese elemento y devuelve un objeto con dos métodos, render y unmount. Desde aquí, lo que haya dentro del contenedor es cosa de React: no lo toques con innerHTML ni con querySelector."
    },
    {
      "fragmento": "raiz.render(",
      "nota": "Pinta tu interfaz dentro del contenedor. La primera vez, borra todo lo que hubiera dentro y pone en su lugar lo que devuelve App. No ocurre en el acto: React lo deja programado y lo hace un instante después."
    },
    {
      "fragmento": "<App />",
      "nota": "El componente raíz, del que cuelga todo lo demás. Se pasa como JSX, <App />, no como App a secas."
    }
  ]
}
```

`createRoot` solo prepara la raíz; el contenedor no cambia hasta el primer `render`. Puedes aprovecharlo: lo que pongas dentro de `#root` en `index.html` se ve mientras se descarga el JavaScript, que en un móvil con mala conexión puede tardar, y desaparece en cuanto React pinta.

```html
<div id="root">
  <p>Cargando la tarjeta…</p>
</div>
```

Con ese `index.html`, ¿qué escribe este `console.log`?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { createRoot } from 'react-dom/client'\nimport App from './App.jsx' // App devuelve <h1>Cafetería La Molienda</h1>\n\nconst contenedor = document.getElementById('root')\nconst raiz = createRoot(contenedor)\nraiz.render(<App />)\nconsole.log(contenedor.innerHTML)",
  "opciones": [
    "<p>Cargando la tarjeta…</p>",
    "<h1>Cafetería La Molienda</h1>",
    "Una cadena vacía"
  ],
  "correcta": 0,
  "explicacion": "render no pinta en el acto: deja el trabajo programado y React lo hace un instante después, cuando termina el código que se está ejecutando. En ese console.log el contenedor conserva aún el texto de carga; un momento más tarde ya contiene el h1 de App. Casi nunca importa, pero explica por qué no puedes leer el DOM justo después de llamar a render."
}
```

## Una raíz por aplicación, y casi nunca `unmount`

Una app hecha entera con React tiene **un solo `createRoot` y un solo `render`**, al arrancar. A partir de ahí React gestiona todo lo que hay dentro del contenedor: para añadir cosas, anidas componentes en `App`; para cambiarlas, usas estado (lección 16). No hacen falta más raíces ni más llamadas a `render`. Cuándo tiene sentido tener varias raíces, una por cada hueco de una página que ya existía, lo viste en la lección 2.

Hay dos funciones que verás más adelante y que no son más raíces: `createPortal`, para pintar un modal o un tooltip fuera del contenedor sin dejar de ser parte de tu árbol (lección 36), y `hydrateRoot`, que sustituye a `createRoot` cuando el HTML ya viene generado desde el servidor (lección 87).

La raíz tiene un segundo método, `unmount`, pensado sobre todo para React metido en una página que no es de React:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createRoot } from 'react-dom/client'\nimport ChatAtencion from './ChatAtencion.jsx'\n\nlet raiz = null\n\nexport function abrirChat(contenedor) {\n  raiz = createRoot(contenedor)\n  raiz.render(<ChatAtencion />)\n}\n\nexport function cerrarChat() {\n  raiz.unmount()\n  raiz = null\n}",
  "anotaciones": [
    {
      "fragmento": "export function abrirChat(contenedor)",
      "nota": "El resto de la página no es React: algún script suyo llamará a abrirChat y a cerrarChat cuando el usuario pulse sus botones. Es el caso típico de unmount; en una app hecha entera con React casi nunca lo escribirás."
    },
    {
      "fragmento": "raiz.unmount()",
      "nota": "Destruye todo lo que React pintó en esa raíz: desmonta los componentes, quita sus manejadores de eventos, descarta su estado y deja el contenedor vacío. Llámalo antes de que el otro código quite el contenedor de la página; si no, los componentes no se enteran y no pueden limpiar lo que tuvieran en marcha."
    },
    {
      "fragmento": "raiz = null",
      "nota": "Una raíz desmontada no se reutiliza: llamar otra vez a su render lanza el error «Cannot update an unmounted root.». Para volver a abrir el chat, abrirChat crea una raíz nueva sobre el mismo contenedor, y eso sí está permitido."
    }
  ]
}
```

## Qué hace React con un error que nadie captura

Si un componente lanza un error al pintarse y nadie lo captura, **React quita la app entera del contenedor**: la página se queda en blanco. Por ejemplo, si un componente `Sellos` falla al leer los datos de la tarjeta, en la consola aparece su error seguido de este aviso de React:

```text
An error occurred in the <Sellos> component. Consider adding an error boundary to your tree to customize error handling behavior.
```

Es decir: «Ha ocurrido un error en el componente `<Sellos>`. Plantéate añadir un *error boundary* a tu árbol para decidir cómo se gestionan los errores». Los *error boundaries* llegan en la lección 53. Lo que sí puedes hacer ya es decidir qué pasa con esos errores, porque `createRoot` acepta un segundo argumento con tres opciones:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "const raiz = createRoot(document.getElementById('root'), {\n  onUncaughtError: (error, errorInfo) => {\n    registrarError(error, errorInfo.componentStack)\n  },\n  onCaughtError: (error, errorInfo) => {\n    // errores que ha capturado un error boundary\n  },\n  onRecoverableError: (error, errorInfo) => {\n    // errores de los que React se ha recuperado solo\n  },\n})\n\nraiz.render(<App />)",
  "anotaciones": [
    {
      "fragmento": "onUncaughtError",
      "nota": "Se llama cuando nadie captura un error. Recibe el error y un objeto cuyo componentStack lista los componentes donde ocurrió. Si pasas esta opción, React deja de escribir esos errores en la consola: decides tú, por ejemplo enviarlos a un servicio de registro de errores."
    },
    {
      "fragmento": "onCaughtError",
      "nota": "Para los errores que sí ha capturado un error boundary, un componente que enseña un aviso en lugar de la parte que ha fallado. Lección 53."
    },
    {
      "fragmento": "onRecoverableError",
      "nota": "Para los errores de los que React se recupera solo, sin que la interfaz llegue a romperse."
    },
    {
      "fragmento": "raiz.render(<App />)",
      "nota": "Las opciones van en createRoot, nunca en render, que solo acepta un argumento. Si le pasas un segundo, React no lo usa y avisa: «You passed a second argument to root.render(...) but it only accepts one argument.»"
    }
  ]
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Esta web usa onUncaughtError",
  "contenido": "La vista previa de los bloques en vivo monta tu App con createRoot y le pasa onUncaughtError. Por eso, cuando tu código falla, debajo de la vista previa aparece un recuadro con «Error al renderizar» y el mensaje real de React, en vez de una página en blanco sin explicación."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cuando un trozo se repite",
      "texto": "Sellos, filas de una tabla, tarjetas de producto: una definición y muchas copias. Si cambia el diseño, se cambia en un solo sitio."
    },
    {
      "titulo": "Cuando un trozo tiene una responsabilidad clara",
      "texto": "La cabecera, el horario o el pie aparecen una sola vez, pero darles nombre hace que App se lea como un índice. Las apps de React son componentes de arriba abajo: botones, barras laterales y páginas enteras."
    },
    {
      "titulo": "Cuando un componente crece demasiado",
      "texto": "Si ya no te cabe en la pantalla o mezcla cosas que no tienen relación, divídelo en piezas más pequeñas. En la lección 31 verás un método para decidir dónde cortar."
    },
    {
      "titulo": "createRoot, una vez y casi sin tocarlo",
      "texto": "En tu proyecto lo escribe la plantilla de Vite, y con un framework normalmente ni lo verás, porque lo hace el framework por ti. Lo tocarás para añadir las opciones de errores o para montar React en una página que ya existe."
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
      "mito": "Los componentes aparecen en el HTML de la página",
      "realidad": "En el DOM solo hay etiquetas HTML. React llama a tus funciones y coloca lo que devuelven; para ver el árbol de componentes necesitas las React Developer Tools."
    },
    {
      "mito": "Un componente con el nombre en minúscula rompe la app",
      "realidad": "La app sigue funcionando: React crea una etiqueta HTML desconocida, la deja vacía y solo deja un mensaje en la consola. Por eso se te puede pasar fácilmente."
    },
    {
      "mito": "createRoot vacía el contenedor en cuanto lo llamas",
      "realidad": "createRoot solo prepara la raíz. Lo que hubiera dentro sigue ahí hasta el primer render, que lo sustituye por tu interfaz."
    },
    {
      "mito": "Hay que llamar a render cada vez que cambian los datos",
      "realidad": "render se llama una vez, al arrancar. Después, cada componente se actualiza cuando cambia su estado (lección 16). Llamar otra vez a render sobre la misma raíz funciona y conserva el estado, pero en una app hecha con React no hace falta."
    },
    {
      "mito": "Cada componente necesita su propio archivo",
      "realidad": "Un archivo puede tener varios componentes, como la tarjeta de sellos de esta lección. Repartirlos en archivos es una decisión de organización: la lección 4 trata de eso."
    }
  ]
}
```

## Errores típicos

**Nombre en minúscula** y **`return` seguido de salto de línea**: los dos fallan en silencio y los has visto arriba. Si un componente «no sale», son lo primero que hay que mirar.

**Usar el componente con otro nombre.** JavaScript distingue mayúsculas: `horario` y `Horario` son variables distintas. Si defines `function horario()` y escribes `<Horario />`, React busca una variable `Horario` que no existe. Aquí sí hay error, y la app entera deja de verse:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La función se llama horario; la etiqueta, Horario",
  "consigna": "Lee el error que aparece debajo de la vista previa. Prueba primero el arreglo malo, cambiar la etiqueta a <horario />, y mira la vista previa y la consola. Después haz el bueno: renombrar la función a Horario.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "function horario() {\n  return (\n    <ul>\n      <li>Lunes a viernes: de 7:30 a 20:00</li>\n      <li>Sábados: de 9:00 a 14:00</li>\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Cafetería La Molienda</h1>\n      <Horario />\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El mensaje es `Horario is not defined`: «Horario no está definido». El arreglo malo cambia un fallo ruidoso por uno silencioso: con `<horario />` desaparece el error, pero el horario no se ve y solo queda el aviso de la etiqueta desconocida en la consola.

**Pasar `App` en vez de `<App />` a `render`.** `raiz.render(App)` no pinta nada y la consola dice:

```text
Functions are not valid as a React child. This may happen if you return App instead of <App /> from render. Or maybe you meant to call this function rather than return it.
```

Es decir: «Las funciones no son hijos válidos de React. Puede que hayas devuelto `App` en vez de `<App />`». `render` espera lo que describe la interfaz (`<App />`), no la función que la fabrica (`App`).

**Un `id` que no coincide.** Si en `index.html` pone `id="root"` y en `main.jsx` buscas `'raiz'`, `getElementById` devuelve `null` y la página se queda en blanco con `Target container is not a DOM element.` («El contenedor no es un elemento del DOM»). Con Vite el `<script>` es de tipo `module` y espera a que el HTML esté leído, así que el sitio donde lo pongas no importa: casi siempre es el `id`.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Arregla la tarjeta de la cafetería",
  "consigna": "La vista previa sale en blanco. Hay dos fallos de los que has visto en esta lección, cada uno en un componente, y además falta usar el componente Premio. Arréglalo sin borrar ningún componente y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nfunction Cabecera() {\n  return\n    <h1>Cafetería La Molienda</h1>\n}\n\nfunction sello() {\n  return <li className=\"sello\">Café sellado</li>\n}\n\nfunction Premio() {\n  return <p>Con seis sellos, el siguiente café es gratis.</p>\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <ul>\n        <sello />\n        <sello />\n        <sello />\n      </ul>\n      {/* Usa aquí el componente Premio */}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nul {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 2px dashed #b9a48a;\n  border-radius: 999px;\n}\n\n.sello {\n  border-style: solid;\n  background: #6f4e37;\n  color: white;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Se ve el título «Cafetería La Molienda»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Cafetería La Molienda"
      }
    },
    {
      "descripcion": "La lista muestra los sellos con el texto «Café sellado»",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Café sellado"
      }
    },
    {
      "descripcion": "Debajo de la lista se ve el aviso del café gratis",
      "pasos": [],
      "espera": {
        "texto": "Con seis sellos, el siguiente café es gratis."
      }
    }
  ]
}
```

Ahora, uno desde cero:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tu propio componente: el horario",
  "consigna": "Escribe un componente Horario, fuera de App, que devuelva un título de nivel 2 «Horario» y una lista con dos elementos: «Lunes a viernes: de 7:30 a 20:00» y «Sábados: de 9:00 a 14:00». Envuelve el título y la lista en un <section>: un componente devuelve un solo elemento, y sin envoltorio el editor da un error de sintaxis desconcertante (la regla llega en la lección 5). Úsalo en App debajo del título principal y pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "export default function App() {\n  return (\n    <main>\n      <h1>Cafetería La Molienda</h1>\n      {/* Usa aquí tu componente Horario */}\n    </main>\n  )\n}\n\n// Define aquí el componente Horario\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Se ve un título «Horario»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Horario"
      }
    },
    {
      "descripcion": "La lista incluye «Lunes a viernes: de 7:30 a 20:00»",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Lunes a viernes: de 7:30 a 20:00"
      }
    },
    {
      "descripcion": "La lista incluye «Sábados: de 9:00 a 14:00»",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Sábados: de 9:00 a 14:00"
      }
    },
    {
      "descripcion": "El título principal «Cafetería La Molienda» sigue en su sitio",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Cafetería La Molienda"
      }
    }
  ]
}
```

Fíjate en que `Horario` puede ir debajo de `App` en el archivo: las funciones declaradas con `function` se pueden usar antes de la línea donde se escriben.

**Retos para seguir practicando** (sin comprobación automática):

1. Usa `<Horario />` dos veces y cambia una hora: cambian las dos copias. ¿Cómo harías para enseñar dos horarios distintos con el mismo componente? Para eso existen las props, en la lección 8.
2. En tu proyecto de Vite, escribe «Cargando…» dentro del `div#root` de `index.html`. En las herramientas de desarrollo del navegador, pestaña Red, limita la velocidad de conexión y recarga: verás el texto un momento antes de que React lo sustituya.
3. En `main.jsx`, pásale a `createRoot` un `onUncaughtError` que haga un `console.log` con tu propio mensaje. Crea un componente que haga `throw new Error('Sin conexión')` y compara la consola con la opción y sin ella.
4. Mete en tu proyecto los tres fallos de esta lección (nombre en minúscula, `return` partido y un componente definido dentro de otro) y ejecuta `npm run lint`. Empareja cada aviso con su fallo.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Your First Component",
      "descripcion": "La página de react.dev en la que se basa la primera mitad de esta lección, con retos para practicar.",
      "url": "https://react.dev/learn/your-first-component",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "createRoot",
      "descripcion": "La referencia completa: parámetros, render, unmount, las opciones de errores y una sección de problemas frecuentes con sus mensajes.",
      "url": "https://react.dev/reference/react-dom/client/createRoot",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "static-components",
      "descripcion": "La regla del linter que detecta componentes definidos dentro de otros, con ejemplos de cómo reescribirlos.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "return",
      "descripcion": "Por qué un salto de línea después de return hace que la función devuelva undefined: la inserción automática de punto y coma.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/return",
      "etiqueta": "MDN"
    }
  ]
}
```
