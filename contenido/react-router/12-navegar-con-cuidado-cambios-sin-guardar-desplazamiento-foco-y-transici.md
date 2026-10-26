# Navegar con cuidado: cambios sin guardar, desplazamiento, foco y transiciones

- **Módulo:** Más allá de cargar y enviar
- **Slug:** `navegar-con-cuidado-cambios-sin-guardar-desplazamiento-foco-y-transiciones` (autogenerado del título)
- **Orden:** 120
- **Fuentes:** [Navigation Blocking](https://reactrouter.com/how-to/navigation-blocking) + [useBlocker](https://reactrouter.com/api/hooks/useBlocker) + [ScrollRestoration](https://reactrouter.com/api/components/ScrollRestoration) + [Accessibility](https://reactrouter.com/how-to/accessibility) + [View Transitions](https://reactrouter.com/how-to/view-transitions) — ver `contenido/react-router/TEMARIO.md` #12
- **Requiere:** El módulo 2 de esta ficha (lecciones 2 a 7) y las lecciones 37 (foco y anuncios) y 55 (`<ViewTransition>`) de React

---

## Qué es y para qué sirve

En una web de páginas sueltas, cada enlace pide al servidor un documento nuevo, y el navegador hace por ti varias cosas sin que se lo pidas:

- Si recargas o cierras la pestaña con un formulario a medias, la página puede pedirle que te avise.
- La página nueva empieza arriba del todo, y Atrás te devuelve a la altura en la que estabas.
- El foco vuelve al principio del documento, y el lector de pantalla lee el título de la página nueva.
- Se nota que has cambiado de página, porque se carga otra entera. En una SPA cambia un trozo, de golpe, y el cambio puede pasar desapercibido.

Con React Router no se carga ningún documento: el router cambia la URL y React cambia un trozo de la página. Es más rápido, pero **esas cosas dejan de pasar solas**, y algunas ni siquiera tienen arreglo automático. Esta lección va de recuperarlas, una a una.

El escenario es la intranet de **A Lanterna**, una asociación que mantiene una guía de los faros de la Costa da Morte. Sus voluntarios editan las fichas de cada faro desde el navegador, y perder unas notas a medias, aparecer a media página o no saber dónde está el foco son justo los fallos que les hacen desconfiar de la herramienta.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro cosas que ya no hace el navegador",
  "roles": [
    {
      "etiqueta": "Cambios sin guardar",
      "rol": "useBlocker y useBeforeUnload",
      "descripcion": "El primero para las navegaciones dentro de la app; el segundo, para recargar, cerrar la pestaña o irse a otra web."
    },
    {
      "etiqueta": "Desplazamiento",
      "rol": "<ScrollRestoration>",
      "descripcion": "Arriba del todo en cada página nueva y la posición de antes al volver con Atrás. Con preventScrollReset, te quedas donde estabas."
    },
    {
      "etiqueta": "Foco y anuncio",
      "rol": "Tú",
      "descripcion": "La documentación lo deja en tus manos: llevar el foco al título de la página nueva y anunciar lo que tarda en cargar."
    },
    {
      "etiqueta": "Transiciones",
      "rol": "<ViewTransition> de React",
      "descripcion": "Alrededor del Outlet, anima el cambio de página. Desde la 8.5 sustituye a las APIs viewTransition del propio router."
    }
  ]
}
```

Dos de las cuatro piezas del router, `useBlocker` y `<ScrollRestoration>`, solo existen en los modos datos y framework, según su documentación: con el `BrowserRouter` de la lección 76 de React no las tienes. Todo lo de esta lección va en modo datos, con `createBrowserRouter` y `RouterProvider`, como el resto del módulo.

## Cambios sin guardar: `useBlocker`

`useBlocker` le pide al router que, **antes de cada navegación dentro de la app, compruebe si puede dejarla pasar**. Recibe un booleano o una función, y devuelve un objeto, el `blocker`, que puede estar en tres estados:

- `'unblocked'`: no ha parado nada.
- `'blocked'`: ha parado una navegación. `blocker.location` dice adónde ibas, y tienes dos salidas: `blocker.proceed()` la deja seguir y `blocker.reset()` la cancela, y te quedas donde estás.
- `'proceeding'`: has llamado a `proceed()` y la navegación está en marcha, por ejemplo mientras se cargan los datos de la página nueva.

El router para la navegación, pero **el aviso lo pintas tú**, cuando `blocker.state` vale `'blocked'`. En el editor de A Lanterna, `hayCambios` compara lo que hay en el campo con lo que trajo el `loader`, y el aviso tiene dos botones:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El editor de notas, con useBlocker",
  "consigna": "Pulsa «Editar la ficha», escribe algo en las notas y prueba a salir: con el enlace «Faros» de la cabecera o con el Atrás de la barra. Prueba las dos respuestas del aviso. Después escribe otra vez y pulsa «Recargar» en la barra: lo escrito se pierde sin que nadie pregunte.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, NavLink, Outlet, useLoaderData } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Editor, { cargarFaro, guardarFaro } from './Editor'\nimport type { Faro } from './tipos'\nimport './estilos.css'\n\nfunction Maqueta() {\n  return (\n    <>\n      <header>\n        <p className=\"marca\">A Lanterna</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/faros\" end>\n            Faros\n          </NavLink>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nasync function cargarFaros() {\n  const respuesta = await fetch('/api/faros')\n  return (await respuesta.json()) as Faro[]\n}\n\nfunction Lista() {\n  const faros = useLoaderData<typeof cargarFaros>()\n  return (\n    <>\n      <h1>Faros de la Costa da Morte</h1>\n      <ul>\n        {faros.map((faro) => (\n          <li key={faro.id}>\n            <Link to={`/faros/${faro.id}`}>{faro.nombre}</Link> · {faro.concello}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Ficha() {\n  const faro = useLoaderData<typeof cargarFaro>()\n  return (\n    <>\n      <h1>{faro.nombre}</h1>\n      <p>{faro.notas}</p>\n      <Link to=\"editar\">Editar la ficha</Link>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maqueta,\n    children: [\n      { index: true, Component: () => <Link to=\"/faros\">Ver los faros</Link> },\n      { path: 'faros', loader: cargarFaros, Component: Lista },\n      { path: 'faros/:id', loader: cargarFaro, Component: Ficha },\n      { path: 'faros/:id/editar', loader: cargarFaro, action: guardarFaro, Component: Editor },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Editor.tsx",
      "codigo": "import { useRef, useState } from 'react'\nimport {\n  Form,\n  redirect,\n  useBlocker,\n  useLoaderData,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport type { Faro } from './tipos'\n\nexport async function cargarFaro({ params }: LoaderFunctionArgs) {\n  const respuesta = await fetch(`/api/faros/${params.id}`)\n  return (await respuesta.json()) as Faro\n}\n\nexport async function guardarFaro({ request, params }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  await fetch(`/api/faros/${params.id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ notas: datos.get('notas') }),\n  })\n  return redirect(`/faros/${params.id}`)\n}\n\nexport default function Editor() {\n  const faro = useLoaderData<typeof cargarFaro>()\n  const [notas, setNotas] = useState(faro.notas)\n  const campo = useRef<HTMLTextAreaElement>(null)\n  const hayCambios = notas !== faro.notas\n\n  // Con true, el router no deja salir de esta página\n  const blocker = useBlocker(hayCambios)\n\n  return (\n    <>\n      <h1>Editar: {faro.nombre}</h1>\n      <Form method=\"post\">\n        <label>\n          Notas para los voluntarios\n          <textarea\n            ref={campo}\n            name=\"notas\"\n            value={notas}\n            onChange={(e) => setNotas(e.target.value)}\n          />\n        </label>\n        <button>Guardar</button>\n      </Form>\n      {blocker.state === 'blocked' && (\n        <div role=\"alertdialog\" aria-labelledby=\"aviso-titulo\" className=\"aviso\">\n          <h2 id=\"aviso-titulo\">Tienes cambios sin guardar</h2>\n          <p>Ibas a {blocker.location.pathname}. Si sales ahora, perderás lo escrito.</p>\n          <button\n            autoFocus\n            onClick={() => {\n              blocker.reset()\n              campo.current?.focus()\n            }}\n          >\n            Seguir editando\n          </button>\n          <button onClick={() => blocker.proceed()}>Salir sin guardar</button>\n        </div>\n      )}\n    </>\n  )\n}\n"
    },
    {
      "nombre": "tipos.ts",
      "codigo": "export type Faro = {\n  id: string\n  nombre: string\n  concello: string\n  notas: string\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1e293b;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #0f3d5e;\n  color: white;\n}\n\nheader a {\n  color: white;\n}\n\n.marca {\n  margin: 0;\n  font-weight: 700;\n}\n\nmain {\n  max-width: 34rem;\n  padding: 0.5rem 1rem 1rem;\n}\n\nh1 {\n  font-size: 1.35rem;\n  color: #0f3d5e;\n}\n\n/* Que siempre se vea dónde está el foco */\nh1:focus,\na:focus-visible,\nbutton:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nlabel {\n  display: grid;\n  gap: 0.3rem;\n}\n\ntextarea {\n  min-height: 5rem;\n  padding: 0.4rem;\n  font: inherit;\n}\n\nbutton {\n  margin-top: 0.5rem;\n  padding: 0.35rem 0.8rem;\n  border: 2px solid #0f3d5e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.aviso {\n  margin-top: 1rem;\n  padding: 0.6rem 1rem;\n  border-left: 6px solid #d97706;\n  border-radius: 8px;\n  background: #fef3c7;\n}\n\n.aviso h2 {\n  margin: 0.2rem 0;\n  font-size: 1.05rem;\n}\n\n.aviso button + button {\n  margin-left: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "Editor.tsx",
  "urlInicial": "/faros/fisterra",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "faros": [
      {
        "id": "fisterra",
        "nombre": "Faro de Fisterra",
        "concello": "Fisterra",
        "notas": "Aparcamiento lleno los domingos: proponer el autobús."
      },
      {
        "id": "tourinan",
        "nombre": "Faro de Touriñán",
        "concello": "Muxía",
        "notas": "Falta la foto de la puesta de sol."
      },
      {
        "id": "vilan",
        "nombre": "Faro Vilán",
        "concello": "Camariñas",
        "notas": "Revisar el horario de la sala antes de publicarlo."
      },
      {
        "id": "roncudo",
        "nombre": "Faro de Roncudo",
        "concello": "Ponteceso",
        "notas": "Añadir el aviso de oleaje."
      },
      {
        "id": "nariga",
        "nombre": "Faro de Punta Nariga",
        "concello": "Malpica de Bergantiños",
        "notas": "Pedir permiso para las fotos del interior."
      },
      {
        "id": "muxia",
        "nombre": "Faro de Muxía",
        "concello": "Muxía",
        "notas": "Añadir cómo llegar desde el puerto."
      }
    ]
  }
}
```

Como en todo el módulo, `createBrowserRouter` usa en la vista previa un historial en memoria (la barra lo dice). Lo comprobamos también en un proyecto de Vite con React Router 8.5.0, en Chromium y en WebKit, y con el botón Atrás del navegador pasa lo mismo: la URL no cambia y sale el aviso. Por dentro, el router deshace el paso atrás (vuelve a avanzar una entrada en el historial) mientras espera tu respuesta.

Tres detalles del aviso, que vienen de la lección 37 de React:

- **`role="alertdialog"`**: es un aviso que pide una respuesta. Aquí va dentro de la página, sin ventana modal; en los retos lo pasarás a un `<dialog>`.
- **`autoFocus` en «Seguir editando»**: al aparecer, el foco entra en el aviso, y en la opción que no destruye nada.
- **Al cerrar, el foco vuelve a las notas.** Sin `campo.current?.focus()`, el botón pulsado desaparece y el foco se queda en el `body`: lo vimos en Chromium.

Antes de seguir, una pregunta con el mismo editor:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "function Editor() {\n  const faro = useLoaderData<typeof cargarFaro>()\n  const [notas, setNotas] = useState(faro.notas)\n  const blocker = useBlocker(notas !== faro.notas)\n\n  return (\n    // Su action guarda y devuelve redirect('/faros/fisterra')\n    <Form method=\"post\">\n      <textarea name=\"notas\" value={notas} onChange={(e) => setNotas(e.target.value)} />\n      <button>Guardar</button>\n      {blocker.state === 'blocked' && <Aviso blocker={blocker} />}\n    </Form>\n  )\n}\n\n// Estás en /faros/fisterra/editar. Escribes en las notas y pulsas «Guardar».\n// ¿Qué pasa?",
  "opciones": [
    "Se guarda y el router te lleva a /faros/fisterra",
    "Sale el aviso: el router ha parado tu propio envío, que iba a /faros/fisterra/editar",
    "Se guarda, pero sale el aviso cuando la redirección intenta llevarte a /faros/fisterra",
    "Nada: useBlocker solo vigila los enlaces"
  ],
  "correcta": 1,
  "explicacion": "Enviar un Form es una navegación más, hacia la URL de su action, y pasa por la misma comprobación que un enlace. Con true, el router la para antes de ejecutar la action: no se guarda nada. Las redirecciones de un loader o de una action, en cambio, nunca pasan por el bloqueador. Pruébalo en el editor de arriba: escribe y pulsa «Guardar»."
}
```

