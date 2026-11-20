import type { DiagnosticoPanelTs } from '@/components/bloques-laboratorio/PanelDiagnosticosTs'
import type { FinComprobacion } from '@/components/bloques-laboratorio/ComprobadorReact'
import type { DatosReactEnVivo } from '@/lib/laboratorio/schemas'
import type {
  MensajeEfecto,
  MensajePeticion,
  MensajeRouterOperacion,
} from '@/lib/react-en-vivo/mensajes'
import type { ClienteReactKit, DiagnosticoLint } from '@/lib/react-kit/cliente'

export const COMPROBACIONES_VACIAS: NonNullable<DatosReactEnVivo['comprobaciones']> = []

function incorporarPeticion(actuales: MensajePeticion[], nueva: MensajePeticion) {
  const posicion = actuales.findIndex((peticion) => peticion.id === nueva.id)
  if (posicion === -1) return [...actuales, nueva].slice(-20)
  return actuales.map((peticion, indice) => (indice === posicion ? nueva : peticion))
}

export function incorporarPeticiones(actuales: MensajePeticion[], nuevas: MensajePeticion[]) {
  return nuevas.reduce(incorporarPeticion, actuales)
}

export const incorporarEfectos = (actuales: MensajeEfecto[], nuevos: MensajeEfecto[]) => [
  ...actuales,
  ...nuevos,
]

export function incorporarOperaciones(
  actuales: MensajeRouterOperacion[],
  nuevas: MensajeRouterOperacion[],
) {
  // Un Map conserva el orden y sustituye en su sitio. Recortar en cada paso, y
  // no al final del lote, evita copiar el array entero por cada id nuevo.
  const porId = new Map(actuales.map((operacion) => [operacion.id, operacion]))
  for (const nueva of nuevas) {
    porId.set(nueva.id, nueva)
    if (porId.size > 100) porId.delete(porId.keys().next().value!)
  }
  return [...porId.values()]
}

export type EstadoComprobacion =
  | { estado: 'inactivo' }
  | { estado: 'comprobando'; srcDoc: string | null }
  | FinComprobacion

export type ResultadoTipos = {
  revision: number
  estado: 'listo' | 'error'
  diagnosticos: DiagnosticoPanelTs[]
  error?: string
}

export type ResultadoLintBloque = {
  revision: number
  estado: 'listo' | 'error'
  diagnosticos: DiagnosticoLint[]
  error?: string
}

export type PropiedadesReactEnVivo = Omit<
  DatosReactEnVivo,
  | 'mostrarArbol'
  | 'mostrarEfectos'
  | 'mostrarRouter'
  | 'mostrarLint'
  | 'compilador'
  | 'exigirLintLimpio'
  | 'exigirTiposCorrectos'
  | 'barraDeDirecciones'
> & {
  mostrarArbol?: boolean
  mostrarEfectos?: boolean
  mostrarRouter?: boolean
  mostrarLint?: boolean
  compilador?: boolean
  exigirLintLimpio?: boolean
  exigirTiposCorrectos?: boolean
  barraDeDirecciones?: boolean
  clienteReactKit?: ClienteReactKit
  etiquetaSeccion?: string
  etiquetaPanelTipos?: string
}

function recortarMotivo(texto: string, maximo = 240) {
  if (texto.length <= maximo) return texto
  return `${texto.slice(0, maximo - 1).trimEnd()}…`
}

export function motivoDiagnosticoLint(diagnostico: DiagnosticoLint) {
  const ubicacion = diagnostico.columna > 0
    ? `${diagnostico.archivo}:${diagnostico.linea}:${diagnostico.columna}`
    : `${diagnostico.archivo}:${diagnostico.linea}`
  return recortarMotivo(
    [ubicacion, diagnostico.regla, diagnostico.mensaje]
      .filter((parte) => parte !== null)
      .join(' · '),
  )
}
