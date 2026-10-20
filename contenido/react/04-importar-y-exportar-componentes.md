# Importar y exportar componentes

- **Módulo:** Qué es React y primeros pasos
- **Slug:** `importar-y-exportar-componentes` (autogenerado del título)
- **Orden:** 40
- **Fuentes:** [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components) — ver `contenido/react/TEMARIO.md` #4

---

## Qué es y para qué sirve

En la lección 3, todos los componentes vivían en `App.jsx`. Con cuatro es cómodo; con cuarenta, ese archivo no hay quien lo lea, y para usar la cabecera en otra página tendrías que copiarla. La solución es la de cualquier programa grande de JavaScript: **repartir el código en módulos**. Cada componente va a su archivo, se **exporta** desde allí y se **importa** donde se usa.

La sintaxis no es nueva: son los `import` y `export` de los módulos de JavaScript que ya conoces. Esta lección trata de cómo se usan con componentes, qué tipo de export conviene en cada caso y qué te dicen React y Vite cuando un import no casa con su export.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres piezas para repartir componentes",
  "roles": [
    {
      "etiqueta": "Archivo",
      "rol": "Cabecera.jsx",
      "descripcion": "Un archivo por componente, con el mismo nombre que el componente y la extensión .jsx."
    },
    {
      "etiqueta": "Export",
      "rol": "export default function Cabecera()",
      "descripcion": "Hace visible el componente fuera de su archivo. Lo que no se exporta solo se puede usar dentro del archivo."
    },
    {
      "etiqueta": "Import",
      "rol": "import Cabecera from './Cabecera'",
      "descripcion": "Trae el componente al archivo que lo usa. La ruta empieza por ./ y es relativa a ese archivo."
    }
  ]
}
```

## Mover un componente a su propio archivo

Sacar un componente de `App.jsx` son tres pasos:

1. **Crea** un archivo nuevo, por ejemplo `Cabecera.jsx`, y lleva allí la función.
2. **Exporta** la función desde ese archivo.
3. **Impórtala** en el archivo que la usa.

Así queda la web del Club de montaña Peña Alta con la cabecera y la próxima salida en sus propios archivos. Las pestañas de encima del editor son los archivos del proyecto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una página repartida en tres archivos",
  "consigna": "Recorre las pestañas: Cabecera.jsx y ProximaSalida.jsx exportan un componente cada uno, y App.jsx los importa. Cambia el lema de la cabecera en Cabecera.jsx y mira la vista previa. Después borra «export default» en ProximaSalida.jsx y lee el error: lo verás a fondo en «Errores típicos».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Cabecera from './Cabecera'\nimport ProximaSalida from './ProximaSalida'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <ProximaSalida />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Cabecera.jsx",
      "codigo": "export default function Cabecera() {\n  return (\n    <header>\n      <h1>Club de montaña Peña Alta</h1>\n      <p>Salidas cada sábado desde 1987</p>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "ProximaSalida.jsx",
      "codigo": "export default function ProximaSalida() {\n  return (\n    <section>\n      <h2>Próxima salida</h2>\n      <p>Peñalara desde el puerto de Cotos, sábado a las 8:00.</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nheader {\n  padding: 0.75rem 1rem;\n  border-radius: 10px;\n  background: #2f5d50;\n  color: white;\n}\n\nheader h1 {\n  margin: 0;\n}\n\nheader p {\n  margin: 0.25rem 0 0;\n}\n\nh2 {\n  margin-bottom: 0.25rem;\n  color: #2f5d50;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Fíjate en la cadena: `main.jsx` importa `App`, y `App.jsx` importa `Cabecera` y `ProximaSalida`. `App.jsx` es el **archivo del componente raíz**, el primero que se pinta. Se llama así en la plantilla de Vite, pero no es una regla: con un framework que crea las rutas a partir de archivos, como Next.js, cada página tiene su propio componente raíz.

Fíjate también en lo que no hay: `Cabecera.jsx` y `ProximaSalida.jsx` no importan nada, porque no usan nada de fuera. Un archivo importa solo lo que usa él.

## Export por defecto y export con nombre

JavaScript tiene dos formas de exportar, y **cómo exportas decide cómo tienes que importar**:

```jsx
// Cabecera.jsx: export por defecto
export default function Cabecera() { /* ... */ }