### La función: parar solo cuando de verdad te vas

El booleano lo para todo. La otra forma de `useBlocker` es **una función que el router llama antes de cada navegación**, con la ubicación actual, la siguiente y el tipo de navegación (`'PUSH'`, `'REPLACE'` o `'POP'`, que es Atrás o Adelante). Si devuelve `true`, bloquea:

```tsx
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    hayCambios && currentLocation.pathname !== nextLocation.pathname,
)
```

Comparando solo el `pathname`, **pasan sin preguntar las navegaciones que no te sacan de la página**: tu propio envío, que va a la misma ruta, y los cambios que solo tocan la búsqueda, como una pestaña, un filtro o una vista previa en `?vista=previa`. La redirección después de guardar tampoco pregunta, porque nunca pasa por el bloqueador. Lo comprobamos en Chromium: en el momento de redirigir, `hayCambios` todavía vale `true` (el `loader` aún no ha vuelto a cargar la nota) y la ruta cambia, así que la función bloquearía; y aun así no sale el aviso. En el código del router, las redirecciones van por otro camino.

La documentación envuelve la función en `useCallback`. No es obligatorio: el router vuelve a registrar tu función en un efecto cada vez que cambia, así que una función nueva en cada render también funciona.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Para: enlaces, navigate() y Form",
      "texto": "Todo lo que pasa por el router, también tu propio envío. Por eso conviene la función que compara el pathname."
    },
    {
      "titulo": "Para: Atrás y Adelante",
      "texto": "Con el botón del navegador o con navigate(-1). La función recibe historyAction con el valor POP."
    },
    {
      "titulo": "No para: las redirecciones",
      "texto": "Lo que devuelve redirect() desde un loader o una action no pasa por el bloqueador."
    },
    {
      "titulo": "No para: los fetchers",
      "texto": "Un fetcher.Form o un fetcher.submit no navega (lección 5), así que no hay nada que bloquear."
    },
    {
      "titulo": "No para: salir del documento",
      "texto": "Recargar, cerrar la pestaña, escribir otra dirección o un enlace a otra web. Eso no lo ve el router: es cosa de beforeunload."
    },
    {
      "titulo": "Uno por router",
      "texto": "Si hay dos useBlocker montados a la vez, solo cuenta el último. Lo verás en Errores típicos."
    }
  ]
}
```

### En TSX, el `blocker` se estrecha por su estado

El tipo `Blocker` es una unión de tres objetos, uno por estado. `location`, `proceed` y `reset` solo existen de verdad en `'blocked'`; en `'unblocked'` valen `undefined`. Si los usas sin comprobar el estado, TypeScript 6.0.3 protesta:

```text
'blocker.location' is possibly 'undefined'.
Cannot invoke an object which is possibly 'undefined'.
```

Es decir: `blocker.location` puede ser `undefined`, y `blocker.proceed` también, así que no se puede llamar. Dentro de `{blocker.state === 'blocked' && …}`, TypeScript ya sabe que existen, y el error desaparece. Es una unión discriminada por `state`, como las de la lección 23 de TypeScript.

Existe también `unstable_usePrompt`, que hace lo mismo con un `window.confirm`. Su documentación avisa de que el prefijo `unstable_` no se va a quitar nunca: se comporta distinto, y a veces mal, según el navegador, si el usuario pulsa más veces Atrás o Adelante mientras está abierto el diálogo.

## Lo que `useBlocker` no ve: recargar o cerrar la pestaña

`useBlocker` solo vigila las navegaciones que hace el router. **Si recargas, cierras la pestaña, escribes otra dirección o sigues un enlace a otra web, el documento entero se descarga** y el router ni se entera. Para eso está el evento `beforeunload` del navegador, y React Router lo envuelve en `useBeforeUnload` (este sí, en los tres modos):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useCallback, useState } from 'react'\nimport { Form, useBeforeUnload, useBlocker, useLoaderData } from 'react-router'\nimport { cargarFaro } from './faros'\n\nexport default function Editor() {\n  const faro = useLoaderData<typeof cargarFaro>()\n  const [notas, setNotas] = useState(faro.notas)\n  const hayCambios = notas !== faro.notas\n\n  // Dentro de la app: enlaces, navigate(), Form, Atrás y Adelante\n  const blocker = useBlocker(\n    ({ currentLocation, nextLocation }) =>\n      hayCambios && currentLocation.pathname !== nextLocation.pathname,\n  )\n\n  // Fuera de la app: recargar, cerrar la pestaña, irse a otra web\n  useBeforeUnload(\n    useCallback(\n      (evento: BeforeUnloadEvent) => {\n        if (!hayCambios) return\n        evento.preventDefault()\n        evento.returnValue = true\n      },\n      [hayCambios],\n    ),\n  )\n\n  return (\n    <Form method=\"post\">\n      {/* el campo, «Guardar» y el aviso del blocker, como en el editor de arriba */}\n    </Form>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "useBeforeUnload(",
      "nota": "Añade un oyente de beforeunload a window al montar el componente y lo quita al desmontarlo. El navegador lo llama justo antes de descargar la página."
    },
    {
      "fragmento": "useCallback(",
      "nota": "El hook vuelve a poner el oyente cada vez que recibe una función distinta. Con useCallback, solo cambia cuando cambia hayCambios."
    },
    {
      "fragmento": "evento.preventDefault()",
      "nota": "Es lo que pide el diálogo. Comprobado en un proyecto de Vite, en Chromium y en WebKit: con cambios, F5 y escribir otra dirección sacan el diálogo del navegador; sin cambios, nada."
    },
    {
      "fragmento": "evento.returnValue = true",
      "nota": "La forma antigua de pedirlo. MDN recomienda dejarla junto a preventDefault para navegadores viejos, como Chrome y Edge anteriores a la 119."
    },
    {
      "fragmento": "if (!hayCambios) return",
      "nota": "Sin cambios no hay nada que perder: no llames a preventDefault. MDN va más allá y aconseja escuchar beforeunload solo mientras haya cambios; con useBeforeUnload, el oyente está puesto siempre y es tu función la que decide."
    }
  ]
}
```

