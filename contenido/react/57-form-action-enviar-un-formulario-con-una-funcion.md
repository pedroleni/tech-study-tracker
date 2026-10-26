# `<form action>`: enviar un formulario con una función

- **Módulo:** Formularios y Actions
- **Slug:** `form-action-enviar-un-formulario-con-una-funcion` (autogenerado del título)
- **Orden:** 570
- **Fuentes:** [`<form>`](https://react.dev/reference/react-dom/components/form) — ver `contenido/react/TEMARIO.md` #57

---

## Qué es y para qué sirve

Hasta ahora has enviado formularios de dos maneras. En la lección 15, con `onSubmit`, `e.preventDefault()` y `new FormData(e.currentTarget)`. En la 22, guardando cada campo en el estado. Las dos funcionan, y las dos te obligan a encargarte de todo: frenar la recarga, leer los datos, vaciar los campos, saber si el envío sigue en marcha.

React 19 añade una tercera: **pasar una función a la prop `action` del `<form>`**. Cuando el formulario se envía, React frena la recarga por ti, recoge los campos en un `FormData`, llama a tu función con él **dentro de una transición** y, cuando termina sin errores, **vacía los campos que no controlas**.

```jsx
// Lección 15: tú haces todo
function manejarEnvio(e) {
  e.preventDefault()
  const datos = new FormData(e.currentTarget)
  publicar(datos.get('servicio'))
}
<form onSubmit={manejarEnvio}>…</form>

// Desde React 19: React te da los datos
function publicar(formData) {
  console.log(formData.get('servicio'))
}
<form action={publicar}>…</form>
```

A la función que pasas a `action` se la llama **acción** (*Action* en react.dev): es el mismo nombre que viste en la lección 51 para la función de `startTransition`, y no es casualidad. El ejemplo de esta lección es el tablón del **Banco de Tiempo del Arrabal**, donde los vecinos ofrecen horas de lo que saben hacer.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Tu primera acción de formulario",
  "codigo": "import { useState } from 'react'\n\nexport default function App() {\n  const [ofertas, setOfertas] = useState([\n    { id: 1, servicio: 'Arreglos de costura', horas: 1 },\n  ])\n\n  function publicar(formData) {\n    const nueva = {\n      id: Date.now(),\n      servicio: formData.get('servicio'),\n      horas: Number(formData.get('horas')),\n    }\n    setOfertas([...ofertas, nueva])\n  }\n\n  return (\n    <main>\n      <h1>Banco de Tiempo del Arrabal</h1>\n      <form action={publicar}>\n        <label>\n          Qué ofreces <input name=\"servicio\" required />\n        </label>\n        <label>\n          Horas <input name=\"horas\" type=\"number\" min=\"1\" defaultValue=\"1\" />\n        </label>\n        <button>Publicar</button>\n      </form>\n      <ul>\n        {ofertas.map((oferta) => (\n          <li key={oferta.id}>\n            {oferta.servicio} · {oferta.horas} h\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #166534;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n",
  "anotaciones": [
    {
      "fragmento": "<form action={publicar}>",
      "nota": "Una función en vez de una URL. No hay onSubmit ni preventDefault: React frena el envío del navegador por ti. Se envía igual que siempre, con el botón o con Enter desde un campo."
    },
    {
      "fragmento": "function publicar(formData) {",
      "nota": "React llama a la acción con un solo argumento, el FormData del formulario. No recibe el evento: no hay e.currentTarget ni nada que frenar."
    },
    {
      "fragmento": "formData.get('servicio')",
      "nota": "Cada campo se lee por su atributo name. Devuelve siempre un texto (o un File si el campo es de archivo), por eso las horas pasan por Number."
    },
    {
      "fragmento": "name=\"servicio\"",
      "nota": "Sin name, el campo no entra en el FormData. Los campos no están controlados: ni value ni onChange. El navegador guarda lo escrito y la acción lo lee al final."
    },
    {
      "fragmento": "defaultValue=\"1\"",
      "nota": "El valor inicial de un campo no controlado (lección 22). Al terminar la acción, React vuelve a dejar el campo así: en 1, no vacío."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Publica un par de ofertas. Fíjate en lo que pasa con los campos al pulsar «Publicar»: **«Qué ofreces» se vacía solo y «Horas» vuelve a 1**, sin una línea de código para eso.

## Lo mismo con `onSubmit`, y lo que cambia

Aquí tienes los dos formularios, uno al lado del otro, publicando en la misma lista. Hacen el mismo trabajo, pero no se comportan igual.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Dos formularios, el mismo tablón",
  "consigna": "Escribe algo en cada formulario y publica. Solo uno vacía su campo. Después, en ConOnSubmit, añade e.currentTarget.reset() al final de manejarEnvio y vuelve a probar: ahora hacen lo mismo, pero lo has tenido que escribir tú.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport ConAction from './ConAction'\nimport ConOnSubmit from './ConOnSubmit'\nimport './estilos.css'\n\nexport default function App() {\n  const [ofertas, setOfertas] = useState([])\n\n  function anadir(servicio, forma) {\n    setOfertas((anteriores) => [...anteriores, `${servicio} (con ${forma})`])\n  }\n\n  return (\n    <main>\n      <h1>Banco de Tiempo del Arrabal</h1>\n      <ConOnSubmit onPublicar={anadir} />\n      <ConAction onPublicar={anadir} />\n      <h2>Tablón</h2>\n      <ul>\n        {ofertas.map((oferta, i) => (\n          <li key={i}>{oferta}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ConOnSubmit.jsx",
      "codigo": "export default function ConOnSubmit({ onPublicar }) {\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const datos = new FormData(e.currentTarget)\n    onPublicar(datos.get('servicio'), 'onSubmit')\n  }\n\n  return (\n    <form onSubmit={manejarEnvio}>\n      <label>\n        Qué ofreces (onSubmit) <input name=\"servicio\" />\n      </label>\n      <button>Publicar con onSubmit</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "ConAction.jsx",
      "codigo": "export default function ConAction({ onPublicar }) {\n  function publicar(formData) {\n    onPublicar(formData.get('servicio'), 'action')\n  }\n\n  return (\n    <form action={publicar}>\n      <label>\n        Qué ofreces (action) <input name=\"servicio\" />\n      </label>\n      <button>Publicar con action</button>\n    </form>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #166534;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "ConOnSubmit.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Las diferencias que no se ven a simple vista son las importantes. **Pasar la función a `action` no es solo ahorrarse `preventDefault`**: cambia cómo ejecuta React el envío.

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Sin preventDefault ni evento",
      "texto": "React frena el envío del navegador y llama a tu función con el FormData ya hecho. Si necesitas el evento (para cancelar el envío según algo, por ejemplo), sigues teniendo onSubmit."
    },
    {
      "titulo": "Dentro de una transición",
      "texto": "La acción se ejecuta como la función de startTransition de la lección 51: puede ser async, la transición dura lo que dure, y los set que haces dentro se aplican juntos al terminar."
    },
    {
      "titulo": "Los campos no controlados se vacían solos",
      "texto": "Cuando la acción termina sin lanzar un error, React restablece el formulario: cada campo vuelve a su valor inicial. Con onSubmit tendrías que llamar tú a form.reset()."
    },
    {
      "titulo": "Los errores van al error boundary",
      "texto": "Si la acción lanza, el error llega al boundary más cercano, como en una transición (lección 53). Un error en un manejador de onSubmit no llega a ningún boundary."
    },
    {
      "titulo": "La base del resto del módulo",
      "texto": "useActionState (58), useFormStatus (59) y useOptimistic (60) trabajan con acciones. Con un onSubmit no tienen nada a lo que engancharse."
    },
    {
      "titulo": "También en el servidor",
      "texto": "Con un framework, action puede recibir una Server Function, que se ejecuta en el servidor y deja enviar el formulario incluso antes de que cargue el JavaScript. Es la lección 89."
    }
  ]
}
```

Un detalle por si inspeccionas el formulario con las herramientas de desarrollo: React no deja el `action` vacío en el HTML. Escribe esto:

```text
action="javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you're trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
```

Es una red de seguridad: si algo se salta a React y el navegador llega a enviar el formulario de verdad, en vez de recargar la página lanza ese error, que explica las dos causas típicas. Llamar a `form.submit()` a mano no dispara el evento `submit`, así que React no se entera; `form.requestSubmit()` sí lo dispara.

## Qué campos vacía React al terminar

«Vacía el formulario» no es exacto. Lo que hace React es lo mismo que `form.reset()` del DOM: **cada campo vuelve a su valor inicial**. Y eso tiene consecuencias según cómo esté escrito cada campo.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [vecina, setVecina] = useState('')\n\nfunction publicar(formData) {\n  console.log(formData.get('servicio'))\n}\n\n<form action={publicar}>\n  <input name=\"servicio\" />                  {/* escribes «Clases de guitarra» */}\n  <input name=\"horas\" defaultValue=\"1\" />    {/* lo cambias a 3 */}\n  <input\n    name=\"vecina\"\n    value={vecina}\n    onChange={(e) => setVecina(e.target.value)}\n  />                                         {/* escribes «Ana» */}\n  <button>Publicar</button>\n</form>\n\n// Pulsas «Publicar» y la acción termina sin errores.\n// ¿Qué queda en los tres campos?",
  "opciones": [
    "Los tres vacíos",
    "Servicio vacío, horas en 1 y vecina con «Ana»",
    "Servicio vacío, horas vacío y vecina con «Ana»",
    "Los tres como estaban: React no toca lo que has escrito"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. El reset devuelve cada campo no controlado a su valor inicial: servicio no tenía, así que queda vacío; horas tenía defaultValue=\"1\". El campo controlado sigue mostrando lo que diga su estado, y nadie ha cambiado vecina: sigue en «Ana». Las casillas vuelven a su defaultChecked y los select, a su defaultValue."
}
```

