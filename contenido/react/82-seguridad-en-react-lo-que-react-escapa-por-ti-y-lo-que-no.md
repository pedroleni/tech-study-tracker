# Seguridad en React: lo que React escapa por ti y lo que no

- **Módulo:** Calidad y producción
- **Slug:** `seguridad-en-react-lo-que-react-escapa-por-ti-y-lo-que-no` (autogenerado del título)
- **Orden:** 820
- **Fuentes:** [dangerouslySetInnerHTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html) + [DOMPurify](https://github.com/cure53/DOMPurify) + [Trusted Types (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) + [Vite: Env Variables](https://vite.dev/guide/env-and-mode) — ver `contenido/react/TEMARIO.md` #82

---

## Qué es y para qué sirve

Un ataque de *cross-site scripting* (XSS) consiste en colar código en una página para que se ejecute en el navegador de otra persona, con su sesión abierta. Ese código ve lo mismo que ella, puede leer lo que la aplicación guarde en `localStorage` y hacer peticiones en su nombre. La puerta casi siempre es la misma: **un texto que escribió alguien de fuera (una reseña, un nombre, una dirección web) y que la página acaba tratando como HTML o como código**.

React cierra esa puerta en el caso más común sin que se lo pidas, y te deja abrirla a propósito en unos pocos sitios. Esta lección va de saber cuáles son, y de lo que ninguna biblioteca de interfaz puede hacer por ti.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Quién se encarga de qué",
  "roles": [
    {
      "etiqueta": "React",
      "rol": "Lo hace por ti",
      "descripcion": "Escapa el texto que pones entre llaves y los valores de los atributos. Desde React 19, bloquea las URL javascript: en href, src y action."
    },
    {
      "etiqueta": "Tú",
      "rol": "Lo que tienes que vigilar",
      "descripcion": "dangerouslySetInnerHTML, las URL que vienen de fuera, las props que reenvías sin mirar y los secretos que no deben llegar al navegador."
    },
    {
      "etiqueta": "Tu servidor",
      "rol": "La única barrera de verdad",
      "descripcion": "Comprueba quién pide cada cosa y valida todo lo que llega, venga de tu interfaz o de cualquier otro sitio."
    }
  ]
}
```

## Lo que React escapa por ti: el texto entre llaves

En la lección 6 viste que entre llaves puedes pintar cualquier texto. Lo que no viste es qué pasa si ese texto parece HTML. Las opiniones del Camping Los Fresnos las escriben los clientes, y una de ellas trae una sorpresa: una etiqueta `<img>` con un atributo `onerror`, el código que el navegador ejecuta si la imagen no carga.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una opinión con trampa, pintada como texto",
  "consigna": "La segunda opinión se lee tal cual, con su etiqueta img a la vista: no hay ninguna imagen ni se ejecuta nada. Pulsa «Ver el HTML» para ver cómo la ha escrito React en el DOM: los < se han convertido en &lt;.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst opiniones = [\n  { id: 1, autor: 'Nerea', texto: 'Parcelas con mucha sombra y el río a dos pasos.' },\n  { id: 2, autor: 'Visitante', texto: `<img src=\"x\" onerror=\"document.body.style.background='crimson'\"> ¡Las duchas, de diez!` },\n  { id: 3, autor: 'Íñigo', texto: 'Volveremos en agosto <3' },\n]\n\nexport default function App() {\n  const [html, setHtml] = useState('')\n\n  function verHtml() {\n    setHtml(document.querySelector('.resenas').innerHTML)\n  }\n\n  return (\n    <main>\n      <h1>Opiniones del Camping Los Fresnos</h1>\n      <ul className=\"resenas\">\n        {opiniones.map((opinion) => (\n          <li key={opinion.id}>\n            <strong>{opinion.autor}</strong>\n            <p title={opinion.texto}>{opinion.texto}</p>\n          </li>\n        ))}\n      </ul>\n      <button type=\"button\" onClick={verHtml}>Ver el HTML</button>\n      {html && <pre>{html}</pre>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  color: #14532d;\n  font-size: 1.3rem;\n}\n\n.resenas {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.resenas li {\n  padding: 0.6rem 0.8rem;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\n.resenas p {\n  margin: 0.25rem 0 0;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\npre {\n  padding: 0.6rem;\n  border-radius: 6px;\n  background: #1e293b;\n  color: #e2e8f0;\n  font-size: 0.75rem;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

**React nunca interpreta como HTML lo que pones entre llaves**: lo mete en el DOM como un nodo de texto, y al leer el `innerHTML` el navegador te enseña los `<` convertidos en `&lt;` y los `>` en `&gt;`. Con los atributos pasa lo mismo: `title={opinion.texto}` asigna el valor entero, comillas incluidas, y por muchas comillas que traiga no puede cerrar el atributo y abrir otro. El «<3» de Íñigo, de paso, también sale bien.

Es justo lo contrario de construir HTML pegando cadenas, como en `lista.innerHTML += '<p>' + texto + '</p>'`, el error clásico del JavaScript a mano. Y hay una segunda capa que viste en la lección 7: un JSON que llegue de un servidor tampoco puede hacerse pasar por un elemento de React, porque le falta el símbolo `$$typeof`.

