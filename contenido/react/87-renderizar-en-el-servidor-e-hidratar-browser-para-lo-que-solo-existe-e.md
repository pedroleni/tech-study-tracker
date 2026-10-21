# Renderizar en el servidor e hidratar; `browser()` para lo que solo existe en el navegador

- **Módulo:** React en el servidor
- **Slug:** `renderizar-en-el-servidor-e-hidratar-browser-para-lo-que-solo-existe-en-el-navegador` (autogenerado del título)
- **Orden:** 870
- **Fuentes:** [Server APIs](https://react.dev/reference/react-dom/server) + [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) + [browser](https://react.dev/reference/react-dom/browser) — ver `contenido/react/TEMARIO.md` #87

---

## Qué es y para qué sirve

Todo lo que has hecho hasta ahora en este temario es **renderizado en el cliente**: el servidor manda un `index.html` casi vacío, con un `<div id="root"></div>` (lección 2), y es el JavaScript, ya en el navegador, el que llama a `createRoot` y construye la página entera (lección 3). Mientras ese JavaScript se descarga, se analiza y se ejecuta, en la pantalla no hay nada.

No hace falta irse lejos para verlo. Esto es lo que devuelve techstudytracker.com, esta misma web, se pida la URL que se pida (comprobado el 21 de octubre de 2026; resumido, sin las demás etiquetas `<meta>`):

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "html",
  "codigo": "<!doctype html>\n<html lang=\"es\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta property=\"og:title\" content=\"Tech Study Tracker — Biblioteca técnica para aprender con contexto\">\n    <title>Tech Study Tracker</title>\n    <script type=\"module\" crossorigin src=\"/assets/index-BWsrJsBg.js\"></script>\n    <link rel=\"stylesheet\" crossorigin href=\"/assets/index-Dz5bcbXN.css\">\n  </head>\n  <body>\n    <div id=\"root\"></div>\n  </body>\n</html>",
  "anotaciones": [
    {
      "fragmento": "<div id=\"root\"></div>",
      "nota": "Vacío. Todo lo que ves en esta página lo pinta el JavaScript después. Hasta entonces, la pantalla está en blanco, y un robot que no ejecuta JavaScript se queda con esto."
    },
    {
      "fragmento": "<script type=\"module\" crossorigin src=\"/assets/index-BWsrJsBg.js\"></script>",
      "nota": "El JavaScript de toda la web: unos 2,8 MB, casi 800 KB comprimido (medido en octubre de 2026). En un móvil con mala cobertura, descargarlo, analizarlo y ejecutarlo lleva su tiempo."
    },
    {
      "fragmento": "<title>Tech Study Tracker</title>",
      "nota": "El mismo título y las mismas etiquetas para cualquier URL: es una SPA, con la reescritura a index.html de la lección 85. Lo propio de cada lección solo puede ponerlo el JavaScript."
    },
    {
      "fragmento": "property=\"og:title\"",
      "nota": "Lo que leen las vistas previas de un enlace (lección 81). Como el HTML es el mismo para todas las páginas, todas se comparten con la misma tarjeta."
    }
  ]
}
```

El **renderizado en el servidor** (SSR, *server-side rendering*) le da la vuelta: el servidor ejecuta tus componentes, genera el HTML de la página ya rellena y lo manda. El navegador lo pinta en cuanto llega, sin esperar a nada. Después llega el JavaScript, y React **hidrata** ese HTML: lo adopta, le engancha los manejadores de eventos y a partir de ahí la página funciona como cualquier app de React.

Resuelve tres problemas concretos:

- **El primer pintado.** El usuario ve el contenido en cuanto llega el HTML, no cuando termina el JavaScript.
- **Buscadores y vistas previas.** La guía de Google sobre JavaScript lo dice así: «sigue siendo una buena opción renderizar el contenido previamente o en el servidor, ya que así tu sitio web funcionará más rápido para los usuarios y los rastreadores; además, no todos los robots pueden ejecutar JavaScript».
- **Dispositivos lentos.** El usuario no tiene que esperar a que su móvil descargue y ejecute todo el JavaScript para ver la página: pintar HTML es lo que mejor sabe hacer un navegador, incluso uno barato. El JavaScript llega igual, pero ya no bloquea la lectura.

Lo que **no** resuelve: la página no es interactiva antes. Hasta que no llega el JavaScript y React hidrata, los botones no hacen nada. Como resume el equipo de React, el renderizado en servidor no hace la app interactiva más rápido: te deja enseñar antes una versión que todavía no lo es.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Un módulo para entender, no para ejecutar",
  "contenido": "La vista previa de esta web solo ejecuta React en el navegador: no hay servidor donde llamar a renderToPipeableStream. Lo del servidor lo verás en código anotado, con la salida real de React 19.3.1. La mitad del navegador sí se ejecuta: un simulador pone en la página el HTML que generó el servidor y llama a hydrateRoot, así que la hidratación, y sus errores, son de verdad."
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas de llevar una página de React al navegador",
  "roles": [
    {
      "etiqueta": "CSR",
      "rol": "Renderizado en el cliente",
      "descripcion": "Un HTML vacío y todo el trabajo en el navegador, con createRoot. Lo que has hecho hasta ahora y lo que hace esta web."
    },
    {
      "etiqueta": "SSR",
      "rol": "Renderizado en el servidor, en cada petición",
      "descripcion": "El servidor genera el HTML para cada visita, con los datos de ese momento, y el navegador lo hidrata con hydrateRoot."
    },
    {
      "etiqueta": "SSG",
      "rol": "Generación estática, en el build",
      "descripcion": "El HTML se genera una vez, al construir, y se sirve como un archivo más. Para lo que cambia poco. También se hidrata."
    }
  ]
}
```

## En el servidor: `react-dom/server`