Compruébalo tú. La caja de abajo enseña lo que llegó a la acción en el último envío.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Qué se vacía y qué no",
  "consigna": "Rellena los cinco campos y publica. Los cuatro no controlados vuelven a su valor inicial y «Tu nombre» se queda como estaba. Para vaciarlo, añade setVecina('') dentro de publicar: con un campo controlado, vaciarlo es cosa tuya.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [vecina, setVecina] = useState('')\n  const [ultimo, setUltimo] = useState(null)\n\n  function publicar(formData) {\n    setUltimo(JSON.stringify(Object.fromEntries(formData)))\n  }\n\n  return (\n    <main>\n      <h1>Banco de Tiempo del Arrabal</h1>\n      <form action={publicar}>\n        <label>\n          Qué ofreces <input name=\"servicio\" />\n        </label>\n        <label>\n          Horas <input name=\"horas\" type=\"number\" min=\"1\" defaultValue=\"1\" />\n        </label>\n        <label>\n          Franja\n          <select name=\"franja\" defaultValue=\"tarde\">\n            <option value=\"manana\">Mañana</option>\n            <option value=\"tarde\">Tarde</option>\n            <option value=\"finde\">Fin de semana</option>\n          </select>\n        </label>\n        <label>\n          <input type=\"checkbox\" name=\"adomicilio\" /> Puedo ir a domicilio\n        </label>\n        <label>\n          Tu nombre (controlado)\n          <input name=\"vecina\" value={vecina} onChange={(e) => setVecina(e.target.value)} />\n        </label>\n        <button>Publicar</button>\n      </form>\n      <p className=\"nota\">Llegó a la acción: {ultimo ?? 'nada todavía'}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #166534;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false
}
```

Dos detalles de lo que llega. La casilla marcada aparece como `"adomicilio":"on"` y, si no la marcas, **no aparece**: es lo que hace el navegador con las casillas, no React. Y todo llega como texto, también las horas.

Esto lleva a una recomendación práctica: **si un campo solo te hace falta al enviar, no lo controles**. Dale un `name`, deja que el navegador guarde lo escrito y léelo del `FormData`. Controla los campos que necesitan el estado mientras escribes (un contador de caracteres, un botón que se activa, un filtro en vivo, como en la lección 22), y en esos encárgate tú de vaciarlos.

## Una acción asíncrona: enviar al servidor

La acción puede ser `async`, y eso es lo normal: un formulario suele mandar los datos a algún sitio. Aquí el tablón vive en la API simulada. La acción hace un `POST` con la oferta y después vuelve a pedir la lista, para enseñar lo que el servidor tiene de verdad.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Publicar en el servidor",
  "codigo": "import { useEffect, useState } from 'react'\n\nexport default function App() {\n  const [ofertas, setOfertas] = useState([])\n\n  async function cargar() {\n    const respuesta = await fetch('/api/ofertas')\n    setOfertas(await respuesta.json())\n  }\n\n  useEffect(() => {\n    cargar()\n  }, [])\n\n  async function publicar(formData) {\n    const oferta = {\n      vecina: formData.get('vecina'),\n      servicio: formData.get('servicio'),\n      horas: Number(formData.get('horas')),\n    }\n    const respuesta = await fetch('/api/ofertas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(oferta),\n    })\n    if (!respuesta.ok) throw new Error('El tablón no ha aceptado la oferta')\n    await cargar()\n  }\n\n  return (\n    <main>\n      <h1>Banco de Tiempo del Arrabal</h1>\n      <form action={publicar}>\n        <label>\n          Tu nombre <input name=\"vecina\" required />\n        </label>\n        <label>\n          Qué ofreces <input name=\"servicio\" required />\n        </label>\n        <label>\n          Horas <input name=\"horas\" type=\"number\" min=\"1\" defaultValue=\"1\" />\n        </label>\n        <button>Publicar</button>\n      </form>\n      <ul>\n        {ofertas.map((oferta) => (\n          <li key={oferta.id}>\n            {oferta.servicio} · {oferta.horas} h · {oferta.vecina}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #166534;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n",
  "anotaciones": [
    {
      "fragmento": "async function publicar(formData) {",
      "nota": "Una acción async. La transición dura hasta que la promesa termina, y el reset de los campos espera a ese momento: mientras se envía, lo escrito sigue en su sitio."
    },
    {
      "fragmento": "Number(formData.get('horas'))",
      "nota": "FormData solo guarda textos. Si el servidor espera un número, conviértelo tú antes de enviarlo."
    },
    {
      "fragmento": "body: JSON.stringify(oferta),",
      "nota": "La API simulada, como muchas reales, espera JSON. Si mandas el FormData tal cual (body: formData), aquí contesta 400 con «El cuerpo debe ser JSON válido». Un servidor que acepte multipart/form-data sí lo entendería así."
    },
    {
      "fragmento": "if (!respuesta.ok) throw new Error('El tablón no ha aceptado la oferta')",
      "nota": "fetch no falla con un 500: devuelve una respuesta con ok a false. Hay que mirarlo y decidir. Aquí se lanza un error; lo que pasa entonces lo verás más abajo."
    },
    {
      "fragmento": "await cargar()",
      "nota": "Vuelve a pedir la lista: lo que se pinta es lo que el servidor ha guardado. Ese setOfertas va después de un await, así que ya no forma parte de la transición (lección 51) y se pinta en cuanto llega."
    },
    {
      "fragmento": "cargar()\n  }, []",
      "nota": "La carga inicial, con un efecto como en la lección 38. En el panel de red verás dos GET al abrir: es la repetición de StrictMode."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "ofertas": [
      {
        "id": 1,
        "vecina": "Rosa",
        "servicio": "Arreglos de costura",
        "horas": 1
      },
      {
        "id": 2,
        "vecina": "Iñaki",
        "servicio": "Ayuda con el ordenador",
        "horas": 2
      }
    ]
  },
  "red": {
    "latencia": 1000
  }
}
```