Lo que no controlas del diálogo:

- **El texto es del navegador.** Sale su mensaje genérico, y no hay forma de poner el tuyo.
- **Hace falta que el usuario haya tocado la página.** MDN lo llama *activación persistente*: si nadie ha hecho clic ni ha escrito, no hay nada que proteger y el navegador no enseña el diálogo.
- **No es fiable en el móvil.** Si cambias de app y el sistema cierra el navegador, `beforeunload` no llega a dispararse. Para guardar un borrador, MDN recomienda el evento `visibilitychange`.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "beforeunload no se puede probar en la vista previa",
  "contenido": "El documento de la vista previa nunca se descarga. «Recargar» de la barra desmonta la app y la vuelve a montar en la misma URL, como un F5, pero el documento sigue ahí, y beforeunload no se dispara. Por eso este bloque es de código anotado: pruébalo en tu proyecto de Vite."
}
```

## El desplazamiento: `<ScrollRestoration>`

Sin ayuda, una SPA conserva el desplazamiento de la ventana al cambiar de página, porque la ventana es la misma. Lo medimos en un proyecto de Vite con React Router 8.5.0, en Chromium, con una lista de 30 faros:

- **Sin `<ScrollRestoration>`:** bajas 2000 píxeles en la lista, abres un faro y **la ficha aparece bajada esos mismos 2000 píxeles**. Si la lista carga sus datos en 300 ms y recargas con F5, vuelves arriba del todo: cuando el navegador intenta restaurar la posición, todavía no hay contenido.
- **Con `<ScrollRestoration>`:** la ficha se abre arriba; Atrás te deja otra vez a 2000 píxeles en la lista, y F5 conserva la posición aunque los datos tarden.

**`<ScrollRestoration>` imita lo que hace el navegador entre documentos**: arriba en cada página nueva, la posición guardada al volver. Se pone una sola vez, en la ruta raíz:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { Form, Link, Outlet, ScrollRestoration, useSearchParams } from 'react-router'\n\n// La ruta raíz: se pinta en todas las páginas\nexport function Maqueta() {\n  return (\n    <>\n      <header>{/* la marca y la navegación */}</header>\n      <main>\n        <Outlet />\n      </main>\n      <ScrollRestoration />\n    </>\n  )\n}\n\n// Otra opción: recordar la posición por ruta y no por cada visita\n// <ScrollRestoration getKey={(location) => location.pathname} />\n\n// /faros?orden=concello: la misma lista, en otro orden\nexport function Lista() {\n  const [busqueda] = useSearchParams()\n  const orden = busqueda.get('orden') ?? 'nombre'\n\n  return (\n    <>\n      <h1>Faros de la Costa da Morte</h1>\n      <p>\n        Ordenar:{' '}\n        <Link to=\"?orden=nombre\" preventScrollReset>\n          por nombre\n        </Link>{' '}\n        ·{' '}\n        <Link to=\"?orden=concello\" preventScrollReset>\n          por concello\n        </Link>\n      </p>\n      <Form method=\"get\" preventScrollReset>\n        <input type=\"hidden\" name=\"orden\" value={orden} />\n        <label>\n          Buscar <input type=\"search\" name=\"q\" />\n        </label>\n      </Form>\n      {/* la lista, ordenada y filtrada */}\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<ScrollRestoration />",
      "nota": "Una sola vez, en la ruta raíz. En modo datos no pinta nada: guarda la posición de la ventana antes de cada navegación, sube arriba en las nuevas (o al elemento del #ancla, si la URL lo trae) y restaura la guardada con Atrás y Adelante."
    },
    {
      "fragmento": "<ScrollRestoration getKey={(location) => location.pathname} />",
      "nota": "Por defecto, cada entrada del historial guarda su posición. Con el pathname como clave, la lista recuerda la suya aunque vuelvas por un enlace: comprobado, el enlace «Lista» de la cabecera volvía a 2000 píxeles. Y cambiar solo ?orden= tampoco subía arriba."
    },
    {
      "fragmento": "<Link to=\"?orden=nombre\" preventScrollReset>",
      "nota": "Una navegación nueva sube arriba, también si solo cambia la búsqueda. Comprobado: con preventScrollReset te quedas a 1500 píxeles; sin él, vuelves a 0. Úsalo en pestañas, filtros, orden y paginación."
    },
    {
      "fragmento": "<Form method=\"get\" preventScrollReset>",
      "nota": "Form y fetcher.Form la aceptan como prop, y navigate(), useSubmit y fetcher.submit como opción."
    }
  ]
}
```

Tres cosas más que conviene saber de cómo está hecho:

- **Guarda las posiciones en `sessionStorage`**, en la clave `react-router-scroll-positions`, para que sobrevivan a un F5. Mientras está montado, pone `history.scrollRestoration = "manual"` para que el navegador no restaure por su cuenta.
- **Solo mueve la ventana.** Si tu app se desplaza dentro de un contenedor con `overflow`, ese desplazamiento no lo guarda ni lo restaura.
- **En la vista previa no tiene sentido**, por eso no hay ejemplo en vivo: el marco de la vista previa crece con su contenido y nunca se desplaza por dentro. El desplazamiento que ves es el de esta página de la lección.

## El foco y el anuncio al cambiar de página

La guía de accesibilidad de React Router lo dice sin rodeos: el router no hace ninguna suposición sobre tu interfaz cuando cambia la ruta, así que **mover el foco y anunciar el cambio de página son cosa tuya**. Es la lección 37 de React aplicada al router.

¿Qué pasa si no haces nada? Lo comprobamos en Chromium: con el teclado, pulsas Intro sobre un enlace de la lista; la lista desaparece con el enlace dentro, y **el foco se queda en el `body`**. Quien usa lector de pantalla no oye nada, y quien navega con el teclado ha perdido su sitio.

