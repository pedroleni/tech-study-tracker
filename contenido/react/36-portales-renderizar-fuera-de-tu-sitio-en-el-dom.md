# Portales: renderizar fuera de tu sitio en el DOM

- **Módulo:** Refs y el DOM
- **Slug:** `portales-renderizar-fuera-de-tu-sitio-en-el-dom` (autogenerado del título)
- **Orden:** 360
- **Fuentes:** [createPortal](https://react.dev/reference/react-dom/createPortal) — ver `contenido/react/TEMARIO.md` #36

---

## Qué es y para qué sirve

Lo que devuelve un componente acaba **dentro del nodo del DOM de su padre**. Casi siempre es justo lo que quieres. Pero hay piezas de la interfaz que tienen que verse por encima de todo, aunque el componente que las abre viva metido en una tarjeta, una columna o una tabla: ventanas modales, menús desplegables, avisos emergentes, globos de ayuda.

Ahí el CSS de los antepasados juega en contra:

- **`overflow: hidden`** recorta todo lo que sobresale de la caja.
- **El `z-index` solo compite dentro de su contexto de apilamiento.** Si un antepasado crea uno (con `position` y `z-index`, con `opacity` menor que 1, con `transform`...), ni un `z-index: 9999` saca al hijo por encima de lo que hay fuera.
- **`position: fixed` deja de ser relativo a la ventana** si un antepasado tiene `transform`, `filter` o `contain`, entre otras propiedades: pasa a colocarse respecto a ese antepasado.

En la escuela de surf Ola Norte, cada clase es una tarjeta con las esquinas redondeadas (`overflow: hidden`) y una sombra hecha con `filter`. Las dos tarjetas abren la misma ventana con `position: fixed`, pero solo una usa un portal:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una ventana atrapada en su tarjeta",
  "consigna": "Pulsa «Ver condiciones del mar» en la primera tarjeta: el fondo oscuro y la ventana se quedan dentro de la tarjeta, recortados. Ciérrala y prueba en la segunda: la misma ventana cubre toda la vista previa. Después quita el filter de .tarjeta en estilos.css y vuelve a abrir la primera.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { createPortal } from 'react-dom'\nimport './estilos.css'\n\nfunction CondicionesDelMar({ onCerrar }) {\n  return (\n    <div className=\"fondo\">\n      <div className=\"ventana\">\n        <h3>Condiciones del mar</h3>\n        <p>Olas de 1,5 metros y viento del noroeste. Bandera amarilla.</p>\n        <button onClick={onCerrar}>Cerrar</button>\n      </div>\n    </div>\n  )\n}\n\nfunction TarjetaClase({ titulo, conPortal }) {\n  const [abierta, setAbierta] = useState(false)\n  const ventana = <CondicionesDelMar onCerrar={() => setAbierta(false)} />\n\n  return (\n    <article className=\"tarjeta\">\n      <h2>{titulo}</h2>\n      <p>Sábado, 10:00. Playa de Gros.</p>\n      <button onClick={() => setAbierta(true)}>Ver condiciones del mar</button>\n      {abierta && (conPortal ? createPortal(ventana, document.body) : ventana)}\n    </article>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Escuela de surf Ola Norte</h1>\n      <div className=\"clases\">\n        <TarjetaClase titulo=\"Iniciación (sin portal)\" conPortal={false} />\n        <TarjetaClase titulo=\"Perfeccionamiento (con portal)\" conPortal={true} />\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  min-height: 20rem;\n  font-family: system-ui, sans-serif;\n}\n\n.clases {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n/* overflow recorta lo que sobresale; filter pone la sombra */\n.tarjeta {\n  max-width: 16rem;\n  padding: 0.75rem 1rem;\n  overflow: hidden;\n  border-radius: 12px;\n  background: #e0f2fe;\n  filter: drop-shadow(0 2px 4px rgb(15 23 42 / 0.25));\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.fondo {\n  position: fixed;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  padding: 1rem;\n  background: rgb(15 23 42 / 0.6);\n  font-family: system-ui, sans-serif;\n}\n\n.ventana {\n  width: min(20rem, 100%);\n  padding: 1rem 1.25rem;\n  border-radius: 12px;\n  background: white;\n}\n\n.ventana h2,\n.ventana h3 {\n  margin-top: 0;\n  font-size: 1.15rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #0369a1;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Sin `filter`, la primera ventana también se escapa: `position: fixed` vuelve a colocarse respecto a la ventana del navegador, y `overflow: hidden` no recorta a un hijo fijo. Pero no puedes ir quitando el CSS de cada tarjeta, columna o tabla donde algún día se abra una ventana, y menos el de componentes que no son tuyos. **Un portal saca los nodos del DOM de ese sitio y los pinta en otro, normalmente al final de `document.body`**, donde no hay ningún antepasado que estorbe.

## `createPortal(hijos, nodo)`

`createPortal` vive en `react-dom`, no en `react`, porque habla del DOM. Recibe lo que quieres pintar y el nodo del DOM donde quieres pintarlo, y devuelve algo que pones en tu JSX como cualquier otro elemento:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Un aviso que se pinta al final del body",
  "codigo": "import { useState } from 'react'\nimport { createPortal } from 'react-dom'\n\nfunction AvisoReserva({ clase }) {\n  return createPortal(\n    <p className=\"aviso\">Reserva hecha: {clase}</p>,\n    document.body,\n  )\n}\n\nexport default function App() {\n  const [reservada, setReservada] = useState('')\n\n  return (\n    <main>\n      <article className=\"tarjeta\">\n        <h2>Iniciación</h2>\n        <p>Sábado, 10:00. Playa de Gros.</p>\n        <button onClick={() => setReservada('Iniciación, sábado a las 10:00')}>\n          Reservar\n        </button>\n        {reservada && <AvisoReserva clase={reservada} />}\n      </article>\n    </main>\n  )\n}",
  "css": "main {\n  min-height: 12rem;\n  font-family: system-ui, sans-serif;\n}\n\n/* overflow recorta lo que sobresale; filter pone la sombra */\n.tarjeta {\n  max-width: 16rem;\n  padding: 0.75rem 1rem;\n  overflow: hidden;\n  border-radius: 12px;\n  background: #e0f2fe;\n  filter: drop-shadow(0 2px 4px rgb(15 23 42 / 0.25));\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.aviso {\n  position: fixed;\n  right: 1rem;\n  bottom: 1rem;\n  margin: 0;\n  padding: 0.6rem 1rem;\n  border-radius: 8px;\n  background: #0c4a6e;\n  color: white;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #0369a1;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}",
  "anotaciones": [
    {
      "fragmento": "import { createPortal } from 'react-dom'",
      "nota": "createPortal es de react-dom: es la parte de React que sabe del DOM del navegador."
    },
    {
      "fragmento": "return createPortal(",
      "nota": "El componente devuelve el resultado de createPortal en lugar de su JSX directamente. También podrías ponerlo en medio de otro JSX, entre llaves."
    },
    {
      "fragmento": "<p className=\"aviso\">Reserva hecha: {clase}</p>,",
      "nota": "El primer argumento: lo que quieres pintar. Cualquier cosa que se pueda renderizar: JSX, un componente, un Fragment, un texto."
    },
    {
      "fragmento": "document.body,",
      "nota": "El segundo: el nodo del DOM donde se pinta. Tiene que existir ya cuando React lo usa. document.body siempre está."
    },
    {
      "fragmento": "{reservada && <AvisoReserva clase={reservada} />}",
      "nota": "AvisoReserva se usa como cualquier componente, dentro de la tarjeta. En el árbol de React es su hija; en el DOM, su párrafo acaba fuera, al final del body."
    }
  ]
}
```

Después de pulsar «Reservar», el DOM de la vista previa queda así (resumido):

```html
<body>
  <div id="root">
    <main>
      <article class="tarjeta">
        <h2>Iniciación</h2>
        ...
        <button>Reservar</button>
      </article>
    </main>
  </div>
  <p class="aviso">Reserva hecha: Iniciación, sábado a las 10:00</p>