Publica una oferta y mira el panel de red: primero `POST /api/ofertas · 201` y, cuando acaba, `GET /api/ofertas · 200`. Durante esos dos segundos **los campos siguen con lo que escribiste**, y se vacían justo cuando la oferta nueva ya está en la lista.

Lo que no verás es ninguna señal de que se está enviando. El botón sigue igual y puedes volver a pulsarlo: cada envío lanza su propia acción y las dos peticiones viajan a la vez. Ponerle remedio es lo que hacen las tres lecciones siguientes, y el proyecto 62 lo junta todo en unos comentarios.

## Dentro de una transición

Que la acción se ejecute dentro de una transición tiene una consecuencia que pilla a todo el mundo la primera vez. La forma de siempre de enseñar «Enviando…» es un estado que pones a `true` al empezar y a `false` al acabar. Dentro de una acción:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [enviando, setEnviando] = useState(false)\n\nasync function publicar(formData) {\n  setEnviando(true)\n  await fetch('/api/ofertas', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(Object.fromEntries(formData)),\n  }) // tarda un segundo\n  setEnviando(false)\n}\n\n// ...y en el JSX:\n<form action={publicar}>…</form>\n{enviando && <p>Enviando…</p>}\n\n// Pulsas «Publicar». ¿Qué ves durante ese segundo?",
  "opciones": [
    "«Enviando…» durante el segundo que tarda, y después desaparece",
    "Nada: «Enviando…» no llega a salir",
    "«Enviando…» aparece al acabar y se queda puesto"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. setEnviando(true) va dentro de la transición, y React no enseña lo que cambia una transición hasta que termina la acción. setEnviando(false) va después del await, fuera de la transición: se aplica en el acto, y no cambia nada porque enviando seguía en false. Cuando la transición acaba, se aplican las dos en orden y gana false."
}
```

**Los `set` que haces dentro de una acción no se ven hasta que la acción termina**: es justo lo que hace una transición, enseñar el resultado de una vez. Para saber si un envío sigue en marcha, React te da el dato hecho, sin estado a mano:

- **`useActionState`** (lección 58) devuelve `isPending` junto al resultado de la acción.
- **`useFormStatus`** (lección 59) lo lee desde un componente hijo del formulario, como el botón de enviar.

Y, como en la lección 51, después de un `await` React ya no sabe que sigues dentro de la transición: un `set` ahí se aplica como uno normal.

## Varias acciones en un formulario: `formAction`

A veces un formulario tiene más de un final: publicar o guardar como borrador, aprobar o rechazar. Para eso, **un botón puede llevar su propia acción en `formAction`**, que sustituye a la del `<form>` cuando el envío sale de ese botón. Y si lo único que cambia es un dato, basta con darle al botón `name` y `value`: **el botón que envía entra en el `FormData`**, como en HTML.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Publicar o guardar como borrador",
  "consigna": "Prueba los tres botones con algo escrito y mira la consola. Los dos de publicar comparten acción y se distinguen por el valor de destino. «Guardar borrador» usa su propia acción. Fíjate en que el campo se vacía en los tres casos.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [publicadas, setPublicadas] = useState([])\n  const [borradores, setBorradores] = useState([])\n\n  function publicar(formData) {\n    console.log('publicar', JSON.stringify([...formData]))\n    const sitio = formData.get('destino') === 'boletin' ? 'el boletín' : 'el tablón'\n    setPublicadas([...publicadas, `${formData.get('servicio')}, en ${sitio}`])\n  }\n\n  function guardarBorrador(formData) {\n    console.log('guardarBorrador', JSON.stringify([...formData]))\n    setBorradores([...borradores, formData.get('servicio')])\n  }\n\n  return (\n    <main>\n      <h1>Banco de Tiempo del Arrabal</h1>\n      <form action={publicar}>\n        <label>\n          Qué ofreces <input name=\"servicio\" />\n        </label>\n        <div className=\"botones\">\n          <button name=\"destino\" value=\"tablon\">\n            Publicar en el tablón\n          </button>\n          <button name=\"destino\" value=\"boletin\">\n            Publicar en el boletín\n          </button>\n          <button formAction={guardarBorrador}>Guardar borrador</button>\n        </div>\n      </form>\n      <h2>Publicadas</h2>\n      <ul>\n        {publicadas.map((texto, i) => (\n          <li key={i}>{texto}</li>\n        ))}\n      </ul>\n      <h2>Borradores</h2>\n      <ul>\n        {borradores.map((texto, i) => (\n          <li key={i}>{texto}</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #166534;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true
}
```

