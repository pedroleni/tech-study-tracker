# Probar lo asíncrono: esperas, red simulada y hooks

- **Módulo:** Calidad y producción
- **Slug:** `probar-lo-asincrono-esperas-red-simulada-y-hooks` (autogenerado del título)
- **Orden:** 840
- **Fuentes:** [RTL API (`renderHook`)](https://testing-library.com/docs/react-testing-library/api) + [MSW](https://mswjs.io/docs/) — ver `contenido/react/TEMARIO.md` #84

---

## Qué es y para qué sirve

En la lección 83 todo lo que probabas pasaba al instante: pulsas, el estado cambia, el DOM cambia, compruebas. Pero buena parte de una aplicación real **no pasa al instante**: pide datos a un servidor, muestra «Cargando…», espera la respuesta; cuenta atrás con un temporizador; reintenta tras un error. Un test que comprueba justo después de montar llega siempre antes que la respuesta, y un test que espera «un ratito» a ojo es lento y falla de vez en cuando.

Esta lección resuelve cuatro problemas, uno por herramienta:

- **Esperar sin adivinar cuánto**: `findBy…`, `waitFor` y `waitForElementToBeRemoved`, de Testing Library.
- **No depender de un servidor de verdad**: con **MSW** (Mock Service Worker) respondes tú a las peticiones, con los datos, el error o el retardo que quieras.
- **Probar un Hook sin montar una pantalla**: `renderHook`, de Testing Library.
- **No esperar cinco minutos de reloj para probar un temporizador de cinco minutos**: `vi.useFakeTimers`, de Vitest.

Seguimos con el entorno de la lección 83 (Vitest, jsdom, Testing Library y user-event). La única pieza nueva es MSW.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Versiones con las que se ha ejecutado todo",
  "contenido": "React 19.3.1, Vitest 5.0.5, Testing Library React 16.3.3, user-event 14.6.8, jest-dom 7.0.1, jsdom 28.1.0 y MSW 3.0.3 (comprobado el 21 de octubre de 2026). MSW 3 cambió sus importaciones respecto a la 2: lo verás más abajo, porque casi todos los tutoriales que encuentres usan todavía la 2."
}
```

## El componente que vamos a probar

El **refugio de Góriz**, en el Pirineo, tiene un número limitado de plazas por noche. Este componente deja elegir la noche, pide al servidor cuántas plazas quedan, permite reservar una y, una vez reservada, la retiene durante unos minutos con una cuenta atrás. Tiene todo lo que hace difícil un test: una petición `GET` con estado de carga y de error, una `POST`, un Hook propio (`useDatos`, el de la lección 43) y un temporizador.

La vista previa trae la API simulada de la web (la que verás en la sección siguiente) con la latencia en 1,2 segundos, para que se vean los estados intermedios.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "Las plazas del refugio de Góriz",
  "consigna": "Elige «Sábado 15» y observa con atención lo que pone el texto de plazas mientras llega la respuesta (1,2 s). Después vuelve a «Viernes 14», pulsa «Reservar plaza» y mira la cuenta atrás: tiene 10 segundos para ver cómo caduca. En el panel de red puedes subir la latencia o pulsar «Fallar la siguiente petición».",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import PlazasRefugio from './PlazasRefugio'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <PlazasRefugio segundosRetencion={10} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PlazasRefugio.jsx",
      "codigo": "import { useState } from 'react'\nimport Retencion from './Retencion'\nimport useDatos from './useDatos'\n\nexport default function PlazasRefugio({ segundosRetencion = 300 }) {\n  const [nocheId, setNocheId] = useState('1')\n  const { datos: noche, error } = useDatos(`/api/noches/${nocheId}`)\n  const [reserva, setReserva] = useState(null)\n  const [fallo, setFallo] = useState('')\n\n  async function reservar() {\n    setFallo('')\n    const respuesta = await fetch('/api/reservas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ noche: Number(nocheId) }),\n    })\n    if (!respuesta.ok) {\n      setFallo('No se pudo hacer la reserva.')\n      return\n    }\n    setReserva(await respuesta.json())\n  }\n\n  return (\n    <section aria-labelledby=\"titulo-refugio\">\n      <h2 id=\"titulo-refugio\">Refugio de Góriz</h2>\n      <label>\n        Noche\n        <select\n          value={nocheId}\n          onChange={(e) => {\n            setNocheId(e.target.value)\n            setReserva(null)\n          }}\n        >\n          <option value=\"1\">Viernes 14</option>\n          <option value=\"2\">Sábado 15</option>\n        </select>\n      </label>\n      {error && <p role=\"alert\">No se pudo cargar la disponibilidad.</p>}\n      {!error && !noche && <p>Cargando disponibilidad…</p>}\n      {noche && (\n        <p>\n          {noche.plazasLibres > 0\n            ? `Quedan ${noche.plazasLibres} plazas la noche del ${noche.fecha}.`\n            : `La noche del ${noche.fecha} está completa.`}\n        </p>\n      )}\n      <button type=\"button\" onClick={reservar} disabled={!noche || noche.plazasLibres === 0}>\n        Reservar plaza\n      </button>\n      {fallo && <p role=\"alert\">{fallo}</p>}\n      {reserva && (\n        <>\n          <p role=\"status\">Reserva nº {reserva.id} confirmada.</p>\n          <Retencion segundos={segundosRetencion} />\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Retencion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Retencion({ segundos = 300 }) {\n  const [restantes, setRestantes] = useState(segundos)\n\n  useEffect(() => {\n    if (restantes <= 0) return\n    const id = setTimeout(() => setRestantes(restantes - 1), 1000)\n    return () => clearTimeout(id)\n  }, [restantes])\n\n  if (restantes <= 0) return <p role=\"alert\">La retención ha caducado.</p>\n\n  const minutos = Math.floor(restantes / 60)\n  const resto = String(restantes % 60).padStart(2, '0')\n  return (\n    <div>\n      <p>\n        Plaza retenida durante {minutos}:{resto}\n      </p>\n      <button type=\"button\" onClick={() => setRestantes(restantes + 60)}>\n        Prolongar un minuto\n      </button>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "useDatos.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function useDatos(url) {\n  const [datos, setDatos] = useState(null)\n  const [error, setError] = useState(null)\n\n  useEffect(() => {\n    if (!url) return\n    const control = new AbortController()\n    fetch(url, { signal: control.signal })\n      .then((respuesta) => {\n        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)\n        return respuesta.json()\n      })\n      .then((recibidos) => {\n        setDatos(recibidos)\n        setError(null)\n      })\n      .catch((motivo) => {\n        if (motivo.name !== 'AbortError') setError(motivo)\n      })\n    return () => control.abort()\n  }, [url])\n\n  return { datos, error }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  color: #14532d;\n  font-size: 1.25rem;\n}\n\nlabel {\n  display: inline-grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.9rem;\n  border: 1px solid #15803d;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  border-color: #94a3b8;\n  background: #94a3b8;\n  cursor: not-allowed;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #dcfce7;\n}\n"
    }
  ],
  "archivoInicial": "PlazasRefugio.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "noches": [
      {
        "id": 1,
        "fecha": "viernes 14 de agosto",
        "plazasLibres": 6
      },
      {
        "id": 2,
        "fecha": "sábado 15 de agosto",
        "plazasLibres": 0
      }
    ],
    "reservas": [
      {
        "id": 100,
        "noche": 1
      }
    ]
  },
  "red": {
    "latencia": 1200
  }
}
```

Si has mirado bien, hay algo raro cuando cambias de noche. No lo arregles todavía: **este fallo lo va a encontrar un test** y es una buena historia para la lección.

