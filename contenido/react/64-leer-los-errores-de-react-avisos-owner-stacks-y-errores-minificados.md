# Leer los errores de React: avisos, *owner stacks* y errores minificados

- **Módulo:** Depurar, medir y optimizar
- **Slug:** `leer-los-errores-de-react-avisos-owner-stacks-y-errores-minificados` (autogenerado del título)
- **Orden:** 640
- **Fuentes:** [captureOwnerStack](https://react.dev/reference/react/captureOwnerStack) + [Rules of React](https://react.dev/reference/rules) + [Minified error #31](https://react.dev/errors/31) — ver `contenido/react/TEMARIO.md` #64

---

## Qué es y para qué sirve

Mientras desarrollas, React vigila tu código: hace cientos de comprobaciones que en producción no existen y, cuando algo no encaja, **te lo dice en la consola**. A lo largo del temario has visto una treintena de esos mensajes, cada uno en su lección: la `key` que falta, el objeto que no se puede pintar, el campo que no deja escribir.

Esta lección no añade mensajes nuevos: te da **un método para leerlos todos**. Con él responderás a cuatro preguntas cada vez que la consola se ponga roja:

1. **¿Se ha roto algo o es un aviso?** No es lo mismo un mensaje que deja la app funcionando que uno que la tumba.
2. **¿Qué dice exactamente?** Qué regla se ha incumplido, qué componente o qué prop nombra, qué propone y adónde enlaza.
3. **¿Dónde está el fallo?** Para eso React te da dos pilas: la **pila de componentes** (dónde estaba lo que falló) y la **pila de owners** (quién escribió el JSX que lo creó), que puedes leer con `captureOwnerStack`.
4. **¿Y si sale en producción?** Ahí el mensaje llega minificado, como «Minified React error #31», y hay que descifrarlo.

Al final tienes una lista de los avisos y errores más frecuentes, cada uno con su causa, su arreglo y la lección donde se explicó.

## Aviso o error: ¿se ha roto algo?

React habla de dos maneras muy distintas:

- **Un aviso** es una llamada a `console.error` que React hace en desarrollo. Sale en rojo, como un error, pero **React sigue renderizando**: la interfaz aparece, quizá con un fallo sutil o con uno que llegará más tarde.
- **Un error** es una excepción que se lanza mientras React renderiza. React no puede terminar ese render y, si nadie captura el error (con un *error boundary*, lección 53), **quita la app entera** del contenedor.

En la Floristería Azahar, la lista de ramos olvida la `key` y el resumen intenta pintar un objeto entero. Lo primero es un aviso; lo segundo, un error:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un aviso al cargar y un error al pulsar",
  "consigna": "Mira la consola: hay un aviso, y aun así la lista se ve bien. Pulsa «Ver resumen»: la app desaparece y debajo de la vista previa aparece el error. Arregla el error primero (pinta {pedido.ramos} y {pedido.total} en vez del objeto) y después el aviso (key={ramo.id}).",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst RAMOS = [\n  { id: 'r1', nombre: 'Ramo de paniculata', precio: 18 },\n  { id: 'r2', nombre: 'Centro de peonías', precio: 16 },\n]\n\nfunction ListaRamos() {\n  return (\n    <ul>\n      {RAMOS.map((ramo) => (\n        <li>\n          {ramo.nombre}: {ramo.precio} €\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nfunction Resumen() {\n  const pedido = { ramos: RAMOS.length, total: 34 }\n  return <p>Resumen: {pedido}</p>\n}\n\nexport default function App() {\n  const [verResumen, setVerResumen] = useState(false)\n\n  return (\n    <main>\n      <h1>Floristería Azahar</h1>\n      <ListaRamos />\n      <button onClick={() => setVerResumen(true)}>Ver resumen</button>\n      {verResumen && <Resumen />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 20rem;\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0;\n  font-size: 1.1rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

Al cargar, la consola muestra:

```text
Each child in a list should have a unique "key" prop.

Check the render method of `ListaRamos`. See https://react.dev/link/warning-keys for more information.
```

Y al pulsar «Ver resumen», debajo de la vista previa:

```text
Error al renderizar: Objects are not valid as a React child (found: object with keys {ramos, total}). If you meant to render a collection of children, use an array instead.
```

El primero es un aviso: la lista se pinta y nadie notaría nada hasta que los ramos se reordenaran (lección 11). El segundo es un error: el render de `Resumen` no puede terminar y la interfaz entera se va. **Un aviso te dice que algo está mal hecho; un error, que algo ha dejado de funcionar.** Los dos se arreglan, pero el error primero.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Tres formas en que React te habla",
  "roles": [
    {
      "etiqueta": "Aviso",
      "rol": "console.error en desarrollo",
      "descripcion": "La app sigue funcionando. Suele salir una sola vez por sesión, aunque el problema se repita en cada render. En producción no existe."
    },
    {
      "etiqueta": "Error",
      "rol": "Una excepción durante el render",
      "descripcion": "React no puede terminar de pintar. Sin un error boundary, desmonta la app entera. Sale en desarrollo y en producción."
    },
    {
      "etiqueta": "Error minificado",
      "rol": "El mismo error, en producción",
      "descripcion": "Sin el texto completo: un número y un enlace a react.dev que lo reconstruye. Lo verás al final de la lección."
    }
  ]
}
```

Dos detalles que confunden al principio.

**El color no dice la gravedad.** Un aviso sale en rojo porque React usa `console.error`. Y al revés: cuando un error tumba la app en un proyecto real (sin las opciones de `createRoot` de la lección 3), React añade en la consola un mensaje en **amarillo**, con `console.warn`, que nombra el elemento más cercano a donde ocurrió:

```text
An error occurred in the <p> component.

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://react.dev/link/error-boundaries to learn more about error boundaries.
```

Es decir: «ha ocurrido un error en el componente `<p>`; plantéate añadir un *error boundary*». Aquí `<p>` es el párrafo de `Resumen` donde estaba el objeto: el mensaje no siempre nombra a tu componente, a veces nombra la etiqueta HTML que había dentro.

**En esta web, los errores van debajo de la vista previa y los avisos, en la consola.** La vista previa monta tu app con un `onUncaughtError` propio (lo viste en la lección 3), así que los errores sin capturar no pasan por la consola: aparecen en el recuadro rojo «Error al renderizar». Los errores dentro de un manejador de eventos salen en ese mismo recuadro, empezando por «Error: Uncaught».

Hay una tercera fuente de mensajes que no es React en marcha: **el linter** (`eslint-plugin-react-hooks`), que marca problemas en el editor antes de ejecutar nada, como el «Cannot access refs during render» de la lección 33. Sus reglas tienen su propia lección, la 70.

## Cómo se lee un mensaje de React

Casi todos los mensajes de React siguen el mismo patrón. Este panel de repartos tiene tres fallos típicos; la consola los cuenta en cuanto carga:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Tres fallos, tres mensajes",
  "codigo": "const PEDIDOS = [\n  { id: 'p-101', cliente: 'Marta', ramo: 'Peonías', hora: '10:30' },\n  { id: 'p-102', cliente: 'Íñigo', ramo: 'Paniculata', hora: '12:00' },\n  { id: 'p-103', cliente: 'Rocío', ramo: 'Tulipanes', hora: '17:15' },\n]\n\nfunction ListaPedidos() {\n  return (\n    <ul>\n      {PEDIDOS.map((pedido) => (\n        <li>\n          {pedido.hora} · {pedido.cliente}: {pedido.ramo}\n        </li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Repartos de hoy</h1>\n      <label for=\"repartidor\">Repartidor</label>\n      <input id=\"repartidor\" />\n      <ListaPedidos />\n      <button onclick={() => console.log('Ruta impresa')}>Imprimir ruta</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}",
  "anotaciones": [
    {
      "fragmento": "<label for=\"repartidor\">",
      "nota": "En JSX el atributo es htmlFor. El primer aviso de la consola nombra la prop equivocada, for, y propone la buena con un «Did you mean». Fíjate en que la etiqueta sigue funcionando: React escribe el atributo igualmente. Un aviso no siempre rompe algo hoy."
    },
    {
      "fragmento": "<li>",
      "nota": "Falta la key. El aviso no puede señalar la línea, así que nombra el componente cuyo JSX hay que revisar, ListaPedidos, con la frase «Check the render method of». Ahí está el map."
    },
    {
      "fragmento": "onclick={() => console.log('Ruta impresa')}",
      "nota": "Los eventos van en camelCase. Pulsa «Imprimir ruta»: no pasa nada, porque React no conoce onclick y no lo conecta. El tercer aviso lo dice y propone el arreglo: onClick."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

Los tres mensajes, tal como salen:

```text
Invalid DOM property `for`. Did you mean `htmlFor`?
Each child in a list should have a unique "key" prop.

Check the render method of `ListaPedidos`. See https://react.dev/link/warning-keys for more information.
Invalid event handler property `onclick`. Did you mean `onClick`?
```

Léelos por partes:

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Las cuatro partes de un mensaje de React",
  "items": [
    {
      "titulo": "1. La regla que has incumplido",
      "texto": "La primera frase: «Invalid DOM property», «Each child in a list should have a unique key prop», «Invalid event handler property». Es la parte fija del mensaje, la que es igual para todo el mundo, y la que conviene buscar si no la reconoces."
    },
    {
      "titulo": "2. Lo tuyo: nombres y valores",
      "texto": "Casi siempre entre comillas invertidas: el nombre de la prop (for, onclick) o del componente (ListaPedidos). A veces es el valor que ha llegado, como el «object with keys {ramos, total}» del error de antes. Es lo que buscas en tu código: React no sabe en qué línea está el fallo, pero sí cómo se llama."
    },
    {
      "titulo": "3. La pista",
      "texto": "«Did you mean htmlFor?», «Check the render method of ListaPedidos», «use an array instead». Muchas veces es el arreglo literal. Lo de «render method» es herencia de los componentes de clase (lección 91): hoy quiere decir «revisa el JSX que devuelve ese componente»."
    },
    {
      "titulo": "4. El enlace",
      "texto": "Las direcciones react.dev/link/... son atajos que redirigen a la página de la documentación que lo explica: warning-keys lleva a la sección de key de Rendering Lists, error-boundaries a la de error boundaries de Component. Ábrelo cuando la pista no te baste."
    }
  ]
}
```

Un detalle de cómo se fabrican: React no escribe el mensaje entero, sino que llama a `console.error` con **una plantilla y los datos aparte**. El primer aviso de arriba sale de esta llamada (capturada con React 19.3.1):

```js
console.error('Invalid DOM property `%s`. Did you mean `%s`?', 'for', 'htmlFor')
```

La consola del navegador, y la de esta web, sustituyen cada `%s` por el dato siguiente. Eso tiene dos consecuencias prácticas:

- **Para buscar un mensaje, quita tus nombres** y busca la parte fija: «Invalid DOM property Did you mean». Con «ListaPedidos» dentro no lo encontrará nadie.
- **Si interceptas `console.error`** (para mandar los avisos a un registro, o en un test), recibirás la plantilla con los `%s` y los valores como argumentos sueltos, no la frase montada.

Y uno de comportamiento, comprobado en la vista previa: **React suele avisar una sola vez** por cada problema, aunque se repita en cada render. Si el aviso ya no sale después de tocar el código, no des por hecho que lo has arreglado: recarga y mira si vuelve.

## Dónde estaba lo que falló: la pila de componentes

Cuando el mensaje no basta para encontrar el sitio, React acompaña cada error de una **pila de componentes** (*component stack*): la cadena de componentes y elementos HTML que había desde el que falló hasta la raíz, de dentro afuera. La recibes en `errorInfo.componentStack` en las opciones de `createRoot` (lección 3) y en el método `componentDidCatch` de un error boundary (lección 53).

Aquí, el precio del envío lanza un error si el código postal no tiene cinco cifras. Un error boundary lo captura y escribe su pila en la consola:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un error capturado y su pila de componentes",
  "consigna": "Pulsa «Enviar a 28O12» (con una letra O en medio). El error boundary enseña su aviso en lugar del pedido, y la consola muestra dos cosas: el mensaje que React escribe cuando un boundary captura un error y la pila de componentes. Léela de arriba abajo: ¿qué componentes no escribiste tú?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { Component, useState } from 'react'\nimport './estilos.css'\n\nclass LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  componentDidCatch(error, info) {\n    console.log('Pila de componentes:' + info.componentStack)\n  }\n\n  render() {\n    if (this.state.error) {\n      return <p role=\"alert\">No hemos podido calcular el envío.</p>\n    }\n    return this.props.children\n  }\n}\n\nfunction PrecioEnvio({ codigoPostal }) {\n  if (!/^\\d{5}$/.test(codigoPostal)) {\n    throw new Error(`Código postal no válido: «${codigoPostal}»`)\n  }\n  return <p>Envío a {codigoPostal}: 4,90 €</p>\n}\n\nfunction Tarjeta({ children }) {\n  return <section className=\"tarjeta\">{children}</section>\n}\n\nfunction ResumenPedido() {\n  const [codigoPostal, setCodigoPostal] = useState('28012')\n\n  return (\n    <Tarjeta>\n      <h2>Tu pedido</h2>\n      <p>Ramo de paniculata: 18 €</p>\n      <PrecioEnvio codigoPostal={codigoPostal} />\n      <button onClick={() => setCodigoPostal('28O12')}>\n        Enviar a 28O12\n      </button>\n    </Tarjeta>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Floristería Azahar</h1>\n      <LimiteDeError>\n        <ResumenPedido />\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 20rem;\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0;\n  font-size: 1.1rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

La consola muestra primero el mensaje de React para los errores capturados (el error, el componente donde ocurrió y el boundary que se encarga):

```text
Código postal no válido: «28O12»

The above error occurred in the <PrecioEnvio> component.

React will try to recreate this component tree from scratch using the error boundary you provided, LimiteDeError.
```

Es decir: «el error de arriba ocurrió en el componente `<PrecioEnvio>`; React intentará reconstruir este árbol desde cero con el error boundary que has puesto, `LimiteDeError`». Y después, la pila:

```text
Pila de componentes:
    at PrecioEnvio (App.jsx:25:24)
    at section (<anonymous>)
    at Tarjeta (App.jsx:32:20)
    at ResumenPedido (App.jsx:37:59)
    at LimiteDeError (App.jsx:6:70)
    at main (<anonymous>)
    at App (<anonymous>)
```

Cada línea es **un nivel del árbol**, empezando por el que falló: `PrecioEnvio` estaba dentro de un `section`, que estaba dentro de `Tarjeta`, dentro de `ResumenPedido`... Los elementos HTML (`section`, `main`) salen sin archivo, como `<anonymous>`; tus componentes llevan el archivo y dos números, línea y columna.

Esos números, en esta vista previa, **no coinciden con los del editor**: tu código se transforma y se envuelve antes de ejecutarse, y las líneas salen desplazadas. Úsalos como orientación y quédate con los nombres. En tu proyecto, la consola del navegador los traduce a tu archivo original gracias a los *source maps*, como recuerda la propia documentación de React.

La pila de componentes responde a «¿dónde estaba?». Pero fíjate en `Tarjeta`: está en la pila y no tiene nada que ver con el fallo. Solo envuelve lo que le pasan. Para «¿quién lo puso ahí?» hace falta otra pila.

## La pila de owners: quién escribió el JSX

El **owner** (propietario) de un elemento es **el componente en cuyo código se escribió ese JSX**. No siempre coincide con el padre en el árbol:

- El **padre** es quien lo contiene al renderizar. `Tarjeta` es el padre de todo lo que recibe como `children`.
- El **owner** es quien lo creó. Si `Escaparate` escribe `<Tarjeta><Precio euros={18} /></Tarjeta>`, el owner de `Precio` es `Escaparate`, aunque en el árbol cuelgue de `Tarjeta`.

¿Por qué importa? Porque **el owner es quien decidió las props**. Si `Precio` recibe un dato malo, el culpable está en `Escaparate`, que lo escribió, y no en `Tarjeta`, que solo lo dejó pasar. La **pila de owners** (*owner stack*) recorre esa cadena de creadores: llegó en React 19.1 y es solo de desarrollo.

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Padre y owner de Precio",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0,
      "nota": "escribe <Escaparate />"
    },
    {
      "nombre": "Escaparate",
      "nivel": 1,
      "etiqueta": "owner de Precio",
      "nota": "escribe <Tarjeta> y, dentro, <Precio euros={18} />"
    },
    {
      "nombre": "Tarjeta",
      "nivel": 2,
      "etiqueta": "padre de Precio",
      "nota": "solo pinta {children}: no crea a Precio"
    },
    {
      "nombre": "Precio",
      "nivel": 3
    }
  ]
}
```

Puedes leer la pila de owners desde tu código con **`captureOwnerStack`**, que se importa de `react` y devuelve una cadena de texto. Aquí `Precio` la escribe en la consola al montarse:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "¿Quién creó a Precio?",
  "consigna": "Mira la consola: la pila de owners de Precio nombra a Escaparate y a App, pero no a Tarjeta. Este bloque tiene StrictMode apagado para que el efecto se ejecute una sola vez. Después añade un segundo <Precio euros={9} /> en App, justo debajo de <Escaparate />, y compara las dos pilas.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { captureOwnerStack, useEffect } from 'react'\nimport './estilos.css'\n\nfunction Precio({ euros }) {\n  useEffect(() => {\n    console.log('Owner stack de Precio:' + captureOwnerStack())\n  }, [])\n\n  return <p className=\"precio\">{euros} €</p>\n}\n\nfunction Tarjeta({ titulo, children }) {\n  return (\n    <article className=\"tarjeta\">\n      <h2>{titulo}</h2>\n      {children}\n    </article>\n  )\n}\n\nfunction Escaparate() {\n  return (\n    <section>\n      <Tarjeta titulo=\"Ramo de paniculata\">\n        <Precio euros={18} />\n      </Tarjeta>\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Floristería Azahar</h1>\n      <Escaparate />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 20rem;\n  padding: 0.5rem 1rem 1rem;\n  border: 1px solid #d6d3d1;\n  border-radius: 8px;\n}\n\n.tarjeta h2 {\n  margin: 0.25rem 0;\n  font-size: 1.1rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": false,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

La consola dice:

```text
Owner stack de Precio:
    at Escaparate (App.jsx:27:31)
    at App (App.jsx:37:31)
```

Cada línea se lee como **«en este componente, en esta línea, se escribió el JSX del de arriba»**: en `Escaparate` se escribió `<Precio />`, y en `App` se escribió `<Escaparate />`. Faltan tres cosas, a propósito:

- **`Tarjeta`**, porque no creó a `Precio`: solo lo recibió como `children` y lo colocó.
- **Los elementos HTML** (`main`, `section`, `article`), por lo mismo.
- **`Precio`**, porque es quien está ejecutando el código: ya sabes dónde estás.

Comparada con la pila de componentes, la de owners es más corta y apunta a **las líneas donde se decidieron las props**, que es donde suele estar el arreglo.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { captureOwnerStack } from 'react'\n\nfunction BotonCesta({ unidades }) {\n  console.log(captureOwnerStack())\n  return <button>Cesta ({unidades})</button>\n}\n\nfunction BarraSuperior({ children }) {\n  return <nav aria-label=\"Tienda\">{children}</nav>\n}\n\nfunction Cabecera() {\n  return (\n    <BarraSuperior>\n      <BotonCesta unidades={2} />\n    </BarraSuperior>\n  )\n}\n\nexport default function App() {\n  return (\n    <header>\n      <Cabecera />\n    </header>\n  )\n}",
  "opciones": [
    "Cabecera y App",
    "BarraSuperior, Cabecera y App",
    "nav, BarraSuperior, Cabecera, header y App",
    "Solo BarraSuperior, que es su padre"
  ],
  "correcta": 0,
  "explicacion": "BotonCesta se escribió en el JSX de Cabecera, y Cabecera en el de App: esos son sus owners. BarraSuperior es su padre en el árbol, pero solo pinta children, así que no aparece; tampoco las etiquetas nav y header. La consola dice «at Cabecera (App.jsx:…)» y «at App (App.jsx:…)»."
}
```

## `captureOwnerStack` en tu código

`captureOwnerStack()` no recibe argumentos y devuelve la pila de owners **del componente que React está procesando en ese momento**, o `null` si no hay ninguno. Comprobado con 19.3.1, funciona en estos sitios:

- **Durante el render** y **en los efectos** de un componente: devuelve sus owners.
- **En un manejador de eventos de React** (`onClick`...): la pila empieza por el elemento que recibió el evento, por ejemplo `at button`, seguido del componente que lo escribió.
- **En las opciones de errores de `createRoot`** (`onCaughtError`, `onUncaughtError`, `onRecoverableError`): devuelve los owners del componente que lanzó el error.

Y devuelve **`null`** fuera de todo eso: dentro de un `setTimeout`, después de un `await`, en un escuchador puesto con `addEventListener`. Si lo necesitas ahí, captúralo antes (en el efecto) y guárdalo. Desde 19.3, además, la pila se corta a 10 niveles.

### Ponerle la pila a cada aviso

El uso que propone la documentación es **enriquecer los avisos**: envolver `console.error` y, en cada llamada, añadir la pila de owners. Como React llama a `console.error` mientras procesa el componente que tiene el problema, `captureOwnerStack` te dice quién lo creó:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La pila de owners junto a cada aviso",
  "consigna": "Mira la consola: después del aviso de la key sale su pila de owners, que va del li hasta App pasando por la función del map. Añade un segundo aviso (por ejemplo, cambia el className del ul por class) y comprueba que también llega con su pila. Al terminar, recuerda que esto es solo para desarrollo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { captureOwnerStack } from 'react'\n\nconst errorOriginal = console.error\nconsole.error = (...args) => {\n  errorOriginal(...args)\n  const pila = captureOwnerStack()\n  if (pila) console.info('Owner stack del aviso anterior:' + pila)\n}\n\nconst RAMOS = ['Paniculata', 'Peonías', 'Tulipanes']\n\nfunction ListaRamos() {\n  return (\n    <ul className=\"ramos\">\n      {RAMOS.map((ramo) => (\n        <li>{ramo}</li>\n      ))}\n    </ul>\n  )\n}\n\nfunction Escaparate() {\n  return (\n    <section>\n      <h2>Ramos de temporada</h2>\n      <ListaRamos />\n    </section>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Floristería Azahar</h1>\n      <Escaparate />\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

El aviso llega seguido de esto:

```text
Owner stack del aviso anterior:
    at li (<anonymous>)
    at eval (App.jsx:18:31)
    at Array.map (<anonymous>)
    at ListaRamos (App.jsx:17:13)
    at Escaparate (App.jsx:28:31)
    at App (App.jsx:37:31)
```

El `li` sin `key` lo creó la función flecha del `map` (aquí sale como `eval`, por cómo ejecuta tu código esta vista previa), que está dentro de `ListaRamos`, que escribió `Escaparate`, que escribió `App`. Es la misma información que la pista «Check the render method of `ListaRamos`», pero con el camino completo.

En Chrome y en Edge tienes algo parecido sin escribir nada: al desplegar un aviso de React en la consola del navegador, su traza de llamadas incluye separadores con el nombre de cada elemento (`<li>`, `<ListaRamos>`, `<Escaparate>`...) y, debajo de cada uno, la función y la línea donde se creó. React se lo prepara al navegador en desarrollo con `console.createTask`, una función de la consola de Chrome.

### En las opciones de `createRoot`

En tu proyecto puedes juntar las dos pilas en un solo sitio, el `main.jsx`, para todos los errores de la app:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import * as React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\n\nfunction informar(tipo, error, errorInfo) {\n  console.log(`${tipo}: ${error.message}`)\n  console.log('Pila de componentes:' + errorInfo.componentStack)\n  if (import.meta.env.DEV) {\n    console.log('Pila de owners:' + React.captureOwnerStack())\n  }\n}\n\ncreateRoot(document.getElementById('root'), {\n  onCaughtError: (error, errorInfo) => {\n    informar('Capturado', error, errorInfo)\n  },\n  onUncaughtError: (error, errorInfo) => {\n    informar('Sin capturar', error, errorInfo)\n  },\n}).render(<App />)",
  "anotaciones": [
    {
      "fragmento": "import * as React from 'react'",
      "nota": "Importación de espacio de nombres a propósito: captureOwnerStack solo existe en el build de desarrollo. En producción React.captureOwnerStack es undefined (comprobado con 19.3.1), y con un import con nombre la llamada fallaría con un TypeError."
    },
    {
      "fragmento": "errorInfo.componentStack",
      "nota": "La pila de componentes: existe en desarrollo y en producción. Es la que mandarías a un servicio de registro de errores."
    },
    {
      "fragmento": "import.meta.env.DEV",
      "nota": "La marca de Vite para el modo desarrollo: true con npm run dev y false en el build. Las variables de entorno de Vite las verás en la lección 85."
    },
    {
      "fragmento": "React.captureOwnerStack()",
      "nota": "Dentro de onCaughtError y onUncaughtError devuelve los owners del componente que lanzó el error. Ojo: dentro del componentDidCatch de un boundary devolvería los owners del propio boundary."
    },
    {
      "fragmento": "onCaughtError",
      "nota": "Errores que ha capturado un error boundary. Al pasarla, React deja de escribir por su cuenta el mensaje «The above error occurred in…»: decides tú qué se registra."
    },
    {
      "fragmento": "onUncaughtError",
      "nota": "Errores que nadie capturó y que han desmontado la app. Igual que antes: React deja de escribirlos por su cuenta."
    }
  ]
}
```

Con el `App.jsx` de la floristería del apartado anterior y este `main.jsx`, al pulsar «Enviar a 28O12» la consola muestra (comprobado con React 19.3.1 en Chrome, montado igual que en esta vista previa; por eso los números salen desplazados como antes):

```text
Capturado: Código postal no válido: «28O12»
Pila de componentes:
    at PrecioEnvio (App.jsx:25:24)
    at section (<anonymous>)
    at Tarjeta (App.jsx:32:20)
    at ResumenPedido (App.jsx:37:59)
    at LimiteDeError (App.jsx:6:70)
    at main (<anonymous>)
    at App (<anonymous>)
Pila de owners:
    at ResumenPedido (App.jsx:43:31)
    at App (App.jsx:56:31)
```

Dos pilas para el mismo error: **la de componentes dice dónde estaba `PrecioEnvio`; la de owners, quién escribió `<PrecioEnvio codigoPostal={codigoPostal} />`**. Y es en `ResumenPedido` donde se decide que el código postal pueda valer «28O12».

## En producción: «Minified React error #31»

`npm run build` usa el build de producción de React, que pesa menos porque **no lleva los textos de los mensajes**. Los avisos desaparecen del todo (no se comprueba nada), y los errores llegan como un número. El objeto del resumen, en una build de producción de React 19.3.1, da esto:

```text
Minified React error #31; visit https://react.dev/errors/31?args[]=object%20with%20keys%20%7Bramos%2C%20total%7D for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
```

Es decir: «error de React minificado n.º 31; visita esta dirección para leer el mensaje completo, o usa el entorno de desarrollo, sin minificar, para ver los errores completos y los avisos». Las piezas:

- **`#31`** es el código del mensaje. Cada error de React tiene el suyo, siempre el mismo.
- **`https://react.dev/errors/31`** es la página que guarda el texto de ese código.
- **`?args[]=…`** son los datos que irían en cada `%s`, codificados para la URL: `object%20with%20keys%20%7Bramos%2C%20total%7D` es «object with keys {ramos, total}». Si el mensaje tiene varios huecos, verás varios `&args[]=`.

Abre el enlace completo y la página reconstruye el mensaje con tus datos:

```text
The full text of the error you just encountered is:

Objects are not valid as a React child (found: object with keys {ramos, total}). If you meant to render a collection of children, use an array instead.
```

En producción la pila de componentes sigue existiendo, pero con los **nombres minificados**. La misma build daba esto en `errorInfo.componentStack`:

```text
    at p (<anonymous>)
    at KS (<anonymous>)
    at main (<anonymous>)
    at JS (<anonymous>)
```

`KS` era `ResumenPedido` y `JS`, `App`: el minificador acorta los nombres de las funciones. Las etiquetas HTML conservan el suyo. Para traducirlos, un servicio de registro de errores usa los *source maps* de tu build, igual que con cualquier traza de JavaScript.

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Qué hacer con un error minificado",
  "items": [
    {
      "titulo": "Abre el enlace, no lo pegues en un buscador",
      "texto": "La página de react.dev rellena el mensaje con los args[] de la URL. Copiando solo «Minified React error #31» pierdes los datos concretos."
    },
    {
      "titulo": "Reprodúcelo en desarrollo",
      "texto": "Con npm run dev tendrás el mensaje completo, los avisos que llevaron hasta ahí y la pila de owners. Algunos mensajes de desarrollo traen además una pista que el de producción no tiene: el #130 de producción no incluye el «You likely forgot to export your component» de la lección 4."
    },
    {
      "titulo": "Prueba la build antes de publicar",
      "texto": "npm run build y después npm run preview (lección 2) sirven la versión de producción en tu equipo. Es donde verías estos mensajes antes que tus usuarios."
    },
    {
      "titulo": "En producción no hay captureOwnerStack",
      "texto": "Ni la función existe. Lo que sí tienes es errorInfo.componentStack en onCaughtError y onUncaughtError: guárdalo en tu registro de errores junto al mensaje."
    }
  ]
}
```

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "// Lo que te llega de producción:\n// Minified React error #130; visit\n// https://react.dev/errors/130?args[]=undefined&args[]=\n// for the full message or use the non-minified dev environment\n// for full errors and additional helpful warnings.\n\n// ¿Qué es lo más probable que haya en el código?",
  "opciones": [
    "Un componente importado que no existe, por ejemplo un import con nombre de algo que se exporta por defecto",
    "Un objeto pintado entero dentro del JSX",
    "Un set de estado llamado durante el render",
    "Una lista sin key"
  ],
  "correcta": 0,
  "explicacion": "El #130 es «Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.»: el primer args[] dice que el tipo del elemento era undefined. Es lo que pasa al importar algo que el archivo no exporta (lección 4). Una lista sin key no daría nada: en producción no hay avisos."
}
```

## Los avisos y errores que más verás

Esta es la lista de referencia, con los mensajes que ya conoces del temario. Cada uno lleva su clase (**aviso** o **error**), la causa más habitual, el arreglo y la lección donde se explicó a fondo. Están por el principio de su texto: es lo que verás en la consola.

**Al escribir JSX**

- «The tag <sello> is unrecognized in this browser» — **aviso**. Un componente con el nombre en minúscula: React lo trata como etiqueta HTML. Ponle mayúscula. Lección 3.
- «<tarjetaTren /> is using incorrect casing» — **aviso**. El mismo despiste con una mayúscula en medio. Lección 7.
- «Element type is invalid: expected a string … but got: undefined» — **error** (#130). Importas algo que el archivo no exporta: un import con nombre de un export por defecto, o al revés. Lección 4.
- «Invalid DOM property `class`. Did you mean `className`?», y sus parientes `for` y `readonly` — **aviso**. Atributos con su nombre de JSX. Lección 5.
- «The `style` prop expects a mapping from style properties to values, not a string» — **error**. `style` recibe un objeto: `style={{ color: 'red' }}`. Lección 5.
- «Objects are not valid as a React child (found: object with keys {…})» — **error** (#31). Pintas un objeto entero: pinta sus campos. Lecciones 6 y 9.
- «Functions are not valid as a React child» — **aviso**. Escribiste `{Componente}` en vez de `<Componente />`, o te faltó llamar a la función. Lecciones 3 y 6.
- «Received the string `false` for the boolean attribute `disabled`» — **aviso**. Un booleano escrito como texto: `disabled={false}`. Lección 6.
- «Received `false` for a non-boolean attribute `className`» — **aviso**. Un `&&` en un atributo que espera texto: usa `condicion ? valor : undefined`. Lecciones 8 y 10.

**Props y listas**

- «`key` is not a prop» — **aviso**. Lees `props.key` en el hijo: `key` no llega; pásale el dato con otro nombre. Lecciones 8 y 11.
- «Each child in a list should have a unique "key" prop» — **aviso**. Falta la `key` en el elemento de más fuera del `map`. Lección 11.
- «Encountered two children with the same key» — **aviso**. Dos elementos con la misma `key`: usa un identificador único de los datos. Lección 11.

**Eventos, estado y Hooks**

- «Too many re-renders. React limits the number of renders to prevent an infinite loop.» — **error** (#301). Llamas a un `set` durante el render, como `onClick={setAbierto(true)}`. Pasa una función: `onClick={() => setAbierto(true)}`. Lecciones 15 y 25.
- «Invalid event handler property `onclick`. Did you mean `onClick`?» — **aviso**. Eventos en camelCase. Lección 15.
- «Expected `onClick` listener to be a function, instead got…» — **aviso**, y error al pulsar. Pasaste un texto, el resultado de llamar a la función o un `false`. Lección 15.
- «React has detected a change in the order of Hooks called by…» — **aviso**, que suele llegar con un error detrás. Un Hook dentro de un `if` o después de un `return`. Lecciones 16 y 44.
- «Invalid hook call. Hooks can only be called inside of the body of a function component» — **error**. Un Hook dentro de un manejador, de una función normal o de una clase. Lección 44.
- «Cannot update a component (`Juego`) while rendering a different component (`Tablero`)» — **aviso**. Un hijo llama al `set` de su padre mientras se renderiza. Lección 32.

**Formularios**

- «You provided a `value` prop to a form field without an `onChange` handler» — **aviso**. El campo queda de solo lectura: añade `onChange` o usa `defaultValue`. Lección 22.
- «A component is changing an uncontrolled input to be controlled» (o al revés) — **aviso**. `value` pasó de `undefined` a un valor: empieza el estado con `''`. Lecciones 20 y 22.
- «Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>» — **aviso**. Lección 22.
- «An async function with useActionState was called outside of a transition» — **aviso**. Llamas a la acción a mano: pásala a `action` o envuélvela en `startTransition`. Lección 58.

**Efectos y asincronía**

- «useEffect must not return anything besides a function, which is used for clean-up» — **aviso**. Un efecto `async`: declara la función asíncrona dentro y llámala. Lecciones 38 y 52.
- «Maximum update depth exceeded. This can happen when a component calls setState inside useEffect…» — **aviso** que se repite sin parar mientras la app se queda en bucle. Un efecto que cambia estado sin lista de dependencias, o con una que cambia en cada render. Lecciones 39 y 42.
- «A component was suspended by an uncached promise» — **aviso**. Creas la promesa en el mismo componente que la lee con `use`: créala fuera o guárdala en caché. Lección 49.

**Contexto, raíz y errores**

- «The `value` prop is required for the `<Context.Provider>`» — **aviso**. Un proveedor sin `value`. Lección 28.
- «Target container is not a DOM element.» — **error**. `createRoot` o `createPortal` con un nodo que no existe. Lecciones 3 y 36.
- «An error occurred in the <X> component. Consider adding an error boundary…» — **aviso** que acompaña a un error que nadie capturó. Lecciones 3 y 53.
- «The above error occurred in the <X> component. React will try to recreate this component tree from scratch using the error boundary you provided, Y.» — mensaje de un error que **sí** capturó un error boundary. Lección 53.

Muchos de estos mensajes son **las Reglas de React** (*Rules of React*) vigiladas en vivo: componentes puros (lección 12), React llama a tus componentes y no tú (lecciones 3 y 6), y las reglas de los Hooks (lección 44). Cuando un mensaje no te suene, pregúntate cuál de esas reglas has roto.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cada vez que la consola se pone roja",
      "texto": "Primero, ¿aviso o error? Después, la parte fija del mensaje y lo que va entre comillas invertidas. Si no basta, la pila: la de componentes para saber dónde, la de owners para saber quién escribió el JSX."
    },
    {
      "titulo": "Para registrar los errores de producción",
      "texto": "onUncaughtError y onCaughtError en createRoot, enviando el mensaje y errorInfo.componentStack a tu servicio de registro de errores. Con los source maps de la build, la pila minificada vuelve a tener nombres."
    },
    {
      "titulo": "Para tus propias herramientas de desarrollo",
      "texto": "Un panel de errores propio, un console.error enriquecido o un registro en tus tests: captureOwnerStack les añade la cadena de componentes que creó lo que falla. Siempre detrás de import.meta.env.DEV."
    },
    {
      "titulo": "Cuando un aviso sale de una librería",
      "texto": "Si el aviso nombra un componente que no es tuyo, la pila de owners te lleva al primero que sí lo es: el sitio donde le pasaste las props a la librería, que es lo que puedes cambiar."
    }
  ]
}
```

## Errores típicos

**Leer la pila desde abajo, o por las líneas de React.** Las trazas de un error mezclan tus archivos con funciones internas de React de nombres raros. Busca las líneas que nombran tus archivos y tus componentes, empezando por arriba: la primera tuya suele ser la buena.

**Confundir el padre con el owner.** Buscar el fallo en el componente que envuelve (el que pinta `children`) cuando el dato malo lo escribió otro. La pila de componentes te lleva al padre; la de owners, al que decidió las props.

**Silenciar la consola en vez de arreglar.** Un `console.error = () => {}` para que «no salga tanto rojo» también se lleva los avisos de mañana. Si un aviso viene de una librería y no puedes arreglarlo, al menos filtra ese mensaje concreto y apunta por qué.

**Fiarse de que el aviso ya no sale.** Como React avisa una vez por problema, que no se repita después de tocar el código no prueba nada: recarga la página.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useState } from 'react'\n\nfunction ListaRamos({ ramos }) {\n  return (\n    <ul>\n      {ramos.map((ramo) => (\n        <li>{ramo}</li>\n      ))}\n    </ul>\n  )\n}\n\nexport default function App() {\n  const [ramos, setRamos] = useState(['Paniculata', 'Peonías'])\n\n  return (\n    <main>\n      <ListaRamos ramos={ramos} />\n      <button onClick={() => setRamos([...ramos, 'Rosas'])}>Añadir rosas</button>\n    </main>\n  )\n}\n\n// Cargas la página y pulsas «Añadir rosas» dos veces.\n// ¿Cuántas veces sale el aviso de la key en la consola?",
  "opciones": [
    "Una vez, al cargar",
    "Tres veces, una por cada render",
    "Siete veces, una por cada li que se ha pintado",
    "Ninguna: solo avisa si hay dos keys iguales"
  ],
  "correcta": 0,
  "explicacion": "React avisa la primera vez que ve el problema en ListaRamos y no lo repite en los renders siguientes, aunque el fallo siga ahí y la lista crezca. Comprobado con 19.3.1 en la vista previa: un solo aviso. Por eso un aviso que ya no sale no demuestra nada; recarga para comprobarlo."
}
```

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si la app se ve bien, los avisos dan igual",
      "realidad": "Un aviso describe un fallo que todavía no ha dado la cara: la key que falta solo se nota al reordenar, el campo sin onChange solo cuando alguien intenta escribir. Y en producción ya no saldrán: el momento de verlos es ahora."
    },
    {
      "mito": "Lo que sale en rojo es un error y lo amarillo, un aviso",
      "realidad": "React escribe sus avisos con console.error (rojo), y el mensaje que acompaña a un error que ha tumbado la app, «An error occurred in the…», con console.warn (amarillo). Mira si la app sigue en pie, no el color."
    },
    {
      "mito": "captureOwnerStack sirve para registrar errores en producción",
      "realidad": "Solo existe en desarrollo: en producción React.captureOwnerStack es undefined. Para producción está errorInfo.componentStack."
    },
    {
      "mito": "El número de línea de la pila es exacto",
      "realidad": "En esta vista previa sale desplazado, porque tu código se transforma antes de ejecutarse. En tu proyecto, el navegador lo traduce con los source maps. Los nombres de los componentes, en cambio, son siempre fiables."
    }
  ]
}
```

## Ejercicios

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cuatro mensajes, cuatro arreglos",
  "consigna": "El pedido del Día de la Madre tiene tres avisos en la consola y un error que sale al pulsar «Ver resumen». Lee cada mensaje, localiza el archivo por lo que nombra y arréglalo: que se pueda escribir la dedicatoria, que «Confirmar pedido» funcione, que cada cantidad siga con su ramo al quitar otro y que el resumen diga, por ejemplo, «Resumen: 3 ramos · 49 €».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ListaRamos from './ListaRamos'\nimport FormularioDedicatoria from './FormularioDedicatoria'\nimport Resumen from './Resumen'\nimport './estilos.css'\n\nconst RAMOS_INICIALES = [\n  { id: 'paniculata', nombre: 'Ramo de paniculata', precio: 18 },\n  { id: 'peonias', nombre: 'Centro de peonías', precio: 16 },\n  { id: 'tulipanes', nombre: 'Tulipanes amarillos', precio: 15 },\n]\n\nexport default function App() {\n  const [ramos, setRamos] = useState(RAMOS_INICIALES)\n  const [dedicatoria, setDedicatoria] = useState('')\n  const [confirmado, setConfirmado] = useState(false)\n  const [verResumen, setVerResumen] = useState(false)\n\n  function manejarQuitar(id) {\n    setRamos(ramos.filter((ramo) => ramo.id !== id))\n  }\n\n  return (\n    <main>\n      <h1>Pedido para el Día de la Madre</h1>\n      <ListaRamos ramos={ramos} onQuitar={manejarQuitar} />\n      <FormularioDedicatoria\n        dedicatoria={dedicatoria}\n        onCambiar={setDedicatoria}\n        onConfirmar={() => setConfirmado(true)}\n      />\n      {confirmado && <p role=\"status\">Pedido confirmado</p>}\n      <button onClick={() => setVerResumen(true)}>Ver resumen</button>\n      {verResumen && <Resumen ramos={ramos} />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ListaRamos.jsx",
      "codigo": "export default function ListaRamos({ ramos, onQuitar }) {\n  return (\n    <ul className=\"ramos\">\n      {ramos.map((ramo) => (\n        <li>\n          <label>\n            Cantidad de {ramo.nombre}\n            <input type=\"number\" min=\"1\" defaultValue={1} />\n          </label>\n          <span>{ramo.precio} €</span>\n          <button onClick={() => onQuitar(ramo.id)}>Quitar {ramo.nombre}</button>\n        </li>\n      ))}\n    </ul>\n  )\n}\n"
    },
    {
      "nombre": "FormularioDedicatoria.jsx",
      "codigo": "export default function FormularioDedicatoria({ dedicatoria, onCambiar, onConfirmar }) {\n  return (\n    <div className=\"dedicatoria\">\n      <label htmlFor=\"dedicatoria\">Dedicatoria</label>\n      <textarea id=\"dedicatoria\" rows={3} value={dedicatoria} />\n      <button disabled=\"false\" onClick={onConfirmar}>\n        Confirmar pedido\n      </button>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "Resumen.jsx",
      "codigo": "export default function Resumen({ ramos }) {\n  const total = ramos.reduce((suma, ramo) => suma + ramo.precio, 0)\n  const pedido = { ramos: ramos.length, total }\n\n  return <p className=\"resumen\">Resumen: {pedido}</p>\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.ramos {\n  padding: 0;\n  list-style: none;\n}\n\n.ramos li {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n  margin-bottom: 0.5rem;\n}\n\n.ramos input {\n  width: 4rem;\n  margin-left: 0.4rem;\n}\n\n.dedicatoria {\n  display: grid;\n  gap: 0.4rem;\n  max-width: 22rem;\n  margin-bottom: 1rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  font: inherit;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "Se puede escribir en «Dedicatoria»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Dedicatoria",
            "texto": "Para la mejor madre"
          }
        }
      ],
      "espera": {
        "etiqueta": "Dedicatoria",
        "valor": "Para la mejor madre"
      }
    },
    {
      "descripcion": "Al pulsar «Confirmar pedido», aparece «Pedido confirmado»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar pedido"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Pedido confirmado"
      }
    },
    {
      "descripcion": "Al quitar un ramo, desaparece de la lista",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar Ramo de paniculata"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Quitar Ramo de paniculata"
        }
      }
    },
    {
      "descripcion": "Al quitar el primer ramo, la cantidad escrita en las peonías sigue en las peonías",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Cantidad de Centro de peonías",
            "texto": "3"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar Ramo de paniculata"
          }
        }
      ],
      "espera": {
        "etiqueta": "Cantidad de Centro de peonías",
        "valor": "3"
      }
    },
    {
      "descripcion": "«Ver resumen» muestra «Resumen: 3 ramos · 49 €»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver resumen"
          }
        }
      ],
      "espera": {
        "texto": "Resumen: 3 ramos · 49 €"
      }
    },
    {
      "descripcion": "El resumen se calcula con los ramos que quedan",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Quitar Tulipanes amarillos"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Ver resumen"
          }
        }
      ],
      "espera": {
        "texto": "Resumen: 2 ramos · 34 €"
      }
    }
  ]
}
```

