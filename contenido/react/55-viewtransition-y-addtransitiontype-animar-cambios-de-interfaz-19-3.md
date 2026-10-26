# `<ViewTransition>` y `addTransitionType`: animar cambios de interfaz (19.3)

- **Módulo:** Asincronía y concurrencia
- **Slug:** `viewtransition-y-addtransitiontype-animar-cambios-de-interfaz-19-3` (autogenerado del título)
- **Orden:** 550
- **Fuentes:** [`<ViewTransition>`](https://react.dev/reference/react/ViewTransition) + [addTransitionType](https://react.dev/reference/react/addTransitionType) — ver `contenido/react/TEMARIO.md` #55

---

## Qué es y para qué sirve

Cuando el estado cambia, React cambia el DOM **de golpe**: lo que había desaparece y lo nuevo aparece en el mismo instante. Casi siempre es lo que quieres. Pero a veces una animación corta ayuda a entender qué ha pasado: de dónde viene la ficha que acaba de aparecer, adónde ha ido el producto que has metido en la cesta, en qué orden han quedado las filas al ordenar.

Las transiciones de CSS solo animan un elemento que ya existe y cambia de estilo; no sirven para algo que aparece, desaparece o se va a otro sitio de la página. Para eso hacía falta una librería de animación, como Motion o react-spring, o la **View Transition API** del navegador, `document.startViewTransition()`, que encaja mal con React: hay que llamarla justo antes de que cambie el DOM, y en React no eres tú quien lo cambia.

React 19.3 (septiembre de 2026) hizo estable la pieza que faltaba: **`<ViewTransition>`, un componente con el que marcas qué partes de la interfaz se animan, mientras React se encarga de llamar a la API del navegador en el momento justo**.

```jsx
import { ViewTransition } from 'react'

{abierta && (
  <ViewTransition>
    <Oferta />
  </ViewTransition>
)}
```

Por debajo, el navegador saca una **foto** de cómo estaba la página, React aplica los cambios, el navegador saca otra foto de cómo ha quedado y **anima el paso de una a otra**. Por defecto, con un fundido: la foto de antes se desvanece mientras aparece la de después. Tres piezas trabajan juntas:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Qué, cuándo y cómo",
  "roles": [
    {
      "etiqueta": "Qué se anima",
      "rol": "<ViewTransition>",
      "descripcion": "Envuelve la parte de la interfaz que quieres animar. No pinta ningún elemento: le pone un nombre al primer elemento del DOM que tiene dentro mientras dura la animación."
    },
    {
      "etiqueta": "Cuándo",
      "rol": "Una transición",
      "descripcion": "Solo anima lo que cambia dentro de startTransition o useTransition (lección 51), al revelarse un Suspense (lección 48) o con useDeferredValue. Un set normal no anima."
    },
    {
      "etiqueta": "Cómo",
      "rol": "CSS: ::view-transition-*",
      "descripcion": "El fundido por defecto, o la animación que tú escribas en CSS para cada caso, con las clases que React pone a los pseudoelementos de la transición."
    }
  ]
}
```

## Tu primera animación: aparecer y desaparecer

La **Especiería El Zoco** vende especias a granel y cada semana tiene una oferta. La oferta va dentro de un `<ViewTransition>`, y el botón la enseña o la esconde. La casilla decide si el cambio de estado va dentro de `startTransition` o no:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La oferta de la semana, con y sin transición",
  "consigna": "Pulsa «Ver la oferta» y «Ocultar la oferta» varias veces: la oferta aparece y se va con un fundido. Desmarca «Usar startTransition» y repite: ahora aparece y desaparece de golpe.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ViewTransition, startTransition, useState } from 'react'\nimport './estilos.css'\n\nfunction Oferta() {\n  return (\n    <ViewTransition>\n      <aside className=\"oferta\">\n        <h2>Oferta de la semana</h2>\n        <p>Azafrán de La Mancha: dos tarros por 17 €.</p>\n      </aside>\n    </ViewTransition>\n  )\n}\n\nexport default function App() {\n  const [abierta, setAbierta] = useState(false)\n  const [conTransicion, setConTransicion] = useState(true)\n\n  function alternar() {\n    if (conTransicion) {\n      startTransition(() => {\n        setAbierta(!abierta)\n      })\n    } else {\n      setAbierta(!abierta)\n    }\n  }\n\n  return (\n    <main>\n      <h1>Especiería El Zoco</h1>\n      <label className=\"casilla\">\n        <input\n          type=\"checkbox\"\n          checked={conTransicion}\n          onChange={(e) => setConTransicion(e.target.checked)}\n        />\n        Usar startTransition\n      </label>\n      <button onClick={alternar}>{abierta ? 'Ocultar la oferta' : 'Ver la oferta'}</button>\n      {abierta && <Oferta />}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.4rem;\n  color: #7c2d12;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #9a3412;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #9a3412;\n  color: white;\n}\n\nbutton:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.muestra {\n  display: inline-block;\n  flex-shrink: 0;\n  width: 1.4rem;\n  height: 1.4rem;\n  border-radius: 50%;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.6rem;\n}\n\n.oferta {\n  margin-top: 0.8rem;\n  padding: 0.25rem 1rem;\n  border-radius: 8px;\n  background: #ffedd5;\n  border-left: 6px solid #ea580c;\n}\n\n/* La animación por defecto dura 0,25 s: aquí, más lenta para que se aprecie */\n::view-transition-group(*),\n::view-transition-old(*),\n::view-transition-new(*) {\n  animation-duration: 0.8s;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Si tu navegador no anima nada ni con la casilla marcada, mira la sección «Qué navegadores lo soportan», más abajo.

Con `startTransition`, React ve que un `<ViewTransition>` **entra** en la página (o **sale** de ella) dentro de una transición, y le pide al navegador que lo anime. La animación por defecto dura 0,25 segundos; aquí dura 0,8 gracias a la regla de `estilos.css`, que entenderás en un par de secciones.

## Solo dentro de una transición

La casilla enseña la regla más importante de `<ViewTransition>`: **un `set` normal no anima nada**. React trata las actualizaciones normales como urgentes, las que tienen que verse ya, y solo anima las que no lo son: las de `startTransition` o `useTransition` (lección 51), las de `useDeferredValue` y el momento en que un `<Suspense>` cambia su fallback por el contenido (lección 48).

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Catalogo() {\n  const [vista, setVista] = useState('lista')\n\n  return (\n    <>\n      <button onClick={() => setVista('lista')}>Lista</button>\n      <button onClick={() => startTransition(() => setVista('mosaico'))}>\n        Mosaico\n      </button>\n      <ViewTransition key={vista}>\n        {vista === 'lista' ? <Lista /> : <Mosaico />}\n      </ViewTransition>\n    </>\n  )\n}\n\n// Pulsas «Mosaico» y después «Lista».\n// ¿Qué cambios se animan?",
  "opciones": [
    "Los dos: ViewTransition anima cualquier cambio de lo que tiene dentro",
    "Solo el paso a «Mosaico»",
    "Solo el paso a «Lista»",
    "Ninguno: hay que llamar antes a document.startViewTransition()"
  ],
  "correcta": 1,
  "explicacion": "El clic en «Mosaico» cambia el estado dentro de startTransition, así que React anima la salida de la lista y la entrada del mosaico. El clic en «Lista» hace un set normal, urgente, y el cambio se aplica de golpe. Nunca llames tú a document.startViewTransition(): lo hace React, y si hay otra transición de vista en marcha en la página, la interrumpe."
}
```

