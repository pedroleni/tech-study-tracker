import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { leerMensajeReactEnVivo, type MensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'
import { CANAL_REACT_EN_VIVO } from '@/lib/react-en-vivo/constantes'
import { explicarErrorReact } from '@/lib/react-en-vivo/explicarError'
import { cn } from '@/lib/utils'

import type { AjustesRed } from './PanelRed'

export function VistaPreviaReact({
  srcDoc,
  onMensaje,
  red,
  fallosSolicitados = 0,
  codigoCompilado = false,
  ordenNavegador,
}: {
  srcDoc: string
  onMensaje?: (mensaje: MensajeReactEnVivo) => void
  red?: AjustesRed
  fallosSolicitados?: number
  codigoCompilado?: boolean
  ordenNavegador?: {
    id: number
    accion: 'atras' | 'adelante' | 'recargar' | 'ir'
    url?: string
  }
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onMensajeRef = useRef(onMensaje)
  const redRef = useRef(red)
  const montadoRef = useRef(false)
  const fallosEnviadosRef = useRef(0)
  const fallosSolicitadosRef = useRef(fallosSolicitados)
  const ordenNavegadorRef = useRef(ordenNavegador)
  const ultimaOrdenNavegadorEnviadaRef = useRef(ordenNavegador?.id ?? 0)
  const documentoRef = useRef<{ srcDoc: string; codigoCompilado: boolean } | null>(null)
  const reintentoRef = useRef<{
    srcDoc: string
    fase: 'disponible' | 'pendiente' | 'agotado'
  }>({ srcDoc, fase: 'disponible' })
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [alto, setAlto] = useState<number | null>(null)
  const [revision, setRevision] = useState(0)
  // El error se guarda junto al documento que lo produjo: al cambiar srcDoc
  // deja de mostrarse sin tener que borrarlo desde un efecto.
  const [error, setError] = useState<{
    srcDoc: string
    texto: string
    explicacion?: string
    runtime?: 'react' | 'react-router'
  } | null>(null)

  const remontar = useCallback(() => {
    montadoRef.current = false
    setError(null)
    setRevision((actual) => actual + 1)
  }, [])

  const enviarOrdenNavegador = useCallback((orden: NonNullable<typeof ordenNavegador>) => {
    const ventana = iframeRef.current?.contentWindow
    if (!ventana) return
    ventana.postMessage(
      {
        canal: CANAL_REACT_EN_VIVO,
        tipo: 'navegador',
        accion: orden.accion,
        ...(orden.url ? { url: orden.url } : {}),
      },
      '*',
    )
    ultimaOrdenNavegadorEnviadaRef.current = orden.id
    if (orden.accion === 'recargar' || orden.accion === 'ir') setError(null)
  }, [])

  useEffect(() => {
    onMensajeRef.current = onMensaje
  }, [onMensaje])

  useLayoutEffect(() => {
    fallosSolicitadosRef.current = fallosSolicitados
  }, [fallosSolicitados])

  useLayoutEffect(() => {
    ordenNavegadorRef.current = ordenNavegador
  }, [ordenNavegador])

  useEffect(() => {
    if (
      !ordenNavegador ||
      !montadoRef.current ||
      ordenNavegador.id === ultimaOrdenNavegadorEnviadaRef.current
    ) return
    enviarOrdenNavegador(ordenNavegador)
  }, [enviarOrdenNavegador, ordenNavegador])

  useEffect(() => {
    redRef.current = red
    if (!red || !montadoRef.current) return
    iframeRef.current?.contentWindow?.postMessage(
      { canal: CANAL_REACT_EN_VIVO, tipo: 'red', ...red },
      '*',
    )
  }, [red])

  useEffect(() => {
    if (!montadoRef.current || fallosSolicitados <= fallosEnviadosRef.current) return
    iframeRef.current?.contentWindow?.postMessage(
      { canal: CANAL_REACT_EN_VIVO, tipo: 'fallar-siguiente' },
      '*',
    )
    fallosEnviadosRef.current = fallosSolicitados
  }, [fallosSolicitados])

  // useLayoutEffect y no useEffect: el oyente queda puesto en el mismo commit
  // que inserta el iframe, antes de que su código pueda mandar nada. Con
  // useEffect (después de pintar), un iframe rápido podía adelantarse y su
  // mensaje perderse.
  useLayoutEffect(() => {
    if (reintentoRef.current.srcDoc !== srcDoc) {
      if (temporizadorRef.current !== null) clearTimeout(temporizadorRef.current)
      temporizadorRef.current = null
      reintentoRef.current = { srcDoc, fase: 'disponible' }
    }
    const documento = documentoRef.current
    if (
      !documento ||
      documento.srcDoc !== srcDoc ||
      documento.codigoCompilado !== codigoCompilado
    ) {
      montadoRef.current = false
      documentoRef.current = { srcDoc, codigoCompilado }
    }
    const recibir = (evento: MessageEvent) => {
      const mensaje = leerMensajeReactEnVivo(evento, iframeRef.current?.contentWindow)
      if (!mensaje) return
      if (mensaje.tipo === 'montado') {
        montadoRef.current = true
        if (redRef.current) {
          iframeRef.current?.contentWindow?.postMessage(
            { canal: CANAL_REACT_EN_VIVO, tipo: 'red', ...redRef.current },
            '*',
          )
        }
        if (fallosSolicitadosRef.current > fallosEnviadosRef.current) {
          iframeRef.current?.contentWindow?.postMessage(
            { canal: CANAL_REACT_EN_VIVO, tipo: 'fallar-siguiente' },
            '*',
          )
          fallosEnviadosRef.current = fallosSolicitadosRef.current
        }
        const orden = ordenNavegadorRef.current
        if (orden && orden.id !== ultimaOrdenNavegadorEnviadaRef.current) {
          enviarOrdenNavegador(orden)
        }
      }
      if (mensaje.tipo === 'alto') setAlto(mensaje.alto)
      if (mensaje.tipo === 'runtime-no-cargado') {
        const reintento = reintentoRef.current
        if (reintento.fase === 'disponible') {
          reintento.fase = 'pendiente'
          setError(null)
          temporizadorRef.current = setTimeout(() => {
            if (reintentoRef.current !== reintento) return
            reintento.fase = 'agotado'
            temporizadorRef.current = null
            remontar()
          }, 800)
        } else if (reintento.fase === 'agotado') {
          setError({
            srcDoc,
            texto: `No se pudo cargar ${mensaje.libreria === 'react' ? 'React' : 'React Router'} en la vista previa. Puede ser un corte de conexión momentáneo.`,
            runtime: mensaje.libreria,
          })
        }
      }
      if (mensaje.tipo === 'error-render') {
        const esFalloDelRuntime = mensaje.texto.startsWith(
          'No se pudo cargar React Router en la vista previa.',
        )
        if (esFalloDelRuntime && reintentoRef.current.fase !== 'disponible') {
          onMensajeRef.current?.(mensaje)
          return
        }
        const donde = mensaje.archivo
          ? ` — ${mensaje.archivo}${
              mensaje.linea
                ? `, línea ${mensaje.linea}${codigoCompilado ? ' del código compilado' : ''}`
                : ''
            }`
          : ''
        setError({
          srcDoc,
          texto: `Error al renderizar: ${mensaje.texto}${donde}`,
          explicacion: explicarErrorReact(mensaje.texto) ?? undefined,
        })
      }
      if (mensaje.tipo === 'error') {
        setError({
          srcDoc,
          texto: `Error: ${mensaje.texto}`,
          explicacion: explicarErrorReact(mensaje.texto) ?? undefined,
        })
      }
      onMensajeRef.current?.(mensaje)
    }

    window.addEventListener('message', recibir)
    return () => {
      window.removeEventListener('message', recibir)
      if (temporizadorRef.current !== null) {
        clearTimeout(temporizadorRef.current)
        temporizadorRef.current = null
      }
    }
  }, [codigoCompilado, enviarOrdenNavegador, remontar, revision, srcDoc])

  const errorVisible = error?.srcDoc === srcDoc ? error : null

  return (
    <div className="min-w-0 space-y-2">
      <iframe
        key={revision}
        ref={iframeRef}
        className={cn(
          'block w-full max-w-full rounded-lg border bg-white',
          alto === null && 'h-40 sm:h-56',
        )}
        sandbox="allow-scripts allow-forms"
        srcDoc={srcDoc}
        style={
          alto === null ? undefined : { height: `${Math.min(Math.max(alto + 2, 160), 2400)}px` }
        }
        title="Vista previa de React"
      />
      {errorVisible && (
        <div
          aria-live="polite"
          className="space-y-2 rounded-lg bg-red-50 p-3 text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400"
        >
          <p className={errorVisible.runtime ? undefined : 'font-mono'}>{errorVisible.texto}</p>
          {errorVisible.explicacion && (
            <p>{`Qué suele significar: ${errorVisible.explicacion}`}</p>
          )}
          {errorVisible.runtime && (
            <Button type="button" variant="outline" size="sm" onClick={remontar}>
              <RotateCw aria-hidden="true" />
              Recargar vista previa
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
