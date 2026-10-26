# Listas y por qué `key` importa

- **Módulo:** Describir la interfaz
- **Slug:** `listas-y-por-que-key-importa` (autogenerado del título)
- **Orden:** 110
- **Fuentes:** [Rendering Lists](https://react.dev/learn/rendering-lists) — ver `contenido/react/TEMARIO.md` #11

---

## Qué es y para qué sirve

Casi todo lo que llega de un servidor llega en un array: los libros de un club de lectura, los comentarios de una entrada, los resultados de una búsqueda. Y en pantalla, cada elemento del array se pinta con la misma pieza repetida.

Con JavaScript a mano recorrías el array y creabas un nodo por elemento, con `createElement` y `appendChild` o con un `innerHTML` y un `join`. Y cuando el array cambiaba, te tocaba decidir qué nodos quitar, cuáles añadir y cuáles mover. En React:

> **Una lista es un array de datos convertido, con `map`, en un array de elementos de JSX. Y cada elemento lleva una `key` que le dice a React cuál es cuál.**

React se encarga del resto: cuando el array cambia, compara la lista nueva con la anterior y toca en el DOM solo lo necesario. La `key` es lo que le permite hacer esa comparación bien, y la mitad de esta lección va de ella.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Del array a la lista",
  "codigo": "const libros = [\n  { id: 'marianela', titulo: 'Marianela', autor: 'Benito Pérez Galdós' },\n  { id: 'niebla', titulo: 'Niebla', autor: 'Miguel de Unamuno' },\n  { id: 'regenta', titulo: 'La Regenta', autor: 'Leopoldo Alas «Clarín»' },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Club de lectura La Tertulia</h1>\n      <ul>\n        {libros.map((libro) => (\n          <li key={libro.id}>\n            <strong>{libro.titulo}</strong>, de {libro.autor}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main { font-family: system-ui, sans-serif; }\nh1 { margin: 0 0 0.5rem; font-size: 1.4rem; }\nli { margin-bottom: 0.35rem; }",
  "anotaciones": [
    {
      "fragmento": "{ id: 'marianela', titulo: 'Marianela', autor: 'Benito Pérez Galdós' }",
      "nota": "Los datos son un array de objetos, y cada objeto trae un id que no se repite. Ese id será la key."
    },
    {
      "fragmento": "libros.map((libro) => (",
      "nota": "map recorre el array y devuelve otro nuevo: por cada libro, un elemento <li>. Es el map de siempre de JavaScript; lo único nuevo es que devuelve JSX."
    },
    {
      "fragmento": "key={libro.id}",
      "nota": "La key identifica cada elemento entre sus hermanos. No se ve en la página ni llega al HTML: es solo para React."
    },
    {
      "fragmento": "<ul>",
      "nota": "Entre las llaves hay un array de tres <li>. React pinta un array de elementos uno detrás de otro, como si los hubieras escrito a mano."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## De un array de datos a un array de elementos

`map` no tiene nada de especial en React: devuelve un array nuevo, y esta vez cada posición es un elemento de JSX. Puedes construirlo en una variable antes del `return` o directamente entre las llaves; el resultado es el mismo:

```jsx
const elementos = libros.map((libro) => <li key={libro.id}>{libro.titulo}</li>)

return <ul>{elementos}</ul>
```

Lo normal es que cada elemento de la lista sea un componente propio. Entonces **la `key` va en el componente que devuelve el `map`**, no en el `<li>` que ese componente pinta por dentro: es el `map` el que fabrica la lista de hermanos, y ahí es donde React necesita distinguirlos.

En este ejemplo los datos viven en su propio archivo, `datos.jsx`. En el editor todos los archivos son `.jsx` o `.css`; en tu proyecto sería un `datos.js` normal.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una tarjeta por libro",
  "consigna": "Añade un libro al array de datos.jsx: aparece en la lista sin tocar el JSX. Fíjate en dónde va la key: en <TarjetaLibro>, dentro del map de App.jsx, y no en el <li> de TarjetaLibro.jsx.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { LIBROS } from './datos'\nimport TarjetaLibro from './TarjetaLibro'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Club de lectura La Tertulia</h1>\n      <ul className=\"libros\">\n        {LIBROS.map((libro) => (\n          <TarjetaLibro key={libro.id} libro={libro} />\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaLibro.jsx",
      "codigo": "export default function TarjetaLibro({ libro }) {\n  return (\n    <li className=\"tarjeta\">\n      <strong>{libro.titulo}</strong>\n      <span>{libro.autor}</span>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const LIBROS = [\n  { id: 'marianela', titulo: 'Marianela', autor: 'Benito Pérez Galdós', leido: true },\n  { id: 'niebla', titulo: 'Niebla', autor: 'Miguel de Unamuno', leido: false },\n  { id: 'regenta', titulo: 'La Regenta', autor: 'Leopoldo Alas «Clarín»', leido: true },\n  { id: 'santos-inocentes', titulo: 'Los santos inocentes', autor: 'Miguel Delibes', leido: false },\n  { id: 'luces-de-bohemia', titulo: 'Luces de bohemia', autor: 'Ramón María del Valle-Inclán', leido: false },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 1rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.libros {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n  background: #fafaf9;\n}\n\n.tarjeta span {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

## Filtrar antes de pintar

Para pintar solo una parte, filtra antes: `filter` devuelve un array con los elementos que pasan la prueba, y `map` lo convierte en elementos de JSX. Se encadenan en una sola expresión, o se guardan en una variable con buen nombre.

**El array filtrado no se guarda en ningún sitio**: se calcula en cada render a partir de los datos originales. Si un libro pasa a estar leído, cambia de lista solo, sin que tengas que mantener dos copias de acuerdo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Pendientes y leídos, del mismo array",
  "consigna": "Cambia leido en datos.jsx y mira cómo cada libro cambia de lista. Pon todos a false: la lista de leídos deja paso a un mensaje. Después ordena los pendientes por título encadenando toSorted((a, b) => a.titulo.localeCompare(b.titulo)) antes del map.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { LIBROS } from './datos'\nimport './estilos.css'\n\nexport default function App() {\n  const pendientes = LIBROS.filter((libro) => !libro.leido)\n  const leidos = LIBROS.filter((libro) => libro.leido)\n\n  return (\n    <main>\n      <h1>Club de lectura La Tertulia</h1>\n      <h2>Pendientes ({pendientes.length})</h2>\n      <ul>\n        {pendientes.map((libro) => (\n          <li key={libro.id}>{libro.titulo}</li>\n        ))}\n      </ul>\n      <h2>Ya leídos ({leidos.length})</h2>\n      {leidos.length > 0 ? (\n        <ul>\n          {leidos.map((libro) => (\n            <li key={libro.id}>{libro.titulo}</li>\n          ))}\n        </ul>\n      ) : (\n        <p>Todavía no habéis terminado ninguno.</p>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const LIBROS = [\n  { id: 'marianela', titulo: 'Marianela', autor: 'Benito Pérez Galdós', leido: true },\n  { id: 'niebla', titulo: 'Niebla', autor: 'Miguel de Unamuno', leido: false },\n  { id: 'regenta', titulo: 'La Regenta', autor: 'Leopoldo Alas «Clarín»', leido: true },\n  { id: 'santos-inocentes', titulo: 'Los santos inocentes', autor: 'Miguel Delibes', leido: false },\n  { id: 'luces-de-bohemia', titulo: 'Luces de bohemia', autor: 'Ramón María del Valle-Inclán', leido: false },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 1rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.libros {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n  background: #fafaf9;\n}\n\n.tarjeta span {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Dos detalles de este ejemplo. El mensaje de lista vacía usa `leidos.length > 0`, no `leidos.length` a secas: ya sabes por la lección 10 qué pinta un 0 en ese sitio. Y para ordenar, usa `toSorted` o una copia (`[...pendientes].sort(…)`): `sort()` a secas reordena el array original, y en la lección 12 verás por qué modificar datos durante el render trae problemas.

## La `key`: el nombre de cada elemento

Cada vez que una lista se vuelve a pintar, React compara los elementos nuevos con los de la vez anterior para decidir qué tocar en el DOM. Si solo conoce la posición, «el tercero de antes» y «el tercero de ahora» son el mismo elemento, aunque sean libros distintos. La `key` le da a cada uno **un nombre propio**: un texto o un número que lo identifica entre sus hermanos, render tras render.

Piensa en un guardarropa. Si en vez de darte un ticket con número apuntaran «tu abrigo es el tercero de la fila», bastaría con que alguien recogiera el primero para que tu ticket señalara el abrigo de otra persona. **La `key` es el ticket: va con el abrigo, no con el sitio que ocupa.**

Sin `key` la lista se pinta igual, pero React te avisa en la consola. Mírala aquí:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una lista sin key",
  "consigna": "La consola muestra el aviso de React: a los elementos de la lista les falta la key. Añade key={libro.id} al <li> y el aviso desaparece.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { LIBROS } from './datos'\n\nexport default function App() {\n  return (\n    <ul>\n      {LIBROS.map((libro) => (\n        <li>\n          {libro.titulo}, de {libro.autor}\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const LIBROS = [\n  { id: 'marianela', titulo: 'Marianela', autor: 'Benito Pérez Galdós', leido: true },\n  { id: 'niebla', titulo: 'Niebla', autor: 'Miguel de Unamuno', leido: false },\n  { id: 'regenta', titulo: 'La Regenta', autor: 'Leopoldo Alas «Clarín»', leido: true },\n  { id: 'santos-inocentes', titulo: 'Los santos inocentes', autor: 'Miguel Delibes', leido: false },\n  { id: 'luces-de-bohemia', titulo: 'Luces de bohemia', autor: 'Ramón María del Valle-Inclán', leido: false },\n]\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El aviso de React 19.3.1, tal como sale en la consola:

```text
Each child in a list should have a unique "key" prop.

Check the render method of `App`. See https://react.dev/link/warning-keys for more information.
```

«Check the render method of `App`» te dice en qué componente está el `map` sin `key`, y el enlace lleva a la sección de react.dev que trata justo esto. Es un aviso, no un error: la lista funciona... hasta que cambia.

## De dónde sale la `key`

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres orígenes para una key",
  "roles": [
    {
      "etiqueta": "Datos de un servidor",
      "rol": "Usa su identificador",
      "descripcion": "Los registros de una base de datos ya traen un id único. También vale un identificador natural, como el ISBN de una edición."
    },
    {
      "etiqueta": "Datos que crea tu app",
      "rol": "Genera el id al crear el dato",
      "descripcion": "Al crear la nota, la tarea o la propuesta, dale un id con crypto.randomUUID() o con un contador, y guárdalo junto al dato."
    },
    {
      "etiqueta": "Listas que nunca cambian",
      "rol": "El índice, como excepción",
      "descripcion": "Si la lista nunca se reordena, ni crece ni encoge, y sus elementos no guardan nada dentro, el índice no da problemas."
    }
  ]
}
```

Lo importante del segundo caso es **cuándo** se genera el id: una sola vez, al crear el dato, y nunca al pintarlo.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// Bien: el id nace con el dato, una sola vez\nfunction crearPropuesta(titulo, autor) {\n  return { id: crypto.randomUUID(), titulo, autor, leido: false }\n}\n\n// En el map, la key sale del dato y no cambia entre renders\n{propuestas.map((libro) => (\n  <li key={libro.id}>{libro.titulo}</li>\n))}\n\n// Mal: una key nueva en cada render\n{propuestas.map((libro) => (\n  <li key={crypto.randomUUID()}>{libro.titulo}</li>\n))}",
  "anotaciones": [
    {
      "fragmento": "id: crypto.randomUUID()",
      "nota": "crypto.randomUUID() devuelve un identificador aleatorio de 36 caracteres. Está en todos los navegadores desde marzo de 2022, aunque solo en páginas seguras (https, o localhost mientras desarrollas). También funciona en las vistas previas de esta web."
    },
    {
      "fragmento": "<li key={libro.id}>",
      "nota": "La key sale del propio dato: en cada render, el mismo libro trae la misma key."
    },
    {
      "fragmento": "<li key={crypto.randomUUID()}>",
      "nota": "Una key generada al pintar cambia en cada render. React cree que todos los elementos son nuevos, tira los anteriores y crea otros: es lento y se pierde lo que hubiera dentro, como el texto de un campo. Math.random() tiene el mismo problema."
    }
  ]
}
```

## Las dos reglas de la `key`

**Primera regla: única entre hermanos.** Dentro del mismo array no se puede repetir. Con dos libros que comparten el id `2`, React avisa así:

```text
Encountered two children with the same key, `2`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
```

Pero solo entre hermanos: las listas de pendientes y de leídos de antes usan los mismos `id` sin ningún aviso, porque son arrays distintos.

**Segunda regla: estable.** El mismo dato tiene que llevar la misma `key` en todos los renders. Nada de generarla al pintar.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "La key tiene que ser única en toda la aplicación",
      "realidad": "Solo entre hermanos, los elementos de un mismo array. Dos listas distintas pueden usar los mismos ids sin ningún aviso."
    },
    {
      "mito": "Sin key, React no pinta la lista",
      "realidad": "La pinta, pero avisa en la consola y se guía por la posición, como si la key fuera el índice. Mientras la lista no cambie no notarás nada; cuando cambie, aparecerán los fallos de la sección siguiente."
    },
    {
      "mito": "Math.random() da keys únicas, así que valen",
      "realidad": "Son únicas, pero no estables: cambian en cada render. React cree que todo es nuevo, destruye los elementos y los vuelve a crear, y lo escrito dentro se pierde."
    },
    {
      "mito": "La key mejora el aspecto o el orden de la lista",
      "realidad": "No cambia nada de lo que se ve, ni el orden: el orden lo marca el array. La key solo sirve para que React reconozca cada elemento de un render al siguiente."
    }
  ]
}
```

## Por qué importa: el índice como `key`

`map` te da el índice gratis como segundo argumento, y es tentador usarlo: `libros.map((libro, indice) => <li key={indice}>…)`. El aviso de la consola desaparece y la lista se ve bien. El problema llega cuando la lista cambia y **los elementos guardan algo dentro**: el texto de un campo, una casilla marcada, un desplegable abierto, o un estado propio. Haz la prueba mental antes de verlo en vivo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\n// Escribes «Me encantó» en la nota de Marianela, la primera,\n// y después pulsas «Quitar el primero».\nconst LIBROS = [\n  { id: 'marianela', titulo: 'Marianela' },\n  { id: 'niebla', titulo: 'Niebla' },\n  { id: 'luces-de-bohemia', titulo: 'Luces de bohemia' },\n]\n\nexport default function App() {\n  const [libros, setLibros] = useState(LIBROS)\n\n  return (\n    <>\n      <button onClick={() => setLibros(libros.slice(1))}>Quitar el primero</button>\n      <ul>\n        {libros.map((libro, indice) => (\n          <li key={indice}>\n            <label>\n              Nota sobre {libro.titulo}\n              <input />\n            </label>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}",
  "opciones": [
    "Desaparece Marianela con su nota, y la nota de Niebla está vacía",
    "La nota de Niebla, ahora la primera, dice «Me encantó»",
    "Desaparece la última fila y Marianela sigue ahí",
    "Se borran todas las notas"
  ],
  "correcta": 1,
  "explicacion": "Antes había keys 0, 1 y 2; ahora, 0 y 1. Para React, el elemento 0 sigue existiendo (solo le ha cambiado el título) y el que ha desaparecido es el 2. Así que conserva el primer li, con tu texto dentro, y le pone el título de Niebla. Tu nota sobre Marianela acaba junto a Niebla."
}
```

