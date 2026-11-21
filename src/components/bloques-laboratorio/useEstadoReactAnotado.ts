import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'

import type { AccionNavegador } from '@/components/bloques-laboratorio/BarraDirecciones'
import type { AjustesRed } from '@/components/bloques-laboratorio/PanelRed'
import { incorporarOperaciones } from '@/components/bloques-laboratorio/reactEnVivoAyudas'
import { useAnotacionesConLinea } from '@/components/bloques-laboratorio/useAnotacionesConLinea'
import { useEntradasConsola } from '@/components/bloques-laboratorio/useEntradasConsola'
import { useRegistroAgrupado } from '@/components/bloques-laboratorio/useRegistroAgrupado'
import type { DatosReactAnotado } from '@/lib/laboratorio/schemasReact'
import type {
  MensajeArbol,
  MensajeEfecto,
  MensajePeticion,
  MensajeReactEnVivo,
} from '@/lib/react-en-vivo/mensajes'
import { prepararDocumento } from '@/lib/react-en-vivo/preparar'

const RED_POR_DEFECTO: AjustesRed = { latencia: 600, desordenar: false }

export type PropiedadesReactAnotado = Omit<
  DatosReactAnotado,
  'mostrarArbol' | 'mostrarEfectos' | 'mostrarRouter' | 'barraDeDirecciones' | 'lenguaje'
> & {
  mostrarArbol?: boolean
  mostrarEfectos?: boolean
  mostrarRouter?: boolean
  barraDeDirecciones?: boolean
  lenguaje?: 'jsx' | 'tsx'
  etiquetaSeccion?: string
}

type ConfiguracionEstadoReactAnotado = Pick<
  PropiedadesReactAnotado,
  | 'codigo'
  | 'css'
  | 'anotaciones'
  | 'strictMode'
  | 'mostrarArbol'
  | 'mostrarEfectos'
  | 'mostrarRouter'
  | 'api'
  | 'red'
  | 'urlInicial'
  | 'lenguaje'
>

function incorporarPeticion(actuales: MensajePeticion[], nueva: MensajePeticion) {
  const posicion = actuales.findIndex((peticion) => peticion.id === nueva.id)
  if (posicion === -1) return [...actuales, nueva].slice(-20)
  return actuales.map((peticion, indice) => (indice === posicion ? nueva : peticion))
}

function incorporarPeticiones(actuales: MensajePeticion[], nuevas: MensajePeticion[]) {
  return nuevas.reduce(incorporarPeticion, actuales)
}

const incorporarEfectos = (actuales: MensajeEfecto[], nuevos: MensajeEfecto[]) => [
  ...actuales,
  ...nuevos,
]

function useAnotacionesReactAnotado(
  anotaciones: DatosReactAnotado['anotaciones'],
  codigo: string,
) {
  const idNota = useId()
  const anotacionesValidas = useAnotacionesConLinea(anotaciones, codigo)
  const [anotacionActiva, setAnotacionActiva] = useState(0)
  return { idNota, anotacionesValidas, anotacionActiva, setAnotacionActiva }
}

function useDocumentoReactAnotado() {
  const [srcDoc, setSrcDoc] = useState<string | null>(null)
  const [ubicacion, setUbicacion] = useState<
    Extract<MensajeReactEnVivo, { tipo: 'ubicacion' }> | null
  >(null)
  const urlActualRef = useRef<string | null>(null)
  const [ordenNavegador, setOrdenNavegador] = useState<{
    id: number
    accion: AccionNavegador
    url?: string
  }>()
  const siguienteOrdenNavegadorRef = useRef(0)
  const [error, setError] = useState<string | null>(null)
  return {
    srcDoc,
    setSrcDoc,
    ubicacion,
    setUbicacion,
    urlActualRef,
    ordenNavegador,
    setOrdenNavegador,
    siguienteOrdenNavegadorRef,
    error,
    setError,
  }
}

function useActividadReactAnotado() {
  const { entradas, recibirMensaje, limpiar } = useEntradasConsola()
  const [arbol, setArbol] = useState<MensajeArbol | null>(null)
  const { entradas: peticiones, recibir: recibirPeticion, limpiar: limpiarPeticiones } =
    useRegistroAgrupado(20, incorporarPeticiones)
  const { entradas: efectos, recibir: recibirEfecto, limpiar: limpiarEfectos } =
    useRegistroAgrupado(200, incorporarEfectos)
  const {
    entradas: operacionesRouter,
    recibir: recibirOperacionRouter,
    limpiar: limpiarOperacionesRouter,
  } = useRegistroAgrupado(100, incorporarOperaciones)
  const [registroRouterLleno, setRegistroRouterLleno] = useState(false)
  const [falloPendiente, setFalloPendiente] = useState(false)
  const [fallosSolicitados, setFallosSolicitados] = useState(0)
  return {
    entradas,
    recibirMensaje,
    limpiar,
    arbol,
    setArbol,
    peticiones,
    recibirPeticion,
    limpiarPeticiones,
    efectos,
    recibirEfecto,
    limpiarEfectos,
    operacionesRouter,
    recibirOperacionRouter,
    limpiarOperacionesRouter,
    registroRouterLleno,
    setRegistroRouterLleno,
    falloPendiente,
    setFalloPendiente,
    fallosSolicitados,
    setFallosSolicitados,
  }
}

