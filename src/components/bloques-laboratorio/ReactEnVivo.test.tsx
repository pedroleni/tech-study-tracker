import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DatosReactEnVivo } from '@/lib/laboratorio/schemas'
import codigoCompilado from '@/lib/react-kit/__fixtures__/compilador-app.compilado.jsx?raw'
import codigoOriginal from '@/lib/react-kit/__fixtures__/compilador-app.jsx?raw'
import {
  crearClienteReactKit,
  type FabricaWorkerReactKit,
  type WorkerReactKit,
} from '@/lib/react-kit/cliente'

import { ReactEnVivo } from './ReactEnVivo'

const diagnosticarTiposReact = vi.hoisted(() => vi.fn())

vi.mock('@/lib/react-en-vivo/tipos', () => ({
  crearSesionTiposReact: () => ({ diagnosticar: diagnosticarTiposReact }),
}))

// CodeMirror no se deja teclear en jsdom: aquí se prueba la lógica del
// bloque, así que el editor se sustituye por un textarea con su etiqueta.
vi.mock('@/components/bloques-laboratorio/EditorCodeMirror', () => ({
  EditorCodeMirror: ({
    etiqueta,
    valor,
    onChange,
  }: {
    etiqueta: string
    valor: string
    onChange: (valor: string) => void
  }) => (
    <textarea aria-label={etiqueta} value={valor} onChange={(e) => onChange(e.target.value)} />
  ),
}))

const app = "import './estilos.css'\nexport default function App() {\n  return <p>Hola</p>\n}"

const datos: DatosReactEnVivo = {
  tipo: 'react-en-vivo',
  archivos: [
    { nombre: 'App.jsx', codigo: app },
    { nombre: 'estilos.css', codigo: 'p { color: red; }' },
  ],
  strictMode: true,
  mostrarConsola: true,
  barraDeDirecciones: true,
  mostrarJsGenerado: true,
  mostrarArbol: false,
  mostrarEfectos: false,
  mostrarRouter: false,
  mostrarLint: false,
  compilador: false,
  exigirLintLimpio: false,
  exigirTiposCorrectos: false,
  comprobaciones: [
    { descripcion: 'Saluda', pasos: [], espera: { texto: 'Hola' } },
    { descripcion: 'Guarda', pasos: [{ pulsar: { rol: 'button', nombre: 'Guardar' } }], espera: { texto: 'Guardado' } },
  ],
}

class WorkerLintFalso implements WorkerReactKit {
  onmessage: ((evento: MessageEvent<unknown>) => void) | null = null
  onerror: ((evento: ErrorEvent) => void) | null = null
  readonly mensajes: Array<{ id: number; tipo: string; archivos: DatosReactEnVivo['archivos'] }> = []
  readonly terminate = vi.fn()

  postMessage(mensaje: unknown) {
    this.mensajes.push(mensaje as (typeof this.mensajes)[number])
  }

  responder(datos: unknown) {
    this.onmessage?.(new MessageEvent('message', { data: datos }))
  }
}

class WorkerReactKitFalso implements WorkerReactKit {
  onmessage: ((evento: MessageEvent<unknown>) => void) | null = null
  onerror: ((evento: ErrorEvent) => void) | null = null
  readonly mensajes: unknown[] = []
  readonly terminate = vi.fn()

  postMessage(mensaje: unknown) {
    this.mensajes.push(mensaje)
  }

  responder(datos: unknown) {
    this.onmessage?.(new MessageEvent('message', { data: datos }))
  }
}

function prepararWorkerReactKit() {
  const workers: WorkerReactKitFalso[] = []
  const crearWorker: FabricaWorkerReactKit = () => {
    const worker = new WorkerReactKitFalso()
    workers.push(worker)
    return worker
  }
  return { clienteReactKit: crearClienteReactKit({ crearWorker }), workers }
}

function prepararWorkerLint() {
  const workers: WorkerLintFalso[] = []
  const crearWorker: FabricaWorkerReactKit = () => {
    const worker = new WorkerLintFalso()
    workers.push(worker)
    return worker
  }
  return { clienteReactKit: crearClienteReactKit({ crearWorker }), workers }
}

const vista = () => screen.getByTitle('Vista previa de React') as HTMLIFrameElement

function enviarDesde(origen: Window | null, data: unknown) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, source: origen }))
  })
}

async function renderizarListo(props: DatosReactEnVivo = datos) {
  render(<ReactEnVivo {...props} />)
  await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('jsxDEV'))
}

const datosTsx: DatosReactEnVivo = {
  ...datos,
  archivos: [
    {
      nombre: 'App.tsx',
      codigo: `import { useState } from 'react'
export default function App() {
  const [n, setN] = useState<number>(0)
  return <button onClick={() => setN(n + 1)}>Total: {n}</button>
}`,
    },
    { nombre: 'Tarjeta.tsx', codigo: 'export default function Tarjeta() { return <p /> }' },
  ],
}

