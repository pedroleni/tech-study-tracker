import { type KeyboardEvent, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type PropiedadesPestana<T extends string> = {
  id: T
  etiqueta: string
  icono?: ReactNode
  insignia?: number
  nombreAccesible?: string
}

type PropiedadesPestanas<T extends string> = {
  pestanas: PropiedadesPestana<T>[]
  activa: T
  alCambiar: (id: T) => void
  etiqueta: string
  idPestana: (id: T) => string
  idPanel: (id: T) => string
  className?: string
}

/**
 * Pestañas con teclado completo: flechas para moverse, Inicio y Fin para los
 * extremos, y un solo punto de entrada con el tabulador (tabIndex móvil).
 */
export function PestanasV1<T extends string>({
  pestanas,
  activa,
  alCambiar,
  etiqueta,
  idPestana,
  idPanel,
  className,
}: PropiedadesPestanas<T>) {
  const alTeclado = (evento: KeyboardEvent<HTMLButtonElement>, indice: number) => {
    const saltos: Record<string, number> = {
      ArrowRight: indice + 1,
      ArrowLeft: indice - 1,
      Home: 0,
      End: pestanas.length - 1,
    }
    const destino = saltos[evento.key]
    if (destino === undefined) return
    evento.preventDefault()
    const siguiente = pestanas[(destino + pestanas.length) % pestanas.length]
    alCambiar(siguiente.id)
    document.getElementById(idPestana(siguiente.id))?.focus()
  }

  return (
    <div role="tablist" aria-label={etiqueta} className={cn('flex min-w-0 overflow-x-auto', className)}>
      {pestanas.map((pestana, indice) => {
        const seleccionada = pestana.id === activa
        return (
          <button
            key={pestana.id}
            type="button"
            role="tab"
            id={idPestana(pestana.id)}
            aria-selected={seleccionada}
            aria-controls={seleccionada ? idPanel(pestana.id) : undefined}
            aria-label={pestana.nombreAccesible}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => alCambiar(pestana.id)}
            onKeyDown={(evento) => alTeclado(evento, indice)}
            className={cn(
              'flex min-h-11 shrink-0 touch-manipulation items-center gap-1.5 border-r px-3 py-2 font-mono text-xs whitespace-nowrap transition-colors',
              'focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring',
              seleccionada
                ? 'border-b-2 border-b-primary bg-background text-foreground'
                : 'border-b border-b-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            {pestana.icono}
            {pestana.etiqueta}
            {pestana.insignia ? (
              <span
                aria-hidden="true"
                className="rounded bg-destructive/20 px-1 text-[10px] leading-4 text-destructive"
              >
                {pestana.insignia}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
