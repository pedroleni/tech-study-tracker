import { useEffect, useState } from 'react'
import { Pause, Play, Sparkles } from 'lucide-react'

export interface PropiedadesTextoRotativo {
  prefijo: string
  palabras: string[]
  sufijo?: string
  intervaloMs?: number
}

export function TextoRotativo({
  prefijo,
  palabras,
  sufijo = '',
  intervaloMs = 2200,
}: PropiedadesTextoRotativo) {
  const [activo, setActivo] = useState(0)
  const [pausado, setPausado] = useState(false)
  const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  useEffect(() => {
    if (pausado || reducirMovimiento || palabras.length < 2 || intervaloMs <= 0) return
    const intervalo = window.setInterval(
      () => setActivo((actual) => (actual + 1) % palabras.length),
      intervaloMs,
    )
    return () => window.clearInterval(intervalo)
  }, [intervaloMs, palabras.length, pausado, reducirMovimiento])

  if (palabras.length === 0) return null

  return (
    <div className="flex min-h-20 items-center gap-3 rounded-xl border bg-card p-5 shadow-sm">
      <p className="flex flex-1 flex-wrap items-center justify-center gap-x-2 text-center text-xl font-semibold text-balance sm:text-2xl">
        <Sparkles aria-hidden="true" className="size-5 text-amber-600 dark:text-amber-400" />
        <span>{prefijo}</span>
        <span className="inline-grid overflow-hidden text-blue-600 dark:text-blue-400" aria-live="polite">
          <span
            key={`${activo}-${palabras[activo]}`}
            className="animate-in fade-in-0 slide-in-from-bottom-3 col-start-1 row-start-1 duration-500 motion-reduce:animate-none"
          >
            {palabras[activo]}
          </span>
        </span>
        {sufijo && <span>{sufijo}</span>}
      </p>
      <button
        type="button"
        aria-label={pausado ? 'Reanudar texto' : 'Pausar texto'}
        aria-pressed={pausado}
        onClick={() => setPausado((actual) => !actual)}
        className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {pausado ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
      </button>
    </div>
  )
}
