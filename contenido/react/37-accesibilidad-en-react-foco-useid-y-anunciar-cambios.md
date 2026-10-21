# Accesibilidad en React: foco, `useId` y anunciar cambios

- **Módulo:** Refs y el DOM
- **Slug:** `accesibilidad-en-react-foco-useid-y-anunciar-cambios` (autogenerado del título)
- **Orden:** 370
- **Fuentes:** [useId](https://react.dev/reference/react/useId) + [Dialog (Modal) Pattern (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) + [ARIA live regions (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) — ver `contenido/react/TEMARIO.md` #37

---

## Qué es y para qué sirve

En una web clásica, cada acción carga una página nueva: el foco vuelve al principio y el lector de pantalla lee el título nuevo. Quien no ve la pantalla sabe que algo ha cambiado. **En una app de React la página no se recarga nunca**: React cambia trozos en su sitio. Si no haces nada, pasan cosas como estas:

- Borras un elemento con el teclado y el foco desaparece con él: ya no estás en ningún sitio.
- Se abre una ventana, pero el teclado sigue en el fondo.
- Aparece «Cita reservada» en verde, y el lector de pantalla no dice nada.
- Usas dos veces el mismo componente de formulario y los `id` se repiten: la segunda etiqueta apunta al primer campo.

El HTML accesible ya lo conoces (etiquetas, roles, textos alternativos, del temario de HTML). Esta lección va de lo que es propio de una interfaz que cambia sin recargar, con tres herramientas: **`useId`** para los `id`, **las refs** para mover el foco (lección 34) y **las regiones vivas** para anunciar cambios. Al final, cómo comprobarlo todo **buscando por roles**, que es lo que hacen las comprobaciones de esta web.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Pruébalo con un lector de pantalla de verdad",
  "contenido": "La vista previa no habla, pero tu ordenador sí. En macOS, VoiceOver se enciende y se apaga con Comando + F5. En Windows, NVDA es gratuito (nvaccess.org). En Android, TalkBack viene de serie. Cinco minutos navegando los ejemplos de esta lección con uno de ellos enseñan más que cualquier explicación."
}
```

## `useId`: un `id` por cada copia del componente

Para unir una etiqueta con su campo, o un campo con su texto de ayuda, HTML usa `id`: `htmlFor` (lección 5) y `aria-describedby` apuntan a un `id`. Y un `id` tiene que ser **único en toda la página**. Escrito a mano dentro de un componente, se repite en cuanto el componente aparece dos veces.

En la cita previa del Ayuntamiento de Robledo, `CampoTelefono` se usa para tu teléfono y para el de un familiar:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos teléfonos con el mismo id",
  "consigna": "Pulsa el texto «Teléfono de un familiar»: el cursor salta al primer campo, no al suyo. Arréglalo en CampoTelefono.jsx: importa useId de react, guarda const id = useId() y úsalo en htmlFor, en el id del campo y, con un sufijo, en el de la ayuda.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import CampoTelefono from './CampoTelefono'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <form>\n      <h1>Cita previa: empadronamiento</h1>\n      <CampoTelefono etiqueta=\"Teléfono\" />\n      <CampoTelefono etiqueta=\"Teléfono de un familiar\" />\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "CampoTelefono.jsx",
      "codigo": "export default function CampoTelefono({ etiqueta }) {\n  return (\n    <div className=\"campo\">\n      <label htmlFor=\"telefono\">{etiqueta}</label>\n      <input id=\"telefono\" type=\"tel\" aria-describedby=\"telefono-ayuda\" />\n      <p id=\"telefono-ayuda\" className=\"ayuda\">\n        Nueve cifras, sin prefijo\n      </p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #1d4ed8;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n/* Que siempre se vea dónde está el foco */\nh2:focus,\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n}\n\n.ayuda {\n  margin: 0;\n  color: #475569;\n  font-size: 0.875rem;\n}\n"
    }
  ],
  "archivoInicial": "CampoTelefono.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El fallo no es solo del clic. En el árbol de accesibilidad de Chrome, el que leen los lectores de pantalla, **el primer campo se llama «Teléfono Teléfono de un familiar»**, porque las dos etiquetas apuntan a él, **y el segundo no tiene nombre**: un lector diría solo «campo de texto». Y las dos ayudas tienen el mismo `id`, así que `aria-describedby` encuentra siempre la primera.

La solución es `useId`, un hook que **devuelve un identificador único y estable para cada copia del componente**:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Cada copia, con su propio id",
  "codigo": "import { useId } from 'react'\n\nfunction CampoTelefono({ etiqueta }) {\n  const id = useId()\n  const idAyuda = id + '-ayuda'\n\n  return (\n    <div className=\"campo\">\n      <label htmlFor={id}>{etiqueta}</label>\n      <input id={id} type=\"tel\" aria-describedby={idAyuda} />\n      <p id={idAyuda} className=\"ayuda\">\n        Nueve cifras, sin prefijo\n      </p>\n      <p className=\"ayuda\">Mi id es {id}</p>\n    </div>\n  )\n}\n\nexport default function App() {\n  return (\n    <form>\n      <h1>Cita previa: empadronamiento</h1>\n      <CampoTelefono etiqueta=\"Teléfono\" />\n      <CampoTelefono etiqueta=\"Teléfono de un familiar\" />\n    </form>\n  )\n}",
  "css": "main,\nform {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #1d4ed8;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n/* Que siempre se vea dónde está el foco */\nh2:focus,\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n}\n\n.ayuda {\n  margin: 0;\n  color: #475569;\n  font-size: 0.875rem;\n}",
  "anotaciones": [
    {
      "fragmento": "import { useId } from 'react'",
      "nota": "useId es un hook: se llama en el nivel superior del componente, como useState, nunca dentro de un if o de un bucle (lección 16)."
    },
    {
      "fragmento": "const id = useId()",
      "nota": "Cada copia de CampoTelefono recibe uno distinto, y el mismo en todos sus renders. En React 19.3 tienen esta forma: _r_0_, _r_1_... No dependas de ese formato: puede cambiar entre versiones."
    },
    {
      "fragmento": "const idAyuda = id + '-ayuda'",
      "nota": "Si un componente necesita varios id, no hace falta llamar a useId varias veces: uno sirve de prefijo y le añades un sufijo para cada pieza."
    },
    {
      "fragmento": "<label htmlFor={id}>{etiqueta}</label>",
      "nota": "La etiqueta apunta a su campo. Pulsa el texto de cualquiera de las dos: ahora el cursor va a su sitio."
    },
    {
      "fragmento": "aria-describedby={idAyuda}",
      "nota": "Une el campo con su ayuda. El lector de pantalla lee la etiqueta y, después, la descripción: «Teléfono de un familiar, campo de texto, Nueve cifras, sin prefijo»."
    },
    {
      "fragmento": "<p className=\"ayuda\">Mi id es {id}</p>",
      "nota": "Solo para que veas los id generados. En una app de verdad, el id no se enseña."
    }
  ]
}
```