</body>
```

El aviso no está dentro de `.tarjeta`, ni siquiera dentro de `#root`: está al final de `body`. React lo crea al montar `AvisoReserva` y lo quita al desmontarlo, igual que si estuviera en su sitio.

`createPortal` admite un tercer argumento opcional, una `key`, por si devuelves varios portales en una lista (lección 11). Y el nodo de destino no tiene por qué ser `document.body`: puede ser un `<div id="avisos">` que hayas puesto en tu `index.html`, o el hueco que te deja una librería de mapas que no es de React.

## Para React, sigue siendo un hijo

**El portal solo cambia dónde acaban los nodos del DOM.** Para todo lo demás, el JSX de un portal es hijo del componente que lo pinta:

- **Lee el contexto** de sus antepasados de React (lección 28), aunque en el DOM no esté dentro de ellos.
- **Sus eventos suben por el árbol de React, no por el del DOM.** Un `onClick` de un antepasado de React se entera de los clics dentro del portal; un escuchador del DOM puesto con `addEventListener` en ese mismo antepasado, no.

Aquí el parte de la playa se pinta con un portal y lee las unidades de un contexto que provee `App`. La tarjeta tiene a la vez un `onClick` de React y un escuchador del DOM:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Contexto y eventos atraviesan el portal",
  "consigna": "Pulsa «Ver el parte» y mira la consola: lo oyen el escuchador del DOM y el onClick de la tarjeta. Ahora pulsa «Entendido»: el onClick de la tarjeta se entera, el escuchador del DOM no. Mira también el árbol de renders: PartePlaya cuelga de TarjetaClase.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { createContext, useContext, useState } from 'react'\nimport { createPortal } from 'react-dom'\nimport './estilos.css'\n\nconst Unidades = createContext('metros')\n\nfunction PartePlaya() {\n  const unidades = useContext(Unidades)\n\n  return createPortal(\n    <aside className=\"parte\">\n      <p>Olas de {unidades === 'metros' ? '1,5 metros' : '5 pies'}</p>\n      <button onClick={() => console.log('Clic en «Entendido», dentro del portal')}>\n        Entendido\n      </button>\n    </aside>,\n    document.body,\n  )\n}\n\nfunction TarjetaClase() {\n  const [verParte, setVerParte] = useState(false)\n\n  return (\n    <article\n      className=\"tarjeta\"\n      onClick={() => console.log('onClick de la tarjeta (árbol de React)')}\n      ref={(tarjeta) => {\n        const avisar = () => console.log('Escuchador del DOM de la tarjeta')\n        tarjeta.addEventListener('click', avisar)\n        return () => tarjeta.removeEventListener('click', avisar)\n      }}\n    >\n      <h2>Iniciación</h2>\n      <button onClick={() => setVerParte(true)}>Ver el parte</button>\n      {verParte && <PartePlaya />}\n    </article>\n  )\n}\n\nexport default function App() {\n  return (\n    <Unidades value=\"pies\">\n      <main>\n        <TarjetaClase />\n      </main>\n    </Unidades>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n}\n\n.tarjeta {\n  max-width: 16rem;\n  padding: 0.75rem 1rem;\n  border-radius: 12px;\n  background: #e0f2fe;\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.1rem;\n}\n\n.parte {\n  max-width: 16rem;\n  margin: 1rem 8px;\n  padding: 0.75rem 1rem;\n  border: 2px dashed #0369a1;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #0369a1;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false,
  "mostrarArbol": true
}
```

Tres cosas que enseña este ejemplo:

- **El parte dice «5 pies»**: `PartePlaya` ha leído el valor que provee `App`, aunque en el DOM esté fuera de `main`.
- **«Entendido» llega al `onClick` de la tarjeta, pero no a su escuchador del DOM.** En el DOM, el botón no está dentro del `article`, así que el clic nativo nunca pasa por él. React, en cambio, hace subir sus eventos por el árbol de componentes, y en ese árbol el botón sí está dentro de `TarjetaClase`.
- **En el árbol de renders, `PartePlaya` aparece montado como hijo de `TarjetaClase`**, y el resumen de ese commit dice que no ha habido cambios en el DOM. No es que no haya cambiado nada: el panel solo vigila lo que hay dentro de la raíz de React, `#root`, y el parte se ha pintado fuera.

