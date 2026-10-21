# `useFormStatus`: el estado del envío desde un hijo

- **Módulo:** Formularios y Actions
- **Slug:** `useformstatus-el-estado-del-envio-desde-un-hijo` (autogenerado del título)
- **Orden:** 590
- **Fuentes:** [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus) — ver `contenido/react/TEMARIO.md` #59

---

## Qué es y para qué sirve

En la lección 57 viste que un «Enviando…» hecho con `useState` dentro de la acción no llega a salir: los `set` de una acción no se ven hasta que la acción termina (si no lo recuerdas, repasa el `predice` de «Dentro de una transición»). En la 58, `useActionState` te dio `isPending`, que sí funciona. Pero `isPending` vive en el componente que llama a `useActionState`: si el botón de enviar es un componente aparte, hay que pasárselo por props. Y en una aplicación con veinte formularios, el botón de enviar es justo lo que quieres escribir una sola vez.

**`useFormStatus` deja a cualquier componente que esté dentro de un `<form>` preguntar cómo va el envío de ese formulario.** No recibe argumentos y se importa de `react-dom`, no de `react`, porque depende del `<form>` del DOM:

```jsx
import { useFormStatus } from 'react-dom'

function BotonEnviar() {
  const { pending, data, method, action } = useFormStatus()
  // ...
}
```

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que devuelve useFormStatus",
  "roles": [
    {
      "etiqueta": "pending",
      "rol": "¿Se está enviando?",
      "descripcion": "true desde que el formulario se envía hasta que su acción termina. false en cualquier otro momento."
    },
    {
      "etiqueta": "data",
      "rol": "Lo que se está enviando",
      "descripcion": "El mismo FormData que recibe la acción, con el botón que envió incluido si tiene name. null cuando no hay ningún envío en marcha."
    },
    {
      "etiqueta": "method",
      "rol": "«get» o «post»",
      "descripcion": "El método del formulario durante el envío. Con una función en action vale «get», porque no se pone method. null si no hay envío."
    },
    {
      "etiqueta": "action",
      "rol": "La función que se está ejecutando",
      "descripcion": "La acción del <form> o la del formAction del botón que lo envió. null si no hay envío, o si action es una URL."
    }
  ]
}
```

## Un botón que sabe si su formulario se está enviando

La **Arrocería La Barraca** coge reservas por la web. El botón de enviar es un componente propio, `BotonEnviar`, y la API simulada tarda segundo y medio en contestar.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Reservar mesa en la Arrocería La Barraca",
  "codigo": "import { useState } from 'react'\nimport { useFormStatus } from 'react-dom'\n\nfunction BotonEnviar({ children }) {\n  const { pending } = useFormStatus()\n  return (\n    <button type=\"submit\" disabled={pending}>\n      {pending ? 'Enviando…' : children}\n    </button>\n  )\n}\n\nexport default function App() {\n  const [reservas, setReservas] = useState([])\n\n  async function reservar(formData) {\n    const reserva = {\n      nombre: formData.get('nombre'),\n      comensales: Number(formData.get('comensales')),\n      hora: formData.get('hora'),\n    }\n    const respuesta = await fetch('/api/reservas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(reserva),\n    })\n    const guardada = await respuesta.json()\n    setReservas((anteriores) => [...anteriores, guardada])\n  }\n\n  return (\n    <main>\n      <h1>Arrocería La Barraca</h1>\n      <form action={reservar}>\n        <label>\n          A nombre de <input name=\"nombre\" required />\n        </label>\n        <label>\n          Comensales <input name=\"comensales\" type=\"number\" min=\"1\" max=\"12\" defaultValue=\"2\" />\n        </label>\n        <label>\n          Hora\n          <select name=\"hora\">\n            <option>13:30</option>\n            <option>14:30</option>\n            <option>21:00</option>\n          </select>\n        </label>\n        <BotonEnviar>Reservar mesa</BotonEnviar>\n      </form>\n      <h2>Reservas de hoy</h2>\n      <ul>\n        {reservas.map((r) => (\n          <li key={r.id}>\n            {r.hora} · {r.nombre} · {r.comensales} personas\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #a16207;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fde68a;\n  border-radius: 8px;\n  background: #fefce8;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton:disabled {\n  cursor: progress;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #854d0e;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n",
  "anotaciones": [
    {
      "fragmento": "import { useFormStatus } from 'react-dom'",
      "nota": "De react-dom, no de react: es un Hook que habla del <form> del DOM. En react no existe (lo verás en Errores típicos)."
    },
    {
      "fragmento": "const { pending } = useFormStatus()",
      "nota": "Sin argumentos: no le dices de qué formulario. Lee el del <form> que envuelve a este componente. Aquí solo hace falta pending."
    },
    {
      "fragmento": "type=\"submit\" disabled={pending}",
      "nota": "Mientras se envía, el botón no se puede pulsar: nada de reservas dobles por un segundo clic impaciente. El type=\"submit\" es el de siempre; en un componente reutilizable conviene escribirlo."
    },
    {
      "fragmento": "<BotonEnviar>Reservar mesa</BotonEnviar>",
      "nota": "Va dentro del <form> y no recibe ninguna prop sobre el envío. El formulario se lo cuenta."
    },
    {
      "fragmento": "async function reservar(formData) {",
      "nota": "Una acción normal, como en la lección 57. useFormStatus no le pide nada a la acción: le vale cualquiera que ejecute el formulario."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "reservas": [
      {
        "id": 1,
        "nombre": "Vicenta",
        "comensales": 6,
        "hora": "14:30"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Reserva una mesa. Mientras la API contesta, el botón dice «Enviando…» y no se puede pulsar; cuando llega la respuesta, la reserva sale en la lista, el botón vuelve a ser «Reservar mesa» y los campos se vacían (lección 57). **`BotonEnviar` no sabe nada de `reservar` ni del servidor**: solo sabe que el formulario que lo contiene se está enviando. Ni props, ni estado, ni `isPending` que bajar.

## Por qué no funciona en el componente que pinta el `<form>`

Parece más cómodo llamar a `useFormStatus` en el mismo componente que tiene el formulario, que es donde ya está todo. Antes de probarlo, predice qué pasa:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "import { useFormStatus } from 'react-dom'\n\nfunction Reserva() {\n  const { pending } = useFormStatus()\n\n  async function reservar(formData) {\n    await fetch('/api/reservas', { method: 'POST', /* … */ }) // tarda 1,5 s\n  }\n\n  return (\n    <form action={reservar}>\n      <input name=\"nombre\" />\n      <button disabled={pending}>\n        {pending ? 'Enviando…' : 'Reservar mesa'}\n      </button>\n    </form>\n  )\n}\n\n// Pulsas «Reservar mesa». ¿Qué pasa durante ese segundo y medio?",
  "opciones": [
    "El botón dice «Enviando…» y está desactivado",
    "El botón sigue diciendo «Reservar mesa», y React no avisa de nada",
    "React lanza un error: useFormStatus tiene que llamarse dentro de un formulario",
    "El botón dice «Enviando…», pero se puede pulsar"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa: pending se queda en false todo el envío y la consola no dice nada. Reserva no está dentro del <form>: es quien lo pinta, y está por encima. useFormStatus solo ve los formularios que hay por encima del componente que lo llama, y aquí no hay ninguno. Devuelve lo mismo que fuera de cualquier formulario: pending false, data null, method null y action null."
}
```

