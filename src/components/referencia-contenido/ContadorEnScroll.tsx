import { useEffect, useRef, useState } from 'react'
import { Gauge } from 'lucide-react'

export interface PropiedadesContadorEnScroll {
  valor: number
  etiqueta: string
  sufijo?: string
  duracionMs?: number
}

export function ContadorEnScroll({
  valor,
  etiqueta,
  sufijo = '',
  duracionMs = 1000,
}: PropiedadesContadorEnScroll) {
  const contenedorRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const [valorVisible, setValorVisible] = useState(0)
  const formateador = new Intl.NumberFormat('es-ES')

  useEffect(() => {
    const elemento = contenedorRef.current
    if (!elemento) return
    if (typeof IntersectionObserver === 'undefined') return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const reducir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reducir || duracionMs <= 0) return

    let fotograma = 0
    const inicio = performance.now()
    function animar(ahora: number) {
      const progreso = Math.min((ahora - inicio) / duracionMs, 1)
      setValorVisible(Math.round(valor * (1 - (1 - progreso) ** 3)))
      if (progreso < 1) fotograma = window.requestAnimationFrame(animar)
    }
    fotograma = window.requestAnimationFrame(animar)
    return () => window.cancelAnimationFrame(fotograma)
  }, [duracionMs, valor, visible])

  const numeroMostrado = visible && (reducirMovimientoActivo() || duracionMs <= 0) ? valor : valorVisible

  return (
    <article
      ref={contenedorRef}
      aria-label={`${etiqueta}: ${formateador.format(valor)}${sufijo}`}
      className="flex items-center justify-between gap-5 rounded-xl border bg-card p-5 shadow-sm"
    >
      <div>
        <p aria-hidden="true" className="text-4xl font-semibold tracking-tight tabular-nums">
          {formateador.format(numeroMostrado)}{sufijo}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{etiqueta}</p>
      </div>
      <span className="flex size-11 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
        <Gauge aria-hidden="true" className="size-5" />
      </span>
    </article>
  )
}

function reducirMovimientoActivo() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