`useId` sirve para **atributos de accesibilidad y de formulario**: `htmlFor`, `id`, `aria-describedby`, `aria-labelledby`, `aria-controls`... Es lo que usaban las pestañas de la lección 30 para unir cada pestaña con su panel. **No sirve para las `key` de una lista**: las `key` salen de tus datos (lección 11).

## Por qué no un contador ni `Math.random`

¿Y si cada componente se fabricara su `id` con un contador global o con `Math.random()`? Mira lo que pasa en cada render. Pulsa «Mostrar instrucciones» varias veces y fíjate en los `id` que aparecen debajo de cada campo y en el árbol de renders:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Tres formas de fabricar un id",
  "consigna": "Pulsa «Mostrar instrucciones» y «Ocultar instrucciones» varias veces. En el árbol, los tres campos se vuelven a renderizar porque se renderizó su padre. En la vista previa, el recuadro ámbar marca lo que cambió en el DOM: los dos primeros campos cambian de id en cada clic; el de useId, nunca.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useId, useState } from 'react'\nimport './estilos.css'\n\nlet siguienteId = 0\n\nfunction CampoConContador({ etiqueta }) {\n  const id = 'campo-' + siguienteId++\n  return (\n    <p className=\"campo\">\n      <label htmlFor={id}>{etiqueta}</label>\n      <input id={id} />\n      <code>{id}</code>\n    </p>\n  )\n}\n\nfunction CampoConAzar({ etiqueta }) {\n  const id = 'campo-' + Math.random().toString(36).slice(2, 7)\n  return (\n    <p className=\"campo\">\n      <label htmlFor={id}>{etiqueta}</label>\n      <input id={id} />\n      <code>{id}</code>\n    </p>\n  )\n}\n\nfunction CampoConUseId({ etiqueta }) {\n  const id = useId()\n  return (\n    <p className=\"campo\">\n      <label htmlFor={id}>{etiqueta}</label>\n      <input id={id} />\n      <code>{id}</code>\n    </p>\n  )\n}\n\nexport default function App() {\n  const [instrucciones, setInstrucciones] = useState(false)\n\n  return (\n    <form>\n      <button type=\"button\" onClick={() => setInstrucciones(!instrucciones)}>\n        {instrucciones ? 'Ocultar' : 'Mostrar'} instrucciones\n      </button>\n      {instrucciones && <p>Rellena los tres campos.</p>}\n      <CampoConContador etiqueta=\"Con contador\" />\n      <CampoConAzar etiqueta=\"Con Math.random\" />\n      <CampoConUseId etiqueta=\"Con useId\" />\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #1d4ed8;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n/* Que siempre se vea dónde está el foco */\nh2:focus,\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n}\n\n.campo {\n  display: grid;\n  grid-template-columns: 9rem 1fr;\n  gap: 0.25rem 0.5rem;\n  align-items: center;\n  margin: 0;\n}\n\n.campo code {\n  grid-column: 2;\n  color: #475569;\n  font-size: 0.8rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Lo que acabas de ver:

- **El contador y `Math.random` dan un `id` nuevo en cada render.** Cada vez que el padre se renderiza, la etiqueta y el campo cambian de `id` y React tiene que tocar el DOM para nada.
- **El contador salta de dos en dos** (`campo-1`, `campo-3`, `campo-5`...). Es `StrictMode` llamando dos veces a cada componente (lección 12): cambiar una variable de fuera durante el render es justo la impureza que quiere destapar.
- **Con renderizado en el servidor sería peor.** El HTML llega del servidor con unos `id` y, al hidratarlo en el navegador (lección 87), React vuelve a renderizar y espera el mismo resultado. Un contador puede ir por otro número si los componentes se renderizan en otro orden, y `Math.random` nunca coincide. `useId` calcula el `id` a partir de la posición del componente en el árbol, que es la misma en los dos lados.

Si en una misma página conviven varias apps de React con su propio `createRoot`, cada una puede llevar su prefijo con la opción `identifierPrefix` de `createRoot` (lección 3), para que sus `id` no choquen.

## No perder nunca el foco

**Cuando la interfaz cambia, el foco tiene que acabar en un sitio con sentido, nunca en la nada.** Si el elemento que tiene el foco desaparece, el navegador lo deja en `<body>`: `document.activeElement` pasa a ser el `body`, el lector de pantalla no tiene nada que anunciar y quien usa el teclado puede perder su sitio (Chrome, por lo menos, sigue el Tab desde donde estaba el elemento borrado; con un lector de pantalla, depende del lector y del navegador). Ya lo viste en el viaje en el tiempo de la lección 32: por eso el botón de la jugada actual se quedaba en su sitio.

Las herramientas son las de la lección 34: una ref al elemento que debe recibir el foco, su método `focus()` y, cuando ese elemento todavía no está al día en el DOM, `flushSync`.

### Al borrar un elemento

Lo que se borra no puede quedarse con el foco. Las opciones razonables son **el elemento siguiente, el anterior si era el último, o el título de la lista** si no queda nada o si prefieres un punto fijo. Un título no se puede enfocar con Tab, pero con `tabIndex={-1}` sí puede recibir el foco desde el código, sin colarse en el recorrido del teclado. En los documentos del empadronamiento, el foco va al título:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Quitar un documento sin perder el foco",
  "consigna": "Usa solo el teclado: Tab hasta un «Quitar» y pulsa Intro. El foco pasa al título, que ya dice cuántos quedan, y la línea de abajo cuenta qué has quitado. Ahora borra la línea titulo.current.focus() y repite: ¿dónde queda el foco?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport { flushSync } from 'react-dom'\nimport './estilos.css'\n\nconst INICIALES = [\n  { id: 'dni', nombre: 'DNI o NIE' },\n  { id: 'contrato', nombre: 'Contrato de alquiler' },\n  { id: 'recibo', nombre: 'Último recibo de la luz' },\n  { id: 'libro', nombre: 'Libro de familia' },\n]\n\nexport default function App() {\n  const [documentos, setDocumentos] = useState(INICIALES)\n  const [anuncio, setAnuncio] = useState('')\n  const titulo = useRef(null)\n\n  function quitar(documento) {\n    const quedan = documentos.filter((d) => d.id !== documento.id)\n    flushSync(() => {\n      setDocumentos(quedan)\n      setAnuncio(`Has quitado «${documento.nombre}». Quedan ${quedan.length}.`)\n    })\n    // El botón pulsado ya no existe: el foco pasa al título de la lista\n    titulo.current.focus()\n  }\n\n  return (\n    <main>\n      <h1>Empadronamiento</h1>\n      <h2 ref={titulo} tabIndex={-1}>\n        Documentos que vas a aportar ({documentos.length})\n      </h2>\n      <ul>\n        {documentos.map((documento) => (\n          <li key={documento.id}>\n            {documento.nombre}\n            <button\n              aria-label={`Quitar ${documento.nombre}`}\n              onClick={() => quitar(documento)}\n            >\n              Quitar\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p role=\"status\" className=\"estado\">\n        {anuncio}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #1d4ed8;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n/* Que siempre se vea dónde está el foco */\nh2:focus,\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nul {\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0;\n  border-bottom: 1px solid #e2e8f0;\n}\n\n.estado {\n  min-height: 1.5em;\n  color: #166534;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Tres detalles de este ejemplo:

- **`flushSync` antes de `focus()`.** El título ya existe, así que podría enfocarse sin esperar; pero entonces el lector de pantalla lo anunciaría con el número de antes, «(4)». Con `flushSync`, cuando llega el foco el DOM ya dice «(3)».
- **Cada botón tiene un nombre distinto.** En pantalla todos dicen «Quitar», pero con `aria-label` un lector oye «Quitar Contrato de alquiler». Una lista de diez botones que se llaman igual no sirve de nada. Y como el nombre empieza por el texto que se ve, quien maneja la página con la voz puede seguir diciendo «pulsa Quitar».
- **La línea de abajo es una región viva** (`role="status"`): la verás en la sección siguiente.

### Al validar un formulario

