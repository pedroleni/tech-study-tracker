# `useActionState`: el estado que devuelve una acción

- **Módulo:** Formularios y Actions
- **Slug:** `useactionstate-el-estado-que-devuelve-una-accion` (autogenerado del título)
- **Orden:** 580
- **Fuentes:** [useActionState](https://react.dev/reference/react/useActionState) — ver `contenido/react/TEMARIO.md` #58

---

## Qué es y para qué sirve

En la lección 57 pasaste una función a `<form action>` y dejaste que React se encargara del envío. Funcionaba, pero se quedaron tres cosas a medias:

- **No había forma de enseñar «Enviando…»**: los `set` de dentro de la acción no se ven hasta que la acción termina.
- **El resultado no tenía dónde ir**: el mensaje de «gracias», los datos que devuelve el servidor o un error acababan en estados sueltos que había que actualizar a mano.
- **Un error lanzado se llevaba el formulario** al error boundary, y capturarlo tú obligaba a guardar el error en otro estado aparte.

`useActionState` junta las tres cosas. Le das una acción y un estado inicial, y te devuelve **el estado, una versión de la acción para pasar al formulario e `isPending`**. Lo que devuelva tu acción **pasa a ser el estado nuevo**:

```jsx
const [estado, accionEnvuelta, isPending] = useActionState(accion, estadoInicial)

async function accion(estadoAnterior, formData) {
  // ...enviar, comprobar...
  return estadoNuevo
}
```

Si te recuerda a `useReducer` (lección 27), vas bien: react.dev llama a esta función *reducerAction*. La diferencia es que este reducer **puede ser `async` y tener efectos**: hacer un `fetch`, escribir en el servidor. Por eso se ejecuta como una acción, dentro de una transición.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres cosas que devuelve useActionState",
  "roles": [
    {
      "etiqueta": "estado",
      "rol": "Lo que devolvió la última acción",
      "descripcion": "En el primer render, el estado inicial. Después, lo que devuelva tu acción: un mensaje, un error, los datos del servidor... lo que necesites pintar."
    },
    {
      "etiqueta": "accionEnvuelta",
      "rol": "La que pasas al formulario",
      "descripcion": "Va a action o a formAction. Al llamarla, React ejecuta tu acción con el estado anterior y lo que le pases (con un formulario, el FormData)."
    },
    {
      "etiqueta": "isPending",
      "rol": "Si hay una acción en marcha",
      "descripcion": "true desde el envío hasta que el estado nuevo está en pantalla. Sin estados de carga a mano."
    }
  ]
}
```

## Tu primera acción con estado

La **Gran Recogida del Banco de Alimentos** busca voluntarios para los turnos en los supermercados. El formulario apunta a cada voluntario en la API simulada, que tarda algo más de un segundo en contestar.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Apuntarse a un turno de la Gran Recogida",
  "codigo": "import { useActionState } from 'react'\n\nasync function apuntarse(estadoAnterior, formData) {\n  const voluntario = {\n    nombre: formData.get('nombre'),\n    turno: formData.get('turno'),\n  }\n  await fetch('/api/voluntarios', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(voluntario),\n  })\n  return {\n    turnos: estadoAnterior.turnos + 1,\n    mensaje: `Gracias, ${voluntario.nombre}: te esperamos el ${voluntario.turno}.`,\n  }\n}\n\nexport default function App() {\n  const [estado, accionApuntarse, isPending] = useActionState(apuntarse, {\n    turnos: 0,\n    mensaje: null,\n  })\n\n  return (\n    <main>\n      <h1>Gran Recogida del Banco de Alimentos</h1>\n      <form action={accionApuntarse}>\n        <label>\n          Tu nombre <input name=\"nombre\" required />\n        </label>\n        <label>\n          Turno\n          <select name=\"turno\">\n            <option>viernes de 16 a 20 h</option>\n            <option>sábado de 9 a 14 h</option>\n            <option>sábado de 16 a 20 h</option>\n          </select>\n        </label>\n        <button disabled={isPending}>{isPending ? 'Apuntando…' : 'Apuntarme'}</button>\n      </form>\n      <p role=\"status\">{estado.mensaje}</p>\n      <p className=\"nota\">Turnos apuntados desde esta pantalla: {estado.turnos}</p>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #1e40af;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bfdbfe;\n  border-radius: 8px;\n  background: #eff6ff;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.total {\n  font-size: 1.2rem;\n  font-weight: bold;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #1e3a8a;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n",
  "anotaciones": [
    {
      "fragmento": "async function apuntarse(estadoAnterior, formData) {",
      "nota": "Dos argumentos, en este orden: el estado anterior y lo que llega de la acción, que con un formulario es el FormData. Está fuera del componente porque no necesita nada de él: todo le llega por argumentos."
    },
    {
      "fragmento": "turnos: estadoAnterior.turnos + 1,",
      "nota": "El estado nuevo se calcula a partir del anterior, como en un reducer. La primera vez, estadoAnterior es el estado inicial."
    },
    {
      "fragmento": "return {",
      "nota": "Lo que devuelves es el estado nuevo, entero: aquí no se mezcla con el anterior. Devuelve siempre la misma forma de objeto, o el JSX que lo lee fallará."
    },
    {
      "fragmento": "useActionState(apuntarse, {",
      "nota": "La acción y el estado inicial. Como useState, el estado inicial solo cuenta en el primer render."
    },
    {
      "fragmento": "<form action={accionApuntarse}>",
      "nota": "Al formulario va la acción que devuelve el Hook, no apuntarse. Es la que sabe pasar el estado anterior y guardar lo que devuelvas. React la ejecuta en una transición, como en la lección 57."
    },
    {
      "fragmento": "disabled={isPending}",
      "nota": "isPending está a true desde que pulsas hasta que el estado nuevo está pintado. Desactivar el botón evita apuntarse dos veces sin querer."
    },
    {
      "fragmento": "<p role=\"status\">{estado.mensaje}</p>",
      "nota": "El resultado de la acción se pinta como cualquier estado. El role=\"status\" hace que un lector de pantalla lo anuncie al aparecer (lección 37)."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Vicent",
        "turno": "sábado de 9 a 14 h"
      }
    ]
  },
  "red": {
    "latencia": 1200
  }
}
```

