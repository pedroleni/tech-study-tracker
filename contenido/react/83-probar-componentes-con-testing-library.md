# Probar componentes con Testing Library

- **Módulo:** Calidad y producción
- **Slug:** `probar-componentes-con-testing-library` (autogenerado del título)
- **Orden:** 830
- **Fuentes:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) + [user-event](https://testing-library.com/docs/user-event/intro) + [act](https://react.dev/reference/react/act) — ver `contenido/react/TEMARIO.md` #83

---

## Qué es y para qué sirve

Hasta ahora has comprobado tus componentes de la forma más directa: abrirlos en el navegador, pulsar, mirar. Es lo que hacen los ✅/❌ de los ejercicios de este temario, solo que automatizado. **Un test de componente hace eso mismo, sin navegador y en milisegundos, cada vez que cambias el código**: monta el componente, hace lo que haría una persona (escribir, pulsar, elegir) y comprueba lo que la persona vería. Si mañana tocas el cálculo del precio y rompes el aviso de error, el test se pone en rojo antes de que lo vea nadie.

La librería que se usa casi siempre para esto con React es **Testing Library**, y su idea guía cabe en una frase de su documentación: *cuanto más se parezcan tus tests a cómo se usa tu software, más confianza te dan*. Por eso no te deja (o no te anima a) mirar el estado de un componente ni sus Hooks: te da formas de **encontrar elementos como los encontraría una persona** (por su rol, su etiqueta, su texto) y de **manejarlos como los manejaría ella** (clics y teclas de verdad).

Estas son las piezas que vas a usar, y qué hace cada una:

- **Vitest**: el ejecutor de tests (el *test runner*). Es el que acompaña a Vite y el que usa esta misma web. Busca los archivos `*.test.jsx`, los ejecuta y te cuenta qué ha pasado.
- **jsdom**: un DOM de mentira que vive dentro de Node. Los componentes se montan ahí, sin abrir ningún navegador.
- **`@testing-library/react`**: `render` para montar un componente y `screen` para buscar en lo que se ha montado.
- **`@testing-library/user-event`**: simula a la persona (teclear, pulsar, tabular).
- **`@testing-library/jest-dom`**: añade comprobadores que entienden el DOM (`toBeDisabled`, `toHaveTextContent`...).
- **`@testing-library/dom`**: el motor de consultas que hay debajo de todo. Es una dependencia que instalas tú aparte.

```laboratorio
{
  "tipo": "callout",
  "variante": "info",
  "titulo": "Todo lo de esta lección está ejecutado de verdad",
  "contenido": "Las pruebas de esta lección se han ejecutado en un proyecto de Vite con React 19.3.1, Vitest 5.0.5, Testing Library React 16.3.3, user-event 14.6.8, jest-dom 7.0.1, jsdom 28.1.0 y vitest-axe 0.1.0 (comprobado el 21 de octubre de 2026). Las salidas que verás en rojo y en verde son copias de Vitest, solo recortadas. Aquí no hay un editor de tests: los componentes sí funcionan en la vista previa, pero los tests los ejecutas tú en tu proyecto, como en la lección 2."
}
```

## El componente que vamos a probar

Los Kayaks del Cinca alquilan piraguas en el embalse de Mediano. Su formulario de reserva calcula el precio según la ruta, las personas y los chalecos, y avisa si falta el nombre. Pruébalo con las manos antes de probarlo con código: **para escribir un buen test, primero tienes que saber qué ve y qué hace quien lo usa**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La reserva de kayaks, funcionando",
  "consigna": "Cambia la ruta, las personas y los chalecos y mira cómo cambia el total. Pulsa «Reservar» sin nombre y después con nombre. Intenta escribir un nombre de más de 12 letras: el campo no te deja.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import ReservaKayak from './ReservaKayak'\nimport './estilos.css'\n\nexport default function App() {\n  return (\n    <main>\n      <ReservaKayak />\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "ReservaKayak.jsx",
      "codigo": "import { useState } from 'react'\n\nconst euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })\nconst PRECIOS = { tranquila: 18, aventura: 26 }\n\nexport default function ReservaKayak({ onReservar }) {\n  const [nombre, setNombre] = useState('')\n  const [personas, setPersonas] = useState(1)\n  const [ruta, setRuta] = useState('tranquila')\n  const [chalecos, setChalecos] = useState(false)\n  const [error, setError] = useState('')\n  const [reserva, setReserva] = useState(null)\n\n  const total = PRECIOS[ruta] * personas + (chalecos ? 2 * personas : 0)\n\n  function manejarEnvio(evento) {\n    evento.preventDefault()\n    if (nombre.trim() === '') {\n      setError('Escribe tu nombre para reservar.')\n      return\n    }\n    setError('')\n    const nueva = { nombre: nombre.trim(), personas, ruta, total }\n    setReserva(nueva)\n    onReservar?.(nueva)\n  }\n\n  return (\n    <section aria-labelledby=\"titulo-reserva\">\n      <h2 id=\"titulo-reserva\">Reserva tu kayak en el Cinca</h2>\n      <form onSubmit={manejarEnvio} noValidate>\n        <label>\n          Nombre\n          <input value={nombre} maxLength={12} onChange={(e) => setNombre(e.target.value)} />\n        </label>\n        <label>\n          Personas\n          <input\n            type=\"number\"\n            min={1}\n            max={4}\n            value={personas}\n            onChange={(e) => setPersonas(Number(e.target.value))}\n          />\n        </label>\n        <label>\n          Ruta\n          <select value={ruta} onChange={(e) => setRuta(e.target.value)}>\n            <option value=\"tranquila\">Tranquila (18 € por persona)</option>\n            <option value=\"aventura\">Aventura (26 € por persona)</option>\n          </select>\n        </label>\n        <label>\n          <input type=\"checkbox\" checked={chalecos} onChange={(e) => setChalecos(e.target.checked)} />\n          Alquilar chalecos (2 € por persona)\n        </label>\n        <p>Total: {euros.format(total)}</p>\n        {error && <p role=\"alert\">{error}</p>}\n        <button type=\"submit\">Reservar</button>\n      </form>\n      {reserva && (\n        <p role=\"status\">\n          Reserva hecha a nombre de {reserva.nombre}: {reserva.personas} persona(s), ruta {reserva.ruta}.\n        </p>\n      )}\n    </section>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh2 {\n  margin: 0 0 0.75rem;\n  color: #075985;\n  font-size: 1.25rem;\n}\n\nform {\n  display: grid;\n  gap: 0.6rem;\n}\n\nlabel {\n  display: grid;\n  gap: 0.2rem;\n}\n\nlabel:has(input[type='checkbox']) {\n  display: flex;\n  align-items: center;\n  gap: 0.4rem;\n}\n\ninput,\nselect {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  font: inherit;\n}\n\ninput[type='checkbox'] {\n  width: auto;\n}\n\nbutton {\n  justify-self: start;\n  padding: 0.4rem 0.9rem;\n  border: 1px solid #0369a1;\n  border-radius: 6px;\n  background: #0369a1;\n  color: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n[role='alert'] {\n  margin: 0;\n  color: #b91c1c;\n}\n\n[role='status'] {\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #e0f2fe;\n}\n"
    }
  ],
  "archivoInicial": "ReservaKayak.jsx",
  "strictMode": true,
  "mostrarConsola": false
}
```

Fíjate en lo que no aparece en ese listado: el estado (`personas`, `chalecos`), los nombres de las funciones, las clases CSS. **Una persona no ve nada de eso, y por tanto tus tests tampoco deberían depender de ello.** Ve un título, cuatro campos con su etiqueta, un total, un botón, y a veces un aviso o una confirmación.

## Montar el entorno, una vez por proyecto

En un proyecto de Vite (lección 2) se instala todo como dependencias de desarrollo:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

Después hacen falta dos archivos pequeños: la configuración de Vitest y un archivo de preparación que se ejecuta antes de cada archivo de tests.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "// vitest.config.js\nimport { defineConfig } from 'vitest/config'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n  test: {\n    environment: 'jsdom',\n    globals: true,\n    setupFiles: './src/setup.js',\n  },\n})\n\n// src/setup.js\nimport '@testing-library/jest-dom/vitest'\n",
  "anotaciones": [
    {
      "fragmento": "environment: 'jsdom'",
      "nota": "Vitest ejecuta los tests en Node, que no tiene document ni window. Con jsdom, Node recibe un DOM simulado donde se pueden montar los componentes."
    },
    {
      "fragmento": "globals: true",
      "nota": "Hace que describe, it, expect, beforeAll o afterEach existan sin importarlos. Importa más de lo que parece: Testing Library registra por sí sola la limpieza entre tests solo si encuentra un afterEach global. Sin esta línea, los componentes de un test se quedan montados para el siguiente (lo verás en Errores típicos)."
    },
    {
      "fragmento": "setupFiles: './src/setup.js'",
      "nota": "Archivos que Vitest ejecuta antes de cada archivo de tests. Ahí van las preparaciones que quieres tener siempre."
    },
    {
      "fragmento": "import '@testing-library/jest-dom/vitest'",
      "nota": "Registra en expect los comprobadores de jest-dom: toBeInTheDocument, toBeDisabled, toHaveTextContent... El nombre dice jest porque nació para Jest; la ruta /vitest los engancha a Vitest."
    }
  ]
}
```

