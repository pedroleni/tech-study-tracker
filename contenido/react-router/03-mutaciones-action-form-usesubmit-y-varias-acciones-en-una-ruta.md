# Mutaciones: `action`, `<Form>`, `useSubmit` y varias acciones en una ruta

- **Módulo:** Cargar y enviar datos
- **Slug:** `mutaciones-action-form-usesubmit-y-varias-acciones-en-una-ruta` (autogenerado del título)
- **Orden:** 30
- **Fuentes:** [Actions](https://reactrouter.com/start/data/actions) + [Form vs. fetcher](https://reactrouter.com/explanation/form-vs-fetcher) + [Form Validation](https://reactrouter.com/how-to/form-validation) + [Status Codes](https://reactrouter.com/how-to/status) + [data](https://reactrouter.com/api/utils/data) + [redirect](https://reactrouter.com/api/utils/redirect) — ver `contenido/react-router/TEMARIO.md` #3
- **Requiere:** La lección 99 de React (el modo de datos) y la 2 de esta ficha. Para la comparación del final, las 57 y 58 de React

---

## Qué es y para qué sirve

En la lección 99 de React viste lo básico de las mutaciones en el modo de datos: un `<Form method="post">` envía sus campos a la `action` de su ruta, la `action` devuelve algo que el componente lee con `useActionData` o redirige con `redirect`, y el router vuelve a cargar los datos de la página. Para un formulario de alta, basta. Una aplicación de verdad pide más:

- Una ficha con varios botones (guardar, aceptar, rechazar, borrar) que hacen cosas distintas con los mismos campos.
- Errores de validación junto a cada campo, sin perder lo escrito.
- Decidir adónde va el usuario después de enviar, y qué hará entonces el botón Atrás.
- Envíos que no salen de un botón: un desplegable que guarda al cambiar, un orden que vive en el estado.
- Y saber cuándo te basta la Action de React de la lección 57 y cuándo no.

El ejemplo de la lección es el comité de lectura de **Ediciones La Rueca**, una editorial pequeña de Salamanca. Cada semana llegan manuscritos. El comité los registra, apunta sus notas de lectura y decide: aceptar o rechazar.

**Una `action` se comporta como un servidor pequeño dentro del navegador: recibe una petición HTTP (`request`), la lee como la leería un servidor (`request.formData()`) y responde con datos, con un código de estado o con una redirección.** Lo que hace el router después depende de esa respuesta: enseñar los datos, volver a cargar la página o navegar a otra.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "React Router de verdad en la vista previa",
  "contenido": "Los bloques en vivo ejecutan React Router 8.5.0 en TSX, con el panel de errores de tipos. El código es el de un proyecto de Vite: createBrowserRouter funciona, pero dentro de la vista previa usa un historial en memoria (lección 1), y la barra de encima hace de barra de direcciones con Atrás, Adelante y Recargar. Por eso request.url empieza por http://localhost. La API simulada conserva lo que guardas aunque recargues; Reiniciar lo devuelve todo al principio."
}
```

## Lo que llega a la `action`: `request` y `request.formData()`

Una `action` recibe un objeto con tres cosas: `params`, los parámetros de la ruta (como los de un `loader`, lección 2); `context`, que verás con el middleware en la lección 10; y `request`, **la petición**. Es un `Request` estándar, el mismo que usa `fetch`:

- `request.method` es `"POST"`.
- `request.url` es la dirección de la ruta que recibe el envío.
- El cuerpo lleva los campos codificados como los codificaría el navegador, con `Content-Type: application/x-www-form-urlencoded`.

`request.formData()` lee ese cuerpo y te da un `FormData`, el objeto de la lección 57. Lo que conviene tener presente al leerlo:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "get() devuelve un texto, un File o null",
      "texto": "Todo llega como texto, también los números: «312», no 312. Si el campo no existe, null. Un File solo si el formulario sube archivos."
    },
    {
      "titulo": "Un campo vacío sí viaja",
      "texto": "Llega como texto vacío. Y Number('') es 0, no NaN: convierte primero y valida después el número que te queda."
    },
    {
      "titulo": "Una casilla sin marcar no viaja",
      "texto": "No llega ni vacía ni con false: no aparece. Una marcada sin value llega como «on»."
    },
    {
      "titulo": "Varios campos con el mismo name",
      "texto": "get() devuelve solo el primero; getAll() los devuelve todos en un array. Es lo que pasa con un grupo de casillas."
    },
    {
      "titulo": "Object.fromEntries(formData) pierde los repetidos",
      "texto": "Da un objeto cómodo, pero con un valor por nombre: el último. Para un grupo de casillas, getAll()."
    }
  ]
}
```

Antes de probarlo, una pregunta:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En el formulario, «Páginas» se queda vacío y «Lleva ilustraciones» sin marcar:\n<input name=\"paginas\" type=\"number\" />\n<input type=\"checkbox\" name=\"ilustrado\" />\n\n// En la action:\nconst formData = await request.formData()\nconsole.log(\n  formData.get('paginas'),\n  Number(formData.get('paginas')),\n  formData.get('ilustrado'),\n  String(formData.get('ilustrado')),\n)",
  "opciones": [
    "null NaN false \"false\"",
    "\"\" 0 null \"null\"",
    "\"\" NaN null \"\"",
    "undefined NaN undefined \"undefined\""
  ],
  "correcta": 1,
  "explicacion": "El campo vacío viaja como texto vacío, y Number('') es 0: una comprobación con Number.isNaN lo dejaría pasar. La casilla sin marcar no viaja, así que get devuelve null, y String(null) es el texto «null», que acabaría guardado como si alguien lo hubiera escrito. Compruébalo en el bloque de abajo: la action enseña lo que le llega."
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El eco de la action: lo que llega, campo a campo",
  "consigna": "Pulsa «Registrar» con todo vacío y mira la petición (un POST a http://localhost/manuscritos/nuevo), su Content-Type y qué campos llegan: «Papel» sí, porque viene marcada; las demás casillas, no. Marca «Digital» y «Lleva ilustraciones», escribe las páginas y vuelve a enviar: getAll junta las dos casillas de formatos. Fíjate también en que el formulario no se vacía al terminar.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Form, useActionData, type ActionFunctionArgs } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport './estilos.css'\n\n// De momento, la action no guarda nada: devuelve lo que le ha llegado\nasync function recibir({ request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  return {\n    peticion: `${request.method} ${request.url}`,\n    tipo: request.headers.get('Content-Type'),\n    campos: [...formData].map(([nombre, valor]) => `${nombre} = ${JSON.stringify(valor)}`),\n    formatos: formData.getAll('formatos'),\n    ilustrado: formData.get('ilustrado'),\n    paginas: Number(formData.get('paginas')),\n  }\n}\n\nfunction Registro() {\n  const recibido = useActionData<typeof recibir>()\n\n  return (\n    <main>\n      <h1>Registrar un manuscrito</h1>\n      <Form method=\"post\">\n        <label>\n          Título\n          <input name=\"titulo\" />\n        </label>\n        <label>\n          Autor o autora\n          <input name=\"autor\" />\n        </label>\n        <label>\n          Páginas\n          <input name=\"paginas\" type=\"number\" />\n        </label>\n        <fieldset>\n          <legend>Formatos</legend>\n          <label>\n            <input type=\"checkbox\" name=\"formatos\" value=\"papel\" defaultChecked /> Papel\n          </label>\n          <label>\n            <input type=\"checkbox\" name=\"formatos\" value=\"digital\" /> Digital\n          </label>\n          <label>\n            <input type=\"checkbox\" name=\"formatos\" value=\"audiolibro\" /> Audiolibro\n          </label>\n        </fieldset>\n        <label>\n          <input type=\"checkbox\" name=\"ilustrado\" /> Lleva ilustraciones\n        </label>\n        <button>Registrar</button>\n      </Form>\n\n      {recibido && (\n        <section className=\"eco\" aria-label=\"Lo que recibió la action\">\n          <h2>Lo que recibió la action</h2>\n          <p>\n            <code>{recibido.peticion}</code>\n          </p>\n          <p>\n            Content-Type: <code>{recibido.tipo}</code>\n          </p>\n          <ul>\n            {recibido.campos.map((campo, i) => (\n              <li key={i}>\n                <code>{campo}</code>\n              </li>\n            ))}\n          </ul>\n          <p>\n            <code>getAll('formatos')</code> → {JSON.stringify(recibido.formatos)}\n          </p>\n          <p>\n            <code>get('ilustrado')</code> → {JSON.stringify(recibido.ilustrado)}\n          </p>\n          <p>\n            <code>Number(get('paginas'))</code> → {recibido.paginas}\n          </p>\n        </section>\n      )}\n    </main>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria (lección 1)\nconst router = createBrowserRouter([{ path: '/manuscritos/nuevo', action: recibir, Component: Registro }])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #fdfcf8;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #7c2d12;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  max-width: 42rem;\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.lista {\n  padding-left: 1.2rem;\n}\n\n.lista li {\n  margin-bottom: 0.3rem;\n}\n\n.chapa {\n  margin-left: 0.4rem;\n  padding: 0 0.45rem;\n  border-radius: 999px;\n  background: #e5e7eb;\n  font-size: 0.8rem;\n}\n\n.chapa.aceptado,\n.chapa.enviado {\n  background: #dcfce7;\n}\n\n.chapa.rechazado,\n.chapa.anulado {\n  background: #fee2e2;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(> input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n  margin: 0;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.3rem 0.4rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  cursor: pointer;\n}\n\nbutton.peligro {\n  color: #b91c1c;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #166534;\n}\n\n.eco {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #7c2d12;\n  background: #fff7ed;\n}\n\n.eco ul {\n  margin: 0.25rem 0;\n  padding-left: 1.2rem;\n}\n\n.eco p {\n  margin: 0.25rem 0;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n}\n\n.dos-columnas form {\n  flex: 1 1 14rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\n.orden li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.3rem;\n}\n\n.orden span {\n  flex: 1;\n}\n"
    }
  ],
  "urlInicial": "/manuscritos/nuevo",
  "strictMode": true,
  "mostrarConsola": false
}
```

**El formulario no se vacía.** En la lección 57, `<form action={…}>` de React volvía a dejar cada campo como estaba al principio. El `<Form>` de React Router no: frena el envío del navegador con `preventDefault` y se lo pasa al router, sin tocar los campos (comprobado en su código y en el navegador). Más abajo verás por qué es justo lo que quieres casi siempre.

**En TSX, `get()` no es un `string`.** Como puede devolver un `File` o `null`, TypeScript no te deja tratarlo como texto. Con `formData.get('titulo').trim()`, el panel de errores de tipos dice (comprobado con TypeScript 6.0.3):

```text
Object is possibly 'null'.
Property 'trim' does not exist on type 'FormDataEntryValue'.
  Property 'trim' does not exist on type 'File'.