beforeEach(() => {
  diagnosticarTiposReact.mockReset()
  diagnosticarTiposReact.mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ReactEnVivo', () => {
  const datosRouter = {
    ...datos,
    archivos: [
      {
        nombre: 'App.jsx',
        codigo:
          "import { createMemoryRouter } from 'react-router'\nimport { RouterProvider } from 'react-router/dom'\nconst router = createMemoryRouter([{ path: '/', Component: () => <p>Inicio</p> }])\nexport default function App() { return <RouterProvider router={router} /> }",
      },
    ],
    mostrarRouter: true,
  }

  const mensajeRouter = (id: number, destino = '/') => ({
    canal: 'react-en-vivo',
    tipo: 'router-operacion',
    id,
    clase: 'carga-inicial',
    metodo: 'GET',
    destino,
    estado: 'terminada',
    duracion: 4,
    pasos: [],
    truncado: false,
  })

  it('con mostrarRouter, el documento de la vista previa lleva registro-router.js y el de comprobar no', async () => {
    await renderizarListo({
      ...datosRouter,
      comprobaciones: [{ descripcion: 'Inicio', pasos: [], espera: { texto: 'Inicio' } }],
    })
    expect(vista().getAttribute('srcdoc')).toContain('window.__registroRouterEnVivo =')

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    expect(oculto.getAttribute('srcdoc')).not.toContain('window.__registroRouterEnVivo =')
  })

  it('pinta las operaciones que llegan y sustituye por id', async () => {
    await renderizarListo(datosRouter)
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, mensajeRouter(1, '/primera'))
    await waitFor(() => expect(screen.getByText(/Carga inicial \/primera/)).toBeInTheDocument())
    enviarDesde(vista().contentWindow, mensajeRouter(1, '/actualizada'))
    await waitFor(() => expect(screen.getByText(/Carga inicial \/actualizada/)).toBeInTheDocument())
    expect(screen.queryByText(/Carga inicial \/primera/)).toBeNull()
  })

  it('vacía el registro al editar, con Recargar y con Reiniciar', async () => {
    await renderizarListo(datosRouter)
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, mensajeRouter(1))
    await screen.findByText(/Carga inicial \/ ·/)

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: `${datosRouter.archivos[0].codigo}\n// editado` },
    })
    await waitFor(() => expect(screen.getByText('Todavía no hay actividad del router.')).toBeInTheDocument(), { timeout: 3000 })

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, mensajeRouter(2))
    await screen.findByText('#2')
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'ubicacion', url: '/', puedeAtras: false, puedeAdelante: false, origen: 'createMemoryRouter' })
    fireEvent.click(screen.getByRole('button', { name: 'Recargar' }))
    expect(screen.getByText('Todavía no hay actividad del router.')).toBeInTheDocument()

    enviarDesde(vista().contentWindow, mensajeRouter(3))
    await screen.findByText('#3')
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(screen.queryByText('#3')).toBeNull()
  })

  it('ignora router-operacion antes de montado', async () => {
    await renderizarListo(datosRouter)
    enviarDesde(vista().contentWindow, mensajeRouter(1, '/rezagada'))
    await act(async () => new Promise((resolver) => window.setTimeout(resolver, 60)))
    expect(screen.queryByText(/rezagada/)).toBeNull()
  })

  it('compila el fixture antes de montar y el JavaScript generado enseña esa salida', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerReactKit()
    render(
      <ReactEnVivo
        {...datos}
        archivos={[{ nombre: 'App.jsx', codigo: codigoOriginal }]}
        compilador
        mostrarJsGenerado
        clienteReactKit={clienteReactKit}
      />,
    )
    await act(async () => vi.advanceTimersByTime(0))
    expect(workers).toHaveLength(1)
    expect(workers[0].mensajes[0]).toEqual({
      id: 1,
      tipo: 'compilar',
      nombre: 'App.jsx',
      codigo: codigoOriginal,
    })

    await act(async () => {
      workers[0].responder({ id: 1, ok: true, codigo: codigoCompilado, eventos: [] })
    })
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('react/compiler-runtime'))

    fireEvent.click(screen.getByRole('button', { name: 'JavaScript generado' }))
    await waitFor(() => {
      const generado = screen.getByLabelText('JavaScript generado por React Compiler y Sucrase')
      expect(generado).toHaveTextContent('react/compiler-runtime')
      expect(generado).toHaveTextContent('_c(9)')
    })
  })

  it('si un archivo no se puede compilar lo monta original y muestra un aviso', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerReactKit()
    render(
      <ReactEnVivo {...datos} compilador clienteReactKit={clienteReactKit} />,
    )
    await act(async () => vi.advanceTimersByTime(0))
    await act(async () => {
      workers[0].responder({
        id: 1,
        ok: false,
        error: 'Construcción no compatible\n> 1 | marco interno',
      })
    })

    expect(
      await screen.findByText('App.jsx no se pudo compilar: Construcción no compatible'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/marco interno/)).toBeNull()
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Hola'))
  })

  it('omite el aviso del compilador si Sucrase ya explica el mismo archivo roto', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerReactKit()
    render(
      <ReactEnVivo
        {...datos}
        archivos={[{ nombre: 'App.jsx', codigo: 'export default function App() { return <p>hola</ }' }]}
        compilador
        clienteReactKit={clienteReactKit}
      />,
    )
    await act(async () => vi.advanceTimersByTime(0))
    await act(async () => {
      workers[0].responder({ id: 1, ok: false, error: 'El compilador también lo rechazó' })
    })

    expect(await screen.findByText(/Error de sintaxis en App.jsx/)).toBeInTheDocument()
    expect(screen.queryByText(/no se pudo compilar/)).toBeNull()
  })

  it('las comprobaciones también montan el código compilado', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerReactKit()
    render(
      <ReactEnVivo
        {...datos}
        archivos={[{ nombre: 'App.jsx', codigo: codigoOriginal }]}
        compilador
        clienteReactKit={clienteReactKit}
      />,
    )
    await act(async () => vi.advanceTimersByTime(0))
    await act(async () => {
      workers[0].responder({ id: 1, ok: true, codigo: codigoCompilado, eventos: [] })
    })
    await waitFor(() => expect(vista()).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    await waitFor(() => expect(workers[0].mensajes).toHaveLength(2))
    await act(async () => {
      workers[0].responder({ id: 2, ok: true, codigo: codigoCompilado, eventos: [] })
    })

    const comprobaciones = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    expect(comprobaciones.getAttribute('srcdoc')).toContain('react/compiler-runtime')
  })

  it('la comprobación no invalida la compilación pendiente de la vista previa', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerReactKit()
    render(
      <ReactEnVivo
        {...datos}
        archivos={[{ nombre: 'App.jsx', codigo: codigoOriginal }]}
        compilador
        clienteReactKit={clienteReactKit}
      />,
    )
    await act(async () => vi.advanceTimersByTime(0))
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    await waitFor(() => expect(workers[0].mensajes).toHaveLength(2))

    await act(async () => {
      workers[0].responder({ id: 2, ok: true, codigo: codigoCompilado, eventos: [] })
    })
    expect(await screen.findByTitle('Comprobaciones')).toBeInTheDocument()
    await act(async () => {
      workers[0].responder({ id: 1, ok: true, codigo: codigoCompilado, eventos: [] })
    })

    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('react/compiler-runtime'))
  })

  it('editar y comprobar antes del debounce conserva ambas compilaciones', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerReactKit()
    render(
      <ReactEnVivo
        {...datos}
        archivos={[{ nombre: 'App.jsx', codigo: codigoOriginal }]}
        compilador
        clienteReactKit={clienteReactKit}
      />,
    )
    await act(async () => vi.advanceTimersByTime(0))
    await act(async () => {
      workers[0].responder({ id: 1, ok: true, codigo: codigoCompilado, eventos: [] })
    })
    await waitFor(() => expect(vista()).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    await waitFor(() => expect(workers[0].mensajes).toHaveLength(2))
    await act(async () => vi.advanceTimersByTime(400))
    await waitFor(() => expect(workers[0].mensajes).toHaveLength(3))

    await act(async () => {
      workers[0].responder({ id: 3, ok: true, codigo: codigoCompilado, eventos: [] })
      workers[0].responder({ id: 2, ok: true, codigo: codigoCompilado, eventos: [] })
    })

    expect(await screen.findByTitle('Comprobaciones')).toBeInTheDocument()
    expect(screen.getByText('Comprobando…')).toBeInTheDocument()
  })

  it('carga el linter a los 400 ms, solo envía JSX/TSX y agrupa sus diagnósticos', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerLint()
    render(<ReactEnVivo {...datos} mostrarLint clienteReactKit={clienteReactKit} />)

    expect(screen.getByText('Cargando el linter…')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(399))
    expect(workers).toHaveLength(0)
    act(() => vi.advanceTimersByTime(1))
    expect(workers).toHaveLength(1)
    expect(workers[0].mensajes[0].archivos).toEqual([{ nombre: 'App.jsx', codigo: app }])

    act(() => {
      workers[0].responder({
        id: 1,
        ok: true,
        diagnosticos: [
          {
            archivo: 'App.jsx',
            linea: 2,
            columna: 3,
            regla: 'react-hooks/rules-of-hooks',
            mensaje: 'React Hook is called conditionally.\n\nHooks must run in the same order.',
            severidad: 'error',
          },
        ],
      })
    })

    expect(await screen.findByRole('heading', { name: 'App.jsx' })).toBeInTheDocument()
    expect(screen.getByText('2:3')).toBeInTheDocument()
    expect(screen.getByText('react-hooks/rules-of-hooks')).toBeInTheDocument()
    expect(screen.getByText('React Hook is called conditionally.')).toBeVisible()
    expect(screen.getByText('Hooks must run in the same order.')).not.toBeVisible()
  })

  it('recalcula tras la última edición y no pinta una respuesta vieja', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorkerLint()
    render(<ReactEnVivo {...datos} mostrarLint clienteReactKit={clienteReactKit} />)
    act(() => vi.advanceTimersByTime(400))
    expect(workers[0].mensajes).toHaveLength(1)

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })
    act(() => vi.advanceTimersByTime(399))
    expect(workers[0].mensajes).toHaveLength(1)
    act(() => vi.advanceTimersByTime(1))
    expect(workers[0].mensajes).toHaveLength(2)

    act(() => {
      workers[0].responder({
        id: 1,
        ok: true,
        diagnosticos: [{ archivo: 'App.jsx', linea: 1, columna: 1, regla: null, mensaje: 'Viejo', severidad: 'error' }],
      })
      workers[0].responder({ id: 2, ok: true, diagnosticos: [] })
    })

    expect(await screen.findByText('El linter no marca nada')).toBeInTheDocument()
    expect(screen.queryByText('Viejo')).toBeNull()
  })

  it('exigirLintLimpio falla con el primer diagnóstico y va después de tipos', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    diagnosticarTiposReact.mockResolvedValue([
      { archivo: 'App.tsx', linea: 3, columna: 10, mensaje: 'Tipo incorrecto', severidad: 'error' },
    ])
    const { clienteReactKit, workers } = prepararWorkerLint()
    render(
      <ReactEnVivo
        {...datosTsx}
        mostrarLint
        exigirTiposCorrectos
        exigirLintLimpio
        clienteReactKit={clienteReactKit}
      />,
    )
    act(() => vi.advanceTimersByTime(400))
    act(() => {
      workers[0].responder({
        id: 1,
        ok: true,
        diagnosticos: [
          {
            archivo: 'App.tsx',
            linea: 7,
            columna: 0,
            regla: 'react-hooks/set-state-in-effect',
            mensaje: `Calling setState synchronously within an effect ${'x'.repeat(300)}`,
            severidad: 'error',
          },
        ],
      })
    })
    await screen.findByText('Tipo incorrecto')
    await screen.findByText(/Calling setState synchronously/)

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    enviarDesde(oculto.contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [{ descripcion: 'Saluda', ok: true }],
    })

    const filas = within(await screen.findByRole('status')).getAllByRole('listitem')
    expect(filas[0]).toHaveTextContent('El código no tiene errores de tipos')
    expect(filas[1]).toHaveTextContent('El linter no marca nada')
    expect(filas[1]).toHaveTextContent('App.tsx:7 · react-hooks/set-state-in-effect · Calling setState')
    expect(filas[1].textContent!.length).toBeLessThan(300)
    expect(filas[2]).toHaveTextContent('Saluda')
  })

  it('exigirLintLimpio supera un resultado vacío y falla si el worker no carga', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const vacio = prepararWorkerLint()
    const { unmount } = render(
      <ReactEnVivo
        {...datos}
        comprobaciones={undefined}
        exigirLintLimpio
        clienteReactKit={vacio.clienteReactKit}
      />,
    )
    act(() => vi.advanceTimersByTime(400))
    await act(async () => {
      vacio.workers[0].responder({ id: 1, ok: true, diagnosticos: [] })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(await screen.findByText('1 de 1 comprobaciones superadas')).toBeInTheDocument()
    expect(screen.queryByTitle('Comprobaciones')).toBeNull()
    unmount()

    const fallo = prepararWorkerLint()
    render(
      <ReactEnVivo
        {...datos}
        comprobaciones={undefined}
        exigirLintLimpio
        clienteReactKit={fallo.clienteReactKit}
      />,
    )
    act(() => vi.advanceTimersByTime(400))
    await act(async () => {
      fallo.workers[0].responder({ id: 1, ok: false, error: 'El linter se rompió' })
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(await screen.findByText('El linter se rompió')).toBeInTheDocument()
    expect(screen.queryByTitle('Comprobaciones')).toBeNull()
  })

  it('abre App.tsx, muestra sus errores agrupados y genera JavaScript sin tipos', async () => {
    diagnosticarTiposReact.mockResolvedValue([
      { archivo: 'App.tsx', linea: 3, columna: 10, mensaje: 'Error en App', severidad: 'error' },
      { archivo: 'Tarjeta.tsx', linea: 1, columna: 1, mensaje: 'Error en Tarjeta', severidad: 'error' },
    ])
    await renderizarListo(datosTsx)

    expect(screen.getByRole('button', { name: 'App.tsx' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Editor de App.tsx')).toHaveValue(datosTsx.archivos[0].codigo)
    expect(await screen.findByRole('heading', { name: 'Errores de tipos' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'App.tsx' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tarjeta.tsx' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'JavaScript generado' }))
    await waitFor(() => {
      const generado = screen.getByLabelText('JavaScript generado por Sucrase')
      expect(generado).toHaveTextContent('// App.tsx')
      expect(generado).not.toHaveTextContent('useState<number>')
    })
  })

  it('espera 400 ms y descarta diagnósticos de una edición anterior', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    let resolverPrimero!: (valor: unknown[]) => void
    let resolverSegundo!: (valor: unknown[]) => void
    diagnosticarTiposReact
      .mockImplementationOnce(() => new Promise((resolver) => { resolverPrimero = resolver }))
      .mockImplementationOnce(() => new Promise((resolver) => { resolverSegundo = resolver }))
    render(<ReactEnVivo {...datosTsx} />)

    act(() => vi.advanceTimersByTime(399))
    expect(diagnosticarTiposReact).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    await waitFor(() => expect(diagnosticarTiposReact).toHaveBeenCalledTimes(1))

    fireEvent.change(screen.getByLabelText('Editor de App.tsx'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })
    act(() => vi.advanceTimersByTime(400))
    await waitFor(() => expect(diagnosticarTiposReact).toHaveBeenCalledTimes(2))

    await act(async () => {
      resolverSegundo([
        { archivo: 'App.tsx', linea: 1, columna: 1, mensaje: 'Diagnóstico nuevo', severidad: 'error' },
      ])
    })
    expect(await screen.findByText('Diagnóstico nuevo')).toBeInTheDocument()

    await act(async () => {
      resolverPrimero([
        { archivo: 'App.tsx', linea: 1, columna: 1, mensaje: 'Diagnóstico viejo', severidad: 'error' },
      ])
    })
    expect(screen.queryByText('Diagnóstico viejo')).toBeNull()
    expect(screen.getByText('Diagnóstico nuevo')).toBeInTheDocument()
  })

  it('conserva los diagnósticos anteriores sin mostrar una carga falsa al recalcular', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    let resolverSegunda!: (valor: unknown[]) => void
    diagnosticarTiposReact
      .mockResolvedValueOnce([
        { archivo: 'App.tsx', linea: 3, columna: 1, mensaje: 'Diagnóstico anterior', severidad: 'error' },
      ])
      .mockImplementationOnce(() => new Promise((resolver) => { resolverSegunda = resolver }))
    render(<ReactEnVivo {...datosTsx} />)
    await act(async () => vi.advanceTimersByTime(400))
    expect(await screen.findByText('Diagnóstico anterior')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Editor de App.tsx'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })

    expect(screen.getByText('Diagnóstico anterior')).toBeInTheDocument()
    expect(screen.queryByText('Cargando el compilador de TypeScript…')).toBeNull()
    act(() => vi.advanceTimersByTime(400))
    await waitFor(() => expect(diagnosticarTiposReact).toHaveBeenCalledTimes(2))
    await act(async () => resolverSegunda([]))
    expect(await screen.findByText('Sin errores de tipos.')).toBeInTheDocument()
  })

  it('exigirTiposCorrectos antepone el primer error al resultado de Comprobar', async () => {
    diagnosticarTiposReact.mockResolvedValue([
      { archivo: 'App.tsx', linea: 4, columna: 8, mensaje: 'Tipo incorrecto', severidad: 'error' },
    ])
    await renderizarListo({ ...datosTsx, exigirTiposCorrectos: true })
    await screen.findByText('Tipo incorrecto')

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    enviarDesde(oculto.contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [{ descripcion: 'Saluda', ok: true }],
    })

    const resultados = await screen.findByRole('status')
    const filas = within(resultados).getAllByRole('listitem')
    expect(filas[0]).toHaveTextContent('El código no tiene errores de tipos')
    expect(filas[0]).toHaveTextContent('App.tsx:4:8 · Tipo incorrecto')
    expect(filas[1]).toHaveTextContent('Saluda')
  })

  it('exigirTiposCorrectos aparece superada cuando no hay errores', async () => {
    await renderizarListo({ ...datosTsx, exigirTiposCorrectos: true, comprobaciones: undefined })
    await screen.findByText('Sin errores de tipos.')

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))

    expect(await screen.findByText('1 de 1 comprobaciones superadas')).toBeInTheDocument()
    expect(screen.getByText('El código no tiene errores de tipos')).toBeInTheDocument()
    expect(screen.queryByTitle('Comprobaciones')).toBeNull()
  })

  it('vaciar Tarjeta.tsx nunca da un positivo falso si falla el análisis', async () => {
    diagnosticarTiposReact
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("TS6053: File '/src/Tarjeta.tsx' not found"))
    await renderizarListo({ ...datosTsx, exigirTiposCorrectos: true, comprobaciones: undefined })
    await screen.findByText('Sin errores de tipos.')
    fireEvent.click(screen.getByRole('button', { name: 'Tarjeta.tsx' }))
    fireEvent.change(screen.getByLabelText('Editor de Tarjeta.tsx'), { target: { value: '' } })

    expect(await screen.findByText(/No se pudieron analizar los tipos/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))

    expect(await screen.findByText('0 de 1 comprobaciones superadas')).toBeInTheDocument()
    expect(screen.getByText(/No se pudieron comprobar los tipos: TS6053/)).toBeInTheDocument()
    expect(screen.queryByTitle('Comprobaciones')).toBeNull()
  })

  it('explica por qué Comprobar espera a tipos o linter', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    diagnosticarTiposReact.mockImplementation(() => new Promise(() => {}))
    const tipos = render(
      <ReactEnVivo {...datosTsx} comprobaciones={undefined} exigirTiposCorrectos />,
    )
    expect(screen.getByRole('button', { name: 'Esperando a los tipos…' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    tipos.unmount()

    const { clienteReactKit } = prepararWorkerLint()
    render(
      <ReactEnVivo
        {...datos}
        comprobaciones={undefined}
        exigirLintLimpio
        clienteReactKit={clienteReactKit}
      />,
    )
    expect(screen.getByRole('button', { name: 'Esperando al linter…' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('usa ids distintos para los paneles de tipos de dos bloques', async () => {
    render(
      <>
        <ReactEnVivo {...datosTsx} etiquetaSeccion="Primer bloque" />
        <ReactEnVivo {...datosTsx} etiquetaSeccion="Segundo bloque" />
      </>,
    )
    const titulos = await screen.findAllByRole('heading', { name: 'Errores de tipos' })
    expect(titulos[0].id).not.toBe(titulos[1].id)
    expect(titulos[0].closest('section')).toHaveAttribute('aria-labelledby', titulos[0].id)
    expect(titulos[1].closest('section')).toHaveAttribute('aria-labelledby', titulos[1].id)
    expect(titulos[0].closest('section')).not.toHaveAttribute('aria-label')
    expect(titulos[1].closest('section')).not.toHaveAttribute('aria-label')
  })

  it('el panel TSX no introduce problemas automáticos de accesibilidad', async () => {
    render(<ReactEnVivo {...datosTsx} />)
    await screen.findByText('Sin errores de tipos.')
    const panel = screen.getByRole('heading', { name: 'Errores de tipos' }).closest('section')
    expect(panel).not.toBeNull()
    expect(
      (await axe(panel!, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
  })

  it('una pestaña por archivo y otra para el JavaScript generado; abre archivoInicial', async () => {
    await renderizarListo({ ...datos, archivoInicial: 'estilos.css' })

    expect(screen.getByRole('button', { name: 'App.jsx' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'estilos.css' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Editor de estilos.css')).toHaveValue('p { color: red; }')

    fireEvent.click(screen.getByRole('button', { name: 'JavaScript generado' }))
    await waitFor(() =>
      expect(screen.getByLabelText('JavaScript generado por Sucrase')).toHaveTextContent('_jsx('),
    )
  })

  it('la vista previa carga el runtime propio y el código transformado', async () => {
    await renderizarListo()

    expect(vista().getAttribute('srcdoc')).toContain('/vendor/react-en-vivo/19.3.1/react.js')
    expect(vista().getAttribute('srcdoc')).not.toContain('/vendor/react-en-vivo/19.3.1/pruebas.js')
  })

  it('un bloque solo JSX no carga el comprobador de tipos', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(<ReactEnVivo {...datos} />)

    await act(async () => {
      vi.advanceTimersByTime(1_000)
    })

    expect(diagnosticarTiposReact).not.toHaveBeenCalled()
    expect(screen.queryByRole('heading', { name: 'Errores de tipos' })).toBeNull()
  })

  it('un error de sintaxis no rompe la vista previa', async () => {
    await renderizarListo()
    const valido = vista().getAttribute('srcdoc')

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() {\n  return <div>\n}' },
    })

    expect(
      await screen.findByText('Error de sintaxis en App.jsx, línea 2: Unterminated JSX contents', {}, { timeout: 3000 }),
    ).toBeInTheDocument()
    expect(vista().getAttribute('srcdoc')).toBe(valido)
  })

  it('explica el JSX inválido inicial y no deja la vista previa preparando para siempre', async () => {
    render(
      <ReactEnVivo
        {...datos}
        archivos={[
          {
            nombre: 'App.jsx',
            codigo:
              'export default function App() { return (<h1>a</h1><p>b</p>) }',
          },
        ]}
      />,
    )

    expect(await screen.findByText(/Error de sintaxis en App\.jsx/)).toHaveClass('font-mono')
    const explicacion = screen.getByText(
      'Qué suele significar: Suele ser JSX mal formado: dos elementos sueltos que hay que envolver en <>…</> o en otro elemento, una etiqueta sin cerrar, o una llave o un paréntesis de más o de menos.',
    )
    expect(explicacion.tagName).toBe('P')
    expect(explicacion).not.toHaveClass('font-mono')
    expect(
      screen.getByText(
        'La vista previa arrancará en cuanto el código compile: corrige el error de sintaxis.',
      ),
    ).toHaveClass('text-sm', 'text-muted-foreground')
    expect(screen.queryByText('Preparando React…')).toBeNull()
  })

  it('sigue mostrando Preparando React mientras aún no hay resultado de compilación', () => {
    render(<ReactEnVivo {...datos} />)

    expect(screen.getByText('Preparando React…')).toHaveClass(
      'text-sm',
      'text-muted-foreground',
    )
  })

  it('Reiniciar devuelve los archivos originales', async () => {
    await renderizarListo()
    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), { target: { value: 'otra cosa' } })

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(screen.getByLabelText('Editor de App.jsx')).toHaveValue(app)
  })

  it('la consola agrupa por commit, se limpia, guarda las 200 últimas e ignora otras ventanas', async () => {
    await renderizarListo()
    const consola = screen.getByRole('log')

    for (const [texto, commit] of [['render', 0], ['render', 0], ['efecto', 1]] as const) {
      enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'consola', nivel: 'log', texto, commit })
    }
    enviarDesde(window, { canal: 'react-en-vivo', tipo: 'consola', nivel: 'log', texto: 'intruso', commit: 0 })
    await waitFor(() => expect(within(consola).getAllByText('render')).toHaveLength(2))
    expect(within(consola).getAllByText('commit 1')).toHaveLength(1)
    expect(within(consola).queryByText('intruso')).toBeNull()

    fireEvent.click(within(screen.getByRole('region', { name: 'React en vivo' })).getByRole('button', { name: 'Limpiar' }))
    expect(within(consola).queryByText('render')).toBeNull()

    for (let numero = 1; numero <= 250; numero += 1) {
      enviarDesde(vista().contentWindow, {
        canal: 'react-en-vivo',
        tipo: 'consola',
        nivel: 'log',
        texto: `mensaje ${numero}`,
        commit: 2,
      })
    }
    await waitFor(() => expect(within(consola).getAllByText(/^mensaje \d+$/)).toHaveLength(200))
    expect(within(consola).getAllByText(/^mensaje \d+$/)[0]).toHaveTextContent('mensaje 51')
  })

  it('Comprobar lanza el iframe oculto, envía las comprobaciones y pinta el resultado', async () => {
    await renderizarListo()

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    expect(oculto).toHaveAttribute('aria-hidden', 'true')
    expect(oculto.getAttribute('srcdoc')).toContain('/vendor/react-en-vivo/19.3.1/pruebas.js')

    const enviado = vi.spyOn(oculto.contentWindow!, 'postMessage')
    enviarDesde(oculto.contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    expect(enviado).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'comprobar', comprobaciones: datos.comprobaciones },
      '*',
    )

    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [
        { descripcion: 'Saluda', ok: true },
        { descripcion: 'Guarda', ok: false, motivo: 'No encuentro ningún botón llamado «Guardar».' },
      ],
    })
    expect(await screen.findByText('1 de 2 comprobaciones superadas')).toBeInTheDocument()
    expect(screen.getByText('No encuentro ningún botón llamado «Guardar».')).toBeInTheDocument()
    expect(screen.queryByTitle('Comprobaciones')).toBeNull()
  })

  it('si la comprobación no responde, avisa a los 15 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await renderizarListo()

    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    await screen.findByTitle('Comprobaciones')
    // El temporizador lo programa el efecto del iframe oculto, que puede no
    // haber corrido aún: primero se vacían los efectos pendientes, luego se
    // adelanta el reloj, y se comprueba sin esperas (un waitFor dispararía su
    // propio temporizador falso).
    await act(async () => {})
    act(() => {
      vi.advanceTimersByTime(15_000)
    })

    expect(
      screen.getByText('La comprobación tardó demasiado. Revisa si tu código se queda en un bucle.'),
    ).toBeInTheDocument()
  })

  it('Reiniciar vuelve a arrancar la app aunque el código no haya cambiado', async () => {
    await renderizarListo()
    const antes = vista()

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

    expect(screen.queryByTitle('Vista previa de React')).toBeNull()
    await waitFor(() => expect(vista()).not.toBe(antes), { timeout: 3000 })
  })

  it('Comprobar conserva el foco del teclado', async () => {
    await renderizarListo()
    const boton = screen.getByRole('button', { name: 'Comprobar' })
    boton.focus()

    fireEvent.click(boton)
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    // Mientras comprueba no se desactiva del todo (perdería el foco), solo se marca.
    expect(boton).not.toBeDisabled()
    expect(boton).toHaveAttribute('aria-disabled', 'true')

    // user-event, dentro del iframe oculto, se lleva el foco allí.
    oculto.focus()
    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [{ descripcion: 'Saluda', ok: true }],
    })
    await screen.findByText('1 de 1 comprobaciones superadas')
    expect(document.activeElement).toBe(boton)
  })

  it('con mostrarArbol muestra el panel «Árbol de renders» y pinta el mensaje arbol que llega del iframe', async () => {
    await renderizarListo({ ...datos, mostrarArbol: true })

    expect(vista().getAttribute('srcdoc')).toContain('__resaltados-react-en-vivo')
    expect(screen.getByRole('heading', { name: 'Árbol de renders' })).toBeInTheDocument()
    expect(screen.getByText('Usa la vista previa para ver qué se vuelve a renderizar.')).toBeInTheDocument()

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 1,
      nodos: [{ id: 1, nivel: 0, nombre: 'App', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    expect(await screen.findByText('Commit 1 · 0 renderizados · 1 montado · 1 cambio en el DOM')).toBeInTheDocument()
  })

  it('sin mostrarArbol no hay panel ni se pide arbol.js', async () => {
    await renderizarListo()

    expect(vista().getAttribute('srcdoc')).not.toContain('__resaltados-react-en-vivo')
    expect(screen.queryByRole('heading', { name: 'Árbol de renders' })).toBeNull()
  })

  it('al reconstruir ignora árboles rezagados hasta que el documento nuevo está montado', async () => {
    await renderizarListo({ ...datos, mostrarArbol: true })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 1,
      nodos: [{ id: 1, nivel: 0, nombre: 'App', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    await screen.findByText(/^Commit 1/)

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() {\n  return <p>Adiós</p>\n}' },
    })
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Adiós'), { timeout: 3000 })
    expect(screen.queryByText(/^Commit 1/)).toBeNull()
    expect(screen.getByText('Usa la vista previa para ver qué se vuelve a renderizar.')).toBeInTheDocument()

    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 2,
      nodos: [{ id: 1, nivel: 0, nombre: 'Viejo', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    expect(screen.getByText('Usa la vista previa para ver qué se vuelve a renderizar.')).toBeInTheDocument()
    expect(screen.queryByText('Viejo')).toBeNull()

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'arbol',
      commit: 1,
      nodos: [{ id: 1, nivel: 0, nombre: 'Nuevo', estado: 'montado', renders: 1, motivos: [], props: [], estados: [] }],
      truncado: false,
      cambiosDom: 1,
    })
    expect(await screen.findByText('Nuevo')).toBeInTheDocument()
  })

  it('sin comprobaciones no ofrece Comprobar; sin consola no la pinta', async () => {
    await renderizarListo({ ...datos, comprobaciones: undefined, mostrarConsola: false })

    expect(screen.queryByRole('button', { name: 'Comprobar' })).toBeNull()
    expect(screen.queryByRole('log')).toBeNull()
  })

  it('con api muestra Red, pasa api y red al documento y envía los controles al iframe', async () => {
    await renderizarListo({
      ...datos,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      red: { latencia: 600, desordenar: false },
    })
    expect(screen.getByRole('heading', { name: 'Red' })).toBeInTheDocument()
    expect(vista().getAttribute('srcdoc')).toContain('Salmorejo')
    expect(vista().getAttribute('srcdoc')).toContain('window.__redReactEnVivo =')

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    const enviar = vi.spyOn(vista().contentWindow!, 'postMessage')
    fireEvent.change(screen.getByRole('slider', { name: 'Latencia' }), { target: { value: '900' } })
    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'red', latencia: 900, desordenar: false },
      '*',
    )
  })

  it('mantiene el aviso de fallo tras cancelar y lo quita al consumirse el 500', async () => {
    await renderizarListo({ ...datos, api: { recetas: [{ id: 1 }] } })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    fireEvent.click(screen.getByRole('button', { name: 'Fallar la siguiente petición' }))
    expect(screen.getByRole('status')).toHaveTextContent('La siguiente petición fallará')
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'peticion', id: 1, metodo: 'GET', ruta: '/api/recetas', estado: 'cancelada' })
    expect(screen.getByRole('status')).toHaveTextContent('La siguiente petición fallará')
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'peticion', id: 2, metodo: 'GET', ruta: '/api/recetas', estado: 'error', codigo: 500 })
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('con mostrarEfectos muestra el registro y pide efectos.js', async () => {
    await renderizarListo({ ...datos, mostrarEfectos: true })
    expect(screen.getByRole('heading', { name: 'Efectos' })).toBeInTheDocument()
    expect(vista().getAttribute('srcdoc')).toContain('window.__efectosReactEnVivo = { envolver }')
  })

  it('al reconstruir vacía el registro de peticiones y el de efectos', async () => {
    await renderizarListo({
      ...datos,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      mostrarEfectos: true,
    })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'peticion',
      id: 1,
      metodo: 'GET',
      ruta: '/api/recetas',
      estado: 'ok',
      codigo: 200,
      ms: 600,
    })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'efecto',
      commit: 1,
      componente: 'App',
      archivo: 'App.jsx',
      linea: 2,
      accion: 'efecto',
      clase: 'useEffect',
      motivo: 'montaje',
      cambios: [],
    })
    expect(await screen.findByText('GET /api/recetas · 200 · 600 ms')).toBeInTheDocument()
    expect(screen.getByText('App ▶ efecto · montaje')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Nuevo'), { timeout: 3000 })
    expect(screen.queryByText('GET /api/recetas · 200 · 600 ms')).toBeNull()
    expect(screen.queryByText('App ▶ efecto · montaje')).toBeNull()
  })

  it('ignora peticiones y efectos rezagados hasta que el documento nuevo se monta', async () => {
    await renderizarListo({ ...datos, api: { recetas: [{ id: 1 }] }, mostrarEfectos: true })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'peticion', id: 1, metodo: 'GET', ruta: '/api/recetas', estado: 'ok', codigo: 200 })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'efecto', commit: 1, componente: 'Viejo', archivo: 'App.jsx', linea: 1, accion: 'efecto', clase: 'useEffect', motivo: 'montaje', cambios: [] })
    await new Promise((resolver) => window.setTimeout(resolver, 60))
    expect(screen.queryByText(/GET \/api\/recetas/)).toBeNull()
    expect(screen.queryByText(/Viejo/)).toBeNull()

    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'peticion', id: 2, metodo: 'GET', ruta: '/api/recetas', estado: 'ok', codigo: 200 })
    expect(await screen.findByText('GET /api/recetas · 200')).toBeInTheDocument()
  })

  it('no reconstruye la vista previa si api cambia solo de identidad', async () => {
    const api = { recetas: [{ id: 1, nombre: 'Pisto' }] }
    const { rerender } = render(<ReactEnVivo {...datos} api={api} mostrarEfectos />)
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Pisto'))
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'efecto', commit: 1, componente: 'App', archivo: 'App.jsx', linea: 1, accion: 'efecto', clase: 'useEffect', motivo: 'montaje', cambios: [] })
    expect(await screen.findByText('App ▶ efecto · montaje')).toBeInTheDocument()

    rerender(<ReactEnVivo {...datos} api={{ recetas: [{ id: 1, nombre: 'Pisto' }] }} mostrarEfectos />)
    await new Promise((resolver) => window.setTimeout(resolver, 450))
    expect(screen.getByText('App ▶ efecto · montaje')).toBeInTheDocument()
  })

  it('el documento de comprobación lleva la red de comprobación a latencia 0', async () => {
    await renderizarListo({
      ...datos,
      api: { recetas: [{ id: 1, nombre: 'Salmorejo' }] },
      red: undefined,
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    expect(oculto.getAttribute('srcdoc')).toContain('"red":{"latencia":0,"desordenar":false}')
  })

  it('no enseña la barra hasta que llega una ubicacion, ni con barraDeDirecciones false', async () => {
    const { unmount } = render(<ReactEnVivo {...datos} barraDeDirecciones />)
    await waitFor(() => expect(vista()).toBeInTheDocument())
    expect(screen.queryByRole('form', { name: 'Barra de direcciones de la vista previa' })).toBeNull()
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/',
      puedeAtras: false,
      puedeAdelante: false,
      origen: 'createMemoryRouter',
    })
    expect(screen.getByRole('form', { name: 'Barra de direcciones de la vista previa' })).toBeInTheDocument()

    unmount()
    await renderizarListo({ ...datos, barraDeDirecciones: false })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/',
      puedeAtras: false,
      puedeAdelante: false,
      origen: 'MemoryRouter',
    })
    expect(screen.queryByRole('form', { name: 'Barra de direcciones de la vista previa' })).toBeNull()
  })

  it('al editar el código, el documento nuevo arranca en la última URL', async () => {
    await renderizarListo({ ...datos, urlInicial: '/inicio' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/recetas/2',
      puedeAtras: true,
      puedeAdelante: false,
      origen: 'createMemoryRouter',
    })
    fireEvent.change(screen.getByLabelText('Editor de App.jsx'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })

    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Nuevo'), { timeout: 3000 })
    expect(vista().getAttribute('srcdoc')).toContain('"urlInicial":"/recetas/2"')
  })

  it('Reiniciar descarta la orden y el srcdoc anteriores antes de volver a urlInicial', async () => {
    await renderizarListo({ ...datos, urlInicial: '/inicio' })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/inicio',
      puedeAtras: false,
      puedeAdelante: false,
      origen: 'createMemoryRouter',
    })
    fireEvent.change(screen.getByLabelText('Dirección de la vista previa'), {
      target: { value: '/secreto' },
    })
    fireEvent.submit(screen.getByRole('form', { name: 'Barra de direcciones de la vista previa' }))
    const ventanaAnterior = vista().contentWindow
    enviarDesde(ventanaAnterior, {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/secreto',
      puedeAtras: true,
      puedeAdelante: false,
      origen: 'createMemoryRouter',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))

    expect(screen.queryByTitle('Vista previa de React')).toBeNull()
    enviarDesde(ventanaAnterior, {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/secreto',
      puedeAtras: true,
      puedeAdelante: false,
      origen: 'createMemoryRouter',
    })

    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('"urlInicial":"/inicio"'), {
      timeout: 3000,
    })
    const enviar = vi.spyOn(vista().contentWindow!, 'postMessage')
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    expect(enviar).not.toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'navegador', accion: 'ir', url: '/secreto' },
      '*',
    )
  })

  it('Recargar vacía la consola y manda la orden sin reconstruir el documento', async () => {
    await renderizarListo({ ...datos, urlInicial: '/inicio' })
    enviarDesde(vista().contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'consola',
      nivel: 'log',
      texto: 'antes',
      commit: 1,
    })
    enviarDesde(vista().contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'ubicacion',
      url: '/inicio',
      puedeAtras: false,
      puedeAdelante: false,
      origen: 'createMemoryRouter',
    })
    expect(await screen.findByText('antes')).toBeInTheDocument()
    const srcDocAnterior = vista().getAttribute('srcdoc')
    const enviar = vi.spyOn(vista().contentWindow!, 'postMessage')

    fireEvent.click(screen.getByRole('button', { name: 'Recargar' }))

    expect(screen.queryByText('antes')).toBeNull()
    expect(vista().getAttribute('srcdoc')).toBe(srcDocAnterior)
    expect(enviar).toHaveBeenCalledWith(
      { canal: 'react-en-vivo', tipo: 'navegador', accion: 'recargar' },
      '*',
    )
  })

  it('Comprobar prepara el documento con la urlInicial del bloque', async () => {
    await renderizarListo({ ...datos, urlInicial: '/comienzo' })
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    expect(oculto.getAttribute('srcdoc')).toContain('"urlInicial":"/comienzo"')
  })
})
