import { useEffect, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'

export interface PropiedadesBannerAlerta {
  mensaje: string
  etiquetaCerrar?: string
}

export function BannerAlerta({
  mensaje,
  etiquetaCerrar = 'Cerrar aviso',
}: PropiedadesBannerAlerta) {
  const [visible, setVisible] = useState(true)
  const [cerrando, setCerrando] = useState(false)
  const temporizadorRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (temporizadorRef.current !== null) window.clearTimeout(temporizadorRef.current)
    },
    [],
  )

  if (!visible) return null

  function cerrar() {
    setCerrando(true)
    temporizadorRef.current = window.setTimeout(() => setVisible(false), 200)
  }

  return (
    <div
      role="status"
      className={`flex w-full items-center gap-3 border-y border-blue-200 bg-blue-50 px-4 py-3 text-blue-950 dark:border-blue-950 dark:bg-blue-950/40 dark:text-blue-50 ${
        cerrando
          ? 'animate-out fade-out-0 slide-out-to-top-2 duration-200 motion-reduce:animate-none'
          : 'animate-in fade-in-0 slide-in-from-top-2 duration-300 motion-reduce:animate-none'
      }`}
    >
      <Bell aria-hidden="true" className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
      <p className="min-w-0 flex-1 text-sm text-pretty">{mensaje}</p>
      <button
        type="button"
        aria-label={etiquetaCerrar}
        onClick={cerrar}
        className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-lg transition-colors hover:bg-blue-600/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}
