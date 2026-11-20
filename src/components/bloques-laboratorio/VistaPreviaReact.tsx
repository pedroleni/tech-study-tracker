import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { MensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'
import { CANAL_REACT_EN_VIVO } from '@/lib/react-en-vivo/constantes'
import { cn } from '@/lib/utils'

import type { AjustesRed } from './PanelRed'
import {
  useMensajesVistaPreviaReact,
  type ErrorVistaPreviaReact,
  type OrdenNavegadorVistaPrevia,
} from './useMensajesVistaPreviaReact'

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
  ordenNavegador?: OrdenNavegadorVistaPrevia
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onMensajeRef = useRef(onMensaje)
  const redRef = useRef(red)
  const montadoRef = useRef(false)
  const fallosEnviadosRef = useRef(0)
  const fallosSolicitadosRef = useRef(fallosSolicitados)
  const ordenNavegadorRef = useRef(ordenNavegador)
  const ultimaOrdenNavegadorEnviadaRef = useRef(ordenNavegador?.id ?? 0)
  const [alto, setAlto] = useState<number | null>(null)
  const [revision, setRevision] = useState(0)
  // El error se guarda junto al documento que lo produjo: al cambiar srcDoc
  // deja de mostrarse sin tener que borrarlo desde un efecto.
  const [error, setError] = useState<ErrorVistaPreviaReact | null>(null)

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

  useMensajesVistaPreviaReact({
    iframeRef,
    onMensajeRef,
    redRef,
    montadoRef,
    fallosEnviadosRef,
    fallosSolicitadosRef,
    ordenNavegadorRef,
    ultimaOrdenNavegadorEnviadaRef,
    srcDoc,
    codigoCompilado,
    revision,
    setAlto,
    setError,
    remontar,
    enviarOrdenNavegador,
  })

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