## Las cuatro animaciones: enter, exit, update y share

React decide qué animación toca según cómo ha cambiado el árbol en esa transición. Hay cuatro casos, y cada uno tiene una prop con su nombre para darle una animación propia (lo verás en la sección siguiente):

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "enter: aparece",
      "texto": "El ViewTransition se monta en esta transición, como la oferta al pulsar «Ver la oferta». Ojo: solo cuenta si el ViewTransition va antes que cualquier elemento del DOM en lo que se monta (lo verás en Errores típicos)."
    },
    {
      "titulo": "exit: desaparece",
      "texto": "El ViewTransition se desmonta en esta transición. Es lo contrario de enter, con la misma condición."
    },
    {
      "titulo": "update: cambia",
      "texto": "Sigue montado, pero cambia algo de lo que tiene dentro (un texto, una clase, un estilo) o se mueve porque un hermano ha cambiado de tamaño o de sitio. Así se animan las filas de una lista al reordenarla."
    },
    {
      "titulo": "share: se va a otro sitio",
      "texto": "Un ViewTransition con un name se desmonta en un sitio y otro con el mismo name se monta en otro, en la misma transición. El navegador anima el paso de uno a otro como si fuera el mismo elemento."
    }
  ]
}
```

El caso `update` es el que anima una lista al reordenarla. Cada especia lleva su propio `<ViewTransition>` con la `key` de la fila, así que React puede seguir a cada una cuando cambia de sitio:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Reordenar el escaparate",
  "consigna": "Pulsa «Por precio» y «Por nombre»: cada fila se desliza hasta su sitio nuevo. Después quita el <ViewTransition> que envuelve cada <li> (deja el key en el <li>) y repite: las filas saltan de golpe.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ViewTransition, startTransition, useState } from 'react'\nimport { ESPECIAS, precio } from './especias'\nimport './estilos.css'\n\nconst ORDENES = {\n  nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),\n  precio: (a, b) => a.precio - b.precio,\n}\n\nexport default function App() {\n  const [orden, setOrden] = useState('nombre')\n  const especias = [...ESPECIAS].sort(ORDENES[orden])\n\n  function ordenar(nuevo) {\n    startTransition(() => {\n      setOrden(nuevo)\n    })\n  }\n\n  return (\n    <main>\n      <h1>Especiería El Zoco</h1>\n      <div role=\"group\" aria-label=\"Ordenar\">\n        <button aria-pressed={orden === 'nombre'} onClick={() => ordenar('nombre')}>\n          Por nombre\n        </button>\n        <button aria-pressed={orden === 'precio'} onClick={() => ordenar('precio')}>\n          Por precio\n        </button>\n      </div>\n      <ul className=\"especias\">\n        {especias.map((especia) => (\n          <ViewTransition key={especia.id}>\n            <li className=\"especia\">\n              <span className=\"muestra\" style={{ background: especia.color }} aria-hidden=\"true\" />\n              <span className=\"nombre\">{especia.nombre}</span>\n              <span>{precio(especia)}</span>\n            </li>\n          </ViewTransition>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "especias.jsx",
      "codigo": "export const ESPECIAS = [\n  {\n    id: 'pimenton',\n    nombre: 'Pimentón de la Vera',\n    origen: 'Cáceres',\n    color: '#b91c1c',\n    precio: 3.2,\n    nota: 'Secado al humo de leña de roble y encina. Lo hay dulce, agridulce y picante.',\n  },\n  {\n    id: 'azafran',\n    nombre: 'Azafrán de La Mancha',\n    origen: 'Castilla-La Mancha',\n    color: '#ea580c',\n    precio: 9.5,\n    nota: 'Cada flor da solo tres estigmas, que se separan y se tuestan a mano.',\n  },\n  {\n    id: 'comino',\n    nombre: 'Comino',\n    origen: 'India',\n    color: '#a16207',\n    precio: 2.4,\n    nota: 'Semillas de sabor terroso, básicas en adobos y en potajes de garbanzos.',\n  },\n  {\n    id: 'curcuma',\n    nombre: 'Cúrcuma',\n    origen: 'India',\n    color: '#eab308',\n    precio: 2.9,\n    nota: 'Raíz de la familia del jengibre que tiñe de amarillo todo lo que toca.',\n  },\n  {\n    id: 'canela',\n    nombre: 'Canela de Ceilán',\n    origen: 'Sri Lanka',\n    color: '#92400e',\n    precio: 4.1,\n    nota: 'Corteza fina enrollada en capas, más suave y dulce que la cassia.',\n  },\n  {\n    id: 'oregano',\n    nombre: 'Orégano',\n    origen: 'Grecia',\n    color: '#4d7c0f',\n    precio: 1.8,\n    nota: 'Hoja seca: frótala entre los dedos antes de echarla para que suelte el aroma.',\n  },\n]\n\nconst formato = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport function precio(especia) {\n  return formato.format(especia.precio)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.4rem;\n  color: #7c2d12;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #9a3412;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #9a3412;\n  color: white;\n}\n\nbutton:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.muestra {\n  display: inline-block;\n  flex-shrink: 0;\n  width: 1.4rem;\n  height: 1.4rem;\n  border-radius: 50%;\n}\n\n[role='group'] {\n  display: flex;\n  gap: 0.3rem;\n}\n\n.especias {\n  display: grid;\n  gap: 0.35rem;\n  margin-top: 0.8rem;\n  padding: 0;\n  list-style: none;\n}\n\n.especia {\n  display: flex;\n  align-items: center;\n  gap: 0.6rem;\n  padding: 0.4rem 0.6rem;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\n.especia .nombre {\n  flex: 1;\n}\n\n/* La animación por defecto dura 0,25 s: aquí, más lenta para que se aprecie */\n::view-transition-group(*),\n::view-transition-old(*),\n::view-transition-new(*) {\n  animation-duration: 0.8s;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Fíjate en lo que **no** hace `<ViewTransition>`: no anima cada elemento de dentro por separado. Anima **una foto** de todo lo que envuelve, que se mueve, se escala y se funde como una sola imagen. Por eso cada fila tiene su propio `<ViewTransition>`: con uno solo alrededor de la `<ul>`, la lista entera se fundiría de una foto a la otra y las filas no viajarían a su sitio.

## Tu propia animación: clases y `::view-transition-*`

Mientras dura la animación, el navegador construye sobre la página un árbol de **pseudoelementos** con las fotos. Por cada `<ViewTransition>` que se anima hay un grupo:

```text
::view-transition
└─ ::view-transition-group(nombre)
   └─ ::view-transition-image-pair(nombre)
      ├─ ::view-transition-old(nombre)   la foto de antes
      └─ ::view-transition-new(nombre)   la foto de después