En el ejercicio de la lección 34 llevaste el foco al primer campo con error, y uno de los retos proponía envolver `setErrores` en `flushSync`. Este es el motivo: si enfocas el campo antes de que React pinte el error, en el momento en que llega el foco **el mensaje de error todavía no está en el DOM** y el `aria-describedby` del campo aún no apunta a él. Comprobado en Chrome con un campo que registra su descripción al recibir el foco: sin `flushSync`, la descripción solo tenía la ayuda; con `flushSync`, la ayuda y el error. El lector de pantalla lee lo que hay cuando llega el foco.

```jsx
function manejarEnvio(e) {
  e.preventDefault()
  const nuevos = validar(datos)
  flushSync(() => setErrores(nuevos)) // el error y su aria-describedby, ya en el DOM
  if (nuevos.nombre) campoNombre.current.focus()
  else if (nuevos.correo) campoCorreo.current.focus()
}
```

Con el campo marcado con `aria-invalid` y su `aria-describedby` apuntando al error (cuyo `id`, en un componente reutilizable, sale de `useId`), al llegar el foco se oye algo como «Correo, entrada no válida, El correo necesita una @».

### Al abrir y cerrar un diálogo

Lo hiciste en la lección 36. Resumido, lo que pide el patrón de diálogo modal de las APG:

- **Al abrir, el foco entra.** En general, al primer elemento enfocable. Si el contenido es largo, a un elemento fijo del principio con `tabIndex={-1}`, como el título, para que no se desplace la ventana. Si el diálogo confirma algo que no se puede deshacer, como borrar, a la acción menos destructiva («Cancelar»).
- **Mientras está abierto, Tab no sale del diálogo**: el fondo, inerte (`inert`), o un `<dialog>` abierto con `showModal()`, que lo hace solo.
- **Escape cierra.** Y siempre hay un botón visible para cerrar.
- **Al cerrar, el foco vuelve al elemento que lo abrió.** Si ese elemento ya no existe, a otro que tenga sentido en el flujo: por ejemplo, después de «Añadir filas», a la primera fila nueva.
- **Nombre y rol**: `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al título (o `aria-label`).

## Anunciar cambios: regiones vivas

Lo que cambia en pantalla sin que se mueva el foco (un contador de resultados, «Guardado», «Cita reservada») un lector de pantalla no lo lee solo. Para eso están las **regiones vivas**: elementos cuyo contenido, cuando cambia, el lector anuncia.

- **`aria-live="polite"`**: lo anuncia cuando el usuario deja de hacer cosas, sin interrumpir. Es la opción por defecto en casi todo.
- **`aria-live="assertive"`**: interrumpe lo que se estuviera leyendo. Solo para lo urgente.
- **`role="status"`** es una región viva educada: para mensajes de estado. MDN recomienda añadirle `aria-live="polite"` por compatibilidad.
- **`role="alert"`** es una región viva enérgica: para errores importantes. Úsala con cuidado, porque interrumpe.

La regla que más se olvida: **la región tiene que existir antes de que cambie su contenido.** Los lectores anuncian los cambios dentro de una región que ya conocen; una región que aparece de golpe con el texto dentro puede pasar desapercibida. MDN lo resume en que lo más fiable es tenerla en el HTML desde el principio, vacía, y cambiar después su contenido. Con `role="alert"` los navegadores y lectores suelen hacer una excepción y anunciarla aunque llegue ya con texto, pero no es una regla de la especificación.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Versión A\nfunction Aviso({ mensaje }) {\n  return mensaje !== '' && <p role=\"status\">{mensaje}</p>\n}\n\n// Versión B\nfunction Aviso({ mensaje }) {\n  return <p role=\"status\">{mensaje}</p>\n}\n\n// mensaje empieza vacío. Al pulsar «Pedir cita» pasa a ser\n// «Cita reservada: martes 14 a las 9:30».\n// ¿Qué versión anuncia el mensaje de forma fiable?",
  "opciones": [
    "La A: el párrafo aparece justo cuando hay algo que decir",
    "La B: la región está desde el principio y solo cambia su texto",
    "Las dos por igual: React pinta lo mismo al final",
    "Ninguna: role=\"status\" no basta, hace falta aria-live=\"assertive\""
  ],
  "correcta": 1,
  "explicacion": "En la A, el p con role=\"status\" se crea a la vez que su texto: el lector no conocía esa región y puede no anunciarla. En la B, el p está en la página desde el principio, vacío, y lo que cambia es su contenido, que es lo que vigilan los lectores. role=\"status\" ya es una región viva educada; assertive sería para lo urgente."
}
```