// App.jsx: se importa sin llaves
import Cabecera from './Cabecera'
```

```jsx
// Material.jsx: exports con nombre
export function ListaMaterial() { /* ... */ }
export function AvisoMeteo() { /* ... */ }

// App.jsx: se importan entre llaves, con su nombre exacto
import { ListaMaterial, AvisoMeteo } from './Material'
```

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un solo export por defecto en cada archivo",
      "texto": "Es el valor principal del archivo, y solo puede haber uno. Si escribes dos, Vite se niega a compilar: «A module cannot have multiple default exports.»"
    },
    {
      "titulo": "Tantos exports con nombre como quieras",
      "texto": "Cada uno con su nombre. Sirven para tener varios componentes pequeños en un mismo archivo, o funciones y constantes."
    },
    {
      "titulo": "Al import por defecto le pone nombre quien importa",
      "texto": "import Cabecera from './Cabecera' e import Encabezado from './Cabecera' traen lo mismo. Pero el componente se sigue llamando Cabecera en los mensajes de React y en React DevTools, porque ese es el nombre de la función. Por eso se importa con el mismo nombre."
    },
    {
      "titulo": "El import con nombre tiene que coincidir",
      "texto": "Las llaves buscan ese nombre exacto, mayúsculas incluidas. Si en tu archivo quieres llamarlo de otra forma, renómbralo con as: import { ListaMaterial as Material } from './Material'."
    }
  ]
}
```

¿Cuál usar? La costumbre más extendida, y la que sigue react.dev, es **export por defecto cuando el archivo tiene un solo componente** y **exports con nombre cuando tiene varios**, o cuando junto al componente hay funciones y constantes. Algunos equipos eligen un solo estilo para todo el proyecto, para no tener que pensar en cada archivo cuál toca. Las dos opciones funcionan; lo que importa es ser constante.

El propio React usa exports con nombre: por eso escribes `import { useState } from 'react'` e `import { createRoot } from 'react-dom/client'`, con llaves.

## Los dos en un mismo archivo

Un archivo puede tener un export por defecto y varios con nombre a la vez. Se importan en la misma línea: primero el de por defecto, sin llaves, y después los demás, entre llaves:

```jsx
import ProximaSalida, { SalidaCancelada } from './Salidas'
```

