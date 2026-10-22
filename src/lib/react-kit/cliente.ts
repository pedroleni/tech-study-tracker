import { z } from 'zod'

import type { ArchivoReact } from '@/lib/laboratorio/schemas'

export const RUTAS_WORKERS_REACT_KIT = {
  lint: '/vendor/react-kit/1/lint.js',
  compilador: '/vendor/react-kit/1/compilador.js',
} as const

const ERROR_CARGA_LINTER = 'No se pudo cargar el linter'
const ERROR_CARGA_COMPILADOR = 'No se pudo cargar el compilador de React'

const esquemaDiagnosticoLint = z.strictObject({
  archivo: z.string().min(1).max(120),
  linea: z.number().int().min(1).max(1_000_000),
  columna: z.number().int().min(1).max(1_000_000),
  regla: z.string().min(1).max(200).nullable(),
  mensaje: z.string().max(2000),
  severidad: z.enum(['error', 'aviso']),
})

const esquemaRespuestaLint = z.discriminatedUnion('ok', [
  z.strictObject({
    id: z.number().int().positive(),
    ok: z.literal(true),
    diagnosticos: z.array(esquemaDiagnosticoLint).max(200),
  }),
  z.strictObject({
    id: z.number().int().positive(),
    ok: z.literal(false),
    error: z.string().min(1).max(2000),
  }),
])

const esquemaEventoCompilador = z.strictObject({
  componente: z.string().max(200).nullable(),
  estado: z.enum(['compilado', 'omitido', 'error']),
  linea: z.number().int().min(1).max(1_000_000).nullable(),
  motivo: z.string().max(600).optional(),
})

const esquemaRespuestaCompilador = z.discriminatedUnion('ok', [
  z.strictObject({
    id: z.number().int().positive(),
    ok: z.literal(true),
    codigo: z.string().max(100_000),
    eventos: z.array(esquemaEventoCompilador).max(200),
  }),
  z.strictObject({
    id: z.number().int().positive(),
    ok: z.literal(false),
    error: z.string().min(1).max(2000),
  }),
])

export type DiagnosticoLint = z.infer<typeof esquemaDiagnosticoLint>
export type ResultadoLint =
  | { ok: true; diagnosticos: DiagnosticoLint[] }
  | { ok: false; error: string }
export type EventoCompilador = z.infer<typeof esquemaEventoCompilador>
export type ResultadoCompilador =
  | { ok: true; codigo: string; eventos: EventoCompilador[] }
  | { ok: false; error: string }

export interface WorkerReactKit {
  onmessage: ((evento: MessageEvent<unknown>) => void) | null
  onerror: ((evento: ErrorEvent) => void) | null
  postMessage: (mensaje: unknown) => void
}

export type FabricaWorkerReactKit = (ruta: string) => WorkerReactKit

type Pendiente<T> = {
  esLaUltima: (id: number) => boolean
  resolver: (resultado: T | null) => void
}

type ConfiguracionCanal<T> = {
  ruta: string
  crearWorker: FabricaWorkerReactKit
  validar: (datos: unknown) => { success: true; data: { id: number } & T } | { success: false }
  errorCarga: T
}

// La mecánica de carga, ids, reutilización y descarte vive en un canal
// genérico para poder conectar después compilador.js sin duplicarla.
class CanalWorker<T> {
  private worker: WorkerReactKit | null = null
  private siguienteId = 0
  private readonly pendientes = new Map<number, Pendiente<T>>()

  constructor(private readonly configuracion: ConfiguracionCanal<T>) {}

  solicitar(
    construirMensaje: (id: number) => unknown,
    registrarUltima: (id: number) => void,
    esLaUltima: (id: number) => boolean,
  ): Promise<T | null> {
    const id = ++this.siguienteId
    registrarUltima(id)

    return new Promise((resolver) => {
      this.pendientes.set(id, { resolver, esLaUltima })
      let worker: WorkerReactKit
      try {
        worker = this.obtenerWorker()
        worker.postMessage(construirMensaje(id))
      } catch {
        this.resolverPendiente(id, this.configuracion.errorCarga)
      }
    })
  }

