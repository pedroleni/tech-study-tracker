import { fireEvent, waitFor, within } from '@testing-library/dom'
import { readFileSync } from 'node:fs'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { ArchivoReact, ComprobacionReact } from '@/lib/laboratorio/schemas'

import pruebasReales from '../../../public/vendor/react-en-vivo/19.3.1/pruebas.js?raw'
import reactReal from '../../../public/vendor/react-en-vivo/19.3.1/react.js?raw'
import montaje from './runtime/montaje.js?raw'
import puente from './runtime/puente.js?raw'
import red from './runtime/red.js?raw'
import { transformarArchivos } from './transformar'

type VentanaRuntime = typeof window & {
  __configReactEnVivo?: {
    modulos: Record<string, string>
    archivosCss: string[]
    strictMode: boolean
    api?: Record<string, unknown[]>
    red?: { latencia: number; desordenar: boolean }
  }
  __enviarReactEnVivo?: ReturnType<typeof vi.fn>
  __comprobarReactEnVivo?: (
    comprobaciones: ComprobacionReact[],
  ) => Promise<{ descripcion: string; ok: boolean; motivo?: string }[]>
  __pruebasEnVivo?: Record<string, unknown>
  __peticionAbandonadaReactEnVivo?: Promise<Response>
  __reactEnVivo?: Record<string, unknown> & { React: { version: string } }
  __redReactEnVivo?: {
    fallarMontaje: () => void
    fallarSiguiente: () => void
    terminarMontaje: () => void
    reiniciar: () => void
  }
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
    supportsFiber?: boolean
    renderers?: Map<number, unknown>
    inject?: (renderer: unknown) => number
    onCommitFiberRoot?: (...args: unknown[]) => unknown
    onCommitFiberUnmount?: (...args: unknown[]) => unknown
    onPostCommitFiberRoot?: (...args: unknown[]) => unknown
    checkDCE?: (...args: unknown[]) => unknown
  }
}

const ventana = window as VentanaRuntime
const consolaOriginal = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
}
let reactDelSandbox: NonNullable<VentanaRuntime['__reactEnVivo']>

beforeAll(() => {
  // Las comprobaciones se prueban con el mismo React 19.3.1 que carga el iframe real.
  new Function(readFileSync('public/vendor/react-en-vivo/19.3.1/react.js', 'utf8'))()
  if (!ventana.__reactEnVivo) throw new Error('El bundle de React del sandbox no se cargó')
  reactDelSandbox = ventana.__reactEnVivo
})

const userEventFalso = {
  setup: () => ({
    clear: async (elemento: Element) => {
      fireEvent.change(elemento, { target: { value: '' } })
    },
    type: async (elemento: Element, texto: string) => {
      const valorActual = 'value' in elemento ? String(elemento.value) : ''
      fireEvent.change(elemento, { target: { value: valorActual + texto } })
    },
    click: async (elemento: Element) => {
      fireEvent.click(elemento)
    },
    keyboard: async (teclas: string) => {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: teclas })
      fireEvent.keyUp(document.activeElement ?? document.body, { key: teclas })
    },
    selectOptions: async (elemento: Element, opcion: string) => {
      fireEvent.change(elemento, { target: { value: opcion } })
    },
  }),
}

function instalarReact() {
  ventana.__reactEnVivo = reactDelSandbox
}

async function ejecutarMontaje(
  archivos: ArchivoReact[],
  strictMode = false,
  instalarRuntime = instalarReact,
) {
  const transformacion = await transformarArchivos(archivos)
  if (!transformacion.ok) throw new Error(transformacion.mensaje)

  document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
  const enviar = vi.fn()
  instalarRuntime()
  const versionEsperada = (
    ventana.__reactEnVivo as { React: { version: string } }
  ).React.version
  ventana.__enviarReactEnVivo = enviar
  ventana.__configReactEnVivo = {
    modulos: transformacion.modulos,
    archivosCss: transformacion.archivosCss,
    strictMode,
  }
  new Function(montaje)()

  await waitFor(() => {
    expect(enviar).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'montado', version: versionEsperada }),
    )
  })
  return enviar
}

async function ejecutarMontajeConBundlesReales(archivos: ArchivoReact[]) {
  new Function(reactReal)()
  new Function(pruebasReales)()
  return ejecutarMontaje(archivos, false, () => {})
}

async function conFocoBloqueado<T>(accion: () => Promise<T>) {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(() => {})
  try {
    return await accion()
  } finally {
    focus.mockRestore()
  }
}

function mensajesDe(enviar: ReturnType<typeof vi.fn>) {
  return enviar.mock.calls.map(([mensaje]) => mensaje)
}

afterEach(() => {
  console.log = consolaOriginal.log
  console.info = consolaOriginal.info
  console.warn = consolaOriginal.warn
  console.error = consolaOriginal.error
  document.body.replaceChildren()
  delete ventana.__configReactEnVivo
  delete ventana.__enviarReactEnVivo
  delete ventana.__comprobarReactEnVivo
  delete ventana.__pruebasEnVivo
  delete ventana.__peticionAbandonadaReactEnVivo
  delete ventana.__reactEnVivo
  delete ventana.__redReactEnVivo
  delete ventana.__REACT_DEVTOOLS_GLOBAL_HOOK__
  vi.restoreAllMocks()
})