Equivale a dos imports del mismo archivo, uno de cada tipo. Aquí tienes los tres casos funcionando: `Cabecera.jsx` con un export por defecto, `Material.jsx` con dos con nombre y `Salidas.jsx` con uno de cada.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Por defecto, con nombre y los dos a la vez",
  "consigna": "Añade a Material.jsx un tercer componente con nombre, AvisoAgua, que diga «Lleva al menos litro y medio de agua». Impórtalo en App.jsx, en la misma línea que ListaMaterial y AvisoMeteo, y úsalo debajo de AvisoMeteo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Cabecera from './Cabecera'\nimport ProximaSalida, { SalidaCancelada } from './Salidas'\nimport { ListaMaterial, AvisoMeteo } from './Material'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <ProximaSalida />\n      <SalidaCancelada />\n      <h2>Material obligatorio</h2>\n      <ListaMaterial />\n      <AvisoMeteo />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Cabecera.jsx",
      "codigo": "export default function Cabecera() {\n  return (\n    <header>\n      <h1>Club de montaña Peña Alta</h1>\n      <p>Salidas cada sábado desde 1987</p>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "Salidas.jsx",
      "codigo": "export default function ProximaSalida() {\n  return (\n    <section>\n      <h2>Próxima salida</h2>\n      <p>Peñalara desde el puerto de Cotos, sábado a las 8:00.</p>\n    </section>\n  )\n}\n\nexport function SalidaCancelada() {\n  return <p>Cancelada: La Pedriza del domingo, por previsión de tormentas.</p>\n}\n"
    },
    {
      "nombre": "Material.jsx",
      "codigo": "export function ListaMaterial() {\n  return (\n    <ul>\n      <li>Botas de montaña</li>\n      <li>Chubasquero</li>\n      <li>Frontal con pilas de repuesto</li>\n    </ul>\n  )\n}\n\nexport function AvisoMeteo() {\n  return <p>Consulta la previsión de AEMET la víspera de la salida.</p>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nheader {\n  padding: 0.75rem 1rem;\n  border-radius: 10px;\n  background: #2f5d50;\n  color: white;\n}\n\nheader h1 {\n  margin: 0;\n}\n\nheader p {\n  margin: 0.25rem 0 0;\n}\n\nh2 {\n  margin-bottom: 0.25rem;\n  color: #2f5d50;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

react.dev avisa de que mezclar los dos tipos en un archivo confunde a algunos equipos, que prefieren evitarlo. `Salidas.jsx` funciona, pero si dudas, separa: un archivo por componente y cada uno con su export por defecto.

## `export default function App()` o `export default App` al final

En la lección 2 viste que la plantilla de Vite no exporta `App` en la misma línea de la función, sino al final del archivo. Estas tres formas dan exactamente el mismo resultado: el mismo componente, exportado por defecto, con el mismo nombre.

```jsx
// 1. En la misma línea que la función
export default function Cabecera() {
  return <h1>Club de montaña Peña Alta</h1>
}
```

```jsx
// 2. Declarar la función y exportarla al final, como la plantilla de Vite
function Cabecera() {
  return <h1>Club de montaña Peña Alta</h1>
}

export default Cabecera
```

```jsx
// 3. Con una función flecha: el export por defecto va siempre aparte
const Cabecera = () => {
  return <h1>Club de montaña Peña Alta</h1>
}

export default Cabecera
```

La primera es la más corta y la que usa react.dev. La segunda deja todos los exports juntos al final, y la tercera es la única opción si escribes los componentes como funciones flecha. Elige una y úsala en todo el proyecto. Con exports con nombre, la flecha sí puede exportarse en la misma línea: `export const Cabecera = () => { ... }`. Con `export default`, no:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Cuatro archivos distintos: cada línea es el export de uno de ellos.\nexport default function Cabecera() { /* … */ }\nexport const Cabecera = () => { /* … */ }\nexport default const Cabecera = () => { /* … */ }\nexport default Cabecera\n\n// ¿Cuál de las cuatro es un error de sintaxis?",
  "opciones": [
    "export default function Cabecera() { … }",
    "export const Cabecera = () => { … }",
    "export default const Cabecera = () => { … }",
    "export default Cabecera"
  ],
  "correcta": 2,
  "explicacion": "Detrás de export default puede ir una expresión, como Cabecera, o la declaración de una función o una clase, pero no una declaración de variable con const o let. El editor de esta web y Vite 8 dan el mismo mensaje, Unexpected token, señalando la palabra const. Con una flecha se declara la constante primero y se exporta aparte, con export default Cabecera."
}
```

## Componentes sin nombre: por qué evitarlos

JavaScript también deja exportar por defecto una función sin nombre, con `export default function () { ... }` o con `export default () => ...`. Funciona, y lo verás en código ajeno. Pero tiene un precio:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nexport default function () {\n  const [inscritos, setInscritos] = useState(0)\n\n  return (\n    <button onClick={() => setInscritos(inscritos + 1)}>\n      Apuntarme ({inscritos} inscritos)\n    </button>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "export default function ()",
      "nota": "Válido para JavaScript: quien importe el archivo le pondrá el nombre que quiera en su import. Pero la función no tiene nombre, y React y sus herramientas usan el nombre de la función. En Vite, una función así se queda con el nombre default."
    },
    {
      "fragmento": "useState(0)",
      "nota": "Con npm run dev en marcha, Fast Refresh conserva el estado de un componente cuando guardas un cambio en su archivo. Con este no: Vite no lo reconoce como componente, actualiza también el archivo que lo importa y la cuenta vuelve a 0 cada vez que guardas."
    }
  ]
}
```