Lo de los eventos es casi siempre lo que quieres (un `onClick` en un formulario se entera de lo que pasa en su ventana emergente), pero a veces sorprende. Lo verás en «Errores típicos».

## Un modal accesible con portal

Con un portal, la ventana se ve por encima de todo. Pero que se **vea** encima no basta para que sea modal: quien usa el teclado o un lector de pantalla tiene que poder entrar en ella, usarla y salir. Para eso hacen falta unas cuantas piezas más, que recoge el patrón de diálogo modal de las [ARIA Authoring Practices (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Este es un modal completo, en dos archivos:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las condiciones del mar, en un modal de verdad",
  "consigna": "Úsalo solo con el teclado: pulsa Tab hasta «Ver condiciones del mar» y pulsa Intro. El foco salta a «Entendido». Pulsa Tab varias veces: no llega ni al botón ni al enlace del fondo. Pulsa Escape: el modal se cierra y el foco vuelve al botón que lo abrió. Prueba también a cerrarlo pulsando en el fondo oscuro.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport { flushSync } from 'react-dom'\nimport Modal from './Modal'\nimport './estilos.css'\n\nexport default function App() {\n  const [abierto, setAbierto] = useState(false)\n  const botonCondiciones = useRef(null)\n\n  function cerrar() {\n    // Primero se quita inert del fondo; después ya se puede enfocar el botón\n    flushSync(() => setAbierto(false))\n    botonCondiciones.current.focus()\n  }\n\n  return (\n    <>\n      <main inert={abierto}>\n        <h1>Escuela de surf Ola Norte</h1>\n        <p>Clase de iniciación: sábado a las 10:00 en la playa de Gros.</p>\n        <button ref={botonCondiciones} onClick={() => setAbierto(true)}>\n          Ver condiciones del mar\n        </button>\n        <a href=\"#tarifas\">Tarifas</a>\n      </main>\n      {abierto && (\n        <Modal titulo=\"Condiciones del mar\" onCerrar={cerrar}>\n          <p>\n            Olas de 1,5 metros y viento del noroeste. Bandera amarilla: báñate solo\n            en la zona vigilada.\n          </p>\n          <button autoFocus onClick={cerrar}>\n            Entendido\n          </button>\n        </Modal>\n      )}\n    </>\n  )\n}\n"
    },
    {
      "nombre": "Modal.jsx",
      "codigo": "import { createPortal } from 'react-dom'\n\nexport default function Modal({ titulo, onCerrar, children }) {\n  function manejarTecla(e) {\n    if (e.key === 'Escape') onCerrar()\n  }\n\n  function manejarClicFondo(e) {\n    // Solo si se pulsa el fondo, no algo de dentro de la ventana\n    if (e.target === e.currentTarget) onCerrar()\n  }\n\n  return createPortal(\n    <div className=\"fondo\" onClick={manejarClicFondo}>\n      <div\n        className=\"ventana\"\n        role=\"dialog\"\n        aria-modal=\"true\"\n        aria-labelledby=\"titulo-modal\"\n        onKeyDown={manejarTecla}\n      >\n        <h2 id=\"titulo-modal\">{titulo}</h2>\n        {children}\n      </div>\n    </div>,\n    document.body,\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  min-height: 18rem;\n  font-family: system-ui, sans-serif;\n}\n\n.fondo {\n  position: fixed;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  padding: 1rem;\n  background: rgb(15 23 42 / 0.6);\n  font-family: system-ui, sans-serif;\n}\n\n.ventana {\n  width: min(20rem, 100%);\n  padding: 1rem 1.25rem;\n  border-radius: 12px;\n  background: white;\n}\n\n.ventana h2,\n.ventana h3 {\n  margin-top: 0;\n  font-size: 1.15rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #0369a1;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:focus-visible,\na:focus-visible {\n  outline: 3px solid #f59e0b;\n  outline-offset: 2px;\n}\n"
    }
  ],
  "archivoInicial": "Modal.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

