# Quitar dependencias de un efecto

- **Módulo:** Efectos
- **Slug:** `quitar-dependencias-de-un-efecto` (autogenerado del título)
- **Orden:** 420
- **Fuentes:** [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies) + [exhaustive-deps](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps) — ver `contenido/react/TEMARIO.md` #42

---

## Qué es y para qué sirve

En la lección 40 viste que **un efecto tiene que declarar todos los valores reactivos que lee**: props, estado y cualquier cosa calculada en el cuerpo del componente. Si cambia alguno, React deshace el efecto y lo vuelve a hacer. Es lo que lo mantiene sincronizado.

El problema llega cuando la lista resultante no te gusta. El efecto que se conecta al seguimiento de un barco se desconecta y se vuelve a conectar **con cada letra que escribes** en otro campo. El que manda un formulario lo manda otra vez al corregir una errata. El intervalo de un taxímetro se destruye y se crea en cada tic. Y a veces el efecto entra en bucle y la consola se llena de errores.

La tentación es quitar ese valor del array, o callar al linter con un comentario. Esta lección va de por qué eso es mentirle a React, y de lo que se hace en su lugar: **cambiar el código para que el efecto deje de necesitar ese valor**. Entonces el linter es el primero en darte la razón.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Lo que necesitas de las lecciones anteriores",
  "contenido": "Cómo se escribe un efecto con su limpieza (lección 38), qué es un valor reactivo y por qué cada cambio vuelve a sincronizar el efecto (lección 40) y para qué sirve useEffectEvent (lección 41). Los ejemplos en vivo llevan debajo el registro de efectos: una línea por cada vez que React ejecuta o limpia un efecto, con la dependencia que cambió."
}
```

## Las dependencias no se eligen: se demuestran

El club náutico retransmite la regata de la ría con un seguimiento por GPS. Este componente se conecta al barco que le pasan por props y va guardando sus posiciones. Imagina que escribes `[]` porque solo quieres conectarte «una vez». El linter de React (la regla `exhaustive-deps` de `eslint-plugin-react-hooks` 7.1.1) protesta en la línea del array:

```text
React Hook useEffect has a missing dependency: 'barco'. Either include it or remove the dependency array
```

Es decir: el efecto lee `barco` y no lo has declarado; o lo añades, o quitas el array entero. Y tiene razón. `barco` es una prop: puede cambiar en el siguiente render, y con `[]` el efecto seguiría conectado al barco viejo para siempre. **No puedes elegir qué dependencias tiene un efecto: las decide el código que hay dentro.** La lista no es una configuración, es una descripción.

Lo que sí puedes hacer es **demostrar** que algo no es una dependencia. En este código hay tres valores que el efecto usa y solo uno va en el array:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useEffect, useState } from 'react'\nimport { crearConexion } from './seguimiento'\n\nconst SERVIDOR = 'gps.regata.example'\n\nfunction Seguimiento({ barco }) {\n  const [posiciones, setPosiciones] = useState([])\n\n  useEffect(() => {\n    const conexion = crearConexion({ servidor: SERVIDOR, barco })\n    conexion.alRecibir((posicion) => {\n      setPosiciones((anteriores) => [...anteriores, posicion])\n    })\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [barco])\n\n  return <p>{posiciones.length} posiciones de {barco}</p>\n}",
  "anotaciones": [
    {
      "fragmento": "const SERVIDOR = 'gps.regata.example'",
      "nota": "Declarado fuera del componente: no puede cambiar de un render a otro, así que no es reactivo. Si lo pones en el array, el linter se queja de que sobra."
    },
    {
      "fragmento": "function Seguimiento({ barco })",
      "nota": "barco es una prop: puede llegar distinta en cualquier render. Es reactiva, y como el efecto la lee, tiene que estar en el array."
    },
    {
      "fragmento": "setPosiciones((anteriores) => [...anteriores, posicion])",
      "nota": "Las funciones set de useState son estables: React te da la misma en cada render. El linter lo sabe y no las pide. Igual con dispatch de useReducer y con las refs de useRef."
    },
    {
      "fragmento": "}, [barco])",
      "nota": "La lista que sale del código: un único valor reactivo. Si mañana quieres que cambie, cambia antes el código de arriba."
    }
  ]
}
```

Si añades `SERVIDOR` al array «por si acaso», el linter también avisa, ahora de lo contrario:

```text
React Hook useEffect has an unnecessary dependency: 'SERVIDOR'. Either exclude it or remove the dependency array. Outer scope values like 'SERVIDOR' aren't valid dependencies because mutating them doesn't re-render the component
```

Es decir: sobra una dependencia; los valores de fuera del componente no valen como dependencias, porque cambiarlos no provoca ningún render. Con `setPosiciones` no pasa nada si la pones (es estable y nunca dispara el efecto, como viste con `dispatch` en la lección 27), pero el linter no te la pide.

De ahí sale el método de trabajo, y es siempre el mismo:

1. **Cambia el código** del efecto o de dónde se declaran los valores que usa.
2. **Sigue al linter** y deja el array como dice que debe quedar con ese código.
3. Si la lista no te convence, **vuelve al paso 1**. Nunca al revés: el array no se retoca a mano para que el efecto se ejecute más o menos veces.

