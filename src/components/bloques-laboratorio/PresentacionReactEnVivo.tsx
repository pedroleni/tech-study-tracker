import { COMPROBACIONES_VACIAS, type PropiedadesReactEnVivo } from './reactEnVivoAyudas'
import type { useComprobacionReactEnVivo } from './useComprobacionReactEnVivo'
import type { useEstadoReactEnVivo } from './useEstadoReactEnVivo'
import { VistaReactEnVivo } from './VistaReactEnVivo'

import type { ArchivoReact } from '@/lib/laboratorio/schemasReact'
import { explicarErrorReact } from '@/lib/react-en-vivo/explicarError'

const PESTANA_JS_GENERADO = 'JavaScript generado'

type EstadoReactEnVivo = ReturnType<typeof useEstadoReactEnVivo>
type ControlComprobacion = ReturnType<typeof useComprobacionReactEnVivo>
type ConfiguracionPresentacion = Pick<
  PropiedadesReactEnVivo,
  | 'consigna'
  | 'mostrarConsola'
  | 'mostrarJsGenerado'
  | 'api'
  | 'comprobaciones'
> & {
  titulo: string
  archivosOriginales: ArchivoReact[]
  primeraPestana: string
  mostrarArbol: boolean
  mostrarEfectos: boolean
  mostrarRouter: boolean
  mostrarLint: boolean
  compilador: boolean
  exigirLintLimpio: boolean
  exigirTiposCorrectos: boolean
  barraDeDirecciones: boolean
  etiquetaSeccion: string
  etiquetaPanelTipos: string
}

function etiquetaBotonComprobar(configuracion: ConfiguracionPresentacion, estado: EstadoReactEnVivo) {
  if (configuracion.exigirTiposCorrectos && estado.tiposPendientes) {
    return 'Esperando a los tipos…'
  }
  if (configuracion.exigirLintLimpio && estado.lintPendiente) return 'Esperando al linter…'
  return 'Comprobar'
}

function crearReiniciar(
  configuracion: ConfiguracionPresentacion,
  estado: EstadoReactEnVivo,
  control: ControlComprobacion,
) {
  return () => {
    if (estado.usaTypeScript) estado.marcarCambioTipos()
    if (estado.usaLint) estado.marcarCambioLint()
    estado.setArchivos(configuracion.archivosOriginales)
    estado.urlActualRef.current = null
    estado.setUbicacion(null)
    estado.setOrdenNavegador(undefined)
    estado.setSrcDoc(null)
    estado.setPestana(configuracion.primeraPestana)
    control.reiniciarComprobacion()
    estado.setAvisosCompilador([])
    estado.setReinicios((anteriores) => anteriores + 1)
    estado.invalidarDocumentoMontado()
    estado.setArbol(null)
    estado.limpiarPeticiones()
    estado.limpiarEfectos()
    estado.limpiarOperacionesRouter()
    estado.setRegistroRouterLleno(false)
    estado.setFalloPendiente(false)
    estado.setFallosSolicitados(0)
    estado.limpiar()
  }
}

function crearCambiarCodigo(estado: EstadoReactEnVivo, archivoActivo?: ArchivoReact) {
  return (codigo: string) => {
    if (!archivoActivo) return
    if (estado.usaTypeScript) estado.marcarCambioTipos()
    if (estado.usaLint) estado.marcarCambioLint()
    estado.setArchivos((actuales) =>
      actuales.map((archivo) =>
        archivo.nombre === archivoActivo.nombre ? { ...archivo, codigo } : archivo,
      ),
    )
  }
}

function obtenerComprobador(
  configuracion: ConfiguracionPresentacion,
  control: ControlComprobacion,
) {
  if (
    control.comprobacion.estado !== 'comprobando' ||
    !control.comprobacion.srcDoc ||
    (!configuracion.comprobaciones &&
      !configuracion.exigirTiposCorrectos &&
      !configuracion.exigirLintLimpio)
  ) return undefined
  return {
    srcDoc: control.comprobacion.srcDoc,
    comprobaciones: configuracion.comprobaciones ?? COMPROBACIONES_VACIAS,
    onTerminar: control.terminarComprobacion,
  }
}