Pieza a pieza:

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "role=\"dialog\" y aria-modal=\"true\"",
      "texto": "Le dicen al lector de pantalla que esto es un diálogo y que, mientras esté abierto, lo de fuera no cuenta. aria-modal solo es honesto si lo de fuera de verdad no se puede usar: por eso va junto a inert."
    },
    {
      "titulo": "aria-labelledby",
      "texto": "Da nombre al diálogo apuntando al id de su título. Al abrirlo, el lector anuncia algo como «Condiciones del mar, diálogo». Sin nombre, solo diría «diálogo»."
    },
    {
      "titulo": "autoFocus en el primer control",
      "texto": "Al abrir, el foco tiene que entrar en el diálogo. Con autoFocus, React enfoca ese elemento en cuanto se monta. Si el diálogo tiene un formulario, va en el primer campo."
    },
    {
      "titulo": "inert en todo lo demás",
      "texto": "Con el atributo inert, el fondo no recibe el foco ni los clics y desaparece para el lector de pantalla. React 19 lo acepta como booleano: inert={abierto}. Funciona porque el portal ha sacado el modal fuera de main."
    },
    {
      "titulo": "Escape y el fondo cierran",
      "texto": "onKeyDown en el diálogo recibe las teclas de todo lo que hay dentro. El clic en el fondo cierra solo si e.target es el propio fondo, no algo de la ventana."
    },
    {
      "titulo": "Al cerrar, el foco vuelve a quien lo abrió",
      "texto": "Si no, el foco se queda en un botón que ya no existe y quien usa el teclado pierde su sitio. Como el botón está dentro de main, que sigue inerte hasta que React aplique el cambio, flushSync (lección 34) aplica el cierre en el acto y después se enfoca."
    }
  ]
}
```

Lo de `flushSync` no es un adorno: sin él, `botonCondiciones.current.focus()` se ejecuta cuando `main` todavía tiene `inert`, el navegador no deja enfocar el botón y el foco acaba en `<body>`. Si no usaras `inert`, bastaría con llamar a `focus()` después del `setAbierto(false)`.

Faltan matices (qué enfocar al abrir según el contenido, qué hacer si el botón que abrió el diálogo ya no existe, cómo anunciar lo que pasa dentro): son la lección 37, dedicada a la accesibilidad en React.

## La alternativa nativa: `<dialog>` con `showModal()`

HTML tiene un elemento para esto, `<dialog>`, que funciona en todos los navegadores actuales desde marzo de 2022. Abierto con su método `showModal()`, el navegador hace solo casi todo lo que el modal de arriba hacía a mano:

- Lo pinta en la **capa superior** (*top layer*), por encima de todo: no le afectan `overflow`, `z-index` ni `transform`, y **no necesita portal**.
- **Deja inerte el resto de la página** y lo expone como modal al lector de pantalla.
- **Mueve el foco dentro**, al primer elemento enfocable, y **lo devuelve** al elemento que lo tenía en cuanto se cierra.
- **Se cierra con Escape**, y el fondo se pinta con el pseudoelemento `::backdrop`.

Desde React, se abre con una ref y `showModal()` en el manejador, y se cierra con `close()`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Alquilar tabla con un <dialog> nativo",
  "consigna": "Abre el diálogo con el teclado y recorre los botones con Tab: el fondo no recibe el foco. Pulsa Escape y mira adónde vuelve el foco, y qué dice la consola. Ni portal, ni inert, ni onKeyDown: lo hace el navegador.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useRef, useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const dialogo = useRef(null)\n  const [tabla, setTabla] = useState('')\n\n  function elegir(nombre) {\n    setTabla(nombre)\n    dialogo.current.close()\n  }\n\n  return (\n    <main>\n      <h1>Escuela de surf Ola Norte</h1>\n      <button onClick={() => dialogo.current.showModal()}>Alquilar tabla</button>\n      {tabla && <p>Has elegido: {tabla}</p>}\n\n      <dialog\n        ref={dialogo}\n        aria-labelledby=\"titulo-alquiler\"\n        onClose={() => console.log('El diálogo se ha cerrado')}\n      >\n        <h2 id=\"titulo-alquiler\">Alquilar tabla</h2>\n        <p>¿Qué tabla quieres para el sábado?</p>\n        <p className=\"botones\">\n          <button onClick={() => elegir('tabla blanda de 8 pies')}>Tabla blanda</button>\n          <button onClick={() => elegir('tabla rígida de 6 pies')}>Tabla rígida</button>\n          <button onClick={() => dialogo.current.close()}>Cancelar</button>\n        </p>\n      </dialog>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  min-height: 16rem;\n  font-family: system-ui, sans-serif;\n}\n\ndialog {\n  max-width: 22rem;\n  border: none;\n  border-radius: 12px;\n  font-family: system-ui, sans-serif;\n}\n\ndialog h2 {\n  margin-top: 0;\n  font-size: 1.15rem;\n}\n\ndialog::backdrop {\n  background: rgb(15 23 42 / 0.6);\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #0369a1;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarJsGenerado": false
}
```

