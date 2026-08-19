import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ItemCoverflow {
  titulo: string
  descripcion: string
  codigo: string
}

export interface PropiedadesCarruselCoverflow {
  items: ItemCoverflow[]
  etiqueta?: string
}

export function CarruselCoverflow({
  items,
  etiqueta = 'Carrusel tridimensional',
}: PropiedadesCarruselCoverflow) {
  const [activo, setActivo] = useState(0)

  if (items.length === 0) return null

  function mover(direccion: number) {
    setActivo((actual) => (actual + direccion + items.length) % items.length)
  }

  return (
    <section aria-label={etiqueta} className="overflow-hidden rounded-xl border bg-muted/40 p-4 sm:p-6">
      <div className="relative h-64 [perspective:900px]">
        {items.map((item, indice) => {
          let distancia = indice - activo
          if (distancia > items.length / 2) distancia -= items.length
          if (distancia < -items.length / 2) distancia += items.length
          const visible = Math.abs(distancia) <= 2

          return (
            <button
              key={`${item.titulo}-${indice}`}
              type="button"
              aria-label={`Mostrar ${item.titulo}`}
              aria-current={distancia === 0 ? 'true' : undefined}
              tabIndex={visible ? 0 : -1}
              onClick={() => setActivo(indice)}
              className="absolute top-1/2 left-1/2 w-44 touch-manipulation rounded-xl border bg-card p-4 text-left shadow-lg transition-[transform,opacity] duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:w-56"
              style={{
                opacity: visible ? (distancia === 0 ? 1 : 0.68) : 0,
                pointerEvents: visible ? 'auto' : 'none',
                transform: `translate(-50%, -50%) translateX(${distancia * 58}%) rotateY(${distancia * -48}deg) scale(${distancia === 0 ? 1 : 0.78})`,
                transformStyle: 'preserve-3d',
                zIndex: 10 - Math.abs(distancia),
              }}
            >
              <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400" translate="no">
                {item.codigo}
              </span>
              <span className="mt-4 block font-semibold text-balance">{item.titulo}</span>
              <span className="mt-1 block text-xs text-pretty text-muted-foreground">
                {item.descripcion}
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Elemento anterior"
          onClick={() => mover(-1)}
          className="flex size-11 touch-manipulation items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <p aria-live="polite" className="min-w-28 text-center text-sm font-medium tabular-nums">
          {activo + 1} / {items.length}
        </p>
        <button
          type="button"
          aria-label="Elemento siguiente"
          onClick={() => mover(1)}
          className="flex size-11 touch-manipulation items-center justify-center rounded-full border bg-card transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>
    </section>
  )
}