describe('runtime de montaje', () => {
  it('monta App con varios archivos y avisa con montado', async () => {
    const enviar = await ejecutarMontaje([
      {
        nombre: 'App.jsx',
        codigo:
          "import Tarjeta from './Tarjeta'\nexport default function App() { return <Tarjeta /> }",
      },
      {
        nombre: 'Tarjeta.jsx',
        codigo: 'export default function Tarjeta() { return <p>Desde Tarjeta</p> }',
      },
    ])

    expect(await within(document.body).findByText('Desde Tarjeta')).toBeInTheDocument()
    expect(mensajesDe(enviar)).toContainEqual(
      expect.objectContaining({ tipo: 'montado', version: reactDelSandbox.React.version }),
    )
  })

  it('monta App.tsx, resuelve imports TSX sin extensión y supera comprobaciones', async () => {
    await ejecutarMontaje([
      {
        nombre: 'App.tsx',
        codigo: `import { useState } from 'react'
import Tarjeta from './Tarjeta'
interface Props { inicio?: number }
export default function App({ inicio = 1 }: Props) {
  const [n, setN] = useState<number>(inicio)
  return <Tarjeta n={n} onSumar={() => setN(n + 1)} />
}`,
      },
      {
        nombre: 'Tarjeta.tsx',
        codigo: `interface Props { n: number; onSumar: () => void }
export default function Tarjeta({ n, onSumar }: Props) {
  return <button onClick={onSumar}>Total: {n}</button>
}`,
      },
    ])
    ventana.__pruebasEnVivo = {
      ...await import('@testing-library/dom'),
      userEvent: userEventFalso,
    }

    expect(await ventana.__comprobarReactEnVivo?.([
      {
        descripcion: 'Suma uno',
        pasos: [{ pulsar: { rol: 'button', nombre: 'Total: 1' } }],
        espera: { texto: 'Total: 2' },
      },
    ])).toEqual([{ descripcion: 'Suma uno', ok: true }])
  })

  it('nombra App.tsx cuando falta su exportación por defecto', async () => {
    const enviar = await ejecutarMontaje([
      { nombre: 'App.tsx', codigo: 'export function App() { return <p /> }' },
    ])

    expect(mensajesDe(enviar)).toContainEqual(
      expect.objectContaining({
        tipo: 'error-render',
        texto: expect.stringContaining('App.tsx tiene que exportar un componente por defecto'),
      }),
    )
  })

  it('ubica en un archivo .ts un error lanzado desde un módulo importado', async () => {
    const enviar = await ejecutarMontaje([
      {
        nombre: 'App.tsx',
        codigo: "import { romper } from './logica'\nexport default function App() { romper(); return <p /> }",
      },
      { nombre: 'logica.ts', codigo: "export function romper(): never {\n  throw new Error('Roto desde TS')\n}" },
    ])

    await waitFor(() => {
      expect(mensajesDe(enviar)).toContainEqual(
        expect.objectContaining({ tipo: 'error-render', texto: 'Roto desde TS', archivo: 'logica.ts', linea: 2 }),
      )
    })
  })

  it('da un error claro si App.jsx no exporta por defecto', async () => {
    const enviar = await ejecutarMontaje([
      {
        nombre: 'App.jsx',
        codigo: 'export function App() { return <p /> }',
      },
    ])

    expect(mensajesDe(enviar)).toContainEqual(
      expect.objectContaining({
        tipo: 'error-render',
        texto: expect.stringContaining(
          'App.jsx tiene que exportar un componente por defecto',
        ),
      }),
    )
  })

  it('da un error claro al importar un paquete o un archivo que no existe', async () => {
    const paquete = await ejecutarMontaje([
      {
        nombre: 'App.jsx',
        codigo: "import axios from 'axios'\nexport default function App() { return <p /> }",
      },
    ])
    expect(mensajesDe(paquete)).toContainEqual(
      expect.objectContaining({
        tipo: 'error-render',
        texto: expect.stringContaining(
          'solo se puede importar React y tus propios archivos',
        ),
      }),
    )

    const archivo = await ejecutarMontaje([
      {
        nombre: 'App.jsx',
        codigo: "import T from './Tarjta'\nexport default function App() { return <T /> }",
      },
    ])
    expect(mensajesDe(archivo)).toContainEqual(
      expect.objectContaining({
        tipo: 'error-render',
        texto: 'No encuentro el archivo «./Tarjta»',
        archivo: 'App.jsx',
        linea: 1,
      }),
    )
  })

  it('en las comprobaciones escribe, pulsa y espera; y nombra lo que falta', async () => {
    await ejecutarMontaje([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [tareas, setTareas] = useState(['Leer'])
  const [nueva, setNueva] = useState('')
  const anadir = () => {
    if (!nueva) return
    setTareas([...tareas, nueva])
    setNueva('')
  }
  return <><label>Nueva tarea <input value={nueva} onChange={(e) => setNueva(e.target.value)} /></label><button onClick={anadir}>Añadir</button><ul>{tareas.map((tarea) => <li key={tarea}>{tarea}</li>)}</ul></>
}`,
      },
    ])
    ventana.__pruebasEnVivo = {
      ...await import('@testing-library/dom'),
      userEvent: userEventFalso,
    }

    const resultados = await ventana.__comprobarReactEnVivo?.([
      {
        descripcion: 'Añade la tarea',
        pasos: [
          { escribir: { etiqueta: 'Nueva tarea', texto: 'Comprar pan' } },
          { pulsar: { rol: 'button', nombre: 'Añadir' } },
        ],
        espera: { rol: 'listitem', texto: 'Comprar pan' },
      },
      {
        descripcion: 'Falta Guardar',
        pasos: [{ pulsar: { rol: 'button', nombre: 'Guardar' } }],
        espera: { texto: 'x' },
      },
      {
        descripcion: 'Vacía el campo',
        pasos: [
          { escribir: { etiqueta: 'Nueva tarea', texto: 'Comprar pan' } },
          { pulsar: { rol: 'button', nombre: 'Añadir' } },
        ],
        espera: { etiqueta: 'Nueva tarea', valor: '' },
      },
      {
        descripcion: 'Quita Leer',
        pasos: [],
        espera: { ausente: { texto: 'Leer' } },
      },
    ])

    expect(resultados).toEqual([
      { descripcion: 'Añade la tarea', ok: true },
      {
        descripcion: 'Falta Guardar',
        ok: false,
        motivo: 'No encuentro ningún botón llamado «Guardar».',
      },
      { descripcion: 'Vacía el campo', ok: true },
      {
        descripcion: 'Quita Leer',
        ok: false,
        motivo: 'Después de los pasos, todavía aparece el texto «Leer».',
      },
    ])
  })

  it('escribe en inputs controlados aunque WebKit bloquee el foco real', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [nombre, setNombre] = useState('')
  const [mayusculas, setMayusculas] = useState('')
  return <>
    <label>Nombre <input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
    <label>Mayúsculas <input value={mayusculas} onChange={(e) => setMayusculas(e.target.value.toUpperCase())} /></label>
  </>
}`,
      },
    ])

    const resultados = await conFocoBloqueado(() =>
      ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Escribe el nombre',
          pasos: [{ escribir: { etiqueta: 'Nombre', texto: 'Ana' } }],
          espera: { etiqueta: 'Nombre', valor: 'Ana' },
        },
        {
          descripcion: 'Respeta la transformación de la app',
          pasos: [{ escribir: { etiqueta: 'Mayúsculas', texto: 'ana' } }],
          espera: { etiqueta: 'Mayúsculas', valor: 'ANA' },
        },
      ]),
    )

    expect(resultados).toEqual([
      { descripcion: 'Escribe el nombre', ok: true },
      { descripcion: 'Respeta la transformación de la app', ok: true },
    ])
  })

  it('envía un formulario con Enter aunque WebKit bloquee el foco real', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [nombre, setNombre] = useState('')
  const [enviado, setEnviado] = useState('')
  return <form onSubmit={(e) => { e.preventDefault(); setEnviado(nombre) }}>
    <label>Nombre <input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
    <button type="submit">Enviar</button>
    {enviado && <p>Enviado: {enviado}</p>}
  </form>
}`,
      },
    ])

    const resultados = await conFocoBloqueado(() =>
      ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Envía con Enter',
          pasos: [
            { escribir: { etiqueta: 'Nombre', texto: 'Ana' } },
            { teclear: '{Enter}' },
          ],
          espera: { texto: 'Enviado: Ana' },
        },
      ]),
    )

    expect(resultados).toEqual([{ descripcion: 'Envía con Enter', ok: true }])
  })

  it('dispara onBlur al cambiar de campo con el foco real bloqueado', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [error, setError] = useState('')
  return <>
    <label>Nombre <input value={nombre} onChange={(e) => setNombre(e.target.value)} onBlur={() => setError(nombre ? '' : 'El nombre es obligatorio')} /></label>
    <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
    {error && <p>{error}</p>}
  </>
}`,
      },
    ])

    const resultados = await conFocoBloqueado(() =>
      ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Valida al salir de Nombre',
          pasos: [
            { escribir: { etiqueta: 'Nombre', texto: '' } },
            { escribir: { etiqueta: 'Correo', texto: 'ana@example.com' } },
          ],
          espera: { texto: 'El nombre es obligatorio' },
        },
      ]),
    )

    expect(resultados).toEqual([{ descripcion: 'Valida al salir de Nombre', ok: true }])
  })

  it('respeta maxLength y los keydown cancelados con el foco real bloqueado', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [corto, setCorto] = useState('')
  const [sinDigitos, setSinDigitos] = useState('')
  return <>
    <label>Corto <input maxLength={3} value={corto} onChange={(e) => setCorto(e.target.value)} /></label>
    <label>Sin dígitos <input value={sinDigitos} onKeyDown={(e) => { if (/\\d/.test(e.key)) e.preventDefault() }} onChange={(e) => setSinDigitos(e.target.value)} /></label>
  </>
}`,
      },
    ])

    const resultados = await conFocoBloqueado(() =>
      ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Limita la longitud',
          pasos: [{ escribir: { etiqueta: 'Corto', texto: 'Anabel' } }],
          espera: { etiqueta: 'Corto', valor: 'Ana' },
        },
        {
          descripcion: 'No escribe teclas canceladas',
          pasos: [{ escribir: { etiqueta: 'Sin dígitos', texto: 'a1b' } }],
          espera: { etiqueta: 'Sin dígitos', valor: 'ab' },
        },
      ]),
    )

    expect(resultados).toEqual([
      { descripcion: 'Limita la longitud', ok: true },
      { descripcion: 'No escribe teclas canceladas', ok: true },
    ])
  })

  it('selecciona una opción controlada con el foco real bloqueado', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [tecnologia, setTecnologia] = useState('react')
  return <>
    <label>Tecnología <select value={tecnologia} onChange={(e) => setTecnologia(e.target.value)}>
      <option value="react">React</option>
      <option value="typescript">TypeScript</option>
    </select></label>
    <p>Elegida: {tecnologia}</p>
  </>
}`,
      },
    ])

    const resultados = await conFocoBloqueado(() =>
      ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Selecciona TypeScript',
          pasos: [{ seleccionar: { etiqueta: 'Tecnología', opcion: 'typescript' } }],
          espera: { texto: 'Elegida: typescript' },
        },
      ]),
    )

    expect(resultados).toEqual([{ descripcion: 'Selecciona TypeScript', ok: true }])
  })

  it('respeta el foco simulado que la app mueve al único campo con error', async () => {
    const resultados = await conFocoBloqueado(async () => {
      await ejecutarMontajeConBundlesReales([
        {
          nombre: 'App.jsx',
          codigo: `import { useRef, useState } from 'react'
export default function App() {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [telefono, setTelefono] = useState('')
  const telefonoRef = useRef(null)
  return <form onSubmit={(e) => {
    e.preventDefault()
    if (nombre && correo && !telefono) telefonoRef.current.focus()
  }}>
    <label>Nombre <input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
    <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
    <label>Teléfono <input ref={telefonoRef} value={telefono} onChange={(e) => setTelefono(e.target.value)} /></label>
    <button type="submit">Enviar</button>
  </form>
}`,
        },
      ])

      return ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Escribe en el único campo con error',
          pasos: [
            { escribir: { etiqueta: 'Nombre', texto: 'Lucía' } },
            { escribir: { etiqueta: 'Correo', texto: 'lucia@example.com' } },
            { pulsar: { rol: 'button', nombre: 'Enviar' } },
            { teclear: '600123456' },
          ],
          espera: { etiqueta: 'Teléfono', valor: '600123456' },
        },
      ])
    })

    expect(resultados).toEqual([
      { descripcion: 'Escribe en el único campo con error', ok: true },
    ])
  })

  it('respeta el foco simulado que un efecto mueve al campo de un diálogo', async () => {
    const resultados = await conFocoBloqueado(async () => {
      await ejecutarMontajeConBundlesReales([
        {
          nombre: 'App.jsx',
          codigo: `import { useEffect, useRef, useState } from 'react'
export default function App() {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const nombreRef = useRef(null)
  useEffect(() => {
    if (abierto) nombreRef.current.focus()
  }, [abierto])
  return <>
    <button onClick={() => setAbierto(true)}>Reservar</button>
    {abierto && <div role="dialog" aria-label="Reserva">
      <label>Nombre <input ref={nombreRef} value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
    </div>}
  </>
}`,
        },
      ])

      return ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Escribe en el campo enfocado al abrir',
          pasos: [
            { pulsar: { rol: 'button', nombre: 'Reservar' } },
            { teclear: 'Lucía' },
          ],
          espera: { etiqueta: 'Nombre', valor: 'Lucía' },
        },
      ])
    })

    expect(resultados).toEqual([
      { descripcion: 'Escribe en el campo enfocado al abrir', ok: true },
    ])
  })

  it('no duplica los eventos de foco cuando el navegador acepta focus()', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useRef } from 'react'