Los tests se ejecutan con `npx vitest run` (una vez y termina) o con `npx vitest` (se queda vigilando y repite al guardar). Vitest busca los archivos que acaban en `.test.jsx`, `.test.js` y similares.

## Tu primer test

Un test de componente siempre tiene tres tiempos, que a veces se llaman **preparar, actuar y comprobar** (la palabra `act` de React sale de ahí, de *Arrange-Act-Assert*): montas el componente, haces lo que haría la persona y compruebas lo que ve. Este archivo prueba tres comportamientos de la reserva:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { describe, expect, it, vi } from 'vitest'\nimport ReservaKayak from './ReservaKayak'\n\ndescribe('ReservaKayak', () => {\n  it('calcula el total según la ruta, las personas y los chalecos', async () => {\n    const usuario = userEvent.setup()\n    render(<ReservaKayak />)\n    expect(screen.getByText('Total: 18,00 €')).toBeInTheDocument()\n\n    await usuario.selectOptions(screen.getByLabelText('Ruta'), 'aventura')\n    await usuario.clear(screen.getByLabelText('Personas'))\n    await usuario.type(screen.getByLabelText('Personas'), '3')\n    await usuario.click(screen.getByRole('checkbox', { name: /chalecos/i }))\n\n    expect(screen.getByText('Total: 84,00 €')).toBeInTheDocument()\n  })\n\n  it('no deja reservar sin nombre', async () => {\n    const usuario = userEvent.setup()\n    const alReservar = vi.fn()\n    render(<ReservaKayak onReservar={alReservar} />)\n    expect(screen.queryByRole('alert')).not.toBeInTheDocument()\n\n    await usuario.click(screen.getByRole('button', { name: 'Reservar' }))\n\n    expect(screen.getByRole('alert')).toHaveTextContent('Escribe tu nombre')\n    expect(alReservar).not.toHaveBeenCalled()\n  })\n\n  it('reserva con el nombre escrito y avisa a quien la usa', async () => {\n    const usuario = userEvent.setup()\n    const alReservar = vi.fn()\n    render(<ReservaKayak onReservar={alReservar} />)\n\n    await usuario.type(screen.getByLabelText('Nombre'), 'Marta')\n    await usuario.click(screen.getByRole('button', { name: 'Reservar' }))\n\n    expect(screen.getByRole('status')).toHaveTextContent('Reserva hecha a nombre de Marta')\n    expect(alReservar).toHaveBeenCalledWith({ nombre: 'Marta', personas: 1, ruta: 'tranquila', total: 18 })\n  })\n})",
  "anotaciones": [
    {
      "fragmento": "const usuario = userEvent.setup()",
      "nota": "Crea una persona virtual. Se hace en cada test y antes de render, como recomienda la documentación de user-event 14."
    },
    {
      "fragmento": "render(<ReservaKayak />)",
      "nota": "Monta el componente dentro de un div que se añade al body del DOM de jsdom. Es el único paso de preparar que casi siempre necesitas."
    },
    {
      "fragmento": "screen.getByLabelText('Nombre')",
      "nota": "screen busca en todo el body. getByLabelText encuentra el campo por el texto de su etiqueta, como lo encontraría quien rellena el formulario. Si hay cero o más de uno, lanza un error."
    },
    {
      "fragmento": "await usuario.type(screen.getByLabelText('Nombre'), 'Marta')",
      "nota": "Teclea letra a letra, con foco, eventos de teclado y de input. Es asíncrono: sin await, el test seguiría antes de que se hubiera escrito nada."
    },
    {
      "fragmento": "expect(screen.getByRole('status')).toHaveTextContent('Reserva hecha a nombre de Marta')",
      "nota": "Comprueba lo que ve la persona: un aviso de estado con ese texto. toHaveTextContent es de jest-dom y busca el fragmento dentro del texto del elemento."
    },
    {
      "fragmento": "const alReservar = vi.fn()",
      "nota": "Una función espía. El componente la recibe como prop onReservar y el test comprueba con qué datos la llamó. Una prop de evento es parte del contrato del componente, así que probarla no es mirar detalles internos."
    }
  ]
}
```

Vitest, con `--reporter=verbose`, enseña una línea por test:

```text
 ✓ src/ReservaKayak.test.jsx > ReservaKayak > calcula el total según la ruta, las personas y los chalecos 128ms
 ✓ src/ReservaKayak.test.jsx > ReservaKayak > no deja reservar sin nombre 21ms
 ✓ src/ReservaKayak.test.jsx > ReservaKayak > reserva con el nombre escrito y avisa a quien la usa 40ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

