import { useCallback, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'

import type { AccionNavegador } from '@/components/bloques-laboratorio/BarraDirecciones'
import type { AjustesRed } from '@/components/bloques-laboratorio/PanelRed'
import {
  incorporarEfectos,
  incorporarOperaciones,
  incorporarPeticiones,
} from '@/components/bloques-laboratorio/reactEnVivoAyudas'
import { useEntradasConsola } from '@/components/bloques-laboratorio/useEntradasConsola'
import { useRegistroAgrupado } from '@/components/bloques-laboratorio/useRegistroAgrupado'
import type { DatosReactEnVivo } from '@/lib/laboratorio/schemas'
import type { MensajeArbol, MensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'

const RED_POR_DEFECTO: AjustesRed = { latencia: 600, desordenar: false }

function useNavegacionRegistrada() {
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
  const registrarOrdenNavegador = useCallback((accion: AccionNavegador, url?: string) => {
    siguienteOrdenNavegadorRef.current += 1
    setOrdenNavegador({
      id: siguienteOrdenNavegadorRef.current,
      accion,
      ...(url ? { url } : {}),
    })
  }, [])
  return {
    ubicacion,
    setUbicacion,
    urlActualRef,
    ordenNavegador,
    setOrdenNavegador,
    registrarOrdenNavegador,
  }
}

function useActividadRegistrada() {
  const { entradas, recibirMensaje, limpiar } = useEntradasConsola()
  const [arbol, setArbol] = useState<MensajeArbol | null>(null)
  const { entradas: peticiones, recibir: recibirPeticion, limpiar: limpiarPeticiones } =
    useRegistroAgrupado(20, incorporarPeticiones)
  const { entradas: efectos, recibir: recibirEfecto, limpiar: limpiarEfectos } =
    useRegistroAgrupado(200, incorporarEfectos)
  return {
    entradas, recibirMensaje, limpiar, arbol, setArbol,
    peticiones, recibirPeticion, limpiarPeticiones,
    efectos, recibirEfecto, limpiarEfectos,
  }
}

function useOperacionesRouterRegistradas() {
  const {
    entradas: operacionesRouter,
    recibir: recibirOperacionRouter,
    limpiar: limpiarOperacionesRouter,
  } = useRegistroAgrupado(100, incorporarOperaciones)
  const [registroRouterLleno, setRegistroRouterLleno] = useState(false)
  return {
    operacionesRouter, recibirOperacionRouter,
    limpiarOperacionesRouter, registroRouterLleno, setRegistroRouterLleno,
  }
}

function obtenerRedInicial(red?: DatosReactEnVivo['red']): AjustesRed {
  return {
    latencia: red?.latencia ?? RED_POR_DEFECTO.latencia,
    desordenar: red?.desordenar ?? RED_POR_DEFECTO.desordenar,
  }
}

function useRedRegistrada(red?: DatosReactEnVivo['red']) {
  const [falloPendiente, setFalloPendiente] = useState(false)
  const [fallosSolicitados, setFallosSolicitados] = useState(0)
  const [redActual, setRedActual] = useState<AjustesRed>(() => obtenerRedInicial(red))
  const redActualRef = useRef(redActual)
  const cambiarRed = useCallback((nueva: AjustesRed) => {
    redActualRef.current = nueva
    setRedActual(nueva)
  }, [])
  return {
    falloPendiente, setFalloPendiente, fallosSolicitados,
    setFallosSolicitados, redActual, redActualRef, cambiarRed,
  }
}

type DatosRegistro = ReturnType<typeof useNavegacionRegistrada> &
  ReturnType<typeof useActividadRegistrada> &
  ReturnType<typeof useOperacionesRouterRegistradas> &
  ReturnType<typeof useRedRegistrada>
type ContextoMensaje = Pick<
  DatosRegistro,
  | 'recibirMensaje'
  | 'urlActualRef'
  | 'setUbicacion'
  | 'setArbol'
  | 'recibirPeticion'
  | 'setFalloPendiente'
  | 'recibirEfecto'
  | 'recibirOperacionRouter'
  | 'setRegistroRouterLleno'
> & { documentoMontadoRef: RefObject<boolean> }

function procesarMensajeRegistro(mensaje: MensajeReactEnVivo, contexto: ContextoMensaje) {
  contexto.recibirMensaje(mensaje)
  if (mensaje.tipo === 'montado') contexto.documentoMontadoRef.current = true
  if (mensaje.tipo === 'ubicacion') {
    contexto.urlActualRef.current = mensaje.url
    contexto.setUbicacion(mensaje)
  }
  if (mensaje.tipo === 'arbol' && contexto.documentoMontadoRef.current) contexto.setArbol(mensaje)
  if (mensaje.tipo === 'peticion' && contexto.documentoMontadoRef.current) {
    contexto.recibirPeticion(mensaje)
    if (mensaje.codigo === 500) contexto.setFalloPendiente(false)
  }
  if (mensaje.tipo === 'efecto' && contexto.documentoMontadoRef.current) {
    contexto.recibirEfecto(mensaje)
  }
  if (mensaje.tipo === 'router-operacion' && contexto.documentoMontadoRef.current) {
    contexto.recibirOperacionRouter(mensaje)
  }
  if (mensaje.tipo === 'router-lleno') contexto.setRegistroRouterLleno(true)
}

export function useRegistroReactEnVivo(red?: DatosReactEnVivo['red']) {
  const navegacion = useNavegacionRegistrada()
  const actividad = useActividadRegistrada()
  const router = useOperacionesRouterRegistradas()
  const registroRed = useRedRegistrada(red)
  const { registrarOrdenNavegador } = navegacion
  const {
    limpiar,
    limpiarEfectos,
    limpiarPeticiones,
    setArbol,
  } = actividad
  const { limpiarOperacionesRouter, setRegistroRouterLleno } = router
  const { setFalloPendiente } = registroRed
  const documentoMontadoRef = useRef(false)
  const contextoMensaje = useMemo<ContextoMensaje>(
    () => ({
      recibirMensaje: actividad.recibirMensaje,
      urlActualRef: navegacion.urlActualRef,
      setUbicacion: navegacion.setUbicacion,
      setArbol: actividad.setArbol,
      recibirPeticion: actividad.recibirPeticion,
      setFalloPendiente: registroRed.setFalloPendiente,
      recibirEfecto: actividad.recibirEfecto,
      recibirOperacionRouter: router.recibirOperacionRouter,
      setRegistroRouterLleno: router.setRegistroRouterLleno,
      documentoMontadoRef,
    }),
    [actividad.recibirEfecto, actividad.recibirMensaje, actividad.recibirPeticion, actividad.setArbol, navegacion.setUbicacion, navegacion.urlActualRef, registroRed.setFalloPendiente, router.recibirOperacionRouter, router.setRegistroRouterLleno],
  )
  const recibir = useCallback(
    (mensaje: MensajeReactEnVivo) => procesarMensajeRegistro(mensaje, contextoMensaje),
    [contextoMensaje],
  )
  const invalidarDocumentoMontado = useCallback(() => {
    documentoMontadoRef.current = false
  }, [])

  const limpiarAlNavegar = useCallback(() => {
    limpiar()
    setArbol(null)
    limpiarPeticiones()
    limpiarEfectos()
    limpiarOperacionesRouter()
    setRegistroRouterLleno(false)
    setFalloPendiente(false)
  }, [
    limpiar,
    limpiarEfectos,
    limpiarOperacionesRouter,
    limpiarPeticiones,
    setArbol,
    setFalloPendiente,
    setRegistroRouterLleno,
  ])
  const actuarEnNavegador = useCallback((accion: AccionNavegador, url?: string) => {
    if (accion === 'recargar' || accion === 'ir') limpiarAlNavegar()
    registrarOrdenNavegador(accion, url)
  }, [limpiarAlNavegar, registrarOrdenNavegador])

  return {
    ...navegacion, ...actividad, ...router, ...registroRed,
    documentoMontadoRef, recibir, invalidarDocumentoMontado, actuarEnNavegador,
  }
}
