# JSX: marcado con reglas propias

- **Módulo:** Qué es React y primeros pasos
- **Slug:** `jsx-marcado-con-reglas-propias` (autogenerado del título)
- **Orden:** 50
- **Fuentes:** [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) — ver `contenido/react/TEMARIO.md` #5

---

## Qué es y para qué sirve

Desde la lección 1 has visto cosas como `<h1>Total: {pulsaciones}</h1>` dentro de un `return`. Eso que parece HTML metido en JavaScript es **JSX**, una extensión de la sintaxis de JavaScript para describir marcado. El navegador no lo entiende: antes de ejecutarse, un compilador lo traduce a JavaScript normal. En tu proyecto lo hace Vite; en los editores de esta web, una herramienta más ligera llamada Sucrase. Qué sale exactamente de esa traducción lo verás en la lección 7.

¿Por qué mezclar marcado y lógica en el mismo archivo? Durante años, la web se organizó por tecnologías: el contenido en el `.html`, el diseño en el `.css` y el comportamiento en el `.js`. Pero en una interfaz interactiva es la lógica la que decide qué se ve: qué mensaje aparece, qué botón está desactivado, cuántas filas tiene una tabla. React reparte el código de otra manera: **por piezas de la interfaz, no por tecnologías**. Cada componente guarda juntos su marcado y la lógica que lo pinta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos formas de repartir el código",
  "roles": [
    {
      "etiqueta": "Por tecnologías",
      "rol": "HTML, CSS y JavaScript separados",
      "descripcion": "El formulario de la ficha vive en el HTML y su lógica en un .js aparte. Para cambiar un botón tocas dos archivos que no se ven entre sí, y nada te avisa si dejan de coincidir."
    },
    {
      "etiqueta": "Por componentes",
      "rol": "React con JSX",
      "descripcion": "FichaPlanta.jsx guarda el marcado de la ficha y la lógica que lo pinta. Cambiarla no toca la cabecera ni el carrito, que son otros componentes."
    }
  ]
}
```

JSX y React son dos cosas distintas que casi siempre van juntas: JSX es solo sintaxis, y React es la biblioteca que usa lo que sale de ella. Lo importante en esta lección es otra cosa: **JSX se parece a HTML, pero es más estricto**. El navegador perdona casi todo en un `.html`, como etiquetas sin cerrar o atributos mal escritos; un compilador, no. Si tu JSX no es válido, la página ni siquiera arranca.

El resto de la lección son esas reglas. Verás los errores de sintaxis con dos voces que no siempre coinciden: la del editor de esta web y la de Vite en tu proyecto.

## Anatomía de un elemento JSX

Un elemento JSX tiene las mismas partes que una etiqueta de HTML: el nombre, los atributos, el contenido y el cierre. En React, a los atributos se les llama **props**; en la lección 8 verás cómo se los pasas a tus propios componentes.

```laboratorio
{
  "tipo": "diagrama-etiqueta",
  "titulo": "Un label en JSX",
  "partes": [
    {
      "texto": "<label",
      "rol": "apertura"
    },
    {
      "texto": "htmlFor",
      "rol": "atributo-nombre"
    },
    {
      "texto": "=",
      "rol": "simbolo"
    },
    {
      "texto": "\"correo\"",
      "rol": "atributo-valor"
    },
    {
      "texto": "className",
      "rol": "atributo-nombre"
    },
    {
      "texto": "=",
      "rol": "simbolo"
    },
    {
      "texto": "\"etiqueta\"",
      "rol": "atributo-valor"
    },
    {
      "texto": ">",
      "rol": "simbolo"
    },
    {
      "texto": "Tu correo",
      "rol": "contenido"
    },
    {
      "texto": "</label>",
      "rol": "cierre"
    }
  ]
}
```

Dos detalles ya delatan que esto no es HTML: el atributo `for` se escribe `htmlFor`, y `class` se escribe `className`. Y aunque aquí todo es texto fijo, con llaves puedes meter JavaScript tanto en un valor como en el contenido: `htmlFor={idCampo}`, `<h2>{planta.nombre}</h2>`. Las llaves tienen lección propia, la siguiente. Ahora, las reglas.

## Regla 1: un solo elemento raíz

Un componente devuelve **un único elemento**. Si escribes dos hermanos seguidos sin nada que los envuelva, el código no compila. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos elementos sueltos no compilan",
  "consigna": "El editor marca un error de sintaxis y la vista previa no puede arrancar. Envuelve el h1 y el p entre <> y </>. Cuando aparezca la ficha, abre la pestaña JavaScript generado.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "export default function App() {\n  return (\n    <h1>Albahaca</h1>\n    <p>Riego cada dos días, siempre por la mañana.</p>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true
}
```