Las funciones que convierten tus componentes en HTML viven en `react-dom/server` (y en `react-dom/static`, enseguida). Son funciones normales que llamas desde tu servidor. Este es uno mínimo con el `http` de Node, para la web de **Barcos La Gaviota**, una naviera que hace excursiones por la ría de Vigo. (Node no entiende JSX por sí solo: en un proyecto real este archivo pasa por un build, como el resto de tu código. Vite tiene un modo SSR, y los frameworks lo hacen por ti).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { createServer } from 'node:http'\nimport { renderToPipeableStream } from 'react-dom/server'\nimport App from './App.jsx'\n\ncreateServer((peticion, respuesta) => {\n  const { pipe, abort } = renderToPipeableStream(<App />, {\n    bootstrapScripts: ['/cliente.js'],\n    onShellReady() {\n      respuesta.statusCode = 200\n      respuesta.setHeader('content-type', 'text/html; charset=utf-8')\n      pipe(respuesta)\n    },\n    onShellError(error) {\n      respuesta.statusCode = 500\n      respuesta.setHeader('content-type', 'text/html; charset=utf-8')\n      respuesta.end('<h1>No hemos podido cargar las salidas</h1>')\n    },\n    onError(error) {\n      console.error(error)\n    },\n  })\n\n  setTimeout(() => abort(), 10_000)\n}).listen(3000)",
  "anotaciones": [
    {
      "fragmento": "renderToPipeableStream(<App />",
      "nota": "Ejecuta tus componentes en Node y va produciendo HTML. App tiene que devolver el documento entero, desde <html>: React añade por su cuenta el <!DOCTYPE html> y los scripts."
    },
    {
      "fragmento": "bootstrapScripts: ['/cliente.js']",
      "nota": "Los <script> que React añade a la página: el que llamará a hydrateRoot en el navegador. Sin ninguno, la página se queda en HTML estático, sin React en el cliente."
    },
    {
      "fragmento": "onShellReady()",
      "nota": "Se llama en cuanto está listo todo lo que queda fuera de los Suspense: el shell, o armazón. Aquí empiezas a enviar con pipe; lo que falte llegará después, en más trozos."
    },
    {
      "fragmento": "onShellError(error)",
      "nota": "Si falla el propio shell no hay HTML que mandar: envías uno de emergencia y un 500. Es tu última oportunidad de elegir el código de estado: una vez que empiezas a enviar, ya no se puede cambiar."
    },
    {
      "fragmento": "onError(error)",
      "nota": "Recibe cada error del servidor, también los de dentro de un Suspense. Esos no paran el render: React deja el fallback en el HTML y vuelve a intentarlo en el navegador."
    },
    {
      "fragmento": "setTimeout(() => abort(), 10_000)",
      "nota": "Si algo tarda demasiado, abort deja los Suspense pendientes con su fallback y el navegador termina el trabajo."
    }
  ]
}
```

`renderToPipeableStream` no es la única. Cuál usas depende de dónde corre tu servidor y de cuándo quieres el HTML:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las APIs de servidor de React DOM",
  "roles": [
    {
      "etiqueta": "renderToPipeableStream",
      "rol": "react-dom/server · Node.js",
      "descripcion": "HTML en streaming sobre los streams de Node. Devuelve pipe y abort. La de un servidor Node."
    },
    {
      "etiqueta": "renderToReadableStream",
      "rol": "react-dom/server · Web Streams",
      "descripcion": "Lo mismo en entornos con Web Streams, como Deno o los runtimes edge. Devuelve una promesa del stream. En Node existe, pero react.dev no la recomienda."
    },
    {
      "etiqueta": "prerender",
      "rol": "react-dom/static · en el build",
      "descripcion": "Espera a que terminen todos los Suspense y devuelve el HTML completo: para generar páginas estáticas. En Node, prerenderToNodeStream."
    },
    {
      "etiqueta": "renderToString",
      "rol": "react-dom/server · heredada",
      "descripcion": "Devuelve un string en el acto: ni streaming ni espera. Si algo suspende, pone el fallback. Solo para entornos sin streams."
    }
  ]
}
```

## En el navegador: `hydrateRoot`

En la lección 3 viste que `createRoot(...).render(...)` **sustituye** lo que haya dentro del contenedor. Con HTML del servidor eso sería tirar el trabajo: React borraría los nodos y los volvería a crear (comprobado con 19.3.1: lo hace sin avisar). Para adoptarlos existe `hydrateRoot`, también de `react-dom/client`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { hydrateRoot } from 'react-dom/client'\nimport App from './App.jsx'\nimport { enviarAlRegistro } from './registro.js'\n\nhydrateRoot(document, <App />, {\n  onRecoverableError(error, errorInfo) {\n    enviarAlRegistro(error, errorInfo.componentStack)\n  },\n})",
  "anotaciones": [
    {
      "fragmento": "hydrateRoot(document",
      "nota": "En lugar de createRoot. Como App devuelve el documento entero, se hidrata document. Si el servidor solo generó el contenido de un div, se le pasa ese div, igual que a createRoot."
    },
    {
      "fragmento": "<App />",
      "nota": "El mismo componente, con las mismas props, que usó el servidor. Si el servidor le pasó datos, el cliente necesita exactamente los mismos: suelen viajar dentro del HTML, en un <script>."
    },
    {
      "fragmento": "onRecoverableError(error, errorInfo)",
      "nota": "Aquí llegan los errores de los que React se recupera solo, como una hidratación que no cuadra. Sin esta opción, van a la consola. Las demás opciones son las de createRoot (lección 3); si usas identifierPrefix, tiene que ser el mismo que en el servidor."
    }
  ]
}
```

**Hidratar no es volver a pintar.** React ejecuta tus componentes en el navegador como en cualquier render, pero en vez de crear nodos recorre los que ya existen y comprueba, uno a uno, que coinciden con lo que él habría creado. Si coinciden, se queda con ellos y les engancha los manejadores de eventos y el estado. Cuando termina, la página ya es interactiva y React sigue como siempre: el siguiente cambio de estado es un render normal (lección 17). Un detalle de 19.3: `StrictMode` ya ejecuta dos veces los efectos también al hidratar, igual que con `createRoot` (lección 63).

Una app de React tiene una sola llamada a `hydrateRoot`, al arrancar, y casi nunca la escribes tú: si usas un framework, la hace por ti.

## La hidratación, en vivo

Debajo tienes el simulador del que hablaba arriba. `App.jsx` guarda el HTML que generó de verdad `renderToString(<Taquilla />)` en un servidor a las 10:42:07, y `Simulador.jsx` lo pone en la página y, al pulsar «Hidratar», llama a `hydrateRoot` con `<Taquilla />`. Lo que importa está en `Taquilla.jsx`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una taquilla que no se pone de acuerdo con el servidor",
  "consigna": "Pulsa «Vender billete»: no pasa nada, todavía no hay JavaScript. Pulsa «Hidratar» y mira la consola y la hora; ahora el botón sí funciona. Después, en Taquilla.jsx, añade suppressHydrationWarning al párrafo de la hora y repite la prueba: ya no hay error, pero fíjate en qué hora se queda. Pulsa «Vender billete» al cabo de unos segundos y mírala otra vez.",
  "archivos": [
    {
      "nombre": "Taquilla.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function Taquilla() {\n  const [vendidos, setVendidos] = useState(42)\n\n  return (\n    <section>\n      <h1>Taquilla del puerto</h1>\n      <p>Billetes vendidos hoy: {vendidos}</p>\n      <p>Datos de las {new Date().toLocaleTimeString('es-ES')}</p>\n      <button onClick={() => setVendidos(vendidos + 1)}>Vender billete</button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Simulador from './Simulador'\nimport Taquilla from './Taquilla'\nimport './estilos.css'\n\n// Lo que generó el servidor con renderToString(<Taquilla />) a las 10:42:07.\n// Los <!-- --> los pone React para separar dos textos seguidos.\nconst HTML_DEL_SERVIDOR =\n  '<section><h1>Taquilla del puerto</h1><p>Billetes vendidos hoy: <!-- -->42</p><p>Datos de las <!-- -->10:42:07</p><button>Vender billete</button></section>'\n\nexport default function App() {\n  return (\n    <Simulador htmlDelServidor={HTML_DEL_SERVIDOR}>\n      <Taquilla />\n    </Simulador>\n  )\n}\n"
    },
    {
      "nombre": "Simulador.jsx",
      "codigo": "import { useEffect, useLayoutEffect, useRef, useState } from 'react'\nimport { hydrateRoot } from 'react-dom/client'\n\n// Imita lo que pasa en el navegador cuando una página viene del servidor:\n// 1. Llega el HTML y se pinta tal cual, todavía sin JavaScript.\n// 2. Al pulsar «Hidratar» «llega el JavaScript» y se llama a hydrateRoot.\n// No hace falta que lo leas entero: lo interesante está en los otros archivos.\n\nconst SIN_JS = 'Solo HTML: el JavaScript todavía no ha llegado'\n\nfunction AvisarAlTerminar({ alTerminar, children }) {\n  useEffect(() => {\n    alTerminar()\n  }, [alTerminar])\n  return children\n}\n\nexport default function Simulador({ htmlDelServidor, children }) {\n  const pagina = useRef(null)\n  const raiz = useRef(null)\n  const [estado, setEstado] = useState(SIN_JS)\n\n  useLayoutEffect(() => {\n    pagina.current.innerHTML = htmlDelServidor\n  }, [htmlDelServidor])\n\n  useEffect(() => {\n    return () => {\n      const anterior = raiz.current\n      if (anterior) setTimeout(() => anterior.unmount())\n    }\n  }, [])\n\n  function hidratar() {\n    const errores = []\n    setEstado('Hidratando…')\n    const alTerminar = () =>\n      setEstado(errores.length === 0 ? 'Hidratación sin errores' : 'La hidratación ha fallado: mira la consola')\n    raiz.current = hydrateRoot(\n      pagina.current,\n      <AvisarAlTerminar alTerminar={alTerminar}>{children}</AvisarAlTerminar>,\n      {\n        onRecoverableError(error) {\n          errores.push(error)\n          console.error(error.message)\n        },\n      },\n    )\n  }\n\n  return (\n    <div className=\"simulador\">\n      <p className=\"rotulo\">Página recibida del servidor</p>\n      <div className=\"pagina\" ref={pagina} />\n      <div className=\"mandos\">\n        <button onClick={hidratar} disabled={estado !== SIN_JS}>\n          Hidratar\n        </button>\n        <p role=\"status\">{estado}</p>\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".simulador {\n  display: grid;\n  gap: 0.5rem;\n  font-family: system-ui, sans-serif;\n}\n\n.rotulo {\n  margin: 0;\n  color: #475569;\n  font-size: 0.85rem;\n}\n\n/* La ventana donde se pinta el HTML que mandó el servidor */\n.pagina {\n  padding: 0.75rem 1rem;\n  border: 2px dashed #0e7490;\n  border-radius: 10px;\n  background: #f0f9ff;\n}\n\n.pagina h1 {\n  margin-top: 0;\n  font-size: 1.2rem;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n.mandos p {\n  margin: 0;\n  color: #334155;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #0e7490;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "Taquilla.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Al hidratar, el navegador renderiza `Taquilla` a otra hora y el texto ya no coincide con el del HTML. React lo dice en la consola. Esta es la salida de una prueba real; en la tuya, la hora del cliente será otra:

```text
Hydration failed because the server rendered text didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  <Taquilla>
    <section>
      <h1>
      <p>
      <p>