## Dos redes simuladas que no hay que confundir

Esta web ya te ha dado una red simulada: el panel de red de la vista previa, con su latencia, su botón «Fallar la siguiente petición» y su registro de peticiones. **MSW es la misma idea, a otro nivel y para otro momento**:

- **La API simulada de la web** vive dentro de la vista previa de la lección, en el navegador. Existe para que *tú* veas cómo se comporta un componente con una red lenta o rota. Los tests de tu proyecto no la ven: se ejecutan en Node, no aquí.
- **MSW** vive dentro de tus tests, en Node. Intercepta el `fetch` de verdad y responde con lo que tú programes en unos *handlers* (manejadores). Existe para que *tus tests* sean rápidos, repetibles y puedan forzar un error 500 cuando quieran.

Se parecen tanto que el componente de arriba **es literalmente el mismo código en los dos mundos**: pide `/api/noches/1` y no sabe quién le contesta. Cada ajuste de la web tiene su equivalente en MSW:

- El deslizante de latencia es `await delay(150)` dentro de un handler.
- «Fallar la siguiente petición» (y el paso `{red: 'fallar-siguiente'}` de las comprobaciones) es un handler que responde con `new HttpResponse(null, { status: 500 })`.
- Las colecciones de datos de la vista previa son lo que devuelva tu handler: `HttpResponse.json({...})`.
- La cancelación con `AbortController` funciona igual en los dos; la usa `useDatos`.

La diferencia que importa: la API de la web tiene datos que viven en memoria y rutas ya hechas (`GET`, `POST`, `PUT`, `DELETE` sobre una colección). En MSW cada ruta que tu código llame **la escribes tú**, y si una petición no tiene handler, MSW por defecto solo avisa y la deja pasar a la red de verdad (la opción `warn`). En el montaje de abajo la configuramos para rechazarla.

## Montar MSW en tu entorno de tests

```bash
npm install -D msw
```

Hacen falta tres archivos: los handlers (la «red de mentira» por defecto), el servidor que los activa y la conexión con Vitest.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// src/mocks/handlers.js\nimport { http, HttpResponse } from 'msw/http'\n\nexport const noches = {\n  1: { id: 1, fecha: 'viernes 14 de agosto', plazasLibres: 6 },\n  2: { id: 2, fecha: 'sábado 15 de agosto', plazasLibres: 0 },\n}\n\nexport const handlers = [\n  http.get('/api/noches/:id', ({ params }) => {\n    const noche = noches[params.id]\n    return noche ? HttpResponse.json(noche) : new HttpResponse(null, { status: 404 })\n  }),\n  http.post('/api/reservas', () => HttpResponse.json({ id: 101 }, { status: 201 })),\n]\n\n// src/mocks/server.js\nimport { setupServer } from 'msw/node'\nimport { handlers } from './handlers.js'\n\nexport const server = setupServer(...handlers)\n\n// src/setup.js (el de la lección 83, con tres líneas más)\nimport '@testing-library/jest-dom/vitest'\nimport { server } from './mocks/server.js'\n\nbeforeAll(() => server.listen({ onUnhandledFrame: 'error' }))\nafterEach(() => server.resetHandlers())\nafterAll(() => server.close())",
  "anotaciones": [
    {
      "fragmento": "import { http, HttpResponse } from 'msw/http'",
      "nota": "En MSW 3 los manejadores de HTTP se importan de msw/http. En la 2.x se importaba todo de msw, y casi todos los tutoriales lo hacen así. Si lo ves en un código antiguo, es la versión 2."
    },
    {
      "fragmento": "http.get('/api/noches/:id', ({ params }) => {",
      "nota": "Un handler dice qué método y qué ruta intercepta. Los dos puntos marcan un parámetro de ruta, que llega en params. Con la ruta relativa, MSW la resuelve contra la dirección de jsdom, por eso el componente puede pedir /api/... sin más."
    },
    {
      "fragmento": "HttpResponse.json(noche)",
      "nota": "Una respuesta con cuerpo JSON y su cabecera de tipo. Es una Response normal, la misma que tu código recibiría de un servidor."
    },
    {
      "fragmento": "return noche ? HttpResponse.json(noche) : new HttpResponse(null, { status: 404 })",
      "nota": "Las noches que no existen devuelven un 404 sin cuerpo, como haría un servidor."
    },
    {
      "fragmento": "import { setupServer } from 'msw/node'",
      "nota": "setupServer es la versión de Node: no levanta ningún servidor, intercepta las peticiones salientes del propio proceso."
    },
    {
      "fragmento": "server.listen({ onUnhandledFrame: 'error' })",
      "nota": "Empieza a interceptar. Con onUnhandledFrame en error, una petición sin handler se rechaza y MSW imprime un aviso, en vez de dejarla pasar a internet. En MSW 2 esta opción se llamaba onUnhandledRequest."
    },
    {
      "fragmento": "afterEach(() => server.resetHandlers())",
      "nota": "Quita los handlers que un test haya añadido con server.use, para que no se cuelen en el siguiente. Sin esta línea, un 500 forzado en un test seguiría activo en los siguientes."
    },
    {
      "fragmento": "afterAll(() => server.close())",
      "nota": "Deja de interceptar al terminar."
    }
  ]
}
```

En MSW 3 los pasos son los mismos que en la 2, con tres cambios de nombre que importan aquí: `http` y `HttpResponse` se importan de **`msw/http`**, `delay` de **`msw/utils/delay`**, y la opción para las peticiones sin handler se llama **`onUnhandledFrame`**. Además, MSW 3 pide Node 22 o superior. Todo está en su guía de migración de la 2.x a la 3.x.

## Esperar: `findBy`, `waitFor` y `waitForElementToBeRemoved`

Pruébalo: monta el componente y busca el texto de las plazas **justo después**, con `getByText`:

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "it('muestra las plazas de la primera noche', () => {\n  render(<PlazasRefugio />)\n\n  expect(screen.getByText(/Quedan 6 plazas/)).toBeInTheDocument()\n})",
  "opciones": [
    "Pasa: la respuesta de MSW es instantánea",
    "Falla: getByText no encuentra el texto, porque todavía se está cargando",
    "Pasa, pero Vitest avisa de que falta un await"
  ],
  "correcta": 1,
  "explicacion": "Aunque MSW responda sin retardo, una petición siempre es asíncrona: render termina antes de que llegue la respuesta, y getByText no espera. El mensaje de error vuelca el DOM, que enseña el texto «Cargando disponibilidad…». Comprobado en el proyecto de pruebas."
}
```

La solución es esperar, y Testing Library te da tres formas, de más a menos cómoda:

- **`await screen.findByText(...)`** (y `findByRole`, `findByLabelText`...): es un `getBy` que **reintenta hasta que encuentra el elemento**. Es la que usarás casi siempre: «espero a que aparezca esto».
- **`await waitFor(() => expect(...))`**: reintenta *cualquier* comprobación hasta que deje de lanzar un error. Es para lo que no es «aparece un elemento»: que un espía haya sido llamado, que un valor haya cambiado.
- **`await waitForElementToBeRemoved(...)`**: espera a que algo **desaparezca**, como el «Cargando…».

