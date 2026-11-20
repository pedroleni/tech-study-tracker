import { ArbolDeRenders } from '@/components/bloques-laboratorio/ArbolDeRenders'
import {
  BarraDirecciones,
  type AccionNavegador,
} from '@/components/bloques-laboratorio/BarraDirecciones'
import { ConsolaReact } from '@/components/bloques-laboratorio/ConsolaReact'
import type { EntradaConsola } from '@/components/bloques-laboratorio/ConsolaReact'
import { PanelRed, type AjustesRed } from '@/components/bloques-laboratorio/PanelRed'
import { RegistroEfectos } from '@/components/bloques-laboratorio/RegistroEfectos'
import { RegistroRouter } from '@/components/bloques-laboratorio/RegistroRouter'
import { VistaPreviaReact } from '@/components/bloques-laboratorio/VistaPreviaReact'
import type {
  MensajeArbol,
  MensajeEfecto,
  MensajePeticion,
  MensajeReactEnVivo,
  MensajeRouterOperacion,
} from '@/lib/react-en-vivo/mensajes'
import type { AvisoCompiladorReact } from '@/lib/react-en-vivo/compilar'

export function PanelVistaPreviaReactEnVivo({
  avisosCompilador,
  srcDoc,
  errorSintaxis,
  barraDeDirecciones,
  ubicacion,
  reinicios,
  api,
  redActual,
  fallosSolicitados,
  compilador,
  ordenNavegador,
  onAccionNavegador,
  onMensaje,
}: {
  avisosCompilador: AvisoCompiladorReact[]
  srcDoc: string | null
  errorSintaxis: string | null
  barraDeDirecciones: boolean
  ubicacion: Extract<MensajeReactEnVivo, { tipo: 'ubicacion' }> | null
  reinicios: number
  api?: Record<string, unknown[]>
  redActual: AjustesRed
  fallosSolicitados: number
  compilador: boolean
  ordenNavegador?: { id: number; accion: AccionNavegador; url?: string }
  onAccionNavegador: (accion: AccionNavegador, url?: string) => void
  onMensaje: (mensaje: MensajeReactEnVivo) => void
}) {
  return (
    <div className="min-w-0 space-y-2">
      <h4 className="text-sm font-semibold">Vista previa</h4>
      {avisosCompilador.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          {avisosCompilador.map((aviso) => (
            <li key={aviso.archivo}>
              {aviso.archivo} no se pudo compilar: {aviso.error.split(/\r?\n/, 1)[0]}
            </li>
          ))}
        </ul>
      )}
      {srcDoc === null ? (
        <p className="text-sm text-muted-foreground">
          {errorSintaxis
            ? 'La vista previa arrancará en cuanto el código compile: corrige el error de sintaxis.'
            : 'Preparando React…'}
        </p>
      ) : (
        <>
          {barraDeDirecciones && ubicacion && (
            <BarraDirecciones ubicacion={ubicacion} onAccion={onAccionNavegador} />
          )}
          <VistaPreviaReact
            key={reinicios}
            srcDoc={srcDoc}
            onMensaje={onMensaje}
            red={api ? redActual : undefined}
            fallosSolicitados={fallosSolicitados}
            codigoCompilado={compilador}
            ordenNavegador={ordenNavegador}
          />
        </>
      )}
    </div>
  )
}

export function PanelesActividadReactEnVivo({
  mostrarArbol,
  arbol,
  mostrarRouter,
  operacionesRouter,
  registroRouterLleno,
  soloDeclarativo,
  api,
  redActual,
  peticiones,
  falloPendiente,
  mostrarEfectos,
  efectos,
  mostrarConsola,
  entradas,
  onLimpiarRouter,
  onCambiarRed,
  onFallarSiguiente,
  onLimpiarEfectos,
  onLimpiarConsola,
}: {
  mostrarArbol: boolean
  arbol: MensajeArbol | null
  mostrarRouter: boolean
  operacionesRouter: MensajeRouterOperacion[]
  registroRouterLleno: boolean
  soloDeclarativo: boolean
  api?: Record<string, unknown[]>
  redActual: AjustesRed
  peticiones: MensajePeticion[]
  falloPendiente: boolean
  mostrarEfectos: boolean
  efectos: MensajeEfecto[]
  mostrarConsola: boolean
  entradas: EntradaConsola[]
  onLimpiarRouter: () => void
  onCambiarRed: (red: AjustesRed) => void
  onFallarSiguiente: () => void
  onLimpiarEfectos: () => void
  onLimpiarConsola: () => void
}) {
  return (
    <>
      {mostrarArbol && <ArbolDeRenders arbol={arbol} />}

      {mostrarRouter && (
        <RegistroRouter
          operaciones={operacionesRouter}
          lleno={registroRouterLleno}
          soloDeclarativo={soloDeclarativo}
          onLimpiar={onLimpiarRouter}
        />
      )}

      {api && (
        <PanelRed
          red={redActual}
          peticiones={peticiones}
          falloPendiente={falloPendiente}
          onCambiar={onCambiarRed}
          onFallarSiguiente={onFallarSiguiente}
        />
      )}

      {mostrarEfectos && (
        <RegistroEfectos entradas={efectos} onLimpiar={onLimpiarEfectos} />
      )}

      {mostrarConsola && (
        <ConsolaReact entradas={entradas} onLimpiar={onLimpiarConsola} />
      )}
    </>
  )
}