```

Es decir: puede ser `null`, y `trim` no existe en `FormDataEntryValue` porque no existe en `File`. La salida rápida, `String(formData.get('titulo'))`, compila, pero convierte un campo que falta en el texto «null». Mejor una función pequeña que lo deje claro. Es la que usan todos los ejemplos de la lección, en `api.ts`:

```tsx
// Un campo de texto del formulario. get() devuelve string | File | null:
// si el campo no viene, o es un archivo, cuenta como vacío.
export function texto(formData: FormData, nombre: string): string {
  const valor = formData.get(nombre)
  return typeof valor === 'string' ? valor.trim() : ''
}
```

Si el formulario tiene muchas reglas, el esquema de Zod de la lección 61 también sirve aquí, dentro de la `action`: lo único que cambia es que el `FormData` sale de `request.formData()`.

## Varios botones, una sola `action`: el patrón *intent*

La ficha de un manuscrito tiene un formulario (las páginas y las notas de lectura) y cuatro botones: «Guardar notas», «Aceptar», «Rechazar» y «Borrar». Una ruta solo tiene una `action`, así que hay dos caminos:

- **Una ruta por botón**, sin componente, como la de los favoritos de la lección 99 (`/manuscritos/:id/aceptar`, `/manuscritos/:id/borrar`…).
- **Una sola `action` que mira qué botón se ha pulsado.**

El segundo es el más habitual, y se apoya en algo del HTML que ya usaste en la lección 57: **el botón que envía el formulario entra en el `FormData` con su `name` y su `value`**. Si todos se llaman `intent` («intención»: es una convención, no una API), la `action` lee `formData.get('intent')` y decide con un `switch`. El `<Form>` de React Router lo respeta: toma el botón que lanzó el envío (`event.nativeEvent.submitter`) y construye el `FormData` con él (comprobado en su código: `new FormData(form, submitter)`).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function accionManuscrito({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const intent = formData.get('intent')\n  const url = `/api/manuscritos/${params.id}`\n\n  switch (intent) {\n    case 'borrar':\n      await pedir(url, { method: 'DELETE' })\n      return redirect('/manuscritos')\n\n    case 'guardar':\n    case 'aceptar':\n    case 'rechazar': {\n      // Pulses el botón que pulses, llega el formulario entero\n      const paginas = Number(texto(formData, 'paginas'))\n      const notas = texto(formData, 'notas')\n      const errores: Errores = {}\n      if (!Number.isInteger(paginas) || paginas < 1) errores.paginas = 'Indica cuántas páginas tiene.'\n      if (intent !== 'guardar' && notas.length < 10) errores.notas = 'Antes de decidir, escribe tus notas de lectura.'\n      if (errores.paginas || errores.notas) return data({ errores }, { status: 400 })\n\n      const estado = intent === 'aceptar' ? 'aceptado' : intent === 'rechazar' ? 'rechazado' : undefined\n      await pedir(url, { method: 'PATCH', body: JSON.stringify({ paginas, notas, estado }) })\n      return { mensaje: estado ? `Manuscrito ${estado}.` : 'Notas guardadas.' }\n    }\n\n    default:\n      throw data(`No sé qué hacer con «${intent}»`, { status: 400 })\n  }\n}\n\n// En el componente, dentro de <Form method=\"post\">:\n<button name=\"intent\" value=\"guardar\">Guardar notas</button>\n<button name=\"intent\" value=\"aceptar\">Aceptar</button>\n<button name=\"intent\" value=\"rechazar\">Rechazar</button>\n<button name=\"intent\" value=\"borrar\" className=\"peligro\">Borrar</button>",
  "anotaciones": [
    {
      "fragmento": "const intent = formData.get('intent')",
      "nota": "El value del botón pulsado. Si el envío no sale de un botón con name=\"intent\", null."
    },
    {
      "fragmento": "case 'borrar':",
      "nota": "Borrar no necesita los campos: borra y se va a la lista. Por qué hay que irse lo ves en la sección de después de un POST."
    },
    {
      "fragmento": "case 'rechazar': {",
      "nota": "Tres botones que comparten el trabajo: los tres envían las páginas y las notas, así que se validan igual y se guardan juntas. Solo cambia el estado final."
    },
    {
      "fragmento": "if (intent !== 'guardar' && notas.length < 10)",
      "nota": "Una regla que depende del botón: guardar notas a medias vale, pero para aceptar o rechazar hay que haber escrito algo."
    },
    {
      "fragmento": "return data({ errores }, { status: 400 })",
      "nota": "Los errores se devuelven: el formulario sigue en pantalla, con lo escrito, y useActionData los trae. Lo ves en la sección siguiente."
    },
    {
      "fragmento": "default:",
      "nota": "Un intent desconocido no es un error del usuario: es un botón sin value o alguien que ha tocado el HTML. Se lanza, y lo recoge el ErrorBoundary."
    },
    {
      "fragmento": "<button name=\"intent\" value=\"guardar\">Guardar notas</button>",
      "nota": "El mismo name en todos, un value distinto en cada uno. El primero importa más de lo que parece: lo verás en los errores típicos."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La ficha de un manuscrito, con cuatro botones",
  "consigna": "Estás en la ficha de «Las salinas de invierno». Pulsa «Aceptar» sin notas: la action devuelve el error y no guarda nada. Escribe unas notas y acepta: en el registro de red sale un PATCH y después el GET de la ficha. Prueba «Borrar» en otro manuscrito: un DELETE y vuelves a la lista. El switch está en Ficha.tsx.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, Outlet, redirect, useNavigation, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Lista, { cargarLista } from './Lista'\nimport Ficha, { accionManuscrito, cargarManuscrito } from './Ficha'\nimport Nuevo, { crearManuscrito } from './Nuevo'\nimport './estilos.css'\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  const aviso = { idle: '', submitting: 'Enviando…', loading: 'Cargando…' }[navigation.state]\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Ediciones La Rueca · Comité de lectura</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/manuscritos\">Manuscritos</Link>\n        </nav>\n        <p className=\"aviso\">{aviso}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/manuscritos\">Volver a los manuscritos</Link>\n    </main>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria (lección 1)\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo la editorial…</p>,\n    children: [\n      { index: true, loader: () => redirect('/manuscritos') },\n      { path: 'manuscritos', loader: cargarLista, Component: Lista },\n      { path: 'manuscritos/nuevo', action: crearManuscrito, Component: Nuevo },\n      { path: 'manuscritos/:id', loader: cargarManuscrito, action: accionManuscrito, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import {\n  data,\n  Form,\n  redirect,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { pedir, texto, type Manuscrito } from './api'\n\nexport async function cargarManuscrito({ params, request }: LoaderFunctionArgs) {\n  const respuesta = await fetch(`/api/manuscritos/${params.id}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Ese manuscrito no está en la editorial', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { manuscrito: (await respuesta.json()) as Manuscrito }\n}\n\ntype Errores = { paginas?: string; notas?: string }\n\nexport async function accionManuscrito({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const intent = formData.get('intent')\n  const url = `/api/manuscritos/${params.id}`\n\n  switch (intent) {\n    case 'borrar':\n      await pedir(url, { method: 'DELETE' })\n      return redirect('/manuscritos')\n\n    case 'guardar':\n    case 'aceptar':\n    case 'rechazar': {\n      // Pulses el botón que pulses, llega el formulario entero\n      const paginas = Number(texto(formData, 'paginas'))\n      const notas = texto(formData, 'notas')\n      const errores: Errores = {}\n      if (!Number.isInteger(paginas) || paginas < 1) errores.paginas = 'Indica cuántas páginas tiene.'\n      if (intent !== 'guardar' && notas.length < 10) errores.notas = 'Antes de decidir, escribe tus notas de lectura.'\n      if (errores.paginas || errores.notas) return data({ errores }, { status: 400 })\n\n      const estado = intent === 'aceptar' ? 'aceptado' : intent === 'rechazar' ? 'rechazado' : undefined\n      await pedir(url, { method: 'PATCH', body: JSON.stringify({ paginas, notas, estado }) })\n      return { mensaje: estado ? `Manuscrito ${estado}.` : 'Notas guardadas.' }\n    }\n\n    default:\n      throw data(`No sé qué hacer con «${intent}»`, { status: 400 })\n  }\n}\n\nexport default function Ficha() {\n  const { manuscrito } = useLoaderData<typeof cargarManuscrito>()\n  const actionData = useActionData<typeof accionManuscrito>()\n  const errores: Errores = actionData && 'errores' in actionData ? actionData.errores : {}\n\n  return (\n    <article>\n      <h1>{manuscrito.titulo}</h1>\n      <p>\n        {manuscrito.autor} · {manuscrito.genero}\n        <span className={`chapa ${manuscrito.estado}`}>{manuscrito.estado}</span>\n      </p>\n\n      <Form method=\"post\" key={manuscrito.id}>\n        <label>\n          Páginas\n          <input\n            name=\"paginas\"\n            type=\"number\"\n            defaultValue={manuscrito.paginas}\n            aria-invalid={errores.paginas ? true : undefined}\n            aria-describedby={errores.paginas ? 'error-paginas' : undefined}\n          />\n        </label>\n        {errores.paginas && <p id=\"error-paginas\" role=\"alert\">{errores.paginas}</p>}\n        <label>\n          Notas de lectura\n          <textarea\n            name=\"notas\"\n            rows={3}\n            defaultValue={manuscrito.notas}\n            aria-invalid={errores.notas ? true : undefined}\n            aria-describedby={errores.notas ? 'error-notas' : undefined}\n          />\n        </label>\n        {errores.notas && <p id=\"error-notas\" role=\"alert\">{errores.notas}</p>}\n        <div className=\"botones\">\n          <button name=\"intent\" value=\"guardar\">Guardar notas</button>\n          <button name=\"intent\" value=\"aceptar\">Aceptar</button>\n          <button name=\"intent\" value=\"rechazar\">Rechazar</button>\n          <button name=\"intent\" value=\"borrar\" className=\"peligro\">Borrar</button>\n        </div>\n      </Form>\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Nuevo.tsx",
      "codigo": "import { data, Form, redirect, useActionData, type ActionFunctionArgs } from 'react-router'\nimport { pedir, texto, type Manuscrito } from './api'\n\nexport async function crearManuscrito({ request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const titulo = texto(formData, 'titulo')\n  const autor = texto(formData, 'autor')\n  if (!titulo || !autor) {\n    return data({ error: 'Escribe el título y quién lo firma.' }, { status: 400 })\n  }\n\n  const nuevo = await pedir<Manuscrito>('/api/manuscritos', {\n    method: 'POST',\n    body: JSON.stringify({ titulo, autor, genero: texto(formData, 'genero'), paginas: 0, estado: 'pendiente', notas: '' }),\n  })\n  // A la ficha del nuevo: tiene su propia dirección, que se puede recargar y compartir\n  return redirect(`/manuscritos/${nuevo.id}`)\n}\n\nexport default function Nuevo() {\n  const actionData = useActionData<typeof crearManuscrito>()\n\n  return (\n    <Form method=\"post\">\n      <h1>Registrar un manuscrito</h1>\n      <label>\n        Título\n        <input name=\"titulo\" />\n      </label>\n      <label>\n        Autor o autora\n        <input name=\"autor\" />\n      </label>\n      <label>\n        Género\n        <select name=\"genero\">\n          <option>novela</option>\n          <option>poesía</option>\n          <option>ensayo</option>\n          <option>infantil</option>\n        </select>\n      </label>\n      {actionData && <p role=\"alert\">{actionData.error}</p>}\n      <div className=\"botones\">\n        <button>Registrar</button>\n      </div>\n    </Form>\n  )\n}\n"
    },
    {
      "nombre": "Lista.tsx",
      "codigo": "import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Manuscrito } from './api'\n\nexport async function cargarLista({ request }: LoaderFunctionArgs) {\n  return { manuscritos: await pedir<Manuscrito[]>('/api/manuscritos', { signal: request.signal }) }\n}\n\nexport default function Lista() {\n  const { manuscritos } = useLoaderData<typeof cargarLista>()\n\n  return (\n    <>\n      <h1>Manuscritos</h1>\n      <ul className=\"lista\">\n        {manuscritos.map((manuscrito) => (\n          <li key={manuscrito.id}>\n            <Link to={`/manuscritos/${manuscrito.id}`}>{manuscrito.titulo}</Link>\n            <span className={`chapa ${manuscrito.estado}`}>{manuscrito.estado}</span>\n          </li>\n        ))}\n      </ul>\n      <Link to=\"/manuscritos/nuevo\">Registrar un manuscrito</Link>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Estado = 'pendiente' | 'aceptado' | 'rechazado'\n\nexport type Manuscrito = {\n  id: number\n  titulo: string\n  autor: string\n  genero: string\n  paginas: number\n  estado: Estado\n  notas: string\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\n// Un campo de texto del formulario. get() devuelve string | File | null:\n// si el campo no viene, o es un archivo, cuenta como vacío.\nexport function texto(formData: FormData, nombre: string): string {\n  const valor = formData.get(nombre)\n  return typeof valor === 'string' ? valor.trim() : ''\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #fdfcf8;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #7c2d12;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  max-width: 42rem;\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.lista {\n  padding-left: 1.2rem;\n}\n\n.lista li {\n  margin-bottom: 0.3rem;\n}\n\n.chapa {\n  margin-left: 0.4rem;\n  padding: 0 0.45rem;\n  border-radius: 999px;\n  background: #e5e7eb;\n  font-size: 0.8rem;\n}\n\n.chapa.aceptado,\n.chapa.enviado {\n  background: #dcfce7;\n}\n\n.chapa.rechazado,\n.chapa.anulado {\n  background: #fee2e2;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(> input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n  margin: 0;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.3rem 0.4rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  cursor: pointer;\n}\n\nbutton.peligro {\n  color: #b91c1c;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #166534;\n}\n\n.eco {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #7c2d12;\n  background: #fff7ed;\n}\n\n.eco ul {\n  margin: 0.25rem 0;\n  padding-left: 1.2rem;\n}\n\n.eco p {\n  margin: 0.25rem 0;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n}\n\n.dos-columnas form {\n  flex: 1 1 14rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\n.orden li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.3rem;\n}\n\n.orden span {\n  flex: 1;\n}\n"
    }
  ],
  "archivoInicial": "Ficha.tsx",
  "urlInicial": "/manuscritos/1",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "manuscritos": [
      {
        "id": 1,
        "titulo": "Las salinas de invierno",
        "autor": "Elvira Mardones",
        "genero": "novela",
        "paginas": 312,
        "estado": "pendiente",
        "notas": ""
      },
      {
        "id": 2,
        "titulo": "Cuaderno del Tormes",
        "autor": "Ignacio Sendín",
        "genero": "poesía",
        "paginas": 96,
        "estado": "pendiente",
        "notas": ""
      },
      {
        "id": 3,
        "titulo": "El faro de las hormigas",
        "autor": "Paula Rebollo",
        "genero": "infantil",
        "paginas": 48,
        "estado": "aceptado",
        "notas": "Las ilustraciones son de la propia autora."
      },
      {
        "id": 4,
        "titulo": "Noventa días sin cobertura",
        "autor": "Tomás Ayuso",
        "genero": "ensayo",
        "paginas": 210,
        "estado": "rechazado",
        "notas": "Muy parecido a un ensayo que ya publicamos."
      },
      {
        "id": 5,
        "titulo": "La sastra de Béjar",
        "autor": "Marina Holgado",
        "genero": "novela",
        "paginas": 264,
        "estado": "pendiente",
        "notas": ""
      }
    ]
  },
  "red": {
    "latencia": 500
  }
}
```

**Cada botón envía el formulario entero.** «Aceptar» manda las páginas y las notas, además de `intent=aceptar`, y por eso un mismo envío puede validar, guardar y cambiar el estado. Si un botón no debe mandar nada del formulario, ponlo en su propio `<Form>`.

¿Y si prefieres una ruta por botón? También se puede sin JavaScript: `<button formAction="/manuscritos/1/duplicar">` envía el mismo formulario a la `action` de otra ruta. React Router lee el atributo `formaction` del botón que envía, igual que lee su `name` y su `value`. Comprobado en un proyecto de Vite con React 19.3.1 y React Router 8.5.0: la `action` de la otra ruta recibió todos los campos y su `redirect` funcionó. La ventaja del *intent* es que todo lo que se puede hacer con un manuscrito está en una función, y se lee de un vistazo.

## Errores de validación: se devuelven, con su estado

La lección 99 dejó la regla: **lo que el usuario puede corregir se devuelve; lo que no tiene arreglo desde el formulario se lanza.** La [guía de validación](https://reactrouter.com/how-to/form-validation) de React Router la cuenta con un `data({ errors }, { status: 400 })`, y la página de [códigos de estado](https://reactrouter.com/how-to/status), con `data()` para cualquier código. En la práctica:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué devolver y qué lanzar desde una action",
  "roles": [
    {
      "etiqueta": "return data(…, 400)",
      "rol": "Un campo mal rellenado",
      "descripcion": "El formulario sigue en pantalla con lo escrito, y useActionData trae los errores para pintarlos junto a cada campo."
    },
    {
      "etiqueta": "return data(…, 409)",
      "rol": "Choca con el estado de las cosas",
      "descripcion": "Enviar un pedido que ya está anulado. No es culpa de un campo, pero se explica en el mismo sitio. Lo practicas en el ejercicio 1."
    },
    {
      "etiqueta": "throw data(…, 404)",
      "rol": "La petición no tiene sentido",
      "descripcion": "El manuscrito no existe o el intent es desconocido. Va al ErrorBoundary de la ruta, como el 404 de un loader."
    },
    {
      "etiqueta": "throw new Error()",
      "rol": "Lo inesperado",
      "descripcion": "El servidor responde 500 o se cae la red. También al ErrorBoundary. Los errores por ruta, a fondo, en la lección 8."
    }
  ]
}
```