En la maqueta de A Lanterna, un efecto lleva el foco al título de cada página nueva, y una región de estado avisa mientras carga:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El foco, al título de la página nueva",
  "consigna": "Usa solo el teclado: Tab hasta un faro e Intro. Mientras carga, la línea de debajo de la cabecera dice «Cargando la página…»; al llegar, el foco está en el título (recuadro naranja). Vuelve con «Volver a la lista». Después borra la línea del focus() y repite: ¿dónde queda el foco?",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { useEffect, useRef } from 'react'\nimport {\n  createBrowserRouter,\n  Link,\n  NavLink,\n  Outlet,\n  useLoaderData,\n  useLocation,\n  useNavigation,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport type { Faro } from './tipos'\nimport './estilos.css'\n\nfunction Maqueta() {\n  const location = useLocation()\n  const navigation = useNavigation()\n  const principal = useRef<HTMLElement>(null)\n  const rutaAnterior = useRef(location.pathname)\n\n  useEffect(() => {\n    // Solo al cambiar de página: ni en la carga inicial ni si cambia la búsqueda\n    if (location.pathname === rutaAnterior.current) return\n    rutaAnterior.current = location.pathname\n    // El foco, al título de la página nueva\n    principal.current?.querySelector('h1')?.focus({ preventScroll: true })\n  }, [location.pathname])\n\n  return (\n    <>\n      <header>\n        <p className=\"marca\">A Lanterna</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/faros\" end>\n            Faros\n          </NavLink>\n        </nav>\n      </header>\n      <p role=\"status\" className=\"estado\">\n        {navigation.state === 'loading' ? 'Cargando la página…' : ''}\n      </p>\n      <main ref={principal}>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nasync function cargarFaros() {\n  const respuesta = await fetch('/api/faros')\n  return (await respuesta.json()) as Faro[]\n}\n\nasync function cargarFaro({ params }: LoaderFunctionArgs) {\n  const respuesta = await fetch(`/api/faros/${params.id}`)\n  return (await respuesta.json()) as Faro\n}\n\nfunction Lista() {\n  const faros = useLoaderData<typeof cargarFaros>()\n  return (\n    <>\n      <h1 tabIndex={-1}>Faros de la Costa da Morte</h1>\n      <ul>\n        {faros.map((faro) => (\n          <li key={faro.id}>\n            <Link to={`/faros/${faro.id}`}>{faro.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Ficha() {\n  const faro = useLoaderData<typeof cargarFaro>()\n  return (\n    <>\n      <h1 tabIndex={-1}>{faro.nombre}</h1>\n      <p>Concello de {faro.concello}.</p>\n      <Link to=\"/faros\">Volver a la lista</Link>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maqueta,\n    children: [\n      { path: 'faros', loader: cargarFaros, Component: Lista },\n      { path: 'faros/:id', loader: cargarFaro, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "tipos.ts",
      "codigo": "export type Faro = {\n  id: string\n  nombre: string\n  concello: string\n  notas: string\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1e293b;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #0f3d5e;\n  color: white;\n}\n\nheader a {\n  color: white;\n}\n\n.marca {\n  margin: 0;\n  font-weight: 700;\n}\n\n.estado {\n  min-height: 1.4em;\n  margin: 0.3rem 1rem 0;\n  color: #92400e;\n  font-size: 0.9rem;\n}\n\nmain {\n  max-width: 34rem;\n  padding: 0 1rem 1rem;\n}\n\nh1 {\n  font-size: 1.35rem;\n  color: #0f3d5e;\n}\n\n/* Que siempre se vea dónde está el foco */\nh1:focus,\na:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n"
    }
  ],
  "urlInicial": "/faros",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "faros": [
      {
        "id": "fisterra",
        "nombre": "Faro de Fisterra",
        "concello": "Fisterra",
        "notas": "Aparcamiento lleno los domingos: proponer el autobús."
      },
      {
        "id": "tourinan",
        "nombre": "Faro de Touriñán",
        "concello": "Muxía",
        "notas": "Falta la foto de la puesta de sol."
      },
      {
        "id": "vilan",
        "nombre": "Faro Vilán",
        "concello": "Camariñas",
        "notas": "Revisar el horario de la sala antes de publicarlo."
      },
      {
        "id": "roncudo",
        "nombre": "Faro de Roncudo",
        "concello": "Ponteceso",
        "notas": "Añadir el aviso de oleaje."
      },
      {
        "id": "nariga",
        "nombre": "Faro de Punta Nariga",
        "concello": "Malpica de Bergantiños",
        "notas": "Pedir permiso para las fotos del interior."
      },
      {
        "id": "muxia",
        "nombre": "Faro de Muxía",
        "concello": "Muxía",
        "notas": "Añadir cómo llegar desde el puerto."
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Cada decisión del efecto tiene su motivo:

- **Solo cuando cambia el `pathname`.** En la carga inicial no: el navegador ya pone el foco al principio, y quitárselo a quien empieza a leer molesta. Tampoco cuando cambia solo la búsqueda: si filtras una lista, el foco tiene que seguir en el filtro.
- **Comparando con la ruta anterior, y no con una bandera de «primera vez».** Con `StrictMode`, React ejecuta el efecto dos veces al montar, y la bandera falla; lo verás en Errores típicos.
- **Al `<h1>`, con `tabIndex={-1}`.** Un título no se enfoca con Tab, pero así puede recibir el foco desde el código. El lector de pantalla lo lee, y el siguiente Tab sigue desde ahí. Hay quien prefiere enfocar el `<main>` o un enlace del principio; la guía de React Router enlaza un estudio de 2019 con usuarios reales sobre estas opciones (en Para profundizar).
- **Con `preventScroll: true`.** `focus()` desplaza la página hasta el elemento si no está a la vista. Con `<ScrollRestoration>`, al volver con Atrás a la lista, la posición restaurada y el foco en el título, arriba, se pelean; lo medimos en el apartado de errores.
- **La región de estado anuncia la espera.** Al llegar, el título enfocado ya dice dónde estás, así que solo hace falta anunciar lo que tarda. Es el `useNavigation` de la lección 6, dentro de un `role="status"` que está siempre en la página (lección 37 de React).

Falta una pieza que en la vista previa no se ve: **el título de la pestaña**. En React 19, cada página puede pintar su propio `<title>` y React lo sube al `<head>` (lección 81 de React):

```tsx
<title>{`${faro.nombre} · A Lanterna`}</title>
```

Con un solo texto dentro, en una plantilla: React espera que los hijos de `<title>` sean una sola cadena.

## Transiciones entre páginas: `<ViewTransition>` alrededor del `<Outlet>`

En la lección 55 de React viste que `<ViewTransition>` anima lo que cambia **dentro de una transición** de React. Aquí no hace falta que escribas ningún `startTransition`: **`RouterProvider` envuelve en `startTransition` cada cambio de estado del router**, y así lo dice la documentación de su prop `useTransitions`. Basta con envolver el `<Outlet>` de la maqueta:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las fichas se funden al cambiar de página",
  "consigna": "Abre un faro y pulsa «Siguiente» varias veces: el contenido se funde y la cabecera no se mueve. Prueba también Atrás y Adelante de la barra. Después añade useTransitions={false} al RouterProvider y repite: ya no se anima nada.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { ViewTransition } from 'react'\nimport {\n  createBrowserRouter,\n  Link,\n  NavLink,\n  Outlet,\n  useLoaderData,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport type { Faro } from './tipos'\nimport './estilos.css'\n\nfunction Maqueta() {\n  return (\n    <>\n      {/* Fuera del ViewTransition: la cabecera no se anima */}\n      <header>\n        <p className=\"marca\">A Lanterna</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/faros\" end>\n            Faros\n          </NavLink>\n        </nav>\n      </header>\n      <ViewTransition>\n        <main>\n          <Outlet />\n        </main>\n      </ViewTransition>\n    </>\n  )\n}\n\nasync function cargarFaros() {\n  const respuesta = await fetch('/api/faros')\n  return (await respuesta.json()) as Faro[]\n}\n\nasync function cargarFaro({ params }: LoaderFunctionArgs) {\n  const respuesta = await fetch('/api/faros')\n  const faros = (await respuesta.json()) as Faro[]\n  const posicion = faros.findIndex((faro) => faro.id === params.id)\n  return { faro: faros[posicion], siguiente: faros[(posicion + 1) % faros.length] }\n}\n\nfunction Lista() {\n  const faros = useLoaderData<typeof cargarFaros>()\n  return (\n    <>\n      <h1>Faros de la Costa da Morte</h1>\n      <ul>\n        {faros.map((faro) => (\n          <li key={faro.id}>\n            <Link to={`/faros/${faro.id}`}>{faro.nombre}</Link>\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Ficha() {\n  const { faro, siguiente } = useLoaderData<typeof cargarFaro>()\n  return (\n    <>\n      <h1>{faro.nombre}</h1>\n      <p>Concello de {faro.concello}.</p>\n      <p>{faro.notas}</p>\n      <Link className=\"siguiente\" to={`/faros/${siguiente.id}`}>\n        Siguiente: {siguiente.nombre}\n      </Link>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maqueta,\n    children: [\n      { path: 'faros', loader: cargarFaros, Component: Lista },\n      { path: 'faros/:id', loader: cargarFaro, Component: Ficha },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "tipos.ts",
      "codigo": "export type Faro = {\n  id: string\n  nombre: string\n  concello: string\n  notas: string\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1e293b;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #0f3d5e;\n  color: white;\n}\n\nheader a {\n  color: white;\n}\n\n.marca {\n  margin: 0;\n  font-weight: 700;\n}\n\nmain {\n  max-width: 34rem;\n  padding: 0.5rem 1rem 1rem;\n}\n\nh1 {\n  font-size: 1.35rem;\n  color: #0f3d5e;\n}\n\n.siguiente {\n  display: inline-block;\n  margin-top: 0.5rem;\n}\n\n/* La animación por defecto dura 0,25 s: aquí, algo más lenta para que se aprecie */\n::view-transition-group(*),\n::view-transition-old(*),\n::view-transition-new(*) {\n  animation-duration: 0.6s;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) {\n    animation: none !important;\n  }\n}\n"
    }
  ],
  "urlInicial": "/faros",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "faros": [
      {
        "id": "fisterra",
        "nombre": "Faro de Fisterra",
        "concello": "Fisterra",
        "notas": "Aparcamiento lleno los domingos: proponer el autobús."
      },
      {
        "id": "tourinan",
        "nombre": "Faro de Touriñán",
        "concello": "Muxía",
        "notas": "Falta la foto de la puesta de sol."
      },
      {
        "id": "vilan",
        "nombre": "Faro Vilán",
        "concello": "Camariñas",
        "notas": "Revisar el horario de la sala antes de publicarlo."
      },
      {
        "id": "roncudo",
        "nombre": "Faro de Roncudo",
        "concello": "Ponteceso",
        "notas": "Añadir el aviso de oleaje."
      },
      {
        "id": "nariga",
        "nombre": "Faro de Punta Nariga",
        "concello": "Malpica de Bergantiños",
        "notas": "Pedir permiso para las fotos del interior."
      },
      {
        "id": "muxia",
        "nombre": "Faro de Muxía",
        "concello": "Muxía",
        "notas": "Añadir cómo llegar desde el puerto."
      }
    ]
  }
}
```

Si tu navegador no anima nada, mira «Qué navegadores lo soportan» en la lección 55 de React. Lo que dice la guía del router, y lo que comprobamos:

- **Un solo `<ViewTransition>`, siempre montado, en una ruta madre.** No hace falta darle una `key` por ubicación ni volver a montar el árbol de rutas: el `<Outlet>` cambia dentro y React anima el cambio como un `update`.
- **La navegación, fuera.** Lo que queda fuera del `<ViewTransition>` (aquí, la cabecera) no se anima.
- **Mientras carga el `loader`, sigue la página anterior.** La animación empieza cuando llegan los datos de la nueva, igual que la interfaz pendiente de la lección 6.
- **`useTransitions={false}` la apaga**: el router deja de usar `startTransition`. Lo comprobamos en la vista previa, en Chromium y en WebKit: React no llega a llamar a `document.startViewTransition`. Según la guía, la opción `flushSync: true` de una navegación también puede impedir la animación, porque hace la actualización síncrona.
- **Respeta a quien pide menos movimiento**: la media query `prefers-reduced-motion` de `estilos.css` es la misma de la lección 55.

## Atrás y Adelante: por qué no siempre se animan

La guía de React Router avisa de que, con `<ViewTransition>`, las navegaciones con Atrás y Adelante del navegador **pueden** no animarse. El porqué está en react.dev: cuando una transición empieza durante el evento `popstate`, que es el que lanza el navegador al moverte por el historial, **React tiene que terminarla en ese mismo momento** para que el navegador pueda restaurar el desplazamiento y los formularios. Y una animación necesita tiempo, así que React se la salta.

¿Cuándo empieza la transición dentro de `popstate`? Depende del router. Antes de leer la respuesta, piensa en esta app:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "// La maqueta envuelve el <Outlet> en un <ViewTransition>\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maqueta,\n    children: [\n      { path: 'faros', Component: Lista },                         // sin loader\n      { path: 'faros/:id', loader: cargarFaro, Component: Ficha }, // con loader\n    ],\n  },\n])\n\n// En Chrome, en tu proyecto (no en la vista previa):\n// 1. En /faros pulsas el enlace «Faro Vilán».\n// 2. Pulsas el botón Atrás del navegador.\n// 3. Pulsas Adelante.\n// ¿Qué cambios de página se animan?",
  "opciones": [
    "Los tres: el router envuelve todas las navegaciones en startTransition",
    "Solo el 1: Atrás y Adelante no se animan nunca",
    "El 1 y el 3: al volver a una ruta sin loader, React aplica el cambio al momento",
    "Ninguno: falta poner viewTransition en el Link"
  ],
  "correcta": 2,
  "explicacion": "Atrás llega con popstate. /faros no tiene loader, así que el router no espera a nada: termina la navegación dentro del evento, y React aplica el cambio sin animar. Adelante vuelve a la ficha, cuyo loader hay que ejecutar: el router termina cuando llegan los datos, ya fuera del evento, y React lo anima como cualquier transición."
}
```