Un caso típico: un buscador que filtra mientras escribes. La lista cambia en pantalla, pero quien no la ve necesita saber cuántos resultados hay:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un buscador que dice cuántos resultados hay",
  "codigo": "import { useState } from 'react'\n\nconst TRAMITES = [\n  'Alta en el padrón',\n  'Certificado de empadronamiento',\n  'Licencia de obra menor',\n  'Tarjeta de aparcamiento para residentes',\n  'Bonificación del IBI',\n  'Reserva de pistas deportivas',\n  'Cita con trabajo social',\n]\n\nexport default function App() {\n  const [texto, setTexto] = useState('')\n  const busqueda = texto.trim().toLowerCase()\n  const resultados = TRAMITES.filter((t) => t.toLowerCase().includes(busqueda))\n\n  return (\n    <main>\n      <h1>Trámites del Ayuntamiento</h1>\n      <label>\n        Buscar trámite\n        <input type=\"search\" value={texto} onChange={(e) => setTexto(e.target.value)} />\n      </label>\n      <p role=\"status\">\n        {resultados.length === 1\n          ? '1 trámite encontrado'\n          : `${resultados.length} trámites encontrados`}\n      </p>\n      <ul>\n        {resultados.map((tramite) => (\n          <li key={tramite}>{tramite}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main,\nform {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #1d4ed8;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n/* Que siempre se vea dónde está el foco */\nh2:focus,\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n}",
  "anotaciones": [
    {
      "fragmento": "<input type=\"search\"",
      "nota": "Un campo de búsqueda: el foco se queda aquí mientras escribes. Nada se mueve, así que nada se anuncia solo."
    },
    {
      "fragmento": "<p role=\"status\">",
      "nota": "La región viva. Se pinta siempre, desde el primer render, y lo que cambia es su texto. Con role=\"status\", el lector espera a que dejes de teclear para leerlo."
    },
    {
      "fragmento": "'1 trámite encontrado'",
      "nota": "Mensajes cortos y completos: una región viva se lee como texto plano, sin enlaces ni botones, así que tiene que entenderse sola."
    },
    {
      "fragmento": "<ul>",
      "nota": "La lista no es una región viva: si lo fuera, el lector leería los trámites uno a uno con cada letra. Basta con el resumen; quien quiera los detalles, baja a la lista."
    }
  ]
}
```

Dos atributos más que te encontrarás: **`aria-atomic="true"`** hace que se lea la región entera cuando cambia una parte (útil si el texto está partido en varias etiquetas), y **`aria-relevant`** decide qué cambios cuentan (añadir, quitar, texto). Por defecto, lo que se lee es lo que ha cambiado.

## El orden del DOM manda

El Tab y el lector de pantalla recorren la página **en el orden del DOM, no en el que se ve**. El CSS puede reordenar lo visual (`flex-direction: row-reverse`, `order`, la colocación en una rejilla, `position: absolute`), pero no el recorrido:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function PieDelFormulario() {\n  return (\n    <form>\n      <label>\n        Teléfono <input type=\"tel\" />\n      </label>\n      <div className=\"pie\">\n        <button type=\"button\">Cancelar</button>\n        <button>Pedir cita</button>\n      </div>\n    </form>\n  )\n}\n\n/* estilos.css\n.pie {\n  display: flex;\n  flex-direction: row-reverse;\n  justify-content: flex-end;\n}\n*/\n\n// En pantalla, «Pedir cita» sale a la izquierda y «Cancelar» a su derecha.\n// Estás en el campo «Teléfono» y pulsas Tab. ¿Adónde va el foco?",
  "opciones": [
    "A «Pedir cita», el que se ve primero",
    "A «Cancelar», el primero en el DOM",
    "A ninguno: row-reverse saca los botones del recorrido",
    "Depende de cuál esté más cerca del campo"
  ],
  "correcta": 1,
  "explicacion": "El Tab sigue el orden del DOM: primero Cancelar, después Pedir cita, aunque en pantalla se vean al revés. Para quien usa el teclado, el foco salta a la derecha y luego vuelve a la izquierda. Si quieres Pedir cita a la izquierda, ponlo primero en el JSX. Comprobado en Chrome."
}
```

Por la misma razón, el contenido de un portal (lección 36) va al final del recorrido, porque está al final del `body`: si no mueves el foco a la ventana al abrirla, quien usa el teclado tiene que atravesar toda la página para llegar. Y nunca uses un `tabIndex` positivo para «arreglar» el orden: crea un recorrido paralelo que nadie espera. Los únicos valores útiles son `0` (enfocable con Tab, para un elemento propio que actúe como control) y `-1` (enfocable solo desde el código).

## Probar por roles, como un lector de pantalla

Las comprobaciones de los ejercicios de esta web buscan los elementos como lo haría un lector de pantalla: «un botón que se llama «Pedir cita»», «un campo cuya etiqueta es «Teléfono»», «un mensaje de estado que dice…». Si una comprobación no encuentra tu botón, es muy probable que un lector de pantalla tampoco lo identifique bien. Por eso **el código accesible y el código fácil de comprobar son el mismo código**.