Apúntate un par de veces. Mientras la API contesta, el botón dice «Apuntando…» y no se puede pulsar; cuando llega la respuesta, sale el mensaje y el contador sube. Es lo que en la lección 57 no conseguías con `setEnviando(true)`: **`isPending` lo lleva React**, igual que el de `useTransition` en la lección 51.

Y, como es una acción de formulario, al terminar se vacía «Tu nombre». El `select` vuelve a su primera opción.

## Los errores del servidor, como estado

El ejemplo anterior tiene un fallo: **no mira la respuesta**. Si el servidor contesta un 500, `fetch` no lanza nada y la acción da las gracias igualmente. La respuesta mala hay que comprobarla, y la pregunta es qué hacer con ella.

Con `useActionState`, lo natural es **devolver el error como parte del estado**. Para la acción es un resultado más, y el componente lo pinta.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Cuando el servidor dice que no",
  "consigna": "En el panel de red, pulsa «Fallar la siguiente petición» y apúntate: sale el aviso y el contador no sube. Vuelve a apuntarte: el aviso desaparece. Fíjate también en qué ha pasado con tu nombre después del fallo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport './estilos.css'\n\nasync function apuntarse(estadoAnterior, formData) {\n  const voluntario = {\n    nombre: formData.get('nombre'),\n    turno: formData.get('turno'),\n  }\n  const respuesta = await fetch('/api/voluntarios', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(voluntario),\n  })\n  if (!respuesta.ok) {\n    return {\n      ...estadoAnterior,\n      mensaje: null,\n      error: 'No hemos podido apuntarte. Prueba otra vez en un momento.',\n    }\n  }\n  return {\n    turnos: estadoAnterior.turnos + 1,\n    mensaje: `Gracias, ${voluntario.nombre}: te esperamos el ${voluntario.turno}.`,\n    error: null,\n  }\n}\n\nexport default function App() {\n  const [estado, accionApuntarse, isPending] = useActionState(apuntarse, {\n    turnos: 0,\n    mensaje: null,\n    error: null,\n  })\n\n  return (\n    <main>\n      <h1>Gran Recogida del Banco de Alimentos</h1>\n      <form action={accionApuntarse}>\n        <label>\n          Tu nombre <input name=\"nombre\" required />\n        </label>\n        <label>\n          Turno\n          <select name=\"turno\">\n            <option>viernes de 16 a 20 h</option>\n            <option>sábado de 9 a 14 h</option>\n            <option>sábado de 16 a 20 h</option>\n          </select>\n        </label>\n        <button disabled={isPending}>{isPending ? 'Apuntando…' : 'Apuntarme'}</button>\n      </form>\n      <p role=\"status\">{estado.mensaje}</p>\n      {estado.error && <p role=\"alert\">{estado.error}</p>}\n      <p className=\"nota\">Turnos apuntados desde esta pantalla: {estado.turnos}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #1e40af;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bfdbfe;\n  border-radius: 8px;\n  background: #eff6ff;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.total {\n  font-size: 1.2rem;\n  font-weight: bold;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #1e3a8a;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "voluntarios": [
      {
        "id": 1,
        "nombre": "Vicent",
        "turno": "sábado de 9 a 14 h"
      }
    ]
  },
  "red": {
    "latencia": 1200
  }
}
```

`...estadoAnterior` conserva lo que no cambia (el contador), y el error sustituye al mensaje. En el envío siguiente, si va bien, `error: null` lo borra. **El estado siempre dice cómo acabó el último envío**, sin un `setError` y un `setMensaje` que mantener de acuerdo.

Lo del nombre: **se ha borrado**. Para `<form action>`, una acción que devuelve algo, aunque sea un error, ha terminado bien, y vacía los campos no controlados (lo comprobamos en la vista previa, igual que en la lección 57). Conservar lo escrito cuando hay un error es parte de validar un formulario, y lo verás en la lección 61.

¿Y lanzar el error, como en la lección 57? Sigue funcionando: el error llega al error boundary más cercano (lección 53). Pero con `useActionState` tiene un efecto más: **React cancela todas las acciones que estaban en cola** detrás de la que falló. Lo comprobamos con tres envíos seguidos: falla el primero y los otros dos no llegan a salir. De ahí la regla de react.dev:

```laboratorio
{
  "tipo": "roles",
  "titulo": "Dos clases de error",
  "roles": [
    {
      "etiqueta": "Esperado",
      "rol": "Devuélvelo como estado",
      "descripcion": "El servidor dice que no, no quedan plazas, el código ya se usó, la red ha fallado. Es un resultado posible del envío: va al estado y se pinta junto al formulario."
    },
    {
      "etiqueta": "Inesperado",
      "rol": "Deja que se lance",
      "descripcion": "Un fallo de programación, como leer una propiedad de undefined. Va al error boundary más cercano (lección 53) y cancela los envíos que había en cola."
    }
  ]
}
```

## Varios envíos seguidos: una cola

Una acción de `useActionState` necesita el estado anterior para calcular el siguiente. Así que si se envía varias veces seguidas, **React no las ejecuta a la vez: las pone en cola** y cada una empieza cuando acaba la anterior, con su resultado como `estadoAnterior`.

La **Rifa solidaria del AMPA** del colegio vende papeletas numeradas: el número lo pone el servidor, por orden de llegada. Cada envío compra una.

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "async function comprar(estadoAnterior, formData) {\n  const respuesta = await fetch('/api/papeletas', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ familia: formData.get('familia') }),\n  }) // tarda medio segundo\n  const papeleta = await respuesta.json() // el servidor la numera: 41, 42...\n  return [...estadoAnterior, papeleta.id]\n}\n\nconst [mias, accionComprar, isPending] = useActionState(comprar, [])\n\n<form action={accionComprar}>\n  <input name=\"familia\" defaultValue=\"Pérez\" />\n  <button>Comprar papeleta</button>\n  <p>Tus papeletas: {mias.join(', ') || 'ninguna'}{isPending && ' (comprando…)'}</p>\n</form>\n\n// Pulsas «Comprar papeleta» tres veces seguidas, muy deprisa.\n// ¿Qué dice el párrafo justo después de que acabe la segunda compra?",
  "opciones": [
    "Tus papeletas: 41, 42, 43",
    "Tus papeletas: 41, 42 (comprando…)",
    "Tus papeletas: ninguna (comprando…)",
    "Tus papeletas: 41 (comprando…)"
  ],
  "correcta": 2,
  "explicacion": "Lo comprobamos en la vista previa. Las compras van en cola: en ese momento hay dos terminadas y la tercera está en marcha. Pero React aplica de una vez los resultados de las acciones seguidas, cuando acaba la última: hasta entonces se ve el estado de antes, con isPending a true. Al final, de golpe: 41, 42, 43. react.dev lo da como una limitación que puede cambiar."
}
```