Tres tests, en verde, en medio segundo. Fíjate en que ningún test conoce el estado: `personas`, `ruta` y `chalecos` podrían ser un `useReducer` mañana y estos tests seguirían pasando.

## Encontrar elementos como los encuentra una persona

Todas las consultas de Testing Library tienen la forma `<tipo>By<criterio>`, y **el tipo decide qué pasa cuando no hay exactamente un resultado**:

- **`getBy…`** devuelve el elemento, y lanza un error si hay cero o más de uno. Es la que usarás casi siempre.
- **`getAllBy…`** devuelve una lista (y falla si está vacía).
- **`queryBy…`** devuelve el elemento o `null`. Es la única para **comprobar que algo no está**.
- **`findBy…`** devuelve una promesa y espera a que el elemento aparezca. Es para lo asíncrono, y la tienes en la lección 84.

Y el criterio, por orden de preferencia (así lo recomienda la guía «Which query should I use?» de Testing Library):

```laboratorio
{
  "tipo": "notas-clave",
  "items": [
    {
      "titulo": "1. getByRole (con name)",
      "texto": "Todo lo que está en el árbol de accesibilidad: botones, enlaces, campos, encabezados, listas. Con la opción name filtras por el nombre accesible: getByRole('button', { name: 'Reservar' }). Es la primera opción para casi todo. Si no puedes encontrar algo así, es posible que tu interfaz no sea accesible."
    },
    {
      "titulo": "2. getByLabelText",
      "texto": "Para campos de formulario: quien rellena un formulario busca la etiqueta, y esta consulta hace lo mismo."
    },
    {
      "titulo": "3. getByPlaceholderText",
      "texto": "Un placeholder no sustituye a una etiqueta; solo si es lo único que hay, es mejor que lo que sigue."
    },
    {
      "titulo": "4. getByText",
      "texto": "Fuera de los formularios, el texto es como se encuentra el contenido: párrafos, avisos, totales."
    },
    {
      "titulo": "5. getByDisplayValue",
      "texto": "El valor actual de un campo ya rellenado."
    },
    {
      "titulo": "6. getByAltText y 7. getByTitle",
      "texto": "Consultas semánticas: el texto alternativo de una imagen y el atributo title. El title no siempre lo leen los lectores de pantalla ni se ve por defecto."
    },
    {
      "titulo": "8. getByTestId",
      "texto": "El último recurso: un atributo data-testid que nadie ve ni oye. Solo cuando no se puede encontrar por rol ni por texto, por ejemplo porque el texto es dinámico."
    }
  ]
}
```