El editor de esta web solo dice `Unexpected token, expected ","`, y señala la línea del segundo elemento. Vite, en tu proyecto, lo explica y hasta propone la solución. Esto es lo que enseña `npm run dev`, en la terminal y sobre la propia página (entre las dos líneas, marca el trozo de código afectado):

```text
[PARSE_ERROR] Adjacent JSX elements must be wrapped in an enclosing tag.
Help: Did you want a JSX fragment `<>...</>`?
```

**¿Por qué esta regla?** Porque JSX no es texto que se pega en la página: cada elemento se convierte en una llamada a una función que devuelve un objeto de JavaScript. Dos elementos seguidos serían dos objetos sueltos, y `return` solo devuelve un valor: igual que no puedes escribir `return 3 4`, no puedes devolver dos elementos sin agruparlos. Si has arreglado el bloque de arriba, la pestaña «JavaScript generado» lo enseña: una sola llamada que lleva dentro a las otras dos. La lección 7 desmonta esa traducción entera.

**Fragment: agrupar sin añadir nada al HTML.** Para envolver tienes dos opciones. Un `<div>` funciona, pero añade una caja de verdad al HTML. **Un Fragment, `<>` y `</>`, agrupa sin dejar rastro**: en el DOM solo aparecen sus hijos. La diferencia importa cuando el padre espera unos hijos concretos, como una lista, una tabla o un contenedor flex o grid:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un div de más rompe la fila",
  "consigna": "CuidadosDeVerano devuelve dos li envueltos en un div, y la fila trata ese div como una sola pieza: sus dos etiquetas salen apiladas. Cambia <div> por <> y </div> por </>, y las tres quedan en fila.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import CuidadosDeVerano from './CuidadosDeVerano'\nimport './cuidados.css'\n\nexport default function App() {\n  return (\n    <section>\n      <h2>Cuidados de la albahaca</h2>\n      <ul className=\"cuidados\">\n        <li>Sol directo por la mañana</li>\n        <CuidadosDeVerano />\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "CuidadosDeVerano.jsx",
      "codigo": "export default function CuidadosDeVerano() {\n  return (\n    <div>\n      <li>Riego al atardecer</li>\n      <li>Sombra a mediodía</li>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "cuidados.css",
      "codigo": "section {\n  font-family: system-ui, sans-serif;\n}\n\n.cuidados {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.cuidados li {\n  padding: 0.4rem 0.8rem;\n  border-radius: 999px;\n  background: #e3f1dc;\n}\n"
    }
  ],
  "archivoInicial": "CuidadosDeVerano.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

React no avisa de ese `<div>`, pero el HTML resultante tampoco es válido: una `<ul>` solo admite `<li>` como hijos. Con el Fragment, el DOM queda exactamente igual que si hubieras escrito los tres `<li>` seguidos.

`<>...</>` es la forma corta de `<Fragment>...</Fragment>`, que se importa de `react`. La forma larga solo hace falta cuando tienes que pasarle algo al Fragment: una `key` dentro de una lista (lección 11) o, desde React 19.3, una `ref` (lección 35).

## Regla 2: cierra todas las etiquetas

HTML tiene etiquetas que nunca se cierran, las **vacías** (`<img>`, `<br>`, `<input>`, `<hr>`), y otras cuyo cierre es opcional, como `</li>`, `</p>` o `</td>`. **En JSX, toda etiqueta se cierra**: las vacías, con una barra antes del `>`, y las demás, con su etiqueta de cierre.

