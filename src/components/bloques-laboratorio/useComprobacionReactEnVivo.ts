import { useCallback, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { FinComprobacion } from '@/components/bloques-laboratorio/ComprobadorReact'
import type { ResultadoComprobacion } from '@/components/bloques-laboratorio/ResultadosComprobaciones'
import {
  motivoDiagnosticoLint,
  type EstadoComprobacion,
  type ResultadoLintBloque,
  type ResultadoTipos,
} from '@/components/bloques-laboratorio/reactEnVivoAyudas'
import type { ArchivoReact, DatosReactEnVivo } from '@/lib/laboratorio/schemasReact'
import {
  compilarArchivosReact,
  type AvisoCompiladorReact,
} from '@/lib/react-en-vivo/compilar'
import type { DiagnosticoPanelTs } from '@/components/bloques-laboratorio/PanelDiagnosticosTs'
import { prepararDocumento } from '@/lib/react-en-vivo/preparar'
import type { DiagnosticoLint, SesionCompilador } from '@/lib/react-kit/cliente'

function resultadoRequisitoTipos(
  resultadoTipos: ResultadoTipos,
  primerError?: DiagnosticoPanelTs,
): ResultadoComprobacion {
  let motivo: string | undefined
  if (resultadoTipos.estado === 'error') {
    motivo = `No se pudieron comprobar los tipos: ${resultadoTipos.error ?? 'falló el análisis'}`
  } else if (primerError) {
    motivo = `${primerError.archivo}:${primerError.linea}:${primerError.columna} · ${primerError.mensaje}`
  }
  return {
    descripcion: 'El código no tiene errores de tipos',
    ok: resultadoTipos.estado === 'listo' && !primerError,
    ...(motivo ? { motivo } : {}),
  }
}

function resultadoRequisitoLint(
  resultadoLint: ResultadoLintBloque,
  primerDiagnostico?: DiagnosticoLint,
): ResultadoComprobacion {
  let motivo: string | undefined
  if (resultadoLint.estado === 'error') {
    motivo = resultadoLint.error ?? 'No se pudo cargar el linter'
  } else if (primerDiagnostico) {
    motivo = motivoDiagnosticoLint(primerDiagnostico)
  }
  return {
    descripcion: 'El linter no marca nada',
    ok: resultadoLint.estado === 'listo' && !primerDiagnostico,
    ...(motivo ? { motivo } : {}),
  }
}

type ContextoComprobacion = {
  comprobaciones?: DatosReactEnVivo['comprobaciones']
  exigirTiposCorrectos: boolean
  exigirLintLimpio: boolean
  tiposPendientes: boolean
  lintPendiente: boolean
  diagnosticosTipos: DiagnosticoPanelTs[]
  diagnosticosLint: DiagnosticoLint[]
  resultadoTipos: ResultadoTipos
  resultadoLint: ResultadoLintBloque
  compilador: boolean
  archivos: ArchivoReact[]
  sesionCompilador: SesionCompilador
  strictMode: boolean
  mostrarEfectos: boolean
  api?: Record<string, unknown[]>
  red?: DatosReactEnVivo['red']
  urlInicial?: string
  setAvisosCompilador: Dispatch<SetStateAction<AvisoCompiladorReact[]>>
  setErrorSintaxis: Dispatch<SetStateAction<string | null>>
}

function comprobacionBloqueada(
  contexto: ContextoComprobacion,
  comprobacion: EstadoComprobacion,
) {
  return (
    (!contexto.comprobaciones && !contexto.exigirTiposCorrectos && !contexto.exigirLintLimpio) ||
    comprobacion.estado === 'comprobando' ||
    (contexto.exigirTiposCorrectos && contexto.tiposPendientes) ||
    (contexto.exigirLintLimpio && contexto.lintPendiente)
  )
}

export function useComprobacionReactEnVivo(contexto: ContextoComprobacion) {
  const [comprobacion, setComprobacion] = useState<EstadoComprobacion>({ estado: 'inactivo' })
  const resultadosTiposRef = useRef<ResultadoComprobacion[]>([])
  const botonComprobarRef = useRef<HTMLButtonElement>(null)

  const terminarComprobacion = useCallback((fin: FinComprobacion) => {
    setComprobacion({
      ...fin,
      resultados: [...resultadosTiposRef.current, ...fin.resultados],
    })
    // user-event escribe dentro del iframe oculto y se lleva el foco; al
    // quitarlo, el foco caería en <body>. Vuelve al botón, salvo que la
    // persona ya lo haya llevado a otro sitio.
    const activo = document.activeElement
    if (!activo || activo === document.body || activo.tagName === 'IFRAME') {
      botonComprobarRef.current?.focus()
    }
  }, [])

  async function comprobar() {
    if (comprobacionBloqueada(contexto, comprobacion)) return
    const resultadosRequisitos: ResultadoComprobacion[] = []
    if (contexto.exigirTiposCorrectos) {
      const primerError = contexto.diagnosticosTipos.find(
        (diagnostico) => diagnostico.severidad === 'error',
      )
      resultadosRequisitos.push(resultadoRequisitoTipos(contexto.resultadoTipos, primerError))
    }
    if (contexto.exigirLintLimpio) {
      resultadosRequisitos.push(
        resultadoRequisitoLint(contexto.resultadoLint, contexto.diagnosticosLint[0]),
      )
    }
    resultadosTiposRef.current = resultadosRequisitos
    if (!contexto.comprobaciones || contexto.comprobaciones.length === 0) {
      terminarComprobacion({ estado: 'listo', resultados: [] })
      return
    }
    setComprobacion({ estado: 'comprobando', srcDoc: null })
    const resultadoCompilador = contexto.compilador
      ? await compilarArchivosReact(contexto.archivos, contexto.sesionCompilador)
      : { archivos: contexto.archivos, avisos: [] }
    if (!resultadoCompilador) {
      setComprobacion({ estado: 'inactivo' })
      return
    }
    contexto.setAvisosCompilador(resultadoCompilador.avisos)
    const preparado = await prepararDocumento(resultadoCompilador.archivos, {
      origen: window.location.origin,
      strictMode: contexto.strictMode,
      conPruebas: true,
      conEfectos: contexto.mostrarEfectos,
      api: contexto.api,
      red: contexto.red,
      urlInicial: contexto.urlInicial,
    })
    if (!preparado.ok) {
      contexto.setErrorSintaxis(preparado.error)
      setComprobacion({ estado: 'inactivo' })
      return
    }
    setComprobacion({ estado: 'comprobando', srcDoc: preparado.srcDoc })
  }

  const reiniciarComprobacion = useCallback(() => {
    setComprobacion({ estado: 'inactivo' })
    resultadosTiposRef.current = []
  }, [])

  return {
    comprobacion,
    botonComprobarRef,
    comprobar,
    terminarComprobacion,
    reiniciarComprobacion,
  }
}
