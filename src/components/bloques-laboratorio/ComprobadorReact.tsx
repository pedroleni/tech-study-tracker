import { useEffect, useLayoutEffect, useRef } from 'react'

import type { ResultadoComprobacion } from '@/components/bloques-laboratorio/ResultadosComprobaciones'
import type { ComprobacionReact } from '@/lib/laboratorio/schemas'
import {
  CANAL_REACT_EN_VIVO,
  TIEMPO_MAXIMO_COMPROBACION_MS,
} from '@/lib/react-en-vivo/constantes'
import { leerMensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'

export type FinComprobacion =
  | { estado: 'listo'; resultados: ResultadoComprobacion[] }
  | { estado: 'tiempo-agotado' }

// Las comprobaciones corren en un iframe propio, recién creado y fuera de
// pantalla (renderizado y enfocable: con display: none user-event no podría
// escribir), para no tocar lo que el alumno tiene en la vista previa.
export function ComprobadorReact({
  srcDoc,
  comprobaciones,
  onTerminar,
}: {
  srcDoc: string
  comprobaciones: ComprobacionReact[]
  onTerminar: (fin: FinComprobacion) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onTerminarRef = useRef(onTerminar)

  useEffect(() => {
    onTerminarRef.current = onTerminar
  }, [onTerminar])

  // useLayoutEffect: el oyente tiene que estar puesto antes de que el iframe
  // pueda avisar de que ha montado; si no, el aviso se pierde y la
  // comprobación no empieza nunca (ver VistaPreviaReact).
  useLayoutEffect(() => {
    let terminado = false
    const terminar = (fin: FinComprobacion) => {
      if (terminado) return
      terminado = true
      onTerminarRef.current(fin)
    }
    const recibir = (evento: MessageEvent) => {
      const mensaje = leerMensajeReactEnVivo(evento, iframeRef.current?.contentWindow)
      if (!mensaje) return
      if (mensaje.tipo === 'montado') {
        // '*' porque el iframe tiene origen opaco (sandbox sin allow-same-origin).
        iframeRef.current?.contentWindow?.postMessage(
          { canal: CANAL_REACT_EN_VIVO, tipo: 'comprobar', comprobaciones },
          '*',
        )
      }
      if (mensaje.tipo === 'resultado-comprobaciones') {
        terminar({ estado: 'listo', resultados: mensaje.resultados })
      }
    }

    window.addEventListener('message', recibir)
    const temporizador = window.setTimeout(
      () => terminar({ estado: 'tiempo-agotado' }),
      TIEMPO_MAXIMO_COMPROBACION_MS,
    )
    return () => {
      terminado = true
      window.removeEventListener('message', recibir)
      window.clearTimeout(temporizador)
    }
  }, [comprobaciones, srcDoc])

  return (
    <iframe
      ref={iframeRef}
      aria-hidden="true"
      tabIndex={-1}
      sandbox="allow-scripts allow-forms"
      srcDoc={srcDoc}
      style={{ position: 'absolute', left: '-10000px', top: 0, width: '600px', height: '400px' }}
      title="Comprobaciones"
    />
  )
}