En la consola verás `publicar [["servicio","Clases de ajedrez"],["destino","boletin"]]`: el botón pulsado añade su pareja `name`/`value`. «Guardar borrador» no tiene `name`, así que su `FormData` solo trae el servicio. Y la acción de `formAction` es una acción a todos los efectos: transición, reset al terminar y errores al boundary.

## Si la acción lanza un error

En el tablón con servidor, la acción lanza un error si la respuesta no es buena. Como la acción va dentro de una transición, **ese error llega al error boundary más cercano**, igual que viste en la lección 53 con `startTransition`. Aquí el formulario está envuelto en el `LimiteDeError` de esa lección.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una acción que falla, con y sin boundary",
  "consigna": "Pulsa «Fallar la siguiente petición» en el panel de red y publica: el boundary cambia el formulario por su aviso. Pulsa «Volver al formulario». Después quita el LimiteDeError que envuelve a Formulario en App.jsx (deja solo <Formulario />) y repite: se va la app entera.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport LimiteDeError from './LimiteDeError'\nimport './estilos.css'\n\nfunction Formulario() {\n  async function publicar(formData) {\n    const respuesta = await fetch('/api/ofertas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(Object.fromEntries(formData)),\n    })\n    if (!respuesta.ok) throw new Error('El tablón no ha aceptado la oferta')\n  }\n\n  return (\n    <form action={publicar}>\n      <label>\n        Qué ofreces <input name=\"servicio\" />\n      </label>\n      <button>Publicar</button>\n    </form>\n  )\n}\n\nexport default function App() {\n  const [intento, setIntento] = useState(0)\n\n  return (\n    <main>\n      <h1>Banco de Tiempo del Arrabal</h1>\n      <LimiteDeError\n        key={intento}\n        alternativa={(error) => (\n          <div role=\"alert\">\n            <p>{error.message}.</p>\n            <button onClick={() => setIntento(intento + 1)}>Volver al formulario</button>\n          </div>\n        )}\n      >\n        <Formulario />\n      </LimiteDeError>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "LimiteDeError.jsx",
      "codigo": "import { Component } from 'react'\n\nexport default class LimiteDeError extends Component {\n  state = { error: null }\n\n  static getDerivedStateFromError(error) {\n    return { error }\n  }\n\n  render() {\n    if (this.state.error) {\n      return this.props.alternativa(this.state.error)\n    }\n    return this.props.children\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #166534;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "ofertas": [
      {
        "id": 1,
        "servicio": "Arreglos de costura"
      }
    ]
  },
  "red": {
    "latencia": 600
  }
}
```

En la consola sale el mensaje de un error capturado que ya conoces de la lección 53, y señala al formulario:

```text
The above error occurred in the <form> component. React will try to recreate this component tree from scratch using the error boundary you provided, LimiteDeError.
```

Es decir: el error salió del `<form>` y React va a sustituir ese trozo del árbol por lo que pinte `LimiteDeError`. Sin boundary, el error no lo captura nadie y React quita la app entera: la vista previa se queda en blanco con el mensaje en el recuadro de error. Con `onSubmit` no pasaría nada de esto: un error en un manejador de eventos sale en la consola y la app sigue como estaba (lección 53).

¿Y si, en vez de lanzar, capturas el error dentro de la acción y lo guardas en un estado para enseñarlo? Funciona, pero con una sorpresa: **para React, una acción que no lanza ha terminado bien**, así que vacía el formulario igualmente. El aviso de error sale... y lo que el vecino había escrito desaparece. Lo comprobamos en la vista previa con un `try`/`catch` y un `setError`.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Lo que pasa cuando falla el servidor",
  "roles": [
    {
      "etiqueta": "Lanzas el error",
      "rol": "Va al error boundary",
      "descripcion": "El boundary cambia el formulario por su aviso; sin boundary, se va la app entera. Es lo que quieres para un fallo inesperado."
    },
    {
      "etiqueta": "Lo capturas tú",
      "rol": "La acción «termina bien»",
      "descripcion": "Puedes enseñar el error con un estado, pero React vacía igualmente los campos no controlados: lo escrito se pierde."
    },
    {
      "etiqueta": "Lo devuelves",
      "rol": "useActionState (lección 58)",
      "descripcion": "El error pasa a ser el resultado de la acción y se pinta como cualquier estado. Conservar lo escrito es cosa de la lección 61, al validar."
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
      "titulo": "Formularios que envían algo al servidor",
      "texto": "Alta, comentario, inscripción, pedido: una acción async con fetch, los campos sin controlar y el reset gratis al terminar."
    },
    {
      "titulo": "Cuando quieres saber cómo va el envío",
      "texto": "Si vas a enseñar «Enviando…», el resultado del servidor o un cambio optimista, empieza con action: useActionState, useFormStatus y useOptimistic se apoyan en él (lecciones 58 a 60)."
    },
    {
      "titulo": "Con un framework",
      "texto": "En Next.js o React Router en modo framework, action recibe funciones que se ejecutan en el servidor y el formulario funciona antes de que cargue el JavaScript (lección 89)."
    },
    {
      "titulo": "Cuándo seguir con onSubmit",
      "texto": "Cuando necesitas el evento (decidir si se envía o no), cuando no quieres el reset, o cuando una librería de formularios te pide su manejador, como el handleSubmit de React Hook Form. onSubmit sigue siendo React válido."
    }
  ]
}
```

