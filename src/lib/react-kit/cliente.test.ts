import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  RUTAS_WORKERS_REACT_KIT,
  crearClienteReactKit,
  type FabricaWorkerReactKit,
  type WorkerReactKit,
} from './cliente'

class WorkerFalso implements WorkerReactKit {
  onmessage: ((evento: MessageEvent<unknown>) => void) | null = null
  onerror: ((evento: ErrorEvent) => void) | null = null
  readonly mensajes: unknown[] = []
  readonly terminate = vi.fn()

  constructor(readonly ruta: string) {}

  postMessage(mensaje: unknown) {
    this.mensajes.push(mensaje)
  }

  responder(datos: unknown) {
    this.onmessage?.(new MessageEvent('message', { data: datos }))
  }

  fallar() {
    this.onerror?.(new ErrorEvent('error'))
  }
}

function prepararCliente() {
  const workers: WorkerFalso[] = []
  const crearWorker: FabricaWorkerReactKit = (ruta) => {
    const worker = new WorkerFalso(ruta)
    workers.push(worker)
    return worker
  }
  return { cliente: crearClienteReactKit({ crearWorker }), workers }
}

const archivos = [{ nombre: 'App.jsx', codigo: 'export default function App() {}' }]
const diagnostico = {
  archivo: 'App.jsx',
  linea: 10,
  columna: 5,
  regla: 'react-hooks/set-state-in-effect',
  mensaje: 'Calling setState synchronously within an effect can trigger cascading renders',
  severidad: 'error' as const,
}