```

El grupo se mueve y cambia de tamaño desde donde estaba hasta donde queda; dentro, la foto vieja se desvanece y la nueva aparece. El `nombre` lo pone React (uno distinto para cada `<ViewTransition>`), y la página entera tiene su propio grupo, `root`, que se funde igual.

Para darle a un caso tu propia animación, pásale **una clase** a la prop de ese caso, `enter`, `exit`, `update` o `share`, o a `default`, que vale para todos los que no indiques. React se la pone a los pseudoelementos, y tú los seleccionas en CSS con `::view-transition-new(.tu-clase)`. Además de una clase, cada prop admite `'auto'` (el fundido del navegador) y `'none'` (sin animación). La documentación de React recomienda este sistema en vez de poner tú `view-transition-name` y seleccionar por nombre, como verás en muchos ejemplos de la web.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La oferta sube al entrar y baja al salir",
  "codigo": "import { ViewTransition, startTransition, useState } from 'react'\nimport './estilos.css'\n\nfunction Oferta() {\n  return (\n    <ViewTransition enter=\"sube\" exit=\"baja\" default=\"none\">\n      <aside className=\"oferta\">\n        <h2>Oferta de la semana</h2>\n        <p>Azafrán de La Mancha: dos tarros por 17 €.</p>\n      </aside>\n    </ViewTransition>\n  )\n}\n\nexport default function App() {\n  const [abierta, setAbierta] = useState(false)\n  const [conTransicion, setConTransicion] = useState(true)\n\n  function alternar() {\n    if (conTransicion) {\n      startTransition(() => {\n        setAbierta(!abierta)\n      })\n    } else {\n      setAbierta(!abierta)\n    }\n  }\n\n  return (\n    <main>\n      <h1>Especiería El Zoco</h1>\n      <label className=\"casilla\">\n        <input\n          type=\"checkbox\"\n          checked={conTransicion}\n          onChange={(e) => setConTransicion(e.target.checked)}\n        />\n        Usar startTransition\n      </label>\n      <button onClick={alternar}>{abierta ? 'Ocultar la oferta' : 'Ver la oferta'}</button>\n      {abierta && <Oferta />}\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.4rem;\n  color: #7c2d12;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #9a3412;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #9a3412;\n  color: white;\n}\n\nbutton:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.muestra {\n  display: inline-block;\n  flex-shrink: 0;\n  width: 1.4rem;\n  height: 1.4rem;\n  border-radius: 50%;\n}\n\n.casilla {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n  margin-bottom: 0.6rem;\n}\n\n.oferta {\n  margin-top: 0.8rem;\n  padding: 0.25rem 1rem;\n  border-radius: 8px;\n  background: #ffedd5;\n  border-left: 6px solid #ea580c;\n}\n\n@keyframes subir {\n  from {\n    transform: translateY(1.5rem);\n    opacity: 0;\n  }\n}\n\n@keyframes bajar {\n  to {\n    transform: translateY(1.5rem);\n    opacity: 0;\n  }\n}\n\n/* La foto de después, cuando la oferta entra */\n::view-transition-new(.sube) {\n  animation: 0.5s ease-out both subir;\n}\n\n/* La foto de antes, cuando la oferta sale */\n::view-transition-old(.baja) {\n  animation: 0.4s ease-in both bajar;\n}\n\n/* Quien pide menos movimiento en su sistema, no lo ve */\n@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) {\n    animation: none !important;\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "<ViewTransition enter=\"sube\" exit=\"baja\" default=\"none\">",
      "nota": "Una clase para cuando entra y otra para cuando sale. default=\"none\" apaga los demás casos: si dentro cambiara un texto (update), no habría animación."
    },
    {
      "fragmento": "startTransition(() => {",
      "nota": "Sigue haciendo falta la transición: las clases dicen cómo se anima, no cuándo. Sin ella, nada se anima."
    },
    {
      "fragmento": "{abierta && <Oferta />}",
      "nota": "Oferta se monta y se desmonta entera, con su ViewTransition como primer elemento: eso es lo que activa enter y exit."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

En `estilos.css` del bloque (no se ve en el código anotado, pero se aplica) están las reglas:

```css
::view-transition-new(.sube) {
  animation: 0.5s ease-out both subir;
}