Los tres reintentan cada 50 milisegundos, además de cada vez que el DOM cambia, y se rinden pasado 1 segundo (valores por defecto de la documentación; se cambian con las opciones `interval` y `timeout`, y los `findBy` aceptan esas mismas opciones como último argumento). Estas son las dos primeras pruebas del componente:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// src/PlazasRefugio.test.jsx (primera parte)\nimport { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { http, HttpResponse } from 'msw/http'\nimport { delay } from 'msw/utils/delay'\nimport { describe, expect, it } from 'vitest'\nimport { noches } from './mocks/handlers'\nimport { server } from './mocks/server'\nimport PlazasRefugio from './PlazasRefugio'\n\ndescribe('PlazasRefugio', () => {\n  it('muestra las plazas libres cuando llegan', async () => {\n    render(<PlazasRefugio />)\n\n    expect(screen.getByText('Cargando disponibilidad…')).toBeInTheDocument()\n    expect(await screen.findByText(/Quedan 6 plazas/)).toBeInTheDocument()\n  })\n\n  it('quita el «Cargando» en cuanto llegan los datos', async () => {\n    render(<PlazasRefugio />)\n\n    await waitForElementToBeRemoved(() => screen.queryByText('Cargando disponibilidad…'))\n\n    expect(screen.getByText(/Quedan 6 plazas/)).toBeInTheDocument()\n  })\n})",
  "anotaciones": [
    {
      "fragmento": "import { http, HttpResponse } from 'msw/http'",
      "nota": "Los usaremos en los tests siguientes para cambiar la red en mitad de un test."
    },
    {
      "fragmento": "expect(screen.getByText('Cargando disponibilidad…')).toBeInTheDocument()",
      "nota": "Nada más montar, el estado de carga sí está: se puede comprobar de forma síncrona, con getBy."
    },
    {
      "fragmento": "expect(await screen.findByText(/Quedan 6 plazas/)).toBeInTheDocument()",
      "nota": "findBy devuelve una promesa que se resuelve con el elemento cuando aparece. El await es obligatorio. Si no aparece en 1 segundo, el test falla con el mismo mensaje de un getBy."
    },
    {
      "fragmento": "await waitForElementToBeRemoved(() => screen.queryByText('Cargando disponibilidad…'))",
      "nota": "Espera a que el elemento desaparezca. Se le pasa una función que lo busca con queryBy: el elemento tiene que estar en el DOM cuando se llama, y si ya no está, lanza un error."
    },
    {
      "fragmento": "expect(screen.getByText(/Quedan 6 plazas/)).toBeInTheDocument()",
      "nota": "Cuando waitForElementToBeRemoved termina, los datos ya están: ahora basta un getBy síncrono."
    }
  ]
}
```

Un fallo clásico con `waitFor`: **la función tiene que lanzar un error para que reintente**. Devolver `false` no basta. ¿Qué pasa aquí, con un servidor que tarda 150 ms en contestar?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "await waitFor(\n  () => screen.queryByText('Cargando disponibilidad…') === null,\n)\n\nexpect(screen.getByText(/Quedan 6 plazas/)).toBeInTheDocument()",
  "opciones": [
    "waitFor reintenta hasta que la condición es true, y después el getByText encuentra las plazas",
    "waitFor termina enseguida, porque la función no lanza ningún error, y el getByText falla porque aún se está cargando",
    "waitFor lanza un error: una función de waitFor no puede devolver un booleano"
  ],
  "correcta": 1,
  "explicacion": "waitFor reintenta mientras la función lance un error; si devuelve algo, falso o verdadero, da la espera por cumplida. Aquí devuelve false y waitFor termina al instante, antes de que llegue la respuesta. Con un servidor muy rápido el test pasaría por casualidad: es un test inestable. La forma correcta lleva un expect dentro, que sí lanza. Comprobado con un handler de 150 ms."
}
```

La forma correcta es `await waitFor(() => expect(screen.queryByText('Cargando disponibilidad…')).not.toBeInTheDocument())`: el `expect` lanza si todavía está, y `waitFor` reintenta.

## Forzar lo que quieras: error 500, retardos y una respuesta distinta por test

Los handlers por defecto cuentan el camino feliz. Para cada caso raro, el test **antepone un handler con `server.use`**, que vale solo para ese test (gracias al `resetHandlers` del `afterEach`). Esto es lo que no puedes hacer con un servidor real: pedirle que falle cuando tú quieras.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// src/PlazasRefugio.test.jsx (resto)\ndescribe('PlazasRefugio', () => {\n  it('avisa si el servidor responde con un 500', async () => {\n    server.use(http.get('/api/noches/:id', () => new HttpResponse(null, { status: 500 })))\n    render(<PlazasRefugio />)\n\n    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la disponibilidad.')\n    expect(screen.queryByText('Cargando disponibilidad…')).not.toBeInTheDocument()\n  })\n\n  it('al cambiar de noche no enseña los datos de la anterior', async () => {\n    server.use(\n      http.get('/api/noches/:id', async ({ params }) => {\n        await delay(150)\n        return HttpResponse.json(noches[params.id])\n      }),\n    )\n    const usuario = userEvent.setup()\n    render(<PlazasRefugio />)\n    await screen.findByText(/Quedan 6 plazas/)\n\n    await usuario.selectOptions(screen.getByLabelText('Noche'), 'Sábado 15')\n\n    expect(screen.getByText('Cargando disponibilidad…')).toBeInTheDocument()\n    expect(screen.queryByText(/Quedan 6 plazas/)).not.toBeInTheDocument()\n    expect(await screen.findByText(/está completa/)).toBeInTheDocument()\n  })\n\n  it('reserva una plaza y manda la noche elegida', async () => {\n    let cuerpo\n    server.use(\n      http.post('/api/reservas', async ({ request }) => {\n        cuerpo = await request.json()\n        return HttpResponse.json({ id: 101 }, { status: 201 })\n      }),\n    )\n    const usuario = userEvent.setup()\n    render(<PlazasRefugio />)\n    await usuario.click(await screen.findByRole('button', { name: 'Reservar plaza' }))\n\n    expect(await screen.findByRole('status')).toHaveTextContent('Reserva nº 101 confirmada.')\n    await waitFor(() => expect(cuerpo).toEqual({ noche: 1 }))\n  })\n\n  it('avisa si el servidor rechaza la reserva con un 409', async () => {\n    server.use(http.post('/api/reservas', () => new HttpResponse(null, { status: 409 })))\n    const usuario = userEvent.setup()\n    render(<PlazasRefugio />)\n    await usuario.click(await screen.findByRole('button', { name: 'Reservar plaza' }))\n\n    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo hacer la reserva.')\n    expect(screen.queryByRole('status')).not.toBeInTheDocument()\n  })\n})",
  "anotaciones": [
    {
      "fragmento": "server.use(http.get('/api/noches/:id', () => new HttpResponse(null, { status: 500 })))",
      "nota": "Este handler tiene prioridad sobre el de por defecto, solo en este test. Responde 500 sin cuerpo: el hook lo convierte en un error porque respuesta.ok es false."
    },
    {
      "fragmento": "expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la disponibilidad.')",
      "nota": "Se espera a que aparezca el aviso con rol alert, y se comprueba su texto. Es un aviso que ve quien usa el componente."
    },
    {
      "fragmento": "await delay(150)",
      "nota": "Retrasa la respuesta 150 ms para que el estado de carga dure lo suficiente como para comprobarlo. Sin retardo, la respuesta llegaría antes de que el test pudiera mirar."
    },
    {
      "fragmento": "cuerpo = await request.json()",
      "nota": "El handler recibe la petición completa. Aquí guarda lo que ha mandado el componente, para comprobar que reservó la noche elegida. Es la forma de probar lo que sale del componente, no solo lo que se ve."
    },
    {
      "fragmento": "await waitFor(() => expect(cuerpo).toEqual({ noche: 1 }))",
      "nota": "cuerpo se rellena dentro del handler, fuera de React: waitFor reintenta hasta que la petición ha llegado y se ha leído."
    },
    {
      "fragmento": "new HttpResponse(null, { status: 409 })",
      "nota": "Un 409 (conflicto): imagina que alguien reservó la última plaza un segundo antes. El componente debe contarlo."
    }
  ]
}
```

Otras dos opciones que te encontrarás: `{ once: true }` como tercer argumento de un handler (`http.get(url, resolver, { once: true })`) lo hace valer **solo para la primera petición**, y `await delay('infinite')` deja la respuesta colgada para siempre, útil para comprobar qué se ve mientras no llega nada.

Con los seis tests escritos, así queda la ejecución:

```text
 ✓ src/PlazasRefugio.test.jsx > PlazasRefugio > muestra las plazas libres cuando llegan 33ms
 ✓ src/PlazasRefugio.test.jsx > PlazasRefugio > quita el «Cargando» en cuanto llegan los datos 6ms
 ✓ src/PlazasRefugio.test.jsx > PlazasRefugio > avisa si el servidor responde con un 500 52ms
 ✓ src/PlazasRefugio.test.jsx > PlazasRefugio > al cambiar de noche no enseña los datos de la anterior 347ms
 ✓ src/PlazasRefugio.test.jsx > PlazasRefugio > reserva una plaza y manda la noche elegida 47ms
 ✓ src/PlazasRefugio.test.jsx > PlazasRefugio > avisa si el servidor rechaza la reserva con un 409 29ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