export default function App() {
  const nombreRef = useRef(null)
  return <>
    <button onClick={() => nombreRef.current.focus()}>Editar nombre</button>
    <label>Nombre <input ref={nombreRef} /></label>
  </>
}`,
      },
    ])

    let eventosFocusIn = 0
    const contarFocusIn = () => {
      eventosFocusIn += 1
    }
    document.addEventListener('focusin', contarFocusIn)
    const pruebas = ventana.__pruebasEnVivo as {
      userEvent: { setup: (opciones: { document: Document }) => { click: (elemento: Element) => Promise<void> } }
    }
    await pruebas.userEvent.setup({ document }).click(
      await within(document.body).findByRole('button', { name: 'Editar nombre' }),
    )
    const eventosSinEnvoltorio = eventosFocusIn

    ;(document.activeElement as HTMLElement).blur()
    eventosFocusIn = 0
    const resultados = await ventana.__comprobarReactEnVivo!([
      {
        descripcion: 'La app mueve el foco real una sola vez',
        pasos: [{ pulsar: { rol: 'button', nombre: 'Editar nombre' } }],
        espera: { etiqueta: 'Nombre' },
      },
    ])
    const eventosConEnvoltorio = eventosFocusIn
    document.removeEventListener('focusin', contarFocusIn)

    expect(resultados).toEqual([
      { descripcion: 'La app mueve el foco real una sola vez', ok: true },
    ])
    expect(eventosSinEnvoltorio).toBeGreaterThan(0)
    expect(eventosConEnvoltorio).toBe(eventosSinEnvoltorio)
  })

  it('restaura HTMLElement.prototype.focus al terminar y aunque la comprobación lance', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: 'export default function App() { return <p>Lista</p> }',
      },
    ])
    const focusOriginal = HTMLElement.prototype.focus

    await expect(
      ventana.__comprobarReactEnVivo!([
        { descripcion: 'Termina con normalidad', pasos: [], espera: { texto: 'Lista' } },
      ]),
    ).resolves.toEqual([{ descripcion: 'Termina con normalidad', ok: true }])
    expect(HTMLElement.prototype.focus).toBe(focusOriginal)

    let focusDuranteLaComprobacion: typeof HTMLElement.prototype.focus | undefined
    ventana.__pruebasEnVivo = {
      ...ventana.__pruebasEnVivo,
      userEvent: {
        setup: () => {
          focusDuranteLaComprobacion = HTMLElement.prototype.focus
          throw new Error('Fallo preparado en user-event')
        },
      },
    }

    await expect(
      ventana.__comprobarReactEnVivo!([
        { descripcion: 'Falla al preparar el usuario', pasos: [], espera: { texto: 'Lista' } },
      ]),
    ).rejects.toThrow('Fallo preparado en user-event')

    expect(focusDuranteLaComprobacion).not.toBe(focusOriginal)
    expect(HTMLElement.prototype.focus).toBe(focusOriginal)
  })

  it('respeta el foco real que la app mueve a un campo tras pulsar', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useRef, useState } from 'react'
export default function App() {
  const [nombre, setNombre] = useState('')
  const nombreRef = useRef(null)
  return <form onSubmit={(e) => {
    e.preventDefault()
    if (!nombre) nombreRef.current.focus()
  }}>
    <label>Nombre <input ref={nombreRef} value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
    <button type="submit">Enviar</button>
  </form>
}`,
      },
    ])

    const resultados = await ventana.__comprobarReactEnVivo!([
      {
        descripcion: 'Escribe donde la app coloca el foco',
        pasos: [
          { pulsar: { rol: 'button', nombre: 'Enviar' } },
          { teclear: 'Lucía' },
        ],
        espera: { etiqueta: 'Nombre', valor: 'Lucía' },
      },
    ])

    expect(resultados).toEqual([
      { descripcion: 'Escribe donde la app coloca el foco', ok: true },
    ])
  })

  it('respeta el foco real devuelto al botón que abre un diálogo', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useRef, useState } from 'react'