El código de estado no es decorativo: **cuando la `action` devuelve una respuesta 4xx o 5xx, el router no vuelve a ejecutar los `loader`**, porque se supone que no ha cambiado nada. La documentación lo dice así: solo los 2xx revalidan. La lección 99 lo comprobó con el 400, y la 8 con un 409 devuelto. Si en vez de devolver lanzas (`throw data(…)` o un `Error`), sí vuelven a ejecutarse los `loader` de las rutas que quedan por encima del `ErrorBoundary` (comprobado en la lección 8). La revalidación entera es la lección 4.

**El tipo de lo que devuelve.** Con `useActionData<typeof accionManuscrito>()`, TypeScript sabe qué puede llegar. Comprobado con TypeScript 6.0.3, el tipo es:

```tsx
const actionData = useActionData<typeof accionManuscrito>()
// { errores: Errores } | { mensaje: string } | undefined
```

`data()` desaparece del tipo y queda lo que envuelve. El `redirect`, que es una `Response`, también desaparece: no hay nada que leer. Y `undefined` mientras no se haya enviado nada. Para saber cuál de los dos objetos tienes, pregunta por la propiedad, que TypeScript entiende como un estrechamiento:

```tsx
const errores: Errores = actionData && 'errores' in actionData ? actionData.errores : {}
```

Sin el genérico, `useActionData()` devuelve `any` y no te avisa de nada. Los tipos del router, de punta a punta, son la lección 15.

**El formulario no pierde lo escrito.** Como `<Form>` no vacía los campos, tras un 400 cada campo sigue con lo que la persona había escrito, también el que está mal, que es justo el que tiene que corregir. En la lección 61, con `<form action>` de React, hacía falta devolver los valores desde la acción para que el reinicio no los borrara. Aquí no. Lo que sí sigue siendo cosa tuya es que el error se entienda sin verlo: `aria-invalid`, `aria-describedby` y `role="alert"`, como en la lección 61 (en la ficha de arriba están).

Y una pregunta sobre cuánto dura lo que trae `useActionData`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// En la ficha de «Las salinas de invierno» borras las páginas y pulsas\n// «Guardar notas». La action devuelve:\nreturn data({ errores: { paginas: 'Indica cuántas páginas tiene.' } }, { status: 400 })\n\n// Sale el aviso. Pulsas «Manuscritos» en la cabecera y, ya en la lista,\n// el botón Atrás. Vuelves a la ficha. ¿Sigue el aviso?",
  "opciones": [
    "Sí: useActionData guarda la respuesta de cada ruta hasta el siguiente envío",
    "No: cualquier navegación nueva deja useActionData en undefined",
    "Solo si vuelves con Atrás: con un enlace sería una página nueva",
    "Sí, y además el campo de páginas sigue vacío porque el router lo recuerda"
  ],
  "correcta": 1,
  "explicacion": "Comprobado en Chromium con la 8.5.0: al ir a la lista, useActionData pasó a undefined, y al volver con Atrás siguió así. El router solo conserva lo que devolvió la action mientras se recargan los datos que siguen al envío. Es lo que quieres: un aviso viejo no tiene que aparecer al volver. Las páginas vuelven a salir de defaultValue, es decir, del loader."
}
```

## Después de un `POST`: quedarse, `redirect` o `replace`

Cuando la `action` termina bien, puede responder de tres maneras, y cada una deja el historial de una forma distinta. Lo medimos en Chromium con React Router 8.5.0, mirando `history.length` antes y después y adónde llevaba Atrás:

- **Devolver datos** (`return { mensaje }`). Te quedas en la misma dirección, se vuelven a ejecutar los `loader` y `useActionData` trae el mensaje. **El envío sustituye la entrada del historial en vez de añadir otra**: `history.length` no cambió, y Atrás llevó a la página anterior, no a la misma ficha antes de guardar. Un comentario en el código fuente de React Router 8.5.0 explica por qué: para que no haya que pulsar Atrás dos veces.
- **`redirect('/manuscritos/6')`**. Una navegación nueva, con su entrada en el historial: Atrás vuelve al formulario, vacío, porque se monta de nuevo.
- **`replace('/manuscritos/6')`**. Lo mismo, pero sustituyendo la entrada del formulario: Atrás se lo salta y vuelve a la página de antes. Se importa de `react-router`, como `redirect`.

¿Cuándo hay que irse a otra dirección? Cuando la que tienes deja de tener sentido. Después de **crear**, lo nuevo tiene su propia dirección, que se puede recargar y compartir. Y después de **borrar** lo que estás viendo… mira qué pasa si no te vas:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "case 'borrar':\n  await pedir(url, { method: 'DELETE' })\n  return { mensaje: 'Manuscrito borrado.' } // sin redirect\n\n// Estás en /manuscritos/4, la ficha de «Noventa días sin cobertura»,\n// y pulsas «Borrar». ¿Qué ves cuando termina?",
  "opciones": [
    "La misma ficha, con el aviso «Manuscrito borrado.»",
    "La lista de manuscritos, ya sin el 4",
    "La página de error: tras la action, el loader de la ficha pide un manuscrito que ya no existe",
    "Nada cambia hasta que recargas"
  ],
  "correcta": 2,
  "explicacion": "Después de una action que va bien, React Router vuelve a ejecutar los loader de la página, también el de la ficha. El manuscrito ya no está, el loader lanza su 404 y se pinta el ErrorBoundary. Comprobado en Chromium con la 8.5.0. Después de borrar lo que estás viendo, redirige."
}
```

En una web con servidor, redirigir después de un `POST` (el patrón Post/Redirect/Get) evita además que recargar la página vuelva a enviar el formulario. En una SPA con el router, ese problema no existe: el `POST` nunca fue una carga de página, así que recargar pide la dirección con un `GET` normal. Lo que sí se pierde al recargar es lo que traía `useActionData`. En el modo framework, donde un formulario funciona incluso antes de que cargue el JavaScript, el patrón vuelve a importar como siempre (lección 17).