Míralo en marcha. La consola apunta cuándo empieza y acaba cada compra, y con qué `estadoAnterior`.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "La rifa del AMPA, envío a envío",
  "codigo": "import { useActionState } from 'react'\n\nasync function comprar(estadoAnterior, formData) {\n  console.log(`Empieza una compra. Ya tienes: ${estadoAnterior.join(', ') || 'ninguna'}`)\n  const respuesta = await fetch('/api/papeletas', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ familia: formData.get('familia') }),\n  })\n  const papeleta = await respuesta.json()\n  console.log(`Acaba: papeleta n.º ${papeleta.id}`)\n  return [...estadoAnterior, papeleta.id]\n}\n\nexport default function App() {\n  const [mias, accionComprar, isPending] = useActionState(comprar, [])\n\n  return (\n    <main>\n      <h1>Rifa solidaria del AMPA</h1>\n      <p className=\"nota\">Una cesta de productos de la comarca. 2 € la papeleta.</p>\n      <form action={accionComprar}>\n        <label>\n          Familia <input name=\"familia\" defaultValue=\"Pérez\" />\n        </label>\n        <button>Comprar papeleta</button>\n      </form>\n      <p role=\"status\">\n        Tus papeletas: {mias.join(', ') || 'ninguna'}\n        {isPending && ' (comprando…)'}\n      </p>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #7e22ce;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #e9d5ff;\n  border-radius: 8px;\n  background: #faf5ff;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.total {\n  font-size: 1.2rem;\n  font-weight: bold;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #1e3a8a;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n",
  "anotaciones": [
    {
      "fragmento": "Ya tienes: ${estadoAnterior",
      "nota": "En la segunda compra, estadoAnterior ya trae la primera papeleta: la acción no empieza hasta que la anterior ha devuelto su resultado."
    },
    {
      "fragmento": "return [...estadoAnterior, papeleta.id]",
      "nota": "Cada compra añade su número a lo que le llegó. Como van de una en una, ninguna pisa a otra y el orden es el de los clics."
    },
    {
      "fragmento": "{isPending && ' (comprando…)'}",
      "nota": "isPending sigue a true mientras quede algo en la cola, no solo durante la primera compra."
    },
    {
      "fragmento": "defaultValue=\"Pérez\"",
      "nota": "Un campo con valor inicial: tras cada compra, el reset lo deja otra vez en «Pérez»."
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "papeletas": [
      {
        "id": 40,
        "familia": "García"
      }
    ]
  },
  "red": {
    "latencia": 800
  }
}
```

Pulsa «Comprar papeleta» tres veces seguidas. En el panel de red, los tres `POST /api/papeletas` salen **uno detrás de otro**, no a la vez; en la consola, cada compra empieza con las papeletas de la anterior. La pantalla se queda en «ninguna (comprando…)» hasta que acaba la tercera.

Compáralo con lo que ya sabes:

- Con `<form action>` a secas (lección 57), dos envíos seguidos lanzan dos acciones que viajan **a la vez**. Lo comprobamos: la segunda empieza antes de que acabe la primera.
- Con `startTransition` (lección 51), las transiciones tampoco esperan a la anterior, y la respuesta que llega la última pisa a las demás aunque sea la más vieja.
- **`useActionState` ordena**: la cola garantiza que cada acción ve el resultado de la anterior.

El precio es el tiempo: tres compras de 800 ms tardan casi dos segundos y medio. Si quieres que el usuario vea cada cambio en el acto, la lección 60 enseña `useOptimistic`, y el proyecto 62 junta las dos cosas en unos comentarios. react.dev enseña también a cancelar lo que hay en cola con un `AbortController`, con una advertencia: abortar la petición no deshace lo que el servidor ya haya guardado.

## Sin formulario: dentro de una transición

La acción envuelta no es solo para `<form>`. Puedes llamarla desde cualquier sitio y **pasarle lo que quieras**: un id, un objeto `{ type: 'anadir' }` como en un reducer... Ese valor llega como segundo argumento, en lugar del `FormData`.

La condición es que la llamada vaya **dentro de una transición**. `action` y `formAction` la ponen por ti; desde un `onClick`, la pones tú con `startTransition`. Prueba las dos formas:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Comprar papeletas desde un botón",
  "consigna": "Pulsa «Comprar sin transición»: la compra llega, pero no sale «(comprando…)», y en la consola aparece un mensaje en rojo. Ahora pulsa «Comprar con transición». Después arregla el primer botón para que haga lo mismo que el segundo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { startTransition, useActionState } from 'react'\nimport './estilos.css'\n\nasync function comprar(estadoAnterior, familia) {\n  const respuesta = await fetch('/api/papeletas', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ familia }),\n  })\n  const papeleta = await respuesta.json()\n  return [...estadoAnterior, papeleta.id]\n}\n\nexport default function App() {\n  const [mias, accionComprar, isPending] = useActionState(comprar, [])\n\n  function comprarSinTransicion() {\n    accionComprar('Pérez')\n  }\n\n  function comprarConTransicion() {\n    startTransition(() => {\n      accionComprar('Pérez')\n    })\n  }\n\n  return (\n    <main>\n      <h1>Rifa solidaria del AMPA</h1>\n      <button onClick={comprarSinTransicion}>Comprar sin transición</button>\n      <button onClick={comprarConTransicion}>Comprar con transición</button>\n      <p role=\"status\">\n        Tus papeletas: {mias.join(', ') || 'ninguna'}\n        {isPending && ' (comprando…)'}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #7e22ce;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #e9d5ff;\n  border-radius: 8px;\n  background: #faf5ff;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.total {\n  font-size: 1.2rem;\n  font-weight: bold;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #1e3a8a;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "papeletas": [
      {
        "id": 40,
        "familia": "García"
      }
    ]
  },
  "red": {
    "latencia": 1200
  }
}
```