El resto de la lección es un recetario de cambios para el paso 1.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Si tu proyecto usa Oxlint, como la plantilla de Vite",
  "contenido": "En la lección 2 elegiste Oxlint, la opción por defecto de Vite. También vigila las dependencias, con su regla react-hooks(exhaustive-deps) y frases parecidas: «React Hook useEffect has a missing dependency: 'barco'». Los mensajes de esta lección son los de eslint-plugin-react-hooks, el plugin oficial de React, que es el que instala Vite si eliges ESLint. En los dos es un aviso, no un error. Para los objetos, Oxlint sugiere useRef o useCallback: prueba antes las recetas de esta lección."
}
```

## Silenciar el linter es mentirle a React

En proyectos con unos años es fácil encontrar esto:

```jsx
useEffect(() => {
  // ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

El comentario apaga el aviso de esa línea y el código parece funcionar. Pero **le estás diciendo a React que el efecto no lee nada reactivo, y no es verdad**. React se lo cree: ejecuta el efecto una vez, con los valores de ese primer render, y nunca vuelve a mirarlo.

El taxímetro de Taxis del Puerto cobra por segundo de espera según la tarifa, y alguien quería que el intervalo se creara «solo al montar». Míralo funcionar:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un taxímetro que se queda clavado",
  "consigna": "Espera unos segundos: ¿sube el importe? Pulsa «Tarifa nocturna» y vuelve a esperar. Mira el registro de efectos: solo hubo montaje. Después borra el comentario eslint-disable y escribe en el array lo que el efecto usa de verdad, centimos y tarifa. Funciona, pero fíjate en lo que pasa en el registro cada segundo.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport default function Taximetro() {\n  const [centimos, setCentimos] = useState(0)\n  const [tarifa, setTarifa] = useState(5)\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setCentimos(centimos + tarifa)\n    }, 1000)\n    return () => clearInterval(id)\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [])\n\n  return (\n    <main>\n      <h1>Taxis del Puerto · Licencia 214</h1>\n      <p className=\"importe\">Importe: {euros.format(centimos / 100)}</p>\n      <p>Tarifa: {tarifa} céntimos por segundo</p>\n      <button onClick={() => setTarifa(5)}>Tarifa diurna</button>\n      <button onClick={() => setTarifa(7)}>Tarifa nocturna</button>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0c4a6e;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n\n.importe {\n  display: inline-block;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #1c1917;\n  color: #4ade80;\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true
}
```

El importe se queda en 0,05 € y de ahí no pasa, con cualquier tarifa. La función del intervalo se creó en el primer render, cuando `centimos` valía 0 y `tarifa` 5, y como el efecto no se repite nunca, esa función vieja sigue llamando a `setCentimos(0 + 5)` cada segundo. Es la instantánea de la lección 18, congelada para siempre. En el registro de efectos solo verás el montaje (y su repetición por `StrictMode`).

Con las dependencias honestas, `[centimos, tarifa]`, el taxímetro cuenta bien, pero el registro enseña el precio: cada segundo, «⟲ limpieza» y «▶ efecto · cambió centimos: 0 → 5», luego «5 → 10»... **El intervalo se destruye y se crea en cada tic.** Funciona, aunque no es lo que querías. Sin el comentario, el linter te habría dado una pista sobre cómo arreglarlo de verdad:

```text
React Hook useEffect has missing dependencies: 'centimos' and 'tarifa'. Either include them or remove the dependency array. You can also do a functional update 'setCentimos(c => ...)' if you only need 'centimos' in the 'setCentimos' call
```

La última frase es la solución, y la verás dentro de dos secciones. La lección de react.dev lo resume así: **trata el aviso de dependencias como si fuera un error de compilación**. Si nunca lo silencias, nunca tendrás fallos como este, que son de los más difíciles de encontrar porque el código parece correcto.

## Primera pregunta: ¿esto tenía que ser un efecto?

Antes de pelearte con el array, pregúntate si el código debería estar en un efecto. La inscripción para la regata se manda cuando `enviada` pasa a `true`, desde un efecto que también lee el nombre del barco para el cuerpo de la petición:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una inscripción que se repite al corregir una errata",
  "consigna": "Pulsa «Inscribir». Después añade « II» al nombre del barco, como si corrigieras una errata. Mira el registro de red y el de efectos: cada letra manda otra inscripción. Arréglalo: haz la petición dentro de manejarEnvio y borra el efecto y el estado enviada, que ya no hacen falta.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nexport default function Inscripcion() {\n  const [barco, setBarco] = useState('Galerna')\n  const [enviada, setEnviada] = useState(false)\n  const [aviso, setAviso] = useState('')\n\n  useEffect(() => {\n    if (!enviada) return\n    fetch('/api/inscripciones', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ barco }),\n    })\n      .then((respuesta) => respuesta.json())\n      .then((nueva) => setAviso(`Inscripción n.º ${nueva.id}: ${nueva.barco}`))\n  }, [enviada, barco])\n\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    setEnviada(true)\n  }\n\n  return (\n    <main>\n      <h1>Regata de la Ría · Inscripciones</h1>\n      <form onSubmit={manejarEnvio}>\n        <label>\n          Nombre del barco\n          <input value={barco} onChange={(e) => setBarco(e.target.value)} />\n        </label>\n        <button>Inscribir</button>\n      </form>\n      <p role=\"status\">{aviso}</p>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0c4a6e;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "inscripciones": [
      {
        "id": 1,
        "barco": "Bonanza"
      }
    ]
  }
}
```

Cada letra añadida es un `POST` nuevo, y el número de inscripción del aviso sube con cada una: 3, 4, 5... El registro de efectos lo explica: «▶ efecto · cambió barco: "Galerna" → "Galerna "». Las dependencias son correctas para ese código; **lo que está mal es el código**. Inscribirse es la respuesta a una interacción concreta, pulsar «Inscribir», y lo que responde a una interacción va en su manejador:

```jsx
async function manejarEnvio(evento) {
  evento.preventDefault()
  const respuesta = await fetch('/api/inscripciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barco }),
  })
  const nueva = await respuesta.json()
  setAviso(`Inscripción n.º ${nueva.id}: ${nueva.barco}`)
}
```

Sin efecto no hay dependencias que quitar. El manejador lee el `barco` del momento en que pulsas, y escribir en el campo no manda nada. La lección 39 está entera dedicada a encontrar efectos que sobran, y la 41 a distinguir lo que es un evento de lo que es una sincronización.

## ¿Hace dos cosas? Divídelo en dos efectos

Ahora un efecto que sí tiene que serlo, porque sincroniza la pantalla con el servidor. La página de amarres libres pide los puertos de la ría elegida y, cuando eliges un puerto, sus amarres. Todo en un mismo efecto:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un efecto que pide de más",
  "consigna": "Pulsa «Cambados» y luego «Vilagarcía». Mira el registro de red: además de los amarres, cada vez vuelve a pedir los puertos de Arousa, que no han cambiado. Prueba a dividir el efecto en dos, uno por cada cosa que sincroniza, y vuelve a mirar el registro.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nexport default function Amarres() {\n  const [ria, setRia] = useState('Arousa')\n  const [puertos, setPuertos] = useState([])\n  const [puerto, setPuerto] = useState(null)\n  const [amarres, setAmarres] = useState([])\n\n  useEffect(() => {\n    const control = new AbortController()\n    fetch(`/api/puertos?q=${ria}`, { signal: control.signal })\n      .then((respuesta) => respuesta.json())\n      .then(setPuertos)\n      .catch(() => {}) // la cancelación también acaba aquí (lección 38)\n    if (puerto) {\n      fetch(`/api/amarres?q=${puerto}`, { signal: control.signal })\n        .then((respuesta) => respuesta.json())\n        .then(setAmarres)\n        .catch(() => {})\n    }\n    return () => control.abort()\n  }, [ria, puerto])\n\n  function manejarRia(nueva) {\n    setRia(nueva)\n    setPuerto(null)\n    setAmarres([])\n  }\n\n  return (\n    <main>\n      <h1>Amarres libres</h1>\n      <p>\n        <button aria-pressed={ria === 'Arousa'} onClick={() => manejarRia('Arousa')}>Ría de Arousa</button>\n        <button aria-pressed={ria === 'Vigo'} onClick={() => manejarRia('Vigo')}>Ría de Vigo</button>\n      </p>\n      <h2>Puertos</h2>\n      <ul>\n        {puertos.map((p) => (\n          <li key={p.id}>\n            <button aria-pressed={puerto === p.nombre} onClick={() => setPuerto(p.nombre)}>\n              {p.nombre}\n            </button>\n          </li>\n        ))}\n      </ul>\n      <h2>{puerto ? `Amarres en ${puerto}` : 'Elige un puerto'}</h2>\n      <ul>\n        {amarres.map((a) => (\n          <li key={a.id}>{a.codigo} · hasta {a.eslora} m de eslora</li>\n        ))}\n      </ul>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0c4a6e;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n"
    }
  ],
  "strictMode": true,
  "mostrarConsola": false,
  "mostrarEfectos": true,
  "api": {
    "puertos": [
      {
        "id": 1,
        "nombre": "Vilagarcía",
        "ria": "Arousa"
      },
      {
        "id": 2,
        "nombre": "Cambados",
        "ria": "Arousa"
      },
      {
        "id": 3,
        "nombre": "Ribeira",
        "ria": "Arousa"
      },
      {
        "id": 4,
        "nombre": "Baiona",
        "ria": "Vigo"
      },
      {
        "id": 5,
        "nombre": "Cangas",
        "ria": "Vigo"
      }
    ],
    "amarres": [
      {
        "id": 1,
        "puerto": "Vilagarcía",
        "codigo": "A-12",
        "eslora": 8
      },
      {
        "id": 2,
        "puerto": "Vilagarcía",
        "codigo": "B-03",
        "eslora": 12
      },
      {
        "id": 3,
        "puerto": "Cambados",
        "codigo": "P1-07",
        "eslora": 10
      },
      {
        "id": 4,
        "puerto": "Ribeira",
        "codigo": "C-21",
        "eslora": 9
      },
      {
        "id": 5,
        "puerto": "Baiona",
        "codigo": "N-02",
        "eslora": 15
      },
      {
        "id": 6,
        "puerto": "Cangas",
        "codigo": "S-14",
        "eslora": 8
      }
    ]
  }
}
```

El array `[ria, puerto]` es correcto para ese código: el efecto lee las dos cosas. El fallo está en que **un solo efecto sincroniza dos cosas que no tienen nada que ver**: la lista de puertos depende de la ría, y la de amarres, del puerto. Al juntarlas, cambiar el puerto rehace también la petición de los puertos. Dos sincronizaciones, dos efectos, cada uno con su lista:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "Dos sincronizaciones, dos efectos",
  "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Amarres() {\n  const [ria, setRia] = useState('Arousa')\n  const [puertos, setPuertos] = useState([])\n  const [puerto, setPuerto] = useState(null)\n  const [amarres, setAmarres] = useState([])\n\n  useEffect(() => {\n    const control = new AbortController()\n    fetch(`/api/puertos?q=${ria}`, { signal: control.signal })\n      .then((respuesta) => respuesta.json())\n      .then(setPuertos)\n      .catch(() => {})\n    return () => control.abort()\n  }, [ria])\n\n  useEffect(() => {\n    if (!puerto) return\n    const control = new AbortController()\n    fetch(`/api/amarres?q=${puerto}`, { signal: control.signal })\n      .then((respuesta) => respuesta.json())\n      .then(setAmarres)\n      .catch(() => {})\n    return () => control.abort()\n  }, [puerto])\n\n  function manejarRia(nueva) {\n    setRia(nueva)\n    setPuerto(null)\n    setAmarres([])\n  }\n\n  return (\n    <main>\n      <h1>Amarres libres</h1>\n      <p>\n        <button aria-pressed={ria === 'Arousa'} onClick={() => manejarRia('Arousa')}>Ría de Arousa</button>\n        <button aria-pressed={ria === 'Vigo'} onClick={() => manejarRia('Vigo')}>Ría de Vigo</button>\n      </p>\n      <h2>Puertos</h2>\n      <ul>\n        {puertos.map((p) => (\n          <li key={p.id}>\n            <button aria-pressed={puerto === p.nombre} onClick={() => setPuerto(p.nombre)}>\n              {p.nombre}\n            </button>\n          </li>\n        ))}\n      </ul>\n      <h2>{puerto ? `Amarres en ${puerto}` : 'Elige un puerto'}</h2>\n      <ul>\n        {amarres.map((a) => (\n          <li key={a.id}>{a.codigo} · hasta {a.eslora} m de eslora</li>\n        ))}\n      </ul>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0c4a6e;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea {\n  font: inherit;\n  margin-left: 0.5rem;\n}",
  "anotaciones": [
    {
      "fragmento": "}, [ria])",
      "nota": "El primer efecto solo lee ria, así que solo se repite al cambiar de ría. Elegir un puerto ya no lo toca."
    },
    {
      "fragmento": "if (!puerto) return",
      "nota": "Sin puerto elegido no hay nada que sincronizar. Este efecto no devuelve limpieza en ese caso, y por eso el registro solo enseña una limpieza al montar con StrictMode: la del otro efecto."
    },
    {
      "fragmento": "}, [puerto])",
      "nota": "El segundo, solo puerto. Pulsa Cambados y mira el registro: «▶ efecto · cambió puerto: null → \"Cambados\"», y en la red, una única petición de amarres."
    },
    {
      "fragmento": "setAmarres([])",
      "nota": "Vaciar los amarres al cambiar de ría se hace en el manejador, que es donde ocurre el cambio, no en otro efecto."
    }
  ],
  "strictMode": true,
  "mostrarEfectos": true,
  "api": {
    "puertos": [
      {
        "id": 1,
        "nombre": "Vilagarcía",
        "ria": "Arousa"
      },
      {
        "id": 2,
        "nombre": "Cambados",
        "ria": "Arousa"
      },
      {
        "id": 3,
        "nombre": "Ribeira",
        "ria": "Arousa"
      },
      {
        "id": 4,
        "nombre": "Baiona",
        "ria": "Vigo"
      },
      {
        "id": 5,
        "nombre": "Cangas",
        "ria": "Vigo"
      }
    ],
    "amarres": [
      {
        "id": 1,
        "puerto": "Vilagarcía",
        "codigo": "A-12",
        "eslora": 8
      },
      {
        "id": 2,
        "puerto": "Vilagarcía",
        "codigo": "B-03",
        "eslora": 12
      },
      {
        "id": 3,
        "puerto": "Cambados",
        "codigo": "P1-07",
        "eslora": 10
      },
      {
        "id": 4,
        "puerto": "Ribeira",
        "codigo": "C-21",
        "eslora": 9
      },
      {
        "id": 5,
        "puerto": "Baiona",
        "codigo": "N-02",
        "eslora": 15
      },
      {
        "id": 6,
        "puerto": "Cangas",
        "codigo": "S-14",
        "eslora": 8
      }
    ]
  }
}
```

