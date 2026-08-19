import { useEffect, useState } from 'react'

export interface PropiedadesBarraProgresoLectura {
  etiqueta?: string
}

export function BarraProgresoLectura({
  etiqueta = 'Progreso de lectura',
}: PropiedadesBarraProgresoLectura) {
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    function actualizarProgreso() {
      const documento = document.documentElement
      const recorrido = documento.scrollHeight - documento.clientHeight
      const siguiente = recorrido > 0 ? (documento.scrollTop / recorrido) * 100 : 100
      setProgreso(Math.min(100, Math.max(0, siguiente)))
    }

    actualizarProgreso()
    window.addEventListener('scroll', actualizarProgreso, { passive: true })
    return () => window.removeEventListener('scroll', actualizarProgreso)
  }, [])

  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progreso)}
      className="fixed inset-x-0 top-0 z-50 h-1 bg-muted"
    >
      <span
        className="block h-full bg-primary transition-[width] duration-150 motion-reduce:transition-none"
        style={{ width: `${progreso}%` }}
      />
    </div>
  )
}