describe('cliente de los workers de React Kit', () => {
  it('compila JSX/TSX con el segundo worker, valida sus eventos y descarta resultados viejos', async () => {
    const { cliente, workers } = prepararCliente()
    const sesion = cliente.crearSesionCompilador()
    const vieja = sesion.compilar('function App() {}')
    const nueva = sesion.compilar('function App(): JSX.Element {}', { typescript: true })

    expect(workers).toHaveLength(1)
    expect(workers[0].ruta).toBe('/vendor/react-kit/1/compilador.js')
    expect(workers[0].mensajes).toEqual([
      { id: 1, tipo: 'compilar', codigo: 'function App() {}' },
      {
        id: 2,
        tipo: 'compilar',
        codigo: 'function App(): JSX.Element {}',
        typescript: true,
      },
    ])

    workers[0].responder({
      id: 1,
      ok: true,
      codigo: 'viejo',
      eventos: [{ componente: 'App', estado: 'compilado', linea: 1 }],
    })
    workers[0].responder({
      id: 2,
      ok: true,
      codigo: 'nuevo',
      eventos: [
        { componente: 'Fila', estado: 'compilado', linea: 2 },
        { componente: null, estado: 'omitido', linea: null, motivo: 'No es un componente' },
      ],
    })

    await expect(vieja).resolves.toBeNull()
    await expect(nueva).resolves.toEqual({
      ok: true,
      codigo: 'nuevo',
      eventos: [
        { componente: 'Fila', estado: 'compilado', linea: 2 },
        { componente: null, estado: 'omitido', linea: null, motivo: 'No es un componente' },
      ],
    })
  })

  it('rechaza respuestas inválidas del compilador y traduce un fallo de carga', async () => {
    const { cliente, workers } = prepararCliente()
    const invalida = cliente.crearSesionCompilador().compilar('function App() {}')
    workers[0].responder({
      id: 1,
      ok: true,
      codigo: 'salida',
      eventos: [{ componente: 'App', estado: 'desconocido', linea: 1 }],
    })
    await expect(invalida).resolves.toEqual({
      ok: false,
      error: 'No se pudo cargar el compilador de React',
    })

    const fallo = cliente.crearSesionCompilador().compilar('function App() {}')
    workers[0].fallar()
    await expect(fallo).resolves.toEqual({
      ok: false,
      error: 'No se pudo cargar el compilador de React',
    })
    expect(workers[0].terminate).toHaveBeenCalledOnce()
  })

  it('crea el worker clásico al primer uso, lo reutiliza y asigna ids crecientes', async () => {
    const { cliente, workers } = prepararCliente()
    const bloqueA = cliente.crearSesionLint()
    const bloqueB = cliente.crearSesionLint()

    expect(workers).toHaveLength(0)
    const respuestaA = bloqueA.analizar(archivos)
    expect(workers).toHaveLength(1)
    expect(workers[0].ruta).toBe('/vendor/react-kit/1/lint.js')
    expect(workers[0].mensajes[0]).toEqual({ id: 1, tipo: 'lint', archivos })

    const respuestaB = bloqueB.analizar(archivos)
    expect(workers).toHaveLength(1)
    expect(workers[0].mensajes[1]).toEqual({ id: 2, tipo: 'lint', archivos })

    workers[0].responder({ id: 1, ok: true, diagnosticos: [diagnostico] })
    workers[0].responder({ id: 2, ok: true, diagnosticos: [] })
    await expect(respuestaA).resolves.toEqual({ ok: true, diagnosticos: [diagnostico] })
    await expect(respuestaB).resolves.toEqual({ ok: true, diagnosticos: [] })
  })

  it('descarta una respuesta si ya no es la última petición de ese bloque', async () => {
    const { cliente, workers } = prepararCliente()
    const bloque = cliente.crearSesionLint()
    const vieja = bloque.analizar(archivos)
    const nueva = bloque.analizar([{ nombre: 'App.jsx', codigo: 'nuevo' }])

    workers[0].responder({ id: 1, ok: true, diagnosticos: [diagnostico] })
    workers[0].responder({ id: 2, ok: true, diagnosticos: [] })

    await expect(vieja).resolves.toBeNull()
    await expect(nueva).resolves.toEqual({ ok: true, diagnosticos: [] })
  })

  it('valida estrictamente las respuestas y limita diagnósticos y mensajes', async () => {
    const casosInvalidos = [
      { id: 1, ok: true, diagnosticos: [], sobra: true },
      { id: 1, ok: true, diagnosticos: Array(201).fill(diagnostico) },
      { id: 1, ok: true, diagnosticos: [{ ...diagnostico, mensaje: 'x'.repeat(2001) }] },
    ]

    for (const respuesta of casosInvalidos) {
      const { cliente, workers } = prepararCliente()
      const pendiente = cliente.crearSesionLint().analizar(archivos)
      workers[0].responder(respuesta)
      await expect(pendiente).resolves.toEqual({
        ok: false,
        error: 'No se pudo cargar el linter',
      })
    }
  })

  it('propaga el error controlado del worker y traduce un fallo de carga', async () => {
    const { cliente, workers } = prepararCliente()
    const falloControlado = cliente.crearSesionLint().analizar(archivos)
    workers[0].responder({ id: 1, ok: false, error: 'El parser no pudo analizar App.jsx' })
    await expect(falloControlado).resolves.toEqual({
      ok: false,
      error: 'El parser no pudo analizar App.jsx',
    })

    const falloCarga = cliente.crearSesionLint().analizar(archivos)
    workers[0].fallar()
    await expect(falloCarga).resolves.toEqual({ ok: false, error: 'No se pudo cargar el linter' })
  })

  it('devuelve un error en español si el constructor de Worker falla', async () => {
    const crearWorker = vi.fn(() => {
      throw new Error('Worker no disponible')
    })
    const cliente = crearClienteReactKit({ crearWorker })

    await expect(cliente.crearSesionLint().analizar(archivos)).resolves.toEqual({
      ok: false,
      error: 'No se pudo cargar el linter',
    })
  })

  it('limita a dos los intentos seguidos de crear un worker', async () => {
    const crearWorker = vi.fn(() => {
      throw new Error('Worker no disponible')
    })
    const cliente = crearClienteReactKit({ crearWorker })
    const sesion = cliente.crearSesionLint()

    await expect(sesion.analizar(archivos)).resolves.toMatchObject({ ok: false })
    await expect(sesion.analizar(archivos)).resolves.toMatchObject({ ok: false })
    await expect(sesion.analizar(archivos)).resolves.toMatchObject({ ok: false })

    expect(crearWorker).toHaveBeenCalledTimes(2)
  })

  it('resuelve con un error en español si una petición tarda más de 20 s', async () => {
    vi.useFakeTimers()
    const { cliente, workers } = prepararCliente()
    const pendiente = cliente.crearSesionLint().analizar(archivos)

    await vi.advanceTimersByTimeAsync(20_000)

    await expect(pendiente).resolves.toEqual({
      ok: false,
      error: 'El linter tardó demasiado en responder',
    })
    workers[0].responder({ id: 1, ok: true, diagnosticos: [] })
    await expect(pendiente).resolves.toMatchObject({ ok: false })
  })

  it('reserva rutas versionadas separadas para linter y compilador', () => {
    expect(RUTAS_WORKERS_REACT_KIT).toEqual({
      lint: '/vendor/react-kit/1/lint.js',
      compilador: '/vendor/react-kit/1/compilador.js',
    })
  })
})

afterEach(() => vi.useRealTimers())