::view-transition-old(.baja) {
  animation: 0.4s ease-in both bajar;
}
```

Al entrar, la oferta solo tiene foto **nueva** (antes no estaba), así que la animación de entrada va en `::view-transition-new`; al salir solo tiene foto **vieja**, y la de salida va en `::view-transition-old`. Las `@keyframes` `subir` y `bajar` son de CSS normal: el temario de CSS las explica a fondo.

Y una regla que no debería faltar nunca: **React no desactiva las animaciones a quien ha pedido menos movimiento** en su sistema. Lo comprobamos en Chromium con `prefers-reduced-motion: reduce`: la transición se anima igual. La documentación recomienda apagarlas o suavizarlas tú con la media query, como hace el final de `estilos.css`:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

## Según la dirección: `addTransitionType`

En un carrusel, el mismo cambio de estado puede venir de dos sitios. Pasar a la especia siguiente debería entrar por la derecha; volver a la anterior, por la izquierda. Pero para React los dos son «cambió el índice». **`addTransitionType` le añade a la transición un tipo, una etiqueta que dice por qué ha ocurrido**, y las props de `<ViewTransition>` pueden elegir la animación según ese tipo:

```jsx
function siguiente() {
  startTransition(() => {
    addTransitionType('siguiente')
    setIndice((i) => (i + 1) % ESPECIAS.length)
  })
}
```

El tipo es un texto cualquiera, y se llama **dentro** de `startTransition`, junto al `set`. En el `<ViewTransition>`, cada prop recibe un objeto que asocia cada tipo con su clase:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El carrusel de especias, según la dirección",
  "codigo": "import { ViewTransition, addTransitionType, startTransition, useState } from 'react'\n\nconst ESPECIAS = [\n  { id: 'pimenton', nombre: 'Pimentón de la Vera', color: '#b91c1c', origen: 'Cáceres',\n    nota: 'Secado al humo de leña de roble y encina. Lo hay dulce, agridulce y picante.' },\n  { id: 'azafran', nombre: 'Azafrán de La Mancha', color: '#ea580c', origen: 'Castilla-La Mancha',\n    nota: 'Cada flor da solo tres estigmas, que se separan y se tuestan a mano.' },\n  { id: 'comino', nombre: 'Comino', color: '#a16207', origen: 'India',\n    nota: 'Semillas de sabor terroso, básicas en adobos y en potajes de garbanzos.' },\n  { id: 'curcuma', nombre: 'Cúrcuma', color: '#eab308', origen: 'India',\n    nota: 'Raíz de la familia del jengibre que tiñe de amarillo todo lo que toca.' },\n]\n\nexport default function App() {\n  const [indice, setIndice] = useState(0)\n  const especia = ESPECIAS[indice]\n\n  function mover(paso, tipo) {\n    startTransition(() => {\n      addTransitionType(tipo)\n      setIndice((i) => (i + paso + ESPECIAS.length) % ESPECIAS.length)\n    })\n  }\n\n  return (\n    <main>\n      <h1>Especiería El Zoco</h1>\n      <p className=\"contador\">\n        {indice + 1} de {ESPECIAS.length}\n      </p>\n      <ViewTransition\n        key={especia.id}\n        enter={{ siguiente: 'desde-la-derecha', anterior: 'desde-la-izquierda' }}\n        exit={{ siguiente: 'hacia-la-izquierda', anterior: 'hacia-la-derecha' }}\n      >\n        <article className=\"ficha\">\n          <span className=\"muestra\" style={{ background: especia.color }} aria-hidden=\"true\" />\n          <h2>{especia.nombre}</h2>\n          <p>{especia.nota}</p>\n          <p>Origen: {especia.origen}</p>\n        </article>\n      </ViewTransition>\n      <nav aria-label=\"Especias\">\n        <button onClick={() => mover(-1, 'anterior')}>Anterior</button>\n        <button onClick={() => mover(1, 'siguiente')}>Siguiente</button>\n      </nav>\n    </main>\n  )\n}",
  "css": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.4rem;\n  color: #7c2d12;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #9a3412;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #9a3412;\n  color: white;\n}\n\nbutton:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.muestra {\n  display: inline-block;\n  flex-shrink: 0;\n  width: 1.4rem;\n  height: 1.4rem;\n  border-radius: 50%;\n}\n\n.contador {\n  margin: 0 0 0.4rem;\n  color: #57534e;\n}\n\n.ficha {\n  padding: 0.6rem 1rem;\n  border-radius: 10px;\n  background: #fff7ed;\n}\n\n.ficha .muestra {\n  width: 3rem;\n  height: 3rem;\n}\n\n.ficha h2 {\n  margin: 0.4rem 0;\n  font-size: 1.15rem;\n}\n\nnav {\n  display: flex;\n  gap: 0.4rem;\n  margin-top: 0.8rem;\n}\n\n@keyframes entra-por-la-derecha {\n  from {\n    transform: translateX(4rem);\n    opacity: 0;\n  }\n}\n\n@keyframes entra-por-la-izquierda {\n  from {\n    transform: translateX(-4rem);\n    opacity: 0;\n  }\n}\n\n@keyframes sale-por-la-izquierda {\n  to {\n    transform: translateX(-4rem);\n    opacity: 0;\n  }\n}\n\n@keyframes sale-por-la-derecha {\n  to {\n    transform: translateX(4rem);\n    opacity: 0;\n  }\n}\n\n::view-transition-new(.desde-la-derecha) {\n  animation: 0.4s ease-out both entra-por-la-derecha;\n}\n\n::view-transition-new(.desde-la-izquierda) {\n  animation: 0.4s ease-out both entra-por-la-izquierda;\n}\n\n::view-transition-old(.hacia-la-izquierda) {\n  animation: 0.4s ease-in both sale-por-la-izquierda;\n}\n\n::view-transition-old(.hacia-la-derecha) {\n  animation: 0.4s ease-in both sale-por-la-derecha;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) {\n    animation: none !important;\n  }\n}",
  "anotaciones": [
    {
      "fragmento": "addTransitionType(tipo)",
      "nota": "Dentro de startTransition y junto al set: así React asocia el tipo a esta transición. Se puede llamar varias veces para añadir varios tipos."
    },
    {
      "fragmento": "key={especia.id}",
      "nota": "Con una key distinta para cada especia, React desmonta el ViewTransition de la anterior (exit) y monta uno nuevo (enter). Sin la key sería el mismo, y solo habría un update con el fundido normal."
    },
    {
      "fragmento": "enter={{ siguiente: 'desde-la-derecha', anterior: 'desde-la-izquierda' }}",
      "nota": "Un objeto en vez de un texto: para cada tipo, la clase que se pone al entrar. Si llegara un tipo que no está, React usaría la entrada default del objeto, si la hay."
    },
    {
      "fragmento": "exit={{ siguiente: 'hacia-la-izquierda', anterior: 'hacia-la-derecha' }}",
      "nota": "Al ir a la siguiente, la ficha vieja sale por la izquierda y la nueva entra por la derecha; al volver, al revés. Las cuatro clases están definidas en el CSS del bloque."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Pulsa «Siguiente» y «Anterior»: la ficha nueva entra siempre por el lado que toca. Las cuatro clases están en el CSS del bloque, con la misma forma que las de la oferta:

```css
::view-transition-new(.desde-la-derecha) {
  animation: 0.4s ease-out both entra-por-la-derecha;
}

