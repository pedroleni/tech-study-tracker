# `<title>`, `<meta>`, `<link>`, `<style>` y `<script>` desde un componente

- **Módulo:** Calidad y producción
- **Slug:** `title-meta-link-style-y-script-desde-un-componente` (autogenerado del título)
- **Orden:** 810
- **Fuentes:** [`<title>`](https://react.dev/reference/react-dom/components/title) + [`<meta>`](https://react.dev/reference/react-dom/components/meta) + [`<link>`](https://react.dev/reference/react-dom/components/link) + [`<style>`](https://react.dev/reference/react-dom/components/style) + [`<script>`](https://react.dev/reference/react-dom/components/script) + [preload](https://react.dev/reference/react-dom/preload) — ver `contenido/react/TEMARIO.md` #81

---

## Qué es y para qué sirve

El título de la pestaña, la descripción que enseñan los buscadores o el icono de la página viven en el `<head>` del documento: lo viste en la lección 4 del temario de HTML, «Qué va en el head». Una aplicación de React, en cambio, se monta dentro de un `<div id="root">` que está en el `<body>`, y todo lo que pintan tus componentes acaba ahí dentro. ¿Cómo cambia entonces el título una pantalla que solo existe en React?

Hasta React 18 había dos caminos: un efecto que escribía `document.title = ...` a mano (los efectos son la lección 38) o una librería como React Helmet. **Desde React 19, un componente puede pintar `<title>`, `<meta>` y `<link>` en cualquier sitio de su JSX, y React los coloca en el `<head>` del documento.** Con `<style>` y `<script>` hace lo mismo si se lo pides con un par de props. Así cada pantalla declara sus propios metadatos, al lado del resto de su interfaz, y desaparecen con ella.

Para verlo, los ejemplos de esta lección llevan un componente `MirarHead`, en su propia pestaña, con un botón «Mirar el head»: lee `document.title` y las etiquetas del `<head>` en el momento de pulsarlo, y te las enseña. Al cargar apunta lo que ya traía la vista previa (su CSS, el propio React) y solo te enseña lo que llega después.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un título y una meta pintados dentro de un artículo",
  "consigna": "Pulsa «Mirar el head»: el title y la meta están en el JSX de Bandeja, dentro del article, pero React los ha puesto en el head. Cambia el texto del title, pulsa otra vez y compara.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import MirarHead from './MirarHead'\nimport './estilos.css'\n\nfunction Bandeja() {\n  return (\n    <article>\n      <title>Bandeja de entrada · Correo Cierzo</title>\n      <meta name=\"robots\" content=\"noindex\" />\n      <h1>Bandeja de entrada</h1>\n      <p>Tienes 3 mensajes sin leer.</p>\n    </article>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <Bandeja />\n      <MirarHead />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "MirarHead.jsx",
      "codigo": "import { useState } from 'react'\n\n// Lo que ya traía el <head> de la vista previa al cargar (su CSS, el propio\n// React...). No se enseña: solo interesa lo que llegue después.\nconst deLaVistaPrevia = new Set(document.head.children)\n\nfunction recortar(valor) {\n  return valor.length > 64 ? valor.slice(0, 61) + '…' : valor\n}\n\nfunction describir(nodo) {\n  const etiqueta = nodo.tagName.toLowerCase()\n  const atributos = [...nodo.attributes]\n    .map((a) => ` ${a.name}=\"${recortar(a.value)}\"`)\n    .join('')\n  if (etiqueta === 'title') return `<title${atributos}>${nodo.textContent}</title>`\n  if (etiqueta === 'style') return `<style${atributos}>…</style>`\n  if (etiqueta === 'script') return `<script${atributos}></script>`\n  return `<${etiqueta}${atributos}>`\n}\n\nexport default function MirarHead() {\n  const [foto, setFoto] = useState(null)\n\n  // Lee el DOM en el momento del clic: es una foto, no se actualiza sola.\n  function mirar() {\n    const nuevas = [...document.head.children].filter((nodo) => !deLaVistaPrevia.has(nodo))\n    setFoto({ titulo: document.title, lineas: nuevas.map(describir) })\n  }\n\n  return (\n    <section className=\"mirar-head\" aria-label=\"El head de la vista previa\">\n      <button type=\"button\" onClick={mirar}>\n        Mirar el head\n      </button>\n      {foto && (\n        <>\n          <p>{`document.title: «${foto.titulo}»`}</p>\n          {foto.lineas.length === 0 ? (\n            <p>React no ha puesto nada en el head.</p>\n          ) : (\n            <ol>\n              {foto.lineas.map((linea, i) => (\n                <li key={i}>\n                  <code>{linea}</code>\n                </li>\n              ))}\n            </ol>\n          )}\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\n.mensajes {\n  display: grid;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.mensajes button {\n  width: 100%;\n  text-align: left;\n}\n\n.mensajes .nuevo {\n  border-left: 5px solid #0369a1;\n  font-weight: 600;\n}\n\n.mensajes .leido {\n  color: #475569;\n}\n\n.mirar-head {\n  margin-top: 1rem;\n  padding-top: 0.75rem;\n  border-top: 2px dashed #94a3b8;\n}\n\n.mirar-head p {\n  margin: 0.5rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.mirar-head ol {\n  margin: 0.5rem 0 0;\n  padding-left: 1.5rem;\n  font-size: 0.8rem;\n}\n\n.mirar-head code {\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "La vista previa es otro documento",
  "contenido": "La vista previa de cada ejemplo es un iframe: un documento HTML aparte, con su propio head. El título que pone React es el de ese documento, no el de esta página, así que la pestaña de tu navegador seguirá diciendo lo mismo. Por eso el botón lee document.title y te lo enseña, en vez de pedirte que mires la pestaña."
}
```

La `<meta name="robots" content="noindex">` le pide a los buscadores que no indexen la página: tiene sentido en una bandeja de entrada, que es privada. Y fíjate en que el `<title>` ya no está en el `<article>`: **en el DOM, React lo ha sacado del sitio donde lo escribiste**. Para tu componente no hay diferencia: lo pinta como cualquier otra etiqueta.

## Qué sube al `<head>` y qué se queda donde está

No todo lo que se parece a una etiqueta del `<head>` acaba allí. Estas son las reglas de React 19.3, comprobadas en la vista previa:

- **`<title>` y `<meta>`** van siempre al `<head>`. Las excepciones: con la prop `itemProp`, que describe un trozo de la página y no el documento entero, y un `<title>` dentro de un `<svg>`, que es el nombre accesible del dibujo.
- **`<link>`** va al `<head>`: el icono, la URL canónica, las versiones en otros idiomas... Una hoja de estilos, `rel="stylesheet"`, solo sube si además lleva `precedence`. Y ningún `<link>` sube si lleva `itemProp`, `onLoad` u `onError`.
- **`<style>`** solo sube con `href` y `precedence`.
- **`<script>`** solo sube con `src` y `async`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function FichaCorto() {\n  return (\n    <article itemScope itemType=\"https://schema.org/Movie\">\n      <title>Lluvia en Teruel · Festival de Albarracín</title>\n      <meta itemProp=\"duration\" content=\"PT14M\" />\n      <link rel=\"stylesheet\" href=\"/estilos/ficha.css\" />\n      <h1 itemProp=\"name\">Lluvia en Teruel</h1>\n    </article>\n  )\n}",
  "opciones": [
    "Ninguna: React sube las tres etiquetas al head",
    "La meta y el link: la meta lleva itemProp y el link es una hoja sin precedence",
    "Solo el link: una meta va siempre al head",
    "Las tres: React solo mueve lo que está fuera de un article"
  ],
  "correcta": 1,
  "explicacion": "Solo el title sube al head. La meta con itemProp describe la película de este article (para los datos estructurados de schema.org), así que se queda dentro. El link es una hoja de estilos sin precedence: React no sabría dónde ordenarla, y la deja donde está, como una etiqueta normal."
}
```