function useRedReactAnotado(red?: DatosReactAnotado['red']) {
  const [redActual, setRedActual] = useState<AjustesRed>({
    latencia: red?.latencia ?? RED_POR_DEFECTO.latencia,
    desordenar: red?.desordenar ?? RED_POR_DEFECTO.desordenar,
  })
  const redActualRef = useRef(redActual)
  const cambiarRed = useCallback((nueva: AjustesRed) => {
    redActualRef.current = nueva
    setRedActual(nueva)
  }, [])
  return { redActual, redActualRef, cambiarRed }
}

type EstadoDocumento = ReturnType<typeof useDocumentoReactAnotado>
type EstadoActividad = ReturnType<typeof useActividadReactAnotado>
type ContextoMensaje = Pick<EstadoDocumento, 'urlActualRef' | 'setUbicacion'> &
  Pick<
    EstadoActividad,
    | 'recibirMensaje'
    | 'setArbol'
    | 'recibirPeticion'
    | 'setFalloPendiente'
    | 'recibirEfecto'
    | 'recibirOperacionRouter'
    | 'setRegistroRouterLleno'
  > & { documentoMontadoRef: RefObject<boolean> }

function procesarActividadMontada(mensaje: MensajeReactEnVivo, contexto: ContextoMensaje) {
  if (!contexto.documentoMontadoRef.current) return
  if (mensaje.tipo === 'arbol') {
    contexto.setArbol(mensaje)
  }
  if (mensaje.tipo === 'peticion') {
    contexto.recibirPeticion(mensaje)
    if (mensaje.codigo === 500) contexto.setFalloPendiente(false)
  }
  if (mensaje.tipo === 'efecto') {
    contexto.recibirEfecto(mensaje)
  }
  if (mensaje.tipo === 'router-operacion') {
    contexto.recibirOperacionRouter(mensaje)
  }
}

function procesarMensaje(mensaje: MensajeReactEnVivo, contexto: ContextoMensaje) {
  contexto.recibirMensaje(mensaje)
  if (mensaje.tipo === 'montado') contexto.documentoMontadoRef.current = true
  if (mensaje.tipo === 'ubicacion') {
    contexto.urlActualRef.current = mensaje.url
    contexto.setUbicacion(mensaje)
  }
  procesarActividadMontada(mensaje, contexto)
  if (mensaje.tipo === 'router-lleno') contexto.setRegistroRouterLleno(true)
}

function useRecibirMensaje(
  documento: EstadoDocumento,
  actividad: EstadoActividad,
  documentoMontadoRef: RefObject<boolean>,
) {
  const { setUbicacion, urlActualRef } = documento
  const {
    recibirEfecto,
    recibirMensaje,
    recibirOperacionRouter,
    recibirPeticion,
    setArbol,
    setFalloPendiente,
    setRegistroRouterLleno,
  } = actividad
  return useCallback(
    (mensaje: MensajeReactEnVivo) => {
      procesarMensaje(mensaje, {
        recibirMensaje,
        urlActualRef,
        setUbicacion,
        setArbol,
        recibirPeticion,
        setFalloPendiente,
        recibirEfecto,
        recibirOperacionRouter,
        setRegistroRouterLleno,
        documentoMontadoRef,
      })
    },
    [
      documentoMontadoRef,
      recibirEfecto,
      recibirMensaje,
      recibirOperacionRouter,
      recibirPeticion,
      setArbol,
      setFalloPendiente,
      setRegistroRouterLleno,
      setUbicacion,
      urlActualRef,
    ],
  )
}

function useApiEstable(api?: Record<string, unknown[]>) {
  const claveApi = JSON.stringify(api)
  return useMemo<Record<string, unknown[]> | undefined>(
    () => (claveApi === undefined ? undefined : JSON.parse(claveApi)),
    [claveApi],
  )
}

type ContextoPreparacion = Pick<
  EstadoDocumento,
  'urlActualRef' | 'setUbicacion' | 'setSrcDoc' | 'setError'
> &
  Pick<
    EstadoActividad,
    | 'setArbol'
    | 'limpiarPeticiones'
    | 'limpiarEfectos'
    | 'limpiarOperacionesRouter'
    | 'setRegistroRouterLleno'
    | 'setFalloPendiente'
    | 'limpiar'
  > & {
    documentoMontadoRef: RefObject<boolean>
    redActualRef: RefObject<AjustesRed>
  }