Pruébalo en el registro de manuscritos, que redirige a la ficha del nuevo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Registrar, redirigir y pulsar Atrás",
  "consigna": "Pulsa «Registrar un manuscrito», rellénalo y registra: la action redirige a la ficha nueva. Pulsa Atrás en la barra: vuelves al formulario, vacío. Ahora, en Nuevo.tsx, cambia redirect por replace (en el import y en el return), registra otro y pulsa Atrás: vuelves a la lista. Por último, en una ficha, guarda notas y pulsa Atrás: no vuelves a la misma ficha, sino a la lista.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, Outlet, redirect, useNavigation, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Lista, { cargarLista } from './Lista'\nimport Ficha, { accionManuscrito, cargarManuscrito } from './Ficha'\nimport Nuevo, { crearManuscrito } from './Nuevo'\nimport './estilos.css'\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  const aviso = { idle: '', submitting: 'Enviando…', loading: 'Cargando…' }[navigation.state]\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Ediciones La Rueca · Comité de lectura</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/manuscritos\">Manuscritos</Link>\n        </nav>\n        <p className=\"aviso\">{aviso}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/manuscritos\">Volver a los manuscritos</Link>\n    </main>\n  )\n}\n\n// En la vista previa, createBrowserRouter usa un historial en memoria (lección 1)\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo la editorial…</p>,\n    children: [\n      { index: true, loader: () => redirect('/manuscritos') },\n      { path: 'manuscritos', loader: cargarLista, Component: Lista },\n      { path: 'manuscritos/nuevo', action: crearManuscrito, Component: Nuevo },\n      { path: 'manuscritos/:id', loader: cargarManuscrito, action: accionManuscrito, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import {\n  data,\n  Form,\n  redirect,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { pedir, texto, type Manuscrito } from './api'\n\nexport async function cargarManuscrito({ params, request }: LoaderFunctionArgs) {\n  const respuesta = await fetch(`/api/manuscritos/${params.id}`, { signal: request.signal })\n  if (respuesta.status === 404) throw data('Ese manuscrito no está en la editorial', { status: 404 })\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return { manuscrito: (await respuesta.json()) as Manuscrito }\n}\n\ntype Errores = { paginas?: string; notas?: string }\n\nexport async function accionManuscrito({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const intent = formData.get('intent')\n  const url = `/api/manuscritos/${params.id}`\n\n  switch (intent) {\n    case 'borrar':\n      await pedir(url, { method: 'DELETE' })\n      return redirect('/manuscritos')\n\n    case 'guardar':\n    case 'aceptar':\n    case 'rechazar': {\n      // Pulses el botón que pulses, llega el formulario entero\n      const paginas = Number(texto(formData, 'paginas'))\n      const notas = texto(formData, 'notas')\n      const errores: Errores = {}\n      if (!Number.isInteger(paginas) || paginas < 1) errores.paginas = 'Indica cuántas páginas tiene.'\n      if (intent !== 'guardar' && notas.length < 10) errores.notas = 'Antes de decidir, escribe tus notas de lectura.'\n      if (errores.paginas || errores.notas) return data({ errores }, { status: 400 })\n\n      const estado = intent === 'aceptar' ? 'aceptado' : intent === 'rechazar' ? 'rechazado' : undefined\n      await pedir(url, { method: 'PATCH', body: JSON.stringify({ paginas, notas, estado }) })\n      return { mensaje: estado ? `Manuscrito ${estado}.` : 'Notas guardadas.' }\n    }\n\n    default:\n      throw data(`No sé qué hacer con «${intent}»`, { status: 400 })\n  }\n}\n\nexport default function Ficha() {\n  const { manuscrito } = useLoaderData<typeof cargarManuscrito>()\n  const actionData = useActionData<typeof accionManuscrito>()\n  const errores: Errores = actionData && 'errores' in actionData ? actionData.errores : {}\n\n  return (\n    <article>\n      <h1>{manuscrito.titulo}</h1>\n      <p>\n        {manuscrito.autor} · {manuscrito.genero}\n        <span className={`chapa ${manuscrito.estado}`}>{manuscrito.estado}</span>\n      </p>\n\n      <Form method=\"post\" key={manuscrito.id}>\n        <label>\n          Páginas\n          <input\n            name=\"paginas\"\n            type=\"number\"\n            defaultValue={manuscrito.paginas}\n            aria-invalid={errores.paginas ? true : undefined}\n            aria-describedby={errores.paginas ? 'error-paginas' : undefined}\n          />\n        </label>\n        {errores.paginas && <p id=\"error-paginas\" role=\"alert\">{errores.paginas}</p>}\n        <label>\n          Notas de lectura\n          <textarea\n            name=\"notas\"\n            rows={3}\n            defaultValue={manuscrito.notas}\n            aria-invalid={errores.notas ? true : undefined}\n            aria-describedby={errores.notas ? 'error-notas' : undefined}\n          />\n        </label>\n        {errores.notas && <p id=\"error-notas\" role=\"alert\">{errores.notas}</p>}\n        <div className=\"botones\">\n          <button name=\"intent\" value=\"guardar\">Guardar notas</button>\n          <button name=\"intent\" value=\"aceptar\">Aceptar</button>\n          <button name=\"intent\" value=\"rechazar\">Rechazar</button>\n          <button name=\"intent\" value=\"borrar\" className=\"peligro\">Borrar</button>\n        </div>\n      </Form>\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Nuevo.tsx",
      "codigo": "import { data, Form, redirect, useActionData, type ActionFunctionArgs } from 'react-router'\nimport { pedir, texto, type Manuscrito } from './api'\n\nexport async function crearManuscrito({ request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const titulo = texto(formData, 'titulo')\n  const autor = texto(formData, 'autor')\n  if (!titulo || !autor) {\n    return data({ error: 'Escribe el título y quién lo firma.' }, { status: 400 })\n  }\n\n  const nuevo = await pedir<Manuscrito>('/api/manuscritos', {\n    method: 'POST',\n    body: JSON.stringify({ titulo, autor, genero: texto(formData, 'genero'), paginas: 0, estado: 'pendiente', notas: '' }),\n  })\n  // A la ficha del nuevo: tiene su propia dirección, que se puede recargar y compartir\n  return redirect(`/manuscritos/${nuevo.id}`)\n}\n\nexport default function Nuevo() {\n  const actionData = useActionData<typeof crearManuscrito>()\n\n  return (\n    <Form method=\"post\">\n      <h1>Registrar un manuscrito</h1>\n      <label>\n        Título\n        <input name=\"titulo\" />\n      </label>\n      <label>\n        Autor o autora\n        <input name=\"autor\" />\n      </label>\n      <label>\n        Género\n        <select name=\"genero\">\n          <option>novela</option>\n          <option>poesía</option>\n          <option>ensayo</option>\n          <option>infantil</option>\n        </select>\n      </label>\n      {actionData && <p role=\"alert\">{actionData.error}</p>}\n      <div className=\"botones\">\n        <button>Registrar</button>\n      </div>\n    </Form>\n  )\n}\n"
    },
    {
      "nombre": "Lista.tsx",
      "codigo": "import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Manuscrito } from './api'\n\nexport async function cargarLista({ request }: LoaderFunctionArgs) {\n  return { manuscritos: await pedir<Manuscrito[]>('/api/manuscritos', { signal: request.signal }) }\n}\n\nexport default function Lista() {\n  const { manuscritos } = useLoaderData<typeof cargarLista>()\n\n  return (\n    <>\n      <h1>Manuscritos</h1>\n      <ul className=\"lista\">\n        {manuscritos.map((manuscrito) => (\n          <li key={manuscrito.id}>\n            <Link to={`/manuscritos/${manuscrito.id}`}>{manuscrito.titulo}</Link>\n            <span className={`chapa ${manuscrito.estado}`}>{manuscrito.estado}</span>\n          </li>\n        ))}\n      </ul>\n      <Link to=\"/manuscritos/nuevo\">Registrar un manuscrito</Link>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Estado = 'pendiente' | 'aceptado' | 'rechazado'\n\nexport type Manuscrito = {\n  id: number\n  titulo: string\n  autor: string\n  genero: string\n  paginas: number\n  estado: Estado\n  notas: string\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\n// Un campo de texto del formulario. get() devuelve string | File | null:\n// si el campo no viene, o es un archivo, cuenta como vacío.\nexport function texto(formData: FormData, nombre: string): string {\n  const valor = formData.get(nombre)\n  return typeof valor === 'string' ? valor.trim() : ''\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #fdfcf8;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #7c2d12;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  max-width: 42rem;\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.lista {\n  padding-left: 1.2rem;\n}\n\n.lista li {\n  margin-bottom: 0.3rem;\n}\n\n.chapa {\n  margin-left: 0.4rem;\n  padding: 0 0.45rem;\n  border-radius: 999px;\n  background: #e5e7eb;\n  font-size: 0.8rem;\n}\n\n.chapa.aceptado,\n.chapa.enviado {\n  background: #dcfce7;\n}\n\n.chapa.rechazado,\n.chapa.anulado {\n  background: #fee2e2;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(> input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n  margin: 0;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.3rem 0.4rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  cursor: pointer;\n}\n\nbutton.peligro {\n  color: #b91c1c;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #166534;\n}\n\n.eco {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #7c2d12;\n  background: #fff7ed;\n}\n\n.eco ul {\n  margin: 0.25rem 0;\n  padding-left: 1.2rem;\n}\n\n.eco p {\n  margin: 0.25rem 0;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n}\n\n.dos-columnas form {\n  flex: 1 1 14rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\n.orden li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.3rem;\n}\n\n.orden span {\n  flex: 1;\n}\n"
    }
  ],
  "archivoInicial": "Nuevo.tsx",
  "urlInicial": "/manuscritos",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "manuscritos": [
      {
        "id": 1,
        "titulo": "Las salinas de invierno",
        "autor": "Elvira Mardones",
        "genero": "novela",
        "paginas": 312,
        "estado": "pendiente",
        "notas": ""
      },
      {
        "id": 2,
        "titulo": "Cuaderno del Tormes",
        "autor": "Ignacio Sendín",
        "genero": "poesía",
        "paginas": 96,
        "estado": "pendiente",
        "notas": ""
      },
      {
        "id": 3,
        "titulo": "El faro de las hormigas",
        "autor": "Paula Rebollo",
        "genero": "infantil",
        "paginas": 48,
        "estado": "aceptado",
        "notas": "Las ilustraciones son de la propia autora."
      },
      {
        "id": 4,
        "titulo": "Noventa días sin cobertura",
        "autor": "Tomás Ayuso",
        "genero": "ensayo",
        "paginas": 210,
        "estado": "rechazado",
        "notas": "Muy parecido a un ensayo que ya publicamos."
      },
      {
        "id": 5,
        "titulo": "La sastra de Béjar",
        "autor": "Marina Holgado",
        "genero": "novela",
        "paginas": 264,
        "estado": "pendiente",
        "notas": ""
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

Una última cosa sobre `redirect`: acepta cualquier dirección, también una de otro sitio. Si el destino sale de algo que escribe el usuario (un `?volver=` en la URL, por ejemplo), valídalo antes. La propia documentación de `redirect` lo avisa, y la lección 20 lo trata como lo que es, un fallo de seguridad.

## `useSubmit`: enviar desde el código

`<Form>` envía cuando alguien pulsa un botón o Enter. A veces el envío nace en otro sitio: un desplegable que guarda al cambiar, un atajo de teclado, un temporizador, arrastrar y soltar, o datos que no están en ningún campo porque viven en el estado. Para eso está **`useSubmit`: la versión en código de `<Form>`, con el mismo resultado. Es una navegación que ejecuta la `action`, vuelve a cargar los datos y puede redirigir.**

```tsx
const submit = useSubmit()

submit(loQueEnvias, { method: 'post', action: '/manuscritos/orden', encType: 'application/json' })
```

`loQueEnvias` puede ser un `<form>` (o el botón que lo envía), un `FormData`, un `URLSearchParams` o un objeto normal. Las opciones son las de `<Form>` (`method`, `action`, `encType`, `replace`…), y dos de sus valores por defecto dan sorpresas:

- **`method` es `'get'`**, como en un `<form>` de HTML. Sin `method: 'post'`, la `action` no se ejecuta: lo verás en los errores típicos.
- **`action` es la ruta más cercana**, la del componente en el que llamas a `useSubmit`, no la dirección que se ve en la barra.

Cómo llega cada cosa a la `action` depende de lo que envíes y del `encType`. Lo comprobamos en Chromium, enviando lo mismo de varias formas:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Un objeto, sin encType",
      "texto": "Se codifica como un formulario y se lee con request.formData(). Cada valor pasa a texto: ['sabado', 'domingo'] llega como «sabado,domingo», true como «true», null como «null» y un objeto como «[object Object]»."
    },
    {
      "titulo": "Un objeto, con encType: 'application/json'",
      "texto": "Llega como JSON y se lee con request.json(), con sus tipos: arrays, números y objetos anidados. Es lo natural para datos que salen del estado."
    },
    {
      "titulo": "Un formulario o un FormData",
      "texto": "Igual que con Form, pero sin botón que lo envíe: el intent no viaja, salvo que lo añadas tú. Otro error típico."
    },
    {
      "titulo": "En TSX, solo valores JSON",
      "texto": "submit({ dia: new Date() }, …) no compila: «Argument of type '{ dia: Date; }' is not assignable to parameter of type 'SubmitTarget'.» Convierte antes las fechas a texto."
    },
    {
      "titulo": "Devuelve una promesa",
      "texto": "Se cumple cuando la navegación termina, recarga de datos incluida (comprobado: al cumplirse, el router ya estaba en idle). React pinta el resultado justo después."
    }
  ]
}
```

El caso más claro para `useSubmit` es enviar algo que no está en ningún campo. El comité decide en qué orden lee los pendientes: los mueve con las flechas, el orden vive en un estado, y «Guardar el orden» lo envía como JSON.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "export async function guardarOrden({ request }: ActionFunctionArgs) {\n  // Llega como JSON, así que se lee con request.json(), con sus tipos\n  const { orden } = (await request.json()) as { orden: number[] }\n  await Promise.all(\n    orden.map((id, i) => pedir(`/api/manuscritos/${id}`, { method: 'PATCH', body: JSON.stringify({ orden: i + 1 }) })),\n  )\n  return { mensaje: `Orden guardado: ${orden.length} manuscritos.` }\n}\n\nexport default function Orden() {\n  const { pendientes } = useLoaderData<typeof cargarPendientes>()\n  const actionData = useActionData<typeof guardarOrden>()\n  const submit = useSubmit()\n  // El orden nuevo vive en el estado: no está en ningún campo de formulario\n  const [ids, setIds] = useState(() => pendientes.map((m) => m.id))\n\n  function guardar() {\n    submit({ orden: ids }, { method: 'post', encType: 'application/json' })\n  }\n\n  // …la lista con las flechas, que cambian ids con setIds\n  return <button onClick={guardar}>Guardar el orden</button>\n}",
  "anotaciones": [
    {
      "fragmento": "const submit = useSubmit()",
      "nota": "Una función para enviar desde cualquier sitio del componente: un clic, un efecto, un temporizador."
    },
    {
      "fragmento": "submit({ orden: ids }, { method: 'post', encType: 'application/json' })",
      "nota": "Un objeto normal, como JSON. Sin action en las opciones, va a la ruta de este componente: /manuscritos/orden. Sin method, sería un GET y la action ni se enteraría."
    },
    {
      "fragmento": "(await request.json()) as { orden: number[] }",
      "nota": "Con JSON, request.json() en vez de request.formData(). El as solo le dice a TypeScript qué esperar: no comprueba nada. Si el cuerpo puede venir mal, valídalo (con Zod, por ejemplo, lección 61)."
    },
    {
      "fragmento": "Promise.all(",
      "nota": "Un PATCH por manuscrito, a la vez. Al terminar la action, el router vuelve a ejecutar el loader y la lista sale ya ordenada desde el servidor."
    },
    {
      "fragmento": "useState(() => pendientes.map((m) => m.id))",
      "nota": "El estado empieza con el orden del loader. Moverlos no envía nada: solo cambia el estado hasta que pulsas Guardar."
    }
  ]
}
```

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El orden de lectura, enviado como JSON",
  "consigna": "Sube «La sastra de Béjar» al primer puesto y pulsa «Guardar el orden»: en el registro de red salen tres PATCH y después el GET del loader. Pulsa Recargar en la barra: el orden sigue, porque está en la API. Después, en Orden.tsx, quita encType de las opciones de submit y vuelve a guardar: llega algo como «orden=5,1,2», codificado como un formulario, request.json() no puede leerlo y sale la página de error.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Orden, { cargarPendientes, guardarOrden } from './Orden'\nimport './estilos.css'\n\nfunction ErrorOrden() {\n  const error = useRouteError()\n  const detalle = isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : String(error)\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{detalle}</p>\n    </main>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/manuscritos/orden',\n    loader: cargarPendientes,\n    action: guardarOrden,\n    Component: Orden,\n    ErrorBoundary: ErrorOrden,\n    HydrateFallback: () => <p>Abriendo la editorial…</p>,\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Orden.tsx",
      "codigo": "import { useState } from 'react'\nimport { useActionData, useLoaderData, useSubmit, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Manuscrito } from './api'\n\nexport async function cargarPendientes({ request }: LoaderFunctionArgs) {\n  const todos = await pedir<Manuscrito[]>('/api/manuscritos', { signal: request.signal })\n  return { pendientes: todos.filter((m) => m.estado === 'pendiente').sort((a, b) => a.orden - b.orden) }\n}\n\nexport async function guardarOrden({ request }: ActionFunctionArgs) {\n  // Llega como JSON, así que se lee con request.json(), con sus tipos\n  const { orden } = (await request.json()) as { orden: number[] }\n  await Promise.all(\n    orden.map((id, i) => pedir(`/api/manuscritos/${id}`, { method: 'PATCH', body: JSON.stringify({ orden: i + 1 }) })),\n  )\n  return { mensaje: `Orden guardado: ${orden.length} manuscritos.` }\n}\n\nexport default function Orden() {\n  const { pendientes } = useLoaderData<typeof cargarPendientes>()\n  const actionData = useActionData<typeof guardarOrden>()\n  const submit = useSubmit()\n  // El orden nuevo vive en el estado: no está en ningún campo de formulario\n  const [ids, setIds] = useState(() => pendientes.map((m) => m.id))\n  const titulo = (id: number) => pendientes.find((m) => m.id === id)?.titulo\n\n  function mover(desde: number, hasta: number) {\n    const nuevos = [...ids]\n    const [id] = nuevos.splice(desde, 1)\n    nuevos.splice(hasta, 0, id)\n    setIds(nuevos)\n  }\n\n  function guardar() {\n    submit({ orden: ids }, { method: 'post', encType: 'application/json' })\n  }\n\n  return (\n    <main>\n      <h1>Orden de lectura</h1>\n      <ol className=\"orden\">\n        {ids.map((id, i) => (\n          <li key={id}>\n            <span>{titulo(id)}</span>\n            <button aria-label={`Subir «${titulo(id)}»`} disabled={i === 0} onClick={() => mover(i, i - 1)}>\n              ↑\n            </button>\n            <button aria-label={`Bajar «${titulo(id)}»`} disabled={i === ids.length - 1} onClick={() => mover(i, i + 1)}>\n              ↓\n            </button>\n          </li>\n        ))}\n      </ol>\n      <button onClick={guardar}>Guardar el orden</button>\n      {actionData && <p role=\"status\">{actionData.mensaje}</p>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Estado = 'pendiente' | 'aceptado' | 'rechazado'\n\nexport type Manuscrito = {\n  id: number\n  titulo: string\n  autor: string\n  genero: string\n  paginas: number\n  estado: Estado\n  notas: string\n  orden: number\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\n// Un campo de texto del formulario. get() devuelve string | File | null:\n// si el campo no viene, o es un archivo, cuenta como vacío.\nexport function texto(formData: FormData, nombre: string): string {\n  const valor = formData.get(nombre)\n  return typeof valor === 'string' ? valor.trim() : ''\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #fdfcf8;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #7c2d12;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  max-width: 42rem;\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.lista {\n  padding-left: 1.2rem;\n}\n\n.lista li {\n  margin-bottom: 0.3rem;\n}\n\n.chapa {\n  margin-left: 0.4rem;\n  padding: 0 0.45rem;\n  border-radius: 999px;\n  background: #e5e7eb;\n  font-size: 0.8rem;\n}\n\n.chapa.aceptado,\n.chapa.enviado {\n  background: #dcfce7;\n}\n\n.chapa.rechazado,\n.chapa.anulado {\n  background: #fee2e2;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(> input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n  margin: 0;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.3rem 0.4rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  cursor: pointer;\n}\n\nbutton.peligro {\n  color: #b91c1c;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #166534;\n}\n\n.eco {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #7c2d12;\n  background: #fff7ed;\n}\n\n.eco ul {\n  margin: 0.25rem 0;\n  padding-left: 1.2rem;\n}\n\n.eco p {\n  margin: 0.25rem 0;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n}\n\n.dos-columnas form {\n  flex: 1 1 14rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\n.orden li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.3rem;\n}\n\n.orden span {\n  flex: 1;\n}\n"
    }
  ],
  "archivoInicial": "Orden.tsx",
  "urlInicial": "/manuscritos/orden",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "manuscritos": [
      {
        "id": 1,
        "titulo": "Las salinas de invierno",
        "autor": "Elvira Mardones",
        "genero": "novela",
        "paginas": 312,
        "estado": "pendiente",
        "notas": "",
        "orden": 1
      },
      {
        "id": 2,
        "titulo": "Cuaderno del Tormes",
        "autor": "Ignacio Sendín",
        "genero": "poesía",
        "paginas": 96,
        "estado": "pendiente",
        "notas": "",
        "orden": 2
      },
      {
        "id": 3,
        "titulo": "El faro de las hormigas",
        "autor": "Paula Rebollo",
        "genero": "infantil",
        "paginas": 48,
        "estado": "aceptado",
        "notas": "Las ilustraciones son de la propia autora.",
        "orden": 0
      },
      {
        "id": 4,
        "titulo": "Noventa días sin cobertura",
        "autor": "Tomás Ayuso",
        "genero": "ensayo",
        "paginas": 210,
        "estado": "rechazado",
        "notas": "Muy parecido a un ensayo que ya publicamos.",
        "orden": 0
      },
      {
        "id": 5,
        "titulo": "La sastra de Béjar",
        "autor": "Marina Holgado",
        "genero": "novela",
        "paginas": 264,
        "estado": "pendiente",
        "notas": "",
        "orden": 3
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

¿Por qué no un fetcher? Podría serlo: guardar el orden no cambia de página. La diferencia entre enviar navegando (`<Form>`, `useSubmit`) y enviar sin navegar (`useFetcher`) es la lección 5. De momento, la regla de la documentación de React Router: si el envío debe cambiar la dirección o tiene sentido como un paso en el historial, navega; si es un cambio pequeño dentro de la misma vista, un fetcher.

## `<form action>` de React o la `action` del router

En la lección 57 enviaste formularios con una Action de React: una función en `<form action={…}>` que React ejecuta en una transición. En la 58 le diste estado con `useActionState`. Las dos funcionan igual dentro de una app con React Router: el router no se mete. La pregunta es cuál usar, y un experimento responde mejor que una tabla.

En la misma página, una lista que sale de un `loader` y dos formularios que registran un manuscrito en la misma API: uno con la `action` de la ruta y otro con una Action de React.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos formularios, el mismo servidor",
  "consigna": "Registra «Diario de Ledesma» con el formulario del router: la lista lo enseña al momento y el campo se queda escrito. Registra «Cartas desde Candelario» con la Action de React: el mensaje dice «Registrado», el campo se vacía… y la lista no cambia. Pulsa Recargar en la barra: ahí estaba. La API lo guardó; al router nadie le avisó.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useActionState } from 'react'\nimport {\n  createBrowserRouter,\n  data,\n  Form,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport { pedir, texto, type Manuscrito } from './api'\nimport './estilos.css'\n\nasync function cargarLista({ request }: LoaderFunctionArgs) {\n  return { manuscritos: await pedir<Manuscrito[]>('/api/manuscritos', { signal: request.signal }) }\n}\n\nfunction registrar(titulo: string) {\n  return pedir('/api/manuscritos', { method: 'POST', body: JSON.stringify({ titulo, estado: 'pendiente' }) })\n}\n\n// 1. La action del router: una propiedad de la ruta, que recibe un Request\nasync function accionLista({ request }: ActionFunctionArgs) {\n  const titulo = texto(await request.formData(), 'titulo')\n  if (!titulo) return data({ mensaje: 'Escribe el título.' }, { status: 400 })\n  await registrar(titulo)\n  return { mensaje: `Registrado: ${titulo}` }\n}\n\nfunction ConRouter() {\n  const actionData = useActionData<typeof accionLista>()\n  return (\n    <Form method=\"post\">\n      <h2>Con la action del router</h2>\n      <label>\n        Título (router)\n        <input name=\"titulo\" />\n      </label>\n      <button>Registrar con el router</button>\n      <p role=\"status\">{actionData?.mensaje}</p>\n    </Form>\n  )\n}\n\n// 2. Una Action de React (lecciones 57 y 58): una función del componente\nfunction ConReact() {\n  const [mensaje, accion, pendiente] = useActionState(async (_anterior: string, formData: FormData) => {\n    const titulo = texto(formData, 'titulo')\n    if (!titulo) return 'Escribe el título.'\n    await registrar(titulo)\n    return `Registrado: ${titulo}`\n  }, '')\n  return (\n    <form action={accion}>\n      <h2>Con una Action de React</h2>\n      <label>\n        Título (React)\n        <input name=\"titulo\" />\n      </label>\n      <button>{pendiente ? 'Registrando…' : 'Registrar con React'}</button>\n      <p role=\"status\">{mensaje}</p>\n    </form>\n  )\n}\n\nfunction Manuscritos() {\n  const { manuscritos } = useLoaderData<typeof cargarLista>()\n  return (\n    <main>\n      <h1>Manuscritos</h1>\n      <ul className=\"lista\">\n        {manuscritos.map((manuscrito) => (\n          <li key={manuscrito.id}>{manuscrito.titulo}</li>\n        ))}\n      </ul>\n      <div className=\"dos-columnas\">\n        <ConRouter />\n        <ConReact />\n      </div>\n    </main>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/manuscritos',\n    loader: cargarLista,\n    action: accionLista,\n    Component: Manuscritos,\n    HydrateFallback: () => <p>Abriendo la editorial…</p>,\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Estado = 'pendiente' | 'aceptado' | 'rechazado'\n\nexport type Manuscrito = {\n  id: number\n  titulo: string\n  autor: string\n  genero: string\n  paginas: number\n  estado: Estado\n  notas: string\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\n// Un campo de texto del formulario. get() devuelve string | File | null:\n// si el campo no viene, o es un archivo, cuenta como vacío.\nexport function texto(formData: FormData, nombre: string): string {\n  const valor = formData.get(nombre)\n  return typeof valor === 'string' ? valor.trim() : ''\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #fdfcf8;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #7c2d12;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  max-width: 42rem;\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.lista {\n  padding-left: 1.2rem;\n}\n\n.lista li {\n  margin-bottom: 0.3rem;\n}\n\n.chapa {\n  margin-left: 0.4rem;\n  padding: 0 0.45rem;\n  border-radius: 999px;\n  background: #e5e7eb;\n  font-size: 0.8rem;\n}\n\n.chapa.aceptado,\n.chapa.enviado {\n  background: #dcfce7;\n}\n\n.chapa.rechazado,\n.chapa.anulado {\n  background: #fee2e2;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(> input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n  margin: 0;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.3rem 0.4rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  cursor: pointer;\n}\n\nbutton.peligro {\n  color: #b91c1c;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #166534;\n}\n\n.eco {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #7c2d12;\n  background: #fff7ed;\n}\n\n.eco ul {\n  margin: 0.25rem 0;\n  padding-left: 1.2rem;\n}\n\n.eco p {\n  margin: 0.25rem 0;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n}\n\n.dos-columnas form {\n  flex: 1 1 14rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\n.orden li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.3rem;\n}\n\n.orden span {\n  flex: 1;\n}\n"
    }
  ],
  "urlInicial": "/manuscritos",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "manuscritos": [
      {
        "id": 1,
        "titulo": "Las salinas de invierno",
        "autor": "Elvira Mardones",
        "genero": "novela",
        "paginas": 312,
        "estado": "pendiente",
        "notas": ""
      },
      {
        "id": 2,
        "titulo": "Cuaderno del Tormes",
        "autor": "Ignacio Sendín",
        "genero": "poesía",
        "paginas": 96,
        "estado": "pendiente",
        "notas": ""
      },
      {
        "id": 3,
        "titulo": "El faro de las hormigas",
        "autor": "Paula Rebollo",
        "genero": "infantil",
        "paginas": 48,
        "estado": "aceptado",
        "notas": "Las ilustraciones son de la propia autora."
      }
    ]
  },
  "red": {
    "latencia": 300
  }
}
```

Los dos guardaron lo mismo en el mismo servidor. **La diferencia es quién se entera.** `<Form>` es una navegación del router: después de la `action`, el router vuelve a ejecutar los `loader` y la lista se actualiza sola. La Action de React es una función de tu componente: React la ejecuta, actualiza su estado y ahí se acaba. El router no sabe que ha pasado nada. Lo comprobamos en Chromium con la 8.5.0: después de la Action de React, la API tenía un manuscrito más y la lista seguía igual.

| | Action de React | `action` del router |
|---|---|---|
| Dónde vive | En el componente | En la ruta |
| Qué recibe | Un `FormData` | Un `Request` |
| Al terminar | Nada más | Recarga o redirige |
| Los campos | Se vacían | Se quedan |
| «Enviando…» | `isPending` | `useNavigation` |

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "useFormStatus sirve también para un Form del router",
      "realidad": "No. useFormStatus (lección 59) lee el estado de un form con una Action de React. Con un Form del router, pending siguió en false durante todo el envío (comprobado). Para el router, useNavigation; para un fetcher, fetcher.state."
    },
    {
      "mito": "Con la action del router también hace falta useActionState",
      "realidad": "No: useActionData ya es lo que devolvió la action, y useNavigation hace de isPending. useActionState es para las Actions de React."
    },
    {
      "mito": "Para varios botones hacen falta varias rutas",
      "realidad": "Basta un name=\"intent\" en cada botón y un switch en la action. Si prefieres una ruta por botón, formAction en el botón."
    },
    {
      "mito": "Un 400 es un error, así que hay que lanzarlo",
      "realidad": "El 400 dice qué ha pasado; return o throw dicen dónde se pinta. Devuelto, en el formulario; lanzado, en el ErrorBoundary, sin el formulario."
    }
  ]
}
```