Lo medimos con React Router 8.5.0 y `createBrowserRouter` en un proyecto de Vite, en Chromium y en WebKit, apuntando cada llamada a `document.startViewTransition`. Los dos navegadores dieron lo mismo:

- **Pulsar un enlace**: se anima siempre.
- **Atrás o Adelante a una página que no tiene ningún `loader` que ejecutar**: no se anima. En el código del router, si no hay nada que cargar, la navegación termina en el acto, dentro de `popstate`.
- **Atrás o Adelante a una página con `loader`**: se anima, **aunque el `loader` devuelva sus datos al instante**. Basta con que haya que ejecutarlo para que el router termine fuera del evento.
- **Un botón «Volver» con `navigate(-1)`, o `history.back()`**: igual que el botón Atrás. Los dos acaban en `popstate`.
- **La barra de la vista previa**: se anima siempre, tenga `loader` o no. Sus botones no lanzan `popstate`: le piden al router en memoria que navegue. **En la vista previa no puedes ver este problema**, compruébalo en tu proyecto.

Que dependa de si hay `loader` es un detalle de cómo está hecho el router hoy, no una promesa de su documentación, que solo dice «pueden no animarse». Si una vuelta concreta tiene que animarse, haz que sea un enlace a la página de destino y no un `navigate(-1)`, como el «Volver a la galería» del proyecto 97 de React. La solución de fondo, según react.dev, es que los routers usen la Navigation API del navegador en vez de `popstate`; React Router 8.5 sigue escuchando `popstate`.

## Por qué la 8.5 desaconseja las APIs `viewTransition` del router