## Errores típicos

**Olvidar el `name` y esperar números.** `FormData` solo recoge los campos con `name`, y lo que recoge es texto:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function publicar(formData) {\n  console.log(formData.get('servicio'), formData.get('horas') + 1)\n}\n\n<form action={publicar}>\n  <label>\n    Qué ofreces <input id=\"servicio\" />\n  </label>\n  <label>\n    Horas <input name=\"horas\" type=\"number\" defaultValue=\"2\" />\n  </label>\n  <button>Publicar</button>\n</form>\n\n// Escribes «Paseo de perros» y pulsas «Publicar».\n// ¿Qué sale en la consola?",
  "opciones": [
    "Paseo de perros 3",
    "null 21",
    "undefined 3",
    "Paseo de perros 21"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa. El id no sirve para FormData: sin name, el campo no está, y get devuelve null (no undefined). Y aunque el campo sea type=\"number\", su valor llega como el texto «2»: «2» + 1 es «21». Pon name en cada campo y convierte con Number lo que tenga que ser un número."
}
```

**Dejar un `onSubmit` con `preventDefault()` junto al `action`.** Si el formulario tiene los dos, React ejecuta primero `onSubmit`; si ahí llamas a `e.preventDefault()`, **la acción no se ejecuta nunca**. Lo comprobamos: el `onSubmit` sale en la consola y la acción, no. Sin `preventDefault`, se ejecutan los dos, en ese orden. Al pasar un formulario a `action`, borra el manejador antiguo entero.

**Ponerle `method`, `encType` o `target` al formulario.** Con una función en `action`, no sirven de nada, y React avisa al montar:

```text
Cannot specify a encType or method for a form that specifies a function as the action. React provides those automatically. They will get overridden.
```

Es decir: React decide cómo se envía y va a ignorar lo que pongas. Con `target` el aviso es otro («Cannot specify a target for a form that specifies a function as the action. The function will always be executed in the same window.»), y los botones con `formAction` tienen los suyos para `formMethod`, `formEncType` y `formTarget`.

**Poner `formAction` en un botón con `type="button"`.** Ese botón no envía el formulario, así que su acción no se ejecuta, y React avisa: «A button can only specify a formAction along with type="submit" or no type.». Quítale el `type` o ponle `type="submit"`.

**Mandar el `FormData` tal cual a una API que espera JSON.** `body: formData` envía el formulario como `multipart/form-data`. La API simulada contesta `400` con `{"error":"El cuerpo debe ser JSON válido"}`; un servidor real que espere JSON, algo parecido. Conviértelo con `JSON.stringify(Object.fromEntries(formData))` y el `Content-Type` de JSON, como en el tablón.

## Ejercicios

### Ejercicio 1: el Café de Reparaciones

El Café de Reparaciones de Benimaclet abre los sábados para arreglar entre vecinos lo que se ha roto. Su formulario apunta el aparato **solo en la pantalla**: no llega al servidor y, al pulsar «Actualizar la lista», desaparece. Además, los campos se quedan con lo escrito.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: apuntar el aparato en el servidor",
  "consigna": "Cambia el onSubmit por una acción en <form action>. La acción envía los tres campos con POST a /api/aparatos (en JSON) y, cuando el servidor contesta, vuelve a pedir la lista con cargar(). No controles los campos: el reset tiene que vaciarlos solo. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [aparatos, setAparatos] = useState(null)\n\n  async function cargar() {\n    const respuesta = await fetch('/api/aparatos')\n    setAparatos(await respuesta.json())\n  }\n\n  function recargar() {\n    setAparatos(null)\n    cargar()\n  }\n\n  useEffect(() => {\n    cargar()\n  }, [])\n\n  // Esto solo apunta el aparato en esta pantalla.\n  // 1. Cámbialo por una acción en <form action>: recibe el FormData.\n  // 2. Envía { aparato, averia, vecino } con POST a /api/aparatos, en JSON.\n  // 3. Cuando el servidor conteste, vuelve a pedir la lista con cargar().\n  function manejarEnvio(e) {\n    e.preventDefault()\n    const datos = new FormData(e.currentTarget)\n    setAparatos([...aparatos, { id: Date.now(), ...Object.fromEntries(datos) }])\n  }\n\n  return (\n    <main>\n      <h1>Café de Reparaciones de Benimaclet</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Aparato <input name=\"aparato\" required />\n        </label>\n        <label>\n          Qué le pasa <input name=\"averia\" required />\n        </label>\n        <label>\n          Tu nombre <input name=\"vecino\" required />\n        </label>\n        <button>Apuntar</button>\n      </form>\n      <h2>En la cola de este sábado</h2>\n      <button type=\"button\" onClick={recargar}>\n        Actualizar la lista\n      </button>\n      {aparatos === null ? (\n        <p className=\"nota\">Cargando la cola…</p>\n      ) : (\n        <ul>\n          {aparatos.map((a) => (\n            <li key={a.id}>\n              {a.aparato} · {a.averia} · de {a.vecino}\n            </li>\n          ))}\n        </ul>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #9a3412;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fed7aa;\n  border-radius: 8px;\n  background: #fff7ed;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "aparatos": [
      {
        "id": 1,
        "aparato": "Tostadora",
        "averia": "Solo calienta por un lado",
        "vecino": "Pilar"
      },
      {
        "id": 2,
        "aparato": "Lámpara de pie",
        "averia": "Parpadea al encenderla",
        "vecino": "Joan"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, la cola muestra los aparatos que ya estaban apuntados",
      "pasos": [],
      "espera": {
        "rol": "listitem",
        "texto": "Tostadora"
      }
    },
    {
      "descripcion": "Al apuntar una cafetera, sale en la cola",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Aparato",
            "texto": "Cafetera italiana"
          }
        },
        {
          "escribir": {
            "etiqueta": "Qué le pasa",
            "texto": "Pierde agua por la junta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Amparo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Cafetera italiana"
      }
    },
    {
      "descripcion": "Al terminar el envío, el campo «Aparato» queda vacío",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Aparato",
            "texto": "Cafetera italiana"
          }
        },
        {
          "escribir": {
            "etiqueta": "Qué le pasa",
            "texto": "Pierde agua por la junta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Amparo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntar"
          }
        }
      ],
      "espera": {
        "etiqueta": "Aparato",
        "valor": ""
      }
    },
    {
      "descripcion": "Al terminar el envío, el campo «Tu nombre» queda vacío",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Aparato",
            "texto": "Cafetera italiana"
          }
        },
        {
          "escribir": {
            "etiqueta": "Qué le pasa",
            "texto": "Pierde agua por la junta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Amparo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntar"
          }
        }
      ],
      "espera": {
        "etiqueta": "Tu nombre",
        "valor": ""
      }
    },
    {
      "descripcion": "El aparato queda guardado en el servidor, con su avería y tu nombre: tras «Actualizar la lista» sigue ahí",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Aparato",
            "texto": "Cafetera italiana"
          }
        },
        {
          "escribir": {
            "etiqueta": "Qué le pasa",
            "texto": "Pierde agua por la junta"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Amparo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntar"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Cafetera italiana"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Actualizar la lista"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Cafetera italiana · Pierde agua por la junta · de Amparo"
      }
    }
  ]
}
```