export function PresentacionReactEnVivo({
  configuracion,
  estado,
  control,
}: {
  configuracion: ConfiguracionPresentacion
  estado: EstadoReactEnVivo
  control: ControlComprobacion
}) {
  const pestanas = [
    ...estado.archivos.map((archivo) => archivo.nombre),
    ...(configuracion.mostrarJsGenerado ? [PESTANA_JS_GENERADO] : []),
  ]
  const archivoActivo = estado.archivos.find((archivo) => archivo.nombre === estado.pestana)
  const comprobarDeshabilitado =
    control.comprobacion.estado === 'comprobando' ||
    (configuracion.exigirTiposCorrectos && estado.tiposPendientes) ||
    (configuracion.exigirLintLimpio && estado.lintPendiente)
  const errorTipos =
    estado.resultadoTipos.estado === 'error'
      ? `No se pudieron analizar los tipos: ${estado.resultadoTipos.error ?? 'error desconocido'}`
      : undefined
  const soloDeclarativo =
    estado.ubicacion !== null &&
    ['MemoryRouter', 'BrowserRouter', 'HashRouter'].includes(estado.ubicacion.origen)

  return (
    <VistaReactEnVivo
      etiquetaSeccion={configuracion.etiquetaSeccion}
      titulo={configuracion.titulo}
      consigna={configuracion.consigna}
      cabecera={{
        mostrarComprobar: Boolean(
          configuracion.comprobaciones ||
          configuracion.exigirTiposCorrectos ||
          configuracion.exigirLintLimpio,
        ),
        comprobarDeshabilitado,
        etiquetaComprobar: etiquetaBotonComprobar(configuracion, estado),
        botonComprobarRef: control.botonComprobarRef,
        onComprobar: () => void control.comprobar(),
        onReiniciar: crearReiniciar(configuracion, estado, control),
      }}
      codigo={{
        pestanas,
        pestana: estado.pestana,
        archivoActivo,
        jsGenerado: estado.jsGenerado,
        compilador: configuracion.compilador,
        errorSintaxis: estado.errorSintaxis,
        explicacionErrorSintaxis: estado.errorSintaxis
          ? explicarErrorReact(estado.errorSintaxis)
          : null,
        usaTypeScript: estado.usaTypeScript,
        idErroresTipos: estado.idErroresTipos,
        etiquetaPanelTipos: configuracion.etiquetaPanelTipos,
        estadoPanelTipos: estado.estadoPanelTipos,
        diagnosticosTipos: estado.diagnosticosTipos,
        errorTipos,
        mostrarLint: configuracion.mostrarLint,
        estadoPanelLint: estado.estadoPanelLint,
        diagnosticosLint: estado.resultadoLint.diagnosticos,
        errorLint: estado.resultadoLint.error,
        onCambiarPestana: estado.setPestana,
        onCambiarCodigo: crearCambiarCodigo(estado, archivoActivo),
      }}
      comprobacion={control.comprobacion}
      vistaPrevia={{
        avisosCompilador: estado.avisosCompilador,
        srcDoc: estado.srcDoc,
        errorSintaxis: estado.errorSintaxis,
        barraDeDirecciones: configuracion.barraDeDirecciones,
        ubicacion: estado.ubicacion,
        reinicios: estado.reinicios,
        api: configuracion.api,
        redActual: estado.redActual,
        fallosSolicitados: estado.fallosSolicitados,
        compilador: configuracion.compilador,
        ordenNavegador: estado.ordenNavegador,
        onAccionNavegador: estado.actuarEnNavegador,
        onMensaje: estado.recibir,
      }}
      actividad={{
        mostrarArbol: configuracion.mostrarArbol,
        arbol: estado.arbol,
        mostrarRouter: configuracion.mostrarRouter,
        operacionesRouter: estado.operacionesRouter,
        registroRouterLleno: estado.registroRouterLleno,
        soloDeclarativo,
        api: configuracion.api,
        redActual: estado.redActual,
        peticiones: estado.peticiones,
        falloPendiente: estado.falloPendiente,
        mostrarEfectos: configuracion.mostrarEfectos,
        efectos: estado.efectos,
        mostrarConsola: configuracion.mostrarConsola,
        entradas: estado.entradas,
        onLimpiarRouter: () => {
          estado.limpiarOperacionesRouter()
          estado.setRegistroRouterLleno(false)
        },
        onCambiarRed: estado.cambiarRed,
        onFallarSiguiente: () => {
          estado.setFalloPendiente(true)
          estado.setFallosSolicitados((cantidad) => cantidad + 1)
        },
        onLimpiarEfectos: estado.limpiarEfectos,
        onLimpiarConsola: estado.limpiar,
      }}
      comprobador={obtenerComprobador(configuracion, control)}
    />
  )
}