+       11:58:31
-       10:42:07
      ...
```

Es decir: «La hidratación ha fallado porque el texto que renderizó el servidor no coincide con el del cliente. Por eso este árbol se va a regenerar en el cliente». Debajo, React enumera las causas habituales, y al final te enseña **dónde** está la diferencia: el camino de componentes y etiquetas hasta ella, con `+` para lo que pintó el cliente y `-` para lo que venía del servidor. En el simulador verás una línea más arriba del todo, `AvisarAlTerminar`, que es el envoltorio que usa el simulador.

«Regenerar» significa que React **tira ese HTML y lo vuelve a crear** desde cero, como haría `createRoot`. La página funciona, pero has perdido lo que ganabas con el servidor en esa parte, y puede notarse un salto. La documentación de `hydrateRoot` pide tratarlo como un bug: en el mejor caso es más lento; en el peor, los manejadores de eventos acaban enganchados a elementos que no son.

Con `suppressHydrationWarning` el error desaparece, pero la hora se queda en las 10:42:07: React no corrige el texto, solo deja de quejarse. Se actualiza cuando un render posterior produce otro texto distinto, como al vender un billete unos segundos después. Y solo alcanza un nivel: el texto de ese mismo elemento.

## Por qué el servidor y el navegador no pintan lo mismo

La lista del propio mensaje es la mejor guía. Todas las causas se reducen a una: **algo que tu componente lee durante el render vale distinto en el servidor y en el navegador**.

- **Ramas `typeof window !== 'undefined'`.** En el servidor no hay `window`, así que un componente que pregunta por él pinta una cosa allí y otra aquí. Lo verás en «Errores típicos».
- **Valores que cambian en cada llamada:** `Date.now()`, `new Date()`, `Math.random()`. La taquilla de arriba.
- **Fechas y números según el idioma o la zona horaria del usuario.** El servidor suele estar en UTC y en inglés; tu usuario, no.
- **Datos que cambian** entre que el servidor genera el HTML y el navegador hidrata, si no se manda con el HTML la foto exacta que usó el servidor.
- **HTML mal anidado**, como un `<div>` dentro de un `<p>`: el navegador lo «arregla» al leerlo, y el DOM ya no es el que React generó.
- **Extensiones del navegador** que tocan la página antes de que llegue React. Esta no es culpa tuya, pero sale con el mismo mensaje.

A esa lista, la documentación de `hydrateRoot` añade una más: **espacios o saltos de línea** alrededor del HTML dentro del contenedor, por ejemplo en la plantilla con la que tu servidor envuelve lo que genera React.

Los **atributos** son un caso aparte. ¿Qué crees que pasa aquí?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// En el servidor, Math.random() dio 0.42; en el navegador, 0.87\nfunction CampoPasajero() {\n  const id = 'pasajero-' + Math.round(Math.random() * 100)\n  return (\n    <p>\n      <label htmlFor={id}>Nombre del pasajero</label>\n      <input id={id} />\n    </p>\n  )\n}\n\n// El HTML del servidor trae <input id=\"pasajero-42\">.\n// Después de hydrateRoot, ¿qué id tiene el input en el DOM?",
  "opciones": [
    "pasajero-87: React corrige el atributo",
    "pasajero-42: React avisa en la consola, pero no lo corrige",
    "pasajero-87: React regenera el párrafo entero, como con el texto",
    "Ninguno: React quita el atributo que no cuadra"
  ],
  "correcta": 1,
  "explicacion": "Con atributos, React no regenera ni corrige: avisa con «A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up.» El DOM se queda con pasajero-42 mientras React cree que es pasajero-87, y cualquier aria-describedby que apunte al id del cliente apuntará a la nada. Para fabricar un id que coincida en los dos lados está useId (lección 37)."
}
```

Ese aviso dice literalmente «This won't be patched up»: **no se va a corregir**. Comprobado con 19.3.1: después de hidratar, el `input` sigue con el `id` del servidor. Es la razón de que exista `useId` (lección 37), que calcula el `id` a partir de la posición del componente en el árbol, igual en los dos lados.

## Pintar algo distinto en el navegador sin romper la hidratación

A veces quieres de verdad que el navegador enseñe algo que el servidor no puede saber: la zona horaria del usuario, si tiene la pantalla táctil, lo que guardó en `localStorage`. La regla para hacerlo bien es una sola:

> **El primer render en el navegador tiene que pintar exactamente lo mismo que el servidor. Lo que solo sabe el navegador llega después de hidratar.**

