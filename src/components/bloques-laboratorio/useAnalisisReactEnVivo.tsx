import { useCallback, useEffect, useRef, useState } from 'react'

import type { ArchivoReact } from '@/lib/laboratorio/schemas'
import { ESPERA_RECONSTRUIR_MS } from '@/lib/react-en-vivo/constantes'
import type { SesionLint } from '@/lib/react-kit/cliente'

import type { ResultadoLintBloque, ResultadoTipos } from './reactEnVivoAyudas'

export function useAnalisisTiposReact(archivos: ArchivoReact[], usaTypeScript: boolean) {
  const [revisionTipos, setRevisionTipos] = useState(0)
  const [resultadoTipos, setResultadoTipos] = useState<ResultadoTipos>({
    revision: -1,
    estado: 'listo',
    diagnosticos: [],
  })
  const versionTiposRef = useRef(0)
  const sesionTiposRef = useRef<Promise<ReturnType<
    typeof import('@/lib/react-en-vivo/tipos')['crearSesionTiposReact']
  >> | null>(null)

  useEffect(() => {
    if (!usaTypeScript) return
    const version = ++versionTiposRef.current
    const temporizador = window.setTimeout(() => {
      void (async () => {
        let sesionTipos
        try {
          sesionTiposRef.current ??= import('@/lib/react-en-vivo/tipos').then(
            ({ crearSesionTiposReact }) => crearSesionTiposReact(),
          )
          sesionTipos = await sesionTiposRef.current
        } catch {
          if (version === versionTiposRef.current) {
            setResultadoTipos((actual) => ({
              revision: revisionTipos,
              estado: 'error',
              diagnosticos: actual.diagnosticos,
              error: 'No se pudo cargar TypeScript',
            }))
          }
          return
        }

        try {
          const diagnosticos = await sesionTipos.diagnosticar(archivos)
          if (version !== versionTiposRef.current) return
          setResultadoTipos({ revision: revisionTipos, estado: 'listo', diagnosticos })
        } catch (error) {
          if (version === versionTiposRef.current) {
            const detalle = error instanceof Error ? error.message : String(error)
            setResultadoTipos((actual) => ({
              revision: revisionTipos,
              estado: 'error',
              diagnosticos: actual.diagnosticos,
              error: detalle,
            }))
          }
        }
      })()
    }, ESPERA_RECONSTRUIR_MS)
    return () => {
      window.clearTimeout(temporizador)
      if (version === versionTiposRef.current) versionTiposRef.current += 1
    }
  }, [archivos, revisionTipos, usaTypeScript])

  const marcarCambioTipos = useCallback(() => {
    setRevisionTipos((revision) => revision + 1)
  }, [])
  return {
    resultadoTipos,
    tiposPendientes: usaTypeScript && resultadoTipos.revision !== revisionTipos,
    estadoPanelTipos: resultadoTipos.revision === -1 ? 'cargando' as const : resultadoTipos.estado,
    diagnosticosTipos: resultadoTipos.diagnosticos,
    marcarCambioTipos,
  }
}

export function useAnalisisLintReact(
  archivos: ArchivoReact[],
  revisionInicial: number,
  usaLint: boolean,
  sesionLint: SesionLint,
) {
  const [revisionLint, setRevisionLint] = useState(revisionInicial)
  const [resultadoLint, setResultadoLint] = useState<ResultadoLintBloque>({
    revision: -1,
    estado: 'listo',
    diagnosticos: [],
  })
  const versionLintRef = useRef(0)

  useEffect(() => {
    if (!usaLint) return
    const version = ++versionLintRef.current
    const temporizador = window.setTimeout(() => {
      const archivosLint = archivos.filter((archivo) => /\.(jsx|tsx)$/.test(archivo.nombre))
      void sesionLint.analizar(archivosLint).then((resultado) => {
        if (!resultado || version !== versionLintRef.current) return
        if (resultado.ok) {
          setResultadoLint({
            revision: revisionLint,
            estado: 'listo',
            diagnosticos: resultado.diagnosticos,
          })
          return
        }
        setResultadoLint({
          revision: revisionLint,
          estado: 'error',
          diagnosticos: [],
          error: resultado.error,
        })
      })
    }, ESPERA_RECONSTRUIR_MS)
    return () => {
      window.clearTimeout(temporizador)
      if (version === versionLintRef.current) versionLintRef.current += 1
    }
  }, [archivos, revisionLint, sesionLint, usaLint])

  const marcarCambioLint = useCallback(() => {
    setRevisionLint((revision) => revision + 1)
  }, [])
  return {
    resultadoLint,
    lintPendiente: usaLint && resultadoLint.revision !== revisionLint,
    estadoPanelLint: resultadoLint.revision === -1 ? 'cargando' as const : resultadoLint.estado,
    diagnosticosLintActuales:
      resultadoLint.revision === revisionLint ? resultadoLint.diagnosticos : [],
    marcarCambioLint,
  }
}