Aplicadas al formulario de Kayaks del Cinca, de la más a la menos recomendable:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { render, screen } from '@testing-library/react'\nimport { expect, it } from 'vitest'\nimport ReservaKayak from './ReservaKayak'\n\nit('las consultas, de la más a la menos recomendable', () => {\n  render(<ReservaKayak />)\n\n  // 1. Por rol y nombre accesible: lo que ve un lector de pantalla\n  expect(screen.getByRole('heading', { name: 'Reserva tu kayak en el Cinca' })).toBeInTheDocument()\n  expect(screen.getByRole('textbox', { name: 'Nombre' })).toBeInTheDocument()\n  expect(screen.getAllByRole('option')).toHaveLength(2)\n\n  // 2. Por etiqueta: el campo se encuentra como lo encuentra quien rellena\n  expect(screen.getByLabelText('Personas')).toHaveValue(1)\n\n  // 3. Por texto: lo que no es interactivo\n  expect(screen.getByText('Total: 18,00 €')).toBeInTheDocument()\n\n  // 4. Por valor mostrado\n  expect(screen.getByDisplayValue('Tranquila (18 € por persona)')).toBeInTheDocument()\n})",
  "anotaciones": [
    {
      "fragmento": "screen.getByRole('heading', { name: 'Reserva tu kayak en el Cinca' })",
      "nota": "Un h2 tiene el rol heading. Su nombre accesible es su texto."
    },
    {
      "fragmento": "screen.getByRole('textbox', { name: 'Nombre' })",
      "nota": "Un input de texto tiene el rol textbox, y su nombre sale de la etiqueta que lo envuelve. Es la misma pieza que getByLabelText, vista desde el árbol de accesibilidad."
    },
    {
      "fragmento": "screen.getAllByRole('option')",
      "nota": "Cada option de un select tiene el rol option. getAllBy devuelve la lista y aquí se comprueba que hay dos rutas."
    },
    {
      "fragmento": "screen.getByLabelText('Personas')",
      "nota": "Un input de tipo number tiene el rol spinbutton, y por eso getByRole('textbox') no lo encontraría. getByLabelText no tiene que saber nada de roles."
    },
    {
      "fragmento": "screen.getByDisplayValue('Tranquila (18 € por persona)')",
      "nota": "El valor mostrado del select es el texto de la opción elegida."
    }
  ]
}
```

Todas pasan. Los roles no te los tienes que aprender de memoria: **cuando una consulta falla, Testing Library te lista los roles que sí hay** y vuelca el DOM. Este test busca un botón «Enviar» que no existe:

```text
FAIL  src/rol.test.jsx > busca un botón que no existe con ese nombre
TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "Enviar"

Here are the accessible roles:

  …

  button:

  Name "Reservar":
  <button
    type="submit"
  />

  --------------------------------------------------

  (sigue el DOM completo)
```

El mensaje te dice qué había en vez de lo que buscabas: el único botón se llama «Reservar». Los roles salen del HTML (un `select` es un `combobox`, un `input type="number"` es un `spinbutton`, una `section` con nombre es una `region`) y el nombre accesible, de la etiqueta, del texto o de `aria-label`: es lo que viste en la lección 37 sobre accesibilidad.

Para ver el DOM a mano en mitad de un test, `screen.debug()` lo imprime.

## Las comprobaciones de esta web son consultas de Testing Library

Esto ya lo conoces sin saberlo: los ✅/❌ de los ejercicios de este temario se ejecutan con Testing Library dentro de la vista previa. Cada comprobación monta tu app desde cero, hace sus pasos con **user-event** y espera el resultado con **`waitFor`** (hasta 1,5 s). Las consultas que escribes en una comprobación son estas:

- `{rol: 'button', nombre: 'Reservar'}` es `queryAllByRole('button', { name: 'Reservar' })`.
- `{etiqueta: 'Nombre'}` es `queryAllByLabelText('Nombre')`.
- `{texto: 'Total: 18,00 €'}` es `queryAllByText('Total: 18,00 €')`.
- Los pasos son `usuario.click`, `usuario.clear` y `usuario.type` (`escribir`), `usuario.keyboard` (`teclear`) y `usuario.selectOptions` (`seleccionar`).

Dos diferencias con un test que escribes tú: la comprobación se queda con el **primer** resultado en vez de fallar si hay varios, y no tiene un `getBy` que lance el error del DOM, sino que te explica en español qué no encontró. Por eso el ejercicio de esta lección, más abajo, te pide algo muy concreto: **que tu interfaz se pueda encontrar por rol y por etiqueta**. Si una comprobación no lo encuentra, un test tuyo tampoco, y probablemente una persona con un lector de pantalla tampoco.

## Simular a la persona: user-event frente a fireEvent

Testing Library trae `fireEvent`, que lanza **un** evento del DOM en un elemento y nada más. Es útil, pero una persona no lanza eventos sueltos: al escribir en un campo, este recibe el foco, se disparan eventos de teclado y de entrada, se respetan el `maxLength` y el `disabled`... `user-event` simula la interacción completa, y por eso la propia documentación dice que es lo que debes usar para probar interacción con tus componentes. Reserva `fireEvent` para los eventos que `user-event` no cubre.

Se nota en el formulario de reserva. Seis tests, por parejas: lo que `fireEvent` deja pasar y `user-event` no.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { fireEvent, render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { describe, expect, it, vi } from 'vitest'\nimport ReservaKayak from './ReservaKayak'\n\ndescribe('fireEvent frente a user-event', () => {\n  it('fireEvent.change se salta el maxLength del campo', () => {\n    render(<ReservaKayak />)\n    const campo = screen.getByLabelText('Nombre')\n\n    fireEvent.change(campo, { target: { value: 'María del Carmen López' } })\n\n    expect(campo).toHaveValue('María del Carmen López') // 22 letras: una persona no podría\n  })\n\n  it('userEvent.type respeta el maxLength, como el navegador', async () => {\n    const usuario = userEvent.setup()\n    render(<ReservaKayak />)\n    const campo = screen.getByLabelText('Nombre')\n\n    await usuario.type(campo, 'María del Carmen López')\n\n    expect(campo).toHaveValue('María del Ca') // 12 letras\n  })\n\n  it('fireEvent.click pulsa un botón que nadie puede pulsar', () => {\n    const alPulsar = vi.fn()\n    render(\n      <button style={{ pointerEvents: 'none' }} onClick={alPulsar}>\n        Reservar\n      </button>,\n    )\n\n    fireEvent.click(screen.getByRole('button', { name: 'Reservar' }))\n\n    expect(alPulsar).toHaveBeenCalledTimes(1) // pasa... y no debería\n  })\n\n  it('userEvent.click se niega a pulsarlo y lo dice', async () => {\n    const usuario = userEvent.setup()\n    const alPulsar = vi.fn()\n    render(\n      <button style={{ pointerEvents: 'none' }} onClick={alPulsar}>\n        Reservar\n      </button>,\n    )\n\n    await expect(usuario.click(screen.getByRole('button', { name: 'Reservar' }))).rejects.toThrow(\n      /pointer-events: none/,\n    )\n\n    expect(alPulsar).not.toHaveBeenCalled()\n  })\n})\n\ndescribe('enviar con la tecla Enter', () => {\n  it('user-event: Enter dentro del campo envía el formulario', async () => {\n    const usuario = userEvent.setup()\n    render(<ReservaKayak />)\n\n    await usuario.type(screen.getByLabelText('Nombre'), 'Marta{Enter}')\n\n    expect(screen.getByRole('status')).toHaveTextContent('Marta')\n  })\n\n  it('fireEvent.keyDown no envía nada: solo lanza ese evento', () => {\n    render(<ReservaKayak />)\n    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Marta' } })\n\n    fireEvent.keyDown(screen.getByLabelText('Nombre'), { key: 'Enter' })\n\n    expect(screen.queryByRole('status')).not.toBeInTheDocument()\n  })\n})",
  "anotaciones": [
    {
      "fragmento": "fireEvent.change(campo, { target: { value: 'María del Carmen López' } })",
      "nota": "Pone un valor de 22 letras en un campo con maxLength de 12. El navegador no lo permitiría nunca, pero fireEvent solo lanza el evento change y no lo comprueba."
    },
    {
      "fragmento": "await usuario.type(campo, 'María del Carmen López')",
      "nota": "user-event teclea letra a letra y el campo ignora las que no caben, como haría el navegador. El campo se queda con las 12 primeras letras."
    },
    {
      "fragmento": "style={{ pointerEvents: 'none' }}",
      "nota": "Un botón que ningún puntero puede alcanzar, por ejemplo porque hay algo encima. Para el usuario, es un botón muerto."
    },
    {
      "fragmento": "fireEvent.click(screen.getByRole('button', { name: 'Reservar' }))",
      "nota": "El clic llega al manejador aunque nadie podría hacerlo. El test pasa y no debería: te da una confianza falsa."
    },
    {
      "fragmento": ".rejects.toThrow(",
      "nota": "user-event comprueba antes de pulsar que el elemento se puede pulsar y, si no, lanza un error con el motivo. El test lo espera con rejects.toThrow."
    },
    {
      "fragmento": "await usuario.type(screen.getByLabelText('Nombre'), 'Marta{Enter}')",
      "nota": "Entre llaves se escriben teclas especiales. Pulsar Enter dentro de un campo envía el formulario, como en el navegador."
    },
    {
      "fragmento": "fireEvent.keyDown(screen.getByLabelText('Nombre'), { key: 'Enter' })",
      "nota": "Lanza solo el evento keydown. El navegador, tras ese keydown, enviaría el formulario; fireEvent no hace nada más, así que no se envía."
    }
  ]
}
```

```text
 ✓ src/eventos.test.jsx > fireEvent frente a user-event > fireEvent.change se salta el maxLength del campo 19ms
 ✓ src/eventos.test.jsx > fireEvent frente a user-event > userEvent.type respeta el maxLength, como el navegador 101ms
 ✓ src/eventos.test.jsx > fireEvent frente a user-event > fireEvent.click pulsa un botón que nadie puede pulsar 10ms
 ✓ src/eventos.test.jsx > fireEvent frente a user-event > userEvent.click se niega a pulsarlo y lo dice 7ms
 ✓ src/eventos.test.jsx > enviar con la tecla Enter > user-event: Enter dentro del campo envía el formulario 31ms
 ✓ src/eventos.test.jsx > enviar con la tecla Enter > fireEvent.keyDown no envía nada: solo lanza ese evento 2ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
```

Cuatro cosas que conviene tener claras sobre `user-event` 14:

- **`userEvent.setup()` va antes de `render`**, una vez por test (o en una función de ayuda). Cada instancia lleva el estado de su teclado y su puntero, de modo que `keyboard('[ShiftLeft>]')` y un clic posterior se comportan como un clic con Mayús.
- **Todas sus funciones son asíncronas**: `click`, `type`, `clear`, `selectOptions`, `keyboard`, `tab`... Hay que ponerles `await` siempre.
- **No escribirás `act()` a mano casi nunca.** `act` es el ayudante de React que aplica las actualizaciones pendientes antes de comprobar (la documentación de React lo llama *a test helper to apply pending React updates before making assertions*), y Testing Library envuelve en él `render`, `fireEvent` y `user-event`. Lo verás en acción en la lección 84, cuando haya relojes y red de por medio.
- **Esta web usa `user-event` 13.5.0** en sus propios tests (solo en 2 archivos; en otros 18 usa `fireEvent`): es una versión anterior, sin `setup()` y con la API síncrona. Las comprobaciones de los ejercicios, en cambio, llevan la 14. Aquí enseño la 14 porque es la actual; si encuentras `userEvent.click(x)` sin `await` en un proyecto antiguo, es la 13.

## Leer el resultado: los comprobadores de jest-dom

`expect` viene de Vitest, pero con `jest-dom` aprende a hablar del DOM. Los que más usarás, todos en un test:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { render, screen } from '@testing-library/react'\nimport userEvent from '@testing-library/user-event'\nimport { expect, it } from 'vitest'\nimport ReservaKayak from './ReservaKayak'\n\nit('los comprobadores de jest-dom leen el DOM como lo lee una persona', async () => {\n  const usuario = userEvent.setup()\n  render(<ReservaKayak />)\n  const nombre = screen.getByLabelText('Nombre')\n  const chalecos = screen.getByRole('checkbox', { name: /chalecos/i })\n\n  expect(nombre).toBeEnabled()\n  expect(nombre).toHaveValue('')\n  expect(nombre).toHaveAccessibleName('Nombre')\n  expect(chalecos).not.toBeChecked()\n  expect(screen.getByRole('button', { name: 'Reservar' })).toBeVisible()\n\n  await usuario.click(chalecos)\n  await usuario.type(nombre, 'Marta')\n\n  expect(chalecos).toBeChecked()\n  expect(nombre).toHaveValue('Marta')\n  expect(nombre).toHaveFocus()\n  expect(screen.getByText(/Total/)).toHaveTextContent('Total: 20,00 €')\n})",
  "anotaciones": [
    {
      "fragmento": "expect(nombre).toBeEnabled()",
      "nota": "toBeEnabled y toBeDisabled leen el atributo disabled del campo (y el de su fieldset). Es lo que comprobarías para un botón que se desactiva."
    },
    {
      "fragmento": "expect(nombre).toHaveValue('')",
      "nota": "El valor actual de un campo. En un input type number devuelve un número, no un texto."
    },
    {
      "fragmento": "expect(nombre).toHaveAccessibleName('Nombre')",
      "nota": "Comprueba el nombre accesible, el mismo que usa getByRole con name. Un test de que el campo sigue teniendo etiqueta."
    },
    {
      "fragmento": "expect(chalecos).not.toBeChecked()",
      "nota": "toBeChecked sirve para checkbox, radio y elementos con rol checkbox, radio o switch y aria-checked. Con not se niega cualquier comprobador."
    },
    {
      "fragmento": "expect(screen.getByRole('button', { name: 'Reservar' })).toBeVisible()",
      "nota": "toBeVisible mira que el elemento esté en el documento y no tenga display none, visibility hidden o collapse, opacity 0 ni el atributo hidden, ni ellos ni ningún ascendiente. jsdom no calcula el diseño, pero sí estos estilos."
    },
    {
      "fragmento": "expect(nombre).toHaveFocus()",
      "nota": "Tras escribir con user-event, el foco está en el campo, como en un navegador."
    },
    {
      "fragmento": "toHaveTextContent('Total: 20,00 €')",
      "nota": "Con la ruta tranquila (18 €) y los chalecos (2 €) para una persona, el total es 20 €. Compara el texto del elemento ignorando los espacios sobrantes."
    }
  ]
}
```

Cuando fallan, los mensajes de `jest-dom` son claros. Este es el aspecto de uno (un total que esperaba 20 € cuando la reserva inicial cuesta 18):

```text
FAIL  src/valor.test.jsx > el total inicial
Error: expect(element).toHaveTextContent()