Hay cuatro herramientas, según el caso:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Cuatro formas de que el navegador pinte algo propio",
  "roles": [
    {
      "etiqueta": "suppressHydrationWarning",
      "rol": "Una diferencia pequeña e inevitable",
      "descripcion": "Una marca de tiempo en un solo elemento. Calla el aviso, y solo en ese nivel, pero deja el texto del servidor: React no lo corrige."
    },
    {
      "etiqueta": "useSyncExternalStore",
      "rol": "Un dato del navegador, que puede cambiar",
      "descripcion": "Con getServerSnapshot, el primer render coincide con el servidor y React vuelve a renderizar con el valor real justo después de hidratar."
    },
    {
      "etiqueta": "use(browser())",
      "rol": "Un componente sin sentido en el servidor",
      "descripcion": "Desde 19.3. En el servidor deja el fallback del Suspense; en el navegador el componente se renderiza entero."
    },
    {
      "etiqueta": "El dato, desde el servidor",
      "rol": "Algo que el servidor sí puede saber",
      "descripcion": "Si el servidor calcula la hora o lee los datos, que los mande dentro del HTML y que el cliente renderice con esos mismos valores."
    }
  ]
}
```

El segundo caso ya lo conoces: `useSyncExternalStore` (lección 46) tiene un tercer argumento, `getServerSnapshot`, pensado justo para esto. La documentación dice que React lo usa **solo al renderizar en el servidor y durante la hidratación**. Así, el primer render del navegador pinta lo mismo que el servidor, y justo después React lee el valor real y, si es distinto, vuelve a renderizar. En la reserva de asientos del barco, por ejemplo, el texto depende de si la pantalla es táctil:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useSyncExternalStore } from 'react'\n\nconst TACTIL = '(pointer: coarse)'\n\nfunction suscribirse(avisar) {\n  const consulta = matchMedia(TACTIL)\n  consulta.addEventListener('change', avisar)\n  return () => consulta.removeEventListener('change', avisar)\n}\n\nconst enElNavegador = () => matchMedia(TACTIL).matches\nconst enElServidor = () => null\n\nexport default function Instrucciones() {\n  const tactil = useSyncExternalStore(suscribirse, enElNavegador, enElServidor)\n\n  if (tactil === null) return <p>Elige tu asiento en el plano.</p>\n  return <p>{tactil ? 'Toca' : 'Haz clic en'} un asiento libre para reservarlo.</p>\n}",
  "anotaciones": [
    {
      "fragmento": "const enElServidor = () => null",
      "nota": "El getServerSnapshot. El servidor no sabe nada de la pantalla del usuario, así que devuelve null. React lo vuelve a usar al hidratar, y por eso el primer render del navegador coincide con el HTML."
    },
    {
      "fragmento": "if (tactil === null) return <p>Elige tu asiento en el plano.</p>",
      "nota": "Lo que ve todo el mundo al principio: un texto que vale para cualquier pantalla. Nada de un hueco vacío que luego salta."
    },
    {
      "fragmento": "useSyncExternalStore(suscribirse, enElNavegador, enElServidor)",
      "nota": "Nada más hidratar, React llama a enElNavegador; si no devuelve lo mismo que enElServidor, vuelve a renderizar con el valor real."
    },
    {
      "fragmento": "consulta.addEventListener('change', avisar)",
      "nota": "Y si cambia mientras la página está abierta, por ejemplo al conectar un ratón a una tablet, la media query avisa y React vuelve a leer."
    }
  ]
}
```

Verás también, en código ya escrito y en la propia documentación de `hydrateRoot`, la versión clásica del mismo truco: un estado que empieza en `false` y un efecto que lo pone a `true` después de montar.

```jsx
function Instrucciones() {
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  if (!montado) return <p>Elige tu asiento en el plano.</p>
  return <p>{matchMedia('(pointer: coarse)').matches ? 'Toca' : 'Haz clic en'} un asiento libre…</p>
}
```

Funciona por lo mismo: el primer render coincide con el servidor. Pero cuesta un render más en todos los casos, la propia documentación avisa de que hace la hidratación más lenta, y el linter de React lo señala con la regla `set-state-in-effect` (lecciones 39 y 70). Para un dato del navegador, `useSyncExternalStore`; para un componente entero que no tiene sentido en el servidor, lo siguiente.

## `use(browser())`: lo que solo existe en el navegador (19.3)