El código es más largo que el original, y está bien así: **cada efecto representa un proceso de sincronización independiente**. La prueba es que podrías borrar uno sin romper el otro. Si te molesta la repetición de los dos `fetch`, la solución no es volver a juntarlos, sino sacar la lógica común a un Hook propio, `useDatos(url)`, que es justo lo que harás en la lección 43.

## ¿Lees el estado solo para calcular el siguiente? Pásale una función a `set`

Vuelve al taxímetro con las dependencias honestas. El efecto lee `centimos` para una sola cosa: calcular el importe siguiente. Para eso no hace falta leerlo. Desde la lección 19 sabes pasarle a `set` una función actualizadora, y React le da el valor más reciente cuando la aplica:

```laboratorio
{
  "tipo": "react-anotado",
  "titulo": "El taxímetro con un actualizador",
  "codigo": "import { useEffect, useState } from 'react'\nimport './estilos.css'\n\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\n\nexport default function Taximetro() {\n  const [centimos, setCentimos] = useState(0)\n  const [tarifa, setTarifa] = useState(5)\n\n  useEffect(() => {\n    const id = setInterval(() => {\n      setCentimos((c) => c + tarifa)\n    }, 1000)\n    return () => clearInterval(id)\n  }, [tarifa])\n\n  return (\n    <main>\n      <h1>Taxis del Puerto · Licencia 214</h1>\n      <p className=\"importe\">Importe: {euros.format(centimos / 100)}</p>\n      <p>Tarifa: {tarifa} céntimos por segundo</p>\n      <button onClick={() => setTarifa(5)}>Tarifa diurna</button>\n      <button onClick={() => setTarifa(7)}>Tarifa nocturna</button>\n    </main>\n  )\n}",
  "css": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0c4a6e;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n\n.importe {\n  display: inline-block;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #1c1917;\n  color: #4ade80;\n  font-size: 1.5rem;\n  font-variant-numeric: tabular-nums;\n}",
  "anotaciones": [
    {
      "fragmento": "setCentimos((c) => c + tarifa)",
      "nota": "Una instrucción en vez de un valor: «súmale la tarifa a lo que haya». React la pone en la cola y la aplica con el valor más reciente. El efecto ya no lee centimos."
    },
    {
      "fragmento": "}, [tarifa])",
      "nota": "El linter queda conforme con una sola dependencia. El intervalo se crea al montar y solo se rehace al cambiar de tarifa: en el registro, «cambió tarifa: 5 → 7» y nada más."
    },
    {
      "fragmento": "const [centimos, setCentimos] = useState(0)",
      "nota": "centimos cambia cada segundo y el componente se renderiza cada segundo, pero ya no es una dependencia. Mira el registro mientras cuenta: ninguna línea nueva."
    }
  ],
  "strictMode": true,
  "mostrarEfectos": true
}
```

