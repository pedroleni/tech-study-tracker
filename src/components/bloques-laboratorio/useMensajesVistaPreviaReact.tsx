import { useLayoutEffect } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'

import { CANAL_REACT_EN_VIVO } from '@/lib/react-en-vivo/constantes'
import { explicarErrorReact } from '@/lib/react-en-vivo/explicarError'
import { leerMensajeReactEnVivo, type MensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'

import type { AjustesRed } from './PanelRed'

export type ErrorVistaPreviaReact = {
  srcDoc: string
  texto: string
  explicacion?: string
  runtime?: 'react' | 'react-router'
}

export type OrdenNavegadorVistaPrevia = {
  id: number
  accion: 'atras' | 'adelante' | 'recargar' | 'ir'
  url?: string
}

type ReintentoRuntime = {
  srcDoc: string
  fase: 'disponible' | 'pendiente' | 'agotado'
}

type ReferenciasMensajes = {
  iframeRef: RefObject<HTMLIFrameElement | null>
  onMensajeRef: RefObject<((mensaje: MensajeReactEnVivo) => void) | undefined>
  redRef: RefObject<AjustesRed | undefined>
  montadoRef: RefObject<boolean>
  fallosEnviadosRef: RefObject<number>
  fallosSolicitadosRef: RefObject<number>
  ordenNavegadorRef: RefObject<OrdenNavegadorVistaPrevia | undefined>
  ultimaOrdenNavegadorEnviadaRef: RefObject<number>
  documentoRef: RefObject<{ srcDoc: string; codigoCompilado: boolean } | null>
  reintentoRef: RefObject<ReintentoRuntime>
  temporizadorRef: RefObject<ReturnType<typeof setTimeout> | null>
}

type ContextoMensajes = ReferenciasMensajes & {
  srcDoc: string
  codigoCompilado: boolean
  setAlto: Dispatch<SetStateAction<number | null>>
  setError: Dispatch<SetStateAction<ErrorVistaPreviaReact | null>>
  remontar: () => void
  enviarOrdenNavegador: (orden: OrdenNavegadorVistaPrevia) => void
}

function procesarMontado(contexto: ContextoMensajes) {
  contexto.montadoRef.current = true
  const ventana = contexto.iframeRef.current?.contentWindow
  if (contexto.redRef.current) {
    ventana?.postMessage(
      { canal: CANAL_REACT_EN_VIVO, tipo: 'red', ...contexto.redRef.current },
      '*',
    )
  }
  if (contexto.fallosSolicitadosRef.current > contexto.fallosEnviadosRef.current) {
    ventana?.postMessage({ canal: CANAL_REACT_EN_VIVO, tipo: 'fallar-siguiente' }, '*')
    contexto.fallosEnviadosRef.current = contexto.fallosSolicitadosRef.current
  }
  const orden = contexto.ordenNavegadorRef.current
  if (orden && orden.id !== contexto.ultimaOrdenNavegadorEnviadaRef.current) {
    contexto.enviarOrdenNavegador(orden)
  }
}

function procesarRuntimeNoCargado(
  mensaje: Extract<MensajeReactEnVivo, { tipo: 'runtime-no-cargado' }>,
  contexto: ContextoMensajes,
) {
  const reintento = contexto.reintentoRef.current
  if (reintento.fase === 'disponible') {
    reintento.fase = 'pendiente'
    contexto.setError(null)
    contexto.temporizadorRef.current = setTimeout(() => {
      if (contexto.reintentoRef.current !== reintento) return
      reintento.fase = 'agotado'
      contexto.temporizadorRef.current = null
      contexto.remontar()
    }, 800)
    return
  }
  if (reintento.fase === 'agotado') {
    contexto.setError({
      srcDoc: contexto.srcDoc,
      texto: `No se pudo cargar ${mensaje.libreria === 'react' ? 'React' : 'React Router'} en la vista previa. Puede ser un corte de conexión momentáneo.`,
      runtime: mensaje.libreria,
    })
  }
}

function procesarErrorRender(
  mensaje: Extract<MensajeReactEnVivo, { tipo: 'error-render' }>,
  contexto: ContextoMensajes,
) {
  const esFalloDelRuntime = mensaje.texto.startsWith(
    'No se pudo cargar React Router en la vista previa.',
  )
  if (esFalloDelRuntime && contexto.reintentoRef.current.fase !== 'disponible') return false
  const linea = mensaje.linea
    ? `, línea ${mensaje.linea}${contexto.codigoCompilado ? ' del código compilado' : ''}`
    : ''
  const donde = mensaje.archivo ? ` — ${mensaje.archivo}${linea}` : ''
  contexto.setError({
    srcDoc: contexto.srcDoc,
    texto: `Error al renderizar: ${mensaje.texto}${donde}`,
    explicacion: explicarErrorReact(mensaje.texto) ?? undefined,
  })
  return true
}

function procesarMensaje(mensaje: MensajeReactEnVivo, contexto: ContextoMensajes) {
  if (mensaje.tipo === 'montado') procesarMontado(contexto)
  if (mensaje.tipo === 'alto') contexto.setAlto(mensaje.alto)
  if (mensaje.tipo === 'runtime-no-cargado') procesarRuntimeNoCargado(mensaje, contexto)
  if (mensaje.tipo === 'error-render' && !procesarErrorRender(mensaje, contexto)) {
    contexto.onMensajeRef.current?.(mensaje)
    return
  }
  if (mensaje.tipo === 'error') {
    contexto.setError({
      srcDoc: contexto.srcDoc,
      texto: `Error: ${mensaje.texto}`,
      explicacion: explicarErrorReact(mensaje.texto) ?? undefined,
    })
  }
  contexto.onMensajeRef.current?.(mensaje)
}

function prepararDocumento(contexto: ContextoMensajes) {
  if (contexto.reintentoRef.current.srcDoc !== contexto.srcDoc) {
    if (contexto.temporizadorRef.current !== null) clearTimeout(contexto.temporizadorRef.current)
    contexto.temporizadorRef.current = null
    contexto.reintentoRef.current = { srcDoc: contexto.srcDoc, fase: 'disponible' }
  }
  const documento = contexto.documentoRef.current
  if (
    !documento ||
    documento.srcDoc !== contexto.srcDoc ||
    documento.codigoCompilado !== contexto.codigoCompilado
  ) {
    contexto.montadoRef.current = false
    contexto.documentoRef.current = {
      srcDoc: contexto.srcDoc,
      codigoCompilado: contexto.codigoCompilado,
    }
  }
}

export function useMensajesVistaPreviaReact(contexto: ContextoMensajes, revision: number) {
  // useLayoutEffect y no useEffect: el oyente queda puesto en el mismo commit
  // que inserta el iframe, antes de que su código pueda mandar nada. Con
  // useEffect (después de pintar), un iframe rápido podía adelantarse y su
  // mensaje perderse.
  useLayoutEffect(() => {
    prepararDocumento(contexto)
    const recibir = (evento: MessageEvent) => {
      const mensaje = leerMensajeReactEnVivo(
        evento,
        contexto.iframeRef.current?.contentWindow,
      )
      if (mensaje) procesarMensaje(mensaje, contexto)
    }

    window.addEventListener('message', recibir)
    return () => {
      window.removeEventListener('message', recibir)
      if (contexto.temporizadorRef.current !== null) {
        clearTimeout(contexto.temporizadorRef.current)
        contexto.temporizadorRef.current = null
      }
    }
  }, [contexto, revision])
}