## `dangerouslySetInnerHTML`: la puerta que abres tú

Hay una forma de pedirle a React que pinte una cadena como HTML: la prop `dangerouslySetInnerHTML`, con un objeto que lleva el HTML en la clave `__html`. React se lo pasa tal cual al `innerHTML` del elemento, sin mirarlo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La misma opinión, pintada como HTML",
  "consigna": "Marca «Pintar las opiniones como HTML». El fondo se vuelve rojo: ese color lo ha puesto código que venía dentro de una opinión. Aquí solo cambia un color; en una web de verdad podría leer tu sesión o hacer peticiones en tu nombre. Desmarca la casilla: el fondo sigue rojo, porque el código ya se ejecutó.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst opiniones = [\n  { id: 1, autor: 'Nerea', texto: 'Parcelas con <strong>mucha sombra</strong> y el río a dos pasos.' },\n  { id: 2, autor: 'Visitante', texto: `<img src=\"x\" onerror=\"document.body.style.background='crimson'\"> ¡Las duchas, de diez!` },\n]\n\nfunction Opinion({ opinion, comoHtml }) {\n  return (\n    <li>\n      <strong>{opinion.autor}</strong>\n      {comoHtml ? (\n        <p dangerouslySetInnerHTML={{ __html: opinion.texto }} />\n      ) : (\n        <p>{opinion.texto}</p>\n      )}\n    </li>\n  )\n}\n\nexport default function App() {\n  const [comoHtml, setComoHtml] = useState(false)\n\n  return (\n    <main>\n      <h1>Opiniones del Camping Los Fresnos</h1>\n      <label>\n        <input type=\"checkbox\" checked={comoHtml} onChange={(e) => setComoHtml(e.target.checked)} /> Pintar\n        las opiniones como HTML\n      </label>\n      <ul className=\"resenas\">\n        {opiniones.map((opinion) => (\n          <Opinion key={opinion.id} opinion={opinion} comoHtml={comoHtml} />\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  color: #14532d;\n  font-size: 1.3rem;\n}\n\n.resenas {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.resenas li {\n  padding: 0.6rem 0.8rem;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\n.resenas p {\n  margin: 0.25rem 0 0;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\npre {\n  padding: 0.6rem;\n  border-radius: 6px;\n  background: #1e293b;\n  color: #e2e8f0;\n  font-size: 0.75rem;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Con la casilla marcada, la opinión de Nerea sale con su negrita, que era lo que se buscaba; y la del visitante ejecuta su `onerror`. **El HTML no distingue entre el formato que querías y el código que no**: si dejas pasar uno, dejas pasar el otro.

### Por qué un nombre tan feo

El nombre es largo e incómodo a propósito. Nadie escribe `dangerouslySetInnerHTML={{ __html: ... }}` sin querer, y quien revisa el código lo encuentra con una búsqueda. react.dev recomienda además crear el objeto `{ __html }` lo más cerca posible de donde se genera el HTML, en una función con nombre propio, para que esté claro qué variables contienen HTML y cuáles no. No lo crees en línea, como en este ejemplo, que lo hace así solo para que se vea entero.

Dos reglas más:

