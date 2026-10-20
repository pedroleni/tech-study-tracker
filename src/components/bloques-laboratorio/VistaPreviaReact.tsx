import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { leerMensajeReactEnVivo, type MensajeReactEnVivo } from '@/lib/react-en-vivo/mensajes'
import { cn } from '@/lib/utils'

export function VistaPreviaReact({
  srcDoc,
  onMensaje,
}: {
  srcDoc: string
  onMensaje?: (mensaje: MensajeReactEnVivo) => void
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const onMensajeRef = useRef(onMensaje)
  const [alto, setAlto] = useState<number | null>(null)
  // El error se guarda junto al documento que lo produjo: al cambiar srcDoc
  // deja de mostrarse sin tener que borrarlo desde un efecto.
  const [error, setError] = useState<{ srcDoc: string; texto: string } | null>(null)

  useEffect(() => {
    onMensajeRef.current = onMensaje
  }, [onMensaje])

  // useLayoutEffect y no useEffect: el oyente queda puesto en el mismo commit
  // que inserta el iframe, antes de que su código pueda mandar nada. Con
  // useEffect (después de pintar), un iframe rápido podía adelantarse y su
  // mensaje perderse.
  useLayoutEffect(() => {
    const recibir = (evento: MessageEvent) => {
      const mensaje = leerMensajeReactEnVivo(evento, iframeRef.current?.contentWindow)
      if (!mensaje) return
      if (mensaje.tipo === 'alto') setAlto(mensaje.alto)
      if (mensaje.tipo === 'error-render') {
        const donde = mensaje.archivo
          ? ` — ${mensaje.archivo}${mensaje.linea ? `, línea ${mensaje.linea}` : ''}`
          : ''
        setError({ srcDoc, texto: `Error al renderizar: ${mensaje.texto}${donde}` })
      }
      if (mensaje.tipo === 'error') setError({ srcDoc, texto: `Error: ${mensaje.texto}` })
      onMensajeRef.current?.(mensaje)
    }

    window.addEventListener('message', recibir)
    return () => window.removeEventListener('message', recibir)
  }, [srcDoc])

  const errorVisible = error?.srcDoc === srcDoc ? error.texto : null

  return (
    <div className="min-w-0 space-y-2">
      <iframe
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
        <p
          aria-live="polite"
          className="rounded-lg bg-red-50 p-3 font-mono text-sm break-words text-red-700 dark:bg-red-950/30 dark:text-red-400"
        >
          {errorVisible}
        </p>
      )}
    </div>
  )
}
