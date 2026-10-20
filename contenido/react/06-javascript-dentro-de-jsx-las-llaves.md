# JavaScript dentro de JSX: las llaves

- **Módulo:** Qué es React y primeros pasos
- **Slug:** `javascript-dentro-de-jsx-las-llaves` (autogenerado del título)
- **Orden:** 60
- **Fuentes:** [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) — ver `contenido/react/TEMARIO.md` #6

---

## Qué es y para qué sirve

En la lección anterior, casi todo lo que había dentro del JSX era fijo: el texto y los atributos eran exactamente los que escribías. Una interfaz de verdad enseña datos que cambian: la película de esta noche, su sala, cuántas butacas quedan. **Las llaves `{}` abren una ventana a JavaScript en mitad del JSX**: lo que pones dentro se evalúa, y su resultado es lo que aparece en la página.

De hecho, ya las usaste en la lección 5 sin que se llamaran así: `{' '}` es una cadena de JavaScript con un espacio, y `{/* ... */}`, un comentario de JavaScript, los dos entre llaves.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Una sesión de la cartelera, con datos",
  "codigo": "const sesion = {\n  pelicula: 'Mareas de otoño',\n  sala: 3,\n  fecha: '2026-10-20',\n  hora: '19:45',\n}\n\nexport default function App() {\n  return (\n    <article className=\"sesion\">\n      <h2>{sesion.pelicula}</h2>\n      <p>\n        Sala {sesion.sala} · <time dateTime={`${sesion.fecha}T${sesion.hora}`}>{sesion.hora}</time>\n      </p>\n    </article>\n  )\n}",
  "css": ".sesion {\n  max-width: 22rem;\n  padding: 1rem;\n  border-radius: 12px;\n  background: #1f1b2e;\n  color: #ffd166;\n  font-family: system-ui, sans-serif;\n}\n\n.sesion h2 {\n  margin: 0 0 0.5rem;\n}",
  "anotaciones": [
    {
      "fragmento": "const sesion = {",
      "nota": "Los datos viven en JavaScript, fuera del JSX. Aquí son un objeto escrito a mano; más adelante llegarán de las props, del estado o de una petición."
    },
    {
      "fragmento": "<h2>{sesion.pelicula}</h2>",
      "nota": "En el contenido de una etiqueta, unas llaves se sustituyen por el valor de lo que hay dentro: aquí, el título de la película."
    },
    {
      "fragmento": "dateTime={`${sesion.fecha}T${sesion.hora}`}",
      "nota": "Como valor de un atributo, las llaves ocupan el sitio de las comillas. Dentro va una plantilla de texto de JavaScript, y el atributo queda como 2026-10-20T19:45: la fecha en un formato que entienden las máquinas."
    },
    {
      "fragmento": "Sala {sesion.sala}",
      "nota": "Un número se pinta como texto, sin más. Si sesion.sala valiera 5, el párrafo diría «Sala 5» sin tocar el JSX."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

El JSX describe la forma de la sesión una sola vez, y los datos rellenan los huecos. Cuando en el módulo 3 esos datos cambien con el estado, React volverá a evaluar las llaves y la página se pondrá al día sola.

## Comillas para texto fijo, llaves para JavaScript

El valor de un atributo se puede escribir de dos maneras. **Entre comillas, es un texto fijo**: `placeholder="Mareas de otoño"` vale exactamente eso. **Entre llaves, es una expresión de JavaScript**: `placeholder={peliculaDestacada}` vale lo que contenga la variable.

Dentro de unas comillas no se evalúa nada, ni siquiera unas llaves: `placeholder="Por ejemplo, {peliculaDestacada}"` enseña las llaves tal cual. Para mezclar texto fijo y datos en un atributo, usa una plantilla de texto dentro de las llaves:

```jsx
<input placeholder={`Por ejemplo, ${peliculaDestacada}`} />
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos atributos que no dicen lo que parece",
  "consigna": "El campo enseña unas llaves en lugar de una película, y el botón sale desactivado aunque pone disabled=\"false\". Mira la consola y arregla los dos atributos con llaves.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './buscador.css'\n\nconst cine = 'Cine Mirador'\nconst peliculaDestacada = 'Mareas de otoño'\n\nexport default function App() {\n  return (\n    <section className=\"buscador\">\n      <h2>Cartelera del {cine}</h2>\n      <label htmlFor=\"titulo\">Película</label>\n      <input id=\"titulo\" type=\"text\" placeholder=\"Por ejemplo, {peliculaDestacada}\" />\n      <button type=\"button\" disabled=\"false\">\n        Buscar sesiones\n      </button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "buscador.css",
      "codigo": ".buscador {\n  max-width: 22rem;\n  padding: 1rem;\n  border: 1px solid #d6cfe6;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\n.buscador label {\n  display: block;\n  font-weight: 600;\n}\n\n.buscador input {\n  box-sizing: border-box;\n  width: 100%;\n  margin: 0.25rem 0 0.75rem;\n  padding: 0.4rem;\n  font: inherit;\n}\n\n.buscador button {\n  padding: 0.5rem 0.9rem;\n  border: 0;\n  border-radius: 8px;\n  background: #5b3f8c;\n  color: white;\n  font: inherit;\n}\n\n.buscador button:disabled {\n  background: #c9c2d6;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El botón sale desactivado porque `disabled="false"` le pasa el **texto** `"false"`, y a un atributo booleano de HTML no le importa lo que diga su valor: solo si está o no está. React te avisa en la consola:

```text
Received the string `false` for the boolean attribute `disabled`. The browser will interpret it as a truthy value. Did you mean disabled={false}?
```

Con llaves, `disabled={false}` es el booleano `false`, y React no pone el atributo. Con los números pasa algo parecido, aunque sin consecuencias en el HTML: `min="1"` y `min={1}` acaban igual, porque los atributos de HTML siempre son texto. Cuando pases datos a tus propios componentes, en la lección 8, ya no será lo mismo recibir el texto `"1"` que el número `1`.

## Dónde pueden ir las llaves, y dónde no

Las llaves solo tienen dos sitios en JSX:

1. **Como contenido de una etiqueta**: `<h2>{sesion.pelicula}</h2>`.
2. **Como valor de un atributo, justo después del `=`**: `dateTime={fechaSesion}`.

No sirven para el nombre de una etiqueta ni para el nombre de un atributo:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "const sala = 3\nconst etiqueta = 'h2'\nconst atributo = 'title'\n\n// Sí: como contenido y como valor de un atributo\n<p title={`Sala ${sala}`}>Sala {sala}</p>\n\n// No: como nombre de una etiqueta\n<{etiqueta}>Cartelera</{etiqueta}>\n\n// No: como nombre de un atributo\n<p {atributo}=\"Sala 3\">Sesión</p>\n\n// Así sí: una variable con mayúscula inicial hace de etiqueta\nconst Titulo = etiqueta\n<Titulo>Cartelera</Titulo>",
  "anotaciones": [
    {
      "fragmento": "<p title={`Sala ${sala}`}>Sala {sala}</p>",
      "nota": "Los dos sitios válidos: el contenido de la etiqueta y el valor de un atributo, justo después del =."
    },
    {
      "fragmento": "<{etiqueta}>Cartelera</{etiqueta}>",
      "nota": "El nombre de una etiqueta se escribe tal cual. Aquí, tanto el editor de esta web como Vite responden con «Unexpected token»."
    },
    {
      "fragmento": "<p {atributo}=\"Sala 3\">Sesión</p>",
      "nota": "Tampoco el nombre de un atributo. El editor de esta web dice «Unexpected token, expected \"...\"»: en esa posición, JSX solo admite unas llaves con tres puntos dentro, como {...datos}, que pasan de golpe todas las propiedades de un objeto. Lo verás en la lección 8."
    },
    {
      "fragmento": "<Titulo>Cartelera</Titulo>",
      "nota": "Si de verdad necesitas una etiqueta variable, guárdala en una variable que empiece por mayúscula: JSX usa su valor como nombre. Aquí pinta un h2."
    }
  ]
}
```

## Cualquier expresión: operaciones, funciones y plantillas de texto

Entre llaves cabe **cualquier expresión de JavaScript**, es decir, cualquier trozo de código que produce un valor: una variable, una operación, una llamada a una función o a un método, una plantilla de texto, un ternario... Este bloque calcula la compra entera a partir de los datos de la película:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Unas entradas que se calculan solas",
  "consigna": "Cambia entradas a 1, o la duración, y mira cómo se recalcula todo. Después cambia {formatearEuros(pelicula.precio * entradas)} por {pelicula.precio * entradas}, sin formatear, y compara.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './entradas.css'\n\nconst pelicula = {\n  titulo: 'Mareas de otoño',\n  duracionMinutos: 107,\n  precio: 7.85,\n}\nconst entradas = 3\n\nfunction formatearEuros(cantidad) {\n  return cantidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })\n}\n\nexport default function App() {\n  const horas = Math.floor(pelicula.duracionMinutos / 60)\n  const minutos = pelicula.duracionMinutos % 60\n\n  return (\n    <article className=\"compra\">\n      <h2>{pelicula.titulo.toUpperCase()}</h2>\n      <p>Duración: {horas} h {minutos} min</p>\n      <p>\n        {entradas} {entradas === 1 ? 'entrada' : 'entradas'} × {formatearEuros(pelicula.precio)}\n      </p>\n      <p className=\"total\">Total: {formatearEuros(pelicula.precio * entradas)}</p>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "entradas.css",
      "codigo": ".compra {\n  max-width: 22rem;\n  padding: 1rem 1.25rem;\n  border: 2px dashed #5b3f8c;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\n.compra h2 {\n  margin: 0 0 0.5rem;\n  letter-spacing: 0.05em;\n}\n\n.total {\n  font-size: 1.25rem;\n  font-weight: 700;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Sin formatear, el total sale `23.549999999999997`: JavaScript calcula con decimales binarios, y además escribe los decimales con punto. `toLocaleString('es-ES', ...)` lo deja como lo leería cualquiera, «23,55 €». Un detalle que conviene saber si un día comparas textos: entre el número y el símbolo del euro no pone un espacio normal, sino uno de no separación (`\u00A0`), para que nunca queden en líneas distintas.

Fíjate también en `horas` y `minutos`: son cálculos con nombre propio, y viven en constantes antes del `return`. **Si una expresión no cabe cómoda en una línea, sácala del JSX** y ponle nombre: el marcado se lee mejor y el cálculo también.

## Expresiones sí, sentencias no

Lo que no cabe entre llaves son las **sentencias**: `if`, `for`, `while`, `const`... Si escribes `{if (butacasLibres > 0) 'Quedan butacas'}`, ni el editor de esta web ni Vite pasan de ahí: los dos responden «Unexpected token».

¿Por qué? Por lo que hay debajo de JSX. Cada elemento se convierte en una llamada a una función con un objeto, y lo que escribes entre llaves acaba copiado tal cual dentro de ese objeto: como el valor de una propiedad o como un elemento de un array. Ahí solo cabe algo que produzca un valor, igual que en JavaScript normal no puedes escribir `const datos = { aviso: if (butacasLibres > 0) ... }`. Compruébalo en la pestaña «JavaScript generado»:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Adónde van a parar las llaves",
  "consigna": "Abre la pestaña JavaScript generado y busca cada cosa que estaba entre llaves: aparece copiada tal cual, como valor de title o dentro del array children. Después sustituye el ternario por {if (sesion.butacasLibres > 0) { ... }} y mira el error.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "const sesion = { pelicula: 'Mareas de otoño', sala: 3, butacasLibres: 12 }\n\nexport default function App() {\n  return (\n    <p className=\"aviso\" title={`Sala ${sesion.sala}`}>\n      {sesion.pelicula}: {sesion.butacasLibres > 0 ? `quedan ${sesion.butacasLibres} butacas` : 'completo'}\n    </p>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true
}
```

Así que, cuando necesites decidir o repetir algo:

- **Calcula antes del `return`.** Fuera del JSX estás en una función normal y puedes usar `if`, `for` o lo que haga falta. Guardas el resultado en una variable y la pintas con llaves.
- **Un ternario, `condición ? a : b`**, cuando dentro del JSX tienes que elegir entre dos valores. La lección 10 trata a fondo cómo mostrar una cosa u otra, incluido el operador `&&` y sus trampas.
- **Para listas, `map`**, que es una expresión y devuelve un array de elementos. Lo verás en la lección 11.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Decidir sin meter sentencias en el JSX",
  "codigo": "const pelicula = {\n  titulo: 'Mareas de otoño',\n  edadMinima: 12,\n  vose: true,\n  idiomas: ['español', 'inglés'],\n}\n\nexport default function App() {\n  let calificacion = 'Apta para todos los públicos'\n  if (pelicula.edadMinima > 0) {\n    calificacion = `No recomendada para menores de ${pelicula.edadMinima} años`\n  }\n\n  return (\n    <article>\n      <h2>{pelicula.titulo}</h2>\n      <p>{calificacion}</p>\n      <p>{pelicula.vose ? 'Versión original subtitulada' : 'Versión doblada'}</p>\n      <p>Idiomas: {pelicula.idiomas.join(' · ')}</p>\n    </article>\n  )\n}",
  "css": "article { font-family: system-ui, sans-serif; }",
  "anotaciones": [
    {
      "fragmento": "if (pelicula.edadMinima > 0) {",
      "nota": "Antes del return estás en una función normal: aquí vale el if de siempre. El resultado se guarda en una variable."
    },
    {
      "fragmento": "<p>{calificacion}</p>",
      "nota": "Y el JSX solo pinta la variable. Es la forma más legible cuando la decisión tiene varias ramas."
    },
    {
      "fragmento": "{pelicula.vose ? 'Versión original subtitulada' : 'Versión doblada'}",
      "nota": "El ternario sí es una expresión: devuelve uno de los dos textos. Para elegir entre dos valores dentro del JSX, es lo habitual."
    },
    {
      "fragmento": "{pelicula.idiomas.join(' · ')}",
      "nota": "join convierte el array en un único texto. Para pintar cada idioma como un elemento de una lista hace falta map, en la lección 11."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Dobles llaves: objetos y estilos en línea

A veces el valor de un atributo es un objeto. El caso más habitual es `style`, que en JSX no recibe un texto como en HTML, sino **un objeto con las propiedades de CSS**. De ahí las dobles llaves de `style={{ ... }}`: no son una sintaxis especial, son las llaves de JSX con un objeto literal dentro. Este código hace lo mismo:

```jsx
const colores = { backgroundColor: '#0b5394', color: '#ffffff' }

<span style={colores}>3D</span>
```

Las reglas de ese objeto, comprobadas con React 19.3:

- **Las propiedades van en camelCase**, como en `elemento.style` del DOM: `backgroundColor`, no `background-color`.
- **A un número, React le añade `px`**: `padding: 8` es `8px`. Salvo en las propiedades que no llevan unidad, como `lineHeight`, `opacity`, `zIndex`, `flexGrow` o `fontWeight`, donde el número se queda tal cual.
- **Para cualquier otra unidad, un texto**: `width: '72%'`, `marginTop: '1rem'`.

react.dev recomienda usar `style` solo para los estilos que dependen de datos, como el color de cada formato de proyección, y clases con `className` para todo lo demás.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Colores y medidas que salen de los datos",
  "consigna": "Cambia el color del formato y la ocupación, y mira cómo responden la etiqueta y la barra. Después cambia la plantilla de la barra por width: sesion.ocupacion, sin el %: React le pone px y la barra mide 72 píxeles en vez del 72 % del ancho.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './sala.css'\n\nconst sesion = {\n  pelicula: 'Mareas de otoño',\n  formato: { nombre: '3D', fondo: '#0b5394', texto: '#ffffff' },\n  ocupacion: 72,\n}\n\nexport default function App() {\n  return (\n    <article className=\"sesion\">\n      <h2>\n        <span className=\"formato\" style={{ backgroundColor: sesion.formato.fondo, color: sesion.formato.texto }}>\n          {sesion.formato.nombre}\n        </span>{' '}\n        {sesion.pelicula}\n      </h2>\n      <p>Ocupación de la sala: {sesion.ocupacion} %</p>\n      <div className=\"barra\" aria-hidden=\"true\">\n        <div className=\"barra__relleno\" style={{ width: `${sesion.ocupacion}%` }} />\n      </div>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "sala.css",
      "codigo": ".sesion {\n  max-width: 22rem;\n  font-family: system-ui, sans-serif;\n}\n\n.formato {\n  padding: 0.1rem 0.5rem;\n  border-radius: 6px;\n  font-size: 0.9em;\n}\n\n.barra {\n  height: 0.75rem;\n  border-radius: 999px;\n  background: #e5e1ee;\n  overflow: hidden;\n}\n\n.barra__relleno {\n  height: 100%;\n  background: #5b3f8c;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Si escribes una propiedad con guion, como `'background-color'`, el estilo llega a aplicarse, pero React avisa: `Unsupported style property background-color. Did you mean backgroundColor?`. Y si escribes `style` como en HTML, con un texto, la página entera deja de pintarse con el error que viste en la lección 5: ``The `style` prop expects a mapping from style properties to values, not a string.``

## Qué se puede pintar entre llaves

Como contenido de una etiqueta, las llaves aceptan textos, números, elementos de JSX y arrays de esas cosas. Con el resto de valores, React hace esto:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Qué pinta React con cada valor",
  "codigo": "export default function App() {\n  return (\n    <ul>\n      <li>true: [{true}]</li>\n      <li>false: [{false}]</li>\n      <li>null: [{null}]</li>\n      <li>undefined: [{undefined}]</li>\n      <li>cadena vacía: [{''}]</li>\n      <li>0: [{0}]</li>\n      <li>NaN: [{NaN}]</li>\n      <li>array: [{['Sala ', 3, ' · 19:45']}]</li>\n    </ul>\n  )\n}",
  "css": "ul { font-family: ui-monospace, monospace; }",
  "anotaciones": [
    {
      "fragmento": "<li>true: [{true}]</li>",
      "nota": "Los corchetes son texto normal, para que se vea qué queda entre ellos. true y false no pintan nada, ni la palabra ni un hueco: por eso puedes meter una condición en el JSX sin que aparezca un false en pantalla."
    },
    {
      "fragmento": "<li>null: [{null}]</li>",
      "nota": "null y undefined tampoco pintan nada, igual que la cadena vacía. Un componente que devuelve null no muestra nada."
    },
    {
      "fragmento": "<li>0: [{0}]</li>",
      "nota": "El 0 sí se pinta, aunque en un if cuente como falso. Es el origen de un fallo clásico con && que verás en la lección 10. NaN también sale, como texto."
    },
    {
      "fragmento": "<li>array: [{['Sala ', 3, ' · 19:45']}]</li>",
      "nota": "Un array pinta sus elementos uno detrás de otro, textos y números mezclados. Es la base de las listas con map de la lección 11."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

El caso más traicionero es el de los booleanos, porque parecen un dato como cualquier otro:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const pelicula = { titulo: 'Mareas de otoño', vose: true }\n\nexport default function App() {\n  return <p>Versión original: {pelicula.vose}</p>\n}",
  "opciones": [
    "Versión original: true",
    "Versión original: sí",
    "Solo «Versión original:», sin nada detrás",
    "Un error en la consola"
  ],
  "correcta": 2,
  "explicacion": "true no pinta nada, ni siquiera la palabra true, y React no avisa: para él es un valor normal. Para enseñar un booleano, conviértelo tú en texto: {pelicula.vose ? 'sí' : 'no'}."
}
```

**Un objeto, en cambio, rompe la página.** React no sabe cómo convertir un objeto en texto, y no se lo inventa:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un objeto donde iba un texto",
  "consigna": "La vista previa enseña un error en lugar de la sesión. Léelo: dice qué ha encontrado React, un objeto, y con qué claves. Cambia {pelicula} por {pelicula.titulo}.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "const pelicula = { titulo: 'Mareas de otoño', sala: 3, hora: '19:45' }\n\nexport default function App() {\n  return (\n    <section>\n      <h2>Ahora en cartel: {pelicula}</h2>\n      <p>Sala {pelicula.sala}, a las {pelicula.hora}</p>\n    </section>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El mensaje completo es este:

```text
Objects are not valid as a React child (found: object with keys {titulo, sala, hora}). If you meant to render a collection of children, use an array instead.
```

Las claves que enumera son la mejor pista para encontrar el culpable. La segunda frase habla de arrays: si lo que querías era pintar varias cosas, lo que hace falta es un array, como en la lección 11. Una fecha también es un objeto: `{new Date()}` da el mismo error, con `(found: [object Date])`. Para enseñarla, conviértela antes en texto, por ejemplo con `toLocaleDateString('es-ES')`.

## Lo que conviene no confundir

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Las dobles llaves son una sintaxis especial de React",
      "realidad": "Son las llaves de JSX con un objeto literal dentro. style={{ color: \"red\" }} es lo mismo que guardar el objeto en una constante y escribir style={estilos}."
    },
    {
      "mito": "Entre llaves puedo escribir cualquier código",
      "realidad": "Solo expresiones, trozos de código que producen un valor. Un if, un for o un const no lo son: van antes del return, y en el JSX pintas su resultado."
    },
    {
      "mito": "Si algo no sale en pantalla, es que vale undefined",
      "realidad": "También puede valer true, false, null o una cadena vacía: ninguno pinta nada. Y al revés, un 0 sí sale aunque cuente como falso."
    },
    {
      "mito": "Un número en style siempre son píxeles",
      "realidad": "Casi siempre. Las propiedades sin unidad, como lineHeight, opacity, zIndex o fontWeight, se quedan con el número tal cual."
    }
  ]
}
```

## Errores típicos

**Llaves dentro de comillas.** `title="Sala {sala}"` no pinta la sala, sino las llaves tal cual. O llaves, o comillas: para mezclar, una plantilla de texto dentro de las llaves.

**Pintar una función en vez de llamarla.** Es fácil olvidar los paréntesis:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function formatearDuracion(minutos) {\n  return `${Math.floor(minutos / 60)} h ${minutos % 60} min`\n}\n\nconst duracion = 107\n\nexport default function App() {\n  return <p>Duración: {formatearDuracion}</p>\n}",
  "opciones": [
    "Duración: 1 h 47 min",
    "Solo «Duración:», y un error en la consola",
    "El código de la función, como texto"
  ],
  "correcta": 1,
  "explicacion": "Sin paréntesis no llamas a la función: le pasas la función misma a React, y una función no se pinta. React deja el hueco vacío y avisa en la consola con «Functions are not valid as a React child». Lo correcto es {formatearDuracion(duracion)}."
}
```

El aviso completo propone las dos causas más probables, devolver un componente sin escribirlo como etiqueta o no llamar a la función, y señala dónde está:

```text
Functions are not valid as a React child. This may happen if you return formatearDuracion instead of <formatearDuracion /> from render. Or maybe you meant to call this function rather than return it.
  <p>{formatearDuracion}</p>
```

**Unas solas llaves en `style`.** `style={color: 'red'}` no es un objeto dentro de unas llaves, sino unas llaves con `color: 'red'` dentro, que no es una expresión. El editor de esta web dice «Unexpected token» y Vite, más concreto, `` Expected `}` but found `:` ``. Hacen falta las dos: `style={{ color: 'red' }}`.

**`disabled="false"`.** El texto `"false"` no está vacío, así que el botón se desactiva. Los booleanos, siempre entre llaves: `disabled={false}`.

**Meterlo todo en el JSX.** Un JSX lleno de cálculos encadenados se lee mal y se depura peor. Si una expresión no cabe en una línea, sácala a una constante antes del `return`.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Completa la ficha de la sesión",
  "consigna": "La ficha está a medio hacer: unos datos salen como texto literal y otros faltan. Con llaves, haz que el título diga «Mareas de otoño (2026)», calcula antes del return a qué hora termina la sesión (su hora más la duración, con aMinutos y aHora), formatea el precio con formatearEuros, haz que la versión original se lea «sí» o «no» y arregla el nombre accesible del botón. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './ficha.css'\n\nconst pelicula = {\n  titulo: 'Mareas de otoño',\n  anio: 2026,\n  duracionMinutos: 107,\n  precio: 7.85,\n  vose: true,\n  sala: 3,\n  hora: '19:45',\n}\n\nfunction aMinutos(hora) {\n  const [horas, minutos] = hora.split(':').map(Number)\n  return horas * 60 + minutos\n}\n\nfunction aHora(minutosTotales) {\n  const horas = Math.floor(minutosTotales / 60) % 24\n  const minutos = minutosTotales % 60\n  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`\n}\n\nfunction formatearEuros(cantidad) {\n  return cantidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })\n}\n\nexport default function App() {\n  // Calcula aquí a qué hora termina la sesión\n\n  return (\n    <article className=\"ficha\">\n      <h2>pelicula.titulo (pelicula.anio)</h2>\n      <p>Sala {pelicula.sala} · {pelicula.hora}</p>\n      <p>Termina a las {/* la hora de fin, por ejemplo «21:32» */}</p>\n      <p>Precio: {/* el precio, con formatearEuros */}</p>\n      <p>Versión original: {pelicula.vose}</p>\n      <button type=\"button\" aria-label=\"Comprar entradas para {pelicula.titulo}, sala {pelicula.sala}\">\n        Comprar entradas\n      </button>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "ficha.css",
      "codigo": ".ficha {\n  max-width: 22rem;\n  padding: 1rem 1.25rem;\n  border: 1px solid #d6cfe6;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\n.ficha h2 {\n  margin: 0 0 0.5rem;\n}\n\n.ficha button {\n  padding: 0.5rem 0.9rem;\n  border: 0;\n  border-radius: 8px;\n  background: #5b3f8c;\n  color: white;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "El título dice «Mareas de otoño (2026)»",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Mareas de otoño (2026)"
      }
    },
    {
      "descripcion": "La hora de fin sale calculada: «Termina a las 21:32»",
      "pasos": [],
      "espera": {
        "texto": "Termina a las 21:32"
      }
    },
    {
      "descripcion": "El precio sale en euros, con coma: «Precio: 7,85 €»",
      "pasos": [],
      "espera": {
        "texto": "Precio: 7,85 €"
      }
    },
    {
      "descripcion": "La versión original se lee como texto: «Versión original: sí»",
      "pasos": [],
      "espera": {
        "texto": "Versión original: sí"
      }
    },
    {
      "descripcion": "El botón se anuncia como «Comprar entradas para Mareas de otoño, sala 3»",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Comprar entradas para Mareas de otoño, sala 3"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Pon la hora de la sesión dentro de un `<time>` con su `dateTime`, construido con una plantilla de texto como en el ejemplo del principio. Inventa la fecha.
2. Añade una constante `entradas` y enseña el total con `formatearEuros`. Antes, pinta el total sin formatear con `entradas = 3`: ¿qué sale?
3. Da a `pelicula` un `formato` con nombre y color, y píntalo como una etiqueta de color con `style`, como en el bloque de las dobles llaves.
4. Añade la duración y haz que se lea «107 min» cuando la película dure menos de dos horas y «2 h 5 min» cuando dure más, decidiéndolo con un `if` antes del `return`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "JavaScript in JSX with Curly Braces",
      "descripcion": "La página de react.dev en la que se basa esta lección, con tres retos al final.",
      "url": "https://react.dev/learn/javascript-in-jsx-with-curly-braces",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Applying CSS styles",
      "descripcion": "Cómo se usan className y style en React, y cuándo conviene cada uno.",
      "url": "https://react.dev/reference/react-dom/components/common#applying-css-styles",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Conditional Rendering",
      "descripcion": "El adelanto de la lección 10: ternarios, && y cómo no pintar nada.",
      "url": "https://react.dev/learn/conditional-rendering",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Template literals",
      "descripcion": "Las plantillas de texto de JavaScript, con sus ${}, que aparecen en casi todos los atributos calculados.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Intl.NumberFormat",
      "descripcion": "Lo que hay detrás de toLocaleString: formatear números, monedas y porcentajes según el idioma.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Expressions and operators",
      "descripcion": "Qué cuenta como expresión en JavaScript: justo lo que cabe entre las llaves de JSX.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators",
      "etiqueta": "MDN"
    }
  ]
}
```