## Cuándo lo usarías de verdad

Casi todo lo que cambia datos en una app en modo de datos va por la `action` de una ruta. Lo que queda es elegir cómo se le envía:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro formas de enviar, y cuándo usar cada una",
  "roles": [
    {
      "etiqueta": "<Form> + action",
      "rol": "Cambiar datos de la página",
      "descripcion": "Crear, editar, borrar, decidir. El router recarga los loader o te lleva a otra dirección. Con varios botones, intent."
    },
    {
      "etiqueta": "useSubmit",
      "rol": "Lo mismo, desde el código",
      "descripcion": "Un desplegable que guarda al cambiar, un atajo de teclado, datos del estado enviados como JSON."
    },
    {
      "etiqueta": "useFetcher",
      "rol": "Sin navegar",
      "descripcion": "Cambios pequeños dentro de la misma vista, varios a la vez: la estrella de favoritos de la lección 99. Lección 5."
    },
    {
      "etiqueta": "Action de React",
      "rol": "Lo que no toca las rutas",
      "descripcion": "Calcular el coste de una tirada, apuntarse al boletín de novedades o un componente que también se usa fuera del router."
    }
  ]
}
```

Si usas una Action de React para algo que sí cambia datos de un `loader`, tendrás que pedirle al router que vuelva a cargarlos (`useRevalidator`, lección 4). Funciona, pero estás rehaciendo a mano lo que la `action` de la ruta hace sola. Y en el modo framework hay un motivo más para preferir la del router: es la que funciona en el servidor y sin JavaScript (lecciones 16 y 17).

## Errores típicos

**El primer botón es el peligroso.** Pulsar Enter en un campo de texto envía el formulario, y el navegador lo hace «pulsando» el primer botón de envío. Con el patrón *intent*, eso decide qué hace la `action`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "<Form method=\"post\">\n  <button name=\"intent\" value=\"borrar\">Borrar</button>\n  <label>\n    Páginas <input name=\"paginas\" type=\"number\" />\n  </label>\n  <button name=\"intent\" value=\"guardar\">Guardar notas</button>\n</Form>\n\n// Cambias las páginas a 320 y pulsas Enter dentro del campo.\n// ¿Qué intent llega a la action?",
  "opciones": [
    "guardar: Enter usa el botón que está después del campo",
    "Ninguno: un envío con Enter no lleva botón",
    "borrar: Enter usa el primer botón de envío del formulario",
    "Ninguno, porque con varios botones Enter no envía"
  ],
  "correcta": 2,
  "explicacion": "El envío implícito del HTML usa el botón por defecto del formulario, que es el primer botón de envío, esté donde esté. Comprobado en Chromium y en WebKit: llegó intent=borrar y el registro se borró. Pon primero el botón inofensivo, o saca el peligroso a su propio Form."
}
```