Lo mismo harás en tus propios tests con Testing Library (lección 83). Así se probaría la lista de documentos de arriba:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { expect, test } from 'vitest'\nimport Documentos from './Documentos'\n\ntest('al quitar un documento, se anuncia y el foco va al título', async () => {\n  const user = userEvent.setup()\n  render(<Documentos />)\n\n  await user.click(screen.getByRole('button', { name: 'Quitar Contrato de alquiler' }))\n\n  expect(screen.getByRole('status')).toHaveTextContent('Has quitado «Contrato de alquiler»')\n  expect(screen.getByRole('heading', { name: /Documentos que vas a aportar/ })).toHaveFocus()\n})\n\ntest('cada teléfono tiene su etiqueta y su ayuda', () => {\n  render(<FormularioCita />)\n\n  const telefono = screen.getByRole('textbox', { name: 'Teléfono de un familiar' })\n  expect(telefono).toHaveAccessibleDescription('Nueve cifras, sin prefijo')\n})",
  "anotaciones": [
    {
      "fragmento": "screen.getByRole('button', { name: 'Quitar Contrato de alquiler' })",
      "nota": "Busca por rol y nombre accesible, como un lector de pantalla. Si los botones se llamaran todos «Quitar», esta línea no podría distinguirlos, y el usuario tampoco."
    },
    {
      "fragmento": "toHaveTextContent('Has quitado «Contrato de alquiler»')",
      "nota": "Comprueba lo que anunciaría la región viva, que se encuentra por su rol, status."
    },
    {
      "fragmento": ".toHaveFocus()",
      "nota": "Comprueba adónde ha ido el foco. Es la forma de que un cambio de código no vuelva a dejar el foco en el body sin que nadie se entere."
    },
    {
      "fragmento": "screen.getByRole('textbox', { name: 'Teléfono de un familiar' })",
      "nota": "Con los id repetidos, este campo no tenía nombre y la búsqueda fallaría. Con useId, lo encuentra."
    },
    {
      "fragmento": "toHaveAccessibleDescription('Nueve cifras, sin prefijo')",
      "nota": "Comprueba que aria-describedby apunta de verdad a la ayuda. Viene de jest-dom, el complemento de Testing Library con estas comprobaciones del DOM."
    }
  ]
}
```

Las búsquedas por rol no lo cubren todo (el contraste de colores, por ejemplo). Para eso hay revisores automáticos como [axe](https://github.com/dequelabs/axe-core), que se pueden lanzar desde los tests, y nada sustituye a un rato con el teclado y un lector de pantalla.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "useId en cada componente de formulario reutilizable",
      "texto": "Un Campo, un CampoTelefono, unas pestañas, un acordeón: todo lo que une piezas con htmlFor, aria-describedby, aria-labelledby o aria-controls y puede aparecer dos veces en la misma página."
    },
    {
      "titulo": "Gestionar el foco en cada cambio que lo deja huérfano",
      "texto": "Borrar un elemento, cerrar una ventana, terminar un paso de un formulario de varias pantallas, cambiar de página en una app con rutas (al cambiar de ruta, el foco suele ir al título de la página nueva)."
    },
    {
      "titulo": "Una región de estado para lo que cambia sin mover el foco",
      "texto": "Resultados de una búsqueda o de un filtro, «Guardado», «Añadido a la cesta», el resultado de un envío. Una sola región por zona de la página, pintada desde el principio."
    },
    {
      "titulo": "role=\"alert\" para lo urgente, y poco",
      "texto": "Un error que impide seguir, una sesión a punto de caducar. Si todo es urgente, nada lo es: y el usuario oye interrupciones constantes."
    },
    {
      "titulo": "Tests por rol en todo lo interactivo",
      "texto": "Cada botón, campo y mensaje que importa, buscado por rol y nombre. Si el test no lo encuentra así, revisa el marcado antes que el test."
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
      "mito": "useId sirve para generar las key de una lista",
      "realidad": "Las key salen de los datos (lección 11). useId da un id por componente, no por elemento de una lista, y react.dev lo desaconseja expresamente para eso."
    },
    {
      "mito": "Si algo se ve en pantalla, el lector de pantalla lo dice",
      "realidad": "El lector lee lo que tiene el foco y lo que el usuario recorre. Lo que cambia en otra parte, sin región viva, pasa en silencio."
    },
    {
      "mito": "Cuantas más regiones vivas, más accesible",
      "realidad": "Cada una es una voz que puede interrumpir. Anuncia lo que el usuario necesita saber para seguir, con mensajes cortos, y deja que el resto lo descubra navegando."
    },
    {
      "mito": "El orden en pantalla es el orden de lectura",
      "realidad": "El Tab y el lector siguen el DOM. Si el CSS reordena, el recorrido no se entera."
    },
    {
      "mito": "tabIndex={-1} saca un elemento del teclado para siempre",
      "realidad": "Lo saca del recorrido con Tab, pero sigue pudiendo recibir el foco desde el código, que es justo lo que quieres en un título al que mandas el foco después de borrar."
    }
  ]
}
```

## Errores típicos