```

## El test que encuentra un fallo

El cuarto test, el de cambiar de noche, no está ahí por estética. Está escrito pensando en lo raro que viste en la vista previa: **si eliges otra noche, ¿qué se ve mientras llega la respuesta?** Se retrasa la respuesta 150 ms, se elige el sábado y se comprueba, de inmediato, que se ve el «Cargando» y que ya no se ve el dato del viernes. Contra el `useDatos` tal como lo escribimos en la lección 43, el resultado es este:

```text
 × src/PlazasRefugio.test.jsx > PlazasRefugio > al cambiar de noche no enseña los datos de la anterior 268ms
   → Unable to find an element with the text: Cargando disponibilidad…. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

  …
      <p>
        Quedan 6 plazas la noche del viernes 14 de agosto.
      </p>
  …
```

El test dice que no encuentra el «Cargando…», y el DOM que vuelca lo explica: **con el sábado elegido, la pantalla sigue diciendo «Quedan 6 plazas la noche del viernes»**. Una persona que mire la pantalla un segundo creería que quedan seis plazas el sábado, que está completo.

La causa está en el Hook. `useDatos` guarda los datos en un estado y, cuando cambia la `url`, el efecto lanza la petición nueva, pero **el estado de la petición anterior sigue ahí hasta que llega la respuesta nueva**. El hook no sabe a qué `url` pertenecen los datos que devuelve. Es un fallo de verdad, y no se ve en el código: se ve al probar un cambio de `url` con la red lenta.

La solución es que el hook guarde, junto a los datos, la `url` a la que pertenecen, y que devuelva datos vacíos cuando esa `url` no coincide con la actual. Lo harás en el ejercicio de más abajo, con el test como red. Antes, veamos cómo se prueba un Hook por separado.

## `renderHook`: probar un Hook sin montar una pantalla

Para ver qué devuelve un Hook propio no necesitas escribir un componente de mentira: `renderHook` lo monta por ti y te da el valor actual en **`result.current`** (piensa en `result` como una ref que apunta al último valor devuelto). Se usa así:

- `renderHook(() => useDatos(url))` monta el Hook; la función que le pasas es la que se ejecuta en cada render.
- `rerender(nuevasProps)` vuelve a ejecutarlo con otros valores. Las props iniciales se pasan con la opción **`initialProps`**.
- `unmount()` lo desmonta, para probar la limpieza.
- La opción **`wrapper`** envuelve el Hook en un componente, para darle el contexto o los proveedores que necesite.

Su propia documentación avisa de que, siempre que puedas, **prefieras `render` con un componente real**: el test es más legible y comprueba lo que de verdad ve el usuario. `renderHook` encaja con Hooks reutilizables que muchos componentes comparten, como `useDatos`. Estos son los tests del Hook:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { renderHook, waitFor } from '@testing-library/react'\nimport { http, HttpResponse } from 'msw/http'\nimport { delay } from 'msw/utils/delay'\nimport { afterEach, describe, expect, it } from 'vitest'\nimport { noches } from './mocks/handlers'\nimport { server } from './mocks/server'\nimport useDatos from './useDatos'\n\nafterEach(() => server.events.removeAllListeners())\n\ndescribe('useDatos', () => {\n  it('empieza sin datos y los devuelve cuando llegan', async () => {\n    const { result } = renderHook(() => useDatos('/api/noches/1'))\n\n    expect(result.current).toEqual({ datos: null, error: null })\n\n    await waitFor(() => expect(result.current.datos).toEqual(noches[1]))\n    expect(result.current.error).toBeNull()\n  })\n\n  it('no pide nada si la url es null', async () => {\n    const peticiones = []\n    server.events.on('request:start', ({ request }) => peticiones.push(request.url))\n\n    const { result } = renderHook(() => useDatos(null))\n    await new Promise((resolve) => setTimeout(resolve, 50))\n\n    expect(result.current).toEqual({ datos: null, error: null })\n    expect(peticiones).toEqual([])\n  })\n\n  it('devuelve un error si el servidor responde con un 500', async () => {\n    server.use(http.get('/api/noches/:id', () => new HttpResponse(null, { status: 500 })))\n\n    const { result } = renderHook(() => useDatos('/api/noches/1'))\n\n    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))\n    expect(result.current.error.message).toBe('Error 500')\n    expect(result.current.datos).toBeNull()\n  })\n\n  it('al cambiar la url, no devuelve los datos de la anterior', async () => {\n    const { result, rerender } = renderHook(({ url }) => useDatos(url), {\n      initialProps: { url: '/api/noches/1' },\n    })\n    await waitFor(() => expect(result.current.datos).toEqual(noches[1]))\n\n    rerender({ url: '/api/noches/2' })\n\n    expect(result.current.datos).toBeNull()\n    await waitFor(() => expect(result.current.datos).toEqual(noches[2]))\n  })\n\n  it('una respuesta lenta de la url anterior no pisa a la nueva', async () => {\n    server.use(\n      http.get('/api/noches/1', async () => {\n        await delay(200)\n        return HttpResponse.json(noches[1])\n      }),\n    )\n    const { result, rerender } = renderHook(({ url }) => useDatos(url), {\n      initialProps: { url: '/api/noches/1' },\n    })\n\n    rerender({ url: '/api/noches/2' })\n    await waitFor(() => expect(result.current.datos).toEqual(noches[2]))\n    await delay(300)\n\n    expect(result.current.datos).toEqual(noches[2])\n  })\n})",
  "anotaciones": [
    {
      "fragmento": "afterEach(() => server.events.removeAllListeners())",
      "nota": "Los eventos de MSW sirven para espiar el tráfico. Los tests que se suscriben tienen que quitarse al terminar, para no acumular suscripciones."
    },
    {
      "fragmento": "const { result } = renderHook(() => useDatos('/api/noches/1'))",
      "nota": "Monta el Hook en un componente invisible. result.current es lo que devuelve ahora mismo, y se actualiza solo en cada render."
    },
    {
      "fragmento": "await waitFor(() => expect(result.current.datos).toEqual(noches[1]))",
      "nota": "result.current cambia cuando llega la respuesta. waitFor reintenta hasta que el valor es el esperado."
    },
    {
      "fragmento": "server.events.on('request:start', ({ request }) => peticiones.push(request.url))",
      "nota": "Apunta la url de cada petición que sale. Así se puede probar que algo no se pide: la lista queda vacía."
    },
    {
      "fragmento": "expect(result.current.error.message).toBe('Error 500')",
      "nota": "El mensaje que el Hook construye cuando respuesta.ok es false."
    },
    {
      "fragmento": "rerender({ url: '/api/noches/2' })",
      "nota": "Vuelve a ejecutar el Hook con otras props. Es el equivalente de que el componente cambie la url."
    },
    {
      "fragmento": "expect(result.current.datos).toBeNull()",
      "nota": "Justo después del rerender, antes de que llegue nada, el Hook no debería devolver los datos de la noche 1. Este es el test del fallo de antes, a nivel de Hook."
    },
    {
      "fragmento": "await delay(300)",
      "nota": "Aquí delay se usa en el test, no en un handler: espera 300 ms de verdad para comprobar que la respuesta lenta de la noche 1 no pisa a la de la noche 2. Lo evita el AbortController del Hook."
    }
  ]
}
```