En la ficha del manuscrito, «Guardar notas» va primero por eso. Mover los botones con CSS (`order`, `flex-direction: row-reverse`) no cambia cuál es el primero para el navegador: cuenta el orden del HTML.

**`submit()` sin `method`.** `submit({ intent: 'prioridad', prioridad: 'alta' })` no llama a la `action`: hace un `GET` y pone los datos en la dirección, que pasa a ser `/manuscritos/2?intent=prioridad&prioridad=alta`. Solo se ejecuta el `loader`. Comprobado en la vista previa con el ejercicio 2: la dirección pasó a esa y la prioridad siguió como estaba. Con `useSubmit`, escribe siempre `method: 'post'`.

**Enviar el formulario desde el código y perder el `intent`.** `submit(evento.currentTarget.form)` envía los campos, pero ningún botón: el `intent` es `null`, la `action` cae en el `default` y salta la página de error con «No sé qué hacer con «null»» (comprobado). Si envías desde el código, pon tú el intent:

```tsx
const datos = new FormData(formulario)
datos.set('intent', 'guardar')
submit(datos, { method: 'post' })
```

**Leer el cuerpo dos veces.** El cuerpo de una petición se lee una sola vez. Un segundo `request.formData()` lanza un error, y el texto depende del navegador:

```text
TypeError: Failed to execute 'formData' on 'Request': body stream already read
TypeError: Body is disturbed or locked
```

El primero es Chromium y el segundo WebKit (comprobados los dos). Es decir: el cuerpo ya se ha leído, o está bloqueado. Léelo una vez, guárdalo en una variable y pásala. Si de verdad necesitas leerlo dos veces, `request.clone()` antes de la primera lectura. Y no mezcles formatos: con un envío JSON, `request.formData()` también falla. En Chromium, con un mensaje que no ayuda nada: `TypeError: Failed to fetch`.

**Los campos de la ficha anterior.** Sin `key`, al pasar de `/manuscritos/1` a `/manuscritos/2` el formulario no se vuelve a montar: es el mismo componente en la misma ruta. Los campos con `defaultValue` se quedan con lo que tenían, y la ficha 2 enseña las páginas y las notas de la 1. Comprobado en Chromium y en la vista previa: con la ficha del manuscrito 2 en pantalla, «Páginas» seguía diciendo 312, las del 1. Es lo que viste en la lección 26 de React: una `key` distinta hace un componente nuevo. Por eso la ficha lleva `<Form method="post" key={manuscrito.id}>`.

## Ejercicios

Los dos usan React Router de verdad, en TSX. El trabajo va donde dicen los comentarios numerados.