Es el mismo arreglo que pedía el aviso: «You can also do a functional update 'setCentimos(c => ...)'». Y sirve para cualquier efecto que reciba datos de fuera y los acumule: si el seguimiento de la regata guardara cada posición con `setPosiciones([...posiciones, nueva])`, dependería de `posiciones` y se reconectaría con cada posición que llega. Con `setPosiciones((anteriores) => [...anteriores, nueva])`, como en el primer bloque de la lección, no.

## ¿Quieres leer un valor sin reaccionar a él? `useEffectEvent`

Al taxímetro le queda un detalle: al cambiar de tarifa, el intervalo se rehace y el segundo que estaba en marcha se pierde. Si decides que la tarifa no es motivo para reiniciar nada, que el siguiente tic solo tiene que **leer** la tarifa del momento, esa parte del código no es reactiva. Esa parte se separa con `useEffectEvent`, de la lección 41:

```jsx
const alPasarUnSegundo = useEffectEvent(() => {
  setCentimos((c) => c + tarifa)
})

useEffect(() => {
  const id = setInterval(() => alPasarUnSegundo(), 1000)
  return () => clearInterval(id)
}, [])
```

El linter no pide `alPasarUnSegundo` como dependencia: sabe que es un Effect Event. Y si la pones por costumbre, avisa:

```text
Functions returned from `useEffectEvent` must not be included in the dependency array. Remove `alPasarUnSegundo` from the list
```

Es decir: las funciones que devuelve `useEffectEvent` no van en el array; quítala. Con este cambio el registro no enseña ninguna línea al pulsar «Tarifa nocturna», y el importe sube de 7 en 7 desde el siguiente segundo.

Lo mismo vale para una función que llega por props, como un `onLlegada` que el padre crea en cada render: en el array, el efecto se repetiría con cada render del padre; dentro de un Effect Event, se lee la última versión sin reaccionar a ella. Lo harás en el ejercicio del final.

## Objetos y funciones: dependencias que cambian sin que cambie nada