Contra el `useDatos` de la lección 43, cuatro pasan y uno falla, el mismo fallo, ahora sin componente de por medio:

```text
 ✓ src/useDatos.test.js > useDatos > empieza sin datos y los devuelve cuando llegan 64ms
 ✓ src/useDatos.test.js > useDatos > no pide nada si la url es null 54ms
 ✓ src/useDatos.test.js > useDatos > devuelve un error si el servidor responde con un 500 57ms
 × src/useDatos.test.js > useDatos > al cambiar la url, no devuelve los datos de la anterior 59ms
   → expected { id: 1, …(2) } to be null
 ✓ src/useDatos.test.js > useDatos > una respuesta lenta de la url anterior no pisa a la nueva 361ms
```

Tiene sentido: la carrera de respuestas desordenadas (el último test) ya estaba cubierta por la cancelación de la lección 43, y lo que fallaba era otra cosa, los datos de la `url` anterior. Con el Hook corregido, los cinco pasan:

```text
 ✓ src/useDatos.test.js > useDatos > empieza sin datos y los devuelve cuando llegan 64ms
 ✓ src/useDatos.test.js > useDatos > no pide nada si la url es null 53ms
 ✓ src/useDatos.test.js > useDatos > devuelve un error si el servidor responde con un 500 57ms
 ✓ src/useDatos.test.js > useDatos > al cambiar la url, no devuelve los datos de la anterior 110ms
 ✓ src/useDatos.test.js > useDatos > una respuesta lenta de la url anterior no pisa a la nueva 360ms
```

### Un Hook con proveedores: el ejemplo real de esta web

Los Hooks de esta web (`useComments`, `useLecciones`...) envuelven TanStack Query, que necesita un `QueryClientProvider`. Su test usa justo la opción `wrapper` y un `act` para la mutación. Este es el de `src/lib/hooks/useComments.test.tsx`, recortado:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/lib/hooks/useComments.test.tsx (recortado)\nfunction wrapperFor(client: QueryClient) {\n  return function Wrapper({ children }: { children: ReactNode }): ReactElement {\n    return <QueryClientProvider client={client}>{children}</QueryClientProvider>\n  }\n}\n\nit('invalidates the lesson comments after creating a comment', async () => {\n  const client = new QueryClient({\n    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },\n  })\n  client.setQueryData(queryKeys.comments('leccion-1'), [])\n  const { result } = renderHook(() => useCreateComment(), {\n    wrapper: wrapperFor(client),\n  })\n\n  await act(() =>\n    result.current.mutateAsync({ leccionId: 'leccion-1', body: 'Buen contenido' }),\n  )\n\n  expect(client.getQueryState(queryKeys.comments('leccion-1'))?.isInvalidated).toBe(true)\n})",
  "anotaciones": [
    {
      "fragmento": "function wrapperFor(client: QueryClient) {",
      "nota": "Una función que fabrica el envoltorio con el cliente que pasa cada test. Cada test crea el suyo, para que no compartan caché."
    },
    {
      "fragmento": "defaultOptions: { queries: { retry: false }, mutations: { retry: false } },",
      "nota": "Sin reintentos: en un test, un fallo tiene que verse enseguida y no tras tres reintentos con espera. Es un ajuste típico al probar TanStack Query (lección 78)."
    },
    {
      "fragmento": "wrapper: wrapperFor(client),",
      "nota": "La opción wrapper de renderHook: el Hook se monta dentro del proveedor, como en la aplicación real."
    },
    {
      "fragmento": "await act(() =>",
      "nota": "act aplica las actualizaciones de React que provoque la mutación antes de seguir. Aquí se llama a mano porque mutateAsync se invoca desde el test y no desde un evento que Testing Library ya envuelva."
    },
    {
      "fragmento": "expect(client.getQueryState(queryKeys.comments('leccion-1'))?.isInvalidated).toBe(true)",
      "nota": "Aquí el test mira el estado de la caché del cliente, no la pantalla: es un Hook sin pantalla, así que lo observable es su efecto."
    }
  ]
}
```

## Relojes falsos: probar el tiempo sin esperarlo

La retención de la plaza dura cinco minutos. No vamos a hacer esperar cinco minutos a un test. **`vi.useFakeTimers()` sustituye `setTimeout`, `setInterval` y `Date` por versiones controladas por Vitest**, y `vi.advanceTimersByTime(ms)` hace avanzar ese reloj lo que quieras, al instante. El componente de la cuenta atrás es este:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Retencion({ segundos = 300 }) {\n  const [restantes, setRestantes] = useState(segundos)\n\n  useEffect(() => {\n    if (restantes <= 0) return\n    const id = setTimeout(() => setRestantes(restantes - 1), 1000)\n    return () => clearTimeout(id)\n  }, [restantes])\n\n  if (restantes <= 0) return <p role=\"alert\">La retención ha caducado.</p>\n\n  const minutos = Math.floor(restantes / 60)\n  const resto = String(restantes % 60).padStart(2, '0')\n  return (\n    <div>\n      <p>\n        Plaza retenida durante {minutos}:{resto}\n      </p>\n      <button type=\"button\" onClick={() => setRestantes(restantes + 60)}>\n        Prolongar un minuto\n      </button>\n    </div>\n  )\n}",
  "anotaciones": [
    {
      "fragmento": "const id = setTimeout(() => setRestantes(restantes - 1), 1000)",
      "nota": "Un temporizador de un segundo que baja el contador. Cada segundo lo programa un efecto, y el efecto se vuelve a crear cuando cambia restantes."
    },
    {
      "fragmento": "return () => clearTimeout(id)",
      "nota": "La limpieza del efecto, de la lección 40: si el componente se desmonta o restantes cambia, el temporizador pendiente se cancela."
    },
    {
      "fragmento": "if (restantes <= 0) return <p role=\"alert\">La retención ha caducado.</p>",
      "nota": "Al llegar a cero, el componente cambia a un aviso. Es lo que se quiere comprobar sin esperar 300 segundos."
    }
  ]
}
```

