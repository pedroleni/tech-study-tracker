import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'

export interface DiapositivaAutoplay {
  titulo: string
  descripcion: string
}

export interface PropiedadesCarruselAutoplay {
  items: DiapositivaAutoplay[]
  intervaloMs?: number
  etiqueta?: string
}

export function CarruselAutoplay({
  items,
  intervaloMs = 5000,
  etiqueta = 'Carrusel automático',
}: PropiedadesCarruselAutoplay) {
  const [activo, setActivo] = useState(0)
  const [pausaManual, setPausaManual] = useState(false)
  const [cursorDentro, setCursorDentro] = useState(false)
  const [focoDentro, setFocoDentro] = useState(false)
  const reducirMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const pausado = pausaManual || cursorDentro || focoDentro

  useEffect(() => {
    if (pausado || reducirMovimiento || items.length < 2 || intervaloMs <= 0) return
    const intervalo = window.setInterval(
      () => setActivo((actual) => (actual + 1) % items.length),
      intervaloMs,
    )
    return () => window.clearInterval(intervalo)
  }, [activo, intervaloMs, items.length, pausado, reducirMovimiento])

  if (items.length === 0) return null

  return (
    <section
      aria-label={etiqueta}
      onMouseEnter={() => setCursorDentro(true)}
      onMouseLeave={() => setCursorDentro(false)}
      onFocusCapture={() => setFocoDentro(true)}
      onBlurCapture={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setFocoDentro(false)
      }}
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="relative min-h-48 p-6 sm:p-8">
        {items.map((item, indice) => (
          <article
            key={`${item.titulo}-${indice}`}
            aria-hidden={activo !== indice}
            className={`transition-[opacity,transform] duration-500 motion-reduce:transition-none ${
              activo === indice
                ? 'relative translate-y-0 opacity-100'
                : 'pointer-events-none absolute inset-6 translate-y-3 opacity-0 sm:inset-8'
            }`}
          >
            <p className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Concepto HTML {indice + 1}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-balance">{item.titulo}</h3>
            <p className="mt-3 max-w-2xl text-sm text-pretty text-muted-foreground">
              {item.descripcion}
            </p>
          </article>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t px-4 py-3">
        <div className="flex flex-1 gap-2" aria-label="Progreso de diapositivas">
          {items.map((item, indice) => (
            <button
              key={`${item.titulo}-progreso`}
              type="button"
              aria-label={`Mostrar diapositiva ${indice + 1}: ${item.titulo}`}
              onClick={() => setActivo(indice)}
              className="h-2 flex-1 touch-manipulation overflow-hidden rounded-full bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                key={activo === indice ? `activo-${activo}` : `inactivo-${indice}`}
                className={`block h-full origin-left bg-amber-600 dark:bg-amber-400 ${
                  activo === indice && !reducirMovimiento ? 'animate-[catalogo-progreso_linear_forwards]' : ''
                }`}
                style={{
                  animationDuration: `${intervaloMs}ms`,
                  animationPlayState: pausado ? 'paused' : 'running',
                  transform: indice < activo ? 'scaleX(1)' : activo === indice ? undefined : 'scaleX(0)',
                }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={pausaManual ? 'Reanudar carrusel' : 'Pausar carrusel'}
          aria-pressed={pausaManual}
          onClick={() => setPausaManual((actual) => !actual)}
          className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-full transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {pausaManual ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
        </button>
      </div>
    </section>
  )
}