Lo que no sube se pinta donde lo escribiste, como cualquier otra etiqueta. Un `<link rel="stylesheet">` en mitad del `<body>` funciona en el navegador, pero React no lo ordena ni evita duplicados: eso es justo lo que añade `precedence`, un poco más abajo.

## Un título que sigue al estado: «(3) Bandeja de entrada»

El `<title>` es una parte más de lo que devuelve tu componente: si su texto sale del estado, cambia cuando cambia el estado, sin efectos y sin tocar `document.title`. El cliente de correo Correo Cierzo pone delante del título cuántos mensajes quedan sin leer, como hacen casi todos los clientes de correo: así se ve desde la pestaña aunque estés en otra.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Los mensajes sin leer, en el título",
  "consigna": "Abre los mensajes en negrita (al abrirlos quedan leídos) y pulsa «Mirar el head» después de cada uno: el número del título baja. Con todo leído, el título se queda en «Bandeja de entrada», sin paréntesis.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport MirarHead from './MirarHead'\nimport './estilos.css'\n\nconst mensajesIniciales = [\n  { id: 1, de: 'Rocío Lasheras', asunto: 'Fotos de la excursión al Moncayo', leido: false },\n  { id: 2, de: 'Comunidad de regantes', asunto: 'Turno de riego de la semana', leido: false },\n  { id: 3, de: 'Biblioteca municipal', asunto: 'Tu préstamo vence el viernes', leido: true },\n  { id: 4, de: 'Ayuntamiento de Tarazona', asunto: 'Cita para renovar el DNI', leido: false },\n]\n\nexport default function App() {\n  const [mensajes, setMensajes] = useState(mensajesIniciales)\n  const noLeidos = mensajes.filter((m) => !m.leido).length\n  const titulo = noLeidos > 0 ? `(${noLeidos}) Bandeja de entrada` : 'Bandeja de entrada'\n\n  function abrir(id) {\n    setMensajes(mensajes.map((m) => (m.id === id ? { ...m, leido: true } : m)))\n  }\n\n  return (\n    <main>\n      <title>{titulo}</title>\n      <h1>Bandeja de entrada</h1>\n      <ul className=\"mensajes\">\n        {mensajes.map((m) => (\n          <li key={m.id}>\n            <button type=\"button\" className={m.leido ? 'leido' : 'nuevo'} onClick={() => abrir(m.id)}>\n              <strong>{m.de}</strong> {m.asunto}\n            </button>\n          </li>\n        ))}\n      </ul>\n      <MirarHead />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "MirarHead.jsx",
      "codigo": "import { useState } from 'react'\n\n// Lo que ya traía el <head> de la vista previa al cargar (su CSS, el propio\n// React...). No se enseña: solo interesa lo que llegue después.\nconst deLaVistaPrevia = new Set(document.head.children)\n\nfunction recortar(valor) {\n  return valor.length > 64 ? valor.slice(0, 61) + '…' : valor\n}\n\nfunction describir(nodo) {\n  const etiqueta = nodo.tagName.toLowerCase()\n  const atributos = [...nodo.attributes]\n    .map((a) => ` ${a.name}=\"${recortar(a.value)}\"`)\n    .join('')\n  if (etiqueta === 'title') return `<title${atributos}>${nodo.textContent}</title>`\n  if (etiqueta === 'style') return `<style${atributos}>…</style>`\n  if (etiqueta === 'script') return `<script${atributos}></script>`\n  return `<${etiqueta}${atributos}>`\n}\n\nexport default function MirarHead() {\n  const [foto, setFoto] = useState(null)\n\n  // Lee el DOM en el momento del clic: es una foto, no se actualiza sola.\n  function mirar() {\n    const nuevas = [...document.head.children].filter((nodo) => !deLaVistaPrevia.has(nodo))\n    setFoto({ titulo: document.title, lineas: nuevas.map(describir) })\n  }\n\n  return (\n    <section className=\"mirar-head\" aria-label=\"El head de la vista previa\">\n      <button type=\"button\" onClick={mirar}>\n        Mirar el head\n      </button>\n      {foto && (\n        <>\n          <p>{`document.title: «${foto.titulo}»`}</p>\n          {foto.lineas.length === 0 ? (\n            <p>React no ha puesto nada en el head.</p>\n          ) : (\n            <ol>\n              {foto.lineas.map((linea, i) => (\n                <li key={i}>\n                  <code>{linea}</code>\n                </li>\n              ))}\n            </ol>\n          )}\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\n.mensajes {\n  display: grid;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.mensajes button {\n  width: 100%;\n  text-align: left;\n}\n\n.mensajes .nuevo {\n  border-left: 5px solid #0369a1;\n  font-weight: 600;\n}\n\n.mensajes .leido {\n  color: #475569;\n}\n\n.mirar-head {\n  margin-top: 1rem;\n  padding-top: 0.75rem;\n  border-top: 2px dashed #94a3b8;\n}\n\n.mirar-head p {\n  margin: 0.5rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.mirar-head ol {\n  margin: 0.5rem 0 0;\n  padding-left: 1.5rem;\n  font-size: 0.8rem;\n}\n\n.mirar-head code {\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El título no se guarda en ningún sitio: **se calcula en cada render a partir de los mensajes**. Es estado derivado, como en la lección 24. React compara el texto nuevo con el anterior y, si ha cambiado, cambia el del `<title>` que ya está en el `<head>`.

Fíjate también en cómo se construye: con una plantilla de texto guardada en `titulo`, que es **una sola cadena**. Un `<title>` solo admite texto, y si escribes `<title>({noLeidos}) Bandeja de entrada</title>`, con las llaves en medio, el título se queda vacío. Lo verás en «Errores típicos».

## Un título por página

En una aplicación con varias pantallas, **cada pantalla pinta su propio `<title>`**. Al cambiar de pantalla, la anterior se desmonta y React quita del `<head>` su título y sus `<meta>`; la nueva pone los suyos. Con React Router (lecciones 76 y 77) cada ruta es un componente; aquí basta con un estado que dice qué pantalla se ve.