Antes de que React tuviera `<ViewTransition>`, React Router traía sus propias transiciones de vista, estables desde la 6.27: la prop `viewTransition` en `<Link>`, `<NavLink>` y `<Form>`, la opción `viewTransition: true` en `navigate()` y `useSubmit`, el hook `useViewTransitionState`, y en `<NavLink>` la prop de render `isTransitioning` y la clase `transitioning`. **Desde la 8.5 están desaconsejadas** (llevan `@deprecated`, así que tu editor las tacha) en favor de `<ViewTransition>`. Siguen funcionando, también con versiones de React anteriores a la 19.3, que no tienen el componente.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { ViewTransition } from 'react'\nimport { Link, NavLink, Outlet, useNavigate, useViewTransitionState } from 'react-router'\n\n// ANTES: el router llama él mismo a document.startViewTransition()\nfunction TarjetaAntes({ id, nombre }: { id: string; nombre: string }) {\n  const animando = useViewTransitionState(`/faros/${id}`)\n  return (\n    <Link to={`/faros/${id}`} viewTransition>\n      <h2 style={{ viewTransitionName: animando ? 'titulo-faro' : 'none' }}>{nombre}</h2>\n    </Link>\n  )\n}\n\nfunction MenuAntes() {\n  const navigate = useNavigate()\n  return (\n    <nav>\n      <NavLink to=\"/faros\" viewTransition>\n        Faros\n      </NavLink>\n      <button onClick={() => navigate('/faros', { viewTransition: true })}>Volver</button>\n    </nav>\n  )\n}\n\n// AHORA (React Router 8.5 y React 19.3): React decide qué se anima\nfunction MaquetaAhora() {\n  return (\n    <ViewTransition>\n      <main>\n        <Outlet />\n      </main>\n    </ViewTransition>\n  )\n}\n\nfunction TarjetaAhora({ id, nombre }: { id: string; nombre: string }) {\n  // La ficha envuelve su <h1> en otro ViewTransition con el mismo name\n  return (\n    <Link to={`/faros/${id}`}>\n      <ViewTransition name={`titulo-${id}`}>\n        <h2>{nombre}</h2>\n      </ViewTransition>\n    </Link>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "<Link to={`/faros/${id}`} viewTransition>",
      "nota": "Con viewTransition, el router llamaba a document.startViewTransition() y actualizaba su estado dentro. Animaba la página entera con un fundido, sin saber nada de tus componentes."
    },
    {
      "fragmento": "const animando = useViewTransitionState(`/faros/${id}`)",
      "nota": "Para un elemento compartido había que poner tú el view-transition-name, y solo mientras durase la transición hacia esa ficha: si dos elementos llevan el mismo nombre a la vez, la transición falla."
    },
    {
      "fragmento": "navigate('/faros', { viewTransition: true })",
      "nota": "La misma opción en las navegaciones desde código. La guía de migración pide quitarla de todas partes, con la prop de Link, NavLink y Form."
    },
    {
      "fragmento": "<ViewTransition>\n      <main>",
      "nota": "El fundido de la página, ahora con el componente de React. Funciona con cualquier transición que cambie lo de dentro, no solo con las navegaciones."
    },
    {
      "fragmento": "<ViewTransition name={`titulo-${id}`}>",
      "nota": "El elemento compartido de la lección 55 de React: el mismo name a los dos lados, uno que se desmonta y otro que se monta en la misma transición. Ya no hace falta ni el hook ni la clase transitioning."
    }
  ]
}
```

Los motivos del cambio, y el precio:

- **Dos dueños para una sola API.** En React 19.3 es React quien llama a `document.startViewTransition()` en cada transición. Si además el router llama por su cuenta, el navegador solo puede tener una en marcha. Lo comprobamos poniendo las dos a la vez: cada navegación empieza dos transiciones de vista, el navegador cancela la del router, y Chromium enseña un error sin capturar en cada clic: «Transition was skipped. New ViewTransition started». Por eso la guía dice que tener las dos puede interrumpir las animaciones.
- **El router solo sabe que ha habido una navegación.** React conoce el árbol: qué entra, qué sale, qué cambia y qué viaja de un sitio a otro (`enter`, `exit`, `update` y `share`), qué revela un `<Suspense>` y los tipos de `addTransitionType`.
- **El precio: Atrás y Adelante.** Las APIs antiguas sí los animaban. El router recuerda entre qué rutas hubo una transición y, al volver por el historial entre esas mismas rutas, la repite con su propio `startViewTransition`. Comprobado en Chromium: con `<Link viewTransition>`, las catorce navegaciones de la prueba se animaron, Atrás y Adelante incluidos. Es lo que la guía llama que `<ViewTransition>` no sustituye a todas las animaciones antiguas.

## Todo junto: la maqueta raíz de tu proyecto

En un proyecto de verdad, las piezas de esta lección acaban casi todas en la ruta raíz. Así quedaría la de A Lanterna:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "import { useEffect, useRef, ViewTransition } from 'react'\nimport { NavLink, Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router'\n\nexport default function Maqueta() {\n  const location = useLocation()\n  const navigation = useNavigation()\n  const principal = useRef<HTMLElement>(null)\n  const rutaAnterior = useRef(location.pathname)\n\n  useEffect(() => {\n    if (location.pathname === rutaAnterior.current) return\n    rutaAnterior.current = location.pathname\n    principal.current?.querySelector('h1')?.focus({ preventScroll: true })\n  }, [location.pathname])\n\n  return (\n    <>\n      <header>\n        <p className=\"marca\">A Lanterna</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/faros\" end>\n            Faros\n          </NavLink>\n          <NavLink to=\"/avisos\">Avisos</NavLink>\n        </nav>\n      </header>\n      <p role=\"status\" className=\"solo-lectores\">\n        {navigation.state === 'loading' ? 'Cargando la página…' : ''}\n      </p>\n      <ViewTransition>\n        <main ref={principal}>\n          <Outlet />\n        </main>\n      </ViewTransition>\n      <ScrollRestoration />\n    </>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "if (location.pathname === rutaAnterior.current) return",
      "nota": "El foco solo se mueve cuando cambia de página: ni en la carga inicial ni con la repetición de StrictMode ni al cambiar la búsqueda."
    },
    {
      "fragmento": "principal.current?.querySelector('h1')?.focus({ preventScroll: true })",
      "nota": "Cada página pinta su h1 con tabIndex={-1}. preventScroll deja el desplazamiento a ScrollRestoration."
    },
    {
      "fragmento": "<p role=\"status\" className=\"solo-lectores\">",
      "nota": "Siempre en la página, aunque esté vacía, para que el lector de pantalla la conozca antes de que cambie. La clase solo-lectores la esconde a la vista sin quitarla del árbol de accesibilidad: posición absoluta, 1 píxel de tamaño y recortada con clip. Con display: none, el lector tampoco la oiría."
    },
    {
      "fragmento": "<ViewTransition>\n        <main ref={principal}>",
      "nota": "El fundido entre páginas. La cabecera y la región de estado quedan fuera y no se animan."
    },
    {
      "fragmento": "<ScrollRestoration />",
      "nota": "Una sola vez, aquí. Y en cada formulario largo, useBlocker y useBeforeUnload en su propia página, no en la maqueta: cada uno sabe si tiene cambios sin guardar."
    }
  ]
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Formularios que cuesta rellenar",
      "texto": "Una ficha, un pedido, una solicitud o un texto largo: useBlocker para las navegaciones de la app y useBeforeUnload para el resto. En un buscador o en un filtro no: preguntar por perder dos letras molesta más que ayuda."
    },
    {
      "titulo": "ScrollRestoration, en cualquier SPA con listas",
      "texto": "Una vez en la raíz, y preventScrollReset en las pestañas, los filtros, el orden y la paginación que no cambian de página."
    },
    {
      "titulo": "Foco y anuncio, en toda app con rutas",
      "texto": "Es lo que más se olvida y lo que más nota quien usa el teclado o un lector de pantalla. Y como el router no lo hace, nadie lo hará por ti."
    },
    {
      "titulo": "ViewTransition, cuando ayuda a entender dónde estás",
      "texto": "De la lista a la ficha, de un paso al siguiente. No como adorno en cada clic, y nunca sin la media query de prefers-reduced-motion."
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
      "mito": "useBlocker también avisa al recargar o cerrar la pestaña",
      "realidad": "Solo ve las navegaciones del router. Recargar, cerrar o irse a otra web descargan el documento: para eso está beforeunload, con useBeforeUnload."
    },
    {
      "mito": "Con useBlocker(true), el formulario se sigue enviando",
      "realidad": "Un Form es una navegación y también se bloquea, antes de llegar a la action. Usa la función y compara el pathname."
    },
    {
      "mito": "Con ScrollRestoration, cambiar un filtro te deja donde estabas",
      "realidad": "Cualquier navegación nueva sube arriba, también si solo cambia la búsqueda. Para quedarte, preventScrollReset, o getKey por pathname."
    },
    {
      "mito": "React Router mueve el foco al título de la página nueva",
      "realidad": "No hace nada con el foco: su documentación lo deja en tus manos. Si no lo mueves, puede acabar en el body."
    },
    {
      "mito": "Con ViewTransition, Atrás y Adelante se animan igual que los enlaces",
      "realidad": "Solo si el router tiene que esperar a algún loader. Si no, React aplica el cambio de golpe. Y la barra de la vista previa no sirve para comprobarlo."
    },
    {
      "mito": "Para animar las navegaciones hay que poner viewTransition en cada Link",
      "realidad": "Desaconsejado desde la 8.5: con ViewTransition alrededor del Outlet basta. Y con las dos a la vez, cada navegación empieza dos transiciones y el navegador cancela una."
    }
  ]
}
```