La primera idea de un test es avanzar el reloj y mirar. Dos intentos, uno por tema: avanzar **sin `act`**, y avanzar los cinco minutos **de golpe**:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { act, render, screen } from '@testing-library/react'\nimport { afterEach, beforeEach, expect, it, vi } from 'vitest'\nimport Retencion from './Retencion'\n\nbeforeEach(() => vi.useFakeTimers())\nafterEach(() => vi.useRealTimers())\n\nit('avanza el reloj sin act', () => {\n  render(<Retencion segundos={300} />)\n\n  vi.advanceTimersByTime(1000)\n\n  expect(screen.getByText('Plaza retenida durante 4:59')).toBeInTheDocument()\n})\n\nit('avanza cinco minutos de golpe', async () => {\n  render(<Retencion segundos={300} />)\n\n  await act(() => vi.advanceTimersByTime(300_000))\n\n  expect(screen.getByRole('alert')).toHaveTextContent('La retención ha caducado.')\n})",
  "anotaciones": [
    {
      "fragmento": "beforeEach(() => vi.useFakeTimers())",
      "nota": "Activa los relojes falsos antes de cada test."
    },
    {
      "fragmento": "afterEach(() => vi.useRealTimers())",
      "nota": "Los devuelve a la normalidad al acabar. Si se te olvida, los relojes falsos se quedan activos para el resto del archivo (lo verás en Errores típicos)."
    },
    {
      "fragmento": "vi.advanceTimersByTime(1000)",
      "nota": "Hace avanzar el reloj falso un segundo: el temporizador de Retencion se dispara y llama a setRestantes. Pero lo hace fuera de act."
    },
    {
      "fragmento": "await act(() => vi.advanceTimersByTime(300_000))",
      "nota": "Ahora dentro de act (con await, que es lo que recomienda React), pero los cinco minutos de golpe."
    }
  ]
}
```

```text
stderr | src/Retencion.intentos.test.jsx > avanza el reloj sin act
An update to Retencion inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act

 × src/Retencion.intentos.test.jsx > avanza el reloj sin act 15ms
   → Unable to find an element with the text: Plaza retenida durante 4:59. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

  …

 × src/Retencion.intentos.test.jsx > avanza cinco minutos de golpe 59ms
   → Unable to find an accessible element with the role "alert"

  …
```

Dos fallos distintos y los dos instructivos:

**1. React avisa de que el cambio de estado no está dentro de `act`**, y el DOM sigue en «5:00». Una actualización de estado que ocurre fuera de `act` no se aplica al DOM hasta que React lo decide; en un test, hay que decirle «aplica ahora». `act` hace justo eso: ejecuta lo que le pasas y aplica todas las actualizaciones de React pendientes. (La documentación de React lo resume como un ayudante para aplicar las actualizaciones pendientes antes de hacer comprobaciones, y recomienda su forma asíncrona, `await act(...)`, que es la que usamos.) Testing Library ya envuelve en `act` sus propias funciones; cuando avanzas el reloj tú, tienes que hacerlo tú.

**2. Cinco minutos de golpe no funcionan ni dentro de `act`.** Cada segundo lo programa un efecto *después* de que React renderice el componente con el valor nuevo. Dentro de un único `act`, React no vuelve a renderizar entre un segundo y el siguiente, así que el temporizador de «4:59» no existe todavía cuando el reloj falso pasa por él: solo se dispara el primero. **Un temporizador que se vuelve a programar desde un efecto se prueba avanzando de segundo en segundo, cada paso en su propio `act`.**

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { act, render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'\nimport Retencion from './Retencion'\n\n// Cada segundo lo programa un efecto, y el efecto se crea al renderizar: por eso\n// el reloj avanza segundo a segundo, y cada paso dentro de su propio act.\nasync function pasar(segundos) {\n  for (let i = 0; i < segundos; i++) await act(() => vi.advanceTimersByTime(1000))\n}\n\ndescribe('Retencion', () => {\n  beforeEach(() => vi.useFakeTimers())\n  afterEach(() => vi.useRealTimers())\n\n  it('cuenta atrás de segundo en segundo', async () => {\n    render(<Retencion segundos={300} />)\n    expect(screen.getByText('Plaza retenida durante 5:00')).toBeInTheDocument()\n\n    await pasar(1)\n\n    expect(screen.getByText('Plaza retenida durante 4:59')).toBeInTheDocument()\n  })\n\n  it('caduca a los cinco minutos, sin esperar cinco minutos', async () => {\n    render(<Retencion segundos={300} />)\n\n    await pasar(299)\n    expect(screen.queryByRole('alert')).not.toBeInTheDocument()\n\n    await pasar(1)\n    expect(screen.getByRole('alert')).toHaveTextContent('La retención ha caducado.')\n  })\n\n  it('prolongar suma un minuto (user-event con relojes falsos)', async () => {\n    vi.useFakeTimers({ shouldAdvanceTime: true })\n    const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })\n    render(<Retencion segundos={300} />)\n\n    await usuario.click(screen.getByRole('button', { name: 'Prolongar un minuto' }))\n\n    expect(screen.getByText('Plaza retenida durante 6:00')).toBeInTheDocument()\n  })\n})",
  "anotaciones": [
    {
      "fragmento": "function pasar(segundos) {",
      "nota": "Una función de ayuda: avanza el reloj segundo a segundo, cada uno en su propio act, para que React renderice y programe el siguiente temporizador entre medias."
    },
    {
      "fragmento": "pasar(299)",
      "nota": "Casi cinco minutos: a un segundo de caducar, todavía no hay aviso. queryByRole, porque se comprueba una ausencia."
    },
    {
      "fragmento": "pasar(1)",
      "nota": "El último segundo. El aviso aparece, y el test tardó milisegundos en vez de cinco minutos."
    },
    {
      "fragmento": "vi.useFakeTimers({ shouldAdvanceTime: true })",
      "nota": "Esta variante deja que el reloj falso avance también con el paso del tiempo real. Es necesaria con user-event, y enseguida verás por qué."
    },
    {
      "fragmento": "userEvent.setup({ advanceTimers: vi.advanceTimersByTime })",
      "nota": "user-event espera un instante entre acciones. Con relojes falsos, su documentación pide pasarle la función que avanza el reloj de tu ejecutor de tests: aquí, la de Vitest."
    }
  ]
}
```

```text
 ✓ src/Retencion.test.jsx > Retencion > cuenta atrás de segundo en segundo 14ms
 ✓ src/Retencion.test.jsx > Retencion > caduca a los cinco minutos, sin esperar cinco minutos 68ms
 ✓ src/Retencion.test.jsx > Retencion > prolongar suma un minuto (user-event con relojes falsos) 22ms
```

### El cuidado con user-event y los relojes falsos

El tercer test es el delicado. La documentación de `user-event` dice que, con relojes falsos, hay que pasar la opción `advanceTimers` con la función que avanza el reloj de tu ejecutor (`jest.advanceTimersByTime` en su ejemplo, `vi.advanceTimersByTime` en Vitest). Y también dice que no se aconseja la salida fácil de poner `delay: null`. Pero hacer solo eso, en Vitest, no es suficiente. Este test sigue la documentación al pie de la letra:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { afterEach, beforeEach, expect, it, vi } from 'vitest'\nimport Retencion from './Retencion'\n\nbeforeEach(() => vi.useFakeTimers())\nafterEach(() => vi.useRealTimers())\n\nit('user-event con relojes falsos', async () => {\n  const usuario = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })\n  render(<Retencion segundos={300} />)\n\n  await usuario.click(screen.getByRole('button', { name: 'Prolongar un minuto' }))\n\n  expect(screen.getByText('Plaza retenida durante 6:00')).toBeInTheDocument()\n})",
  "anotaciones": [
    {
      "fragmento": "beforeEach(() => vi.useFakeTimers())",
      "nota": "Relojes falsos normales, como en el resto de la lección."
    },
    {
      "fragmento": "userEvent.setup({ advanceTimers: vi.advanceTimersByTime })",
      "nota": "Exactamente lo que dice la documentación de user-event."
    },
    {
      "fragmento": "await usuario.click(screen.getByRole('button', { name: 'Prolongar un minuto' }))",
      "nota": "Se queda esperando para siempre, hasta que Vitest corta el test a los 5 segundos."
    }
  ]
}
```

```text
 × src/Retencion.user-event.test.jsx > user-event con relojes falsos 5014ms
   → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
