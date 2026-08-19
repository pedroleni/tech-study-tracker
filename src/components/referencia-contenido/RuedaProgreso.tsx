import type { CSSProperties } from 'react'
import { Target } from 'lucide-react'

export interface PropiedadesRuedaProgreso {
  porcentaje: number
  etiqueta: string
  tamano?: number
}

export function RuedaProgreso({
  porcentaje,
  etiqueta,
  tamano = 176,
}: PropiedadesRuedaProgreso) {
  const valor = Math.min(100, Math.max(0, porcentaje))
  const radio = 52
  const circunferencia = 2 * Math.PI * radio
  const desplazamiento = circunferencia * (1 - valor / 100)

  return (
    <figure
      aria-label={`${etiqueta}: ${valor}%`}
      className="mx-auto grid w-fit place-items-center rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="relative" style={{ width: tamano, height: tamano }}>
        <svg viewBox="0 0 120 120" aria-hidden="true" className="size-full">
          <circle cx="60" cy="60" r={radio} fill="none" stroke="var(--muted)" strokeWidth="9" />
          <g className="[transform-box:fill-box] [transform-origin:center] -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radio}
              fill="none"
              stroke="var(--primary)"
              strokeLinecap="round"
              strokeWidth="9"
              strokeDasharray={circunferencia}
              strokeDashoffset={desplazamiento}
              className="animate-[catalogo-rueda_1s_ease-out_both] motion-reduce:animate-none"
              style={{
                '--rueda-inicio': circunferencia,
                '--rueda-final': desplazamiento,
              } as CSSProperties}
            />
          </g>
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center">
          <Target aria-hidden="true" className="mx-auto size-5 text-blue-600 dark:text-blue-400" />
          <p className="mt-1 text-3xl font-semibold tabular-nums">{valor}%</p>
        </div>
      </div>
      <figcaption className="mt-2 text-sm font-medium">{etiqueta}</figcaption>
    </figure>
  )
}