Este es el caso más traicionero, porque el array está completo y el código parece impecable. El seguimiento de la regata agrupa sus opciones en un objeto antes de conectarse:

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Un objeto nuevo en cada render",
  "consigna": "Escribe algo en «Notas del comentarista» y mira el registro de efectos y la consola: cada letra desconecta y vuelve a conectar. Arréglalo moviendo la línea de opciones dentro del efecto, y deja como dependencias lo que pida el código. Vuelve a escribir, y luego pulsa «Seguir a Marejada».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useEffect, useState } from 'react'\nimport { crearConexion } from './seguimiento'\nimport './estilos.css'\n\nconst SERVIDOR = 'gps.regata.example'\n\nfunction Seguimiento({ barco }) {\n  const [notas, setNotas] = useState('')\n\n  const opciones = { servidor: SERVIDOR, barco }\n\n  useEffect(() => {\n    const conexion = crearConexion(opciones)\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [opciones])\n\n  return (\n    <section>\n      <h2>Siguiendo a {barco}</h2>\n      <label>\n        Notas del comentarista\n        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} />\n      </label>\n    </section>\n  )\n}\n\nexport default function Retransmision() {\n  const [barco, setBarco] = useState('Galerna')\n\n  return (\n    <main>\n      <h1>Regata en directo</h1>\n      <button onClick={() => setBarco('Galerna')}>Seguir a Galerna</button>\n      <button onClick={() => setBarco('Marejada')}>Seguir a Marejada</button>\n      <Seguimiento barco={barco} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "seguimiento.jsx",
      "codigo": "// Un sistema externo de mentira. En una app real sería un WebSocket\n// o el SDK del proveedor del seguimiento por GPS.\nexport function crearConexion({ servidor, barco }) {\n  return {\n    conectar() {\n      console.log(`Conectando con ${barco} en ${servidor}…`)\n    },\n    desconectar() {\n      console.log(`Desconectado de ${barco}`)\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0c4a6e;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true
}
```

Con cada letra, el registro escribe dos líneas:

```text
Seguimiento ⟲ limpieza
Seguimiento ▶ efecto · cambió opciones: {"servidor":"gps.regata.example","barco":"Galerna"} → {"servidor":"gps.regata.example","barco":"Galerna"}
```

Lo de antes y lo de después es idéntico, carácter a carácter, y aun así «cambió». Escribir en las notas cambia el estado, el componente se vuelve a ejecutar desde el principio y la línea `const opciones = { ... }` **crea un objeto nuevo**. React compara cada dependencia con la del render anterior usando `Object.is`, y para JavaScript dos objetos creados por separado son distintos aunque tengan dentro lo mismo:

```js
Object.is({ barco: 'Galerna' }, { barco: 'Galerna' }) // false
Object.is('Galerna', 'Galerna')                      // true
```

**Solo les pasa a los objetos, los arrays y las funciones**: los textos y los números se comparan por su valor. Por eso las dependencias de objeto o de función hacen que un efecto se repita más de lo que necesitas, y lo mejor es evitarlas. El linter, eso sí, avisa en la línea del objeto:

```text
The 'opciones' object makes the dependencies of useEffect Hook (at line 16) change on every render. Move it inside the useEffect callback. Alternatively, wrap the initialization of 'opciones' in its own useMemo() Hook
```

Es decir: el objeto `opciones` hace que las dependencias del efecto de la línea 16 cambien en cada render; mételo dentro del efecto o, si no, envuélvelo en `useMemo`. Fíjate en el orden de las propuestas. `useMemo` y `useCallback` existen (lección 67), pero aquí son el último recurso: añaden código para tapar un problema que se resuelve moviendo una línea. Hay tres arreglos, según de qué dependa el objeto.

**Si no depende de nada reactivo, sácalo del componente.** Un objeto con valores fijos se declara fuera, como `SERVIDOR`. Ya no es reactivo, no va en el array y no puede cambiar entre renders.

**Si depende de props o estado, mételo dentro del efecto.** Es el arreglo que pedía la consigna:

```jsx
useEffect(() => {
  const opciones = { servidor: SERVIDOR, barco }
  const conexion = crearConexion(opciones)
  conexion.conectar()
  return () => conexion.desconectar()
}, [barco])
```

Ahora el único valor reactivo que lee el efecto es `barco`, un texto. Escribir en las notas ya no escribe nada en el registro, y al pulsar «Seguir a Marejada» sale lo que tiene que salir: «▶ efecto · cambió barco: "Galerna" → "Marejada"».

**Con una función, lo mismo.** Imagina que en el bloque de arriba el objeto se fabrica con una función declarada en el componente:

```jsx
function crearOpciones() {
  return { servidor: SERVIDOR, barco }
}

useEffect(() => {
  const conexion = crearConexion(crearOpciones())
  conexion.conectar()
  return () => conexion.desconectar()
}, [crearOpciones])
```

La función también se crea nueva en cada render, y el linter lo dice con las mismas palabras (en ese archivo, el array queda en la línea 18):

```text
The 'crearOpciones' function makes the dependencies of useEffect Hook (at line 18) change on every render. Move it inside the useEffect callback. Alternatively, wrap the definition of 'crearOpciones' in its own useCallback() Hook
```

Si no usa props ni estado, sácala del componente; si los usa, declárala dentro del efecto. Una función declarada dentro del efecto no es un valor reactivo del componente, así que no va en el array: lo que va son las props o el estado que lea, aquí `barco`.

## Objetos y funciones que llegan por props

A veces el objeto no lo creas tú: llega del padre, que lo escribe en el JSX al renderizar. Predice cuántas veces se reconecta el hijo:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "function Seguimiento({ opciones }) {\n  useEffect(() => {\n    console.log(`Conectando con ${opciones.barco}`)\n    return () => console.log(`Desconectando de ${opciones.barco}`)\n  }, [opciones])\n\n  return <p>Siguiendo a {opciones.barco}</p>\n}\n\nexport default function Retransmision() {\n  const [aplausos, setAplausos] = useState(0)\n\n  return (\n    <main>\n      <button onClick={() => setAplausos(aplausos + 1)}>\n        Aplaudir ({aplausos})\n      </button>\n      <Seguimiento opciones={{ barco: 'Galerna' }} />\n    </main>\n  )\n}\n\n// Sin contar el montaje, ¿cuántas veces se vuelve a conectar\n// Seguimiento si pulsas «Aplaudir» tres veces?",
  "opciones": [
    "Ninguna: el barco sigue siendo Galerna",
    "Tres: una por cada aplauso",
    "Una, la primera vez",
    "Seis: dos por aplauso por StrictMode"
  ],
  "correcta": 1,
  "explicacion": "Cada aplauso renderiza Retransmision, y el objeto escrito en el JSX se crea de nuevo, con el mismo barco dentro. Para el efecto, opciones ha cambiado. Comprobado en React 19.3 sin StrictMode: tres «cambió opciones» en el registro y cuatro «Conectando» en la consola, el del montaje incluido. StrictMode solo repite el montaje, no cada cambio."
}
```