- **No puede ir con `children`.** Si un elemento tiene las dos cosas, React no lo pinta y da este error: «Can only set one of `children` or `props.dangerouslySetInnerHTML`.», es decir, solo se puede usar una de las dos.
- **Lo que hay dentro no pasa por ninguna protección de React.** Ni el escapado, ni el bloqueo de URL `javascript:` que verás más abajo: un `<a href="javascript:...">` dentro de ese HTML llega intacto al DOM.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const opinion = '<p>¡Gran acampada!</p><script>robarSesion()</script>'\n\nexport default function Opinion() {\n  return <div dangerouslySetInnerHTML={{ __html: opinion }} />\n}",
  "opciones": [
    "Sí: se ejecuta como cualquier script de la página",
    "No: un script que llega por innerHTML no se ejecuta, pero eso no hace segura la opinión",
    "No: React quita las etiquetas script antes de pintar",
    "Solo en desarrollo"
  ],
  "correcta": 1,
  "explicacion": "El navegador no ejecuta los script que se insertan con innerHTML, y React no filtra nada: la etiqueta queda en el DOM, inerte. Pero no te confíes: atributos como onerror u onload sí se ejecutan, como acabas de ver. Por eso quitar las etiquetas script no es sanear."
}
```

## Cuando el HTML es inevitable: un CMS o Markdown

A veces el contenido llega como HTML y no hay otra: el cuerpo de una noticia escrita en un gestor de contenidos (un CMS), un texto en Markdown que alguien convierte a HTML, el editor de texto enriquecido de un formulario. Hay dos caminos.

**Si es Markdown, no pases por HTML.** Librerías como `react-markdown` convierten el Markdown directamente en elementos de React, y su documentación presume de ser segura por defecto: «no `dangerouslySetInnerHTML` or XSS attacks», sin `dangerouslySetInnerHTML` ni ataques XSS. Esta misma web pinta así el texto de sus lecciones (lo verás en la lección 86).

**Si es HTML, sanéalo justo antes de pintarlo.** La librería de referencia es DOMPurify: recibe una cadena de HTML y devuelve otra sin nada que pueda ejecutar código. No se puede importar en la vista previa, que solo carga React, así que aquí va el código de un proyecto real:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import DOMPurify from 'dompurify'\n\n// El único sitio de la app donde se crea un objeto { __html }.\nfunction htmlSaneado(html) {\n  return {\n    __html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),\n  }\n}\n\nexport default function CuerpoNoticia({ noticia }) {\n  return (\n    <article>\n      <h2>{noticia.titulo}</h2>\n      <div className=\"cuerpo\" dangerouslySetInnerHTML={htmlSaneado(noticia.cuerpoHtml)} />\n    </article>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import DOMPurify from 'dompurify'",
      "nota": "Se instala con npm install dompurify. Funciona en el navegador; en el servidor necesita un DOM, y su documentación recomienda jsdom, siempre en su última versión."
    },
    {
      "fragmento": "DOMPurify.sanitize(html",
      "nota": "Devuelve el HTML sin lo peligroso. Comprobado con DOMPurify 3.4.17: de la opinión con trampa deja <img src=\"x\">, sin el onerror, y de un script no deja nada. Las etiquetas de formato, como p o strong, se quedan."
    },
    {
      "fragmento": "USE_PROFILES: { html: true }",
      "nota": "Por defecto DOMPurify admite HTML, SVG y MathML. Si solo esperas HTML, este perfil deja fuera los otros dos. Para ser más estricto aún, ALLOWED_TAGS y ALLOWED_ATTR fijan la lista exacta de etiquetas y atributos permitidos."
    },
    {
      "fragmento": "function htmlSaneado(html)",
      "nota": "Sanear y crear el objeto { __html } en el mismo sitio, como recomienda react.dev. Y nada de tocar el HTML después: la documentación de DOMPurify avisa de que modificarlo tras sanearlo puede anular la limpieza."
    },
    {
      "fragmento": "<h2>{noticia.titulo}</h2>",
      "nota": "Solo pasa como HTML lo que tiene que ser HTML. El título es texto y va entre llaves, con el escapado de siempre."
    }
  ]
}
```

### Trusted Types: que el navegador vigile también (19.3)

Hay una defensa más que vive en el propio navegador: Trusted Types. Si tu servidor envía la cabecera `Content-Security-Policy: require-trusted-types-for 'script'`, el navegador rechaza cualquier cadena que se intente meter en `innerHTML` y solo acepta objetos `TrustedHTML` creados por una política tuya, que normalmente sanea con DOMPurify (puede devolver directamente uno de esos objetos con la opción `RETURN_TRUSTED_TYPE: true`).

Antes de React 19.3, React convertía siempre en cadena lo que le dabas en `__html`, y con Trusted Types activo el navegador lo rechazaba. **Desde React 19.3, React pasa el objeto `TrustedHTML` tal cual**, y la política funciona. Es una red de seguridad: un `innerHTML` que se te olvide sanear falla en vez de abrir un agujero.

## URL `javascript:`: React 19 las bloquea

Un enlace cuyo `href` empieza por `javascript:` ejecuta ese código al pulsarlo. Si el `href` sale de un dato que escribió otra persona, como la web personal de un socio del Club de Fotografía Diafragma, el ataque está servido. React 16.9 empezó a avisar en la consola, y en React 18 el aviso decía «A future version of React will block javascript: URLs as a security precaution»: una versión futura de React bloqueará las URL `javascript:` por precaución. **Desde React 19, las bloquea.**

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La web de cada socio, tal como queda en el DOM",
  "consigna": "Pulsa «Ver los href»: el de Hugo ya no es su javascript:, React lo ha cambiado por uno que solo lanza un error. El de Carla, con data:, sigue tal cual: React solo bloquea javascript:. No hace falta que pulses los enlaces: la vista previa no deja abrir ventanas ni ejecutar URL javascript:.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\n// Las webs las escribe cada socio en su perfil.\nconst socios = [\n  { id: 1, nombre: 'Inés Moliner', web: 'https://inesmoliner.example' },\n  { id: 2, nombre: 'Hugo Arnal', web: \"javascript:alert('Te he robado la sesión')\" },\n  { id: 3, nombre: 'Carla Benedí', web: 'data:text/html,<h1>Tu cuota ha caducado</h1>' },\n]\n\nexport default function App() {\n  const [informe, setInforme] = useState([])\n\n  function verHref() {\n    const enlaces = document.querySelectorAll('.socios a')\n    setInforme([...enlaces].map((a) => `${a.textContent}: ${a.getAttribute('href')}`))\n  }\n\n  return (\n    <main>\n      <h1>Socios del Club de Fotografía Diafragma</h1>\n      <ul className=\"socios\">\n        {socios.map((socio) => (\n          <li key={socio.id}>\n            <a href={socio.web} target=\"_blank\" rel=\"noreferrer\">\n              Web de {socio.nombre}\n            </a>\n          </li>\n        ))}\n      </ul>\n      <button type=\"button\" onClick={verHref}>Ver los href</button>\n      <ul className=\"informe\">\n        {informe.map((linea) => (\n          <li key={linea}>{linea}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\n.socios {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\n.informe {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El `href` de Hugo ha quedado así:

```text
javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')
```

Es decir: React ha sustituido su código por uno que solo lanza un error, «React ha bloqueado una URL javascript: por precaución». Fíjate en la consola: **React 19.3.1 no avisa al pintarlo**, lo cambia sin decir nada. El mensaje solo aparece si alguien pulsa el enlace en una página normal: el navegador ejecuta ese `throw` y en la consola sale `Uncaught Error: React has blocked a javascript: URL as a security precaution.` (en esta vista previa no llega a pasar, porque el propio iframe no deja ejecutar URL `javascript:`).

El bloqueo, comprobado en la vista previa, vale para `href`, para el `src` de un `<iframe>` y para el `action` de un `<form>`, también si el texto trae mayúsculas o espacios delante, como `  JaVaScRiPt:`. Y el servidor hace lo mismo: `react-dom/server` escribe esa misma URL en el HTML.

Lo que React **no** hace es decidir si una URL es buena idea. La de Carla, con `data:`, pasa sin cambios, y una `https://` que lleva a una página falsa para robar contraseñas también. **Si una URL viene de fuera, compruébala tú**: la forma robusta es interpretarla con `new URL(texto)` y aceptar solo los protocolos que esperas, normalmente `http:` y `https:`. Lo practicarás en los ejercicios. La guía de OWASP sobre XSS lo resume en una línea: «React 19 blocks javascript: URLs in src and href, but this does not replace application-specific URL validation». React 19 bloquea las URL `javascript:`, pero eso no sustituye a validar las URL según lo que necesite tu aplicación.

## Props que nadie revisó: `{...datos}`

En la lección 8 viste que `{...props}` reenvía al DOM todo lo que trae el objeto, incluido lo que no toca. Si ese objeto viene de fuera (una API, la configuración de un CMS, unos parámetros de la URL), quien lo escribe decide los atributos de tu elemento. Un JSON no puede traer funciones, así que no colará un `onClick`, pero sí `href`, `style`, `className`... y `dangerouslySetInnerHTML`, que es un objeto normal.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una insignia con atributos de más",
  "consigna": "Las insignias llegan de la API como atributos listos para el span. La de Inés es lo esperado; la de Hugo trae un dangerouslySetInnerHTML que pinta un aviso falso del club. Arréglalo en Insignia.jsx: recibe solo className y title y pásalos a mano. Al quitar el reenvío, el aviso falso desaparece.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import Insignia from './Insignia'\nimport './estilos.css'\n\n// Lo que devuelve la API del club. Se esperaba className y title,\n// pero cada socio puede editar su insignia.\nconst socios = JSON.parse(`[\n  {\n    \"id\": 1,\n    \"nombre\": \"Inés Moliner\",\n    \"insignia\": { \"className\": \"insignia oro\", \"title\": \"Primer premio del concurso de otoño\" }\n  },\n  {\n    \"id\": 2,\n    \"nombre\": \"Hugo Arnal\",\n    \"insignia\": {\n      \"className\": \"insignia\",\n      \"dangerouslySetInnerHTML\": { \"__html\": \"<strong>Aviso del club: tu cuota ha caducado. Envía tu contraseña por el chat para renovarla.</strong>\" }\n    }\n  }\n]`)\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Socios del Club de Fotografía Diafragma</h1>\n      <ul className=\"socios\">\n        {socios.map((socio) => (\n          <li key={socio.id}>\n            {socio.nombre} <Insignia {...socio.insignia} />\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Insignia.jsx",
      "codigo": "// Reenvía al span todo lo que llegue.\nexport default function Insignia(props) {\n  return <span {...props} />\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\n.socios {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\n.informe {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  overflow-wrap: anywhere;\n}\n\n.insignia {\n  display: inline-block;\n  min-width: 0.9rem;\n  min-height: 0.9rem;\n  border-radius: 999px;\n  background: #cbd5e1;\n  vertical-align: middle;\n}\n\n.insignia.oro {\n  background: goldenrod;\n}\n"
    }
  ],
  "archivoInicial": "Insignia.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El arreglo es el mismo que en la lección 8, con un motivo más: **saca de los datos lo que esperas y pásalo a mano**. Así cualquier clave que no esperabas se queda fuera sin que tengas que conocerla. Para ir aún más lejos, que la API mande un dato y no un atributo (`"premio": "oro"`) y que sea tu componente quien decida la clase.

## La interfaz no es una barrera: valida en el servidor

Todo lo anterior protege a quien usa tu aplicación. Hay otro frente: **proteger tus datos de quien la usa**. Y ahí la interfaz no sirve de nada. Un botón oculto para quien no es administrador, un campo con `maxLength`, la validación de un formulario (lección 61)... Cualquiera puede abrir las herramientas de desarrollo, quitar el `disabled`, cambiar la petición antes de enviarla o hablar con tu API sin pasar por tu web, con `curl`. Ya lo apuntaba la lección 10: esconder un botón es una decisión de interfaz, no de seguridad.

La regla es simple: **la interfaz ayuda a quien la usa; el servidor decide**. Cada petición que cambia algo comprueba en el servidor quién la hace, si puede hacerlo y si los datos son válidos, como si la interfaz no existiera:

```js
// En el servidor (las funciones auxiliares son inventadas para el ejemplo)
export async function borrarOpinion(peticion) {
  const usuario = await usuarioDeLaSesion(peticion)
  if (!usuario) return respuesta(401, 'Inicia sesión')

  const opinion = await buscarOpinion(peticion.params.id)
  if (opinion.autorId !== usuario.id && !usuario.esAdmin) {
    return respuesta(403, 'Solo puedes borrar tus opiniones')
  }

  await eliminarOpinion(opinion.id)
  return respuesta(204)
}
```

El botón «Borrar» puede seguir apareciendo solo en tus opiniones, porque así la interfaz es más clara. Pero si alguien manda la petición a mano con el id de otra opinión, el servidor contesta 403.

## Secretos en el código del cliente

Todo lo que envías al navegador es público. El JavaScript de tu aplicación se puede leer entero desde las herramientas de desarrollo, aunque Vite lo haya minificado, y eso incluye **cualquier variable de entorno que use el código del cliente**. Vite solo expone las que empiezan por `VITE_`, y su documentación lo advierte así:

> `VITE_*` variables should *not* contain sensitive information such as API keys. The values of these variables are bundled into your source code at build time.

Es decir: las variables `VITE_` no deben contener información sensible, como claves de una API, porque su valor se copia dentro del código al construir.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// .env, en la raíz del proyecto:\n//   VITE_MAPAS_CLAVE_PUBLICA=pk_fresnos_8d2f\n//   PAGOS_CLAVE_SECRETA=sk_live_51Hc\n\nexport default function MapaCamping() {\n  const clavePublica = import.meta.env.VITE_MAPAS_CLAVE_PUBLICA\n  const secreta = import.meta.env.PAGOS_CLAVE_SECRETA\n\n  console.log(secreta) // undefined: sin VITE_, Vite no la mete en el cliente\n  return <div className=\"mapa\" data-clave={clavePublica} />\n}",
  "anotaciones": [
    {
      "fragmento": "VITE_MAPAS_CLAVE_PUBLICA=pk_fresnos_8d2f",
      "nota": "Con el prefijo VITE_, Vite sustituye import.meta.env.VITE_MAPAS_CLAVE_PUBLICA por su valor al construir. Acaba escrita dentro del JavaScript que descarga cualquiera."
    },
    {
      "fragmento": "PAGOS_CLAVE_SECRETA=sk_live_51Hc",
      "nota": "Sin el prefijo, Vite no la expone al código del cliente. Su sitio es el servidor, o una función serverless: el navegador le pide a tu servidor que cobre, y es el servidor quien usa la clave."
    },
    {
      "fragmento": "console.log(secreta)",
      "nota": "undefined, como en el ejemplo de la documentación de Vite. Y no intentes arreglarlo poniéndole VITE_: entonces sí llegaría, y sería pública."
    },
    {
      "fragmento": "const clavePublica = import.meta.env.VITE_MAPAS_CLAVE_PUBLICA",
      "nota": "Algunos servicios dan claves pensadas para ir en el navegador, a las que llaman públicas o publicables. Son seguras porque el servicio limita lo que se puede hacer con ellas. Esta web lleva así la de Supabase, protegida por sus reglas de acceso en la base de datos (lección 86)."
    }
  ]
}
```

La lección 85 vuelve a las variables de entorno, esta vez para construir y desplegar: los archivos `.env` de cada modo y cómo los usa Vite.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Las dependencias también son tu código",
  "contenido": "Cada paquete de npm que instalas se ejecuta con los mismos permisos que tu código: en el navegador ve lo mismo que tu aplicación, y al instalarse puede ejecutar sus propios scripts en tu ordenador. Instala pocos y conocidos, guarda el package-lock.json en el repositorio para instalar siempre lo mismo, pasa npm audit de vez en cuando y actualiza cuando salga un aviso de seguridad. Es un tema de toda la web, no solo de React, y este temario no entra más."
}
```

## Server Functions: una puerta al servidor que cualquiera puede llamar

