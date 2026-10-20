import { fireEvent, waitFor, within } from '@testing-library/dom'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as JsxDevRuntime from 'react/jsx-dev-runtime'
import * as JsxRuntime from 'react/jsx-runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ArchivoReact, ComprobacionReact } from '@/lib/laboratorio/schemas'

import montaje from './runtime/montaje.js?raw'
import puente from './runtime/puente.js?raw'
import { transformarArchivos } from './transformar'

type VentanaRuntime = typeof window & {
  __configReactEnVivo?: {
    modulos: Record<string, string>
    archivosCss: string[]
    strictMode: boolean
  }
  __enviarReactEnVivo?: ReturnType<typeof vi.fn>
  __comprobarReactEnVivo?: (
    comprobaciones: ComprobacionReact[],
  ) => Promise<{ descripcion: string; ok: boolean; motivo?: string }[]>
  __pruebasEnVivo?: Record<string, unknown>
  __reactEnVivo?: Record<string, unknown>
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
  ventana.__reactEnVivo = {
    React,
    ReactDOM,
    ReactDOMClient,
    JsxRuntime,
    JsxDevRuntime,
  }
}

async function ejecutarMontaje(archivos: ArchivoReact[], strictMode = false) {
  const transformacion = await transformarArchivos(archivos)
  if (!transformacion.ok) throw new Error(transformacion.mensaje)

  document.body.innerHTML = '<div id="root"></div>'
  const enviar = vi.fn()
  instalarReact()
  ventana.__enviarReactEnVivo = enviar
  ventana.__configReactEnVivo = {
    modulos: transformacion.modulos,
    archivosCss: transformacion.archivosCss,
    strictMode,
  }
  new Function(montaje)()

  await waitFor(() => {
    expect(enviar).toHaveBeenCalledWith(
      expect.objectContaining({ tipo: 'montado', version: React.version }),
    )
  })
  return enviar
}

function mensajesDe(enviar: ReturnType<typeof vi.fn>) {
  return enviar.mock.calls.map(([mensaje]) => mensaje)
}

afterEach(() => {
  console.log = consolaOriginal.log
  console.info = consolaOriginal.info
  console.warn = consolaOriginal.warn
  console.error = consolaOriginal.error
  document.body.innerHTML = ''
  delete ventana.__configReactEnVivo
  delete ventana.__enviarReactEnVivo
  delete ventana.__comprobarReactEnVivo
  delete ventana.__pruebasEnVivo
  delete ventana.__reactEnVivo
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
      expect.objectContaining({ tipo: 'montado', version: React.version }),
    )
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

describe('puente del iframe', () => {
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