El mensaje de la consola es este (es el mismo que lista la lección 64):

```text
An async function with useActionState was called outside of a transition. This is likely not what you intended (for example, isPending will not update correctly). Either call the returned function inside startTransition, or pass it to an `action` or `formAction` prop.
```

Es decir: has llamado a la acción de `useActionState`, que es `async`, fuera de una transición; seguramente no querías eso (por ejemplo, `isPending` no se actualizará bien); llámala dentro de `startTransition` o pásala a una prop `action` o `formAction`. React lo escribe con `console.error`, en rojo, pero **no rompe nada**: la compra se hace y el número llega. Lo que se pierde es justo lo que has visto, `isPending`. Con una acción que no es `async` no sale el aviso, porque no hay nada que esperar.

Lo mismo vale para tus componentes: si uno recibe una prop `action` (lección 51) y la llama dentro de `startTransition`, puedes pasarle `accionComprar` sin más.

## `useActionState` frente a `useReducer`

Se parecen tanto que conviene tener clara la frontera:

```laboratorio
{
  "tipo": "roles",
  "roles": [
    {
      "etiqueta": "useReducer",
      "rol": "Estado de la interfaz",
      "descripcion": "El reducer es puro y síncrono: calcula el estado siguiente y nada más. Cada dispatch se aplica en el acto. Lección 27."
    },
    {
      "etiqueta": "useActionState",
      "rol": "Estado de una acción",
      "descripcion": "La acción puede ser async y tener efectos (fetch, escribir en el servidor). Va dentro de una transición, en cola, y trae isPending."
    }
  ]
}
```