La web del Festival de Cortos de Albarracín tiene un programa, una página de sedes y una ficha por corto. Para no repetir el nombre del festival en cada una, un componente pequeño, `TituloPagina`, compone el título completo a partir de una prop de texto.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cada pantalla del festival, con su título y sus metadatos",
  "consigna": "Pulsa «Mirar el head» en Programa y en Sedes. Después abre la ficha de un corto: además de su título aparecen su descripción, sus etiquetas Open Graph y su URL canónica. Vuelve al programa y mira otra vez: se han ido con la ficha.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport FichaCorto from './FichaCorto'\nimport MirarHead from './MirarHead'\nimport TituloPagina from './TituloPagina'\nimport './estilos.css'\n\nconst cortos = [\n  { id: 'lluvia-en-teruel', titulo: 'Lluvia en Teruel', direccion: 'Marta Ibáñez', sinopsis: 'Una tormenta deja aislado un pueblo de la sierra.' },\n  { id: 'la-ultima-trilla', titulo: 'La última trilla', direccion: 'Jorge Lafuente', sinopsis: 'Tres hermanos recuperan la era de su abuelo un verano.' },\n  { id: 'cierzo', titulo: 'Cierzo', direccion: 'Lucía Gimeno', sinopsis: 'Un ciclista contra el viento, de Zaragoza a Tudela.' },\n]\n\nfunction Programa({ onAbrir }) {\n  return (\n    <section>\n      <TituloPagina texto=\"Programa\" />\n      <h1>Programa</h1>\n      <ul>\n        {cortos.map((corto) => (\n          <li key={corto.id}>\n            <button type=\"button\" onClick={() => onAbrir(corto.id)}>\n              {corto.titulo}\n            </button>{' '}\n            de {corto.direccion}\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n\nfunction Sedes() {\n  return (\n    <section>\n      <TituloPagina texto=\"Sedes\" />\n      <h1>Sedes</h1>\n      <p>Teatro de la Comunidad, Palacio Episcopal y Plaza Mayor.</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [pagina, setPagina] = useState('programa')\n  const corto = cortos.find((c) => c.id === pagina)\n\n  return (\n    <main>\n      <nav aria-label=\"Secciones\">\n        <button type=\"button\" onClick={() => setPagina('programa')}>Programa</button>\n        <button type=\"button\" onClick={() => setPagina('sedes')}>Sedes</button>\n      </nav>\n      {pagina === 'programa' && <Programa onAbrir={setPagina} />}\n      {pagina === 'sedes' && <Sedes />}\n      {corto && <FichaCorto corto={corto} onVolver={() => setPagina('programa')} />}\n      <MirarHead />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TituloPagina.jsx",
      "codigo": "// Un solo sitio que decide cómo se escribe el título de cada pantalla.\nexport default function TituloPagina({ texto }) {\n  return <title>{`${texto} · Festival de Cortos de Albarracín`}</title>\n}\n"
    },
    {
      "nombre": "FichaCorto.jsx",
      "codigo": "import TituloPagina from './TituloPagina'\n\nconst WEB = 'https://festivalalbarracin.example'\n\nexport default function FichaCorto({ corto, onVolver }) {\n  const url = `${WEB}/cortos/${corto.id}`\n\n  return (\n    <article>\n      <TituloPagina texto={corto.titulo} />\n      <meta name=\"description\" content={corto.sinopsis} />\n      <meta property=\"og:title\" content={corto.titulo} />\n      <meta property=\"og:description\" content={corto.sinopsis} />\n      <meta property=\"og:image\" content={`${WEB}/og/${corto.id}.jpg`} />\n      <meta property=\"og:url\" content={url} />\n      <link rel=\"canonical\" href={url} />\n      <h1>{corto.titulo}</h1>\n      <p>Dirección: {corto.direccion}</p>\n      <p>{corto.sinopsis}</p>\n      <button type=\"button\" onClick={onVolver}>\n        Volver al programa\n      </button>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "MirarHead.jsx",
      "codigo": "import { useState } from 'react'\n\n// Lo que ya traía el <head> de la vista previa al cargar (su CSS, el propio\n// React...). No se enseña: solo interesa lo que llegue después.\nconst deLaVistaPrevia = new Set(document.head.children)\n\nfunction recortar(valor) {\n  return valor.length > 64 ? valor.slice(0, 61) + '…' : valor\n}\n\nfunction describir(nodo) {\n  const etiqueta = nodo.tagName.toLowerCase()\n  const atributos = [...nodo.attributes]\n    .map((a) => ` ${a.name}=\"${recortar(a.value)}\"`)\n    .join('')\n  if (etiqueta === 'title') return `<title${atributos}>${nodo.textContent}</title>`\n  if (etiqueta === 'style') return `<style${atributos}>…</style>`\n  if (etiqueta === 'script') return `<script${atributos}></script>`\n  return `<${etiqueta}${atributos}>`\n}\n\nexport default function MirarHead() {\n  const [foto, setFoto] = useState(null)\n\n  // Lee el DOM en el momento del clic: es una foto, no se actualiza sola.\n  function mirar() {\n    const nuevas = [...document.head.children].filter((nodo) => !deLaVistaPrevia.has(nodo))\n    setFoto({ titulo: document.title, lineas: nuevas.map(describir) })\n  }\n\n  return (\n    <section className=\"mirar-head\" aria-label=\"El head de la vista previa\">\n      <button type=\"button\" onClick={mirar}>\n        Mirar el head\n      </button>\n      {foto && (\n        <>\n          <p>{`document.title: «${foto.titulo}»`}</p>\n          {foto.lineas.length === 0 ? (\n            <p>React no ha puesto nada en el head.</p>\n          ) : (\n            <ol>\n              {foto.lineas.map((linea, i) => (\n                <li key={i}>\n                  <code>{linea}</code>\n                </li>\n              ))}\n            </ol>\n          )}\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav {\n  display: flex;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  color: #7c2d12;\n  font-size: 1.3rem;\n}\n\n.mirar-head {\n  margin-top: 1rem;\n  padding-top: 0.75rem;\n  border-top: 2px dashed #94a3b8;\n}\n\n.mirar-head p {\n  margin: 0.5rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.mirar-head ol {\n  margin: 0.5rem 0 0;\n  padding-left: 1.5rem;\n  font-size: 0.8rem;\n}\n\n.mirar-head code {\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

`TituloPagina` recibe el texto en una prop, `texto`, y no como `children`, a propósito: con `<TituloPagina>Sedes ({n})</TituloPagina>` le llegaría un array de trozos, y la plantilla de texto lo convertiría en «Sedes (,3,)». Con una prop de texto, quien la usa construye la cadena entera.

Dos detalles que conviene saber, los dos comprobados con React 19.3.1:

- **El `<title>` de tu `index.html` no estorba.** Si tu página ya trae uno, como el «Vite + React» de la plantilla de Vite (lección 2), React pone el suyo delante y el navegador usa el primero. Cuando ningún componente pinta un título, vuelve a verse el del `index.html`: es un buen título por defecto.
- **Un solo `<title>` a la vez.** Si `App` pinta `<title>Festival</title>` y la pantalla pinta otro, React mete los dos en el `<head>`. Hoy el navegador acaba usando el último que React insertó, porque lo coloca el primero, pero react.dev avisa de que con varios títulos el comportamiento de navegadores y buscadores no está definido. Que un solo componente sea responsable del título, como `TituloPagina` aquí, lo evita.

## La descripción y la tarjeta para compartir: `<meta>`

La ficha de cada corto rellena dos públicos distintos: los buscadores, con la descripción, y las aplicaciones donde alguien pega el enlace, con las etiquetas Open Graph que viste en la lección 4 de HTML. Con React, cada una es una prop más que sale de los datos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "<TituloPagina texto={corto.titulo} />\n<meta name=\"description\" content={corto.sinopsis} />\n<meta property=\"og:title\" content={corto.titulo} />\n<meta property=\"og:description\" content={corto.sinopsis} />\n<meta property=\"og:image\" content={`${WEB}/og/${corto.id}.jpg`} />\n<meta property=\"og:url\" content={url} />\n<link rel=\"canonical\" href={url} />",
  "anotaciones": [
    {
      "fragmento": "<meta name=\"description\" content={corto.sinopsis} />",
      "nota": "La descripción que suelen enseñar los buscadores debajo del título. Una por página y distinta en cada una: aquí sale de la sinopsis de cada corto, así que no hay que escribirla dos veces."
    },
    {
      "fragmento": "property=\"og:title\"",
      "nota": "Open Graph usa property, no name. Si copias name por costumbre, las aplicaciones que generan la tarjeta del enlace ignoran la etiqueta sin avisar. React la pasa tal cual al head: no comprueba qué metadatos pones."
    },
    {
      "fragmento": "content={`${WEB}/og/${corto.id}.jpg`}",
      "nota": "La imagen de la tarjeta tiene que ser una URL absoluta, con https: la descarga un robot desde fuera de tu web. Aquí se construye con el id del corto, una imagen por ficha."
    },
    {
      "fragmento": "<link rel=\"canonical\" href={url} />",
      "nota": "La URL oficial de la ficha, por si se puede llegar a ella desde varias direcciones. Es un link que no es una hoja de estilos, así que React lo sube al head sin necesidad de precedence."
    },
    {
      "fragmento": "<meta property=\"og:url\" content={url} />",
      "nota": "La URL que debe enlazar la tarjeta. Suele coincidir con la canónica, por eso las dos salen de la misma constante."
    }
  ]
}
```

### ¿Quién lee esas etiquetas?

Aquí está la trampa. **En una aplicación que solo se pinta en el navegador, como una de Vite, el HTML que envía el servidor es el `index.html` con el `#root` vacío.** Las etiquetas que pone React aparecen después, cuando el JavaScript ya se ha descargado y ejecutado. Para quien mira la página en un navegador da igual, pero no todos los que la leen ejecutan JavaScript:

- **Google sí.** Su guía de JavaScript para buscadores lo dice expresamente: «You can use JavaScript to set or change the meta description as well as the `<title>` element». Es decir: puedes poner o cambiar la descripción y el título con JavaScript. Aun así recomienda renderizar en el servidor, porque «not all bots can run JavaScript»: no todos los robots pueden ejecutarlo.
- **Los robots que generan la tarjeta de un enlace**, como los de las aplicaciones de mensajería y las redes sociales, leen el HTML que les llega. Slack, por ejemplo, documenta que su robot descarga lo mínimo de la página para sacar las metaetiquetas. En el HTML de una SPA no hay ninguna `og:` todavía: la tarjeta sale sin imagen ni descripción, o con las genéricas del `index.html`.

```laboratorio
{
  "tipo": "callout",
  "variante": "aviso",
  "titulo": "Open Graph en una SPA: el robot no espera a React",
  "contenido": "Si necesitas que cada enlace compartido tenga su propia tarjeta, el HTML tiene que llegar ya con sus etiquetas og: dentro. Eso es renderizar en el servidor o prerenderizar cada página al construir, el módulo 13. El código de los componentes es el mismo; lo que cambia es dónde se ejecuta la primera vez. El proyecto 98, una revista con renderizado en servidor, lo hace con una ficha por artículo."
}
```

## Hojas de estilo con `precedence`

Un componente que necesita una hoja de estilos puede enlazarla él mismo con `<link rel="stylesheet">`. Si además le das `precedence`, React se encarga de tres cosas:

1. **La sube al `<head>` y la ordena** respecto a las demás, según su `precedence`.
2. **No la repite.** Si diez componentes enlazan la misma hoja (el mismo `href`), en el `<head>` hay un solo `<link>`.
3. **No enseña el componente hasta que la hoja ha cargado.** El componente se suspende, como con los datos de la lección 48, y el `<Suspense>` más cercano enseña su fallback mientras tanto. Así nunca ves la sección sin estilos durante un instante.

La vista previa no tiene red, así que una hoja de verdad nunca cargaría. Para ver la diferencia, el ejemplo usa dos: una URL `data:`, que lleva el CSS dentro de la propia dirección y carga al momento, y una ruta normal, `/estilos/jurado-joven.css`, que aquí no llega nunca. En tu proyecto, las dos serían archivos `.css` normales.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una sección que espera a su hoja de estilos",
  "consigna": "Pulsa «Abrir el palmarés» y luego «Mirar el head»: la hoja está arriba del todo, con data-precedence, y React ha añadido un link rel=preload para empezar a descargarla cuanto antes. Ahora pulsa «Abrir el jurado joven»: su hoja no llega nunca y su Suspense se queda en el fallback, pero el resto de la página sigue respondiendo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Suspense, useState } from 'react'\nimport MirarHead from './MirarHead'\nimport './estilos.css'\n\n// En tu proyecto serían /estilos/palmares.css y /estilos/jurado-joven.css.\n// Esta vista previa no tiene red: la primera lleva el CSS dentro de la URL\n// (data:) y carga al instante; la segunda apunta a un archivo que no llega.\nconst HOJA_PALMARES = 'data:text/css,.palmares{border:3px solid goldenrod;background:lightyellow;padding:0 1rem}'\nconst HOJA_JURADO = '/estilos/jurado-joven.css'\n\nfunction Palmares() {\n  return (\n    <section className=\"palmares\">\n      <link rel=\"stylesheet\" href={HOJA_PALMARES} precedence=\"secciones\" />\n      <h2>Palmarés 2026</h2>\n      <p>Mejor corto: «Lluvia en Teruel», de Marta Ibáñez.</p>\n    </section>\n  )\n}\n\nfunction JuradoJoven() {\n  return (\n    <section className=\"jurado\">\n      <link rel=\"stylesheet\" href={HOJA_JURADO} precedence=\"secciones\" />\n      <h2>Jurado joven</h2>\n      <p>Veinte estudiantes del instituto votan su corto favorito.</p>\n    </section>\n  )\n}\n\nexport default function App() {\n  const [palmares, setPalmares] = useState(false)\n  const [jurado, setJurado] = useState(false)\n\n  return (\n    <main>\n      <h1>Festival de Cortos de Albarracín</h1>\n      <button type=\"button\" onClick={() => setPalmares(true)}>Abrir el palmarés</button>{' '}\n      <button type=\"button\" onClick={() => setJurado(true)}>Abrir el jurado joven</button>\n      <Suspense fallback={<p>Cargando los estilos del palmarés…</p>}>\n        {palmares && <Palmares />}\n      </Suspense>\n      <Suspense fallback={<p>Cargando los estilos del jurado…</p>}>\n        {jurado && <JuradoJoven />}\n      </Suspense>\n      <MirarHead />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "MirarHead.jsx",
      "codigo": "import { useState } from 'react'\n\n// Lo que ya traía el <head> de la vista previa al cargar (su CSS, el propio\n// React...). No se enseña: solo interesa lo que llegue después.\nconst deLaVistaPrevia = new Set(document.head.children)\n\nfunction recortar(valor) {\n  return valor.length > 64 ? valor.slice(0, 61) + '…' : valor\n}\n\nfunction describir(nodo) {\n  const etiqueta = nodo.tagName.toLowerCase()\n  const atributos = [...nodo.attributes]\n    .map((a) => ` ${a.name}=\"${recortar(a.value)}\"`)\n    .join('')\n  if (etiqueta === 'title') return `<title${atributos}>${nodo.textContent}</title>`\n  if (etiqueta === 'style') return `<style${atributos}>…</style>`\n  if (etiqueta === 'script') return `<script${atributos}></script>`\n  return `<${etiqueta}${atributos}>`\n}\n\nexport default function MirarHead() {\n  const [foto, setFoto] = useState(null)\n\n  // Lee el DOM en el momento del clic: es una foto, no se actualiza sola.\n  function mirar() {\n    const nuevas = [...document.head.children].filter((nodo) => !deLaVistaPrevia.has(nodo))\n    setFoto({ titulo: document.title, lineas: nuevas.map(describir) })\n  }\n\n  return (\n    <section className=\"mirar-head\" aria-label=\"El head de la vista previa\">\n      <button type=\"button\" onClick={mirar}>\n        Mirar el head\n      </button>\n      {foto && (\n        <>\n          <p>{`document.title: «${foto.titulo}»`}</p>\n          {foto.lineas.length === 0 ? (\n            <p>React no ha puesto nada en el head.</p>\n          ) : (\n            <ol>\n              {foto.lineas.map((linea, i) => (\n                <li key={i}>\n                  <code>{linea}</code>\n                </li>\n              ))}\n            </ol>\n          )}\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\nnav {\n  display: flex;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  color: #7c2d12;\n  font-size: 1.3rem;\n}\n\n.mirar-head {\n  margin-top: 1rem;\n  padding-top: 0.75rem;\n  border-top: 2px dashed #94a3b8;\n}\n\n.mirar-head p {\n  margin: 0.5rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.mirar-head ol {\n  margin: 0.5rem 0 0;\n  padding-left: 1.5rem;\n  font-size: 0.8rem;\n}\n\n.mirar-head code {\n  overflow-wrap: anywhere;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