Ahora en vivo. Las dos columnas pintan **la misma lista** con los mismos botones; solo cambia la `key`. El `useState` del principio es lo que permite quitar y reordenar libros: lo verás a fondo en la lección 16, por ahora quédate con que `libros` cambia al pulsar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El índice frente al id, con campos de texto",
  "consigna": "Escribe una nota distinta en cada campo de las dos columnas (por ejemplo, el nombre del libro). Pulsa «Quitar el primero» o «Invertir el orden» y compara: a la izquierda lo escrito se queda en su sitio y cambia de libro; a la derecha viaja con su libro. Pulsa «Reiniciar» para empezar de cero.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst LIBROS = [\n  { id: 'marianela', titulo: 'Marianela' },\n  { id: 'niebla', titulo: 'Niebla' },\n  { id: 'luces-de-bohemia', titulo: 'Luces de bohemia' },\n]\n\nexport default function App() {\n  const [libros, setLibros] = useState(LIBROS)\n\n  return (\n    <main>\n      <h1>Notas del club</h1>\n      <div className=\"acciones\">\n        <button onClick={() => setLibros(libros.slice(1))}>Quitar el primero</button>\n        <button onClick={() => setLibros([...libros].reverse())}>Invertir el orden</button>\n      </div>\n      <div className=\"columnas\">\n        <section>\n          <h2>Con el índice como key</h2>\n          <ul>\n            {libros.map((libro, indice) => (\n              <li key={indice}>\n                <label>\n                  Nota sobre {libro.titulo}\n                  <input />\n                </label>\n              </li>\n            ))}\n          </ul>\n        </section>\n        <section>\n          <h2>Con el id como key</h2>\n          <ul>\n            {libros.map((libro) => (\n              <li key={libro.id}>\n                <label>\n                  Nota sobre {libro.titulo}\n                  <input />\n                </label>\n              </li>\n            ))}\n          </ul>\n        </section>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.acciones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));\n  gap: 1rem;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1rem;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Si escribes en cada campo el nombre de su libro y pulsas «Quitar el primero», la columna del índice muestra junto a «Niebla» la nota de Marianela, junto a «Luces de bohemia» la de Niebla, y la nota de Luces de bohemia desaparece. Con «Invertir el orden», las notas se quedan quietas mientras los títulos se dan la vuelta. En la columna del id, cada nota sigue con su libro.