```jsx
<img src="albahaca.jpg" alt="Maceta de albahaca en una ventana" />
<br />
<input type="email" />
<li>Sol directo por la mañana</li>
```

Y al revés: cualquier elemento sin contenido puede cerrarse solo, aunque en HTML no sea vacío. `<div className="separador" />` es JSX válido y equivale a `<div className="separador"></div>`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  return (\n    <address>\n      Vivero Las Eras<br>\n      Calle del Huerto, 4 · Huesca\n    </address>\n  )\n}",
  "opciones": [
    "El nombre y la dirección, en dos líneas",
    "Todo en una línea, porque JSX ignora el br",
    "Nada: un error de sintaxis impide que arranque"
  ],
  "correcta": 2,
  "explicacion": "JSX no sabe que br es una etiqueta vacía: la toma por una apertura y busca su cierre. El editor de esta web responde «Unterminated JSX contents» y Vite, «Expected corresponding JSX closing tag for 'br'.». Basta con escribir <br />."
}
```

**Ojo con dónde señala el error.** Con una etiqueta sin cerrar, el compilador no se da cuenta en su línea, sino más abajo, cuando llega a un cierre que no esperaba o al final del código. El editor de esta web es el más escueto: para cualquier etiqueta sin cerrar dice `Unterminated JSX contents` y marca una línea posterior, sin decir cuál es la culpable. Vite sí la nombra (`Expected corresponding JSX closing tag for 'img'.`) y marca dos puntos del código: dónde se abrió la etiqueta (*Opened here*) y dónde esperaba su cierre. Si un trozo de HTML pegado no compila aquí, repasa tú las etiquetas vacías y las que HTML deja sin cerrar.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Este editor no comprueba el nombre del cierre",
  "contenido": "Aquí, <h1>Albahaca</div> se acepta sin error: el cierre se aplica a la última etiqueta abierta, se llame como se llame. Vite, en cambio, se para con «Expected corresponding JSX closing tag for 'h1'.». Que algo funcione en esta web no garantiza que compile en tu proyecto: comprueba que cada cierre lleva el nombre de su apertura."
}
```

## Regla 3: atributos en camelCase

Los atributos de JSX acaban siendo las claves de un objeto de JavaScript (lo verás en la pestaña «JavaScript generado» del bloque de más abajo), y React los lee con **los nombres de las propiedades del DOM**, no con los de los atributos de HTML. Esas propiedades van en camelCase: `elemento.className`, `etiqueta.htmlFor`, `campo.readOnly`. Por eso `class` se escribe `className` y `for`, `htmlFor`. Hay un motivo más: `class` y `for` son palabras reservadas de JavaScript, y en tus componentes leerás las props como variables; `const { class } = props` es un error de sintaxis.

Las conversiones que más vas a hacer:

| HTML | JSX |
|---|---|
| `class` | `className` |
| `for` | `htmlFor` |
| `tabindex` | `tabIndex` |
| `readonly` | `readOnly` |
| `maxlength` | `maxLength` |
| `autocomplete` | `autoComplete` |
| `colspan` | `colSpan` |
| `stroke-width` (SVG) | `strokeWidth` |

Los eventos también cambian: `onclick` pasa a `onClick`, pero en vez de un texto con código recibe una función. Lo verás en la lección 15.

Lo que ya es una sola palabra en minúsculas se queda igual: `id`, `src`, `alt`, `type`, `href`, `disabled`, `required`, `placeholder`... Y los atributos booleanos sin valor funcionan como en HTML: `<button disabled>` equivale a `disabled={true}`.

