import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

export interface PropiedadesTarjetaEstadistica {
  valor: number
  etiqueta: string
  sufijo?: string
  duracionMs?: number
}

export function TarjetaEstadistica({
  valor,
  etiqueta,
  sufijo = '',
  duracionMs = 900,
}: PropiedadesTarjetaEstadistica) {
  const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const [valorVisible, setValorVisible] = useState(() =>
    reducirMovimiento || duracionMs <= 0 ? valor : 0,
  )
  const formateador = new Intl.NumberFormat('es-ES')

  useEffect(() => {
    if (reducirMovimiento || duracionMs <= 0) return

    const intervaloMs = 30
    const pasos = Math.max(1, Math.round(duracionMs / intervaloMs))
    let paso = 0
    const intervalo = window.setInterval(() => {
      paso += 1
      const progreso = Math.min(paso / pasos, 1)
      setValorVisible(Math.round(valor * (1 - (1 - progreso) ** 3)))
      if (progreso === 1) window.clearInterval(intervalo)
    }, intervaloMs)

    return () => window.clearInterval(intervalo)
  }, [duracionMs, reducirMovimiento, valor])

  return (
    <article
      aria-label={`${etiqueta}: ${formateador.format(valor)}${sufijo}`}
      className="rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p aria-hidden="true" className="text-4xl font-semibold tracking-tight tabular-nums">
            {formateador.format(valorVisible)}{sufijo}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{etiqueta}</p>
        </div>
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"
        >
          <TrendingUp className="size-5" />
        </span>
      </div>
    </article>
  )
}