La razón es siempre la misma: **lo que hay dentro de un elemento (el DOM, con lo que escribiste, y el estado de sus componentes) va pegado a su `key`**. Si la `key` es la posición, va pegado a la posición. La lección 26 vuelve sobre esta idea, porque explica también cuándo React conserva el estado de un componente y cuándo lo reinicia.

## `key` no es una prop

React se queda la `key` para sí: **el componente no la recibe**. Si intenta leerla, obtiene `undefined` y un aviso en la consola. Cuando el componente necesite el id, pásalo además con otro nombre.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La tarjeta que intenta leer su key",
  "consigna": "TarjetaLibro lee props.key y recibe undefined; la consola explica por qué. Pásale también id={libro.id} desde App y muestra props.id en su lugar: el aviso desaparece.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { LIBROS } from './datos'\nimport TarjetaLibro from './TarjetaLibro'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Club de lectura La Tertulia</h1>\n      <ul className=\"libros\">\n        {LIBROS.map((libro) => (\n          <TarjetaLibro key={libro.id} titulo={libro.titulo} />\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaLibro.jsx",
      "codigo": "export default function TarjetaLibro(props) {\n  return (\n    <li className=\"tarjeta\">\n      <strong>{props.titulo}</strong>\n      <span>key recibida: {String(props.key)}</span>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const LIBROS = [\n  { id: 'marianela', titulo: 'Marianela', autor: 'Benito Pérez Galdós', leido: true },\n  { id: 'niebla', titulo: 'Niebla', autor: 'Miguel de Unamuno', leido: false },\n  { id: 'regenta', titulo: 'La Regenta', autor: 'Leopoldo Alas «Clarín»', leido: true },\n  { id: 'santos-inocentes', titulo: 'Los santos inocentes', autor: 'Miguel Delibes', leido: false },\n  { id: 'luces-de-bohemia', titulo: 'Luces de bohemia', autor: 'Ramón María del Valle-Inclán', leido: false },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\nh2 {\n  margin: 1rem 0 0.25rem;\n  font-size: 1.05rem;\n}\n\n.libros {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.tarjeta {\n  display: grid;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n  background: #fafaf9;\n}\n\n.tarjeta span {\n  color: #57534e;\n  font-size: 0.9rem;\n}\n"
    }
  ],
  "archivoInicial": "TarjetaLibro.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El aviso, palabra por palabra:

```text
TarjetaLibro: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)
```

Así que, si `TarjetaLibro` necesita el id (para un enlace, por ejemplo), la línea queda `<TarjetaLibro key={libro.id} id={libro.id} titulo={libro.titulo} />`. Parece repetido, pero cada uno tiene un destinatario distinto: la `key` es para React y el `id` es para el componente.

## Varios nodos por elemento: `<Fragment key>`

A veces cada elemento de la lista no es un nodo, sino varios hermanos. El caso típico es una lista de definiciones, donde cada término es un `<dt>` seguido de su `<dd>`. Envolverlos en un `<div>` añadiría un nodo que no quieres (aquí rompería la cuadrícula de dos columnas), y el fragmento corto `<>…</>` no admite atributos, así que no puede llevar `key`: en un `map` provoca el mismo aviso de antes. La solución es escribir el fragmento con su nombre completo.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El glosario del club",
  "codigo": "import { Fragment } from 'react'\n\nconst TERMINOS = [\n  { id: 'esperpento', termino: 'Esperpento', definicion: 'Estilo creado por Valle-Inclán que deforma la realidad para criticarla. Luces de bohemia es su ejemplo más conocido.' },\n  { id: 'nivola', termino: 'Nivola', definicion: 'Nombre que Unamuno dio a Niebla para separarla de la novela tradicional.' },\n  { id: 'monologo', termino: 'Monólogo interior', definicion: 'Técnica que reproduce el pensamiento de un personaje tal como fluye, sin ordenarlo.' },\n]\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Glosario del club</h1>\n      <dl className=\"glosario\">\n        {TERMINOS.map((t) => (\n          <Fragment key={t.id}>\n            <dt>{t.termino}</dt>\n            <dd>{t.definicion}</dd>\n          </Fragment>\n        ))}\n      </dl>\n    </main>\n  )\n}",
  "css": "main { font-family: system-ui, sans-serif; }\nh1 { margin: 0 0 0.5rem; font-size: 1.4rem; }\n.glosario { display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1rem; margin: 0; }\n.glosario dt { font-weight: 700; }\n.glosario dd { margin: 0; }",
  "anotaciones": [
    {
      "fragmento": "import { Fragment } from 'react'",
      "nota": "Fragment es lo mismo que <>…</>, pero escrito con nombre. Esa forma larga es la que admite la prop key."
    },
    {
      "fragmento": "<Fragment key={t.id}>",
      "nota": "La key va en el elemento que devuelve el map, que aquí es el fragmento. El fragmento no deja ningún nodo en el DOM."
    },
    {
      "fragmento": "<dt>{t.termino}</dt>",
      "nota": "El dt y el dd quedan como hijos directos del dl, en pares: dt, dd, dt, dd... Así la cuadrícula de dos columnas del CSS funciona."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Casi cualquier dato que llega de un servidor",
      "texto": "Resultados de búsqueda, comentarios, mensajes de un chat, filas de una tabla, opciones de un select: si llega en un array, se pinta con map."
    },
    {
      "titulo": "Listas que cambian",
      "texto": "Si se añaden, quitan, ordenan o filtran elementos, una buena key es lo que mantiene cada cosa en su sitio."
    },
    {
      "titulo": "Elementos con algo dentro",
      "texto": "Campos de texto, casillas, desplegables abiertos o componentes con estado propio: todo eso va pegado a la key. Con el índice, salta de fila."
    },
    {
      "titulo": "La key fuera de las listas",
      "texto": "Cambiar la key de un componente obliga a React a crearlo de nuevo desde cero. Es un truco útil para reiniciar un formulario, y tiene su sitio en la lección 26."
    }
  ]
}
```

## Errores típicos

**Un `map` con llaves y sin `return`.** Con una función flecha, `=> (…)` devuelve lo que hay entre paréntesis, pero `=> { … }` abre un bloque y hay que escribir `return`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const libros = [\n  { id: 'marianela', titulo: 'Marianela' },\n  { id: 'niebla', titulo: 'Niebla' },\n]\n\nexport default function App() {\n  return (\n    <ul>\n      {libros.map((libro) => {\n        <li key={libro.id}>{libro.titulo}</li>\n      })}\n    </ul>\n  )\n}",
  "opciones": [
    "Los dos libros",
    "Una lista vacía",
    "Un error: falta el return",
    "Un aviso de key en la consola"
  ],
  "correcta": 1,
  "explicacion": "Las llaves después de la flecha abren el cuerpo de la función, y ese cuerpo no devuelve nada: map produce [undefined, undefined]. React no pinta undefined, así que el ul queda vacío, sin errores ni avisos. Quita las llaves (o cámbialas por paréntesis) o escribe return delante del li."
}
```