Si te atascas: el aviso de la `key` nombra el componente («Check the render method of `ListaRamos`»); el del campo no nombra ninguno, pero sí la prop (`value` sin `onChange`), y en este proyecto solo hay un campo con `value`; el de `disabled` dice incluso cómo escribirlo bien. El error del resumen dice qué objeto es por sus claves, `{ramos, total}`.

**Retos para seguir practicando** (sin comprobación automática):

1. En el bloque «¿Quién creó a Precio?», haz que `Tarjeta` reciba `euros` como prop y pinte ella `<Precio euros={euros} />`. Antes de mirar la consola, escribe en un papel cómo crees que quedará la pila de owners.
2. En el bloque de la pila de componentes, añade un `console.log(captureOwnerStack())` dentro de `componentDidCatch` y compáralo con la salida de `onCaughtError` del `main.jsx` de la lección. ¿De qué componente es cada pila?
3. En un proyecto de Vite (lección 2), mete a propósito un objeto en el JSX, ejecuta `npm run build` y `npm run preview`, y descifra el error minificado con su enlace. Después compáralo con lo que sale en `npm run dev`.
4. Escribe tu propia chuleta: elige cinco mensajes de la lista que no recuerdes bien, provócalos en un `react-en-vivo` de esta lección y anota la parte fija de cada uno.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "captureOwnerStack",
      "descripcion": "La referencia: dónde devuelve la pila y dónde null, la diferencia con la pila de componentes y el ejemplo de un panel de errores propio.",
      "url": "https://react.dev/reference/react/captureOwnerStack",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Minified React error #31",
      "descripcion": "Un ejemplo de la página que reconstruye los errores de producción. Cambia el número de la URL para leer cualquier otro.",
      "url": "https://react.dev/errors/31",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "createRoot: opciones",
      "descripcion": "onCaughtError, onUncaughtError y onRecoverableError, con ejemplos para mostrar y registrar errores.",
      "url": "https://react.dev/reference/react-dom/client/createRoot",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Rules of React",
      "descripcion": "Las reglas que vigilan muchos de los avisos de esta lección: pureza, quién llama a los componentes y las reglas de los Hooks.",
      "url": "https://react.dev/reference/rules",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Error boundaries",
      "descripcion": "Cómo capturar un error de render, con componentDidCatch y la pila de componentes. Es la base de la lección 53.",
      "url": "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
      "etiqueta": "react.dev"
    }
  ]
}
```