::view-transition-old(.hacia-la-izquierda) {
  animation: 0.4s ease-in both sale-por-la-izquierda;
}
```

Los tipos se borran después de cada commit, y si en una transición se juntan varias actualizaciones, se juntan también sus tipos. Las props de clase no son la única forma de usarlos. También puedes:

- **Seleccionar por tipo en CSS**: React se los pasa al navegador, así que `:root:active-view-transition-type(siguiente)` aplica reglas solo durante las transiciones de ese tipo.
- **Animar con JavaScript**: las props `onEnter`, `onExit`, `onUpdate` y `onShare` reciben la instancia de la transición y la lista de tipos, y te dejan animar los pseudoelementos con la Web Animations API. Cada una debe devolver una función de limpieza que cancele la animación.

Si llamas a `addTransitionType` fuera de `startTransition`, el tipo no se aplica a nada y React te avisa en la consola:

```text
addTransitionType can only be called inside a `startTransition()` callback. It must be associated with a specific Transition.
```

Es decir: solo se puede llamar dentro de la función que le pasas a `startTransition()`, porque el tipo tiene que pertenecer a una transición concreta.

## Elemento compartido: de un sitio a otro con `name`

Lo más vistoso de las transiciones de vista es el **elemento compartido**: algo que está en un sitio, desaparece y aparece en otro, y el navegador lo anima como si **viajara** de uno a otro. En El Zoco, al meter una especia en la cesta, su muestra de color vuela desde el escaparate hasta la cesta.

Para eso, **los dos `<ViewTransition>` tienen que llevar el mismo `name`**: uno se desmonta del escaparate y el otro se monta en la cesta, en la misma transición. Es el caso `share`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La muestra vuela hasta la cesta",
  "consigna": "Añade un par de especias a la cesta y quita alguna: la muestra de color viaja de una columna a otra. Después cambia el name por uno fijo, name=\"muestra\", y mira la consola.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { ViewTransition, startTransition, useState } from 'react'\nimport { ESPECIAS } from './especias'\nimport './estilos.css'\n\nfunction Muestra({ especia }) {\n  return (\n    <ViewTransition name={`muestra-${especia.id}`}>\n      <span className=\"muestra\" style={{ background: especia.color }} aria-hidden=\"true\" />\n    </ViewTransition>\n  )\n}\n\nexport default function App() {\n  const [enCesta, setEnCesta] = useState([])\n  const escaparate = ESPECIAS.filter((e) => !enCesta.includes(e.id))\n  const cesta = ESPECIAS.filter((e) => enCesta.includes(e.id))\n\n  function anadir(id) {\n    startTransition(() => {\n      setEnCesta([...enCesta, id])\n    })\n  }\n\n  function quitar(id) {\n    startTransition(() => {\n      setEnCesta(enCesta.filter((otro) => otro !== id))\n    })\n  }\n\n  return (\n    <main>\n      <h1>Especiería El Zoco</h1>\n      <div className=\"columnas\">\n        <section>\n          <h2>Escaparate</h2>\n          <ul>\n            {escaparate.map((especia) => (\n              <li key={especia.id}>\n                <Muestra especia={especia} />\n                <button onClick={() => anadir(especia.id)}>Añadir {especia.nombre}</button>\n              </li>\n            ))}\n          </ul>\n        </section>\n        <section className=\"cesta\">\n          <h2>Tu cesta</h2>\n          {cesta.length === 0 && <p>Vacía</p>}\n          <ul>\n            {cesta.map((especia) => (\n              <li key={especia.id}>\n                <Muestra especia={especia} />\n                <button onClick={() => quitar(especia.id)}>Quitar {especia.nombre}</button>\n              </li>\n            ))}\n          </ul>\n        </section>\n      </div>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "especias.jsx",
      "codigo": "export const ESPECIAS = [\n  {\n    id: 'pimenton',\n    nombre: 'Pimentón de la Vera',\n    origen: 'Cáceres',\n    color: '#b91c1c',\n    precio: 3.2,\n    nota: 'Secado al humo de leña de roble y encina. Lo hay dulce, agridulce y picante.',\n  },\n  {\n    id: 'azafran',\n    nombre: 'Azafrán de La Mancha',\n    origen: 'Castilla-La Mancha',\n    color: '#ea580c',\n    precio: 9.5,\n    nota: 'Cada flor da solo tres estigmas, que se separan y se tuestan a mano.',\n  },\n  {\n    id: 'comino',\n    nombre: 'Comino',\n    origen: 'India',\n    color: '#a16207',\n    precio: 2.4,\n    nota: 'Semillas de sabor terroso, básicas en adobos y en potajes de garbanzos.',\n  },\n  {\n    id: 'curcuma',\n    nombre: 'Cúrcuma',\n    origen: 'India',\n    color: '#eab308',\n    precio: 2.9,\n    nota: 'Raíz de la familia del jengibre que tiñe de amarillo todo lo que toca.',\n  },\n  {\n    id: 'canela',\n    nombre: 'Canela de Ceilán',\n    origen: 'Sri Lanka',\n    color: '#92400e',\n    precio: 4.1,\n    nota: 'Corteza fina enrollada en capas, más suave y dulce que la cassia.',\n  },\n  {\n    id: 'oregano',\n    nombre: 'Orégano',\n    origen: 'Grecia',\n    color: '#4d7c0f',\n    precio: 1.8,\n    nota: 'Hoja seca: frótala entre los dedos antes de echarla para que suelte el aroma.',\n  },\n]\n\nconst formato = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport function precio(especia) {\n  return formato.format(especia.precio)\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.4rem;\n  color: #7c2d12;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #9a3412;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #9a3412;\n  color: white;\n}\n\nbutton:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.muestra {\n  display: inline-block;\n  flex-shrink: 0;\n  width: 1.4rem;\n  height: 1.4rem;\n  border-radius: 50%;\n}\n\n.columnas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));\n  gap: 1rem;\n}\n\nh2 {\n  margin: 0 0 0.5rem;\n  font-size: 1.05rem;\n}\n\nul {\n  display: grid;\n  gap: 0.35rem;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  display: flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\nli button {\n  flex: 1;\n  padding: 0.3rem 0.5rem;\n  text-align: left;\n  font-size: 0.9rem;\n}\n\n.cesta {\n  padding: 0.6rem;\n  border: 2px dashed #fdba74;\n  border-radius: 10px;\n}\n\n/* La animación por defecto dura 0,25 s: aquí, más lenta para que se aprecie */\n::view-transition-group(*),\n::view-transition-old(*),\n::view-transition-new(*) {\n  animation-duration: 0.8s;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true
}
```