Lo que pasa de verdad: **el `<form>` funciona como el proveedor de un contexto** (lección 28). Cuando se envía, React guarda en él el estado del envío, y ese valor solo llega a lo que hay **dentro** del formulario. `useFormStatus` es, por dentro, una lectura de ese contexto. `Reserva` se ejecuta antes de que exista el `<form>` que devuelve, y queda por encima de él: lee lo mismo que cualquier componente sin proveedor, el valor por defecto. Es el error de «Proveer y leer en el mismo componente» de la lección 28, y por eso tampoco hay aviso: para React no pasa nada raro. El anuncio de React 19 lo dice así: `useFormStatus` lee el estado del `<form>` padre «como si el formulario fuera un proveedor de contexto».

```laboratorio
{
  "tipo": "arbol-de-componentes",
  "titulo": "Quién ve el estado del envío",
  "nodos": [
    {
      "nombre": "App",
      "nivel": 0
    },
    {
      "nombre": "Reserva",
      "nivel": 1,
      "etiqueta": "useFormStatus()",
      "nota": "← pinta el form, pero está fuera: pending siempre false"
    },
    {
      "nombre": "form",
      "nivel": 2,
      "etiqueta": "proveedor",
      "nota": "el estado del envío vale de aquí hacia abajo"
    },
    {
      "nombre": "BotonEnviar",
      "nivel": 3,
      "etiqueta": "useFormStatus()",
      "nota": "← dentro: ve pending, data, method y action"
    }
  ]
}
```