Esto es lo que pasa con un componente así, comprobado con Vite 8 y React 19.3:

- **En los mensajes de React** se llama `default`: *«An error occurred in the `<default>` component»*, *«Check the render method of `default`»*. Si tienes diez componentes sin nombre, los diez se llaman igual y cuesta saber cuál ha fallado.
- **En React DevTools**, que leen el mismo nombre de la función, también aparece como `default`.
- **Fast Refresh** pierde su estado cada vez que guardas, como dice la nota de `useState`.
- **El linter** de la plantilla de Vite lo marca: *«Fast refresh can't handle anonymous components. Add a name to your export.»*

La solución es ponerle nombre: `export default function Inscritos() { ... }`, o con una flecha, `const Inscritos = () => { ... }` y `export default Inscritos` al final.

## La extensión y las mayúsculas en la ruta

Cualquiera de estas dos líneas funciona, en Vite y en el editor de esta web:

```jsx
import Cabecera from './Cabecera'
import Cabecera from './Cabecera.jsx'
```

El navegador, por sí solo, no adivina extensiones: con módulos de JavaScript nativos, `import './Cabecera'` pide al servidor exactamente esa dirección, sin extensión, y un servidor normal responde con un 404. Es Vite quien, si falta la extensión, prueba por orden `.mjs`, `.js`, `.mts`, `.ts`, `.jsx`, `.tsx` y `.json` hasta encontrar el archivo. Por eso react.dev dice que la versión con extensión se parece más a cómo funcionan los módulos nativos. La plantilla de Vite la escribe en `main.jsx`: `import App from './App.jsx'`. Las dos valen; elige una y sé constante. Los CSS, en cambio, llevan siempre extensión: `import './estilos.css'`.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Las mayúsculas de la ruta sí cuentan",
  "contenido": "En macOS y en Windows el sistema de archivos no distingue mayúsculas por defecto, así que import Cabecera from './cabecera' funciona en tu ordenador aunque el archivo se llame Cabecera.jsx. Pero los servidores donde se construye y publica una web suelen usar Linux, que sí las distingue, y allí la build falla con «Could not resolve './cabecera'». Escribe la ruta exactamente igual que el nombre del archivo. El editor de esta web también es estricto, y responde: No encuentro el archivo «./cabecera»."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un componente por archivo, con su mismo nombre",
      "texto": "Cabecera.jsx exporta Cabecera. Encuentras cada componente sin buscar, sabes de dónde importarlo y los cambios de una pieza quedan en su archivo."
    },
    {
      "titulo": "Los componentes auxiliares, junto a quien los usa",
      "texto": "Si un componente pequeño solo lo usa otro, puede quedarse en el mismo archivo y sin exportar, como Sello en la lección 3. Cuando otro archivo lo necesite, lo mueves al suyo."
    },
    {
      "titulo": "Varias piezas pequeñas y relacionadas, con exports con nombre",
      "texto": "Avisos, iconos o botones de un mismo estilo pueden compartir archivo. Si el archivo crece demasiado, sepáralo."
    },
    {
      "titulo": "Las funciones auxiliares, fuera de los archivos de componentes",
      "texto": "Para que Fast Refresh funcione bien, un archivo de componentes debería exportar solo componentes. Si exporta también una función, Vite avisa con «Could not Fast Refresh» y tiene que actualizar además los archivos que lo importan. Lleva esas funciones a su propio archivo .js. Una constante sencilla, como un número o un texto, sí se puede exportar junto al componente."
    },
    {
      "titulo": "Carpetas cuando hay muchos",
      "texto": "En un proyecto real, los componentes suelen ir en src/components, a veces con una carpeta por sección de la web. Solo cambia la ruta del import: './components/Cabecera'."
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
      "mito": "Un componente tiene que exportarse por defecto",
      "realidad": "Puede exportarse con nombre: lo que importa es que el import use la forma que le corresponde. Lo que sí espera un export por defecto es quien importa App: el main.jsx de Vite y el editor de esta web, que monta tu App.jsx."
    },
    {
      "mito": "El nombre del import por defecto tiene que coincidir con el del componente",
      "realidad": "Puedes ponerle cualquier nombre. Se mantiene el mismo por claridad, y porque en los mensajes de React y en DevTools sale el nombre de la función, no el del import."
    },
    {
      "mito": "Quitar la extensión del import es lo correcto",
      "realidad": "Funciona porque Vite la completa por ti. Los módulos nativos del navegador necesitan la ruta completa, así que la versión con extensión es la más cercana al estándar. Las dos valen si eres constante."
    },
    {
      "mito": "Cada archivo con JSX tiene que importar React",
      "realidad": "Hacía falta con la transformación de JSX antigua, anterior a React 17, y lo verás en código viejo. Hoy solo importas lo que usas, como useState: los archivos Cabecera.jsx de esta lección no importan nada. En la lección 7 verás por qué."
    }
  ]
}
```

## Errores típicos

**Mezclar el import por defecto y el import con nombre.** Es el error más típico de esta lección: el archivo exporta de una forma y lo importas de la otra. Aquí `Cabecera.jsx` exporta por defecto, pero `App.jsx` la importa entre llaves:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un import con llaves para un export por defecto",
  "consigna": "Lee el error de debajo de la vista previa. Arréglalo de las dos formas posibles, una cada vez: quitando las llaves del import en App.jsx, o cambiando Cabecera.jsx para que exporte con nombre.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Cabecera } from './Cabecera'\nimport ProximaSalida from './ProximaSalida'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <ProximaSalida />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Cabecera.jsx",
      "codigo": "export default function Cabecera() {\n  return (\n    <header>\n      <h1>Club de montaña Peña Alta</h1>\n      <p>Salidas cada sábado desde 1987</p>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "ProximaSalida.jsx",
      "codigo": "export default function ProximaSalida() {\n  return (\n    <section>\n      <h2>Próxima salida</h2>\n      <p>Peñalara desde el puerto de Cotos, sábado a las 8:00.</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nheader {\n  padding: 0.75rem 1rem;\n  border-radius: 10px;\n  background: #2f5d50;\n  color: white;\n}\n\nheader h1 {\n  margin: 0;\n}\n\nheader p {\n  margin: 0.25rem 0 0;\n}\n\nh2 {\n  margin-bottom: 0.25rem;\n  color: #2f5d50;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Este es el mensaje real de React 19.3:

```text
Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.