Como la acción está pensada para tener efectos, **StrictMode no la ejecuta dos veces** (lo comprobamos: tres envíos, tres llamadas), al contrario que un reducer o un componente (lección 12).

Dos nombres que te puedes encontrar. En código escrito con versiones de prueba anteriores a React 19, este Hook se llamaba `useFormState` y se importaba de `react-dom`; hoy funciona con un aviso (lección 91). Y `useActionState` admite un tercer argumento, **`permalink`**, que solo sirve con renderizado en el servidor: es la URL a la que va el formulario si se envía antes de que cargue el JavaScript (lecciones 87 y 89).

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Cuando el envío tiene un resultado que enseñar",
      "texto": "Un mensaje de confirmación, el número que da el servidor, un error. Si la acción devuelve algo que la pantalla tiene que pintar, es su sitio."
    },
    {
      "titulo": "Cuando necesitas «Enviando…» en el mismo componente",
      "texto": "isPending, sin estados de carga a mano. Si el botón está en un componente hijo del formulario, useFormStatus (lección 59) lo lee desde ahí sin pasar props."
    },
    {
      "titulo": "Cuando el orden importa",
      "texto": "Un carrito, un contador, una lista que crece: cada envío parte del resultado del anterior. La cola lo garantiza."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Si los envíos tienen que ir en paralelo, la cola estorba: usa useState con useTransition. Y si el estado no depende de ninguna acción (lo que escribes, lo que está abierto), es estado normal: useState o useReducer."
    }
  ]
}
```

## Errores típicos

**Escribir la acción como en la lección 57.** Con `useActionState`, el `FormData` ya no es el primer argumento:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "async function apuntarse(formData) {\n  const nombre = formData.get('nombre')\n  await fetch('/api/voluntarios', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ nombre }),\n  })\n  return { mensaje: `Gracias, ${nombre}`, error: null }\n}\n\nconst [estado, accionApuntarse] = useActionState(apuntarse, {\n  mensaje: null,\n  error: null,\n})\n\n<form action={accionApuntarse}>\n  <input name=\"nombre\" />\n  <button>Apuntarme</button>\n</form>\n\n// Escribes «Lucía» y pulsas «Apuntarme». ¿Qué pasa?",
  "opciones": [
    "Sale «Gracias, Lucía»",
    "Sale «Gracias, null»",
    "La app falla con «formData.get is not a function»",
    "Sale «Gracias, undefined»"
  ],
  "correcta": 2,
  "explicacion": "Lo comprobamos en la vista previa. El primer argumento es el estado anterior, aquí el objeto { mensaje: null, error: null }, aunque lo hayas llamado formData. Los objetos no tienen get: TypeError. Y como la acción lanza, el error va al boundary y, sin boundary, se lleva la app. La firma correcta es (estadoAnterior, formData)."
}
```