### Ejercicio 2: borradores en el Banco de Tiempo

El formulario del tablón ya publica en el servidor. Falta el botón «Guardar borrador»: ahora no hace nada. Haz que guarde la oferta en `/api/borradores` **con su propia acción**, sin tocar la de publicar.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: un segundo botón con su propia acción",
  "consigna": "Escribe la acción guardarBorrador: que envíe la oferta a /api/borradores (usa enviar) y después vuelva a cargar. Dásela al botón «Guardar borrador» con formAction. «Publicar» tiene que seguir funcionando igual. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nasync function enviar(ruta, formData) {\n  const respuesta = await fetch(ruta, {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      servicio: formData.get('servicio'),\n      horas: Number(formData.get('horas')),\n      vecina: formData.get('vecina'),\n    }),\n  })\n  if (!respuesta.ok) throw new Error('El servidor no ha guardado la oferta')\n}\n\nexport default function App() {\n  const [datos, setDatos] = useState(null)\n\n  async function cargar() {\n    const [ofertas, borradores] = await Promise.all([\n      fetch('/api/ofertas').then((r) => r.json()),\n      fetch('/api/borradores').then((r) => r.json()),\n    ])\n    setDatos({ ofertas, borradores })\n  }\n\n  function recargar() {\n    setDatos(null)\n    cargar()\n  }\n\n  useEffect(() => {\n    cargar()\n  }, [])\n\n  async function publicar(formData) {\n    await enviar('/api/ofertas', formData)\n    await cargar()\n  }\n\n  // Escribe aquí la acción guardarBorrador: que envíe a /api/borradores\n  // y después vuelva a cargar.\n\n  return (\n    <main>\n      <h1>Banco de Tiempo del Arrabal</h1>\n      <form action={publicar}>\n        <label>\n          Qué ofreces <input name=\"servicio\" required />\n        </label>\n        <label>\n          Horas <input name=\"horas\" type=\"number\" min=\"1\" defaultValue=\"1\" />\n        </label>\n        <label>\n          Tu nombre <input name=\"vecina\" required />\n        </label>\n        <div className=\"botones\">\n          <button>Publicar</button>\n          {/* Este botón no hace nada: dale su propia acción */}\n          <button type=\"button\">Guardar borrador</button>\n        </div>\n      </form>\n      <button type=\"button\" onClick={recargar}>\n        Actualizar\n      </button>\n      {datos === null ? (\n        <p className=\"nota\">Cargando el tablón…</p>\n      ) : (\n        <>\n          <h2>Tablón</h2>\n          <ul>\n            {datos.ofertas.map((o) => (\n              <li key={o.id}>\n                {o.servicio} · {o.horas} h · {o.vecina}\n              </li>\n            ))}\n          </ul>\n          <h2>Tus borradores</h2>\n          <ul>\n            {datos.borradores.map((b) => (\n              <li key={b.id}>{b.servicio} (borrador)</li>\n            ))}\n          </ul>\n        </>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #166534;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n}\n\n.botones {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "ofertas": [
      {
        "id": 1,
        "servicio": "Arreglos de costura",
        "horas": 1,
        "vecina": "Rosa"
      },
      {
        "id": 2,
        "servicio": "Ayuda con el ordenador",
        "horas": 2,
        "vecina": "Iñaki"
      }
    ],
    "borradores": [
      {
        "id": 1,
        "servicio": "Clases de jota",
        "horas": 1,
        "vecina": "Pili"
      }
    ]
  },
  "comprobaciones": [
    {
      "descripcion": "«Publicar» sigue llevando la oferta al tablón",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Qué ofreces",
            "texto": "Clases de ajedrez"
          }
        },
        {
          "escribir": {
            "etiqueta": "Horas",
            "texto": "2"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Nacho"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Publicar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Clases de ajedrez · 2 h · Nacho"
      }
    },
    {
      "descripcion": "Al pulsar «Guardar borrador», la oferta sale en «Tus borradores»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Qué ofreces",
            "texto": "Clases de ajedrez"
          }
        },
        {
          "escribir": {
            "etiqueta": "Horas",
            "texto": "2"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Nacho"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar borrador"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Clases de ajedrez (borrador)"
      }
    },
    {
      "descripcion": "Un borrador no se publica: no aparece en el tablón",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Qué ofreces",
            "texto": "Clases de ajedrez"
          }
        },
        {
          "escribir": {
            "etiqueta": "Horas",
            "texto": "2"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Nacho"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar borrador"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Clases de ajedrez (borrador)"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "Clases de ajedrez · 2 h"
        }
      }
    },
    {
      "descripcion": "Al guardar el borrador, el campo «Qué ofreces» se vacía",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Qué ofreces",
            "texto": "Clases de ajedrez"
          }
        },
        {
          "escribir": {
            "etiqueta": "Horas",
            "texto": "2"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Nacho"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar borrador"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Clases de ajedrez (borrador)"
          }
        }
      ],
      "espera": {
        "etiqueta": "Qué ofreces",
        "valor": ""
      }
    },
    {
      "descripcion": "El borrador queda guardado en el servidor: tras «Actualizar» sigue ahí",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Qué ofreces",
            "texto": "Clases de ajedrez"
          }
        },
        {
          "escribir": {
            "etiqueta": "Horas",
            "texto": "2"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Nacho"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Guardar borrador"
          }
        },
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Clases de ajedrez (borrador)"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Actualizar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Clases de ajedrez (borrador)"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el Café de Reparaciones, envuelve el formulario en el `LimiteDeError` de la lección 53, con un botón para volver a intentarlo. Pruébalo con «Fallar la siguiente petición».
2. Añade al café un `<select name="mesa">` con tres mesas (electricidad, costura y bicis) y enseña la cola agrupada por mesa. ¿Qué valor tiene el select después de apuntar?
3. En el Banco de Tiempo, convierte «Tu nombre» en un campo controlado. Comprueba que ya no se vacía al publicar, y piensa si en este formulario te conviene: ¿qué ganas y qué pierdes?
4. Intenta enseñar «Publicando…» en el tablón con un `useState` normal y comprueba que no sale. Guárdalo: en la lección 58 lo arreglarás con `isPending`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "<form>",
      "descripcion": "La referencia de react.dev de esta lección: la prop action, el reset de los campos, formAction, los errores y las Server Functions.",
      "url": "https://react.dev/reference/react-dom/components/form",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useTransition: exposing action props",
      "descripcion": "Por qué una prop que recibe una acción se ejecuta en una transición, y cómo exponer tus propias props action en un componente.",
      "url": "https://react.dev/reference/react/useTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React v19: Actions",
      "descripcion": "El anuncio de React 19, con el porqué de las acciones, form action y los Hooks que las acompañan.",
      "url": "https://react.dev/blog/2024/12/05/react-19",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "FormData",
      "descripcion": "Todo lo que puedes hacer con el objeto que recibe la acción: get, getAll, has, recorrerlo y convertirlo en objeto.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/FormData",
      "etiqueta": "MDN"
    },
    {
      "titulo": "HTMLFormElement: reset()",
      "descripcion": "Lo que hace exactamente el reset que React aplica al terminar la acción: cada campo vuelve a su valor inicial.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset",
      "etiqueta": "MDN"
    },
    {
      "titulo": "<button>: formaction, name y value",
      "descripcion": "Los atributos de HTML en los que se basan formAction y el botón que entra en el FormData.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button",
      "etiqueta": "MDN"
    }
  ]
}
```