**¿Y si se te escapa un `class`?** Funciona, pero no te confíes. Mira la consola de este bloque:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Atributos escritos a la manera de HTML",
  "consigna": "La ficha se ve bien, pero la consola trae tres errores, uno por atributo. Antes de corregir nada, escribe algo en «Código de socio»: debería ser de solo lectura y no lo es. Corrige los tres atributos, vuelve a probar el campo (ahora sale en gris y no deja escribir) y comprueba que la consola queda limpia. En JavaScript generado verás cada atributo como una clave del objeto.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './ficha.css'\n\nexport default function App() {\n  return (\n    <section class=\"ficha\">\n      <h2>Romero</h2>\n      <p>Aguanta la sequía y pide pleno sol.</p>\n      <label for=\"socio\">Código de socio</label>\n      <input id=\"socio\" type=\"text\" placeholder=\"Te lo asigna el vivero\" readonly />\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "ficha.css",
      "codigo": ".ficha {\n  max-width: 22rem;\n  padding: 1rem;\n  border: 1px solid #c9dcc0;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\n.ficha label {\n  display: block;\n  font-weight: 600;\n}\n\n.ficha input {\n  box-sizing: border-box;\n  width: 100%;\n  margin-top: 0.25rem;\n  padding: 0.4rem;\n  font: inherit;\n}\n\n.ficha input:read-only {\n  background: #eeeeee;\n  color: #555555;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": true
}
```

Los tres mensajes tienen la misma forma:

```text
Invalid DOM property `for`. Did you mean `htmlFor`?
Invalid DOM property `readonly`. Did you mean `readOnly`?
Invalid DOM property `class`. Did you mean `className`?
```

Pero no tienen las mismas consecuencias. **`class` y `for` llegan al HTML tal cual** y el navegador los entiende: la ficha tiene su estilo y la etiqueta sigue unida a su campo. **`readonly`, escrito sin valor, desaparece**: un atributo sin valor vale `true`, y React solo sabe qué hacer con `true` en los atributos booleanos que conoce (`disabled`, `required`, `readOnly`...). Con `autofocus` en lugar de `autoFocus` pasa lo mismo. Por eso los errores de la consola se corrigen aunque la página parezca funcionar.

**La excepción: `aria-*` y `data-*`.** Estos atributos **se escriben igual que en HTML, con guiones**, y React los pasa al DOM tal cual:

```jsx
<button type="button" aria-label="Cerrar aviso" data-aviso="riego">×</button>
```

Los `aria-*` dan información a los lectores de pantalla, como viste en el temario de HTML. Los `data-*` guardan datos en el propio HTML; en React se usan poco, porque los datos ya los tienes en variables y props. Si los pasas a camelCase por inercia, se rompen: lo verás en los errores típicos.

## Comentarios en JSX

Los comentarios de HTML no valen en JSX. `<!-- ... -->` es un error de sintaxis: `Unexpected token` en el editor de esta web y `HTML comments are not allowed in modules` en Vite. **Un comentario de JSX es un comentario de JavaScript entre llaves: `{/* ... */}`.**

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Qué es un comentario y qué es texto",
  "codigo": "export default function App() {\n  return (\n    <section>\n      {/* Este comentario no llega a la página */}\n      <h2>Lavanda</h2>\n      <p>// Esto no es un comentario: se ve tal cual</p>\n      <label htmlFor=\"dias\">Días entre riegos</label>\n      <input\n        id=\"dias\"\n        // Entre atributos valen los comentarios de JavaScript\n        type=\"number\"\n        min=\"1\"\n      />\n    </section>\n  )\n}",
  "css": "section { font-family: system-ui, sans-serif; }\nlabel { display: block; font-weight: 600; }\ninput { margin-top: 0.25rem; padding: 0.3rem; font: inherit; }",
  "anotaciones": [
    {
      "fragmento": "{/* Este comentario no llega a la página */}",
      "nota": "Unas llaves abren un hueco de JavaScript y dentro va un comentario de bloque. No aparece en la página ni en el HTML que genera React."
    },
    {
      "fragmento": "<p>// Esto no es un comentario: se ve tal cual</p>",
      "nota": "En el contenido de una etiqueta escribes texto, no JavaScript: // y /* salen en pantalla tal cual. Míralo en la vista previa."
    },
    {
      "fragmento": "// Entre atributos valen los comentarios de JavaScript",
      "nota": "Entre los atributos de una etiqueta, JSX ya está leyendo JavaScript, así que valen // y /* */ sin llaves. Sirve para explicar un atributo concreto."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Espacios en blanco y saltos de línea

JSX trata los espacios a su manera, y es lo que más despista al convertir HTML. Estas son las reglas, comprobadas con React 19.3:

- **Varias líneas de texto seguidas se unen con un solo espacio**, igual que en HTML.
- **Un salto de línea entre un texto y una etiqueta desaparece entero**, sin dejar espacio. Si `Precio:` está en una línea y `<strong>` en la siguiente, salen pegados.
- **Dentro de una misma línea, los espacios se conservan**, y el navegador los junta en uno al pintar, como siempre.
- Para poner un espacio donde JSX lo quita, escribe `{' '}`: una cadena con un espacio, entre llaves.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function App() {\n  return (\n    <p>\n      Maceta de 14 cm:\n      <strong>3,50 €</strong>\n    </p>\n  )\n}",
  "opciones": [
    "Maceta de 14 cm: 3,50 €",
    "Maceta de 14 cm:3,50 €",
    "Maceta de 14 cm: y el precio en otra línea"
  ],
  "correcta": 1,
  "explicacion": "El salto de línea entre el texto y strong no deja ningún espacio: JSX recorta cada línea por los bordes y descarta los saltos que tocan una etiqueta. En HTML sí habría un espacio. Se arregla con {' '} al final de la primera línea, o escribiendo las dos cosas en la misma línea."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dónde se pierden los espacios",
  "consigna": "El primer párrafo une sus dos líneas con un espacio y el segundo pega «Precio:» al precio. Abre la pestaña JavaScript generado: cada texto es una cadena entre comillas, y ahí se ve qué espacios sobreviven. Arregla el segundo párrafo con {' '} y vuelve a mirar.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "export default function App() {\n  return (\n    <section>\n      <p>\n        Riega la albahaca\n        por la mañana.\n      </p>\n      <p>\n        Precio:\n        <strong>3,50 €</strong>\n      </p>\n      <p>Varios    espacios    en la misma línea.</p>\n    </section>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": true
}
```