El `<link rel="stylesheet">` del jurado no aparece en el `<head>`: React lo inserta en el commit de ese componente, y ese commit no llega nunca. Solo está el `rel="preload"`, la descarga que React adelantó en cuanto vio la hoja.

**Sin un `<Suspense>` por encima, lo que espera es la actualización entera.** Compruébalo: quita los dos `<Suspense>` y abre el jurado. Ningún botón vuelve a cambiar nada, «Abrir el palmarés» incluido, porque React no puede enseñar el nuevo estado de la app sin la hoja. En una web real la hoja llega en unos cientos de milisegundos, pero durante ese tiempo la interfaz no responde. Un límite de `<Suspense>` alrededor de lo que trae hojas propias deja que el resto siga funcionando.

### El orden: lo que React descubre antes pesa menos

Cuando dos hojas tienen reglas que chocan con la misma especificidad, gana la que va después en el documento. React decide ese orden con `precedence`, pero no por lo que dice el nombre: **el primer valor de `precedence` que descubre va delante, y los que descubre después van detrás y mandan más**. Las hojas con el mismo valor van juntas, sean `<link>` o `<style>`.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Cabecera() {\n  return (\n    <header>\n      <style href=\"marca\" precedence=\"marca\">\n        {`.boton { background: teal; }`}\n      </style>\n      <h1>Festival de Cortos de Albarracín</h1>\n    </header>\n  )\n}\n\nfunction Boton() {\n  return (\n    <>\n      <style href=\"base\" precedence=\"base\">\n        {`.boton { background: gray; }`}\n      </style>\n      <button className=\"boton\">Comprar entradas</button>\n    </>\n  )\n}\n\nexport default function App() {\n  return (\n    <>\n      <Cabecera />\n      <Boton />\n    </>\n  )\n}",
  "opciones": [
    "Verde azulado: «marca» suena más importante que «base»",
    "Gris: «base» aparece después en el árbol, así que su hoja va detrás",
    "Verde azulado: la Cabecera se pinta antes y su regla se queda",
    "Depende del orden alfabético de los nombres"
  ],
  "correcta": 1,
  "explicacion": "Cabecera va antes que Boton en el árbol, así que React descubre primero la precedencia marca y la coloca delante en el head. base llega después, va detrás y su gris gana. Los nombres son tuyos y React no los interpreta: cuenta el orden en que aparecen. Por eso muchos proyectos usan un único valor para todo."
}
```

Un detalle más del orden, que sorprende la primera vez: **React coloca las hojas que gestiona él al principio del `<head>`**, delante de las que no gestiona, como el CSS que enlaza tu `index.html` o el que Vite inyecta por cada `import './estilos.css'`. En la vista previa pasa igual: el CSS de las pestañas `.css` va detrás de las hojas con `precedence` (no sale en «Mirar el head» porque ya estaba al cargar). Con la misma especificidad, tu CSS de siempre gana a las hojas con `precedence`.

## CSS que viaja con su componente: `<style href precedence>`

A veces el CSS de un componente es tan pequeño que no merece un archivo. Un `<style>` con `href` y `precedence` va al `<head>` igual que un `<link>`, y **React lo mete una sola vez aunque el componente se pinte muchas**: el `href` no es una dirección, sino el nombre que identifica la hoja. A diferencia del `<link>`, no suspende nada: el CSS ya está ahí.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cuatro tarjetas, una sola hoja",
  "consigna": "Pulsa «Contar las hojas»: cuatro tarjetas y una sola etiqueta style en el head. Después quita href y precedence del style de TarjetaSede y vuelve a contar: cada tarjeta mete su propia copia en el body.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport TarjetaSede from './TarjetaSede'\n\nconst sedes = [\n  { nombre: 'Teatro de la Comunidad', butacas: 180 },\n  { nombre: 'Patio del Palacio Episcopal', butacas: 250 },\n  { nombre: 'Casa de Santa María', butacas: 90 },\n  { nombre: 'Plaza Mayor', butacas: 400 },\n]\n\nexport default function App() {\n  const [cuenta, setCuenta] = useState(null)\n\n  function contar() {\n    const enHead = document.head.querySelectorAll('style[data-href=\"tarjeta-sede\"]').length\n    const enBody = document.body.querySelectorAll('style').length\n    setCuenta(`Etiquetas style de las tarjetas: ${enHead} en el head y ${enBody} en el body.`)\n  }\n\n  return (\n    <main>\n      <h1>Sedes del festival</h1>\n      <ul className=\"sedes\">\n        {sedes.map((sede) => (\n          <TarjetaSede key={sede.nombre} nombre={sede.nombre} butacas={sede.butacas} />\n        ))}\n      </ul>\n      <button type=\"button\" onClick={contar}>Contar las hojas</button>\n      {cuenta && <p>{cuenta}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "TarjetaSede.jsx",
      "codigo": "// El mismo texto en cada render: una constante fuera del componente.\nconst css = `\n.tarjeta-sede {\n  padding: 0.6rem 0.9rem;\n  border-left: 6px solid #7c2d12;\n  border-radius: 8px;\n  background: #fff7ed;\n  list-style: none;\n}\n`\n\nexport default function TarjetaSede({ nombre, butacas }) {\n  return (\n    <li className=\"tarjeta-sede\">\n      <style href=\"tarjeta-sede\" precedence=\"componentes\">\n        {css}\n      </style>\n      <strong>{nombre}</strong>: {butacas} butacas\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\n.sedes {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "TarjetaSede.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Tres condiciones vienen con este trato, y las tres están comprobadas en React 19.3.1:

- **Gana la primera.** Si dos `<style>` usan el mismo `href` con contenidos distintos, React se queda con el primero que vio y descarta el otro sin avisar. El `href` tiene que identificar de verdad un CSS concreto.
- **Los cambios posteriores se ignoran.** Si el contenido del `<style>` cambia después del primer render, React no toca la hoja ya insertada, y en esta versión tampoco avisa en la consola.
- **No se va al desmontar.** Las hojas y los scripts de este tipo pueden quedarse en el `<head>` aunque desmontes el componente que los pintó. Un `<title>` o una `<meta>` sí se van con su componente.

Las dos últimas descartan el `<style>` con `href` para estilos que dependen del estado, como un tema claro u oscuro: tienes un ejemplo del fallo en «Errores típicos». Para eso están las clases y las variables de CSS de la lección 79.

## Scripts sin duplicados y precargas

Un widget de terceros, como un mapa o una pasarela de pago, suele pedir un `<script>`. Si el componente que lo usa aparece tres veces, no quieres el script tres veces. **Con `src` y `async`, React sube el `<script>` al `<head>` y lo inserta una sola vez**, identificado por su `src`. Es la única forma en que un `<script>` pintado por React en el navegador se ejecuta.

Y para adelantar descargas, `react-dom` exporta unas funciones que puedes llamar al renderizar o desde un manejador: `preload` descarga un recurso sin usarlo todavía, `preinit` descarga y además ejecuta un script o aplica una hoja, `preconnect` abre la conexión con un servidor y `prefetchDNS` solo resuelve su dirección. Para módulos de JavaScript están `preloadModule` y `preinitModule`.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Tres mapas, un script; y la compra, preparada antes de abrirla",
  "codigo": "import { useState } from 'react'\nimport { preinit, preload } from 'react-dom'\n\n// En tu proyecto: src=\"/widgets/mapa-sedes.js\". Sin red, el código del\n// \"widget\" va dentro de la URL: cuenta cuántas veces se ejecuta.\nconst MAPA = 'data:text/javascript,window.cargasDelMapa=(window.cargasDelMapa||0)+1'\n\nfunction MapaSede({ nombre }) {\n  return (\n    <li>\n      <script async src={MAPA} />\n      <strong>{nombre}</strong>\n    </li>\n  )\n}\n\nexport default function App() {\n  const [informe, setInforme] = useState([])\n\n  function prepararCompra() {\n    preload('/fuentes/titulos-festival.woff2', { as: 'font' })\n    preinit('/widgets/entradas.js', { as: 'script' })\n  }\n\n  function mirar() {\n    const etiquetas = document.head.querySelectorAll('script[async], link[rel=\"preload\"]')\n    setInforme([\n      `Veces que se ha ejecutado el script del mapa: ${window.cargasDelMapa ?? 0}`,\n      ...[...etiquetas].map((nodo) => nodo.outerHTML.slice(0, 90)),\n    ])\n  }\n\n  return (\n    <main>\n      <h1>Mapas de las sedes</h1>\n      <ul>\n        <MapaSede nombre=\"Teatro de la Comunidad\" />\n        <MapaSede nombre=\"Palacio Episcopal\" />\n        <MapaSede nombre=\"Plaza Mayor\" />\n      </ul>\n      <button type=\"button\" onClick={prepararCompra}>Preparar la compra</button>{' '}\n      <button type=\"button\" onClick={mirar}>Mirar el head</button>\n      <ul className=\"informe\">\n        {informe.map((linea) => (\n          <li key={linea}>{linea}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\n.informe {\n  font-family: ui-monospace, monospace;\n  font-size: 0.8rem;\n  overflow-wrap: anywhere;\n}",
  "anotaciones": [
    {
      "fragmento": "<script async src={MAPA} />",
      "nota": "Con src y async, React lo sube al head y lo identifica por su src: tres MapaSede, un solo script, ejecutado una sola vez. Pulsa «Mirar el head» y compruébalo, también con StrictMode activo. La URL data: solo está porque la vista previa no tiene red."
    },
    {
      "fragmento": "preload('/fuentes/titulos-festival.woff2', { as: 'font' })",
      "nota": "preload solo descarga: añade un link rel=preload al head. Con as: font, React le pone además el atributo crossorigin, que las fuentes necesitan para que el navegador aproveche la descarga."
    },
    {
      "fragmento": "preinit('/widgets/entradas.js', { as: 'script' })",
      "nota": "preinit descarga y ejecuta: inserta un script async con ese src, igual que si lo hubieras pintado. Llamarlo dos veces con el mismo href equivale a llamarlo una."
    },
    {
      "fragmento": "onClick={prepararCompra}",
      "nota": "Llamarlas desde un manejador es el caso que react.dev pone de ejemplo: empezar a descargar lo que necesitará la pantalla siguiente antes de abrirla. Aquí no hay red, así que la descarga no ocurre, pero las etiquetas sí aparecen."
    },
    {
      "fragmento": "querySelectorAll('script[async], link[rel=\"preload\"]')",
      "nota": "Solo los script con async: el que carga React en la vista previa no lo lleva, y así no sale en la lista."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Un `<script>` sin `async`, o con el código dentro, se pinta donde lo escribiste y **no se ejecuta nunca** si lo crea React en el navegador. En desarrollo, React te lo dice en la consola:

```text
Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).
```

Es decir: ha encontrado una etiqueta `<script>` al renderizar un componente, y los scripts que hay dentro de los componentes nunca se ejecutan cuando se renderiza en el cliente. Si lo que querías era guardar un trozo de HTML inerte, la etiqueta para eso es `<template>`.

Ten en cuenta también que un script `async` se ejecuta cuando termina de descargarse, no antes del render: **el componente puede estar ya en pantalla sin que el script haya llegado**. Si tu código depende de lo que define el script, espera a su evento `load`.

## Y si la página se renderiza en el servidor

Todo lo anterior funciona igual cuando React genera el HTML en el servidor (módulo 13), pero entonces las etiquetas no esperan a que llegue el JavaScript: **van dentro del `<head>` del HTML que se envía**. Este es el documento que genera `react-dom/server` 19.3.1 para la ficha de un corto, con los saltos de línea añadidos para leerlo:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charSet="utf-8"/>
    <link rel="stylesheet" href="/estilos/ficha.css" data-precedence="componentes"/>
    <title>Lluvia en Teruel · Festival de Cortos de Albarracín</title>
    <meta name="description" content="Una tormenta deja aislado un pueblo de la sierra."/>
    <meta property="og:title" content="Lluvia en Teruel"/>
    <meta property="og:image" content="https://festivalalbarracin.example/og/lluvia-en-teruel.jpg"/>
  </head>
  <body>
    <div id="root"><article><h1>Lluvia en Teruel</h1><p>Una tormenta deja aislado un pueblo de la sierra.</p></article></div>
  </body>
</html>
```

En el componente, esas etiquetas estaban dentro del `<article>`; en el HTML ya están en el `<head>`. Eso cambia tres cosas:

- **Los robots ven los metadatos** en la primera respuesta, sin ejecutar nada: la tarjeta del enlace sale con su título y su imagen.
- **La hoja llega antes que el contenido.** El navegador la encuentra en el `<head>` y no pinta la página sin sus estilos.
- **Algunos errores sí avisan.** Fallos que en el navegador pasan en silencio, como el título con llaves en medio, en el servidor dejan un aviso en la consola de Node.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un título por pantalla",
      "texto": "Cada página de tu aplicación pinta su title, compuesto por un único componente. Ayuda a orientarse con varias pestañas abiertas, es lo que sale en el historial y en los marcadores, y es como los lectores de pantalla identifican cada pestaña."
    },
    {
      "titulo": "Avisos en el título",
      "texto": "Mensajes sin leer, una cuenta atrás, «Guardando…»: cuando el estado cambia algo que conviene ver desde otra pestaña, el título lo puede reflejar, y también el icono con un link rel=icon que cambia de href."
    },
    {
      "titulo": "Metadatos por página",
      "texto": "Descripción, Open Graph, URL canónica o noindex en las páginas privadas. En una SPA sirven al navegador y a Google; para las tarjetas de los enlaces compartidos, necesitas que el servidor los incluya en el HTML."
    },
    {
      "titulo": "Componentes que traen su CSS o su script",
      "texto": "Un widget que necesita su hoja o el script de un mapa los declara él mismo, y React evita duplicados y los ordena. En una aplicación hecha con Vite lo habitual sigue siendo importar el CSS; esta forma brilla en librerías de componentes y con renderizado en servidor."
    },
    {
      "titulo": "Adelantar descargas",
      "texto": "preload, preinit y preconnect al pasar a una pantalla pesada, o en el manejador del botón que la abre. Muchos frameworks ya hacen esto por ti con sus rutas."
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
      "mito": "Para cambiar el título de la página hace falta un efecto",
      "realidad": "Hasta React 18, sí. Desde React 19 el title es una etiqueta más del render: si su texto sale del estado, se actualiza solo, sin useEffect ni document.title."
    },
    {
      "mito": "Con las etiquetas og: en mi componente, el enlace ya sale con su tarjeta al compartirlo en un chat",
      "realidad": "En una SPA, no: los robots de las tarjetas leen el HTML que envía el servidor, y ahí el #root está vacío. Hace falta renderizar en el servidor o prerenderizar."
    },
    {
      "mito": "precedence=\"alta\" va por encima de precedence=\"baja\"",
      "realidad": "React no interpreta los nombres. La primera precedencia que descubre va delante y las siguientes, detrás. Los nombres solo sirven para agrupar."
    },
    {
      "mito": "Al desmontar un componente, todo lo que puso en el head se va con él",
      "realidad": "El title, las meta y los link normales, sí. Las hojas con precedence, los style con href y los script async pueden quedarse: React no los quita."
    },
    {
      "mito": "Un script dentro de un componente se ejecuta como en un HTML normal",
      "realidad": "Si lo crea React en el navegador, nunca, y React avisa en la consola. Solo se cargan y ejecutan los script con src y async, que React sube al head."
    }
  ]
}
```

## Errores típicos

**Llaves en medio del texto del título.** Es el error más fácil de cometer, porque en cualquier otra etiqueta funciona:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "export default function Bandeja() {\n  const noLeidos = 3\n\n  return (\n    <main>\n      <title>({noLeidos}) Bandeja de entrada</title>\n      <h1>Bandeja de entrada</h1>\n    </main>\n  )\n}",
  "opciones": [
    "«(3) Bandeja de entrada»",
    "«Bandeja de entrada», sin el número",
    "Nada: el título se queda vacío",
    "Un error en la vista previa"
  ],
  "correcta": 2,
  "explicacion": "El title recibe como children un array de tres trozos: «(», 3 y «) Bandeja de entrada». Un title solo admite una cadena, y con React 19.3.1 en el navegador el título se queda vacío sin ningún aviso en la consola. Compruébalo con «Mirar el head». La solución es darle una sola cadena, hecha con una plantilla de texto, como la constante titulo del ejemplo de la bandeja."
}
```

En el navegador no hay ningún aviso, pero si el mismo componente se renderiza en el servidor, `react-dom/server` sí se queja. Este es el principio del mensaje:

```text
React expects the `children` prop of <title> tags to be a string, number, bigint, or object with a novel `toString` method but found an Array with length 3 instead.
```

Es decir: React espera que los hijos de `<title>` sean una cadena, un número o un objeto con su propio `toString`, y ha encontrado un array de tres elementos. El mensaje completo sigue con la misma solución: reescribirlo con una plantilla de texto.

**Un tema claro u oscuro con `<style href>`.** Parece buena idea pintar la hoja de cada tema según el estado, pero choca con las condiciones de antes: la hoja del tema anterior no se va del `<head>`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un tema que no vuelve a ser claro",
  "consigna": "Pulsa «Cambiar de tema» dos veces: el texto dice «claro», pero la página sigue oscura, porque la hoja del tema oscuro se quedó en el head y va detrás. Arréglalo sin style con href: pon las dos reglas en estilos.css (.programa y .programa.oscuro) y cambia solo la clase del main.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst temaClaro = `.programa { background: white; color: #1c1917; }`\nconst temaOscuro = `.programa { background: #1c1917; color: #fafaf9; }`\n\nexport default function App() {\n  const [oscuro, setOscuro] = useState(false)\n\n  return (\n    <main className=\"programa\">\n      {oscuro ? (\n        <style href=\"tema-oscuro\" precedence=\"tema\">{temaOscuro}</style>\n      ) : (\n        <style href=\"tema-claro\" precedence=\"tema\">{temaClaro}</style>\n      )}\n      <h1>Programa del festival</h1>\n      <p>Tema: {oscuro ? 'oscuro' : 'claro'}</p>\n      <button type=\"button\" onClick={() => setOscuro(!oscuro)}>\n        Cambiar de tema\n      </button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".programa {\n  padding: 1rem;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border-radius: 6px;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

**Dos títulos a la vez.** Un `<title>` en el layout y otro en cada pantalla. Los dos acaban en el `<head>`, y aunque hoy el navegador use el que React insertó el último, react.dev avisa de que el resultado no está definido para navegadores ni buscadores. Decide qué componente es el dueño del título y que sea el único que lo pinta.

**Una hoja con `precedence` que no carga y ningún `<Suspense>`.** La actualización que la trae se queda esperando, y con ella toda la interfaz: en la vista previa, sin red, ningún botón vuelve a responder. Pon un límite de `<Suspense>` alrededor de lo que trae sus propias hojas.

**Esperar que las tarjetas de los enlaces salgan bien en una SPA.** Las `og:` que pinta React no están en el HTML que lee el robot. Si las tarjetas importan, la página tiene que renderizarse en el servidor o prerenderizarse.

**Un `<script>` sin `async` dentro de un componente.** No se ejecuta nunca, y React lo avisa en la consola. Si el script es tuyo, casi siempre sobra: su código puede ir en el propio componente o en un manejador. Si es de terceros, `src` y `async`.

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El título y el icono de Correo Cierzo",
  "consigna": "Ahora el título es fijo y está en App. Quítalo de ahí y haz que cada carpeta pinte el suyo: Bandeja, «(3) Bandeja de entrada · Correo Cierzo», sin número cuando no quede nada sin leer; Enviados, «Enviados · Correo Cierzo». Después haz que el icono sea /iconos/sobre-con-aviso.svg mientras quede algo sin leer y /iconos/sobre.svg si no. Usa «Mirar el head» y, cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Bandeja from './Bandeja'\nimport Enviados from './Enviados'\nimport MirarHead from './MirarHead'\nimport './estilos.css'\n\nconst mensajesIniciales = [\n  { id: 1, de: 'Rocío Lasheras', asunto: 'Fotos de la excursión al Moncayo', leido: false },\n  { id: 2, de: 'Comunidad de regantes', asunto: 'Turno de riego de la semana', leido: false },\n  { id: 3, de: 'Biblioteca municipal', asunto: 'Tu préstamo vence el viernes', leido: true },\n  { id: 4, de: 'Ayuntamiento de Tarazona', asunto: 'Cita para renovar el DNI', leido: false },\n]\n\nexport default function App() {\n  const [carpeta, setCarpeta] = useState('bandeja')\n  const [mensajes, setMensajes] = useState(mensajesIniciales)\n  const noLeidos = mensajes.filter((m) => !m.leido).length\n\n  function abrir(id) {\n    setMensajes(mensajes.map((m) => (m.id === id ? { ...m, leido: true } : m)))\n  }\n\n  function marcarTodo() {\n    setMensajes(mensajes.map((m) => ({ ...m, leido: true })))\n  }\n\n  return (\n    <main>\n      {/* 1. Este título fijo sobra: cada carpeta pintará el suyo */}\n      <title>Correo Cierzo</title>\n      {/* 2. Este icono tiene que avisar mientras quede algo sin leer */}\n      <link rel=\"icon\" href=\"/iconos/sobre.svg\" />\n      <nav aria-label=\"Carpetas\">\n        <button type=\"button\" aria-pressed={carpeta === 'bandeja'} onClick={() => setCarpeta('bandeja')}>\n          Bandeja de entrada\n        </button>\n        <button type=\"button\" aria-pressed={carpeta === 'enviados'} onClick={() => setCarpeta('enviados')}>\n          Enviados\n        </button>\n      </nav>\n      {carpeta === 'bandeja' ? (\n        <Bandeja mensajes={mensajes} noLeidos={noLeidos} onAbrir={abrir} onMarcarTodo={marcarTodo} />\n      ) : (\n        <Enviados />\n      )}\n      <MirarHead />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "Bandeja.jsx",
      "codigo": "export default function Bandeja({ mensajes, noLeidos, onAbrir, onMarcarTodo }) {\n  // 1. El título de esta carpeta: «(3) Bandeja de entrada · Correo Cierzo»,\n  //    o «Bandeja de entrada · Correo Cierzo» cuando no quede nada sin leer.\n\n  return (\n    <section>\n      <h1>Bandeja de entrada</h1>\n      <p>{noLeidos === 0 ? 'Lo has leído todo.' : `Sin leer: ${noLeidos}`}</p>\n      <ul className=\"mensajes\">\n        {mensajes.map((m) => (\n          <li key={m.id}>\n            <button type=\"button\" className={m.leido ? 'leido' : 'nuevo'} onClick={() => onAbrir(m.id)}>\n              <strong>{m.de}</strong> {m.asunto}\n            </button>\n          </li>\n        ))}\n      </ul>\n      <button type=\"button\" onClick={onMarcarTodo}>\n        Marcar todo como leído\n      </button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Enviados.jsx",
      "codigo": "const enviados = [\n  { id: 1, para: 'Rocío Lasheras', asunto: 'Re: Fotos de la excursión al Moncayo' },\n  { id: 2, para: 'Taller de bicis La Cadena', asunto: 'Presupuesto de la revisión' },\n]\n\nexport default function Enviados() {\n  // 1. Y aquí el suyo: «Enviados · Correo Cierzo»\n\n  return (\n    <section>\n      <h1>Enviados</h1>\n      <ul className=\"mensajes\">\n        {enviados.map((m) => (\n          <li key={m.id}>\n            Para <strong>{m.para}</strong>: {m.asunto}\n          </li>\n        ))}\n      </ul>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "MirarHead.jsx",
      "codigo": "import { useState } from 'react'\n\n// Lo que ya traía el <head> de la vista previa al cargar (su CSS, el propio\n// React...). No se enseña: solo interesa lo que llegue después.\nconst deLaVistaPrevia = new Set(document.head.children)\n\nfunction recortar(valor) {\n  return valor.length > 64 ? valor.slice(0, 61) + '…' : valor\n}\n\nfunction describir(nodo) {\n  const etiqueta = nodo.tagName.toLowerCase()\n  const atributos = [...nodo.attributes]\n    .map((a) => ` ${a.name}=\"${recortar(a.value)}\"`)\n    .join('')\n  if (etiqueta === 'title') return `<title${atributos}>${nodo.textContent}</title>`\n  if (etiqueta === 'style') return `<style${atributos}>…</style>`\n  if (etiqueta === 'script') return `<script${atributos}></script>`\n  return `<${etiqueta}${atributos}>`\n}\n\nexport default function MirarHead() {\n  const [foto, setFoto] = useState(null)\n\n  // Lee el DOM en el momento del clic: es una foto, no se actualiza sola.\n  function mirar() {\n    const nuevas = [...document.head.children].filter((nodo) => !deLaVistaPrevia.has(nodo))\n    setFoto({ titulo: document.title, lineas: nuevas.map(describir) })\n  }\n\n  return (\n    <section className=\"mirar-head\" aria-label=\"El head de la vista previa\">\n      <button type=\"button\" onClick={mirar}>\n        Mirar el head\n      </button>\n      {foto && (\n        <>\n          <p>{`document.title: «${foto.titulo}»`}</p>\n          {foto.lineas.length === 0 ? (\n            <p>React no ha puesto nada en el head.</p>\n          ) : (\n            <ol>\n              {foto.lineas.map((linea, i) => (\n                <li key={i}>\n                  <code>{linea}</code>\n                </li>\n              ))}\n            </ol>\n          )}\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  background: #f8fafc;\n  font: inherit;\n  cursor: pointer;\n}\n\nh1 {\n  margin: 0 0 0.5rem;\n  font-size: 1.3rem;\n}\n\n.mensajes {\n  display: grid;\n  gap: 0.35rem;\n  margin: 0.5rem 0;\n  padding: 0;\n  list-style: none;\n}\n\n.mensajes button {\n  width: 100%;\n  text-align: left;\n}\n\n.mensajes .nuevo {\n  border-left: 5px solid #0369a1;\n  font-weight: 600;\n}\n\n.mensajes .leido {\n  color: #475569;\n}\n\n.mirar-head {\n  margin-top: 1rem;\n  padding-top: 0.75rem;\n  border-top: 2px dashed #94a3b8;\n}\n\n.mirar-head p {\n  margin: 0.5rem 0 0;\n  font-family: ui-monospace, monospace;\n  font-size: 0.85rem;\n}\n\n.mirar-head ol {\n  margin: 0.5rem 0 0;\n  padding-left: 1.5rem;\n  font-size: 0.8rem;\n}\n\n.mirar-head code {\n  overflow-wrap: anywhere;\n}\n\nnav {\n  display: flex;\n  gap: 0.5rem;\n  margin-bottom: 0.75rem;\n}\n\nnav [aria-pressed='true'] {\n  border-color: #0369a1;\n  background: #e0f2fe;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al empezar, el título es «(3) Bandeja de entrada · Correo Cierzo»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el head"
          }
        }
      ],
      "espera": {
        "texto": "document.title: «(3) Bandeja de entrada · Correo Cierzo»"
      }
    },
    {
      "descripcion": "Al abrir un mensaje sin leer, el título baja a «(2) Bandeja de entrada · Correo Cierzo»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "texto": "Moncayo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el head"
          }
        }
      ],
      "espera": {
        "texto": "document.title: «(2) Bandeja de entrada · Correo Cierzo»"
      }
    },
    {
      "descripcion": "Con todo leído, el título es «Bandeja de entrada · Correo Cierzo», sin número",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar todo como leído"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el head"
          }
        }
      ],
      "espera": {
        "texto": "document.title: «Bandeja de entrada · Correo Cierzo»"
      }
    },
    {
      "descripcion": "En «Enviados», el título es «Enviados · Correo Cierzo»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Enviados"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el head"
          }
        }
      ],
      "espera": {
        "texto": "document.title: «Enviados · Correo Cierzo»"
      }
    },
    {
      "descripcion": "En el head hay un solo título, el de la carpeta: el fijo de App ya no está",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el head"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "<title>Correo Cierzo</title>"
        }
      }
    },
    {
      "descripcion": "Mientras queda correo sin leer, el icono es /iconos/sobre-con-aviso.svg",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el head"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "href=\"/iconos/sobre-con-aviso.svg\""
      }
    },
    {
      "descripcion": "Con todo leído, el icono vuelve a ser /iconos/sobre.svg",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar todo como leído"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Mirar el head"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "href=\"/iconos/sobre.svg\""
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Añade una tercera carpeta, «Papelera», con su propio título. Después saca la parte común a un componente `TituloCorreo` que reciba el nombre de la carpeta, como `TituloPagina` en el festival.
2. Haz que el título diga «(9+)» cuando haya más de nueve mensajes sin leer. Añade mensajes a `mensajesIniciales` para probarlo.
3. Pon una `<meta name="theme-color">` con un color distinto en cada carpeta y comprueba con «Mirar el head» que cambia al pasar de una a otra.
4. Pasa el CSS de los mensajes a un `<style href="mensajes" precedence="componentes">` dentro de `Bandeja` y `Enviados`. Con «Mirar el head», comprueba que al cambiar de carpeta la hoja no se duplica y que sigue ahí aunque `Bandeja` se desmonte.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<title>",
      "descripcion": "La referencia de react.dev: dónde lo coloca React, las excepciones y por qué el texto tiene que ser una sola cadena.",
      "url": "https://react.dev/reference/react-dom/components/title",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<link>",
      "descripcion": "Hojas de estilo con precedence, duplicados, suspensión mientras cargan y todos los rel que React sube al head.",
      "url": "https://react.dev/reference/react-dom/components/link",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<style>",
      "descripcion": "CSS en línea con href y precedence: cuándo lo sube React al head y qué condiciones trae.",
      "url": "https://react.dev/reference/react-dom/components/style",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<script>",
      "descripcion": "Scripts externos sin duplicados con src y async, y por qué los demás no se mueven.",
      "url": "https://react.dev/reference/react-dom/components/script",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "preload",
      "descripcion": "Las funciones para adelantar descargas; desde aquí se llega a preinit, preconnect y prefetchDNS.",
      "url": "https://react.dev/reference/react-dom/preload",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Understand the JavaScript SEO basics",
      "descripcion": "La guía de Google: cómo procesa las páginas hechas con JavaScript y por qué sigue recomendando renderizar en el servidor.",
      "url": "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
      "etiqueta": "Google Search Central"
    }
  ]
}
```