El linter no puede ayudarte aquí: para él, `opciones` es una prop como cualquier otra, y `[opciones]` está completo. El problema está en el padre, en otro archivo. Por eso el registro de efectos es tan útil: «cambió opciones» con lo mismo a los dos lados de la flecha es la firma de un objeto recreado.

El arreglo es **leer los valores primitivos fuera del efecto** y depender de ellos:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "function Seguimiento({ opciones }) {\n  const { servidor, barco } = opciones\n\n  useEffect(() => {\n    const conexion = crearConexion({ servidor, barco })\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [servidor, barco])\n\n  // ...\n}\n\n// Si lo que llega es una función pura, llámala fuera del efecto\nfunction SeguimientoConFuncion({ obtenerOpciones }) {\n  const { servidor, barco } = obtenerOpciones()\n\n  useEffect(() => {\n    const conexion = crearConexion({ servidor, barco })\n    conexion.conectar()\n    return () => conexion.desconectar()\n  }, [servidor, barco])\n\n  // ...\n}",
  "anotaciones": [
    {
      "fragmento": "const { servidor, barco } = opciones",
      "nota": "Se sacan los textos del objeto en el cuerpo del componente. Si el padre recrea el objeto con lo mismo dentro, servidor y barco siguen siendo iguales y el efecto no se toca."
    },
    {
      "fragmento": "crearConexion({ servidor, barco })",
      "nota": "Dentro del efecto se vuelve a montar un objeto. Es un poco repetitivo, pero deja escrito qué información necesita el efecto de verdad."
    },
    {
      "fragmento": "}, [servidor, barco])",
      "nota": "Si cambia el barco o el servidor, se reconecta, como debe ser. Si solo cambia el objeto que los envuelve, no."
    },
    {
      "fragmento": "const { servidor, barco } = obtenerOpciones()",
      "nota": "Una función que llega por props cambia en cada render del padre. Si es pura, se puede llamar durante el render para sacar valores primitivos. Si es un manejador de eventos, envuélvela en useEffectEvent."
    }
  ]
}
```

Si el efecto leyera `opciones.barco` y `opciones.servidor` directamente y dejaras el array vacío, el linter te propondría justo esas dos: «React Hook useEffect has missing dependencies: 'opciones.barco' and 'opciones.servidor'». Escribir `[opciones.servidor, opciones.barco]` también es correcto: son textos, y no cambian aunque el objeto que los envuelve se cree de nuevo.

Mejor todavía, si el componente es tuyo: **que reciba props primitivas**, `<Seguimiento servidor={SERVIDOR} barco={barco} />`. Un componente con props de texto y número es más fácil de usar bien.

## El recetario, de un vistazo

```laboratorio
{
  "tipo": "notas-clave",
  "titulo": "Cuando un efecto se repite de más",
  "items": [
    {
      "titulo": "Responde a una interacción",
      "texto": "Mándalo desde el manejador del evento y borra el efecto. Lo que pasa porque alguien pulsa un botón no es una sincronización."
    },
    {
      "titulo": "Sincroniza dos cosas distintas",
      "texto": "Divídelo en dos efectos, cada uno con sus dependencias. Si se repiten, saca la lógica común a un Hook propio (lección 43)."
    },
    {
      "titulo": "Lee el estado solo para calcular el siguiente",
      "texto": "Pasa una función actualizadora: setLista((anterior) => [...anterior, nuevo]). El efecto deja de leer ese estado."
    },
    {
      "titulo": "Necesita el último valor, pero no reaccionar a él",
      "texto": "Llévalo a un Effect Event con useEffectEvent (lección 41). Vale también para manejadores que llegan por props."
    },
    {
      "titulo": "Usa un objeto o una función fijos",
      "texto": "Sácalos del componente. Lo que se declara fuera no es reactivo y no va en el array."
    },
    {
      "titulo": "Usa un objeto o una función que dependen de props o estado",
      "texto": "Créalos dentro del efecto. Las dependencias pasan a ser los valores primitivos que leen."
    },
    {
      "titulo": "Recibe un objeto o una función por props",
      "texto": "Saca los valores primitivos fuera del efecto (o llama a la función si es pura) y depende de ellos. Si el componente es tuyo, mejor props primitivas."
    },
    {
      "titulo": "Nunca",
      "texto": "Quitar del array algo que el efecto lee, ni silenciar el linter con un comentario. El efecto acabará leyendo valores viejos."
    }
  ]
}
```

## Cuándo lo usarías de verdad

- **Conexiones que no deben cortarse sin motivo**: un chat, un WebSocket de cotizaciones, el seguimiento de un pedido. Cada reconexión de más es tráfico, mensajes perdidos y, a veces, una factura del proveedor.
- **Widgets de fuera de React**: mapas, editores de texto, reproductores de vídeo. Si el efecto que los crea se repite, el usuario pierde el zoom, la posición del cursor o el minuto por el que iba. Es el ejercicio de esta lección.
- **Temporizadores e intervalos**: un intervalo que se rehace en cada tic funciona, pero se desfasa y es difícil de razonar.
- **Peticiones**: un efecto que pide datos con una dependencia de objeto puede quedarse pidiendo lo mismo sin parar, como verás ahora.
- **Al leer código heredado**: cada `eslint-disable-next-line react-hooks/exhaustive-deps` es un fallo esperando su momento. Este recetario sirve para quitarlos uno a uno.

## Errores típicos

**Un efecto que cambia el estado y depende de un objeto recreado.** La clasificación de la regata filtra los barcos por clase y guarda el resultado en el estado desde un efecto:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "const BARCOS = [\n  { nombre: 'Galerna', clase: 'Optimist' },\n  { nombre: 'Marejada', clase: 'Laser' },\n  { nombre: 'Bonanza', clase: 'Optimist' },\n]\n\nexport default function Clasificacion() {\n  const [clase, setClase] = useState('Optimist')\n  const [visibles, setVisibles] = useState([])\n  const filtro = { clase }\n\n  useEffect(() => {\n    setVisibles(BARCOS.filter((b) => b.clase === filtro.clase))\n  }, [filtro])\n\n  return (\n    <ul>\n      {visibles.map((b) => <li key={b.nombre}>{b.nombre}</li>)}\n    </ul>\n  )\n}\n\n// ¿Qué pasa al montar el componente?",
  "opciones": [
    "Pinta Galerna y Bonanza, y ya está",
    "No pinta nada hasta que cambie la clase",
    "Pinta la lista, pero se queda en bucle y la consola se llena de errores",
    "Error de render: «Too many re-renders»"
  ],
  "correcta": 2,
  "explicacion": "El efecto guarda un array nuevo, eso provoca un render, el render crea otro filtro, el efecto ve un objeto distinto y vuelve a guardar otro array. Así sin fin. La lista se ve, pero React avisa en la consola una y otra vez con «Maximum update depth exceeded»: comprobado con React 19.3, más de 400 avisos en un segundo."
}
```