Hay componentes que no pueden producir nada útil en el servidor: un editor que lee el borrador guardado en `localStorage`, un mapa que necesita medir la ventana, un folleto en el idioma del navegador. Hasta ahora se resolvía con la comprobación de `typeof window`, con el estado de «montado» de arriba o con una opción del framework para no renderizar esa parte en el servidor. **React 19.3 añade una API para esto**: `browser`, de `react-dom`, que se usa siempre dentro de `use` (lección 49).

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { Suspense, use } from 'react'\nimport { browser } from 'react-dom'\n\nfunction Folleto() {\n  use(browser('El idioma solo lo sabe el navegador.'))\n\n  return <p>Folleto de la excursión en tu idioma: {navigator.language}</p>\n}\n\nexport default function Cabecera() {\n  return (\n    <header>\n      <h1>Barcos La Gaviota</h1>\n      <Suspense fallback={<p>Preparando el folleto en tu idioma…</p>}>\n        <Folleto />\n      </Suspense>\n    </header>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "import { browser } from 'react-dom'",
      "nota": "browser es de react-dom, no de react. Llamado así, solo, no hace nada: devuelve un valor opaco que hay que pasarle a use. Tampoco se lanza con throw."
    },
    {
      "fragmento": "use(browser('El idioma solo lo sabe el navegador.'))",
      "nota": "En el servidor, aquí se para el render de Folleto: navigator.language ni se toca. En el navegador, use(browser()) devuelve undefined y el componente sigue como si nada."
    },
    {
      "fragmento": "'El idioma solo lo sabe el navegador.'",
      "nota": "El motivo, opcional: un texto o una función que lo devuelve. Nunca llega al HTML; solo lo ve tu servidor, en onBrowserBailout. Como cualquier use, puede ir dentro de un if, para que un componente salga del servidor solo en ciertos casos."
    },
    {
      "fragmento": "<Suspense fallback={<p>Preparando el folleto en tu idioma…</p>}>",
      "nota": "Obligatorio. Lo que va en el HTML del servidor en lugar de Folleto es este fallback. Sin un Suspense por encima, el render del servidor falla."
    }
  ]
}
```

En el servidor, el HTML lleva el fallback dentro de una marca especial, `<!--$!-->`, que en el navegador significa «este hueco lo termina el cliente». Esta es la salida real de `renderToString(<Cabecera />)` con React 19.3.1 en modo producción:

```html
<header><h1>Barcos La Gaviota</h1><p>Excursiones por la ría de Vigo</p><!--$!--><template data-dgst=""></template><p>Preparando el folleto en tu idioma…</p><!--/$--></header>
```

Al hidratar, React ve la marca y, en vez de comparar ese hueco con nada, renderiza `Folleto` ahí por primera vez. No hay diferencia que reportar: ni la consola ni `onRecoverableError` dicen nada, porque no es un error. Compruébalo con el simulador:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El hueco que deja el servidor y que rellena el navegador",
  "consigna": "Mira la página antes de hidratar: en lugar del folleto está el fallback. Pulsa «Hidratar»: el folleto aparece con el idioma de tu navegador, no hay ningún error y la consola dice qué devolvió use(browser()). Después, en Cabecera.jsx, quita el Suspense y deja <Folleto /> solo: ahora el navegador no tiene un hueco que rellenar donde el servidor dejó la marca.",
  "archivos": [
    {
      "nombre": "Cabecera.jsx",
      "codigo": "import { Suspense, use } from 'react'\nimport { browser } from 'react-dom'\n\nfunction Folleto() {\n  // En el servidor, esta línea corta el render y deja el fallback del Suspense.\n  // En el navegador devuelve undefined y el componente sigue como siempre.\n  const resultado = use(browser('El idioma solo lo sabe el navegador.'))\n  console.log('Folleto se renderiza. use(browser()) ha devuelto:', String(resultado))\n\n  return <p>Folleto de la excursión en tu idioma: {navigator.language}</p>\n}\n\nexport default function Cabecera() {\n  return (\n    <header>\n      <h1>Barcos La Gaviota</h1>\n      <p>Excursiones por la ría de Vigo</p>\n      <Suspense fallback={<p>Preparando el folleto en tu idioma…</p>}>\n        <Folleto />\n      </Suspense>\n    </header>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Simulador from './Simulador'\nimport Cabecera from './Cabecera'\nimport './estilos.css'\n\n// Lo que generó el servidor. Folleto llamó a use(browser()), así que en su\n// sitio va el fallback, entre <!--$!--> y <!--/$-->: la marca de React para\n// «este hueco lo termina el navegador».\nconst HTML_DEL_SERVIDOR =\n  '<header><h1>Barcos La Gaviota</h1><p>Excursiones por la ría de Vigo</p><!--$!--><template data-dgst=\"\"></template><p>Preparando el folleto en tu idioma…</p><!--/$--></header>'\n\nexport default function App() {\n  return (\n    <Simulador htmlDelServidor={HTML_DEL_SERVIDOR}>\n      <Cabecera />\n    </Simulador>\n  )\n}\n"
    },
    {
      "nombre": "Simulador.jsx",
      "codigo": "import { useEffect, useLayoutEffect, useRef, useState } from 'react'\nimport { hydrateRoot } from 'react-dom/client'\n\n// Imita lo que pasa en el navegador cuando una página viene del servidor:\n// 1. Llega el HTML y se pinta tal cual, todavía sin JavaScript.\n// 2. Al pulsar «Hidratar» «llega el JavaScript» y se llama a hydrateRoot.\n// No hace falta que lo leas entero: lo interesante está en los otros archivos.\n\nconst SIN_JS = 'Solo HTML: el JavaScript todavía no ha llegado'\n\nfunction AvisarAlTerminar({ alTerminar, children }) {\n  useEffect(() => {\n    alTerminar()\n  }, [alTerminar])\n  return children\n}\n\nexport default function Simulador({ htmlDelServidor, children }) {\n  const pagina = useRef(null)\n  const raiz = useRef(null)\n  const [estado, setEstado] = useState(SIN_JS)\n\n  useLayoutEffect(() => {\n    pagina.current.innerHTML = htmlDelServidor\n  }, [htmlDelServidor])\n\n  useEffect(() => {\n    return () => {\n      const anterior = raiz.current\n      if (anterior) setTimeout(() => anterior.unmount())\n    }\n  }, [])\n\n  function hidratar() {\n    const errores = []\n    setEstado('Hidratando…')\n    const alTerminar = () =>\n      setEstado(errores.length === 0 ? 'Hidratación sin errores' : 'La hidratación ha fallado: mira la consola')\n    raiz.current = hydrateRoot(\n      pagina.current,\n      <AvisarAlTerminar alTerminar={alTerminar}>{children}</AvisarAlTerminar>,\n      {\n        onRecoverableError(error) {\n          errores.push(error)\n          console.error(error.message)\n        },\n      },\n    )\n  }\n\n  return (\n    <div className=\"simulador\">\n      <p className=\"rotulo\">Página recibida del servidor</p>\n      <div className=\"pagina\" ref={pagina} />\n      <div className=\"mandos\">\n        <button onClick={hidratar} disabled={estado !== SIN_JS}>\n          Hidratar\n        </button>\n        <p role=\"status\">{estado}</p>\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".simulador {\n  display: grid;\n  gap: 0.5rem;\n  font-family: system-ui, sans-serif;\n}\n\n.rotulo {\n  margin: 0;\n  color: #475569;\n  font-size: 0.85rem;\n}\n\n/* La ventana donde se pinta el HTML que mandó el servidor */\n.pagina {\n  padding: 0.75rem 1rem;\n  border: 2px dashed #0e7490;\n  border-radius: 10px;\n  background: #f0f9ff;\n}\n\n.pagina h1 {\n  margin-top: 0;\n  font-size: 1.2rem;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n.mandos p {\n  margin: 0;\n  color: #334155;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #0e7490;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "Cabecera.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Si has quitado el `<Suspense>`, la hidratación falla: el HTML trae la marca de un hueco que el árbol del cliente ya no tiene. En una app de verdad ni llegarías a eso, porque sin `<Suspense>` el que falla primero es el servidor, como verás enseguida.

En la vista previa no hay servidor, así que `use(browser())` siempre devuelve `undefined`: el componente se pinta a la primera. **Todo su efecto está en el servidor**. Y su código viaja al navegador como el de cualquier otro componente: `browser()` decide dónde se renderiza, no qué JavaScript se descarga.

Tres reglas, de la referencia de `browser`:

- **Siempre dentro de un `<Suspense>`** durante el render del servidor. Si no hay ninguno por encima, el servidor no tiene qué poner en su lugar y falla con este error (comprobado con React 19.3.1):

```text
The server render could not complete because client rendering was requested outside a Suspense boundary. See this error's cause for additional details.
```

Es decir: «El render del servidor no ha podido terminar porque se pidió renderizar en el cliente fuera de un límite de Suspense». Si eso pasa en el shell, salta `onShellError` y tu servidor manda la página de emergencia.

- **Solo en Client Components.** En una app con Server Components (lección 88), `use(browser())` tiene que ir en un archivo con `'use client'`.
- **Sin `throw`.** Se pasa a `use`; lanzarlo no sirve.

Si tu servidor quiere enterarse de qué partes se dejaron para el navegador, `renderToPipeableStream` y las demás aceptan la opción `onBrowserBailout(error, errorInfo)`. El `error` llega con el mensaje ``Browser-only rendering was requested by `browser()`.``, tu motivo en `error.cause` y el componente en `errorInfo.componentStack`. Y `browser()` también sirve como motivo de `abort`: `abort(browser('El render ha tardado demasiado'))` deja los Suspense pendientes para que los termine el navegador sin contarlo como un error.

## Streaming: el HTML llega por trozos

Sin streaming, el renderizado en servidor es todo o nada: o esperas a tener todos los datos antes de renderizar, y la parte más lenta retrasa la página entera, o mandas un fallback y esa parte se queda para el navegador, que es lo que hace `renderToString`. **Con streaming y `<Suspense>`, ninguna de las dos**: React envía primero el shell, con los fallbacks en los huecos, y cada parte llega en cuanto está lista.

Esto es lo que manda de verdad `renderToPipeableStream` con React 19.3.1, en producción, para una página cuya lista de salidas tarda 800 ms en llegar. El primer trozo sale a los 3 ms:

```html
<!DOCTYPE html><html lang="es"><head><meta charSet="utf-8"/><link rel="preload" as="script" fetchPriority="low" href="/cliente.js"/><title>Barcos La Gaviota</title></head><body><h1>Salidas de hoy</h1><!--$?--><template id="B:0"></template><p>Cargando horarios…</p><!--/$--><script>requestAnimationFrame(function(){$RT=performance.now()});</script><script src="/cliente.js" id="_R_" async=""></script>
```

Y el segundo, a los 806 ms (recortado: el `<script>` real define antes las funciones `$RC` y compañía):

```html
<div hidden id="S:0"><ul><li>10:00<!-- --> · <!-- -->Islas Cíes</li><li>12:30<!-- --> · <!-- -->Isla de Ons</li></ul></div><script>…$RC("B:0","S:0")</script>
```

Fíjate en las marcas. `<!--$?-->` señala un Suspense pendiente, y `<template id="B:0">` es el sitio exacto del hueco. Cuando llegan los datos, React manda el contenido en un `<div hidden id="S:0">` y un pequeño `<script>` en línea, `$RC("B:0","S:0")`, que lo mueve al hueco y quita el fallback. **Ese intercambio no necesita React en el navegador**: ocurre aunque el JavaScript de tu app no haya llegado todavía. Desde 19.2, además, React junta las partes que terminan casi a la vez y las revela de una tacada, como mucho una vez cada 300 ms.

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Una visita a la web de la naviera, en orden",
  "items": [
    {
      "fecha": "Servidor · 0 ms",
      "titulo": "Llega la petición",
      "texto": "El navegador pide la página de salidas. El servidor llama a renderToPipeableStream(<App />) y React empieza a ejecutar los componentes."
    },
    {
      "fecha": "Servidor · 3 ms",
      "titulo": "El shell está listo",
      "texto": "Todo lo que queda fuera de los Suspense está renderizado. onShellReady llama a pipe y sale el primer trozo: la cabecera, el fallback «Cargando horarios…» y el <script> de la app."
    },
    {
      "fecha": "Navegador",
      "titulo": "Se pinta el HTML",
      "texto": "El usuario ya ve la página con el fallback en el hueco. Los botones están, pero no responden: React no ha llegado."
    },
    {
      "fecha": "Servidor · 806 ms",
      "titulo": "Llegan los datos",
      "texto": "La lista de salidas se resuelve, React termina ese Suspense y manda otro trozo: el contenido en un div oculto y el script que lo cambia por el fallback."
    },
    {
      "fecha": "Navegador",
      "titulo": "Llega el JavaScript",
      "texto": "El script de la app, que se descarga en paralelo, carga React y tus componentes y llama a hydrateRoot(document, <App />)."
    },
    {
      "fecha": "Navegador",
      "titulo": "Hidratación",
      "texto": "React renderiza el árbol, recorre el DOM que ya existe, comprueba que coincide y engancha manejadores y estado. Cada Suspense se hidrata por separado, y lo que el usuario toca va primero."
    },
    {
      "fecha": "Navegador",
      "titulo": "Lo que solo existe en el navegador",
      "texto": "Los componentes con use(browser()) se renderizan en el sitio de su fallback, getServerSnapshot deja paso al valor real y se ejecutan los efectos. Desde aquí, React funciona como en una app de cliente."
    }
  ]
}
```