```

El test no falla con un error claro: **se cuelga y Vitest lo corta a los cinco segundos**. La causa está en Testing Library: tras cada acción asíncrona (como un `click` de user-event), espera un instante con un `setTimeout` de 0 milisegundos para dejar que se resuelvan las promesas pendientes, y solo avanza el reloj falso por su cuenta si detecta los relojes falsos de **Jest**, mirando que exista el objeto global `jest`. En Vitest no existe, así que ese `setTimeout` de 0 ms usa el reloj falso y no se dispara nunca. (Lo he comprobado leyendo su código y ejecutándolo.)

La salida más sencilla es **`vi.useFakeTimers({ shouldAdvanceTime: true })`**, que hace que el reloj falso avance también con el tiempo real, y así ese `setTimeout` de 0 ms termina. Es lo que lleva el tercer test de arriba. El mismo problema afecta a los `findBy` y `waitFor`, porque también usan temporizadores:

```text
 × src/PlazasRefugio.relojes.test.jsx > findBy con relojes falsos 5006ms
   → Test timed out in 5000ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ✓ src/PlazasRefugio.relojes.test.jsx > findBy con relojes falsos que avanzan solos 23ms
```

El primer test (`vi.useFakeTimers()` sin más) se cuelga; el segundo, con `shouldAdvanceTime: true`, pasa. Por eso la regla práctica es: **usa relojes falsos solo en los tests que de verdad lo necesitan, y no los mezcles con `findBy` ni `waitFor` sin `shouldAdvanceTime`**. Para esperar a una respuesta de red no hace falta ningún reloj falso: MSW responde casi al instante.

## Errores típicos

**1. Esperar con un `setTimeout` en vez de con `findBy`.** Parece que funciona, y el test pasa, pero React se queja y el test depende de que 100 ms sean suficientes en cualquier máquina:

```jsx
render(<PlazasRefugio />)

await new Promise((resolve) => setTimeout(resolve, 100))

expect(screen.getByText(/Quedan 6 plazas/)).toBeInTheDocument()
```

```text
stderr | src/PlazasRefugio.espera.test.jsx > espera con un setTimeout en vez de con findBy
An update to PlazasRefugio inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://react.dev/link/wrap-tests-with-act
```

El test pasa (✓), pero la consola dice que el cambio de estado ocurrió fuera de `act`: el `setTimeout` de verdad no es una espera que Testing Library conozca ni envuelva. `findBy` y `waitFor` sí, y evitan el aviso. Si el aviso aparece, casi siempre falta un `findBy` o un `await`.

**2. Una petición sin handler.** Con `onUnhandledFrame: 'error'`, MSW rechaza cualquier petición que no reconoce y te dice cuál es. Este test pide `/api/refugios`, que no existe en los handlers:

```text
stderr | src/useDatos.sin-handler.test.js > pide una ruta que ningún handler conoce
[MSW] Error: intercepted a request without a matching request handler:

  • GET /api/refugios

If you still wish to intercept this unhandled request, please create a request handler for it.
Read more: https://mswjs.io/docs/http/intercepting-requests
```

Fíjate en dos cosas: el aviso sale por `stderr` y **el test pasa** (✓), porque el Hook convierte el rechazo en un error y el test solo comprobaba que hubiera alguno. Mira siempre lo que imprime MSW. Y si quieres que una petición inesperada rompa el test, comprueba el mensaje de error concreto, no solo que haya error.

**3. Olvidar `resetHandlers`.** Un `server.use` que fuerza un 500 en un test seguiría activo en todos los siguientes. La documentación de MSW lo dice así: `resetHandlers` quita los handlers añadidos con `.use()` para que cada test tenga una red aislada. Va en el `afterEach` del archivo de preparación.

**4. No devolver los relojes falsos.** Si un test llama a `vi.useFakeTimers()` y no los devuelve, el siguiente test del archivo hereda un reloj parado, y su `findBy` se cuelga. Este es el resultado real de dos tests seguidos, el primero olvidando `vi.useRealTimers()`:

```text
✓ src/relojes-olvidados.test.jsx > usa relojes falsos y se olvida de devolverlos 1ms
× src/relojes-olvidados.test.jsx > el siguiente test espera con findBy 5010ms
  → Test timed out in 5000ms.