Con el `name` fijo, React protesta en la consola nada más cargar, porque el escaparate ya monta seis muestras con el mismo nombre (en la consola, el `%s` sale sustituido por el nombre):

```text
There are two <ViewTransition name=%s> components with the same name mounted at the same time. This is not supported and will cause View Transitions to error. Try to use a more unique name e.g. by using a namespace prefix and adding the id of an item to the name.
```

Es decir: hay dos `<ViewTransition>` con el mismo nombre montados a la vez, y eso no está permitido, porque romperá las transiciones; usa un nombre más único, por ejemplo con un prefijo y el id del elemento. Va seguido de un segundo error, «The existing <ViewTransition name=%s> duplicate has this stack trace.», con la pila del otro. Y al añadir una especia, en la consola del navegador (no en la de la vista previa) aparece el aviso del propio navegador (en Chrome, «Unexpected duplicate view-transition-name: muestra»): la especia pasa a la cesta, pero sin ninguna animación. Por eso el ejemplo usa `` `muestra-${especia.id}` ``: **un nombre tiene que ser único en toda la página en cada momento**. react.dev aconseja guardar los prefijos en constantes de un módulo aparte, para que dos partes de la app no elijan el mismo sin querer.

Tres detalles más de react.dev sobre `name`:

- **Úsalo solo para elementos compartidos.** Para todo lo demás, deja que React ponga un nombre único: un nombre puesto a mano puede emparejar cosas que no querías animar juntas.
- **Si uno de los dos lados está fuera de la pantalla**, no se forma la pareja: cada uno se anima por su cuenta, como una salida y una entrada normales. Así nada vuela desde fuera de la vista.
- **Si en medio aparece un fallback de `<Suspense>`** porque lo nuevo tiene que esperar, tampoco hay elemento compartido.

## Con `<Activity>` y con `<Suspense>`

Las dos piezas de las lecciones 48 y 54 se combinan con `<ViewTransition>`:

```jsx
// Un panel que se esconde sin perder su estado (lección 54) y se anima
<Activity mode={abierto ? 'visible' : 'hidden'}>
  <ViewTransition enter="sube" exit="baja">
    <Cesta />
  </ViewTransition>
</Activity>

// Del fallback al contenido, con un fundido
<ViewTransition update="auto" default="none">
  <Suspense fallback={<Cargando />}>
    <Ficha />
  </Suspense>
</ViewTransition>
```

Con **Activity**, si el panel se muestra dentro de una transición, su `<ViewTransition>` hace la animación de entrada; si se esconde, la de salida. Y el contenido conserva su estado entre una vez y otra.

Con **Suspense**, el `<ViewTransition>` de fuera ve el cambio del fallback al contenido como un `update` y lo funde. El anuncio de React 19.3 recomienda ponerlo así, con `update="auto"` y `default="none"`: que el fallback aparezca sin animación, que el paso del fallback al contenido sí se anime, y que lo que ya estaba cargado aparezca al momento. Animar algo que podría salir instantáneo solo hace la app más lenta.

El proyecto 97, una galería de fotos, junta las tres cosas: elemento compartido entre la cuadrícula y el detalle, dirección con `addTransitionType` y pestañas con `<Activity>`.

## Qué navegadores lo soportan

`<ViewTransition>` no anima nada por sí mismo: usa la View Transition API del navegador. React la llama con un objeto, `document.startViewTransition({ update, types })`, y esa forma la tienen, según la tabla de compatibilidad de MDN, **Chrome y Edge desde la versión 125, Safari desde la 18.2 y Firefox desde la 147**. Las versiones actuales de los cuatro ya la tienen, pero quien no actualiza el navegador puede tener una anterior.

En un navegador sin la API, o con una versión que no acepta ese objeto, **React aplica el cambio sin animarlo**: sin errores, con el mismo resultado final. Lo comprobamos en Chromium quitando `document.startViewTransition` antes de cargar React: la oferta y el carrusel cambian de golpe y sin ningún aviso. Por eso las animaciones de vista son una mejora progresiva: nadie se queda sin la funcionalidad, solo sin el adorno.

Dos avisos más de react.dev:

- **No llames tú a `document.startViewTransition()`**. Lo hace React, y si otra cosa de la página empieza una transición de vista, React la interrumpe. Si usabas otra forma de lanzarlas, la recomendación es pasarte a `<ViewTransition>`.
- **Solo funciona en el DOM.** React Native y otras plataformas todavía no lo tienen.