## Errores típicos

**Una bandera de «primera vez» para no mover el foco al cargar.** Parece la forma obvia de saltarse la carga inicial:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "tsx",
  "codigo": "function Maqueta() {\n  const location = useLocation()\n  const principal = useRef<HTMLElement>(null)\n  const primeraVez = useRef(true)\n\n  useEffect(() => {\n    if (primeraVez.current) {\n      primeraVez.current = false // en la carga inicial, no mover el foco\n      return\n    }\n    principal.current?.querySelector('h1')?.focus()\n  }, [location.pathname])\n\n  return <main ref={principal}><Outlet /></main>\n}\n\n// En desarrollo, con <StrictMode>, abres /faros.\n// ¿Dónde está el foco nada más cargar?",
  "opciones": [
    "En el body, como en cualquier carga: el efecto se salta la primera vez",
    "En el h1 de /faros: StrictMode repite el efecto, y la repetición ya no es la primera vez",
    "En el primer enlace de la lista",
    "Da un error: no se puede escribir en una ref dentro de un efecto"
  ],
  "correcta": 1,
  "explicacion": "En desarrollo, StrictMode monta los efectos, los limpia y los vuelve a ejecutar. La ref conserva su valor entre las dos ejecuciones: la primera la pone a false y la segunda mueve el foco. Lo comprobamos en Chromium. En producción funcionaría, pero el arreglo es comparar con la ruta anterior: la repetición ve la misma ruta y no hace nada."
}
```

**`useBlocker(hayCambios)` con un `<Form>` en la misma página.** Bloquea tu propio «Guardar», como viste al principio. Usa la función y compara el `pathname`.

**Dos `useBlocker` montados a la vez.** El router solo admite uno, y gana el último que se registra. Lo comprobamos con un `useBlocker(false)` dentro del editor: el editor dejó de preguntar, y la consola avisó:

```text
A router only supports one blocker at a time
```

Es decir: un router solo admite un bloqueador a la vez. Si dos partes de la página tienen cambios, decide en un solo sitio.

**Bloquear sin pintar el aviso.** Si `blocker.state` vale `'blocked'` y no enseñas nada, el enlace parece roto: el clic no hace nada y nadie dice por qué.

**Confiar en `useBlocker` para recargar o cerrar.** No lo ve. Junta los dos hooks.

**`focus()` sin `preventScroll` junto a `<ScrollRestoration>`.** Lo medimos en Chromium: bajas a 2000 píxeles en la lista, abres un faro y vuelves con Atrás. `<ScrollRestoration>` deja la lista a 2000 píxeles, y justo después el efecto enfoca el título, que está arriba, y el navegador sube hasta él: **la lista acaba a 0**. Con `focus({ preventScroll: true })`, se queda a 2000.

**`<ScrollRestoration>` en una ruta hija, o dos veces.** Va una sola vez, en la ruta raíz. En una hija, solo funciona mientras esa ruta está en pantalla.

**Mezclar `viewTransition` del router con `<ViewTransition>`.** Dos transiciones por navegación, una cancelada y un error en la consola por cada clic. Quita la prop al migrar.

**Esperar que «Volver» con `navigate(-1)` se anime.** Va por `popstate`, como el botón Atrás: si la página de destino no tiene `loader`, no hay animación. Si importa, que sea un enlace.

## Ejercicios

El editor de notas de A Lanterna ya guarda, pero deja salir con los cambios a medias, y además tiene una vista previa en `?vista=previa`. Haz que pregunte solo cuando de verdad te vas.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Que el editor pregunte antes de perder cambios",
  "consigna": "En Editor.tsx: si has escrito algo y vas a otra página, con un enlace o con el Atrás de la barra, el router tiene que pararte y enseñar un aviso con «Seguir editando», que devuelve el foco a las notas, y «Salir sin guardar». «Guardar» y abrir o cerrar la vista previa no cuentan como salir. Las comprobaciones miran la dirección y el aviso; el foco, míralo tú.",
  "archivos": [
    {
      "nombre": "App.tsx",
      "codigo": "import { createBrowserRouter, Link, NavLink, Outlet, useLoaderData } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nimport Editor, { cargarFaro, guardarFaro } from './Editor'\nimport type { Faro } from './tipos'\nimport './estilos.css'\n\nfunction Maqueta() {\n  return (\n    <>\n      <header>\n        <p className=\"marca\">A Lanterna</p>\n        <nav aria-label=\"Principal\">\n          <NavLink to=\"/faros\" end>\n            Faros\n          </NavLink>\n        </nav>\n      </header>\n      <main>\n        <Outlet />\n      </main>\n    </>\n  )\n}\n\nasync function cargarFaros() {\n  const respuesta = await fetch('/api/faros')\n  return (await respuesta.json()) as Faro[]\n}\n\nfunction Lista() {\n  const faros = useLoaderData<typeof cargarFaros>()\n  return (\n    <>\n      <h1>Faros de la Costa da Morte</h1>\n      <ul>\n        {faros.map((faro) => (\n          <li key={faro.id}>\n            <Link to={`/faros/${faro.id}`}>{faro.nombre}</Link> · {faro.concello}\n          </li>\n        ))}\n      </ul>\n    </>\n  )\n}\n\nfunction Ficha() {\n  const faro = useLoaderData<typeof cargarFaro>()\n  return (\n    <>\n      <h1>{faro.nombre}</h1>\n      <p>{faro.notas}</p>\n      <Link to=\"editar\">Editar la ficha</Link>\n    </>\n  )\n}\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    Component: Maqueta,\n    children: [\n      { index: true, Component: () => <Link to=\"/faros\">Ver los faros</Link> },\n      { path: 'faros', loader: cargarFaros, Component: Lista },\n      { path: 'faros/:id', loader: cargarFaro, Component: Ficha },\n      { path: 'faros/:id/editar', loader: cargarFaro, action: guardarFaro, Component: Editor },\n    ],\n  },\n])\n\nexport default function App() {\n  return <RouterProvider router={router} />\n}\n"
    },
    {
      "nombre": "Editor.tsx",
      "codigo": "import { useRef, useState } from 'react'\nimport {\n  Form,\n  Link,\n  redirect,\n  useLoaderData,\n  useSearchParams,\n  type ActionFunctionArgs,\n  type LoaderFunctionArgs,\n} from 'react-router'\nimport type { Faro } from './tipos'\n\nexport async function cargarFaro({ params }: LoaderFunctionArgs) {\n  const respuesta = await fetch(`/api/faros/${params.id}`)\n  return (await respuesta.json()) as Faro\n}\n\nexport async function guardarFaro({ request, params }: ActionFunctionArgs) {\n  const datos = await request.formData()\n  await fetch(`/api/faros/${params.id}`, {\n    method: 'PATCH',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ notas: datos.get('notas') }),\n  })\n  return redirect(`/faros/${params.id}`)\n}\n\nexport default function Editor() {\n  const faro = useLoaderData<typeof cargarFaro>()\n  const [busqueda] = useSearchParams()\n  const [notas, setNotas] = useState(faro.notas)\n  const campo = useRef<HTMLTextAreaElement>(null)\n  const hayCambios = notas !== faro.notas\n  const vistaPrevia = busqueda.get('vista') === 'previa'\n\n  // 1. Si hay cambios y vas a otra página, el router tiene que pararte.\n  //    Guardar, abrir la vista previa o cerrarla no cuentan como salir.\n  // 2. Mientras esté bloqueado, enseña el aviso con «Seguir editando»\n  //    (que vuelva el foco a las notas) y «Salir sin guardar».\n\n  return (\n    <>\n      <h1>Editar: {faro.nombre}</h1>\n      <Form method=\"post\">\n        <label>\n          Notas para los voluntarios\n          <textarea\n            ref={campo}\n            name=\"notas\"\n            value={notas}\n            onChange={(e) => setNotas(e.target.value)}\n          />\n        </label>\n        <button>Guardar</button>\n      </Form>\n      <p>\n        {vistaPrevia ? (\n          <Link to=\".\">Cerrar la vista previa</Link>\n        ) : (\n          <Link to=\"?vista=previa\">Ver la vista previa</Link>\n        )}\n      </p>\n      {vistaPrevia && (\n        <section aria-label=\"Vista previa\" className=\"previa\">\n          <p>{notas}</p>\n        </section>\n      )}\n    </>\n  )\n}\n"
    },
    {
      "nombre": "tipos.ts",
      "codigo": "export type Faro = {\n  id: string\n  nombre: string\n  concello: string\n  notas: string\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "body {\n  margin: 0;\n  font-family: system-ui, sans-serif;\n  color: #1e293b;\n}\n\nheader {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: baseline;\n  gap: 0.5rem 1rem;\n  padding: 0.6rem 1rem;\n  background: #0f3d5e;\n  color: white;\n}\n\nheader a {\n  color: white;\n}\n\n.marca {\n  margin: 0;\n  font-weight: 700;\n}\n\nmain {\n  max-width: 34rem;\n  padding: 0.5rem 1rem 1rem;\n}\n\nh1 {\n  font-size: 1.35rem;\n  color: #0f3d5e;\n}\n\n/* Que siempre se vea dónde está el foco */\nh1:focus,\na:focus-visible,\nbutton:focus-visible,\ntextarea:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n\nlabel {\n  display: grid;\n  gap: 0.3rem;\n}\n\ntextarea {\n  min-height: 5rem;\n  padding: 0.4rem;\n  font: inherit;\n}\n\nbutton {\n  margin-top: 0.5rem;\n  padding: 0.35rem 0.8rem;\n  border: 2px solid #0f3d5e;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.aviso {\n  margin-top: 1rem;\n  padding: 0.6rem 1rem;\n  border-left: 6px solid #d97706;\n  border-radius: 8px;\n  background: #fef3c7;\n}\n\n.aviso h2 {\n  margin: 0.2rem 0;\n  font-size: 1.05rem;\n}\n\n.aviso button + button {\n  margin-left: 0.5rem;\n}\n\n.previa {\n  margin-top: 0.5rem;\n  padding: 0.2rem 1rem;\n  border: 1px dashed #0f3d5e;\n  border-radius: 8px;\n}\n"
    }
  ],
  "archivoInicial": "Editor.tsx",
  "urlInicial": "/faros/vilan/editar",
  "strictMode": true,
  "mostrarConsola": false,
  "exigirTiposCorrectos": true,
  "api": {
    "faros": [
      {
        "id": "fisterra",
        "nombre": "Faro de Fisterra",
        "concello": "Fisterra",
        "notas": "Aparcamiento lleno los domingos: proponer el autobús."
      },
      {
        "id": "tourinan",
        "nombre": "Faro de Touriñán",
        "concello": "Muxía",
        "notas": "Falta la foto de la puesta de sol."
      },
      {
        "id": "vilan",
        "nombre": "Faro Vilán",
        "concello": "Camariñas",
        "notas": "Revisar el horario de la sala antes de publicarlo."
      },
      {
        "id": "roncudo",
        "nombre": "Faro de Roncudo",
        "concello": "Ponteceso",
        "notas": "Añadir el aviso de oleaje."
      },
      {
        "id": "nariga",
        "nombre": "Faro de Punta Nariga",
        "concello": "Malpica de Bergantiños",
        "notas": "Pedir permiso para las fotos del interior."
      },
      {
        "id": "muxia",
        "nombre": "Faro de Muxía",
        "concello": "Muxía",
        "notas": "Añadir cómo llegar desde el puerto."
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Sin cambios, el enlace «Faros» te lleva a la lista",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Faros"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Faros de la Costa da Morte"
      }
    },
    {
      "descripcion": "Con cambios, al pulsar «Faros» el router te para y sale el aviso",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas para los voluntarios",
            "texto": "Pendiente: confirmar el horario de verano."
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Faros"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Salir sin guardar"
      }
    },
    {
      "descripcion": "«Seguir editando» te deja en el editor con lo que habías escrito",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas para los voluntarios",
            "texto": "Pendiente: confirmar el horario de verano."
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Faros"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Seguir editando"
          }
        }
      ],
      "espera": {
        "etiqueta": "Notas para los voluntarios",
        "valor": "Pendiente: confirmar el horario de verano."
      }
    },
    {
      "descripcion": "«Salir sin guardar» te lleva a la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas para los voluntarios",
            "texto": "Pendiente: confirmar el horario de verano."
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Faros"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Salir sin guardar"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Faros de la Costa da Morte"
      }
    },
    {
      "descripcion": "El Atrás de la barra también saca el aviso",
      "urlInicial": "/faros/vilan",
      "pasos": [
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Editar la ficha"
          }
        },
        {
          "escribir": {
            "etiqueta": "Notas para los voluntarios",
            "texto": "Pendiente: confirmar el horario de verano."
          }
        },
        {
          "atras": true
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Salir sin guardar"
      }
    },
    {
      "descripcion": "«Guardar» no pregunta: guarda y te lleva a la ficha del faro",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas para los voluntarios",
            "texto": "Pendiente: confirmar el horario de verano."
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
        "rol": "heading",
        "nombre": "Faro Vilán"
      }
    },
    {
      "descripcion": "Abrir la vista previa no pregunta: solo cambia la búsqueda",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Notas para los voluntarios",
            "texto": "Pendiente: confirmar el horario de verano."
          }
        },
        {
          "pulsar": {
            "rol": "link",
            "nombre": "Ver la vista previa"
          }
        }
      ],
      "espera": {
        "rol": "region",
        "nombre": "Vista previa"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En tu proyecto de Vite, añade `useBeforeUnload` al editor y prueba F5 con cambios y sin ellos. Después hazlo como recomienda MDN: un `useEffect` que añade el oyente de `beforeunload` solo mientras `hayCambios` vale `true`, y lo quita en la limpieza.
2. Convierte el aviso en un `<dialog>` abierto con `showModal()` (lección 36 de React): el foco queda atrapado dentro, y Escape, que lanza el evento `cancel`, tiene que hacer lo mismo que «Seguir editando».
3. Añade un botón «Guardar y salir» al aviso: guarda con un fetcher (lección 5) contra una `action` que devuelva `{ ok: true }` en vez de redirigir, y cuando `fetcher.data?.ok` llegue, llama a `blocker.proceed()`. Es la variante que propone la guía Navigation Blocking.
4. Junta el bloque del foco con el de las transiciones: `<ViewTransition>` alrededor del `<main>`, el foco al título y la región de estado. Después recorre la app con el lector de pantalla de tu sistema (lección 37 de React) y comprueba qué anuncia en cada cambio de página.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Navigation Blocking",
      "descripcion": "La guía de useBlocker paso a paso: el estado de cambios, el aviso, y qué hacer cuando el formulario se envía con el aviso abierto.",
      "url": "https://reactrouter.com/how-to/navigation-blocking",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "ScrollRestoration",
      "descripcion": "La referencia: getKey, storageKey y el nonce para la política de seguridad de contenidos.",
      "url": "https://reactrouter.com/api/components/ScrollRestoration",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "Accessibility",
      "descripcion": "Lo que React Router hace por la accesibilidad y lo que deja en tus manos: el foco y los anuncios al cambiar de ruta.",
      "url": "https://reactrouter.com/how-to/accessibility",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "View Transitions",
      "descripcion": "ViewTransition alrededor del Outlet, cómo migrar desde las APIs desaconsejadas y por qué Atrás y Adelante pueden no animarse.",
      "url": "https://reactrouter.com/how-to/view-transitions",
      "etiqueta": "reactrouter.com"
    },
    {
      "titulo": "<ViewTransition>: routers con transiciones de vista",
      "descripcion": "La referencia de React, con la sección que explica por qué React se salta la animación cuando la transición empieza en popstate.",
      "url": "https://react.dev/reference/react/ViewTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Window: beforeunload event",
      "descripcion": "Cuándo sale el diálogo, por qué hace falta que el usuario haya tocado la página y por qué escuchar el evento solo mientras haya cambios.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event",
      "etiqueta": "MDN"
    },
    {
      "titulo": "What we learned from user testing of accessible client-side routing techniques",
      "descripcion": "El estudio de 2019 con usuarios de lectores de pantalla y de teclado que enlaza la guía de accesibilidad de React Router.",
      "url": "https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing",
      "etiqueta": "Gatsby"
    }
  ]
}
```