Expected element to have text content:
  Total: 20,00 €
Received:
  Total: 18,00 €
```

## Qué probar y qué no

Hay una regla que resume todo el diseño de Testing Library: **prueba lo que ve y hace el usuario, no cómo está construido el componente**. La segunda mitad importa tanto como la primera, porque un test que depende de la construcción se rompe cuando refactorizas, aunque la pantalla siga igual, y esos falsos avisos acaban enseñándote a ignorar los tests.

Dos tests para la misma comprobación, el total inicial. El primero busca el total por su posición en el formulario; el segundo, por lo que dice:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { render, screen } from '@testing-library/react'\nimport { describe, expect, it } from 'vitest'\nimport ReservaKayak from './ReservaKayak'\n\ndescribe('el total de la reserva', () => {\n  it('MAL: depende de cómo está construido el formulario', () => {\n    const { container } = render(<ReservaKayak />)\n\n    const total = container.querySelector('form > p')\n\n    expect(total).toHaveTextContent('Total: 18,00 €')\n    expect(container.querySelectorAll('input')).toHaveLength(3)\n  })\n\n  it('BIEN: busca lo que ve quien reserva', () => {\n    render(<ReservaKayak />)\n\n    expect(screen.getByText('Total: 18,00 €')).toBeInTheDocument()\n    expect(screen.getByLabelText('Personas')).toHaveValue(1)\n  })\n})",
  "anotaciones": [
    {
      "fragmento": "container.querySelector('form > p')",
      "nota": "container es el div donde se montó el componente. La documentación advierte: si te encuentras usando container para buscar elementos, reconsidéralo, porque las otras consultas resisten mejor los cambios. Aquí el total es el primer p del form: un detalle de construcción."
    },
    {
      "fragmento": "expect(container.querySelectorAll('input')).toHaveLength(3)",
      "nota": "Contar elementos de una etiqueta es otro detalle de construcción. Si mañana un campo pasa a ser un select, el test falla sin que haya nada roto."
    },
    {
      "fragmento": "expect(screen.getByText('Total: 18,00 €')).toBeInTheDocument()",
      "nota": "Busca lo que ve la persona, el total. Da igual si es un p, un output o un strong."
    },
    {
      "fragmento": "expect(screen.getByLabelText('Personas')).toHaveValue(1)",
      "nota": "Encuentra el campo por su etiqueta y comprueba su valor, no el nombre del estado que lo guarda."
    }
  ]
}
```

Con el componente tal como está, los dos pasan:

```text
 ✓ src/detalles.test.jsx > el total de la reserva > MAL: depende de cómo está construido el formulario 15ms
 ✓ src/detalles.test.jsx > el total de la reserva > BIEN: busca lo que ve quien reserva 5ms

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

Ahora un refactor que no cambia nada de lo que ve el usuario: se añade una línea («Cancelación gratuita hasta 24 horas antes») antes del total y el total pasa de un `<p>` a un `<output>`, que es lo semánticamente correcto para el resultado de un cálculo. El mismo archivo de tests, contra el componente refactorizado:

```text
 × src/detalles.test.jsx > el total de la reserva > MAL: depende de cómo está construido el formulario 14ms
   → expect(element).toHaveTextContent()

Expected element to have text content:
  Total: 18,00 €
Received:
  Cancelación gratuita hasta 24 horas antes.
 ✓ src/detalles.test.jsx > el total de la reserva > BIEN: busca lo que ve quien reserva 8ms