En los frameworks con Server Components (módulo 13), una función marcada con `'use server'` se puede llamar desde el navegador como si fuera local. Por debajo, React la convierte en una dirección HTTP de tu servidor, y **a esa dirección puede llamar cualquiera, con los argumentos que quiera**. La documentación de `'use server'` lo dice sin rodeos: «Arguments to Server Functions are fully client-controlled», los argumentos los controla por completo el cliente.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "'use server'\n\nimport { z } from 'zod'\n\nconst esquemaOpinion = z.object({\n  parcela: z.string().regex(/^[A-Z][0-9]{1,2}$/),\n  texto: z.string().trim().min(1).max(1000),\n})\n\n// usuarioActual y guardarOpinion son funciones de tu proyecto.\nexport async function publicarOpinion(datos) {\n  const usuario = await usuarioActual()\n  if (!usuario) throw new Error('Inicia sesión para opinar')\n\n  const opinion = esquemaOpinion.parse(datos)\n  await guardarOpinion({ ...opinion, autorId: usuario.id })\n}",
  "anotaciones": [
    {
      "fragmento": "'use server'",
      "nota": "Todo lo que exporta este archivo se puede llamar desde el cliente. Trata cada función como una ruta pública de tu API, porque lo es."
    },
    {
      "fragmento": "const usuario = await usuarioActual()",
      "nota": "La documentación de use server pide comprobar en cada función que el usuario conectado puede hacer esa acción. Que el botón solo salga a quien ha iniciado sesión no impide llamar a la función sin sesión."
    },
    {
      "fragmento": "esquemaOpinion.parse(datos)",
      "nota": "Los argumentos llegan del cliente: valídalos siempre, aquí con Zod, igual que validarías el cuerpo de cualquier petición (lección 61). Si no cumplen el esquema, parse lanza un error y no se guarda nada."
    },
    {
      "fragmento": "autorId: usuario.id",
      "nota": "El autor sale de la sesión, nunca de los argumentos. Si lo aceptaras de datos, cualquiera podría publicar en nombre de otro."
    }
  ]
}
```

Y una lección de humildad: en diciembre de 2025, el equipo de React publicó una vulnerabilidad crítica (CVE-2025-55182, con la nota máxima de gravedad, 10 sobre 10) en la forma en que React decodificaba las peticiones a las Server Functions. Permitía ejecutar código en el servidor sin iniciar sesión, aunque tu código validara todo, y afectaba a las versiones 19.0, 19.1.0, 19.1.1 y 19.2.0 de los paquetes de Server Components. Se corrigió en 19.0.1, 19.1.2 y 19.2.1, aunque esas correcciones se quedaron cortas y hubo avisos posteriores: las versiones que React da hoy por seguras son 19.0.4, 19.1.5 y 19.2.4. **Actualizar las dependencias también es seguridad.** La lección 89 cuenta el caso entero.

## Cuándo lo usarías de verdad

Cada vez que revises un componente con ojos de atacante. Estas preguntas cubren lo que has visto:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "¿Hay un dangerouslySetInnerHTML?",
      "texto": "Búscalo por su nombre. ¿De dónde viene ese HTML? ¿Se sanea justo antes de pintarlo, en un solo sitio? ¿Hace falta de verdad, o bastaría con JSX y un poco de CSS?"
    },
    {
      "titulo": "¿Algún href o src sale de un dato?",
      "texto": "React bloquea javascript:, pero no data: ni una web de phishing. Si la URL la escribió otra persona, comprueba su protocolo con new URL."
    },
    {
      "titulo": "¿Algún {...algo} acaba en una etiqueta del DOM?",
      "texto": "Si el objeto viene de fuera, quien lo escribe decide tus atributos. Saca lo que esperas y pásalo a mano."
    },
    {
      "titulo": "¿Hay algo en import.meta.env.VITE_ que no pondrías en un cartel?",
      "texto": "Todo lo que llega al navegador es público. Las claves secretas, en el servidor."
    },
    {
      "titulo": "¿Esta acción la comprueba el servidor?",
      "texto": "Permisos y validación, en el servidor o en la Server Function, como si la interfaz no existiera."
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
      "mito": "React me protege del XSS",
      "realidad": "Del caso más común, el texto entre llaves, y de las URL javascript:. No de dangerouslySetInnerHTML, ni de una URL data: o de phishing, ni de las props que reenvías sin mirar, ni de lo que hagas a mano con innerHTML a través de una ref."
    },
    {
      "mito": "Si quito las etiquetas script del HTML, ya es seguro",
      "realidad": "Un script que llega por innerHTML ni siquiera se ejecuta. Lo peligroso son atributos como onerror u onload, enlaces javascript: y muchos trucos más. Sanear es trabajo de una librería como DOMPurify, no de un replace."
    },
    {
      "mito": "Una variable de entorno es secreta",
      "realidad": "Solo mientras no llegue al navegador. Las VITE_ se copian en el JavaScript al construir y cualquiera puede leerlas."
    },
    {
      "mito": "Si el botón no sale, nadie puede hacer esa acción",
      "realidad": "Cualquiera puede llamar a tu API sin pasar por tu interfaz. Lo que no compruebe el servidor, no está comprobado."
    },
    {
      "mito": "Una vez saneado, el HTML se puede retocar",
      "realidad": "La documentación de DOMPurify avisa de que modificar el HTML después de sanearlo puede anular la limpieza. Sanea lo último, justo antes de pintar."
    }
  ]
}
```

## Errores típicos

**Usar `dangerouslySetInnerHTML` para algo que no lo necesita.** El caso más común: respetar los saltos de línea de un texto convirtiéndolos en `<br>`. Funciona, y de paso convierte en HTML todo lo demás que traiga el texto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Saltos de línea sin abrir la puerta",
  "consigna": "La opinión respeta sus saltos de línea, pero también interpreta su HTML: la palabra «limpísimos» sale en negrita, y podría haber sido cualquier otra cosa. Arréglalo sin dangerouslySetInnerHTML: pinta {texto} entre llaves y añade white-space: pre-line a .opinion en estilos.css. El navegador respetará los saltos de línea y el HTML se verá como texto.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nconst texto = `Llegamos de noche y nos esperaron en recepción.\nLos baños, <b>limpísimos</b>.\nRepetiremos en Semana Santa.`\n\nexport default function App() {\n  const conSaltos = texto.replaceAll('\\n', '<br>')\n\n  return (\n    <main>\n      <h1>Opinión de Marisa</h1>\n      <p className=\"opinion\" dangerouslySetInnerHTML={{ __html: conSaltos }} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\n.opinion {\n  padding: 0.75rem 1rem;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