El aviso que se repite es este:

```text
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

Es decir: se ha superado la profundidad máxima de actualizaciones; pasa cuando un componente llama a `setState` dentro de `useEffect` y el efecto o no tiene array de dependencias, o una de ellas cambia en cada render. Es el mismo mensaje que recoge la lección 64. Aquí se arregla con la receta de los objetos (`[clase]` y el filtro dentro del efecto), pero en este caso concreto ni siquiera hace falta un efecto: la lista filtrada se calcula en el render, como en la lección 24.

Si el `set` llega después de una petición, en el `then` de un `fetch`, no hay ningún aviso: el bucle es más lento y solo se ve en el registro de red, que no deja de añadir peticiones iguales. Con la misma dependencia de objeto y 100 ms de latencia salen unas diez peticiones por segundo, sin que nadie toque nada.

**Quitar del array una dependencia que sí lo es.** Si en el seguimiento cambias `[barco]` por `[]`, al pulsar «Seguir a Marejada» el título dice Marejada y la conexión sigue con Galerna. Nada falla de forma visible; los datos son, sencillamente, de otro barco.

**Buscar la solución en `useCallback` o `useMemo` lo primero.** Estabilizan el objeto o la función, pero el efecto sigue dependiendo de algo que no hacía falta. Mover una línea suele ser más sencillo y más claro. Quedan para cuando el valor de verdad tiene que crearse en el componente y pasarse a varios sitios (lección 67).

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un array vacío significa «ejecútalo solo al montar»",
      "realidad": "Significa «este efecto no lee ningún valor reactivo». Si es verdad, se ejecuta al montar y se limpia al desmontar. Si lo pones para que se ejecute una vez pero el efecto lee props o estado, estás mintiendo y leerá siempre los valores del primer render."
    },
    {
      "mito": "El aviso de dependencias es una sugerencia de estilo",
      "realidad": "Es un aviso por defecto, pero react.dev recomienda tratarlo como un error de compilación. Cada vez que el array no coincide con el código, hay un fallo posible."
    },
    {
      "mito": "Hay que poner las funciones set en las dependencias",
      "realidad": "Las de useState, el dispatch de useReducer y las refs de useRef son estables. El linter no las pide, y si las pones no pasa nada: nunca cambian."
    },
    {
      "mito": "Quitar dependencias es una optimización",
      "realidad": "Quitar una que el efecto lee es introducir un fallo. Lo que optimiza es cambiar el código para que deje de leerla, y entonces se quita sola."
    },
    {
      "mito": "Si dos objetos tienen lo mismo dentro, React ve que no ha cambiado",
      "realidad": "React compara con Object.is, que para objetos funciona como un triple igual. Dos objetos, arrays o funciones creados en renders distintos son distintos para React, tengan lo que tengan dentro."
    }
  ]
}
```

## Ejercicios

La bitácora de la regata muestra una carta náutica. La carta es una librería escrita sin React, como las de mapas de verdad: pinta dentro de un `div` vacío, tiene su propio botón «Acercar» y recuerda su zoom. El componente `Carta` la crea en un efecto y la destruye en la limpieza.