Check the render method of `App`.
```

Es decir: «El tipo de elemento no es válido: se esperaba un texto (para las etiquetas del navegador) o una clase o función (para los componentes), pero ha llegado `undefined`. Seguramente olvidaste exportar el componente desde su archivo, o confundiste los imports por defecto y con nombre. Revisa lo que pinta `App`». El import con llaves no encontró ningún `Cabecera` en el archivo, así que la variable vale `undefined`, y React se encuentra `undefined` donde esperaba una etiqueta o una función.

Ahora bien, el editor de esta web convierte cada archivo en un módulo a la antigua, donde un export que no existe simplemente vale `undefined`, y React es el primero en notarlo. En tu proyecto de Vite no pasa lo mismo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// src/Cabecera.jsx\nexport default function Cabecera() {\n  return <h1>Club de montaña Peña Alta</h1>\n}\n\n// src/App.jsx\nimport { Cabecera } from './Cabecera'\n\nexport default function App() {\n  return <Cabecera />\n}\n\n// Con npm run dev en marcha, abres la página. ¿Qué ves?",
  "opciones": [
    "El mismo error de React: Element type is invalid",
    "Una página en blanco y, en la consola, un SyntaxError que dice que Cabecera.jsx no exporta Cabecera",
    "La página sin la cabecera, y el resto funcionando"
  ],
  "correcta": 1,
  "explicacion": "Vite sirve tus archivos como módulos de JavaScript de verdad, y el navegador comprueba todos los imports antes de ejecutar nada: The requested module '/src/Cabecera.jsx' does not provide an export named 'Cabecera'. React ni siquiera llega a arrancar, por eso no ves su mensaje. Vite 8 copia ese error en la terminal, y npm run build se detiene con [MISSING_EXPORT]."
}
```