```

El fallo aparece en un test que no tiene nada que ver con el que provocó el problema. Por eso se pone el `useRealTimers` en un `afterEach` y no se deja a cada test.

**5. Un `getBy` justo después de `render` para algo que carga.** Es el primer predice de la lección: `getBy` no espera. Usa `findBy`.

## Ejercicios

El ejercicio es el que dejamos pendiente: **arreglar `useDatos`** para que, al cambiar de noche, no se vea el dato de la anterior. Las comprobaciones de la web son como los tests de esta lección: eligen otra noche con la red a 400 ms y comprueban qué se ve *mientras* llega la respuesta. El código inicial es el Hook de la lección 43.

Pista: guarda en un solo estado los datos, el error **y la `url` a la que pertenecen**; y en lo que devuelve el Hook, si esa `url` no es la actual, devuelve `{ datos: null, error: null }`.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "useDatos no puede enseñar los datos de otra noche",
  "consigna": "Arregla useDatos.jsx para que, al elegir otra noche, el texto de plazas pase a «Cargando disponibilidad…» hasta que llegue la respuesta de la nueva noche. Elige «Sábado 15» y comprueba que ya no se queda el dato del viernes.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import PlazasRefugio from './PlazasRefugio'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <PlazasRefugio segundosRetencion={10} />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "PlazasRefugio.jsx",
      "codigo": "import { useState } from 'react'\nimport Retencion from './Retencion'\nimport useDatos from './useDatos'\n\nexport default function PlazasRefugio({ segundosRetencion = 300 }) {\n  const [nocheId, setNocheId] = useState('1')\n  const { datos: noche, error } = useDatos(`/api/noches/${nocheId}`)\n  const [reserva, setReserva] = useState(null)\n  const [fallo, setFallo] = useState('')\n\n  async function reservar() {\n    setFallo('')\n    const respuesta = await fetch('/api/reservas', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ noche: Number(nocheId) }),\n    })\n    if (!respuesta.ok) {\n      setFallo('No se pudo hacer la reserva.')\n      return\n    }\n    setReserva(await respuesta.json())\n  }\n\n  return (\n    <section aria-labelledby=\"titulo-refugio\">\n      <h2 id=\"titulo-refugio\">Refugio de Góriz</h2>\n      <label>\n        Noche\n        <select\n          value={nocheId}\n          onChange={(e) => {\n            setNocheId(e.target.value)\n            setReserva(null)\n          }}\n        >\n          <option value=\"1\">Viernes 14</option>\n          <option value=\"2\">Sábado 15</option>\n        </select>\n      </label>\n      {error && <p role=\"alert\">No se pudo cargar la disponibilidad.</p>}\n      {!error && !noche && <p>Cargando disponibilidad…</p>}\n      {noche && (\n        <p>\n          {noche.plazasLibres > 0\n            ? `Quedan ${noche.plazasLibres} plazas la noche del ${noche.fecha}.`\n            : `La noche del ${noche.fecha} está completa.`}\n        </p>\n      )}\n      <button type=\"button\" onClick={reservar} disabled={!noche || noche.plazasLibres === 0}>\n        Reservar plaza\n      </button>\n      {fallo && <p role=\"alert\">{fallo}</p>}\n      {reserva && (\n        <>\n          <p role=\"status\">Reserva nº {reserva.id} confirmada.</p>\n          <Retencion segundos={segundosRetencion} />\n        </>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "Retencion.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function Retencion({ segundos = 300 }) {\n  const [restantes, setRestantes] = useState(segundos)\n\n  useEffect(() => {\n    if (restantes <= 0) return\n    const id = setTimeout(() => setRestantes(restantes - 1), 1000)\n    return () => clearTimeout(id)\n  }, [restantes])\n\n  if (restantes <= 0) return <p role=\"alert\">La retención ha caducado.</p>\n\n  const minutos = Math.floor(restantes / 60)\n  const resto = String(restantes % 60).padStart(2, '0')\n  return (\n    <div>\n      <p>\n        Plaza retenida durante {minutos}:{resto}\n      </p>\n      <button type=\"button\" onClick={() => setRestantes(restantes + 60)}>\n        Prolongar un minuto\n      </button>\n    </div>\n  )\n}\n"
    },
    {
      "nombre": "useDatos.jsx",
      "codigo": "import { useEffect, useState } from 'react'\n\nexport default function useDatos(url) {\n  const [datos, setDatos] = useState(null)\n  const [error, setError] = useState(null)\n\n  useEffect(() => {\n    if (!url) return\n    const control = new AbortController()\n    fetch(url, { signal: control.signal })\n      .then((respuesta) => {\n        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`)\n        return respuesta.json()\n      })\n      .then((recibidos) => {\n        setDatos(recibidos)\n        setError(null)\n      })\n      .catch((motivo) => {\n        if (motivo.name !== 'AbortError') setError(motivo)\n      })\n    return () => control.abort()\n  }, [url])\n\n  return { datos, error }\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 32rem;\n  font-family: system-ui, sans-serif;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  color: #14532d;\n  font-size: 1.25rem;\n}\n\nlabel {\n  display: inline-grid;\n  gap: 0.2rem;\n  margin-bottom: 0.5rem;\n}\n\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  font: inherit;\n}\n\nbutton {\n  padding: 0.4rem 0.9rem;\n  border: 1px solid #15803d;\n  border-radius: 6px;\n  background: #15803d;\n  color: white;\n  font: inherit;\n  cursor: pointer;\n}\n\nbutton:disabled {\n  border-color: #94a3b8;\n  background: #94a3b8;\n  cursor: not-allowed;\n}\n\n[role='alert'] {\n  color: #b91c1c;\n}\n\n[role='status'] {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #dcfce7;\n}\n"
    }
  ],
  "archivoInicial": "useDatos.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "api": {
    "noches": [
      {
        "id": 1,
        "fecha": "viernes 14 de agosto",
        "plazasLibres": 6
      },
      {
        "id": 2,
        "fecha": "sábado 15 de agosto",
        "plazasLibres": 0
      }
    ],
    "reservas": [
      {
        "id": 100,
        "noche": 1
      }
    ]
  },
  "red": {
    "latencia": 400
  },
  "comprobaciones": [
    {
      "descripcion": "Al abrir, se muestran las plazas de la noche del viernes",
      "pasos": [],
      "espera": {
        "texto": "Quedan 6 plazas la noche del viernes 14 de agosto."
      }
    },
    {
      "descripcion": "Al elegir otra noche, mientras llega la respuesta se vuelve a ver «Cargando disponibilidad…»",
      "pasos": [
        {
          "pulsar": {
            "texto": "Quedan 6 plazas la noche del viernes 14 de agosto."
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Noche",
            "opcion": "Sábado 15"
          }
        }
      ],
      "espera": {
        "texto": "Cargando disponibilidad…"
      }
    },
    {
      "descripcion": "Cuando llega la respuesta, el sábado aparece como completo",
      "pasos": [
        {
          "pulsar": {
            "texto": "Quedan 6 plazas la noche del viernes 14 de agosto."
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Noche",
            "opcion": "Sábado 15"
          }
        }
      ],
      "espera": {
        "texto": "La noche del sábado 15 de agosto está completa."
      }
    },
    {
      "descripcion": "Al volver al viernes, se ven otra vez sus seis plazas",
      "pasos": [
        {
          "pulsar": {
            "texto": "Quedan 6 plazas la noche del viernes 14 de agosto."
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Noche",
            "opcion": "Sábado 15"
          }
        },
        {
          "pulsar": {
            "texto": "La noche del sábado 15 de agosto está completa."
          }
        },
        {
          "seleccionar": {
            "etiqueta": "Noche",
            "opcion": "Viernes 14"
          }
        }
      ],
      "espera": {
        "texto": "Quedan 6 plazas la noche del viernes 14 de agosto."
      }
    },
    {
      "descripcion": "Si la carga inicial falla, aparece el aviso de error",
      "pasos": [
        {
          "red": "fallar-siguiente"
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "No se pudo cargar la disponibilidad."
      }
    }
  ]
}
```

Cuando lo tengas, el test de Vitest del Hook que viste antes habría pasado de rojo a verde. **Tener el test escrito antes que el arreglo es una de las ventajas de probar**: sabes cuándo has terminado.

### Retos para seguir practicando

Estos no tienen comprobación automática; son para tu proyecto de Vite con `npx vitest`.

1. Añade un test que use `{ once: true }`: el primer `GET` devuelve un 500 y el siguiente, 200. Es la base de un botón «Reintentar»: ¿qué cambiarías en el componente para que lo tenga y qué comprobarías?
2. Usa `await delay('infinite')` en un handler y comprueba que, mientras no llega nada, el componente sigue enseñando «Cargando disponibilidad…» y el botón «Reservar plaza» está desactivado.
3. Escribe un test de `renderHook` para un Hook tuyo que no pida nada, como un `useContador` con `incrementar` y `reiniciar`. Necesitarás `act` para llamar a `result.current.incrementar()`.
4. Reto: prueba que «Prolongar un minuto» suma un minuto a lo que quede. Monta `Retencion` con 10 segundos, deja pasar 5, pulsa el botón y comprueba que marca «1:05». Necesitarás `shouldAdvanceTime: true` y `advanceTimers`; pasa el reloj con la función de ayuda de la lección.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "Async Methods (findBy, waitFor, waitForElementToBeRemoved)",
      "descripcion": "Los valores por defecto de timeout e intervalo, y por qué el callback de waitFor tiene que lanzar un error.",
      "url": "https://testing-library.com/docs/dom-testing-library/api-async",
      "etiqueta": "Testing Library"
    },
    {
      "titulo": "React Testing Library: API (renderHook)",
      "descripcion": "renderHook con initialProps, rerender, unmount y wrapper, y su aviso de preferir render con un componente real.",
      "url": "https://testing-library.com/docs/react-testing-library/api",
      "etiqueta": "Testing Library"
    },
    {
      "titulo": "MSW: Quick start",
      "descripcion": "La instalación para Node con Vitest, que es la que usa esta lección.",
      "url": "https://mswjs.io/docs/quick-start",
      "etiqueta": "MSW"
    },
    {
      "titulo": "MSW: Network behavior overrides",
      "descripcion": "server.use, overrides permanentes y de un solo uso, y resetHandlers.",
      "url": "https://mswjs.io/docs/best-practices/network-behavior-overrides",
      "etiqueta": "MSW"
    },
    {
      "titulo": "Vitest: Timers",
      "descripcion": "vi.useFakeTimers, advanceTimersByTime y las opciones como shouldAdvanceTime.",
      "url": "https://vitest.dev/guide/mocking/timers",
      "etiqueta": "Vitest"
    },
    {
      "titulo": "user-event: Options (advanceTimers)",
      "descripcion": "La opción que sincroniza user-event con los relojes falsos de tu ejecutor.",
      "url": "https://testing-library.com/docs/user-event/options",
      "etiqueta": "Testing Library"
    }
  ]
}
```