export default function App() {
  const [abierto, setAbierto] = useState(false)
  const reservarRef = useRef(null)
  const cerrar = () => {
    setAbierto(false)
    reservarRef.current.focus()
  }
  return <>
    <button ref={reservarRef} onClick={() => setAbierto(true)}>Reservar</button>
    {abierto && <div role="dialog" aria-labelledby="titulo-reserva">
      <h2 id="titulo-reserva">Confirmar reserva</h2>
      <button onClick={cerrar}>Cancelar</button>
    </div>}
  </>
}`,
      },
    ])

    const resultados = await ventana.__comprobarReactEnVivo!([
      {
        descripcion: 'Vuelve a abrir el diálogo con Enter',
        pasos: [
          { pulsar: { rol: 'button', nombre: 'Reservar' } },
          { pulsar: { rol: 'button', nombre: 'Cancelar' } },
          { teclear: '{Enter}' },
        ],
        espera: { rol: 'heading', nombre: 'Confirmar reserva' },
      },
    ])

    expect(resultados).toEqual([
      { descripcion: 'Vuelve a abrir el diálogo con Enter', ok: true },
    ])
  })

  it('respeta el foco real que la app mueve al siguiente botón de una lista', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useRef, useState } from 'react'
export default function App() {
  const [personas, setPersonas] = useState(['Lucía', 'Bruno'])
  const quitarBrunoRef = useRef(null)
  const quitar = (nombre) => {
    setPersonas((actuales) => actuales.filter((persona) => persona !== nombre))
    if (nombre === 'Lucía') quitarBrunoRef.current.focus()
  }
  return <ul>{personas.map((persona) => <li key={persona}>
    {persona}
    <button ref={persona === 'Bruno' ? quitarBrunoRef : null} onClick={() => quitar(persona)}>
      Quitar a {persona}
    </button>
  </li>)}</ul>
}`,
      },
    ])

    const resultados = await ventana.__comprobarReactEnVivo!([
      {
        descripcion: 'Quita dos filas con ratón y teclado',
        pasos: [
          { pulsar: { rol: 'button', nombre: 'Quitar a Lucía' } },
          { teclear: '{Enter}' },
        ],
        espera: { ausente: { rol: 'button', nombre: 'Quitar a Bruno' } },
      },
    ])

    expect(resultados).toEqual([
      { descripcion: 'Quita dos filas con ratón y teclado', ok: true },
    ])
  })

  it('activa el foco simulado al pulsar si WebKit rechaza el foco desde el principio', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [pulsaciones, setPulsaciones] = useState(0)
  return <>
    <button onClick={() => setPulsaciones((actuales) => actuales + 1)}>Sumar</button>
    <p>Pulsaciones: {pulsaciones}</p>
  </>
}`,
      },
    ])

    const resultados = await conFocoBloqueado(() =>
      ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Pulsa dos veces sin foco real',
          pasos: [
            { pulsar: { rol: 'button', nombre: 'Sumar' } },
            { teclear: '{Enter}' },
          ],
          espera: { texto: 'Pulsaciones: 2' },
        },
      ]),
    )

    expect(resultados).toEqual([
      { descripcion: 'Pulsa dos veces sin foco real', ok: true },
    ])
  })

  it('pulsa botones y no conserva el campo anterior como activo', async () => {
    await ejecutarMontajeConBundlesReales([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [nombre, setNombre] = useState('')
  const [pulsado, setPulsado] = useState(false)
  const [enviado, setEnviado] = useState(false)
  return <form onSubmit={(e) => { e.preventDefault(); setEnviado(true) }}>
    <label>Nombre <input value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
    <button type="button" onClick={() => setPulsado(true)}>Vista previa</button>
    {pulsado && <p>Botón pulsado</p>}
    {enviado && <p>Formulario enviado</p>}
  </form>
}`,
      },
    ])

    const resultados = await conFocoBloqueado(() =>
      ventana.__comprobarReactEnVivo!([
        {
          descripcion: 'Pulsa el botón',
          pasos: [{ pulsar: { rol: 'button', nombre: 'Vista previa' } }],
          espera: { texto: 'Botón pulsado' },
        },
        {
          descripcion: 'Enter ya no actúa sobre el campo anterior',
          pasos: [
            { escribir: { etiqueta: 'Nombre', texto: 'Ana' } },
            { pulsar: { rol: 'button', nombre: 'Vista previa' } },
            { teclear: '{Enter}' },
          ],
          espera: { ausente: { texto: 'Formulario enviado' } },
        },
      ]),
    )

    expect(resultados).toEqual([
      { descripcion: 'Pulsa el botón', ok: true },
      { descripcion: 'Enter ya no actúa sobre el campo anterior', ok: true },
    ])
  })

  it('no se cuelga al comprobar una app que revienta al renderizar', async () => {
    await ejecutarMontaje([
      {
        nombre: 'App.jsx',
        codigo: "export default function App() { throw new Error('Roto') }",
      },
    ])
    ventana.__pruebasEnVivo = {
      ...await import('@testing-library/dom'),
      userEvent: userEventFalso,
    }

    const resultados = await ventana.__comprobarReactEnVivo?.([
      { descripcion: 'Primera', pasos: [], espera: { texto: 'a' } },
      { descripcion: 'Segunda', pasos: [], espera: { texto: 'b' } },
    ])

    expect(resultados).toEqual([
      {
        descripcion: 'Primera',
        ok: false,
        motivo: 'La app no llegó a mostrarse: Roto',
      },
      {
        descripcion: 'Segunda',
        ok: false,
        motivo: 'La app no llegó a mostrarse: Roto',
      },
    ])
  })
})