El mismo fallo, tres mensajes según dónde estés:

- **En el editor de esta web:** *«Element type is invalid: … you might have mixed up default and named imports.»*
- **En el navegador, con `npm run dev`:** *«The requested module '/src/Cabecera.jsx' does not provide an export named 'Cabecera'»*, o `'default'` si el error es al revés: importar sin llaves algo que se exportó con nombre.
- **Con `npm run build`:** *«[MISSING_EXPORT] "Cabecera" is not exported by "src/Cabecera.jsx".»*

Los tres dicen lo mismo: lo que pides no existe en ese archivo con esa forma. Mira cómo exporta el archivo y escribe el import que le corresponde.

**Olvidar el import.** Usar `<Cabecera />` sin importarla da *«Cabecera is not defined»*, tanto en el editor como en el navegador. El linter de la plantilla de Vite lo marca antes de ejecutar nada: *«'Cabecera' is not defined.»*

**Olvidar el export.** Si `Cabecera.jsx` define la función pero no la exporta, el import no encuentra nada. En el editor sale el mismo *«Element type is invalid… You likely forgot to export your component»*, y en Vite, *«does not provide an export named 'default'»*.

**Una errata en la ruta.** Con `import Cabecera from './Cabesera'`, Vite responde *«Failed to resolve import "./Cabesera" from "src/App.jsx". Does the file exist?»* y la build, *«Could not resolve './Cabesera'»*. Y recuerda el aviso de las mayúsculas: una ruta con la mayúscula cambiada puede funcionar en tu ordenador y fallar al publicar.