## Convertir HTML que ya tienes

Tarde o temprano pegarás HTML en un componente: una plantilla, un trozo de la web antigua o el icono SVG que te pasa el equipo de diseño. Este orden funciona:

1. **Comentarios**: cambia `<!-- -->` por `{/* */}`, o bórralos.
2. **Un solo elemento raíz**: si hay varios elementos sueltos, envuélvelos en `<>` y `</>`.
3. **Cierra todo**: `/>` en las etiquetas vacías, y su cierre en `li`, `p`, `td` u `option`.
4. **camelCase**: `class`, `for` y el resto de la tabla, salvo `aria-*` y `data-*`.
5. **`style` en línea**: en JSX no es un texto sino un objeto. Si el HTML trae `style="color: red"`, la página se rompe; cómo se escribe, en la lección 6.
6. **Espacios**: repasa los saltos de línea entre texto y etiquetas.

Las entidades de HTML, como `&nbsp;`, `&copy;` o `&euro;`, siguen funcionando en el texto y en los atributos entre comillas: no hace falta tocarlas.

Para trozos largos hay conversores automáticos, como [HTML to JSX, de transform.tools](https://transform.tools/html-to-jsx), el que recomienda react.dev. Ahorran trabajo, pero conviene saber qué hacen para revisar lo que generan.

Así queda la conversión completa de la ficha de una planta. Primero, el HTML original, con lo que hay que cambiar:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!-- Ficha de producto -->\n<article class=\"planta\">\n  <img class=\"planta__foto\" src=\"tomatera.jpg\" alt=\"Tomatera con racimos de tomates verdes\">\n  <h2>Tomatera cherry</h2>\n  <p class=\"planta__precio\">Maceta de 14 cm:\n    <strong>3,50&nbsp;&euro;</strong></p>\n  <label for=\"unidades\">Unidades</label>\n  <input id=\"unidades\" type=\"number\" min=\"1\" max=\"20\">\n</article>\n<p class=\"nota\">Envío gratis a partir de 30&nbsp;&euro;</p>",
  "anotaciones": [
    {
      "fragmento": "<!-- Ficha de producto -->",
      "nota": "Un comentario de HTML: en JSX es un error de sintaxis. Se cambia por {/* Ficha de producto */} o se borra."
    },
    {
      "fragmento": "<article class=\"planta\">",
      "nota": "class pasa a className, aquí y en las otras tres etiquetas que lo llevan."
    },
    {
      "fragmento": "alt=\"Tomatera con racimos de tomates verdes\">",
      "nota": "img es una etiqueta vacía: en JSX se cierra con una barra, alt=\"...\" />. Al input de más abajo le pasa lo mismo."
    },
    {
      "fragmento": "<strong>3,50&nbsp;&euro;</strong></p>",
      "nota": "Las entidades &nbsp; y &euro; siguen valiendo en JSX. Lo que cambia es el salto de línea de antes del strong: en HTML deja un espacio después de los dos puntos y en JSX no."
    },
    {
      "fragmento": "<label for=\"unidades\">",
      "nota": "for pasa a htmlFor. El id del input se queda igual."
    },
    {
      "fragmento": "<p class=\"nota\">",
      "nota": "Un segundo elemento suelto, hermano de article. Para devolver los dos desde un componente hay que envolverlos."
    }
  ]
}
```

Y el mismo contenido como componente, funcionando:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La ficha, ya en JSX",
  "codigo": "export default function App() {\n  return (\n    <>\n      {/* Ficha de producto */}\n      <article className=\"planta\">\n        <img className=\"planta__foto\" src=\"tomatera.jpg\" alt=\"Tomatera con racimos de tomates verdes\" />\n        <h2>Tomatera cherry</h2>\n        <p className=\"planta__precio\">Maceta de 14 cm: <strong>3,50&nbsp;&euro;</strong></p>\n        <label htmlFor=\"unidades\">Unidades</label>\n        <input id=\"unidades\" type=\"number\" min=\"1\" max=\"20\" />\n      </article>\n      <p className=\"nota\">Envío gratis a partir de 30&nbsp;&euro;</p>\n    </>\n  )\n}",
  "css": ".planta {\n  max-width: 20rem;\n  padding: 1rem;\n  border: 1px solid #c9dcc0;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\n.planta__foto {\n  display: block;\n  width: 100%;\n  height: 6rem;\n  border-radius: 8px;\n  background: #e3f1dc;\n}\n\n.planta h2 {\n  margin: 0.75rem 0 0.25rem;\n}\n\n.planta__precio strong {\n  color: #2f6b2f;\n}\n\n.planta label {\n  display: block;\n  font-weight: 600;\n}\n\n.planta input {\n  width: 5rem;\n  padding: 0.3rem;\n  font: inherit;\n}\n\n.nota {\n  font-family: system-ui, sans-serif;\n  color: #555555;\n}",
  "anotaciones": [
    {
      "fragmento": "<>",
      "nota": "El Fragment envuelve los dos elementos que en el HTML iban sueltos, el article y el párrafo de la nota, sin añadir nada al DOM."
    },
    {
      "fragmento": "{/* Ficha de producto */}",
      "nota": "El comentario de HTML, convertido en comentario de JSX. Con llaves solo puede ir dentro de un elemento, por eso está dentro del Fragment. Antes del elemento raíz todavía estás en JavaScript: ahí valdría un /* */ sin llaves."
    },
    {
      "fragmento": "alt=\"Tomatera con racimos de tomates verdes\" />",
      "nota": "img e input, cerradas con barra. Como esta vista previa no carga imágenes, en lugar de la foto verás su texto alternativo."
    },
    {
      "fragmento": "<p className=\"planta__precio\">Maceta de 14 cm: <strong>3,50&nbsp;&euro;</strong></p>",
      "nota": "Texto y strong en la misma línea: así se conserva el espacio de después de los dos puntos. Las entidades funcionan igual que en HTML."
    },
    {
      "fragmento": "<label htmlFor=\"unidades\">Unidades</label>",
      "nota": "for pasa a htmlFor. Pulsa «Unidades» en la vista previa: el cursor salta al campo, señal de que la etiqueta sigue unida a él."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

## Errores típicos

**Pasarse de camelCase.** Con la regla 3 en la cabeza, es fácil convertir también lo que no se toca:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// ¿Qué nombre anuncia un lector de pantalla para este botón?\nexport default function App() {\n  return (\n    <p className=\"aviso\">\n      Hoy regamos a las 19:00{' '}\n      <button type=\"button\" ariaLabel=\"Cerrar aviso\" dataAviso=\"riego\">\n        ×\n      </button>\n    </p>\n  )\n}",
  "opciones": [
    "«Cerrar aviso»",
    "«×», el contenido del botón",
    "Ninguno: el botón no tiene nombre"
  ],
  "correcta": 1,
  "explicacion": "React no reconoce ariaLabel: lo escribe en el HTML como arialabel, un atributo que no significa nada para los lectores de pantalla. Sin aria-label, el botón se llama por su contenido, el signo ×. Lo mismo le pasa a dataAviso, que acaba como dataaviso. Con guiones, aria-label y data-aviso, todo funciona."
}
```