function usePreparacionDocumento(
  configuracion: ConfiguracionEstadoReactAnotado,
  apiEstable: Record<string, unknown[]> | undefined,
  contexto: ContextoPreparacion,
) {
  const {
    documentoMontadoRef,
    limpiar,
    limpiarEfectos,
    limpiarOperacionesRouter,
    limpiarPeticiones,
    redActualRef,
    setArbol,
    setError,
    setFalloPendiente,
    setRegistroRouterLleno,
    setSrcDoc,
    setUbicacion,
    urlActualRef,
  } = contexto
  useEffect(() => {
    let cancelado = false
    const archivos = [
      {
        nombre: configuracion.lenguaje === 'tsx' ? 'App.tsx' : 'App.jsx',
        codigo: configuracion.codigo,
      },
      ...(configuracion.css ? [{ nombre: 'estilos.css', codigo: configuracion.css }] : []),
    ]
    void prepararDocumento(archivos, {
      origen: window.location.origin,
      strictMode: configuracion.strictMode,
      conPruebas: false,
      conArbol: configuracion.mostrarArbol,
      conEfectos: configuracion.mostrarEfectos,
      conRegistroRouter: configuracion.mostrarRouter,
      api: apiEstable,
      red: redActualRef.current,
      urlInicial: urlActualRef.current ?? configuracion.urlInicial,
    }).then((preparado) => {
      if (cancelado) return
      if (preparado.ok) {
        documentoMontadoRef.current = false
        setUbicacion(null)
        setArbol(null)
        limpiarPeticiones()
        limpiarEfectos()
        limpiarOperacionesRouter()
        setRegistroRouterLleno(false)
        setFalloPendiente(false)
        limpiar()
        setSrcDoc(preparado.srcDoc)
      } else setError(preparado.error)
    })
    return () => {
      cancelado = true
    }
  }, [apiEstable, configuracion.codigo, configuracion.css, configuracion.strictMode, configuracion.mostrarArbol, configuracion.mostrarEfectos, configuracion.mostrarRouter, limpiar, limpiarEfectos, limpiarOperacionesRouter, limpiarPeticiones, configuracion.lenguaje, configuracion.urlInicial, documentoMontadoRef, redActualRef, setArbol, setError, setFalloPendiente, setRegistroRouterLleno, setSrcDoc, setUbicacion, urlActualRef])
}

function useActuarEnNavegador(documento: EstadoDocumento, actividad: EstadoActividad) {
  const { setOrdenNavegador, siguienteOrdenNavegadorRef } = documento
  const {
    limpiar,
    limpiarEfectos,
    limpiarOperacionesRouter,
    limpiarPeticiones,
    setArbol,
    setFalloPendiente,
    setRegistroRouterLleno,
  } = actividad
  return useCallback(
    (accion: AccionNavegador, url?: string) => {
      if (accion === 'recargar' || accion === 'ir') {
        limpiar()
        setArbol(null)
        limpiarPeticiones()
        limpiarEfectos()
        limpiarOperacionesRouter()
        setRegistroRouterLleno(false)
        setFalloPendiente(false)
      }
      siguienteOrdenNavegadorRef.current += 1
      setOrdenNavegador({
        id: siguienteOrdenNavegadorRef.current,
        accion,
        ...(url ? { url } : {}),
      })
    },
    [
      limpiar,
      limpiarEfectos,
      limpiarOperacionesRouter,
      limpiarPeticiones,
      setArbol,
      setFalloPendiente,
      setOrdenNavegador,
      setRegistroRouterLleno,
      siguienteOrdenNavegadorRef,
    ],
  )
}

export function useEstadoReactAnotado(configuracion: ConfiguracionEstadoReactAnotado) {
  const anotaciones = useAnotacionesReactAnotado(configuracion.anotaciones, configuracion.codigo)
  const documento = useDocumentoReactAnotado()
  const actividad = useActividadReactAnotado()
  const registroRed = useRedReactAnotado(configuracion.red)
  const documentoMontadoRef = useRef(false)
  const recibir = useRecibirMensaje(documento, actividad, documentoMontadoRef)
  const apiEstable = useApiEstable(configuracion.api)
  usePreparacionDocumento(configuracion, apiEstable, {
    urlActualRef: documento.urlActualRef,
    setUbicacion: documento.setUbicacion,
    setSrcDoc: documento.setSrcDoc,
    setError: documento.setError,
    setArbol: actividad.setArbol,
    limpiarPeticiones: actividad.limpiarPeticiones,
    limpiarEfectos: actividad.limpiarEfectos,
    limpiarOperacionesRouter: actividad.limpiarOperacionesRouter,
    setRegistroRouterLleno: actividad.setRegistroRouterLleno,
    setFalloPendiente: actividad.setFalloPendiente,
    limpiar: actividad.limpiar,
    documentoMontadoRef,
    redActualRef: registroRed.redActualRef,
  })
  const actuarEnNavegador = useActuarEnNavegador(documento, actividad)

  return {
    ...anotaciones,
    ...documento,
    ...actividad,
    ...registroRed,
    recibir,
    actuarEnNavegador,
  }
}

export type EstadoReactAnotado = ReturnType<typeof useEstadoReactAnotado>
