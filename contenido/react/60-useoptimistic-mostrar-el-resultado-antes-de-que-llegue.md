# `useOptimistic`: mostrar el resultado antes de que llegue

- **Módulo:** Formularios y Actions
- **Slug:** `useoptimistic-mostrar-el-resultado-antes-de-que-llegue` (autogenerado del título)
- **Orden:** 600
- **Fuentes:** [useOptimistic](https://react.dev/reference/react/useOptimistic) — ver `contenido/react/TEMARIO.md` #60

---

## Qué es y para qué sirve

En el reto 4 de la lección 58 subiste la latencia de la rifa a 3 segundos y compraste cinco papeletas: ninguna salía en pantalla hasta que el servidor las había numerado todas. En la 59, al menos, el botón decía «Enviando…». Pero hay acciones que casi nunca fallan (un «me gusta», un apoyo, marcar algo como hecho) en las que esperar al servidor para mover un número sobra: la interfaz parece lenta sin motivo.

**`useOptimistic` enseña el resultado en el acto, mientras la acción todavía está en marcha**, y lo cambia por el de verdad cuando termina. Le das el valor real y te devuelve una copia que puedes adelantar:

```jsx
const [valorOptimista, setOptimista] = useOptimistic(valorReal)
```

Mientras no haya ninguna acción en marcha, `valorOptimista` es exactamente `valorReal`. Dentro de una acción, `setOptimista` lo cambia al momento. Y lo importante: **cuando la acción termina, el valor optimista se descarta solo.** Si todo fue bien, para entonces el valor real ya es el nuevo y no se nota nada; si falló, el valor real no ha cambiado y la pantalla vuelve a lo de antes, sin una línea de código para deshacer.

```laboratorio
{
  "tipo": "roles",
  "titulo": "Las tres piezas",
  "roles": [
    {
      "etiqueta": "valorReal",
      "rol": "Lo que ha confirmado el servidor",
      "descripcion": "Un estado o una prop que solo cambias cuando el servidor contesta bien. Es lo que se ve cuando no hay nada en marcha."
    },
    {
      "etiqueta": "valorOptimista",
      "rol": "Lo que se pinta",
      "descripcion": "Igual que valorReal, salvo mientras dura una acción que lo ha adelantado. Úsalo en el JSX en lugar del real."
    },
    {
      "etiqueta": "setOptimista",
      "rol": "Adelanta el resultado",
      "descripcion": "Solo dentro de una acción o de una transición. Su efecto dura lo que dura la acción; después, React lo descarta."
    }
  ]
}
```

## Un «Apoyar» que responde en el acto

Los **presupuestos participativos del barrio de Delicias** dejan a los vecinos apoyar las propuestas que quieren ver hechas. Cada propuesta guarda sus apoyos en la API simulada, que tarda segundo y medio en contestar.

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Apoyar una propuesta sin esperar al servidor",
  "codigo": "import { startTransition, useEffect, useOptimistic, useState } from 'react'\n\nfunction Propuesta({ propuesta, onGuardada }) {\n  const [apoyos, setApoyos] = useOptimistic(propuesta.apoyos)\n  const enviando = apoyos !== propuesta.apoyos\n\n  async function apoyar() {\n    setApoyos((actuales) => actuales + 1)\n    const respuesta = await fetch(`/api/propuestas/${propuesta.id}`, {\n      method: 'PATCH',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ apoyos: propuesta.apoyos + 1 }),\n    })\n    if (!respuesta.ok) return\n    const guardada = await respuesta.json()\n    startTransition(() => {\n      onGuardada(guardada)\n    })\n  }\n\n  return (\n    <li className={enviando ? 'enviando' : undefined}>\n      <h2>{propuesta.titulo}</h2>\n      <p>\n        {apoyos} apoyos{enviando && ' · enviando…'}\n      </p>\n      <form action={apoyar}>\n        <button disabled={enviando}>Apoyar</button>\n      </form>\n    </li>\n  )\n}\n\nexport default function App() {\n  const [propuestas, setPropuestas] = useState(null)\n\n  useEffect(() => {\n    fetch('/api/propuestas')\n      .then((respuesta) => respuesta.json())\n      .then(setPropuestas)\n  }, [])\n\n  function guardar(guardada) {\n    setPropuestas((actuales) => actuales.map((p) => (p.id === guardada.id ? guardada : p)))\n  }\n\n  return (\n    <main>\n      <h1>Presupuestos participativos · Delicias</h1>\n      {propuestas === null ? (\n        <p className=\"nota\">Cargando propuestas…</p>\n      ) : (\n        <ul>\n          {propuestas.map((p) => (\n            <Propuesta key={p.id} propuesta={p} onGuardada={guardar} />\n          ))}\n        </ul>\n      )}\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #4338ca;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.25rem;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #c7d2fe;\n  border-radius: 8px;\n}\n\nli p {\n  margin: 0 0 0.4rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n}\n\n.enviando {\n  opacity: 0.6;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.datos {\n  font-family: ui-monospace, monospace;\n  font-size: 0.9rem;\n  color: #3730a3;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #3730a3;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n",
  "anotaciones": [
    {
      "fragmento": "useOptimistic(propuesta.apoyos)",
      "nota": "El valor real: el que ha confirmado el servidor y le llega del padre. Mientras no haya ninguna acción en marcha, apoyos vale exactamente eso."
    },
    {
      "fragmento": "setApoyos((actuales) => actuales + 1)",
      "nota": "Lo primero de la acción: el número sube en el acto, antes de que salga la petición. Como con useState, le puedes pasar el valor nuevo o una función que lo calcula a partir del actual."
    },
    {
      "fragmento": "const enviando = apoyos !== propuesta.apoyos",
      "nota": "Si el optimista y el real no coinciden, hay un envío sin confirmar. Es la forma más corta de marcar lo pendiente: aquí, con « · enviando…» y la propuesta atenuada."
    },
    {
      "fragmento": "if (!respuesta.ok) return",
      "nota": "Si el servidor falla, no se toca el valor real. Cuando la acción termine, el optimista se descarta y vuelve lo que había. No hay nada que deshacer a mano."
    },
    {
      "fragmento": "startTransition(() => {\n      onGuardada(guardada)\n    })",
      "nota": "El valor real nuevo, dentro de una transición: después de un await ya no estás en la de la acción (lección 51). Así el real cambia justo cuando el optimista se descarta, en el mismo render."
    },
    {
      "fragmento": "<form action={apoyar}>",
      "nota": "React ejecuta la acción de un formulario dentro de una transición (lección 57), que es justo donde hay que llamar a setApoyos."
    },
    {
      "fragmento": "disabled={enviando}",
      "nota": "Un apoyo por vecino: mientras se envía, el botón no se puede volver a pulsar."
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "propuestas": [
      {
        "id": 1,
        "titulo": "Sombra para los columpios del parque Delicias",
        "apoyos": 48
      },
      {
        "id": 2,
        "titulo": "Carril bici en la avenida de Navarra",
        "apoyos": 112
      },
      {
        "id": 3,
        "titulo": "Biblioteca abierta los domingos",
        "apoyos": 75
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Apoya una propuesta: el número sube **en el acto**, con «enviando…» al lado, y segundo y medio después la marca desaparece y el número se queda. Ese segundo y medio es lo que tarda la API, y sin `useOptimistic` es lo que tardaría en moverse el número.

Fíjate en el reparto. **El valor real sigue siendo un estado normal** (`propuestas`, en `App`), que solo cambia con lo que dice el servidor. `useOptimistic` no lo sustituye: pone encima una capa provisional que dura lo que dura la acción.

## Cuándo se descarta el valor optimista

No hay que «limpiar» el valor optimista: React lo tira en cuanto termina la acción que lo puso, y pinta otra vez el valor real. Lo que se vea entonces depende de si el real ha cambiado:

```laboratorio
{
  "tipo": "linea-de-tiempo",
  "titulo": "Un apoyo, de principio a fin",
  "items": [
    {
      "fecha": "Clic",
      "titulo": "setApoyos adelanta el número",
      "texto": "React pinta 49 con «enviando…». El valor real sigue en 48."
    },
    {
      "fecha": "Mientras tanto",
      "titulo": "Se espera al servidor",
      "texto": "La acción no ha terminado, así que se sigue viendo 49. La petición va y viene."
    },
    {
      "fecha": "Si va bien",
      "titulo": "El real alcanza al optimista",
      "texto": "onGuardada pone el real en 49, dentro de una transición. La acción termina, el optimista se descarta y queda el real: 49, ya sin marca. Los dos cambian en el mismo render, así que no se ve ningún salto."
    },
    {
      "fecha": "Si falla",
      "titulo": "El optimista se retira solo",
      "texto": "Nadie toca el real, que sigue en 48. La acción termina, el optimista se descarta y vuelve el 48."
    }
  ]
}
```

Míralo con los dos valores a la vista. Esta versión tiene una sola propuesta, enseña abajo el valor real y el optimista, y avisa si el servidor falla:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Que falle el servidor",
  "consigna": "Pulsa «Apoyar» y mira la última línea: el optimista sube en el acto y el real no se mueve hasta que contesta el servidor. Después pulsa «Fallar la siguiente petición» en el panel de red y vuelve a apoyar: el número sube, llega el error 500 y vuelve solo a donde estaba. Si quieres verlo con calma, sube la latencia a 3 s.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { startTransition, useOptimistic, useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [apoyos, setApoyos] = useState(48)\n  const [apoyosOptimistas, setApoyosOptimistas] = useOptimistic(apoyos)\n  const [error, setError] = useState(null)\n  const enviando = apoyosOptimistas !== apoyos\n\n  async function apoyar() {\n    setError(null)\n    setApoyosOptimistas((actuales) => actuales + 1)\n    const respuesta = await fetch('/api/propuestas/1', {\n      method: 'PATCH',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ apoyos: apoyos + 1 }),\n    })\n    if (!respuesta.ok) {\n      setError('No se ha podido guardar tu apoyo. Inténtalo otra vez.')\n      return\n    }\n    const guardada = await respuesta.json()\n    startTransition(() => {\n      setApoyos(guardada.apoyos)\n    })\n  }\n\n  return (\n    <main>\n      <h1>Presupuestos participativos · Delicias</h1>\n      <h2>Sombra para los columpios del parque Delicias</h2>\n      <p className={enviando ? 'enviando' : undefined}>\n        {apoyosOptimistas} apoyos{enviando && ' · enviando…'}\n      </p>\n      <form action={apoyar}>\n        <button disabled={enviando}>Apoyar</button>\n      </form>\n      {error && <p role=\"alert\">{error}</p>}\n      <p className=\"datos\">\n        Valor real: {apoyos} · valor optimista: {apoyosOptimistas}\n      </p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #4338ca;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.25rem;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #c7d2fe;\n  border-radius: 8px;\n}\n\nli p {\n  margin: 0 0 0.4rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n}\n\n.enviando {\n  opacity: 0.6;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.datos {\n  font-family: ui-monospace, monospace;\n  font-size: 0.9rem;\n  color: #3730a3;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #3730a3;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "propuestas": [
      {
        "id": 1,
        "titulo": "Sombra para los columpios del parque Delicias",
        "apoyos": 48
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

En el fallo, el aviso sale en cuanto llega la respuesta (ese `setError` va después de un `await`, así que ya no es parte de la transición, lección 51) y, un instante después, al terminar la acción, el número vuelve a 48. **Nadie ha escrito `setApoyos(48)`**: el optimista se ha ido porque la acción ha terminado, y el real seguía en 48. Eso es lo que hace que la interfaz optimista sea segura: lo que no confirma el servidor no se queda.

Un detalle del reintento: el `setError(null)` del principio sí está dentro de la acción, así que el aviso viejo no se borra hasta que el reintento termina. Si quieres quitarlo antes, bórralo en el manejador del clic, fuera de la acción.

## Listas: una función que dice cómo aplicar el cambio

Con un número basta con decir el valor nuevo. Con una lista, lo normal es decir **qué ha pasado** («se ha añadido esta propuesta») y dejar que una función calcule la lista provisional. Es el segundo argumento de `useOptimistic`:

```jsx
const [lista, anadirOptimista] = useOptimistic(
  propuestas,                                         // el valor real
  (actuales, nueva) => [...actuales, { ...nueva, enviando: true }],
)

anadirOptimista(nuevaPropuesta)   // dentro de la acción
```

La función recibe la lista actual y lo que le pasas al setter, y devuelve la lista optimista, como el reducer de la lección 27 (react.dev la llama así, *reducer*). Tiene que ser pura. Y tiene una ventaja que se ve poco pero importa: **si el valor real cambia mientras la acción está en marcha** (llega otra propuesta del servidor, por ejemplo), React vuelve a pasar la función por encima de la lista nueva. Lo comprobamos: la propuesta pendiente sigue al final, detrás de la que acaba de llegar.

La bandera `enviando: true` es la otra forma de marcar lo pendiente, una por elemento: la propuesta optimista la lleva y la del servidor no, así que la marca desaparece sola cuando llega la de verdad.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Proponer sin esperar",
  "consigna": "Escribe una propuesta y pulsa «Proponer»: sale al final de la lista, atenuada y con «(enviando…)», y cuando el servidor la guarda se queda sin la marca. Prueba también con «Fallar la siguiente petición»: la propuesta desaparece sola y sale el aviso. ¿Qué pasa con lo que habías escrito en el campo?",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { startTransition, useEffect, useOptimistic, useState } from 'react'\nimport './estilos.css'\n\nfunction Propuestas({ propuestas, onCreada }) {\n  const [lista, anadirOptimista] = useOptimistic(\n    propuestas,\n    (actuales, nueva) => [...actuales, { ...nueva, enviando: true }],\n  )\n  const [error, setError] = useState(null)\n\n  async function proponer(formData) {\n    const nueva = { titulo: formData.get('titulo'), apoyos: 0 }\n    setError(null)\n    anadirOptimista({ ...nueva, id: `temporal-${Date.now()}` })\n    const respuesta = await fetch('/api/propuestas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(nueva),\n    })\n    if (!respuesta.ok) {\n      setError(`No se ha podido publicar «${nueva.titulo}».`)\n      return\n    }\n    const creada = await respuesta.json()\n    startTransition(() => {\n      onCreada(creada)\n    })\n  }\n\n  return (\n    <>\n      <ul>\n        {lista.map((p) => (\n          <li key={p.id} className={p.enviando ? 'enviando' : undefined}>\n            {p.titulo}\n            {p.enviando && ' (enviando…)'}\n          </li>\n        ))}\n      </ul>\n      <form action={proponer}>\n        <label>\n          Tu propuesta <input name=\"titulo\" required />\n        </label>\n        <button>Proponer</button>\n      </form>\n      {error && <p role=\"alert\">{error}</p>}\n    </>\n  )\n}\n\nexport default function App() {\n  const [propuestas, setPropuestas] = useState(null)\n\n  useEffect(() => {\n    fetch('/api/propuestas')\n      .then((respuesta) => respuesta.json())\n      .then(setPropuestas)\n  }, [])\n\n  function anadir(creada) {\n    setPropuestas((actuales) => [...actuales, creada])\n  }\n\n  return (\n    <main>\n      <h1>Presupuestos participativos · Delicias</h1>\n      {propuestas === null ? (\n        <p className=\"nota\">Cargando propuestas…</p>\n      ) : (\n        <Propuestas propuestas={propuestas} onCreada={anadir} />\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #4338ca;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.25rem;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #c7d2fe;\n  border-radius: 8px;\n}\n\nli p {\n  margin: 0 0 0.4rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n}\n\n.enviando {\n  opacity: 0.6;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.datos {\n  font-family: ui-monospace, monospace;\n  font-size: 0.9rem;\n  color: #3730a3;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #3730a3;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "propuestas": [
      {
        "id": 1,
        "titulo": "Sombra para los columpios del parque Delicias",
        "apoyos": 48
      },
      {
        "id": 2,
        "titulo": "Carril bici en la avenida de Navarra",
        "apoyos": 112
      },
      {
        "id": 3,
        "titulo": "Biblioteca abierta los domingos",
        "apoyos": 75
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

Tres detalles de este ejemplo:

- **La `key` provisional.** El `id` lo pone el servidor, pero la propuesta optimista necesita una `key` desde el primer momento: se inventa una (`temporal-…`). Cuando llega la de verdad, con otro `id`, React la trata como un elemento nuevo: quita el provisional y monta el real (lección 26). Aquí no se nota; si cada elemento tuviera estado propio (un menú abierto, un campo a medias), se reiniciaría.
- **El reset del formulario.** Si el servidor falla, el campo se vacía igualmente: la acción no ha lanzado ningún error, así que para React ha terminado bien (lección 57). Conservar lo escrito cuando algo falla es cosa de la lección 61.
- **Los fallos no se lanzan.** Si la acción lanzara un error, iría al error boundary (lección 57) y se llevaría el formulario entero. Para un fallo esperado, sales de la acción, enseñas un aviso y dejas que el optimista se retire.

## Solo dentro de una acción o de una transición

`setOptimista` necesita algo que **sostenga** el valor provisional: una acción en marcha. Vale cualquiera de estas:

- La acción de un `<form action>` o de un `formAction` (lección 57).
- La función de `startTransition`, suelta o la de `useTransition` (lección 51).
- Una prop de acción que tu componente llama dentro de una transición, como la `action` de la lección 59.

Fuera de ahí, no hay nada que esperar, y React lo deshace al momento. Pruébalo:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un setter optimista sin acción",
  "consigna": "Pulsa «Apoyar»: el número no se mueve hasta que contesta el servidor, y la consola enseña un error en rojo. Mira también el número de commit del árbol de renders. Después arréglalo: mete el cuerpo de manejarClic en un startTransition(async () => { … }) y el setApoyos del final en otro startTransition, como en la lección 51.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useOptimistic, useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [apoyos, setApoyos] = useState(48)\n  const [apoyosOptimistas, setApoyosOptimistas] = useOptimistic(apoyos)\n\n  async function manejarClic() {\n    setApoyosOptimistas((actuales) => actuales + 1)\n    const respuesta = await fetch('/api/propuestas/1', {\n      method: 'PATCH',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ apoyos: apoyos + 1 }),\n    })\n    const guardada = await respuesta.json()\n    setApoyos(guardada.apoyos)\n  }\n\n  return (\n    <main>\n      <h1>Presupuestos participativos · Delicias</h1>\n      <p>Sombra para los columpios del parque Delicias: {apoyosOptimistas} apoyos</p>\n      <button onClick={manejarClic}>Apoyar</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #4338ca;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.25rem;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #c7d2fe;\n  border-radius: 8px;\n}\n\nli p {\n  margin: 0 0 0.4rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n}\n\n.enviando {\n  opacity: 0.6;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.datos {\n  font-family: ui-monospace, monospace;\n  font-size: 0.9rem;\n  color: #3730a3;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #3730a3;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarArbol": true,
  "api": {
    "propuestas": [
      {
        "id": 1,
        "titulo": "Sombra para los columpios del parque Delicias",
        "apoyos": 48
      }
    ]
  },
  "red": {
    "latencia": 1500
  }
}
```

El mensaje de la consola es este (react.dev lo escribe con mayúsculas, *Transition* y *Action*; el de React 19.3.1 va en minúsculas):

```text
An optimistic state update occurred outside a transition or action. To fix, move the update to an action, or wrap with startTransition.
```

Es decir: ha habido una actualización optimista fuera de una transición o de una acción; para arreglarlo, lleva la actualización a una acción o envuélvela en `startTransition`. Es un `console.error`: no rompe nada, pero el optimismo desaparece. Lo comprobamos: React **sí pinta el 49**, en un commit, y tres milisegundos después lo quita en el siguiente, porque no hay ninguna acción en marcha que lo sostenga. Por eso, tras el clic, el árbol de renders ya va por el commit 3: uno para poner el 49 y otro para quitarlo. Arreglado, queda así:

```jsx
  function manejarClic() {
    startTransition(async () => {
      setApoyosOptimistas((actuales) => actuales + 1)
      const respuesta = await fetch(/* … */)
      const guardada = await respuesta.json()
      startTransition(() => {
        setApoyos(guardada.apoyos)
      })
    })
  }
```

¿Y si llamas a `setOptimista` **después de un `await`**, dentro de la acción? En la lección 51 viste que un `set` normal ahí ya no es parte de la transición. El optimista es la excepción: si hay una acción en marcha, React le asocia la actualización y no avisa. Lo comprobamos con una acción de formulario: el valor provisional aparece después del `await` y se descarta cuando la acción termina.

## Cuándo lo usarías de verdad

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "Acciones que casi nunca fallan",
      "texto": "Me gusta, apoyos, marcar como leído o hecho, añadir a una lista, guardar en favoritos. El usuario ve el resultado al instante y, en el raro caso de fallo, vuelve solo."
    },
    {
      "titulo": "Cuándo no",
      "texto": "Pagos, reservas con plazas contadas, borrar algo sin vuelta atrás, o cuando el resultado lo decide el servidor (un número de pedido, un precio). Ahí es mejor enseñar que se está enviando (lección 59) y esperar."
    },
    {
      "titulo": "Marca siempre lo pendiente",
      "texto": "Compara optimista y real, o lleva una bandera en cada elemento. Si lo provisional no se distingue de lo confirmado, el fallo pilla al usuario por sorpresa."
    },
    {
      "titulo": "Un «pendiente» para cualquier acción",
      "texto": "useOptimistic(false) y ponerlo a true al empezar la acción: vuelve a false solo cuando la acción termina. Lo comprobamos con un botón que recibe una prop action, el ejemplo que propone react.dev."
    },
    {
      "titulo": "Junto a useActionState",
      "texto": "El valor real puede ser el estado de useActionState (lección 58) y el optimista ir encima. Lo juntarás con useFormStatus en unos comentarios, en el proyecto 62."
    }
  ]
}
```

## Errores típicos

**Calcular el optimista a partir del valor real.** Parece lo mismo que sumar uno, pero no lo es cuando hay varios envíos seguidos:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const [apoyos, setApoyos] = useState(48)\nconst [apoyosOptimistas, setApoyosOptimistas] = useOptimistic(apoyos)\n\nasync function apoyar() {\n  setApoyosOptimistas(apoyos + 1)\n  await guardarApoyo() // tarda 1,5 s\n  startTransition(() => {\n    setApoyos((a) => a + 1)\n  })\n}\n\n<p>{apoyosOptimistas} apoyos</p>\n<form action={apoyar}>\n  <button>Apoyar</button>\n</form>\n\n// Pulsas «Apoyar» tres veces seguidas, muy deprisa.\n// ¿Qué número se ve justo después del tercer clic?",
  "opciones": [
    "51",
    "49",
    "48",
    "50"
  ],
  "correcta": 1,
  "explicacion": "Lo comprobamos en la vista previa: 49 tras cada clic, y 51 de golpe cuando terminan las tres acciones. Mientras hay acciones en marcha, el real sigue en 48, y las tres dicen «el optimista es 48 + 1». Con una función, setApoyosOptimistas((a) => a + 1), cada clic suma sobre el anterior: 49, 50, 51 (también comprobado). Calcula el optimista desde el optimista, no desde el real."
}
```

**Olvidar el valor real.** Si la acción no actualiza el valor real cuando el servidor contesta bien, el optimista se descarta al terminar y el número vuelve atrás, como si hubiera fallado. Y el servidor sí lo ha guardado: al recargar, aparece. `useOptimistic` no guarda nada; solo adelanta lo que el valor real tiene que acabar diciendo.

**Actualizar el valor real fuera de la transición.** Si después del `await` llamas a `setApoyos(guardada.apoyos)` sin `startTransition`, el real cambia antes de que termine la acción, y React vuelve a aplicar encima la función del optimista. Lo comprobamos: el contador pasa un instante por 50 (el real, 49, más el +1 pendiente) y luego se queda en 49. Con `startTransition`, real y optimista cambian en el mismo render.

**Llamar al setter mientras se renderiza.** Escrito en el cuerpo del componente, React lo corta con un error, además del aviso de antes:

```text
Cannot update optimistic state while rendering.
```

Es decir: no se puede actualizar el estado optimista durante el render. Va dentro de una acción, nunca suelto en el componente.

**Lanzar el error para «deshacer».** El optimista se retira solo; no hace falta lanzar nada para que vuelva el valor de antes. Y en una acción de formulario, lanzar se lleva el formulario al error boundary (lección 57).

## Ejercicios

### Ejercicio 1: excursiones del Hogar del Jubilado

El Hogar del Jubilado de Alcañiz organiza excursiones, y los socios se apuntan desde la web. Ahora mismo, al pulsar «Apuntarme», no pasa nada hasta que el servidor contesta: muchos socios pulsan dos veces pensando que no ha funcionado.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 1: apuntarse sin esperar",
  "consigna": "Sigue los pasos 1 a 3 de Excursion.jsx. El texto tiene que quedar «… · 24 apuntados de 30 · enviando…» mientras se envía. Si quieres, desactiva también el botón mientras tanto. No toques App.jsx. Prueba el fallo con «Fallar la siguiente petición» y, cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "Excursion.jsx",
      "codigo": "import { startTransition, useState } from 'react'\n\nexport default function Excursion({ excursion, onGuardada }) {\n  // 1. Con useOptimistic, que el número de apuntados suba en el acto.\n  // 2. Mientras no esté confirmado, añade « · enviando…» detrás del número.\n  // 3. Si el servidor falla, enseña «No se ha podido apuntarte. Inténtalo\n  //    otra vez.» en un párrafo con role=\"alert\". El número tiene que\n  //    volver solo a lo que había.\n  async function apuntarme() {\n    const respuesta = await fetch(`/api/excursiones/${excursion.id}`, {\n      method: 'PATCH',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ apuntados: excursion.apuntados + 1 }),\n    })\n    if (!respuesta.ok) return\n    const guardada = await respuesta.json()\n    startTransition(() => {\n      onGuardada(guardada)\n    })\n  }\n\n  return (\n    <li>\n      <h2>{excursion.destino}</h2>\n      <p>\n        {excursion.fecha} · {excursion.apuntados} apuntados de {excursion.plazas}\n      </p>\n      <form action={apuntarme}>\n        <button>Apuntarme a {excursion.destino}</button>\n      </form>\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport Excursion from './Excursion'\nimport './estilos.css'\n\nexport default function App() {\n  const [excursiones, setExcursiones] = useState(null)\n  const [ultimo, setUltimo] = useState(null)\n\n  useEffect(() => {\n    fetch('/api/excursiones')\n      .then((respuesta) => respuesta.json())\n      .then(setExcursiones)\n  }, [])\n\n  function guardar(guardada) {\n    setExcursiones((actuales) => actuales.map((e) => (e.id === guardada.id ? guardada : e)))\n    setUltimo(`Guardado: ${guardada.apuntados} apuntados a ${guardada.destino}.`)\n  }\n\n  return (\n    <main>\n      <h1>Excursiones del Hogar del Jubilado de Alcañiz</h1>\n      <p role=\"status\">{ultimo}</p>\n      {excursiones === null ? (\n        <p className=\"nota\">Cargando excursiones…</p>\n      ) : (\n        <ul>\n          {excursiones.map((e) => (\n            <Excursion key={e.id} excursion={e} onGuardada={guardar} />\n          ))}\n        </ul>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #be123c;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.25rem;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #fecdd3;\n  border-radius: 8px;\n}\n\nli p {\n  margin: 0 0 0.4rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n}\n\n.enviando {\n  opacity: 0.6;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.datos {\n  font-family: ui-monospace, monospace;\n  font-size: 0.9rem;\n  color: #9f1239;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #9f1239;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "Excursion.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "excursiones": [
      {
        "id": 1,
        "destino": "Albarracín",
        "fecha": "sábado 15 de noviembre",
        "plazas": 30,
        "apuntados": 23
      },
      {
        "id": 2,
        "destino": "Monasterio de Piedra",
        "fecha": "jueves 27 de noviembre",
        "plazas": 50,
        "apuntados": 41
      },
      {
        "id": 3,
        "destino": "Belchite",
        "fecha": "martes 2 de diciembre",
        "plazas": 25,
        "apuntados": 9
      }
    ]
  },
  "red": {
    "latencia": 800
  },
  "comprobaciones": [
    {
      "descripcion": "Cuando el servidor contesta, Albarracín se queda en 24 apuntados",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Albarracín"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Guardado: 24 apuntados a Albarracín"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "24 apuntados de 30"
      }
    },
    {
      "descripcion": "Cuando el servidor contesta, desaparece «enviando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Albarracín"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Guardado: 24 apuntados a Albarracín"
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "enviando…"
        }
      }
    },
    {
      "descripcion": "Si el servidor falla, sale el aviso «No se ha podido apuntarte…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Albarracín"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Albarracín"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se ha podido apuntarte"
      }
    },
    {
      "descripcion": "Si el servidor falla, el número vuelve solo a 23",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Albarracín"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Albarracín"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "23 apuntados de 30"
      }
    },
    {
      "descripcion": "Después de un fallo puedes volver a apuntarte, y el aviso desaparece",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "Albarracín"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Albarracín"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Albarracín"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Guardado: 24 apuntados a Albarracín"
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
      "descripcion": "Al pulsar «Apuntarme a Albarracín», el número sube a 24 en el acto, marcado con «enviando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme a Albarracín"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "24 apuntados de 30 · enviando…"
      }
    }
  ]
}
```

### Ejercicio 2: la asistencia que vuelve atrás

La Banda Municipal de Tudela pide a sus músicos que confirmen si van a cada ensayo. Alguien ya ha montado `useOptimistic` en `Ensayo.jsx`, pero no funciona: al pulsar «Iré el martes» no cambia nada hasta que contesta el servidor, la consola enseña un error en rojo y, cuando por fin contesta, sigue diciendo «Sin confirmar». Hay dos fallos.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Ejercicio 2: dos fallos en Ensayo.jsx",
  "consigna": "Pulsa «Iré el martes» y lee la consola. Arregla Ensayo.jsx para que la asistencia cambie en el acto, con «enviando…», y se quede cuando el servidor contesta. Si el servidor falla, tiene que volver sola a «Sin confirmar». No toques App.jsx. Cuando creas que está, pulsa «Comprobar».",
  "archivos": [
    {
      "nombre": "Ensayo.jsx",
      "codigo": "import { useOptimistic, useState } from 'react'\n\nexport default function Ensayo({ ensayo, onGuardado }) {\n  const [asiste, setAsiste] = useOptimistic(ensayo.asiste)\n  const [error, setError] = useState(null)\n  const enviando = asiste !== ensayo.asiste\n\n  async function cambiarAsistencia() {\n    setError(null)\n    setAsiste(!ensayo.asiste)\n    const respuesta = await fetch(`/api/ensayos/${ensayo.id}`, {\n      method: 'PATCH',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ asiste: !ensayo.asiste }),\n    })\n    if (!respuesta.ok) {\n      setError('No se ha podido guardar. Inténtalo otra vez.')\n      return\n    }\n    // El servidor ya lo ha guardado.\n  }\n\n  return (\n    <li className={enviando ? 'enviando' : undefined}>\n      <h2>\n        Ensayo del {ensayo.dia}, {ensayo.hora}\n      </h2>\n      <p>\n        {ensayo.dia}: {asiste ? 'Vas' : 'Sin confirmar'}\n        {enviando && ' · enviando…'}\n      </p>\n      <button onClick={cambiarAsistencia} disabled={enviando}>\n        {asiste ? `No podré ir el ${ensayo.dia}` : `Iré el ${ensayo.dia}`}\n      </button>\n      {error && <p role=\"alert\">{error}</p>}\n    </li>\n  )\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport Ensayo from './Ensayo'\nimport './estilos.css'\n\nexport default function App() {\n  const [ensayos, setEnsayos] = useState(null)\n  const [ultimo, setUltimo] = useState(null)\n\n  useEffect(() => {\n    fetch('/api/ensayos')\n      .then((respuesta) => respuesta.json())\n      .then(setEnsayos)\n  }, [])\n\n  function guardar(guardado) {\n    setEnsayos((actuales) => actuales.map((e) => (e.id === guardado.id ? guardado : e)))\n    setUltimo(`Guardado: el ${guardado.dia}, ${guardado.asiste ? 'vas' : 'no vas'}.`)\n  }\n\n  return (\n    <main>\n      <h1>Banda Municipal de Tudela · Ensayos</h1>\n      <p role=\"status\">{ultimo}</p>\n      {ensayos === null ? (\n        <p className=\"nota\">Cargando ensayos…</p>\n      ) : (\n        <ul>\n          {ensayos.map((e) => (\n            <Ensayo key={e.id} ensayo={e} onGuardado={guardar} />\n          ))}\n        </ul>\n      )}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 38rem;\n}\n\nh1 {\n  font-size: 1.4rem;\n  color: #0e7490;\n}\n\nh2 {\n  font-size: 1.05rem;\n  margin: 0 0 0.25rem;\n}\n\nul {\n  display: grid;\n  gap: 0.5rem;\n  padding: 0;\n  list-style: none;\n}\n\nli {\n  padding: 0.5rem 0.75rem;\n  border: 1px solid #a5f3fc;\n  border-radius: 8px;\n}\n\nli p {\n  margin: 0 0 0.4rem;\n}\n\nform {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n  align-items: center;\n}\n\nlabel {\n  display: flex;\n  gap: 0.5rem;\n  align-items: center;\n}\n\ninput,\nbutton {\n  font: inherit;\n}\n\ninput {\n  padding: 0.25rem 0.4rem;\n}\n\nbutton {\n  padding: 0.3rem 0.8rem;\n}\n\n.enviando {\n  opacity: 0.6;\n}\n\n.nota {\n  color: #57534e;\n  font-style: italic;\n}\n\n.datos {\n  font-family: ui-monospace, monospace;\n  font-size: 0.9rem;\n  color: #155e75;\n}\n\n[role='status'] {\n  min-height: 1.5em;\n  color: #155e75;\n}\n\n[role='alert'] {\n  padding: 0.5rem 1rem;\n  border-radius: 8px;\n  background: #fef2f2;\n  color: #991b1b;\n}\n"
    }
  ],
  "archivoInicial": "Ensayo.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "api": {
    "ensayos": [
      {
        "id": 1,
        "dia": "martes",
        "hora": "20:00",
        "asiste": false
      },
      {
        "id": 2,
        "dia": "jueves",
        "hora": "20:00",
        "asiste": true
      },
      {
        "id": 3,
        "dia": "sábado",
        "hora": "11:00",
        "asiste": false
      }
    ]
  },
  "red": {
    "latencia": 800
  },
  "comprobaciones": [
    {
      "descripcion": "Cuando el servidor contesta, el martes se queda en «Vas»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iré el martes"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Guardado: el martes, vas."
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "martes: Vas"
      }
    },
    {
      "descripcion": "Cuando el servidor contesta, desaparece «enviando…»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iré el martes"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Guardado: el martes, vas."
          }
        }
      ],
      "espera": {
        "ausente": {
          "rol": "listitem",
          "texto": "enviando…"
        }
      }
    },
    {
      "descripcion": "Puedes cambiar de idea: «No podré ir el martes» lo deja otra vez en «Sin confirmar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iré el martes"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Guardado: el martes, vas."
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "No podré ir el martes"
          }
        },
        {
          "pulsar": {
            "rol": "status",
            "texto": "Guardado: el martes, no vas."
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "martes: Sin confirmar"
      }
    },
    {
      "descripcion": "Si el servidor falla, sale el aviso y el martes vuelve a «Sin confirmar»",
      "pasos": [
        {
          "pulsar": {
            "rol": "listitem",
            "texto": "martes"
          }
        },
        {
          "red": "fallar-siguiente"
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iré el martes"
          }
        },
        {
          "pulsar": {
            "rol": "alert"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "martes: Sin confirmar"
      }
    },
    {
      "descripcion": "Al pulsar «Iré el martes», se lee «Vas · enviando…» en el acto",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Iré el martes"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "martes: Vas · enviando…"
      }
    }
  ]
}
```

**Retos para seguir practicando** (sin comprobación automática):

1. En el ejercicio 1, añade un botón «Borrarme» que reste uno en el acto. ¿Puedes usar el mismo `useOptimistic` para las dos cosas? Prueba con una función como segundo argumento que reciba `+1` o `-1`.
2. En las propuestas de Delicias, añade junto a cada una un botón «Ya no la apoyo» y desactívalo mientras no esté confirmado el apoyo. Haz que las dos acciones marquen lo pendiente igual.
3. En la lista de propuestas, envía tres seguidas y haz que falle la segunda con «Fallar la siguiente petición». ¿Cuándo desaparece la que ha fallado: en cuanto llega su error o cuando terminan las tres? Compruébalo en la vista previa antes de dar nada por hecho.
4. Vuelve a la rifa del AMPA de la lección 58 (reto 4) y enseña cada papeleta en el acto, como «…», con `useOptimistic` encima del estado de `useActionState`. Pista: la acción del formulario puede ser una función tuya que primero llame al setter optimista y después a la acción de `useActionState`. Es un adelanto del proyecto 62.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "useOptimistic",
      "descripcion": "La referencia de react.dev de esta lección: cómo fluye el valor optimista, listas con reducer, varios tipos de cambio, borrar con recuperación y los dos errores de la consola.",
      "url": "https://react.dev/reference/react/useOptimistic",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "React v19: New hook useOptimistic",
      "descripcion": "El anuncio de React 19, con el ejemplo de cambiar un nombre de forma optimista dentro de una acción de formulario.",
      "url": "https://react.dev/blog/2024/12/05/react-19#new-hook-optimistic-updates",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useTransition",
      "descripcion": "Las acciones y las props de acción, el contexto en el que vive useOptimistic. react.dev explica aquí por qué un set después de un await necesita su propio startTransition.",
      "url": "https://react.dev/reference/react/useTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "startTransition",
      "descripcion": "La forma de abrir una transición desde un manejador de clic, sin formulario.",
      "url": "https://react.dev/reference/react/startTransition",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "useActionState",
      "descripcion": "La lección 58. Su página de react.dev enseña también cómo combinarlo con useOptimistic.",
      "url": "https://react.dev/reference/react/useActionState",
      "etiqueta": "react.dev"
    }
  ]
}
```