React avisa en la consola de los dos atributos:

```text
Invalid ARIA attribute `ariaLabel`. Did you mean `aria-label`?
React does not recognize the `dataAviso` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `dataaviso` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
```

**Pegar un `style` escrito como en HTML.** No es un aviso en la consola: la página entera deja de pintarse.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un style que tumba la página",
  "consigna": "En lugar del aviso, la vista previa enseña un error. Lleva el color y la negrita a la regla .aviso de aviso.css y borra el atributo style. Es la solución que recomienda react.dev para los estilos que no dependen de datos; style en JSX lo verás en la lección 6.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './aviso.css'\n\nexport default function App() {\n  return (\n    <p className=\"aviso\" style=\"color: #8a4b00; font-weight: bold\">\n      Hoy cerramos por la tarde.\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "aviso.css",
      "codigo": ".aviso {\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff4d6;\n  font-family: system-ui, sans-serif;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El mensaje es este:

```text
The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.
```

Es decir, `style` espera un objeto con las propiedades de CSS, no un texto. Las dobles llaves de ese ejemplo son justo lo que explica la lección 6.

**Ignorar la consola porque la página se ve bien.** Con `class` y `for` no pasa nada visible, pero con `readonly` el campo se deja editar aunque no debería. Los errores rojos de la consola se arreglan siempre, también los que parecen inofensivos.