El problema: cada vez que escribes un comentario o marcas una posición, **la carta vuelve al zoom 1**. Acerca la carta, escribe una letra y mira el registro de efectos: te dice qué dos dependencias cambian en cada render. Arregla `Carta.jsx` (o lo que creas necesario) sin silenciar al linter.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Una carta náutica que pierde el zoom",
  "consigna": "Pulsa «Acercar» y escribe un comentario: la carta vuelve al zoom 1. Lee el registro de efectos para saber qué dos dependencias cambian en cada render y arregla Carta.jsx con las recetas de la lección. La carta tiene que seguir cambiando de zona, y cada marca tiene que guardar el comentario que hay escrito al pulsar.",
  "archivos": [
    {
      "nombre": "Carta.jsx",
      "codigo": "import { useEffect, useRef } from 'react'\nimport { crearCarta } from './cartas-nauticas'\n\nexport default function Carta({ opciones, onMarcar }) {\n  const contenedorRef = useRef(null)\n\n  // La carta se destruye y se vuelve a crear más de la cuenta.\n  // El registro de efectos te dice qué dependencias cambian.\n  useEffect(() => {\n    const carta = crearCarta(contenedorRef.current, { ...opciones, onMarcar })\n    return () => carta.destruir()\n  }, [opciones, onMarcar])\n\n  return <div className=\"carta\" role=\"region\" aria-label=\"Carta náutica\" ref={contenedorRef} />\n}\n"
    },
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport Carta from './Carta'\nimport './estilos.css'\n\nlet siguienteId = 1\n\nexport default function Bitacora() {\n  const [zona, setZona] = useState('Ría de Arousa')\n  const [comentario, setComentario] = useState('')\n  const [marcas, setMarcas] = useState([])\n\n  function manejarMarca({ zona, zoom }) {\n    const nota = comentario || 'Sin comentario'\n    setMarcas([...marcas, { id: siguienteId++, texto: `${zona} (zoom ${zoom}): ${nota}` }])\n  }\n\n  return (\n    <main>\n      <h1>Bitácora de la regata</h1>\n      <label>\n        Zona\n        <select value={zona} onChange={(e) => setZona(e.target.value)}>\n          <option>Ría de Arousa</option>\n          <option>Ría de Vigo</option>\n        </select>\n      </label>\n      <Carta opciones={{ zona, zoomInicial: 1 }} onMarcar={manejarMarca} />\n      <label>\n        Comentario\n        <input value={comentario} onChange={(e) => setComentario(e.target.value)} />\n      </label>\n      <h2>Marcas</h2>\n      <ol>\n        {marcas.map((marca) => (\n          <li key={marca.id}>{marca.texto}</li>\n        ))}\n      </ol>\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "cartas-nauticas.jsx",
      "codigo": "// Una librería de cartas náuticas escrita sin React, como las de mapas\n// de verdad: pinta dentro del nodo que le das y guarda su propio zoom.\n// No hace falta que la cambies.\nexport function crearCarta(contenedor, { zona, zoomInicial, onMarcar }) {\n  let zoom = zoomInicial\n  const titulo = document.createElement('p')\n  const escala = document.createElement('p')\n  const acercar = document.createElement('button')\n  const marcar = document.createElement('button')\n  acercar.textContent = 'Acercar'\n  marcar.textContent = 'Marcar posición'\n\n  function pintar() {\n    titulo.textContent = `Zona: ${zona}`\n    escala.textContent = `Zoom: ${zoom}`\n  }\n\n  acercar.addEventListener('click', () => {\n    zoom = Math.min(zoom + 1, 5)\n    pintar()\n  })\n  marcar.addEventListener('click', () => onMarcar({ zona, zoom }))\n\n  contenedor.append(titulo, escala, acercar, marcar)\n  pintar()\n  console.log(`Carta de ${zona} creada`)\n\n  return {\n    destruir() {\n      contenedor.replaceChildren()\n      console.log(`Carta de ${zona} destruida`)\n    },\n  }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  font-family: system-ui, sans-serif;\n  max-width: 36rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 0.4rem 0.75rem;\n  margin: 0 0.5rem 0.5rem 0;\n}\n\nbutton[aria-pressed='true'] {\n  background: #0c4a6e;\n  color: white;\n}\n\nlabel {\n  display: block;\n  margin: 0.5rem 0;\n}\n\ninput,\nselect,\ntextarea {\n  font: inherit;\n  margin-left: 0.5rem;\n}\n\n.carta {\n  margin: 0.75rem 0;\n  padding: 0.75rem;\n  border: 2px solid #0c4a6e;\n  border-radius: 8px;\n  background: repeating-linear-gradient(135deg, #e0f2fe 0 12px, #bae6fd 12px 24px);\n}\n\n.carta p {\n  margin: 0 0 0.5rem;\n  font-weight: 600;\n}\n"
    }
  ],
  "archivoInicial": "Carta.jsx",
  "strictMode": true,
  "mostrarConsola": true,
  "mostrarEfectos": true,
  "comprobaciones": [
    {
      "descripcion": "Al escribir un comentario, la carta conserva el zoom",
      "pasos": [
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Acercar"
          }
        },
        {
          "escribir": {
            "etiqueta": "Comentario",
            "texto": "Viento del norte"
          }
        }
      ],
      "espera": {
        "texto": "Zoom: 2"
      }
    },
    {
      "descripcion": "Cada marca guarda el comentario escrito en ese momento",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Comentario",
            "texto": "Boya de Rúa"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar posición"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Boya de Rúa"
      }
    },
    {
      "descripcion": "Dos marcas seguidas se guardan las dos",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Comentario",
            "texto": "Boya norte"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar posición"
          }
        },
        {
          "escribir": {
            "etiqueta": "Comentario",
            "texto": "Boya sur"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Marcar posición"
          }
        }
      ],
      "espera": {
        "rol": "listitem",
        "texto": "Boya norte"
      }
    },
    {
      "descripcion": "Al cambiar de zona, la carta enseña la nueva",
      "pasos": [
        {
          "seleccionar": {
            "etiqueta": "Zona",
            "opcion": "Ría de Vigo"
          }
        }
      ],
      "espera": {
        "texto": "Zona: Ría de Vigo"
      }
    }
  ]
}
```

Si te atascas, esto es lo que escribe el registro al pulsar «Marcar posición» con el código de partida:

```text
Carta ▶ efecto · cambió opciones: {"zona":"Ría de Arousa","zoomInicial":1} → {"zona":"Ría de Arousa","zoomInicial":1}; onMarcar: ƒ manejarMarca() → ƒ manejarMarca()
```

Las dos dependencias cambian en cada render de `Bitacora`, y ninguna por un motivo real. Para el objeto, saca sus valores primitivos fuera del efecto. Para la función, que es un manejador, usa un Effect Event. Si simplemente las quitas del array, las comprobaciones te dirán por qué no vale: la carta deja de cambiar de zona y las marcas se guardan sin el comentario, con los valores del primer render.

**Retos para seguir practicando** (sin comprobación automática):

1. En el taxímetro del principio, cambia el actualizador por el Effect Event de la sección de `useEffectEvent` y comprueba en el registro que cambiar de tarifa ya no rehace el intervalo.
2. En la página de amarres, añade unos botones «Hasta 10 m» y «Cualquier eslora» que filtren los amarres que ya tienes, sin pedir nada nuevo al servidor. ¿Necesitas otro efecto? (Pista: lección 24.)
3. Cambia la bitácora para que `Carta` reciba `zona` y `zoomInicial` como props sueltas, en vez del objeto `opciones`. ¿Cuántas líneas del arreglo puedes borrar?
4. Busca en un proyecto tuyo, o en uno de código abierto, un `eslint-disable-next-line react-hooks/exhaustive-deps`. Averigua qué receta de esta lección lo quitaría.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Removing Effect Dependencies",
      "descripcion": "La guía de react.dev en la que se basa esta lección, con el recetario completo y cuatro retos con solución.",
      "url": "https://react.dev/learn/removing-effect-dependencies",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "exhaustive-deps",
      "descripcion": "La página de la regla del linter: ejemplos válidos e inválidos, qué hacer cuando una función provoca un bucle y cómo configurar Hooks de efecto propios.",
      "url": "https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Separating Events from Effects",
      "descripcion": "Cuándo una parte del efecto no debe ser reactiva y cómo separarla con useEffectEvent. Es la lección 41.",
      "url": "https://react.dev/learn/separating-events-from-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Lifecycle of Reactive Effects",
      "descripcion": "Qué es un valor reactivo y por qué el linter exige declararlos todos. Es la lección 40.",
      "url": "https://react.dev/learn/lifecycle-of-reactive-effects",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "Object.is()",
      "descripcion": "La comparación que usa React para decidir si una dependencia ha cambiado, y por qué dos objetos iguales por dentro no lo son.",
      "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is",
      "etiqueta": "MDN"
    }
  ]
}
```