describe('comprobaciones: progreso y salida rápida', () => {
  it('avisa del progreso de cada comprobación y no espera si la app ya reventó', async () => {
    const enviar = await ejecutarMontaje([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [roto, setRoto] = useState(false)
  if (roto) throw new Error('Explota')
  return <button onClick={() => setRoto(true)}>Romper</button>
}`,
      },
    ])
    ventana.__pruebasEnVivo = {
      ...await import('@testing-library/dom'),
      userEvent: userEventFalso,
    }

    const inicio = performance.now()
    const resultados = await ventana.__comprobarReactEnVivo?.([
      {
        descripcion: 'Romper',
        pasos: [{ pulsar: { rol: 'button', nombre: 'Romper' } }],
        espera: { texto: 'nunca' },
      },
    ])

    expect(performance.now() - inicio).toBeLessThan(1000)
    expect(resultados).toEqual([
      { descripcion: 'Romper', ok: false, motivo: 'Al hacer los pasos, la app falló: Explota' },
    ])
    expect(mensajesDe(enviar)).toContainEqual({
      tipo: 'progreso-comprobaciones',
      resultado: { descripcion: 'Romper', ok: false, motivo: 'Al hacer los pasos, la app falló: Explota' },
    })
  })
})

describe('runtime que no llegó a cargar', () => {
  it('sin React, avisa en vez de quedarse en blanco y no cuelga las comprobaciones', async () => {
    const enviar = vi.fn()
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    ventana.__enviarReactEnVivo = enviar
    ventana.__configReactEnVivo = { modulos: {}, archivosCss: [], strictMode: false }

    new Function(montaje)()

    const motivo = 'No se pudo cargar React en la vista previa. Recarga la página para intentarlo de nuevo.'
    expect(mensajesDe(enviar)).toContainEqual({ tipo: 'error-render', texto: motivo })
    expect(mensajesDe(enviar)).toContainEqual(expect.objectContaining({ tipo: 'montado' }))
    expect(
      await ventana.__comprobarReactEnVivo?.([{ descripcion: 'd', pasos: [], espera: { texto: 'x' } }]),
    ).toEqual([{ descripcion: 'd', ok: false, motivo }])
  })

  it('sin Testing Library, cada comprobación lo explica', async () => {
    await ejecutarMontaje([{ nombre: 'App.jsx', codigo: 'export default function App() { return <p>Hola</p> }' }])

    expect(
      await ventana.__comprobarReactEnVivo?.([{ descripcion: 'd', pasos: [], espera: { texto: 'Hola' } }]),
    ).toEqual([
      {
        descripcion: 'd',
        ok: false,
        motivo: 'No se pudieron cargar las herramientas de comprobación. Recarga la página para intentarlo de nuevo.',
      },
    ])
  })
})

describe('puente del iframe', () => {
  it.each(['localStorage', 'sessionStorage'] as const)(
    'si %s lanza, el puente lo sustituye por un almacén en memoria',
    (nombre) => {
      const descriptor = Object.getOwnPropertyDescriptor(window, nombre)
      vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
      Object.defineProperty(window, nombre, {
        configurable: true,
        get() {
          throw new DOMException('Acceso denegado', 'SecurityError')
        },
      })
      try {
        new Function(puente)()
        const almacen = window[nombre]

        almacen.setItem('uno', '1')
        almacen.setItem('dos', '2')
        expect(almacen.getItem('uno')).toBe('1')
        expect(almacen.length).toBe(2)
        expect(almacen.key(1)).toBe('dos')
        almacen.removeItem('uno')
        expect(almacen.getItem('uno')).toBeNull()
        almacen.clear()
        expect(almacen.length).toBe(0)
        expect(almacen.key(0)).toBeNull()
      } finally {
        if (descriptor) Object.defineProperty(window, nombre, descriptor)
      }
    },
  )

  it('recorta textos de consola a 2000 y formatea %s', () => {
    console.log = vi.fn()
    console.error = vi.fn()
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})

    new Function(puente)()
    console.log('a'.repeat(5000))
    console.error('Hola %s, tienes %d', 'Ana', 3)
    ventana.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot?.()

    const enviados = postMessage.mock.calls.map(([mensaje]) => mensaje)
    expect(enviados).toContainEqual({
      canal: 'react-en-vivo',
      tipo: 'consola',
      nivel: 'log',
      texto: 'a'.repeat(2000),
      commit: 0,
    })
    expect(enviados).toContainEqual(
      expect.objectContaining({
        tipo: 'consola',
        nivel: 'error',
        texto: 'Hola Ana, tienes 3',
      }),
    )
    expect(enviados).toContainEqual({
      canal: 'react-en-vivo',
      tipo: 'commit',
      numero: 1,
    })
  })

  it('mide la altura del contenido, no la del iframe', () => {
    // scrollHeight nunca baja de la altura actual del iframe: una vista
    // previa con poco contenido se quedaba siempre más alta de lo necesario.
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue({
      height: 123.4,
    } as DOMRect)

    new Function(puente)()
    window.dispatchEvent(new Event('load'))

    expect(postMessage).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'alto', alto: 124 },
      '*',
    )
  })

  it('alert, confirm y prompt se ven en la vista previa y en la consola', () => {
    // El sandbox no permite ventanas modales: sin esto, alert() no hacía nada
    // y el alumno creía que su onClick no funcionaba.
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
    const originales = { alert: window.alert, confirm: window.confirm, prompt: window.prompt }
    try {
      new Function(puente)()
      window.alert('Hola')

      expect(postMessage).toHaveBeenCalledWith(
        { canal: 'react-en-vivo', tipo: 'consola', nivel: 'info', texto: 'alert: Hola', commit: 0 },
        '*',
      )
      expect(document.body).toHaveTextContent('Hola')
      expect(window.confirm('¿Seguro?')).toBe(true)
      expect(window.prompt('Nombre', 'Ana')).toBe('Ana')
      expect(window.prompt('Nombre')).toBe('')
    } finally {
      Object.assign(window, originales)
    }
  })

  it('el puente pasa la raíz y el número de commit a __arbolReactEnVivo', () => {
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
    const arbol = vi.fn()

    new Function(puente)()
    Object.assign(window, { __arbolReactEnVivo: arbol })
    try {
      ventana.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot?.(1, 'raíz')
      ventana.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot?.(1, 'raíz 2')

      expect(arbol.mock.calls).toEqual([
        ['raíz', 1],
        ['raíz 2', 2],
      ])
    } finally {
      Reflect.deleteProperty(window, '__arbolReactEnVivo')
    }
  })

  it('si __arbolReactEnVivo lanza, el mensaje commit se envía igual', () => {
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})

    new Function(puente)()
    Object.assign(window, {
      __arbolReactEnVivo: () => {
        throw new Error('árbol roto')
      },
    })
    try {
      expect(() => ventana.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot?.(1, 'raíz')).not.toThrow()
      expect(postMessage).toHaveBeenCalledWith({ canal: 'react-en-vivo', tipo: 'commit', numero: 1 }, '*')
    } finally {
      Reflect.deleteProperty(window, '__arbolReactEnVivo')
    }
  })

  it('encadena un hook de DevTools que ya existía', () => {
    const original = vi.fn()
    ventana.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { onCommitFiberRoot: original }
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})

    new Function(puente)()
    ventana.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot?.('raíz')

    expect(original).toHaveBeenCalledWith('raíz')
    expect(postMessage).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'commit', numero: 1 },
      '*',
    )
  })
})

const APP_CARGA_CON_BANDERA = `import { useEffect, useState } from 'react'
export default function App() {
  const [estado, setEstado] = useState('cargando')
  const [recetas, setRecetas] = useState([])
  const cargar = async (ignorar = () => false) => {
    setEstado('cargando')
    try {
      const respuesta = await fetch('/api/recetas')
      if (!respuesta.ok) throw new Error('Error del servidor')
      const siguientes = await respuesta.json()
      if (!ignorar()) {
        setRecetas(siguientes)
        setEstado('cargadas')
      }
    } catch (error) {
      if (error?.name !== 'AbortError' && !ignorar()) setEstado('error')
    }
  }
  useEffect(() => {
    let ignorar = false
    cargar(() => ignorar)
    return () => { ignorar = true }
  }, [])
  return <><p>{estado === 'error' ? 'No se pudieron cargar' : estado}</p>{estado === 'error' && <button onClick={() => cargar()}>Reintentar</button>}<ul>{recetas.map((receta) => <li key={receta.id}>{receta.nombre}</li>)}</ul></>
}`

const APP_CARGA_CON_ABORT = `import { useEffect, useState } from 'react'
export default function App() {
  const [estado, setEstado] = useState('cargando')
  const [recetas, setRecetas] = useState([])
  const cargar = async (signal) => {
    setEstado('cargando')
    try {
      const respuesta = await fetch('/api/recetas', signal ? { signal } : undefined)
      if (!respuesta.ok) throw new Error('Error del servidor')
      setRecetas(await respuesta.json())
      setEstado('cargadas')
    } catch (error) {
      if (error?.name !== 'AbortError') setEstado('error')
    }
  }
  useEffect(() => {
    const controlador = new AbortController()
    cargar(controlador.signal)
    return () => { controlador.abort() }
  }, [])
  return <><p>{estado === 'error' ? 'No se pudieron cargar' : estado}</p>{estado === 'error' && <button onClick={() => cargar()}>Reintentar</button>}<ul>{recetas.map((receta) => <li key={receta.id}>{receta.nombre}</li>)}</ul></>
}`

const APP_FORMULARIO_SIN_CARGA_INICIAL = `import { useState } from 'react'
export default function App() {
  const [nombre, setNombre] = useState('')
  const [estado, setEstado] = useState('listo')
  const enviar = async (evento) => {
    evento.preventDefault()
    const respuesta = await fetch('/api/recetas', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    })
    setEstado(respuesta.ok ? 'guardada' : 'No se pudo guardar')
  }
  return <form onSubmit={enviar}><label>Nombre<input value={nombre} onChange={(evento) => setNombre(evento.target.value)} /></label><button>Enviar</button><p>{estado}</p></form>
}`

const APP_BUSQUEDA_CON_TRANSICION = `import { startTransition, useState, useTransition } from 'react'
export default function App() {
  const [q, setQ] = useState('')
  const [objetos, setObjetos] = useState([])
  const [isPending, iniciarTransicion] = useTransition()
  const buscar = () => {
    iniciarTransicion(async () => {
      const respuesta = await fetch('/api/objetos?q=' + q)
      const datos = await respuesta.json()
      startTransition(() => setObjetos(datos))
    })
  }
  return <><label>Búsqueda<input value={q} onChange={(evento) => setQ(evento.target.value)} /></label><button onClick={buscar}>Buscar</button>{isPending && <p>Buscando…</p>}<ul>{objetos.map((objeto) => <li key={objeto.id}>{objeto.nombre}</li>)}</ul></>
}`

const APP_PETICION_SIN_CATCH = `import { useState } from 'react'
export default function App() {
  const [estado, setEstado] = useState('lista')
  const cargar = () => {
    window.__peticionAbandonadaReactEnVivo = fetch('/api/objetos')
    setEstado('enviada')
  }
  return <><button onClick={cargar}>Cargar</button><p>{estado}</p></>
}`

async function comprobarCargaConRed(
  codigo: string,
  strictMode: boolean,
  comprobaciones: ComprobacionReact[],
) {
  const originalFetch = window.fetch
  const transformacion = await transformarArchivos([{ nombre: 'App.jsx', codigo }])
  if (!transformacion.ok) throw new Error(transformacion.mensaje)
  document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
  instalarReact()
  ventana.__enviarReactEnVivo = vi.fn()
  ventana.__configReactEnVivo = {
    modulos: transformacion.modulos,
    archivosCss: transformacion.archivosCss,
    strictMode,
    api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
    red: { latencia: 0, desordenar: false },
  }
  try {
    new Function(red)()
    new Function(montaje)()
    ventana.__pruebasEnVivo = {
      ...await import('@testing-library/dom'),
      userEvent: userEventFalso,
    }
    return await ventana.__comprobarReactEnVivo?.(comprobaciones)
  } finally {
    window.fetch = originalFetch
  }
}

describe('comprobaciones con red', () => {
  it('una acción async abandonada no engancha la transición de la comprobación siguiente', async () => {
    const originalFetch = window.fetch
    const transformacion = await transformarArchivos([
      { nombre: 'App.jsx', codigo: APP_BUSQUEDA_CON_TRANSICION },
    ])
    if (!transformacion.ok) throw new Error(transformacion.mensaje)
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    instalarReact()
    ventana.__enviarReactEnVivo = vi.fn()
    ventana.__configReactEnVivo = {
      modulos: transformacion.modulos,
      archivosCss: [],
      strictMode: false,
      api: { objetos: [{ id: 1, nombre: 'Salmorejo' }] },
      red: { latencia: 600, desordenar: false },
    }
    try {
      new Function(red)()
      new Function(montaje)()
      ventana.__pruebasEnVivo = {
        ...await import('@testing-library/dom'),
        userEvent: userEventFalso,
      }

      expect(
        await ventana.__comprobarReactEnVivo?.([
          {
            descripcion: 'muestra el estado pendiente',
            pasos: [
              { escribir: { etiqueta: 'Búsqueda', texto: 'sal' } },
              { pulsar: { rol: 'button', nombre: 'Buscar' } },
            ],
            espera: { texto: 'Buscando…' },
          },
          {
            descripcion: 'muestra el resultado en la comprobación siguiente',
            pasos: [
              { escribir: { etiqueta: 'Búsqueda', texto: 'sal' } },
              { pulsar: { rol: 'button', nombre: 'Buscar' } },
            ],
            espera: { rol: 'listitem', texto: 'Salmorejo' },
          },
        ]),
      ).toEqual([
        { descripcion: 'muestra el estado pendiente', ok: true },
        { descripcion: 'muestra el resultado en la comprobación siguiente', ok: true },
      ])
    } finally {
      window.fetch = originalFetch
    }
  })

  it('el puente no publica como error el rechazo de un fetch abandonado sin catch', async () => {
    const originalFetch = window.fetch
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {})
    const transformacion = await transformarArchivos([
      { nombre: 'App.jsx', codigo: APP_PETICION_SIN_CATCH },
    ])
    if (!transformacion.ok) throw new Error(transformacion.mensaje)
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    new Function(puente)()
    instalarReact()
    ventana.__configReactEnVivo = {
      modulos: transformacion.modulos,
      archivosCss: [],
      strictMode: false,
      api: { objetos: [{ id: 1, nombre: 'Cuaderno' }] },
      red: { latencia: 600, desordenar: false },
    }
    try {
      new Function(red)()
      new Function(montaje)()
      ventana.__pruebasEnVivo = {
        ...await import('@testing-library/dom'),
        userEvent: userEventFalso,
      }

      expect(
        await ventana.__comprobarReactEnVivo?.([
          {
            descripcion: 'deja una petición pendiente',
            pasos: [{ pulsar: { rol: 'button', nombre: 'Cargar' } }],
            espera: { texto: 'enviada' },
          },
        ]),
      ).toEqual([{ descripcion: 'deja una petición pendiente', ok: true }])
      const peticion = ventana.__peticionAbandonadaReactEnVivo
      if (!peticion) throw new Error('La app no dejó la petición esperada')
      // Vitest trata el rechazo de Node como error de la suite antes de que jsdom
      // emita unhandledrejection. El arnés lo consume y reproduce el mismo evento;
      // la app del alumno sigue sin instalar ningún catch.
      const rechazo = peticion.catch((motivo) => motivo)

      await ventana.__comprobarReactEnVivo?.([
        { descripcion: 'reinicia la app', pasos: [], espera: { texto: 'lista' } },
      ])
      const motivo = await rechazo
      const evento = new Event('unhandledrejection', { cancelable: true })
      Object.defineProperty(evento, 'reason', { value: motivo })
      postMessage.mockClear()

      window.dispatchEvent(evento)

      expect(evento.defaultPrevented).toBe(true)
      expect(
        postMessage.mock.calls
          .map(([mensaje]) => mensaje)
          .filter(
            (mensaje) =>
              mensaje !== null &&
              typeof mensaje === 'object' &&
              'tipo' in mensaje &&
              mensaje.tipo === 'error',
          ),
      ).toEqual([])
    } finally {
      window.fetch = originalFetch
    }
  })

  it('en StrictMode muestra el fallo inicial con la solución de bandera ignorar', async () => {
    expect(
      await comprobarCargaConRed(APP_CARGA_CON_BANDERA, true, [
        {
          descripcion: 'muestra el error inicial',
          pasos: [{ red: 'fallar-siguiente' }],
          espera: { texto: 'No se pudieron cargar' },
        },
      ]),
    ).toEqual([{ descripcion: 'muestra el error inicial', ok: true }])
  })

  it('en StrictMode muestra el fallo inicial con AbortController', async () => {
    expect(
      await comprobarCargaConRed(APP_CARGA_CON_ABORT, true, [
        {
          descripcion: 'muestra el error inicial',
          pasos: [{ red: 'fallar-siguiente' }],
          espera: { texto: 'No se pudieron cargar' },
        },
      ]),
    ).toEqual([{ descripcion: 'muestra el error inicial', ok: true }])
  })

  it.each([
    ['bandera ignorar', APP_CARGA_CON_BANDERA],
    ['AbortController', APP_CARGA_CON_ABORT],
  ])('tras el fallo inicial con %s, Reintentar carga las recetas', async (_nombre, codigo) => {
    expect(
      await comprobarCargaConRed(codigo, true, [
        {
          descripcion: 'reintenta sin otro fallo pendiente',
          pasos: [
            { red: 'fallar-siguiente' },
            { pulsar: { rol: 'button', nombre: 'Reintentar' } },
          ],
          espera: { rol: 'listitem', texto: 'Salmorejo' },
        },
      ]),
    ).toEqual([{ descripcion: 'reintenta sin otro fallo pendiente', ok: true }])
  })

  it('sin StrictMode falla la única carga inicial y permite reintentar', async () => {
    expect(
      await comprobarCargaConRed(APP_CARGA_CON_BANDERA, false, [
        {
          descripcion: 'muestra el error inicial',
          pasos: [{ red: 'fallar-siguiente' }],
          espera: { texto: 'No se pudieron cargar' },
        },
        {
          descripcion: 'reintenta sin otro fallo pendiente',
          pasos: [
            { red: 'fallar-siguiente' },
            { pulsar: { rol: 'button', nombre: 'Reintentar' } },
          ],
          espera: { rol: 'listitem', texto: 'Salmorejo' },
        },
      ]),
    ).toEqual([
      { descripcion: 'muestra el error inicial', ok: true },
      { descripcion: 'reintenta sin otro fallo pendiente', ok: true },
    ])
  })

  it('reinicia API, fallo pendiente y almacenamiento entre comprobaciones', async () => {
    const originalFetch = window.fetch
    const transformacion = await transformarArchivos([{ nombre: 'App.jsx', codigo: `import { useEffect, useState } from 'react'
export default function App(){
  const [cantidad,setCantidad]=useState(null)
  const [guardado,setGuardado]=useState(localStorage.getItem('x') ? 'guardado' : 'vacío')
  const cargar=()=>fetch('/api/recetas').then(r=>r.json()).then(r=>setCantidad(r.length)).catch(()=>{})
  useEffect(()=>{cargar()},[])
  const añadir=()=>fetch('/api/recetas',{method:'POST',body:'{"nombre":"Nueva"}'}).then(cargar).catch(()=>{})
  const guardar=()=>{localStorage.setItem('x','1');setGuardado('guardado')}
  return <>{cantidad !== null && <><p>{cantidad} registros</p><button onClick={añadir}>Añadir</button><button onClick={guardar}>Guardar</button><button>No usar red</button></>}<p>{guardado}</p></>
}` }])
    if (!transformacion.ok) throw new Error(transformacion.mensaje)
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    instalarReact()
    ventana.__enviarReactEnVivo = vi.fn()
    ventana.__configReactEnVivo = { modulos: transformacion.modulos, archivosCss: [], strictMode: false, api: { recetas: [{ id: 1 }] }, red: { latencia: 0, desordenar: false } }
    try {
      new Function(red)()
      new Function(montaje)()
      ventana.__pruebasEnVivo = { ...await import('@testing-library/dom'), userEvent: userEventFalso }
      expect(await ventana.__comprobarReactEnVivo?.([
        { descripcion: 'modifica API', pasos: [{ pulsar: { rol: 'button', nombre: 'Añadir' } }], espera: { texto: '2 registros' } },
        { descripcion: 'API limpia', pasos: [], espera: { texto: '1 registros' } },
        { descripcion: 'guarda', pasos: [{ pulsar: { rol: 'button', nombre: 'Guardar' } }], espera: { texto: 'guardado' } },
        { descripcion: 'almacén limpio', pasos: [], espera: { texto: 'vacío' } },
        { descripcion: 'deja fallo pendiente', pasos: [{ pulsar: { rol: 'button', nombre: 'No usar red' } }, { red: 'fallar-siguiente' }], espera: { texto: '1 registros' } },
        { descripcion: 'fallo limpio', pasos: [], espera: { texto: '1 registros' } },
      ])).toEqual([
        { descripcion: 'modifica API', ok: true },
        { descripcion: 'API limpia', ok: true },
        { descripcion: 'guarda', ok: true },
        { descripcion: 'almacén limpio', ok: true },
        { descripcion: 'deja fallo pendiente', ok: true },
        { descripcion: 'fallo limpio', ok: true },
      ])
    } finally { window.fetch = originalFetch }
  })

  it('una petición pendiente de la comprobación anterior no modifica la API reiniciada', async () => {
    const originalFetch = window.fetch
    const transformacion = await transformarArchivos([{ nombre: 'App.jsx', codigo: `import { useEffect, useState } from 'react'
export default function App() {
  const [cantidad, setCantidad] = useState(null)
  const [estado, setEstado] = useState('lista')
  useEffect(() => {
    fetch('/api/recetas').then((respuesta) => respuesta.json()).then((datos) => setCantidad(datos.length)).catch(() => {})
  }, [])
  const añadir = () => {
    setEstado('enviada')
    fetch('/api/recetas', { method: 'POST', body: '{"nombre":"Nueva"}' }).catch(() => {})
  }
  return <><button onClick={añadir}>Añadir</button><p>{estado}</p>{cantidad !== null && <p>{cantidad} registros</p>}</>
}` }])
    if (!transformacion.ok) throw new Error(transformacion.mensaje)
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    instalarReact()
    ventana.__enviarReactEnVivo = vi.fn()
    ventana.__configReactEnVivo = {
      modulos: transformacion.modulos,
      archivosCss: transformacion.archivosCss,
      strictMode: false,
      api: { recetas: [{ id: 1 }] },
      red: { latencia: 200, desordenar: false },
    }
    try {
      new Function(red)()
      new Function(montaje)()
      ventana.__pruebasEnVivo = { ...await import('@testing-library/dom'), userEvent: userEventFalso }

      expect(await ventana.__comprobarReactEnVivo?.([
        {
          descripcion: 'deja un POST pendiente',
          pasos: [{ pulsar: { rol: 'button', nombre: 'Añadir' } }],
          espera: { texto: 'enviada' },
        },
        { descripcion: 've solo los datos originales', pasos: [], espera: { texto: '1 registros' } },
      ])).toEqual([
        { descripcion: 'deja un POST pendiente', ok: true },
        { descripcion: 've solo los datos originales', ok: true },
      ])
    } finally {
      window.fetch = originalFetch
    }
  })

  it('conserva el fallo inicial para el primer envío si el montaje no usa la API', async () => {
    expect(
      await comprobarCargaConRed(APP_FORMULARIO_SIN_CARGA_INICIAL, false, [
        {
          descripcion: 'muestra el error al enviar',
          pasos: [
            { red: 'fallar-siguiente' },
            { escribir: { etiqueta: 'Nombre', texto: 'Gazpacho' } },
            { pulsar: { rol: 'button', nombre: 'Enviar' } },
          ],
          espera: { texto: 'No se pudo guardar' },
        },
      ]),
    ).toEqual([{ descripcion: 'muestra el error al enviar', ok: true }])
  })

  it('aplica un fallo inicial antes de montar la app', async () => {
    const originalFetch = window.fetch
    const transformacion = await transformarArchivos([{ nombre: 'App.jsx', codigo: `import { useEffect, useState } from 'react'
export default function App(){ const [estado,setEstado]=useState('cargando'); useEffect(()=>{ fetch('/api/recetas').then(r=>setEstado(r.ok?'éxito':'error')) },[]); return <p>{estado}</p> }` }])
    if (!transformacion.ok) throw new Error(transformacion.mensaje)
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    instalarReact()
    ventana.__enviarReactEnVivo = vi.fn()
    ventana.__configReactEnVivo = { modulos: transformacion.modulos, archivosCss: [], strictMode: false, api: { recetas: [{ id: 1 }] }, red: { latencia: 0, desordenar: false } }
    try {
      new Function(red)()
      new Function(montaje)()
      ventana.__pruebasEnVivo = { ...await import('@testing-library/dom'), userEvent: userEventFalso }
      expect(await ventana.__comprobarReactEnVivo?.([{ descripcion: 'carga inicial', pasos: [{ red: 'fallar-siguiente' }], espera: { texto: 'error' } }])).toEqual([{ descripcion: 'carga inicial', ok: true }])
    } finally { window.fetch = originalFetch }
  })

  it('espera un control que aparece después de cargar la API', async () => {
    const originalFetch = window.fetch
    const transformacion = await transformarArchivos([{ nombre: 'App.jsx', codigo: `import { useEffect, useState } from 'react'
export default function App(){ const [listo,setListo]=useState(false); const [hecho,setHecho]=useState(false); useEffect(()=>{ fetch('/api/recetas').then(()=>setListo(true)) },[]); return <>{listo && <button onClick={()=>setHecho(true)}>Continuar</button>}{hecho && <p>hecho</p>}</> }` }])
    if (!transformacion.ok) throw new Error(transformacion.mensaje)
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    instalarReact()
    ventana.__enviarReactEnVivo = vi.fn()
    ventana.__configReactEnVivo = { modulos: transformacion.modulos, archivosCss: [], strictMode: false, api: { recetas: [{ id: 1 }] }, red: { latencia: 300, desordenar: false } }
    try {
      new Function(red)()
      new Function(montaje)()
      ventana.__pruebasEnVivo = { ...await import('@testing-library/dom'), userEvent: userEventFalso }
      expect(await ventana.__comprobarReactEnVivo?.([{ descripcion: 'espera botón', pasos: [{ pulsar: { rol: 'button', nombre: 'Continuar' } }], espera: { texto: 'hecho' } }])).toEqual([{ descripcion: 'espera botón', ok: true }])
    } finally { window.fetch = originalFetch }
  })

  it('una comprobación con el paso red: fallar-siguiente hace fallar la siguiente petición', async () => {
    const originalFetch = window.fetch
    const transformacion = await transformarArchivos([
      {
        nombre: 'App.jsx',
        codigo: `import { useState } from 'react'
export default function App() {
  const [estado, setEstado] = useState('lista')
  const cargar = async () => {
    const respuesta = await fetch('/api/recetas')
    setEstado(respuesta.ok ? 'éxito' : 'error')
  }
  return <><button onClick={() => setEstado('preparada')}>Preparar</button><button onClick={cargar}>Cargar</button><p>{estado}</p></>
}`,
      },
    ])
    if (!transformacion.ok) throw new Error(transformacion.mensaje)
    document.body.replaceChildren(Object.assign(document.createElement('div'), { id: 'root' }))
    instalarReact()
    ventana.__enviarReactEnVivo = vi.fn()
    ventana.__configReactEnVivo = {
      modulos: transformacion.modulos,
      archivosCss: transformacion.archivosCss,
      strictMode: false,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      red: { latencia: 0, desordenar: false },
    }
    try {
      new Function(red)()
      new Function(montaje)()
      ventana.__pruebasEnVivo = {
        ...await import('@testing-library/dom'),
        userEvent: userEventFalso,
      }

      expect(
        await ventana.__comprobarReactEnVivo?.([
          {
            descripcion: 'Maneja el error',
            pasos: [
              { pulsar: { rol: 'button', nombre: 'Preparar' } },
              { red: 'fallar-siguiente' },
              { pulsar: { rol: 'button', nombre: 'Cargar' } },
            ],
            espera: { texto: 'error' },
          },
        ]),
      ).toEqual([{ descripcion: 'Maneja el error', ok: true }])
    } finally {
      window.fetch = originalFetch
    }
  })
})