```

El test de «construcción» ha fallado y el de «usuario» sigue en verde. **Esa es la diferencia: un test que se rompe cuando algo ha dejado de funcionar es un buen test; uno que se rompe cuando solo has reorganizado, es un test que te cuesta tiempo y no te da nada.**

```laboratorio
{
  "tipo": "mitos",
  "mitos": [
    {
      "mito": "Un test bueno comprueba el estado del componente.",
      "realidad": "El estado es un detalle interno. Lo que importa es lo que cambia en pantalla y lo que el componente le comunica al exterior (sus props de evento). Testing Library ni siquiera te da acceso al estado."
    },
    {
      "mito": "Cuantos más data-testid, más estable el test.",
      "realidad": "Es lo contrario: un data-testid no lo ve ni lo oye nadie, así que el test deja de parecerse al uso real. Es el último recurso de la lista, y si lo necesitas siempre, suele ser señal de una interfaz poco accesible."
    },
    {
      "mito": "fireEvent y user-event son intercambiables.",
      "realidad": "fireEvent lanza un evento suelto; user-event simula la interacción entera y comprueba que una persona podría hacerla. Con fireEvent puedes dar por buenos un clic sobre un botón tapado o un texto más largo que el maxLength."
    },
    {
      "mito": "Si todos los tests están en verde, la aplicación funciona.",
      "realidad": "Solo si los tests comprueban lo que importa. Un test que pasa también cuando la función está rota (por ejemplo, porque solo mira que el botón exista) es peor que no tener test: da una confianza falsa."
    }
  ]
}
```

Una regla práctica para decidir qué probar: **escribe un test por cada cosa que le prometerías a quien usa el componente**. «El total cambia al elegir la ruta aventura», «sin nombre, no se reserva y se avisa», «al reservar, el padre recibe los datos». No hace falta un test por cada línea ni por cada rama; si un cambio de código no cambia nada de lo que prometes, no debería romper ningún test.

`render` admite una opción, `reactStrictMode: true`, para montar el componente dentro de `<StrictMode>` (lecciones 12 y 63), como en tu aplicación.

## Un test de accesibilidad básico

Las consultas por rol y por etiqueta ya son un test de accesibilidad indirecto: si `getByRole('button', { name: 'Reservar' })` encuentra el botón, un lector de pantalla también lo encuentra. Para ir un paso más allá existe **axe**, un auditor que revisa el DOM con las reglas de WCAG (campos sin etiqueta, imágenes sin `alt`, roles mal usados...). Con `vitest-axe`:

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "jsx",
  "codigo": "import { render, screen } from '@testing-library/react'\nimport { axe } from 'vitest-axe'\nimport { expect, it } from 'vitest'\nimport ReservaKayak from './ReservaKayak'\nimport ReservaSinEtiquetas from './ReservaSinEtiquetas'\n\n// jsdom no pinta, así que no puede calcular contrastes: se desactiva esa regla.\nconst opciones = { rules: { 'color-contrast': { enabled: false } } }\n\nit('el formulario de reserva no tiene problemas de accesibilidad detectables', async () => {\n  const { container } = render(<ReservaKayak />)\n\n  const resultados = await axe(container, opciones)\n\n  expect(resultados.violations).toEqual([])\n})\n\nit('un formulario sin etiquetas ni texto alternativo', async () => {\n  const { container } = render(<ReservaSinEtiquetas />)\n\n  const resultados = await axe(container, opciones)\n\n  expect(resultados.violations.map((v) => v.id)).toEqual([])\n})\n\nit('axe no ve que el div hace de botón, pero getByRole sí', () => {\n  render(<ReservaSinEtiquetas />)\n\n  screen.getByRole('button', { name: 'Reservar' })\n})",
  "anotaciones": [
    {
      "fragmento": "import { axe } from 'vitest-axe'",
      "nota": "axe recibe un trozo del DOM y devuelve las reglas de accesibilidad que incumple. Es asíncrono."
    },
    {
      "fragmento": "rules: { 'color-contrast': { enabled: false } }",
      "nota": "jsdom no pinta nada, así que no puede calcular contrastes y la regla da falsos avisos. El contraste se revisa en un navegador real. Esta misma opción la usan los tests de esta web."
    },
    {
      "fragmento": "expect(resultados.violations).toEqual([])",
      "nota": "Sin violaciones, la lista está vacía. Si no lo está, el fallo enseña cuáles son."
    },
    {
      "fragmento": "expect(resultados.violations.map((v) => v.id)).toEqual([])",
      "nota": "Aquí se espera vacío a propósito para ver las reglas que incumple un formulario sin etiquetas."
    },
    {
      "fragmento": "screen.getByRole('button', { name: 'Reservar' })",
      "nota": "Un div con onClick no tiene rol de botón. axe no lo detecta, pero esta consulta sí."
    }
  ]
}
```

El componente bueno pasa. El malo (un `<input>` sin etiqueta, un `<div onClick>` que hace de botón, una imagen sin `alt`) no:

```text
 ✓ src/accesibilidad.test.jsx > el formulario de reserva no tiene problemas de accesibilidad detectables 95ms
 × src/accesibilidad.test.jsx > un formulario sin etiquetas ni texto alternativo 16ms
   → expected [ 'image-alt', 'label' ] to deeply equal []
 × src/accesibilidad.test.jsx > axe no ve que el div hace de botón, pero getByRole sí 12ms
   → Unable to find an accessible element with the role "button" and name "Reservar"

  …
```

Fíjate en el reparto del trabajo. **axe encuentra el campo sin etiqueta (`label`) y la imagen sin texto alternativo (`image-alt`), pero no se queja del `div` que hace de botón.** La consulta por rol, en cambio, sí: «Unable to find an accessible element with the role "button" and name "Reservar"». Son complementarios, y los dos juntos cubren bastante. Ninguno sustituye a probar con un lector de pantalla y con el teclado: axe detecta solo una parte de los problemas, como acabas de ver.

## Un test real de esta web

Esta web tiene 75 archivos de pruebas, muchos con Testing Library y escritos con las mismas ideas. Este, de `src/components/ui/pagination.test.tsx`, comprueba el paginador: los controles que hay, cuál es la página actual y que clicar un número avisa al padre.