**Dos `export default` en un archivo.** Suele pasar al pegar un componente en un archivo que ya tenía el suyo. Vite responde *«A module cannot have multiple default exports.»*: uno de los dos tiene que pasar a export con nombre o irse a su propio archivo.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Conecta los archivos de la web del club",
  "consigna": "La vista previa da un error: dos imports de App.jsx no casan con el export de su archivo. Arréglalos en App.jsx, sin tocar los demás archivos. Después escribe en Pie.jsx un componente Pie que muestre un párrafo con el texto «© Club de montaña Peña Alta», expórtalo como prefieras, impórtalo en App.jsx y úsalo al final de <main>. Pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Cabecera } from './Cabecera'\nimport ProximaSalida from './ProximaSalida'\nimport ListaMaterial from './Material'\nimport './estilos.css'\n// Importa aquí el componente Pie\n\nexport default function App() {\n  return (\n    <main>\n      <Cabecera />\n      <ProximaSalida />\n      <h2>Material obligatorio</h2>\n      <ListaMaterial />\n      {/* Y úsalo aquí */}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Cabecera.jsx",
      "codigo": "export default function Cabecera() {\n  return (\n    <header>\n      <h1>Club de montaña Peña Alta</h1>\n      <p>Salidas cada sábado desde 1987</p>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "ProximaSalida.jsx",
      "codigo": "export default function ProximaSalida() {\n  return (\n    <section>\n      <h2>Próxima salida</h2>\n      <p>Peñalara desde el puerto de Cotos, sábado a las 8:00.</p>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Material.jsx",
      "codigo": "export function ListaMaterial() {\n  return (\n    <ul>\n      <li>Botas de montaña</li>\n      <li>Chubasquero</li>\n      <li>Frontal con pilas de repuesto</li>\n    </ul>\n  )\n}\n\nexport function AvisoMeteo() {\n  return <p>Consulta la previsión de AEMET la víspera de la salida.</p>\n}\n"
    },
    {
      "nombre": "Pie.jsx",
      "codigo": "// Escribe aquí el componente Pie y expórtalo.\n// Tiene que mostrar un párrafo con el texto: © Club de montaña Peña Alta\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 36rem;\n  font-family: system-ui, sans-serif;\n}\n\nheader {\n  padding: 0.75rem 1rem;\n  border-radius: 10px;\n  background: #2f5d50;\n  color: white;\n}\n\nheader h1 {\n  margin: 0;\n}\n\nheader p {\n  margin: 0.25rem 0 0;\n}\n\nh2 {\n  margin-bottom: 0.25rem;\n  color: #2f5d50;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La cabecera muestra el título «Club de montaña Peña Alta»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Club de montaña Peña Alta"
      }
    },
    {
      "descripcion": "Se ve la sección «Próxima salida»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Próxima salida"
      }
    },
    {
      "descripcion": "La lista de material incluye «Frontal con pilas de repuesto»",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Frontal con pilas de repuesto"
      }
    },
    {
      "descripcion": "Al final se ve el pie «© Club de montaña Peña Alta»",
      "pasos": [],
      "espera": {
        "texto": "© Club de montaña Peña Alta"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio, cambia todos los exports a exports con nombre y ajusta los imports. Después hazlo al revés, todo por defecto. ¿Con qué estilo te quedarías para un proyecto entero?
2. En tu proyecto de Vite, crea `Cabecera.jsx` y `Pie.jsx` en `src`, impórtalos en `App.jsx` y comprueba que funcionan con la extensión en el import y sin ella.
3. Provoca a propósito en tu proyecto el error de mezclar imports. Compara lo que ves en el navegador, en la terminal de `npm run dev` y al ejecutar `npm run build`.
4. Con `npm run dev` en marcha, pulsa varias veces un contador que esté en un componente con nombre y cambia su texto en el editor: la cuenta se conserva. Quita el nombre del export y repite. Termina con `npm run lint` para leer el aviso.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Importing and Exporting Components",
      "descripcion": "La página de react.dev de esta lección, con el ejemplo de la galería y un reto para repartir componentes en archivos.",
      "url": "https://react.dev/learn/importing-and-exporting-components",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "export",
      "descripcion": "Todas las formas de exportar en JavaScript: con nombre, por defecto, listas de exports y reexportaciones.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/export",
      "etiqueta": "MDN"
    },
    {
      "titulo": "import",
      "descripcion": "Todas las formas de importar: por defecto, con nombre, renombrar con as e importar un módulo entero.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/import",
      "etiqueta": "MDN"
    },
    {
      "titulo": "only-export-components",
      "descripcion": "La regla del linter de la plantilla de Vite que avisa de los componentes sin nombre y de los archivos que exportan algo más que componentes.",
      "url": "https://oxc.rs/docs/guide/usage/linter/rules/react/only-export-components.html",
      "etiqueta": "Oxc"
    },
    {
      "titulo": "resolve.extensions",
      "descripcion": "Qué extensiones prueba Vite, y en qué orden, cuando un import no la lleva.",
      "url": "https://vite.dev/config/shared-options#resolve-extensions",
      "etiqueta": "vite.dev"
    }
  ]
}
```
