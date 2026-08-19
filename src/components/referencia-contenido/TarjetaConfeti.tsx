import { useState, type CSSProperties } from 'react'
import { PartyPopper, RotateCw } from 'lucide-react'

export interface PropiedadesTarjetaConfeti {
  titulo: string
  descripcion: string
  etiquetaBoton?: string
  particulas?: number
}

const coloresConfeti = [
  'bg-blue-600 dark:bg-blue-400',
  'bg-amber-600 dark:bg-amber-400',
  'bg-violet-600 dark:bg-violet-400',
  'bg-teal-600 dark:bg-teal-400',
  'bg-green-600 dark:bg-green-400',
  'bg-red-600 dark:bg-red-400',
]

export function TarjetaConfeti({
  titulo,
  descripcion,
  etiquetaBoton = 'Celebrar de nuevo',
  particulas = 20,
}: PropiedadesTarjetaConfeti) {
  const [estallido, setEstallido] = useState(0)
  const cantidad = Math.min(36, Math.max(6, particulas))

  return (
    <article className="relative isolate overflow-hidden rounded-xl border border-green-600 bg-green-50 p-6 text-center shadow-sm dark:border-green-400 dark:bg-green-950/40">
      <div key={estallido} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 motion-reduce:hidden">
        {Array.from({ length: cantidad }, (_, indice) => {
          const angulo = (indice / cantidad) * Math.PI * 2
          const distancia = 80 + (indice % 5) * 12
          return (
            <span
              key={indice}
              className={`absolute top-1/2 left-1/2 h-2 w-1 animate-[catalogo-confeti_900ms_ease-out_both] ${coloresConfeti[indice % coloresConfeti.length]}`}
              style={{
                '--confeti-x': `${Math.cos(angulo) * distancia}px`,
                '--confeti-y': `${Math.sin(angulo) * distancia}px`,
                animationDelay: `${(indice % 4) * 35}ms`,
              } as CSSProperties}
            />
          )
        })}
      </div>
      <PartyPopper aria-hidden="true" className="mx-auto size-9 text-green-600 dark:text-green-400" />
      <h3 className="mt-4 text-xl font-semibold text-balance">{titulo}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-pretty text-muted-foreground">{descripcion}</p>
      <button
        type="button"
        onClick={() => setEstallido((actual) => actual + 1)}
        className="mx-auto mt-5 flex min-h-11 touch-manipulation items-center gap-2 rounded-full border border-green-600 bg-card px-4 py-2 text-sm font-semibold text-green-600 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none dark:border-green-400 dark:text-green-400"
      >
        <RotateCw aria-hidden="true" className="size-4" />
        {etiquetaBoton}
      </button>
    </article>
  )
}
