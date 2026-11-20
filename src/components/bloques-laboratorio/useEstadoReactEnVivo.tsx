import { useEffect, useId, useMemo, useState } from 'react'

import { useAnalisisLintReact, useAnalisisTiposReact } from './useAnalisisReactEnVivo'
import { useDocumentoReactEnVivo } from './useDocumentoReactEnVivo'
import { useRegistroReactEnVivo } from './useRegistroReactEnVivo'

import type { ArchivoReact, DatosReactEnVivo } from '@/lib/laboratorio/schemas'
import type { AvisoCompiladorReact } from '@/lib/react-en-vivo/compilar'
import type { ClienteReactKit } from '@/lib/react-kit/cliente'

type ConfiguracionEstado = {
  archivosOriginales: ArchivoReact[]
  primeraPestana: string
  strictMode: boolean
  mostrarJsGenerado: boolean
  mostrarArbol: boolean
  mostrarEfectos: boolean
  mostrarRouter: boolean
  mostrarLint: boolean
  exigirLintLimpio: boolean
  compilador: boolean
  api?: Record<string, unknown[]>
  red?: DatosReactEnVivo['red']
  urlInicial?: string
  clienteReactKit: ClienteReactKit
}

export function useEstadoReactEnVivo(configuracion: ConfiguracionEstado) {
  const [archivos, setArchivos] = useState<ArchivoReact[]>(configuracion.archivosOriginales)
  const [pestana, setPestana] = useState(configuracion.primeraPestana)
  const [srcDoc, setSrcDoc] = useState<string | null>(null)
  const [errorSintaxis, setErrorSintaxis] = useState<string | null>(null)
  const [jsGenerado, setJsGenerado] = useState('')
  const [avisosCompilador, setAvisosCompilador] = useState<AvisoCompiladorReact[]>([])
  const usaTypeScript = configuracion.archivosOriginales.some(
    (archivo) => archivo.nombre.endsWith('.ts') || archivo.nombre.endsWith('.tsx'),
  )
  const usaLint = configuracion.mostrarLint || configuracion.exigirLintLimpio
  const sesionLint = useMemo(
    () => configuracion.clienteReactKit.crearSesionLint(),
    [configuracion.clienteReactKit],
  )
  const sesionCompiladorVista = useMemo(
    () => configuracion.clienteReactKit.crearSesionCompilador(),
    [configuracion.clienteReactKit],
  )
  const sesionCompiladorComprobacion = useMemo(
    () => configuracion.clienteReactKit.crearSesionCompilador(),
    [configuracion.clienteReactKit],
  )
  const registro = useRegistroReactEnVivo(configuracion.red)
  const idErroresTipos = useId()
  // Cambia en cada "Reiniciar": remonta la vista previa aunque el código no
  // haya cambiado, para que la app vuelva a arrancar de cero.
  const [reinicios, setReinicios] = useState(0)

  const claveApi = JSON.stringify(configuracion.api)
  const apiEstable = useMemo<Record<string, unknown[]> | undefined>(
    () => (claveApi === undefined ? undefined : JSON.parse(claveApi)),
    [claveApi],
  )

  useDocumentoReactEnVivo({
    apiEstable,
    archivos,
    compilador: configuracion.compilador,
    sesionCompiladorVista,
    strictMode: configuracion.strictMode,
    mostrarJsGenerado: configuracion.mostrarJsGenerado,
    mostrarArbol: configuracion.mostrarArbol,
    mostrarEfectos: configuracion.mostrarEfectos,
    mostrarRouter: configuracion.mostrarRouter,
    urlInicial: configuracion.urlInicial,
    reinicios,
    redActualRef: registro.redActualRef,
    urlActualRef: registro.urlActualRef,
    setJsGenerado,
    setAvisosCompilador,
    setErrorSintaxis,
    setUbicacion: registro.setUbicacion,
    setArbol: registro.setArbol,
    setRegistroRouterLleno: registro.setRegistroRouterLleno,
    setFalloPendiente: registro.setFalloPendiente,
    setSrcDoc,
    limpiar: registro.limpiar,
    limpiarPeticiones: registro.limpiarPeticiones,
    limpiarEfectos: registro.limpiarEfectos,
    limpiarOperacionesRouter: registro.limpiarOperacionesRouter,
    alInvalidarDocumento: registro.invalidarDocumentoMontado,
  })

  const analisisTipos = useAnalisisTiposReact(archivos, usaTypeScript)
  const analisisLint = useAnalisisLintReact(archivos, 0, usaLint, sesionLint)

  useEffect(
    () => () => {
      sesionLint.descartar()
      sesionCompiladorVista.descartar()
      sesionCompiladorComprobacion.descartar()
    },
    [sesionCompiladorComprobacion, sesionCompiladorVista, sesionLint],
  )

  return {
    archivos, setArchivos, pestana, setPestana, srcDoc, setSrcDoc,
    errorSintaxis, setErrorSintaxis, jsGenerado, avisosCompilador, setAvisosCompilador,
    usaTypeScript, usaLint, sesionCompiladorComprobacion, idErroresTipos,
    reinicios, setReinicios, ...registro, ...analisisTipos, ...analisisLint,
  }
}