**Fiarse de que compila aquí.** El editor de esta web acepta un cierre con otro nombre, como `<h1>...</div>`; Vite no. Escribe cada cierre con el nombre de su apertura.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Convierte la tarjeta del taller",
  "consigna": "Este trozo viene de la web antigua del vivero y se ha pegado tal cual. Conviértelo en JSX válido. Mientras quede un error de sintaxis, la vista previa no arranca, y el editor solo enseña el primero que encuentra: repasa el comentario, el elemento raíz y las cinco etiquetas sin cerrar. Cuando aparezca la vista previa, corrige también los errores de la consola. Los botones aún no hacen nada: los eventos llegan en la lección 15. Después, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './taller.css'\n\nexport default function App() {\n  return (\n    <!-- Tarjeta del taller, copiada de la web antigua del vivero -->\n    <section class=\"taller\" aria-labelledby=\"titulo-taller\" data-taller=\"esquejes\">\n      <img class=\"taller__foto\" src=\"esquejes.jpg\" alt=\"Esquejes de romero en macetas pequeñas\">\n      <h2 id=\"titulo-taller\">Taller de esquejes</h2>\n      <p>Sábado 8 de noviembre, de 10:00 a 12:00<br>Vivero Las Eras, Huesca</p>\n      <ul>\n        <li>Material incluido\n        <li>Plazas limitadas: 12\n      </ul>\n      <label for=\"correo-taller\">Tu correo</label>\n      <input id=\"correo-taller\" type=\"email\" autocomplete=\"email\" placeholder=\"nombre@ejemplo.com\">\n      <button type=\"button\" class=\"boton\">Reservar plaza</button>\n    </section>\n    <p class=\"aviso\">\n      Quedan pocas plazas\n      <button type=\"button\" class=\"aviso__cerrar\" aria-label=\"Cerrar aviso\">×</button>\n    </p>\n  )\n}\n"
    },
    {
      "nombre": "taller.css",
      "codigo": ".taller {\n  max-width: 24rem;\n  padding: 1rem;\n  border: 1px solid #c9dcc0;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\n.taller__foto {\n  display: block;\n  width: 100%;\n  height: 7rem;\n  border-radius: 8px;\n  background: #e3f1dc;\n}\n\n.taller h2 {\n  margin: 0.75rem 0 0.25rem;\n}\n\n.taller label {\n  display: block;\n  margin-top: 0.75rem;\n  font-weight: 600;\n}\n\n.taller input {\n  box-sizing: border-box;\n  width: 100%;\n  margin: 0.25rem 0 0.75rem;\n  padding: 0.4rem;\n  font: inherit;\n}\n\n.boton {\n  padding: 0.5rem 0.9rem;\n  border: 0;\n  border-radius: 8px;\n  background: #2f6b2f;\n  color: white;\n  font: inherit;\n}\n\n.aviso {\n  max-width: 24rem;\n  padding: 0.5rem 0.75rem;\n  border-radius: 8px;\n  background: #fff4d6;\n  font-family: system-ui, sans-serif;\n}\n\n.aviso__cerrar {\n  margin-left: 0.5rem;\n  border: 0;\n  background: none;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La sección del taller se llama «Taller de esquejes», como su título",
      "pasos": [],
      "espera": {
        "rol": "region",
        "nombre": "Taller de esquejes"
      }
    },
    {
      "descripcion": "La foto conserva su texto alternativo",
      "pasos": [],
      "espera": {
        "rol": "img",
        "nombre": "Esquejes de romero en macetas pequeñas"
      }
    },
    {
      "descripcion": "«Plazas limitadas: 12» es un punto propio de la lista",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Plazas limitadas: 12"
      }
    },
    {
      "descripcion": "El campo de correo sigue unido a su etiqueta «Tu correo»",
      "pasos": [],
      "espera": {
        "etiqueta": "Tu correo"
      }
    },
    {
      "descripcion": "El botón del aviso se sigue llamando «Cerrar aviso»",
      "pasos": [],
      "espera": {
        "rol": "button",
        "nombre": "Cerrar aviso"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio, borra el `margin-left` de `.aviso__cerrar` en `taller.css`: «Quedan pocas plazas» y el × salen pegados, aunque en el HTML original había un espacio. Recupéralo sin tocar el CSS.
2. Convierte este icono a JSX y úsalo dentro de la tarjeta: `<svg class="icono" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 21v-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"></path></svg>`. Pista: los atributos de SVG con guion también pasan a camelCase.
3. Rescata una página que hiciste en el temario de HTML, por ejemplo un formulario accesible, y conviértela en un componente. Después pásala por el conversor de transform.tools y compara.
4. En tu proyecto de Vite, provoca a propósito los errores de esta lección (dos raíces, un `<br>`, un comentario de HTML, un cierre con otro nombre) y compara cada mensaje con el del editor de esta web.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Writing Markup with JSX",
      "descripcion": "La página de react.dev en la que se basa esta lección: por qué JSX y sus reglas, con un reto de conversión al final.",
      "url": "https://react.dev/learn/writing-markup-with-jsx",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Common components (props)",
      "descripcion": "La lista completa de props de los elementos del DOM en React, con su nombre en camelCase y lo que hace cada una.",
      "url": "https://react.dev/reference/react-dom/components/common",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<Fragment> (<>...</>)",
      "descripcion": "La referencia de Fragment: cuándo hace falta la forma larga, con key o con ref.",
      "url": "https://react.dev/reference/react/Fragment",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "HTML to JSX",
      "descripcion": "El conversor automático que recomienda react.dev. Pega HTML o SVG y devuelve JSX.",
      "url": "https://transform.tools/html-to-jsx",
      "etiqueta": "transform.tools"
    },
    {
      "titulo": "Void element",
      "descripcion": "Qué etiquetas de HTML son vacías, las que en JSX se cierran con barra.",
      "url": "https://developer.mozilla.org/en-US/docs/Glossary/Void_element",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Element: className property",
      "descripcion": "La propiedad del DOM de la que React toma el nombre className.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Element/className",
      "etiqueta": "MDN"
    }
  ]
}
```