**Pintar un `href` que viene de fuera sin comprobarlo.** React 19 frena `javascript:`, y nada más. Comprueba el protocolo con `new URL`.

**Reenviar a una etiqueta del DOM un objeto que no has escrito tú.** `<div {...datosDeLaApi} />` deja que la API decida tus atributos, `dangerouslySetInnerHTML` incluido.

**Una clave secreta en una variable `VITE_`.** Acaba en el JavaScript que descarga cualquiera. Si el código del cliente la necesita, es que esa operación tiene que hacerla el servidor.

**Validar solo en el formulario.** La validación del cliente es para ayudar a quien escribe. La de verdad se repite en el servidor o en la Server Function.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Resaltar la búsqueda sin abrir la puerta",
  "consigna": "El buscador resalta lo que escribes con mark, pero monta HTML a mano: la opinión con trampa pinta su imagen y ejecuta su onerror (por eso el fondo sale rojo). Reescribe Resaltado sin dangerouslySetInnerHTML: sin búsqueda, devuelve el texto tal cual; con búsqueda, parte el texto con split(busqueda) y pinta cada trozo, con un mark con la búsqueda entre trozo y trozo. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Resaltado from './Resaltado'\nimport './estilos.css'\n\nconst opiniones = [\n  { id: 1, autor: 'Nerea', texto: 'Parcelas con mucha sombra y la piscina siempre limpia.' },\n  { id: 2, autor: 'Visitante', texto: `<img src=\"x\" onerror=\"document.body.style.background='crimson'\"> ¡Las duchas, de diez!` },\n  { id: 3, autor: 'Íñigo', texto: 'La piscina abre tarde, pero el río compensa.' },\n]\n\nexport default function App() {\n  const [busqueda, setBusqueda] = useState('')\n  const visibles = opiniones.filter((opinion) => opinion.texto.includes(busqueda))\n\n  return (\n    <main>\n      <h1>Opiniones del Camping Los Fresnos</h1>\n      <label htmlFor=\"busqueda\">Buscar en las opiniones</label>{' '}\n      <input id=\"busqueda\" type=\"search\" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />\n      <ul className=\"resenas\">\n        {visibles.map((opinion) => (\n          <li key={opinion.id}>\n            <strong>{opinion.autor}</strong>\n            <p>\n              <Resaltado texto={opinion.texto} busqueda={busqueda} />\n            </p>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Resaltado.jsx",
      "codigo": "// Resalta la búsqueda envolviéndola en <mark>... montando HTML a mano.\n// Reescríbelo con JSX, sin dangerouslySetInnerHTML.\nexport default function Resaltado({ texto, busqueda }) {\n  const html = busqueda ? texto.replaceAll(busqueda, `<mark>${busqueda}</mark>`) : texto\n  return <span dangerouslySetInnerHTML={{ __html: html }} />\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  color: #14532d;\n  font-size: 1.3rem;\n}\n\n.resenas {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\n.resenas li {\n  padding: 0.6rem 0.8rem;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\n.resenas p {\n  margin: 0.25rem 0 0;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\npre {\n  padding: 0.6rem;\n  border-radius: 6px;\n  background: #1e293b;\n  color: #e2e8f0;\n  font-size: 0.75rem;\n  white-space: pre-wrap;\n  overflow-wrap: anywhere;\n}\n\ninput {\n  padding: 0.3rem 0.5rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  font: inherit;\n}\n\nmark {\n  background: #fde68a;\n}\n"
    }
  ],
  "archivoInicial": "Resaltado.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Sin búsqueda, la opinión con trampa se lee como texto, con su etiqueta img a la vista",
      "pasos": [],
      "espera": {
        "texto": "<img src=\"x\" onerror=\"document.body.style.background='crimson'\"> ¡Las duchas, de diez!"
      }
    },
    {
      "descripcion": "Sin búsqueda, no se cuela ninguna imagen en las opiniones",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "img"
        }
      }
    },
    {
      "descripcion": "Al buscar «piscina», la palabra sale resaltada",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en las opiniones",
            "texto": "piscina"
          }
        }
      ],
      "espera": {
        "texto": "piscina"
      }
    },
    {
      "descripcion": "Al buscar «duchas», tampoco se cuela ninguna imagen",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en las opiniones",
            "texto": "duchas"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "img"
        }
      }
    },
    {
      "descripcion": "Al buscar «duchas», la palabra sale resaltada dentro de la opinión con trampa",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en las opiniones",
            "texto": "duchas"
          }
        }
      ],
      "espera": {
        "texto": "duchas"
      }
    },
    {
      "descripcion": "Lo que escribes en el buscador también es texto: buscar «<img» resalta «<img» tal cual",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Buscar en las opiniones",
            "texto": "<img"
          }
        }
      ],
      "espera": {
        "texto": "<img"
      }
    }
  ]
}
```

La `key` con el índice es aceptable aquí: los trozos salen del texto en cada render, no se reordenan y no tienen estado (lección 11).

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Solo enlaces http y https",
  "consigna": "Cada socio escribe su web, y ahora todas se pintan como enlace. Haz que solo sean enlace las que, interpretadas con new URL(socio.web), tengan el protocolo http: o https:. Ojo: new URL lanza un error si el texto no es una URL completa. Para las demás, pinta un span con el texto «Web de Nombre Apellido: no válida». Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import './estilos.css'\n\nconst socios = [\n  { id: 1, nombre: 'Inés Moliner', web: 'https://inesmoliner.example' },\n  { id: 2, nombre: 'Hugo Arnal', web: \"javascript:alert('Te he robado la sesión')\" },\n  { id: 3, nombre: 'Carla Benedí', web: 'data:text/html,<h1>Tu cuota ha caducado</h1>' },\n  { id: 4, nombre: 'Pau Gracia', web: 'www.paugracia.example' },\n  { id: 5, nombre: 'Lucía Sanz', web: 'HTTPS://LUCIASANZ.EXAMPLE/galeria' },\n]\n\n// Escribe aquí una función que diga si una web se puede enlazar.\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Socios del Club de Fotografía Diafragma</h1>\n      <ul className=\"socios\">\n        {socios.map((socio) => (\n          <li key={socio.id}>\n            <a href={socio.web} target=\"_blank\" rel=\"noreferrer\">\n              Web de {socio.nombre}\n            </a>\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  font-size: 1.3rem;\n}\n\n.socios {\n  display: grid;\n  gap: 0.4rem;\n  padding: 0;\n  list-style: none;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\n.informe {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "La web de Inés, con https:, es un enlace",
      "pasos": [],
      "espera": {
        "rol": "link",
        "nombre": "Web de Inés Moliner"
      }
    },
    {
      "descripcion": "La de Hugo, con javascript:, no es un enlace",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "link",
          "nombre": "Web de Hugo Arnal"
        }
      }
    },
    {
      "descripcion": "La de Carla, con data:, tampoco",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "link",
          "nombre": "Web de Carla Benedí"
        }
      }
    },
    {
      "descripcion": "La de Pau, sin protocolo, no rompe la página: dice «Web de Pau Gracia: no válida»",
      "pasos": [],
      "espera": {
        "texto": "Web de Pau Gracia: no válida"
      }
    },
    {
      "descripcion": "La de Lucía, con el protocolo en mayúsculas, también es un enlace",
      "pasos": [],
      "espera": {
        "rol": "link",
        "nombre": "Web de Lucía Sanz"
      }
    }
  ]
}
```

