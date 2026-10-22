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

vi.mock('@/lib/react-en-vivo/tipos', () => ({ diagnosticarTiposReact }))

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
  mostrarJsGenerado: true,
  mostrarArbol: false,
  mostrarEfectos: false,
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
      workers[0].responder({ id: 1, ok: false, error: 'Construcción no compatible' })
    })

    expect(
      await screen.findByText('App.jsx no se pudo compilar: Construcción no compatible'),
    ).toBeInTheDocument()
    await waitFor(() => expect(vista().getAttribute('srcdoc')).toContain('Hola'))
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
            columna: 12,
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
    expect(filas[1]).toHaveTextContent('App.tsx:7:12 · react-hooks/set-state-in-effect · Calling setState')
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
    let oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [],
    })
    expect(await screen.findByText('1 de 1 comprobaciones superadas')).toBeInTheDocument()
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
    oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [],
    })
    expect(await screen.findByText('El linter se rompió')).toBeInTheDocument()
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
    const oculto = (await screen.findByTitle('Comprobaciones')) as HTMLIFrameElement
    enviarDesde(oculto.contentWindow, { canal: 'react-en-vivo', tipo: 'montado', version: '19.3.1' })
    enviarDesde(oculto.contentWindow, {
      canal: 'react-en-vivo',
      tipo: 'resultado-comprobaciones',
      resultados: [],
    })

    expect(await screen.findByText('1 de 1 comprobaciones superadas')).toBeInTheDocument()
    expect(screen.getByText('El código no tiene errores de tipos')).toBeInTheDocument()
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

    expect(vista()).not.toBe(antes)
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
})
