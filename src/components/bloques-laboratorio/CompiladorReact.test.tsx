import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'

import codigoCompilado from '@/lib/react-kit/__fixtures__/compilador-app.compilado.jsx?raw'
import codigoOriginal from '@/lib/react-kit/__fixtures__/compilador-app.jsx?raw'
import {
  crearClienteReactKit,
  type FabricaWorkerReactKit,
  type WorkerReactKit,
} from '@/lib/react-kit/cliente'

import { CompiladorReact } from './CompiladorReact'

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
    <textarea aria-label={etiqueta} value={valor} onChange={(evento) => onChange(evento.target.value)} />
  ),
}))

class WorkerCompiladorFalso implements WorkerReactKit {
  onmessage: ((evento: MessageEvent<unknown>) => void) | null = null
  onerror: ((evento: ErrorEvent) => void) | null = null
  readonly mensajes: Array<{ id: number; tipo: string; codigo: string }> = []
  readonly terminate = vi.fn()

  postMessage(mensaje: unknown) {
    this.mensajes.push(mensaje as (typeof this.mensajes)[number])
  }

  responder(datos: unknown) {
    this.onmessage?.(new MessageEvent('message', { data: datos }))
  }
}

function prepararWorker() {
  const workers: WorkerCompiladorFalso[] = []
  const crearWorker: FabricaWorkerReactKit = () => {
    const worker = new WorkerCompiladorFalso()
    workers.push(worker)
    return worker
  }
  return { clienteReactKit: crearClienteReactKit({ crearWorker }), workers }
}

afterEach(() => vi.useRealTimers())

describe('CompiladorReact', () => {
  it('compila el fixture real tras 300 ms y escribe el resultado y cada estado', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorker()
    const { container } = render(
      <CompiladorReact
        tipo="compilador-react"
        titulo="React Compiler por dentro"
        consigna="Compara el componente con su salida."
        codigo={codigoOriginal}
        clienteReactKit={clienteReactKit}
      />,
    )

    expect(screen.getByText('Cargando el compilador…')).toBeInTheDocument()
    expect(workers).toHaveLength(0)
    act(() => vi.advanceTimersByTime(299))
    expect(workers).toHaveLength(0)
    act(() => vi.advanceTimersByTime(1))
    expect(workers[0].mensajes[0]).toEqual({
      id: 1,
      tipo: 'compilar',
      nombre: 'App.jsx',
      codigo: codigoOriginal,
    })

    await act(async () => {
      workers[0].responder({
        id: 1,
        ok: true,
        codigo: codigoCompilado,
        eventos: [
          { componente: 'Fila', estado: 'compilado', linea: 3 },
          {
            componente: 'App',
            estado: 'omitido',
            linea: 7,
            motivo: 'El componente contiene una construcción no compatible.',
          },
        ],
      })
    })

    const region = screen.getByRole('region', { name: 'React Compiler por dentro' })
    expect(within(region).queryAllByRole('region')).toHaveLength(0)
    const entrada = screen.getByRole('heading', { name: 'Componente' }).parentElement!
    const salida = screen.getByRole('heading', { name: 'Código compilado' }).parentElement!
    expect(within(entrada).getByLabelText('Editor del componente JSX')).toHaveValue(codigoOriginal)
    expect(salida).toHaveAttribute('aria-live', 'off')
    expect(salida.querySelector('pre')).toHaveTextContent('react/compiler-runtime')
    expect(screen.getByText('Fila: compilado')).toBeInTheDocument()
    expect(
      screen.getByText(
        'App: no se compiló · El componente contiene una construcción no compatible.',
      ),
    ).toBeInTheDocument()
    expect(container.querySelector('.md\\:grid-cols-2')).not.toBeNull()
    expect(
      (await axe(container, { rules: { 'color-contrast': { enabled: false } } })).violations,
    ).toEqual([])
  })

  it('descarta una respuesta vieja, muestra fallos y restablece el código', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { clienteReactKit, workers } = prepararWorker()
    render(
      <CompiladorReact
        tipo="compilador-react"
        codigo={codigoOriginal}
        clienteReactKit={clienteReactKit}
      />,
    )
    act(() => vi.advanceTimersByTime(300))

    fireEvent.change(screen.getByLabelText('Editor del componente JSX'), {
      target: { value: 'export default function App() { return <p>Nuevo</p> }' },
    })
    act(() => vi.advanceTimersByTime(300))
    expect(workers[0].mensajes).toHaveLength(2)

    await act(async () => {
      workers[0].responder({ id: 1, ok: true, codigo: 'salida vieja', eventos: [] })
      workers[0].responder({ id: 2, ok: false, error: 'El compilador rechazó App.jsx' })
    })
    expect(screen.queryByText('salida vieja')).toBeNull()
    expect(screen.getByText('El compilador rechazó App.jsx')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer' }))
    expect(screen.getByLabelText('Editor del componente JSX')).toHaveValue(codigoOriginal)
  })
})