Un último aviso, para los routers: si una navegación «Atrás» llega por el evento `popstate` del navegador, React no la anima, porque tiene que terminar al momento para que el navegador restaure el scroll y los formularios. react.dev explica que los routers lo solucionan pasándose a la Navigation API.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Las comprobaciones no ven animaciones",
  "contenido": "Una animación dura medio segundo y no deja rastro: las comprobaciones de los ejercicios solo pueden mirar cómo queda la interfaz al terminar. Que se anime y en qué dirección lo compruebas tú, mirando la vista previa."
}
```

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "De una lista a un detalle",
      "texto": "La miniatura de un producto, una foto o una tarjeta que crece hasta la página de detalle, y vuelve a su sitio al cerrar. Es el elemento compartido."
    },
    {
      "titulo": "Navegar con dirección",
      "texto": "Carruseles, pasos de un asistente o páginas de un router: la página nueva entra por la derecha al avanzar y por la izquierda al volver, con addTransitionType."
    },
    {
      "titulo": "Listas que cambian",
      "texto": "Reordenar, filtrar, añadir o quitar filas: cada una con su ViewTransition y su key, para que se vea adónde va cada cosa."
    },
    {
      "titulo": "Lo que carga",
      "texto": "Fundir el paso de un esqueleto de carga al contenido de verdad, envolviendo el Suspense."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Para un hover, un foco o un botón que cambia de color basta una transición de CSS. Para arrastrar, gestos o animaciones con física, una librería como Motion o react-spring sigue siendo la herramienta. Y nada que el usuario repita cien veces al día debería obligarle a esperar una animación."
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
      "mito": "ViewTransition anima cualquier cambio de lo que envuelve",
      "realidad": "Solo los que ocurren dentro de una transición: startTransition, useTransition, useDeferredValue o la revelación de un Suspense. Un set normal se aplica de golpe."
    },
    {
      "mito": "Anima cada elemento de dentro por separado",
      "realidad": "Anima una foto de todo lo que envuelve como una sola imagen. Si quieres que varias piezas se muevan cada una por su lado, cada una necesita su propio ViewTransition."
    },
    {
      "mito": "Hay que poner un name a cada ViewTransition",
      "realidad": "Solo a los elementos compartidos. Sin name, React pone uno único a cada uno, que es lo que evita emparejar cosas por error."
    },
    {
      "mito": "React respeta la preferencia de reducir el movimiento",
      "realidad": "No lo hace por ti: la transición se anima igual. Añade tú la media query prefers-reduced-motion para apagar o suavizar las animaciones."
    },
    {
      "mito": "En un navegador sin soporte, la app se rompe",
      "realidad": "React aplica el cambio sin animar, sin errores. El resultado final es el mismo."
    }
  ]
}
```

## Errores típicos

