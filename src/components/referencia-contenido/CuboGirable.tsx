import { useState } from 'react'
import { RotateCw } from 'lucide-react'

export interface CaraCubo {
  titulo: string
  contenido: string
}

export interface PropiedadesCuboGirable {
  caras: CaraCubo[]
  etiqueta?: string
}

const transformaciones = [
  'rotateY(0deg) translateZ(72px)',
  'rotateY(90deg) translateZ(72px)',
  'rotateY(180deg) translateZ(72px)',
  'rotateY(-90deg) translateZ(72px)',
]

export function CuboGirable({ caras, etiqueta = 'Girar cubo' }: PropiedadesCuboGirable) {
  const carasVisibles = caras.slice(0, 4)
  const [giro, setGiro] = useState(0)
  const [interactuado, setInteractuado] = useState(false)

  if (carasVisibles.length < 4) return null
  const activa = ((giro % 4) + 4) % 4

  function girar() {
    setInteractuado(true)
    setGiro((actual) => actual + 1)
  }

  return (
    <section className="grid place-items-center gap-8 overflow-hidden rounded-xl border bg-muted/40 py-10 [perspective:700px]">
      <button
        type="button"
        aria-label={etiqueta}
        onClick={girar}
        className="relative size-36 touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-[18px] focus-visible:outline-ring"
      >
        <span
          className={`absolute inset-0 [transform-style:preserve-3d] transition-transform duration-700 motion-reduce:transition-none ${
            interactuado ? '' : 'animate-[catalogo-cubo_12s_linear_infinite] motion-reduce:animate-none'
          }`}
          style={interactuado ? { transform: `rotateX(-10deg) rotateY(${giro * -90}deg)` } : undefined}
        >
          {carasVisibles.map((cara, indice) => (
            <span
              key={`${cara.titulo}-${indice}`}
              className="absolute inset-0 flex flex-col items-center justify-center border border-violet-600 bg-violet-50/95 p-3 text-center shadow-lg [backface-visibility:hidden] dark:border-violet-400 dark:bg-violet-950/95"
              style={{ transform: transformaciones[indice] }}
            >
              <span className="text-sm font-bold">{cara.titulo}</span>
              <span className="mt-1 text-xs text-pretty text-muted-foreground">{cara.contenido}</span>
            </span>
          ))}
        </span>
      </button>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RotateCw aria-hidden="true" className="size-4 text-violet-600 dark:text-violet-400" />
        <span aria-live="polite">{interactuado ? carasVisibles[activa].titulo : 'Pulsa para controlar el giro'}</span>
      </div>
    </section>
  )
}