El penúltimo paso tiene nombre propio: **hidratación selectiva**. Cada `<Suspense>` es una unidad que se hidrata por su cuenta, así que React no espera a tener todo el código para empezar, y si el usuario hace clic en una parte que aún no está hidratada, React la adelanta. El grupo de trabajo de React lo explica con detalle en el artículo que tienes en «Para profundizar».

Con todo junto, cada componente de una página cae en uno de estos sitios:

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Qué sale en cada trozo de HTML",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "etiqueta": "shell",
      "nota": "← primer trozo, en cuanto se llama a onShellReady"
    },
    {
      "nombre": "Cabecera",
      "nivel": 1,
      "etiqueta": "shell"
    },
    {
      "nombre": "Suspense",
      "nivel": 1,
      "etiqueta": "límite",
      "nota": "en el primer trozo va su fallback, «Cargando horarios…»"
    },
    {
      "nombre": "Salidas",
      "nivel": 2,
      "etiqueta": "espera datos",
      "nota": "← llega en un trozo posterior, con el <script> que lo coloca"
    },
    {
      "nombre": "Suspense",
      "nivel": 1,
      "etiqueta": "límite",
      "nota": "su fallback se queda en el HTML, marcado con <!--$!-->"
    },
    {
      "nombre": "Folleto",
      "nivel": 2,
      "etiqueta": "solo navegador",
      "nota": "← use(browser()): se renderiza al hidratar"
    },
    {
      "nombre": "Pie",
      "nivel": 1,
      "etiqueta": "shell"
    }
  ]
}
```

Dónde pones los `<Suspense>` decide qué ve primero el usuario. Si envuelves la app entera en uno, el shell es un único spinner; la documentación recomienda un shell **mínimo pero completo**, que tenga ya la forma de la página.

Los errores siguen la misma frontera. Si un componente falla **dentro** de un Suspense, React no para: pone su fallback, avisa a `onError` y lo vuelve a intentar en el navegador; si allí funciona, el usuario no se entera. Si falla **en el shell**, no hay página que mandar: salta `onShellError`.

## En el build: `prerender`

Si el contenido no cambia en cada visita (la página de tarifas, un artículo del blog), no hace falta generarlo en cada petición: se genera una vez al construir y se sirve como un archivo estático. Para eso está `prerender`, de `react-dom/static`. A diferencia de las otras, **espera a que terminen todos los Suspense** antes de devolver el HTML, porque nadie está esperando a que llegue. (Y si un `prerender` se corta, lo que haya quedado pendiente se puede completar después con `resume`: el prerenderizado parcial, para frameworks).

Las tres APIs ante la misma página:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Salidas() {\n  const lista = use(promesaSalidas) // tarda 300 ms en resolverse\n  return (\n    <ul>\n      {lista.map((s) => <li key={s.hora}>{s.hora} · {s.destino}</li>)}\n    </ul>\n  )\n}\n\nfunction App() {\n  return (\n    <main>\n      <h1>Salidas de hoy</h1>\n      <Suspense fallback={<p>Cargando horarios…</p>}>\n        <Salidas />\n      </Suspense>\n    </main>\n  )\n}\n\n// ¿Qué HTML devuelve renderToString(<App />)?",
  "opciones": [
    "El título y la lista, unos 300 ms después",
    "El título y «Cargando horarios…», en el acto: no espera a la promesa",
    "Un error: renderToString no admite Suspense",
    "Nada hasta que se resuelve la promesa; después, el título y la lista"
  ],
  "correcta": 1,
  "explicacion": "renderToString devuelve un string en el acto, así que no puede esperar: pone el fallback y deja la lista para el navegador. Con 19.3.1 tardó 3 ms. Con prerender, la misma página tardó 303 ms y salió con la lista dentro; con renderToPipeableStream salen las dos cosas, el fallback en el primer trozo y la lista en el siguiente."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Páginas públicas que tienen que encontrarse",
      "texto": "Una tienda, un blog, una documentación, los horarios de la naviera. Que el contenido esté en el HTML ayuda a los buscadores, a los robots que no ejecutan JavaScript y a las vistas previas de los enlaces."
    },
    {
      "titulo": "Usuarios con móviles modestos o mala conexión",
      "texto": "Ven el contenido en cuanto llega el HTML, aunque el JavaScript tarde. Con streaming, además, lo lento no retrasa lo rápido."
    },
    {
      "titulo": "No siempre compensa",
      "texto": "Un panel privado detrás de un login o una herramienta interna funcionan bien solo en el cliente. El renderizado en servidor necesita un servidor que ejecute React en cada petición, y eso es infraestructura, coste y una clase nueva de bugs: los de hidratación."
    },
    {
      "titulo": "Casi siempre, con un framework",
      "texto": "Next.js o React Router en modo framework (el proyecto 98) llaman por ti a renderToPipeableStream y a hydrateRoot, y deciden por ruta qué se renderiza en el servidor, en el build o en el cliente. Lo que sigue siendo tuyo es que tus componentes pinten lo mismo en los dos lados."
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
      "mito": "Con renderizado en servidor, la página es interactiva antes",
      "realidad": "Se ve antes, que no es lo mismo. Los botones no responden hasta que llega el JavaScript y React hidrata. Y no ahorra ni un byte de JavaScript: el navegador sigue descargando todos tus componentes. Para eso están los Server Components (lección 88)."
    },
    {
      "mito": "Hidratar es volver a pintar la página",
      "realidad": "React reutiliza los nodos del DOM que ya existen: los recorre, comprueba que coinciden con lo que él renderizaría y les engancha los manejadores. Solo regenera una parte si no coincide, y entonces avisa."
    },
    {
      "mito": "suppressHydrationWarning arregla la diferencia",
      "realidad": "Solo calla el aviso, y solo en ese elemento. El texto del servidor se queda en la página hasta que un render posterior produzca otro distinto."
    },
    {
      "mito": "use(browser()) saca el componente del JavaScript que se descarga",
      "realidad": "Su código viaja al navegador como el de cualquier componente de cliente. Lo único que cambia es que el servidor no lo renderiza y deja el fallback del Suspense en su sitio."
    },
    {
      "mito": "renderToString es la forma normal de renderizar en el servidor",
      "realidad": "Es la API heredada: no hace streaming y, si algo suspende, pone el fallback sin esperar. Para servir páginas, renderToPipeableStream o renderToReadableStream; para generarlas en el build, prerender."
    },
    {
      "mito": "Para tener SSR hace falta un framework",
      "realidad": "Las APIs son de react-dom y puedes llamarlas tú, como en esta lección. Lo que pone un framework es el resto: el build del servidor, las rutas, los datos y el despliegue. Por eso react.dev lo recomienda (lección 90)."
    }
  ]
}
```

