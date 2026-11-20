import { useEffect, useRef } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import type { AjustesRed } from '@/components/bloques-laboratorio/PanelRed'
import type { ArchivoReact } from '@/lib/laboratorio/schemas'
import {
  compilarArchivosReact,
  type AvisoCompiladorReact,
} from '@/lib/react-en-vivo/compilar'
import { ESPERA_RECONSTRUIR_MS } from '@/lib/react-en-vivo/constantes'
import type { MensajeArbol, MensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'
import { prepararDocumento } from '@/lib/react-en-vivo/preparar'
import { transformarParaMostrar } from '@/lib/react-en-vivo/transformar'
import type { SesionCompilador } from '@/lib/react-kit/cliente'

type ContextoDocumento = {
  apiEstable?: Record<string, unknown[]>
  archivos: ArchivoReact[]
  compilador: boolean
  sesionCompiladorVista: SesionCompilador
  strictMode: boolean
  mostrarJsGenerado: boolean
  mostrarArbol: boolean
  mostrarEfectos: boolean
  mostrarRouter: boolean
  urlInicial?: string
  reinicios: number
  redActualRef: RefObject<AjustesRed>
  urlActualRef: RefObject<string | null>
  setJsGenerado: Dispatch<SetStateAction<string>>
  setAvisosCompilador: Dispatch<SetStateAction<AvisoCompiladorReact[]>>
  setErrorSintaxis: Dispatch<SetStateAction<string | null>>
  setUbicacion: Dispatch<
    SetStateAction<Extract<MensajeReactEnVivo, { tipo: 'ubicacion' }> | null>
  >
  setArbol: Dispatch<SetStateAction<MensajeArbol | null>>
  setRegistroRouterLleno: Dispatch<SetStateAction<boolean>>
  setFalloPendiente: Dispatch<SetStateAction<boolean>>
  setSrcDoc: Dispatch<SetStateAction<string | null>>
  limpiar: () => void
  limpiarPeticiones: () => void
  limpiarEfectos: () => void
  limpiarOperacionesRouter: () => void
  alInvalidarDocumento: () => void
}

export function useDocumentoReactEnVivo(contexto: ContextoDocumento) {
  const {
    apiEstable,
    archivos,
    compilador,
    sesionCompiladorVista,
    strictMode,
    mostrarJsGenerado,
    mostrarArbol,
    mostrarEfectos,
    mostrarRouter,
    urlInicial,
    reinicios,
    redActualRef,
    urlActualRef,
    setJsGenerado,
    setAvisosCompilador,
    setErrorSintaxis,
    setUbicacion,
    setArbol,
    setRegistroRouterLleno,
    setFalloPendiente,
    setSrcDoc,
    limpiar,
    limpiarPeticiones,
    limpiarEfectos,
    limpiarOperacionesRouter,
    alInvalidarDocumento,
  } = contexto
  const primeraVezRef = useRef(true)
  const versionRef = useRef(0)

  useEffect(() => {
    // La primera vista previa sale sin esperar; después, 400 ms tras la última tecla.
    const espera = primeraVezRef.current ? 0 : ESPERA_RECONSTRUIR_MS
    primeraVezRef.current = false
    const version = ++versionRef.current
    if (compilador) sesionCompiladorVista.descartar()
    const temporizador = window.setTimeout(() => {
      void (async () => {
        const resultadoCompilador = compilador
          ? await compilarArchivosReact(archivos, sesionCompiladorVista)
          : { archivos, avisos: [] }
        if (!resultadoCompilador || version !== versionRef.current) return

        const [preparado, textoGenerado] = await Promise.all([
          prepararDocumento(resultadoCompilador.archivos, {
            origen: window.location.origin,
            strictMode,
            conPruebas: false,
            conArbol: mostrarArbol,
            conEfectos: mostrarEfectos,
            conRegistroRouter: mostrarRouter,
            api: apiEstable,
            red: redActualRef.current,
            urlInicial: urlActualRef.current ?? urlInicial,
          }),
          mostrarJsGenerado
            ? transformarParaMostrar(resultadoCompilador.archivos)
            : Promise.resolve(null),
        ])
        // Una compilación o transformación que llega después de otra más
        // nueva se descarta en bloque: vista, avisos y JS siempre coinciden.
        if (version !== versionRef.current) return
        if (textoGenerado !== null) setJsGenerado(textoGenerado)
        if (!preparado.ok) {
          setAvisosCompilador(
            preparado.archivo
              ? resultadoCompilador.avisos.filter((aviso) => aviso.archivo !== preparado.archivo)
              : resultadoCompilador.avisos,
          )
          // La vista previa se queda en el último resultado válido.
          setErrorSintaxis(preparado.error)
          return
        }
        setAvisosCompilador(resultadoCompilador.avisos)
        setErrorSintaxis(null)
        limpiar()
        // El árbol de la vista previa anterior ya no describe nada.
        alInvalidarDocumento()
        setUbicacion(null)
        setArbol(null)
        limpiarPeticiones()
        limpiarEfectos()
        limpiarOperacionesRouter()
        setRegistroRouterLleno(false)
        setFalloPendiente(false)
        setSrcDoc(preparado.srcDoc)
      })()
    }, espera)
    return () => {
      window.clearTimeout(temporizador)
      if (version === versionRef.current) versionRef.current += 1
      if (compilador) sesionCompiladorVista.descartar()
    }
  }, [apiEstable, archivos, compilador, sesionCompiladorVista, strictMode, mostrarJsGenerado, mostrarArbol, mostrarEfectos, mostrarRouter, limpiar, limpiarEfectos, limpiarOperacionesRouter, limpiarPeticiones, reinicios, urlInicial, redActualRef, urlActualRef, setJsGenerado, setAvisosCompilador, setErrorSintaxis, setUbicacion, setArbol, setRegistroRouterLleno, setFalloPendiente, setSrcDoc, alInvalidarDocumento])
}