`new URL` pasa el protocolo a minúsculas, por eso la web de Lucía vale aunque esté escrita en mayúsculas, y una comparación con `startsWith('https://')` la habría rechazado. Y si te olvidas del `try`/`catch`, la web de Pau tumba la página entera: en Chrome, la vista previa enseña «Failed to construct 'URL': Invalid URL», es decir, no se pudo construir la URL porque no es válida. Esta web valida igual los enlaces de sus lecciones.

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio del buscador, haz que la búsqueda no distinga mayúsculas: que «Piscina» encuentre «piscina». Pista: compara en minúsculas para encontrar las posiciones, pero pinta los trozos del texto original.
2. En el de los socios, añade un socio con `web: 'http://localhost:5173'`. ¿Lo dejarías pasar en una web de verdad? Haz que solo se acepten `https:`.
3. Vuelve al ejemplo de la insignia y cambia la API para que mande `"premio": "oro"` en vez de atributos. Que sea `Insignia` quien decida la clase y el `title`.
4. Busca en un proyecto tuyo, o en uno de código abierto, `dangerouslySetInnerHTML`. Para cada uso, contesta: ¿de dónde viene el HTML?, ¿quién puede escribirlo?, ¿se sanea?

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Dangerously setting the inner HTML",
      "descripcion": "La sección de react.dev sobre dangerouslySetInnerHTML: el ejemplo con Markdown, por qué crear el objeto __html cerca de donde se genera y el agujero que abre.",
      "url": "https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "DOMPurify",
      "descripcion": "El saneador de HTML de referencia: uso, opciones de configuración, Trusted Types y cómo usarlo en el servidor.",
      "url": "https://github.com/cure53/DOMPurify",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Trusted Types API",
      "descripcion": "Cómo pide el navegador objetos de confianza en lugar de cadenas para innerHTML y compañía, y cómo se activa con Content Security Policy.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Env Variables and Modes",
      "descripcion": "Qué variables expone Vite al cliente, el prefijo VITE_ y su aviso sobre los secretos.",
      "url": "https://vite.dev/guide/env-and-mode",
      "etiqueta": "Vite"
    },
    {
      "titulo": "'use server': Security considerations",
      "descripcion": "Por qué los argumentos de una Server Function son entrada no fiable y qué comprobar en cada una.",
      "url": "https://react.dev/reference/rsc/use-server#security",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Cross Site Scripting Prevention Cheat Sheet",
      "descripcion": "La guía de OWASP sobre XSS, con un apartado específico de los riesgos en frameworks como React.",
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
      "etiqueta": "OWASP"
    }
  ]
}
```