**Ojo con `autoFocus` dentro de un `<dialog>`.** En React, `autoFocus` no se convierte en el atributo `autofocus` del HTML: es React quien llama a `focus()` al montar el elemento, y en ese momento el diálogo está cerrado y no se puede enfocar nada. Así que `showModal()` no lo ve y enfoca el primer elemento enfocable. Si quieres empezar en otro, guárdalo en una ref y llama a su `focus()` justo después de `showModal()`.

Con `<dialog>`, **quien sabe si está abierto es el navegador, no tu estado**: Escape lo cierra sin pasar por tu código. Si guardas en el estado si está abierto, escucha `onClose` (React lo admite como cualquier otro evento) y pon ahí tu `set...`; si no, tu estado dirá «abierto» con el diálogo cerrado. También existe `<form method="dialog">`, que cierra el diálogo al enviarse y deja el `value` del botón pulsado en `dialogo.returnValue`.

¿Cuál usar? Para una ventana modal, **`<dialog>` con `showModal()` es hoy la opción más sencilla y la que menos se puede romper**. El portal sigue siendo la herramienta para lo que no es un diálogo: un aviso emergente, un menú que tiene que salirse de una tabla con scroll, un globo de ayuda, o contenido de React que tiene que acabar en un nodo que no controlas.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Ventanas modales",
      "texto": "Con un portal y las piezas de accesibilidad de esta lección, o con un dialog nativo, que no necesita portal."
    },
    {
      "titulo": "Menús desplegables y globos de ayuda",
      "texto": "Cuando el botón que los abre está dentro de una tabla o una columna con overflow: el menú se pinta en el body y se coloca con las medidas del botón."
    },
    {
      "titulo": "Avisos emergentes (toasts)",
      "texto": "Un contenedor de avisos al final del body, al que cualquier componente de la app puede mandar los suyos."
    },
    {
      "titulo": "Islas de React en una página que no es de React",
      "texto": "Una barra lateral generada en el servidor, o el globo de un mapa hecho con otra librería: el portal pinta ahí, y todo sigue siendo un solo árbol de React con estado compartido."
    },
    {
      "titulo": "Lo que hacen las librerías",
      "texto": "Radix o React Aria (lección 80) usan portales por dentro para sus diálogos, menús y globos. Saber cómo funcionan te ayuda a entender por qué sus eventos y su contexto se comportan como se comportan."
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
      "mito": "Un portal crea otra aplicación de React",
      "realidad": "Es el mismo árbol, la misma raíz y el mismo estado. Solo cambia dónde acaban sus nodos en el DOM. Para una segunda app independiente harías otro createRoot (lección 3)."
    },
    {
      "mito": "Los eventos de un portal suben por el DOM",
      "realidad": "Suben por el árbol de React: los onClick de los componentes antepasados se enteran, estén donde estén en el DOM. Los escuchadores del DOM puestos en esos antepasados, no."
    },
    {
      "mito": "Con un portal, la ventana ya es accesible",
      "realidad": "El portal solo arregla lo visual. El foco, Escape, role, aria-modal, el nombre y el fondo inerte los pones tú, o los da el dialog nativo."
    },
    {
      "mito": "Para un modal hace falta un portal",
      "realidad": "Un dialog abierto con showModal() va a la capa superior del navegador y no lo recorta ningún antepasado. El portal hace falta si construyes el modal con elementos normales."
    }
  ]
}
```

## Errores típicos

**Olvidar que los eventos suben por el árbol de React.** Cada tarjeta abre su ficha al pulsarla entera, y dentro tiene un botón que abre una ventana con un portal:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function TarjetaClase({ clase }) {\n  const [verMaterial, setVerMaterial] = useState(false)\n\n  return (\n    <article onClick={() => console.log(`Abro la ficha de ${clase}`)}>\n      <h2>{clase}</h2>\n      <button onClick={() => setVerMaterial(true)}>Ver material</button>\n      {verMaterial &&\n        createPortal(\n          <div className=\"ventana\">\n            <p>Neopreno y tabla incluidos.</p>\n            <button onClick={() => setVerMaterial(false)}>Cerrar</button>\n          </div>,\n          document.body,\n        )}\n    </article>\n  )\n}\n\n// <TarjetaClase clase=\"Iniciación\" />\n// Pulsas «Ver material» y después «Cerrar».\n// ¿Cuántas veces sale «Abro la ficha de Iniciación»?",
  "opciones": [
    "Ninguna: los dos clics son en botones",
    "Una, al pulsar «Ver material»",
    "Dos: una por cada clic",
    "Una, al pulsar «Cerrar»"
  ],
  "correcta": 2,
  "explicacion": "«Ver material» está dentro del article, así que su clic sube hasta él. «Cerrar» está en el body, pero en el árbol de React sigue dentro de TarjetaClase, y su clic también sube hasta el onClick del article. Para evitarlo: e.stopPropagation() en los manejadores del portal (lección 15), o pinta el portal desde un componente que no esté dentro del article."
}
```