```laboratorio
{
  "tipo": "codigo-anotado",
  "lenguaje": "tsx",
  "codigo": "// src/components/ui/pagination.test.tsx (recortado)\nit('renderiza los controles y marca únicamente la página actual', async () => {\n  const { container } = render(\n    <Pagination paginaActual={2} totalPaginas={3} onCambiarPagina={vi.fn()} />,\n  )\n\n  expect(screen.getAllByRole('button')).toHaveLength(5)\n  expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()\n  expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')\n  expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled()\n\n  const resultados = await axe(container, {\n    rules: { 'color-contrast': { enabled: false } },\n  })\n  expect(resultados.violations).toEqual([])\n})\n\nit('cambia a la página numérica seleccionada', () => {\n  const onCambiarPagina = vi.fn()\n  render(<Pagination paginaActual={1} totalPaginas={3} onCambiarPagina={onCambiarPagina} />)\n\n  fireEvent.click(screen.getByRole('button', { name: '3' }))\n\n  expect(onCambiarPagina).toHaveBeenCalledWith(3)\n})",
  "anotaciones": [
    {
      "fragmento": "screen.getByRole('button', { name: 'Anterior' })",
      "nota": "Todo se busca por rol y nombre: los botones se llaman Anterior, Siguiente y como su número. Si el paginador dejara de ser accesible, este test lo notaría."
    },
    {
      "fragmento": "toHaveAttribute('aria-current', 'page')",
      "nota": "El atributo que señala la página actual a los lectores de pantalla. Una comprobación por atributo accesible, no por una clase CSS."
    },
    {
      "fragmento": "const resultados = await axe(container, {",
      "nota": "El mismo test de accesibilidad de esta lección, con la regla de contraste desactivada por la misma razón."
    },
    {
      "fragmento": "fireEvent.click(screen.getByRole('button', { name: '3' }))",
      "nota": "Aquí se usa fireEvent: es un clic en un botón normal, sin foco ni teclado de por medio, y esta web tiene instalado user-event 13, que es anterior a la API con setup() de esta lección. En un proyecto nuevo, usarías user-event 14."
    },
    {
      "fragmento": "expect(onCambiarPagina).toHaveBeenCalledWith(3)",
      "nota": "La prop de evento es el resultado observable de un componente sin estado propio: lo que pasa hacia fuera. Probarla no depende de ningún detalle interno."
    }
  ]
}
```

## Errores típicos

**1. Pedir con `getBy` que algo no esté.** `getBy` lanza un error cuando no encuentra el elemento, así que no sirve para comprobar una ausencia. Para eso, `queryBy`, que devuelve `null`. Pruébalo: ¿qué hace este test, que quiere comprobar que no hay ningún aviso de error al abrir el formulario?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "it('al abrir, no hay ningún aviso', () => {\n  render(<ReservaKayak />)\n\n  expect(screen.getByRole('alert')).not.toBeInTheDocument()\n})",
  "opciones": [
    "Pasa: no hay ningún aviso, así que no está en el documento",
    "Falla antes de llegar al expect: getByRole lanza «Unable to find an accessible element with the role \"alert\"»",
    "Falla en el expect: el elemento sí está en el documento"
  ],
  "correcta": 1,
  "explicacion": "getByRole lanza su propio error cuando no encuentra nada, y lo hace antes de que expect llegue a ejecutarse. Para negar una presencia hay que usar queryByRole, que devuelve null, y entonces not.toBeInTheDocument funciona. Comprobado: la salida real empieza por «Unable to find an accessible element with the role \"alert\"»."
}
```

Con `queryByRole('alert')` en vez de `getByRole('alert')`, el mismo test pasa.

**2. Olvidar el `await` de `user-event`.** Las acciones de `user-event` 14 devuelven promesas. Si no las esperas, el test sigue sin que se haya escrito ni pulsado nada:

```jsx
usuario.type(screen.getByLabelText('Nombre'), 'Marta')
usuario.click(screen.getByRole('button', { name: 'Reservar' }))
expect(screen.getByRole('status')).toHaveTextContent('Marta')
```

```text
FAIL  src/sinawait.test.jsx > reserva con el nombre escrito (olvidando los await)
TestingLibraryElementError: Unable to find an accessible element with the role "status"

  …
```

El error no menciona el `await`; solo dice que no hay ningún `status`, porque todavía no se ha pulsado nada. **Si una consulta falla justo después de una acción, mira primero que tengas el `await`.**

**3. No limpiar entre tests.** Sin limpieza, el componente del primer test sigue montado cuando empieza el segundo, y las consultas encuentran dos. Testing Library desmonta lo montado tras cada test, pero solo si encuentra un `afterEach` global. Vitest no lo inyecta si no pones `globals: true`. Este es el resultado con `globals: false` y dos tests que montan el mismo formulario:

```text
 ✓ src/dos.test.jsx > primera prueba 66ms
 × src/dos.test.jsx > segunda prueba 19ms
   → Found multiple elements with the role "button" and name "Reservar"

  …