**Enfocar con una función de ref escrita en línea.** Parece la forma más corta de enfocar un campo al aparecer. Escribe un trámite en el primer campo y después un código postal en el segundo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un campo que se queda con el foco",
  "consigna": "Escribe «padrón» en «Trámite». Después pulsa en «Código postal» y escribe 44001: la primera cifra entra, y el resto acaba en «Trámite». Arréglalo cambiando la función de ref por autoFocus.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [tramite, setTramite] = useState('')\n  const [codigoPostal, setCodigoPostal] = useState('')\n\n  return (\n    <form>\n      <label>\n        Trámite\n        <input\n          ref={(campo) => campo?.focus()}\n          value={tramite}\n          onChange={(e) => setTramite(e.target.value)}\n        />\n      </label>\n      <label>\n        Código postal\n        <input\n          value={codigoPostal}\n          onChange={(e) => setCodigoPostal(e.target.value)}\n        />\n      </label>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #1d4ed8;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n/* Que siempre se vea dónde está el foco */\nh2:focus,\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.25rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Cada letra cambia el estado y vuelve a renderizar `App`. La flecha de `ref` es una función nueva en cada render, así que React desconecta la vieja y conecta la nueva (lección 34)… y la nueva vuelve a llamar a `focus()`. El foco salta al primer campo con cada tecla. Las salidas: **`autoFocus`**, que React solo aplica al montar el elemento, o una función de ref definida **fuera del componente** (`function enfocar(nodo) { nodo?.focus() }`), que es siempre la misma y React no vuelve a llamar.

**Mover el foco a algo que todavía no se puede enfocar.** Un elemento que aún no existe, uno oculto o uno dentro de una zona con `inert`: `focus()` no hace nada y el foco se queda donde estaba, o en el `body`. Es el caso del modal de la lección 36: el botón estaba dentro de `<main inert>`, y había que aplicar el cierre con `flushSync` antes de enfocarlo.

**Una región viva que aparece con el mensaje ya dentro.** Es la versión A del ejemplo de arriba: `{mensaje && <p role="status">…}`. Pinta la región siempre y cambia su texto.

**Repetir `id` en un componente reutilizable.** Funciona mientras haya una sola copia, que es justo cuando no lo pruebas. Si un componente pone un `id`, que salga de `useId`.

**Esconder el anillo del foco.** `outline: none` sin poner nada a cambio deja a quien usa el teclado sin saber dónde está. Si no te gusta el del navegador, cámbialo por otro con `:focus-visible`, como en los ejemplos de esta lección.

## Ejercicios