**Un destino que no existe.** `createPortal` necesita un nodo del DOM que ya exista. Si lo buscas con `getElementById` y no está en la página, recibe `null`:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un portal hacia ninguna parte",
  "consigna": "La vista previa no tiene ningún elemento con id avisos. Lee el error y cambia el destino por document.body.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { createPortal } from 'react-dom'\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Escuela de surf Ola Norte</h1>\n      {createPortal(\n        <p>Mañana no hay clases: temporal en la costa.</p>,\n        document.getElementById('avisos'),\n      )}\n    </main>\n  )\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false
}
```

```text
Target container is not a DOM element.
```

Es decir: el contenedor de destino no es un elemento del DOM. En tu proyecto, si quieres un contenedor propio, añade `<div id="avisos"></div>` a `index.html`, junto al `<div id="root">`.

**Estilos que dependen del sitio de antes.** Un selector como `.tarjeta .ventana { ... }` deja de aplicarse en cuanto la ventana va por un portal: en el DOM ya no está dentro de `.tarjeta`. Dale a la ventana sus propias clases, sin depender de dónde estaba.

**Fiarse de `autoFocus` en un `<dialog>`.** Funciona en el modal con portal, porque el elemento se monta al abrir. En un `<dialog>` que ya estaba en la página, no: el foco va al primer elemento enfocable (lo viste arriba). Enfoca tú el que quieras después de `showModal()`.

**Abrir un `<dialog>` con el atributo `open`.** `<dialog open>` se ve, pero no es modal: no va a la capa superior, el fondo sigue activo y Escape no lo cierra. Para un modal, ábrelo siempre con `showModal()`.

**Un diálogo sin nombre ni foco.** Si no le das `aria-labelledby` (o `aria-label`), el lector de pantalla solo anuncia «diálogo», y las comprobaciones de esta web no pueden encontrarlo por su nombre. Si no mueves el foco dentro, quien usa el teclado sigue en el fondo, delante de una ventana que no puede alcanzar.

## Ejercicios

En la tarjeta de la clase de iniciación, «Reservar clase» abre una ventana con un formulario. Ahora mismo se pinta dentro de la tarjeta, así que la recorta, y no es un diálogo accesible.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Reservar clase, en un diálogo accesible",
  "consigna": "Sigue los comentarios numerados de los dos archivos. ReservaClase: píntala con un portal en document.body, conviértela en un diálogo con nombre (role, aria-modal y aria-labelledby apuntando a su título), con el foco en «Nombre» al abrir y que se cierre con Escape. App: al cerrar, por cualquier vía, el foco vuelve a «Reservar clase», y mientras el diálogo esté abierto el fondo queda inerte. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ReservaClase from './ReservaClase'\nimport './estilos.css'\n\nexport default function App() {\n  const [abierto, setAbierto] = useState(false)\n  const [reserva, setReserva] = useState('')\n\n  function cerrar() {\n    setAbierto(false)\n    // 4. Devuelve el foco a «Reservar clase»\n  }\n\n  function confirmar(nombre) {\n    setReserva(nombre)\n    cerrar()\n  }\n\n  return (\n    // 5. Mientras el diálogo está abierto, que el fondo quede inerte\n    <main>\n      <h1>Escuela de surf Ola Norte</h1>\n      <article className=\"tarjeta\">\n        <h2>Iniciación</h2>\n        <p>Sábado, 10:00. Playa de Gros.</p>\n        <button onClick={() => setAbierto(true)}>Reservar clase</button>\n        {reserva && <p>Reserva confirmada para {reserva}</p>}\n        {abierto && <ReservaClase onConfirmar={confirmar} onCancelar={cerrar} />}\n      </article>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ReservaClase.jsx",
      "codigo": "import { useState } from 'react'\n\nexport default function ReservaClase({ onConfirmar, onCancelar }) {\n  const [nombre, setNombre] = useState('')\n\n  function manejarEnvio(e) {\n    e.preventDefault()\n    if (nombre.trim() !== '') onConfirmar(nombre.trim())\n  }\n\n  // 1. Píntalo con un portal en document.body\n  // 2. Que sea un diálogo con nombre: role, aria-modal y aria-labelledby\n  // 3. Que el foco empiece en «Nombre» y que Escape lo cierre\n  return (\n    <div className=\"fondo\">\n      <div className=\"ventana\">\n        <h2>Reservar clase de surf</h2>\n        <form onSubmit={manejarEnvio}>\n          <label>\n            Nombre\n            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />\n          </label>\n          <p className=\"botones\">\n            <button>Confirmar</button>\n            <button type=\"button\" onClick={onCancelar}>\n              Cancelar\n            </button>\n          </p>\n        </form>\n      </div>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  min-height: 20rem;\n  font-family: system-ui, sans-serif;\n}\n\n/* overflow recorta lo que sobresale; filter pone la sombra */\n.tarjeta {\n  max-width: 16rem;\n  padding: 0.75rem 1rem;\n  overflow: hidden;\n  border-radius: 12px;\n  background: #e0f2fe;\n  filter: drop-shadow(0 2px 4px rgb(15 23 42 / 0.25));\n}\n\n.tarjeta h2 {\n  margin: 0 0 0.25rem;\n  font-size: 1.1rem;\n}\n\n.fondo {\n  position: fixed;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  padding: 1rem;\n  background: rgb(15 23 42 / 0.6);\n  font-family: system-ui, sans-serif;\n}\n\n.ventana {\n  width: min(20rem, 100%);\n  padding: 1rem 1.25rem;\n  border-radius: 12px;\n  background: white;\n}\n\n.ventana h2,\n.ventana h3 {\n  margin-top: 0;\n  font-size: 1.15rem;\n}\n\n.ventana label {\n  display: grid;\n  gap: 0.25rem;\n}\n\n.ventana input {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #94a3b8;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.botones {\n  display: flex;\n  gap: 0.5rem;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #0369a1;\n  border-radius: 999px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n"
    }
  ],
  "archivoInicial": "ReservaClase.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarJsGenerado": false,
  "comprobaciones": [
    {
      "descripcion": "«Reservar clase» abre un diálogo llamado «Reservar clase de surf»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar clase"
          }
        }
      ],
      "espera": {
        "rol": "dialog",
        "nombre": "Reservar clase de surf"
      }
    },
    {
      "descripcion": "Al abrirlo, el foco está en el campo «Nombre»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar clase"
          }
        },
        {
          "teclear": "Lucía"
        }
      ],
      "espera": {
        "etiqueta": "Nombre",
        "valor": "Lucía"
      }
    },
    {
      "descripcion": "Escape cierra el diálogo",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar clase"
          }
        },
        {
          "pulsar": {
            "etiqueta": "Nombre"
          }
        },
        {
          "teclear": "{Escape}"
        }
      ],
      "espera": {
        "ausente": {
          "rol": "heading",
          "nombre": "Reservar clase de surf"
        }
      }
    },
    {
      "descripcion": "Al cancelar, el foco vuelve a «Reservar clase»: Intro lo abre otra vez",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar clase"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Cancelar"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Reservar clase de surf"
      }
    },
    {
      "descripcion": "Después de Escape, el foco también vuelve a «Reservar clase»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar clase"
          }
        },
        {
          "pulsar": {
            "etiqueta": "Nombre"
          }
        },
        {
          "teclear": "{Escape}"
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Reservar clase de surf"
      }
    },
    {
      "descripcion": "Al confirmar, la tarjeta dice para quién es la reserva",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Reservar clase"
          }
        },
        {
          "escribir": {
            "etiqueta": "Nombre",
            "texto": "Lucía"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Confirmar"
          }
        }
      ],
      "espera": {
        "texto": "Reserva confirmada para Lucía"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. Haz que un clic en el fondo oscuro cierre el diálogo, pero no un clic dentro de la ventana.
2. Rehaz el ejercicio con un `<dialog>` y `showModal()`. ¿Qué piezas sobran? Acuérdate de mantener al día tu estado con `onClose`.
3. Añade un aviso emergente «Reserva confirmada» con un portal, en una esquina de la página, que se quite al pulsar su botón «Cerrar». ¿Le pondrías `aria-modal`?
4. Pon el aviso del reto anterior dentro de un `<div onClick={...}>` que cuente clics. ¿Cuenta los clics del aviso? Arréglalo con `stopPropagation`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "createPortal",
      "descripcion": "La referencia oficial: parámetros, por qué los eventos siguen el árbol de React y ejemplos con un modal, con HTML del servidor y con un mapa que no es de React.",
      "url": "https://react.dev/reference/react-dom/createPortal",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Dialog (Modal) Pattern",
      "descripcion": "El patrón de las ARIA Authoring Practices: qué teclas, qué roles y adónde va el foco al abrir y al cerrar un diálogo modal.",
      "url": "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/",
      "etiqueta": "W3C APG"
    },
    {
      "titulo": "<dialog>: The Dialog element",
      "descripcion": "El diálogo nativo: showModal frente a open, ::backdrop, autofocus, Escape y form method=\"dialog\".",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog",
      "etiqueta": "MDN"
    },
    {
      "titulo": "inert",
      "descripcion": "El atributo que deja una parte de la página sin foco, sin clics y fuera del lector de pantalla.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Stacking context",
      "descripcion": "Qué propiedades crean un contexto de apilamiento y por qué un z-index enorme no siempre gana.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Containing block",
      "descripcion": "La lista de propiedades (transform, filter, contain...) que hacen que position: fixed se coloque respecto a un antepasado.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block",
      "etiqueta": "MDN"
    }
  ]
}
```