**1. Los pedidos de las librerías.** La Rueca sirve sus libros a librerías de Castilla y León. Cada pedido tiene una ficha con cuatro botones, pero de momento todos hacen lo mismo: guardar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cuatro botones que hagan cuatro cosas",
  "consigna": "En Pedido.tsx: 1) dale a cada botón name=\"intent\" y su value (guardar, enviar, anular y borrar); 2) en accionPedido, lee el intent y decide con un switch, como dice el comentario. Un pedido anulado no se puede enviar: devuelve el error con un 409, sin lanzarlo. Prueba «Marcar como enviado» en el pedido de Tres Rayas, que está anulado.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, Outlet, useNavigation, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Pedidos, { cargarPedidos } from './Pedidos'\nimport FichaPedido, { accionPedido, cargarPedido } from './Pedido'\nimport './estilos.css'\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  const aviso = { idle: '', submitting: 'Enviando…', loading: 'Cargando…' }[navigation.state]\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Ediciones La Rueca · Pedidos de librerías</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/pedidos\">Todos los pedidos</Link>\n        </nav>\n        <p className=\"aviso\">{aviso}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/pedidos\">Volver a los pedidos</Link>\n    </main>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo los pedidos…</p>,\n    children: [\n      { path: 'pedidos', loader: cargarPedidos, Component: Pedidos },\n      { path: 'pedidos/:id', loader: cargarPedido, action: accionPedido, Component: FichaPedido },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Pedido.tsx",
      "codigo": "import {\n  data,\n  Form,\n  redirect,\n  useActionData,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { pedir, texto, type Pedido } from './api'\n\nexport async function cargarPedido({ params, request }: LoaderFunctionArgs) {\n  return { pedido: await pedir<Pedido>(`/api/pedidos/${params.id}`, { signal: request.signal }) }\n}\n\ntype Errores = { ejemplares?: string; estado?: string }\n\nexport async function accionPedido({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const url = `/api/pedidos/${params.id}`\n\n  // 2. Ahora cualquier botón guarda. Lee el intent y decide con un switch:\n  //    'guardar' → lo que ya hace este código (validar y guardar)\n  //    'enviar'  → si el pedido está anulado, devuelve con estado 409 el error\n  //                errores.estado = 'Un pedido anulado no se puede enviar.';\n  //                si no, cambia su estado a 'enviado' → 'Pedido enviado.'\n  //    'anular'  → estado 'anulado' → 'Pedido anulado.'\n  //    'borrar'  → DELETE y redirect a /pedidos (lo importas ya arriba)\n  //    otro      → throw data('Acción desconocida', { status: 400 })\n  const ejemplares = Number(texto(formData, 'ejemplares'))\n  if (!Number.isInteger(ejemplares) || ejemplares < 1 || ejemplares > 500) {\n    const errores: Errores = { ejemplares: 'Pide entre 1 y 500 ejemplares.' }\n    return data({ errores }, { status: 400 })\n  }\n  await pedir(url, { method: 'PATCH', body: JSON.stringify({ ejemplares, nota: texto(formData, 'nota') }) })\n  return { mensaje: 'Pedido guardado.' }\n}\n\nexport default function FichaPedido() {\n  const { pedido } = useLoaderData<typeof cargarPedido>()\n  const actionData = useActionData<typeof accionPedido>()\n  const errores: Errores = actionData && 'errores' in actionData ? actionData.errores : {}\n\n  return (\n    <article>\n      <h1>\n        {pedido.libreria} ({pedido.ciudad})\n      </h1>\n      <p>Libro: {pedido.libro}</p>\n      <p>Estado: {pedido.estado}</p>\n\n      <Form method=\"post\" key={pedido.id}>\n        <label>\n          Ejemplares\n          <input\n            name=\"ejemplares\"\n            type=\"number\"\n            defaultValue={pedido.ejemplares}\n            aria-invalid={errores.ejemplares ? true : undefined}\n            aria-describedby={errores.ejemplares ? 'error-ejemplares' : undefined}\n          />\n        </label>\n        {errores.ejemplares && (\n          <p id=\"error-ejemplares\" role=\"alert\">\n            {errores.ejemplares}\n          </p>\n        )}\n        <label>\n          Nota para el transportista\n          <input name=\"nota\" defaultValue={pedido.nota} />\n        </label>\n        {/* 1. Dale a cada botón name=\"intent\" y su value:\n               guardar, enviar, anular y borrar */}\n        <div className=\"botones\">\n          <button>Guardar</button>\n          <button>Marcar como enviado</button>\n          <button>Anular pedido</button>\n          <button className=\"peligro\">Borrar pedido</button>\n        </div>\n        {errores.estado && <p role=\"alert\">{errores.estado}</p>}\n      </Form>\n      {actionData && 'mensaje' in actionData && <p role=\"status\">{actionData.mensaje}</p>}\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Pedidos.tsx",
      "codigo": "import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Pedido } from './api'\n\nexport async function cargarPedidos({ request }: LoaderFunctionArgs) {\n  return { pedidos: await pedir<Pedido[]>('/api/pedidos', { signal: request.signal }) }\n}\n\nexport default function Pedidos() {\n  const { pedidos } = useLoaderData<typeof cargarPedidos>()\n\n  return (\n    <>\n      <h1>Pedidos</h1>\n      <ul className=\"lista\">\n        {pedidos.map((pedido) => (\n          <li key={pedido.id}>\n            <Link to={`/pedidos/${pedido.id}`}>\n              {pedido.libreria} ({pedido.ciudad})\n            </Link>\n            : {pedido.ejemplares} de «{pedido.libro}»\n            <span className={`chapa ${pedido.estado}`}>{pedido.estado}</span>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Pedido = {\n  id: number\n  libreria: string\n  ciudad: string\n  libro: string\n  ejemplares: number\n  estado: 'pendiente' | 'enviado' | 'anulado'\n  nota: string\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\n// Un campo de texto del formulario, o '' si no viene\nexport function texto(formData: FormData, nombre: string): string {\n  const valor = formData.get(nombre)\n  return typeof valor === 'string' ? valor.trim() : ''\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #fdfcf8;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #7c2d12;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  max-width: 42rem;\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.lista {\n  padding-left: 1.2rem;\n}\n\n.lista li {\n  margin-bottom: 0.3rem;\n}\n\n.chapa {\n  margin-left: 0.4rem;\n  padding: 0 0.45rem;\n  border-radius: 999px;\n  background: #e5e7eb;\n  font-size: 0.8rem;\n}\n\n.chapa.aceptado,\n.chapa.enviado {\n  background: #dcfce7;\n}\n\n.chapa.rechazado,\n.chapa.anulado {\n  background: #fee2e2;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(> input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n  margin: 0;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.3rem 0.4rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  cursor: pointer;\n}\n\nbutton.peligro {\n  color: #b91c1c;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #166534;\n}\n\n.eco {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #7c2d12;\n  background: #fff7ed;\n}\n\n.eco ul {\n  margin: 0.25rem 0;\n  padding-left: 1.2rem;\n}\n\n.eco p {\n  margin: 0.25rem 0;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n}\n\n.dos-columnas form {\n  flex: 1 1 14rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\n.orden li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.3rem;\n}\n\n.orden span {\n  flex: 1;\n}\n"
    }
  ],
  "archivoInicial": "Pedido.tsx",
  "urlInicial": "/pedidos/1",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "pedidos": [
      {
        "id": 1,
        "libreria": "Librería El Pupitre",
        "ciudad": "Ávila",
        "libro": "Las salinas de invierno",
        "ejemplares": 10,
        "estado": "pendiente",
        "nota": ""
      },
      {
        "id": 2,
        "libreria": "Librería La Buhardilla",
        "ciudad": "Zamora",
        "libro": "El faro de las hormigas",
        "ejemplares": 25,
        "estado": "pendiente",
        "nota": "Entregar por la mañana"
      },
      {
        "id": 3,
        "libreria": "Librería Tres Rayas",
        "ciudad": "León",
        "libro": "Cuaderno del Tormes",
        "ejemplares": 6,
        "estado": "anulado",
        "nota": ""
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Guardar 0 ejemplares avisa «Pide entre 1 y 500 ejemplares.»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Ejemplares",
            "texto": "0"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Pide entre 1 y 500 ejemplares."
      }
    },
    {
      "descripcion": "Guardar 12 ejemplares los deja guardados: siguen ahí al recargar",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Ejemplares",
            "texto": "12"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Pedido guardado."
          }
        },
        {
          "recargar": true
        }
      ],
      "espera": {
        "etiqueta": "Ejemplares",
        "valor": "12"
      }
    },
    {
      "descripcion": "«Marcar como enviado» deja el pedido en «enviado»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar como enviado"
          }
        }
      ],
      "espera": {
        "texto": "Estado: enviado"
      }
    },
    {
      "descripcion": "«Anular pedido» deja el pedido en «anulado»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Anular pedido"
          }
        }
      ],
      "espera": {
        "texto": "Estado: anulado"
      }
    },
    {
      "descripcion": "Un pedido anulado no se envía: avisa «Un pedido anulado no se puede enviar.»",
      "urlInicial": "/pedidos/3",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar como enviado"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Un pedido anulado no se puede enviar."
      }
    },
    {
      "descripcion": "El aviso del pedido anulado sale en el formulario, sin cambiar el estado",
      "urlInicial": "/pedidos/3",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar como enviado"
          }
        },
        {
          "pulsar": {
            "rol": "alert",
            "texto": "Un pedido anulado no se puede enviar."
          }
        }
      ],
      "espera": {
        "texto": "Estado: anulado"
      }
    },
    {
      "descripcion": "«Borrar pedido» lleva a la lista de pedidos",
      "urlInicial": "/pedidos/2",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Borrar pedido"
          }
        }
      ],
      "espera": {
        "url": "/pedidos"
      }
    },
    {
      "descripcion": "El pedido borrado ya no sale en la lista",
      "urlInicial": "/pedidos/2",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Borrar pedido"
          }
        },
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Pedidos"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "La Buhardilla"
        }
      }
    }
  ]
}
```

**2. La prioridad, sin botón.** El comité quiere marcar la prioridad de cada manuscrito con un desplegable que guarde en cuanto cambia, sin pulsar nada más.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un desplegable que guarda al cambiar",
  "consigna": "En Ficha.tsx: 1) en cambiarPrioridad, envía { intent: 'prioridad', prioridad } con useSubmit; 2) en la action, añade el caso 'prioridad', que la guarde con un PATCH. Cuando funcione, mira la barra: la dirección no cambia, y Atrás te lleva a la lista, no a la prioridad de antes. Si la dirección se llena de ?intent=…, repasa el method.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, isRouteErrorResponse, Link, Outlet, redirect, useNavigation, useRouteError } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Lista, { cargarLista } from './Lista'\nimport Ficha, { accionManuscrito, cargarManuscrito } from './Ficha'\nimport './estilos.css'\n\nfunction Maquetacion() {\n  const navigation = useNavigation()\n  const aviso = { idle: '', submitting: 'Enviando…', loading: 'Cargando…' }[navigation.state]\n\n  return (\n    <>\n      <header>\n        <p className=\"logo\">Ediciones La Rueca · Comité de lectura</p>\n        <nav aria-label=\"Principal\">\n          <Link to=\"/manuscritos\">Manuscritos</Link>\n        </nav>\n        <p className=\"aviso\">{aviso}</p>\n      </header>\n      <main aria-busy={navigation.state !== 'idle'}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nfunction ErrorGeneral() {\n  const error = useRouteError()\n  return (\n    <main>\n      <h1>Algo ha fallado</h1>\n      <p role=\"alert\">{isRouteErrorResponse(error) ? `${error.status}: ${error.data}` : 'Error inesperado.'}</p>\n      <Link to=\"/manuscritos\">Volver a los manuscritos</Link>\n    </main>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maquetacion,\n    ErrorBoundary: ErrorGeneral,\n    HydrateFallback: () => <p>Abriendo la editorial…</p>,\n    children: [\n      { index: true, loader: () => redirect('/manuscritos') },\n      { path: 'manuscritos', loader: cargarLista, Component: Lista },\n      { path: 'manuscritos/:id', loader: cargarManuscrito, action: accionManuscrito, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Ficha.tsx",
      "codigo": "import { data, Form, useLoaderData, useSubmit, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Manuscrito } from './api'\n\nexport async function cargarManuscrito({ params, request }: LoaderFunctionArgs) {\n  return { manuscrito: await pedir<Manuscrito>(`/api/manuscritos/${params.id}`, { signal: request.signal }) }\n}\n\nexport async function accionManuscrito({ params, request }: ActionFunctionArgs) {\n  const formData = await request.formData()\n  const intent = formData.get('intent')\n  const url = `/api/manuscritos/${params.id}`\n\n  switch (intent) {\n    case 'aceptar':\n    case 'rechazar': {\n      const estado = intent === 'aceptar' ? 'aceptado' : 'rechazado'\n      await pedir(url, { method: 'PATCH', body: JSON.stringify({ estado }) })\n      return null\n    }\n    // 2. Añade el caso 'prioridad': guarda formData.get('prioridad') con un PATCH\n    //    y devuelve null, como los otros\n    default:\n      throw data(`No sé qué hacer con «${intent}»`, { status: 400 })\n  }\n}\n\nexport default function Ficha() {\n  const { manuscrito } = useLoaderData<typeof cargarManuscrito>()\n\n  function cambiarPrioridad(prioridad: string) {\n    // 1. Envía { intent: 'prioridad', prioridad } a la action de esta ruta\n    //    con useSubmit. Ojo: ¿qué method usa si no le dices ninguno?\n  }\n\n  return (\n    <article>\n      <h1>{manuscrito.titulo}</h1>\n      <p>Estado: {manuscrito.estado}</p>\n      <p>Prioridad guardada: {manuscrito.prioridad}</p>\n      <label>\n        Prioridad\n        <select defaultValue={manuscrito.prioridad} onChange={(e) => cambiarPrioridad(e.currentTarget.value)}>\n          <option>baja</option>\n          <option>media</option>\n          <option>alta</option>\n        </select>\n      </label>\n      <Form method=\"post\">\n        <div className=\"botones\">\n          <button name=\"intent\" value=\"aceptar\">\n            Aceptar\n          </button>\n          <button name=\"intent\" value=\"rechazar\">\n            Rechazar\n          </button>\n        </div>\n      </Form>\n    </article>\n  )\n}\n"
    },
    {
      "nombre": "Lista.tsx",
      "codigo": "import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'\nimport { pedir, type Manuscrito } from './api'\n\nexport async function cargarLista({ request }: LoaderFunctionArgs) {\n  return { manuscritos: await pedir<Manuscrito[]>('/api/manuscritos', { signal: request.signal }) }\n}\n\nexport default function Lista() {\n  const { manuscritos } = useLoaderData<typeof cargarLista>()\n\n  return (\n    <>\n      <h1>Manuscritos</h1>\n      <ul className=\"lista\">\n        {manuscritos.map((manuscrito) => (\n          <li key={manuscrito.id}>\n            <Link to={`/manuscritos/${manuscrito.id}`}>{manuscrito.titulo}</Link>\n            <span className={`chapa ${manuscrito.estado}`}>{manuscrito.estado}</span>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "api.ts",
      "codigo": "export type Estado = 'pendiente' | 'aceptado' | 'rechazado'\n\nexport type Manuscrito = {\n  id: number\n  titulo: string\n  autor: string\n  genero: string\n  paginas: number\n  estado: Estado\n  notas: string\n  prioridad: string\n}\n\n// fetch con la comprobación de respuesta.ok\nexport async function pedir<T>(url: string, init?: RequestInit): Promise<T> {\n  const respuesta = await fetch(url, init)\n  if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`)\n  return (await respuesta.json()) as T\n}\n\n// Un campo de texto del formulario. get() devuelve string | File | null:\n// si el campo no viene, o es un archivo, cuenta como vacío.\nexport function texto(formData: FormData, nombre: string): string {\n  const valor = formData.get(nombre)\n  return typeof valor === 'string' ? valor.trim() : ''\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1f2937;\n  background: #fdfcf8;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 0.25rem 1rem;\n  padding: 0.5rem 1rem;\n  border-bottom: 2px solid #7c2d12;\n  background: #fff7ed;\n}\n\nheader p {\n  margin: 0;\n}\n\n.logo {\n  font-weight: 700;\n}\n\n.aviso {\n  min-height: 1.2em;\n  color: #9a3412;\n  font-size: 0.85rem;\n}\n\nmain {\n  max-width: 42rem;\n  padding: 0.75rem 1rem 1rem;\n  transition: opacity 0.2s;\n}\n\n/* Mientras el router trabaja, la página se atenúa */\nmain[aria-busy='true'] {\n  opacity: 0.5;\n}\n\nh1,\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.15rem;\n}\n\na {\n  color: #1d4ed8;\n}\n\n.lista {\n  padding-left: 1.2rem;\n}\n\n.lista li {\n  margin-bottom: 0.3rem;\n}\n\n.chapa {\n  margin-left: 0.4rem;\n  padding: 0 0.45rem;\n  border-radius: 999px;\n  background: #e5e7eb;\n  font-size: 0.8rem;\n}\n\n.chapa.aceptado,\n.chapa.enviado {\n  background: #dcfce7;\n}\n\n.chapa.rechazado,\n.chapa.anulado {\n  background: #fee2e2;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0.75rem 0;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(> input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\nfieldset {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem 1rem;\n  margin: 0;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\ninput,\nselect,\ntextarea,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect,\ntextarea {\n  padding: 0.3rem 0.4rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.35rem 0.8rem;\n  cursor: pointer;\n}\n\nbutton.peligro {\n  color: #b91c1c;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  color: #166534;\n}\n\n.eco {\n  padding: 0.5rem 0.75rem;\n  border-left: 4px solid #7c2d12;\n  background: #fff7ed;\n}\n\n.eco ul {\n  margin: 0.25rem 0;\n  padding-left: 1.2rem;\n}\n\n.eco p {\n  margin: 0.25rem 0;\n}\n\n.dos-columnas {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0 1.5rem;\n}\n\n.dos-columnas form {\n  flex: 1 1 14rem;\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 6px;\n}\n\n.orden li {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.3rem;\n}\n\n.orden span {\n  flex: 1;\n}\n"
    }
  ],
  "archivoInicial": "Ficha.tsx",
  "urlInicial": "/manuscritos/2",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "manuscritos": [
      {
        "id": 1,
        "titulo": "Las salinas de invierno",
        "autor": "Elvira Mardones",
        "genero": "novela",
        "paginas": 312,
        "estado": "pendiente",
        "notas": "",
        "prioridad": "media"
      },
      {
        "id": 2,
        "titulo": "Cuaderno del Tormes",
        "autor": "Ignacio Sendín",
        "genero": "poesía",
        "paginas": 96,
        "estado": "pendiente",
        "notas": "",
        "prioridad": "baja"
      },
      {
        "id": 3,
        "titulo": "El faro de las hormigas",
        "autor": "Paula Rebollo",
        "genero": "infantil",
        "paginas": 48,
        "estado": "aceptado",
        "notas": "Las ilustraciones son de la propia autora.",
        "prioridad": "alta"
      },
      {
        "id": 4,
        "titulo": "Noventa días sin cobertura",
        "autor": "Tomás Ayuso",
        "genero": "ensayo",
        "paginas": 210,
        "estado": "rechazado",
        "notas": "Muy parecido a un ensayo que ya publicamos.",
        "prioridad": "baja"
      },
      {
        "id": 5,
        "titulo": "La sastra de Béjar",
        "autor": "Marina Holgado",
        "genero": "novela",
        "paginas": 264,
        "estado": "pendiente",
        "notas": "",
        "prioridad": "media"
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Elegir «alta» la guarda: la ficha dice «Prioridad guardada: alta»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Prioridad",
            "opcion": "alta"
          }
        }
      ],
      "espera": {
        "texto": "Prioridad guardada: alta"
      }
    },
    {
      "descripcion": "Guardar la prioridad no cambia la dirección",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Prioridad",
            "opcion": "alta"
          }
        },
        {
          "pulsar": {
            "texto": "Prioridad guardada: alta"
          }
        }
      ],
      "espera": {
        "url": "/manuscritos/2"
      }
    },
    {
      "descripcion": "La prioridad elegida sigue ahí al recargar",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Prioridad",
            "opcion": "alta"
          }
        },
        {
          "pulsar": {
            "texto": "Prioridad guardada: alta"
          }
        },
        {
          "recargar": true
        }
      ],
      "espera": {
        "texto": "Prioridad guardada: alta"
      }
    },
    {
      "descripcion": "Después de guardar, Atrás vuelve a la lista: el envío no añade otra entrada",
      "urlInicial": "/manuscritos",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Cuaderno del Tormes"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Prioridad",
            "opcion": "alta"
          }
        },
        {
          "pulsar": {
            "texto": "Prioridad guardada: alta"
          }
        },
        {
          "atras": true
        }
      ],
      "espera": {
        "url": "/manuscritos"
      }
    },
    {
      "descripcion": "«Aceptar» sigue funcionando",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Aceptar"
          }
        }
      ],
      "espera": {
        "texto": "Estado: aceptado"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En la ficha del manuscrito, añade un botón «Duplicar» con `intent=duplicar` que cree una copia con «(copia)» al final del título y te lleve a ella. Prueba con `redirect` y con `replace`, y decide cuál deja mejor el botón Atrás.
2. Guarda las notas con Ctrl+S: un efecto que escuche `keydown` en `window`, frene el «guardar página» del navegador con `preventDefault` y llame a `submit` con un `FormData` del formulario y `intent=guardar`. Sin el intent, ya sabes qué pasa. Quita el oyente en la limpieza (lección 38).
3. En un proyecto de Vite con React Router 8, valida el registro de manuscritos con un esquema de Zod (lección 61) dentro de la `action`, y devuelve sus errores por campo con `data(…, { status: 400 })`. Si el formulario tiene casillas repetidas, cuidado con `Object.fromEntries`.
4. Haz una calculadora del coste de una tirada (páginas × ejemplares × precio por página) con una Action de React y `useActionState`, dentro de una ruta. Explica en un comentario por qué aquí no hace falta la `action` del router.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Actions",
      "descripcion": "La action de una ruta y las tres formas de llamarla: Form, useSubmit y un fetcher. Con useActionData para leer lo que devuelve.",
      "url": "https://reactrouter.com/start/data/actions",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Form vs. fetcher",
      "descripcion": "Cuándo un envío debe cambiar la dirección y cuándo no, con ejemplos de crear, borrar y actualizar.",
      "url": "https://reactrouter.com/explanation/form-vs-fetcher",
      "etiqueta": "React Router"
    },
    {
      "titulo": "Form Validation",
      "descripcion": "Los errores de validación devueltos con data y un 400, y por qué ese estado evita volver a cargar los datos.",
      "url": "https://reactrouter.com/how-to/form-validation",
      "etiqueta": "React Router"
    },
    {
      "titulo": "useSubmit",
      "descripcion": "La referencia de useSubmit: qué se le puede pasar y con qué opciones.",
      "url": "https://reactrouter.com/api/hooks/useSubmit",
      "etiqueta": "React Router"
    },
    {
      "titulo": "replace",
      "descripcion": "La redirección que sustituye la entrada del historial en vez de añadir otra.",
      "url": "https://reactrouter.com/api/utils/replace",
      "etiqueta": "React Router"
    },
    {
      "titulo": "FormData",
      "descripcion": "get, getAll, has y el resto de la interfaz, con lo que devuelve cada método.",
      "url": "https://developer.mozilla.org/es/docs/Web/API/FormData",
      "etiqueta": "MDN"
    }
  ]
}
```