Compruébalo con el árbol de renders. Aquí `Reserva` llama a `useFormStatus` para enseñar lo que lee, y `BotonEnviar` hace lo mismo desde dentro del formulario:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dentro y fuera del formulario",
  "consigna": "Pulsa «Reservar mesa» y, mientras se envía, mira el árbol de renders: BotonEnviar se vuelve a renderizar y Reserva no. El párrafo de Reserva dice false todo el rato. Después saca ese párrafo a un componente propio, ponlo dentro del <form> y comprueba que ahora sí cambia.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useFormStatus } from 'react-dom'\nimport './estilos.css'\n\nfunction BotonEnviar() {\n  const { pending } = useFormStatus()\n  return (\n    <button disabled={pending}>\n      {pending ? 'Enviando…' : 'Reservar mesa'}\n    </button>\n  )\n}\n\nfunction Reserva() {\n  const { pending } = useFormStatus()\n\n  async function reservar(formData) {\n    await fetch('/api/reservas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(Object.fromEntries(formData)),\n    })\n  }\n\n  return (\n    <form action={reservar}>\n      <label>\n        A nombre de <input name=\"nombre\" defaultValue=\"Lola\" />\n      </label>\n      <p className=\"nota\">Reserva lee pending = {String(pending)}</p>\n      <BotonEnviar />\n    </form>\n  )\n}\n\nexport default function App() {\n  return (\n    <main>\n      <h1>Arrocería La Barraca</h1>\n      <Reserva />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #a16207;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fde68a;\n  border-radius: 8px;\n  background: #fefce8;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton:disabled {\n  cursor: progress;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #854d0e;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarArbol": true,
  "api": {
    "reservas": [
      {
        "id": 1,
        "nombre": "Vicenta"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

En el árbol, el motivo que da `BotonEnviar` es «cambió el contexto «Context»»: es el contexto interno del que lee `useFormStatus`, que React no ha bautizado. `Reserva`, en cambio, se queda gris: **ni siquiera se vuelve a renderizar**, porque para ella no ha cambiado nada. La regla práctica sale sola: **el componente que llama a `useFormStatus` va dentro del `<form>`, nunca en el que lo pinta.**

## Un botón «Enviar» para todos tus formularios

En su propio archivo, `BotonEnviar` sirve para cualquier formulario de la aplicación. La arrocería tiene dos: reservar mesa y encargar arroz para llevar, cada uno con su acción. Los dos usan el mismo botón.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "El mismo botón en dos formularios",
  "consigna": "Escribe un nombre y reserva; sin esperar, encarga un arroz. Fíjate en que cada botón cambia solo cuando se envía su formulario, y en que los dos envíos pueden ir a la vez. Después, en BotonEnviar.jsx, cambia el texto por defecto de textoEnviando y mira a qué botón afecta.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport BotonEnviar from './BotonEnviar'\nimport './estilos.css'\n\nasync function enviar(ruta, formData) {\n  const respuesta = await fetch(ruta, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(Object.fromEntries(formData)),\n  })\n  return respuesta.json()\n}\n\nexport default function App() {\n  const [hechos, setHechos] = useState([])\n\n  async function reservar(formData) {\n    const reserva = await enviar('/api/reservas', formData)\n    setHechos((anteriores) => [...anteriores, `Mesa a nombre de ${reserva.nombre} (n.º ${reserva.id})`])\n  }\n\n  async function encargar(formData) {\n    const encargo = await enviar('/api/encargos', formData)\n    setHechos((anteriores) => [...anteriores, `${encargo.raciones} de ${encargo.arroz} para llevar`])\n  }\n\n  return (\n    <main>\n      <h1>Arrocería La Barraca</h1>\n      <h2>Reservar mesa</h2>\n      <form action={reservar}>\n        <label>\n          A nombre de <input name=\"nombre\" required />\n        </label>\n        <BotonEnviar>Reservar mesa</BotonEnviar>\n      </form>\n      <h2>Para llevar</h2>\n      <form action={encargar}>\n        <label>\n          Arroz\n          <select name=\"arroz\">\n            <option>Paella valenciana</option>\n            <option>Arroz negro</option>\n            <option>Arroz a banda</option>\n          </select>\n        </label>\n        <label>\n          Raciones <input name=\"raciones\" type=\"number\" min=\"1\" defaultValue=\"2\" />\n        </label>\n        <BotonEnviar textoEnviando=\"Encargando…\">Encargar</BotonEnviar>\n      </form>\n      <ul>\n        {hechos.map((texto, i) => (\n          <li key={i}>{texto}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "BotonEnviar.jsx",
      "codigo": "import { useFormStatus } from 'react-dom'\n\nexport default function BotonEnviar({ children, textoEnviando = 'Enviando…' }) {\n  const { pending } = useFormStatus()\n  return (\n    <button type=\"submit\" disabled={pending}>\n      {pending ? textoEnviando : children}\n    </button>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #a16207;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fde68a;\n  border-radius: 8px;\n  background: #fefce8;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton:disabled {\n  cursor: progress;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #854d0e;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "BotonEnviar.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "reservas": [
      {
        "id": 1,
        "nombre": "Vicenta"
      }
    ],
    "encargos": [
      {
        "id": 1,
        "arroz": "Arroz negro",
        "raciones": "3"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

**Cada `BotonEnviar` lee el formulario que tiene encima, no «el que se esté enviando»**. Dos formularios, dos estados que no se mezclan. Y a `BotonEnviar` le da igual cómo esté escrita la acción: una función suelta como aquí, la que devuelve `useActionState` (lección 58) o la de un `formAction`. Lo comprobamos con `useActionState`: mientras hay envíos en cola, `pending` sigue a `true` igual que `isPending`.

## Leer `data`: enseñar lo que se está enviando

`pending` dice si se envía; **`data` dice qué**. Es el mismo `FormData` que recibe la acción, así que puedes enseñarlo mientras el servidor contesta. Un aviso que repite lo que has pedido tranquiliza más que un botón que dice «Enviando…».

En esta versión de la reserva, el componente que está dentro del formulario no es solo el botón: pinta todos los campos, para poder desactivarlos mientras se envía.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Lo que se está reservando, mientras se reserva",
  "codigo": "import { useState } from 'react'\nimport { useFormStatus } from 'react-dom'\n\nfunction CamposReserva() {\n  const { pending, data } = useFormStatus()\n\n  return (\n    <fieldset disabled={pending}>\n      <label>\n        A nombre de <input name=\"nombre\" required />\n      </label>\n      <label>\n        Comensales <input name=\"comensales\" type=\"number\" min=\"1\" max=\"12\" defaultValue=\"2\" />\n      </label>\n      <label>\n        Hora\n        <select name=\"hora\">\n          <option>13:30</option>\n          <option>14:30</option>\n          <option>21:00</option>\n        </select>\n      </label>\n      <button>{pending ? 'Enviando…' : 'Reservar mesa'}</button>\n      <p role=\"status\">\n        {data\n          ? `Reservando mesa para ${data.get('comensales')} a las ${data.get('hora')}, a nombre de ${data.get('nombre')}…`\n          : ''}\n      </p>\n    </fieldset>\n  )\n}\n\nexport default function App() {\n  const [reservas, setReservas] = useState([])\n\n  async function reservar(formData) {\n    const respuesta = await fetch('/api/reservas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(Object.fromEntries(formData)),\n    })\n    const guardada = await respuesta.json()\n    setReservas((anteriores) => [...anteriores, guardada])\n  }\n\n  return (\n    <main>\n      <h1>Arrocería La Barraca</h1>\n      <form action={reservar}>\n        <CamposReserva />\n      </form>\n      <ul>\n        {reservas.map((r) => (\n          <li key={r.id}>\n            {r.hora} · {r.nombre} · {r.comensales} personas\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #a16207;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fde68a;\n  border-radius: 8px;\n  background: #fefce8;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton:disabled {\n  cursor: progress;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #854d0e;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n",
  "anotaciones": [
    {
      "fragmento": "const { pending, data } = useFormStatus()",
      "nota": "data es null hasta que el formulario se envía, y vuelve a null cuando la acción termina. Por eso el aviso aparece y desaparece solo, sin estado propio."
    },
    {
      "fragmento": "data.get('comensales')",
      "nota": "Se lee igual que en la acción: get con el name del campo. Es lo que se envió en ese momento, no lo que haya ahora escrito en el campo."
    },
    {
      "fragmento": "<fieldset disabled={pending}>",
      "nota": "Un fieldset desactivado desactiva todo lo que lleva dentro, botón incluido: mientras se envía no se puede cambiar nada. Por eso este componente pinta los campos y no solo el botón."
    },
    {
      "fragmento": "<p role=\"status\">",
      "nota": "Un lector de pantalla anuncia el aviso cuando cambia su texto (lección 37). El párrafo está siempre en el DOM; lo que cambia es lo que dice."
    },
    {
      "fragmento": "<CamposReserva />",
      "nota": "El formulario de App solo tiene un hijo, y todo lo que necesita saber del envío está dentro de él. App no llama a useFormStatus."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "reservas": [
      {
        "id": 1,
        "nombre": "Vicenta",
        "comensales": 6,
        "hora": "14:30"
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Reserva con un nombre: los campos se ponen grises, el aviso repite lo que has pedido y, al terminar, todo se reactiva y los campos vuelven a su valor inicial (lección 57). Lo comprobamos también con el `fieldset`: el reset funciona aunque los campos hayan estado desactivados.

Los otros dos valores se usan menos. **`method`** es `"get"` o `"post"` según el atributo `method` del formulario: con una función en `action` no se pone, así que vale `"get"` (lo comprobamos; si le pones `method="post"`, vale `"post"`, pero React avisa como viste en la lección 57). **`action`** es la función que se está ejecutando, y tiene un uso muy concreto: distinguir botones.

## Varios botones en un formulario: `action` dice cuál

En la lección 57 viste que un botón puede llevar su propia acción en `formAction`. La arrocería añade un segundo botón a la reserva: si no quedan mesas, puedes apuntarte a la lista de espera. Los dos usan `BotonEnviar`, ahora con una prop para el `formAction`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function BotonEnviar({ formAction, textoEnviando, children }) {\n  const { pending } = useFormStatus()\n  return (\n    <button formAction={formAction} disabled={pending}>\n      {pending ? textoEnviando : children}\n    </button>\n  )\n}\n\n<form>\n  <input name=\"nombre\" />\n  <BotonEnviar formAction={reservar} textoEnviando=\"Reservando…\">\n    Reservar mesa\n  </BotonEnviar>\n  <BotonEnviar formAction={apuntarEnEspera} textoEnviando=\"Apuntando…\">\n    Lista de espera\n  </BotonEnviar>\n</form>\n\n// Pulsas «Lista de espera». Mientras se envía, ¿qué dicen los botones?",
  "opciones": [
    "«Reservar mesa» y «Apuntando…»",
    "«Reservando…» y «Apuntando…»",
    "«Reservar mesa» y «Lista de espera»: sin action en el <form>, useFormStatus no se entera"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. Los dos botones están dentro del mismo formulario, y pending habla del formulario, no del botón: los dos se desactivan y los dos cambian su texto. Que el <form> no tenga action no importa: el formAction del botón pulsado es una acción, y el formulario se envía igual."
}
```

Que los dos se desactiven está bien: mientras el formulario se envía, no conviene enviarlo otra vez. Lo raro es que «Reservando…» salga en un botón que nadie ha pulsado. **`action` te dice de quién es el envío**: es la función que se está ejecutando, la del `formAction` del botón que envió o, si ese botón no tiene, la del `<form>`. Lo comprobamos: al pulsar «Lista de espera», `action` es justo `apuntarEnEspera`, y `data` trae los campos más el `name` y el `value` del botón pulsado, si los tiene. Compárala con la del botón y tendrás un texto de espera solo en el que se ha pulsado. Lo haces tú en el ejercicio 2.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "El botón de enviar de tu aplicación",
      "texto": "Es el caso para el que existe: un BotonEnviar que se desactiva solo en cualquier formulario donde lo pongas, sin que el formulario le pase nada."
    },
    {
      "titulo": "Piezas de formulario que no conocen la acción",
      "texto": "Campos que se bloquean, un aviso con lo que se envía, un indicador de progreso: componentes que viven dentro de un <form> cualquiera y leen su estado."
    },
    {
      "titulo": "isPending o useFormStatus",
      "texto": "Si quien necesita saberlo es el mismo componente que llama a useActionState, usa su isPending (lección 58). Si es un hijo del formulario, useFormStatus, sin pasar props."
    },
    {
      "titulo": "Con onSubmit, solo si abres una transición",
      "texto": "Si el formulario usa onSubmit (por ejemplo, con el handleSubmit de React Hook Form), pending se queda en false. Lo comprobamos: solo cambia si el manejador llama a startTransition, y entonces dura lo que dure esa transición."
    },
    {
      "titulo": "Fuera de un formulario, no",
      "texto": "Un botón suelto con onClick no tiene <form> del que leer. Para eso está useTransition (lección 51) o un pendiente hecho con useOptimistic (lección 60)."
    }
  ]
}
```

## Errores típicos

**Llamarlo en el componente que pinta el `<form>`.** Es el de la sección de arriba, y el más frecuente con diferencia: `pending` se queda en `false`, `data` en `null`, y nada avisa. Si un `useFormStatus` «no hace nada», mira en qué componente está.

**Importarlo de `react`.** `useFormStatus` está en `react-dom`; en `react` no existe (lo comprobamos: en `react` vale `undefined`). La llamada falla al renderizar, y en la vista previa el error dice:

```text
Cannot read properties of undefined (reading 'call')
```

Es decir: has intentado ejecutar algo que no existe. El texto exacto depende de cómo se compile tu proyecto, pero la causa es siempre el `import`.

**Desactivar los campos y dejar el botón fuera.** Desactivar los campos mientras se envía es buena idea, pero tiene trampa:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Campos() {\n  const { pending } = useFormStatus()\n  return (\n    <fieldset disabled={pending}>\n      <label>\n        A nombre de <input name=\"nombre\" />\n      </label>\n    </fieldset>\n  )\n}\n\n<form action={reservar}>\n  <Campos />\n  <button>Reservar mesa</button>\n</form>\n\n// Escribes «Lola» y pulsas «Reservar mesa». Mientras se envía,\n// vuelves a pulsar. ¿Qué recibe reservar en el segundo envío?",
  "opciones": [
    "Un FormData con nombre «Lola»",
    "Un FormData vacío",
    "No hay segundo envío: el botón no responde",
    "Un error: no se puede enviar un formulario que ya se está enviando"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. El botón está fuera del fieldset, así que sigue activo y el formulario se envía otra vez. Pero un campo desactivado no entra en el FormData: es una regla de HTML, no de React. La segunda reserva llega sin nombre. Mete el botón dentro del fieldset o desactívalo también con pending."
}
```

**Esperar que `data` guarde lo último que se envió.** `data` solo existe mientras dura el envío; cuando la acción termina, vuelve a `null`. Para enseñar el resultado («Mesa reservada a nombre de Lola»), lo que necesitas es el estado de `useActionState` (lección 58).

**Usarlo fuera de cualquier formulario.** Un componente que no está dentro de ningún `<form>` recibe siempre `pending: false`, sin aviso. Si el botón no está en un formulario, `useFormStatus` no es la herramienta.

## Ejercicios

### Ejercicio 1: cita previa en el Ayuntamiento de Calatayud

La sede electrónica del Ayuntamiento de Calatayud da cita previa para los trámites más pedidos. Las citas llegan bien, pero mientras se piden el botón no cambia y se puede pulsar otra vez: el `useFormStatus` está donde no debe.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: el botón que no se entera",
  "consigna": "En PedirCita.jsx, haz que mientras se pide la cita el botón diga «Pidiendo cita…» y esté desactivado, y que el párrafo con role=\"status\" diga «Buscando hueco para <trámite> por la <franja>…» con lo que se está enviando. No toques App.jsx. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "PedirCita.jsx",
      "codigo": "import { useFormStatus } from 'react-dom'\n\nexport default function PedirCita({ action }) {\n  // El botón nunca dice «Pidiendo cita…»: pending se queda en false.\n  const { pending } = useFormStatus()\n\n  return (\n    <form action={action}>\n      <label>\n        Trámite\n        <select name=\"tramite\">\n          <option>Empadronamiento</option>\n          <option>Licencia de obra menor</option>\n          <option>Tarjeta de aparcamiento</option>\n        </select>\n      </label>\n      <label>\n        Tu nombre <input name=\"nombre\" required />\n      </label>\n      <label>\n        Franja\n        <select name=\"franja\">\n          <option>mañana</option>\n          <option>tarde</option>\n        </select>\n      </label>\n      <button disabled={pending}>{pending ? 'Pidiendo cita…' : 'Pedir cita'}</button>\n      {/* Mientras se envía: «Buscando hueco para <trámite> por la <franja>…» */}\n      <p role=\"status\"></p>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport PedirCita from './PedirCita'\nimport './estilos.css'\n\nexport default function App() {\n  const [citas, setCitas] = useState([])\n\n  async function pedirCita(formData) {\n    const respuesta = await fetch('/api/citas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(Object.fromEntries(formData)),\n    })\n    const cita = await respuesta.json()\n    setCitas((anteriores) => [...anteriores, cita])\n  }\n\n  return (\n    <main>\n      <h1>Cita previa · Ayuntamiento de Calatayud</h1>\n      <PedirCita action={pedirCita} />\n      <h2>Tus citas</h2>\n      <ul>\n        {citas.map((cita) => (\n          <li key={cita.id}>\n            {cita.tramite} · {cita.nombre} · por la {cita.franja} · n.º {cita.id}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #334155;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  background: #f8fafc;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton:disabled {\n  cursor: progress;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #1e3a8a;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "PedirCita.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "citas": [
      {
        "id": 41,
        "tramite": "Empadronamiento",
        "nombre": "Jesús Marco",
        "franja": "mañana"
      }
    ]
  },
  "red": {
    "latencia": 800
  },
  "comprobaciones": [
    {
      "descripcion": "Al pedir cita, la cita sale en «Tus citas» con su número",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Begoña Lázaro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir cita"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Empadronamiento · Begoña Lázaro · por la mañana · n.º 42"
      }
    },
    {
      "descripcion": "Cuando llega la cita, el botón vuelve a decir «Pedir cita»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Begoña Lázaro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir cita"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Begoña Lázaro"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Pedir cita"
      }
    },
    {
      "descripcion": "Cuando llega la cita, el aviso «Buscando hueco…» desaparece",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Begoña Lázaro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir cita"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Begoña Lázaro"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "status",
          "texto": "Buscando hueco"
        }
      }
    },
    {
      "descripcion": "Mientras se pide la cita, el botón dice «Pidiendo cita…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Begoña Lázaro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir cita"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Pidiendo cita…"
      }
    },
    {
      "descripcion": "Mientras se pide, el aviso dice el trámite y la franja: «Buscando hueco para Licencia de obra menor por la tarde…»",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Trámite",
            "opcion": "Licencia de obra menor"
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Franja",
            "opcion": "tarde"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Begoña Lázaro"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir cita"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Buscando hueco para Licencia de obra menor por la tarde"
      }
    }
  ]
}
```

### Ejercicio 2: Copistería El Folio

En la Copistería El Folio puedes encargar copias o pedir antes un presupuesto, con el mismo formulario. Los dos botones usan `BotonEnviar`, y los dos se desactivan bien mientras se envía. El problema es el texto: pulses el que pulses, uno dice «Encargando…» y el otro «Calculando…» a la vez. La copistería va lenta (dos segundos y medio por envío): así da tiempo a mirar los dos botones.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: cada botón, su texto",
  "consigna": "Arregla BotonEnviar para que, mientras se envía, solo el botón pulsado diga su texto de espera («Encargando…» o «Calculando…»). El otro tiene que seguir con su texto de siempre, aunque desactivado. Pista: mira qué más devuelve useFormStatus. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport { useFormStatus } from 'react-dom'\nimport './estilos.css'\n\nconst PRECIO_COPIA = { 'blanco y negro': 0.05, color: 0.3 }\nconst euros = (cantidad) => cantidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })\n\n// Los dos botones cambian de texto a la vez, se pulse el que se pulse.\n// Haz que solo cambie el que ha enviado el formulario.\nfunction BotonEnviar({ formAction, textoEnviando, children }) {\n  const { pending } = useFormStatus()\n  return (\n    <button formAction={formAction} disabled={pending}>\n      {pending ? textoEnviando : children}\n    </button>\n  )\n}\n\nasync function enviar(ruta, formData) {\n  const respuesta = await fetch(ruta, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      archivo: formData.get('archivo'),\n      copias: Number(formData.get('copias')),\n      tinta: formData.get('tinta'),\n    }),\n  })\n  return respuesta.json()\n}\n\nexport default function App() {\n  const [encargos, setEncargos] = useState([])\n  const [presupuesto, setPresupuesto] = useState(null)\n\n  async function encargar(formData) {\n    const encargo = await enviar('/api/encargos', formData)\n    setEncargos((anteriores) => [...anteriores, encargo])\n  }\n\n  async function presupuestar(formData) {\n    const pedido = await enviar('/api/presupuestos', formData)\n    const total = euros(pedido.copias * PRECIO_COPIA[pedido.tinta])\n    setPresupuesto(`${pedido.copias} copias de ${pedido.archivo} en ${pedido.tinta}: ${total}`)\n  }\n\n  return (\n    <main>\n      <h1>Copistería El Folio</h1>\n      <form>\n        <label>\n          Archivo <input name=\"archivo\" required />\n        </label>\n        <label>\n          Copias <input name=\"copias\" type=\"number\" min=\"1\" defaultValue=\"10\" />\n        </label>\n        <label>\n          Tinta\n          <select name=\"tinta\">\n            <option>blanco y negro</option>\n            <option>color</option>\n          </select>\n        </label>\n        <div className=\"botones\">\n          <BotonEnviar formAction={encargar} textoEnviando=\"Encargando…\">\n            Encargar\n          </BotonEnviar>\n          <BotonEnviar formAction={presupuestar} textoEnviando=\"Calculando…\">\n            Pedir presupuesto\n          </BotonEnviar>\n        </div>\n      </form>\n      <p role=\"status\">{presupuesto && `Presupuesto: ${presupuesto}`}</p>\n      <h2>Encargos de hoy</h2>\n      <ul>\n        {encargos.map((e) => (\n          <li key={e.id}>\n            {e.archivo} · {e.copias} copias en {e.tinta}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #0f766e;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #99f6e4;\n  border-radius: 8px;\n  background: #f0fdfa;\n}\n\nfieldset {\n  display: grid;\n  gap: 0.5rem;\n  margin: 0;\n  padding: 0;\n  border: 0;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\nbutton:disabled {\n  cursor: progress;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  margin: 0;\n  color: #115e59;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "encargos": [
      {
        "id": 1,
        "archivo": "apuntes-tema-3.pdf",
        "copias": 12,
        "tinta": "blanco y negro"
      }
    ],
    "presupuestos": [
      {
        "id": 1,
        "archivo": "menu-bar-pepe.pdf",
        "copias": 40,
        "tinta": "color"
      }
    ]
  },
  "red": {
    "latencia": 2500
  },
  "comprobaciones": [
    {
      "descripcion": "Mientras se encarga, el botón pulsado dice «Encargando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Archivo",
            "texto": "cartel-fiestas.pdf"
          }
        },
        {
          "escribir": {
            "etiqueta": "Copias",
            "texto": "30"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Encargar"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Encargando…"
      }
    },
    {
      "descripcion": "Mientras se encarga, el otro botón sigue diciendo «Pedir presupuesto»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Archivo",
            "texto": "cartel-fiestas.pdf"
          }
        },
        {
          "escribir": {
            "etiqueta": "Copias",
            "texto": "30"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Encargar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Encargando…"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Pedir presupuesto"
      }
    },
    {
      "descripcion": "Mientras se encarga, «Calculando…» no sale en ningún botón",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Archivo",
            "texto": "cartel-fiestas.pdf"
          }
        },
        {
          "escribir": {
            "etiqueta": "Copias",
            "texto": "30"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Encargar"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Encargando…"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "button",
          "nombre": "Calculando…"
        }
      }
    },
    {
      "descripcion": "Mientras se calcula el presupuesto, el botón pulsado dice «Calculando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Archivo",
            "texto": "cartel-fiestas.pdf"
          }
        },
        {
          "escribir": {
            "etiqueta": "Copias",
            "texto": "30"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir presupuesto"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Calculando…"
      }
    },
    {
      "descripcion": "Mientras se calcula el presupuesto, el otro botón sigue diciendo «Encargar»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Archivo",
            "texto": "cartel-fiestas.pdf"
          }
        },
        {
          "escribir": {
            "etiqueta": "Copias",
            "texto": "30"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Pedir presupuesto"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Calculando…"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Encargar"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En la cita previa, mete los campos en un `<fieldset>` que se desactive mientras se envía, y comprueba que el botón también queda dentro.
2. Añade a `BotonEnviar` del ejercicio 2 un `aria-busy` que esté a `true` solo en el botón pulsado. ¿Qué información le das a un lector de pantalla que el texto no daba?
3. En la arrocería, cambia el formulario de reserva para que use `useActionState` (lección 58) con un mensaje de confirmación, y deja `BotonEnviar` como está. ¿Has tenido que tocar el botón?
4. Escribe un componente `ContadorDeEnvio` que, mientras se envía, enseñe cuántos segundos lleva el envío. Pista: un efecto que arranque un intervalo cuando `pending` pasa a `true` (lección 38).

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useFormStatus",
      "descripcion": "La referencia de react.dev de esta lección: lo que devuelve, el aviso de no llamarlo en el componente del <form> y cómo leer data.",
      "url": "https://react.dev/reference/react-dom/hooks/useFormStatus",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<form>",
      "descripcion": "La prop action, formAction en los botones y el reset de los campos, de los que depende todo lo que lee useFormStatus.",
      "url": "https://react.dev/reference/react-dom/components/form",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React v19: New hook useFormStatus",
      "descripcion": "El anuncio de React 19, con el porqué del Hook: leer el estado del formulario como si fuera un proveedor de contexto.",
      "url": "https://react.dev/blog/2024/12/05/react-19#new-hook-useformstatus",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useActionState",
      "descripcion": "La lección 58: isPending y el resultado de la acción en el componente que la llama.",
      "url": "https://react.dev/reference/react/useActionState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<fieldset>",
      "descripcion": "El atributo disabled que desactiva de una vez todos los campos de un grupo, botones incluidos.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset",
      "etiqueta": "MDN"
    },
    {
      "titulo": "FormData: constructor",
      "descripcion": "Por qué el botón que envía entra en el FormData (el parámetro submitter) y qué campos se quedan fuera.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData",
      "etiqueta": "MDN"
    }
  ]
}
```