## Errores típicos

**Leer `window`, `document` o `localStorage` durante el render.** En el navegador funciona, y por eso pasa desapercibido hasta que el componente se renderiza en el servidor, donde esos objetos no existen. Node lo dice sin rodeos:

```text
ReferenceError: window is not defined
```

Si el error salta en el shell, la página entera cae en `onShellError`. Si salta dentro de un `<Suspense>`, React pone el fallback y lo reintenta en el navegador, donde sí funciona: la página sale, pero esa parte nunca se renderiza en el servidor y `onError` se queja en cada petición. Lo que es del navegador se lee en los manejadores de eventos, en los efectos o con las herramientas de arriba, nunca en el cuerpo del componente.

**Arreglarlo con una rama `typeof window`.** Es el arreglo que sale primero, y cambia un error por otro:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function BotonCompartir() {\n  if (typeof window === 'undefined') {\n    return null\n  }\n  return (\n    <button onClick={() => navigator.share({ url: location.href })}>\n      Compartir la excursión\n    </button>\n  )\n}\n\n// La página se renderiza en el servidor y se hidrata en el navegador.\n// ¿Qué pasa al hidratar?",
  "opciones": [
    "Nada raro: en el servidor no sale el botón y en el navegador sí",
    "La hidratación falla: el primer render del navegador tiene un botón que el HTML no trae",
    "El botón no sale nunca, ni en el navegador",
    "El servidor falla con «window is not defined»"
  ],
  "correcta": 1,
  "explicacion": "En el servidor no hay window y BotonCompartir no pinta nada; en el primer render del navegador sí lo hay y pinta un botón. React avisa con «Hydration failed because the server rendered HTML didn't match the client» y un + <button> en la diferencia, y regenera esa parte. El botón acaba saliendo, pero has perdido la hidratación. La salida buena: use(browser()) dentro de un Suspense."
}
```

Es la primera causa de la lista de React, y la propia documentación de `hydrateRoot` la cita entre las más comunes. Una rama así no evita la diferencia: **la crea**.

**Fechas, horas y números formateados en el render.** `new Date()`, `toLocaleTimeString()` o `Intl.NumberFormat` sin un idioma y una zona fijos dan resultados distintos en un servidor en UTC y en el navegador de tu usuario. Si el dato es del servidor, que se mande con el HTML y se formatee igual en los dos lados; si es del usuario, `useSyncExternalStore` o `use(browser())`.

**`createRoot` donde iba `hydrateRoot`.** No da ningún error, y por eso cuesta verlo. La página se ve igual de pronto, porque el HTML ya estaba, pero React tira esos nodos y crea otros iguales: trabajo de más y, de paso, lo que el usuario hubiera escrito ya en un campo se pierde (comprobado con 19.3.1: con `hydrateRoot`, el texto del campo se conserva). Y al revés, `hydrateRoot` sobre un contenedor vacío tampoco está soportado: no hay nada que hidratar, React lo trata como una diferencia y lo regenera todo.

**Una plantilla con saltos de línea alrededor del HTML de React.** Si tu servidor hace algo como `` `<div id="root">\n${html}\n</div>` ``, esos `\n` son nodos de texto que React no generó. Con React 19.3.1 la hidratación falla con «Hydration failed because the server rendered HTML didn't match the client» y una diferencia que señala un `{"\n"}`.

**`use(browser())` sin un `<Suspense>` por encima.** El servidor falla con el error que viste arriba, *The server render could not complete because client rendering was requested outside a Suspense boundary*.

**Datos distintos en cada lado.** Si el servidor renderiza `<App datos={...} />` con algo que lee en ese momento, el cliente tiene que recibir exactamente lo mismo. La documentación lo resuelve metiendo los datos en la página con la opción `bootstrapScriptContent` y leyéndolos al hidratar. Ojo con lo que metes ahí: si son datos de usuarios, `JSON.stringify` no basta para escaparlos dentro de un `<script>` (lección 82).

## Ejercicios

La naviera abre plazas para una excursión a las islas Cíes. Sus visitantes llegan de todo el mundo, así que la ficha enseña la hora de salida también en la hora local de cada uno. El problema: el servidor no sabe en qué zona horaria está nadie.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La hora local de la salida, sin romper la hidratación",
  "consigna": "Pulsa «Hidratar»: falla, porque SalidaCies calcula la hora local en el primer render y el servidor, que no sabe dónde estás, dejó «Calculando tu hora local…». Arregla SalidaCies.jsx para que el primer render pinte lo mismo que el servidor y la hora local llegue justo después: con useSyncExternalStore y un getServerSnapshot que devuelva null, o con estado y un efecto. suppressHydrationWarning no vale aquí. Después pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "SalidaCies.jsx",
      "codigo": "import { useState } from 'react'\n\n// Las 10:00 del sábado 14 de noviembre en Vigo (UTC+1 en invierno)\nconst SALIDA = new Date('2026-11-14T10:00:00+01:00')\n\nfunction horaLocal() {\n  return SALIDA.toLocaleTimeString('es-ES', {\n    hour: '2-digit',\n    minute: '2-digit',\n    timeZoneName: 'short',\n  })\n}\n\nexport default function SalidaCies() {\n  const [plazas, setPlazas] = useState(8)\n  // Tu trabajo: el servidor no sabe en qué zona horaria estás. El primer\n  // render tiene que pintar «Calculando tu hora local…», como hizo él, y\n  // la hora local tiene que aparecer después.\n  const hora = horaLocal()\n\n  return (\n    <section>\n      <h1>Salida a las islas Cíes</h1>\n      <p>Sábado 14 de noviembre a las 10:00, hora peninsular española</p>\n      <p>En tu hora local: {hora}</p>\n      <p>Plazas libres: {plazas}</p>\n      <button onClick={() => setPlazas(plazas - 1)} disabled={plazas === 0}>\n        Reservar plaza\n      </button>\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import Simulador from './Simulador'\nimport SalidaCies from './SalidaCies'\nimport './estilos.css'\n\n// Lo que manda el servidor. No sabe en qué zona horaria estás, así que en el\n// sitio de la hora local deja «Calculando tu hora local…».\nconst HTML_DEL_SERVIDOR =\n  '<section><h1>Salida a las islas Cíes</h1><p>Sábado 14 de noviembre a las 10:00, hora peninsular española</p><p>Calculando tu hora local…</p><p>Plazas libres: <!-- -->8</p><button>Reservar plaza</button></section>'\n\nexport default function App() {\n  return (\n    <Simulador htmlDelServidor={HTML_DEL_SERVIDOR}>\n      <SalidaCies />\n    </Simulador>\n  )\n}\n"
    },
    {
      "nombre": "Simulador.jsx",
      "codigo": "import { useEffect, useLayoutEffect, useRef, useState } from 'react'\nimport { hydrateRoot } from 'react-dom/client'\n\n// Imita lo que pasa en el navegador cuando una página viene del servidor:\n// 1. Llega el HTML y se pinta tal cual, todavía sin JavaScript.\n// 2. Al pulsar «Hidratar» «llega el JavaScript» y se llama a hydrateRoot.\n// No hace falta que lo leas entero: lo interesante está en los otros archivos.\n\nconst SIN_JS = 'Solo HTML: el JavaScript todavía no ha llegado'\n\nfunction AvisarAlTerminar({ alTerminar, children }) {\n  useEffect(() => {\n    alTerminar()\n  }, [alTerminar])\n  return children\n}\n\nexport default function Simulador({ htmlDelServidor, children }) {\n  const pagina = useRef(null)\n  const raiz = useRef(null)\n  const [estado, setEstado] = useState(SIN_JS)\n\n  useLayoutEffect(() => {\n    pagina.current.innerHTML = htmlDelServidor\n  }, [htmlDelServidor])\n\n  useEffect(() => {\n    return () => {\n      const anterior = raiz.current\n      if (anterior) setTimeout(() => anterior.unmount())\n    }\n  }, [])\n\n  function hidratar() {\n    const errores = []\n    setEstado('Hidratando…')\n    const alTerminar = () =>\n      setEstado(errores.length === 0 ? 'Hidratación sin errores' : 'La hidratación ha fallado: mira la consola')\n    raiz.current = hydrateRoot(\n      pagina.current,\n      <AvisarAlTerminar alTerminar={alTerminar}>{children}</AvisarAlTerminar>,\n      {\n        onRecoverableError(error) {\n          errores.push(error)\n          console.error(error.message)\n        },\n      },\n    )\n  }\n\n  return (\n    <div className=\"simulador\">\n      <p className=\"rotulo\">Página recibida del servidor</p>\n      <div className=\"pagina\" ref={pagina} />\n      <div className=\"mandos\">\n        <button onClick={hidratar} disabled={estado !== SIN_JS}>\n          Hidratar\n        </button>\n        <p role=\"status\">{estado}</p>\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": ".simulador {\n  display: grid;\n  gap: 0.5rem;\n  font-family: system-ui, sans-serif;\n}\n\n.rotulo {\n  margin: 0;\n  color: #475569;\n  font-size: 0.85rem;\n}\n\n/* La ventana donde se pinta el HTML que mandó el servidor */\n.pagina {\n  padding: 0.75rem 1rem;\n  border: 2px dashed #0e7490;\n  border-radius: 10px;\n  background: #f0f9ff;\n}\n\n.pagina h1 {\n  margin-top: 0;\n  font-size: 1.2rem;\n}\n\n.mandos {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n.mandos p {\n  margin: 0;\n  color: #334155;\n}\n\nbutton {\n  padding: 0.35rem 0.75rem;\n  border: 2px solid #0e7490;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  opacity: 0.6;\n  cursor: default;\n}\n"
    }
  ],
  "archivoInicial": "SalidaCies.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Al pulsar «Hidratar», React adopta el HTML del servidor sin encontrar diferencias",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Hidratar"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Hidratación sin errores"
      }
    },
    {
      "descripcion": "Después de hidratar, «Calculando tu hora local…» deja paso a la hora local",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Hidratar"
          }
        }
      ],
      "espera": {
        "ausente": {
          "texto": "Calculando tu hora local…"
        }
      }
    },
    {
      "descripcion": "Después de hidratar, «Reservar plaza» descuenta una plaza",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Hidratar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar plaza"
          }
        }
      ],
      "espera": {
        "texto": "Plazas libres: 7"
      }
    }
  ]
}
```