**Poner la `key` dentro del componente.** Si `TarjetaLibro` pinta `<li key={libro.id}>` pero el `map` devuelve `<TarjetaLibro libro={libro} />` sin `key`, React sigue avisando de que falta: la `key` tiene que estar en el elemento que fabrica el `map`, que aquí es `<TarjetaLibro>`. Dentro del componente no sirve para nada.

**Generar la `key` al pintar.** Con `Math.random()` o `crypto.randomUUID()` dentro del JSX desaparece el aviso, pero cada render estrena keys. Compruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Notas que se borran solas",
  "consigna": "Escribe algo en una nota y pulsa «Me gusta», que solo sirve para provocar un render nuevo (con useState, como en la demo del índice). Lo escrito desaparece: con keys nuevas en cada render, React tira los li y crea otros vacíos. Cambia la key por libro.id y repite la prueba.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst LIBROS = [\n  { id: 'marianela', titulo: 'Marianela' },\n  { id: 'niebla', titulo: 'Niebla' },\n]\n\nexport default function App() {\n  const [meGusta, setMeGusta] = useState(0)\n\n  return (\n    <main>\n      <button onClick={() => setMeGusta(meGusta + 1)}>Me gusta ({meGusta})</button>\n      <ul>\n        {LIBROS.map((libro) => (\n          <li key={Math.random()}>\n            <label>\n              Nota sobre {libro.titulo}\n              <input />\n            </label>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n  max-width: 18rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