**Olvidar el `return` en algún camino.** Si un `if` sale de la acción sin devolver nada, el estado pasa a ser `undefined`, y el siguiente render que lea `estado.error` falla con «Cannot read properties of undefined (reading 'error')». Cada camino de la acción devuelve un estado con la misma forma.

**Llamar a la acción mientras se renderiza.** Escrita en el cuerpo del componente, cada render la llamaría otra vez. React lo corta con un error: «Cannot update action state while rendering.». Se llama desde un envío, un clic o un efecto, nunca durante el render.

**Lanzar errores que esperabas.** Un «no quedan plazas» lanzado con `throw` se lleva el formulario al boundary y cancela la cola. Devuélvelo como estado.

**Llamarla fuera de una transición.** El aviso de la sección anterior: `isPending` no se entera. Desde un manejador, `startTransition`.

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Si cambia la prop que paso como estado inicial, el estado se pone al día",
      "realidad": "El estado inicial solo cuenta en el primer render, como el de useState. Lo comprobamos: el padre cambia la prop de 10 a 50 y el estado sigue en 10. Para empezar de nuevo con otro valor, cambia la key del componente (lección 26) o desmóntalo mientras cargas los datos nuevos."
    },
    {
      "mito": "Si envío tres veces, las tres peticiones van a la vez",
      "realidad": "Van en cola, de una en una, y cada una recibe el resultado de la anterior. Por eso el resultado es ordenado, y por eso tarda más."
    },
    {
      "mito": "useActionState es solo para formularios",
      "realidad": "Puedes llamar a la acción envuelta desde un botón, un efecto o cualquier sitio, con el valor que quieras. Solo tiene que ser dentro de una transición."
    }
  ]
}
```

## Ejercicios

### Ejercicio 1: firmas por un carril bici

Una asociación de vecinos recoge firmas para pedir un carril bici en la avenida del Cid. `App` carga las firmas del servidor y le pasa la lista a `Firmar`, que ya tiene montado `useActionState`... pero la acción no hace nada. Escríbela.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: la acción de firmar",
  "consigna": "Escribe la acción firmar de Firmar.jsx siguiendo los pasos 1 a 3, y después los pasos 4 y 5 en el componente. No toques App.jsx. Prueba el error con «Fallar la siguiente petición». Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "Firmar.jsx",
      "codigo": "import { useActionState } from 'react'\n\n// 1. Envía { nombre } con POST a /api/firmas, en JSON.\n// 2. Si la respuesta no es ok, devuelve el estado anterior con el error\n//    «No se ha podido guardar tu firma. Inténtalo otra vez.»\n// 3. Si va bien, vuelve a pedir la lista (GET /api/firmas) y devuelve\n//    { firmas: la lista nueva, error: null }.\nasync function firmar(estadoAnterior, formData) {\n  return estadoAnterior\n}\n\nexport default function Firmar({ firmasIniciales }) {\n  const [estado, accionFirmar] = useActionState(firmar, {\n    firmas: firmasIniciales,\n    error: null,\n  })\n  // 4. Enseña estado.error en un párrafo con role=\"alert\".\n  // 5. Con el tercer valor de useActionState, que el botón diga\n  //    «Firmando…» y no se pueda pulsar mientras se envía.\n\n  return (\n    <>\n      <p className=\"total\">Llevamos {estado.firmas.length} firmas</p>\n      <form action={accionFirmar}>\n        <label>\n          Tu nombre <input name=\"nombre\" required />\n        </label>\n        <button>Firmar</button>\n      </form>\n      <h2>Últimas firmas</h2>\n      <ul>\n        {estado.firmas\n          .slice(-5)\n          .reverse()\n          .map((firma) => (\n            <li key={firma.id}>{firma.nombre}</li>\n          ))}\n      </ul>\n    </>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport Firmar from './Firmar'\nimport './estilos.css'\n\nexport default function App() {\n  const [firmas, setFirmas] = useState(null)\n  const [errorCarga, setErrorCarga] = useState(null)\n  const [version, setVersion] = useState(0)\n\n  useEffect(() => {\n    let ignorar = false\n    fetch('/api/firmas')\n      .then((respuesta) => {\n        if (!respuesta.ok) throw new Error('No se han podido cargar las firmas.')\n        return respuesta.json()\n      })\n      .then((datos) => {\n        if (!ignorar) setFirmas(datos)\n      })\n      .catch((error) => {\n        if (!ignorar) setErrorCarga(error.message)\n      })\n    return () => {\n      ignorar = true\n    }\n  }, [version])\n\n  // Mientras recarga, Firmar se desmonta. Al volver a montarse,\n  // useActionState empieza con la lista nueva como estado inicial.\n  function recargar() {\n    setFirmas(null)\n    setErrorCarga(null)\n    setVersion(version + 1)\n  }\n\n  return (\n    <main>\n      <h1>Un carril bici para la avenida del Cid</h1>\n      <button type=\"button\" onClick={recargar}>\n        Recargar\n      </button>\n      {errorCarga && <p role=\"alert\">{errorCarga}</p>}\n      {firmas === null ? (\n        !errorCarga && <p className=\"nota\">Cargando las firmas…</p>\n      ) : (\n        <Firmar firmasIniciales={firmas} />\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #15803d;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #bbf7d0;\n  border-radius: 8px;\n  background: #f0fdf4;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.total {\n  font-size: 1.2rem;\n  font-weight: bold;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #1e3a8a;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "Firmar.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "firmas": [
      {
        "id": 1,
        "nombre": "Ramón Gil"
      },
      {
        "id": 2,
        "nombre": "Elena Sanz"
      },
      {
        "id": 3,
        "nombre": "Paco Úbeda"
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al firmar, el total pasa de 3 a 4 firmas",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Inés Calvo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "texto": "Llevamos 4 firmas"
      }
    },
    {
      "descripcion": "La firma queda guardada en el servidor: tras «Recargar», tu nombre sigue en la lista",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Inés Calvo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        },
        {
          "pulsar": {
            "texto": "Llevamos 4 firmas"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Recargar"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Inés Calvo"
      }
    },
    {
      "descripcion": "Si el servidor falla, sale el aviso «No se ha podido guardar tu firma…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Inés Calvo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se ha podido guardar tu firma"
      }
    },
    {
      "descripcion": "Si el servidor falla, el total sigue en 3 firmas",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Inés Calvo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "texto": "Llevamos 3 firmas"
      }
    },
    {
      "descripcion": "Después de un fallo puedes volver a firmar, y el aviso desaparece",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Inés Calvo"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Inés Calvo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        },
        {
          "pulsar": {
            "texto": "Llevamos 4 firmas"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "alert"
        }
      }
    },
    {
      "descripcion": "Mientras se envía la firma, el botón dice «Firmando…»",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Tu nombre",
            "texto": "Inés Calvo"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Firmar"
          }
        }
      ],
      "espera": {
        "rol": "button",
        "nombre": "Firmando…"
      }
    }
  ]
}
```