**Un elemento del DOM por encima del `<ViewTransition>`.** Las animaciones de entrada y salida solo se activan si el `<ViewTransition>` es lo primero que se monta o se desmonta, antes que cualquier elemento:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Oferta() {\n  return (\n    <div className=\"marco\">\n      <ViewTransition enter=\"sube\" exit=\"baja\">\n        <aside className=\"oferta\">…</aside>\n      </ViewTransition>\n    </div>\n  )\n}\n\n// En App: {abierta && <Oferta />}\n// Pulsas «Ver la oferta», dentro de startTransition.\n// ¿Cómo aparece la oferta?",
  "opciones": [
    "Sube, con la animación de la clase sube",
    "Aparece con el fundido por defecto, pero no sube",
    "Aparece de golpe, sin ninguna animación",
    "Da un error: ViewTransition no puede ir dentro de un div"
  ],
  "correcta": 2,
  "explicacion": "Lo que entra en la página es el div, no el ViewTransition: este va dentro y no cuenta como entrada. Como ningún ViewTransition entra, sale ni cambia, React ni siquiera empieza una transición de vista, y la oferta aparece de golpe, sin errores ni avisos. React lo hace a propósito, para no animar de más ni de menos. El arreglo es poner el ViewTransition fuera del div, como lo primero que devuelve Oferta."
}
```

**Cambiar el estado sin transición.** El `<ViewTransition>` está bien puesto, pero el `set` va suelto en el `onClick`. No hay error ni aviso: simplemente, nada se anima.

**Olvidar la `key` en un carrusel.** Sin `key`, el `<ViewTransition>` es el mismo para todas las fichas y solo cambia lo de dentro: React lo trata como un `update`, con el fundido normal, y las clases de `enter` y `exit` no se usan nunca.

**El mismo `name` en todos los elementos de una lista.** Funciona mientras solo hay uno montado y falla en cuanto hay dos, con el error «There are two <ViewTransition name=…> components with the same name mounted at the same time». Añade el id al nombre.

**Llamar a `addTransitionType` fuera de `startTransition`.** El tipo no se aplica, y React avisa en la consola con «addTransitionType can only be called inside a `startTransition()` callback».

**Animar sin pensar en quien no quiere animaciones.** Sin la media query `prefers-reduced-motion`, la animación se ve igual para todo el mundo.

## Ejercicios

El Zoco publica cada mes una receta con sus especias, paso a paso. Este mes, pollo al chilindrón. Ahora mismo solo funciona «Paso siguiente», y los pasos cambian de golpe.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La receta, paso a paso y con dirección",
  "consigna": "Añade «Paso anterior» (desactivado en el primer paso) y haz que «Empezar de nuevo» vuelva al paso 1. Cada cambio, en startTransition con un tipo: siguiente, anterior o reinicio. Envuelve el artículo en un ViewTransition con key y las clases de estilos.css; el reinicio, con el fundido normal. Las comprobaciones miran a qué paso llegas, no la animación: esa, mírala tú.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nconst PASOS = [\n  'Trocea el pollo, salpimiéntalo y dóralo en una cazuela con aceite.',\n  'Sácalo y, en el mismo aceite, pocha cebolla, ajo y pimiento rojo.',\n  'Añade una cucharadita de pimentón de la Vera y remueve sin que se queme.',\n  'Echa el tomate triturado y deja que se haga diez minutos.',\n  'Devuelve el pollo a la cazuela y cuécelo cuarenta minutos a fuego lento.',\n]\n\nexport default function App() {\n  const [paso, setPaso] = useState(0)\n\n  function siguiente() {\n    setPaso(paso + 1)\n  }\n\n  // Falta «Paso anterior» y que «Empezar de nuevo» funcione.\n  // Cada cambio de paso, en una transición con su tipo, y el artículo,\n  // dentro de un ViewTransition que use las clases de estilos.css.\n\n  return (\n    <main>\n      <h1>Receta del mes: pollo al chilindrón</h1>\n      <article className=\"paso\">\n        <h2>\n          Paso {paso + 1} de {PASOS.length}\n        </h2>\n        <p>{PASOS[paso]}</p>\n      </article>\n      <nav aria-label=\"Pasos de la receta\">\n        {paso < PASOS.length - 1 ? (\n          <button onClick={siguiente}>Paso siguiente</button>\n        ) : (\n          <button>Empezar de nuevo</button>\n        )}\n      </nav>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 34rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.6rem;\n  font-size: 1.4rem;\n  color: #7c2d12;\n}\n\nbutton {\n  padding: 0.4rem 0.8rem;\n  border: 2px solid #9a3412;\n  border-radius: 6px;\n  background: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton[aria-pressed='true'] {\n  background: #9a3412;\n  color: white;\n}\n\nbutton:disabled {\n  opacity: 0.4;\n  cursor: default;\n}\n\n.muestra {\n  display: inline-block;\n  flex-shrink: 0;\n  width: 1.4rem;\n  height: 1.4rem;\n  border-radius: 50%;\n}\n\n.paso {\n  min-height: 7rem;\n  padding: 0.6rem 1rem;\n  border-radius: 10px;\n  background: #fff7ed;\n}\n\n.paso h2 {\n  margin: 0 0 0.4rem;\n  font-size: 1.05rem;\n  color: #9a3412;\n}\n\nnav {\n  display: flex;\n  gap: 0.4rem;\n  margin-top: 0.8rem;\n}\n\n/* Las clases para usar en el ViewTransition:\n   desde-la-derecha y desde-la-izquierda (enter),\n   hacia-la-izquierda y hacia-la-derecha (exit) */\n\n@keyframes entra-por-la-derecha {\n  from {\n    transform: translateX(4rem);\n    opacity: 0;\n  }\n}\n\n@keyframes entra-por-la-izquierda {\n  from {\n    transform: translateX(-4rem);\n    opacity: 0;\n  }\n}\n\n@keyframes sale-por-la-izquierda {\n  to {\n    transform: translateX(-4rem);\n    opacity: 0;\n  }\n}\n\n@keyframes sale-por-la-derecha {\n  to {\n    transform: translateX(4rem);\n    opacity: 0;\n  }\n}\n\n::view-transition-new(.desde-la-derecha) {\n  animation: 0.4s ease-out both entra-por-la-derecha;\n}\n\n::view-transition-new(.desde-la-izquierda) {\n  animation: 0.4s ease-out both entra-por-la-izquierda;\n}\n\n::view-transition-old(.hacia-la-izquierda) {\n  animation: 0.4s ease-in both sale-por-la-izquierda;\n}\n\n::view-transition-old(.hacia-la-derecha) {\n  animation: 0.4s ease-in both sale-por-la-derecha;\n}\n\n@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) {\n    animation: none !important;\n  }\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "comprobaciones": [
    {
      "descripcion": "Al empezar se ve el paso 1 de 5",
      "pasos": [],
      "espera": {
        "rol": "heading",
        "nombre": "Paso 1 de 5"
      }
    },
    {
      "descripcion": "Al pulsar «Paso siguiente», se ve el paso 2 con su texto",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso siguiente"
          }
        }
      ],
      "espera": {
        "texto": "Sácalo y, en el mismo aceite, pocha cebolla, ajo y pimiento rojo."
      }
    },
    {
      "descripcion": "«Paso anterior» vuelve al paso de antes",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso anterior"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Paso 2 de 5"
      }
    },
    {
      "descripcion": "En el paso 1, «Paso anterior» no lleva a ningún sitio",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso anterior"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Paso 1 de 5"
      }
    },
    {
      "descripcion": "En el último paso, «Empezar de nuevo» vuelve al paso 1",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Paso siguiente"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Empezar de nuevo"
          }
        }
      ],
      "espera": {
        "rol": "heading",
        "nombre": "Paso 1 de 5"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el carrusel de especias, añade una tercera forma de moverse: unos puntos debajo de la ficha, uno por especia, que llevan directamente a cada una. Usa el tipo `siguiente` o `anterior` según si el punto pulsado está a la derecha o a la izquierda del actual.
2. En el escaparate que se reordena, añade un filtro «Solo las de menos de 3 €». Comprueba que las filas que desaparecen y las que vuelven también se animan, y dales una animación de salida propia con la prop `exit`.
3. Combina la cesta con la lección 54: un botón «Ver la cesta» que la muestra y la esconde con `<Activity>`, envuelta en un `<ViewTransition>` con `enter` y `exit`, sin que pierda su contenido.
4. Activa en tu sistema la opción de reducir el movimiento (en macOS, Accesibilidad > Pantalla > Reducir movimiento; en Windows, Accesibilidad > Efectos visuales > Efectos de animación) y comprueba que la receta del ejercicio ya no se anima.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<ViewTransition>",
      "descripcion": "La referencia completa: cómo funciona por dentro, las cuatro animaciones, clases y eventos, listas, Suspense, Activity y los problemas más comunes.",
      "url": "https://react.dev/reference/react/ViewTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "addTransitionType",
      "descripcion": "Los tipos de transición: con clases, con selectores de CSS por tipo y con los eventos de ViewTransition.",
      "url": "https://react.dev/reference/react/addTransitionType",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React 19.3",
      "descripcion": "El anuncio de la versión que hizo estables ViewTransition y addTransitionType, con los principios para animar bien con Suspense.",
      "url": "https://react.dev/blog/2026/09/09/react-19-3",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "View Transition API",
      "descripcion": "La API del navegador que usa React por debajo: el proceso de las fotos, el árbol de pseudoelementos y la compatibilidad de cada navegador.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API",
      "etiqueta": "MDN"
    },
    {
      "titulo": "Using view transition types",
      "descripcion": "Cómo funcionan los tipos en el navegador y el selector :active-view-transition-type().",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using_types",
      "etiqueta": "MDN"
    },
    {
      "titulo": "prefers-reduced-motion",
      "descripcion": "La media query para respetar a quien pide menos movimiento en su sistema.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion",
      "etiqueta": "MDN"
    }
  ]
}
```