  private obtenerWorker() {
    if (this.worker) return this.worker
    const worker = this.configuracion.crearWorker(this.configuracion.ruta)
    worker.onmessage = (evento) => this.recibir(evento.data)
    worker.onerror = () => this.fallarCarga()
    this.worker = worker
    return worker
  }

  private recibir(datos: unknown) {
    const respuesta = this.configuracion.validar(datos)
    if (respuesta.success) {
      const { id, ...resultado } = respuesta.data
      this.resolverPendiente(id, resultado as T)
      return
    }

    const id =
      typeof datos === 'object' && datos !== null && 'id' in datos &&
      typeof datos.id === 'number' && Number.isInteger(datos.id)
        ? datos.id
        : null
    if (id !== null && this.pendientes.has(id)) {
      this.resolverPendiente(id, this.configuracion.errorCarga)
      return
    }
    this.fallarPendientes(this.configuracion.errorCarga)
  }

  private resolverPendiente(id: number, resultado: T) {
    const pendiente = this.pendientes.get(id)
    if (!pendiente) return
    this.pendientes.delete(id)
    pendiente.resolver(pendiente.esLaUltima(id) ? resultado : null)
  }

  private fallarPendientes(resultado: T) {
    for (const id of [...this.pendientes.keys()]) this.resolverPendiente(id, resultado)
  }

  private fallarCarga() {
    const worker = this.worker
    this.worker = null
    if (worker) {
      worker.onmessage = null
      worker.onerror = null
    }
    this.fallarPendientes(this.configuracion.errorCarga)
  }
}

export type SesionLint = {
  analizar: (archivos: ArchivoReact[]) => Promise<ResultadoLint | null>
  descartar: () => void
}

export type SesionCompilador = {
  compilar: (
    codigo: string,
    opciones?: { typescript?: boolean },
  ) => Promise<ResultadoCompilador | null>
  descartar: () => void
}

export function crearClienteReactKit({
  crearWorker = (ruta) => new Worker(ruta),
}: { crearWorker?: FabricaWorkerReactKit } = {}) {
  const canalLint = new CanalWorker<ResultadoLint>({
    ruta: RUTAS_WORKERS_REACT_KIT.lint,
    crearWorker,
    validar: (datos) => esquemaRespuestaLint.safeParse(datos),
    errorCarga: { ok: false, error: ERROR_CARGA_LINTER },
  })
  const canalCompilador = new CanalWorker<ResultadoCompilador>({
    ruta: RUTAS_WORKERS_REACT_KIT.compilador,
    crearWorker,
    validar: (datos) => esquemaRespuestaCompilador.safeParse(datos),
    errorCarga: { ok: false, error: ERROR_CARGA_COMPILADOR },
  })

  return {
    crearSesionLint(): SesionLint {
      let ultimoId = 0
      return {
        analizar: (archivos) =>
          canalLint.solicitar(
            (id) => ({ id, tipo: 'lint', archivos }),
            (id) => {
              ultimoId = id
            },
            (id) => id === ultimoId,
          ),
        descartar: () => {
          ultimoId = 0
        },
      }
    },
    crearSesionCompilador(): SesionCompilador {
      let ultimoId = 0
      return {
        compilar: (codigo, opciones) =>
          canalCompilador.solicitar(
            (id) => ({
              id,
              tipo: 'compilar',
              codigo,
              ...(opciones?.typescript ? { typescript: true } : {}),
            }),
            (id) => {
              ultimoId = id
            },
            (id) => id === ultimoId,
          ),
        descartar: () => {
          ultimoId = 0
        },
      }
    },
  }
}

export type ClienteReactKit = ReturnType<typeof crearClienteReactKit>

export const clienteReactKitCompartido = crearClienteReactKit()