**Usar el índice en una lista que cambia.** Ya lo has visto en vivo: si la lista se reordena, crece o encoge, y sus elementos guardan algo, el índice hace que ese algo salte de fila. Y React no avisa, porque con el índice la key existe y no se repite.

**Usar como `key` un dato que se puede repetir.** El título parece único hasta que el club lee dos ediciones del mismo libro. Si dos hermanos coinciden, React avisa con el mensaje de «Encountered two children with the same key». Usa un identificador pensado para eso.

## Ejercicios

El estado y la función `quitar` ya vienen escritos, como en la demo del índice: tu trabajo es la lista.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Mis lecturas pendientes",
  "consigna": "Completa la lista de App.jsx con filter, map y una buena key. Cada Lectura tiene un campo para tus notas y un botón para quitarla; quitar un libro no debe mover las notas de los demás. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { LIBROS } from './datos'\nimport Lectura from './Lectura'\nimport './estilos.css'\n\nexport default function App() {\n  const [libros, setLibros] = useState(LIBROS)\n\n  function quitar(id) {\n    setLibros(libros.filter((libro) => libro.id !== id))\n  }\n\n  return (\n    <main>\n      <h1>Mis lecturas pendientes</h1>\n      <ul className=\"lecturas\">\n        {/* Pinta aquí una <Lectura> por cada libro que NO esté leído.\n            Pásale el libro y, para el botón, onQuitar={() => quitar(libro.id)}.\n            Y elige bien la key. */}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Lectura.jsx",
      "codigo": "export default function Lectura({ libro, onQuitar }) {\n  return (\n    <li className=\"lectura\">\n      <label>\n        Nota sobre {libro.titulo}\n        <input />\n      </label>\n      <button onClick={onQuitar}>Quitar {libro.titulo}</button>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "datos.jsx",
      "codigo": "export const LIBROS = [\n  { id: 'marianela', titulo: 'Marianela', leido: false },\n  { id: 'regenta', titulo: 'La Regenta', leido: true },\n  { id: 'niebla', titulo: 'Niebla', leido: false },\n  { id: 'tiempo-de-silencio', titulo: 'Tiempo de silencio', leido: true },\n  { id: 'santos-inocentes', titulo: 'Los santos inocentes', leido: false },\n]\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.4rem;\n}\n\n.lecturas {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.lectura {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: end;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 10px;\n}\n\n.lectura label {\n  display: grid;\n  flex: 1;\n  gap: 0.2rem;\n}\n\nbutton,\ninput {\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La lista muestra los libros pendientes",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Niebla"
      }
    },
    {
      "descripcion": "Los libros ya leídos no aparecen",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "La Regenta"
        }
      }
    },
    {
      "descripcion": "Al pulsar «Quitar Marianela», Marianela desaparece de la lista",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar Marianela"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Marianela"
        }
      }
    },
    {
      "descripcion": "Al quitar un libro, la nota escrita en otro se queda con su libro",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nota sobre Niebla",
            "texto": "Releer el capítulo 3"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar Marianela"
          }
        }
      ],
      "espera": {
        "etiqueta": "Nota sobre Niebla",
        "valor": "Releer el capítulo 3"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Ordena las lecturas pendientes por título sin modificar el array original, con `toSorted` o con una copia.
2. Cuando quites todos los libros, muestra «No te queda nada pendiente» en lugar de la lista vacía. Cuidado con el 0 de la lección 10.
3. Cambia la `key` por el índice, repite a mano la prueba del ejercicio y explica con tus palabras qué pasa con la nota de Niebla.
4. Añade un botón «Proponer Nada» que añada a la lista *Nada*, de Carmen Laforet, con un id creado con `crypto.randomUUID()` en el momento de pulsarlo. Pista: igual que `quitar` usa `filter`, añadir es `setLibros([...libros, nuevoLibro])`; la lección 21 lo explica a fondo. Escribe notas, propón el libro y comprueba que ninguna nota cambia de sitio.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Rendering Lists",
      "descripcion": "La página de react.dev: map y filter, de dónde sacar la key, sus reglas y por qué React la necesita.",
      "url": "https://react.dev/learn/rendering-lists",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Preserving and Resetting State",
      "descripcion": "Lo que se adelanta aquí, a fondo: por qué el estado va pegado a la posición y a la key, y cómo usar la key para reiniciar un componente. Es la lección 26.",
      "url": "https://react.dev/learn/preserving-and-resetting-state",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Rendering a list of Fragments",
      "descripcion": "La referencia de Fragment, con el caso de una lista en la que cada elemento son varios nodos.",
      "url": "https://react.dev/reference/react/Fragment#rendering-a-list-of-fragments",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Array.prototype.filter()",
      "descripcion": "La referencia de filter en español, para encadenarlo con map sin dudas.",
      "url": "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/filter",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Crypto: randomUUID() method",
      "descripcion": "Cómo generar identificadores únicos en el navegador, con sus requisitos de contexto seguro.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID",
      "etiqueta": "MDN"
    }
  ]
}
```