```

La solución es `globals: true` en la configuración (como en el entorno que montamos) o llamar a `cleanup()` en un `afterEach` del archivo de preparación.

**4. Comparar el texto con `textContent`.** `getByText` y `toHaveTextContent` normalizan los espacios; `textContent` no. Y `Intl.NumberFormat` en español pone un **espacio duro** (U+00A0) entre el número y el símbolo del euro. ¿Qué pasa con este test?

```laboratorio
{
  "tipo": "predice-el-resultado",
  "lenguaje": "jsx",
  "codigo": "it('el total inicial', () => {\n  render(<ReservaKayak />)\n\n  expect(screen.getByText(/Total/).textContent).toBe('Total: 18,00 €')\n})",
  "opciones": [
    "Pasa",
    "Falla con un mensaje que dice «expected 'Total: 18,00 €' to be 'Total: 18,00 €'»",
    "Falla porque getByText no admite expresiones regulares"
  ],
  "correcta": 1,
  "explicacion": "El texto del componente lleva un espacio duro entre 18,00 y €; el del test lleva un espacio normal. Se ven idénticos y no lo son, y por eso el mensaje de error parece absurdo. La solución es no leer textContent: getByText('Total: 18,00 €') y toHaveTextContent normalizan los espacios, y los tests de esta lección con ellos pasan."
}
```

**5. Buscar por detalles de construcción.** Clases CSS, `data-testid` puestos por costumbre, `container.querySelector(...)`, contar elementos por etiqueta: todo eso se rompe al refactorizar. Mira otra vez la sección «Qué probar y qué no».

## Ejercicios

El primero es de **encontrar**. El componente de abajo, la lista de espera de los kayaks, funciona a ratos con el ratón, pero ningún test (ni persona con lector de pantalla) lo puede manejar: el campo no tiene etiqueta, el «botón» es un `div`, y los mensajes no tienen rol. Las comprobaciones usan las mismas consultas de Testing Library que has visto, así que **tu trabajo es dejar el código en un estado en el que se pueda encontrar cada cosa por su rol o su etiqueta**.

```laboratorio
{
  "tipo": "react-en-vivo",
  "titulo": "La lista de espera de los kayaks, que nadie puede encontrar",
  "consigna": "Haz que el campo tenga su etiqueta «Correo», que «Apuntarme» sea un botón de verdad, que el error salga con el rol alert solo cuando haya error, y la confirmación con el rol status. Pista: los avisos que no se ven no deben estar en el DOM, o una consulta por rol los encontrará igualmente.",
  "archivos": [
    {
      "nombre": "App.jsx",
      "codigo": "import { useState } from 'react'\nimport './estilos.css'\n\nexport default function App() {\n  const [correo, setCorreo] = useState('')\n  const [apuntado, setApuntado] = useState(false)\n  const [error, setError] = useState('')\n\n  function apuntar() {\n    if (!correo.includes('@')) {\n      setError('Escribe un correo válido.')\n      setApuntado(false)\n      return\n    }\n    setError('')\n    setApuntado(true)\n  }\n\n  // Tu trabajo: que cada elemento se pueda encontrar como lo encontraría una\n  // persona: el campo por su etiqueta, el botón por su rol y los mensajes por\n  // su rol.\n  return (\n    <main>\n      <h1>Lista de espera de los kayaks</h1>\n      <span className=\"etiqueta\">Correo</span>\n      <input\n        value={correo}\n        onChange={(e) => setCorreo(e.target.value)}\n        placeholder=\"tu@correo.es\"\n      />\n      <div className=\"boton\" onClick={apuntar}>\n        Apuntarme\n      </div>\n      <div className=\"error\">{error}</div>\n      {apuntado && <div className=\"ok\">Te avisaremos en {correo}.</div>}\n    </main>\n  )\n}\n"
    },
    {
      "nombre": "estilos.css",
      "codigo": "main {\n  max-width: 30rem;\n  font-family: system-ui, sans-serif;\n}\n\nh1 {\n  margin: 0 0 0.75rem;\n  color: #075985;\n  font-size: 1.25rem;\n}\n\nlabel,\n.etiqueta {\n  display: block;\n  margin-bottom: 0.2rem;\n}\n\ninput {\n  padding: 0.35rem 0.5rem;\n  border: 1px solid #64748b;\n  border-radius: 6px;\n  font: inherit;\n}\n\n.boton,\nbutton {\n  display: inline-block;\n  margin-left: 0.4rem;\n  padding: 0.4rem 0.9rem;\n  border: 1px solid #0369a1;\n  border-radius: 6px;\n  background: #0369a1;\n  color: white;\n  font: inherit;\n  cursor: pointer;\n}\n\n.error,\n[role='alert'] {\n  margin: 0.5rem 0 0;\n  color: #b91c1c;\n}\n\n.ok,\n[role='status'] {\n  margin: 0.5rem 0 0;\n  padding: 0.5rem 0.75rem;\n  border-radius: 6px;\n  background: #e0f2fe;\n}\n"
    }
  ],
  "archivoInicial": "App.jsx",
  "strictMode": true,
  "mostrarConsola": false,
  "comprobaciones": [
    {
      "descripcion": "El campo se encuentra por su etiqueta «Correo» y se puede escribir en él",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "ana@correo.es"
          }
        }
      ],
      "espera": {
        "etiqueta": "Correo",
        "valor": "ana@correo.es"
      }
    },
    {
      "descripcion": "Con un correo válido, el botón «Apuntarme» muestra la confirmación con el rol status",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "ana@correo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Te avisaremos en ana@correo.es"
      }
    },
    {
      "descripcion": "Con un correo sin arroba, aparece un aviso con el rol alert",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "ana"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        }
      ],
      "espera": {
        "rol": "alert",
        "texto": "Escribe un correo válido"
      }
    },
    {
      "descripcion": "Al corregir el correo y volver a pulsar, el aviso de error desaparece",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "ana"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
          }
        },
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "ana@correo.es"
          }
        },
        {
          "pulsar": {
            "rol": "button",
            "nombre": "Apuntarme"
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
      "descripcion": "Al abrir la página no hay ningún aviso de error en el DOM",
      "pasos": [],
      "espera": {
        "ausente": {
          "rol": "alert"
        }
      }
    },
    {
      "descripcion": "Pulsar Enter dentro del campo también apunta",
      "pasos": [
        {
          "escribir": {
            "etiqueta": "Correo",
            "texto": "ana@correo.es"
          }
        },
        {
          "teclear": "{Enter}"
        }
      ],
      "espera": {
        "rol": "status",
        "texto": "Te avisaremos en ana@correo.es"
      }
    }
  ]
}
```

Fíjate en cuántas de esas mejoras eran de accesibilidad, no de testing: la etiqueta, el botón real, los roles de los avisos y que Enter funcione. **Un componente que se puede probar con Testing Library es, casi siempre, un componente que se puede usar con teclado y lector de pantalla.** Por eso la regla de las consultas manda buscar por rol primero.

### Retos para seguir practicando

Estos no tienen comprobación automática: son para hacerlos en tu proyecto de Vite, con `npx vitest`.

1. Instala el entorno de esta lección en el proyecto de la lección 2. Escribe un test para el contador de la lección 1: monta `App`, pulsa el botón dos veces con `user-event` y comprueba el texto.
2. Prueba el formulario controlado de la lección 22: escribe en el campo con `user.type` y comprueba con `toHaveValue` que el valor llega al estado y se muestra en pantalla.
3. Rompe a propósito el formulario de reserva de esta lección: cambia el `<button>` por un `<div onClick>` y mira qué test falla y con qué mensaje. Añade después un test con `axe` y comprueba si detecta ese cambio (pista: no lo hará).
4. Reto: prueba la lista con `key` de la lección 11. Borra un elemento con `user.click`, comprueba con `queryByRole` que ya no está, y con `getAllByRole('listitem')` cuántos quedan. Después cambia el orden de la lista en el componente y comprueba que tu test sigue en verde.

## Para profundizar

```laboratorio
{
  "tipo": "recursos",
  "recursos": [
    {
      "titulo": "React Testing Library: introducción y API",
      "descripcion": "La idea guía, render, screen, cleanup, act, renderHook y configure. Lo que más vas a consultar.",
      "url": "https://testing-library.com/docs/react-testing-library/intro",
      "etiqueta": "Testing Library"
    },
    {
      "titulo": "Which query should I use?",
      "descripcion": "La guía oficial de prioridad de consultas de la que sale el orden de esta lección.",
      "url": "https://testing-library.com/docs/queries/about/#priority",
      "etiqueta": "Testing Library"
    },
    {
      "titulo": "user-event: introducción y diferencias con fireEvent",
      "descripcion": "Qué simula, por qué se prefiere a fireEvent y cómo empezar con userEvent.setup().",
      "url": "https://testing-library.com/docs/user-event/intro",
      "etiqueta": "Testing Library"
    },
    {
      "titulo": "act",
      "descripcion": "La página de React sobre el ayudante que aplica las actualizaciones pendientes antes de comprobar. Testing Library ya lo envuelve.",
      "url": "https://react.dev/reference/react/act",
      "etiqueta": "react.dev"
    },
    {
      "titulo": "jest-dom: lista de comprobadores",
      "descripcion": "Todos los comprobadores del DOM (toBeVisible, toHaveAccessibleName...) con ejemplos.",
      "url": "https://github.com/testing-library/jest-dom",
      "etiqueta": "GitHub"
    },
    {
      "titulo": "Common mistakes with React Testing Library",
      "descripcion": "Un clásico de Kent C. Dodds, el autor de la librería: errores que se repiten en casi todos los proyectos.",
      "url": "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library",
      "etiqueta": "Kent C. Dodds"
    }
  ]
}
```