En el cursillo de natación de julio, el formulario de inscripción usa `CampoCorreo` dos veces, la lista de inscritos se puede recortar y los avisos aparecen en un párrafo cualquiera. Arregla las tres cosas.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las inscripciones del cursillo, accesibles",
  "consigna": "1. En CampoCorreo, usa useId para que cada copia tenga sus propios id. 2. Al quitar a alguien, el foco pasa al «Quitar» del siguiente; si era el último, al del anterior; si no queda nadie, al título de la lista (con tabIndex={-1}). Necesitarás una ref por botón (lección 34) y flushSync. 3. Los mensajes van en una región de estado que esté en la página desde el principio. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport CampoCorreo from './CampoCorreo'\nimport './estilos.css'\n\nconst INICIALES = [\n  { id: 1, nombre: 'Lucía' },\n  { id: 2, nombre: 'Bruno' },\n  { id: 3, nombre: 'Carmen' },\n]\n\nlet siguienteId = 4\n\nexport default function App() {\n  const [inscritos, setInscritos] = useState(INICIALES)\n  const [nombre, setNombre] = useState('')\n  const [correo, setCorreo] = useState('')\n  const [correoTutor, setCorreoTutor] = useState('')\n  const [mensaje, setMensaje] = useState('')\n\n  function inscribir(e) {\n    e.preventDefault()\n    if (nombre.trim() === '') return\n    setInscritos([...inscritos, { id: siguienteId++, nombre: nombre.trim() }])\n    setMensaje(`Has inscrito a ${nombre.trim()}.`)\n    setNombre('')\n    setCorreo('')\n    setCorreoTutor('')\n  }\n\n  function quitar(persona) {\n    const quedan = inscritos.filter((p) => p.id !== persona.id)\n    setInscritos(quedan)\n    setMensaje(`Has quitado a ${persona.nombre}. Quedan ${quedan.length}.`)\n    // 2. El foco, al «Quitar» del siguiente; si era el último, al del anterior;\n    //    si no queda nadie, al título\n  }\n\n  return (\n    <main>\n      <h1>Cursillo de natación de julio</h1>\n      <form onSubmit={inscribir}>\n        <div className=\"campo\">\n          <label htmlFor=\"nombre\">Nombre</label>\n          <input id=\"nombre\" value={nombre} onChange={(e) => setNombre(e.target.value)} />\n        </div>\n        <CampoCorreo etiqueta=\"Correo\" valor={correo} onCambiar={setCorreo} />\n        <CampoCorreo\n          etiqueta=\"Correo de la persona tutora\"\n          valor={correoTutor}\n          onCambiar={setCorreoTutor}\n        />\n        <button>Inscribir</button>\n      </form>\n      <h2>Inscritos ({inscritos.length})</h2>\n      <ul>\n        {inscritos.map((persona) => (\n          <li key={persona.id}>\n            {persona.nombre}\n            <button aria-label={`Quitar a ${persona.nombre}`} onClick={() => quitar(persona)}>\n              Quitar\n            </button>\n          </li>\n        ))}\n      </ul>\n      {/* 3. Que los mensajes se anuncien */}\n      {mensaje && <p className=\"mensaje\">{mensaje}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "CampoCorreo.jsx",
      "codigo": "// Se usa dos veces en el formulario: estos id se repiten\nexport default function CampoCorreo({ etiqueta, valor, onCambiar }) {\n  return (\n    <div className=\"campo\">\n      <label htmlFor=\"correo\">{etiqueta}</label>\n      <input\n        id=\"correo\"\n        type=\"email\"\n        value={valor}\n        onChange={(e) => onCambiar(e.target.value)}\n        aria-describedby=\"correo-ayuda\"\n      />\n      <p id=\"correo-ayuda\" className=\"ayuda\">\n        Aquí llegará el resguardo de la inscripción\n      </p>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main,\nform {\n  max-width: 26rem;\n  font-family: system-ui, sans-serif;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.3rem 0.7rem;\n  border: 2px solid #1d4ed8;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n/* Que siempre se vea dónde está el foco */\nh2:focus,\nbutton:focus-visible,\ninput:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nform {\n  display: grid;\n  gap: 0.75rem;\n}\n\nform button {\n  justify-self: start;\n}\n\n.campo {\n  display: grid;\n  gap: 0.25rem;\n}\n\n.ayuda {\n  margin: 0;\n  color: #475569;\n  font-size: 0.875rem;\n}\n\nul {\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.35rem 0;\n  border-bottom: 1px solid #e2e8f0;\n}\n\n.mensaje {\n  min-height: 1.5em;\n  color: #166534;\n}\n"
    }
  ],
  "archivoInicial": "CampoCorreo.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Escribir en «Correo de la persona tutora» no cambia el campo «Correo»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo de la persona tutora",
            "texto": "ana@correo.es"
          }
        }
      ],
      "espera": {
        "etiqueta": "Correo",
        "valor": ""
      }
    },
    {
      "descripcion": "La región de estado está en la página desde el principio",
      "pasos": [],
      "espera": {
        "rol": "status"
      }
    },
    {
      "descripcion": "Al inscribir a alguien, la región de estado lo dice",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Iker"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Inscribir"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Has inscrito a Iker"
      }
    },
    {
      "descripcion": "Al quitar a alguien, la región de estado lo dice",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar a Bruno"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Has quitado a Bruno"
      }
    },
    {
      "descripcion": "Al quitar a Lucía, el foco pasa al «Quitar» de Bruno: Intro lo quita también",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar a Lucía"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Quitar a Bruno"
        }
      }
    },
    {
      "descripcion": "Al quitar a Carmen, la última, el foco pasa al «Quitar» de Bruno",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar a Carmen"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Quitar a Bruno"
        }
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade validación al formulario: sin nombre, o con un correo sin `@`, se muestra el error junto al campo, unido con `aria-describedby` (el `id` del error, también con `useId`) y con `aria-invalid`, y el foco va al primer campo con error, con `flushSync` para que el error ya esté en el DOM.
2. Cuando la lista se quede vacía, cambia el título por «Todavía no hay nadie inscrito». ¿Sigue funcionando el foco al quitar al último?
3. Añade un buscador de inscritos con su región de estado («2 inscritos coinciden»). ¿Usarías la misma región que la de los mensajes, o una propia?
4. Escribe, en papel o en tu proyecto, un test con Testing Library para el reto 1: envía el formulario vacío y comprueba con `toHaveFocus()` que el foco está en «Nombre».

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useId",
      "descripcion": "La referencia oficial: para qué sirve, por qué es mejor que un contador, el prefijo compartido para varios id e identifierPrefix.",
      "url": "https://react.dev/reference/react/useId",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Dialog (Modal) Pattern",
      "descripcion": "Las ARIA Authoring Practices: dónde poner el foco al abrir y al cerrar, el teclado y los atributos de un diálogo modal.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      "etiqueta": "W3C APG"
    },
    {
      "titulo": "ARIA live regions",
      "descripcion": "Cómo funcionan aria-live, role=\"status\" y role=\"alert\", aria-atomic y aria-relevant, y por qué la región tiene que existir antes de cambiar.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions",
      "etiqueta": "MDN"
    },
    {
      "titulo": "inert",
      "descripcion": "El atributo para dejar sin foco, sin clics y fuera del lector de pantalla todo lo que hay detrás de un diálogo.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert",
      "etiqueta": "MDN"
    },
    {
      "titulo": "About Queries: Priority",
      "descripcion": "El orden en que Testing Library recomienda buscar los elementos: primero por rol, después por etiqueta, y el test id solo como último recurso.",
      "url": "https://testing-library.com/docs/queries/about/#priority",
      "etiqueta": "Testing Library"
    },
    {
      "titulo": "NVDA",
      "descripcion": "El lector de pantalla gratuito para Windows, para probar tus interfaces como las usan muchas personas ciegas.",
      "url": "https://www.nvaccess.org/download/",
      "etiqueta": "NV Access"
    }
  ]
}
```