Si lo has resuelto con `useSyncExternalStore`, `suscribirse` no tiene nada que vigilar, porque la zona horaria no cambia mientras miras la página: devuelve una función de limpieza vacía. Lo que trabaja es el tercer argumento, que devuelve `null` en el servidor y al hidratar. Con estado y efecto también pasa las comprobaciones, a costa del render de más que viste arriba.

Una prueba más, para ver los límites de `suppressHydrationWarning`. Ponlo en el párrafo de la hora del código inicial: la hidratación sigue fallando, porque el servidor dejó un solo texto y el cliente pinta dos, lo fijo y la hora, y esa diferencia de estructura no se puede silenciar. Ahora déjalo en un solo texto, con `` {`En tu hora local: ${hora}`} ``: la hidratación pasa, pero «Calculando tu hora local…» se queda en la página y la segunda comprobación falla. Callar el aviso no es arreglar la diferencia.

**Retos para seguir practicando** (sin comprobación automática):

1. Abre las herramientas de desarrollo en la vista previa del ejercicio resuelto y mira el párrafo de las plazas después de hidratar: el `<!-- -->` del servidor sigue ahí. Haz que la hidratación falle otra vez y vuelve a mirarlo. ¿Por qué ha desaparecido?
2. En el ejercicio, convierte la hora local en un componente propio, `HoraLocal`, que use `use(browser())` dentro de un `<Suspense>`. Escribe a mano el HTML que generaría el servidor para él, con la marca `<!--$!-->` de la sección de `browser`, y comprueba con el simulador que la hidratación sale limpia.
3. Monta un servidor de verdad: un proyecto de Node con `react`, `react-dom` y el servidor de esta lección, compilado con Vite en modo SSR. Haz que una parte de la página tarde dos segundos con `use` y una promesa, y mira en la pestaña Red cómo llegan los trozos.
4. Crea un proyecto con React Router en modo framework (`npx create-react-router@latest`, el punto de partida del proyecto 98), mete `new Date().toLocaleTimeString()` en una ruta y lee en la consola del navegador el error de hidratación.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Server React DOM APIs",
      "descripcion": "El índice de react-dom/server: las APIs para Node, para Web Streams y las heredadas, con enlace a cada una.",
      "url": "https://react.dev/reference/react-dom/server",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "hydrateRoot",
      "descripcion": "La referencia completa: opciones, causas de los errores de hidratación, suppressHydrationWarning y cómo pintar contenido distinto en servidor y cliente.",
      "url": "https://react.dev/reference/react-dom/client/hydrateRoot",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "browser",
      "descripcion": "La API de 19.3 para lo que solo existe en el navegador: use(browser()), sus reglas, onBrowserBailout y cómo abortar un render lento.",
      "url": "https://react.dev/reference/react-dom/browser",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "renderToPipeableStream",
      "descripcion": "Streaming en Node paso a paso: el shell, los errores dentro y fuera de él, el código de estado y cómo esperar a todo para los robots.",
      "url": "https://react.dev/reference/react-dom/server/renderToPipeableStream",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "prerender",
      "descripcion": "Generar HTML estático en el build esperando a todos los Suspense, y cómo cortarlo para el prerenderizado parcial.",
      "url": "https://react.dev/reference/react-dom/static/prerender",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "New Suspense SSR Architecture in React 18",
      "descripcion": "El artículo del grupo de trabajo de React que explica, con dibujos, el streaming de HTML y la hidratación selectiva.",
      "url": "https://github.com/reactwg/react-18/discussions/37",
      "etiqueta": "GitHub"
    }
  ]
}
```