### Ejercicio 2: «Apuntando…» no sale nunca

En la Casa de Cultura de Tafalla te puedes apuntar a los talleres de otoño con un botón por taller. Las inscripciones llegan bien, pero mientras se hacen no sale «Apuntando…», y la consola enseña un mensaje en rojo. Encuentra el fallo.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: la acción, dentro de una transición",
  "consigna": "Pulsa un taller y lee la consola. Arregla manejarClic para que, mientras se hace la inscripción, salga «Apuntando…» y el mensaje rojo no vuelva a aparecer. No cambies la acción apuntarse. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useActionState } from 'react'\nimport './estilos.css'\n\nconst TALLERES = [\n  { id: 'ceramica', nombre: 'Cerámica', dia: 'lunes' },\n  { id: 'encuadernacion', nombre: 'Encuadernación', dia: 'miércoles' },\n  { id: 'fotografia', nombre: 'Fotografía con el móvil', dia: 'jueves' },\n]\n\nconst nombreDe = (id) => TALLERES.find((taller) => taller.id === id).nombre\n\nasync function apuntarse(estadoAnterior, tallerId) {\n  const respuesta = await fetch('/api/inscripciones', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({ tallerId, socia: 'Iratxe' }),\n  })\n  if (!respuesta.ok) {\n    return { ...estadoAnterior, error: 'No se ha podido hacer la inscripción.' }\n  }\n  const inscripcion = await respuesta.json()\n  return { mias: [...estadoAnterior.mias, inscripcion], error: null }\n}\n\nexport default function App() {\n  const [estado, accionApuntarse, isPending] = useActionState(apuntarse, {\n    mias: [],\n    error: null,\n  })\n\n  function manejarClic(tallerId) {\n    accionApuntarse(tallerId)\n  }\n\n  return (\n    <main>\n      <h1>Talleres de otoño · Casa de Cultura de Tafalla</h1>\n      <ul>\n        {TALLERES.map((taller) => (\n          <li key={taller.id}>\n            {taller.nombre}, los {taller.dia}{' '}\n            <button onClick={() => manejarClic(taller.id)}>\n              Apuntarme a {taller.nombre}\n            </button>\n          </li>\n        ))}\n      </ul>\n      <p role=\"status\">{isPending ? 'Apuntando…' : ''}</p>\n      {estado.error && <p role=\"alert\">{estado.error}</p>}\n      <h2>Tus inscripciones</h2>\n      <ul>\n        {estado.mias.map((inscripcion) => (\n          <li key={inscripcion.id}>\n            {nombreDe(inscripcion.tallerId)} · inscripción n.º {inscripcion.id}\n          </li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #b45309;\n}\n\nh2 {\n  font-size: 1.1rem;\n}\n\nform {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0.75rem 1rem;\n  margin-bottom: 0.75rem;\n  border: 1px solid #fde68a;\n  border-radius: 8px;\n  background: #fffbeb;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nselect,\nbutton {\n  font: inherit;\n}\n\ninput,\nselect {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.8rem;\n  margin: 0 0.4rem 0.4rem 0;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.total {\n  font-size: 1.2rem;\n  font-weight: bold;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #1e3a8a;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "inscripciones": [
      {
        "id": 1,
        "tallerId": "ceramica",
        "socia": "Maite"
      },
      {
        "id": 2,
        "tallerId": "ceramica",
        "socia": "Josetxo"
      },
      {
        "id": 3,
        "tallerId": "encuadernacion",
        "socia": "Ane"
      },
      {
        "id": 4,
        "tallerId": "fotografia",
        "socia": "Maite"
      },
      {
        "id": 5,
        "tallerId": "fotografia",
        "socia": "Fermín"
      },
      {
        "id": 6,
        "tallerId": "encuadernacion",
        "socia": "Carmen"
      },
      {
        "id": 7,
        "tallerId": "ceramica",
        "socia": "Ander"
      }
    ]
  },
  "red": {
    "latencia": 300
  },
  "comprobaciones": [
    {
      "descripcion": "Al terminar, Cerámica sale en «Tus inscripciones» con el número que le da el servidor",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Cerámica"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Cerámica · inscripción n.º 8"
      }
    },
    {
      "descripcion": "Si te apuntas a dos talleres seguidos, salen los dos, en el orden en que los pulsaste",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Cerámica"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Encuadernación"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Encuadernación · inscripción n.º 9"
      }
    },
    {
      "descripcion": "Si el servidor falla, sale un aviso de error",
      "pasos": [
        {
          "pulsar": {
            "rol": "heading",
            "nombre": "Talleres de otoño · Casa de Cultura de Tafalla"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Cerámica"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se ha podido hacer la inscripción"
      }
    },
    {
      "descripcion": "Mientras se hace la inscripción, se lee «Apuntando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Cerámica"
          }
        }
      ],
      "espera": {
        "texto": "Apuntando…"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En las firmas, añade al estado un `mensaje` de agradecimiento con el nombre de quien acaba de firmar, y que desaparezca si el siguiente envío falla.
2. En los talleres, desactiva el botón de cada taller en el que ya estás apuntada, y cambia su texto por «Ya estás dentro». ¿De dónde sacas ese dato: de un estado nuevo o del que ya tienes?
3. En la rifa, añade un botón «Devolver la última» que llame a la acción con `{ type: 'devolver' }` y haga un `DELETE /api/papeletas/<id>`. La acción tendrá que distinguir el tipo, como un reducer de la lección 27.
4. Sube la latencia de la rifa a 3 s y compra cinco papeletas seguidas. Cuenta cuánto tarda en salir la primera. Apúntalo: en la lección 60 harás que salga en el acto con `useOptimistic`.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useActionState",
      "descripcion": "La referencia de react.dev de esta lección: la cola, varios tipos de acción, cómo combinarlo con useOptimistic, cancelar con AbortController y los errores típicos.",
      "url": "https://react.dev/reference/react/useActionState",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "<form>: Display a form submission error",
      "descripcion": "El mismo patrón de devolver el error como estado, con una Server Function.",
      "url": "https://react.dev/reference/react-dom/components/form",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "startTransition",
      "descripcion": "La función que envuelve las llamadas a la acción cuando no vienen de un formulario.",
      "url": "https://react.dev/reference/react/startTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useReducer",
      "descripcion": "El Hook al que se parece useActionState, para comparar: reducer puro, sin cola ni efectos.",
      "url": "https://react.dev/reference/react/useReducer",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useFormStatus",
      "descripcion": "La lección 59: el estado del envío leído desde un componente dentro del formulario.",
      "url": "https://react.dev/reference/react-dom/hooks/useFormStatus",
      "etiqueta": "react.dev"
    }
  ]
}
```
